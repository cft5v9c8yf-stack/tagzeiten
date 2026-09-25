import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { clearDevicePreferences, downloadText } from '../../app/files';
import { useToast } from '../../app/Toast';
import { useStore } from '../../data/hooks';
import { BackupError, parseBackup } from '../../domain/backup';
import { resetOpenState } from '../../ui/collapseState';
import { Section } from '../../ui/Section';

type Pending = { json: string; days: number; exportedAt?: string };

/**
 * Export, import and delete (rule 11). Import and delete ask for confirmation
 * on the page itself.
 */
export function DataSettings() {
  const store = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [importError, setImportError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const stamp = store.today();

  const exportMarkdown = async () => {
    downloadText(`tagzeiten-${stamp}.md`, await store.exportMarkdown(), 'text/markdown');
    toast('Export als Markdown erstellt');
  };
  const exportJson = async () => {
    downloadText(`tagzeiten-${stamp}.json`, JSON.stringify(await store.exportBackup(), null, 2), 'application/json');
    toast('Sicherung als JSON erstellt');
  };

  const chooseFile = async (file: File | undefined) => {
    setImportError('');
    setPending(null);
    if (!file) return;
    try {
      const json = await file.text();
      const { days } = parseBackup(json, stamp);
      const exportedAt = (JSON.parse(json) as { exportedAt?: string }).exportedAt;
      setPending({ json, days: days.length, exportedAt });
    } catch (e) {
      setImportError(e instanceof BackupError ? e.message : 'Die Datei konnte nicht gelesen werden.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const runImport = async () => {
    if (!pending) return;
    try {
      const { days } = await store.importBackup(pending.json);
      toast(`Sicherung eingespielt: ${days} Tage`);
      setPending(null);
    } catch (e) {
      setImportError(e instanceof BackupError ? e.message : 'Die Sicherung konnte nicht eingespielt werden.');
    }
  };

  const runDelete = async () => {
    await store.deleteAll();
    clearDevicePreferences();
    resetOpenState();
    setConfirmDelete(false);
    toast('Alle Einträge gelöscht');
    navigate('/');
  };

  const exportedOn = pending?.exportedAt ? new Date(pending.exportedAt).toLocaleDateString('de-DE') : null;

  return (
    <>
      <Section id="more.data.export" title="Exportieren" level={4}>
      <div className="button-row">
        <button type="button" className="btn" onClick={exportMarkdown}>
          Als Text exportieren (Markdown)
        </button>
        <button type="button" className="btn" onClick={exportJson}>
          Sicherung exportieren (JSON)
        </button>
      </div>
      <p className="small muted">Der Text ist zum Lesen und Aufheben. Die Sicherung kannst du hier oder auf einem anderen Gerät wieder einspielen.</p>

      </Section>
      <Section id="more.data.import" title="Sicherung einspielen" level={4}>
      <label className="btn file-btn">
        Datei wählen …
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          onChange={(e) => void chooseFile(e.target.files?.[0])}
        />
      </label>
      {importError && (
        <p className="form-error" role="alert">
          {importError}
        </p>
      )}
      {pending && (
        <div className="panel confirm-panel" role="alertdialog" aria-labelledby="import-confirm">
          <p id="import-confirm">
            Die Sicherung{exportedOn ? ` vom ${exportedOn}` : ''} enthält {pending.days} {pending.days === 1 ? 'Tag' : 'Tage'}.
            Alle Einträge und Einstellungen auf diesem Gerät werden durch sie ersetzt.
          </p>
          <div className="button-row">
            <button type="button" className="btn primary" onClick={runImport}>
              Sicherung einspielen
            </button>
            <button type="button" className="btn quiet" onClick={() => setPending(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      </Section>
      <Section id="more.data.delete" title="Alles löschen" level={4}>
      {confirmDelete ? (
        <div className="panel confirm-panel danger-panel" role="alertdialog" aria-labelledby="delete-confirm">
          <p id="delete-confirm">
            Alle Einträge und Einstellungen auf diesem Gerät werden gelöscht. Das lässt sich nicht rückgängig machen. Wenn
            du sie behalten willst, exportiere vorher eine Sicherung.
          </p>
          <div className="button-row">
            <button type="button" className="btn danger" onClick={runDelete}>
              Endgültig löschen
            </button>
            <button type="button" className="btn quiet" onClick={() => setConfirmDelete(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn" onClick={() => setConfirmDelete(true)}>
          Alle Einträge löschen …
        </button>
      )}
      </Section>
    </>
  );
}

export const DATA_INFO = (
  <>
    <p>Deine Einträge liegen nur auf diesem Gerät. Es gibt kein Konto und keine Übertragung.</p>
    <p>Was du in Prüfung und Beichte betest, wird nirgends gespeichert.</p>
  </>
);
