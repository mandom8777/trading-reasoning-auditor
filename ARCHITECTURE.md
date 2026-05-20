# Architecture — Trading Reasoning Auditor

## Pipeline overview

```
            upstream strategy webhook (signal)
                        │
                        ▼
   ┌────────────────────────────────────┐
   │ 1. Signal Detector (deterministic) │
   │  - normalize payload               │
   │  - enrich with current order book  │
   │  - score "interesting" threshold   │
   └────────────┬───────────────────────┘
                │ enriched signal
                ▼
   ┌────────────────────────────────────┐
   │ 2. Strategy Explainer ★ MiMo       │
   │  - translate indicators → narrative│
   │  - identify confluence factors     │
   └────────────┬───────────────────────┘
                │ hypothesis
                ▼
   ┌────────────────────────────────────┐
   │ 3. Risk Analyzer ★ MiMo (deep)     │
   │  - chain micro-events → loss prof. │
   │  - exposure & drawdown estimate    │
   └────────────┬───────────────────────┘
                │ risk profile
                ▼
   ┌────────────────────────────────────┐
   │ 4. ROI Projector ★ MiMo            │
   │  - macro context (BTC.D, DXY)      │
   │  - expected R-multiple             │
   └────────────┬───────────────────────┘
                │ projection
                ▼
   ┌────────────────────────────────────┐
   │ 5. Cost Auditor ★ MiMo (meta)      │
   │  - read ledger snapshot            │
   │  - compute decision_cost / ROI     │
   │  - narrate efficiency              │
   └────────────┬───────────────────────┘
                │ cost-aware narrative
                ▼
   ┌────────────────────────────────────┐
   │ 6. Report Writer ★ MiMo            │
   │  - daily operator brief            │
   │  - per-signal narrative attached   │
   └────────────┬───────────────────────┘
                ▼
        Markdown audit + JSON ledger
        Storage + Discord webhook
```

## Agent responsibilities

### 1. Signal Detector (deterministic)
Listens for upstream strategy webhook payloads (TradingView alerts,
Freqtrade hooks, custom). Enriches with: top-of-book spread, last 24h
volume, recent funding rate, open interest delta. Filters out duplicates
and non-actionable noise.

**No MiMo.**

### 2. Strategy Explainer (MiMo)
Receives enriched signal + indicator readings (RSI, EMA, BB, MACD,
order-flow imbalance). Writes a 3-5 sentence hypothesis: *which*
confluence the strategy is exploiting, *why now*, and *what would
invalidate the thesis*.

**MiMo call:** `~3,500 input + 6,000 reasoning + 1,500 output ≈ 11,000 tokens`

### 3. Risk Analyzer (MiMo, deepest reasoning)
Chains micro-events (recent volatility regime, correlated asset moves,
liquidations cascade probability) into a loss profile. Returns expected
drawdown, worst-case stop, and probability of ruin under the implied
position sizing.

**MiMo call:** `~5,000 input + 9,000 reasoning + 2,000 output ≈ 16,000 tokens`

### 4. ROI Projector (MiMo)
Fuses macro context: BTC dominance, DXY, recent funding skew, open
interest. Produces expected R-multiple and time-to-target distribution.

**MiMo call:** `~4,000 input + 6,000 reasoning + 1,500 output ≈ 11,500 tokens`

### 5. Cost Auditor (MiMo, meta)
Reads the token ledger snapshot for this audit so far, narrates the cost
of producing the decision, compares it to expected ROI in fiat,
flags inefficient prompt patterns, and suggests prompt distillation when
applicable.

**MiMo call:** `~3,000 input + 4,000 reasoning + 1,500 output ≈ 8,500 tokens`

### 6. Report Writer (MiMo)
End-of-day operator brief: which signals fired, which were audited,
aggregate token spend, aggregate expected ROI, top-3 inefficiencies, and
prompt-shrink suggestions.

**MiMo call:** `~6,000 input + 6,000 reasoning + 4,000 output ≈ 16,000 tokens`

## Continuous mode

- **Markets**: BTCUSDT, ETHUSDT, SOLUSDT (configurable)
- **Audits per day per market**: ~30 (every ~50 minutes high-vol days)
- **Daily report**: 1 per market
- **Storage**: SQLite for ledger, Markdown for narratives, JSON for ROI
  projections
- **Alerting**: Discord webhook + optional Telegram bot

## Cost-attribution layer

All MiMo calls go through the central client (`src/mimo.ts`) which:

- Records `prompt_tokens`, `completion_tokens`, and `reasoning_tokens` per
  call when the API surfaces them.
- Tags each call with `agent`, `signal_id`, `market`.
- Persists ledger to SQLite for later audit.
- Exposes a `/ledger/snapshot` endpoint consumed by `cost-auditor`.

This is the project's core differentiator: **every cost is attributable
to a specific decision**, not an opaque monthly bill.
