# Adversarialer Review · White Paper Strommix v0.9

> **Rolle:** kritischer Gutachter *vor* Veröffentlichung. Ziel dieses Durchgangs war
> nicht die Bestätigung, sondern das Finden von Fehlern.
> **Prüfobjekt:** `/whitepaper-strommix.html` + `/whitepaper-strommix.js` (v0.9),
> `strommix/data/{page_data,model_params,profiles_2024,test_vectors}.json`.
> **Referenz:** `strommix/research/*.md`, `strommix/docs/01_grundlage_ges_faktencheck.md`,
> `strommix/docs/02_modellkonzept.md`, `strommix/scripts/model.py`.
> **Datum:** 2026-08-15 · **Prüfer:** Review-Pass Phase 5

## Vorgehen

1. **Zahlentreue:** 30+ angezeigte Zahlen aus Teil A–D, Fazit und Quellenverzeichnis
   gegen `page_data.json` / `model_params.json` und von dort gegen die Dossiers
   zurückverfolgt. Zusätzlich `build_page_data.py` und `consolidate_params.py`
   erneut ausgeführt und die erzeugten Dateien byteweise mit den eingecheckten
   verglichen → **reproduzierbar, identisch**.
2. **Modell-Korrektheit:** `whitepaper-strommix.js` Abschnitt 2 zeilenweise gegen
   `scripts/model.py` gelesen; anschließend Chromium/Playwright-Läufe mit
   Grenzfällen (alle Anteile 0, Anteile 120 %, Bedarf 500/1300 TWh, Speicher 0,
   Batterie ohne Energie, Elektrolyse ohne Turbine, WACC 3/9 %, CO₂ 0/400,
   Gas-Backup fix/automatisch, VLh = 0, Lebensdauer = 0).
3. **PARTIAL-Kennzeichnung:** Volljahres-Datenlage simuliert (Route-Interception,
   `meta.data_completeness = "FULL"`) und geprüft, welche Labels und Textblöcke
   tatsächlich verschwinden.
4. **Neutralität:** Fließtext gegen die Dossier-Passagen „Fair gegen beide Seiten",
   „Das faire Gegenargument", Bias-Check und die Pro-GES-Befunde gelesen.
5. **Handwerk:** Quellenverzeichnis-Format (kein Netzzugriff auf externe Domains),
   Kontrastberechnung (WCAG 2.1), Tastaturbedienung von Slidern und Quellen-Chips,
   Rechtschreibung/Terminologie.

## Übersicht

| Schwere | Anzahl | Status |
|---|---:|---|
| **KRITISCH** (falsche Zahl / falsche Aussage / Modellfehler) | **3** | 3 behoben, 0 offen |
| **MITTEL** (Überdehnung / fehlende Kennzeichnung / Neutralität) | **15** | 15 behoben, 0 offen |
| **KLEIN** (Stil / Handwerk) | **21** | nur gelistet (5 nebenbei mitbehoben) |

**Nicht beanstandet und ausdrücklich positiv:** Das Modell reproduziert die
23 Python-Testvektoren im Browser fehlerfrei (Toleranz 0,5 %); LCOE- und
Dispatch-Formeln sind 1:1 portiert; alle Grenzfälle (VLh = 0, Lebensdauer = 0)
werfen kontrollierte Fehler statt NaN; `page_data.json` und `model_params.json`
sind aus den Dossiers reproduzierbar; keine Konsolenfehler; kein horizontaler
Überlauf bei 1280 px und 390 px; alle 38 Quellen-Chips lösen auf, keine toten
IDs; LCOE und LSCOE sind sauber getrennt definiert und verwendet.

---

# KRITISCH

## K1 · `installed_gw_total` zählt Gas-Backup doppelt und addiert einen dimensionslosen Anteil als GW [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `mixSystem()`, Zeilen 616–621 (alt);
spiegelbildlich `strommix/scripts/model.py`, `mix_system()`, Zeilen 740–744 (alt).
Angezeigt in der Kachel „installierte Leistung gesamt".

**Ist:** Die Summenschleife läuft über *alle* Einträge von `capacities_gw`, die
Zahlen sind und nicht auf `_gwh` enden. Darin liegen aber zwei Größen, die keine
Leistungen sind:

* `gas_backup` — wird anschließend **nochmals** über `installedTotal += gasGw`
  addiert. Sobald der Nutzer den Schalter „Gas-Backup automatisch auslegen"
  abschaltet (feste 20 GW), wird die Backup-Leistung doppelt gezählt.
* `h2_initial_fill_share` — der Startfüllstand des Saisonspeichers als Anteil
  (0…1). Bei den Presets „GES · 80 % EE + H₂" und „GES · 100 % Erneuerbare"
  steht er auf 1,0 und erscheint als **1 GW installierte Leistung**.

Messung (Playwright): Preset „GES · 80 % EE + H₂" zeigte **699 GW** statt 678 GW
(+21 GW = +3,1 %); Testfall mit festem 20-GW-Backup zeigte 492,7 statt 472,7 GW.

**Soll:** Nur echte GW-Größen summieren; `gas_backup` genau einmal, den
Füllstandsanteil gar nicht.

