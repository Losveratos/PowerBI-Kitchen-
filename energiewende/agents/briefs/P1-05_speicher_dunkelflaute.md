# Auftrag P1-05 · Speicher, Flexibilität und Dunkelflaute

**Modell:** Opus · **Ergebnis:** `energiewende/research/05_speicher_dunkelflaute.md`
**Regeln:** `energiewende/agents/REGELN.md`

## Ziel

Die Kernfrage von Teil 2 vorbereiten: Womit überbrückt ein System mit hohem
Wind- und Solaranteil Tage und Wochen ohne Wind und Sonne, was kostet das,
und wie belastbar ist die R21-Rechnung „1,4 Billionen Euro für Batterien“?

## Aufgaben

1. **Dunkelflaute empirisch:** Definitionen und Befunde aus der Literatur
   (Deutscher Wetterdienst, DIW/MCC 2020 — die Quelle, auf die sich das
   R21-Factsheet A beruft —, Bundesnetzagentur, Fraunhofer, Übertragungs­netz­
   betreiber, wissenschaftliche Aufsätze): Häufigkeit, Dauer, Resterzeugung
   während der Flaute, räumliche Ausdehnung über Europa. Was sagt die
   DIW/MCC-Studie wirklich zu „5 Tagen“?
2. **Factsheet A nachvollziehen** (Text in
   `energiewende/quellen/raw/P0/Erklaerung_Expertenrat_R21_2026-11.txt`):
   jede Annahme einzeln prüfen — Dauer, Verbrauch, Erzeugung null während der
   Flaute, Batterie als einzige Technik, 200.000 € je MWh, die zitierte
   Quelle „Bischof 2026“ (was ist das, was rechnet sie tatsächlich?).
   Welche Annahmen sind vertretbar, welche nicht, und was käme mit jeweils
   korrigierter Annahme heraus? Keine Polemik; zeige die Rechnung.
3. **Technologien mit Kosten und Bandbreiten (heute und 2030/2045):**
   Batterie-Großspeicher (€/kWh und €/kW, Lebensdauer, Zyklen, aktueller
   Bestand und Anschlussanfragen in Deutschland), Pumpspeicher,
   Wasserstoff-Kavernenspeicher (Potenzial in TWh, Kosten), Elektrolyseure,
   wasserstofffähige Gaskraftwerke, Gaskraftwerke mit Erdgas als Reserve,
   Biomasse flexibel, Lastverschiebung (E-Autos, Wärmepumpen, Industrie),
   Importe.
4. **Was offizielle Planungen vorsehen:** Kraftwerksstrategie der
   Bundesregierung, Versorgungssicherheits-Monitoring der Bundesnetzagentur,
   Netzentwicklungsplan, ERAA von ENTSO-E (nur soweit erreichbar): benötigte
   gesicherte Leistung, Speicherleistung und -kapazität je Zieljahr.
5. **Systemkosten jenseits der Erzeugung:** Redispatch- und
   Netzengpasskosten der letzten Jahre, Abregelung in TWh, negative
   Strompreis-Stunden, Netzentgelt-Entwicklung — jeweils Zeitreihe mit
   Quelle (Bundesnetzagentur).
6. **Gegenpositionen in beide Richtungen:** die besten Belege dafür, dass
   Langzeitspeicher teurer oder später verfügbar werden als geplant
   (Elektrolyse-Hochlauf, Kavernen, Wasserstoffkraftwerke), und die besten
   Belege dafür, dass der Bedarf kleiner ist als oft behauptet.

## Hinweise

Im Repo vorhanden und nutzbar: `strommix/research/kosten_ee_speicher.md`,
`strommix/research/risiken_co2.md`, `strommix/data/model_params.json`. Baue
darauf auf, prüfe die dort mit B und C markierten Werte jetzt am Original
nach, soweit die Hosts freigegeben sind, und melde Abweichungen.
