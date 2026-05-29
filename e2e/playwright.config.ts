import { defineConfig } from '@playwright/test';

/**
 * Electron end-to-end config. Specs launch the built app (app/dist + ui/dist)
 * via Playwright's Electron support and drive the renderer. In CI this runs
 * under `xvfb-run` (see .github/workflows/ci.yml).
 */
export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'on-first-retry',
  },
});