**Beleg:** `docs/02_modellkonzept.md` Ebene 2 Schritt 1 („Benötigte installierte
Leistung je Technologie"); die GES-Referenz nennt für ee80_h2 618 GW und für
ee100 1.162 GW installierter Leistung
(`page_data.ges.reference.scenarios`). Nach dem Fix trifft das Modell in
`validierung_modell.md` (c) genau diese Werte (618/618 GW, 1162/1162 GW) statt
619/1163 — die Korrektur ist damit unabhängig bestätigt.

**Fix:** Ausschlussliste `NON_CAPACITY_KEYS` in `whitepaper-strommix.js:626` und
dieselbe Bedingung in `scripts/model.py`. `data/test_vectors.json` ist davon nicht
betroffen (Feld nicht in den Vektoren) — neu exportiert und byteweise identisch.
`research/validierung_modell.md` neu erzeugt (zwei Zeilen geändert).

## K2 · „Noch 98 GW in vier Jahren → 19,6 GW/a" ist arithmetisch falsch [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderPartA()`, Zeile 1113 (alt) —
Fußnote unter dem PV-Balken im Chart „Zielerreichungsgrad 2030".

**Ist:** „Noch 98 GW in **vier** Jahren → **19,6 GW/a** nötig". 98 / 4 = 24,5,
nicht 19,6. Die beiden Zahlen im selben Satz widersprechen sich; ein Leser, der
nachrechnet, findet einen Faktor-1,25-Fehler.

**Soll:** Fünf Jahre (Stand Jahresende 2025 → Ziel Ende 2030): 98 / 5 = 19,6 ✓.

**Beleg:** `page_data.zielpfade.zielerreichung_anfang_2026.photovoltaik`:
`rest_gw = 98.0`, `erforderlich_gw_pro_jahr = 19.6`. Gegenprobe Wind onshore:
46,9 / 9,4 = 4,99 → ebenfalls 5 Jahre. Offshore: 19,2 / 4,3 = 4,47 → 4,5 Jahre
(Stand Jahresmitte 2026), also je Reihe konsistent — nur der Prosatext war falsch.

**Fix:** Restjahre werden jetzt aus den Daten abgeleitet
(`rest_gw / erforderlich_gw_pro_jahr`, `whitepaper-strommix.js:1135`), nicht mehr
hartcodiert.

## K3 · Kachel „fEE-Erzeugungspotenzial" widersprach den Reglern um 5–10 % [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderMixTiles()`, Zeile 1747 (alt).

**Ist:** Das Potenzial wurde als `Σ vre_potential_twh / seasonal_share_load`
gerechnet. Die fEE-Mengen des Teilzeitraums entstehen aber mit den **eigenen**
Saisonanteilen der Reihen (PV 0,4524, Wind onshore 0,4835), hochgerechnet wurde
mit dem **Last**-Saisonanteil (0,5012). Folge: systematische Untererfassung von
9,7 % bei PV und 3,5 % bei Wind.

Messung: Standardpreset zeigte **830 TWh/a**, während direkt darüber
„Aktuelle Summe: 92 %" bei 950 TWh Bedarf steht — also 873 TWh/a. Zwei Zahlen
derselben Seite, die sich um 43 TWh widersprechen. Rohwert-Gegenprobe aus
`test_vectors.json`: PV-Potenzial 128,934 TWh / 0,4524 = 285,0 TWh = 30 % × 950 ✓,
aber / 0,5012 = 257,3 TWh ✗.

**Soll:** Das Jahrespotenzial ist analytisch bestimmt: Kapazität × Volllaststunden
= Anteil × Bedarf. Keine Hochrechnung nötig, kein Teilzeitraum-Artefakt.

**Beleg:** `docs/02_modellkonzept.md` Ebene 2, Schritt 1; `model.py`
`mix_system()` Kapazitätsableitung; `page_data.profiles_meta.seasonal_share_covered`
(load 0,5012 / solar 0,4524 / wind_onshore 0,4835).

**Fix:** `whitepaper-strommix.js:1816` rechnet das Potenzial analytisch und die
Kachel trägt konsequenterweise **kein** Hochrechnungs-Label mehr (neues Feld
`noSim`); die Abregelungs-Kachel weist ihre Anteile jetzt ausdrücklich als
„im abgedeckten Zeitraum" aus, damit die beiden Kacheln nicht verwechselt werden.
Kontrolle nach Fix: 873 TWh/a bei 92 % × 950 TWh; Extremtest 3 × 120 % × 1300 TWh
= 4.680 TWh/a exakt.

---

# MITTEL

## M1 · Falsche Quellenzuordnung beim zentralen WACC-Befund [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.html:309` (Kasten „Der WACC ist der stärkste
Einzelhebel") und `whitepaper-strommix.js`, Fazit-Kernaussage 1.

**Ist:** Der Satz „Faktor 2,78" bzw. „Lebensdauer 60→80 Jahre = rund 3 %" trug
`cite('iwr-hinkley-2026')` — eine IWR-Pressemeldung über Kostensteigerungen bei
Hinkley Point C. Diese Quelle belegt den arithmetischen Befund nicht.

**Soll:** Der Befund ist reine Arithmetik der Annuitätenformel und im Dossier
`kosten_kernkraft.md` 5.3 / 8 (Satz 4) hergeleitet; die Zahlen stehen in
`page_data.wacc_sensitivity.wacc_effect_at_60y` und `lifetime_effect_at_5pct`.

**Fix:** Fehlzitat entfernt, ersetzt durch die explizite Angabe „keine
Quellenangabe, sondern Arithmetik der Annuitätenformel" mit Verweis auf Dossier
und `scripts/model.py`. Der Faktor wird jetzt aus
`wacc_effect_at_60y.factor_3pct_to_10pct` gelesen statt hartcodiert.

## M2 · Konfidenz-Badges hartcodiert und im Widerspruch zum Quellenregister [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `updateLcoe()` und Fazit-Kernaussage 2.

**Ist:** `confBadge('A')` direkt neben `cite('iwr-hinkley-2026')`. Das
Quellen-Popover derselben Fußnote zeigt jedoch **B**
(`page_data.sources[iwr-hinkley-2026].confidence = "B"`). Der Leser sieht zwei
verschiedene Konfidenzstufen für dieselbe Quelle im selben Satz.

**Soll:** Badge aus dem Quellenregister lesen.

**Beleg:** `build_page_data.py` `collect_sources()` vergibt B, weil
`fulltext_verified` fehlt; `kosten_kernkraft.md` führt den *Datenpunkt* mit A,
die *Quelle* aber ohne Volltextprüfung.

**Fix:** Neue Hilfsfunktion `srcConf(id)` (`whitepaper-strommix.js:1370`); beide
Fundstellen nutzen sie. Ebenso wurden die hartcodierten `confBadge('A')` bei
PV 2025 und beim BNetzA-Zuschlagswert durch die Datenfelder ersetzt.

## M3 · „575 h negative Preisstunden" als A-Fakt, obwohl die Dossiers sich widersprechen [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderPartA()`, Kachel 5.

**Ist:** „575 h ... (Rekord)" mit hartcodiertem `confBadge('A')`.

**Soll:** Stufe B, und beide Werte ausweisen.

**Beleg:** `ist_zustand_de.md` 1.2 nennt „≈ 575 Stunden" mit ★★ (= B);
`risiken_co2.md` 4.3 nennt für dasselbe Jahr **573** mit `[B]`. Beide Werte
stehen unaufgelöst nebeneinander in `page_data`
(`preise.negative_preisstunden['2025_gesamt'] = 575` vs.
`netz_und_systemkosten.negative_strompreise_stunden[2025].stunden = 573`).

**Fix:** Badge B; die Kachel nennt jetzt beide Werte und benennt die Differenz
als ungelöst. Beide Zahlen kommen aus `page_data`, keine im Code.

## M4 · „der einzige real vertraglich fixierte Kernkraft-Wert weltweit" — Überdehnung [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `updateLcoe()` und Fazit-Kernaussage 2.

**Ist:** Absolutaussage „einzige ... weltweit".

**Soll:** Der entscheidende Qualifier lautet „öffentlich dokumentiert".

**Beleg:** `kosten_kernkraft.md` Abschnitt Hinkley Point C: „Das ist der einzige
Referenzfall, bei dem ein realer, vertraglich zugesicherter Strompreis für
Neubau-Kernkraft **öffentlich dokumentiert** ist." Dasselbe Dossier hält in
`wacc_sensitivity.policy_observation` fest, dass Polen ebenfalls einen CfD und
Tschechien ein zinsgünstiges Staatsdarlehen hat — deren Konditionen sind nur
nicht veröffentlicht.

**Fix:** Formulierung an beiden Stellen korrigiert; der Hinweis auf Polen und
Tschechien ergänzt.

## M5 · CO₂-Faktor wird als „Direktemission" ausgegeben, ist aber ein LCA-Proxy [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js` — CO₂-Kachel in Teil C, CO₂-Slider-Hinweis
in Teil B, Limitationen-Aufzählung.

**Ist:** Drei Stellen behaupten, der CO₂-Preis wirke „nur über den **direkten**
Emissionsfaktor fossiler Erzeugung"; die CO₂-Kachel („107 Mt/a") trug den Zusatz
„nur Direktemissionen". Keine dieser Stellen war gekennzeichnet.

