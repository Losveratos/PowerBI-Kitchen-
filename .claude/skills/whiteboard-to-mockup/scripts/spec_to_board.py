#!/usr/bin/env python3
"""mockup-spec.json (v3) oder ein leeres Start-Board -> Elemente eines Claude-Whiteboards.

  python3 spec_to_board.py <mockup-spec.json> <out-dir>     Review-Board aus einem Mockup
  python3 spec_to_board.py --starter <out-dir> [Titel]      leeres Board für den Workshop-Start

Schreibt je Element eine JSON-Datei nach <out-dir> und gibt die Schreibliste für
ArtifactData `batch` aus (eine Zeile je Paket, höchstens 50 Einträge). Das Skript
selbst schreibt nichts aufs Board.
"""
import json, os, sys

SC = 0.5          # Maßstab Leinwand -> Board
LW = 438          # Breite der linken Spalte (Auftrag, Kennzahlen)
STARTER = {
    "report": {"name": "Neuer Bericht", "audience": "…", "purpose": "…", "decision": "…"},
    "canvas": {"width": 1280, "height": 720},
    "zones": {"header": {"w": 1280, "h": 56, "title": "Berichtstitel"}},
    "pages": [{"name": "Seite 1", "question": "Welche Frage beantwortet die Seite?", "visuals": []}],
    "fields": [], "links": [], "issues": [],
}


