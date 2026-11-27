# Projekt-Status · PowerBI-Kitchen

_Stand: 2026-11-25 · Übergabe-Notiz, damit eine neue Session/Person sofort anknüpfen kann._

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

## Die Produkte (Stand 25.11.2026)

| Produkt | Version | Ordner | Hinweise |
| --- | --- | --- | --- |
| ChartKitchen byDatenWG | 1.58.0.0 | `ibcsInspiredChartDeck/` | 14 Chart-Modi, Start-Hub, IBCS-Vorlagen C01–C25 (ohne C11), Jahressäule, Szenarien im Stapel, Stapel-Struktur und -Blöcke, Marimekko, gestapelte Fläche, kumulierte Linie mit R12, Serienlinien mit Index, Scatter-Zeitpfad und Quotenstrahlen, Blasen mit Anteil, Differenzmarker, Portfolio-Blasen, Small Multiples gegen Ø mit großer Kachel und fester Spaltenzahl, 21 Feldrollen, 4 Sprachen. Alle 62 Referenzblätter der IBCS-Vorlagen lassen sich nachbauen (1.56/1.57 live seit 23.11.2026, PR #69). 1.58 (Welle 1 aus dem Template-Prüfstand): Pinköpfe in Szenario-Notation, Abweichungsachse der Tabelle nach Basis, Scatter und technische Paneltitel ohne Typ-Titel, gerundete Null `labels.roundedZero`, KPI-Karten mit festem Raster, „PY n.a.“ und „+n Δ“; Doku DE/EN mit Bildern. GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D` |
| P&L Statement byDatenWG | 1.8.5.0 | `pnlByDatenWG/` | Mega-Table (Templates T01A–12H inkl. T01C, T01D, T02D; Blatt-Optionen Ellipse, Margen-Δ% und Margen-Δ an der Achse, Notation wie im Referenzblatt; 1.8.4: Δ% n.a. bei Vorzeichenwechsel, Schwellen-Rot und ⚡ am gedruckten Wert, gekappte Pins mit Kopf, FY-Kopf nach 12G, flache Listen, Maximieren ohne Überlauf; 1.8.5: fixierter Spaltenkopf breiter Tabellen wieder über seinen Spalten), Gesamtzeile über mehrere Wurzeln, Sortierung nach Δ%, Treiberbaum mit ROI-Baum 11A, Sankey, Bilanz/Cashflow (Bestandsgrößen), ⚡ Nur Ausnahmen, Start-Hub, IBCS-2.0-Skalierung. GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358` |
| dataKitchenGantt | 2.3.1.0 | `dataKitchenGantt/` | Gruppenzeilen-Klick überall, skalierungs-fest (Version laut pbiviz.json, Stand 11/2026) |
| fabscan | 0.6.1 | `fabric-app-scanner/` | Governance-Prüfung für Fabric Apps und den Tenant (PR #56): Abruf auch ohne Admin-Rechte, Monitoring-Item, Lauf über den ganzen Tenant, Ausnahmen mit Begründung, Abdeckung im Bericht, weniger Fehlalarme. Skill-ZIP in `downloads/`, Roadmap in `fabric-app-scanner/recherche/` |
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

- **P&L Statement:** abgeschnittene Beschriftung „Jan“ in `test:render`, Fix in Arbeit (noch kein PR).
- **Release ChartKitchen 1.58.0.0 und P&L Statement 1.8.4.0:** auf `main` (PR #77, 536970c). Offen sind der
  Browser-Lauf ohne Netzwerk für 1.58/1.8.4, das Schwester-Repo und dwg/Showcase.
- **P&L Statement 1.8.5.0** (fixierter Spaltenkopf der klassischen Tabelle bei Tabellen breiter als die
  Kachel, Altfehler seit 0.13.1; Kopf folgt dem Zeilenfenster bei mehr als 300 Zeilen): Code, Tests, Paket,
  Downloads, Doku DE/EN und Paketprüfung der Sicherheitsseite in PR #80 (Branch
  `claude/pnl-185-floathead`), wartet auf den Merge. Danach Schwester-Repo und dwg/Showcase.
- **Showcase** (dwg-cli) auf ChartKitchen 1.58 und P&L 1.8.4 heben und deployen. Offen ist auch die Doku von
  dwg-cli (Visual-Versionen, Template-Katalog).
- **Talk „One Model, Three Visual Stacks"** (Budapest BI Forum, 17.11.2026):
  fertiges Demo-Repo-Staging unter `talk-repo-staging/` auf dem Arbeitsbranch —
  wartet darauf, dass das GitHub-Repo `one-model-three-stacks` angelegt wird;
  danach dorthin pushen und Fabric-Workspace per Git-Integration verbinden.
- **Wohlstandsatlas** (`wohlstandsatlas.html`, neu 11/2026, Spielwiese): Weltkarte zu BIP pro Kopf,
  Kaufkraft, Haushalten, Gini und Dichte für 217 Länder und rund 6.000 Regionen auf vier Ebenen.
  `wohlstandsatlas.html`, `wohlstandsatlas/atlas-data.js` (Karten + Daten, ~5 MB) und
  `wohlstandsatlas/wohlstandsatlas-einheiten.csv` sind **generiert** – nicht von Hand ändern.
  Die Datenpipeline (Merge der Länder- und Regionalstatistiken, Validierung, Build) liegt noch
  außerhalb des Repos; offen: Pipeline ins Repo holen, Full-HD-Layout, Zeitreihen für Regionen.
  Bibliotheken lokal: `assets/js/vendor/d3-7.9.0.min.js`, `topojson-client-3.1.0.min.js`.
- **AppSource:** Einreichung liegt bei Artur (organisatorisch).
- **Branch-Hygiene:** `kitchen-refresh-data` gehört dem Refresh-Workflow und
  bleibt. Einziger Branch mit bewusst ungemergter Arbeit:
  `claude/mock-upkitche-rayfin-chartkitchen-roqocc` (dwg-Host-Adapter/
  Fabric-Apps-Spike, Archiv). Alles andere ist gemergt oder zur Löschung
  freigegeben.

## Lernseiten (Stand 24.11.2026)

`power_bi_einsteiger_guide_v4.html`, `fabric_einsteiger_guide_v1.html` und `powerbi_praxis_pfad.html`
tragen den Stand November 2026: gegen Microsoft Learn, SQLBI und die Ignite-Ankündigungen geprüft,
Neuerungen seit Oktober eingebaut, Verweise auf Folgen, eigene Beiträge und Library ergänzt.
Alle Learn-Screenshots liegen lokal unter `assets/learn/` (Quellen in `assets/learn/QUELLEN.txt`),
keine der drei Seiten lädt Bilder von fremden Servern. Beim nächsten Update zuerst die Stellen mit
"Stand November 2026" und die im Text offen benannten Widersprüche prüfen (Fabric Apps und Data Agents:
Preview oder allgemein verfügbar; Org-Apps auf Audiences umstellen; SharePoint-Einbettung ganzer Apps).
Nach jeder Änderung: `python3 scripts/build_md.py <name>`, `python3 scripts/build_llms_full.py`,
`node scripts/build_seo.js`.

## Nützliche Einstiege

- `CLAUDE.md` — Projekt-Instruktionen (inkl. Design-System: selbst gehostete
  Fonts, keine Dritt-CDNs, Klick-zum-Laden für Embeds)
- `ibcsInspiredChartDeck/AGENT-GUIDE.md` / `pnlByDatenWG/AGENT-GUIDE.md` —
  Property-Referenzen, bekannte Fallen, Testlandschaft
- `pnlByDatenWG/SPEC-MEGATABLE.md` + `TEMPLATE-GUIDE.md` — Mega-Table-Spezifikation
- `.claude/skills/` — finance-data-model, chartkitchen-report, pnl-report,
  deploy-to-powerbi, mockup-to-powerbi, kitchen-update, powerbi-design-framework
