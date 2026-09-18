# Beispiele — echte Tool-Ausgaben zum Trockenlauf

Alles hier ist **Original-Export aus MockupKitchen byDatenWG** — mit einer
benannten Ausnahme: `mockup-spec.v3.json` wurde um eine dritte Seite mit den
beiden Custom Visuals aus Tool 0.4 ergänzt (siehe Tabelle). Damit lässt sich der
Skill ohne PBIP ausprobieren und die Spec-Beschreibung gegenlesen.

| Datei | Was es ist |
|---|---|
| [`mockup-spec.v3.json`](mockup-spec.v3.json) | **Aktueller Stand (specVersion 3).** „Management Report · Beispiel": drei Seiten (Übersicht, Detail Produktlinie, Projekt & GuV), helles Kopfband mit Logo rechts, Burger-Filter mit zwei Slicern (Year mit Vorauswahl 2026), Fußleiste, Drill-through von der Brücke auf die Detailseite, 15 Kacheln (9 ChartKitchen, 4 nativ, **2 Custom Visuals**), Berichtskopf, Analyse-Block je Kachel, Kennzahlen-Steckbriefe, vier `issues`. Die dritte Seite und die `design`-Schlüssel `variancePalette`/`varianceColors`/`colors` sind **von Hand ergänzt**, um die Neuerungen aus Tool 0.4 zu zeigen; `meta.specHash` (`4d42e99d`) stammt noch vom 0.3-Export und passt deshalb nicht mehr zum Inhalt. |
| [`AGENT-BRIEF.v3.md`](AGENT-BRIEF.v3.md) | Die menschenlesbare Fassung der Spec **im 0.3-Stand** (ohne die dritte Seite) (`buildBrief`): Berichtskopf, Zonen-Tabelle mit Maßen, je Kachel Typ, Engine, Position, stabile ID, Rollen, pbir-Buckets, Analyse und Workshop-Status, Navigation mit Drill-Feld, Steckbrief-Tabelle, Umsetzungsregeln, offene Punkte. |
| [`WORKSHOP-DOKU.v3.md`](WORKSHOP-DOKU.v3.md) | Das Workshop-Protokoll (`buildDocs`) im 0.3-Stand: Kopftabelle, Gestaltungsentscheidungen, je Seite Fragestellung und Kachel-Tabelle mit Analyse/Prio/Status, Steckbrief, offene Punkte, nächste Schritte. So sieht die Datei aus, die `mockup_to_docs.py` erzeugt, wenn sie fehlt. |
| [`mockup-spec.v2.json`](mockup-spec.v2.json) | Vorgängerformat: mehrseitig, mit `design` und `links`, aber ohne stabile IDs, Analyse-Block und Steckbriefe. Der Konverter hebt sie intern auf v3 — gut, um die Übernahme zu prüfen. |
| [`mockup-spec.json`](mockup-spec.json) | Das alte einseitige Format (specVersion 1). Seitenname kommt aus `page.name`, per `--page-name` überschreibbar. |
| [`pbir-visuals.json`](pbir-visuals.json) | Eine Tool-Ausgabe im `--from-json`-Format von `pbir add visual` (zur v1-Spec). Zeigt die erlaubten Schlüssel — mehr darf nicht drinstehen. |

Es fehlen die `page-<Index>-<Slug>.png`: Seitenbilder sind Binärdateien und
gehören nicht in den Skill. Legt der Mensch sie neben seine Spec, bettet
`mockup_to_docs.py` sie in die Folien ein.

## Trockenlauf ohne PBIP

```bash
S=.claude/skills/mockup-to-powerbi

python $S/scripts/mockup_to_pbir.py $S/references/example/mockup-spec.v3.json --validate
python $S/scripts/mockup_to_pbir.py $S/references/example/mockup-spec.v3.json \
  --out /tmp/mockup-out --report "Demo.Report" --plan
python $S/scripts/mockup_to_docs.py $S/references/example/mockup-spec.v3.json \
  --out /tmp/mockup-out --no-pptx
```

Was dabei auffällt und so gewollt ist:

- Die Kachel „Deckungsbeitrag" hat eine **leere Pflichtrolle** und steht deshalb
  nicht in `pbir-visuals.json` — sie taucht in `checklist.md` unter „Nicht
  gebaute Kacheln" auf.
- Die Spec verweist auf `DimDate.Month` und `DimDate.IsForecast`. Im Testmodell
  `PBI-IBCS-Testbed` gibt es die so **nicht** (dort heißen sie `MonthName`/
  `MonthNo`). Genau dafür ist Schritt 1 da: jede `ref` gegen `te list` prüfen und
  Abweichungen als offene Entscheidung vorlegen, statt sie umzudeuten.
- Neun Kacheln sind ChartKitchen. Ohne Referenz-Instanz im Report bleiben sie
  Slots; die Abnahme (`mockup_verify.py`) meldet sie als „offen", nicht als
  Fehler.
- Die Seite „Projekt & GuV" hat zwei **Custom Visuals** (`dataKitchenGantt`,
  `pnlByDatenWG`). Sie stehen nicht in `pbir-visuals.json`, sondern als fertige
  `visual.json` unter `Projekt_GuV/custom-visuals/` — `pbir add visual` kennt
  diese GUIDs nicht. Der Ablauf steht in `Projekt_GuV/custom-commands.sh`; die
  `.pbiviz` muss vorher im Bericht importiert sein.

Dieselben Dateien liegen als Fixtures unter [`../../tests/fixtures/`](../../tests/fixtures/),
zusammen mit vier zusätzlichen Fällen (voller Analyse-Block, ChartKitchen ohne
Referenz-Instanz, Custom Visuals mit `variancePalette: "ibcs"` und
`headerStyle: "custom"`, kaputte Spec) für `tests/run_tests.py`.
