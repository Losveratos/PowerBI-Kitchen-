#!/usr/bin/env python3
"""Baut den Datensatz fuer die Scrollytelling-Story (data/story_data.json).

Regel aus README.md: "Keine Zahl landet im HTML, die nicht aus data/ kommt und
dort per Skript aus dokumentierten Quellen erzeugt wurde."

Fuer die Story gilt zusaetzlich die Freigabe-Regel aus
`research/story_claims_check.md`: Erzaehlt werden darf ausschliesslich, was im
dortigen ```json-Block (`meta.block == "story_data"`) freigegeben ist. Dieses
Skript

  1. liest genau diesen Block (gleiche Fence-Konvention wie
     `build_page_data.py` / `consolidate_params.py`),
  2. reichert ihn um bereits validierte, geteilte Zahlen aus
     `data/page_data.json` und `data/monte_carlo_reference.json` an
     (GES-Referenzwerte, LCOE-Vergleichsbaender Dritter, die 13
     Kernkraft-Referenzprojekte, WACC-/CRF-Sensitivitaet,
     Kostenueberschreitungs-Empirie, Profil-Metadaten, alle vier
     Monte-Carlo-Konfigurationen),
  3. loest alle referenzierten Quellen-Ids gegen die strukturierten
     `sources`-Listen der Dossiers und `page_data.json` auf und nummeriert sie
     fuer die Quellen-Chips der Story durch,
  4. prueft, dass jede referenzierte Quellen-Id aufloesbar ist und dass keine
     der verworfenen Zahlen in einem Erzaehlfeld auftaucht,
  5. schreibt `data/story_data.json`.

Der Lauf ist deterministisch: keine Zeitstempel, keine Zufallszahlen; das
Erstellungsdatum stammt aus dem Dossier selbst.

Aufruf:
    python3 strommix/scripts/build_story_data.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from typing import Any

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(BASE, "research")
DATA = os.path.join(BASE, "data")

CLAIMS_MD = os.path.join(RESEARCH, "story_claims_check.md")
PAGE_DATA = os.path.join(DATA, "page_data.json")
MC_REF = os.path.join(DATA, "monte_carlo_reference.json")
OUT_PATH = os.path.join(DATA, "story_data.json")
PARAMS = os.path.join(DATA, "model_params.json")

# Dossiers, aus denen Quellen-Metadaten nachgeschlagen werden.
SOURCE_DOSSIERS = [
    "kosten_kernkraft.md",
    "kosten_ee_speicher.md",
    "ist_zustand_de.md",
    "risiken_co2.md",
]

JSON_FENCE = re.compile(r"```json\n(.*?)\n```", re.S)


# --------------------------------------------------------------------------
# Einlesen
# --------------------------------------------------------------------------
def blocks(path: str) -> list[Any]:
    with open(path, encoding="utf-8") as fh:
        return [json.loads(raw) for raw in JSON_FENCE.findall(fh.read())]


def load_story_block() -> dict:
    found = [b for b in blocks(CLAIMS_MD)
             if isinstance(b, dict) and b.get("meta", {}).get("block") == "story_data"]
    if len(found) != 1:
        raise RuntimeError(
            f"Erwartet genau einen story_data-Block in {CLAIMS_MD}, gefunden: {len(found)}")
    return found[0]


def load_json(path: str) -> dict:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def collect_source_pool() -> dict[str, dict]:
    """Alle bekannten Quellen-Eintraege nach Id, inkl. Herkunftsvermerk."""
    pool: dict[str, dict] = {}

    page = load_json(PAGE_DATA)
    for s in page.get("sources", []):
        entry = dict(s)
        entry.pop("nr", None)
        entry.setdefault("dossier", "data/page_data.json")
        pool[s["id"]] = entry

    for fname in SOURCE_DOSSIERS:
        path = os.path.join(RESEARCH, fname)
        if not os.path.exists(path):
            continue
        for block in blocks(path):
            if not isinstance(block, dict):
                continue
            for s in block.get("sources", []) or []:
                if not isinstance(s, dict) or "id" not in s:
                    continue
                if s["id"] in pool:
                    # page_data-Eintraege haben Vorrang (dort schon redaktionell geprueft)
                    continue
                entry = dict(s)
                entry.pop("nr", None)
                entry.setdefault("dossier", f"research/{fname}")
                pool[s["id"]] = entry

    return pool


# --------------------------------------------------------------------------
# Hilfen
# --------------------------------------------------------------------------
def walk_strings(node: Any, path: str = ""):
    """Alle (Pfad, String)-Paare eines JSON-Baums."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield from walk_strings(v, f"{path}.{k}" if path else str(k))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk_strings(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node


