# Workshop-Dokumentation · Custom-Visual-Testfall

Stand: <datum> · Version 0.4 · Spec-Hash `customvis` · erstellt mit MockupKitchen byDatenWG 0.4

| | |
|---|---|
| Teilnehmende | Controlling, PMO |
| Zielgruppe | Projektleitung und GF |
| Ziel des Berichts | Projektfortschritt und Ergebnis auf einer Seite |
| Entscheidung | Wird das Rollout-Budget freigegeben? |
| Datenstand / Aktualisierung | monatlich, 5. Werktag |
| Seiten | Projekt & GuV |
| Datenmodell | Test.SemanticModel (3 Tabellen) |

## Entscheidungen zur Gestaltung

- Format 1280 × 720 px (HD).
- Kopfband „Rollout 2026" · Projekt und Ergebnis, Stil custom, Logo ohne.
- Filter keine.
- Fußleiste „Stand: 5. Werktag · Quelle: DWH".
- Kacheln gerundet (8 px), mit feinem Rahmen, Seitenhintergrund #F7F4EF, Akzent #E07B39.
- Varianz-Palette IBCS (Gruen / Rot): gut #3A9A5B, schlecht #C8412F. Schriftfarbe #1F2933.

## Seite 1 · Projekt & GuV

**Fragestellung:** Liegt das Rollout im Plan und was kostet es?

**Notizen:** Gantt links, GuV rechts.

| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |
|---|---|---|---|---|---|---|---|
| 1.1 | Projektplan (Rollout 2026) | Gantt (dataKitchenGantt) | Kategorie / Zeit: Task; Start: Start; Ende: Ende; Reihe / Legende: Phase | – | – | offen | Basisplan spaeter als planStart/planEnd nachziehen. |
| 1.2 | GuV nach Ebenen | GuV (pnlByDatenWG), AC/PY/PL/FC | Zeilen: L1, L2; AC · Ist-Wert: AC; Referenz (PL / PY / BU): PY, PL; FC-Flag (1/0): FC; Zeilentyp (Position / Summe / Formel): RowType | T€, K, 0 dec | Must | abgestimmt | – |
| 1.3 | Meilensteine | Gantt (dataKitchenGantt) | Kategorie / Zeit: Task; Reihe / Legende: Meilenstein | – | – | offen | – |
| 1.4 | Umsatz AC | Karte | Kennzahl: AC | – | – | offen | – |

## Custom Visuals

Diese Kacheln sind Custom Visuals aus dem Repository. Die passende `.pbiviz` muss im Bericht importiert sein, sonst bleibt die Kachel leer.

- Seite 1 · **Projektplan** — `dataKitchenGantt` (dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44)
  - `end`: DimTask.Ende, `phase`: DimTask.Phase, `start`: DimTask.Start, `task`: DimTask.Task
- Seite 1 · **GuV nach Ebenen** — `pnlByDatenWG` (pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358)
  - `ac`: _Measures.AC, `fc`: _Measures.FC, `levels`: DimAccount.L1, DimAccount.L2, `pl`: _Measures.PL, `py`: _Measures.PY, `rowType`: DimAccount.RowType
- Seite 1 · **Meilensteine** — `dataKitchenGantt` (dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44)
  - `phase`: DimTask.Meilenstein, `task`: DimTask.Task

## Kennzahlen-Steckbrief

| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |
|---|---|---|---|---|---|---|---|
| DimTask.Task | – | [ausfüllen] | – | – | – | – | ☐ |
| DimTask.Start | – | [ausfüllen] | – | – | – | – | ☐ |
| DimTask.Ende | – | [ausfüllen] | – | – | – | – | ☐ |
| DimTask.Phase | – | [ausfüllen] | – | – | – | – | ☐ |
| DimTask.Meilenstein | – | [ausfüllen] | – | – | – | – | ☐ |
| DimAccount.L1 | – | [ausfüllen] | – | – | – | – | ☐ |
| DimAccount.L2 | – | [ausfüllen] | – | – | – | – | ☐ |
| DimAccount.RowType | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.AC | Ist | Summe Ist-Umsatz | T€ | – | Controlling | DWH | ☑ |
| _Measures.PY | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.PL | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.FC | – | [ausfüllen] | – | – | – | – | ☐ |
| _Measures.Marge (neu) | – | Deckungsbeitrag in Prozent | % | – | Controlling | Workshop | ☐ |

### Neu zu erstellen

| Feld | Art | Tabelle | Beschreibung / Logik | Einheit | Ziel | Owner | Quelle | Offene Frage |
|---|---|---|---|---|---|---|---|---|
| Marge | Kennzahl | _Measures | Deckungsbeitrag in Prozent | % | > 32 % | Controlling | Workshop | Vor oder nach Projektkosten? |

## Offene Punkte

- [ ] Marge: Vor oder nach Projektkosten?
- [ ] Projekt & GuV: Pflichtrolle „Start (Datum)“ ist leer — das Visual zeichnet nichts.
- [ ] Projekt & GuV: Pflichtrolle „Ende (Datum, leer = Meilenstein)“ ist leer.

## Nächste Schritte

- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen
- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen
- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen
