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
-   **Write Support:** Currently, Excalibur treats SVGs as read-only for extraction. To save changes, you must save as a `.excalidraw` file or use the upcoming Export feature.

### 3. `.excalidraw.png` (Embedded Scene)
Similar to SVG, Excalidraw PNGs can contain the scene data in a metadata chunk (usually `tEXt` or `zTXt`).

-   **Read Support:** (Planned) Extraction of embedded data from PNGs is on the roadmap. Currently, these files are listed but cannot be opened for editing.

## Safety & Integrity

-   **Path Validation:** All file operations are gated by the "Workspace" system. The application will refuse to read or write files outside of user-authorized directories.
-   **Schema Validation:** Every file read is validated against a Zod schema in the Main process to ensure the renderer never receives malformed or malicious payloads.
