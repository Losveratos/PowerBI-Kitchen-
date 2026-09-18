# Modell-To-dos

Quelle: `Analyse-Testfall` · Modell: `Demo-Modell`

## Neu anzulegen

Diese Felder existieren im Modell noch nicht. **Zuerst anlegen**, DAX vom Menschen bestätigen lassen, dann `te validate --errors-only`, erst danach Visuals binden.

| Feld | Art | Tabelle | Beschreibung | Einheit | Ziel | Owner | Quelle | offene Frage | im Layout benutzt |
|---|---|---|---|---|---|---|---|---|---|
| `_Measures.Deckungsbeitrag` | Measure | _Measures | Umsatz minus Kosten | T€ | > 30 % | Controlling | DWH | Inklusive Boni? | nein |

## Vorschlag (DAX bestätigen lassen, nicht ungefragt anlegen)

```bash
te add "_Measures/Deckungsbeitrag" -m "Demo-Modell" -t Measure \
  -i "[Umsatz] - [Kosten]" \
  -q description -i "Umsatz minus Kosten" \
  -q formatString -i "#,##0" --if-not-exists --save
te validate -m "Demo-Modell" --errors-only
```

## Offene Fragen aus dem Workshop

- [ ] `_Measures.Deckungsbeitrag`: Inklusive Boni?

## Umbenennungswünsche aus dem Fachbereich

Der Workshop hat für diese Felder einen Alias notiert und `renameInModel` gesetzt. **Erst nach Freigabe** umbenennen — ein Rename kaskadiert nur halb (queryRef/metadata im Bericht bleiben stehen, danach `pbir fields replace` + `pbir validate --fields`).

| Feld | soll heißen | bestätigt | Owner |
|---|---|---|---|
| `_Measures.Umsatz` | Nettoerlös | ja | Controlling |

```bash
te rename "_Measures/Umsatz" "Nettoerlös" -m "Demo-Modell" --save
```
