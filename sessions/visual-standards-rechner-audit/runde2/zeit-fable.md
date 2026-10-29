# Runde 2 · Linse „Realistische Entwicklungen über die Zeit“ · Visual-Standards-Rechner v0.10

**Stand:** 11.09.2026 · **Prüfer:** Fable (Kürzel `zeit-fable`) · **Auftrag:** Was passiert in 3, 5 und 10 Jahren realistisch, das der Rechner nicht kennt oder falsch abbildet? Der Rechner kennt heute nur Lohnsteigerung (`wageInfl`), Lizenzpreis-Steigerung (`licInfl`), Viewer-Wachstum (`growth`), Wartungs-Abklingen (`maintDecay`) und Lernkurve (`learn`).

**Netzlage:** Erreichbar waren Microsoft Learn (MCP), Suchmaschinen-Snippets und GitHub-HTML-Seiten per WebFetch. Blockiert vom Egress-Proxy: metr.org, metr.substack.com, deneb.guide, zebrabi.com, inforiver.com, vertice.one, azure.microsoft.com (Preisliste), agilytic.com, blog.robbowley.net. Die GitHub-API für `deneb-viz/deneb` ist in dieser Sitzung nicht freigeschaltet (nur das eigene Repo); ich habe kein fremdes Repo ohne Auftrag hinzugefügt. Wo unten „Snippet“ steht, stammt die Zahl aus einem Suchauszug, nicht aus Primärlektüre.

**Beleg vs. Meinung:** Jede Zahl ist mit Quelle und Konfidenz markiert. Dreipunktwerte ohne Quelle sind meine Schätzung und so gekennzeichnet.

---

## Kurzfazit

1. **Der größte blinde Fleck ist die Asymmetrie „Löhne steigen, Produktivität nicht“.** Der Rechner verteuert interne Stunden jährlich um 2–4,5 %, hat aber kein Gegenstück. Die Evidenz für KI-Produktivität ist widersprüchlich (METR-RCT 2025: −19 %; METR-Update 2026: +4 bis +20 % mit Selektionseffekt; Peng/GitHub 2023: +55,8 % bei Greenfield-Aufgabe; DORA 2025: Durchsatz rauf, Instabilität rauf), aber die Richtung für Code-Artefakte wie Vega-Lite-Specs und DAX-UDFs ist über 5–10 Jahre kaum negativ. Vorschlag: neue Annahme „Produktivitätsgewinn je Jahr“ je Ansatz, mit 0 als Minimum, damit der Skeptiker den Effekt abschalten kann.
2. **Lizenzpreise werden zu glatt modelliert.** `licInfl` 0 · 4 · 12 % erlaubt „nie eine Erhöhung“ über 10 Jahre. Der Vertice-SaaS-Inflationsindex misst realisierte Verlängerungspreise: 8,7 % (2023), 12,2 % (2024), 11,4 % (01/2025), 14–16 % (05–06/2026, Snippets). Dazu kommen Modellwechsel statt Preislisten-Erhöhung: Inforiver hat die Developer-Lizenz abgeschafft (eine Verlängerung zu 2.500 $/Developer, dann Named User), Zebra hat die Paketstruktur 2025 umgestellt, Microsoft Pro +40 % nach 10 Jahren, M365 +5 bis 33 % zum 01.07.2026. Vorschlag: `licInfl` Minimum auf 1 % heben und eine neue Annahme „Preissprung bei Verlängerung“ je 3-Jahres-Vertragsperiode.
3. **Der Dollar fehlt.** Alle Paid-Belege sind USD, der Rechner rechnet „1 $ ≈ 1 €“. EZB-Referenzkurs 09.09.2026: 1,1652 USD/EUR, also 0,86 €/$. Das ist ein 14-%-Fehler zu Lasten von Paid, in der Zeitdimension aber ein Risiko in beide Richtungen (Parität 2022).
4. **Abkündigung trifft auch Core.** Microsoft kündigt eigene Visuals ab: Q&A-Visual Februar 2027, Bing-Maps-Visuale „scheduled for deprecation“, R/Python-Visuale in Embed/Publish-to-web seit 05/2026 leer, alte Card durch New Card ersetzt. `dep` core 0,4 · 1 · 2 % ist zu niedrig angesetzt, wenn ein Standard auf einem später abgekündigten Core-Visual sitzt.
5. **Deneb 2.0 ist da.** Die Release-Seite zeigt 2.0.0 am 08.09. (Kontext: beta-5 27.08., alpha-2 24.07., 1.9.1 31.03.; Jahr auf der Seite nicht sichtbar, aus der Vor-Audit-Chronologie 1.9.0 = 16.03.2026 ergibt sich 2026). Das v2-Template-Format ist laut Issue #472 ein Breaking Change mit automatischer v1-Migration. Der Rechner nennt als letztes Release „1.9 03/2026“. Die Breaking-Update-Rate 1 · 2 · 3 hält (Issue #676 vom 03.06.2026: Vega-Specs leer nach Desktop Mai 2026, offen), aber ein Major-Release je 5–6 Jahre gehört als eigener Posten hinein.
6. **Wartung klingt nicht ab, sie wächst.** `maintDecay` 80 · 90 · 97 sagt „nach dem ersten Jahr weniger“. Lehman, Eick et al. (Code Decay) und die Lebenszyklus-Faustregeln (60–80 % der Kosten sind Wartung) sagen das Gegenteil. Bei 10 Jahren macht das +24 % Wartung.
7. **Kleine Effekte, die die Kritik größer vermutet hat:** Restwert der Vorlagenbibliothek (3–5 % des Totals bei 3 Jahren, weil der Rollout dominiert), Fabric-Capacity-Sprung (Default 0, jetzt zusätzlich Overage 3× PAYG als Preis für die lineare Näherung).

