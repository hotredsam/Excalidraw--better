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
const electron_1 = require("electron");
const fs_utils_1 = require("./fs-utils");
class PluginManager {
    pluginsDir;
    configFile;
    plugins = [];
    loadedPlugins = new Map();
    constructor(profileDir) {
        this.pluginsDir = path.join(profileDir, 'plugins');
        this.configFile = path.join(profileDir, 'settings', 'plugins.json');
    }
    async init() {
        await fs.ensureDir(this.pluginsDir);
        // Load enabled/disabled state
        let pluginStates = {};
        if (await fs.pathExists(this.configFile)) {
            pluginStates = await fs.readJson(this.configFile);
        }
        // Scan directories
        const items = await fs.readdir(this.pluginsDir, { withFileTypes: true });
        const discovered = [];
        for (const item of items) {
            if (item.isDirectory()) {
                const manifestPath = path.join(this.pluginsDir, item.name, 'manifest.json');
                if (await fs.pathExists(manifestPath)) {
                    try {
                        const manifest = await fs.readJson(manifestPath);
                        const info = {
                            id: manifest.id || item.name,
                            name: manifest.name || item.name,
                            version: manifest.version || '0.0.0',
                            description: manifest.description,
                            author: manifest.author,
                            enabled: pluginStates[manifest.id] ?? false,
                            path: path.join(this.pluginsDir, item.name),
                        };
                        discovered.push(info);
                        if (info.enabled) {
                            await this.loadPlugin(info, manifest.entry);
                        }
                    }
                    catch (err) {
                        console.error(`Failed to load manifest for plugin ${item.name}:`, err);
                    }
                }
            }
        }
        this.plugins = discovered;
    }
    async list() {
        return this.plugins;
    }
    async setEnabled(id, enabled) {
        const plugin = this.plugins.find(p => p.id === id);
        if (!plugin)
            throw new Error(`Plugin ${id} not found`);
        if (plugin.enabled === enabled)
            return;
        plugin.enabled = enabled;
        await this.saveStates();
        if (enabled) {
            const manifestPath = path.join(plugin.path, 'manifest.json');
            const manifest = await fs.readJson(manifestPath);
            await this.loadPlugin(plugin, manifest.entry);
        }
        else {
            await this.unloadPlugin(id);
        }
    }
    async loadPlugin(info, entry) {
        const entryPath = path.isAbsolute(entry) ? entry : path.join(info.path, entry);
        try {
            // Use dynamic import for ESM or require for CJS
            // For foundation, we'll try to load the module
            const pluginModule = require(entryPath);
            const pluginInstance = pluginModule.default || pluginModule;
            const ctx = {
                version: electron_1.app.getVersion(),
                platform: process.platform,
            };
            if (typeof pluginInstance.onLoad === 'function') {
                await pluginInstance.onLoad(ctx);
            }
            this.loadedPlugins.set(info.id, pluginInstance);
            console.log(`Plugin loaded: ${info.name} (${info.id})`);
        }
        catch (err) {
            console.error(`Failed to load plugin entry ${entryPath}:`, err);
            info.enabled = false;
            await this.saveStates();
        }
    }
    async unloadPlugin(id) {
        const instance = this.loadedPlugins.get(id);
        if (instance && typeof instance.onUnload === 'function') {
            try {
                await instance.onUnload();
            }
            catch (err) {
                console.error(`Error during plugin unload (${id}):`, err);
            }
        }
        this.loadedPlugins.delete(id);
        console.log(`Plugin unloaded: ${id}`);
    }
    async saveStates() {
        const states = this.plugins.reduce((acc, p) => {
            acc[p.id] = p.enabled;
            return acc;
        }, {});
        await (0, fs_utils_1.writeJsonAtomic)(this.configFile, states);
    }
}
exports.PluginManager = PluginManager;
