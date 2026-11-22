# Begleitdatei · Daten aus Auftrag P1-05 (Speicher und Dunkelflaute)

Stand 22.11.2026 · erzeugt von Agent P1-05 · Dossier: `research/05_speicher_dunkelflaute.md`

| Datei | Inhalt | Skript |
|---|---|---|
| `p1_05_dunkelflaute.json` | Dunkelflauten-Kennzahlen je Jahr 2015–2025 (Ereignisse unter 10 % Kapazitätsfaktor, schwächstes 5-Tage-Fenster, Hochrechnung auf Ziel-Kapazitäten 2030 als Setzung), negative Day-Ahead-Stunden DE-LU 2019–2025 | `scripts/p1_05_dunkelflaute.py` |
| `p1_05_factsheet_a.json` | Nachrechnung R21 Factsheet A mit je einer korrigierten Annahme | `scripts/p1_05_factsheet_a.py` |

## Quelle und Lizenz

- **Energy-Charts** (Fraunhofer ISE), API `api.energy-charts.info`, Endpunkte
  `public_power`, `installed_power`, `price`; abgerufen am 22.11.2026.
  Lizenz laut API-Antwort: **CC BY 4.0**; Preisdaten: „Bundesnetzagentur | SMARD.de“.
  Namensnennung: „Daten: Energy-Charts, Fraunhofer ISE; Bundesnetzagentur | SMARD.de; CC BY 4.0“.
- Rohdateien liegen nicht im Repo; URL und SHA-256 stehen in `quellen/manifest_P1-05.json`.

## Reproduzieren

```
python3 -I energiewende/scripts/p1_05_dunkelflaute.py
python3 -I energiewende/scripts/p1_05_factsheet_a.py
```

Deterministisch, kein Zufall. Laufzeit rund eine Minute.

## Grenzen

- Öffentliche Nettoerzeugung und -last; industrieller Eigenverbrauch und PV-Eigenverbrauch fehlen.
- Kapazitätsfaktor gegen monatliche installierte Leistung (PV: AC-Leistung).
- Die Hochrechnung „Ziel 2030“ ist eine **Setzung (M)**: beobachtete Kapazitätsfaktoren × gesetzliche
  Ziel-Kapazitäten (PV 215 GW, Wind an Land 115 GW, Wind auf See 30 GW), Last auf 520 TWh skaliert.
  Sie ignoriert Abschattung auf See, veränderte Lastprofile (Wärmepumpen) und Flexibilität.
- Negative Preisstunden: Stundenmittel; ab Oktober 2025 liegen Viertelstundenpreise vor.
