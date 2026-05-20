/**
 * Smoke tests — no MiMo calls. Pure deterministic logic only.
 * Run with: node --import tsx --test test/*.test.ts
 */
import { strict as assert } from "node:assert";
import { test, beforeEach } from "node:test";

import { detect, __resetSeen, type RawSignal } from "../src/agents/signalDetector.js";

beforeEach(() => __resetSeen());

const baseSignal = (): RawSignal => ({
  market: "BTCUSDT",
  side: "long",
  source: "unit-test",
  timestamp: 1_700_000_000_000,
  indicators: { rsi_4h: 25 },
});

test("detect returns enriched signal first time", async () => {
  const out = await detect(baseSignal());
  // orderbook may be undefined offline, that's fine
  assert.ok(out, "first call should return a signal");
  assert.equal(out!.market, "BTCUSDT");
  assert.equal(out!.regime, "oversold-mean-revert-candidate");
  assert.match(out!.signalId, /^BTCUSDT-/);
});

test("detect dedupes within the same minute", async () => {
  const a = await detect(baseSignal());
  const b = await detect(baseSignal());
  assert.ok(a, "first call should produce a signal");
  assert.equal(b, null, "duplicate within same minute should be filtered");
});

test("regime classifier handles overbought / neutral", async () => {
  const overbought = await detect({
    ...baseSignal(),
    timestamp: 1_700_000_120_000,
    indicators: { rsi_4h: 80 },
  });
  const neutral = await detect({
    ...baseSignal(),
    timestamp: 1_700_000_240_000,
    indicators: { rsi_4h: 55 },
  });
  assert.equal(overbought!.regime, "overbought-mean-revert-candidate");
  assert.equal(neutral!.regime, "neutral");
});
