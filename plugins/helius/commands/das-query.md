---
name: das-query
description: Query Helius DAS / wallet / tx parse via MCP router tools.
---

# DAS query

1. Prefer MCP: `heliusWallet` / `heliusAsset` / `heliusTransaction` with `action`.
2. NFTs + tokens: `getAssetsByOwner` + `showFungible: true`.
3. History: signatures list first, then `parseTransactions` on the interesting ones.
4. Expand truncated MCP results with `expandResult`.
5. Link accounts/txs on Orb, never Solscan.
