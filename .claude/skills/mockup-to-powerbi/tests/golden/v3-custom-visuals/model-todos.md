# Modell-To-dos

Quelle: `Custom-Visual-Testfall` · Modell: `Test.SemanticModel`

## Neu anzulegen

Diese Felder existieren im Modell noch nicht. **Zuerst anlegen**, DAX vom Menschen bestätigen lassen, dann `te validate --errors-only`, erst danach Visuals binden.

| Feld | Art | Tabelle | Beschreibung | Einheit | Ziel | Owner | Quelle | offene Frage | im Layout benutzt |
|---|---|---|---|---|---|---|---|---|---|
| `_Measures.Marge` | Measure | _Measures | Deckungsbeitrag in Prozent | % | > 32 % | Controlling | Workshop | Vor oder nach Projektkosten? | ja |

## Vorschlag (DAX bestätigen lassen, nicht ungefragt anlegen)

```bash
te add "_Measures/Marge" -m "Test.SemanticModel" -t Measure \
  -i "// TODO: DAX ergänzen" \
  -q description -i "Deckungsbeitrag in Prozent" \
  -q formatString -i "#,##0" --if-not-exists --save
te validate -m "Test.SemanticModel" --errors-only
```

## Offene Fragen aus dem Workshop

- [ ] `_Measures.Marge`: Vor oder nach Projektkosten?
