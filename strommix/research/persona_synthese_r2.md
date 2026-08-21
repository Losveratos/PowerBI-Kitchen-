# Synthese · Panel-Runde 2 (Story v0.2 · White Paper v0.11 · Modell v0.2b)

**Datum:** 2026-08-19 · Einzelgutachten: `persona_reviews/r2_01–r2_07`

## Urteile

| Persona | Modell | R1-Fixes | Neue kritische | Urteil |
|---|---|---|---|---|
| Peer-Review | Fable | 5/5 kritische korrekt | 0 (4 mittel) | **freigeben nach kleinen Korrekturen** (beide Seiten) |
| Journalist | Opus | 5/7 kritische | 0 | nach Redigat publizieren (4 Bedingungen) |
| Versorger | Opus | 53 %, alles echt | 1 (Netz-Sockel) | überarbeiten, Abstand klein (3 Blocker) |
| EE-Experte | Opus | 5/7 fachlich | 0 | Akt 4/S5 überarbeiten, sonst freigeben |
| Klimaaktivist | Opus | 5/5 schwere | 0 (2 schwer) | Freigabe nach kleiner Nachbesserung |
| Nuklear-Advocate | Opus | ~60 % schwere | 0 (4 schwer) | Freigabe mit Auflagen |
| DataViz | Fable | 7/14 voll | 0 (6 mittel) | s. Ideen-Katalog |

**Kein Gutachter fordert eine weitere volle Runde.** Alle 7 bestätigen: Die
Runde-1-Fixes sind substanziell, nicht kosmetisch. Konvergenz mehrerer
Perspektiven auf dieselben Restpunkte → hohe Sicherheit, dass die Liste
vollständig ist.

## Klartext (für die Abnahme)

**Wo stehen wir?** Beide Seiten sind inhaltlich fast fertig. Die Erzählung
stimmt, das Modell ist fair(er) als je zuvor — es fehlen ein kleiner
Zahlen-Patch und eine Verständlichkeits-Runde.

**Was noch kaputt ist (Zahlenkern — Patch v0.2c, 5 Punkte):**
1. Übertragungsnetz braucht denselben Sockel wie das Verteilnetz
   (sonst hängen 62 % des CCS-Vergleichs-Vorsprungs an einer Setzung)
2. Gaspreis/CCS-Kosten werden je Technologie doppelt gewürfelt statt einmal
   (verletzt die eigene Fairness-Garantie über die CCS-Grenze)
3. Überschreitungsfaktor-Interpolation nicht monoton („günstig" wird unter
   Überschreitung teurer als „teuer") + Restdoppelzählung an unteren Ankern
4. CCS-Massenbilanz: ~20 % zu viel Einlagerung (captured+Rest > Input)
5. WP-LCOE-Regler wendet den angezeigten Bauzins-Anteil nicht an

**Was die Texte noch brauchen (Redigat, nach dem Patch):**
- Kipppunkt 48 €/t mit Geltungsbereich (deterministisch; MC-Median ~90;
  wandert mit Gaspreis) — UND die unerzählte Pointe aussprechen: der reale
  ETS-Preis (74 €/t) liegt heute schon über der Basis-Kippmarke
- „Auf gleichem Emissionsniveau" durch das echte emissionsgleiche Paar
  ersetzen (27,9 vs. 31,7 Mt; P=95,9 %, entschieden — stärker UND ehrlicher)
- Prozente in natürliche Häufigkeiten („449 von 1.000 Zukünften")
- Akt 4 entfrachten (751 Wörter/76 Zahlen → kürzen, drei Zahlenpaare für
  denselben Vergleich einmal erklären), 90 %-Aussage mit „offen"-Kriterium
- 107 Mt gegen KSG-2045 einordnen; CCS-Speicherstätten-Satz in die CCS-Karte
- K5 „Faktor 9" endlich raus (steht seit R1 offen, jetzt auch in WP-Summary)
- Kleinigkeiten: StromVKG-Name, Grammatikfehler Prolog, M-Badge an 7.500 VLh,
  Asien-Bänder vs. Strichel-Legende, Nullachse Akt 5/1, 6×6-Matrix nach
  hinten/Paar-Tabelle nach vorn, Auktions-Satz (Versorger S4)

**Verständlichkeits-/Kreativ-Paket (DataViz Top-5, von Michael zu priorisieren):**
1. Haushalts-Anker: jede €/MWh-Zahl auch als ct/kWh und €/Jahr (3.500-kWh-
   Haushalt) — „Beinahe-Gleichstand" = unter 4 €/Jahr Unterschied
2. Natürliche Häufigkeiten + 10×10-Waffle statt Prozent-Matrix vorn
3. Mobile-Layout drehen (Chart 45svh sticky oben) — beendet die Verdeckung
4. „Eine-Ziehung-Demo": ein Klick zeigt eine einzelne gepaarte Monte-Carlo-
   Ziehung live — macht die Methode körperlich begreifbar
5. Szenario-Piktogramme (monochrom, IBCS-konform) vor den 7 Zeilenlabels

## Reihenfolge

1. **v0.2c-Patch** (Zahlenkern 1–5) → Daten regenerieren, Parität, Validierung
2. **Redigat + Verständlichkeit** (beide Seiten, inkl. DataViz-Ideen 1+2+5;
   3+4 nach Aufwand)
3. Stichprobenprüfung (kein volles Panel mehr nötig — Peer-Review-Empfehlung)
4. Abnahme Michael → Merge/Verlinkung
