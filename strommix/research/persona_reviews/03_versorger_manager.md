# Persona-Review 03 · Senior-Manager:in Energiewirtschaft (Großversorger)

| | |
| --- | --- |
| **Persona** | Senior-Manager:in bei einem großen deutschen Versorger (Netze + Vertrieb + Erzeugungserfahrung), ~20 Jahre Branchenpraxis, Regulierung / Projektfinanzierung / Projektrealität |
| **Datum** | 2026-08-19 |
| **Prüfobjekt** | `strommix-story.html` (Hauptfokus, v 0.1 Entwurf) · `whitepaper-strommix.html` + `whitepaper-strommix.js` (Stichproben Kap. 5 / Netzkosten) |
| **Faktenbasis** | `strommix/research/ist_zustand_de.md`, `strommix/research/story_claims_check.md`, `strommix/data/model_params.json`, `strommix/data/page_data.json`, `strommix/data/story_data.json`, `strommix/scripts/model.py` |
| **Blickwinkel** | „Stimmt das mit meiner Betriebsrealität überein — oder ist das Modell-Romantik?" |

---

## Gesamturteil

Das ist die methodisch sauberste Systemkosten-Aufbereitung, die ich seit langem gesehen habe: Die Annahmenkette wird offengelegt, Bandbreiten schlagen Punktwerte, Gegenpositionen stehen im Text statt in der Fußnote, und das Kapitel über die eigenen Grenzen ist ehrlicher als in den meisten Auftragsstudien. Fachlich fällt die Arbeit aber genau dort auseinander, wo mein Tagesgeschäft anfängt: Der Netzblock — mit rund 38,6 €/MWh der **größte Einzelposten** des eigenen Zielsystems — ist eine einzige lineare Annuität ohne Betrieb, ohne Redispatch, ohne Verteilnetz-Differenzierung und ohne Regulierungslogik; der Erdgas-Brennstoffpreis ist mit **null** angesetzt, was ausgerechnet die Kernaussage von Akt 4 trägt; und die Frage, *wer* die modellierten 90 GW thermische Reserve unter welchem Marktdesign baut, kommt auf 2.150 Zeilen kein einziges Mal vor. Die Story ist damit eine sehr gute Kostenrechnung und noch keine Systemaussage — sie beschreibt, was ein System kosten würde, nicht, ob und unter welchen Bedingungen es entsteht.

**Empfehlung: Überarbeiten vor Veröffentlichung — nicht neu bauen.** Die drei Must-Fixes unten sind in ein bis zwei Arbeitstagen zu erledigen, weil die benötigten Zahlen bereits im eigenen Datensatz liegen (`page_data.json` → `netzkosten`, `netz_und_systemkosten`, `versorgungssicherheit`; `ist_zustand_de.md` Kap. 5 und 6.2). Erst zwei davon sind Modelländerungen, der dritte ist reine Redaktion. In der jetzigen Form würde ich die Story einem Vorstand nicht als Entscheidungsgrundlage vorlegen — als Diskussionsimpuls für ein Fachpublikum aber sofort, wenn K1 und K3 geschlossen sind.

**Befundzahlen:** 17 Befunde — **3 kritisch**, **5 schwer**, **6 mittel**, **3 klein**.

---

## Top-3-Must-Fix

1. **K1 · Erdgas-Brennstoffkosten = 0 entscheidet die Aussage von Akt 4.** Der Satz „gegenüber beiden wasserstofflastigen Pfaden bleibt das Kernkraft-Szenario klar günstiger" ist mit dieser Setzung nicht belegbar — er ist ihr Artefakt. Entweder Gaspreis-Slider einbauen oder den Satz entschärfen.
2. **K2 + K3 · Netzblock reparieren und am Ist 2025 validieren.** Der größte Kostenposten des Modells ist zugleich seine schwächste Stelle; der einzige verfügbare Realitätsanker (Ist-2025 = 107 €/MWh) wird nirgends gegen die belegten Ist-Kostenblöcke gehalten. Diese Rückrechnung ist billig und entscheidet über die Glaubwürdigkeit aller anderen Zahlen.
3. **S1 · „Wer baut das?" als eigener Abschnitt.** Kraftwerksstrategie/StromVKG, erste Ausschreibungsrunde 4,5 GW am **01.09.2026** — zwölf Tage nach dem Reviewdatum, wörtlich im eigenen Faktendossier, in der Story nicht vorhanden. Ohne Marktdesign ist eine LSCOE-Zahl für die Branche unvollständig.

---

# Befunde nach Schwere

## KRITISCH

### K1 · Gaspreis = 0 trägt die Kernaussage von Akt 4

**Fundstelle**
- `strommix-story.html` Z. 647–660 (Akt 4 / Schritt 3), Z. 1967–1971 (Limit-Kachel „Gaspreis fehlt")
- `strommix/data/model_params.json` → `technologies.gas_ccgt.params.fuel_eur_mwh` = `null`, Note: „HARTE LUECKE … das Modell rechnet ohne expliziten Wert mit 0"
- `strommix/data/story_data.json` → `monte_carlo_headline.presets[1].gas_peak_gw` = **53,9 GW**

**Ist**
Das „Kostenminimum"-Szenario (mit Kernkraft) fährt 53,9 GW Gasspitzenlast. Der Brennstoff dafür kostet im Modell nichts. Im Fließtext steht: *„Gegenüber beiden wasserstofflastigen Pfaden bleibt das Kernkraft-Szenario dagegen klar günstiger — die Studie hat in diesem Punkt recht behalten."* Die Nullsetzung wird ausschließlich in einer Limit-Kachel am Seitenende erwähnt.

**Beanstandung**
Das ist keine konservative Vereinfachung, sondern eine strukturelle Bevorzugung genau der Szenarien, deren Rangfolge behauptet wird. Die H₂-Pfade bezahlen ihren Speicherbrennstoff vollständig (im 2056-Fall: Elektrolyseur 13,0 + H₂-Speicher 6,4 + H₂-Turbine 6,5 ≈ **26 €/MWh**), die gasgestützten Pfade bekommen ihren geschenkt. Der eigene Datensatz kennt die Größenordnung: `gas_fuel_implied` weist 128–229 €/MWh_el bei 1.500–3.000 h aus, FOeS nennt für deutsche GuD-Neuanlagen 230–280 €/MWh Gesamt-LCOE (`shared.lcoe_benchmarks.gas_ccgt.de_new`). Schon ein konservativer Ansatz von 30 €/MWh_th ergibt bei η = 0,4–0,6 rund 50–75 €/MWh_el auf die gefahrene Gasarbeit — mehr als die gesamte H₂-Kette kostet.

Aus Praxissicht kommt hinzu: Erdgas ist die **am besten belegte Zahl im ganzen Energiesystem.** TTF-Frontmonat lag 2024/25 durchgehend im Bereich von rund 30–45 €/MWh_th, tägliche Notierung, jederzeit prüfbar. Diese Position als „harte Datenlücke" zu führen, weil sie in den eigenen Recherche-Dossiers fehlt, ist gegenüber einem Fachpublikum nicht vermittelbar — es sieht so aus, als sei ein methodisches Formalkriterium („nur was im Dossier steht") wichtiger genommen worden als der offensichtliche Sachverhalt.

