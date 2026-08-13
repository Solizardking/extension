---
name: paper-trade
description: Run Clawd Code TRADE MODE in paper/sim and print preflight plus signal breakdown.
---

# Paper trade

1. `clawd-code verify`.
2. `clawd-code perps` and/or `clawd-code funding` for context.
3. `clawd-code trade "<intent>"` with paper still armed.
4. Return preflight, execution mode (PAPER), and momentum/funding/liquidity scores.
5. Refuse live unless the operator explicitly sets all three live gates.
