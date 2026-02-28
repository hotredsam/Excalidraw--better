# Excalibur Execution Plan

## Phase 0: Architecture & Setup (Current)
- [x] Clone upstream Excalidraw for reference.
- [x] Map architecture and decide integration strategy (React embed).
- [x] Define `ARCHITECTURE.md` and `PLAN.md`.

## Phase 1: Electron Scaffold & Security
- [ ] Initialize monorepo structure (`app`, `ui`, `packages`).
- [ ] Setup Electron Main, Preload, and Renderer (Vite + React + TS).
- [ ] Configure strict security settings (`contextIsolation`, `nodeIntegration`, sandboxing).
- [ ] Establish Zod-validated IPC channel.
- [ ] Create basic window shell with Discord-like dark styling.

## Phase 2: Excalidraw Integration
- [ ] Install `@excalidraw/excalidraw` in Renderer.
- [ ] Embed `<Excalidraw />` component with custom wrapper.
- [ ] Implement basic state syncing (get scene elements, update scene).
- [ ] Test `.excalidraw` compatibility (mock load/save).

## Phase 3: Multi-User Profiles & Filesystem
- [ ] Implement Profile Manager in Main process (create, switch, store in `%APPDATA%`).
- [ ] Build Profile Switcher UI in top bar.
- [ ] Implement secure Filesystem API in Main (read/write bounded to workspace/vault).
- [ ] Build File Explorer panel in UI (browse, open, save).

## Phase 4: Plugin System Foundation
- [ ] Create `plugin-sdk` package.
- [ ] Implement Plugin Manager in Main (load manifest, check permissions).
- [ ] Build Plugin Manager UI (list installed, enable/disable).
- [ ] Create first test plugin (`quick-export-presets`).

## Phase 5: AI Import Pipeline
- [ ] Build AI Import Lane UI (drag & drop, paste).
- [ ] Implement payload parsing and schema validation.
- [ ] Create preview diff UI.
- [ ] Implement safe application of settings/templates/plugins.

## Phase 6: First-Party Plugins & Polish
- [ ] Implement top priority plugins (Templates, Library Manager, etc.).
- [ ] Apply full styling from `design_tokens.md` and reference image.
- [ ] Generate `docs/AI_GUIDE.md` for users.

## Phase 7: Testing & Packaging
- [ ] Add E2E tests for profile switching and file ops.
- [ ] Setup `electron-builder`.
- [ ] Produce Windows installer (`npm run dist`).
