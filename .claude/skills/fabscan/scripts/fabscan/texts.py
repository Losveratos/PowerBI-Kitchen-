"""Klartext je Prüfregel: für Leser ohne Code-Kenntnis.

head    – was gefunden wurde (ein Satz, {n} = Zahl der Fundstellen, {names} = Namen)
why     – warum das wichtig ist
todo    – was zu tun ist
overall – Satz fürs Gesamtbild über alle Apps ({n} = Apps mit Befund, {N} = alle Apps)
"""

RULES = {
    "CALC-RAW": dict(
        head="Die App holt nur Einzelzeilen und rechnet alle Kennzahlen selbst. Kein Measure des Modells wird genutzt.",
        why="Die Kennzahlen-Logik des Modells wird umgangen. Ändert jemand ein Measure, rechnet die App mit ihrer eigenen "
            "Logik weiter, und Bericht und App zeigen unterschiedliche Zahlen.",
        todo="Kennzahlen als Measures aus dem Modell abfragen. Die App zeigt an und filtert, gerechnet wird im Modell.",
        overall="{n} von {N} Apps nutzen kein einziges Measure und rechnen aus Einzelzeilen."),
    "CALC-TS": dict(
        head="An {n} Stellen im App-Code entstehen Summen, Quoten oder Abweichungen.",
        why="Diese Rechnungen stehen nur im Code. Niemand sieht sie im Modell, und andere Berichte rechnen sie womöglich anders.",
        todo="Für jede Rechnung klären, ob es dafür ein Measure gibt oder geben sollte.",
        overall="{n} von {N} Apps rechnen im Browser mit Werten aus den Abfragen."),
    "CALC-PROJ": dict(
        head="{n} Werte werden direkt in den Abfragen der App berechnet, nicht im Modell.",
        why="Die Logik existiert nur in der App. Andere Berichte auf demselben Modell kennen sie nicht.",
        todo="Als Measure ins Modell übernehmen und von dort abfragen.",
        overall="{n} von {N} Apps berechnen Werte in ihren Abfragen statt Measures abzufragen."),
    "CALC-DEFINE": dict(
        head="Die App definiert eigene Kennzahlen, die es im Modell nicht gibt.",
        why="Eine Kennzahl, die nur in einer App existiert, ist für Controlling und andere Berichte unsichtbar.",
        todo="Als Measure ins Modell übernehmen.",
        overall="{n} von {N} Apps definieren eigene Kennzahlen in ihren Abfragen."),
    "LIN-MISSING-TABLE": dict(
        head="Die App fragt Tabellen ab, die es im Modell nicht gibt.",
        why="Die Abfrage schlägt fehl oder liefert leere Werte, meist nach einer Umbenennung im Modell.",
        todo="Abfrage an das aktuelle Modell anpassen.",
        overall="{n} von {N} Apps verweisen auf Tabellen, die im Modell fehlen."),
    "LIN-MISSING-FIELD": dict(
        head="Die App fragt Felder ab, die es im Modell nicht (mehr) gibt.",
        why="Die Abfrage schlägt fehl oder liefert leere Werte, meist nach einer Umbenennung im Modell.",
        todo="Abfrage an das aktuelle Modell anpassen.",
        overall="{n} von {N} Apps verweisen auf Felder, die im Modell fehlen."),
    "LIN-UNKNOWN-REF": dict(
        head="{n} Verweise der App lassen sich im Modell nicht zuordnen.",
        why="Entweder fehlt das Feld oder der Scanner erkennt die Schreibweise nicht.",
        todo="Kurz prüfen, ob die Abfrage noch zum Modell passt.",
        overall="{n} von {N} Apps haben Verweise, die sich nicht zuordnen lassen."),
    "LIN-NO-MODEL": dict(
        head="Das Semantikmodell der App liegt nicht im Repository. Ihre Abfragen sind deshalb ungeprüft.",
        why="Ohne Modell lässt sich nicht prüfen, ob Felder existieren, ausgeblendet sind oder ob die App Measures nachrechnet.",
        todo="Den Workspace des Modells per Fabric-Git in dieses Repo synchronisieren oder die Zuordnung in fabscan.json eintragen.",
        overall="Bei {n} von {N} Apps fehlt das Modell im Repo; sie sind nur teilweise prüfbar."),
    "LIN-OTHER-SOURCE": dict(
        head="Die App liest direkt aus der Datenquelle, am Semantikmodell vorbei.",
        why="Measures, Beziehungen und Zeilensicherheit des Modells gelten hier nicht. In der Fabric-Lineage endet der Weg beim Lakehouse.",
        todo="Für Kennzahlen ein Semantikmodell vorschalten, sonst bewusst dokumentieren.",
        overall="{n} von {N} Apps lesen direkt aus Lakehouse oder Warehouse."),
    "LIN-FULL-TABLE": dict(
        head="{n} Tabellen werden vollständig und ungefiltert in den Browser geladen.",
        why="Alle Zeilen liegen im Browser jedes Nutzers, auch die, die er gar nicht sieht.",
        todo="Nur die nötigen Zeilen und Spalten abfragen.",
        overall="{n} von {N} Apps laden ganze Tabellen in den Browser."),
    "LIN-LOCAL-DATA": dict(
        head="Die App zeigt Daten aus mitgelieferten Dateien statt aus Fabric.",
        why="Diese Zahlen tauchen in keiner Lineage auf und veralten unbemerkt.",
        todo="Daten über Fabric anbinden oder als Beispieldaten kennzeichnen.",
        overall="{n} von {N} Apps zeigen Daten aus Dateien."),
    "LIN-CALCGROUP": dict(
        head="Die App nutzt eine Berechnungsgruppe des Modells.",
        why="Welche Zahl herauskommt, hängt vom gewählten Berechnungselement ab.",
        todo="Sicherstellen, dass die App das Element ausdrücklich wählt.",
        overall="{n} von {N} Apps nutzen Berechnungsgruppen."),
    "SEC-AUTH": dict(
        head="Die App greift mit ihrer eigenen Identität auf die Daten zu, nicht mit der des Nutzers.",
        why="Jeder, der die App öffnen darf, sieht alle Daten, die die App sehen darf. Zeilensicherheit je Person greift nicht.",
        todo="Auf delegierten Zugriff umstellen oder schriftlich festhalten, dass alle Nutzer alles sehen dürfen.",
        overall="{n} von {N} Apps lesen mit App-Identität statt als angemeldeter Nutzer."),
    "SEC-NO-RLS": dict(
        head="Das Modell hat keine Zeilensicherheit (RLS).",
        why="Wer die App öffnen darf, sieht alle Zeilen. Für Demodaten in Ordnung, für echte Finanz- oder Personaldaten nicht.",
        todo="Rollen im Modell anlegen, wenn nicht alle alles sehen sollen.",
        overall="{n} von {N} Apps arbeiten auf Modellen ohne Zeilensicherheit."),
    "SEC-HIDDEN": dict(
        head="Die App liest {n} ausgeblendete Felder.",
        why="Ausblenden ist keine Sicherheit: Jeder Leser kann ausgeblendete Felder per Abfrage abrufen. Meist sind es harmlose Sortierspalten.",
        todo="Vertrauliches mit Objekt-Sicherheit (OLS) schützen, nicht nur ausblenden.",
        overall="{n} von {N} Apps lesen ausgeblendete Felder."),
    "SEC-CDN": dict(
        head="Beim Öffnen lädt die App Schriften oder Skripte von fremden Servern (z. B. Google Fonts).",
        why="IP-Adresse und Browserdaten der Nutzer gehen an Dritte. Das ist ein Datenschutzthema (DSGVO), außerdem hängt die App an deren Verfügbarkeit.",
        todo="Schriften und Skripte lokal mit der App ausliefern.",
        overall="{n} von {N} Apps laden Schriften oder Skripte von fremden Servern."),
    "SEC-STORAGE": dict(
        head="Die App speichert etwas im Browser.",
        why="Was im Browser-Speicher liegt, bleibt nach dem Schließen erhalten. Für Einstellungen unkritisch, für Daten nicht.",
        todo="Nur Einstellungen speichern, keine Abfrageergebnisse.",
        overall="{n} von {N} Apps speichern Daten im Browser."),
    "SEC-EXTERNAL": dict(
        head="Die App schickt Anfragen an fremde Server.",
        why="Daten oder Nutzungsinformationen könnten den Tenant verlassen.",
        todo="Entfernen oder freigeben und dokumentieren.",
        overall="{n} von {N} Apps rufen fremde Server auf."),
    "SEC-SECRET": dict(
        head="Im Code steht vermutlich ein Passwort oder Schlüssel.",
        why="Jeder mit Zugriff aufs Repo kann ihn nutzen, auch nach dem Löschen noch über die Git-Historie.",
        todo="Entfernen, Schlüssel sofort austauschen, Historie bereinigen.",
        overall="{n} von {N} Apps enthalten vermutlich Geheimnisse im Code."),
    "SEC-TRACKED": dict(
        head="Eine vertrauliche Datei (z. B. .env) liegt im Repository.",
        why="Zugangsdaten im Repo sind für alle mit Lesezugriff sichtbar.",
        todo="Datei entfernen, in .gitignore aufnehmen, Werte austauschen.",
        overall="{n} von {N} Apps haben vertrauliche Dateien im Repo."),
    "SEC-CLIENT-RLS": dict(
        head="Die App filtert Daten im Browser nach dem angemeldeten Nutzer.",
        why="Das sieht nach Sicherheit aus, ist aber keine: Die Daten sind trotzdem im Browser.",
        todo="Zeilensicherheit im Modell umsetzen.",
        overall="{n} von {N} Apps filtern im Browser nach Nutzer."),
    "SEC-HTML": dict(
        head="Die App fügt HTML oder Code zur Laufzeit ein.",
        why="Ein bekanntes Einfallstor für eingeschleusten Code.",
        todo="Inhalte als Text anzeigen statt als HTML.",
        overall="{n} von {N} Apps fügen HTML zur Laufzeit ein."),
    "SEC-ASSETS": dict(head="Die Dateien der App sind ohne Anmeldung abrufbar.", why="Eingebettete Abfragen oder Daten sind öffentlich.",
                       todo="assetAccess auf protected stellen.", overall="{n} von {N} Apps liefern Dateien ohne Anmeldung aus."),
    "SEC-PASSWORD": dict(head="Neben Fabric-SSO ist eine eigene Passwort-Anmeldung aktiv.", why="Ein zweiter Zugang außerhalb von Entra.",
                         todo="Passwort-Anmeldung abschalten.", overall="{n} von {N} Apps erlauben Passwort-Anmeldung."),
    "SEC-REDIRECT": dict(head="Die Anmeldung erlaubt auch lokale Test-Adressen (localhost).", why="Für die Entwicklung praktisch, in Produktion unnötig.",
                         todo="Für Produktion eine eigene Konfiguration ohne localhost.", overall="{n} von {N} Apps erlauben localhost bei der Anmeldung."),
    "SEC-FETCH": dict(head="Die App ruft Adressen auf, die erst zur Laufzeit feststehen.", why="Meist die eigene Konfiguration, statisch nicht prüfbar.",
                      todo="Nur bei Zweifel prüfen.", overall=""),
    "QRY-HARDCODED": dict(
        head="Die Abfragen filtern auf feste Werte ({n}×), etwa ein festes Jahr, Szenario oder einen Stichtag.",
        why="Der Filter ist in der App nicht sichtbar und veraltet still, zum Beispiel zum Jahreswechsel.",
        todo="Feste Werte als sichtbare Auswahl in die App holen oder als Logik ins Modell.",
        overall="{n} von {N} Apps haben feste Filterwerte in ihren Abfragen."),
    "QRY-OVERRIDE": dict(
        head="Die App hebt Filter des Modells oder der Auswahl auf.",
        why="Zahlen können dann mehr enthalten, als der Nutzer ausgewählt hat.",
        todo="Prüfen, ob das gewollt ist, und in der App kennzeichnen.",
        overall="{n} von {N} Apps heben Filter auf."),
    "QRY-SHADOW": dict(
        head="Die App überschreibt ein Measure des Modells mit eigener Logik.",
        why="Gleicher Name, andere Zahl: Bericht und App widersprechen sich, ohne dass es jemand merkt.",
        todo="Das Measure des Modells nutzen; Änderungen im Modell machen.",
        overall="{n} von {N} Apps überschreiben Measures des Modells."),
    "QRY-REPLACE": dict(
        head="Die App verändert ihre Abfragen per Textersetzung, bevor sie ans Modell gehen.",
        why="Was wirklich abgefragt wird, steht nirgends. Mit Nutzereingaben ist das außerdem ein Einfallstor.",
        todo="Werte nur über klar definierte, geprüfte Parameter einsetzen.",
        overall="{n} von {N} Apps verändern Abfragen per Textersetzung."),
    "QRY-RUNTIME": dict(head="Die App setzt Abfragen zur Laufzeit aus Bausteinen zusammen.", why="Nur teilweise statisch prüfbar.",
                        todo="Eingaben der Nutzer immer escapen.", overall="{n} von {N} Apps bauen Abfragen zur Laufzeit."),
    "QRY-TREATAS": dict(head="Die App filtert über eigene Auswahllisten (TREATAS).", why="Üblich für Slicer und Querfilter der App.",
                        todo="Nichts, solange die Listen aus der Auswahl der Nutzer kommen.", overall=""),
    "QRY-TRUNC": dict(head="Die App schneidet Ergebnisse ab (z. B. Top 10).", why="Was fehlt, sieht der Nutzer nicht.",
                      todo="Rest als „Übrige“ zeigen.", overall="{n} von {N} Apps schneiden Ergebnisse ab."),
    "DEV-TRANSFORM": dict(
        head="Werte werden vor der Anzeige gerundet oder bereinigt ({n}×).",
        why="Gerundete Einzelwerte ergeben andere Summen als das Modell. Bereinigte Schlüssel passen nicht mehr zu anderen Berichten.",
        todo="Runden erst bei der Anzeige, Bereinigung in die Datenaufbereitung.",
        overall="{n} von {N} Apps runden oder bereinigen Werte schon in der Abfrage."),
    "DEV-NAME": dict(
        head="Kennzahlen, die es im Modell gibt, rechnet die App selbst: {names}.",
        why="Zwei Definitionen derselben Kennzahl laufen früher oder später auseinander.",
        todo="Die Measures des Modells abfragen statt nachzurechnen.",
        overall="{n} von {N} Apps rechnen Kennzahlen nach, die es im Modell schon gibt."),
}

