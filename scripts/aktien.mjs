// Daten-Job der Aktien-Crash-Ampel
import { fred, yahoo } from './lib.mjs';
const FRED = ['NFCI', 'STLFSI4', 'T10Y3M', 'BAMLH0A0HYM2', 'VIXCLS', 'ICSA'];
const INDEX = { SPX: '^GSPC', NDX: '^NDX' };
// REL-BEGIN
// Abstand des 4-Wochen-Schnitts zu seinem 52-Wochen-Tief in Prozent (ab dem 52. Wert)
const rel = (rows) => {
  const avg = rows.map((_, i) => { const w = rows.slice(Math.max(0, i - 3), i + 1); return w.reduce((s, [, v]) => s + v, 0) / w.length; });
  return rows.map(([d], i) => [d, +((avg[i] / Math.min(...avg.slice(Math.max(0, i - 51), i + 1)) - 1) * 100).toFixed(1)]).slice(51);
};
// REL-END

export async function fetchAktien() {
  const series = {}, prices = {};
  await Promise.all([
    ...FRED.map(async (id) => { series[id] = await fred(id); console.log('FRED', id, series[id].length); }),
    ...Object.entries(INDEX).map(async ([k, s]) => { prices[k] = await yahoo(s); console.log('Yahoo', k, prices[k].length); }),
  ]);
  series.ICSA_REL = rel(series.ICSA); // Rohwerte (series.ICSA) bleiben für die Anzeige der Datenbasis erhalten
  return { series, prices };
}
