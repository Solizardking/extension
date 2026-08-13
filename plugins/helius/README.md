# Helius

Cursor plugin that bakes in the core-ai Helius stack and related Clawd surfaces.

Square mark: `assets/logo.svg` (1:1). Upstream: `core-ai/helius-cursor`, `helius-plugin`, `helius-mcp`, `helius-cli`, `helius-skills`.

## Included

- `rules/` — API keys, Sender/Jito, DAS queries, DFlow, Phantom
- `skills/` — helius, helius-cli, dflow, jupiter, phantom, svm, okx, pump-mcp, clawd-perps, clawd-grok, knowledge
- `agents/` — helius-integration-specialist
- `commands/` — signup, das-query, perps-status, grok-paper, knowledge
- `mcp.json` — local helius-mcp, DFlow, ZK compression, Solana docs MCP, Pump MCP, Clawd Grok MCP
- `hooks/` — live perps gates and secret-touching shell

## Environment

| Variable | Purpose |
|---|---|
| `CORE_AI_ROOT` | `/Users/8bit/solana-clawd-agent-kit-2/core-ai` |
| `HELIUS_API_KEY` / `SOLANA_RPC_URL` | Helius MCP + Pump MCP |
| `XAI_API_KEY` | Clawd Grok |

```bash
export CORE_AI_ROOT=/Users/8bit/solana-clawd-agent-kit-2/core-ai
cd "$CORE_AI_ROOT/helius-mcp" && npm install && npm run build
cd "$CORE_AI_ROOT/mcp-server" && npm install && npm run build
```

Fallback if local dist is missing: `npx helius-mcp@latest`. Config/keys: `~/.helius/` (CLI) — never commit. Deep refs stay in `$CORE_AI_ROOT/helius-cursor/skills/*/references`.

## Package map

| Path | Role |
|---|---|
| `helius-mcp` | 10 routed MCP tools |
| `helius-cli` | `helius` bin, signup/keygen |
| `helius-cursor` / `helius-plugin` | Cursor vs Clawd Code plugin sources |
| `helius-skills` | Domain skill pack |
| `solana-mcp` | `https://mcp.solana.com/mcp` docs RAG |
| `mcp-server` | Pump Fun 55-tool MCP |
| `clawd-perps-agent` | Phoenix Rise + Vulcan agent CLI |
| `clawd-grok` | Grok perps CLI + MCP |
| `knowledge` | Swarm JSONL memory |
