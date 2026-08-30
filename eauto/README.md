# E-Auto-Klimabilanz · Kleines Lebenszyklus-Modell

Kleines interaktives Modell (HTML mit Simulations-Elementen) zur Frage:
**Wie viel CO₂ spart ein E-Auto gegenüber einem Verbrenner über den gesamten
Lebenszyklus — und welche Annahmen entscheiden über die Antwort?**

Anlass: Eine TUM-Studie (vorgestellt Anfang September 2026, Meta-Analyse über
19 Studien / 47 Szenarien) kommt auf **im Mittel −41 %** Lebenszyklus-Emissionen
für batterieelektrische Pkw gegenüber Verbrennern und kritisiert die
„Auspuff-Logik" der EU-Flottenregulierung (E-Auto = 0 g/km). Die ICCT-Studie
vom Juli 2025 kommt für Europa auf **−73 %**. Beide Zahlen können gleichzeitig
methodisch sauber sein — sie beruhen auf unterschiedlichen Annahmen
(Strommix statisch/dynamisch, Batterie-Fußabdruck, Lebensfahrleistung).
Genau diese Hebel macht das Modell drehbar.

## Prämissen (fix, analog Strommix-Projekt)

1. **Der Klimawandel ist real und menschengemacht; CO₂ ist der entscheidende
   Treiber** (IPCC AR6). Wird nicht neu verhandelt.
2. **Neutralität:** Jede Zahl mit Quelle und Konfidenzstufe (A/B/C),
   Bandbreiten statt Punktwerte. Weder Pro-E-Auto- noch Pro-Verbrenner-These
   wird gesetzt — das Ergebnis ist eine Funktion der Annahmen.
3. **Keine Zahl im HTML**, die nicht aus `data/` kommt und dort dokumentiert ist.
4. Studien-„Nachstellungen" (TUM-Mittel, ICCT) sind **kalibrierte
   Illustrationen** mit plausiblen Annahmen — nicht die Originalrechnungen
   der Studien (Volltexte lagen nicht vor, Egress-Sperre).

## Zielergebnis

`/eauto-klimabilanz.html` (Kitchen-Design, GitHub Pages):

- **Regulierungssicht vs. Lebenszyklus:** die „Auspuff-Logik" als Vergleich
- **Interaktives Modell:** Batteriegröße, Batterie-CO₂, Strommix
  (statisch/Pfad), Verbräuche, Kraftstoff-Vorkette, Fahrleistung, Nutzungsdauer
- **Break-even-Chart:** kumulierte Emissionen über km, Schnittpunkt
- **Bilanz-Kacheln:** t CO₂e gesamt, g/km, Reduktion in %, Break-even-km
- **Sensitivität:** Reduktion als Funktion des Strommix
- **Presets:** DE heute (statisch), DE mit Strompfad, ≈TUM-Mittel (−41 %),
  ≈ICCT Europa (−73 %), Ökostrom, Kohlestrom
- **Quellen + Limitationen**

## Ordnerstruktur

```
eauto/
├── README.md            ← diese Datei, inkl. Prozess-Log
├── research/            ← Recherche-Dossier (Zahlen, Quellen, Konfidenz)
├── data/                ← model_params.json, test_vectors.json
└── scripts/             ← model.py (Referenz), export_test_vectors.py
```

**Regel:** Das JS auf der Seite ist ein Port von `scripts/model.py`; die Seite
rechnet beim Laden die Testvektoren nach (Footer-Badge).

## Prozess-Log

