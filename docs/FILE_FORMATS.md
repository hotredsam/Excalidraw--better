# Excalibur File Formats

Excalibur is designed to be 100% compatible with the official Excalidraw formats while providing robust local-first handling.

## Supported Formats

### 1. `.excalidraw` (Standard)
The primary format for Excalidraw scenes. It is a JSON file containing all elements, application state, and embedded assets.

-   **Preservation Policy:** Excalibur uses a "tolerant schema" approach. When opening or saving `.excalidraw` files, we strictly validate the core fields (`elements`, `appState`) but **preserve all unknown top-level and nested fields**. This ensures forward-compatibility with future Excalidraw features and preserves custom metadata added by other tools.
-   **Atomic Writes:** All saves are performed atomically (write-to-temp then rename) to prevent file corruption during power loss or crashes.

### 2. `.excalidraw.svg` (Embedded Scene)
Excalidraw allows exporting SVGs that contain the full scene data embedded within an XML comment.

-   **Read Support:** Excalibur can extract the embedded JSON from `.excalidraw.svg` files and open them directly in the canvas.
-   **Write Support:** Export now produces SVGs with the scene embedded as a single-line `<!-- excalidraw-state: … -->` comment, so exported SVGs re-open in the editor. Exports land in `<workspace>/exports/`.

### 3. `.excalidraw.png` (Embedded Scene)
Excalidraw PNGs contain the scene data in a metadata chunk.

-   **Read Support:** Excalibur supports extracting embedded scene data from `.png` files. It looks for the `Excalidraw` or `comment` keyword in `tEXt` or `zTXt` (compressed) chunks.
-   **Write Support:** Export embeds the scene into a `tEXt` chunk (keyword `excalidraw`) so exported PNGs round-trip back into the editor. Re-exporting replaces the existing chunk rather than duplicating it.

## Safety & Integrity

-   **Path Validation:** All file operations are gated by the "Workspace" system. The application will refuse to read or write files outside of user-authorized directories.
-   **Schema Validation:** Every file read is validated against a Zod schema in the Main process to ensure the renderer never receives malformed or malicious payloads.
