# Graph Report - .  (2026-06-07)

## Corpus Check
- 279 files · ~76,494 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1296 nodes · 1904 edges · 123 communities (97 shown, 26 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Handlers & Bulk Ops|API Handlers & Bulk Ops]]
- [[_COMMUNITY_Editor Package Manifest|Editor Package Manifest]]
- [[_COMMUNITY_AI Import Payloads|AI Import Payloads]]
- [[_COMMUNITY_Feature Schemas|Feature Schemas]]
- [[_COMMUNITY_Core Package Manifest|Core Package Manifest]]
- [[_COMMUNITY_Search & PNG Extraction|Search & PNG Extraction]]
- [[_COMMUNITY_Electron Package Manifest|Electron Package Manifest]]
- [[_COMMUNITY_IPC Channel Constants|IPC Channel Constants]]
- [[_COMMUNITY_Canvas Shell & Dialogs|Canvas Shell & Dialogs]]
- [[_COMMUNITY_Side Panels UI|Side Panels UI]]
- [[_COMMUNITY_Plugin & Review Panels|Plugin & Review Panels]]
- [[_COMMUNITY_IPC Package Manifest|IPC Package Manifest]]
- [[_COMMUNITY_Plugin SDK Manifest|Plugin SDK Manifest]]
- [[_COMMUNITY_Shared Package Manifest|Shared Package Manifest]]
- [[_COMMUNITY_Core Feature Modules|Core Feature Modules]]
- [[_COMMUNITY_Excalidraw File Schemas|Excalidraw File Schemas]]
- [[_COMMUNITY_Settings & Import UI|Settings & Import UI]]
- [[_COMMUNITY_Shortcut Resolution|Shortcut Resolution]]
- [[_COMMUNITY_Test Tooling Deps|Test Tooling Deps]]
- [[_COMMUNITY_Engine & Host Services|Engine & Host Services]]
- [[_COMMUNITY_Web TS Config|Web TS Config]]
- [[_COMMUNITY_Profile Store|Profile Store]]
- [[_COMMUNITY_Git & Sidebar UI|Git & Sidebar UI]]
- [[_COMMUNITY_Export & PNG Utils Tests|Export & PNG Utils Tests]]
- [[_COMMUNITY_Export Plugin Manifest|Export Plugin Manifest]]
- [[_COMMUNITY_PNG Fixture Generator|PNG Fixture Generator]]
- [[_COMMUNITY_Panel Plugin Manifest|Panel Plugin Manifest]]
- [[_COMMUNITY_Plugin TS Config|Plugin TS Config]]
- [[_COMMUNITY_Library TS Config|Library TS Config]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_Toolbar Plugin Manifest|Toolbar Plugin Manifest]]
- [[_COMMUNITY_Color Utils|Color Utils]]
- [[_COMMUNITY_Geometry Utils|Geometry Utils]]
- [[_COMMUNITY_Library Store|Library Store]]
- [[_COMMUNITY_Settings Bundle Fixture|Settings Bundle Fixture]]
- [[_COMMUNITY_TS Config|TS Config]]
- [[_COMMUNITY_Style Presets & App Tests|Style Presets & App Tests]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_TS Config|TS Config]]
- [[_COMMUNITY_Navigation History|Navigation History]]
- [[_COMMUNITY_AI Import & File Ops Tests|AI Import & File Ops Tests]]
- [[_COMMUNITY_Feature Ops Tests|Feature Ops Tests]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_Plugin Manifest|Plugin Manifest]]
- [[_COMMUNITY_TS Config|TS Config]]
- [[_COMMUNITY_Feature Utils|Feature Utils]]
- [[_COMMUNITY_Git Helper|Git Helper]]
- [[_COMMUNITY_Plugin Manager|Plugin Manager]]
- [[_COMMUNITY_General Utils|General Utils]]
- [[_COMMUNITY_Command Palette UI|Command Palette UI]]
- [[_COMMUNITY_Pathlike Utils|Pathlike Utils]]
- [[_COMMUNITY_Recents Store|Recents Store]]
- [[_COMMUNITY_Workspace Store|Workspace Store]]
- [[_COMMUNITY_Profile Manager Modal|Profile Manager Modal]]
- [[_COMMUNITY_App Package Manifest|App Package Manifest]]
- [[_COMMUNITY_Backup Manager|Backup Manager]]
- [[_COMMUNITY_Datetime Utils|Datetime Utils]]
- [[_COMMUNITY_Result Utils|Result Utils]]
- [[_COMMUNITY_Snippet Store|Snippet Store]]
- [[_COMMUNITY_Text Utils|Text Utils]]
- [[_COMMUNITY_Scene Utils|Scene Utils]]
- [[_COMMUNITY_Units Utils|Units Utils]]
- [[_COMMUNITY_Lib TS Config|Lib TS Config]]
- [[_COMMUNITY_Editor React Context|Editor React Context]]
- [[_COMMUNITY_Electron Host|Electron Host]]
- [[_COMMUNITY_Template Schemas|Template Schemas]]
- [[_COMMUNITY_Shortcut Store|Shortcut Store]]
- [[_COMMUNITY_Style Preset Store|Style Preset Store]]
- [[_COMMUNITY_Style Schemas|Style Schemas]]
- [[_COMMUNITY_CJS TS Config|CJS TS Config]]
- [[_COMMUNITY_ESM TS Config|ESM TS Config]]
- [[_COMMUNITY_CJS TS Config|CJS TS Config]]
- [[_COMMUNITY_ESM TS Config|ESM TS Config]]
- [[_COMMUNITY_CJS TS Config|CJS TS Config]]
- [[_COMMUNITY_ESM TS Config|ESM TS Config]]
- [[_COMMUNITY_CJS TS Config|CJS TS Config]]
- [[_COMMUNITY_ESM TS Config|ESM TS Config]]
- [[_COMMUNITY_Frontmatter Parser|Frontmatter Parser]]
- [[_COMMUNITY_Template Store|Template Store]]
- [[_COMMUNITY_Template Pack Fixture|Template Pack Fixture]]
- [[_COMMUNITY_Builtin Plugins Tests|Builtin Plugins Tests]]
- [[_COMMUNITY_Profile Store Tests|Profile Store Tests]]
- [[_COMMUNITY_CSV Utils|CSV Utils]]
- [[_COMMUNITY_Excalibur API Types|Excalibur API Types]]
- [[_COMMUNITY_Workspace Config Store|Workspace Config Store]]
- [[_COMMUNITY_PNG Module Types|PNG Module Types]]
- [[_COMMUNITY_Smoke Spec|Smoke Spec]]
- [[_COMMUNITY_Batch Export Planning|Batch Export Planning]]
- [[_COMMUNITY_Test TS Config|Test TS Config]]
- [[_COMMUNITY_Decoupling Check Script|Decoupling Check Script]]
- [[_COMMUNITY_Geometry Tests|Geometry Tests]]
- [[_COMMUNITY_Scene Utils Tests|Scene Utils Tests]]
- [[_COMMUNITY_Electron Type Decls|Electron Type Decls]]

