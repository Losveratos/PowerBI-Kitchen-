#!/usr/bin/env python3
"""Baut eine Standalone-Version des White Papers (alles inline, per Doppelklick
im Browser zu oeffnen — fuer Review-Weitergabe ohne Webserver).

Nutzung: python3 strommix/scripts/build_standalone.py [zielpfad]
Default-Ziel: dist/whitepaper-strommix-standalone.html (nicht eingecheckt)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def main() -> None:
    html = (ROOT / "whitepaper-strommix.html").read_text(encoding="utf-8")
    js = (ROOT / "whitepaper-strommix.js").read_text(encoding="utf-8")

    # Alle Top-Level-Daten-JSONs einbetten (keine raw/-Unterordner) — so kann
    # kein neu hinzugekommener fetch-Pfad vergessen werden.
    embedded = {
        f"strommix/data/{f.name}": json.loads(f.read_text(encoding="utf-8"))
        for f in sorted((ROOT / "strommix" / "data").glob("*.json"))
    }
    # Fetch-Shim: beantwortet die bekannten Daten-URLs aus dem eingebetteten
    # Block, alles andere geht an das echte fetch durch.
    shim = (
        "<script>\n"
        "const __EMBEDDED = " + json.dumps(embedded, ensure_ascii=False, separators=(",", ":")) + ";\n"
        "const __realFetch = window.fetch.bind(window);\n"
        "window.fetch = (url, opts) => {\n"
        "  const key = String(url).replace(/^\\.\\//, '');\n"
        "  if (__EMBEDDED[key]) return Promise.resolve(new Response(\n"
        "    JSON.stringify(__EMBEDDED[key]),\n"
        "    { status: 200, headers: { 'Content-Type': 'application/json' } }));\n"
        "  return __realFetch(url, opts);\n"
        "};\n"
        "</script>"
    )

    marker = '<script src="whitepaper-strommix.js"></script>'
    if marker not in html:
        sys.exit("Marker fuer Script-Tag nicht gefunden — HTML-Struktur geaendert?")
    html = html.replace(marker, shim + "\n<script>\n" + js + "\n</script>")

    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist" / "whitepaper-strommix-standalone.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"OK: {out} ({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
