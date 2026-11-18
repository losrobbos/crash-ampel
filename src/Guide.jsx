import { COLORS, LABEL, INDICATORS, fredUrl } from './indicators.js';

const f = (x) => String(x).replace('.', ',');
// Schwellenbereiche je Farbe direkt aus der Konfiguration, damit Anleitung und Ampel nie auseinanderlaufen
const bands = ({ dir, t: [a, b] }) =>
  dir > 0 ? [`unter ${f(a)}`, `${f(a)} bis ${f(b)}`, `ab ${f(b)}`] : [`über ${f(a)}`, `${f(b)} bis ${f(a)}`, `unter ${f(b)}`];

const TEXT = {
  NFCI: {
    kat: 'Finanzbedingungen', timing: 'Eher bestätigend, die Richtung warnt früher',
    was: 'Der National Financial Conditions Index der Chicagoer Fed bündelt über 100 wöchentliche Messgrößen aus Geld-, Anleihe- und Aktienmärkten sowie dem Bankensystem zu einer Zahl. 0 entspricht den durchschnittlichen Bedingungen seit 1971, positive Werte stehen für überdurchschnittlich angespannte, negative für lockere Bedingungen.',
    warum: 'Aktienkurse hängen stark davon ab, wie leicht und günstig sich Unternehmen und Anleger finanzieren können. Verengen sich die Bedingungen, trifft das Gewinne, Bewertungen und Risikobereitschaft gleichermaßen. Der NFCI ist deshalb das Fundament dieser Ampel.',
    lesen: 'Ist der Wert über 0, ist der Stress meist schon da, der Index bestätigt dann eher, als dass er warnt. Früher aussagekräftig ist die Richtung: Ein schneller Anstieg aus tief negativen Werten färbt die Ampel deshalb schon vor der Nulllinie gelb. Die Werte werden nachträglich revidiert.',
  },
  STLFSI4: {
    kat: 'Finanzstress', timing: 'Eher bestätigend',
    was: 'Der Financial Stress Index der St. Louis Fed fasst 18 wöchentliche Reihen zusammen, darunter Zinsen, Zinsspreads und Volatilität. 0 ist der Normalzustand, positive Werte bedeuten überdurchschnittlichen Stress.',
    warum: 'Er misst Ähnliches wie der NFCI, ist aber anders aufgebaut. Zeigen beide Stress, ist das Signal belastbarer. Weichen sie voneinander ab, lohnt ein genauerer Blick auf die Ursache.',
    lesen: 'Der Wert 0 trennt „normal" von „erhöht", deutlich darüber spricht man von klarem Stress. Wie der NFCI läuft er den Märkten eher hinterher, als dass er sie anführt.',
  },
  T10Y3M: {
    kat: 'Konjunktur', timing: 'Frühindikator',
    was: 'Der Renditeabstand zwischen zehnjährigen und dreimonatigen US-Staatsanleihen. Normalerweise ist er positiv, weil längere Laufzeiten mehr Zins bringen. Ein negativer Wert heißt „invertierte Zinskurve".',
    warum: 'Die Inversion zeigt, dass kurzfristige Zinsen hoch gehalten werden, oft um die Wirtschaft zu bremsen, während der Markt später sinkende Zinsen erwartet. Historisch ging sie den meisten US-Rezessionen mit mehreren Monaten bis etwa eineinhalb Jahren Vorlauf voraus. Auch die New Yorker Fed nutzt genau diesen Abstand für ihre Rezessionswahrscheinlichkeit.',
    lesen: 'Rot bei Inversion, Gelb im flachen Bereich davor. Das Timing ist unscharf: Aktien liefen nach der Inversion oft noch lange weiter, und kurz vor einer Rezession wird die Kurve meist wieder steiler. Er ist der wichtigste echte Frühindikator der Ampel, aber kein Auslöser.',
  },
  BAMLH0A0HYM2: {
    kat: 'Kreditmarkt', timing: 'Früh bis bestätigend',
    was: 'Der Risikoaufschlag (Option-Adjusted Spread), den US-Unternehmen mit schwächerer Bonität gegenüber Staatsanleihen zahlen, in Prozentpunkten.',
    warum: 'Anleihegläubiger bewerten Ausfallrisiken oft nüchterner und früher als Aktienanleger. Weiten sich die Spreads aus, wird Kapital für Unternehmen teurer, und Aktien fallen häufig parallel oder kurz danach. Kredit- und Aktienmarkt sind eng gekoppelt.',
    lesen: 'Je höher, desto größer die Sorge um Ausfälle. Auf FRED ist die Reihe lizenzbedingt nur für wenige Jahre abrufbar, im Backtest fehlt sie deshalb für ältere Zeiträume.',
  },
  VIXCLS: {
    kat: 'Marktstimmung', timing: 'Bestätigend',
    was: 'Der CBOE-Volatilitätsindex misst die Schwankung, die der Optionsmarkt für den S&P 500 in den nächsten 30 Tagen erwartet, das „Angstbarometer".',
    warum: 'Er zeigt direkt, wie nervös der Markt ist, und reagiert sofort. Damit bestätigt er akute Stressphasen schnell.',
    lesen: 'Er ist ein Bestätigungs-, kein Frühwarnsignal: Vor Crashs steht er oft noch niedrig. Deshalb hat er nur ein kleines Gewicht.',
  },
};

