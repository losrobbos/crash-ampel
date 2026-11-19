# Crash-Ampel

Frühwarn-Ampel aus NFCI, St.-Louis-Stressindex, Zinskurve, Erstanträgen Arbeitslosenhilfe, HY-Spread und VIX. Backtest gegen S&P 500 und NASDAQ 100.

    npm install
    npm run fetch   # lädt FRED- und Yahoo-Daten nach public/data-aktien.json
    npm run dev

Veröffentlichung: Repo auf GitHub pushen, unter Settings > Pages die Quelle "GitHub Actions" wählen. Der Workflow holt täglich frische Daten und deployt.
Schwellen und Gewichte stehen in `src/ampel/aktien.js`.

---

# Schritt-für-Schritt-Anleitung

## Voraussetzungen

- **Node.js 20 oder neuer** (prüfen mit `node -v`)
- **Git** (prüfen mit `git --version`)
- Ein **GitHub-Account** (nur für die Veröffentlichung nötig)
- Internetzugang (für FRED und Yahoo Finance)

## Teil A: Lokal starten

1. **ZIP entpacken** und im Terminal in den Ordner `crash-ampel` wechseln:

       cd crash-ampel

   Im Ordner sollten `package.json`, `index.html`, `src/`, `scripts/` und `.github/` liegen.

2. **Abhängigkeiten installieren:**

       npm install

3. **Daten laden:**

       npm run fetch

   Erwartete Ausgabe (Reihenfolge und Zahlen können abweichen):

       FRED NFCI 2700
       FRED T10Y3M 2200
       ...
       Yahoo SPX 3300
       Yahoo NDX 2000

   Danach existiert die Datei `public/data-aktien.json`. Das Skript schreibt sie nur, wenn **alle** Abrufe geklappt haben.

4. **App starten:**

       npm run dev

   Die Adresse steht im Terminal (meist http://localhost:5173). Dort siehst du die Gesamt-Ampel, die Indikator-Karten und den Backtest.

5. **Daten aktualisieren:** `npm run fetch` erneut ausführen und die Seite neu laden. Der NFCI erscheint nur wöchentlich, es ändert sich also nicht täglich etwas.

## Teil B: Auf GitHub Pages veröffentlichen

Der Workflow `.github/workflows/update.yml` holt die Daten selbst, baut die App und veröffentlicht sie. `public/data-aktien.json` wird deshalb **nicht** eingecheckt (steht in `.gitignore`).

1. **Neues Repository** auf github.com anlegen (leer, ohne README).
2. **Projekt hochladen** (Platzhalter ersetzen):

       git init
       git add .
       git commit -m "Crash-Ampel MVP"
       git branch -M main
       git remote add origin https://github.com/DEIN-NAME/DEIN-REPO.git
       git push -u origin main

3. **Pages aktivieren:** Im Repo auf *Settings → Pages*, bei *Source* **GitHub Actions** wählen.
4. **Workflow starten:** Im Repo auf den Reiter *Actions*, links *Daten aktualisieren und veröffentlichen* wählen, rechts *Run workflow*. (Beim ersten Push läuft er meist schon von selbst.)
5. **Ergebnis prüfen:** Wenn der Lauf grün ist, steht die Adresse im Schritt *deploy*, normalerweise `https://DEIN-NAME.github.io/DEIN-REPO/`.
6. Ab jetzt aktualisiert sich die Seite **werktäglich** automatisch (Cron in der Workflow-Datei).

Hinweis: Bei privaten Repos braucht GitHub Pages einen bezahlten Plan (z. B. GitHub Pro). Die veröffentlichte Seite ist dann trotzdem öffentlich erreichbar.

## Teil C: Anpassen

Alles Wichtige steht in `src/ampel/aktien.js`:

- `t: [gelb, rot]` sind die Schwellen je Indikator
- `dir` gibt die Richtung an (1 = höher ist schlechter, -1 = niedriger ist schlechter)
- `w` ist das Gewicht (Summe muss nicht 1 sein, es wird normiert)
- Gesamtfarbe: Score unter 0,5 grün, bis 1,2 gelb, darüber rot (in der Funktion `evaluate`)
- Backtest-Fenster: Parameter `H` (Standard 26 Wochen) in `backtest`

Nach Änderungen im Dev-Modus (`npm run dev`) aktualisiert sich die Seite sofort.

## Fehlersuche

| Problem | Ursache / Lösung |
|---|---|
| Seite zeigt „Noch keine Daten" | `npm run fetch` ist noch nicht gelaufen oder fehlgeschlagen. Erneut ausführen. |
| Seite zeigt „Daten veraltet oder unvollständig" | Zu wenige Reihen geladen oder die Daten sind alt. `npm run fetch` wiederholen. |
| `fetch` bricht mit `403`/`429` bei Yahoo ab | Yahoo blockt zu viele Anfragen oder die Schnittstelle hat sich geändert. Einige Minuten warten und erneut versuchen, ggf. VPN ausschalten. |
| `fetch` bricht bei FRED ab | Kurzzeitiger Ausfall oder Netzwerk-/Firmenproxy. Später erneut versuchen, die URL `https://fred.stlouisfed.org/graph/fredgraph.csv?id=NFCI` testweise im Browser öffnen. |
| `npm install` meldet Versionsfehler | Node.js ist zu alt. Auf Version 20 oder neuer aktualisieren. |
| Workflow-Lauf ist rot | Im Reiter *Actions* den roten Schritt öffnen. Meist ist es der Daten-Abruf (dann Workflow erneut starten) oder Pages ist noch nicht auf „GitHub Actions" gestellt. |
| Veröffentlichte Seite bleibt weiß | In den Browser-Entwicklertools (F12) die Konsole prüfen. Die App nutzt relative Pfade (`base: './'`), das sollte auch unter `/DEIN-REPO/` funktionieren. |
| Backtest zeigt für eine Farbe „keine Daten" | Kein Zeitraum erreichte diese Farbe mit den aktuellen Schwellen. Schwellen in `src/ampel/aktien.js` anpassen. |

## Hinweis zu den Daten

- FRED liefert den High-Yield-Spread nur noch für wenige Jahre. In älteren Backtest-Phasen fehlt er und wird herausgerechnet.
- Die Kursdaten stammen von einer inoffiziellen Yahoo-Schnittstelle und enthalten keine Dividenden.
- Der NFCI wird nachträglich revidiert. Der Backtest ist dadurch im Rückblick etwas zu optimistisch.
