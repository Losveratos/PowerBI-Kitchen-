# Ist-Zustand und offizielle Zielpfade des deutschen Stromsystems

**Arbeitspapier / Recherchegrundlage für das White-Paper „Deutscher Strommix“**
Stand der Recherche: **15.08.2026** · Zugriffsdatum aller Quellen: **2026-08-15**
Sprache: Deutsch · Charakter: wissenschaftlich-neutral, keine Bewertung von Politikoptionen

---

## 0. Methodik, Reichweite und Belastbarkeit der Zahlen

### 0.1 Erhebungsmethode und deren Einschränkung

Die Recherche erfolgte über eine Websuchschnittstelle. **Der direkte Abruf der Primärdokumente
(PDF/HTML) war technisch nicht möglich**: Die Netzwerk-Egress-Policy der Arbeitsumgebung
blockierte den Zugriff auf u. a. `ag-energiebilanzen.de`, `energy-charts.info`,
`bundesnetzagentur.de`, `smard.de`, `destatis.de` und `de.wikipedia.org`
(Fehlerbild `EGRESS_BLOCKED`).

**Konsequenz für die Belastbarkeit:** Alle nachfolgenden Zahlen stammen aus
Suchmaschinen-Zusammenfassungen der jeweils genannten Primärquellen sowie aus
Fachmedien-Berichterstattung, die die Primärquellen referenziert. Wo möglich, wurden
Werte über **mehrere voneinander unabhängige Fundstellen** gegengeprüft. Die Zahlen sind
damit **belastbar auf der Ebene von Größenordnungen und Trends**, aber **nicht als
zitierfähige Primärwerte** zu verwenden.

> **Handlungsempfehlung vor Veröffentlichung des White-Papers:** Jede mit ★ oder ★★
> markierte Zahl vor Publikation gegen das Originaldokument prüfen. Die vollständigen
> Quell-URLs sind in Abschnitt 9 gelistet und dort direkt abrufbar.

### 0.2 Konfidenz-Kennzeichnung

| Marker | Bedeutung |
| --- | --- |
| ★★★ | Von mindestens zwei unabhängigen Fundstellen übereinstimmend bestätigt |
| ★★ | Aus einer Fundstelle, die die Primärquelle klar benennt |
| ★ | Abgeleitet, gerundet, aus Differenzbildung rekonstruiert oder widersprüchliche Fundstellen |
| ⚠ | Offener Widerspruch zwischen Quellen — im Text explizit benannt |
| ❑ | Datenlücke — konnte im Rahmen dieser Recherche nicht geschlossen werden |

### 0.3 Definitorische Vorbemerkung (zentral für die Interpretation aller Zahlen)

Die scheinbaren Widersprüche zwischen Fraunhofer ISE, AG Energiebilanzen, Destatis und UBA
sind ganz überwiegend **keine Datenfehler, sondern unterschiedliche Abgrenzungen**. Für das
Simulationsmodell ist die konsistente Wahl **einer** Abgrenzung entscheidend:

| Größe | Abgrenzung | Typischer Herausgeber |
| --- | --- | --- |
| **Bruttostromerzeugung** | Gesamte Erzeugung inkl. Kraftwerkseigenverbrauch, inkl. industrieller Eigenerzeugung, inkl. Pumpspeicher-Erzeugung (PSE) | AG Energiebilanzen (AGEB) |
| **Nettostromerzeugung** | Brutto abzüglich Kraftwerkseigenverbrauch | Fraunhofer ISE, AGEB |
| **Öffentliche Nettostromerzeugung** | Nur Strom, der ins öffentliche Netz geht — **ohne** industrielle Eigenerzeugung, **ohne** überwiegend selbst verbrauchten PV-Strom | Fraunhofer ISE / Energy-Charts |
| **Eingespeiste Strommenge** | Ins Netz eingespeist, ohne Eigenverbrauch | Destatis |
| **Bruttostromverbrauch** | Erzeugung + Importe − Exporte | AGEB / UBA |
| **Nettostromverbrauch** | Bruttostromverbrauch − Kraftwerkseigenverbrauch − Netzverluste − Speicherverluste | AGEB |

**Deshalb** liegt der EE-Anteil 2025 je nach Abgrenzung zwischen ca. 54 % und 56 % — siehe
Abschnitt 1.4. Das White-Paper sollte diese Spannbreite ausweisen, statt einen Punktwert zu
suggerieren.

---

## 1. Ist-Strommix: 2024, 2025 und unterjähriger Stand 2026

### 1.1 Bruttostromerzeugung 2025 nach Energieträgern

**Leitquelle:** AG Energiebilanzen e. V., Datenblatt „Bruttostromerzeugung in Deutschland
nach Energieträgern“ sowie Jahresauswertung zur AGEB-Wintertagung (15.12.2025).

| Energieträger | 2025 [TWh] | Anteil an Brutto [%] | Konfidenz |
| --- | ---: | ---: | :---: |
| Wind onshore | 110,1 | 21,6 | ★★ |
| Photovoltaik | 89,5 | 17,6 | ★★ |
| Erdgas | 84,9 | 16,7 | ★★ |
| Braunkohle | 75,2 | 14,8 | ★★ |
| Biomasse | 42,7 | 8,4 | ★★ |
| Wind offshore | ~28 | ~5,5 | ★ (Differenz) |
| Steinkohle | ~25–28 | ~5,0–5,5 | ★ (Differenz) |
| Wasserkraft (ohne PSE) | ~21 | ~4,1 | ★ (Differenz) |
| Mineralöl / Sonstige / Abfall | ~29 (gemeinsam ausgewiesen) | ~5,7 | ★ |
| Kernenergie | 0,0 | 0,0 | ★★★ |
| **Pumpspeichererzeugung (PSE)** | **7,1** | **1,4** | ★★ |
| **Bruttostromerzeugung gesamt (inkl. PSE)** | **509,3** | **100** | ★★★ |
| *nachrichtlich: ohne PSE* | *502,2* | — | ★★ |
| *davon Erneuerbare gesamt* | *292,0* | *57,3* | ★★ |
| *davon fossil gesamt* | *~217,3* | *~42,7* | ★★ |

**Wichtige Einschränkungen zu dieser Tabelle:**

- Die Werte für **Wind offshore, Steinkohle und Wasserkraft sind rekonstruiert** (★), nicht
  direkt aus der AGEB-Tabelle abgelesen. Rekonstruktionsweg: EE-Summe 292,0 TWh abzüglich der
  direkt belegten EE-Posten (Wind onshore 110,1 + PV 89,5 + Biomasse 42,7 = 242,3 TWh) ergibt
  49,7 TWh Rest für Wind offshore + Wasserkraft. Die Aufteilung dieses Rests folgt der
  Größenordnung der Vorjahre. **Vor Publikation zwingend gegen die AGEB-Originaltabelle
  prüfen.** ❑
- ⚠ Die AGEB-Angabe „Wind 110,1 TWh“ ist im Suchergebnis nicht eindeutig als *onshore*
  gekennzeichnet. Die Plausibilisierung gegen Fraunhofer ISE (Wind gesamt, öffentliche
  Nettoerzeugung: 132 TWh) stützt die Lesart „onshore“ stark — 110,1 brutto onshore plus rund
  28 TWh offshore ergibt eine Windsumme, die zur ISE-Zahl passt. Restrisiko bleibt.
- Die Summe „Erneuerbare 292,0“ und „fossil 217,3“ ergibt exakt 509,3 TWh; die separat
  genannten „Sonstige und Abfall 28,9 TWh“ sind demnach **innerhalb** des Blocks
  „fossil/übrige“ enthalten, nicht additiv. ★

**Quellen:**
- AG Energiebilanzen e. V.: *Bruttostromerzeugung in Deutschland nach Energieträgern* (Datenblatt STRERZ), Ausgabe 2025-06 —
  https://ag-energiebilanzen.de/wp-content/uploads/2025/02/STRERZ-Abgabe-2025-06.pdf (Zugriff 2026-08-15, nur via Suchindex)
- AGEE-Stat / Umweltbundesamt für AG Energiebilanzen: *Aktuelle Schätzung zur Entwicklung der erneuerbaren Energien, Gesamtjahr 2025*, Präsentation zur AGEB-Wintertagung, 15.12.2025 —
  https://ag-energiebilanzen.de/wp-content/uploads/Erneuerbare_AGEE-Stat_Gesamtjahr2025_fuer_AGEB_Wintertagung_151225.pdf (Zugriff 2026-08-15)
- AG Energiebilanzen e. V.: *Energieverbrauch wird 2025 stagnieren*, 2025 — https://ag-energiebilanzen.de/energieverbrauch-wird-2025-stagnieren/ (Zugriff 2026-08-15)

### 1.2 Öffentliche Nettostromerzeugung 2025 (Fraunhofer ISE / Energy-Charts)

Die ISE-Abgrenzung ist die im öffentlichen Diskurs meistzitierte und weicht systematisch von
AGEB ab (siehe 0.3).

| Kennzahl 2025 | Wert | Konfidenz |
| --- | --- | :---: |
| EE-Anteil an der öffentlichen Nettostromerzeugung | **55,9 %** | ★★★ |
| Wind (gesamt) | **132 TWh** — weiterhin stärkster Einzelträger, trotz unterdurchschnittlichem Windjahr | ★★★ |
| Photovoltaik (Gesamtproduktion) | **87 TWh**, **+21 % ggü. 2024** | ★★★ |
| Historische Zäsur | PV überholt 2025 **erstmals die Braunkohle** in der Nettostromerzeugung; Wind und PV bilden erstmals gemeinsam die Doppelspitze | ★★★ |
| Installierte PV-Leistung Jahresende 2025 | **116,8 GW** (DC), Zubau **+16,2 GW** | ★★★ |
| Negative Börsenstrompreise 2025 | **≈ 575 Stunden** — neuer Rekord, deutlich über Vorjahr | ★★ |

**Quellen:**
- Burger, B.; Fraunhofer-Institut für Solare Energiesysteme ISE: *Stromerzeugung in Deutschland im Jahr 2025*, Jahresauswertung, Januar 2026 —
  https://www.energy-charts.info/downloads/Stromerzeugung_2025.pdf (Zugriff 2026-08-15)
- pv magazine Deutschland: *Energy-Charts: Photovoltaik überholt 2025 erstmals Braunkohle bei Nettostromerzeugung*, 02.01.2026 —
  https://www.pv-magazine.de/2026/01/02/energy-charts-photovoltaik-ueberholt-2025-erstmals-braunkohle-bei-nettostromerzeugung/ (Zugriff 2026-08-15)
- Solarserver: *Nettostromerzeugung 2025: Photovoltaik erstmals auf Platz 2 nach Wind*, 02.01.2026 —
  https://www.solarserver.de/2026/01/02/nettostromerzeugung-2025-wind-und-solar-erstmals-auf-platz-1-und-2/ (Zugriff 2026-08-15)
- Smart Grids BW: *Fraunhofer ISE: Wind und Photovoltaik führen 2025 erstmals gemeinsam die Stromerzeugung an*, Januar 2026 —
  https://smartgrids-bw.net/news/wind-und-photovoltaik-fuehren-2025-erstmals-gemeinsam-die-stromerzeugung-an/ (Zugriff 2026-08-15)

### 1.3 Referenzjahr 2024 (Destatis-Abgrenzung: eingespeiste Strommenge)

Destatis rechnet auf Basis der **ins Netz eingespeisten** Strommenge. Diese Abgrenzung schließt
selbstverbrauchten PV-Strom aus und liefert deshalb einen **höheren EE-Prozentwert** bei
gleichzeitig **niedrigerer PV-Absolutmenge**.

| Kennzahl 2024 | Wert | Konfidenz |
| --- | --- | :---: |
| Eingespeiste Strommenge gesamt | **431,7 TWh** (abgeleitet) | ★ |
| davon Erneuerbare | **256,4 TWh** (**59,4 %**), +2,3 % ggü. 2023 | ★★★ |
| Wind onshore | 24,0 % der Einspeisung ≈ 103,6 TWh | ★★ / ★ |
| Photovoltaik | 14,7 % ≈ 63,5 TWh | ★★ / ★ |
| Biomasse | 9,0 % ≈ 38,9 TWh | ★★ / ★ |
| Wind offshore | 5,5 % ≈ 23,7 TWh | ★★ / ★ |
| Wasserkraft | 4,2 % ≈ 18,1 TWh | ★★ / ★ |
| Abfall | 1,1 % ≈ 4,7 TWh | ★★ / ★ |

Zur Einordnung nach **anderer Abgrenzung**:

