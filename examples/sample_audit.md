# Sample audit narrative

**Signal ID:** `BTCUSDT-1716080400000`
**Market:** BTCUSDT
**Side:** long
**Source:** tradingview-mean-rev-v2

---

## Thesis
Mean-reversion long inside a 4H range. Price tagged the lower BB while RSI 28
hit oversold, MACD histogram still positive (bull divergence), and a sizable
bid wall at 60k acts as confluence with EMA-200. Entry expects retest of the
range mid.

**Confluence factors**
- RSI 28 oversold on 4H
- Bollinger lower band breach with positive MACD histogram
- Bid wall at 60k overlaps EMA-200 (61.8k support cluster)

**Invalidation**: 4H close below 60k or wall absorption with no bounce within
2 candles.

---

## Risk profile
- Expected drawdown: 2.3%
- Worst case: 5.1%
- P(ruin in 30d) at K/4 sizing: 0.07
- Max position size: 6.0% of account
- Stop-loss price: 59,800

---

## ROI projection
- Expected R: 2.1
- Median time-to-target: 14 hours
- P(hit target): 0.62
- P(hit stop): 0.31
- Macro alignment: BTC.D rising slowly, DXY flat, funding mildly positive — supportive but not euphoric.

---

## Cost narrative
- Decision cost: 47,000 tokens (~$0.072 at current MiMo rate)
- Expected PnL on this trade: $38.40 at K/4 sizing on a $5k account
- ROI multiplier: 533×
- Biggest cost driver: risk-analyzer (16,000 tok)
- Verdict: **efficient**
- Shrink suggestions: cap regime context to last 6 hours; precompute correlation matrix.