## God Nodes (most connected - your core abstractions)
1. `useApi()` - 46 edges
2. `writeJsonAtomic()` - 34 edges
3. `ExcaliburEngine` - 21 edges
4. `ProfileStore` - 16 edges
5. `toastError()` - 16 edges
6. `installFakeApi()` - 16 edges
7. `compilerOptions` - 16 edges
8. `sanitizeName()` - 15 edges
9. `toastSuccess()` - 15 edges
10. `SearchIndex` - 14 edges

## Surprising Connections (you probably didn't know these)
- `writeMarkdownBundle()` --calls--> `buildMarkdown()`  [INFERRED]
  packages/core/src/markdown.ts → packages/shared/src/feature-utils.ts
- `applyAiPayload()` --calls--> `sanitizeName()`  [INFERRED]
  packages/core/src/ai-import.ts → packages/core/src/path-utils.ts
- `bulkRename()` --calls--> `applyRenameTemplate()`  [INFERRED]
  packages/core/src/bulk-ops.ts → packages/shared/src/feature-utils.ts
- `applyAiPayload()` --calls--> `writeJsonAtomic()`  [INFERRED]
  packages/core/src/ai-import.ts → packages/core/src/fs-utils.ts
- `ExcaliburEngine` --references--> `BackupManager`  [EXTRACTED]
  packages/core/src/engine.ts → packages/core/src/backup.ts

