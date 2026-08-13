---
name: verify
description: Run Clawd Code environment preflight (keys, RPC, paper gates).
---

# Verify

1. Confirm `clawd-code` is on PATH, or `node $CLAWD_CODE_ROOT/dist/cli.js`.
2. Run `clawd-code verify`.
3. Report provider keys present (names only), RPC, `LIVE_TRADING` / `OPERATOR_CONFIRMED` / `PERPS_SIM_ONLY`.
4. Do not print secret values.
