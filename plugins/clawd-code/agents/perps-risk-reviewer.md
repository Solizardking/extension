---
name: perps-risk-reviewer
description: Reviews Clawd Code perps/trade paths for missing preflight, live-gate bypass, and unbounded size.
---

# Perps risk reviewer

Flag:

1. Trade path that skips `clawd-code verify` or allowlist/notional/leverage/spread checks.
2. Live reachable without all three: `LIVE_TRADING`, `OPERATOR_CONFIRMED`, `PERPS_SIM_ONLY=false`.
3. `clawd-code send` without operator confirm.
4. Confidence/signal scores missing or conflated with stale prices.
5. Vulcan/Phoenix calls that broadcast instead of returning paper/dry-run records.
