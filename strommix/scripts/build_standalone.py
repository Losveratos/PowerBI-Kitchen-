#!/usr/bin/env python3
"""Baut Standalone-Versionen der Strommix-Seiten (alles inline, per Doppelklick
im Browser zu oeffnen — fuer Review-Weitergabe ohne Webserver).

Nutzung:
  python3 strommix/scripts/build_standalone.py [quelle.html] [zielpfad]

Default-Quelle: whitepaper-strommix.html
Default-Ziel:   dist/<quelle>-standalone.html (nicht eingecheckt)
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def build_shim() -> str:
    # Alle Top-Level-Daten-JSONs einbetten (keine raw/-Unterordner) — so kann
    # kein neu hinzugekommener fetch-Pfad vergessen werden.
    embedded = {
        f"strommix/data/{f.name}": json.loads(f.read_text(encoding="utf-8"))
        for f in sorted((ROOT / "strommix" / "data").glob("*.json"))
    }
    return (
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


def main() -> None:
    src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "whitepaper-strommix.html"
    if not src.is_absolute():
        src = ROOT / src
    html = src.read_text(encoding="utf-8")

    # Externe Projekt-JS-Datei inline ziehen (nur das Whitepaper hat eine).
    marker = '<script src="whitepaper-strommix.js"></script>'
    if marker in html:
        js = (ROOT / "whitepaper-strommix.js").read_text(encoding="utf-8")
        html = html.replace(marker, "<script>\n" + js + "\n</script>")

    # Fetch-Shim so frueh wie moeglich einfuegen, damit er vor jedem fetch laeuft.
    if "<head>" not in html:
        sys.exit("Kein <head> in der Quelle gefunden.")
    html = html.replace("<head>", "<head>\n" + build_shim(), 1)

    out = (
        pathlib.Path(sys.argv[2])
        if len(sys.argv) > 2
        else ROOT / "dist" / (src.stem + "-standalone.html")
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"OK: {out} ({out.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
