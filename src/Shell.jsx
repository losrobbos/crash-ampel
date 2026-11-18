import { useEffect, useState } from 'react';
import App from './App.jsx';
import Guide from './Guide.jsx';

// Minimales Hash-Routing (#/ und #/anleitung): funktioniert auf GitHub Pages ohne Server-Konfiguration
const route = () => (location.hash.startsWith('#/anleitung') ? 'guide' : 'home');

export default function Shell() {
  const [page, setPage] = useState(route);
  useEffect(() => {
    const on = () => { setPage(route()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const cur = (p) => (page === p ? 'page' : undefined);
  return (
    <>
      <nav className="nav" aria-label="Hauptnavigation">
        <a href="#/" aria-current={cur('home')}>Ampel</a>
        <a href="#/anleitung" aria-current={cur('guide')}>Anleitung</a>
      </nav>
      {page === 'guide' ? <Guide /> : <App />}
    </>
  );
}
