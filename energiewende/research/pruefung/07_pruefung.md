# Prüfbericht 07 · Lieferketten und Abhängigkeiten

Auftrag P2 · Gegenprüfung von `research/07_lieferketten.md` · Stand 22.11.2026 · Prüfer: Opus, nicht Autor des Dossiers
Eigener Code: `scripts/pruefung/p2_07_comext.py`, `p2_07_energie.py`, `p2_07_energiewerte.py`, `p2_07_stresstest.py` (alle mit `python3 -I`, Argument `quellen/raw/P1-07`, ohne die Skripte `p107_*` zu übernehmen).
Grundlage: die Rohdateien der Phase 1 unter `quellen/raw/P1-07/` (Comext-JSON, nrg_ind_id, nrg_ti_*, AGEB-Jahresbericht 2024, ISE-Photovoltaics-Report 07/2026, ISE-Foliensatz „Solar PV supply chains“ 11/2025). Diagrammwerte wurden an den gerenderten Seiten abgelesen.

## 1. Urteil in fünf Zeilen

1. Die Datenbasis ist sauber: Alle Comext-Anteile, Importquoten, Russland-Anteile, die AGEB-Importrechnung und die ISE-Werte stehen so in den Quellen (Abweichungen ≤ 0,5 Prozentpunkte).
2. Schief ist die **Stresstest-Kostenrechnung** (Kernaussage 8): Der Modulanteil von 30 % beruht auf IRENA-Modulkosten von rund 25 ct/Wp, der Preisfaktor auf einem Marktpreis von 8,7 ct/Wp. Bei konsistenter Basis sinkt der Aufschlag von + 7,5 / 27 / 57 % auf etwa + 3 / 10 / 22 %.
3. Die Zahl 11,7 Mrd. € (Kernaussage 5) ist **keine Obergrenze**, wie das Dossier sagt. Ware chinesischen Ursprungs, die über die Niederlande oder Belgien kommt, fehlt darin. Die Richtung des Fehlers ist offen.
4. Kleinere Fehler: Der HHI für Rohöl 2021 ist nicht reproduzierbar (1.788 statt 1.878), eine AGEB-Seitenangabe ist falsch, die Steinkohle-Russlandquote hat in Tabelle und JSON zwei verschiedene Abgrenzungen, und die Konfidenz A der Importquoten verdeckt einen Methodenunterschied von bis zu 4 Prozentpunkten.
5. Einseitigkeit gibt es in beide Richtungen. Der Anstieg 2015 → 2025 bei PV blendet das Ende der EU-Mindestimportpreise 2018 aus (zugunsten der R21-Lesart). Der Gas-PV-Vergleich rechnet den Zubauausfall im ersten Jahr voll (zugunsten des Hauptpfads, Faktor 2).

## 2. Prüftabelle

Ergebnis: **b** = bestätigt · **a** = abweichend · **n** = nicht prüfbar. Wo nicht anders vermerkt, ist `primaer_gelesen` nach der Prüfung `true`.

### 2.1 Kernaussagen

