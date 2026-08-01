# Changelog — P&L Statement byDatenWG

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
