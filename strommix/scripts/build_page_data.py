#!/usr/bin/env python3
"""Baut den redaktionellen Datensatz fuer das White Paper (data/page_data.json).

Regel aus README.md: "Keine Zahl landet im HTML, die nicht aus data/ kommt und
dort per Skript aus dokumentierten Quellen erzeugt wurde."

`data/model_params.json` deckt alles ab, was das Rechenmodell braucht. Dieses
Skript ergaenzt die Zahlen, die im *Text* und in den *Vergleichslinien* der
Charts auftauchen und deshalb ebenfalls nicht im HTML stehen duerfen:

  * Teil A: Ist-Mix 2025, installierte Leistung, Zielerreichung, Bedarfsspannen
  * Teil B: LCOE-Vergleichsbaender Dritter (Fraunhofer ISE, Lazard, IRENA),
            Ausschreibungsergebnisse der BNetzA, Kernkraft-Referenzprojekte
  * Teil D: Dunkelflaute-Definitionen, Kostenueberschreitungs-Empirie,
            Lieferketten, Endlager/KENFO, LCA-CO2-Intensitaeten
  * Quellenverzeichnis mit Zugriffsdatum und Konfidenzstufe

Alle Werte werden aus den ```json-Bloecken der Dossiers gelesen (dieselbe
Mechanik wie scripts/consolidate_params.py). Nur dort, wo ein Dossier den Wert
ausschliesslich im Fliesstext fuehrt, steht die Quellenangabe unten explizit im
Skript - jeweils mit Abschnittsverweis, damit sie nachpruefbar bleibt.

Aufruf:
    python3 scripts/build_page_data.py
"""

from __future__ import annotations

import json
import os
import re
from typing import Any

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(BASE, "research")
DOCS = os.path.join(BASE, "docs")
DATA = os.path.join(BASE, "data")
OUT_PATH = os.path.join(DATA, "page_data.json")

JSON_FENCE = re.compile(r"```json\n(.*?)\n```", re.S)


