# Knowledge

One Markdown file per concept. YAML frontmatter is the machine-updated record. The body is human-readable evidence.

Copy `.alvar/templates/knowledge-node.md`.

Example:

```yaml
topic: attention
conceptual_mastery: 0.72
application_mastery: 0.31
retention: unknown
confidence: medium
status: partial
mastery_level: UNDERSTOOD
last_tested: 2026-08-17
prerequisites:
  - matrix_multiplication
  - dot_product
```

`status`: `unknown` | `partial` | `known` | `blocked`

`mastery_level`: `EXPOSED` | `UNDERSTOOD` | `RETAINED` | `APPLIED` | `MASTERED` | `unknown`

No vector database in v0.1. Files are the index.
