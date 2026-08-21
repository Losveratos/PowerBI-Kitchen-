# Wie viel CO₂ steckt in einem Token? — KI-Energie-Simulator

> Simulator fuer den Energie- und CO₂-Fussabdruck der KI-Nutzung im Unternehmen — pro Token, pro Mitarbeiter und Jahr, und fuer die ganze Organisation. Alle Annahmen editierbar, als Min–Max-Band ausgewiesen.

- **Quelle:** https://datenwgknowledgekitchen.com/ki-co2-simulator.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `ki-co2-simulator.html` · Stand 2026-07-03 (Git-Commit-Datum der Quelldatei)
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/ki-co2-simulator.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt den Fliesstext der Seite. Interaktive Elemente (Regler, Filter, animierte Charts) sind nur in der HTML-Fassung nutzbar; die zugehoerigen Zahlen stehen hier als Tabelle.
- **Methodenstand:** 3. Juli 2026 · Sprachen: DE/EN · rein clientseitig

---
## Was das Werkzeug rechnet

Der Simulator schaetzt Energieverbrauch und CO₂-Ausstoss der KI-Nutzung einer Organisation. Er rechnet **nicht** mit Punktwerten, sondern durchgaengig mit Min–Max-Baendern: jede Eingangsgroesse ist eine Spanne, das Ergebnis ist eine Spanne. Das ist Absicht — die publizierten Messwerte fuer Inferenz-Energie unterscheiden sich um mehr als zwei Groessenordnungen.

Rechenweg: `Tokens × Energie je 1.000 Output-Tokens × PUE × Strommix-Intensitaet`. Dazu Sensitivitaetsanalyse (welcher Parameter treibt das Ergebnis), Materialitaets-Einordnung (Anteil an der Gesamtbilanz), Szenario-Vergleich, Jahresverlauf und Mehrjahres-Projektion mit Effizienz- und Wachstumsannahme.

## Modellklassen — Energie je 1.000 Output-Tokens (Wh)

| Klasse | von | bis |
|:---|---:|---:|
| Effizient (z. B. Haiku-Klasse) | 0,15 | 0,6 |
| Mittel (z. B. Sonnet-Klasse) | 0,6 | 2,5 |
| Gross (z. B. Opus-Klasse) | 2,5 | 8 |
| Reasoning / Extended Thinking | 8 | 22 |

*Die Zuordnung von Modellnamen zu Klassen ist eine Groessenordnungs-Ableitung, keine Herstellerangabe.*

## Strommix-Voreinstellungen (g CO₂e/kWh)

| Region | von | bis |
|:---|---:|---:|
| EU-Durchschnitt (~2025/26) | 180 | 280 |
| Deutschland | 280 | 400 |
| Frankreich (nuklear) | 30 | 80 |
| USA (Durchschnitt) | 300 | 450 |
| Global (Weltdurchschnitt) | 420 | 480 |
| Kohle-intensiv (z. B. PL, Teile Asiens) | 550 | 800 |
| Erneuerbar / Wasserkraft-Region | 10 | 90 |

## Standard-Szenario (Voreinstellung)

| Groesse | Wert |
|:---|---:|
| Modellklasse | Mittel (0,6–2,5 Wh je 1.000 Output-Tokens) |
| Strommix | EU-Durchschnitt (180–280 g CO₂e/kWh) |
| PUE | 1,15–1,56 |
| Output-Anteil an allen Tokens | 30 % |
| Input-/Output-Verhaeltnis | 3:1 |
| Arbeitstage je Jahr | 220 |
| CO₂-Preis (Bewertung) | 8–30 EUR/t |
| Nutzergruppen | 120 Leicht (4.000 Tokens/Tag) · 60 Mittel (20.000) · 20 Intensiv (90.000) · 1 Poweruser (250.000) |

## Anhang: Quellen & Annahmen

