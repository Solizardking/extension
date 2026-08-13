# Clawd Code

Cursor plugin template for the Clawd Code CLI (`@solana-clawd/clawd-code`).

Square mark: `assets/logo.svg` (1:1, 128×128). Source tree: `core-ai/clawd-code`. Bundled Clawd plugin (deep refs): `core-ai/clawd-code/clawd-plugin`.

## Included

- `rules/` — paper-default live gates, CLI conventions
- `skills/` — clawd-code, agent-arena, jupiter, dflow, phantom, svm
- `agents/` — CLI reviewer, perps-risk reviewer
- `commands/` — verify, code, paper-trade, research, arena
- `hooks/` — confirm live trade/send and secret-touching shell
- `mcp.json` — clawd-code, Helius, Solana docs MCP, Pump MCP, Clawd Grok, Phoenix Rise, DFlow, ZK compression, Vulcan

## Environment

| Variable | Purpose |
|---|---|
| `CLAWD_CODE_ROOT` | Path to `core-ai/clawd-code` (`dist/cli.js`) |
| `CORE_AI_ROOT` | Path to `core-ai` (`helius-mcp/dist/index.js`) |
| `CHESHIRE_TERMINAL_ROOT` | Path to Cheshire `mcp-server` (Pump MCP) |
| `HELIUS_API_KEY` / `SOLANA_RPC_URL` | Helius + RPC |
| `XAI_API_KEY` | Grok (default provider) |

```bash
export CLAWD_CODE_ROOT=/Users/8bit/solana-clawd-agent-kit-2/core-ai/clawd-code
export CORE_AI_ROOT=/Users/8bit/solana-clawd-agent-kit-2/core-ai
cd "$CLAWD_CODE_ROOT" && npm install && npm run build
```

Runtime secrets stay in `~/.clawd-code/.env` (copy `.env.example`). Paper perps remain default.

## Links

- GitHub: `https://github.com/Solizardking/solana-clawd/tree/main/clawd-code`
- Install: `curl -fsSL https://raw.githubusercontent.com/Solizardking/solana-clawd/main/clawd-code/install.sh | sh`
- x402: `https://x402.wtf`
