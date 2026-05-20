import { MiMoClient } from "../mimo.js";

const SYSTEM = `You are a crypto trade ROI projector. Given a thesis + risk
profile + macro context, you estimate expected R-multiple and time-to-target.

Output strict JSON:
{
  "expected_R": <number>,
  "median_time_to_target_hours": <number>,
  "p_hit_target": 0.0-1.0,
  "p_hit_stop": 0.0-1.0,
  "macro_alignment_notes": "<short paragraph>",
  "rationale_chain": ["<step 1>", "<step 2>", "<step 3>"]
}`;

export interface RoiProjection {
  expected_R: number;
  median_time_to_target_hours: number;
  p_hit_target: number;
  p_hit_stop: number;
  macro_alignment_notes: string;
  rationale_chain: string[];
}

export async function projectRoi(
  client: MiMoClient,
  signalId: string,
  market: string,
  payload: unknown,
): Promise<RoiProjection> {
  return client.chat<RoiProjection>({
    agent: "roi_projector",
    signalId,
    market,
    system: SYSTEM,
    user: `Inputs:\n${JSON.stringify(payload, null, 2)}`,
    temperature: 0,
    maxTokens: 1500,
  });
}
