# Lauf-Protokoll der Agenten

Je Agent: Auftrag, Modell, Start, Laufzeit, Token, Werkzeugaufrufe, Ergebnis.
Die Briefings stehen wortgleich in `briefs/`; der Startbefehl an jeden Agenten
lautet nur: „Lies `energiewende/agents/REGELN.md` und deinen Auftrag
`energiewende/agents/briefs/<Auftrag>.md` und führe ihn aus.“

## Phase 0 · Orchestrierung (Fable)

| Datum | Was |
|---|---|
| 2026-11-22 | Anlass recherchiert (9 Websuchen), R21-Erklärung und WD 5 – 3000 – 135/24 im Volltext gelesen, 16 Entscheidungen mit Michael, Projekt aufgesetzt, zehn Briefings geschrieben. |

Abgelehnte oder gescheiterte Zugriffe in Phase 0: www.bild.de (vom
Abruf-Werkzeug gesperrt; nicht umgangen, Teaser kam vom Nutzer),
denkfabrik-r21.de und www.cleanthinking.de vor der Host-Freigabe.

## Phase 1 · Recherche

| Auftrag | Modell | Start | Laufzeit | Token | Aufrufe | Ergebnis |
|---|---|---|---|---|---|---|
| P1-06 Europa | Sonnet | 2026-11-22 | 10,5 min | 232.158 | 67 | `research/06_europa.md`, 31 Parameter (9 A, 17 B, 5 C); nicht erreichbar: ENTSO-E, ACER |
| P1-08 Wasserstoff, E-Fuels, Lkw | Sonnet | 2026-11-22 | 11,9 min | 335.005 | 96 | `research/08_wasserstoff_efuels_lkw.md`, 41 Parameter (1 A, 33 B, 7 C); 18 Dokumente primär gelesen; nicht erreichbar u. a. ICCT, Fraunhofer ISI, NOW, KBA, EASA, EUR-Lex |
| P1-03 Stromdaten | Sonnet | 2026-11-22 | 12,0 min | 224.898 | 63 | `research/03_stromdaten.md`, elf Wetterjahre 2015–2025 stündlich (`data/profiles_*.json`), 17 Parameter (11 B, 6 C); nicht erreichbar: ag-energiebilanzen.de (403), renewables.ninja, Redispatch-Berichte |
| P1-10 Wirtschaftslage | Sonnet | 2026-11-22 | 12,9 min | 258.322 | 83 | `research/10_wirtschaftslage.md`, 32 Parameter (3 A, 27 B, 2 C); 30 primär gelesen; nicht erreichbar: files.ember-energy.org, Bundesbank, Sachverständigenrat, Wirtschaftsinstitute. Verfahrensabweichung laut Eigenmeldung: zwei frühe Abrufe als verkettete Befehle statt in Einzelform (erlaubte Hosts) |
| P1-07 Lieferketten | Sonnet | 2026-11-22 | 13,0 min | 297.723 | 98 | `research/07_lieferketten.md`, 54 Parameter (3 A, 38 B, 13 C); nicht erreichbar: IEA, DERA/BGR, BAFA, SolarPower Europe, Euratom Supply Agency |
| P1-04 Energiesystem | Sonnet | 2026-11-22 | 13,7 min | 391.301 | 136 | `research/04_energiesystem_bedarf.md`, 104 Parameter (13 A, 78 B, 13 C); 91 primär gelesen; nicht erreichbar: ag-energiebilanzen.de ohne „www“ (Umleitung, 403, nicht umgangen), BMWK-Langfristszenarien, dena, BDI/BCG, Sachverständigenrat für Umweltfragen |
| P1-02 Kostenstudien | Opus | 2026-11-22 | 14,9 min | 404.338 | 124 | `research/02_kostenstudien.md`, 31 Parameter (1 A, 22 B, 8 C); 20 primär gelesen; nicht erreichbar u. a. PwC (Registrierung), ifo, dena, EWI, BCG, McKinsey, Aurora, FÖS, dserver.bundestag.de |
| P1-01 R21-Behauptungen | Opus | 2026-11-22 | 15,9 min | 348.919 | 81 | `research/01_r21_behauptungen.md`, Inventar mit 170 Behauptungen, 32 Parameter (9 A, 20 B, 3 C); vier Korrekturen am Erstbefund der Orchestrierung; nicht erreichbar u. a. Quantified Carbon, EWI, DIW, ZEW, EUR-Lex |
| P1-09 Referenzpfade | Opus | 2026-11-22 | 16,0 min | 377.849 | 106 | `research/09_referenzpfade.md`, 65 Parameter (8 A, 47 B, 10 C); 38 primär gelesen; nicht erreichbar u. a. dserver.bundestag.de, Landtag BW (Radiant-Gutachten), BGR, BASE, EU-Rat, EUR-Lex |
| P1-05 Speicher, Dunkelflaute | Opus | 2026-11-22 | 19,3 min | 376.809 | 127 | `research/05_speicher_dunkelflaute.md`, 46 Parameter (11 A, 35 B); 40 primär gelesen; nicht erreichbar: data.bundesnetzagentur.de (403), duh.de, DIW, EWI, ENTSO-E, DWD |

**Summe Phase 1:** zehn Agenten (4 Opus, 6 Sonnet), 3.247.322 Token, 981
Werkzeugaufrufe, längste Laufzeit 19,3 Minuten (parallel). 453 Parameter in
zehn Dossiers.

