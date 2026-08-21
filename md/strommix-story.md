# Was kostet ein klimaneutrales Stromsystem?

> Visual Story: Eine Studie nennt 125 und 321 Euro je Megawattstunde. Woher kommen solche Zahlen — und wie belastbar sind sie? Eine nachgerechnete Spurensuche mit Bandbreiten statt Schlagzeilen.

- **Quelle:** https://datenwgknowledgekitchen.com/strommix-story.html
- **Markdown-Fassung:** https://datenwgknowledgekitchen.com/md/strommix-story.md
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Stand der Daten:** 2026-08-19 (Git-Commit-Datum der Quelldaten)
- **Modellstand:** v0.2c
- **Status:** Entwurf. Jede Zahl traegt eine Konfidenzstufe — A/B/C bzw. M fuer Modellsetzung. Ohne die Konfidenzstufe ist eine Zahl aus diesem Dokument nicht zitierfaehig.
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/strommix-story.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht; Zahlen bitte mit Konfidenzstufe und Stand uebernehmen.
- **Erzeugt von:** `strommix/scripts/build_md_exports.py` (generierte Datei — nicht von Hand editieren)
- **Story-Version:** v0.3 (Entwurf)
- **Geprueft gegen:** research/kosten_kernkraft.md, research/kosten_ee_speicher.md, research/ist_zustand_de.md, research/risiken_co2.md, research/review_v09.md, data/model_params.json, data/monte_carlo_reference.json, scripts/model.py

---

## Worum es geht

