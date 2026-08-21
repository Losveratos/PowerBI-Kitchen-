# ChartKitchen byDatenWG — Schnellstart

> Markdown-Fassung von [chartkitchen-schnellstart.html](../chartkitchen-schnellstart.html) · https://datenwgknowledgekitchen.com/chartkitchen-schnellstart.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

Power-BI-Visual · Schnellstart

Ein einzelnes Power-BI-Visual mit 13 IBCS-inspirierten Modi — von Säulen, Linien und Wasserfall über Tabelle und Matrix bis zum GuV-Statement. In zwei Minuten verstehen, was das Visual kann, wie du loslegst und wo die ausführliche Dokumentation steht.

13 Modi · DE · EN · ES · JA · Version 1.41.0.0

![Komplette Power-BI-Berichtsseite mit KPI-Karten und Brücken, aus ChartKitchen-Visuals gebaut](../doku-assets/pbi/pbi-demo-report.png)

*Power BI · Eine komplette Berichtsseite: KPI-Karten, eine AC/FC-Monatsbrücke und eine YTD-Brücke nach Produkt — alle Kacheln stammen aus demselben ChartKitchen-Visual.*

### Visual herunterladen

Version **1.41.0.0** · **.pbiviz** · 13.08.2026

Direkt-Download, keine Registrierung — der Link liefert immer die aktuelle Version. Import in Power BI Desktop: *Visualisierungen → „…" → Visual aus einer Datei importieren*. Alternativ gibt es alle Builds auch auf [GitHub](https://github.com/Losveratos/Power-BI-Custom-Visuals-byDatenWG).

**Download:** https://datenwgknowledgekitchen.com/downloads/chartkitchen-byDatenWG-latest.pbiviz

> **Beta-Hinweis:** Solange ChartKitchen nicht im Microsoft AppSource gelistet ist, ist jeder Build eine Beta-Version — nicht von Microsoft zertifiziert. Bitte zuerst in einem Testbericht ausprobieren; Einsatz in Produktionsberichten auf eigene Verantwortung. Feedback gern an [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com?subject=ChartKitchen%20byDatenWG%20—%20Feedback).

### Für KI-Agenten: der Agent-Guide

**AGENT-GUIDE.md** · maschinenlesbare Referenz · immer zur aktuellen Version

ChartKitchen bringt als eines der ersten Custom Visuals eine **Doku für KI-Assistenten** mit: der komplette Datenvertrag (Feldrollen samt Fallstricken), alle ~90 Format-Properties mit exakten Namen und Werten fürs PBIR-Authoring, die persistierten Zustände (Sortierung, Klapp-Zustand, Spaltenbreiten), Formel-Syntax, DAX-Regeln und die bekannten Stolperfallen. Damit kann ein Agent — Claude, Copilot, Cursor & Co. — das Visual *korrekt konfigurieren statt raten*: fertige Berichtsseiten per Prompt, inklusive Einstellungen, die sich sonst nur mühsam zusammenklicken lassen.

**So nutzt du ihn:** ① Gib deinem Agenten den Guide — Link in den Chat, Datei ins Projekt oder neben deine `CLAUDE.md`/`AGENTS.md` legen. ② Stell die Aufgabe („Berichtsseite: Säulen mit ΔPL, YTD-Button, Tabelle nach ΔPY sortiert"). ③ Der Agent schreibt die passende Konfiguration mit exakten Property-Namen — der Guide sagt ihm auch, wie das Datenmodell aussehen muss.

**Agent-Guide:** [ibcsInspiredChartDeck/AGENT-GUIDE.md](../ibcsInspiredChartDeck/AGENT-GUIDE.md) · absolut: https://datenwgknowledgekitchen.com/ibcsInspiredChartDeck/AGENT-GUIDE.md

Direktlink zum Kopieren für den Agenten-Chat: `datenwgknowledgekitchen.com/ibcsInspiredChartDeck/AGENT-GUIDE.md` · auch auf [GitHub](https://github.com/Losveratos/PowerBI-Kitchen-/blob/main/ibcsInspiredChartDeck/AGENT-GUIDE.md)

## 01 · In drei Schritten loslegen

Von der Import-Datei zum fertigen IBCS-Chart — mit zwei, drei Feldern steht das erste Diagramm.

1. **.pbiviz importieren** — In Power BI Desktop im Bereich *Visualisierungen* auf `…` → *Visual aus Datei importieren* klicken und die `.pbiviz`-Datei wählen. Das ChartKitchen-Icon erscheint und lässt sich auf die Seite ziehen.
2. **Kategorie + AC befüllen** — Weise der Rolle *Kategorie* deine Achse zu und der Rolle *Ist (AC)* deine Kennzahl. Es erscheinen Landing-Kacheln — klick einen Modus an, und das Visual zeichnet ihn sofort.
3. **PY / PL dazu** — Ergänze *Vorjahr (PY)* und *Plan (PL)*. Abweichungen kommen automatisch: absolute und relative Varianz-Panels stehen ohne weiteres Zutun neben oder über dem Basis-Chart.

Alle Schritte im Detail — Import, Minimal-Setup und Feldrollen — stehen im [Schnellstart-Kapitel der Doku →](../chartkitchen-doku.html#quickstart)

## 02 · Weiter in der Dokumentation

Jede Kachel springt direkt in die passende Sektion der ausführlichen Doku.

- **[Schnellstart](../chartkitchen-doku.html#quickstart)** · Kapitel 02 — Import, Minimal-Setup und die Feldrollen Kategorie, AC, PY, PL — Schritt für Schritt.
- **[Die 13 Modi](../chartkitchen-doku.html#modes)** · Kapitel 03 — Säulen, Balken, Linie, Wasserfall, Brücke, Tabelle, Matrix, KPI-Karten, GuV und mehr — jeder Modus erklärt.
- **[Im Einsatz](../chartkitchen-doku.html#inaction)** · Kapitel 04 — Echte Power-BI-Beispiele: komplette Berichtsseiten, Monitoring, Vergleiche und mehr.
- **[Funktionen im Detail](../chartkitchen-doku.html#features)** · Kapitel 05 — Szenario-Notation, Small Multiples, Kommentare, Kumulierung, Top N und die weiteren Funktionen.
- **[Einstellungs-Referenz](../chartkitchen-doku.html#settings)** · Kapitel 06 — Alle 84 Einstellungen in sieben Format-Karten — mit Schema-Skizzen des Formatbereichs.
- **[FAQ & Troubleshooting](../chartkitchen-doku.html#faq)** · Kapitel 07 — Häufige Fragen, typische Stolpersteine und schnelle Antworten rund um das Visual.
- **[Doku als PDF (DE)](../chartkitchen-doku.pdf)** · Download — Die komplette deutsche Dokumentation als PDF zum Offline-Lesen und Weitergeben.

**ChartKitchen byDatenWG** · Version 1.41.0.0

Kontakt: Michael Tenner · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

Die vollständige Dokumentation gibt es als [Web-Seite](../chartkitchen-doku.html) und als [PDF](../chartkitchen-doku.pdf).

> IBCS® ist eine eingetragene Marke der IBCS Association. Dieses Visual ist von den IBCS-Prinzipien inspiriert und steht in keiner Verbindung zur IBCS Association.
