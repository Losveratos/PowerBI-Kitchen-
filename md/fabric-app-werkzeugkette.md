---
title: Fabric-App-Werkzeugkette
url: https://datenwgknowledgekitchen.com/fabric-app-werkzeugkette.html
lang: de
stand: 2026-11-27
---

# Fabric-App-Werkzeugkette

So entstehen die Fabric Apps und Power-BI-Berichte der Daten-WG: Aus einer Skizze wird eine Spec, aus der Spec erzeugt die dwg cli eine Fabric App, einen Power-BI-Bericht oder beides mit denselben Visuals, und jede Auslieferung wird geprüft, bevor das Publikum sie sieht. Die Daten kommen aus einer vorhandenen Quelle oder werden für eine Demo synthetisch erzeugt.

## Ablauf

1. **Vorbereiten:** MockupKitchen (Seiten skizzieren) und die Datenquelle (vorhanden oder Demo).
2. **Bausteine:** App-Spec (JSON), die Visuals ChartKitchen 1.58 und P&L Statement 1.8.4, das Semantikmodell (vorhanden oder neu, mit fab und te).
3. **Erzeugen:** Die dwg cli liest Spec, Modell und Visuals und erzeugt DAX-Abfragen, Seiten und Kacheln sowie PBIR-Visuals. Sie testet ohne Fabric (Mini-DAX) und prüft mit `dwg check`, `dwg lint` und dem Paritätstest.
4. **Ausliefern:** Fabric App per `rayfin up`, Power-BI-Bericht per `fab import` und pbir. App, Bericht oder beides.
5. **Prüfen:** `pbir visuals test` (jede Abfrage im Service), Template-Prüfstand (Referenz, App, Power BI), fabscan (Governance), Playwright (Browser-Tests). Die Befunde gehen in die nächsten Releases der Visuals.

Über allem: Claude Code orchestriert. Der Agent plant, die CLI führt aus, der Check prüft. Parallele Sessions, Review mit Fable, Freigaben bleiben beim Menschen.

## Warum so

- **Eine Spec, ein oder zwei Ziele:** Aus derselben Datei entsteht nur eine Fabric App, nur ein Power-BI-Bericht oder beides. Werden beide gebaut, zeigen sie dieselben Zahlen mit denselben Visuals.
- **Gleicher Befehl, gleiches Ergebnis:** Jeder Schritt ist ein CLI-Aufruf statt Klicks im Portal.
- **Notation als Leitplanke:** ChartKitchen und P&L bringen Szenario-Notation, Skalierung und Vorlagen mit.
- **Prüfen gehört zur Kette:** Parität, Service-Abfragen, Prüfstand und Governance laufen, bevor das Publikum etwas sieht.

## Werkzeuge

| Werkzeug | Herkunft | Macht | Vorteil |
|---|---|---|---|
| MockupKitchen | eigen | Mockups für Power-BI-Seiten und Fabric Apps im Browser | Fachbereich sieht das Ergebnis früh, `dwg mockup import` macht daraus eine Spec |
| Datenquelle | vorhanden oder generiert | vorhandenes Lakehouse, Warehouse oder Semantikmodell; für Demos synthetische Parquet-Daten mit Python | gleicher Weg für echte Daten und Demos |
| App-Spec (JSON) | eigen, Teil der dwg cli | Seiten, Kacheln, Rollen, Filter, Formate, Navigation, Template je Kachel | versioniert in Git, `dwg check` prüft gegen das Modell |
| ChartKitchen byDatenWG 1.58.0.0 | eigen | Custom Visual, 14 Chart-Modi, 24 Vorlagen (C01 bis C25), Szenario-Notation und Skalierung | ein Visual für Power BI und Fabric App |
| P&L Statement byDatenWG 1.8.4.0 | eigen | GuV und Finanztabellen, 23 Templates, ROI-Baum, Sankey, Bilanz, Cashflow | Template wählen statt formatieren |
| fab (Fabric CLI) | Microsoft | Workspaces, Lakehouse-Upload, `table load`, Import, Refresh, Rebind | skriptbar statt Klicks im Portal |
| te (Tabular Editor CLI) | Tabular Editor, Preview | Semantikmodelle als TMDL laden, prüfen, per Skript ändern | Modelländerungen als Text, geprüft vor dem Deploy |
| dwg cli | eigen, öffentlich, frühe Vorschau | baut aus Spec und Modell die Fabric App, den PBIP-Bericht oder beides | gleiche Spec, gleiches Ergebnis |
| Paritätstest | eigen, in der dwg cli | rendert jede Kachel wie Power BI und wie die App, schlägt bei Abweichung fehl; nur wenn beide Ziele aus derselben Spec auf demselben Semantikmodell entstehen | Abweichungen fallen beim Bauen auf |
| Rayfin CLI (Fabric Apps) | Microsoft, Preview | legt das Fabric-App-Item an und deployt, Konnektoren, Hosting, Entra-Anmeldung | der skriptbare Weg zur Fabric App |
| pbir CLI | genutzt | prüft und ändert PBIR-Berichte, `rebind`, testet jede Visual-Abfrage im Service (Showcase 282 von 282, Stand 25.11.2026) | Fehler findet die CLI, nicht das Publikum |
| Git und GitHub | genutzt | Spec, PBIP und Visual-Code im Git, Tests per GitHub Actions | Releases mit Pull Request und grünem Test |
| Template-Prüfstand | eigen | prüft je Template gegen die Referenz, App und Power BI nebeneinander, Messwerte | Wellenplan aus Befunden |
| fabscan | eigen, CLI und Skill | Governance-Prüfung für Fabric Apps: Berechnungen in der App, Lineage, Sicherheit, veränderte Abfragen | Befunde mit stabiler ID, Ausnahmen mit Begründung |
| Playwright | Microsoft | Browser-Tests und Screenshots | echtes Rendering belegt |
| Claude Code und Fable | Anthropic | parallele Sessions, Skills für dwg, fabscan und Mockups, unabhängiges Review | der Mensch gibt Push, Merge und Deploy frei |

ChartKitchen und P&L Statement sind von IBCS inspiriert. Sie sind nicht zertifiziert, und es besteht keine Verbindung zur IBCS Association. Die Daten der genannten Beispiele sind synthetisch.

---

## Weiterlesen

- HTML (maßgeblich): https://datenwgknowledgekitchen.com/fabric-app-werkzeugkette.html
- dwg cli: https://github.com/Losveratos/dwg-cli
- ChartKitchen-Doku: [chartkitchen-doku.md](chartkitchen-doku.md) · P&L-Doku: [pnl-doku.md](pnl-doku.md)
