# Gegenprüfung Dossier 06 · Europäische Integration

Stand 22.11.2026 · Auftrag P2 (Gegenprüfung) · Prüfer: Opus · geprüftes Dossier: `research/06_europa.md` (P1-06, Sonnet)
Regeln: `agents/REGELN.md`, `agents/briefs/P2_gegenpruefung.md` · Manifest: `quellen/manifest_P2-06.json` · Rohdateien: `quellen/raw/P2-06/`
Nachrechnung: `scripts/pruefung/p2_06_nachrechnung.py` (eigener Code, Aufruf `python3 -I energiewende/scripts/pruefung/p2_06_nachrechnung.py`)

Stichprobe B: 16 Parameter mit Konfidenz B, k = ⌊16/10⌋ = 1 → alle 16 geprüft. Dazu alle 10 A-Parameter (das Protokoll nennt 9 A; im JSON-Block stehen 10), alle 10 Kernaussagen und die Schwerpunkte (ACER, ENTSO-E, Handelsbilanz, Wind-Korrelation, Preisspitzen).

## 1. Urteil in fünf Zeilen

1. Die Zahlen halten: Alle Eigenrechnungen (Handelsbilanz 2015–2025, Spitzen, Preise, Wind-Korrelation, französische Kernkraft) ließen sich aus den Rohdaten mit eigenem Code auf die Nachkommastelle nachrechnen; Abweichungen liegen unter 0,1 % oder sind Rundung.
2. Die NEP- und Szenariorahmen-Zitate stehen so im Original; mehrere Seitenangaben sind um eine Seite verschoben (Korrekturen unten), Tabelle 11 ist richtig gelesen.
3. Schief ist die Deutung an drei Stellen: „dauerhafter Netto-Import“ verschweigt, dass der NEP im Trendszenario 2032 Deutschland als Netto-Exporteur (+32 TWh) rechnet; die Preisspitzen-Aussage behandelt eine Folge der Marktkopplung wie einen Beleg; die Aussage „nur 2 GW Leitung zu Norwegen/Schweden“ unterschlägt indirekte Wege über Dänemark und die Niederlande.
4. ACER ist jetzt am Original gelesen: 580 Mio. € stimmt, aber nur 340 Mio. € davon wären 2024 gegenüber dem Ist zusätzlich zu holen gewesen; die EU-Engpasskosten betragen 4,3 Mrd. € für 2024 (nicht 4,2 Mrd. € für 2023). Deutschland erreichte 2024 im Mittel 50 % statt 70 % (2022: 38 %, 2023: 41 %).
5. Gesamturteil: belastbar bei den Daten (überwiegend B, zu Recht), mit Korrekturbedarf bei Einordnung und Fundstellen; ENTSO-E-Zahlen (ERAA, TYNDP) bleiben unbelegt, weil die Dokumente auf nicht freigegebenen Hosts liegen.

## 2. Prüftabelle

Legende Ergebnis: **bestätigt** · **abweichend** · **nicht prüfbar**. „pg“ = `primaer_gelesen` nach der Prüfung.

### 2.1 Kernaussagen

