# Runde 2 · Linse Vollständigkeit: Anforderungen (`REQS`) und Red Flags (`FLAGS`)

**Prüfgegenstand:** `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html` v0.10 (11.09.2026), Zeilen 491–509 (`REQS`, 18 Zeilen) und 514–526 (`FLAGS`, 10 Schalter).
**Auftrag:** Was fehlt für Controlling/Finance im DACH-Raum, welche Erfüllungsgrade sind falsch.
**Nicht wiederholt:** Audit v0.7 (`README.md`), Prämissen-Kritik (`grundannahmen-kritik.md`), Einzelberichte 01–06.

---

## Kurzfazit

Die 18 Anforderungen decken die **Beschaffungs- und Governance-Sicht** gut ab (Zertifizierung, Lizenz, Exit, SLA, Report Server, Datenresidenz) und die **Bau-Sicht** ordentlich (IBCS, Wartbarkeit, Versionierung, Bus-Faktor). Was systematisch fehlt, ist die **Konsum-Sicht des Empfängers**: Wie kommt die Zahl aus dem Visual heraus (Excel, PowerPoint, Druck), wer kann sie überhaupt lesen (Barrierefreiheit, Mobile), und wie wird ein „Standard" technisch durchgesetzt (Theme-Datei). Genau das sind die Punkte, an denen im Controlling ein Standard nach der Einführung scheitert — nicht an der Notation.

Bei den Red Flags fehlt die gesamte **deutsche Beschaffungs- und Mitbestimmungsrealität**: EU-Anbieter-Vorgabe, Betriebsrat bei Telemetrie/Lizenzprüfung, Revisionspflicht, Budgetjahr. Die zehn vorhandenen Schalter sind alle Microsoft-Plattform-Schalter.

Bei den Erfüllungsgraden ist **ein Wert nachweislich falsch** (`bigdata`) und **einer implizit zu freundlich gegenüber Core** (Barrierefreiheit wird durch SVG-Measures kaputt gemacht, das ist bisher nirgends sichtbar).

**Nebenwirkung, die mitbedacht werden muss:** Der Score ist `Σ w·(cap−1) / Σ w·4` über alle Anforderungen. Acht neue Zeilen, bei denen Core meist stark und Deneb meist schwach ist, verschieben den Anforderungs-Score spürbar Richtung Core und Paid. Das ist sachlich richtig, aber es ist eine Modelländerung und keine reine Ergänzung. Wer die Zeilen aufnimmt, sollte die Default-Prioritäten bewusst setzen (Vorschlag unten: 1× M, 3× S, 4× C) und den 70/30-Regler zwischen Kosten und Score im Text neu einordnen.

---

## Fund 1 · Barrierefreiheit fehlt vollständig — und Core ist dort nicht der Sieger, für den es im Rechner durchgeht

**Heute:** Keine der 18 Anforderungen nennt Barrierefreiheit, WCAG, Tastaturbedienung, Screenreader oder Kontrast. Kein Red Flag. Das Wort kommt in der ganzen Datei nicht vor.

**Warum das im DACH-Kontext kein Nice-to-have ist:**
- Öffentliche Stellen (Kommunen, Landesbetriebe, Sozialversicherung, Hochschulen, viele kommunale Versorger und Kliniken) unterliegen BITV 2.0 / EU-Richtlinie 2016/2102 — dort ist ein nicht bedienbares Visual ein Beschaffungshindernis, kein Komfortthema.
- Das Barrierefreiheitsstärkungsgesetz (BFSG) gilt seit 28.06.2025 und betrifft **B2C-Dienstleistungen** (Webshops, Kundenportale), nicht das interne Monatsreporting. Wer aber Kennzahlen in ein Kundenportal einbettet, ist drin. Kleinstunternehmen (< 10 Beschäftigte und < 2 Mio. € Umsatz) sind ausgenommen. **Die häufige Aussage „BFSG zwingt uns zu barrierefreiem Power BI" ist für internes Reporting falsch — der Rechner sollte das klarstellen, statt es offen zu lassen.**

