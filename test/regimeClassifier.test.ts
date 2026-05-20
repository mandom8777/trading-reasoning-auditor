/**
 * Smoke tests for regime classifier edge cases.
 * Covers RSI boundary values to lock down behavior.
 */
import { strict as assert } from "node:assert";
import { test, beforeEach } from "node:test";

import { detect, __resetSeen, type RawSignal } from "../src/agents/signalDetector.js";

beforeEach(() => __resetSeen());

const sig = (rsi: number, ts: number): RawSignal => ({
  market: "ETHUSDT",
  side: "long",
  source: "regime-test",
  timestamp: ts,
  indicators: { rsi_4h: rsi },
});

test("regime: RSI = 30 boundary stays neutral (strict less-than)", async () => {
  const out = await detect(sig(30, 1_700_000_000_000));
  assert.equal(out!.regime, "neutral");
});

test("regime: RSI = 29 marks oversold", async () => {
  const out = await detect(sig(29, 1_700_000_060_000));
  assert.equal(out!.regime, "oversold-mean-revert-candidate");
});

test("regime: RSI = 70 boundary stays neutral", async () => {
  const out = await detect(sig(70, 1_700_000_120_000));
  assert.equal(out!.regime, "neutral");
});

test("regime: RSI = 71 marks overbought", async () => {
  const out = await detect(sig(71, 1_700_000_180_000));
  assert.equal(out!.regime, "overbought-mean-revert-candidate");
});