**Vorschlag**
- Gaspreis als eigenen, dokumentierten Parameter mit Stützpunkten aufnehmen: 20 / **35** / 60 €/MWh_th, plus Krisenfall 2022 (~120 €/MWh_th) als Sensitivität. Konfidenzstufe B ist dafür völlig ausreichend und immer noch besser als „0 mit Untergrenzen-Label".
- Solange das nicht drin ist: Den Satz in Akt 4 / Schritt 3 ändern in „… bleibt das Kernkraft-Szenario günstiger, **solange Erdgas als Brennstoff kostenlos angesetzt ist** — mit einem realistischen Gaspreis schließt sich dieser Abstand". Die Einschränkung gehört in die Step-Card, nicht 1.300 Zeilen weiter unten.
- Im Hero-Meta oder direkt unter dem Akt-4-Chart einen sichtbaren „Untergrenze"-Marker setzen, analog zum bereits vorhandenen `simlabel`.

---

### K2 · Der Netzblock ist der größte Kostenposten und die schwächste Modellierung

**Fundstelle**
- `strommix/scripts/model.py` Z. 712–720: `cost["netz"] = invest_bn * 1e9 * crf(wacc, grid_life) * (fee_share / ref_share)`
- `strommix/data/model_params.json` → `system.grid` (651 Mrd. €, `lifetime_years` 40 = MODELLANNAHME, `reference_fee_share` 1.0 = MODELLANNAHME)
- `strommix-story.html` Akt 5 / Schritt 2 (760 Mrd. € Netzanteil), Limit-Kachel „Setzungen im 30-Jahres-Plan"
- `story_data.json` → `thirty_year_plan.lscoe_2056.our_model.cost_components_eur_mwh_mittel`: **netz 38,6 €/MWh von 162,8** — der mit Abstand größte Einzelposten

**Ist**
Netzkosten = eine einzige Investitionsannuität (651 Mrd. €, 40 Jahre, globaler WACC), linear skaliert mit dem fEE-Energieanteil. Kein Betrieb, kein Redispatch, keine Verluste, kein Bestandsnetz, keine Trennung Übertragung/Verteilung, keine räumliche Komponente.

**Beanstandung** — vier getrennte Punkte, jeder für sich schon erheblich:

**(a) Regulierungslogik fehlt.** Netze sind reguliertes Monopol. Die Erlösobergrenze folgt der ARegV, die kalkulatorische Verzinsung dem von der BNetzA festgesetzten Eigenkapitalzinssatz, die Abschreibung den Nutzungsdauern nach StromNEV Anlage 1 — und die sind **nicht einheitlich 40 Jahre**: Freileitungen und Kabel liegen in dieser Größenordnung, Umspannanlagen und Transformatoren deutlich darunter, Schutz-, Leit- und Messtechnik im Bereich einer Dekade. Genau der kurzlebige Sekundärtechnik- und Konverteranteil (HGÜ!) wächst im Zielsystem überproportional. „40 Jahre für alles" setzt den Kapitaldienst systematisch zu niedrig an.

**(b) Nur Neubau, kein Betrieb.** Betriebs-, Instandhaltungs- und Verlustkosten fehlen vollständig. Netzverluste allein sind im deutschen System eine Größenordnung von mehreren Prozent der transportierten Arbeit und werden beschafft und bezahlt. Eine reine CAPEX-Annuität ist keine Netzkostenrechnung.

**(c) Redispatch fehlt — obwohl der Datensatz ihn führt.** `page_data.json` → `netzkosten.redispatch_engpassmanagement` weist für 2025 **2,7–3,1 Mrd. €** aus, aufgeschlüsselt nach konventionellem Redispatch (>1,2 Mrd.), Reservekraftwerken (~1,4 Mrd.) und Countertrading (~102 Mio.). In `model_params.json` steht dazu die Notiz: *„Ist-Wert, im Modell nicht doppelt angesetzt (in den Netzkosten enthalten)."* **Das ist sachlich falsch** — in einer Investitionsannuität ist ein jährlicher Betriebskostenblock gerade *nicht* enthalten. Hier ist eine reale Kostenposition mit einer Begründung herausgenommen worden, die nicht trägt.

**(d) Die lineare fEE-Skalierung begünstigt Kernkraft-Szenarien mechanisch.** Ein Szenario mit niedrigem fEE-Anteil bekommt automatisch einen Bruchteil der 651 Mrd. €. Real ist ein großer Teil dieser Summe **nachfrageseitig** getrieben — Elektrifizierung von Wärme und Verkehr, Rechenzentren, Ersatz alternder Anlagen — und fällt unabhängig vom Erzeugungsmix an. Der eigene Datensatz sagt das wörtlich: `netz_und_systemkosten.netzausbau_investitionen…hinweis`: *„Nicht alle Netzkosten sind EE-induziert — Ersatzinvestitionen und Elektrifizierung von Wärme/Verkehr trennen."* Das Modell tut genau das nicht und übernimmt damit ungeprüft eine GES-Vereinfachung, die es an anderer Stelle sehr sorgfältig auseinandernimmt.

**Vorschlag**
- Netzkosten in **drei Blöcke** splitten:
  1. **Sockel** (nachfragegetrieben) — skaliert mit TWh, *nicht* mit fEE-Anteil. Anteilsannahme als ausgewiesene Setzung (M), z. B. 40–60 % der 651 Mrd.
  2. **Integrationsanteil** — skaliert mit fEE-Anteil wie bisher.
  3. **Betriebs- und Engpassblock** — €/MWh-Aufschlag, kalibriert am belegten Ist (Redispatch 2,7–3,1 Mrd. €/a, plus Verluste, plus Netz-Opex).