**Technischer Kern (belegt):**
- Tastaturnavigation in die Datenpunkte hinein ist bei Custom Visuals **Opt-in**: Der Entwickler muss `supportsKeyboardFocus: true` in der `capabilities.json` setzen und die Elemente `tabindex`-fähig machen. Ohne das gibt es nur „Esc/Tab am Container".
- High-Contrast ist ebenfalls Opt-in: Das Visual muss `host.colorPalette.isHighContrast` auswerten und selbst neu zeichnen.
- Core Visuals bekommen Tastaturnavigation, Screenreader-Ausgabe, High-Contrast und die barrierefreie `Show data`-Tabelle (Alt+Shift+F11) geschenkt.
- **Aber:** Die Option `core` im Rechner ist „Core Visuals **+ SVG-Measures**". Ein SVG-Measure ist ein Bild in einer Tabellenzelle ohne Alt-Text. Der Screenreader liest die Zeichenfolge oder nichts. Wer mit SVG-Measures IBCS baut, macht das Visual *weniger* barrierefrei als ein normales Balkendiagramm. Der Rechner behandelt Core bisher pauschal als den sauberen Weg — hier ist er es nicht.

**Vorschlag, neue Zeile in `REQS`:**

```js
{id:'a11y',name:'Barrierefreiheit (Tastatur, Screenreader, Kontrast)',
 sub:'WCAG 2.1 / EN 301 549; Pflicht für öffentliche Stellen (BITV 2.0), für B2C-Angebote BFSG seit 28.06.2025',
 cap:[3,2,2,3],def:'C',
 note:{paid:'Herstellerangabe prüfen: Tastaturfokus und High-Contrast sind bei Custom Visuals Opt-in (supportsKeyboardFocus, isHighContrast). Nicht ungeprüft mit 3 bewerten',
       oss:'Beim eigenen Visual selbst zu implementieren und zu testen; Aufwand einplanen',
       deneb:'Vega-Rendering liefert keinen Tastaturfokus in die Datenpunkte und keine Alt-Texte je Marke',
       core:'Core Visuals sind barrierefrei (Tastatur, Screenreader, High-Contrast, Show data). SVG-Measures sind Bilder ohne Alt-Text und verschlechtern die Barrierefreiheit gegenüber einem Standard-Visual'}}
```

