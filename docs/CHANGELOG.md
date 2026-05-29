# Changelog

## Unreleased — "Excalidraw, but better"

A large expansion from the initial scaffold into a feature-complete, tested
desktop app. Highlights:

### Editor & files
- Read **and** write `.excalidraw` / `.excalidraw.svg` / `.excalidraw.png` with
  the scene embedded (round-trips back into the editor).
- File management: rename, move, copy, create file/folder, delete-to-Recycle-Bin,
  and **bulk** rename/move/delete — all path-safe.
- Workspace **search** over file names + embedded element text + tags, with a
  persistent on-disk index cache and per-workspace exclude globs.
- **Recent files**, **versioned backups** (snapshot-before-overwrite + restore),
  and **autosave**.
- **Daily notes** and **duplicate drawing** commands.

### Panels (right drawer)
Properties, Recent, Outline, Templates, Snippets, Styles, Libraries, Tags,
Review, Stats, Git, Plugins, AI Import.

### Creativity
- **Templates** and **Snippets** libraries (per profile).
- **Style presets** — save/apply element styles.
- **Library packs** (`.excalidrawlib`) import/insert.
- **Image import** and best-effort **SVG → editable elements**.
- **Presentation mode** (frames → slides + presenter notes) and a document
  **outline**.
- **Markdown export** (image + frontmatter `.md` bundle).

### Power user
- **Command palette** (Ctrl+K) with fuzzy search.
- **Customizable keyboard shortcuts** with conflict detection.
- **Light / dark / system** theming.
- Local **review** comment pins and a workspace **stats** dashboard.
- Optional, permission-gated **git** integration.

### Platform
- Declarative, permission-scoped **plugin system** with 8 first-party plugins.
- **AI Import Lane** — validate/preview/apply settings, templates, plugin
  scaffolds and docs; settings bundles show a before→after diff.
- Multi-user **profiles** (full CRUD) with isolated settings/vault/plugins.

### Engineering
- `packages/shared` grew a suite of pure, tested utilities: colors, geometry,
  scene-utils, collections, datetime, text, validation, csv, result, pathlike,
  random, units, frontmatter.
- **377 tests** (main-process unit + acceptance, and renderer component tests via
  jsdom + Testing Library), plus a Playwright Electron smoke harness.
- CI (build/lint/test/e2e) and release (electron-builder) workflows.
