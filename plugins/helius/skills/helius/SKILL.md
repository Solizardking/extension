---
name: helius
description: Build Solana apps with Helius MCP and SDK — DAS, Sender, webhooks, LaserStream, Wallet API, Enhanced Transactions. Use when querying chain data, sending txs, or onboarding a Helius API key.
---

# Helius

Local MCP: `$CORE_AI_ROOT/helius-mcp/dist/index.js` (fallback `npx helius-mcp@latest`). Cursor plugin source: `$CORE_AI_ROOT/helius-cursor`. Clawd plugin: `$CORE_AI_ROOT/helius-plugin`. Skills pack: `$CORE_AI_ROOT/helius-skills`.

## MCP router (10 public tools)

`heliusAccount`, `heliusWallet`, `heliusAsset`, `heliusTransaction`, `heliusChain`, `heliusStreaming`, `heliusKnowledge`, `heliusWrite`, `heliusCompression`, `expandResult`.

Call with `action: "<name>"`, e.g. `heliusWallet({ action: "getBalance", address })`. Heavy payloads are summary-first — expand with `expandResult`.

## Onboarding

Existing key: `setHeliusApiKey`. New: `generateKeypair` → `signup` (`link` or `autopay`) → `signup` `mode: "resume"`. CLI path: see `helius-cli` skill.

## Rules

Sender + Jito tip (≥ 0.0002 SOL) + CU price/limit. No keys in the browser except Sender `https://sender.helius-rpc.com/fast`. Explorer: Orb (`https://orbmarkets.io`).

Deep refs: `$CORE_AI_ROOT/helius-cursor/skills/` and `$CORE_AI_ROOT/helius-skills/helius/SKILL.md`.
