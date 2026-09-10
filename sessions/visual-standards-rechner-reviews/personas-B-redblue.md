# Personas B (BI-Teamlead, CoE, Security, Tenant-Admin, Data Engineer) · Ø 3,6/5
P1 certonly muss K.O. sein (MS Learn: uncertified → error) · P1 Viewer-Unabhängigkeit · P2 Betriebsmodell · P4 Fabric-Apps-Text falsch: Preview Mai 2026 (Rayfin SDK Juni), eigene SQL-DB + GraphQL statt Semantikmodell, kein Vega/D3 belegt · P2 Schulung ohne Skaleneffekt (120 Ersteller: 84 % Schulung) · P3 REQ Datenübertragung eigene Zeile · P5 bigdata: Zeilen (Deneb) ≠ Zeichen (Core) differenzieren · P1/P5 Capacity fehlt · P2 Score-Treiber bei weight<100 nennen · P3 Standard-Warnungen deduplizieren
Fakten bestätigt: RS-Ausschluss paid, Org-Store nicht in RS, certonly nur Service (GPO), Copilot keine Custom Visuals, Sovereign/Embedded/P2W-Ausnahmen, F64-Free-Viewer.
# Red/Blue (Opus) · Baseline: Vergleich reduziert sich auf lic (S, 73 % paid) vs maint (F, 37–50 %)
A1 kein Staffel/Site-Lizenzmodell (Konzern 10 J. paid 3,9 Mio vs Domain-wide ~110 k€) → licModel peruser/staffel(d=1/.75/.55/.40 bei ≤100/≤500/≤2000/>2000)/site [12k·40k·96k]
A2 Default lic [30,100,300] Mittel 122 € > Enterprise-Preset → [40,80,150]
A3 growth nur auf paid → auf alle viewer-abhängigen Posten
A4 perDivisor ignoriert Wachstum → viewersAvg
A5 dep skaliert nicht mit H → Jahresrate 1−(1−d)^H; paid [1,2,4], oss [3,7,13], deneb [2,4,8], core [.4,1,2]
A6 Risiko als EW statt Bernoulli → in Simulation rnd()<p
A7/A8 Min-Max-Normierung verletzt IIA (dritte Option kippt Rangfolge) → Verhältnis c_i/min(alle inkl. K.O.)
A9 weight=100 wirft Schritt 2 weg → Default 70/30
A10 Sticky-Label lügt bei weight<100
A11 Ein-Klick-Kill-Switches (ibcscert M → nur paid) → Preis der Anforderung prominent
A12 Prio-Defaults pro-paid (Meinung) → kennzeichnen
A13 mscert & export identische Vektoren → export deneb 3
A14 ext-Label falsch (wirkt auf alle Stunden) → Label „aller extern beauftragten Stunden"; core überholt paid bei gleichem ext
A15 Deneb-Sponsoring als Pflichtkosten (18 % im Pilot) → Mode 0
A16 Wartung linear ohne Deckel (core H=10 = 300 % Aufbau) → degressiv δ [.75,.85,.95], rollout ×0,3 in Basis
A17 keine Lohnsteigerung vs licInfl → wageInfl [1.5,2.5,4]
A18 Kumuliert-Chart Gerade → Jahresvektor
A19 Schulung ganz in Jahr 0 → Churn-Anteil verteilen
A20 Kategorie-Mediane skaliert → Fußnote / Mittelwerte
A21 keine Korrelation → gemeinsamer Optimismus-Faktor k~PERT(.7,1,1.6) auf alle Stunden
A22 flache Geraden · A23 Break-even-Text per/abs widersprüchlich · A24 Scheingenauigkeit → 2 signifikante Stellen, Platz-Gruppen bei Bandüberlappung >50 %
B1 XSS über custom.id im Hash (bestätigt) → IDs neu vergeben, esc um Attribute, esc mit '
B2 DoS pert mode<min → Rekursion; sortieren+klemmen · B3 weight klemmen · B4 negative Mengen/Sätze klemmen, min=0 · B5 Infinity in Charts · B6 fehlende prio bei custom → 0 % Score · B7 esc ohne ' · B8 SheetJS 0.18.5 CVEs (Parsing), kein SRI, lokal hosten · B9 CSV-Fallback arm · B10 Google Fonts DSGVO (LG München) → selbst hosten · B11 prompt() · B12 Perf → expected() beim Ziehen, MC beim Loslassen · B13 Hash 2.179 Zeichen → Diff gegen Defaults · B14 Tastatur · B15 S.viewers-Mutation in drawBreakEven/buildXlsx · B16 tornado nicht im Hash · B17 Presets lassen Lizenz-Preset stehen
C1 Zebra-Preis als Einzelplatz hochgerechnet → Tarifstufen benennen, Datum, Hersteller um Freigabe bitten · C2 Interessenkonflikt nach oben · C3 Badge-Verteilung (V1 S3 F6 E9) oben zeigen · C4 Tornado nach oben mit Badges · C5 Diskontierung · C6 nicht wehrhafte Zahl → Gruppen · C7 Excel-Deckblatt „Lesen zuerst" · C8 E-Parameter herleiten · C9 K.O.-Texte mit Badge
