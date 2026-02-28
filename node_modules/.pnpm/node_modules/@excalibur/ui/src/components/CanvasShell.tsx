import React, { useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

export interface CanvasShellProps {
  initialData?: any;
}

export const CanvasShell: React.FC<CanvasShellProps> = ({ initialData }) => {
  const [elements, setElements] = useState(initialData?.elements || []);
  const [appState, setAppState] = useState(initialData?.appState || {});

  return (
    <div style={{ height: 'calc(100vh - 56px)', width: '100vw' }}>
      <Excalidraw
        initialData={initialData}
        onChange={(elements, appState) => {
          setElements(elements);
          setAppState(appState);
        }}
        theme="dark"
      />
    </div>
  );
};
