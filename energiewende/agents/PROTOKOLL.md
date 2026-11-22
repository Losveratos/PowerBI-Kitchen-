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
