# Embedding Excalibur in another app

Excalibur is built as four reusable layers so the engine and editor can be hosted
outside the bundled Electron app — in a web app, a Node service, a Tauri shell, or
a test harness. Nothing in the core or the UI depends on Electron; the only
platform-specific capabilities are funnelled through a single `HostServices`
seam.

## The packages

| Package | Role | Depends on a host framework? |
| --- | --- | --- |
| `@excalibur/shared` | Zod schemas + pure utilities (validation, geometry, colours, search scoring, …) | No |
| `@excalibur/api-contract` | The single `ExcaliburApi` TypeScript interface — the whole app API surface | No (types only) |
| `@excalibur/core` | Headless engine: profile/workspace/plugin/… stores, `ExcaliburEngine`, `createApiHandlers`, `HostServices` | No |
| `@excalibur/ui` | The React editor (`ExcaliburEditor`), `ApiProvider`/`useApi`, panels | No (needs a DOM + an `ExcaliburApi`) |

Each ships a dual **ESM + CJS** build with an `exports` map, so a CommonJS Node
host and an ESM/Vite bundler both resolve the right format.

## The contract

`ExcaliburApi` (from `@excalibur/api-contract`) describes every operation the
editor can perform (`profiles`, `workspaces`, `plugins`, `ai`, `templates`,
`libraries`, `git`, `presentation`, …). Three implementations are checked against
it at compile time:

- the Electron preload (`window.api`, over IPC),
- `@excalibur/core`'s `createApiHandlers` (in-process),
- the renderer test double (`ui/test/fakeApi.ts`).

To embed Excalibur you provide *an* `ExcaliburApi` to the UI. You can reuse the
in-process engine, or write a thin client that talks to your own backend.

## HostServices

The engine asks its host for the few things that are genuinely platform-specific:

```ts
interface HostServices {
  userDataDir: string;        // where profiles + data live
  builtinPluginsDir: string;  // bundled plugins
  appVersion: string;
  platform: string;
  trashItem(path: string): Promise<void>;            // default: permanent delete
  pickDirectory(opts?): Promise<string | null>;      // default: null (no native dialog)
  pickFile(opts?): Promise<string | null>;           // default: null
  openExternal(url: string): Promise<void>;          // default: no-op
}
```

`defaultHostServices(overrides)` fills headless defaults; override only what your
host can do. The Electron app's host (`app/src/main/electron-host.ts`) backs these
with `app`/`dialog`/`shell`.

## In-process (no IPC): Node / Tauri / SSR

```ts
import { ExcaliburEngine, createApiHandlers, defaultHostServices } from '@excalibur/core';

const host = defaultHostServices({
  userDataDir: '/path/to/userdata',
  appVersion: '1.0.0',
  // optionally wire native pickers / trash for your platform:
  // pickDirectory: async () => await myNativeFolderPicker(),
});

const engine = new ExcaliburEngine(host);
await engine.init();                  // creates a Default profile on first run

const api = createApiHandlers(engine); // <- a full ExcaliburApi, no Electron

await api.profiles.list();
const ws = await api.workspaces.add(); // uses host.pickDirectory()
```

`api` is exactly an `ExcaliburApi`, so it can be handed straight to the React
editor.

> A runnable version of this lives at [`examples/headless-engine.cjs`](../examples/headless-engine.cjs)
> (`node examples/headless-engine.cjs`): it creates a profile, adds a workspace,
> and round-trips a drawing file with no Electron involved.

## Mounting the editor (any DOM host)

```tsx
import { createRoot } from 'react-dom/client';
import { ExcaliburEditor } from '@excalibur/ui';
import '@excalibur/ui/styles.css';

createRoot(document.getElementById('root')!).render(
  <ExcaliburEditor api={api} />,   // any ExcaliburApi: in-process, HTTP client, etc.
);
```

`ExcaliburEditor` wraps the app in an `ApiProvider`; every component consumes the
API through `useApi()`, never a global. (In the bundled Electron app, `main.tsx`
provides `window.api` to the same provider.)

## Client/server split

For a web deployment, run the engine on a server and expose `createApiHandlers`
over HTTP/WebSocket, then implement a browser-side `ExcaliburApi` that forwards
each call to the server. Because the contract is the single source of truth, the
client and server stay in lock-step — any drift is a type error.

## Extension points

- **Plugins** are declarative manifests (`plugin.json`); see
  [PLUGINS.md](./PLUGINS.md). The host loads them through
  `PluginManager` (in `@excalibur/core`) and surfaces contributions via
  `api.plugins.getContributions()` / `api.commands.list()`. Manifests are
  validated with `PluginManifestSchema` from `@excalibur/shared`.
- **AI import** accepts a validated payload (`AiPayloadSchema` /
  `validateRawPayload` from `@excalibur/shared`) applied through `api.ai.apply`.

Both are exercised the same way regardless of host.
