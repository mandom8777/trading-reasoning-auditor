/**
 * Trading Reasoning Auditor — entrypoint.
 * Wires the 6-agent pipeline, supports `once` and `continuous` modes.
 */
import { Command } from "commander";
import "dotenv/config";
import fs from "node:fs";
import { detect, RawSignal } from "./agents/signalDetector.js";
import { explainStrategy } from "./agents/strategyExplainer.js";
import { analyzeRisk } from "./agents/riskAnalyzer.js";
import { projectRoi } from "./agents/roiProjector.js";
import { auditCost } from "./agents/costAuditor.js";
import { writeReport } from "./agents/reportWriter.js";
import { MiMoClient } from "./mimo.js";

interface CliOpts {
  mode: "once" | "continuous";
  fixture?: string;
  markets?: string;
}

async function auditSignal(client: MiMoClient, raw: RawSignal) {
  const enriched = await detect(raw);
  if (!enriched) return null;

  const { signalId, market } = enriched;

  const thesis = await explainStrategy(client, signalId, market, enriched);
  const risk = await analyzeRisk(client, signalId, market, { thesis, enriched });
  const roi = await projectRoi(client, signalId, market, { thesis, risk, enriched });
  const ledgerSnap = client.ledger.forSignal(signalId);
  const cost = await auditCost(client, signalId, market, {
    ledger: ledgerSnap,
    risk,
    roi,
  });

  return { signalId, market, thesis, risk, roi, cost };
}

async function main(opts: CliOpts) {
  const client = new MiMoClient();

  if (opts.mode === "once") {
    if (!opts.fixture) throw new Error("--fixture required in once mode");
    const raw = JSON.parse(fs.readFileSync(opts.fixture, "utf-8")) as RawSignal;
    const audit = await auditSignal(client, raw);
    console.log(JSON.stringify(audit, null, 2));
    console.log("\nLedger snapshot:", JSON.stringify(client.ledger.snapshot(), null, 2));
    return;
  }

  const markets = (opts.markets ?? process.env.MARKETS ?? "BTCUSDT").split(",");
  console.error(`continuous mode for ${markets.length} markets:`, markets);
  // The full continuous loop wires up market feeds, webhook ingest, and a
  // 24h scheduler. Production wiring lives in src/feeds/* (omitted in this
  // grant skeleton).
  await new Promise(() => {});
}

const program = new Command();
program
  .option("--mode <mode>", "once | continuous", "once")
  .option("--fixture <path>", "fixture JSON for once mode")
  .option("--markets <list>", "comma-separated markets")
  .parse(process.argv);

main(program.opts() as CliOpts).catch((err) => {
  console.error(err);
  process.exit(1);
});