| Nr. | Wert im Dossier | Geprüfte Fundstelle | Ergebnis | neue Konfidenz |
|---|---|---|---|---|
| K1 | PV Poly 93, Wafer 97, Zellen 90, Module 86 % (2024); Wechselrichter 68 %, Glas 93 % (2023); HHI ≥ 7.400–9.400 | ISE-Foliensatz Folie 9 (IEA PVPS Trends 2025) und Folie 10 (SPE 2024, Solarbe 2024); HHI = Anteil² nachgerechnet | b | B (eine Quellenkette) |
| K2 | China-Anteil Extra-EU: PV 38 → 98 %, Li-Ion 29 → 90 % (2015–2025) | Comext DS-045409, eigene Rechnung: PV 37,7 / 98,4; Li-Ion 29,4 / 90,0 | b (Lücke in der Deutung, siehe 5) | B |
| K3 | Trafo > 10 MVA 9 → 55 % (2019–2025), 650 kVA–10 MVA 1 → 43 %; Kupfer ≈ 0; Polysilizium 4–14 % | Comext: 9,3 / 54,6; 1,2 / 43,4; Kathoden 0,0–2,0, Erz 0,0; Poly 3,8–13,9 | b, aber 2015 lag der Trafo-Wert bei **18,5 %** (im Dossier „–“), 2024 bei 41,5 % | B |
| K4a | Importquoten DE: Öl 97, Gas 92–95, Steinkohle 100, gesamt 67–68 % | Eurostat nrg_ind_id (Öl 96,9; Gas 91,6/93,7; gesamt 66,8); AGEB JB 2024 PDF-S. 12 (gedruckt S. 10): Öl knapp 97, Gas rund 95, Steinkohle 100 (2023), gesamt > 68 %; AGEB S. 21: Gas-Importquote 2024 **95,6 %** | b | A für die Größenordnung, Punktwerte methodenabhängig |
| K4b | Importrechnung 69,0 / 135,4 / 81,4 / 69,0 Mrd. € (2021–2024) | AGEB JB 2024, Tabelle 3, **PDF-S. 12, gedruckt S. 10** (nicht S. 11) | b (Seitenangabe a) | B |
| K5 | DE-Einfuhr aus China, 6 Gruppen, 2025: ≈ 11,75 Mrd. €, „Obergrenze“ | Comext DE: 9.625 + 1.285 + 478 + 257 + 47 + 56 = 11.748 Mio. € | Summe b; Bezeichnung „Obergrenze“ **a** (siehe 3.2) | B, Setzung M |
| K6 | Gasimport 2024 767 TWh; PV-Zubau 16,6 GWp bei 108 GWp | nrg_ti_gas 2.762.678 TJ GCV = 767 TWh; ISE-Report S. 6 | b; ESMC > 200 GW **n** (solarserver.de nicht freigegeben) | B / C |
| K7 | Module außerhalb Chinas ≈ 180 GW (SOA 75, IN 45, US 30, EU+TR 28); EU ohne Wafer | ISE-Report S. 13 abgelesen: ≈ 73 / 43 / 30 / 27, dazu JP/KR 7 und LatAm 4, zusammen ≈ 184; S. 14 „No active Ingot & Wafer production“ | b; Ergänzung: SO-Asien betreibt ≈ 45 GW Zellen und ≈ 15 GW Wafer, die EU ≈ 30 GW Polysilizium | C (Diagramm) / B |
| K8 | Faktoren 1,25 / 1,9 / 2,9; Anlagenkosten + 7,5 / 27 / 57 % | ISE-Foliensatz Folie 17: 16,5/8,7 = 1,90; 25,5/8,7 = 2,93 (b). ISE-Report S. 51/52: Modulanteil 30 % (b) | Faktoren b; Kostenaufschlag **a**: konsistent + 2,9 / 10,3 / 21,8 % | B für die Eingänge, Setzung M |
| K9 | Gallium, Dy/Tb außerhalb Chinas ×5, Ge ×3 | BOFIT/SOCI/IEA nicht freigegeben | n | C, `false` |
| K10 | HHI Öl 1.280 (2024) / 1.790 (2021), Kohle 3.340 / 2.470 | nrg_ti_oil/sff, eigene Rechnung | Öl 2021 **a** (1.878 bzw. 1.698), Kohle b, Öl 2024 b | B |

### 2.2 Parameter mit Konfidenz A (alle drei)

| ID | Dossier | Fundstelle | Ergebnis | neu |
|---|---|---|---|---|
| de_importabhaengigkeit_gesamt_2024_pct | 66,8 | nrg_ind_id TOTAL DE 2024: 66,812; AGEB 2023 „mehr als 68 %“, 2024 „kaum verändert“ (Eigengewinnung ≈ 32 %) | b | A mit Spanne 66,8–68 |
| de_importabhaengigkeit_gas_2024_pct | 91,6 | nrg_ind_id G3000: 91,578; AGEB S. 21, Tabelle Erdgas: Importquote 2024 95,6 %, 2023 96,0 % | b, aber AGEB liegt 4 Pp. höher (Anteil am PEV statt Nettoimporte am Bruttoinlandsverbrauch) | A für „über 90 %“; Punktwert B, Spanne 91,6–95,6 |
| de_importabhaengigkeit_oel_2024_pct | 96,9 | nrg_ind_id O4000XBIO: 96,941; AGEB 2023 knapp 97 % | b | A |

