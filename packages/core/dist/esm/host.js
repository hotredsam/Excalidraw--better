import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
/**
 * Build a `HostServices` with sensible headless defaults, overriding only the
 * capabilities a particular host can provide. Native pickers resolve to `null`
 * (callers treat that as "cancelled"), trashing falls back to a permanent
 * delete, and external-open is a no-op.
 */
export function defaultHostServices(overrides = {}) {
    const userDataDir = overrides.userDataDir ?? path.join(os.homedir(), '.excalibur');
    return {
        userDataDir,
        builtinPluginsDir: overrides.builtinPluginsDir ?? path.join(userDataDir, 'builtin-plugins'),
        appVersion: overrides.appVersion ?? '0.0.0',
        platform: overrides.platform ?? process.platform,
        trashItem: overrides.trashItem ?? (async (targetPath) => { await fs.remove(targetPath); }),
        pickDirectory: overrides.pickDirectory ?? (async () => null),
        pickFile: overrides.pickFile ?? (async () => null),
        openExternal: overrides.openExternal ?? (async () => { }),
    };
}
