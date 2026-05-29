# Markdown Embed/Export (first-party)

Export the current drawing as an image **plus** a Markdown file that references
it — ideal for note vaults (Obsidian-style).

- Writes `<name>.png` and `<name>.md` into `<workspace>/exports/`.
- The Markdown includes YAML frontmatter (title, tags, created) and an image
  embed; the image carries the embedded Excalidraw scene so it re-opens in the
  editor.

Contributes the *Export as Markdown bundle* command. `filesystem:
workspace-only`, `network: none`.
