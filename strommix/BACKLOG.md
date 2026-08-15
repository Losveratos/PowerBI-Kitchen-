# Strommix-Projekt · Backlog

> Priorisierung: **P1** = nächster Arbeitsschritt · **P2** = danach ·
> **P3** = Ideen/optional. Erledigtes wandert mit Datum nach unten.

## P1 — in Arbeit / als Nächstes

- [ ] **Paper-Struktur v0.10:** Executive Summary ganz oben (Kernaussagen +
  „Was kann ich hier tun"), durchnummerierte Kapitel wie in einem Paper
  (Abstract → Einleitung → Methodik → Ergebnisse → Diskussion → Limitationen →
  Anhang), Inhaltsverzeichnis mit Sprungmarken, sticky Kapitel-Navigation
- [ ] **Monte-Carlo-Simulation:** Parameterunsicherheit (CAPEX, Opex, VLh, WACC)
  je Technologie als Verteilung statt Punktwert; N Ziehungen → LSCOE-Verteilung
  je Szenario (P5/P50/P95, Histogramm/Fächer statt Einzelbalken). Optionaler
  Toggle „empirische Kostenüberschreitung" (Flyvbjerg/Sovacool-Multiplikatoren).
  Python-Referenz mit festem Seed + JS-Port mit Paritätstest wie beim Grundmodell
- [ ] **Volljahres-Stundendaten 2024** (blockiert durch Sandbox-Netzwerk):
  Netzfreigabe für api.energy-charts.info ODER manueller SMARD-Export von
  Michael. Wichtigster Einzelhebel für die Belastbarkeit der Dispatch-Zahlen
  (H₂-Saisonspeicher!). Pipeline nimmt Volljahr ohne Codeänderung an

## P2 — nach Abnahme v0.10

- [ ] **Volltext-Verifikation** der B-/C-Quellen an den Primärdokumenten
  (Checklisten liegen in jedem Dossier; braucht Netzzugriff)
- [ ] **Politur-Runde:** die 21 kleinen Befunde aus `research/review_v09.md`
- [ ] **Wind-offshore-Profil** ergänzen (aktuell Onshore-Form als markierte
  Übergangslösung — glättet Offshore-Einspeisung zu wenig)
- [ ] **Verlinkung von index.html** auf das Paper (nach Abnahme durch Michael)
- [ ] **Merge auf main** → GitHub Pages live

## P3 — Ideen / spätere Ausbaustufen

- [ ] **EN-Version** (auf Zuruf — Erinnerung an Michael, sobald DE final)
- [ ] **Wetterjahr-Sensitivität:** Dispatch mit weiteren Wetterjahren
  (z. B. 2010 als schlechtes Windjahr) statt nur 2024
- [ ] **Import/Export & DSM** als optionale Modellbausteine (aktuell bewusst
  konservativ weggelassen, im Paper als Limitation ausgewiesen)
- [ ] **Szenario-Teilen per URL:** Slider-Stellungen in URL-Hash kodieren,
  damit Leser konkrete Einstellungen verlinken können
- [ ] **GES-Autoren kontaktieren** für die exakte Kostenaufschlüsselung je
  Szenario (Anhang liegt nur als Grafik vor)
- [ ] **Weitere Vergleichsstudien** gegenlesen (Ariadne/PIK, Agora, dena) und
  als Vergleichslinien einbauen
- [ ] **LinkedIn-Begleitpost** aus dem Executive Summary ableiten

## Erledigt

- [x] 2026-08-15 · Phase 0–5: Setup, 5 Recherche-Dossiers, Parametersatz,
  validiertes Modell (LCOE/Mix/Dispatch), White Paper v0.9, adversarialer
  Review (3 kritisch + 15 mittel behoben), Standalone-Build für Tests