| Kernaussage | Wert im Dossier | geprüfte Fundstelle | Ergebnis | neue Konf. · pg |
|---|---|---|---|---|
| K1 Wende 2023 | 2018 −54,2; 2022 −26,8; 2023 +11,7; 2024 +28,3; 2025 +21,9 TWh (kommerziell); Eurostat +9,2 / +26,3 | Energy-Charts `cbet`/`cbpf` (eigene Summe über Länderspalten, Spalte „sum“ identisch); Eurostat nrg_cb_e E7000, DE, IMP−EXP | **bestätigt** (alle Werte auf 0,1 TWh) | A · true |
| K2 Spitze vs. Planung | Ist 16–17 GW Import, 17,6–19,2 GW Export; NEP 2045 rund 50 GW; Szenariorahmen 58–69 GW | eigene Rechnung; NEP Kap. 2 Tab. 11 S. 54; Szenariorahmen 2027 Kap. 6.3, **S. 122** | **bestätigt**; Seitenangabe 121 → 122. Auch die Brutto-Importspitze (Summe nur positiver Grenzwerte) liegt mit 17,5–17,9 GW kaum höher | B · true |
| K3 Preisspitzen | 2024: 129 h > 200 €/MWh, alle Netto-Import, Ø 11,1 GW; 2025: 161 von 162 | eigene Rechnung aus `price` DE-LU und `cbet` | Zahlen **bestätigt**; Deutung schief (Abschnitt 3.2) | B · true |
| K4 Wind-Korrelation | NL 0,79/0,71 … SE 0,26/0,31; Aggregat 0,83/0,82; CF im DE-Dezil 0,12 (Ø 0,25) | eigene Rechnung aus `public_power`, `installed_power` | **bestätigt** (alle Werte auf 0,01) | B · true |
| K5 Nordische Speicher, Leitung | NTC 2045 NO 1,4 GW, SE 0,6 GW; 168 / 72 GWh in 120 h | NEP Tab. 11 S. 54; Rechnung 1,4 × 120, 0,6 × 120 | Zahlen **bestätigt**; Speicher-TWh **nicht prüfbar**; Darstellung einseitig (Abschnitt 3.3) | B · true (Leistung), C · false (Speicher) |
| K6 Frankreich | Brutto 556/475/525/571 TWh; 2022 Netto-Import +14,9, 2024 Netto-Export 90 TWh; Kernkraft-Winter 42,0/47,1 GW bei 63 GW; Min. 23,7 GW | Eurostat nrg_cb_e; Energy-Charts `pp_fr`, `inst_fr` | **bestätigt**, zwei Kleinigkeiten: installiert 2023 61,4 GW (63,0 erst 2024); „Winter Dez–Feb“ sind Jan+Feb+Dez desselben Kalenderjahres; Minimum 23,7 GW gilt für 2023, 2024: 31,8 GW | A (Jahr) / B (Winter) · true |
| K7 NEP: dauerhafter Netto-Import | 2037 A 25 TWh; 2045 42/73/91; Transit 54–72 bis ~95 TWh | NEP Kap. 3: S. 67 (Zusammenfassung), **S. 69** (25/73/91), **S. 72** (Transit); **S. 85** Trendszenario 2032 | Zahlen **bestätigt**; Aussage **abweichend**: NEP-Trendszenario 2032 = Netto-**Export** +32 TWh (Export 116, Import 83 TWh) | A · true |
| K8 Hansa PowerBridge | „Schweden hat 2024 die Hansa PowerBridge (700 MW) ausgesetzt (laut Genehmigung)“ | BNetzA, Genehmigung Szenariorahmen 2025, **S. 75** | **abweichend** in der Belegzuordnung: Genehmigung nennt Hansa PowerBridge **I und II**, „von schwedischer Seite ausgesetzt“, ohne Jahr und ohne MW-Angabe; positiver Mehrwert in allen KNA, Wiederaufnahme „begrüßenswert“ | A für „ausgesetzt“, C für 2024/700 MW · true |
| K9 EU-Rahmen | −90 % netto 2040, bis 5 Pp. Gutschriften ab 2036, Rat 5.3.2026; ETS 2 2028; EUA 74–88 €/t | Kommission, climate.ec.europa.eu „2040 climate target“ (Stand 7.4.2026) | 90 %, 85 % heimisch + bis 5 % Gutschriften, Annahme März 2026 **bestätigt**; „ab 2036“ dort nur als „second part of 2030-2040“; ETS 2 und EUA **nicht prüfbar** (consilium.europa.eu: Browser-Prüfung, nicht umgangen) | B · true (90 %) / C · false (Rest) |
| K10 Lücken | heutige NTC, ACER/ENTSO-E-Nutzen, H2-Korridore | ACER MMR 2025 | **teilweise überholt**: ACER-Zahlen jetzt lesbar (Abschnitt 3.4); heutige NTC je Grenze und ENTSO-E bleiben offen | – |

### 2.2 Parameter (JSON-Block des Dossiers)

