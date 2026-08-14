---
name: clawd-trading
description: Run Clawd OODA trading, risk gates, Vulcan perps, DFlow/Jupiter spot, and Robinhood Agentic MCP. Use when sizing positions, backtesting, paper trading, or reviewing live-execution code.
---

# Clawd trading

## When to use

- OODA loop, strategy mutations, backtests
- Vulcan perps, DFlow/Jupiter spot, Robinhood Agentic
- Risk, drawdown, or position-sizing questions

## Binding constraints

- Stop on every entry. Kelly is a ceiling, not a target.
- Paper (`clawdbot ooda --sim`) before live.
- Min liquidity $50,000 USD; min volume $100,000 USD/24h.
- Max position 10–25% of portfolio unless the operator sets a tighter cap.
- Primary research metric: Sharpe × win rate. Secondary: max drawdown < 15%, ≥ 10 backtest trades.

## Epistemology

- **KNOWN** — API data from the last ~60s
- **LEARNED** — patterns from recorded outcomes
- **INFERRED** — correlations held loosely

Never conflate a stale price with a known fact.

## CLI

```bash
clawdbot trade cockpit
clawdbot trade risk SOL --price 150 --volume24h 25000000 --liquidity 15000000
clawdbot ooda --sim
clawdbot ooda harness --ticks 50 --plan
clawdbot solana trending
clawdbot solana research <mint>
```

## MCP

- `soltrader` / `clawd-soltrader` — quote before `execute_swap`; respect `MAX_SWAP_INPUT_AMOUNT`
- `perps` / `vulcan` — pre-trade margin, leverage tier, and TPSL checks
- `risk` — portfolio limits and circuit breakers
- `clawd-mesh` — free completions at `https://mesh.x402.wtf/v1/chat/completions`
- `cheshire-terminal` — 0x **price** via server-side `ZEROEX_API_KEY`; never approve Settler

## Instructions

1. Quote, then size, then (if live) confirm with the operator.
2. Reject trades that fail liquidity, volatility, authority, or concentration checks.
3. Log hypotheses and outcomes; only promote `strategy.md` when the metric improves.
