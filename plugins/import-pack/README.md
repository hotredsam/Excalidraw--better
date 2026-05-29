# Import Pack (first-party)

Bring external images onto the canvas.

- **Import image** — drop a PNG/JPEG/GIF/WebP/SVG in as an Excalidraw image
  element (the bytes are embedded in the scene's `files` map).
- **Import SVG as elements** — best-effort conversion of simple SVG primitives
  (`rect`, `circle`, `ellipse`, `line`, `text`) into *editable* Excalidraw
  shapes.

Contributes the *Import image onto canvas* command. `filesystem:
workspace-only`, `network: none`.
