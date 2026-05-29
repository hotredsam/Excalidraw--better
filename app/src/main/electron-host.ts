import { app, BrowserWindow, dialog, shell } from 'electron';
import * as path from 'path';
import type { HostServices, PickOptions } from '@excalibur/core';

/** Resolve the directory that ships the built-in plugins. */
function builtinPluginsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'plugins')
    : path.join(__dirname, '../../../plugins');
}

/**
 * Electron implementation of the engine's {@link HostServices}: user-data path,
 * native trash, native file/folder pickers (scoped to the focused window) and
 * external-link opening. Must be constructed after `app` is ready.
 */
export function createElectronHost(): HostServices {
  return {
    userDataDir: app.getPath('userData'),
    builtinPluginsDir: builtinPluginsDir(),
    appVersion: app.getVersion(),
    platform: process.platform,
    trashItem: (targetPath: string) => shell.trashItem(targetPath),
    openExternal: (url: string) => shell.openExternal(url),
    async pickDirectory(opts?: PickOptions): Promise<string | null> {
      const win = BrowserWindow.getFocusedWindow() ?? undefined;
      const result = await dialog.showOpenDialog(win as BrowserWindow, {
        properties: ['openDirectory'],
        ...(opts?.title ? { title: opts.title } : {}),
      });
      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
    },
    async pickFile(opts?: PickOptions): Promise<string | null> {
      const win = BrowserWindow.getFocusedWindow() ?? undefined;
      const result = await dialog.showOpenDialog(win as BrowserWindow, {
        properties: ['openFile'],
        ...(opts?.title ? { title: opts.title } : {}),
        ...(opts?.filters ? { filters: opts.filters } : {}),
      });
      if (result.canceled || result.filePaths.length === 0) return null;
      return result.filePaths[0];
    },
  };
}
