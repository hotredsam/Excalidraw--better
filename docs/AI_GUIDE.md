# Extending Excalibur with AI

Excalibur ships with an **AI Import Lane** (the ✨ panel on the right). You can
ask any AI assistant to generate a *payload*, paste or drag it into the lane,
and Excalibur will validate it and preview exactly what will change before you
apply it. Nothing is written until you click **Apply**.

There are four payload types:

| Type              | What it does                                            | Where it lands                          |
|-------------------|---------------------------------------------------------|-----------------------------------------|
| `settings_bundle` | Updates the current profile's settings                  | `profile/settings/settings.json`        |
| `template_pack`   | Installs reusable drawing templates                     | `profile/templates/*.json`              |
| `plugin_scaffold` | Generates a declarative plugin (manifest + README)      | `profile/plugins/<id>/`                 |
| `docs_update`     | Writes a proposed documentation change                  | `profile/docs/<target>.md`              |

Payloads can be **JSON**, or the lightweight `KEY: value` **text** format used
in the examples below.

---

## How to ask an AI to write a plugin

Copy/paste one of these prompts into your assistant, then drop the result into
the AI Import Lane.

### 1) Exporter plugin

> Write an Excalibur `plugin_scaffold` payload (JSON) for a plugin called
> "Quick PDF Export". It needs `filesystem: workspace-only` and `network: none`
> permissions. Features: a toolbar button "Export PDF", a command "Export
> current as PDF", and it must write into `<workspace>/exports/`. Return only
> the JSON.

### 2) Template pack plugin

> Write an Excalibur `template_pack` payload (JSON) named "UX Kit" with three
> templates: "User Flow", "Wireframe", and "Service Blueprint". Give each an
> id, title, description, and 2–3 tags. Return only the JSON.

### 3) Search index plugin

> Write an Excalibur `plugin_scaffold` payload (text `TYPE:` format) for a
> plugin "Tag Auto-Indexer" with `filesystem: workspace-only`, `network: none`.
> Features: background re-index on save, suggest tags from drawing text, and a
> command "Rebuild index".

---

## Example payloads

**Settings bundle (JSON):**

```json
{
  "type": "settings_bundle",
  "name": "my_defaults",
  "version": "1.0.0",
  "applyTo": "current_profile",
  "settings": { "autosave": true, "defaultExportFormat": "png", "showGrid": false }
}
```

**Plugin scaffold (text format):**

```text
TYPE: plugin_scaffold
NAME: quick-export-presets
VERSION: 0.1.0
DESCRIPTION: Adds export presets + batch export UI.
PERMISSIONS:
  filesystem: workspace-only
  network: none
FEATURES:
- Adds a toolbar button "Batch Export"
- Adds settings panel for export presets
```

---

## Troubleshooting validation errors

The lane shows a red panel with the exact problem when a payload is invalid.

| Message                                            | Fix                                                            |
|----------------------------------------------------|----------------------------------------------------------------|
| *Could not parse payload as JSON or text*          | Ensure the JSON is valid, or that the text starts with `TYPE:` |
| *Unknown or missing payload "type"*                | Add a `type` of one of the four supported values               |
| *templates: Array must contain at least one element* | A `template_pack` needs at least one template                |
| *id: id must be kebab-case alphanumeric*           | Plugin ids must look like `my-plugin` (lowercase, hyphens)     |
| *settings.autosave: Expected boolean*              | Match the field types in `SettingsSchema`                      |

After applying a `plugin_scaffold`, open the 🧩 **Plugins** panel and toggle the
new plugin on. Scaffolded plugins are *declarative*: they describe toolbar
buttons, commands and panels that the host renders — they never run arbitrary
code with elevated privileges.
