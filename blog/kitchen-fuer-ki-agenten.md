# Die Kitchen spricht jetzt Markdown

> **ENTWURF** — noch nicht veröffentlicht, nicht verlinkt. Nach Freigabe: HTML-Fassung bauen, Startseiten-Kachel, llms.txt-Eintrag.

*Warum unsere Website eine zweite Ausgabe für KI-Agenten bekommen hat — und was dabei schiefgegangen wäre, wenn wir es nicht gemerkt hätten.*

---

## Wer liest eigentlich noch Websites?

Immer öfter: niemand. Gelesen wird trotzdem — nur eben von einem KI-Agenten, der die Frage eines Menschen beantwortet. „Wie binde ich in Power BI eine Excel-Datei an?", „Welches Visual kann IBCS-Varianzen?", „Was kostet ein klimaneutrales Stromsystem?" Der Mensch fragt seinen Assistenten, der Assistent holt sich die Antwort — idealerweise bei der Quelle.

Und da beginnt das Problem. Unsere Website ist für Menschen gebaut: Kachel-Layouts, klickbare Detail-Karten, Scrollytelling, interaktive Regler. Der Power-BI-Einsteiger-Guide ist als HTML-Datei 388 KB groß, und der eigentliche Inhalt — 87 Detail-Karten mit Schritt-für-Schritt-Anleitungen — steckt in einem JavaScript-Block, der erst beim Klick ein Modal öffnet. Ein Agent, der diese Seite abruft, sieht: eine leere Hülle aus Navigations-Markup. Die Anleitungen, für die die Seite existiert, sieht er nicht.

Wir haben also eine Website, die für ihre neuen Leser unsichtbar ist.

## Was wir gebaut haben

Seit dieser Woche gibt es jede Inhaltsseite der Kitchen in zwei Ausgaben:

1. **Die HTML-Fassung für Menschen** — unverändert, mit allem Klickbaren.
2. **Eine Markdown-Fassung für Maschinen** unter `/md/` — derselbe Inhalt als sauberer, strukturierter Text. Der 388-KB-Guide wird darin zu 200 KB purem Inhalt: alle 87 Karten aufgelöst, alle 56 Code-Beispiele als korrekt ausgezeichnete DAX- und Power-Query-Blöcke.

Den Einstieg macht eine Datei namens **[llms.txt](https://datenwgknowledgekitchen.com/llms.txt)** im Wurzelverzeichnis — eine Konvention von llmstxt.org, die sich gerade als das robots.txt des KI-Zeitalters etabliert. Sie ist ein kuratierter Index: was es auf der Site gibt, was in welcher Markdown-Datei steht, und welche Regeln bei der Weiterverwendung gelten. Dazu ein Volltext-Bündel (`llms-full.txt`) für Agenten, die lieber einmal alles laden.

Jede Seite verweist außerdem selbst auf ihre Maschinen-Ausgabe: unsichtbar im Head (`<link rel="alternate" type="text/markdown">`) und sichtbar als kleiner „📄 Als Markdown"-Link im Footer — den kann man auch einfach kopieren und seinem Agenten in den Chat werfen.

## Wieso nicht einfach kopieren?

Die naive Lösung wäre: Inhalte einmal von Hand nach Markdown kopieren, fertig. Die Falle daran ist nicht der Aufwand — es ist die Drift. Die Website ändert sich ständig (allein der Podcast-Guide wächst mit jeder Folge), und eine Handkopie ist ab Tag eins ein zweites Pflegeobjekt, das leise veraltet. Eine veraltete Maschinen-Ausgabe ist schlimmer als keine: Der Agent zitiert dann mit voller Überzeugung den Stand von vorletztem Monat.

Deshalb sind die Markdown-Fassungen **generiert, nicht geschrieben**. Zwei Skripte im Repo lesen die HTML-Seiten bzw. die Episodendaten und erzeugen daraus die `/md/`-Dateien — deterministisch (zweimal bauen ergibt byte-identische Dateien) und mit einem Prüfmodus, der Abweichungen meldet. Der Episoden-Guide mit seinen 143 Folgen entsteht direkt aus derselben Datenkonstante, aus der auch die Webseite rendert — inklusive Kapitel-Sprungmarken als YouTube-Links mit Zeitstempel.

## Was dabei fast schiefgegangen wäre

Zwei Fundstücke aus der Umsetzung, die jeder kennen sollte, der so etwas nachbaut:

**GitHub Pages jagt Markdown durch eine Template-Engine.** Standardmäßig rendert Jekyll jede `.md`-Datei — und schickt sie dabei durch Liquid. Die Power-Query-Zeile `Table.Sort({{"Datum", Order.Descending}})` ist gültiges M und gleichzeitig eine Liquid-Variable. Ergebnis: eine harmlose Warnung im Build-Log und **stillschweigend verstümmelter Code auf der Seite** — `Table.Sort(Datum)`. Kein Abbruch, kein roter Balken. Die Lösung ist eine Zeile in der `_config.yml`, die `.md` zur statischen Datei erklärt; die Begründung steht ausführlich in unserem `md/README.md`.

**Zwei Ausgaben, eine Wahrheit.** Die Schnellstart-Seite zeigt die Versionsnummer des ChartKitchen-Visuals dynamisch aus einer JSON an — im statischen Markup steht eine alte Nummer. Eine naive Konvertierung hätte also eine falsche Version behauptet. Der Generator löst das, indem er beim Bauen dieselbe JSON liest wie die Webseite. Die Regel dahinter ist allgemein: Wo eine Seite ihre Zahlen zur Laufzeit lädt, muss die Maschinen-Ausgabe aus denselben Daten gebaut werden, nicht aus dem Markup.

## Ehrlichkeit ist eine Schnittstelle

Der Teil, der uns am wichtigsten ist: Die `llms.txt` transportiert nicht nur Links, sondern **Regeln**. Unsere datenjournalistischen Arbeiten tragen je Zahl eine Konfidenzstufe (A mehrfach belegt bis M Modellsetzung) — und der Index sagt Agenten ausdrücklich, dass eine Zahl ohne ihre Konfidenzstufe die Aussage verfälscht. Ob sich jedes Modell daran hält, können wir nicht erzwingen. Aber wir können die ehrliche Weitergabe so leicht wie möglich machen — und die unehrliche zumindest zu einer aktiven Entscheidung.

Angefangen hat das alles übrigens eine Nummer kleiner: mit dem [AGENT-GUIDE](https://datenwgknowledgekitchen.com/ibcsInspiredChartDeck/AGENT-GUIDE.md) für unser ChartKitchen-Visual — einer maschinenlesbaren Referenz, mit der ein KI-Agent Power-BI-Berichte korrekt konfigurieren kann. Die Erfahrung daraus: Wenn man Maschinen gute Dokumente gibt, machen sie gute Arbeit. Die MD-Ausgabe der ganzen Site ist nur die konsequente Fortsetzung.

## Selbst ausprobieren

Wirf `https://datenwgknowledgekitchen.com/llms.txt` in den Chat deines Lieblings-Agenten und stell eine Frage zu Power BI, Fabric oder unseren Analysen. Und wenn du selbst eine Inhalts-Website betreibst, sind das die vier Regeln, die wir mitgenommen haben:

1. **Generieren statt kopieren** — eine Handkopie driftet, ein Skript nicht.
2. **`llms.txt` als kuratierter Index** — nicht jede Seite, sondern die, die Substanz haben; Werkzeuge und Spiele bleiben draußen.
3. **Die Auslieferung prüfen** — Markdown muss roh ankommen, nicht durch eine Template-Engine gedreht.
4. **Regeln mitliefern** — Zitierweise, Datenstand, Konfidenz. Agenten lesen das tatsächlich.

*Michael Tenner · Daten-WG Knowledge Kitchen*
