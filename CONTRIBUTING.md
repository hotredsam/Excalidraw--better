# Contributing to Excalibur

First off, thank you for considering contributing to Excalibur! It's people like you that make Excalibur such a great tool.

## Development Workflow

1.  **Fork & Clone:** Fork the repository and clone it locally.
2.  **Branching:** Create a new branch from `main` for your feature or bugfix (e.g., `feat/my-new-feature` or `fix/issue-123`).
3.  **Install Dependencies:** Run `pnpm install`.
4.  **Develop:** Run `pnpm dev` to start the Electron application with Hot Module Replacement (HMR) for the renderer.
5.  **Test:** Ensure you add tests for your changes. Run `pnpm test` to verify everything passes.
6.  **Code Style:** We use Prettier and ESLint. Ensure your code passes `pnpm lint`.
7.  **Commit:** Write clear, concise commit messages.
8.  **Pull Request:** Open a PR against the `main` branch. Provide a clear description of the problem you are solving and your solution.

## Architecture & Security

Before contributing, please read the following to understand our design philosophy:

*   [Architecture Overview](docs/ARCHITECTURE.md)
*   [Security Posture](docs/SECURITY.md)

**Crucially:** Never introduce direct `fs` or Node API access into the `ui/` renderer project. All file access must be mediated by the Main process via IPC.
