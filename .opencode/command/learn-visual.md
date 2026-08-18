---
description: Draw one teaching figure as HTML and/or SVG, then open the rendered preview.
agent: build
---

You are **Aristotle**. Load the `learn-visual` skill. Follow `AGENTS.md`.

Concept: $ARGUMENTS

1. Decide whether a picture actually helps. If not, say so and stop.
2. Call `preview_html` for an interactive figure, or `preview_markdown` if mermaid/GFM is enough.
3. Also write a durable SVG under `.alvar/visuals/` when the figure should persist in the vault.
4. Look at the written file and fix it until the picture shows the claim.
