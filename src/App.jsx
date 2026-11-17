import { useEffect, useMemo, useState } from 'react';
import { COLORS, LABEL, fredUrl, evaluate, backtest } from './indicators.js';

const fmt = (x, d = 2) => x.toFixed(d).replace('.', ',');
const pct = (x) => fmt(x * 100, 1) + ' %';
const VERDICT = ['Ruhige Lage', 'Erhöhte Vorsicht', 'Warnlage'];

function Light({ c }) {
  return (
    <div className="light" role="img" aria-label={LABEL[c]}>
      {[2, 1, 0].map((k) => <i key={k} style={k === c ? { background: COLORS[k], boxShadow: `0 0 36px ${COLORS[k]}` } : undefined} />)}
    </div>
  );
}

function Chart({ strip }) {
  const W = 900, H = 240, P = strip.length, lp = strip.map((s) => Math.log(s.p));
  const lo = Math.min(...lp), hi = Math.max(...lp);
  const x = (i) => (i / (P - 1)) * W, y = (v) => 8 + (1 - (v - lo) / (hi - lo)) * (H - 56);
  const pts = lp.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const years = strip.map((s, i) => [s.d.slice(0, 4), i]).filter(([yr, i]) => yr % 10 === 0 && (i === 0 || strip[i - 1].d.slice(0, 4) !== yr));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Indexverlauf mit Ampelfarbe je Woche">
      <polyline points={pts} fill="none" stroke="#1b2430" strokeWidth="1.4" />
      {strip.map((s, i) => s.c != null && <rect key={i} x={x(i)} y={H - 34} width={W / P + 0.6} height="18" fill={COLORS[s.c]} />)}
      {years.map(([yr, i]) => <text key={yr} x={x(i)} y={H - 4} fontSize="12" fill="#5a6676">{yr}</text>)}
    </svg>
  );
}

export default function App() {
  const [data, setData] = useState(null), [err, setErr] = useState(false), [ref, setRef] = useState('SPX');
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data.json').then((r) => { if (!r.ok) throw 0; return r.json(); }).then(setData).catch(() => setErr(true));
  }, []);
  const now = useMemo(() => data && evaluate(data.series, data.updated.slice(0, 10)), [data]);
  const bt = useMemo(() => data && backtest(data.prices[ref], data.series), [data, ref]);

  if (err) return <main><p className="msg">Noch keine Daten. Lokal <code>npm run fetch</code> ausführen (erzeugt <code>public/data.json</code>) und neu laden.</p></main>;
  if (data && !now) return <main><p className="msg">Die geladenen Daten sind veraltet oder unvollständig. Bitte <code>npm run fetch</code> erneut ausführen.</p></main>;
  if (!data) return <main><p className="msg">Lade Daten …</p></main>;

  return (
    <main>
      <header>
        <Light c={now.overall} />
        <div>
          <h1>{VERDICT[now.overall]}</h1>
          <p>Gewichteter Score {fmt(now.score)} von 2,00 · Datenstand {data.updated.slice(0, 10)}</p>
        </div>
      </header>

      <section className="cards">
        {now.rows.map(({ i, v, trend, lv, date }) => {
          const eps = Math.abs(i.t[1] - i.t[0]) * 0.1, worse = trend * i.dir;
          return (
            <article key={i.id}>
              <span className="dot" style={{ background: COLORS[lv] }} title={LABEL[lv]} />
              <h2>{i.name}</h2>
              <p className="sub">{i.sub}</p>
              <p className="val">{fmt(v)}<small>{i.unit}</small></p>
              <p className="sub">{Math.abs(trend) < eps ? '→ stabil' : worse > 0 ? '↗ Belastung steigt' : '↘ Belastung sinkt'} (4 Wochen) · Stand {date}</p>
              <a href={fredUrl(i.id)} target="_blank" rel="noreferrer">Datenreihe bei FRED</a>
            </article>
          );
        })}
      </section>

      <section>
        <div className="bar">
          <h2>Backtest</h2>
          <div role="group" aria-label="Referenzindex">
            {[['SPX', 'S&P 500'], ['NDX', 'NASDAQ 100']].map(([k, n]) => <button key={k} aria-pressed={ref === k} onClick={() => setRef(k)}>{n}</button>)}
          </div>
        </div>
        <Chart strip={bt.strip} />
        <table>
          <thead><tr><th>Ampel</th><th>Wochen</th><th>Ø Ertrag 26 Wo.</th><th>Ø Tiefpunkt 26 Wo.</th><th>Anteil mit ≥ 10 % Rückgang</th></tr></thead>
          <tbody>
            {bt.B.map((b, c) => (
              <tr key={c}>
                <td><span className="dot" style={{ background: COLORS[c] }} /> {LABEL[c]}</td>
                {b ? <><td>{b.n}</td><td>{pct(b.r)}</td><td>{pct(b.w)}</td><td>{pct(b.d)}</td></> : <td colSpan="4">keine Daten</td>}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="sub">Die Ampel wird für jede Woche mit den damals verfügbaren Reihen berechnet; fehlende Reihen werden herausgerechnet (der HY-Spread ist bei FRED nur für wenige Jahre abrufbar). Die 26-Wochen-Fenster überlappen, die Zahlen sind keine unabhängigen Beobachtungen. NFCI-Werte werden nachträglich revidiert und sind im Rückblick leicht zu gut. Kursdaten: Yahoo Finance, ohne Dividenden.</p>
      </section>
    </main>
  );
}
