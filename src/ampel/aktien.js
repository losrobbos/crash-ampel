// Konfiguration der Aktien-Crash-Ampel: Indikatoren, Schwellen, Gewichte, Texte
import { text, more } from './aktien.guide.js';

export default {
  id: 'aktien',
  navLabel: 'Ampel',
  dataFile: 'data-aktien.json',
  verdicts: ['Ruhige Lage', 'Erhöhte Vorsicht', 'Warnlage'],
  score: { yellow: 0.5, red: 1.2, minWeight: 0.5 },
  // Sicherheitsregel: NFCI und HY-Spread gleichzeitig rot = mindestens Gelb
  floor: (lv) => (lv.NFCI === 2 && lv.BAMLH0A0HYM2 === 2 ? 1 : 0),
  refs: [['SPX', 'S&P 500'], ['NDX', 'NASDAQ 100']],
  backtestNote: "Die Ampel wird für jede Woche mit den damals verfügbaren Reihen berechnet; fehlende Reihen werden herausgerechnet (der HY-Spread ist bei FRED nur für wenige Jahre abrufbar). Die 26-Wochen-Fenster überlappen, die Zahlen sind keine unabhängigen Beobachtungen. NFCI-Werte werden nachträglich revidiert und sind im Rückblick leicht zu gut. Kursdaten: Yahoo Finance, ohne Dividenden.",
  // dir 1: höher = schlechter, -1: niedriger = schlechter; t = [Gelb ab, Rot ab]; w = Gewicht; scale = Anzeigebereich
  indicators: [
  { id: 'NFCI', scale: [-1, 1], name: 'NFCI', sub: 'Finanzbedingungen (Chicago Fed)', w: 0.25, dir: 1, t: [-0.3, 0], rise: 0.15, unit: '' },
  { id: 'STLFSI4', scale: [-1.5, 3], name: 'St. Louis Stressindex', sub: 'Finanzstress (St. Louis Fed)', w: 0.1, dir: 1, t: [0, 1], unit: '' },
  { id: 'T10Y3M', scale: [-1.5, 3.5], name: 'Zinskurve 10J − 3M', sub: 'Negativ = invertiert', w: 0.2, dir: -1, t: [0.5, 0], unit: ' Pp.' },
  { id: 'BAMLH0A0HYM2', scale: [2, 8], name: 'High-Yield-Spread', sub: 'Risikoaufschlag Unternehmensanleihen', w: 0.15, dir: 1, t: [4, 5.5], unit: ' Pp.' },
  { id: 'VIXCLS', scale: [10, 40], name: 'VIX', sub: 'Erwartete Schwankung S&P 500', w: 0.15, dir: 1, t: [20, 30], unit: '' },
  { id: 'ICSA_REL', scale: [0, 50], fred: 'ICSA', basis: 'claims', raw: 'ICSA', name: 'Erstanträge Arbeitslosenhilfe', sub: '4-Wochen-Schnitt über 52-Wochen-Tief', w: 0.15, dir: 1, t: [10, 25], unit: ' %' },
  // Info-Indikator (info: true): wird angezeigt, zählt aber nicht in Score, Gesamt-Ampel und Backtest. Ist eine Umrechnung des Zinskurven-Abstands, daher nicht doppelt im Score.
  { id: 'REC_PROB', info: true, basis: 'recprob', raw: 'T10Y3M_MM', link: ['Modell bei der New York Fed (PDF)', 'https://www.newyorkfed.org/medialibrary/media/research/capital_markets/Prob_Rec.pdf'], scale: [0, 70], name: 'Rezessionswahrscheinlichkeit', sub: '12 Monate voraus (Modell der New York Fed)', dir: 1, t: [20, 30], unit: ' %' },
  ],
  guide: {
    lead: "So liest du die Ampel: was die sechs Score-Indikatoren und die zusätzlichen Info-Indikatoren messen, warum sie für den Aktienmarkt zählen und wie die Gesamtfarbe entsteht. Die Ampel ist ein Orientierungswerkzeug und keine Prognose.",
    how: {
      intro: "Jeder Indikator bekommt eine Farbe, die als Punkte zählt (Grün 0, Gelb 1, Rot 2). Daraus wird ein gewichteter Durchschnitt, der Score, gebildet. Fehlt eine Reihe, wird sie herausgerechnet und die übrigen Gewichte werden neu verteilt.",
      bullets: ["**Grün** bei einem Score unter 0,5, **Gelb** bis 1,2, darüber **Rot**.", "**Sicherheitsregel:** Sind NFCI und High-Yield-Spread gleichzeitig rot, ist die Gesamt-Ampel mindestens Gelb, auch wenn die übrigen Indikatoren ruhig sind.", "**Info-Indikatoren** (z. B. die Rezessionswahrscheinlichkeit) werden mit Farbe und Trend angezeigt, zählen aber nicht in Score, Gesamt-Ampel und Backtest.", "**Trend-Pfeil:** Auf den Karten zeigt er die Entwicklung der letzten vier Wochen. Eine Verschlechterung ist oft wichtiger als der absolute Wert."],
    },
    limits: ["Die Ampel zeigt erhöhte Risikolagen, sie sagt keinen Crash voraus. Auch Rot-Phasen enden oft ohne größeren Rückgang.", "Viele Indikatoren sind eher bestätigend als vorlaufend. Nur Zinskurve und Erstanträge sind echte Frühindikatoren.", "FRED-Werte wie der NFCI werden revidiert. Rückblickende Auswertungen sehen dadurch besser aus, als die Ampel in Echtzeit war.", "Schwellen und Gewichte sind Startwerte und stehen in src/ampel/aktien.js. Diese Seite liest sie von dort, sie bleibt also automatisch aktuell."],
    text,
    more,
  },
};
