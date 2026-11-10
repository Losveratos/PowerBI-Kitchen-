# Projekt-Status · PowerBI-Kitchen

_Stand: 2026-10-23 · Übergabe-Notiz, damit eine neue Session/Person sofort anknüpfen kann._

## Was ist das

Monorepo für die Website **datenwgknowledgekitchen.com** (GitHub Pages von `main`)
und die Power-BI-Custom-Visuals **byDatenWG**. Geschäftsmodell: kostenlos, Open
Source (ChartKitchen Apache-2.0, P&L/Gantt MIT), für immer frei; Umsatz über Beratung. AppSource-Listing in
Vorbereitung (hängt organisatorisch, technisch ready). Die Visuals sind
**IBCS-inspiriert**, bewusst nicht IBCS-zertifiziert.

- **Kontakt:** Michael Tenner · michael.tenner84@gmail.com
- **Arbeitsbranch der Claude-Sessions:** `claude/chartkitchen-weiterentwicklung-puk00i`
  (wird nach jedem Squash-Merge auf `origin/main` zurückgesetzt)
- **Schwester-Repo (nur Downloads):** `Losveratos/power-bi-custom-visuals-bydatenwg`

## Die Produkte (Stand 23.10.2026)

| Produkt | Version | Ordner | Hinweise |
| --- | --- | --- | --- |
| ChartKitchen byDatenWG | 1.53.0.0 | `ibcsInspiredChartDeck/` | 13 Chart-Modi, Start-Hub, IBCS-Vorlagen C01–C13, 4 Sprachen. GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D` |
| P&L Statement byDatenWG | 1.7.1.0 | `pnlByDatenWG/` | Mega-Table (Templates T01A–12H), Treiberbaum, Sankey, Bilanz/Cashflow (Bestandsgrößen), ⚡ Nur Ausnahmen, Start-Hub, IBCS-2.0-Skalierung. GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358` |
| dataKitchenGantt | 2.3.1.0 | `dataKitchenGantt/` | Gruppenzeilen-Klick überall, skalierungs-fest (Version laut pbiviz.json, Stand 11/2026) |
| MockupKitchen | — | `mockup-kitchen.html` | Browser-Tool, Export für den Skill `mockup-to-powerbi` |

## Release-Konvention (Kurzform)

Je Visual-Release: Version in `pbiviz.json` (2×) → `npm run package` → alte dist
raus → `downloads/` (CK: `chartkitchen-byDatenWG-latest.pbiviz` + `latest.json`)
→ CHANGELOG oben → Doku + Schnellstart DE/EN Versions-Flip → AGENT-GUIDE-Stand (`npm run guide`)
→ CK zusätzlich: `cert-export/`-Sync (feste Dateiliste, README nie) und
`.claude/skills/deploy-to-powerbi/catalog.json` → Commit → PR → Squash-Merge →
Pages-Workflow prüfen → Schwester-Repo nachziehen. Details: AGENT-GUIDE im
jeweiligen Visual-Ordner.

## Gerade in Arbeit / offen

- **Talk „One Model, Three Visual Stacks"** (Budapest BI Forum, 17.11.2026):
  fertiges Demo-Repo-Staging unter `talk-repo-staging/` auf dem Arbeitsbranch —
  wartet darauf, dass das GitHub-Repo `one-model-three-stacks` angelegt wird;
  danach dorthin pushen und Fabric-Workspace per Git-Integration verbinden.
