---
name: clawd-catalog
description: Index Clawd agents, skills, ZK primitives, and birth MCP seeds. Use when listing agents, routing tasks, compressing catalogs, or spawning a new Clawd instance.
---

# Clawd catalog

## When to use

- `clawdbot catalog` and agent/skill discovery
- Spawn / birth MCP seeding
- Mapping a user request onto a named Clawd agent

## Local roots

- Skills — `CLAWDBOT_SKILLS_DIR`
- Agents — `CLAWDBOT_AGENTS_DIR`
- ZK — `./zk-primitives` (`CLAWDBOT_ZK_PRIMITIVES_DIR`)
- Birth MCP seed — `.agents/mcp.json` plus `zero-service/src/mcp-seed.mjs`

## CLI

```bash
clawdbot catalog
clawdbot catalog skills
clawdbot catalog agents
clawdbot catalog zk
clawdbot catalog compress --dry-run
clawdbot catalog --json
```

## Birth MCP seed

Every spawn registers:

| Server | Transport | Target |
|---|---|---|
| `clawd-mesh` | HTTP | `https://mesh.x402.wtf/v1/chat/completions` |
| `clawd` | stdio | `$CLAWDBROWSER_ROOT/zero-service/src/mcp-clawd.mjs` |
| `clawd-soltrader` | stdio | `$CLAWDBROWSER_ROOT/zero-service/src/mcp-soltrader.mjs` |

In-tree Zero workspace also seeds `soltrader`, `markets`, `perps`, and `risk`.

## Agent index (high-signal)

Orchestration: `clawd`, `elizero`, `clawdex`, `solana-openclawd-orchestrator`
Trading: `solana-autonomous-trader`, `solana-perpetuals-trader`, `solana-technical-analyst`
Analytics: `solana-whale-tracker`, `solana-memecoin-analyst`, `solana-onchain-sleuth`
Infra: `clawd-zk-agent`, `solana-helius-specialist`, `solana-rpc-optimizer`

Full table lives in zero-clawd `AGENTS.md`.

## Instructions

1. Prefer catalog JSON over guessing slugs.
2. Do not compress/publish catalogs with secrets inside.
3. New spawns inherit `CONSTITUTION.md`, `six-laws.md`, `CLAWD.md`, `three-laws.md`.
