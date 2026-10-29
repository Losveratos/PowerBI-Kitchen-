# P&L Statement byDatenWG · Arbeitsregeln für Claude-Sessions

## Branch- und Versions-Disziplin (wichtigste Regel)

- **Jede neue Entwicklungsrunde startet von origin/main:**
  `git fetch origin main && git checkout -B <feature-branch> origin/main`.
  Nie auf einem alten Feature-Branch weiterbauen, ohne vorher origin/main hineinzumergen.
- Hintergrund: Im Oktober 2026 liefen zwei Linien parallel (0.17 → 0.18 und 0.17 → 1.5 aus
  verschiedenen Sessions). Die Features der 0.18-Linie (Sankey, Ansichten anbieten) mussten von Hand
  auf die 1.5-Basis portiert werden (Release 1.6.0.0), danach wurde die alte Linie nachträglich
  zusammengeführt. Das darf nicht wieder passieren.
- **Versionsnummer** ist vierteilig (Major.Minor.Patch.Build). Vor dem Bump immer
  `git show origin/main:pnlByDatenWG/pbiviz.json` prüfen: die neue Version ist mains aktuelle
  +1 Minor (Feature) bzw. +1 Patch (Fix). Die Version steht an drei Stellen: `pbiviz.json` (zweimal)
  und `package.json`.
- **dist/** enthält genau eine `.pbiviz` (die aktuelle) plus `dist/package.json`; alte Pakete beim
  Paketieren löschen.

## Pipeline vor jedem Merge nach main (alles Pflicht, in `pnlByDatenWG/`)

`npx tsc --noEmit` (keine Fehler in `src/`) · `npm run lint` · `npm run test:engine` ·
`npm run test:render` · `npm run test:tree` · `npm run test:perf` (Budgets einhalten) ·
`npm run package` · Eintrag in `CHANGELOG.md` (deutsch, neueste Version oben).

Berührt die Änderung weitere Bereiche, laufen die passenden Suiten mit (z. B. `test:toolbar`,
`test:mega`, `test:hub`, `test:i18n`); der Gesamtlauf ist `npm test`.

## Merge-Regeln

- Nach main nur mit ausdrücklicher Freigabe des Nutzers pushen.
- Bei Konflikten ist mains Stand die Basis; eigene Features gezielt darauf re-applizieren. Nie
  main-Funktionalität verwerfen. Bei nicht auflösbaren Widersprüchen abbrechen und den Nutzer fragen.
- Download-Links auf den Website-Seiten im Repo-Root (`pnl-schnellstart*.html`,
  `pnl-beta-post*.html`) beim Versionswechsel auf den neuen dist-Dateinamen aktualisieren.

## Konventionen im Code

- **i18n:** Texte im Visual über `this.tr("UI_…")`; jeder Schlüssel steht in allen vier
  `stringResources/<locale>/resources.resjson` (de-DE, en-US, es-ES, ja-JP) und als englischer
  Fallback in `src/i18n.ts` (`test/i18n-test.js` hält beides gleich). Format-Pane-Texte über
  `displayNameKey`/`descriptionKey` in denselben resjson-Dateien.
- `ValidatorType` als numerische Literale (`{ type: 0 /* ValidatorType.Min */ … }`).
- `uiState` nur additiv erweitern (Muster `persistUi`/`pendingPersist`); das `treeV`-Migrations-Gate
  nicht anfassen.
- eslint `powerbi-visuals`: kein `innerHTML`, kein non-literal `require`; `getBBox` nur am
  angehängten SVG.
- Playwright in Tests: `require("playwright")` mit Fallback
  `/opt/node22/lib/node_modules/playwright`, `chromium.launch()` ohne `executablePath`.