| Datum | Phase | Was |
|---|---|---|
| 2026-08-30 | 0 · Setup | Struktur analog `strommix/`, Prämissen, Anlass (TUM-Studie via BILD/dts, 30.08.2026) |
| 2026-08-30 | 1 · Recherche | `research/parameter_quellen.md`: TUM-Meta-Analyse (−41 %, 19 Studien/47 Szenarien), ICCT 2025 (−73 %, Break-even ~17.000 km), UBA-Strommix 2024/2025 (363/344 g/kWh), Batterieproduktion (~55 kg CO₂e/kWh aktuell, historisch 61–146), Kraftstoff-Vorkette (+15–25 % auf TTW), KBA-Fahrleistung. Einschränkung: WebFetch für Primärdomains per Egress-Policy geblockt — Werte aus Suchindex-Mehrfachbelegen, Konfidenz A/B/C markiert. |
| 2026-08-30 | 2 · Modell | `scripts/model.py`: Produktions- + Nutzungsemissionen, linearer Strommix-Pfad, Break-even, Regulierungssicht (nur Auspuff); `export_test_vectors.py` → `data/test_vectors.json`; Presets kalibriert (≈TUM −41 %, ≈ICCT −73 %). |
| 2026-08-30 | 3 · Seite | `/eauto-klimabilanz.html`: Kitchen-Design, Inline-SVG-Charts, JS-Port + Selbsttest-Badge, Quellen mit Konfidenz-Chips, Limitationen. |
| 2026-08-30 | 4 · Verifikation | `python3 -m http.server` + Chromium/Playwright: Selbsttest-Badge **„Modell verifiziert ✓ 11/11 Testvektoren“**, alle 6 Presets durchgeklickt, Slider-Extreme (1100 g/kWh × 100 kWh, Break-even-Kachel zeigt korrekt „—“), Pfad-Toggle, Strom-/Kraftstoff-Chips. Kein horizontaler Overflow bei 1280 px und 390 px (je 0 px). Einziger Konsolenfehler: in der Sandbox geblockte Google-Fonts (kein Seitenfehler). Marker-Labels im Sensitivitäts-Chart kollisionsbewusst gemacht (DE 2024/2025 überlappten). Screenshots im Scratchpad. |
| 2026-08-30 | 5 · Review | Adversarialer Review-Agent: 1 kritischer Befund (Robust-Kasten behauptete mehr, als das eigene Modell hergibt — vom Testvektor `edge:max_batt_kohle` widerlegt; Text jetzt mit expliziten Kipp-Bedingungen), 5 mittlere (Prozentpunkt-Behauptungen nachgerechnet und korrigiert; Defaults an Dossier angeglichen bzw. Abweichung als Setzung im note-Feld dokumentiert — `prod_ice_t` 7,0 → 6,5, `batt_co2`-Default 75 begründet; Kohlestrom-Chip 950 → 830 (LCA-Zentralwert) und Zahl aus `data/` statt hartcodiert; dts/dpa-Zuordnung in Dossier + Quellenliste als uneinheitlich gekennzeichnet; TUM-Gegenposition „Defossilisierung der Bestandsflotte“ in Kapitel 4 ergänzt), 10 kleine (u. a. Doppel-Vorzeichen, Slider-Ranges an Quellspannen, Chip-Konfidenzen getauscht, Sensitivitäts-Chart-Clamping, Break-even-Kachel „ohne End-of-Life“, `label for=`, Selbsttest prüft jetzt auch g/km und Zerlegung). Mathe-Parität Python↔JS, Einheiten, XSS und Kalibrierung wurden bestätigt. Endstand Presets: **−53,3 / −63,2 / −41,2 / −72,9 / −77,0 / −20,6 %**; ≈ICCT-Break-even 16,9 Tsd. km (Studie: ~17.000). |

## Offene Punkte

- [ ] TUM-Studien-Volltext einarbeiten, sobald veröffentlicht (Vorstellung
  war für Dienstag nach dem 30.08.2026 angekündigt) — dann Preset
  „≈TUM-Mittel" gegen die echten Studienannahmen ersetzen.
- [ ] Volltext-Verifikation der Primärquellen (Egress-Sperre): UBA-PDF,
  ICCT-Report, Fraunhofer-Batterie-Studie.
- [ ] Optional: Diesel/Hybrid/PHEV als eigene Vergleichslinien (aktuell nur
  Benziner als Referenz, Diesel als Faktor-Preset).
- [ ] Verlinkung von `index.html` / `daten_wg_learn_buckets.html` beim
  Live-Gang (analog Strommix, Tag „Visual Story"/Simulator).