| Parameter-ID | Wert im Dossier | geprüfte Fundstelle | Ergebnis | neue Konf. · pg |
|---|---|---|---|---|
| de_netto_import_2023_twh (A) | 8,9 / 11,7 / 11,7 | cbet 11,73; cbpf 8,92; Eurostat 69.307 − 60.082 GWh = 9,2 | bestätigt | A · true |
| de_netto_import_2024_twh (A) | 25,1 / 28,3 / 28,3 | cbet 28,32; cbpf 25,14; Eurostat 81.658 − 55.389 = 26,3 | bestätigt | A · true |
| ntc_2040_2045_pfad_ab_gw (A) | 58 / 58,5 / 59 | Szenariorahmen 2027 Kap. 6.3, S. 122 („rund 58 GW … etwa 59 GW“) | bestätigt, Seite 121 → 122 | A · true |
| ntc_2045_pfad_c_gw (A) | 68 / 68,5 / 69 | ebd. | bestätigt, Seite 122 | A · true |
| eu_mindestkapazitaet_handel_pct (A) | 70 | Szenariorahmen Kap. 6 (Einleitung, S. 116) und 6.2 (S. 121); ACER MMR 2025 S. 5–6 („by the end of 2025 at the latest“) | bestätigt; zweite unabhängige Quelle jetzt gelesen | A · true |
| eu_verbundziel_2030_pct (A) | 15 | Szenariorahmen Kap. 6 Einl. S. 116, Kap. 6.3 S. 122 | bestätigt | A · true |
| nep_nettoimport_2037_a_twh (A) | 25 | NEP Kap. **3.1**, **S. 69** | bestätigt; Fundstelle „Kap. 3.2.1, S. 68“ falsch | A · true |
| nep_nettoimport_2045_twh (A) | 42 / 73 / 91 | NEP Kap. 3, S. 67 (Zusammenfassung) und Kap. 3.1 S. 69 | bestätigt; Seiten 66/68 → 67/69 | A · true |
| nep_handelstransit_2045_twh (A) | 87 / 90 / 95 | NEP Kap. 3.1, **S. 72** („fast 95 TWh“, B/A 2045: 90/87; Stundenmaximum ~25 GW in B 2045) | bestätigt; Seite 71 → 72 | A · true |
| fr_bruttoerzeugung_2022_twh (A) | 475,1 | Eurostat GEP FR 2022: 475.115 GWh; 2021 555,6; 2023 524,9; 2024 570,7; FR IMP−EXP 2022 +14,9 | bestätigt | A · true |
| de_max_export_gw_h_2023 (B) | 19,2 | eigene Rechnung cbet: 19,23 | bestätigt | B · true |
| de_max_import_gw_h_2024 (B) | 17,0 (12.12.2024 07:00 UTC) | eigene Rechnung: 17,04 GW, 12.12.2024 07:00 UTC | bestätigt | B · true |
| de_netto_export_2018_twh (B) | 54,2 | cbet 2018: −54,19 | bestätigt | B · true |
| de_netto_import_2025_twh (B) | 18,2 / 21,9 | cbet 21,92; cbpf 18,21 | bestätigt | B · true |
| fr_kernkraft_winter_mittel_gw (B) | 42,0 / 47,1; Min. 23,7 / 31,8 | pp_fr: 42,00 / 47,14; Min. 23,72 / 31,79 | bestätigt (Abgrenzung: Jan, Feb, Dez je Kalenderjahr) | B · true |
| gleichzeitige_flaute_stunden (B) | 543 / 583 / 622; DE allein 2.380 / 2.481; 123 h / 57 h | eigene Rechnung: 622 / 543; DE allein 2.382 / 2.481; 123 / 57 h | bestätigt (2.380 → 2.382, +0,08 %) | B · true |
| importpreis_2024_eur_mwh (B) | 69,1 (DE 90,5; Export 57,4) | eigene Rechnung: 69,1 / 90,5; Exportpreis 57,4 ohne Luxemburg, 60,0 mit | bestätigt; Abgrenzung „ohne LU“ fehlt im Dossier | B · true |
| nachbar_cf_in_de_flaute_dezil (B) | 0,12 | 0,116 / 0,121; Schwelle 0,0445 / 0,0434 | bestätigt | B · true |
| ntc_2045_summe_aus_de_gw (B) | 49,6 | NEP Tab. 11 S. 54, Zeile „von DE“: 8,5+3,0+7,5+3,0+1,8+5,5+0,7+4,8+4,8+5,0+1,4+3,0+0,6 = 49,6 | bestätigt | B · true |
| ntc_2045_summe_nach_de_gw (B) | 49,6 | ebd., Spalte „zu DE“: 8,4+3,0+5,5+3,0+2,6+5,5+2,0+4,8+4,8+5,0+1,4+3,0+0,6 = 49,6 | bestätigt | B · true |
| ntc_bmwe_o45_strom_gw (B) | 92,4 | Szenariorahmen 2027 S. 122 („rund 92,4 GW in O45-Strom“) | bestätigt als Zitat; ob je Richtung oder Summe, sagt die Stelle nicht | B · true |
| preis_spitzen_stunden_ueber_200_2024 (B) | 129 (129 Import, Ø 11,1 GW) | eigene Rechnung: 129 / 129 / 11,08 GW; 2023 112/102/5,45; 2025 162/161/10,02 | bestätigt | B · true |
| regler_kuppelkapazitaet_gw (B) | 0 / 50 / 92,4 | Bestandteile wie oben | Bestandteile bestätigt; Setzung (M) bleibt Setzung, Obergrenze 92,4 nicht sicher „je Richtung“ | B · true |
| wind_korrelation_fr_nl_dk_pl_be_cz_range (B) | 0,56 / 0,70 / 0,79 | FR 0,569/0,563; NL 0,785/0,713; BE 0,733/0,669; PL 0,708/0,662; DK 0,702/0,689; CZ 0,751/0,692 | bestätigt | B · true |
| wind_korrelation_nachbar_aggregat_2024 (B) | 0,82 / 0,83 | 0,832 (2023) / 0,816 (2024), 83,0 / 84,8 GW | bestätigt | B · true |
| wind_korrelation_no_se_at_range (B) | 0,26 / 0,30 / 0,35 | NO 0,314/0,348; SE 0,259/0,312; AT 0,254/0,299 | bestätigt | B · true |
| norwegen_speicherpotenzial_twh (C) | 84–87 | – | nicht prüfbar (NVE/Statnett nicht freigegeben) | C · false |
| schweden_speicher_twh (C) | 34 | – | nicht prüfbar | C · false |
| acer_70pct_core_wohlfahrt_mio_eur (C) | 580 Mio. € „mindestens“; EU-Engpasskosten 2023 4,2 Mrd. € | ACER MMR 2025, S. 5 Z. 5, S. 17 Z. 47, Abb. 6; S. 6 Z. 11, S. 56 Z. 173 | 580 Mio. € **bestätigt** („at least“); Abgrenzung **abweichend**: davon 240 Mio. € bereits 2024 realisiert, offen 340 Mio. €; Engpasskosten **4,3 Mrd. € (2024), 60 TWh** — „4,2 Mrd. € 2023“ steht dort nicht | B · true |
| eu_klimaziel_2040_pct (C) | 90 % netto, bis 5 Pp. ab 2036 | Kommission, 2040 climate target (Stand 7.4.2026) | 90 % / 85 % heimisch / bis 5 % Gutschriften bestätigt; „ab 2036“ nicht wörtlich bestätigt | B · true |
| eua_dez_2026_eur_t (C) | 74 / 82,4 / 88,3 | – | nicht prüfbar (kein freigegebener Host mit Kursdaten) | C · false |

