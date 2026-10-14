/**
 * The app's single source of state. Holds profile and all days in memory,
 * notifies subscribers (React via useSyncExternalStore) and persists every
 * change through the write queue into IndexedDB.
 *
 * All reads and writes of the UI go through this module (and data/hooks).
 */
import { READING_HABIT } from '../content/habits';
import { addDays, todayKey as currentTodayKey, type DateKey } from '../domain/dates';
import { createBackup, parseBackup, type Backup } from '../domain/backup';
import { toMarkdown } from '../domain/exportMarkdown';
import { winterArcToMarkdown } from '../domain/winterArcMarkdown';
import { addOwn, adopt, choose, chooseOwn, fromRound, relink, removeOwn, startDesert } from '../domain/desert';
import type { DesertHabit } from '../content/desert';
import { isDoneOn, newHabitId, toggleHabit as toggleHabitOfDay } from '../domain/habits';
import { isEmptyEntry, newEntry, nextMeeting, normalizeArena } from '../domain/arena';
import { emptyDay, type ArenaEntry, type Day, type Habit, type Profile } from '../domain/model';
import {
  endRun,
  normalizeWinterArc,
  setReview,
  startRun,
  type WinterArcPoint,
  type WinterArcReview,
  type WinterArcData,
  type WinterArcDay,
  type WinterArcMonth,
  type WinterArcRun,
  type WinterArcWeek,
} from '../domain/winterArc';
import { isEmptyDay, normalizeDay } from '../domain/normalizeDay';
import { defaultProfile, normalizeProfile } from '../domain/profile';
import { assignReading, carryPositions, getPlan, isOwnPlan, markRead as markReadInPlan } from '../domain/readingPlan';
import { PROFILE_KEY, TagzeitenDB, type StoredProfile } from './db';
import { localJournal, type Journal } from './journal';
import { WriteQueue } from './writeQueue';

export type SaveError = { kind: 'save'; key: string; error: unknown };
type Listener = () => void;

export interface StoreOptions {
  db?: TagzeitenDB;
  /** Debounce for text input, in ms. */
  debounceMs?: number;
  /** Injected clock for tests. */
  now?: () => Date;
  onError?: (e: SaveError) => void;
  /** Values for a profile created on first start (e.g. the theme chosen before). */
  seedProfile?: Partial<Profile>;
  /** Synchronous stash for unsaved changes when the page is hidden. */
  journal?: Journal;
}

export interface UpdateOptions {
  /** Write now instead of after the debounce (toggles, buttons). */
  immediate?: boolean;
}

const DAY_PREFIX = 'day:';
const ARENA_PREFIX = 'arena:';

/**
 * The Winter Arc is stored row by row in four tables, like the Arena: a key
 * prefix per table, and a key per row ("runId|date" and so on).
 */
type WaKind = keyof WinterArcData;
type WaRow = WinterArcRun | WinterArcDay | WinterArcWeek | WinterArcMonth;
const WA_KINDS: readonly WaKind[] = ['runs', 'days', 'weeks', 'months'];
const WA_PREFIX: Record<WaKind, string> = { runs: 'wa-run:', days: 'wa-day:', weeks: 'wa-week:', months: 'wa-month:' };
const waRowKey = (kind: WaKind, r: WaRow): string => {
  if (kind === 'runs') return (r as WinterArcRun).id;
  if (kind === 'days') return `${(r as WinterArcDay).runId}|${(r as WinterArcDay).date}`;
  if (kind === 'weeks') return `${(r as WinterArcWeek).runId}|${(r as WinterArcWeek).week}`;
  return `${(r as WinterArcMonth).runId}|${(r as WinterArcMonth).month}`;
};
const waKindOf = (key: string): WaKind | undefined => WA_KINDS.find((k) => key.startsWith(WA_PREFIX[k]));

/** What the write queue stores: a day, the profile (without the Arena and the Winter Arc), an entry or row of those, or null for a deleted one. */
type Doc = Day | ProfileDoc | ArenaEntry | WaRow | null;
type ProfileDoc = Omit<Profile, 'arena' | 'winterArc'>;

