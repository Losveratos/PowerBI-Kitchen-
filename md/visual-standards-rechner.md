# Visual-Standards-Rechner: Easy, Flexibel oder MacGyver?

> Indikations-Rechner: Was kostet die Umsetzung visueller Standards in Power BI mit 3rd-Party-Visuals, Open Source, Deneb oder Core Visuals — über 3, 5 oder 10 Jahre, je Viewer und Jahr, mit K.O.-Kriterien, Bandbreiten statt Punktwerten und Excel-Export.

- **Quelle:** https://datenwgknowledgekitchen.com/visual-standards-rechner.html
- **Autor:innen:** Michael Tenner & Diana Ackermann · Daten-WG Knowledge Kitchen
- **Anlass:** Pre-Conference „Visual Standards in Power BI für Controlling und Finance | Von Easy über Flexibel bis MacGyver", Daten-WG 2026, 14.10.2026, Köln
- **Stand:** v0.8 · 09/2026 (Annahmen-Audit 11.09.2026; Chart-Mix, Lernkurve und Null-Option, siehe unten) · Sprache DE · rein clientseitig, keine Server-Anbindung
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

## Klickpfad in sechs Schritten

1. **Mengengeruest:** Ersteller, Viewer (bis 10.000+), Standard-Reports (mit Erfahrungswert je Betriebsmodell), Charts je Report, Chart-Typen, Chart-Mix nach Komplexitaet (einfach / mittel / komplex, Standard 50 / 35 / 15), Horizont 3/5/10 Jahre, Betriebsmodell (Enterprise BI, Managed Self-Service, Self-Service, stufenlos hybrid), heutiger Ansatz und Bestands-Reports fuer die Migration.
2. **Anforderungen (MoSCoW):** 18 Kriterien mit Erfuellungsgrad 1 bis 5 je Ansatz, per Klick ueberschreibbar, eigene Zeilen moeglich (starten als „nicht geprueft"). Must mit Erfuellungsgrad 1 ist ein K.O.
3. **Red Flags:** Governance-Schalter (nur zertifizierte Visuals, nur Core Visuals, IBCS-Zertifikat Pflicht, kein Lizenzbudget, Report Server, Embedded/Publish-to-web, Sovereign Cloud, fehlende Desktop-Gruppenrichtlinie, kein externer Dienstleister). Sie wirken als K.O.-Filter vor dem Rechnen.
4. **Annahmen:** globale und ansatzspezifische Dreipunkt-Werte mit Quellen-Badge (V verifiziert, S Such-Snippet, F Faustregel, P simuliertes Expertenpanel, E Autoren-Schaetzung, N eigene Aenderung). Fabric-Capacity mit SKU-Presets F2/F8/F64. Lizenzmodell pro Nutzer, Volumenstaffel oder Site-Lizenz.
5. **Ergebnis:** Null-Option „kein Standard“ als Vergleich ausserhalb der Rangfolge (Status quo mit Ad-hoc-Bau, Wartung, Leserzeit getrennt ausgewiesen, Rueckfragen; Break-even-Minuten Leserzeit), Rangfolge (Kostenverhaeltnis und Anforderungs-Score, Regler 70/30), ausgeschlossene Ansaetze unter dem Strich mit dem Preis der Rahmenbedingung, Konflikt-Boxen, Kostenstruktur, Break-even ueber die Viewer-Zahl mit Verhandlungsgrenze (Indifferenz-Lizenzpreis), Sensitivitaet, kumulierte Kosten, Barwert, Textbausteine zu Vorteilen, Nachteilen und versteckten Kosten, Excel-Export mit Deckblatt.
6. **Monte-Carlo-Seite:** Schwankungsbreite ±5/10/15/20/25 % um die eigenen Eingaben, wahlweise fuer Mengengeruest und Annahmen oder nur fuer das Mengengeruest, 1.000 bis 5.000 Ziehungen. Erzeugt lokal im Browser eine eigene Auswertungsseite (neuer Tab oder HTML-Datei): Verteilung der Kosten je Viewer, Anteil je Platz 1 bis 4, hart gegen weich, Erstellung gegen Nutzung mal direkt gegen indirekt (2x2 je Ansatz), Rangkorrelationen (Spearman) fuer Mengengeruest und Annahmen, gepaarte Differenz Paid gegen Open Source und eine Skalen-Simulation bei festem Verhaeltnis Ersteller : Viewer (x0,5 bis x10) mit Kipp-Punkt.

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
Governance  = Freigabe je Visual-Paket (+20 % je weiterem Chart-Typ) + laufende Governance + Pruefnachweis (log-linear nach Organisationsgroesse, 50 bis 5.000 Viewer) + Zugriffs-Governance je 1.000 Viewer (ansatzunabhaengig) + Anwender-Support je 100 Viewer
Risiko      = P(Abkuendigung ueber H) × (Aufbau + 0,6 × Rollout) × Migrationsanteil  (Jahresrate akkumuliert; in der Simulation als Ereignis)
Barwert     = Zahlungsstrom je Jahr, abgezinst mit dem Kalkulationszins
```

Interne Stunden werden mit einem Bewertungsfaktor (60 = Kapazitaet frei, 100 = Vollkosten, 150 = verdraengt Fachaufgaben; Bewertungskonvention, in der Simulation konstant) und einer Lohnsteigerung bewertet. Jede Annahme wird je Szenario genau einmal gezogen, globale Annahmen sind zwischen den Ansaetzen identisch (gepaarte Vergleiche).

## Voreinstellungen (Auswahl, min · wahrscheinlich · max)

| Annahme | Wert | Quellenlage |
|:---|:---|:---|
| Stundensatz intern (Vollkosten) | 65 · 85 · 115 €/h | S: Controller Ø 71 k€ × Vollkostenfaktor 1,7 / 1.500–1.600 h; Standard-Bauer liegen darueber |
| Stundensatz extern | 95 · 125 · 220 €/h | S: freelancermap Kompass 2026 Ø 103 €/h, Berater 121; Beratungshaus 1.000–1.500 €/Tag |
| Lizenz je Nutzer und Jahr (Paid, Einstiegspreis vor Staffel) | 40 · 80 · 150 € | S: Inforiver Analytics+ 2,40–3 $/Monat, Zebra BI Personal 299 $/Jahr, Team 799 $/Jahr fuer 5 Nutzer; Herstellerseiten in der Pruefumgebung nicht abrufbar |
| Site-Lizenz je Jahr (Paid) | 12.000 · 35.000 · 90.000 € | S: Inforiver Domain-wide ab 12 k$ verhandelt (2026), 96 k$ flat war ein Preis von 2024; Presets bis 300 k€ als Schaetzung |
| Volumenstaffel | −20 % ab 25, −40 % ab 100, −55 % ab 500, −70 % ab 2.000, −80 % ab 5.000 Nutzern, je Jahr | F: Zebra Team-Paket ≈ −46 % ab 5 Nutzern, Inforiver Domain-wide ≈ −80 % ab 2.000 |
| Stunden je Chart-Typ erstmalig (paid / oss / deneb / core) | 2–4–7.5 / 4.5–8.5–14 / 7–12–18 / 10–16–27 h | P: simuliertes Expertenpanel (20 Profile), Median |
| Stunden je Chart bei Wiederverwendung | 0.5–1–2 / 1–2–3.5 / 1–2.5–4.5 / 2–4–6.5 h | P; wichtigster ungemessener Hebel (Faktor 2 Paid zu OSS, Blindschaetzung bestaetigt, Audit haelt 1,4 fuer vertretbar) |
| Schulung Vorlagen-Bauer (paid / oss / deneb / core) | 5–8.5–15 / 8–15–26 / 20–35–58 / 18–28–43 h | P: simuliertes Expertenpanel (20 Profile), Median |
| Einarbeitung bei Fluktuation | 8–16–40 / 12–28–70 / 24–70–180 / 16–50–130 h | E: Autoren-Schaetzung; wirkt voll nur auf Vorlagen-Bauer |
| Wartungsquote p.a. in % (geplante Anpassungen) | 6–10–18 / 12–22–32 / 10–17–27 / 12–30–48 | P, im Audit um den Anteil bereinigt, der in Breaking-Updates steckt |
| Breaking-Updates p.a. / Fix-Stunden | 0.2–1–2 / 0.5–1.5–3 / 1–2–3 / 2–3–5 · 3 / 7 / 6.5 / 9.5 h | P; Deneb 3 Vorfaelle in 24 Monaten, Core 3–4 SVG-Regressionen 2025 belegt |
| Abkuendigungsrisiko p.a. (paid / oss / deneb / core) | 1–2–4 / 3–7–13 / 1–3–6 / 0,4–1–2 % | F: Charticulator 12/2023, Bing Maps Visual 10/2025, OKViz Synoptic v1 03/2026; Deneb gesenkt, weil Vega-Lite-Specs das Wirtsvisual ueberleben |
| Anwender-Support je 100 Viewer und Jahr | 2–4–6 / 2.5–5.5–10 / 3–6–10 / 5–9.5–16 h | P: simuliertes Expertenpanel (20 Profile), Median; OSS im Audit gesenkt |
| Komplexitaetsfaktor einfach / komplex (× Stunden je Chart) | 0,7 / 1,4 (paid) · 0,7 / 1,6 (oss) · 0,5 / 2,5 (deneb) · 0,4 / 4 (core) | E: Autoren-Schaetzung, keine Quelle; Core + SVG beim Wasserfall am teuersten |
| Lernrate je Verdopplung | 0–5–10 / 5–10–15 / 8–15–25 / 8–15–25 % | F: Wright-Lernkurve, 80–90 % bei manueller Arbeit; keine Messung fuer Power BI |
| Null-Option: Stunden je Chart ad hoc, Wartung, Leserzeit, Rueckfragen | 1–2–4 h · 20–30–45 % · 0,5–2–6 min je Viewer und Woche · 6–12–20 h je 100 Viewer | E: Autoren-Schaetzung; Leserzeit ohne unabhaengige Quelle, deshalb getrennt ausgewiesen |
| Freigabe je Visual-Paket (einmalig) | 4–8–16 / 8–24–60 / 1–4–10 / 0–2–6 h | E; +20 % je weiterem Chart-Typ; zertifiziertes OSS rechnet mit dem Paid-Wert |
| Laufende Governance p.a. | 6–16–42 / 12–30–80 / 6–16–40 / 1–3–10 h | E, log-linear nach Organisationsgroesse (×0,3 bei 50 Viewern bis ×1,3 ab 5.000) |
| Fluktuation, Lohnsteigerung, Kalkulationszins | 5–11–22 % · 2–3–4,5 % · 5–8–10 % | S (Finance ~10 %, IT 20–22 %) · V (WSI-Tarifarchiv 2025/2026) · S (KPMG Kapitalkostenstudie 2025, WACC Ø 8,5 %) |
| Betriebsmodell-Faktoren (Enterprise → Self-Service) | Owner-Anteil 10 → 100 %, Varianten ×1 → ×3, Support ×0,8 → ×1,3, Governance ×1 → ×1,6 | E |
| Reports je Ersteller (Erfahrungswert) | Enterprise ≈ 6, Managed ≈ 4, Self-Service ≈ 2, plus 2 je 1.000 Viewer | E |

Quellenlage aller 44 Annahmen: 2 verifiziert (V), 8 Such-Snippet (S), 4 Faustregel (F), 9 simuliertes Expertenpanel (P), 21 Autoren-Schaetzung (E). Deshalb Bandbreiten statt Punktwerte, und deshalb steht die Herkunft an jedem Wert.

## Rahmenbedingungen, die das Ergebnis kippen

- **IBCS-Zertifikat Pflicht + kein Lizenzbudget:** unloesbar, keines der betrachteten kostenlosen Visuals ist IBCS-zertifiziert (Zebra BI, Inforiver, graphomate, hi-chart sind es).
- **Nur zertifizierte Visuals im Tenant:** nicht zertifizierte Open-Source-Visuals laden im Service nicht (Microsoft Learn); ChartKitchen ist aktuell nicht zertifiziert.
- **Copilot als Must:** Copilot erstellt und bearbeitet Reports nur mit Core Visuals. KI-Readiness entsteht im Datenmodell, nicht im Visual.
- **Report Server, Sovereign Cloud, Publish-to-web, Embedded (app owns data):** ueber AppSource lizenzierte Visuals werden dort nicht durchgesetzt oder nicht unterstuetzt.
- **Ueber 2.000 Nutzer mit Listenpreis:** Hersteller verhandeln Staffeln oder Site-Lizenzen; Lizenzmodell umstellen.

## Grenzen

- Nicht enthalten: Power-BI-Grundlizenzen (fuer alle gleich), Nutzen-Seite (nur als Score und „€ je Anforderungspunkt"), Aktivierung/Abschreibung (§ 248 HGB, IAS 38), Steuern (§ 50a EStG), Datenmodell und Datenaufbereitung.
- Stunden je Chart, Setup, Schulung, Wartung, Breaking-Updates und Support stammen aus einem simulierten Expertenpanel (20 Rollenprofile, per Sprachmodell unabhaengig geschaetzt, Median je Wert; Rohdaten unter sessions/visual-standards-rechner-reviews/). Das ist strukturierte Meinung, keine Messung, und die wichtigste Stellschraube.
- Preise stammen ueberwiegend aus Such-Auszuegen der Herstellerseiten (Stand 09/2026) und sind vor einer Entscheidung beim Hersteller zu pruefen.
- Plaetze mit ueberlappenden P10–P90-Baendern sind statistisch nicht unterscheidbar und werden zusammengefasst. Bei kleinen Mengen ist Paid gegen Open Source mit der vorliegenden Evidenz nicht entscheidbar; wer die Rangfolge braucht, muss messen (fuenf Charts mit beiden Werkzeugen bauen), nicht rechnen.

## v0.8: Chart-Mix, Lernkurve, Null-Option

Drei Punkte aus der Grundannahmen-Kritik (`sessions/visual-standards-rechner-audit/grundannahmen-kritik.md`) sind umgesetzt. **Chart-Mix:** drei Komplexitaetsklassen mit Anteilen; je Ansatz zwei Faktoren (einfach, komplex) gegenueber der mittleren Klasse, normiert auf die Standard-Mischung, fuer die die Panel-Stunden gelten. Core + SVG verteuert sich bei Wasserfall und Szenario-Notation um Faktor 4, Paid um 1,4. **Lernkurve:** Stunden je Chart bei Wiederverwendung fallen nach Wright mit der Zahl der Charts je Ersteller; kleine Teams zahlen mehr als den Panelwert, grosse weniger (Grosskonzern Core 0,80, Pilot 1,03). **Null-Option:** Status quo ohne Standard mit Ad-hoc-Bau, Wartung, Rueckfragen und Leserzeit; die Leserzeit ist der am wenigsten belegte Wert und wird getrennt gezeigt, dazu die Minuten je Viewer und Woche, ab denen sich der guenstigste zulaessige Ansatz rechnet. Nicht umgesetzt: Koexistenz, Restwert, Korrelationen, Risikoaversion.

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
- Daten-WG: Zehn Tage bis zum marktfaehigen Stand — https://datenwgknowledgekitchen.com/whitepaper-ki-entwicklung-roi.html
