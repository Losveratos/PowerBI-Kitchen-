# fabscan 0.5.1 · was das Werkzeug heute kann (Stand 19.11.2026)

fabscan ist ein Governance-Scanner der Daten-WG für Microsoft Fabric Apps (Rayfin, React-Apps, die Semantikmodelle
per DAX abfragen) und für den Fabric-Tenant. Python, nur Standardbibliothek, nur Lesezugriffe.

## Wege
- Repo-Modus: liest App-Code (TS/React), .dax-Dateien, rayfin.yml und das Semantikmodell als TMDL.
- Tenant-Modus (`fabscan fetch`): Modelle aus der Admin-Scanner-API (oder ohne Admin per getDefinition bzw.
  INFO.VIEW über executeQueries), tatsächlich ausgeführte DAX-Abfragen aus dem Workspace Monitoring
  (Tabelle SemanticModelLogs im Eventhouse, Abfragen aus Power-BI-Berichten standardmäßig ausgeblendet).
- Fabric-Notebook mit demselben Ablauf, schreibt Befunde als Delta-Tabelle fabscan_findings (für einen
  Power-BI-Bericht über die Zeit).

## Ausgaben
HTML-Bericht in Klartext (Gesamtbild, Modell-Übersicht mit Measures/RLS/Clients, Ampel je Client, Steckbrief,
Datenweg, „Das Wichtigste“), Markdown-Zusammenfassung, befunde.json, befunde.csv. Schweregrade fail/warn/info,
Kategorien: Berechnung, Lineage-Bruch, Sicherheit, veränderte Abfrage, Abweichung zum Modell.

## Prüfregeln (IDs)
- Berechnung: CALC-DEFINE (Kennzahl nur in der App/Abfrage definiert), CALC-PROJ (berechnete Projektion),
  CALC-RAW (Rohdaten statt Measures), CALC-TS (Rechnung im TypeScript)
- Lineage: LIN-MISSING-FIELD/-TABLE, LIN-UNKNOWN-REF, LIN-NO-MODEL, LIN-NO-QUERY, LIN-OTHER-SOURCE (App liest an
  der Quelle vorbei), LIN-LOCAL-DATA, LIN-FULL-TABLE, LIN-CALCGROUP, LIN-MDX
- Sicherheit: SEC-AUTH (Service Principal statt Nutzer), SEC-NO-RLS, SEC-CLIENT-RLS (Filter nach Nutzer im
  Browser), SEC-HIDDEN (ausgeblendete Felder abgefragt), SEC-SECRET, SEC-PASSWORD, SEC-EXTERNAL/SEC-CDN/SEC-FETCH
  (fremde Server), SEC-STORAGE (Browser-Speicher), SEC-ASSETS, SEC-NOAUTH, SEC-REDIRECT, SEC-HTML, SEC-DATAFILE,
  SEC-TRACKED
- Abfrage verändert: QRY-SHADOW (Measure in der Abfrage überschrieben), QRY-OVERRIDE (ALL/REMOVEFILTERS),
  QRY-HARDCODED (feste Filterwerte), QRY-TREATAS, QRY-TRUNC (Runden/Abschneiden), QRY-REPLACE/QRY-RUNTIME
- Abweichung: DEV-NAME (Measure-Name im Code nachgerechnet), DEV-TRANSFORM

## Was es nicht macht (bekannt)
Keine Auswertung von Berichten/Visuals, keine Activity-/Audit-Events, keine Nutzungsstatistik je Nutzer über
die Abfragen hinaus, keine Kapazitäts-/Performance-Analyse, keine Sensitivity Labels, keine Berechtigungs-
inventur (Workspace-Rollen, Freigaben, Build-Recht), keine Gateway-/Datenquellen-Inventur, keine BPA-Regeln
für Modelle, keine Trends über Läufe hinweg außer der Delta-Tabelle.
