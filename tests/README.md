# Aristotle tests

Run:

```bash
./scripts/validate.sh
```

| Test | What it checks | Automated? |
|------|----------------|------------|
| 1 | OpenCode discovers `teach` | Yes — `opencode debug skill` |
| 2 | `.alvar/LEARNER.md` exists | Yes |
| 3 | Mermaid map can be created | Yes — fixture + fence check |
| 4 | OpenCode native `question` tool | Partial — skill requires it; you must run `/teach` in the TUI |
| 5 | Session file created | Fixture + live `/teach` |
| 6 | Knowledge state updates after a quiz | Fixture schema; live quiz updates `.alvar/knowledge/` |
| 7 | Obsidian renders Mermaid | Fence + vault config; confirm in Obsidian preview |
| 8 | Second session can resume | Session schema has Current/Next node |

## Live loop

```bash
cd ~/Aristotle
opencode
```

Then:

```text
/teach I want to understand self-attention deeply enough to implement it from scratch in PyTorch.
```

Expected: probe (not a textbook), then a graph, then one concept, then a `question` quiz, then files under `.alvar/`.
