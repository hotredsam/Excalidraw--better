// Public entry point for @excalibur/ui as an embeddable library.
//
// Host apps mount <ExcaliburEditor api={...} /> with any ExcaliburApi
// implementation (the in-process engine from @excalibur/core, an HTTP client,
// etc.) and import the stylesheet via '@excalibur/ui/styles.css'.
import App from './App';
import { ApiProvider } from './api/ApiContext';
import type { ExcaliburApi } from '@excalibur/api-contract';

export interface ExcaliburEditorProps {
  /** The backend API the editor runs against. */
  api: ExcaliburApi;
}

/**
 * The full Excalibur editor as a single mountable React component. Wraps the app
 * in an ApiProvider so every inner component resolves the injected API through
 * `useApi()` rather than a global.
 */
export function ExcaliburEditor({ api }: ExcaliburEditorProps) {
  return (
    <ApiProvider api={api}>
      <App />
    </ApiProvider>
  );
}

export { ApiProvider, useApi } from './api/ApiContext';
export type { ExcaliburApi } from '@excalibur/api-contract';
