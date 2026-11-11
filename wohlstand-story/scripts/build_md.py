#!/usr/bin/env python3
"""Schreibt ../md/zwei-heimaten.md aus dem Text von story_template.html (Prosa, Schritt-Karten, Grenzen, Methode).
Zahlen kommen damit aus demselben Text, den check_numbers.py prüft.

    python3 -I wohlstand-story/scripts/build_md.py
"""
import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
TPL = (ROOT / "story_template.html").read_text(encoding="utf-8")
D = json.loads((ROOT / "data" / "story_data.json").read_text(encoding="utf-8"))
URL = "https://datenwgknowledgekitchen.com/zwei-heimaten.html"


def plain(s):
    s = re.sub(r"<span class=\"conf[^\"]*\"[^>]*>(\w)</span>", r" [\1]", s)
    s = re.sub(r"<button[^>]*>.*?</button>", "", s, flags=re.S)          # Knöpfe gibt es nur in der HTML-Fassung
    s = re.sub(r"<a [^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>", lambda m: f"[{m.group(2)}]({m.group(1)})" if m.group(2).strip() else "", s)
    s = re.sub(r"<b>(.*?)</b>", r"**\1**", s)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


body = TPL[TPL.index("<!-- ================= PROLOG"):TPL.index("<footer>")]
out = []
for m in re.finditer(r'<div class="kicker">(.*?)</div>|<h2>(.*?)</h2>|<h3>(.*?)</h3>|<p[^>]*>(.*?)</p>|<div class="fig-title"><div class="t">(.*?)</div>'
                     r'|<h4>(.*?)</h4><p>(.*?)</p>|<summary>(.*?)</summary>|<li>(.*?)</li>', body, re.S):
    k, h2, h3, p, act, h4, p4, summ, li = m.groups()
    if act: out.append(f"\n## {plain(act)}\n")
    elif h2: out.append(f"\n## {plain(h2)}\n")
    elif h3: out.append(f"\n### {plain(h3)}\n")
    elif h4: out.append(f"\n**{plain(h4)}.** {plain(p4)}\n")
    elif summ and "als Tabelle" not in summ: out.append(f"\n### {plain(summ)}\n")   # die Tabelle füllt das Skript der Seite; ihre Werte stehen oben unter „Kennzahlen“
    elif li: out.append(f"- {plain(li)}")
    elif p and plain(p): out.append(plain(p) + "\n")

P, W = D["places"], D["world"]
dot = lambda v: f"{v:,}".replace(",", ".")
rows = "\n".join(f"| {lab} | {dot(P['koeln'][k])} | {dot(P['osl'][k])} |" for lab, k in
                 [("BIP pro Kopf (KKP, Int.$)", "gdp"), ("zu regionalen Preisen (Int.$)", "rp"), ("Konsum der Haushalte pro Kopf, verteilt nach verfügbarem Einkommen (Int.$, RB Köln / Brandenburg)", "hh")])
lv = "\n".join(f"| {n} | {str(P['osl']['world_below'][str(i)]).replace('.', ',')} % | {str(P['koeln']['world_below'][str(i)]).replace('.', ',')} % |"
               for i, n in enumerate(["Länder", "Bundesländer", "Kreise (feinste Ebene)", "Metropolregionen"]))
try:
    stand = subprocess.run(["git", "-C", str(REPO), "log", "-1", "--format=%cs", "--", "wohlstand-story/story_template.html"],
                           capture_output=True, text=True).stdout.strip() or "2026-11"
except Exception:
    stand = "2026-11"

