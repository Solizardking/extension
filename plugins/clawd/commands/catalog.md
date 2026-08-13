---
name: catalog
description: Inspect the local Clawd skills, agents, and ZK catalog via clawdbot.
---

# Clawd catalog

1. Confirm `clawdbot` is on `PATH` (build with `make build` in zero-clawd if needed).
2. Run `clawdbot catalog` for a summary.
3. Optionally run `clawdbot catalog skills`, `clawdbot catalog agents`, and `clawdbot catalog zk`.
4. Use `clawdbot catalog --json` when the operator wants a machine-readable report.
5. For a bundle dry-run only: `clawdbot catalog compress --dry-run`.
6. Report counts, missing roots (`CLAWDBOT_SKILLS_DIR`, `CLAWDBOT_AGENTS_DIR`, `CLAWDBOT_ZK_PRIMITIVES_DIR`), and any secrets that must not be packed.