# --------------------------------------------------------------------------
# Orthografie
# --------------------------------------------------------------------------
# Die Dossiers wurden in ASCII-Transliteration geschrieben ("ungewoehnlich").
# Die Story zeigt diese Texte woertlich an, deshalb werden sie hier zurueck in
# die normale deutsche Schreibweise gebracht. Bewusst als **Wortliste** und
# nicht als Regel "ae/oe/ue -> Umlaut": eine solche Regel wuerde korrekte Woerter
# wie "neue", "gesteuerte" oder "Quellenangabe" zerstoeren. Nur ganze Woerter
# werden ersetzt; Ids, URLs und Pfade bleiben unangetastet.
UMLAUT_WORDS = {
    "Abhaengigkeit": "Abhängigkeit", "Aufwaertsrisiken": "Aufwärtsrisiken",
    "Behoerdenaufbau": "Behördenaufbau", "Bloecke": "Blöcke", "Bloecken": "Blöcken",
    "Designaenderungen": "Designänderungen", "Eigentuemerkosten": "Eigentümerkosten",
    "Erstschaetzung": "Erstschätzung", "Fuer": "Für",
    "Genehmigungsverzuege": "Genehmigungsverzüge", "Gesamtkapazitaet": "Gesamtkapazität",
    "Ingenieursloehne": "Ingenieurslöhne", "Kostenueberschreitung": "Kostenüberschreitung",
    "Kostenueberschreitungen": "Kostenüberschreitungen", "Laendern": "Ländern",
    "Standardloesung": "Standardlösung", "Ueberkapazitaet": "Überkapazität",
    "Unsicherheitsbaender": "Unsicherheitsbänder", "Verzoegerungen": "Verzögerungen",
    "Uebertragung": "Übertragung", "Uebertragungsnetz": "Übertragungsnetz",
    "Hoechstwerte": "Höchstwerte", "Kapazitaeten": "Kapazitäten",
    "Stuendliche": "Stündliche", "Waehrend": "Während", "waehrend": "während",
    "Zubaufaktoren": "Zubaufaktoren",
    "bestaetigt": "bestätigt", "dafuer": "dafür", "eingeschraenkte": "eingeschränkte",
    "enthaelt": "enthält", "europaeischen": "europäischen", "europaeische": "europäische",
    "fruehe": "frühe", "fuenf": "fünf", "fuer": "für", "gasgestuetzten": "gasgestützten",
    "geaendert": "geändert", "gegenueber": "gegenüber", "geprueft": "geprüft",
    "guenstig": "günstig", "guenstige": "günstige", "guenstiger": "günstiger",
    "guenstigste": "günstigste", "unguenstigste": "ungünstigste",
    "moeglich": "möglich", "prueft": "prüft", "rueckverstromten": "rückverstromten",
    "spaeter": "später", "ueber": "über", "ueberlappen": "überlappen",
    "ungewoehnlich": "ungewöhnlich", "unterschaetze": "unterschätze",
    "unveroeffentlicht": "unveröffentlicht", "waere": "wäre",
    "westeuropaeisches": "westeuropäisches", "willkuerliche": "willkürliche",
    "Erweiterung": "Erweiterung", "Szenarioanalyse": "Szenarioanalyse",
    "Verguetung": "Vergütung", "Zuschlaege": "Zuschläge", "Ausschreibungsergebnisse":
    "Ausschreibungsergebnisse", "Erdgaspreis": "Erdgaspreis",
    "Volllaststunden": "Volllaststunden", "Rueckbau": "Rückbau",
    "Endlagerung": "Endlagerung", "Verfuegbarkeit": "Verfügbarkeit",
    "kuenstlichen": "künstlichen", "muessen": "müssen", "koennen": "können",
    "haetten": "hätten", "naechsten": "nächsten", "zusaetzlich": "zusätzlich",
    "Zusaetzlich": "Zusätzlich", "taeglich": "täglich", "Erhoehung": "Erhöhung",
    "Auszuege": "Auszüge", "Boeckler": "Böckler", "Koeln": "Köln", "Maerz": "März",
    "Muenchen": "München", "Notloesung": "Notlösung", "Primaerquellen": "Primärquellen",
    "Primaerquelle": "Primärquelle", "Universitaet": "Universität",
    "Elektrolysekapazitaeten": "Elektrolysekapazitäten", "Europaeische": "Europäische",
    "Kapazitaets": "Kapazitäts", "ausdruecklichem": "ausdrücklichem",
    "ausdruecklich": "ausdrücklich", "faelschlich": "fälschlich",
    "gegengeprueft": "gegengeprüft", "gruener": "grüner", "woertlichen": "wörtlichen",
    "veroeffentlicht": "veröffentlicht", "verzoegert": "verzögert",
    "zukuenftigen": "zukünftigen", "Zuarbeit": "Zuarbeit",
}
UMLAUT_RX = re.compile(r"\b(" + "|".join(sorted(UMLAUT_WORDS, key=len, reverse=True)) + r")\b")
NO_TOUCH_KEYS = {"id", "source_id", "url", "path", "block", "generated_by", "story_file",
                 "prng", "crf_formula", "formula", "method", "engine"}