Ehrlicher wäre für `paid` und `oss` der Startwert **0 („nicht geprüft")** — der Rechner unterstützt das für eigene Zeilen bereits. Wenn eine Zahl stehen soll, dann 3/2 mit dem Hinweis in `note`.

**Vorschlag, neuer Schalter in `FLAGS`:**

```js
{id:'a11ymust',label:'Barrierefreiheit ist verbindlich',
 sub:'Öffentliche Stelle (BITV 2.0) oder B2C-Angebot nach BFSG. Für rein internes Reporting gilt das BFSG nicht.',
 excl:{},
 warn:{paid:'Konformitätsaussage (VPAT/EN 301 549) beim Hersteller anfordern, nicht annehmen',
       oss:'Barrierefreiheit im eigenen Visual selbst bauen und testen: eigener Aufwandsposten',
       deneb:'Vega-Specs liefern keinen Tastaturfokus je Datenpunkt; Ersatzpfad (Show data / Tabellen-Variante) einplanen',
       core:'SVG-Measures ohne Alt-Text sind der Schwachpunkt; barrierefreie Alternative je Seite vorhalten'},
 flag:true}
```

**Evidenz:**
- https://learn.microsoft.com/power-bi/developer/visuals/supportskeyboardfocus-feature (Opt-in `supportsKeyboardFocus`, Basis-Verhalten ohne Flag)
- https://learn.microsoft.com/power-bi/developer/visuals/high-contrast-support (Opt-in `isHighContrast`)
- https://learn.microsoft.com/power-bi/create-reports/desktop-accessibility-creating-reports (eingebaute Features der Core Visuals, Kontrast 4,5:1)
- https://learn.microsoft.com/power-bi/explore-reports/desktop-accessibility-consuming-tools (`Show data` Alt+Shift+F11)
- BFSG-Geltungsbereich B2C, Stichtag 28.06.2025, Kleinstunternehmensausnahme: https://www.wettbewerbszentrale.de/barrierefreiheitsstaerkungsgesetz-gilt-ab-28-juni-2025-was-unternehmen-jetzt-wissen-muessen/ und https://www.barrierefreiheit-dienstekonsolidierung.bund.de/Webs/PB/DE/gesetze-und-richtlinien/barrierefreiheitsstaerkungsgesetz/barrierefreiheitsstaerkungsgesetz-node.html
- Zu Alt-Text bei SVG-Measures: **keine Primärquelle**, das ist eine technische Schlussfolgerung (Bild in Tabellenzelle ohne `alt`). Als Meinung kennzeichnen.

**Konfidenz:** hoch für die Opt-in-Mechanik und die Core-Stärke, mittel für die konkreten Zahlen je Ansatz, mittel für die SVG-Einschätzung.
**Wirkung:** hoch bei öffentlichen Stellen (kann die Rangfolge drehen), niedrig im Mittelstand-Preset.

---

## Fund 2 · `bigdata` ist falsch bewertet: das 30.000er-Fenster ist ein SDK-Limit *aller* Custom Visuals

**Heute:** `{id:'bigdata', cap:[4,3,2,2], def:'C'}` — Paid 4 („gut"), OSS 3, Deneb 2 („nur Workaround"), Core 2. Die `note` bei Deneb sagt bereits korrekt: „Datenfenster 30.000 Zeilen ist das SDK-Limit aller Custom Visuals". **Die Notiz widerspricht der eigenen Zahlenreihe.**

**Beleg:** Das Datenreduktions-Fenster ist auf 2–30.000 Zeilen begrenzt, `fetchMoreData` hebt das auf, ist dann aber hart limitiert auf 1.048.576 Zeilen gesamt und 100 MB im Aggregationsmodus. Das gilt für jedes Visual, das über das Custom-Visual-SDK läuft — Zebra BI, Inforiver, graphomate, ChartKitchen und Deneb gleichermaßen. Core Visuals arbeiten dagegen mit Virtualisierung (Matrix: Fenster von 500 Zeilen, Slicer 200, Multirow-Card 200) und scrollen praktisch unbegrenzt.

**Vorschlag:** `cap:[3,3,3,4]`, `def:'C'` unverändert, Notizen angleichen:

```js
{id:'bigdata',name:'Große Datenmengen je Visual',sub:'Über 30.000 Zeilen im Datenfenster',
 cap:[3,3,3,4],def:'C',
 note:{paid:'Gleiches SDK-Limit wie jedes Custom Visual: Fenster max. 30.000 Zeilen, mit fetchMoreData bis 1.048.576 Zeilen und 100 MB',
       oss:'Gleiches SDK-Limit; ob fetchMoreData implementiert ist, je Visual prüfen',
       deneb:'Gleiches SDK-Limit; fetchMoreData vorhanden, danach Browser-Ressourcen die Grenze',
       core:'Matrix und Tabelle virtualisieren (Fenster 500 Zeilen) und scrollen faktisch unbegrenzt; SVG-Measures bremsen bei sehr langen Zeichenketten'}}
```

**Warum das zählt:** Die Zeile steht heute als Vorteil auf der Paid-Seite (4 gegen 2), obwohl der Unterschied technisch nicht existiert. Das ist genau die Art von Detail, die auf einer Konferenzbühne von einem Zuhörer aufgemacht wird.

**Evidenz:** https://learn.microsoft.com/power-bi/developer/visuals/fetch-more-data (Fenster 2–30.000; 1.048.576 Zeilen; 100 MB) · https://learn.microsoft.com/power-bi/visuals/power-bi-data-points (Virtualisierung Matrix 500, Custom Visuals max. 30.000 Datenpunkte, Default 1.000)
**Konfidenz:** hoch. **Wirkung:** mittel (Score-Verschiebung zulasten Paid, zugunsten Core und Deneb).

---

## Fund 3 · Neue Anforderung: Standard per Theme-Datei erzwingbar

**Heute:** `{id:'design', name:'Einheitliches Design ohne Styleguide-Disziplin', cap:[5,4,2,2], def:'S'}` misst nur, ob es *out of the box* gleich aussieht. Es fehlt die härtere Frage, die über einen echten Standard entscheidet: **Kann ich das Design zentral in einer Datei festschreiben und auf 100 Berichte ausrollen, ohne jedes Visual anzufassen?**

Für Core Visuals ist das die `theme.json` mit `visualStyles`, Textklassen, Strukturfarben und seit 2024 Style-Presets — ein Ausrollen über alle Berichte, auch programmatisch über Semantic Link Labs. Für Custom Visuals greift das Theme nur so weit, wie das Visual seine Eigenschaften als Formatobjekte deklariert und die `colorPalette` benutzt; Deneb kann Theme-Farben per `pbiColor()` ziehen, alles andere steht im Spec. Bei einem Corporate-Design-Wechsel ist das der Unterschied zwischen einer Datei und 100 Berichten.

**Vorschlag, neue Zeile:**

```js
{id:'themeable',name:'Standard zentral per Theme-Datei steuerbar',
 sub:'Farben, Schriften, Abstände einmal in theme.json, Rollout über alle Berichte',
 cap:[3,3,3,5],def:'S',
 note:{paid:'Theme greift nur auf die vom Visual deklarierten Formatobjekte; Rest über Vorlagen-PBIX oder Hersteller-Style-Datei',
       oss:'Wie Paid; im eigenen Visual selbst entscheidbar, ob Formatobjekte theme-fähig sind',
       deneb:'Theme-Farben über pbiColor() erreichbar, Typografie und Layout stehen im Spec und müssen je Template gepflegt werden',
       core:'theme.json mit visualStyles, Textklassen und Style-Presets; auch programmatisch ausrollbar'}}
```

**Evidenz:** https://learn.microsoft.com/power-bi/create-reports/report-themes-create-custom (Theme-Komponenten, Style-Presets, JSON-Schema) · https://learn.microsoft.com/power-bi/create-reports/desktop-report-themes (Basis-Theme vs. Custom Theme, programmatischer Rollout)
**Konfidenz:** hoch für Core, mittel für Paid/OSS/Deneb (hängt an der Implementierung). **Wirkung:** mittel bis hoch — das ist der Kern des Wortes „Standard" im Titel des Rechners.

---

## Fund 4 · Neue Anforderung: Datenexport aus dem Visual nach Excel

**Heute:** `export` deckt nur PDF/PPT-Export des ganzen Berichts und E-Mail-Abos ab. Der mit Abstand häufigste Wunsch eines Controlling-Empfängers — „gib mir die Zahlen hinter dem Chart als Excel" — steht nirgends.

**Beleg:** Microsoft sagt ausdrücklich: „Not every custom visual implements data export" und Custom Visuals unterliegen zusätzlich der Tenant-Policy; über die JavaScript-API (Embedded) sind Custom Visuals beim Export gar nicht unterstützt. Core Visuals liefern „Summarized"/„Underlying" mit bis zu 150.000 Zeilen nach Excel bzw. 500.000 mit Live-Verbindung. Bei Inforiver und Zebra BI ist Excel-Export ein beworbenes Produktmerkmal — **Herstellerseiten waren über den Proxy nicht erreichbar, also nicht primär belegt**.

**Vorschlag, neue Zeile:**

```js
{id:'exportdata',name:'Datenexport aus dem Visual (Excel/CSV)',
 sub:'„Zahlen hinter dem Chart" für den Empfänger, inkl. Tenant- und Berichts-Einstellung',
 cap:[4,3,2,5],def:'S',
 note:{paid:'Produktmerkmal je Hersteller; im Kaufprozess ausdrücklich prüfen, nicht annehmen',
       oss:'Nur wenn das Visual den Export implementiert; beim eigenen Visual eine bewusste Entscheidung',
       deneb:'Export hängt an der Implementierung des Wirtsvisuals; Ersatzpfad ist eine parallele Tabelle auf der Seite',
       core:'Summarized bis 150.000 Zeilen (Live-Verbindung 500.000), Underlying, Show as table, auch aus der Mobile-App'}}
```

**Evidenz:** https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-export-data (Punkt 12 der Considerations: „Not every custom visual implements data export"; Zeilengrenzen 30.000 CSV / 150.000 xlsx / 500.000 Live) · https://learn.microsoft.com/javascript/api/overview/powerbi/export-data („Custom and R visuals aren't supported")
**Konfidenz:** hoch für die Mechanik, niedrig für die konkreten Herstellerwerte (nicht primär belegt). **Wirkung:** mittel.

---

## Fund 5 · `interact` ist zu grob: Drilldown, Drillthrough und Tooltip-Seiten gehören getrennt

**Heute:** `{id:'interact',name:'Interaktivität',sub:'Drill, Tooltip, Cross-Highlight, Auswahl',cap:[5,4,4,2],def:'S'}` — vier sehr verschiedene Fähigkeiten in einer Zahl. Deneb kann Selektion und Cross-Highlight (über `pbiContainer`-Signale und Selection-IDs), aber die **Drilldown-Leiste des Berichts** und **Drillthrough auf eine Zielseite** sind eigene, opt-in zu implementierende APIs. „Alles 4" verdeckt genau den Unterschied, der in einer Monats-Deep-Dive-Session auffällt: Man kann nicht von Region auf Land aufreißen.

**Vorschlag:** `interact` auf Selektion/Cross-Highlight/Tooltip verengen (`sub:'Auswahl, Cross-Highlight, Standard-Tooltip'`, `cap` unverändert) und eine zweite Zeile ergänzen:

```js
{id:'drill',name:'Drilldown, Drillthrough, Berichtsseiten-Tooltip',
 sub:'Hierarchie aufreißen, Sprung auf Detailseite, Tooltip-Seite statt Standard-Tooltip',
 cap:[4,3,2,5],def:'S',
 note:{paid:'Je Produkt unterschiedlich weit implementiert; Drillthrough-Verhalten im PoC testen',
       oss:'Drill- und Tooltip-APIs müssen im Visual implementiert sein; beim eigenen Visual Aufwandsposten',
       deneb:'Selektion und Tooltip ja, Drilldown-Leiste und Berichtsseiten-Tooltip nicht als Standardweg',
       core:'Vollständig: Hierarchie-Drill, Drillthrough, Tooltip-Seiten, Cross-Report-Drillthrough'}}
```

**Evidenz:** Drill- und Tooltip-Unterstützung sind dokumentierte, vom Entwickler zu implementierende Features des Visual-SDK: https://learn.microsoft.com/power-bi/developer/visuals/drill-down-support und https://learn.microsoft.com/power-bi/developer/visuals/add-tooltips (beide als „supported features" in den Veröffentlichungsrichtlinien genannt: https://learn.microsoft.com/power-bi/developer/visuals/guidelines-powerbi-visuals). Für Deneb konkret: **keine Primärquelle geprüft** (deneb.guide war über den Proxy nicht erreichbar) — Einschätzung, vor der Konferenz nachprüfen.
**Konfidenz:** hoch für die Opt-in-Natur, mittel für die Deneb-Zahl. **Wirkung:** mittel.

---

## Fund 6 · Neue Anforderung: Rendering in der Power BI Mobile App

**Heute:** nicht enthalten. In der Blindschätzung (`06-blindschaetzung-sonnet.md`, Zeile 86) wurde der Punkt bereits angemeldet und ist seither liegen geblieben.

Microsoft formuliert die mobilen Anforderungen an Custom Visuals als **„optional functionality"** mit ausdrücklichem Failover-Hinweis („If a visual can't render on a mobile device, the visual should show a descriptive error"). Ein IBCS-Wasserfall mit Achsenbeschriftung, Varianz-Overlay und Kommentarspalte auf 390 px Breite ist eine Design-Aufgabe, kein Klick — bei jedem der vier Wege, aber bei einer festen Vega-Spec am schmerzhaftesten, weil Größenlogik und Textabschneidung im Spec stehen.

