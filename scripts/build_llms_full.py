#!/usr/bin/env python3
"""Baut llms-full.txt: die wichtigsten Markdown-Exporte in einer Datei.

Manche Agenten laden lieber eine Datei als zwoelf. llms-full.txt haengt
deshalb die inhaltlich dichtesten Dokumente aneinander, jedes mit einer
Trennmarke und seiner Quell-URL.

Bewusst NICHT enthalten sind die beiden grossen Einsteiger-Guides
(power-bi, fabric), die ChartKitchen-Doku und die Video-Linkliste: sie
wuerden die Datei ueber die selbstgesetzte Obergrenze von 500 KB treiben,
und wer sie braucht, holt sie gezielt ueber llms.txt.

Deterministisch: feste Reihenfolge, kein Zeitstempel aus der Laufzeit.

    python3 scripts/build_llms_full.py
    python3 scripts/build_llms_full.py --check
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SITE = "https://datenwgknowledgekitchen.com"
LIMIT_BYTES = 500 * 1024

# (Pfad relativ zum Repo, URL-Pfad) — Reihenfolge ist die Lesereihenfolge.
DOCS = [
    ("md/whitepaper-strommix.md", "md/whitepaper-strommix.md"),
    ("md/strommix-story.md", "md/strommix-story.md"),
    ("md/rhein-story.md", "md/rhein-story.md"),
    ("whitepaper-ki-entwicklung-roi.md", "whitepaper-ki-entwicklung-roi.md"),
    ("md/pdoom-ki-risiko.md", "md/pdoom-ki-risiko.md"),
    ("md/ki-co2-simulator.md", "md/ki-co2-simulator.md"),
    ("md/laender-indikatoren-explorer.md", "md/laender-indikatoren-explorer.md"),
    ("md/zugfahrten-europa.md", "md/zugfahrten-europa.md"),
    ("md/waermestreifen-3d.md", "md/waermestreifen-3d.md"),
    ("md/powerbi_praxis_pfad.md", "md/powerbi_praxis_pfad.md"),
]

PREAMBLE = f"""# Daten-WG Knowledge Kitchen — Volltext-Buendel

Diese Datei buendelt die inhaltlich dichtesten Dokumente der Site in einer
einzigen Markdown-Datei. Der thematische Index mit allen Einzeldateien steht
in {SITE}/llms.txt

Konfidenzstufen, die in den Dokumenten auftauchen: A mehrfach belegt /
institutionelle Primaerquelle · B einfach belegt · C schwache Belegbasis ·
M Modellsetzung, nicht quellenbelegt. Die datenjournalistischen Arbeiten sind
als Entwurf gekennzeichnet; Zahlen bitte nur mit Konfidenzstufe und Datenstand
zitieren.

Autor: Michael Tenner, Daten-WG Knowledge Kitchen, {SITE}

Nicht enthalten (zu gross fuers Buendel, einzeln unter /md/ abrufbar):
der Power-BI-Einsteiger-Guide, der Microsoft-Fabric-Einsteiger-Guide,
die ChartKitchen-Dokumentation und die Video-Linkliste.
"""


def render():
    parts = [PREAMBLE.rstrip()]
    for rel, url in DOCS:
        path = REPO / rel
        if not path.exists():
            raise SystemExit(f"build_llms_full: fehlt {rel}")
        parts.append(
            "\n".join(
                [
                    "",
                    "=" * 78,
                    f"DOKUMENT: {SITE}/{url}",
                    "=" * 78,
                    "",
                    path.read_text(encoding="utf-8").rstrip(),
                ]
            )
        )
    return "\n".join(parts).rstrip() + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true", help="nur pruefen, nicht schreiben")
    args = ap.parse_args()

    text = render()
    size = len(text.encode("utf-8"))
    target = REPO / "llms-full.txt"

    if size > LIMIT_BYTES:
        print(
            f"ABBRUCH: {size:,} Bytes ueberschreiten die Obergrenze von "
            f"{LIMIT_BYTES:,} Bytes. Dokument aus DOCS entfernen."
        )
        return 1

    if args.check:
        if not target.exists():
            print(f"FEHLT: {target}")
            return 1
        if target.read_text(encoding="utf-8") != text:
            print("VERALTET: llms-full.txt — bitte build_llms_full.py ohne --check laufen lassen")
            return 1
        print(f"ok  llms-full.txt  {size:,} Bytes  {len(DOCS)} Dokumente")
        return 0

    target.write_text(text, encoding="utf-8")
    print(f"geschrieben  llms-full.txt  {size:,} Bytes  {len(DOCS)} Dokumente")
    return 0


if __name__ == "__main__":
    sys.exit(main())