**Soll:** Kennzeichnung als Lücke.

**Beleg:** `page_data.gaps[emissionsfaktor_direkt]`: „Kein direkter
Verbrennungs-Emissionsfaktor in den Dossiers. Als Proxy dient die
UNECE-Lebenszyklus-Untergrenze für GuD (403 g/kWh). Vor Veröffentlichung
ersetzen." Der Wert in `model_params.technologies.gas_ccgt.params.
emission_factor_t_mwh` ist 0,403 t/MWh mit Konfidenz **C**.

**Fix:** Alle drei Stellen kennzeichnen den Proxy-Charakter, nennen die Lücken-ID
und zeigen den Wert samt Konfidenz aus den Daten.

## M6 · LCA-Wert „PV Deutschland 48 g/kWh" mit A-Badge und UNECE-Zitat [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderLimitations()`, Aufzählungspunkt
zu Lebenszyklus-Emissionen.

**Ist:** Vier LCA-Werte in einer Klammer, dahinter ein gemeinsames
`confBadge('A') + cite('unece-2022')`.

**Soll:** Der deutsche PV-Wert ist der einzige der vier, der **nicht** von der
UNECE stammt und nur Stufe C trägt.

**Beleg:** `page_data.co2_intensitaet_g_pro_kwh.technologien.pv_deutschland`:
`"stufe": "C"`, `"quelle": "Fraunhofer ISE (2025/26), Sekundaerberichterstattung"`.

