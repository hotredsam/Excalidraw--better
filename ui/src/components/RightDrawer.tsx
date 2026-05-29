import React from 'react';
import { FileInfo, Workspace, ExportPreset, StoredTemplate, RecentFile } from '@excalibur/shared';
import { PropertiesPanel } from './PropertiesPanel';
import { PluginManager } from './PluginManager';
import { AIImportLane } from './AIImportLane';
import { TemplatesPanel } from './TemplatesPanel';
import { RecentsPanel } from './RecentsPanel';
import { LibrariesPanel } from './LibrariesPanel';
import { SnippetsPanel } from './SnippetsPanel';
import { StatsPanel } from './StatsPanel';
import { GitPanel } from './GitPanel';
import { ReviewPanel } from './ReviewPanel';
import { TagBrowser } from './TagBrowser';
import { StylePresetsPanel } from './StylePresetsPanel';
import { OutlinePanel } from './OutlinePanel';
import type { StylePreset } from '@excalibur/shared';

export type DrawerTab =
  | 'properties'
  | 'templates'
  | 'plugins'
  | 'ai'
  | 'recents'
  | 'libraries'
  | 'snippets'
  | 'styles'
  | 'outline'
  | 'tags'
  | 'review'
  | 'stats'
  | 'git';

const TABS: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'properties', label: 'Properties', icon: '⚙' },
  { id: 'recents', label: 'Recent', icon: '🕘' },
  { id: 'outline', label: 'Outline', icon: '☰' },
  { id: 'templates', label: 'Templates', icon: '▦' },
  { id: 'snippets', label: 'Snippets', icon: '✂' },
  { id: 'styles', label: 'Styles', icon: '🎨' },
  { id: 'libraries', label: 'Libraries', icon: '📚' },
  { id: 'tags', label: 'Tags', icon: '🏷' },
  { id: 'review', label: 'Review', icon: '💬' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'git', label: 'Git', icon: '⎇' },
  { id: 'plugins', label: 'Plugins', icon: '🧩' },
  { id: 'ai', label: 'AI', icon: '✨' },
];

export interface RightDrawerProps {
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
  onOpenRecent: (r: RecentFile) => void;
  onInsertLibrary: (id: string) => void;
  onSaveSelectionToLibrary: (id: string) => void;
  onInsertSnippet: (id: string) => void;
  onSaveSnippet: () => Promise<{ title: string; elements: any[] } | null>;
  onApplyStyle: (preset: StylePreset) => void;
  onSaveStyle: () => Promise<void>;
  getScene: () => any;
  onGoToFrame: (slideId: string) => void;
  onOpenFile: (workspace: Workspace, file: FileInfo) => void;
  reviewAuthor: string;
  refreshKeys: { templates: number; recents: number; libraries: number; stats: number; snippets: number; styles: number };
  onAiApplied: () => void;
}

export const RightDrawer: React.FC<RightDrawerProps> = (props) => {
  if (!props.open) return null;

  return (
    <aside style={{ width: 360, backgroundColor: 'var(--bg-1)', borderLeft: '1px solid var(--border-0)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-0)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, overflowX: 'auto', padding: '0 4px' }}>
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
                padding: '12px 9px',
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ marginRight: 4 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={props.onClose} style={{ background: 'transparent', color: 'var(--text-2)', padding: 8 }}>
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--s-lg)' }}>
        {props.tab === 'properties' && (
          <PropertiesPanel activeFile={props.activeFile} activeWorkspace={props.activeWorkspace} presets={props.presets} onExport={props.onExport} />
        )}
        {props.tab === 'recents' && <RecentsPanel onOpenRecent={props.onOpenRecent} refreshKey={props.refreshKeys.recents} />}
        {props.tab === 'templates' && (
          <TemplatesPanel onUseTemplate={props.onUseTemplate} onSaveCurrent={props.onSaveCurrentTemplate} refreshKey={props.refreshKeys.templates} />
        )}
        {props.tab === 'snippets' && (
          <SnippetsPanel onInsert={props.onInsertSnippet} onSaveSelection={props.onSaveSnippet} refreshKey={props.refreshKeys.snippets} />
        )}
        {props.tab === 'libraries' && (
          <LibrariesPanel onInsertLibrary={props.onInsertLibrary} onSaveSelection={props.onSaveSelectionToLibrary} refreshKey={props.refreshKeys.libraries} />
        )}
        {props.tab === 'styles' && (
          <StylePresetsPanel onApply={props.onApplyStyle} onSaveCurrent={props.onSaveStyle} refreshKey={props.refreshKeys.styles} />
        )}
        {props.tab === 'outline' && (
          <OutlinePanel
            activeWorkspace={props.activeWorkspace}
            activeFile={props.activeFile}
            getScene={props.getScene}
            onGoTo={props.onGoToFrame}
          />
        )}
        {props.tab === 'tags' && (
          <TagBrowser activeWorkspace={props.activeWorkspace} onOpenFile={props.onOpenFile} refreshKey={props.refreshKeys.stats} />
        )}
        {props.tab === 'review' && <ReviewPanel activeWorkspace={props.activeWorkspace} activeFile={props.activeFile} author={props.reviewAuthor} />}
        {props.tab === 'stats' && <StatsPanel activeWorkspace={props.activeWorkspace} refreshKey={props.refreshKeys.stats} />}
        {props.tab === 'git' && <GitPanel activeWorkspace={props.activeWorkspace} />}
        {props.tab === 'plugins' && <PluginManager />}
        {props.tab === 'ai' && <AIImportLane onApplied={props.onAiApplied} />}
      </div>
    </aside>
  );
};
