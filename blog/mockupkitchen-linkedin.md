# LinkedIn-Posts · MockupKitchen (v0.3, Testphase)

> **Fassungen zum Kopieren**, deutsch und englisch, jeweils als eigener Post gedacht.
>
> **Publish-Checkliste:**
> 1. Prüfen, dass live ist: `https://datenwgknowledgekitchen.com/mockup-kitchen.html` und `…/mockupkitchen-post.html`.
> 2. Bild anhängen: eigener Screenshot des Tools (Vorlage „Management-Übersicht" im Präsentiermodus) oder ein exportiertes Seiten-PNG.
> 3. Nach dem Posten den Kommentar-Baustein als ersten eigenen Kommentar setzen.

---

## DE · Hauptfassung

Jeder Reporting-Workshop endet mit einem Whiteboard-Foto. Und dann baut es jemand nach.

Wir haben ein Werkzeug gebaut, das den Umweg spart: MockupKitchen.

Man zieht das TMDL-Verzeichnis des Semantikmodells in den Browser, alle Felder sind da. Die Seite wird aus Containern gebaut statt frei gemalt, Kopfband, Filter und Fußleiste sind Zonen. 46 Kacheltypen, davon die IBCS-Typen der ChartKitchen und die nativen Power-BI-Visuals, jede als Skizze mit AC · PY · PL · FC.

Der Unterschied zu PowerPoint: Der Export ist keine Grafik, sondern eine Spezifikation. Exakte Rechtecke in Power-BI-Pixeln, echte Feldnamen, und die Entscheidungen aus dem Workshop als Daten: Zielgruppe, Entscheidung, Polarität, Sortierung, Kennzahl-Steckbriefe mit „bestätigt".

Ein Claude-Code-Skill baut daraus die Seiten im PBIP-Projekt. Validieren, Plan, Freigabe, Bau, Abnahme gegen ein Sollbild. Der zweite Lauf ist ein Delta, kein Neubau.

Die Workshop-Doku entsteht nebenbei, als Markdown und PowerPoint, deutsch oder englisch.

Kein Report-Generator. Ein Anforderungswerkzeug mit deterministischem Ausgang.

Ist online zum Testen, ohne Installation, nichts verlässt den Browser:
https://datenwgknowledgekitchen.com/mockup-kitchen.html

Was dahinter steckt und was das Sechs-Perspektiven-Review dazu gesagt hat:
https://datenwgknowledgekitchen.com/mockupkitchen-post.html

#PowerBI #IBCS #Reporting #Controlling #ClaudeCode #DatenWG

**Kommentar-Baustein:**
Ehrlich dazu: Testphase. ChartKitchen-Visuals braucht der Skill als Referenz-Instanz, Touch geht nicht, Dark Mode fehlt. Feedback gern als Issue im Repo oder hier drunter.

---

## EN · Main version

Every reporting workshop ends with a photo of a whiteboard. Then someone rebuilds it in Power BI, and half of what was said gets lost on the way.

We built a tool that skips the detour: MockupKitchen.

Drop the TMDL folder of your semantic model into the browser and every table, column and measure is ready to use. Pages are built from containers, not drawn freehand; header, filter panel and footer are zones. 46 tile types, including the IBCS types of ChartKitchen and the native Power BI visuals, each as a sketch with AC · PY · PL · FC notation.

The difference to PowerPoint: the export is not a picture, it is a specification. Exact rectangles in Power BI pixels, real field names, and the workshop decisions as data: audience, decision, polarity, sort order, KPI fact sheets with a "confirmed" checkbox.

A Claude Code skill builds the pages in the PBIP project from it. Validate, plan, approve, build, verify against an acceptance file. The second run is a delta, not a rebuild.

The workshop documentation comes for free, as Markdown and PowerPoint, in German or English.

Not a report generator. A requirements tool with a deterministic outcome.

Online for testing, no install, nothing leaves the browser:
https://datenwgknowledgekitchen.com/mockup-kitchen.html

Background and the six-persona review that shaped the roadmap:
https://datenwgknowledgekitchen.com/mockupkitchen-post.html

#PowerBI #IBCS #Reporting #Controlling #ClaudeCode #DatenWG

**Comment block:**
Honest note: test phase. ChartKitchen visuals still need a reference instance for the skill, no touch support yet, no dark mode. Feedback welcome as an issue in the repo or below.