- Getrennte Nutzungsdauern für Übertragung / Verteilung / Sekundärtechnik; oder mindestens ein Sensitivitätslauf mit 30 statt 40 Jahren.
- Netz-WACC vom Erzeugungs-WACC entkoppeln (siehe S2).
- Falls das alles zu weit geht: Wenigstens die Notiz zu `redispatch_2024_bn_eur` korrigieren und den Netzblock im Text ausdrücklich als **Untergrenze** kennzeichnen — so wie es beim Gas bereits geschieht.

---

### K3 · Der Ist-2025-Anker wird nicht gegen die Realität geprüft

**Fundstelle**
- `strommix-story.html` Z. 633–635: *„plus eine fünfte als Anker: das heutige System von 2025, mit demselben Modell gerechnet"*
- `story_data.json` → `monte_carlo_headline.presets[0]`: deterministisch **107,1 €/MWh**, P50 108, P5–P95 101–115

**Ist**
Der Anker wird berechnet und im Chart gezeigt — aber nirgends gegen eine beobachtbare Größe gehalten. Es gibt keinen Satz „Ist-System 2025 real ≈ X, Modell ≈ 107, Abweichung Y, Ursache Z."

**Beanstandung**
Das ist die **einzige echte Validierungsmöglichkeit** des gesamten Modells — alle anderen Szenarien liegen 20 bis 30 Jahre in der Zukunft und sind nicht falsifizierbar. Und die Daten für den Test liegen bereits vollständig im eigenen Repository:

| Belegter Ist-Block 2025/2026 | Wert | Fundstelle |
| --- | --- | --- |
| Börsenstrompreis DE/LU, Jahresmittel 2025 | 86,5 €/MWh | `ist_zustand_de.md` 7.1 |
| Netzentgelt im Haushaltsstrompreis 2026 | 9,3 ct/kWh = 93 €/MWh | `page_data.netzkosten.netzentgelte_2026` |
| Übertragungsnetzentgelt 2026 *ohne* Bundeszuschuss | 6,65 ct/kWh | ebd. |
| Bundeszuschuss Netzentgelte 2026 | 6,5 Mrd. € | ebd. |
| EEG-Finanzierung aus dem Bundeshaushalt 2025 | 16,5 Mrd. € | `ist_zustand_de.md` 7.3 |
| Redispatch / Engpassmanagement 2025 | 2,7–3,1 Mrd. € | `page_data.netzkosten` |

Wenn man diese Blöcke auf den Bruttostromverbrauch 2025 (512–526 TWh) bezieht, liegt man erkennbar über 107 €/MWh — der Netzblock allein bringt in der Ist-Welt eine Größenordnung, die das Modell mit rund 36–39 €/MWh abbildet. Die naheliegende Erklärung für die Lücke ist genau K2. Und wenn der Anker das Ist um 20–40 % unterschreitet, dann sind **alle** Zielsystem-Werte der Story um dieselbe Größenordnung zu niedrig — einschließlich der 162,8 €/MWh für 2056 und der Monte-Carlo-Bänder.

