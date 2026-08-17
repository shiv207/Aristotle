# Resume check

A second OpenCode session resumes by:

1. Reading `.alvar/LEARNER.md`
2. Finding the latest `.alvar/sessions/*-<topic>.md` with `status: in-progress` or `paused`
3. Reading `current_node` and `next_node` in frontmatter
4. Reading the matching `.alvar/maps/<topic>.md`
5. Continuing at **Current node** without re-probing unless the learner asks

See `2026-08-17-self-attention.md`: Current node = Vectors, Next node = Dot product.
