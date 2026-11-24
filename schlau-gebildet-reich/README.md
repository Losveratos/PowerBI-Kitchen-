# Die Treppe und die Wolke · Schulbildung, Intelligenz und Einkommen in Deutschland

Scrollytelling-Datenstory in sieben Akten: Verdienst nach Abschluss (die Treppe), Testleistung und Verdienst
einzelner Personen (die Wolke), das Dreieck aus Intelligenz, Bildung und Einkommen mit der Herkunft als vierter
Größe, Median gegen Mittelwert, Ausreißer nach oben und Survivorship Bias. Geschwister-Stück zu
`newsletter-lupe-story.html` und `zwei-heimaten.html` (gleiche Scrolly-Mechanik, dunkle Story-Farbwelt).

Ergebnis: [`/schlau-gebildet-reich-story.html`](../schlau-gebildet-reich-story.html) ·
Markdown-Fassung: [`/md/schlau-gebildet-reich-story.md`](../md/schlau-gebildet-reich-story.md)

## Pipeline

```bash
python3 -I schlau-gebildet-reich/scripts/build_story.py   # Modell rechnen, Seite und Markdown schreiben
node scripts/build_start_feed.js && node scripts/build_seo.js
```

`build_story.py` liest `data/quellen.json`, rechnet die Modellbevölkerung (`scripts/model.py`, fester Startwert),
schreibt `data/story_data.json`, füllt `story_template.html` und setzt `charts.js` ein. Die fertige Seite und die
Markdown-Fassung sind **generiert** und werden nicht von Hand geändert.

**Regel:** Kennzahlen aus Quellen und Modell stehen im Text nicht als Ziffer, sondern als Platzhalter `{{…}}`:
`q.…` = veröffentlichter Wert aus `quellen.json`, `d.…` = Wert aus `story_data.json` (Modell oder Rechnung
aus amtlichen Fallzahlen), `calc.…` = im Skript abgeleitet. Ein Platzhalter ohne Wert bricht den Lauf ab.
Ausnahmen sind Jahreszahlen, Aktnummern und die Annahmen 0,2 / 0,3 / 0,4.

## Ordner

```
schlau-gebildet-reich/
├── story_template.html   ← Text, Aufbau, CSS (Platzhalter für Zahlen, Daten, Diagramme, Quellenliste)
├── charts.js             ← die sieben Diagramme (d3, lokal aus assets/js/vendor/)
├── data/quellen.json     ← veröffentlichte Werte und die Quellenliste mit Belegstufe
├── data/story_data.json  ← alles, was die Seite zeichnet (generiert)
└── scripts/              ← model.py (Rechenmodell), build_story.py (Lauf)
```

## Belegstufen

| Stufe | Bedeutung |
|---|---|
| A | amtliche Statistik (Statistisches Bundesamt, Bundesagentur für Arbeit, Bundesbank, Statistische Ämter) |
| B | Metaanalyse oder Studie mit deutschen Daten |
| C | Studie aus einem anderen Land, kleine oder nicht zufällige Stichprobe, Arbeitspapier, Branchenbericht |
| M | eigene Modellrechnung |

## Das Modell in Kürze

- **Verdienstverteilung:** Bruttojahresverdienst Vollzeit 2025. Stützstellen sind die veröffentlichten Perzentile
  10, 30, 50, 90, 99; dazwischen log-linear im Normalwert des Rangs; oberhalb des 99. Perzentils ein
  Pareto-Ausläufer, dessen Exponent den amtlichen Mittelwert trifft.
- **Gauß-Kopula mit drei Größen:** Testleistung, Bildungsneigung, Verdienstrang. Testleistung–Bildung 0,56
  (Strenze 2007). Testleistung–Verdienst 0,2 / 0,3 / 0,4 als Annahme, Hauptwert 0,3. Bildung–Verdienst wird so
  bestimmt, dass die Mediane der drei Abschlussgruppen zu den Medianentgelten der Bundesagentur passen.
- **Probe:** Die Entgeltklassen je Abschlussgruppe (Bundesagentur, Tabelle 3.1) gehen nicht in das Modell ein;
  die Seite stellt gemessene und modellierte Anteile nebeneinander.
- **Bewusst nicht gezeigt:** Testleistung je Abschlussgruppe. Sie wäre eine reine Folge der Schnitte im Modell.

## Aktualisieren

Neue Jahreswerte in `data/quellen.json` eintragen (Stand und Quelle anpassen), `build_story.py` laufen lassen und
die Ausgabe lesen: Modell-Mediane gegen Zielwerte, `rho`, Pareto-Exponent. Danach die Seite in Desktop- und
Handybreite durchscrollen, weil sich Beschriftungen mit den Werten verschieben.
