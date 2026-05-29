# Excalibur Development Guide

## Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Run development mode:**
    ```bash
    pnpm dev
    ```
    This command will:
    - Start the Shared package compiler in watch mode.
    - Start the IPC package compiler in watch mode.
    - Start the Vite dev server for the UI.
    - Wait for the UI to be ready, then start the Electron app.

## Project Structure

- `app/`: Electron Main and Preload processes.
- `ui/`: React + Vite Renderer process.
- `packages/shared/`: Common Zod schemas and TypeScript types.
- `packages/ipc/`: IPC channel definitions and shared constants.

## IPC System

Excalibur uses a strictly allowlisted and validated IPC system.

- **Channels:** Defined in `packages/ipc/src/index.ts`.
- **Validation:** Payloads are validated using Zod schemas in `packages/shared/src/index.ts`.
- **Preload:** Minimal API exposure in `app/src/preload/index.ts`.

## Multi-User Profiles

Profiles are stored in the user data directory:
- Windows: `%APPDATA%/Excalibur/profiles/`

Each profile directory contains:
- `settings/settings.json`: Profile-specific settings.
- `vault/`: Default folder for drawings.

## Commands

- `pnpm dev`: Start development environment.
- `pnpm build`: Build all workspace packages.
- `pnpm test`: Run all tests.
- `pnpm run --filter @excalibur/app test`: Run main-process tests.
- `pnpm run --filter @excalibur/app dist`: Build desktop installers (electron-builder).

> Note: in CI / non-interactive shells run install with `CI=true pnpm install`
> so pnpm doesn't prompt before recreating `node_modules`.

## Packaging

`app/electron-builder.yml` defines the targets (Windows `nsis` + `portable`,
macOS `dmg`, Linux `AppImage`). The compiled renderer (`ui/dist`) and the
first-party plugins (`/plugins`) are shipped as unpacked resources; the main
process loads them from `process.resourcesPath` when packaged.

## Feature map (where things live)

| Area | Main process | Renderer |
|------|--------------|----------|
| Profiles | `app/src/main/profile.ts` | `components/ProfileSwitcher.tsx` |
| Settings | `settings.ts` | `components/SettingsModal.tsx` |
| Workspaces / file ops | `workspace.ts`, `file-ops.ts`, `path-utils.ts` | `components/WorkspaceSidebar.tsx` |
| Search & tags | `search.ts` | sidebar search + `PropertiesPanel.tsx` |
| Export (embedded) | `export-utils.ts` | `App.tsx` (`exportPreset`) + `PropertiesPanel.tsx` |
| Plugins | `plugins.ts` | `components/PluginManager.tsx` |
| AI Import | `ai-import.ts` (+ shared parser) | `components/AIImportLane.tsx` |
| Templates | `templates.ts` | `components/TemplatesPanel.tsx` |

- **White screen in Electron:** Ensure the Vite dev server is running (`localhost:5173`).
- **IPC Errors:** Check if the channel is allowlisted in the Preload script and handled in the Main process. Ensure the Zod schemas match the data being sent.
