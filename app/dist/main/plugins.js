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
exports.PluginManager = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile plugin manager.
 *
 * Plugins are *declarative* manifests (`plugin.json`) describing contributions
 * the host renders/executes. Built-in plugins ship with the app and live in a
 * read-only directory; user plugins are installed (copied) into the profile's
 * `plugins/` folder. Enablement state is stored per profile so each user has an
 * independent plugin set. Manifests are validated and permissions recorded; the
 * host only ever acts on contributions of *enabled* plugins.
 */
class PluginManager {
    builtinDir;
    pluginsDir;
    stateFile;
    state = { enabled: {}, installedAt: {} };
    constructor(profileDir, builtinDir = null) {
        this.builtinDir = builtinDir;
        this.pluginsDir = path.join(profileDir, 'plugins');
        this.stateFile = path.join(profileDir, 'settings', 'plugins.json');
    }
    async init() {
        await fs.ensureDir(this.pluginsDir);
        if (await fs.pathExists(this.stateFile)) {
            try {
                this.state = { enabled: {}, installedAt: {}, ...(await fs.readJson(this.stateFile)) };
            }
            catch {
                this.state = { enabled: {}, installedAt: {} };
            }
        }
    }
    async readManifest(dir) {
        const manifestPath = path.join(dir, 'plugin.json');
        if (!(await fs.pathExists(manifestPath)))
            return null;
        try {
            const raw = await fs.readJson(manifestPath);
            return shared_1.PluginManifestSchema.parse(raw);
        }
        catch {
            return null;
        }
    }
    async scanDir(dir, builtIn) {
        if (!dir || !(await fs.pathExists(dir)))
            return [];
        const items = await fs.readdir(dir, { withFileTypes: true });
        const out = [];
        for (const item of items) {
            if (!item.isDirectory())
                continue;
            const manifest = await this.readManifest(path.join(dir, item.name));
            if (!manifest)
                continue;
            out.push({
                ...manifest,
                builtIn,
                enabled: this.state.enabled[manifest.id] ?? builtIn, // built-ins default on
                installedAt: this.state.installedAt[manifest.id] ?? 0,
            });
        }
        return out;
    }
    async list() {
        const builtin = await this.scanDir(this.builtinDir || '', true);
        const user = await this.scanDir(this.pluginsDir, false);
        // User plugins override built-ins with the same id.
        const byId = new Map();
        for (const p of builtin)
            byId.set(p.id, p);
        for (const p of user)
            byId.set(p.id, p);
        return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
    }
    async installFromFolder(srcDir) {
        const manifest = await this.readManifest(srcDir);
        if (!manifest) {
            throw new Error('No valid plugin.json found in the selected folder');
        }
        const dest = path.join(this.pluginsDir, manifest.id);
        await fs.ensureDir(this.pluginsDir);
        await fs.copy(srcDir, dest, { overwrite: true });
        this.state.installedAt[manifest.id] = Date.now();
        this.state.enabled[manifest.id] = true;
        await this.save();
        return {
            ...manifest,
            builtIn: false,
            enabled: true,
            installedAt: this.state.installedAt[manifest.id],
        };
    }
    async setEnabled(id, enabled) {
        this.state.enabled[id] = enabled;
        await this.save();
    }
    async uninstall(id) {
        const dir = path.join(this.pluginsDir, id);
        if (await fs.pathExists(dir)) {
            await fs.remove(dir);
        }
        else {
            throw new Error('Built-in plugins cannot be uninstalled (you can disable them)');
        }
        delete this.state.enabled[id];
        delete this.state.installedAt[id];
        await this.save();
    }
    /** Aggregate contributions from all enabled plugins. */
    async getContributions() {
        const plugins = await this.list();
        const merged = { toolbar: [], commands: [], panels: [], exportPresets: [] };
        const sourcePluginIds = {};
        for (const p of plugins) {
            if (!p.enabled)
                continue;
            for (const t of p.contributes.toolbar) {
                merged.toolbar.push(t);
                sourcePluginIds[t.id] = p.id;
            }
            for (const c of p.contributes.commands) {
                merged.commands.push(c);
                sourcePluginIds[c.id] = p.id;
            }
            for (const panel of p.contributes.panels)
                merged.panels.push(panel);
            for (const preset of p.contributes.exportPresets) {
                merged.exportPresets.push(preset);
                sourcePluginIds[preset.id] = p.id;
            }
        }
        return { ...merged, sourcePluginIds };
    }
    async save() {
        await (0, fs_utils_1.writeJsonAtomic)(this.stateFile, this.state);
    }
}
exports.PluginManager = PluginManager;
