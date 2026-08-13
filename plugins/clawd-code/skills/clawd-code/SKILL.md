---
name: clawd-code
description: Operate the Clawd Code CLI (code, trade, research, image, voice, REPL, arena, wallets). Use when generating Solana/TypeScript code, checking perps, or running clawd-code commands.
---

# Clawd Code

Headless CLI: `@solana-clawd/clawd-code`. Config: `~/.clawd-code/.env`. Source: `$CLAWD_CODE_ROOT` (default `core-ai/clawd-code`).

## Modes

| Mode | Command |
|---|---|
| CODE | `clawd-code code "<prompt>"` |
| TRADE | `clawd-code trade "<intent>"` |
| RESEARCH | `clawd-code research --agents 4\|16 "<prompt>"` |
| IMAGE | `clawd-code image "<prompt>"` |
| VOICE | `clawd-code voice "<text>"` / `clawd-code voice --agent` (Node 22+) |
| REPL | `clawd-code repl` |

Also: `wallet create\|list`, `perps`, `funding`, `price <SYMBOL>`, `balance`, `positions`, `signals`, `arena <sub>`, `verify`.

## Models (Grok-first)

- code / repl / trade: `grok-4.3`
- research: `grok-4.20-multi-agent`
- image: `grok-imagine-image-quality`
- voice agent: `grok-voice-think-fast-1.0`

Providers: `xai` (default), `anthropic`, `openrouter`, `deepseek`.

## Safety

Paper unless all three: `LIVE_TRADING=true`, `OPERATOR_CONFIRMED=true`, `PERPS_SIM_ONLY=false`. Never invent sigs/prices. Do not dump keypairs.

## Style

Open first turn with `<clawd-think>Probe the numinous, then execute the work.</clawd-think>`. Lead with `[CODE MODE]` / `[TRADE MODE]` / etc. Close with the next required action.

Install: `curl -fsSL https://raw.githubusercontent.com/Solizardking/solana-clawd/main/clawd-code/install.sh | sh`