const MORE = [
  { id: 'ANFCI', name: 'Adjusted NFCI', kat: 'Finanzbedingungen', text: 'Der NFCI, bereinigt um die Konjunkturlage. Er zeigt rein finanzielle Anspannung. Steigt der NFCI, der ANFCI aber nicht, kommt der Stress eher aus der Wirtschaft als aus dem Finanzsystem.' },
  { name: 'NFCI-Teilindizes', kat: 'Finanzbedingungen', text: 'Zerlegen den NFCI in Risiko (Marktrisiko), Kredit und Verschuldung (Leverage). So sieht man, woher die Anspannung kommt.', links: [['NFCIRISK', fredUrl('NFCIRISK')], ['NFCICREDIT', fredUrl('NFCICREDIT')], ['NFCILEVERAGE', fredUrl('NFCILEVERAGE')]] },
  { id: 'T10Y2Y', name: 'Zinskurve 10J − 2J', kat: 'Konjunktur', text: 'Der bekannteste Zinskurven-Abstand. Der Zweijahreszins spiegelt die erwartete Geldpolitik der Fed. Gute Ergänzung zum 10J−3M-Abstand, mit ähnlicher Aussage.' },
  { id: 'BAA10Y', name: 'Baa-Unternehmensanleihen − 10J', kat: 'Kreditmarkt', text: 'Kreditspread für Unternehmen guter Bonität, verfügbar seit 1986. Eine mögliche Langzeit-Alternative zum HY-Spread, der auf FRED nur kurz zurückreicht.' },
  { id: 'DRTSCILM', name: 'Kreditvergabestandards (SLOOS)', kat: 'Konjunktur', text: 'Quartalsumfrage der Fed unter Banken: Welcher Anteil verschärft die Kreditstandards für Firmenkredite? Eine Kreditklemme ging Rezessionen oft voraus. Die Daten kommen aber nur quartalsweise und mit Verzögerung.' },
  { id: 'SAHMREALTIME', name: 'Sahm-Regel', kat: 'Arbeitsmarkt', text: 'Steigt die Arbeitslosenquote im 3-Monats-Schnitt um mindestens 0,5 Prozentpunkte über ihr Tief der letzten zwölf Monate, deutet das auf eine Rezession hin. Historisch zuverlässig, aber eher spät.' },
  { id: 'ICSA', name: 'Erstanträge Arbeitslosenhilfe', kat: 'Arbeitsmarkt', text: 'Wöchentliche Zahl neuer Anträge. Schnelles Frühsignal für Entlassungswellen. Zur Glättung am besten den 4-Wochen-Durchschnitt betrachten.' },
  { id: 'PERMIT', name: 'Baugenehmigungen', kat: 'Konjunktur', text: 'Der Wohnungsbau ist stark zinsabhängig und dreht in der Regel früh. Ein anhaltender Rückgang gilt als klassisches Vorlaufsignal der Konjunktur.' },
  { id: 'UMCSENT', name: 'Verbrauchervertrauen (Michigan)', kat: 'Stimmung', text: 'Umfrage unter US-Haushalten. Der Konsum trägt den größten Teil der US-Wirtschaft, der Index taugt aber nur begrenzt fürs Timing.' },
  { id: 'WALCL', name: 'Bilanzsumme der Fed', kat: 'Liquidität', text: 'Wächst die Bilanz, stützt das die Marktliquidität, schrumpft sie, wird Liquidität entzogen. Wichtiger Hintergrund, aber kein klares Timing-Signal.' },
  { id: 'RECPROUSM156N', name: 'Rezessionswahrscheinlichkeit (geglättet)', kat: 'Konjunktur', text: 'Modellbasierte Wahrscheinlichkeit, dass sich die US-Wirtschaft aktuell in einer Rezession befindet. Bestätigt eher, mit einigen Monaten Verzögerung.' },
  { id: 'USREC', name: 'NBER-Rezessionsphasen', kat: 'Referenz', text: 'Offizielle Rezessionszeiträume, erst im Nachhinein festgelegt. Nützlich als Hintergrund in Charts und für spätere Backtests, nicht als Warnsignal.' },
  { name: 'Shiller-KGV (CAPE)', kat: 'Bewertung', text: 'Nicht bei FRED. Zeigt, wie teuer der Markt gemessen an den Gewinnen ist. Hohe Bewertung erhöht die Fallhöhe, sagt aber wenig über den Zeitpunkt.', links: [['multpl.com', 'https://www.multpl.com/shiller-pe']] },
];