def blocks(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as fh:
        return [json.loads(raw) for raw in JSON_FENCE.findall(fh.read())]


def first_block(path: str) -> dict:
    b = blocks(path)
    if not b:
        raise RuntimeError(f"kein ```json-Block in {path}")
    return b[0]


# --------------------------------------------------------------------------
# Quellenverzeichnis
# --------------------------------------------------------------------------
# Ids, die aus den strukturierten `sources`-Listen der Dossiers uebernommen
# werden (kosten_ee_speicher.md / kosten_kernkraft.md).
STRUCTURED_SOURCE_IDS = [
    "fraunhofer-ise-2024", "fraunhofer-ise-flexkraftwerke", "lazard-2026", "irena-2024",
    "windguard-2025", "bnetza-wind-2026-05", "bnetza-pv-2026-03", "bnetza-hoechstwert-2026",
    "ewi-h2-speicher", "foes-2025", "offshore-stiftung-2025",
    "iwr-hinkley-2026", "newcivilengineer-hpc", "ecb-fx",
]

# Quellen, die in den Dossiers nur im Fliesstext stehen. Abschnittsverweis
# steht in `dossier`, damit jeder Eintrag rueckverfolgbar bleibt.
MANUAL_SOURCES = [
    {"id": "ipcc-ar6-syr", "title": "Climate Change 2023: Synthesis Report — Summary for Policymakers",
     "publisher": "IPCC", "date": "2023-03",
     "url": "https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 1.1 (K1, K4)"},
    {"id": "ipcc-ar6-wg1", "title": "Climate Change 2021: The Physical Science Basis — Summary for Policymakers",
     "publisher": "IPCC (WG1)", "date": "2021-08",
     "url": "https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 1.1 (K2, K3)"},
    {"id": "unece-2022", "title": "Carbon Neutrality in the UNECE Region — Integrated Life-cycle Assessment of Electricity Sources",
     "publisher": "UNECE", "date": "2022",
     "url": "https://unece.org/sed/documents/2021/10/reports/life-cycle-assessment-electricity-generation-options",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 1.2"},
    {"id": "ageb-strerz-2025", "title": "Bruttostromerzeugung in Deutschland nach Energietraegern (Datenblatt STRERZ) / Jahresauswertung Wintertagung",
     "publisher": "AG Energiebilanzen e. V.", "date": "2025-12-15",
     "url": "https://ag-energiebilanzen.de/wp-content/uploads/2025/02/STRERZ-Abgabe-2025-06.pdf",
     "accessed": "2026-08-15", "confidence": "B", "dossier": "ist_zustand_de.md 1.1"},
    {"id": "ise-stromerzeugung-2025", "title": "Stromerzeugung in Deutschland im Jahr 2025 (Jahresauswertung)",
     "publisher": "Fraunhofer ISE / Energy-Charts (B. Burger)", "date": "2026-01",
     "url": "https://www.energy-charts.info/downloads/Stromerzeugung_2025.pdf",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "ist_zustand_de.md 1.2"},
    {"id": "nep-2037-2045", "title": "Netzentwicklungsplan Strom 2037 mit Ausblick 2045, Version 2025, 1. Entwurf",
     "publisher": "50Hertz, Amprion, TenneT, TransnetBW", "date": "2025-12",
     "url": "https://www.netzentwicklungsplan.de/sites/default/files/2025-12/NEP_2037_2045_V2025_1_Entwurf_0.pdf",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "ist_zustand_de.md 1.3 / 4.1 / 5.1"},
    {"id": "monitoringbericht-2025", "title": "Monitoringbericht zur Energiewende (wiss. Zuarbeit EWI und BET Aachen)",
     "publisher": "BMWE", "date": "2025-09-15",
     "url": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Publikationen/Energie/monitoringbericht-energiewende.html",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "ist_zustand_de.md 4.2"},
    {"id": "eeg-2023", "title": "Erneuerbare-Energien-Gesetz (EEG 2023), §§ 1 und 4 — Ausbauziele",
     "publisher": "Bundesministerium fuer Wirtschaft und Energie / UBA", "date": "2023",
     "url": "https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/erneuerbare-energien-gesetz",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "ist_zustand_de.md 3.1"},
    {"id": "bnetza-preisspitzen-2025", "title": "Untersuchung zu Strompreisspitzen waehrend Dunkelflauten 2024 (Pressemitteilung)",
     "publisher": "Bundesnetzagentur / Bundeskartellamt", "date": "2025-10-21",
     "url": "https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2025/20251021_Preisspitzen.html",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 3.3"},
    {"id": "uniper-dunkelflaute-2026", "title": "Kurzstudie Dunkelflauten (Zeitreihenanalyse 2016-2025)",
     "publisher": "Uniper SE", "date": "2026-06",
     "url": "https://www.pv-magazine.de/2026/06/01/uniper-dunkelflauten-sind-regelmaessiger-bestandteil-des-deutschen-stromsystems/",
     "accessed": "2026-08-15", "confidence": "A",
     "dossier": "risiken_co2.md 3.1/3.2",
     "note": "Interessenlage: Uniper betreibt konventionelle Kraftwerke. 10-h-Schwelle statt DWD-48-h."},
    {"id": "lbbw-dunkelflaute-2025", "title": "Analysen und Statistiken zu Dunkelflauten in Deutschland",
     "publisher": "LBBW Research", "date": "2025",
     "url": "https://www.lbbw.de/artikel/research-studien-2025/dunkelflaute_ake25jccd8_d.html",
     "accessed": "2026-08-15", "confidence": "B", "dossier": "risiken_co2.md 3.2"},
    {"id": "flyvbjerg-2023", "title": "How Big Things Get Done (Megaprojekt-Datenbank, ~16.000 Projekte)",
     "publisher": "B. Flyvbjerg / D. Gardner, Currency/Penguin", "date": "2023",
     "url": "https://budgetoverrun.com/studies/flyvbjerg-megaproject-database",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 7.1"},
    {"id": "sovacool-ryu-2025", "title": "Beyond economies of scale: Learning from construction cost overrun risks and time delays in global energy infrastructure projects",
     "publisher": "Energy Research & Social Science (Sovacool, Ryu)", "date": "2025-03",
     "url": "https://www.sciencedirect.com/science/article/pii/S2214629625001380",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 7.2"},
    {"id": "iea-pv-supply-chains", "title": "Special Report on Solar PV Global Supply Chains",
     "publisher": "IEA", "date": "2022",
     "url": "https://www.iea.org/reports/solar-pv-global-supply-chains/executive-summary",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 5.1"},
    {"id": "euratom-esa-2024", "title": "Euratom Supply Agency — Annual Report 2024",
     "publisher": "Europaeische Kommission", "date": "2025",
     "url": "https://euratom-supply.ec.europa.eu/",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 5.2"},
    {"id": "iea-critical-minerals-2025", "title": "Global Critical Minerals Outlook 2025",
     "publisher": "IEA", "date": "2025",
     "url": "https://www.iea.org/reports/global-critical-minerals-outlook-2025",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 5.4"},
    {"id": "base-endlager", "title": "Endlagerung — Statusinformationen Finnland, Frankreich, Deutschland",
     "publisher": "Bundesamt fuer die Sicherheit der nuklearen Entsorgung (BASE)", "date": "2026",
     "url": "https://www.base.bund.de/de/endlager/endlager-ausland/finnland/finnland-endlager.html",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 6.1"},
    {"id": "kenfo", "title": "Fonds zur Finanzierung der kerntechnischen Entsorgung — Kennzahlen und Jahresergebnis 2025",
     "publisher": "KENFO", "date": "2026",
     "url": "https://www.kenfo.de/",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "risiken_co2.md 6.2"},
    {"id": "bundestag-wd-haftung", "title": "Die Versicherungspflicht von Atomkraftwerken (WD 3 - 330/10)",
     "publisher": "Deutscher Bundestag, Wissenschaftliche Dienste", "date": "2010",
     "url": "https://www.bundestag.de/resource/blob/412752/5782d652a8e25945c65d84744d314b88/WD-3-330-10-pdf.pdf",
     "accessed": "2026-08-15", "confidence": "B", "dossier": "risiken_co2.md 6.3"},
    {"id": "uba-methodenkonvention", "title": "Methodenkonvention 3.2 zur Ermittlung von Umweltkosten (CO2-Schattenpreise)",
     "publisher": "Umweltbundesamt", "date": "2020",
     "url": "https://www.umweltbundesamt.de/publikationen/methodenkonvention-32-methodische-grundlagen",
     "accessed": "2026-08-15", "confidence": "B", "dossier": "risiken_co2.md 2.4"},
    {"id": "ges-studie-2026", "title": "Der klimaneutrale Strommix der Zukunft — Eine Szenarioanalyse zu den Kosten des zukuenftigen deutschen Stromsystems",
     "publisher": "Global Energy Solutions e. V.", "date": "2026-07",
     "url": "https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf",
     "accessed": "2026-08-15", "confidence": "A", "dossier": "docs/01_grundlage_ges_faktencheck.md"},
    {"id": "smard-mirror-2024", "title": "Stuendliche SMARD-Exportdaten Deutschland Jul-Dez 2024 (GitHub-Mirror, Notloesung)",
     "publisher": "SMARD / Bundesnetzagentur, ueber github.com/hakimdalim/smard-data-extractor", "date": "2024",
     "url": "https://github.com/hakimdalim/smard-data-extractor",
     "accessed": "2026-08-15", "confidence": "C",
     "dossier": "daten_stundenprofile.md",
     "note": "Primaerquellen (energy-charts, smard.de, OPSD) waren aus der Arbeitsumgebung per Egress-Policy nicht erreichbar."},
    {"id": "imk-netzkosten", "title": "Netzinvestitionsbedarf bis 2045 (Uebertragungs- und Verteilnetz)",
     "publisher": "IMK / Hans-Boeckler-Stiftung", "date": "2025",
     "url": "https://www.imk-boeckler.de/",
     "accessed": "2026-08-15", "confidence": "B", "dossier": "ist_zustand_de.md 5.1"},
]


def collect_sources(ee: dict, kk: dict) -> list[dict]:
    by_id: dict[str, dict] = {}
    for block in (ee, kk):
        for s in block.get("sources", []) or []:
            by_id[s["id"]] = s
    out = []
    missing = []
    for sid in STRUCTURED_SOURCE_IDS:
        rec = by_id.get(sid)
        if rec is None:
            missing.append(sid)
            continue
        out.append({
            "id": rec["id"], "title": rec.get("title"), "publisher": rec.get("publisher"),
            "date": rec.get("date"), "url": rec.get("url"), "accessed": rec.get("accessed"),
            "confidence": rec.get("confidence", "A" if rec.get("fulltext_verified") else "B"),
            "note": rec.get("note"),
            "dossier": "kosten_ee_speicher.md / kosten_kernkraft.md (sources)",
        })
    if missing:
        raise RuntimeError(f"Quellen-IDs nicht in den Dossiers gefunden: {missing}")
    out.extend(MANUAL_SOURCES)
    out.sort(key=lambda s: (s.get("publisher") or "", s.get("date") or ""))
    for i, s in enumerate(out, start=1):
        s["nr"] = i
    return out


# --------------------------------------------------------------------------
def main() -> None:
    ee = first_block(os.path.join(RESEARCH, "kosten_ee_speicher.md"))
    kk = first_block(os.path.join(RESEARCH, "kosten_kernkraft.md"))
    ist = first_block(os.path.join(RESEARCH, "ist_zustand_de.md"))
    risk = first_block(os.path.join(RESEARCH, "risiken_co2.md"))
    with open(os.path.join(DATA, "model_params.json"), encoding="utf-8") as fh:
        params = json.load(fh)

    tech_ee = ee["technologies"]

    out: dict[str, Any] = {
        "meta": {
            "generated_by": "scripts/build_page_data.py",
            "purpose": "Redaktioneller Datensatz fuer whitepaper-strommix.html (Text- und Vergleichszahlen)",
            "inputs": ["research/kosten_ee_speicher.md", "research/kosten_kernkraft.md",
                       "research/ist_zustand_de.md", "research/risiken_co2.md",
                       "data/model_params.json"],
            "limitation": params["meta"]["limitation"],
            "confidence_scale": params["meta"]["confidence_scale"],
        },

        # ---------------- Teil A ------------------------------------------
        "ist_mix": ist["ist_mix"],
        "installierte_leistung_gw": ist["installierte_leistung_gw"],
        "zielpfade": ist["zielpfade"],
        "bedarfsprojektionen_twh": ist["bedarfsprojektionen_twh"],
        "netzkosten": ist.get("netzkosten"),
        "preise": ist.get("preise"),

        # ---------------- Teil B ------------------------------------------
        "lcoe_benchmarks": {
            "pv_freiflaeche": {
                "reference": tech_ee["pv_freiflaeche"]["lcoe_eur_mwh_reference"],
                "auction": tech_ee["pv_freiflaeche"]["auction_reality_check_eur_mwh"],
                "forecast_2045": tech_ee["pv_freiflaeche"]["lcoe_2045_forecast_eur_mwh"],
            },
            "wind_onshore": {
                "reference": tech_ee["wind_onshore"]["lcoe_eur_mwh_reference"],
                "auction": tech_ee["wind_onshore"]["auction_reality_check_eur_mwh"],
                "auction_cap": tech_ee["wind_onshore"]["auction_cap_2026_eur_mwh"],
                "irena_europe": tech_ee["wind_onshore"]["lcoe_eur_mwh_europe_irena"],
                "sensitivity_flh": tech_ee["wind_onshore"]["sensitivity_flh"],
                "full_load_hours_fleet": tech_ee["wind_onshore"]["full_load_hours_fleet"],
            },
            "wind_offshore": {
                "reference": tech_ee["wind_offshore"]["lcoe_eur_mwh_reference"],
                "lazard_2026": tech_ee["wind_offshore"]["lcoe_eur_mwh_lazard_2026"],
                "irena_europe": tech_ee["wind_offshore"]["lcoe_eur_mwh_europe_irena"],
                "auction": tech_ee["wind_offshore"]["auction_reality_check"],
            },
            "battery": {"lcos_lazard_2026": tech_ee["battery_grid_scale"]["lcos_eur_mwh_lazard_2026"]},
            "h2_turbine": {
                "new_plant": tech_ee["h2_rueckverstromung"]["lcoe_eur_mwh_new_h2_plant"],
                "gas_retrofit_2035": tech_ee["h2_rueckverstromung"]["lcoe_eur_mwh_gas_retrofit_2035"],
            },
            "gas_ccgt": {
                "de_new": tech_ee["ccgt_gas"]["lcoe_eur_mwh_de_new"],
                "incl_external": tech_ee["ccgt_gas"]["lcoe_eur_mwh_incl_external"],
                "gas_crisis_price": tech_ee["ccgt_gas"]["lcoe_eur_mwh_gas_crisis_price"],
            },
            "nuclear": {
                "third_party": kk["third_party_lcoe_crosscheck"],
                "resulting_range": kk["eu_new_build_model_parameters"]["resulting_lcoe_eur_mwh"],
            },
        },
        "nuclear_reference_projects": [
            {k: p.get(k) for k in ("id", "label", "country", "capacity_mw", "units",
                                   "capex_eur_kw", "cost_scope", "construction_years",
                                   "delay_years", "confidence", "note")}
            for p in kk["reference_projects"]
        ],
        "nuclear_capex_scenarios": kk["eu_new_build_model_parameters"]["capex_eur_kw"],
        "wacc_sensitivity": kk["wacc_sensitivity"],
        "construction_time": kk["construction_time"],

        # ---------------- Teil D ------------------------------------------
        "co2_intensitaet_g_pro_kwh": risk["co2_intensitaet_g_pro_kwh"],
        "co2_preis_szenarien": risk["co2_preis_szenarien"],
        "dunkelflaute": risk["dunkelflaute"],
        "versorgungssicherheit": risk["versorgungssicherheit"],
        "netz_und_systemkosten": risk["netz_und_systemkosten"],
        "lieferketten_konzentration": risk["lieferketten_konzentration"],
        "kernkraft_restrisiken": risk["kernkraft_restrisiken"],
        "kostenueberschreitung_faktoren": risk["kostenueberschreitung_faktoren"],

        # ---------------- GES-Fallstudie ----------------------------------
        "ges": {
            "reference": params["ges_reference"],
            "reconstruction": params["ges_scenario_reconstruction"],
            "bias_check": [
                {"technologie": "Photovoltaik", "richtung": "Kosten ueberschaetzt",
                 "ausmass": "+50 bis +150 %",
                 "effekt": "verteuert die EE-Szenarien",
                 "quelle": "docs/01_grundlage_ges_faktencheck.md 5.5"},
                {"technologie": "Wind on-/offshore (CAPEX)", "richtung": "keine systematische Verzerrung",
                 "ausmass": "-", "effekt": "neutral",
                 "quelle": "docs/01_grundlage_ges_faktencheck.md 5.5"},
                {"technologie": "Wind onshore (Volllaststunden)", "richtung": "Ertrag unterschaetzt",
                 "ausmass": "1.700 statt 2.400 h/a",
                 "effekt": "verteuert Windstrom um rund 30 %",
                 "quelle": "kosten_ee_speicher.md 1 (Befund 2) / 4"},
                {"technologie": "Kernkraft (CAPEX)", "richtung": "Kosten unterschaetzt",
                 "ausmass": "-50 bis -75 %",
                 "effekt": "verbilligt das Kostenminimum-Szenario",
                 "quelle": "docs/01_grundlage_ges_faktencheck.md 5.5"},
                {"technologie": "Kernkraft (Betriebskosten)", "richtung": "Kosten UEBERschaetzt",
                 "ausmass": "7 % CAPEX/a statt rund 165 EUR/kW/a",
                 "effekt": "verteuert Kernkraft - wirkt der CAPEX-Verzerrung entgegen",
                 "quelle": "kosten_kernkraft.md 4.2 / 8 (Satz 5)"},
                {"technologie": "H2-Round-Trip", "richtung": "realistisch konservativ angesetzt",
                 "ausmass": "30-40 % statt der oft unterstellten 50 %+",
                 "effekt": "spricht fuer die Studie",
                 "quelle": "kosten_ee_speicher.md 1 (Befund 5) / 7.3"},
            ],
            "system_level_estimate": params["ges_reference"]["system_level_estimate"],
        },

        # ---------------- Limitationen ------------------------------------
        "gaps": params["gaps"],
        "profiles_meta": params["profiles_meta"],
        "modelling_decisions": params["meta"]["modelling_decisions"],
        "sources": collect_sources(ee, kk),
    }

    with open(OUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)

    print(f"OK page_data.json geschrieben -> {os.path.relpath(OUT_PATH, BASE)}")
    print(f"   {len(out['sources'])} Quellen · "
          f"{len(out['nuclear_reference_projects'])} Kernkraft-Referenzprojekte · "
          f"{len(out['gaps'])} dokumentierte Luecken")


if __name__ == "__main__":
    main()
