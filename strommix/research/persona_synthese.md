# Synthese · 7-Persona-Panel zur Strommix-Story (v0.1)

**Datum:** 2026-08-19 · **Prüfobjekt:** `strommix-story.html` (+ White Paper Stichproben)
· Einzelgutachten in `persona_reviews/01–07`

## Urteile im Überblick

| # | Persona | Befunde (krit/schwer­+mittel/klein) | Empfehlung |
|---|---|---|---|
| 1 | Energie-Professor:in | 5 / 12 / 8 | **überarbeiten (major revision)** |
| 2 | Journalist:in | 7 / 16 / 9 | nach Redigat publizieren |
| 3 | Versorger-Manager:in | 3 / 11 / 3 | überarbeiten |
| 4 | EE-Expert:in | 3 / 11 / 6 | überarbeiten vor v1.0 |
| 5 | Klimaaktivist:in | 5 / 5 / 3 | überarbeiten |
| 6 | Nuklear-Advocate | 3 / 11 / 4 | nachbessern (Modell, nicht Erzählung) |
| 7 | DataViz-Expert:in | 4 / 10 / 8 | überarbeiten (Layout/Encoding) |

**Einhelliges Lob über alle 7 Perspektiven:** Bandbreiten statt Punktwerte,
Konfidenzstufen an jeder Zahl, Kostenabgrenzungen benannt, Selbstkritik-Kapitel,
Gegenpositionen im Text, Tabellen-Zwillinge, Achsen auf Null. Die *Erzählebene*
gilt als publikationsnah — Akte 1, 2, 3, 5 laut Professor „nahezu unverändert"
freigabefähig.

**Einhelliger Kernbefund:** Die *Modellebene* trägt die Pointe von Akt 4 nicht.
Vier Personas treffen unabhängig dieselbe Stelle aus vier Richtungen.

## Konsens-Befunde (Pflicht-Fixes — Modell)

| Fix | Befund | Effekt | Quelle(n) |
|---|---|---|---|
| **M1 · IDC-Doppelzählung Kernkraft** | `apply_idc=True` auf CAPEX-Anker, die Finanzierung bereits enthalten (Dossier 7.3 verbietet das wörtlich) | **+24,3 €/MWh** aufs Kernkraft-Szenario; ohne den Fehler kehrt sich die Akt-4-Reihenfolge um | Professor K1, Nuklear-Advocate K1 |
| **M2 · Erdgas-Brennstoffpreis = 0** | Gewinner-Pfad verbrennt 264 TWh Gas gratis (CO₂ aber bepreist) | bei 30 €/MWh_th schrumpft der Rangabstand von 15,1 auf 4,8; bei 50 kehrt er sich um | Versorger K1, Professor K2, Klimaaktivist (Gegenrichtung!), EE-Experte |
| **M3 · Netzkosten-Regel** | 651 Mrd. € linear ∝ fEE-Anteil: Verteilnetz-Sockel (323 Mrd., mixunabhängig) fällt bei fEE→0 weg; ee100 skaliert mit abgeregelter Energie auf 165 % des Budgets | allein 29–32 €/MWh Differenz zwischen Presets — **größer als der erzählte Rangabstand**; begünstigt Kernkraft-Szenarien | EE-Experte K1, Versorger K2, Professor, Nuklear-Advocate (Netz nicht in MC) |
| **M4 · MC: gepaarte Ziehungen + WACC + CO₂ variieren** | unabhängige Seeds je Preset → Überlappungsargument statistisch unzulässig; mit common random numbers ist die Rangfolge zu 87 % entschieden; WACC und CO₂-Preis (rangentscheidend ab ~260 €/t) fehlen im Band | Akt-4-Kernsatz „Rangfolge nicht entschieden" ist so nicht haltbar — in der aktuellen Rechnung sogar in der falschen Richtung | Professor K3, Journalist K2, Klimaaktivist Top-1 |
| **M5 · Emissions-Ausweis je Szenario** | „klimaneutraler" Sieger-Pfad emittiert ~107 Mt CO₂/a, Ist-Anker ~123 Mt — nirgends genannt; Modell kennt kein CCS, obwohl GES mit Gas+CCS rechnet | Szenarien sind nicht emissionsäquivalent → Kostenvergleich hinkt | Professor K4, Klimaaktivist Top-2 |
| **M6 · Ist-2025-Anker vervollständigen** | ohne Kohle/Biomasse/Wasser; 59 % der Arbeit aus Gas-Backup; trägt Netzausbau bis 2045 | korrigiert ~175 statt 107 €/MWh — kippt die Nebenbotschaft „heutiges System am billigsten" | Professor K5, Klimaaktivist |
| **M7 · Überschreitungs-Empirie symmetrisch** | Faktor 2,2 auf bereits realisierte Kernkraft-Kosten gestapelt (mögl. Doppelzählung); Batterie/H₂-Techs ungemessen bei 1,00 | Overrun-Szenario überzeichnet | Nuklear-Advocate K2, Journalist K6 |

**Wichtig (Professor):** Die Fehler zeigen in *verschiedene* Richtungen — M1/M7
benachteiligen Kernkraft, M3 begünstigt sie, M2 begünstigt den Gas-Pfad, die
Gratis-H₂-Anfangsfüllung den H₂-Pfad. Ergebnis nach Fixes ist offen; die
Schlussfolgerung „nicht trennscharf" *kann* überleben — die bisherige Begründung nicht.

## Konsens-Befunde (Erzählebene)

- **E1 · Phantom-Gegner offenlegen** (Journalist K-Top-1): Akt 5 argumentiert gegen
  unser eigenes Vorpapier („kursierender 30-Jahres-Plan") → als Selbstkorrektur erzählen.
- **E2 · Absender & Rahmen nach vorn**: Wer GES ist, Zieljahr 2045/950 TWh,
  „Studie lag nie im Volltext vor" (Journalist, Klimaaktivist).
- **E3 · Klimadimension ergänzen**: IPCC-Prämisse, CO₂-Preis-Sensitivität
  (Markt 74 vs. UBA 350/990 €/t, Kipppunkt ~260), Mt-CO₂-Angaben (Klimaaktivist).
- **E4 · Akt 3 global ehrlich machen**: China/Asien fehlt; MC-Basisspanne schließt
  Asien/Golf aus — auf der Seite begründen (Nuklear-Advocate K3); Grubler-Repliken
  (Escobar Rangel/Lévêque 2015, Berthélemy 2015) als Beipackzettel (Professor, Advocate).
- **E5 · Wind-VLh als offene Frage** formulieren, nicht als erwiesener Fehler (EE-Experte K3).
- **E6 · Marktdesign-Kasten**: Kraftwerksstrategie/Kapazitätsmechanismus — „wer baut
  die Reserve?" (Versorger S1); Import/DSM-Satz „alle gleichermaßen" korrigieren (EE K2).
- **E7 · Dunkelflauten-Quellenbasis** diversifizieren (hängt an Uniper-Kurzstudie; EE H1).

## Konsens-Befunde (Visualisierung)

- **V1 · Chart-Typografie ≥ 12 px effektiv** auf allen Breiten (DataViz K1, gemessen 7–10 px).
- **V2 · fig-title statisch über SVG**, Overlap 1020–1240 px beheben (K2).
- **V3 · Akt 5/S1 als Abweichungs-Balken** mit gemeinsamer Nullachse (K4: Skalierungsartefakt).
- **V4 · Legende für Box-Whisker-Glyphe** in Akt 4; Blau/Rot-Zuordnung Text↔Chart angleichen (M1/M4).

## Perspektiv-Spannungen (Entscheidung Michael)

1. **CCS aufnehmen?** Professor: GES rechnet mit Gas+CCS, unser Modell kennt es nicht →
   fairer Vergleich bräuchte CCS-Kostenpfad. Aufwand mittel; alternativ als Limitation schärfen.
2. **Wie viel Klima-Rahmung?** Klimaaktivist will IPCC/Restbudget im Prolog; Journalist warnt
   vor Überfrachtung des Hooks. Kompromissvorschlag: 1 Prämissen-Karte + Mt-Zahlen an den Charts.
3. **Asien/Golf in die MC-Spanne?** Advocate: Ausschluss ist Cherry-Picking; Dossier 7.1
   begründet ihn (Übertragbarkeit). Kompromiss: als Toggle/zweite Verteilung zeigen statt einmischen.

## Empfohlene Reihenfolge

1. **Modell-Upgrade v0.2** (M1–M7) → alle Daten/Referenzen neu erzeugen, neue Wahrheit kennen
2. **Story-Redigat + Viz-Fixes** (E1–E7, V1–V4) auf Basis der neuen Zahlen
3. Whitepaper Kap. 6 nachziehen, dritter adversarialer Review, dann Abnahme Michael
