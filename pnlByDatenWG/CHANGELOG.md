# Changelog — P&L Statement byDatenWG

## 0.3.2.0 (2026-08-02) — Zeilen-Waterfall als dritte Ansicht

- Neue Ansicht **Waterfall** (klassische IBCS-GuV-Kaskade, zusätzlich zu
  Table und Bars): Referenz-Spalte und AC-Spalte als horizontale
  Zeilen-Wasserfälle — Beiträge floaten auf der laufenden Summe,
  Formelzeilen (Gross profit, EBITDA, …) ankern als volle Balken an der
  Achse und setzen die Kaskade zurück; Kinder kaskadieren innerhalb des
  Eltern-Segments (Aufklappen funktioniert). Daneben Δ-Balken und Δ%-Pins
  gegen die Toolbar-Referenz.
- Szenario-Notation in der Kaskade: AC solide, PY grau, PL outlined,
  FC schraffiert; Assisting Line an der Laufkante; Labels außen
  (Zuwachs rechts, Abnahme links), Summen fett; eine gemeinsame Skala
  für beide Kaskaden-Spalten.


## 0.3.1.0 (2026-08-02) — Struktur-Balken statt Waterfall (CFO-Feedback)

- Die Waterfall-Ansicht ist durch eine **Struktur-Balken-Ansicht** ersetzt
  (IBCS UN 3.4: Struktur auf der vertikalen Achse): je Zeile ein horizontaler
  AC-Balken mit der Referenz (PL outlined / PY grau) dahinter, daneben
  Δ-Balken und Δ%-Pin gegen die Toolbar-Referenz; FY-Block mit schraffierten
  FC-Balken vs. PL. Nutzt dieselbe Hierarchie inkl. Aufklappen/Ebenen-Buttons,
  eine gemeinsame Balken-Skala über alle Zeilen (IBCS: gleiche Einheit =
  gleiche Skala), Werte-Labels außen.
- Persistierter Zustand `view: "waterfall"` migriert automatisch zu `"bars"`.
- Das Waterfall-Modul bleibt im Quellbaum (src/waterfall.ts, ungenutzt) für
  eine mögliche spätere Verdichtungs-Ansicht.


## 0.3.0.0 (2026-08-02) — Sample-Parität: Toolbar, FY-Block, Waterfall, Sparklines

Kompletter Rendering-Neubau nach dem Konzept-Demo (HTML-Sample), Rechenkern
erweitert. Sternschema (L1..Ln) ist der primäre Modus.

- **In-Visual-Toolbar für Report-Leser** (per Format-Pane abschaltbar, Zustand
  bookmark-fähig persistiert): Ansicht Table/Waterfall · Spalten-Presets
  (AC·PY·PL·FC, AC vs Ref, AC·PY·ΔPY, AC·PL·ΔPL, ΔPY%·ΔPL%) · Δ-Referenz ·
  Einheit k/m · Dichte Normal/Compact · Ebenen-Buttons · % vom Umsatz ·
  Nullzeilen ausblenden
- **Zwei Periodenblöcke**: YTD (AC·PY·PL) + FY-Outlook (FC vs PL) mit neuen
  Measure-Slots `FC Gesamtjahr`/`PL Gesamtjahr` (Skalare, first-wins);
  FY-Δ-Balken schraffiert (Minuend FC), Pin-Köpfe outlined — IBCS-Notation
- **Monats-Grain**: neue Rolle „Periode (Monat)" — Werte werden zu YTD
  aggregiert, je Zeile 12M-Sparkline (AC solide, PY dünn grau, FC gestrichelt)
  inkl. Subtotal-Rollup und Formel-Auswertung pro Monat
- **Δ-Achsen kodieren die Referenz** (IBCS): grau = PY, Doppellinie = PL,
  gestrichelt = FC; einheitliche Δ-Skala über alle Zeilen mit Skalen-Hinweis
- **Teal-Abweichung als Default** (#0E8585/#E02B1D, Rot-Grün-sicher) mit
  dokumentiertem Deviation-Hinweis in Legende und Footer; klassisches
  IBCS-Grün per Format-Pane
- **Kommentare**: neue Rolle „Kommentar" → nummerierte Marker ①② an der Zeile
  + Fußnoten-Sektion; Datenqualitäts-Signale (Waisen, Zyklen, Formelfehler)
  erscheinen dort ebenfalls
- **%-vom-Umsatz-Spalte** (Basiszeile automatisch = erste Wurzelzeile,
  per Format-Pane überschreibbar), Konten-IDs klein vor dem Namen,
  Margen-/KPI-Zeilen kursiv mit pp-Deltas
- **Waterfall-Ansicht** derselben Daten (Umsatz → Jahresüberschuss,
  Formelzeilen als Anker, Assisting Lines, IBCS-Szenario-Fills)
- 3 neue Engine-Testblöcke (20 gesamt), Waterfall-Modultest mit
  Geometrie-Checks, neue Render-Testfälle mit Pharma-Demodatensatz


## 0.2.0.0 (2026-08-01) — Sternschema-Modus (Level-Spalten L1..Ln)

Zweiter Eingabemodus für die Hierarchie, wie er im Sternschema üblich ist:

- Neues Field Well **„Ebenen-Spalten (L1..Ln)"** (bis 8 Spalten, Reihenfolge =
  Ziehreihenfolge) als Alternative zu AccountID/ParentID — Parent-Child bleibt
  voll unterstützt und gewinnt, wenn Parent-ID gebunden ist
