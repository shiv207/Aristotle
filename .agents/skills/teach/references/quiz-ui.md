# Quiz UI — use the harness tool, never markdown MCQs

Do **not** print A/B/C/D in the chat transcript. Every probe and lock-in quiz must go through the interactive question tool this agent already has. Wait for the tool result before scoring.

If more than one of these tools exists, pick the first match in the table.

| If you have this tool | Harness | Call it |
|-----------------------|---------|---------|
| `ask_user_question` | **Grok Build** or **Codex** | `ask_user_question` |
| `AskUserQuestion` | **Claude Code** | `AskUserQuestion` |
| `question` | **OpenCode** | `question` |
| `quiz` | **Pi** (quiz extension) | `quiz` |
| `ask_user` / `askUserQuestion` / `ask_user_question` | **Pi** (ask-user extension) | that tool |

No match → say which tool is missing and stop. Do not fall back to pasted multiple choice.

## Shared quiz shape

- 1–3 questions per call. Wait.
- One right answer. `multi_select` / `multiSelect` / `multiple` = false.
- Options: 3 content choices + **I don't know**.
- Do **not** mark the correct option `(Recommended)` or put it first on purpose. That leaks the answer. Shuffle or keep a fixed A/B/C order that is not “right answer first.”
- Free-text / Other is for talk-through. Treat a typed reason as signal when scoring.
- Header / strand tag: short (≤12 chars if the tool requires it), e.g. `synbio`, `promoter`, `dogma`.

## Grok — `ask_user_question`

```
ask_user_question
  questions:
    - question: "<stem>"
      options:
        - label: "<choice>"
          description: "<what this choice means, not whether it is right>"
        - label: "I don't know"
          description: "Skip this strand; do not guess."
      multi_select: false
```

Grok always adds Other. That is the talk-through slot.

## Claude Code — `AskUserQuestion`

```
AskUserQuestion
  questions:
    - question: "<stem>"
      header: "<strand>"
      options:
        - label: "<choice>"
          description: "<what this choice means>"
        - label: "I don't know"
          description: "Skip this strand; do not guess."
      multiSelect: false
```

## Codex — `ask_user_question`

Same job as Grok: tabbed questionnaire, constrained answers. One right option + I don't know. Do not use `request_user_input` for graded quizzes.

## OpenCode — `question`

```
question
  questions:
    - header: "<strand>"
      text: "<stem>"
      options:
        - label: "<choice>"
          description: "<what this choice means>"
        - label: "I don't know"
          description: "Skip this strand; do not guess."
```

## Pi

1. If `quiz` exists (graded quiz extension, as in Eero Alvar’s demo), use it.
2. Else `ask_user` / `askUserQuestion` / `ask_user_question`.
3. Else tell the user to install a quiz or ask-user extension (`pi install npm:pi-ask-user` or their preferred quiz package). Still do not paste MCQs.

## Scoring after the tool returns

Map the selected label to A/B/C/D only in the **map file**, not in the next chat turn as a new quiz. Then update `.alvar/maps/<slug>.md` and continue.
