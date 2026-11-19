import { memo, useEffect, useMemo, useState } from 'react';
import { COLORS, LABEL, fredUrl, evaluate, backtest } from './indicators.js';

const fmt = (x, d = 2) => x.toFixed(d).replace('.', ',');
const pct = (x) => fmt(x * 100, 1) + ' %';
const dfmt = (d) => d.split('-').reverse().join('.');
const VERDICT = ['Ruhige Lage', 'Erhöhte Vorsicht', 'Warnlage'];
const RANGES = [[0, 'Alles'], [30, '30 J.'], [20, '20 J.'], [10, '10 J.'], [5, '5 J.']];

// Chart-Geometrie (viewBox-Einheiten)
const W = 900, H = 260, TOP = 8, PLOT_BOTTOM = 204, BAND_Y = 214, BAND_H = 26;

// Darstellbarer Wertebereich je Skala (nur für die Anzeige, die Ampel-Logik nutzt die Schwellen aus indicators.js)
const SCALE = { NFCI: [-1, 1], STLFSI4: [-1.5, 3], T10Y3M: [-1.5, 3.5], BAMLH0A0HYM2: [2, 8], VIXCLS: [10, 40], ICSA_REL: [0, 50] };
const f1 = (x) => String(x).replace('.', ',');
const bandText = ({ dir, t: [a, b] }) =>
  dir > 0 ? [`unter ${f1(a)}`, `${f1(a)} bis ${f1(b)}`, `ab ${f1(b)}`] : [`über ${f1(a)}`, `${f1(b)} bis ${f1(a)}`, `unter ${f1(b)}`];

// Einordnung: Farbskala mit Marker beim aktuellen Wert plus Schwellen als Text
function Scale({ i, v }) {
  const [min, max] = SCALE[i.id], lo = Math.min(...i.t), hi = Math.max(...i.t), edges = [min, lo, hi, max];
  const p = (x) => Math.max(0, Math.min(100, ((x - min) / (max - min)) * 100));
  const cols = i.dir > 0 ? [0, 1, 2] : [2, 1, 0], b = bandText(i);
  return (
    <div className="scale">
      <div className="track" role="img" aria-label={`Aktueller Wert ${fmt(v)} auf der Farbskala`}>
        <div className="seg">
          {cols.map((c, k) => <span key={k} style={{ left: `${p(edges[k])}%`, width: `${p(edges[k + 1]) - p(edges[k])}%`, background: COLORS[c] }} />)}
        </div>
        <em style={{ left: `${p(v)}%` }} />
      </div>
      <div className="ticks">{[lo, hi].map((x) => <span key={x} style={{ left: `${p(x)}%` }}>{f1(x)}</span>)}</div>
      <ul>{[0, 1, 2].map((c) => <li key={c}><i className="dot" style={{ background: COLORS[c] }} />{LABEL[c]}: {b[c]}{i.unit}</li>)}</ul>
      {i.rise && <p className="sub">Gelb auch bei einem Anstieg um ≥ {f1(i.rise)} in 4 Wochen</p>}
    </div>
  );
}

// ---- Datenbasis (alles aus data.json) ----
const ds = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(2, 4)}`;
const addDays = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const num0 = (x) => x.toLocaleString('de-DE', { maximumFractionDigits: 0 });

function Icon({ n }) {
  const p = {
    sliders: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="#fff" /><circle cx="15" cy="12" r="2" fill="#fff" /><circle cx="8" cy="17" r="2" fill="#fff" /></>,
    table: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M9 10v9" /></>,
    link: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  }[n];
  return <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">{p}</svg>;
}

// CLAIMS-BEGIN
const claimsView = (raw) => {
  const n = raw.length;
  const avg = raw.map((_, k) => { const w = raw.slice(Math.max(0, k - 3), k + 1); return w.reduce((a, [, v]) => a + v, 0) / w.length; });
  const from = Math.max(3, n - 52);
  let m = from; for (let k = from; k < n; k++) if (avg[k] < avg[m]) m = k;
  const start = Math.max(Math.min(m, n - 4), n - 10);
  return { avg, m, rel: (avg[n - 1] / avg[m] - 1) * 100, rows: raw.slice(start).map(([d, v], j) => ({ k: start + j, d, v })) };
};
// CLAIMS-END

function Spark({ s, i }) {
  const pts = s.slice(-52), vs = pts.map((p) => p[1]), W = 260, H = 56;
  const lo = Math.min(...vs, ...i.t), hi = Math.max(...vs, ...i.t);
  const x = (k) => (k / (pts.length - 1)) * W, y = (v) => 4 + (1 - (v - lo) / (hi - lo || 1)) * (H - 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="spark" role="img" aria-label="Verlauf der letzten 52 Wochen mit Gelb- und Rot-Schwelle">
      {i.t.map((t, k) => <line key={k} x1="0" x2={W} y1={y(t)} y2={y(t)} stroke={COLORS[k + 1]} strokeDasharray="3 3" />)}
      <polyline points={vs.map((v, k) => `${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(' ')} fill="none" stroke="#1b2430" strokeWidth="1.5" />
      <circle cx={x(vs.length - 1)} cy={y(vs[vs.length - 1])} r="3" fill="#1b2430" />
    </svg>
  );
}

