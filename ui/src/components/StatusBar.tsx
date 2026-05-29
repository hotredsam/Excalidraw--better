import React from 'react';

/** Slim bottom status bar: file state, element count, autosave, theme. */
export const StatusBar: React.FC<{
  fileName: string | null;
  dirty: boolean;
  elementCount: number;
  autosave: boolean;
  workspaceName: string | null;
  theme: 'light' | 'dark';
}> = ({ fileName, dirty, elementCount, autosave, workspaceName, theme }) => {
  return (
    <footer
      style={{
        height: 24,
        flexShrink: 0,
        backgroundColor: 'var(--bg-1)',
        borderTop: '1px solid var(--border-0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--s-md)',
        fontSize: 11,
        color: 'var(--text-2)',
        gap: 'var(--s-md)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--s-md)', alignItems: 'center', overflow: 'hidden' }}>
        <span style={{ color: dirty ? 'var(--orange-500)' : 'var(--success)' }}>
          {dirty ? '● unsaved' : '✓ saved'}
        </span>
        {workspaceName && <span>📁 {workspaceName}</span>}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName || 'untitled'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--s-md)', alignItems: 'center' }}>
        <span>{elementCount} element{elementCount === 1 ? '' : 's'}</span>
        <span>autosave {autosave ? 'on' : 'off'}</span>
        <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
      </div>
    </footer>
  );
};
