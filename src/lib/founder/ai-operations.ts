// FRASS-0540 / FRASS-0541 — the maths behind the AI Operations dashboard.
// Kept out of the server-function file so the file that declares server
// functions stays a thin wrapper.

export type FeatureUsage = { feature: string; requests: number; credits: number; share: number };

export type AiOperationsReport = {
  generatedAt: string;
  credits: {
    balance: number;
    usedToday: number;
    usedThisMonth: number;
    lifetimeUsed: number;
    /** Estimate: at the current daily burn, how long the balance lasts. */
    daysRemaining: number | null;
  };
  requests: { today: number; thisWeek: number; thisMonth: number; byFeature: FeatureUsage[] };
  reliability: { successRate: number; failed: number; total: number };
  performance: {
    averageMs: number | null;
    fastestMs: number | null;
    slowestMs: number | null;
    peakHour: number | null;
  };
  trends: { daily: Array<{ date: string; requests: number; credits: number }>; growthPct: number | null };
  alerts: Array<{ level: "info" | "warn" | "critical"; message: string }>;
  suggestions: string[];
  roi: {
    creditsSpentThisMonth: number;
    memberRevenueInfluenced: number;
    businessesStarted: number;
    booksPublished: number;
    booksInProgress: number;
    productsCreated: number;
    moneyMovesCompleted: number;
    blueprintsActive: number;
    plain: string;
  };
};

type LedgerRow = {
  amount: number;
  direction: string;
  label: string | null;
  processing_ms: number | null;
  created_at: string;
  metadata?: unknown;
};

export type AiOperationsInput = {
  ledger: LedgerRow[];
  wallets: Array<{ balance: number; lifetime_used: number }>;
  publications: Array<{ status: string }>;
  productsLast30: number;
  opportunities: Array<{ stage: string; potential_value: number | null }>;
  orders: Array<{ subtotal: number; created_at: string }>;
  journeysLast30: number;
  blueprints: number;
};

const dayKey = (iso: string) => iso.slice(0, 10);
const round = (n: number, p = 2) => Math.round(n * 10 ** p) / 10 ** p;

