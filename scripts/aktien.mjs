// Daten-Job der Aktien-Crash-Ampel
import { fred, fredRaw, yahoo, weekly } from './lib.mjs';
const FRED = ['NFCI', 'STLFSI4', 'BAMLH0A0HYM2', 'VIXCLS', 'ICSA']; // T10Y3M wird unten separat geholt (Tageswerte für das Monatsmittel)
const INDEX = { SPX: '^GSPC', NDX: '^NDX' };
// REL-BEGIN
// Abstand des 4-Wochen-Schnitts zu seinem 52-Wochen-Tief in Prozent (ab dem 52. Wert)
const rel = (rows) => {
  const avg = rows.map((_, i) => { const w = rows.slice(Math.max(0, i - 3), i + 1); return w.reduce((s, [, v]) => s + v, 0) / w.length; });
  return rows.map(([d], i) => [d, +((avg[i] / Math.min(...avg.slice(Math.max(0, i - 51), i + 1)) - 1) * 100).toFixed(1)]).slice(51);
};
// REL-END

// REC-BEGIN
// Rezessionswahrscheinlichkeit (NY Fed): Probit auf dem Spread 10J minus 3M, Parameter laut NY Fed (Schätzung 1959-2009)
const A = -0.5333, B = -0.633;
const Phi = (z) => { // Normalverteilung, Näherung nach Abramowitz/Stegun 7.1.26 (Fehler < 1e-7)
  const x = Math.abs(z) / Math.SQRT2, t = 1 / (1 + 0.3275911 * x);
  const e = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + (z < 0 ? -e : e));
};
// Je Woche: Ø der Tageswerte des laufenden Monats bis zum Stichtag (ohne Blick in die Zukunft; die NY Fed nutzt vermutlich eine leicht andere 3-Monats-Rate, Abweichung bis ca. 1 Pp. möglich)
export function recProb(raw, weeks) {
  const mm = [], p = []; let j = 0, mon = '', sum = 0, n = 0;
  for (const [d] of weeks) {
    while (j < raw.length && raw[j][0] <= d) { if (raw[j][0].slice(0, 7) !== mon) { mon = raw[j][0].slice(0, 7); sum = 0; n = 0; } sum += raw[j][1]; n++; j++; }
    const m = sum / n;
    mm.push([d, +m.toFixed(3)]); p.push([d, +(Phi(A + B * m) * 100).toFixed(1)]);
  }
  return { mm, p };
}
// REC-END

export async function fetchAktien() {
  const series = {}, prices = {};
  let spreadRaw;
  await Promise.all([
    (async () => { spreadRaw = await fredRaw('T10Y3M'); series.T10Y3M = weekly(spreadRaw); console.log('FRED T10Y3M', series.T10Y3M.length); })(),
    ...FRED.map(async (id) => { series[id] = await fred(id); console.log('FRED', id, series[id].length); }),
    ...Object.entries(INDEX).map(async ([k, s]) => { prices[k] = await yahoo(s); console.log('Yahoo', k, prices[k].length); }),
  ]);
  const rp = recProb(spreadRaw, series.T10Y3M); series.T10Y3M_MM = rp.mm; series.REC_PROB = rp.p; // Ø Spread und Wahrscheinlichkeit
  series.ICSA_REL = rel(series.ICSA); // Rohwerte (series.ICSA) bleiben für die Anzeige der Datenbasis erhalten
  return { series, prices };
}
