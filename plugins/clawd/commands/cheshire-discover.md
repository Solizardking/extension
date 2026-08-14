---
name: cheshire-discover
description: Probe Cheshire Terminal MCP discovery, 0x readiness, and Google Agent Registry metadata.
---

# Cheshire discovery

1. Prefer MCP tool `cheshire_api_discovery`. Fallback: open these URLs:

- `https://cheshireterminal.ai/.well-known/mcp`
- `https://cheshireterminal.ai/.well-known/mcp/server-card.json`
- `https://cheshireterminal.ai/.well-known/agent-card.json`
- `https://cheshireterminal.ai/api/0x/status`

2. If `CHESHIRE_API_KEY` is set, call site MCP at `https://cheshireterminal.ai/mcp` with `Authorization: Bearer ct_sk_...`.
3. Confirm local `pump-fun`: `$CHESHIRE_TERMINAL_ROOT/mcp-server/dist/index.js` exists (build with `npm run build` in `mcp-server/`). Read resource `cheshire://terminal` if the server is up.
4. Run `cheshire_0x_status`. Do not print `ZEROEX_API_KEY`.
5. Local spec mirror: `cheshire-terminal-main/registry/google/` plus `mcp-server/openapi.json`, `MCP.md`, `API.md`.
6. Report all three planes (site / Scalar / local pump-fun), auth scheme, tool names, 0x `configured` flag, and whether zero-service (DFlow SOL-GPT) is a separate host.
