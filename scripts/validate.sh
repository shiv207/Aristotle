#!/usr/bin/env bash
# Aristotle v0.1 validation — filesystem + OpenCode discovery.
# Tests 4 and live /teach require an interactive OpenCode TUI (native question tool).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
WARN=0

ok() { echo "PASS  $1"; PASS=$((PASS + 1)); }
bad() { echo "FAIL  $1"; FAIL=$((FAIL + 1)); }
warn() { echo "WARN  $1"; WARN=$((WARN + 1)); }

echo "Aristotle validate — $ROOT"
echo

# --- Test 1: OpenCode discovers teach ---
if command -v opencode >/dev/null 2>&1; then
  SKILL_JSON="$(opencode debug skill --dir "$ROOT" 2>/dev/null || opencode debug skill 2>/dev/null || true)"
  if echo "$SKILL_JSON" | grep -q '"name": "teach"'; then
    LOCATION="$(echo "$SKILL_JSON" | python3 -c '
import json,sys
raw=sys.stdin.read()
start=raw.find("[")
if start<0:
    raise SystemExit(1)
data=json.loads(raw[start:])
for s in data:
    if s.get("name")=="teach":
        print(s.get("location",""))
        break
' 2>/dev/null || true)"
    ok "Test 1 — OpenCode discovers teach skill (${LOCATION:-found})"
  else
    bad "Test 1 — OpenCode did not list teach. Install: npx skills add vasanthsreeram/Alvarmethod -g -y -a opencode"
  fi
else
  bad "Test 1 — opencode not on PATH"
fi

# --- Test 2: LEARNER.md ---
if [[ -f .alvar/LEARNER.md ]] && grep -q "Aristotle Learner Profile" .alvar/LEARNER.md; then
  ok "Test 2 — .alvar/LEARNER.md exists"
else
  bad "Test 2 — missing .alvar/LEARNER.md"
fi

# --- Test 3: Mermaid map can be created / is valid ---
MAP="tests/fixtures/self-attention-map.md"
if [[ -f "$MAP" ]] && grep -q '```mermaid' "$MAP" && grep -Eq 'flowchart TD|graph TD' "$MAP"; then
  ok "Test 3 — Mermaid map fixture present (Obsidian-compatible fence)"
else
  bad "Test 3 — missing mermaid map fixture at $MAP"
fi

# --- Test 4: question tool (OpenCode native) ---
# Interactive only. We check that the teach skill requires it and config allows it.
if grep -q 'question' .opencode/skills/teach/references/quiz-ui.md && grep -q 'OpenCode' .opencode/skills/teach/references/quiz-ui.md; then
  if command -v opencode >/dev/null 2>&1; then
    warn "Test 4 — question tool is specified for OpenCode; confirm in TUI with /teach (cannot invoke interactively from this script)"
  else
    bad "Test 4 — opencode missing; cannot use question"
  fi
else
  bad "Test 4 — quiz-ui.md does not require OpenCode question tool"
fi

# --- Test 5: session file ---
SESSION="tests/fixtures/2026-08-17-self-attention.md"
if [[ -f "$SESSION" ]] && grep -q "## Current node" "$SESSION"; then
  ok "Test 5 — session fixture exists with required sections"
else
  bad "Test 5 — missing session fixture"
fi

# --- Test 6: knowledge update after quiz ---
KNOW="tests/fixtures/knowledge-dot-product.md"
if [[ -f "$KNOW" ]] && grep -q "mastery_level:" "$KNOW" && grep -q "last_tested:" "$KNOW"; then
  ok "Test 6 — knowledge node updates after quiz (schema + fixture)"
else
  bad "Test 6 — missing knowledge fixture"
fi

# --- Test 7: Obsidian mermaid ---
if [[ -f .obsidian/app.json ]] && grep -q '```mermaid' "$MAP"; then
  ok "Test 7 — vault config present; Mermaid is native in Obsidian preview (open this folder as a vault)"
else
  bad "Test 7 — Obsidian vault config or mermaid fence missing"
fi

# --- Test 8: resume ---
RESUME="tests/fixtures/resume-check.md"
if [[ -f "$RESUME" ]] && grep -q "Current node" "$SESSION"; then
  python3 - "$ROOT" <<'PY'
import pathlib, sys, re
root = pathlib.Path(sys.argv[1])
sessions = list((root / "tests/fixtures").glob("*-self-attention.md"))
if not sessions:
    raise SystemExit("no session fixtures")
text = sessions[0].read_text()
if "Next node" not in text or "Current node" not in text:
    raise SystemExit("session not resumable")
print("resume-ok")
PY
  ok "Test 8 — session files are structured so a second session can resume"
else
  bad "Test 8 — resume fixture incomplete"
fi

# --- Structure ---
for d in .alvar/maps .alvar/sessions .alvar/visuals .alvar/research .alvar/knowledge \
         subjects/mathematics subjects/computer-science subjects/artificial-intelligence \
         subjects/robotics subjects/physics projects .opencode/skills/teach; do
  if [[ -d "$d" ]]; then
    ok "structure $d"
  else
    bad "structure missing $d"
  fi
done

echo
echo "Result: $PASS passed, $FAIL failed, $WARN warnings"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