## Import Cycles
- None detected.

## Communities (123 total, 26 thin omitted)

### Community 0 - "API Handlers & Bulk Ops"
Cohesion: 0.06
Nodes (45): bulkDelete(), bulkMove(), bulkRename(), safe(), buildCommandList(), CORE_COMMANDS, Chunk, dataUrlToBuffer() (+37 more)

### Community 1 - "Editor Package Manifest"
Cohesion: 0.05
Nodes (39): dependencies, @excalibur/api-contract, @excalibur/ipc, @excalibur/shared, nanoid, devDependencies, @excalidraw/excalidraw, react (+31 more)

### Community 2 - "AI Import Payloads"
Cohesion: 0.06
Nodes (35): AI_PAYLOAD_TYPES, AiApplyResult, AiPayload, AiPayloadSchema, AiPayloadType, AiValidationResult, DocsUpdatePayload, DocsUpdatePayloadSchema (+27 more)

### Community 3 - "Feature Schemas"
Cohesion: 0.06
Nodes (35): BackupEntry, BackupEntrySchema, BackupList, BackupListSchema, BulkRenameOptions, BulkRenameOptionsSchema, BulkResult, BulkResultSchema (+27 more)

### Community 4 - "Core Package Manifest"
Cohesion: 0.06
Nodes (34): dependencies, crc, @excalibur/api-contract, @excalibur/shared, fs-extra, nanoid, pako, png-chunk-text (+26 more)

### Community 5 - "Search & PNG Extraction"
Cohesion: 0.08
Nodes (16): readExcalidrawFile(), extractExcalidrawFromPng(), PngExtractionError, extractSceneText(), FileTags, FileTagsSchema, indexCache, IndexEntry (+8 more)

### Community 6 - "Electron Package Manifest"
Cohesion: 0.07
Nodes (29): dependencies, electron, @excalibur/api-contract, @excalibur/core, @excalibur/ipc, @excalibur/shared, fs-extra, nanoid (+21 more)

### Community 7 - "IPC Channel Constants"
Cohesion: 0.07
Nodes (29): AI_CHANNELS, AiChannels, APP_CHANNELS, AppChannels, BACKUP_CHANNELS, BULK_CHANNELS, COMMAND_CHANNELS, GIT_CHANNELS (+21 more)

### Community 8 - "Canvas Shell & Dialogs"
Cohesion: 0.13
Nodes (18): CanvasShell(), CanvasShellProps, ExportDialog(), modal, overlay, row, KeyboardHelpOverlay(), LibrariesPanel() (+10 more)

### Community 9 - "Side Panels UI"
Cohesion: 0.15
Nodes (18): BackupsPanel(), DEFAULT_PRESETS, PropertiesPanel(), sectionTitle, COLORS, ICONS, ToastHost(), emit() (+10 more)

### Community 10 - "Plugin & Review Panels"
Cohesion: 0.17
Nodes (15): useApi(), OutlinePanel(), PluginManager(), RecentsPanel(), mini, ReviewPanel(), title, RightDrawerProps (+7 more)

### Community 11 - "IPC Package Manifest"
Cohesion: 0.09
Nodes (23): dependencies, @excalibur/shared, devDependencies, typescript, exports, ./package.json, files, import (+15 more)

### Community 12 - "Plugin SDK Manifest"
Cohesion: 0.09
Nodes (23): dependencies, @excalibur/shared, devDependencies, typescript, exports, ./package.json, files, import (+15 more)

### Community 13 - "Shared Package Manifest"
Cohesion: 0.09
Nodes (23): dependencies, zod, devDependencies, typescript, exports, ./package.json, files, import (+15 more)

### Community 14 - "Core Feature Modules"
Cohesion: 0.25
Nodes (4): applyAiPayload(), writeJsonAtomic(), RESERVED_NAMES, PluginState

### Community 15 - "Excalidraw File Schemas"
Cohesion: 0.10
Nodes (18): AppPing, AppPingSchema, ExcalidrawFile, ExcalidrawFileSchema, FileInfo, FileInfoSchema, Profile, ProfileList (+10 more)

