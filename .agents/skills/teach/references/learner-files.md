# Learner files

All session state lives in the **learner's working directory**, not in this skill repo.

```
.alvar/
  LEARNER.md                 # how this mind wants to be taught
  maps/<slug>.md             # probe results + mermaid plan for one goal
  sessions/<date>-<slug>.md  # plan + steps + quizzes
  knowledge/<slug>.md        # per-topic mastery record (YAML frontmatter)
  research/<slug>.md         # verification notes from learn-verify
  visuals/<slug>-<n>.svg     # diagrams from learn-visual
  templates/                 # file schemas Aristotle must follow
```

Create `.alvar/` on first use. Prefer the templates in `.alvar/templates/` when they exist.

## Knowledge nodes

After every quiz, write or update `.alvar/knowledge/<slug>.md`.

Status on a map: `known` | `edge` | `unknown` | `blocked`

Mastery on a knowledge node (do not skip levels):

`EXPOSED` → `UNDERSTOOD` → `RETAINED` → `APPLIED` → `MASTERED`

One correct easy question is at most `EXPOSED` or `UNDERSTOOD`. Never mark `MASTERED` from a single lock-in quiz.

## LEARNER.md

If missing, run `learn-profile` or write a stub from `assets/LEARNER.md` and ask 3–5 questions to fill it. Do not invent a personality.

Read LEARNER.md at the start of every `teach` session. It controls:

- voice and density
- how they want struggle
- what they already treat as solid
- whether they want visuals, mermaid, LaTeX, or a long markdown log

## Map file

```markdown
# Map — <goal>

Updated: <ISO date>
Goal: <one sentence>

## Strands
| strand | status | evidence |
|--------|--------|----------|
| line integrals | known | Q2 correct, explained work |
| Stokes | edge | recognized statement, missed Faraday link |
| differential forms | unknown | said so |
| SR field mix | blocked | answered "I don't know" |

Status: `known` | `edge` | `unknown` | `blocked`

## Quiz log
- Q1 [line integrals] C — correct
```

## Session file

```markdown
# Session — <goal>
Date:
Model:
Goal:

## Plan
\`\`\`mermaid
graph TD
  A[covector] --> B[1-form]
  B --> C[wedge]
\`\`\`

## Log
### Node: covector
- taught:
- visual:
- quiz:
- result: lock-in | retry | insert-prereq
```

Keep these files updated as you go. They are the persistence layer (the portable stand-in for a markdown-log / Obsidian pane).