- **Wohlstandsatlas** (`wohlstandsatlas.html`, neu 11/2026, Spielwiese): Weltkarte zu BIP pro Kopf,
  Kaufkraft, Haushalten, Gini und Dichte für 217 Länder und rund 6.000 Regionen auf vier Ebenen.
  `wohlstandsatlas.html`, `wohlstandsatlas/atlas-data.js` (Karten + Daten, ~5 MB) und
  `wohlstandsatlas/wohlstandsatlas-einheiten.csv` sind **generiert** – nicht von Hand ändern.
  Die Datenpipeline (Merge der Länder- und Regionalstatistiken, Validierung, Build) liegt noch
  außerhalb des Repos; offen: Pipeline ins Repo holen, Zeitreihen für Regionen.
  Bibliotheken lokal: `assets/js/vendor/d3-7.9.0.min.js`, `topojson-client-3.1.0.min.js`.
  **Erweiterungen von Hand (11/2026), beim nächsten Generator-Lauf übernehmen:** (1) im `<head>` vier Zeilen
  `og:image` (+ Breite, Höhe) und `twitter:card` für `assets/og/wohlstandsatlas.png`; (2) nach
  `<script src="wohlstandsatlas/atlas-data.js">` und **vor** dem Inline-Skript die Zeile
  `<script src="wohlstandsatlas/atlas-extras.js"></script>`; (3) in `update()` `!!(metric.countryOnly&&i>0)` statt
  `metric.countryOnly&&i>0` (sonst bleiben die Ebenen-Chips nach BNE/Gini gesperrt); (4) am Ende des `<style>`-Blocks
  die Regel `.wx-loading{…}#map[style]~.wx-loading{display:none}` und (5) direkt nach `<canvas id="map" …>` die Zeile
  `<div class="wx-loading" role="status">Karte wird geladen …</div>` (Ladehinweis, verschwindet ohne JavaScript-Hilfe,
  sobald die Karte bemessen ist).
  `wohlstandsatlas/atlas-extras.js` ist **handgepflegt** (nicht generiert) und dockt an die Funktionen des Inline-Skripts
  an: Zoom-Deep-Link `--z1`, „Link kopieren“, Block „Gleichauf auf anderen Kontinenten“ in der Profilkarte, Geschichte
  „Zwei Heimaten“, Link „In der Story vergleichen“ (`zwei-heimaten.html#vs=<ID>`), eindeutige Suchvorschläge
  „Name (Art, Land)“, Zeile „Weiterlesen“, Taste „/“ für die Suche; seit der zweiten Runde außerdem das Breitbild-Layout
  (ab 1500 px Karte und Profilkarte nebeneinander, Chip-Zeilen brechen um), auf dem Handy der einklappbare Erklärtext
  und die Zeile „Auswahl · Name · Wert · Details ↓“ unter der Karte, Karten-Labels ohne Ausreißer (`hot`) samt Zusatz in
  der Legende, sauberer Zustand bei Hash-Wechsel. Fehlt eine erwartete Funktion, überspringt die Datei das jeweilige
  Feature mit einer Konsolenwarnung. Dritte Runde (nach zwei Fachgutachten, keine neue Handänderung am HTML):
  Block heißt „Ähnlich auf anderen Kontinenten“ und nennt die Unsicherheit der Hochrechnung (je Kontinent die
  bevölkerungsreichste Einheit innerhalb von ±5 %); fünf Kennzahlen vorn, der Rest hinter „Weitere Kennzahlen“;
  Suche im Seitenkopf; Farbstufen richtig als Siebtel beschriftet; Hinweis „Rang zählt Einheiten, Anteil zählt
  Menschen“; Geschichte „Wenn BIP täuscht“ führt in drei Schritten; Geschichten-Kasten im Breitbild neben der Karte;
  Warnhinweis bei Regionen der Ukraine (Verteilung von 2021). Offen für den Generator: Der Median in der Überschrift
  („15.200 Int.$“) teilt nur durch die Menschen mit Daten, die Story durch die ganze Weltbevölkerung (15.265).
- **Zwei Heimaten** (`zwei-heimaten.html`, Datenstory aus dem Atlas): generiert aus `wohlstand-story/` (Pipeline und
  Bausteine im dortigen README). Vorschaubilder fürs Teilen: `tools/og-cards/build.js` → `assets/og/`.
- **AppSource:** Einreichung liegt bei Artur (organisatorisch).
- **Branch-Hygiene:** `kitchen-refresh-data` gehört dem Refresh-Workflow und
  bleibt. Einziger Branch mit bewusst ungemergter Arbeit:
  `claude/mock-upkitche-rayfin-chartkitchen-roqocc` (dwg-Host-Adapter/
  Fabric-Apps-Spike, Archiv). Alles andere ist gemergt oder zur Löschung
  freigegeben.

## Nützliche Einstiege

- `CLAUDE.md` — Projekt-Instruktionen (inkl. Design-System: selbst gehostete
  Fonts, keine Dritt-CDNs, Klick-zum-Laden für Embeds)
- `ibcsInspiredChartDeck/AGENT-GUIDE.md` / `pnlByDatenWG/AGENT-GUIDE.md` —
  Property-Referenzen, bekannte Fallen, Testlandschaft
- `pnlByDatenWG/SPEC-MEGATABLE.md` + `TEMPLATE-GUIDE.md` — Mega-Table-Spezifikation
- `.claude/skills/` — finance-data-model, chartkitchen-report, pnl-report,
  deploy-to-powerbi, mockup-to-powerbi, kitchen-update, powerbi-design-framework
