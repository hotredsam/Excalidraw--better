import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ApiProvider } from './api/ApiContext';
import './index.css';

// The Electron build talks to the backend through the preload bridge exposed as
// `window.api`. It is provided here so the rest of the renderer depends only on
// the injected ExcaliburApi, never the global. Other hosts mount <ExcaliburEditor>
// (see ui's package entry) with their own implementation.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApiProvider api={window.api}>
      <App />
    </ApiProvider>
  </React.StrictMode>
);
