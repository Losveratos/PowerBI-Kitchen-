#!/usr/bin/env python3
"""Erzeugt die Markdown-Exporte der beiden Strommix-Seiten.

Ziel: md/whitepaper-strommix.md und md/strommix-story.md — die
KI-/Agenten-lesbare Fassung von whitepaper-strommix.html und
strommix-story.html, direkt aus denselben Daten gebaut, aus denen die
HTML-Seiten zur Laufzeit ihre Zahlen ziehen. Damit kann der Markdown-Text
nicht gegen die Webseite driften.

Eingaben (alle unter strommix/data/):
  page_data.json            redaktioneller Datensatz des White Papers
  story_data.json           geprüfte Aussagen und Zahlen der Visual Story
  monte_carlo_reference.json  1.000 gepaarte Ziehungen je Konfiguration
  model_params.json         Parametersatz des Kostenmodells

DETERMINISMUS — die wichtigste Eigenschaft dieses Skripts:
Zwei Läufe auf demselben Repo-Stand müssen byteidentische Dateien
erzeugen. Deshalb
  * kein datetime.now() — das Stand-Datum kommt aus dem Git-Commit-Datum
    der Eingabedateien (jüngstes Committer-Datum der vier JSONs),
  * keine Iteration über unsortierte Mengen,
  * keine Zufallszahlen; die Monte-Carlo-Ergebnisse werden fertig aus
    monte_carlo_reference.json gelesen, nicht neu gezogen.

Aufruf (aus dem Repo-Wurzelverzeichnis oder von überall):
    python3 strommix/scripts/build_md_exports.py

Prüfen, ob der Lauf deterministisch ist:
    python3 strommix/scripts/build_md_exports.py --check
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DATA = REPO / "strommix" / "data"
OUT = REPO / "md"

SITE = "https://datenwgknowledgekitchen.com"

INPUTS = [
    "page_data.json",
    "story_data.json",
    "monte_carlo_reference.json",
    "model_params.json",
]

# ---------------------------------------------------------------- Formatierung


def de(value, digits=0):
    """Zahl in deutscher Schreibweise: 1.234,5 — None wird zu einem Strich."""
    if value is None:
        return "—"
    s = f"{float(value):,.{digits}f}"
    return s.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def rng(lo, hi, digits=0):
    return f"{de(lo, digits)}–{de(hi, digits)}"


def table(header, rows, align=None):
    """Markdown-Tabelle. align: Liste aus 'l' / 'r' / 'c' je Spalte."""
    align = align or ["l"] * len(header)
    sep = {"l": ":---", "r": "---:", "c": ":---:"}
    out = ["| " + " | ".join(header) + " |", "|" + "|".join(sep[a] for a in align) + "|"]
    for r in rows:
        out.append("| " + " | ".join("" if c is None else str(c) for c in r) + " |")
    return "\n".join(out)


# ---------------------------------------------------------------- Stand-Datum


def git_data_date():
    """Jüngstes Git-Committer-Datum der Eingabedateien (YYYY-MM-DD).

    Bewusst NICHT die Laufzeit-Uhr: sonst änderte sich die Ausgabe bei
    jedem Lauf und der Doppellauf-Test wäre wertlos.
    """
    dates = []
    for name in INPUTS:
        rel = f"strommix/data/{name}"
        try:
            res = subprocess.run(
                ["git", "-C", str(REPO), "log", "-1", "--format=%cs", "--", rel],
                capture_output=True,
                text=True,
                check=True,
            )
        except (OSError, subprocess.CalledProcessError):
            continue
        stamp = res.stdout.strip()
        if stamp:
            dates.append(stamp)
    if not dates:
        raise SystemExit(
            "build_md_exports: kein Git-Commit-Datum fuer die Eingabedaten gefunden. "
            "Das Skript braucht ein Git-Repo, um ein deterministisches Stand-Datum zu setzen."
        )
    return max(dates)


def header_block(title, subtitle, page, stand, model_version, extra_lines=()):
    """Kopfblock jeder Exportdatei — bewusst OHNE YAML-Frontmatter.

    GitHub Pages baut das Repo mit Jekyll. Eine Datei mit YAML-Header
    wuerde als Jekyll-Page behandelt, durch Liquid geschickt und der
    Header abgeschnitten; ein ungueltiges Datumsfeld hat den Pages-Build
    schon einmal komplett zerlegt. Siehe md/README.md.
    """
    lines = [
        f"# {title}",
        "",
        f"> {subtitle}",
        "",
        f"- **Quelle:** {SITE}/{page}",
        f"- **Markdown-Fassung:** {SITE}/md/{page.replace('.html', '.md')}",
        "- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen",
        f"- **Stand der Daten:** {stand} (Git-Commit-Datum der Quelldaten)",
        f"- **Modellstand:** v{model_version}",
        "- **Status:** Entwurf. Jede Zahl traegt eine Konfidenzstufe — "
        "A/B/C bzw. M fuer Modellsetzung. Ohne die Konfidenzstufe ist eine Zahl "
        "aus diesem Dokument nicht zitierfaehig.",
        "- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, "
        f"{SITE}/{page} — Abruf mit Datum angeben. Weiterverwendung mit "
        "Quellenangabe erwuenscht; Zahlen bitte mit Konfidenzstufe und "
        "Stand uebernehmen.",
        "- **Erzeugt von:** `strommix/scripts/build_md_exports.py` "
        "(generierte Datei — nicht von Hand editieren)",
    ]
    lines.extend(extra_lines)
    return "\n".join(lines)


def sources_section(sources, title="Quellenverzeichnis"):
    conf_note = (
        "Konfidenzstufen: **A** mehrfach bestaetigt / institutionelle Primaerquelle · "
        "**B** einzelner Treffer, institutionelle Quelle · "
        "**C** Branchen-/Marktquelle oder Modellannahme mit schwacher Belegbasis · "
        "**M** Setzung/Modellannahme, nicht quellenbelegt."
    )
    rows = []
    for s in sources:
        title_txt = s.get("title", "").strip()
        url = (s.get("url") or "").strip()
        label = f"[{title_txt}]({url})" if url else title_txt
        rows.append(
            [
                s.get("nr", ""),
                label,
                s.get("publisher", ""),
                s.get("date", ""),
                s.get("confidence", ""),
            ]
        )
    body = [
        f"## {title}",
        "",
        conf_note,
        "",
        table(
            ["Nr.", "Titel", "Herausgeber", "Datum", "Konfidenz"],
            rows,
            ["r", "l", "l", "l", "c"],
        ),
    ]
    notes = [s for s in sources if s.get("note")]
    if notes:
        body += ["", "### Anmerkungen zu einzelnen Quellen", ""]
        for s in notes:
            body.append(f"- **Nr. {s.get('nr')} · {s.get('title', '')}** — {s['note']}")
    return "\n".join(body)


# ---------------------------------------------------------------- White Paper


def build_whitepaper(page_data, mc, params, stand):
    meta = mc["meta"]
    presets = mc["presets"]
    order = mc["preset_order"]
    model_version = meta.get("model_version", "?")

    parts = []
    parts.append(
        header_block(
            "Was braucht ein gesunder Strommix — und was kostet er?",
            "Interaktives White Paper: ein nachgerechnetes Kostenmodell fuer das "
            "deutsche Stromsystem 2045, mit Monte-Carlo-Unsicherheit, "
            "Emissionsbilanz und offengelegten Datenluecken.",
            "whitepaper-strommix.html",
            stand,
            model_version,
            extra_lines=[
                f"- **Simulation:** {de(meta.get('n_draws'))} gepaarte Ziehungen je "
                f"Konfiguration, Basis-Seed {meta.get('base_seed')}, "
                f"PRNG {meta.get('prng', '')}",
                "- **Maschinenlesbare Rohdaten:** "
                f"`{SITE}/strommix/data/model_params.json`, "
                f"`{SITE}/strommix/data/monte_carlo_reference.json`, "
                f"`{SITE}/strommix/data/page_data.json`",
            ],
        )
    )

    # --- Kernaussagen -----------------------------------------------------
    ist = page_data["ist_mix"]["2025"]
    kipp = page_data["co2_kipppunkt"]
    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## Kernaussagen",
                "",
                "1. **Der Vergleich ist nicht entschieden.** Die beiden vordersten "
                "Pfade — das kernkraftgestuetzte Kostenminimum und der gasgestuetzte "
                "80-%-EE-Pfad — liegen im deterministischen Punktwert "
                f"{de(presets['kostenminimum']['deterministic_lscoe_eur_mwh'], 1)} zu "
                f"{de(presets['ee80_gas']['deterministic_lscoe_eur_mwh'], 1)} EUR/MWh "
                "auseinander. Das ist weniger als die Breite der Unsicherheit.",
                "2. **Der Beinahe-Gleichstand vergleicht ungleiche Emissionen.** "
                f"{de(presets['kostenminimum']['emissions_mt_co2_a'], 0)} gegen "
                f"{de(presets['ee80_gas']['emissions_mt_co2_a'], 0)} Mt CO2 pro Jahr. "
                "Erst mit Abscheidung auf beiden Seiten wird der Vergleich "
                "emissionsaequivalent — und dreht die Richtung.",
                "3. **Ein einziger Modellparameter bewegt das Ergebnis ueber die "
                "ganze Breite.** Der mixunabhaengige Sockel im Uebertragungsnetz "
                f"(Setzung {de(meta['grid_transmission_socket_share']['value'], 2)}, "
                f"Sensitivitaet {de(meta['grid_transmission_socket_share']['min'], 2)}"
                f"–{de(meta['grid_transmission_socket_share']['max'], 2)}) verschiebt "
                "den Abstand zwischen beiden Pfaden von -2,3 bis +4,5 EUR/MWh.",
                "4. **Der CO2-Preis ist der Kipppunkt.** Deterministisch kippt der "
                f"Vergleich bei {de(kipp['deterministisch_eur_t'], 1)} EUR/t, ueber "
                f"gepaarte Ziehungen bei rund {de(kipp['gepaarte_ziehungen_median_eur_t'])} "
                f"EUR/t. Der ETS-1-Marktpreis lag bei {de(kipp['ets1_markt_eur_t'])} EUR/t "
                f"— also unterhalb der Kippmarke; gerechnet wird mit "
                f"{de(kipp['modellwert_eur_t'])} EUR/t.",
                "5. **Das Ist-System ist der teuerste Anker.** "
                f"{de(presets['ist2025']['deterministic_lscoe_eur_mwh'], 1)} EUR/MWh bei "
                f"{de(presets['ist2025']['emissions_mt_co2_a'], 0)} Mt CO2 — jedes "
                "Zielszenario ist billiger und sauberer als der Status quo.",
                "6. **Die Datenbasis der Simulation ist unvollstaendig.** Die "
                "Stundenprofile decken "
                f"{de(meta['profiles']['hours'])} Stunden ab "
                f"(`{meta['profiles']['data_completeness']}`, "
                f"{meta['profiles']['label']}). Netzbetrieb, Redispatch, Verluste, "
                "Import, Export und Lastmanagement sind nicht modelliert.",
            ]
        )
    )

    # --- Ist-Zustand ------------------------------------------------------
    traeger = ist.get("traeger_twh", {})
    rows = []
    for key, val in sorted(
        traeger.items(),
        key=lambda kv: -(
            kv[1].get("wert")
            if isinstance(kv[1], dict) and kv[1].get("wert") is not None
            else (kv[1].get("high", 0) if isinstance(kv[1], dict) else kv[1]) or 0
        ),
    ):
        conf, note = "", ""
        if isinstance(val, dict):
            conf = val.get("confidence", "")
            note = val.get("hinweis", "")
            if val.get("derived"):
                note = (note + " · abgeleitet").strip(" ·")
            if val.get("wert") is not None:
                shown = de(val["wert"], 1)
            elif val.get("low") is not None:
                shown = rng(val.get("low"), val.get("high"), 1)
            else:
                shown = "—"
        else:
            shown = de(val, 1)
        rows.append([key.replace("_", " "), shown, conf, note])
    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## 1 · Ist-Zustand 2025",
                "",
                f"Quelle der Jahreszahlen: {ist.get('quelle', '')} "
                f"(Konfidenz: {ist.get('confidence', '')}).",
                "",
                table(
                    ["Kennzahl", "Wert"],
                    [
                        [
                            "Bruttostromerzeugung inkl. Pumpspeicher",
                            f"{de(ist.get('bruttostromerzeugung_gesamt_inkl_pse'), 1)} TWh",
                        ],
                        [
                            "Bruttostromerzeugung ohne Pumpspeicher",
                            f"{de(ist.get('bruttostromerzeugung_ohne_pse'), 1)} TWh",
                        ],
                        ["Erneuerbare gesamt", f"{de(ist.get('erneuerbare_gesamt'), 1)} TWh"],
                        ["Fossil gesamt", f"{de(ist.get('fossil_gesamt'), 1)} TWh"],
                        ["Kernenergie", f"{de(ist.get('kernenergie'), 1)} TWh"],
                        ["Import", f"{de(ist.get('import_twh'), 1)} TWh"],
                        ["Export", f"{de(ist.get('export_twh'), 1)} TWh"],
                    ],
                    ["l", "r"],
                ),
                "",
                "### Bruttostromerzeugung nach Energietraegern (TWh)",
                "",
                table(
                    ["Energietraeger", "TWh", "Konfidenz", "Anmerkung"],
                    rows,
                    ["l", "r", "c", "l"],
                )
                if rows
                else "",
            ]
        )
    )

    # --- Methodik ---------------------------------------------------------
    method = [
        "---",
        "",
        "## 2 · Methodik in Kurzfassung",
        "",
        f"- **Modell:** `{meta.get('model_reference', '')}`, Version {model_version}.",
        f"- **Kennzahl:** System-LSCOE in EUR/MWh — Vollkosten des *Systems* "
        "(Erzeugung, Speicher, Backup, Netzanteil) je gelieferter MWh, nicht "
        "LCOE einzelner Kraftwerke.",
        f"- **Unsicherheit:** {de(meta.get('n_draws'))} Ziehungen je Konfiguration, "
        f"{meta.get('distribution', '')}.",
        f"- **Gepaarte Ziehungen:** {meta.get('paired_draws')} — je Konfiguration "
        "laeuft EIN Ziehungsstrom, jede Ziehung wird auf ALLE Szenarien angewandt "
        "(common random numbers). Deshalb sind Rangvergleiche zwischen Szenarien "
        "zulaessig, obwohl die Verteilungen breit ueberlappen.",
        f"- **Perzentile:** {meta.get('percentile_method', '')}.",
        f"- **CO2-Preis im Basisfall:** {de(meta.get('co2_price_eur_t'), 1)} EUR/t.",
        f"- **Lastprofile:** {meta['profiles']['label']}, "
        f"{de(meta['profiles']['hours'])} Stunden, Vollstaendigkeit "
        f"`{meta['profiles']['data_completeness']}`.",
        f"- **Reproduzierbarkeit:** Basis-Seed {meta.get('base_seed')}, "
        f"PRNG {meta.get('prng', '')} — die Ergebnisse sind aus den "
        "veroeffentlichten Rohdaten nachrechenbar.",
        "",
        "### Modellannahmen",
        "",
    ]
    for a in meta.get("assumptions", []):
        method.append(f"- {a}")
    method.append("")
    method.append("### Bewusste Modellentscheidungen")
    method.append("")
    for d in page_data.get("modelling_decisions", []):
        method.append(f"- {d}")
    parts.append("\n".join(method))

    # --- Szenarien --------------------------------------------------------
    rows = []
    for pid in order:
        p = presets[pid]
        base = p["configs"]["base"]
        rows.append(
            [
                p["label"],
                de(p["demand_twh"], 0),
                de(p["deterministic_lscoe_eur_mwh"], 1),
                f"{de(base['p50'], 1)} [{de(base['p5'], 1)}–{de(base['p95'], 1)}]",
                de(p["emissions_mt_co2_a"], 1),
                de(p.get("captured_mt_co2_a"), 1),
                "ja" if p.get("comparable_to_target_scenarios") else "nein",
            ]
        )
    scen = [
        "---",
        "",
        "## 3 · Szenarien im Vergleich",
        "",
        "System-LSCOE in EUR/MWh. Spalte *deterministisch* = Punktwert mit "
        "mittleren Parametern. Spalte *P50 [P5–P95]* = Median und 90-%-Band aus "
        f"{de(meta.get('n_draws'))} Ziehungen der Konfiguration `base` "
        "(WACC fest 5 %, CO2 fest 75 EUR/t, ohne Kostenueberschreitung).",
        "",
        table(
            [
                "Szenario",
                "Bedarf TWh",
                "determin.",
                "P50 [P5–P95]",
                "Mt CO2/a",
                "davon abgeschieden",
                "vergleichbar",
            ],
            rows,
            ["l", "r", "r", "r", "r", "r", "c"],
        ),
        "",
        f"*Hinweis:* `{presets['ist2025']['label']}` ist ein Anker, kein "
        "Zielszenario — es ist mit den Zukunftsszenarien nicht rangfaehig "
        "(anderer Bedarf, andere Kostenabgrenzung).",
        "",
        "### Kostenkomponenten der Zielszenarien (EUR/MWh, deterministisch)",
        "",
    ]
    comp_keys = sorted(
        {k for pid in order for k in presets[pid].get("deterministic_components_eur_mwh", {})}
    )
    rows = []
    for pid in order:
        p = presets[pid]
        comps = p.get("deterministic_components_eur_mwh", {})
        rows.append(
            [p["label"]] + [de(comps.get(k), 1) if k in comps else "—" for k in comp_keys]
        )
    scen.append(
        table(
            ["Szenario"] + [k.replace("_", " ") for k in comp_keys],
            rows,
            ["l"] + ["r"] * len(comp_keys),
        )
    )
    scen += [
        "",
        "### Systemkennzahlen der Szenarien",
        "",
        table(
            ["Szenario", "Gas-Backup TWh/a", "Gas-Spitzenlast GW", "Abregelung TWh/a", "ungedeckt TWh/a"],
            [
                [
                    presets[pid]["label"],
                    de(presets[pid].get("gas_backup_twh_a"), 1),
                    de(presets[pid].get("gas_peak_gw"), 1),
                    de(presets[pid].get("curtailed_twh_a"), 1),
                    de(presets[pid].get("unserved_twh_a"), 2),
                ]
                for pid in order
            ],
            ["l", "r", "r", "r", "r"],
        ),
    ]
    parts.append("\n".join(scen))

    # --- CO2-Kipppunkt ----------------------------------------------------
    levels = kipp.get("levels", [])
    lvl_rows = []
    for lv in levels:
        lvl_rows.append(
            [de(lv.get("co2_eur_t")), lv.get("label", "")]
            + [de(lv.get(pid), 1) for pid in order]
        )
    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## 4 · CO2-Preis als Kipppunkt",
                "",
                f"- Deterministischer Kipppunkt: **{de(kipp['deterministisch_eur_t'], 1)} EUR/t**",
                f"- Ueber gepaarte Ziehungen (Median-Delta = 0): "
                f"**{de(kipp['gepaarte_ziehungen_median_eur_t'])} EUR/t**",
                f"- ETS-1-Marktpreis: {de(kipp['ets1_markt_eur_t'])} EUR/t · "
                f"Modellwert: {de(kipp['modellwert_eur_t'])} EUR/t",
                f"- Konfidenz: {kipp.get('_confidence', '')}",
                "",
                f"{kipp.get('mit_ccs_note', '')}",
                "",
                f"*Methode:* {kipp.get('_method', '')}",
                "",
                "### System-LSCOE je CO2-Preisniveau (EUR/MWh)",
                "",
                table(
                    ["CO2 EUR/t", "Niveau"] + [presets[pid]["label"] for pid in order],
                    lvl_rows,
                    ["r", "l"] + ["r"] * len(order),
                ),
            ]
        )
    )

    # --- Rangwahrscheinlichkeiten -----------------------------------------
    rank = [
        "---",
        "",
        "## 5 · Rangwahrscheinlichkeiten",
        "",
        "Aus den gepaarten Ziehungen: in wie vielen der "
        f"{de(meta.get('n_draws'))} Zukuenfte ist Szenario A guenstiger als B. "
        "`entschieden` bedeutet, dass die Wahrscheinlichkeit die selbstgesetzte "
        "Schwelle von 95 % ueberschreitet — alles darunter ist ein offener Ausgang, "
        "kein Sieg.",
        "",
    ]
    for cfg in mc["configs"]:
        cid = cfg["id"]
        pairs = mc["rank_probabilities"].get(cid, [])
        if not pairs:
            continue
        rows = []
        for pr in pairs:
            a, b = pr["a"], pr["b"]
            rows.append(
                [
                    presets[a]["label"] if a in presets else a,
                    presets[b]["label"] if b in presets else b,
                    de(pr.get("p_a_cheaper", 0) * 100, 1) + " %",
                    de(pr.get("p_b_cheaper", 0) * 100, 1) + " %",
                    de(pr.get("median_diff_a_minus_b"), 1),
                    f"{de(pr.get('p5_diff'), 1)} … {de(pr.get('p95_diff'), 1)}",
                    "ja" if pr.get("decided") else "nein",
                ]
            )
        rank += [
            f"### Konfiguration `{cid}` — {cfg.get('label', '')}",
            "",
            table(
                [
                    "A",
                    "B",
                    "P(A guenstiger)",
                    "P(B guenstiger)",
                    "Median A−B",
                    "P5 … P95 (A−B)",
                    "entschieden",
                ],
                rows,
                ["l", "l", "r", "r", "r", "r", "c"],
            ),
            "",
        ]
    parts.append("\n".join(rank).rstrip())

    # --- Limitationen -----------------------------------------------------
    lim = ["---", "", "## 6 · Limitationen und Datenluecken", "", "### Modell-Limitationen", ""]
    for l in meta.get("limitations", []):
        lim.append(
            f"- **[{l.get('severity', '')}] {l.get('id', '')}** — {l.get('text', '')} "
            f"*(betrifft: {l.get('affects', '')})*"
        )
    lim += ["", "### Dokumentierte Datenluecken", ""]
    for g in page_data.get("gaps", []):
        status = f" · Status: {g['status']}" if g.get("status") else ""
        lim.append(
            f"- **{g.get('id', '')}** (`{g.get('parameter', '')}`){status} — "
            f"{g.get('reason', '')}"
        )
    lim += [
        "",
        "### Grenze der Quellenpruefung",
        "",
        f"{page_data['meta'].get('limitation', '')}",
    ]
    parts.append("\n".join(lim))

    # --- Quellen ----------------------------------------------------------
    parts.append("---\n\n" + sources_section(page_data.get("sources", []), "7 · Quellenverzeichnis"))

    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## Interaktive Fassung und weiterfuehrende Dateien",
                "",
                f"- Interaktives White Paper (Charts, Regler, Szenario-Vergleich): "
                f"{SITE}/whitepaper-strommix.html",
                f"- Visual Story zum selben Thema (erzaehlerisch): {SITE}/strommix-story.html",
                f"- Markdown-Fassung der Story: {SITE}/md/strommix-story.md",
                f"- Parametersatz des Modells: {SITE}/strommix/data/model_params.json",
                f"- Monte-Carlo-Referenz: {SITE}/strommix/data/monte_carlo_reference.json",
                f"- Redaktioneller Datensatz: {SITE}/strommix/data/page_data.json",
                f"- Maschinenlesbarer Index der Kitchen: {SITE}/llms.txt",
            ]
        )
    )

    return "\n\n".join(parts).rstrip() + "\n"


# ---------------------------------------------------------------- Story


def build_story(story_data, page_data, mc, stand):
    meta = story_data["meta"]
    head = story_data["monte_carlo_headline"]
    model_version = meta.get("model_version", head.get("model_version", "?"))

    parts = []
    parts.append(
        header_block(
            "Was kostet ein klimaneutrales Stromsystem?",
            "Visual Story: Eine Studie nennt 125 und 321 Euro je Megawattstunde. "
            "Woher kommen solche Zahlen — und wie belastbar sind sie? Eine "
            "nachgerechnete Spurensuche mit Bandbreiten statt Schlagzeilen.",
            "strommix-story.html",
            stand,
            model_version,
            extra_lines=[
                f"- **Story-Version:** {meta.get('story_version', '')}",
                f"- **Geprueft gegen:** {', '.join(meta.get('validated_against', []))}",
            ],
        )
    )

    counts = meta.get("counts", {})
    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## Worum es geht",
                "",
                "Die Story nimmt eine oeffentlich diskutierte Studie zum deutschen "
                "Strommix und rechnet sie nach — Schritt fuer Schritt, mit "
                "offengelegten Annahmen. Sie ist die erzaehlerische Fassung des "
                f"White Papers ({SITE}/whitepaper-strommix.html); die Zahlen stammen "
                "aus demselben Modell.",
                "",
                "### Ergebnis der Faktenpruefung",
                "",
                table(
                    ["Kategorie", "Anzahl Aussagen"],
                    [
                        ["bestaetigt", counts.get("bestaetigt", "—")],
                        ["korrigiert", counts.get("korrigiert", "—")],
                        ["verworfen", counts.get("verworfen", "—")],
                        ["Setzung (Modellannahme)", counts.get("setzung", "—")],
                        ["unverifizierbar", counts.get("unverifizierbar", "—")],
                    ],
                    ["l", "r"],
                ),
                "",
                "### Die Kernaussage in einem Absatz",
                "",
                f"> {head.get('honest_statement', '')}",
                "",
                f"**Vorbehalt (Konfidenz {head.get('confidence', '')}):** "
                f"{head.get('caveat', '')}",
            ]
        )
    )

    # --- Szenario-Tabelle der Story --------------------------------------
    rows = []
    for p in head.get("presets", []):
        lo, hi = (p.get("p5_p95_base") or [None, None])[:2]
        rows.append(
            [
                p.get("label", p.get("id", "")),
                de(p.get("deterministic"), 1),
                f"{de(p.get('p50_base'), 0)} [{de(lo, 0)}–{de(hi, 0)}]",
                de(p.get("emissions_mt_co2_a"), 1),
                de(p.get("gas_backup_twh_a"), 1),
                de(p.get("gas_peak_gw"), 1),
                "ja" if p.get("comparable") else "nein",
            ]
        )
    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## Die Szenarien, um die es geht",
                "",
                "System-LSCOE in EUR/MWh bei "
                f"{de(head.get('co2_price_eur_t'))} EUR/t CO2, Modell v{model_version}.",
                "",
                table(
                    [
                        "Szenario",
                        "determin.",
                        "P50 [P5–P95]",
                        "Mt CO2/a",
                        "Gas-Backup TWh/a",
                        "Gas-Spitze GW",
                        "rangfaehig",
                    ],
                    rows,
                    ["l", "r", "r", "r", "r", "r", "c"],
                ),
                "",
                f"*{head.get('ranking_note', '')}*",
            ]
        )
    )

    # --- Verworfene Behauptungen -----------------------------------------
    rejected = story_data.get("rejected_do_not_use", [])
    if rejected:
        lines = ["---", "", "## Verworfen: Behauptungen, die die Pruefung nicht ueberstanden haben", ""]
        for r in rejected:
            if isinstance(r, dict):
                claim = r.get("claim") or r.get("text") or ""
                why = r.get("reason") or r.get("why") or r.get("note") or ""
                lines.append(f"- **{claim}** — {why}".rstrip(" —"))
            else:
                lines.append(f"- {r}")
        parts.append("\n".join(lines))

    # --- Gegenpositionen --------------------------------------------------
    cps = story_data.get("must_show_counterpositions", [])
    if cps:
        lines = [
            "---",
            "",
            "## Gegenpositionen, die mitlaufen muessen",
            "",
            "Diese Punkte sprechen gegen die eigene Schlussrichtung und gehoeren "
            "deshalb zwingend dazu — eine Analyse, die nur ihre eigenen Argumente "
            "zeigt, ist Werbung.",
            "",
        ]
        for c in cps:
            lines.append(f"- **[{c.get('confidence', '')}]** {c.get('text', '')}")
        parts.append("\n".join(lines))

    # --- Themenbloecke ----------------------------------------------------
    block_titles = {
        "nuclear": "Kernkraft: Kosten, Bauzeiten, Referenzprojekte",
        "electrolyser": "Elektrolyse und Wasserstoff",
        "ets_gap_gas_ccs": "ETS, Gas und CCS",
        "ccs_narrative": "CCS — was modelliert ist und was nicht",
        "co2_sensitivity": "CO2-Preis-Sensitivitaet",
        "thirty_year_plan": "Der Dreissig-Jahres-Plan: Startwerte korrigiert",
        "klimapraemisse": "Die Klimapraemisse",
        "marktdesign": "Marktdesign — die unbepreiste Voraussetzung",
        "dunkelflaute_definition": "Dunkelflaute ist zuerst eine Definitionsfrage",
        "ueberschreitung": "Kostenueberschreitungen: was die Empirie sagt",
        "netzregel_anteil": "Netz- und Regelanteil",
        "ges_absender": "Die geprüfte Studie: Absender und Einordnung",
        "haushalt_anker": "Was das fuer einen Haushalt bedeutet",
        "klimaziel_2045": "Klimaziel 2045",
    }
    lines = ["---", "", "## Geprüfte Zahlenbloecke"]
    for key in [k for k in block_titles if k in story_data]:
        block = story_data[key]
        lines += ["", f"### {block_titles[key]}", ""]
        lines.append("```json")
        lines.append(json.dumps(block, ensure_ascii=False, indent=1, sort_keys=True))
        lines.append("```")
    lines += [
        "",
        "*Die Bloecke sind bewusst als JSON eingebettet: sie sind der "
        "unveraenderte, maschinenlesbare Datenstand der Story-Seite — jede Zahl "
        "mit Herkunft, Konfidenzstufe und Vorbehalt.*",
    ]
    parts.append("\n".join(lines))

    parts.append("---\n\n" + sources_section(story_data.get("sources", [])))

    parts.append(
        "\n".join(
            [
                "---",
                "",
                "## Interaktive Fassung und weiterfuehrende Dateien",
                "",
                f"- Visual Story (scrollgetriebene Charts): {SITE}/strommix-story.html",
                f"- Vollstaendige Analyse als interaktives White Paper: "
                f"{SITE}/whitepaper-strommix.html",
                f"- Markdown-Fassung des White Papers: {SITE}/md/whitepaper-strommix.md",
                f"- Datenstand der Story: {SITE}/strommix/data/story_data.json",
                f"- Maschinenlesbarer Index der Kitchen: {SITE}/llms.txt",
            ]
        )
    )

    return "\n\n".join(parts).rstrip() + "\n"


# ---------------------------------------------------------------- main


def render_all():
    data = {name: json.loads((DATA / name).read_text(encoding="utf-8")) for name in INPUTS}
    stand = git_data_date()
    return {
        "whitepaper-strommix.md": build_whitepaper(
            data["page_data.json"],
            data["monte_carlo_reference.json"],
            data["model_params.json"],
            stand,
        ),
        "strommix-story.md": build_story(
            data["story_data.json"],
            data["page_data.json"],
            data["monte_carlo_reference.json"],
            stand,
        ),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--check",
        action="store_true",
        help="Nur pruefen: rendert zweimal und vergleicht mit den Dateien auf der Platte.",
    )
    args = ap.parse_args()

    rendered = render_all()

    if args.check:
        again = render_all()
        ok = True
        for name, text in rendered.items():
            if again[name] != text:
                print(f"NICHT DETERMINISTISCH: {name}")
                ok = False
            path = OUT / name
            if not path.exists():
                print(f"FEHLT: {path}")
                ok = False
            elif path.read_text(encoding="utf-8") != text:
                print(f"VERALTET: {path} — bitte build_md_exports.py ohne --check laufen lassen")
                ok = False
        if ok:
            for name, text in rendered.items():
                digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]
                print(f"ok  md/{name}  sha256:{digest}  {len(text):,} Bytes")
        return 0 if ok else 1

    OUT.mkdir(exist_ok=True)
    for name, text in rendered.items():
        (OUT / name).write_text(text, encoding="utf-8")
        digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]
        print(f"geschrieben  md/{name}  sha256:{digest}  {len(text):,} Bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
