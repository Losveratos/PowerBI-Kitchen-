# Daten-WG · Knowledge Kitchen & Power-BI-Visuals

Das Repo hinter **[datenwgknowledgekitchen.com](https://www.datenwgknowledgekitchen.com)**
(GitHub Pages von `main`) — und zugleich die Quelle der Power-BI-Custom-Visuals
**byDatenWG**. Autor: Michael Tenner · Daten-WG.

## Was hier liegt

| Bereich | Ordner/Dateien | Kurz |
| --- | --- | --- |
| **ChartKitchen byDatenWG** | `ibcsInspiredChartDeck/` | Custom Visual mit 13 IBCS-inspirierten Chart-Modi (Säulen, Balken, Linien, Waterfall/Brücke, GuV, Tabelle/Matrix, KPI-Karten, Scatter/Bubble …). Quellcode, Tests, `dist/*.pbiviz`, CHANGELOG |
| **P&L Statement byDatenWG** | `pnlByDatenWG/` | Custom Visual für GuV/P&L: Mega-Table mit IBCS-Templates T01A–12H, Treiberbaum, klassische Tabelle |
| **dataKitchenGantt** | `dataKitchenGantt/` | Custom Visual: Gantt-/Projektplan |
| **MockupKitchen & Co** | `mockup-kitchen.html`, `business-chart-builder.html` | Browser-Werkzeuge: Report-Mockups skizzieren, Deneb/Vega-Charts bauen |
| **Downloads** | `downloads/` | Immer die aktuelle ChartKitchen-.pbiviz (`chartkitchen-byDatenWG-latest.pbiviz` + `latest.json`); P&L-Download zeigt auf `pnlByDatenWG/dist/` |
| **Doku-Seiten** | `chartkitchen-doku.html`, `pnl-doku.html` (+ `_en`, Schnellstarts) | Endnutzer-Doku der Visuals, DE/EN |
| **Knowledge Kitchen** | `daten_wg_learn_buckets.html` (= `index.html`-Kern), `scripts/`, `videos.json`, `transcripts.json` | Alle Daten-WG-YouTube-Folgen in 9 Themen-Buckets, Volltextsuche, Kapitel |
| **Stories & Posts** | `*-story.html`, `*-post.html`, `blog/`, `md/` | Daten-Stories (Kölner Raser, Rhein, Strommix, …), Blog-/LinkedIn-Begleittexte, Markdown-Spiegel der Seiten |
| **Skills** | `.claude/skills/` | Claude-Code-Skills: Reports mit den Visuals bauen, Finance-Datenmodell, Deneb-Deploy, Mockup-Umsetzung, Kitchen-Update |
| **Einreichung** | `cert-export/` | AppSource-Einreichungsstand von ChartKitchen (wird je Release synchron gehalten) |
| **Sonstiges** | `assets/` (selbst gehostete Fonts, JS-Vendor), `tests/`, `tools/`, `whitepaper-*`, `wissensgraph/` | Design-System, Playwright-Tests, Social-Media-Vorlagen, Whitepaper |

Schwester-Repo für die Visual-Downloads:
[Losveratos/power-bi-custom-visuals-bydatenwg](https://github.com/Losveratos/power-bi-custom-visuals-bydatenwg).

## Live-Version

→ **https://www.datenwgknowledgekitchen.com** (GitHub Pages, Build ~1–3 min nach Push auf `main`)

Lokal: `python -m http.server 8000` → http://localhost:8000/

## Visuals bauen

```
cd ibcsInspiredChartDeck   # oder pnlByDatenWG / dataKitchenGantt
npm install
npm run package            # erzeugt dist/<GUID>.<version>.pbiviz
npm test                   # pnlByDatenWG; ChartKitchen: npm run test:render / test:scale / test:notation
```

Release-Ablauf (Version, Changelog, Downloads, Doku, cert-export): siehe
`ibcsInspiredChartDeck/AGENT-GUIDE.md` bzw. `pnlByDatenWG/AGENT-GUIDE.md`.

## Kitchen-Daten aktualisieren (YouTube-Folgen)

```
python scripts/fetch_videos.py    # holt nur neue Videos (Cache greift)
python scripts/classify.py        # klassifiziert in Buckets, extrahiert Kapitel
node   scripts/extract_existing.js
python scripts/build_html.py      # mergt, schreibt HTML + index.html
node   scripts/validate_html.js   # Sanity-Check
```

Pipeline-Details (Heuristiken, Bucket-Reihenfolge, Fallstricke): [PowerBIhub.md](PowerBIhub.md).
Ein GitHub-Actions-Workflow (`kitchen-refresh.yml`) legt Daten-Refreshes auf dem
Branch `kitchen-refresh-data` ab — den Branch nicht löschen.

## Prüfungen

```
node scripts/validate_html.js      # Kitchen-Seite: EPISODES, Buckets, ytId-Duplikate
node tests/run-all.js              # Visual-Standards-Rechner: Playwright-Regressionen
```

## Was wird NICHT versioniert

Siehe [.gitignore](.gitignore): yt-dlp-Caches (`videos_*.json`), Build-Zwischenstände,
lokale Backups, `node_modules`.

## Lizenz

Der Code in diesem Repository (inkl. der Power-BI-Custom-Visuals) steht unter der
[MIT-Lizenz](LICENSE): Nutzung, Änderung und Weitergabe sind frei — auch kommerziell —,
solange der Autor-/Copyright-Hinweis (© Michael Tenner · PowerBI Kitchen) erhalten bleibt.
Video-Inhalte gehören dem Daten-WG-Kanal. Die Visuals sind **IBCS-inspiriert**,
nicht IBCS-zertifiziert; IBCS® ist eine Marke der IBCS Association.
