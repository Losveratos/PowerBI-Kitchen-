# Workshop-Dokumentation · Typografie- und Filter-Testfall

Stand: <datum> · Version 0.4.4 · Spec-Hash `typofilter1` · erstellt mit MockupKitchen byDatenWG 0.4.4

| | |
|---|---|
| Teilnehmende | Controlling, Vertrieb |
| Zielgruppe | Geschäftsführung |
| Ziel des Berichts | Umsatz und Kosten je Region auf Full HD |
| Entscheidung | Wo wird nachgesteuert? |
| Datenstand / Aktualisierung | monatlich |
| Seiten | Übersicht · Detail |
| Datenmodell | Demo-Modell (3 Tabellen) |

## Entscheidungen zur Gestaltung

- Format 1920 × 1080 px (Full HD).
- Kopfband „Vertrieb 2026" · Umsatz und Kosten je Region, Stil dark, Logo links.
- Filter als Panel rechts: Year (Dropdown, Vorauswahl 2026), Region (Kacheln), Date (Datumsbereich); Überschrift „Auswahl", Hinweis „Alle Werte in Tsd. EUR. Stand: Vormonat.".
- Fußleiste „Quelle: DWH · Stand Vormonat".
- Kacheln gerundet (6 px), mit feinem Rahmen, Seitenhintergrund #F4F4F1, Akzent #C25A2D.
- Varianz-Palette Teal (Petrol / Rot): gut #1E8F9E, schlecht #D64541. Schriftfarbe #0F1E2E.
- Typografie: Basis 1280px, Skalierung ×1.1: Kacheltitel 21.45 px (16 pt), Untertitel 16.5 px (12.5 pt), Diagrammbeschriftung 14.85 px (11 pt) bei 1920 px Seitenbreite; eigene Skalierung: Umsatz je Region ×1.3, AC vs. PL je Monat ×0.85.
- Seitennavigation in der Fußleiste (rechts): Übersicht · Detail.

## Seite 1 · Übersicht

**Fragestellung:** Wo stehen Umsatz und Kosten je Region?

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 1.1 | Umsatz (Tsd. EUR) | Karte (nativ) | Kennzahl: Umsatz | – | – | offen | – |
| 1.2 | Umsatz je Region (Ist, Tsd. EUR) | Säulendiagramm (nativ) | Kategorie / Zeit: Region; AC · Ist-Wert: Umsatz | – | – | offen | Größere Schrift: Hauptkachel der Seite. |
| 1.3 | Hinweis | Text | – | – | – | offen | Text: Die Regionen sind nach Umsatz sortiert. |
| 1.4 | Kosten je Region | Balkendiagramm (nativ) | Kategorie / Zeit: Region; AC · Ist-Wert: Kosten | kleiner = besser | – | offen | – |

## Seite 2 · Detail

**Fragestellung:** Wie läuft AC gegen Plan im Jahresverlauf?

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 2.1 | AC vs. PL je Monat | Säulen (IBCS), AC/PL, ChartKitchen | Kategorie / Zeit: Month; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PL | – | – | offen | – |
| 2.2 | Regionen im Detail | Matrix (nativ) | Zeilen: Region; Werte: AC, PL | – | – | offen | – |

## Kennzahlen-Steckbrief

| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |
|---|---|---|---|---|---|---|---|
| _Measures.Umsatz | Nettoerlös | Nettoumsatz | EUR | – | Controlling | ERP | ☑ |
| _Measures.Kosten | – | [ausfüllen] | #,##0 | – | – | – | ☐ |
| _Measures.AC | – | Ist | #,##0 | – | – | – | ☐ |
| _Measures.PL | – | Plan | #,##0 | – | – | – | ☐ |
| DimRegion.Region | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Month | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Year | – | [ausfüllen] | – | – | – | – | ☐ |
| DimDate.Date | – | [ausfüllen] | – | – | – | – | ☐ |

## Barrierefreiheit

Befunde der Barrierefreiheits-Prüfung aus dem Mockup-Tool. **1 Fehler ist ein Blocker:** vor dem Bau beheben oder ausdrücklich akzeptieren (mit Begründung).

- [ ] **Blocker** · `A11Y_TILE_SMALL` (Fehler) · Übersicht · mk_kpi1: Kachel „Umsatz" ist zu klein (516×180px) (Unter ca. 540×200px ist ein Diagramm praktisch nicht mehr nutzbar. Kachel vergrößern.)
- [ ] `A11Y_CONTRAST_ACCENT` (Warnung): Akzentfarbe gegen Kachelgrund zu schwach (2.8:1, Ziel ≥ 3:1) (Die Akzentfarbe kennzeichnet aktive Nav-Buttons und Hervorhebungen — bei zu wenig Kontrast wirken diese unauffällig.)

## Offene Punkte

- [ ] keine offenen Punkte erfasst

## Hinweise

- Beispiel-Hinweis ohne Bezug zur Barrierefreiheit.

## Nächste Schritte

- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen
- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen
- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen
