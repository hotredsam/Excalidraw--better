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
exports.ShortcutStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile keyboard shortcut customization. Only *overrides* are persisted;
 * defaults live in shared `DEFAULT_SHORTCUTS`. Setting a binding that collides
 * with another command throws unless `force` is given (in which case the other
 * command keeps its binding and the new one wins at resolve-time — see
 * `acceleratorToCommand`).
 */
class ShortcutStore {
    file;
    bindings = [];
    constructor(profileDir) {
        this.file = path.join(profileDir, 'settings', 'shortcuts.json');
    }
    async init() {
        if (await fs.pathExists(this.file)) {
            try {
                this.bindings = shared_1.ShortcutMapSchema.parse(await fs.readJson(this.file)).bindings;
            }
            catch {
                this.bindings = [];
            }
        }
    }
    list() {
        return this.bindings;
    }
    async set(commandId, accelerator, force = false) {
        const conflict = (0, shared_1.findShortcutConflict)(this.bindings, commandId, accelerator);
        if (conflict && !force) {
            throw new Error(`"${accelerator}" is already bound to ${conflict}`);
        }
        this.bindings = [...this.bindings.filter((b) => b.commandId !== commandId), { commandId, accelerator }];
        await this.save();
        return this.bindings;
    }
    async reset(commandId) {
        this.bindings = commandId ? this.bindings.filter((b) => b.commandId !== commandId) : [];
        await this.save();
        return this.bindings;
    }
    async save() {
        await (0, fs_utils_1.writeJsonAtomic)(this.file, shared_1.ShortcutMapSchema.parse({ bindings: this.bindings }));
    }
}
exports.ShortcutStore = ShortcutStore;
