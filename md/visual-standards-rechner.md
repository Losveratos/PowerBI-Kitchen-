# Visual-Standards-Rechner: Easy, Flexibel oder MacGyver?

> Indikations-Rechner: Was kostet die Umsetzung visueller Standards in Power BI mit 3rd-Party-Visuals, Open Source, Deneb oder Core Visuals — über 3, 5 oder 10 Jahre, je Viewer und Jahr, mit K.O.-Kriterien, Bandbreiten statt Punktwerten und Excel-Export.

- **Quelle:** https://datenwgknowledgekitchen.com/visual-standards-rechner.html
- **Autor:innen:** Michael Tenner & Diana Ackermann · Daten-WG Knowledge Kitchen
- **Anlass:** Pre-Conference „Visual Standards in Power BI für Controlling und Finance | Von Easy über Flexibel bis MacGyver", Daten-WG 2026, 14.10.2026, Köln
- **Stand:** v0.5 · 09/2026 · Sprache DE · rein clientseitig, keine Server-Anbindung
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

1. **Mengengeruest:** Ersteller, Viewer (bis 10.000+), Standard-Reports (mit Erfahrungswert je Betriebsmodell), Charts je Report, Chart-Typen, Horizont 3/5/10 Jahre, Betriebsmodell (Enterprise BI, Managed Self-Service, Self-Service, stufenlos hybrid), heutiger Ansatz und Bestands-Reports fuer die Migration.
2. **Anforderungen (MoSCoW):** 18 Kriterien mit Erfuellungsgrad 1 bis 5 je Ansatz, per Klick ueberschreibbar, eigene Zeilen moeglich (starten als „nicht geprueft"). Must mit Erfuellungsgrad 1 ist ein K.O.
3. **Red Flags:** Governance-Schalter (nur zertifizierte Visuals, nur Core Visuals, IBCS-Zertifikat Pflicht, kein Lizenzbudget, Report Server, Embedded/Publish-to-web, Sovereign Cloud, fehlende Desktop-Gruppenrichtlinie, kein externer Dienstleister). Sie wirken als K.O.-Filter vor dem Rechnen.
4. **Annahmen:** globale und ansatzspezifische Dreipunkt-Werte mit Quellen-Badge (V verifiziert, S Such-Snippet, F Faustregel, E Expertenschaetzung Daten-WG, N eigene Aenderung). Lizenzmodell pro Nutzer, Volumenstaffel oder Site-Lizenz.
5. **Ergebnis:** Rangfolge (Kostenverhaeltnis und Anforderungs-Score, Regler 70/30), ausgeschlossene Ansaetze unter dem Strich mit dem Preis der Rahmenbedingung, Konflikt-Boxen, Kostenstruktur, Break-even ueber die Viewer-Zahl mit Verhandlungsgrenze (Indifferenz-Lizenzpreis), Sensitivitaet, kumulierte Kosten, Barwert, Textbausteine zu Vorteilen, Nachteilen und versteckten Kosten, Excel-Export mit Deckblatt.
6. **Monte-Carlo-Seite:** Schwankungsbreite ±5/10/15/20/25 % um die eigenen Eingaben, wahlweise fuer Mengengeruest und Annahmen oder nur fuer das Mengengeruest, 1.000 bis 5.000 Ziehungen. Erzeugt lokal im Browser eine eigene Auswertungsseite (neuer Tab oder HTML-Datei): Verteilung der Kosten je Viewer, Anteil je Platz 1 bis 4, hart gegen weich, Erstellung gegen Nutzung mal direkt gegen indirekt (2x2 je Ansatz), Rangkorrelationen (Spearman) fuer Mengengeruest und Annahmen, gepaarte Differenz Paid gegen Open Source und eine Skalen-Simulation bei festem Verhaeltnis Ersteller : Viewer (x0,5 bis x10) mit Kipp-Punkt.

## Kostenkern (je Ansatz, Horizont H)

```
Lizenz      = Nutzerjahre × Preis × Staffelfaktor  (Viewer wachsen ab Jahr 2, Autoren konstant, Preis steigt jaehrlich)
              oder Site-Lizenz × Jahre; plus Lizenz-Administration, Support/Sponsoring, Capacity-Aufschlag
Aufbau      = (Setup + Eigenentwicklung + Chart-Typen × Stunden erstmalig) × Stundensatz-Mix
Migration   = Bestands-Reports × Charts/Report × Wiederverwendungs-Stunden × Nachbau-Faktor (nur bei Wechsel)
Rollout     = (Reports + Nachfrage je 1.000 Viewer) × Charts/Report × Wiederverwendungs-Stunden × Betriebsmodell-Faktor
Schulung    = Vorlagen-Bauer × tiefe Schulung + Vorlagen-Nutzer × flache Schulung + Fluktuation × (Schulung + Einarbeitung)
Wartung     = (Setup + Entwicklung + Chart-Aufbau + 0,3 × Rollout) × Quote × Abklingfaktor-Summe × Varianten-Effekt + Breaking-Updates × Fix-Stunden
Governance  = Freigabe je Variante + laufende Governance + Pruefnachweis (gestuft nach Organisationsgroesse) + Zugriffs-Governance je 1.000 Viewer + Anwender-Support je 100 Viewer
Risiko      = P(Abkuendigung ueber H) × Aufbau × Migrationsanteil  (Jahresrate akkumuliert; in der Simulation als Ereignis)
Barwert     = Zahlungsstrom je Jahr, abgezinst mit dem Kalkulationszins
```

Interne Stunden werden mit einem Bewertungsfaktor (60 = Kapazitaet frei, 100 = Vollkosten, 150 = verdraengt Fachaufgaben) und einer Lohnsteigerung bewertet. Jede Annahme wird je Szenario genau einmal gezogen, globale Annahmen sind zwischen den Ansaetzen identisch (gepaarte Vergleiche).

## Voreinstellungen (Auswahl, min · wahrscheinlich · max)

| Annahme | Wert | Quellenlage |
|:---|:---|:---|
| Stundensatz intern (Vollkosten) | 60 · 80 · 100 €/h | F: Controller-Gehalt Ø 71 k€ plus Gemeinkostenfaktor |
| Stundensatz extern | 95 · 120 · 180 €/h | S: freelancermap Ø 98–104 €/h |
| Lizenz je Nutzer und Jahr (Paid, Mischpreis) | 40 · 80 · 150 € | S: Inforiver ~3 $/Monat, Zebra BI Personal ~299 $/Jahr, Team 799 $/Jahr bis 5 User |
| Site-Lizenz je Jahr (Paid) | 12.000 · 40.000 · 96.000 € | S: Inforiver Domain-wide 12–96 k$ (widerspruechliche Quellen); Presets bis 300 k€ als Schaetzung |
| Volumenstaffel | −25 % ab 100, −45 % ab 500, −60 % ab 2.000, −70 % ab 5.000 Nutzern | F |
| Stunden je Chart-Typ erstmalig (paid / oss / deneb / core) | 2–4–7.5 / 4.5–8.5–14 / 7–12–18 / 10–16–27 h | E: simuliertes Expertenpanel (20 Profile), Median |
| Schulung Vorlagen-Bauer (paid / oss / deneb / core) | 5–8.5–15 / 8–15–26 / 20–35–58 / 18–28–43 h | E: simuliertes Expertenpanel (20 Profile), Median |
| Wartungsquote p.a. in % (paid / oss / deneb / core) | 6–10–18 / 15–26–38 / 11–19–30 / 20–34–52 | E: simuliertes Expertenpanel (20 Profile), Median |
| Abkuendigungsrisiko p.a. (paid / oss / deneb / core) | 1–2–4 / 3–7–13 / 2–4–8 / 0,4–1–2 % | F: Charticulator 2023, Bing-Maps-Visuals 2025, OKViz 2026 |
| Anwender-Support je 100 Viewer und Jahr | 2–4–6.25 / 3–7–12 / 3–6–10 / 5–9.5–16 h | E: simuliertes Expertenpanel (20 Profile), Median |
| Laufende Governance p.a. | 6–16–42 / 18–46–112 / 12–32–78 / 1–3–10 h | E, gestuft nach Organisationsgroesse (×0,3 unter 50 Viewern bis ×1,3 ab 1.000) |
| Betriebsmodell-Faktoren (Enterprise → Self-Service) | Owner-Anteil 10 → 100 %, Varianten ×1 → ×3, Support ×0,8 → ×1,3, Governance ×1 → ×1,6 | E |
| Reports je Ersteller (Erfahrungswert) | Enterprise ≈ 6, Managed ≈ 4, Self-Service ≈ 2, plus 2 je 1.000 Viewer | E |

Quellenlage aller 36 Annahmen: 1 verifiziert, 4 Snippet, 11 Faustregel, 20 Expertenschaetzung. Deshalb Bandbreiten statt Punktwerte.

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
- Plaetze mit ueberlappenden P10–P90-Baendern sind statistisch nicht unterscheidbar und werden zusammengefasst.
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
