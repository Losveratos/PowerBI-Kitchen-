# Power BI Praxis-Pfad — Verkaufszahlen 2025

> Von null zum ersten fertigen Power-BI-Dashboard in gut zwei Stunden: geführter Uebungspfad mit Beispieldaten, ohne Konto und ohne Vorkenntnisse.

- **Quelle:** https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `powerbi_praxis_pfad.html` · Stand 2026-08-05 (Git-Commit-Datum der Quelldatei)
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/powerbi_praxis_pfad.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt den Fliesstext der Seite. Interaktive Elemente (Regler, Filter, animierte Charts) sind nur in der HTML-Fassung nutzbar; die zugehoerigen Zahlen stehen hier als Tabelle.

---
Von der Installation bis zur fertigen Auswertung — in gut zwei Stunden. Kostenlos, ohne Konto, ohne Vorkenntnisse. Du kannst jederzeit pausieren.

## Modul 0 · Power BI installieren

*Etwa 15 Minuten · Du brauchst dafür kein Konto und musst nichts bezahlen.*

> ⚠️ **Nur für Windows.** Power BI Desktop gibt es nicht für Mac und nicht fürs Tablet. Wenn du an einem Mac sitzt, kommst du hier leider nicht weiter.

## Deine Aufgabe

Deine Chefin bittet dich, die Verkaufszahlen des letzten Jahres anzuschauen. Du bekommst dafür eine Datei aus dem System. Am Ende kannst du sagen: wie viel, wer, wann — und was auffällt.

## Ziel dieses Moduls

Power BI Desktop ist installiert und startet.

## So geht's

1. Öffne den **Microsoft Store** (Windows-Taste drücken, `Store` tippen, Enter).

2. Suche im Store nach **Power BI Desktop** und klicke auf **Installieren**. Das dauert ein paar Minuten — der Download ist groß.

