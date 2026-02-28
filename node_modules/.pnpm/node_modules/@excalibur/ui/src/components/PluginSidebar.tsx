import React, { useState, useEffect } from 'react';
import { PluginInfo } from '@excalibur/shared';

export const PluginSidebar: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPlugins = async () => {
    setLoading(true);
    try {
      const list = await window.api.plugins.list();
      setPlugins(list.plugins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPlugins();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    await window.api.plugins.setEnabled(id, enabled);
    refreshPlugins();
  };

  return (
    <div style={{ padding: 'var(--s-md)', flex: 1, overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 var(--s-md) 0', fontSize: '12px', color: 'var(--text-2)', textTransform: 'uppercase' }}>Installed Plugins</h3>
      
      {loading ? (
        <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-md)' }}>
          {plugins.map(plugin => (
            <div 
              key={plugin.id} 
              style={{ 
                padding: 'var(--s-md)', 
                borderRadius: 'var(--r-sm)', 
                backgroundColor: 'var(--bg-2)',
                border: '1px solid var(--border-0)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s-xs)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{plugin.name}</span>
                <input 
                  type="checkbox" 
                  checked={plugin.enabled} 
                  onChange={(e) => handleToggle(plugin.id, e.target.checked)} 
                />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>v{plugin.version}</span>
              {plugin.description && (
                <p style={{ fontSize: '12px', color: 'var(--text-1)', margin: '4px 0 0 0' }}>{plugin.description}</p>
              )}
            </div>
          ))}
          {plugins.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-2)', textAlign: 'center', marginTop: '20px' }}>
              No plugins found. Add them to your profile's plugin folder.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
