# Analyse-To-dos

Was der Analyse-Block der Spec (v3) verlangt und `pbir` **nicht** direkt setzen kann. Alles andere steht bereits in den `<Seitenslug>/analysis-commands.sh`.

| Seite | Kachel | Code | Was zu tun ist |
|---|---|---|---|
| Fidelity | Δ PY absolut (`mk_absvar1`) | `CK_NO_NATIVE` | Kein natives Ersatzvisual (ein natives Säulendiagramm zeigt AC statt der Δ-Säulen). Bis ChartKitchen im Bericht ist, steht ein Platzhalter; nativ nur mit einer Δ-Kennzahl ([AC] − [Referenz]) im Modell. |
| Fidelity | Δ PY % (`mk_relvar1`) | `CK_NO_NATIVE` | Kein natives Ersatzvisual (ein natives Säulendiagramm zeigt AC statt der Δ%-Nadeln). Bis ChartKitchen im Bericht ist, steht ein Platzhalter; nativ nur mit einer Δ-Kennzahl ([AC] − [Referenz]) im Modell. |
| Fidelity | PL → AC je Region (`mk_bridge1`) | `CK_NO_NATIVE` | Kein natives Ersatzvisual (ein nativer Wasserfall zeigt die AC-Beiträge statt der Brücke Referenz → Δ je Kategorie → AC). Bis ChartKitchen im Bericht ist, steht ein Platzhalter; nativ nur mit einer Δ-Kennzahl ([AC] − [Referenz]) im Modell. |
