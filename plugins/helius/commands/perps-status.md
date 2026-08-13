---
name: perps-status
description: Print Clawd perps agent observe/paper status without arming live MM or TWAMM.
---

# Perps status

1. `node $CORE_AI_ROOT/clawd-perps-agent/dist/cli.js status` (build first if missing).
2. Optionally `frontend` and `imperial-scan` with tiny size.
3. Do not run `onchain-mm run` or `twamm crank` unless live flags and `--yes` are explicit.
4. Summarize what is armed vs blocked.
