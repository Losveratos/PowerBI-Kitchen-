---
review: "03 · Klimaaktivistin mit wissenschaftlichem Anspruch"
persona: "Klimaaktivistin, naturwissenschaftlich ausgebildet; arbeitet mit IPCC-AR6- und UNEP-Emissions-Gap-Zahlen; sensibilisiert für ‚Discourses of Climate Delay' (Lamb et al. 2020) und dafür, dass ehrliche Unsicherheits-Kommunikation nicht als Zweifel-Säen instrumentalisierbar sein darf."
datum: "2026-08-30"
pruefobjekt: "/eauto-klimabilanz.html (Volltext inkl. JavaScript)"
kontext: "eauto/data/model_params.json · eauto/research/parameter_quellen.md · eauto/research/hochrechnung_quellen.md"
verfahren: "Seite vollständig gelesen (Markup, Texte, Chart-Code, Monte-Carlo-Port, Befund-Strings); alle Parameter gegen model_params.json und die beiden Dossiers geprüft; Kohlestrom-, Sensitivitäts- und Hochrechnungs-Aussagen überschlägig nachgerechnet."
---

# Persona-Review · „E-Auto-Klimabilanz: Auspuff oder Lebenszyklus?"

## Kurzfazit

Diese Seite ist das Gegenteil von Greenwashing — und genau deshalb muss sie aufpassen,
nicht versehentlich das Gegenteil von Klimakommunikation zu werden. Die wissenschaftliche
Substanz ist außergewöhnlich: konservative Defaults, Konfidenzstufen an jeder Zahl, ein
Monte Carlo, das Unsicherheit ehrlich zeigt und gleichzeitig sagt, dass das *Vorzeichen*
der Ersparnis davon unberührt bleibt. Der Transparenz-Kasten zur unveröffentlichten
TUM-Studie ist vorbildlich. Aber die Seite beantwortet nur die Frage „E-Auto oder
Verbrenner?" — und lässt drei Türen offen, durch die ein motivierter Zweifler spazieren
kann: (1) Die Hochrechnung endet visuell bei „~3–4 % der Welt-Emissionen", ohne
Absolut-Anker und ohne den Satz, dass auf dem Weg zu Netto-Null *jeder* Sektor auf null
muss — das ist die Steilvorlage für das Delay-Muster „bringt ja eh kaum was".
(2) Suffizienz existiert nicht: kein Wort zu kleineren Autos, weniger Kilometern, ÖPNV
oder Rad — die Seite verengt die Klimafrage komplett auf den Antriebswechsel, obwohl ihr
eigenes Modell die Suffizienz-Hebel (Batteriegröße, Verbrauch, Fahrleistung) längst
enthält. (3) Der TUM-Schluss „Defossilisierung über Kraftstoffe für die Bestandsflotte"
— der E-Fuels-Pfad, ein Lehrbuchfall von *fossil fuel solutionism* — wird zitiert, aber
nicht mit dem einen Effizienz-Faktum konfrontiert, das ihn einordnet. Die konservativen
Setzungen (Batterie 75 statt 55 kg CO₂e/kWh) sind im JSON sauber begründet, auf der
Seite selbst aber unsichtbar; die stärkste Anti-Zweifel-Aussage („selbst mit Kohlestrom
meist vorn") steht erst in Kapitel 6 im Fließtext. Und am Ende fehlt jede
Handlungsorientierung — die Seite entlässt niemanden mit einem nächsten Schritt.

**Empfehlung: publizierbar nach gezielten Ergänzungen** — kein Umbau, aber ein
Suffizienz-Absatz, Absolut-Anker in der Hochrechnung, ein E-Fuels-Effizienzsatz und
eine sichtbare Kennzeichnung der konservativen Defaults.

**Befunde: 2 KRITISCH · 6 MITTEL · 4 KLEIN**

---

# KRITISCH

## K1 · Suffizienz und Alternativen kommen nicht vor — die Seite verengt „Klima" auf „welcher Antrieb"

**Fundstelle:** gesamte Seite; Kapitel 2 („Verglichen wird ein batterieelektrisches Auto
… mit einem Benziner derselben Klasse"), Kapitel 7 (Limitationen).

**Ist.** Das Modell vergleicht ausschließlich Auto gegen Auto. Nirgends — auch nicht in
den Limitationen — steht, dass es klimawirksamere Optionen als den 1:1-Ersatz gibt:
kleineres Fahrzeug, weniger Kilometer, ÖPNV, Rad, Carsharing, gar kein Auto. Das Wort
„Suffizienz" (oder irgendein Äquivalent) taucht auf der Seite nicht auf. Damit
reproduziert die Seite unfreiwillig die Rahmung der Autodebatte selbst: Die einzige
Klimafrage, die ein Auto betrifft, sei die Antriebsfrage. IPCC AR6 WGIII (Kap. 5,
Demand-Sektoren) beziffert Avoid-Shift-Improve-Potenziale ausdrücklich *zusätzlich* zur
Elektrifizierung — und die Ironie ist: Das Modell der Seite enthält alle
Suffizienz-Hebel bereits (batt_kwh 30–100, cons_bev 15,5–30, km_per_year 5.000–30.000),
es erzählt sie nur nicht.

**Warum das kritisch ist.** Ohne diesen Kontext ist die Seite in beide Richtungen
missbrauchbar: Pro-Auto-Leser nehmen mit „E-Auto kaufen = Klimaproblem gelöst";
Anti-E-Auto-Leser nehmen mit „selbst die E-Auto-Freunde sagen, es bringt nur ein paar
Prozent". Beides ist falsch, und beides ließe sich mit einem einzigen Kasten verhindern.

**Vorschlag.** Ein Kasten (z. B. nach Kapitel 5 oder in Kapitel 6), Arbeitstitel „Was
dieses Modell *nicht* vergleicht": (a) Das sparsamste Auto ist das, das nicht gebaut
und nicht gefahren wird — jeder vermiedene Kilometer spart beim Verbrenner ~230 g, beim
BEV im DE-Mix ~90–130 g, beim ÖPNV/Rad fast alles davon. (b) Ein kleines BEV
(45 kWh, 16 kWh/100 km) gegen ein großes (90 kWh, 22 kWh/100 km) macht im eigenen Modell
mehrere Tonnen aus — mit den Reglern oben direkt nachstellbar (verlinken!). (c) Ein
Satz zur Reihenfolge: Vermeiden > Verlagern > Verbessern; die Seite behandelt nur die
dritte Stufe. Kein Zeigefinger nötig — zwei konkrete Reglerstellungen als „probier das"
reichen und passen zum interaktiven Charakter der Seite.

## K2 · Die Hochrechnung endet bei „~3–4 % der Welt-Emissionen" ohne Absolut-Anker und ohne Sektor-Logik — die perfekte Screenshot-Vorlage für „bringt kaum was"

**Fundstelle:** Kapitel 5, `chart-scale` (Balken als „Anteil an den
THG-Gesamtemissionen"), `renderScaleTable`, `scale-finding` (JS, Zeilen ~1143–1152).

**Ist.** Der Befundtext ist inhaltlich richtig und schon halb verteidigt: „relevanter,
aber kein hinreichender Hebel … adressiert genau den Pkw-Anteil der Emissionen — nicht
mehr und nicht weniger". Gut. Aber: Das Chart zeigt für „Welt" ein Band um wenige
Prozent auf einer Prozent-Achse, und der Text nennt die Mt-Zahl ohne jeden
Vergleichsmaßstab. Ein aus dem Kontext gerissener Screenshot des Charts (oder der
Halbsatz „x % der globalen Emissionen") funktioniert exakt wie das Delay-Muster
*whataboutism / „unser Anteil ist klein"* (Lamb et al. 2020, „Discourses of climate
delay"): Dieselbe Rhetorik, mit der der deutsche Gesamtausstoß („nur 2 %") kleingeredet
wird, lässt sich hier gegen das E-Auto wenden — mit den Zahlen dieser Seite.

**Warum das kritisch ist.** ~2 Gt CO₂e pro Jahr (der Median der Welt-Simulation) sind
in absoluten Zahlen gewaltig: rund das Dreifache der gesamten deutschen
Jahresemissionen (649 Mt), mehr als die gesamte internationale Luftfahrt. „Wenige
Prozent von 57,7 Gt" und „dreimal Deutschland" sind dieselbe Zahl — aber nur eine der
beiden Darstellungen ist gegen Missbrauch gehärtet. Die Seite liefert derzeit nur die
verwundbare.

**Vorschlag.** Zwei Ergänzungen im `scale-finding` (die Daten sind alle schon im
Modell bzw. in `hochrechnung_quellen.md`): (1) Absolut-Anker: „≈ x Mt/a — mehr als
das Dreifache der gesamten deutschen Treibhausgasemissionen (649 Mt)". (2) Ein Satz
Sektor-Logik als expliziter Riegel: „Auf dem Weg zu Netto-Null muss *jeder* Sektor auf
nahe null — ‚nur x % der Gesamtemissionen' ist bei keinem einzigen Sektor ein Argument
gegen seine Dekarbonisierung, sonst gäbe es keinen Sektor, bei dem man anfangen dürfte."
Optional das UNEP-Gap-Framing: Die Lücke zum 1,5-°C-Pfad 2030 beträgt ~20 Gt CO₂e/a —
der Pkw-Hebel allein liefert davon einen zweistelligen Prozentanteil.

---

# MITTEL

## M1 · Hero-Framing „Beide können methodisch sauber sein" adelt ein unveröffentlichtes, via BILD lanciertes Whitepaper zur Ebenbürtigkeit mit einem ICCT-Report

**Fundstelle:** Hero (`hero-sub`), Anlass-Kasten; Kontrast: Transparenz-Kasten direkt
darunter und Quellenliste ([1] BILD B, [2] Agenturmeldung B vs. [4] ICCT A).

**Ist.** Die Seite weiß und dokumentiert die Asymmetrie selbst: TUM-Zahlen nur aus
Medienberichten (Konfidenz B), Volltext unveröffentlicht, Vorstellung gezielt vor der
November-Abstimmung über das EU-Automobil-Paket, Initiator ist der TUM-Präsident, die
Fachautoren sind unbenannt (siehe `parameter_quellen.md` §1, gaps). Der ICCT-Report ist
dagegen ein frei verfügbares, methodisch offengelegtes A-Dokument. Der Hero stellt
beide trotzdem symmetrisch nebeneinander („Beide können methodisch sauber sein —
entscheidend sind die Annahmen"). Das ist als Einstieg didaktisch elegant, aber
epistemisch schief: Von der einen Studie *kennt niemand* die Methodik — ob sie sauber
ist, ist nicht prüfbar, das ist ein anderer Zustand als „sauber mit anderen Annahmen".
Wer nur Hero und erste Kachel liest (und das sind die meisten), nimmt eine
False-Balance mit, die der Rest der Seite mühsam wieder einfängt.

**Vorschlag.** Einen halben Satz in den Hero: „… die ICCT-Studie für Europa auf −73 %.
Beide können methodisch sauber sein — wobei die TUM-Methodik bislang niemand prüfen
kann, der Volltext ist unveröffentlicht — entscheidend sind die Annahmen." Alternativ
das Konfidenz-Gefälle sichtbar machen: hinter −41 % ein `conf-B`-Badge, hinter −73 %
ein `conf-A`-Badge — die Badge-Infrastruktur existiert ja bereits und wird im
Hero-Meta sogar erklärt.

## M2 · Der TUM-Schluss „Defossilisierung über Kraftstoffe" (E-Fuels) wird referiert, aber nicht mit dem entscheidenden Effizienz-Faktum konfrontiert

**Fundstelle:** Kapitel 6, Abschluss-Note („… oder, wie die TUM-Autoren folgern,
‚Defossilisierung' auch über Kraftstoffe für die Bestandsflotte (E-Fuels bildet dieses
Modell nicht ab, siehe Limitationen)").

**Ist.** Der E-Fuels-Pfad für Pkw ist der Kern des politischen Manövers, in dessen
Dienst die Studien-Lancierung vor der November-Abstimmung steht — und er ist ein
Lehrbuchfall der Delay-Kategorie *fossil fuel solutionism / technological optimism*:
Er verspricht Klimaschutz ohne Strukturänderung und verlängert dabei die
Verbrenner-Infrastruktur. Die Seite gibt ihn kommentarlos als eine von drei möglichen
Konsequenzen wieder. „Bildet dieses Modell nicht ab" klingt nach methodischer
Bescheidenheit, wirkt hier aber wie Enthaltung an der einzigen Stelle, an der die
Leserin eine Einordnung braucht.

**Vorschlag.** Kein Modell nötig, ein Satz Physik genügt (Quelle nachrüstbar, z. B.
Agora/ICCT/Öko-Institut-Aufbereitungen): „Zur Einordnung: Ein mit E-Fuels betriebener
Verbrenner benötigt pro Kilometer etwa das Fünffache an erneuerbarem Strom wie ein
BEV — dieselbe Kilowattstunde Windstrom spart im E-Auto also ein Mehrfaches der
Emissionen. Für die Bestandsflotte ist der Pfad diskutierbar, als Argument gegen die
Elektrifizierung der Neuflotte rechnet er sich selbst klein." Das ist keine
Aktivisten-Rhetorik, sondern Wirkungsgradkette — und gehört auf eine Seite, deren
ganzes Thema Wirkungsketten sind.

## M3 · Die konservativen Defaults sind auf der Seite nicht als solche erkennbar — die Begründung lebt nur im JSON

**Fundstelle:** Batterie-Regler (`batt_co2`, Default 75, Quelltext-Zeile am Slider
nennt „Aktuelle Fertigung ~55 kg CO₂e/kWh …"); Begründung ausschließlich in
`model_params.json` → `defaults.batt_co2.note` („Bewusste Setzung: Default 75 liegt
konservativ zwischen aktueller Fertigung … und IVL-2019-Obergrenze …").

**Ist.** Wer den Regler ansieht, liest: Quellenlage sagt ~55, eingestellt ist 75 —
ohne Erklärung. Das ist doppelt angreifbar: E-Auto-Skeptiker können sagen „selbst die
rechnen mit 75, die 55 sind Wunschdenken"; E-Auto-Befürworter können sagen „die Seite
rechnet das BEV absichtlich schlecht". Die tatsächliche — gute! — Begründung
(„‚Deutschland heute' soll nicht das Best-Case-Batterie-Szenario unterstellen") sieht
kein Mensch, der nicht die JSON-Datei öffnet. Dieselbe Logik gilt für das
Start-Preset: „Deutschland heute (statisch)" ist als „die konservative Sicht"
beschriftet (gut), aber dass damit *alle* Startwerte der Seite bewusst am vorsichtigen
Rand liegen — und die realen Zahlen also eher *besser* fürs BEV ausfallen — steht
nirgends gebündelt.

**Vorschlag.** (1) Am Batterie-Regler die note aus dem JSON in die src-Zeile heben:
„Default 75 = bewusst konservativ zwischen aktueller Fertigung (~55) und älteren
Spannen — Details im Dossier." (2) Ein Satz im Anlass- oder Modell-Kapitel: „Alle
Voreinstellungen sind konservativ gewählt — wo das Modell irrt, irrt es zulasten des
E-Autos." Dieser eine Satz ist zugleich der beste Schutz der Seite gegen den Vorwurf
der Schönrechnerei und die stärkste Absicherung ihres Befunds.

## M4 · Regler-Nebenwirkung: Mehr Kilometer verbessern die angezeigte Reduktion — ohne Hinweis, dass absolute Emissionen dabei steigen

**Fundstelle:** Kachel `t-red` in Verbindung mit den Reglern `km_per_year`/`years`;
Kapitel 6, Bullet „Lebensfahrleistung" („jeder weitere Kilometer verdünnt ihn").

**Ist.** Wer die Jahresfahrleistung von 12.500 auf 30.000 km zieht, sieht die
CO₂-Reduktions-Kachel steigen. Modelllogisch korrekt (der Rucksack verdünnt sich),
aber als Botschaft pervers missverstehbar: „Vielfahren macht das E-Auto grüner." Die
absolute Emissionsmenge steigt selbstverständlich mit jedem Kilometer — nur zeigt die
prominenteste Kachel den *relativen* Vergleich. Für ein Publikum, das in
Prozentpunkten denkt, ist das eine eingebaute Fehllektüre.

**Vorschlag.** Ein Satz in der Karte „Nutzung & End-of-Life" oder unter der
Kachel-Reihe: „Achtung Lesart: Mehr Kilometer verbessern nur den *relativen* Vorsprung
des E-Autos (der Produktions-Rucksack verteilt sich) — die absoluten Emissionen
steigen mit jedem Kilometer, egal mit welchem Antrieb." Das schließt zugleich sauber
an den fehlenden Suffizienz-Kasten (K1) an.

## M5 · Systemgrenzen-Mix in der Strommix-Chip-Reihe: UBA-Verbrauchsmix (kein LCA) neben LCA-Werten — unmarkiert

**Fundstelle:** `strommix_presets` (DE 2024/2025 = UBA-Verbrauchsmix ohne
Anlagenbau-Vorketten; „Wind/PV (LCA)" und „Steinkohle (LCA)" = volle LCA-Werte);
`parameter_quellen.md` §3 benennt die Lücke selbst („für LCA-Konsistenz ggf.
+~10–15 % ansetzen").

**Ist.** In derselben Chip-Reihe stehen Werte mit zwei verschiedenen Systemgrenzen.
Das Vorzeichen des Effekts ist pro-BEV (der DE-Mix müsste in LCA-Logik etwas höher
liegen), die Größenordnung ist klein — aber genau solche Inkonsistenzen sind die
Sollbruchstellen, an denen eine ansonsten wasserdichte Seite öffentlich zerlegt wird
(„die vergleichen Äpfel mit Birnen, was stimmt dann noch?"). Das Dossier kennt das
Problem; die Seite verschweigt es.

**Vorschlag.** In die Limitationen einen Halbsatz aufnehmen („UBA-Mixwerte sind
Verbrauchsmix ohne Anlagenbau-Vorketten, ca. +10–15 % in voller LCA-Logik — das
verschiebt die Ergebnisse um wenige Prozentpunkte zulasten des BEV und ist von den
konservativen übrigen Setzungen mehr als abgedeckt") — und schon ist aus der
Angriffsfläche ein weiterer Beleg für Sorgfalt geworden.

## M6 · Die stärkste Anti-Zweifel-Aussage der Seite — „selbst mit Kohlestrom vorn" — kommt zu spät und zu leise

**Fundstelle:** Kapitel 6, Note „Was im Modell robust ist — und was kippt";
dynamisch auch in `sens-finding` (Kapitel 3: Nulllinie erst bei ~1.100 g/kWh mit
Default-Einstellungen — oberhalb von reinem Steinkohlestrom).

**Ist.** Der Satz, der die gesamte „E-Autos sind Dreckschleudern am
Kohlestrom"-Erzählung erledigt — mit aktuellen Batterien bleibt das BEV selbst bei
reinem Steinkohlestrom vorn, und die Bilanz kippt erst bei Kombination *mehrerer*
ungünstiger Extreme — steht im vorletzten inhaltlichen Kapitel, eingebettet in eine
Fließtext-Note. Wer bis Kapitel 6 nicht liest (die Mehrheit), verpasst die
Kernrobustheit des Ergebnisses; hängen bleiben stattdessen die breiten Bänder aus
Kapitel 4 — also genau das Material, aus dem „ist doch alles unsicher"-Zweifel
gebaut wird.

**Vorschlag.** Die Robustheits-Aussage nach oben spiegeln: entweder als vierte Zeile
im Anlass-Kasten („Vorweg das Robusteste: …") oder als eigene Kachel neben den vier
Ergebnis-Kacheln in Kapitel 2 („Kippt die Bilanz? Erst bei Kohlestrom *plus*
historischen Batteriewerten *plus* kurzer Nutzung — Preset ‚Kohlestrom' probieren").
Die Unsicherheits-Kommunikation der Seite ist stark; sie braucht nur die richtige
Reihenfolge: erst das robuste Vorzeichen, dann die ehrliche Bandbreite.

---

# KLEIN

## S1 · Hochrechnungs-Kontrafaktual „alles fährt Benzin" leicht überzeichnet

Die Flotten-Hochrechnung vergleicht „alle elektrisch" gegen „alle Benzin". Die reale
Bestandsflotte enthält Diesel (sparsamer je km), Hybride und bereits 4,1 % BEV — die
ausgewiesene Ersparnis gegenüber der *realen* Flotte wäre also etwas kleiner als
gegenüber der reinen Benzin-Flotte. Für ein erklärtes Größenordnungs-Modell in
Ordnung, gehört aber als Halbsatz in die Limitationen-Liste (Kapitel 7), damit es
niemand anderes „aufdeckt".

## S2 · „Der Verbrenner lag in x % der Ziehungen vorn" — Framing dreht sich leichter positiv

**Fundstelle:** `mc-finding` (JS ~1136). Die Zahl ist für Deutschland vermutlich nahe
null — dann ist „das E-Auto lag in über 99 % der 1.000 Ziehungen vorn" dieselbe
Information mit dem Anker auf der richtigen Seite (Negations-Framings bleiben als
Restzweifel hängen). Vorschlag: Formulierung von `share_ice_better_pct` abhängig
machen: unter ~2 % positiv formulieren, darüber die jetzige Form behalten.

## S3 · Vorzeichen-Konvention der Sensitivitäts-Achse ist stolperanfällig

**Fundstelle:** `chartSens` (y-Labels: positive Reduktion mit „−"-Präfix, negative mit
„+"). Die Konvention ist konsistent mit „−41 %/−73 %", aber eine Achse, auf der „−80 %"
oben und „+40 %" unten steht, ist auf den ersten Blick verkehrt herum. Die
Achsenbeschriftung („y-Achse: CO₂-Ersparnis des BEV") rettet es halb; ein kurzes
„oben = besser fürs E-Auto" im Caption-Text würde es ganz retten.

## S4 · Quelle [1] (BILD) verlinkt nur auf bild.de

Die Paywall ist im note-Feld dokumentiert, aber der generische Link auf die Startseite
ist der schwächste Eintrag einer sonst vorbildlichen Quellenliste. Entweder den
Deep-Link zum Artikel setzen (auch wenn paywalled) oder den Eintrag mit der
Agenturmeldung [2] zusammenführen und BILD nur im Fließtext als Erstberichterstatter
nennen — das nimmt der Seite zudem die unnötige Reichweiten-Spende an die
„E-Auto-Lüge"-Rahmung.

---

# Was gut ist

- **Der Transparenz-Kasten zur TUM-Studie.** „Volltext lag nicht vor, alle Zahlen aus
  Medienberichten, Presets sind nachgestellt, nicht die Originalrechnung" — plus die
  Zusage in den Limitationen, das Preset nach Veröffentlichung gegen die echten
  Annahmen zu ersetzen. So sieht redliche Berichterstattung über eine lancierte
  Studie aus; die meisten Redaktionen haben das am 30.08. nicht geleistet.
- **Unsicherheit wird gezeigt, ohne Beliebigkeit zu erzeugen.** Der Monte-Carlo-Befund
  spricht die Gefahr selbst an („Die Spannen wirken breit — das ist der ehrliche Preis
  …; das Vorzeichen der Ersparnis ist davon unberührt") und weist den Anteil der
  Ziehungen aus, in denen der Verbrenner vorn lag. Genau so verhindert man, dass
  ehrliche Bänder als Zweifel-Munition dienen — es fehlt nur die Platzierung dieser
  Robustheit weiter vorn (M6).
- **Die konservative Grundhaltung der Parameter.** Batterie-Default oberhalb der
  aktuellen Fertigung, statischer Strommix als Startszenario, enge Flottenverteilung
  statt Vielfahrer-Streuung in der Hochrechnung, End-of-Life als vorsichtiger
  C-Term — die Seite rechnet konsequent gegen ihre eigene Schlussfolgerung an. Das
  muss nur sichtbar werden (M3).
- **Die „Auspuff-Logik" wird nicht übernommen, sondern seziert** — und sogar auf die
  Verbrennerseite zurückgewendet (Kraftstoff-Vorkette als „Auspuff-Logik-Falle" der
  Gegenseite, Kapitel 6). Die kritische Einordnung der TUM-Rahmung ist verlinkt [3],
  der industriepolitische Kontext (November-Abstimmung) benannt.
- **Die „>100 % des Pkw-Inventars"-Erklärung** in der Hochrechnungs-Tabelle nimmt eine
  garantierte Verwirrung vorweg und macht aus ihr eine Lehrstelle über Inventar- vs.
  Lebenszyklus-Sicht. Sehr gut.
- **Reproduzierbarkeit als Haltung:** Python-Referenzmodell, bitidentisches PRNG,
  Testvektoren, sichtbares Selbsttest-Badge, dokumentierte Ziehungsreihenfolge. Eine
  interaktive Seite, deren Zahlen man nachrechnen kann, ist in dieser Debatte selten —
  und das beste Immunsystem gegen den Vorwurf der Manipulation.

---

*Review erstellt ohne Änderungen an Code oder Daten; alle Fundstellen beziehen sich
auf den Stand der Dateien am 2026-08-30.*
