# Contributing to Excalibur

Thanks for your interest! This guide covers the workflow, conventions, and how to
get a change merged.

## Prerequisites

- Node 22+
- pnpm 10+ (`corepack enable` is the easiest way to get it)
- Git

## Setup

```bash
pnpm install          # in CI / non-interactive shells: CI=true pnpm install
pnpm build            # build all workspace packages
pnpm dev              # run the app in development
```

## Repository layout

| Path | Purpose |
|------|---------|
| `app/` | Electron main + preload (privileged, Node access) |
| `ui/` | React + Vite renderer (sandboxed) |
| `packages/shared/` | Zod schemas, types and pure helpers shared by both sides |
| `packages/ipc/` | Allowlisted IPC channel constants |
| `plugins/` | First-party declarative plugins |
| `e2e/` | Playwright Electron smoke tests |
| `docs/` | Architecture, security, file formats, guides |

## Golden rules

1. **The renderer never touches `fs` or `child_process`.** Add an IPC channel in
   `packages/ipc`, a handler in `app/src/main/main.ts`, a method on the preload
   bridge, and a type in `ui/src/types/electron.d.ts`.
2. **Validate at the boundary.** Every IPC payload and every file read is parsed
   with a Zod schema from `@excalibur/shared`.
3. **Stay inside the workspace.** Any path coming from the renderer must pass
   `isPathWithin` / `isWithinWorkspace` and `isDangerousPath`.
4. **Keep runtime helpers out of the renderer's import of `@excalibur/shared`.**
   The package is consumed as CommonJS by the main process; Vite's CJS interop
   cannot reliably lex re-exported *functions*. Import **types** from shared in
   the renderer and mirror small pure helpers under `ui/src/lib/` (see
   `lib/commands.ts`, `lib/shortcuts.ts`). The mirrored behaviour is covered by
   the shared unit tests.
5. **Plugins are declarative.** A plugin contributes toolbar items, commands,
   panels and export presets via its `plugin.json`; the host renders/executes
   them. We never `eval` plugin code with elevated privileges.

## Adding a feature end-to-end (checklist)

- [ ] Schema/types in `packages/shared`
- [ ] IPC channel constant in `packages/ipc`
- [ ] Main-process module + handler in `app/src/main`
- [ ] Preload method + `electron.d.ts` type
- [ ] Renderer UI
- [ ] Unit tests (`app/test`) and, for UI, a component test (`ui/test`)
- [ ] Docs updated if user-facing

## Tests & checks

```bash
pnpm lint      # tsc --noEmit across all packages
pnpm test      # unit + acceptance (main) and component tests (renderer)
pnpm e2e       # Playwright Electron smoke (CI runs under xvfb)
```

See [`docs/TESTING.md`](docs/TESTING.md) for the testing strategy.

## Commit style

Small, focused commits with imperative subjects. CI (`.github/workflows/ci.yml`)
must be green (build, lint, test, e2e) before merge.
