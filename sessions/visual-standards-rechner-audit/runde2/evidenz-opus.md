# Runde 2 · Evidenz nachholen (Kürzel: evidenz-opus)

**Auftrag:** die Werte belegen, die das Audit v0.7 nicht prüfen konnte (`05-web-sonnet.md`, Abschnitt „Blockiert“; README „Was offen bleibt“, Punkt 2).
**Stand des Rechners:** `visual-standards-rechner.html`, v0.10, 11.09.2026.
**Datum der Recherche:** 11.09.2026.

---

## 0. Was diesmal technisch ging und was nicht

Der Egress-Proxy dieser Umgebung arbeitet mit einer **Allowlist**, nicht mit einer Blockliste. Direkter Abruf (`WebFetch`) war möglich für:

- `github.com` (inkl. `releases.atom`) — **funktioniert**
- `learn.microsoft.com` über den Microsoft-Learn-MCP — **funktioniert**

Direkter Abruf war **nicht** möglich (403 des Gateways, `EGRESS_BLOCKED`) für:

`zebrabi.com`, `help.zebrabi.com`, `inforiver.com`, `community.inforiver.com`, `graphomate.com`, `azure.microsoft.com`, `powerbi.microsoft.com`, `deneb.guide`, `marketplace.microsoft.com`, `appsource.microsoft.com`, `web.archive.org`, `r.jina.ai`, `capterra.com`, `g2.com`, `getapp.com`, `thebricks.com`, `visuals.novasilva.com`, **`daten-wg.com`** (die eigene Domain der Autoren), `ibcs.com`.

Die im Auftrag vorgeschlagenen Ausweichwege (Archiv, Reseller, AppSource-Listing, Jina-Proxy) sind damit alle ebenfalls versperrt. Was blieb: **`WebSearch`** — der liefert eine vom Suchindex erzeugte Zusammenfassung der Zielseite, also indirekte Einsicht in die Primärseite, keine Primärlektüre. Ich habe jeden Wert über mindestens zwei unabhängig formulierte Suchen gegengeprüft und notiere unten je Wert: **gefunden / widersprüchlich / nicht erreichbar**.

`curl` aus der Bash-Sandbox hat gar keinen Netzzugang (alle Hosts `000`), auch die erlaubten. Für GitHub-Primärdaten war `WebFetch` auf `releases.atom` der einzige verlässliche Weg (der GitHub-MCP ist in dieser Session auf `losveratos/powerbi-kitchen-` beschränkt).

---

## 1. Belegtabelle

