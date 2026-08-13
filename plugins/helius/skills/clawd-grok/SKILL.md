---
name: clawd-grok
description: Operate Clawd Grok — Grok-powered Phoenix perps CLI with paper trading, strategies, Telegram, and local MCP. Use when the user mentions clawd-grok, grok perps, or OpenTUI trading.
---

# Clawd Grok

Source: `$CORE_AI_ROOT/clawd-grok`. Bin: `clawd-grok`. Needs Bun 1.0+ and `XAI_API_KEY` / `GROK_API_KEY`.

```bash
clawd-grok --prompt "show me SOL perps orderbook depth"
clawd-grok -p "analyze SOL-PERP RSI and MACD on 4h, recommend entry"
clawd-grok mcp --groups market,trade,position,margin
```

Paper-first. Do not place live orders unless the operator arms live flags. MCP groups: market, trade, position, margin.
