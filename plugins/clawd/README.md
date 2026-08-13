# Clawd

Official Cursor plugin for the Clawd / ClawdBot Go runtime and Cheshire Terminal.

Square mark: `assets/logo.svg` (1:1, 128×128 viewBox).

## Included

- `rules/` — six-law harness, Go runtime standards, trading safety, MoonPay URL signing
- `skills/` — runtime, trading, catalog, Cheshire Terminal, MoonPay IP-matched widget URLs
- `agents/` — constitution reviewer, trading-risk reviewer
- `commands/` — catalog, paper OODA, release-check, spawn, Cheshire discovery, MoonPay sign
- `hooks/hooks.json` — gofmt on Go edits; confirm live OODA / swaps / secret-touching shell
- `mcp.json` — Helius, Solana docs MCP, local pump-fun, Cheshire site/Scalar HTTP, Robinhood, PayBox, Zero, ClawdBrowser, Vulcan
- `scripts/` — hook implementations

## Environment

| Variable | Purpose |
|---|---|
| `CORE_AI_ROOT` | Path to `core-ai` (`helius-mcp/dist/index.js`) |
| `CHESHIRE_TERMINAL_ROOT` | Path to `cheshire-terminal-main` (local `@pump-fun/mcp-server`) |
| `CHESHIRE_API_KEY` | Bearer `ct_sk_...` for `https://cheshireterminal.ai/mcp` |
| `MOONPAY_SECRET_KEY` | Backend-only `sk_test_` / `sk_live_` for signed widget URLs (IP matching) |
| `MOONPAY_PUBLISHABLE_KEY` | Widget `apiKey` (`pk_test_` / `pk_live_`); never used to sign |
| `ZERO_CLAWD_ROOT` | Path to the zero-clawd checkout (in-tree `zero-service` MCP) |
| `CLAWDBROWSER_ROOT` | Path to ClawdBrowser (birth `mcp-clawd` / `mcp-soltrader`) |
| `CLAWDBOT_SKILLS_DIR` / `CLAWDBOT_AGENTS_DIR` | Catalog roots |

Build the local MCP once, then point the plugin at it:

```bash
export CHESHIRE_TERMINAL_ROOT=/Users/8bit/solana-clawd-agent-kit-2/cheshire-terminal-main
cd "$CHESHIRE_TERMINAL_ROOT/mcp-server" && npm install && npm run build
```

Entry: `$CHESHIRE_TERMINAL_ROOT/mcp-server/dist/index.js` (stdio; same as monorepo `.mcp.json` `pump-fun`). Copy `mcp-server/.env.example` → `mcp-server/.env` for provider keys. Never commit it.

Robinhood MCP places trades only in the **Agentic** account after desktop OAuth. 0x keys stay on the Cheshire host. PayBox and Robinhood should be used as their official HTTP MCPs; `pump-fun` only proxies them after `set_robinhood_session` / `set_paybox_session`.

## Surfaces

- Runtime: `https://github.com/Solizardking/clawdbot-go`
- Hub: `https://github.com/solizardking/solana-clawd`
- Terminal / MCP: `https://cheshireterminal.ai` · `https://cheshireterminal.ai/mcp`
- Installer: `https://install.cheshireterminal.ai`
- x402: `https://zk.x402.wtf`