**Vorschlag, neue Zeile:**

```js
{id:'mobile',name:'Lesbar in der Power BI Mobile App',
 sub:'Telefon-Layout, kleine Flächen, Touch statt Hover',
 cap:[4,3,2,4],def:'C',
 note:{paid:'Hersteller bewerben responsives Verhalten; im PoC auf einem echten Telefon prüfen',
       oss:'Mobile-Verhalten ist eine eigene Entwicklungs- und Testaufgabe',
       deneb:'Größen, Schriftgrade und Abschneideregeln stehen in der Spec und müssen je Template zweimal gepflegt werden',
       core:'Core Visuals und Telefon-Layout greifen ineinander; SVG-Measures skalieren als Bild, Text wird schnell unlesbar'}}
```

**Evidenz:** https://learn.microsoft.com/power-bi/developer/visuals/mobile-development (optionale Funktionen, Failover, Pflicht zu rendern auf allen unterstützten Geräten) · https://learn.microsoft.com/power-bi/create-reports/power-bi-create-mobile-optimized-report-mobile-layout-view (Telefon-Layout, Einschränkungen)
**Konfidenz:** mittel. **Wirkung:** niedrig bis mittel (hoch nur, wenn Mobile im Zielbild steht).

---

## Fund 7 · Neue Anforderung: pixelgenauer Druck / Berichtsheft / Massenversand (Paginated)

