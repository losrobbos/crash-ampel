export const COLORS = ['#2f8f5b', '#e0a100', '#c8402f'];
export const LABEL = ['Grün', 'Gelb', 'Rot'];
export const fredUrl = (id) => `https://fred.stlouisfed.org/series/${id}`;
const level = (i, v) => (i.dir * v >= i.dir * i.t[1] ? 2 : i.dir * v >= i.dir * i.t[0] ? 1 : 0);
const idxAt = (s, d) => { let lo = 0, hi = s.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (s[m][0] <= d) { r = m; lo = m + 1; } else hi = m - 1; } return r; };

// Bewertet alle Indikatoren zum Stichtag; fehlende Reihen werden herausgerechnet (Gewichte renormiert)
export function evaluate(cfg, series, date) {
  const rows = []; let sum = 0, wsum = 0;
  for (const i of cfg.indicators) {
    const s = series[i.id] || [], k = idxAt(s, date);
    if (k < 0 || new Date(date) - new Date(s[k][0]) > 9e9) continue; // noch nicht gestartet / veraltet
    const v = s[k][1], trend = v - s[Math.max(0, k - 4)][1];
    let lv = level(i, v);
    if (i.rise && lv === 0 && trend >= i.rise) lv = 1; // schneller Anstieg = mindestens Gelb
    rows.push({ i, v, trend, lv, date: s[k][0] }); sum += i.w * lv; wsum += i.w;
  }
  if (wsum < cfg.score.minWeight) return null;
  const score = sum / wsum; let overall = score < cfg.score.yellow ? 0 : score < cfg.score.red ? 1 : 2;
  if (cfg.floor) overall = Math.max(overall, cfg.floor(Object.fromEntries(rows.map((r) => [r.i.id, r.lv])))); // Mindestfarbe laut Konfiguration
  return { rows, score, overall };
}

// Wochenreihe: wie entwickelte sich der Index in den nächsten H Wochen je Ampelfarbe?
export function backtest(cfg, px, series, H = 26) {
  const strip = [], B = [0, 1, 2].map(() => ({ n: 0, r: 0, w: 0, d: 0 }));
  px.forEach(([d, p], n) => {
    const ev = evaluate(cfg, series, d);
    strip.push({ d, p, c: ev ? ev.overall : null });
    if (ev && n + H < px.length) {
      let w = 0; for (let k = 1; k <= H; k++) w = Math.min(w, px[n + k][1] / p - 1);
      const b = B[ev.overall]; b.n++; b.r += px[n + H][1] / p - 1; b.w += w; b.d += w <= -0.1 ? 1 : 0;
    }
  });
  return { strip, B: B.map((b) => (b.n ? { n: b.n, r: b.r / b.n, w: b.w / b.n, d: b.d / b.n } : null)) };
}
