# Auftrag P1-08 · Wasserstoff, E-Fuels und der Lkw

**Modell:** Sonnet · **Ergebnis:** `energiewende/research/08_wasserstoff_efuels_lkw.md`
**Regeln:** `energiewende/agents/REGELN.md`

## Ziel

Teil 5 vorbereiten. Gesetzt ist: Pkw fahren elektrisch, Flugzeuge brauchen
E-Fuels. Offen und im Modell als Regler: Lkw-Anteil Batterie gegen
Wasserstoff, und der Importanteil bei Wasserstoff und E-Fuels. Gesucht sind
Mengen, Wirkungsgrade, Kosten und der daraus folgende Strombedarf — mit
Bandbreiten.

## Aufgaben

1. **Bedarf, der sich nicht direkt elektrifizieren lässt:** Kerosin
   (inländisch und international in Deutschland vertankt), Schiffskraftstoffe,
   stoffliche Nutzung in der Chemie, Stahl (Direktreduktion), Hochtemperatur-
   Prozesswärme — heutige Mengen in TWh und Szenariowerte 2030/2045.
2. **Lkw:** Bestand, Fahrleistung, Dieselverbrauch des Straßengüterverkehrs;
   Stand Batterie-Lkw gegen Brennstoffzellen-Lkw (Zulassungszahlen,
   Reichweiten, Megawatt-Laden, Hersteller-Strategien); Gesamtkosten je km
   laut Studien (ICCT, Fraunhofer ISI, NOW); Strombedarf bei 100 % Batterie
   gegen 100 % Wasserstoff für dieselbe Transportleistung.
3. **Wirkungsgradketten** mit Bandbreite und Quelle: Strom → Rad beim
   Batterie-Fahrzeug; Strom → H₂ → Brennstoffzelle → Rad; Strom → E-Fuel →
   Verbrennungsmotor oder Turbine; inklusive CO₂-Quelle (Direct Air Capture
   oder Punktquelle) für E-Fuels.
4. **Kosten:** Elektrolyse (€/kW heute und Projektion, tatsächliche
   Projektkosten gegen frühere Prognosen), Wasserstoff-Gestehungskosten in
   Deutschland gegen Importe (Pipeline aus Nordafrika, Norwegen, Iberien;
   Schiff als Ammoniak oder Methanol), E-Kerosin €/Liter heute und 2030/2045
   gegen fossiles Kerosin, CO₂-Preis, ab dem es sich rechnet.
5. **Stand der Umsetzung, ungeschönt:** Elektrolyse-Kapazität in Deutschland
   heute gegen das Ziel von 10 GW bis 2030, abgesagte und verschobene
   Projekte, Stand des Wasserstoff-Kernnetzes, Stand der Importstrategie,
   RFNBO-Quoten (ReFuelEU Aviation: Unterquoten für synthetische Kraftstoffe
   ab 2030), tatsächliche E-Fuel-Produktionsmengen weltweit.
6. **Gegenpositionen:** E-Fuels für Pkw (Argumente der Befürworter mit
   Zahlen: Bestandsflotte, Importierbarkeit) gegen die Effizienzrechnung;
   Biokraftstoffe und ihre Mengengrenzen; Wasserstoff im Gebäude; „Champagner
   der Energiewende“ gegen „Rückgrat“.
7. **Für das Modell:** je Regler-Stellung (Lkw-Anteil H₂ 0 / 50 / 100 %,
   Importanteil 0 / 50 / 100 %) den zusätzlichen deutschen Strombedarf in
   TWh und die benötigte Elektrolyse-Leistung in GW als Formel mit
   Parametern.

## Hinweise

Erreichbar: umweltbundesamt.de, ise.fraunhofer.de, agora-energiewende.de
(dort auch Agora Verkehrswende/Industrie-Studien, soweit auf diesem Host),
ariadneprojekt.de, destatis.de, bundesnetzagentur.de, ec.europa.eu.
Im Repo vorhanden: `eauto/research/parameter_quellen.md` (Pkw-Werte).
