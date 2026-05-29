# Quick Export Presets (first-party)

Adds one-click export presets and a **Batch Export** toolbar action to Excalibur.

Presets contributed:

| Preset    | Format | Scale | Notes                       |
|-----------|--------|-------|-----------------------------|
| `web`     | PNG    | 1x    | Embedded scene, transparent-aware |
| `print`   | PNG    | 3x    | High-DPI for print          |
| `vector`  | SVG    | 1x    | Scalable, embedded scene    |
| `archival`| JSON   | 1x    | Raw `.excalidraw` snapshot  |

Output is written into `<workspace>/exports/` with safe, templated names
(`{name}` / `{preset}`), and all target paths are validated against the
workspace boundary by the host before writing.

This is a **declarative** plugin: the manifest lists its contributions and the
Excalibur host renders the toolbar button / commands and runs the export using
Excalidraw's own export utilities (so output stays fully Excalidraw-compatible).