### 2.3 Stichprobe B (38 B-Parameter, k = 3, Positionen 0, 3, 6, …, 27 der alphabetisch sortierten IDs)

| # | ID | Dossier | Fundstelle | Ergebnis | neu |
|---|---|---|---|---|---|
| 0 | de_fossile_nettoimportrechnung_mrd_eur | 69,0 (2024) und Reihe | AGEB Tab. 3, gedruckt S. 10 | b (Seite a) | B |
| 3 | de_import_liion_2025_mio_eur | 20.490, CN 9.625, Extra-EU 10.217 | Comext DE 850760 2025 | b | B |
| 6 | de_russland_anteil_gasimport_2021_pct | 66,4 | nrg_ti_gas DE 2021: 66,4 %; Partnerabdeckung 86 % (2019: 54 %) | b | B |
| 9 | eu_extra_import_china_anteil_hs_kabel_2025_pct | 19 | Comext 854460: 19,1 | b | B |
| 12 | eu_extra_import_china_anteil_magnete_2025_pct | 88 | Comext 850511: 88,2 | b | B |
| 15 | eu_extra_import_china_anteil_stromrichter_2025_pct | 59 | Comext 850440: 59,0 | b | B |
| 18 | eu_pv_wafer_kapazitaet_gw | 0 | ISE-Report S. 14: „No active Ingot & Wafer production“; S. 13 Europa Ingot/Wafer nur geplant | b | B |
| 21 | hhi_untergrenze_pv_wafer | 9.409 | 97² aus Folie 9 | b (Rechnung) | B |
| 24 | nzia_eigenfertigung_ziel_2030_pct | 40 | EUR-Lex (VO 2024/1735) antwortet mit HTTP 202 ohne Inhalt, nicht umgangen. Websuche (Kommissionsseite, EP-Zusammenfassung): „approaches or reaches at least 40 % of annual deployment needs by 2030“, **indikativer** Richtwert | n am Primärtext; Inhalt per Suchtreffer b | B, `false`; Hinweis „indikativ, nicht bindend“ ergänzen |
| 27 | pv_mindestpreis_modul_china_ct_wp | 15,9 | Folie 17: „Fully-China“ geliefert 15,9 (2025 €ct/Wp) | b | B |

### 2.4 Schwerpunkte und weitere geprüfte Werte

| Gegenstand | Dossier | Prüfung | Ergebnis |
|---|---|---|---|
| China-Anteile Extra-EU, alle 14 Zeilen in 3.1 | siehe Dossier | Comext, eigene Rechnung | b für alle Jahre (größte Rundungsdifferenz 0,4 Pp.); Trafo 850423 2015 = 18,5 % fehlt |
| DE-Tabelle 3.2 (8 Zeilen) | siehe Dossier | Comext DE | b (PV aus NL 1.208 Mio. € 2025, 2.484 Mio. € 2023) |
| Mengen- statt Wertanteil PV, EU (Gegenprobe) | – | Comext 100 kg: 46,8 % (2015) → 99,3 % (2025) | stützt K2 |
| Module Extra-EU 22,3 (2022) → 8,0 Mrd. € (2025) | 22,3 / 8,0 | Comext 854143: 22,31 / 7,98 | b |
| EU-Gaseinfuhr 2711 | 71,8 / 234,9 / 88,3 | Comext | b; 2024: 81,8 |
| DE-Rohöl 2709 | 60,0 / 44,8 / 35,8 | Comext | b |
| Uran 284420, RU-Anteil | 66/40/37/29/10/19 | Comext: 66,4/39,5/37,0/28,8/10,3/19,0 | b |
| Russland-Anteil Steinkohle 2021 | Tabelle 52,6 %, JSON 50,1 % | nrg_ti_sff: C0100 Steinkohle 52,6; C0000X0350-0370 feste Fossile 50,1 | beide b, aber **zwei Abgrenzungen** unter einer Überschrift |
| Hauptlieferanten Steinkohle 2024 | AU 36, US 30, CO 13 | Eurostat b; AGEB Tab. 10 (Destatis): AU 28,7, US 24,4, CO 11,3, 21,8 % nicht zuordenbar | b mit Quellenhinweis |
| Importquoten EU27 2024 | 57,3 / 85,0 / 96,6 / 48,0 / 34,2 | nrg_ind_id | b |
| ISE: 108 GWp, 16,6/16,9 GWp, 2.974 GWp, 87 TWh, Lebensdauer 25 (S. 37) / 20 (S. 8), ASP 0,10 US$/Wp, Streichung der 9-%-Exportsteuererstattung im April 2026 | siehe Dossier | ISE-Report S. 4, 6, 8, 9, 37 | b |
| MSP 2024 ab Werk China 14,6, SOA 15,0, IN 17,0, US 27,4, EU 24,1 | siehe Dossier | Folie 16 | b; Lohnkosten EU ≈ 390 % von China, also + 290 % statt + 280 % (Diagramm abgelesen, unerheblich) |

