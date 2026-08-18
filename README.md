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
         obsidian_quiz   Mermaid     One Node
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
| OpenCode | Agent runtime, `/teach`; talk here, don't render HTML in a browser |
| Obsidian | Visible `alvar/` notes, mermaid maps, mermaid quizzes |
| `teach` skill | Probe → plan → one node → lock-in quiz |
| `probe` | Broad-then-narrow knowledge calibration |
| `learn-profile` | Interview that writes `alvar/LEARNER.md` |
| `learn-verify` | Claim → source → verdict before teaching as fact |
| `learn-visual` | Optional mermaid figure in Obsidian |
| `alvar/` | Filesystem state (visible in the vault; not a hidden dotfolder) |

Aristotle handles learning logistics. The learner handles the cognitive work.

## Installation

### Prerequisites

- [OpenCode](https://opencode.ai) (`opencode --version`)
- A Google Gemini key already stored in OpenCode auth (`opencode providers login` → Google if needed)
- Node.js / `npx` (to install or update skills)
- [Obsidian](https://obsidian.md) (optional, for reading the vault)

This vault is configured for **Gemini** (`google/gemini-3.5-flash`) in `opencode.json`. Credentials stay in `~/.local/share/opencode/auth.json`, not in git.

```bash
cd ~/Developer/Aristotle
opencode
```

Teaching skills live under `.agents/skills/` and `.opencode/skills/`. Slash commands: `/teach`, `/probe`, `/learn-profile`, `/learn-visual`.

Keep **OpenCode** for the conversation. Keep **Obsidian** open. All learning notes live in **`alvar/`**. **`00 NOW.md`** sits at the top of the Aristotle folder and always shows the current topic, quiz, and map.

This repo lives at `~/Developer/Aristotle` with a symlink at `~/Aristotle` when that path was free.

## Obsidian

OpenCode looks up whichever folder Obsidian actually has registered as a vault (right now that is `Developer` at `~/Developer`, not a vault named Aristotle). Notes then open as `Aristotle/alvar/...` inside that vault.

To make `alvar` sit at the vault root instead: Obsidian → **Open folder as vault** → `~/Developer/Aristotle`.

Quizzes are mermaid notes at `alvar/quizzes/current.md`. **`00 NOW.md`** at the top of the Aristotle folder always shows the current topic, quiz, and map. Answer A/B/C/D back in OpenCode.

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

1. Load `alvar/LEARNER.md`
2. Reuse a recent map for this goal, or probe
3. Probe with a mermaid quiz in Obsidian (`obsidian_quiz`)
4. Build and show a Mermaid dependency graph in `alvar/maps/`
5. Teach the first node — only one
6. Lock-in quiz in Obsidian; answer in OpenCode
7. Evaluate, update knowledge, persist the session
8. Continue or insert a prerequisite

Related commands: `/probe`, `/learn-profile`.

## File structure

```text
Aristotle/
├── alvar/                  # visible learning notes (maps, quizzes, sessions)
│   ├── LEARNER.md
│   ├── maps/
│   ├── quizzes/
│   ├── sessions/
│   ├── visuals/
│   ├── research/
│   ├── knowledge/
│   └── templates/
├── .agents/skills/         # Teaching skills
├── .opencode/              # OpenCode commands, skills, and Obsidian plugin
├── subjects/
├── projects/
├── AGENTS.md               # operating rules for the tutor
├── opencode.json
└── README.md
```

`alvar/` is the visible vault folder for maps, quizzes, and sessions. `.alvar` is only a symlink so older skills still work.

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
