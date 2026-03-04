# Excalibur

A secure, local-first visual IDE powered by Excalidraw. Wraps the Excalidraw canvas in a hardened Electron shell with multi-user profiles, workspace-gated file management, and a plugin architecture. All data stays on the local machine -- no cloud sync, no tracking.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop shell | Electron | ^28.0.0 |
| Frontend | React | ^18.2.0 |
| Language | TypeScript | ^5.0.0 |
| Bundler (UI) | Vite | ^4.4.0 |
| Canvas | @excalidraw/excalidraw | ^0.18.0 |
| IPC validation | Zod | ^3.22.4 |
| File system | fs-extra | ^11.3.3 |
| Package manager | pnpm | 8+ |
| Testing | Vitest | ^4.0.18 |
| Code formatting | Prettier | ^3.0.0 |
| Build/distribute | electron-builder | ^24.9.1 |
| Monorepo | pnpm workspaces | -- |
| ID generation | nanoid | ^5.1.6 |

## Monorepo Structure

Managed by pnpm workspaces (`pnpm-workspace.yaml`):

```
Excalibur/
  pnpm-workspace.yaml     # Declares: app, ui, packages/*
  package.json             # Root scripts: dev, build, dist, lint, test
  pnpm-lock.yaml
  app/                     # @excalibur/app -- Electron main process
    package.json
    src/                   # (compiled to dist/)
      main/
        main.ts            # Electron app entry, window creation
        workspace.ts       # Workspace store (path boundary enforcement)
        profile.ts         # Multi-user profile management
        settings.ts        # Per-profile settings
        plugins.ts         # Plugin manager (main process sandbox)
        fs-utils.ts        # Safe file system operations
        path-utils.ts      # Path validation and traversal protection
        excalidraw-utils.ts  # .excalidraw/.svg/.png file parsing
        ai-import.ts       # AI-powered import pipeline
      preload/
        index.ts           # Context bridge (window.api)
      test/                # Vitest unit tests for main process modules
    assets/
      icon.ico             # App icon
    dist/                  # Compiled JS output
    dist-build/            # electron-builder output (installers)
  ui/                      # @excalibur/ui -- React renderer (Vite SPA)
    package.json
    vite.config.ts
    tsconfig.json
    index.html
    src/                   # React components wrapping Excalidraw
    dist/                  # Vite build output (served by Electron)
  packages/
    shared/                # @excalibur/shared -- Shared types and constants
    ipc/                   # @excalibur/ipc -- IPC channel definitions + Zod schemas
    plugin-sdk/            # @excalibur/plugin-sdk -- Plugin development API
  excalidraw_src/          # Excalidraw source reference / patches
  Inputs/                  # Input test files
  docs/
    ARCHITECTURE.md        # Architecture overview with Mermaid diagrams
    SECURITY.md            # Threat model and security guidelines
    FILE_FORMATS.md        # Supported file format details
    assets/                # Logo, screenshots for README
  .github/                 # CI workflows
  CONTRIBUTING.md          # Contribution guidelines
  CHANGELOG.md
  CODE_OF_CONDUCT.md
  LICENSE                  # MIT
```

## Build & Run

```bash
# Prerequisites: Node.js 18+, pnpm 8+
pnpm install

# Development (starts all workspace packages + Electron with HMR)
pnpm dev

# Run all tests across workspaces
pnpm test

# Lint all packages
pnpm lint

# Production build (all packages)
pnpm build

# Build distributable installer (Windows NSIS, Mac DMG, Linux AppImage)
pnpm dist
```

The `pnpm dev` command uses `concurrently` and `wait-on` to start shared, ipc, ui, and app packages in dependency order. The UI dev server must be ready (http://localhost:5173) before Electron launches.

## Security Architecture (Critical)

This is the most important design constraint in the project:

- **Zero Node Integration in Renderer**: The React UI (`ui/`) has NO access to `fs`, `path`, `child_process`, or any Node API. All file operations go through IPC.
- **Context Isolation**: Enabled. The renderer runs in a sandboxed context.
- **Strict IPC Allowlist**: Every IPC channel is defined in `packages/ipc/` with Zod schemas. The main process validates all incoming messages.
- **Path Traversal Protection**: All file operations in `app/src/main/` validate paths against the active workspace boundary before execution. No file access outside the workspace is permitted.
- **Plugin Sandbox**: Plugins run in the main process but through a controlled SDK. They cannot access arbitrary file system paths.

## Supported File Formats

| Format | Read | Write | Notes |
|--------|------|-------|-------|
| `.excalidraw` | Yes | Yes | Full tolerant JSON read/write. Preserves unknown fields. |
| `.excalidraw.svg` | Yes | No | Extracts embedded JSON scene from SVG comments. |
| `.excalidraw.png` | Yes | No | Extracts JSON from tEXt/zTXt PNG chunks. |

## Code Patterns

- **Workspace packages**: Code shared between main and renderer lives in `packages/shared/`. IPC contracts live in `packages/ipc/`. Always import from workspace packages, never copy types.
- **IPC-first**: Every feature that touches the file system or OS must be implemented as an IPC handler in `app/src/main/` and exposed through `packages/ipc/`. The renderer calls `window.api.*`.
- **Zod validation**: All IPC payloads are validated with Zod schemas defined in `packages/ipc/`. Add schemas for new channels before implementing handlers.
- **Profile isolation**: Each user profile has isolated settings, recent files, and plugin state. Profile data is stored per-profile in the app data directory.
- **Tolerant parsing**: The Excalidraw file parser preserves unknown fields. This ensures forward compatibility with newer Excalidraw versions.

## Important Files -- Do NOT Modify Without Understanding

- `packages/ipc/` -- IPC channel definitions and Zod schemas. Breaking changes here break the entire main-renderer contract.
- `app/src/main/workspace.ts` -- Workspace boundary enforcement. Security-critical; changes here could allow path traversal.
- `app/src/main/path-utils.ts` -- Path validation. Security-critical.
- `app/src/preload/index.ts` -- Context bridge. Only expose what is explicitly needed.
- `ui/src/` -- The renderer. NEVER import Node modules here.

## Gotchas and Warnings

- Do NOT add `require('fs')`, `require('path')`, or any Node built-in to files in `ui/src/`. This violates the security model and will break context isolation.
- Do NOT add new IPC channels without first defining them in `packages/ipc/` with Zod schemas. Unvalidated IPC is a security vulnerability.
- Do NOT bypass workspace path validation. If you need to access a file outside the workspace, the user must explicitly open a new workspace.
- The `excalidraw_src/` directory contains reference material and has its own `CLAUDE.md`. It is NOT part of the build pipeline.
- `dist-build/` contains generated installers and should never be committed. It is not gitignored by default -- be careful.
- The UI Vite dev server runs on port 5173. The Electron app loads from this URL in development and from `dist/` in production.
- pnpm is required. Do NOT use npm or yarn -- the workspace protocol (`workspace:*`) is pnpm-specific.
- The `pnpm dist` command builds for the current platform only. Cross-platform builds require CI or platform-specific machines.
- When adding tests, place them in `app/src/test/` for main process tests. UI tests would go in `ui/src/` (not yet established).
