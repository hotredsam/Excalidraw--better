import React, { useState, useEffect, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export interface CanvasShellProps {
  initialData?: any;
  onSave?: (elements: any[], appState: any) => void;
}

export const CanvasShell: React.FC<CanvasShellProps> = ({ initialData, onSave }) => {
  const excalidrawRef = useRef<any>(null);

  useEffect(() => {
    if (initialData && excalidrawRef.current) {
      excalidrawRef.current.updateScene(initialData);
    }
  }, [initialData]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Excalidraw
        ref={(api) => (excalidrawRef.current = api)}
        initialData={initialData}
        onChange={(elements, appState) => {
          // Internal state handled by Excalidraw, but we can hook into it
        }}
        theme="dark"
      />
      
      {/* Absolute Save Button for Proof of Concept */}
      <button 
        onClick={() => {
          if (excalidrawRef.current) {
            const elements = excalidrawRef.current.getSceneElements();
            const appState = excalidrawRef.current.getAppState();
            onSave?.(elements, appState);
          }
        }}
        style={{ 
          position: 'absolute', 
          bottom: '24px', 
          right: '24px', 
          zIndex: 10,
          backgroundColor: 'var(--orange-600)',
          color: 'white',
          padding: 'var(--s-sm) var(--s-lg)',
          boxShadow: 'var(--shadow-1)'
        }}
      >
        Save Changes
      </button>
    </div>
  );
};
