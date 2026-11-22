# Begleitdatei zu den Europa-Daten (P1-06)

Aufbereitete Dateien: `europa_fluesse_jahre.json`, `europa_preise_import_export.json`, `europa_wind_korrelation.json`.
Erzeugt mit `scripts/europa_flows.py`, `scripts/europa_preise.py`, `scripts/europa_wind_korrelation.py` aus Energy-Charts-Rohdaten (nicht im Repo, Prüfsummen in `quellen/manifest_P1-06_europa.json`).

- Quelle: Energy-Charts API (api.energy-charts.info), Fraunhofer ISE. Lizenz CC BY 4.0.
- Preise: Day-Ahead-Preise, Datenherkunft Bundesnetzagentur | SMARD.de, CC BY 4.0.
- Abruf: 22.11.2026.
- Vorzeichen der Flüsse (an bekannten Jahreswerten geprüft): positiv = Import nach Deutschland, negativ = Export. Raster 15 Minuten, Einheit GW.
- Eigene Berechnung: Jahressummen, Stundenmittel für Spitzen, Preis- und Korrelationskennzahlen. Setzungen stehen im Kopf der Skripte.
