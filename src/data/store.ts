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
import { isDoneOn, toggleHabit as toggleHabitOfDay } from '../domain/habits';
import { emptyDay, type Day, type Habit, type Profile } from '../domain/model';
import { isEmptyDay, normalizeDay } from '../domain/normalizeDay';
import { defaultProfile, normalizeProfile } from '../domain/profile';
import { assignReading, carryPositions, getPlan, isOwnPlan, markRead as markReadInPlan } from '../domain/readingPlan';
import { PROFILE_KEY, TagzeitenDB } from './db';
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

export class Store {
  readonly db: TagzeitenDB;
  private profile: Profile;
  private days = new Map<DateKey, Day>();
  /** Stable placeholders for days without entries (stable identity for React). */
  private blanks = new Map<DateKey, Day>();
  private listeners = new Set<Listener>();
  private version = 0;
  private readonly queue: WriteQueue<Day | Profile>;
  private readonly now: () => Date;
  private readonly seed: Partial<Profile>;
  private readonly journal: Journal;
  /** Documents changed in memory whose latest value is not yet in IndexedDB. */
  private dirty = new Map<string, Day | Profile>();

  constructor(opts: StoreOptions = {}) {
    this.db = opts.db ?? new TagzeitenDB();
    this.now = opts.now ?? (() => new Date());
    this.seed = opts.seedProfile ?? {};
    this.journal = opts.journal ?? localJournal;
    this.profile = defaultProfile(this.today());
    this.queue = new WriteQueue<Day | Profile>(
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
    this.profile = normalizeProfile(stored ?? { ...defaultProfile(today), ...this.seed }, today);
    if (!stored) await this.persist('profile', this.profile);
    const rows = await this.db.days.toArray();
    this.days.clear();
    for (const r of rows) {
      const d = normalizeDay(r);
      if (d) this.days.set(d.date, d);
    }
    await this.recoverJournal();
    this.emit();
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
        const p = normalizeProfile(value as Partial<Profile>, this.today());
        if (p.updatedAt > this.profile.updatedAt) {
          this.profile = p;
          await this.persist(key, p);
        }
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

  today(): DateKey {
    return currentTodayKey(this.now());
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
    const next = { ...fn(this.profile), updatedAt: this.now().getTime() };
    this.profile = next;
    this.schedule('profile', next, opts.immediate);
    this.emit();
    return next;
  }

  private schedule(key: string, value: Day | Profile, immediate?: boolean) {
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
    return toMarkdown(this.allDays(), this.profile.habits, this.now());
  }

  /** Replaces all data with the content of a backup file. */
  async importBackup(json: string): Promise<{ days: number }> {
    const { profile, days } = parseBackup(json, this.today());
    await this.queue.cancelAll();
    this.dirty.clear();
    this.journal.clear();
    await this.db.transaction('rw', this.db.profile, this.db.days, async () => {
      await this.db.days.clear();
      await this.db.profile.clear();
      await this.db.profile.put({ ...profile, id: PROFILE_KEY });
      await this.db.days.bulkPut(days);
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
    await this.db.transaction('rw', this.db.profile, this.db.days, async () => {
      await this.db.days.clear();
      await this.db.profile.clear();
    });
    this.days.clear();
    this.blanks.clear();
    this.profile = defaultProfile(this.today());
    this.emit();
  }

  /* ------------------------------------------------------------ persistence */

  private async persist(key: string, value: Day | Profile): Promise<void> {
    if (key === 'profile') {
      await this.db.profile.put({ ...(value as Profile), id: PROFILE_KEY });
    } else {
      const day = value as Day;
      if (isEmptyDay(day)) await this.db.days.delete(day.date);
      else await this.db.days.put(day);
    }
    // Only the latest value clears the flag; a newer one may be waiting.
    if (this.dirty.get(key) === value) this.dirty.delete(key);
  }
}
