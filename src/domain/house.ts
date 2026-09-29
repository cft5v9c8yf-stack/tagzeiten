/**
 * "Mein Haus": wife and children, prayed for by name in the morning, with one
 * of them in the centre each day, and blessed at night.
 */
import { fromKey, weekdayOf, type DateKey } from './dates';

export type ChildSex = 'son' | 'daughter';

export interface HousePerson {
  name: string;
  /** What is on the heart for this person now; one line, changed at any time. */
  concern: string;
}

export interface HouseChild extends HousePerson {
  id: string;
  /** Required: the prayer on the child's day depends on it. */
  sex?: ChildSex;
}

export interface House {
  wife: HousePerson;
  children: HouseChild[];
}

export type HouseRole = 'wife' | ChildSex | 'child';

/** A concern marked as answered: kept in the Rückblick under "Gebetserhörungen". */
export interface AnsweredPrayer {
  id: string;
  date: DateKey;
  person: string;
  role: HouseRole;
  concern: string;
}

export const ROLE_LABEL: Record<HouseRole, string> = { wife: 'Ehefrau', son: 'Sohn', daughter: 'Tochter', child: 'Kind' };

/** Four children fields by default; more can be added. */
export const DEFAULT_CHILD_FIELDS = 4;

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyChild = (id = newId()): HouseChild => ({ id, name: '', concern: '' });

export const emptyHouse = (): House => ({
  wife: { name: '', concern: '' },
  children: Array.from({ length: DEFAULT_CHILD_FIELDS }, () => emptyChild()),
});

const str = (v: unknown) => (typeof v === 'string' ? v : '');

export function normalizeHouse(raw: unknown): House {
  if (!raw || typeof raw !== 'object') return emptyHouse();
  const r = raw as Partial<House>;
  const wife = r.wife && typeof r.wife === 'object' ? r.wife : { name: '', concern: '' };
  const seen = new Set<string>();
  const children: HouseChild[] = [];
  for (const c of Array.isArray(r.children) ? r.children : []) {
    if (!c || typeof c !== 'object') continue;
    let id = str(c.id);
    if (!id || seen.has(id)) id = newId();
    seen.add(id);
    const child: HouseChild = { id, name: str(c.name), concern: str(c.concern) };
    if (c.sex === 'son' || c.sex === 'daughter') child.sex = c.sex;
    children.push(child);
  }
  return { wife: { name: str(wife.name), concern: str(wife.concern) }, children };
}

export function normalizeAnswered(raw: unknown): AnsweredPrayer[] {
  if (!Array.isArray(raw)) return [];
  const roles: HouseRole[] = ['wife', 'son', 'daughter', 'child'];
  return raw
    .filter((a): a is AnsweredPrayer => !!a && typeof a === 'object')
    .filter((a) => typeof a.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str(a.date)) && str(a.concern).trim() !== '')
    .map((a) => ({
      id: a.id,
      date: a.date,
      person: str(a.person),
      role: roles.includes(a.role) ? a.role : 'child',
      concern: a.concern,
    }));
}

/** Answered prayers, newest first. */
export const answeredNewestFirst = (list: readonly AnsweredPrayer[]) =>
  [...list].sort((a, b) => (a.date === b.date ? (a.id < b.id ? 1 : -1) : a.date < b.date ? 1 : -1));

/** The wife, if a name is entered. */
export const wifeOf = (h: House): HousePerson | undefined => (h.wife.name.trim() ? h.wife : undefined);

/** Children with a name, in the order set in "Mein Haus". */
export const childrenOf = (h: House): HouseChild[] => h.children.filter((c) => c.name.trim());

export const hasHouse = (h: House) => !!wifeOf(h) || childrenOf(h).length > 0;

/** "Anna", "Anna und Paul", "Anna, Paul und Marie". */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} und ${names.at(-1)}`;
}

export type Focus =
  | { kind: 'wife'; person: HousePerson }
  | { kind: 'child'; person: HouseChild }
  | { kind: 'marriage' }
  | { kind: 'house' };

/** Weeks since a Monday long ago: lets the children rotate across the weeks. */
const weekNumber = (date: DateKey) => {
  const d = fromKey(date);
  const days = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1970, 0, 5)) / 86_400_000);
  return Math.floor(days / 7);
};

/**
 * Who stands in the centre on a day: Monday the wife, Tuesday to Friday one
 * child each (with four children always the same; with more or fewer the
 * order runs on across the weeks), Saturday the marriage, Sunday the whole
 * house. A day without the fitting person belongs to the whole house.
 */
export function focusOf(h: House, date: DateKey): Focus {
  const wd = weekdayOf(date);
  const wife = wifeOf(h);
  const children = childrenOf(h);
  if (wd === 1) return wife ? { kind: 'wife', person: wife } : { kind: 'house' };
  if (wd >= 2 && wd <= 5) {
    if (!children.length) return { kind: 'house' };
    const slot = weekNumber(date) * 4 + (wd - 2);
    return { kind: 'child', person: children[slot % children.length]! };
  }
  if (wd === 6) return wife ? { kind: 'marriage' } : { kind: 'house' };
  return { kind: 'house' };
}

/** "Heute im Mittelpunkt: …" */
export function focusName(f: Focus): string {
  if (f.kind === 'wife' || f.kind === 'child') return f.person.name.trim();
  return f.kind === 'marriage' ? 'unsere Ehe' : 'das ganze Haus';
}

export const roleOf = (h: House, id: 'wife' | string): HouseRole => {
  if (id === 'wife') return 'wife';
  return h.children.find((c) => c.id === id)?.sex ?? 'child';
};

/**
 * Marks a person's concern as answered: it goes into the Rückblick with date,
 * person and concern, and the field is emptied.
 */
export function answerConcern(
  h: House,
  answered: readonly AnsweredPrayer[],
  who: 'wife' | string,
  date: DateKey,
  id = newId(),
): { house: House; answered: AnsweredPrayer[] } {
  const person = who === 'wife' ? h.wife : h.children.find((c) => c.id === who);
  if (!person || !person.concern.trim()) return { house: h, answered: [...answered] };
  const entry: AnsweredPrayer = {
    id,
    date,
    person: person.name.trim(),
    role: roleOf(h, who),
    concern: person.concern.trim(),
  };
  const house: House =
    who === 'wife'
      ? { ...h, wife: { ...h.wife, concern: '' } }
      : { ...h, children: h.children.map((c) => (c.id === who ? { ...c, concern: '' } : c)) };
  return { house, answered: [entry, ...answered] };
}
