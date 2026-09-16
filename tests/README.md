# Prüfungen

Zwei Dinge liegen hier, die nichts miteinander zu tun haben:

| Was | Wo | Start |
| --- | --- | --- |
| **Visual-Standards-Rechner** (`visual-standards-rechner.html`) — Playwright-Regressionen | `tests/rechner/` | `node tests/run-all.js` |
| **Chart-Builder** (`business-chart-builder.html`) — Selbsttest im Browser | `tests/selftest.js` · `tests/selftest.html` | `tests/selftest.html` im Browser öffnen |

Die Kitchen-Seite (`daten_wg_learn_buckets.html`) wird nicht hier, sondern mit
`node scripts/validate_html.js` geprüft (Episoden-Schema, Buckets, ytId-Duplikate).
Das Skript nimmt optional eine Datei als Argument und **lehnt Dateien ohne
`EPISODES`-Array ab** — es prüft ausdrücklich keine anderen Seiten.

---

## Voraussetzungen

* **Node** ≥ 18 (hier 22).
* **Playwright** mit Chromium. Die Suiten finden Playwright selbst
  (`tests/rechner/lib/harness.js` probiert der Reihe nach `require('playwright')`,
  `NODE_PATH`, `npm root -g` und die üblichen globalen Pfade). `NODE_PATH` muss
  also **nicht** gesetzt sein.
  * In dieser Umgebung liegt Playwright global unter `/opt/node22/lib/node_modules`,
    die Browser unter `/opt/pw-browsers` (via `PLAYWRIGHT_BROWSERS_PATH`).
  * In einer normalen Umgebung reicht:
    ```bash
    npm i -g playwright && npx playwright install chromium
    ```
    Die Browser landen dann im Standardpfad (`~/.cache/ms-playwright` unter Linux,
    `~/Library/Caches/ms-playwright` unter macOS); `PLAYWRIGHT_BROWSERS_PATH`
    braucht man nur, wenn sie woanders liegen sollen.
    Alternativ lokal im Projekt: `npm i -D playwright` — dann findet
    `require('playwright')` sie ohne weiteres Zutun.
* **Kein Netz nötig.** Die Seite wird über `file://` geladen; SheetJS kommt aus
  `assets/js/xlsx.full.min.js` im Repo. Google Fonts und der cdnjs-Fallback
  schlagen offline fehl — das ist eingeplant und wird ignoriert.

---

## Starten

```bash
node tests/run-all.js              # alle Suiten, danach eine Tabelle
node tests/run-all.js --quiet      # nur OK/FAIL-Zeilen und die Zusammenfassung
node tests/run-all.js --list       # nur auflisten
node tests/run-all.js lizenz graph # nur Suiten, deren Name das Muster enthält

node tests/rechner/lizenzbasis.test.js   # eine Suite einzeln
```

Egal aus welchem Verzeichnis — alle Pfade leitet der Runner aus seinem eigenen
Ort ab. Exit-Code ist `0` nur, wenn jede Suite ohne Fehlschlag **und** ohne
JS-Fehler durchläuft.

Screenshots, PDF und XLSX landen unter `tests/rechner/.artifacts/<suite>/`
(gitignoriert).

---

## Was die Suiten prüfen

| Suite | Inhalt | Prüfungen | Dauer |
| --- | --- | --- | --- |
| `sicherheit-und-export` | Grundregression: Rechenlauf, **XSS über das URL-Fragment**, Begrenzung absurder Werte im Link, Preset Konzern mit Rangfolge und K.O.-Block, Alles-ausgeschlossen-Fall, Share-Link beim Ebenenwechsel, eigene Anforderung, Druck-PDF, **Excel-Export ohne Netz**, 390 px | 26 | ~25 s |
| `eingaben-und-annahmen` | Stunden-Anker, Unsicherheit im Mengengerüst, Sicherheits-Leiste, Kriterien und Red Flags, Verteilweg, Semantikmodelle, Adoptionsgrad, CapEx/OpEx-Split, Share-Link-Roundtrip inkl. alter Links, 390 px, **Determinismus** der Simulation | 58 | ~50 s |
| `gefuehrter-einstieg` | Ebene 0: alle sieben Schritte, Werte landen im Zustand, Überspringen, Link mit Einstellungen startet ohne Einstieg, **Tastaturdurchlauf nur mit Tab und Enter**, Lesehilfe, Glossar, 390 px, Druck | 71 | ~90 s |
| `inhaltsverzeichnis-und-graph` | Seitenleiste ab Ebene 2, Sprungziele, Ebenenwechsel beim Klick, klickbarer Wirkungsgraph, Knoten-Popups mit Bedienelementen, Fokus und Tastatur, 390 / 1100 / 1240 px, Druck | 67 | ~90 s |
| `lizenzbasis` | v0.18-Annahme `licViewerShare`: Feld, Wirkung auf die Lizenzkosten, **100 % reproduziert exakt die v0.17-Zahlen**, Kopplung an „IBCS verbindlich“, Site-Lizenz, Share-Link, Bedienung im Graph-Popup | 35 | ~45 s |
| `wirkungsgraph-abschnitt` | v0.19-Informationsarchitektur: Seitenfolge Überblick → Karte → Eingaben → Ergebnis → Details, Sichtbarkeit je Ebene, Erklärblock, Ansatz-Reiter, Knotenauswahl, Popup, Druck, 390 / 768 / 1100 px | 49 | ~70 s |
| `bedienbarkeit` | v0.20: Tastaturbedienung, Fokus an Sprungzielen, Kontraste, Schriftgroessen, Rollen an den Segment-Schaltern, offene Details im Ausdruck | 66 | ~75 s |
| `handrechnung` | **Unabhaengige Verankerung des Rechenkerns:** ein Mini-Szenario, das allein aus der Modellbeschreibung von Hand durchgerechnet wurde (`handrechnung.md`), Posten fuer Posten gegen `expected()`; dazu zwei benannte Abweichungen | 43 | ~10 s |

