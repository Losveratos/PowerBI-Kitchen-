#!/usr/bin/env python3
"""Baut die Story „Die Treppe und die Wolke“.

    python3 -I schlau-gebildet-reich/scripts/build_story.py

Schritte:
  1. Veröffentlichte Werte aus data/quellen.json lesen (amtliche Statistik, Studien).
  2. Modellbevölkerung rechnen (scripts/model.py, fester Startwert).
  3. data/story_data.json schreiben (alles, was die Seite zeigt).
  4. story_template.html füllen: {{schlüssel}} im Text, Daten und charts.js im Skript
     → ../schlau-gebildet-reich-story.html
  5. Text der Story als Markdown → ../md/schlau-gebildet-reich-story.md

Kennzahlen aus Quellen und Modell stehen im Text als Platzhalter. Ein Platzhalter ohne Wert
bricht den Lauf ab.
"""
import html
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import model as M  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
OUT_HTML = REPO / "schlau-gebildet-reich-story.html"
OUT_MD = REPO / "md" / "schlau-gebildet-reich-story.md"
URL = "https://datenwgknowledgekitchen.com/schlau-gebildet-reich-story.html"

SEED = 20261124
N_BIG = 400_000        # Personen für die Kennzahlen im Text
N_SHOW = 1_500         # Personen, die die Seite zeichnet
R_MAIN = 0.3           # Hauptannahme für den Zusammenhang Testleistung–Verdienstrang
R_SET = [0.2, 0.3, 0.4]


def de(v, digits=0):
    s = f"{v:,.{digits}f}"
    return s.replace(",", "§").replace(".", ",").replace("§", ".").replace("-", "−")


