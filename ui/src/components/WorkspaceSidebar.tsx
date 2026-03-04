import React, { useState, useEffect } from 'react';
import { Workspace, FileInfo } from '@excalibur/shared';

export const WorkspaceSidebar: React.FC<{ onOpenFile: (workspace: Workspace, file: FileInfo) => void }> = ({ onOpenFile }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FileInfo | null>(null);

  const refreshWorkspaces = async () => {
    const list = await window.api.workspaces.list();
    const active = await window.api.workspaces.getActive();
    setWorkspaces(list.workspaces);
    setActiveWorkspace(active);
    if (active) {
      loadFiles(active.id);
    }
  };

  const loadFiles = async (workspaceId: string) => {
    setLoading(true);
    try {
      const workspaceFiles = await window.api.workspaces.listFiles(workspaceId);
      setFiles(workspaceFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  const handleAddWorkspace = async () => {
    const newWs = await window.api.workspaces.add();
    if (newWs) {
      await window.api.workspaces.setActive(newWs.id);
      refreshWorkspaces();
    }
  };

  const handleSwitchWorkspace = async (id: string) => {
    await window.api.workspaces.setActive(id);
    refreshWorkspaces();
  };

  return (
    <div style={{ 
      width: '280px', 
      backgroundColor: 'var(--bg-1)', 
      borderRight: '1px solid var(--border-0)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ padding: 'var(--s-md)', borderBottom: '1px solid var(--border-0)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-sm)' }}>
          <h3 style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase' }}>Workspaces</h3>
          <button onClick={handleAddWorkspace} style={{ backgroundColor: 'transparent', color: 'var(--orange-600)', padding: 0 }}>+</button>
        </div>
        
        <select 
          value={activeWorkspace?.id || ''} 
          onChange={(e) => handleSwitchWorkspace(e.target.value)}
          style={{ width: '100%', backgroundColor: 'var(--bg-2)', color: 'white', border: '1px solid var(--border-0)', borderRadius: '4px', padding: '4px' }}
        >
          <option value="" disabled>Select Workspace</option>
          {workspaces.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-md)' }}>
        <h3 style={{ margin: '0 0 var(--s-sm) 0', fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase' }}>Files</h3>
        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>Loading...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {files.map(file => (
              <div key={file.path}>
                <div
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--s-sm)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => activeWorkspace && !file.isDirectory && onOpenFile(activeWorkspace, file)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-sm)', flex: 1, overflow: 'hidden' }}>
                    <span>{file.isDirectory ? '📁' : '📄'}</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                  </div>
                  {!file.isDirectory && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(file);
                      }}
                      style={{ backgroundColor: 'transparent', color: 'var(--text-2)', padding: '2px', fontSize: '10px' }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {pendingDelete?.path === file.path && (
                  <div style={{
                    padding: '8px 8px',
                    backgroundColor: 'var(--bg-2)',
                    borderRadius: '4px',
                    marginTop: '2px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--s-sm)'
                  }}>
                    <span style={{ flex: 1, color: 'var(--text-2)' }}>Delete {file.name}?</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeWorkspace) {
                          window.api.workspaces.deleteFile(activeWorkspace.id, file.path).then(() => {
                            setPendingDelete(null);
                            refreshWorkspaces();
                          });
                        }
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(null);
                      }}
                      style={{
                        backgroundColor: 'var(--bg-3)',
                        color: 'var(--text-1)',
                        border: '1px solid var(--border-0)',
                        borderRadius: '3px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
            {files.length === 0 && activeWorkspace && <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>No compatible files found.</p>}
          </div>
        )}
      </div>
    </div>
  );
};
