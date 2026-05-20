import { MiMoClient } from "../mimo.js";

const SYSTEM = `You are a crypto trading strategy explainer. Given an enriched
signal payload (indicators + order-book context + recent regime), you produce a
3-5 sentence hypothesis explaining the trade thesis.

Output strict JSON:
{
  "thesis": "<one paragraph, plain English>",
  "confluence_factors": ["<factor 1>", "<factor 2>", ...],
  "invalidation": "<single sentence describing what would invalidate this>",
  "confidence": 0.0-1.0
}`;

export interface StrategyExplanation {
  thesis: string;
  confluence_factors: string[];
  invalidation: string;
  confidence: number;
}

export async function explainStrategy(
  client: MiMoClient,
  signalId: string,
  market: string,
  enrichedSignal: unknown,
): Promise<StrategyExplanation> {
  return client.chat<StrategyExplanation>({
    agent: "strategy_explainer",
    signalId,
    market,
    system: SYSTEM,
    user: `Enriched signal:\n${JSON.stringify(enrichedSignal, null, 2)}`,
    temperature: 0.1,
    maxTokens: 1500,
  });
}