### Community 16 - "Settings & Import UI"
Cohesion: 0.17
Nodes (12): AIImportLane(), col, section, SettingsModal(), ShortcutsEditor(), SnippetsPanel(), TemplatesPanel(), kbd (+4 more)

### Community 17 - "Shortcut Resolution"
Cohesion: 0.11
Nodes (18): acceleratorToCommand(), findShortcutConflict(), KEY_ALIASES, KeyEventLike, resolveShortcuts(), DEFAULT_SHORTCUTS, ShortcutBinding, ShortcutBindingSchema (+10 more)

### Community 18 - "Test Tooling Deps"
Cohesion: 0.10
Nodes (19): devDependencies, concurrently, jsdom, @playwright/test, prettier, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event (+11 more)

### Community 19 - "Engine & Host Services"
Cohesion: 0.14
Nodes (7): createApiHandlers(), ExcaliburEngine, defaultHostServices(), HostServices, HostServicesOptions, PickOptions, SettingsStore

### Community 20 - "Web TS Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, allowSyntheticDefaultImports, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, jsx, lib (+10 more)

### Community 22 - "Git & Sidebar UI"
Cohesion: 0.18
Nodes (10): GitPanel(), title, FILE_ICON, iconBtn, label, miniBtn, rowStyle, WorkspaceSidebar() (+2 more)

### Community 23 - "Export & PNG Utils Tests"
Cohesion: 0.17
Nodes (3): IDAT, IEND, IHDR

### Community 24 - "Export Plugin Manifest"
Cohesion: 0.15
Nodes (12): author, contributes, commands, exportPresets, toolbar, description, id, name (+4 more)

### Community 25 - "PNG Fixture Generator"
Cohesion: 0.15
Nodes (11): fixturesDir, IDAT, IEND, IHDR, jsonPath, PNG_HEADER, pngBuffer, pngPath (+3 more)

### Community 26 - "Panel Plugin Manifest"
Cohesion: 0.15
Nodes (12): author, contributes, commands, panels, toolbar, description, id, name (+4 more)

### Community 27 - "Plugin TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, resolveJsonModule, skipLibCheck (+3 more)

### Community 28 - "Library TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, resolveJsonModule, skipLibCheck (+3 more)

### Community 29 - "Plugin Manifest"
Cohesion: 0.17
Nodes (11): author, contributes, commands, panels, description, id, name, permissions (+3 more)

### Community 30 - "Plugin Manifest"
Cohesion: 0.17
Nodes (11): author, contributes, commands, panels, description, id, name, permissions (+3 more)

### Community 31 - "Toolbar Plugin Manifest"
Cohesion: 0.17
Nodes (11): author, contributes, commands, toolbar, description, id, name, permissions (+3 more)

### Community 33 - "Color Utils"
Cohesion: 0.33
Nodes (11): colorForString(), contrastRatio(), darken(), hslToHex(), lighten(), luminance(), mix(), parseHex() (+3 more)

### Community 36 - "Settings Bundle Fixture"
Cohesion: 0.18
Nodes (10): applyTo, name, settings, autosave, autosaveIntervalSeconds, confirmOnDelete, defaultExportFormat, showGrid (+2 more)

### Community 37 - "TS Config"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, skipLibCheck, strict (+2 more)

### Community 38 - "Style Presets & App Tests"
Cohesion: 0.35
Nodes (4): StylePresetsPanel(), FakeState, installFakeApi(), makeFakeApi()

### Community 39 - "Plugin Manifest"
Cohesion: 0.18
Nodes (10): author, contributes, commands, description, id, name, permissions, filesystem (+2 more)

### Community 40 - "TS Config"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, skipLibCheck, strict (+2 more)

### Community 44 - "Plugin Manifest"
Cohesion: 0.18
Nodes (10): author, contributes, commands, description, id, name, permissions, filesystem (+2 more)

### Community 45 - "Plugin Manifest"
Cohesion: 0.18
Nodes (10): author, contributes, commands, description, id, name, permissions, filesystem (+2 more)

### Community 46 - "TS Config"
Cohesion: 0.18
Nodes (10): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, outDir, skipLibCheck, strict (+2 more)

