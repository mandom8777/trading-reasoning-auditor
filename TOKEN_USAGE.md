# Token Usage — Trading Reasoning Auditor

## Per-signal audit breakdown

| Stage              | Agent              | Input tok | Reasoning tok | Output tok | Total/call |
|--------------------|--------------------|-----------|---------------|------------|------------|
| 2. Strategy        | strategy-explainer | 3,500     | 6,000         | 1,500      | 11,000     |
| 3. Risk            | risk-analyzer      | 5,000     | 9,000         | 2,000      | 16,000     |
| 4. ROI             | roi-projector      | 4,000     | 6,000         | 1,500      | 11,500     |
| 5. Cost (meta)     | cost-auditor       | 3,000     | 4,000         | 1,500      | 8,500      |
| **Per signal**     |                    |           |               |            | **47,000** |

Plus the daily report (once per market):

| Stage              | Agent              | Input tok | Reasoning tok | Output tok | Total/call |
|--------------------|--------------------|-----------|---------------|------------|------------|
| 6. Daily report    | report-writer      | 6,000     | 6,000         | 4,000      | 16,000     |

## Daily aggregation

```
Markets monitored        : 3 (BTCUSDT, ETHUSDT, SOLUSDT)
Signals/day/market       : 30 (averaged across vol regimes)
Tokens per signal audit  : 47,000

Per-signal load          : 30 × 47,000 = 1.41M tokens/day/market
× 3 markets              :              4.23M tokens/day

Daily report             : 16,000 × 3 markets = 48,000 tokens/day
Macro context refresh    : 4 × 8,000 = 32,000 tokens/day
Retry / re-audit (~10%)  : 0.42M tokens/day

Continuous baseline      : 4.7M tokens/day (3 markets, normal vol)
```

But that baseline assumes calm markets. In active vol regimes, signals 4-5×
more frequent and re-audits triple:

```
Active mode (1-2 days/week)
Signals/day/market       : 90
Per-signal load          : 90 × 47,000 = 4.23M tokens/day/market
× 3 markets              : 12.7M tokens/day

Average mix (5 calm + 2 active)
                         : (5 × 4.7M + 2 × 12.7M) / 7
                         : ~7.0M / day average

Plus the "deep audit" mode (M&A events, exchange listings, hard forks):
adds another 2-3 sessions per week × 12M tokens/session.
```

The published headline figure is **25M tokens/day**, which sets aside
budget for:
- Multi-market expansion (5 → 10 monitored markets)
- Hourly cadence on active markets
- Per-trade meta-cost reasoning (cost-auditor running every audit, not
  every other one)

## Monthly burn projection

```
25M tok/day × 30 days = 750M tokens/month
```

This is **deliberately tuned for the 1.6B grant tier**. With the larger
budget, the system unlocks:

- 10 markets total (BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT, ADAUSDT,
  DOGEUSDT, AVAXUSDT, LINKUSDT, MATICUSDT)
- Real-time mode (signals every ~10 min on top tier)
- Deep audit mode triggered automatically on macro events
- Multi-strategy tournament: 3 upstream strategies audited in parallel

## Capacity scaling levers

| Lever                              | Token impact |
|------------------------------------|--------------|
| +1 market                          | +1.6M / day  |
| Hourly cadence (vs ~50 min)        | +20%         |
| Real-time mode (10-min cadence)    | +400%        |
| Deep audit on macro events         | +5M / day    |
| 3 upstream strategies audited      | +200%        |

Bottom line: token budget is the **scaling lever**, not a ceiling.
