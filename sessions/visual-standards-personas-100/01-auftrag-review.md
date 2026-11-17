# Auftrag: Review von 100 Persona-Firmen

Vier Autoren (zwei mit Claude Opus, zwei mit Claude Sonnet) haben je 25 fiktive DACH-Organisationen beschrieben,
die einen visuellen Standard für Controlling-Reporting in Power BI einführen wollen. Das Feldschema steht in
`persona-brief.md` (gleiches Verzeichnis). Die Personas liegen in `personas-A.json`, `personas-B.json`,
`personas-C.json`, `personas-D.json`.

Du prüfst **Realismus und innere Stimmigkeit** wie ein erfahrener BI-Berater, der hunderte solcher Firmen
gesehen hat. Du bewertest NICHT, welcher Weg (Paid, Open Source, Deneb, Core) für eine Firma der richtige wäre,
und du änderst nichts, um ein bestimmtes Ergebnis herbeizuführen.

Prüfe je Persona:

1. **Mengen plausibel zur Größe und Story?** Viewer im Verhältnis zu Mitarbeitenden, Ersteller zu Betriebsmodell
   (`ssShare`), Reports zu Erstellern, Modelle zu Struktur. Beispiel für einen Fehler: 300 MA, aber 2.000 Viewer;
   zentrales BI-Team (`ssShare` 0) mit 40 Erstellern in einer 200-Personen-Firma.
2. **Widersprüche zwischen Feldern?** z. B. `orgstore` ohne `certonly`; `baseline` none mit `existing` > 0;
   `coreonly` = 1 bei `baseline` paid; `rs` als Flag sicher, aber Must `rs` fehlt oder umgekehrt; `siteLicense`
   bei 15 Viewern; `novat` bei einem Industrieunternehmen mit vollem Vorsteuerabzug; `nobudget` = 1 und
   `licAnchor` zebra mit Site-Lizenz.
3. **Story passt zu den Werten?** Was in der Story steht (z. B. „Revision schaut genau hin", „Report Server",
   „Fonds will in 3 Jahren verkaufen" → Horizont 3), muss sich in den Feldern wiederfinden, und umgekehrt.
4. **Unsicherheit ehrlich?** Dreipunkte nicht künstlich eng, wo die Story Offenheit beschreibt, und nicht absurd breit.
5. **Doppelungen:** fast identische Personas markieren und eine davon so verändern, dass sie etwas Eigenes beiträgt.

Korrigiere nur, was wirklich nicht stimmt, minimal-invasiv. Behalte IDs, Namen und den Kern jeder Story.

## Ausgabe

1. `personas-all.json`: ein Array mit allen 100 Personas (korrigiert), Reihenfolge A01…D25. Füge jeder Persona das Feld
   `author` hinzu: `opus` für A und B, `sonnet` für C und D. Prüfe mit Python, dass es parst, 100 Einträge hat,
   alle Dreipunkte aufsteigend sind und `existing` = 0 genau bei `baseline` none.
2. `review-log.md`: eine Zeile je geänderter Persona (ID, was, warum) und am Ende 5–8 Sätze Gesamturteil:
   Unterschiede zwischen den Opus- und Sonnet-Personas, typische Fehler, wie realistisch der Satz als Ganzes ist.

Antworte danach mit 5–8 Sätzen Zusammenfassung.
