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

## Phase 7: Testing & Packaging 🟡
- [x] Unit tests across main-process subsystems (58 tests).
- [x] `electron-builder` config + `dist` scripts (win nsis + portable, mac, linux).
- [ ] End-to-end (Playwright/Spectron) tests — not yet wired.
- [ ] Produce a signed Windows installer in CI.
