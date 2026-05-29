# Excalibur Execution Plan

> Status legend: ✅ done · 🟡 partial · ⬜ not started

## Phase 0: Architecture & Setup ✅
- [x] Clone upstream Excalidraw for reference.
- [x] Map architecture and decide integration strategy (React embed).
- [x] Define `ARCHITECTURE.md` and `PLAN.md`.

## Phase 1: Electron Scaffold & Security ✅
- [x] Initialize monorepo structure (`app`, `ui`, `packages`).
- [x] Setup Electron Main, Preload, and Renderer (Vite + React + TS).
- [x] Configure strict security settings (`contextIsolation`, `nodeIntegration`, sandbox).
- [x] Establish Zod-validated IPC channel.
- [x] Create basic window shell with Discord-like dark styling.

## Phase 2: Excalidraw Integration ✅
- [x] Install `@excalidraw/excalidraw` in Renderer.
- [x] Embed `<Excalidraw />` component with custom wrapper.
- [x] State syncing (get scene elements, update scene, files).
- [x] `.excalidraw` / `.svg` / `.png` read compatibility.
- [x] Scene-embedded **export** to PNG / SVG / JSON.

## Phase 3: Multi-User Profiles & Filesystem ✅
- [x] Profile Manager in Main (create, switch, delete, store in `%APPDATA%`).
- [x] Profile Switcher UI in top bar.
- [x] Secure Filesystem API in Main (read/write/list bounded to workspace).
- [x] File Explorer panel in UI (browse, open, save, folder navigation).
- [x] Rename / move / copy / create file & folder (path-safe).
- [x] Local search (name + embedded text + tags) with per-file tagging.

## Phase 4: Plugin System ✅
- [x] Shared `PluginManifest` / contribution schema.
- [x] PluginManager in Main (load manifest, validate, permissions, enablement).
- [x] Plugin Manager UI (list, enable/disable, install-from-folder, uninstall).
- [x] First-party plugins: `quick-export-presets`, `templates-system`.

## Phase 5: AI Import Pipeline ✅
- [x] AI Import Lane UI (drag & drop, paste).
- [x] Payload parsing (JSON + `TYPE:` text) and Zod schema validation.
- [x] Preview / summary before apply.
- [x] Safe application of settings / templates / plugin scaffolds / docs.

## Phase 6: First-Party Plugins & Polish ✅
- [x] Templates & export-preset plugins.
- [x] Apply styling from `design_tokens.md` (tokens, gradient, toasts).
- [x] `docs/AI_GUIDE.md` for users.

## Phase 7: Testing & Packaging ✅
- [x] Unit + acceptance tests across main-process subsystems (98 tests).
- [x] `electron-builder` config + `dist` scripts (win nsis + portable, mac, linux).
- [x] End-to-end harness: Playwright Electron smoke specs (`e2e/`) run under xvfb in CI.
- [x] Acceptance integration test mirroring Product Spec §10.
- [x] GitHub Actions: `ci.yml` (build/lint/test/E2E) + `release.yml` (installer matrix).
- [x] `pnpm lint` (type-check) green across all packages.
- [ ] Code-signing of the Windows installer (requires certs/secrets — CI is wired,
      signing is intentionally left to the maintainer).

## Phase 8: Power features (beyond the original plan) ✅
- [x] Recent files (per profile), versioned backups on save, restore.
- [x] Local search index (name + embedded text + tags) and tagging.
- [x] Library pack browser (`.excalidrawlib` import/export/insert).
- [x] Presentation mode (frames → slides + presenter notes).
- [x] Review mode (local comment pins).
- [x] Workspace stats dashboard.
- [x] Optional git helper (status/commit/log).
- [x] Markdown embed/export, image import.
- [x] Command palette (Ctrl+K) and bulk file operations.