### Community 47 - "Feature Utils"
Cohesion: 0.18
Nodes (8): applyRenameTemplate(), buildMarkdown(), RenameContext, Command, GitFileStatus, GitStatus, MarkdownOptions, Slide

### Community 48 - "Git Helper"
Cohesion: 0.20
Nodes (3): parseGitStatus(), GitHelper, GitRunner

### Community 50 - "General Utils"
Cohesion: 0.20
Nodes (3): diffObjects(), FieldChange, uniqueBy()

### Community 51 - "Command Palette UI"
Cohesion: 0.24
Nodes (4): CommandPalette(), ProfileSwitcher(), file, ws

### Community 53 - "Pathlike Utils"
Cohesion: 0.36
Nodes (8): basename(), depth(), dirname(), extname(), normalizeSlashes(), relativeTo(), segments(), stripExt()

### Community 57 - "Profile Manager Modal"
Cohesion: 0.25
Nodes (6): modal, overlay, ProfileManagerModal(), DrawerTab, RightDrawer(), ws

### Community 58 - "App Package Manifest"
Cohesion: 0.22
Nodes (8): dependencies, @excalibur/core, description, name, private, scripts, start, version

### Community 60 - "Datetime Utils"
Cohesion: 0.39
Nodes (7): daysBetween(), formatDateTime(), formatTime(), isSameDay(), isToday(), p2(), startOfDay()

### Community 61 - "Result Utils"
Cohesion: 0.36
Nodes (6): err(), mapResult(), ok(), Result, tryCatch(), tryCatchAsync()

### Community 65 - "Scene Utils"
Cohesion: 0.46
Nodes (6): countElementsByType(), elementsOf(), isEmptyScene(), mergeScenes(), sceneSummary, stripDeleted()

### Community 66 - "Units Utils"
Cohesion: 0.32
Nodes (3): clampZoom(), percentToZoom(), zoomToPercent()

### Community 67 - "Lib TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, declaration, emitDeclarationOnly, noEmit, outDir, extends, include

### Community 68 - "Editor React Context"
Cohesion: 0.38
Nodes (3): ApiContext, ApiProvider(), ExcaliburEditorProps

### Community 69 - "Electron Host"
Cohesion: 0.43
Nodes (4): builtinPluginsDir(), createElectronHost(), buildMenu(), createWindow()

### Community 70 - "Template Schemas"
Cohesion: 0.29
Nodes (6): StoredTemplate, StoredTemplateSchema, TemplateList, TemplateListSchema, TemplateSummary, TemplateSummarySchema

### Community 74 - "Style Schemas"
Cohesion: 0.29
Nodes (4): StylePreset, StylePresetList, StylePresetListSchema, StylePresetSchema

### Community 75 - "CJS TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 76 - "ESM TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 77 - "CJS TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 78 - "ESM TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 79 - "CJS TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 80 - "ESM TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 81 - "CJS TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 82 - "ESM TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, outDir, extends

### Community 83 - "Frontmatter Parser"
Cohesion: 0.40
Nodes (3): Frontmatter, parseFrontmatter(), parseScalar()

### Community 85 - "Template Pack Fixture"
Cohesion: 0.40
Nodes (4): name, templates, type, version

### Community 89 - "Excalibur API Types"
Cohesion: 0.50
Nodes (3): ExcaliburApi, Ok, PathResult

### Community 91 - "PNG Module Types"
Cohesion: 0.50
Nodes (3): DecodedTextChunk, EncodedTextChunk, PngChunk

## Knowledge Gaps
- **592 isolated node(s):** `type`, `name`, `version`, `applyTo`, `autosave` (+587 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `writeMarkdownBundle()` connect `API Handlers & Bulk Ops` to `Feature Utils`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `buildMarkdown()` connect `Feature Utils` to `API Handlers & Bulk Ops`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `bulkRename()` connect `API Handlers & Bulk Ops` to `Feature Utils`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `writeJsonAtomic()` (e.g. with `applyAiPayload()` and `.save()`) actually correct?**
  _`writeJsonAtomic()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `type`, `name`, `version` to the rest of the system?**
  _592 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Handlers & Bulk Ops` be split into smaller, more focused modules?**
  _Cohesion score 0.0642243328810493 - nodes in this community are weakly interconnected._
- **Should `Editor Package Manifest` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._