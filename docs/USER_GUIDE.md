# Excalibur User Guide

## Getting started
1. Pick or create a **profile** (top-right switcher). Each profile has its own
   settings, vault, templates, libraries and plugin set.
2. Click **+** in the sidebar to open a folder as a **workspace**.
3. Click a file to open it, or **+ Drawing** to create one.

## Keyboard shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Command palette |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Shift + S` | Save As |
| `Ctrl/Cmd + N` | New drawing |
| `Ctrl/Cmd + P` | Export (Properties panel) |
| `Ctrl/Cmd + F` | Focus search |
| `Ctrl/Cmd + Shift + P` | Plugins panel |
| `Ctrl/Cmd + I` | AI Import panel |
| Arrows / `Esc` | Navigate / exit presentation |

## Panels (right drawer)
- **Properties** — file info, tags, export presets.
- **Recent** — recently opened files (per profile).
- **Templates** — insert a template as a new drawing, or save the current canvas.
- **Libraries** — import `.excalidrawlib` packs, insert items, save a selection.
- **Review** — leave comment pins, reply, resolve (local-only).
- **Stats** — workspace dashboard.
- **Git** — status/commit for git-backed workspaces.
- **Plugins** — enable/disable, install-from-folder, uninstall.
- **AI** — paste/drop a payload to extend the app.

## Files & safety
- Delete sends files to the OS Recycle Bin.
- Each save keeps a versioned backup (configurable in Settings → History).
- File operations are restricted to your authorized workspace folders.

## Exporting
From **Properties → Export** (or the command palette / Quick Export Presets
plugin) you can export PNG (1x/3x), SVG, JSON, or a Markdown bundle. Exports are
written to `<workspace>/exports/` with the Excalidraw scene embedded so they
re-open in the editor.

## Presentation
Add **frames** to your drawing, then run **Start presentation** (command palette
or the Presentation plugin). Frames become slides in reading order; add
presenter notes per slide.
