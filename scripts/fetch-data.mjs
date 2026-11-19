// Holt FRED-Serien (CSV, ohne API-Key) und Indexkurse (Yahoo) -> public/data.json (wöchentlich, Freitag)
import { writeFileSync, mkdirSync } from 'node:fs';
const FRED = ['NFCI', 'STLFSI4', 'T10Y3M', 'BAMLH0A0HYM2', 'VIXCLS', 'ICSA'];
const INDEX = { SPX: '^GSPC', NDX: '^NDX' };
const fri = (iso) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
};
// Pro Woche (Samstag bis Freitag) bleibt der letzte Wert, mit seinem ECHTEN Datum (nicht dem Freitag der Woche)
const weekly = (rows) => [...new Map(rows.map(([d, v]) => [fri(d), [d, v]])).values()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
const get = async (url, headers = {}) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 crash-ampel', ...headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};
async function fred(id) {
  const txt = await (await get(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=1970-01-01`)).text();
  const rows = txt.trim().split('\n').slice(1).map((l) => l.split(',')).filter(([, v]) => v && v !== '.').map(([d, v]) => [d, +v]);
  return weekly(rows);
}
async function yahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=0&period2=${Math.floor(Date.now() / 1000)}&interval=1d`;
  const res = (await (await get(url)).json()).chart.result[0];
  const close = res.indicators.quote[0].close;
  return weekly(res.timestamp.map((t, i) => [new Date(t * 1000).toISOString().slice(0, 10), close[i]]).filter(([, v]) => v != null));
}
const series = {}, prices = {};
await Promise.all([
  ...FRED.map(async (id) => { series[id] = await fred(id); console.log('FRED', id, series[id].length); }),
  ...Object.entries(INDEX).map(async ([k, s]) => { prices[k] = await yahoo(s); console.log('Yahoo', k, prices[k].length); }),
]);
// REL-BEGIN
// Abstand des 4-Wochen-Schnitts zu seinem 52-Wochen-Tief in Prozent (ab dem 52. Wert)
const rel = (rows) => {
  const avg = rows.map((_, i) => { const w = rows.slice(Math.max(0, i - 3), i + 1); return w.reduce((s, [, v]) => s + v, 0) / w.length; });
  return rows.map(([d], i) => [d, +((avg[i] / Math.min(...avg.slice(Math.max(0, i - 51), i + 1)) - 1) * 100).toFixed(1)]).slice(51);
};
// REL-END
series.ICSA_REL = rel(series.ICSA); // Rohwerte (series.ICSA) bleiben für die Anzeige der Datenbasis erhalten
mkdirSync('public', { recursive: true });
writeFileSync('public/data.json', JSON.stringify({ updated: new Date().toISOString(), series, prices }));
