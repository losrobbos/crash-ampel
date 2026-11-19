import { COLORS, LABEL, fredUrl } from './engine.js';

const f = (x) => String(x).replace('.', ',');
// Schwellenbereiche je Farbe direkt aus der Konfiguration, damit Anleitung und Ampel nie auseinanderlaufen
const bands = ({ dir, t: [a, b] }) =>
  dir > 0 ? [`unter ${f(a)}`, `${f(a)} bis ${f(b)}`, `ab ${f(b)}`] : [`über ${f(a)}`, `${f(b)} bis ${f(a)}`, `unter ${f(b)}`];
const B = (s) => s.split('**').map((t, k) => (k % 2 ? <b key={k}>{t}</b> : t));
const WORDS = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];

export default function Guide({ cfg }) {
  const { lead, how, limits, text: TEXT, more: MORE } = cfg.guide;
  return (
    <main className="guide">
      <h1>Anleitung</h1>
      <p className="lead">{lead}</p>

      <h2>So entsteht die Gesamt-Ampel</h2>
      <div className="prose">
        <p>{how.intro}</p>
        <ul>{how.bullets.map((b, k) => <li key={k}>{B(b)}</li>)}</ul>
      </div>

      <h2>Die {WORDS[cfg.indicators.length] || cfg.indicators.length} Indikatoren</h2>
      {cfg.indicators.map((i) => {
        const t = TEXT[i.id], b = bands(i);
        return (
          <article key={i.id} className="ind">
            <h3>{i.name} <small>{i.sub}</small></h3>
            <p><span className="tag">{t.kat}</span><span className="tag">{t.timing}</span><span className="tag">Gewicht {Math.round(i.w * 100)} %</span></p>
            <div className="chips" aria-label="Schwellenwerte">
              {[0, 1, 2].map((c) => <span key={c} className="chip"><i className="dot" style={{ background: COLORS[c] }} />{LABEL[c]}: {b[c]}{i.unit}</span>)}
              {i.rise && <span className="chip"><i className="dot" style={{ background: COLORS[1] }} />Gelb auch bei Anstieg ≥ {f(i.rise)} in 4 Wochen</span>}
            </div>
            <dl>
              <dt>Was ist das?</dt><dd>{t.was}</dd>
              <dt>Warum ist er wichtig?</dt><dd>{t.warum}</dd>
              <dt>So liest du ihn</dt><dd>{t.lesen}</dd>
            </dl>
            <a href={fredUrl(i.fred || i.id)} target="_blank" rel="noreferrer">Datenreihe bei FRED</a>
          </article>
        );
      })}

      <h2>Weitere Indikatoren (derzeit nicht angebunden)</h2>
      <p className="lead">Diese Reihen gelten als aussagekräftig, werden aber noch nicht in die Ampel einbezogen. Die Links führen zu den Charts und Details.</p>
      <div className="more">
        {MORE.map((m) => (
          <article key={m.name}>
            <h3>{m.name}</h3>
            <p><span className="tag">{m.kat}</span></p>
            <p className="sub">{m.text}</p>
            {(m.links || (m.id ? [[m.id, fredUrl(m.id)]] : [])).map(([l, u]) => <a key={l} href={u} target="_blank" rel="noreferrer" className="lnk">{m.links ? l : 'Bei FRED ansehen'}</a>)}
          </article>
        ))}
      </div>

      <h2>Grenzen</h2>
      <div className="prose"><ul>{limits.map((l, k) => <li key={k}>{l}</li>)}</ul></div>
    </main>
  );
}
