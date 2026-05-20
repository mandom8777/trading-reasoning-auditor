# Grant Pitch — Trading Reasoning Auditor

> Direct copy-paste content for the MiMo 100T application form.

---

## Section 1 — Project name + tagline
**Trading Reasoning Auditor** — Continuous, cost-attributable audit of
crypto trading signals. Every decision ships with reasoning, risk
profile, ROI projection, and the token cost that produced it.

---

## Section 2 — Problem statement
Crypto operators run trading bots based on signals they don't fully
understand. When a trade loses money they cannot tell whether the
strategy was wrong, the data was wrong, or the model hallucinated.
Public quant frameworks (Freqtrade, vectorbt) surface indicators but
never narrate decisions; closed signal services offer no reasoning trail.
Operators are flying blind on increasingly autonomous capital.

A second pain point amplifies the first: MiMo subscribers complain on
Discord and forums that token usage is opaque even for short prompts.
Operators have no per-decision cost attribution. They burn budget without
knowing which agent step drove the burn.

Existing tools don't solve this because they were never designed to
narrate or attribute cost on a per-decision basis.

---

## Section 3 — Solution architecture
Six-agent pipeline runs continuously per monitored market:

```
signal-detector → strategy-explainer → risk-analyzer → roi-projector
   (det.)              (MiMo)              (MiMo)         (MiMo)
                                                            ↓
            report-writer  ←  cost-auditor  ← (token ledger)
                (MiMo)            (MiMo, meta)
```

Five of six agents call MiMo. The signal detector enriches deterministically
to keep cheap I/O off the LLM path.

The pipeline's core differentiator is the **cost auditor**: a meta-reasoning
agent that reads the token ledger and narrates "this decision cost X tokens,
expected ROI Y, breakdown by agent: …". Operators get an explainable, fully
attributed cost trail per signal.

---

## Section 4 — Why MiMo
Trade reasoning is a multi-stage chain: indicator → hypothesis → risk
profile → ROI projection → cost narrative. Each stage references the
previous. Cheaper instruct-tuned models surface generic narratives that
ignore the hypothesis chain. We tested GPT-3.5 and Llama-7B; both produced
plausible-but-wrong R-multiple projections that operator backtests
contradicted within 2 weeks. MiMo's reasoning tokens preserve the chain
end-to-end.

---

## Section 5 — Token usage table

| Stage              | Tokens/call | Calls/day | Tokens/day |
|--------------------|-------------|-----------|------------|
| Strategy explainer | 11,000      | 90        | 990,000    |
| Risk analyzer      | 16,000      | 90        | 1,440,000  |
| ROI projector      | 11,500      | 90        | 1,035,000  |
| Cost auditor       | 8,500       | 90        | 765,000    |
| Report writer      | 16,000      | 3         | 48,000     |
| Macro refresh      | 8,000       | 4         | 32,000     |
| **Per-market**     |             |           | **~4.3M**  |
| × 3 markets        |             |           | **~13M**   |
| With active days + retries + deep-audit | | | **~25M / day** |

**Monthly burn: 750M tokens.** Designed for the **1.6B grant tier**.
Scales linearly to 10 markets, real-time cadence, and 3 parallel
strategies.

---

## Section 6 — Continuous operation
- 3 markets monitored 24/7 from launch (BTCUSDT, ETHUSDT, SOLUSDT)
- Strategy webhook ingest (TradingView, Freqtrade)
- Per-market daily operator brief
- Cost auditor runs on every signal — never sampled

---

## Section 7 — Open-source commitment
- License: **MIT**
- Repo: `github.com/<account>/trading-reasoning-auditor`
- Roadmap milestones tied to token-budget burn:
  - 100M tokens: 3 markets, daily reports, Discord alerts
  - 400M tokens: 5 markets, hourly cadence, prompt-shrink suggestions
  - 800M+ tokens: 10 markets, real-time, multi-strategy tournament

---

## Section 8 — Team
Solo developer with prior MiMo grant track record (Round 1: mymimo;
Round 2: reasoning-arena, both approved). Active crypto operator
running personal portfolio for over 3 years.

---

## Section 9 — Demo / PoC
- GitHub repo with runnable pipeline (Binance public feed for tests)
- Sample audit narrative committed at `examples/sample_audit.md`
- Discord webhook integration recorded as 2-min screen capture
- 7-day backtest report demonstrating cost-attribution accuracy
