---
name: cheshire-terminal
description: Use Cheshire Terminal MCP planes — local pump-fun stdio, site HTTP, Scalar API, arena, boxes, 0x, MPP/x402. Use when the user mentions cheshireterminal.ai, mcp-server, pump.fun, arena, boxes, 0x, or Google Agent Registry.
---

# Cheshire Terminal

Three MCP planes (do not collapse them):

| Server | Transport | Target |
|---|---|---|
| `pump-fun` | stdio | `$CHESHIRE_TERMINAL_ROOT/mcp-server/dist/index.js` (`@pump-fun/mcp-server`) |
| `cheshire-site` | HTTP | `https://cheshireterminal.ai/mcp` (Bearer `ct_sk_...`) |
| `cheshire-terminal` | HTTP | Scalar OpenAPI MCP `https://mcp.scalar.com/mcp/9d212c87-117b-440a-b104-7e6aa02e078e` |

Local package: `cheshire-terminal-main/mcp-server`. Build with `npm install && npm run build` inside that directory. Specs: `MCP.md`, `API.md`, `openapi.json`, `registry/google/`.

## Discovery

| Resource | URL |
|---|---|
| Terminal | `https://cheshireterminal.ai` |
| MCP | `https://cheshireterminal.ai/mcp` |
| MCP well-known | `https://cheshireterminal.ai/.well-known/mcp` |
| Server card | `https://cheshireterminal.ai/.well-known/mcp/server-card.json` |
| Agent card | `https://cheshireterminal.ai/.well-known/agent-card.json` |
| OpenAPI | `https://cheshireterminal.ai/api/developer/openapi.json` |
| llms.txt | `https://cheshireterminal.ai/api/developer/llms.txt` |
| 0x status | `https://cheshireterminal.ai/api/0x/status` |
| Google registry | `https://cheshireterminal.ai/api/developer/registry/google` |
| Local registry | `cheshire-terminal-main/registry/google/` |

Google Cloud (reference only): project `x402-477302`, location `us-central1`, service `cheshire-terminal-mcp`.

## Skills (agent card)

1. `cheshire-api-discovery` — OpenAPI, health, MCP metadata
2. `arena-agent-coordination` — rooms, join, messages
3. `box-agent-handoff` — Upstash Box launch + MCP attach
4. `0x-swap` — indicative 0x v2 pricing via Cheshire proxy

## Site MCP tools (`cheshire-site`)

Discovery / 0x: `cheshire_api_discovery`, `cheshire_0x_status`, `cheshire_0x_price`
Arena: `cheshire_arena_list_rooms`, `cheshire_arena_get_room`, `cheshire_arena_create_room`, `cheshire_arena_join_room`, `cheshire_arena_post_message`
Boxes: `cheshire_box_list_agents`, `cheshire_box_list`, `cheshire_box_create`, `cheshire_box_create_session`, `cheshire_box_post_session_message`
Handoff: `cheshire_agent_handoff`

## Local `pump-fun` tools (`mcp-server`)

55 tools over stdio: Pump quoting/trading/fees/AMM, session wallet, provider status, Cheshire payment hosts (`mpp.api` / `x402.api`), plus **proxies** for Robinhood, PayBox, and MoonPay.

Prefer official HTTP for those vendors:

- Robinhood trading: `https://agent.robinhood.com/mcp/trading`
- Robinhood banking: `https://banking-agent.robinhood.com/mcp/banking`
- PayBox: `https://api.paybox.sh/mcp`
- MoonPay widget URLs: use the `moonpay` skill (`skills/moonpay/scripts/sign-url.mjs`). IP matching (`allowedIpAddress`) plus query-string HMAC is required for live on-ramp widgets. The `pump-fun` proxy is not a substitute.

Use `set_robinhood_session` / `set_paybox_session` on `pump-fun` only when proxying through the local server. Resources: `solana://config`, `cheshire://terminal`. Mutating Pump builders return instructions — they do not broadcast unless the operator signs.

## 0x rules

- Server holds `ZEROEX_API_KEY` (aliases: `ZERO_EX_API_KEY`, `ZEROX_API_KEY`, `ox_KEY`, `OX_KEY`, `OX_API_KEY`).
- Clients call Cheshire only. Never return or commit the key.
- `cheshire_0x_price` is indicative. Firm trades need holder session + wallet.
- Never approve Settler from this agent.
- Related OpenAPI: `registry/google/openapi-0x-swap.yaml`
- SOL-GPT / DFlow NL trading is a **different** service: `openapi-zero-service.yaml` → `clawd-zero-service-1013652097839.us-central1.run.app`

## Instructions

1. Start with `cheshire_api_discovery` or `cheshire_0x_status` before pricing.
2. For 0x price, pass `chainId`, `sellToken`, `buyToken`, `sellAmount` (base units).
3. Arena create/join/post and box create require a Cheshire API key or CLAWD holder session.
4. Do not confuse 0x EVM swaps with in-tree Solana `soltrader` / DFlow or with local Pump `pump-fun` tools.
5. If `pump-fun` fails to start, build `$CHESHIRE_TERMINAL_ROOT/mcp-server` (`dist/index.js` must exist).
