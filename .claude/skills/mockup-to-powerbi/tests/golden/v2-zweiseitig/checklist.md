# Checkliste vor dem Schreiben

Mockup: **Management Report · Beispiel** · specVersion 2 (gelesen als v3) · Hash `02f4ddc3` · 2 Seite(n) · Canvas 1280×720 (uiScale ×1.0)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | **offen** |
| Ziel | **offen** |
| Entscheidung | **offen** |
| Teilnehmende | – |
| Version / Datenstand | 0.1 / **offen** |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `border`, Ecken 8 px, Hintergrund #FFFFFF
- Seitenhintergrund #F4F4F1 · Akzent #C25A2D
- Kopfband-Stil `light` · Schriftfaktor ×1.0 (Visual-Titel ≈ 12 pt)

## Umfang

- Visuals gesamt: 12 (ChartKitchen 6 · nativ 6 · Deneb 0)
- Slicer je Seite: 2 (Filter-Modus `burger`)
- Verknüpfungen: 1 (1 Drill-through, 0 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb |
|---|---|---|---|---|---|---|---|
| Übersicht | `Ubersicht/` | – | 4 | 1 | 12 | 4 | 0 |
| Detail Produktlinie | `Detail_Produktlinie/` | – | 4 | 1 | 12 | 2 | 0 |

## Offene Punkte aus der Spec (`issues`)

| Schwere | Code | Seite | Kachel | Text |
|---|---|---|---|---|
| info | `PAGE_NO_QUESTION` | Übersicht | – | Seite ohne Fragestellung / Kernbotschaft |
| info | `PAGE_NO_QUESTION` | Detail Produktlinie | – | Seite ohne Fragestellung / Kernbotschaft |

## Hinweise aus dem Chrome-Aufbau

- [ ] Filter-Overlay: Panel, Ueberschrift, Schliessen-Button und Slicer liegen ueber dem Inhalt und sind im Grundzustand ausgeblendet. Lesezeichen und Button-Aktionen stehen in navigation.md.
- [ ] Kachel „Kommentar" (p1_v07_Kommentar) hat keinen Text — im Bericht steht sonst der Titel. Text im Workshop nachtragen.
- [ ] Kachel „Detail: gewählte Produktlinie" (p2_v01_Detail_gewahlte_Produktlinie) hat keinen Text — im Bericht steht sonst der Titel. Text im Workshop nachtragen.

## ChartKitchen-Rollen-Mapping

- [ ] [Übersicht / p1_v06_Umsatz_AC_FC_vs_PL_je_Monat] `fcFlag` muss die **Zahl** 1/0 liefern, kein Boolean (DimDate.IsForecast pruefen).

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `POLARITY`: 1

## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen (`te list`, nicht per Regex)

| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt | neu |
|---|---|---|---|---|---|---|---|---|---|---|
| `DimDate.IsForecast` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimDate.Month` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimDate.Year` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimProduct.Category` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimProduct.Product` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimRegion.Region` | column | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.AC` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Deckungsbeitrag` | measure | – | – | – | – | – | – | – | ☐ | ja |
| `_Measures.Kosten` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Marge` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Marge%` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.PL` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.PY` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Umsatz` | measure | – | – | – | – | – | – | – | ☐ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
