import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Workspace, FileInfo, SearchResult } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';
import { useApi } from '../api/ApiContext';

const FILE_ICON: Record<string, string> = {
  '.excalidraw': '✎',
  '.png': '🖼',
  '.svg': '◆',
  '.json': '{}',
};

export const WorkspaceSidebar: React.FC<{
  onOpenFile: (workspace: Workspace, file: FileInfo) => void;
  reloadKey?: number;
  onWorkspaceChange?: (ws: Workspace | null) => void;
  focusSignal?: number;
}> = ({ onOpenFile, reloadKey, onWorkspaceChange, focusSignal }) => {
  const api = useApi();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDir, setCurrentDir] = useState<string | null>(null); // absolute; null = root
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subDir = activeWorkspace && currentDir
    ? currentDir.slice(activeWorkspace.path.length + 1)
    : '';

  const loadFiles = useCallback(async (ws: Workspace, dir: string | null) => {
    setLoading(true);
    try {
      const rel = dir ? dir.slice(ws.path.length + 1) : '';
      const list = await api.workspaces.listFiles(ws.id, rel);
      setFiles(list);
    } catch (err: any) {
      toastError('Could not list files: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const { workspaces } = await api.workspaces.list();
    const active = await api.workspaces.getActive();
    setWorkspaces(workspaces);
    setActiveWorkspace(active);
    onWorkspaceChange?.(active);
    if (active) await loadFiles(active, null);
    setCurrentDir(null);
  }, [loadFiles, onWorkspaceChange]);

  useEffect(() => {
    refresh();
  }, [reloadKey]);

  useEffect(() => {
    if (focusSignal) searchInputRef.current?.focus();
  }, [focusSignal]);

  // Debounced search.
  useEffect(() => {
    if (!activeWorkspace) return;
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim()) {
      setResults(null);
      return;
    }
    debounce.current = setTimeout(async () => {
      const res = await api.workspaces.search(activeWorkspace.id, query);
      setResults(res.results);
    }, 200);
  }, [query, activeWorkspace?.id]);

  const addWorkspace = async () => {
    const ws = await api.workspaces.add();
    if (ws) {
      await api.workspaces.setActive(ws.id);
      await refresh();
    }
  };

  const switchWorkspace = async (id: string) => {
    await api.workspaces.setActive(id);
    await refresh();
  };

  const enterDir = async (dirPath: string) => {
    if (!activeWorkspace) return;
    setCurrentDir(dirPath);
    await loadFiles(activeWorkspace, dirPath);
  };

  const goUp = async () => {
    if (!activeWorkspace || !currentDir) return;
    const parent = currentDir.slice(0, currentDir.lastIndexOf('/'));
    const next = parent.length > activeWorkspace.path.length ? parent : null;
    setCurrentDir(next);
    await loadFiles(activeWorkspace, next);
  };

  const dirArg = () => currentDir; // absolute dir or null (root)

  const newFile = async () => {
    if (!activeWorkspace) return;
    const name = prompt('New drawing name:', 'untitled');
    if (!name) return;
    try {
      const { path } = await api.workspaces.createFile(activeWorkspace.id, dirArg(), name);
      toastSuccess('Created ' + name);
      await loadFiles(activeWorkspace, currentDir);
      onOpenFile(activeWorkspace, {
        name: path.split('/').pop() || name,
        path,
        isDirectory: false,
        size: 0,
        mtime: Date.now(),
        extension: '.excalidraw',
      });
    } catch (e: any) {
      toastError(e?.message || 'Create failed');
    }
  };

  const newFolder = async () => {
    if (!activeWorkspace) return;
    const name = prompt('New folder name:');
    if (!name) return;
    try {
      await api.workspaces.createFolder(activeWorkspace.id, dirArg(), name);
      await loadFiles(activeWorkspace, currentDir);
    } catch (e: any) {
      toastError(e?.message || 'Create failed');
    }
  };

  const rename = async (file: FileInfo) => {
    if (!activeWorkspace) return;
    const name = prompt('Rename to:', file.name);
    if (!name || name === file.name) return;
    try {
      await api.workspaces.renameFile(activeWorkspace.id, file.path, name);
      await loadFiles(activeWorkspace, currentDir);
    } catch (e: any) {
      toastError(e?.message || 'Rename failed');
    }
  };

  const duplicate = async (file: FileInfo) => {
    if (!activeWorkspace) return;
    try {
      await api.workspaces.copyFile(activeWorkspace.id, file.path);
      await loadFiles(activeWorkspace, currentDir);
    } catch (e: any) {
      toastError(e?.message || 'Copy failed');
    }
  };

  const remove = async (file: FileInfo) => {
    if (!activeWorkspace) return;
    if (!confirm(`Delete "${file.name}" to the Recycle Bin?`)) return;
    try {
      await api.workspaces.deleteFile(activeWorkspace.id, file.path);
      await loadFiles(activeWorkspace, currentDir);
    } catch (e: any) {
      toastError(e?.message || 'Delete failed');
    }
  };

  const openSearchResult = (r: SearchResult) => {
    if (!activeWorkspace) return;
    onOpenFile(activeWorkspace, {
      name: r.name,
      path: r.path,
      isDirectory: false,
      size: 0,
      mtime: r.mtime,
      extension: r.extension,
    });
  };

  return (
    <div
      style={{
        width: '288px',
        backgroundColor: 'var(--bg-1)',
        borderRight: '1px solid var(--border-0)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Workspace selector */}
      <div style={{ padding: 'var(--s-md)', borderBottom: '1px solid var(--border-0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={label}>Workspace</h3>
          <button onClick={addWorkspace} title="Open folder as workspace" style={{ background: 'transparent', color: 'var(--orange-600)', padding: 0, fontSize: 18 }}>
            +
          </button>
        </div>
        <select value={activeWorkspace?.id || ''} onChange={(e) => switchWorkspace(e.target.value)} style={{ width: '100%' }}>
          <option value="" disabled>
            Select workspace…
          </option>
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search name, text, tags…"
          style={{ width: '100%', marginTop: 8 }}
        />
      </div>

      {/* Toolbar */}
      {activeWorkspace && !results && (
        <div style={{ display: 'flex', gap: 6, padding: '8px var(--s-md)', borderBottom: '1px solid var(--border-0)' }}>
          <button className="btn-ghost" style={miniBtn} onClick={newFile}>
            + Drawing
          </button>
          <button className="btn-ghost" style={miniBtn} onClick={newFolder}>
            + Folder
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      {activeWorkspace && !results && currentDir && (
        <div style={{ padding: '6px var(--s-md)', fontSize: 11, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={goUp} style={{ background: 'transparent', color: 'var(--orange-500)', padding: 0, fontSize: 11 }}>
            ← up
          </button>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>/{subDir}</span>
        </div>
      )}

      {/* Files / results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-sm)' }}>
        {results ? (
          <>
            <h3 style={{ ...label, padding: '0 8px 6px' }}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </h3>
            {results.map((r) => (
              <div key={r.path} onClick={() => openSearchResult(r)} style={rowStyle}>
                <span>{FILE_ICON[r.extension] || '📄'}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                  {r.snippet && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>…{r.snippet}</div>}
                </div>
              </div>
            ))}
          </>
        ) : loading ? (
          <p style={{ fontSize: 13, color: 'var(--text-2)', padding: 8 }}>Loading…</p>
        ) : (
          <>
            {files.map((file) => (
              <div
                key={file.path}
                style={rowStyle}
                onClick={() => (file.isDirectory ? enterDir(file.path) : onOpenFile(activeWorkspace!, file))}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span>{file.isDirectory ? '📁' : FILE_ICON[file.extension || ''] || '📄'}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                {!file.isDirectory && (
                  <span style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button title="Rename" style={iconBtn} onClick={() => rename(file)}>✏️</button>
                    <button title="Duplicate" style={iconBtn} onClick={() => duplicate(file)}>⧉</button>
                    <button title="Delete" style={iconBtn} onClick={() => remove(file)}>🗑️</button>
                  </span>
                )}
              </div>
            ))}
            {files.length === 0 && activeWorkspace && (
              <p style={{ fontSize: 12, color: 'var(--text-2)', padding: 8 }}>This folder is empty.</p>
            )}
            {!activeWorkspace && (
              <p style={{ fontSize: 12, color: 'var(--text-2)', padding: 8 }}>
                Open a folder with “+” to start a workspace.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const label: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--text-2)',
};
const miniBtn: React.CSSProperties = { fontSize: 11, padding: '5px 10px', flex: 1 };
const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  borderRadius: 'var(--r-sm)',
  cursor: 'pointer',
  fontSize: 13,
};
const iconBtn: React.CSSProperties = { background: 'transparent', padding: 2, fontSize: 11, borderRadius: 4 };
