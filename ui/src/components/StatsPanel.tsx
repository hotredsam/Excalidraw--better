import React, { useEffect, useState } from 'react';
import { Workspace, WorkspaceStats } from '@excalibur/shared';

const fmtBytes = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`);

export const StatsPanel: React.FC<{ activeWorkspace: Workspace | null; refreshKey?: number }> = ({
  activeWorkspace,
  refreshKey,
}) => {
  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!activeWorkspace) {
        setStats(null);
        return;
      }
      setLoading(true);
      try {
        setStats(await window.api.stats.compute(activeWorkspace.id));
      } finally {
        setLoading(false);
      }
    })();
  }, [activeWorkspace?.id, refreshKey]);

  if (!activeWorkspace) return <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Open a workspace to see stats.</p>;
  if (loading || !stats) return <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Computing…</p>;

  const maxTag = Math.max(1, ...Object.values(stats.tagHistogram));

  const Stat = ({ label, value }: { label: string; value: string | number }) => (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-2)', borderRadius: 'var(--r-md)', padding: 'var(--s-md)', border: '1px solid var(--border-0)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange-500)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-lg)' }}>
      <div style={{ display: 'flex', gap: 'var(--s-sm)' }}>
        <Stat label="Files" value={stats.totalFiles} />
        <Stat label="Elements" value={stats.totalElements} />
        <Stat label="Size" value={fmtBytes(stats.totalBytes)} />
      </div>

      <section>
        <h4 style={title}>By type</h4>
        {Object.entries(stats.byExtension).map(([ext, n]) => (
          <div key={ext} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
            <span style={{ color: 'var(--text-1)' }}>{ext}</span>
            <span style={{ color: 'var(--text-2)' }}>{n}</span>
          </div>
        ))}
      </section>

      {Object.keys(stats.tagHistogram).length > 0 && (
        <section>
          <h4 style={title}>Top tags</h4>
          {Object.entries(stats.tagHistogram)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([tag, n]) => (
              <div key={tag} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-2)' }}>
                  <span>{tag}</span>
                  <span>{n}</span>
                </div>
                <div style={{ height: 6, backgroundColor: 'var(--bg-3)', borderRadius: 3 }}>
                  <div style={{ width: `${(n / maxTag) * 100}%`, height: '100%', background: 'var(--brand-gradient)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
        </section>
      )}

      <section>
        <h4 style={title}>Largest files</h4>
        {stats.largestFiles.map((f) => (
          <div key={f.path} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
            <span style={{ color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            <span style={{ color: 'var(--text-2)' }}>{fmtBytes(f.size)}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

const title: React.CSSProperties = { margin: '0 0 6px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-2)' };