Wirkung auf die Rangfolge: keiner der Vorschläge dreht die Plätze in den Presets. Sie verschieben die Abstände: KI-Produktivität und Wartungstrend wirken gegeneinander auf die Stunden-Ansätze (bei 10 Jahren etwa −12 % gegen +24 % auf den Wartungsposten, netto je nach Wartungsanteil), Preissprung und Dollar wirken gegeneinander auf Paid (+13 % gegen −14 % auf die Lizenz bei 10 Jahren). Ehrlich ist: über 10 Jahre werden die Bänder breiter, nicht die Mitte anders.

---

## Funde (wichtigste zuerst)

### F1 · Produktivitätsgewinn je Jahr für Stundenposten (neu, ansatzspezifisch)

**Heute im Rechner:** `wageInfl` 2 · 3 · 4,5 % p. a. wirkt auf `rateInt` und `rate` (Wartung, Breaking-Updates, Governance, Support, Fluktuationsschulung). Es gibt keinen Gegenposten: die Stunden je Chart (`reuseH`, `firstH`, `fixH`) und Wartungsquoten sind über 3, 5 oder 10 Jahre konstant. Die Lernkurve `learn` (Wright, je Verdopplung der Charts je Ersteller) ist Erfahrungsgewinn, kein Werkzeuggewinn: sie greift bei kleinen Teams kaum (Pilot 1,03) und ist über die Kalenderzeit flach.

**Vorschlag:** Neue Annahme in `OPTP`: `prodGain` „Produktivitätsgewinn je Jahr (KI-Assistenz, Werkzeugreife)“, Einheit %, `v: {paid:[0,1,3], oss:[0,2,5], deneb:[0,4,10], core:[0,4,10]}`, Badge S/E. Formelstelle in `calc()`: neben `wageF` einen `prodF` bilden:

```
const pg=1-p('prodGain')/100; let t=0; for(let y=0;y<H;y++) t+=Math.pow(pg,y); const prodF=t/H;
```

und `prodF` auf die laufenden Stundenposten multiplizieren: `rollout` (nur den nachfragegetriebenen Teil, siehe F2), `maint`, `events`, `trainRun` (Einarbeitung wird mit KI-Assistenz kürzer), nicht auf Jahr-0-Posten (`setup`, `build`, `switchCost`), nicht auf Lizenz. Lernkurve und `prodGain` sind multiplikativ getrennt (Erfahrung vs. Werkzeug), also keine Doppelzählung, solange `prodGain` klein bleibt.

**Warum:** Die Asymmetrie ist ein systematischer Fehler gegen alle Stunden-Ansätze bei langen Horizonten. Code-Artefakte (Vega-Lite-JSON, DAX-UDFs, SVG-Measures) sind genau die Form, die Sprachmodelle erzeugen; Klick-Konfiguration eines Paid-Visuals ist es nicht (Ausnahme: PBIR-JSON-Edits durch Agent-Skills, aber die Property-Schemata der Vendoren sind nicht dokumentiert). Deshalb paid < oss < deneb ≈ core.

**Evidenz (widersprüchlich, deshalb Minimum 0):**
- METR, RCT Februar–Juni 2025, 16 erfahrene Open-Source-Entwickler, 246 Aufgaben: mit KI **19 % langsamer**, Selbsteinschätzung +20 %. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ und https://arxiv.org/abs/2507.09089 (Snippets; metr.org blockiert).
- METR, Update 24.02.2026: neues Design (Randomisierung je Entwickler), Late-2025-Agents zeigen „small (~4–20 %) productivity benefits“, laut METR wegen Selektionseffekten eher unterschätzt. https://metr.org/blog/2026-02-24-uplift-update/ (Snippet).
- METR, Selbstauskunft-Survey 05/2026, 349 Technik-Beschäftigte: Median 1,4–2× „Wert der Arbeit“; METR selbst hält die Größenordnung für zweifelhaft (eigene Mitarbeiter geben die niedrigsten Werte an). https://metr.org/blog/2026-05-11-ai-usage-survey/ (Snippet).
- Peng et al. 2023 (GitHub/Microsoft), 95 Freelancer, HTTP-Server in JavaScript: **55,8 % schneller** mit Copilot. Greenfield-Aufgabe, nicht Wartung. https://arxiv.org/abs/2302.06590.
- DORA 2025: KI-Einsatz korreliert mit höherem Durchsatz **und** höherer Instabilität; „AI amplifies what's already there“. https://dora.dev/dora-report-2025/.
- Qualität der erzeugten Artefakte: VegaChat (arXiv 01/2026) berichtet weiterhin halluzinierte Vega-Lite-Felder bei GPT-4o-mini, mitigierbar durch Schema-Einschränkung. https://arxiv.org/abs/2601.15385. Für DAX: unabhängiger 8-Aufgaben-Test von Copilot in Desktop (04/2026) mit 62,5 % Pass-Rate, GPT-4o auf NL-zu-DAX-Benchmark „knapp über 50 %“ (05/2025), beides Einzelblogs via https://lets-viz.com/blogs/dax-pattern-breaks-ai-copilots-2026 (Snippet, keine Studie).
- Microsoft selbst: Copilot schreibt DAX-Queries und Measure-Beschreibungen (Learn, copilot-reports-overview); Skills for Fabric (Preview 2026) liefern „powerbi-report-authoring“ auf PBIR-Dateien. https://learn.microsoft.com/power-bi/developer/agentic/power-bi-report-authoring-skill-overview.