def main():
    Q = json.loads((ROOT / "data" / "quellen.json").read_text(encoding="utf-8"))
    P = Q["werte"]

    # ---------------- Verdienstverteilung ----------------
    e = P["verdienst_jahr"]
    earn = M.Earnings([(a["p"], a["euro"]) for a in e["perzentile"]], mean=e["mittelwert"], floor=e["untergrenze"])
    p50 = e["median"]
    assert abs(earn.q(0.5) - p50) < 1, "Median ist keine Stützstelle"
    assert abs(earn.mean() - e["mittelwert"]) < 1
    mean_pct = earn.percentile_of(e["mittelwert"])
    parade = [round(earn.q((i + 0.5) / 100)) for i in range(99)]
    # Person 100 = Mittelwert des obersten Prozents
    parade.append(round(earn.share_above(0.99) * earn.mean() / 0.01))

    # ---------------- Gruppen ----------------
    ba = P["ba_entgelt"]
    shares = [g["anteil"] for g in ba["gruppen"]]
    tot = sum(shares)
    shares = [s / tot for s in shares]                      # ohne „Abschluss unbekannt“ auf 100 % gerechnet
    thr = M.cuts(shares)
    target = [g["median"] / ba["median_alle"] for g in ba["gruppen"]]
    rho = M.fit_rho(earn, thr, target)
    r_ge = P["strenze"]["r_bildung"]

    # ---------------- Modellbevölkerung ----------------
    pop = M.draw(N_BIG, SEED, r_ge)
    model = {}
    spitze = {}
    bins = list(range(55, 146))

    def dichte_top1(r, iq):
        """Dichte der Testleistung im obersten Verdienstprozent, in Prozent je IQ-Punkt (exakt, ohne Zufall)."""
        g, z99 = (iq - 100) / 15, M.PHI_INV(0.99)
        return 100 * M.ND.pdf(g) / 15 * (1 - M.PHI((z99 - r * g) / math.sqrt(1 - r * r))) / 0.01
    wolke = {}
    grp = [M.group_of(p[1], thr) for p in pop]
    for r in [0.0] + R_SET:
        a, b, c = M.weights(r, rho if r else 0.0, r_ge) if r else (0.0, 0.0, 1.0)
        if r == 0.0:
            # kein Zusammenhang mit der Testleistung, Zusammenhang mit dem Abschluss ausgeblendet
            ys = [p[2] for p in pop]
        else:
            ys = [a * p[0] + b * p[1] + c * p[2] for p in pop]
        z99 = M.PHI_INV(0.99)
        top = [p[0] for p, y in zip(pop, ys) if y > z99]
        hi = [y for p, y in zip(pop, ys) if p[0] > 0]
        # Median des Verdienstes je Testleistungsband (für die Linie in der Wolke)
        band = []
        for lo in range(62, 139, 6):
            sel = sorted(y for p, y in zip(pop, ys) if lo <= 100 + 15 * p[0] < lo + 6)
            if len(sel) > 200:
                band.append([lo + 3, round(earn.from_z(M.quantile(sel, 0.5)))])
        wolke[f"{r:g}"] = band
        if r == 0.0:
            continue
        top130 = sorted(y for p, y in zip(pop, ys) if p[0] > 2.0)          # IQ über 130
        key = f"r{int(round(r * 100))}"
        model[key] = {
            "above_iq_below_median": round(100 * sum(1 for y in hi if y < 0) / len(hi), 1),
            "top1_mean_iq": round(100 + 15 * sum(top) / len(top), 1),
            "top1_below100": round(100 * sum(1 for g in top if g < 0) / len(top), 1),
            "top1_above130": round(100 * sum(1 for g in top if g > 2) / len(top), 1),
            "iq130_median": round(earn.from_z(M.quantile(top130, 0.5))),
            "iq130_below_median": round(100 * sum(1 for y in top130 if y < 0) / len(top130), 1),
            "iq130_top10": round(100 * sum(1 for y in top130 if y > M.PHI_INV(0.9)) / len(top130), 1),
            "r2": round(100 * r * r),
            "partial": round(M.partial_r(r, rho, r_ge), 2),
        }
        spitze[f"{r:g}"] = {"hist": [round(dichte_top1(r, q), 3) for q in bins], "mean_iq": model[key]["top1_mean_iq"],
                          "below100": model[key]["top1_below100"]}
        if r == R_MAIN:
            ys_main = ys
    spitze["alle"] = [round(100 * M.ND.pdf((q - 100) / 15) / 15, 3) for q in bins]
    spitze["bins"] = bins

    # Gruppenwerte bei der Hauptannahme
    g_y = [[], [], []]
    for p, y, k in zip(pop, ys_main, grp):
        g_y[k].append(y)
    for k in range(3):
        g_y[k].sort()
    med_z = [M.quantile(g, 0.5) for g in g_y]
    gruppen = {"rows": [], "rho": round(rho, 2), "stichtag": ba["stichtag"]}
    grenzen = ba["klassen_grenzen"]
    z_grenzen = [M.PHI_INV(earn.percentile_of(g / ba["median_alle"] * p50)) for g in grenzen]   # gleiche Lage relativ zum Median
    for k, g in enumerate(ba["gruppen"]):
        n = len(g_y[k])
        kum_modell = [round(100 * sum(1 for y in g_y[k] if y <= z) / n, 1) for z in z_grenzen]
        kum_ba = [round(100 * sum(g["klassen"][:i + 1]) / g["anteil"], 1) for i in range(len(grenzen))]
        gruppen["rows"].append({
            "label": g["label"], "short": g["kurz"], "share": round(shares[k], 3), "pct": round(100 * shares[k]),
            "median": round(earn.from_z(med_z[k])), "ba_median": g["median"],
            "ziel": round(target[k] * p50),
            "kum_ba": kum_ba, "kum_modell": kum_modell,
        })
    R = gruppen["rows"]
    # Überlappung, gemessen (Entgeltklassen der BA) und im Modell an derselben Stelle relativ zum Median
    gruppen["mid_ueber_6000"] = round(100 - R[1]["kum_ba"][4], 1)
    gruppen["top_bis_4000"] = R[2]["kum_ba"][2]
    gruppen["low_ueber_4000"] = round(100 - R[0]["kum_ba"][2], 1)
    gruppen["low_bis_3000"] = R[0]["kum_ba"][1]
    gruppen["top_ueber_6000"] = round(100 - R[2]["kum_ba"][4], 1)
    gruppen["m_mid_ueber_6000"] = round(100 - R[1]["kum_modell"][4], 1)
    gruppen["m_top_bis_4000"] = R[2]["kum_modell"][2]
    gruppen["m_low_ueber_4000"] = round(100 - R[0]["kum_modell"][2], 1)
    gruppen["linie_6000"] = round(6000 / ba["median_alle"] * p50)

    # Punkte für die Seite: [iq, gruppe, y(r=0), y(0.2), y(0.3), y(0.4)]
    pts = []
    for p in pop[:N_SHOW]:
        row = [round(100 + 15 * p[0], 1), M.group_of(p[1], thr), round(earn.from_z(p[2]))]
        for r in R_SET:
            a, b, c = M.weights(r, rho, r_ge)
            row.append(round(earn.from_z(a * p[0] + b * p[1] + c * p[2])))
        pts.append(row)

    t = P["treppe"]
    D = {
        "treppe": {"rows": [{"label": x["label"], "short": x["kurz"], "v": x["euro"]} for x in t["stufen"]], "all": t["alle"], "stand": t["stand"]},
        "earn": {"jahr": e["jahr"], "p10": round(earn.q(0.10)), "p50": p50, "p90": round(earn.q(0.90)), "p99": round(earn.q(0.99)),
                 "mean": e["mittelwert"], "mean_pct": round(100 * mean_pct, 1), "alpha": round(earn.alpha, 2),
                 "top1_share": round(100 * earn.share_above(0.99), 1), "top10_share": round(100 * earn.share_above(0.90), 1)},
        "parade": parade,
        "pts": pts,
        "wolke": wolke,
        "model": model,
        "spitze": spitze,
        "gruppen": gruppen,
        "tri": {"r_ge": r_ge, "rho": round(rho, 2), "r_gy_label": P["strenze"]["r_einkommen_label"]},
        "vermoegen": P["vermoegen"],
        "unsichtbar": P["unsichtbar"],
        "schweden": {"iq": P["keuschnigg"]["top1_iq"], "sd": P["keuschnigg"]["top1_sd"]},
    }
    (ROOT / "data" / "story_data.json").write_text(json.dumps(D, ensure_ascii=False, indent=1), encoding="utf-8")

    # ---------------- Platzhalter für den Text ----------------
    T = {}

    def flat(prefix, obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                flat(f"{prefix}.{k}" if prefix else k, v)
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                flat(f"{prefix}.{i}", v)
        else:
            T[prefix] = obj

    flat("q", P)
    flat("d", {k: v for k, v in D.items() if k not in ("pts", "parade", "wolke", "spitze")})
    T["d.parade.99"] = parade[99]
    T["d.parade.0"] = parade[0]
    T["calc.treppe_faktor"] = t["stufen"][-1]["euro"] / t["stufen"][0]["euro"]
    T["calc.mean_median"] = e["mittelwert"] / p50
    T["calc.p99_median"] = earn.q(0.99) / p50
    T["calc.verm_mean_median"] = P["vermoegen"]["mean"] / P["vermoegen"]["median"]
    T["calc.unter_mittel"] = round(100 * mean_pct)
    T["calc.n_big"] = N_BIG
    T["calc.n_show"] = N_SHOW
    T["calc.seed"] = SEED
    T["calc.stand"] = Q["stand"]
    T["calc.p80"] = round(earn.q(0.80), -2)
    T["calc.ohne_ueber_6000_n"] = ba["gruppen"][0]["klassen"][5]
    T["calc.ohne_ueber_6000"] = round(100 * ba["gruppen"][0]["klassen"][5] / ba["gruppen"][0]["anteil"], 1)
    T["calc.iab_ohne_mio"] = P["iab_leben"]["ohne"] / 1e6
    T["calc.iab_hoch_mio"] = P["iab_leben"]["hochschule"] / 1e6
    T["calc.rest_r30"] = 100 - model["r30"]["r2"]
    T["calc.ba_faktor"] = ba["gruppen"][2]["median"] / ba["gruppen"][0]["median"]
    T["calc.r_min"] = r_ge * rho
    for i, row in enumerate(P["unsichtbar"]["rows"]):
        T[f"calc.nicht_erwerb_{i}"] = round(100 - row["erwerb"], 1)
    T["calc.top1_mittel"] = round(parade[99], -3)
    T["calc.quali_faktor"] = P["quali"]["ohne"] / P["quali"]["akademisch"]
    T["calc.verm_ohne_faktor"] = P["vermoegen"]["bildung"][0]["mean"] / P["vermoegen"]["bildung"][0]["median"]
    T["calc.n_quellen"] = len(Q["quellen"])

    def fill(m):
        key, _, fmt = m.group(1).partition("|")
        if key not in T:
            raise SystemExit(f"Platzhalter ohne Wert: {key}")
        v = T[key]
        if isinstance(v, str):
            return html.escape(v, quote=False)
        if fmt == "raw":
            return str(v)
        digits = int(fmt) if fmt else (0 if float(v) == int(v) or abs(v) >= 100 else 1)
        return de(v, digits)

    tpl = (ROOT / "story_template.html").read_text(encoding="utf-8")
    refs = "\n".join(
        f'<li id="q-{s["id"]}"><span class="conf conf-{s["stufe"]}" title="Stufe {s["stufe"]}">{s["stufe"]}</span> {html.escape(s["zitat"], quote=False)} '
        f'<a href="{html.escape(s["url"])}" rel="noopener">{html.escape(s["linktext"], quote=False)}</a>'
        f'{" · " + html.escape(s["hinweis"], quote=False) if s.get("hinweis") else ""}</li>'
        for s in Q["quellen"])
    tpl = tpl.replace("<!--__QUELLEN__-->", refs)
    page = re.sub(r"\{\{([^{}]+)\}\}", fill, tpl)
    blob = json.dumps(D, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    if page.count("/*__DATA__*/null") != 1 or page.count("/*__CHARTS__*/") != 1:
        raise SystemExit("Platzhalter für Daten oder Diagramme nicht genau einmal im Template")
    page = page.replace("/*__DATA__*/null", blob).replace("/*__CHARTS__*/", (ROOT / "charts.js").read_text(encoding="utf-8"))
    # von build_seo.js gepflegten Block der bestehenden Seite behalten
    if OUT_HTML.exists():
        old = re.search(r"<!--seo-ld:start-->.*?<!--seo-ld:end-->\n?", OUT_HTML.read_text(encoding="utf-8"), re.S)
        if old:
            page = page.replace("</head>", old.group(0).rstrip("\n") + "\n</head>", 1)
    OUT_HTML.write_text(page, encoding="utf-8")
    print(f"✓ {OUT_HTML.name} · {OUT_HTML.stat().st_size / 1024:.0f} KB")

    write_md(page, Q, D)
    print(f"✓ md/{OUT_MD.name}")
    print(f"  rho = {rho:.3f} · alpha = {earn.alpha:.2f} · Mittelwert bei Perzentil {100 * mean_pct:.1f}")
    for k, g in enumerate(gruppen["rows"]):
        print(f"  {g['short']:<22} Modell-Median {g['median']:>7} · Ziel {g['ziel']:>7}")
    print("  " + json.dumps(model, ensure_ascii=False))


def write_md(page, Q, D):
    def plain(s):
        s = re.sub(r'<(span|a) class="conf[^"]*"[^>]*>(\w)</(?:span|a)>', r"[\2]", s)
        s = re.sub(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', lambda m: m.group(2) if m.group(1).startswith("#") else f"[{m.group(2)}]({m.group(1)})", s, flags=re.S)
        s = re.sub(r"<b>(.*?)</b>", r"**\1**", s, flags=re.S)
        s = re.sub(r"<[^>]+>", " ", s)
        return re.sub(r"\s+", " ", html.unescape(s)).strip()

    body = page[page.index('<header class="hero">'):page.index("<footer")]
    body = re.sub(r"<svg.*?</svg>", "", body, flags=re.S)
    out = []
    rx = (r'<div class="kicker">(.*?)</div>|<h1>(.*?)</h1>|<h2>(.*?)</h2>|<h3>(.*?)</h3>|<p[^>]*>(.*?)</p>'
          r'|<div class="step"[^>]*><span class="n">(.*?)</span>(.*?)</div>|<li[^>]*>(.*?)</li>|<tr>(.*?)</tr>|<summary>(.*?)</summary>'
          r'|<div class="stat-i"><b>(.*?)</b><span>(.*?)</span></div>')
    for m in re.finditer(rx, body, re.S):
        k, h1, h2, h3, p, sn, st, li, trow, summ, sb, ss = m.groups()
        if k:
            out.append(f"\n*{plain(k)}*")
        elif h1:
            continue
        elif h2:
            out.append(f"\n## {plain(h2)}\n")
        elif h3:
            out.append(f"\n### {plain(h3)}\n")
        elif sn:
            out.append(f"**{plain(sn)}.** {plain(st)}\n")
        elif li:
            out.append(f"- {plain(li)}")
        elif trow:
            cells = [plain(c) for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", trow, re.S)]
            out.append("| " + " | ".join(cells) + " |")
            if "<th" in trow:
                out.append("|" + "---|" * len(cells))
        elif summ:
            out.append(f"\n### {plain(summ)}\n")
        elif sb:
            out.append(f"- **{plain(sb)}** {plain(ss)}")
        elif p and plain(p):
            out.append(plain(p) + "\n")
    title = plain(re.search(r"<h1>(.*?)</h1>", page, re.S).group(1))
    desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', page).group(1))
    md = f"""# {title}

> {desc}

- **Quelle:** {URL}
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `schlau-gebildet-reich-story.html` (Text aus `schlau-gebildet-reich/story_template.html`) · Stand {Q['stand']}
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, {URL} — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwünscht.
- **Hinweis für Agenten:** Diese Markdown-Fassung enthält den Text der Story. Die Diagramme gibt es nur in der HTML-Fassung. Kennzeichnung der Belege: [A] amtliche Statistik, [B] Metaanalyse oder Studie mit deutschen Daten, [C] Studie aus einem anderen Land, [M] eigene Modellrechnung.
- **Reproduzierbarkeit:** `schlau-gebildet-reich/scripts/build_story.py` rechnet das Modell mit festem Startwert und setzt die Kennzahlen als Platzhalter in den Text. Veröffentlichte Werte stehen in `schlau-gebildet-reich/data/quellen.json`.
"""
    md += "\n" + "\n".join(out) + "\n"
    md = re.sub(r"\n{3,}", "\n\n", md)
    OUT_MD.write_text(md, encoding="utf-8")


if __name__ == "__main__":
    main()
