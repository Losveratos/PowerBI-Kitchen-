# Ist KI das neue Papier — und Markdown der neue Stift?

> Markdown-Fassung von [prototyping-pnl-treiberbaum.html](../prototyping-pnl-treiberbaum.html) · https://datenwgknowledgekitchen.com/prototyping-pnl-treiberbaum.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

Post · Prototyping & KI

Stirbt das klassische Papier-Prototyping für Reports, Dashboards und Business-Anwendungen? Mein Ziel war ein **P&L-Prototyp, den ich einer internationalen Organisation im produzierenden Sektor pitchen kann** — mehrsprachig, mit Simulation, mit regionalen Farbkonventionen. Statt Skizzen auf Papier: eine Markdown-Datei mit Specs, drei Claude-Werkzeuge, und am Ende ein klickbarer Prototyp samt Demo-Video.

Von **Michael Tenner** · Stand · **August 2026** · Werkzeuge · **Claude Desktop · Claude Design · Claude Code** · Ergebnis · **Interaktiver Prototyp + MP4**

**Demo-Video:** ../assets/pnl-treiberbaum-demo.mp4

**Standbild:** ../assets/pnl-treiberbaum-poster.png

**47 Sekunden Rundgang durch den Prototyp:** Treiberbaum mit Drilldown bis auf Menge × Preis, EBIT-Brücke, fünf Analyse-Ansichten, Treiber-Simulation mit Zielwert-Solver — und der Sprachwechsel EN → ZH → JA → AR → DE inkl. Rechts-nach-links-Layout und ostasiatischer Farblogik.

## Das Vorgehen: *drei Schritte*, kein selbst getippter Code

Sicher, man kann weiterhin Zeichnungen mitgeben. Aber 2026 ist das oft gar nicht mehr nötig. Der komplette Weg vom Gedanken zum klickbaren Prototyp lief über drei Stationen:

### 1 · Specs als Markdown — Claude Desktop

Eine MD-Datei beschreibt, was der Prototyp können muss: **mehrsprachig** (inkl. Arabisch mit Rechts-nach-links-Leserichtung), **Treiber-Simulation** mit Szenarien, und **Farben nach Region** — in China ist Rot die Farbe der positiven Entwicklung, also dreht der Prototyp dort die Farblogik. Das Markdown ist der neue Stift: präzise genug für die Maschine, lesbar genug für Menschen.

### 2 · HTML-Interface generieren — Claude Opus · Claude Design

Aus den Specs entsteht das Interface: Treiberbaum, EBIT-Brücke, KPI-Leiste, Monatsnavigation, Simulations-Regler — als eine einzige, offline lauffähige HTML-Datei. Kein Mockup, das so tut als ob: **jede Zahl rechnet wirklich**, Mengen- und Preiseffekte werden je Position getrennt ausgewiesen.

### 3 · Review, Feinschliff & Demo-Clip — Claude Code · Fable 5 (high)

Code-Review des Prototyps, dann die Addons: eine **Auto-Tour**, die das Dashboard selbstständig vorführt, Hotkeys für die Ansichten, weichere Übergänge, die Umschaltung der Breakdowns — und zum Schluss hat Fable den **MP4-Demo-Clip** gleich selbst aufgenommen: Headless-Browser gestartet, Tour geskriptet, Video geschnitten.

7 Sprachen — **Ein Prototyp, der die Zielorganisation ernst nimmt:** DE, EN, JA, ZH, ES, FR, AR — mit Rechts-nach-links-Layout für den arabischen Raum und gedrehter Farbsemantik für China. Genau die Details, die auf Papier gar nicht prototypbar wären.

## Müssen wir Prototyping *neu denken?*

Der klassische Prototyp auf Papier beantwortet die Frage: „Verstehen wir uns über das Layout?" Der KI-generierte Prototyp beantwortet zusätzlich: **„Fühlt es sich richtig an, wenn man draufklickt?"** — mit echten Zahlen, echter Interaktion, echter Mehrsprachigkeit. Und er ist schnell genug entstanden, dass man ihn nach dem ersten Feedback-Gespräch wegwerfen und neu generieren kann, ohne dass es weh tut. Das war immer das eigentliche Versprechen von Papier.

Was bleibt: Die Spezifikation wandert nach vorn. Wer präzise beschreiben kann, was gebraucht wird — fachlich, kulturell, funktional — bekommt heute in Stunden, was früher Wochen an Mockup-Iterationen kostete. Das Denken wird nicht ersetzt, es wird sichtbar.

> ### Selbst ausprobieren
>
> Der Prototyp läuft komplett im Browser — eine einzige HTML-Datei, keine Installation, keine Daten verlassen den Rechner. Beispieldaten eines fiktiven Serienfertigers (Nordwerk Antriebstechnik AG). Tipp: oben rechts **▶ Auto-Demo** klicken und zuschauen — oder mit den Tasten 1–5 durch die Ansichten springen.

Interaktiv · 16:9 Vollbild

### Die Demo live ausprobieren

Treiberbaum aufklappen, Brücke filtern, Szenarien schieben, Solver rechnen lassen — und die Sprache wechseln.

[Demo öffnen →](../pnl-treiberbaum-demo.html)

## Der LinkedIn-Post *zum Mitnehmen*

Die Kurzfassung, wie sie auf LinkedIn stand (Original auf Englisch):

### LinkedIn-Post · Original (EN)

```
Is classical pen-and-paper prototyping about to die for many reports/dashboards and business applications?

Is AI the new paper, and Markdown files the new pen? Sure, you can also provide drawings, but often, by now, in 2026, it is not even necessary.

My goal was a P&L I can pitch for an international organisation in the producing sector.

First, I created with Claude Desktop an MD file with the specs, e.g.
Multilingual, Simulation, Colours according to the region (you can see this for China — red is the colour for good development — and the reading order for the Arabic World)

Second, I used Claude Opus in Claude Design for creating the HTML interface.

Lastly, I reviewed the HTML in Claude Code with Fable 5 on high, had some addons like the auto tour and the switch for the breakdowns, and I let Fable create an MP4 demo clip.

Do you think we have to rethink prototyping?

I will provide the link to the interactive version in the comments ;-) Feel free to play.

#Claude #prototyping #Dashboard #Finance #Report
```

Fragen, Kritik, eigene Experimente: **Michael Tenner** · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

Der Prototyp zeigt Beispieldaten eines fiktiven Unternehmens. Werkzeuge: Claude Desktop (Specs), Claude Design mit Opus (Interface), Claude Code mit Fable 5 (Review, Addons, Demo-Video).

---

## Weiterlesen

- HTML (maßgeblich): https://datenwgknowledgekitchen.com/prototyping-pnl-treiberbaum.html
- Englische Fassung: [prototyping-pnl-treiberbaum_en.html](../prototyping-pnl-treiberbaum_en.html) · [prototyping-pnl-treiberbaum_en.md](prototyping-pnl-treiberbaum_en.md)
- Interaktive Demo: [pnl-treiberbaum-demo.html](../pnl-treiberbaum-demo.html) · https://datenwgknowledgekitchen.com/pnl-treiberbaum-demo.html
