# Projekt-Status · ChartKitchen byDatenWG

_Stand: 2026-07-20 · Übergabe-Notiz, damit eine neue Session/Person sofort anknüpfen kann._

## Was ist das
Ein Power-BI-Custom-Visual „ChartKitchen byDatenWG" — ein Visual mit 13 Diagramm-Modi
(inspiriert von den IBCS-Prinzipien). Geschäftsmodell: **kostenlos, Open Source (MIT),
für immer frei; Umsatz über Beratung.** Aktuell **offene Beta**, noch nicht im AppSource.

- **Version:** 1.40.0.0 (1.39 Politur-Paket + 1.40 AC+FC-Splitsäule, 05.08.) · API 5.11.0 · GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D`
- **Repo/Branch:** Arbeitsbranch `claude/inspired-ibcs-power-bi-visual-h04y05`, deckungsgleich mit `main`
- **Website:** datenwgknowledgekitchen.com (GitHub Pages von `main`, Build ~3 min)
- **Kontakt:** Michael Tenner · michael.tenner84@gmail.com

## Repo-Layout (das Wichtigste)
- `ibcsInspiredChartDeck/` — der Visual-Quellcode (`src/visual.ts`, `src/settings.ts`,
  `capabilities.json`), `dist/*.pbiviz` (aktueller Build), `test/test.html` (Harness,
  ~115 Cases), `CHANGELOG.md`, `BACKLOG.md`, **`AUDIT-2026-07.md`** (Juli-Audit-Bericht).
- `cert-export/` — Einreichungs-Repo (bei jedem Release mit expliziter Dateiliste synchron gehalten).
- `chartkitchen-doku.html` / `_en.html` + `.pdf` — Endnutzer-Doku (DE/EN).
- `chartkitchen-schnellstart.html` / `_en.html` — Schnellstart-/Landing-Seite (mit Beta-Gate).
- `doku-assets/` — Renders, echte PBI-Screenshots (`pbi/`), Formatbereich-Schemas (`pane/`).
- `.claude/skills/chartkitchen-report/` — Skill v1 (Report-Bau mit dem Visual, prepare+plan).
- `tools/encrypt-build.mjs`, `downloads/.gitkeep` — Beta-Download-Gate (siehe unten).

## Was ist live / erledigt
- **Visual** bis 1.38.0.0 — alle High/Medium-Funde des Juli-Audits behoben, Politur-Paket
  (Low-Funde) erledigt, horizontales Matrix-Scrollen, Bedienkomfort- und Breite-Pakete,
  Kommentar-Schriftgröße, Matrix-Werte-Spalten, 4 Sprachen (DE/EN/ES/JA), Tooltips lokalisiert.
- **Doku** DE+EN (HTML+PDF) mit 13-Modi-Galerie, echten PBI-Screenshots, 84-Settings-Referenz
  (aus dem Code generiert) inkl. Formatbereich-Schemas, FAQ.
- **Schnellstart-Seite** DE+EN mit Deep-Links in die Doku + Beta-Disclaimer.
- **Skill `chartkitchen-report` v1** — Befragung (Zweck/Seiten/Detailtiefe/Navigation/…),
  drei Blaupausen (Monitoring · Monatsreport · Sales-Analyse), Feld-Vertrag aus capabilities.json,
  PBIR-Einsetzung über den „Referenz-Instanz"-Trick. **prepare+plan** (schreibt nicht ungefragt).

## Offene Punkte (nach Priorität)
1. ~~Beta-Download-Gate scharfschalten~~ — **ERLEDIGT anders (05.08.2026):**
   Michael hat sich gegen das Passwort-Gate entschieden (Build ist ohnehin öffentlich
   auf GitHub). Stattdessen **Direkt-Download live** auf beiden Schnellstart-Seiten:
   stabiler Link `downloads/chartkitchen-byDatenWG-latest.pbiviz` + `downloads/latest.json`
   (Seiten lesen Version/Datum daraus). Gate-Markup/-Skript entfernt; `tools/encrypt-build.mjs`
   bleibt im Repo, falls je ein nicht-öffentlicher Build nötig wird.
   Ablauf je Release: siehe `RELEASE-SLOT`-Kommentar in den Schnellstart-Seiten
   bzw. Ship-Konvention unten.
2. **AppSource-Listing** — der eigentliche Reichweiten-Blocker (viele Tenants erlauben nur
   AppSource-Visuals). Wartet auf ein **Partner-Center-Konto** (Partner). Kit unter
   `cert-export/appsource/`.
3. **Skill v1 real testen** — gegen eine echte PBIP noch nicht end-to-end validiert
   (kein Desktop hier). Erster echter Lauf: leeren Report + Visual einmal platziert + als PBIP
   speichern → Pfad geben → Skill härten (v1→v2).
4. **Sample-PBIX** für AppSource — baut Michael nebenher beim Testen.
5. **Microsoft-Zertifizierung** — Code ist zertifizierungsreif (Security-Scan sauber: keine
   externen Calls/eval/innerHTML/Storage, System-Fonts, offizielle Deps, eslint powerbi-visuals
   grün). Voraussetzung: AppSource-Listing zuerst.
6. **Optional:** IBCS-Compliance-Gaps (~28 überwiegend kleine Abweichungen, dokumentiert in
   `ibcsInspiredChartDeck/AUDIT-2026-07.md`, Kap. 5) · echte Formatbereich-Screenshots statt
   Schemas · Backlog-Features (BACKLOG.md) · IBCS-Software-Zertifizierung (Geschäftsentscheidung).

## Launch-Assets (LinkedIn) — NICHT im Repo
Die Launch-Videos + Captions liegen nur session-temporär im Scratchpad und sind **Michael
per Chat geliefert** (nicht versioniert, da Marketing):
`chartkitchen-show-v2.mp4` (DE) · `chartkitchen-show-en.mp4` (EN) · Poster + Captions (je A/B).
Der Wettbewerbs-Teardown (`competitive-teardown.md`) ist ebenfalls nur lokal bei Michael
(bewusst nicht im Repo, da Wettbewerber-Preise/-Vergleich).

## Ship-Konvention (für den nächsten Release)
Version an beiden Stellen in `pbiviz.json` bumpen → `npx pbiviz package` → alte `dist/*.pbiviz`
löschen → `.claude/skills/deploy-to-powerbi/catalog.json` Pfad aktualisieren → CHANGELOG-Eintrag
oben → `cert-export/` mit expliziter Dateiliste synchronisieren (NIE die englische cert-export
README überschreiben) → **Website-Download aktualisieren**: Build nach
`downloads/chartkitchen-byDatenWG-latest.pbiviz` kopieren + `downloads/latest.json`
(version/date) schreiben → bei neuen/geänderten Settings auch
`ibcsInspiredChartDeck/AGENT-GUIDE.md` nachziehen (Version + Settings-Tabelle) →
Commit → `main` pushen (Pages deployt den Download mit) →
**Share-Repo** `Losveratos/Power-BI-Custom-Visuals-byDatenWG`: neue .pbiviz nach
`chartkitchen/`, alte ersetzen, README-Versionstabelle nachziehen. Details/Historie: CHANGELOG.md.

## Nächste Session — so anknüpfen
Repo + diese `STATUS.md` lesen, offene Punkte oben. Der Download ist live und versorgt sich
über `downloads/latest.json` selbst. Für den Skill-Test eine kleine Beispiel-PBIP mit
geladenem Visual.