**Konfidenz:** mittel für die Richtung, niedrig für die Höhe. **Wirkung:** hoch bei 10 Jahren, mittel bei 5. Rechnerisch: 4 %/Jahr ergibt `prodF` 0,92 (5 J.) und 0,84 (10 J.); 1 %/Jahr ergibt 0,98 und 0,96. Bei 3 % Lohnsteigerung (`wageF` 1,06 / 1,14) neutralisieren 4 % Produktivität die Lohnsteigerung für Deneb/Core fast exakt. Deshalb ist die heutige Modellierung eine implizite Annahme „Produktivität 0 %“, und die ist die unwahrscheinlichste aller Werte.

**Gilt das auch für Paid?** Teilweise. Konfiguration per Klick lernt nicht durch LLMs; aber Vendoren bauen selbst KI ein (Zebra BI und Inforiver werben mit KI-Funktionen, Snippets ohne Messung), und PBIR-Agent-Skills können Visual-Properties setzen. 0 · 1 · 3 ist deshalb nicht 0.

---

### F2 · Rollout trägt keine Lohnsteigerung, obwohl er über H Jahre läuft (Formel-Inkonsistenz)

**Heute:** `rollout = reportsTotal × cpr × reuseH × … × rate0` mit `reportsTotal = S.reports + (demand1000 × vAvg/1000 + demandCreator × creators) × H`. Der nachfragegetriebene Anteil entsteht in den Jahren 1 bis H, wird aber zum Jahr-0-Satz `rate0` bewertet, während `maint`, `events`, `gov`, `supUsers`, `trainRun` mit `rate = rate0 × wageF` laufen.

**Vorschlag:** `rollout = [S.reports × rate0 + demandReports × H × rate] × cpr × reuseH × compMult × libF × learnRoll × M.reuseF`, und mit F1: der Demand-Teil zusätzlich × `prodF`. Gleiches für `calcSQ()` (`build` der Null-Option enthält denselben H-Jahres-Term).

**Warum:** Konsistenz der Zeitdimension. Ohne F1 verteuert das die Stunden-Ansätze leicht; mit F1 ist es die Stelle, an der der Produktivitätsgewinn überhaupt wirken kann.

**Evidenz:** Code-Lesung `calc()`, Zeilen um `const rollout=`. Keine externe Quelle nötig.

**Konfidenz:** hoch (Logik). **Wirkung:** niedrig bei 5 Jahren (Mittelstand: 40 % des Rollouts sind Nachfrage, × 1,06 → +2,4 % Rollout), mittel bei 10 Jahren (57 % × 1,14 → +8 %).

---

### F3 · Lizenzpreis: Minimum 0 % ist über 10 Jahre unrealistisch; Preissprung bei Verlängerung fehlt

**Heute:** `licInfl` 0 · 4 · 12 % p. a., Badge F, Note „keine öffentliche Preiserhöhung bei Zebra/Inforiver auffindbar; Pro +40 % nach 10 Jahren ≈ 3,4 %/Jahr“. Die Steigerung wirkt glatt jedes Jahr; ein Modellwechsel (Developer- → Named-User, Personal/Team → Starter/Business) ist nicht darstellbar. Vertragsbindung ist nur Text (`TEXT.paid.hidden`).

**Vorschlag:**
1. `licInfl` → **1 · 4 · 10 %** (Minimum > 0; das Maximum 12 war schon großzügig und bleibt über den Sprung abgedeckt).
2. Neue Paid-Annahme `licStep` „Preissprung bei Vertragsverlängerung (je 3-Jahres-Periode)“, **0 · 10 · 30 %**, Badge S. Formelstelle: in der Lizenzschleife `for(let yv=0;yv<H;yv++){… u*Math.pow(inf,yv)*p('lic')*staffelD(u)}` den Faktor `Math.pow(1+p('licStep')/100, Math.floor(yv/3))` ergänzen; ebenso bei `licSite`. Vertragsperiode 3 Jahre als Konstante `LIC_TERM=3` (Enterprise-Agreements laufen typisch 3 Jahre; Meinung).
3. `TEXT.paid.hidden` um „Modellwechsel statt Preiserhöhung: Inforiver Developer-Lizenz 2024 abgeschafft, Zebra Paketstruktur 2025 umgestellt“ ergänzen.

**Warum:** Preisänderungen kommen bei Nischen-Vendoren selten als Listenpreis-Erhöhung, sondern als Umstellung des Preismodells oder Streichung von Alt-Tarifen („elimination of grandfathered pricing tiers“). Der Erwartungswert über 10 Jahre wird dadurch spürbar höher als 4 %, ohne dass jemals eine „Erhöhung“ auffindbar wäre.

