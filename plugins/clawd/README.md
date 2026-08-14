# Clawd

Cursor plugin for the Clawd / ClawdBot Go runtime and Cheshire Terminal.

Square mark: `assets/logo.svg` (1:1, 128×128 viewBox).

## Included

- `rules/` — six-law harness, Go runtime standards, trading safety, MoonPay URL signing
- `skills/` — runtime, trading, catalog, Cheshire Terminal, MoonPay, free Clawd Mesh
- `agents/` — constitution reviewer, trading-risk reviewer
- `commands/` — catalog, paper OODA, release-check, spawn, Cheshire discovery, MoonPay sign
- `hooks/hooks.json` — format Go edits; confirm live OODA / swaps
- `mcp.json` — Helius, Solana docs MCP, local pump-fun, Cheshire site/Scalar HTTP, PayBox, Zero, ClawdBrowser, Vulcan
- `scripts/` — hook implementations

## Environment

| Variable | Purpose |
|---|---|
| `CORE_AI_ROOT` | Path to `core-ai` (`helius-mcp/dist/index.js`) |
| `CHESHIRE_TERMINAL_ROOT` | Path to `cheshire-terminal-main` (local pump MCP) |
| `CHESHIRE_API_KEY` | Bearer credential for Cheshire site MCP |
| `ZERO_CLAWD_ROOT` | Path to the zero-clawd checkout |
| `CLAWDBROWSER_ROOT` | Path to ClawdBrowser |

Build the local MCP once, then point the plugin at it:

```bash
export CHESHIRE_TERMINAL_ROOT=/path/to/cheshire-terminal-main
cd "$CHESHIRE_TERMINAL_ROOT/mcp-server" && npm install && npm run build
```

Free editor inference uses [Clawd Mesh](https://mesh.x402.wtf) (`POST /v1/chat/completions`, no credential for local models).

## Surfaces

- Runtime: `https://github.com/Solizardking/clawdbot-go`
- Hub: `https://github.com/solizardking/solana-clawd`
- Terminal: `https://cheshireterminal.ai`
- Mesh: `https://mesh.x402.wtf`
