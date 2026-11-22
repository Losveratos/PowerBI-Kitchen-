# Auftrag P1-04 · Gesamtenergiesystem: Ist-Bilanz und Bedarfspfade

**Modell:** Sonnet · **Ergebnis:** `energiewende/research/04_energiesystem_bedarf.md`
**Regeln:** `energiewende/agents/REGELN.md`

## Ziel

Die Datengrundlage für die Jahres-Energiebilanz des Modells: Wo steht
Deutschland heute je Sektor und Energieträger, und welchen Strom-,
Wasserstoff- und Brennstoffbedarf nennen die großen Szenariostudien für
2030, 2035 und 2045?

## Aufgaben

1. **Ist-Bilanz, jüngstes verfügbares Jahr** (AG Energiebilanzen,
   Umweltbundesamt, Destatis, Eurostat): Primärenergieverbrauch nach
   Energieträgern; Endenergieverbrauch nach Sektoren (Industrie, Verkehr,
   Haushalte, Gewerbe/Handel/Dienstleistungen) und Energieträgern; im
   Verkehr getrennt nach Pkw, Lkw, Bahn, Luftverkehr (inländisch und
   international vertankt), Schifffahrt; Raumwärme und Prozesswärme nach
   Temperaturniveau, soweit ausgewiesen. Alles in TWh.
2. **Treibhausgase:** Emissionen nach Sektoren laut UBA (jüngstes Jahr),
   Sektorziele des Klimaschutzgesetzes, und Schätzungen des deutschen
   CO₂-Restbudgets (Sachverständigenrat für Umweltfragen und andere) mit
   Annahmen.
3. **Bedarfspfade aus Szenariostudien:** Bruttostromverbrauch,
   Wasserstoffbedarf, Bedarf an synthetischen Kraftstoffen und Biomasse für
   2030 / 2035 / 2045 je Studie — mindestens Ariadne, Agora „Klimaneutrales
   Deutschland“, BMWK-Langfristszenarien, Netzentwicklungsplan Strom
   (Szenariorahmen 2037/2045), dena-Leitstudie, Fraunhofer ISE, BDI/BCG. Als
   Tabelle mit min / mid / max über die Studien.
4. **Umrechnungsfaktoren für das Modell,** je mit Quelle und Bandbreite:
   - Wärmepumpe: Jahresarbeitszahl im Bestand und Neubau
   - E-Pkw: kWh je 100 km real; Verbrenner: Liter je 100 km
   - Batterie-Lkw und Wasserstoff-Lkw: kWh je 100 km
   - Elektrolyse-Wirkungsgrad, Rückverstromung, Wirkungsgradkette E-Fuels
   - Endenergie-Einsparung durch Elektrifizierung je Sektor
5. **Der aktuelle Regierungspfad:** gesetzliche Ausbauziele (EEG, WindSeeG),
   Stand der Zielerreichung im jüngsten Jahr, Kraftwerksstrategie
   (Gaskraftwerke), Kohleausstieg, Wasserstoff-Kernnetz. Was hat die
   Bundesregierung 2025/2026 geändert (Monitoringbericht, Reformen)?
6. **Gegenposition:** Wo gelten die Bedarfsprognosen als zu hoch oder zu
   niedrig (tatsächlicher Stromverbrauch der letzten Jahre gegen die
   Prognosen; Deindustrialisierungs-Argument; Rechenzentren)?

## Hinweise

Erreichbar: ag-energiebilanzen.de, umweltbundesamt.de, destatis.de,
ec.europa.eu (Eurostat-API), agora-energiewende.de, ariadneprojekt.de,
netzentwicklungsplan.de, ise.fraunhofer.de, bundesnetzagentur.de.
Im Repo vorhanden und nutzbar: `strommix/research/ist_zustand_de.md`.
