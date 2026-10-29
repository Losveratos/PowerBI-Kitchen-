# Workshop-Dokumentation · Management Report · Beispiel

Stand: <datum> · Version 0.1 · Spec-Hash `7e7618d2` · erstellt mit MockupKitchen byDatenWG 0.1

| | |
|---|---|
| Teilnehmende | [ausfüllen] |
| Zielgruppe | [ausfüllen] |
| Ziel des Berichts | [ausfüllen] |
| Entscheidung | [ausfüllen] |
| Datenstand / Aktualisierung | [ausfüllen] |
| Seiten | Übersicht |
| Datenmodell | PBI-IBCS-Testbed.SemanticModel (9 Tabellen) |

## Entscheidungen zur Gestaltung

- Format 1280 × 720 px.
- Kopfband „Management Report" · in T€ · YTD 2026, Stil dark, Logo links.
- Filter als Panel rechts: Year, Region.
- Fußleiste „Stand: <datum> · Quelle: DWH · Kontakt: Controlling".
- Kacheln eckig, mit feinem Rahmen, Seitenhintergrund #F4F4F1, Akzent #C25A2D.
- Varianz-Palette Teal (Petrol / Rot): gut #1E8F9E, schlecht #D64541. Schriftfarbe #0F1E2E.

## Seite 1 · Übersicht

**Fragestellung:** [ausfüllen]

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Umsatz; Ziel / Referenz: PL | – | – | offen | – |
| 1.2 | Marge | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Marge; Ziel / Referenz: PL | – | – | offen | – |
| 1.3 | Kosten | Karte (nativ) | Kennzahl: Kosten | kleiner = besser | – | offen | – |
| 1.4 | Deckungsbeitrag (in T€) | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Deckungsbeitrag (neu); Ziel / Referenz: PL | – | – | offen | Neue Kennzahl, siehe newFields. |
| 1.5 | Umsatz AC/FC vs PL je Monat (in T€) | Integrierte Varianzanalyse, AC/PL/FC, ChartKitchen | Kategorie / Zeit: Month; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL; FC-Flag (1/0): IsForecast | – | – | offen | Monate chronologisch sortieren (DimDate.MonthKey). |
| 1.6 | Δ PL je Produktlinie | Balken (Kategorien, sortiert), AC/PL | Kategorie / Zeit: Category; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | – | – | offen | Absteigend nach AC sortieren. |

## Kennzahlen-Steckbrief

| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |
|---|---|---|---|---|---|---|---|
| _Measures.Umsatz | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.PL | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Marge | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Kosten | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Deckungsbeitrag (neu) | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Month | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.AC | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.IsForecast | – | [ausfüllen] | – | – | – | – | ☐ |
| DimProduct.Category | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Year | – | [ausfüllen] | – | – | – | – | ☐ |
| DimRegion.Region | – | [ausfüllen] | – | – | – | – | ☐ |

### Neu zu erstellen

| Feld | Art | Tabelle | Beschreibung / Logik | Einheit | Ziel | Owner | Quelle | Offene Frage |
|---|---|---|---|---|---|---|---|---|
| Deckungsbeitrag | Kennzahl | _Measures | Umsatz minus variable Kosten; Format #,##0 | – | – | – | – | – |

## Offene Punkte

- [ ] keine offenen Punkte erfasst

## Hinweise

- Seite ohne Fragestellung / Kernbotschaft

## Nächste Schritte

- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen
- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen
- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen
