import { MCC_TO_CATEGORY, SPEND_FACTORS } from "./carbonFactors";

export function mccToCategory(mcc, fallback) {
  if (!mcc) return fallback || "General";
  return MCC_TO_CATEGORY[mcc] || fallback || "General";
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}
export function sum(arr, get) {
  return arr.reduce((a, b) => a + get(b), 0);
}

// Estimate per-transaction CO2e (kg) using simple hierarchy: category → spend
export function estimateTransactionCO2(tx) {
  const cat = tx.category || mccToCategory(tx.mcc, tx.category);
  const factor = SPEND_FACTORS[cat] || SPEND_FACTORS.General;
  const co2e_kg = round2((tx.amount || 0) * factor);
  const method = cat && cat !== "General" ? "category" : "spend";
  const confidence = method === "category" ? "Medium" : "Low";
  return { ...tx, co2e_kg, method, confidence };
}

// Aggregate to a last-N-days daily series [{date, value}]
export function toDailySeries(txs, days = 60) {
  const byDay = new Map();
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, 0);
  }
  txs.forEach(t => {
    const key = (t.date || "").slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + (t.co2e_kg || 0));
  });
  return Array.from(byDay.entries())
    .map(([date, value]) => ({ date, value: round2(value) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Category totals [{category, value, pct}]
export function categoryBreakdown(txs) {
  const map = new Map();
  txs.forEach(t => {
    const cat = t.category || mccToCategory(t.mcc);
    map.set(cat, (map.get(cat) || 0) + (t.co2e_kg || 0));
  });
  const total = sum(Array.from(map.values()), x => x) || 1;
  return Array.from(map.entries())
    .map(([category, value]) => ({ category, value: round2(value), pct: round2((value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

// Month-over-month improvement (%). +% = improved (lower CO2 this month)
export function monthOverMonthImprovement(txs, referenceDate = new Date()) {
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();
  const startThis = new Date(y, m, 1);
  const startPrev = new Date(y, m - 1, 1);
  const endPrev = new Date(y, m, 1);

  const inRange = (d, a, b) => d >= a && d < b;

  const thisMTD = sum(txs.filter(t => inRange(new Date(t.date), startThis, referenceDate)), t => t.co2e_kg || 0);
  const lastMTD = sum(txs.filter(t => inRange(new Date(t.date), startPrev, endPrev)), t => t.co2e_kg || 0);

  if (lastMTD === 0) return 0;
  return round2(((lastMTD - thisMTD) / lastMTD) * 100);
}

// Eco Score heuristic 0–100: intensity 50%, improvement 30%, mix 10%, streak 10%
export function ecoScore(txs) {
  if (!txs.length) return { score: 50, details: { intensity: 0, improvement: 0, mix: 0, streak: 0 } };

  const totalSpend = sum(txs, t => t.amount || 0) || 1;
  const totalCO2   = sum(txs, t => t.co2e_kg || 0);
  const intensity  = totalCO2 / totalSpend; // kg / $

  // baseline band [0.3, 1.5] kg/$ → 0–100 (lower = better)
  const minI = 0.3, maxI = 1.5;
  const clamped = Math.max(minI, Math.min(maxI, intensity));
  const intensityScore = Math.round((1 - (clamped - minI) / (maxI - minI)) * 100);

  const improvementPct   = monthOverMonthImprovement(txs);
  const improvementScore = Math.max(0, Math.min(100, 50 + improvementPct));

  // Category mix: reward Grocery/Utilities/Entertainment, penalize Travel/Transport/Fashion
  const good = new Set(["Grocery", "Utilities", "Entertainment"]);
  const bad  = new Set(["Travel", "Transport", "Fashion"]);
  const mixB = categoryBreakdown(txs);
  let mix = 50;
  mixB.forEach(b => {
    if (good.has(b.category)) mix += b.pct * 0.1;
    if (bad.has(b.category))  mix -= b.pct * 0.15;
  });
  const mixScore = Math.max(0, Math.min(100, Math.round(mix)));

  // Streak: consecutive recent days with daily total <= 6 kg
  const daily = toDailySeries(txs, 30).reverse();
  let streak = 0;
  for (const d of daily) { if (d.value <= 6) streak++; else break; }
  const streakScore = Math.min(100, streak * 10);

  const score = Math.round(0.5*intensityScore + 0.3*improvementScore + 0.1*mixScore + 0.1*streakScore);
  return { score: Math.max(1, Math.min(99, score)), details: { intensity: intensityScore, improvement: improvementScore, mix: mixScore, streak: streakScore } };
}