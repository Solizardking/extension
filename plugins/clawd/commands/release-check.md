---
name: release-check
description: Run ClawdBot Go release verification (tests, lint, audit) before publishing.
---

# Release check

1. Confirm Go 1.26.4 or newer (`go version`).
2. From the ClawdBot / zero-clawd repo root, run `make release-check`.
3. If available, also run `govulncheck ./...`.
4. Confirm no keypairs, `.env`, or `ct_sk_` / `ZEROEX_API_KEY` values are staged.
5. Report pass/fail with the first failing target and the command to reproduce.