3. Klappt der Store nicht (zum Beispiel auf einem Firmenrechner), lade das Programm stattdessen direkt bei Microsoft herunter: [powerbi.microsoft.com/desktop](https://powerbi.microsoft.com/de-de/desktop/) → **Kostenloser Download**. Für diesen Weg brauchst du Administratorrechte. Hast du die nicht, frag kurz deine IT — der Store-Weg braucht sie meist nicht.

4. Starte **Power BI Desktop**. Der erste Start dauert etwas länger als die späteren.

5. Es öffnet sich ein Fenster, das dich zum Anmelden auffordert. **Schließe es** — klick auf das X oben rechts im Fenster.

> 💡 **Du brauchst kein Konto.** Für alles in diesem Pfad reicht das Programm auf deinem Rechner. Ein Konto bräuchtest du erst, wenn du deine Auswertung im Internet mit anderen teilen willst. Das machen wir hier nicht.

1. Falls dich das Programm nach einer Datei fragt oder ein Startbildschirm erscheint: Schließ auch den. Du solltest jetzt eine große leere weiße Fläche sehen, oben ein Menüband mit **Datei · Start · Einfügen · Modellierung · Ansicht · Hilfe**.

## ✅ Kontrollpunkt

> Power BI Desktop ist offen und zeigt eine leere weiße Fläche. Oben links steht **Datei**, daneben **Start**. Siehst du das nicht? → Häufigste Ursache: Das Anmeldefenster liegt noch darüber oder hinter dem Hauptfenster — klick es weg.

## Weiter

→ Modul 1 · Daten anbinden

## Modul 1 · Daten anbinden

*Etwa 15 Minuten*

## Ziel dieses Moduls

Die Datei `verkaeufe_2025.csv` liegt in Power BI und du hast einmal draufgeschaut.

## So geht's

Menüband „Start" — der rote Rahmen zeigt „Daten abrufen".

1. Klicke im Menüband auf **Start → Daten abrufen**. Es klappt eine Liste auf.

2. Wähle darin **Web**. (Steht es nicht in der Liste: **Mehr…** ganz unten, dann links **Andere**, dann **Web**.)

3. Ein Fenster **Aus dem Web** geht auf. Kopiere diese Adresse in das Feld **URL**:

`https://raw.githubusercontent.com/Losveratos/powerbi-einstieg/main/data/business/verkaeufe_2025.csv`

Klick dann auf **OK**. 4. Jetzt fragt Power BI, wie es sich anmelden soll. Wähle links **Anonym** und klick auf **Verbinden**. Anonym heißt: Die Datei ist öffentlich, es braucht kein Passwort. 5. Du siehst eine Vorschau der Daten. Sie sieht unordentlich aus — die Spalten heißen `Column1`, `Column2` und so weiter, und in der ersten Zeile steht Kauderwelsch. **Das ist so gewollt.** Genau das räumen wir im nächsten Modul auf. 6. Klick unten rechts auf **Laden**. Nicht auf „Daten transformieren" — das kommt gleich. 7. Rechts erscheint der Bereich **Daten**, darin die Tabelle **verkaeufe_2025**. Klick darauf, dann klappen die Spalten auf. 8. Schau dir die Tabelle einmal ganz an: Klick links am Bildschirmrand auf das mittlere der drei Symbole — die **Tabellenansicht** (ein Gittersymbol). Jetzt siehst du die Daten wie in einer Tabelle.

**Zeile und Spalte.** Eine **Zeile** ist ein einzelner Vorgang — hier: ein Auftrag. Eine **Spalte** ist eine Eigenschaft, die jeder Vorgang hat — hier zum Beispiel das Datum oder die Region. Alles, was du gleich baust, beruht auf dieser einen Idee.

## ✅ Kontrollpunkt

> Ganz unten am Bildschirmrand steht: **verkaeufe_2025 (2.405 Zeilen)**. Steht da was anderes? → Häufigste Ursache: Bei der Anmeldung war nicht **Anonym** ausgewählt, oder die Adresse wurde beim Kopieren abgeschnitten. Lösch die Abfrage rechts (Rechtsklick auf **verkaeufe_2025** → **Aus Bericht löschen**) und fang bei Schritt 1 neu an. Geht es gar nicht? Lade die Datei stattdessen herunter ([verkaeufe_2025.csv](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/verkaeufe_2025.csv)) und binde sie über **Start → Daten abrufen → Text/CSV** ein. Der Rest der Anleitung bleibt gleich.

## Weiter

→ Modul 2 · Aufräumen

## Modul 2 · Aufräumen

*Etwa 25 Minuten · Das ist das längste Modul. Danach wird es leichter.*

## Ziel dieses Moduls

Aus der unordentlichen Datei wird eine saubere Tabelle mit richtigen Spaltennamen und richtigen Datentypen.

## Vorher: warum überhaupt?

Rohdaten aus einem System sind nie sauber. In dieser Datei stecken fünf typische Probleme: eine Müllzeile ganz oben, fehlende Spaltenüberschriften, leere Zeilen mittendrin, Leerzeichen hinter manchen Werten und Zahlen, die Power BI für Text hält. Alle fünf reparieren wir jetzt — mit **8 Handgriffen**.

## So geht's

Derselbe Menüband-Bereich — jetzt ist „Daten transformieren" markiert.

Klick zuerst im Menüband auf **Start → Daten transformieren**. Es öffnet sich ein neues Fenster: der **Power Query-Editor**. Hier arbeitest du das ganze Modul.

Rechts siehst du eine Liste **Angewendete Schritte**. Dort erscheint jeder Handgriff als Eintrag. Merk dir die Liste — dazu unten mehr.

**Handgriff 1 — Müllzeile weg** Klick auf **Start → Zeilen entfernen → Obere Zeilen entfernen**. Tippe **1** ein und klick **OK**. Die Zeile mit dem Kauderwelsch ist weg.

**Handgriff 2 — Überschriften setzen** Klick auf **Start → Erste Zeile als Überschrift verwenden**. Aus `Column1` wird `Auftragsdatum`, aus `Column2` wird `Region` und so weiter.

**Handgriff 3 — leere Zeilen weg** Klick auf **Start → Zeilen entfernen → Leere Zeilen entfernen**.

**Handgriff 4 — Leerzeichen abschneiden** Klick oben auf die Spaltenüberschrift **Region**, sodass die Spalte markiert ist. Dann: **Transformieren → Format → Kürzen**. Damit verschwinden die unsichtbaren Leerzeichen hinter manchen Werten. Ohne diesen Schritt wären `Nord` und `Nord` später zwei verschiedene Regionen.

**Handgriff 5 — Schreibweise vereinheitlichen** Klick auf die Spaltenüberschrift **Produktgruppe**. Dann: **Transformieren → Format → Jedes Wort großschreiben**. Aus `bürobedarf` wird `Bürobedarf`. Auch hier gilt: Für Power BI sind Groß- und Kleinschreibung zwei verschiedene Dinge.

**Handgriff 6 — Datum ist ein Datum** Klick auf die Spaltenüberschrift **Auftragsdatum**. Links neben dem Namen steht ein kleines Symbol: **ABC** — das heißt „Power BI hält das für Text". Klick auf das Symbol und wähle **Datum**. Das Symbol wird zu einem Kalender.

**Handgriff 7 — Umsatz ist eine Zahl** Klick auf die Spaltenüberschrift **Umsatz**. Klick jetzt **nicht** auf das ABC-Symbol, sondern mach einen **Rechtsklick** auf die Überschrift und wähle **Typ ändern → Gebietsschema verwenden…**. Im Fenster stellst du ein: - Datentyp: **Dezimalzahl** - Gebietsschema: **Englisch (USA)**

Klick **OK**.

> Warum der Umweg? In der Datei stehen die Zahlen mit einem **Punkt** als Komma: `1796.80`. Dein Windows ist auf Deutsch eingestellt und liest den Punkt als Tausendertrennzeichen — aus 1796.80 € würden 179.680 €. Mit „Gebietsschema: Englisch (USA)" sagst du Power BI: *Diese Datei kommt aus einem englischsprachigen System, lies den Punkt als Komma.*

**Handgriff 8 — Marge ist eine Zahl** Dasselbe noch einmal für die Spalte **Marge**: Rechtsklick auf die Überschrift → **Typ ändern → Gebietsschema verwenden…** → Datentyp **Dezimalzahl**, Gebietsschema **Englisch (USA)** → **OK**.

**Fertig — jetzt zurück** Klick oben links auf **Start → Schließen & übernehmen**. Das Fenster schließt sich und Power BI lädt die saubere Tabelle.

## Die Schrittliste ist dein Rezept

Rechts im Power Query-Editor stand die Liste **Angewendete Schritte**. Das ist kein Protokoll, sondern ein Rezept: Power BI arbeitet diese Liste jedes Mal neu ab, wenn die Daten aktualisiert werden. Du kannst jeden Schritt anklicken und sehen, wie die Tabelle an dieser Stelle aussah, und du kannst jeden Schritt mit dem **X** davor wieder löschen. Nichts, was du hier tust, ist endgültig — und die Ursprungsdatei wird nie verändert.

**Transformation.** Eine Transformation ist ein Handgriff, der die Form der Daten ändert, ohne die Ursprungsdatei anzufassen — zum Beispiel eine Spalte umbenennen, Leerzeichen abschneiden oder aus Text ein Datum machen.

## ✅ Kontrollpunkt

> Klick links am Bildschirmrand auf die **Tabellenansicht** (Gittersymbol). Ganz unten steht: **verkaeufe_2025 (2.400 Zeilen)**. Die Tabelle hat **6 Spalten** mit richtigen Namen, und in der Spalte **Auftragsdatum** stehen Datumsangaben, keine Textzeilen. Steht da eine andere Zahl? → Häufigste Ursache: Handgriff 1 und 2 wurden vertauscht — die Überschriften müssen gesetzt werden, *nachdem* die Müllzeile weg ist. Öffne **Start → Daten transformieren**, lösch rechts in **Angewendete Schritte** alles außer **Quelle** und **Geänderter Typ** und mach ab Handgriff 1 weiter. Oder: [Checkpoint-Datei laden](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/business_checkpoint_geputzt.pbix) und mit Modul 3 weitermachen. Öffne die Datei einfach per Doppelklick — sie ist genau auf diesem Stand.

## Weiter

→ Modul 3 · Erste Antworten

## Modul 3 · Erste Antworten

*Etwa 25 Minuten*

## Ziel dieses Moduls

Drei Bilder auf der Seite, die drei Fragen beantworten: wie viel insgesamt, wer, und wann.

## So geht's

Klick links am Bildschirmrand auf das oberste der drei Symbole: die **Berichtsansicht**. Du siehst eine leere weiße Seite. Rechts stehen zwei Bereiche: **Visualisierungen** (die Symbolsammlung) und **Daten** (deine Tabelle).

### Bild 1 — die große Zahl: Wie viel insgesamt?

1. Klick auf eine leere Stelle der weißen Seite.

2. Klick im Bereich **Visualisierungen** auf das Symbol **Karte** — es sieht aus wie ein Kästchen mit den Ziffern **123** darin.

Der Bereich „Visualisierungen“ — markiert ist das Symbol „Karte“.

(Achtung: Es gibt auch ein Symbol mit einer Weltkugel, das ebenfalls „Karte" heißt. Das ist eine Landkarte — nimm das mit den Ziffern.) 3. Auf der Seite erscheint ein leeres graues Kästchen. 4. Klapp im Bereich **Daten** die Tabelle **verkaeufe_2025** auf und setz das Häkchen bei **Umsatz**. In dem Kästchen erscheint eine Zahl. 5. Die Zahl steht dort abgekürzt: **2,10 Mio.** Power BI kürzt große Zahlen von sich aus — „Mio." heißt Millionen. Das ist so in Ordnung und bleibt auch so; für die Frage „wie viel insgesamt?" reicht diese Genauigkeit völlig. 6. Schieb das Kästchen nach links oben und zieh es an einer Ecke etwas größer, damit die Zahl gut lesbar ist.

### Bild 2 — die Balken: Wer?

1. Klick auf eine leere Stelle der Seite.

2. Klick im Bereich **Visualisierungen** auf **Gestapeltes Balkendiagramm** (waagerechte Balken).

3. Setz im Bereich **Daten** die Häkchen bei **Region** und bei **Umsatz**. Power BI legt Region auf die Y-Achse und Umsatz auf die X-Achse.

4. Power BI sortiert die Balken von sich aus nach Größe — der längste steht oben. Sollte das bei dir anders sein: Fahr mit der Maus über das Diagramm, klick oben rechts auf die **drei Punkte (…)** → **Achse sortieren** → **Umsatz**, und noch einmal **… → Achse sortieren → Absteigend sortieren**.

### Bild 3 — die Linie: Wann?

1. Klick auf eine leere Stelle der Seite.

2. Klick auf **Liniendiagramm**.

3. Setz die Häkchen bei **Auftragsdatum** und **Umsatz**.

4. Power BI zeigt jetzt nur einen einzigen Punkt — es fasst alles zum Jahr zusammen. Schau rechts unter **Visualisierungen** in das Feld **X-Achse**: Dort steht `Auftragsdatum` mit vier Einträgen darunter — **Jahr, Quartal, Monat, Tag**. Klick bei **Jahr**, **Quartal** und **Tag** jeweils auf das **X**. Übrig bleibt **Monat** — und die Linie zeigt zwölf Punkte, Januar bis Dezember.

5. Schieb die drei Bilder so, dass sie sich nicht überlappen. Ordentlich ist: die Karte oben links, das Balkendiagramm rechts daneben, die Linie darunter über die ganze Breite.

**Dimension und Kennzahl.** Eine **Kennzahl** ist das, was du misst — hier der Umsatz. Eine **Dimension** ist das, wonach du sie aufteilst — hier die Region oder der Monat. Jedes Diagramm, das du je bauen wirst, ist eine Kennzahl, aufgeteilt nach einer Dimension.

## ✅ Kontrollpunkt

> Die Karte zeigt: **2,10 Mio.** Im Balkendiagramm steht **Süd** ganz oben. Steht dort stattdessen **210,01 Mio.** → Dann wurde in Modul 2 der Umsatz ohne **Gebietsschema Englisch (USA)** umgewandelt. Power BI hat den Punkt als Tausendertrennzeichen gelesen, dadurch sind alle Beträge hundertmal zu groß. Geh zurück zu Modul 2, Handgriff 7. Steht dort eine viel kleinere Zahl oder „(Leer)"? → Dann ist statt der Summe die Anzahl eingestellt. Klick rechts im Feld **Wert** auf den kleinen Pfeil neben **Umsatz** und wähle **Summe**. Willst du es ganz genau wissen: Die Summe auf den Euro beträgt **2.100.088**. Sehen kannst du sie, indem du in der Tabellenansicht die Spalte **Umsatz** anklickst und unter **Spaltentools** die **Dezimalstellen** auf `0` stellst — nötig ist das aber nicht. Oder: [Checkpoint-Datei laden](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/business_checkpoint_geputzt.pbix) und ab Schritt 1 dieses Moduls neu anfangen.

## Weiter

→ Modul 4 · Filtern

## Modul 4 · Filtern

*Etwa 15 Minuten · Das kürzeste Modul — und das mit dem größten Aha.*

## Ziel dieses Moduls

Du kannst mit einem Klick alle drei Bilder gleichzeitig auf einen Ausschnitt der Daten einschränken.

## So geht's

1. Klick auf eine leere Stelle der Seite.

2. Klick im Bereich **Visualisierungen** auf **Datenschnitt** — das Symbol sieht aus wie ein Trichter mit einem Regler.

3. Setz im Bereich **Daten** das Häkchen bei **Produktgruppe**. Im Datenschnitt erscheint eine Liste mit fünf Einträgen und je einem Kästchen davor.

4. Schieb den Datenschnitt an eine freie Stelle, zum Beispiel unten links.

5. Klick jetzt im Datenschnitt auf **Technik**.

**Schau auf die ganze Seite, nicht nur auf den Datenschnitt.** Die große Zahl ist kleiner geworden, die Balken sind kürzer, die Linie hat sich verändert. Alle drei Bilder haben gleichzeitig reagiert — du musstest sie nicht einzeln umstellen.

Ein Klick im Datenschnitt (rot markiert) verändert alle Bilder der Seite gleichzeitig.

1. Klick noch einmal auf **Technik**, um die Auswahl aufzuheben. Alles ist wieder wie vorher.

### Das geht auch ohne Datenschnitt

1. Klick im **Balkendiagramm** direkt auf den Balken **Nord**. Wieder reagiert die ganze Seite: Die Karte zeigt jetzt nur noch den Umsatz von Nord, die Linie zeigt nur noch Nords Verlauf. Jedes Diagramm ist also gleichzeitig ein Filter.

2. Lass diesen Klick einen Moment stehen — die Zahl brauchst du gleich für den Kontrollpunkt.

**Filter.** Ein Filter schränkt ein, welche Zeilen gerade gezählt werden. Das Entscheidende: Er wirkt auf alle Bilder der Seite zusammen. Deshalb ist ein Bericht kein Bild, sondern ein Werkzeug — dieselbe Seite beantwortet je nach Filter Dutzende Fragen.

## ✅ Kontrollpunkt

> Bei angeklicktem Balken **Nord** zeigt die Karte: **480,98 Tsd.** („Tsd." heißt Tausend — die genaue Summe wäre 480.981). Steht da etwas anderes? → Häufigste Ursache: Es ist noch zusätzlich eine Produktgruppe im Datenschnitt ausgewählt. Klick sie ab, sodass kein Kästchen mehr markiert ist, und klick dann erneut auf den Balken. Oder: [Checkpoint-Datei laden](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/business_checkpoint_visuals.pbix) und mit Modul 5 weitermachen.

**Wichtig für das nächste Modul:** Klick zum Schluss auf eine leere Stelle der Seite, damit kein Filter mehr aktiv ist.

## Weiter

→ Modul 5 · Nicht jede Zahl darf man addieren

## Modul 5 · Nicht jede Zahl darf man addieren

*Etwa 20 Minuten · Hier kommt die Antwort auf die Eingangsfrage.*

## Ziel dieses Moduls

Du siehst, was passiert, wenn Power BI automatisch summiert — und findest damit die Auffälligkeit in den Daten.

## So geht's

### Erst der Fehler

1. Klick auf eine leere Stelle der Seite.

2. Klick auf das Symbol **Karte** (das mit den Ziffern 123) — wie in Modul 3.

3. Setz im Bereich **Daten** das Häkchen bei **Marge**.

4. Schau dir die Zahl an.

Bei dir sollte jetzt etwas Absurdes stehen — rund **763,64**. Wenn ja: perfekt, genau das soll passieren.

Eine Marge von 763,64 gibt es nicht. Was Power BI hier gemacht hat: Es hat alle 2.400 Margen **addiert**. Das tut es bei jeder Zahlenspalte automatisch, weil das bei Umsätzen ja auch richtig ist. Bei einer Marge ist es Unsinn — 30 % plus 30 % sind nicht 60 %.

### Dann die Reparatur

1. Schau rechts unter **Visualisierungen** in das Feld **Wert**. Dort steht `Summe von Marge`. Klick auf den kleinen **Pfeil nach unten** direkt daneben.

2. Es klappt eine Liste auf: **Summe · Mittelwert · Minimum · Maximum · Anzahl (eindeutig) · Anzahl** und weitere. Wähle **Mittelwert**.

Das aufgeklappte Menü — „Mittelwert“ ist der Eintrag, den du brauchst.

> In der Karte steht danach `Durchschnitt von Marge`. Power BI benutzt für dieselbe Sache mal „Mittelwert", mal „Durchschnitt" — gemeint ist beides Mal: alle Werte zusammenzählen und durch ihre Anzahl teilen.

1. Die Zahl ist jetzt klein, etwa `0,32`. Das stimmt zwar, liest sich aber schlecht. Also formatieren wir die Spalte einmal richtig: - Klick links am Bildschirmrand auf die **Tabellenansicht** (Gittersymbol). - Klick oben auf die Spaltenüberschrift **Marge**. - Im Menüband erscheint der Reiter **Spaltentools**. Klick dort auf das **%-Zeichen** (in der Gruppe *Formatierung*). - Stell rechts daneben die **Dezimalstellen** von `Auto` auf **1**. - Zurück zur **Berichtsansicht** (oberstes Symbol links).

## ✅ Kontrollpunkt

> Die zweite Karte zeigt jetzt: **31,8 %**. Steht da etwas anderes? → Häufigste Ursache: Im Feld **Wert** steht noch `Summe von Marge` statt `Durchschnitt von Marge`. Prüf Schritt 5 und 6. Oder: [Checkpoint-Datei laden](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/business_checkpoint_visuals.pbix) und ab Schritt 8 weitermachen.

### Und jetzt die eigentliche Frage: Was fällt auf?

1. Klick auf eine leere Stelle der Seite.

2. Klick auf **Liniendiagramm**.

3. Setz die Häkchen bei **Auftragsdatum** und **Marge**.

4. Reduziere die X-Achse wieder auf den Monat: Klick im Feld **X-Achse** bei **Jahr**, **Quartal** und **Tag** jeweils auf das **X**.

5. Stell auch hier die Aggregation um: Klick im Feld **Y-Achse** auf den Pfeil neben `Summe von Marge` → **Mittelwert**.

6. Jetzt der entscheidende Handgriff: Zieh im Bereich **Daten** das Feld **Region** mit gedrückter Maustaste in das Feld **Legende** (rechts unter *Visualisierungen*). Aus einer Linie werden vier — eine je Region.

7. Schau dir das Bild an. Bis April laufen alle vier Linien eng beieinander bei rund 34 %. Ab April bricht eine Linie nach unten weg und bleibt unten: **Nord**, bei rund 23 %. Die anderen drei bleiben bei rund 34 %.

**Das ist die Antwort auf die Eingangsfrage.** Der Umsatz in Nord ist unauffällig — deshalb wäre es in Modul 3 niemandem aufgefallen. Aber von jedem Euro Umsatz bleibt in Nord seit April deutlich weniger übrig.

> **Für Genaue:** Ein einfacher Durchschnitt über alle Aufträge gewichtet jeden Auftrag gleich — ein 50-€-Auftrag zählt so viel wie ein 5.000-€-Auftrag. Sauber wäre eine nach Umsatz gewichtete Marge. Für „fällt hier etwas auf?" reicht der Durchschnitt völlig; die gewichtete Rechnung kommt im Aufbaupfad.

**Aggregation.** Aggregation ist die Entscheidung, wie viele Zeilen zu einer Zahl zusammengefasst werden: addieren, mitteln, zählen, größten Wert nehmen. Power BI wählt automatisch „addieren" — das ist eine Annahme, keine Wahrheit. Bei jeder Kennzahl, die ein Anteil, ein Preis, eine Note oder ein Stand ist, musst du die Entscheidung selbst treffen.

## Weiter

→ Modul 6 · Fertig machen

## Modul 6 · Fertig machen

*Etwa 15 Minuten*

## Ziel dieses Moduls

Dein Bericht hat einen Titel, sieht aufgeräumt aus und liegt als PDF auf deinem Rechner.

## So geht's

1. **Titel einfügen.** Klick im Menüband auf **Einfügen → Textfeld**. Es erscheint ein Kästchen. Tipp hinein: `Verkaufszahlen 2025` Markier den Text und stell in der kleinen Leiste darunter die Schriftgröße auf **28** ein. Schieb das Textfeld an den oberen Rand der Seite.

2. **Aufräumen.** Ordne die fünf Bilder so an, dass nichts überlappt und nichts über den Seitenrand ragt. Ein einfaches Raster, das immer funktioniert: - oben: der Titel über die ganze Breite - darunter links: die zwei Karten nebeneinander - rechts daneben: das Balkendiagramm - unten über die ganze Breite: die beiden Liniendiagramme nebeneinander - der Datenschnitt in eine freie Ecke

3. **Seite benennen.** Ganz unten steht ein Reiter **Seite 1**. Doppelklick darauf und tipp `Überblick`.

4. **Speichern.** **Datei → Speichern unter**, Dateiname zum Beispiel `business_fertig`, Endung `.pbix`. Speicher die Datei irgendwo, wo du sie wiederfindest.

5. **Als PDF exportieren.** **Datei → Exportieren → In PDF exportieren**. Power BI erzeugt eine PDF-Datei mit deiner Seite und öffnet sie.

Datei → Exportieren — markiert ist „In PDF exportieren“.

> **Und wenn ich das teilen will?** Im Menüband gibt es einen Knopf **Veröffentlichen**. Der lädt den Bericht ins Internet, damit andere ihn anschauen können — dafür brauchst du allerdings ein Geschäfts- oder Schulkonto. Mit einer privaten Adresse geht das nicht. Für diesen Pfad ist das PDF der Abschluss.

**Visual.** Jedes einzelne Bild auf der Seite — Karte, Balken, Linie, Datenschnitt — heißt in Power BI ein **Visual**. Eine Seite voller Visuals, die sich gegenseitig filtern, ist ein **Bericht**.

## ✅ Kontrollpunkt

> Auf deinem Rechner liegt eine PDF-Datei mit deiner Seite darauf. Sie zeigt den Titel, fünf Bilder und den Datenschnitt. Fehlt im PDF etwas? → Häufigste Ursache: Ein Visual ragte über den Seitenrand hinaus. Zurück in Power BI, das Visual ganz auf die Seite schieben, neu exportieren. Oder: [fertigen Bericht ansehen](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/business_fertig.pbix) — so hätte es aussehen können.

## 🎉 Geschafft

Du hast eine unordentliche Datei aus einem System genommen, sie sauber gemacht, drei Fragen daran beantwortet, sie filterbar gemacht und dabei etwas gefunden, das auf den ersten Blick nicht zu sehen war. Das ist der komplette Ablauf — bei jedem echten Projekt ist es genau dieser, nur mit mehr Daten.

## Dein Glossar

Sieben Wörter, die du jetzt kennst:

| Wort | Bedeutung in einem Satz |
|---|---|
| **Zeile und Spalte** | Eine Zeile ist ein Vorgang, eine Spalte eine Eigenschaft, die jeder Vorgang hat. |
| **Transformation** | Ein Handgriff, der die Form der Daten ändert, ohne die Ursprungsdatei anzufassen. |
| **Visual** | Ein einzelnes Bild auf der Seite — Karte, Balken, Linie, Datenschnitt. |
| **Dimension** | Das, wonach du aufteilst: Region, Monat, Produktgruppe. |
| **Kennzahl** | Das, was du misst: Umsatz, Marge, Anzahl. |
| **Filter** | Eine Einschränkung, welche Zeilen gerade zählen — sie wirkt auf alle Visuals gleichzeitig. |
| **Aggregation** | Die Entscheidung, wie viele Zeilen zu einer Zahl werden: addieren, mitteln, zählen. |

## Und weiter?

- **Optional, 10 Minuten:** Exkurs · Warum deine Excel-Tabelle nicht passt
- Nimm eine eigene Datei und mach genau dasselbe damit. Das ist die beste Übung.

## Exkurs · Warum deine Excel-Tabelle nicht passt

*Etwa 10 Minuten · Optional. Gehört nicht zum Pfad — du kannst ihn überspringen.*

Wenn du nach diesem Pfad eine eigene Excel-Datei in Power BI lädst, passiert oft etwas Verwirrendes: Es geht nicht. Dieser Exkurs erklärt in einem Satz, warum.

## Der Kernsatz

**Menschen lesen Kreuztabellen, Maschinen lesen lange Tabellen.**

Eine Kreuztabelle sieht so aus — und für ein Auge ist sie großartig:

| Region | Januar | Februar | März |
|---|---|---|---|
| Nord | 12.400 | 11.900 | 13.100 |
| Süd | 14.200 | 15.000 | 14.800 |

Das Problem: Der Monat steht hier nicht *in* der Tabelle, sondern *über* ihr — als Spaltenüberschrift. Power BI kann aber nur mit dem arbeiten, was in Zeilen und Spalten steht. Es sieht drei Kennzahlen namens „Januar", „Februar", „März" und keine Dimension „Monat". Ein Liniendiagramm über die Zeit ist damit unmöglich.

Dieselben Daten als lange Tabelle:

| Region | Monat | Umsatz |
|---|---|---|
| Nord | Januar | 12.400 |
| Nord | Februar | 11.900 |
| Nord | März | 13.100 |
| Süd | Januar | 14.200 |
| Süd | Februar | 15.000 |
| Süd | März | 14.800 |

Unhandlich zu lesen, aber jetzt gibt es eine Spalte **Monat** — eine Dimension, wie du sie in Modul 3 benutzt hast. Genau so wollen es alle Auswertungswerkzeuge.

## Der Handgriff dazu heißt Entpivotieren

Du brauchst das nicht auswendig zu lernen, nur wiedererkennen:

1. Datei in Power BI laden, **Start → Daten transformieren**.

2. Die Spalte anklicken, die *bleiben* soll — hier **Region**.

3. **Transformieren → Spalten entpivotieren → Andere Spalten entpivotieren**.

Power BI macht aus den Monatsspalten zwei neue Spalten: **Attribut** (der Monatsname) und **Wert** (die Zahl). Die kannst du dann umbenennen, und die Tabelle ist lang statt breit.

## Wenn du weitermachen willst

Dieser Pfad hatte genau **eine** Tabelle. Echte Auswertungen haben mehrere — Aufträge, Kunden, Produkte, Kalender — die über gemeinsame Schlüssel verbunden werden. Diese Verbindungen heißen **Beziehungen**, und die übliche Anordnung dafür heißt **Sternschema**. Das ist der nächste Schritt, wenn dir eine Tabelle nicht mehr reicht.

## Zurück

→ Modul 6 · Fertig machen

Alle Kontrollzahlen in diesem Pfad sind aus den echten Daten berechnet und in Power BI Desktop nachgeprüft. Die Datenquelle ist simuliert: [verkaeufe_2025.csv](https://raw.githubusercontent.com/Losveratos/powerbi-einstieg/main/data/business/verkaeufe_2025.csv).

Steckst du fest? An jedem Kontrollpunkt liegt eine fertige Datei zum Weitermachen. [Den Endstand ansehen](https://github.com/Losveratos/powerbi-einstieg/releases/latest/download/business_fertig.pbix).

[← Zurück zur Knowledge Kitchen](index.html)
