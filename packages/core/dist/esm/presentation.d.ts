import { Slide, SlideDeck } from '@excalibur/shared';
export declare function buildDeck(scene: any): SlideDeck;
export declare function getDeck(workspacePath: string, fileRel: string, scene: any): Promise<SlideDeck>;
export declare function setSlideNotes(workspacePath: string, fileRel: string, slideId: string, notes: string): Promise<void>;
/** Compute an export viewport (with padding) for a single slide. */
export declare function slideViewport(slide: Slide, padding?: number): {
    x: number;
    y: number;
    width: number;
    height: number;
};
