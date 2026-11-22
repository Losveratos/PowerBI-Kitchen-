#!/usr/bin/env python3
"""Baut data/teil1_data.json aus der Freigabeliste docs/03_teil1_freigabe.md.

Nur was im json-Block `teil1_data` der Freigabeliste steht, darf auf den
Seiten von Teil 1 erscheinen. Das Skript ist deterministisch (kein
Zeitstempel) und prueft: genau ein json-Block, jede in einem Erzaehlschritt
verwendete Zahlen-ID existiert, IDs sind eindeutig.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "03_teil1_freigabe.md"
DST = ROOT / "data" / "teil1_data.json"


def ids_in(obj):
    """Sammelt alle Werte von Schluesseln, die auf Zahlen-IDs verweisen."""
    found = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ("zahlen", "zahlen_ids", "ids") and isinstance(v, list):
                found += [x for x in v if isinstance(x, str)]
            else:
                found += ids_in(v)
    elif isinstance(obj, list):
        for x in obj:
            found += ids_in(x)
    return found


def main():
    text = SRC.read_text(encoding="utf-8")
    blocks = re.findall(r"```json\n(.*?)\n```", text, re.S)
    if len(blocks) != 1:
        sys.exit(f"erwartet genau einen json-Block, gefunden: {len(blocks)}")
    data = json.loads(blocks[0])
    root = data.get("teil1_data", data)

    zahlen = root.get("zahlen") or root.get("parameters") or []
    ids = [z["id"] for z in zahlen]
    doppelt = sorted({i for i in ids if ids.count(i) > 1})
    if doppelt:
        sys.exit(f"doppelte IDs: {doppelt}")
    # Der BIP-Bezugswert steht in meta.bip_bezug und gilt ebenfalls als freigegeben.
    bezug = (root.get("meta") or {}).get("bip_bezug") or {}
    erlaubt = set(ids) | ({bezug["id"]} if "id" in bezug else set())
    benutzt = set(ids_in({k: v for k, v in root.items() if k not in ("zahlen", "parameters")}))
    fehlend = sorted(benutzt - erlaubt)
    if fehlend:
        sys.exit(f"in Erzaehlschritten verwendet, aber nicht freigegeben: {fehlend}")

    DST.write_text(json.dumps(data, ensure_ascii=False, indent=1, sort_keys=False) + "\n", encoding="utf-8")
    print(f"{DST.relative_to(ROOT)}: {len(ids)} freigegebene Zahlen plus BIP-Bezugswert; {len(benutzt)} IDs in Erzaehlschritten verwendet")


if __name__ == "__main__":
    main()