function featureName(label: string | null): string {
  if (!label) return "Other";
  return label.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildAiOperationsReport(input: AiOperationsInput): AiOperationsReport {
  const now = Date.now();
  const today = dayKey(new Date(now).toISOString());
  const spend = input.ledger.filter((r) => r.direction !== "credit");

  const within = (r: LedgerRow, days: number) => now - new Date(r.created_at).getTime() <= days * 86_400_000;

  const usedToday = spend.filter((r) => dayKey(r.created_at) === today).reduce((s, r) => s + Math.abs(r.amount), 0);
  const usedThisMonth = spend.reduce((s, r) => s + Math.abs(r.amount), 0);
  const balance = input.wallets.reduce((s, w) => s + (w.balance ?? 0), 0);
  const lifetimeUsed = input.wallets.reduce((s, w) => s + (w.lifetime_used ?? 0), 0);
  const dailyBurn = usedThisMonth / 30;
  const daysRemaining = dailyBurn > 0 ? Math.floor(balance / dailyBurn) : null;

  // Requests
  const requestsToday = input.ledger.filter((r) => dayKey(r.created_at) === today).length;
  const requestsWeek = input.ledger.filter((r) => within(r, 7)).length;
  const requestsMonth = input.ledger.length;

  const byFeatureMap = new Map<string, { requests: number; credits: number }>();
  for (const r of input.ledger) {
    const key = featureName(r.label);
    const cur = byFeatureMap.get(key) ?? { requests: 0, credits: 0 };
    cur.requests += 1;
    if (r.direction !== "credit") cur.credits += Math.abs(r.amount);
    byFeatureMap.set(key, cur);
  }
  const byFeature: FeatureUsage[] = [...byFeatureMap.entries()]
    .map(([feature, v]) => ({
      feature,
      requests: v.requests,
      credits: round(v.credits),
      share: usedThisMonth > 0 ? round((v.credits / usedThisMonth) * 100, 1) : 0,
    }))
    .sort((a, b) => b.credits - a.credits || b.requests - a.requests)
    .slice(0, 12);

  // Reliability — a failed operation is recorded with a failure label or refund.
  const failed = input.ledger.filter(
    (r) => /fail|error|timeout|refund/i.test(r.label ?? "") || (r.direction === "credit" && /refund/i.test(r.label ?? "")),
  ).length;
  const total = input.ledger.length;
  const successRate = total > 0 ? round(((total - failed) / total) * 100, 1) : 100;

  // Performance
  const times = input.ledger.map((r) => r.processing_ms).filter((n): n is number => typeof n === "number" && n > 0);
  const averageMs = times.length ? Math.round(times.reduce((s, n) => s + n, 0) / times.length) : null;
  const fastestMs = times.length ? Math.min(...times) : null;
  const slowestMs = times.length ? Math.max(...times) : null;

  const hours = new Map<number, number>();
  for (const r of input.ledger) {
    const h = new Date(r.created_at).getUTCHours();
    hours.set(h, (hours.get(h) ?? 0) + 1);
  }
  const peakHour = hours.size ? [...hours.entries()].sort((a, b) => b[1] - a[1])[0][0] : null;

  // Trends — last 14 days
  const daily: Array<{ date: string; requests: number; credits: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = dayKey(new Date(now - i * 86_400_000).toISOString());
    const rows = input.ledger.filter((r) => dayKey(r.created_at) === d);
    daily.push({
      date: d,
      requests: rows.length,
      credits: round(rows.filter((r) => r.direction !== "credit").reduce((s, r) => s + Math.abs(r.amount), 0)),
    });
  }
  const firstWeek = daily.slice(0, 7).reduce((s, d) => s + d.requests, 0);
  const lastWeek = daily.slice(7).reduce((s, d) => s + d.requests, 0);
  const growthPct = firstWeek > 0 ? round(((lastWeek - firstWeek) / firstWeek) * 100, 1) : null;

  // Member outcomes — the numbers that actually matter.
  const booksPublished = input.publications.filter((p) => p.status === "published").length;
  const booksInProgress = input.publications.filter((p) => p.status !== "published").length;
  const moneyMovesCompleted = input.opportunities.filter((o) => /won|complete|done/i.test(o.stage)).length;
  const businessesStarted = input.journeysLast30;
  const orderRevenue = input.orders.reduce((s, o) => s + Number(o.subtotal ?? 0), 0);
  const pipelineValue = input.opportunities
    .filter((o) => /won|complete|done/i.test(o.stage))
    .reduce((s, o) => s + Number(o.potential_value ?? 0), 0);
  const memberRevenueInfluenced = round(orderRevenue + pipelineValue);

  // Alerts
  const alerts: AiOperationsReport["alerts"] = [];
  if (daysRemaining !== null && daysRemaining <= 7)
    alerts.push({
      level: daysRemaining <= 3 ? "critical" : "warn",
      message: `At today's pace, credits run out in about ${daysRemaining} day(s).`,
    });
  const yesterday = daily[daily.length - 2]?.credits ?? 0;
  if (yesterday > 0 && usedToday > yesterday * 2)
    alerts.push({ level: "warn", message: "Today's AI spend is more than double yesterday's." });
  if (successRate < 95)
    alerts.push({ level: successRate < 85 ? "critical" : "warn", message: `Success rate has fallen to ${successRate}%.` });
  if (averageMs !== null && averageMs > 8000)
    alerts.push({ level: "warn", message: `Average AI response time is ${(averageMs / 1000).toFixed(1)}s — slower than usual.` });
  if (!alerts.length) alerts.push({ level: "info", message: "Nothing needs your attention. Costs and performance are steady." });

  // Optimization suggestions
  const suggestions: string[] = [];
  const top = byFeature[0];
  if (top && top.share >= 30)
    suggestions.push(
      `${top.feature} accounts for ${top.share}% of AI cost. Caching its recent results would reduce monthly usage.`,
    );
  const voice = byFeature.find((f) => /voice|speech|audio/i.test(f.feature));
  if (voice && voice.share >= 15)
    suggestions.push(
      `Voice work is ${voice.share}% of spend. Offering text as the default in that workflow would cost noticeably less.`,
    );
  const image = byFeature.find((f) => /image|video/i.test(f.feature));
  if (image && image.share >= 20)
    suggestions.push(`Image and video generation is ${image.share}% of spend. Reusing approved assets keeps that flat.`);
  if (!suggestions.length) suggestions.push("Usage is spread evenly across features. No single service is worth optimising yet.");

  const plain =
    memberRevenueInfluenced > 0
      ? `Frass spent ${round(usedThisMonth)} credits this month, and members created about $${memberRevenueInfluenced.toLocaleString()} of value with that help.`
      : `Frass spent ${round(usedThisMonth)} credits this month. No member revenue has been recorded against it yet.`;

  return {
    generatedAt: new Date(now).toISOString(),
    credits: {
      balance: round(balance),
      usedToday: round(usedToday),
      usedThisMonth: round(usedThisMonth),
      lifetimeUsed: round(lifetimeUsed),
      daysRemaining,
    },
    requests: { today: requestsToday, thisWeek: requestsWeek, thisMonth: requestsMonth, byFeature },
    reliability: { successRate, failed, total },
    performance: { averageMs, fastestMs, slowestMs, peakHour },
    trends: { daily, growthPct },
    alerts,
    suggestions,
    roi: {
      creditsSpentThisMonth: round(usedThisMonth),
      memberRevenueInfluenced,
      businessesStarted,
      booksPublished,
      booksInProgress,
      productsCreated: input.productsLast30,
      moneyMovesCompleted,
      blueprintsActive: input.blueprints,
      plain,
    },
  };
}