| Kennzahl 2024 | Wert | Quelle / Abgrenzung | Konfidenz |
| --- | --- | --- | :---: |
| Bruttostromerzeugung 2024 | **≈ 501 TWh** | AGEB, brutto | ★★ ⚠ |
| EE-Erzeugung 2024 gesamt | **≈ 275,2 TWh** (+4,4 % ggü. 267 TWh 2023) | AGEE-Stat, alle EE-Sektoren Strom | ★★ |
| PV-Erzeugung 2024 gesamt | **72,2 TWh** (Bestwert) | AGEE-Stat, inkl. Eigenverbrauch | ★★ |
| Wind gesamt 2024 | **136,4 TWh**, 33 % der öffentlichen Erzeugung | Fraunhofer ISE | ★★ |
| Erdgasanteil 2024 | **14,9 %** (2025: 13,5 %) | AGEB | ★★ |
| EE-Anteil an öffentlicher Nettoerzeugung 2024 | **62,7 %** | Fraunhofer ISE | ★★★ |
| **Bruttostromverbrauch 2024** | **518 TWh** | ÜNB, Szenariorahmen/NEP 2037/2045 (2025) | ★★★ |

⚠ **Widerspruch:** Die Bruttoerzeugung 2024 wird in einer Fundstelle mit „rund 501,2 Mrd. kWh“
angegeben, während die Bruttoerzeugung 2025 mit 509,3 TWh und einem Zuwachs von „+1,2 %“
beziffert wird — +1,2 % auf 501,2 ergäbe 507,2 TWh, nicht 509,3. Die Differenz liegt vermutlich
in der Behandlung der Pumpspeichererzeugung (509,3 inkl. PSE vs. 502,2 ohne PSE; 502,2 zu 501,2
wären +0,2 %). **Für das Modell gilt: 2024 brutto ≈ 501–507 TWh, Punktwert vor Publikation
verifizieren.** ❑

**Quellen:**
- Statistisches Bundesamt (Destatis): *Stromerzeugung 2024: 59,4 % aus erneuerbaren Energieträgern*, Pressemitteilung Nr. 091, 04.03.2025 —
  https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/03/PD25_091_43312.html (Zugriff 2026-08-15)
- baulinks / Fraunhofer ISE: *Öffentliche Nettostromerzeugung 2024 mit neuem Rekordanteil erneuerbarer Energien*, Januar 2025 —
  https://www.baulinks.de/webplugin/2025/0001.php4 (Zugriff 2026-08-15)
- Übertragungsnetzbetreiber (50Hertz, Amprion, TenneT, TransnetBW): *Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 1. Entwurf*, Dezember 2025 —
  https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_0.pdf (Zugriff 2026-08-15)

### 1.4 EE-Anteil: die vier kursierenden Werte für 2025 ⚠

Dies ist der häufigste Zitierfehler im öffentlichen Diskurs und sollte im White-Paper aktiv
aufgelöst werden:

| Wert | Abgrenzung | Herausgeber |
| ---: | --- | --- |
| **54 %** | Anteil am Bruttostromverbrauch, Vergleichswert in UBA-Halbjahresmeldung | UBA / AGEE-Stat |
| **55,1 %** | Anteil am Bruttostromverbrauch, „neuer Höchstwert“ | UBA / AGEE-Stat |
| **55,9 %** | Anteil an der **öffentlichen Nettostromerzeugung** | Fraunhofer ISE |
| **56 %** | Anteil am Bruttostromverbrauch, gerundet | AG Energiebilanzen |

⚠ Die Werte 54 % und 55,1 % stammen beide aus dem UBA/AGEE-Stat-Umfeld und sind nicht ohne
Weiteres vereinbar; wahrscheinlich handelt es sich um eine **frühe Schätzung (Dezember) vs.
revidierten Wert (Frühjahr)**. **Empfehlung für das White-Paper: Bandbreite 55–56 % am
Bruttostromverbrauch ausweisen; 55,9 % nur mit dem Zusatz „öffentliche Nettostromerzeugung“
zitieren.**

### 1.5 Stromverbrauch 2024/2025

| Kennzahl | Wert | Konfidenz |
| --- | --- | :---: |
| Bruttostromverbrauch 2024 | **518 TWh** (NEP-Basisjahr) | ★★★ |
| Bruttostromverbrauch 2025 | **≈ 512–526 TWh** ⚠ (Fundstellen: „Stromverbrauch 2025 bei 526 TWh“; AGEB-Konsistenzrechnung legt eher ~512–517 TWh nahe) | ★ |
| **Nettostromverbrauch 2024/2025** | ❑ **Datenlücke** — konnte nicht belegt werden | ❑ |
| Primärenergieverbrauch 2025 | 10.553 PJ / 360,1 Mio. t SKE, **−0,1 %** ggü. 2024 | ★★ |

❑ **Offene Lücke Nettostromverbrauch:** Die AGEB weist den Nettostromverbrauch als
Bruttostromverbrauch abzüglich Kraftwerkseigenverbrauch, Speicherdifferenzen und Netzverlusten
aus. Der konkrete Zahlenwert für 2024/2025 war über die Suche nicht zu ermitteln. **Als
Modellnäherung** kann mit einem Abschlag von rund **7–9 %** gegenüber dem Bruttostromverbrauch
gerechnet werden (historischer Erfahrungswert), d. h. **≈ 470–485 TWh für 2024/2025** — dieser
Wert ist **eine Schätzung des Verfassers, keine Quellenangabe** und im White-Paper
entsprechend zu kennzeichnen.

**Quellen:**
- Umweltbundesamt: *Stromverbrauch* — https://www.umweltbundesamt.de/daten/umweltzustand-trends/energie/stromverbrauch (Zugriff 2026-08-15)
- AG Energiebilanzen e. V.: *Energieverbrauch wird 2025 stagnieren* — https://ag-energiebilanzen.de/energieverbrauch-wird-2025-stagnieren/ (Zugriff 2026-08-15)
- BDEW: *Die Energieversorgung 2025 — Jahresbericht*, 17.12.2025 — https://www.bdew.de/media/documents/Die_Energieversorgung_2025_FINAL_2025_12_17_1.pdf (Zugriff 2026-08-15)

### 1.6 Import/Export-Saldo

| Jahr | Import [TWh] | Export [TWh] | Saldo (Nettoimport) [TWh] | Konfidenz |
| --- | ---: | ---: | ---: | :---: |
| 2025 | **76,2** (−1,3 % ggü. 2024) | **54,3** (+11,1 %) | **21,9** (−22,6 % ggü. 2024) | ★★ |
| 2025 (alternative Fundstelle) | — | — | **≈ 19** (≈ 4 % des Inlandsverbrauchs) | ★ ⚠ |
| 2024 (rückgerechnet) | ≈ 77,2 | ≈ 48,9 | **≈ 28,3** | ★ |
| Q1 2026 | — | — | **Deutschland erstmals seit 2023 wieder Netto-Exporteur** | ★★★ |

⚠ **Widerspruch 21,9 vs. 19 TWh:** Vermutlich Abgrenzung **physikalische Lastflüsse** vs.
**kommerzieller Handelssaldo**; die BNetzA weist beide aus. Für das Modell: **Bandbreite
19–22 TWh Nettoimport 2025.**

**Struktur der Importe 2025** (★★): Dänemark löste Frankreich als wichtigster Lieferant ab,
gefolgt von Frankreich, den Niederlanden und Norwegen. Zusammensetzung des importierten
Stroms: **≈ 55 % erneuerbar, ≈ 23 % Kernenergie, ≈ 13 % fossil** (Rest nicht zugeordnet;
die genannten Anteile summieren sich nicht auf 100 % — ⚠ Rundungs- oder Abgrenzungsproblem in
der Quelle).

**Trendwende 2026:** Der Wechsel zum Netto-Exporteur im Q1 2026 ist für das White-Paper
relevant, weil die verbreitete These „Deutschland ist strukturell stromimportabhängig
geworden“ damit empirisch mindestens unterjährig widerlegt ist. Der Jahreswert 2026 steht noch
aus. ❑

**Quellen:**
- Bundesnetzagentur: *Bundesnetzagentur veröffentlicht Daten zum Strommarkt 2025*, Pressemitteilung, Januar 2026 — https://www.bundesnetzagentur.de/1087156 (Zugriff 2026-08-15)
- Bundesnetzagentur: *Bundesnetzagentur veröffentlicht Daten zum Strommarkt 2024*, Pressemitteilung, 03.01.2025 — https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20250103_smard.html (Zugriff 2026-08-15)
- ZfK — Zeitung für kommunale Wirtschaft: *Deutschland erstmals seit 2023 wieder Strom-Nettoexporteur*, 2026 — https://www.zfk.de/energie/strom/deutschland-strom-nettoexporteur-q1-2026 (Zugriff 2026-08-15)
- Strom-Report: *Stromhandel 2025: Wie viel Atomstrom importiert Deutschland?* — https://strom-report.com/stromhandel/ (Zugriff 2026-08-15)

### 1.7 Unterjähriger Stand 2026 (Datenstand ca. Juli 2026)

| Kennzahl H1 2026 | Wert | Konfidenz |
| --- | --- | :---: |
| EE-Anteil am Bruttostromverbrauch | **≈ 57 %** (H1 2025: 54 %; H1 2024: 57 %) | ★★★ |
| EE-Erzeugung ggü. Vorjahreszeitraum | **+6 %** | ★★ |
| Struktur der EE-Erzeugung | Wind **45 %**, PV **34 %**, Biomasse **15 %** (Rest Wasser/Sonstige) | ★★ |
| Ø Day-Ahead-Börsenstrompreis | **≈ 99 EUR/MWh** — nur 2022 und 2023 lagen höher | ★★★ |
| Stunden mit negativem Day-Ahead-Preis | **299 h** (H1 2025: 389 h; H1 2024: 224 h) | ★★★ |
| Negative Viertelstunden | **1.178** | ★★ |
| Extremwert | **−499,99 EUR/MWh**; Negativstunden im Schnitt fast doppelt so tief wie in den beiden Vorjahren | ★★ |

**Interpretationshinweis:** Die Zahl der Negativstunden sinkt, ihre **Tiefe** steigt — ein
Hinweis auf zunehmend inelastische Erzeugungsspitzen bei gleichzeitig wachsender, aber noch
nicht ausreichender Flexibilität (Speicher, Elektrolyse, flexible Lasten).

**Quellen:**
- Umweltbundesamt: *Erstes Halbjahr 2026: Erneuerbare Energien wachsen in allen Sektoren*, Pressemitteilung, Juli 2026 —
  https://www.umweltbundesamt.de/presse/pressemitteilungen/erstes-halbjahr-2026-erneuerbare-energien-wachsen (Zugriff 2026-08-15)
- Solarserver: *UBA: Erneuerbare Energien legen im ersten Halbjahr 2026 in allen Sektoren zu*, 15.07.2026 —
  https://www.solarserver.de/2026/07/15/uba-erneuerbare-energien-legen-im-ersten-halbjahr-2026-in-allen-sektoren-zu/ (Zugriff 2026-08-15)
- Batteriespeicher-Report: *Halbjahresbilanz negative Strompreise: 299 Stunden in H1 2026*, Juli 2026 (Auswertung der SMARD-Viertelstunden-Rohdaten, gegengeprüft an Energy-Charts) —
  https://batteriespeicher-report.de/aktuelles/negative-strompreise-halbjahresbilanz-2026 (Zugriff 2026-08-15)
- pv magazine Deutschland: *Weniger Negativpreise als 2025: Erstes Halbjahr trotz globaler Energiekrise mit nur leicht höheren Börsenstrompreisen*, 02.07.2026 —
  https://www.pv-magazine.de/unternehmensmeldungen/weniger-negativpreise-als-2025-erstes-halbjahr-trotz-globaler-energiekrise-mit-nur-leicht-hoeheren-boersenstrompreisen/ (Zugriff 2026-08-15)

---

## 2. Installierte Leistung je Technologie

Datenbasis: Marktstammdatenregister (MaStR) der Bundesnetzagentur, Kraftwerksliste
(Datenstand 26.06.2026), ergänzt um Verbands- und Institutsangaben.

### 2.1 Übersicht

| Technologie | Stand Jahresende 2025 [GW] | Stand ca. Juli 2026 [GW] | Konfidenz |
| --- | ---: | ---: | :---: |
| **Photovoltaik** | **117,0** (ISE: 116,8 DC) | **≈ 126,6** | ★★★ |
| **Wind onshore** | **68,1** | **≈ 71,0** | ★★★ / ★ |
| **Wind offshore** | **≈ 9,6** | **10,8** (in Betrieb) | ★★★ |
| **Erdgas** | **≈ 35–36** | ≈ 35–36 | ★★ |
| **Steinkohle** | **15,4** (15.387 MW) | — | ★★ |
| **Braunkohle** | **14,8** (14.758 MW, −361 MW ggü. 2024) | — | ★★ |
| **Biomasse** | **≈ 9,0** (Stand Okt. 2024 — veraltet) | — | ★ ❑ |
| **Wasserkraft (Lauf-/Speicher, ohne PSE)** | **≈ 4,9–5,6** | — | ★ ❑ |
| **Pumpspeicher** | **6,25** (6.253 MW) | — | ★★ |
| **Batteriespeicher (alle Größenklassen)** | — | **18,5–20,0 GW / 31,0–31,5 GWh** ⚠ | ★★ ⚠ |
| **Erneuerbare gesamt** | **≈ 210** (+21 GW / +11 % ggü. 2024) | — | ★★★ |
| **Alle Erzeugungsanlagen (Nettoleistung)** | **265,4** (Stand Mai 2025) | — | ★★ |

