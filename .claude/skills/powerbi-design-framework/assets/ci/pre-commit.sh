#!/bin/sh
# KOPIERVORLAGE — nach .git/hooks/pre-commit kopieren, dann ausführbar machen:
#   cp assets/ci/pre-commit.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Führt dieselben zwei Design-Checks wie assets/ci/design-lint.yml lokal aus,
# bevor ein Commit entsteht. Bricht den Commit ab, wenn ein Check einen
# Verstoß meldet (Exit-Code ungleich 0). Fehlt eine Eingabedatei, wird der
# jeweilige Check sauber übersprungen (kein Commit-Abbruch).
#
# Voraussetzung: bulk_restyle.py und check_contrast.py liegen im Repo,
# z. B. unter tools/design/ (aus dem Skill kopiert: scripts/*.py).
# Pfade unten bei Bedarf anpassen.

TOOLS_DIR="tools/design"
REPORT_PATH="."
ALLOWED_FONTS="Segoe UI,Segoe UI Semibold"

status=0

if [ -f "design-out/zones.json" ]; then
    echo "Design-Lint: prüfe Geometrie/Fonts/Schatten..."
    python3 "${TOOLS_DIR}/bulk_restyle.py" "${REPORT_PATH}" \
        --check \
        --zones design-out/zones.json \
        --fonts "${ALLOWED_FONTS}"
    if [ $? -ne 0 ]; then
        status=1
    fi
else
    echo "Hinweis: design-out/zones.json fehlt — Design-Linter übersprungen."
fi

if [ -f "design-out/palette.json" ]; then
    echo "Kontrast-Check: prüfe Palette gegen WCAG AA..."
    python3 "${TOOLS_DIR}/check_contrast.py" --palette design-out/palette.json
    if [ $? -ne 0 ]; then
        status=1
    fi
else
    echo "Hinweis: design-out/palette.json fehlt — Kontrast-Check übersprungen."
fi

if [ $status -ne 0 ]; then
    echo ""
    echo "Commit abgebrochen: Design-Checks haben Verstöße gemeldet (siehe oben)."
    echo "Beheben oder mit 'git commit --no-verify' bewusst umgehen."
    exit 1
fi

exit 0
