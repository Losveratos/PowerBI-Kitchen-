# Auftrag: Wie stark senkt KI-gestützte Pflege die Kosten eines Visual-Standards in einem Konzern?

Ein Kostenrechner („Visual-Standards-Rechner") vergleicht vier Wege, IBCS-nahe Standard-Charts in Power BI umzusetzen.
Er rechnet mit internen Stunden (bewertet mit Vollkosten-Stundensatz, Modus 82 €/h) und Lizenzen. Wir wollen ein Szenario
ergänzen: **Ein Konzern (> 10.000 MA, Center of Excellence, 20–250 Report-Ersteller) setzt KI-Assistenten und Coding-Agents
(z. B. GitHub Copilot, Claude Code, Copilot in Power BI, Agenten, die PBIR-/TMDL-Dateien schreiben) systematisch ein, um
Visuals und Reports zu bauen und zu pflegen.** Deine Aufgabe ist, realistische Multiplikatoren für die Stundenannahmen zu schätzen.

Sei nüchtern. Die Evidenz ist widersprüchlich: METR-RCT 2025 misst bei erfahrenen Open-Source-Entwicklern −19 % Produktivität
(bei +20 % Selbsteinschätzung), ein METR-Update 02/2026 +4 bis +20 %, Peng et al. 2023 +55,8 % bei einer Greenfield-Aufgabe.
Du darfst bis zu ~8 Websuchen machen (z. B. neuere Studien zu KI-Produktivität bei Wartung, Copilot-Studien in Unternehmen,
Erfahrungen mit Power BI PBIR/TMDL und Agents, Kosten von KI-Lizenzen). Wo keine Quelle: begründete Schätzung, markiert.

## Die vier Wege und was eine KI dort anfassen kann

| Weg | Woraus der Standard besteht | Was ein Agent tun kann |
|---|---|---|
| `paid` (gekauftes Custom Visual, z. B. Zebra BI, Inforiver) | GUI-Konfiguration des Hersteller-Visuals; das Property-Schema ist nicht dokumentiert | Report-JSON (PBIR) kopieren und variieren, aber nicht die Logik des Visuals ändern |
| `oss` (fertiges Open-Source-Visual oder Eigenentwicklung) | TypeScript-Quellcode (bei Eigenbau), dokumentierte Properties, Agent-Guide vorhanden | Code und Report-JSON schreiben, Bugs fixen, bei Eigenbau das Visual selbst weiterentwickeln |
| `deneb` (Vega-Lite-Templates im Deneb-Visual) | JSON-Specs als Text, diff-fähig | Specs schreiben, anpassen, migrieren, Fehler finden |
| `core` (Core Visuals + SVG-Measures / DAX-UDFs) | DAX-Measures und UDFs als Text (TMDL), viele Workarounds | DAX/SVG schreiben, Measures massenhaft anpassen, Regressionen nach Power-BI-Updates fixen |

## Basiswerte des Rechners (Modus, ohne KI) — du schätzt Multiplikatoren darauf

| Parameter | paid | oss | deneb | core |
|---|---|---|---|---|
| `firstH` Stunden je Chart-Typ, erstmalig | 4 | 8,5 | 12 | 16 |
| `reuseH` Stunden je Chart beim Rollout | 1 | 2 | 2,5 | 4 |
| `maint` Wartungsquote p. a. (% des Aufbaus) | 10 | 22 | 17 | 30 |
| `fixH` Stunden je Breaking-Update | 3 | 7 | 6,5 | 9,5 |
| `trainH` Schulung je Vorlagen-Bauer (h) | 8,5 | 15 | 35 | 28 |
| `rampH` Einarbeitung bei Fluktuation (h) | 16 | 28 | 70 | 50 |
| `supH100` Anwender-Support je 100 Viewer und Jahr (h) | 4 | 5,5 | 6 | 9,5 |
| `govRun` laufende Governance p. a. (h) | 16 | 30 | 18 | 3 |
| `devH` Eigenentwicklung des OSS-Visuals (h, nur bei Eigenbau) | – | 200 (KI-gestützt) bis 2.000 (klassisch) | – | – |

## Was du liefern sollst

Schreibe genau eine JSON-Datei (Pfad aus deinem Auftrag):

```json
{
  "estimator": "<Modell>",
  "factors": {
    "paid":  {"firstH":[lo,mode,hi], "reuseH":[..], "maint":[..], "fixH":[..], "trainH":[..], "rampH":[..], "supH100":[..], "govRun":[..]},
    "oss":   {"...": "...", "devH":[..]},
    "deneb": {"...": "..."},
    "core":  {"...": "..."}
  },
  "aiCostPerCreatorYear": [lo,mode,hi],
  "aiCostShareVisual": [lo,mode,hi],
  "adoption": {"konzern":[lo,mode,hi], "gehoben":[..], "mittelstand":[..], "klein":[..], "finanz":[..], "oeffentlich":[..]},
  "rationale": {"<weg oder parameter>": "1–2 Sätze, Quelle oder 'Schätzung'"},
  "sources": [{"title":"...","url":"...","used_for":"..."}],
  "biggest_uncertainties": ["..."]
}
```

- **Multiplikatoren** wirken auf den Stundenwert: 0,7 = 30 % weniger Stunden, 1,1 = 10 % mehr (z. B. Governance, weil KI-Code geprüft werden muss). `lo` = optimistisch (kleinster Faktor), `hi` = pessimistisch. Ein `hi` über 1 ist ausdrücklich erlaubt, wenn KI auch Mehraufwand erzeugen kann.
- Die Faktoren gelten für eine Organisation, in der **alle** Ersteller KI nutzen, nach einer Einführungsphase. Der Rechner skaliert sie mit dem Adoptionsgrad.
- `aiCostPerCreatorYear`: € je Ersteller und Jahr für KI-Werkzeuge (Lizenzen, Tokens), netto.
- `aiCostShareVisual`: Anteil dieser Kosten, der fairerweise der Visual-/Report-Pflege zuzurechnen ist (0..1); der Rest dient anderer Arbeit.
- `adoption`: Anteil der Ersteller, die KI für diese Arbeit tatsächlich nutzen, je Ebene (0..1), Stand Ende 2026.

Prüfe die Datei mit Python auf gültiges JSON und aufsteigende Dreipunkte. Antworte danach mit 5–8 Sätzen: die wichtigsten Faktoren je Weg und wo du am unsichersten bist.
