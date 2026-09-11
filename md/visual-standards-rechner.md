# Visual-Standards-Rechner: Easy, Flexibel oder MacGyver?

> Indikations-Rechner: Was kostet die Umsetzung visueller Standards in Power BI mit 3rd-Party-Visuals, Open Source, Deneb oder Core Visuals — über 3, 5 oder 10 Jahre, je Viewer und Jahr, mit K.O.-Kriterien, Bandbreiten statt Punktwerten und Excel-Export.

- **Quelle:** https://datenwgknowledgekitchen.com/visual-standards-rechner.html
- **Autor:innen:** Michael Tenner & Diana Ackermann · Daten-WG Knowledge Kitchen
- **Anlass:** Pre-Conference „Visual Standards in Power BI für Controlling und Finance | Von Easy über Flexibel bis MacGyver", Daten-WG 2026, 14.10.2026, Köln
- **Stand:** v0.11 · 09/2026 (drei Ebenen nach Shneiderman; Annahmen-Audit Runde 2 vom 11.09.2026, Pakete A und B: gepaarte Ziehung, Cash-out je Jahr, Amortisation, Stunden und FTE, P50/P75/P90, Ausstiegskosten, Viewer-Deckel; drei neue Anforderungen, Modifier „Organizational Store“, neue Defaults mit Quelle) · Sprache DE · rein clientseitig, keine Server-Anbindung
- **Zitierhinweis:** Michael Tenner & Diana Ackermann, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/visual-standards-rechner.html — Abruf mit Datum angeben.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung beschreibt Modell, Voreinstellungen und Quellenlage. Regler, Simulation, Charts und Export sind nur in der HTML-Fassung nutzbar.
- **Offenlegung:** ChartKitchen byDatenWG, das Beispiel fuer „Open Source / Eigenentwicklung", ist ein Projekt der Autor:innen.

---

## Was das Werkzeug rechnet

Der Rechner vergleicht vier Ansaetze, IBCS-nahe Standard-Charts (Abweichung, Wasserfall, Δ-Tabellen, KPI-Karten, Zeitreihen AC/PY/PL/FC) in Power BI umzusetzen:

| Ansatz | Etikett | Beispiele | Haupt-Kostentreiber |
|:---|:---|:---|:---|
| 3rd-Party paid | Easy | Zebra BI, Inforiver, graphomate | Lizenz je Nutzer, Staffel oder Site-Lizenz |
| Open Source / Eigenentwicklung | Flexibel · fertig | ChartKitchen byDatenWG, Charticulator-Fork | Freigabe, Governance, Wartung, Abkuendigungsrisiko |
| Deneb / Vega | Flexibel · Code | Vega-Lite-Templates, Business Chart Builder | Lernkurve, Template-Pflege, Wartung |
| Core Visuals + SVG | MacGyver | Overlapping Bars, DAX-UDF / SVG-Measures | Workaround-Wartung, Pruefnachweis, Capacity |

Er ist eine **Indikation unter Unsicherheit**, kein Angebot und kein Business Case. Jede Annahme ist eine Dreipunkt-Schaetzung (min · wahrscheinlich · max), aus der per PERT-Verteilung 1.500 Szenarien gezogen werden. Ausgegeben werden P10, P50 und P90.

## Aufbau in drei Ebenen (Overview first, zoom and filter, details on demand)

- **Ebene 1, Ueberblick:** drei Eingaben (Ersteller, Viewer, Betriebsmodell) oder ein Preset, dazu der Lizenz-Anker fuer Paid (Inforiver-Niveau 33 €, Mischpreis 80 €, Zebra-Niveau 170 € — abgeleitet, siehe Voreinstellungen) und der Schalter „Vorlagenbibliothek fuer Deneb und Core vorhanden“ (Default aus, weil der IBCS Chart Builder ein eigenes Projekt ist); der Satz nennt, wer bei allen drei Ankern mit und ohne Bibliothek vorn liegt; ein Chart mit den Kosten je Viewer und Jahr als P10–P90-Band je Ansatz; ein Satz mit Rangfolge, Faktoren und der Viewer-Zahl, ab der die Lizenz je Kopf dominiert; zwei Zeilen dazu, was belastbar ist und was nicht.
- **Ebene 2, Eingrenzen:** Mengengeruest komplett, Anforderungen, Red Flags, Ergebnis mit Rangfolge, K.O.-Block und Null-Option.
- **Ebene 3, Details:** Annahmen mit Badges, Charts und Kostentabelle, Einschaetzung je Ansatz, Monte-Carlo-Seite, Quellen; alles eingeklappt und einzeln zu oeffnen. Die Ebene steht im Share-Link.

## Klickpfad im Detail