| Parameter | Genutzter Bereich | Quelle & Begruendung |
|:---|:---|:---|
| ⚡ Energie je 1.000 Output-Tokens (Modell-Tiers) | 0,15 – 22 Wh, je nach Modellklasse | Abgeleitet aus Googles Vollstack-Messung für einen realen Gemini-Prompt (Median: 0,24 Wh / 0,03 g CO₂e; vor 12 Monaten rund 33× höher), Mistral AI’s eigener Lebenszyklus-Wert (~1,14 g CO₂e je ~400-Token-Antwort) sowie Cross-Modell-Benchmarks wie dem ML.Energy-Leaderboard (Uni Michigan) und dem AI Energy Score (Hugging Face/Salesforce), die für lange Prompts Spannen bis über 29 Wh zeigen. Diese Werte sind pro Prompt veröffentlicht, nicht pro 1.000 Tokens — die Tool-Tiers sind daher eine Größenordnungs-Ableitung. [Google (2025)](https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference), [Google Technical Paper](https://services.google.com/fh/files/misc/measuring_the_environmental_impact_of_delivering_ai_at_google_scale.pdf), [CNaught (2026)](https://www.cnaught.com/blog/how-much-carbon-does-ai-actually-use-and-why-its-so-hard-to-find-out) |
| 🏭 PUE (Rechenzentrums-Effizienz) | 1,15 – 1,56 | Uptime Institute Global Data Center Survey 2024/2025: Branchendurchschnitt 1,56 (2024) bzw. 1,54 (2025-Erhebung); neue Großanlagen erreichen 1,3 und teils deutlich weniger. [Uptime Institute (2024)](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2024.GlobalDataCenterSurvey.Report.pdf) |
| 🔌 Strommix — EU-Durchschnitt | 180 – 280 g CO₂/kWh | Ember: EU-Durchschnitt 242 g/kWh (2023), fallend von 292 g (2022); Trend seither weiter rückläufig. [Ember via REGlobal (2024)](https://reglobal.org/coal-continues-to-be-undercut-by-new-wind-and-solar-in-eu-ember/) |
| 🌍 Strommix — Global / Deutschland / Kohle-Beispiel | Global 420–480; Deutschland 280–400; Polen (Kohle-Beispiel) 550–800 g CO₂/kWh | Ember Global Electricity Review 2026: 458 g/kWh weltweit (2025); IEA: 445 g/kWh (2024), Prognose 400 g/kWh (2027). Ember: Deutschland 371 g/kWh, Polen 662 g/kWh (jeweils 2023). [Ember (2026)](https://ember-energy.org/latest-insights/global-electricity-review-2026/electricity-demand-and-supply-trends/), [IEA (2025)](https://www.iea.org/reports/electricity-2025/emissions) |
| 🚗 Auto-Vergleichsfaktor | 150 g CO₂/km (Fahrzeugbestand) | EEA: Neuwagen EU 2025 im Schnitt 96,7 g/km (WLTP-Testwert, nur Neuzulassungen, stark EV-getrieben fallend). Der reale Fahrzeugbestand inkl. älterer Fahrzeuge und Realverbrauch liegt praxisnah spürbar höher — das Tool nutzt dafür 150 g/km als Näherung. [EEA (2026)](https://www.eea.europa.eu/en/newsroom/news/average-co2-emissions-from-new-cars-and-vans-significantly-decreased-in-2025) |
| 🛫 Flug-Vergleichsfaktor | 246 g CO₂e/km (Kurzstrecke/Inland, pro Passagier) | Our World in Data, basierend auf den offiziellen Emissionsfaktoren des UK Department for Energy Security and Net Zero: Inlandsflüge ~246 g CO₂e/Passagier-km, Kurzstrecke ~154 g/km. Das Tool nutzt den höheren Inlandsflug-Wert als griffigen Vergleichspunkt. [Our World in Data](https://ourworldindata.org/travel-carbon-footprint) |
| 📱 Smartphone-Ladung | ~8,5 g CO₂e je Ladung | Eigene Kurzrechnung: ca. 15–20 Wh Akkukapazität ÷ Ladeeffizienz × globaler Strommix-Durchschnitt (Ember, s. o.) ≈ 8–9 g CO₂e pro voller Ladung. |
| 🌳 CO₂-Bindung pro Baum | ~20 kg CO₂/Jahr (Literaturspanne: 10–25 kg) | Breit genutzte Faustregel, u. a. zitiert von Umweltinitiativen; je nach Baumart, Alter und Studie schwankt der Wert erheblich. [Reboxed / Ecologi](https://reboxed.co/blogs/outsidethebox/carbon-neutral-phones-how-planting-trees-can-offset-the-lifetime-carbon-footprint-of-your-phone) |
| 💶 Kompensationspreis (freiwilliger CO₂-Markt) | 8 – 30 €/t CO₂e (Standard-Zertifikate) | 2026-Marktdaten für den freiwilligen CO₂-Markt: durchschnittliche Zertifikatspreise ca. 8–30 €/t, mit großer Spanne je nach Projekttyp und Qualität — von REDD+/Wald-Erhalt (~6 $/t) über Aufforstung/verbessertes Waldmanagement (~15–22 $/t) bis zu technischer CO₂-Entnahme wie Biochar oder Direct Air Capture (170–500+ $/t). Diese Spanne ist bewusst konservativ für „Standard"-Zertifikate gewählt; Premium-Removal-Zertifikate liegen deutlich höher. [Sylvera (2026)](https://www.sylvera.com/blog/carbon-offset-price), [Senken (2026)](https://www.senken.io/academy/carbon-credit-price) |

## Grenzen

- Der Simulator schaetzt **Betriebsenergie der Inferenz**. Training, Herstellung der Hardware und Netzwerk-Overhead sind nicht enthalten.
- Die Energie-je-Token-Werte sind aus Pro-Prompt-Messungen abgeleitet; kein Hersteller publiziert belastbare Pro-Token-Werte je Modell.
- Alle Rechnungen laufen im Browser; es werden keine Daten an einen Server gesendet.