**Heute:** nicht enthalten. Für DACH-Controlling ist das ein echter Fall: das monatliche Berichtsheft als PDF an Bereichsleiter, der Jahresabschluss-Anhang, der Aufsichtsratsband.

**Kern:** Paginated Reports (RDL, Power BI Report Builder) haben eine **eigene Rendering- und Diagramm-Engine**. Power-BI-Custom-Visuals existieren dort schlicht nicht — weder Zebra BI noch Inforiver noch Deneb noch ChartKitchen. Wer ein IBCS-Berichtsheft drucken will, baut es in RDL ein zweites Mal. Umgekehrt bringt der Core-+-SVG-Weg wenigstens die Logik im Semantikmodell mit; das Rendering ist trotzdem neu zu bauen.

**Vorschlag, neue Zeile:**

```js
{id:'paginated',name:'Pixelgenauer Druck / Paginated Report',
 sub:'Berichtsheft als PDF, seitenweiser Massenversand, Archivfähigkeit',
 cap:[1,1,1,2],def:'C',
 note:{paid:'Custom Visuals existieren in Paginated Reports nicht: Zweitbau in Report Builder nötig',
       oss:'Custom Visuals existieren in Paginated Reports nicht',
       deneb:'Vega-Specs laufen nicht in Paginated Reports',
       core:'Auch Core Visuals laufen nicht in RDL; immerhin bleiben Measures und Modelllogik wiederverwendbar, das Layout ist neu zu bauen'}}
```

