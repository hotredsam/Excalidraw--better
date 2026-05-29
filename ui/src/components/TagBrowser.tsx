import React, { useEffect, useState } from 'react';
import { Workspace, FileInfo, SearchResult } from '@excalibur/shared';

/**
 * Browse all tags in the active workspace with counts; selecting a tag lists the
 * files that carry it (click to open).
 */
export const TagBrowser: React.FC<{
  activeWorkspace: Workspace | null;
  onOpenFile: (workspace: Workspace, file: FileInfo) => void;
  refreshKey?: number;
}> = ({ activeWorkspace, onOpenFile, refreshKey }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    (async () => {
      if (!activeWorkspace) {
        setCounts({});
        return;
      }
      const tags = await window.api.workspaces.getTags(activeWorkspace.id);
      const c: Record<string, number> = {};
      for (const list of Object.values(tags)) for (const t of list) c[t] = (c[t] || 0) + 1;
      setCounts(c);
      setSelected(null);
      setResults([]);
    })();
  }, [activeWorkspace?.id, refreshKey]);

  const selectTag = async (tag: string) => {
    if (!activeWorkspace) return;
    setSelected(tag);
    const res = await window.api.workspaces.search(activeWorkspace.id, tag);
    setResults(res.results.filter((r) => r.tags.includes(tag)));
  };

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (!activeWorkspace) return <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Open a workspace to browse tags.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      {entries.length === 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-2)' }}>No tags yet. Add tags from a file's Properties panel.</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {entries.map(([tag, n]) => (
          <button
            key={tag}
            onClick={() => selectTag(tag)}
            className="chip"
            style={{ cursor: 'pointer', border: selected === tag ? '1px solid var(--orange-500)' : 'none' }}
          >
            {tag} · {n}
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <h4 style={{ margin: '4px 0 6px', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-2)' }}>
            #{selected} ({results.length})
          </h4>
          {results.map((r) => (
            <div
              key={r.path}
              onClick={() =>
                onOpenFile(activeWorkspace, {
                  name: r.name,
                  path: r.path,
                  isDirectory: false,
                  size: 0,
                  mtime: r.mtime,
                  extension: r.extension,
                })
              }
              style={{ padding: '6px 8px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: 13, color: 'var(--text-1)' }}
            >
              📄 {r.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