md = f"""# Zwei Heimaten. Eine Welt.

> Köln und der Oberspreewald-Lausitz-Kreis liegen in Deutschland weit auseinander: Rang {P['koeln']['de_rank']} und Rang {P['osl']['de_rank']} von {P['osl']['de_n']} Kreisen. In der Welt stehen beide weit oben: Rund {round(P['osl']['world_below']['2'])} % bzw. rund {round(P['koeln']['world_below']['2'])} % der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf, und selbst der letzte deutsche Kreis ({D['germany']['poorest']['name']}) liegt bei rund {round(D['germany']['poorest']['world_below'])} %. Deutschland steht heute so weit oben wie {D['trend']['start']} ({round(D['trend']['first']['below'])} % → {round(D['trend']['last']['below'])} % der Menschheit in Ländern mit niedrigerem BIP pro Kopf), sein Vorsprung vor dem Weltdurchschnitt ist aber vom {str(D['trend']['first']['x_mean']).replace('.', ',')}-Fachen auf das {str(D['trend']['last']['x_mean']).replace('.', ',')}-Fache geschrumpft.

- **Quelle:** {URL}
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `zwei-heimaten.html` (Text aus `wohlstand-story/story_template.html`) · Stand {stand}
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, {URL} — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwünscht.
- **Hinweis für Agenten:** Diese Markdown-Fassung enthält den Text der Story. Grafiken (Deutschlandkarte, Kurve der Menschheit, Quadrate, Balken), die Schätzfrage und der Vergleich eigener Orte („Wo steht deine Heimat?“, teilbar als `zwei-heimaten.html#vs=<ID>,<ID>` mit den IDs aus der CSV des Atlas) gibt es nur in der HTML-Fassung; die wichtigsten Zahlen stehen unten als Tabelle.
- **Datengrundlage:** [Wohlstandsatlas](https://datenwgknowledgekitchen.com/md/wohlstandsatlas.md): Weltbank WDI 2024, IWF WEO, Eurostat (NUTS-3 2023), Regionaler Preisindex 2022 (BBSR/IW). Regionen = Anteil laut Statistikamt × Landeswert 2024 (hochgerechnet).
- **Reproduzierbarkeit:** `wohlstand-story/scripts/build_story_data.py` rechnet alle Zahlen aus den Atlasdaten, `check_numbers.py` prüft jede Zahl im Text.

## Kennzahlen

Genaue Rechenwerte. Im Text der Story stehen sie gerundet (ganze Prozent, Int.$ mit drei geltenden Stellen), weil sich kleine Kreise nicht auf den Zehntelpunkt messen lassen.

| Kennzahl | Köln | Oberspreewald-Lausitz |
|---|---|---|
{rows}

Anteil der Menschheit in Regionen mit niedrigerem BIP pro Kopf, je Ebene des Atlas:

| Ebene | OSL | Köln |
|---|---|---|
{lv}

Weltdurchschnitt {W['mean']:,} Int.$, mittlerer Mensch {W['median']:,} Int.$ ({W['median_name']}); zwischen OSL und Köln liegen Regionen mit {str(W['between_share']).replace('.', ',')} % der Menschheit.

Wie eng es ist: {W['tight']['n_near']} andere Kreise liegen höchstens {W['tight']['band']} % von OSL entfernt (Rang {W['tight']['rank_plus']} bis {W['tight']['rank_minus']} bei ±{W['tight']['band']} %); verfügbares Einkommen je Einwohner {D['income']['year']} (VGR der Länder): Köln {dot(D['income']['koeln']['eur'])} Euro, OSL {dot(D['income']['osl']['eur'])} Euro, Faktor {str(D['income']['ratio']).replace('.', ',')}; umgerechnet {dot(D['income']['koeln']['int'])} und {dot(D['income']['osl']['int'])} Int.$, in der Welt {str(D['income']['koeln']['world_below']).replace('.', ',')} % und {str(D['income']['osl']['world_below']).replace('.', ',')} %; {D['income']['n_near']} Kreise liegen beim Einkommen höchstens {D['income']['band']} % von OSL entfernt.

Abgleich mit den Originalquellen: BIP pro Kopf aller {D['checks']['n_kreise']} Kreise aus Eurostat {D['checks']['eurostat_year']} und Weltbank nachgerechnet, größte Abweichung zum Atlas {str(D['checks']['max_dev_pct']).replace('.', ',')} %, alle Ränge gleich (Bericht: `wohlstand-story/data/sources/ABGLEICH.md`).

Deutschland unter den {D['trend']['n']} Ländern mit durchgehender Reihe (reales BIP pro Kopf, Int.$ von 2021; Anteile und Durchschnitt mit der Bevölkerung des jeweiligen Jahres gewichtet; Taiwan fehlt): Platz {D['trend']['first']['rank']} im Jahr {D['trend']['start']}, Platz {D['trend']['last']['rank']} im Jahr {D['trend']['end']}; das {str(D['trend']['first']['x_mean']).replace('.', ',')}-Fache des Weltdurchschnitts {D['trend']['start']}, das {str(D['trend']['last']['x_mean']).replace('.', ',')}-Fache {D['trend']['end']}; reales BIP pro Kopf seit 2019 {str(D['trend']['since2019']['DEU']).replace('.', ',').replace('-', '−')} %, USA +{str(D['trend']['since2019']['USA']).replace('.', ',')} %, Polen +{str(D['trend']['since2019']['POL']).replace('.', ',')} %.
""".replace("24,505", "24.505").replace("15,265", "15.265")
md += "\n" + "\n".join(out).replace("\n\n\n", "\n\n") + "\n"
(REPO / "md" / "zwei-heimaten.md").write_text(md, encoding="utf-8")
print(f"✓ md/zwei-heimaten.md · {len(md) // 1024} KB")
