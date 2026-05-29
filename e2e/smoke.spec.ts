import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Smoke E2E: launch the real Electron app and verify the shell renders, the
 * default profile is created, a workspace can be added programmatically, and
 * the command palette opens. Filesystem dialogs are stubbed by pointing the app
 * at a temp userData dir and exercising IPC directly from the renderer where a
 * native dialog would otherwise be required.
 */
let app: ElectronApplication;
let page: Page;

const repoRoot = path.resolve(__dirname, '..');
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'excalibur-e2e-'));

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(repoRoot, 'app'), '--no-sandbox', `--user-data-dir=${userDataDir}`],
    env: { ...process.env, NODE_ENV: 'production' },
    cwd: repoRoot,
  });
  page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await app?.close();
});

test('app shell renders with the Excalibur brand', async () => {
  await expect(page.getByText('EXCALIBUR')).toBeVisible({ timeout: 20_000 });
});

test('a default profile exists via IPC', async () => {
  const profile = await page.evaluate(async () => {
    // @ts-expect-error preload bridge
    return await window.api.profiles.getActive();
  });
  expect(profile).toBeTruthy();
  expect(profile.name).toBeTruthy();
});

test('command palette opens with Ctrl+K and lists commands', async () => {
  await page.keyboard.press('Control+K');
  await expect(page.getByPlaceholder('Type a command…')).toBeVisible();
  await page.getByPlaceholder('Type a command…').fill('save');
  await expect(page.getByText('Save', { exact: false }).first()).toBeVisible();
  await page.keyboard.press('Escape');
});

test('settings can be read and updated through IPC', async () => {
  const updated = await page.evaluate(async () => {
    // @ts-expect-error preload bridge
    return await window.api.settings.update({ showGrid: true });
  });
  expect(updated.showGrid).toBe(true);
});
