# Kritische Prüfung der OPTP-Annahmen für `deneb` und `core`

Datei: `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html`, Array `const OPTP` (Z. 490–514)
Rechenkern: `calc()` (Z. 612–687), Erfüllungsgrade `REQS` (Z. 437–455), Panel: `sessions/visual-standards-rechner-reviews/agg.json`
Prüfdatum: 10.09.2026 · Prüfer: Claude Opus 5 · Recherche: WebSearch/WebFetch + Microsoft-Learn-MCP

**Netzstatus:** Web war grundsätzlich erreichbar. Der Egress-Proxy blockiert aber mehrere Schlüsseldomains:
`deneb.guide`, `deneb-viz.github.io`, `blog.crossjoin.co.uk`, `www.powerofbi.org`, `www.excelized.de`, `www.ibcs.com`.
Für diese Quellen konnte ich nur Suchmaschinen-Snippets auswerten — das ist unten jeweils als „(nur Snippet)“ markiert.
`github.com` und `learn.microsoft.com` waren voll abrufbar. **Ich habe keine Quelle erfunden**; wo nichts gefunden wurde, steht „keine“.

---

## 0. Wie die Parameter im Modell wirken (Kurzfassung, damit die Urteile lesbar sind)

| Formelstelle | Wirkung |
|:--|:--|
| `base = setupH + devH + types·firstH + rollout` | Aufbau; `rollout = reportsTotal · cpr · reuseH · reuseF` |
| `maint = (setupH + devH + types·firstH + 0.3·rollout) · maint% · Σdecay · variantEff · wageF` | `Σdecay` bei H=5, decay 0.85 ≈ **3,71** → 34 % werden über 5 Jahre zu **1,26×** Aufbaubasis, mit `variantEff` 1,5 zu **1,89×** |
| `events = events · fixH · rate · H` | **kein** Abklingen, **keine** Skalierung mit Chartzahl |
| `variantEff = 1 + (variantF−1)·guardrail`, `guardrail = (6 − cap('design'))/4` | `design`-cap ist für deneb **und** core = 2 → guardrail **1,0** (paid 0,25 / oss 0,5). Skaliert `maint` **und** `govIntake` |
| `govOnce = govIntake · types · variantEff · rateInt0 · govF · sizeF` | govIntake wird **je Chart-Typ** verrechnet |
| `gov = govOnce + (govRun + govAudit)·H·sizeF·rateInt·govF + …` | govRun und govAudit laufen **ungedämpft** über den ganzen Horizont |
| `train0 = owners·(trainH·rateInt0 + course) + (creators−owners)·lightH·rateInt0` | Erstschulung **rollendifferenziert** |
| `trainRun = creators · churn% · H · (trainH + rampH) · rateInt` | Fluktuation **nicht** rollendifferenziert → **jeder** Ersteller kostet bei Abgang `trainH + rampH` |
| `rate0 = rateInt·intFactor·(1−ext) + rateExt·ext` | `ext` hebt den Stundensatz für Aufbau/Rollout/Wartung/Fixes |
| `capacity = capacityCost · cuUplift% · H` | wirkungslos, solange `capacityCost = 0` (Default) |
| `support = support · H`, deterministisch mit `pertMean` | **[0,0,9000] ergibt 1.500 €/Jahr**, nicht 0 |

---

## (a) Parameter-Tabelle

Legende Urteil: **behalten** · **ändern** · **unsicher/plausibel** (= keine Evidenz, aber logisch konsistent, kein Änderungsvorschlag)

### deneb

