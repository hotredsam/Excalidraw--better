import React, { useEffect, useState } from 'react';
import { useApi } from '../api/ApiContext';
import { BackupEntry, FileInfo } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

/** Lists versioned backups for the active file and restores a chosen version. */
export const BackupsPanel: React.FC<{ activeFile: FileInfo | null; onRestored?: () => void }> = ({
  activeFile,
  onRestored,
}) => {
  const api = useApi();
  const [backups, setBackups] = useState<BackupEntry[]>([]);

  const refresh = async () => {
    if (!activeFile) {
      setBackups([]);
      return;
    }
    setBackups((await api.backups.list(activeFile.path)).backups);
  };

  useEffect(() => {
    refresh();
  }, [activeFile?.path]);

  if (!activeFile) return null;

  const restore = async (b: BackupEntry) => {
    if (!confirm(`Restore the version from ${new Date(b.createdAt).toLocaleString()}? This overwrites the current file.`)) return;
    try {
      await api.backups.restore(b.id);
      toastSuccess('Restored backup');
      onRestored?.();
    } catch (e: any) {
      toastError(e?.message || 'Restore failed');
    }
  };

  return (
    <section>
      <h4 style={{ margin: '0 0 8px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)' }}>
        Version history
      </h4>
      {backups.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>No backups yet — they appear after the next save.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {backups.map((b) => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: 'var(--text-1)' }}>{new Date(b.createdAt).toLocaleString()}</span>
              <button className="btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => restore(b)}>
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
