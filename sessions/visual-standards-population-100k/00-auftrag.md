# Auftrag: Population von 100.000 Organisationen schätzen (Blindschätzung)

Wir simulieren 100.000 Organisationen durch einen bestehenden Kostenrechner
(„Visual-Standards-Rechner", datenwgknowledgekitchen.com). Er vergleicht vier Wege,
IBCS-nahe Standard-Charts (Abweichung, Wasserfall, Δ-Tabellen, Zeitreihen AC/PY/PL/FC)
in Power BI umzusetzen: gekaufte 3rd-Party-Visuals (Lizenz je Nutzer), ein fertiges
Open-Source-Visual, Deneb/Vega-Lite-Templates (Code) und Core Visuals mit SVG-/DAX-Workarounds.
Die Kostenannahmen des Rechners (Stunden, Preise, Wartung …) stehen fest und sind NICHT deine
Aufgabe. Deine Aufgabe ist allein die **Population**: Wie sehen die Organisationen aus, die so
eine Entscheidung treffen?

**Grundgesamtheit:** Organisationen im DACH-Raum, die Power BI produktiv nutzen und in den nächsten
12 Monaten einen visuellen Standard für Controlling-/Finance-Reporting einführen wollen.
Gewichtet nach **Anzahl Organisationen** (nicht nach Nutzern).

Sei realistisch und nüchtern. Du darfst bis zu ~8 Websuchen machen (z. B. Unternehmensgrößen-Verteilung
DACH, Anteil öffentlicher Sektor/Finanzbranche, Power-BI-Verbreitung, Verbreitung von „certified visuals only",
Report Server). Wo es keine Quelle gibt: begründete Schätzung, als solche markiert. Keine Präferenz für
einen der vier Wege — du kennst die Kostenlogik nicht und sollst sie auch nicht erraten.

## Feste Segmente (Definitionen bitte nicht ändern, nur Anteile + Parameter schätzen)

| id | Segment |
|---|---|
| klein | KMU < 250 MA, BI in 1–3 Köpfen, oft Self-Service |
| mittelstand | 250–2.000 MA, kleines BI-/Controlling-Team |
| gehoben | 2.000–10.000 MA oder Konzerntochter, BI-Team + Fachbereichs-Ersteller |
| konzern | > 10.000 MA, Center of Excellence, viele Ersteller |
| finanz | Bank, Versicherung, Krankenhaus (kein voller Vorsteuerabzug, Revision, oft strenge Tenant-Regeln), jede Größe |
| oeffentlich | Öffentliche Verwaltung / Kommune / Land / Hochschule |

## Was je Segment zu schätzen ist

Dreipunkt = [min, wahrscheinlich, max]. Wahrscheinlichkeiten 0..1.

- `share`: Anteil des Segments an der Grundgesamtheit (Summe aller Segmente = 1)
- `creators`: Report-Ersteller, die Standard-Charts bauen (Dreipunkt, ganze Zahlen)
- `viewers`: Leser der Standard-Reports (Dreipunkt)
- `ssShare`: Self-Service-Anteil 0..100 (0 = zentrales Enterprise-BI-Team baut alles, 25 = Managed Self-Service, 100 = jeder baut selbst), Dreipunkt
- `types`: Anzahl verschiedener Chart-Typen im Standard (Dreipunkt, typisch 4–8)
- `reportsFactor`: Multiplikator auf eine Standardformel für Report-Anzahl (≈ Ersteller × 2–6 + 2 je 1.000 Viewer); 1 = passt, Dreipunkt
- `models`: Anzahl Semantikmodelle, auf denen Standard-Charts laufen (Dreipunkt)
- `horizon`: Wahrscheinlichkeiten für Betrachtungshorizont {"3":p,"5":p,"10":p}
- `licAnchor`: Welches Preisniveau ein gekauftes Visual hätte: {"inforiver": p (≈ 33 €/Nutzer/Jahr), "enterprise": p (≈ 80 €), "zebra": p (≈ 170 €)}
- `siteLicense`: P(Organisation verhandelt eine Site-/Domain-Lizenz statt Staffelpreis), sinnvoll v. a. bei großen
- `reportClasses`: Wahrscheinlichkeiten für Mix der Reports {"op": p (70 % operativ/20/10), "mix": p (45/35/20), "mgmt": p (20/40/40 Management-lastig)}
- `ibcsAll`: P(IBCS ist verbindlich für ALLE Reports, nicht nur Management-Reports)
- `baseline`: Was ist heute im Einsatz? {"none":p,"paid":p,"oss":p,"deneb":p,"core":p}; plus `existingPerCreator` [min,mode,max] = Bestandsreports je Ersteller, die bei einem Wechsel migriert werden müssten
- `dist`: Verteilweg für ein Custom Visual {"none":p (offen),"app":p (AppSource),"org":p (Organizational Store),"file":p (Datei-Import je Bericht)}
- `library`: P(es gibt bereits eine fertige Vorlagenbibliothek für Deneb bzw. Core/SVG im Haus)
- `ossBuild`: falls Open Source: {"ready":p (fertiges Visual nehmen), "ki":p (selbst bauen, KI-gestützt), "classic":p (klassische Eigenentwicklung)}
- `flags` (Wahrscheinlichkeit, dass die Rahmenbedingung zutrifft):
  - `certonly`: Tenant erlaubt nur Microsoft-zertifizierte Visuals
  - `orgstore`: (bedingt auf certonly) ein unzertifiziertes Visual wird über den Organizational Store freigegeben
  - `coreonly`: Custom Visuals per Tenant komplett gesperrt
  - `ibcsmust`: IBCS-zertifizierte Software ist Pflicht (Einkauf/Konzernstandard)
  - `nobudget`: 0 € für Visual-Lizenzen, nur interne Zeit
  - `rs`: Reports laufen (auch) im Power BI Report Server on-prem
  - `embed`: Publish-to-web oder Embedded (app owns data)
  - `sovereign`: Sovereign Cloud
  - `novat`: kein voller Vorsteuerabzug
  - `budgetnext`: Budget erst im Folgejahr
  - `euonly`: Vergaberecht / EU-Datenstandort-Pflicht
  - `noext`: kein externer Dienstleister ohne Ausschreibung
  - `revision`: Revision verlangt Einsicht in die Rechenlogik
- `must` (P, dass die Organisation die Anforderung als **Must** – also K.O.-Kriterium – führt):
  `ibcscert` (IBCS-zertifiziertes Visual), `mscert` (Microsoft-zertifiziertes Visual), `export` (PDF/PPT-Export und E-Mail-Abos im Service),
  `writeback` (Kommentare/Writeback im Visual), `maint` (Fachbereich kann ohne Code ändern), `copilot` (Copilot erstellt/bearbeitet Reports),
  `a11y` (Barrierefreiheit), `rs` (läuft im Report Server), `paginated` (gedrucktes Berichtsheft in RDL mit derselben Notation),
  `exit` (kein Vendor-Lock-in), `sla` (vertraglicher Support mit Reaktionszeit), `bus` (Wissen bei mehr als einer Person),
  `datares` (keine Datenverarbeitung außerhalb des Tenants), `interact` (Interaktivität/Cross-Highlight), `drill` (Drilldown/Drillthrough)

## Ausgabe

Schreibe **genau eine JSON-Datei** an den Pfad, den dir der Auftrag nennt, mit der Struktur:

```json
{
  "estimator": "<dein Modellname>",
  "segments": {
    "klein": { "share": 0.0, "creators": [1,2,4], "viewers": [..], "ssShare": [..], "types": [..], "reportsFactor": [..],
               "models": [..], "horizon": {"3":0,"5":0,"10":0}, "licAnchor": {...}, "siteLicense": 0.0,
               "reportClasses": {...}, "ibcsAll": 0.0, "baseline": {...}, "existingPerCreator": [..], "dist": {...},
               "library": 0.0, "ossBuild": {...}, "flags": {...}, "must": {...} },
    "mittelstand": { ... }, "gehoben": { ... }, "konzern": { ... }, "finanz": { ... }, "oeffentlich": { ... }
  },
  "rationale": { "<segment oder Feld>": "1–2 Sätze, Quelle oder 'Schätzung'" },
  "sources": [ {"title": "...", "url": "...", "used_for": "..."} ],
  "biggest_uncertainties": ["...", "..."]
}
```

Alle Wahrscheinlichkeits-Objekte summieren sich je Segment auf 1. JSON muss mit `python3 -c "import json;json.load(open(PATH))"`
fehlerfrei parsebar sein — prüfe das am Ende selbst. Antworte danach mit 5–8 Sätzen: wichtigste Annahmen und wo du am unsichersten bist.
