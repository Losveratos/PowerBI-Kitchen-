# Gantt-Vorlage (Deneb / Vega) — PMO Toolkit

`pmo-gantt.deneb.json` ist die **Vega-Gantt-Spezifikation** aus dem
**PMO Toolkit** von **Devon Locher** (https://github.com/DL0K-pbi/PMO_toolkit),
adaptiert von David Baccis Gantt. **Lizenz: MIT** — hier unverändert übernommen,
Attribution steht in der `description` der Spec.

Es ist eine **interaktive Power-BI-/Deneb-Visualisierung** (Pan/Zoom, Phasen ein-/
ausklappen, Dependencies, Meilensteine, Status-Spalte). Sie wird in Power BI über
das **Deneb-Custom-Visual** genutzt.

## So nutzt du sie in Power BI
1. Deneb-Visual einfügen (AppSource → „Deneb"), Provider **Vega** (nicht Vega-Lite).
2. Spec öffnen (Edit) und den Inhalt von `pmo-gantt.deneb.json` einfügen.
3. Im Daten-Bereich die Felder mit **genau diesen Namen** bereitstellen (die Spec
   referenziert sie direkt, kein Platzhalter-Mapping):

| Feld (Spaltenname) | Pflicht | Bedeutung |
|---|---|---|
| `phase`        | ja | Gruppierung/Phase (ein-/ausklappbar) |
| `task`         | ja | Aufgabenname |
| `start`        | ja | Startdatum |
| `end`          | ja | Enddatum |
| `completion`   | ja | Fortschritt 0–100 |
| `id`           | ja | eindeutige ID je Zeile |
| `assignee`     | optional | Verantwortliche/r |
| `status`       | optional | z. B. Not Started / In Progress / Complete / Blocked |
| `milestone`    | optional | true = Meilenstein (Raute) |
| `dependencies` | optional | komma-getrennte IDs der Vorgänger |
| `hyperlink`    | optional | Link je Zeile |

Die Original-Demo-Daten (`Gantt Chart.xlsx`, „Weekly Gantt") liegen im PMO-Toolkit-
Repo; sie liefern Beispielzeilen genau in diesem Schema.

## Status im Knowledge-Kitchen-Builder
- Eingebunden als **fertige Vorlage** (diese Datei) — direkt für Power BI/Deneb.
- **Offen / nächster Schritt:** Render im Builder für **PNG / SVG / HTML-Export**.
  Dafür müssen die Signale `pbiContainerHeight`/`pbiContainerWidth` (von Power BI
  geliefert) lokal mit Defaults überschrieben und die Spec mit Demo-Daten via
  Vega gerendert werden.
