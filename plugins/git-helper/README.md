# Git Helper (first-party)

Optional git integration for git-backed workspaces.

- Shows branch, ahead/behind, and changed files.
- Stage-all + commit from the **Git** panel; view recent history.
- Runs `git` via `execFile` (no shell interpolation) scoped to the workspace.

Disabled by default — enable it in the Plugins panel for repos you trust.
`filesystem: workspace-only`, `network: none` (push/pull are intentionally not
included).
