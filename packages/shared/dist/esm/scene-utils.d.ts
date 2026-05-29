/** Helpers for inspecting and manipulating Excalidraw scenes (pure). */
export interface SceneSummary {
    total: number;
    visible: number;
    deleted: number;
    byType: Record<string, number>;
    hasFrames: boolean;
    textLength: number;
}
export declare function countElementsByType(scene: any): Record<string, number>;
export declare function stripDeleted(scene: any): any;
export declare function isEmptyScene(scene: any): boolean;
export declare function sceneSummary(scene: any): SceneSummary;
/** Merge two scenes' elements and files (b appended after a). */
export declare function mergeScenes(a: any, b: any): any;
/** Produce a blank scene shell. */
export declare function blankScene(source?: string): any;
