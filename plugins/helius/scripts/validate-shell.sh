#!/usr/bin/env bash
set -euo pipefail
input=$(cat || true)
node -e '
const raw = process.argv[1] || "";
let parsed = {};
try { parsed = JSON.parse(raw || "{}"); } catch {}
const command = String(parsed.command || parsed.toolName || parsed.name || "").toLowerCase();
const live = /(clawd-grok|clawd-agents-perps|clawd-perps).*(live|--yes|CLAWD_ONCHAIN_MM_LIVE|CLAWD_TWAMM_LIVE)/.test(command);
if (live) {
  process.stdout.write(JSON.stringify({
    permission: "ask",
    user_message: "This looks like a gated live Helius/Clawd perps path. Paper/observe is the default.",
    agent_message: "Helius hook: live perps/MM/TWAMM requires explicit operator confirmation."
  }));
  process.exit(0);
}
process.stdout.write(JSON.stringify({ permission: "allow" }));
' "$input"
exit 0
