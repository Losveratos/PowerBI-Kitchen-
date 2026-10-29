---
review: "01 · Ökobilanz-Wissenschaft / Peer-Review vor Veröffentlichung"
persona: "LCA-Wissenschaftlerin (Ökobilanz-Forschung, publiziert zu Fahrzeug-LCAs; Arbeitsschwerpunkte Systemgrenzen-Definition, Unsicherheitsanalyse in LCA, ISO 14040/14044). Rolle: Fachgutachterin im Peer-Review-Modus."
datum: "2026-08-30"
pruefobjekte: "eauto-klimabilanz.html (Volltext inkl. JS) · eauto/data/model_params.json · eauto/scripts/model.py · eauto/scripts/monte_carlo.py · eauto/research/parameter_quellen.md · eauto/research/hochrechnung_quellen.md"
verfahren: "Vollständige Lektüre von Seite, Modellcode und beiden Dossiers; Rechenkette nachvollzogen; Monte-Carlo-Referenz eigenständig nachgerechnet (python3, run_mc mit den aktuellen model_params.json) und gegen data/monte_carlo_reference.json geprüft; Einzelaussagen der Seite (Kohlestrom-Robustheit, ±10-Prozentpunkte-Schalter) am Punktmodell gegengerechnet."
---

# Fachgutachten · „E-Auto-Klimabilanz: Auspuff oder Lebenszyklus?"

## Kurzfazit

Das ist eine der transparentesten populären Fahrzeug-LCA-Aufbereitungen, die ich begutachtet
habe: Jeder Parameter trägt Quelle, Spanne und Konfidenzstufe, das Punktmodell ist in Python
und JS identisch implementiert und testvektor-verifiziert, die Korrelationsstruktur der
Monte-Carlo-Simulation ist inhaltlich begründet statt bequem unabhängig, und die Trennung
von Fahrer-Streuung und Flottenmittel in der Hochrechnung ist methodisch richtig erkannt —
das machen viele publizierte Studien schlechter. Die zentrale qualitative Botschaft
(BEV liegt in allen realen Netz-Regionen vorn; die Differenz −41 % vs. −73 % ist eine
Annahmen-, keine Wahrheitsfrage) ist von Modell und Datenbasis gedeckt.

Dennoch: **In der vorliegenden Fassung nicht publikationsreif (major revision).** Erstens
ist die ausgelieferte Monte-Carlo-Referenz nicht mehr konsistent mit den Parametern —
`n_draws` wurde auf 10.000 erhöht, die Referenz stammt aus einem 1.000er-Lauf; 14 von 21
Paritäts-Kennzahlen reißen die eigene Toleranz, die Seite zeigt also beim Laden ihr eigenes
rotes Fehler-Badge, und drei Beschriftungen behaupten weiterhin „1.000 Ziehungen". Zweitens
rechnet das Modell auf der BEV-Seite mit UBA-Verbrauchsmix-Werten (CO₂, ohne
LCA-Vorkette), etikettiert sie aber als „g CO₂e/kWh" und stellt sie derselben Achse
gegenüber wie echte LCA-Werte (Kohle 830, Wind/PV 25) — während die Verbrenner-Seite
Well-to-Wheel in CO₂e trägt. Diese Inventargrenzen-Asymmetrie (~+10–15 % auf den
Stromfaktor, im eigenen Dossier als Lücke benannt) begünstigt systematisch das BEV.
Drittens vermischt die Monte-Carlo-Interpretation Flotten-Variabilität mit epistemischer
Unsicherheit und übernimmt UI-Reglergrenzen als Verteilungsgrenzen. Alle drei Punkte sind
behebbar, ohne das Ergebnis qualitativ zu ändern — gerade deshalb sollten sie behoben
werden, bevor die Seite als „verifiziert" auftritt.

**Befunde: 4 KRITISCH · 8 MITTEL · 4 KLEIN**

---

## Befunde

### KRITISCH

