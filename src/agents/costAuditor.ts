import { MiMoClient } from "../mimo.js";

const SYSTEM = `You are a meta cost auditor. You read a token-ledger snapshot
for the current decision and narrate the cost-vs-reward picture.

Output strict JSON:
{
  "decision_cost_tokens": <number>,
  "decision_cost_usd_estimate": <number>,
  "expected_pnl_usd": <number>,
  "roi_multiplier": <number>,
  "biggest_cost_driver": "<agent name>",
  "shrink_suggestions": ["<concrete prompt change>", ...],
  "verdict": "efficient" | "borderline" | "wasteful"
}

When verdict = "wasteful", produce at least 2 concrete prompt shrinks.`;

export interface CostNarrative {
  decision_cost_tokens: number;
  decision_cost_usd_estimate: number;
  expected_pnl_usd: number;
  roi_multiplier: number;
  biggest_cost_driver: string;
  shrink_suggestions: string[];
  verdict: "efficient" | "borderline" | "wasteful";
}

export async function auditCost(
  client: MiMoClient,
  signalId: string,
  market: string,
  payload: unknown,
): Promise<CostNarrative> {
  return client.chat<CostNarrative>({
    agent: "cost_auditor",
    signalId,
    market,
    system: SYSTEM,
    user: `Inputs:\n${JSON.stringify(payload, null, 2)}`,
    temperature: 0,
    maxTokens: 1500,
  });
}