| # | Wert | Ergebnis | Status | Quelle (URL) | Datum |
|:--|:--|:--|:--|:--|:--|
| 1 | **Zebra BI Paketstruktur** | Starter (bis 10 Nutzer, „essential features“) · Business/Advanced (bis 50 Nutzer) · Enterprise (custom, inkl. „unlimited site licenses“). **Keine Einzelplatzlizenz**, Mindestpaket 10 Nutzer. Verkauf in Blöcken von 10 oder 50. | **gefunden** (5 unabhängige Suchen konsistent) | help.zebrabi.com/kb/power-bi/pricing-plans/, /how-does-the-pricing-plan-work/, /subscription-billing-essentials/ (Domain blockiert, Index-Zusammenfassung) | 09/2026 |
| 2 | **Zebra BI Preis Power BI, EUR oder USD** | **kein einziger Preispunkt für das Power-BI-Produkt auffindbar.** Fünf verschieden formulierte Suchen, alle ohne Zahl. Die im Rechner zitierten „Personal 299 $ / Team 799 $ für 5 Nutzer“ tauchen nirgends mehr auf — sie gehören zu einer **abgelösten Paketstruktur** (Personal/Team), heute gilt Starter/Business/Enterprise. | **nicht erreichbar** | zebrabi.com/pricing/, /zebrabi-pricing-pbi/ | 09/2026 |
| 3 | **Zebra BI Preis, Nachbarprodukt (Office/Excel)** | Starter **58 €/Monat** für bis zu 10 Nutzer (≈ 696 €/Jahr ≈ **70 €/Nutzer/Jahr**) · Advanced **470 €/Monat** für bis zu 50 Nutzer (≈ 5.640 €/Jahr ≈ **113 €/Nutzer/Jahr**) · Enterprise unbegrenzt, custom billing. **In EUR ausgewiesen.** Der Preis je Nutzer **steigt** mit der Stufe, weil die Stufen feature- und nicht mengenbasiert sind. | **gefunden** (3 unabhängige Suchen wortgleich) | help.zebrabi.com/kb/excel/how-much-does-zebra-bi-for-office-cost/ (Domain blockiert, Index-Zusammenfassung) | 09/2026 |
| 4 | **Zebra BI Lizenzpflicht Viewer** | Bestätigt: keine Unterscheidung Designer/Viewer, jeder, der ansieht oder interagiert, braucht eine Lizenz. Ausnahme: extern geteilte Reports. | **gefunden** (deckt sich mit v0.7) | help.zebrabi.com/kb/power-bi/how-does-the-zebra-bi-for-power-bi-licensing-work/ | 09/2026 |
| 5 | **Inforiver Analytics+ / Reporting Matrix, je Nutzer** | **3,00 $ → 2,40 $ pro Nutzer und Monat**, gestaffelt nach Teamgröße; jeder Creator **und** jeder Viewer belegt einen Named Seat. Das sind **28,80–36 $/Nutzer/Jahr**. Premium Tables separat ab 2 $/Monat bzw. 22 $/Jahr. | **gefunden** (2 unabhängige Suchen) | inforiver.com/analytics-plus/pricing/, /reporting-matrix/pricing/, /premium-table/pricing/ | 09/2026 |
| 6 | **Inforiver Domain-wide / Enterprise** | Domain-wide **ab 12.000 $/Jahr**, nach Unternehmensgröße bepreist. **„Unlimited users for the entire company“ = 96.000 $/Jahr**, ausdrücklich beworben für Unternehmen **ab ca. 4.000 Power-BI-Nutzern** („kostet nur etwa 1 FTE“). | **gefunden — korrigiert v0.7** | inforiver.com/faq/, /enterprise/pricing/ (Domain blockiert, Index-Zusammenfassung; 2 unabhängige Suchen) | 09/2026 |
| 7 | **Inforiver „Named Creator, Viewer frei“** | Existiert: **ab 95 $/Creator/Monat** mit unbegrenzten Viewern. **Aber** mit dokumentierter Einschränkung: „the developer license can NOT be used in Power BI Service tenants“; die Premium-Developer-Only-Lizenz wurde **im Februar 2024 eingestellt**. | **gefunden, mit Einschränkung** | inforiver.com/developer-license-faq/, community.inforiver.com/tips-tricks/…, inforiver.com/blog/general/matrix-retiring-developer-only-subscription-plan/ | 09/2026 |
| 8 | **Inforiver auf Desktop kostenlos** | „Inforiver Premium Matrix (with no feature restrictions) is now completely free on Microsoft Power BI Desktop“ — Lizenz wird erst fällig beim Veröffentlichen/Teilen über Power BI Service und/oder Report Server. | **gefunden** | community.inforiver.com/about/post/inforiver-premium-matrix-is-now-completely-free-on-microsoft-power-bi-… | 2026 |
| 9 | **graphomate Preis** | **Weiterhin kein öffentlicher Preispunkt.** Modell bestätigt: Preis nach Nutzerzahl, „Recipients or designers of an application are counted as users“, gezählt je BI-Frontend. Lizenzen für Power BI **ausschließlich über Microsoft AppSource**. | **nicht erreichbar (Preis) / gefunden (Modell)** | graphomate.com/en/licences/, /plattformen/microsoft/microsoft-power-bi/ | 09/2026 |
| 10 | **graphomate kostenlos nutzbar** | **Neu und relevant:** graphomate charts für Power BI ist **kostenlos und voll funktionsfähig**; in **Power BI Desktop uneingeschränkt**, im **Power BI Service mit Wasserzeichen**. Ohne Wasserzeichen: Subscription oder befristete Demo. Für Power BI Desktop und Tableau Desktop ist die graphomate suite kostenlos. | **gefunden** (2 unabhängige Suchen) | graphomate.com/en/licences/ (Index-Zusammenfassung) | 09/2026 |
| 11 | **IBCS-Zertifizierung der drei Paid-Anbieter** | Alle drei sind IBCS Certified Solution Provider für Power BI. Rezertifizierungen: **Inforiver Analytics+ 4.8 und Reporting Matrix 3.3 im Juli 2025**, **Zebra BI im Dezember 2024**, **graphomate im September 2025**. graphomate `chartrix` kommt 2026 für Power BI, Tableau und MS365. | **gefunden** | ibcs.com/software/inforiver/, ibcs.com/software/graphomate/ (Domain blockiert, Index-Zusammenfassung) | 09/2026 |
| 12 | **Fabric F-SKU EUR, West Europe** | Ein EUR-Anker gefunden: **0,2115 €/CU/Stunde Listenpreis West Europe** → F2 0,423 €/h, F64 13,51 €/h. Daraus 730 h/Monat: **F2 PAYG 3.710 €/Jahr · F8 14.830 · F64 118.600**; mit 1-Jahres-Reservierung (−41 %): **F2 2.190 · F8 8.750 · F64 70.000**. | **gefunden (Einzelanker, 2× konsistent zitiert)** | Aggregator-Quellen 2026 (azure.microsoft.com blockiert) | 07–09/2026 |
| 13 | **Fabric F-SKU, Gegenprobe** | **Widersprüchlich.** Eine deutsche Quelle nennt „ab ca. **268 €/Monat** für F2 bei jährlicher Abrechnung“ (= 3.216 €/Jahr), US-Listen nennen **262,80 $/Monat PAYG** und **156,33 $/Monat reserved**. 268 € lässt sich weder als West-Europe-PAYG (309 €) noch als West-Europe-Reserved (182 €) darstellen. | **widersprüchlich** | inform-datalab.com, solv-systems.com, alphabold.com | 2026 |
| 14 | **Power BI Pro / PPU, EUR Deutschland** | **12,10 €/Nutzer/Monat (Pro)** und **20,80 €/Nutzer/Monat (PPU)**, Stand Juli 2026, bei jährlicher Abrechnung, zzgl. MwSt. | **gefunden** (2 unabhängige deutsche Quellen) | inform-datalab.com, datenkultur.de | 07/2026 |
| 15 | **Deneb, aktueller Stand** | **Primärquelle, direkt abgerufen:** `deneb-viz/deneb` Release **2.0.0**, `<updated>` **2026-09-08T04:34:37Z**, Release-Text „version 2.0.0 of Deneb, **as published to AppSource**“. Davor 1.9.1 (31.03.) und 1.9.0 (15.03.2026). **Das Audit v0.7 hat dieses Release auf 2024 datiert — das war falsch, es ist drei Tage alt.** | **gefunden (Primärquelle)** | github.com/deneb-viz/deneb/releases.atom | 08.09.2026 |
| 16 | **Deneb Zertifizierungsstatus** | Deneb ist ein **zertifiziertes** Power-BI-Visual (mehrfach bestätigt). Für 2.0 gilt: Blog kündigte AppSource-Einreichung „Ende August/Anfang September 2026“ an, GA „abhängig von Microsofts Zertifizierungslauf, wahrscheinlich Ende September bis Anfang Oktober“. Laut **Microsoft Learn (Primärquelle)**: Update-Zertifizierung bis **3 Wochen**, Produktionsauslieferung eines Updates bis **2 Wochen**, Zertifizierungs-Badge sichtbar innerhalb **3 Wochen nach Freigabe**. → Zur Pre-Conference am **14.10.2026** ist 2.0 voraussichtlich in Produktion und rezertifiziert, am 11.09. ist es das noch nicht. | **gefunden, zeitkritisch** | deneb.guide/blog/2-0-beta (blockiert, Zusammenfassung); learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified#publication-timeline; …/power-bi-custom-visuals-faq | 09/2026 |
| 17 | **Deneb Verbreitung** | **~90.000 Entwickler in ~41.000 Organisationen** haben Deneb allein in den 4 Monaten **April–Juli 2026** heruntergeladen und in Reports verwendet (Angabe des Maintainers im 2.0-Beta-Blogpost). | **gefunden (Selbstauskunft des Projekts)** | deneb.guide/blog/2-0-beta (blockiert, Zusammenfassung) | 08/2026 |
| 18 | **ChartKitchen Zertifizierungsstatus** | **Weiterhin nicht zertifiziert und nicht in AppSource.** Version 1.38.0.0, Stand 19.07.2026 (deckt sich mit `md/chartkitchen-doku.md` im Repo). Verteilung ausdrücklich über `.pbiviz`-Datei-Import („Visualisierungen → … → Visual aus Datei importieren“). Im täglichen AppSource-Export von DataChant (Ordner `Certified/` und `All Listed/`) taucht weder „ChartKitchen“ noch „DatenWG“ auf. | **gefunden (negativ, belastbar)** | github.com/DataChant/PowerBI-Visuals-AppSource (direkt abgerufen); datenwgknowledgekitchen.com/chartkitchen-doku.html | 09/2026 |
| 19 | **Controller-Gehalt DACH 2026** | **Robert Half Gehaltsübersicht 2026** (Befragung 06–07/2025, 1.500 Befragte, davon 500 Arbeitgeber): **Controller 55.000–89.250 €**, Financial Controller 67.500–99.250 €, Head of Controlling 89.250–120.000 €. Median Controller wird mit **~76.500 €** angegeben. Gegenprobe StepStone Gehaltsreport 2026: Bruttomedian **aller** Berufe 53.900 €. | **gefunden, Streuung bleibt** | roberthalf.com/de/de/job-details/controller, controllingportal.de, controlling-blog.de | 2026 |
| 20 | **BI-Entwickler-Gehalt DACH 2026** | StepStone „Business Intelligence Entwickler/in“: **Ø 52.800 €**, Spanne 45.400–63.600 €. Indeed „Business Intelligence Developer“: **Ø 59.785 €**. PayScale Entry-Level: 48.000 €. | **gefunden — widerlegt eine Begründung im Rechner** | stepstone.de/gehalt/Business-Intelligence-Entwickler-in.html, de.indeed.com/career/business-intelligence-developer/salaries | 2026 |
| 21 | **Power-BI-Freelancer-Satz DACH** | **Erstmals ein Power-BI-spezifischer Wert:** Ø **98 €/h** im freelancermap-Verzeichnis. Rahmen: Freelancer-Kompass 2026 (5.400+ Befragte) Ø **103 €/h** über alle Branchen, **IT-Branche Ø 95 €/h**. | **gefunden** | freelancermap.de/freelancer-verzeichnis/ms-power-bi-31656, freelancermap.de/freelancer-kompass | 03–09/2026 |
| 22 | **Marktentwicklung Freelancer 2026** | **Erstmals seit Beginn der Erhebung kein Anstieg der Stundensätze** (Stagnation bei 103 €/h). Monatseinkommen im Schnitt 6.653 € gegen 8.432 € im Vorjahr (−21 %). **62 % planen keine Erhöhung, 9 % planen eine Senkung.** 43 % ohne gesicherte Projektpipeline. | **gefunden** | freelancermap.de/freelancer-kompass/einkommen, freelancermap.at Pressemitteilung 17.03.2026 | 03/2026 |
| 23 | **Zertifizierungs- und Auslieferungsfristen** | **Primärquelle bestätigt den Wert im Rechner:** Erstzertifizierung bis 4 Wochen, Update-Zertifizierung bis 3 Wochen; neues Visual 10–14 Tage bis Produktion, Update bis 2 Wochen. | **gefunden (Primärquelle)** | learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified#publication-timeline | aktuell |