def build(spec, starter=False):
    els = []

    def add(d):
        els.append((f"e{len(els) + 1}", d)); return els[-1][0]

    rep = spec["report"]; n = len(spec["pages"])
    title = f"{rep['name'].split(' · ')[0]} · Workshop-Board"
    add({"type": "text", "x": 0, "y": 0, "text": title, "size": "title"})
    lead = "Erst die Frage, dann die Kacheln. Gelb ist offen." if starter else f"{n} Seiten, je eine Leitfrage. Gelb ist noch offen."
    add({"type": "text", "x": 0, "y": 84, "text": lead, "size": "large"})

    add({"type": "container", "x": 0, "y": 200, "w": LW, "h": 312, "text": "Auftrag"})
    for k, (lab, key) in enumerate([("Zielgruppe", "audience"), ("Zweck", "purpose"), ("Entscheidung", "decision")]):
        add({"type": "shape", "kind": "rounded", "x": 24, "y": 224 + k * 96, "w": LW - 48, "h": 72, "color": "white",
             "size": "body", "textAlign": "left", "text": f"**{lab}:** {rep.get(key) or '…'}"})

    ms = [f for f in spec.get("fields", []) if f.get("kind") == "measure"]
    rows = {"r1": {"at": 1, "c1": "Kennzahl", "c2": "Format", "c3": "Bestätigt"}}
    for i, f in enumerate(ms):
        rows[f"r{i + 2}"] = {"at": i + 2, "c1": f["name"], "c2": f.get("formatString") or "–", "c3": "ja" if f.get("confirmed") else "offen"}
    if not ms:
        for i in range(3): rows[f"r{i + 2}"] = {"at": i + 2, "c1": "…", "c2": "", "c3": "offen"}
    add({"type": "container", "x": 0, "y": 592, "w": LW, "h": 48 + 44 * len(rows) + 16, "text": "Kennzahlen"})
    add({"type": "table", "x": 24, "y": 616, "cols": {"c1": {"at": 1, "w": 150}, "c2": {"at": 2, "w": 110}, "c3": {"at": 3, "w": 130}}, "rows": rows})

    X0 = LW + 64; CW = int(spec["canvas"]["width"] * SC) + 48; CH = int(spec["canvas"]["height"] * SC) + 48
    add({"type": "shape", "kind": "rounded", "x": X0 + CW + 144, "y": 84, "w": 170, "h": 44, "color": "yellow", "size": "small", "text": "offener Punkt"})
    add({"type": "shape", "kind": "rounded", "x": X0 + CW + 338, "y": 84, "w": 170, "h": 44, "color": "green", "size": "small", "text": "abgestimmt"})
    if starter:
        add({"type": "text", "x": X0 + CW + 144, "y": 224, "size": "body", "wrap": 380,
             "text": "**So geht's**\n- Eine Sektion je Berichtsseite, im Titel: Name · Leitfrage\n- Ein Block je Kachel: erste Zeile Titel, zweite Zeile Typ (KPI, Linie, Balken, Wasserfall, Tabelle, GuV, Text …)\n- Größe und Lage des Blocks zählen\n- Pfeil von einer Kachel auf eine Seite: Drill-through"})

    issue_ids = {i["visual"] for i in spec.get("issues", []) if i.get("visual") and i.get("level") == "warn"}
    conts, tiles, geo = [], [], {}
    for i, p in enumerate(spec["pages"]):
        cx = X0 + (i % 2) * (CW + 144); cy = 200 + (i // 2) * (CH + 80)
        q = p.get("question"); t = p["name"] + (f" · {q}" if q else " · Leitfrage fehlt")
        conts.append((p["name"], {"type": "container", "x": cx, "y": cy, "w": CW, "h": CH, "text": t}))
        px, py = cx + 24, cy + 24; h = spec["zones"]["header"]
        tiles.append((None, {"type": "shape", "kind": "rect", "x": px, "y": py, "w": int(h["w"] * SC), "h": int(h["h"] * SC),
                             "color": "white", "size": "small", "text": h.get("title") or "Berichtstitel"}))
        geo[p["name"]] = (cx, cy)
        for v in p["visuals"]:
            r = v["rect"]; w = round(r["w"] * SC); hh = round(r["h"] * SC); tt = v["title"]
            if len(tt) * 7 + 20 > w: tt = tt[:max(3, (w - 20) // 7 - 1)] + "…"
            lab = v.get("label") or v["kind"]
            if hh >= 100 and len(lab) * 7 + 20 <= w: tt = f"**{tt}**\n{lab}"
            col = "yellow" if v["id"] in issue_ids else ("green" if (v.get("workshop") or {}).get("status") == "agreed" else "white")
            d = {"type": "shape", "kind": "rounded", "x": round(px + r["x"] * SC), "y": round(py + r["y"] * SC), "w": w, "h": hh,
                 "color": col, "size": "small", "text": tt}
            tiles.append((v["id"], d)); geo[v["id"]] = (d, p["name"])
    pid = {name: add(d) for name, d in conts}
    vid = {}
    for v, d in tiles:
        i = add(d)
        if v: vid[v] = i
    for l in spec.get("links", []):
        if l["fromVisual"] not in vid or l["toPage"] not in pid: continue
        a = {"type": "arrow", "from": vid[l["fromVisual"]], "to": pid[l["toPage"]], "label": "Drill-through", "color": "terracotta"}
        d, src_page = geo[l["fromVisual"]]; (sx, sy), (tx, ty) = geo[src_page], geo[l["toPage"]]
        if ty == sy and tx > sx:   # Zielseite rechts daneben: unter der Quellseite entlang, im Zwischenraum hoch
            a["bends"] = ["v", round(sy + CH + 24 - (d["y"] + d["h"] / 2)), round((tx - 72) - (tx + CW / 2))]
        add(a)
    order = [i for i, d in els if d["type"] == "container"] + [i for i, d in els if d["type"] != "container"]
    return title, els, order


def main():
    a = sys.argv[1:]
    starter = a and a[0] == "--starter"
    if len(a) < 2: sys.exit(__doc__)
    if starter:
        spec = json.loads(json.dumps(STARTER)); out = a[1]
        if len(a) > 2: spec["report"]["name"] = a[2]
    else:
        spec = json.load(open(a[0], encoding="utf-8")); out = a[1]
        if "pages" not in spec or "report" not in spec: sys.exit("Erwartet wird eine mockup-spec.json ab specVersion 3 (pages[], report).")
    title, els, order = build(spec, starter)
    out = os.path.abspath(out); os.makedirs(out, exist_ok=True)
    json.dump({"v": 1, "title": title, "order": order}, open(f"{out}/meta.json", "w", encoding="utf-8"), ensure_ascii=False)
    writes = [{"op": "set", "collection": "board", "doc_id": "meta", "file_path": f"{out}/meta.json"}]
    for i, d in sorted(els, key=lambda e: order.index(e[0])):
        json.dump(d, open(f"{out}/{i}.json", "w", encoding="utf-8"), ensure_ascii=False)
        writes.append({"op": "set", "collection": "elements", "doc_id": i, "file_path": f"{out}/{i}.json"})
    for k in range(0, len(writes), 50): print(json.dumps(writes[k:k + 50], ensure_ascii=False))
    print(f"{len(els)} Elemente, Board-Titel: {title}", file=sys.stderr)


if __name__ == "__main__":
    main()
