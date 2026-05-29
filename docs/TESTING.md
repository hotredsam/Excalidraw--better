# Testing strategy

Excalibur is tested at three levels. All of them run in CI
(`.github/workflows/ci.yml`).

## 1. Main-process unit tests (`app/test/*.test.ts`)

Run with Vitest in a Node environment. These cover the bulk of the real logic:
path safety, file operations, search/index, export embedding, plugins, AI
import, templates, recents, libraries, backups, review, stats, git (with an
injected runner), presentation, markdown, snippets, shortcuts, workspace config,
SVG import, and the shared schemas/utilities.

```bash
pnpm --filter @excalibur/app test
```

### Acceptance test

`app/test/acceptance.e2e.test.ts` mocks Electron's `app` and drives the real
stores wired together through the Product Spec §10 checklist (two isolated
profiles, create→save→reopen, PNG/SVG/JSON embedded-scene round-trip, AI plugin
scaffold → enable, search).

## 2. Renderer component tests (`ui/test/*.test.{ts,tsx}`)

Run with Vitest in a `jsdom` environment using `@testing-library/react`. The
preload bridge is replaced with an in-memory fake (`ui/test/fakeApi.ts`), so
panels and dialogs can be mounted and driven in isolation.

```bash
pnpm --filter @excalibur/ui test
```

Note: components that embed `@excalidraw/excalidraw` (the canvas) are not mounted
in jsdom — they need a real layout/canvas. They are exercised by the E2E layer.

## 3. End-to-end (`e2e/*.spec.ts`)

Playwright launches the built Electron app and drives the renderer. In CI this
runs under `xvfb-run`.

```bash
pnpm build && pnpm e2e
```

## Conventions

- Prefer testing pure functions directly (see `packages/shared/feature-utils*`).
- File-system tests use a fresh `os.tmpdir()` directory per test and clean up in
  `afterEach`.
- External processes (git) and native dialogs are injected/faked, never invoked
  for real in unit tests.
