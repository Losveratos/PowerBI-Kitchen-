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

| 2026-08-30 | 6 · Monte Carlo | `scripts/monte_carlo.py` → `data/monte_carlo_reference.json`: 1.000 Ziehungen (Dreiecksverteilungen aus den min/value/max der Parameter), PRNG mulberry32 (bitidentisch zum JS-Port, Seed 20260830). **Korrelationsstruktur:** gemeinsame Faktoren je Ziehung — u_segment (Fahrzeuggröße → Batterie, Verbräuche, Produktion beider Antriebe), u_energy (Energiesystem → Strommix, Batteriefertigung stark [ρ 0,65], Kraftstoff-Vorkette bewusst schwach [ρ 0,15, Raffinerie-Strombezug ~0,05–0,175 kWh/l laut Dossier]), u_usage (Fahrprofil für beide Antriebe identisch). Drei Netz-Regionen DE/EU-27/Welt mit eigenen Pfad-Verteilungen. Ergebnis: Rucksack BEV P50 11,4 t [9,2–14,0] vs. Verbrenner 6,5 t [5,8–7,1]; Ersparnis je Fahrzeug P50 DE 38 t / EU 42 t / Welt 30 t; Verbrenner in 0 % der Ziehungen vorn. |
| 2026-08-30 | 6 · Hochrechnung | Recherche-Dossier `research/hochrechnung_quellen.md` (Subagent, 41 Quellen): Bestand DE 49,49 Mio (KBA) / EU 256 Mio (ACEA) / Welt ~1,3 Mrd; THG DE 649 Mt CO₂e (UBA 2025) / EU 2.786 Mt netto (EEA 2024) / Welt 57,7 Gt (UNEP 2024); Pkw-Sektor ~93 / 457 / 3.800 Mt. **Methodik-Entscheidung:** Für die Flotte eigene, enge Ziehung um das Flottenmittel (12.300 km/a, Umschlag 15/18/24 a) statt der Fahrer-Streuung — sonst würde der Dreiecks-Mittelwert (~15,8 Tkm) die Flotte ~25 % überschätzen. Ergebnis P50: DE **97 Mt/a** (15,0 % der THG), EU **560 Mt/a** (19,7 %), Welt **2.068 Mt/a** (3,6 % der THG, 55 % des Pkw+Vans-Sektors). Ersparnis > Pkw-Inventar (DE 105 %) ist als Auspuff-Logik-Lücke erklärt (Inventar = nur Auspuff Inland, Modell = WTW + Produktion). |
| 2026-08-30 | 6 · Seite + Verifikation | Kapitel 4 (Monte Carlo: Rucksack-Histogramme, Ersparnis-Fächer je Region, DE-Verteilung) und Kapitel 5 (Hochrechnung: %-Anteils-Chart mit Pkw-Inventar-Marker, Tabelle) in `/eauto-klimabilanz.html`; Kapitel 6–8 umnummeriert. Serienfarben mit dem dataviz-Validator geprüft (CVD ΔE 16,2, alle Checks bestanden). Live-MC im Browser: **118 ms**, Parität **21/21 Kennzahlen** gegen die Python-Referenz (Toleranz 0,5 %), Badge kombiniert mit den 11 Testvektoren. Kein Overflow bei 1280/390 px, keine JS-Fehler. |

| 2026-08-30 | 7 · 10k + Annahmen-Analyse | `n_draws` 1.000 → **10.000** (Browser: ~610 ms), Histogramme 40 Bins, Paritätstoleranz auf 10⁻⁶ verschärft (Pipeline ist bitidentisch). Neu: **Tornado-Analyse** (jede Annahme einzeln min→max, alle anderen auf Mittelwert; Metrik Ersparnis je Fahrzeug DE mit Strompfad, Ausgangspunkt 30,9 t) als Kapitel-4-Chart mit Paritätsprüfung — Ergebnis: Fahrleistung (−21/+49 t) und Nutzungsdauer dominieren, dann Verbrenner-Verbrauch; Batterie-Hebel mit Strompfad nur ±3 t. Badge jetzt 11/11 + **46/46**. |
| 2026-08-30 | 7 · Review-Runde 2 (adversarial) | MC-Review-Agent bestätigte PRNG-/Ziehungs-Parität bit-genau; Befunde eingearbeitet: „>100 % des Pkw-Inventars“ um den Haupttreiber ergänzt (Benziner-Baseline vs. realer Diesel/Hybrid/BEV-Bestand — Obergrenzen-Rechnung), Mischgewicht ≠ Korrelation korrigiert (w = 0,47 → realisierte ρ ≈ 0,65 laut Dossier-Mitte), EU-Nenner auf Brutto-THG (~3,0 Gt), Welt-Pkw-Nenner auf Pkw-only (3,0–3,3 Gt, IEA-Wert als Obergrenze), Flottenmittel-Ziehungen auch für Verbräuche, div. Kleinbefunde (dyn. Ziehungszahl, „15–24 Jahre“, CO₂-Spalte, DE-strom_start ≥ 344). |
| 2026-08-30 | 7 · Persona-Runde (analog Strommix) | Vier Persona-Reviews in `research/persona_reviews/`: **LCA-Wissenschaftlerin** (01), **Verbrenner-Verfechter** (02), **Klimaaktivistin** (03), **Datenjournalist** (04). Wichtigste eingearbeitete Befunde: **Diesel-Chip-Bug** behoben (setzte nur Faktoren, nicht den Verbrauch — Diesel jetzt 6,3 l und damit korrekt der bessere Verbrenner, −48,4 % statt fälschlich −57,6 %); „Kompaktklasse“-Anspruch durch ehrliches „Flottenmittel“-Wording ersetzt + konservative Defaults prominent erklärt („wo das Modell irrt, irrt es zulasten des E-Autos“); Kraftstoff-bleibt-fossil-Asymmetrie und UBA-Verbrauchsmix-Lücke (+10–15 %, zugunsten des E-Autos) als Limitationen; Kohlestrom-Aussage konditioniert (gilt gegen Flotten-Benziner); Variabilität ≠ Unsicherheit-Hinweis in Kapitel 4; Suffizienz-Kasten („Was dieses Modell nicht vergleicht“ — Avoid/Shift/Improve); Welt-Ersparnis mit Absolut-Anker (>3× DE-Gesamtemissionen) und Netto-Null-Einordnung; E-Fuel-Wirkungsgrad (~5× EE-Strom je km) beim TUM-Schluss; Strom-Mehrbedarf ~113 TWh/a DE beziffert; Konfidenz-Badges direkt im Hero (−41 % B / −73 % A). |

| 2026-08-30 | 7 · Persona 04 (Datenjournalist) | Review mit echtem Browser-Rendering (Desktop + 390 px, alle Charts geschossen und vermessen). Eingearbeitet: **Mobile-Fix** (SVG `min-width` 640 px — Schriften waren effektiv 4,4–5,7 px, jetzt scrollt die Chart-Box), **Tornado-Farb-Doppelbelegung** aufgelöst (neutrale Balkenfarbe — Teal/Terrakotta bleiben seitenweit E-Auto/Verbrenner vorbehalten, Richtung steckt in der Position), Sensitivitäts-Chart mit positiver Ersparnis-Achse + getöntem „Verbrenner wäre besser“-Bereich, Median-Terminologie vereinheitlicht + Laien-Erklärung („9 von 10 Ziehungen“), Kapitel-Chip-Navigation unter dem Hero, native SVG-Tooltips (`<title>`) auf Balken/Bändern der Kern-Charts, echtes Minuszeichen in Achsen. |

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
