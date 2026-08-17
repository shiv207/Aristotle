# Aristotle

A persistent one-to-one AI learning system.

Aristotle is not a chatbot. It is a local learning environment: the tutor adapts to what you actually know, teaches one reasoning step at a time, keeps a dependency graph, verifies important claims, draws a picture only when it helps, and writes the whole history to disk.

The teaching methodology is the open-source [Alvarmethod](https://github.com/vasanthsreeram/Alvarmethod) (Alvar method). The system you talk to is **Aristotle**.

## What it is

A personal tutor that lives in this folder. Open it in OpenCode to learn. Open it in Obsidian to review.

## Core loop

```text
Probe → Plan → Teach → Verify → Prove
```

1. **Probe** — calibrate what is known, partial, and missing.
2. **Plan** — write a Mermaid DAG and show it before teaching.
3. **Teach** — one node, then stop.
4. **Verify** — research claims that matter; quiz the node.
5. **Prove** — lock-in. On failure, repair the gap. Persist knowledge state.

## Architecture

```text
                         USER
                           │
                           ▼
                       OpenCode
                           │
                           ▼
                    Aristotle Skill
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
            Probe         Plan        Teach
              │            │            ▼
           Question      Mermaid     One Node
              │            │            │
              └────────────┼────────────┘
                           ▼
                        Verify
                           │
                           ▼
                         Quiz
                     ┌─────┴─────┐
                     ▼           ▼
                   PASS         FAIL
                     │           │
                     ▼           ▼
                  Prove       Repair Gap
                     │           │
                     └─────┬─────┘
                           ▼
                       Knowledge
                         State
                           │
                           ▼
                        Obsidian
```

| Component | What it does |
|-----------|----------------|
| OpenCode | Agent runtime, `/teach` command, native `question` quizzes |
| `teach` skill | Probe → plan → one node → lock-in quiz |
| `probe` | Broad-then-narrow knowledge calibration |
| `learn-profile` | Interview that writes `.alvar/LEARNER.md` |
| `learn-verify` | Claim → source → verdict before teaching as fact |
| `learn-visual` | Optional SVG/diagram when a picture locks the idea |
| `.alvar/` | Filesystem state (no database) |
| Obsidian | Human-facing vault: maps, sessions, Mermaid |

Aristotle handles learning logistics. The learner handles the cognitive work.

## Installation

### Prerequisites

- [OpenCode](https://opencode.ai) (`opencode --version`)
- Node.js / `npx` (to install or update skills)
- [Obsidian](https://obsidian.md) (optional, for reading the vault)

### Skills

Teaching skills come from Alvarmethod. From this directory:

```bash
npx skills add vasanthsreeram/Alvarmethod -g -y -a opencode
```

This vault also keeps a project-local copy under `.opencode/skills/` so OpenCode can discover `teach` when you run from here.

Verify discovery:

```bash
cd ~/Aristotle   # or this repo
opencode debug skill | grep '"name": "teach"'
```

Or run:

```bash
./scripts/validate.sh
```

### OpenCode

```bash
cd ~/Aristotle
opencode
```

This repo lives at `~/Developer/Aristotle` with a symlink at `~/Aristotle` when that path was free.

## Obsidian

Open this folder as a vault: **Open folder as vault** → `~/Aristotle` (or `~/Developer/Aristotle`).

Obsidian will show `.alvar/`, `subjects/`, and `projects/`. Mermaid fences in Markdown render in preview. No custom plugin is required for v0.1.

## Usage

```text
/teach I want to understand transformers deeply enough to implement self-attention from scratch.
```

Also:

```text
/teach <topic>
teach me X
help me learn X
I want to understand X
walk me through X
```

Aristotle should:

1. Load `.alvar/LEARNER.md`
2. Reuse a recent map for this goal, or probe
3. Probe missing knowledge with `question`
4. Build and show a Mermaid dependency graph
5. Teach the first node — only one
6. Ask a lock-in question
7. Evaluate, update knowledge, persist the session
8. Continue or insert a prerequisite

Related commands: `/probe`, `/learn-profile`.

## File structure

```text
Aristotle/
├── .alvar/                 # persistent learning state (Alvarmethod-compatible path)
│   ├── LEARNER.md
│   ├── maps/
│   ├── sessions/
│   ├── visuals/
│   ├── research/
│   ├── knowledge/
│   └── templates/
├── .opencode/              # OpenCode commands and skills
├── subjects/
├── projects/
├── AGENTS.md               # operating rules for the tutor
├── opencode.json
└── README.md
```

`.alvar` is named for compatibility with Alvarmethod skills. It is Aristotle's state directory.

## Philosophy

Usual materials are many-to-many. Aristotle is one-to-one.

- Teach **this** learner, at the edge of **this** understanding.
- Do not reteach `known`. Do not start in `unknown` with no ramp.
- Struggle stays in the material. Aristotle absorbs order, files, verification, and "what next."
- Understanding is not mastery.

## Tests

```bash
./scripts/validate.sh
```

See `tests/README.md` for the eight checks and what still needs a live OpenCode TUI.

## v0.1 scope

Local-first: OpenCode + agent skills + Markdown + YAML + Mermaid + Obsidian.

Not in v0.1: React, databases, RAG, auth, cloud, custom frontends, telemetry.
