import { Review } from '@excalibur/shared';
/**
 * Local-only "review mode": comment pins anchored to canvas coordinates, stored
 * per drawing under `<workspace>/.excalibur/reviews/`. No cloud, no realtime —
 * just durable annotations a single user (or sequential reviewers sharing the
 * folder) can leave on a drawing.
 */
export declare class ReviewStore {
    private workspacePath;
    constructor(workspacePath: string);
    private fileFor;
    get(filePath: string): Promise<Review>;
    private save;
    addPin(filePath: string, x: number, y: number, author: string, body: string): Promise<Review>;
    addComment(filePath: string, pinId: string, author: string, body: string): Promise<Review>;
    setResolved(filePath: string, pinId: string, resolved: boolean): Promise<Review>;
    deletePin(filePath: string, pinId: string): Promise<Review>;
}