**1. [KRITISCH] Die ausgelieferte Monte-Carlo-Referenz ist veraltet — der Selbsttest der Seite schlägt fehl, und drei Beschriftungen nennen die falsche Ziehungszahl.**
`model_params.json` setzt `mc.n_draws = 10000`; `data/monte_carlo_reference.json` wurde
aber mit `n_draws = 1000` erzeugt (`meta.n_draws: 1000`). Eigene Nachrechnung
(run_mc mit den aktuellen Parametern gegen die Paritätsliste der Referenz): **14 von 21
Kennzahlen überschreiten die Toleranz von 0,5 %**, darunter `de_mt_a_p50` (+5,4 %),
`de_pct_total_p50` (+5,9 %) und `welt_delta_p5` (+5,3 %). Die Seite rechnet live mit
10.000 Ziehungen, prüft gegen die 1.000er-Referenz und setzt folglich beim Laden das rote
Badge „MC-Kennzahlen abweichend" — der Vertrauensanker der ganzen Seite („Modell
verifiziert ✓") ist derzeit gebrochen. Zusätzlich sind „1.000 Ziehungen" an drei Stellen
hartkodiert (Caption Rucksack-Chart, Fließtext „Dieselben 1.000 Fahrzeuge", Achsenlabel
des DE-Histogramms in `chartMcHist`), während der einleitende Satz per `#mc-n` korrekt
„10.000" anzeigen würde.
*Vorschlag:* `python3 scripts/monte_carlo.py` mit den aktuellen Parametern neu laufen
lassen und die Referenz einchecken; die drei Ziehungszahl-Nennungen aus `PF.mc.n_draws`
speisen; in den Build-/Commit-Workflow einen Konsistenz-Check aufnehmen (Referenz-Meta
vs. Parameter-Datei), damit dieser Drift nicht wieder passieren kann.

**2. [KRITISCH] Inkonsistente Inventargrenzen zwischen Strom- und Kraftstoffpfad — und ein falsches Einheitenetikett auf dem wichtigsten Parameter.**
Die Verbrenner-Nutzung wird Well-to-Wheel in **CO₂e** gerechnet (fuel_wtw inkl.
Vorkette, +15–25 % auf TTW). Die BEV-Nutzung nutzt dagegen die UBA-Strommix-Werte
(363/344 g), die laut eigenem Dossier (`parameter_quellen.md` §3) **CO₂ aus der
Verbrennung im inländischen Verbrauchsmix ohne Anlagenbau-Vorketten** sind — „für
LCA-Konsistenz mit ICCT ggf. +~10–15 %", als Lücke ausgewiesen. Slider, Chips,
Sensitivitätsachse und alle Ergebnisgrößen etikettieren diese Werte trotzdem als
„g CO₂e/kWh". Verschärfend mischen die Strommix-Chips zwei Inventarwelten auf einer
Achse: DE/EU/China sind Verbrauchsmix-CO₂, „Wind/PV (LCA) 25" und „Steinkohle (LCA) 830"
sind volle Lebenszyklus-Werte — der Nutzer vergleicht Äpfel mit Birnen, ohne es zu sehen.
Netto ist das eine systematische Begünstigung des BEV um grob 1–2 Prozentpunkte
Reduktion (bei 363 g: ~+1,3–1,9 t auf die BEV-Bilanz), also klein gegen die Kernaussage,
aber genau die Art Asymmetrie, die die TUM-Debatte der Gegenseite vorwirft.
*Vorschlag:* Entweder (a) LCA-Aufschlag auf die Mix-Werte als dokumentierten Parameter
einführen (z. B. +12 % ± Spanne, Konfidenz C) oder (b) die Etiketten auf „g CO₂/kWh
(Verbrauchsmix, ohne LCA-Vorkette)" korrigieren und die Chips nach Inventartyp
kennzeichnen; in beiden Fällen die Asymmetrie in den Limitationen benennen.

