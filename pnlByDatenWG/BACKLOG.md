# Backlog · P&L Statement byDatenWG

Gesammelt aus Reviews und Nutzertests. Bewusst **nicht** in 1.7 umgesetzt — Entscheidung des
Produktverantwortlichen (29.10.2026): Farbsemantik des Sankey bleibt vorerst, wie sie ist.

## Sankey · Farben und Legende (Review Data-Viz / Controlling, 29.10.2026)
- **Legende je Modus:** Ohne ⚡ sind Teal/Rot Familienfarben (Gewinnstrang/Kosten), die Legende sagt
  aber „günstige/ungünstige Δ"; mit ⚡ bedeuten sie Bewertung, bei Markierung „markiert/gesamt".
  Vorschlag: Legende je Zustand — „grau Umsatz · teal Ergebnisstrang · rot Kosten" / „günstig ·
  ungünstig" / „markiert · gesamt"; PY/FC/Δ-Achsen-Hinweise nur zeigen, wenn im Bild vorhanden.
- **⚡-Labels im Sankey zeigen kein Δ:** Farbe zeigt Richtung, Labels weiter AC und % vom Umsatz;
  Vorschlag: bei ⚡ Δ und Δ% im Label (oder Tooltip-Zeile prominenter).
- **Markierte Bänder** (Cross-Highlight) teils 1 px dünn, markierte Zuflüsse dunkelgrau auf hellgrau —
  Mindestbreite und Kontrast prüfen.
- **Ein-Kind-Knoten** (Finanzergebnis → Zinsaufwand) bekommt eine eigene Spalte → langes Band ohne
  Information; Vorschlag: Ketten mit einem Kind zusammenziehen.
- **Bänder laufen durch Labels** (Abschreibungen Sudhaus/Anlagen) — Label-Reserve je Spalte.
- **Alternativ-Idee:** ohne ⚡ Kosten neutral (grau) und nur den Gewinnstrang betonen, damit Teal/Rot
  der Bewertung vorbehalten bleiben (IBCS-näher).

## Mega-Table · Kleinigkeiten (Review Data-Viz, 29.10.2026)
- **T04B-Preset:** zwei Dezimalen in TEUR („7 536,00") täuschen Genauigkeit vor — Preset auf 0/1 prüfen.
- **ΔPL-Balken vs. ΔPL%-Pins:** Balken nach Ergebniswirkung, Pins nach Kontovorzeichen → bei Malz
  zeigen Balken und Pin in verschiedene Richtungen; Konsistenz klären.
- **„−0,7 pp"** der Margenzeile steht links neben der Achse verloren.
- **T05B:** Legende „günstig/ungünstig" wird im Cashflow-Template nicht genutzt; ΔPY nur als Zahl
  (anders als T04B); Monatsblock auf gemeinsamer Skala fast unsichtbar.

## ⚡ Nur Ausnahmen (Review Controlling, 29.10.2026)
- **„übrige (n)" saldiert** gegenläufige Schritte (88 TEUR Mehrkosten gegen 37 TEUR Ersparnis =
  +51). Vorschlag: Sammelschritt wahlweise getrennt nach Vorzeichen („übrige +" / „übrige −") oder
  Tooltip mit Einzelposten.
- **Mechanische Ausnahmen** (Steuern folgen dem Ergebnis, mengengetriebene Kosten): Option, Zeilen
  per Token von der Ausnahmenprüfung auszunehmen (z. B. `noexception`).

## Funktional (Review Controlling / CFO, 29.10.2026)
- Abstimmungs-Hinweis (Σ-treue Rundung) sichtbar machen; Excel-Export mit Hierarchie prüfen.
- Monatsspalte des Abschlussmonats neben YTD in T04B-Preset anbieten.
- Cashflow-Demo (`demoData/cashflow-*.csv`) auf die GuV-Demo abstimmen (JÜ 1 246, AfA 1 127).
- Zertifizierung → Service-Export (PDF/PPT/Abo): liegt organisatorisch bei Artur.
