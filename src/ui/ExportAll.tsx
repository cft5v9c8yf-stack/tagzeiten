import { EntryMenu } from './EntryMenu';

/**
 * All entries of a place as one Markdown file or one PDF: the three dots beside the
 * heading of the place, as beside every entry. Quiet; nothing under the list.
 */
export function ExportAll({ label, onMarkdown, onPdf }: { label: string; onMarkdown: () => void; onPdf: () => void }) {
  return (
    <EntryMenu
      label={label}
      items={[
        { label: 'Alle als Text exportieren (Markdown)', onSelect: onMarkdown },
        { label: 'Alle als PDF sichern', onSelect: onPdf },
      ]}
    />
  );
}
