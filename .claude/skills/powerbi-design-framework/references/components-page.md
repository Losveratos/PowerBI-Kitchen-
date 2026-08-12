# Komponenten-Seite — Atomic Design in Power BI

Eine versteckte Seite **`_Design-System`** im Report, auf der alle Bausteine
fertig formatiert bereitliegen. Entwickler (und Agenten) **kopieren** von
dort, statt Formatierung neu zu erfinden — Strg+C/V zwischen Seiten behält
Position und Format exakt. Das ist der wirksamste Konsistenz-Hebel nach dem
Theme, und er macht Wartung leicht: Komponente auf der Systemseite ändern →
beim nächsten Kopieren ist der neue Stand drin.

## Atomic-Design-Ebenen auf Power BI übersetzt

| Ebene     | Power-BI-Entsprechung                          | Beispiele auf der Seite                       |
| --------- | ---------------------------------------------- | --------------------------------------------- |
| Atome     | einzelne Elemente                              | Textbox H1/H2/Body/Caption, Button (3 Zustände), Shape „Karte", Farb-Swatch, Trennlinie, Logo-Platzhalter |
| Moleküle  | Gruppe aus 2–4 Atomen                          | KPI-Kachel (Karte + Label + Wert + Delta), Nav-Button mit Icon, Slicer mit Titel |
| Organismen| komplette Chrome-Zone als Gruppe               | Kopfband (Logo + Titel + Nav), Filter-Panel (Panel + Slicer-Stack + Reset), Fußleiste, KPI-Reihe |
| Template  | die Beispielseite selbst                       | eine leere „Musterseite" mit allen Zonen, die man als Ganzes dupliziert |

## Namenskonvention (im Auswahl-Bereich pflegen!)

Jedes Element/jede Gruppe bekommt im **Auswahl-Bereich** (Ansicht →
Auswahl) einen sprechenden Namen nach dem Muster `ebene/name-variante`:

```
atom/h1-titel          atom/btn-nav-default    atom/swatch-accent
atom/h2-abschnitt      atom/btn-nav-active     atom/card-bg
mol/kpi-kachel         atom/btn-nav-disabled   atom/logo-placeholder
org/kopfband           org/filter-panel        org/fussleiste
```

Warum das wichtig ist: Anzeigenamen aus dem Auswahl-Bereich werden von
Desktop in die PBIR-Dateien geschrieben (das genaue Feld variiert je
Schema-Version — nach dem Benennen einmal per `grep -rl "mol/kpi-kachel"
…/visuals/` verifizieren). Damit kann ein Agent die Komponente **im
Dateisystem finden** und ihren `visual.json`-Ordner als Vorlage
replizieren — der Referenz-Instanz-Trick aus `chartkitchen-report`,
angewendet auf Design-Bausteine. Findet `grep` nichts, stattdessen im
AGENT-BRIEF eine Mapping-Tabelle `Komponente → visuals/<Ordnername>`
pflegen — gleiche Wirkung, eine Indirektion mehr.

## Was auf die Seite gehört (Mindestausstattung)

1. **Farb-Swatches:** je Farbrolle ein Shape mit Hexwert + Rolle als
   Beschriftung (ink/accent/bg/bg-card/Grauleiter/Datenfarben) — die Seite
   dokumentiert sich selbst.
2. **Typo-Zeilen:** je Textklasse eine Textbox mit Klarname + Größe
   („H1 · 18 pt Semibold").
3. **Buttons in allen Zuständen:** Nav-Button default/hover/aktiv/disabled
   (Power-BI-Buttons haben Zustands-Formatierung — einmal sauber einstellen,
   dann nur noch kopieren), Filter-Reset, Filter-Toggle (Trichter),
   Info-Button.
4. **KPI-Kachel-Molekül** in der beschlossenen Geometrie (und eine Variante
   „kritisch/hervorgehoben").
5. **Chrome-Organismen:** Kopfband mit Logo-Platzhalter, Filter-Panel,
   Fußleiste — gruppiert, an den exakten Spec-Koordinaten.
6. Bei IBCS-Modus zusätzlich: `slot/title-block`, `slot/notation-band`,
   `slot/comment-col`-Muster (nummerierter Kommentar mit Bezugslinie).

## Anlegen — zwei Wege

**Weg A · Desktop (Default, in STEPS.md beschreiben):** Seite anlegen,
Elemente nach Spec bauen, benennen, gruppieren, Seite über „Seite
ausblenden" verstecken. Aufwand einmalig ~30–45 min, danach nur noch kopieren.

**Weg B · PBIR-generiert (nur auf ausdrücklichen Wunsch):** Der Skill
schreibt die Seite als neuen Ordner unter `*.Report/definition/pages/` +
Eintrag in `pages.json`. Das ist **additiv** (bestehende Seiten bleiben
unberührt) und damit der risikoärmste PBIR-Schreibzugriff — trotzdem gelten
die Regeln aus `pbir-integration.md`: Backup/Commit vorher, Desktop
geschlossen, danach in Desktop öffnen und verifizieren. Textboxen, Shapes
und Buttons sind Standard-Visuals; ihre `visual.json`-Struktur aus einem
vorhandenen Exemplar im Report replizieren, nicht raten. Die Seite in
`page.json` als ausgeblendet markieren (Sichtbarkeits-Feld wie von Desktop
geschrieben übernehmen).

## Nutzung & Wartung

- **Neue Seite bauen:** Musterseite duplizieren (Template-Ebene) oder
  Organismen einzeln kopieren; Visuals in die Content-Slots aus dem
  AGENT-BRIEF setzen.
- **Design ändern:** zuerst prüfen, ob es das Theme kann (dann dort!);
  sonst Komponente auf `_Design-System` ändern und mit
  `scripts/bulk_restyle.py` auf die bestehenden Instanzen ausrollen.
- **Drift-Kontrolle:** `bulk_restyle.py --check` meldet Visuals, die von
  den Komponenten-/Spec-Regeln abweichen (Schatten an, falsche Schrift,
  neben dem Raster …).
- Die Seite bleibt im veröffentlichten Report (versteckt) — sie stört
  nicht und dokumentiert das Design-System direkt am Objekt. Wer sie im
  Service nicht mitliefern will, entfernt sie vor dem Publish bewusst.
