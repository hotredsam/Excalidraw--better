import React, { useState } from 'react';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { PluginSidebar } from './PluginSidebar';
import { Workspace, FileInfo } from '@excalibur/shared';

export const Sidebar: React.FC<{ onOpenFile: (workspace: Workspace, file: FileInfo) => void }> = ({ onOpenFile }) => {
  const [activeTab, setActiveTab] = useState<'files' | 'plugins'>('files');

  return (
    <div style={{ 
      width: '280px', 
      backgroundColor: 'var(--bg-1)', 
      borderRight: '1px solid var(--border-0)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-0)' }}>
        <button 
          onClick={() => setActiveTab('files')}
          style={{ 
            flex: 1, 
            padding: 'var(--s-md)', 
            backgroundColor: activeTab === 'files' ? 'var(--bg-2)' : 'transparent',
            color: activeTab === 'files' ? 'var(--orange-600)' : 'var(--text-2)',
            borderRadius: 0,
            fontSize: '12px',
            textTransform: 'uppercase'
          }}
        >
          Files
        </button>
        <button 
          onClick={() => setActiveTab('plugins')}
          style={{ 
            flex: 1, 
            padding: 'var(--s-md)', 
            backgroundColor: activeTab === 'plugins' ? 'var(--bg-2)' : 'transparent',
            color: activeTab === 'plugins' ? 'var(--orange-600)' : 'var(--text-2)',
            borderRadius: 0,
            fontSize: '12px',
            textTransform: 'uppercase'
          }}
        >
          Plugins
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'files' ? (
          <WorkspaceSidebar onOpenFile={onOpenFile} />
        ) : (
          <PluginSidebar />
        )}
      </div>
    </div>
  );
};