Zusammenfassung: 31 Parameter geprüft — 27 bestätigt (davon 5 mit korrigierter Fundstelle oder Abgrenzung), 1 abweichend (ACER), 3 nicht prüfbar. 10 Kernaussagen: 6 bestätigt, 3 abweichend bzw. schief (K7, K8, K3 in der Deutung), 1 teilweise überholt (K10).

## 3. Abweichungen im Detail (nach Gewicht)

### 3.1 K7 „Die Netzplanung erwartet dauerhaften Netto-Import“ — unvollständig

Der NEP 2037/2045 (2. Entwurf) rechnet neben den Zieljahren ein **Trendszenario 2032**. Dort ist Deutschland „anders als in den Szenarien für die Jahre 2037 und 2045 Nettostromexporteur mit einem Handelssaldo von +32 TWh“ (Exporte 116 TWh, Importe 83 TWh; Kap. 3.2.5, S. 85). Begründung des NEP: geringerer Verbrauch und weniger Erneuerbare im Ausland. „Dauerhaft“ ist deshalb zu stark: Nach der Netzplanung wechselt die Richtung je nach Ausbaustand im In- und Ausland. Der Netto-Import 2037/2045 ist zudem ein Kostenergebnis („inländische Erzeugung aus Wasserstoffkraftwerken vergleichsweise teuer“, S. 67), keine Knappheit — das Dossier sagt das in 6.3 nur für die Zukunft, nicht in der Kernaussage.

### 3.2 K3 „Der Verbund hilft in Preisspitzen sehr deutlich“ — Zahlen richtig, Schluss zu stark

- In der gekoppelten Day-Ahead-Auktion fließt Strom systematisch in die teurere Zone. Ein hoher DE-Preis und Netto-Import in derselben Stunde sind deshalb zum Teil dieselbe Tatsache, kein unabhängiger Beleg. Der Basiswert: 2024 war Deutschland in 72,5 % aller Stunden Netto-Importeur (2025: 69,9 %).
- Was die Zahl trägt: In den Spitzen ist der Import deutlich höher (2024 Ø 11,1 GW gegen 6,4 GW in allen Importstunden; 2025 10,0 gegen 5,6 GW). Das spricht dafür, dass die Leitungen in Knappheit stark genutzt werden.
- Gegenbefund aus denselben Daten: Am 12.12.2024 lagen der höchste Netto-Import des Jahres (17,0 GW, 07:00 UTC) und der höchste Preis des Jahres (936 €/MWh, 16:00 UTC) am selben Tag. Der Import war an seiner beobachteten Obergrenze, die Spitze kam trotzdem. Das stützt zugleich die vom Dossier als „nicht geprüft“ markierte Presseangabe 900–1.000 €/MWh (jetzt: 936,3 €/MWh, Energy-Charts/SMARD, B, primär gerechnet).
- 2023 fielen nur 102 von 112 Spitzen mit Netto-Import zusammen, im Mittel nur 5,5 GW — die Aussage „sehr deutlich“ gilt für 2024/2025, nicht für 2023.

### 3.3 K5 „Flaschenhals ist die Leitung“ (NO 1,4 GW, SE 0,6 GW) — einseitig zulasten des Verbunds

Tabelle 11 zeigt, dass Norwegen und Schweden Deutschland 2045 auch indirekt erreichen: NO → DKW 1,4, NO → NL 0,7, NO → GB 1,4; SE → DKE 1,3, SE → DKW 1,4; DKW → DE 5,5, DKE → DE 2,6, NL → DE 5,0. Der NEP beschreibt genau diese Rolle (Speicherwasser in AT, CH, NO, SE „unterstützen über eine zeitlich versetzte Ausspeicherung eine kostengünstige Lastdeckung“, Kap. 3.1, S. 71). Die 168 + 72 GWh sind eine Untergrenze, nicht die Lieferfähigkeit. Umgekehrt (zugunsten des Dossiers): In einer gemeinsamen Flaute brauchen DK und NL ihre Leitungen selbst; wie viel durchkommt, kann nur ein Mehr-Zonen-Modell sagen. Die Kernaussage sollte „direkt“ sagen und die indirekten Wege nennen. Zusätzlich: Norwegens Hybrid-Interkonnektor („Norway Windfarm-Continent“) ist in allen 2045-Szenarien zu prüfen (Genehmigung S. 75).

### 3.4 ACER — Abgrenzung und Nebenwert