1. **Mengengeruest:** Ersteller, Viewer (bis 10.000+), Standard-Reports (mit Erfahrungswert je Betriebsmodell), Charts je Report, Chart-Typen, Chart-Mix nach Komplexitaet (einfach / mittel / komplex, Standard 50 / 35 / 15), Horizont 3/5/10 Jahre, Betriebsmodell (Enterprise BI, Managed Self-Service, Self-Service, stufenlos hybrid), heutiger Ansatz und Bestands-Reports fuer die Migration.
2. **Anforderungen (MoSCoW):** 20 Kriterien mit Erfuellungsgrad 1 bis 5 je Ansatz, per Klick ueberschreibbar, eigene Zeilen moeglich (starten als „nicht geprueft"). Must mit Erfuellungsgrad 1 ist ein K.O. Seit v0.11 neu: **KI-gestuetzte Erstellung ueber PBIR / Agent-Skills** (cap 2/3/3/4, Could), **Barrierefreiheit** (Tastatur, Screenreader, Kontrast; cap 3/2/2/3, Could) und **Datenexport aus dem Visual** (Excel/CSV; cap 4/3/2/5, Should). Korrigiert: **grosse Datenmengen** von 4/3/2/2 auf 3/3/3/4 — das Datenfenster von 30.000 Zeilen ist das SDK-Limit *jedes* Custom Visuals, `fetchMoreData` hebt es auf 1.048.576 Zeilen und 100 MB an, die Core-Matrix virtualisiert mit einem 500er-Fenster; der behauptete Vorteil von Paid existiert technisch nicht.
3. **Red Flags:** Governance-Schalter (nur zertifizierte Visuals, nur Core Visuals, IBCS-Zertifikat Pflicht, kein Lizenzbudget, Report Server, Embedded/Publish-to-web, Sovereign Cloud, fehlende Desktop-Gruppenrichtlinie, kein externer Dienstleister). Sie wirken als K.O.-Filter vor dem Rechnen. Der Schalter „nur zertifizierte Visuals" ist seit v0.11 praeziser beschriftet: das Tenant-Setting „Add and use certified visuals only" gilt fuer **AppSource**-Visuals, nicht fuer Visuals aus dem **Organizational Store**. Dazu gibt es den Modifier **`orgstore`** („OSS-Visual wird ueber den Organizational Store bereitgestellt"): er hebt den K.O. fuer Open Source auf — wie schon `osscert` — und gilt ebenso fuer einen Deneb-Standalone-Build, **senkt aber die Freigabe-Stunden (`govIntake`) nicht**, weil das Security-Review im Haus bleibt. Im Report Server wirkt er nicht („Power BI Report Server doesn't support organizational visuals"); dort bleibt die Warnung stehen. So kippt die Empfehlung nicht still zugunsten von Open Source, sondern erst, wenn der Nutzer den Org-Store-Weg ausdruecklich bestaetigt.
4. **Annahmen:** globale und ansatzspezifische Dreipunkt-Werte mit Quellen-Badge (V verifiziert, S Such-Snippet, F Faustregel, P simuliertes Expertenpanel, E Autoren-Schaetzung, N eigene Aenderung). Fabric-Capacity mit SKU-Presets F2/F8/F64. Lizenzmodell pro Nutzer, Volumenstaffel oder Site-Lizenz.
5. **Ergebnis:** Null-Option „kein Standard“ als Vergleich ausserhalb der Rangfolge (Status quo mit Ad-hoc-Bau, Wartung, Leserzeit getrennt ausgewiesen, Rueckfragen; Break-even-Minuten Leserzeit), Rangfolge (Kostenverhaeltnis und Anforderungs-Score, Regler 70/30), ausgeschlossene Ansaetze unter dem Strich mit dem Preis der Rahmenbedingung, Konflikt-Boxen, Kostenstruktur, Break-even ueber die Viewer-Zahl mit Verhandlungsgrenze (Indifferenz-Lizenzpreis), Sensitivitaet, kumulierte Kosten, Barwert, Textbausteine zu Vorteilen, Nachteilen und versteckten Kosten, Excel-Export mit Deckblatt. Seit v0.11 zusaetzlich: **Cash-out je Jahr** getrennt nach hart (Auszahlung: Lizenz, Support, Capacity, Kurse, extern beauftragte Stunden) und weich (intern bewertete Zeit), als Tabelle und eigenes Excel-Blatt; **Amortisation gegen den Status quo** (erstes Jahr, in dem die kumulierte Summe unter der Null-Option liegt, mit und ohne Leserzeit), **interne Stunden und FTE** je Ansatz mit Kapazitaetswarnung (Konvention 1.500 h je FTE und Jahr), ein Umschalter fuer die **Entscheidungsgroesse P50 / P75 / P90** (Rangfolge nach P90 = konservativ) und die **Ausstiegskosten** als eigene Kennzahl ausserhalb der Summe und ausserhalb der Rangfolge (Bestand plus Rollout × Wiederverwendungs-Stunden × Komplexitaet × Nachbau-Faktor).
6. **Monte-Carlo-Seite:** Schwankungsbreite ±5/10/15/20/25 % um die eigenen Eingaben, wahlweise fuer Mengengeruest und Annahmen oder nur fuer das Mengengeruest, 1.000 bis 10.000 Ziehungen. Erzeugt lokal im Browser eine eigene Auswertungsseite (neuer Tab oder HTML-Datei): Verteilung der Kosten je Viewer, Anteil je Platz 1 bis 4, hart gegen weich, Erstellung gegen Nutzung mal direkt gegen indirekt (2x2 je Ansatz), Rangkorrelationen (Spearman) fuer Mengengeruest und Annahmen, gepaarte Differenz Paid gegen Open Source und eine Skalen-Simulation bei festem Verhaeltnis Ersteller : Viewer (x0,5 bis x10) mit Kipp-Punkt.

## Kostenkern (je Ansatz, Horizont H)

```
Lizenz      = Summe je Jahr: Nutzer × Preis × Staffelfaktor des Jahres  (Viewer wachsen ab Jahr 2, Autoren konstant, Preis steigt jaehrlich)
              oder Site-Lizenz × Jahre; plus Lizenz-Administration (degressiv, bei Site 0), Support/Sponsoring, Capacity-Aufschlag
Aufbau      = (Setup + Eigenentwicklung + Chart-Typen × Stunden erstmalig × Komplexitaetsfaktor) × Stundensatz-Mix
Migration   = Bestands-Reports × Charts/Report × Wiederverwendungs-Stunden × Nachbau-Faktor (nur bei Wechsel)
Rollout     = (Reports + Nachfrage je 1.000 Viewer + Nachfrage je Ersteller) × Charts/Report × Wiederverwendungs-Stunden × Komplexitaetsfaktor × Lernkurven-Faktor × Betriebsmodell-Faktor
Komplexitaet= (Mix einfach × f_einfach + Mix mittel × 1 + Mix komplex × f_komplex) / (0,5 × f_einfach + 0,35 + 0,15 × f_komplex)  je Ansatz; bei 50/35/15 gleich 1
Lernkurve   = mittlerer Faktor ueber n Charts je Ersteller nach Wright (Stunden fallen um Lernrate je Verdopplung), Panelwert = 10. Chart, Untergrenze 0,5
Null-Option = Reports × Charts × Stunden ad hoc + Wartung ad hoc + Leserzeit (Viewer × Minuten/Woche) + Rueckfragen; Vergleich ausserhalb der Rangfolge
Schulung    = Vorlagen-Bauer × tiefe Schulung + Vorlagen-Nutzer × flache Schulung + Fluktuation × [Bauer × (tiefe Schulung + Einarbeitung) + Nutzer × (flache Schulung + 1/4 Einarbeitung)]
Wartung     = (Setup + Entwicklung + Chart-Aufbau + 0,3 × Rollout) × Quote (geplante Anpassungen) × Abklingfaktor-Summe × Varianten-Effekt + Breaking-Updates × Fix-Stunden
Varianten-Effekt = 1 + (Betriebsmodell-Faktor − 1) × Varianten-Anfaelligkeit je Ansatz (eigene Annahme, seit v0.10 nicht mehr aus dem Design-Score)
Vorlagenbibliothek = Schalter; Stunden je Chart × Faktor je Ansatz, Schulung halb so stark
Governance  = Freigabe je Visual-Paket (+20 % je weiterem Chart-Typ) + laufende Governance + Pruefnachweis (log-linear nach Organisationsgroesse, 50 bis 5.000 Viewer) + Zugriffs-Governance je 1.000 Viewer (ansatzunabhaengig) + Anwender-Support je 100 Viewer
Risiko      = P(Abkuendigung ueber H) × (Aufbau + 0,6 × Rollout) × Migrationsanteil  (Jahresrate akkumuliert; in der Simulation als Ereignis)
Barwert     = Zahlungsstrom je Jahr, abgezinst mit dem Kalkulationszins
```

Interne Stunden werden mit einem Bewertungsfaktor (60 = Kapazitaet frei, 100 = Vollkosten, 150 = verdraengt Fachaufgaben; Bewertungskonvention, in der Simulation konstant) und einer Lohnsteigerung bewertet. Jede Annahme wird je Szenario genau einmal gezogen, globale Annahmen sind zwischen den Ansaetzen identisch (gepaarte Vergleiche).

## Voreinstellungen (Auswahl, min · wahrscheinlich · max)

| Annahme | Wert | Quellenlage |
|:---|:---|:---|
| Stundensatz intern (Vollkosten) | 60 · 82 · 110 €/h | S: Robert Half 2026 (Befragung 06–07/2025, rund 1.500 Befragte): Controller 55.000–89.250 €, Median ≈ 76.500 €. Die alte Begruendung („wer Standards baut, liegt ueber dem Controller") ist widerlegt: StepStone nennt fuer BI-Entwickler Ø 52.800 € |
| Stundensatz extern | 90 · 118 · 210 €/h | S: erstmals ein Power-BI-spezifischer Wert (freelancermap Ø 98 €/h); Freelancer-Kompass 2026 Ø 103 €/h, IT-Branche 95 €/h — erstmals seit Erhebungsbeginn kein Anstieg, 62 % planen keine Erhoehung |
| Lizenz je Nutzer und Jahr (Paid, Einstiegspreis vor Staffel) | 40 · 80 · 150 € | S: Inforiver Analytics+ 2,40–3 $/Monat; Herstellerseiten in der Pruefumgebung nicht abrufbar. **Waehrung:** Listenpreise stehen in USD, gerechnet wird mit 1 $ = 1 €. Das ist kein konservativer, sondern ein einseitiger Fehler — Kursband ueber den Horizont rund 0,78–1,00 €/$, Paid liegt damit bis zu rund 14 % zu hoch. In Euro kontrahieren oder Kursklausel verhandeln |
| Lizenz-Anker Zebra-Niveau (Ebene 1) | 90 · 170 · 300 € (abgeleitet) | S: fuer das Power-BI-Produkt von Zebra ist 09/2026 in fuenf Suchvarianten **kein** Preispunkt mehr auffindbar; „Personal 299 $ / Team 799 $" gehoert zur abgeloesten Paketstruktur (2024). Der Anker ist aus dem Nachbarprodukt Zebra BI for Office abgeleitet (in EUR ausgewiesen: Starter ≈ 70 €, Advanced ≈ 113 € je Nutzer und Jahr) und als Ableitung gekennzeichnet |
| Lizenzpreis-Steigerung (Paid) | 1 · 5 · 15 % p.a. | S: „keine oeffentliche Preiserhoehung auffindbar" ist kein Beleg fuer 0 % — Erhoehungen kommen als **Modellwechsel**. Belegt: Inforiver Developer-Lizenz 11/2023 von 150 auf 245 $/Monat, 02/2024 fuer Neukunden abgeschafft, Bestandskunden ein Jahr zu 2.500 $/Dev, dann Named User; Zebra Paketstruktur 2025 umgestellt; Power BI Pro +40 % zum 01.04.2025. Der Vertice-Index (11,4 bis 16,4 %) misst breite Enterprise-Portfolios inklusive KI-Bundling, nicht Nischen-Visuals — deshalb Modus 5 statt 11 |
| Site-Lizenz je Jahr (Paid) | 12.000 · 40.000 · 96.000 € | S: Inforiver Domain-wide ab 12 k$ verhandelt (2026); das Maximum geht auf 96 k$ zurueck, weil „unlimited users for the entire company" wieder belegt und ab rund 4.000 Nutzern beworben ist |
| Volumenstaffel | −20 % ab 25, −40 % ab 100, −55 % ab 500, −70 % ab 2.000, −80 % ab 5.000 Nutzern, je Jahr | F: Zebra Team-Paket ≈ −46 % ab 5 Nutzern, Inforiver Domain-wide ≈ −80 % ab 2.000 |
| Stunden je Chart-Typ erstmalig (paid / oss / deneb / core) | 2–4–7.5 / 4.5–8.5–14 / 7–12–18 / 10–16–27 h | P: simuliertes Expertenpanel (20 Profile), Median |
| Stunden je Chart bei Wiederverwendung | 0.5–1–2 / 1–2–3.5 / 1–2.5–4.5 / 2–4–6.5 h | P; wichtigster ungemessener Hebel (Faktor 2 Paid zu OSS, Blindschaetzung bestaetigt, Audit haelt 1,4 fuer vertretbar) |
| Schulung Vorlagen-Bauer (paid / oss / deneb / core) | 5–8.5–15 / 8–15–26 / 20–35–58 / 18–28–43 h | P: simuliertes Expertenpanel (20 Profile), Median |
| Einarbeitung bei Fluktuation | 8–16–40 / 12–28–70 / 24–70–180 / 16–50–130 h | E: Autoren-Schaetzung; wirkt voll nur auf Vorlagen-Bauer |
| Wartungsquote p.a. in % (geplante Anpassungen) | 6–10–18 / 12–22–32 / 10–17–27 / 12–30–48 | P, im Audit um den Anteil bereinigt, der in Breaking-Updates steckt |
| Breaking-Updates p.a. / Fix-Stunden | 0.2–1–2 / 0.5–1.5–3 / 1–2–3 / 2–3–5 · 3 / 7 / 6.5 / 9.5 h | P; Deneb 3 Vorfaelle in 24 Monaten, Core 3–4 SVG-Regressionen 2025 belegt |
| Abkuendigungsrisiko p.a. (paid / oss / deneb / core) | 1–2–4 / 3–7–13 / 1–3–6 / **0,5–1,5–3** % | F: Charticulator 12/2023, Bing Maps Visual 10/2025, OKViz Synoptic v1 03/2026; Deneb gesenkt, weil Vega-Lite-Specs das Wirtsvisual ueberleben. Core angehoben: „Microsoft kuendigt nichts ab" ist ueber zehn Jahre die falsche Nullhypothese (Q&A-Erlebnisse enden 02/2027, Bing-Maps-Visual „scheduled for deprecation", R/Python in Embed und Publish-to-web seit 05/2026 leer, Legacy Card → New Card, Legacy-Matrix → pivotTable) |
| Anwender-Support je 100 Viewer und Jahr | 2–4–6 / 2.5–5.5–10 / 3–6–10 / 5–9.5–16 h | P: simuliertes Expertenpanel (20 Profile), Median; OSS im Audit gesenkt |
| Varianten-Anfaelligkeit (0 Vorlagen erzwingen Einheitlichkeit, 1 jeder baut anders) | 0,25 / 0,5 / 0,75 / 0,85 | E: bis v0.9 still aus dem Design-Score abgeleitet, seit v0.10 eigene Annahme |
| Wirkung einer Vorlagenbibliothek (× Stunden je Chart, nur bei Schalter) | 1 / 1 / 0,6 / 0,7 | E: IBCS Chart Builder, vegaviz, DenebIBCS, PowerofBI-UDFs; keine Messung |
| Komplexitaetsfaktor einfach / komplex (× Stunden je Chart) | 0,7 / 1,4 (paid) · 0,7 / 1,6 (oss) · 0,5 / 2,5 (deneb) · 0,4 / 4 (core) | E: Autoren-Schaetzung, keine Quelle; Core + SVG beim Wasserfall am teuersten |
| Lernrate je Verdopplung | 0–5–10 / 5–10–15 / 8–15–25 / 8–15–25 % | F: Wright-Lernkurve, 80–90 % bei manueller Arbeit; keine Messung fuer Power BI |
| Null-Option: Stunden je Chart ad hoc, Wartung, Leserzeit, Rueckfragen | 1–2–4 h · 20–30–45 % · 0,5–2–6 min je Viewer und Woche · 6–12–20 h je 100 Viewer | E: Autoren-Schaetzung; Leserzeit ohne unabhaengige Quelle, deshalb getrennt ausgewiesen |
| Freigabe je Visual-Paket (einmalig) | 4–8–16 / 8–24–60 / 1–4–10 / 0–2–6 h | E; +20 % je weiterem Chart-Typ; zertifiziertes OSS rechnet mit dem Paid-Wert |
| Laufende Governance p.a. | 6–16–42 / 12–30–80 / **8–18–44** / 1–3–10 h | E, log-linear nach Organisationsgroesse (×0,3 bei 50 Viewern bis ×1,3 ab 5.000). Deneb leicht angehoben: 2.0.0 als Release am 08.09.2026 („as published to AppSource"), davor 1.9.1 (31.03.) und 1.9.0 (15.03.2026) — zwei Releases in 2026, davon ein Major mit neuem Template-Format, das die Rezertifizierung durchlaeuft |
| Fluktuation, Lohnsteigerung, Kalkulationszins | 5–11–22 % · **1–3–4,5** % · 5–8–10 % | S (Finance ~10 %, IT 20–22 %) · V (WSI-Tarifarchiv: nominal 2025 +2,6 %, 2026 +3,1 %; Minimum auf 1 %, weil die Freelancer-Saetze 2026 erstmals nicht gestiegen sind) · S (KPMG Kapitalkostenstudie 2025, WACC Ø 8,5 %) |
| Betriebsmodell-Faktoren (Enterprise → Self-Service) | Owner-Anteil 10 → 100 %, Varianten ×1 → ×3, Support ×0,8 → ×1,3, Governance ×1 → ×1,6 | E |
| Reports je Ersteller (Erfahrungswert) | Enterprise ≈ 6, Managed ≈ 4, Self-Service ≈ 2, plus 2 je 1.000 Viewer | E |

Quellenlage aller 46 Annahmen (18 global, 28 je Ansatz): **2 verifiziert (V), 9 Such-Snippet (S), 3 Faustregel (F), 9 simuliertes Expertenpanel (P), 23 Autoren-Schaetzung (E)**. Die Quellenliste im Anhang zaehlt 39 Eintraege, davon 22 verifiziert (V) und 17 Sekundaer- beziehungsweise Such-Snippet (S). Deshalb Bandbreiten statt Punktwerte, und deshalb steht die Herkunft an jedem Wert.

**Zwei Annahmen stehen bis heute nur im Code und in keiner Annahmen-Tabelle,** obwohl sie spuerbar wirken: die Normierungs-Mischung des Chart-Mix (`cx0` = 50 / 35 / 15 — die Mischung, fuer die die Panel-Stunden je Chart gelten) und der Lernkurven-Anker („der Panelwert ist der 10. Chart je Ersteller"). Sensitivitaet: Anker 10 → 20 hebt die Stunden der Code-Ansaetze um rund 18 %; eine Panel-Mischung 40 / 35 / 25 statt 50 / 35 / 15 senkt den Komplexitaetsfaktor von Core auf 0,76. Beide sind seit v0.11 im Ehrlichkeits-Hinweis der HTML-Fassung benannt.

## Rahmenbedingungen, die das Ergebnis kippen

- **IBCS-Zertifikat Pflicht + kein Lizenzbudget:** unloesbar, keines der betrachteten kostenlosen Visuals ist IBCS-zertifiziert (Zebra BI, Inforiver, graphomate, hi-chart sind es).
- **Nur zertifizierte Visuals im Tenant:** nicht zertifizierte Open-Source-Visuals aus AppSource laden im Service nicht (Microsoft Learn); ChartKitchen ist aktuell nicht zertifiziert. Das Tenant-Setting gilt aber **nicht fuer den Organizational Store**: was die Admins dort freigeben, laedt auch unzertifiziert. Der Modifier `orgstore` hebt den K.O. deshalb auf — ohne die Freigabe-Stunden zu senken und ohne im Report Server zu wirken.
- **Copilot als Must:** Copilot erstellt und bearbeitet Reports nur mit Core Visuals. KI-Readiness entsteht im Datenmodell, nicht im Visual.
- **Report Server, Sovereign Cloud, Publish-to-web, Embedded (app owns data):** ueber AppSource lizenzierte Visuals werden dort nicht durchgesetzt oder nicht unterstuetzt.
- **Ueber 2.000 Nutzer mit Listenpreis:** Hersteller verhandeln Staffeln oder Site-Lizenzen; Lizenzmodell umstellen.

## Grenzen

- Nicht enthalten: Power-BI-Grundlizenzen (fuer alle gleich), Nutzen-Seite (nur als Score und „€ je Anforderungspunkt"), Aktivierung/Abschreibung (§ 248 HGB, IAS 38), Steuern (§ 50a EStG), Datenmodell und Datenaufbereitung.
- Stunden je Chart, Setup, Schulung, Wartung, Breaking-Updates und Support stammen aus einem simulierten Expertenpanel (20 Rollenprofile, per Sprachmodell unabhaengig geschaetzt, Median je Wert; Rohdaten unter sessions/visual-standards-rechner-reviews/). Das ist strukturierte Meinung, keine Messung, und die wichtigste Stellschraube.
- Preise stammen ueberwiegend aus Such-Auszuegen der Herstellerseiten (Stand 09/2026) und sind vor einer Entscheidung beim Hersteller zu pruefen.
- **Paginated Reports (RDL) sind nicht enthalten.** Power-BI-Custom-Visuals existieren dort nicht — weder gekaufte noch Deneb noch ein Core-Visual aus dem Bericht. Wer ein Berichtsheft druckt oder pixelgenau verschickt, baut es in RDL ein zweites Mal, und zwar bei allen vier Ansaetzen gleichermassen; der Rechner bildet diesen zweiten Bau in keinem Ansatz ab.
- Die **Null-Option** ist der am schwaechsten belegte Teil. Eine unabhaengige Blindschaetzung (09/2026, ohne Kenntnis der gesetzten Werte) kam auf 15 · 30 · 50 % Wartungsquote (hier 20 · 30 · 45), 3 · 8 · 15 Minuten Leserzeit je Viewer und Woche (hier 0,5 · 2 · 6) und 40 · 120 · 300 Stunden Rueckfragen je 100 Viewer und Jahr (hier 6 · 12 · 20). Alle drei hoeheren Werte wuerden die These „ein Standard lohnt sich" stuetzen — genau deshalb stehen sie als Spannweite hier und nicht in den Voreinstellungen.
- Plaetze mit ueberlappenden P10–P90-Baendern sind statistisch nicht unterscheidbar und werden zusammengefasst. Bei kleinen Mengen ist Paid gegen Open Source mit der vorliegenden Evidenz nicht entscheidbar; wer die Rangfolge braucht, muss messen (fuenf Charts mit beiden Werkzeugen bauen), nicht rechnen.

## v0.8: Chart-Mix, Lernkurve, Null-Option

Drei Punkte aus der Grundannahmen-Kritik (`sessions/visual-standards-rechner-audit/grundannahmen-kritik.md`) sind umgesetzt. **Chart-Mix:** drei Komplexitaetsklassen mit Anteilen; je Ansatz zwei Faktoren (einfach, komplex) gegenueber der mittleren Klasse, normiert auf die Standard-Mischung, fuer die die Panel-Stunden gelten. Core + SVG verteuert sich bei Wasserfall und Szenario-Notation um Faktor 4, Paid um 1,4. **Lernkurve:** Stunden je Chart bei Wiederverwendung fallen nach Wright mit der Zahl der Charts je Ersteller; kleine Teams zahlen mehr als den Panelwert, grosse weniger (Grosskonzern Core 0,80, Pilot 1,03). **Null-Option:** Status quo ohne Standard mit Ad-hoc-Bau, Wartung, Rueckfragen und Leserzeit; die Leserzeit ist der am wenigsten belegte Wert und wird getrennt gezeigt, dazu die Minuten je Viewer und Woche, ab denen sich der guenstigste zulaessige Ansatz rechnet. Nicht umgesetzt: Koexistenz, Restwert, Korrelationen, Risikoaversion.

## v0.11: Zeitdynamik, Cash-out und neue Anforderungen (Annahmen-Audit Runde 2)

**Zeitdynamik ueber 3, 5 und 10 Jahre.** Der Rollout entsteht nicht an einem Tag: der Zuwachs (Nachfrage je 1.000 Viewer und je Ersteller) faellt je Jahr an und traegt deshalb die **Lohnsteigerung** des jeweiligen Jahres, statt komplett in Jahr 0 gebucht zu werden. Das Viewer-Wachstum bekommt einen **Deckel** (`S.viewerCap`, Eingabefeld in Schritt 1, Voreinstellung Belegschaft beziehungsweise ersatzweise das Dreifache der heutigen Viewer): ohne ihn waechst ein Grosskonzern bei 30 % Wachstum und zehn Jahren Horizont von 10.000 auf 106.000 Leser, was das obere Band ungleich verzerrt — die Lizenz je Kopf skaliert linear, Governance nur log-linear. **Nicht umgesetzt ist ein Restwert am Horizontende:** durchgerechnet entlastet er Paid am staerksten (Mittelstand −4,8 % gegen Open Source −2,8 %) und liegt im Konzern bei 0,1–0,6 %; wirksam ist statt dessen das Gegenstueck, die Wechselverpflichtung nach dem Horizont, und die steht als **Ausstiegskosten** ausserhalb der Summe.

**Neue Ausgaben.** (1) **Cash-out je Jahr**, getrennt nach hart (Auszahlung: Lizenz, Support, Capacity, Kurskosten, extern beauftragte Stunden) und weich (intern bewertete Zeit) — als Tabelle und als eigenes Excel-Blatt; Jahr 0 ist das Aufbaujahr. (2) **Amortisation gegen den Status quo**: das erste Jahr, in dem die kumulierte Summe eines Ansatzes unter der kumulierten Null-Option liegt, mit und ohne Leserzeit — ohne Leserzeit ist die zweite Zahl die belastbare. (3) **Interne Stunden und FTE** je Ansatz mit **Kapazitaetswarnung**, Konvention 1.500 Stunden je FTE und Jahr, offen benannt. (4) Umschalter fuer die **Entscheidungsgroesse P50 / P75 / P90** („mittlerer Fall / vorsichtig / Worst-Case-nah"); die Rangfolge nach P90 ist die konservative Lesart, der Barwert bleibt Nebenzeile. (5) **Ausstiegskosten** als eigene Kennzahl ausserhalb der Summe und ausserhalb der Rangfolge: Bestand plus Rollout, mal Charts je Report, mal Wiederverwendungs-Stunden, mal Komplexitaetsfaktor, mal Nachbau-Faktor — ohne neue Annahme, genaehert mit den Werten des verlassenen Ansatzes.

**Gepaarte Ziehung als Schalter, Default gepaart.** Je Parameter-ID gibt es einen eigenen Zufallsstrom, den alle vier Ansaetze in einem Szenario teilen; die Differenz zweier Ansaetze wird damit nicht mehr von gemeinsamen Annahmen verrauscht. Das ist ehrlicher und unbequem: der Anteil der Szenarien, in denen Open Source guenstiger ist als Paid, faellt im Mittelstand von rund 12 % auf rund 5 %. **Einschraenkung, die man kennen muss:** die Paarung ist unvollstaendig. Sie wirkt ueber die Parameter-ID, also nur dort, wo beide Ansaetze denselben Parameter haben; ansatzspezifische Parameter ohne Gegenstueck (etwa `lic` oder `licSite`, die es nur bei Paid gibt) ziehen weiterhin aus einem eigenen Strom. Die Differenz ist damit gepaart bereinigt um die geteilten Annahmen, nicht um alle.

**Weitere Aenderungen im Rechenkern:** die Null-Option rechnet mit den **Core-Komplexitaetsfaktoren** des Chart-Mix (sie ist per Definition Core Visuals ad hoc) statt mit einem festen Wert je Chart; die Untergrenze von 50 % gilt jetzt auf dem **Produkt** Vorlagenbibliothek × Lernkurve, nicht mehr nur auf der Lernkurve — vorher fiel die Deneb-Wiederverwendung mit Bibliothek und Maximalwerten auf 0,71 h und damit unter Paid (0,94 h), ein Artefakt zugunsten des eigenen Template-Projekts der Autor:innen.

**Neue Defaults mit Quelle** (Begruendung je Wert in der Tabelle oben): Stundensatz intern 60 · 82 · 110 €/h, Stundensatz extern 90 · 118 · 210 €/h, Lohnsteigerung 1 · 3 · 4,5 %, Lizenzpreis-Steigerung 1 · 5 · 15 %, Lizenz-Anker Zebra-Niveau 90 · 170 · 300 € (abgeleitet), Site-Lizenz 12.000 · 40.000 · 96.000 €, Abkuendigungsrisiko Core 0,5 · 1,5 · 3 %, laufende Governance Deneb 8 · 18 · 44 h.

**Texte richtiggestellt:** die viel zitierten „46 % schneller" stammen nicht von Zebra BI, sondern aus „More than just a standard" (blueforte gemeinsam mit der TU Muenchen, 2019: 90 Studierende, randomisierte Reihenfolge, 140,9 s statt 261,7 s je Aufgabe, rund 61 % weniger Fehler, Eye-Tracking bei sechs Personen) — Auftraggeber ist ein IBCS-Beratungspartner, also interessennah, aber kein Visual-Hersteller, und das Laborsetting liefert eine Obergrenze je Aufgabe, keine Minuten je Woche. Dazu: Waehrungshinweis statt „1 $ ≈ 1 € konservativ", Preiserhoehungen als Modellwechsel, der kostenlose Desktop-Pfad bei `nobudget` (graphomate charts fuer Power BI kostenlos und voll funktionsfaehig, im Service mit Wasserzeichen; Inforiver Premium Matrix auf dem Desktop kostenlos, lizenzpflichtig beim Veroeffentlichen — fuer Pilot und Evaluierung relevant, fuer einen Viewer-Standard nicht), und `cx0` und der Lernkurven-Anker sind benannt.

## Annahmen-Audit 09/2026

Am 10./11.09.2026 wurden alle Annahmen und die Modellstruktur in sechs unabhaengigen Pruefungen (drei Opus-Audits, Sonnet-Strukturpruefung, Sonnet-Web-Verifikation, Sonnet-Blindschaetzung ohne Kenntnis der bestehenden Werte) geprueft. Ergebnis v0.7: sieben Struktur-Fixes im Rechenkern (Fluktuationsschulung rollendifferenziert, Freigabe je Visual-Paket statt je Chart-Typ, Abkuendigungsrisiko inklusive 60 % des Rollouts, Lizenz-Administration degressiv und bei Site-Lizenz null, Staffel je Jahr, Governance log-linear, Bewertung interner Stunden als Konstante), 24 neu gesetzte Defaults, neue Annahme „neue Reports je Ersteller“, Presets mit Report-Zahlen nach der eigenen Heuristik. Der Parametersatz war in der Summe OSS-feindlich (elf von neunzehn vergleichbaren Werten um Faktor 1,75 bis 3 gegen Open Source, teils doppelt fuer dieselbe Ursache), zugleich fehlte OSS das Rollout-Risiko. Beides ist korrigiert. Vollstaendiger Bericht mit Vorher/Nachher je Preset, allen sechs Pruefberichten und offenen Punkten: `sessions/visual-standards-rechner-audit/README.md` im Repository.
- Der Share-Link enthaelt die Eingaben unverschluesselt im URL-Fragment. Berechnung lokal im Browser; Google Fonts und (falls die lokale Kopie fehlt) die Excel-Bibliothek werden nachgeladen.

## Quellen (Auswahl)

- Microsoft Learn: Manage Power BI visuals admin settings — https://learn.microsoft.com/fabric/admin/organizational-visuals
- Microsoft Learn: Certified Power BI visuals — https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified
- Microsoft Learn: AppSource visual license models — https://learn.microsoft.com/power-bi/developer/visuals/custom-visual-licenses
- Microsoft Learn: Copilot in Power BI — https://learn.microsoft.com/power-bi/create-reports/copilot-create-reports
- Microsoft Learn: Fabric Apps overview — https://learn.microsoft.com/fabric/apps/overview
- Microsoft Blog: Power BI pricing update 04/2025 — https://powerbi.microsoft.com/en-us/blog/important-update-to-microsoft-power-bi-pricing/
- Deneb: GitHub Sponsors und Releases — https://github.com/sponsors/deneb-viz
- Zebra BI Pricing — https://zebrabi.com/pricing/ · Inforiver Pricing — https://inforiver.com/pricing/ · graphomate Lizenzen — https://www.graphomate.com/en/licences/
- IBCS Certified Software — https://www.ibcs.com/software/
- freelancermap Freelancer-Kompass 2025 — https://www.freelancermap.de/media/press_release/PM-Freelancer-Kompass-2025.pdf
- powerofbi.org: DaxLib PowerofBI.IBCS — https://www.powerofbi.org/powerofbi-ibcs-user-defined-functions/
- Data Goblins: MacGuyver-Toolbox — https://github.com/data-goblin/powerbi-macguyver-toolbox
- Daten-WG: Standard, Custom oder Deneb? — https://www.daten-wg.com/post/power-bi-visuals-richtig-ausw%C3%A4hlen
- Forrester TEI-Methodik — https://www.forrester.com/policies/tei · McConnell: Cone of Uncertainty
- Microsoft Learn: Admin-Portal, Power-BI-Visuals-Einstellungen — https://learn.microsoft.com/power-bi/admin/service-admin-portal-power-bi-visuals
- Microsoft Learn: Fetch more data from Power BI — https://learn.microsoft.com/power-bi/developer/visuals/fetch-more-data
- Microsoft Learn: Datenpunkt-Grenzen je Visual-Typ — https://learn.microsoft.com/power-bi/visuals/power-bi-data-points
- Microsoft Learn: Export data from a visual (JavaScript-API) — https://learn.microsoft.com/javascript/api/overview/powerbi/export-data
- Microsoft Learn: Power BI Desktop project report folder (PBIR) — https://learn.microsoft.com/power-bi/developer/projects/projects-report
- Microsoft Learn: supportsKeyboardFocus — https://learn.microsoft.com/power-bi/developer/visuals/supportskeyboardfocus-feature
- Microsoft Learn: High-contrast mode support in Power BI visuals — https://learn.microsoft.com/power-bi/developer/visuals/high-contrast-support
- Microsoft Learn: Design Power BI reports for accessibility — https://learn.microsoft.com/power-bi/create-reports/desktop-accessibility-creating-reports
- blueforte / TU Muenchen: „More than just a standard" (2019) — https://www.blueforte.com/
- Robert Half: Gehaltsuebersicht 2026 — https://www.roberthalf.com/de/de
- Power BI Preise (EUR-Liste, Stand 07/2026) — https://powerbi.microsoft.com/de-de/pricing/
- BFSG und BITV 2.0 — https://www.gesetze-im-internet.de/bfsg/
- Daten-WG: Zehn Tage bis zum marktfaehigen Stand — https://datenwgknowledgekitchen.com/whitepaper-ki-entwicklung-roi.html
