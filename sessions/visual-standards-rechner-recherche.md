# Recherche-Notizen · Visual-Standards-Rechner (Stand 10.09.2026)
Status-Legende: V = verifiziert (MS Learn/GitHub), S = nur Such-Snippet der Primärquelle, ? = nicht verifizierbar

## Preise / Lizenzen
| Produkt | Modell | Preis | MS-cert | IBCS-cert | Status |
|---|---|---|---|---|---|
| Power BI Pro / PPU | per user | 14 $ / 24 $ pro User/Mo (seit 04/2025); DE ca. 12,10 € / 20,80 € | – | – | V (MS Blog) / S |
| Zebra BI | named user, JEDER Viewer+Creator, keine Capacity-Ausnahme | Personal ~299 $/User/Jahr, Team 799 $/Jahr bis 5 User, Enterprise custom (ab ~5.000 $/Jahr Drittquelle) | ja | ja (12/2024) | S |
| Inforiver Analytics+ | named user, Creator=Viewer, monatlich | 3 $/User/Mo, Volumen 2,40 $; Domain-wide 12k vs 96k $/Jahr (Widerspruch) | ja | ja (07/2025) | S |
| Inforiver Reporting Matrix | wie oben | 10 User = 50 $/Mo | ja | ja | S |
| graphomate | named user (Recipients+Designer), nur AppSource | nicht öffentlich; Desktop frei, Service mit Wasserzeichen | ja | ja (09/2025) | S/? |
| xViz (Lumel) | named user | ab 9,99 $/User/JAHR; à la carte 1–1,5 $/User/Mo, min 10 | meist | nein | S |
| ValQ | named user | ab 10 $/User/Mo, Free-Plan Desktop | ja | nein | S |
| Acterys | Plattform-Abo, unlimited Viewer ab Professional | ~69–99 $/User/Mo | ja | nein | S |
| Nova Silva | per user / premium capacity / enterprise | 103,75–157,50 $/Mo (unklar wofür) | ja | nein | S |
| Icon Map Pro, SankeyArt, Power ON, hi-chart | per user / vendor | nicht öffentlich | tw. | hi-chart: ja | ? |
| Deneb | MIT, AppSource-Version zertifiziert (seit 1.7, 07/2024), Standalone unzertifiziert | 0 €; Sponsoring 50 $/Mo ≈1 h … 750 $/Mo ≈15 h Support | ja | nein | V |
| Vega/Vega-Lite | BSD-3 | 0 €, kein kommerzieller Support | – | – | V |
| Charticulator | MS retired 31.12.2023; Community-Fork (View zertifiziert, Editor nicht) | 0 € | tw. | nein | V |
| ChartKitchen byDatenWG | MIT, Beta, noch nicht AppSource/zertifiziert | 0 € | nein (noch) | nein | V (Repo) |

MS-Lizenzregeln (V): F64+/P: Viewer mit Free-Lizenz; F2–F32: jeder Viewer Pro/PPU; Autoren immer Pro/PPU.
Paid-AppSource-Visuals: Lizenz NICHT durchgesetzt bei Publish-to-web, PaaS-Embed app-owns-data, Report Server, Sovereign Clouds, PDF/PPT-Export via REST.

## Zertifizierung (V, MS Learn)
- MS-cert = Code-Review: keine externen Calls, keine kommerziellen Libs, Rendering-Events-API. Keine Qualitäts-/Support-Garantie. Dezertifizierung "at its discretion". Erst 4 Wo, Update 3 Wo.
- Nur zertifizierte Visuals: Export PDF/PPT, E-Mail-Abos. Org-Store-Visuals (.pbiviz) kein PPT-Export, nicht im Report Server. Org-Visual löschen = irreversibel, Reports brechen sofort.
- Tenant-Settings: "Allow visuals created using the Power BI SDK", "Add and use certified visuals only", Downloads, SSO, Local storage. Nur Service; Desktop via GPO EnableCustomVisuals / EnableUncertifiedVisuals.
- IBCS-zertifiziert für PBI (S): Zebra BI, Inforiver, graphomate, hi-chart, Lumel EPM/Fabric Planning. Nicht: Deneb, Vega, xViz, ValQ, Acterys, Nova Silva. Liste: ibcs.com/software (selbst prüfen).
- ISO 24896:2026 (06/2026) basiert auf IBCS.

## Deneb-Details (V)
- 1 Maintainer (Daniel Marsh-Patrick), 1.307 Commits, ~310 Stars, 50 offene Issues, >15.000 Orgs (S). 30.000-Zeilen-Fenster. Export-Bugs #553 (08/2025), #509.
- Templates: Kerry Kolosko, deneb.guide/community/resources, ChristopherBarber/DenebIBCS, avatorl/Deneb-Vega-Templates, PBI-David/Deneb-Showcase (30+, MIT), CodeWithBehnam/vegaviz (269 Specs, MIT), Daten-WG Business Chart Builder.
- Aufwand: "steep learning curve"; Daten-WG BITT n.72/75/76: komplexe Specs für Fachanwender kaum wartbar; Felder tauschbar, neue Felder nur im Code.

