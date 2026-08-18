import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import { spawn } from "node:child_process"
import { homedir } from "node:os"
import { basename, extname, isAbsolute, join, relative, resolve, sep } from "node:path"
import { type Plugin, tool } from "@opencode-ai/plugin"

const OPEN_EXTS = new Set([".md", ".svg"])
const SKIP_NAMES = new Set(["readme.md"])

type ObsidianVault = { path: string; ts?: number; open?: boolean }

function registeredVaults(): ObsidianVault[] {
  try {
    const raw = readFileSync(join(homedir(), "Library/Application Support/obsidian/obsidian.json"), "utf8")
    const parsed = JSON.parse(raw) as { vaults?: Record<string, ObsidianVault> }
    return Object.values(parsed.vaults ?? {})
  } catch {
    return []
  }
}

function vaultOpenTarget(absPath: string): { vault: string; file: string } | undefined {
  const vaults = registeredVaults()
    .filter((v) => v.path)
    .sort((a, b) => b.path.length - a.path.length)
  for (const vault of vaults) {
    const root = resolve(vault.path)
    if (absPath === root || absPath.startsWith(root + sep)) {
      return {
        vault: basename(root),
        file: relative(root, absPath).replaceAll("\\", "/"),
      }
    }
  }
}

function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "note"
}

function mermaidBox(text: string) {
  return text.replaceAll('"', "'").replaceAll("[", "(").replaceAll("]", ")").replaceAll("\n", " ")
}

function isInside(parent: string, child: string) {
  const rel = relative(resolve(parent), resolve(child))
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel)
}

function visibleAlvarPath(root: string, file: string) {
  const abs = resolve(isAbsolute(file) ? file : join(root, file))
  let real = abs
  try {
    real = realpathSync(abs)
  } catch {
    real = abs.replace(`${sep}.alvar${sep}`, `${sep}alvar${sep}`)
    if (real.endsWith(`${sep}.alvar`)) real = real.slice(0, -6) + `${sep}alvar`
  }
  return real.replace(`${sep}.alvar${sep}`, `${sep}alvar${sep}`)
}

type Current = {
  topic?: string
  map?: string
  session?: string
  quiz?: string
  visual?: string
  node?: string
}

const NOW_FILE = "00 NOW.md"
const CURRENT_FILE = join("alvar", "current.json")

function wiki(path: string) {
  return path.replace(/\.md$/i, "")
}

function relFromRoot(root: string, abs: string) {
  return relative(root, abs).replaceAll("\\", "/")
}

function loadCurrent(root: string): Current {
  try {
    return JSON.parse(readFileSync(join(root, CURRENT_FILE), "utf8")) as Current
  } catch {
    return {}
  }
}

function rememberFile(root: string, abs: string, current: Current) {
  const rel = relFromRoot(root, abs)
  const n = rel.replaceAll("\\", "/")
  if (n.includes("/quizzes/")) current.quiz = rel
  else if (n.includes("/maps/")) current.map = rel
  else if (n.includes("/sessions/")) current.session = rel
  else if (n.includes("/visuals/")) current.visual = rel
  else if (n.includes("/knowledge/")) current.node = basename(rel, ".md").replaceAll("-", " ")
  return current
}