### 2.2 Erläuterungen und offene Punkte

**Photovoltaik.** Zubau 2025: **16,4 GW** nach BNetzA-Auswertung; der Bundesverband
Solarwirtschaft (BSW) beziffert **17,5 GW** ⚠ (Abgrenzung Melde- vs. Inbetriebnahmedatum).
Rund die Hälfte des Zubaus entfiel auf Dachanlagen, die andere Hälfte auf Freiflächen. Von
Januar bis Juli 2026 wurden **484.530 neue Anlagen mit 9.572 MW** in Betrieb genommen; das
gesetzliche Zwischenziel von 128 GW für Ende 2026 wird damit voraussichtlich bereits im
Sommer/Herbst 2026 erreicht.

**Wind onshore.** Zubau 2025: **4,6 GW** — deutliche Steigerung gegenüber 2,6 GW in 2024.
Januar bis Juli 2026: **587 Anlagen mit 3.948 MW Wind gesamt (+53 % ggü. Vorjahr)**; abzüglich
der 1.062 MW offshore entfallen davon **≈ 2,9 GW auf onshore** (★, Differenzrechnung).

**Wind offshore.** Im H1 2026 gingen **83 Anlagen mit 1.062,2 MW** ans Netz (Windparks Borkum
Riffgrund 3 und EnBW He Dreiht) — nach **null MW Zubau im gesamten H1 2025**. Der Ausbau läuft
nach einer mehrjährigen Lücke wieder an. Projektpipeline zur Jahresmitte 2026: **10,8 GW in
Betrieb, 1,3 GW im Bau, 2,6 GW mit finaler Investitionsentscheidung, 17,5 GW mit Zuschlag bzw.
Netzanbindungsanspruch, 9 GW bislang nur für Ausschreibungen vorgesehen.**

**Wind + PV kombiniert.** Zubau Januar–Juli 2026: **≈ 12.916 MW**, gegenüber 11.600 MW im
Vorjahreszeitraum (**+11 %**).

❑ **Datenlücke Wasserkraft.** Ein belastbarer Gesamtwert der installierten Wasserkraftleistung
(ohne Pumpspeicher) konnte nicht ermittelt werden. Belegt sind lediglich Länderwerte: Bayern
2.222 MW, Baden-Württemberg 1.567 MW (Stand Okt. 2024), wobei Bayern „fast die Hälfte“ der
deutschen Leistung stellt — daraus folgt rechnerisch **≈ 4,7–5,0 GW** (★). Die häufig
zitierte Größenordnung „rund 5,6 GW“ konnte nicht bestätigt werden.

❑ **Datenlücke Biomasse.** Der Wert **9.033 MW** stammt aus einer Publikation der Agentur für
Erneuerbare Energien mit Stand **Oktober 2024** und ist damit für ein 2026er White-Paper
veraltet. Aktuellere MaStR-Auswertung erforderlich.

⚠ **Widerspruch Batteriespeicher.** Drei nicht vereinbare Fundstellen:
1. **18.483,5 MW / 31.485,1 MWh** über ca. 2,6 Mio. Anlagen (Stand H1 2026) — plausibel als
   MaStR-Gesamtbestand inkl. Heimspeicher.
2. **20,0 GW / 31,0 GWh** über alle Größenklassen inkl. Heimspeicher (Stand Juli 2026) —
   ebenfalls plausibel, leicht abweichende Stichtage.
3. **1,2 GW / 2,4 GWh** für „Großspeicher“ (Stand Q2 2026) — **implausibel niedrig** angesichts
   von Einzelprojekten wie Förderstedt (716 MWh) und Klostermansfeld (1.000 MW / bis 5.700 MWh,
   Baubeginn Juli 2026). Vermutlich handelt es sich um eine eng definierte Teilmenge (z. B. nur
   Neuinbetriebnahmen eines Quartals oder nur netzdienlich vermarktete Anlagen). **Diesen Wert
   nicht ohne Prüfung verwenden.**

Zubau H1 2026: **2.482,7 MW Leistung (+ ca. ein Drittel ggü. Vorjahreszeitraum)** und
**≈ 5.642 MWh Kapazität (+ ca. 76 %)**. IWR-Projektion: bis Jahresende 2026 **≈ 35 GWh**
installierte Kapazität. Der BSW meldet eine **Verfünffachung der Batteriespeicherkapazität
binnen vier bis fünf Jahren**. ★★

**Quellen:**
- Bundesnetzagentur: *Kraftwerksliste*, Datenstand 26.06.2026 (Basis MaStR) —
  https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Erzeugungskapazitaeten/Kraftwerksliste/start.html (Zugriff 2026-08-15)
- Bundesnetzagentur: *Ausbau Erneuerbarer Energien 2025*, Pressemitteilung, 08.01.2026 —
  https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260108_EEG.html (Zugriff 2026-08-15)
- Solarserver: *Bundesnetzagentur legt Zahlen zum Ausbau der erneuerbaren Energien in 2025 vor*, 08.01.2026 —
  https://www.solarserver.de/2026/01/08/bundesnetzagentur-legt-zahlen-zum-ausbau-der-erneuerbaren-energien-in-2025-vor/ (Zugriff 2026-08-15)
- IWR: *Januar bis Juli 2026: Windenergie-Zubau in Deutschland zieht kräftig an — Photovoltaik bleibt stabil*, August 2026 —
  https://www.iwr.de/news/januar-bis-juli-2026-windenergie-zubau-in-deutschland-zieht-kraeftig-an-photovoltaik-bleibt-stabil-news39953 (Zugriff 2026-08-15)
- IWR: *Windkraft-Zubau in Deutschland zieht durch Offshore-Comeback im ersten Halbjahr 2026 deutlich an*, Juli 2026 —
  https://www.iwr.de/news/windkraft-zubau-in-deutschland-zieht-durch-offshore-comeback-im-ersten-halbjahr-2026-deutlich-an-photovoltaik-neuinstallationen-ruecklaeufig-news39843 (Zugriff 2026-08-15)
- Stiftung OFFSHORE-WINDENERGIE: *Status quo Offshore-Windenergie*, Stand Jahresmitte 2026 —
  https://www.offshore-stiftung.de/de/status-quo-offshore-windenergie.php (Zugriff 2026-08-15)
- Umweltbundesamt: *Kraftwerke: konventionelle und erneuerbare Energieträger* —
  https://www.umweltbundesamt.de/daten/umweltzustand-trends/energie/kraftwerke-konventionelle-erneuerbare (Zugriff 2026-08-15)
- Agentur für Erneuerbare Energien: *Regelbare Kraftwerke und Speicher in den Bundesländern*, Renews Kompakt Ausgabe 69, Oktober 2024 —
  https://www.unendlich-viel-energie.de/media/file/6581.AEE_RenewsKompakt_Kraftwerke_okt24.pdf (Zugriff 2026-08-15)
- Heimerl, S.; Kohler, B.; Akpinar, M.: *Stand der Pumpspeicher in Deutschland 2025*, WasserWirtschaft 12/2025 —
  https://www.fwt.fichtner.de/userfiles/fileadmin-fwt/Publikationen/WaWi_12_2025_PSW_Heimerl_Kohler_Akpinar.pdf (Zugriff 2026-08-15)
- Solarbranche.de / Speicherbranche.de: *Speicherzubau im ersten Halbjahr 2026 in Deutschland auf Rekordkurs*, Juli 2026 —
  https://www.speicherbranche.de/news/nachrichten/artikel-39878-speicherzubau-im-ersten-halbjahr-2026-in-deutschland-auf-rekordkurs (Zugriff 2026-08-15)
- Bundesverband Solarwirtschaft: *Batteriespeicherkapazität binnen 4 Jahren verfünffacht*, 12.01.2026 —
  https://www.solarwirtschaft.de/2026/01/12/batteriespeicherkapazitaet-binnen-5-jahren-verfuenffacht/ (Zugriff 2026-08-15)
- cdw Stiftung: *Gaskraftwerke* (Faktenblatt) — https://www.cdw-stiftung.de/fakten/gaskraftwerke/ (Zugriff 2026-08-15)

---

## 3. Offizielle Ausbaupfade und Zielerreichungsgrad

### 3.1 Gesetzliche Ziele

**EEG 2023** (§ 1 Abs. 2, § 4): Anteil erneuerbarer Energien am Bruttostromverbrauch von
**mindestens 80 % bis 2030**; Stromerzeugung im Bundesgebiet **treibhausgasneutral vor 2050**.

| Technologie | Ziel 2030 | Ziel 2035 | Ziel 2040 | Ziel 2045 | Rechtsgrundlage |
| --- | ---: | ---: | ---: | ---: | --- |
| Photovoltaik | **215 GW** | — | — | ca. 400 GW (Zielpfad) | EEG 2023 § 4 |
| Wind onshore | **115 GW** | — | — | ca. 160 GW (Zielpfad) | EEG 2023 § 4 |
| Wind offshore | **≥ 30 GW** | **≥ 40 GW** | — | **≥ 70 GW** | WindSeeG |
| EE-Anteil Bruttostromverbrauch | **≥ 80 %** | — | — | THG-neutral | EEG 2023 § 1 |

Vorgesehene jährliche Ausbauraten laut Gesetzesbegründung: **PV bis zu 22 GW/a**, **Wind
onshore bis zu 10 GW/a**. ★★★

### 3.2 Zielerreichungsgrad — Stand Anfang/Mitte 2026

| Technologie | Ist (Anfang 2026) | Ziel 2030 | Zielerreichung | Rest bis 2030 | Erforderlich Ø/a 2026–2030 | Ist-Zubau 2025 | Lücke (Faktor) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Photovoltaik | 117 GW | 215 GW | **54 %** | 98 GW | **≈ 19,6 GW/a** | 16,4 GW | **≈ 1,2×** |
| Wind onshore | 68,1 GW | 115 GW | **59 %** | 46,9 GW | **≈ 9,4 GW/a** | 4,6 GW | **≈ 2,0×** |
| Wind offshore | 9,6–10,8 GW | 30 GW | **32–36 %** | ≈ 19,2 GW | **≈ 4,3 GW/a** | 0 GW (2025) / 1,06 GW (H1 2026) | **≳ 4×** |

**Bewertung der Zielerreichbarkeit (Quellenlage, nicht eigene Wertung):**

- **Photovoltaik:** Die Lücke ist mit Faktor ≈ 1,2 am kleinsten. Bei Fortschreibung des
  2025er/2026er Tempos ist das 215-GW-Ziel **im Bereich des Erreichbaren**, erfordert aber
  eine Steigerung um rund ein Fünftel. Für 2026 deutet sich eine Stabilisierung bzw. leichte
  Abschwächung an (Februar 2026 wird als „deutlicher Dämpfer“ berichtet; Januar–Juli 2026 mit
  9,57 GW liegt nur knapp über dem anteiligen Vorjahrespfad). ★★
- **Wind onshore:** Erfordert eine **Verdopplung** des 2025er Zubaus über fünf Jahre. Der
  Zubau zieht deutlich an (+53 % Jan–Jul 2026), und 2025 war ein Rekordjahr bei den
  Ausschreibungszuschlägen — Genehmigungs- und Zuschlagsvolumen laufen dem realisierten Zubau
  mit 2–3 Jahren Verzögerung voraus. Erreichbarkeit **offen, aber nicht ausgeschlossen**. ★★
- **Wind offshore:** Die Stiftung OFFSHORE-WINDENERGIE stellt fest: **„Das Ausbauziel für 2030
  ist zeitlich nicht mehr zu erreichen“**; das **Ziel 2035 (40 GW) könnte bei plangemäßer
  Umsetzung aller Projekte erreicht werden**; für **2045 (70 GW) sind weitere Festlegungen
  erforderlich**. Der BWE spricht von einem Ausbau, der „wieder anläuft, aber längst nicht
  rund“ läuft. ★★★

❑ **Offene Frage:** Ein amtlich fortgeschriebener **Zielpfad-Zwischenwert für 2026 nach
EEG § 4** (128 GW PV) ist belegt; die entsprechenden Zwischenwerte für Wind onshore und die
gesetzlich hinterlegten Stützjahre 2035/2040 für PV und Wind onshore konnten nicht
vollständig belegt werden.

**Quellen:**
- Bundesministerium für Wirtschaft und Energie (BMWE): *Weitere Details zum EEG 2023* —
  https://www.bundeswirtschaftsministerium.de/Redaktion/DE/FAQ/EEG-2023/weitere-details-eeg-2023.html (Zugriff 2026-08-15)
- Umweltbundesamt: *Erneuerbare-Energien-Gesetz* —
  https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/erneuerbare-energien-gesetz (Zugriff 2026-08-15)
- Open Energy Tracker: *Renewable electricity — Germany* — https://openenergytracker.org/en/docs/germany/electricity/ (Zugriff 2026-08-15)
- Stiftung OFFSHORE-WINDENERGIE: *Status quo Offshore-Windenergie*, Jahresmitte 2026 —
  https://www.offshore-stiftung.de/de/status-quo-offshore-windenergie.php (Zugriff 2026-08-15)