**Summe:** 46 geprüfte Werte. **39 bestätigt**, **4 abweichend** (Stresstest-Kostenaufschlag, Etikett „Obergrenze“, HHI Öl 2021, AGEB-Seitenangabe), **3 nicht prüfbar** (K9-Preisfaktoren, ESMC > 200 GW, NZIA am Primärtext).

## 3. Abweichungen im Detail (nach Gewicht)

### 3.1 Stresstest-Kostenaufschlag: zwei Preisbasen vermischt (Kernaussage 8, Abschnitt 7)

Das Dossier rechnet Aufschlag = Modulanteil 30 % × (Faktor − 1). Den Faktor bildet es gegen den Marktpreis 8,7 ct/Wp. Der Modulanteil von 30 % stammt aus den IRENA-Daten (ISE-Report S. 51, Mittel der Länder). Dort kostet der Modulblock für Deutschland 2025 etwa **255 €/kWp ≈ 25,5 ct/Wp** (S. 51/52, abgelesen ± 10 €/kWp) bei 758 €/kWp gesamt. Das ist fast das Dreifache des Marktpreises und entspricht schon dem „EU-skalierten“ Mindestpreis.

- **Konsistent auf Marktpreisbasis** (8,7 ct/Wp in einer 758-€/kWp-Anlage, Modulanteil 11,5 %): + 2,9 / + 10,3 / + 21,8 % statt + 7,5 / + 27 / + 57 %. Das Dossier überzeichnet den Aufschlag um den Faktor 2,6.
- **Konsistent auf IRENA-Basis:** Der Ersatz durch EU-Module zum skalierten Mindestpreis (25,5 ct/Wp) läge auf dem Niveau der von IRENA ausgewiesenen Modulkosten, also ≈ + 0 %. Das zeigt eher, dass die IRENA-Kostenaufteilung und die Spotpreise nicht zusammenpassen, als dass es einen echten Nullaufschlag belegt.
- Richtung: Die Dossier-Werte **stärken die R21-Lesart** zu Unrecht. Empfehlung: Spanne + 3 / + 10 / + 22 %, Abgrenzung „Großanlage Deutschland 2025, Modulpreis auf 8,7 ct/Wp-Basis“.

Zusätzlich: Auch Chinas eigener Mindestpreis liegt bei 15,9 ct/Wp, also beim Faktor 1,83. Der mittlere Faktor 1,9 misst damit fast vollständig das **Ende des Überkapazitätspreises** und kaum den Wechsel weg von China (16,5 gegen 15,9 = + 4 %). Das Dossier sagt das in 7 selbst („Überkapazitäts-Preis“), verbucht den Faktor im Stresstest aber als Folge des Lieferstopps. Das sollte getrennt ausgewiesen werden: (a) Normalisierung auf den Mindestpreis (× 1,8), (b) Aufschlag Nicht-China (SOA × 1,04, EU skaliert × 1,6 gegen China-Mindestpreis).

### 3.2 „Obergrenze“ 11,7 Mrd. € (Kernaussage 5, Stresstest-Zeile „Importrechnung“)

Die Summe stimmt (11.748 Mio. €). Sie ist aber keine Obergrenze. Comext weist bei innergemeinschaftlichem Handel das Versendungsland aus, und das Dossier beschreibt den Rotterdam-Effekt in 3 selbst. Deutschland bezog 2025 PV für 1.208 Mio. € aus den Niederlanden, gegen 257 Mio. € direkt aus China. Bei Li-Ion-Akkus kamen 10.273 Mio. € aus EU-Ländern. Ein großer Teil davon ist sehr wahrscheinlich chinesischen Ursprungs, beziffern lässt er sich aus Comext nicht.

