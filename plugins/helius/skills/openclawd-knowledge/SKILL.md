---
name: openclawd-knowledge
description: Query the OpenClawd knowledge base (facts, gotchas, anti-patterns, decisions) under core-ai/knowledge. Use when debugging Clawd conventions, installer pitfalls, or prior swarm learnings.
---

# OpenClawd knowledge

Root: `$CORE_AI_ROOT/knowledge`. JSONL: `facts`, `codebase-facts`, `api-behaviors`, `patterns`, `anti-patterns`, `gotchas`, `decisions`. Markdown: `architecture-pieces.md`, `clawd-character.md`, `clawd-code-cli.md`, `clawd-tui.md`, `clawdrouter.md`, `openclawd.md`, `wiki.md`.

```bash
rg "<keyword>" "$CORE_AI_ROOT/knowledge"
```

Treat entries as prior art, not live chain state. Confidence is per-record (`high|medium|low`). Do not invent IDs when appending facts.
