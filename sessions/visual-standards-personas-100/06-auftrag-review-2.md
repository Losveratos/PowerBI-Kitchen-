# Auftrag: Review von 100 Persona-Firmen

Drei Autoren (zwei mit Claude Opus, einer mit Claude Sonnet) haben 50 weitere fiktive DACH-Organisationen beschrieben (E01–E18 Konzerne, F01–F15 Finanz und gehobener Mittelstand, G01–G17 öffentliche Hand, klein, Mittelstand),
die einen visuellen Standard für Controlling-Reporting in Power BI einführen wollen. Das Feldschema steht in
`persona-brief.md` (gleiches Verzeichnis). Die Personas liegen in `personas-E.json`, `personas-F.json`,
`personas-G.json`. Zum Abgleich auf Doppelungen gibt es die 100 bereits geprüften Personas in `personas-100-reseg.json` (nur lesen, nicht ändern).

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

1. `personas-new50.json`: ein Array mit den 50 neuen Personas (korrigiert), Reihenfolge E01…G17. Füge jeder Persona das Feld
   `author` hinzu: `opus` für E und F, `sonnet` für G. Prüfe mit Python, dass es parst, 50 Einträge hat,
   alle Dreipunkte aufsteigend sind und `existing` = 0 genau bei `baseline` none.
2. `review-log-2.md`: eine Zeile je geänderter Persona (ID, was, warum) und am Ende 5–8 Sätze Gesamturteil:
   Unterschiede zwischen den Opus- und Sonnet-Personas, Segment stimmt zur Größe (klein < 250 MA, Mittelstand 250–2.000, gehoben 2.000–10.000 oder Konzerntochter, Konzern > 10.000), typische Fehler, wie realistisch der Satz als Ganzes ist.

Antworte danach mit 5–8 Sätzen Zusammenfassung.