- Ragged-Regeln (beide): leere tiefere Level → letzte gefüllte Ebene ist das
  Blatt; wiederholter Inhalt (L2 = L1) → Hierarchie endet dort
- Zeilen mit gleichem Pfad werden aggregiert (feineres Fact-Grain); eine
  Aggregat-Zeile (z. B. PY nur auf L1) wirkt als per-Szenario-Fallback
- Formelzeilen referenzieren per eindeutigem **Zeilennamen**
  (`[Umsatzerlöse]+[Betriebsaufwand]`) — funktioniert auch im
  Parent-Child-Modus zusätzlich zur ID
- Synthetische Zwischensummen erben `DisplayInvert`/`VarianceInvert`, wenn
  alle Kinder einheitlich sind (Kostenblock bleibt positiv angezeigt)
- IBCS-Notation unverändert in beiden Modi
- Neue Demo `demoData/guv-demo-levels.csv`, 4 neue Engine-Testblöcke
  (17 gesamt), Render-Testfall p10


## 0.1.1.0 (2026-08-01) — Review-Fixes

Befunde aus einem unabhängigen Code-Review umgesetzt:

- **Rechenkern**
  - Zeilen in Parent-Child-Zyklen (x→y→x) landen jetzt sichtbar im
    Waisen-Bucket statt still zu verschwinden (+ Warnung)
  - Summenzeilen: Eigenwert als **per-Szenario-Fallback**, wenn Kinder für
    ein Szenario keine Daten liefern (z. B. PY nur auf Aggregatsebene)
  - `SignConvention` wirkt jetzt auch auf Subtotals mit Kindern
  - Teilbäume unter Separator-/Formel-Zeilen erzeugen eine Warnung statt
    still aus Summen zu fallen
  - Formel-Fehler propagieren sichtbar zu konsumierenden Formeln
    (`ref [id]: …` statt stilles Leer)
  - Deutsche Zeilentyp-Synonyme (Zwischensumme, Kennzahl, Marge, Trennzeile),
    tolerantere Sign-/Bool-Erkennung („-", „negativ", „wahr", „j")
- **Rendering**
  - Δ-/Δ%-Spaltenbreiten passen sich der breitesten Beschriftung an —
    keine abgeschnittenen Zahlen mehr (Geometrie-Check im Render-Test)
  - k/m-Skalierung und Δ-Balken-Skala über **alle** Zeilen statt nur
    sichtbare — stabil beim Auf-/Zuklappen
  - „Keine Daten für die aktuelle Auswahl" statt Landing Page, wenn Filter
    alles entfernen; Warnungen aggregiert mit Tooltip
- **State**: per Bookmark hereingereichter Expand-Zustand wird übernommen;
  Format-Pane-Änderung der Standard-Ebene greift wieder; Persist-Mechanik
  verklemmt nicht mehr in Read-only-Hosts; State wird gegen das Modell bereinigt
- **Parsing**: String-Measures (DirectQuery), `trim()` auf Schlüsseln,
  NaN-sichere Sortierung, Hinweis bei 30k-Zeilenlimit
- Tests: 6 neue Engine-Testblöcke, Worst-Case-Rendertest (EUR-Rohwerte,
  Skalierung none), SVG-Clipping-Assertion im Screenshot-Harness


## 0.1.0.0 (2026-08-01) — MVP / Phase 1

Erste Version nach Anforderungsdokument „Best-in-Class P&L Standalone Visual",
Umfang F1–F4, F7, F9 + IBCS-Basisnotation + Landing Page.

- Rechenkern (`src/engine.ts`, PBI-frei, unit-getestet):
  - unbalancierte Parent-Child-Hierarchie, Waisen → sichtbarer
    „Nicht zugeordnet"-Bucket
  - Subtotals mit SignConvention, bebuchbare Zwischenknoten
    (eigener Wert + Kinder)
  - Formel-Engine für `FormulaDef` (`[Ref]`, `+ - * /`, Klammern, unäres Minus,
    Dezimalkomma), Formel-auf-Formel, Zirkelbezug- und Parse-Fehler je Zeile,
    Division durch 0 → leer statt Crash
  - Formel-/KPI-Zeilen fließen nie in Eltern-Summen (kein Doppelzählen)
  - Δ/Δ% gegen wählbare Referenz, VarianceInvert, DisplayInvert
- Rendering:
  - IBCS-Tabelle: Szenario-Chips (AC solide, PY grau, PL Rahmen, FC Schraffur),
    fette Summenzeilen mit Ergebnislinie, Einrückung je Ebene
  - Δ-Balken (absolut) und Δ%-Pins mit einer gemeinsamen Skala je Spalte,
    Überlauf-Marker, Labels außerhalb mit explizitem `+`
  - KPI-/Margen-Zeilen in %, Δ in Prozentpunkten, vom EUR-Maßstab entkoppelt
  - Expand/Collapse je Zeile + Ebenen-Buttons, Zustand persistiert
    (bookmark-fähig, übersteht Cross-Filter)
  - 3-zeiliger Titelblock + Message-Zeile, Skalierung Auto/k/m,
    de/en-Zahlenformat aus der Host-Locale, Landing Page, Kontextmenü
- Tooling: Engine-Unit-Tests, Headless-Render-Harness (8 Fälle inkl.
  Datenqualitäts-Edge-Cases), eslint, `pbiviz package`

Bekannte Grenzen (bewusst, siehe README-Roadmap): kein Virtual Scrolling,
kein `fetchMoreData` (Top-30k-Reduktion), Icon ist Platzhalter der KPI Card.
