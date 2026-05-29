import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom doesn't implement matchMedia; several components query it for theme.
if (!window.matchMedia) {
  // @ts-expect-error test shim
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

// jsdom doesn't implement these dialogs; default to no-op/cancel so components
// that call them in tests don't throw. Individual tests can spy/override.
window.prompt = () => null;
window.confirm = () => true;
window.alert = () => undefined;

afterEach(() => cleanup());
