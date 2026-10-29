# Workshop-Dokumentation · Darstellungsvarianten-Testfall

Stand: <datum> · Version 0.4.1 · Spec-Hash `variants1` · erstellt mit MockupKitchen byDatenWG 0.4.1

| | |
|---|---|
| Teilnehmende | Vertrieb, Controlling |
| Zielgruppe | Vertriebsleitung |
| Ziel des Berichts | Umsatz je Region vergleichbar zeigen, Achse umschaltbar |
| Entscheidung | Welche Region bekommt das zusaetzliche Budget? |
| Datenstand / Aktualisierung | taeglich, 6 Uhr |
| Seiten | Varianten |
| Datenmodell | Vertrieb.SemanticModel (6 Tabellen) |

## Entscheidungen zur Gestaltung

- Format 1280 × 720 px (HD).
- Kopfband „Vertrieb 2026" · Umsatz und Kosten je Region, Stil light, Logo links.
- Filter als Panel rechts: Year.
- Fußleiste „Stand: taeglich 6 Uhr · Quelle: DWH".
- Kacheln gerundet (4 px), flach, Seitenhintergrund #F4F4F1, Akzent #C25A2D.
- Varianz-Palette Teal (Petrol / Rot): gut #1E8F9E, schlecht #D64541. Schriftfarbe #0F1E2E.

## Seite 1 · Varianten

**Fragestellung:** Wo steht der Umsatz je Region und wie entwickelt er sich?

**Notizen:** Testfall fuer Small Multiples, Feldparameter und die nativen Klassiker.

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz je Produktlinie | Säulendiagramm (nativ) | Kategorie / Zeit: Category; Werte: Umsatz; Small Multiples nach: Region | sortiert nach value, K, 0 dec, Small Multiples nach DimRegion.Region | Must | abgestimmt | Ein Mini-Chart je Region. |
| 1.2 | Umsatz und Kosten (Achse umschaltbar) | Balkendiagramm (nativ) | Kategorie / Zeit: Region, Category, Segment; Reihe / Legende: Brand; Werte: Umsatz, Kosten | Achse per Feldparameter „Achse" (DimRegion.Region, DimProduct.Category, DimCustomer.Segment) | Should | offen | Slicer auf den Parameter nicht vergessen. |
| 1.3 | Verlauf je Monat | Liniendiagramm (nativ) | Kategorie / Zeit: Month; Reihe / Legende: Category; Werte: Umsatz | month, Small Multiples nach ? | – | offen | Aufteilungsfeld fehlt noch. |
| 1.4 | Anteile je Produktlinie | Donut (nativ) | Kategorie / Zeit: Category; AC · Ist-Wert: Umsatz | – | Could | offen | – |
| 1.5 | Ergebnisbruecke | Wasserfall | Kategorie / Zeit: Account; AC · Ist-Wert: AC; Small Multiples nach: Region | Small Multiples nach DimRegion.Region | – | offen | waterfallChart hat keinen Small-Multiples-Bucket. |
| 1.6 | AC/PL je Monat | Säulen + Referenz, AC/PL, ChartKitchen | Kategorie / Zeit: Month; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL; Small Multiples nach: Region | Small Multiples nach DimRegion.Region, Achse per Feldparameter „CK-Achse" (DimDate.Month) | – | offen | ChartKitchen kann weder Small Multiples noch den Feldparameter. |

## Kennzahlen-Steckbrief

| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |
|---|---|---|---|---|---|---|---|
| DimProduct.Category | Produktlinie | Produktlinie | – | – | Vertrieb | DWH | ☑ |
| DimProduct.Brand | – | Marke | – | – | – | – | ☐ |
| DimRegion.Region | – | Vertriebsregion | – | – | Vertrieb | DWH | ☑ |
| DimCustomer.Segment | – | Kundensegment | – | – | – | – | ☐ |
| DimDate.Month | – | Monat | – | – | – | – | ☑ |
| DimDate.Year | – | Jahr | 0 | – | – | – | ☑ |
| DimAccount.Account | – | GuV-Position | – | – | – | – | ☐ |
| _Measures.Umsatz | – | Nettoumsatz | EUR | – | Controlling | DWH | ☑ |
| _Measures.Kosten | – | Variable Kosten | EUR | – | Controlling | DWH | ☐ |
| _Measures.AC | – | Ist-Wert | #,##0 | – | Controlling | DWH | ☑ |
| _Measures.PL | – | Plan | #,##0 | – | Controlling | DWH | ☑ |

## Offene Punkte

- [ ] Varianten / Verlauf je Monat: Aufteilungsfeld fehlt noch.
- [ ] Varianten: „Verlauf je Monat": Small Multiples aktiv, aber kein Aufteilungsfeld gebunden

## Hinweise

- „AC/PL je Monat": Feldparameter „CK-Achse" hat nur 1 Feld(er); mindestens zwei sind sinnvoll

## Nächste Schritte

- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen
- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen
- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen
