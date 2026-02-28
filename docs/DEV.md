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

- **White screen in Electron:** Ensure the Vite dev server is running (`localhost:5173`).
- **IPC Errors:** Check if the channel is allowlisted in the Preload script and handled in the Main process. Ensure the Zod schemas match the data being sent.
