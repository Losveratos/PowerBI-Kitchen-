# Strommix-Projekt · Backlog

> Priorisierung: **P1** = nächster Arbeitsschritt · **P2** = danach ·
> **P3** = Ideen/optional. Erledigtes wandert mit Datum nach unten.

## P1 — in Arbeit / als Nächstes

- [ ] **Volljahres-Stundendaten 2024** (blockiert durch Sandbox-Netzwerk):
  Netzfreigabe für api.energy-charts.info ODER manueller SMARD-Export von
  Michael. Wichtigster Einzelhebel für die Belastbarkeit der Dispatch-Zahlen
  (H₂-Saisonspeicher!). Pipeline nimmt Volljahr ohne Codeänderung an

## P2 — nach Abnahme v0.10

- [ ] **Story-Review durch Michael** (`strommix-story.html`, v0.1 Entwurf): Dramaturgie,
  Tonfall, Kartenlänge, Reihenfolge der Akte. Zahlen nur über
  `research/story_claims_check.md` → `scripts/build_story_data.py` ändern
- [ ] **Story-Feinschliff**: Gegenpositions-Kästen gleichmäßiger über die Akte verteilen;
  Lesbarkeit der 13-Zeilen-Punktwolke (Akt 2) unter 360 px prüfen; ggf. Kapitel-Sprungmarken
  oder Fortschrittsanzeige ergänzen (bewusst weggelassen, wie im Rhein-Original)
- [ ] **EN-Version der Story** erst nach DE-Freigabe (gemeinsam mit der Whitepaper-EN-Version)

- [ ] **Restliche KLEIN-Befunde** aus `research/review_v09.md` (C1, C12–C14,
  C16–C18, C20, C21) — bei v0.10 wurden C2, C3, C7, C9, C10, C15 und C19
  nebenbei mitbehoben, ebenso die hartcodierten CRF-Werte im HTML

- [ ] **Volltext-Verifikation** der B-/C-Quellen an den Primärdokumenten
  (Checklisten liegen in jedem Dossier; braucht Netzzugriff)
- [ ] **Politur-Runde:** die 21 kleinen Befunde aus `research/review_v09.md`
- [ ] **Wind-offshore-Profil** ergänzen (aktuell Onshore-Form als markierte
  Übergangslösung — glättet Offshore-Einspeisung zu wenig)

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

- [x] 2026-08-19 · **Live in der Kitchen (Merge auf main + Verlinkung):**
  Branch `claude/strohmix-analysis-whitepaper-0rkhas` konfliktfrei nach `main`
  gemerged (`--no-ff`), GitHub Pages liefert damit `strommix-story.html` und
  `whitepaper-strommix.html` von `datenwgknowledgekitchen.com`.
  Startseite: zwei neue Kacheln unter *Posts & Talks* (`index.html` **und**
  `daten_wg_learn_buckets.html`), neue Filter-Chips **„Visual Story"** (`story`)
  und **„White Paper"** (`whitepaper`); die Rhein-Story hat das `story`-Tag
  ebenfalls bekommen. Querverlinkung ist jetzt beidseitig: das White Paper zeigt
  im Hero und in der Fußleiste auf die Story (Story → Paper gab es schon).
  QA lokal über `http.server` mit Chromium: index + beide Seiten ohne JS-Fehler,
  Kachel-Klicks und beide Chips getestet.
  **Nachtrag Pages-Build:** Der erste Build nach dem Merge ist an einem
  unvollständigen Frontmatter-Datum (`date: "2026-08"`) in
  `docs/01_grundlage_ges_faktencheck.md` / `docs/03_grundlage_erweitert_v2.md`
  gescheitert und hat damit die ganze Seite blockiert. Datum korrigiert **und**
  `_config.yml` ergänzt, das die Arbeitsdokumente unter `strommix/` vom
  Jekyll-Build ausnimmt (`strommix/data/` bleibt drin — beide Seiten laden von
  dort per `fetch()`). Pages-Build danach grün.

- [x] 2026-08-19 · **Freigabe-Dossier + Scrollytelling-Story:**
  `research/story_claims_check.md` (7 bestätigt, 11 korrigiert, 4 verworfen, 6 Setzungen,
  3 unverifizierbar, maschinenlesbarer `story_data`-Freigabeblock),
  `scripts/build_story_data.py` → `data/story_data.json` (44 Quellen, deterministisch),
  `/strommix-story.html` (5 Akte × 4 Schritte, ein IntersectionObserver, Inline-SVG-Charts,
  Selbstkritik-Kapitel, Glossar, Quellen mit Konfidenz-Badges, Backup-Block zum White Paper).
  Playwright-QA: alle 20 data-step-Übergänge feuern, 0 Konsolenfehler, kein Overflow bei
  1280/390 px, verworfene Zahlen per grep ausgeschlossen

- [x] 2026-08-15 · **Paper-Struktur v0.10:** Executive Summary (7 Kernaussagen
  mit Quelle und Unsicherheitsangabe) + Kasten „So nutzt du diese Seite",
  durchnummerierte Kapitel 1–9 plus Anhang, Inhaltsverzeichnis mit
  Ein-Zeilen-Beschreibungen, sticky Kapitel-Navigation (mobil einklappbar,
  aktives Kapitel hervorgehoben). Neues Kapitel 3 „Methodik" bündelt das
  Drei-Ebenen-Modell, die Validierung (±0,04 %) und die Konfidenzstufen
- [x] 2026-08-15 · **Monte-Carlo-Simulation** (neues Kapitel 6):
  `scripts/monte_carlo.py` → `data/monte_carlo_reference.json` (mulberry32,
  Seed 20260815, N = 1000, Dreiecksverteilung aus min/mid/max, 23 gezogene
  Parameter), JS-Port mit identischer Ziehungsfolge, Paritätstest der P50-Werte
  im Selbsttest-Badge (23 Testvektoren + 25 MC-Perzentile), Violin-Chart je
  Preset mit P5/P25/P50/P75/P95, Vergleichstabelle, Toggles für WACC-Unsicherheit
  und empirische Kostenüberschreitung
- [x] 2026-08-15 · Phase 0–5: Setup, 5 Recherche-Dossiers, Parametersatz,
  validiertes Modell (LCOE/Mix/Dispatch), White Paper v0.9, adversarialer
  Review (3 kritisch + 15 mittel behoben), Standalone-Build für Tests
