/**
 * Validates if a target path is strictly within a base directory.
 * Prevents path traversal (../../) and outside-access.
 */
export declare function isPathWithin(baseDir: string, targetPath: string): boolean;
/**
 * Like {@link isPathWithin} but also accepts the base directory itself. Used for
 * directory-targeting operations (e.g. "create a file in the workspace root"),
 * where the workspace root is a legitimate, authorized location.
 */
export declare function isWithinWorkspace(baseDir: string, targetPath: string): boolean;
/**
 * Checks if a path is considered "dangerous" (e.g. System32, Program Files).
 *
 * Comparison is done on a forward-slash-normalized, lower-cased path so that the
 * blocklist matches regardless of backslash vs. slash separators on Windows.
 */
export declare function isDangerousPath(targetPath: string): boolean;
/**
 * Validates a single path segment (a file or folder name). Rejects empty names,
 * path separators, traversal, reserved device names, and illegal characters so
 * that user/AI-supplied names cannot escape their intended directory.
 * Spaces and hyphens inside a name are permitted.
 */
export declare function isSafeName(name: string): boolean;
/** Sanitize an arbitrary string into a safe filename segment. */
export declare function sanitizeName(name: string): string;