export default function Guide() {
  return (
    <main className="guide">
      <h1>Anleitung</h1>
      <p className="lead">So liest du die Ampel: was die fünf Indikatoren messen, warum sie für den Aktienmarkt zählen und wie die Gesamtfarbe entsteht. Die Ampel ist ein Orientierungswerkzeug und keine Prognose.</p>

      <h2>So entsteht die Gesamt-Ampel</h2>
      <div className="prose">
        <p>Jeder Indikator bekommt eine Farbe, die als Punkte zählt (Grün 0, Gelb 1, Rot 2). Daraus wird ein gewichteter Durchschnitt, der Score, gebildet. Fehlt eine Reihe, wird sie herausgerechnet und die übrigen Gewichte werden neu verteilt.</p>
        <ul>
          <li><b>Grün</b> bei einem Score unter 0,5, <b>Gelb</b> bis 1,2, darüber <b>Rot</b>.</li>
          <li><b>Sicherheitsregel:</b> Sind NFCI und High-Yield-Spread gleichzeitig rot, ist die Gesamt-Ampel mindestens Gelb, auch wenn die übrigen Indikatoren ruhig sind.</li>
          <li><b>Trend-Pfeil:</b> Auf den Karten zeigt er die Entwicklung der letzten vier Wochen. Eine Verschlechterung ist oft wichtiger als der absolute Wert.</li>
        </ul>
      </div>

      <h2>Die fünf Indikatoren</h2>
      {INDICATORS.map((i) => {
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
              <dt>Warum ist er für Aktien wichtig?</dt><dd>{t.warum}</dd>
              <dt>So liest du ihn</dt><dd>{t.lesen}</dd>
            </dl>
            <a href={fredUrl(i.id)} target="_blank" rel="noreferrer">Datenreihe bei FRED</a>
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
      <div className="prose">
        <ul>
          <li>Die Ampel zeigt erhöhte Risikolagen, sie sagt keinen Crash voraus. Auch Rot-Phasen enden oft ohne größeren Rückgang.</li>
          <li>Viele Indikatoren sind eher bestätigend als vorlaufend. Nur die Zinskurve ist ein echter Frühindikator.</li>
          <li>FRED-Werte wie der NFCI werden revidiert. Rückblickende Auswertungen sehen dadurch besser aus, als die Ampel in Echtzeit war.</li>
          <li>Schwellen und Gewichte sind Startwerte und stehen in <code>src/indicators.js</code>. Diese Seite liest sie von dort, sie bleibt also automatisch aktuell.</li>
        </ul>
      </div>
    </main>
  );
}
