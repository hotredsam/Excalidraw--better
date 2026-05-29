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
exports.TemplateStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
const fs_utils_1 = require("./fs-utils");
/**
 * Per-profile template store. Templates are `.json` scenes living under
 * `<profile>/templates/`. The Templates first-party plugin and the AI Import
 * Lane both populate this folder; the UI lets users insert a template as a new
 * drawing or save the current canvas as a template.
 */
class TemplateStore {
    dir;
    constructor(profileDir) {
        this.dir = path.join(profileDir, 'templates');
    }
    async init() {
        await fs.ensureDir(this.dir);
    }
    async list() {
        await this.init();
        const items = await fs.readdir(this.dir);
        const out = [];
        for (const file of items) {
            if (!file.endsWith('.json'))
                continue;
            try {
                const raw = await fs.readJson(path.join(this.dir, file));
                const tpl = shared_1.StoredTemplateSchema.parse(raw);
                out.push({ id: tpl.id, title: tpl.title, description: tpl.description, tags: tpl.tags });
            }
            catch {
                // skip malformed template
            }
        }
        return out.sort((a, b) => a.title.localeCompare(b.title));
    }
    async get(id) {
        const file = path.join(this.dir, `${(0, path_utils_1.sanitizeName)(id)}.json`);
        if (!(await fs.pathExists(file)))
            throw new Error(`Template "${id}" not found`);
        return shared_1.StoredTemplateSchema.parse(await fs.readJson(file));
    }
    async save(input) {
        await this.init();
        const id = (0, path_utils_1.sanitizeName)(input.id || input.title).toLowerCase().replace(/\s+/g, '-');
        const tpl = shared_1.StoredTemplateSchema.parse({
            id,
            title: input.title,
            description: input.description || '',
            tags: input.tags || [],
            scene: input.scene || {},
        });
        await (0, fs_utils_1.writeJsonAtomic)(path.join(this.dir, `${id}.json`), tpl);
        return { id: tpl.id, title: tpl.title, description: tpl.description, tags: tpl.tags };
    }
}
exports.TemplateStore = TemplateStore;
