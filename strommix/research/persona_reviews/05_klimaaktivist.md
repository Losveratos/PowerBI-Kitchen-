---
review: "Persona-Review 05 · Klimaaktivist:in mit wissenschaftlichem Anspruch"
persona: "Fridays-for-Future-Umfeld, liest IPCC-Berichte im Original; prüft, ob die Klimadimension ernst genug genommen wird — bleibt intellektuell ehrlich"
datum: "2026-08-19"
prüfobjekt: "strommix-story.html (Hauptfokus, v0.1 Entwurf) · whitepaper-strommix.html + whitepaper-strommix.js (Stichproben)"
faktenbasis: "strommix/research/risiken_co2.md · strommix/research/story_claims_check.md · strommix/data/model_params.json · strommix/data/monte_carlo_reference.json · strommix/scripts/model.py"
befunde: "13 (5 schwer · 5 mittel · 3 leicht)"
---

# Persona-Review 05 · Klimaaktivist:in mit wissenschaftlichem Anspruch

## Gesamturteil

Die Story ist handwerklich das Ehrlichste, was ich seit langem zur Kernkraft-Kosten-Debatte
gelesen habe — Bandbreiten statt Punktwerte, Kostenabgrenzungen an jedem Datenpunkt,
überlappende Monte-Carlo-Bänder, und im Akt 5 steht mit dem Zeit- und Skalenargument
ausgerechnet das Argument, das ich sonst selbst vortragen muss.
Genau deshalb schmerzt der blinde Fleck: In einer Geschichte, die im Titel „klimaneutral"
trägt, kommt Klima nur ein einziges Mal vor — im Epilog, und dort in Form des Satzes, der
CO₂-Preis werde „regelmäßig überschätzt"; ich habe das mit dem projekteigenen Modell
nachgerechnet, und dieser Satz ist im eigenen Modell falsch: Ab rund **260 €/t** kippt die
Rangfolge der Szenarien, der CO₂-Preis ist damit der rangentscheidendste Hebel der ganzen
Story, stärker als die Kostenüberschreitungsfaktoren aus Akt 4 Schritt 4.
Hinzu kommt, dass die Story kein Zieljahr nennt, ihren billigsten Ankerpunkt („Ist 2025",
108 €/MWh) ohne die dahinterstehenden ~123 Mt CO₂/a zeigt und ihren Sieger-Pfad
(„80 % EE + Gas", 141 €/MWh) als klimaneutral einführt, obwohl er im eigenen Dispatch
264 TWh unabgeschiedenes Erdgas verbrennt.

**Empfehlung: Überarbeiten vor Veröffentlichung — nicht neu schreiben.**
Die Substanz trägt. Es fehlen drei Bausteine (CO₂-Preis-Sensitivität, Zieljahr +
Emissionsbilanz der gezeigten Szenarien, Klimaprämisse), die alle aus vorhandenen,
bereits geprüften Daten des Projekts gebaut werden können. Aufwand: eine Grafik, ein
Absatz, zwei Limitationen-Karten. Ohne diese drei Bausteine ist die Story ein sauber
gerechnetes Papier, das bei einem klimapolitisch unaufmerksamen Lesen die Botschaft
„Klimaschutz kostet 30 bis 150 Prozent Aufschlag" transportiert — was sie erkennbar
nicht will.

---

## Vorbemerkung zur Beweisführung

Die zentrale Nachrechnung dieses Reviews (Befund S2) wurde **mit dem Modell des Projekts
selbst** durchgeführt (`strommix/scripts/model.py`, `mix_system()`, Presets und Speicher-
konfigurationen aus `data/monte_carlo_reference.json`, Parameter aus `data/model_params.json`,
Profile über `load_profiles()`). Die Spalte 75 €/t reproduziert die publizierten
deterministischen Werte der Story auf die Nachkommastelle (107,1 · 155,8 · 140,7 · 197,2 ·
270,9 €/MWh). Der einzige veränderte Parameter ist `co2_price`. Es handelt sich also nicht
um eine Gegenrechnung mit anderen Annahmen, sondern um genau die Sensitivität, die die
Story nicht zeigt.

| Szenario | 0 €/t | **75 €/t** *(Story)* | 126 €/t | 205 €/t | **350 €/t** *(UBA MK 3.2)* | **990 €/t** *(UBA MK 4.0)* | Gas TWh/a | Mt CO₂/a |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ist 2025 (Referenz) | 89,3 | **107,1** | 119,2 | 137,9 | 172,3 | 324,2 | 306 | ~123 |
| GES · Kostenminimum (Kernkraft) | 153,6 | **155,8** | 157,3 | 159,6 | **163,8** | **182,6** | 69 | ~28 |
| GES · 80 % EE + Gas | 132,3 | **140,7** | 146,4 | 155,3 | 171,5 | 243,3 | 264 | ~107 |
| GES · 80 % EE + H₂ | 196,8 | **197,2** | 197,5 | 197,9 | 198,6 | 201,8 | 12 | ~5 |
| GES · 100 % Erneuerbare | 270,8 | **270,9** | 271,0 | 271,1 | 271,3 | 272,2 | 3 | ~1 |

*Alle Werte €/MWh Systemkosten, Szenario „mittel", identisches Modell und identische
Profile wie in der Story. Mt CO₂/a = Gas-Backup × 0,403 t/MWh (der projekteigene
Proxy-Emissionsfaktor, Konfidenz C).*

Die drei Kipppunkte aus einem 5-€-Raster über 0–400 €/t:

- **~260 €/t** — das Kernkraft-Szenario überholt „80 % EE + Gas". Damit ist die
  Kernaussage von Akt 4 Schritt 3 und des Zwischenrufs „Was von der Schlagzeile bleibt"
  an einen nicht variierten Parameter gebunden.
- **~310 €/t** — das Kernkraft-Szenario wird günstiger als das heutige fossile System.
- **~345 €/t** — das heutige System wird zum teuersten der drei.

Zum Vergleich: der stärkste in der Story erzählte Effekt, die empirischen
Kostenüberschreitungsfaktoren (Akt 4 Schritt 4), verschieben das Kernkraft-Szenario um
rund 30 €/MWh im Median. Der Sprung von 75 auf 350 €/t verschiebt das heutige System um
65 €/MWh und den Gas-Pfad um 31 €/MWh. Der CO₂-Preis ist also kein Randparameter, sondern
mindestens ebenbürtig — und er ist der einzige, den die Story ausdrücklich abwertet.

---

## Befunde nach Schwere

### SCHWER

---

#### S1 · Die Story nennt kein Zieljahr — in einer Geschichte über eine Deadline

**Fundstelle** `strommix-story.html` Z. 310–314 (Hero), Z. 336 (Prolog); Gegenprobe:
`whitepaper-strommix.html` Z. 789.

**Ist.** Der Hero spricht von „ein klimaneutrales deutsches Stromsystem", der Prolog von
„vier Wege zu einem klimaneutralen deutschen Stromsystem". Ein Jahr steht nirgends. Das
Whitepaper dagegen sagt es klar: „Sie vergleicht vier Szenarien **für 2045**
(950 TWh Jahresbedarf)". Auch Akt 5 nennt kein Zieljahr für Klimaneutralität — die
30-Jahres-Rechnung endet bei **2056**, elf Jahre nach der gesetzlichen Frist des
Klimaschutzgesetzes, und die Story kommentiert diese Differenz nicht.

**Beanstandung.** Für eine Kostengeschichte ist das Zieljahr eine Randnotiz, für eine
Klimageschichte ist es die Randbedingung, die alles andere bestimmt. Ohne Jahreszahl
liest sich „klimaneutral" wie ein Zustand, den man irgendwann erreicht — statt wie eine
Frist, die läuft. Konkret schlägt das auf Akt 5 Schritt 4 durch: Die dort erwähnte
Kernkraft-Variante geht laut Datensatz **2045 und 2052** ans Netz
(`thirty_year_plan.nuclear_variant.md.online`), der erste Block also exakt in dem Jahr,
in dem Deutschland bereits neutral sein müsste, der zweite sieben Jahre danach. Die Story
hat diese Zahlen im Datensatz und stellt die Verbindung nicht her.

**Vorschlag.** (a) Im Prolog Z. 336 ein Wort ergänzen: „vier Wege zu einem klimaneutralen
deutschen Stromsystem **im Jahr 2045**" — Beleg steht bereits im Whitepaper. (b) In Akt 5
Schritt 4 den Halbsatz ergänzen, dass die 18 bis 25 Jahre Vorlauf am gesetzlichen Zieljahr
2045 gemessen werden müssen und die beiden Blöcke 2045/2052 liefern. (c) In Akt 5 einmal
benennen, dass der 30-Jahres-Plan auf 2056 rechnet und damit nicht deckungsgleich mit der
gesetzlichen Frist ist — als Feststellung, nicht als Vorwurf.

---

#### S2 · „Der CO₂-Preis wird regelmäßig überschätzt" — im eigenen Modell widerlegt

**Fundstelle** `strommix-story.html` Z. 843–852 (Epilog, zweiter politischer Hebel);
Datenbasis: `ets_gap_gas_ccs` in `data/story_data.json`;
Gegenprobe: `research/risiken_co2.md` 2.4; eigene Nachrechnung siehe oben.

**Ist.** Der Epilog schreibt: „Der zweite politische Hebel, der CO₂-Preis, wirkt in
dieselbe Richtung, aber deutlich schwächer — und er wird in der Debatte regelmäßig
überschätzt." Belegt wird das mit **einer einzigen, sehr engen Teilrechnung**: der
fehlenden Bepreisung der Restemissionen von Gas mit CCS, systemweit 0,4–4,5 €/MWh bei
rund zehn Prozent Gasanteil. Anschließend wird die 200-€-Zahl korrekt als ETS-2-Wert
zurückgewiesen und der ETS-1-Marktpreis von 74 €/t als der relevante genannt. Damit endet
der Absatz.

**Beanstandung.** Drei Probleme, das dritte ist das schwerste.

1. **Unzulässige Verallgemeinerung.** Aus „diese eine Lücke ist klein" wird „der Hebel
   ist schwach". Die Lücke ist klein, weil sie nur die Restemissionen *einer* Technologie
   in *einem* Szenario betrifft. Der CO₂-Preis als solcher wirkt auf jede fossile
   Kilowattstunde im gesamten Vergleich.
2. **Selektive Korrekturrichtung.** Alle drei Korrekturen des Absatzes zeigen in dieselbe
   Richtung (Preis kleiner als behauptet, Wirkung kleiner als behauptet). Genau dieses
   Muster wirft die Story in Akt 2 und Akt 3 der Vorlage vor — und sie hält sich überall
   sonst mit dem „Beipackzettel"- und „Beide Richtungen zeigen"-Muster selbst daran. Hier
   nicht. Die Gegenrichtung wäre trivial verfügbar gewesen: `risiken_co2.md` 2.4 führt die
   UBA-Klimakostensätze mit **350 €/t** (MK 3.2, 1 % Diskontierung) und **990 €/t**
   (MK 4.0, Zentralwert, Modell GIVE, Februar 2026). Beides ist in
   `data/page_data.json` bereits maschinenlesbar hinterlegt und im Whitepaper als Chip
   implementiert. Der Unterschied Marktpreis / gesellschaftliche Klimakosten — der
   eigentliche Kern jeder klimaökonomischen Debatte — kommt in der Story **kein einziges
   Mal** vor.
3. **Der Satz ist im eigenen Modell falsch.** Siehe Sensitivitätstabelle oben: bei
   ~260 €/t kippt die Rangfolge, die die Story in Akt 4 Schritt 3 und im Zwischenruf „Was
   von der Schlagzeile bleibt" als ihr zentrales Ergebnis erzählt. Der niedrigere der
   beiden UBA-Werte (350 €/t) liegt bereits jenseits dieses Kipppunkts. Der CO₂-Preis ist
   damit nicht der schwächere zweite Hebel, sondern nach dem WACC der zweitstärkste — und
   die Story sagt das Gegenteil.

   Erschwerend: `shared.monte_carlo.meta.assumptions` weist ausdrücklich aus, dass der
   CO₂-Preis zu den **nicht variierten** Größen gehört. Ein Parameter, der die Rangfolge
   entscheidet, wird also in der Unsicherheitsrechnung eingefroren — und im Epilog als
   unbedeutend eingeordnet.

**Vorschlag.** (a) Den Satz „wird in der Debatte regelmäßig überschätzt" streichen oder
präzisieren zu: „Für die *hier verglichenen, jeweils klimaneutral gedachten* Szenarien
wirkt er schwach — sobald das fossile Heute mit im Bild ist, entscheidet er die
Rangfolge." (b) Die ETS-1/ETS-2-Korrektur unbedingt behalten, sie ist richtig und
verdienstvoll — aber im selben Absatz die zweite Größenordnung nennen: Marktpreis 74 €/t
vs. UBA-Klimakostensatz 350 €/t (1 % Diskontierung) bzw. 990 €/t (0 %,
intergenerationell gleichgewichtet), mit dem Hinweis aus `risiken_co2.md` 2.4, dass die
Differenz zwischen beiden **keine Rechenfrage, sondern eine ethische Setzung** ist. Das
ist exakt der Neutralitätsstandard, den die Story sonst anlegt. (c) Die
Sensitivitätstabelle oben (oder eine Kurzform mit drei Preisstufen) als sechster Akt oder
als Kasten in Akt 4 aufnehmen — sie kostet null neue Quellen, nutzt ausschließlich das
vorhandene Modell und ist die klimapolitisch aussagekräftigste Grafik, die dieses Projekt
bauen könnte. (d) Quelle `uba-methodenkonvention` in die Story-Quellenliste aufnehmen
(sie ist in `page_data.json` bereits vorhanden).

---

#### S3 · Der Anker „Ist 2025" ist die billigste Zahl im Chart — ohne seine 123 Mt CO₂

**Fundstelle** `strommix-story.html` Z. 627–636 (Akt 4 Schritt 1), Renderer Z. 1660–1733;
Preset `ist2025` in `data/monte_carlo_reference.json`.

**Ist.** Akt 4 führt „eine fünfte als Anker: das heutige System von 2025, mit demselben
Modell gerechnet" ein. Im Chart erscheint es als „Ist 2025 (Referenz)" bei **107–108
€/MWh** — der niedrigste Wert der gesamten Grafik, ganz links, ohne weitere Kennzeichnung.
Alle vier klimaneutralen Szenarien liegen zwischen 141 und 271 €/MWh. Weder Karte noch
Chart noch Datentabelle (`#tbl4`) nennen die Emissionen dieses Ankers. Im projekteigenen
Dispatch produziert er 306 TWh Gas-Backup, das sind bei dem im Modell hinterlegten
Faktor rund **123 Mt CO₂/a bzw. ~237 g/kWh**.

**Beanstandung.** Das ist die klassische Kostenvergleichs-Falle, und sie wirkt hier gegen
das Klima: Ein Leser sieht fünf Balken und liest die einzig mögliche Botschaft heraus —
„Klimaneutralität kostet das 1,3- bis 2,5-Fache des Status quo". Der Vergleich ist
unvollständig, weil er auf der einen Seite Systemkosten und auf der anderen Seite
Systemkosten *plus unbezahlte Emissionen* gegenüberstellt. Die Story hat die
Emissionsmenge im eigenen Dispatch vorliegen, zeigt sie aber nicht. Das ist genau die Art
von weggelassenem Nenner, die die Story selbst in Akt 5 Schritt 3 („Ein Lehrstück über
Nenner") an der Vorlage kritisiert.

Zur Fairness: Die 107 €/MWh enthalten bereits einen CO₂-Preis von 75 €/t. Die Story sagt
das nirgends — was den Befund eher verschärft, weil der Leser nicht einmal erkennen kann,
dass hier überhaupt CO₂ bepreist wird und mit welchem Wert.

**Vorschlag.** (a) Beim Ankerbalken im Chart und in der Datentabelle eine zweite Größe
mitführen: Emissionen in Mt CO₂/a oder g/kWh — das Whitepaper hat mit `co2OfMix()`
(`whitepaper-strommix.js` Z. 1960) die Funktion bereits. (b) In Akt 4 Schritt 1 einen
Satz ergänzen: dass der Anker das *heutige, nicht klimaneutrale* System ist, dass er
rund 123 Mt CO₂/a emittiert und dass sein Kostenvorteil auf einem CO₂-Preis von 75 €/t
beruht. (c) Die Beschriftung „Ist 2025 (Referenz)" um „(nicht klimaneutral)" ergänzen —
ein Wort, das die gesamte Fehlleseart schließt.

---

#### S4 · Der Sieger-Pfad „80 % EE + Gas" ist im eigenen Modell nicht klimaneutral

**Fundstelle** `strommix-story.html` Z. 336 (Prolog: „vier Wege zu einem klimaneutralen
deutschen Stromsystem"), Z. 647–660 (Akt 4 Schritt 3), Z. 691 (`#mc-honest`);
Preset `ee80_gas`; `technologies.gas_ccgt` in `data/model_params.json`.

**Ist.** Der Prolog führt alle vier GES-Szenarien als Wege zu einem **klimaneutralen**
System ein. Akt 4 Schritt 3 und der Zwischenruf machen „80 % EE + Gas" (141 €/MWh) zum
Sieger über das Kernkraft-Szenario. Im projekteigenen Dispatch liefert dieses Szenario
**264 TWh Gas-Backup bei 950 TWh Last** — 27,8 Prozent der gelieferten Energie aus
Erdgas, rund **107 Mt CO₂/a bzw. ~112 g/kWh**. Gegenüber dem heutigen System sinkt die
absolute Emission um nur 13 Prozent, obwohl der Bedarf sich fast verdoppelt. Das Modell
kennt **keine CCS-Technologie**: In `model_params.json` existieren nur `gas_ccgt` und
`gas_ocgt`, beide mit 0,403 t CO₂/MWh. Das Wort CCS taucht in der ganzen Story genau
einmal auf — im Epilog, in einem Nebensatz über Restemissionen.

**Beanstandung.** Hier klaffen Erzählung und Modell auseinander, und niemand sagt es dem
Leser. Entweder

- die GES-Szenarien unterstellen Gas **mit** CCS (dafür spricht der Epilog-Satz über
  „Restemissionen von Gas mit CCS") — dann rechnet das Modell die Emissionen um Faktor
  2–8 zu hoch **und die Kosten zu niedrig**, weil die CCS-Investition fehlt, und der
  Sieg des Gas-Pfades ist ein Artefakt einer fehlenden Kostenposition; oder
- die Rekonstruktion verbrennt tatsächlich unabgeschiedenes Gas — dann ist der Sieger
  der Story schlicht kein klimaneutrales Szenario, und der Prolog-Satz ist falsch.

Beides ist ein schwerer Befund. Verschärfend kommt hinzu, dass laut Limitationen-Karte
„Gaspreis fehlt" der **Erdgas-Brennstoffpreis mit null angesetzt** ist. Das Szenario, das
in dieser Story gewinnt, ist damit dasjenige, das am stärksten von zwei
Modellvereinfachungen profitiert: kostenloser Brennstoff und ein niedrig fixierter
CO₂-Preis. Die Limitationen-Karte benennt den ersten Punkt korrekt („alle Werte sind
Untergrenzen"), aber sie steht weit hinter dem Zwischenruf, der das Ergebnis erzählt —
und der Zwischenruf trägt den Vorbehalt nicht mit.

**Vorschlag.** (a) Im Prolog präzisieren, dass drei der vier Szenarien Restemissionen
enthalten und wie die Studie sie behandelt (CCS oder nicht). (b) In Akt 4 Schritt 3 direkt
neben den 141 €/MWh die Emissionen des Szenarios nennen und den doppelten Vorbehalt
setzen: Gasbrennstoff = 0, CO₂-Preis = 75 €/t fix. (c) Eine Limitationen-Karte „Kein CCS
im Modell" ergänzen — das Modell hat die Technologie nicht, die Erzählung setzt sie
voraus. (d) Den `#mc-honest`-Satz um einen Halbsatz erweitern: dass der Rangwechsel bei
einem CO₂-Preis oberhalb von rund 260 €/t wieder zurückfällt.

---

#### S5 · Die Klimaprämisse fehlt vollständig — inklusive aller Klimaquellen

**Fundstelle** gesamte `strommix-story.html`; Quellenliste `D.sources` (44 Einträge,
gerendert ab Z. 989); Glossar Z. 874–986; Gegenprobe: `whitepaper-strommix.html`
Z. 321–331; Datenbasis: `research/risiken_co2.md` 1.1 und 1.2.

**Ist.** Eine Volltextsuche über die Story nach `Klima`, `CO₂`, `Emission`, `IPCC`,
`Tonne`, `Budget` liefert acht Treffer — davon zwei im Titel/Prolog („klimaneutral"), fünf
im CO₂-Preis-Absatz des Epilogs und einer in der Whitepaper-Verlinkung. Kein IPCC-Zitat,
kein Restbudget, keine Lebenszyklus-Emissionen, kein einziger Emissionswert einer
Technologie. In den 44 Quellen der Story fehlen **IPCC AR6 (SYR und WG1), UNECE 2022
(Lebenszyklus-LCA) und die UBA-Methodenkonvention** — obwohl alle drei in
`build_page_data.py` als Quellen gepflegt und im Whitepaper zitiert sind. Das Glossar
erklärt sieben Begriffe (LCOE, LSCOE, WACC, CRF, Kostenabgrenzung, Dunkelflaute,
Monte Carlo) — keiner davon ist ein Klimabegriff.

Das Whitepaper macht es richtig: Prämisse 1 zitiert AR6 wörtlich („unequivocally",
1,1 °C), Prämisse 2 begründet über die Quasi-Linearität kumulativer CO₂-Emissionen
(AR6 WG1 SPM D.1.1), warum ein skalarer Preis je Tonne überhaupt zulässig ist.

**Beanstandung.** Ohne diese Prämisse wirkt die Klimaneutralität in der Story wie eine
willkürlich gesetzte Randbedingung, deren Kosten man ausrechnet — nicht wie eine
physikalisch begründete Notwendigkeit. Das ist deshalb heikel, weil die Story bei
*jeder anderen* Setzung mustergültig offenlegt, dass es eine Setzung ist. Genau hier, wo
die Setzung **belegt** wäre (Konfidenz A, Primärquelle, wörtliches Zitat vorhanden),
schweigt sie. Ein Leser kann nicht erkennen, dass hier nichts unterschlagen, sondern
etwas als gegeben vorausgesetzt wird.

Zusatz: `risiken_co2.md` 1.2 enthält den vollständigen UNECE-Lebenszyklusdatensatz — mit
der bemerkenswert fairen Relativierung, dass der PV-Bestwert von 8 g/kWh ein Best Case
ist und für Deutschland eher 40–55 g/kWh gelten. Eine Story, die sich rühmt, „beide
Richtungen zu zeigen", lässt hier einen ihrer besten Gegen-die-eigene-Seite-Befunde
liegen.

**Vorschlag.** (a) Im Prolog, direkt vor oder nach dem `cp_transparency`-Kasten, einen
zweiten Kasten „Was hier nicht verhandelt wird" mit den zwei AR6-Kernaussagen (K1 und K4
aus `risiken_co2.md` 1.1) — vier Zeilen, zwei Fußnoten, vorhandene Quellen. (b) Die drei
Klimaquellen in `D.sources` aufnehmen. (c) Optional einen achten Glossareintrag
„CO₂-Restbudget / kumulative Emissionen", der erklärt, warum die *zeitliche Lage* der
Emissionen zählt — das ist die begriffliche Brücke zu S1 und M2.

---

### MITTEL

---

#### M1 · False Balance in Akt 2 Schritt 4: „Die andere ist genauso wahr"

**Fundstelle** `strommix-story.html` Z. 484–497.

**Ist.** Die Karte stellt zwei Lesarten der 6.000-€/kW-Annahme gegenüber. Lesart A: der
Wert liegt nur knapp unter EDFs eigener EPR2-Serienschätzung (7.265–7.583 €/kW) — „Das ist
die faire Lesart." Lesart B: er liegt unter jedem einzelnen westlichen Erstprojekt der
letzten zwanzig Jahre — „Die andere ist genauso wahr."

**Beanstandung.** Die Formulierung „genauso wahr" setzt zwei Evidenztypen gleich, die
nicht gleichwertig sind. Lesart B stützt sich auf **realisierte Kosten** mehrerer
abgeschlossener bzw. weit fortgeschrittener Projekte (n ≈ 5 westliche FOAK, alle
darüber, Konfidenz A). Lesart A stützt sich auf **eine Selbstprognose des Bauherrn** für
ein noch nicht begonnenes Programm (n = 1, unrealisiert) — und die Story selbst zitiert
in `cp_korea_both_ways` und über Grubler reichlich Belege dafür, dass genau solche
Prognosen systematisch unterschritten werden. Zwei Beobachtungsklassen mit
unterschiedlicher Belastbarkeit als „genauso wahr" zu labeln, ist die
Lehrbuchdefinition von false balance — 50:50 dargestellt, wo die Evidenz asymmetrisch ist.

Das ist zugleich der Befund, bei dem ich mir am wenigsten sicher bin, ob ich nicht selbst
parteiisch lese: Die Story *zeigt* ja beide Zahlen, sie versteckt nichts, und die
Cour-des-Comptes-Kritik an den EDF-Zahlen ist in der Quellenliste vorhanden. Der Fehler
liegt nicht in der Auswahl, sondern allein in der Gewichtungsformel.

**Vorschlag.** „genauso wahr" ersetzen durch eine Formulierung, die den Evidenztyp
mitliefert, z. B.: „Die andere ist besser belegt: Sie stützt sich auf realisierte Kosten,
Lesart A auf eine Programmprognose des Bauherrn." Die Aussage der Karte bleibt erhalten,
die Gewichtung wird ehrlich.

---

#### M2 · Der Zeitfaktor steht an genau einer Stelle — und nicht in der Kernbotschaft

**Fundstelle** `strommix-story.html` Z. 771–785 (Akt 5 Schritt 4) gegen Z. 825–855
(Epilog „Die Kernbotschaft passt in einen Satz").

**Ist.** Akt 5 Schritt 4 sagt das Richtige, und es steht dort gut: „Das ist keine
Kostenfrage. Es ist eine **Zeit- und Skalenfrage**", 18 bis 25 Jahre von der politischen
Entscheidung bis zur ersten Kilowattstunde (Konfidenz A), 3,2 GW auf 600 GW sind ein
Rundungsfehler. Das ist die letzte von zwanzig Scrolly-Karten. Der Epilog erklärt
anschließend, die Kernbotschaft passe in einen Satz — und dieser Satz handelt vom
**WACC**. Zeit kommt im Epilog nicht mehr vor.

**Beanstandung.** Die Story identifiziert die Zeitdimension korrekt und ordnet sie dann
strukturell unter. Sie ist in genau einem Absatz präsent, wird nie quantifiziert (was
kostet das Warten?) und im Fazit fallen gelassen. Aus Klimasicht ist das die falsche
Reihenfolge: Der WACC ist ein Hebel auf den *Preis*, die Vorlaufzeit ist ein Hebel auf
die *kumulative Emissionsmenge* — und laut AR6 (K4, im Projektdossier belegt) ist genau
die kumulative Menge quasi-linear mit der Erwärmung verknüpft, nicht der Endzustand.
Die Story vergleicht ausschließlich Endzustände und sagt nirgends, dass sie das tut.

Ehrlichkeitshalber: Die Story *kann* das Warten nicht sauber ausrechnen — das Modell
kennt nur Zustandsschnappschüsse, keinen Transformationspfad, und `ist_zustand_de.md`
enthält überhaupt keine Emissionsdaten (siehe M3). Eine Zahl zu fordern, die es nicht
gibt, wäre unfair. Die Lücke zu benennen, ist trotzdem Pflicht.

**Vorschlag.** (a) Im Epilog nach dem WACC-Absatz zwei Sätze über den Zeithebel: dass
Klimaschutz eine Frist hat, dass 18–25 Jahre Vorlauf bei einem Zieljahr 2045 bedeuten,
dass die erste Kilowattstunde nach der Frist kommt, und dass die Emissionen des Wartens
in dieser Rechnung **nicht** bilanziert sind. (b) Den Kernbotschafts-Satz erweitern zu
zwei Hebeln: Kapitalkostensatz (Preis) und Vorlaufzeit (Menge) — beide politisch, keiner
technisch.

---

#### M3 · Die Limitationen-Liste hat keine Klimakarte

**Fundstelle** `strommix-story.html` Z. 1947–1988 (`renderLimits()`), acht Karten;
`shared.monte_carlo.meta.assumptions`; `gaps` in `data/model_params.json`;
`research/ist_zustand_de.md` (keine Emissionsdaten enthalten).

**Ist.** Die acht Limitationen-Karten sind vorbildlich — halbes Wetterjahr, einzelnes
Wetterjahr, kein Volltext, unabhängige Parameterziehung, Gaspreis null, kein Import/
Lastmanagement, Setzungen im 30-Jahres-Plan, Offshore-Profil. Keine einzige betrifft die
Klimadimension. Nicht benannt sind mindestens vier Punkte, die alle im Projekt
dokumentiert sind:

1. **Der CO₂-Preis wird in der Monte-Carlo-Rechnung nicht variiert** — steht wörtlich in
   `monte_carlo.meta.assumptions` („Nicht variiert werden: … CO2-Preis"), obwohl er laut
   meiner Nachrechnung rangentscheidend ist.
2. **Der Emissionsfaktor ist ein Proxy mit Konfidenz C** — siehe M5.
3. **Nur Endzustände, kein Transformationspfad** — kumulative Emissionen sind nicht
   bilanziert, obwohl das laut AR6 die klimarelevante Größe ist.
4. **Für das heutige System liegen in den Dossiers keine Emissionsdaten vor** —
   `ist_zustand_de.md` enthält zu `Emission`/`CO2` null Treffer. Die 123 Mt/a oben sind
   *aus dem Modell abgeleitet*, nicht aus einer Quelle belegt. Das ist eine echte
   Datenlücke des Projekts und gehört als solche benannt.

**Beanstandung.** Eine Limitationen-Liste, die sieben methodische Schwächen selbstkritisch
aufführt und die vier klimarelevanten auslässt, erzeugt den Eindruck von Vollständigkeit,
wo systematisch eine Dimension fehlt. Das ist keine Absicht, aber es ist ein Muster.

**Vorschlag.** Zwei Karten ergänzen: **„CO₂-Preis nicht variiert"** (mit dem Hinweis, dass
er die Rangfolge ab rund 260 €/t dreht) und **„Nur Endzustände, keine kumulativen
Emissionen"** (mit dem AR6-Hinweis, dass die kumulative Menge die klimarelevante Größe
ist, und dem Vermerk, dass für das Ist-System keine belegten Emissionsdaten im Projekt
vorliegen).

---

#### M4 · Das Prolog-Framing eröffnet 50:50

**Fundstelle** `strommix-story.html` Z. 331–334.

**Ist.** „Die einen sagen: Erneuerbare sind längst die billigste Energie … Die anderen
sagen: … ist ein System mit Kernkraft die günstigere Wahl. Beide Seiten zitieren Zahlen.
Beide Seiten zitieren *echte* Zahlen."

**Beanstandung.** Als Einstieg in eine Kostengeschichte ist das legitim und gut geschrieben
— beide Lager zitieren tatsächlich reale Zahlen, und der Satz kündigt exakt an, was die
Story dann tut. Als *erster Eindruck* setzt er aber einen symmetrischen Rahmen für eine
Frage, in der die Story selbst anschließend zu asymmetrischen Ergebnissen kommt: Akt 2
korrigiert PV und Wind **zugunsten** der Erneuerbaren, Akt 3 zeigt für Kernkraft negative
Lernkurven, Akt 5 zeigt ein Skalen- und Zeitproblem. Der Prolog verspricht ein
Unentschieden, das die eigene Analyse nicht liefert.

Das ist der leichteste meiner False-Balance-Befunde — der Rahmen ist rhetorisch, nicht
inhaltlich. Ich führe ihn trotzdem, weil bei Scrollytelling der Prolog überproportional
im Kopf bleibt.

**Vorschlag.** Einen dritten Satz anhängen, der die Symmetrie auflöst, ohne Partei zu
ergreifen — etwa: „Was sie nicht gleich gut zitieren, sind die Annahmen dahinter. Genau
die sehen wir uns an." Kostet eine Zeile, korrigiert den Rahmen.

---

#### M5 · Der gesamte CO₂-Kostenblock hängt an einem Proxy mit Konfidenz C

**Fundstelle** `technologies.gas_ccgt.params.emission_factor_t_mwh` in
`data/model_params.json`; `gaps[1]` (`emissionsfaktor_direkt`); Wirkung in
`strommix-story.html` überall dort, wo Gas-Backup bepreist wird.

**Ist.** Das Modell rechnet mit 0,403 t CO₂/MWh_el. Die Notiz im Datensatz ist
ungewöhnlich deutlich: „**PROXY**: Ein direkter Verbrennungs-Emissionsfaktor fehlt in
allen Dossiers. Verwendet wird die UNECE-Lebenszyklus-Untergrenze für GuD … **Vor
Veröffentlichung durch einen echten Direktfaktor (z. B. UBA-Emissionsfaktor Erdgas)
ersetzen.**" Konfidenz **C**. Das Whitepaper kennzeichnet das im Slider-Hinweis
(`whitepaper-strommix.js` Z. 1619 ff.) vorbildlich. Die Story kennzeichnet es nirgends.

**Beanstandung.** Zwei Ebenen. Erstens: Die Story stützt ihren einzigen klimarelevanten
Kostenblock auf einen Wert, den das Projekt selbst als vor Veröffentlichung zu ersetzen
markiert hat — und die Story ist die Veröffentlichung. Zweitens, methodisch delikat: Der
Proxy ist eine **Lebenszyklus-Untergrenze**, wird aber wie ein Direktfaktor auf den
Schornstein angewendet. Für Gas liegt der reale Direktfaktor (rund 0,35–0,40 t/MWh_el bei
GuD-Wirkungsgraden) zufällig in ähnlicher Größenordnung, sodass der Fehler klein bleibt —
das ist aber Glück, nicht Methode, und es gilt nicht für die Obergrenze 0,513, die im
Modell als Max hinterlegt ist.

**Vorschlag.** (a) Den Vorbehalt in die Story übernehmen — entweder als Limitationen-Karte
oder als Fußnote am CO₂-Absatz des Epilogs, in der Formulierung, die das Whitepaper schon
hat. (b) Vor der Veröffentlichung den echten UBA-Emissionsfaktor für Erdgas beschaffen,
wie es die Datensatz-Notiz verlangt.

---

### LEICHT

---

#### L1 · Zwei CO₂-Preise im selben Absatz, beide niedrig

**Fundstelle** `strommix-story.html` Z. 849–852.

**Ist.** Der Epilog nennt den ETS-1-Marktpreis Mai 2026 mit **74 €/t** und ergänzt
korrekt „unser Modell rechnet mit 75". Die Differenz ist offengelegt und harmlos.

**Beanstandung.** Kein Fehler, aber eine verpasste Gelegenheit: An der einzigen Stelle der
Story, an der überhaupt Preisniveaus für CO₂ genannt werden, stehen zwei Zahlen, die sich
um ein Euro unterscheiden — und keine dritte, die eine andere Größenordnung eröffnet.
Der Leser bekommt maximale Präzision auf der Nachkommastelle und null Information über
die relevante Spannweite (0 bis 990 €/t, laut Projektdossier).

**Vorschlag.** Die eine Zahl im Satz behalten, aber die Spanne dahinter setzen (siehe S2).

---

#### L2 · Whitepaper: der 990-€-Schattenpreis existiert nur im JS-Text

**Fundstelle** `whitepaper-strommix.html` Z. 330–331 und Z. 533–536;
`whitepaper-strommix.js` Z. 1607–1631.

**Ist.** Prämisse 3 verspricht, der Slider „lässt sich auf die UBA-Schattenpreise
umschalten". Das stimmt: Der Chip „Schattenpreis 990 €" ist implementiert und der
Hinweistext erklärt korrekt den Unterschied Marktpreis / Klimafolgekosten. Der Slider
selbst deckelt jedoch sichtbar bei 400 €/t; der 990er-Chip springt intern auf 990,
während der Regler auf 400 stehen bleibt.

**Beanstandung.** Für einen aufmerksamen Nutzer funktioniert das. Für einen, der nur den
Regler ansieht, sieht es so aus, als sei bei 400 €/t Schluss — die Regleranzeige und der
tatsächlich gerechnete Wert laufen auseinander. Der Befund ist leicht, weil die
Kennzeichnung im Label („990 €/t (Schattenpreis)") vorhanden ist.

**Vorschlag.** Beim aktiven Schattenpreis den Regler deaktivieren oder visuell als
„außerhalb der Skala" markieren, damit die Diskrepanz nicht als Bug gelesen wird.

---

#### L3 · Vier Scrolly-Schritte Kostengeschichte für Kernkraft, null für Erneuerbare

**Fundstelle** `strommix-story.html` Z. 528–612 (Akt 3), Z. 801 (`cp_ee_risks`).

**Ist.** Akt 3 widmet der Kostengeschichte der Kernkraft vier volle Scroll-Schritte:
frühe Billigkeit, US-Kostenexplosion, Grubler/negative learning by doing, Gegenwart. Für
Erneuerbare gibt es keine vergleichbare Geschichtsstunde — weder zu Prognoseabweichungen
noch zu Netzausbau-Verzügen, Offshore-Kostensprüngen 2022–2024 oder gescheiterten
Ausschreibungsrunden. Die EE-Risiken stehen komprimiert in einem einzigen
`cp_ee_risks`-Kasten.

**Beanstandung.** Ich führe diesen Punkt ausdrücklich als *Gegen-mich-selbst-Befund*: Ein
Kernkraft-Befürworter würde hier zu Recht Asymmetrie der Prüfschärfe monieren, und er
hätte recht. Der Anlass der Story (eine kernkraftfreundliche Studie) erklärt die
Asymmetrie, rechtfertigt sie aber nicht vollständig — die Story prüft schließlich auch die
PV- und Wind-Annahmen der Studie (Akt 2) und korrigiert sie dort **zugunsten** der
Erneuerbaren, ohne die Gegenrichtung mit derselben Ausdauer zu verfolgen.

**Vorschlag.** Entweder `cp_ee_risks` prominenter platzieren (eigener Zwischenruf statt
Kasten am Kapitelende) oder in Akt 2 einen fünften Schritt „Und wo die Erneuerbaren
teurer geworden sind" ergänzen. Die Daten dafür liegen in `kosten_ee_speicher.md`.

---

## Wo ich als Aktivist:in positiv überrascht bin

Das gehört genauso ins Protokoll wie die Kritik — und es ist mehr, als ich erwartet habe.

- **Akt 5 Schritt 4 macht mein Argument, ohne dass ich es fordern musste.** „Das ist keine
  Kostenfrage. Es ist eine Zeit- und Skalenfrage", 18–25 Jahre Vorlauf mit Konfidenz A,
  3,2 GW auf 600 GW als Rundungsfehler. Der Datensatz geht sogar weiter als die Story
  („ohne jeden Beitrag vor 2045", 2,4 Prozent des Bedarfs bei 51 Mrd. € Kapitalbindung).
  Das ist präzise, belegt und unaufgeregt — und es steht in einem Papier, das sich nicht
  als Klimapapier versteht.
- **Akt 3 verschont die Kernkraft nicht.** Grubler und *negative learning by doing* im
  Original benannt, die Kostenexplosion korrekt **vor** Three Mile Island datiert (und
  der TMI-Effekt trotzdem mitgeliefert, damit kein einseitiges Regulierungsnarrativ
  entsteht), dreizehn Referenzprojekte mit Kostenabgrenzung an jedem Punkt.
- **Der OCC/EPC/FOAK-Beipackzettel** ist das wirksamste Gegenmittel gegen die verbreitete
  Zahlenwäsche in dieser Debatte, das ich in einem Publikumsformat gesehen habe. Die
  Ablehnung des ungewichteten Fünf-Projekte-Mittelwerts ist methodisch schlicht richtig.
- **Die Story verweigert sich ihrer eigenen Schlagzeile.** „Das Studienergebnis kehrt sich
  um" wäre die klickstärkere Variante gewesen; stattdessen steht dort „geprüft und
  verworfen … ein Rangwechsel um einen Platz bei überlappenden Bändern". Diese Art von
  Selbstbeschränkung ist selten und verdient, benannt zu werden.
- **`cp_ee_risks` ist ehrlich.** China-Anteil in der PV-Lieferkette, kritische Rohstoffe,
  Wasserstoffverluste, Aufwärtsrisiken beim Netzausbau — nichts davon ist beschönigt, und
  ich als Aktivist:in muss das akzeptieren.
- **Das Whitepaper ist nicht klimablind.** Prämissen 1 und 2 zitieren AR6 wörtlich, der
  Schattenpreis-Chip mit 990 €/t existiert, der Hinweistext trennt Marktpreis und
  Klimafolgekosten sauber, und die Mix-Simulation zeigt eine Mt/a-Kachel. **Das ist der
  entscheidende Kontext für dieses ganze Review: Das Projekt hat die Klimadimension. Die
  Story hat sie verloren.** Das macht die Befunde S2 bis S5 zu Reparaturen, nicht zu
  Neubauten.

## Wo Klimaskeptiker die Story zu Recht als aktivistisch lesen würden

Auch das gehört zur Ehrlichkeit — und der zweite Punkt ist der unbequemste dieses Reviews.

- **Asymmetrie der Prüfschärfe** (siehe L3): Akt 2, Akt 3 und der Fairness-Abschnitt
  behandeln fast ausschließlich Kernkraft. Wer zählt, zählt zwölf von zwanzig
  Scrolly-Karten gegen eine Technologie.
- **Der Gaspreis von null ist der größte einzelne Bias der Story — und er wirkt gegen
  mich.** Das Szenario, das in Akt 4 gewinnt, ist dasjenige, das 264 TWh Erdgas zum Preis
  null verbrennt und dessen CO₂ bei 75 €/t eingefroren ist. Ein Kernkraft-Befürworter
  würde sagen: Der Sieger ist ein Artefakt zweier Modelllücken. Er hätte recht. Dass
  dieser Befund die Klimaposition trifft und nicht stützt, ändert nichts an seiner
  Richtigkeit — und er ist der Grund, warum ich die CO₂-Preis-Sensitivität aus S2 nicht
  als Aktivismus, sondern als methodische Reparatur verstehe: Sie behebt genau diese
  Verzerrung.
- **„Zwei Reaktoren ändern wenig"** (Akt 5 Schritt 4) ist als Scrolly-Karte ein
  Strohmann-Setup. Die Story sagt das im anschließenden Fairness-Abschnitt selbst
  („die ungünstigste aller Konstruktionen", „muss man als Programm rechnen") — aber die
  Karte ist das Bild, das hängen bleibt, und der Fairness-Absatz steht danach in
  kleinerem Fließtext.

---

## Top-3 Must-Fix

**1 · CO₂-Preis-Sensitivität aufnehmen und den Epilog-Satz korrigieren** (S2, stützt M3, L1)

Der Satz „der CO₂-Preis … wird in der Debatte regelmäßig überschätzt" ist im
projekteigenen Modell widerlegt: Ab rund 260 €/t kippt die Rangfolge, die die Story als
ihr Hauptergebnis erzählt; bei 350 €/t (UBA MK 3.2, dem *konservativen* der beiden
Schattenpreise) liegt das Kernkraft-Szenario vorn und das heutige System ist teurer als
alle klimaneutralen Alternativen außer dem 100-Prozent-Pfad. Der Satz muss weg oder auf
seinen tatsächlichen Geltungsbereich eingeschränkt werden, der Unterschied Marktpreis
(74 €/t) zu gesellschaftlichen Klimakosten (350 / 990 €/t, mit der Diskontierungsfrage
als offengelegter ethischer Setzung) muss erzählt werden, und die Sensitivitätstabelle
gehört als Grafik in die Story. Alles dafür Nötige — Modell, Parameter, UBA-Quelle,
Whitepaper-Implementierung — existiert bereits im Projekt.

**2 · Zieljahr nennen und die gezeigten Szenarien mit ihren Emissionen versehen**
(S1 + S3 + S4)

Drei Eingriffe, die zusammen die zentrale Fehlleseart schließen: (a) „klimaneutral **im
Jahr 2045**" im Prolog, gemessen gegen die 18–25 Jahre Vorlauf und die Inbetriebnahme
2045/2052 aus dem eigenen Datensatz; (b) der Anker „Ist 2025" bekommt seine ~123 Mt CO₂/a
bzw. ~237 g/kWh und das Label „nicht klimaneutral" — sonst liest jeder Balkenvergleich als
„Klimaschutz kostet Aufschlag"; (c) der Sieger-Pfad „80 % EE + Gas" bekommt seine 264 TWh
unabgeschiedenes Gas und ~107 Mt CO₂/a genannt, samt Klärung, ob die Studie CCS
unterstellt und das Modell es nicht kennt. Ohne (c) steht im Prolog eine Aussage
(„vier Wege zu einem klimaneutralen System"), die das eigene Modell nicht trägt.

**3 · Klimaprämisse in den Prolog, zwei Limitationen-Karten in den Anhang** (S5 + M3 + M5)

Ein Kasten mit den zwei AR6-Kernaussagen (menschgemachte Erwärmung; Quasi-Linearität der
kumulativen CO₂-Emissionen als Rechtfertigung eines skalaren Preises je Tonne) — beides
Konfidenz A, wörtlich zitierfähig, im Whitepaper bereits vorhanden — plus IPCC, UNECE und
UBA in der Quellenliste. Dazu zwei Limitationen-Karten: „CO₂-Preis nicht variiert" und
„Nur Endzustände, keine kumulativen Emissionen" (mit dem Vermerk, dass für das Ist-System
keine belegten Emissionsdaten in den Dossiers liegen und der Emissionsfaktor ein
Konfidenz-C-Proxy ist, den `model_params.json` ausdrücklich „vor Veröffentlichung
ersetzen" heißt). Danach ist die Story bei der Klimadimension so selbstkritisch wie sie
es bei allem anderen bereits ist.