- Bundesverband WindEnergie (BWE): *Offshore-Ausbau läuft wieder an — aber längst nicht rund*, Pressemitteilung 2026 —
  https://www.wind-energie.de/presse/pressemitteilungen/detail/offshore-ausbau-laeuft-wieder-an-aber-laengst-nicht-rund/ (Zugriff 2026-08-15)
- Schiff & Hafen: *Ausbau der Offshore-Windenergie auf 70 GW geplant* —
  https://www.schiffundhafen.de/nachrichten/offshore/detail/offshore-windenergieausbau-bis-2045-auf-70-gw.html (Zugriff 2026-08-15)
- IWR: *Rekordjahr 2025 für Erneuerbare Energien in Deutschland: Ausschreibungsboom bei Wind- und Solarenergie* —
  https://www.iwr.de/news/rekordjahr-2025-fuer-erneuerbare-energien-in-deutschland-ausschreibungsboom-bei-wind-und-solarenergie-news39537 (Zugriff 2026-08-15)
- Solarserver: *Photovoltaik-Ausbau im Februar 2026: Deutlicher Dämpfer*, 19.03.2026 —
  https://www.solarserver.de/2026/03/19/photovoltaik-ausbau-im-februar-deutlicher-daempfer/ (Zugriff 2026-08-15)

---

## 4. Bedarfsprojektionen 2030 / 2037 / 2045

Grundsatz dieses Abschnitts: **Es werden ausschließlich Spannen ausgewiesen.** Die Streuung
zwischen den Szenarien ist größer als die Präzision jedes einzelnen Punktwerts, und die
Revisionen der letzten drei Jahre waren erheblich.

### 4.1 Bruttostromverbrauch — Szenarienvergleich

| Zieljahr | Quelle / Szenario | Spanne [TWh/a] | Konfidenz |
| --- | --- | ---: | :---: |
| **2024 (Ist)** | ÜNB / NEP-Basisjahr | **518** | ★★★ |
| **2030** | BMWK-Langfristszenarien (LFS3, T45-Familie) | **594–638** | ★★ |
| **2030** | Monitoringbericht Energiewende 2025 (EWI/BET i. A. BMWE) | **600–700** | ★★★ |
| **2030** | Frühere Annahme der EEG-Novelle 2023 | **≈ 750** (inzwischen als zu hoch eingestuft) | ★★★ |
| **2030** | McKinsey „Zukunftspfad Stromnachfrage“, Trendpfad — **Netto**bedarf | **530** (Netto, nicht Brutto!) | ★★ |
| **2037** | NEP 2037/2045 (2025), Szenarien A/B/C | **845–1.065** | ★★★ |
| **2045** | NEP 2037/2045 (2025), Szenarien A/B/C | **948–1.275** | ★★★ |
| **2045** | Ariadne-Modellvergleich — *erforderliche* inländische EE-Erzeugung aus Wind+PV | **630–1.480** | ★★ |

### 4.2 Die Revision der 2030er Annahme — für das White-Paper zentral

Der **Monitoringbericht zur Energiewende** (vorgelegt von Bundeswirtschaftsministerin
Katherina Reiche am **15.09.2025**, wissenschaftliche Zuarbeit durch **EWI und BET Aachen**)
hat die zuvor maßgebliche Annahme von **≈ 750 TWh für 2030 auf einen Korridor von
600–700 TWh** korrigiert — eine Absenkung um **10–15 %**. ★★★

Als Hauptgründe werden genannt: ★★
- **langsamerer Hochlauf der Wasserstoffproduktion** (Elektrolyse) in Deutschland als geplant,
- **geringere industrielle Nachfrage** als in den Vorgängerszenarien unterstellt.

Der Bericht ist wissenschaftlich kontrovers rezipiert worden: Der BDEW bezeichnet ihn als
„überzeugenden Angang“, andere Kommentierungen halten ihn für „faktenbasiert, aber unkonkret“.
Für ein neutrales White-Paper empfiehlt sich die Darstellung als **Korridor mit expliziter
Nennung der Revisionsrichtung und ihrer Treiber**, nicht als gesicherter Punktwert. ★★

### 4.3 Nachfragetreiber — quantifiziert, soweit belegbar

| Treiber | Beitrag | Zieljahr | Quelle | Konfidenz |
| --- | --- | --- | --- | :---: |
| **Elektrolyse (H₂)** | **104–160 TWh** | 2037 | NEP 2037/2045 (2025) | ★★★ |
| **Elektrolyse (H₂)** | **184–320 TWh** (nahezu Verdopplung ggü. 2037) | 2045 | NEP 2037/2045 (2025) | ★★★ |
| **Rechenzentren / IT** | NEP-Annahme liegt **≈ 50 TWh über** dem Korridor vergleichbarer Szenarien | 2037 | NEP / Monitoringbericht | ★★★ |
| **Rechenzentren / IT** | **bis zu 88 TWh** IT-Stromverbrauch | 2045 | BMWK-Langfristszenarien | ★★ |
| **Wärmepumpen** (Gebäude + Fernwärmenetze) | Als **Haupttreiber** benannt, **nicht separat quantifiziert** ❑ | 2030–2045 | NEP-Szenariorahmen | ★★ |
| **Verkehr / E-Mobilität** | Als **Haupttreiber** benannt, **nicht separat quantifiziert** ❑ | 2030–2045 | NEP-Szenariorahmen | ★★ |
| **Batteriezellproduktion** | Als eigenständiger Treiber benannt, nicht quantifiziert ❑ | 2030–2045 | NEP-Szenariorahmen | ★★ |

❑ **Bedeutende Lücke:** Die sektorale Aufschlüsselung der Nachfragetreiber (TWh je Sektor und
Stützjahr) ist in den NEP- und LFS-Originaltabellen enthalten, war aber über die Suche nicht
extrahierbar. **Für ein quantitatives Simulationsmodell ist dieser Datensatz unverzichtbar
und muss aus den Primärdokumenten nachgezogen werden** (NEP 2037/2045 V2025 Kapitel 3;
LFS3-Berichte auf langfristszenarien.de).

⚠ **Methodischer Hinweis zur Rechenzentren-Position:** Der Monitoringbericht stellt fest, dass
die NEP-Szenarien beim Stromverbrauch insgesamt **innerhalb** des Korridors liegen, ihn aber
**bei Elektrolyse und Rechenzentren jeweils um rund 50 TWh überschreiten**. Das bedeutet: Der
NEP unterstellt in diesen beiden Segmenten mehr, in anderen Segmenten entsprechend weniger.
Diese Kompensation sollte im White-Paper benannt werden, weil sie sonst zu Doppelzählungen
führt.

**Quellen:**
- BMWE / EWI / BET: *Monitoringbericht zur Energiewende*, vorgelegt 15.09.2025 (Zusammenfassungen und Reaktionen) —
  https://www.bhkw-infozentrum.de/bhkw-news/59414_Monitoringbericht-zur-Energiewende-Analyse-Reaktionen-und-Perspektiven.html (Zugriff 2026-08-15)
- Graf Kerssenbrock: *Monitoringbericht zur Energiewende: Strombedarf und Versorgungssicherheit* —
  https://grafkerssenbrock.com/monitoringbericht-energiewende-strombedarf-versorgungssicherheit (Zugriff 2026-08-15)
- Science Media Center Germany: *Wie viel Strom könnte Deutschland 2030 verbrauchen?*, 2025 —
  https://www.sciencemediacenter.de/angebote/wie-viel-strom-koennte-deutschland-2030-verbrauchen-25172 (Zugriff 2026-08-15)
- Orsted/Energiewinde: *Monitoring der Energiewende: Tritt Katherina Reiche aufs Bremspedal?* —
  https://energiewinde.orsted.de/energiepolitik/monitoring-energiewende-stromverbrauch-2030-katherina-reiche-erneuerbare (Zugriff 2026-08-15)
- Öko-Institut / Expertenkommission zum Energiewende-Monitoring: *Statusupdate Stand Energiewende*, 2025 —
  https://www.oeko.de/fileadmin/oekodoc/2025-Statusupdate-Stand-Energiewende.pdf (Zugriff 2026-08-15)
- ÜNB: *Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 1. Entwurf*, Dezember 2025, Kap. 3 —
  https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_Kap3.pdf (Zugriff 2026-08-15)
- ÜNB: *Szenariorahmen zum Netzentwicklungsplan Strom 2037/2045, Version 2025* —
  https://www.netzentwicklungsplan.de/sites/default/files/2024-07/Szenariorahmenentwurf_NEP2037_2025.pdf (Zugriff 2026-08-15)
- Bundesnetzagentur: *Genehmigung des Szenariorahmens 2025-2037/2045*, April 2025 —
  https://www.netzentwicklungsplan.de/sites/default/files/2025-04/Genehmigung%20Szenariorahmen%202025_0.pdf (Zugriff 2026-08-15)
- Kopernikus-Projekt Ariadne: *Deutschland auf dem Weg zur Klimaneutralität 2045 — Szenarien und Pfade im Modellvergleich*, Erstveröffentlichung 11.10.2021 —
  https://ariadneprojekt.de/publikation/deutschland-auf-dem-weg-zur-klimaneutralitat-2045-szenarienreport/ (Zugriff 2026-08-15)
- Kopernikus-Projekt Ariadne: *Die Energiewende kosteneffizient gestalten: Szenarien zur Klimaneutralität 2045*, März 2025 —
  https://ariadneprojekt.de/media/2025/03/Ariadne-Report_Szenarien2025_Maerz2025_lowres.pdf (Zugriff 2026-08-15)
- McKinsey & Company: *Zukunftspfad Stromnachfrage*, 20.01.2025 —
  https://www.mckinsey.de/~/media/mckinsey/locations/europe%20and%20middle%20east/deutschland/news/presse/2025/2025-01-20%20zukunftspfad%20stromnachfrage/mckinsey_zukunftspfad%20stromnachfrage_januar%202025.pdf (Zugriff 2026-08-15)
- Montel News: *BMWK rechnet für 2045 mit bis zu 88 TWh IT-Stromverbrauch* —
  https://montelnews.com/de/news/eaddc809-bc38-4e98-a4a4-6ffd06b0c0ca/bmwk-rechnet-fur-2045-mit-bis-zu-88-twh-it-stromverbrauch (Zugriff 2026-08-15)

---

## 5. Netzausbau, Netzentgelte und Engpassmanagement

### 5.1 Investitionsvolumina

**a) Übertragungsnetz — NEP 2037/2045, Version 2025 (1. Entwurf, Dezember 2025)**

| Position | Wert | Konfidenz |
| --- | ---: | :---: |
| Gesamtinvestition bis 2045, über die Szenarien | **≈ 365–392 Mrd. EUR** | ★★ |
| Szenario A: bis 2037 | **≈ 283 Mrd. EUR** | ★★ |
| Szenario A: 2037–2045 zusätzlich | **≈ 80 Mrd. EUR** | ★★ |
| Szenario B (an offiziellen Klimazielen ausgerichtet): Aufschlag bis 2037 | **+17 Mrd. EUR** | ★★ |
| Szenario B: Aufschlag 2037–2045 | **+24 Mrd. EUR** | ★★ |
| Szenario B gesamt über 19 Jahre | **> 400 Mrd. EUR** | ★★ |
| Erforderliche Ø-Jahresinvestition bis 2037 | **≈ 19,8 Mrd. EUR/a** | ★★ |
| Erforderliche Ø-Jahresinvestition ab 2037 | **≈ 5,4 Mrd. EUR/a** | ★★ |

**b) Übertragungs- **und** Verteilnetz — IMK/Hans-Böckler-Stiftung (Dezember 2024)**

| Position | Wert | Konfidenz |
| --- | ---: | :---: |
| Übertragungsnetz bis 2045 | **328 Mrd. EUR** | ★★★ |
| Verteilnetz bis 2045 | **323 Mrd. EUR** (Ø **14,4 Mrd. EUR/a**, ca. doppelt so viel wie 2023) | ★★★ |
| **Gesamt bis 2045** | **≈ 651 Mrd. EUR** | ★★★ |
| Erforderlicher Anstieg des Jahresvolumens | von **≈ 15 Mrd. EUR (2023)** auf **≈ 34 Mrd. EUR/a** (**+127 %**) | ★★★ |

**Einordnung:** Die IMK-Zahl (651 Mrd.) und die NEP-Zahl (365–400 Mrd.) sind **kein
Widerspruch** — der NEP deckt nur das Übertragungsnetz ab, die IMK-Studie zusätzlich das
Verteilnetz. Die beiden Übertragungsnetz-Werte (328 vs. 365–392 Mrd.) liegen in derselben
Größenordnung; die Differenz erklärt sich aus unterschiedlichen NEP-Ständen (IMK basiert auf
dem NEP-Stand 2024) und Szenarienwahl. Die IMK-Studie weist ausdrücklich auf **Aufwärtsrisiken**
hin: Rohstoffpreise, Komponentenknappheit (Transformatoren, Leitungen), Genehmigungsverzüge.

