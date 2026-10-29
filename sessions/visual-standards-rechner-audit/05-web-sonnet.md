# Web-Audit: Preise & Fakten (Stand: Recherche September 2026)

Methodik: WebSearch (Google-artige Snippets) + WebFetch (Direktzugriff). Viele Vendor-Domains
(`zebrabi.com`, `inforiver.com`, `graphomate.com`, `azure.microsoft.com`, `powerbi.microsoft.com`,
`deneb.guide`, `docs.okviz.com`) sind in dieser Sandbox über den Egress-Proxy blockiert
(`EGRESS_BLOCKED`) — direkter WebFetch war dort **nicht möglich**. Wo das der Fall ist, stammen die
Zahlen aus WebSearch-Snippets (indirekte/sekundäre Einsicht in die Seite, keine vollständige
Primärlektüre) oder aus echten Sekundärquellen (Reviews, Blogs, Microsoft Learn, GitHub). Das ist in
der Spalte „Status" vermerkt. Erfundene Zahlen: keine — wo nichts belastbares gefunden wurde, steht
„nicht gefunden".

## Ergebnistabelle

| # | Angabe | Gefundener Wert | Quelle (URL) | Datum der Quelle | Status |
|---|---|---|---|---|---|
| 1a | Zebra BI Personal-Lizenz | 299 $/Jahr/Nutzer (alle Visuals für PBI + Excel) | [zebrabi.com/pricing](https://zebrabi.com/pricing/) (via Suchindex, Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar (Domain blockiert, nur Snippet) |
| 1b | Zebra BI Team-Lizenz | 799 $/Jahr für bis zu 5 Nutzer | dito | Suchstand 09/2026 | Nicht direkt verifizierbar |
| 1c | Zebra BI Enterprise | Custom Pricing; ein Drittanbieter-Aggregator (thebricks.com) schätzt „ab ca. 5.000 $/Jahr" | [thebricks.com/resources/zebra-bi-vs-power-bi](https://www.thebricks.com/resources/zebra-bi-vs-power-bi) | 2026 | **Schätzung Dritter**, kein Listenpreis |
| 1d | Zebra BI Staffelung | Starter (bis 10 Nutzer), Business (bis 50 Nutzer), Enterprise (>50, custom, inkl. „unlimited site licenses") | [help.zebrabi.com/kb/power-bi/pricing-plans](https://help.zebrabi.com/kb/power-bi/pricing-plans/) (Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar |
| 1e | Zebra BI Named-User-Regel | Laut Zebra-BI-eigener Knowledge-Base wird **nicht** zwischen Designer und Viewer unterschieden — jeder Nutzer, der Zebra-BI-Reports **anzeigt oder erstellt**, braucht eine Lizenz. Ausnahme: extern geteilte Reports (z. B. öffentliche Finanzberichte) brauchen keine Viewer-Lizenz. | [help.zebrabi.com/kb/power-bi/how-does-the-zebra-bi-for-power-bi-licensing-work](https://help.zebrabi.com/kb/power-bi/how-does-the-zebra-bi-for-power-bi-licensing-work/) (Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar, aber Aussage ist eindeutig und wörtlich aus der Zebra-BI-KB zitiert |
| 1f | Zebra BI Site-/Enterprise-Pauschale | Existiert („unlimited site licenses"), aber **kein öffentlicher Preis** dafür auffindbar — nur „custom billing" | dito | Suchstand 09/2026 | Teilweise verifiziert (Existenz ja, Preis nein) |
| 2a | Inforiver Analytics+ | 30 $/Nutzer/Monat bei 10 Nutzern (Staffelpreis) | [inforiver.com/analytics-plus/pricing](https://inforiver.com/analytics-plus/pricing/) (Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar |
| 2b | Inforiver „named creator/editor" | ab 95 $/Creator/Monat (andere Quelle/anderer Snippet als 2a — **widerspricht** dem 30 $-Wert) | [inforiver.com/pricing](https://inforiver.com/pricing/) (Domain blockiert) | Suchstand 09/2026 | **Widersprüchlich** — zwei unterschiedliche Preisangaben je nach Snippet, echte Seite nicht einsehbar |
| 2c | Inforiver Domain-wide/Enterprise | „Domain-wide licensing starts at $12,000 per year, quoted by company size" — mehrfach in Suchtreffern konsistent genannt | [inforiver.com/faq](https://inforiver.com/faq/), [inforiver.com/enterprise/pricing](https://inforiver.com/enterprise/pricing/) (Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar, aber konsistent über mehrere Snippets — **12.000 $/Jahr als Einstieg plausibel** |
| 2d | Inforiver 96.000 $/Jahr | **Nicht gefunden.** Einzig auffindbarer „96"-Bezug: ein inzwischen **eingestelltes** (seit Februar 2024) altes „Developer-based"-Tarifmodell mit „$96/mo for 5 users" (≈ 1.152 $/Jahr für 5 Nutzer, nicht 96.000 $/Jahr) | [inforiver.com/blog/general/inforiver-developer-based-subscription-pricing](https://inforiver.com/blog/general/inforiver-developer-based-subscription-pricing/) | Blogpost, Bezug Anfang 2024 | **Nicht gefunden** — 96.000-$-Zahl ist wahrscheinlich eine kursierende Verwechslung/Hochrechnung, keine belegte Quelle |
| 2e | Inforiver Viewer-Lizenzpflicht | Uneinheitlich: Domain-wide-Tarif wird explizit als „unlimited authors and **consumers**" beschrieben (Viewer zählen mit); für die Einzelplatz-Tarife ist unklar, ob reine Betrachter zählen | dito | Suchstand 09/2026 | Nicht gefunden (abschließend), teilweise Hinweis vorhanden |
| 3a | graphomate Lizenzmodell | Preis richtet sich nach Nutzerzahl; „Recipients or designers of an application are counted as users", gezählt pro BI-Frontend-Tool. Power-BI-Desktop und Tableau-Desktop kostenlos nutzbar. | [graphomate.com/en/licences](https://www.graphomate.com/en/licences/) (Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar, Modell-Beschreibung aber plausibel/konsistent |
| 3b | graphomate öffentlicher Preis | **Kein einziger öffentlicher Preispunkt gefunden** — reines Anfrage-/Quote-Modell | dito | Suchstand 09/2026 | **Verifiziert: es gibt keinen öffentlichen Listenpreis** (negatives Ergebnis, aber belastbar) |
| 4a | Power BI Pro | 14 $/Nutzer/Monat, in Kraft seit 1. April 2025, unverändert bis mind. April 2026 laut mehreren unabhängigen 2026er-Quellen | [mammoth.io/blog/power-bi-pricing](https://mammoth.io/blog/power-bi-pricing/), [alphabold.com/power-bi-pricing-model](https://www.alphabold.com/power-bi-pricing-model/), [costbench.com](https://costbench.com/software/business-intelligence/power-bi/) | 2026 | Verifiziert über 3 unabhängige Sekundärquellen; **offizielle Microsoft-Pricing-Seite selbst war blockiert** und konnte nicht direkt gegengeprüft werden |
| 4b | Power BI PPU | 24 $/Nutzer/Monat, gleicher Stichtag (April 2025) | dito | 2026 | Verifiziert über Sekundärquellen (s.o.), offizielle Seite nicht direkt geprüft |
| 4c | Fabric F64 Pay-as-you-go | ≈ 8.410 $/Monat (durchgehender Betrieb); ≈ 0,18 $/CU/Std. | Aggregator-Blogs (u. a. solv-systems.com, alphabold.com) | 2026 | Nicht direkt verifizierbar (Azure-Pricing-Seite blockiert), Schätzung Dritter |
| 4d | Fabric F64 Reserved (1 Jahr) | ≈ 4.982 $/Monat (≈ 41 % Rabatt ggü. PAYG) | dito | 2026 | Schätzung Dritter, nicht primärverifiziert |
| 4e | Fabric F2/F4/F8 PAYG | F2 ≈ 263 $/Mon., F4 ≈ 526 $/Mon., F8 ≈ 1.051 $/Mon. (linear skaliert zu CUs) | [solv-systems.com/resources/microsoft-fabric-pricing-2026](https://solv-systems.com/resources/microsoft-fabric-pricing-2026) | 2026 | Schätzung Dritter, nicht primärverifiziert |
| 4f | Fabric F2/F4/F8 Reserved | F2 ≈ 156 $/Mon., F4 ≈ 311 $/Mon., F8 ≈ 623 $/Mon. | dito | 2026 | Schätzung Dritter |
| 4g | Fabric EUR-Preis | Nur ein Beleg gefunden: F4 Reserved ≈ 328 €/Monat, West Europe, Stand Juli 2026 | Forenbeitrag/Aggregator | Juli 2026 | Einzelbeleg, nicht querverifiziert — **nicht ausreichend für belastbare EUR-Tabelle** |
| 4h | Fabric Viewer-Lizenzregel | **Offiziell bei Microsoft Learn verifiziert**: Auf F2–F32 braucht **jeder** Viewer eine Pro- oder PPU-Lizenz; ab **F64 und größer** können Fabric-Free-Nutzer mit Viewer-Rolle kostenlos konsumieren (wie bei alten P-SKUs). Autoren/Editoren brauchen immer Pro/PPU. | [learn.microsoft.com/power-bi/support/premium-migration-faq](https://learn.microsoft.com/power-bi/support/premium-migration-faq#cost-and-licensing) | Microsoft Learn (aktuell) | **Verifiziert (Primärquelle Microsoft Learn)** |
| 4i | Power BI Premium P-SKUs | Werden zum Ende der jeweiligen Vertragslaufzeit retiriert (keine Neukäufe/Verlängerungen mehr); F-SKUs sind der Nachfolger | [learn.microsoft.com/power-bi/support/premium-migration-faq](https://learn.microsoft.com/power-bi/support/premium-migration-faq) | Microsoft Learn (aktuell) | **Verifiziert (Primärquelle)** |
| 5a | Deneb aktuelle Version | **Widersprüchlich, zwei Stränge:** (a) GitHub zeigt `2.0.0` als neuesten getaggten Release (8. Sept 2024) — das ist der ungeprüfte/„standalone"-Zweig mit mehr Funktionsumfang (z. B. externe Datenabrufe), aber **nicht AppSource-zertifiziert**; (b) der AppSource-zertifizierte Zweig läuft parallel auf `1.9.x` und hat laut deneb.guide-Blog erst um ca. März 2026 die Zertifizierung für 1.9 durchlaufen | [github.com/deneb-viz/deneb/releases](https://github.com/deneb-viz/deneb/releases) (direkt gefetcht); [deneb.guide/blog/1-9-release](https://deneb.guide/blog/1-9-release) (Domain blockiert, nur Snippet) | Sept 2024 / März 2026 | **Widersprüchlich** — beide Zweige real, aber „die aktuelle Version" ist ohne Kontext nicht eindeutig zu beantworten |
| 5b | Deneb zertifiziert seit | Laut Community-Suchtreffer: Version **1.5** bestand die AppSource-Zertifizierung um **November 2021** | Community-Snippet (powerofbi.org-Umfeld) | 2021 | Nicht primärverifiziert (kein Direktzugriff auf offizielle Ankündigung), aber konsistent |
| 5c | Deneb GitHub-Sponsors-Stufen | **Verifiziert per Direktzugriff:** 5 $ (Basis, nur Badge) · 50 $ Bronze (~1 h/Monat R&D) · 150 $ Silver (~2 h/Monat) · 250 $ Gold (~3 h/Monat) · 750 $ Platinum (~15 h/Monat + bis zu 3 Pairing-/Consulting-Sessions) | [github.com/sponsors/deneb-viz](https://github.com/sponsors/deneb-viz) | Aktuell (Direktabruf 09/2026) | **Verifiziert (Primärquelle, direkt gefetcht)**. Hinweis: die im Auftrag genannte Spanne „50 $–750 $" stimmt an den Eckwerten, dazwischen gibt es aber auch 150 $/250 $-Stufen |
| 5d | Deneb Datenzeilen-Limit | Ursprünglich 10.000 Zeilen Default; wurde per PR #683 auf **30.000** angehoben; laut Doku über „Data limit options" im Formatierungsbereich **konfigurierbar** | [github.com/deneb-viz/deneb/releases](https://github.com/deneb-viz/deneb/releases), Community-Hinweise | unklar/aktuell | Teilweise verifiziert — Grundaussage (30.000, konfigurierbar) bestätigt, aber Primärdoku (deneb.guide/docs/.../performance) war **blockiert** und konnte nicht vollständig gegengelesen werden |
| 5e | Deneb Lizenz | **MIT-Lizenz bestätigt** (direkt im Repo sichtbar) | [github.com/deneb-viz/deneb](https://github.com/deneb-viz/deneb) | Aktuell (Direktabruf 09/2026) | **Verifiziert (Primärquelle, direkt gefetcht)** |
| 6a | DAX User-Defined Functions (UDFs) — GA | **Offiziell GA in Power BI Desktop und Power BI Service ab dem Juni-2026-Release**, benötigt Datenbank-Kompatibilitätsstufe **1702 oder höher** | [learn.microsoft.com/dax/best-practices/dax-user-defined-functions](https://learn.microsoft.com/dax/best-practices/dax-user-defined-functions), [learn.microsoft.com/power-bi/transform-model/desktop-user-defined-functions-overview](https://learn.microsoft.com/power-bi/transform-model/desktop-user-defined-functions-overview) | Microsoft Learn (aktuell) | **Verifiziert (Primärquelle Microsoft Learn, direkt gefetcht)** |
| 6b | DAX UDF dokumentierte Limits | Umfangreich dokumentiert: u. a. keine Rekursion/Mutual-Recursion, kein Function-Overloading, kein expliziter Rückgabetyp, kein Verstecken/Display-Folder für UDFs, OLS überträgt sich **nicht** automatisch auf Funktionen, eingeschränkte IntelliSense (u. a. TMDL-Extension, SSMS ohne Support), Live-Connect-Modelle zeigen UDFs nicht im Model Explorer | [learn.microsoft.com/dax/best-practices/dax-user-defined-functions#considerations-and-limitations](https://learn.microsoft.com/dax/best-practices/dax-user-defined-functions#considerations-and-limitations) | Microsoft Learn (aktuell) | **Verifiziert (Primärquelle)** |
| 6c | „SVG-Measures" als eigenes MS-Feature | **Es gibt kein offizielles Microsoft-Feature namens „SVG Measures".** Es handelt sich um eine Community-Technik, bei der DAX-UDFs SVG-Strings zurückgeben (z. B. `SVG_IBCS_ACPY`), um Grafiken in Tabellen/Matrizen/Cards einzubetten. Explizite dokumentierte Grenzen für **Stringlänge** oder **Matrix-Performance speziell bei SVG-UDFs** wurden **nicht gefunden** | Community: [biwave.substack.com](https://biwave.substack.com/p/user-defined-functions-in-power-bi), [bibb.pro/post/dax-and-udf-svg-charts-power-bi-guide](https://bibb.pro/post/dax-and-udf-svg-charts-power-bi-guide/), [powerofbi.org](https://www.powerofbi.org/2025/09/16/new-dax-user-defined-functions/) | 2025/2026 | **Nicht gefunden** (spezifische Limits); Grundtechnik ist real und verifiziert |
| 7a | Charticulator | Von Microsoft zum **31. Dezember 2023** retiriert (Ankündigung im Repo), Repo am **26. April 2024 archiviert**; App+Website open-sourced, Community-Fork (Ilfat Galiev) führt Weiterentwicklung fort | [github.com/microsoft/charticulator/issues/1085](https://github.com/microsoft/charticulator/issues/1085) | Ankündigung 2023, Archivierung April 2024 | **Verifiziert (direkt gefetcht)** |
| 7b | Bing Maps Visual | Deprecation wirksam mit dem **Oktober-2025-Release** von Power BI; Migration zu Azure Maps wird proaktiv vorangetrieben. Separat: Bing Maps for Enterprise (der zugrundeliegende Dienst) endet für Free/Basic-Konten am **30.06.2025**, für Enterprise-Konten am **30.06.2028** | [powerbi.microsoft.com/en-us/blog/power-bi-october-2025-feature-summary](https://powerbi.microsoft.com/en-us/blog/power-bi-october-2025-feature-summary/) (Domain blockiert), [sumproduct.com/blog/power-bi-blog-bing-map-deprecation-plan](https://sumproduct.com/blog/power-bi-blog-bing-map-deprecation-plan/), [m365.fm/blog/navigating-the-bing-maps-sunset](https://www.m365.fm/blog/navigating-the-bing-maps-sunset-what-the-june-2025-deadline-means-for-your-business/) | 2025 | Verifiziert über mehrere unabhängige Sekundärquellen, offizieller MS-Blogpost selbst nicht direkt einsehbar |
| 7c | OKViz Abkündigung | Laut einem einzelnen Suchtreffer: **Synoptic Panel v1** (nicht „OKViz" als Ganzes) wurde deprecated, Stopp der Funktion am **10. März 2026**; Nachfolger ist Synoptic Panel v2 | [docs.okviz.com/visuals/synoptic-panel/versions/deprecated](https://docs.okviz.com/visuals/synoptic-panel/versions/deprecated) (Domain blockiert, nur Snippet) | Suchstand 09/2026 | **Widersprüchlich/schwach belegt** — nur ein Snippet, Primärseite nicht einsehbar, betrifft nur ein einzelnes OKViz-Visual, nicht das ganze Produktportfolio |
| 7d | R/Python-Visuals | **Nicht generell abgekündigt.** Betroffen ist nur „Embed for your customers" (App-owns-data) und „Publish to web": dort endet der Support für R/Python-Visuals zum **1. Mai 2026** (MC1283817). In normaler Power-BI-Desktop-/Service-Nutzung weiterhin unterstützt, aber nicht mehr aktiv weiterentwickelt | [pupuweb.com/mc1283817-retirement-of-r-and-python-visuals-in-embed-for-your-customers](https://pupuweb.com/mc1283817-retirement-of-r-and-python-visuals-in-embed-for-your-customers/), community.fabric.microsoft.com-Threads | Message-Center-Notiz MC1283817, 2025/2026 | Verifiziert über Sekundärquellen (Message-Center-Spiegel), nicht direkt im MS Message Center gegengeprüft |
| 7e | Zusatzfund: Power BI Q&A | Wird bis **Dezember 2026** retiriert (nicht explizit erfragt, aber relevanter Zusatzfund für die Retirement-Liste) | [magnetismsolutions.com/news/power-bi-qampa-to-retire-by-december-2026](https://www.magnetismsolutions.com/news/power-bi-qampa-to-retire-by-december-2026-what-you-need-to-know), [mc.merill.net/message/MC1218421](https://mc.merill.net/message/MC1218421) | 2025/2026 | Verifiziert über Sekundärquellen |
| 8a | Custom-Visuals-API-Änderungen 2024 | Direkt aus dem offiziellen API-Repo verifiziert: v5.8.0 (19.02.2024, `storageV2Service`), v5.9.0 (26.03.2024, u. a. neue Hierarchy-Filter), v5.9.1 (06.05.2024), v5.10.0 (10.06.2024, `sourceFieldParameters`), **v5.11.0 (02.07.2024) entfernt `storageService` — dokumentierter Breaking Change**, v5.11.1 (20.07.2024, Cloud-Support) | [github.com/microsoft/powerbi-visuals-api/releases](https://github.com/microsoft/powerbi-visuals-api/releases) (direkt gefetcht) | 2024 | **Verifiziert (Primärquelle, direkt gefetcht)** |
| 8b | Custom-Visuals-API 2025/2026 | Auf der abgerufenen Releases-Seite waren **keine** 2025/2026-Einträge sichtbar (evtl. Paginierung/Cache-Limit des Fetches) | dito | — | **Nicht vollständig geprüft** — Lücke, keine Aussage über 2025/2026-Breaking-Changes möglich |
| 8c | „API-Version-1.1-Deprecation" | Die oft zitierte Abkündigung „nur API ≥1.2 wird unterstützt" stammt aus **2018**, nicht aus 2024–2026 — bei einer Verwendung als „aktueller" Fall wäre das **falsch/veraltet** | [powerbi.microsoft.com/en-us/blog/announcement-custom-visual-api-deprecation](https://powerbi.microsoft.com/en-us/blog/announcement-custom-visual-api-deprecation/) (Domain blockiert, Datum aus Snippet-Metadaten) | 2018 | Verifiziert als **historisch**, nicht als 2024–2026-Fall zu verwenden |
| 9a | Power-BI-Freelancer-Stundensatz DACH | **Kein Power-BI-spezifischer Ø-Satz gefunden.** Nächstliegende Werte: IT-Freelancer DACH gesamt Ø ~100–104 €/h (2025: 104 €/h, 2026: 103 €/h laut freelancermap Freelancer-Kompass 2026); benachbarte Kategorien: Berater/Manager 121 €/h, Finance/Accounting/Legal 114 €/h, SAP/ERP 113 €/h | [freelancermap.de/freelancer-kompass](https://www.freelancermap.de/freelancer-kompass), [freelancermap.de/blog/stundensatz-it-freelancer](https://www.freelancermap.de/blog/stundensatz-it-freelancer/) | Freelancer-Kompass 2026 | **Nicht gefunden (Power-BI-spezifisch)** — nur Näherungswerte über Nachbarkategorien, nicht 1:1 übertragbar |
| 9b | Gulp-Stundensätze | Ø IT-Freelancer laut Gulp-Kompass ~100 €/h (2025), Top-Sätze 130–150 €/h; **kein Power-BI-spezifischer Wert auffindbar** | [gulp.de](https://www.gulp.de/) | 2025/2026 | Teilweise verifiziert (nur allgemeiner IT-Wert) |
| 9c | Malt-Tarifbarometer | Existiert als Quelle (malt.de/t/tarifbarometer), aber in dieser Recherche kein konkreter Power-BI-Zahlenwert extrahiert (Domain nicht direkt gefetcht, nur als Linktreffer erschienen) | [malt.de/t/tarifbarometer](https://www.malt.de/t/tarifbarometer) | — | **Nicht gefunden** (nicht ausgewertet) |
| 9d | Controller-Gehalt DACH | **Starke Streuung je Quelle:** Stepstone (selbstberichtet, inkl. Junior-Profile) Ø ~54.000–60.000 €; ein Aggregator nennt Ø 71.292 € (Range 56.052–86.532 €); eine weitere Quelle behauptet einen „offiziellen" Median von 76.500 €; Senior Controller ~88.000 € | [stepstone.de/gehalt/Senior-Controller.html](https://www.stepstone.de/gehalt/Senior-Controller.html), [controlling-blog.de/controller-gehaelter-2026](https://www.controlling-blog.de/controller-gehaelter-2026/), [meingehalt.net/gehalt/controller.html](https://www.meingehalt.net/gehalt/controller.html) | 2026 | **Widersprüchlich** — Spanne 54.000–88.000 € je nach Quelle/Methodik/Senioritätsstufe, kein Konsens-Einzelwert |
| 10a | Zebra BI Academy | Basis-Kurs (Module 1–3) **kostenlos** für alle; Stufen 4–5 nur für Enterprise-Plan-Kunden, kein separater Kurspreis gefunden | [academy.zebrabi.com](https://academy.zebrabi.com/), [help.zebrabi.com/kb/power-bi/academy-overview](https://help.zebrabi.com/kb/power-bi/academy-overview/) (Domain blockiert) | Suchstand 09/2026 | Nicht direkt verifizierbar, aber Aussage konsistent über 2 Snippets |
| 10b | Inforiver Training | Nur **kostenlose Webinare** gefunden (z. B. „Inforiver Charts: fastest way to deliver stories"); **kein bezahltes Trainingsangebot mit Preis** gefunden | [inforiver.com/webinars](https://inforiver.com/webinars/) (Domain blockiert) | Suchstand 09/2026 | **Nicht gefunden** (bezahltes Training) |
| 10c | Vega-Lite/Deneb-Kurse (Marsh-Patrick, Kolosko, Bacci) | **Kein bezahltes Kursangebot mit Preis gefunden.** Alle drei veröffentlichen kostenlose Blogposts, YouTube-Videos und GitHub-Beispiele; einzig ein Drittkurs „Introduction to Developing Power BI Visuals" (RADACAD) tauchte auf, aber ohne Preis und ohne Bezug zu den drei genannten Personen | diverse (LinkedIn, YouTube, kerrykolosko.com, deneb.guide/community/resources) | 2026 | **Nicht gefunden** |
| 10d | EPC Group Training | Enterprise-Programm mit 4 Stufen (Consumer/Creator/Advanced/Executive), **500–2.000 $ je Teilnehmer** je nach Stufe/Format, Consumer-Stufe ~500 $; Gruppenrabatte ab 10 Teilnehmern | [epcgroup.net/blog/power-bi-training-enterprise-program](https://www.epcgroup.net/blog/power-bi-training-enterprise-program) | 2026 | Verifiziert über Suchtreffer (Domain nicht als blockiert aufgefallen, aber nicht per Direkt-WebFetch gegengelesen) — **deckt sich mit der im Auftrag genannten Spanne** |

## Blockiert / nicht erreichbar

Folgende Domains waren über den Sandbox-Egress-Proxy **direkt nicht erreichbar** (`EGRESS_BLOCKED`) —
alle Angaben zu diesen Domains stammen ausschließlich aus WebSearch-Snippets, nie aus vollständiger
Primärlektüre:

- `zebrabi.com` (inkl. `zebrabi.com/pricing/`, `zebrabi.com/zebrabi-pricing-pbi/`)
- `help.zebrabi.com` (Knowledge Base, u. a. Lizenzierungs- und Preis-Artikel)
- `inforiver.com` (alle Unterseiten, inkl. `/pricing/`, `/analytics-plus/pricing/`, `/faq/`, `/webinars/`)
- `graphomate.com` / `www.graphomate.com`
- `azure.microsoft.com` (offizielle Fabric-Preisseite)
- `powerbi.microsoft.com` (offizielle Pricing-Seite und der offizielle Blogpost zur Custom-Visuals-API-Deprecation sowie der Oktober-2025-Feature-Summary-Post)
- `deneb.guide` (Doku, Changelog, Performance-Seite, Blog)
- `docs.okviz.com`

**Konsequenz:** Für Abschnitt 1 (Zebra BI), 2 (Inforiver), 3 (graphomate), Teile von 4 (Fabric F-SKU
EUR/USD-Feinwerte) und 5 (Deneb-Doku-Details) konnte **kein einziger Wert per Direktzugriff auf die
Primärquelle** verifiziert werden. Die Werte sind plausibel und meist über mehrere Snippets konsistent,
aber formal nur „sekundär/indirekt belegt", nicht „verifiziert" im strengen Sinn. Einzige Ausnahme:
GitHub-Domains (`github.com/...`) und `learn.microsoft.com` waren **nicht** blockiert und konnten direkt
gefetcht werden — diese Werte (Deneb-Lizenz, Deneb-Sponsors, DAX-UDF-GA, Fabric-Viewer-Lizenzregel,
Charticulator-Retirement, Custom-Visuals-API-Changelog 2024) gelten als robust verifiziert.

## Konsequenzen für die Defaults

Nur Punkte, die tatsächlich belastbar (Primärquelle oder mehrfach konsistente Sekundärquellen) sind:

1. **Power BI Pro/PPU-Defaults auf 14 $ / 24 $ pro Nutzer/Monat setzen** — über 3 unabhängige 2026er-Quellen
   konsistent bestätigt (Stand seit April 2025, unverändert). Sollte im Kitchen-Repo als aktueller
   Listenpreis geführt werden, nicht mehr die alten 10 $/20 $.
2. **Fabric-Lizenzregel für Viewer korrekt abbilden:** Nur ab **F64 aufwärts** dürfen Free-User als
   Viewer kostenlos konsumieren; auf F2–F32 braucht **jeder** Viewer Pro/PPU. Das ist eine
   Primärquellen-verifizierte, oft falsch dargestellte Regel — falls im Projekt „F2/F4/F8 als Einstieg"
   für viewer-lastige Szenarien empfohlen wird, sollte ein Hinweis ergänzt werden, dass dort trotzdem
   Pro/PPU-Lizenzen für alle Betrachter nötig sind.
3. **Zebra BI „kein Viewer/Designer-Unterschied"** in Vergleichstabellen/Texten übernehmen, sofern das
   Projekt Lizenzmodelle von Drittanbietern gegenüberstellt — Quelle ist zwar nicht direkt gegengelesen,
   aber wörtlich und eindeutig aus der Zebra-BI-eigenen KB zitiert und deckt sich mit dem allgemein
   bekannten Zebra-BI-Modell.
4. **Inforiver 96.000-$/Jahr-Zahl nicht als Fakt übernehmen** — nicht auffindbar, möglicherweise eine
   Verwechslung mit dem längst abgeschafften Developer-Tarif („$96/mo für 5 Nutzer"). Falls diese Zahl
   irgendwo im Projekt als Vergleichswert steht, sollte sie entweder entfernt oder explizit als
   „unbestätigt/kursierend" markiert werden. Der 12.000-$/Jahr-Einstiegswert für Domain-wide-Lizenzen ist
   dagegen konsistent genug, um (mit Quellenhinweis) übernommen zu werden.
5. **DAX-UDFs erst ab Juni-2026-Release als GA behandeln**, inkl. Anforderung „Kompatibilitätsstufe
   1702+". Wenn das Projekt DAX-UDF-basierte SVG-Measures als Technik dokumentiert, sollte klargestellt
   werden, dass „SVG Measures" kein offizieller Produktname ist, sondern eine Community-Pattern-
   Bezeichnung, und dass es **keine dokumentierten** Stringlängen-/Matrix-Performance-Grenzwerte dafür
   gibt (nur die generischen UDF-Limitierungen von Microsoft Learn).
6. **Deneb-Versionsangabe im Projekt differenzieren**: „aktuelle Version" ist mehrdeutig — GitHub-
   Hauptzweig zeigt 2.0.0 (unzertifiziert/standalone), AppSource-zertifizierter Zweig liegt bei 1.9.x.
   Wo im Projekt „Deneb Version X" genannt wird, sollte präzisiert werden, ob die AppSource- oder die
   GitHub-Standalone-Variante gemeint ist.
7. **Charticulator, Bing-Maps-Visual und die R/Python-Embed-Einschränkung** können mit Datum in
   Abkündigungs-/Migrations-Hinweisen des Projekts übernommen werden (Primär- bzw. konsistente
   Sekundärbelege vorhanden). Die OKViz-Synoptic-Panel-v1-Abkündigung (10.03.2026) sollte dagegen nur mit
   Vorbehalt übernommen werden — Einzelquelle, Primärseite nicht einsehbar.
8. **Für Stundensätze/Gehälter (Punkt 9) keine scharfen Zahlen als „Fakt" ins Projekt übernehmen** —
   weder ein Power-BI-spezifischer Freelancer-Satz noch ein Konsens-Controller-Gehalt ließen sich
   belastbar ermitteln. Falls das Projekt solche Zahlen für Kalkulationen/Vergleiche braucht, sollte es
   Bandbreiten (z. B. „IT-Freelancer DACH Ø ~100 €/h, Controller-Gehalt DACH ~55.000–90.000 € je nach
   Quelle/Seniorität") mit explizitem Quellenvorbehalt verwenden statt einer einzelnen Zahl.
9. **Trainingspreise (Punkt 10):** Nur die EPC-Group-Spanne (500–2.000 $/Kopf) ist einigermaßen belegt
   und deckt sich mit der im Auftrag genannten Range. Zebra BI Academy ist größtenteils kostenlos
   (Enterprise-Only für die letzten Stufen). Für Inforiver-Training und die genannten Deneb/Vega-Experten
   gibt es **keine** öffentlichen Kurspreise — falls das Projekt einen Trainingskosten-Vergleich enthält,
   sollten diese drei Zeilen als „kein öffentlicher Kurs/Preis bekannt" statt mit einer Zahl geführt werden.