Die Story nimmt eine oeffentlich diskutierte Studie zum deutschen Strommix und rechnet sie nach — Schritt fuer Schritt, mit offengelegten Annahmen. Sie ist die erzaehlerische Fassung des White Papers (https://datenwgknowledgekitchen.com/whitepaper-strommix.html); die Zahlen stammen aus demselben Modell.

### Ergebnis der Faktenpruefung

| Kategorie | Anzahl Aussagen |
|:---|---:|
| bestaetigt | 7 |
| korrigiert | 11 |
| verworfen | 4 |
| Setzung (Modellannahme) | 6 |
| unverifizierbar | 3 |

### Die Kernaussage in einem Absatz

> Die beiden vorderen Pfade liegen so eng beieinander, dass schon die Wahl der Kennzahl den Sieger wechselt: Im Punktwert kostet der gasgestützte 80-Prozent-Pfad 156,8 Euro je Megawattstunde und das kernkraftgestützte Kostenminimum 159,0 - von 1.000 durchgerechneten Zukünften gehen 257 an die Kernkraft und 743 an den Gas-Pfad. Entschieden ist damit nichts. Nur vergleicht dieser Beinahe-Gleichstand 28 gegen 107 Millionen Tonnen CO2 im Jahr. Verlangt man vom Gas-Pfad dieselbe Emissionsmenge - mit Abscheidung, so wie die geprüfte Studie ihren Gas-Pfad meint -, liegt das Kernkraft-Szenario in 943 von 1.000 Zukünften vorn; nach unserer eigenen Schwelle von 950 ist auch das formal kein entschiedener Vergleich, aber die Richtung dreht sich.

**Vorbehalt (Konfidenz B):** Profile PARTIAL (H2-2024, 4416 h, hochgerechnet). Seit v0.2c hat das Übertragungsnetz einen mixunabhängigen Sockel (Setzung 0,40, Sensitivität 0,20-0,60) - diese eine Setzung bewegt den Abstand zwischen dem Kernkraft- und dem gasgestützten Pfad über die ganze Breite von -2,3 bis +4,5 EUR/MWh. Weiterhin fehlen Netzbetrieb, Redispatch und Verluste; der Netzblock der Zukunftsszenarien bleibt eine Untergrenze. Import, Export und Lastmanagement sind nicht modelliert.

---

## Die Szenarien, um die es geht

System-LSCOE in EUR/MWh bei 75 EUR/t CO2, Modell v0.2c.

| Szenario | determin. | P50 [P5–P95] | Mt CO2/a | Gas-Backup TWh/a | Gas-Spitze GW | rangfaehig |
|:---|---:|---:|---:|---:|---:|:---:|
| Ist 2025 (Referenzsystem) | 180,8 | 183 [174–192] | 136,0 | 148,1 | 58,0 | nein |
| GES - Kostenminimum | 159,0 | 165 [154–186] | 27,9 | 69,2 | 53,9 | ja |
| GES - Kostenminimum (Gas mit CCS) | 169,6 | 176 [164–197] | 8,3 | 69,2 | 53,9 | ja |
| GES - 80 % EE + Gas | 156,8 | 159 [148–171] | 106,5 | 264,4 | 137,0 | ja |
| GES - 80 % EE + Gas mit CCS | 185,0 | 189 [172–206] | 31,7 | 264,4 | 137,0 | ja |
| GES - 80 % EE + H2 | 199,5 | 200 [189–210] | 4,8 | 11,9 | 20,0 | ja |
| GES - 100 % Erneuerbare | 245,2 | 245 [228–263] | 1,3 | 3,2 | 20,0 | ja |

*Der Ist-2025-Anker ist NICHT ranking-fähig: er trägt das heutige Netzentgelt statt der Netzinvestition bis 2045 und seine Bestandsbänder ohne Kapital- und Betriebskosten. Er ist ein Größenordnungs-Bezug, kein fünfter Platz.*

---

## Verworfen: Behauptungen, die die Pruefung nicht ueberstanden haben

- **** — Ungewichtetes Mittel über fünf Projekte mit unterschiedlichen Kostenabgrenzungen, Preisbasen, Baujahren und Blockzahlen. Ohne oekonomische Bedeutung.
- **** — Stack-/Hardwarekosten, keine Systemkosten. FfE 2025 nennt für das Gesamtsystem rund 3120 EUR/kW. dena-Quelle weist gar keine Kosten aus.
- **Das GES-Ergebnis kehrt sich faktisch um** — Unsicherheitsbänder überlappen (Kostenminimum p5-p95 133-190 vs. 80%EE+Gas 132-152); Effekt beruht teilweise auf dem Opex-Artefakt; gegenüber beiden H2-Pfaden bleibt das Kernkraft-Szenario günstiger.
- **Opex = 7 % des (korrigierten) CAPEX** — Betriebskosten skalieren nicht mit den Baukosten. Bei 14667 EUR/kW ergaebe das 128 EUR/MWh reine Betriebskosten.
- **** — Meinungsblog, KI-generiertes Wiki, Blog ohne Peer Review. Für ein Papier mit wissenschaftlichem Anspruch nicht zitierfaehig.

---

## Gegenpositionen, die mitlaufen muessen

Diese Punkte sprechen gegen die eigene Schlussrichtung und gehoeren deshalb zwingend dazu — eine Analyse, die nur ihre eigenen Argumente zeigt, ist Werbung.

- **[A]** Die GES-Studie legt ihre Annahmen ungewöhnlich offen - Basisjahr, Interkonnektor-Deckelung, keine Batterien, keine Wasserstoffimporte als Standardlösung, WACC. Genau diese Transparenz macht diesen Check erst möglich.
- **[A]** Bei drei Prozent Diskontsatz ist Kernkraft in allen von IEA und NEA untersuchten Ländern die günstigste Option, bei zehn Prozent in praktisch keinem. Dieselbe Technologie, dieselben Baukosten - nur eine andere Finanzierungsannahme.
- **[A]** Der globale Median der Bauzeit liegt bei 6,3 Jahren, 68 Prozent aller Reaktoren weltweit wurden in unter acht Jahren gebaut. Für eine Deutschland-Prognose ist der Median allerdings die falsche Kennzahl: Jedes westliche Neubauprojekt der letzten 20 Jahre lag zwischen 10 und 18 Jahren.
- **[A]** Die europäischen Neubauprojekte liegen deutlich unter Hinkley Point C: EPR2 7265 bis 7583 Euro je Kilowatt Overnight, Dukovany 7906 als EPC-Vertrag, Polen 11968, Sizewell C 13472. Die GES-Annahme von 6000 Euro ist keine willkürliche Zahl - sie liegt nur knapp unter dem, was EDF selbst für ein serielles Programm ansetzt.
- **[A]** Bei den Betriebskosten hat die GES-Studie eher zu hoch als zu niedrig gerechnet. Das relativiert die Aussage, sie unterschätze Kernkraft.
- **[B]** Der Round-Trip-Wirkungsgrad der Wasserstoffkette liegt realistisch bei 30 bis 40 Prozent. Für eine Kilowattstunde rückverstromten Strom braucht es zweieinhalb bis dreieinhalb Kilowattstunden erneuerbaren Strom. Genau daraus entsteht die Überkapazität im 100-Prozent-Szenario - dieser Mechanismus ist physikalisch korrekt.
- **[B]** Korea baut günstig, weil eine Baureihe ohne Designänderungen, eine ununterbrochene Lieferkette seit den 1970er Jahren, ein Betreiber, ein Regulator und staatlich gesteuerte Finanzierung zusammenkommen. Aber auch dort wurden Shin Kori 3 und 4 drei beziehungsweise fünf Jahre später fertig, mit rund 30 Prozent Mehrkosten - und derselbe Reaktortyp kostete im Export rund das 2,7-Fache.
- **[A]** Auch der erneuerbare Pfad hat Risiken: der China-Anteil in der Photovoltaik-Lieferkette, kritische Rohstoffe für Batterien und Windkraft, die Verluste der Wasserstoffkette, saisonale Speicherung am teuren Ende der Spanne und Aufwärtsrisiken beim Netzausbau durch Rohstoffpreise, Transformatorenknappheit und Genehmigungsverzüge.

---

## Geprüfte Zahlenbloecke

### Kernkraft: Kosten, Bauzeiten, Referenzprojekte

```json
{
 "clusters": [
  {
   "anchors": [
    "APR1400 Inland 1867",
    "Shin Hanul 3&4 2720",
    "Barakah EPC 3153",
    "Barakah gesamt 4945"
   ],
   "capex_eur_kw": [
    1870,
    4950
   ],
   "caveat": "Voraussetzungen (ununterbrochene Lieferkette, ein Regulator, staatlich gesteuerte Finanzierung, niedrige Bau- und Ingenieurslöhne, eingeschränkte Drittanfechtung) in Deutschland rechtlich nicht herstellbar. Auch hier Verzögerungen: Shin Kori 3/4 3 bzw. 5 Jahre, +30 Prozent Kosten. Export-Aufschlag Faktor 2,7.",
   "confidence": "B",
   "id": "asien_golf",
   "label": "Asien / Golf (Serienbau)"
  },
  {
   "anchors": [
    "EPR2 OCC 2020er Preise 7265-7583",
    "Dukovany II EPC 7906",
    "EPR2 inkl. Finanzierung ca. 10400",
    "Lubiatowo-Kopalino 11968",
    "Sizewell C 13472"
   ],
   "capex_eur_kw": [
    7265,
    13472
   ],
   "confidence": "A",
   "id": "eu_serie",
   "label": "EU-Serie / Vertragspreise"
  },
  {
   "anchors": [
    "Vogtle 3&4 13500",
    "Flamanville 3 14364",
    "Hinkley Point C 17264 nominal / 12408 real GBP2015"
   ],
   "capex_eur_kw": [
    13500,
    17264
   ],
   "confidence": "A",
   "id": "west_foak",
   "label": "Westliches Erstprojekt (FOAK)"
  }
 ],
 "construction_years": {
  "confidence": "A",
  "max": 17,
  "mid": 12,
  "min": 8
 },
 "fuel_eur_mwh": {
  "confidence": "A",
  "max": 11,
  "mid": 8,
  "min": 6
 },
 "full_load_hours": {
  "confidence": "M",
  "max": 8000,
  "mid": 7500,
  "min": 6500
 },
 "idc_surcharge_pct": {
  "confidence": "B",
  "empirical_anchor": "EPR2 72,8 Mrd. EUR ohne -> ca. 100 Mrd. EUR mit Finanzierung = +37 Prozent",
  "max": 0.55,
  "mid": 0.33,
  "min": 0.2
 },
 "independent_benchmarks_eur_mwh": [
  {
   "confidence": "A",
   "range": [
    136,
    490
   ],
   "source": "Fraunhofer ISE, Stromgestehungskosten, Juli 2024"
  },
  {
   "confidence": "A",
   "range": [
    122,
    190
   ],
   "source": "Lazard LCOE+ v18, Juni 2025 (unsubventioniert, USA)"
  },
  {
   "confidence": "A",
   "note": "Einziger real vertraglich fixierter Neubau-Strompreis.",
   "source": "Hinkley Point C CfD, indexiert 17.01.2026",
   "value": 147
  },
  {
   "confidence": "A",
   "note": "Ueberwiegend nicht-westliche Laender, Vorab-Schaetzung.",
   "range": [
    36,
    88
   ],
   "source": "IEA/NEA 2020 bei 7 Prozent Diskontsatz"
  }
 ],
 "lcoe_recomputed_eur_mwh": {
  "confidence": "B",
  "method": "CRF(r,60), Opex 165 EUR/kW/a absolut, 7500 h, Brennstoff 8, Entsorgung 8",
  "wacc_5": {
   "10275": 110.4,
   "12000": 122.5,
   "14667": 141.3,
   "16000": 150.7,
   "17500": 161.3,
   "6000": 80.3,
   "7500": 90.8
  },
  "wacc_8": {
   "10275": 148.7,
   "12000": 167.3,
   "14667": 196.0,
   "16000": 210.4,
   "17500": 226.5,
   "6000": 102.6,
   "7500": 118.8
  }
 },
 "lead_time_before_concrete_years": {
  "confidence": "M",
  "max": 12,
  "mid": 8,
  "min": 5
 },
 "lifetime_years": 60,
 "md_values_for_contrast_only": {
  "note": "Nur zum Zeigen des Opex-Artefakts, NICHT als Ergebnis erzaehlen.",
  "wacc_5": {
   "10275": 166.9,
   "14667": 234.0,
   "6000": 101.6
  },
  "wacc_8": {
   "10275": 203.4,
   "14667": 286.0,
   "6000": 122.9
  }
 },
 "model_presets_eur_kw": {
  "erstprojekt": 17500,
  "eu_mittel": 12000,
  "eu_serie": 7500,
  "ges_annahme": 6000
 },
 "opex_eur_kw_a": {
  "confidence": "B",
  "max": 200,
  "mid": 165,
  "min": 130,
  "note": "ABSOLUT modellieren, nicht als CAPEX-Prozentsatz."
 },
 "wacc_slider": {
  "confidence": "A",
  "max": 0.09,
  "mid": 0.05,
  "min": 0.03
 },
 "waste_eur_mwh": {
  "confidence": "B",
  "max": 14,
  "mid": 8,
  "min": 5
 }
}
```

### Elektrolyse und Wasserstoff

```json
{
 "confidence": "B",
 "eu_actual_2025_eur_kw": {
  "alkali": 2075,
  "confidence": "B",
  "pem": 2196,
  "source_id": "global-hydrogen-hub-2025"
 },
 "ffe_full_system_2025_eur_kw": 3120,
 "ffe_note": "FfE Discussion Paper 07/2025: realistische Systemkosten rund 3120 EUR/kW - etwa das Zweieinhalbfache des ueblicherweise Angenommenen. Viele Studien betrachten nur die Hardware (Stack, Gleichrichter, Kompressoren) und blenden Planung, Genehmigung und Installation aus. Reale Projektentwickler-Angaben 2024: 9-13 EUR/kg statt der prognostizierten 2,50-4,50 EUR/kg bis 2030.",
 "md_claim_eur_kw": [
  800,
  1200
 ],
 "md_claim_verdict": "verworfen - Stack-/Hardwarekosten statt Systemkosten; dena-Quelle weist gar keine Kosten aus",
 "model_range_eur_kw": {
  "confidence": "B",
  "max": 2600,
  "mid": 2100,
  "min": 1200
 },
 "recommended_upper_reference_eur_kw": 3120,
 "statement": "Bei den Elektrolyseuren dreht sich der Vorwurf um: Wer 800 bis 1200 Euro je Kilowatt ansetzt, rechnet nur die Hardware. Mit Planung, Genehmigung und Installation kommt das Muenchner FfE für 2025 auf rund 3120 Euro je Kilowatt. Die GES-Studie rechnet hier also eher zu günstig als zu teuer.",
 "status": "MD-Claim verworfen, Richtung dreht sich um",
 "study_assumption_eur_kw": 1760
}
```

### ETS, Gas und CCS

```json
{
 "additional_finding": "Die Luecke trifft nicht nur die 80-Prozent-Szenarien: In unserem Dispatch braucht auch das GES-Kostenminimum-Szenario 53,9 GW Gas-Spitzenleistung.",
 "confidence": "A (ETS1/ETS2-Abgrenzung) / B (Projektion 2030, Restemissionen)",
 "correction": "Die EWI-Werte (ca. 120 EUR/t 2027, ca. 205 EUR/t 2035) stammen aus dem ETS 2 (Gebaeude, Verkehr, kleine Industrie). Der ETS 2 betrifft die Stromerzeugung NICHT - dafür gilt ETS 1. Zusätzlich startet ETS 2 nicht 2027, sondern 2028 (Rat 05.11.2025, EP 13.11.2025).",
 "cost_impact_eur_mwh_gas": {
  "at_126": {
   "default": 15.1,
   "max": 27.7,
   "min": 6.2
  },
  "at_205": {
   "default": 24.6,
   "max": 45.1,
   "min": 10.0
  },
  "at_75": {
   "default": 9.0,
   "max": 16.5,
   "min": 3.7
  }
 },
 "ets1_2040_note": "Keine belastbare Projektion - EU-Ziel für 2040 regulatorisch nicht abschliessend festgelegt. Alle 2040-Werte sind Szenario, nicht Prognose.",
 "ets1_prices_eur_t": {
  "2040": null,
  "allzeithoch_feb_2023": 100.34,
  "analystenspanne_2030": [
   80,
   147
  ],
  "konsens_2030": 126,
  "mai_2026": 74
 },
 "gas_ccs_residual_g_co2_kwh": {
  "confidence": "B",
  "default": 120,
  "max": 220,
  "min": 49
 },
 "md_claim": "ETS-Preis laut EWI > 200 EUR/t bis 2035",
 "statement": "Dass auf die Restemissionen von Gas mit CCS kein CO2-Preis gelegt wird, ist eine echte Luecke - aber eine kleine: Sie bewegt die Systemkosten um weniger als fünf Euro je Megawattstunde. Und der oft zitierte Preis von über 200 Euro je Tonne stammt aus dem ETS 2, der für Strom gar nicht gilt.",
 "status": "Richtung bestätigt, Preisquelle korrigiert, Groesse klein",
 "system_impact_eur_mwh_at_10pct_gas_share": [
  0.4,
  4.5
 ]
}
```

### CCS — was modelliert ist und was nicht

```json
{
 "backup_full_load_hours": {
  "ee80_gas": 1930,
  "kostenminimum": 1282
 },
 "confidence": "B",
 "decomposition_note": "Die Zerlegung des Aufschlags in Kapazität, Mehrbrennstoff, CCS-Kette und gesparte CO2-Kosten stammte aus dem v0.2b-Lauf und ist mit v0.2c nicht neu gerechnet worden. Sie ist deshalb aus dem Datensatz entfernt; qualitativ bleibt der Befund: Der dominante Posten ist der verdoppelte Kapitalblock, nicht die Abscheidung selbst.",
 "delta_eur_mwh": {
  "ee80_gas": 28.1,
  "kostenminimum": 10.5
 },
 "implied_abatement_cost_eur_t": {
  "ee80_gas": 357,
  "kostenminimum": 510
 },
 "note": "Ein Gaskraftwerk mit Abscheidung kostet in der Anschaffung rund das Doppelte, läuft aber nur 1.300 bis 1.900 Stunden im Jahr. Die impliziten Vermeidungskosten sind eine OBERGRENZE - und zwar für beides, für die Vermeidungskosten und für den Aufschlag selbst: Die Rechnung rüstet den GESAMTEN Backup-Park aus, auch die Blöcke mit sehr wenigen Betriebsstunden. Ein real optimiertes System würde nur die hoch ausgelasteten Blöcke ausrüsten und die Spitzenlast unabgeschieden fahren - dann fällt der Aufschlag kleiner aus, dafür bleibt mehr Restemission.",
 "residual_mt_co2_a": {
  "ee80_gas": 31.7,
  "kostenminimum": 8.3
 },
 "source": "research/modell_v02c_ergebnis.md 6.5",
 "stored_mt_co2_a": {
  "ee80_gas": 91.2,
  "kostenminimum": 23.9
 }
}
```

### CO2-Preis-Sensitivitaet

```json
{
 "confidence": "B",
 "crossover_kernkraft_vs_gas_eur_t": 101.8,
 "crossover_mc_median_eur_t": 152,
 "crossover_note": "Diese Marke gilt für den deterministischen Lauf mit den mittleren Annahmen: Darunter ist der gasgestützte Pfad günstiger, darüber das Kernkraft-Szenario. Über die 1.000 gepaarten Ziehungen wird die Median-Differenz erst bei rund 152 Euro je Tonne null. Der ETS-1-Marktpreis von 74 Euro (Mai 2026) und der Modellwert von 75 Euro liegen unter beiden Marken - beim heutigen CO2-Preis führt in dieser Rechnung der Gas-Pfad. Die Marke wandert mit dem Gaspreis und mit der Netzregel; sie ist keine Naturkonstante. Mit Abscheidung auf beiden Seiten gibt es gar keinen Kipppunkt: Dort liegt das Kernkraft-Szenario bei jedem CO2-Preis vorn.",
 "ets1_market_may_2026_eur_t": 74,
 "levels": [
  {
   "co2_eur_t": 0,
   "ee100": 245.1,
   "ee80_gas": 148.4,
   "ee80_gas_ccs": 182.5,
   "ee80_h2": 199.1,
   "ist2025": 161.2,
   "kostenminimum": 156.8,
   "kostenminimum_ccs": 168.9,
   "label": "kein CO₂-Preis"
  },
  {
   "co2_eur_t": 75,
   "ee100": 245.2,
   "ee80_gas": 156.8,
   "ee80_gas_ccs": 185.0,
   "ee80_h2": 199.5,
   "ist2025": 180.8,
   "kostenminimum": 159.0,
   "kostenminimum_ccs": 169.6,
   "label": "Modellwert (ETS-1-Marktniveau)"
  },
  {
   "co2_eur_t": 350,
   "ee100": 245.5,
   "ee80_gas": 187.7,
   "ee80_gas_ccs": 194.1,
   "ee80_h2": 200.9,
   "ist2025": 252.8,
   "kostenminimum": 167.1,
   "kostenminimum_ccs": 172.0,
   "label": "UBA-Klimakostensatz MK 3.2 (1 % Diskontierung)"
  },
  {
   "co2_eur_t": 990,
   "ee100": 246.4,
   "ee80_gas": 259.4,
   "ee80_gas_ccs": 215.5,
   "ee80_h2": 204.1,
   "ist2025": 420.2,
   "kostenminimum": 185.9,
   "kostenminimum_ccs": 177.6,
   "label": "UBA-Klimakostensatz MK 4.0 (Zentralwert)"
  }
 ],
 "method": "scripts/model.py, mix_system, Szenariensatz mittel, WACC 5 %, Netzvariante mid, Profil H2-2024; alle Parameter unverändert, variiert wird ausschließlich co2_price. Kipppunkt per Bisektion; der Umschlagpunkt über die gepaarten Ziehungen ist der CO2-Preis, bei dem die Median-Differenz null wird.",
 "model_version": "0.2c",
 "source_ids": [
  "uba-methodenkonvention",
  "ews-ets2"
 ],
 "superseded_note": "Dieselbe Marke lag im Panel-Review 05 mit Modellstand v0.1 bei rund 260 Euro je Tonne und in v0.2b bei 47,5 Euro. Der Sturz auf 47,5 kam daher, dass v0.2 dem Gas-Pfad seinen Brennstoff in Rechnung stellt und die Bauzinsen-Doppelzählung bei der Kernkraft entfernt; der Wiederanstieg auf 101,8 kommt vom Übertragungsnetz-Sockel aus v0.2c, der den Kernkraft-Pfad um 6,7 und den Gas-Pfad nur um 2,2 Euro je Megawattstunde verteuert. Beide älteren Zahlen dürfen nur als abgelöste Werte zitiert werden.",
 "superseded_v01_estimate_eur_t": 260,
 "superseded_v02b_estimate_eur_t": 47.5,
 "uba_mk32_1pct_eur_t": 350,
 "uba_mk40_central_eur_t": 990,
 "uba_note": "Der Abstand zwischen Marktpreis und Klimakostensatz ist keine Rechenfrage, sondern eine Wertentscheidung: 350 Euro je Tonne folgen einer Zeitpräferenzrate von 1 Prozent, die Werte um 990 bis 1.000 Euro gewichten heutige und künftige Generationen gleich.",
 "unit_costs": "EUR/MWh Systemkosten"
}
```

### Der Dreissig-Jahres-Plan: Startwerte korrigiert

```json
{
 "investment_check": {
  "breakdown_bn_eur": {
   "generation_storage_electrolysis": 652,
   "grid": 760
  },
  "grid_share_verdict": "M - 760 Mrd. EUR bis 2056 ist eine Extrapolation. Belegte Referenzen: IMK 651 Mrd. EUR bis 2045 (Übertragung 328 + Verteilung 323, Konfidenz A) und NEP 2037/2045 V2025 365-392 Mrd. EUR bis 2045 (nur Übertragung, Konfidenz B).",
  "md_total_bn_eur": 1412,
  "missing_replacement_capex_bn_eur": {
   "battery_phase1_120gwh_at_120": 14,
   "confidence": "B",
   "note": "Der Plan rechnet ausschliesslich Netto-Zubauten. Phase 3 heisst 'Konsolidierung & Repowering', enthält aber keinen Euro dafür. Realistische Gesamtinvestition eher 1550-1650 Mrd. EUR.",
   "pv_stock_110gw_at_420": 46,
   "sum": 208,
   "wind_offshore_10gw_at_3400": 34,
   "wind_onshore_65gw_at_1750": 114
  },
  "phase_generation_bn_eur": {
   "2026-2035": 234.8,
   "2036-2045": 226.8,
   "2046-2056": 190.3
  },
  "phase_implied_grid_bn_eur": {
   "2026-2035": 180.2,
   "2036-2045": 300.2,
   "2046-2056": 279.7
  },
  "reproduced": true
 },
 "learning_curves": {
  "battery_eur_kwh": {
   "counter_evidence": [
    {
     "claim": "Lazard LCOE+ v19 (Juli 2026): Speichersystemkosten seit 2020 um 27 Prozent GESTIEGEN; LCOS 100 MW / 4 h bei 210-292 USD/MWh. Ursachen: Zinsen, Zoelle, Lieferkettendruck, Rechenzentrumsnachfrage.",
     "confidence": "A"
    },
    {
     "claim": "Zelle/Pack ist nicht System: Faktor 2,5 bis 3 zwischen Pack-Preis und betriebsbereitem Netzspeicher in Europa. Schluesselfertige 4-h-Systeme in Europa 180-260 EUR/kWh.",
     "confidence": "B"
    }
   ],
   "supporting_evidence": [
    {
     "claim": "BNEF Dez. 2025: Pack-Preise auf Rekordtief 108 USD/kWh (minus 8 Prozent), stationaere Packs 70 USD/kWh; berechnete Lernrate rund 18 Prozent je Verdopplung",
     "confidence": "A"
    },
    {
     "claim": "IRENA 2024: Batteriespeichersysteme minus 93 Prozent seit 2010, 2024 bei 192 USD/kWh",
     "confidence": "B"
    }
   ],
   "values": [
    200,
    150,
    120
   ],
   "verdict": "M",
   "verdict_detail": "Startwert 200 EUR/kWh liegt korrekt in unserer Modellspanne. Endwert 120 EUR/kWh liegt unterhalb der heutigen Systemkosten-Untergrenze und ist reine Setzung. kosten_ee_speicher.md 6 warnt explizit vor automatischer Lernkurven-Extrapolation nach unten."
  },
  "electrolyser_eur_kw": {
   "reason": "Startwert liegt um Faktor 2,3 unter den europäischen Ist-Systemkosten (ca. 2100 EUR/kW) und um Faktor 3,5 unter der FfE-Vollkostenrechnung (3120 EUR/kW).",
   "replacement_proposal": {
    "end_2056": [
     1200,
     1400
    ],
    "start_2026": 2100,
    "verdict": "M"
   },
   "values": [
    900,
    650,
    480
   ],
   "verdict": "verworfen"
  },
  "gas_eur_kw": {
   "note": "Konsistent mit unserem Befund, dass der alte Referenzwert 800 EUR/kW für 2026 um Faktor 2-2,5 zu niedrig ist. Modellspanne 1000/1600/2200.",
   "values": [
    2200,
    2200,
    2200
   ],
   "verdict": "B"
  },
  "pv_eur_kw": {
   "caveat": "Die Degression von minus 35 Prozent über 30 Jahre ist etwas ambitionierter als die ISE-Projektion. Zusätzlich liegt der Startwert 650 EUR/kW bereits am optimistischen Ende unserer Modellspanne (600-1000, Default 750).",
   "supporting_evidence": [
    {
     "claim": "Fraunhofer ISE Juli 2024: PV-Freiflaeche 4,1-6,9 ct/kWh heute -> 3,1-5,0 ct/kWh 2045 (minus 24 bis 28 Prozent), auf Basis technologiespezifischer Lernraten",
     "confidence": "A"
    },
    {
     "claim": "ITRPV: historische Lernrate der PV-Industrie 26 Prozent je Verdopplung der kumulierten Produktion (1976-2025); zuvor 24,9 Prozent",
     "confidence": "B"
    },
    {
     "claim": "IRENA: global rund 500 USD/kW für PV im Jahr 2030 erwartet - mit ausdrücklichem Vorbehalt, dass in Europa und Nordamerika strukturell hoehere Kosten fortbestehen",
     "confidence": "B"
    }
   ],
   "values": [
    650,
    500,
    420
   ],
   "verdict": "M"
  },
  "status": "SETZUNG (M) mit teilweise belegbarer Richtung",
  "wind_offshore_eur_kw": {
   "note": "Modellspanne 2600-4500, Default 3400. Die MD-Werte liegen darin.",
   "values": [
    3700,
    3500,
    3400
   ],
   "verdict": "M"
  },
  "wind_onshore_eur_kw": {
   "note": "Plausible Setzung (ausgereifte Technologie), deckt sich mit unserem Modellwert 1790 EUR/kW.",
   "values": [
    1750,
    1750,
    1750
   ],
   "verdict": "M/B"
  }
 },
 "lscoe_2056": {
  "flh_finding": {
   "confidence": "A",
   "note": "Ein Befund ZUGUNSTEN des Plans, den das MD selbst verschenkt.",
   "statement": "Die 174-TWh-Deckungsluecke ist groesstenteils ein Artefakt der GES-Volllaststunden. Mit unseren Neuanlagen-Werten (PV 1030 h, Wind onshore 2400 h, Wind offshore 3800 h) erzeugt derselbe Anlagenpark 1038 statt 876 TWh - die Luecke schrumpft von 17 auf 1 Prozent."
  },
  "md_reconstruction": {
   "demand_twh": 1050,
   "divided_by_demand": 121.5,
   "divided_by_generation": 145.7,
   "flaw": "Das MD teilt die Gesamtkosten durch den Bedarf (1050 TWh), obwohl nur 876 TWh erzeugt werden. Die Deckungsluecke von 174 TWh (17 Prozent) wird damit implizit zum Nulltarif gedeckt.",
   "generation_twh": 876,
   "total_cost_bn_eur_a": 127.6
  },
  "md_value": 121.7,
  "our_model": {
   "caveats": "Profile PARTIAL (H2-2024, 4416 h, auf ein Jahr hochgerechnet - winterlastig); für Offshore wird ersatzweise das Onshore-Profil verwendet; Erdgas-Brennstoffkosten mit 0 angesetzt (harte Datenluecke) - der Wert ist eine UNTERGRENZE; Import/Export und Lastmanagement nicht modelliert.",
   "confidence": "B",
   "cost_components_eur_mwh_mittel": {
    "battery": 9.7,
    "electrolyser": 13.0,
    "gas_backup": 11.3,
    "h2_storage": 6.4,
    "h2_turbine": 6.5,
    "netz": 38.6,
    "pv": 25.2,
    "wind_offshore": 25.3,
    "wind_onshore": 26.7
   },
   "deviation_vs_md_eur_mwh": 41.1,
   "engine": "scripts/model.py mix_system",
   "guenstig": 106.9,
   "inputs": {
    "battery_gw": 110,
    "battery_gwh": 450,
    "co2_price_eur_t": 75,
    "demand_twh": 1050,
    "electrolyser_gw": 55,
    "gas_backup_gw": 45,
    "h2_turbine_gw": 45,
    "pv_gw": 400,
    "wind_offshore_gw": 70,
    "wind_onshore_gw": 150
   },
   "mittel": 162.8,
   "mittel_with_md_flh": 148.6,
   "teuer": 290.1
  },
  "recommended_value": {
   "confidence": "B",
   "is_lower_bound": true,
   "mid": 163,
   "range": [
    107,
    290
   ],
   "unit": "EUR/MWh"
  }
 },
 "nuclear_variant": {
  "corrected": {
   "capex_eur_kw_range": [
    12000,
    17500
   ],
   "confidence": "B",
   "investment_bn_eur": 51.2,
   "lcoe_eur_mwh_at_16000": {
    "wacc_5": 150.7,
    "wacc_8": 210.4
   },
   "our_model_delta": 2.3,
   "our_model_system_lscoe": 165.1
  },
  "counterposition": "Ein Programm mit nur zwei Blöcken ist die denkbar ungünstigste Konstruktion - genau die Konstellation ohne Serieneffekte. kosten_kernkraft.md 7.1 weist den Low-Fall (7500 EUR/kW) als 'nur erreichbar bei mindestens 6 Blöcken identischer Bauart und Turnkey-Festpreis' aus. Wer Kernkraft fair prüft, muss sie als Programm rechnen. Einziger dokumentierter Serieneffekt: OPG Darlington, minus 32 Prozent vom ersten Block zum Durchschnitt über vier Blöcke.",
  "lead_time": {
   "confidence": "A",
   "statement": "Realistischer Gesamtpfad von der politischen Entscheidung bis zum ersten kommerziellen Block: 18-25 Jahre - inklusive Aufhebung des gesetzlichen Neubauverbots, Behördenaufbau und Standortverfahren. Vergleich: Polen 6 Jahre von der Technologieentscheidung bis zum ersten Beton, Tschechien 5 Jahre von der Vergabe."
  },
  "md": {
   "capex_eur_kw": 16000,
   "delta": 7.6,
   "gw_each": 1.6,
   "investment_bn_eur": 51.2,
   "lcoe_eur_mwh": 311.1,
   "online": [
    2045,
    2052
   ],
   "reactors": 2,
   "system_lscoe": 129.3,
   "wacc": 0.08
  },
  "robust_finding": "3,2 GW auf über 600 GW Gesamtkapazität sind ein Rundungsfehler. Zwei Blöcke liefern rund 25 TWh pro Jahr bei 1050 TWh Bedarf (2,4 Prozent) - bei 51 Mrd. EUR Kapitalbindung und ohne jeden Beitrag vor 2045. Das ist ein Skalen-Argument, kein Kosten-Argument."
 },
 "start_2026_corrected": {
  "battery": {
   "confidence": "A",
   "corrected_gw": [
    18.5,
    20.0
   ],
   "corrected_gwh": [
    31.0,
    31.5
   ],
   "md_gw": 5,
   "md_gwh": 15,
   "scope": "alle Groessenklassen inkl. Heimspeicher (MaStR, H1 2026)",
   "warning": "Ein kursierender Grossspeicher-Wert von 1,2 GW / 2,4 GWh (Q2 2026) ist laut ist_zustand_de.md 2.2 implausibel niedrig und nicht ohne Pruefung verwendbar. Abgrenzung IMMER mitnennen."
  },
  "demand_twh": {
   "confidence": "A",
   "corrected_2024": 518,
   "corrected_2025_range": [
    512,
    526
   ],
   "md": 560,
   "note": "Bruttostromverbrauch. Der MD-Startwert liegt 7-9 Prozent zu hoch."
  },
  "gas_gw": {
   "confidence": "B",
   "corrected": [
    35,
    36
   ],
   "md": 30
  },
  "nuclear_gw": {
   "confidence": "A",
   "corrected": 0,
   "md": 0
  },
  "pv_gw": {
   "as_of": "2026-07",
   "confidence": "A",
   "corrected": 126.6,
   "eoy2025": 117.0,
   "md": 110
  },
  "wind_offshore_gw": {
   "as_of": "2026 Jahresmitte",
   "confidence": "A",
   "corrected": 10.8,
   "eoy2025": 9.6,
   "md": 10
  },
  "wind_onshore_gw": {
   "as_of": "2026-07",
   "confidence": "A",
   "corrected": 71.0,
   "eoy2025": 68.1,
   "md": 65
  }
 }
}
```

### Die Klimapraemisse

```json
{
 "confidence": "A",
 "confidence_note": "Substanz Konfidenz A. Der Wortlaut der Zitate ist aus Suchindex-Auszügen rekonstruiert, das PDF war in dieser Arbeitsumgebung nicht abrufbar (Konfidenz B für die wörtliche Fassung).",
 "grenze": "Dieses Modell vergleicht Endzustände, keine Transformationspfade. Kumulative Emissionen — nach AR6 die klimarelevante Größe — sind darin nicht bilanziert.",
 "k1_fundstelle": "IPCC AR6 Synthesis Report, Summary for Policymakers, A.1",
 "k1_zitat": "Human activities, principally through emissions of greenhouse gases, have unequivocally caused global warming, with global surface temperature reaching 1.1 °C above 1850-1900 in 2011-2020.",
 "k4_aussage": "Zwischen kumulativen CO₂-Emissionen und dem Anstieg der globalen Oberflächentemperatur besteht ein nahezu linearer Zusammenhang (high confidence). Erst das rechtfertigt es, überhaupt einen einheitlichen Preis je Tonne anzusetzen — unabhängig davon, wo und wann emittiert wird.",
 "k4_fundstelle": "IPCC AR6 WG1, Summary for Policymakers, D.1.1 und Abbildung SPM.10",
 "restbudget_gt_co2": {
  "1_5_grad_50_prozent": 500,
  "2_grad_67_prozent": 1150,
  "fundstelle": "AR6 Synthesis Report SPM, B.5.2",
  "stand": "Anfang 2020"
 },
 "source_ids": [
  "ipcc-ar6-syr",
  "ipcc-ar6-wg1"
 ],
 "titel": "Was hier nicht verhandelt wird"
}
```

### Marktdesign — die unbepreiste Voraussetzung

```json
{
 "ausschreibung_1": {
  "datum": "1. September 2026",
  "volumen_gw": 4.5
 },
 "ausschreibung_2": {
  "datum": "8. Dezember 2026",
  "volumen_gw": 4.5
 },
 "bezug_zum_modell": "Unser Modell setzt die Backup-Leistung als Ergebnis des Dispatch, nicht als Marktprozess. Wer die 137 GW Gasleistung des gasgestützten Pfades liest, sollte wissen, in welchem Tempo Deutschland gesicherte Leistung derzeit tatsächlich beschafft.",
 "confidence": "A",
 "gesamtvolumen_zunaechst_gw": 11,
 "gesetz": "StromVKG - Gesetz zur Sicherung der Versorgungssicherheit Strom und zur Bereitstellung neuer Kapazitäten",
 "grundsatzeinigung_eu": "2026-01-15",
 "inbetriebnahme_spaetestens": 2031,
 "kabinettsbeschluss": "2026-05-13",
 "koalitionsvertrag_ziel_gw_bis_2030": 20,
 "offener_widerspruch": "11 GW Ausschreibungsarchitektur gegen 20 GW Koalitionsvertragsziel; die Ausgestaltung des Kapazitätsmechanismus ist nicht final entschieden.",
 "source_ids": [
  "bmwe-kraftwerksstrategie"
 ],
 "technologiefokus": "wasserstofffähige Gaskraftwerke, daneben ausdrücklich Speicher und andere steuerbare Anlagen"
}
```

### Dunkelflaute ist zuerst eine Definitionsfrage

```json
{
 "confidence": "A",
 "definitionen": [
  {
   "mindestdauer_h": 48,
   "quelle": "Deutscher Wetterdienst",
   "schwelle": "unter 10 % der Nennleistung"
  },
  {
   "mindestdauer_h": 10,
   "quelle": "Uniper-Kurzstudie 2026",
   "schwelle": "unter 10 % der installierten Leistung von Wind und PV zusammen, gleitender 6-Stunden-Mittelwert"
  }
 ],
 "dezember_2024": "Beim Referenzereignis im Dezember 2024 hat das System die Dunkelflaute technisch bewältigt - Reserven waren vorhanden, es gab keine Versorgungsunterbrechung -, aber zu Day-Ahead-Preisen zeitweise über 1.000 Euro je Megawattstunde. Bundesnetzagentur und Bundeskartellamt fanden keinen Marktmissbrauch, wohl aber ein strukturelles Problem.",
 "haeufigkeit_lang": "Ereignisse über 48 Stunden treten rund zwei- bis dreimal im Jahr auf; das längste Ereignis der letzten zehn Jahre dauerte 5,4 Tage.",
 "haeufigkeit_uniper": "1.435 Ereignisse über 10 Stunden zwischen 2016 und 2025, mittlere Dauer 12,9 Stunden - also im Mittel öfter als alle drei Tage.",
 "interessenlage": "Uniper betreibt konventionelle Kraftwerke und hat ein wirtschaftliches Interesse daran, den Backup-Bedarf zu betonen. Die 10-Stunden-Schwelle ist nicht falsch, sie produziert aber naturgemäß viel höhere Ereigniszahlen als die 48-Stunden-Definition des DWD. Umgekehrt blendet die DWD-Definition Erzeugungslücken von 10 bis 24 Stunden aus, die für den Speicherbedarf sehr wohl zählen.",
 "kernaussage": "Es gibt keine einheitliche Definition. Deshalb können beide Seiten mit korrekten Zahlen das Gegenteil behaupten.",
 "source_ids": [
  "uniper-dunkelflaute-2026",
  "lbbw-dunkelflaute-2025",
  "bnetza-preisspitzen-2025"
 ]
}
```

### Kostenueberschreitungen: was die Empirie sagt

```json
{
 "capex_effektiv_faktor": 1.3,
 "capex_effektiv_median_eur_kw": 15941,
 "capex_effektiv_median_v02b_eur_kw": 22770,
 "confidence": "B",
 "hpc_nominal_eur_kw": 17264,
 "rest_anteile": [
  0.48,
  0.5,
  0.0
 ],
 "schaetzbasis_eur_kw": 7500,
 "source": "research/modell_v02c_ergebnis.md 4.1-4.4",
 "text": "Der empirische Überschreitungsfaktor wird seit v0.2c nicht mehr auf jeden gezogenen Baukostenwert multipliziert, sondern als absoluter Betrag auf einer einzigen Schätzbasis von 7.500 Euro je Kilowatt gerechnet - und nur auf den Teil der Eskalation, der noch aussteht. Auf Anker, die ihre Verteuerung bereits hinter sich haben (Hinkley Point C in laufenden Preisen), kommt gar nichts mehr obendrauf. Ergebnis: Der effektive Baukostenwert liegt im Überschreitungs-Lauf im Median bei 15.941 statt 22.770 Euro je Kilowatt - ein effektiver Faktor von 1,30 statt 1,86, und damit erstmals vollständig unterhalb des teuersten je gebauten westlichen Reaktors (17.264 Euro je Kilowatt)."
}
```

### Netz- und Regelanteil

```json
{
 "anteil_am_deterministischen_abstand_pct": 44,
 "anteil_am_median_vorsprung_pct": 58,
 "confidence": "M",
 "median_vorsprung_ccs_paar_eur_mwh": 11.7,
 "sensitivitaet_abstand_eur_mwh": [
  -2.3,
  4.5
 ],
 "sockel_effekt_gas_eur_mwh": 2.2,
 "sockel_effekt_kernkraft_eur_mwh": 6.7,
 "source": "research/modell_v02c_ergebnis.md 2.3",
 "text": "Von den 11,7 Euro je Megawattstunde, mit denen das Kernkraft-Szenario im technologiesymmetrischen Vergleich vorn liegt, stammen 6,7 aus einer einzigen Modellsetzung: dem Anteil des Übertragungsnetzes, der auch ohne wetterabhängige Erzeugung gebaut werden müsste (0,40, Sensitivität 0,20 bis 0,60). Über diese Spanne bewegt sich der Abstand der beiden Pfade um 6,8 Euro je Megawattstunde - mehr als der Abstand selbst. Es ist der einzige Parameter des Modells, der die Rangfolge allein durch seine Wahl dreht."
}
```

### Die geprüfte Studie: Absender und Einordnung

```json
{
 "confidence": "C",
 "confidence_note": "Angaben zu Trägerschaft und Vereinsgeschichte stammen aus unserem eigenen Grundlagenpapier und sind nicht unabhängig gegengeprüft.",
 "fairness_hinweis": "Dass ausgerechnet ein wasserstoffnaher Verein die wasserstofflastigen Pfade als die teuersten ausweist, spricht eher für als gegen die Unbefangenheit der Rechnung.",
 "gegruendet": "2020 in Ulm",
 "gegruendet_kontext": "initiiert aus dem Umfeld des Forschungsinstituts FAW/n",
 "jahresbedarf_twh": 950,
 "organisation": "Global Energy Solutions e.V.",
 "source_ids": [
  "ges-studie-2026"
 ],
 "studie_erschienen": "Juli 2026",
 "urspruenglicher_fokus": "grüner Wasserstoff, Methanol und Power-to-X-Importe",
 "volltext_status": "Das Studien-PDF war in dieser Arbeitsumgebung nicht abrufbar. Alles, was hier über die Methodik der Studie steht, stützt sich auf unsere eigene, vor Wochen angefertigte Wiedergabe ihrer Annahmetabellen — jede einzelne Zahl daraus ist gegen unabhängige Quellen gehalten, die Studie im Original haben wir nicht gelesen.",
 "zieljahr": 2045
}
```

### Was das fuer einen Haushalt bedeutet

```json
{
 "confidence": "M",
 "guardrail": "Systemkosten, kein Strompreis: Diese Zahlen sagen, was Erzeugung, Speicher, Backup und Netzausbau je Kilowattstunde kosten. Auf einer Stromrechnung stehen zusätzlich Vertrieb, Messung, Steuern und Abgaben, und die Netzkosten werden dort anders verteilt als hier modelliert. Der Haushalts-Anker macht Größenordnungen fühlbar - er ist keine Preisprognose.",
 "note": "3.500 Kilowattstunden im Jahr sind die gerundete Referenzgröße für einen Zwei- bis Drei-Personen-Haushalt. Sie ist hier eine Rechenhilfe und keine Messung, deshalb als Setzung gekennzeichnet.",
 "umrechnung": "1 Euro je Megawattstunde sind 0,1 Cent je Kilowattstunde - und bei 3.500 Kilowattstunden Jahresverbrauch 3,50 Euro im Jahr.",
 "verbrauch_kwh_a": 3500
}
```

### Klimaziel 2045

```json
{
 "confidence": "B",
 "confidence_note": "Zielwerte aus § 3a KSG, über Suchindex-Auszüge und Sekundärquellen erfasst; der Gesetzestext war in dieser Arbeitsumgebung nicht im Volltext abrufbar. Es ist ein Zielwert, kein Ist-Wert - die tatsächliche Senkenleistung des Sektors liegt derzeit deutlich darunter und war zuletzt sogar negativ.",
 "gesetz": "Bundes-Klimaschutzgesetz (KSG), § 3a",
 "netto_neutralitaet_jahr": 2045,
 "senke_mt_co2_aeq": {
  "2030": 25,
  "2040": 35,
  "2045": 40
 },
 "source_ids": [
  "ksg-3a"
 ],
 "text": "Das Klimaschutzgesetz verlangt für 2045 Netto-Treibhausgasneutralität. Die dafür vorgesehene nationale Senkenleistung aus Landnutzung und Forstwirtschaft steht im selben Gesetz bei 40 Millionen Tonnen CO2-Äquivalent im Jahr - für alle Sektoren zusammen, Industrieprozesse, Landwirtschaft und Abfall eingeschlossen."
}
```

*Die Bloecke sind bewusst als JSON eingebettet: sie sind der unveraenderte, maschinenlesbare Datenstand der Story-Seite — jede Zahl mit Herkunft, Konfidenzstufe und Vorbehalt.*

---

## Quellenverzeichnis

Konfidenzstufen: **A** mehrfach bestaetigt / institutionelle Primaerquelle · **B** einzelner Treffer, institutionelle Quelle · **C** Branchen-/Marktquelle oder Modellannahme mit schwacher Belegbasis · **M** Setzung/Modellannahme, nicht quellenbelegt.

| Nr. | Titel | Herausgeber | Datum | Konfidenz |
|---:|:---|:---|:---|:---:|
| 1 | [Nuclear reactors' construction costs: The role of lead-time, standardization and technological progress](https://doi.org/10.1016/j.enpol.2015.03.015) | Energy Policy 82, S. 118-130 | 2015 | C |
| 2 | [Kraftwerksstrategie / StromVKG - Grundsatzeinigung mit der Europaeischen Kommission und Kabinettsbeschluss](https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/01/20260115-grundsatzeinigung-mit-europaeischen-kommission-ueber-eckpunkte-der-kraftwerksstrategie.html) | Bundesministerium für Wirtschaft und Energie (BMWE) | 2026-01 / 2026-05 | A |
| 3 | [Lithium-Ion Battery Pack Prices Fall to 108 USD per Kilowatt-Hour (Battery Price Survey 2025); berechnete Lernrate rund 18 Prozent](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/) | BloombergNEF | 2025-12 | A |
| 4 | [Festlegung der Höchstwerte 2026 für Wind an Land und Solar-Dachanlagen](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251216_Hoechstwerte.html) | Bundesnetzagentur | 2025-12-16 | B |
| 5 | [Untersuchung zu Strompreisspitzen während Dunkelflauten 2024 (Pressemitteilung)](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251021_Preisspitzen.html) | Bundesnetzagentur / Bundeskartellamt | 2025-10-21 | A |
| 6 | [Ausschreibung Solaranlagen erstes Segment, Gebotstermin 1. März 2026](https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Ausschreibungen/Solaranlagen1/BeendeteAusschreibungen/2026/01032026/start.html) | Bundesnetzagentur | 2026 | B |
| 7 | [Hohes Wettbewerbsniveau bei der Ausschreibung für Wind an Land zum 1. Mai 2026](https://www.bundesnetzagentur.de/1110006) | Bundesnetzagentur | 2026-06 | B |
| 8 | [Programme d'EPR: la Cour des Comptes publie un rapport critique et recalcule le cout de Flamanville 3](https://www.connaissancedesenergies.org/afp/programme-depr-la-cour-des-comptes-publie-un-rapport-critique-et-recalcule-le-cout-de-flamanville-3-250114) | Cour des Comptes / Connaissance des Energies (AFP) | 2025-01-14 |  |
| 9 | [Elektrolysekapazitäten in Deutschland](https://www.dena.de/infocenter/elektrolysekapazitaeten-in-deutschland/) | Deutsche Energie-Agentur (dena) | 2026-04 | A |
| 10 | [Commission approves State aid for the construction and operation of Poland's first nuclear power plant](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_2963) | Europäische Kommission | 2025-12-09 |  |
| 11 | [EDF shares its forecasted cost estimate of the EPR2 programme for EUR72.8bn](https://www.edf.fr/en/the-edf-group/dedicated-sections/journalists/all-press-releases/edf-shares-its-forecasted-cost-estimate-of-the-epr2-programme-for-eu728bn) | EDF Groupe (Pressemitteilung) | 2025-12-18 |  |
| 12 | [Plant Vogtle Unit 4 begins commercial operation](https://www.eia.gov/todayinenergy/detail.php?id=61963) | U.S. Energy Information Administration | 2024 |  |
| 13 | [KHNP signs final contract to build two nuclear reactors at Dukovany (Czechia)](https://www.enerdata.net/publications/daily-energy-news/khnp-signs-final-contract-build-two-nuclear-reactors-dukovany-czechia.html) | Enerdata | 2025-06 |  |
| 14 | [Revisiting the Cost Escalation Curse of Nuclear Power: New Lessons from the French Experience](https://ideas.repec.org/a/aen/eeepjl/eeep4-2-escobar.html) | Economics of Energy & Environmental Policy 4(2) | 2015 | C |
| 15 | [Auswirkungen und Preispfade des EU ETS2, Endbericht](https://www.ewi.uni-koeln.de/cms/wp-content/uploads/2025/04/EU-ETS2_Endbericht.pdf) | EWI, Universität zu Köln | 2025-04 | B |
| 16 | [Von der Theorie zur Praxis: Warum grüner Wasserstoff teurer ist als gedacht (Discussion Paper)](https://www.ffe.de/wp-content/uploads/2025/07/Discussion_Paper-Investitionskosten_Elektrolyse-2.pdf) | Forschungsstelle für Energiewirtschaft (FfE), München | 2025-07 | B |
| 17 | [How Big Things Get Done (Megaprojekt-Datenbank, ~16.000 Projekte)](https://budgetoverrun.com/studies/flyvbjerg-megaproject-database) | B. Flyvbjerg / D. Gardner, Currency/Penguin | 2023 | A |
| 18 | [20 GW Gaskraftwerke bis 2030 - Was kostet die Erweiterung?](https://foes.de/publikationen/2025/2025-04_FOES_BUND_Kraftwerkskosten.pdf) | FOES i.A. BUND | 2025-04 | B |
| 19 | [Stromgestehungskosten Erneuerbare Energien](https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf) | Fraunhofer ISE | 2024-07 | A |
| 20 | [Kurzanalyse Stromgestehungskosten und Volllaststunden flexibler Kraftwerke](https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/Kurzanalyse_flexibleKraftwerke.pdf) | Fraunhofer ISE (Kost, Sepulveda Schweiger, Thomsen) | 2024/2025 | B |
| 21 | [Der klimaneutrale Strommix der Zukunft — Eine Szenarioanalyse zu den Kosten des zukünftigen deutschen Stromsystems](https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf) | Global Energy Solutions e. V. | 2026-07 | C |
| 22 | [Der klimaneutrale Strommix der Zukunft](https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf) | Global Energy Solutions e.V. | 2026-07 | C |
| 23 | [A reply to 'Historical construction costs of global nuclear power reactors'](https://law.stanford.edu/publications/a-reply-to-historical-construction-costs-of-global-nuclear-power-reactors/) | Energy Policy 102, S. 640-643 | 2017 | A |
| 24 | [European electrolyser costs fall in 2025 as manufacturing capacity expands](https://globalhydrogenhub.com/european-electrolyser-costs-fall-in-2025-as-manufacturing-capacity-expands.html) | Global Hydrogen Hub | 2025 |  |
| 25 | [The costs of the French nuclear scale-up: A case of negative learning by doing](https://www.sciencedirect.com/science/article/abs/pii/S0301421510003526) | Energy Policy 38(9), S. 5174-5188 | 2010 | A |
| 26 | [Projected Costs of Generating Electricity - 2020 Edition](https://www.iea.org/reports/projected-costs-of-generating-electricity-2020) | IEA / OECD NEA | 2020-12 | B |
| 27 | [Netzinvestitionsbedarf bis 2045 (Uebertragungs- und Verteilnetz)](https://www.imk-boeckler.de/) | IMK / Hans-Böckler-Stiftung | 2025 | B |
| 28 | [Climate Change 2023: Synthesis Report — Summary for Policymakers](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/) | IPCC | 2023-03 | A |
| 29 | [Climate Change 2021: The Physical Science Basis — Summary for Policymakers](https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/) | IPCC (WG1) | 2021-08 | A |
| 30 | [Renewable Power Generation Costs in 2024](https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2025/Jul/IRENA_TEC_RPGC_in_2024_Summary_2025.pdf) | IRENA | 2025-07 | B |
| 31 | [Renewable Power Generation Costs in 2024](https://www.irena.org/Publications/2024/Sep/Renewable-Power-Generation-Costs-in-2023) | IRENA | 2025-07 | B |
| 32 | [International Technology Roadmap for Photovoltaic (ITRPV), 16. Ausgabe - Lernrate 26 Prozent 1976-2025](https://www.pv-tech.org/itrpv-2026-solar-industry-maintains-historic-learning-curve-despite-market-turbulence/) | VDMA / ITRPV | 2026 | B |
| 33 | [Britisches Atomkraftwerk Hinkley Point C verzögert sich weiter und wird teurer - Atomstrom kostet mindestens 15 Cent pro Kilowattstunde](https://www.iwr.de/news/britisches-atomkraftwerk-hinkley-point-c-verzoegert-sich-weiter-und-wird-teurer-atomstrom-kostet-mindestens-15-cent-pro-kilowattstunde-news39541) | IWR-Pressedienst | 2026-02-23 | B |
| 34 | [Fonds zur Finanzierung der kerntechnischen Entsorgung — Kennzahlen und Jahresergebnis 2025](https://www.kenfo.de/) | KENFO | 2026 | A |
| 35 | [Apples and oranges: Comparing nuclear construction costs across nations, time periods, and technologies](https://www.sciencedirect.com/science/article/abs/pii/S0301421516306000) | Energy Policy 102, S. 650-654 | 2017 | A |
| 36 | [Bundes-Klimaschutzgesetz (KSG) § 3a - Nationale Klimaschutzziele für den Sektor Landnutzung, Landnutzungsaenderung und Forstwirtschaft](https://www.gesetze-im-internet.de/ksg/__3a.html) | Bundesrepublik Deutschland | 2021/2024 | B |
| 37 | [Levelized Cost of Energy+ (LCOE+), Version 19.0](https://www.lazard.com/media/sdvdrvc5/lazards-lcoeplus_vf.pdf) | Lazard | 2026-07-13 | B |
| 38 | [Levelized Cost of Energy+ (LCOE+), Version 18.0](https://www.lazard.com/media/uounhon4/lazards-lcoeplus-june-2025.pdf) | Lazard | 2025-06-16 |  |
| 39 | LCOE+ v19.0 | Lazard | 2026-07 | A |
| 40 | [Analysen und Statistiken zu Dunkelflauten in Deutschland](https://www.lbbw.de/artikel/research-studien-2025/dunkelflaute_ake25jccd8_d.html) | LBBW Research | 2025 | B |
| 41 | [Historical construction costs of global nuclear power reactors](https://www.sciencedirect.com/science/article/pii/S0301421516300106) | Energy Policy 91, S. 371-382 | 2016-04 | A |
| 42 | Isar 2 Baukosten (4,75 Mrd. DM / 1400 MW) | im MD als IAEA INIS angegeben |  | C |
| 43 | [Are nuclear power plants too expensive to build?](https://climate.mit.edu/ask-mit/are-nuclear-power-plants-too-expensive-build) | MIT Climate Portal | o.D. |  |
| 44 | [Korea to resume construction of Shin Hanul 3&4](https://www.neimagazine.com/news/korea-to-resume-construction-of-shin-hanul-34-10946507/) | Nuclear Engineering International | o.D. |  |
| 45 | [Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 1. Entwurf](https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_0.pdf) | 50Hertz, Amprion, TenneT, TransnetBW | 2025-12 | A |
| 46 | [UK Announces Final Investment Decision For GBP38 Billion Sizewell C Nuclear Power Station](https://www.nucnet.org/news/uk-announces-final-investment-decision-for-gbp38-billion-sizewell-c-nuclear-power-station-7-2-2025) | NucNet | 2025-07 |  |
| 47 | [Costs and timeframes of construction of nuclear power plants carried out by potential nuclear technology suppliers for Poland](https://pulaski.pl/wp-content/uploads/2021/06/Pulaski_Policy_Paper_No_6_2021_EN-1.pdf) | Casimir Pulaski Foundation, Policy Paper No. 6/2021 | 2021-06 |  |
| 48 | [How long does it take to build a nuclear reactor?](https://hannahritchie.substack.com/p/nuclear-construction-time) | Hannah Ritchie (Sustainability by Numbers), auf Basis IAEA PRIS | 2023 | B |
| 49 | [Projected Electricity Costs in International Nuclear Power Markets](https://www.sciencedirect.com/science/article/am/pii/S0301421522001306) | Energy Policy (Elsevier) | 2022 |  |
| 50 | [Stündliche SMARD-Exportdaten Deutschland Jul-Dez 2024 (GitHub-Mirror, Notlösung)](https://github.com/hakimdalim/smard-data-extractor) | SMARD / Bundesnetzagentur, über github.com/hakimdalim/smard-data-extractor | 2024 | C |
| 51 | [Beyond economies of scale: Learning from construction cost overrun risks and time delays in global energy infrastructure projects](https://www.sciencedirect.com/science/article/pii/S2214629625001380) | Energy Research & Social Science (Sovacool, Ryu) | 2025-03 | A |
| 52 | [Methodenkonvention 3.2 zur Ermittlung von Umweltkosten (CO2-Schattenpreise)](https://www.umweltbundesamt.de/publikationen/methodenkonvention-32-methodische-grundlagen) | Umweltbundesamt | 2020 | B |
| 53 | [Carbon Neutrality in the UNECE Region — Integrated Life-cycle Assessment of Electricity Sources](https://unece.org/sed/documents/2021/10/reports/life-cycle-assessment-electricity-generation-options) | UNECE | 2022 | A |
| 54 | [Kurzstudie Dunkelflauten (Zeitreihenanalyse 2016-2025)](https://www.pv-magazine.de/2026/06/01/uniper-dunkelflauten-sind-regelmaessiger-bestandteil-des-deutschen-stromsystems/) | Uniper SE | 2026-06 | A |
| 55 | [Kostensituation der Windenergie an Land - Stand 2025](https://www.windguard.de/veroeffentlichungen.html?file=files%2Fcto_layout%2Fimg%2Funternehmen%2Fveroeffentlichungen%2F2025%2FKostensituation+der+Windenergie+an+Land+%E2%80%93+Stand+2025.pdf) | Deutsche WindGuard i.A. BMWK | 2025-10 | B |

### Anmerkungen zu einzelnen Quellen

- **Nr. 1 · Nuclear reactors' construction costs: The role of lead-time, standardization and technological progress** — Oekonometrie über französische und US-amerikanische Reaktoren: Standardisierung senkt Bauzeit und Kosten, Designänderungen erhöhen beides. Ueber Suchindex-Auszüge erfasst, nicht im Volltext gelesen.
- **Nr. 2 · Kraftwerksstrategie / StromVKG - Grundsatzeinigung mit der Europaeischen Kommission und Kabinettsbeschluss** — Termine und Volumina der ersten beiden Ausschreibungsrunden nach research/ist_zustand_de.md 6.2.
- **Nr. 9 · Elektrolysekapazitäten in Deutschland** — Kapazitäts- und Projektdatenbank - weist KEINE Investitionskosten je kW aus. Die Zuordnung im MD ist eine Fehlzuordnung.
- **Nr. 14 · Revisiting the Cost Escalation Curse of Nuclear Power: New Lessons from the French Experience** — Erwiderung auf Grubler 2010: geringere Eskalation als dort berichtet, Belege für Lerneffekte und für eine kostensenkende Wirkung der Standardisierung. Ueber Suchindex-Auszüge erfasst, nicht im Volltext gelesen.
- **Nr. 15 · Auswirkungen und Preispfade des EU ETS2, Endbericht** — ETS 2, NICHT Stromsektor. Im MD fälschlich als Strom-CO2-Preis verwendet.
- **Nr. 16 · Von der Theorie zur Praxis: Warum grüner Wasserstoff teurer ist als gedacht (Discussion Paper)** — PDF in dieser Session durch den Netzwerk-Egress blockiert; Inhalte über Suchindex-Auszüge mit wörtlichen Zitaten verifiziert.
- **Nr. 21 · Der klimaneutrale Strommix der Zukunft — Eine Szenarioanalyse zu den Kosten des zukünftigen deutschen Stromsystems** — Volltext-PDF in der Arbeitsumgebung nicht abrufbar (Egress-Policy). Alle Studienwerte stammen aus der Aufbereitung in docs/01 und aus Suchindex-Zusammenfassungen, nicht aus selbst gelesenem Volltext.
- **Nr. 22 · Der klimaneutrale Strommix der Zukunft** — PDF in dieser Session durch den Netzwerk-Egress blockiert. Alle Aussagen zur Studien-Methodik beruhen auf der MD-Wiedergabe und konnten nicht am Original gegengeprüft werden.
- **Nr. 26 · Projected Costs of Generating Electricity - 2020 Edition** — Domain in dieser Session blockiert; LCOE-Calculator unter https://www.oecd-nea.org/lcoe/
- **Nr. 31 · Renewable Power Generation Costs in 2024** — BESS 192 USD/kWh (2024), minus 93 Prozent seit 2010; PV-Projektion rund 500 USD/kW für 2030 mit ausdrücklichem Europa-/Nordamerika-Vorbehalt.
- **Nr. 36 · Bundes-Klimaschutzgesetz (KSG) § 3a - Nationale Klimaschutzziele für den Sektor Landnutzung, Landnutzungsaenderung und Forstwirtschaft** — Senkenziele 25 Mt (2030), 35 Mt (2040), 40 Mt CO2-Aequivalent (2045). Ueber Suchindex-Auszüge und Sekundaerquellen erfasst, nicht am Gesetzestext im Volltext geprüft.
- **Nr. 39 · LCOE+ v19.0** — Speicherkosten seit 2020 um 27 Prozent gestiegen; LCOS 100 MW / 4 h 210-292 USD/MWh.
- **Nr. 41 · Historical construction costs of global nuclear power reactors** — 349 Reaktoren in 7 Ländern, 58 Prozent aller weltweit gebauten Blöcke, Overnight Construction Cost in konstanten USD 2010. NUR gemeinsam mit den beiden Erwiderungen zitieren.
- **Nr. 42 · Isar 2 Baukosten (4,75 Mrd. DM / 1400 MW)** — Eingangszahl nicht belegbar, Kostenabgrenzung unbekannt.
- **Nr. 50 · Stündliche SMARD-Exportdaten Deutschland Jul-Dez 2024 (GitHub-Mirror, Notlösung)** — Primärquellen (energy-charts, smard.de, OPSD) waren aus der Arbeitsumgebung per Egress-Policy nicht erreichbar.
- **Nr. 54 · Kurzstudie Dunkelflauten (Zeitreihenanalyse 2016-2025)** — Interessenlage: Uniper betreibt konventionelle Kraftwerke. 10-h-Schwelle statt DWD-48-h.

---

## Interaktive Fassung und weiterfuehrende Dateien

- Visual Story (scrollgetriebene Charts): https://datenwgknowledgekitchen.com/strommix-story.html
- Vollstaendige Analyse als interaktives White Paper: https://datenwgknowledgekitchen.com/whitepaper-strommix.html
- Markdown-Fassung des White Papers: https://datenwgknowledgekitchen.com/md/whitepaper-strommix.md
- Datenstand der Story: https://datenwgknowledgekitchen.com/strommix/data/story_data.json
- Maschinenlesbarer Index der Kitchen: https://datenwgknowledgekitchen.com/llms.txt
