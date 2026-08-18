# Quiz UI — Obsidian mermaid, never chat MCQs and never a browser

This vault runs in **OpenCode + Obsidian**.

Do **not** print A/B/C/D in the OpenCode transcript. Do **not** call OpenCode `question`. Do **not** open HTML in a web browser.

## This vault (required)

Call `obsidian_quiz` with `strand`, `question`, `a`, `b`, `c`.

That writes `alvar/quizzes/current.md` as a mermaid flowchart (D is always I don't know) and opens it in Obsidian.

Then stop. Wait for the learner to type A/B/C/D in OpenCode chat. Score that reply.

- One right answer among A/B/C. D = I don't know.
- Do not mark the correct option or put it first on purpose.
- After scoring, update `alvar/maps/<slug>.md`. Do not paste a new quiz in chat.

## Other harnesses (only if `obsidian_quiz` is missing)

| If you have this tool | Harness | Call it |
|-----------------------|---------|---------|
| `obsidian_quiz` | **This vault** | `obsidian_quiz` |
| `ask_user_question` | Grok / Codex | `ask_user_question` |
| `AskUserQuestion` | Claude Code | `AskUserQuestion` |
| `question` | OpenCode (do not use here) | skip |
| `quiz` / `ask_user` | Pi | that tool |
