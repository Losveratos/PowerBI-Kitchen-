# Checkliste vor dem Schreiben

Mockup: **Typografie- und Filter-Testfall** · specVersion 3 (gelesen als v3) · Hash `typofilter1` · 2 Seite(n) · Canvas 1920×1080 (uiScale ×1.5)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | Geschäftsführung |
| Ziel | Umsatz und Kosten je Region auf Full HD |
| Entscheidung | Wo wird nachgesteuert? |
| Teilnehmende | Controlling, Vertrieb |
| Version / Datenstand | 0.4.4 / monatlich |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `border`, Ecken 6 px, Hintergrund #FFFFFF
- Seitenhintergrund #F4F4F1 · Akzent #C25A2D
- Kopfband-Stil `dark` (Fläche #0F1E2E, Text #FFFFFF) · Schriftfaktor ×1.5 (Visual-Titel siehe Typografie)
- Varianz-Palette `teal`: gut #1E8F9E · schlecht #D64541 · Ink #0F1E2E · dunkler Modus nein
- Typografie (`design.typography`, Basis 1280px, Skalierung ×1.1, k = 1.5): Titel 21.45 px → **16 pt**, Untertitel 16.5 px → **12.5 pt**, Diagrammbeschriftung 14.85 px → **11 pt** (pt = px × 0,75). Geht als `title`/`subTitle.fontSize` in `chrome-batch.json` und als `textClasses` in `theme-fragment.json`.
- Kacheln mit eigener Schrift-Skalierung: `mk_col1` ×1.3 (Titel 21 pt), `mk_ck1` ×0.85 (Titel 13.5 pt)

## Umfang

- Visuals gesamt: 6 (ChartKitchen 1 · nativ 5 · Deneb 0)
- Slicer je Seite: 3 (Filter-Modus `right`)
- Filterbereich: Überschrift „Auswahl" · Hinweistext „Alle Werte in Tsd. EUR. Stand: Vormonat."
- Slicer-Arten: Year → Dropdown (`data.mode = Dropdown`) · Region → Kacheln (horizontal) (`data.mode = Basic`, `general.orientation = 1`) · Date → Datumsbereich (`data.mode = Between`)
- Seitennavigation: in der Fußleiste (rechtsbündig, Schrift ca. 9,5 px × k)
- Verknüpfungen: 0 (0 Drill-through, 0 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb | Custom |
|---|---|---|---|---|---|---|---|---|
| Übersicht | `Ubersicht/` | Wo stehen Umsatz und Kosten je Region? | 6 | 1 | 10 | 0 | 0 | 0 |
| Detail | `Detail/` | Wie läuft AC gegen Plan im Jahresverlauf? | 4 | 0 | 10 | 1 | 0 | 0 |

## Barrierefreiheit

Befunde der Barrierefreiheits-Prüfung im Tool (Kontrast, Schriftgrößen, Kachelgrößen, Titel, Dichte, Lesereihenfolge, Navigation, Slicer-Beschriftung). **1 Fehler ist ein Blocker:** vor dem Bau im Mockup beheben oder vom Menschen ausdrücklich akzeptieren lassen (Begründung notieren).

| | Schwere | Code | Seite | Kachel | Befund |
|---|---|---|---|---|---|
| ☐ **Blocker** | error | `A11Y_TILE_SMALL` | Übersicht | mk_kpi1 | Kachel „Umsatz" ist zu klein (516×180px) (Unter ca. 540×200px ist ein Diagramm praktisch nicht mehr nutzbar. Kachel vergrößern.) |
| ☐ | warn | `A11Y_CONTRAST_ACCENT` | – | – | Akzentfarbe gegen Kachelgrund zu schwach (2.8:1, Ziel ≥ 3:1) (Die Akzentfarbe kennzeichnet aktive Nav-Buttons und Hervorhebungen — bei zu wenig Kontrast wirken diese unauffällig.) |

## Offene Punkte aus der Spec (`issues`)

| Schwere | Code | Seite | Kachel | Text |
|---|---|---|---|---|
| info | `REPORT_NO_DECISION` | – | – | Beispiel-Hinweis ohne Bezug zur Barrierefreiheit. |

## Hinweise aus dem Chrome-Aufbau

- [ ] Seitennavigation in der Fußleiste (`navPosition: "footer"`): 2 Buttons `chrome_nav_*` rechtsbündig, Schrift 14.5 pt; das Kopfband bleibt ohne Nav.
- [ ] Slicer „Date" ist ein Datumsbereich: `DimDate.Date` muss vom Typ Date/DateTime sein, sonst zeigt Power BI keinen Kalender (`te get`).

## ChartKitchen-Rollen-Mapping

- keine Auffälligkeiten

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `POLARITY`: 1
- `SLICER_DEFAULT`: 2

## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen (`te list`, nicht per Regex)

| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt | neu |
|---|---|---|---|---|---|---|---|---|---|---|
| `DimDate.Date` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimDate.Month` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimDate.Year` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimRegion.Region` | column | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.AC` | measure | – | Ist | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.Kosten` | measure | – | – | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.PL` | measure | – | Plan | #,##0 | – | – | – | – | ☐ | nein |
| `_Measures.Umsatz` | measure | Nettoerlös | Nettoumsatz | #,##0 | EUR | Controlling | ERP | – | ☑ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
