# CI-Gate — Design-Konsistenz dauerhaft erzwingen

## Warum

Ein Design-System erodiert ohne Gate: Jeder manuelle Fix in Power BI Desktop
oder jeder von einem Agenten gebaute Visual kann Schatten, falsche Fonts oder
Positionen außerhalb der Content-Zone einschleppen — unbemerkt, bis jemand
zufällig hinschaut. Agenten (auch dieser Skill selbst) brauchen zudem
automatisches Feedback: „Verstoß gefunden" als Exit-Code ist etwas, worauf
ein Agent im nächsten Schritt reagieren kann; ein Mensch, der Reports beim
Review manuell durchklickt, ist es nicht. Die beiden Skripte
(`bulk_restyle.py --check`, `check_contrast.py --palette`) sind bereits
CI-tauglich: reiner stdlib-Python, Exit-Code ≠ 0 bei Verstößen, keine
Netzwerk-Zugriffe.

## Einrichtung — Variante A: GitHub Actions

1. Skripte ins Report-Repo kopieren:
   ```bash
   mkdir -p tools/design
   cp .claude/skills/powerbi-design-framework/scripts/bulk_restyle.py tools/design/
   cp .claude/skills/powerbi-design-framework/scripts/check_contrast.py tools/design/
   ```
2. `assets/ci/design-lint.yml` nach `.github/workflows/design-lint.yml`
   kopieren.
3. Im `env:`-Block oben in der Datei `TOOLS_DIR`, `REPORT_PATH` und
   `ALLOWED_FONTS` an das eigene Repo-Layout anpassen.
4. `design-out/zones.json` und `design-out/palette.json` einmal mit dem
   `powerbi-design-framework`-Skill erzeugen (Schritt „Artefakte ablegen")
   und mit committen — ohne sie überspringt der Workflow die Checks (siehe
   unten).
5. Commit/PR erstellen — der Workflow läuft auf `pull_request` und auf
   `push` in den Default-Branch.

## Einrichtung — Variante B: lokaler Pre-Commit-Hook

1. Skripte wie oben nach `tools/design/` kopieren (falls noch nicht
   geschehen).
2. Hook installieren:
   ```bash
   cp .claude/skills/powerbi-design-framework/assets/ci/pre-commit.sh .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```
3. Pfade oben im Skript (`TOOLS_DIR`, `REPORT_PATH`, `ALLOWED_FONTS`) bei
   Bedarf anpassen. Der Hook läuft danach vor jedem `git commit`.

## Was die Checks prüfen

- **`bulk_restyle.py --check`**: Positionen auf dem 8-px-Raster, Visuals
  außerhalb der Content-Zone (`--zones`), verbotene Schatten
  (`dropShadow.show`), Schriftgrößen unter dem Minimum, nicht erlaubte
  `fontFamily`-Werte (`--fonts`), optional fehlender `tabOrder`
  (`--require-taborder`).
- **`check_contrast.py --palette`**: jedes Farbpaar aus `palette.json` gegen
  WCAG AA (4,5:1 Normaltext, 3:1 großer Text/UI), mit Korrekturvorschlag bei
  FAIL.

## Verstöße lesen

Beide Skripte geben pro Verstoß eine Zeile mit Seite/Visual bzw. Farbpaar
und Ratio aus, gefolgt von einer Zusammenfassung. Bei `check_contrast.py`
steht bei FAIL direkt ein Fix-Vorschlag (nächstliegender Farbton, der die
Zielratio erreicht) darunter — den kann man 1:1 in `palette.json`
übernehmen. Exit-Code 0 heißt „sauber", ≠ 0 heißt „mindestens ein Verstoß",
unabhängig davon, wie viele es sind.

## Grenzen

Der Linter prüft **Geometrie- und Format-Regeln** (Raster, Zonen, Fonts,
Schatten-Flag, Kontrastwerte) — er hat keine Vorstellung von Optik: ob ein
Layout tatsächlich ausgewogen wirkt, Weißraum stimmt oder eine Farbwahl zum
Corporate Design passt, sieht das Gate nicht. Für das visuelle Review ist
`render_wireframe.py` gedacht (baut ein Kollege parallel) — ein Bild der
Seite statt einer Regelliste, für den Blick, den kein Skript ersetzt. Bis
dahin bleibt manuelles Öffnen in Power BI Desktop nötig, bevor ein Report
als fertig gilt.
