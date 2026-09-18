# Workshop-Dokumentation · Analyse-Testfall

Stand: <datum> · Version 0.1 · Spec-Hash `testhash` · erstellt mit MockupKitchen byDatenWG 0.3

| | |
|---|---|
| Teilnehmende | M. Tenner, Controlling, Vertrieb |
| Zielgruppe | Vertriebsleitung |
| Ziel des Berichts | Monatliche Steuerung Umsatz und Marge |
| Entscheidung | Maßnahmen bei Planabweichung > 5 % |
| Datenstand / Aktualisierung | [ausfüllen] |
| Seiten | Übersicht · Detail Produktlinie |
| Datenmodell | Demo-Modell (6 Tabellen) |

## Entscheidungen zur Gestaltung

- Format 1280 × 720 px (HD).
- Kopfband „Management Report" · in T€ · YTD 2026, Stil light, Logo rechts.
- Filter als Panel rechts: Year (Vorauswahl 2026), Region.
- Fußleiste „Stand: <datum> · Quelle: DWH · Kontakt: Controlling".
- Kacheln gerundet (12 px), mit weichem Schatten, Seitenhintergrund #EEF1F5, Akzent #C25A2D.

## Seite 1 · Übersicht

**Fragestellung:** Liegen wir im Plan?

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Kosten; Ziel / Referenz: PL | kleiner = besser | – | offen | – |
| 1.2 | Kosten | Karte (nativ) | Kennzahl: Kosten | kleiner = besser | – | offen | – |
| 1.3 | Deckungsbeitrag | KPI-Kachel (IBCS), ChartKitchen | Ziel / Referenz: PL | – | – | offen | – |
| 1.4 | Marge | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Marge; Ziel / Referenz: PL | – | – | offen | – |
| 1.5 | Δ PL je Produktlinie | Wasserfall horizontal + Varianz, AC/PL, ChartKitchen | Kategorie / Zeit: Category; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | – | – | offen | Klick auf eine Kategorie springt in die Detailseite. Offen: Sortierung nach Δ oder AC? · → Detail Produktlinie |
| 1.6 | Umsatz AC/FC vs PL je Monat (in T€) | Integrierte Varianzanalyse, AC/PL/FC, ChartKitchen | Kategorie / Zeit: Month; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL; FC-Flag (1/0): IsForecast | – | – | offen | – |
| 1.7 | Kommentar | Textfeld | – | – | – | offen | Text: Umsatz 8 % über Plan, Süd unter Plan wegen Lieferverzug. |
| 1.8 | Umsatz je Region<br>_Süd liegt 8 % unter Plan._ | Balken (Struktur), AC/PL | Kategorie / Zeit: Region; AC · Ist-Wert: Umsatz; Referenz (PL / PY / BU): PL | sortiert nach value, Top 5, T€, K, 1 dec, Skalengruppe A | Must | abgestimmt | Absteigend nach AC sortieren. |
| 1.9 | Brücke AC vs PL | Wasserfall / Brücke, AC/PL/FC, ChartKitchen | Kategorie / Zeit: Category; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | sortiert nach delta, M, 0 dec, quarter, kumuliert, Skalengruppe A | Should | offen | – |

## Seite 2 · Detail Produktlinie

**Fragestellung:** [ausfüllen]

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 2.1 | Detail: gewählte Produktlinie | Textfeld | – | – | – | offen | Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE). |
| 2.2 | Umsatz | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Umsatz; Ziel / Referenz: PL | – | – | offen | – |
| 2.3 | Marge % | KPI-Kachel (IBCS), ChartKitchen | Kennzahl: Marge%; Ziel / Referenz: PL | – | – | offen | – |
| 2.4 | Einzelpositionen | IBCS-Tabelle, AC/PL, ChartKitchen | Zeilen: Product; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | – | – | offen | – |
| 2.5 | Verlauf 24 Monate | Linie (AC vs Referenz), AC/PY, ChartKitchen | AC · Ist-Wert: AC; Referenz (PL / PY / BU): PY | – | – | offen | – |
| 2.6 | Umsatz und Marge (in T€ / %) | Säulen + Linie, AC/PY, ChartKitchen | Kategorie / Zeit: Year; AC · Ist-Wert: Umsatz; Referenz (PL / PY / BU): Marge% | sortiert nach category, month | Could | abgenommen | – |
| 2.7 | Zur Übersicht | Button | – | – | – | offen | Text: ← Übersicht · → Übersicht |

## Navigation und Drill-Wege

- Von „Übersicht" (mk_7rbkjp5) nach „Detail Produktlinie" (Drill-through (DimProduct.Category))
- Von „Detail Produktlinie" (mk_btn01) nach „Übersicht" (Seitenwechsel)

## Kennzahlen-Steckbrief

| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |
|---|---|---|---|---|---|---|---|
| _Measures.Kosten | – | [ausfüllen] | #,##0 | – | – | – | ☐ |
| _Measures.PL | – | Plan | #,##0 | – | – | – | ☐ |
| _Measures.Marge | – | Umsatz − Kosten | #,##0 | – | – | – | ☐ |
| DimProduct.Category | – | Produktlinie | – | – | – | – | ☐ |
| _Measures.AC | – | Ist | #,##0 | – | – | – | ☐ |
| DimDate.Month | – | Monatsname, sortiert nach MonthKey | – | – | – | – | ☐ |
| DimDate.IsForecast | – | 1 = Forecast-Monat, 0 = Ist | – | – | – | – | ☐ |
| _Measures.Umsatz | Nettoerlös | [ausfüllen] | T€ | +5 % vs PL | Controlling | DWH | ☑ |
| _Measures.Marge% | – | [ausfüllen] | 0.0% | – | – | – | ☐ |
| DimProduct.Product | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.PY | – | Vorjahr | #,##0 | – | – | – | ☐ |
| DimDate.Year | – | [ausfüllen] | – | – | – | – | ☐ |
| DimRegion.Region | – | [ausfüllen] | – | – | – | – | ☐ |

### Neu zu erstellen

| Feld | Art | Tabelle | Beschreibung / Logik | Einheit | Ziel | Owner | Quelle | Offene Frage |
|---|---|---|---|---|---|---|---|---|
| Deckungsbeitrag | Kennzahl | _Measures | Umsatz minus Kosten | T€ | > 30 % | Controlling | DWH | Inklusive Boni? |

## Offene Punkte

- [ ] Deckungsbeitrag: Inklusive Boni?
- [ ] Übersicht / Umsatz je Region: Absteigend nach AC sortieren.
- [ ] Übersicht: Pflichtrolle „Kennzahl" leer
- [ ] Detail Produktlinie: „Detail: gewählte Produktlinie" hat keinen Text; Kachel käme leer im Bericht an
- [ ] Detail Produktlinie: Pflichtrolle „Zeit / Periode" leer
- [ ] _Measures.Umsatz: Definition mit Vertrieb abgleichen

## Hinweise

- Seite ohne Fragestellung / Kernbotschaft
- Fachbereich möchte „Umsatz" in „Nettoerlös" umbenennen

## Nächste Schritte

- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen
- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen
- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen
