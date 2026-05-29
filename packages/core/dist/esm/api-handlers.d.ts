import type { ExcaliburApi } from '@excalibur/api-contract';
import { HostServices } from './host';
import { ExcaliburEngine } from './engine';
/**
 * Build the transport-agnostic API surface from an engine and its host. Every
 * operation that used to be an `ipcMain.handle` body lives here exactly once,
 * with the renderer-facing argument shape. The Electron main process maps IPC
 * channels onto these functions; an in-process (non-Electron) host can hand the
 * returned object straight to the renderer's ApiProvider with no IPC at all.
 *
 * The shape mirrors the renderer's `window.api`; the Electron-only
 * `onMenuCommand` event subscription is supplied separately by the host.
 */
export declare function createApiHandlers(engine: ExcaliburEngine, host?: HostServices): ExcaliburApi;
/** The transport-agnostic API surface produced by {@link createApiHandlers}. */
export type { ExcaliburApi } from '@excalibur/api-contract';
