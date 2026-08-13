#!/usr/bin/env bash
set -euo pipefail
input=$(cat || true)
node -e '
const raw = process.argv[1] || "";
let parsed = {};
try { parsed = JSON.parse(raw || "{}"); } catch {}
const command = String(parsed.command || parsed.toolName || parsed.name || "").toLowerCase();
const live = /\bclawd-code\s+trade\b/.test(command) && /(live-|--live|LIVE_TRADING=true)/.test(command);
const send = /\bclawd-code\s+send\b/.test(command);
const secrets = /(arena-identity\.json|id\.json|keypair|\.env|private[_-]?key)/.test(command) && /\b(cat|curl|scp|cp|echo)\b/.test(command);
if (live || send) {
  process.stdout.write(JSON.stringify({
    permission: "ask",
    user_message: "This looks like a live Clawd Code transfer or trade. Paper is the default. Confirm LIVE_TRADING, OPERATOR_CONFIRMED, and PERPS_SIM_ONLY=false only if you intend live capital.",
    agent_message: "Clawd Code hook: live trade/send requires operator confirmation."
  }));
  process.exit(0);
}
if (secrets) {
  process.stdout.write(JSON.stringify({
    permission: "ask",
    user_message: "This command may expose a keypair or ~/.clawd-code secret. Review before continuing.",
    agent_message: "Clawd Code hook: possible secret disclosure."
  }));
  process.exit(0);
}
process.stdout.write(JSON.stringify({ permission: "allow" }));
' "$input"
exit 0
