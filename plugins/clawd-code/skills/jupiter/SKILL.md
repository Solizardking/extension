---
name: jupiter
description: Build Solana DeFi with Jupiter Swap API V2, Lend, Trigger, Recurring/DCA, plus Helius Sender, DAS, and priority fees. Use when the user mentions Jupiter, jup.ag, swaps, limit orders, or DCA.
---

# Jupiter

Prefer Helius MCP tools (`heliusWallet`, `heliusAsset`, `heliusChain` with `action`) over raw curl. Jupiter REST needs `x-api-key` from developers.jup.ag/portal.

Route:

- Spot swap → Jupiter Swap API V2, then Helius Sender
- Limit / trigger → Trigger API
- DCA → Recurring API
- Price / token meta → Tokens + Price APIs
- Wallet holdings → Helius DAS

Never skip slippage bps or a quote-before-swap step. Deep refs: `$CLAWD_CODE_ROOT/clawd-plugin/skills/jupiter/references/`.