**Summe: 416 Prüfungen, zusammen rund 5,5 Minuten** (die Suiten laufen nacheinander,
jede startet ihren eigenen Chromium).

---

## Was (noch) nicht geprüft wird

Bewusst offen, damit niemand mehr Sicherheit annimmt als da ist:

* **Der Rechenkern** ist seit `handrechnung.test.js` an **einem** von Hand
  nachgerechneten Szenario verankert (1 Ersteller, 10 Viewer, 3 Jahre, zwei
  Ansätze, sieben Posten — alle auf den Cent). Das ist ein Stichpunkt, keine
  Flächendeckung: andere Mengengerüste, die Simulation, die Null-Option und die
  Report-Klassen ohne IBCS-Pflicht sind weiterhin nur gegen gemessene
  Referenzwerte gehalten. Was dabei über die Lückenhaftigkeit der
  Modellbeschreibung herauskam, steht in `rechner/handrechnung.md`.
* **Die Referenzzahlen** in `lizenzbasis.test.js` (`REF`) sind gemessene
  v0.17-Werte, keine unabhängige Quelle. Sie fangen unbeabsichtigte
  Änderungen, nicht gemeinsame Fehler.
* **Die Monte-Carlo-Seite** (Schritt 6, eigenes Fenster) ist nicht abgedeckt.
* **Die statischen Zahlen im Entscheidungsbaum** (Kipp-Punkt-Verhältnisse im
  SVG) werden von keiner Prüfung gegen den Rechenkern gehalten.
* **Der Excel-Export** wird auf „Datei entsteht und ist nicht leer“ geprüft,
  nicht auf den Inhalt der Blätter.
* **Es gibt keine CI.** Der Runner muss von Hand gestartet werden.

---

## Eine Suite schreiben oder ändern

`tests/rechner/lib/harness.js` liefert alles Gemeinsame:

```js
const { chromium, URL, artifactDir, skipWizard, reporter } = require('./lib/harness');
const DIR = artifactDir('meine-suite');     // Ablage für Screenshots
const R   = reporter('meine-suite');        // R.ok / R.watch / R.errs / R.finish

const p = R.watch(await browser.newPage());
await p.goto(URL); await skipWizard(p);     // ← nach JEDEM goto/reload nötig
R.ok('Beschreibung der Erwartung', bedingung, zusatzinfo);
await R.finish(browser);                    // Zusammenfassung + Exit-Code
```

Zwei Fallstricke:

1. **`skipWizard` nach jedem `goto` und jedem `reload`.** Sonst steht der
   geführte Einstieg (Ebene 0) vor der Seite und alle Selektoren gehen ins Leere.
   Ausnahme: `gefuehrter-einstieg.test.js` prüft genau diesen Einstieg und
   überspringt ihn absichtlich nicht.
2. **Keine absoluten `/home/...`-Pfade und kein `path:'irgendwas.png'`.**
   Beides bindet die Suite an ein Arbeitsverzeichnis. `URL` und `artifactDir()`
   benutzen, dann läuft sie von überall.

`R.finish` schreibt am Ende eine Zeile `##SUITE## {...}`; daraus baut
`tests/run-all.js` die Zusammenfassung. Wer den Reporter nicht benutzt, taucht
in der Tabelle mit `?` auf.