const withoutArena = ({ arena: _, winterArc: __, ...rest }: Profile): ProfileDoc => rest;

/** Whether anything besides the Arena, the Winter Arc (and the time stamp) changed. */
const profileChanged = (a: Profile, b: Profile) =>
  (Object.keys(b) as (keyof Profile)[]).some(
    (k) => k !== 'arena' && k !== 'winterArc' && k !== 'updatedAt' && a[k] !== b[k],
  ) || Object.keys(a).length !== Object.keys(b).length;

export class Store {
  readonly db: TagzeitenDB;
  private profile: Profile;
  private days = new Map<DateKey, Day>();
  /** Stable placeholders for days without entries (stable identity for React). */
  private blanks = new Map<DateKey, Day>();
  private listeners = new Set<Listener>();
  private version = 0;
  private readonly queue: WriteQueue<Doc>;
  private readonly now: () => Date;
  private readonly seed: Partial<Profile>;
  private readonly journal: Journal;
  /** Documents changed in memory whose latest value is not yet in IndexedDB. */
  private dirty = new Map<string, Doc>();
  /** The day the views were last drawn for; see checkDayChange. */
  private shownDay: DateKey;

  constructor(opts: StoreOptions = {}) {
    this.db = opts.db ?? new TagzeitenDB();
    this.now = opts.now ?? (() => new Date());
    this.seed = opts.seedProfile ?? {};
    this.journal = opts.journal ?? localJournal;
    this.profile = defaultProfile(this.today());
    this.shownDay = this.today();
    this.queue = new WriteQueue<Doc>(
      (key, value) => this.persist(key, value),
      opts.debounceMs ?? 500,
      (key, error) => opts.onError?.({ kind: 'save', key, error }),
    );
  }

  /* ------------------------------------------------------------ lifecycle */

  private loading: Promise<void> | null = null;

  /** Loads everything once; later calls return the same promise. */
  load(): Promise<void> {
    this.loading ??= this.doLoad();
    return this.loading;
  }

  private async doLoad(): Promise<void> {
    const today = this.today();
    const stored = await this.db.profile.get(PROFILE_KEY);
    const arena = await this.db.arena.toArray();
    const winterArc = await this.loadWinterArc();
    this.profile = stored
      ? normalizeProfile({ ...(stored as Omit<StoredProfile, 'arena'>), arena, winterArc }, today)
      : normalizeProfile({ ...defaultProfile(today), ...this.seed }, today);
    if (!stored) await this.persist('profile', withoutArena(this.profile));
    const rows = await this.db.days.toArray();
    this.days.clear();
    for (const r of rows) {
      const d = normalizeDay(r);
      if (d) this.days.set(d.date, d);
    }
    await this.recoverJournal();
    // Today's unread portion follows the plan, e.g. after the alternation became one chapter a day.
    const reading = this.days.get(today)?.reading;
    if (reading && !reading.done && reading.planId !== this.profile.plan.planId) this.followToday();
    this.roundToDesert();
    this.relinkDesert();
    this.emit();
  }

  /** A round of the Streithalle still under way becomes a Wüstenzeit (0.39), its ticks copied into the days. */
  private roundToDesert(): void {
    this.convert(fromRound(this.profile, this.today(), this.now().getTime()));
  }

  /** Habits of the Wüstenzeit that Henoch already had become Henoch's (0.40), their ticks copied. */
  private relinkDesert(): void {
    this.convert(relink(this.profile, [...this.days.values()], this.now().getTime()));
  }

  private convert(conv: { profile: Profile; ticks: { date: DateKey; id: string }[] } | undefined): void {
    if (!conv) return;
    this.updateProfile(() => conv.profile, { immediate: true });
    const byDate = new Map<DateKey, string[]>();
    for (const t of conv.ticks) byDate.set(t.date, [...(byDate.get(t.date) ?? []), t.id]);
    for (const [date, ids] of byDate) {
      this.updateDay(date, (d) => ({ ...d, habits: { ...d.habits, ...Object.fromEntries(ids.map((id) => [id, true])) } }), {
        immediate: true,
      });
    }
  }

