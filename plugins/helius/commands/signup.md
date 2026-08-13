---
name: signup
description: Guide Helius API key setup via MCP signup or helius-cli.
---

# Helius signup

1. If the operator already has a key: `helius config set-api-key <key>` or MCP `setHeliusApiKey`. Do not echo the key.
2. Else: `helius keygen` then `helius signup --email …` → pay USDC in browser → `helius signup --resume`.
3. Autopay: `helius signup --pay` only if the CLI keypair is funded.
4. Confirm with a read-only call (`helius balance` or MCP `getBalance` on a public address).
