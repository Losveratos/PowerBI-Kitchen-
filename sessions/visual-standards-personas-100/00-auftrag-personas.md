# Auftrag: 25 Persona-Firmen für eine Monte-Carlo-Simulation

Wir simulieren konkrete Organisationen durch einen bestehenden Kostenrechner
(„Visual-Standards-Rechner"). Er vergleicht vier Wege, IBCS-nahe Standard-Charts
(Abweichung, Wasserfall, Δ-Tabellen, Zeitreihen AC/PY/PL/FC) in Power BI umzusetzen:
gekaufte 3rd-Party-Visuals (Lizenz je Nutzer), ein fertiges Open-Source-Visual, Deneb/Vega-Lite-Templates
(Code) und Core Visuals mit SVG-/DAX-Workarounds. Die Kostenannahmen des Rechners stehen fest und sind
NICHT deine Aufgabe; du kennst sie nicht und sollst sie nicht erraten. Keine Präferenz für einen Weg.

Deine Aufgabe: **25 fiktive, aber realistische Organisationen im DACH-Raum** beschreiben, die Power BI nutzen
und einen visuellen Standard für Controlling-/Finance-Reporting einführen wollen. Jede Persona soll sich
wie ein echter Kunde anfühlen: Name (frei erfunden, keine realen Firmen, keine echten Personen), Branche,
Ort, Größe, eine kurze Geschichte, wer entscheidet, und was die Lage besonders macht.

Wichtig: **Unsicherheit ehrlich abbilden.** Mengen sind Dreipunkt-Werte [min, wahrscheinlich, max] —
eng, wenn die Firma das genau weiß, breit, wenn nicht (z. B. Rollout auf weitere Bereiche offen).
Rahmenbedingungen und Muss-Kriterien sind Wahrscheinlichkeiten: 1 = steht fest, 0.5 = wird gerade
diskutiert, 0.2 = jemand hat es mal erwähnt. Nur aufführen, was > 0 ist.

Mische die Fälle: nicht jede Firma hat Spezialprobleme, manche sind ganz normal. Nutze die volle
Bandbreite der Felder; vermeide 25 Varianten derselben Firma.

## Felder je Persona

| Feld | Bedeutung |
|---|---|
| `id` | Kürzel, wird dir vorgegeben (Präfix + Nummer, z. B. `A01`) |
| `name` | fiktiver Firmenname |
| `industry` | Branche |
| `city` | Ort (DACH) |
| `employees` | Mitarbeitende (Zahl) |
| `segment` | eines von: `klein`, `mittelstand`, `gehoben`, `konzern`, `finanz`, `oeffentlich` |
| `story` | 2–3 Sätze: Ausgangslage, warum jetzt, was schwierig ist |
| `decider` | wer entscheidet (Rolle) |
| `creators` | [min,mode,max] Report-Ersteller, die Standard-Charts bauen |
| `viewers` | [min,mode,max] Leser der Standard-Reports |
| `reports` | [min,mode,max] Standard-Reports, die nach dem Standard gebaut werden (über den Horizont im Bestand) |
| `types` | [min,mode,max] verschiedene Chart-Typen im Standard (typisch 4–8) |
| `models` | [min,mode,max] Semantikmodelle mit Standard-Charts |
| `growth` | [min,mode,max] Viewer-Wachstum in % pro Jahr (darf negativ sein) |
| `ssShare` | 0..100: 0 = zentrales BI-Team baut alles, 25 = Managed Self-Service, 100 = jeder baut selbst |
| `horizon` | 3, 5 oder 10 Jahre |
| `licAnchor` | Preisniveau eines gekauften Visuals: `inforiver` (≈ 33 €/Nutzer/Jahr), `enterprise` (≈ 80 €), `zebra` (≈ 170 €) |
| `siteLicense` | true/false: verhandelt eine Site-/Domain-Lizenz statt Staffelpreis |
| `reportClasses` | `op` (70 % operativ/20/10), `mix` (45/35/20), `mgmt` (20/40/40, Management-lastig) |
| `ibcsAll` | true/false: IBCS verbindlich für ALLE Reports |
| `baseline` | heute im Einsatz: `none`, `paid`, `oss`, `deneb`, `core` |
| `existing` | Bestandsreports, die bei einem Wechsel migriert werden müssten (0 bei `none`) |
| `dist` | Verteilweg für ein Custom Visual: `none` (offen), `app` (AppSource), `org` (Organizational Store), `file` (Datei-Import je Bericht) |
| `library` | true/false: fertige Vorlagenbibliothek für Deneb bzw. Core/SVG vorhanden |
| `ossBuild` | falls Open Source: `ready` (fertiges Visual), `ki` (KI-gestützt selbst bauen), `classic` (klassisch selbst bauen) |
| `flags` | Objekt {id: Wahrscheinlichkeit} aus: `certonly` (Tenant nur zertifizierte Visuals), `orgstore` (unzertifiziertes Visual über Organizational Store freigegeben; nur sinnvoll mit certonly), `coreonly` (Custom Visuals gesperrt), `ibcsmust` (IBCS-zertifizierte Software Pflicht), `nobudget` (0 € Lizenzbudget), `rs` (Report Server on-prem), `embed` (Publish-to-web/Embedded), `sovereign` (Sovereign Cloud), `novat` (kein voller Vorsteuerabzug), `budgetnext` (Budget erst im Folgejahr), `euonly` (Vergaberecht/EU-Datenstandort), `noext` (kein externer Dienstleister ohne Ausschreibung), `revision` (Revision will Rechenlogik sehen) |
| `must` | Objekt {id: Wahrscheinlichkeit, dass es ein echtes K.O.-Kriterium ist} aus: `ibcscert` (IBCS-zertifiziertes Visual), `mscert` (Microsoft-zertifiziert), `export` (PDF/PPT-Export & Abos), `exportdata` (Datenexport Excel/CSV aus dem Visual), `interact` (Interaktivität), `drill` (Drilldown/Drillthrough), `writeback` (Kommentare/Writeback im Visual), `maint` (Fachbereich ändert ohne Code), `copilot` (Copilot erstellt Reports), `agentic` (KI-Agenten bauen Reports über PBIR), `a11y` (Barrierefreiheit), `pin` (Versionshoheit), `alm` (Git/Deployment-Pipeline), `themeable` (zentral per Theme steuerbar), `mobile` (Mobile App), `copyppt` (Kopieren nach PowerPoint), `paginated` (gedrucktes Berichtsheft RDL mit derselben Notation), `exit` (kein Vendor-Lock-in), `design` (einheitliches Design ohne Disziplin), `rs` (läuft im Report Server), `scale` (konsistente Skalierung), `version` (Code-Review der Definition), `sla` (vertraglicher Support mit SLA), `datares` (keine Datenverarbeitung außerhalb des Tenants), `bus` (Wissen bei mehr als einer Person) |
| `why` | 1 Satz: was an dieser Persona für die Entscheidung interessant ist |

## Ausgabe

Schreibe **genau eine JSON-Datei** (an den Pfad aus deinem Auftrag): ein Array mit 25 Objekten.
Prüfe am Ende mit `python3 -c "import json;d=json.load(open(PATH));print(len(d))"`, dass sie parst und 25 Einträge hat,
dass alle Dreipunkte aufsteigend sind und nur die erlaubten IDs vorkommen.
Antworte danach mit 4–6 Sätzen: welche Bandbreite du abgedeckt hast und welche Personas besonders knifflig sind.