### 5.2 Netzentgelte 2026

| Kennzahl | Wert | Konfidenz |
| --- | --- | :---: |
| Übertragungsnetzentgelt 2026 **ohne** Bundeszuschuss | **≈ 6,65 ct/kWh** | ★★★ |
| Übertragungsnetzentgelt 2026 **mit** Bundeszuschuss | **2,86 ct/kWh** (**−57 %** auf Höchstspannungsebene) | ★★★ |
| Bundeszuschuss 2026 | **6,5 Mrd. EUR** aus dem Klima- und Transformationsfonds (KTF) | ★★★ |
| Netzentgelte im Haushaltsstrompreis (Ø) | **9,3 ct/kWh** | ★★ |
| Entlastung Musterhaushalt (3.500 kWh/a) | **≈ 130 EUR/a** | ★★★ |

Die ÜNB sind gesetzlich verpflichtet, den Zuschuss **vollständig und ohne eigenen finanziellen
Vorteil** an alle Kunden weiterzugeben. Die regionale Wirkung ist stark ungleich: Verbraucher
in Brandenburg oder Mecklenburg-Vorpommern werden deutlich stärker entlastet als in Hamburg
oder Nordrhein-Westfalen — Ausdruck der bestehenden regionalen Netzentgeltspreizung. ★★★

⚠ **Wichtiger Hinweis für die Modellierung:** Die Entlastung 2026 ist eine **haushaltsfinanzierte
Transferleistung, keine Kostensenkung.** Die Netzkosten selbst sinken nicht; sie werden vom
Netzentgelt in den Bundeshaushalt verlagert. Für Gesamtkostenbetrachtungen sind beide Positionen
zu addieren, nicht zu saldieren.

### 5.3 Redispatch- und Engpassmanagementkosten

| Zeitraum | Kosten | Konfidenz |
| --- | ---: | :---: |
| **Gesamtjahr 2025** | **≈ 2,7–3,1 Mrd. EUR** ⚠ | ★★ |
| davon konventioneller Redispatch | **> 1,2 Mrd. EUR** (größter Einzelblock) | ★★ |
| davon Reservekraftwerke | **≈ 1,4 Mrd. EUR** | ★★ |
| davon Countertrading | **≈ 102 Mio. EUR** | ★★ |
| Q2 2025 — Entschädigung EE-Abregelung | **≈ 158 Mio. EUR** (Q2 2024: 162 Mio. EUR) | ★★ |
| Q3 2025 — Gesamtkosten (vorläufig) | **≈ 667 Mio. EUR** (Q3 2024: 608 Mio. EUR) | ★★ |
| Q4 2025 — Gesamtkosten | **≈ 885 Mio. EUR** (**−18 %** ggü. Q4 2024), Eingriffsvolumen **−9 %** | ★★ |

⚠ **Widerspruch 2,7 vs. 3,1 Mrd. EUR:** Amprion veröffentlichte im Januar 2026 eine vorläufige
Schätzung von **≈ 2,7 Mrd. EUR** („auf Vorjahresniveau“), andere Auswertungen kommen auf
**≈ 3,1 Mrd. EUR**. Ursache ist vermutlich der Abgrenzungsumfang (mit/ohne Reservekraftwerke,
mit/ohne Netzreserve-Vorhaltung) sowie der Unterschied vorläufig/endabgerechnet. **Für das
Modell: Bandbreite 2,7–3,1 Mrd. EUR ansetzen.**

**Bemerkenswert für die inhaltliche Argumentation:** Der größte Kostenblock entfiel 2025
**nicht** auf die Abregelung von Wind- und Solaranlagen, sondern auf konventionellen Redispatch
(> 1,2 Mrd. EUR) und Reservekraftwerke (≈ 1,4 Mrd. EUR). Die verbreitete Gleichsetzung
„Redispatchkosten = Kosten der Erneuerbaren“ ist damit quellenmäßig nicht gedeckt. ★★

**Quellen:**
- ÜNB: *Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025 — 2. Entwurf* —
  https://www.netzentwicklungsplan.de/nachrichten/uenb-veroeffentlichen-zweiten-entwurf-des-nep-20372045-2025 (Zugriff 2026-08-15)
- neue energie: *Milliarden für Leitungen: Wem nützt der Netzentwicklungsplan?* —
  https://www.neueenergie.net/artikel/wissen/infrastruktur/netzentwicklungsplan-netzausbau-hochspannungsebene (Zugriff 2026-08-15)
- Krebs, T. et al.; IMK in der Hans-Böckler-Stiftung: *Ausbau der Stromnetze: Investitionsbedarfe*, IMK Study Nr. 97, Dezember 2024 —
  https://www.imk-boeckler.de/fpdf/HBS-009011/p_imk_study_97_2024.pdf ·
  Pressemitteilung: https://www.imk-boeckler.de/de/pressemitteilungen-15992-studie-berechnet-investitionsbedarf-in-deutsche-stromnetze-65371.htm (Zugriff 2026-08-15)
- dena: *Verteilnetzstudie II — Abschlussbericht*, 2025 —
  https://www.dena.de/fileadmin/dena/Publikationen/PDFs/2025/dena_Verteilnetzstudie_II.pdf (Zugriff 2026-08-15)
- Bundesregierung: *Niedrigere Netzentgelte für 2026* —
  https://www.bundesregierung.de/breg-de/aktuelles/niedrigere-netzentgelte-2382396 (Zugriff 2026-08-15)
- enet: *Bundeszuschuss entfaltet deutliche Wirkung auf Stromnetzentgelte* —
  https://www.enet.eu/aktuelles/bundeszuschuss-entfaltet-deutliche-wirkung-auf-stromnetzentgelte (Zugriff 2026-08-15)
- Bundesnetzagentur: *Netzengpassmanagement* —
  https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Netzengpassmanagement/start.html (Zugriff 2026-08-15)
- SMARD / Bundesnetzagentur: *Netzengpassmanagement — Maßnahmenvolumen im Gesamtjahr stabil* —
  https://www.smard.de/page/home/topic-article/444/219906/massnahmenvolumen-im-gesamtjahr-stabil (Zugriff 2026-08-15)
- SMARD / Bundesnetzagentur: *Netzengpassmanagement in Q3/2025 — Volumen und Kosten gestiegen* —
  https://www.smard.de/page/home/topic-article/444/219200/volumen-und-kosten-gestiegen (Zugriff 2026-08-15)
- Bundesverband WindEnergie: *Faktencheck: Was kostet uns Redispatch?*, 21.04.2026 —
  https://www.wind-energie.de/fileadmin/redaktion/dokumente/publikationen-oeffentlich/themen/04-politische-arbeit/01-gesetzgebung/20260421_Faktencheck_Redispatch.pdf (Zugriff 2026-08-15)
- Cleanthinking: *Redispatch-Kosten 2026: Stimmt Reiches Zahl? Faktencheck* —
  https://www.cleanthinking.de/faktencheck-redispatch-drei-milliarden/ (Zugriff 2026-08-15)

---

## 6. Kohleausstieg und Kraftwerksstrategie

### 6.1 Kohleausstiegspfad

**Rechtsgrundlage:** Kohleverstromungsbeendigungsgesetz (**KVBG**, 2020).

| Element | Regelung | Konfidenz |
| --- | --- | :---: |
| Gesetzlicher Enddatum Kohleverstromung | **spätestens 2038** | ★★★ |
| Braunkohle Rheinisches Revier | **vorgezogen auf 2030** — bisheriges Enddatum 2038 aufgehoben, alle verbleibenden Blöcke bis 2030 vom Netz | ★★★ |
| Braunkohle Mitteldeutsches Revier und Lausitz | **schrittweiser Ausstieg bis 2038** | ★★★ |
| Braunkohle allgemein | **anlagenscharfer Stilllegungspfad 2020–2038** vertraglich mit den Betreibern vereinbart, verknüpft mit Entschädigungsregelungen für Kapitalverluste | ★★★ |
| Steinkohle | **Kein eigener Stilllegungspfad** (entsprechend dem Abschlussbericht der Kohlekommission). Ausstieg über **sieben Ausschreibungsrunden bis zum Zieljahr 2026**; ab **2027** greift das **gesetzliche Reduzierungsverfahren** | ★★★ |
| **Überprüfungstermine** | **2026, 2029, 2032** — Prüfung, ob das Enddatum für alle Kraftwerke (Braun- **und** Steinkohle) **um drei Jahre auf 2035** vorgezogen werden kann | ★★★ |

**Relevanz des Prüftermins 2026:** Der erste der drei gesetzlichen Überprüfungstermine fällt in
das laufende Jahr. Ein Ergebnis dieser Überprüfung war zum Recherchestichtag nicht auffindbar. ❑

**Installierte Kohleleistung als Ausstiegs-Ist-Stand** (siehe Abschnitt 2):
Braunkohle **14.758 MW** (Jahresende 2025, **−361 MW** ggü. Jahresende 2024),
Steinkohle **15.387 MW** (Jahresende 2025). Der Rückbaupfad verläuft damit derzeit
**deutlich langsamer** als für einen Ausstieg 2030 im Rheinischen Revier plus 2038 andernorts
rechnerisch erforderlich wäre — eine belastbare Gegenüberstellung Ist-Rückbau vs.
KVBG-Anlagenpfad konnte im Rahmen dieser Recherche nicht erstellt werden. ❑

### 6.2 Kraftwerksstrategie und Kapazitätsmechanismus — Stand August 2026

| Element | Stand | Datum | Konfidenz |
| --- | --- | --- | :---: |
| **Gesetzesbezeichnung** | *Gesetz zur Sicherung der Versorgungssicherheit Strom und zur Bereitstellung neuer Kapazitäten* (**StromVKG**) — ersetzt die frühere Arbeitsbezeichnung „Kraftwerkssicherheitsgesetz (KWSG)“ | — | ★★ |
| **Grundsatzeinigung mit EU-Kommission** über Eckpunkte | erzielt | **15.01.2026** | ★★★ |
| **Kabinettsbeschluss** | erfolgt | **13.05.2026** | ★★★ |
| **1. Ausschreibungsrunde** | **4,5 GW** | **01.09.2026** | ★★★ |
| **2. Ausschreibungsrunde** | **4,5 GW** | **08.12.2026** | ★★★ |
| **Zunächst ausgeschriebenes Gesamtvolumen** | **11 GW** neue steuerbare Kapazität | 2026 | ★★ |
| **Weitere Ausschreibungen** | vorgesehen | **2027 und 2029** | ★★ |
| **Inbetriebnahme der Anlagen aus Runde 1** | **spätestens 2031** | — | ★★ |
| **Kapazitätsmechanismus** | soll im Anschluss an die Kraftwerksstrategie sicherstellen, dass **bis 2031** ausreichend gesicherte Leistung verfügbar ist | — | ★★ |
| **Koalitionsvertrag (CDU/CSU/SPD)** | Förderung des Baus von **bis zu 20 GW** Gaskraftwerksleistung **bis 2030** | 2025 | ★★★ |

**Technologiefokus:** Im Zentrum stehen **wasserstofffähige Gaskraftwerke**; ausdrücklich
förderfähig sind daneben **Speicher und andere steuerbare Erzeugungsanlagen**. ★★

⚠ **Zwei ungeklärte Punkte, die für die Modellierung erheblich sind:**
1. **Diskrepanz 11 GW vs. 20 GW.** Der Koalitionsvertrag nennt bis zu 20 GW bis 2030, die
   aktuelle Ausschreibungsarchitektur zunächst 11 GW mit Inbetriebnahme bis 2031. Ob die
   Differenz über die Runden 2027/2029 geschlossen werden soll, ist aus den vorliegenden
   Quellen nicht eindeutig ableitbar. ❑
2. **Ausgestaltung des Kapazitätsmechanismus** (zentral vs. dezentral, Abgrenzung zur
   Kraftwerksausschreibung, beihilferechtliche Genehmigung im Detail) ist noch **nicht
   final entschieden**. ❑

**Quellen:**
- Bundesministerium für Wirtschaft und Energie (BMWE): *Grundsatzeinigung mit der Europäischen Kommission über Eckpunkte der Kraftwerksstrategie*, Pressemitteilung, 15.01.2026 —
  https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/01/20260115-grundsatzeinigung-mit-europaeischen-kommission-ueber-eckpunkte-der-kraftwerksstrategie.html (Zugriff 2026-08-15)
- BMWE: *Kraftwerkssicherheitsgesetz — Neue Ausschreibungen für wasserstofffähige Gaskraftwerke* —
  https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Downloads/Energie/kraftwerkssicherheitsgesetz-wasserstofffaehige-gaskraftwerke.pdf (Zugriff 2026-08-15)
- pv magazine Deutschland: *Kraftwerksstrategie passiert Bundeskabinett*, 13.05.2026 —
  https://www.pv-magazine.de/2026/05/13/kraftwerksstrategie-passiert-bundeskabinett/ (Zugriff 2026-08-15)
