# Checkliste vor dem Schreiben

Mockup: **Analyse-Testfall** · specVersion 3 (gelesen als v3) · Hash `testhash` · 2 Seite(n) · Canvas 1280×720 (uiScale ×1.0)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | Vertriebsleitung |
| Ziel | Monatliche Steuerung Umsatz und Marge |
| Entscheidung | Maßnahmen bei Planabweichung > 5 % |
| Teilnehmende | M. Tenner, Controlling, Vertrieb |
| Version / Datenstand | 0.1 / **offen** |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `shadow`, Ecken 12 px, Hintergrund #FFFFFF
- Seitenhintergrund #EEF1F5 · Akzent #C25A2D
- Kopfband-Stil `light` · Schriftfaktor ×1.0 (Visual-Titel ≈ 12 pt)

## Umfang

- Visuals gesamt: 16 (ChartKitchen 11 · nativ 5 · Deneb 0)
- Slicer je Seite: 2 (Filter-Modus `right`)
- Verknüpfungen: 2 (1 Drill-through, 1 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb |
|---|---|---|---|---|---|---|---|
| Übersicht | `Ubersicht/` | Liegen wir im Plan? | 4 | 1 | 10 | 6 | 0 |
| Detail Produktlinie | `Detail_Produktlinie/` | – | 2 | 2 | 10 | 5 | 0 |

## Offene Punkte aus der Spec (`issues`)

| Schwere | Code | Seite | Kachel | Text |
|---|---|---|---|---|
| warn | `ROLE_EMPTY` | Übersicht | mk_7ixiebk | Pflichtrolle „Kennzahl" leer |
| warn | `TEXT_EMPTY` | Detail Produktlinie | mk_p6km182 | „Detail: gewählte Produktlinie" hat keinen Text; Kachel käme leer im Bericht an |
| warn | `ROLE_EMPTY` | Detail Produktlinie | mk_6g7nfw6 | Pflichtrolle „Zeit / Periode" leer |
| info | `PAGE_NO_QUESTION` | Detail Produktlinie | – | Seite ohne Fragestellung / Kernbotschaft |
| info | `RENAME_REQUEST` | – | – | Fachbereich möchte „Umsatz" in „Nettoerlös" umbenennen |

## Hinweise aus dem Chrome-Aufbau

- [ ] Kachel „Detail: gewählte Produktlinie" (mk_p6km182) hat keinen Text — im Bericht steht sonst der Titel. Text im Workshop nachtragen.

## ChartKitchen-Rollen-Mapping

- [ ] [Übersicht / mk_kv12rex] `fcFlag` muss die **Zahl** 1/0 liefern, kein Boolean (DimDate.IsForecast pruefen).
- [ ] [Übersicht / mk_wf01] Modus `waterfall` braucht die Rolle `rowType` (sum/delta je Zeile). Das Mockup kennt die Rolle nicht — Spalte im Modell bereitstellen und im Visual binden, sonst bleibt die Bruecke leer.
- [ ] [Übersicht / mk_wf01] Szenario `AC/PL/FC` nennt FC, aber weder eine `fcFlag`-Spalte (Zahl 1/0) noch eine `forecast`-Kennzahl ist gebunden. Eines von beidem nachziehen, sonst zeichnet ChartKitchen keinen Forecast.
- [ ] [Detail Produktlinie / mk_cl01] Typ `colline`: die zweite Kennzahl gehoert in `lineMeasure` (nur `orientation=columns`), nicht in `plan`/`previousYear`. Mapping vor dem Binden korrigieren.

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `CK_INVERT`: 1
- `CUMULATIVE`: 1
- `DELTA_BASIS`: 2
- `DISPLAY_UNITS_SLOT`: 1
- `MESSAGE`: 1
- `POLARITY`: 1
- `SCALE_GROUP`: 2
- `SLICER_DEFAULT`: 2
- `SORT_NOT_NATIVE`: 2
- `TIME_GRAIN`: 2
- `UNIT`: 1

## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen (`te list`, nicht per Regex)

| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt | neu |
|---|---|---|---|---|---|---|---|---|---|---|
| `DimDate.IsForecast` | column | – | 1 = Forecast-Monat, 0 = Ist | – | – | – | – | – | ☐ | nein |
| `DimDate.Month` | column | – | Monatsname, sortiert nach MonthKey | – | – | – | – | – | ☐ | nein |
| `DimDate.Year` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimProduct.Category` | column | – | Produktlinie | – | – | – | – | – | ☐ | nein |
| `DimProduct.Product` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimRegion.Region` | column | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.AC` | measure | – | Ist | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.Kosten` | measure | – | – | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.Marge` | measure | – | Umsatz − Kosten | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.Marge%` | measure | – | – | 0.0% | – | – | – | – | ☐ | nein |
| `_Measures.PL` | measure | – | Plan | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.PY` | measure | – | Vorjahr | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.Umsatz` | measure | Nettoerlös (umbenennen) | – | #,##0 | T€ | Controlling | DWH | +5 % vs PL | ☑ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