Zwei Fehler wirken also gegeneinander: Nicht-Energiewende-Verwendungen (Akkus, Netzteile) treiben die Zahl nach oben, die Durchleitung über Rotterdam und Antwerpen drückt sie nach unten. Außerdem fehlen Türme (142 Mio. €), Trafos und Getriebe.
Empfehlung: „Größenordnung, Richtung des Fehlers offen“ statt „Obergrenze“. Für eine Obergrenze käme eine EU-Rechnung in Frage, etwa der deutsche Anteil an den Extra-EU-Einfuhren der EU aus China (PV 7,9 Mrd. €, Li-Ion 25,7 Mrd. €), skaliert mit einem Verbrauchsschlüssel. Das wäre Setzung M.

### 3.3 HHI Rohöl 2021 (Kernaussage 10, 2.2)

Das Dossier nennt 1.788. Eigene Rechnung aus nrg_ti_oil: 1.878, wenn die Anteile an der Summe der Einzelländer gemessen werden (dieselbe Methode liefert die Dossier-Werte 1.280 für Öl 2024 sowie 3.338 und 2.474 für Steinkohle exakt), oder 1.698 bezogen auf TOTAL. 1.788 liegt nahe am Wert für 2015 (1.786) und ist vermutlich ein Zahlendreher. Die Aussage von K10 ändert sich nicht.

### 3.4 Kleinere Punkte

- **AGEB-Seite:** Tabelle 3 und der Text zur Importabhängigkeit stehen auf gedruckt S. 10 (PDF-S. 12), nicht auf S. 11.
- **Konfidenz A bei den Importquoten:** Eurostat und AGEB stimmen in der Größenordnung überein, bei Gas aber nicht im Punktwert (91,6 gegen 95,6 % für 2024; AGEB misst den Anteil am Primärenergieverbrauch). „Unabhängig übereinstimmend“ gilt für die Spanne, nicht für den Punktwert.
- **Steinkohle-Russlandanteil:** Die Tabelle 4.2 nutzt C0100 (52,6 %), das JSON C0000X0350-0370 (50,1 %) mit anderer Einheit-Beschreibung. Beides stimmt, sollte aber einheitlich sein.
- **Trafo-Reihe:** Die Startwahl 2019 (9,3 %) liegt in einem Tief. 2015 waren es 18,5 %, 2024 41,5 %. „Von 9 auf 55 %“ ist korrekt, aber der günstigste Startpunkt für die These „wächst“. Bei Deutschland allein sind es nur 4 % der Gesamteinfuhr (17 von 391 Mio. €).

## 4. Nachrechnungen

| Rechnung | Dossier | Nachrechnung | Abweichung |
|---|---|---|---|
| China-Anteil Extra-EU PV 2025 | 98,4 % | 98,4 % | 0 % |
| China-Anteil Extra-EU Li-Ion 2025 / 2015 | 90 / 29 % | 90,0 / 29,4 % | 0 / + 1,4 % |
| Trafo > 10 MVA 2019 / 2025 | 9 / 55 % | 9,3 / 54,6 % | ± 1 % |
| Trafo 650 kVA–10 MVA 2019 / 2025 | 1 / 43 % | 1,2 / 43,4 % | Rundung |
| DE-China-Summe sechs Gruppen 2025 | 11.750 Mio. € | 11.748 Mio. € | 0,0 % |
| Fossile Importrechnung 2020–2024 kumuliert | 396 Mrd. € | 396,2 | 0 % |
| Mehrrechnung 2022 gegen 2021 | + 66,4 Mrd. € / + 96 % | + 66,4 / + 96,2 % | 0 % |
| HHI Rohöl 2021 | 1.788 | 1.878 (Länderbasis) / 1.698 (TOTAL) | + 5,0 % / − 5,0 % |
| HHI Rohöl 2024, Steinkohle 2021/2024 | 1.280 / 3.338 / 2.474 | 1.280 / 3.338 / 2.474 | 0 % |
| Gas 2024 in TWh | 767 | 767,4 | 0 % |
| Modulpreisfaktoren | 1,9 / 2,9 / 3,5 | 1,90 / 2,93 / 3,54 | ≤ 1 % |
| Kostenaufschlag Großanlage | 7,5 / 27 / 57 % | 2,9 / 10,3 / 21,8 % (konsistente Basis) | − 61 % |
| PV-Zubauausfall J1/J2, Faktor gegen Gas | 14 / 28 TWh; 27–55 | 14,5 / 29,0 TWh; 26,5–52,9 (Bestandsmittel 99,7 statt 104 GWp) | ≈ 4 % |
| Ersatzbedarf 108/25 | 4,3 GWp/a | 4,32 | 0 % |

Code und Ergebnis lassen sich mit `python3 -I scripts/pruefung/p2_07_*.py quellen/raw/P1-07` reproduzieren (`p2_07_stresstest.py` ohne Argument).

## 5. Einseitigkeit und fehlende Gegenpositionen

**Zugunsten der R21-Lesart (Abhängigkeit wird größer dargestellt, als die Quellen hergeben):**
- K8 (3.1): Der Kostenaufschlag ist um den Faktor 2,6 überzeichnet, und der Effekt „Ende der Überkapazität“ wird dem Lieferstopp zugeschrieben.
- K2: Den Sprung von 38 % (2015) auf 98 % erklärt zu einem guten Teil Handelspolitik. Von Dezember 2013 bis 3. September 2018 galten EU-Antidumping- und Ausgleichszölle mit Mindestimportpreis für chinesische Module und Zellen (Websuche: pv magazine 31.08.2018, pv-tech; `primaer_gelesen: false`, Konfidenz B). Der Anstieg 2015 → 2019 fällt in diese Phase. „Die Abhängigkeit wächst“ stimmt, aber 2015 ist ein durch Zölle gedrückter Startwert. Die Gegenposition fehlt im Dossier.
- K3: Die Startwahl 2019 bei den Trafos (siehe 3.4).

**Zugunsten des Hauptpfads (Abhängigkeit wird kleiner dargestellt):**
- 5.2 Bestand gegen Fluss: Der Ausfall des ersten Jahres wird voll angesetzt (14 TWh). Anlagen, die im Lauf des Jahres nicht gebaut werden, hätten im Mittel nur ein halbes Jahr erzeugt (≈ 7 TWh). Das ist eine konservative Wahl zugunsten der PV-Seite, aber der Faktor 27–55 wird dadurch nicht kleiner, sondern eher größer. Schwerer wiegt, dass Gas als Primärenergie (Brennwert) gegen PV-Strom verglichen wird. In Nutzenergie oder Strom gerechnet schrumpft der Abstand deutlich. Das Dossier nennt den Vorbehalt, rechnet aber keine Variante. Mit AGEB-Nettoimport 692,5 TWh (Hi) liegt der Faktor bei 24–48.
- Die Rohstoff-Einfuhrstruktur der EU („kaum aus China“) ist richtig gemessen, unterschätzt aber die Abhängigkeit, weil China als Raffinierer und Zellhersteller zwischen Mine und EU sitzt. Das Dossier sagt das. Gut.
- Die ISE-Aussage, die Gesamtkosten großer PV-Anlagen in Deutschland seien 2025 um rund 40 % gestiegen (Report S. 9; 548 → 758 €/kWp, S. 52), mit Hardware als Mitursache, fehlt im Dossier. Sie zeigt, dass Preisschocks bei Anlagen auch ohne Lieferstopp real sind.
- K7: SO-Asien betreibt neben Modulen auch ≈ 45 GW Zellen und ≈ 15 GW Wafer (S. 13), die EU ≈ 30 GW Polysilizium. Der Satz, die SO-Asien-Fabriken seien auf chinesische Zellen und Wafer angewiesen, ist damit etwas zu pauschal, auch wenn viele dieser Werke chinesischen Konzernen gehören (nicht geprüft).

**Fehlende Gegenposition, beide Richtungen:** Bei der Konzentration der Ölbezüge (HHI) fehlt die Weltmarkt-Perspektive (OPEC+-Anteil), die das Dossier selbst als Lücke nennt. Ohne sie bleibt der Vergleich PV-Weltproduktion gegen deutsche Ölbezüge schief, und zwar zugunsten der Aussage „PV ist konzentrierter“.

## 6. Weiterhin nicht erreichbar

| Host / Dokument | Wofür | Verfahren |
|---|---|---|
| eur-lex.europa.eu, VO (EU) 2024/1735 (NZIA), HTML und PDF | 40-%-Richtwert | HTTP 202, 0 Byte (Abwehrprüfung), nicht umgangen; Inhalt per Websuche |
| www.iea.org, BOFIT, SOCI, Argus, S&P | K9-Preisfaktoren, Batteriezellen 85 %, Raffination 86 % | nicht freigegeben |
| solarserver.de / ESMC | > 200 GW an chinesischen Wechselrichtern | nicht freigegeben |
| euratom-supply.ec.europa.eu | ESA-Anreicherungsanteile | nicht freigegeben |
| www.solarpowereurope.org | Originalstudie zum Kostenabstand (Folien 8, 15–17) | nicht freigegeben; Diagramme im ISE-Foliensatz gelesen |

Es wurde keine Datei erfolgreich heruntergeladen (der Ordner `quellen/raw/P2-07/` ist leer), darum gibt es kein eigenes Manifest. Alle geprüften Rohdateien stehen im Manifest P1-07.

## 7. Korrekturen

```json
{
  "pruefung": "07_lieferketten",
  "stand": "2026-11-22",
  "korrekturen": [
    {"id": "stresstest_kostenaufschlag_grossanlage_pct", "alt": "7.5 / 27 / 57", "neu": "2.9 / 10.3 / 21.8", "fundstelle": "ISE Photovoltaics Report 07/2026 S. 51/52 (DE 2025: 758 EUR/kWp, Modulblock ca. 255 EUR/kWp abgelesen); ISE-Foliensatz Folie 17 (Marktpreis 8,7 ct/Wp)", "confidence": "B", "primaer_gelesen": true, "begruendung": "Modulanteil 30 % beruht auf IRENA-Modulkosten von ca. 25 ct/Wp, der Faktor auf 8,7 ct/Wp. Konsistent: 8,7 ct/Wp x (F-1) / 75,8 ct/Wp. Setzung (M)."},
    {"id": "stresstest_modulpreisfaktor", "alt": "1.25 / 1.9 / 2.9 als Folge des Lieferstopps", "neu": "Werte unverändert, aber aufteilen: Normalisierung auf China-Mindestpreis 1,83 (15,9/8,7), Aufschlag Nicht-China gegen China-Mindestpreis SOA 1,04, EU skaliert 1,60", "fundstelle": "ISE-Foliensatz Folie 17", "confidence": "B", "primaer_gelesen": true, "begruendung": "Der mittlere Faktor misst fast nur das Ende des Überkapazitätspreises, nicht den Wechsel weg von China."},
    {"id": "de_import_china_energiewendegueter_2025_mio_eur", "alt": "11750, Obergrenze", "neu": "11748, Größenordnung; Richtung des Fehlers offen", "fundstelle": "Comext DS-045409, DE 2025; PV aus NL 1.208 Mio. EUR, Li-Ion aus EU-Ländern 10.273 Mio. EUR", "confidence": "B", "primaer_gelesen": true, "begruendung": "Comext weist im Intra-EU-Handel das Versendungsland aus; Ware chinesischen Ursprungs über NL/BE fehlt, Nicht-Energiewende-Verwendung ist enthalten."},
    {"id": "hhi_de_rohoel_import_2021", "alt": "1788", "neu": "1878", "fundstelle": "Eurostat nrg_ti_oil, DE 2021, O4100_TOT, Anteile an der Summe der Einzelländer (Methode wie für 2024 = 1280)", "confidence": "B", "primaer_gelesen": true, "begruendung": "1788 nicht reproduzierbar; bezogen auf TOTAL ergäbe sich 1698. 2015 = 1786, vermutlich verwechselt."},
    {"id": "de_fossile_nettoimportrechnung_mrd_eur", "alt": "fundstelle Tabelle 3, S. 11", "neu": "fundstelle Tabelle 3, gedruckt S. 10 (PDF-S. 12)", "fundstelle": "AGEB Jahresbericht 2024", "confidence": "B", "primaer_gelesen": true, "begruendung": "Werte bestätigt, Seitenangabe falsch."},
    {"id": "de_importabhaengigkeit_gas_2024_pct", "alt": "91.6 (A)", "neu": "91.6 Eurostat; Spanne 91.6–95.6 (AGEB-Importquote 2024 95,6 %)", "fundstelle": "Eurostat nrg_ind_id G3000; AGEB JB 2024 PDF-S. 21, Erdgas-Tabelle, Importquote", "confidence": "A", "primaer_gelesen": true, "begruendung": "A gilt für 'über 90 %'; der Punktwert hängt von der Methode ab."},
    {"id": "de_importabhaengigkeit_gesamt_2024_pct", "alt": "66.8", "neu": "66.8 (Eurostat); AGEB ca. 68 (2023 > 68 %, 2024 kaum verändert)", "fundstelle": "nrg_ind_id TOTAL; AGEB JB 2024 gedruckt S. 10", "confidence": "A", "primaer_gelesen": true, "begruendung": "Bestätigt; Methodenunterschied von gut 1 Pp. benennen."},
    {"id": "de_russland_anteil_steinkohleimport_2021_pct", "alt": "50.1 (feste fossile Brennstoffe), Tabelle 52,6 (Steinkohle)", "neu": "52.6 für Steinkohle (C0100); 50.1 nur als 'feste fossile Brennstoffe' (C0000X0350-0370)", "fundstelle": "Eurostat nrg_ti_sff, DE 2021", "confidence": "B", "primaer_gelesen": true, "begruendung": "Tabelle und JSON nutzen verschiedene Abgrenzungen unter derselben ID."},
    {"id": "eu_extra_import_china_anteil_trafo_gt10mva_2025_pct", "alt": "55; Reihe ab 2019 (9 %)", "neu": "54.6; Reihe 2015 18,5 / 2019 9,3 / 2021 29,9 / 2023 50,7 / 2024 41,5 / 2025 54,6", "fundstelle": "Comext 850423, EU27", "confidence": "B", "primaer_gelesen": true, "begruendung": "2015 fehlte; 2019 ist ein Tiefpunkt, der Anstieg wirkt mit diesem Startjahr am stärksten."},
    {"id": "eu_extra_import_china_anteil_pv_module_2025_pct", "alt": "Anstieg 38 → 98 % ohne Kontext", "neu": "Wert bestätigt (98,4); Hinweis: 2013–03.09.2018 EU-Antidumping-/Ausgleichszölle mit Mindestimportpreis, Startwert 2015 dadurch gedrückt; Mengenanteil 46,8 → 99,3 %", "fundstelle": "Comext 85414090/854142/854143; pv magazine 31.08.2018 (Websuche)", "confidence": "B", "primaer_gelesen": false, "begruendung": "Fehlende Gegenposition zu 'Abhängigkeit wächst'; Zollkontext nur aus Suchtreffer."},
    {"id": "nzia_eigenfertigung_ziel_2030_pct", "alt": "40 (B, nicht gelesen)", "neu": "40, indikativer Richtwert ('approaches or reaches at least 40 % of annual deployment needs'), nicht bindend", "fundstelle": "VO (EU) 2024/1735; EUR-Lex nicht abrufbar, Kommissionsseite und EP-Zusammenfassung laut Websuche", "confidence": "B", "primaer_gelesen": false, "begruendung": "Inhalt bestätigt, aber Charakter als unverbindliche Benchmark ergänzen."},
    {"id": "pv_modulkapazitaet_ausserhalb_china_gw", "alt": "180", "neu": "180 (Ablesung ca. 184 inkl. JP/KR 7 und LatAm 4); dazu Zellen SO-Asien ca. 45 GW, Wafer ca. 15 GW, EU-Polysilizium ca. 30 GW im Betrieb", "fundstelle": "ISE Photovoltaics Report S. 13 (Stand 09/2025, Diagramm)", "confidence": "C", "primaer_gelesen": true, "begruendung": "Bestätigt; Ergänzung relativiert 'SO-Asien vollständig auf chinesische Zellen/Wafer angewiesen'."}
  ]
}
```