Aus Gremiensicht: Das ist die erste Frage, die in einem Investment Committee gestellt wird („rechnet euer Modell die Gegenwart richtig?"), und es ist der Punkt, an dem eine Vorlage ohne Antwort zurückgeht. Umgekehrt ist es die billigste Möglichkeit, der Story sehr viel Glaubwürdigkeit zu verschaffen — auch, und gerade, wenn die Abweichung groß ausfällt und offen benannt wird.

**Vorschlag**
- Ein eigener kurzer Abschnitt (oder ein „Beipackzettel"-Kasten) vor oder nach Akt 4: **„Rechnet das Modell die Gegenwart richtig?"** Tabelle Ist-Kostenblöcke 2025 vs. Modellergebnis, Differenz, Erklärungsversuch.
- Zweiter, bereits verfügbarer Validierungspunkt: modellierte Abregelung gegen das Ist 2024 (**9,4 TWh, 3,5 % der EE-Erzeugung**, `netz_und_systemkosten.abregelung`). Auch das kostet drei Zeilen.
- Falls die Abweichung nicht erklärbar ist: als Konfidenzabschlag im Hero und in den Limitationen ausweisen, nicht verstecken.

---

## SCHWER

### S1 · Es fehlt die Frage, *wer* die modellierten Anlagen unter welchen Bedingungen baut

**Fundstelle**
Gesamte Story. Volltextsuche in `strommix-story.html` und `whitepaper-strommix.html`/`.js`: **0 Treffer** für „Kraftwerksstrategie", „Kapazitätsmechanismus", „StromVKG", „Energy-Only", „PPA", „Merchant".
Gegenprobe: `ist_zustand_de.md` Kap. 6.2 enthält den kompletten Stand.

**Ist**
Die Story modelliert Systeme mit 45 GW Gas-Backup **plus** 45 GW H₂-Rückverstromung (Akt 5, `thirty_year_plan.lscoe_2056.our_model.inputs`) bzw. 53,9 GW Gasspitzenlast (Kostenminimum). Über den Marktrahmen, der diese Anlagen finanzieren müsste, steht kein Wort.

**Beanstandung**
Im Energy-Only-Markt baut niemand 90 GW thermische Kapazität für 500–1.500 Volllaststunden. Das ist keine Meinung, das ist das Missing-Money-Problem, und genau deshalb existiert das **StromVKG** (*Gesetz zur Sicherung der Versorgungssicherheit Strom*, vormals Arbeitstitel KWSG). Der eigene Faktenstand dazu:

- Grundsatzeinigung mit der EU-Kommission: **15.01.2026**
- Kabinettsbeschluss: **13.05.2026**
- **1. Ausschreibungsrunde 4,5 GW: 01.09.2026** — zwölf Tage nach dem Datum dieses Reviews
- 2. Runde 4,5 GW: 08.12.2026; zunächst 11 GW gesamt, weitere Runden 2027/2029
- Inbetriebnahme aus Runde 1: spätestens 2031
- Koalitionsvertrag: bis zu **20 GW** bis 2030 — Diskrepanz zu den 11 GW ausdrücklich ungeklärt
- Kapazitätsmechanismus ab 2031: **noch nicht final ausgestaltet**

Eine Systemkostenstory, die im August 2026 erscheint und dieses Gesetzgebungsverfahren nicht erwähnt, wirkt für jeden Branchenleser wie aus einer Parallelwelt. Und sie lässt die eigentlich interessante Erkenntnis liegen: Die Story sagt völlig richtig, der WACC sei „keine technische, sondern eine politische Größe" — das gilt für den Backup-Park genauso wie für Kernkraft. Wer 90 GW Reserve rechnet, rechnet implizit einen Kapazitätsmechanismus mit, dessen Ausgestaltung heute offen ist und dessen Kosten in keiner LSCOE-Zahl auftauchen.

**Vorschlag**
- Ein kompakter Akt oder Beipackzettel **„Wer baut das?"** mit: Energy-Only vs. Kapazitätsmechanismus in drei Sätzen, StromVKG-Zeitschiene, 11 GW vs. 20 GW, offene Ausgestaltung ab 2031, EEG-Marktprämie als De-facto-CfD für EE, Offshore-Nullcent-Systematik (siehe S4).
- Mindestvariante, wenn kein Platz ist: ein Satz in Akt 5 / Schritt 4 und in den Limitationen — „Der modellierte Backup-Park existiert im Energy-Only-Markt nicht; er hängt an einem Instrument, das sich gerade im Gesetzgebungsverfahren befindet."

---

### S2 · Ein globaler WACC für regulierte, geförderte und Merchant-Assets ist finanzierungsseitig nicht haltbar

**Fundstelle**
- `model_params.json` → `global.wacc` (3 / **5** / 9 %), `modelling_decisions`: *„WACC global (3-9 %, Default 5 % wie GES)"*
- `strommix-story.html` Epilog Z. 827–842, Glossar `#gl-wacc` Z. 904–918

**Ist**
Derselbe Kapitalkostensatz gilt für: das regulierte Netz, PV und Wind unter gleitender Marktprämie, Merchant-Batteriespeicher, Gas-Peaker, H₂-Turbinen und Kernkraft-Neubau.

**Beanstandung**
Das ist die Stelle, an der ein Investment Committee die Vorlage auseinandernimmt — und sie ist umso ärgerlicher, als die Story den WACC selbst zum **entscheidenden Hebel** erklärt („Die Kernbotschaft passt in einen Satz … der Kapitalkostensatz"). Zwischen den genannten Asset-Klassen liegen in der Praxis mehrere hundert Basispunkte, und zwar systematisch:

| Asset-Klasse | Risikoprofil | Relative Einordnung |
| --- | --- | --- |
| Reguliertes Netz | gesetzliche Erlösobergrenze, Mengenrisiko nahe null | am unteren Ende |
| PV/Wind mit gleitender Marktprämie | Absicherung nach unten, Marktwertrisiko, Mengenrisiko Wetter | knapp darüber |
| Batteriespeicher (Arbitrage + Regelleistung) | vollständiges Merchant-Risiko, volatiler Erlösstack | deutlich darüber |
| Gas-/H₂-Peaker ohne Kapazitätsvertrag | Missing Money, wenige Volllaststunden | hoch |
| Kernkraft-Neubau FOAK ohne Instrument | Bau-, Termin-, Regulierungs-, Politikrisiko über 12–17 Jahre | am oberen Ende |

Der Epilog erkennt das für Kernkraft ausdrücklich an — *„Jedes europäische Neubauprojekt braucht deshalb ein staatliches Instrument, das den Kapitalkostensatz künstlich senkt: CfD, RAB-Modell, Staatsgarantien"* — zieht daraus aber keine Modellkonsequenz und verschweigt zugleich, dass die Erneuerbaren in Deutschland ein solches Instrument mit der gleitenden Marktprämie **längst haben**. Damit wird die Story an ihrer stärksten Stelle inkonsistent: Sie erklärt den WACC zum Kernthema und behandelt ihn dann als eine Zahl für alle.

Praxisergänzung, die komplett fehlt: **PPA-Markt und Merchant-Risiko.** Deutsche Onshore- und PV-Projekte werden heute über einen Mix aus EEG-Marktprämie, Corporate PPAs und Merchant-Tail finanziert; die PPA-Preisbildung und die verfügbare Bonität der Offtaker sind für die Realisierbarkeit oft wichtiger als die LCOE. Bei über 575 Negativpreisstunden (2025) verlangen Banken zunehmend Abschläge auf die Erlösprognose („Kannibalisierung des Marktwerts"). Kein Wort davon.

**Vorschlag**
- Technologiespezifische WACC-Aufschläge als ausgewiesene Setzung (M), mindestens drei Klassen: **reguliert / instrumentgesichert / merchant**.
- Wenn das zu weit geht: eine einzige Sensitivitätszeile im Whitepaper Kap. 6 — „Netz 4 %, EE 5 %, Speicher und Peaker 8 %, Kernkraft 9 %" gegen den Basisfall. Das ist billig zu rechnen und beantwortet die erste Gremienfrage.
- Im Epilog einen Satz ergänzen: Das Instrumentenargument gilt symmetrisch. Auch der EE-Pfad rechnet mit einem politisch gesetzten Kapitalkostensatz.

---

### S3 · Die 8.000 Volllaststunden für Kernkraft bleiben unkommentiert — obwohl der eigene Parametersatz sie als inkonsistent markiert

**Fundstelle**
- `strommix-story.html` Z. 389–392: *„Kernkraft läuft in der Studie mit 8.000 h, Photovoltaik mit … Dieselbe Investition, achtfache Arbeitszeit."*
- `model_params.json` → `technologies.nuclear.params.full_load_hours.note`: *„8000 h = 91 Prozent Verfügbarkeit, nur von Bestflotten erreicht. In einem System mit hohem PV-/Windanteil muss Kernkraft lastfolgen, was die Auslastung strukturell senkt. **Wer 8000 h UND hohen EE-Anteil unterstellt, rechnet inkonsistent.**"* — Status: MODELLANNAHME
- Volltextsuche „lastfolg" in `strommix-story.html`: **0 Treffer**. Die eigene Modellsetzung 7.500 h (Spanne 6.500–8.000) wird in der Story nirgends genannt.

**Ist**
Akt 2 / Schritt 2 seziert bei Wind sehr präzise die Verwechslung von Bestandsflotte und Neuanlage („das ist der Schnitt der *Bestandsflotte*"). Bei Kernkraft bleibt die freundlichste denkbare Kombination — 8.000 h **und** 65 Jahre Lebensdauer — unkommentiert stehen.

**Beanstandung**
Das ist eine Asymmetrie in der Prüftiefe, und sie ist angreifbar, weil die Story an anderer Stelle genau diese Sorgfalt einfordert. Betriebsrealität:

- Deutschland hatte 2025 rund **575 Stunden** mit negativem Day-Ahead-Preis, H1 2026 noch 299 — mit einem Extremwert von **−499,99 €/MWh** und im Schnitt fast doppelt so tiefen Negativstunden wie in den Vorjahren (`ist_zustand_de.md` 1.7 / 7.1). Ein preisnehmender Grundlastblock fährt in diesen Stunden gegen negative Deckungsbeiträge oder muss drosseln.
- Frankreich, die einzige westliche Referenzflotte mit lastfolgendem Kernkraftbetrieb, liegt im Flottenschnitt in der Größenordnung 6.000–7.000 Volllaststunden — nicht 8.000.
- 91 % Verfügbarkeit über 60+ Jahre setzt Revisionsplanung, Nachrüstungen und Brennelementwechsel voraus, die in der Praxis in einzelnen Jahren zweistellige Ausfallanteile erzeugen.

Im GES-„Kostenminimum" mit nur 90 GW fEE ist die 8.000-h-Annahme noch tragfähig — in jedem EE-lastigen Szenario nicht. Genau das gehört gesagt.

**Vorschlag**
- Einen Absatz in Akt 1 / Schritt 3 oder im Beipackzettel nach Akt 2 ergänzen: Bestflottenannahme, im Kostenminimum vertretbar, in EE-lastigen Systemen nicht; Negativpreisstunden als Betriebsargument.
- Die eigene Setzung (7.500 h, 6.500–8.000) offenlegen — Symmetrie zu den sehr prominent gezeigten Wind- und PV-Volllaststunden.

---

### S4 · Auktionswerte werden als Ober- statt als Untergrenze gedeutet — marktseitig falsch herum

**Fundstelle**
- `strommix-story.html` Z. 449–450: *„Das sind Zuschlagswerte, keine Vollkosten — aber sie sind eher eine Ober- als eine Untergrenze dessen, was Betreiber brauchen."*
- `story_data.json` → `shared.lcoe_benchmarks.pv_freiflaeche.auction` (39,9–51,0 €/MWh, 03/2026), `wind_onshore.auction[1]` (mengengewichtet 50,6 €/MWh, 05/2026)
- `shared.lcoe_benchmarks.wind_offshore.auction`: *„Nullcent-Gebote mit dynamischem Bieterverfahren. Bieter ZAHLEN an den Staat (N-9.4, 2025: TotalEnergies 180 Mio. EUR für 1000 MW) … die Zahlungen sind ein zusaetzlicher Kostenaufschlag."* — in der Story **nicht** verwendet.

**Ist**
EEG-Zuschlagswerte werden als konservative Obergrenze der Betreiber-Vollkosten interpretiert und als Beleg dafür verwendet, dass die GES-Studie PV zu teuer ansetzt.

**Beanstandung**
Die Deutungsrichtung stimmt nicht. Der anzulegende Wert unter der **gleitenden Marktprämie** ist eine einseitige Absicherung nach unten — die Erlösoberseite bleibt beim Betreiber. Bieter kalkulieren deshalb mit Marktwerterwartung plus Absicherung und können rational **unter** ihren Vollkosten bieten. Hinzu kommen Kostenblöcke, die der Betreiber gerade *nicht* trägt und die deshalb im Zuschlagswert fehlen, für ein Systemkostenmodell aber sehr wohl anfallen:

- Netzanschluss- und Netzausbaukosten jenseits des Baukostenzuschusses — sozialisiert über die Netzentgelte
- Entschädigung bei Abregelung im Redispatch (§ 13a EnWG) — trägt der Netzkunde, nicht der Anlagenbetreiber
- Systemdienstleistungen, Blindleistung, Ausgleichsenergie im Bilanzkreisverbund
- bei Offshore zusätzlich die **negativen Gebote**: Die Zahlung an den Staat ist ein realer Kostenblock, der in keiner LCOE-Zahl auftaucht — und er ist der Grund, warum aus deutschen Offshore-Auktionen überhaupt kein LCOE-Signal ableitbar ist.

Für einen Systemkostenvergleich ist ein Auktionswert damit systematisch **zu niedrig**, nicht zu hoch. Das schwächt das PV-Argument in Akt 2 / Schritt 1 nicht auf null — die ISE-Bandbreite 41–69 €/MWh trägt es weiterhin — aber die Begründung muss umgedreht werden.

Ergänzend fehlt in Akt 5 die Realitätsprüfung auf die 70 GW Offshore: Die 2026er Offshore-Ausschreibungen wurden **auf 2027 verschoben** (Flächenentwicklungsplan-Änderung 30.01.2026, ebenfalls im eigenen Datensatz).

**Vorschlag**
- Formulierung in Akt 2 / Schritt 1 umdrehen und begründen (zwei Sätze reichen: sozialisierter Netzanschluss + Abregelungsentschädigung + einseitige Absicherung).
- Offshore-Nullcent-Systematik und die Verschiebung der 2026er Auktionen in den Beipackzettel nach Akt 2 aufnehmen — sie ist ein starkes, eigenständiges Argument dafür, dass „billige Auktionswerte" und „günstiges System" nicht dasselbe sind.

---

### S5 · Keine Umsetzbarkeitsschranke: Zubauraten, Genehmigungen, Lieferzeiten, Personal

**Fundstelle**
- `story_data.json` → `thirty_year_plan.lscoe_2056.our_model.inputs`: PV 400 GW, Wind onshore 150 GW, Offshore 70 GW, Batterie 110 GW / 450 GWh, Elektrolyse 55 GW, H₂-Turbinen 45 GW, Gas 45 GW
- Volltextsuche „Trafo", „Transformator", „Lieferzeit", „Fachkr" in Story und Whitepaper: **0 Treffer** im HTML. Einziger Berührungspunkt: `cp_ee_risks` erwähnt „Transformatorenknappheit" in einem Nebensatz, unquantifiziert und ohne Modellwirkung.

**Ist**
Der 30-Jahres-Pfad wird ausschließlich als Kostenrechnung geprüft. Ob er baubar ist, kommt nicht vor.

**Beanstandung**
Aus Betriebssicht ist das die schwächste Stelle der gesamten Arbeit — und die, bei der ein Branchenpublikum als Erstes abwinkt. Die eigenen Zahlen liefern die Gegenprobe frei Haus:

| Technologie | Ist-Zubau | erforderlich bis 2030 | Faktor | Zielpfad Story bis 2056 |
| --- | ---: | ---: | ---: | --- |
| Photovoltaik | 16,4 GW (2025) | ≈ 19,6 GW/a | ≈ 1,2× | 117 → 400 GW |
| Wind onshore | 4,6 GW (2025) | ≈ 9,4 GW/a | ≈ 2,0× | 68 → 150 GW |
| Wind offshore | 0 GW (2025) / 1,06 GW (H1 2026) | ≈ 4,3 GW/a | ≳ 4× | 10,8 → 70 GW |

Die Stiftung Offshore-Windenergie stellt im eigenen Faktendossier fest: *„Das Ausbauziel für 2030 ist zeitlich nicht mehr zu erreichen."* Für 70 GW bis 2056 wären rund 2 GW/a über drei Jahrzehnte nötig — ohne eine einzige Lücke, bei einer Branche, die 2025 null Zubau hatte. Parallel sollen 90 GW thermische Kapazität (45 Gas + 45 H₂) entstehen, während die erste Ausschreibungsrunde der Kraftwerksstrategie 4,5 GW umfasst.

Und dann die Positionen, die in meinem Alltag heute jedes Projekt bremsen und in keinem Kostenmodell auftauchen:

- **Großtransformatoren und HGÜ-Konverter:** Lieferzeiten von mehreren Jahren, Herstellerslots weit im Voraus ausgebucht. Das ist derzeit die harte Restriktion beim Netzausbau, nicht der Kapitalkostensatz. Die IMK-Studie nennt Komponentenknappheit ausdrücklich als Aufwärtsrisiko (`ist_zustand_de.md` 5.1) — die Story übernimmt die Investitionssumme, nicht das Risiko.
- **Gasturbinen-Slots** bei den wenigen verbliebenen Herstellern, mit Vorlaufzeiten, die bereits jetzt die Inbetriebnahme „spätestens 2031" der Kraftwerksstrategie unter Druck setzen.
- **Kabelfertigungs- und Verlegekapazität** (Offshore-Anbindung, HGÜ).
- **Netzanschlusswarteschlangen:** Anschlusszusagen für Großspeicher, Elektrolyseure und Rechenzentren mit mehrjährigen Wartezeiten in den Nordnetzen — ein Thema, das gerade jede Verteilnetz-Geschäftsführung beschäftigt.
- **Genehmigungsdauern und Personal:** Montage, Umspannwerksbau, Schutz- und Leittechnik, Netzplanung. Der Engpass ist längst nicht mehr nur Kapital.

**Vorschlag**
Es braucht **kein neues Modell.** Ein Kasten „Was dieses Modell nicht kann: bauen" mit der Tabelle oben plus fünf Sätzen zu Lieferzeiten, Netzanschlusswarteschlangen und Personal. Zwanzig Zeilen, und die Story ist für jeden Branchenleser deutlich glaubwürdiger — weil sie zeigt, dass sie den Unterschied zwischen einer Kostenrechnung und einem Umsetzungsplan kennt.

---

## MITTEL

### M1 · Netzentgelte, Bundeszuschuss und die Verteilnetzebene fehlen vollständig

**Fundstelle** — Volltextsuche „Netzentgelt", „Verteilnetz", „Übertragungsnetz" in `strommix-story.html`, `whitepaper-strommix.html` und `whitepaper-strommix.js`: **0 Treffer**. Daten vollständig vorhanden in `page_data.netzkosten`.

**Ist** — 2026: Übertragungsnetzentgelt ohne Bundeszuschuss 6,65 ct/kWh, mit Zuschuss 2,86 ct/kWh (−57 %), Bundeszuschuss 6,5 Mrd. € aus dem KTF, Netzentgelt im Haushaltspreis 9,3 ct/kWh (25,1 % des Endpreises). Der eigene Datensatz trägt den entscheidenden Satz: *„Transferleistung, keine Kostensenkung — Netzkosten sinken nicht, sie werden verlagert."*

**Beanstandung** — Eine Story über Systemkosten, die den größten *sichtbaren* Systemkostenblock der Endkunden nicht erwähnt und die haushaltsfinanzierte Verlagerung von 6,5 Mrd. € unterschlägt, lässt genau die Erfahrung aus, die Vertrieb und Netz täglich machen. Dabei passt der Punkt perfekt zur Kernbotschaft der Story („jede Zahl ist eine Annahmenkette"): Die Netzentgelte sind 2026 um 130 €/a je Musterhaushalt gesunken, *ohne dass eine einzige Kostenposition kleiner geworden wäre.* Das ist die anschaulichste Illustration der eigenen These im ganzen Datensatz — und sie wird nicht verwendet.

Zusätzlich fehlt die **Verteilnetzebene komplett**, obwohl das IMK sie mit 323 Mrd. € praktisch gleich groß wie das Übertragungsnetz (328 Mrd. €) ausweist — und obwohl die Integrationskosten von Dach-PV, Wärmepumpen und Ladeinfrastruktur überwiegend *dort* anfallen, nicht auf der Höchstspannungsebene. Ebenfalls unerwähnt: die regionale Netzentgeltspreizung (Brandenburg/MV gegen Hamburg/NRW), die im Faktendossier ausdrücklich steht und in der politischen Debatte gerade eine große Rolle spielt.

**Vorschlag** — Ein Beipackzettel oder Epilog-Absatz: Aufteilung 328 / 323 Mrd. €, wo die Kosten beim Kunden ankommen, und der Satz zur Transferleistung. Vier bis sechs Sätze, hoher Erkenntnisgewinn.

---

### M2 · Abregelung und negative Preise fehlen als Kostenposition und als Realitätsanker

**Fundstelle** — `page_data.netz_und_systemkosten.abregelung` (2024: 9,4 TWh = 3,5 % der EE-Erzeugung, davon PV 1.389 GWh), `negative_strompreise_stunden` (2024: 457, 2025: 573). `model.py` bilanziert Curtailment mengenmäßig, aber ohne Kostenwirkung. In der Story: keine Erwähnung.

**Beanstandung** — Abgeregelte EE-Anlagen werden nach § 13a EnWG entschädigt; das ist ein Netzkostenblock, der über die Netzentgelte auf alle Kunden durchschlägt (allein Q2 2025: ~158 Mio. €, siehe `page_data.netzkosten.redispatch_engpassmanagement`). Im Modell ist Abregelung kostenlos — Überkapazität wird damit systematisch zu billig. Für einen Erzeugungsbetreiber ist „wer zahlt die abgeregelte Arbeit" keine Fußnote, sondern eine Vertragsfrage.

**Vorschlag** — Curtailment-Entschädigung als eigene, abschaltbare Kostenposition oder mindestens als Sensitivität; und die Ist-Abregelung 2024 (9,4 TWh) als Vergleichsgröße zur modellierten Abregelung ausweisen — das ist der in K3 erwähnte zweite kostenlose Validierungspunkt.

---

### M3 · „Gesicherte Leistung" wird nirgends als eigene Größe geführt

**Fundstelle** — `page_data.versorgungssicherheit.gesicherte_leistung_zusatzbedarf_gw`: BNetzA-Bericht zur Versorgungssicherheit Strom vom 03.09.2025 — Zusatzbedarf **+17 bis 21 GW bis 2030**, 2035 im Zielszenario 22,4 GW, bei verzögerter Wende 35,5 GW. Treiber der Spanne laut Quelle: Erfolg der Nachfrageflexibilisierung und Tempo des EE-Ausbaus. In der Story: 0 Treffer.

**Beanstandung** — Die Branchen- und Regulierungsdebatte läuft über *gesicherte Leistung* und Versorgungssicherheitsberichte, nicht über LSCOE. Das Modell dimensioniert Backup implizit über den im Dispatch gemessenen Spitzenbedarf und kommt für das Kostenminimum-Szenario auf 53,9 GW — ohne diese Zahl je gegen die amtliche Bedarfsschätzung zu halten. Das ist eine verschenkte Plausibilisierung, und es ist die Kennzahl, in der ein Fachpublikum denkt.

**Vorschlag** — Eine Zeile in Akt 5 oder in den Limitationen: modellierte gesicherte Leistung vs. BNetzA-Zusatzbedarf 2030/2035, inklusive der Spannenbegründung.

---

### M4 · „Kein Lastmanagement" wird pauschal als konservativ verbucht — das stimmt nur zur Hälfte

**Fundstelle** — `strommix-story.html` Z. 1972–1975 (Limit-Kachel): *„Import, Export und flexible Nachfrage sind bewusst nicht modelliert. Das ist konservativer als die Studie … und es macht unsere Systemkosten eher zu hoch als zu niedrig."*

**Beanstandung** — Für Import/Export trifft das zu. Für Lastmanagement nur bedingt, und die Aussage ist **rangfolgenrelevant**: Nachfrageflexibilität ist im deutschen Zielsystem eine ausdrückliche Planungsgröße (§ 14a EnWG für steuerbare Verbrauchseinrichtungen seit 2024, dynamische Tarife, Elektrolyse und Rechenzentren als flexible Lasten, industrielle Lastverschiebung), und die BNetzA benennt den Erfolg der Nachfrageflexibilisierung explizit als Treiber der Spanne beim Zusatzbedarf gesicherter Leistung. Ein System mit hohem fEE-Anteil profitiert von Flexibilität **überproportional**, ein Grundlastsystem kaum. Das Weglassen ist also nicht neutral, sondern verschiebt die Rangfolge zulasten der EE-Pfade — und damit zugunsten des Kernkraft-Szenarios. Der pauschale Satz „macht unsere Systemkosten eher zu hoch" verdeckt genau das.

**Vorschlag** — Satz differenzieren: *Import/Export = konservativ für alle Szenarien; fehlende Nachfrageflexibilität = konservativ vor allem für die EE-Pfade, also rangfolgenrelevant.* Ein Halbsatz, aber ein methodisch wichtiger.

---

### M5 · Das Kernkraft-Programmargument bleibt ohne Betreiber- und Bilanzfrage

**Fundstelle** — `strommix-story.html` Z. 793–803 („Zwei Blöcke sind die ungünstigste aller Konstruktionen"), `thirty_year_plan.nuclear_variant`.

**Ist** — Die Story fordert völlig zu Recht, Kernkraft als **Programm** zu rechnen, und nennt die Hürden: Neubauverbot, Behördenaufbau, Entscheidung über mehrere Legislaturperioden, Lead Time 18–25 Jahre.

**Beanstandung** — Was fehlt, ist die betriebswirtschaftliche Seite, die in Deutschland die eigentliche Hürde wäre: **Es gibt keinen Betreiber.** Die vier ehemaligen Betreiber haben ihre Entsorgungsverpflichtungen in den KENFO überführt, ihre Nukleartechnik-Organisationen abgebaut und ihre Strategien auf Netze, Erneuerbare und Vertrieb umgestellt. Ein Programm mit sechs oder mehr Blöcken bindet über zwei Jahrzehnte eine Größenordnung, die keine deutsche Bilanz trägt — es wäre eine Staatsaufgabe, und genau das ist zugleich das WACC-Argument aus S2. Ohne diesen Punkt wirkt der „Fairness"-Abschnitt wie eine reine Machbarkeitsdebatte und lässt das stärkste nüchterne Argument liegen.

**Vorschlag** — Zwei Sätze zur Betreiber- und Bilanzfrage plus Verweis auf den KENFO-/Endlager-Abschnitt des Whitepapers (Kap. 7).

---

### M6 · „Exakt reproduziert" für die 1.412 Mrd. € überzeichnet; die Ersatzinvestitionen sind selbst noch eine Untergrenze

**Fundstelle** — `strommix-story.html` Akt 5 / Schritt 2; `thirty_year_plan.investment_check` (md_total 1.412 Mrd. €, davon Netz 760 Mrd. €; fehlende Ersatzinvestitionen 208 Mrd. €).

**Beanstandung** — Reproduziert wird eine **Addition**, keine Investitionsrechnung. Das Wort „exakt" ist an dieser Stelle stärker als der Erkenntnisgewinn und lenkt vom eigentlich wertvollen Befund ab (208 Mrd. € fehlende Ersatzinvestitionen, Phase 3 heißt „Konsolidierung & Repowering" und enthält keinen Euro dafür). Und dieser Befund ist selbst noch zu klein gerechnet: Die 208 Mrd. € umfassen **nur Erzeugung und Speicher**. Netze werden ebenfalls ersetzt — große Teile des deutschen Verteilnetzes stammen aus den 1960er/70er Jahren und erreichen bis 2056 planmäßig ihr Nutzungsdauerende. Ein Ersatzinvestitionsblock Netz fehlt komplett, obwohl er in derselben Größenordnung liegen dürfte wie der Erzeugungsteil.

**Vorschlag** — „exakt reproduziert" abschwächen, den Ersatzinvestitions-Befund nach vorn ziehen und um die Netzseite ergänzen — mindestens als benannte Lücke.

---

## KLEIN

### KL1 · „v 0.1 (Entwurf)" im Hero, aber Kernaussagen im Indikativ
Bei der zu erwartenden Verwendung (Fachpublikum, Social Media, Zitierung) sollte entweder der Entwurfsstatus verschwinden oder die Kernaussagen sollten erkennbar vorläufig formuliert sein. Kein Fachbefund, aber eine Reputations- und Zitierfrage — die Erfahrung ist, dass die Schlagzeile zitiert wird und der Entwurfshinweis nicht.

### KL2 · Emissionsfaktor Gas ist ein Lebenszyklus-Proxy statt eines Direktfaktors
`model_params.json` → `gas_ccgt.params.emission_factor_t_mwh` = 0,403 t/MWh_el, ausdrücklich als „PROXY: UNECE-Lebenszyklus-Untergrenze" markiert, mit der Auflage „Vor Veroeffentlichung durch einen echten Direktfaktor (z. B. UBA-Emissionsfaktor Erdgas) ersetzen." Der Vorkettenanteil (Methanschlupf) gehört nicht ins ETS 1 und damit nicht in die CO₂-Kostenrechnung. Wirkung ist klein (~30 €/MWh_el bei 75 €/t), aber es ist die *einzige* Stelle, an der die Story CO₂ tatsächlich einpreist — und damit methodisch exponiert. Vor Publikation tauschen.

### KL3 · Bandbreite der Redispatch-Zahlen ungenutzt
Der Widerspruch 2,7 vs. 3,1 Mrd. € (W6 im Faktendossier) und die Aufschlüsselung — größter Block ist **konventioneller** Redispatch und Reservekraftwerke, nicht EE-Abregelung — ist einer der stärksten Fakten gegen die verbreitete Gleichsetzung „Redispatchkosten = Kosten der Erneuerbaren". Das Dossier sagt das explizit (`ist_zustand_de.md` 5.3: *„Die verbreitete Gleichsetzung ‚Redispatchkosten = Kosten der Erneuerbaren' ist damit quellenmäßig nicht gedeckt."*). Die Story ist genau für solche Richtigstellungen gebaut — und lässt diese aus. Ein Beipackzettel-Kasten, drei Sätze.

---

## Was die Story sehr gut macht (damit die Kritik einzuordnen ist)

- Die Trennung Bestandsflotte / Neuanlage bei den Wind-Volllaststunden (Akt 2 / Schritt 2) ist ein präziser, seltener und richtiger Befund.
- Die Kostenabgrenzungs-Systematik (OCC / EPC / FOAK / Gesamtprojekt inkl. Finanzierung) mit der ausdrücklichen Ablehnung ungewichteter Mittelwerte ist besser als in den meisten Fachbeiträgen.
- Die Kernkraft-Opex-Korrektur (absolut in €/kW/a statt als CAPEX-Prozentsatz) ist technisch richtig und wird ausdrücklich **zugunsten** der geprüften Studie berichtet — das ist Handwerk.
- Das Skalenargument gegen „zwei Blöcke" ist richtig, wird fair mit der Programm-Gegenposition abgesichert und ist genau die Argumentation, die man in einer Vorstandsvorlage braucht.
- Der Umgang mit dem Lovering-Datensatz (Bandbreiten statt Trendlinie, Kritik im Text statt in der Fußnote) ist vorbildlich.
- Der Befund `flh_finding` — dass die 174-TWh-Deckungslücke des geprüften Plans größtenteils ein Volllaststunden-Artefakt ist und die Lücke mit realistischen Neuanlagenwerten von 17 % auf 1 % schrumpft — ist ein Ergebnis **zugunsten** des geprüften Plans, das die eigene Vorlage selbst verschenkt hatte. Das ist die richtige Haltung.

---

## Zusammenfassung der Änderungsvorschläge nach Aufwand

| Aufwand | Maßnahme | Befund |
| --- | --- | --- |
| **Redaktion, < 1 h** | Satz in Akt 4/3 um „solange Gas kostenlos angesetzt ist" ergänzen | K1 |
| **Redaktion, < 1 h** | Satz in Akt 2/1 zur Deutungsrichtung der Auktionswerte umdrehen | S4 |
| **Redaktion, < 1 h** | Limit-Kachel Lastmanagement differenzieren | M4 |
| **Redaktion, < 1 h** | Notiz `redispatch_2024_bn_eur` korrigieren („nicht enthalten") | K2(c) |
| **Redaktion, 1–2 h** | Kasten „Wer baut das?" (StromVKG, 11 vs. 20 GW, Kapazitätsmechanismus) | S1 |
| **Redaktion, 1–2 h** | Kasten „Was dieses Modell nicht kann: bauen" (Zubauraten, Lieferzeiten) | S5 |
| **Redaktion, 1–2 h** | Beipackzettel Netzentgelte / Bundeszuschuss / Verteilnetz | M1, KL3 |
| **Rechnung, 2–4 h** | Ist-2025-Rückrechnung gegen belegte Kostenblöcke + Abregelungsvergleich | K3, M2 |
| **Modell, ½–1 Tag** | Gaspreis-Parameter einführen, Monte Carlo neu ziehen | K1 |
| **Modell, 1–2 Tage** | Netzblock in Sockel / Integration / Betrieb splitten, Nutzungsdauern trennen | K2 |
| **Modell, ½ Tag** | WACC-Sensitivität nach Asset-Klasse als eigener Lauf | S2 |

---

*Review erstellt am 2026-08-19. Keine Änderungen an Prüfobjekten oder Daten vorgenommen; kein Commit.*