- Börsen-Zeitung: *Ausschreibungen für neue Gaskraftwerke beginnen im September*, 2026 —
  https://www.boersen-zeitung.de/konjunktur-politik/ausschreibungen-fuer-neue-gaskraftwerke-beginnen-im-september (Zugriff 2026-08-15)
- BBH-Blog: *Kraftwerksstrategie: Weg frei für erste Ausschreibungen im Jahr 2026?* —
  https://www.bbh-blog.de/allgemein/kraftwerksstrategie-weg-frei-fuer-erste-ausschreibungen-im-jahr-2026/ (Zugriff 2026-08-15)
- Bundesnetzagentur: *Kohleausstieg* —
  https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Kohleausstieg/start.html (Zugriff 2026-08-15)
- BMWE: *Fragen und Antworten zum „Kohleausstiegsgesetz“* —
  https://www.bundeswirtschaftsministerium.de/Redaktion/DE/FAQ/Kohleausstiegsgesetz/faq-kohleausstiegsgesetz.html (Zugriff 2026-08-15)
- BMWK: *Kohleausstieg und Strukturwandel* —
  https://www.bmwi.de/Redaktion/DE/Artikel/Wirtschaft/kohleausstieg-und-strukturwandel.html (Zugriff 2026-08-15)
- Bundesministerium der Finanzen: *Kohleausstieg zur Erfüllung der Klimaschutzziele bei gleichzeitiger Sicherstellung der Energieversorgung* —
  https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Schlaglichter/Nachhaltigkeitsstrategie/kohleausstieg.html (Zugriff 2026-08-15)

---

## 7. Strompreis-Kontext

### 7.1 Börsenstrompreise (Day-Ahead, Marktgebiet DE/LU, Jahresmittel)

| Jahr | Ø [EUR/MWh] | Ø [ct/kWh] | Veränderung | Konfidenz |
| --- | ---: | ---: | --- | :---: |
| 2023 | **95,5** | 9,55 | — | ★★ |
| 2024 | **78,0–79,5** ⚠ | 7,80–7,95 | −16,8 % ggü. 2023 | ★★ ⚠ |
| 2025 | **86,5** | 8,65 | **+10,9 %** ggü. 2024 | ★★ |
| **H1 2026** | **≈ 99** | ≈ 9,9 | steigend; nur H1 2022 und H1 2023 lagen höher | ★★★ |
| Februar 2026 (Einzelmonat) | **96,58** | 9,66 | — | ★★ |

⚠ **Widerspruch 2024:** Eine Fundstelle nennt 7,95 ct/kWh, eine andere referenziert 2024 als
„Vorjahreswert 7,80 ct/kWh“ bei der Berechnung des 2025er Anstiegs. Beide Werte stammen aus
Sekundärquellen. **Bandbreite 78–79,5 EUR/MWh ansetzen; vor Publikation gegen EPEX/Energy-Charts
verifizieren.**

❑ **Für 2026 liegt noch kein Jahresmittel vor** (Recherchestichtag 15.08.2026). Der
H1-Wert von ≈ 99 EUR/MWh ist wegen der ausgeprägten Saisonalität **nicht** auf das Gesamtjahr
hochzurechnen.

**Negative Preise:**

| Zeitraum | Stunden mit negativem Preis | Konfidenz |
| --- | ---: | :---: |
| H1 2024 | 224 | ★★ |
| 2025 (Gesamtjahr) | **≈ 575** (Rekord) | ★★ |
| H1 2025 | 389 | ★★★ |
| H1 2026 | **299** (−90 h ggü. H1 2025, aber +33 % ggü. H1 2024) | ★★★ |
| H1 2026 — Extremwert | **−499,99 EUR/MWh** bei abgesenkter Preisuntergrenze | ★★ |

### 7.2 Endkundenpreise

| Kennzahl | 2025 | 2026 | Veränderung | Konfidenz |
| --- | ---: | ---: | ---: | :---: |
| **Haushaltsstrompreis** (3.500 kWh/a) | **39,3 ct/kWh** | **37,0 ct/kWh** | **−2,3 ct/kWh** | ★★★ |
| **Industriestrompreis**, Neuabschlüsse (160.000 kWh – 20 Mio. kWh/a) | 17,6 ct/kWh | **16,7 ct/kWh** | **−0,9 ct/kWh** | ★★ |

**Zusammensetzung des Haushaltsstrompreises 2026** (Ø, Stand April 2026): ★★

| Komponente | ct/kWh | Anteil |
| --- | ---: | ---: |
| Beschaffung und Vertrieb | **15,2** | 41,1 % |
| Netzentgelte | **9,3** | 25,1 % |
| Steuern, Abgaben und Umlagen | **12,6** | 34,1 % |
| **Summe** | **37,1** ⚠ (Rundungsdifferenz zu 37,0) | 100 % |

### 7.3 EEG-Förderkosten aus dem Bundeshaushalt

**Systemwechsel:** Bis Ende 2024 wurden die EEG-Differenzkosten aus dem **Klima- und
Transformationsfonds (KTF)** finanziert; **seit dem 01.01.2025 erfolgt die Finanzierung aus dem
Kernhaushalt**. ★★★ Die EEG-Umlage auf den Strompreis ist seit Juli 2022 auf null gesetzt.

**Jahr 2025 (Ist):**

| Position | Wert | Konfidenz |
| --- | ---: | :---: |
| Einnahmen EEG-Konto | **3,904 Mrd. EUR** | ★★ |
| Ausgaben EEG-Konto | **19,564 Mrd. EUR** | ★★ |
| **Bundeszuschuss** | **16,5 Mrd. EUR** | ★★★ |
| EEG-Konto-Saldo Jahresende 2025 | **Überschuss > 1,5 Mrd. EUR** | ★★★ |

**Jahr 2026 (Planung/Prognose):**

| Position | Wert | Konfidenz |
| --- | ---: | :---: |
| Haushaltsansatz Bundestag für EEG-Finanzierung 2026 | **17,2 Mrd. EUR** | ★★ |
| ÜNB-Prognose: Einnahmen | **3,109 Mrd. EUR** | ★★ |
| ÜNB-Prognose: Kosten | **17,792 Mrd. EUR** | ★★ |
| **ÜNB-Prognose: Finanzierungsbedarf ohne Kontoguthaben** | **16,152 Mrd. EUR** | ★★ |
| **Finanzierungsbedarf unter Anrechnung des Kontoguthabens** | **≈ 14,6 Mrd. EUR** | ★★ |
| Nachgemeldeter Mehrbedarf (frühere Haushaltsberatung) | **≈ 8,8 Mrd. EUR** | ★ |

**Struktureller Zusammenhang, der im White-Paper erklärt werden sollte:** Der EEG-Zuschussbedarf
korreliert **invers mit dem Börsenstrompreis**. 2026 steigen die Börsenpreise (H1: ≈ 99 EUR/MWh),
was den Differenzkostenbedarf tendenziell senkt — der prognostizierte Bedarf von 14,6–16,2 Mrd.
EUR liegt gleichwohl auf oder leicht unter dem Niveau von 2025. Gegenläufig wirkt der wachsende
geförderte Anlagenbestand. ★ (Interpretation des Verfassers auf Basis der obigen Zahlen, keine
Quellenaussage.)

**Gesamtbild der haushaltsfinanzierten Strompreisstützung 2026** (Addition der belegten
Positionen): **6,5 Mrd. EUR** Netzentgeltzuschuss **+ ca. 14,6–17,2 Mrd. EUR** EEG-Finanzierung
= **≈ 21–24 Mrd. EUR** aus dem Bundeshaushalt bzw. KTF. ★ (Summenbildung des Verfassers.)

**Quellen:**
- BDEW: *BDEW-Strompreisanalyse April 2026* — https://www.bdew.de/media/documents/BDEW_Strompreisanalyse_042026.pdf ·
  *BDEW-Strompreisanalyse Januar 2026* — https://www.bdew.de/media/documents/BDEW_Strompreisanalyse_012026.pdf (Zugriff 2026-08-15)
- BDEW: *Strompreis-Entwicklung in Deutschland für Haushalte und Industrie* —
  https://www.bdew.de/service/daten-und-grafiken/bdew-strompreisanalyse/ (Zugriff 2026-08-15)
- Strom-Report: *Strompreisentwicklung: So teuer wird Strom 2026* — https://strom-report.com/strompreisentwicklung/ (Zugriff 2026-08-15)
- Statista: *Börsenstrompreisentwicklung am EPEX-Spotmarkt bis Februar 2026* —
  https://de.statista.com/statistik/daten/studie/289437/umfrage/strompreis-am-epex-spotmarkt (Zugriff 2026-08-15)
- ZfK: *EEG-Kosten 2026: Wie viele Milliarden Deutschland zahlen muss* —
  https://www.zfk.de/politik/deutschland/eeg-kosten-2026-erneuerbaren-foerderung-wind-solar (Zugriff 2026-08-15)
- ZfK: *EEG-Kosten 2025: 16,5 Milliarden Euro für Wind, PV und Co.* —
  https://www.zfk.de/politik/deutschland/eeg-kosten-konto-165-milliarden-euro (Zugriff 2026-08-15)
- pv magazine Deutschland: *EEG-Konto schließt 2025 mit mehr als 1,5 Milliarden Euro Überschuss ab*, 13.01.2026 —
  https://www.pv-magazine.de/2026/01/13/eeg-konto-schliesst-2025-mit-mehr-als-15-milliarde-euro-ueberschuss-ab/ (Zugriff 2026-08-15)
- Deutscher Bundestag, heute im bundestag (hib): *Mehrausgabe von knapp 8,8 Milliarden Euro für das EEG-Konto* —
  https://www.bundestag.de/presse/hib/kurzmeldungen-1014724 (Zugriff 2026-08-15)
- BMWE: *Haushalt 2026* — https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Artikel/Ministerium/haushalt-2026.html (Zugriff 2026-08-15)

---

## 8. Zusammenfassung der offenen Lücken und Prüfaufträge

Diese Liste ist bewusst vollständig und explizit — sie ist der Arbeitsauftrag für die
Verifikationsrunde vor Publikation.

### 8.1 Harte Datenlücken (❑)

| Nr. | Lücke | Warum relevant | Wo zu schließen |
| --- | --- | --- | --- |
| L1 | **Nettostromverbrauch 2024/2025** (Absolutwert) | Explizit in der Aufgabenstellung gefordert; Bezugsgröße für Effizienz- und Kostenkennzahlen | AGEB-Auswertungstabellen „Stromverbrauch“ |
| L2 | **AGEB-Einzelwerte 2025** für Wind offshore, Steinkohle, Wasserkraft, Mineralöl | Drei Zeilen der Kern-Ergebnistabelle sind derzeit rekonstruiert, nicht belegt | AGEB STRERZ-Datenblatt, aktuellste Ausgabe |
| L3 | **Bruttostromerzeugung 2024** — Punktwert (501 vs. 507 TWh) | Basisjahr für alle Veränderungsraten | AGEB STRERZ, Zeitreihe |
| L4 | **Installierte Wasserkraftleistung** (Gesamtdeutschland, ohne PSE) | Fehlt in der Kapazitätstabelle | BNetzA-Kraftwerksliste / MaStR |
| L5 | **Installierte Biomasseleistung**, aktueller Stand | Vorliegender Wert (9.033 MW) ist von Okt. 2024 | BNetzA-Kraftwerksliste (Stand 26.06.2026) |
| L6 | **Sektorale Nachfragetreiber in TWh** (E-Mobilität, Wärmepumpen je Stützjahr) | Ohne diese Aufschlüsselung ist keine Bedarfssimulation möglich | NEP 2037/2045 V2025 Kap. 3; LFS3-Berichte |
| L7 | **LFS3-Punktwerte Bruttostromverbrauch 2035 und 2045** je T45-Szenario | 2035 fehlt derzeit vollständig in der Szenarienübersicht | langfristszenarien.de, Enertile-Explorer |
| L8 | **Ergebnis des KVBG-Überprüfungstermins 2026** (Vorziehen auf 2035?) | Läuft im Berichtsjahr; entscheidend für den Kohlepfad | BMWE / BNetzA |
| L9 | **Ist-Rückbaupfad Kohle vs. KVBG-Anlagenpfad** (Gegenüberstellung) | Erlaubt erst die Aussage, ob der Ausstieg „im Plan“ liegt | KVBG-Anlage 2 / BNetzA-Stilllegungsliste |
| L10 | **Finale Ausgestaltung des Kapazitätsmechanismus** | Bestimmt die Kostenposition ab 2031 | BMWE, StromVKG-Gesetzgebungsverfahren |
| L11 | **Jahresmittel Börsenstrompreis 2026** | Jahr läuft noch (Stichtag 15.08.2026) | Nachtrag ab Januar 2027 |
| L12 | **Import/Export-Saldo Gesamtjahr 2026** | Q1 2026 zeigt Trendwende zum Netto-Export; Jahreswert offen | BNetzA-Jahresauswertung Januar 2027 |

### 8.2 Explizite Widersprüche zwischen Quellen (⚠)

