# Checkliste vor dem Schreiben

Mockup: **Treue-Testfall B1** · specVersion 3 (gelesen als v3) · Hash `fidelityb1` · 1 Seite(n) · Canvas 1920×1080 (uiScale ×1.5)

## Berichtskopf

| | |
|---|---|
| Zielgruppe | Controlling |
| Ziel | Übergabe Kitchen → Power BI prüfen |
| Entscheidung | **offen** |
| Teilnehmende | – |
| Version / Datenstand | 0.6 / **offen** |

## Gestaltung (aus `design`, geht in die Container-Formatierung bzw. das Theme-Fragment)

- Kacheln: Stil `border`, Ecken 12 px, Hintergrund #FFFFFF
- Seitenhintergrund #F4F4F1 · Akzent #C25A2D
- Kopfband-Stil `light` (Fläche #FFFFFF, Text #0F1E2E) · Schriftfaktor ×1.5 (Visual-Titel siehe Typografie)
- Varianz-Palette `ibcs`: gut #3A9A5B · schlecht #C8412F · Ink #0F1E2E · dunkler Modus nein
- Typografie (`design.typography`, Basis 1280px, Skalierung ×1.0, k = 1.5): Titel 18.0 px → **13.5 pt**, Untertitel 14.25 px → **10.5 pt**, Diagrammbeschriftung 13.5 px → **10 pt** (pt = px × 0,75). Geht als `title`/`subTitle.fontSize` in `chrome-batch.json` und als `textClasses` in `theme-fragment.json`.

## Umfang

- Visuals gesamt: 12 (ChartKitchen 8 · nativ 3 · Deneb 0)
- Slicer je Seite: 3 (Filter-Modus `burger`)
- Filterbereich: Überschrift „Filter" · Hinweistext „Werte in Tsd. EUR"
- Slicer-Arten: Region → Dropdown (`data.mode = Dropdown`) · Category → Liste (`data.mode = Basic`, `general.orientation = 0`) · Year → Dropdown (`data.mode = Dropdown`)
- Seitennavigation: aus
- Verknüpfungen: 0 (0 Drill-through, 0 Seitenwechsel)

| Seite | Ordner | Fragestellung | native Visuals + Slicer | Text/Button | Chrome | CK | Deneb | Custom |
|---|---|---|---|---|---|---|---|---|
| Fidelity | `Fidelity/` | Kommt das Kitchen-Bild an? | 10 | 0 | 13 | 8 | 0 | 1 |

## Offene Punkte aus der Spec (`issues`)

- keine

## Hinweise aus dem Chrome-Aufbau

- [ ] Kopfband ohne Seitennavigation (`navPosition: "off"`) — es werden keine `chrome_nav_*`-Buttons angelegt. Seitenwechsel laeuft ueber die Registerkarten.
- [ ] Filter-Overlay: Panel, Ueberschrift, Schliessen-Button und Slicer liegen ueber dem Inhalt und werden ausgeblendet angelegt (`pbir visuals hide` in analysis-commands.sh). Lesezeichen und Button-Aktionen stehen in navigation.md.

## ChartKitchen-Rollen-Mapping

- [ ] [Fidelity / mk_spark1] Typ `sparktable`: ChartKitchen `table` zeichnet keine Sparkline je Zeile; die Zeitrolle wird zweite Ebene der Kategorie. Sparkline nur nativ (Tabelle → Sparklines in Desktop) oder als eigenes Visual.
- [ ] [Fidelity / mk_bars1] Kernaussage gesetzt: ChartKitchen zeigt sie im IBCS-Kopf, der an den Titel Einheit, Zeitraum und Szenarien („· Jan – Dez: AC vs. PL") anhaengt — das Kitchen zeigt nur den Titel.

## Custom Visuals (`engine: "custom"`)

`pbir add visual` kennt diese GUIDs nicht — die Kacheln stehen deshalb **nicht** in `pbir-visuals.json`, sondern als fertige `visual.json` in `<Seitenslug>/custom-visuals/`. Die `.pbiviz` muss **vorher** im Bericht importiert sein, sonst lädt das Visual nicht.

| Seite | Kachel | Visual | GUID | .pbiviz | Rollen |
|---|---|---|---|---|---|
| Fidelity | Umsatz (`mk_kpi1`) | ibcsKpiCard | `ibcsKpiCard2771CF65D0C343A19EAB34E43D7B8682` | `ibcsKpiCard/dist/ibcsKpiCard*.2.3.0.0.pbiviz` | `ac`: _Measures.AC, `py`: _Measures.PY, `trend`: DimDate.MonthName |

- Pflichtrollen aller Custom Visuals belegt.

## Analyse-Angaben ohne direkten pbir-Befehl

Vollständig in [`analysis-todos.md`](analysis-todos.md) — hier nur die Zahl je Code:

- `CK_NO_NATIVE`: 3

## Kennzahlen-Steckbrief (`fields`) — gegen das Modell prüfen (`te list`, nicht per Regex)

| Feld | Art | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt | neu |
|---|---|---|---|---|---|---|---|---|---|---|
| `DimDate.MonthName` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimDate.Year` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimProduct.Category` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimProduct.Product` | column | – | – | – | – | – | – | – | ☐ | nein |
| `DimRegion.Region` | column | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.AC` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Kosten` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.PL` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.PY` | measure | – | – | – | – | – | – | – | ☐ | nein |
| `_Measures.Umsatz` | measure | – | – | – | – | – | – | – | ☐ | nein |

> Ein einziges fehlendes Feld lässt `pbir add visual --from-json` die komplette Datei ablehnen ('no visuals were created'). Erst Modell, dann Report. Nicht bestätigte Definitionen (☐) im Workshop klären — sie sind der häufigste Grund für „die Zahl stimmt nicht".
