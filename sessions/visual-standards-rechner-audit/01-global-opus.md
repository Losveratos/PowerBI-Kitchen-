# Audit der 13 globalen Annahmen · Visual-Standards-Rechner v0.6

Datei: `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html`, Array `const GLOBAL` (Z. 474–488), Rechenkern `calc()` (Z. 606–686).
Prüfer: Claude Opus 5, 10.09.2026. Netzzugang war verfügbar; eine Domain (iwd.de) war durch den Egress-Proxy blockiert.

**Kurzurteil vorab:** Von 13 globalen Annahmen sind 3 mit einer belastbaren Primär- oder Nahprimärquelle unterlegt (`wageInfl`, `disc`, `capacityCost`-Preisnote), 3 sind mit vertretbarer Ableitung aus Sekundärquellen belegbar (`rateInt`, `rateExt`, `churn`), und 7 sind begründete Meinung ohne Evidenz (`migShare`, `growth`, `intFactor`, `demand1000`, `govPer1000`, `maintDecay`, `migFactor`). Zwei Annahmen sind falsch kalibriert (`disc` deutlich zu niedrig, `wageInfl` zu niedrig), eine ist strukturell falsch parametrisiert (`capacityCost` bildet den SKU-Sprung nicht ab), und `churn` sitzt auf einem Rechenweg, der die Fluktuationskosten in Self-Service-Szenarien um Faktor 5–9 überschätzt. Das ist der schwerwiegendste Fund dieses Audits und steht unter „Strukturelle Kritik", Punkt 1.

---

## (a) Tabelle je Annahme

| id | aktuell [min·mode·max] | Wirkung im Modell | Evidenz | Urteil | Vorschlag | Konfidenz |
|---|---|---|---|---|---|---|
| `rateInt` | 60 · 80 · 100 €/h | Multiplikativ auf **alle** internen Stunden: über `rateInt0 = rateInt × intFactor/100` in `rate0` (Mischsatz), damit in setup/dev/build/rollout/switch/maint/events/risk; zusätzlich direkt in licAdmin, train0, trainRun, supUsers, gov, govOnce | Controller Ø 71.292 €/Jahr ([controllingportal](https://www.controllingportal.de/News/gehaltsuebersicht-2025-controller-und-buchhalter-weiterhin-stark-gesucht.html)); Vollkostenfaktor 1,7 ([olev.de](https://olev.de/p/pers-kosten.htm)) | ändern | **65 · 85 · 115** | mittel |
| `rateExt` | 95 · 120 · 180 €/h | Über `ext`-Anteil in `rate0`; bestimmt zusätzlich `hardFrac` (Hart/Weich-Split) | Ø 98 €/h Power BI, Spanne 50–131 ([freelancermap](https://www.freelancermap.de/freelancer-verzeichnis/power-bi-4957)); BI-Tagessatz ~1.075 € ([Computerwoche](https://www.computerwoche.de/article/2725374/business-intelligence-lohnt-sich.html), veraltet); Beratungshaus 1.000–1.500 €/Tag, Big4 1.800–2.500 €/Tag ([lukasreese.com](https://lukasreese.com/2026/04/28/power-bi-beratung-kosten/), Blog) | ändern | **95 · 125 · 220** | mittel |
| `migShare` | 50 · 80 · 100 % | `risk = hit × (setup+dev+build) × migShare/100`. Nur auf **Aufbau**, nicht auf Rollout | keine quantitative; qualitativ Charticulator/Bing Maps/OKViz (Rechercheprotokoll) | Wert behalten, **Bezugsgröße ändern** | Wert 50·80·100; Basis auf `build + 0,6 × rollout` erweitern | niedrig (Wert), hoch (Kritik) |
| `churn` | 5 · 15 · 30 %/Jahr | `trainRun = creators × churn/100 × H × (trainH + rampH) × rateInt`. Linear, aber auf **alle** Ersteller mit **Tiefschulung** | Finance-Abteilungen ~10 %/Jahr, IT-Branche 20–22 % (ISG-Langzeit, zit. n. [bkvfirmenservice](https://bkvfirmenservice.de/statistiken/fluktuationsrate-it-branche/)); D gesamt 30,1 % brutto (iwd, nur Snippet) | ändern (Wert **und** Formel) | **5 · 11 · 22** | mittel (Wert), hoch (Formelkritik) |
| `growth` | 0 · 10 · 25 %/Jahr | `vAvg` (arithm. Mittel) → supUsers, govPer1000, demand1000-Reports; `licFv` (exponentiell) → Lizenz | **keine** | ändern (Untergrenze) | **−5 · 8 · 25** | niedrig |
| `intFactor` | 60 · 100 · 150 % | Multiplikativ auf `rateInt` — zweiter Multiplikator auf dieselbe Größe | keine (ist auch keine empirische Größe, sondern eine Bewertungskonvention) | ändern (**Typ**, nicht Wert) | Als 3-Stufen-Schalter 60/100/150, in der Monte-Carlo **konstant** halten | hoch (methodisch) |
| `demand1000` | 1 · 2 · 4 Reports/1.000 Viewer/Jahr | `reportsTotal = reports + demand1000 × vAvg/1000 × H` → linear in `rollout`, zu 30 % in `maintBase` | **keine** | ändern (Skalierungsbasis) | An Erstellern koppeln, nicht nur an Viewern; Wert 1·2·4 als Viewer-Anteil belassen | niedrig |
| `govPer1000` | 4 · 10 · 24 h/1.000 Viewer/Jahr | `gov += govPer1000 × vAvg/1000 × H × rateInt × govF`. Für **alle vier Optionen identisch** | **keine** | ändern (rausnehmen oder separat ausweisen) | Aus dem Optionsvergleich herausnehmen, wie die Power-BI-Grundlizenz | hoch (methodisch), niedrig (Wert) |
| `wageInfl` | 1,5 · 2,5 · 4 %/Jahr | `wageF` = Ø-Jahresfaktor; multipliziert `rateInt`/`rate` für **laufende** Posten (maint, events, trainRun, supUsers, gov, licAdmin), nicht für Jahr 0 | Tariflöhne 2026 nominal **+3,1 %**, 2025 +2,6 % ([WSI/Hans-Böckler](https://www.wsi.de/de/pressemitteilungen-15991-tarifloehne-steigen-2026-nach-den-bislang-vorliegenden-abschluessen-78488.htm)) | ändern | **2 · 3 · 4,5** | mittel-hoch |
| `maintDecay` | 75 · 85 · 95 %/Jahr | `maintYears = Σ decay^y`; bei H=5/decay 0,85: 3,71 statt 5 (−26 %), bei H=10: 5,60 statt 10 (−44 %) | Literatur sagt eher das **Gegenteil** (10–25 % in Jahr 1–2, 20–40 % ab Jahr 6, Gartner-Zahlen nur über Sekundärzitate) — bei anderer Bezugsgröße | unsicher, aber plausibel | **80 · 90 · 97** | niedrig |
| `migFactor` | 1 · 1,3 · 1,8 × | `switchCost = existing × cpr × reuseH × migFactor × rate0`, nur bei `baseline ≠ key` | keine quantitative | ändern | **1,1 · 1,5 · 2,5** | mittel-niedrig |
| `capacityCost` | 0 · 0 · 0 € | `capacity = capacityCost × cuUplift/100 × H`. Bei Default 0 ist der Posten **komplett neutralisiert** — `core` verliert seinen einzigen Capacity-Nachteil | F64 PAYG West Europe 0,2115 €/CU/h ≈ **13,51 €/h ≈ 9.870 €/Monat ≈ 118 k€/Jahr**; reserved −41 % ≈ 70 k€/Jahr ([lets-viz](https://lets-viz.com/blogs/microsoft-fabric-pricing-f-sku-vs-p-sku-capacity-cost-guide), Sekundärquelle; MS-Preisliste selbst nicht abgerufen) | ändern (Bedienung **und** Formel) | SKU-Presets F2–F64 (PAYG/reserved) hinterlegen; Uplift durch Auslastungs-/Sprungmodell ersetzen | hoch (Kritik), mittel (Preis) |
| `disc` | 0 · 4 · 7 % | **Nur** auf `c.npv`. Beeinflusst Rangfolge und P50 **nicht** | WACC DACH Ø **8,5 %** (Spanne 5,2–10,4; Technology 9,4), risikoloser Zins DE 2,5 %, MRP 6,7 % ([KPMG Kapitalkostenstudie 2025](https://hub.kpmg.de/de/kapitalkostenstudie-2025), ~300 Unternehmen) | ändern | **5 · 8 · 10** | hoch |

---

## Details je Annahme

### 1 · `rateInt` — Stundensatz intern
Rechenweg zum Vorschlag: 71.292 € Bruttojahresgehalt × 1,7 (Vollkostenfaktor inkl. AG-Anteil, Arbeitsplatz, Gemeinkosten) = 121.196 €. Bei 1.600 produktiven Stunden/Jahr sind das 75,7 €/h, bei 1.450 h 83,6 €/h. Der Modus 80 €/h ist also gut getroffen — **für einen Durchschnitts-Controller**.

Das ist aber der falsche Personenkreis. Der Rechner belastet mit `rateInt` die Leute, die Chart-Standards bauen, Deneb-Specs schreiben und 175 DAX-Measures pflegen. Das sind BI-Entwickler und Senior-Power-User, keine Durchschnitts-Controller. Bei 85 k€ Gehalt und 1.500 h ergibt sich 96 €/h; die Obergrenze 100 wird damit zum Median statt zum P90. Deshalb **65 · 85 · 115**.

Zweite Beobachtung: `train0` und `govOnce` rechnen mit `rateInt0` (ohne Lohnsteigerung), die laufenden Posten mit `rateInt` (mit `wageF`). Das ist korrekt und sauber getrennt — ein Detail, das in vielen Modellen falsch ist.

### 2 · `rateExt` — Stundensatz extern
Die belegten Ø-Werte (98–104 €/h) sind **Selbstauskünfte von Freelancern auf Plattformen**, keine Rechnungspreise. Sie enthalten weder Reisezeit noch Vermittlungsmarge noch die Beratungshaus-Alternative. Der Modus 120 €/h ist deshalb realistischer als der Plattform-Ø und richtig gewählt.

Das Problem ist die Obergrenze: 180 €/h deckt Freelancer-Spezialisten ab, aber nicht den Fall „Einkauf schreibt aus, es gewinnt ein Beratungshaus" (1.000–1.500 €/Tag = 125–190 €/h) oder eine Big-4-Beratung (225–310 €/h). Gerade der `noext`-Flag im Rechner („kein externer Dienstleister ohne Ausschreibung") signalisiert ja, dass genau diese Kunden gemeint sind.

**Grundsätzliche Kritik:** Die Verteilung ist bimodal (Freelancer vs. Beratungshaus), nicht unimodal. Eine PERT-Verteilung über [95, 125, 220] bildet das schlecht ab — sie legt Masse ins Tal zwischen den beiden Modi. Sauberer wäre ein Umschalter „Freelancer" / „Beratungshaus" mit je eigener Dreipunkt-Schätzung.

### 3 · `migShare` — Migrationskosten bei Abkündigung
Der Wert (80 % Modus) ist für Power-BI-Visuals gut begründet: bei Charticulator, den Bing-Maps-Visuals und OKViz gab es keinen Migrationspfad, es war jeweils Neubau. 80–100 % ist plausibel.

**Die Bezugsgröße ist zu klein.** `risk = hit × (setup + dev + build) × migShare/100`. Wenn ein Visual stirbt, wird nicht nur die Template-Bibliothek neu gebaut, sondern **jeder Report, der es benutzt, muss angefasst werden**. Genau das rechnet `switchCost` an anderer Stelle korrekt (`existing × cpr × reuseH × migFactor`), aber `risk` lässt den `rollout`-Teil komplett weg. Für das `gross`-Preset (400 Reports × 8 Charts) ist der Rollout mehrfach so groß wie der Aufbau — das Abkündigungsrisiko wird dadurch um eine Größenordnung unterschätzt, und zwar systematisch zulasten der Optionen mit **niedrigem** `dep`-Wert nicht, sondern zulasten der Aussagekraft insgesamt. Am stärksten betroffen: `oss` (dep 3·7·13 %) und `paid` (Lock-in, Report-Definitionen an das Visual gebunden).

Konkreter Änderungsvorschlag: `risk = hit × (setup + dev + build + 0,6 × rollout) × migShare/100`, wobei 0,6 den Anteil abbildet, der bei einem Neubau-Template pro Report noch anfällt (Feldbindung, Test, Abnahme). Der Faktor 0,6 ist geschätzt — dann aber wenigstens im richtigen Term.

### 4 · `churn` — Fluktuation der Ersteller
**Wert:** Die Zielgruppe ist Controlling/Finance im DACH-Raum, nicht die IT-Branche. Finance-Abteilungen liegen bei ~10 %/Jahr, IT-Dienstleister bei 20–22 %. Die häufig zitierten 30,1 % für Deutschland gesamt sind **Bruttofluktuation** (jeder Ein- und Austritt inkl. befristeter Verträge, Saisonarbeit, konzerninterner Wechsel) und als Benchmark für „ein geschulter Report-Ersteller verlässt das Team" unbrauchbar. Modus 15 % ist zu hoch für Controlling, zu niedrig für ein externes BI-Team. Vorschlag **5 · 11 · 22**.

**Die Formel ist der eigentliche Fund.** `trainRun = S.creators × churn/100 × H × (trainH + rampH) × rateInt` belastet **jeden** ausscheidenden Ersteller mit der **Tiefschulung plus voller Einarbeitung**. Das widerspricht direkt der Rollentrennung, die `train0` zwei Zeilen darüber sauber macht (`owners × trainH` + `(creators − owners) × lightH`).

Rechenbeispiel `gross`-Preset (200 Ersteller, Enterprise-Modus → `owners = 20`, H = 5, Deneb: trainH 35 h, rampH 120 h, lightH 2,75 h):

- Ist: `200 × 0,15 × 5 × (35 + 120) = 23.250 h` → bei 80 €/h **1,86 Mio €**
- Erstschulung `train0` zum Vergleich: `20 × (35 × 80 + 400) + 180 × 2,75 × 80 ≈ 104 k€`
- Rollenkorrekt: 150 Wechsel, davon 10 % Vorlagen-Bauer → `150 × (0,1 × 155 + 0,9 × 2,75) ≈ 2.700 h` → **216 k€**

Faktor **8,6 Überschätzung**. Die Fluktuationsschulung ist damit im aktuellen Modell 18-mal so groß wie die Erstschulung — ein Posten, den niemand plausibilisiert hat, dominiert in Self-Service-Szenarien die gesamte Schulungskategorie und bestraft Deneb (rampH 40·120·240) massiv gegenüber Paid (8·16·40). Die Rangfolge Deneb vs. Paid hängt bei großen Ersteller-Zahlen an diesem einen Term.

Korrektur analog zu `train0`:
```
trainRun = churn/100 × H × rateInt × ( owners × (trainH + rampH) + (creators − owners) × (lightH + 0,25 × rampH) )
```

### 5 · `growth` — Viewer-Wachstum
**Keine Evidenz gefunden, und ich halte belastbare Evidenz hier auch nicht für erreichbar** — Viewer-Wachstum ist unternehmensindividuell und hängt an Rollout-Plänen, nicht an einer Branchenkennzahl.

Zwei inhaltliche Einwände:

1. **Kein Sättigungspunkt.** Beim `gross`-Preset (10.000 Viewer) und 10 %/Jahr über 10 Jahre wächst die Leserschaft auf 25.900. In einem Konzern mit fester Mitarbeiterzahl ist das unmöglich. Ein Deckel („maximale Viewer = Anzahl potenzieller Nutzer") oder eine logistische statt exponentielle Kurve wäre ehrlicher. Da `growth` gleichzeitig die Lizenzkosten treibt (`licFv`), verzerrt das den Paid-Ansatz bei langen Horizonten systematisch nach oben.
2. **Untergrenze 0 ist zu optimistisch.** Lizenzabbau, Konsolidierung, Standort­schließung, Umstieg auf ein anderes Tool im Teilbereich — negative Viewer-Entwicklung ist ein realer Fall und im Modell nicht darstellbar. Vorschlag Untergrenze **−5 %**.

Ehrlich gesagt: Der Wert selbst ist Meinung, und das sollte im UI so stehen. Das `E`-Badge trifft es, aber der `srcNote` („Self-Service-Rollouts wachsen, Lizenz folgt jedem neuen Viewer") liest sich wie eine Begründung, ist aber eine Tautologie.

### 6 · `intFactor` — Bewertung interner Stunden
**Der Wert ist nicht das Problem, der Typ ist es.** `intFactor` ist keine Unsicherheit über die Welt, sondern eine **Entscheidung des CFO über die Bewertungskonvention**: Werden interne Stunden als Auszahlung, als Vollkosten oder als Opportunitätskosten gerechnet? Diese Frage hat eine Antwort — sie ist nur je Unternehmen verschieden.

Aktuell wird `intFactor` in der Monte-Carlo als Zufallsvariable gezogen, gemeinsam mit `rateInt`, das **auf dieselbe Größe multiplikativ** wirkt. Ergebnis:

- P10-Ecke: 60 % × 60 €/h = **36 €/h**
- Modus: 100 % × 80 €/h = 80 €/h
- P90-Ecke: 150 % × 100 €/h = **150 €/h**

Eine 4,2-fache Spanne im wichtigsten Kostentreiber des ganzen Modells, erzeugt aus zwei Parametern ohne Evidenz. Das bläht die P10–P90-Bänder auf und macht sie unbrauchbar für Rangfolge-Aussagen — genau das Differenzierungsmerkmal, mit dem der Rechner laut Rechercheprotokoll punkten will („Kein gefundener Rechner zeigt Unsicherheitsbänder"). Ein Band, das zu 70 % aus einer Bewertungskonvention besteht, ist kein Unsicherheitsband, sondern ein Meinungsband.

**Vorschlag:** `intFactor` als 3-Stufen-Schalter im UI (60 = Kapazität ist frei / 100 = Vollkosten / 150 = verdrängt Fachaufgaben), in `calc()` konstant über alle Ziehungen. Die Konfidenz für diese Empfehlung ist hoch — das ist Standard in TEI- und Investitionsrechnungen: Bewertungskonventionen gehören in die Szenariodefinition, nicht in die Verteilung.

Nebenbefund, positiv: Der Hart/Weich-Split (`hardFrac = rateExt × ext / rate0`, angewandt auf `rateBased`) ist algebraisch korrekt — es kürzt sich zu `Stunden × rateExt × ext`, die Auszahlungshöhe ändert sich also **nicht**, wenn `intFactor` variiert. Das ist richtig und war nicht selbstverständlich.

### 7 · `demand1000` — Zusätzliche Reports je 1.000 Viewer und Jahr
**Keine Evidenz, und die Skalierungsbasis ist falsch gewählt.**

Der Rechner enthält an anderer Stelle bereits eine bessere Formel: `reportsDefault() = creators × reportsPerCreator + viewers/1000 × 2`. Dort skaliert der **Bestand** an Reports mit den Erstellern und den Viewern. Der **Zuwachs** (`demand1000`) skaliert dagegen nur mit den Viewern. Das ist inkonsistent.

Praktische Folge beim `mittelstand`-Preset (40 Viewer): `2 × 0,04 × 5 = 0,4` zusätzliche Reports in fünf Jahren. Faktisch null. In einem Mittelständler mit drei Erstellern entstehen aber sehr wohl neue Reports — nur eben getrieben von neuen Fachfragen, nicht von neuen Lesern. Das Modell blendet das Nachfragewachstum in genau dem Segment aus, das die Pre-Conference-Zielgruppe darstellt.

Vorschlag: `reportsTotal = reports + (demandPerCreator × creators + demand1000 × vAvg/1000) × H` mit einem zweiten Parameter, oder ersatzweise `demand1000` auf die gemischte Basis von `reportsDefault()` anwenden.

Weiterer Punkt: `reportsTotal` fließt vollständig in `rollout`, und `rollout` geht zu 30 % in `maintBase` — also wird der komplette Reportbestand des **Jahres H** ab **Jahr 0** gewartet. Siehe `maintDecay`.

### 8 · `govPer1000` — Zugriffs-Governance je 1.000 Viewer und Jahr
**Keine Evidenz.** Zur Plausibilität: 10 h je 1.000 Viewer und Jahr sind 36 Sekunden pro Viewer und Jahr für Berechtigungsvergabe, Rezertifizierung und Offboarding. Das ist eher zu niedrig als zu hoch, wenn eine Rezertifizierungspflicht besteht — aber ohne Quelle ist jede Zahl hier Meinung.

**Der methodische Einwand wiegt schwerer.** Zugriffs-Governance nach Viewer-Zahl fällt für **alle vier Optionen identisch** an — sie hängt an der Anzahl der Leser, nicht am Visual-Ansatz. Im Vergleichsmodell hebt sie damit alle vier Kurven um denselben Betrag an. Das schadet dreifach:

1. Es verwässert die **relativen** Unterschiede (der Rechner zeigt „x % teurer" — dieser Prozentsatz sinkt künstlich).
2. Es ist **inkonsistent** zur eigenen Methodik: Der Footer schließt Power-BI-Grundlizenzen explizit aus, weil sie „für alle Ansätze gleich anfallen". Genau dasselbe Argument gilt für `govPer1000`.
3. Beim `gross`-Preset (10.000 Viewer, 10 Jahre) sind das `10 × 10 × 10 × 80 € × govF` ≈ **80–128 k€ Rauschen** in jeder Option.

Vorschlag: entweder aus dem Optionsvergleich herausnehmen und separat als „Grundlast, ansatzunabhängig" ausweisen, oder nur den **Delta**-Anteil ansetzen, der tatsächlich vom Ansatz abhängt (z. B. zusätzliche Org-Store-Berechtigungen bei OSS).

### 9 · `wageInfl` — Lohnsteigerung
**Bester Evidenzstand aller 13 Annahmen.** Das WSI-Tarifarchiv weist für 2026 nominal **+3,1 %** aus (2025: +2,6 %), bei über 15 Mio. erfassten Beschäftigten und noch ausstehenden Abschlüssen (Metall/Elektro, Einzelhandel), die das Ergebnis eher nach oben ziehen. Der aktuelle Modus 2,5 % liegt unter beiden Jahreswerten.

Zwei Zuschläge sprechen für eine Anhebung über den reinen Tarifwert hinaus: (a) Der relevante Personenkreis (BI/Controlling-Spezialisten) ist im Fachkräftemarkt und steigt schneller als der Tariflohn; die Robert-Half-Gehaltsstudie 2026 nennt für Vertriebscontroller +6,0 % im Median. (b) Externe Sätze (`rateExt`) sind nicht tarifgebunden und folgen dem Beratungsmarkt.

Vorschlag **2 · 3 · 4,5 %**. Konfidenz mittel-hoch — die Quelle ist belastbar, aber der Transfer vom Tariflohn auf einen BI-Vollkostensatz ist ein Schluss, kein Beleg.

**Wichtiger Zusammenhang mit `disc`:** Das Modell rechnet **nominal** (Löhne steigen mit `wageInfl`, Lizenzen mit `licInfl`). Ein nominaler Cashflow muss mit einem **nominalen** Zins diskontiert werden. Der `disc`-Default von 4 % ist ungefähr ein *realer* Zins — wer ihn so setzt, zählt die Inflation zweimal (einmal aufwärts in `wageInfl`, einmal nicht abgezinst). Das gehört im UI als Warnhinweis hinterlegt.

### 10 · `maintDecay` — Wartungs-Abklingfaktor
**Die Literatur sagt das Gegenteil.** Über Sekundärzitate wird Gartner mit einer *steigenden* Staffel geführt (Jahre 1–2: 10–25 % der Entwicklungskosten p. a., Jahre 3–5: 15–30 %, ab Jahr 6: 20–40 %). Die Primärquelle habe ich **nicht** verifizieren können — diese Staffel zirkuliert in Agentur-Blogs, nicht in einem abrufbaren Gartner-Papier. Sie ist deshalb kein Beleg, aber sie ist auch kein Argument *für* das Abklingen.

Die Bezugsgrößen sind allerdings verschieden: In der Literatur wächst die Codebasis mit, hier ist `maintBase` fix. Für eine **statische** Template-Bibliothek ist Abklingen plausibel — die ersten Anpassungen nach dem Rollout sind die teuersten, danach ist der Standard eingeschwungen.

Nur: `maintBase = setup + dev + build + 0,3 × rollout`, und `rollout` enthält bereits `reportsTotal` inklusive des Zuwachses über den **gesamten** Horizont. Das Modell wartet also ab Jahr 0 den Endbestand des Jahres H und lässt diesen Betrag dann abklingen. Zwei Fehler in entgegengesetzte Richtungen — ob sie sich aufheben, ist Zufall, nicht Modellierung.

Sauber wäre: Wartung je Jahr auf den **in diesem Jahr existierenden** Bestand rechnen (`maintBase_y = build + 0,3 × rollout_y`), dann kann `maintDecay` bei ~95 % (nahe konstant) bleiben und bildet nur noch das Einschwingen ab. Solange das nicht umgebaut wird: **80 · 90 · 97** — näher an „konstant", weil die stärkste Abkling-Begründung (fixer Bestand) durch die `rollout`-Konstruktion ohnehin unterlaufen wird.

Der `srcNote` („Verhindert, dass ein Chart über 10 Jahre dreimal neu gebaut wird") ist eine **Modellierungs-Notlösung**, keine Empirie. Das sollte im UI so ehrlich stehen, sonst liest sich das `F`-Badge wie eine Faustregel aus der Literatur.

### 11 · `migFactor` — Nachbau-Faktor bei Migration
**Keine Evidenz gefunden.** Zur Logik: Die Untergrenze 1,0 sagt „ein Bestandschart nachzubauen kostet genau so viel wie ein neues aus der Vorlage zu bauen". Das ist praktisch nie so. Beim Nachbau kommt hinzu: das Original verstehen (was genau zeigt dieses Chart, welche Filter, welche Sonderfälle), Abweichungen dokumentieren, mit dem Fachbereich abnehmen, ggf. Paralleltbetrieb. Diese Positionen fehlen im Modell vollständig — `switchCost` besteht nur aus `existing × cpr × reuseH × migFactor × rate0`.

`migFactor` ist damit faktisch ein Sammelfaktor für alles, was beim Nachbau anders ist. Als solcher ist 1,3 zu niedrig und 1,0 als Minimum unhaltbar. Vorschlag **1,1 · 1,5 · 2,5**, Konfidenz mittel-niedrig — es ist eine begründete Einschätzung, kein Beleg.

**Redundanz mit `migShare`:** Beide Parameter beschreiben dieselbe Sache („was kostet es, den Bestand auf einen anderen Ansatz zu bringen"), wirken aber auf verschiedene Basen (`migFactor` auf Rollout, `migShare` auf Aufbau) in verschiedenen Posten (`switch` vs. `risk`). Ein Nutzer, der beide bedient, kann nicht wissen, dass er zwei Hälften desselben Sachverhalts einstellt. Vereinheitlichen: ein Migrationsmodell, das für den geplanten Wechsel (`switch`) und für den erzwungenen Wechsel (`risk`) dieselbe Struktur nutzt.

### 12 · `capacityCost` — Jahreskosten der Fabric-Capacity
**Das `V`-Badge ist irreführend.** Verifiziert ist die Preisnotiz im `srcNote`, aber der **Default ist 0 · 0 · 0**. Damit ist der komplette Posten `capacity = capacityCost × cuUplift/100 × H` bei jedem Nutzer neutralisiert, der das Feld nicht ausfüllt — und die Option `core` verliert ihren einzigen Capacity-Nachteil (`cuUplift` 2 · 6 · 15 % gegen 0 · 1 · 3 % bei Paid/OSS). SVG-Measures und lange Textwerte sind ein real belegter CU-Treiber; im Auslieferungszustand kostet das im Rechner nichts.

**Preisrecherche:** F64 Pay-as-you-go in West Europe liegt bei 0,2115 €/CU/h → 13,51 €/h → ≈ 9.870 €/Monat → ≈ **118 k€/Jahr**; mit 1-Jahres-Reservierung rund 41 % weniger, also ≈ 70 k€/Jahr. Der `srcNote` nennt „ca. 8.400 $/Monat" — das ist der US-PAYG-Preis und stimmt größenordnungsmäßig, ist aber für DACH-Nutzer die falsche Währung und die falsche Region. Diese Zahlen stammen aus Sekundärquellen; die Microsoft-Preisliste selbst habe ich nicht abgerufen (siehe „Was ich nicht prüfen konnte").

**Strukturelle Kritik:** Der `srcNote` zu `cuUplift` sagt selbst: „Capacity springt statt zu wachsen: über 70 % Auslastung ist der Aufschlag die nächste SKU." Genau das bildet die Formel **nicht** ab. Ein linearer Prozentaufschlag auf die Jahreskosten unterstellt, dass 6 % Mehrverbrauch 6 % Mehrkosten erzeugen. Real gilt: unter der Auslastungsgrenze kostet der Mehrverbrauch **null**, darüber kostet er **100 %** (nächste SKU, Verdopplung). Eine Kostenfunktion mit Sprungstelle, linear approximiert — der schlechteste Fall, weil beide Enden falsch sind.

Vorschlag: Feld „aktuelle Capacity-Auslastung in %" ergänzen und die Kosten als Sprung modellieren: `capacity = (auslastung × (1 + cuUplift/100) > 0,85) ? capacityCost : 0`, plus SKU-Presets (F2 ≈ 3,7 k€/Jahr reserved … F64 ≈ 70–118 k€/Jahr), damit niemand das Feld leer lässt.

### 13 · `disc` — Kalkulationszins (WACC)
**Der klarste Änderungsfall im ganzen Audit.** Die KPMG Kapitalkostenstudie 2025 (20. Ausgabe, ~300 Unternehmen DACH) weist einen durchschnittlichen WACC von **8,5 %** aus, Spanne 5,2–10,4 %, Technology 9,4 %, Industrial Manufacturing 9,4 %. Der Default-Modus von 4 % liegt **unterhalb der gesamten erhobenen Spanne**. Er entspricht ungefähr einem realen Zins oder einem reinen Fremdkapitalkostensatz — beides ist hier falsch, weil das Modell nominale Cashflows erzeugt (siehe `wageInfl`).

Vorschlag **5 · 8 · 10 %**, Konfidenz hoch.

**Und der eigentliche Punkt:** `disc` wirkt **nur** auf `c.npv`, eine Anzeigezeile. Die gesamte Rangfolge, die P10/P50/P90-Bänder, der Break-even und die Sensitivität laufen über `c.total` — die **undiskontierte Nominalsumme**. Damit ist der Zeitwert des Geldes im Entscheidungsteil des Rechners nicht vorhanden.

Das ist folgenreich, denn die vier Optionen haben **grundverschiedene Zeitprofile**: Paid ist lizenzlastig (spätes Geld, gleichmäßig über H), Deneb und Core sind aufbaulastig (frühes Geld, konzentriert in Jahr 0). Bei H = 10 und 8 % Diskontierung ist ein Euro im Jahr 10 nur 46 Cent wert. Eine Option mit 60 % der Kosten in den späten Jahren wird durch Diskontierung um rund 20 % entlastet — genug, um Rangplätze zu drehen. Der Rechner zeigt diesen Effekt in einer Zeile an, lässt ihn aber nicht in die Empfehlung einfließen.

Empfehlung: Den Barwert zur Primärkennzahl machen (mindestens als Umschalter „nominal / Barwert" neben der Rangfolge), nicht als Fußnote.

Nebenbefund: `c.cf` hat H+1 Einträge (Invest in y=0, laufende Kosten in y=1..H), `c.total` summiert über H Jahre. Die beiden Kennzahlen stehen auf leicht verschiedenen Zeitachsen. Bei H=3 sind das ~4 % Unterschied, bei H=10 vernachlässigbar — aber wenn `npv` und `total` nebeneinander stehen, sollte klar sein, dass sie nicht dieselbe Periode meinen.

---

## (b) Strukturelle Kritik

### 1. `trainRun` überschätzt die Fluktuationskosten um Faktor 5–9
Der wichtigste Fund. `trainRun` belastet **jeden** ausscheidenden Ersteller mit Tiefschulung plus voller Einarbeitung, obwohl `train0` zwei Zeilen darüber korrekt zwischen Vorlagen-Bauern (`owners × trainH`) und Vorlagen-Nutzern (`(creators − owners) × lightH`) unterscheidet. Bei 200 Erstellern, 15 % Churn und Deneb ergibt das 1,86 Mio € statt rund 216 k€. In Self-Service- und Konzern-Szenarien dominiert dieser eine Term die Schulungskategorie und bestraft die Code-Ansätze (Deneb `rampH` 40·120·240, Core 24·80·160) massiv gegenüber Paid (8·16·40). **Das ist ein Rangfolge-relevanter Fehler, kein Kalibrierungsdetail.** Fix siehe Abschnitt `churn`.

### 2. `intFactor` ist eine Entscheidung, keine Verteilung
Zwei multiplikative Meinungsparameter (`rateInt` × `intFactor`) auf demselben Term erzeugen eine 4,2-fache Spanne im dominanten Kostentreiber. Die P10–P90-Bänder — das erklärte Alleinstellungsmerkmal des Rechners — bestehen dadurch überwiegend aus Bewertungskonvention statt aus Sachunsicherheit. Bewertungskonventionen gehören in die Szenariodefinition, nicht in die Monte-Carlo.

### 3. Der Barwert ist eine Fußnote statt einer Kennzahl
Siehe `disc`. Die Optionen haben grundverschiedene Zeitprofile, aber die Rangfolge ignoriert das vollständig.

### 4. Zwei Migrationsmodelle für dieselbe Sache
`switchCost` (geplanter Wechsel: rollout-basiert, `migFactor`) und `risk` (erzwungener Wechsel: aufbau-basiert, `migShare`) beschreiben denselben Vorgang mit verschiedener Struktur. `risk` lässt den Rollout-Anteil weg und unterschätzt das Abkündigungsrisiko damit um eine Größenordnung, sobald viele Reports im Bestand sind.

### 5. Ansatzunabhängige Kosten im Optionsvergleich
`govPer1000` fällt für alle vier Optionen identisch an. Der Footer schließt die Power-BI-Grundlizenzen mit genau dieser Begründung aus — hier wird die Regel gebrochen. Das verwässert die relativen Kostendifferenzen, die der Rechner ausweist.

### 6. `capacityCost` bildet eine Sprungfunktion linear ab
Der `srcNote` beschreibt das Problem korrekt, die Formel ignoriert es. Zusätzlich ist der Default 0/0/0 bei `V`-Badge irreführend.

### 7. Doppelzählungsverdacht zwischen `maint` und `events`
`maint` ist als „% von Aufbau + Rollout" definiert und wird im `srcNote` mit „Core-Workarounds brechen bei Monatsupdates" begründet. Genau dieser Sachverhalt wird aber separat über `events × fixH` gerechnet. Bei Core (maint 20·34·52 %, events 2·3,25·5,25 × fixH 5·9,5·17 h) kann derselbe Aufwand zweimal in der Summe stehen. Die Definitionen gehören sauber getrennt: `maint` = geplante Anpassungen (neue Felder, Layout, Fachanforderungen), `events` = ungeplante Breaks durch Updates.

### 8. `demand1000` skaliert an der falschen Größe
Nachfrage nach neuen Reports entsteht bei Erstellern und Fachbereichen, nicht bei Lesern. Beim Mittelstands-Preset (40 Viewer) ist der Zuwachs faktisch null — im Kernsegment der Zielgruppe.

### 9. Kein Wachstumsdeckel bei `growth`
Exponentielles Viewer-Wachstum ohne Sättigung, das gleichzeitig die Lizenzkosten treibt. Bei langen Horizonten verzerrt das den Paid-Ansatz systematisch nach oben.

### Fehlende globale Annahmen

**a) Verfügbare Ersteller-Kapazität.** Das Modell rechnet Stunden, prüft aber nie, ob die Ersteller diese Stunden überhaupt haben. Beim `mittelstand`-Preset kann Core auf mehrere hundert Stunden im ersten Jahr kommen, verteilt auf drei Controller, die 80 % ihrer Zeit anders verbringen. Eine Plausibilitätswarnung („benötigte Stunden > x % der Ersteller-Kapazität") wäre der praktischste Zusatz überhaupt — und beantwortet die Frage, die im Raum steht: „Schaffen wir das mit dem Team, das wir haben?"

**b) Zeitverzug und Opportunitätsnutzen.** `firstReportH` wird berechnet und angezeigt, aber nicht bewertet. Wenn Core den ersten Standard-Report acht Wochen später liefert als Paid, entsteht ein Nutzenverlust, den ein reines Kostenmodell nicht sieht. Die TEI-Struktur, die im Rechercheprotokoll als Methodenreferenz steht, hätte hier eine Benefits-Seite.

**c) Tool-Sprawl / Koexistenz.** Das Modell unterstellt eine Entweder-oder-Entscheidung. Real endet fast jede Organisation bei 80 % Zebra + 20 % Deneb für Sonderfälle, oder Core plus ein gekauftes Visual. Koexistenz erzeugt genau die Doppelkosten, die den Vergleich interessant machen: zwei Schulungspfade, zwei Governance-Stränge, zwei Wartungszyklen. Ein Parameter „Anteil der Charts beim Zweitansatz" wäre der realistischste fehlende Baustein.

**d) Vertragsbindung und Mindestabnahme bei Paid.** Wird im `hidden`-Text genannt („Mindestabnahmen und jährliche Preisanpassungen"), ist aber nicht parametrisiert. Eine 3-Jahres-Bindung ändert das Risikoprofil erheblich: Wer nach Jahr 1 wechseln will, zahlt zwei Jahre doppelt.

**e) Adoptionsrisiko.** Der teuerste Fall ist ein Standard, den der Fachbereich nicht annimmt und der neben den alten Excel-Berichten herläuft. Das trifft alle Ansätze verschieden stark (Paid: schnell schön, aber wenig Beteiligung; Core: langsam, aber im Werkzeug, das alle kennen) und ist die häufigste Ursache für tatsächlich verbranntes Budget.

**f) Datenmodell-Vorleistung.** Die Panel-Schätzungen setzen „Datenmodell und Measures vorhanden" voraus. Core braucht aber laut Rechercheprotokoll bis zu 175 Measures je Abweichungsdiagramm — das ist Datenmodellarbeit und sitzt genau auf dieser Ausschlussgrenze. Entweder ist der Ausschluss zu weit gefasst, oder `firstH` für Core (10·16·27 h) ist zu niedrig.

---

## (c) Was ich nicht prüfen konnte

**Netzzugang:** Web-Suche und WebFetch waren grundsätzlich verfügbar. Eine Domain (`www.iwd.de`, Institut der deutschen Wirtschaft) wurde vom Egress-Proxy blockiert; die dortige Fluktuationszahl (30,1 % für Deutschland 2025) konnte ich nur aus dem Such-Snippet entnehmen und nicht auf ihre Definition hin prüfen. Ich habe sie deshalb als Bruttofluktuation eingeordnet — das ist eine begründete Einordnung, keine verifizierte Angabe.

**Nicht als Primärquelle abgerufen:**

- **Microsoft Azure-Preisliste für F-SKU in EUR.** Die Zahl 0,2115 €/CU/h (West Europe) stammt aus einer Sekundärquelle (lets-viz.com). Die offizielle Azure-Preisrechnerseite habe ich nicht geöffnet. Die daraus abgeleiteten 118 k€/Jahr für F64 PAYG sind daher `S`, nicht `V`. Wer den Wert in den Rechner schreibt, sollte ihn auf azure.microsoft.com/pricing gegenprüfen — Regionen und Wechselkurse ändern das um zweistellige Prozentsätze.
- **KPMG Kapitalkostenstudie 2025 im Volltext.** Ich habe die Kernzahlen (WACC Ø 8,5 %, Spanne 5,2–10,4 %, Basiszins 2,5 %, MRP 6,7 %) aus der Suchergebnis-Zusammenfassung, nicht aus dem PDF. Die Zahlen sind konsistent über mehrere KPMG-Seiten und plausibel gegenüber Vorjahren (8,2 %), aber die Stichprobe ist DACH-Großunternehmen — für einen 200-Mitarbeiter-Mittelständler ist der WACC eher höher, nicht niedriger.
- **freelancermap Freelancer-Kompass 2025 (PDF).** Der im Rechner zitierte Ø von 98–104 €/h ist über die Verzeichnisseite bestätigt, das Kompass-PDF selbst habe ich nicht geöffnet.
- **Robert Half Gehaltsstudie 2026.** Nur über Sekundärzitat (+6,0 % Median bei Vertriebscontrollern). Keine eigenen Vollkostenwerte.

**Grundsätzlich nicht belegbar — und das lässt sich auch mit mehr Zeit nicht ändern:**

- `demand1000`, `govPer1000`, `growth`, `migFactor`, `migShare` und `maintDecay` beschreiben Vorgänge, für die es keine veröffentlichte Statistik gibt. Es gibt keine Erhebung darüber, wie viele Power-BI-Reports pro 1.000 Leser und Jahr entstehen oder wie viele Stunden Berechtigungsrezertifizierung kostet. Diese sechs Werte sind und bleiben Expertenmeinung. Das ist kein Vorwurf — der Rechner kennzeichnet sie ja mit `E`/`F` — aber der Nutzer sollte wissen, dass er bei diesen sechs Reglern nicht „einen Wert korrigiert", sondern eine eigene Annahme setzt.
- Die im Rechner und im Rechercheprotokoll geführte Wartungsquote „15–25 % p. a." (Gartner/Forrester) konnte ich in keiner Primärquelle finden. Diese Faustregel zirkuliert seit Jahrzehnten in Sekundärliteratur und Agentur-Blogs. Sie ist damit für einen Rechner, der Quellenbadges vergibt, mit `F` korrekt eingestuft — aber die Herkunftsangabe „Gartner" sollte nirgends behauptet werden.

**Nicht geprüft, weil außerhalb des Auftrags:** die 22 optionsspezifischen Parameter (`OPTP`), die Betriebsmodell-Faktoren (`modeParams`), die K.O.-Logik und der Nutzwert-Score. Bei `OPTP` ist mir im Vorbeigehen aufgefallen, dass die Panel-Schätzungen („20 simulierte Profile, Sonnet") als Evidenzquelle geführt werden — ein Sprachmodell-Panel ist kein Expertenpanel, sondern eine strukturierte Vorannahme des Modells über sich selbst. Das gehört im UI anders benannt, sonst liest sich `E` wie eine Erhebung.
