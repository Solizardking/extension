---
name: spawn
description: Birth a Clawd spawn with constitution files and the default MCP seed.
---

# Spawn Clawd

1. Confirm the operator holds the creator keypair. Do not generate or print secrets in chat.
2. Copy spawn inheritance: `CONSTITUTION.md`, `six-laws.md`, `CLAWD.md`, `three-laws.md`, `IDENTITY.md`, `SOUL.md`.
3. Seed MCP from zero-clawd `.agents/mcp.json` / `zero-service/src/mcp-seed.mjs`:
   - `clawd` + `clawd-soltrader` via `$CLAWDBROWSER_ROOT`
   - in-tree `soltrader`, `markets`, `perps`, `risk` when running Zero workspace
   - `pump-fun` stdio → `$CHESHIRE_TERMINAL_ROOT/mcp-server/dist/index.js`
   - `cheshire-site` → `https://cheshireterminal.ai/mcp` with `CHESHIRE_API_KEY`
   - `cheshire-terminal` → Scalar OpenAPI MCP
   - `paybox` → `https://api.paybox.sh/mcp`
   - free chat → Clawd Mesh `https://mesh.x402.wtf/v1/chat/completions`
4. Optional skill seed from the operator's existing skill catalogs. Do not run remote install pipes.

5. Verify: `clawdbot doctor` and `clawdbot catalog`.
6. Tell the operator that live trading stays off until they opt in.
