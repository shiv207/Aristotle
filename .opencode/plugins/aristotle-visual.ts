import { mkdirSync, writeFileSync } from "node:fs"
import { spawn } from "node:child_process"
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { type Plugin, tool } from "@opencode-ai/plugin"

const OPEN_EXTS = new Set([".md", ".svg", ".html", ".canvas"])
const SKIP_NAMES = new Set(["readme.md"])

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "visual"
}

function wrapHtml(title: string, html: string) {
  const trimmed = html.trim()
  if (/^<!doctype html>/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return trimmed
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: dark light; }
    body { font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; margin: 24px; max-width: 880px; }
  </style>
</head>
<body>
${trimmed}
</body>
</html>
`
}

function markdownPage(title: string, markdown: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body>
  <p>Opened in Obsidian. This HTML copy is a fallback.</p>
  <pre>${escapeHtml(markdown)}</pre>
</body>
</html>
`
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function isInside(parent: string, child: string) {
  const rel = relative(resolve(parent), resolve(child))
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)
}

function rank(path: string) {
  const n = path.replaceAll("\\", "/")
  if (n.includes("/.alvar/visuals/")) return 0
  if (n.includes("/.alvar/maps/")) return 1
  if (n.includes("/.alvar/sessions/")) return 2
  if (n.includes("/.alvar/knowledge/")) return 3
  if (n.includes("/.alvar/research/")) return 4
  if (n.endsWith("/.alvar/LEARNER.md")) return 5
  return 9
}

function openInObsidian(absPath: string) {
  const uri = `obsidian://open?path=${encodeURIComponent(absPath)}`
  spawn("open", [uri], { detached: true, stdio: "ignore" }).unref()
}

function argFile(value: unknown) {
  if (!value || typeof value !== "object") return
  const record = value as Record<string, unknown>
  for (const key of ["filePath", "path", "file", "filepath"]) {
    if (typeof record[key] === "string") return record[key]
  }
}

function pickOpenPath(root: string, file: string) {
  const abs = resolve(isAbsolute(file) ? file : join(root, file))
  const alvar = join(root, ".alvar")
  if (!isInside(alvar, abs) && abs !== join(alvar, "LEARNER.md")) return
  if (abs.includes(`${sep}templates${sep}`)) return
  if (SKIP_NAMES.has(basename(abs).toLowerCase())) return

  let target = abs
  if (target.endsWith(".preview.html")) {
    target = join(dirname(target), `${basename(target, ".preview.html")}.md`)
  }
  if (!OPEN_EXTS.has(extname(target).toLowerCase())) return
  return target
}

export const AristotleVisualPlugin: Plugin = async ({ directory }) => {
  const root = directory
  const visualsDir = join(root, ".alvar", "visuals")
  const pending = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined

  const flush = () => {
    timer = undefined
    const files = [...pending]
    pending.clear()
    if (files.length === 0) return
    files.sort((a, b) => rank(a) - rank(b) || b.localeCompare(a))
    openInObsidian(files[0])
  }

  const queue = (file: string) => {
    const target = pickOpenPath(root, file)
    if (!target) return
    pending.add(target)
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, 80)
  }

  return {
    event: async ({ event }) => {
      if (event.type !== "file.edited") return
      const file = (event as { properties?: { file?: string } }).properties?.file
      if (file) queue(file)
    },
    "tool.execute.after": async (input, output) => {
      if (input.tool !== "write" && input.tool !== "edit") return
      const file = argFile(input.args) ?? argFile(output)
      if (file) queue(file)
    },
    tool: {
      preview_html: tool({
        description:
          "Write a self-contained HTML teaching visual to .alvar/visuals/<slug>.html and open it in Obsidian immediately.",
        args: {
          slug: tool.schema.string().describe("filename slug, e.g. coord-frames-1"),
          title: tool.schema.string().describe("page title"),
          html: tool.schema.string().describe("full HTML document or body fragment"),
        },
        async execute(args) {
          mkdirSync(visualsDir, { recursive: true })
          const slug = slugify(args.slug)
          const path = join(visualsDir, `${slug}.html`)
          const mdPath = join(visualsDir, `${slug}.md`)
          writeFileSync(path, wrapHtml(args.title, args.html), "utf8")
          writeFileSync(
            mdPath,
            `# ${args.title}\n\nHTML figure: [[${slug}.html]]\n\nObsidian opened this note so you can see it next to the vault.\n`,
            "utf8",
          )
          openInObsidian(mdPath)
          return `Wrote ${path} and opened ${mdPath} in Obsidian`
        },
      }),
      preview_markdown: tool({
        description:
          "Write a markdown teaching note to .alvar/visuals/<slug>.md (GFM + mermaid) and open it in Obsidian immediately.",
        args: {
          slug: tool.schema.string().describe("filename slug, e.g. self-attention-map"),
          title: tool.schema.string().describe("page title"),
          markdown: tool.schema.string().describe("GitHub-flavored markdown; mermaid fences render in Obsidian"),
        },
        async execute(args) {
          mkdirSync(visualsDir, { recursive: true })
          const slug = slugify(args.slug)
          const mdPath = join(visualsDir, `${slug}.md`)
          writeFileSync(mdPath, args.markdown, "utf8")
          writeFileSync(join(visualsDir, `${slug}.preview.html`), markdownPage(args.title, args.markdown), "utf8")
          openInObsidian(mdPath)
          return `Wrote and opened ${mdPath} in Obsidian`
        },
      }),
    },
  }
}

export default AristotleVisualPlugin
