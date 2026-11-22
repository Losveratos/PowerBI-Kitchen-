# Stromdaten P1-03 · Quelle und Lizenz

Die Rohdateien (Energy-Charts-JSON, je Jahr rund 5 MB, zusammen rund 120 MB) liegen
bewusst **nicht** im Repo, sondern lokal unter `energiewende/quellen/raw/P1-03_stromdaten/`
(von Git ausgenommen). Im Repo stehen die aufbereiteten Dateien `data/profiles_<jahr>.json`,
die Kennzahlen `data/stats_wetterjahre.json`, der Abgleich `data/plausibilitaet_jahressummen.json`
sowie das Manifest `quellen/manifest_P1-03_stromdaten.json` (URL, Prüfsumme, Abrufdatum).

| Quelle | Endpunkt | Lizenz |
|---|---|---|
| Energy-Charts, Fraunhofer ISE | `https://api.energy-charts.info/public_power?country=de&start=JJJJ-01-01&end=JJJJ-12-31` | CC BY 4.0, Nennung „Energy-Charts.info“ nötig (OpenAPI-Beschreibung, abgerufen 2026-11-22) |
| Energy-Charts | `.../total_power?country=de&start=...&end=...` (inkl. Eigenverbrauch, nur Deutschland) | wie oben |
| Energy-Charts | `.../installed_power?country=de&time_step=yearly\|monthly&installation_decommission=false` | wie oben |
| SMARD, Bundesnetzagentur | `https://www.smard.de/app/chart_data/<filter>/DE/<filter>_DE_month_<unix-ms>.json` | CC BY 4.0 „Bundesnetzagentur \| SMARD.de“ (nicht erneut geprüft; Quellenangabe nach Angabe des Betreibers) |
| UBA / AGEE-Stat | Zeitreihen zur Entwicklung der erneuerbaren Energien, Stand 09/2026 (xlsx) | Nur Vergleichswerte zitiert, Datei nicht weitergegeben |

Rate-Limit der Energy-Charts-API: 2 Anfragen je Minute, Burst 4 (laut OpenAPI-Text).
Zeitstempel markieren den **Beginn** des Zeitraums; Rohdaten sind Viertelstunden in UTC-Sekunden.
Modifikation: Viertelstunden zu Stundenmitteln, Kapazitätsfaktoren berechnet. Das Skript
`scripts/build_profiles.py` erzeugt die Dateien reproduzierbar aus den Rohdateien.
