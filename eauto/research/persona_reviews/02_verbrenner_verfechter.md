# Persona-Review 02 · Verbrenner-/Technologieoffenheits-Verfechter

| | |
|---|---|
| **Persona** | Maschinenbau-Hintergrund, langjährig Antriebsentwicklung. E-Fuel-affin, hält die EU-Flottenregulierung (Tailpipe-only, 0-Gramm-Anrechnung) für Fehlsteuerung, liest die TUM-Studie („Defossilisierung statt Dekarbonisierung") wohlwollend. Sucht gezielt nach pro-E-Auto-Verzerrungen. |
| **Datum** | 2026-08-30 |
| **Auftrag** | „Wo würde ich diese Seite öffentlich angreifen — und was müsste sie ändern, damit ich es nicht kann?" |
| **Prüfobjekt (Haupt)** | `eauto-klimabilanz.html` (1.222 Zeilen, komplett inkl. JS-Modell, MC-Port und Charts) |
| **Faktenbasis** | `eauto/data/model_params.json`, `eauto/research/parameter_quellen.md`, `eauto/research/hochrechnung_quellen.md`; Nachrechnungen mit dem 1:1-Modell (Python) |
| **Umfang** | 13 Befunde: 4 kritisch, 5 mittel, 4 klein |

---

## Kurzfazit

Die Seite ist handwerklich besser als das meiste, was in dieser Debatte kursiert — konservativer
Batterie-Default (75 statt 55 kg CO₂e/kWh), statischer DE-Mix als Start-Preset, Raffineriestrom-Mythos
korrekt verworfen, TUM-Transparenzbox, ehrliche Limitationen. **Aber:** Der Vergleichs-Verbrenner ist
an drei Stellen systematisch zu schlecht gestellt. Erstens fährt er mit **7,9 l/100 km Flottenmittel
aller Benziner** (inkl. Altbestand und SUV) gegen ein **neues** Kompakt-BEV mit aktueller Batterie —
das eigene Dossier nennt für die deklarierte Kompaktklasse 5,5–7,5 l. Zweitens bekommt nur der
Ladestrom einen Defossilisierungs-Pfad; der Kraftstoff bleibt über 15–20 Jahre zu 100 % fossil
eingefroren — im Monte Carlo ist der sinkende Strompfad sogar **erzwungen** (`stromEnde ≤ stromStart`
geklemmt), womit „der Verbrenner lag in 0 % der Ziehungen vorn" zu einem erheblichen Teil ein
**Artefakt der Verteilungswahl** ist, kein Ergebnis. Drittens ist der Diesel — 27 % des Bestands, der
relevante Vielfahrer-Antrieb — faktisch falsch abgebildet: Der Diesel-Chip tauscht nur die
Emissionsfaktoren, nicht den Verbrauch, und macht den Diesel dadurch **schlechter** als den Benziner
(nachgerechnet: Reduktion springt von 53,3 % auf 57,6 %), während er real bei 6,3 l/100 km besser
abschneidet (48,4 %). Die Kohlestrom-Robustheitsaussage und der „Erst ab ~1.100 g/kWh"-Befund hängen
komplett am 7,9-l-Vergleich: Gegen einen modernen Kompakt-Benziner (6,5–6,8 l) schrumpft der
Kohlestrom-Vorsprung des BEV von 20,6 % auf 3–10 % — mit heutiger China-LFP-Batterie (Nature 2024:
90–127 kg/kWh) auf eine Punktlandung innerhalb jeder Modellunsicherheit. Die Kernaussage der Seite
(E-Auto in realen europäischen Mixen klar vorn) überlebt meine Prüfung; die Robustheits-Superlative
(„0 % der Ziehungen", „selbst mit Kohlestrom", „bis 1.100 g/kWh nie schlechter") überleben sie in
dieser Form nicht.

---

## Befunde

### KRITISCH

---

#### K1 · Der Referenz-Verbrenner ist ein Strohmann: Flottenmittel 7,9 l gegen ein Neu-BEV der Kompaktklasse

**Fundstelle:** `model_params.json` → `defaults.cons_ice` (value 7,9; Quelle „Spritmonitor: Benziner
real ~7,9"), Seite Kap. 2 („Verglichen wird ein batterieelektrisches Auto (BEV) mit einem **Benziner
derselben Klasse**"); dagegen eigenes Dossier `hochrechnung_quellen.md` §6: Kompaktklasse real
**5,5–7,5 l/100 km**, Segmentspanne bis Kleinwagen 4,5 l.

**Befund:** Die Seite deklariert einen Kompaktklassen-Vergleich („derselben Klasse",
`parameter_quellen.md`: „Kompaktklasse als Referenzsegment"), setzt aber den Verbrauchs-Default auf
das **Spritmonitor-Flottenmittel aller Benziner** — das enthält 15 Jahre alten Bestand, Mittelklasse
und SUV. 7,9 l liegt **oberhalb** der im eigenen Dossier dokumentierten Kompaktklassen-Spanne. Das
BEV dagegen bekommt 18,5 kWh — die Mitte der ADAC-Kompaktspanne (16–20), also ein *aktuelles*
Fahrzeug. Neu gegen Bestand, Segment gegen Flotte: Das ist genau die Asymmetrie, die man der
Gegenseite („Norwegen-Wasserkraft-Batterie gegen alten Diesel") zu Recht vorwirft, nur mit
umgekehrtem Vorzeichen. Verschärfend: Die Punktrechnung paart 7,9 l mit 12.500 km/Jahr —
KBA-Benziner fahren real **9.580 km/Jahr** (steht im eigenen Dossier, §6/§8); mehr Kilometer
verdünnen den BEV-Rucksack. Eine Kaufentscheidung 2026 lautet „neues BEV oder neuer Benziner" —
dafür wären ~6,5–7,0 l der ehrliche Default.

**Vorschlag:** Entweder (a) Default auf ~6,8 l (moderner Kompakt-Benziner, real inkl.
OBFCM-Aufschlag) senken und einen Chip „Flottenmittel 7,9 l" anbieten, oder (b) das Label ehrlich
in „Benziner-Flottenmittel (Bestand)" umbenennen und den Kompaktklassen-Anspruch aus Kap. 2
streichen. Zusätzlich Fußnote: Benziner-Jahresfahrleistung real 9.580 km (KBA) — der 12.500-km-Default
ist eine Setzung zugunsten des BEV.

---

#### K2 · Asymmetrische Dynamik: Der Strom wird defossilisiert, der Kraftstoff bleibt 20 Jahre fossil eingefroren — im MC ist der sinkende Pfad sogar erzwungen

**Fundstelle:** `eauto-klimabilanz.html` Z. 892–893 (`stromEnde = Math.min(stromEnde, stromStart)` —
der Pfad kann strukturell nie steigen), MC-Region DE `strom_ende` max 280 („bis Politikversagen") —
**selbst das „Politikversagen"-Szenario liegt unter dem heutigen Mix (363)**; dagegen: `fuel_ttw` im
MC fix auf 2,37 (Z. 866), `fuel_chain` 0,43–1,03 statisch über die gesamte Nutzungsdauer, keinerlei
Bio-/E-Fuel-Beimischungspfad.

**Befund:** Das ist der Kern meines öffentlichen Angriffs. Die Seite begründet den Strompfad damit,
dass man das BEV nicht mit einem Stromsystem belasten dürfe, „das es so voraussichtlich nur noch
wenige Jahre gibt" — dieselbe Höflichkeit bekommt der Kraftstoff nicht: RED III,
THG-Quote und E-Fuel-Hochlauf existieren im Modell nicht einmal als Sensitivität, obwohl sie
regulatorisch genauso beschlossen sind wie der EE-Ausbau. Ein Energieträger bekommt seine
Zukunft eingerechnet, der andere seine Vergangenheit festgeschrieben. Im Monte Carlo kommt hinzu:
`strom_dynamic` ist **immer** true (obwohl das Default-Preset der Seite selbst statisch rechnet!),
die Klemmung verbietet steigende Pfade, und die DE-Obergrenze 280 unterstellt selbst bei
„Politikversagen" eine Verbesserung um 23 %. In diesem Parameterraum *kann* der Verbrenner
praktisch nicht gewinnen — „0,0 % der Ziehungen" ist dann keine Erkenntnis, sondern die Konstruktion.
Der Befundtext adelt das auch noch: „das Vorzeichen der Ersparnis ist davon unberührt."

**Vorschlag:** (1) Im MC einen Anteil Ziehungen mit statischem Mix zulassen oder `strom_ende` max
auf Startniveau (Stagnation) anheben; (2) eine `fuel_chain`-/`fuel_ttw`-Absenkung als korrelierten
Zusatzfaktor (E-Fuel-/Bio-Quote, meinetwegen bescheiden: 0–15 % über die Nutzungsdauer) ziehen;
(3) den „0 %"-Satz qualifizieren: „unter der Annahme durchgängig sinkender Strompfade und
unverändert fossilen Kraftstoffs". Sonst schreibe ich das als Erstes in den Kommentarspalten.

---

#### K3 · Die Diesel-Abbildung ist objektiv falsch: Der Chip macht den Diesel schlechter statt besser

**Fundstelle:** `eauto-klimabilanz.html` Z. 585–592 (`fuel-chips`: setzt nur `fuel_ttw`/`fuel_wtw`),
`model_params.json` → `fuel_presets` (Diesel 2,65/3,24 — ohne Verbrauchswert); Diesel-Realverbrauch
6,3 l steht nur im Dossier (`parameter_quellen.md` §6), nirgends im Modell.

**Befund:** Klickt ein Nutzer „Diesel", bleiben 7,9 l/100 km stehen und werden mit 3,24 kg/l
multipliziert: 25,6 kg/100 km — die ausgewiesene BEV-Reduktion **steigt** von 53,3 % auf 57,6 %.
Real (6,3 l × 3,24 = 20,4 kg/100 km) ist der Diesel der **bessere** Verbrenner: Reduktion 48,4 %.
Die Seite stellt den effizientesten Verbrennungsantrieb also um ~9 Prozentpunkte schlechter dar,
als er ist — per UI-Konstruktion, nicht per Annahme. Dazu kommt: Im Monte Carlo existiert Diesel
gar nicht (`fuelTtw` fix Benzin), obwohl er 27 % des DE-Bestands stellt und laut KBA mit
17.187 km/Jahr genau das Vielfahrerprofil hat, bei dem der Antriebsvergleich interessant ist.
Auch die Flotten-Hochrechnung ersetzt eine reale Bestandsflotte (59 % Benzin, 27 % Diesel, 9 %
Hybrid) durch 100 % Flottenmittel-Benziner — das überzeichnet die Ersparnis-Baseline.

**Vorschlag:** Fuel-Presets um `cons_ice` erweitern (Benzin 7,9 bzw. 6,8; Diesel 6,3) und beim
Chip-Klick mitsetzen. Hochrechnung: ICE-Baseline als gewichteten Bestands-Mix rechnen oder die
Benziner-only-Annahme als explizite, die Ersparnis erhöhende Vereinfachung ausweisen. Hybride
(ICCT: −20 %, PHEV −30 % — steht im eigenen Dossier §2) mindestens im Einordnungs-Kapitel beziffern.

---

#### K4 · Die Kohlestrom-Robustheitsaussage hält nur gegen den 7,9-l-Strohmann — und die Strommix-Skala mischt LCA- mit Nicht-LCA-Werten zugunsten des BEV

**Fundstelle:** Seite Kap. 6, Note „Was im Modell robust ist": „bleibt das E-Auto selbst mit reinem
Steinkohlestrom vorn"; Kap.-3-Befund „Erst ab ~[1.100+] g/kWh…"; `strommix_presets` (Kohle 830 =
**LCA**-Wert, DE 363/344 = **UBA-Verbrauchsmix ohne Anlagen-Vorketten**); Dossier
`parameter_quellen.md` §3: „Für LCA-Konsistenz mit ICCT ggf. +~10–15 % ansetzen" → als `gap` markiert.

**Befund:** Nachgerechnet mit dem Seitenmodell: Kohle-Preset gegen 7,9-l-Benziner → BEV −20,6 %
(39,3 vs. 49,5 t). Gegen einen modernen Kompakt-Benziner 6,8 l → **−9,6 %**; 6,5 l und WTW 2,8 →
**−3,3 %** (39,3 vs. 40,6 t — eine Tonne, weit innerhalb der C-Konfidenz von Produktions- und
EoL-Termen). Mit einer heute realen China-LFP-Batterie (Nature Comm. 2024: 90–127 kg/kWh; im Modell
95) und 6,8 l: −6,9 %; kombiniert mit 6,5 l: Gleichstand. Die apodiktische Formulierung „bleibt …
selbst mit reinem Steinkohlestrom vorn" ist also eine Aussage über den Flottenmittel-Vergleich, nicht
über das Fahrzeug — die Konditionierung im Text („≲ 80 kg, durchschnittliche Fahrleistung") reicht
nicht, weil der dritte Treiber (7,9 l) unerwähnt bleibt. Dazu die Skalen-Asymmetrie: Der
Kohle-Marker ist ein Lebenszyklus-Wert, die UBA-Mixe sind es nicht — der Ladestrom im
Deutschland-Fall ist damit um die fehlenden ~10–15 % Vorkette zu günstig bilanziert, während der
Kraftstoff seine volle Vorkette (+22 %) trägt. Das eigene Dossier benennt die Lücke; die Seite
verschweigt sie.

**Vorschlag:** (1) Kohlestrom-Satz konditionieren („gegen das Benziner-Flottenmittel; gegen einen
sparsamen modernen Benziner schrumpft der Vorsprung auf wenige Prozent") oder die Rechnung mit
6,8 l als zweite Zahl danebenstellen. (2) LCA-Aufschlag auf UBA-Mixe als Schalter oder wenigstens
als Fußnote an den Strommix-Chips („UBA-Werte ohne Anlagen-Vorkette, +10–15 % für LCA-Konsistenz");
alternativ Chips konsistent auf eine Skala bringen.

---

### MITTEL

---

#### M1 · Hochrechnung: ~100 Mt/a für DE ohne Netzrückkopplung bei +113 TWh Mehrbedarf — und ohne Gegenüberstellung der Alternativen, um die es der TUM gerade geht

**Fundstelle:** Kap. 5, `scaleup` in `model_params.json`; Limitationen („Mehrbedarf … nicht auf den
Strommix zurückgekoppelt"); Marginalstrom-Debatte in einem Halbsatz der Limitationen abgetan.

**Befund:** 49,5 Mio Pkw × 12.300 km × 18,5 kWh/100 km ≈ **113 TWh/a** Zusatznachfrage — gut ein
Fünftel der heutigen DE-Erzeugung. Die Simulation lädt diese Flotte trotzdem mit einem Mix, der
gleichzeitig auf 40–280 g/kWh **fällt**. Dass der Zubau erst einmal die Zusatznachfrage decken muss,
bevor er den Mix senkt, ist keine exotische Marginalstrom-Spitzfindigkeit, sondern Energiebilanz;
„wir rechnen mit Durchschnittswerten, wie UBA und ICCT" ersetzt das Argument nicht, wenn man
zugleich eine *Vollelektrifizierung* hochrechnet. Und: Die Seite rechnet ausschließlich das
Szenario „ganze Flotte elektrisch" gegen „ganze Flotte Benzin". Die TUM-Folgerung — Defossilisierung
der **Bestandsflotte** (2030: noch ~78 % Verbrenner laut Berichterstattung, Zahl steht im Dossier,
fehlt auf der Seite) — wird in Kap. 6 zwar genannt, aber nie beziffert. Ein Leser kann nicht
vergleichen: Was brächten X % E-Fuel/HVO im Bestand pro Jahr, was bringt Effizienz, was bringt der
15-Jahre-Flottenumschlag an Verzögerung der 97 Mt? Einordnung ohne Vergleichsgröße ist keine.

**Vorschlag:** Tabellenzeile „Zusätzlicher Strombedarf [TWh/a]" ergänzen (ist eine Multiplikation,
die Daten sind da); im Text die Deckungsfrage einen ehrlichen Absatz wert sein lassen. Optional eine
Vergleichszeile „Bestandsflotte −20 % Kraftstoff-CO₂ (Defossilisierung)" — auch wenn das Ergebnis
das E-Auto stützt, gehört die Alternative quantifiziert, nicht nur erwähnt.

---

#### M2 · TUM-Wiedergabe: transparent, aber tendenziös gerahmt

**Fundstelle:** Transparenz-Note nach dem Anlass-Kasten; Preset `tum_mittel` („statischer,
CO₂-intensiverer Mix …, Batterie 95, ~150.000 km"); Quelle [3] (cleanthinking, „Erste kritische
Einordnungen"); Dossier §1.

**Befund:** Positiv: Die Seite sagt klar, dass der Volltext fehlt und die Presets nachgestellt sind.
Aber die Rahmung arbeitet einseitig: Das ≈-TUM-Preset besteht ausschließlich aus als veraltet
markierten Annahmen (alte Batterie, statischer 420er-Mix, kurze Laufleistung) — die implizite
Botschaft ist „−41 % kriegt man nur mit gestrigen Zahlen hin". Das ist *eine* Lesart; die
TUM-Position, dass eine Meta-Spanne über 47 publizierte Szenarien die reale Heterogenität des
Weltmarkts (Strommixe, Fertigungsstandorte, Fahrprofile) abbildet und der EU-Regulierungsfehler
davon unabhängig besteht, wird nicht gleichwertig angeboten. Als einzige Einordnungs-Quelle ist mit
[3] ausgerechnet der Anti-TUM-Verriss verlinkt („Auto-Lüge, die keine ist") — dessen Volltext laut
eigenem Dossier nie gelesen wurde (Egress-Block, Konfidenz C). Eine TUM-freundliche Sekundärquelle
fehlt im Quellenverzeichnis der Seite komplett. Immerhin: Ein Strohmann ist die Darstellung nicht —
Defossilisierung und Bestandsflotte werden in Kap. 6 korrekt referiert.

**Vorschlag:** Preset-Beschreibung neutralisieren („typische Annahmen der in Meta-Analysen
gemittelten Studien"), die 78-%-Bestandsflotten-Zahl 2030 als TUM-Kernargument in Kap. 6 aufnehmen,
und neben [3] eine zweite Einordnung verlinken (die Agenturmeldung [2] trägt diese Last nicht).
Nach Veröffentlichung des Volltexts: Preset ersetzen, wie in den Limitationen zugesagt — das
Versprechen rechne ich der Seite hoch an, es muss aber eingelöst werden.

---

#### M3 · E-Fuels sind strukturell unmodellierbar — das Modell kann die Politikoption, über die im November abgestimmt wird, nicht rechnen

**Fundstelle:** `defaults.fuel_wtw` min 2,8 (Slider kann nicht unter +18 % Vorkette), `fuel_ttw`
min 2,33; Limitationen („E-Fuels sind nicht abgebildet").

**Befund:** Die Seite tritt an, die Kontroverse um das EU-Automobil-Paket zu erhellen, deren
strittigster Punkt die Anrechnung CO₂-neutraler Kraftstoffe ist — und der Kraftstoff-Slider endet
bei fossilem Minimum. Ein E-Fuel- oder HVO-Szenario (WTW netto deutlich unter TTW, weil der
Kohlenstoff zuvor gebunden wurde) ist nicht einmal als Extremstellung erreichbar. Das BEV darf mit
dem 25-g-Ökostrom-Chip in seine beste Welt, der Verbrenner nicht in seine. Dass ein E-Fuel-Pfad an
Wirkungsgrad und Verfügbarkeit krankt, weiß ich selbst — aber das wäre ja gerade das Ergebnis einer
ehrlichen Modellierung (Strombedarf ×~5), statt sie zu verweigern.

**Vorschlag:** Entweder `fuel_wtw` bis ~0,5 öffnen mit Warnhinweis („E-Fuel: setzt ~5-fachen
Strombedarf je km voraus, hier nicht bilanziert") — oder in Kap. 6 einen eigenen Absatz, der die
E-Fuel-Option quantitativ einordnet statt sie in die Limitationen zu verschieben. Die
Wirkungsgrad-Zahl würde der Seite sogar argumentativ helfen; sie wegzulassen wirkt ausweichend.

---

#### M4 · MC-Verteilungswahl: Modus beim Flottenmittel-Verbrauch, Segment-Korrelation verhindert die für den Verbrenner günstigen Kombinationen

**Fundstelle:** `runMC` Z. 867–897; `mc.weights` (`segment_on_cons` 0,7); `dspec` nutzt die
Slider-Grenzen mit Modus = Default (also 7,9 l für `cons_ice`, s. K1).

**Befund:** Alle K1-Verzerrungen wandern ungefiltert ins Monte Carlo: Modus 7,9 l, nur Benzin, immer
sinkender Pfad. Zusätzlich koppelt `u_segment` (w=0,7) die Verbräuche beider Antriebe — die
Kombination „sparsamer moderner Benziner gegen durstiges BEV" wird dadurch systematisch selten
gezogen. Die Kopplung ist als „derselbe Fahrer, dasselbe Segment" methodisch begründbar (und ich
erkenne sie unten ausdrücklich an), aber zusammen mit K2 bleibt vom theoretisch ICE-freundlichen
Eck des Parameterraums fast nichts übrig, das eine Ziehung real erreichen kann. Das „0 %" gehört
deshalb nicht als Tile-Fakt präsentiert, sondern als bedingtes Ergebnis. Die Limitationen geben die
Mittenlastigkeit der Randverteilungen immerhin zu — den Schritt zum „und deshalb ist die
0-%-Aussage konditional" geht die Seite nicht.

**Vorschlag:** Sensitivitäts-Fußnote unter dem MC-Befund: Anteil ICE-vorn unter (a) statischem Mix,
(b) Kompakt-Benziner-Modus 6,8 l, (c) beidem. Wenn die Zahl dann immer noch nahe 0 liegt — gut, dann
ist die Aussage verteidigbar und stärker als heute; wenn nicht, war sie nie ehrlich.

---

#### M5 · Der Strompfad-Endwert ist Konfidenz C und trägt trotzdem Preset, MC und Schlagzeilen-Differenz

**Fundstelle:** `defaults.strom_ende` (100 g, „Setzung: Klimapfad … Zielwert, kein Messwert;
Projektion 2030 ~113 g nur Einzeltreffer", Konfidenz C); Dossier-Gap „DE-Strommix-Projektion 2035
nicht belegt"; Kap. 6 („Allein dieser Schalter verschiebt das Ergebnis um knapp 10 Prozentpunkte").

**Befund:** Der Parameter mit dem größten Hebel nach dem Strommix selbst ist der am schwächsten
belegte. Das Preset „Deutschland mit Strompfad" fährt auf 80 g herunter, das ICCT-Preset auf 55 g —
Zielwerte einer Politik, deren Zielverfehlung die Seite an anderer Stelle (MC: „bis
Politikversagen") selbst für möglich hält. Die C-Kennzeichnung am Slider ist da; im Fließtext von
Kap. 6 wird der Pfad aber als die „ehrlichere" Rechnung gehandelt, ohne die Belegqualität zu
erwähnen. UBA-Ist-Trend 2022→2025: 434→344, also ~30 g/Jahr — linear weiter wären das 2040 rund
100 g, das passt; aber der Trend der letzten zwei Jahre (380→363→344, ~18 g/Jahr) ist bereits
flacher. Wer den Pfad einpreist, wettet — das darf man, muss es aber so nennen.

**Vorschlag:** In Kap. 6 einen Halbsatz: „Der Pfad-Endwert ist eine Zielannahme (Konfidenz C) —
verfehlt der EE-Ausbau das Tempo der letzten Jahre, liegt das Ergebnis zwischen den beiden
Schalterstellungen." Kostet nichts, nimmt mir das Argument.

---

### KLEIN

---

#### T1 · End-of-Life: Gutschrift nur für das BEV als Default

`eol_bev_t` Default −0,5 t (Gutschrift), `eol_ice_t` 0,0 — beide Konfidenz C, und das eigene
Dossier (§9) warnt vor Doppelzählung mit künftig sinkenden Produktionsfaktoren. Ein C-Parameter
mit Vorzeichen zugunsten einer Seite sollte im Default neutral (0/0) stehen; die Gutschrift gehört
in ein Preset oder die Sensitivität. Kleiner Effekt (~1 Prozentpunkt), aber ein leichtes Ziel für
Kritiker: „Selbst beim Schrottplatz gewinnt das E-Auto per Setzung."

#### T2 · Hardcodierte „1.000 Ziehungen" bei n = 10.000

`mc.n_draws` = 10.000, das `mc-n`-Span wird korrekt befüllt — aber die Chart-Captions
(„Verteilung … über 1.000 Ziehungen", Achsentitel „— 1.000 Ziehungen") sind hart auf 1.000
verdrahtet (Z. 325, 1070). Faktisch falsch; für eine Seite, die mit Verifikations-Badge wirbt, ein
unnötiger Glaubwürdigkeitskratzer. Captions aus `PF.mc.n_draws` generieren.

#### T3 · Fan-Chart klemmt negative Ersparnisse auf null

`chartMcFan`: `x = v => … Math.max(v, 0)` — sollte je eine Region ein negatives P5 haben, würde es
unsichtbar an die Nulllinie gequetscht statt links von ihr zu erscheinen. Beim DE-Histogramm ist die
Null-Linie korrekt gelöst. Solange 0 % der Ziehungen negativ sind, folgenlos — aber genau falls
K2/M4 umgesetzt werden und Ziehungen links der Null auftauchen, würde das Chart sie verschlucken.
Achse symmetrisch öffnen.

#### T4 · Strommix-Chips mischen Bilanzräume

„DE 2024/2025" = UBA-Verbrauchsmix (CO₂, ohne Anlagenvorkette), „EU-27/China/Welt" =
Ember-**Erzeugungs**intensität, „Wind/PV/Kohle" = LCA-Werte — drei Definitionen auf einer Skala,
ohne Kennzeichnung am Chip (das Dossier weist es aus, die Seite nicht). Für Punktvergleiche
zweitrangig, für die China-Ladestrom-Debatte nicht. Tooltip/Fußnote je Chip ergänzen. (Überschneidet
sich mit K4, hier nur der Kennzeichnungsaspekt.)

---

## Was ich anerkennen muss

Der Fairness halber, und weil ich erwarte, dass diese Liste gegen mich zitiert wird:

1. **Der Batterie-Default 75 kg CO₂e/kWh ist bewusst konservativ** — über der P3-„aktuellen
   Fertigung" (55), mit dokumentierter Begründung in `model_params.json`. Ein Pro-EV-Aktivist hätte
   55 gesetzt. Ebenso deckt max 130 die China-Spanne ab.
2. **Das Start-Preset ist die konservative Sicht** (statischer UBA-Mix 2024), nicht der Klimapfad.
   Die Seite hätte auch mit −70 % aufmachen können; sie macht mit −53 % auf.
3. **Der Raffineriestrom-Mythos („Verbrenner fahren mit 1,5 kWh Strom pro Liter") wird aktiv
   verworfen** — inklusive niedriger MC-Korrelation (0,15) mit sauberer Dossier-Herleitung
   (BFE/sedl.at). Das ist gelebte Resistenz gegen pro-EV-Folklore und mehr, als die meisten
   EV-freundlichen Rechner leisten.
4. **Ladeverluste sind im BEV-Verbrauch enthalten** (ADAC Ecotest inkl. AC-Verluste), und beide
   Seiten werden mit Real- statt Normverbräuchen gerechnet. Der `cons_bev`-Slider geht bis 30 kWh —
   das ICE-freundliche Extrem ist erreichbar.
5. **Die TUM-Transparenzbox ist vorbildlich**: Volltext lag nicht vor, Presets sind als nachgestellt
   deklariert, das Ersetzen nach Veröffentlichung ist zugesagt. Auch die Konfidenz-Systematik
   (A/B/C an jedem Slider und jeder Quelle) und die dokumentierten Gaps in beiden Dossiers sind
   ungewöhnlich ehrlich — die meisten meiner Befunde konnte ich überhaupt nur führen, weil das
   Projekt seine eigenen Schwächen dokumentiert.
6. **Die „>100 % des Pkw-Inventars"-Erklärung ist korrekt und wichtig** (Inventar zählt nur
   inländischen Auspuff), und die Hochrechnung wird explizit als Größenordnungs-Gedankenexperiment
   deklariert, nicht als Prognose. Der Schlusssatz („relevanter, aber kein hinreichender Hebel;
   adressiert genau den Pkw-Anteil — nicht mehr und nicht weniger") ist eine Einordnung, die ich
   unterschreiben kann.
7. **Die Regulierungskritik der TUM wird sachlich richtig wiedergegeben**: Die Seite sagt selbst,
   dass die 0-Gramm-Anrechnung „tatsächlich keine Klimabilanz" ist und beide Studien darin recht
   haben. Kap. 1 erklärt fair, dass auch die Verbrenner-Seite eine Auspuff-Logik-Falle hat
   (fehlende Kraftstoff-Vorkette in der Regulierung).
8. **Das Modell ist reproduzierbar und selbstprüfend** (Testvektoren + MC-Parität gegen
   Python-Referenz, Badge im Footer). Man kann meine Nachrechnungen in fünf Minuten verifizieren —
   das unterscheidet die Seite wohltuend von dem, was sonst in dieser Debatte als „Studie"
   herumgereicht wird, auf beiden Seiten.

**Gesamtempfehlung:** K1–K4 vor jeder Bewerbung der Seite fixen — sie sind die Stellen, an denen
eine motivierte Gegenseite (ich) die Glaubwürdigkeit des gesamten, im Kern soliden Modells kippen
würde. M1–M5 mindestens als sichtbare Einschränkungen nachtragen. Die zentrale Botschaft
(BEV in realen europäischen Mixen klar vorn, Auspuff-Regulierung trotzdem keine Klimabilanz)
übersteht auch meine Korrekturen — sie würde durch sie glaubwürdiger, nicht schwächer.
