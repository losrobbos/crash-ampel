// Gemeinsame Helfer für alle Daten-Jobs (FRED-CSV, Yahoo, Wochen-Verdichtung)
export const fri = (iso) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + ((5 - d.getUTCDay() + 7) % 7));
  return d.toISOString().slice(0, 10);
};
// Pro Woche (Samstag bis Freitag) bleibt der letzte Wert, mit seinem ECHTEN Datum (nicht dem Freitag der Woche)
export const weekly = (rows) => [...new Map(rows.map(([d, v]) => [fri(d), [d, v]])).values()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
const get = async (url, headers = {}) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 crash-ampel', ...headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};
export async function fred(id) {
  const txt = await (await get(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=1970-01-01`)).text();
  const rows = txt.trim().split('\n').slice(1).map((l) => l.split(',')).filter(([, v]) => v && v !== '.').map(([d, v]) => [d, +v]);
  return weekly(rows);
}
export async function yahoo(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?period1=0&period2=${Math.floor(Date.now() / 1000)}&interval=1d`;
  const res = (await (await get(url)).json()).chart.result[0];
  const close = res.indicators.quote[0].close;
  return weekly(res.timestamp.map((t, i) => [new Date(t * 1000).toISOString().slice(0, 10), close[i]]).filter(([, v]) => v != null));
}