---

## 2. Was ich nicht belegen konnte

- **Zebra BI, Preis für das Power-BI-Produkt.** Fünf Anläufe, kein Zahlenwert. Die Zahl 270 €/Nutzer/Jahr im Rechner hat damit **keine auffindbare Quelle mehr** — auch keine widersprechende.
- **graphomate, irgendein Preispunkt.** Bestätigt sich als Anfragemodell.
- **Zebra BI Enterprise Site-Lizenz, Preis.** Existenz belegt, Preis nicht.
- **Fabric-EUR-Preise aus der Primärquelle.** `azure.microsoft.com` blockiert; die EUR-Werte beruhen auf einem einzigen, zweimal konsistent zitierten Sekundäranker.
- **Deneb 2.0, tatsächlich vollzogene Rezertifizierung.** Am 11.09.2026 noch offen; vor der Konferenz nachsehen.

---

## 3. Abgeleitete Default-Änderungen

Siehe die zehn Funde in der strukturierten Ausgabe. Zusammengefasst und nach Wirkung sortiert:

| # | Stelle | heute | Vorschlag | Wirkung |
|:--|:--|:--|:--|:--|
| 1 | `OPTP` → `licSite` + `PRESETS.gross` | [12.000 · 35.000 · 90.000] €, srcNote „96 k$ nicht mehr belegbar“ | **[12.000 · 40.000 · 96.000] €**, srcNote korrigieren; Großkonzern-Preset setzt zusätzlich die Site-Indikation „Konzern-Rahmenvertrag“ | hoch |
| 2 | `LIC.zebra` + srcNote von `lic` | [140 · 270 · 330] €, Label „Zebra-Liste 270 €“ | **[90 · 170 · 300] €**, Label „Zebra-Niveau (abgeleitet)“; Paketstruktur Starter/Business/Enterprise statt Personal/Team | hoch |
| 3 | `FLAGS.nobudget` + `lic`-Minimum | schließt Paid komplett aus, lic min 40 € | K.O. → Warnung; lic min **0 €**; Text: graphomate Desktop kostenlos (Service mit Wasserzeichen), Inforiver Matrix Desktop kostenlos | mittel-hoch |
| 4 | Lizenzmodell-Auswahl / `TEXT.paid` | nur pro Nutzer / Staffel / Site | dritte Variante „Named Creator, Viewer frei“ als **Hinweis** samt dokumentierter Service-Einschränkung | mittel-hoch |
| 5 | `GLOBAL.rateInt` | [65 · 85 · 115] €/h | **[60 · 82 · 110] €/h**, Begründungskette auf Robert Half 2026 + StepStone BI-Entwickler umstellen | mittel |
| 6 | `GLOBAL.rateExt` | [95 · 125 · 220] €/h | **[90 · 118 · 210] €/h**, Power-BI-spezifischer Anker 98 €/h ergänzen | mittel |
| 7 | `CAP_SKU` | f2 [1.900·2.500·3.200], f8 [7.500·10.000·13.000], f64 [60.000·85.000·118.000] | **f2 [2.200·2.900·3.700], f8 [8.700·11.500·14.800], f64 [70.000·92.000·118.600]** aus dem EUR-Anker West Europe | niedrig-mittel |
| 8 | `GLOBAL.wageInfl` | [2 · 3 · 4,5] % auf interne **und** externe Sätze | **[1 · 3 · 4,5] %** plus Hinweis, dass externe Sätze 2026 stagnieren | niedrig-mittel |
| 9 | `OPTP.govRun` (deneb) + `TEXT.deneb` | „etwa ein Minor-Release je Jahr“, Stand 1.9 | **[8 · 18 · 44] h**, Stand 2.0 (08.09.2026), zwei Releases in 2026 davon ein Major; Adoptionszahl gegen den Bus-Faktor | niedrig-mittel |
| 10 | Paid-Lizenzformel / Hinweis | stetig `lic × Nutzer × Staffel` | Hinweis auf **Mindestpakete** (Zebra: kein Einzelplatz, Minimum 10 Nutzer, Blöcke 10/50) | niedrig-mittel |

