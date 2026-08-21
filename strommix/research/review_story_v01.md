# Adversarialer Review · Scrollytelling-Story „Strommix" v0.1

> **Rolle:** kritischer Gutachter *vor* Veröffentlichung. Ziel dieses Durchgangs war
> nicht die Bestätigung, sondern das Finden von Fehlern — die Seite erscheint unter
> dem Namen des Autors, jede angreifbare Stelle fällt auf ihn zurück.
> **Prüfobjekt:** `/strommix-story.html` (v0.1), `strommix/data/story_data.json`,
> `strommix/scripts/build_story_data.py`.
> **Referenz (Wahrheitsquelle):** `strommix/research/story_claims_check.md`
> (Freigabe-Dossier), `strommix/docs/04_story_format_analyse.md`,
> `strommix/data/{page_data,model_params,monte_carlo_reference}.json`,
> `/whitepaper-strommix.html`.
> **Datum:** 2026-08-19 · **Prüfer:** Review-Pass Story v0.1

## Vorgehen

1. **Freigabe-Treue.** Jede erzählte Zahl über ihren `data-v`-Pfad nach
   `story_data.json` und von dort in den `story_data`-Block von
   `story_claims_check.md` zurückverfolgt. Anschließend das gerenderte DOM
   (`document.body.innerText` + alle `<svg text>`) gegen eine Sperrliste der
   verworfenen Werte geprüft: `10.275`, `166,9`, `203,4`, `229,4`, `316,4`,
   `14.667`, `234,0`, `286,0`, `2.116`, `5.257`, `12.388`, `121,5`,
   `800–1.200`, „kehrt sich … um", „170 Mrd.".
