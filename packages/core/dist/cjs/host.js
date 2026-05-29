"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultHostServices = defaultHostServices;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
/**
 * Build a `HostServices` with sensible headless defaults, overriding only the
 * capabilities a particular host can provide. Native pickers resolve to `null`
 * (callers treat that as "cancelled"), trashing falls back to a permanent
 * delete, and external-open is a no-op.
 */
function defaultHostServices(overrides = {}) {
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
