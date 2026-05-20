/**
 * Deterministic signal detector.
 * Normalises upstream strategy webhooks and enriches with order-book context.
 */
import axios from "axios";

export interface RawSignal {
  market: string;
  side: "long" | "short";
  source: string;
  timestamp: number;
  indicators: Record<string, number | boolean | string>;
}

export interface EnrichedSignal extends RawSignal {
  orderbook?: {
    spread_bps: number;
    top_bid: number;
    top_ask: number;
  };
  regime: string;
  signalId: string;
}

const seen = new Set<string>();

/** Test-only helper to clear dedup state between tests. */
export function __resetSeen() {
  seen.clear();
}

export async function detect(raw: RawSignal): Promise<EnrichedSignal | null> {
  const fp = `${raw.market}-${raw.side}-${Math.floor(raw.timestamp / 60_000)}`;
  if (seen.has(fp)) return null;
  seen.add(fp);

  const orderbook = await fetchBookTop(raw.market);
  return {
    ...raw,
    orderbook,
    regime: classifyRegime(raw),
    signalId: `${raw.market}-${raw.timestamp}`,
  };
}

async function fetchBookTop(market: string) {
  try {
    const r = await axios.get(
      `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${market}`,
      { timeout: 5000 },
    );
    const bid = Number(r.data.bidPrice);
    const ask = Number(r.data.askPrice);
    return { top_bid: bid, top_ask: ask, spread_bps: ((ask - bid) / bid) * 10_000 };
  } catch {
    return undefined;
  }
}

function classifyRegime(raw: RawSignal): string {
  // Cheap heuristic — replace with proper regime detector later.
  const rsi = Number(raw.indicators["rsi_4h"] ?? 50);
  if (rsi < 30) return "oversold-mean-revert-candidate";
  if (rsi > 70) return "overbought-mean-revert-candidate";
  return "neutral";
}
