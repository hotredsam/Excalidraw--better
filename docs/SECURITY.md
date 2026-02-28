# Workspace Security

## Threat Model: Local File Access

Excalibur allows users to open local folders as "Workspaces". This introduces risks if the renderer process were compromised.

### Mitigations

1.  **Main Process Mediation:** The renderer NEVER has direct access to the `fs` module. All file operations are performed by the main process via IPC.
2.  **Path Validation:** Every file read/write request is validated in the main process.
    -   `isPathWithin(workspacePath, targetPath)`: Ensures the target file is strictly inside the authorized workspace directory.
    -   Prevents `../../etc/passwd` style path traversal attacks.
3.  **Dangerous Path Blocklist:** Explicitly blocks access to sensitive system directories (e.g., `C:\Windows`, `C:\Program Files`).
4.  **No Raw Paths in Renderer:** The renderer only receives file metadata and content. It never constructs paths manually for execution.
5.  **Recycle Bin Deletion:** The `DELETE_FILE` operation uses `shell.trashItem` (Electron API) instead of a destructive `fs.remove`, allowing users to recover accidentally deleted files.

## IPC Safety

All IPC messages use Zod schemas for validation in the Main process to prevent malformed or malicious payloads from triggering unexpected behavior.
