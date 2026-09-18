# Checkliste vor dem Schreiben

Mockup: **Custom-Visual-Testfall** · specVersion 3 (gelesen als v3) · Hash `customvis` · 1 Seite(n) · Canvas 1280×720 (uiScale ×1.0)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | Projektleitung und GF |
| Ziel | Projektfortschritt und Ergebnis auf einer Seite |
| Entscheidung | Wird das Rollout-Budget freigegeben? |
| Teilnehmende | Controlling, PMO |
| Version / Datenstand | 0.4 / monatlich, 5. Werktag |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `border`, Ecken 8 px, Hintergrund #FFFFFF
- Seitenhintergrund #F7F4EF · Akzent #E07B39
- Kopfband-Stil `custom` (Fläche #123B4F, Text #F7FAFC) · Schriftfaktor ×1.0 (Visual-Titel ≈ 12 pt)
- Varianz-Palette `ibcs`: gut #3A9A5B · schlecht #C8412F · Ink #1F2933 · dunkler Modus nein

## Umfang

- Visuals gesamt: 4 (ChartKitchen 0 · nativ 1 · Deneb 0)
- Slicer je Seite: 0 (Filter-Modus `–`)
- Verknüpfungen: 0 (0 Drill-through, 0 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb | Custom |
|---|---|---|---|---|---|---|---|---|
| Projekt & GuV | `Projekt_GuV/` | Liegt das Rollout im Plan und was kostet es? | 1 | 0 | 5 | 0 | 0 | 3 |

## Offene Punkte aus der Spec (`issues`)

| Schwere | Code | Seite | Kachel | Text |
|---|---|---|---|---|
| warn | `ROLE_EMPTY` | Projekt & GuV | mk_gantt2 | Pflichtrolle „Start (Datum)“ ist leer — das Visual zeichnet nichts. |
| warn | `ROLE_EMPTY` | Projekt & GuV | mk_gantt2 | Pflichtrolle „Ende (Datum, leer = Meilenstein)“ ist leer. |

## Hinweise aus dem Chrome-Aufbau

- keine

## ChartKitchen-Rollen-Mapping

- keine Auffälligkeiten

## Custom Visuals (`engine: "custom"`)

`pbir add visual` kennt diese GUIDs nicht — die Kacheln stehen deshalb **nicht** in `pbir-visuals.json`, sondern als fertige `visual.json` in `<Seitenslug>/custom-visuals/`. Die `.pbiviz` muss **vorher** im Bericht importiert sein, sonst lädt das Visual nicht.

| Seite | Kachel | Visual | GUID | .pbiviz | Rollen |
|---|---|---|---|---|---|
| Projekt & GuV | Projektplan (`mk_gantt1`) | dataKitchenGantt | `dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44` | `dataKitchenGantt/dist/*.pbiviz` | `end`: DimTask.Ende, `phase`: DimTask.Phase, `start`: DimTask.Start, `task`: DimTask.Task |
| Projekt & GuV | GuV nach Ebenen (`mk_pnl1`) | pnlByDatenWG | `pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358` | `pnlByDatenWG/dist/*.pbiviz` | `ac`: _Measures.AC, `fc`: _Measures.FC, `levels`: DimAccount.L1, DimAccount.L2, `pl`: _Measures.PL, `py`: _Measures.PY, `rowType`: DimAccount.RowType |
| Projekt & GuV | Meilensteine (`mk_gantt2`) | dataKitchenGantt | `dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44` | `dataKitchenGantt/dist/*.pbiviz` | `phase`: DimTask.Meilenstein, `task`: DimTask.Task |

- [ ] [Projekt & GuV / mk_gantt2] Pflichtrolle `start` ist leer — dataKitchenGantt byDatenWG zeichnet ohne sie nichts. Feld im Mockup nachtragen oder im Bericht nachbinden.

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `DISPLAY_UNITS_SLOT`: 1

## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen (`te list`, nicht per Regex)

| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt | neu |
|---|---|---|---|---|---|---|---|---|---|---|
| `DimAccount.L1` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimAccount.L2` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimAccount.RowType` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimTask.Ende` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimTask.Meilenstein` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimTask.Phase` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimTask.Start` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimTask.Task` | column | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.AC` | measure | Ist | Summe Ist-Umsatz | #,##0 | T€ | Controlling | DWH | – | ☑ | nein |
| `_Measures.FC` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Marge` | measure | – | Deckungsbeitrag in Prozent | – | % | Controlling | Workshop | – | ☐ | ja |
| `_Measures.PL` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.PY` | measure | – | – | – | – | – | – | – | ☐ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