Bewusst mit `def:'C'`, sonst erzeugt die Zeile bei jedem Preset einen falschen Alarm.

**Evidenz:** https://learn.microsoft.com/power-bi/paginated-reports/report-builder-power-bi (eigener Funktionsumfang: Tabellen, Matrix, Chart, Gauge, Sparklines, Exportformate PDF/Excel/Word/CSV/XML/MHTML) · https://learn.microsoft.com/power-bi/paginated-reports/report-design/visualizations/charts-report-builder (eigener Diagrammtyp-Katalog, keine Power-BI-Visuals)
**Konfidenz:** hoch. **Wirkung:** mittel (hoch, wenn der Kunde ein Berichtsheft hat).

---

## Fund 8 · Fehlende Red Flags: deutsche Beschaffung und Mitbestimmung

**Heute:** Alle zehn Schalter sind Microsoft-Plattform-Schalter (Zertifizierung, Tenant-Setting, Report Server, Embedded, Sovereign, GPO) plus zwei kaufmännische (`nobudget`, `noext`). Was in einem deutschen Konzern die Entscheidung tatsächlich kippt, fehlt.

**Vorschlag, zwei neue Schalter:**

```js
{id:'euonly',label:'Einkauf: nur EU-Anbieter, AVV ohne Drittlandtransfer',
 sub:'Konzernrichtlinie oder Vergabestelle verlangt Anbietersitz und Verarbeitung in der EU',
 excl:{},
 warn:{paid:'Anbietersitz, Konzernmutter, Support-Standort und Unterauftragsverarbeiter je Produkt prüfen; AVV und SCC vor dem Kauf, nicht danach',
       oss:'Repository-, Build- und Paket-Infrastruktur liegt in der Regel außerhalb der EU; für den Code selbst meist unkritisch, für die Lieferkette dokumentationspflichtig',
       deneb:'Bezug über AppSource; für den Standalone-Build gilt dasselbe wie für OSS'},
 flag:false}

{id:'betriebsrat',label:'Mitbestimmung: Telemetrie oder Lizenzprüfung im Visual',
 sub:'§ 87 Abs. 1 Nr. 6 BetrVG — technische Einrichtungen, die Verhalten oder Leistung überwachen können',
 excl:{},
 warn:{paid:'Nutzerbezogene Lizenzprüfung und Produkt-Telemetrie sind mitbestimmungspflichtig: Betriebsvereinbarung und Vorlaufzeit einplanen',
       oss:'Eigenes Visual: Telemetrie bewusst weglassen und das im Code-Review dokumentieren — dann entfällt der Punkt',
       deneb:'Keine nutzerbezogene Telemetrie bekannt; Aussage für die Betriebsvereinbarung belegen',
       core:'Plattform-Telemetrie ist ohnehin Teil der bestehenden Microsoft-365-Betriebsvereinbarung'},
 flag:false}
```

Beides als Warnung, **nicht** als K.O. — ein K.O. wäre eine Tatsachenbehauptung über Hersteller, die hier niemand belegen kann.

**Nebeneffekt, der im Rechenkern fehlt:** Beide Schalter kosten Zeit (Betriebsvereinbarung, AVV-Prüfung, Vergabeprüfung), aber `FLAGS` wirken im Modell ausschließlich als Filter (`r.ko` / `r.warn` in `calc`), nie auf Stunden. Wer ehrlich rechnen will, müsste `euonly` und `betriebsrat` einen Setup-Aufschlag zuordnen — analog zu `noext`, das den Externen-Anteil auf 0 setzt. Das ist eine Strukturänderung und gehört vor die Konferenz diskutiert, nicht heimlich eingebaut.