# Reihenfolge fürs Gesamtbild (wichtigstes zuerst)
OVERALL_ORDER = ["SEC-SECRET", "SEC-TRACKED", "QRY-SHADOW", "LIN-MISSING-TABLE", "LIN-MISSING-FIELD", "SEC-AUTH",
                 "CALC-RAW", "DEV-NAME", "CALC-PROJ", "CALC-DEFINE", "QRY-HARDCODED", "DEV-TRANSFORM", "LIN-OTHER-SOURCE",
                 "LIN-NO-MODEL", "SEC-CDN", "SEC-NO-RLS", "SEC-EXTERNAL", "SEC-CLIENT-RLS", "QRY-OVERRIDE", "QRY-REPLACE",
                 "SEC-HIDDEN", "CALC-TS"]


# Gesamtbild: Befund als Stichwort, davor „n von N Apps“ (vermeidet Einzahl/Mehrzahl)
OVERALL_LABEL = {
    "CALC-RAW": "kein einziges Measure genutzt, Kennzahlen aus Einzelzeilen gerechnet",
    "CALC-TS": "Rechnungen im Browser mit Werten aus den Abfragen",
    "CALC-PROJ": "Werte in den Abfragen berechnet statt Measures abgefragt",
    "CALC-DEFINE": "eigene Kennzahlen in den Abfragen definiert",
    "LIN-MISSING-TABLE": "Verweise auf Tabellen, die im Modell fehlen",
    "LIN-MISSING-FIELD": "Verweise auf Felder, die im Modell fehlen",
    "LIN-UNKNOWN-REF": "Verweise, die sich nicht zuordnen lassen",
    "LIN-NO-MODEL": "Modell nicht im Repo, Abfragen nur teilweise prüfbar",
    "LIN-OTHER-SOURCE": "direkter Zugriff auf Lakehouse oder Warehouse, am Modell vorbei",
    "LIN-FULL-TABLE": "ganze Tabellen ungefiltert im Browser",
    "LIN-LOCAL-DATA": "Daten aus mitgelieferten Dateien",
    "SEC-AUTH": "Zugriff mit App-Identität statt als angemeldeter Nutzer",
    "SEC-NO-RLS": "Modell ohne Zeilensicherheit (RLS)",
    "SEC-HIDDEN": "ausgeblendete Felder abgefragt",
    "SEC-CDN": "Schriften oder Skripte von fremden Servern (z. B. Google Fonts)",
    "SEC-STORAGE": "Daten im Browser-Speicher",
    "SEC-EXTERNAL": "Anfragen an fremde Server",
    "SEC-SECRET": "vermutlich Geheimnisse im Code",
    "SEC-TRACKED": "vertrauliche Dateien im Repo",
    "SEC-CLIENT-RLS": "Filter nach Nutzer im Browser statt RLS im Modell",
    "QRY-HARDCODED": "feste Filterwerte in den Abfragen (Jahr, Szenario, Stichtag)",
    "QRY-OVERRIDE": "Filter des Modells oder der Auswahl aufgehoben",
    "QRY-SHADOW": "Measures des Modells in der Abfrage überschrieben",
    "QRY-REPLACE": "Abfragen per Textersetzung verändert",
    "DEV-TRANSFORM": "Werte schon in der Abfrage gerundet oder bereinigt",
    "DEV-NAME": "Kennzahlen nachgerechnet, die es im Modell schon gibt",
}
