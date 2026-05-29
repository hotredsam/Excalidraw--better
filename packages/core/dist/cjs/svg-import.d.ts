export interface SvgImportResult {
    elements: any[];
    skipped: number;
}
export declare function parseSvgToElements(svg: string): SvgImportResult;
