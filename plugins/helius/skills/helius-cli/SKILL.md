---
name: helius-cli
description: Operate the Helius CLI (helius-cli) for keygen, signup, API keys, balances, and tx parse. Use when the user mentions helius CLI, ~/.helius, or dashboard signup.
---

# Helius CLI

Package `helius-cli`, bin `helius`. Source: `$CORE_AI_ROOT/helius-cli`. Config: `~/.helius/config.json` + `~/.helius/keypair.json`.

```bash
helius config set-api-key <key>
helius keygen
helius signup --email you@example.com --first-name Jane --last-name Doe
helius signup --resume
helius signup --pay --email you@example.com --first-name Jane --last-name Doe
helius balance <wallet>
helius tx parse <signature>
```

`--json` responses are `{ ok, v: 1, data }` or `{ ok: false, v: 1, error_code, category, error, recoverable, suggestion?, details? }`. Never print `keypair.json`. Docs: `https://www.helius.dev/cli.md`.
