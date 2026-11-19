import { useEffect, useState } from 'react';
import AmpelPage from './App.jsx';
import Guide from './Guide.jsx';
import { AMPELN, DEFAULT_AMPEL } from './ampel/index.js';

// Hash-Routing: #/ (Standard-Ampel), #/anleitung, #/<ampel>, #/<ampel>/anleitung
function route() {
  const [a, b] = location.hash.replace(/^#\/?/, '').split('/');
  if (AMPELN[a]) return { id: a, guide: b === 'anleitung' };
  return { id: DEFAULT_AMPEL, guide: a === 'anleitung' };
}
const href = (id, guide) => '#/' + (id === DEFAULT_AMPEL ? '' : id + (guide ? '/' : '')) + (guide ? 'anleitung' : '');

export default function Shell() {
  const [r, setR] = useState(route);
  useEffect(() => {
    const on = () => { setR(route()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const cfg = AMPELN[r.id], cur = (c) => (c ? 'page' : undefined);
  return (
    <>
      <nav className="nav" aria-label="Hauptnavigation">
        {Object.values(AMPELN).map((c) => <a key={c.id} href={href(c.id)} aria-current={cur(r.id === c.id && !r.guide)}>{c.navLabel}</a>)}
        <a href={href(r.id, true)} aria-current={cur(r.guide)}>Anleitung</a>
      </nav>
      {r.guide ? <Guide key={cfg.id} cfg={cfg} /> : <AmpelPage key={cfg.id} cfg={cfg} />}
    </>
  );
}