- 580 Mio. € = gesamter Wohlfahrtseffekt der 70-%-Regel in der Core-Region 2024 gegenüber „keine Anforderung“ (ACER: „at least EUR 580 million“, S. 5). Davon wurden 240 Mio. € 2024 bereits über virtuelle Kapazitäten realisiert; **offen waren 340 Mio. €** (S. 17, Z. 47, Abb. 6). Wer „hätte gewonnen werden können“ sagt, muss 340 Mio. € nennen. Konsumenten +664 Mio. €, Produzenten −142 Mio. €, Engpasserlöse −188 Mio. € (Abb. 7); Day-Ahead-Preise im Mittel 2 €/MWh, in Spitzenstunden 9 €/MWh niedriger (Z. 50–51).
- EU-Engpasskosten: **4,3 Mrd. € für 2024, 60 TWh Maßnahmen** (+5 % Menge gegenüber 2023), S. 6 und S. 56. Die „4,2 Mrd. € 2023“ des Dossiers steht nicht in diesem Bericht.
- Neu und für die Lücke „Einhaltung durch Deutschland“ relevant: Mittlere minimale MACZT in DE 2022 / 2023 / 2024 = **38 / 41 / 50 % von Fmax** (Abb. 22, S. 32; ACER nennt DE unter den Ländern mit Fortschritt). Deutschland lag 2024 also deutlich unter 70 %; ob es die Frist Ende 2025 hielt, sagt der Bericht nicht. ACER verweist außerdem auf eine Teilung der Gebotszone DE-LU in fünf Zonen, die den Redispatch-Bedarf in Mitteleuropa von 39 auf 19 TWh (Klimajahr-Spanne bis 45 → 20 TWh) senken würde (S. 6, Z. 12–13) — eine Gegenposition, die das Dossier nur als Forderung Schwedens/Norwegens (Presse, C) führt.

### 3.5 Kleinere Abweichungen

- Fundstellen NEP Kap. 3: 42/73/91 TWh auf S. 67 und 69 (nicht 66/68); 25 TWh in Kap. 3.1 S. 69 (nicht 3.2.1 S. 68); Transit S. 72 (nicht 71); 40 GW Netto-Import in der Stunde höchsten Handels S. 87. Szenariorahmen 2027 Kap. 6.3: S. 122 (nicht 121).
- K8: Die Genehmigung nennt Hansa PowerBridge I **und II**, nennt weder 2024 noch 700 MW. Jahr und Leistung brauchen eine eigene Quelle (Svenska kraftnät, nicht freigegeben).
- K6: installierte Kernkraft FR 2023 = 61,4 GW (Energy-Charts), 63,0 GW erst ab 2024; „Winter Dez–Feb“ ist kein zusammenhängender Winter, sondern Jan, Feb und Dez eines Kalenderjahres.
- 3.4 Dossier: Der Exportpreis (79,8 / 57,4 / 69,0) schließt Luxemburg aus (gleiche Gebotszone, sachlich richtig); die Brutto-Mengen in 3.1 (66,6 / 38,3 TWh) schließen Luxemburg ein. Mit Luxemburg: 81,7 / 60,0 / 71,4 €/MWh (+2,4 / +4,5 / +3,5 %). Abgrenzung im Dossier angeben.
- 3.3 Dossier, Belgien 2025: 2,9 statt 3,0 TWh (Rundung, 2,94).

## 4. Nachrechnungen

Eigener Code `scripts/pruefung/p2_06_nachrechnung.py`: Viertelstundenwerte (GW) × 0,25 h über die Länderspalten summiert, Stundenmittel als Mittel der vier Viertelstunden, Preise 2025 ab Oktober (15-min-Raster) auf Stunden gemittelt, Wind-CF = (Onshore + Offshore) / installierte Jahresleistung, Pearson-r auf gemeinsamen Stunden, Eurostat JSON-stat selbst entpackt.