def fix_umlauts(node: Any, key: str | None = None) -> Any:
    if isinstance(node, dict):
        return {k: fix_umlauts(v, k) for k, v in node.items()}
    if isinstance(node, list):
        return [fix_umlauts(v, key) for v in node]
    if isinstance(node, str):
        if key in NO_TOUCH_KEYS or node.startswith("http") or "/" in node and " " not in node:
            return node
        return UMLAUT_RX.sub(lambda m: UMLAUT_WORDS[m.group(1)], node)
    return node


# Quellen-Ids sind kleingeschrieben, ohne Leerzeichen. Die Dossiers nutzen das
# Feld `source` an manchen Stellen auch fuer eine Klartext-Angabe ("GES-Studie,
# Tab. 4") - solche Werte sind keine Ids und werden hier ausgefiltert.
SOURCE_ID_RX = re.compile(r"^[a-z0-9][a-z0-9._-]*$")


def collect_source_ids(node: Any) -> set[str]:
    ids: set[str] = set()
    if isinstance(node, dict):
        for k, v in node.items():
            if k in ("source_id", "source") and isinstance(v, str):
                if SOURCE_ID_RX.match(v):
                    ids.add(v)
            elif k == "source_ids" and isinstance(v, list):
                ids.update(x for x in v if isinstance(x, str) and SOURCE_ID_RX.match(x))
            else:
                ids |= collect_source_ids(v)
    elif isinstance(node, list):
        for v in node:
            ids |= collect_source_ids(v)
    return ids


