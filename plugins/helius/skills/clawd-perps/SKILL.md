---
name: clawd-perps
description: Run the Clawd perps agent (Phoenix Rise reads, Vulcan plans, paper/observe, gated live MM/TWAMM). Use when the user mentions clawd-perps, clawd-agents-perps, Rise, or on-chain market maker.
---

# Clawd perps agent

Source: `$CORE_AI_ROOT/clawd-perps-agent`. Bin: `clawd-agents-perps` → `dist/cli.js`.

```bash
node dist/cli.js status
node dist/cli.js frontend
node dist/cli.js imperial-scan --symbols SOL,BTC,ETH --size 100
node dist/cli.js onchain-mm status
node dist/cli.js twamm status
```

Paper/observe by default. `onchain-mm run` needs `CLAWD_ONCHAIN_MM_LIVE=true`, `OPERATOR_CONFIRMED=true`, and `--yes`. Same gates for `twamm crank` (`CLAWD_TWAMM_LIVE`). Rise is the read plane; Vulcan is execution planning. No keys in this package.