| Größe | Dossier | Prüfer | Abweichung |
|---|---|---|---|
| Netto kommerziell 2018 / 19 / 20 / 21 / 22 / 23 / 24 / 25, TWh | −54,2 / −35,2 / −18,5 / −17,8 / −26,8 / +11,7 / +28,3 / +21,9 | −54,19 / −35,17 / −18,50 / −17,80 / −26,84 / +11,73 / +28,32 / +21,92 | < 0,2 % |
| Netto physisch 2015–2025, TWh | −37,7 / −41,8 / −46,0 / −48,0 / −34,1 / −19,8 / −20,0 / −27,8 / +8,9 / +25,1 / +18,2 | −37,69 / −41,79 / −46,05 / −48,04 / −34,15 / −19,80 / −19,97 / −27,84 / +8,92 / +25,14 / +18,21 | < 0,2 % |
| Eurostat Netto 2019–2024, TWh | −32,7 / −19,0 / −18,6 / −27,3 / +9,2 / +26,3 | identisch | 0 % |
| Brutto je Grenze 2024 (Import/Export), TWh | 66,6 / 38,3 | 66,6 / 38,3 | 0 % |
| Max. Import/Export kommerziell 2022–2025, GW | 12,4/15,7; 17,1/19,2; 17,0/17,6; 16,2/18,0 | 12,37/15,67; 17,08/19,23; 17,04/17,60; 16,17/18,03 | < 0,3 % |
| Max. Import/Export physisch 2022–2025, GW | 11,4/15,4; 16,9/18,9; 17,3/16,2; 16,7/17,3 | 11,38/15,42; 16,90/18,92; 17,34/16,22; 16,69/17,26 | < 0,3 % |
| Stunden > 15 GW Import 2024 | 25 | 25 | 0 % |
| Saldo je Nachbar 2023–2025 (11 Länder) | Tabelle 3.3 | identisch bis auf BE 2025 2,9 statt 3,0 | Rundung |
| Preise 2023 / 2024 / 2025: DE-Mittel; Importpreis; DE in Importflüssen | 95,2/92,8/106,3; 78,5/69,1/90,5; 89,3/82,8/103,5 | identisch | 0 % |
| Netto-Import-/Exportstunden 2023 | 5.105 / 3.655 | 5.104 / 3.656 | 0,02 % |
| Spitzen > 200 €/MWh (davon Import, Ø GW) | 112 (102, 5,5); 129 (129, 11,1); 162 (161, 10,0) | 112 (102, 5,45); 129 (129, 11,08); 162 (161, 10,02) | 0 % |
| Wind-r je Land und Aggregat 2023/2024 | Tabelle 4.1 | alle auf 0,01 gleich | 0 % |
| DE-Stunden CF < 10 % 2023 / 2024 | 2.380 / 2.481 | 2.382 / 2.481 | +0,08 % / 0 % |
| Beide < 10 % | 622 / 543 | 622 / 543 | 0 % |
| Längste Phase DE < 10 % & Aggregat < 15 % | 123 / 57 h | 123 / 57 h | 0 % |
| FR Kernkraft Jahr 2023 / 2024, TWh | 319 / 360 | 318,8 / 360,1 | < 0,1 % |
| NTC-Summen Tab. 11 | 49,6 / 49,6 | 49,6 / 49,6 | 0 % |
| 1,4 GW × 120 h; 0,6 GW × 120 h | 168 / 72 GWh | 168 / 72 GWh | 0 % |
| Preisabstand × Importmenge 2024 | ~1,4 Mrd. € | (90,5 − 69,1) × 66,6 TWh = 1,43 Mrd. € | 0 % (Setzung bleibt Setzung) |

Zusatz des Prüfers: Höchste Stundensumme der Brutto-Importe (nur positive Grenzwerte) 2023/2024/2025: 17,5 / 17,7 / 17,6 GW kommerziell, 17,9 / 17,9 / 17,6 GW physisch — die Netto-Spitze unterschätzt die genutzte Importleistung also nur wenig. Höchster DE-Day-Ahead-Preis 2024: 936,3 €/MWh am 12.12.2024, 16:00 UTC.

## 5. Einseitigkeit und fehlende Gegenpositionen

Zugunsten des Hauptpfads „Erneuerbare + Speicher“ zu günstig:
- K3 deutet eine Marktkopplungs-Mechanik als Versicherungsbeleg (3.2). Der 12.12.2024 zeigt die Grenze: Import am Anschlag, Preis trotzdem 936 €/MWh.
- ACER: Die 70-%-Regel kostet laut ACER selbst Investitions- oder Betriebsaufwand, der den Nutzen „teilweise“ aufzehrt (Z. 49), und ihr Nutzen geht zu einem Teil zulasten der Produzenten und Engpasserlöse. Das Dossier nennt nur die Bruttozahl.
- ENTSO-E ERAA 2025 (Webseite gelesen, Zahlen in nicht erreichbaren Anhängen): erhebliche fossile Kapazität in Europa droht unwirtschaftlich zu werden, Versorgungsrisiken „in mehreren europäischen Ländern“ mit engen Margen, steigend mit dem Zeithorizont. Das ist die naheliegende Gegenposition zur Annahme, die Nachbarn hätten in Knappheit Leistung übrig; das Dossier erwähnt ERAA nur als „nicht erreichbar“.

Zulasten des Hauptpfads zu ungünstig:
- K7 verschweigt das NEP-Trendszenario 2032 mit Netto-Export (3.1) und den Kostencharakter der Netto-Importe.
- K5 rechnet nur direkte Leitungen zu Norwegen/Schweden (3.3).
- Die Spitzenwerte 2023 und 2025 lagen im Sommer bzw. Frühjahr (14.7.2023, 25.4.2025) — die Importspitze ist kein Knappheitsindikator; der Vergleich „17 GW genutzt gegen 50 GW geplant“ misst also nicht, was in einer Flaute zur Verfügung stünde, sondern was der Markt bisher brauchte.

Fehlende Gegenposition beider Richtungen: Die Gebotszonenteilung Deutschlands steht bei ACER als Instrument mit beziffertem Nutzen (Redispatch −40 bis −60 %), im Dossier nur als Forderung skandinavischer Politiker.

## 6. Weiterhin nicht erreichbar

| Host / Dokument | Grund |
|---|---|
| ENTSO-E ERAA 2025 (Berichte, Anhänge, LOLE je Land) und TYNDP 2024/2026 | Dokumente liegen auf eepublicdownloads.blob.core.windows.net / azureedge.net bzw. tyndp.entsoe.eu, nicht freigegeben; www.entsoe.eu liefert nur die Übersichtsseiten |
| www.consilium.europa.eu, Pressemitteilung 5.3.2026 (2040-Ziel) | 403 mit Browser-Prüfung, nicht umgangen |
| Heutige NTC je Grenze (ENTSO-E Transparency) | transparency.entsoe.eu nicht freigegeben |
| Wasserkraftspeicher NO/SE (NVE, Statnett, Svenska kraftnät), Hansa PowerBridge-Jahr und -Leistung | nicht freigegeben |
| EUA-Kurse, ETS-2-Verschiebung im Amtsblatt | nicht gesucht bzw. EUR-Lex-Fundstelle nicht ermittelt; gehört zu P1-09 |

