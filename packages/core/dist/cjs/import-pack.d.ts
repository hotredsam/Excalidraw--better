export interface ImageInsertion {
    file: {
        id: string;
        dataURL: string;
        mimeType: string;
        created: number;
    };
    element: Record<string, any>;
    mimeType: string;
}
export declare function mimeForExt(ext: string): string | null;
export declare function buildImageInsertion(absPath: string, opts?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}): Promise<ImageInsertion>;
