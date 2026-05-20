import { MiMoClient } from "../mimo.js";

const SYSTEM = `You are an end-of-day operator brief writer. Given the full
ledger of audits for the past 24h on one market, produce a Markdown brief.
Output JSON: {"markdown": "..."}.

Cover:
- Signals fired & audited
- Aggregate token spend (with breakdown by agent)
- Aggregate expected R / realised R if known
- Top-3 most efficient signals (low cost / high expected R)
- Top-3 wasteful signals (and why)
- Prompt-shrink suggestions affecting tomorrow's runs`;

export async function writeReport(
  client: MiMoClient,
  market: string,
  payload: unknown,
): Promise<{ markdown: string }> {
  return client.chat<{ markdown: string }>({
    agent: "report_writer",
    market,
    system: SYSTEM,
    user: `24h ledger for ${market}:\n${JSON.stringify(payload, null, 2)}`,
    temperature: 0.2,
    maxTokens: 4000,
  });
}
