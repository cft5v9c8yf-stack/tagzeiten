import { FIELDS, SPECIAL_FIELDS } from '../../content/fields';
import type { Part } from '../../content/orders';
import type { DateKey } from '../../domain/dates';
import { DayField } from '../../ui/DayField';

/** Plain text fields of a part (special controls render themselves). */
export function PartFields({ part, date }: { part: Part; date: DateKey }) {
  const fields = (part.fields ?? []).filter((f) => !SPECIAL_FIELDS.has(f) && FIELDS[f]);
  return (
    <>
      {fields.map((f) => (
        <DayField key={f} date={date} path={f} />
      ))}
    </>
  );
}
