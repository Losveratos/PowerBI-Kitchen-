# Projekt-Status · PowerBI-Kitchen

_Stand: 2026-10-23 · Übergabe-Notiz, damit eine neue Session/Person sofort anknüpfen kann._

## Was ist das

Monorepo für die Website **datenwgknowledgekitchen.com** (GitHub Pages von `main`)
und die Power-BI-Custom-Visuals **byDatenWG**. Geschäftsmodell: kostenlos, Open
Source (MIT), für immer frei; Umsatz über Beratung. AppSource-Listing in
Vorbereitung (hängt organisatorisch, technisch ready). Die Visuals sind
**IBCS-inspiriert**, bewusst nicht IBCS-zertifiziert.

- **Kontakt:** Michael Tenner · michael.tenner84@gmail.com
- **Arbeitsbranch der Claude-Sessions:** `claude/chartkitchen-weiterentwicklung-puk00i`
  (wird nach jedem Squash-Merge auf `origin/main` zurückgesetzt)
- **Schwester-Repo (nur Downloads):** `Losveratos/power-bi-custom-visuals-bydatenwg`

## Die Produkte (Stand 23.10.2026)

| Produkt | Version | Ordner | Hinweise |
| --- | --- | --- | --- |
| ChartKitchen byDatenWG | 1.52.4.0 | `ibcsInspiredChartDeck/` | 13 Chart-Modi, Start-Hub, IBCS-Vorlagen C01–C13, 4 Sprachen. GUID `chartKitchenByDatenWGD9DE0F7AD44D41058672C6FBF6F5A18D` |
| P&L Statement byDatenWG | 1.5.3.0 | `pnlByDatenWG/` | Mega-Table (Templates T01A–12H), Treiberbaum, Start-Hub, IBCS-2.0-Skalierung. GUID `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358` |
| dataKitchenGantt | 1.15.0.0 | `dataKitchenGantt/` | Gruppenzeilen-Klick überall, skalierungs-fest |
| MockupKitchen | — | `mockup-kitchen.html` | Browser-Tool, Export für den Skill `mockup-to-powerbi` |

## Release-Konvention (Kurzform)

Je Visual-Release: Version in `pbiviz.json` (2×) → `npm run package` → alte dist
raus → `downloads/` (CK: `chartkitchen-byDatenWG-latest.pbiviz` + `latest.json`)
→ CHANGELOG oben → Doku + Schnellstart DE/EN Versions-Flip → AGENT-GUIDE-Stand
→ CK zusätzlich: `cert-export/`-Sync (feste Dateiliste, README nie) und
`.claude/skills/deploy-to-powerbi/catalog.json` → Commit → PR → Squash-Merge →
Pages-Workflow prüfen → Schwester-Repo nachziehen. Details: AGENT-GUIDE im
jeweiligen Visual-Ordner.

## Gerade in Arbeit / offen

- **Talk „One Model, Three Visual Stacks"** (Budapest BI Forum, 17.11.2026):
  fertiges Demo-Repo-Staging unter `talk-repo-staging/` auf dem Arbeitsbranch —
  wartet darauf, dass das GitHub-Repo `one-model-three-stacks` angelegt wird;
  danach dorthin pushen und Fabric-Workspace per Git-Integration verbinden.
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
