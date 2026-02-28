# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Plugin System:** Added `@excalibur/plugin-sdk` and Plugin Manager UI for side-loading custom extensions.
- **High Fidelity Excalidraw Parsing:** Application now parses and saves `.excalidraw` JSON preserving all non-standard metadata.
- **SVG / PNG Extraction:** Extract embedded scenes directly from `.excalidraw.svg` and `.excalidraw.png` files.
- **File Explorer:** Workspace-scoped sidebar to manage local diagram files.
- **Multi-user Profiles:** Isolated workspaces and settings loaded on startup.
- **Zod IPC Validation:** Enforced typing on all renderer-main communication.

### Changed
- Refactored save flow to be non-destructive atomic writes.
- UI styling updated to "Discord-like" dark shell with orange hero accents.

### Security
- ContextIsolation forced `true`, Node integration `false` in all renderers.
- Implemented robust `isPathWithin` checks preventing traversal outside loaded Workspaces.
