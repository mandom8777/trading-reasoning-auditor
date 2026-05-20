import { MiMoClient } from "../mimo.js";

const SYSTEM = `You are a crypto trade risk analyzer. Given a thesis +
invalidation level + recent volatility regime + correlated-asset moves, you
produce a loss profile assuming standard Kelly-quarter sizing.

Output strict JSON:
{
  "expected_drawdown_pct": <number>,
  "worst_case_pct": <number>,
  "p_ruin_30d": 0.0-1.0,
  "tail_risk_notes": "<short paragraph>",
  "max_position_size_pct_account": <number>,
  "stop_loss_price": <number>,
  "rationale_chain": ["<step 1>", "<step 2>", "<step 3>"]
}`;

export interface RiskProfile {
  expected_drawdown_pct: number;
  worst_case_pct: number;
  p_ruin_30d: number;
  tail_risk_notes: string;
  max_position_size_pct_account: number;
  stop_loss_price: number;
  rationale_chain: string[];
}

export async function analyzeRisk(
  client: MiMoClient,
  signalId: string,
  market: string,
  payload: unknown,
): Promise<RiskProfile> {
  return client.chat<RiskProfile>({
    agent: "risk_analyzer",
    signalId,
    market,
    system: SYSTEM,
    user: `Inputs:\n${JSON.stringify(payload, null, 2)}`,
    temperature: 0,
    maxTokens: 2000,
  });
}