**Evidenz:**
- Vertice SaaS Inflation Index (misst realisierte Verlängerungspreise, > 16.000 Vendoren): 8,7 % (2023), 12,2 % (2024), 11,4 % (01/2025), 14,2 % (05/2026), 16,4 % (06/2026). https://www.vertice.one/insights/saas-inflation-rate (blockiert; Zahlen aus Snippets von cfodive.com, resubly.com, prnewswire). Konfidenz auf die Größenordnung: mittel; die Index-Spitze 2026 enthält KI-Bundling großer Vendoren, nicht Nischen-Visuals.
- Inforiver: „Current customers will have their existing developer subscription honored for one additional renewal for $2,500 per developer per year, after which they will transition to the named user pricing model.“ https://inforiver.com/blog/general/inforiver-developer-based-subscription-pricing/ (Snippet; Seite blockiert). Das ist ein Preissprung durch Modellwechsel, nicht durch Listenpreis.
- Zebra BI: Pläne heute Free / Starter (bis 10 Nutzer) / Business (bis 50) / Enterprise; Snippet „Zebra BI updated their pricing plans in 2025“. https://help.zebrabi.com/kb/power-bi/pricing-plans/ (Snippet).
- Microsoft: Pro 10 → 14 $ (+40 %) und PPU 20 → 24 $ zum 01.04.2025, „upon renewal“, EA-Kunden erst zur nächsten Verlängerung. https://powerbi.microsoft.com/en-us/blog/important-update-to-microsoft-power-bi-pricing/ (Snippet). M365 E3 36 → 39 $, F1 2,25 → 3 $ (+33 %) zum 01.07.2026, ebenfalls „upon renewal“. https://www.microsoft.com/en-us/licensing/news/2026-m365-packaging-pricing-updates-faq (Snippet).
- 33 % der Vendoren haben Preisanpassungsklauseln zur Verlängerung im Vertrag (Vertice, Snippet).

**Konfidenz:** mittel. **Wirkung:** hoch bei großen Viewer-Zahlen. Rechnerisch: 10 % je 3 Jahre ergibt einen mittleren Lizenzfaktor 1,04 (5 J.) und 1,13 (10 J.) zusätzlich zu `licInfl`. Erwartungswert der Kombination ≈ 8–9 %/Jahr, das trifft den Vertice-Bereich 2023–2025, nicht die Spitze 2026.

---

### F4 · Währung: „1 $ ≈ 1 €“ ist 14 % daneben und über 10 Jahre ein Risiko in beide Richtungen

**Heute:** `lic` srcNote: „1 $ ≈ 1 € konservativ“. `LIC` Anker inforiver 25 · 33 · 60, zebra 140 · 270 · 330, enterprise 40 · 80 · 150; `licSite` 12.000 · 35.000 · 90.000 (aus 12 k$). graphomate preist in EUR (Kiel), Zebra (Ljubljana) und Inforiver/Lumel (Plano, Texas) in USD.

**Vorschlag:** Neue Paid-Annahme `fxUsdEur` „Umrechnung USD-Listenpreise“, **0,78 · 0,86 · 1,00 €/$**, Badge V für die Mitte. Formelstelle: multiplikativ auf `p('lic')` und `p('licSite')` in `calc()`, nur wenn der gewählte Lizenz-Anker in USD notiert (Inforiver, Zebra; nicht graphomate/„Mischpreis“). Alternativ ohne neue Annahme: die USD-Anker im `LIC`-Objekt einmal umrechnen (Inforiver 25 · 33 · 60 → 22 · 28 · 52) und die Kursspanne in `licInfl` als Risiko benennen.

**Warum:** Ein fester Umrechnungsfehler von 14 % ist größer als die ganze `licInfl`-Spanne über drei Jahre. Über 10 Jahre ist der Kurs zwischen Parität (2022) und ~1,25 (2018/2021) gelaufen; das ist ±12 % um die Mitte und gehört als Band hinein, nicht als Konstante. (Kursverlauf: Allgemeinwissen aus der EZB-Zeitreihe, nicht in dieser Sitzung geprüft.)

**Evidenz:** EZB-Referenzkurs 09.09.2026: 1,1652 USD/EUR; August-Mittel ≈ 1,16. https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/eurofxref-graph-usd.de.html (Snippet via finanzen.at). Inforiver-Preise 2,40–5 $/Nutzer/Monat (Snippet zebrabi.com/reviews/inforiver-review, 08/2026).

**Konfidenz:** hoch für den heutigen Kurs, mittel für das Band. **Wirkung:** mittel; Paid-Lizenz −14 % heute, was im Konzern-Preset (Lizenz dominiert) den Abstand zu OSS vergrößert.

---

### F5 · KI-Kriterium „Copilot / KI im Visual“ ist 2026 zweigeteilt: Copilot-UI (nur Core) vs. Agent-Skills auf PBIR (alle, Code-Ansätze im Vorteil)

**Heute:** `REQS.copilot` cap [1,1,1,5], Note „Copilot erstellt und bearbeitet Reports nur mit Core Visuals“; `TEXT.core.pro` „Einzige Option mit Copilot-Unterstützung“; Konflikt-Box Copilot vs. IBCS-Zertifikat. Der Rechner beschreibt Fabric Apps (Vega-Lite + React) als „fünften Weg, noch nicht modelliert“.