## Core + SVG (V/S)
- Grenzen: Text 32.766 Zeichen (Chris Webb), keine Interaktivität, nur Table/Matrix/Card/Image/Button/Slicer, Performance bei vielen Zeilen; "Fix IBCS Variance Chart" ~175 Measures (BITT n.75).
- Neu: DAX UDFs (09/2025) → DaxLib PowerofBI.IBCS, avatorl/dax-udf-svg-ibcs; powerofbi.org "Responsive SVG Charts" (11/2025). Core-Update 02/2024 overlapping bars für IBCS.
- Data Goblins MacGuyver-Rating ≥3 = nicht produktionsreif.

## Kostensätze (S)
- Freelancer DACH Power BI: Ø 98 €/h, Spanne 50–131 (freelancermap); Kompass 2025 Ø 104 €/h ≈ 824 €/Tag. Spezialisten 150–250 €/h (Whitepaper-Annahme 250 extern / 100 intern).
- Controller Gehalt Ø 71.292 €/Jahr → Vollkosten ~60–90 €/h.
- Schulung 500–2.000 $ pro Kopf je Rolle (EPC Group).
- Wartung 15–20 % (15–25 %) der Erstellungskosten p.a.; reguliert 25–40 %; 60/60-Regel. Primärquelle Gartner/Forrester nicht verifiziert.
- Forrester TEI Power BI 2020: 125 h/User/Jahr, −42 % zentrales Team (MS-beauftragt).
- Creator:Viewer ≈ 1:9 (MS SKU-Estimator-Szenario 150:1.300); Creator-Anteil 15–30 % (Basedash, unverifiziert).
- Buy-Faustregel: kaufen wenn ≥80 % Abdeckung und Eigenbau >40 h (powerbiconsulting).
- Zebra ROI-Rechner: 1 Slider "46 % weniger Entwicklungszeit" (TU München Eye-Tracking = Lesegeschwindigkeit!) → Kategorie-Vermischung.
- Stunden pro IBCS-Chart je Option: KEINE Quelle → Expertenschätzung Daten-WG als Dreipunkt.

## Methodik
- TEI: Benefits/Costs/Flexibility/Risk, Risikoabschlag z. B. −15 %.
- Nutzwertanalyse: K.O.-Kriterien VOR Scoring, Gewichts-Sensitivität Pflicht, Kompensationseffekt beachten.
- MoSCoW-Kritik: Must-Überladung → mit Scoring kombinieren.
- PERT E=(O+4M+P)/6, σ=(P−O)/6; Monte-Carlo P10/P50/P90. Cone of Uncertainty ±4x Konzept, ±2x nach Klärung.
- Kein gefundener Rechner zeigt Unsicherheitsbänder (Differenzierungsmerkmal).

## Red Flags / Konflikte (Literatur)
1. "Zertifiziert" ≠ sicher/gewartet; certified-only im Service ohne Desktop-GPO → Creator bauen Reports, die nicht rendern.
2. Auch MS-Visuals sterben ohne Migrationszusage: Charticulator 2023, Bing-Maps-Visuals 10/2025, R/Python-Embedded 05/2026, OKViz Synoptic v1 03/2026, Timeline Storyteller.
3. Monatsupdates brechen Custom Visuals (02/2025 Dialog-API, 09/2022 Report Server API 4.7) → Wartung ereignisgetrieben.
4. Vendor-Zahlen interessengeleitet (46 %, 10x, TEI).
5. Lock-in in beide Richtungen: paid ∝ Viewer, nicht migrierbar, nicht RS/Sovereign/P2W; Deneb Ein-Personen-Projekt + Spec=Code; Core-MacGyver ab Rating 3 nicht produktionsreif; Copilot unterstützt KEINE Custom Visuals (auch nicht Deneb/Zebra).

## Fabric Apps (V)
Public Preview seit 02.06.2026, Rayfin SDK, TS/React, Vega-Lite/D3-Template gegen Semantic Model; Fabric-Capacity Pflicht, Tenant-Switch, CU-Billing. Ergänzung, kein Report-Ersatz.

## Top-Quellen
MS Learn organizational-visuals · power-bi-custom-visuals-certified · custom-visual-licenses · end-user-pdf/powerpoint limitations · fabric-sku-estimator · copilot-create-reports (kein Custom-Visual-Support) · MS Blog pricing 04/2025 · github.com/sponsors/deneb-viz · deneb releases · powerofbi.org SVG/UDF · Chris Webb 32k · freelancermap Kompass 2025 · Forrester TEI 2020 · actionablereporting.com Korn 2023 · data-goblins.com MacGuyver · daten-wg.com "Standard, Custom oder Deneb?" · DataChant AppSource-Export (Unlisted-Ordner) · ibcs.com/software · learn fabric/apps/pricing