**Fix:** Jeder Wert trägt jetzt sein eigenes Badge aus den Daten; der PV-Wert ist
ausdrücklich als abweichende Quelle und Stufe C ausgewiesen.

## M7 · Bias-Tabelle färbt den einzigen eindeutigen Pro-GES-Befund als Contra [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderGes()`, Zeilen 2206–2208 (alt).

**Ist:** Die Richtungsfarbe wurde per Textheuristik geraten:
`b.effekt.indexOf('spricht für') >= 0`. Die Daten enthalten aber die
ASCII-Transliteration `"spricht fuer die Studie"` — die Suche schlug fehl und die
Zeile „H₂-Round-Trip" wurde in der Contra-Farbe (Accent) gerendert, obwohl der
HTML-Untertitel darüber ausdrücklich sagt: „Zwei sprechen ausdrücklich für sie."
Zusätzlich wurden die Rohtexte ungefiltert angezeigt („Kosten UEBERschaetzt",
„spricht fuer die Studie").

**Soll:** Richtung maschinenlesbar aus den Daten; Anzeige in korrektem Deutsch.

**Beleg:** `kosten_ee_speicher.md` 1 (Befund 5) / 7.3 und `kosten_kernkraft.md` 8
(Satz 5): beides sind Befunde **zugunsten** der Studie.

**Fix:** Neues Feld `bewertung` (`pro` / `contra` / `neutral`) in
`build_page_data.py` (`ges.bias_check`), Umlaute und Halbgeviertstriche direkt in
der Quelle korrigiert; `renderGes()` färbt nach dem Datenfeld und filtert alle
Zellen durch `deAscii()`. Kontrolle nach Fix: beide Pro-Zeilen in Teal, vier
übrige korrekt.

## M8 · Gas-LCOE ohne Brennstoffkosten neben Referenzlinien „inkl. Brennstoff", ohne Kennzeichnung [BEHOBEN]

**Fundstelle:** Teil B, Chart „Stromgestehungskosten je Technologie" und
LCOE-Tabelle.

**Ist:** Gas GuD wird mit 137 €/MWh (mittel) angezeigt, direkt daneben die
FÖS-Vergleichslinien bei 230–280 €/MWh. Der Faktor-2-Abstand wirkt wie ein
Modellbefund („Gas ist viel billiger als FÖS behauptet"), ist aber eine
Datenlücke. Der Hinweis stand nur in der Gaps-Tabelle in Teil D und als
Modell-Warnung in Teil C.

**Soll:** Kennzeichnung dort, wo die Zahl steht.

**Beleg:** `page_data.gaps[gaspreis_erdgas]`; `model_params.technologies.
gas_ccgt.params.fuel_eur_mwh = null`; `validierung_modell.md` (c) Punkt 3:
„alle Szenarien mit Gas-Backup sind daher nach unten verzerrt (ausgewiesene
Untergrenze)"; `page_data.lcoe_benchmarks.gas_ccgt.de_new.note`:
„reine Erzeugungskosten je nach CO2-Preis" (FÖS-Band inkl. Brennstoff).

**Fix:** Absatz in `#lcoe-note` ergänzt, der die Gas-Werte ausdrücklich als
Untergrenze ohne Brennstoff ausweist und den Abstand zur FÖS-Linie als Lücke
statt als Befund erklärt.

## M9 · Asymmetrische Vergleichslinien bei Wind offshore [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `lcoeRefs('wind_offshore')`.

**Ist:** Von der Lazard-Spanne wurde nur `max` (154 €/MWh) gezeichnet, `min`
(97 €/MWh) nicht. Bei allen anderen Technologien werden beide Bandgrenzen gezogen.
Offshore erscheint dadurch systematisch teurer als die Datenlage hergibt; die
ebenfalls vorhandene IRENA-Referenz (74 €/MWh) fehlte ganz.

**Soll:** Beide Grenzen, wie bei allen anderen Technologien.

**Beleg:** `page_data.lcoe_benchmarks.wind_offshore.lazard_2026`
(`min: 97, max: 154`) und `.irena_europe.value = 74`.

**Fix:** Untere Lazard-Grenze und IRENA-Europa-Wert als zusätzliche Linien.

## M10 · Dokumentierte Gegenbefunde zugunsten der Kernkraft blieben ungenutzt [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.html`, Kasten „Der WACC ist der stärkste
Einzelhebel"; Fazit-Kernaussage 1.

**Ist:** Der WACC-Abschnitt zeigte ausschließlich die kostensteigernde Richtung
(„jedes europäische Neubauprojekt braucht ein staatliches
Finanzierungsinstrument"). Zwei belegte Gegenbefunde liegen in `page_data`, wurden
aber auf keiner Seite angezeigt:

* `wacc_sensitivity.iea_nea_2020.note`: „Bei 3 Prozent ist Nuklear in allen
  untersuchten Ländern die günstigste Option, bei 10 Prozent in praktisch keinem."
  (Stufe A)
* `construction_time.global_iaea_pris`: Median 6,3 Jahre, 68 % der Reaktoren
  weltweit unter 8 Jahren (Stufe A) — die Seite rechnet nur mit der westlichen
  Erfahrung (12 a Bauzeit).

**Soll:** Beide gehören in denselben Abschnitt wie der Hauptbefund — sonst liest
sich der WACC-Hebel einseitig gegen Kernkraft.

**Beleg:** `kosten_kernkraft.md` 5.2/6, Prämisse 4 der `README.md`
(„Keine Technologie wird vorab aus- oder eingeschlossen").

**Fix:** Neuer Absatz `#wacc-counterpoint` mit beiden Befunden, dazu die
Gegen-Einordnung aus `construction_time.finding` („Für eine Deutschland-Prognose
ist der Median die falsche Kennzahl"), damit beide Seiten stehen bleiben. Die
Fazit-Kernaussage 1 nennt den IEA/NEA-Befund jetzt ausdrücklich als Gegenrichtung.
Dafür wurden zwei Quellen (`iea-nea-2020`, `ritchie-construction-time`) in
`build_page_data.py` ins Quellenverzeichnis aufgenommen — sonst hätte der
Quellen-Chip stumm verschwinden können (37 → 39 Quellen).

## M11 · Uran-Abschnitt gibt den Dossier-Befund einseitig verkürzt wieder [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderPartD()`, Karte „Uran und
Anreicherung".

**Ist:** „... — das Argument ‚Kernkraft macht abhängig von Russland' verliert an
Kraft." Als unbedingte Feststellung.

**Soll:** Das Dossier formuliert bedingt und stellt drei Gegenpunkte daneben.

**Beleg:** `risiken_co2.md` 5.2, Abschnitt „Fair gegen beide Seiten": „... verliert
an Kraft, **wenn Diversifizierung tatsächlich gelingt** (Urenco, Orano bauen aus).
Umgekehrt bleibt: Russland kontrolliert weiterhin einen erheblichen Teil der
*globalen* Kapazität, und Kasachstan (24 % Natururan) liegt logistisch teilweise
in russischem Transitgebiet. Deutschland betreibt zudem keine Kernkraftwerke mehr;
für ein Wiedereinstiegsszenario wäre die Abhängigkeit neu aufzubauen."

**Fix:** Bedingung und alle drei Gegenpunkte ergänzt.

## M12 · PARTIAL-Kennzeichnung: der Limitationen-Block verschwindet bei Volljahresdaten nicht [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderLimitations()`, Block
`#lim-partial`.

**Ist:** Der Block wurde unbedingt gerendert. Test mit simuliertem
Volljahresprofil (`meta.data_completeness = "FULL"`) ergab den Text:
„`profiles_2024.json` ist als **FULL** markiert: 4416 von 4416 Stunden, **und
drei Reihen fehlen ganz**" samt vollständiger Lückenliste — ein Selbstwiderspruch
und sachlich falsch.

**Soll:** Bei Volljahresdaten gegenstandslos. Die Seite behauptet an zwei Stellen
ausdrücklich, dass die Hochrechnungs-Kennzeichnung automatisch verschwindet
(`README.md` Prozess-Log Phase 4 „Datenfluss"; letzter Absatz von `#lim-partial`
selbst).

**Beleg:** Playwright-Lauf mit Route-Interception; Ist-Verhalten: Kurz-Labels
(`.simlabel.simdata`) und die beiden Textblöcke `#limit-partial` /
`#partial-warning` schalteten korrekt um (0 Labels übrig), nur `#lim-partial`
nicht.

**Fix:** Frühe Rückgabe mit Volljahres-Text, wenn sowohl
`profilesRaw.meta.data_completeness` als auch `page_data.profiles_meta.
data_completeness` auf `FULL` stehen (`whitepaper-strommix.js:2273`). Nachgeprüft:
Der Block zeigt jetzt „Die Simulation läuft auf einem vollständigen
Jahresprofil ...".

## M13 · `model_params.json`: H₂-Speicherkosten mit `max` < `mid` [BEHOBEN]

**Fundstelle:** `strommix/scripts/consolidate_params.py` Zeilen 672–679 (alt) →
`data/model_params.json`, `technologies.h2_storage.params.storage_cost_eur_mwh_h2`.

**Ist:** `min = 19.8`, `mid = 105.0`, `max = 52.5`, `value = 105.0`. Die
Obergrenze lag **unter** dem Zentralwert. Ursache: `mid` stammt aus dem
saisonalen Fall (3,50 €/kg = 105 €/MWh), `min`/`max` aus der EWI-Zyklenspanne
(1,98–5,25 ct/kWh_H₂). Zwei unterschiedliche Sachverhalte in einem Parameterfeld.

**Soll:** Monotone Spanne. Das Modell nutzt zwar nur `value` (Anzeigewerte auf der
Seite sind daher **nicht** betroffen), aber jede Sensitivitätsrechnung über
min/max würde falsch laufen, und die Datei ist als maschinenlesbare
Parameterreferenz veröffentlicht.

**Beleg:** `kosten_ee_speicher.md` 12 `technologies.h2_cavern_storage`:
`storage_cost_ct_per_kwh_h2` = 1,98 / 3,60 / 5,25 (hohe Zyklenzahl) vs.
`storage_cost_low_cycling_eur_per_kg` = 3,50 €/kg mit der ausdrücklichen Notiz
„gilt fuer SAISONALE Speicherung — der relevante Fall in 100 %-EE-Szenarien".

**Fix:** `storage_cost_eur_mwh_h2` jetzt `min 19,8 / mid 105,0 / max 105,0` mit
begründender Notiz (kein Beleg für einen Wert über dem Saisonfall — deshalb
`max = mid`, statt einen Wert zu erfinden). Die vollständige Zyklenspanne steht
unverfälscht im neuen Feld `range_high_cycling_eur_mwh_h2`. `consolidate_params.py`
entsprechend angepasst, `model_params.json` und `page_data.json` neu erzeugt;
Testvektoren unverändert (`value` gleich geblieben).

## M14 · Fazit 2: EU-Referenzband den falschen Ländern zugeordnet [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, Fazit-Kernaussage 2.

**Ist:** „Die für Deutschland relevanten EU-Referenzen (**Polen, Tschechien,
Frankreich, UK**) liegen mit rund 7.900–13.500 €/kW systematisch dazwischen."

**Soll:** Das Band bezeichnet die aktuellen *Neubauprogramme*, nicht die genannten
Länder. Zwei Projekte aus genau diesen Ländern liegen darüber: Flamanville 3
(FR, 14.364 €/kW) und Hinkley Point C (GB, 17.264 €/kW).

**Beleg:** `kosten_kernkraft.md` 8, Satz 3 nennt das Band **ohne** Länderliste;
`page_data.nuclear_reference_projects`: Dukovany II 7.906, EPR2-Programm
7.583/10.417, Lubiatowo-Kopalino 11.968, Sizewell C 13.472 gegenüber Flamanville 3
14.364 und Hinkley Point C 17.264. `kosten_kernkraft.md` 5.4 trennt ausdrücklich
„EU-Serie" von „West-FOAK".

**Fix:** Projektnamen statt Länderliste; Flamanville 3 und Hinkley Point C
ausdrücklich als *oberhalb* des Bandes benannt. Extremwerte und Spannweitenfaktor
werden jetzt aus `nuclear_reference_projects` berechnet statt hartcodiert (Paks II
bleibt ausgeschlossen — laut Dossier „NICHT als Kostenreferenz verwenden").

## M15 · Fünfter EE-Anteilswert ohne Abgrenzungsangabe [BEHOBEN]

**Fundstelle:** `whitepaper-strommix.js`, `renderPartA()`, `#mix-sub`.

**Ist:** Der Absatz darüber sagt: „Für 2025 kursieren deshalb 54 %, 55,1 %, 55,9 %
und 56 % nebeneinander, alle korrekt." Direkt darunter erschien ein sechster Wert
„erneuerbar 292,0 TWh (**57,3 %**)" ohne Angabe der Bezugsgröße.

**Soll:** Der Wert ist der Anteil an der *Bruttostromerzeugung* — die fünfte
Abgrenzung, die im Absatz nicht genannt wird.

**Beleg:** `page_data.ist_mix.2025`: `erneuerbare_gesamt = 292,0`,
`bruttostromerzeugung_gesamt_inkl_pse = 509,3` → 57,3 %;
`ist_zustand_de.md` 0.3 zur Abgrenzungsproblematik.

**Fix:** Bezugsgröße explizit benannt und als fünfte Abgrenzung eingeordnet; die
Kernenergie-Zahl im selben Satz kommt jetzt aus den Daten statt hartcodiert.

---

# KLEIN (nur gelistet)

Reihenfolge grob nach Wirkung. Fünf davon wurden als Nebenprodukt der
MITTEL-Fixes miterledigt und sind entsprechend markiert.

| # | Fundstelle | Ist | Soll / Anmerkung |
|---|---|---|---|
| C1 | Teil B, `#chart-lcoe` | Mit eingeblendeten Vergleichslinien reicht die Achse bis **600 €/MWh**, weil die Fraunhofer-ISE-Obergrenze für Kernkraft bei 490 €/MWh liegt. Die Modellbalken (PV 59, Wind 72) schrumpfen auf ~10 % der Breite. | Achse aus den Modellwerten ableiten und Referenzlinien außerhalb des Bereichs am Rand als Pfeil markieren, oder Referenzlinien je Technologie clippen. |
| C2 | `#df-dec2024` | „Am **2024-12-11 bis 2024-12-12** stiegen die Day-Ahead-Preise …" — ISO-Rohstring in Prosa | „Am 11./12. Dezember 2024". Gleiches Muster: „Stand 2026-Jahresmitte", „Standortentscheidung 2046-2074", „Baujahre 1936-2024", „600-700 TWh" (Bindestrich statt Halbgeviertstrich). |
| C3 | `#overrun-note` | „Strukturbrüche bei **1280 und 1561** MW Blockgröße" — `Array.join()` ohne Formatierung | `fmt(v, 0)` → „1.280 und 1.561 MW". |
| C4 | `#table-df-freq` | „**oefter** als alle 3 Tage" | ASCII-Rest. *(mitbehoben: `deAscii`-Liste erweitert)* |
| C5 | Erdgas-Karte in `#tiles-supply` | „Ein **grosser** Teil …", „**ueberzeichnet** die Diversifizierung" | ASCII-Reste, Text nicht durch `deAscii()` geführt. *(mitbehoben)* |
| C6 | `#bedarf-note` | „**Gruende**: langsamerer H2-Hochlauf" | ASCII-Rest. *(mitbehoben)* |
| C7 | `#table-df-freq` | „etwa alle **10,0** Jahre" | `fmt(..., 1)` auf eine ganze Zahl; besser `0` bei ganzzahligen Werten. |
| C8 | Verifikations-Badge im Footer | Im Fehlerfall „**47 von 23** Prüfungen außerhalb der Toleranz" — mischt Einzelfeld-Abweichungen mit Vektoranzahl | *(mitbehoben: „23 Testvektoren, davon 47 Einzelwerte außerhalb der Toleranz")* |
| C9 | Preset „Ist 2025" | Hinweistext nennt „Bedarf **519** TWh", der Regler wird auf **520** gerundet | Denselben (gerundeten) Wert in beiden anzeigen. |
| C10 | Kontrast (WCAG 2.1 AA) | Links `--teal` auf `--bg-card`: **3,37 : 1** (Fließtext braucht 4,5). Betrifft alle Quellen-Links und die Kicker-Zeile. | `--teal` für Text auf ca. `#0E6E7A` abdunkeln (der bereits vorhandene `--conf-a`-Ton erreicht 4,98). |
| C11 | Kontrast | Badge `conf-C` 4,26 : 1, `.simlabel` 4,26 : 1, `--accent` auf Weiß 4,38 : 1 (Quellen-Nummern 12 px) | Knapp unter AA; Vordergrundtöne leicht abdunkeln. |
| C12 | `renderStackedBar()` | Weiße Werte-Labels in den Segmenten: auf PV-Gelb **2,17 : 1**, Wind-onshore-Grün 2,82, Band-Rosa 2,69, Gas-Orange 3,20 | Labelfarbe je Segment aus der Helligkeit ableiten (dunkle Schrift auf hellen Flächen). |
| C13 | Tooltips (`attachTip`, Dispatch-Crosshair) | Nur `mousemove`/`mouseleave` — per Tastatur und auf Touch nicht erreichbar | Fokus-/Tap-Alternative oder redundante Textausgabe. |
| C14 | `renderProgress()` | Prozentzahl steht als weiße Schrift bei `left:10px`; bei Balken unter ~6 % läge sie auf der hellen Spur | Aktuell nicht erreichbar (Minimum 36 %), aber datenabhängig. |
| C15 | Chart „Zielerreichungsgrad 2030 — Stand Anfang 2026" | Mischt Stand Jahresende 2025 (PV 117 GW, Wind on 68,1 GW) mit Stand Jahresmitte 2026 (Offshore 10,8 GW) | Stichtag je Reihe ausweisen. |
| C16 | `#table-df-def` | Spalten „Definition" und „Verwendet von" enthalten für die DWD-Zeile denselben Text | Eine der beiden Spalten streichen oder die DWD-Zeile inhaltlich differenzieren. |
| C17 | `lcoeRefs('pv_dach_gross')` | Als einzige Vergleichslinie die **Freiflächen**-Obergrenze | Eigene Dachanlagen-Referenz suchen oder die Linie weglassen. |
| C18 | Quellen-Tabelle Dunkelflaute | Die Uniper-Interessenlage („betreibt konventionelle Kraftwerke, 10-h-Schwelle statt DWD-48-h") steht nur im Quellen-Popover | In der Tabelle selbst sichtbar machen — sie trägt die Häufigkeitszahlen. |
| C19 | `#nuc-pro` | „Finnland könnte mit Onkalo **Ende** 2026 …" | Die Daten nennen nur das Jahr 2026, nicht das Quartal. |
| C20 | Wochenregler `#dp-week` | `max = floor(4416/168) − 1 = 25` → Woche 25 endet bei Stunde 4368; die letzten 48 Profilstunden (30./31.12.) sind nicht erreichbar | Restwoche zulassen oder das Fenster am Ende anschneiden. |
| C21 | Terminologie „günstig / mittel / teuer" | In Teil B werden alle drei Sätze beim **Slider**-WACC gerechnet, in Teil C bringt jeder Satz seinen **eigenen** WACC (3/5/9 %) mit. Gleiche Bezeichnung, unterschiedliche Bedeutung. | In Teil B steht der Hinweis im Chart-Untertitel, in Teil C nicht — dort ergänzen. |

**Ebenfalls nur gelistet:** Die Regel aus `README.md` („Keine Zahl landet im HTML,
die nicht aus `data/` kommt") ist nicht vollständig eingehalten. Im Fließtext
stehen weiterhin hartcodierte Zahlen, die zwar alle korrekt sind, aber bei einer
Datenaktualisierung stumm veralten würden: „2.400 h/a" (Neuanlagen-VLh, zweimal),
„215 GW / 115 GW / 30 GW / 80 %" (EEG-Ziele im HTML), „3,613 % / 10,033 %"
(CRF-Werte im HTML), „48 h" (DWD-Schwelle), „10 Stunden" (Batterie-Grenze),
„125 €/MWh / 321 €/MWh / 950 TWh" (GES-Kasten im HTML), „30–40 %"
(H₂-Round-Trip). Empfehlung für v1.0: schrittweise auf `page_data`-Felder
umstellen — bei den im Zuge dieses Reviews angefassten Stellen (WACC-Faktor,
Rechenbeispiel, Kernkraft-Extremwerte, Kernenergie-Erzeugung, Konfidenzstufen)
ist das bereits geschehen.

---

# Nachprüfung nach den Fixes

Alle Läufe am 2026-08-15 gegen `python3 -m http.server` im Repo-Root, Chromium
über Playwright (`/opt/pw-browsers/chromium-1194`).

| Prüfung | Ergebnis |
|---|---|
| Selbsttest gegen `test_vectors.json` | **23/23 bestanden**, Toleranz 0,5 % — Badge „Modell verifiziert ✓" |
| Konsole / Page-Errors | keine (einzige Meldung: blockierter Google-Fonts-Abruf, Eigenheit der Offline-Sandbox) |
| `export_test_vectors.py` nach den Modelländerungen | Datei byteweise identisch → Modellkern unverändert |
| `consolidate_params.py`, `build_page_data.py` | laufen durch, Ergebnis reproduzierbar (39 Quellen, 13 Referenzprojekte, 6 Lücken) |
| `validate_model.py` | neu erzeugt; einzige Änderung: installierte Leistung ee80_h2 619 → **618 GW**, ee100 1163 → **1162 GW** — trifft damit exakt die publizierten GES-Werte (unabhängige Bestätigung von K1) |
| Alle 5 Mix-Presets durchgeklickt | fehlerfrei; LSCOE 107 / 156 / 141 / 197 / 271 €/MWh; H₂-Mengenwarnung erscheint korrekt bei 173 TWh Bedarf gegen 30 TWh Potenzial |
| Alle 7 Technologien in Teil B durchgeklickt | fehlerfrei, Preset-Chips und Referenzprojekt-Chips reagieren |
| Extremwerte (Anteile 0 % und 120 %, Bedarf 500/1300 TWh, Speicher 0, H₂ 400 TWh, WACC 3/9 %, CO₂ 0/400, Gas fix/automatisch) | fehlerfrei, keine NaN, keine Division durch 0 |
| Grenzfälle im Modell | `crf(r, 0)` und `lcoe(flh = 0)` werfen kontrollierte Fehler; `crf(0, n) = 1/n`; `idcSurcharge(w, null) = 0` |
| Kachel „fEE-Potenzial" gegen Reglersumme | 873 TWh/a bei 92 % × 950 TWh ✓; Extremtest 3 × 120 % × 1300 TWh = 4.680 TWh/a exakt |
| Volljahres-Simulation (`data_completeness = FULL`) | alle `.simlabel.simdata` entfernt (0 übrig), `#limit-partial`, `#partial-warning` **und** `#lim-partial` schalten auf Volljahrestext um |
| Horizontaler Überlauf | keiner bei 1280 px und 390 px |
| Quellen-Chips | 38 im DOM, alle aufgelöst, keine verwaisten IDs; Tastaturbedienung (Enter öffnet Popover) funktioniert |
| Slider per Tastatur | `ArrowRight` auf `#mx-pv` verändert Wert und rechnet neu |

## Geänderte Dateien

| Datei | Grund |
|---|---|
| `whitepaper-strommix.js` | K1, K2, K3, M1–M12, M14, M15 sowie C4–C6, C8 |
| `whitepaper-strommix.html` | M1 (Fehlzitat entfernt), M10 (Anker `#wacc-counterpoint`) |
| `strommix/scripts/model.py` | K1 in der Referenzimplementierung |
| `strommix/scripts/build_page_data.py` | M7 (`bewertung` + Umlaute im Bias-Check), M10 (zwei Quellen ergänzt) |
| `strommix/scripts/consolidate_params.py` | M13 (monotone H₂-Speicherkosten-Spanne) |
| `strommix/data/page_data.json`, `strommix/data/model_params.json` | neu erzeugt aus den Skripten |
| `strommix/research/validierung_modell.md` | neu erzeugt (`validate_model.py`) |

Kein `git commit` — die Änderungen liegen im Arbeitsverzeichnis.

## Empfehlung

Aus Gutachtersicht ist v0.9 nach diesen Korrekturen **veröffentlichungsfähig als
gekennzeichneter Entwurf**. Die beiden inhaltlich stärksten Restrisiken sind
unverändert die, die das Papier selbst benennt und die kein Review beheben kann:
das Halbjahresprofil (jede Dispatch-Zahl hängt daran, besonders der
H₂-Saisonspeicher) und die fehlende Volltext-Verifikation der Primärquellen
(alle Werte der Stufen B und C). Beides ist auf der Seite sichtbar
gekennzeichnet — das ist der Grund, warum das Papier trotz dieser Lücken
tragfähig ist.
