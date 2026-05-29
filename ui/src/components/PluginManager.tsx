import React, { useEffect, useState } from 'react';
import { InstalledPlugin } from '@excalibur/shared';
import { toastError, toastSuccess } from '../lib/toast';

const permColor = (level: string) =>
  level === 'all' ? 'var(--danger)' : level === 'workspace-only' ? 'var(--warning)' : 'var(--text-2)';

export const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<InstalledPlugin[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { plugins } = await window.api.plugins.list();
    setPlugins(plugins);
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggle = async (p: InstalledPlugin) => {
    setBusy(true);
    try {
      if (p.enabled) await window.api.plugins.disable(p.id);
      else await window.api.plugins.enable(p.id);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const install = async () => {
    setBusy(true);
    try {
      const installed = await window.api.plugins.installFromFolder();
      if (installed) {
        toastSuccess(`Installed "${installed.name}"`);
        await refresh();
      }
    } catch (e: any) {
      toastError(e?.message || 'Install failed');
    } finally {
      setBusy(false);
    }
  };

  const uninstall = async (p: InstalledPlugin) => {
    if (!confirm(`Uninstall "${p.name}"? This removes its folder from this profile.`)) return;
    setBusy(true);
    try {
      await window.api.plugins.uninstall(p.id);
      toastSuccess(`Uninstalled "${p.name}"`);
      await refresh();
    } catch (e: any) {
      toastError(e?.message || 'Uninstall failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-2)' }}>
          {plugins.length} plugin{plugins.length === 1 ? '' : 's'} · enabled per profile
        </p>
        <button className="btn-ghost" disabled={busy} onClick={install} style={{ fontSize: '12px' }}>
          + Install from folder
        </button>
      </div>

      {plugins.map((p) => (
        <div
          key={p.id}
          style={{
            backgroundColor: 'var(--bg-2)',
            border: '1px solid var(--border-0)',
            borderRadius: 'var(--r-md)',
            padding: 'var(--s-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-sm)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-sm)' }}>
                <strong style={{ fontSize: '14px' }}>{p.name}</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-2)' }}>v{p.version}</span>
                {p.builtIn && <span className="chip">built-in</span>}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-2)' }}>{p.description}</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={p.enabled} disabled={busy} onChange={() => toggle(p)} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--s-md)', marginTop: 'var(--s-sm)', fontSize: '11px' }}>
            <span style={{ color: permColor(p.permissions.filesystem) }}>
              ◆ fs: {p.permissions.filesystem}
            </span>
            <span style={{ color: permColor(p.permissions.network) }}>◆ net: {p.permissions.network}</span>
          </div>

          {!p.builtIn && (
            <button
              onClick={() => uninstall(p)}
              disabled={busy}
              style={{ marginTop: 'var(--s-sm)', backgroundColor: 'transparent', color: 'var(--danger)', fontSize: '11px', padding: 0 }}
            >
              Uninstall
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