**Vorschlag:**
1. `REQS.copilot` behalten (Learn, Stand 09/2026: „Custom visuals: Copilot doesn't support custom visuals“, unverändert), Sub-Text präzisieren: „Copilot-Pane im Service/Desktop“.
2. Neue Zeile `REQS.agentic` „KI-gestützte Erstellung über PBIR / Agent-Skills“, Sub: „Agenten schreiben Report-JSON (PBIR); Vega-Lite-Specs und DAX-UDFs sind Text“, cap **[2, 2, 4, 5]**, def 'C', Notes: paid „Property-Schema des Vendor-Visuals ist nicht dokumentiert, Agent kann nur kopieren“, deneb „Community-Skill ‚deneb-visuals‘ (Data Goblin) erzeugt Specs und injiziert sie in visual.json“, core „Microsoft-Skills Report Design/Authoring/Planner (Preview)“.
3. `TEXT.deneb.con` „Copilot ohne Unterstützung“ ergänzen um „Agent-Skills auf PBIR ja“.

**Warum:** Zeitlich hat sich die KI-Frage 2026 verschoben: Copilot im Produkt bleibt Core-only, aber der Erstellungspfad über Dateien (PBIR seit 01/2026 Default im Service, GA geplant Q3 2026) ist für Code-Ansätze offen. Ein Kriterium, das nur den Service-Copilot abfragt, unterschätzt die KI-Readiness von Deneb systematisch und ist damit auch ein Zeit-Fehler: die Lücke schließt sich nicht von der Copilot-, sondern von der Agenten-Seite.

**Evidenz:**
- Learn, Copilot-Limitations: „Custom visuals: Copilot doesn't support custom visuals.“ https://learn.microsoft.com/power-bi/create-reports/copilot-create-reports#create-and-edit-reports (Primärquelle, MCP).
- Learn, Report Authoring skill (Preview): PBIR/PBIP, „optimized for GitHub Copilot CLI with cross-tool compatibility for VS Code Copilot, Claude Code, Cursor, Codex/Jules, and Windsurf“; Warnung: „Some visuals, including Q&A, Bing maps, and filled maps, will be deprecated soon.“ https://learn.microsoft.com/power-bi/developer/agentic/power-bi-report-authoring-skill-overview (Primärquelle).
- Learn, Update-Archiv 01/2026: PBIR Default im Service, GA Q3 2026; 06/2026: Desktop Bridge (Preview) für Agenten. https://learn.microsoft.com/power-bi/fundamentals/desktop-latest-update-archive.
- Community-Skill „deneb-visuals“ (data-goblin/power-bi-agentic-development): Vega/Vega-Lite-Specs in PBIR `visual.json` injizieren. https://skillsmp.com/creators/data-goblin/power-bi-agentic-development/plugins-custom-visuals-skills-deneb-visuals (Snippet).
- Fabric Apps (Preview 06/2026): Rayfin-Templates erzeugen React + Vega-Lite-Specs + DAX-Query-Dateien; Learn-Overview bestätigt Capacity-Pflicht und TypeScript-Datenmodell, nennt Vega-Lite nicht explizit (Vega-Lite-Nennung aus Sekundärquellen datatako.com, beyondtheanalytics.com). https://learn.microsoft.com/fabric/apps/overview.

**Konfidenz:** hoch für die Fakten, mittel für die Erfüllungsgrade. **Wirkung:** mittel auf den Anforderungs-Score (30 % Gewicht), hoch für die Argumentation auf der Konferenz.

---

### F6 · Abkündigungsrisiko Core zu niedrig: Microsoft kündigt eigene Visuals ab

**Heute:** `dep` core 0,4 · 1 · 2 % p. a., srcNote nennt nur Custom-Visual-Beispiele (Charticulator, Bing Maps Visual, OKViz, R/Python). `TEXT.core.pro`: „keine Abhängigkeit außer Microsoft“.

**Vorschlag:** `dep` core → **0,5 · 1,5 · 3 %**, srcNote ergänzen: „Q&A-Visual endet 02/2027, Bing-Maps-Visuale ‚scheduled for deprecation‘, R/Python in Embed/P2W seit 05/2026 leer, Legacy Card durch New Card abgelöst (GA 11/2025), Legacy-Matrix → pivotTable-Migration. Ein Standard, der auf einem Core-Visual-Typ sitzt, ist nicht abkündigungsfrei, nur billiger zu migrieren.“ Da `migShare` global ist, den Core-Anteil nicht senken; die geringere Migrationstiefe steckt schon in der niedrigeren Rate.

**Warum:** In der Zeitdimension ist „Microsoft kündigt nichts ab“ die falsche Nullhypothese. Der 10-Jahres-Horizont enthält mit hoher Wahrscheinlichkeit mindestens einen Generationswechsel eines Core-Visuals (Card 2025, Karten 2026/27, Q&A 2027).

**Evidenz:**
- Learn: „Q&A experiences are going away in February 2027.“ https://learn.microsoft.com/power-bi/explore-reports/end-user-q-and-a (Primärquelle).
- Learn: „The Bing Maps visual is scheduled for deprecation, with the timeline still being planned.“ https://learn.microsoft.com/power-bi/visuals/power-bi-visualization-filled-maps-choropleths (Primärquelle).
- Learn, Update-Archiv 11/2025: R/Python-Visuale in „Embed for your customers“ und Publish-to-web ab 05/2026 leer; Card visual GA. https://learn.microsoft.com/power-bi/fundamentals/desktop-latest-update-archive#november-2025-update (Primärquelle).
- Learn, Report Authoring skill: „Convert legacy card or matrix visuals to modern cardVisual and pivotTable visuals“ als Standard-Use-Case (Primärquelle, siehe F5).

**Konfidenz:** mittel. **Wirkung:** niedrig auf die Zahlen (pH 5 J.: 5,3 % → 7,7 %; Mittelstand Core +0,7 k€), mittel auf die Ehrlichkeit des Core-Textes.

---

### F7 · Deneb 2.0 ist erschienen: Major-Release-Migration als eigener Posten, Chronologie im Rechner veraltet

**Heute:** `govRun` srcNote „etwa ein Minor-Release je Jahr (1.7 07/2024, 1.8 07/2025, 1.9 03/2026)“; `events` deneb 1 · 2 · 3 mit „3 Vorfälle in 24 Monaten“; `dep` deneb 1 · 3 · 6.

**Vorschlag:**
1. Neue Deneb-Annahme `majorMigH` „Stunden je Chart-Typ bei Major-Release-Migration“ **0,5 · 2 · 6 h**, Badge E, und `majorRate` „Major-Releases je Jahr“ **0,1 · 0,2 · 0,33** (eines je 3–10 Jahre; 1.0 war 2022, 2.0 ist 2026: ein Major in vier Jahren). Formelstelle: in `events`-Nähe `major = p('majorRate') × H × S.types × p('majorMigH') × rate`, in `c.maint` addieren. Für oss analog mit Faktor 0,5 (eigenes Visual, eigene Kontrolle), paid 0 (Vendor migriert).
2. `events` deneb unverändert 1 · 2 · 3: Issue #676 (03.06.2026, offen) ist der vierte belegte Vorfall in 24 Monaten und liegt in der Spanne.
3. srcNotes aktualisieren: „2.0.0 (08.09.2026; Jahr aus Kontext beta-5 27.08., alpha-2 24.07., 1.9.1 31.03.), v2-Template-Format Breaking Change mit automatischer v1-Migration (Issue #472).“

**Warum:** Ein Minor-Release je Jahr ist Governance-Aufwand, ein Major ist Migrationsaufwand. Der Rechner hat beides in `govRun` und `events` verschmiert. Über 10 Jahre ist mit 2–3 Majors zu rechnen, und die automatische v1-Migration deckt das Template-Format, nicht Vega-/Vega-Lite-Versionssprünge (Vega-Lite 6 hat Signaturen geändert; nicht geprüft, Meinung).

**Evidenz:**
- GitHub-Releaseseite (WebFetch, verbatim): „2.0.0 · 08 Sep“, „Beta Channel (2.0.0.beta-5) · 27 Aug“, „Alpha Channel (2.0.0.alpha-2) · 24 Jul“, „1.9.1 · 31 Mar“, „1.9.0 · 15 Mar“, „1.8.2 · 07 Oct“, „1.8.1 · 07 Aug“, „1.8.0 · 16 Jul“, „1.7.2 · 04 Sep“. Jahre nicht sichtbar; Vor-Audit (03-deneb-core-opus.md): 1.7.0 = 10.07.2024, 1.8.0 = 16.07.2025, 1.9.0 = 16.03.2026 und „aktives 2.0-Beta 08/2026“. https://github.com/deneb-viz/deneb/releases.
- Issue #472 „v2 Template Format“ (02.07.2024, geschlossen „not planned“, Milestone „2.0 Stretch Goals“): „a breaking change … support loading and migration of v1 templates … to ensure backward compatibility“. https://github.com/deneb-viz/deneb/issues/472 (WebFetch).
- Issue #676 (03.06.2026, offen): Vega-Specs leer nach Desktop 2.154.1260.0 (Mai 2026). https://github.com/deneb-viz/deneb/issues/676 (WebFetch; Kommentare nicht ladbar).
- Nicht prüfbar: deneb.guide Changelog (blockiert), GitHub-API (nicht freigeschaltet). Ob 2.0.0 schon in AppSource ist, weiß ich nicht.

**Konfidenz:** mittel für Release und Breaking-Change-Charakter, niedrig für die Stundenwerte. **Wirkung:** niedrig bei 3–5 Jahren, mittel bei 10 (Mittelstand Deneb: 0,2 × 10 × 5 Typen × 2 h ≈ 20 h ≈ 2 k€).

---

### F8 · Wartung klingt nicht ab: `maintDecay` widerspricht der Literatur

**Heute:** `maintDecay` 80 · 90 · 97 % je Jahr, srcNote „Modellierungs-Notlösung, keine Empirie … Literatur kennt eher steigende Wartung“. Wirkt auf `maint` (alle Ansätze) und `calcSQ` (Null-Option). `maintBase` enthält 0,3 × Rollout, der Bestand wächst also schon; das Abklingen läuft trotzdem auf den ganzen Posten.

**Vorschlag:** `maintDecay` → **85 · 95 · 103 %**, Label „Wartungs-Trend je Jahr“ statt „Abklingfaktor“, Sub „< 100 = Vorlagen stabilisieren sich, > 100 = Code-Decay und wachsender Bestand“. Ansatzspezifisch wäre ehrlicher (Paid: Vendor trägt die Codebasis, Trend < 100; Deneb/Core: eigene Codebasis, Trend ≥ 100), aber das wäre eine neue `OPTP`-Zeile; Minimalvariante ist der globale Wert.

**Warum:** Die einzige Empirie zum Thema zeigt steigende, nicht sinkende Wartung bei alternden Codebasen. Bei 10 Jahren ist das der zweitgrößte Zeit-Effekt nach F1 und wirkt ihm entgegen; beide gehören gemeinsam eingebaut, sonst kippt das Modell einseitig.

**Evidenz:**
- Lehman’s Laws (Continuing Change, Increasing Complexity), Überblick: Herraiz et al., „On the Evolution of Lehman’s Laws“, https://plg.uwaterloo.ca/~migod/papers/2013/lehmanPaper.pdf (Snippet).
- Eick et al., Code Decay: Wartung wird mit dem Alter zeit- und aufwandsintensiver (Snippet via academia.edu / researchgate, Sekundär).
- Wartungsanteil am Lebenszyklus 60–80 % (Schach 1999: 67 %; Pigoski 2001: > 80 %; „60/60-Regel“), Sekundärzitate, https://ventionteams.com/enterprise/software-maintenance-costs (Snippet).
- Für Power BI konkret: Core/SVG-Regressionen 2025 (New Card px → %, SVG leer im Service) und Deneb #676 zeigen, dass der Bruch-Bedarf nicht sinkt (Vor-Audit 03).

**Konfidenz:** mittel (Richtung), niedrig (Höhe). **Wirkung:** mittel für Deneb/Core/OSS bei 10 Jahren: `maintYears` steigt von 6,38 auf 7,92 (+24 %), bei 5 Jahren von 4,06 auf 4,50 (+11 %); auf das Total je nach Wartungsanteil +1 bis +4 %.

---

### F9 · Restwert am Horizontende: real, aber kleiner als die Kritik vermutet

**Heute:** Kein Restwert (Prämisse P7 der Grundannahmen-Kritik). Bei 3 Jahren zahlt jeder Stunden-Ansatz den vollen Aufbau; Paid zahlt drei Jahresmieten.

**Vorschlag:** Neue Annahme `residual` „Restwert des Aufbaus am Horizontende, % von Setup + Entwicklung + Chart-Aufbau“, `v: {paid:[0,0,0], oss:[0,25,50], deneb:[10,35,60], core:[10,35,60]}`, Badge E. Formelstelle: `c.residual = p('residual')/100 × (setup+dev+build) × Math.max(0, 1 − H/10)` (nach 10 Jahren nichts mehr), in `c.total` abziehen und in `c.cf[H]` als negativen Betrag (wirkt auch im Barwert). Paid 0, weil die Report-Definitionen am Lizenz-Visual hängen (`REQS.exit` cap 1).

**Warum:** Investitionsrechnung ohne Liquidations-/Restwert ist unvollständig; bei 3 Jahren ist der Fehler am größten. Aber: der Aufbau ist im Rechner klein gegen den Rollout (Mittelstand Deneb: Setup 18 h + 5 × 12 h = 78 h ≈ 8 k€ von ~100 k€). Der Restwert des Rollouts (die ausgerollten Reports laufen weiter) ist bei allen Ansätzen ähnlich und ändert die Rangfolge nicht; ihn wegzulassen ist vertretbar.

**Evidenz:** keine externe; Standard der Kapitalwertmethode (Restwert im letzten Jahr). Meinung.

**Konfidenz:** niedrig für die Höhe, hoch für „gehört rein“. **Wirkung:** niedrig (3–5 % des Totals bei 3 Jahren, < 2 % bei 5).

---

### F10 · Fabric-Capacity über die Zeit: Overage 3× PAYG bepreist die lineare Näherung, Reservierung läuft in PAYG aus

**Heute:** `capacityCost` 0 · 0 · 0 mit Presets F2 1.900 · 2.500 · 3.200, F8 7.500 · 10.000 · 13.000, F64 60.000 · 85.000 · 118.000 €; `cuUplift` core 2 · 6 · 15 %; srcNote „real springt die SKU“. Keine Preissteigerung, kein Reservierungs-Ende.

**Vorschlag:**
1. Presets belassen (siehe Evidenz, sie decken PAYG bis Reserved ab).
2. Neuer Schalter `S.capAtLimit` „Capacity läuft nahe am Limit“ (Default aus): `capacity = capacityCost × cuUplift/100 × H × (capAtLimit ? 3 : 1)`. Begründung: Mehrverbrauch über der SKU wird seit 2026 (Preview) als Overage mit dem 3-fachen PAYG-Satz abgerechnet; das ist der reale Grenzpreis der „linearen Näherung“ und ersetzt den SKU-Sprung nach oben.
3. srcNote ergänzen: „Reservierung 1 oder 3 Jahre ≈ −41 % gegen PAYG; 3 Jahre = 3 × 1 Jahr, kein Zusatzrabatt (Preisliste 04/2026); Fabric-Reservierungen verlängern sich laut Fabric-Doku nicht automatisch, nach Ablauf gilt PAYG (+69 %). Bei 5- und 10-Jahres-Horizonten ist das ein Kostenrisiko für alle Ansätze gleich, außer der Core-Anteil ist der Grund für den Overage.“
4. Keine jährliche Capacity-Preissteigerung: der CU-Preis (0,18 $/CU-h) ist seit 2023 unverändert (Snippets), keine Ankündigung gefunden. Microsofts Preisanpassungen kamen bisher über die Nutzerlizenzen (Pro +40 %), nicht über die CU.

**Evidenz:**
- Learn, Capacity overage (Preview): „charges at three times the pay-as-you-go rate, but only for usage that exceeds your current capacity“; Empfehlung, das Overage-Limit unter ein Drittel der Tages-CU-Stunden zu halten, weil dort die Kosten dem Hochskalieren entsprechen. https://learn.microsoft.com/fabric/enterprise/capacity-overage-overview (Primärquelle).
- Learn, Fabric-Reservierungen: „When the reservation expires, Fabric capacity workloads continue to run but are billed at the pay-as-you-go rate. Reservations don't renew automatically.“ https://learn.microsoft.com/azure/cost-management-billing/reservations/fabric-capacity (Primärquelle; die allgemeine Azure-Reservierungsseite sagt „autorenew on by default“, Widerspruch innerhalb Learn, im Zweifel prüfen).
- Preise (Snippets, Azure-Preisliste blockiert): 0,18 $/CU-h PAYG; Reserved 938 $/CU/Jahr (−40,5 %); F64 PAYG ≈ 8.410 $/Monat ≈ 101 k$/Jahr, Reserved ≈ 5.003 $/Monat ≈ 60 k$/Jahr; 3-Jahres-Reservierung 2.814 $/CU = 3 × 1 Jahr, in der Preisliste ab 01.04.2026. https://solv-systems.com/resources/microsoft-fabric-pricing-2026, https://www.epcgroup.net/insights/microsoft-fabric-pricing-f-sku-cost-model. EUR West Europe nur ein Einzelbeleg: F4 Reserved ≈ 328 €/Monat (07/2026) → F64 Reserved ≈ 63 k€/Jahr, PAYG ≈ 106 k€/Jahr (agilytic.com, Snippet). Die Presets F64 60 · 85 · 118 k€ passen.

**Konfidenz:** hoch für Overage und Reservierungsregel, mittel für EUR-Werte. **Wirkung:** niedrig (Default 0), mittel für Core-Nutzer mit F-SKU nahe am Limit.

---

## Nicht als Fund geführt, aber gesehen

- **Viewer-Wachstum ohne Sättigung:** 10 %/Jahr über 10 Jahre = 2,6×; Großkonzern 10.000 → 26.000 Viewer. Die srcNote warnt schon („Deckel prüfen“). Ein Parameter „maximale Viewer (Belegschaft)“ mit logistischer Kurve wäre sauber, ist aber ein UI-Eingriff; die Staffel je Jahr fängt den Lizenzeffekt ab.
- **Vendor-Konsolidierung:** Für Zebra BI, Lumel (Inforiver) und graphomate keine Übernahme oder Finanzierungsrunde 2025/26 auffindbar; graphomate: 10 Mitarbeiter, ohne Investoren (Tracxn-Snippet). Das stützt `dep` paid 1 · 2 · 4 %; Konsolidierung ist über 10 Jahre trotzdem plausibel (Meinung), und die Folge wäre eher F3 (Preis-/Modellwechsel) als Abkündigung.
- **Wissensverlust kumulativ:** `trainRun` ist linear in `churn × H`; über 10 Jahre bei 11 % Fluktuation sind mit Wahrscheinlichkeit ~47 % beide ursprünglichen Vorlagen-Bauer weg (2 Owner, (1 − 0,89^10)^2). Der Rechner bepreist die Nachschulung, nicht den Verlust undokumentierter Specs. Das gehört zu F8 (Wartung steigt) und ist dort implizit; ein eigener Kopplungsfaktor wäre eine weitere unbelegte Annahme.
- **Zertifizierungsregeln:** Keine Änderung der Microsoft-Zertifizierungsanforderungen 2025/26 gefunden (Learn: Rendering Events API, keine externen Aufrufe, kein `eval`, keine minifizierten Bundles). API 1.1 und älter sind seit 2018 abgekündigt, seither keine weitere Abkündigung. Report Server Januar 2026 liefert Visuals-API v5.10.0. Kein Zeit-Fund.
- **DAX-UDFs GA 06/2026** bestätigt (Learn), mit Einschränkungen: keine Anzeigeordner, keine OLS-Vererbung, keine Rekursion. Das stützt die Vor-Audit-Änderung an `govAudit` core und ist Teil von F1 (Core-Produktivität).

## Was jemand mit freiem Netz nachholen sollte

1. deneb.guide/docs/changelog: Datum und Inhalt von 2.0.0, Migrationshinweise, AppSource-Status.
2. vertice.one/insights/saas-inflation-rate: Jahreswerte 2023–2026 primär lesen; Methodik (Verlängerungspreise vs. Listenpreise).
3. metr.org/blog/2026-02-24-uplift-update: das genaue Konfidenzintervall der Late-2025-Ergebnisse.
4. Azure-Preisliste West Europe in EUR für F2/F8/F64 PAYG und Reserved, mit Datum.
5. EZB-Zeitreihe USD/EUR 2016–2026 für das Band in F4.
