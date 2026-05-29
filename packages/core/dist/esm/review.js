import * as path from 'path';
import * as fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { ReviewSchema } from '@excalibur/shared';
import { isPathWithin } from './path-utils';
import { writeJsonAtomic } from './fs-utils';
/**
 * Local-only "review mode": comment pins anchored to canvas coordinates, stored
 * per drawing under `<workspace>/.excalibur/reviews/`. No cloud, no realtime —
 * just durable annotations a single user (or sequential reviewers sharing the
 * folder) can leave on a drawing.
 */
export class ReviewStore {
    workspacePath;
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
    }
    fileFor(filePath) {
        if (!isPathWithin(this.workspacePath, filePath)) {
            throw new Error('Access denied: Path outside workspace');
        }
        const rel = path.relative(this.workspacePath, filePath).replace(/[\\/]/g, '__');
        return path.join(this.workspacePath, '.excalibur', 'reviews', `${rel}.json`);
    }
    async get(filePath) {
        const f = this.fileFor(filePath);
        if (await fs.pathExists(f)) {
            try {
                return ReviewSchema.parse(await fs.readJson(f));
            }
            catch {
                return { pins: [] };
            }
        }
        return { pins: [] };
    }
    async save(filePath, review) {
        await writeJsonAtomic(this.fileFor(filePath), review);
        return review;
    }
    async addPin(filePath, x, y, author, body) {
        const review = await this.get(filePath);
        const pin = {
            id: nanoid(8),
            x,
            y,
            resolved: false,
            comments: body ? [{ id: nanoid(8), author, body, createdAt: Date.now() }] : [],
        };
        review.pins.push(pin);
        return this.save(filePath, review);
    }
    async addComment(filePath, pinId, author, body) {
        const review = await this.get(filePath);
        const pin = review.pins.find((p) => p.id === pinId);
        if (!pin)
            throw new Error('Pin not found');
        pin.comments.push({ id: nanoid(8), author, body, createdAt: Date.now() });
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
