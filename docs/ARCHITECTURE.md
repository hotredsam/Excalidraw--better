# Excalibur Architecture

## 1. Integration Strategy
**Selected Strategy: A) Embed Excalidraw as a React Component**

We will build a custom React application (Renderer) and embed the `@excalidraw/excalidraw` npm package. This provides a modular boundary, isolating our desktop features (multi-user profiles, file explorer, plugins) from Excalidraw's core rendering logic.

### Rationale:
- **Stability:** Excalidraw exposes a stable API for embedding (`<Excalidraw />`). We don't have to merge upstream changes into a heavily modified fork.
- **Security:** We can control the wrapper application fully, ensuring it complies with our strict Electron security model.
- **Extensibility:** Our custom React wrapper can host the File Explorer, Profile Switcher, and Plugin Manager, leaving the Excalidraw canvas focused purely on drawing.

## 2. Monorepo Layout

```text
/app
  electron-main/
    main.ts          # Entry point, IPC handlers, window management
    profile.ts       # Multi-user profile logic
    filesystem.ts    # Safe local file operations
    plugins.ts       # Backend plugin loading/sandboxing
  preload/
    index.ts         # Secure bridge to renderer via contextBridge
  ipc/
    schemas.ts       # Zod schemas for all IPC payloads

/ui
  src/
    App.tsx          # Main React wrapper
    components/      # Sidebar, Toolbar, Panels
    excalidraw/      # Excalidraw embed & API interaction
    store/           # Client state (Zustand)

/packages
  shared-types/      # TS interfaces shared between main/renderer
  plugin-sdk/        # Types and APIs for plugins
  filesystem-api/    # Safe FS abstraction

/plugins
  quick-export-presets/
  templates-system/
  ...

/docs
/inputs
```

## 3. Electron Security Model (Mandatory)
- `contextIsolation: true`
- `nodeIntegration: false`
- **Sandbox Renderer:** Renderer runs completely isolated from Node APIs.
- **Strict IPC Allowlist:** All IPC messages are validated against Zod schemas in `ipc/schemas.ts`.
- **Filesystem Abstraction:** The Renderer NEVER receives raw paths or `fs` objects. It requests file operations (e.g., `openFile(id)`) and the Main process handles resolution within allowed workspace boundaries.

## 4. Multi-User System
- **Profiles Location:** `%APPDATA%/Excalibur/profiles/<profileId>/`
- Each profile acts as an isolated sandbox for:
  - Settings
  - Enabled Plugins
  - Custom Libraries
  - Templates
  - Default Vault (drawings)
- The Main process manages active profile state and scopes filesystem operations accordingly.

## 5. Plugin Architecture
- **Local-First:** Plugins are loaded from local folders or zip files.
- **SDK:** Plugins use a defined SDK (`plugin-sdk`) with access to hooks (`onLoad`, `registerToolbar`, etc.).
- **Permissions:** Manifests declare permissions (e.g., `filesystem: workspace-only`). The Main process enforces these.
- **Execution:** Safely evaluated within the Renderer or Main depending on the hook, but strictly limited by the API surface.

## 6. AI Import Pipeline
- **Payload Types:** `plugin_scaffold`, `template_pack`, `settings_bundle`, `docs_update`.
- **Flow:**
  1. User pastes/drags JSON/TXT.
  2. Renderer parses to identify type.
  3. Validates against Zod schema.
  4. Presents a preview/diff to the user.
  5. Upon confirmation, sends via IPC to Main.
  6. Main process securely applies the payload within the active profile boundary.

## 7. Power-feature subsystems

Beyond the core, the main process hosts focused, independently-tested modules,
each surfaced through an allowlisted IPC group and a renderer panel:

| Module | Responsibility |
|--------|----------------|
| `recents.ts` | Per-profile recent files (dedupe, cap, prune) |
| `libraries.ts` | `.excalidrawlib` import/export/append |
| `backup.ts` | Versioned snapshots before overwrite; restore |
| `search.ts` | Name + embedded-text + tag index with snippets |
| `bulk-ops.ts` | Guardrailed bulk rename/move/delete |
| `presentation.ts` | Frames → slide deck + presenter notes |
| `review.ts` | Local comment pins per drawing |
| `stats.ts` | Workspace dashboard aggregates |
| `git-helper.ts` | Optional, `execFile`-based git status/commit/log |
| `markdown.ts` / `import-pack.ts` | Markdown bundle export / image insertion |
| `command-registry.ts` | Core command set merged with plugin contributions |

Pure, side-effect-free helpers (rename templating, slide extraction, markdown
generation, git porcelain parsing, fuzzy search) live in
`packages/shared/feature-utils.ts` so they are testable in isolation and usable
on both sides of the IPC boundary.