  private async loadWinterArc(): Promise<WinterArcData> {
    return {
      runs: await this.db.winterArcRuns.toArray(),
      days: await this.db.winterArcDays.toArray(),
      weeks: await this.db.winterArcWeeks.toArray(),
      months: await this.db.winterArcMonths.toArray(),
    };
  }

  /** Writes everything pending into IndexedDB. */
  async flush(): Promise<void> {
    await this.queue.flush();
    if (this.dirty.size === 0) this.journal.clear();
  }

  /**
   * Call when the page is hidden: stashes unsaved changes synchronously,
   * then starts writing them to IndexedDB.
   */
  suspend(): Promise<void> {
    this.journal.save([...this.dirty.entries()]);
    return this.flush();
  }

  /** Applies stashed changes that are newer than what IndexedDB holds. */
  private async recoverJournal(): Promise<void> {
    const entries = this.journal.load();
    if (entries.length === 0) return;
    for (const [key, value] of entries) {
      if (key === 'profile') {
        const p = normalizeProfile(
          { ...(value as Partial<Profile>), arena: this.profile.arena, winterArc: this.profile.winterArc },
          this.today(),
        );
        if (p.updatedAt > this.profile.updatedAt) {
          this.profile = p;
          await this.persist(key, withoutArena(p));
        }
      } else if (key.startsWith(ARENA_PREFIX)) {
        await this.recoverArenaEntry(key.slice(ARENA_PREFIX.length), value);
      } else if (waKindOf(key)) {
        await this.recoverWinterArcRow(key, value);
      } else if (key.startsWith(DAY_PREFIX)) {
        const d = normalizeDay(value);
        if (d && d.updatedAt > (this.days.get(d.date)?.updatedAt ?? -1)) {
          this.days.set(d.date, d);
          await this.persist(key, d);
        }
      }
    }
    this.journal.clear();
  }

  /** An Arena entry from the journal: newer than the stored one, or deleted since. */
  private async recoverArenaEntry(id: string, value: unknown): Promise<void> {
    const current = this.profile.arena.find((e) => e.id === id);
    const [entry] = value === null ? [] : normalizeArena([value]);
    if (value === null) {
      if (!current) return;
    } else if (!entry || entry.updatedAt <= (current?.updatedAt ?? -1)) return;
    const others = this.profile.arena.filter((e) => e.id !== id);
    this.profile = { ...this.profile, arena: normalizeArena(entry ? [entry, ...others] : others) };
    await this.persist(ARENA_PREFIX + id, entry ?? null);
  }

  /** A Winter Arc row from the journal, if newer than the stored one. */
  private async recoverWinterArcRow(key: string, value: unknown): Promise<void> {
    const kind = waKindOf(key)!;
    if (value === null) return;
    const rowKey = key.slice(WA_PREFIX[kind].length);
    const list = this.profile.winterArc[kind] as WaRow[];
    const current = list.find((r) => waRowKey(kind, r) === rowKey);
    const merged = normalizeWinterArc({
      ...this.profile.winterArc,
      [kind]: [...list.filter((r) => r !== current), value],
    } as WinterArcData);
    const row = (merged[kind] as WaRow[]).find((r) => waRowKey(kind, r) === rowKey);
    if (!row || row.updatedAt <= (current?.updatedAt ?? -1)) return;
    this.profile = { ...this.profile, winterArc: merged };
    await this.persist(key, row);
  }

  get hasPendingWrites(): boolean {
    return this.queue.pending;
  }

  /* ------------------------------------------------------------ subscription */

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  /** Changes on every update; lets hooks detect changes cheaply. */
  getVersion = (): number => this.version;

  private emit() {
    this.version++;
    for (const l of this.listeners) l();
  }

  /* ------------------------------------------------------------ reads */

  /** The current moment, from the store's clock (set in tests). */
  currentTime(): Date {
    return this.now();
  }

  today(): DateKey {
    return currentTodayKey(this.now());
  }

  /** The day the views are drawn for; it changes with checkDayChange, so views can follow it. */
  getShownDay = (): DateKey => this.shownDay;

