# PBIR-Integration — gegen die Projektdatei arbeiten (und was „API" heißt)

## Realitäts-Check: Welche Schnittstellen gibt es?

| Weg                               | Kann Report-Layout? | Einsatz im Skill                     |
| --------------------------------- | ------------------- | ------------------------------------ |
| **PBIP/PBIR-Dateien** (Text-JSON) | ✅ ja               | **der Weg dieses Skills**            |
| Power BI Desktop „API"            | ❌ gibt es für Reports nicht — External Tools sprechen XMLA mit der lokalen Analysis-Services-Instanz und erreichen damit nur das **Semantikmodell** (Measures, Tabellen), nicht das Layout | nicht nutzbar fürs Layout |
| Fabric/Power BI REST APIs (Service) | teilweise (Definition import/export) | Ausbaustufe, nicht v1 |
| Theme-Import in Desktop           | Farben/Typo/Defaults | immer der erste Hebel               |

Konsequenz: „Gegen Power BI laufen" heißt konkret: **auf den PBIP-Dateien
arbeiten**, während Desktop geschlossen ist (Desktop hält die Dateien offen
und überschreibt externe Änderungen beim Speichern). Ablauf immer:
Desktop schließen → Dateien ändern → Desktop öffnen → verifizieren.

## Dateikarte (Kurzfassung)

```
<Name>.Report/definition/
├── report.json                  ← Report-Metadaten/-Filter
├── pages/pages.json             ← Seitenreihenfolge, aktive Seite
└── pages/<pageName>/
    ├── page.json                ← name, displayName, Breite/Höhe, Sichtbarkeit
    └── visuals/<visualName>/visual.json  ← Position + Typ + Formatierung
```

Jede Datei trägt eine `$schema`-URL, die Version steckt in der URL (z. B.
`…/json-schemas/fabric/item/report/definition/visualContainer/2.4.0/schema.json`).
Beim Erzeugen neuer Dateien die URL **aus einer vorhandenen Datei desselben
Reports** übernehmen. Ausführliche Struktur + Referenz-Instanz-Trick:
`../../chartkitchen-report/references/pbir-insertion.md` — gilt hier 1:1,
auch für Standard-Visuals (Textbox, Shape, Button): immer ein vorhandenes
Exemplar replizieren statt JSON zu erfinden.

## Verifizierte PBIR-Fakten für Formatierung (Grundlage von `bulk_restyle.py`)

- **Position** (Root-Ebene der `visual.json`): `x`, `y`, `z` (Ebene),
  `width`, `height`, optional `tabOrder`.
- **Container-Formatierung** (Titel, Hintergrund, Rahmen, Schatten) liegt in
  **`visual.visualContainerObjects`** — Objektname → Array von
  `{ "properties": { … } }`. Zwei Fallen: dieselben Properties unter
  `visual.objects` werden **stillschweigend ignoriert**; auf Root-Ebene ist
  `visualContainerObjects` ein Fehler.
- **Literal-Kodierung** `{"expr": {"Literal": {"Value": …}}}`:

  | Typ     | Format            | Beispiel                      |
  | ------- | ----------------- | ----------------------------- |
  | Boolean | ohne Suffix       | `"true"` / `"false"`          |
  | Double  | Suffix `D`        | `"14D"` (u. a. fontSize)      |
  | Integer | Suffix `L`        | `"50L"` (Pixel, transparency) |
  | String  | einfach gequotet  | `"'#FFFFFF'"`; innere `'` verdoppeln |
  | Fill    | verschachtelt     | `{"solid": {"color": {"expr": {"Literal": {"Value": "'#FFFFFF'"}}}}}` |

  Welches Zahlen-Suffix eine konkrete Property erwartet, ist nicht überall
  dokumentiert — `bulk_restyle.py` **lernt es aus vorhandenen Beispielen im
  Report** und fällt sonst auf dokumentierte Defaults zurück.

## Risiko-Leiter für Schreibzugriffe

Von harmlos nach heikel — der Skill bleibt so weit oben wie möglich:

1. **`design-out/` schreiben** (Theme, Spec, Steps, zones.json) — immer erlaubt.
2. **Theme importieren** — macht der Mensch in Desktop, risikofrei.
3. **Neue Seite hinzufügen** (Komponenten-Seite, Musterseite): additiv,
   bestehende Seiten unberührt; Ordner + `pages.json`-Eintrag. Nur auf
   ausdrücklichen Wunsch, mit Backup.
4. **Container-Formatierung bestehender Visuals ändern** (`bulk_restyle.py`):
   ändert nur `visualContainerObjects`, nie Query/Feldbindungen. Nur auf
   ausdrücklichen Wunsch, mit Backup, Dry-Run zuerst.
5. **Visuals/Seiten strukturell umbauen** — macht dieser Skill nicht;
   dafür Desktop bzw. der `chartkitchen-report`-Pfad mit Referenz-Instanz.

Backup heißt: Git-Commit des PBIP-Ordners **vor** Stufe 3/4 (ohne Git legt
`bulk_restyle.py` Sicherungskopien unter `design-out/backup-…/` an). Nach
jedem Schreibzugriff: in Desktop öffnen; lädt der Report nicht, Backup
zurückspielen und den Fall als Desktop-Klickschritte in STEPS.md
dokumentieren statt es erneut zu versuchen.

## Bulk-Änderungen: Theme zuerst, dann Skript

Wartbarkeit entsteht durch die richtige Reihenfolge:

1. **Kann es das Theme?** (Farben, Schriftgrößen, Visual-Defaults wie
   Schatten/Hintergrund/Ecken für *nicht manuell überschriebene* Visuals)
   → `theme.json` ändern, neu importieren. Eine Datei, alle Seiten.
2. **Manuell überschriebene Visuals** hören nicht aufs Theme — hier kommt
   `scripts/bulk_restyle.py` ins Spiel: setzt Container-Properties über
   alle `visual.json` (Filter nach Seiten/Visual-Typen möglich) oder
   **entfernt die manuellen Overrides** (`--strip`), damit wieder das Theme
   greift — die nachhaltigste Variante.
3. **Komponenten-Seite aktualisieren** (siehe `components-page.md`), damit
   Neues gleich richtig kopiert wird.

Beispiel „keine Schatten, leichte Hintergründe, leicht runde Ecken":

```bash
python scripts/bulk_restyle.py pfad/zum/Projekt --preset modern-soft          # Dry-Run ansehen
python scripts/bulk_restyle.py pfad/zum/Projekt --preset modern-soft --apply  # schreiben
```

## Linter (`bulk_restyle.py --check`)

Der Check-Modus schreibt nie, sondern prüft den Report gegen die Spec:
Positionen auf dem 8-px-Raster, Schatten-Verbot, Schriftfamilien/-größen
(min. 9 pt), fehlende `tabOrder` (`--require-taborder`), Visuals außerhalb
der Content-Zone (`--zones design-out/zones.json` — die Datei erzeugt der
Skill zusammen mit dem AGENT-BRIEF). Exit-Code ≠ 0 bei Verstößen — als
Qualitäts-Gate vor jedem Publish und als konkretes Feedback an Agenten,
die Seiten gebaut haben.
