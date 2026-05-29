import React, { useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { PluginCommand } from '@excalibur/shared';

export interface CanvasShellProps {
  initialData?: any;
  onApiReady?: (api: any) => void;
  onChange?: () => void;
  onSave?: () => void;
  toolbarItems?: PluginCommand[];
  onToolbarAction?: (id: string) => void;
  gridEnabled?: boolean;
}

export const CanvasShell: React.FC<CanvasShellProps> = ({
  initialData,
  onApiReady,
  onChange,
  onSave,
  toolbarItems = [],
  onToolbarAction,
  gridEnabled,
}) => {
  const apiRef = useRef<any>(null);

  // Load a new scene whenever initialData changes (open file / new from template).
  useEffect(() => {
    if (!apiRef.current) return;
    const data = initialData ?? { elements: [], appState: {} };
    apiRef.current.updateScene({
      elements: data.elements ?? [],
      appState: { ...(data.appState ?? {}), gridSize: gridEnabled ? 20 : null },
    });
    if (data.files && Object.keys(data.files).length) {
      apiRef.current.addFiles(Object.values(data.files));
    }
  }, [initialData, gridEnabled]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Excalidraw
        excalidrawAPI={(api: any) => {
          apiRef.current = api;
          onApiReady?.(api);
        }}
        initialData={initialData}
        onChange={() => onChange?.()}
        theme="dark"
      />

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 5,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {toolbarItems.map((item) => (
          <button
            key={item.id}
            className="btn-ghost"
            onClick={() => onToolbarAction?.(item.id)}
            style={{ fontSize: 12, boxShadow: 'var(--shadow-1)' }}
          >
            {item.title}
          </button>
        ))}
        <button
          onClick={() => onSave?.()}
          className="btn-primary"
          style={{ boxShadow: 'var(--glow-orange)' }}
        >
          Save
        </button>
      </div>
    </div>
  );
};