Nach Phase 1 freigegeben (zweite Runde, 20 Hosts): siehe
`briefs/P2_gegenpruefung.md`. Die Erweiterung der Erlaubnisregeln in
`.claude/settings.json` um diese Hosts wurde von der Berechtigungsprüfung
abgelehnt und nicht umgangen; der Abruf funktioniert ohne sie. www.ifo.de
verlangt eine Browser-Prüfung und bleibt unlesbar.

## Phase 2 · Gegenprüfung

Startbefehl je Agent: „Lies `energiewende/agents/REGELN.md` und den Auftrag
`energiewende/agents/briefs/P2_gegenpruefung.md`. Dein Dossier ist Nummer
<NN> (`energiewende/research/<Datei>`). Führe die Gegenprüfung aus.“

| Auftrag | Modell | Start | Laufzeit | Token | Aufrufe | Ergebnis |
|---|---|---|---|---|---|---|
| P2 Dossier 07 Lieferketten | Opus | 2026-11-22 | 5,9 min | 204.895 | 41 | `research/pruefung/07_pruefung.md`: 46 geprüft, 39 bestätigt, 4 abweichend, 3 nicht prüfbar; gewichtigste Abweichung: Stresstest-Aufschlag +3/+10/+22 % statt +7,5/+27/+57 % |
| P2 Dossier 03 Stromdaten | Opus | 2026-11-22 | 6,6 min | 198.182 | 36 | `research/pruefung/03_pruefung.md`: 33 geprüft, 24 bestätigt (davon 4 mit schiefer Deutung), 6 abweichend; alle Kennzahlen unabhängig nachgerechnet (Abweichung höchstens 0,01 %); gewichtigste Befunde: Offshore-Tief 2023 ist überwiegend Abregelung, Dunkelflauten-Dauer hängt stark an der Definition |
| P2 Dossier 06 Europa | Opus | 2026-11-22 | 7,3 min | 230.370 | 46 | `research/pruefung/06_pruefung.md`: 31 geprüft, 27 bestätigt (5 mit korrigierter Fundstelle oder Abgrenzung), 1 abweichend (ACER), 3 nicht prüfbar; Nachrechnung stimmt auf 0,08 %; drei Kernaussagen zu stark oder schief formuliert; ERAA-Anhänge weiter nicht erreichbar |
| P2 Dossier 08 Wasserstoff, E-Fuels, Lkw | Opus | 2026-11-22 | 8,4 min | 261.256 | 49 | `research/pruefung/08_pruefung.md`: 45 geprüft, 36 bestätigt, 6 abweichend, 3 nicht prüfbar; Regler unabhängig nachgerechnet (140 TWh, 56 GW bestätigt); 16 Korrekturen, überwiegend Fundstellen und Zuordnungen; Lkw-Setzung strenger als UBA (2,65 gegen 2,35) |
| P2 Dossier 05 Speicher, Dunkelflaute | Opus | 2026-11-22 | 9,0 min | 278.010 | 64 | `research/pruefung/05_pruefung.md`: 36 geprüft, 27 bestätigt (8 davon mit niedrigerer Konfidenz), 5 abweichend, 4 nicht prüfbar; Energielücke unabhängig nachgerechnet (höchstens 1 % Abweichung); Wasserstoff-Variante zugunsten des Hauptpfads geschönt (Speicher nur für ein Ereignis ausgelegt); fehlende Gegenposition: 109-Tage-Ereignis 1995/96 |
| P2 Dossier 09 Referenzpfade | Opus | 2026-11-22 | 9,1 min | 278.340 | 74 | `research/pruefung/09_pruefung.md`: 46 geprüft, 38 bestätigt, 3 abweichend, 5 nicht prüfbar; Eigenrechnungen innerhalb ±4,4 %; Reaktivierung im Mittel zu optimistisch (Vorschlag 2,7 statt 4,1 GW, Setzung des Prüfers); fehlende Gegenposition: Radiant-Gutachten mit rund 12 GW; weiter nicht erreichbar: BGR (HTTP 400), EU-Rat (Browser-Prüfung), EUR-Lex (HTTP 202 ohne Inhalt) |
| P2 Dossier 02 Kostenstudien | Opus | 2026-11-22 | 9,8 min | 268.611 | 76 | `research/pruefung/02_pruefung.md`: 38 geprüft, 25 bestätigt, 8 abweichend, 5 nicht prüfbar; BIP-Anteile nachgerechnet (höchstens 0,2 Prozentpunkte Abweichung); zwei Zusammenfassungen zugunsten der Energiewende zu günstig (Beharrungs-Mehrkosten, ISE 2021 als „Ausreißer“); PwC-Abgrenzung jetzt über DIW 2025 belegt, Studie selbst weiter unlesbar; ifo weiter unlesbar |
| P2 Dossier 04 Energiesystem | Opus | 2026-11-22 | 10,4 min | 296.441 | 91 | `research/pruefung/04_pruefung.md`: 73 geprüft, 66 bestätigt (11 davon mit schiefer Abgrenzung), 6 abweichend, 1 nicht prüfbar; Mediane nachgerechnet (höchstens 0,1 %); Prozesswärme nach Temperatur war im eigenen Material vorhanden (63 % über 500 °C); Lkw-Anteil rund ein Drittel zu niedrig; bundeswirtschaftsministerium.de verlangt Browser-Prüfung |