function titleFrom(root: string, rel?: string) {
  if (!rel) return
  try {
    const text = readFileSync(join(root, rel), "utf8")
    const goal = text.match(/^Goal:\s*(.+)$/m)
    if (goal) return goal[1].trim()
    const heading = text.match(/^#\s+(.+)$/m)
    if (heading) return heading[1].replace(/^Map — |^Session — |^Quiz — /, "").trim()
  } catch {
    return
  }
}

function renderNow(root: string, current: Current) {
  const topic =
    current.topic ||
    titleFrom(root, current.session) ||
    titleFrom(root, current.map) ||
    "What we are learning"
  const parts = [
    "---",
    "type: now",
    "---",
    "",
    "# Now",
    "",
    `**${topic}**`,
    "",
    "This note stays at the top of Aristotle. All notes live in `alvar/`.",
    "",
  ]
  if (current.quiz) {
    parts.push("## Quiz", "", `![[${wiki(current.quiz)}]]`, "")
  }
  if (current.map) {
    parts.push("## Map", "", `![[${wiki(current.map)}]]`, "")
  }
  if (current.session) {
    parts.push("## Session", "", `![[${wiki(current.session)}]]`, "")
  }
  const extras: string[] = ["- [[alvar/LEARNER|Learner profile]]"]
  if (current.visual) extras.push(`- [[${current.visual}|Figure]]`)
  parts.push("## Also", "", extras.join("\n"), "")
  return parts.join("\n")
}

function writeNow(root: string, current: Current) {
  mkdirSync(join(root, "alvar"), { recursive: true })
  writeFileSync(join(root, CURRENT_FILE), JSON.stringify(current, null, 2) + "\n", "utf8")
  const nowPath = join(root, NOW_FILE)
  writeFileSync(nowPath, renderNow(root, current), "utf8")
  return nowPath
}

function openNow(root: string, current: Current) {
  openInObsidian(root, writeNow(root, current))
}

function openInObsidian(_root: string, absPath: string) {
  const found = vaultOpenTarget(absPath)
  const uri = found
    ? `obsidian://open?vault=${encodeURIComponent(found.vault)}&file=${encodeURIComponent(found.file)}`
    : `obsidian://open?path=${encodeURIComponent(absPath)}`
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
  const abs = visibleAlvarPath(root, file)
  if (basename(abs) === NOW_FILE) return
  if (abs.endsWith(`${sep}current.json`)) return
  const alvar = join(root, "alvar")
  if (!isInside(alvar, abs) && abs !== join(alvar, "LEARNER.md")) return
  if (abs.includes(`${sep}templates${sep}`)) return
  if (SKIP_NAMES.has(basename(abs).toLowerCase())) return
  if (!OPEN_EXTS.has(extname(abs).toLowerCase())) return
  return abs
}

function quizMarkdown(args: {
  strand: string
  question: string
  a: string
  b: string
  c: string
}) {
  const q = mermaidBox(args.question)
  const a = mermaidBox(args.a)
  const b = mermaidBox(args.b)
  const c = mermaidBox(args.c)
  return `---
type: quiz
strand: ${args.strand}
---

# Quiz — ${args.strand}

Answer in the **OpenCode chat**: type **A**, **B**, **C**, or **D**. Do not guess.

\`\`\`mermaid
flowchart TD
  Q["${q}"]
  Q --> A["A. ${a}"]
  Q --> B["B. ${b}"]
  Q --> C["C. ${c}"]
  Q --> D["D. I don't know"]
\`\`\`

- [ ] A — ${args.a}
- [ ] B — ${args.b}
- [ ] C — ${args.c}
- [ ] D — I don't know
`
}

export const AristotleVisualPlugin: Plugin = async ({ directory }) => {
  const root = directory
  const alvar = join(root, "alvar")
  const visualsDir = join(alvar, "visuals")
  const quizzesDir = join(alvar, "quizzes")
  const pending = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined

  const flush = () => {
    timer = undefined
    const files = [...pending]
    pending.clear()
    if (files.length === 0) return
    let current = loadCurrent(root)
    for (const file of files) current = rememberFile(root, file, current)
    current.topic = titleFrom(root, current.session) || titleFrom(root, current.map) || current.topic
    openNow(root, current)
  }

  const queue = (file: string) => {
    const target = pickOpenPath(root, file)
    if (!target) return
    pending.add(target)
    if (timer) clearTimeout(timer)
    timer = setTimeout(flush, 80)
  }

  const writeAndOpen = (path: string, body: string) => {
    mkdirSync(dirnameSafe(path), { recursive: true })
    writeFileSync(path, body, "utf8")
    const current = rememberFile(root, path, loadCurrent(root))
    current.topic = titleFrom(root, current.session) || titleFrom(root, current.map) || current.topic
    openNow(root, current)
    return path
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
      obsidian_quiz: tool({
        description:
          "Write an interactive mermaid quiz into alvar/quizzes/current.md and open it in Obsidian. Use this for every probe and lock-in quiz. Do not paste A/B/C/D in chat. Do not use the OpenCode question tool. Do not open a browser. Wait for the learner to answer A/B/C/D in OpenCode chat.",
        args: {
          strand: tool.schema.string().describe("short strand tag, e.g. frames"),
          question: tool.schema.string().describe("quiz stem"),
          a: tool.schema.string().describe("option A"),
          b: tool.schema.string().describe("option B"),
          c: tool.schema.string().describe("option C"),
        },
        async execute(args) {
          const path = join(quizzesDir, "current.md")
          writeAndOpen(path, quizMarkdown(args))
          return `Updated 00 NOW.md with the quiz. Wait for A/B/C/D in chat.`
        },
      }),
      preview_markdown: tool({
        description:
          "Write a mermaid/markdown teaching note under alvar/visuals/ and open it in Obsidian. Never open a web browser.",
        args: {
          slug: tool.schema.string().describe("filename slug"),
          title: tool.schema.string().describe("note title"),
          markdown: tool.schema.string().describe("markdown with mermaid fences"),
        },
        async execute(args) {
          const slug = slugify(args.slug)
          const path = join(visualsDir, `${slug}.md`)
          const body = args.markdown.startsWith("#") ? args.markdown : `# ${args.title}\n\n${args.markdown}`
          writeAndOpen(path, body)
          return `Saved ${relative(root, path)} and refreshed 00 NOW.md`
        },
      }),
    },
  }
}

function dirnameSafe(path: string) {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"))
  return i === -1 ? "." : path.slice(0, i)
}

export default AristotleVisualPlugin
