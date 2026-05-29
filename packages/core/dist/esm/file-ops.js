import * as path from 'path';
import * as fs from 'fs-extra';
import { isPathWithin, isWithinWorkspace, isDangerousPath, isSafeName } from './path-utils';
/**
 * Local file-management operations, all bounded to a workspace directory.
 *
 * Every operation re-validates that source and destination resolve *inside* the
 * authorized workspace and are not dangerous system paths. The renderer never
 * passes raw `fs` handles — only ids/paths that are checked here.
 */
/** Assert a directory target is the workspace root or a descendant of it. */
function assertDir(workspacePath, target) {
    if (!isWithinWorkspace(workspacePath, target)) {
        throw new Error('Access denied: Path outside workspace');
    }
    if (isDangerousPath(target)) {
        throw new Error('Access denied: Dangerous path');
    }
}
/** Assert a file target is strictly inside the workspace (not the root itself). */
function assertWithin(workspacePath, target) {
    if (!isPathWithin(workspacePath, target)) {
        throw new Error('Access denied: Path outside workspace');
    }
    if (isDangerousPath(target)) {
        throw new Error('Access denied: Dangerous path');
    }
}
/** Rename a file/folder in place (same directory, new name). */
export async function renameEntry(workspacePath, filePath, newName) {
    assertWithin(workspacePath, filePath);
    if (!isSafeName(newName)) {
        throw new Error(`Invalid name: "${newName}"`);
    }
    const dir = path.dirname(filePath);
    const dest = path.join(dir, newName);
    assertWithin(workspacePath, dest);
    if (await fs.pathExists(dest)) {
        throw new Error(`A file named "${newName}" already exists`);
    }
    await fs.move(filePath, dest);
    return { path: dest };
}
/** Move a file/folder into another directory within the workspace. */
export async function moveEntry(workspacePath, filePath, destDir) {
    assertWithin(workspacePath, filePath);
    assertDir(workspacePath, destDir);
    const dest = path.join(destDir, path.basename(filePath));
    assertWithin(workspacePath, dest);
    if (await fs.pathExists(dest)) {
        throw new Error('Destination already contains a file with that name');
    }
    await fs.ensureDir(destDir);
    await fs.move(filePath, dest);
    return { path: dest };
}
/** Copy a file/folder, auto-suffixing the name if a collision occurs. */
export async function copyEntry(workspacePath, filePath, destDir) {
    assertWithin(workspacePath, filePath);
    const targetDir = destDir ?? path.dirname(filePath);
    assertDir(workspacePath, targetDir);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    let candidate = path.join(targetDir, `${base} copy${ext}`);
    let n = 2;
    while (await fs.pathExists(candidate)) {
        candidate = path.join(targetDir, `${base} copy ${n}${ext}`);
        n++;
    }
    assertWithin(workspacePath, candidate);
    await fs.copy(filePath, candidate);
    return { path: candidate };
}
/** Create a new blank `.excalidraw` file. */
export async function createExcalidrawFile(workspacePath, dir, name) {
    assertDir(workspacePath, dir);
    let fileName = name;
    if (!fileName.toLowerCase().endsWith('.excalidraw')) {
        fileName = `${fileName}.excalidraw`;
    }
    if (!isSafeName(fileName)) {
        throw new Error(`Invalid file name: "${fileName}"`);
    }
    const dest = path.join(dir, fileName);
    assertWithin(workspacePath, dest);
    if (await fs.pathExists(dest)) {
        throw new Error(`"${fileName}" already exists`);
    }
    const blank = {
        type: 'excalidraw',
        version: 2,
        source: 'excalibur',
        elements: [],
        appState: {},
        files: {},
    };
    await fs.ensureDir(dir);
    await fs.writeJson(dest, blank, { spaces: 2 });
    return { path: dest };
}
/** Create a new folder. */
export async function createFolder(workspacePath, dir, name) {
    assertDir(workspacePath, dir);
    if (!isSafeName(name)) {
        throw new Error(`Invalid folder name: "${name}"`);
    }
    const dest = path.join(dir, name);
    assertWithin(workspacePath, dest);
    if (await fs.pathExists(dest)) {
        throw new Error(`"${name}" already exists`);
    }
    await fs.ensureDir(dest);
    return { path: dest };
}
