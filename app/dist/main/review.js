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
exports.ReviewStore = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const nanoid_1 = require("nanoid");
const shared_1 = require("@excalibur/shared");
const path_utils_1 = require("./path-utils");
const fs_utils_1 = require("./fs-utils");
/**
 * Local-only "review mode": comment pins anchored to canvas coordinates, stored
 * per drawing under `<workspace>/.excalibur/reviews/`. No cloud, no realtime —
 * just durable annotations a single user (or sequential reviewers sharing the
 * folder) can leave on a drawing.
 */
class ReviewStore {
    workspacePath;
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
    }
    fileFor(filePath) {
        if (!(0, path_utils_1.isPathWithin)(this.workspacePath, filePath)) {
            throw new Error('Access denied: Path outside workspace');
        }
        const rel = path.relative(this.workspacePath, filePath).replace(/[\\/]/g, '__');
        return path.join(this.workspacePath, '.excalibur', 'reviews', `${rel}.json`);
    }
    async get(filePath) {
        const f = this.fileFor(filePath);
        if (await fs.pathExists(f)) {
            try {
                return shared_1.ReviewSchema.parse(await fs.readJson(f));
            }
            catch {
                return { pins: [] };
            }
        }
        return { pins: [] };
    }
    async save(filePath, review) {
        await (0, fs_utils_1.writeJsonAtomic)(this.fileFor(filePath), review);
        return review;
    }
    async addPin(filePath, x, y, author, body) {
        const review = await this.get(filePath);
        const pin = {
            id: (0, nanoid_1.nanoid)(8),
            x,
            y,
            resolved: false,
            comments: body ? [{ id: (0, nanoid_1.nanoid)(8), author, body, createdAt: Date.now() }] : [],
        };
        review.pins.push(pin);
        return this.save(filePath, review);
    }
    async addComment(filePath, pinId, author, body) {
        const review = await this.get(filePath);
        const pin = review.pins.find((p) => p.id === pinId);
        if (!pin)
            throw new Error('Pin not found');
        pin.comments.push({ id: (0, nanoid_1.nanoid)(8), author, body, createdAt: Date.now() });
        return this.save(filePath, review);
    }
    async setResolved(filePath, pinId, resolved) {
        const review = await this.get(filePath);
        const pin = review.pins.find((p) => p.id === pinId);
        if (!pin)
            throw new Error('Pin not found');
        pin.resolved = resolved;
        return this.save(filePath, review);
    }
    async deletePin(filePath, pinId) {
        const review = await this.get(filePath);
        review.pins = review.pins.filter((p) => p.id !== pinId);
        return this.save(filePath, review);
    }
}
exports.ReviewStore = ReviewStore;
