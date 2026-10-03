# Checkliste vor dem Schreiben

Mockup: **Nur ChartKitchen** · specVersion 3 (gelesen als v3) · Hash `ckhash` · 1 Seite(n) · Canvas 1280×720 (uiScale ×1.0)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | GF |
| Ziel | Monatliche Steuerung Umsatz und Marge |
| Entscheidung | Maßnahmen bei Planabweichung > 5 % |
| Teilnehmende | M. Tenner, Controlling, Vertrieb |
| Version / Datenstand | 0.1 / **offen** |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `shadow`, Ecken 12 px, Hintergrund #FFFFFF
- Seitenhintergrund #EEF1F5 · Akzent #C25A2D
- Kopfband-Stil `light` (Fläche #FFFFFF, Text #0F1E2E) · Schriftfaktor ×1.0 (Visual-Titel ≈ 12 pt)
- Varianz-Palette `teal`: gut #1E8F9E · schlecht #D64541 · Ink #0F1E2E · dunkler Modus nein

## Umfang

- Visuals gesamt: 5 (ChartKitchen 2 · nativ 0 · Deneb 0)
- Slicer je Seite: 2 (Filter-Modus `burger`)
- Verknüpfungen: 0 (0 Drill-through, 0 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb | Custom |
|---|---|---|---|---|---|---|---|---|
| Übersicht | `Ubersicht/` | Liegen wir im Plan? | 2 | 0 | 13 | 2 | 0 | 3 |

## Offene Punkte aus der Spec (`issues`)

| Schwere | Code | Seite | Kachel | Text |
|---|---|---|---|---|
| warn | `ROLE_EMPTY` | Übersicht | mk_7ixiebk | Pflichtrolle „Kennzahl" leer |
| warn | `TEXT_EMPTY` | Detail Produktlinie | mk_p6km182 | „Detail: gewählte Produktlinie" hat keinen Text; Kachel käme leer im Bericht an |
| warn | `ROLE_EMPTY` | Detail Produktlinie | mk_6g7nfw6 | Pflichtrolle „Zeit / Periode" leer |
| info | `PAGE_NO_QUESTION` | Detail Produktlinie | – | Seite ohne Fragestellung / Kernbotschaft |

## Hinweise aus dem Chrome-Aufbau

- [ ] Filter-Overlay: Panel, Ueberschrift, Schliessen-Button und Slicer liegen ueber dem Inhalt und werden ausgeblendet angelegt (`pbir visuals hide` in analysis-commands.sh). Lesezeichen und Button-Aktionen stehen in navigation.md.

## ChartKitchen-Rollen-Mapping

- [ ] [Übersicht / mk_kv12rex] `fcFlag` muss die **Zahl** 1/0 liefern, kein Boolean (DimDate.IsForecast pruefen).

## Custom Visuals (`engine: "custom"`)

`pbir add visual` kennt diese GUIDs nicht — die Kacheln stehen deshalb **nicht** in `pbir-visuals.json`, sondern als fertige `visual.json` in `<Seitenslug>/custom-visuals/`. Die `.pbiviz` muss **vorher** im Bericht importiert sein, sonst lädt das Visual nicht.

| Seite | Kachel | Visual | GUID | .pbiviz | Rollen |
|---|---|---|---|---|---|
| Übersicht | Umsatz (`mk_5z33e3b`) | ibcsKpiCard | `ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682` | `ibcsKpiCard/dist/ibcsKpiCard*.2.3.0.0.pbiviz` | `ac`: _Measures.Kosten, `pl`: _Measures.PL |
| Übersicht | Deckungsbeitrag (`mk_7ixiebk`) | ibcsKpiCard | `ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682` | `ibcsKpiCard/dist/ibcsKpiCard*.2.3.0.0.pbiviz` | `pl`: _Measures.PL |
| Übersicht | Marge (`mk_ldc3xxy`) | ibcsKpiCard | `ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682` | `ibcsKpiCard/dist/ibcsKpiCard*.2.3.0.0.pbiviz` | `ac`: _Measures.Marge, `pl`: _Measures.PL |

- [ ] [Übersicht / mk_7ixiebk] Pflichtrolle `ac` ist leer — IBCS KPI Card 2.3 zeichnet ohne sie nichts. Feld im Mockup nachtragen oder im Bericht nachbinden.

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `SLICER_DEFAULT`: 1

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
| `_Measures.Umsatz` | measure | Nettoerlös | – | #,##0 | – | – | – | – | ☑ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