| Nr. | Widerspruch | Empfohlener Umgang |
| --- | --- | --- |
| W1 | EE-Anteil 2025: 54 % / 55,1 % / 55,9 % / 56 % | Abgrenzung mitzitieren; Bandbreite **55–56 %** am Bruttostromverbrauch |
| W2 | Nettoimport 2025: 21,9 vs. ≈ 19 TWh | Bandbreite **19–22 TWh**; physikalisch vs. kommerziell prüfen |
| W3 | Bruttostromverbrauch 2025: ≈ 512 vs. 526 TWh | Bandbreite ausweisen, Punktwert nachziehen |
| W4 | Batteriespeicher: 18,5 GW / 20,0 GW / 1,2 GW („Großspeicher“) | 18,5–20 GW für Gesamtbestand; 1,2-GW-Wert **nicht verwenden** |
| W5 | PV-Zubau 2025: 16,4 GW (BNetzA) vs. 17,5 GW (BSW) | BNetzA als amtliche Quelle führen, BSW als Fußnote |
| W6 | Redispatch 2025: 2,7 vs. 3,1 Mrd. EUR | Bandbreite **2,7–3,1 Mrd. EUR** |
| W7 | Börsenstrompreis 2024: 78,0 vs. 79,5 EUR/MWh | Bandbreite **78–79,5** |
| W8 | AGEB-Angabe „Wind 110,1 TWh“ — onshore oder gesamt? | Als **onshore** interpretiert (plausibilisiert gegen ISE); verifizieren |
| W9 | Netzinvestitionen ÜNB: 328 (IMK) vs. 365–392 Mrd. EUR (NEP) | Kein echter Widerspruch — unterschiedliche NEP-Stände/Szenarien; beide nennen |

### 8.3 Kennzeichnungspflichtige Eigenleistungen des Verfassers

Folgende Werte im Dokument sind **keine Quellenangaben**, sondern Ableitungen und im
White-Paper als solche zu markieren:

- Rekonstruktion Wind offshore / Steinkohle / Wasserkraft 2025 aus der EE-Differenz (Abschn. 1.1)
- Schätzung Nettostromverbrauch 2024/2025 ≈ 470–485 TWh über 7–9 % Abschlag (Abschn. 1.5)
- Absolutwerte der Destatis-Prozentanteile 2024 (Abschn. 1.3)
- Wind-onshore-Zubau Jan–Jul 2026 ≈ 2,9 GW aus Differenz Wind gesamt minus offshore (Abschn. 2.2)
- Erforderliche Ø-Jahreszubauraten und Zielerreichungsfaktoren (Abschn. 3.2)
- Summe der haushaltsfinanzierten Strompreisstützung 2026 ≈ 21–24 Mrd. EUR (Abschn. 7.3)
- Aussage zum inversen Zusammenhang EEG-Zuschuss / Börsenstrompreis (Abschn. 7.3)

---

## 9. Konsolidierter Datensatz für das Simulationsmodell

Der folgende Block ist die maschinenlesbare Fassung der oben belegten Werte. Konventionen:

- `null` = Datenlücke (siehe Abschnitt 8.1)
- Bandbreiten als `{"low": x, "high": y}`
- `confidence`: `"high"` (★★★), `"medium"` (★★), `"low"` (★ / abgeleitet)
- `derived: true` = vom Verfasser abgeleitet, nicht direkt aus der Quelle
- Alle Energiemengen in **TWh**, Leistungen in **GW**, Speicherkapazitäten in **GWh**,
  Geldbeträge in **Mrd. EUR** (sofern nicht anders benannt), Preise in **EUR/MWh** bzw. **ct/kWh**

```json
{
  "meta": {
    "titel": "Ist-Zustand und Zielpfade des deutschen Stromsystems",
    "erstellt": "2026-08-15",
    "zugriffsdatum_quellen": "2026-08-15",
    "methodik": "Websuche-basiert; direkter Primaerquellen-Abruf durch Netzwerk-Egress-Policy blockiert. Werte vor Publikation gegen Originaldokumente verifizieren.",
    "einheiten": {
      "energie": "TWh",
      "leistung": "GW",
      "speicherkapazitaet": "GWh",
      "geld": "Mrd_EUR",
      "grosshandelspreis": "EUR_pro_MWh",
      "endkundenpreis": "ct_pro_kWh"
    },
    "konfidenz_skala": ["high", "medium", "low"]
  },

  "ist_mix": {
    "2025": {
      "bruttostromerzeugung_gesamt_inkl_pse": 509.3,
      "bruttostromerzeugung_ohne_pse": 502.2,
      "erneuerbare_gesamt": 292.0,
      "fossil_gesamt": 217.3,
      "kernenergie": 0.0,
      "pumpspeichererzeugung": 7.1,
      "confidence": "medium",
      "quelle": "AG Energiebilanzen, STRERZ-Datenblatt 2025 / AGEB-Wintertagung 15.12.2025",
      "traeger_twh": {
        "wind_onshore":      {"wert": 110.1, "confidence": "medium", "derived": false},
        "photovoltaik":      {"wert": 89.5,  "confidence": "medium", "derived": false},
        "erdgas":            {"wert": 84.9,  "confidence": "medium", "derived": false},
        "braunkohle":        {"wert": 75.2,  "confidence": "medium", "derived": false},
        "biomasse":          {"wert": 42.7,  "confidence": "medium", "derived": false},
        "wind_offshore":     {"wert": 28.0,  "confidence": "low",    "derived": true, "hinweis": "Differenzrechnung aus EE-Summe"},
        "steinkohle":        {"low": 25.0, "high": 28.0, "confidence": "low", "derived": true},
        "wasserkraft":       {"wert": 21.0,  "confidence": "low",    "derived": true, "hinweis": "Differenzrechnung aus EE-Summe"},
        "mineraloel_sonstige_abfall": {"wert": 28.9, "confidence": "low", "derived": false, "hinweis": "gemeinsam ausgewiesen; im Fossil-Block enthalten, nicht additiv"},
        "kernenergie":       {"wert": 0.0,   "confidence": "high",   "derived": false}
      },
      "oeffentliche_nettoerzeugung_ise": {
        "ee_anteil_prozent": 55.9,
        "wind_gesamt": 132.0,
        "photovoltaik_gesamt": 87.0,
        "pv_wachstum_prozent": 21.0,
        "confidence": "high",
        "quelle": "Fraunhofer ISE / Energy-Charts, Jahresauswertung 2025"
      },
      "ee_anteil_bruttostromverbrauch_prozent": {"low": 55.0, "high": 56.0, "confidence": "medium", "hinweis": "Quellen nennen 54 / 55.1 / 56 je nach Stand und Abgrenzung"},
      "bruttostromverbrauch": {"low": 512.0, "high": 526.0, "confidence": "low", "hinweis": "Widerspruch W3"},
      "nettostromverbrauch": {"wert": null, "schaetzung_low": 470.0, "schaetzung_high": 485.0, "confidence": "low", "derived": true, "hinweis": "Datenluecke L1; Schaetzung ueber 7-9 % Abschlag"},
      "import_twh": 76.2,
      "export_twh": 54.3,
      "nettoimport_twh": {"low": 19.0, "high": 21.9, "confidence": "medium", "hinweis": "Widerspruch W2"},
      "import_struktur_prozent": {"erneuerbar": 55, "kernenergie": 23, "fossil": 13, "hinweis": "summiert nicht auf 100, Quelle unvollstaendig"},
      "wichtigste_lieferlaender": ["Daenemark", "Frankreich", "Niederlande", "Norwegen"]
    },

    "2024": {
      "bruttostromerzeugung": {"low": 501.0, "high": 507.0, "confidence": "low", "hinweis": "Widerspruch W3/L3"},
      "bruttostromverbrauch": {"wert": 518.0, "confidence": "high", "quelle": "NEP 2037/2045 V2025, Basisjahr"},
      "eingespeiste_strommenge_destatis": {"wert": 431.7, "confidence": "low", "derived": true},
      "ee_eingespeist_destatis": {"wert": 256.4, "anteil_prozent": 59.4, "confidence": "high"},
      "ee_erzeugung_gesamt_agee": 275.2,
      "pv_erzeugung_gesamt": 72.2,
      "wind_gesamt_ise": 136.4,
      "ee_anteil_oeff_nettoerzeugung_prozent": 62.7,
      "erdgas_anteil_prozent": 14.9,
      "nettoimport_twh": {"wert": 28.3, "confidence": "low", "derived": true}
    },

    "2026_h1": {
      "ee_anteil_bruttostromverbrauch_prozent": 57.0,
      "ee_wachstum_prozent": 6.0,
      "ee_struktur_prozent": {"wind": 45, "photovoltaik": 34, "biomasse": 15},
      "handelssaldo_q1": "erstmals seit 2023 wieder Netto-Exporteur",
      "confidence": "high",
      "quelle": "UBA / AGEE-Stat, Pressemitteilung Juli 2026"
    }
  },

  "installierte_leistung_gw": {
    "stand_jahresende_2025": {
      "photovoltaik":      {"wert": 117.0, "confidence": "high"},
      "wind_onshore":      {"wert": 68.1,  "confidence": "high"},
      "wind_offshore":     {"wert": 9.6,   "confidence": "high"},
      "erdgas":            {"low": 35.0, "high": 36.0, "confidence": "medium"},
      "steinkohle":        {"wert": 15.387, "confidence": "medium"},
      "braunkohle":        {"wert": 14.758, "confidence": "medium", "veraenderung_ggue_2024": -0.361},
      "biomasse":          {"wert": 9.033, "confidence": "low", "hinweis": "Stand Okt 2024, veraltet - Luecke L5"},
      "wasserkraft_ohne_pumpspeicher": {"low": 4.7, "high": 5.6, "confidence": "low", "hinweis": "Luecke L4"},
      "pumpspeicher":      {"wert": 6.253, "confidence": "medium"},
      "erneuerbare_gesamt": {"wert": 210.0, "zubau_2025": 21.0, "confidence": "high"},
      "alle_anlagen_netto": {"wert": 265.4, "stand": "2025-05", "confidence": "medium"}
    },
    "stand_juli_2026": {
      "photovoltaik":  {"wert": 126.6, "confidence": "medium", "derived": true},
      "wind_onshore":  {"wert": 71.0,  "confidence": "low",    "derived": true},
      "wind_offshore": {"wert": 10.8,  "confidence": "high"}
    },
    "batteriespeicher": {
      "leistung_gw": {"low": 18.5, "high": 20.0, "confidence": "medium"},
      "kapazitaet_gwh": {"low": 31.0, "high": 31.5, "confidence": "medium"},
      "anlagenzahl_mio": 2.6,
      "stand": "2026-H1 bis 2026-07",
      "zubau_h1_2026_mw": 2482.7,
      "zubau_h1_2026_mwh": 5642,
      "projektion_ende_2026_gwh": 35.0,
      "hinweis": "Widerspruch W4: Angabe 'Grossspeicher 1.2 GW / 2.4 GWh' ist implausibel und nicht zu verwenden"
    },
    "zubau_2025": {
      "photovoltaik": {"bnetza": 16.4, "bsw": 17.5, "confidence": "high", "hinweis": "Widerspruch W5"},
      "wind_onshore": {"wert": 4.6, "vorjahr": 2.6, "confidence": "high"},
      "wind_offshore": {"wert": 0.0, "confidence": "high"}
    },
    "zubau_jan_jul_2026": {
      "photovoltaik_mw": 9572,
      "photovoltaik_anlagen": 484530,
      "wind_gesamt_mw": 3948,
      "wind_anlagen": 587,
      "wind_offshore_mw_h1": 1062.2,
      "wind_onshore_mw": {"wert": 2886, "derived": true},
      "wind_plus_pv_mw": 12916,
      "vorjahreswert_wind_plus_pv_mw": 11600
    }
  },

  "zielpfade": {
    "rechtsgrundlagen": ["EEG 2023 (§1, §4)", "WindSeeG"],
    "ee_anteil_bruttostromverbrauch_2030_prozent": 80,
    "ziele_gw": {
      "photovoltaik":  {"2030": 215, "2045_richtwert": 400, "max_jahreszubau": 22},
      "wind_onshore":  {"2030": 115, "2045_richtwert": 160, "max_jahreszubau": 10},
      "wind_offshore": {"2030": 30, "2035": 40, "2045": 70}
    },
    "zielerreichung_anfang_2026": {
      "photovoltaik":  {"ist_gw": 117.0, "ziel_gw": 215, "erreichung_prozent": 54, "rest_gw": 98.0,  "erforderlich_gw_pro_jahr": 19.6, "ist_zubau_2025": 16.4, "luecke_faktor": 1.2, "derived": true},
      "wind_onshore":  {"ist_gw": 68.1,  "ziel_gw": 115, "erreichung_prozent": 59, "rest_gw": 46.9,  "erforderlich_gw_pro_jahr": 9.4,  "ist_zubau_2025": 4.6,  "luecke_faktor": 2.0, "derived": true},
      "wind_offshore": {"ist_gw": 10.8,  "ziel_gw": 30,  "erreichung_prozent": 36, "rest_gw": 19.2,  "erforderlich_gw_pro_jahr": 4.3,  "ist_zubau_2025": 0.0,  "luecke_faktor": 4.0, "derived": true}
    },
    "offshore_pipeline_gw": {
      "in_betrieb": 10.8,
      "im_bau": 1.3,
      "finale_investitionsentscheidung": 2.6,
      "zuschlag_oder_netzanbindungsanspruch": 17.5,
      "nur_fuer_ausschreibung_vorgesehen": 9.0,
      "stand": "2026-Jahresmitte",
      "bewertung_quelle": "Ziel 2030 zeitlich nicht mehr erreichbar; Ziel 2035 bei plangemaesser Umsetzung moeglich; Ziel 2045 erfordert weitere Festlegungen"
    },
    "pv_zwischenziel_2026_gw": 128
  },

  "bedarfsprojektionen_twh": {
    "basis_2024": 518,
    "2030": {
      "bmwk_langfristszenarien": {"low": 594, "high": 638, "confidence": "medium"},
      "monitoringbericht_2025_ewi_bet": {"low": 600, "high": 700, "confidence": "high"},
      "eeg_novelle_2023_alte_annahme": 750,
      "mckinsey_trendpfad_netto": 530,
      "empfohlene_modellspanne": {"low": 594, "high": 700}
    },
    "2035": {"wert": null, "confidence": null, "hinweis": "Datenluecke L7"},
    "2037": {
      "nep_2037_2045_v2025": {"low": 845, "high": 1065, "confidence": "high"}
    },
    "2045": {
      "nep_2037_2045_v2025": {"low": 948, "high": 1275, "confidence": "high"},
      "ariadne_ee_erzeugungsbedarf_wind_pv": {"low": 630, "high": 1480, "confidence": "medium"}
    },
    "treiber": {
      "elektrolyse": {
        "2037": {"low": 104, "high": 160, "confidence": "high"},
        "2045": {"low": 184, "high": 320, "confidence": "high"}
      },
      "rechenzentren": {
        "2037_ueberschreitung_korridor": 50,
        "2045_it_stromverbrauch_max": 88,
        "confidence": "medium"
      },
      "waermepumpen":  {"wert": null, "hinweis": "als Haupttreiber benannt, nicht quantifiziert - Luecke L6"},
      "e_mobilitaet":  {"wert": null, "hinweis": "als Haupttreiber benannt, nicht quantifiziert - Luecke L6"},
      "batteriezellproduktion": {"wert": null, "hinweis": "als Treiber benannt, nicht quantifiziert - Luecke L6"}
    },
    "revision_hinweis": "Monitoringbericht 15.09.2025 senkte die 2030er Annahme von ca. 750 auf 600-700 TWh (-10 bis -15 %); Gruende: langsamerer H2-Hochlauf, geringere Industrienachfrage"
  },

  "netzkosten": {
    "uebertragungsnetz_nep_2037_2045_v2025": {
      "gesamt_bis_2045": {"low": 365, "high": 392, "confidence": "medium"},
      "szenario_a_bis_2037": 283,
      "szenario_a_2037_bis_2045": 80,
      "szenario_b_aufschlag_bis_2037": 17,
      "szenario_b_aufschlag_2037_bis_2045": 24,
      "szenario_b_gesamt": 400,
      "jahresinvest_bis_2037": 19.8,
      "jahresinvest_ab_2037": 5.4
    },
    "gesamtnetz_imk_boeckler_2024": {
      "uebertragungsnetz_bis_2045": 328,
      "verteilnetz_bis_2045": 323,
      "gesamt_bis_2045": 651,
      "verteilnetz_jahresdurchschnitt": 14.4,
      "jahresvolumen_ist_2023": 15,
      "jahresvolumen_erforderlich": 34,
      "steigerung_prozent": 127,
      "confidence": "high"
    },
    "netzentgelte_2026": {
      "uebertragungsnetzentgelt_ohne_zuschuss_ct_kwh": 6.65,
      "uebertragungsnetzentgelt_mit_zuschuss_ct_kwh": 2.86,
      "reduktion_prozent": 57,
      "bundeszuschuss_mrd_eur": 6.5,
      "finanzierungsquelle": "Klima- und Transformationsfonds (KTF)",
      "netzentgelt_haushalt_ct_kwh": 9.3,
      "entlastung_haushalt_3500kwh_eur": 130,
      "confidence": "high",
      "hinweis": "Transferleistung, keine Kostensenkung - Netzkosten sinken nicht, sie werden verlagert"
    },
    "redispatch_engpassmanagement": {
      "2025_gesamt": {"low": 2.7, "high": 3.1, "confidence": "medium", "hinweis": "Widerspruch W6"},
      "2025_konventioneller_redispatch": 1.2,
      "2025_reservekraftwerke": 1.4,
      "2025_countertrading_mio_eur": 102,
      "2025_q2_ee_entschaedigung_mio_eur": 158,
      "2025_q3_gesamt_mio_eur": 667,
      "2025_q4_gesamt_mio_eur": 885,
      "2024_q2_ee_entschaedigung_mio_eur": 162,
      "2024_q3_gesamt_mio_eur": 608
    }
  },

  "kohleausstieg": {
    "rechtsgrundlage": "KVBG 2020",
    "enddatum_gesetzlich": 2038,
    "rheinisches_revier": 2030,
    "mitteldeutsches_revier_und_lausitz": 2038,
    "steinkohle": "kein eigener Stilllegungspfad; 7 Ausschreibungsrunden bis Zieljahr 2026, ab 2027 gesetzliches Reduzierungsverfahren",
    "ueberpruefungstermine": [2026, 2029, 2032],
    "moegliches_vorziehen_auf": 2035,
    "ist_leistung_gw_ende_2025": {"braunkohle": 14.758, "steinkohle": 15.387},
    "confidence": "high",
    "offene_punkte": ["Ergebnis Ueberpruefungstermin 2026 (L8)", "Gegenueberstellung Ist-Rueckbau vs. KVBG-Anlagenpfad (L9)"]
  },

  "kraftwerksstrategie": {
    "gesetz": "StromVKG - Gesetz zur Sicherung der Versorgungssicherheit Strom und zur Bereitstellung neuer Kapazitaeten",
    "frueherer_arbeitstitel": "Kraftwerkssicherheitsgesetz (KWSG)",
    "grundsatzeinigung_eu_kommission": "2026-01-15",
    "kabinettsbeschluss": "2026-05-13",
    "ausschreibung_1": {"datum": "2026-09-01", "volumen_gw": 4.5},
    "ausschreibung_2": {"datum": "2026-12-08", "volumen_gw": 4.5},
    "gesamtvolumen_zunaechst_gw": 11,
    "weitere_runden": [2027, 2029],
    "inbetriebnahme_spaetestens": 2031,
    "koalitionsvertrag_ziel_gw_bis_2030": 20,
    "technologiefokus": ["wasserstofffaehige Gaskraftwerke", "Speicher", "sonstige steuerbare Erzeugungsanlagen"],
    "kapazitaetsmechanismus": {
      "zielsetzung": "ausreichend gesicherte Leistung bis 2031",
      "ausgestaltung": null,
      "hinweis": "final nicht entschieden - Luecke L10"
    },
    "confidence": "high",
    "offener_widerspruch": "11 GW Ausschreibungsarchitektur vs. 20 GW Koalitionsvertragsziel"
  },

  "preise": {
    "boersenstrompreis_jahresmittel_eur_mwh": {
      "2023": {"wert": 95.5, "confidence": "medium"},
      "2024": {"low": 78.0, "high": 79.5, "confidence": "medium", "hinweis": "Widerspruch W7"},
      "2025": {"wert": 86.5, "confidence": "medium", "veraenderung_prozent": 10.9},
      "2026_h1": {"wert": 99.0, "confidence": "high", "hinweis": "nur Halbjahr, nicht hochrechenbar"},
      "2026_gesamt": {"wert": null, "hinweis": "Luecke L11 - Jahr laeuft"}
    },
    "negative_preisstunden": {
      "2024_h1": 224,
      "2025_gesamt": 575,
      "2025_h1": 389,
      "2026_h1": 299,
      "2026_h1_extremwert_eur_mwh": -499.99,
      "2026_h1_negative_viertelstunden": 1178
    },
    "endkunden_ct_kwh": {
      "haushalt_3500kwh": {"2025": 39.3, "2026": 37.0, "veraenderung": -2.3, "confidence": "high"},
      "haushalt_2026_komponenten": {
        "beschaffung_vertrieb": 15.2,
        "netzentgelte": 9.3,
        "steuern_abgaben_umlagen": 12.6
      },
      "industrie_neuabschluss_160mwh_bis_20gwh": {"2025": 17.6, "2026": 16.7, "veraenderung": -0.9, "confidence": "medium"},
      "quelle": "BDEW-Strompreisanalyse April 2026"
    },
    "eeg_foerderkosten_mrd_eur": {
      "finanzierungsquelle_bis_2024": "Klima- und Transformationsfonds (KTF)",
      "finanzierungsquelle_ab_2025": "Kernhaushalt",
      "eeg_umlage_status": "seit Juli 2022 auf null gesetzt",
      "2025": {
        "einnahmen": 3.904,
        "ausgaben": 19.564,
        "bundeszuschuss": 16.5,
        "kontosaldo_jahresende": 1.5,
        "confidence": "high"
      },
      "2026": {
        "haushaltsansatz": 17.2,
        "uenb_prognose_einnahmen": 3.109,
        "uenb_prognose_kosten": 17.792,
        "finanzierungsbedarf_ohne_kontoguthaben": 16.152,
        "finanzierungsbedarf_mit_kontoguthaben": 14.6,
        "confidence": "medium"
      }
    },
    "haushaltsfinanzierte_strompreisstuetzung_2026_mrd_eur": {
      "netzentgeltzuschuss": 6.5,
      "eeg_finanzierung": {"low": 14.6, "high": 17.2},
      "summe": {"low": 21.1, "high": 23.7},
      "derived": true,
      "confidence": "low"
    }
  },

  "offene_luecken": [
    {"id": "L1",  "thema": "Nettostromverbrauch 2024/2025 Absolutwert"},
    {"id": "L2",  "thema": "AGEB-Einzelwerte 2025: Wind offshore, Steinkohle, Wasserkraft, Mineraloel"},
    {"id": "L3",  "thema": "Bruttostromerzeugung 2024 Punktwert"},
    {"id": "L4",  "thema": "Installierte Wasserkraftleistung gesamt"},
    {"id": "L5",  "thema": "Installierte Biomasseleistung aktueller Stand"},
    {"id": "L6",  "thema": "Sektorale Nachfragetreiber in TWh je Stuetzjahr"},
    {"id": "L7",  "thema": "LFS3-Punktwerte Bruttostromverbrauch 2035 und 2045"},
    {"id": "L8",  "thema": "Ergebnis KVBG-Ueberpruefungstermin 2026"},
    {"id": "L9",  "thema": "Ist-Rueckbaupfad Kohle vs. KVBG-Anlagenpfad"},
    {"id": "L10", "thema": "Finale Ausgestaltung Kapazitaetsmechanismus"},
    {"id": "L11", "thema": "Jahresmittel Boersenstrompreis 2026"},
    {"id": "L12", "thema": "Import/Export-Saldo Gesamtjahr 2026"}
  ],

  "widersprueche": [
    {"id": "W1", "thema": "EE-Anteil 2025: 54 / 55.1 / 55.9 / 56 Prozent", "umgang": "Bandbreite 55-56 Prozent, Abgrenzung mitzitieren"},
    {"id": "W2", "thema": "Nettoimport 2025: 21.9 vs 19 TWh", "umgang": "Bandbreite 19-22 TWh"},
    {"id": "W3", "thema": "Bruttostromverbrauch 2025: 512 vs 526 TWh", "umgang": "Bandbreite ausweisen"},
    {"id": "W4", "thema": "Batteriespeicher 18.5 / 20.0 / 1.2 GW", "umgang": "18.5-20 GW; 1.2-GW-Wert nicht verwenden"},
    {"id": "W5", "thema": "PV-Zubau 2025: 16.4 (BNetzA) vs 17.5 GW (BSW)", "umgang": "BNetzA fuehren, BSW als Fussnote"},
    {"id": "W6", "thema": "Redispatch 2025: 2.7 vs 3.1 Mrd EUR", "umgang": "Bandbreite 2.7-3.1"},
    {"id": "W7", "thema": "Boersenstrompreis 2024: 78.0 vs 79.5 EUR/MWh", "umgang": "Bandbreite 78-79.5"},
    {"id": "W8", "thema": "AGEB 'Wind 110.1 TWh' onshore oder gesamt", "umgang": "als onshore interpretiert, verifizieren"},
    {"id": "W9", "thema": "Netzinvest UENB 328 (IMK) vs 365-392 Mrd EUR (NEP)", "umgang": "kein echter Widerspruch, beide nennen"}
  ]
}
```

---

*Ende des Arbeitspapiers. Kein Git-Commit vorgenommen.*
