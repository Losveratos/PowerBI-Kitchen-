# Changelog — P&L Statement byDatenWG

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