  /**
   * Redraws the views when a new day has begun while the app stayed open (e.g.
   * left open in the evening, brought back in the morning). Otherwise "Heute"
   * would still show yesterday, and a tap would be entered for yesterday.
   */
  checkDayChange(): boolean {
    const today = this.today();
    if (today === this.shownDay) return false;
    this.shownDay = today;
    this.emit();
    return true;
  }

  getProfile(): Profile {
    return this.profile;
  }

  /** The stored day, or a fresh empty one (not persisted until changed). */
  getDay(date: DateKey): Day {
    const d = this.days.get(date);
    if (d) return d;
    let blank = this.blanks.get(date);
    if (!blank) {
      blank = emptyDay(date);
      this.blanks.set(date, blank);
    }
    return blank;
  }

  findDay(date: DateKey): Day | undefined {
    return this.days.get(date);
  }

  /** All stored days, newest first. */
  allDays(): Day[] {
    return [...this.days.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  lookup = (date: DateKey): Day | undefined => this.days.get(date);

  /* ------------------------------------------------------------ writes */

  updateDay(date: DateKey, fn: (d: Day) => Day, opts: UpdateOptions = {}): Day {
    const next = { ...fn(this.getDay(date)), date, updatedAt: this.now().getTime() };
    this.days.set(date, next);
    this.schedule(DAY_PREFIX + date, next, opts.immediate);
    this.emit();
    return next;
  }

  updateProfile(fn: (p: Profile) => Profile, opts: UpdateOptions = {}): Profile {
    const prev = this.profile;
    const next = { ...fn(prev), updatedAt: this.now().getTime() };
    this.profile = next;
    // The Arena is stored entry by entry: only what changed is written.
    if (next.arena !== prev.arena) {
      const before = new Map(prev.arena.map((e) => [e.id, e]));
      for (const e of next.arena) if (before.get(e.id) !== e) this.schedule(ARENA_PREFIX + e.id, e, opts.immediate);
      const kept = new Set(next.arena.map((e) => e.id));
      for (const id of before.keys()) if (!kept.has(id)) this.schedule(ARENA_PREFIX + id, null, opts.immediate);
    }
    if (next.winterArc !== prev.winterArc) {
      for (const kind of WA_KINDS) {
        const before = new Map((prev.winterArc[kind] as WaRow[]).map((r) => [waRowKey(kind, r), r]));
        for (const r of next.winterArc[kind] as WaRow[]) {
          const k = waRowKey(kind, r);
          if (before.get(k) !== r) this.schedule(WA_PREFIX[kind] + k, r, opts.immediate);
          before.delete(k);
        }
        for (const k of before.keys()) this.schedule(WA_PREFIX[kind] + k, null, opts.immediate);
      }
    }
    if (profileChanged(prev, next)) this.schedule('profile', withoutArena(next), opts.immediate);
    this.emit();
    return next;
  }

  /* ------------------------------------------------------------ arena */

  /** Starts a new Arena entry (or one for the Eisenschmiede) and returns its id. Entries left empty are cleared away. */
  addArenaEntry(kind?: 'forge'): string {
    const entry = newEntry(this.now().getTime(), kind);
    // A new concern for the brothers belongs to the next meeting already planned.
    const meeting = kind === 'forge' ? nextMeeting(this.profile.arena, this.today()) : undefined;
    if (meeting) entry.meetingDate = meeting;
    this.updateProfile((p) => ({ ...p, arena: [entry, ...p.arena.filter((e) => !isEmptyEntry(e))] }), {
      immediate: true,
    });
    return entry.id;
  }

  updateArenaEntry(id: string, fn: (e: ArenaEntry) => ArenaEntry, opts: UpdateOptions = {}): void {
    const t = this.now().getTime();
    this.updateProfile((p) => ({ ...p, arena: p.arena.map((e) => (e.id === id ? { ...fn(e), id, updatedAt: t } : e)) }), opts);
  }

  /** Puts an entry into the Rückblick, or brings it back into the Arena. */
  archiveArenaEntry(id: string, archived: boolean): void {
    const t = this.now().getTime();
    this.updateProfile(
      (p) => ({
        ...p,
        arena: p.arena.map((e) => {
          if (e.id !== id) return e;
          const { archivedAt: _, ...rest } = e;
          return archived ? { ...rest, archivedAt: t } : rest;
        }),
      }),
      { immediate: true },
    );
  }

  deleteArenaEntry(id: string): void {
    this.updateProfile((p) => ({ ...p, arena: p.arena.filter((e) => e.id !== id) }), { immediate: true });
  }

  /* ------------------------------------------------------------ winter arc */

  /**
   * Begins a new round of the Winter Arc with its standard (the plan's when none
   * is given); a round under way is ended, nothing is deleted.
   */
  startWinterArc(startDate: DateKey, durationDays: number, name = '', points?: readonly WinterArcPoint[]): void {
    const t = this.now().getTime();
    this.updateProfile(
      (p) => ({ ...p, winterArc: startRun(p.winterArc, startDate, durationDays, t, undefined, name, points) }),
      { immediate: true },
    );
  }

  /** Begins a Wüstenzeit with the habits chosen; a round under way is ended, nothing is deleted. */
  startDesert(startDate: DateKey, durationDays: number, habits: readonly string[] = [], name = ''): void {
    const t = this.now().getTime();
    this.updateProfile((p) => ({ ...p, winterArc: startDesert(p.winterArc, startDate, durationDays, t, habits, undefined, name) }), {
      immediate: true,
    });
  }

  /** "Diesmal nicht": the invitation leaves "Heute" and stays in the Arena. */
  declineSeason(key: string): void {
    this.updateProfile((p) => ({ ...p, seasonsDeclined: [...new Set([...(p.seasonsDeclined ?? []), key])] }), { immediate: true });
  }

  /** Takes habits of the offer into the Wüstenzeit, or out of it. */
  chooseDesert(runId: string, offers: readonly DesertHabit[], on: boolean): void {
    const t = this.now().getTime();
    this.updateProfile((p) => choose(p, runId, offers, on, t), { immediate: true });
  }

  /** Takes one of the user's own habits into the Wüstenzeit, or out of it. */
  chooseOwnDesert(runId: string, id: string, on: boolean): void {
    const t = this.now().getTime();
    this.updateProfile((p) => chooseOwn(p, runId, id, on, t), { immediate: true });
  }

  /** A habit of the user's own for the Wüstenzeit, chosen at once. */
  addOwnDesert(runId: string, input: { name: string; note?: string; rhythm: Habit['rhythm'] }): void {
    const t = this.now().getTime();
    this.updateProfile((p) => addOwn(p, runId, input, newHabitId(t), t), { immediate: true });
  }

  /** Deletes one of the user's own habits of the Wüstenzeit. */
  deleteOwnDesert(id: string): void {
    const t = this.now().getTime();
    this.updateProfile((p) => removeOwn(p, id, t), { immediate: true });
  }

  /** Takes habits of the Wüstenzeit into everyday life. */
  adoptHabits(ids: readonly string[]): void {
    this.updateProfile((p) => adopt(p, ids), { immediate: true });
  }

  /** Switches the Winter Arc off: the round is marked as ended, its entries stay. */
  endWinterArc(): void {
    const t = this.now().getTime();
    this.updateProfile((p) => ({ ...p, winterArc: endRun(p.winterArc, t) }), { immediate: true });
  }

  /** A line of the weekly review; saved as you type. */
  setWinterArcReview(runId: string, week: number, key: keyof WinterArcReview, text: string): void {
    const t = this.now().getTime();
    this.updateProfile((p) => ({ ...p, winterArc: setReview(p.winterArc, runId, week, key, text, t) }));
  }

  private schedule(key: string, value: Doc, immediate?: boolean) {
    this.dirty.set(key, value);
    this.queue.schedule(key, value, immediate);
  }

  /* ------------------------------------------------------------ reading plan */

  /**
   * The reading of a day. Today receives the next portion when first opened
   * and keeps it. Past days without a reading show the current position
   * without assigning it (nothing is "owed" for them).
   */
  readingFor(date: DateKey): { reading: NonNullable<Day['reading']>; assigned: boolean } {
    const day = this.days.get(date);
    const plan = getPlan(this.profile.plan.planId);
    if (day?.reading) return { reading: day.reading, assigned: true };
    return { reading: assignReading(plan, this.profile.plan.positions), assigned: false };
  }

  /** Assigns today's portion if it has none yet. */
  ensureTodayReading(): void {
    const date = this.today();
    if (this.days.get(date)?.reading) return;
    const plan = getPlan(this.profile.plan.planId);
    const reading = assignReading(plan, this.profile.plan.positions);
    this.updateDay(date, (d) => ({ ...d, reading }), { immediate: true });
  }

  /** Toggles a habit for a day. The reading habit marks the portion read and moves the plan. */
  toggleHabit(date: DateKey, habit: Habit): void {
    if (habit.id === READING_HABIT) {
      this.setReadingDone(date, !isDoneOn(habit, this.days.get(date)));
      return;
    }
    this.updateDay(date, (d) => toggleHabitOfDay(d, habit), { immediate: true });
  }

  /** Marks a day's reading as read or unread and moves the plan accordingly. */
  setReadingDone(date: DateKey, done: boolean): void {
    const { reading } = this.readingFor(date);
    if (reading.planId !== this.profile.plan.planId) {
      // A reading from an earlier plan: the day is marked, the current plan stays where it is.
      this.updateDay(date, (d) => ({ ...d, reading: { ...reading, done } }), { immediate: true });
      return;
    }
    const plan = getPlan(reading.planId);
    const res = markReadInPlan(plan, reading, this.profile.plan.positions, done);
    this.updateDay(date, (d) => ({ ...d, reading: res.reading }), { immediate: true });
    this.updateProfile((p) => ({ ...p, plan: { ...p.plan, positions: { ...p.plan.positions, ...res.positions } } }), {
      immediate: true,
    });
  }

  /**
   * Chooses the reading plan: the fixed one (Old and New Testament) or one of
   * one's own, or other amounts a day. The place in the Bible is carried over
   * (or set by `starts`, per track); today's reading follows, unless it was
   * already read.
   */
  setPlan(planId: string, starts: Record<string, number> = {}): void {
    const to = getPlan(planId);
    const current = this.profile.plan;
    if (to.def.id === current.planId && Object.keys(starts).length === 0) return;
    // Coming back to a plan of one's own with another amount: start where the last one stood.
    const from = getPlan(isOwnPlan(current.planId) || !current.own ? current.planId : current.own);
    const positions = { ...carryPositions(from, to, current.positions), ...starts };
    this.updateProfile(
      (p) => ({
        ...p,
        plan: { ...p.plan, planId: to.def.id, positions, ...(isOwnPlan(to.def.id) ? { own: to.def.id } : { fixed: to.def.id }) },
      }),
      { immediate: true },
    );
    this.followToday();
  }

  /**
   * Sets the plan position. Today's reading follows, unless it was already read.
   */
  setPlanPositions(positions: Record<string, number>): void {
    this.updateProfile((p) => ({ ...p, plan: { ...p.plan, positions: { ...p.plan.positions, ...positions } } }), {
      immediate: true,
    });
    this.followToday();
  }

  /** Today's reading follows the plan, unless it was already read. */
  private followToday(): void {
    const today = this.days.get(this.today());
    if (today?.reading && !today.reading.done) {
      const plan = getPlan(this.profile.plan.planId);
      this.updateDay(today.date, (d) => ({ ...d, reading: assignReading(plan, this.profile.plan.positions) }), {
        immediate: true,
      });
    }
  }

  /** Yesterday relative to `date`, if stored. */
  dayBefore(date: DateKey): Day | undefined {
    return this.days.get(addDays(date, -1));
  }

  /* ------------------------------------------------------------ export, import, delete */

  async exportBackup(): Promise<Backup> {
    await this.flush();
    const days = this.allDays().filter((d) => !isEmptyDay(d));
    return createBackup(this.profile, days, this.now());
  }

  async exportMarkdown(): Promise<string> {
    await this.flush();
    return toMarkdown(
      this.allDays(),
      this.profile.habits,
      this.now(),
      this.profile.arena,
      this.profile.answered,
      winterArcToMarkdown(this.profile.winterArc, this.profile.winterArcSettings),
    );
  }

  /** Replaces all data with the content of a backup file. */
  async importBackup(json: string): Promise<{ days: number }> {
    const { profile, days } = parseBackup(json, this.today());
    await this.queue.cancelAll();
    this.dirty.clear();
    this.journal.clear();
    await this.db.transaction('rw', [this.db.profile, this.db.days, this.db.arena, ...this.waTables()], async () => {
      await this.db.days.clear();
      await this.db.profile.clear();
      await this.db.arena.clear();
      await this.db.profile.put({ ...withoutArena(profile), id: PROFILE_KEY });
      await this.db.days.bulkPut(days);
      await this.db.arena.bulkPut(profile.arena);
      for (const t of this.waTables()) await t.clear();
      await this.db.winterArcRuns.bulkPut(profile.winterArc.runs);
      await this.db.winterArcDays.bulkPut(profile.winterArc.days);
      await this.db.winterArcWeeks.bulkPut(profile.winterArc.weeks);
      await this.db.winterArcMonths.bulkPut(profile.winterArc.months);
    });
    this.profile = profile;
    this.days = new Map(days.map((d) => [d.date, d]));
    this.blanks.clear();
    this.emit();
    return { days: days.length };
  }

  /** Deletes every entry and the profile. The app starts over afterwards. */
  async deleteAll(): Promise<void> {
    await this.queue.cancelAll();
    this.dirty.clear();
    this.journal.clear();
    await this.db.transaction('rw', [this.db.profile, this.db.days, this.db.arena, ...this.waTables()], async () => {
      await this.db.days.clear();
      await this.db.profile.clear();
      await this.db.arena.clear();
      for (const t of this.waTables()) await t.clear();
    });
    this.days.clear();
    this.blanks.clear();
    this.profile = defaultProfile(this.today());
    this.emit();
  }

  /* ------------------------------------------------------------ persistence */

  private waTables() {
    return [this.db.winterArcRuns, this.db.winterArcDays, this.db.winterArcWeeks, this.db.winterArcMonths];
  }

  private async persistWinterArc(kind: WaKind, rowKey: string, row: WaRow | null): Promise<void> {
    const [a, b] = rowKey.split('|') as [string, string];
    if (kind === 'runs') {
      if (row) await this.db.winterArcRuns.put(row as WinterArcRun);
      else await this.db.winterArcRuns.delete(a);
    } else if (kind === 'days') {
      if (row) await this.db.winterArcDays.put(row as WinterArcDay);
      else await this.db.winterArcDays.delete([a, b]);
    } else if (kind === 'weeks') {
      if (row) await this.db.winterArcWeeks.put(row as WinterArcWeek);
      else await this.db.winterArcWeeks.delete([a, Number(b)]);
    } else {
      if (row) await this.db.winterArcMonths.put(row as WinterArcMonth);
      else await this.db.winterArcMonths.delete([a, b]);
    }
  }

  private async persist(key: string, value: Doc): Promise<void> {
    const kind = waKindOf(key);
    if (kind) {
      await this.persistWinterArc(kind, key.slice(WA_PREFIX[kind].length), value as WaRow | null);
    } else if (key === 'profile') {
      await this.db.profile.put({ ...(value as ProfileDoc), id: PROFILE_KEY });
    } else if (key.startsWith(ARENA_PREFIX)) {
      // Entries left empty are not kept, as before.
      const entry = value as ArenaEntry | null;
      if (!entry || isEmptyEntry(entry)) await this.db.arena.delete(key.slice(ARENA_PREFIX.length));
      else await this.db.arena.put(entry);
    } else {
      const day = value as Day;
      if (isEmptyDay(day)) await this.db.days.delete(day.date);
      else await this.db.days.put(day);
    }
    // Only the latest value clears the flag; a newer one may be waiting.
    if (this.dirty.get(key) === value) this.dirty.delete(key);
  }
}