# --------------------------------------------------------------------------
# Anreicherung aus den geteilten, bereits validierten Datensaetzen
# --------------------------------------------------------------------------
def build_shared(page: dict, mc: dict, params: dict) -> dict:
    ges_ref = page["ges"]["reference"]
    imk = page["netzkosten"]["gesamtnetz_imk_boeckler_2024"]
    nep = page["netzkosten"]["uebertragungsnetz_nep_2037_2045_v2025"]
    gasp = params["technologies"]["gas_ccgt"]["params"]["fuel_eur_mwh_th"]
    gas_eff = params["technologies"]["gas_ccgt"]["params"]["efficiency"]
    ccsp = params["technologies"]["gas_ccs"]["params"]

    # Szenarien der Studie als Dictionary, damit die Story sie per Pfad
    # ansprechen kann (statt per Listenindex).
    scen_ids = {
        "Kostenminimum (inkl. Kernkraft)": "kostenminimum",
        "80% EE + Gas-Peaker": "ee80_gas",
        "80% EE + mehr H2": "ee80_h2",
        "100% Erneuerbare": "ee100",
    }
    scenarios: dict[str, dict] = {}
    for s in ges_ref["scenarios"]:
        sid = scen_ids.get(s["name"])
        if sid is None:
            raise RuntimeError(f"Unbekanntes GES-Szenario: {s['name']}")
        scenarios[sid] = dict(s)

    # Monte-Carlo: alle vier Konfigurationen je Preset, ohne Ziehungsplan
    mc_presets: dict[str, dict] = {}
    for pid in mc["preset_order"]:
        p = mc["presets"][pid]
        mc_presets[pid] = {
            "label": p["label"],
            "demand_twh": p["demand_twh"],
            "deterministic": round(p["deterministic_lscoe_eur_mwh"], 1),
            "gas_peak_gw": round(p["gas_peak_gw"], 1),
            # Modell v0.2: Mengen- und Emissionsausweis je Szenario
            "gas_backup_twh_a": round(p["gas_backup_twh_a"], 1),
            "curtailed_twh_a": round(p["curtailed_twh_a"], 1),
            "unserved_twh_a": round(p["unserved_twh_a"], 2),
            "emissions_mt_co2_a": round(p["emissions_mt_co2_a"], 1),
            "captured_mt_co2_a": round(p["captured_mt_co2_a"], 1),
            "gas_tech": p["gas_tech"],
            "grid_cost_basis": p["grid_cost_basis"],
            "comparable_to_target_scenarios": p["comparable_to_target_scenarios"],
            "components_eur_mwh": {k: round(v, 1) for k, v in
                                   p["deterministic_components_eur_mwh"].items()},
            "configs": {
                cid: {k: round(v, 1) for k, v in cfg.items()
                      if k in ("p5", "p25", "p50", "p75", "p95", "mean", "min", "max")}
                for cid, cfg in p["configs"].items()
            },
        }

    return {
        "_note": "Bereits validierte, mit dem White Paper geteilte Zahlen. "
                 "Quelle jeweils data/page_data.json bzw. data/monte_carlo_reference.json.",
        "ges_reference": {
            "methodology": ges_ref["methodology"],
            "scenarios": scenarios,
            "scenario_order": ["kostenminimum", "ee80_gas", "ee80_h2", "ee100"],
            "technologies": ges_ref["technologies"],
            "source_id": "ges-studie-2026",
            "confidence": "A",
        },
        # Die Originalschluessel sind Dezimalzahlen ("0.05") und damit fuer den
        # punktbasierten Pfad-Resolver der Story nicht adressierbar - hier
        # zusaetzlich als Ganzzahl-Prozent.
        "crf_by_wacc_pct": {
            str(int(round(float(k) * 100))): v
            for k, v in page["wacc_sensitivity"]["wacc_effect_at_60y"].items()
            if k.replace(".", "", 1).isdigit()
        },
        # Dasselbe fuer das durchgerechnete Kernkraft-Beispiel. Wichtig fuer die
        # Story: der Faktor 2,78 zwischen 3 % und 10 % WACC gilt fuer den
        # KAPITALKOSTENANTEIL, nicht fuer die LCOE. Die LCOE bewegen sich im
        # selben Intervall nur um Faktor ~2,0 - beides muss abrufbar sein,
        # damit im HTML nicht die groessere Zahl auf die kleinere Aussage
        # gelegt wird.
        "nuclear_lcoe_by_wacc_pct": {
            str(int(round(float(k) * 100))): v
            for k, v in page["wacc_sensitivity"]["worked_example"]["lcoe_eur_mwh"].items()
        },
        "nuclear_lcoe_example_assumptions": page["wacc_sensitivity"]["worked_example"]["assumptions"],
        # Genauigkeit, mit der die Studien-LCOE aus den Studienannahmen
        # reproduziert werden (scripts/validate_model.py).
        "ges_lcoe_reproduction_max_deviation_pct":
            page["ges"]["lcoe_reproduction_max_deviation_pct"],
        "lcoe_benchmarks": page["lcoe_benchmarks"],
        "nuclear_reference_projects": page["nuclear_reference_projects"],
        "nuclear_capex_scenarios": page["nuclear_capex_scenarios"],
        "wacc_sensitivity": page["wacc_sensitivity"],
        "construction_time": page["construction_time"],
        "kostenueberschreitung_faktoren": page["kostenueberschreitung_faktoren"],
        "netzkosten_referenzen": {
            "imk_gesamt_bis_2045_mrd_eur": imk["gesamt_bis_2045"],
            "imk_uebertragung_bis_2045_mrd_eur": imk["uebertragungsnetz_bis_2045"],
            "imk_verteilnetz_bis_2045_mrd_eur": imk["verteilnetz_bis_2045"],
            "nep_uebertragung_bis_2045_mrd_eur": nep["gesamt_bis_2045"],
            "source_ids": ["imk-netzkosten", "nep-2037-2045"],
            "confidence": "A",
        },
        "installierte_leistung_juli_2026_gw": page["installierte_leistung_gw"]["stand_juli_2026"],
        "batteriespeicher_ist": page["installierte_leistung_gw"]["batteriespeicher"],
        "profiles_meta": page["profiles_meta"],
        "monte_carlo": {
            "meta": {
                "n_draws": mc["meta"]["n_draws"],
                "base_seed": mc["meta"]["base_seed"],
                "prng": mc["meta"]["prng"],
                "distribution": mc["meta"]["distribution"],
                "co2_price_eur_t": mc["meta"]["co2_price_eur_t"],
                "profiles": mc["meta"]["profiles"],
                "overrun_source": mc["meta"]["overrun_source"],
                "assumptions": mc["meta"]["assumptions"],
                "drawn_parameters": len(mc["draw_plan"]),
            },
            "configs": {c["id"]: c["label"] for c in mc["configs"]},
            "preset_order": mc["preset_order"],
            "presets": mc_presets,
            # Modell v0.2 (M4): gepaarte Ziehungen -> P(A guenstiger als B).
            # Das ersetzt das Ueberlappungsargument der Randverteilungen.
            "paired_draws": mc["meta"]["paired_draws"],
            "paired_draws_note": mc["meta"]["paired_draws_note"],
            "rank_probabilities": {
                cid: [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in row.items()}
                      for row in rows]
                for cid, rows in mc["rank_probabilities"].items()
            },
            "limitations": mc["meta"]["limitations"],
            # v0.2b: CCS-Varianten und Kontrastverteilung Asien/Golf
            "ccs": mc["meta"]["ccs"],
            "nuclear_capex_contrast": mc["meta"]["nuclear_capex_contrast"],
        },
        # v0.2b: Parameter der CO2-Abscheidung, damit die Seite sie belegen kann.
        "ccs_parameter": {
            "capex_eur_kw": {k: ccsp["capex_eur_kw"][k] for k in ("min", "mid", "max")},
            "efficiency": {k: ccsp["efficiency"][k] for k in ("min", "mid", "max")},
            "capture_rate": {k: ccsp["capture_rate"][k] for k in ("min", "mid", "max")},
            "ccs_cost_eur_t": {k: ccsp["ccs_cost_eur_t"][k] for k in ("min", "mid", "max")},
            "residual_emission_t_mwh": {k: ccsp["emission_factor_t_mwh"][k] for k in ("min", "mid", "max")},
            "sources": {
                "capex": ccsp["capex_eur_kw"]["source"],
                "capture_rate": ccsp["capture_rate"]["source"],
                "cost": ccsp["ccs_cost_eur_t"]["source"],
                "residual": ccsp["emission_factor_t_mwh"]["source"],
            },
            "confidence": {
                "capex": ccsp["capex_eur_kw"]["confidence"],
                "capture_rate": ccsp["capture_rate"]["confidence"],
                "cost": ccsp["ccs_cost_eur_t"]["confidence"],
                "residual": ccsp["emission_factor_t_mwh"]["confidence"],
            },
            "storage_availability_de": params["technologies"]["gas_ccs"]["ccs_chain"]["storage_availability_de"],
        },
        # v0.2 (M2): Der Erdgaspreis ist jetzt ein belegter Parameter, kein Nullwert.
        "gaspreis_erdgas": {
            "unit": "EUR/MWh_th",
            "min": gasp["min"], "mid": gasp["mid"], "max": gasp["max"],
            "source": gasp["source"],
            "confidence": gasp["confidence"],
            "note": gasp["note"],
            "efficiency_ccgt": {
                "min": gas_eff["min"], "mid": gas_eff["mid"], "max": gas_eff["max"],
            },
            "implied_eur_mwh_el_mid": round(gasp["mid"] / gas_eff["mid"], 1),
        },
        "model_version": params["meta"].get("model_version"),
    }


