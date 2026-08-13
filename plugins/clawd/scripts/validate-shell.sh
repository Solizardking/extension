#!/usr/bin/env bash
set -euo pipefail

input=$(cat || true)

node -e '
const raw = process.argv[1] || "";
let parsed = {};
try { parsed = JSON.parse(raw || "{}"); } catch {}
const command = String(parsed.command || parsed.toolName || parsed.name || "").toLowerCase();
const liveTrade = /\bclawdbot\s+ooda\b/.test(command) && !/--sim\b/.test(command) && !/--dry-run\b/.test(command);
const swap = /execute_swap|place_order|cheshire_0x_price/.test(command);
const secrets = /(id\.json|keypair|\.env|ct_sk_|ZEROEX_API_KEY|MOONPAY_SECRET_KEY|sk_live_|sk_test_|private[_-]?key)/.test(command) && /\b(cat|curl|scp|cp|echo)\b/.test(command);

if (liveTrade) {
  process.stdout.write(JSON.stringify({
    permission: "ask",
    user_message: "This looks like a live OODA loop. Confirm paper mode (--sim) unless you intend live capital.",
    agent_message: "Clawd hook: live OODA without --sim requires explicit operator confirmation (Law V)."
  }));
  process.exit(0);
}

if (swap) {
  process.stdout.write(JSON.stringify({
    permission: "ask",
    user_message: "This MCP call can price or execute a swap. Review size, venue, and whether this is paper or live.",
    agent_message: "Clawd hook: swap/order MCP call requires confirmation (Law I / Law II)."
  }));
  process.exit(0);
}

if (secrets) {
  process.stdout.write(JSON.stringify({
    permission: "ask",
    user_message: "This command may expose a keypair, API key, or env secret. Review before continuing.",
    agent_message: "Clawd hook: possible secret disclosure (Law III / privacy by default)."
  }));
  process.exit(0);
}

process.stdout.write(JSON.stringify({ permission: "allow" }));
' "$input"

exit 0