Quellen der Websuche (nur zur URL-Ermittlung): [Consilium 5.3.2026](https://www.consilium.europa.eu/en/press/press-releases/2026/03/05/2040-climate-target-council-gives-final-green-light/), [Kommission 2040 climate target](https://climate.ec.europa.eu/areas-action/climate-strategies-targets/2040-climate-target_en).

## 7. Korrekturen

```json
{
  "dossier": "06_europa",
  "pruefung": "P2-06",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "kernaussage_7_dauerhafter_import", "alt": "Die Netzplanung erwartet dauerhaften Netto-Import.", "neu": "Die Netzplanung erwartet für 2037 und 2045 Netto-Import (25-91 TWh), im Trendszenario 2032 dagegen Netto-Export von 32 TWh (Export 116, Import 83 TWh). Der Import ist im Modell ein Kostenergebnis (teure inländische H2-Kraftwerke), keine Knappheit.", "fundstelle": "NEP 2037/2045 V2025 2. Entwurf, Kap. 3.2.5, S. 85; Kap. 3, S. 67", "confidence": "A", "primaer_gelesen": true, "begruendung": "Trendszenario 2032 im selben Dokument unterschlagen"},
    {"id": "acer_70pct_core_wohlfahrt_mio_eur", "alt": "580 Mio. EUR mindestens wären gewonnen worden; EU-Engpasskosten 2023 4,2 Mrd. EUR (C, nicht gelesen)", "neu": "580 Mio. EUR Gesamtnutzen der 70-%-Regel in der Core-Region 2024 (at least), davon 240 Mio. EUR 2024 realisiert, 340 Mio. EUR offen; EU-Engpasskosten 2024: 4,3 Mrd. EUR für 60 TWh", "fundstelle": "ACER Monitoring Report 2025 Cross-zonal capacities, S. 5 (Z. 5), S. 6 (Z. 11), S. 17 (Z. 47, Abb. 6), S. 56 (Z. 173)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Original gelesen; Abgrenzung des entgangenen Nutzens und Jahr/Betrag der Engpasskosten weichen ab"},
    {"id": "acer_macztde_pct_fmax", "alt": "Lücke: Einhaltung der 70-%-Regel durch Deutschland", "neu": "Deutschland, mittlere minimale MACZT in Core: 2022 38 %, 2023 41 %, 2024 50 % von Fmax (Ziel 70 % bis Ende 2025)", "fundstelle": "ACER Monitoring Report 2025, Abb. 22, S. 32", "confidence": "B", "primaer_gelesen": true, "begruendung": "neuer Wert, schließt Lücke teilweise"},
    {"id": "kernaussage_3_preisspitzen", "alt": "Der Verbund hilft in Preisspitzen sehr deutlich.", "neu": "In Preisspitzen importiert Deutschland deutlich mehr als sonst (2024 Ø 11,1 GW gegen 6,4 GW in allen Importstunden); dass Spitzen mit Import zusammenfallen, folgt aber teilweise aus der Marktkopplung (2024 waren 72,5 % aller Stunden Importstunden). Am 12.12.2024 lagen Rekordimport (17,0 GW) und Jahreshöchstpreis (936 EUR/MWh) am selben Tag.", "fundstelle": "eigene Nachrechnung scripts/pruefung/p2_06_nachrechnung.py, Energy-Charts cbet + price DE-LU", "confidence": "B", "primaer_gelesen": true, "begruendung": "Zahlen bestätigt, Kausalschluss zu stark"},
    {"id": "de_max_preis_2024_eur_mwh", "alt": "Presse: 900-1.000 EUR/MWh am 12.12.2024, nicht geprüft", "neu": "936,3 EUR/MWh, 12.12.2024 16:00 UTC", "fundstelle": "Energy-Charts price DE-LU 2024 (Bundesnetzagentur | SMARD.de), eigene Rechnung", "confidence": "B", "primaer_gelesen": true, "begruendung": "aus vorhandenen Rohdaten belegbar"},
    {"id": "kernaussage_5_nordische_leitung", "alt": "nur 1,4 GW zwischen Norwegen und Deutschland und 0,6 GW zu Schweden", "neu": "direkt 1,4 GW (NO) und 0,6 GW (SE); indirekt zusätzlich über DKW/DKE (NO->DKW 1,4; SE->DKE 1,3; SE->DKW 1,4; DKW->DE 5,5; DKE->DE 2,6) und NL (NO->NL 0,7; NL->DE 5,0). 168/72 GWh in 120 h sind eine Untergrenze.", "fundstelle": "NEP 2037/2045 V2025 2. Entwurf, Kap. 2, Tab. 11, S. 54; Kap. 3.1, S. 71", "confidence": "B", "primaer_gelesen": true, "begruendung": "indirekte Wege im selben Tabellenwerk"},
    {"id": "kernaussage_8_hansa_powerbridge", "alt": "Schweden hat 2024 die Hansa PowerBridge (700 MW) ausgesetzt (laut Genehmigung, A)", "neu": "Hansa PowerBridge I und II wurden von schwedischer Seite ausgesetzt; positiver Mehrwert in allen KNA, Wiederaufnahme aus deutscher Sicht begrüßenswert (A). Jahr 2024 und 700 MW nicht in dieser Quelle (C).", "fundstelle": "BNetzA, Genehmigung Szenariorahmen 2025-2037/2045, S. 75", "confidence": "A", "primaer_gelesen": true, "begruendung": "Belegzuordnung; Quelle nennt beide Projekte, kein Jahr, keine Leistung"},
    {"id": "nep_nettoimport_2037_a_twh", "alt": "fundstelle: Kap. 3.2.1, S. 68", "neu": "fundstelle: Kap. 3.1, S. 69", "fundstelle": "NEP 2037/2045 V2025 2. Entwurf, Kap. 3.1, S. 69", "confidence": "A", "primaer_gelesen": true, "begruendung": "Seitenzählung nach Fußzeile"},
    {"id": "nep_nettoimport_2045_twh", "alt": "fundstelle: Kap. 3, Zusammenfassung S. 66 und Kap. 3.2.1 S. 68", "neu": "fundstelle: Kap. 3, Zusammenfassung S. 67; Kap. 3.1, S. 69", "fundstelle": "NEP 2037/2045 V2025 2. Entwurf", "confidence": "A", "primaer_gelesen": true, "begruendung": "Seitenzählung nach Fußzeile"},
    {"id": "nep_handelstransit_2045_twh", "alt": "fundstelle: Kap. 3.1, S. 71", "neu": "fundstelle: Kap. 3.1, S. 72", "fundstelle": "NEP 2037/2045 V2025 2. Entwurf, Kap. 3.1, S. 72", "confidence": "A", "primaer_gelesen": true, "begruendung": "Seitenzählung nach Fußzeile"},
    {"id": "ntc_2040_2045_pfad_ab_gw", "alt": "fundstelle: Kap. 6.3, S. 121", "neu": "fundstelle: Kap. 6.3, S. 122", "fundstelle": "Szenariorahmenentwurf NEP 2040/2045 (2027), Kap. 6.3, S. 122", "confidence": "A", "primaer_gelesen": true, "begruendung": "Seitenzählung; gilt auch für ntc_2045_pfad_c_gw und ntc_bmwe_o45_strom_gw"},
    {"id": "eu_mindestkapazitaet_handel_pct", "alt": "confidence A, eine Quelle (Szenariorahmen)", "neu": "confidence A, zwei Quellen: Szenariorahmen 2027 S. 116/121 und ACER MMR 2025 S. 5", "fundstelle": "ACER Monitoring Report 2025, S. 5-6", "confidence": "A", "primaer_gelesen": true, "begruendung": "unabhängige Zweitquelle gelesen"},
    {"id": "eu_klimaziel_2040_pct", "alt": "C, primaer_gelesen false", "neu": "90 % netto ggü. 1990, davon 85 % heimisch und bis zu 5 % internationale Gutschriften; Annahme März 2026. 'ab 2036' nicht wörtlich bestätigt (Kommission: 'second part of 2030-2040')", "fundstelle": "Europäische Kommission, 2040 climate target, Stand 7.4.2026", "confidence": "B", "primaer_gelesen": true, "begruendung": "Kommissionsseite gelesen; Ratsseite durch Browser-Prüfung gesperrt"},
    {"id": "fr_kernkraft_winter_mittel_gw", "alt": "Dez-Feb; installiert 63,0 GW", "neu": "Jan+Feb+Dez desselben Kalenderjahres (2023: 42,0 GW, Min 23,7; 2024: 47,1 GW, Min 31,8); installiert 2023 61,4 GW, 2024 63,0 GW", "fundstelle": "Energy-Charts public_power FR, installed_power FR", "confidence": "B", "primaer_gelesen": true, "begruendung": "Abgrenzung präzisiert, Werte bestätigt"},
    {"id": "importpreis_2024_eur_mwh", "alt": "Exportpreis 57,4 (2023: 79,8; 2025: 69,0)", "neu": "Exportpreis ohne Luxemburg 57,4 / 79,8 / 69,0; mit Luxemburg 60,0 / 81,7 / 71,4 EUR/MWh", "fundstelle": "eigene Nachrechnung, Energy-Charts cbet + price", "confidence": "B", "primaer_gelesen": true, "begruendung": "Abgrenzung fehlte; Bruttomengen in 3.1 schließen LU ein"},
    {"id": "gleichzeitige_flaute_stunden", "alt": "DE allein unter 10 %: 2.380 (2023)", "neu": "2.382 (2023)", "fundstelle": "eigene Nachrechnung", "confidence": "B", "primaer_gelesen": true, "begruendung": "Abweichung 0,08 %, ohne Einfluss auf Aussagen"}
  ]
}
```
