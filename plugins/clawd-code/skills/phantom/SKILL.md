---
name: phantom
description: Build Phantom-connected Solana frontends with @phantom/react-sdk, react-native-sdk, or browser-sdk plus Helius Sender and DAS. Use when the user mentions Phantom wallet, Connect SDK, token gating, or NFT minting UI.
---

# Phantom

No Phantom MCP. Users connect a wallet; you never ask for a seed phrase.

- Portal App ID required for OAuth / deeplink (`phantom.com/portal`). Injected extension flows can skip Portal.
- Sign and send via the SDK; submit with Helius Sender when available.
- Proxy Helius keys server-side. Do not embed `HELIUS_API_KEY` in browser bundles.

Deep refs: `$CLAWD_CODE_ROOT/clawd-plugin/skills/phantom/references/`.
