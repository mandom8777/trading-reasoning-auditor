/**
 * Thin MiMo client + per-call token ledger.
 * Centralises retry, JSON parsing, and ledger accounting.
 */
import axios, { AxiosError } from "axios";
import pRetry from "p-retry";

const MIMO_BASE = process.env.MIMO_API_BASE ?? "https://platform.xiaomimimo.com/v1";
const MIMO_MODEL = process.env.MIMO_MODEL ?? "mimo-7b-rl";

export interface ChatOptions {
  agent: string;
  signalId?: string;
  market?: string;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LedgerEntry {
  timestamp: number;
  agent: string;
  signalId?: string;
  market?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class TokenLedger {
  private entries: LedgerEntry[] = [];

  record(e: LedgerEntry): void {
    this.entries.push(e);
  }

  snapshot() {
    const byAgent = new Map<string, number>();
    for (const e of this.entries) {
      byAgent.set(e.agent, (byAgent.get(e.agent) ?? 0) + e.totalTokens);
    }
    return {
      total: this.entries.reduce((s, e) => s + e.totalTokens, 0),
      byAgent: Object.fromEntries(byAgent),
      callCount: this.entries.length,
    };
  }

  forSignal(signalId: string): LedgerEntry[] {
    return this.entries.filter((e) => e.signalId === signalId);
  }
}

export class MiMoClient {
  readonly ledger = new TokenLedger();
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.MIMO_API_KEY;
    if (!key) throw new Error("MIMO_API_KEY missing");
    this.apiKey = key;
  }

  async chat<T = unknown>(opts: ChatOptions): Promise<T> {
    const body = {
      model: MIMO_MODEL,
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 4000,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      ...(opts.jsonMode !== false ? { response_format: { type: "json_object" } } : {}),
    };

    const run = async () =>
      axios.post(`${MIMO_BASE}/chat/completions`, body, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        timeout: 60_000,
      });

    const resp = await pRetry(run, {
      retries: 4,
      minTimeout: 2000,
      maxTimeout: 30_000,
      onFailedAttempt: (err) => {
        const ax = err as unknown as AxiosError;
        if (ax.response?.status && ax.response.status < 500 && ax.response.status !== 429) {
          throw err; // non-retryable
        }
      },
    });

    const usage = resp.data.usage ?? {};
    this.ledger.record({
      timestamp: Date.now(),
      agent: opts.agent,
      signalId: opts.signalId,
      market: opts.market,
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens: usage.total_tokens ?? 0,
    });

    const content = resp.data.choices[0].message.content as string;
    if (opts.jsonMode === false) return content as unknown as T;

    try {
      return JSON.parse(content) as T;
    } catch {
      return { _raw: content } as T;
    }
  }
}