function Claims({ raw }) {
  const { avg, m, rel, rows } = claimsView(raw);
  return (
    <>
      <table className="mini">
        <thead><tr><th>Woche bis</th><th>Anträge</th><th>4-Wo.-Schnitt</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.k} className={r.k === m ? 'lo' : ''}><td>{ds(addDays(r.d, -6))}</td><td>{num0(r.v)}</td><td>{num0(avg[r.k])}</td></tr>)}</tbody>
      </table>
      <p className="sub">Markiert: Tief des 4-Wochen-Schnitts der letzten 52 Wochen ({num0(avg[m])}, Woche bis {ds(addDays(raw[m][0], -6))}). Aktuell liegt der Schnitt {fmt(rel, 1)} % darüber.</p>
    </>
  );
}

// Minimale Datenbasis je Indikator: Verlauf, letzte Werte, Spanne der letzten 52 Wochen
function Basis({ i, series }) {
  const s = series[i.id] || [];
  if (s.length < 2) return null;
  const yr = s.slice(-52).map((p) => p[1]);
  return (
    <>
      <Spark s={s} i={i} />
      <p className="sub">Letzte 52 Wochen, gestrichelt: Gelb- und Rot-Schwelle.</p>
      {i.id === 'ICSA_REL' && series.ICSA ? <Claims raw={series.ICSA} /> : (
        <>
          <table className="mini">
            <thead><tr><th>Datum</th><th>Wert</th></tr></thead>
            <tbody>{s.slice(-6).reverse().map(([d, v]) => <tr key={d}><td>{ds(d)}</td><td>{fmt(v)}{i.unit}</td></tr>)}</tbody>
          </table>
          <p className="sub">Spanne der letzten 52 Wochen: {fmt(Math.min(...yr))} bis {fmt(Math.max(...yr))}{i.unit}</p>
        </>
      )}
    </>
  );
}

function Light({ c }) {
  return (
    <div className="light" role="img" aria-label={LABEL[c]}>
      {[2, 1, 0].map((k) => <i key={k} style={k === c ? { background: COLORS[k], boxShadow: `0 0 36px ${COLORS[k]}` } : undefined} />)}
    </div>
  );
}

// Statische Ebene (Gitter, Ampelleiste, Kurslinie): wird beim Hovern nicht neu gezeichnet
const Layer = memo(function Layer({ strip, g }) {
  return (
    <>
      {g.ticks.map((t) => (
        <g key={t.i}>
          <line x1={g.x(t.i)} x2={g.x(t.i)} y1={TOP} y2={BAND_Y + BAND_H} stroke="#d3d9e0" strokeWidth="1" />
          <text x={g.x(t.i)} y={H - 4} fontSize="12" fill="#5a6676" textAnchor={t.a}>{t.yr}</text>
        </g>
      ))}
      {strip.map((s, i) => s.c != null && <rect key={i} x={g.x(i) - g.cw / 2} y={BAND_Y} width={g.cw} height={BAND_H} fill={COLORS[s.c]} />)}
      <polyline points={g.pts} fill="none" stroke="#1b2430" strokeWidth="1.4" />
    </>
  );
});

