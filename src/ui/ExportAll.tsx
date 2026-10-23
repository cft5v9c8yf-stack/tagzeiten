/** Two buttons under a list: all entries of a place as one Markdown file or one PDF. */
export function ExportAll({ label, onMarkdown, onPdf }: { label: string; onMarkdown: () => void; onPdf: () => void }) {
  return (
    <div className="entry-export export-all" role="group" aria-label={label}>
      <button type="button" className="btn" onClick={onMarkdown}>
        Alle als Text exportieren (Markdown)
      </button>
      <button type="button" className="btn" onClick={onPdf}>
        Alle als PDF sichern
      </button>
    </div>
  );
}