**Evidenz:** § 87 Abs. 1 Nr. 6 BetrVG, Wortlaut „technische Einrichtungen, die dazu bestimmt sind, das Verhalten oder die Leistung der Arbeitnehmer zu überwachen"; die Rechtsprechung legt „bestimmt" weit aus, die objektive Eignung genügt. Fundstelle `gesetze-im-internet.de/betrvg/__87.html` — **in dieser Sitzung nicht abgerufen**, vor Veröffentlichung mit dem Gesetzestext abgleichen. Für den Lizenz-Durchsetzungsmechanismus: https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals (lizenzierte Visuals und ihre Umgebungen). Zur EU-Anbieter-Frage: **keine Quelle**, das ist eine Einkaufsrealität, kein Rechtssatz.
**Konfidenz:** hoch für BetrVG, mittel für die Ausgestaltung. **Wirkung:** mittel — im Konzern verschiebt eine Betriebsvereinbarung den Starttermin um Monate, was der Rechner heute gar nicht abbilden kann.

---

## Fund 9 · Fehlende Red Flags: Revision und Budgetjahr

**Heute:** Die Anforderungen `version` (Änderungshistorie) und `datares` (keine Datenverarbeitung außerhalb des Tenants) sind da, aber nur als Score. Es gibt keinen Schalter für „die Innenrevision muss die Rechenlogik nachvollziehen können" und keinen für die häufigste kaufmännische Einschränkung überhaupt: das Geld kommt erst nächstes Jahr.

**Vorschlag, zwei neue Schalter:**

```js
{id:'revision',label:'Revision verlangt Einsicht in die Rechenlogik',
 sub:'IKS / Revisionsstandard: jede ausgewiesene Zahl muss bis zur Formel nachvollziehbar sein',
 excl:{},
 warn:{paid:'Berechnungen im Visual (Subtotale, Varianzlogik, Prognose) sind Closed Source und für die Revision nicht einsehbar: Berechnungen ins Modell ziehen',
       oss:'Quellcode einsehbar, aber der Prüfnachweis muss geführt und versioniert werden',
       deneb:'Spec ist Text und prüfbar; Aggregation im Vega-Transform ist für die Revision trotzdem ein zweiter Rechenort',
       core:'Alle Berechnungen liegen als DAX im Modell und sind der geprüfte Ort'},
 flag:false}

{id:'budgetnext',label:'Budgetfreigabe erst im Folgejahr',
 sub:'Investitionsstopp im laufenden Jahr: Lizenzkosten beginnen erst ab Jahr 2',
 excl:{},warn:{},flag:false,modifier:true}
```

`budgetnext` ist ein `modifier` wie `osscert` und `noext` — er gehört mit einer Zeile in `calc` verbunden (Lizenzkosten und Setup erst ab Jahr 1 statt Jahr 0). Das ist für Paid ein echter Barwertvorteil und für die Stundenwege ein Nachteil, weil der Nutzen später beginnt. Ohne die Verdrahtung im Rechenkern ist der Schalter Kosmetik — dann lieber weglassen.

**Evidenz:** keine externe Quelle nötig und keine vorhanden; das sind Beschaffungs- und IKS-Realitäten. Als Meinung gekennzeichnet.
**Konfidenz:** mittel (`revision`), hoch dass `budgetnext` ohne Rechenkern-Anbindung sinnlos ist. **Wirkung:** niedrig bis mittel.

---

## Fund 10 · Neue Anforderung: Visual in PowerPoint/Word übernehmen (Board Pack)

**Heute:** `export` deckt den PDF/PPT-Export des ganzen Berichts ab. Der reale Weg ins Board Pack ist ein anderer: ein einzelnes Chart kopieren und in die Vorstandsvorlage einsetzen.

**Beleg:** Beim „Copy visual"-Weg unterstützt Microsoft native Visuals und **zertifizierte** Custom Visuals; ausdrücklich nur eingeschränkt unterstützt sind unter anderem **lizenzierte Visuals**, **nicht zertifizierte Custom Visuals** und **AppSource-Visuals aus dem Organisations-Store**. Damit trifft die Einschränkung ausgerechnet den Paid-Weg und den eigenen, noch nicht zertifizierten OSS-Weg.

**Vorschlag, neue Zeile:**

```js
{id:'copyppt',name:'Einzelnes Chart nach PowerPoint/Word kopieren',
 sub:'Board Pack, Vorstandsvorlage, Gremienunterlage',
 cap:[2,2,3,5],def:'C',
 note:{paid:'Lizenzierte Visuals und Org-Store-Visuals sind beim Kopieren nur eingeschränkt unterstützt',
       oss:'Nicht zertifizierte Custom Visuals sind beim Kopieren nur eingeschränkt unterstützt; nach Zertifizierung besser',
       deneb:'Zertifiziert, damit grundsätzlich unterstützt; Ergebnis je Spec prüfen',
       core:'Vollständig unterstützt'}}
```

