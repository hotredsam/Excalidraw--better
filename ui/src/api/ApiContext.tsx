import React, { createContext, useContext } from 'react';
import type { ExcaliburApi } from '@excalibur/api-contract';

/**
 * React context carrying the application's {@link ExcaliburApi} implementation.
 *
 * In the Electron app this is `window.api` (the IPC preload bridge). A non-
 * Electron host (web/Node/Tauri) injects its own implementation — e.g. an HTTP
 * client, or `createApiHandlers(engine, host)` from `@excalibur/core` running
 * in-process — by wrapping the editor in an `<ApiProvider api={...}>`.
 */
const ApiContext = createContext<ExcaliburApi | null>(null);

export function ApiProvider({ api, children }: { api: ExcaliburApi; children: React.ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

/**
 * Access the application API. Prefers an `<ApiProvider>` above in the tree and
 * falls back to the global `window.api` (the Electron preload) when none is
 * present — so the Electron app and existing tests that assign `window.api`
 * keep working without an explicit provider.
 */
export function useApi(): ExcaliburApi {
  const ctx = useContext(ApiContext);
  if (ctx) return ctx;
  if (typeof window !== 'undefined' && (window as unknown as { api?: ExcaliburApi }).api) {
    return (window as unknown as { api: ExcaliburApi }).api;
  }
  throw new Error('useApi: no ApiProvider in the tree and no window.api global is available');
}
