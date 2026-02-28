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
exports.ProfileStore = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const shared_1 = require("@excalibur/shared");
const fs_utils_1 = require("./fs-utils");
class ProfileStore {
    baseDir;
    profilesFile;
    activeFile;
    profiles = [];
    activeProfileId = null;
    constructor() {
        this.baseDir = path.join(electron_1.app.getPath('userData'), 'profiles');
        this.profilesFile = path.join(this.baseDir, 'profiles.json');
        this.activeFile = path.join(this.baseDir, 'active.json');
    }
    async init() {
        await fs.ensureDir(this.baseDir);
        if (await fs.pathExists(this.profilesFile)) {
            const data = await fs.readJson(this.profilesFile);
            this.profiles = shared_1.ProfileListSchema.parse({ profiles: data }).profiles;
        }
        if (await fs.pathExists(this.activeFile)) {
            const data = await fs.readJson(this.activeFile);
            this.activeProfileId = data.activeId;
        }
        if (this.profiles.length === 0) {
            const defaultProfile = await this.create('Default');
            await this.setActive(defaultProfile.id);
        }
        else if (!this.activeProfileId || !this.profiles.find(p => p.id === this.activeProfileId)) {
            await this.setActive(this.profiles[0].id);
        }
    }
    async list() {
        return this.profiles;
    }
    async getActive() {
        return this.profiles.find(p => p.id === this.activeProfileId) || null;
    }
    async create(name) {
        const now = Date.now();
        const profile = {
            id: (0, nanoid_1.nanoid)(),
            name,
            createdAt: now,
            updatedAt: now,
            lastOpenedAt: now,
        };
        this.profiles.push(profile);
        await this.saveProfiles();
        await this.initProfileFolders(profile.id);
        return profile;
    }
    async rename(id, name) {
        const profile = this.profiles.find(p => p.id === id);
        if (!profile)
            throw new Error(`Profile ${id} not found`);
        profile.name = name;
        profile.updatedAt = Date.now();
        await this.saveProfiles();
        return profile;
    }
    async delete(id) {
        if (this.profiles.length <= 1)
            throw new Error('Cannot delete the only profile');
        this.profiles = this.profiles.filter(p => p.id !== id);
        if (this.activeProfileId === id) {
            this.activeProfileId = this.profiles[0].id;
            await this.saveActive();
        }
        await this.saveProfiles();
        // In production, we might want to move the folder to a "deleted" directory instead of immediate delete
        await fs.remove(path.join(this.baseDir, id));
    }
    async setActive(id) {
        const profile = this.profiles.find(p => p.id === id);
        if (!profile)
            throw new Error(`Profile ${id} not found`);
        this.activeProfileId = id;
        profile.lastOpenedAt = Date.now();
        await this.saveActive();
        await this.saveProfiles();
    }
    async saveProfiles() {
        await (0, fs_utils_1.writeJsonAtomic)(this.profilesFile, this.profiles);
    }
    async saveActive() {
        await (0, fs_utils_1.writeJsonAtomic)(this.activeFile, { activeId: this.activeProfileId });
    }
    async initProfileFolders(id) {
        const profileDir = path.join(this.baseDir, id);
        await fs.ensureDir(path.join(profileDir, 'settings'));
        await fs.ensureDir(path.join(profileDir, 'recents'));
        await fs.ensureDir(path.join(profileDir, 'vault'));
        await fs.ensureDir(path.join(profileDir, 'libraries'));
        await fs.ensureDir(path.join(profileDir, 'templates'));
        await fs.ensureDir(path.join(profileDir, 'plugins'));
        await fs.ensureDir(path.join(profileDir, 'index'));
    }
    getProfileDir(id) {
        return path.join(this.baseDir, id);
    }
}
exports.ProfileStore = ProfileStore;
