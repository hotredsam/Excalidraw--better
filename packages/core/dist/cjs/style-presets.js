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
exports.StylePresetStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile element-style presets, stored at
 * `<profile>/settings/style-presets.json`.
 */
class StylePresetStore {
    file;
    presets = [];
    constructor(profileDir) {
        this.file = path.join(profileDir, 'settings', 'style-presets.json');
    }
    async init() {
        if (await fs.pathExists(this.file)) {
            try {
                this.presets = shared_1.StylePresetListSchema.parse(await fs.readJson(this.file)).presets;
            }
            catch {
                this.presets = [];
            }
        }
    }
    list() {
        return this.presets;
    }
    async save(input) {
        const id = input.id || (0, nanoid_1.nanoid)(8);
        const preset = { ...input, id };
        this.presets = [...this.presets.filter((p) => p.id !== id), preset];
        await this.persist();
        return preset;
    }
    async remove(id) {
        this.presets = this.presets.filter((p) => p.id !== id);
        await this.persist();
    }
    async persist() {
        await (0, fs_utils_1.writeJsonAtomic)(this.file, shared_1.StylePresetListSchema.parse({ presets: this.presets }));
    }
}
exports.StylePresetStore = StylePresetStore;
