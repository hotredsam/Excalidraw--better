# Writing a plugin

Excalibur plugins are **declarative**: a `plugin.json` manifest describes what
the plugin contributes (toolbar buttons, commands, panels, export presets) and
which permissions it needs. The host renders and executes those contributions
through a permission-gated API — plugins never run arbitrary privileged code.

## Manifest

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "0.1.0",
  "description": "What it does.",
  "author": "you",
  "permissions": { "filesystem": "workspace-only", "network": "none" },
  "contributes": {
    "toolbar": [{ "id": "core.export", "title": "Quick Export" }],
    "commands": [{ "id": "my-plugin.do-thing", "title": "Do the thing" }],
    "panels": [{ "id": "my-plugin.about", "title": "My Plugin", "body": "**Markdown** supported." }],
    "exportPresets": [
      { "id": "social", "label": "Social (PNG @2x)", "format": "png", "scale": 2, "background": true, "nameTemplate": "{name}-social" }
    ]
  }
}
```

### Fields

- `id` — kebab-case, unique. The folder name must match.
- `permissions.filesystem` — `none` | `workspace-only` | `all`.
- `permissions.network` — `none` | `all`.
- `contributes.commands` / `toolbar` — items appear in the command palette and
  on the canvas toolbar. If an item's `id` matches a host command (e.g.
  `core.export`, `core.presentation`), the host runs it; otherwise the host
  emits the id for the app to handle.
- `contributes.exportPresets` — surfaced in the Properties → Export list and the
  Quick Export plugin's batch export.
- `contributes.panels` — declarative markdown panels.

## Installing

- **First-party:** drop the folder in `/plugins/` in the repo. It ships with the
  app and is enabled by default (per profile).
- **User:** Plugins panel → *Install from folder* copies it into
  `%APPDATA%/Excalibur/profiles/<id>/plugins/`.
- **AI-generated:** paste a `plugin_scaffold` payload into the AI Import Lane;
  it writes a manifest + README you can then enable.

## Permissions model

Permissions are declared and shown in the Plugin Manager with colour-coded
badges. `workspace-only` filesystem access is the default for first-party
plugins; `all` is reserved for trusted, user-installed plugins. The host
enforces the workspace boundary regardless of what a plugin requests.

## Testing a manifest

`app/test/first-party-plugins.test.ts` validates that every shipped manifest
parses against `PluginManifestSchema` and that the folder name matches the id.
Run `pnpm --filter @excalibur/app test` after adding a plugin.
