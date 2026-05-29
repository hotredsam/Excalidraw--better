import type { ExcaliburApi } from '@excalibur/api-contract';

// The renderer's global `window.api` is exactly the shared ExcaliburApi contract
// (implemented by the Electron preload over IPC). Non-Electron hosts inject an
// implementation through the ApiProvider instead of relying on this global.
declare global {
  interface Window {
    api: ExcaliburApi;
  }
}

export {};