# --------------------------------------------------------------------------
# Selbstpruefungen
# --------------------------------------------------------------------------
def check_rejected_not_narrated(out: dict) -> list[str]:
    """Die verworfenen Zahlen duerfen nur in den dafuer vorgesehenen
    Kontrast-/Begruendungsfeldern stehen, nicht in Erzaehltexten."""
    allowed_prefixes = (
        "rejected_do_not_use",
        "nuclear.md_values_for_contrast_only",
        "electrolyser.md_claim",
        "electrolyser.md_claim_verdict",
        "thirty_year_plan.lscoe_2056.md_value",
        "thirty_year_plan.lscoe_2056.md_reconstruction",
        "thirty_year_plan.learning_curves.electrolyser_eur_kw",
        "thirty_year_plan.nuclear_variant.md",
        "meta",
    )
    problems: list[str] = []
    # "kehrt sich faktisch um" darf nur in der Verwerfungsbegruendung stehen
    for path, text in walk_strings(out):
        if path.startswith(allowed_prefixes):
            continue
        low = text.lower()
        if "kehrt sich" in low and "um" in low:
            problems.append(f"verworfene Formulierung 'kehrt sich um' in {path}")
    return problems


def check_sources(out: dict, pool: dict[str, dict]) -> tuple[list[dict], list[str]]:
    wanted: set[str] = set()
    wanted |= collect_source_ids(out)
    wanted |= {s["id"] for s in out.get("sources", [])}
    wanted |= set(out.get("internal_source_ids_reused", []))

    # Quellen, die nur im Fliesstext der Story zitiert werden (Chips im HTML).
    wanted |= {
        "ges-studie-2026", "fraunhofer-ise-2024", "bnetza-pv-2026-03",
        "bnetza-wind-2026-05", "lazard-2026", "irena-2024", "iea-nea-2020",
        "ritchie-construction-time", "flyvbjerg-2023", "sovacool-ryu-2025",
        "imk-netzkosten", "nep-2037-2045", "smard-mirror-2024",
        "windguard-2025", "kenfo",
    }

    missing: list[str] = []
    merged: dict[str, dict] = {}

    # 1. Quellen, die das Dossier selbst mitbringt (haben Vorrang).
    for s in out.get("sources", []):
        merged[s["id"]] = dict(s, dossier="research/story_claims_check.md")

    # 2. Alles Uebrige aus dem Pool nachschlagen.
    for sid in sorted(wanted):
        if sid in merged:
            continue
        if sid in pool:
            merged[sid] = dict(pool[sid])
            merged[sid]["id"] = sid
        else:
            missing.append(sid)

    ordered = sorted(merged.values(), key=lambda s: s["id"])
    for i, s in enumerate(ordered, start=1):
        s["nr"] = i
    return ordered, missing


