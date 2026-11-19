import { fredUrl } from '../engine.js';

export const text = {
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
  ICSA_REL: {
    kat: 'Arbeitsmarkt', timing: 'Frühindikator (wöchentlich)',
    was: 'Die wöchentliche Zahl neuer Anträge auf Arbeitslosenhilfe in den USA. Die Ampel betrachtet den 4-Wochen-Durchschnitt und misst, wie viel Prozent er über seinem Tiefstwert der letzten 52 Wochen liegt. So spielt das absolute Niveau, das mit der Bevölkerung wächst, keine Rolle.',
    warum: 'Entlassungen sind der früheste Moment, in dem sich eine Abkühlung am Arbeitsmarkt zeigt, lange bevor die Arbeitslosenquote steigt. Eine Studie des Gemeinsamen Wirtschaftsausschusses des US-Kongresses von 2008 hält die Erstanträge für den besten Vorlaufindikator am Arbeitsmarkt. Er ergänzt die Finanzindikatoren um den Blick auf die Realwirtschaft.',
    lesen: 'Je weiter der Schnitt über sein Jahrestief steigt, desto stärker kühlt der Arbeitsmarkt ab. Einzelne Wochen sind verrauscht (Feiertage, Streiks, Wetter), deshalb zählt der 4-Wochen-Schnitt. Die Schwellen sind Startwerte und noch nicht kalibriert. Andere Arbeitsmarktreihen wie Sahm-Regel oder Beschäftigungsquote stehen bewusst nicht im Score, weil sie stark überlappen und später reagieren.',
  },
};

export const more = [
  { id: 'ANFCI', name: 'Adjusted NFCI', kat: 'Finanzbedingungen', text: 'Der NFCI, bereinigt um die Konjunkturlage. Er zeigt rein finanzielle Anspannung. Steigt der NFCI, der ANFCI aber nicht, kommt der Stress eher aus der Wirtschaft als aus dem Finanzsystem.' },
  { name: 'NFCI-Teilindizes', kat: 'Finanzbedingungen', text: 'Zerlegen den NFCI in Risiko (Marktrisiko), Kredit und Verschuldung (Leverage). So sieht man, woher die Anspannung kommt.', links: [['NFCIRISK', fredUrl('NFCIRISK')], ['NFCICREDIT', fredUrl('NFCICREDIT')], ['NFCILEVERAGE', fredUrl('NFCILEVERAGE')]] },
  { id: 'T10Y2Y', name: 'Zinskurve 10J − 2J', kat: 'Konjunktur', text: 'Der bekannteste Zinskurven-Abstand. Der Zweijahreszins spiegelt die erwartete Geldpolitik der Fed. Gute Ergänzung zum 10J−3M-Abstand, mit ähnlicher Aussage.' },
  { id: 'BAA10Y', name: 'Baa-Unternehmensanleihen − 10J', kat: 'Kreditmarkt', text: 'Kreditspread für Unternehmen guter Bonität, verfügbar seit 1986. Eine mögliche Langzeit-Alternative zum HY-Spread, der auf FRED nur kurz zurückreicht.' },
  { id: 'DRTSCILM', name: 'Kreditvergabestandards (SLOOS)', kat: 'Konjunktur', text: 'Quartalsumfrage der Fed unter Banken: Welcher Anteil verschärft die Kreditstandards für Firmenkredite? Eine Kreditklemme ging Rezessionen oft voraus. Die Daten kommen aber nur quartalsweise und mit Verzögerung.' },
  { id: 'SAHMREALTIME', name: 'Sahm-Regel', kat: 'Arbeitsmarkt', text: 'Steigt die Arbeitslosenquote im 3-Monats-Schnitt um mindestens 0,5 Prozentpunkte über ihr Tief der letzten zwölf Monate, deutet das auf eine Rezession hin. Historisch zuverlässig, aber eher spät. Nicht im Score, weil sie stark mit den Erstanträgen überlappt.' },
  { name: 'Beschäftigungsquote', kat: 'Arbeitsmarkt', text: 'Anteil der Erwerbstätigen an der Bevölkerung. Eher nachlaufend, und das Niveau sinkt durch die Alterung strukturell. Aussagekräftiger ist die Variante für 25- bis 54-Jährige.', links: [['EMRATIO', fredUrl('EMRATIO')], ['25–54 Jahre', fredUrl('LNS12300060')]] },
  { id: 'PERMIT', name: 'Baugenehmigungen', kat: 'Konjunktur', text: 'Der Wohnungsbau ist stark zinsabhängig und dreht in der Regel früh. Ein anhaltender Rückgang gilt als klassisches Vorlaufsignal der Konjunktur.' },
  { id: 'UMCSENT', name: 'Verbrauchervertrauen (Michigan)', kat: 'Stimmung', text: 'Umfrage unter US-Haushalten. Der Konsum trägt den größten Teil der US-Wirtschaft, der Index taugt aber nur begrenzt fürs Timing.' },
  { id: 'WALCL', name: 'Bilanzsumme der Fed', kat: 'Liquidität', text: 'Wächst die Bilanz, stützt das die Marktliquidität, schrumpft sie, wird Liquidität entzogen. Wichtiger Hintergrund, aber kein klares Timing-Signal.' },
  { id: 'RECPROUSM156N', name: 'Rezessionswahrscheinlichkeit (geglättet)', kat: 'Konjunktur', text: 'Modellbasierte Wahrscheinlichkeit, dass sich die US-Wirtschaft aktuell in einer Rezession befindet. Bestätigt eher, mit einigen Monaten Verzögerung.' },
  { id: 'USREC', name: 'NBER-Rezessionsphasen', kat: 'Referenz', text: 'Offizielle Rezessionszeiträume, erst im Nachhinein festgelegt. Nützlich als Hintergrund in Charts und für spätere Backtests, nicht als Warnsignal.' },
  { name: 'Shiller-KGV (CAPE)', kat: 'Bewertung', text: 'Nicht bei FRED. Zeigt, wie teuer der Markt gemessen an den Gewinnen ist. Hohe Bewertung erhöht die Fallhöhe, sagt aber wenig über den Zeitpunkt.', links: [['multpl.com', 'https://www.multpl.com/shiller-pe']] },
];
