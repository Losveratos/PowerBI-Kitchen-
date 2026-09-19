# Modell-To-dos

Quelle: `Darstellungsvarianten-Testfall` · Modell: `Vertrieb.SemanticModel`

Keine neuen Felder und keine Umbenennungswünsche im Mockup — aber ein Feldparameter (siehe unten). Trotzdem vor dem Bauen jede `ref` aus der Spec gegen `te list` prüfen.

## Feldparameter (Achse per Slicer umschalten)

Diese Kacheln holen ihre Kategorieachse aus einem **Feldparameter** — einer berechneten Tabelle mit dem `NAMEOF`-Muster. Tabelle und Spalte heißen gleich, deshalb bindet der Bericht die Achse auf `'<Name>'[<Name>]` (im pbir-Format `<Name>.<Name>`). **Die Tabelle muss vor dem Bauen existieren** — ein fehlendes Feld lässt `pbir add visual --from-json` die ganze Datei ablehnen.

| Parameter | Felder | Kacheln |
|---|---|---|
| `Achse` | `DimRegion.Region`, `DimProduct.Category`, `DimCustomer.Segment` | Varianten / Umsatz und Kosten |
| `CK-Achse` | `DimDate.Month` | Varianten / AC/PL je Monat |

**Nicht von Hand bauen.** Der Skill `tabular-editor:te-cli` nennt das Zusammenschreiben von DAX und Annotationen über `te add`/`te set` ausdrücklich fehleranfällig; die `ParameterMetadata` gehört auf die versteckte `NAMEOF`-Spalte, sonst schaltet der Slicer nichts um. Also das Makro laufen lassen — **prüfen**, bevor es gespeichert wird:

```bash
cat > field-parameter-Achse.csx <<'CSX'
// Feldparameter "Achse" — Achse per Slicer umschalten.
// Headless-Fassung des Makros "Create Field Parameter"
// (Skill tabular-editor:c-sharp-scripting, examples/tables/add-field-parameter.csx).
var name = "Achse";
var refs = new[] { "DimRegion.Region", "DimProduct.Category", "DimCustomer.Segment" };
var parts = new System.Collections.Generic.List<string>();
for (var i = 0; i < refs.Length; i++) {
    var t = refs[i].Substring(0, refs[i].IndexOf('.'));
    var c = refs[i].Substring(refs[i].IndexOf('.') + 1);
    parts.Add(string.Format("(\"{0}\", NAMEOF('{1}'[{2}]), {3})", c, t, c, i));
}
var table = Model.AddCalculatedTable(name, "{\n    " + string.Join(",\n    ", parts) + "\n}");
var nameCol  = table.AddCalculatedTableColumn(name, "[Value1]");
var fieldCol = table.AddCalculatedTableColumn(name + " Fields", "[Value2]");
var orderCol = table.AddCalculatedTableColumn(name + " Order", "[Value3]");
nameCol.SortByColumn = orderCol;
nameCol.GroupByColumns.Add(fieldCol);
nameCol.SummarizeBy = AggregateFunction.None;
fieldCol.SortByColumn = orderCol;
fieldCol.SetExtendedProperty("ParameterMetadata", "{\"version\":3,\"kind\":2}", ExtendedPropertyType.Json);
fieldCol.IsHidden = true; fieldCol.SummarizeBy = AggregateFunction.None;
orderCol.IsHidden = true; orderCol.FormatString = "0";
CSX
te script "Vertrieb.SemanticModel" --script field-parameter-Achse.csx --save
te get "Achse" -m "Vertrieb.SemanticModel" --output-format tmdl   # ParameterMetadata prüfen
te validate -m "Vertrieb.SemanticModel" --errors-only
```

```bash
cat > field-parameter-CK_Achse.csx <<'CSX'
// Feldparameter "CK-Achse" — Achse per Slicer umschalten.
// Headless-Fassung des Makros "Create Field Parameter"
// (Skill tabular-editor:c-sharp-scripting, examples/tables/add-field-parameter.csx).
var name = "CK-Achse";
var refs = new[] { "DimDate.Month" };
var parts = new System.Collections.Generic.List<string>();
for (var i = 0; i < refs.Length; i++) {
    var t = refs[i].Substring(0, refs[i].IndexOf('.'));
    var c = refs[i].Substring(refs[i].IndexOf('.') + 1);
    parts.Add(string.Format("(\"{0}\", NAMEOF('{1}'[{2}]), {3})", c, t, c, i));
}
var table = Model.AddCalculatedTable(name, "{\n    " + string.Join(",\n    ", parts) + "\n}");
var nameCol  = table.AddCalculatedTableColumn(name, "[Value1]");
var fieldCol = table.AddCalculatedTableColumn(name + " Fields", "[Value2]");
var orderCol = table.AddCalculatedTableColumn(name + " Order", "[Value3]");
nameCol.SortByColumn = orderCol;
nameCol.GroupByColumns.Add(fieldCol);
nameCol.SummarizeBy = AggregateFunction.None;
fieldCol.SortByColumn = orderCol;
fieldCol.SetExtendedProperty("ParameterMetadata", "{\"version\":3,\"kind\":2}", ExtendedPropertyType.Json);
fieldCol.IsHidden = true; fieldCol.SummarizeBy = AggregateFunction.None;
orderCol.IsHidden = true; orderCol.FormatString = "0";
CSX
te script "Vertrieb.SemanticModel" --script field-parameter-CK_Achse.csx --save
te get "CK-Achse" -m "Vertrieb.SemanticModel" --output-format tmdl   # ParameterMetadata prüfen
te validate -m "Vertrieb.SemanticModel" --errors-only
```

So sieht die erzeugte Tabelle aus (gekürzt, **prüfen**):

```tmdl
table Achse
	column Achse
		summarizeBy: none
		sourceColumn: [Value1]
		sortByColumn: 'Achse Order'

		relatedColumnDetails
			groupByColumn: 'Achse Fields'

	column 'Achse Fields'
		isHidden
		summarizeBy: none
		sourceColumn: [Value2]
		sortByColumn: 'Achse Order'

		extendedProperty ParameterMetadata = {"version":3,"kind":2}

	column 'Achse Order'
		isHidden
		formatString: 0
		sourceColumn: [Value3]

	partition Achse = calculated
		mode: import
		source =
				{
				    ("Region", NAMEOF('DimRegion'[Region]), 0),
				    ("Category", NAMEOF('DimProduct'[Category]), 1),
				    ("Segment", NAMEOF('DimCustomer'[Segment]), 2)
				}
```

> Drei Dinge brechen still, wenn sie fehlen: `ParameterMetadata` auf der versteckten Spalte (sonst schaltet der Slicer nicht), `sortByColumn` auf die Order-Spalte (sonst steht die Liste alphabetisch) und eine dichte Zahlenfolge 0, 1, 2 … in `Value3`. Ein Feldparameter taugt außerdem **nicht** als Drill-through- oder Tooltip-Feld.

Danach je Kachel einen **Slicer** auf die Parameterspalte einplanen — ohne ihn kann niemand umschalten. Der Vorschlag steht auskommentiert in `<Seitenslug>/analysis-commands.sh`; das Mockup sieht diese Kachel nicht vor, deshalb wird sie nicht ungefragt gebaut.
