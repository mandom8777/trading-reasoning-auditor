/**
 * Binance public-feed adapter.
 *
 * Provides the small slice of market data used by the auditor:
 * - top-of-book ticker
 * - 1m/5m/15m/4h klines
 * - aggregate trades stream
 *
 * Stays read-only and uses public endpoints; no API key required.
 */
import axios from "axios";
import WebSocket from "ws";

const REST = "https://api.binance.com";
const STREAM = "wss://stream.binance.com:9443";

export interface BookTop {
  bid: number;
  ask: number;
  spreadBps: number;
}

export async function bookTop(symbol: string): Promise<BookTop> {
  const r = await axios.get(`${REST}/api/v3/ticker/bookTicker`, {
    params: { symbol },
    timeout: 5000,
  });
  const bid = Number(r.data.bidPrice);
  const ask = Number(r.data.askPrice);
  return { bid, ask, spreadBps: ((ask - bid) / bid) * 10_000 };
}

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
}

export async function klines(symbol: string, interval: string, limit = 200): Promise<Kline[]> {
  const r = await axios.get(`${REST}/api/v3/klines`, {
    params: { symbol, interval, limit },
    timeout: 8000,
  });
  return (r.data as unknown[][]).map((row) => ({
    openTime: row[0] as number,
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    closeTime: row[6] as number,
  }));
}

/** Subscribe to the agg-trade stream; returns a closer function. */
export function streamAggTrades(symbol: string, on: (trade: unknown) => void): () => void {
  const ws = new WebSocket(`${STREAM}/ws/${symbol.toLowerCase()}@aggTrade`);
  ws.on("message", (data) => {
    try {
      on(JSON.parse(data.toString()));
    } catch {
      /* ignore */
    }
  });
  return () => ws.close();
}