function Chart({ strip }) {
  const P = strip.length, [h, setH] = useState(null);
  const g = useMemo(() => {
    const lp = strip.map((s) => Math.log(s.p)), lo = Math.min(...lp), hi = Math.max(...lp);
    const x = (i) => (i / (P - 1)) * W, y = (v) => TOP + (1 - (v - lo) / (hi - lo || 1)) * (PLOT_BOTTOM - TOP);
    const span = +strip[P - 1].d.slice(0, 4) - +strip[0].d.slice(0, 4), step = span > 40 ? 10 : span > 20 ? 5 : span > 10 ? 2 : 1;
    const ticks = [];
    strip.forEach((s, i) => {
      const yr = +s.d.slice(0, 4);
      if (yr % step === 0 && (i === 0 || +strip[i - 1].d.slice(0, 4) !== yr)) {
        const px = x(i); ticks.push({ i, yr, a: px < 24 ? 'start' : px > W - 24 ? 'end' : 'middle' });
      }
    });
    return { lp, x, y, cw: W / (P - 1) + 0.4, ticks, pts: lp.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ') };
  }, [strip, P]);

  useEffect(() => setH(null), [strip]);

  const clamp = (n) => Math.max(0, Math.min(P - 1, n));
  const pick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setH(clamp(Math.round(((e.clientX - r.left) / r.width) * (P - 1))));
  };
  const key = (e) => {
    const step = e.shiftKey ? 13 : 1; let n = h ?? P - 1;
    if (e.key === 'ArrowLeft') n -= step; else if (e.key === 'ArrowRight') n += step;
    else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = P - 1; else return;
    e.preventDefault(); setH(clamp(n));
  };

  const s = h != null ? strip[h] : null, cx = s ? g.x(h) : 0;
  return (
    <div className="chartwrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" tabIndex={0} role="img"
        aria-label="Indexverlauf mit Ampelfarbe je Woche. Pfeiltasten wählen die Woche, Umschalt+Pfeil springt 13 Wochen."
        onPointerMove={pick} onPointerDown={pick} onPointerLeave={(e) => e.pointerType === 'mouse' && setH(null)}
        onKeyDown={key} onFocus={() => h == null && setH(P - 1)} onBlur={() => setH(null)}>
        <Layer strip={strip} g={g} />
        {s && (
          <g pointerEvents="none">
            <line x1={cx} x2={cx} y1={TOP} y2={BAND_Y + BAND_H} stroke="#1b2430" strokeWidth="1" strokeDasharray="4 3" />
            <rect x={cx - Math.max(g.cw, 3) / 2} y={BAND_Y - 1} width={Math.max(g.cw, 3)} height={BAND_H + 2} fill="none" stroke="#1b2430" strokeWidth="2" />
            <circle cx={cx} cy={g.y(g.lp[h])} r="4.5" fill="#fff" stroke="#1b2430" strokeWidth="2" />
          </g>
        )}
      </svg>
      {s && (
        <div className="tip" role="status" style={{ left: `${(cx / W) * 100}%`, transform: `translateX(${cx < W * 0.15 ? '0' : cx > W * 0.85 ? '-100%' : '-50%'})` }}>
          <b>{dfmt(s.d)}</b> <small>Wochenschluss</small>
          <span>Index {s.p.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</span>
          <span>{s.c != null ? <><i className="dot" style={{ background: COLORS[s.c] }} /> {LABEL[s.c]}</> : 'keine Ampel (zu wenig Daten)'}</span>
        </div>
      )}
    </div>
  );
}

function Group({ label, items, value, onChange }) {
  return (
    <div role="group" aria-label={label}>
      {items.map(([k, n]) => <button key={k} aria-pressed={value === k} onClick={() => onChange(k)}>{n}</button>)}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null), [err, setErr] = useState(false), [ref, setRef] = useState('SPX'), [range, setRange] = useState(20);
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data.json').then((r) => { if (!r.ok) throw 0; return r.json(); }).then(setData).catch(() => setErr(true));
  }, []);
  const now = useMemo(() => data && evaluate(data.series, data.updated.slice(0, 10)), [data]);
  const bt = useMemo(() => data && backtest(data.prices[ref], data.series), [data, ref]);
  const view = useMemo(() => {
    if (!bt || !range) return bt && bt.strip;
    const c = new Date(bt.strip.at(-1).d + 'T00:00:00Z'); c.setUTCFullYear(c.getUTCFullYear() - range);
    const iso = c.toISOString().slice(0, 10);
    return bt.strip.filter((s) => s.d >= iso);
  }, [bt, range]);

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
              <details><summary><Icon n="sliders" />Schwellenwerte</summary><Scale i={i} v={v} /></details>
              <details><summary><Icon n="table" />Datenbasis</summary><Basis i={i} series={data.series} /></details>
              <a href={fredUrl(i.fred || i.id)} target="_blank" rel="noreferrer"><Icon n="link" />Datenreihe bei FRED</a>
            </article>
          );
        })}
      </section>

      <section>
        <div className="bar">
          <h2>Backtest</h2>
          <div className="groups">
            <Group label="Referenzindex" items={[['SPX', 'S&P 500'], ['NDX', 'NASDAQ 100']]} value={ref} onChange={setRef} />
            <Group label="Zeitraum" items={RANGES} value={range} onChange={setRange} />
          </div>
        </div>
        <Chart strip={view} />
        <table>
          <caption>Auswertung über den gesamten Zeitraum (unabhängig vom Chart-Ausschnitt)</caption>
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
