# Daten P1-07 · Lizenz und Herkunft

Dateien `p107_*.csv`: aufbereitet aus Eurostat (Comext-Datensatz DS-045409, Energie-Datensätze nrg_ti_gas, nrg_ti_oil, nrg_ti_sff, nrg_ind_id), abgerufen am 22.11.2026 über die Eurostat-Dissemination-API. Lizenz: Eurostat, Wiederverwendung mit Quellenangabe (CC BY 4.0, Beschluss 2011/833/EU). Aufbereitung: `scripts/p107_build_data.py`. Rohdateien und Prüfsummen: `quellen/manifest_P1-07.json`.

Hinweise: Comext-Einfuhren sind nach Ursprungsland erfasst (Extra-EU) bzw. nach Versendungsland (Intra-EU). Die Reihe für Photovoltaik hat 2022 einen Code-Wechsel (85414090 bis 2021, 854142 und 854143 ab 2022). Die Gasreihe nrg_ti_gas für Deutschland ist vor 2023 bei den Partnern unvollständig (Summe der Partner 54 bis 86 Prozent des Totals).