| id | aktuell [min·mode·max] | Evidenz | Urteil | Vorschlag | Konfidenz |
|:--|:--|:--|:--|:--|:--|
| `cuUplift` | 0 · 2 · 5 % | keine belastbare Messung. Direkt: Deneb rendert client-seitig im Browser; der Capacity-Anteil ist die DAX-Abfrage wie bei jedem Visual. 30k-Zeilen-Fenster ist **kein** Deneb-Spezifikum, sondern das SDK-Hardlimit **aller** Custom Visuals ([Learn: fetch-more-data](https://learn.microsoft.com/power-bi/developer/visuals/fetch-more-data), „hard limit of a 30K row data view“, `fetchMoreData` bis 1.048.576 Zeilen / 100 MB) | **ändern** | **0 · 1 · 4** — Deneb auf paid/oss-Niveau, weil die Zeilenlast dieselbe Query ist und das Rendering nicht auf der Capacity läuft. Der Subtitel „Deneb-Zeilenfenster“ als CU-Treiber ist sachlich falsch und sollte gestrichen werden | mittel |
| `ext` | 10 · **50** · 90 % | keine. freelancermap-Sätze stützen nur `rateExt`, nicht den Anteil | **ändern** | **0 · 40 · 85** — Untergrenze muss 0 sein: das komplett interne Deneb-Team ist der Normalfall in Häusern, die sich bewusst für „Design als Code“ entscheiden (die Daten-WG selbst ist das Beispiel). Ein `min` von 10 % erzwingt selbst im P10-Fall externe Beauftragung und macht Deneb in **jedem** Szenario teurer als core (min 0). Das ist eine strukturelle Schieflage, kein Schätzwert | mittel |
| `setupH` | 9 · 18 · 28 h | Panel (agg.json, 20 simulierte Profile — **keine Menschen**). Plausibilisierung: Deneb ist ein AppSource-zertifiziertes Visual → nur Tenant-Freigabe, kein Code-Review | **behalten** | — | mittel |
| `firstH` | 7 · 12 · 18 h | Panel. Kein externer Beleg für Stunden je IBCS-Chart (auch die eigene Recherche sagt: „Stunden pro IBCS-Chart je Option: KEINE Quelle“) | **unsicher/plausibel** | — (Spanne ist mit 7–18 h ehrlich breit) | niedrig |
| `reuseH` | 1 · 2,5 · 4,5 h | Panel; Template-Bibliotheken existieren belegbar (vegaviz 269 Specs MIT, DenebIBCS, Deneb-Showcase — aus recherche.md, Repos nicht einzeln nachgeprüft) | **behalten** | — | mittel |
| `trainH` | 20 · **35** · 58 h | keine Preis-/Dauerquelle für ein Deneb-Curriculum gefunden. Indirekt: „steep learning curve“ ist Community-Konsens (Snippets), Deneb-Doku selbst nicht abrufbar | **unsicher/plausibel** | — (35 h ≈ 1 Trainingswoche; das ist für Vega-Lite + Deneb-Spezifika nicht überzogen). **Aber siehe rampH — die Kombination ist das Problem, nicht dieser Wert** | niedrig |
| `lightH` | 1,5 · 2,75 · 4,5 h | Panel | **behalten** | — | mittel |
| `rampH` | 40 · **120** · 240 h | **keine** — kein Panel-Wert (steht nicht in agg.json), keine Literatur, keine Messung. Reine Setzung | **ändern** | **24 · 70 · 180** und zusätzlich **Modellfix** (siehe Abschnitt b): `rampH` darf nicht auf *alle* Ersteller angewendet werden. Begründung: 120 h = 3 Personenwochen **zusätzlich** zu 35 h Schulung = 155 h je Abgang. Bei Konzern-Preset (25 Ersteller, 15 % Fluktuation, 5 Jahre, 84 €/h) sind das **244.000 €** allein für Fluktuationsschulung — der mit Abstand größte Deneb-Posten, und er steht auf null Evidenz | mittel |
| `supH100` | 3 · 6 · 10 h | Panel. Plausibel: Deneb-Charts sind interaktiv (Tooltip/Cross-Filter), also weniger „warum kann ich hier nicht klicken“-Tickets als core | **behalten** | — | mittel |
| `govIntake` | 4 · **12** · 30 h/Chart-Typ | Deneb ist **Microsoft-zertifiziert** (AppSource) — bestätigt: „Deneb is certified by Microsoft… can be exported to PDF or displayed in emails“ ([marketplace.microsoft.com](https://marketplace.microsoft.com/en-us/product/power-bi-visuals/coacervolimited1596856650797.deneb), Snippet + Deneb-Doku via Suche). Security-Review/AVV fällt damit **einmal für das Visual** an, nicht je Chart-Typ | **ändern** | **1 · 4 · 10** — 12 h × 5 Typen = 60 h Freigabeaufwand für **ein** zertifiziertes Visual ist nicht begründbar; Deneb liegt hier 6× über core, obwohl der Unterschied genau eine einmalige Tenant-Freigabe ist. Der per-Typ-Aufwand, der bleibt (Standard-Review durch Fachbereich/Architektur), steckt laut Panel-Notiz bereits in `firstH` („inkl. … Doku des Standards“) → Doppelzählung | mittel–hoch |
| `govRun` | 12 · **32** · 78 h/Jahr | Deneb-Releasekadenz belegt ~**1 Minor pro Jahr**: 1.7.0 = 10.07.2024, 1.8.0 = 16.07.2025, 1.9.0 = 16.03.2026, dazu Patches 1.7.1/1.7.2/1.8.1/1.8.2 ([github.com/deneb-viz/deneb/releases](https://github.com/deneb-viz/deneb/releases); Datumsangaben aus Suchsnippets der blockierten deneb.guide-Blogposts). AppSource-Zertifizierungslauf ≈ 2 Monate (1.9 Ende 01/2026 eingereicht → Rollout 26.03.2026) | **ändern** | **6 · 16 · 40** — deneb bekommt aktuell **doppelt so viel** laufende Governance wie paid (16 h), obwohl kommerzielle Vendoren deutlich häufiger releasen und zusätzlich Lizenz-/Vertragspflege erzeugen. Ein Visual mit einem Release pro Jahr kann nicht der teuerste Versions-Review-Fall sein | mittel–hoch |
| `govAudit` | 6 · **16** · 40 h/Jahr | keine. Kein Beleg für Revisionsaufwand je Visual-Ansatz | **unsicher/plausibel**, tendenziell zu hoch | optional **4 · 12 · 32**. Gegenargument zur aktuellen Höhe: Vega-Lite-Specs sind Text und diff-fähig (`version`-cap deneb = 5, höchster Wert im Modell) — genau das senkt Prüfaufwand. Das Modell belohnt die Diff-Fähigkeit im Nutzwert, bestraft sie aber in den Kosten | niedrig |
| `course` | 0 · 400 · 1.500 € | Kein öffentlich bepreistes Deneb-/Vega-Lite-Präsenztraining gefunden. Gefunden: Enterprise-DNA-Deneb-Kurs (Abo-Modell, Preis nicht ausgewiesen), LinkedIn Learning; als Referenz allgemeine 2-Tages-Power-BI-Schulung PC College **1.640 € netto** (Snippet) | **behalten** | — Mode 400 € (Abo/Selbstlernpfad) und Max 1.500 € (Inhouse-Workshop) sind mit der 1.640-€-Referenz konsistent | mittel |
| `maint` | 11 · **19** · 30 % | Panel. Literatur-Anker (recherche.md, Primärquelle unverifiziert): 15–25 % p. a., reguliert 25–40 % | **behalten** | — 19 % liegt sauber im „normalen“ Band | mittel |
| `events` | 1 · **2** · 3 /Jahr | **belegt, 3 Vorfälle in ~2 Jahren**: (1) PDF-Export leer nach PBI-Desktop 2.145.1602.0 (05.08.2025) — [Issue #553](https://github.com/deneb-viz/deneb/issues/553), von Deneb als Power-BI-Limitation geschlossen, betraf auch ein zweites zertifiziertes Visual; (2) Rendering-Ausfall unter PBI Desktop 2.154.1260.0 (Mai 2026), gemeldet 03.06.2026 — [Issue #676](https://github.com/deneb-viz/deneb/issues/676); (3) Tooltip-Regression nach Auto-Update auf Deneb 1.6.1.0 (Fabric Community). Zusätzlich: **Deneb 2.0 ist explizit ein Breaking Change** am Template-Format, mit angekündigter v1-Migration ([Issue #472](https://github.com/deneb-viz/deneb/issues/472)) | **behalten** | — 2,0/Jahr ist durch drei dokumentierte Vorfälle in 24 Monaten plus anstehendes 2.0 gut getragen. Bester belegte Parameter im ganzen deneb-Block | hoch |
| `fixH` | 3 · 6,5 · 12 h | Panel; die belegten Vorfälle (#553, #676) sind Analyse + Workaround/Warten, nicht Neubau | **behalten** | — | mittel |
| `dep` | 2 · **4** · 8 %/Jahr | Ein-Maintainer-Risiko real (Daniel Marsh-Patrick). Gegenevidenz für Stabilität: durchgehende Releases 2020–2026, aktives 2.0-Beta 08/2026, MIT-Lizenz, AppSource-zertifiziert. **Entscheidend:** die Assets sind Vega-Lite-Specs (BSD-3-Standard), kein Deneb-proprietäres Format — und Microsoft liefert mit Fabric Apps selbst ein Vega-Lite-Template (recherche.md, Learn: fabric/apps) | **ändern** | **1 · 3 · 6 %** — nicht wegen geringeren Projektrisikos, sondern weil `risk = pH · (setup+dev+build) · migShare` bei Deneb überzeichnet: `migShare` 80 % unterstellt Neubau, aber Vega-Lite-Specs überleben den Tod des Wirtsvisuals. Sauberer wäre ein deneb-spezifischer `migShare` von ~30–50 %; solange der global ist, ist die Senkung von `dep` der zweitbeste Hebel | mittel |
| `support` | 0 · 0 · **9.000 €** | **verifiziert**: GitHub-Sponsors-Stufen 5 / 50 (Bronze, ~1 h) / 150 (Silver, ~2 h) / 250 (Gold, ~3 h) / **750 $ (Platinum, ~15 h + bis 3 Pair-Sessions)** pro Monat ([github.com/sponsors/deneb-viz](https://github.com/sponsors/deneb-viz)). 750 $ × 12 = 9.000 **$** ≈ 8.300 € | **ändern** | **0 · 0 · 3.600 €** (= Gold, 250 $/Mon) **oder** Einheit auf $ korrigieren. Zwei Fehler: (1) $-Betrag steht in einem €-Feld; (2) **wirkungsrelevant**: der deterministische Pfad nutzt `pertMean = (0+4·0+9000)/6 = **1.500 €/Jahr**`, also **7.500 € über 5 Jahre** — für einen Posten, dessen eigener srcNote sagt „Default 0, weil niemand zahlen muss“. Der Max-Wert erzeugt eine Phantomkosten-Erwartung. Platinum (15 h Support/Monat) ist zudem kein realistischer Default, sondern die Obergrenze für ein Haus, das Deneb strategisch mitfinanziert | **hoch** |

### core

| id | aktuell [min·mode·max] | Evidenz | Urteil | Vorschlag | Konfidenz |
|:--|:--|:--|:--|:--|:--|
| `cuUplift` | 2 · **6** · 15 % | keine Messung. Direkt/plausibel: SVG-Strings werden **in der Engine** per DAX erzeugt (echte CU-Last), nicht im Browser. Snippet-Ebene: „SVGs add some overhead, especially with large datasets“. Der 32.766-Zeichen-Anker ist **eine Power-Query-/Spaltengrenze, nicht die DAX-Stringgrenze** (~2,1 Mio. Zeichen) — Chris Webbs Original war blockiert, das Snippet ist aber eindeutig | **unsicher/plausibel** | — Richtung (core > deneb > paid/oss) ist sachlich richtig. **Aber**: Wirkung nur, wenn `capacityCost > 0`; Default 0 → Parameter schläft. Die Begründung im srcNote („SVG-Strings“) sollte präzisieren, dass es um DAX-Query-Kosten geht, nicht um Stringlänge | niedrig |
| `ext` | 0 · 30 · 70 % | keine | **behalten** | — (min 0 ist korrekt und genau das, was deneb fehlt) | mittel |
| `setupH` | 5 · **14** · 22 h | Panel. Plausibel: keine Freigabe, keine Beschaffung | **behalten** | — | mittel |
| `firstH` | 10 · **16** · 27 h | Panel. **Gegenevidenz seit Panel-Datum:** DAX-UDFs sind seit **Juni-2026-Release GA** in Desktop **und** Service ([Learn: DAX UDFs](https://learn.microsoft.com/dax/best-practices/dax-user-defined-functions)); fertige IBCS-UDF-Pakete existieren (DaxLib `PowerofBI.IBCS`, [avatorl/dax-udf-svg-ibcs](https://github.com/avatorl/dax-udf-svg-ibcs)) | **unsicher/plausibel**, tendenziell leicht zu hoch | optional **8 · 14 · 26**. Wer eine UDF-Bibliothek installiert, baut den ersten Chart nicht von null. Symmetrisch zu Deneb-Templates — das Panel hat den Template-Vorteil bei deneb anerkannt, den UDF-Vorteil bei core aber offenbar nicht (UDF-GA war zum Panel-Zeitpunkt 09/2026 erst 3 Monate alt) | niedrig–mittel |
| `reuseH` | 2 · **4** · 6,5 h | Panel; Panel-Profil E11 sagt selbst „reuseH bleibt dank Measure-Bibliothek niedrig“, der Median liegt trotzdem bei 4 h (= 1,6× deneb) | **unsicher/plausibel** | — Die 4 h sind gegenüber deneb 2,5 h der teuerste core-Hebel im Rollout (`rollout` skaliert mit `reportsTotal · cpr`). Ohne Messung nicht widerlegbar, aber der Abstand zu deneb ist die Stelle, an der ein Fehler am meisten kostet | niedrig |
| `trainH` | 18 · **28** · 43 h | Panel. Gegenevidenz: DAX-UDF-Limits sind real und schulungsrelevant (keine Rekursion, kein Overloading, **keine Anzeigeordner**, keine Übersetzungen, OLS vererbt nicht, kein IntelliSense in Visual Calculations, Parser-Inkonsistenzen — [Learn](https://learn.microsoft.com/dax/best-practices/dax-user-defined-functions#considerations-and-limitations)) | **behalten** | — 28 h für „DAX + SVG-Syntax + URL-Encoding + Grenzen der Core-Visuals“ ist eher knapp als hoch | mittel |
| `lightH` | 1,25 · 3 · 5 h | Panel | **behalten** | — | mittel |
| `rampH` | 24 · **80** · 160 h | **keine** — wie bei deneb kein Panel-Wert, reine Setzung | **ändern** | **16 · 50 · 130** + derselbe Modellfix wie bei deneb. 28 + 80 = 108 h je Abgang; im Konzern-Preset **170.000 €** Fluktuationsschulung | mittel |
| `supH100` | 5 · **9,5** · 16 h | Panel. Sachlich gestützt: SVG-Measures sind statische Bilder ohne Tooltip/Cross-Highlight (`interact`-cap core = 2) → mehr Rückfragen. Zusätzlich belegt: **Desktop ≠ Service** bei SVG (Service sanitisiert strenger, `#`, `%`, `<`, `>`, Anführungszeichen müssen URL-encodiert sein) → klassischer Ticket-Treiber | **behalten** | — | mittel–hoch |
| `govIntake` | 0 · 2 · 6 h | logisch zwingend: nichts freizugeben | **behalten** | — | hoch |
| `govRun` | 1 · 3 · 10 h/Jahr | logisch zwingend: nichts einzuspielen | **behalten** | — | hoch |
| `govAudit` | 8 · **20** · 50 h/Jahr | Der srcNote stützt sich auf „175 Measures je Abweichungsdiagramm“ (Daten-WG BITT n.75, aus recherche.md, nicht unabhängig verifizierbar — powerofbi.org blockiert). **Diese Zahl ist Vor-UDF-Stand.** Seit UDF-GA 06/2026 ersetzt eine parametrierte Funktion die Measure-Kopien; Revision prüft dann *eine* Funktion statt 175 Measures | **ändern** | **4 · 12 · 36 h** — Begründung: Der Prüfgegenstand hat sich objektiv verkleinert. Gegenläufig, und deshalb keine stärkere Senkung: UDFs lassen sich **nicht in Anzeigeordner** legen, tragen **kein OLS** weiter und haben in mehreren Editoren **kein IntelliSense** ([Learn, Considerations](https://learn.microsoft.com/dax/best-practices/dax-user-defined-functions#considerations-and-limitations)) — die Nachvollziehbarkeitslücke bleibt also, sie ist nur kleiner geworden | mittel |
| `course` | 0 · 300 · 1.200 € | Referenz PC College 2-Tage-Power-BI ≈ 1.640 € netto (Snippet); DAX-/SVG-Spezialkurse nicht öffentlich bepreist gefunden | **behalten** | — | mittel |
| `maint` | 20 · **34** · 52 % | Panel; **Untermauerung durch dokumentierte Regressionen**: New-Card-Visual Bildgröße wechselte mit dem **November-2025**-Release von px auf %, Rendering Desktop ≠ Service; „SVG Image URL in Card (New) not working (März 2025)“; „SVG images display correctly in Desktop but are blank in the Service“; New-Card-Bug mit Small Multiples + SVG (alles Fabric-Community-Threads, per Suche belegt). Literatur: 15–25 % normal, 25–40 % reguliert | **ändern (nur `min`)** | **12 · 34 · 52 %** — Mode und Max bleiben, das `min` von 20 % ist zu hoch. Alle belegten Regressionen betreffen das **New Card Visual**; Tabelle/Matrix gelten als der stabile Pfad. Ein bewusst auf Matrix/Tabelle beschränkter SVG-Standard hat kein 20-%-Wartungs-Floor. Aktuell kann der Nutzer diesen disziplinierten Fall im Modell **nicht abbilden** — der P10-Core ist per Konstruktion teurer als der P50-Deneb | mittel–hoch |
| `events` | 2 · **3,25** · 5,25 /Jahr | dieselbe Belegkette wie `maint` (mind. 3–4 SVG-relevante Regressionen 03/2025–11/2025) | **behalten** | — 3,25/Jahr ist durch die Vorfalldichte tatsächlich getragen. Einschränkung: `events` skaliert im Modell **nicht** mit der Zahl der Chart-Typen und klingt nicht ab | mittel–hoch |
| `fixH` | 5 · 9,5 · 17 h | Panel; SVG-Fixes sind Encoding-/Sizing-Detektivarbeit über Desktop **und** Service | **behalten** | — | mittel |
| `dep` | 0,4 · 1 · 2 %/Jahr | logisch: Abkündigungsrisiko = Microsoft entfernt Bild-/SVG-Rendering in Core-Visuals. Praktisch null; die belegten Abkündigungen (Charticulator 2023, Bing Maps 2025, R/Python-Embedded 2026) trafen **Custom**-/Zusatzvisuals | **behalten** | — | hoch |
| `support` | 0 · 0 · 0 € | Microsoft-Support ist im Pro/PPU-/Capacity-Preis enthalten (`sla`-cap core = 5) | **behalten** | — | hoch |

---

## (b) Bias und Doppelzählung

### B1 — Der größte Einzelbefund: `trainRun` ist nicht rollendifferenziert (Modellfehler, kein Annahmefehler)

```js
const train0   = owners*(p('trainH')*rateInt0 + p('course')) + (S.creators-owners)*p('lightH')*rateInt0;   // Z. 646
const trainRun = S.creators*(g('churn')/100)*H*(p('trainH')+p('rampH'))*rateInt;                            // Z. 647
```

Die Erstschulung unterscheidet sauber zwischen Vorlagen-**Bauern** (`trainH`) und Vorlagen-**Nutzern** (`lightH`).
Bei Fluktuation fällt diese Unterscheidung weg: **jeder** ausgeschiedene Ersteller — auch der reine Template-Befüller —
wird mit `trainH + rampH` neu aufgebaut. Das trifft exakt die beiden Ansätze mit hohem `trainH`/`rampH`:

| Ansatz | `trainH + rampH` | Fluktuationskosten Konzern-Preset (25 Ersteller, 15 % p. a., H=5, ≈84 €/h) |
|:--|--:|--:|
| paid | 24,5 h | ≈ 39.000 € |
| oss | 47 h | ≈ 74.000 € |
| **core** | 108 h | **≈ 170.000 €** |
| **deneb** | 155 h | **≈ 244.000 €** |

Deneb zahlt hier ~205.000 € mehr als paid, core ~131.000 € mehr — auf Basis eines Parameters (`rampH`),
der **weder im Expertenpanel noch in irgendeiner Quelle** vorkommt. Das ist die einflussreichste unbelegte Annahme des Modells.
Empfehlung: `trainRun = churn·H·[owners·(trainH+rampH) + (creators−owners)·(lightH + 0,25·rampH)]·rateInt`.

### B2 — `rampH` gegen `trainH`: Teil-Doppelzählung

`rampH` ist definiert als „zusätzlich zur Schulung“, was formal sauber ist. Praktisch beschreiben 35 h Kurs + 120 h
Einarbeitung dieselbe Fähigkeit („Vega-Lite beherrschen“) zweimal, und es gibt keine Quelle, die die Aufteilung stützt.
Bei paid ist die Summe 24,5 h, bei deneb 155 h — das Verhältnis 6,3 : 1 ist eine Setzung, kein Messwert.

### B3 — `maint` gegen `events × fixH`

Beide Posten decken „Report kaputt nach Update“ ab. Die Panel-Notiz zu `maint` begründet die 34 % bei core
**wörtlich** mit „Core-Workarounds brechen bei Monatsupdates“ — also mit genau dem Sachverhalt, für den `events`
existiert. Bei core sind das über 5 Jahre ≈ 1,89 × Aufbaubasis (maint, mit `variantEff` 1,5) **plus** ≈ 154 h (events).
Ich halte die Überlappung für real, aber nicht für vollständig (maint enthält auch fachliche Änderungswünsche).
Empfehlung: nicht beide senken, sondern das `min` von `maint` freigeben (siehe Tabelle) und im UI-Text sauber trennen:
`maint` = geplante Änderungen, `events` = ungeplante Brüche.

### B4 — `govAudit` gegen `maint`, und die fehlende Dämpfung

`govAudit` läuft ungedämpft über den Horizont (`(govRun+govAudit)·H`), `maint` klingt mit 85 %/Jahr ab.
Das ist inhaltlich verteidigbar (Revision prüft jährlich neu), führt aber dazu, dass core bei 1.500 Viewern
(`sizeF` 1,3) allein für den Prüfnachweis ≈ 150 h / 12.600 € trägt — begründet mit einer Measure-Zahl aus der Vor-UDF-Zeit.

### B5 — `guardrail` bestraft deneb und core doppelt für dieselbe Eigenschaft

`design`-cap ist für deneb und core beide 2 → `guardrail` = 1,0 → `variantEff` = 1,5 (bei 25 % Self-Service).
Dieser Faktor multipliziert **maint** *und* **govIntake**. Bei deneb trifft das auf ohnehin hohe `govIntake` (12 h × 5 Typen × 1,5),
bei core auf ohnehin hohe `maint` (34 %). Für sich genommen ist der Mechanismus richtig — er ist nur der Punkt,
an dem sich zwei bereits pessimistische Annahmen multiplizieren statt zu addieren.

### B6 — `support`-Maximum erzeugt Phantomkosten

`expected()` rechnet mit `pertMean`. `[0, 0, 9000]` → **1.500 €/Jahr**, also 7.500 € über 5 Jahre,
für einen Posten, der laut eigenem srcNote freiwillig ist. Bei oss dasselbe Muster (333 €/Jahr).
Das ist keine Meinungsfrage, sondern eine Nebenwirkung von PERT bei `mode = min`.

### Wird core **zu teuer** gerechnet?

**Teils ja, teils nein — differenziert:**

- **Fair und gut belegt:** `events` 3,25/Jahr, `fixH`, `supH100`, `govIntake`/`govRun` (praktisch null — der Rechner erkennt den echten core-Vorteil korrekt an), `dep` 1 %.
- **Zu teuer:** `govAudit` 20 h (Vor-UDF-Begründung), `maint`-**Untergrenze** 20 % (verhindert die Abbildung eines disziplinierten Matrix-only-Standards), `rampH` 80 h (unbelegt, wird über B1 verstärkt).
- **Nicht überzeichnet:** die Wartungsquote von 34 % als *Modus*. Die dokumentierten Regressionen (New Card px→%, SVG blank im Service, Small-Multiples-Bug) stützen das Bild; wer SVG-Measures in Cards nutzt, zahlt das tatsächlich.
- **Sachlich falsche Begründung, nicht falscher Wert:** der 32.766-Zeichen-Anker im REQS-Text ist eine Power-Query-Grenze, nicht das Limit einer DAX-SVG-Measure.

### Wird deneb **fair** behandelt?

**Nein, an drei Stellen systematisch nicht:**

1. **`ext` min = 10 %** — der Ansatz darf im Modell nie vollständig intern erbracht werden. core darf das (min 0). Das ist keine Schätzung, das ist ein Ausschluss.
2. **`govIntake` 12 h/Typ und `govRun` 32 h/Jahr** — Deneb ist Microsoft-zertifiziert und releast einmal jährlich, wird aber mit **doppelter** laufender Governance gegenüber kommerziellen Vendoren belegt, die häufiger releasen und zusätzlich Vertragspflege erzeugen. Das ist intern inkonsistent.
3. **`rampH` 120 h × B1** — siehe oben; der dominierende Deneb-Kostenblock hat keinerlei Quelle.

Hinzu kommt außerhalb von OPTP, aber wirkungsgleich: `bigdata`-cap deneb = 2 vs. paid = 4 mit der Begründung
„30.000-Zeilen-Fenster“. Das Limit ist per Microsoft-Doku ein **SDK-Hardlimit für alle Custom Visuals**,
inklusive Zebra BI und Inforiver — es differenziert nicht zwischen paid und deneb.

**Netto:** Der Rechner zeigt core im Betrieb hart, aber weitgehend belegt; deneb wird dagegen an genau den Stellen
teuer gemacht, an denen die Evidenz am dünnsten ist (Fluktuation, Governance). Wer die drei deneb-Korrekturen
(`ext` min 0, `govIntake` 4 h, `govRun` 16 h) plus den `trainRun`-Fix umsetzt, verschiebt das Bild
im Konzern-Preset um eine sechsstellige Summe zugunsten von Deneb — ohne eine einzige Annahme schönzurechnen.

---

## (c) Was ich nicht prüfen konnte

1. **Blockierte Primärquellen.** Der Egress-Proxy verweigert `deneb.guide` / `deneb-viz.github.io` (offizieller Changelog, Performance-Doku, 1.7/1.8/1.9-Releaseposts), `blog.crossjoin.co.uk` (Chris Webb, 32.766-Zeichen-Original), `www.powerofbi.org` (Responsive SVG Charts, PowerofBI.IBCS-UDF-Doku), `www.excelized.de` (SVG-Wartungsartikel), `www.ibcs.com` (offizielle Zertifizierungsliste). Für diese fünf Punkte stütze ich mich auf Suchmaschinen-Snippets. Die dortigen Aussagen (Releasedaten, 32.766-Zeichen-Kontext, Zertifizierungsstatus) sind daher **plausibel belegt, nicht verifiziert**.
2. **GitHub-API für `deneb-viz/deneb`** ist in dieser Session nicht freigeschaltet (nur `losveratos/powerbi-kitchen-`). Issues #472, #553, #676 konnte ich per WebFetch der HTML-Seiten lesen, den Commit-/Release-Verlauf aber nicht maschinell auszählen. Die Releasedaten stammen aus Snippets, nicht aus der API. Ein WebFetch der Releases-Übersichtsseite lieferte offensichtlich falsche Jahresangaben (2023/2024 für 1.8/1.9) — ich habe diese Angabe **verworfen** und nur die konsistenten Snippet-Daten (1.7 = 07/2024, 1.8 = 07/2025, 1.9 = 03/2026) verwendet.
3. **Keine Messdaten zu Aufwand.** Für `firstH`, `reuseH`, `rampH`, `govAudit`, `cuUplift` existiert öffentlich nichts Belastbares — das sagt die eigene recherche.md bereits („Stunden pro IBCS-Chart je Option: KEINE Quelle“). Meine Vorschläge dort sind Konsistenzargumente, keine Messungen.
4. **Das „Expertenpanel“ ist kein Panel.** 20 per Sprachmodell simulierte Rollenprofile sind eine strukturierte Selbstbefragung des Modells, keine unabhängige Evidenz. Systematisches Risiko: die Profilbeschreibungen enthalten bereits die Wertung („Core-Workarounds werden konsequent mit Wartungsaufschlag bewertet“, „175-Measures-Falle“) — die Zahlen bestätigen also teilweise nur die Prämisse ihres eigenen Prompts. Der srcNote im Rechner benennt das korrekt; ich unterstreiche es hier, weil 9 der 18 geprüften Parameter allein darauf beruhen.
5. **CU-Verbrauch** (`cuUplift`) habe ich nicht messen können — weder für SVG-Measures noch für Deneb. Es gibt keine öffentliche Messung, die einen Prozentsatz der Capacity einem Visual-Ansatz zurechnet. Beide Werte bleiben begründete Setzungen.
6. **Deneb-2.0-Migrationsaufwand.** Dass 2.0 ein Breaking Change mit v1-Migrationspfad ist, ist über Issue #472 belegt; **wie viel Handarbeit** die Migration je Spec kostet, konnte ich nicht ermitteln (Changelog blockiert, 2.0 zum Prüfzeitpunkt noch nicht in AppSource).
7. **Preise für Deneb-/Vega-Lite-Trainings im DACH-Raum** existieren öffentlich nicht als Listenpreis. Der einzige belastbare Anker ist ein allgemeiner 2-Tages-Power-BI-Kurs (PC College, 1.640 € netto, Snippet).
