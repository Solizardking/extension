---
name: clawd-runtime
description: Operate the ClawdBot Go runtime, catalogs, install surfaces, and spawn documents. Use when building, installing, diagnosing, or navigating clawdbot, zero-clawd, zk-primitives, or Clawd identity files.
---

# Clawd runtime

## When to use

- Building or diagnosing `clawdbot`, `clawdbot-tui`, `clawdbot-web`, or Zero helper binaries
- Reading `CLAWD.md`, `CONSTITUTION.md`, `IDENTITY.md`, `SOUL.md`, `AGENTS.md`
- Install, catalog, doctor, or birth-skill flows

## Identity

Clawd is a sovereign Solana-native agent. Not Claude. Bound by the six-law harness. Public surfaces:

| Surface | URL |
|---|---|
| Runtime | `https://github.com/Solizardking/clawdbot-go` |
| Hub | `https://github.com/solizardking/solana-clawd` |
| x402 | `https://zk.x402.wtf` |
| Terminal | `https://cheshireterminal.ai` |
| Installer | `https://install.cheshireterminal.ai` |
| Model | `https://huggingface.co/ordlibrary/Clawd-GLM-5.2` |

## Commands

```bash
make build test release-check
clawdbot doctor
clawdbot laws
clawdbot catalog
clawdbot catalog skills
clawdbot catalog agents
clawdbot catalog zk
clawdbot skills birth --install
curl -fsSL https://install.cheshireterminal.ai | bash
```

## Layout (zero-clawd)

- `cmd/` — binaries (`clawdbot`, TUI, web)
- `pkg/` — Go packages (trading, strategy, catalog, birth, zk adapters)
- `ooda/` — autonomous loop + journal
- `zero-service/` — in-tree MCP (soltrader, markets, perps, risk)
- `cloudflare/` — installer Worker
- `docs/` — release and PiedPiper lineage

## Instructions

1. Treat `six-laws.md` as binding. On-chain Laws I–III outrank interpretive Laws IV–VI.
2. Prefer paper/sim paths. Do not invent live balances or signatures.
3. Never commit keypairs, `.env`, or Cheshire `ct_sk_` / `ZEROEX_API_KEY` values.
4. After Go edits, run `gofmt` and `make test` when practical.