### Nebenbefunde für die Quellenliste (`const SOURCES`)

- Zeile „Microsoft Blog: Power BI pricing update 04/2025 · Pro 14 $, PPU 24 $“ → für ein DACH-Publikum die **EUR-Listenpreise** ergänzen: **12,10 € Pro / 20,80 € PPU** je Nutzer und Monat, Stand 07/2026, zzgl. MwSt.
- Zeile „IBCS: Certified Software“ → Rezertifizierungsdaten ergänzen: Inforiver 07/2025, graphomate 09/2025, Zebra BI 12/2024. Das macht die Aussage „inklusive Zertifikat“ prüfbar statt behauptet.
- Zeile „Zebra BI: Pricing und Lizenz-FAQ · ~299 $/Jahr Personal“ → **299 $ Personal ist nicht mehr auffindbar** und gehört zur abgelösten Paketstruktur. Entweder streichen oder als „historisch (2024)“ kennzeichnen.
- Neue Quelle für den `fixH`-Wert: `learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified#publication-timeline` — die dort genannten Fristen (10–14 Tage, bis 3 Wochen) stimmen wörtlich mit dem srcNote im Rechner überein, Badge `V` ist gerechtfertigt.

### Was vor der Konferenz noch jemand mit freiem Netz tun muss

1. `zebrabi.com/pricing/` und `help.zebrabi.com/kb/power-bi/pricing-plans/` mit **Datum und Screenshot** sichern. Das ist die einzige verbliebene Lücke mit hoher Wirkung.
2. `azure.microsoft.com/pricing/details/microsoft-fabric/` für **West Europe in EUR** abrufen und die drei SKU-Presets gegenprüfen.
3. Am oder kurz vor dem **14.10.2026** nachsehen, ob **Deneb 2.0** den Zertifizierungs-Badge in AppSource trägt. Falls ja, ist die Aussage „Zertifiziert (AppSource-Version)“ wieder aktuell; falls nein, gehört ein Satz zum laufenden Zertifizierungsfenster in die Deneb-Karte.
