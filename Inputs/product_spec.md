\# Product Spec — Excalidraw Electron (Multi-user + Local File Control)



\## 0. One-liner

Build a Windows-first Electron desktop app based on Excalidraw that adds multi-user profiles, a file-explorer with full local file ops, a plugin system, and an AI-import lane for extending the app.



\## 1. Goals (must ship)

\- Excalidraw compatibility: open/save/export must remain compatible with:

&nbsp; - .excalidraw (JSON)

&nbsp; - .excalidraw.png (PNG with embedded scene)

&nbsp; - .excalidraw.svg (SVG with embedded scene)

\- Multi-user profiles on one PC:

&nbsp; - Separate settings, recent files, libraries, templates, and plugin enablement per profile

&nbsp; - Easy profile switcher UI

\- Full local file control:

&nbsp; - Open folder as a “workspace”

&nbsp; - Browse/search files, open, save, save-as

&nbsp; - Rename/move/copy/delete (with confirmations)

&nbsp; - Bulk actions (rename/export/delete) with safety guardrails

\- Plugin system:

&nbsp; - Plugin manager UI (install from local folder/zip, enable/disable, update)

&nbsp; - Permissions model

\- AI Import Lane:

&nbsp; - Paste or drag/drop .txt/.json payloads

&nbsp; - Validate + preview/diff before applying

&nbsp; - Can generate plugin scaffolds/templates/libraries/docs updates

\- In-app User Guide for “AI can generate extensions” (copy/paste prompts + examples)



\## 2. Non-goals (explicitly not needed)

\- No mandatory cloud accounts

\- No paid services

\- No always-on internet requirement

\- No mobile apps



\## 3. Target platforms

\- Primary: Windows 11

\- Secondary (nice-to-have): macOS, Linux (only if low effort)



\## 4. UX requirements

\- Layout:

&nbsp; - Left sidebar: File Explorer + Search + Tags

&nbsp; - Center: Canvas (Excalidraw)

&nbsp; - Right drawer: Properties / Plugin panels / AI Import

\- Top bar:

&nbsp; - Profile switcher (create/delete/profile settings)

&nbsp; - Workspace selector (open folder)

&nbsp; - Save / Export buttons

\- Keyboard shortcuts:

&nbsp; - Ctrl+S save

&nbsp; - Ctrl+Shift+S save as

&nbsp; - Ctrl+O open file

&nbsp; - Ctrl+P export

\- Startup:

&nbsp; - Choose profile → last workspace optionally auto-open



\## 5. Multi-user behavior (define clearly)

\- Profiles are local-only (same Windows account).

\- Each profile has:

&nbsp; - Separate “vault folder” for drawings (default)

&nbsp; - Option to add multiple workspaces (folders)

\- Sharing:

&nbsp; - If two profiles open the same workspace folder, they can both access it.

&nbsp; - No live real-time collaboration required.



\## 6. Local file control scope

\- Allowed actions:

&nbsp; - Read/list/open

&nbsp; - Write/save

&nbsp; - Rename/move/copy/delete (explicit confirmations)

\- Safety:

&nbsp; - Trash/Recycle Bin behavior: delete goes to OS recycle bin if possible

&nbsp; - Never delete without a modal confirmation + file list preview

&nbsp; - Block dangerous paths by default (configurable): Windows system folders, Program Files, etc.



\## 7. Data storage locations (Windows)

\- App config root: %APPDATA%/<AppName>/

\- Profiles:

&nbsp; - %APPDATA%/<AppName>/profiles/<profileId>/

&nbsp; - subfolders:

&nbsp;   - settings/

&nbsp;   - libraries/

&nbsp;   - templates/

&nbsp;   - plugins/

&nbsp;   - index/ (search index)

&nbsp;   - vault/ (default drawings)



\## 8. Performance targets

\- Workspace with 10,000 drawings should still be usable:

&nbsp; - Background indexing

&nbsp; - Fast search (cached/indexed)

\- App should launch in < 5 seconds after first run.



\## 9. Packaging

\- Use electron-builder

\- Provide:

&nbsp; - installer exe

&nbsp; - portable zip (optional)



\## 10. Acceptance checklist

\- Create 2 profiles, each with different settings and plugin enablement

\- Open a workspace folder, create drawing, save, close, reopen

\- Export PNG/SVG/PDF with presets

\- Import SVG/PNG onto canvas

\- Drag/drop AI payload that generates a plugin scaffold and installs it

\- All tests pass + build produces installer