**Evidenz:** https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-copy-paste (Abschnitt Considerations and limitations: unterstützt sind native und zertifizierte Custom Visuals; eingeschränkt u. a. lizenzierte Visuals, nicht zertifizierte Custom Visuals, Org-Store-AppSource-Visuals, Visuals mit angewendeten Themes)
**Konfidenz:** hoch für die Microsoft-Aussage, mittel für die Übersetzung in 1–5. **Wirkung:** niedrig bis mittel.

---

## Geprüft und für richtig befunden (keine Änderung)

| Zeile | Ergebnis |
|:--|:--|
| `copilot` cap `[1,1,1,5]` | **Bestätigt.** Microsoft dokumentiert wörtlich „Copilot doesn't support custom visuals" für Erstellen und Bearbeiten von Berichtsseiten. https://learn.microsoft.com/power-bi/create-reports/copilot-create-reports · Ergänzender Hinweis für die `note`: Copilot-Zusammenfassungen im Lesemodus berücksichtigen nur Visuals unter 30.000 Zeilen, sonst wird auf das Semantikmodell ausgewichen (https://learn.microsoft.com/power-bi/explore-reports/copilot-pane-summarize-content). |
| `export` cap `[5,2,3,5]` | **Bestätigt.** Custom Visuals sind beim Export nach PDF/PPT und in Abos nicht unterstützt — Ausnahme: zertifizierte. https://learn.microsoft.com/power-bi/collaborate-share/end-user-pdf |
| `rs` und Flag `rs` / `embed` / `sovereign` | **Bestätigt und sogar untertrieben belegt.** Microsoft listet die vier Umgebungen, in denen lizenzierte Visuals nicht funktionieren, geschlossen auf: Report Server (kein Entra ID), Sovereign/Government Clouds, PaaS Embedded „app owns data", Publish to web. https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals |
| `mscert` note zu Org-Store | **Bestätigt.** „Power BI Report Server doesn't support organizational visuals." https://learn.microsoft.com/fabric/admin/organizational-visuals |
| Flag `nogpo` | **Bestätigt.** „Disabling the Power BI visuals from the Admin portal isn't enforced in Power BI Desktop." https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-faq |
| `version` cap `[2,3,5,4]` | Deneb 5 ist **optimistisch, aber vertretbar**. In PBIR liegt die Visual-Konfiguration je Visual in einer `visual.json`; die Vega-Lite-Spec steht dort als Zeichenkette in dieser Datei, der Diff ist also vorhanden, aber nicht zeilenweise lesbar, solange die Specs nicht zusätzlich als eigene Template-Dateien gepflegt werden. Vorschlag: Zahl lassen, `note` um genau diesen Satz ergänzen. https://learn.microsoft.com/power-bi/developer/projects/projects-report |

## Bewusst nicht vorgeschlagen

- **RLS/OLS-Verhalten:** wirkt auf Modellebene und damit für alle vier Wege gleich; eine Zeile ohne Unterscheidungskraft verwässert nur den Score. (OLS kann Visuals mit ausgeblendeten Spalten brechen — das gilt aber ebenfalls für alle vier.)
- **Sovereign Cloud, Fabric Apps, Lizenzdurchsetzung bei Embedded:** bereits als Red Flags vorhanden.
- **Copilot-Readiness, Support-SLA, Roadmap-Transparenz:** `copilot`, `sla` und `exit` decken das ab; „Roadmap-Transparenz" ist ohne Quelle nicht bewertbar.
- **Zertifizierungskosten des eigenen Visuals:** ist eine Kostenposition (gehört zu `OPTP`, Freigabe/Setup), keine Anforderung.
- **Ein zehnter Bucket / eine zehnte Option:** nicht Gegenstand dieser Linse.

## Offene Punkte, die jemand mit freiem Netz nachziehen muss

1. Barrierefreiheits-Konformitätsaussagen (VPAT / EN 301 549) von Zebra BI, Inforiver und graphomate — Herstellerdomänen waren über den Egress-Proxy nicht erreichbar.
2. Ob Deneb `supportsKeyboardFocus` und `isHighContrast` implementiert (deneb.guide nicht erreichbar) — davon hängen die Deneb-Werte in `a11y` ab.
3. Excel-Export und Copy-to-PowerPoint je Paid-Produkt praktisch testen; die Microsoft-Einschränkung für „licensed visuals" beim Kopieren ist in den Herstellerprospekten nirgends erwähnt.
