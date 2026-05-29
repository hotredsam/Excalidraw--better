import React from 'react';
import { FileInfo, Workspace, ExportPreset, StoredTemplate } from '@excalibur/shared';
import { PropertiesPanel } from './PropertiesPanel';
import { PluginManager } from './PluginManager';
import { AIImportLane } from './AIImportLane';
import { TemplatesPanel } from './TemplatesPanel';

export type DrawerTab = 'properties' | 'templates' | 'plugins' | 'ai';

const TABS: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'properties', label: 'Properties', icon: '⚙' },
  { id: 'templates', label: 'Templates', icon: '▦' },
  { id: 'plugins', label: 'Plugins', icon: '🧩' },
  { id: 'ai', label: 'AI Import', icon: '✨' },
];

export const RightDrawer: React.FC<{
  open: boolean;
  tab: DrawerTab;
  onTab: (t: DrawerTab) => void;
  onClose: () => void;
  activeFile: FileInfo | null;
  activeWorkspace: Workspace | null;
  presets: ExportPreset[];
  onExport: (preset: ExportPreset) => Promise<void>;
  onUseTemplate: (tpl: StoredTemplate) => void;
  onSaveCurrentTemplate: () => Promise<{ title: string; scene: any } | null>;
  templatesRefreshKey: number;
  onAiApplied: () => void;
}> = (props) => {
  if (!props.open) return null;

  return (
    <aside
      style={{
        width: '340px',
        backgroundColor: 'var(--bg-1)',
        borderLeft: '1px solid var(--border-0)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-0)',
          padding: '0 var(--s-sm)',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flex: 1 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => props.onTab(t.id)}
              title={t.label}
              style={{
                background: 'transparent',
                borderRadius: 0,
                borderBottom: `2px solid ${props.tab === t.id ? 'var(--orange-600)' : 'transparent'}`,
                color: props.tab === t.id ? 'var(--text-0)' : 'var(--text-2)',
                padding: '12px 10px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span style={{ marginRight: 4 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={props.onClose} style={{ background: 'transparent', color: 'var(--text-2)', padding: 4 }}>
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-lg)' }}>
        {props.tab === 'properties' && (
          <PropertiesPanel
            activeFile={props.activeFile}
            activeWorkspace={props.activeWorkspace}
            presets={props.presets}
            onExport={props.onExport}
          />
        )}
        {props.tab === 'templates' && (
          <TemplatesPanel
            onUseTemplate={props.onUseTemplate}
            onSaveCurrent={props.onSaveCurrentTemplate}
            refreshKey={props.templatesRefreshKey}
          />
        )}
        {props.tab === 'plugins' && <PluginManager />}
        {props.tab === 'ai' && <AIImportLane onApplied={props.onAiApplied} />}
      </div>
    </aside>
  );
};