2. **Erzählerische Überdehnung.** Alle Akt-Enden, Kicker, Chart-Titel und
   -Untertitel, der Zwischenruf-Block und der Epilog Satz für Satz gegen die
   nüchternen Formulierungen des Dossiers (`honest_statement`,
   `robust_finding`, `statement`, Teil 3 „Neutralität") gelesen.
3. **Neutralität.** Wortwahlanalyse in beide Richtungen; Abgleich der acht
   `must_show_counterpositions` auf Vorhandensein, Platzierung und Wortlaut.
4. **Chart-Korrektheit.** Achsenskalen, Balkenhöhen und Bandgrenzen aus
   `story_data.json` nachgerechnet; Jahreszuordnung aller 15 historischen
   Punkte; Monte-Carlo-Überlappungsfeld nachgerechnet.
5. **Technik.** Chromium/Playwright (`/opt/pw-browsers/chromium`) gegen
   `python3 -m http.server` im Repo-Root: alle 20 `data-step`-Übergänge in
   beiden Breiten (1280 × 900 und 390 × 844), Konsole, Pageerrors,
   Hydrations-Lücken, automatischer viewBox-Clipping-Test und
   Text-Kollisionstest über alle SVG-Beschriftungen, Quellen-Chips inkl.
   Tastaturbedienung, Glossar-Sprünge hin und zurück, Deep-Link-Anker per
   `grep` in `whitepaper-strommix.html`, deutsche Typografie.
6. **Reproduzierbarkeit.** `build_story_data.py` vor und nach den Fixes
   ausgeführt und die Ausgabe byteweise verglichen → **deterministisch**.

## Ergebnis in Zahlen

| Schwere | Anzahl | behoben | offen |
|---|---:|---:|---:|
| **KRITISCH** | 3 | 3 | 0 |
| **MITTEL** | 10 | 10 | 0 |
| **KLEIN** | 10 | 4 | 6 |
| **Summe** | **23** | **17** | **6** |

**Was sauber war und keiner Korrektur bedurfte:**

- **Keine einzige verworfene Zahl wird als Befund erzählt.** Die beiden Treffer
  der Sperrliste (`„das Studienergebnis kehrt sich um"`, `800–1.200 €/kW`)
  stehen ausschließlich im ausdrücklich verwerfenden Kontext. Der
  Selbsttest in `build_story_data.py` (`check_rejected_not_narrated`) greift.
- **Alle acht Pflicht-Gegenpositionen sind vorhanden**, im Wortlaut des
  Dossiers gerendert, mit Konfidenzstufe und an inhaltlich passender Stelle:
  `cp_transparency` (Prolog, vor dem ersten Akt — richtig prominent),
  `cp_eu_references` + `cp_korea_both_ways` (nach Akt 2),
  `cp_construction_time` + `cp_wacc_both_ways` (nach Akt 3),
  `cp_ges_opex` + `cp_h2_physics` (nach Akt 4), `cp_ee_risks` (nach Akt 5).
- **Monte-Carlo-Überlappungsfeld korrekt:** `max(p5) = max(133,1; 131,7) = 133`,
  `min(p95) = min(189,7; 152,1) = 152` → gezeichnet und beschriftet als
  **133–152 €/MWh**, exakt wie in C9 gefordert.
- **Akt-1-Rekonstruktion korrekt:** PV 124,94 / Wind on 90,83 / Wind off 98,29 /
  Kernkraft 101,64 €/MWh gegen die Studienwerte 124,9 / 90,8 / 98,3 / 101,6 —
  max. Abweichung 0,041 %.
- **Jahreszuordnung aller 15 historischen Punkte korrekt** gegen
  `nuclear_history_timeseries.points`; Achse 1962–2050 trägt alle Perioden.
- **Alle fünf Deep-Links zeigen auf existierende Anker** (`kap-3`, `kap-4`,
  `kap-5`, `kap-6`, `kap-9`), und die im Linktext genannten Kapitelnamen
  stimmen mit den `<h2>`-Überschriften des White Papers überein.
- **Keine Pageerrors, keine Hydrations-Lücken** (kein `data-v` bleibt „–"),
  kein horizontales Seiten-Scrollen in beiden Breiten.

---

# KRITISCH

## K1 · Epilog: Faktor 2,78 auf die falsche Größe gelegt · **[BEHOBEN]**

| | |
|---|---|
| **Fundstelle** | `strommix-story.html`, Epilog, ehemals Zeile 831–835 |
| **Ist** | „Der Zinssatz allein bewegt **die Kernkraftkosten** um den Faktor **2,78** zwischen 3 und 10 Prozent — mehr als jede plausible Variation der Baukosten." |
| **Soll** | 2,78 ist der Faktor auf den **Kapitalwiedergewinnungsfaktor**, also auf den *Kapitalkostenanteil*. Die Stromkosten selbst bewegen sich im selben Intervall nur um Faktor **1,97**. |
| **Beleg** | `story_claims_check.md` C11: „Eigene CRF-Rechnung bei n = 60: Faktor **2,78** zwischen 3 % und 10 %" — ausdrücklich als CRF-Faktor. Gegenprobe aus dem eigenen Datensatz: `page_data.wacc_sensitivity.worked_example.lcoe_eur_mwh` = 105,8 €/MWh bei 3 % und 208,5 €/MWh bei 10 % → 208,5 / 105,8 = **1,97**. |

Das ist der angreifbarste Satz der ganzen Seite: Er steht im Epilog, also an
der Stelle, die am ehesten zitiert wird, er überzeichnet den zentralen Hebel
der eigenen Argumentation um rund 40 %, und er ist mit einer Zeile aus dem
eigenen Datensatz zu widerlegen.

**Fix.** `build_story_data.py` exportiert jetzt zusätzlich
`shared.nuclear_lcoe_by_wacc_pct` und `shared.nuclear_lcoe_example_assumptions`
(Ganzzahl-Prozent-Schlüssel, weil der Pfad-Resolver der Story auf `.` trennt).
Der Epilog rechnet das Beispiel nun vor — 12.000 €/kW, 7.500 h, 60 Jahre →
105,8 €/MWh bei 3 %, 208,5 €/MWh bei 10 % — und benennt 2,78 ausdrücklich als
Faktor auf den *Kapitalkostenanteil*. Der Glossareintrag WACC weist zusätzlich
darauf hin, dass die Verwechslung beider Zahlen „einer der häufigsten Fehler in
dieser Debatte" ist.

## K2 · Akt 2 / Schritt 3: Cluster-Bandbreite als Korea-Wert ausgegeben · **[BEHOBEN]**

| | |
|---|---|
| **Fundstelle** | Akt 2, Schritt 3, ehemals Zeile 472–477 |
| **Ist** | „**Korea baut für 1.870–4.950 €/kW**" — gebunden an `nuclear.clusters[0].capex_eur_kw` |
| **Soll** | `clusters[0]` heißt **„Asien / Golf (Serienbau)"** und enthält die Emirate mit. Koreas eigene Anker sind **1.867 €/kW** (APR1400 Inland) und **2.720 €/kW** (Shin Hanul 3&4); 3.153 und 4.945 sind **Barakah/VAE**. |
| **Beleg** | `story_claims_check.md` K4 und `story_data.nuclear.clusters[0].anchors`: `["APR1400 Inland 1867", "Shin Hanul 3&4 2720", "Barakah EPC 3153", "Barakah gesamt 4945"]`. |

Eine Zuschreibung, die ein sachkundiger Leser sofort findet: Die Story wirft
Korea 4.950 €/kW zu, obwohl das ein Wert der Emirate ist — und schwächt damit
ausgerechnet das Argument, das sie gegen sich selbst verwendet („billige
Kernkraft ist heute in Korea real").

**Fix.** Der Schritt nennt jetzt Koreas eigene Spanne (1.867–2.720 €/kW) und
weist die 1.870–4.950 ausdrücklich als Cluster „Asien und Golf" aus.

## K3 · Mobil (390 px): Diagrammbeschriftungen laufen aus der Zeichenfläche · **[BEHOBEN]**

| | |
|---|---|
| **Fundstelle** | CSS `@media (max-width:760px){svg text{font-size:25px} svg text.sm{font-size:21px}}` in Verbindung mit fest verdrahteten Layout-Konstanten in `buildAct2` / `buildAct3` / `buildAct5` |
| **Ist** | Playwright-Messung bei 390 px, alle Szenen: **11 Elemente außerhalb der `viewBox`** und **11 Text-Paare mit >25 % Überdeckung**. Betroffen unter anderem: `Fraunhofer ISE 2024` (x = −22), `BNetzA-Zuschläge 03/2026` (x = −85), `gute Standorte · 2.600 h` (x = −85), `BNetzA-Zuschläge 05/2026` (x = −85), `Westliches Erstprojekt (FOAK)` (x = −18), `13.500–17.264` (Rand bei 1.125 statt 1.060), `Ersatz/Repowering`; überlappend u. a. `Three Mile Island 1979` × `Eskalation begann davor`, `Planwert` × `÷ Bedarf`, `527` × Legende. |
| **Soll** | Kein Text darf aus `0 0 1060 600` herausragen oder einen anderen Text überdecken — in **beiden** Breiten. |
| **Beleg** | Reproduzierbar über `check.py` (viewBox-Test) und `overlap.py` (Kollisionstest), Logs im Scratchpad. |

Der Zeilenabstand der zweizeiligen Beschriftungen war mit 17–18 px fest
verdrahtet, während die Schrift auf schmalen Viewports auf 21–25 px hochgezogen
wird. Betroffen ist ausgerechnet Akt 2, also die Stelle, an der der
Realitäts-Check gegen die Studienannahmen stattfindet — auf dem Telefon war die
linke Beschriftungsspalte dort abgeschnitten.

**Fix.**

- Zeilenabstand wird einmalig an einem Probetext gemessen (`measureLH()`, global
  `LH`) und ersetzt alle fest verdrahteten Zweitzeilen-Offsets.
- Beschriftungsspalte in `rowScene` von 218 auf **310** verbreitert, die
  Projektspalte in Akt 2 von 348 auf **376**.
- Neuer Helfer `clampTxt()` hält Beschriftungen in der `viewBox`; die
  Cluster-Wertbeschriftung kippt an den freien linken Zeilenrand, wenn sie
  rechts nicht mehr passt.
- In Akt 5 beginnt die Achse eine Zeilenhöhe höher, damit die zweizeilige
  Achsenbeschriftung darunter Platz hat; die Plotfläche in Szene 1 startet
  tiefer, damit der höchste Balkenwert (527) nicht in die Legende läuft; die
  Legendentexte sind gekürzt (Volltext bleibt im Tooltip).
- Das Überlappungslabel in Akt 4 steht jetzt rechts neben dem Feld statt
  darüber.

**Nachtest:** 0 Elemente außerhalb der `viewBox` (außer dem bewusst
überstehenden, dekorativen `hero-svg`, `aria-hidden`, `preserveAspectRatio=slice`),
0 Text-Kollisionen — in beiden Breiten.

---

# MITTEL

## M1 · Akt 5 / Schritt 3: „Diese Rechnung ist uns wohlgesonnen" · **[BEHOBEN]**

**Ist.** „Der Plan endet bei 121,7 €/MWh für 2056. **Diese Rechnung ist uns
wohlgesonnen** — trotzdem haben wir sie geprüft."

**Soll.** Die Story kritisiert eine pro-Kernkraft-Studie und darf sich nicht
selbst als Partei der Gegenseite ausweisen. „Uns wohlgesonnen" erklärt den
Erzähler zum Nutznießer eines niedrigen Erneuerbaren-Systemkostenwerts — genau
die Parteinahme, die die Seite an anderer Stelle vermeidet.

**Beleg.** Das Dossier formuliert C17 durchweg neutral („Der Nenner ist
falsch", „Der Backup-Block ist zu klein"). Eine Interessenlage des Prüfers
kommt darin an keiner Stelle vor.

**Fix.** Neutral umformuliert: „… ein bemerkenswert niedriger Wert für ein fast
vollständig erneuerbares System. Genau deshalb haben wir ihn nachgerechnet, und
dabei einen Fehler gefunden, der die Zahl zu *klein* macht."

## M2 · Akt 4 / Schritt 4: „Wie viel Empirie will man ignorieren?" · **[BEHOBEN]**

**Ist.** Der Akt endet mit einer rhetorischen Frage, die dem Gegenüber
unterstellt, Empirie zu ignorieren. Zugleich fehlt jede Gegenposition zu den
Überschreitungsfaktoren — obwohl dieses Szenario das Kernkraft-Szenario um
+58 % (161 → 255 €/MWh) verteuert und die übrigen Pfade nur um 5–8 %.

**Soll.** Ein Szenario, das eine Technologie zehnmal härter trifft als die
anderen, braucht die Gegenrede mit im selben Absatz. Die Daten liefern sie:
`kostenueberschreitung_faktoren.technologien.kernkraft.spanne = [1,30 · 2,40]`,
d. h. das dokumentierte untere Ende liegt weit unter dem verwendeten Modus.

**Beleg.** `story_data.shared.kostenueberschreitung_faktoren`; Dossier Teil 3
U6/U7 verlangt, Befunde nicht einseitig zu erzählen.

**Fix.** Rhetorische Frage gestrichen. Neuer Schlussabsatz: „Das ist kein
Beweis, sondern ein Szenario, und es hat eine offene Flanke: Die
Kernkraft-Faktoren stammen überwiegend aus westlichen Einzelprojekten der
Vergangenheit; die dokumentierte Modellspanne reicht deshalb bis hinunter auf
**1,30**. Wer ein serielles Programm für wahrscheinlich hält, darf das untere
Ende einsetzen — nur begründen muss er es." Zusätzlich der Hinweis, dass die
anderen Pfade kaum reagieren, **weil ihre Faktoren nahe bei 1 liegen** (vorher
unerklärt).

## M3 · Epilog: CO₂-Preis als „eines der beiden stärksten Glieder" · **[BEHOBEN]**

**Ist.** „Die beiden stärksten Glieder dieser Kette sind fast immer dieselben:
der Kapitalkostensatz **und der CO₂-Preis**." Keine Zahl, kein Beleg, keine
Quelle.

**Soll.** Das Dossier quantifiziert den CO₂-Hebel — und findet ihn **klein**:
systemweit **0,4–4,5 €/MWh** bei rund 10 % Gasanteil, „eine bis zwei
Größenordnungen unter dem Kernkraft-CAPEX-Effekt". Ihn ohne Zahl auf eine Stufe
mit dem WACC zu heben, widerspricht der eigenen Recherche.

**Beleg.** `story_claims_check.md` C13 und
`story_data.ets_gap_gas_ccs.system_impact_eur_mwh_at_10pct_gas_share`.

**Fix.** Anspruch zurückgenommen („das stärkste Glied … ist der
Kapitalkostensatz") und der CO₂-Preis als *zweiter, deutlich schwächerer*
politischer Hebel eingeführt — mit der quantifizierten Lücke (0,4–4,5 €/MWh),
der ETS-1/ETS-2-Korrektur inkl. Quellen-Chip und den beiden belegten Preisen
(ETS 1 Mai 2026: 74 €/t; Modellwert 75 €/t). Damit schließt sich zugleich eine
Lücke: Der komplette Block `ets_gap_gas_ccs` war im Datensatz vorhanden, wurde
aber nirgends erzählt.

## M4 · Hero: „halb so teuer" gegen Prolog „Faktor 2,6" · **[BEHOBEN]**

**Ist.** Hero: „Ein Kernkraft-System, **halb so teuer** wie hundert Prozent
Erneuerbare?" — zwei Absätze später: „Ein Faktor von rund **2,6**."

**Soll.** 125 / 321 €/MWh entspricht Faktor 2,57, also **weniger als der
Hälfte**. Die beiden Aussagen widersprechen sich auf derselben Bildschirmseite.

**Beleg.** `shared.ges_reference.scenarios` (kostenminimum 125, ee100 321).

**Fix.** „Ein Kernkraft-System für **weniger als die Hälfte** von hundert
Prozent Erneuerbare?"

## M5 · Akt 5 / Schritt 1: „drei davon liegen unter der Realität" · **[BEHOBEN]**

**Ist.** Text sagt **drei**; das danebenstehende Diagramm zeigt **fünf** Zeilen
mit positiver Abweichung (PV +13 %, Wind an Land +9 %, Wind auf See +8 %,
Batterie +107 %, Gas +18 %) und eine negative (Strombedarf −7,5 %).

**Soll.** Text und Bild müssen dieselbe Zahl nennen — sonst ist der erste
Eindruck des Akts ein Widerspruch.

**Beleg.** `thirty_year_plan.start_2026_corrected`; die Formulierung „drei von
sechs" stammt aus der Überschrift von C14 und ist dort selbst unscharf.

**Fix.** „… und **fünf der sechs** liegen unter den belegten Ist-Werten: bei
Wind auf See nur knapp, bei den Batteriespeichern um mehr als das Doppelte."

## M6 · Konfidenz C nur im Tooltip · **[BEHOBEN]**

**Ist.** Isar 2 (Akt 3) trug nur eine gestrichelte Kontur; „Konfidenz C" und
„Abgrenzung unbekannt" standen ausschließlich im Hover-Tooltip — auf
Touch-Geräten also gar nicht. Paks II (Akt 2, ebenfalls C, `cost_scope:
"unclear"`) war überhaupt nicht markiert und sitzt mit 5.208 €/kW direkt
unterhalb der Studienlinie von 6.000 €/kW, stützt dort also optisch die
Studienannahme.

**Soll.** Dossier C4 wörtlich: „Entweder mit **sichtbarem C-Badge** und dem
Zusatz ‚Abgrenzung unbekannt', oder ganz weglassen."

**Fix.** Akt 3 setzt neben C-Punkte ein sichtbares Label „C · Abgrenzung
unbekannt". Akt 2 hängt bei Konfidenz C ein „C" an die Wertbeschriftung,
zeichnet den Punkt halbtransparent und erklärt die Markierung in der
Achsenfußzeile („C = Quelle nicht prüfbar").

## M7 · Typografie: 11 × „…" statt „…“ · **[BEHOBEN]**

**Ist.** 12 öffnende `„` (U+201E), aber nur **ein** schließendes `“` (U+201C) —
elf Zitate schlossen mit dem geraden ASCII-Anführungszeichen.

**Soll.** Deutsche Anführungszeichen `„ … “`. Das Schwesterdokument
`whitepaper-strommix.html` macht es korrekt (9 : 9) — die Story weicht also von
der eigenen Hausregel ab.

**Fix.** Alle elf Stellen korrigiert (jetzt 12 : 12). Gedankenstriche (—) und
Bis-Striche (–) waren bereits korrekt und konsistent gesetzt; Zahlenformate
durchgängig deutsch (`toLocaleString("de-DE")` bzw. Komma/Punkt im Fließtext).

## M8 · Erzählzahl hart im HTML statt aus `data/` · **[teilweise BEHOBEN]**

**Ist.** „Wir … reproduzieren die Studien-LCOE auf `±0,04 %` genau" stand als
Literal im Markup. Die JS-Selbstprüfung rechnet den Wert zwar aus und loggt ihn
(`0.041 %`), vergleicht ihn aber nicht mit dem angezeigten Text.

**Soll.** README-Regel des Projekts: „Keine Zahl landet im HTML, die nicht aus
`data/` kommt und dort per Skript aus dokumentierten Quellen erzeugt wurde."
Der Wert liegt bereits vor:
`page_data.ges.lcoe_reproduction_max_deviation_pct = 0.04`.

**Fix.** `build_story_data.py` exportiert ihn als
`shared.ges_lcoe_reproduction_max_deviation_pct`; das Markup bindet ihn.
**Offen** bleiben weitere hart geschriebene Erzählzahlen, die zwar sämtlich im
Dossier belegt sind, aber nicht über `data/` laufen: `2,8-mal` / `2,2-mal` /
„50 bis 200 Prozent" (Akt 3, Schritt 2), `3,5` (Akt 3, Schritt 3 und
SVG-Annotation), `3,2 Gigawatt` / „über 600 Gigawatt" / „51 Mrd. €" / „2,4 %"
(Akt 5, Schritt 4 und SVG). Siehe S-offen.

## M9 · OCC / EPC / FOAK ohne Erklärung · **[BEHOBEN]**

**Ist.** Die Diagrammbeschriftungen in Akt 2 lauten „EPR2-Programm · OCC · FR",
„Barakah · EPC · AE", „EPR2-Programm · +Fin. · FR", „Westliches Erstprojekt
(**FOAK**)". Aufgelöst wurden diese Kürzel ausschließlich im Hover-Tooltip.
Das Glossar hatte sechs Einträge, keiner davon zur Kostenabgrenzung — obwohl
genau sie das Thema des gesamten Akts ist.

**Soll.** Prüfkriterium „jeder Fachbegriff beim ersten Auftreten erklärt oder
ins Glossar verlinkt"; Dossier `nuclear_history_timeseries.note`: „die
Abgrenzung je Punkt einblenden".

**Fix.** Neuer, siebter Glossareintrag **„Kostenabgrenzung · OCC, EPC, FOAK"**
mit den vier Begriffen, dem Bauzins-Beispiel (EPR2: 73 vs. 100 Mrd. €) und dem
einzigen quantifizierten Serieneffekt (−32 %, OPG Darlington). Der
Beipackzettel nach Akt 2 löst die drei Kürzel jetzt im Fließtext auf und
verlinkt in das Glossar; die Glossar-Überschrift ist auf „Sieben Begriffe"
angepasst.

## M10 · Glossar WACC: Faktor ohne Bezugsgröße, Bandbreiten-Mismatch · **[BEHOBEN]**

**Ist.** „In dieser Story wird er als Bandbreite von **3 bis 9 Prozent**
geführt … Der Unterschied macht … einen Faktor 2,78 auf den Kapitalkostenanteil
aus." Der Faktor 2,78 gilt für **3 bis 10 %**, nicht für 3 bis 9 %.

**Fix.** Bezugsintervall explizit genannt, der Unterschied zwischen
Kapitalkostenanteil und fertigen Stromkosten benannt und auf das Rechenbeispiel
im Epilog verwiesen (siehe K1).

---

# KLEIN

| # | Fundstelle | Ist / Soll | Status |
|---|---|---|---|
| S1 | Akt 4, Schritt 1 | Text: „Heraus kommen wieder **vier** saubere Zahlen" — das Diagramm zeigt **fünf** Zeilen, weil `preset_order` das Referenz-Szenario „Ist 2025" enthält, das im Text nie erwähnt wird. | **[BEHOBEN]** — „… plus eine fünfte als Anker: das heutige System von 2025, mit demselben Modell gerechnet." |
| S2 | Akt 2, Schritt 2 | „Dieser Hebel fehlt in der **öffentlichen Debatte** fast vollständig" — belegt ist nur, dass er im geprüften Annahmen-Audit fehlt. | **[BEHOBEN]** — auf die belegbare Aussage zurückgeführt. |
| S3 | Akt 5, Szene 1, 390 px | Die beiden Legendeneinträge überlappten sich. | **[BEHOBEN]** — Legendentexte gekürzt, Volltext bleibt im Tooltip. |
| S4 | 9 Textstellen | Zahlen werden über **Listenindizes** adressiert (`nuclear_reference_projects[11]`, `points[14]`, `presets[1]` …). Alle Indizes sind heute korrekt, ein Umbau von `page_data.json` würde die Zuordnung aber **still** verschieben — die Story zeigte dann falsch beschriftete Zahlen ohne jede Fehlermeldung. | **[BEHOBEN]** — `assertBindings()` prüft beim Start neun Index-Zusicherungen, loggt Abweichungen und blendet einen sichtbaren Warnhinweis ein. |
| S5 | Akt 1, Szene 4 | Farbsemantik: In Akt 2/3/5 steht Rot für „teuer / nachgerechnet", Blau für „genannte Zahl". In Akt 1, Szene 4 bekommt ausgerechnet das **günstigste** Szenario (Kostenminimum, 125 €/MWh) den roten Akzent. Lesbar als Wertung. | **[OFFEN]** — Farbrolle bewusst klären (Akzent = „im Fokus" vs. Akzent = „teuer") und im Design-Kommentar festschreiben. |
| S6 | Akt 2 vs. Akt 3 | Vogtle 3&4 erscheint in Akt 2 als Punktwert **14.258 €/kW** (obere Kante der validierten Spanne) und in Akt 3 als Band **12.980–14.260**. Beides ist durch K1 des Dossiers gedeckt, der Hauptwert **13.500** taucht nirgends auf; ein Leser, der beide Charts vergleicht, bekommt keinen Hinweis. | **[OFFEN]** — entweder in Akt 2 auf 13.500 mit Spannenmarkierung umstellen oder im Tooltip die Spanne ergänzen. |
| S7 | Akt 3, Ebene `l-france` | Der deutsche Punkt Isar 2 liegt in der Frankreich-Ebene und erscheint deshalb während Schritt 3, ohne im Text vorzukommen. | **[OFFEN]** — eigene Ebene oder ein Halbsatz im Schritt. |
| S8 | Akt 3, Schritt 4 | Untertitel „Westliche Projekte **2013–2039**", die Ebene enthält aber zusätzlich die Studienannahme bei **2045**. | **[OFFEN]** — Zeitraum im Untertitel auf 2013–2045 erweitern. |
| S9 | gesamte Story | Drei freigegebene Blöcke werden nicht erzählt: `reverse_engineered_ges_capacities` (C7: Modellbasis 90,45 GW gegen 132,7 GW real 2022 und ≈ 208 GW Mitte 2026 — laut Dossier „ja, neuer Befund") und `assumption_audit_corrected` (C12: Effektgrößen statt Abzählen). `ets_gap_gas_ccs` ist mit M3 geschlossen. | **[OFFEN]** — Kandidaten für v0.2; für v0.1 vertretbar, weil die Story sich ausdrücklich als Kurzfassung des White Papers ausweist. |
| S10 | `<meta name="description">`, Akt 2 | Die Meta-Description trägt die Zahlen 125/321 als Literal (technisch nicht hydrierbar, inhaltlich korrekt). Die €/MWh-Achse der PV-/Wind-Szenen endet bei 140, obwohl der größte Wert 124,9 beträgt — rund 10 % ungenutzte Achse. | **[OFFEN]** — kosmetisch. |

---

# Nachtest nach den Korrekturen

```
python3 strommix/scripts/build_story_data.py
  → story_data: 44 Quellen, 15 historische Datenpunkte, 8 Pflicht-Gegenpositionen,
    13 Referenzprojekte, 5 Monte-Carlo-Presets
  → zweiter Lauf byteweise identisch  ✓ deterministisch
```

| Prüfung | 1280 × 900 | 390 × 844 |
|---|---|---|
| alle 20 `data-step`-Übergänge erreicht | ✓ | ✓ |
| Pageerrors | keine | keine |
| Konsole | nur `[story]`-Logs (+ blockierte Google-Fonts-Anfrage, Egress der Prüfumgebung) | dito |
| nicht hydrierte / leere `data-v` | 0 | 0 |
| Elemente außerhalb der `viewBox` | 0 (nur dekoratives `hero-svg`) | 0 (dito) |
| Text-Kollisionen in SVGs | 0 | 0 |
| horizontales Seiten-Scrollen | nein | nein |
| Quellen-Chips aufgelöst / nummeriert | 12 / 12 | 12 / 12 |
| Chip-Popover per Tastatur (Enter) | ✓ | ✓ |
| Glossar-Sprung hin (`details` öffnet) | ✓ | ✓ |
| Glossar-Sprung zurück (Textstelle wieder im Bild) | ✓ | ✓ |
| Deep-Link-Anker existieren in `whitepaper-strommix.html` | ✓ 5 / 5 | — |
| Sperrliste verworfener Zahlen im gerenderten DOM | nur im verwerfenden Kontext | dito |

**Nicht Teil dieses Durchgangs / weiterhin offen:** die sechs KLEIN-Punkte
S5–S10 sowie die in M8 genannten, weiterhin hart geschriebenen Erzählzahlen.
Kein `git commit`.
