# Modell-To-dos

Quelle: `Management Report · Beispiel` · Modell: `Demo-Modell`

## Neu anzulegen

Diese Felder existieren im Modell noch nicht. **Zuerst anlegen**, DAX vom Menschen bestätigen lassen, dann `te validate --errors-only`, erst danach Visuals binden.

| Feld | Art | Tabelle | Beschreibung | Einheit | Ziel | Owner | Quelle | offene Frage | im Layout benutzt |
|---|---|---|---|---|---|---|---|---|---|
| `_Measures.Deckungsbeitrag` | Measure | _Measures | Umsatz minus variable Kosten; Format #,##0 | – | – | – | – | Wer liefert die variablen Kosten? | ja |

## Vorschlag (DAX bestätigen lassen, nicht ungefragt anlegen)

```bash
te add "_Measures/Deckungsbeitrag" -m "Demo-Modell" -t Measure \
  -i "[Umsatz] - [Kosten]" \
  -q description -i "Umsatz minus variable Kosten; Format #,##0" \
  -q formatString -i "#,##0" --if-not-exists --save
te validate -m "Demo-Modell" --errors-only
```

## Offene Fragen aus dem Workshop

- [ ] `_Measures.Deckungsbeitrag`: Wer liefert die variablen Kosten?
