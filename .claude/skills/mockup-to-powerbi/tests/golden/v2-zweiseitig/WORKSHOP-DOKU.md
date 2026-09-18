# Workshop-Dokumentation · Management Report · Beispiel

Stand: <datum> · Version 0.1 · Spec-Hash `02f4ddc3` · erstellt mit MockupKitchen byDatenWG 0.2

| | |
|---|---|
| Teilnehmende | [ausfüllen] |
| Zielgruppe | [ausfüllen] |
| Ziel des Berichts | [ausfüllen] |
| Entscheidung | [ausfüllen] |
| Datenstand / Aktualisierung | [ausfüllen] |
| Seiten | Übersicht · Detail Produktlinie |
| Datenmodell | Demo-Modell (6 Tabellen) |

## Entscheidungen zur Gestaltung

- Format 1280 × 720 px (HD).
- Kopfband „Management Report" · in T€ · YTD 2026, Stil light, Logo rechts.
- Filter als Burger-Menü (Bookmark): Year, Region.
- Fußleiste „Stand: <datum> · Quelle: DWH · Kontakt: Controlling".
- Kacheln gerundet (8 px), mit feinem Rahmen, Seitenhintergrund #F4F4F1, Akzent #C25A2D.

## Seite 1 · Übersicht

**Fragestellung:** [ausfüllen]

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Umsatz; Ziel / Referenz: PL | – | – | offen | – |
| 1.2 | Kosten | Karte (nativ) | Kennzahl: Kosten | kleiner = besser | – | offen | – |
| 1.3 | Deckungsbeitrag | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Deckungsbeitrag (neu); Ziel / Referenz: PL | – | – | offen | – |
| 1.4 | Marge | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Marge; Ziel / Referenz: PL | – | – | offen | – |
| 1.5 | Δ PL je Produktlinie | Balken (Kategorien, sortiert), AC/PL | Kategorie / Zeit: Category; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | – | – | offen | Klick auf einen Balken springt in die Detailseite (Drill-through auf Category). Offen: Sortierung nach Δ oder AC? · → Detail Produktlinie |
| 1.6 | Umsatz AC/FC vs PL je Monat (in T€) | Integrierte Varianzanalyse, AC/PL/FC, ChartKitchen | Kategorie / Zeit: Month; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL; FC-Flag (1/0): IsForecast | – | – | offen | – |
| 1.7 | Kommentar | Textfeld | – | – | – | offen | Kernbotschaft des Monats, Controller pflegt den Text. |

## Seite 2 · Detail Produktlinie

**Fragestellung:** [ausfüllen]

**Notizen:** Drill-through-Ziel aus der Übersicht; zeigt Einzelpositionen der gewählten Produktlinie.

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 2.1 | Detail: gewählte Produktlinie | Textfeld | – | – | – | offen | Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE). |
| 2.2 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Umsatz; Ziel / Referenz: PL | – | – | offen | – |
| 2.3 | Marge % | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Marge%; Ziel / Referenz: PL | – | – | offen | – |
| 2.4 | Einzelpositionen | IBCS-Tabelle, AC/PL | Zeilen: Product; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | – | – | offen | – |
| 2.5 | Verlauf 24 Monate | Linie (AC vs Referenz), AC/PY | Kategorie / Zeit: Month; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PY | – | – | offen | – |

## Navigation und Drill-Wege

- Von „Übersicht" (p1_v05_PL_je_Produktlinie) nach „Detail Produktlinie" (Drill-through (DimProduct.Category))

## Kennzahlen-Steckbrief

| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |
|---|---|---|---|---|---|---|---|
| _Measures.Umsatz | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.PL | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Kosten | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Deckungsbeitrag (neu) | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Marge | – | [ausfüllen] | – | – | – | – | ☐ |
| DimProduct.Category | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.AC | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Month | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.IsForecast | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Marge% | – | [ausfüllen] | – | – | – | – | ☐ |
| DimProduct.Product | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.PY | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Year | – | [ausfüllen] | – | – | – | – | ☐ |
| DimRegion.Region | – | [ausfüllen] | – | – | – | – | ☐ |

### Neu zu erstellen

| Feld | Art | Tabelle | Beschreibung / Logik | Einheit | Ziel | Owner | Quelle | Offene Frage |
|---|---|---|---|---|---|---|---|---|
| Deckungsbeitrag | Kennzahl | _Measures | Umsatz minus variable Kosten; Format #,##0 | – | – | – | – | Wer liefert die variablen Kosten? |

## Offene Punkte

- [ ] Deckungsbeitrag: Wer liefert die variablen Kosten?

## Hinweise

- Seite ohne Fragestellung / Kernbotschaft
- Seite ohne Fragestellung / Kernbotschaft

## Nächste Schritte

- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen
- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen
- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen
