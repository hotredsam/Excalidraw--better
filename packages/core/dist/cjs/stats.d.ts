import { WorkspaceStats, FileTags } from '@excalibur/shared';
/**
 * Compute aggregate statistics for a workspace: file counts by type, total
 * bytes, total element count across `.excalidraw` scenes, a tag histogram, and
 * "largest"/"recently modified" leaderboards for a dashboard view.
 */
export declare function computeStats(workspacePath: string, tags?: FileTags): Promise<WorkspaceStats>;
