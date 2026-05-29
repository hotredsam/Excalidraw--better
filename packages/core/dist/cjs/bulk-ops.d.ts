import { BulkRenameOptions, BulkResult } from '@excalibur/shared';
export declare function bulkRename(workspacePath: string, files: string[], opts: BulkRenameOptions): Promise<BulkResult>;
export declare function bulkDelete(workspacePath: string, files: string[], deleter?: (p: string) => Promise<void>): Promise<BulkResult>;
export declare function bulkMove(workspacePath: string, files: string[], destDir: string): Promise<BulkResult>;
