#!/usr/bin/env python3
"""Konsolidiert die Recherche-Dossiers zu einem einheitlichen Parametersatz.

Liest die ```json-Bloecke aus research/*.md und docs/01_grundlage_ges_faktencheck.md
per Regex, mappt sie auf ein gemeinsames Schema und schreibt data/model_params.json.

Schema je Parameter:
    {"value": .., "min": .., "mid": .., "max": .., "unit": ..,
     "source": "<Dossier> <Abschnitt/JSON-Pfad>", "confidence": "A"|"B"|"C"|null}

Grundregeln (aus dem Auftrag und den Dossier-Warnungen):
  * Nichts erfinden. Fehlt ein Wert wirklich -> value=null + Eintrag in "gaps".
  * Kernkraft-Opex ABSOLUT in EUR/kW/a (nicht als CAPEX-Prozentsatz).
  * Brennstoff und Entsorgung separat.
  * WACC global, IDC-Aufschlag ueber die Bauzeit.
  * Backup/Speicher sind KEINE pauschalen Risiko-Aufschlaege (Doppelzaehlung).
  * min/mid/max nicht mechanisch kombinieren -> konsistente Szenariensaetze.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

# --------------------------------------------------------------------------
# Pfade und Quellkuerzel
# --------------------------------------------------------------------------
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(BASE, "research")
DOCS = os.path.join(BASE, "docs")
DATA = os.path.join(BASE, "data")

SRC_FILES = {
    "ee": os.path.join(RESEARCH, "kosten_ee_speicher.md"),
    "kk": os.path.join(RESEARCH, "kosten_kernkraft.md"),
    "ist": os.path.join(RESEARCH, "ist_zustand_de.md"),
    "risk": os.path.join(RESEARCH, "risiken_co2.md"),
    "ges": os.path.join(DOCS, "01_grundlage_ges_faktencheck.md"),
    "profiles": os.path.join(DATA, "profiles_2024.json"),
}
SRC_LABEL = {
    "ee": "kosten_ee_speicher.md",
    "kk": "kosten_kernkraft.md",
    "ist": "ist_zustand_de.md",
    "risk": "risiken_co2.md",
    "ges": "docs/01_grundlage_ges_faktencheck.md",
    "profiles": "data/profiles_2024.json",
}

OUT_PATH = os.path.join(DATA, "model_params.json")

JSON_FENCE = re.compile(r"```json\n(.*?)\n```", re.S)

GAPS: list[dict[str, Any]] = []


# --------------------------------------------------------------------------
# Einlesen
# --------------------------------------------------------------------------
def read_json_blocks(path: str) -> list[dict]:
    """Alle ```json-Fences einer Markdown-Datei als geparste Objekte."""
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    out = []
    for raw in JSON_FENCE.findall(text):
        out.append(json.loads(raw))
    return out


def get(obj: Any, path: str, default: Any = None) -> Any:
    """Punkt-Pfad-Zugriff, gibt default zurueck wenn irgendein Glied fehlt."""
    cur = obj
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return default
    return cur


CONF_MAP = {"high": "A", "medium": "B", "low": "C"}


def norm_conf(value: Any) -> Any:
    if value in ("A", "B", "C"):
        return value
    return CONF_MAP.get(value)


# --------------------------------------------------------------------------
# Parameter-Konstruktion
# --------------------------------------------------------------------------
def param(
    value: Any,
    unit: str,
    source: str,
    confidence: Any = None,
    mn: Any = None,
    mid: Any = None,
    mx: Any = None,
    note: str | None = None,
    status: str | None = None,
    gap_id: str | None = None,
) -> dict:
    """Einheitlicher Parameter-Datensatz; registriert Luecken automatisch."""
    entry = {
        "value": value,
        "min": mn,
        "mid": mid if mid is not None else (value if mn is not None or mx is not None else None),
        "max": mx,
        "unit": unit,
        "source": source,
        "confidence": norm_conf(confidence),
    }
    if note:
        entry["note"] = note
    if status:
        entry["status"] = status
    if value is None and gap_id:
        GAPS.append({"id": gap_id, "parameter": source, "reason": note or "Wert im Dossier nicht belegt"})
    return entry


def from_range(
    rng: Any,
    unit: str,
    source: str,
    confidence: Any = None,
    note: str | None = None,
    status: str | None = None,
    gap_id: str | None = None,
    key_min: str = "min",
    key_mid: str = "mid",
    key_max: str = "max",
) -> dict:
    """Baut einen Parameter aus einem {min,mid,max,confidence}-Dossier-Objekt."""
    if not isinstance(rng, dict):
        return param(None, unit, source, confidence, note=note, status=status, gap_id=gap_id or source)
    mn, mid, mx = rng.get(key_min), rng.get(key_mid), rng.get(key_max)
    if mid is None and mn is not None and mx is not None:
        mid = round((mn + mx) / 2, 4)
    conf = confidence if confidence is not None else rng.get("confidence", rng.get("stufe"))
    entry = param(mid, unit, source, conf, mn=mn, mid=mid, mx=mx, note=note or rng.get("note"), status=status)
    if mid is None and gap_id:
        GAPS.append({"id": gap_id, "parameter": source, "reason": note or "Wert im Dossier nicht belegt"})
    return entry


# --------------------------------------------------------------------------
# Aufbau des Parametersatzes
# --------------------------------------------------------------------------
def build() -> dict:
    ee = read_json_blocks(SRC_FILES["ee"])[0]
    kk = read_json_blocks(SRC_FILES["kk"])[0]
    ist = read_json_blocks(SRC_FILES["ist"])[0]
    risk = read_json_blocks(SRC_FILES["risk"])[0]
    ges = read_json_blocks(SRC_FILES["ges"])[0]
    with open(SRC_FILES["profiles"], encoding="utf-8") as fh:
        prof = json.load(fh)

    eet = ee["technologies"]
    kkp = kk["eu_new_build_model_parameters"]

    out: dict[str, Any] = {}

    # ---------------------------------------------------------------- meta
    out["meta"] = {
        "title": "Konsolidierter Parametersatz Strommix-Modell",
        "generated_by": "scripts/consolidate_params.py",
        "sources": SRC_LABEL,
        "currency": "EUR, nominal, gemischte Erhebungsjahre 2024-2026 (siehe kosten_ee_speicher.md meta.price_basis)",
        "confidence_scale": {
            "A": "mehrfach bestaetigt / institutionelle Primaerquelle",
            "B": "einzelner Treffer, institutionelle Quelle",
            "C": "Branchen-/Marktquelle oder Modellannahme mit schwacher Belegbasis",
        },
        "modelling_decisions": [
            "Kernkraft-Opex absolut in EUR/kW/a (kosten_kernkraft.md 4.2/7.2) - NICHT als CAPEX-Prozentsatz.",
            "Brennstoff und Entsorgung/Rueckbau als getrennte variable Posten (kosten_kernkraft.md 7.2).",
            "WACC global (3-9 %, Default 5 % wie GES); IDC-Aufschlag ueber Bauzeit separat.",
            "CO2-Preis wirkt nur ueber den direkten Emissionsfaktor fossiler Erzeugung; Lebenszyklus-g/kWh nur informativ.",
            "Backup/Speicher entstehen im Dispatch, nicht als pauschaler Risiko-Aufschlag (risiken_co2.md 9 risiko_aufschlaege_zusammenfassung backup_und_speicher).",
            "min/mid/max nicht mechanisch kombinieren - siehe scenario_sets (kosten_ee_speicher.md 12 derived_lcoe_selfcheck.warning).",
        ],
        "limitation": ee["meta"]["limitation"],
    }

    # -------------------------------------------------------------- global
    out["global"] = {
        "wacc": param(
            0.05,
            "1 (Dezimalanteil)",
            f"{SRC_LABEL['kk']} 7.2 wacc / {SRC_LABEL['ges']} methodology.wacc",
            "A",
            mn=kkp["wacc"]["low"],
            mid=kkp["wacc"]["mid"],
            mx=kkp["wacc"]["high"],
            note=kkp["wacc"]["note"],
        ),
        "co2_price_eur_t": param(
            get(risk, "co2_preis_szenarien.slider.default"),
            "EUR/t CO2",
            f"{SRC_LABEL['risk']} 2.5 co2_preis_szenarien.slider",
            "C",
            mn=get(risk, "co2_preis_szenarien.slider.min"),
            mid=get(risk, "co2_preis_szenarien.slider.default"),
            mx=get(risk, "co2_preis_szenarien.slider.max"),
            note="Default 75 EUR/t = Marktniveau Mai 2026. Stuetzpunkte siehe co2_price_support_points.",
        ),
        "co2_price_support_points": get(risk, "co2_preis_szenarien.stuetzpunkte"),
        "demand_twh": param(
            950,
            "TWh/a",
            f"{SRC_LABEL['ist']} 4.1 bedarfsprojektionen_twh / {SRC_LABEL['ges']} Zieljahr 2045",
            "A",
            mn=get(ist, "bedarfsprojektionen_twh.2045.nep_2037_2045_v2025.low"),
            mid=950,
            mx=get(ist, "bedarfsprojektionen_twh.2045.nep_2037_2045_v2025.high"),
            note="Default 950 TWh = GES-Zieljahresbedarf 2045; Spanne NEP 2037/2045 (2025) 948-1275 TWh.",
        ),
        "demand_twh_2030": from_range(
            get(ist, "bedarfsprojektionen_twh.2030.empfohlene_modellspanne"),
            "TWh/a",
            f"{SRC_LABEL['ist']} 4.1 bedarfsprojektionen_twh.2030.empfohlene_modellspanne",
            "B",
        ),
        "demand_twh_2024_basis": param(
            get(ist, "bedarfsprojektionen_twh.basis_2024"),
            "TWh/a",
            f"{SRC_LABEL['ist']} 4.1 bedarfsprojektionen_twh.basis_2024",
            "A",
            note="Bruttostromverbrauch 2024. Netzlast (Profilbasis) liegt darunter: 455-470 TWh laut profiles_2024.json.",
        ),
        "idc_method": {
            "formula": "idc_surcharge = (1 + wacc)**(construction_years / 2) - 1",
            "calibration": "Reproduziert die Dossier-Werte Kernkraft +20/33/55 % bei wacc=5 % und Bauzeit 8/12/17 a.",
            "source": f"{SRC_LABEL['kk']} 5.4 + 7.2 idc_surcharge_on_capex",
            "empirical_anchor": get(kk, "eu_new_build_model_parameters.idc_surcharge_on_capex.empirical_anchor"),
            "confidence": "B",
        },
    }

    # -------------------------------------------------------- Technologien
    techs: dict[str, Any] = {}

    def vre_block(key: str, src_key: str, label: str, series: str, construction_years: dict) -> dict:
        t = eet[src_key]
        return {
            "label": label,
            "role": "vre",
            "profile_series": series,
            "lcoe_reference_eur_mwh": from_range(
                t.get("lcoe_eur_mwh_reference"),
                "EUR/MWh",
                f"{SRC_LABEL['ee']} 12 technologies.{src_key}.lcoe_eur_mwh_reference",
            ),
            "params": {
                "capex_eur_kw": from_range(
                    t["capex_eur_kw"], "EUR/kW", f"{SRC_LABEL['ee']} 12 technologies.{src_key}.capex_eur_kw"
                ),
                "opex_pct": from_range(
                    t["opex_pct"], "1/a (Anteil CAPEX)", f"{SRC_LABEL['ee']} 12 technologies.{src_key}.opex_pct"
                ),
                "opex_eur_kw_a": param(
                    None,
                    "EUR/kW/a",
                    f"{SRC_LABEL['ee']} 12 technologies.{src_key}",
                    None,
                    note="Dossier fuehrt Opex nur als CAPEX-Prozentsatz; fuer EE unkritisch (kurze Bauzeit, moderater CAPEX-Hebel).",
                ),
                "full_load_hours": from_range(
                    t["full_load_hours"], "h/a", f"{SRC_LABEL['ee']} 12 technologies.{src_key}.full_load_hours"
                ),
                "lifetime_years": from_range(
                    t["lifetime_years"], "a", f"{SRC_LABEL['ee']} 12 technologies.{src_key}.lifetime_years"
                ),
                "construction_years": construction_years,
                "fuel_eur_mwh": param(0.0, "EUR/MWh", "physikalisch null", "A"),
                "waste_eur_mwh": param(0.0, "EUR/MWh", "physikalisch null", "A"),
                "emission_factor_t_mwh": param(
                    0.0, "t CO2/MWh_el", "keine direkten Verbrennungsemissionen", "A"
                ),
            },
            "lifecycle_co2_g_kwh": None,  # wird unten aus risiken_co2 nachgetragen (informativ)
        }

    def construction_param(value, conf, source, note, status=None, gap_id=None):
        return param(value, "a", source, conf, mid=value, note=note, status=status, gap_id=gap_id)

    modellannahme = "MODELLANNAHME (nicht quellenbelegt)"
    idc_method_src = f"{SRC_LABEL['kk']} 5.4 (Methodik), Bauzeit fuer diese Technologie nicht im Dossier belegt"

    techs["pv_freiflaeche"] = vre_block(
        "pv_freiflaeche",
        "pv_freiflaeche",
        "Photovoltaik Freiflaeche",
        "solar_mw",
        construction_param(
            1,
            "C",
            f"{SRC_LABEL['kk']} 5.4 ('5 % ueber eine 1-jaehrige PV-Bauzeit ist praktisch null')",
            "Einzige im Dossier explizit genannte Nicht-Kernkraft-Bauzeit.",
        ),
    )
    techs["pv_dach_gross"] = vre_block(
        "pv_dach_gross",
        "pv_dach_gross",
        "Photovoltaik Dach (Gewerbe/Grossdach)",
        "solar_mw",
        construction_param(
            1,
            "C",
            f"{SRC_LABEL['kk']} 5.4 (Analogie PV Freiflaeche)",
            "Analogieannahme zur PV-Freiflaeche.",
            status=modellannahme,
        ),
    )
    techs["wind_onshore"] = vre_block(
        "wind_onshore",
        "wind_onshore",
        "Wind onshore",
        "wind_onshore_mw",
        construction_param(
            2,
            None,
            idc_method_src,
            "Bauzeit nicht im Dossier belegt; 2 a als konservative Annahme zwischen PV (1 a) und Offshore.",
            status=modellannahme,
            gap_id="bauzeit_wind_onshore",
        ),
    )
    techs["wind_offshore"] = vre_block(
        "wind_offshore",
        "wind_offshore",
        "Wind offshore",
        "wind_onshore_mw",
        construction_param(
            3,
            None,
            idc_method_src,
            "Bauzeit nicht im Dossier belegt; 3 a (Netzanbindung, Offshore-Logistik) als Annahme.",
            status=modellannahme,
            gap_id="bauzeit_wind_offshore",
        ),
    )
    techs["wind_offshore"]["profile_note"] = (
        "UEBERGANGSLOESUNG: profiles_2024.json enthaelt keine Offshore-Reihe "
        "(series.wind_offshore_mw.available=false). Es wird ersatzweise die Onshore-Profilform "
        "verwendet, skaliert auf die Offshore-Volllaststunden. Die reale Offshore-Glaettung "
        "(hoehere Grundproduktion, weniger Flauten) fehlt damit - konservativ, d. h. das Modell "
        "unterschaetzt den Systemwert von Offshore-Wind."
    )
    # Bandbreite Wind onshore: Bestandsflotten-VLh als Kontrastwert (GES-Annahme)
    techs["wind_onshore"]["full_load_hours_fleet"] = param(
        get(eet, "wind_onshore.full_load_hours_fleet.value_2025"),
        "h/a",
        f"{SRC_LABEL['ee']} 12 technologies.wind_onshore.full_load_hours_fleet",
        "A",
        note=get(eet, "wind_onshore.full_load_hours_fleet.note"),
    )

    # ------------------------------------------------------------ Kernkraft
    techs["nuclear"] = {
        "label": "Kernkraft (EU-Neubau)",
        "role": "firm",
        "profile_series": None,
        "capex_presets_eur_kw": {
            "eu_serie": param(
                kkp["capex_eur_kw"]["low"],
                "EUR/kW",
                f"{SRC_LABEL['kk']} 7.1 capex_eur_kw.low (Anker EPR2/Dukovany)",
                "B",
            ),
            "eu_mittel": param(
                kkp["capex_eur_kw"]["mid"],
                "EUR/kW",
                f"{SRC_LABEL['kk']} 7.1 capex_eur_kw.mid (Anker Polen/Sizewell C)",
                "B",
            ),
            "erstprojekt": param(
                kkp["capex_eur_kw"]["high"],
                "EUR/kW",
                f"{SRC_LABEL['kk']} 7.1 capex_eur_kw.high (Anker Hinkley Point C)",
                "B",
            ),
            "ges_annahme": param(
                get(ges, "technologies.nuclear.study.capex_eur_kw"),
                "EUR/kW",
                f"{SRC_LABEL['ges']} technologies.nuclear.study.capex_eur_kw",
                "A",
                note="Nur als Referenz fuer den Reproduktionstest, nicht als Modellbasis.",
            ),
        },
        "params": {
            "capex_eur_kw": param(
                kkp["capex_eur_kw"]["mid"],
                "EUR/kW",
                f"{SRC_LABEL['kk']} 7.1 capex_eur_kw",
                "B",
                mn=kkp["capex_eur_kw"]["low"],
                mid=kkp["capex_eur_kw"]["mid"],
                mx=kkp["capex_eur_kw"]["high"],
                note=kkp["capex_eur_kw"]["rationale_high"],
            ),
            "opex_pct": param(
                None,
                "1/a (Anteil CAPEX)",
                f"{SRC_LABEL['kk']} 4.2/7.2 opex.WARNUNG",
                None,
                note="BEWUSST null: Opex darf nicht am CAPEX-Slider haengen (Slider-Artefakt). Absolutwert verwenden.",
            ),
            "opex_eur_kw_a": param(
                kkp["opex"]["mid"],
                "EUR/kW/a",
                f"{SRC_LABEL['kk']} 7.2 opex (absolut)",
                "B",
                mn=kkp["opex"]["low"],
                mid=kkp["opex"]["mid"],
                mx=kkp["opex"]["high"],
                note=kkp["opex"]["WARNUNG"],
            ),
            "full_load_hours": param(
                kkp["full_load_hours"]["mid"],
                "h/a",
                f"{SRC_LABEL['kk']} 7.2 full_load_hours",
                None,
                mn=kkp["full_load_hours"]["low"],
                mid=kkp["full_load_hours"]["mid"],
                mx=kkp["full_load_hours"]["high"],
                note=kkp["full_load_hours"]["note"],
                status=kkp["full_load_hours"]["status"],
            ),
            "lifetime_years": param(
                kkp["lifetime_years"]["mid"],
                "a",
                f"{SRC_LABEL['kk']} 7.2 lifetime_years",
                "B",
                mn=kkp["lifetime_years"]["low"],
                mid=kkp["lifetime_years"]["mid"],
                mx=kkp["lifetime_years"]["high"],
                note=kkp["lifetime_years"]["note"],
            ),
            "construction_years": param(
                kkp["construction_years"]["mid"],
                "a",
                f"{SRC_LABEL['kk']} 7.2 construction_years",
                "A",
                mn=kkp["construction_years"]["low"],
                mid=kkp["construction_years"]["mid"],
                mx=kkp["construction_years"]["high"],
                note=kkp["construction_years"]["note"],
            ),
            "fuel_eur_mwh": param(
                kkp["fuel_eur_mwh"]["mid"],
                "EUR/MWh",
                f"{SRC_LABEL['kk']} 7.2 fuel_eur_mwh",
                "B",
                mn=kkp["fuel_eur_mwh"]["low"],
                mid=kkp["fuel_eur_mwh"]["mid"],
                mx=kkp["fuel_eur_mwh"]["high"],
            ),
            "waste_eur_mwh": param(
                kkp["waste_decommissioning_eur_mwh"]["mid"],
                "EUR/MWh",
                f"{SRC_LABEL['kk']} 7.2 waste_decommissioning_eur_mwh",
                "B",
                mn=kkp["waste_decommissioning_eur_mwh"]["low"],
                mid=kkp["waste_decommissioning_eur_mwh"]["mid"],
                mx=kkp["waste_decommissioning_eur_mwh"]["high"],
                note=kkp["waste_decommissioning_eur_mwh"]["note"],
            ),
            "emission_factor_t_mwh": param(0.0, "t CO2/MWh_el", "keine direkten Verbrennungsemissionen", "A"),
        },
        "idc_surcharge_reference": {
            "low": kkp["idc_surcharge_on_capex"]["low"],
            "mid": kkp["idc_surcharge_on_capex"]["mid"],
            "high": kkp["idc_surcharge_on_capex"]["high"],
            "source": f"{SRC_LABEL['kk']} 7.2 idc_surcharge_on_capex",
            "confidence": "B",
        },
        "lcoe_reference_eur_mwh": param(
            None,
            "EUR/MWh",
            f"{SRC_LABEL['kk']} 7.3 resulting_lcoe_eur_mwh",
            "B",
            mn=136,
            mid=None,
            mx=490,
            note="Fraunhofer ISE 2024 Neubau-Spanne 136-490 EUR/MWh; eigene Dossier-Spanne 130-275 EUR/MWh.",
        ),
        "scenario_lcoe_reference": kkp["resulting_lcoe_eur_mwh"],
    }

    # ---------------------------------------------------------------- Gas
    def thermal_block(key: str, label: str, role: str, construction_years_val: int, gap_id: str) -> dict:
        t = eet[key]
        return {
            "label": label,
            "role": role,
            "profile_series": None,
            "params": {
                "capex_eur_kw": from_range(
                    t["capex_eur_kw"], "EUR/kW", f"{SRC_LABEL['ee']} 12 technologies.{key}.capex_eur_kw"
                ),
                "opex_pct": from_range(
                    t["opex_pct"], "1/a (Anteil CAPEX)", f"{SRC_LABEL['ee']} 12 technologies.{key}.opex_pct"
                ),
                "opex_eur_kw_a": param(None, "EUR/kW/a", f"{SRC_LABEL['ee']} 12 technologies.{key}", None,
                                       note="Dossier fuehrt Opex nur als CAPEX-Prozentsatz."),
                "full_load_hours": from_range(
                    t["full_load_hours_backup"],
                    "h/a",
                    f"{SRC_LABEL['ee']} 12 technologies.{key}.full_load_hours_backup",
                    note="Backup-Betrieb. Im Mix-Modell ersetzt der Dispatch diesen Wert.",
                ),
                "lifetime_years": from_range(
                    t["lifetime_years"], "a", f"{SRC_LABEL['ee']} 12 technologies.{key}.lifetime_years"
                ),
                "efficiency": from_range(
                    t["efficiency"], "1", f"{SRC_LABEL['ee']} 12 technologies.{key}.efficiency"
                ),
                "construction_years": construction_param(
                    construction_years_val,
                    None,
                    idc_method_src,
                    "Bauzeit nicht im Dossier belegt; Annahme fuer den IDC-Aufschlag.",
                    status=modellannahme,
                    gap_id=gap_id,
                ),
                "fuel_eur_mwh": param(
                    None,
                    "EUR/MWh_el",
                    f"{SRC_LABEL['ee']} 8 (kein Gaspreis im Dossier)",
                    None,
                    note="HARTE LUECKE: kein Erdgas-Brennstoffpreis in den Dossiers. Siehe gas_fuel_implied "
                         "fuer eine rueckgerechnete Groessenordnung; das Modell rechnet ohne expliziten Wert "
                         "mit 0 und weist das als Untergrenze aus.",
                ),
                "waste_eur_mwh": param(0.0, "EUR/MWh", "nicht anwendbar", "A"),
                "emission_factor_t_mwh": param(
                    round(get(risk, "co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.min") / 1000.0, 4),
                    "t CO2/MWh_el",
                    f"{SRC_LABEL['risk']} 1.2 co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.min",
                    "C",
                    mn=round(get(risk, "co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.min") / 1000.0, 4),
                    mid=round(get(risk, "co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.min") / 1000.0, 4),
                    mx=round(get(risk, "co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.max") / 1000.0, 4),
                    note="PROXY: Ein direkter Verbrennungs-Emissionsfaktor fehlt in allen Dossiers. "
                         "Verwendet wird die UNECE-Lebenszyklus-Untergrenze fuer GuD, weil der Vorketten-"
                         "Anteil (Methanschlupf) darin am kleinsten ist. Vor Veroeffentlichung durch einen "
                         "echten Direktfaktor (z. B. UBA-Emissionsfaktor Erdgas) ersetzen.",
                ),
            },
        }

    techs["gas_ccgt"] = thermal_block("ccgt_gas", "Gaskraftwerk GuD", "backup", 3, "bauzeit_gas_ccgt")
    techs["gas_ocgt"] = thermal_block("ocgt_gas", "Gaskraftwerk OCGT (Peaker)", "backup", 2, "bauzeit_gas_ocgt")
    techs["gas_ccgt"]["key_finding"] = eet["ccgt_gas"]["key_finding"]

    # Rueckrechnung: welcher variable Kostenblock steckt in der FOeS-LCOE-Angabe?
    foes = eet["ccgt_gas"]["lcoe_eur_mwh_de_new"]
    techs["gas_ccgt"]["gas_fuel_implied"] = {
        "description": "Aus der FOeS-Gesamt-LCOE zurueckgerechneter variabler Block (Brennstoff + CO2), "
                       "nachdem Kapital- und Fixkosten (CAPEX mid, opex_pct mid, n mid, WACC 5 %) bei den "
                       "angegebenen Backup-Volllaststunden abgezogen wurden.",
        "computed_by": "scripts/consolidate_params.py (Formel im Feld formula)",
        "formula": "implied = lcoe_foes - (capex*CRF(wacc,n) + capex*opex_pct) / (flh/1000)",
        "inputs": {
            "lcoe_foes_eur_mwh": {"min": foes["min"], "max": foes["max"], "source": f"{SRC_LABEL['ee']} 8 lcoe_eur_mwh_de_new"},
            "flh_variants": [
                eet["ccgt_gas"]["full_load_hours_backup"]["min"],
                eet["ccgt_gas"]["full_load_hours_backup"]["mid"],
                eet["ccgt_gas"]["full_load_hours_backup"]["max"],
            ],
        },
        "confidence": "C",
        "warning": "Stark abhaengig von der (in der FOeS-Quelle nicht ausgewiesenen) Volllaststundenannahme. "
                   "Nur als Groessenordnung und Sensitivitaets-Obergrenze verwenden.",
        "results_eur_mwh_el": None,  # unten befuellt
    }

    # ------------------------------------------------------------ Speicher
    bat = eet["battery_grid_scale"]
    techs["battery"] = {
        "label": bat["label"],
        "role": "storage_short",
        "params": {
            "capex_eur_kwh": from_range(
                bat["capex_eur_kwh"], "EUR/kWh", f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.capex_eur_kwh"
            ),
            "capex_eur_kw": from_range(
                bat["capex_eur_kw"], "EUR/kW", f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.capex_eur_kw"
            ),
            "duration_hours": param(
                bat["duration_hours_assumed"],
                "h",
                f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.duration_hours_assumed",
                "B",
            ),
            "opex_pct": from_range(
                bat["opex_pct"], "1/a (Anteil CAPEX)", f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.opex_pct"
            ),
            "efficiency_roundtrip": from_range(
                bat["efficiency_roundtrip_ac"],
                "1",
                f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.efficiency_roundtrip_ac",
            ),
            "lifetime_years": from_range(
                bat["lifetime_years"], "a", f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.lifetime_years"
            ),
            "construction_years": construction_param(
                1, None, idc_method_src, "Bauzeit nicht im Dossier belegt.", status=modellannahme,
                gap_id="bauzeit_battery"
            ),
        },
        "lcos_reference_eur_mwh": from_range(
            bat["lcos_eur_mwh_lazard_2026"],
            "EUR/MWh",
            f"{SRC_LABEL['ee']} 12 technologies.battery_grid_scale.lcos_eur_mwh_lazard_2026",
            "A",
        ),
        "cost_trend": bat["cost_trend"],
    }

    ely = eet["electrolyser"]
    techs["electrolyser"] = {
        "label": ely["label"],
        "role": "storage_p2g",
        "params": {
            "capex_eur_kw": from_range(
                ely["capex_eur_kw"], "EUR/kW", f"{SRC_LABEL['ee']} 12 technologies.electrolyser.capex_eur_kw"
            ),
            "opex_pct": from_range(
                ely["opex_pct"], "1/a (Anteil CAPEX)", f"{SRC_LABEL['ee']} 12 technologies.electrolyser.opex_pct"
            ),
            "efficiency_lhv": from_range(
                ely["efficiency_lhv"], "1", f"{SRC_LABEL['ee']} 12 technologies.electrolyser.efficiency_lhv"
            ),
            "specific_consumption_kwh_per_kg": from_range(
                ely["specific_consumption_kwh_per_kg"],
                "kWh_el/kg H2",
                f"{SRC_LABEL['ee']} 12 technologies.electrolyser.specific_consumption_kwh_per_kg",
            ),
            "lifetime_years": from_range(
                ely["lifetime_years"], "a", f"{SRC_LABEL['ee']} 12 technologies.electrolyser.lifetime_years"
            ),
            "full_load_hours": from_range(
                ely["full_load_hours"],
                "h/a",
                f"{SRC_LABEL['ee']} 12 technologies.electrolyser.full_load_hours",
                note="Reine Modellannahme des Dossiers (confidence 'unverified'), betriebsmodellabhaengig. "
                     "Im Mix-Modell ersetzt der Dispatch diesen Wert.",
                status="MODELLANNAHME (nicht quellenbelegt)",
            ),
            "construction_years": construction_param(
                2, None, idc_method_src, "Bauzeit nicht im Dossier belegt.", status=modellannahme,
                gap_id="bauzeit_electrolyser"
            ),
        },
        "finding": ely["finding"],
    }

    cav = eet["h2_cavern_storage"]
    # kWh je kg H2 aus den beiden Dossier-Angaben desselben Sachverhalts abgeleitet
    kwh_per_kg = round(cav["storage_cost_eur_per_kg"]["mid"] / (cav["storage_cost_ct_per_kwh_h2"]["mid"] / 100.0), 2)
    techs["h2_storage"] = {
        "label": cav["label"],
        "role": "storage_long",
        "params": {
            "storage_cost_eur_mwh_h2": param(
                round(cav["storage_cost_low_cycling_eur_per_kg"]["value"] / kwh_per_kg * 1000, 1),
                "EUR/MWh_H2 (eingespeicherte Energie)",
                f"{SRC_LABEL['ee']} 12 technologies.h2_cavern_storage.storage_cost_low_cycling_eur_per_kg",
                "A",
                mn=round(cav["storage_cost_ct_per_kwh_h2"]["min"] * 10, 1),
                mid=round(cav["storage_cost_low_cycling_eur_per_kg"]["value"] / kwh_per_kg * 1000, 1),
                mx=round(cav["storage_cost_ct_per_kwh_h2"]["max"] * 10, 1),
                note="Saisonale Speicherung = niedrige Zyklenzahl = teures Ende der EWI-Spanne "
                     "(3,50 EUR/kg). Untere Grenze nur bei hoher Zyklenzahl erreichbar.",
            ),
            "kwh_per_kg_h2": param(
                kwh_per_kg,
                "kWh_H2/kg",
                f"{SRC_LABEL['ee']} 12 technologies.h2_cavern_storage (abgeleitet aus EUR/kg und ct/kWh)",
                "A",
                note="Abgeleitet, nicht gesetzt: 1,20 EUR/kg / 3,60 ct/kWh = 33,3 kWh/kg.",
            ),
            "de_repurposing_potential_twh": param(
                cav["de_repurposing_potential_twh"],
                "TWh_H2",
                f"{SRC_LABEL['ee']} 12 technologies.h2_cavern_storage.de_repurposing_potential_twh",
                "B",
            ),
        },
        "key_finding": cav["key_finding"],
    }

    h2p = eet["h2_rueckverstromung"]
    techs["h2_turbine"] = {
        "label": h2p["label"],
        "role": "storage_g2p",
        "params": {
            "capex_eur_kw": from_range(
                h2p["capex_eur_kw"], "EUR/kW", f"{SRC_LABEL['ee']} 12 technologies.h2_rueckverstromung.capex_eur_kw"
            ),
            "opex_pct": from_range(
                eet["ccgt_gas"]["opex_pct"],
                "1/a (Anteil CAPEX)",
                f"{SRC_LABEL['ee']} 12 technologies.ccgt_gas.opex_pct (Analogie GuD, kein eigener Wert im Dossier)",
                note="Analogie zum GuD, da das Dossier fuer H2-Kraftwerke keinen eigenen Opex-Satz ausweist.",
            ),
            "efficiency": from_range(
                h2p["efficiency_h2_ccgt"],
                "1",
                f"{SRC_LABEL['ee']} 12 technologies.h2_rueckverstromung.efficiency_h2_ccgt",
            ),
            "roundtrip_p2g2p": from_range(
                h2p["roundtrip_efficiency_p2g2p"],
                "1",
                f"{SRC_LABEL['ee']} 12 technologies.h2_rueckverstromung.roundtrip_efficiency_p2g2p",
            ),
            "lifetime_years": from_range(
                eet["ccgt_gas"]["lifetime_years"],
                "a",
                f"{SRC_LABEL['ee']} 12 technologies.ccgt_gas.lifetime_years (Analogie GuD)",
            ),
            "construction_years": construction_param(
                3, None, idc_method_src, "Bauzeit nicht im Dossier belegt.", status=modellannahme,
                gap_id="bauzeit_h2_turbine"
            ),
            "emission_factor_t_mwh": param(0.0, "t CO2/MWh_el", "H2-Verstromung ohne CO2 am Schornstein", "A"),
        },
        "lcoe_reference_eur_mwh": from_range(
            h2p["lcoe_eur_mwh_new_h2_plant"],
            "EUR/MWh",
            f"{SRC_LABEL['ee']} 12 technologies.h2_rueckverstromung.lcoe_eur_mwh_new_h2_plant",
            "A",
        ),
    }

    # Lebenszyklus-Emissionen (informativ, NICHT eingepreist)
    lifecycle_map = {
        "pv_freiflaeche": "pv_deutschland",
        "pv_dach_gross": "pv_deutschland",
        "wind_onshore": "wind_onshore",
        "wind_offshore": "wind_offshore",
        "nuclear": "kernkraft",
        "gas_ccgt": "erdgas_gud",
        "gas_ocgt": "erdgas_gud",
    }
    lct = get(risk, "co2_intensitaet_g_pro_kwh.technologien", {})
    for tech_key, risk_key in lifecycle_map.items():
        src = lct.get(risk_key, {})
        techs[tech_key]["lifecycle_co2_g_kwh"] = param(
            src.get("default"),
            "g CO2-Aeq/kWh (Lebenszyklus)",
            f"{SRC_LABEL['risk']} 1.2 co2_intensitaet_g_pro_kwh.technologien.{risk_key}",
            src.get("stufe"),
            mn=src.get("min"),
            mid=src.get("default"),
            mx=src.get("max"),
            note="INFORMATIV - wird laut Modellkonzept nicht eingepreist.",
        )

    out["technologies"] = techs

    # --------------------------------------------------- Szenariensaetze
    out["scenario_sets"] = {
        "_warning": get(ee, "derived_lcoe_selfcheck.warning"),
        "_source": f"{SRC_LABEL['ee']} 12 derived_lcoe_selfcheck.warning + {SRC_LABEL['kk']} 7.1-7.3",
        "guenstig": {
            "capex": "min",
            "opex": "min",
            "full_load_hours": "max",
            "lifetime_years": "max",
            "fuel": "min",
            "waste": "min",
            "wacc": kkp["wacc"]["low"],
            "rationale": "Konsistent: guter Standort, Serienfertigung, staatlich derisktes Kapital. "
                         "Niedriger CAPEX und hohe Volllaststunden treten real gemeinsam auf "
                         "(Serienprogramm bzw. Bestlagen).",
        },
        "mittel": {
            "capex": "mid",
            "opex": "mid",
            "full_load_hours": "mid",
            "lifetime_years": "mid",
            "fuel": "mid",
            "waste": "mid",
            "wacc": kkp["wacc"]["mid"],
            "rationale": "Zentralwerte aller Dossiers, WACC 5 % wie GES-Studie.",
        },
        "teuer": {
            "capex": "max",
            "opex": "max",
            "full_load_hours": "mid",
            "lifetime_years": "min",
            "fuel": "max",
            "waste": "max",
            "wacc": kkp["wacc"]["high"],
            "rationale": "BEWUSST max-CAPEX mit MITTLEREN Volllaststunden - nicht mit min-VLh. "
                         "Grund: hohe CAPEX treten real ueberwiegend an guten Standorten auf "
                         "(Offshore weit draussen, grosse Anlagen); die mechanische Kombination "
                         "max-CAPEX x min-VLh waere doppelter Pessimismus.",
        },
        "extremkombination_nur_sensitivitaet": {
            "capex": "max",
            "opex": "max",
            "full_load_hours": "min",
            "lifetime_years": "min",
            "fuel": "max",
            "waste": "max",
            "wacc": kkp["wacc"]["high"],
            "rationale": "Nur als ausgewiesene Sensitivitaets-Obergrenze, nicht als Szenario verwenden.",
        },
    }

    # ------------------------------------------------------------ System
    nep = get(ist, "netzkosten.uebertragungsnetz_nep_2037_2045_v2025", {})
    imk = get(ist, "netzkosten.gesamtnetz_imk_boeckler_2024", {})
    out["system"] = {
        "grid": {
            "investment_bn_eur_until_2045": param(
                imk.get("gesamt_bis_2045"),
                "Mrd. EUR",
                f"{SRC_LABEL['ist']} 5.1 netzkosten (IMK/Boeckler gesamt; NEP nur Uebertragungsnetz)",
                "B",
                mn=nep.get("szenario_b_gesamt"),
                mid=imk.get("gesamt_bis_2045"),
                mx=imk.get("gesamt_bis_2045"),
                note="min = NEP 2037/2045 Szenario B (nur Uebertragungsnetz, 400 Mrd.), "
                     "mid/max = IMK inkl. Verteilnetz (651 Mrd.).",
            ),
            "lifetime_years": param(
                40,
                "a",
                f"{SRC_LABEL['ist']} 5.1 (keine Abschreibungsdauer im Dossier)",
                None,
                mid=40,
                note="Bilanzielle Nutzungsdauer der Netzinvestitionen nicht in den Dossiers belegt.",
                status=modellannahme,
                gap_id="netz_nutzungsdauer",
            ),
            "reference_fee_share": param(
                1.0,
                "1",
                f"{SRC_LABEL['ist']} 5.1 / {SRC_LABEL['ges']} Kap. 4 (lineare fEE-Skalierung wie GES)",
                None,
                mid=1.0,
                note="Bezugspunkt der linearen Skalierung: Die NEP-/IMK-Investitionsvolumina gelten fuer "
                     "ein weitgehend klimaneutrales (fEE-dominiertes) Zielsystem. Netzkosten werden im "
                     "Modell linear mit dem fEE-Anteil skaliert - dieselbe Vereinfachung wie in der "
                     "GES-Studie, inkl. derselben Limitation (keine raeumliche Netzsimulation).",
                status=modellannahme,
            ),
            "redispatch_2024_bn_eur": param(
                2.776,
                "Mrd. EUR/a",
                f"{SRC_LABEL['risk']} 4.1 netz_und_systemkosten.netzengpassmanagement_mrd_eur[2024]",
                "A",
                note="Ist-Wert, im Modell nicht doppelt angesetzt (in den Netzkosten enthalten).",
            ),
            "curtailment_2024_twh": param(
                9.4,
                "TWh/a",
                f"{SRC_LABEL['risk']} 4.2 netz_und_systemkosten.abregelung[2024]",
                "A",
                note="Referenz zum Vergleich mit der modellierten Abregelung.",
            ),
        },
        "security_of_supply": {
            "firm_capacity_gap_2030_gw": from_range(
                get(risk, "versorgungssicherheit.gesicherte_leistung_zusatzbedarf_gw.2030"),
                "GW",
                f"{SRC_LABEL['risk']} 3.4 versorgungssicherheit.gesicherte_leistung_zusatzbedarf_gw.2030",
            ),
            "battery_need_2045_gwh": from_range(
                get(risk, "versorgungssicherheit.speicherbedarf_2045.batterie_gwh"),
                "GWh",
                f"{SRC_LABEL['risk']} 3.5 versorgungssicherheit.speicherbedarf_2045.batterie_gwh",
                key_mid="median",
            ),
            "h2_storage_need_2045_twh": param(
                get(risk, "versorgungssicherheit.speicherbedarf_2045.wasserstoff_speicher_twh.min"),
                "TWh_H2",
                f"{SRC_LABEL['risk']} 3.5 versorgungssicherheit.speicherbedarf_2045.wasserstoff_speicher_twh",
                "C",
            ),
            "dunkelflaute_reference": get(risk, "dunkelflaute.referenzereignis_dez_2024"),
            "dunkelflaute_frequency": get(risk, "dunkelflaute.haeufigkeit"),
            "energy_need_48h_winter_twh": from_range(
                get(risk, "dunkelflaute.energiebedarf_48h_winter_twh"),
                "TWh",
                f"{SRC_LABEL['risk']} 3.3 dunkelflaute.energiebedarf_48h_winter_twh",
            ),
        },
        "cost_overrun_factors": {
            "_note": get(risk, "kostenueberschreitung_faktoren.verwendung"),
            "_source": f"{SRC_LABEL['risk']} 7 kostenueberschreitung_faktoren",
            "_default": 1.0,
            "factors": {
                k: {
                    "value": 1.0,
                    "min": v.get("spanne", [None, None])[0],
                    "mid": v.get("flyvbjerg") or v.get("sovacool"),
                    "max": v.get("spanne", [None, None])[1],
                    "unit": "Faktor auf CAPEX",
                    "source": f"{SRC_LABEL['risk']} 7 kostenueberschreitung_faktoren.technologien.{k}",
                    "confidence": norm_conf(v.get("stufe")),
                    "note": "Default 1.0 = abgeschaltet. Bewusst NICHT im Basisfall aktiv, "
                            "damit der Modellkern nicht mit Risikoannahmen vermischt wird.",
                }
                for k, v in get(risk, "kostenueberschreitung_faktoren.technologien", {}).items()
            },
        },
        "double_counting_warning": next(
            (p for p in get(risk, "risiko_aufschlaege_zusammenfassung.positionen", [])
             if p.get("id") == "backup_und_speicher"),
            None,
        ),
    }

    # ------------------------------------------------------ Ist-Zustand DE
    cap25 = get(ist, "installierte_leistung_gw.stand_jahresende_2025", {})
    out["ist_zustand"] = {
        "installed_gw_2024_profile_reference": {
            "_source": f"{SRC_LABEL['profiles']} meta.capacity_reference_note (Literaturwerte Ende 2024)",
            "_note": prof["meta"]["capacity_reference_note"],
            "pv": 99.3,
            "wind_onshore": 62.4,
            "wind_offshore": 9.2,
            "hydro_ror": 4.0,
            "biomass": 9.6,
        },
        "installed_gw_2025": {
            k: {"value": v.get("wert", v.get("low")), "confidence": norm_conf(v.get("confidence"))}
            for k, v in cap25.items()
            if isinstance(v, dict)
        },
        "generation_2024_twh": {
            "pv": param(
                get(ist, "ist_mix.2024.pv_erzeugung_gesamt"),
                "TWh",
                f"{SRC_LABEL['ist']} 1.3 ist_mix.2024.pv_erzeugung_gesamt",
                "A",
            ),
            "wind_total": param(
                get(ist, "ist_mix.2024.wind_gesamt_ise"),
                "TWh",
                f"{SRC_LABEL['ist']} 1.3 ist_mix.2024.wind_gesamt_ise",
                "A",
            ),
        },
    }

    # -------------------------------------------- Profil-Saisonalitaet H2
    # Anteil der Jahresenergie, der in den abgedeckten Zeitraum faellt.
    # Bei einem Volljahres-Profil ist der Anteil automatisch 1.0.
    plaus = prof["meta"].get("plausibility_check_2024", {})
    seasonal = {}
    for series in ("load_mw", "solar_mw", "wind_onshore_mw"):
        s = prof["series"][series]
        if s["coverage"].get("covers_full_calendar_year"):
            seasonal[series] = param(1.0, "1", f"{SRC_LABEL['profiles']} series.{series}.coverage", "A")
            continue
        covered = s.get("annual_sum_twh_covered_period")
        rng = get(plaus, f"{series}.expected_full_year_range_twh")
        if covered and rng:
            lo = round(covered / rng[1], 4)
            hi = round(covered / rng[0], 4)
            mid = round(covered / ((rng[0] + rng[1]) / 2), 4)
            seasonal[series] = param(
                mid,
                "1 (Anteil der Jahresenergie im abgedeckten Zeitraum)",
                f"{SRC_LABEL['profiles']} meta.plausibility_check_2024.{series}",
                "C",
                mn=lo,
                mid=mid,
                mx=hi,
                note="Abgeleitet aus Teilzeitraumsumme / erwarteter Jahressumme. Ersetzt die naive "
                     "Annahme 'Stundenanteil = Energieanteil' (waere fuer PV um rund 18 % falsch).",
            )
        else:
            seasonal[series] = param(
                None, "1", f"{SRC_LABEL['profiles']} series.{series}", None,
                note="Weder Volljahr noch Plausibilitaetsspanne vorhanden.",
                gap_id=f"seasonal_share_{series}",
            )
    # PV-Gegenprobe gegen den Ist-Zustand (72,2 TWh Jahres-PV 2024)
    pv_full = get(ist, "ist_mix.2024.pv_erzeugung_gesamt")
    pv_cov = prof["series"]["solar_mw"].get("annual_sum_twh_covered_period")
    if pv_full and pv_cov:
        seasonal["solar_mw"]["cross_check"] = {
            "value": round(pv_cov / pv_full, 4),
            "source": f"{SRC_LABEL['ist']} 1.3 ist_mix.2024.pv_erzeugung_gesamt (72,2 TWh)",
            "note": "Unabhaengige Gegenprobe zur abgeleiteten Saisonalitaet.",
        }
    out["profiles_meta"] = {
        "path": "data/profiles_2024.json",
        "data_completeness": prof["meta"]["data_completeness"],
        "gaps": prof["meta"]["gaps"],
        "capacity_factors_covered_period": prof["meta"]["capacity_factors_covered_period"],
        "seasonal_share_covered": seasonal,
        "result_label": "H2-2024-basiert (nur 01.07.-31.12.2024)",
        "architecture_note": "Alle Kennzahlen werden ueber coverage/seasonal_share normalisiert; "
                             "ein Volljahres-profiles_2024.json laeuft ohne Codeaenderung.",
    }

    # ------------------------------------------------- GES-Referenzwerte
    out["ges_reference"] = {
        "_source": f"{SRC_LABEL['ges']} Kap. 10 (maschinenlesbarer Datenblock)",
        "methodology": ges["methodology"],
        "scenarios": ges["scenarios_original"],
        "technologies": {
            k: v["study"] for k, v in ges["technologies"].items()
        },
        "system_level_estimate": ges["system_level_estimate"],
    }

    # GES-Szenario-Rekonstruktion fuer den Mix-Modell-Test (Ebene 2/3)
    out["ges_scenario_reconstruction"] = {
        "_status": "REKONSTRUKTION - die GES-Studie veroeffentlicht die Technologie-Aufteilung je Szenario "
                   "nur als Grafik (siehe docs/01 Kap. 6). Die folgenden Energieanteile sind aus den "
                   "veroeffentlichten installierten Leistungen (gesamt / fEE) und den GES-Volllaststunden "
                   "abgeleitet und daher naeherungsweise.",
        "_source": f"{SRC_LABEL['ges']} Kap. 3 + 6 + scenarios_original",
        "_confidence": "C",
        "demand_twh": 950,
        "fee_split_assumption": {
            "pv": 0.45,
            "wind_onshore": 0.40,
            "wind_offshore": 0.15,
            "basis": "Kapazitaetsanteile in Anlehnung an die EEG-/WindSeeG-Ziele 2045 "
                     f"({SRC_LABEL['ist']} 3.1 zielpfade.ziele_gw: PV 400 GW, Wind on 160 GW, Wind off 70 GW)",
            "status": modellannahme,
        },
        "scenarios": {
            "kostenminimum": {
                "installed_gw": 215,
                "fee_gw": 90,
                "lscoe_published": 125,
                "firm_technology": "nuclear",
                "note": "Grundlast ~125 GW bei 8.000 VLh, laut docs/01 Kap. 6 rund 80 % der Erzeugung.",
            },
            "ee80_gas": {
                "installed_gw": 542,
                "fee_gw": 438,
                "lscoe_published": 197,
                "firm_technology": "gas_ccgt",
            },
            "ee80_h2": {
                "installed_gw": 618,
                "fee_gw": 438,
                "lscoe_published": 212,
                "firm_technology": "h2_turbine",
            },
            "ee100": {
                "installed_gw": 1162,
                "fee_gw": 786,
                "lscoe_published": 321,
                "firm_technology": "h2_turbine",
            },
        },
    }

    # ------------------------------------------------------------- Luecken
    out["gaps"] = GAPS + [
        {
            "id": "gaspreis_erdgas",
            "parameter": "technologies.gas_*.params.fuel_eur_mwh",
            "reason": "Kein Erdgas-Brennstoffpreis (EUR/MWh_th oder EUR/MWh_el) in den Dossiers. "
                      "Das Modell rechnet ohne expliziten Wert mit 0 und weist das Ergebnis als Untergrenze aus; "
                      "gas_fuel_implied liefert eine rueckgerechnete Obergrenze.",
        },
        {
            "id": "emissionsfaktor_direkt",
            "parameter": "technologies.gas_*.params.emission_factor_t_mwh",
            "reason": "Kein direkter Verbrennungs-Emissionsfaktor in den Dossiers. Als Proxy dient die "
                      "UNECE-Lebenszyklus-Untergrenze fuer GuD (403 g/kWh). Vor Veroeffentlichung ersetzen.",
        },
        {
            "id": "profile_partial",
            "parameter": "data/profiles_2024.json",
            "reason": "Nur 4.416 von 8.784 Stunden (Jul-Dez 2024); Wind offshore, Wasserkraft und Biomasse "
                      "fehlen komplett. Alle Dispatch-Ergebnisse sind H2-2024-basiert.",
        },
        {
            "id": "offshore_profil",
            "parameter": "technologies.wind_offshore.profile_series",
            "reason": "Kein Offshore-Profil vorhanden; Uebergangsloesung mit Onshore-Profilform.",
        },
        {
            "id": "ges_technologie_split",
            "parameter": "ges_scenario_reconstruction",
            "reason": "GES veroeffentlicht die Technologie-Aufteilung je Szenario nur als Grafik; "
                      "der Mix-Test arbeitet daher mit einer rekonstruierten Aufteilung.",
        },
        {
            "id": "hydro_biomasse_band",
            "parameter": "technologies (Wasserkraft, Biomasse)",
            "reason": "Keine Kostenparameter fuer Wasserkraft und Biomasse in den Dossiers; im Mix-Modell "
                      "nur als optionales Band ohne Kostenansatz fuehrbar.",
        },
    ]

    return out


# --------------------------------------------------------------------------
# Nachgelagerte Ableitung (braucht die CRF-Funktion aus dem Modell)
# --------------------------------------------------------------------------
def fill_derived(params: dict) -> None:
    """Rechnet den impliziten Gas-Variablenblock aus der FOeS-LCOE zurueck."""
    import model  # lokaler Import, damit consolidate ohne model importierbar bleibt

    gas = params["technologies"]["gas_ccgt"]
    implied = gas["gas_fuel_implied"]
    capex = gas["params"]["capex_eur_kw"]["mid"]
    opex_pct = gas["params"]["opex_pct"]["mid"]
    n = gas["params"]["lifetime_years"]["mid"]
    wacc = params["global"]["wacc"]["mid"]
    lo, hi = implied["inputs"]["lcoe_foes_eur_mwh"]["min"], implied["inputs"]["lcoe_foes_eur_mwh"]["max"]

    results = {}
    for flh in implied["inputs"]["flh_variants"]:
        fixed = (capex * model.crf(wacc, n) + capex * opex_pct) / (flh / 1000.0)
        results[str(flh)] = {
            "fixed_eur_mwh": round(fixed, 1),
            "implied_fuel_plus_co2_min": round(lo - fixed, 1),
            "implied_fuel_plus_co2_max": round(hi - fixed, 1),
        }
    implied["results_eur_mwh_el"] = results
    negative = [k for k, v in results.items() if v["implied_fuel_plus_co2_min"] < 0]
    implied["interpretation"] = (
        "Bei " + ", ".join(negative) + " h Volllaststunden ergibt die Rueckrechnung negative "
        "variable Kosten - die FOeS-Angabe kann also nicht auf so wenigen Betriebsstunden beruhen. "
        "Belastbar ist daraus nur: der variable Block (Brennstoff + CO2) liegt in der "
        "Groessenordnung 100-200 EUR/MWh_el, wenn die FOeS-Rechnung 1.500-3.000 h unterstellt. "
        "Ein belegter Erdgaspreis bleibt die vorrangige Nacharbeit."
    ) if negative else (
        "Alle Varianten liefern positive variable Kosten; die Spanne bleibt stark "
        "volllaststundenabhaengig."
    )


def main() -> None:
    params = build()
    fill_derived(params)
    os.makedirs(DATA, exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(params, fh, ensure_ascii=False, indent=2)
    n_tech = len(params["technologies"])
    print(f"[consolidate] {OUT_PATH} geschrieben")
    print(f"[consolidate] Technologien: {n_tech}")
    print(f"[consolidate] Luecken (gaps): {len(params['gaps'])}")
    for gap in params["gaps"]:
        print(f"  - {gap['id']}: {gap['parameter']}")


if __name__ == "__main__":
    main()
