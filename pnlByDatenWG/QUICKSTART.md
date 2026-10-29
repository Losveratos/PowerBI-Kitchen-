# P&L Statement byDatenWG · Schnellstart

Zwei Wege in das Visual: **Weg 1** bindet nur die Ebenen einer vorhandenen
Hierarchie plus die Kennzahlen (zwei Minuten). **Weg 2** ergänzt die Felder,
die daraus eine echte GuV machen — Zeilentypen, Formelzeilen, Vorzeichen,
Kommentare.

Version **1.5.3.0** · GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358`
Web-Fassung dieser Anleitung: [`pnl-schnellstart.html`](../pnl-schnellstart.html)
(DE) · [`pnl-schnellstart_en.html`](../pnl-schnellstart_en.html) (EN).

> **1.0 – 1.2:** Feldrollen, Property-Namen und der gespeicherte Toolbar-Zustand sind
> stabil. Nicht im AppSource, also nicht von Microsoft zertifiziert.
> Oberfläche in Deutsch, Englisch, Spanisch und Japanisch (folgt der
> Berichtssprache). Feedback: <https://github.com/losveratos/powerbi-kitchen-/issues>

## 0 · Installieren

Die jeweils neueste Datei liegt in [`dist/`](dist/):
`pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358.<version>.pbiviz` (selbst bauen:
`npm run package`). In Power BI Desktop: **Visualisierungen → ⋯ → Visual aus
einer Datei importieren**. Das Visual großzügig aufziehen (mind. ~1200×800 px —
Toolbar und zwei Spaltenblöcke brauchen Breite).

**Start-Hub (1.3):** Frisch auf die Seite gezogen, zeigt das Visual im
Bearbeitungsmodus vier große Knöpfe: **Was kann das Visual?** (acht Karten mit
echten Mini-Renderings), **Templates** (Galerie mit Vorschau — ein Klick wendet
das Template an; ohne Felder wird die Wahl gespeichert und greift beim Binden),
**Demo ansehen** und **Felder erklären**. Esc geht zurück, die Ziffern 1–4 öffnen
die Knöpfe. Mit gebundenen Daten öffnet **☰ Start** in der Toolbar denselben Hub
als Overlay; Schließen lässt die Ansicht, wie sie war. Leser und Exporte sehen
ihn nie. **Neu in 1.4:** **🚀 Loslegen** führt in drei Schritten mit Live-Häkchen
durch Felder binden → Template wählen → Feinschliff; die Galerie ist nach Zweck
gruppiert (Struktur-Vergleich · Forecast · GuV-Statement · Report-Ansichten);
„Felder erklären" zeigt alle 20 Rollen plus IBCS-Notation und Struktur vs. Zeit;
unten auf jeder Hub-Seite schalten **HD · Full HD · UHD** die Schriftgröße
(gespeichert) und **📖 Doku öffnen** die Online-Doku. „☰ Start" ist der erste
Knopf der Toolbar. Wer den Hub nicht will, wählt unter Leer-Zustand → Modus Demo,
Feld-Intro oder eigene Nachricht.

**Smart Start (Demo):** Die Demo-GuV mit dem Hinweis „Demo" — darauf lassen sich Ansichten, Toolbar und
Formatmenü schon ausprobieren (auch die Mega-Table-Templates). Sobald AC und
eine Hierarchie gebunden sind, verschwindet die Demo; fehlt noch etwas, nennt
der Hinweis die Rolle. Leser und Exporte sehen nie Demo-Zahlen.
Statt der Demo kann das Visual ein **Feld-Intro** zeigen, also welches Feld
wohin gehört, minimal und im Ausbau. Umschalten per Knopf **„Felder erklären"**
im Demo-Hinweis oder unter Leer-Zustand → Modus (1.2). Die Feldliste steht seit
1.2 in der gewohnten Reihenfolge: Ebenen, Konto, AC · PY · PL · FC, Periode,
dann die Spezialrollen.

**Dark Mode:** Stil → Erscheinungsbild. *Auto* folgt einem dunklen
Berichtsthema, *Dunkel* erzwingt es (z. B. für von Hand dunkel gefärbte Seiten).

## 1 · Weg 1 — normale Hierarchie in 2 Minuten

Für jede Dimensions-Hierarchie, die es schon gibt (z. B. `Kategorie` →
`Produktlinie`). Kein Zeilentyp, keine Formeln.

| Field Well | Feld |
|---|---|
| Ebenen-Spalten (L1..Ln) | die Ebenen **in Ziehreihenfolge**, max. 8 |
| Konto-ID (Key) | eindeutiger Schlüssel der Zeile (trägt den Drillthrough) |
| Sortierung | Ganzzahl-Spalte für die Reihenfolge |
| Periode (Monat) | Monatsspalte der Faktentabelle |
| AC (Ist) | Pflicht-Measure |
| PY · PL · FC | optional — jedes gebundene Szenario schaltet Δ-Spalten frei |

**Alle Grouping-Felder auf „Nicht zusammenfassen"** stellen.

Was dabei herauskommt: Tabelle mit automatischen Zwischensummen je Ebene,
Struktur-Bars, Zeilen-Waterfall — und ein Werttreiberbaum, der ohne Formelzeile
direkt aus der Hierarchie wächst (bei mehreren Wurzeln trägt eine virtuelle
**Gesamt-Wurzel** sie als Kinder). Klick auf ein Karten-Diagramm öffnet den
**Kachel-Zoom**, der Knopf **„↗ Drill"** setzt Selektion und öffnet das
Kontextmenü in einem Griff.

## 2 · Weg 2 — die volle GuV

Alles aus Weg 1, plus die Struktur-Spalten der Kontendimension:

| Field Well | Feld / Inhalt |
|---|---|
| Zeilentyp | `Account` · `Subtotal` · `Formula` · `KPI` · `Separator` |
| Formeldefinition | z. B. `[Gross profit]+[Operating expenses]`, `[EBITDA]/[Net revenue]` — Referenz **per Zeilenname**, Formel auf Formel erlaubt |
| Rechenvorzeichen (±1) | `1` Erlöse, `-1` Kosten |
| Anzeige invertieren | `true` bei Kostenzeilen (rechnen negativ, werden positiv angezeigt) |
| Abweichungsfarbe drehen | `false` bei allen Zeilen mit `-1` (auch Steuern): die Engine bewertet über das Vorzeichen schon richtig. `true` nur für positiv geführte Kosten (`+1`) und Kosten-Quoten, bei denen mehr schlecht ist |
| Kommentar | Freitext je Konto → nummerierter Marker + Fußnote |
| FC Gesamtjahr · PL Gesamtjahr | Jahres-Skalare für den FY-Ausblicksblock |

Beispiel-Kontendimension (Ausschnitt aus `demoData/pharma/pharma-dim-konten.csv`,
Semikolon-getrennt):

```
AccountID;L1;L2;SortOrder;RowType;FormulaDef;SignConvention;DisplayInvert
401010;Net revenue;Pharmaceuticals (Rx);11;Account;;1;false
402000;Net revenue;Consumer Health;12;Account;;1;false
550010;Cost of goods sold;Materials;21;Account;;-1;true
F_GROSSPROFIT;Gross profit;;25;Formula;[Net revenue]+[Cost of goods sold];1;false
K_GROSSMARGIN;Gross margin;;26;KPI;[Gross profit]/[Net revenue];1;false
```

`Net revenue` und `Cost of goods sold` sind **keine** eigenen Zeilen — die
Zwischensummen entstehen synthetisch aus den L1-Pfaden, und die Formelzeilen
referenzieren sie über ihren Namen.

Demo-Daten: [`demoData/pharma/`](demoData/pharma/) (27 Dim-Zeilen, Monatsfakten,
YTD 2026-01…2026-06 in mEUR) — Setup und Abnahmewerte in
[`demoData/pharma/README.md`](demoData/pharma/README.md).
Measures: `AC = SUM(...[AC])`, analog PY/PL;
`FC FY = MAX(...[FC_FY])`, `PL FY = MAX(...[PL_FY])` — **FY-Skalare nie
summieren**. Gegenrechnen: EBITDA YTD AC = 571,2 · PY 499,6 · PL 532,0 mEUR.

## 3 · Ragged-Hierarchien

- **Leere tiefere Level** → die letzte gefüllte Ebene ist das Blatt.
- **Wiederholtes Level** (`L2` = `L1`) → die Hierarchie endet dort.
- Zeilen mit gleichem Pfad werden aggregiert; Aggregat-Zeilen (z. B. PY nur auf
  L1) wirken als Szenario-Fallback.
- Alternativ **Parent-Child** über *Konto-ID* + *Parent-Konto-ID*: beliebig tief,
  Waisen landen sichtbar in „Nicht zugeordnet". Sind beide Modi gebunden,
  gewinnt Parent-Child.

## 4 · Perioden-Formate

Gelesen werden `JJJJ-MM`, `JJJJ-MM-TT`, ISO-Zeitstempel, `JJJJ/MM`, echte
Datumsspalten, deutsche und englische Monatsnamen (lang/kurz, mit/ohne Punkt,
optional mit Jahr) sowie Zahlen 1–12. Nicht Lesbares wird gemeldet, nicht
geraten.

Fiskaljahr oder eigene Sortierspalte → Format-Pane **Spalten →
Perioden-Sortierung** auf **„Datenreihenfolge (Fiskaljahr)"**. `Automatisch`
sortiert kalendarisch, sobald alle Labels lesbar sind; `Kalenderjahr` erzwingt
Jan..Dez.

## 5 · Die fünf Ansichten (Toolbar) und die Mega-Table

| Ansicht | Was sie zeigt |
|---|---|
| Tabelle | das Statement mit Perioden-Blöcken MTD · YTD · FY-Ausblick, Δ-Balken und Δ%-Pins; eine identische Δ-Skala je Spalte |
| Struktur-Bars | dieselben Zeilen mit Größenbalken — die Struktur des Ergebnisses |
| Zeilen-Waterfall | die GuV als Kaskade; Ergebnisanker auf der Nulllinie, Kostenblöcke floaten (Wurzelebene der Hierarchie) |
| Werttreiberbaum | aus dem Formel-Graphen (DuPont) oder aus der reinen Hierarchie; Tidy-Layout, Operator-Kreise, ⌖-Re-Root, Breadcrumb |
| Sankey (1.6) | derselbe Graph als Fluss von links nach rechts: Umsatz-Komponenten grau, Gewinn-Strang in der günstigen Farbe, Kosten in der ungünstigen nach rechts unten; Höhe ∝ AC (YTD), Labels mit Wert und % vom Umsatz — bewusst außerhalb der IBCS-Notation |

Welche Ansichten angeboten werden, steuert der Autor unter **Darstellung &
Toolbar → „Ansicht: … anbieten"** (1.6, alle Standard an); bleibt nur eine
übrig, verschwindet die Ansichts-Gruppe. Die Mega-Table ist keine eigene
Ansicht, sondern ein Template der Tabelle.

**Kachel-Zoom:** Klick auf ein Karten-Diagramm (im Sankey: auf einen Knoten) zoomt den Knoten auf die ganze
Fläche — Kombi-Chart mit Monaten und Brücke, Szenario-Grid, „Zahlt ein auf" und
„Getrieben von". Alle Toolbar-Zustände sind persistiert und lesezeichenfähig.

**Mega-Table:** im Bearbeitungsmodus das Dropdown **Template** links in der
Toolbar (1.2), oder Formatmenü → **Spalten & Mega-Table → Mega-Table
(IBCS-Templates, erste Gruppe) → Template** wählen (T01A … T04E, 12A, 12G, 12H). Das Template setzt die Schalter darunter,
danach ist jeder Schalter frei: Wertspalten PY · PL · AC/FC, Δ als Zahl, Balken,
integrierter Wasserfall, Δ% als Zahl oder Pins, zweiter Block Monat | _YTD
(braucht die Periode), Schwellen mit Fußzeile. Das Formatmenü zeigt nur, was zur
Ansicht und zu den gebundenen Feldern passt (z. B. ΔPY-Schalter nur mit PY,
Schwellen-Felder nur bei eingeschalteten Schwellen). „Aus (klassische Tabelle)"
führt zurück.

**Die 12er-Serie (1.1):** **12G** braucht das Feld „FC Gesamtjahr" (und die
Periode): der AC&FC-Balken zeigt Ist bis heute voll und den Rest des Jahres
schraffiert, die Δ-Spalten vergleichen das Jahr mit dem Vorjahr. **12H** ist die
Planrechnung (analysiertes Szenario = PL, braucht PL): Plan umrandet, Δ-Balken
rot/grün umrandet. Beide schalten den **Headline-Slot** an (Titelblock →
„Headline-Slot"): die Botschaft groß neben dem Titel — eigene Botschaft oder,
wenn leer, die generierte.

**Mehrere Visuals vergleichbar machen:** Zahlen → **Skalen-Mindestmaximum**
(Werte bzw. Δ), z. B. `2m` und `500k` in allen Visuals einer Seite — gleiche
Beträge sind dann gleich lang. Im Bearbeitungsmodus steht „Skala fixiert" unter
der Tabelle.

**Szenarien frei kombinieren (1.2):** Darstellung & Toolbar → **Gruppe:
Wertspalten** an. Dann schalten Leser AC · PY · PL · FC und das Δ gegen die
Δ-Referenz einzeln, zum Beispiel AC + PL + FC. Die Spalten-Presets bleiben als
Schnellwahl. Für Autoren gibt es dasselbe als Preset **„Eigene Auswahl"** mit
fünf Schaltern im Formatbereich.

**Je Segment oder Quartal (1.2):** ein Feld in **Spalten-Kategorie**. Die
klassische Tabelle wiederholt dann ihren Spaltensatz je Wert, den Gesamt-Block
zeigt sie danach.

**Balken-Ansicht wie ChartKitchen (1.2):** Spalten & Mega-Table → „Szenario-Balken
überlappt" und „Dreieck-Marker": AC vorn, Referenz versetzt dahinter, weitere
Szenarien als kleine Dreiecke.

**Farben ohne Rot/Grün:** Stil → **Abweichungsfarben-Preset → Blau / Orange**
(ColorBrewer, auch im Schwarzweiß-Druck lesbar).

## 6 · Drillthrough einrichten (3 Schritte)

1. Zielseite anlegen (z. B. `Konto-Detail`) und unter **Visualisierungen →
   Seite auf Detailsuche filtern** genau die Spalte einziehen, die im Visual als
   **Konto-ID (Key)** gebunden ist — ohne gebundene Konto-ID die erste
   **Ebenen-Spalte** (`L1`).
2. Auf der Quellseite **Einfügen → Schaltflächen → Leer**, dann **Aktion → Ein**,
   **Typ = Detailsuche**, **Ziel = Konto-Detail**.
3. Im Visual eine Wertspalte anklicken → Schaltfläche wird aktiv. Alternativ
   Rechtsklick (natives Kontextmenü) oder im Kachel-Zoom „↗ Drill".

Abschaltbar über **Stil → „Selektion & Kontextmenü aktiv"**. Ausführliche
Abnahme-Checks: [`TESTPLAN.md`](TESTPLAN.md) §6a.

## 7 · Typische Fehlerbilder

| Symptom | Ursache |
|---|---|
| Alle Werte leer | Grouping-Felder auf „Zusammenfassen" statt „Nicht zusammenfassen" |
| FY-Spalten vielfach zu groß | FY-Measure als `SUM` statt `MAX`/`AVERAGE` |
| Monate in falscher Reihenfolge | Perioden-Label nicht lesbar → Perioden-Sortierung auf „Datenreihenfolge" |
| Zeile zeigt `·` | Referenzname der Formel nicht eindeutig oder Szenario ohne Daten |
| Zeile zeigt `⚠ Zyklus` (en: `⚠ cycle`) | Zirkelbezug in der Formeldefinition oder in Parent-Child |
| „Nicht zugeordnet" rot mit ⚠ | Parent-/Level-Pfad zeigt ins Leere — gewolltes Datenqualitäts-Signal |

Vollständiger Aufbau- und Testplan inklusive Reconciliation-Werten:
[`TESTPLAN.md`](TESTPLAN.md). Feature-Historie: [`CHANGELOG.md`](CHANGELOG.md).

---

Notation nach den IBCS®-Standards 2.0 (ISO 24896) der IBCS Association (CC BY-SA 4.0,
ibcs.com). Dokumentierte Abweichung: Teal ersetzt das IBCS-Varianz-Grün, um bei
Rot-Grün-Sehschwäche lesbar zu bleiben. IBCS® ist eine eingetragene Marke des
IBCS Institute. Dieses Visual ist nicht von der IBCS Association
zertifiziert und steht in keiner Verbindung zu ihr.
