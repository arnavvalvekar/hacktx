import { generateSeedTransactions } from "../lib/demo/seed";
import { estimateTransactionCO2, toDailySeries, categoryBreakdown, ecoScore, sum, round2 } from "../lib/carbon";

let _cache = null; // { tx: TxWithCO2[], generatedAt: number }

function ensureData() {
  if (_cache && Date.now() - _cache.generatedAt < 1000 * 60 * 60) return _cache.tx; // 1h
  const raw = generateSeedTransactions(60);
  const withCo2 = raw.map(estimateTransactionCO2);
  _cache = { tx: withCo2, generatedAt: Date.now() };
  return withCo2;
}

export async function getTransactions() {
  return ensureData().slice().sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDashboardSummary() {
  const tx = ensureData();
  const todayISO = new Date().toISOString().slice(0, 10);
  const today = sum(tx.filter(t => (t.date || "").startsWith(todayISO)), t => t.co2e_kg || 0);

  const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
  const start = new Date(y, m, 1).toISOString().slice(0, 10);
  const mtd = sum(tx.filter(t => ((t.date || "").slice(0,10) >= start)), t => t.co2e_kg || 0);

  const eco = ecoScore(tx);
  return {
    today_kg: round2(today),
    mtd_kg: round2(mtd),
    eco_score: eco.score,
    eco_details: eco.details,
    tx_count: tx.length,
  };
}

export async function getTrends() {
  return toDailySeries(ensureData(), 60);
}

export async function getCategoryBreakdown() {
  return categoryBreakdown(ensureData());
}