**3. [KRITISCH] Kapitel 4 vermischt Flotten-Variabilität und epistemische Unsicherheit in einer Verteilung und interpretiert das Ergebnis als Unsicherheitsaussage.**
Die Je-Fahrzeug-Ziehung zieht gleichzeitig (a) echte Heterogenität der Flotte
(km/Jahr 5.000–30.000, Segment via `u_segment` von Kleinwagen bis Oberklasse,
Verbräuche bis 30 kWh/100 km) und (b) echte Parameterunsicherheit (Batteriefaktor,
Vorkette, Strompfad). Das P5–P95-Band von 15–71 t (DE) beschreibt deshalb weder „wie
unsicher wissen wir die Ersparnis eines typischen Kompaktklasse-BEV" noch „wie streut
die Ersparnis über die Flotte", sondern eine nicht interpretierbare Mischung aus beidem.
Der Befundtext liest sie trotzdem probabilistisch („der Verbrenner lag in X % der
Ziehungen vorn") und die Kapitelüberschrift verspricht „die Bandbreite ehrlich
gerechnet". Bemerkenswert: Für die Hochrechnung wurde genau dieses Problem erkannt und
sauber gelöst (eigene, enge `km_fleet`-Ziehung, im Docstring von `monte_carlo.py`
vorbildlich begründet) — die Einsicht muss nur auch auf Kapitel 4 angewendet werden.
*Vorschlag:* Zwei getrennte Läufe ausweisen: (i) „ein definiertes Referenzfahrzeug,
nur epistemische Unsicherheit" (Segment- und Fahrprofil-Parameter fixiert oder eng),
(ii) „die Flotte, Variabilität + Unsicherheit" (heutiger Lauf, umbenannt). Mindestens
aber den Text präzisieren: Das Band enthält Fahrzeuggrößen- und Fahrer-Streuung und ist
keine Konfidenzaussage über ein gegebenes Auto.

**4. [KRITISCH] Die MC-Verteilungen übernehmen UI-Reglergrenzen als Unsicherheitsgrenzen und einen bewusst konservativ gesetzten Sliderwert als Verteilungs-Modus — entgegen der eigenen Dossier-Empfehlung.**
Die Dreiecksverteilungen nutzen `min/value/max` der Slider. Die Slider-Spannen sind aber
als Explorationsräume gebaut („max 130 deckt die historische China-Spanne für
Vergleichs-Szenarien ab"; cons_bev max 30 = ADAC-Gesamtspanne inkl. Luxus-SUV), nicht
als Unsicherheitsintervalle eines 2025er-Kompaktklasse-Vergleichs. Beim wichtigsten
Produktionsparameter `batt_co2` empfiehlt das eigene Dossier (§4) mid 55 / min 30 /
max 105 und reserviert die historischen IVL-Werte ausdrücklich „nur für die ‚Warum
ältere Studien schlechter aussehen'-Story" — die MC zieht stattdessen Modus 75 mit
max 130. Das verschiebt den Batterie-Beitrag im Mittel um grob +0,9 t (Dreiecksmittel
78,3 statt 63,3 kg/kWh × 60 kWh) und damit den ausgewiesenen Rucksack-Median (~11,4 t)
sowie alle Kapitel-4/5-Kennzahlen systematisch zulasten des BEV — die konservative
Setzung ist im JSON zwar für den *Slider-Default* begründet, als *Modus einer
Unsicherheitsverteilung* ist sie eine unbegründete Verzerrung (ein Modus soll der
wahrscheinlichste Wert sein, nicht ein vorsichtiger).
*Vorschlag:* MC-Verteilungen von den UI-Spannen entkoppeln (eigener `mc.distributions`-
Block mit Best-Estimate-Modus je Parameter, für batt_co2: 30/55/105 gemäß Dossier);
alternativ die Abweichung quantifiziert als Sensitivität ausweisen. Die konservative
Slider-Vorbelegung kann davon unberührt bleiben.

### MITTEL

**5. [MITTEL] Systemgrenze: Wartung, Ersatzteile (inkl. Reifen) und Ladeinfrastruktur fehlen — und damit ist der Direktvergleich mit den ICCT-Endzahlen nicht grenzkongruent.**
Das Modell umfasst Produktion, Nutzung (Energie) und EoL. Wartung/Ersatzteile über
15–20 Jahre (Reifen, Betriebsstoffe, Verschleißteile — beim Verbrenner mehr) und die
anteilige Ladeinfrastruktur (beim BEV) fehlen beidseitig; die Auslassung ist per Saldo
eher pro-Verbrenner, aber unquantifiziert. Entscheidend: Die ICCT-Studie, deren −73 %
die Seite als Referenzpunkt nutzt und per Preset „nachstellt", **enthält Wartung in der
Systemgrenze** (Dossier §2). Das Preset reproduziert also die ICCT-Endzahl mit einer
anderen Systemgrenze — das funktioniert nur, weil andere Parameter die Differenz
auffangen, und genau das sollte eine methodisch strenge Seite ausweisen. Straßenbau/
-erhalt ist in vergleichenden Fahrzeug-LCAs zulässig ausgeklammert (nahezu identisch
für beide Antriebe), sollte aber als bewusste Abschneidung genannt werden.
*Vorschlag:* Wartung + Ladeinfrastruktur als Limitation Nr. 1 ergänzen (mit
Größenordnung aus der Literatur, je ~1–3 g CO₂e/km), und beim ICCT-Preset vermerken,
dass die nachgestellte Rechnung eine engere Systemgrenze hat als das Original.

**6. [MITTEL] End-of-Life: Allokationsansatz nicht deklariert, Doppelzählungsrisiko der Recycling-Gutschrift unerwähnt, Second Life nicht abgebildet.**
Der EoL-Term ist eine Gutschrift im Sinne des Avoided-Burden-Ansatzes (Substitution von
Primärmaterial), ohne dass der Ansatz benannt wird — Cut-off vs. Avoided Burden ändert
das Vorzeichen der Batterie-EoL-Bilanz und ist in der Fahrzeug-LCA-Literatur die
wichtigste Allokationsentscheidung. Das eigene Dossier (§9) warnt explizit vor
Doppelzählung („überschneidet sich definitorisch mit künftig sinkenden
Produktionsfaktoren — Doppelzählungsgefahr!") und davor, dass ICCT/VDI Recycling bereits
in ihren Systemgrenzen führen; auf der Seite kommt beides nicht an. Zudem kann die
Slider-Spanne (−1,5…+0,5 t) die im Dossier abgeleitete Gutschrift-Größenordnung
(−2 bis −4 t pro Pack) gar nicht darstellen, und Second Life (laut Dossier langfristig
THG-günstiger als sofortiges Recycling) fehlt vollständig — auch als Erwähnung.
*Vorschlag:* Allokationsansatz im Modell-Kommentar und auf der Seite deklarieren
(Empfehlung: Cut-off als Basis, Avoided Burden als Sensitivität); Limitation um
Doppelzählungsrisiko und Second Life ergänzen; EoL-Spanne gegen die eigene
Dossier-Ableitung konsistent machen oder die Diskrepanz begründen.

**7. [MITTEL] Hochrechnung: CO₂e-Zähler auf CO₂-Nenner in der Spalte „% des Pkw-Inventars", Welt-Nenner enthält Vans bei Pkw-only-Bestand.**
`pct_pkw` teilt die simulierte Ersparnis (Well-to-Wheel + Produktion, faktisch CO₂e)
durch `pkw_mt`, das laut Quellenlage **CO₂-only** ist (DE ~87–100 Mt CO₂, EU 457 Mt CO₂,
Welt 3,8 Gt CO₂ **inkl. Vans** bei einem Bestands-Zähler aus reinen Pkw). Das eigene
Hochrechnungs-Dossier stellt die Regel auf: „Die beiden dürfen im Modell nicht gemischt
werden — Zähler und Nenner in derselben Metrik." Die Seite erklärt die >100 %-Werte
(DE-Median 104 %, EU 123 %) korrekt über die Inventargrenzen-Lücke, verschweigt aber die
zusätzliche CO₂/CO₂e- und Pkw/Vans-Inkongruenz, die dieselben Prozentwerte weiter nach
oben treibt. Die `scaleup.note` im JSON benennt es — die Seite nicht.
*Vorschlag:* Den Hinweis aus der JSON-Note in die Fußnote unter der Tabelle übernehmen
(„Pkw-Nenner teils CO₂-only bzw. inkl. Vans → Spalte überzeichnet") oder die Spalte in
„% des Pkw-CO₂-Inventars (Auspuff)" umbenennen und die Vans-Abgrenzung für Welt
kennzeichnen.

**8. [MITTEL] Attributional vs. consequential: Die Flotten-Hochrechnung ist eine konsequenzielle Frage, wird aber vollständig mit attributionalen Durchschnittsfaktoren beantwortet.**
„Was würde es einsparen, wenn die gesamte Flotte elektrisch führe?" ist eine
Was-wäre-wenn-Frage; methodisch sauber bräuchte sie Marginal- bzw. Systemantwort-Strom
(der Mehrbedarf von grob 100+ TWh/a allein für DE verändert den Mix, den er selbst
lädt). Die Seite legt die fehlende Rückkopplung offen (gut), hakt die Marginal- vs.
Durchschnittsstrom-Debatte aber in einer Zeile als „nicht modelliert (wir rechnen mit
Durchschnittswerten, wie UBA und ICCT)" ab — der ICCT-Verweis trägt hier nicht, denn
die ICCT beantwortet die attributionale Einzelfahrzeug-Frage, nicht die
Flotten-Skalierung. Für die Einzelfahrzeug-Kapitel (1–4) ist Durchschnittsstrom die
richtige, konventionskonforme Wahl; für Kapitel 5 ist er eine Näherung mit
Richtungsunsicherheit, die benannt werden sollte.
*Vorschlag:* In der Kapitel-5-Warnbox einen Satz ergänzen, dass eine konsequenzielle
Betrachtung (Marginalstrom, Netzausbau-Rückkopplung) das Ergebnis in beide Richtungen
verschieben kann, mit Verweis auf die Literatur-Debatte; optional eine
Marginalstrom-Sensitivität (z. B. Gas-Grenzkraftwerk 400–490 g/kWh) als Stress-Ziehung.

**9. [MITTEL] Korrelationsimplementierung: Das Uniform-Blending verzerrt die Randverteilungen und die Gewichte w sind keine Korrelationskoeffizienten ρ.**
`u = clamp01(w·u_shared + (1−w)·u_own)` erzeugt (a) nicht-uniforme Misch-u (Summe
skalierter Uniformer → trapezförmig, plus Clipping-Masse an 0/1), also verzerrte
Marginale — offengelegt als „leicht mittenlastiger", aber nicht quantifiziert; und
(b) eine induzierte Rangkorrelation, die nicht dem Gewicht entspricht (w = 0,65 liefert
nicht ρ = 0,65). Das Dossier empfiehlt ρ ≈ 0,5–0,8 für Strommix↔Batterie; ob die
Implementierung das trifft, ist ungeprüft. Für die zentrale Aussage (Vorzeichen,
Größenordnung) ist das unkritisch, für die ausgewiesenen P5/P95-Bänder nicht.
*Vorschlag:* Entweder die tatsächlich induzierten Spearman-ρ und die
Marginal-Abweichung einmal messen und in `weights_note` dokumentieren (geringster
Aufwand), oder auf ein marginalerhaltendes Verfahren wechseln (Iman–Conover /
Gauß-Copula auf den Rängen) — beides ist mit dem deterministischen PRNG vereinbar.

**10. [MITTEL] `strom_ende = min(strom_ende, strom_start)`: Die erzwungene Monotonie beschneidet die Ende-Verteilung asymmetrisch nach unten — eine stille Pro-BEV-Annahme, für die Welt-Region unbelegt.**
In Ziehungen mit ende > start wird das Pfadende auf den Startwert gedrückt; der
Erwartungswert des Pfads sinkt dadurch unter das, was die dokumentierte
Dreiecksverteilung (Welt: 180/320/500 bei Start 420/480/560) hergibt. Dass der Strommix
über 15–20 Jahre nirgends steigt, ist für DE/EU plausibel, für „Welt" eine Setzung —
historisch gab es steigende Phasen (DE 2021–2022). Die Klammerung ist im Code
kommentiert („Pfad faellt, steigt nie"), erscheint aber weder in der JSON-Note noch auf
der Seite.
*Vorschlag:* Entweder die Truncation als Annahme in mc.note und Limitationen ausweisen
(inkl. Effektrichtung), oder das Pfadende als `strom_start × Reduktionsfaktor ∈ [x, 1]`
parametrisieren — das erhält die dokumentierte Verteilungsform und die Monotonie
zugleich.

**11. [MITTEL] Batterie-Degradation und Lebensdauer-Gleichheit: Die pauschale Entwarnung deckt den eigenen Parameterraum nicht.**
Die Limitation „Batterietausch … bei heutigen Zyklenfestigkeiten für die betrachteten
Fahrleistungen meist nicht nötig" ist für den Median (187.500 km) haltbar, aber der
MC-/Regler-Raum reicht bis 30.000 km/a × 22 a = **660.000 km** — dort ist ein Tausch
(oder mindestens deutliche Degradation mit Mehrverbrauch und Reichweiten-bedingtem
früherem Lebensende) nicht mehr „meist nicht nötig". Zudem unterstellt das Modell
stillschweigend identische Lebensdauer/Restwertlogik für BEV und ICE (gleiches
`years`/`km` für beide) und konstanten BEV-Verbrauch über das Fahrzeugalter. Als
Vereinfachung vertretbar — aber es ist eine strukturelle, nicht neutrale Annahme: In den
Extrem-Ziehungen, die die P95-Ersparnis treiben, fehlt der Gegeneffekt.
*Vorschlag:* Limitation präzisieren („für Fahrleistungen > ~400.000 km unterschätzt das
Modell die BEV-Emissionen") oder im MC einen einfachen Tausch-Trigger (z. B. zweite
Batterie ab X km mit dann aktuellem batt_co2) als Sensitivität rechnen.

**12. [MITTEL] Funktionale Einheit nicht formal deklariert; Reduktions- und Break-even-Kennzahl nutzen unterschiedliche Systemumfänge.**
Die Seite wechselt zwischen g CO₂e/km und t CO₂e/Fahrzeugleben, ohne die funktionale
Einheit (z. B. „1 km Fahrleistung eines Kompaktklasse-Pkw, Erstzulassung 2025, über
N km Gesamtlebensdauer, DE") einmal explizit zu machen — bei identischem km/years für
beide Antriebe sind die Sichten zwar konsistent, aber genau diese Gleichheitsannahme
gehört zur FU-Deklaration. Zudem enthält `reduction_pct` die EoL-Terme, `break_even_km`
nicht; das ist an zwei Stellen offengelegt (gut), aber die beiden Kennzahlen stehen in
derselben Kachelreihe, ohne dass der Systemumfang-Unterschied dort erkennbar wäre —
bei stark negativem `eol_bev_t` können Break-even und Gesamtbilanz scheinbar
widersprüchliche Signale geben.
*Vorschlag:* Einen FU-Satz in Kapitel 2 aufnehmen (inkl. „gleiche Lebensdauer und
Fahrleistung für beide Antriebe — Annahme"); in der Break-even-Kachel steht der
EoL-Ausschluss bereits, ergänzend im Chart-Titel statt nur in der Caption.

### KLEIN

**13. [KLEIN] Terminologie „Modus = Mittelwert".**
Kapitel 4 beschreibt die Dreiecksverteilungen als „Modus = Mittelwert, Grenzen =
min/max der Regler". Der Sliderwert ist der Modus, nicht der Mittelwert; bei den
asymmetrischen Spannen (z. B. cons_bev 15,5/18,5/30) liegt der Verteilungs-Mittelwert
deutlich daneben (21,3). Formulierung korrigieren („Modus = Voreinstellungswert").

**14. [KLEIN] Break-even-Median ist konditional auf Existenz eines Break-evens.**
`breakeven_km` wird nur über Ziehungen mit Break-even summarisiert; `no_breakeven_pct`
wird berechnet, im Befundtext („Der Break-even liegt im Median bei X Tsd. km") aber
nicht mitgenannt. Bei den aktuellen Parametern ist der Anteil 0 % — sobald jemand die
Spannen ändert, wird die Kennzahl still selektiv. Den Anteil ohne Break-even im
Befundtext ausweisen, sobald er > 0 ist.

**15. [KLEIN] Fan-Chart klemmt negative Ersparnisse auf 0.**
`chartMcFan` mappt `x(v)` mit `Math.max(v, 0)` — ein negatives P5 (Verbrenner vorn)
würde optisch auf der Nulllinie kleben statt links davon zu erscheinen. Bei den
aktuellen Verteilungen tritt das nicht auf, aber die Darstellung soll auch unter
geänderten Parametern nicht systematisch beschönigen. Achse in den negativen Bereich
erweitern, wie im DE-Histogramm bereits korrekt gelöst.

**16. [KLEIN] Kachel-Beschriftung „Verbrenner gesamt (Well-to-Wheel + Produktion)".**
Der angezeigte Wert enthält auch den EoL-Term (`ice_total` inkl. `eol_ice_t`); beim
Default 0,0 t unsichtbar, bei verstelltem Regler stimmt das Etikett nicht mehr. Analog
zur BEV-Kachel („inkl. End-of-Life") beschriften.

---

## Was gut ist

- **Reproduzierbarkeit als Designprinzip:** Python-Referenzmodell, 1:1-JS-Port,
  Testvektoren, deterministischer PRNG (mulberry32, bitidentisch), normative
  Ziehungsreihenfolge im Docstring — dieses Niveau an Nachrechenbarkeit erreichen die
  wenigsten publizierten Fahrzeug-LCAs. (Dass genau dieser Mechanismus den Referenz-Drift
  aus Befund 1 sofort sichtbar macht, spricht *für* die Architektur.)
- **Konfidenz-Kennzeichnung bis in die UI:** Jeder Slider trägt Quelle und A/B/C-Stufe;
  die Dossiers führen explizite `gaps`-Listen und weisen eigene Ableitungen als solche
  aus — inklusive der ehrlichen Offenlegung, dass Volltexte wegen Egress-Sperre nicht
  geprüft werden konnten.
- **Die Korrelationsstruktur ist inhaltlich begründet statt bequem:** u_segment /
  u_energy / u_usage sind genau die drei Faktoren, die man in einer Fahrzeug-LCA-MC
  koppeln muss; besonders die recherchierte Differenzierung „Batteriefertigung hängt
  stark am Strom (ρ hoch), Raffinerie-Vorkette kaum (ρ 0–0,2, 1,5-kWh-Mythos verworfen)"
  ist besser belegt als in mancher Fachpublikation.
- **Die Flottenmittel-Korrektur in der Hochrechnung** (enge Ziehung um das KBA-Mittel
  statt Fahrer-Streuung, mit sauberer Begründung im Docstring) ist methodisch genau
  richtig — sie muss nur, siehe Befund 3, konsequent auch auf die
  Einzelfahrzeug-Interpretation angewendet werden.
- **Der dynamische Strompfad ist analytisch korrekt integriert** (geschlossenes Integral
  statt Jahres-Stückelung), und der statisch/dynamisch-Schalter macht den wichtigsten
  Streitpunkt der TUM/ICCT-Kontroverse direkt erfahrbar.
- **Redliche Rahmung des Anlasses:** Die Presets „≈ TUM" / „≈ ICCT" sind explizit als
  nachgestellte Annahmen-Sets deklariert, die TUM-Zahlen als Medienberichte (B)
  gekennzeichnet, und die Seite kündigt an, das Preset nach Veröffentlichung des
  Volltexts zu ersetzen — vorbildlicher Umgang mit einer noch unveröffentlichten Studie.
- **Die Kernaussagen sind konservativ formuliert und halten Gegenrechnung stand:** Die
  „±10 Prozentpunkte durch den Strompfad-Schalter" und die Kohlestrom-Robustheit bei
  aktuellen Batteriefaktoren habe ich am Punktmodell nachgerechnet — beides trifft zu;
  die Einordnung „relevanter, aber kein hinreichender Hebel" in Kapitel 5 ist genau die
  Schlussfolgerung, die die Zahlen tragen.