# --------------------------------------------------------------------------
def main() -> int:
    story = load_story_block()
    page = load_json(PAGE_DATA)
    mc = load_json(MC_REF)
    pool = collect_source_pool()

    out: dict[str, Any] = {}
    out["meta"] = dict(story["meta"])
    out["meta"]["generated_by"] = "strommix/scripts/build_story_data.py"
    out["meta"]["inputs"] = [
        "research/story_claims_check.md (Block story_data)",
        "data/page_data.json",
        "data/monte_carlo_reference.json",
        "research/kosten_kernkraft.md (sources)",
        "research/kosten_ee_speicher.md (sources)",
    ]
    out["meta"]["story_version"] = "v0.1 (Entwurf)"
    out["meta"]["story_file"] = "strommix-story.html"
    out["meta"]["deep_dive"] = {
        "file": "whitepaper-strommix.html",
        "label": "Zur vollständigen Analyse",
        "anchors": {
            "einleitung": "kap-1", "ist_zustand": "kap-2", "methodik": "kap-3",
            "lcoe": "kap-4", "mix": "kap-5", "monte_carlo": "kap-6",
            "risiken": "kap-7", "fazit": "kap-8", "limitationen": "kap-9",
        },
    }

    for key in ("rejected_do_not_use", "nuclear", "nuclear_history_timeseries",
                "reverse_engineered_ges_capacities", "monte_carlo_headline",
                "electrolyser", "ets_gap_gas_ccs", "thirty_year_plan",
                "assumption_audit_corrected", "must_show_counterpositions"):
        out[key] = story[key]

    out["shared"] = build_shared(page, mc, load_json(PARAMS))
    out["internal_source_ids_reused"] = story["internal_source_ids_reused"]

    # Quellen aufloesen und durchnummerieren
    out["sources"] = story["sources"]
    sources, missing = check_sources(out, pool)
    out["sources"] = sources

    problems = check_rejected_not_narrated(out)
    out = fix_umlauts(out)

    print(f"story_data: {len(out['sources'])} Quellen, "
          f"{len(out['nuclear_history_timeseries']['points'])} historische Datenpunkte, "
          f"{len(out['must_show_counterpositions'])} Pflicht-Gegenpositionen, "
          f"{len(out['shared']['nuclear_reference_projects'])} Referenzprojekte, "
          f"{len(out['shared']['monte_carlo']['preset_order'])} Monte-Carlo-Presets")

    if missing:
        print("FEHLER: nicht aufloesbare Quellen-Ids: " + ", ".join(missing), file=sys.stderr)
        return 1
    if problems:
        for p in problems:
            print("FEHLER: " + p, file=sys.stderr)
        return 1

    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
        fh.write("\n")
    size = os.path.getsize(OUT_PATH)
    print(f"geschrieben: data/story_data.json ({size/1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
