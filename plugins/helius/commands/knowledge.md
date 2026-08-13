---
name: knowledge
description: Search core-ai/knowledge JSONL and markdown for OpenClawd swarm learnings.
---

# Knowledge query

1. `rg -n "<keywords>" $CORE_AI_ROOT/knowledge`.
2. Prefer `gotchas.jsonl` / `anti-patterns.jsonl` / `decisions.jsonl` for pitfalls.
3. Cite `id` and confidence. Do not treat stale facts as live RPC.
