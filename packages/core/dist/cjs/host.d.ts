/** Options for a native file/folder picker (ignored by headless hosts). */
export interface PickOptions {
    title?: string;
    /** File-type filters, e.g. `[{ name: 'Images', extensions: ['png', 'svg'] }]`. */
    filters?: {
        name: string;
        extensions: string[];
    }[];
}
/**
 * The capabilities the engine needs from its host environment. Everything that
 * is genuinely platform- or shell-specific lives behind this interface so the
 * engine itself stays framework-agnostic. The Electron app supplies a host
 * backed by `app`/`dialog`/`shell`; a web/Node/Tauri host supplies its own (or
 * uses `defaultHostServices`, which degrades gracefully to filesystem-only
 * behaviour with no native dialogs).
 */
export interface HostServices {
    /** Base directory under which profiles and their data are stored. */
    userDataDir: string;
    /** Directory containing built-in plugins shipped with the host. */
    builtinPluginsDir: string;
    /** Host application version string (surfaced via the app ping). */
    appVersion: string;
    /** Host platform identifier (e.g. `process.platform`). */
    platform: string;
    /** Move a path to the OS trash. Defaults to a permanent delete when unavailable. */
    trashItem(targetPath: string): Promise<void>;
    /** Show a native directory picker, or `null` if cancelled/unsupported. */
    pickDirectory(opts?: PickOptions): Promise<string | null>;
    /** Show a native file picker, or `null` if cancelled/unsupported. */
    pickFile(opts?: PickOptions): Promise<string | null>;
    /** Open a URL in the host's default external handler (browser). No-op when unsupported. */
    openExternal(url: string): Promise<void>;
}
export type HostServicesOptions = Partial<HostServices>;
/**
 * Build a `HostServices` with sensible headless defaults, overriding only the
 * capabilities a particular host can provide. Native pickers resolve to `null`
 * (callers treat that as "cancelled"), trashing falls back to a permanent
 * delete, and external-open is a no-op.
 */
export declare function defaultHostServices(overrides?: HostServicesOptions): HostServices;
