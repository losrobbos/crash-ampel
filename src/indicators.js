export const COLORS = ['#2f8f5b', '#e0a100', '#c8402f'];
export const LABEL = ['Grün', 'Gelb', 'Rot'];
// dir 1: höher = schlechter, -1: niedriger = schlechter; t = [Gelb ab, Rot ab]; w = Gewicht
export const INDICATORS = [
  { id: 'NFCI', name: 'NFCI', sub: 'Finanzbedingungen (Chicago Fed)', w: 0.25, dir: 1, t: [-0.3, 0], rise: 0.15, unit: '' },
  { id: 'STLFSI4', name: 'St. Louis Stressindex', sub: 'Finanzstress (St. Louis Fed)', w: 0.1, dir: 1, t: [0, 1], unit: '' },
  { id: 'T10Y3M', name: 'Zinskurve 10J − 3M', sub: 'Negativ = invertiert', w: 0.2, dir: -1, t: [0.5, 0], unit: ' Pp.' },
  { id: 'BAMLH0A0HYM2', name: 'High-Yield-Spread', sub: 'Risikoaufschlag Unternehmensanleihen', w: 0.15, dir: 1, t: [4, 5.5], unit: ' Pp.' },
  { id: 'VIXCLS', name: 'VIX', sub: 'Erwartete Schwankung S&P 500', w: 0.15, dir: 1, t: [20, 30], unit: '' },
  { id: 'ICSA_REL', fred: 'ICSA', name: 'Erstanträge Arbeitslosenhilfe', sub: '4-Wochen-Schnitt über 52-Wochen-Tief', w: 0.15, dir: 1, t: [10, 25], unit: ' %' },
];
export const fredUrl = (id) => `https://fred.stlouisfed.org/series/${id}`;
const level = (i, v) => (i.dir * v >= i.dir * i.t[1] ? 2 : i.dir * v >= i.dir * i.t[0] ? 1 : 0);
const idxAt = (s, d) => { let lo = 0, hi = s.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (s[m][0] <= d) { r = m; lo = m + 1; } else hi = m - 1; } return r; };

// Bewertet alle Indikatoren zum Stichtag; fehlende Reihen werden herausgerechnet (Gewichte renormiert)
export function evaluate(series, date) {
  const rows = []; let sum = 0, wsum = 0;
  for (const i of INDICATORS) {
    const s = series[i.id] || [], k = idxAt(s, date);
    if (k < 0 || new Date(date) - new Date(s[k][0]) > 9e9) continue; // noch nicht gestartet / veraltet
    const v = s[k][1], trend = v - s[Math.max(0, k - 4)][1];
    let lv = level(i, v);
    if (i.rise && lv === 0 && trend >= i.rise) lv = 1; // schneller Anstieg = mindestens Gelb
    rows.push({ i, v, trend, lv, date: s[k][0] }); sum += i.w * lv; wsum += i.w;
  }
  if (wsum < 0.5) return null;
  const score = sum / wsum; let overall = score < 0.5 ? 0 : score < 1.2 ? 1 : 2;
  const lvOf = (id) => rows.find((r) => r.i.id === id)?.lv;
  if (lvOf('NFCI') === 2 && lvOf('BAMLH0A0HYM2') === 2) overall = Math.max(overall, 1);
  return { rows, score, overall };
}

// Wochenreihe: wie entwickelte sich der Index in den nächsten H Wochen je Ampelfarbe?
export function backtest(px, series, H = 26) {
  const strip = [], B = [0, 1, 2].map(() => ({ n: 0, r: 0, w: 0, d: 0 }));
  px.forEach(([d, p], n) => {
    const ev = evaluate(series, d);
    strip.push({ d, p, c: ev ? ev.overall : null });
    if (ev && n + H < px.length) {
      let w = 0; for (let k = 1; k <= H; k++) w = Math.min(w, px[n + k][1] / p - 1);
      const b = B[ev.overall]; b.n++; b.r += px[n + H][1] / p - 1; b.w += w; b.d += w <= -0.1 ? 1 : 0;
    }
  });
  return { strip, B: B.map((b) => (b.n ? { n: b.n, r: b.r / b.n, w: b.w / b.n, d: b.d / b.n } : null)) };
}
