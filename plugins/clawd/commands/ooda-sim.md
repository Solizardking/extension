---
name: ooda-sim
description: Run the Clawd OODA loop in paper/simulated mode and summarize the journal.
---

# OODA paper loop

1. Print laws: `clawdbot laws`.
2. Check readiness: `clawdbot trade cockpit`.
3. Start paper mode only: `clawdbot ooda --sim`.
4. For a bounded harness: `clawdbot ooda harness --ticks 50 --plan` then `--ticks 50`.
5. Tail `ooda/journal/ticks.jsonl` (or `clawdbot ooda journal --tail 20`).
6. Summarize signals, skipped trades, risk-gate rejects, and whether any path could have gone live.

Do not drop `--sim` unless the operator explicitly requests live capital.
