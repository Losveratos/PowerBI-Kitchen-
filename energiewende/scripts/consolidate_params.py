#!/usr/bin/env python3
"""Fuehrt die Dossiers 00-10 und die Pruefberichte 01-10 zu einem geprueften
Parametersatz zusammen.

Eingaben (nur lesen):
  research/00_*.md ... 10_*.md            je ein ```json-Block (parameters, sources)
  research/pruefung/01_*.md ... 10_*.md   je ein ```json-Block (korrekturen)
                                          und die Pruefttabelle (Abschnitt 2)
  README.md, Tabelle "Entscheidungen"     (Festlegungen von Michael, 22.11.2026)

Ausgaben:
  data/model_params.json                  der maschinenlesbare Parametersatz
  research/konsolidierung.md              der Bericht (Zahlen, Korrekturen, Dopplungen, Luecken)

Optional: --hinweise setzt unter die Ueberschrift der Dossiers 01-10 eine
Hinweiszeile (idempotent, aendert sonst nichts).

Nur Standardbibliothek, deterministisch, kein Zeitstempel in der Ausgabe.
Aufruf:  python3 -I energiewende/scripts/consolidate_params.py
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent          # energiewende/
RESEARCH = BASE / "research"
PRUEF = RESEARCH / "pruefung"
OUT_JSON = BASE / "data" / "model_params.json"
OUT_MD = RESEARCH / "konsolidierung.md"

DOSSIERS = list(range(0, 11))
ENTSCHEIDUNG_QUELLE = "Entscheidung Michael 22.11.2026"
VALUE_KEYS = ("value", "min", "mid", "max")
RANG = {"A": 3, "B": 2, "C": 1}

# ---------------------------------------------------------------------------
# 1. Handgepflegte Tabellen (jede Zeile ist begruendet)
# ---------------------------------------------------------------------------

# 1a. Zusaetzliche Parameter, auf die sich EINE Korrektur ausdruecklich bezieht.
#     Die Begruendung steht im Text der Korrektur selbst (Spalte begruendung).
ZUSATZ_ZUORDNUNG = {
    (1, "uba_vorkette_pipeline_norwegen_g_gj"): [
        (1, "uba_vorkette_lng_usa_g_gj")],       # "gilt auch fuer uba_vorkette_lng_usa_g_gj"
    (6, "ntc_2040_2045_pfad_ab_gw"): [
        (6, "ntc_2045_pfad_c_gw"),
        (6, "ntc_bmwe_o45_strom_gw")],           # "gilt auch fuer ntc_2045_pfad_c_gw und ntc_bmwe_o45_strom_gw"
}

# 1b. Korrekturen ohne Parameter-ID, die trotzdem ein Parameter-Thema beruehren.
#     Sie werden NICHT angewendet, sondern als "nicht zugeordnet" ausgewiesen.
NICHT_ZUGEORDNET = {
    (4, "strom_2045_dena"):
        "Betrifft die dena-Werte 698/910 TWh. Parameter d04.strom_2045_alle_inkl_dena "
        "ist ein Sammelwert aus fuenf Quellen (dena nur als Untergrenze 910); die "
        "Korrektur hebt einen Einzelwert, nicht den Sammelwert an. Nicht geraten.",
    (8, "ptl_wirkungsgrad_kerosin_low"):
        "Betrifft die Modell-Spalte 'low' (eta 0,57 mit H2_je_Kraftstoff 1,35), also eine "
        "Setzung im Reglerbereich, nicht den Parameter d08.ptl_wirkungsgrad_kerosin "
        "(min 0,37 / mid 0,45 / max 0,57). Der Namensbestandteil passt, der Gegenstand nicht.",
    (8, "D_EF_setzung"):
        "Betrifft die Modell-Setzung D_EF (100/150/195 TWh). Der inhaltliche Kern (zweiter, "
        "niedrigerer Ariadne-Wert 51-128 TWh) ist ueber die Entscheidung E-Fuel-Menge in "
        "d08.efuel_bedarf_2045_ariadne_twh eingearbeitet; die Setzung selbst ist kein Parameter.",
    (2, "uba_kostensatz_mk40_eur_t"):
        "Neuer, primaer gelesener CO2-Kostensatz (Methodenkonvention 4.0, EUR2025) als Ersatz "
        "fuer d02.uba_kostensatz_2024_eur_t (C, nicht pruefbar). Gleiche Groesse, andere "
        "Konvention und Preisbasis; welche das Modell nutzt, ist offen (siehe Dopplungen).",
}

# 1c. Quellenzahl-Ausnahmen der Stufe A: die Pruefberichte nennen ausdruecklich
#     eine zweite, unabhaengige, primaer gelesene Quelle.
ZWEITE_QUELLE = {
    (4, "ist_pev_de_2024_eurostat_gae"): "Eurostat GAE 2.937,5 TWh und AGEB Tab. 2.1 (10.571 PJ = 2.936,4 TWh), Pruefbericht 04 Nr. 7",
    (4, "thg_ksg_ziel_2030"): "UBA-Seite, UBA-Hintergrundpapier und Expertenrat-Drs. 21/6175 S. 57, Pruefbericht 04 Nr. 23",
    (4, "ist_bruttostrom_2024"): "NEP-Kurzfassung (BDEW) und AGEB-Strerz 09/2026, Pruefbericht 04 Nr. 29",
    (4, "strom_ist_2017"): "WD 5-050-26 S. 10 und AGEB-Strerz 09/2026, Pruefbericht 04 Nr. 36",
    (4, "strom_ist_2024_bundesregierung"): "WD 5-050-26 S. 10 und AGEB-Strerz 09/2026, Pruefbericht 04 Nr. 37",
    (5, "elektrolyse_installiert_gw_2026"): "KfW 04.03.2026 und EWI-PM 20.01.2026, beide primaer gelesen, Pruefbericht 05 Abschn. 2.2",
    (5, "batterie_bestand_de_2026_11"): "Energy-Charts installed_power und KfW 555, Pruefbericht 05 Abschn. 2.2",
    (6, "eu_mindestkapazitaet_handel_pct"): "Szenariorahmen 2027 und ACER MMR 2025, Pruefbericht 06 (Korrektur)",
    (6, "de_netto_import_2023_twh"): "Energy-Charts cbet/cbpf und Eurostat nrg_cb_e, Pruefbericht 06 Abschn. 2.2",
    (6, "de_netto_import_2024_twh"): "Energy-Charts cbet/cbpf und Eurostat nrg_cb_e, Pruefbericht 06 Abschn. 2.2",
    (7, "de_importabhaengigkeit_gesamt_2024_pct"): "Eurostat nrg_ind_id und AGEB-Jahresbericht 2024, Pruefbericht 07 Abschn. 2.2",
    (7, "de_importabhaengigkeit_oel_2024_pct"): "Eurostat nrg_ind_id und AGEB-Jahresbericht 2024, Pruefbericht 07 Abschn. 2.2",
    (8, "h2_elektrolyse_ziel_2030_gw"): "DIHK/r2b, EWI und KfW (drei Herausgeber), Pruefbericht 08 Abschn. 2.2",
    (9, "ets1_cap_null_jahr_geltendes_recht"): "UBA-Rahmendaten S. 32 und R21 F-1, dazu Nachrechnung, Pruefbericht 09 KA7",
}

# 1d. Konfidenz-Ausnahmen: Die "neue Konfidenz" einer Korrektur gilt fuer die
#     korrigierte Aussage, nicht fuer den Parameter. (conf, primaer_gelesen)
KONF_AUSNAHME = {
    (2, "aurora_gesamtkosten_bio_eur"): (
        "C", False,
        "Die Konfidenz A/true der Korrektur gilt der Drucksache 21/903 (Urheberschaft der 172 Mrd. EUR/a), "
        "nicht der Aurora-Zahl; Pruefbericht 02 weist die Aurora-Zahl weiter als C/false aus."),
    (7, "eu_extra_import_china_anteil_pv_module_2025_pct"): (
        "B", True,
        "primaer_gelesen false der Korrektur gilt dem Zollkontext (Suchtreffer); der Wert 98,4 % ist am "
        "Comext-Original bestaetigt (Pruefbericht 07 K2)."),
}

# 1e. Pruefstatus aus Fliesstext ohne Tabellenzeile (Prosa der Pruefberichte)
PRUEFSTATUS_MANUELL = {
    (8, "kernnetz_reservierungen_gw"): ("bestätigt", "Pruefbericht 08 Abschn. 2.4 (Zeile 'kernnetz_laenge_km / _reservierungen_gw'): bestaetigt"),
    (8, "h2_preis_2040_eur_kg"): ("bestätigt", "Pruefbericht 08 Abschn. 2.4 (Zeile 'h2_grosshandel_eur_kg / h2_preis_2040'): bestaetigt"),
    (8, "lkw_wirkungsgrad_ptl_diesel"): ("bestätigt", "Pruefbericht 08 Abschn. 2.4 (Zeile 'lkw_wirkungsgrad_bev / _ptl_diesel'): bestaetigt"),
    (8, "model_lkw_h2_zusatz_elektrolyse_gw"): ("bestätigt", "Pruefbericht 08 Abschn. 2.4 (Zeile 'model_* (4 Parameter)'): bestaetigt (Rechnung)"),
    (8, "model_elektrolyse_h0_m0_gw"): ("bestätigt", "Pruefbericht 08 Abschn. 2.4 (Zeile 'model_* (4 Parameter)'): bestaetigt (Rechnung)"),
    (8, "model_strom_de_h0_m0_twh"): ("bestätigt", "Pruefbericht 08 Abschn. 2.4 (Zeile 'model_* (4 Parameter)'): bestaetigt (Rechnung)"),
    (10, "gas_ttf_2022_eur_mwh"): ("bestätigt", "Pruefbericht 10 Abschn. 2.4 (Fliesstext): KfW S. 1, bestaetigt"),
    (10, "de_energieintensive_produktion_niveau_pct_vorkrise"): ("bestätigt", "Pruefbericht 10 Abschn. 2.4 (Fliesstext): KfW S. 3, Wortlaut bestaetigt"),
    (10, "de_industrie_energieverbrauch_2025_pj"): ("bestätigt", "Pruefbericht 10 Abschn. 2.4 (Fliesstext): Destatis PM 400, bestaetigt"),
    (10, "kfw_klimainvest_brutto_pro_jahr_mrd_eur"): ("bestätigt", "Pruefbericht 10 Abschn. 2.4 (Fliesstext 'kfw_klimainvest_*'): bestaetigt"),
    (10, "kfw_klimainvest_mehrbedarf_pro_jahr_mrd_eur"): ("bestätigt", "Pruefbericht 10 Abschn. 2.4 (Fliesstext 'kfw_klimainvest_*'): bestaetigt"),
    (10, "r21_kosten_in_bip_vielfachen"): ("bestätigt", "Pruefbericht 10 Abschn. 2.4 (Fliesstext): nachgerechnet 2,21-3,05; R21 S. 12 bestaetigt"),
}

# 1f. Korrekturen mit Parameter-ID: was genau am Parameter geaendert wird.
#     Schluessel: (Dossier, id). Felder:
#       set     {feld: wert}   Werte-/Textfelder ersetzen
#       unset   [feld]         Felder entfernen
#       add     {feld: text}   Text an note/abgrenzung anhaengen
#       fund    str | (alt,neu) Fundstelle korrigieren (Tupel: Teilstring ersetzen)
#       konf    (conf, pg)     Konfidenz-Ausnahme (sonst: aus der Korrektur)
#       notiz   False          keine Wiedergabe von 'neu' als pruefnotiz
KORREKTUR_AKTIONEN = {
    # --- Dossier 01
    (1, "r21_zew_ersparnis_mrd_eur"): {
        "set": {"value": {"zew_studie_barwert_ohne_nationale_massnahmen": 824, "r21_zitat_nicht_in_studie": 850},
                "abgrenzung": "ZEW Rausch 2026: 824 Mrd. EUR = Barwert (1,5 % p. a.) 2028-2048, EU-27, Wohlfahrt ohne vermiedene "
                              "Klimaschaeden; Hebel 'nationale nicht-marktliche Massnahmen entfallen' zusaetzlich zur ESR-Flexibilisierung "
                              "(247 Mrd.); Gesamteffekt rund 1.071 Mrd.; 850 steht nicht in der Studie"},
        "unset": ["min", "max"], "notiz": False},
    (1, "r21_factsheet_a_batterie_bio_eur"): {},
    (1, "r21_ets_minderung_seit_2005_pct"): {},
    (1, "r21_factsheet_h_zuteilung_angegeben_t"): {},
    (1, "wendland_qc_preis_mischsystem_eur_mwh"): {"notiz": False},
    (1, "wendland_qc_preis_ee_system_eur_mwh"): {"notiz": False},
    (1, "uba_vorkette_pipeline_norwegen_g_gj"): {"fund": "UBA CC 21/2019, Druckseite 19 = PDF-Seite 22", "notiz": False},
    # --- Dossier 02
    (2, "aurora_gesamtkosten_bio_eur"): {},
    (2, "efruhr_ewi_netzinvestitionen_mrd_eur"): {
        "set": {"abgrenzung": "Investitionen ÜN 301 (NEP 2037/2045, Version 2023, 2. Entwurf) + VN 430/431; Kostenbasis 2024 ohne Inflation; "
                              "EWI nur Unterauftragnehmer, Auftraggeber Netze-Gesellschaft Südwest; nächster Kandidat für R21 '740 Mrd. EUR EWI'"},
        "fund": "ef.Ruhr/EWI 2024, PDF-S. 4, 7-8", "notiz": False},
    (2, "pwc_gesamtkosten_wwb_bio_eur"): {
        "set": {"abgrenzung": "13,3 Bio. EUR = 3,9 Investitionen + 9,4 Energiekosten, 'einheitlicher Betrachtungszeitraum bis 2050'; Energiekosten = "
                              "Energiebeschaffung, Netzentgelte, Umlagen und CO2-Bepreisung (also inklusive Transfers); Szenario Weiter-wie-bisher "
                              "verfehlt Klimaneutralität 2045; ohne Klimafolgekosten; PwC-Original nicht lesbar (Sekundärquelle DIW Wochenbericht 38+39/2025)"},
        "notiz": False},
    (2, "ise2024_differenzkosten_mrd_eur_pa"): {},
    (2, "nep2023_kostenanstieg_mrd_eur"): {},
    # --- Dossier 03
    (3, "abregelung_2023_offshore_onshore_gwh"): {
        "set": {"value": {"offshore": 5729, "onshore": 3980, "ee_gesamt": 10478, "ee_gesamt_2022": 8071}},
        "add": {"note": "Quelle SMARD, Netzengpassmanagement im Jahr 2023 (17.05.2024), im Original gelesen (nicht zfk)"}, "notiz": False},
    (3, "wind_offshore_vls_2015_2025"): {
        "add": {"note": "Minimum 2023 ist abregelungsgetrieben (Redispatch 24 % der Erzeugung; zurückgerechnet ca. 3.485 h). Spanne ist keine reine "
                        "Wetterspanne; 2015-2022 ohne Redispatch-Daten je Technologie"}, "notiz": False},
    (3, "pv_vls_gesamt_dc_2015_2025"): {
        "set": {"note": "Mit total_power (inkl. Eigenverbrauch) gerechnet; bezogen auf AC-Leistung rund 6-8 % höher. 2023-2025 (830/813/828 h) rund 12 % "
                        "unter 2015-2022 (Median 935 h), trotz sonnigem 2025; Ursache nicht belegt (marktbedingte Abregelung, Leistungsbuchung, "
                        "Anlagenausrichtung). Nicht als wetterbereinigt vergleichbar verwenden"},
        "notiz": False},
    (3, "dunkelflaute_laengste_phase_unter_5pct_h"): {
        "set": {"value": {"min": 18, "mid": 43, "max": 80}}, "notiz": False},
    (3, "dunkelflaute_laengste_phase_unter_10pct_h"): {
        "add": {"note": "Mit gleitendem 24-h-Mittel < 10 %: 108-312 h je Jahr (max. 01.-13.11.2024); mit Jahresend-Leistung 2023: 170 h; mit Leistungsmix "
                        "2025: 172 h. Nicht als Dauer einer Dunkelflaute für die Speicherauslegung verwenden"}, "notiz": False},
    # --- Dossier 04
    (4, "ist_pev_de_2025_ageb_pj"): {
        "set": {"value": 10628,
                "note": "Revision: Jahresbericht 2025 nannte 10.530 PJ (-0,4 %); AGEB-Auswertungstabellen 09/2026: 10.628 PJ (+0,5 % gegen 2024: 10.571 PJ)"},
        "fund": "AGEB, Auswertungstabellen zur Energiebilanz Deutschland, Stand 09/2026, Tab. 2.1 (PDF S. 10)", "notiz": False},
    (4, "ist_eev_de_2024_ageb_abgeleitet"): {
        "set": {"value": 2261.4,
                "note": "AGEB Tab. 2.2: 8.141 PJ = 2.261,4 TWh, direkt belegt; die frühere Ableitung 607,6 / 0,269 = 2.259 weicht um -0,1 % ab"},
        "fund": "AGEB, Auswertungstabellen 09/2026, Tab. 2.2 (PDF S. 11)", "notiz": False},
    (4, "ist_verkehr_lkw_bus_rest_2024"): {
        "set": {"value": 214.7,
                "note": "AGEB Tab. 6.8: Güterverkehr 733 PJ = 203,6 TWh + ÖPNV 40 PJ = 11,1 TWh; die frühere Restrechnung (Eurostat Straße minus Pkw = 142) mischte Inländerfahrleistung mit Inlandsabsatz"},
        "fund": "AGEB, Auswertungstabellen 09/2026, Tab. 6.8 (PDF S. 27)", "notiz": False},
    (4, "ist_verkehr_pkw_2024"): {
        "set": {"value": 351.4,
                "note": "AGEB Tab. 6.8: motorisierter Individualverkehr 1.265 PJ (inkl. Biokraftstoffe und Strom); die frühere Rechnung Liter x Heizwert (407,0) liegt 15,8 % darüber"},
        "fund": "AGEB, Auswertungstabellen 09/2026, Tab. 6.8", "notiz": False},
    (4, "strom_ist_2017"): {
        "add": {"note": "Größe mit Pumpspeicher (AGEB 601,9 mit / 595,9 ohne); 522 (2024) ist ohne Pumpspeicher; konsistenter Rückgang -12,0 % statt -13,3 %"},
        "notiz": False},
    (4, "jaz_bestand_luft_wasser"): {"notiz": False},
    (4, "epkw_verbrauch_real"): {
        "set": {"note": "18 kWh/100 km Realverbrauch (UBA TEXTE 160/2022, 15 % über WLTP); Ladeverluste 17,5 % (Spanne 10-26 %) gesondert ausgewiesen, nicht eindeutig "
                        "enthalten; UBA-FAQ setzt 10 % Ladeverlust; ISE-Annahme 18; ADAC-Spanne 13,4-29,7 (Suchtreffer)"},
        "notiz": False},
    (4, "h2_2045_dena"): {"fund": "EWI-Zusammenfassung dena-Leitstudie 10/2021, PDF S. 7", "notiz": False},
    (4, "strom_2030_lfs3"): {},
    # --- Dossier 05
    (5, "netzengpass_kosten_mio_eur"): {"set_value_keys": {"2019": 1279.0, "2020": 1432.4, "2021": 2285.6},
                                         "add": {"abgrenzung": "2019-2021 korrigiert: das Dossier hatte die GWh-Spalte 'Anpassungen von Stromeinspeisung' zu den Kosten addiert"},
                                         "notiz": False},
    (5, "dez2024_reserven_gw"): {
        "set": {"value": {"markt_06_11_2024": 4.5, "markt_12_12_2024": 3.4, "reserven_min": 12, "reserven_max": 13}}, "notiz": False},
    (5, "df_wind_laengste_phase_h"): {"notiz": False},
    (5, "df_ereignisse_ge10h_2016_2025"): {},
    (5, "df_ereignisse_ge48h_pro_jahr"): {},
    (5, "negative_preisstunden"): {"notiz": False},
    (5, "vsm2025_zusatzbedarf_steuerbar_2035_gw"): {"notiz": False},
    (5, "elektrolyse_installiert_gw_2026"): {"notiz": False,
        "add": {"abgrenzung": "EWI-PM 20.01.2026 (primär gelesen): 181 MW"}},
    (5, "ldes_bedarf_europa_twh"): {
        "add": {"abgrenzung": "Werte im Autorenvortrag (Kittel, dena, 22.09.2025, Folie 13) bestätigt; '7 % Jahresverbrauch' dort nicht genannt, Paper nicht gelesen"},
        "notiz": False},
    (5, "df_europa_extrem_1996_97_tage"): {},
    (5, "agora_speicher_ausspeisung_2045_gw"): {
        "set": {"abgrenzung": "Großspeicher und Heimspeicher (Fußnote *); E-Mobilität getrennt ausgewiesen (nicht 'inkl. V2G'); WP+E-Auto über 1 Woche zusammen 2,6 GW"},
        "notiz": False},
    (5, "fa_v3_h2_turbine_kaverne_mrd_eur"): {},
    (5, "fa_v4_stromvkg_mrd_eur_pro_jahr"): {},
    (5, "df_5d_luecke_ziel2030_twh"): {},
    (5, "batterie_capex_pvffa_eur_kwh"): {},
    # --- Dossier 06
    (6, "acer_70pct_core_wohlfahrt_mio_eur"): {
        "set": {"note": "Gesamtnutzen der 70-%-Regel in der Core-Region 2024 (mindestens), davon 240 Mio. EUR 2024 realisiert, 340 Mio. EUR offen; "
                        "Region, nicht Deutschland; EU-Engpasskosten 2024: 4,3 Mrd. EUR für 60 TWh"},
        "notiz": False},
    (6, "nep_nettoimport_2037_a_twh"): {"fund": ("Kap. 3.2.1, S. 68", "Kap. 3.1, S. 69"), "notiz": False},
    (6, "nep_nettoimport_2045_twh"): {"fund": "Kap. 3, Zusammenfassung S. 67; Kap. 3.1, S. 69", "notiz": False},
    (6, "nep_handelstransit_2045_twh"): {"fund": ("S. 71", "S. 72"), "notiz": False},
    (6, "ntc_2040_2045_pfad_ab_gw"): {"fund": ("S. 121", "S. 122"), "notiz": False},
    (6, "eu_mindestkapazitaet_handel_pct"): {},
    (6, "eu_klimaziel_2040_pct"): {
        "set": {"note": "90 % netto ggü. 1990, davon 85 % heimisch und bis zu 5 % internationale Gutschriften (Annahme März 2026); 'ab 2036' nicht wörtlich bestätigt "
                        "(Kommission: 'second part of 2030-2040'); Gutschriften nicht im ETS 1 anrechenbar"},
        "notiz": False},
    (6, "fr_kernkraft_winter_mittel_gw"): {
        "set": {"unit": "GW (Jan+Feb+Dez desselben Kalenderjahres)",
                "note": "eigene Rechnung; 2023: 42,0 GW (Min 23,7), 2024: 47,1 GW (Min 31,8); installiert 2023 61,4 GW, 2024 63,0 GW"},
        "notiz": False},
    (6, "importpreis_2024_eur_mwh"): {
        "add": {"note": "Exportpreis ohne Luxemburg 57,4 / 79,8 / 69,0 (2024/2023/2025); mit Luxemburg 60,0 / 81,7 / 71,4 EUR/MWh"}, "notiz": False},
    (6, "gleichzeitige_flaute_stunden"): {"fund": ("2.380", "2.382"), "notiz": False},
    # --- Dossier 07
    (7, "stresstest_kostenaufschlag_grossanlage_pct"): {
        "set": {"value": 10.3, "min": 2.9, "mid": 10.3, "max": 21.8},
        "add": {"note": "korrigiert: konsistente Basis 8,7 ct/Wp x (Faktor - 1) / 75,8 ct/Wp (vorher 7,5 / 27 / 57 mit uneinheitlicher Modulkostenbasis)"},
        "notiz": False},
    (7, "stresstest_modulpreisfaktor"): {},
    (7, "de_import_china_energiewendegueter_2025_mio_eur"): {
        "set": {"value": 11748,
                "note": "Setzung (M) bei Produktauswahl; Größenordnung, keine Obergrenze: Ware chinesischen Ursprungs über NL/BE fehlt, Nicht-Energiewende-Verwendung (Akkus, Stromrichter) ist enthalten, "
                        "die Richtung des Fehlers ist offen. Akkus allein 9625"},
        "notiz": False},
    (7, "hhi_de_rohoel_import_2021"): {"set": {"value": 1878}, "notiz": False},
    (7, "de_fossile_nettoimportrechnung_mrd_eur"): {"fund": "AGEB Jahresbericht 2024, Tabelle 3, gedruckt S. 10 (PDF-S. 12)", "notiz": False},
    (7, "de_importabhaengigkeit_gas_2024_pct"): {
        "konf": ("B", True,
                 "A gilt nur für 'über 90 %'; der Punktwert hängt von der Methode ab (Eurostat 91,6 gegen AGEB-Importquote 95,6): Punktwert B"),
        "set": {"spanne": {"min": 91.6, "max": 95.6}}, "notiz": False},
    (7, "de_importabhaengigkeit_gesamt_2024_pct"): {
        "set": {"spanne": {"min": 66.8, "max": 68}}, "notiz": False},
    (7, "de_russland_anteil_steinkohleimport_2021_pct"): {
        "set": {"value": 52.6, "unit": "% der Steinkohle-Einfuhr (t), Eurostat C0100",
                "note": "2022: 29,0; 2023: 1,7; 2024: 0,5; 50,1 gilt nur für 'feste fossile Brennstoffe' (C0000X0350-0370); Tabelle und JSON hatten zwei Abgrenzungen unter einer ID"},
        "notiz": False},
    (7, "eu_extra_import_china_anteil_trafo_gt10mva_2025_pct"): {
        "set": {"value": 54.6,
                "note": "Reihe 2015 18,5 / 2019 9,3 / 2021 29,9 / 2023 50,7 / 2024 41,5 / 2025 54,6 (2019 ist ein Tiefpunkt); HS 850422: 1 % (2019) auf 43 % (2025)"},
        "notiz": False},
    (7, "eu_extra_import_china_anteil_pv_module_2025_pct"): {
        "add": {"note": "Gegenposition: 2013 bis 03.09.2018 EU-Antidumping-/Ausgleichszölle mit Mindestimportpreis, Startwert 2015 dadurch gedrückt (Suchtreffer); Mengenanteil 46,8 -> 99,3 %"},
        "notiz": False},
    (7, "nzia_eigenfertigung_ziel_2030_pct"): {
        "add": {"note": "indikativer Richtwert ('approaches or reaches at least 40 % of annual deployment needs'), nicht bindend"}, "notiz": False},
    (7, "pv_modulkapazitaet_ausserhalb_china_gw"): {
        "add": {"note": "Ablesung ca. 184 inkl. JP/KR 7 und LatAm 4; dazu Zellen SO-Asien ca. 45 GW, Wafer ca. 15 GW, EU-Polysilizium ca. 30 GW im Betrieb"},
        "notiz": False},
    # --- Dossier 08
    (8, "ekerosin_kosten_easa_eur_t"): {
        "set": {"max": 9405,
                "note": "Produktionskosten ohne Gewinn; Erstanlagen (FOAK), gewichtetes Mittel 2024; ca. 6,2 EUR/l; Obergrenze 9.405 laut Suchtreffer (nicht primär); Faktor 3 über den Modellwerten erklärt sich weitgehend durch Zeitpunkt und Reifegrad"},
        "notiz": False},
    (8, "kerosin_fossil_eur_t"): {
        "set": {"max": 720,
                "note": "ohne CO2-Preis und Steuern; 2014-2021 280-720; 600 = 2021 (Sept. 2021, S. 35); 816 (EASA 2023, Suchtreffer, C/false) getrennt geführt"},
        "fund": "UBA/LBST 2022, S. 27 (280-720), S. 35 (600 EUR/t, Sept. 2021)", "notiz": False},
    (8, "model_lkw_h2_zusatz_strom_twh"): {},
    (8, "elektrolyse_wirkungsgrad"): {
        "set": {"note": "UBA 67/69/72 % (2015/2030/2050) gelten für alkalische Elektrolyse (PEM: 67/71/80 %); 0,64 Setzung (M) Teillast"}, "notiz": False},
    (8, "lkw_bestand_2023_tsd"): {"fund": ("S. 46", "S. 38"), "notiz": False},
    (8, "pkw_strombedarf_fcev_gegen_bev"): {
        "fund": ("Frage 2", "Frage 5"),
        "add": {"note": "UBA nennt die Spanne zwei- bis dreimal"}, "notiz": False},
    (8, "elektrolyse_capex_de_eur_kw"): {"fund": "DIHK/r2b 2026, S. 28 (2.000-3.000); 2.200 EUR/kW auf S. 29 (Parameter zu Abb. 3-2)", "notiz": False},
    (8, "refueleu_synth_quote"): {},
    # --- Dossier 09
    (9, "kkw_reakt_leistung_gw"): {
        "set": {"value": {"min": 0, "mid": 2.7, "max": 6.8}}, "notiz": False},
    (9, "eua_preis_nov2026_eur_t"): {
        "set": {"value": {"min": 81, "mid": 88, "max": 91}}, "notiz": False},
    (9, "ets1_cap_null_jahr_geltendes_recht"): {
        "add": {"note": "inkl. Seeverkehr erst 2040 null (2039 noch ca. 75 Mio.)"}, "notiz": False},
    (9, "ets1_lrf_vorschlag_pct"): {
        "add": {"note": "'2,7 % ohne internationale Gutschriften' steht in der Pressemitteilung IP/26/1596 nicht (dort bis zu 2 % Gutschriften)"}, "notiz": False},
    (9, "darlington_smr1_budget_mrd_cad"): {
        "add": {"note": "7,7 Mrd. CAD schließen gemeinsame Infrastruktur für vier Blöcke ein; Gesamtbudget 20,9 Mrd. CAD"}, "notiz": False},
    (9, "ccs_mehrkosten_braunkohle_eur_mwh"): {
        "set": {"value": {"min": 169, "max": 338}},
        "add": {"note": "Rechenfehler korrigiert: 1,0 t/MWh x 1,25 x 0,90 = 1,125 t/MWh (nicht 1,15)"}, "notiz": False},
    (9, "epr2_kosten_mrd_eur2020"): {
        "add": {"note": "Obergrenze: zu heutigen Preisen ca. 85 Mrd. EUR, mit Finanzierung > 100 Mrd. EUR (Cour des comptes), also ca. 8.500 bzw. > 10.000 EUR/kW"},
        "notiz": False},
    (9, "r21_ets_minderung_seit_2005_pct"): {
        "set": {"note": "interne Spannung; S. 15 ähnelt der Kommissionsaussage -39 %/+71 % (1990-2024), 'wörtlich' ist zu stark; Kommission nennt für ETS-Sektoren -50 % seit 2005 "
                        "(IP/26/1596); R21 D-4 (51 %) ist durch die Kommission gedeckt"},
        "notiz": False},
    (9, "kkw_reakt_bundesregierung_gespraeche"): {"notiz": False},
    (9, "msr_loeschschwelle_mio"): {"notiz": False},
    (9, "schiefergas_vs_uslng_einsparung_vollkette_pct"): {
        "set": {"value": {"min": 6, "mid": 15, "max": 22}}, "notiz": False},
    # --- Dossier 10
    (10, "de_industriestrom_id_2026s1_ct_kwh"): {"notiz": False},
    (10, "de_haushaltsstrom_2026s1_ct_kwh"): {"notiz": False},
    (10, "de_industriegas_i3_2026s1_ct_kwh"): {"notiz": False},
    (10, "de_strompreis_haushalt_beschaffung_2019_2023_2025_ct"): {
        "set": {"value": {"v2019": 5.81, "v2023": 19.92, "v2025": 14.81},
                "note": "Zeitreihe 2019 / 2023 / 2025 (vorher als min/mid/max geführt, mid > max)"},
        "unset": ["min", "mid", "max"], "notiz": False},
    (10, "de_strompreis_haushalt_netz_2019_2025_ct"): {"notiz": False},
    (10, "de_strompreis_haushalt_eeg_position_2021_2025_ct"): {
        "set": {"value": {"v2021": 6.75, "v2025": 0.28},
                "note": "EEG-Umlage entfiel Juli 2022; Kosten im Bundeshaushalt; Zeitreihe 2021 / 2025 (vorher als min/max geführt, min > max)"},
        "unset": ["min", "max"], "notiz": False},
    (10, "eeg_bundeszuschuss_2025_mrd_eur"): {
        "set": {"value": 16.53,
                "note": "Prognose 2025 16,53 (ÜNB, Drs. 20/14522 S. 2); Haushaltsansatz 2025 und 2026 je 17,2 Mrd. EUR, ab 2025 im Kernhaushalt (Drs. 21/601 S. 29); "
                        "Ist 2024 18,49 Mrd. EUR bei Ansatz 10,60 (Drs. 20/14522 S. 1); 21,985 nicht belegt; Ist 2025 nur Fachpresse; Netzbetreiber-Prognose 2026 12,4 (nicht prüfbar)"},
        "notiz": False},
}

# 1g. Ausdruecklich als Text eingeordnete Korrekturen ohne Parameter-ID tragen
#     keinen Eintrag hier: Alles, was weder in 1f noch in 1b steht, ist Text.

# ---------------------------------------------------------------------------
# 2. Entscheidungen von Michael (README, Tabelle "Entscheidungen")
# ---------------------------------------------------------------------------
ENTSCHEIDUNGEN = [
    {"id": "E01", "thema": "Gaspreis-Regler",
     "text": "20 / 35 / 85 EUR/MWh (min / mid / max), Vorschlag aus Dossier 09, bestätigt.",
     "betrifft": ["d09.modell_gaspreis_2030_2045_eur_mwh"],
     "hinweis": "Setzung, keine Messgröße. Der Regler-Höchstwert 85 liegt unter dem TTF-Stand November 2026 (85,5-88,5, d09.preis_ttf_nov2026_eur_mwh); der obere Rand deckt den heutigen Preis also nicht ab."},
    {"id": "E02", "thema": "Kernkraft-Neubaukosten",
     "text": "Spanne aus gebauten Projekten 7.500 / 12.000 / 17.500 EUR/kW, daneben das Szenario 'R21 wie veröffentlicht' mit 6.250 EUR/kW.",
     "betrifft": ["d09.neubau_de_capex_eur_kw", "d09.r21_fsb_neubau_capex_eur_kw"],
     "hinweis": "6.250 EUR/kW ist 310 Mrd. EUR / 49,6 GW aus Factsheet B; Preisbasis und Finanzierung im R21-Papier nicht angegeben."},
    {"id": "E03", "thema": "Kernkraft-Reaktivierung",
     "text": "Mitte 2,7 GW (Isar 2 und Emsland), oberes Ende rund 12 GW laut Radiant-Gutachten, solange es nicht im Original gelesen ist.",
     "betrifft": ["d09.kkw_reakt_leistung_gw"],
     "hinweis": "12 GW: Radiant, nicht primär gelesen (Wiedergabe der AfD-Fraktion in Drs. 21/7609 S. 1 und 21/6126 S. 4)."},
    {"id": "E04", "thema": "Wasserstoff-Lkw-Verhältnis (Setzungen Wasserstoff)",
     "text": "UBA-Wert als Mitte, die bisherige Setzung als oberes Ende der Bandbreite.",
     "betrifft": ["d08.model_lkw_h2_zusatz_strom_twh", "d08.model_lkw_h2_zusatz_elektrolyse_gw"],
     "hinweis": "Verhältnis FCEV/BEV im Strombedarf: UBA 2,35 (73 % / 31 %), bisherige Setzung 2,65. Mit dem UBA-Verhältnis sinkt der Zusatzstrom von 140 auf 115 TWh. Die Spalten low (75) und high (214) und die GW-Werte sind nicht neu gerechnet."},
    {"id": "E05", "thema": "E-Fuel-Menge",
     "text": "Den niedrigeren Ariadne-Wert aufnehmen.",
     "betrifft": ["d08.efuel_bedarf_2045_ariadne_twh"],
     "hinweis": "Ariadne nennt zwei Werte: 51-128 TWh (PDF-S. 23, nichtelektrisch, Schiff und Flug) und 180-195 TWh (PDF-S. 29, synthetisch und biogen). Das Modell nutzte nur den hohen."},
    {"id": "E06", "thema": "Solarleistung",
     "text": "Einheitlich gegen die Modulleistung (DC), wie in den Stundenprofilen.",
     "betrifft": ["d03.pv_vls_gesamt_dc_2015_2025", "d03.pv_vls_oeffentlich_dc_2015_2025", "d07.de_pv_bestand_gwp_2025", "d07.de_pv_ersatzbedarf_gwp_pro_jahr"],
     "hinweis": "Bezogen auf AC-Leistung wären die Volllaststunden rund 6-8 % höher (d03). Quellen, die AC-Leistung nennen, sind vor der Verwendung umzurechnen."},
    {"id": "E07", "thema": "Führende Energiebilanz",
     "text": "AG Energiebilanzen führend; Eurostat als Abgleich und für internationale Vergleiche.",
     "betrifft": "AUTO:d04_bilanz",
     "hinweis": "Bei AGEB-Werten (Dossier 04) gilt der AGEB-Wert; die Eurostat-Reihen bleiben als Abgleich stehen. Abweichungen bei Endenergie: Eurostat 2.067,2 TWh (ohne int. Luft/See) gegen AGEB 2.261,4 TWh."},
    {"id": "E08", "thema": "Dunkelflauten-Definition",
     "text": "Ereignisse über das Tagesmittel, Speicherbedarf über die Energielücke; das strenge Stundenkriterium als günstigste Lesart daneben.",
     "betrifft": ["d03.dunkelflaute_laengste_phase_unter_5pct_h", "d03.dunkelflaute_laengste_phase_unter_10pct_h",
                  "d05.df_wind_laengste_phase_h", "d05.df_ereignisse_ge10h_2016_2025", "d05.df_ereignisse_ge48h_pro_jahr",
                  "d05.df_5d_luecke_ziel2030_twh", "d05.df_5d_anteil_windpv_an_last", "d05.df_5d_winterlastfaktor"],
     "hinweis": "OFFEN: Die Ereigniszahlen in d05 beruhen auf dem 6-h-Mittel, die Phasen in d03 auf dem Stundenkriterium; nach der Entscheidung sind sie mit dem 24-h-Mittel neu auszuzählen (d03: 108-312 h je Jahr, max. 01.-13.11.2024)."},
    {"id": "E09", "thema": "Stresstest China",
     "text": "Zwei Stufen getrennt: erst die Rückkehr vom Überkapazitätspreis auf den Mindestpreis, dann der Aufschlag für Ware außerhalb Chinas.",
     "betrifft": ["d07.stresstest_modulpreisfaktor", "d07.stresstest_kostenaufschlag_grossanlage_pct"],
     "hinweis": "Stufe 1: 15,9 / 8,7 = 1,83. Stufe 2 gegen den China-Mindestpreis: Südostasien 1,04, EU skaliert 1,60. Die Kostenanteile je Stufe sind aus der Formel des Prüfberichts 07 abgeleitet (Setzung M)."},
    {"id": "E10", "thema": "ZEW-Zahl",
     "text": "Die Reihe nennt die 824 Mrd. EUR aus der Studie, mit Hinweis auf deren Uneinheitlichkeit; keine eigene 'richtige' Zahl.",
     "betrifft": ["d01.r21_zew_ersparnis_mrd_eur"],
     "hinweis": "824 ist ein Barwert (1,5 % p. a.) für EU-27 ohne vermiedene Klimaschäden; R21 nennt zusätzlich 850, das in der Studie nicht steht."},
    {"id": "E11", "thema": "PwC-Studie und ifo-Gastbeitrag",
     "text": "'später': Teil 1 weist bis dahin offen aus, dass beide Originale nicht gelesen wurden.",
     "betrifft": ["d02.pwc_gesamtkosten_wwb_bio_eur", "d02.pwc_gesamtkosten_beschleunigt_bio_eur", "d02.pittel_henning_mehrkosten_bis2050_mrd_eur"],
     "hinweis": "Beide bleiben C und primaer_gelesen false."},
]

# ---------------------------------------------------------------------------
# 3. Dopplungen: dieselbe Groesse in mehreren Dossiers (kein Sieger gewaehlt)
# ---------------------------------------------------------------------------
DOPPLUNGEN = [
    {"groesse": "BIP Deutschland", "urteil": "WIDERSPRUCH",
     "ids": ["d01.wb_bip_de_2025_bio_eur", "d10.de_bip_nominal_2025_mrd_eur", "d02.bip_de_2024_mrd_eur", "d10.r21_kosten_in_bip_vielfachen"],
     "text": "Für 2025 stehen 4,47 Bio. EUR (Weltbank, NY.GDP.MKTP.CN) und 4,5297 Bio. EUR (Eurostat, Stand 11.11.2026): 1,3 % Abstand durch Quelle und Revisionsstand. "
             "Dossier 02 rechnet mit BIP 2024 (4.386,94), Dossier 10 teilt durch 4,53, Prüfbericht 01 rechnet mit 4,47. Welche Basis gilt, ist offen."},
    {"groesse": "Strombedarf 2045 (NEP)", "urteil": "ABGRENZUNG",
     "ids": ["d04.strom_2045_nep", "d05.nep2045_nettostromverbrauch_twh", "d04.strom_2045_studien"],
     "text": "d04 nennt 989-1.294 TWh (Kurzfassung S. 5; der Prüfbericht 04, Nr. 30, setzt sie gegen den Bruttostromverbrauch 2024), d05 nennt 868,7-1.195,1 TWh als Nettostromverbrauch (Tab. 1) aus demselben NEP. Ob beide dieselbe Größe meinen, ist nicht belegt; die Untergrenzen liegen 120 TWh auseinander. Das Modell muss eine festlegen."},
    {"groesse": "Bruttostromverbrauch 2024", "urteil": "ABGRENZUNG",
     "ids": ["d04.ist_bruttostrom_2024", "d04.strom_ist_2024_bundesregierung", "d03.last_netzlast_2024_twh"],
     "text": "518 (NEP/BDEW), 522 (Bundesregierung/WD; AGEB 523,1 ohne und 529,4 mit Pumpspeicher) und Netzlast 465,5 TWh messen verschiedene Größen. Bei 518 gegen 522 ist es dieselbe Größe mit 4 TWh Abstand."},
    {"groesse": "Elektrolyse-Bestand 2026 und 2030", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d05.elektrolyse_installiert_gw_2026", "d08.h2_elektrolyse_in_betrieb_gw", "d05.elektrolyse_2030_konservativ_gw",
             "d08.h2_elektrolyse_2030_realistisch_gw", "d08.h2_elektrolyse_ziel_2030_gw"],
     "text": "0,2 GW gegen 0,1805 GW ist Rundung (EWI 181 MW). Die konservative Schätzung 2030 (2,4 GW) ist die Untergrenze der 'realistischen' Spanne (2,4-6,6); das Ziel 10 GW bleibt Ziel."},
    {"groesse": "Wirkungsgrad Elektrolyse", "urteil": "WIDERSPRUCH",
     "ids": ["d04.elektrolyse_wirkungsgrad", "d08.elektrolyse_wirkungsgrad"],
     "text": "Gleiche ID in zwei Dossiers: d04 min 0,60 / mid 0,70 / max 0,75 (NEP, UBA-FAQ), d08 min 0,64 / mid 0,70 / max 0,75 (UBA TEXTE 68/2020, 0,64 Setzung M Teillast). Nur die Untergrenze weicht ab; kein Prüfbericht legt sie fest."},
    {"groesse": "Netzinvestitionen und Netzkosten", "urteil": "ABGRENZUNG",
     "ids": ["d02.efruhr_ewi_netzinvestitionen_mrd_eur", "d02.dena_ewi_netzinvestitionen_mrd_eur", "d02.nep2023_kostenanstieg_mrd_eur",
             "d02.nep2025_uen_investitionen_mrd_eur", "d01.planb_netzkosten_2025_2049_bio_eur", "d02.dihk_netzkosten_2025_2049_bio_eur",
             "d01.r21_netzkosten_dihk_zitat_mrd_eur"],
     "text": "732 (ÜN+VN, 2024er Basis), 345 (nur Leitungen), 440 bzw. 365-392 (nur ÜN), 1,2 Bio. EUR (CAPEX und OPEX, 2025-2049) sind verschiedene Größen. d01 und d02 nennen die 1,2 Bio. übereinstimmend. "
             "Die 2.100 Mrd. EUR im R21-Papier sind laut Prüfbericht 01 (K2) die Gesamtsystemkosten 2025-2034 der DIHK, keine Netzkosten."},
    {"groesse": "Redispatch und Abregelung Erneuerbarer", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d03.abregelung_redispatch_ee_2024_gwh", "d03.abregelung_redispatch_ee_2025_gwh", "d03.abregelung_2023_offshore_onshore_gwh", "d05.ee_abregelung_gwh"],
     "text": "2024 (9.389) und 2025 (9.379) stimmen überein. Für 2023 steht 10.478 GWh (d03, SMARD-Original) gegen 10.479 (d05): 1 GWh Rundung."},
    {"groesse": "EUA-Preis (CO₂-Preis ETS 1)", "urteil": "WIDERSPRUCH",
     "ids": ["d06.eua_dez_2026_eur_t", "d09.eua_preis_nov2026_eur_t"],
     "text": "d06: 74 / 82,4 / 88,3 EUR/t (letzter Wert 12.10.2026); d09: 81 / 88 / 91 EUR/t (nach Prüfung, Mitte November). Beide C und nicht primär; verschiedene Stichtage, kein Primärbeleg."},
    {"groesse": "CO₂-Kostensatz (UBA)", "urteil": "ABGRENZUNG",
     "ids": ["d02.uba_kostensatz_2024_eur_t", "d02.uba_kostensatz_2021_eur_t", "d09.uba_klimakosten_1pct_eur2025_t", "d09.uba_klimakosten_0pct_eur2025_t"],
     "text": "300/880 EUR2024 (Konvention 3.2, C, nicht prüfbar), 201 EUR2021, gegen 345/990 EUR2025 (Konvention 4.0, B, primär gelesen): verschiedene Konventionen und Preisbasen. Offen, welcher Satz ins Modell geht (nicht zugeordnete Korrektur d02.uba_kostensatz_mk40_eur_t)."},
    {"groesse": "ETS-Minderung seit 2005 (R21-Zitate)", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d01.r21_ets_minderung_seit_2005_pct", "d09.r21_ets_minderung_seit_2005_pct"],
     "text": "40 / 47 / 51 % (S. 15, F-1, D-4) in beiden Dossiers gleich; Referenz der Kommission rund -50 % (2005-2024)."},
    {"groesse": "ZEW-Ersparnis", "urteil": "ABGRENZUNG",
     "ids": ["d01.r21_zew_ersparnis_mrd_eur", "d09.r21_zew_ersparnis_mrd_eur"],
     "text": "d09 gibt R21 wieder (D-5: 850, S. 20: 824), d01 nach Prüfung die Studie (824; 850 steht dort nirgends). Entscheidung E10: die 824 mit Hinweis nennen."},
    {"groesse": "KfW-Klimainvestitionen (Prognos 2026)", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d02.kfw2026_ksi_brutto_bio_eur", "d02.kfw2026_ksi_netto_mrd_eur_pa", "d02.kfw2026_netto_zuwachs_mrd_eur_pa",
             "d10.kfw_klimainvest_brutto_pro_jahr_mrd_eur", "d10.kfw_klimainvest_mehrbedarf_pro_jahr_mrd_eur"],
     "text": "6,0 Bio. EUR über 21 Jahre entsprechen 285 Mrd. EUR/a (d10 mid), netto 145 (d02) gegen 144 (d10 mid): gleiche Studie, gleiche Größenordnung, Rundung. 'Netto' (145) und 'Zuwachs' (65) sind verschiedene Größen."},
    {"groesse": "Batteriekosten", "urteil": "ABGRENZUNG",
     "ids": ["d01.r21_factsheet_a_batterie_bio_eur", "d05.r21_fa_kosten_mrd_eur", "d05.bischof_speicher_gwh", "d05.batterie_capex_pvffa_eur_kwh"],
     "text": "R21 und Bischof rechnen mit 200 EUR/kWh (7,12 TWh = 1,4 Bio. EUR; 112 Mrd. EUR / 560 GWh); ISE 2024 nennt 400-600 EUR/kWh (PV-gekoppelt, > 1 MWp, 2024), 225-473 (2035), 130-400 (2045). "
             "Prüfbericht 05 (3.5): Die Differenz ist eine Abgrenzungsfrage (Baujahr, Größe, Dauer, Kapazitätsbegriff); keine Zahl gilt für 120-h-Systeme."},
    {"groesse": "R21 Factsheet A (Speicher)", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d00.r21_factsheet_a_batterie_bio_eur", "d01.r21_factsheet_a_batterie_bio_eur", "d01.r21_factsheet_a_speicher_twh", "d05.r21_fa_speicher_twh"],
     "text": "1,4 Bio. EUR und 7,12 TWh in allen Fassungen gleich (exakt 1,425 Bio. EUR, 7,123 TWh)."},
    {"groesse": "Gasbilanz 2025 (BNetzA)", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d01.bnetza_gasverbrauch_2025_twh", "d09.gas_verbrauch_de_2025_twh", "d01.bnetza_lng_import_2025_twh", "d09.lng_import_de_2025_twh",
             "d01.bnetza_gasfoerderung_inland_2025_twh", "d09.gas_foerderung_de_2025_twh"],
     "text": "864 / 106 / 34 TWh in beiden Dossiers gleich."},
    {"groesse": "Treibhausgasemissionen 2025", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d01.uba_thg_de_2025_mio_t", "d04.thg_2025_gesamt"],
     "text": "648,9 Mt CO₂-Äquivalente in beiden Dossiers gleich."},
    {"groesse": "Vorkettenemissionen Gas (UBA)", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d01.uba_vorkette_pipeline_norwegen_g_gj", "d09.vorkette_pipeline_norwegen_kg_gj", "d01.uba_vorkette_lng_usa_g_gj", "d09.vorkette_lng_usa_kg_gj"],
     "text": "3.805 g/GJ = 3,805 kg/GJ und 23.600 g/GJ = 23,6 kg/GJ: nur die Einheit unterscheidet sich."},
    {"groesse": "Wasserstoff-Kernnetz", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d04.kernnetz_laenge", "d08.kernnetz_laenge_km", "d04.kernnetz_kosten"],
     "text": "9.040 km in beiden Dossiers gleich. Kosten 18,9 Mrd. EUR (d04, Genehmigung 2024); Dossier 08 nennt im Text 24,3 Mrd. EUR bis 2037 (zweiter Entwurf 2026), dazu kein Parameter."},
    {"groesse": "Netzentgelt Haushalt 2025", "urteil": "WIDERSPRUCH",
     "ids": ["d05.netzentgelt_haushalt_2025_ct_kwh", "d10.de_strompreis_haushalt_netz_2019_2025_ct"],
     "text": "10,6 ct/kWh netto (d05, Bundesdurchschnitt Verteilnetz, vor Bundeszuschuss 2026) gegen 11,30 ct/kWh (d10, Eurostat NETC 2025). Unterschiedliche Abgrenzung wahrscheinlich, nicht belegt."},
    {"groesse": "Gaspreis", "urteil": "ABGRENZUNG",
     "ids": ["d09.modell_gaspreis_2030_2045_eur_mwh", "d09.preis_ttf_nov2026_eur_mwh", "d09.preis_erdgas_eur2023_mwh", "d10.gas_ttf_2022_eur_mwh"],
     "text": "Regler 20 / 35 / 85 (Entscheidung E01), UBA-Pfad 42 (2025) bis 17 (2045) in EUR2023, TTF November 2026 85,5-88,5 und Spitze 2022 124 EUR/MWh. Der aktuelle TTF liegt über dem Regler-Höchstwert."},
    {"groesse": "Kernkraft-Neubau (Kosten)", "urteil": "ÜBEREINSTIMMEND",
     "ids": ["d01.r21_factsheet_b_neubau_mrd_eur", "d09.r21_fsb_neubau_kosten_mrd_eur", "d09.r21_fsb_neubau_capex_eur_kw", "d09.neubau_de_capex_eur_kw"],
     "text": "310 Mrd. EUR in beiden Dossiers gleich (= 6.250 EUR/kW). Die Setzung 7.500 / 12.000 / 17.500 EUR/kW liegt bewusst darüber (Entscheidung E02)."},
]

# ---------------------------------------------------------------------------
# 4. Offene Luecken, die das Modell blockieren (aus den Abschnitten "Luecken",
#    den Pruefberichten und den C-Parametern tragender Groessen)
# ---------------------------------------------------------------------------
GAPS = [
    {"id": "G01", "dossier": "02", "art": "nur C bei tragender Größe", "teil": "1",
     "text": "PwC 2024 (13,3 Bio. EUR) im Original nicht gelesen (Registrierung); Zeitraum, Preisbasis, Diskontierung offen. Entscheidung E11: später.",
     "betrifft": ["d02.pwc_gesamtkosten_wwb_bio_eur", "d02.pwc_gesamtkosten_beschleunigt_bio_eur", "d00.wd_kosten_gesamt_bio_eur"]},
    {"id": "G02", "dossier": "02", "art": "nur C bei tragender Größe", "teil": "1",
     "text": "Pittel/Henning 2019 (ifo) nicht gelesen; 'kumuliert bis 2050' statt '500 Mrd. EUR pro Jahr' stützt sich auf einen Teaser. Entscheidung E11: später.",
     "betrifft": ["d02.pittel_henning_mehrkosten_bis2050_mrd_eur", "d00.wd_kosten_pro_jahr_mrd_eur"]},
    {"id": "G03", "dossier": "02", "art": "nur C bei tragender Größe", "teil": "1",
     "text": "Aurora/EnBW (3,44 Bio. EUR) nur über Zitate; Original nicht freigegeben.",
     "betrifft": ["d02.aurora_gesamtkosten_bio_eur"]},
    {"id": "G04", "dossier": "02", "art": "fehlender Wert", "teil": "1",
     "text": "Keine Studie mit einer Zahl für die Kapitalkosten (Finanzierung) der Energiewende insgesamt gefunden.", "betrifft": []},
    {"id": "G05", "dossier": "01", "art": "Originalquelle nicht gelesen", "teil": "1",
     "text": "Quantified Carbon 2025a (Preise 82 / 105 EUR/MWh, 17 g CO₂/kWh) nur im Referat bei Wendland gelesen; 17 g ohne Emissionsfaktoren nicht nachrechenbar.",
     "betrifft": ["d01.wendland_qc_preis_mischsystem_eur_mwh", "d01.wendland_qc_preis_ee_system_eur_mwh"]},
    {"id": "G06", "dossier": "01", "art": "Originalquelle nicht gelesen", "teil": "2",
     "text": "Bischof/RBID 2026 (560 GWh, 112 Mrd. EUR) nicht im Original gelesen; offen, ob Backup-Kraftwerke mitgerechnet sind.",
     "betrifft": ["d05.bischof_speicher_gwh"]},
    {"id": "G07", "dossier": "05", "art": "Originalquelle nicht gelesen", "teil": "2",
     "text": "Ohlendorf/Schill 2020 und Kittel et al. nur über Abstract bzw. Autorenvortrag; die Dauer 'etwa fünf Tage jährlich' bleibt B.",
     "betrifft": ["d05.df_ohlendorf_schill_dauer_jaehrlich_tage", "d05.ldes_bedarf_europa_twh", "d05.df_europa_extrem_1996_97_tage"]},
    {"id": "G08", "dossier": "05", "art": "fehlender Wert", "teil": "2",
     "text": "Wetterbasis: nur elf Jahre (2015-2025) und nur Deutschland; für das Modell sind mehrere Jahrzehnte (z. B. ERA5) und die Nachbarländer nötig.", "betrifft": []},
    {"id": "G09", "dossier": "05", "art": "fehlender Wert", "teil": "2",
     "text": "ERAA 2025: LOLE-Werte für Deutschland nicht ermittelt; StromVKG Anlage 4 (Reduktionsfaktoren Batterie je Speicherdauer) nicht primär gelesen; BNetzA-Hauptbericht Versorgungssicherheitsmonitoring nicht gelesen.",
     "betrifft": ["d05.vsm2025_zusatzbedarf_steuerbar_2035_gw", "d05.fa_v4_stromvkg_mrd_eur_pro_jahr"]},
    {"id": "G10", "dossier": "05", "art": "Widerspruch offen", "teil": "2",
     "text": "Batteriekosten für 120-h-Systeme: ISE 400-600 EUR/kWh (2024) gegen R21/Bischof 200 EUR/kWh; keine Zahl gilt für lange Speicherdauern.",
     "betrifft": ["d05.batterie_capex_pvffa_eur_kwh", "d00.r21_factsheet_a_batterie_bio_eur"]},
    {"id": "G11", "dossier": "04", "art": "Widerspruch offen", "teil": "2",
     "text": "Strombedarf 2030 nach BMWK-Langfristszenarien 3: 765-792 TWh gegen 594-638 TWh im strommix-Dossier; nur Sekundärquellen (BMWK-Seite hinter Browser-Prüfung). Möglicherweise T45- gegen O45-Szenario.",
     "betrifft": ["d04.strom_2030_lfs3"]},
    {"id": "G12", "dossier": "04", "art": "nur C bei tragender Größe", "teil": "2, 5",
     "text": "Lkw-Verbräuche (BEV, H₂, Diesel) nur aus Suchtreffer-Auszügen (ICCT, NOW, Agora Verkehrswende); Originalstudien nicht gelesen.",
     "betrifft": ["d04.lkw_bev_kwh_100km", "d04.lkw_h2_kg_100km", "d04.lkw_diesel_l_100km"]},
    {"id": "G13", "dossier": "04", "art": "fehlender Wert", "teil": "2, 5",
     "text": "Keine belastbare Primärquelle für Wirkungsgrade künftiger H₂-Kraftwerke (Rückverstromung); JAZ von Wärmepumpen im Neubau aktueller Technik fehlt.", "betrifft": ["d04.power_to_gas_to_power_kette"]},
    {"id": "G14", "dossier": "04", "art": "fehlender Wert", "teil": "6",
     "text": "Sektorziele 2030 nach Anlage 2a KSG nicht an der Quelle belegt; SRU-Restbudget nur als Suchtreffer (C).",
     "betrifft": ["d04.restbudget_sru_175_67"]},
    {"id": "G15", "dossier": "06", "art": "fehlender Wert", "teil": "3",
     "text": "Heutige NTC bzw. handelbare Kapazität je Grenze (ENTSO-E, ACER) fehlt; nur Planwerte 2045 und beobachtete Spitzen. Einhaltung der 70-%-Regel durch Deutschland nicht belegt.",
     "betrifft": ["d06.regler_kuppelkapazitaet_gw", "d06.ntc_bmwe_o45_strom_gw"]},
    {"id": "G16", "dossier": "06", "art": "nur C bei tragender Größe", "teil": "3",
     "text": "Speicherpotenzial Norwegen (84-87 TWh) und Schweden (34 TWh) nur C; Statnett, NVE, Svenska kraftnät nicht freigegeben.",
     "betrifft": ["d06.norwegen_speicherpotenzial_twh", "d06.schweden_speicher_twh"]},
    {"id": "G17", "dossier": "06", "art": "nur C bei tragender Größe", "teil": "3, 6",
     "text": "EUA-Preis ohne Primärbeleg (zwei Dossiers, zwei Werte, beide C).",
     "betrifft": ["d06.eua_dez_2026_eur_t", "d09.eua_preis_nov2026_eur_t"]},
    {"id": "G18", "dossier": "07", "art": "fehlender Wert", "teil": "4",
     "text": "Weltmarktanteile bei Abbau und Raffinade (Lithium, Kobalt, Nickel, Graphit) ohne Einzelwerte (IEA nicht freigegeben); Anteile bei Windturbinen, Getrieben, Rotorblättern fehlen; Elektrolyseure und Heimspeicher ohne saubere HS-Codes.",
     "betrifft": ["d07.batteriezellen_china_anteil_kapazitaet_2024_pct", "d07.iea_top3_raffination_anteil_2024_pct"]},
    {"id": "G19", "dossier": "07", "art": "fehlender Wert", "teil": "4",
     "text": "Stresstest: Lieferzeiten und Preisaufschläge bei Exportkontrollen nicht gefunden (nur Suchtreffer, C); EU-Modulbedarf (SolarPower Europe) fehlt, deshalb ist 'Ausweichkapazität gegen Bedarf' nicht schließbar; Modullagerbestand nur 2023 geschätzt.",
     "betrifft": ["d07.stresstest_preisfaktor_ga_ge_dy_ausserhalb_china", "d07.stresstest_verzug_wafer_eu_jahre", "d07.stresstest_zubauverlust_de_gwp_pro_jahr", "d07.eu_modul_lagerbestand_2023_gw"]},
    {"id": "G20", "dossier": "07", "art": "fehlender Wert", "teil": "4",
     "text": "Realisierter BIP-Effekt der Gaskrise 2022/23 nicht abgerufen (nur Ex-ante-Szenarien, C); Weltproduktionsanteile fossiler Träger für einen gleichartigen Konzentrationsvergleich fehlen (der HHI-Vergleich nutzt Bezugsländer).",
     "betrifft": ["d07.gaskrise_bip_effekt_exante_pct", "d07.gaskrise_terms_of_trade_verlust_2022_mrd_eur"]},
    {"id": "G21", "dossier": "08", "art": "nur C bei tragender Größe", "teil": "5",
     "text": "E-Kerosin-Kosten nach EASA (6.820-9.405 EUR/t) nur Suchtreffer; ReFuelEU-Zwischenwerte (2032-2045) C; Elektrolysekosten China C; Importverluste und -kosten je Träger (Pipeline, Ammoniak, LH₂, LOHC) ohne Zahl.",
     "betrifft": ["d08.ekerosin_kosten_easa_eur_t", "d08.refueleu_synth_quote", "d08.elektrolyse_capex_china_usd_kw"]},
    {"id": "G22", "dossier": "08", "art": "nur C bei tragender Größe", "teil": "5",
     "text": "Lkw-Regler: alle vier model_*-Werte sind C (Setzung M); Verhältnis FCEV/BEV im Strombedarf 2,65 (Modell) gegen 2,35 (UBA), Entscheidung E04 offen, ob low/high neu zu rechnen sind. Brennstoffzellen-Lkw-Bestand und Neuzulassungen (KBA) fehlen.",
     "betrifft": ["d08.model_lkw_h2_zusatz_strom_twh", "d08.model_lkw_h2_zusatz_elektrolyse_gw", "d08.model_strom_de_h0_m0_twh", "d08.model_elektrolyse_h0_m0_gw"]},
    {"id": "G23", "dossier": "09", "art": "Originalquelle nicht gelesen", "teil": "1, 6",
     "text": "Radiant-Gutachten (Juni 2026) im Original nicht gelesen; die 12 GW und 18-19 Mrd. EUR sind Wiedergabe der AfD-Fraktion (Drs. 21/7609, 21/6126). Reaktivierungskosten und frühestes Jahr C.",
     "betrifft": ["d09.kkw_reakt_leistung_gw", "d09.kkw_reakt_kosten_mrd_eur", "d09.kkw_reakt_fruehestes_jahr"]},
    {"id": "G24", "dossier": "09", "art": "nur C bei tragender Größe", "teil": "1, 6",
     "text": "CCS-Kosten in EUR/MWh (Gas, Braunkohle) ohne Primärquelle, nur eigene Umrechnung (Setzung M, C); Schiefergas-Plateau und -Vorlauf C; Kosten der Kraftwerksstrategie (StromVKG) und Ersatzbedarf des fossilen Parks nicht gefunden; Steinkohle- und Ölpreise am Terminmarkt nicht recherchiert.",
     "betrifft": ["d09.ccs_mehrkosten_gas_eur_mwh", "d09.ccs_mehrkosten_braunkohle_eur_mwh", "d09.schiefergas_plateau_mrd_m3_a", "d09.schiefergas_vorlauf_jahre"]},
    {"id": "G25", "dossier": "09", "art": "Widerspruch offen", "teil": "6",
     "text": "Wirksamkeitsdatum der MSR-Löschschwelle 700 Mio. (sofort oder 2031) widersprüchlich; Einigung vom 20.10.2026 nur über Sekundärquellen (consilium.europa.eu hinter Browser-Prüfung); tatsächlich nach § 8 TEHG gelöschte Mengen nicht gefunden.",
     "betrifft": ["d09.msr_loeschschwelle_mio"]},
    {"id": "G26", "dossier": "10", "art": "fehlender Wert", "teil": "1, 6",
     "text": "Anteil der Energiepreise am Produktionsrückgang: keine ökonometrische Schätzung gelesen (ifo, Bundesbank, SVR, IfW, DIW); Merit-Order-Effekt und Zerlegung der Strompreissteigerung nach Ursache fehlen; Preise USA und China ohne Primärquelle.",
     "betrifft": ["d10.de_industrieproduktion_bd_2025_vs_2019_pct"]},
    {"id": "G27", "dossier": "10", "art": "fehlender Wert", "teil": "1, 6",
     "text": "Makroökonomische Wirkung der Klimainvestitionen (positiv wie negativ): Primärstudien (Bundesbank, GWS/Prognos, Ariadne, IW, DIW, ifo) nicht gelesen; Verdrängungseffekte nicht gefunden. EEG-Bundeszuschuss: Ist 2025 nur Fachpresse, Netzbetreiber-Prognose 2026 nicht prüfbar.",
     "betrifft": ["d10.eeg_bundeszuschuss_2025_mrd_eur"]},
    {"id": "G28", "dossier": "03", "art": "fehlender Wert", "teil": "2",
     "text": "Abregelung 2015-2022 nach Technologie und marktbedingte Abregelung nicht beziffert; die Offshore- und PV-Volllaststunden sind deshalb nicht als reine Wetterspanne lesbar (siehe Korrekturen d03.wind_offshore_vls und d03.pv_vls_gesamt).",
     "betrifft": ["d03.wind_offshore_vls_2015_2025", "d03.pv_vls_gesamt_dc_2015_2025"]},
]

# ---------------------------------------------------------------------------
# 5. Hilfsfunktionen
# ---------------------------------------------------------------------------

def pid(n, i):
    return "d%02d.%s" % (n, i)


def json_blocks(path):
    text = path.read_text(encoding="utf-8")
    return [json.loads(b) for b in re.findall(r"^```json\s*\n(.*?)^```", text, re.S | re.M)]


def find_file(directory, n, suffix=""):
    hits = sorted(directory.glob("%02d_%s*.md" % (n, suffix)))
    if not hits:
        raise SystemExit("Datei fehlt: %s/%02d_*.md" % (directory, n))
    return hits[0]


def snapshot(q):
    return {k: q[k] for k in VALUE_KEYS if k in q}


def kompakt(v):
    return json.dumps(v, ensure_ascii=False, sort_keys=False, separators=(", ", ": ")) if not isinstance(v, str) else v


def fmt_wert(q):
    parts = []
    if q.get("value") is not None:
        parts.append(kompakt(q["value"]))
    mm = [("min", q.get("min")), ("mid", q.get("mid")), ("max", q.get("max"))]
    mm = ["%s %s" % (k, kompakt(v)) for k, v in mm if v is not None]
    if mm:
        parts.append(" / ".join(mm))
    return "; ".join(parts) if parts else "–"


def md_cell(s, n=None):
    s = str(s).replace("\n", " ").replace("|", "/")
    if n and len(s) > n:
        s = s[: n - 1].rstrip() + "…"
    return s


def split_cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def parse_pruefttabelle(n, ids):
    """Liest die Pruefttabelle (Abschnitt 2) und gibt {id: [(ergebnis, neu), ...]} zurueck."""
    path = find_file(PRUEF, n)
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"^```json\s*\n.*?^```", "", text, flags=re.S | re.M)
    m = re.search(r"^## 3[\s.·]", text, re.M)
    if m:
        text = text[: m.start()]
    lines = text.split("\n")
    out = defaultdict(list)
    header = None
    sep = re.compile(r"^\|[\s\-:|]+$")
    for i, line in enumerate(lines):
        if not line.startswith("|"):
            if not line.strip():
                header = None
            continue
        if sep.match(line):
            continue
        if i + 1 < len(lines) and sep.match(lines[i + 1]):
            header = [h.lower() for h in split_cells(line)]
            continue
        if header is None:
            continue
        cells = split_cells(line)
        ie = [k for k, h in enumerate(header) if "ergebnis" in h]
        if not ie or len(cells) <= ie[0]:
            continue
        ie = ie[0]
        ineu = [k for k, h in enumerate(header) if h.startswith("neu") or "konf" in h]
        ident = " ".join(cells[:2]) if ie > 1 else cells[0]
        for i_d in ids:
            if re.search(r"(?<![A-Za-z0-9_])" + re.escape(i_d) + r"(?![A-Za-z0-9_])", ident):
                neu = cells[ineu[0]] if ineu and len(cells) > ineu[0] else ""
                out[i_d].append((cells[ie], neu))
    return out


def klassifiziere(ergebnis):
    t = re.sub(r"[*`_]", "", ergebnis).lower().strip()
    pats = [("nicht prüfbar", r"nicht prüfbar|\bn\. ?p\.|^n\b"),
            ("abweichend", r"abweichend|\babw\b|^a\b"),
            ("bestätigt", r"bestätigt|^b\b")]
    best = None
    kinds = set()
    for name, rx in pats:
        mt = re.search(rx, t)
        if mt:
            kinds.add(name)
            if best is None or mt.start() < best[1]:
                best = (name, mt.start())
    if best is None:
        return None, False
    return best[0], len(kinds) > 1


def conf_aus_zelle(neu):
    mt = re.match(r"^\W*([ABC])\b", neu.replace("**", ""))
    return mt.group(1) if mt else None


def quellenzahl(src):
    return len([p for p in src.split(";") if p.strip()])


# ---------------------------------------------------------------------------
# 6. Hauptlauf
# ---------------------------------------------------------------------------

def lade_alles():
    dossiers = {}
    for n in DOSSIERS:
        blk = json_blocks(find_file(RESEARCH, n))
        if not blk:
            raise SystemExit("Kein JSON-Block in Dossier %02d" % n)
        dossiers[n] = {"name": find_file(RESEARCH, n).stem, "daten": blk[0]}
    pruefungen = {}
    for n in DOSSIERS[1:]:
        blk = json_blocks(find_file(PRUEF, n))
        if not blk:
            raise SystemExit("Kein JSON-Block in Pruefbericht %02d" % n)
        pruefungen[n] = blk[0]
    return dossiers, pruefungen


def baue():
    dossiers, pruefungen = lade_alles()

    # --- Eingangsparameter (unveraendert gehalten, fuer Bilanz und wert_vor_pruefung)
    params = {}          # (n, id) -> dict (Ausgabe)
    original = {}        # (n, id) -> unveraendertes Original
    reihenfolge = []
    for n in DOSSIERS:
        for q in dossiers[n]["daten"]["parameters"]:
            key = (n, q["id"])
            if key in params:
                raise SystemExit("Doppelte ID im Dossier: %s" % (key,))
            original[key] = json.loads(json.dumps(q))
            reihenfolge.append(key)
    eingang = len(original)

    # --- Tabellen der Pruefberichte
    tabelle = {}
    for n in DOSSIERS[1:]:
        ids = [q["id"] for q in dossiers[n]["daten"]["parameters"]]
        for i_d, rows in parse_pruefttabelle(n, ids).items():
            tabelle[(n, i_d)] = rows

    # --- Korrekturen einordnen
    angewendet = []        # (n, korrektur, [keys])
    text_korr = defaultdict(list)
    nicht_zugeordnet = []
    korr_je_param = {}
    for n in DOSSIERS[1:]:
        ids = {q["id"] for q in dossiers[n]["daten"]["parameters"]}
        for k in pruefungen[n]["korrekturen"]:
            kid = k["id"]
            if kid in ids:
                keys = [(n, kid)] + ZUSATZ_ZUORDNUNG.get((n, kid), [])
                for key in keys:
                    if key not in original:
                        raise SystemExit("Zuordnung auf unbekannten Parameter: %s" % (key,))
                angewendet.append((n, k, keys))
            elif (n, kid) in NICHT_ZUGEORDNET:
                nicht_zugeordnet.append({"dossier": n, "korrektur": k, "grund": NICHT_ZUGEORDNET[(n, kid)]})
            else:
                art = "neuer_wert" if (k["alt"] is None or (isinstance(k["alt"], str) and re.match(r"^(\(fehlt\)|Lücke|fehlt)", k["alt"]))) else "text"
                if kid.startswith("kernaussage") or kid.startswith("K") and re.match(r"^K\d", kid):
                    art = "kernaussage"
                text_korr[n].append({"art": art, "korrektur": k})

    for n, k, keys in angewendet:
        if (n, k["id"]) not in KORREKTUR_AKTIONEN:
            raise SystemExit("Keine Aktion fuer Korrektur %s in Dossier %02d" % (k["id"], n))
    for key in KORREKTUR_AKTIONEN:
        if key not in original:
            raise SystemExit("Aktion fuer unbekannten Parameter %s" % (key,))

    # --- Ausgabe-Parameter aufbauen
    for key in reihenfolge:
        n, i_d = key
        q = json.loads(json.dumps(original[key]))
        rec = {"id": pid(n, i_d), "dossier": dossiers[n]["name"]}
        for kk, vv in q.items():
            if kk != "id":
                rec[kk] = vv
        params[key] = rec

    herabstufungen = []   # dicts
    hochstufungen = []
    korrektur_log = []    # angewendete Korrekturen fuer den Bericht

    for n, k, keys in angewendet:
        spec = KORREKTUR_AKTIONEN[(n, k["id"])]
        for key in keys:
            rec = params[key]
            orig = original[key]
            vor = snapshot(orig)
            arten = []
            # Werte und Text setzen
            for feld, wert in spec.get("set", {}).items():
                if key != (n, k["id"]) and feld in VALUE_KEYS:
                    continue
                rec[feld] = wert
                arten.append("wert" if feld in VALUE_KEYS or feld == "spanne" else "text")
            for feld in spec.get("unset", []):
                if feld in rec:
                    del rec[feld]
            if "set_value_keys" in spec:
                v = dict(rec["value"])
                v.update(spec["set_value_keys"])
                rec["value"] = v
                arten.append("wert")
            for feld, text in spec.get("add", {}).items():
                basis = rec.get(feld)
                if basis is None:
                    other = "abgrenzung" if feld == "note" else "note"
                    feld = feld if rec.get(other) is None else other
                    basis = rec.get(feld)
                rec[feld] = (basis + "; " if basis else "") + "Prüfung: " + text
                arten.append("text")
            # Fundstelle
            fund = spec.get("fund")
            if fund is not None:
                alt_f = rec["fundstelle"]
                if isinstance(fund, tuple):
                    neu_f = alt_f.replace(fund[0], fund[1]) if fund[0] in alt_f else k["fundstelle"]
                else:
                    neu_f = fund
                if neu_f != alt_f:
                    rec["fundstelle_vor_pruefung"] = alt_f
                    rec["fundstelle"] = neu_f
                    arten.append("fundstelle")
            rec["fundstelle_geprueft"] = k["fundstelle"]
            # Konfidenz
            conf_neu, pg_neu = k["confidence"], k["primaer_gelesen"]
            ausn = KONF_AUSNAHME.get(key) or None
            if "konf" in spec:
                conf_neu, pg_neu, grund = spec["konf"]
                rec["konfidenz_hinweis"] = grund
            elif ausn:
                conf_neu, pg_neu, grund = ausn
                rec["konfidenz_hinweis"] = grund
            conf_alt, pg_alt = orig["confidence"], orig["primaer_gelesen"]
            if conf_neu != conf_alt or pg_neu != pg_alt:
                rec["konfidenz_vor_pruefung"] = {"confidence": conf_alt, "primaer_gelesen": pg_alt}
                rec["confidence"], rec["primaer_gelesen"] = conf_neu, pg_neu
                arten.append("konfidenz")
            # Notiz aus der Korrektur
            if spec.get("notiz", True):
                neu = k["neu"]
                rec["pruefnotiz"] = neu if isinstance(neu, str) else kompakt(neu)
                arten.append("hinweis")
            rec["pruefstatus"] = "korrigiert"
            rec["wert_vor_pruefung"] = vor
            rec["begruendung"] = k["begruendung"] + ("" if key == (n, k["id"]) else " [gilt laut Korrektur auch für diesen Parameter]")
            rec["korrektur_art"] = sorted(set(arten)) or ["hinweis"]
            korr_log = {"key": key, "korrektur": k, "arten": rec["korrektur_art"], "vor": vor,
                        "nach": snapshot(rec), "zusatz": key != (n, k["id"])}
            korrektur_log.append(korr_log)

    # --- Pruefstatus fuer alle uebrigen Parameter (Tabelle -> manuell -> Stichprobe)
    for key in reihenfolge:
        n, i_d = key
        rec = params[key]
        if rec.get("pruefstatus") == "korrigiert":
            rows = tabelle.get(key)
            if rows:
                rec["pruefergebnis"] = md_cell(rows[0][0].replace("**", ""), 220)
            continue
        rows = tabelle.get(key)
        if n == 0:
            rec["pruefstatus"] = "nicht in der Stichprobe"
            rec["pruefhinweis"] = ("Dossier 00 hat keinen eigenen Prüfbericht; der Kernbefund (13,8 steht nicht in der zitierten Quelle) "
                                   "ist in Prüfbericht 01 (Kernaussage 9) bestätigt.")
            continue
        if rows:
            klassen = [klassifiziere(r[0]) for r in rows]
            status, gemischt = klassen[0]
            for st, gm in klassen:
                if st == "nicht prüfbar":
                    status, gemischt = st, gm
            if status is None:
                raise SystemExit("Pruefergebnis nicht lesbar: %s %s" % (key, rows))
            if status == "abweichend":
                raise SystemExit("Abweichung ohne Korrektur (manuell klaeren): %s %s" % (key, rows))
            rec["pruefstatus"] = status
            rec["pruefergebnis"] = md_cell(rows[0][0].replace("**", ""), 220)
            if gemischt:
                rec["pruefhinweis"] = "Gemischtes Ergebnis in der Prüftabelle: der Wert ist " + status + ", Deutung oder Teilangaben weichen ab (siehe pruefergebnis)."
            # Konfidenz aus der Tabelle, falls abweichend vom Dossier
            c = conf_aus_zelle(rows[0][1]) if rows[0][1] else None
            if c and c != rec["confidence"]:
                rec["konfidenz_vor_pruefung"] = {"confidence": rec["confidence"], "primaer_gelesen": rec["primaer_gelesen"]}
                rec["confidence"] = c
                rec["konfidenz_quelle"] = "Prüftabelle (Spalte neue Konfidenz)"
        elif key in PRUEFSTATUS_MANUELL:
            rec["pruefstatus"], rec["pruefergebnis"] = PRUEFSTATUS_MANUELL[key]
        else:
            rec["pruefstatus"] = "nicht in der Stichprobe"

    # --- Konfidenz-Regel A (mehrere unabhaengige Quellen UND primaer gelesen)
    regel_a = []
    for key in reihenfolge:
        n, i_d = key
        rec = params[key]
        if rec["confidence"] != "A":
            continue
        grund = None
        if not rec["primaer_gelesen"]:
            grund = "A ohne primaer_gelesen"
        elif quellenzahl(rec["source"]) < 2 and key not in ZWEITE_QUELLE:
            grund = "A mit nur einer Quelle"
        elif key in ZWEITE_QUELLE and quellenzahl(rec["source"]) < 2:
            rec["zweite_quelle"] = ZWEITE_QUELLE[key]
        if grund:
            vorher = rec.get("konfidenz_vor_pruefung")
            if vorher is None:
                rec["konfidenz_vor_pruefung"] = {"confidence": "A", "primaer_gelesen": rec["primaer_gelesen"]}
            rec["confidence"] = "B"
            rec["konfidenz_regel"] = grund + " -> B (Konfidenz-Regel der Konsolidierung)"
            regel_a.append({"id": rec["id"], "grund": grund, "status": rec["pruefstatus"]})

    # --- Entscheidungen einarbeiten
    def ueberschreibe(key, feld_neu, hinweis, ausnahme_konf=None):
        rec = params[key]
        rec.setdefault("ueberschreibung", [])
        rec["ueberschreibung"].append({"quelle": ENTSCHEIDUNG_QUELLE, "hinweis": hinweis,
                                       "wert_davor": snapshot(rec)})
        rec["quelle_vor_entscheidung"] = rec.get("quelle_vor_entscheidung", rec["source"])
        rec["source"] = ENTSCHEIDUNG_QUELLE
        for f, v in feld_neu.items():
            rec[f] = v

    # E01 Gaspreis
    ueberschreibe((9, "modell_gaspreis_2030_2045_eur_mwh"), {"setzung": True}, "E01: 20 / 35 / 85 EUR/MWh bestätigt")
    # E02 Kernkraft-Neubau
    ueberschreibe((9, "neubau_de_capex_eur_kw"), {"setzung": True}, "E02: Spanne aus gebauten Projekten bestätigt")
    ueberschreibe((9, "r21_fsb_neubau_capex_eur_kw"), {"szenario": "R21 wie veröffentlicht"}, "E02: Szenario 'R21 wie veröffentlicht', 6.250 EUR/kW")
    # E03 Reaktivierung
    rk = (9, "kkw_reakt_leistung_gw")
    ueberschreibe(rk, {"value": {"min": 0, "mid": 2.7, "max": 12},
                       "konfidenz_je_wert": {"mid": {"confidence": "B", "primaer_gelesen": True,
                                                      "beleg": "Drs. 21/7609, Drs. 18/292 (Isar 2 1.410 + Emsland 1.335 MW)"},
                                             "max": {"confidence": "C", "primaer_gelesen": False,
                                                     "beleg": "Radiant, nicht primär gelesen"}},
                       "confidence": "C", "primaer_gelesen": False,
                       "note": "Setzung (M); Mitte nur Isar 2 und Emsland (Neckarwestheim 2 im Rückbau, Gundremmingen C ausgeschlossen); "
                               "oberes Ende 12 GW: Radiant, nicht primär gelesen"},
                "E03: Mitte 2,7 GW, oben 12 GW (Radiant, nicht primär gelesen); alter Höchstwert 6,8 GW (Gruppe A)")
    # E04 Wasserstoff-Lkw
    lk = (8, "model_lkw_h2_zusatz_strom_twh")
    ueberschreibe(lk, {"mid": 115, "oberes_ende_bisherige_setzung": 140,
                       "verhaeltnis_fcev_bev": {"mid_uba": 2.35, "oberes_ende_bisherige_setzung": 2.65},
                       "note": "Setzung (M): h=1 gegen h=0, Import 0; mid mit UBA-Verhältnis FCEV/BEV 2,35 (Pruefbericht 08: 115 TWh bei R_BEV 0,50; direkt aus der UBA-Kette mit 42 % Diesel-Wirkungsgrad 132 TWh); "
                               "bisherige Setzung 2,65 = 140 TWh als oberes Ende; min 75 und max 214 (low/high-Spalten) nicht neu gerechnet"},
                "E04: UBA-Verhältnis als Mitte, bisherige Setzung als oberes Ende")
    ueberschreibe((8, "model_lkw_h2_zusatz_elektrolyse_gw"),
                  {"oberes_ende_bisherige_setzung": 56,
                   "offen": "Mitte mit dem UBA-Verhältnis noch nicht gerechnet; linear skaliert (115/140) wären es etwa 46 GW (Setzung M, nicht modelliert)"},
                  "E04: Mitte neu zu rechnen; bisheriger Wert bleibt oberes Ende der Mitte")
    # E05 E-Fuel-Menge
    ueberschreibe((8, "efuel_bedarf_2045_ariadne_twh"),
                  {"min": 51, "bereiche": {"niedrig_pdf_s23_nichtelektrisch_schiff_flug": {"min": 51, "max": 128},
                                           "hoch_pdf_s29_synthetisch_und_biogen": {"min": 180, "max": 195}}},
                  "E05: niedrigeren Ariadne-Wert (51-128 TWh, PDF-S. 23) aufgenommen; Untergrenze 51, Obergrenze 195 bleibt")
    # E06 Solar: nur Marker
    for key in [(3, "pv_vls_gesamt_dc_2015_2025"), (3, "pv_vls_oeffentlich_dc_2015_2025"), (7, "de_pv_bestand_gwp_2025"), (7, "de_pv_ersatzbedarf_gwp_pro_jahr")]:
        params[key]["leistungsbasis"] = "Modulleistung (DC), Entscheidung Michael 22.11.2026"
    # E07 Energiebilanz
    bilanz = []
    for key in reihenfolge:
        if key[0] != 4:
            continue
        rec = params[key]
        src = rec["source"]
        if "eurostat" in src:
            rec["bilanz_rolle"] = "Abgleich (Eurostat); führend ist die AG Energiebilanzen"
            bilanz.append(rec["id"])
        elif "ageb" in src or key in ((4, "ist_eev_de_2024_ageb_abgeleitet"), (4, "ist_pev_de_2025_ageb_pj")):
            rec["bilanz_rolle"] = "führend (AG Energiebilanzen)"
            bilanz.append(rec["id"])
    # E08 Dunkelflaute
    for key, rolle in [((3, "dunkelflaute_laengste_phase_unter_5pct_h"), "günstigste Lesart (strenges Stundenkriterium)"),
                       ((3, "dunkelflaute_laengste_phase_unter_10pct_h"), "günstigste Lesart (strenges Stundenkriterium)"),
                       ((5, "df_wind_laengste_phase_h"), "6-h-Mittel; nach Entscheidung auf Tagesmittel neu auszuzählen"),
                       ((5, "df_ereignisse_ge10h_2016_2025"), "6-h-Mittel; nach Entscheidung auf Tagesmittel neu auszuzählen"),
                       ((5, "df_ereignisse_ge48h_pro_jahr"), "6-h-Mittel; nach Entscheidung auf Tagesmittel neu auszuzählen"),
                       ((5, "df_5d_luecke_ziel2030_twh"), "Speicherbedarf über die Energielücke (maßgeblich)"),
                       ((5, "df_5d_anteil_windpv_an_last"), "Energielücke-Fenster (maßgeblich)"),
                       ((5, "df_5d_winterlastfaktor"), "Energielücke-Fenster (maßgeblich)")]:
        params[key]["definition_rolle"] = rolle + "; Entscheidung Michael 22.11.2026"
    # E09 Stresstest China, zweistufig
    mp = params[(7, "stresstest_modulpreisfaktor")]
    kp = params[(7, "stresstest_kostenaufschlag_grossanlage_pct")]
    f1, f2_soa, f2_eu = 1.83, 1.04, 1.60
    modulanteil_ct, gesamt_ct = 8.7, 75.8
    st1 = round(modulanteil_ct * (f1 - 1) / gesamt_ct * 100, 1)
    st2_mid = round(10.3 - st1, 1)
    st2_max = round(21.8 - st1, 1)
    ueberschreibe((7, "stresstest_modulpreisfaktor"),
                  {"stufen": {"stufe_1_rueckkehr_auf_china_mindestpreis": {"faktor": f1, "rechnung": "15,9 / 8,7 ct/Wp (China-Mindestpreis geliefert / Marktpreis 2025)"},
                              "stufe_2_aufschlag_ware_ausserhalb_china": {"suedostasien_gegen_china_mindestpreis": f2_soa, "eu_skaliert_gegen_china_mindestpreis": f2_eu}},
                   "hinweis_min": "min 1,25 stammt aus dem Polysilizium-Schock 2021/22 und gehört zu keiner der beiden Stufen"},
                  "E09: in zwei Stufen getrennt (Pruefbericht 07: 1,83 / 1,04 / 1,60); Gesamtfaktor mid 1,9 = 1,83 x 1,04, max 2,9 = 1,83 x 1,60")
    ueberschreibe((7, "stresstest_kostenaufschlag_grossanlage_pct"),
                  {"stufen": {"stufe_1_rueckkehr_auf_china_mindestpreis_pct": st1,
                              "stufe_2_aufschlag_ausserhalb_china_pct": {"mid": st2_mid, "max": st2_max},
                              "herleitung": "Setzung (M): 8,7 ct/Wp x (Faktor - 1) / 75,8 ct/Wp nach Prüfbericht 07 (K8); Stufe 1 mit Faktor 1,83, Stufe 2 als Differenz zum Gesamtaufschlag"}},
                  "E09: Aufschlag in zwei Stufen getrennt ausgewiesen")
    # E10 ZEW
    ueberschreibe((1, "r21_zew_ersparnis_mrd_eur"), {"hinweis": "Die Reihe nennt 824 Mrd. EUR aus der ZEW-Studie; R21 nennt zusätzlich 850 (steht nicht in der Studie); keine eigene 'richtige' Zahl"},
                  "E10: 824 Mrd. EUR aus der Studie, mit Hinweis auf die Uneinheitlichkeit")
    # E11 PwC / ifo
    for key in [(2, "pwc_gesamtkosten_wwb_bio_eur"), (2, "pwc_gesamtkosten_beschleunigt_bio_eur"), (2, "pittel_henning_mehrkosten_bis2050_mrd_eur")]:
        params[key]["original_nicht_gelesen"] = "PwC-Studie bzw. ifo-Gastbeitrag: Original nicht gelesen, Freigabe 'später' (Entscheidung Michael 22.11.2026)"

    # betrifft-Listen pruefen
    entscheidungen = []
    for e in ENTSCHEIDUNGEN:
        e = dict(e)
        if e["betrifft"] == "AUTO:d04_bilanz":
            e["betrifft"] = bilanz
        else:
            for b in e["betrifft"]:
                n = int(b[1:3])
                if (n, b[4:]) not in params:
                    raise SystemExit("Entscheidung %s verweist auf unbekannten Parameter %s" % (e["id"], b))
        entscheidungen.append(e)

    # --- Herab- und Hochstufungen sammeln
    for key in reihenfolge:
        rec = params[key]
        v = rec.get("konfidenz_vor_pruefung")
        if not v:
            continue
        a, b = v["confidence"], rec["confidence"]
        if "konfidenz_regel" in rec:
            quelle = "Regel A"
        elif rec.get("konfidenz_quelle"):
            quelle = "Prüftabelle"
        else:
            quelle = "Prüfbericht"
        eintrag = {"id": rec["id"], "von": a, "nach": b, "pg_von": v["primaer_gelesen"], "pg_nach": rec["primaer_gelesen"], "quelle": quelle}
        if RANG[b] < RANG[a] or (v["primaer_gelesen"] and not rec["primaer_gelesen"]):
            herabstufungen.append(eintrag)
        elif RANG[b] > RANG[a] or (not v["primaer_gelesen"] and rec["primaer_gelesen"]):
            hochstufungen.append(eintrag)

    # --- GAPS pruefen
    for g in GAPS:
        for b in g["betrifft"]:
            n = int(b[1:3])
            if (n, b[4:]) not in params:
                raise SystemExit("Luecke %s verweist auf unbekannten Parameter %s" % (g["id"], b))
    for d in DOPPLUNGEN:
        for b in d["ids"]:
            n = int(b[1:3])
            if (n, b[4:]) not in params:
                raise SystemExit("Dopplung '%s' verweist auf unbekannten Parameter %s" % (d["groesse"], b))

    # --- Bilanzen
    ausgang = len(params)
    korr_gesamt = sum(len(pruefungen[n]["korrekturen"]) for n in pruefungen)
    korr_text = sum(len(v) for v in text_korr.values())
    z = {
        "parameter_eingang": eingang, "parameter_ausgang": ausgang,
        "korrekturen_gesamt": korr_gesamt,
        "korrekturen_angewendet": len(angewendet),
        "korrekturen_text": korr_text,
        "korrekturen_nicht_zugeordnet": len(nicht_zugeordnet),
    }
    if eingang != ausgang:
        raise SystemExit("Parameter verschwunden: %d -> %d" % (eingang, ausgang))
    if korr_gesamt != z["korrekturen_angewendet"] + korr_text + len(nicht_zugeordnet):
        raise SystemExit("Korrekturen gehen nicht auf: %s" % z)
    z["herabstufungen"] = len(herabstufungen)
    z["hochstufungen"] = len(hochstufungen)
    z["regel_a_herabstufungen"] = len(regel_a)

    return {
        "dossiers": dossiers, "pruefungen": pruefungen, "params": params, "original": original,
        "reihenfolge": reihenfolge, "text_korr": text_korr, "nicht_zugeordnet": nicht_zugeordnet,
        "angewendet": angewendet, "korrektur_log": korrektur_log,
        "herabstufungen": herabstufungen, "hochstufungen": hochstufungen, "regel_a": regel_a,
        "entscheidungen": entscheidungen, "zaehlung": z,
    }


def schreibe_json(d):
    dossiers, params, reihenfolge = d["dossiers"], d["params"], d["reihenfolge"]
    stand = max(dossiers[n]["daten"].get("stand", "") for n in dossiers)
    textkorr = {}
    for n in sorted(d["text_korr"]):
        textkorr["d%02d" % n] = [
            {"id": e["korrektur"]["id"], "einordnung": e["art"], "alt": e["korrektur"]["alt"], "neu": e["korrektur"]["neu"],
             "fundstelle": e["korrektur"]["fundstelle"], "confidence": e["korrektur"]["confidence"],
             "primaer_gelesen": e["korrektur"]["primaer_gelesen"], "begruendung": e["korrektur"]["begruendung"]}
            for e in d["text_korr"][n]]
    nz = [{"dossier": "d%02d" % e["dossier"], "id": e["korrektur"]["id"], "alt": e["korrektur"]["alt"], "neu": e["korrektur"]["neu"],
           "fundstelle": e["korrektur"]["fundstelle"], "confidence": e["korrektur"]["confidence"],
           "primaer_gelesen": e["korrektur"]["primaer_gelesen"], "begruendung": e["korrektur"]["begruendung"],
           "warum_nicht_zugeordnet": e["grund"]} for e in d["nicht_zugeordnet"]]
    quellen = {"d%02d" % n: dossiers[n]["daten"].get("sources", {}) for n in sorted(dossiers)}
    dopp = []
    for e in DOPPLUNGEN:
        eintraege = []
        for b in e["ids"]:
            rec = d["params"][(int(b[1:3]), b[4:])]
            eintraege.append({"id": b, "wert": fmt_wert(rec), "einheit": rec["unit"], "confidence": rec["confidence"], "pruefstatus": rec["pruefstatus"]})
        dopp.append({"groesse": e["groesse"], "urteil": e["urteil"], "eintraege": eintraege, "text": e["text"],
                     "sieger": None})
    stat = defaultdict(lambda: defaultdict(int))
    for key in reihenfolge:
        stat["d%02d" % key[0]][params[key]["pruefstatus"]] += 1
    out = {
        "meta": {
            "title": "Konsolidierter, geprüfter Parametersatz der Energiewende-Reihe",
            "generated_by": "scripts/consolidate_params.py",
            "stand": stand,
            "eingaben": ["research/00_*.md bis 10_*.md (JSON-Block parameters und sources)",
                         "research/pruefung/01_*.md bis 10_*.md (JSON-Block korrekturen und Prüftabelle)",
                         "README.md, Tabelle Entscheidungen (Michael, 22.11.2026)"],
            "massgeblich": "Dieses Dokument. Die Dossiers bleiben als historischer Stand unverändert.",
            "confidence_scale": {"A": "mehrere unabhängige Quellen übereinstimmend und primär gelesen",
                                 "B": "eine Quelle, plausibel (oder A-Kandidat mit nur einer Quelle)",
                                 "C": "kursiert, Primärquelle nicht geprüft"},
            "pruefstatus": {"bestätigt": "in der Prüftabelle als bestätigt geführt, keine Korrektur",
                            "korrigiert": "Prüfbericht hat den Eintrag korrigiert (wert_vor_pruefung, begruendung, korrektur_art)",
                            "nicht prüfbar": "Prüfer konnte die Stelle nicht lesen",
                            "nicht in der Stichprobe": "vom Prüfer nicht einzeln geprüft"},
            "korrektur_art": {"wert": "Wert oder Bandbreite geändert", "text": "Notiz, Abgrenzung oder Einheit geändert",
                              "fundstelle": "Fundstelle korrigiert", "konfidenz": "Konfidenz oder primaer_gelesen geändert",
                              "hinweis": "Hinweis des Prüfers als pruefnotiz übernommen"},
            "konfidenz_regel": "A nur bei mehreren unabhängigen Quellen und primaer_gelesen true; Ausnahmen mit ausdrücklich genannter zweiter Quelle im Feld zweite_quelle; sonst B (Feld konfidenz_regel).",
            "zaehlung": d["zaehlung"],
            "pruefstatus_je_dossier": {k: dict(sorted(v.items())) for k, v in sorted(stat.items())},
        },
        "quellen": quellen,
        "entscheidungen": d["entscheidungen"],
        "parameters": [params[k] for k in reihenfolge],
        "textkorrekturen": textkorr,
        "nicht_zugeordnete_korrekturen": nz,
        "dopplungen": dopp,
        "gaps": GAPS,
        "herabstufungen": d["herabstufungen"],
        "hochstufungen": d["hochstufungen"],
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


STATI = ["bestätigt", "korrigiert", "nicht prüfbar", "nicht in der Stichprobe"]


def schreibe_bericht(d, out):
    params, reihenfolge, z = d["params"], d["reihenfolge"], d["zaehlung"]
    L = []
    w = L.append
    w("# Konsolidierung · Geprüfter Parametersatz (Phase 3, Auftrag P3-A)")
    w("")
    w("Stand 22.11.2026 · erzeugt von `scripts/consolidate_params.py` · Ergebnis: `data/model_params.json` · "
      "maßgeblich für Modell und Seiten ist allein diese Datei; die Dossiers 00 bis 10 bleiben als historischer Stand unverändert.")
    w("")
    w("## 1. Bilanz")
    w("")
    w("| Größe | Zahl |")
    w("|---|---:|")
    w("| Parameter in den Dossiers 00 bis 10 (Eingang) | %d |" % z["parameter_eingang"])
    w("| Parameter in `model_params.json` (Ausgang) | %d |" % z["parameter_ausgang"])
    w("| Korrekturen in den zehn Prüfberichten | %d |" % z["korrekturen_gesamt"])
    w("| davon angewendet (Parameter-ID, auch über Zusatz-Zuordnung) | %d |" % z["korrekturen_angewendet"])
    w("| davon Textkorrektur (Kernaussage, Textstelle, neuer Wert ohne Parameter) | %d |" % z["korrekturen_text"])
    w("| davon nicht zugeordnet (Zweifelsfall, nicht geraten) | %d |" % z["korrekturen_nicht_zugeordnet"])
    w("| Herabstufungen der Konfidenz (Prüfbericht, Prüftabelle, Regel A) | %d |" % z["herabstufungen"])
    w("| Hochstufungen | %d |" % z["hochstufungen"])
    w("")
    w("Die Summen gehen auf: %d = %d + %d + %d; kein Parameter ist verschwunden. Die Parameter-IDs tragen ein Dossier-Präfix (`d05.…`), weil vier IDs "
      "(`r21_factsheet_a_batterie_bio_eur`, `r21_ets_minderung_seit_2005_pct`, `r21_zew_ersparnis_mrd_eur`, `elektrolyse_wirkungsgrad`) in zwei Dossiers vorkommen." %
      (z["korrekturen_gesamt"], z["korrekturen_angewendet"], z["korrekturen_text"], z["korrekturen_nicht_zugeordnet"]))
    w("")
    w("## 2. Parameter je Dossier und Prüfstatus")
    w("")
    w("| Dossier | Parameter | bestätigt | korrigiert | nicht prüfbar | nicht in der Stichprobe | A | B | C |")
    w("|---|---:|---:|---:|---:|---:|---:|---:|---:|")
    tot = defaultdict(int)
    for n in DOSSIERS:
        keys = [k for k in reihenfolge if k[0] == n]
        c = defaultdict(int)
        for k in keys:
            c[params[k]["pruefstatus"]] += 1
            c["conf" + params[k]["confidence"]] += 1
        w("| %s | %d | %d | %d | %d | %d | %d | %d | %d |" % (d["dossiers"][n]["name"], len(keys), c["bestätigt"], c["korrigiert"], c["nicht prüfbar"],
                                                              c["nicht in der Stichprobe"], c["confA"], c["confB"], c["confC"]))
        tot["n"] += len(keys)
        for s in STATI:
            tot[s] += c[s]
        for L_ in "ABC":
            tot["conf" + L_] += c["conf" + L_]
    w("| **Summe** | **%d** | **%d** | **%d** | **%d** | **%d** | **%d** | **%d** | **%d** |" % (
        tot["n"], tot["bestätigt"], tot["korrigiert"], tot["nicht prüfbar"], tot["nicht in der Stichprobe"], tot["confA"], tot["confB"], tot["confC"]))
    w("")
    w("Der Prüfstatus stammt aus der Prüftabelle (Abschnitt 2 des Prüfberichts) und dem `korrekturen`-Block; ")
    w("wo ein Parameter nur im Fließtext des Prüfberichts als geprüft genannt ist, steht die Stelle im Feld `pruefergebnis` "
      "(%d Parameter, Tabelle `PRUEFSTATUS_MANUELL` im Skript). „Korrigiert“ heißt: Der Prüfbericht hat den Eintrag geändert, auch wenn nur Fundstelle, Konfidenz oder Abgrenzung betroffen sind (Feld `korrektur_art`). "
      "Die Konfidenzspalten zeigen den Stand nach Prüfung und Regel A." % len(PRUEFSTATUS_MANUELL))
    w("")

    # --- 3. Angewendete Korrekturen
    w("## 3. Angewendete Korrekturen (alt → neu)")
    w("")
    w("Je Zeile eine Korrektur eines Prüfberichts, die einem Parameter zugeordnet ist. „Art“: wert · text · fundstelle · konfidenz · hinweis (siehe `meta.korrektur_art`). "
      "Bei Wertänderungen steht der Wert vor und nach der Prüfung; bei den übrigen der Wortlaut des Prüfers.")
    w("")
    w("| Parameter | Art | alt | neu | Konfidenz |")
    w("|---|---|---|---|---|")
    for e in d["korrektur_log"]:
        rec = params[e["key"]]
        arten = ", ".join(e["arten"])
        if "wert" in e["arten"]:
            alt = fmt_wert({**e["vor"]})
            neu = fmt_wert({k: rec[k] for k in VALUE_KEYS if k in rec})
        elif "fundstelle" in e["arten"] and set(e["arten"]) <= {"fundstelle", "konfidenz"} and "fundstelle_vor_pruefung" in rec:
            alt = "Fundstelle: " + rec["fundstelle_vor_pruefung"]
            neu = "Fundstelle: " + rec["fundstelle"]
            if e["zusatz"]:
                alt = "(gilt laut Korrektur auch hier) " + alt
        else:
            k = e["korrektur"]
            alt = k["alt"] if isinstance(k["alt"], str) else kompakt(k["alt"])
            neu = k["neu"] if isinstance(k["neu"], str) else kompakt(k["neu"])
            if e["zusatz"]:
                alt = "(gilt laut Korrektur auch hier) " + alt
        kv = rec.get("konfidenz_vor_pruefung")
        kstr = ("%s → %s" % (kv["confidence"], rec["confidence"])) if kv else rec["confidence"]
        w("| `%s`%s | %s | %s | %s | %s |" % (rec["id"], " (Zusatz)" if e["zusatz"] else "", arten, md_cell(alt, 170), md_cell(neu, 190), kstr))
    w("")
    w("Zusatz-Zuordnungen (eine Korrektur, mehrere Parameter, im Text der Korrektur ausdrücklich genannt): "
      + "; ".join("`%s` → %s" % (pid(*k), ", ".join("`%s`" % pid(*v) for v in vs)) for k, vs in sorted(ZUSATZ_ZUORDNUNG.items())) + ".")
    w("")

    # --- 4. Text und nicht zugeordnet
    w("## 4. Nicht auf Parameter angewendete Korrekturen")
    w("")
    w("### 4.1 Textkorrekturen (%d)" % z["korrekturen_text"])
    w("")
    w("Diese Korrekturen betreffen Kernaussagen, Textstellen oder Zahlen ohne Parameter-ID im Dossier; sie stehen unverändert in `textkorrekturen` (je Dossier). "
      "Einordnung: `kernaussage` = Aussage des Dossiers, `text` = Zahl oder Formulierung im Fließtext, `neuer_wert` = Wert, den der Prüfer neu gefunden hat und der noch kein Parameter ist.")
    w("")
    w("| Dossier | ID | Einordnung | alt | neu |")
    w("|---|---|---|---|---|")
    for n in sorted(d["text_korr"]):
        for e in d["text_korr"][n]:
            k = e["korrektur"]
            alt = k["alt"] if isinstance(k["alt"], str) else kompakt(k["alt"])
            neu = k["neu"] if isinstance(k["neu"], str) else kompakt(k["neu"])
            w("| %02d | `%s` | %s | %s | %s |" % (n, k["id"], e["art"], md_cell(alt, 110), md_cell(neu, 150)))
    w("")
    w("### 4.2 Nicht zugeordnet (%d)" % z["korrekturen_nicht_zugeordnet"])
    w("")
    w("Zweifelsfälle: Name oder Thema passen zu einem Parameter, der Gegenstand aber nicht eindeutig. Sie werden **nicht** angewendet; "
      "die Zuordnung braucht eine Entscheidung (Tabelle `NICHT_ZUGEORDNET` im Skript, je Zeile begründet).")
    w("")
    w("| Dossier | ID | alt → neu | Warum nicht zugeordnet |")
    w("|---|---|---|---|")
    for e in d["nicht_zugeordnet"]:
        k = e["korrektur"]
        alt = k["alt"] if isinstance(k["alt"], str) else kompakt(k["alt"])
        neu = k["neu"] if isinstance(k["neu"], str) else kompakt(k["neu"])
        w("| %02d | `%s` | %s → %s | %s |" % (e["dossier"], k["id"], md_cell(alt, 90), md_cell(neu, 130), md_cell(e["grund"], 330)))
    w("")
    w("### 4.3 Zuordnungstabelle (Begründung je Zeile)")
    w("")
    w("| Regel | Eintrag | Begründung |")
    w("|---|---|---|")
    w("| Zusatz-Zuordnung | `d01.uba_vorkette_pipeline_norwegen_g_gj` → auch `d01.uba_vorkette_lng_usa_g_gj` | Die Begründung der Korrektur sagt wörtlich: „gilt auch für uba_vorkette_lng_usa_g_gj“ (gleiche Quelle UBA CC 21/2019, gleiche Seitenkonkordanz). |")
    w("| Zusatz-Zuordnung | `d06.ntc_2040_2045_pfad_ab_gw` → auch `d06.ntc_2045_pfad_c_gw`, `d06.ntc_bmwe_o45_strom_gw` | Die Begründung nennt beide IDs; der Prüfbericht 06 führt `ntc_2045_pfad_c_gw` zusätzlich mit „Seite 122“. |")
    w("| Konfidenz-Ausnahme | `d02.aurora_gesamtkosten_bio_eur` | Die Korrektur trägt A/true für die Drucksache 21/903 (Urheberschaft der 172 Mrd. EUR/a), nicht für die Aurora-Zahl; Prüfbericht 02 führt die Aurora-Zahl weiter als C/false. |")
    w("| Konfidenz-Ausnahme | `d07.eu_extra_import_china_anteil_pv_module_2025_pct` | primaer_gelesen false der Korrektur gilt dem Zollkontext (Suchtreffer); der Wert 98,4 % ist am Comext-Original bestätigt. |")
    w("| Konfidenz-Ausnahme | `d07.de_importabhaengigkeit_gas_2024_pct` | Prüfbericht: A nur für „über 90 %“, der Punktwert ist methodenabhängig (Eurostat 91,6 gegen AGEB 95,6): Punktwert B, Spanne als Feld `spanne`. |")
    w("| nicht zugeordnet | `d04.strom_2045_dena`, `d08.ptl_wirkungsgrad_kerosin_low`, `d08.D_EF_setzung`, `d02.uba_kostensatz_mk40_eur_t` | siehe 4.2. |")
    w("| Text, obwohl ID ähnlich | `d09.kernaussage_2_erster_block` | Der Parameter `neubau_de_erster_block_jahr` (2040 / 2047 / 2056) ist richtig; die Kernaussage des Dossiers war inkonsistent und wird auf den Parameter angeglichen. Korrigiert wird der Text, nicht der Parameter. |")
    w("| Text, obwohl Wert verwandt | `d01.ewi_netzausbau_2045_mrd_eur` | Dasselbe Thema wie `d02.efruhr_ewi_netzinvestitionen_mrd_eur` (732 Mrd. EUR), aber Dossier 01 führt keinen Parameter dazu; die Korrektur von Dossier 02 ist angewendet, die Dopplung in Abschnitt 7 gelistet. |")
    w("| Text, obwohl Wert verwandt | `d03.kernaussage_7_ec_vs_uba_2015_2022` | Betrifft die Spanne 2015-2022 im Text; der Parameter `ec_vs_uba_netto_abweichung_wind_pv_pct` (2015-2025: -2,7 / 0,0 / 1,0) ist laut Prüfbericht richtig. |")
    w("")

    # --- 5. Herabstufungen
    w("## 5. Herabstufungen und Hochstufungen der Konfidenz")
    w("")
    w("### 5.1 Herabstufungen (%d)" % len(d["herabstufungen"]))
    w("")
    w("| Parameter | von | nach | primaer_gelesen | Grund |")
    w("|---|---|---|---|---|")
    for e in d["herabstufungen"]:
        grund = {"Regel A": "Regel A: nur eine Quelle (oder nicht primär gelesen)", "Prüfbericht": "Prüfbericht schlägt Herabstufung vor", "Prüftabelle": "Prüftabelle"}[e["quelle"]]
        w("| `%s` | %s | %s | %s → %s | %s |" % (e["id"], e["von"], e["nach"], str(e["pg_von"]).lower(), str(e["pg_nach"]).lower(), grund))
    w("")
    w("Davon durch die Regel „A nur bei mehreren unabhängigen Quellen und primär gelesen“ (Parameter, die A tragen, aber nur eine Quelle nennen): **%d**. "
      "Ausgenommen sind %d Parameter, bei denen der Prüfbericht ausdrücklich eine zweite unabhängige Quelle nennt (Feld `zweite_quelle`, Tabelle `ZWEITE_QUELLE` im Skript): %s." % (
          len(d["regel_a"]), sum(1 for k in reihenfolge if "zweite_quelle" in params[k]),
          ", ".join("`%s`" % params[k]["id"] for k in reihenfolge if "zweite_quelle" in params[k]) or "keine"))
    w("")
    w("### 5.2 Hochstufungen (%d)" % len(d["hochstufungen"]))
    w("")
    w("| Parameter | von | nach | primaer_gelesen | Quelle |")
    w("|---|---|---|---|---|")
    for e in d["hochstufungen"]:
        w("| `%s` | %s | %s | %s → %s | %s |" % (e["id"], e["von"], e["nach"], str(e["pg_von"]).lower(), str(e["pg_nach"]).lower(), e["quelle"]))
    w("")

    # --- 6. Entscheidungen
    w("## 6. Entscheidungen von Michael, eingearbeitet")
    w("")
    w("Quelle der Überschreibung: „%s“ (Feld `source`; die frühere Quelle steht in `quelle_vor_entscheidung`, der Wert davor in `ueberschreibung`)." % ENTSCHEIDUNG_QUELLE)
    w("")
    w("| Nr. | Thema | Festlegung | Parameter | Anmerkung |")
    w("|---|---|---|---|---|")
    for e in d["entscheidungen"]:
        betr = e["betrifft"]
        bt = ", ".join("`%s`" % b for b in betr[:6]) + (" … (+%d)" % (len(betr) - 6) if len(betr) > 6 else "")
        w("| %s | %s | %s | %s | %s |" % (e["id"], e["thema"], md_cell(e["text"], 200), bt, md_cell(e["hinweis"], 330)))
    w("")

    # --- 7. Dopplungen
    w("## 7. Dopplungen zwischen den Dossiers")
    w("")
    w("Dieselbe Größe steht in mehreren Dossiers. Es wird **kein Sieger** gewählt; „Urteil“ sagt nur, ob die Werte sich widersprechen (gleiche Größe, verschiedene Zahl), verschieden abgegrenzt sind oder übereinstimmen. "
      "Die Widersprüche sind offene Punkte (Abschnitt 8).")
    w("")
    for e in out["dopplungen"]:
        w("### %s · %s" % (e["groesse"], e["urteil"]))
        w("")
        w("| Parameter | Wert | Einheit | Konf. | Prüfstatus |")
        w("|---|---|---|---|---|")
        for x in e["eintraege"]:
            w("| `%s` | %s | %s | %s | %s |" % (x["id"], md_cell(x["wert"], 120), md_cell(x["einheit"], 60), x["confidence"], x["pruefstatus"]))
        w("")
        w(e["text"])
        w("")
    w("Zählung: %d Dopplungen, davon %d Widerspruch, %d Abgrenzung, %d übereinstimmend." % (
        len(out["dopplungen"]), sum(1 for e in out["dopplungen"] if e["urteil"] == "WIDERSPRUCH"),
        sum(1 for e in out["dopplungen"] if e["urteil"] == "ABGRENZUNG"), sum(1 for e in out["dopplungen"] if e["urteil"] == "ÜBEREINSTIMMEND")))
    w("")

    # --- 8. Offene Punkte
    w("## 8. Offene Punkte (Entscheidung nötig)")
    w("")
    w("1. **BIP-Basis:** 4,47 (Weltbank) gegen 4,5297 Bio. EUR (Eurostat) für 2025; Teil 1 braucht eine Basis für „x-faches BIP“.")
    w("2. **Elektrolyse-Wirkungsgrad:** d04 min 0,60, d08 min 0,64 – gleiche ID, kein Prüfbericht legt die Untergrenze fest.")
    w("3. **EUA-Preis:** zwei Werte aus zwei Dossiers (74-88 gegen 81-91 EUR/t), beide ohne Primärbeleg.")
    w("4. **CO₂-Kostensatz:** Konvention 3.2 (300/880 EUR2024, C) oder 4.0 (345/990 EUR2025, B); die Korrektur `uba_kostensatz_mk40_eur_t` ist nicht zugeordnet.")
    w("5. **Strombedarf 2045 aus dem NEP:** brutto (d04) oder netto (d05) als Modellgröße.")
    w("6. **Netzentgelt Haushalt 2025:** 10,6 ct/kWh netto (d05) gegen 11,30 ct/kWh Eurostat (d10), Abgrenzung nicht belegt.")
    w("7. **Dunkelflaute (Entscheidung E08):** Die Ereignisparameter in d05 beruhen auf dem 6-h-Mittel, die in d03 auf dem Stundenkriterium; nach der Entscheidung („Tagesmittel“) sind sie neu auszuzählen. Das ist Modellarbeit, nicht Konsolidierung.")
    w("8. **Wasserstoff-Lkw (E04):** Die Mitte ist mit dem UBA-Verhältnis (115 TWh) gesetzt, `min`, `max` und die GW-Werte sind nicht neu gerechnet.")
    w("9. **Gaspreis-Regler (E01):** Der Höchstwert 85 EUR/MWh liegt unter dem TTF-Stand November 2026 (85,5-88,5). Festlegung bleibt, der Hinweis steht im Parameter.")
    w("10. **PwC und ifo (E11):** Beide Originale bleiben ungelesen; Teil 1 muss das offen ausweisen.")
    w("11. **Dossier 00:** Kein eigener Prüfbericht; Werte tragen `nicht in der Stichprobe`, die Regel A senkt die R21-Zitate auf B.")
    w("")

    # --- 9. Lücken
    w("## 9. Lücken, die das Modell blockieren")
    w("")
    w("Aus den Abschnitten „Lücken“ der Dossiers, den Prüfberichten und den C-Parametern tragender Größen (vollständig in `gaps`). „Teil“ nennt den Teil der Reihe, den die Lücke berührt.")
    w("")
    w("| Nr. | Dossier | Art | Teil | Lücke |")
    w("|---|---|---|---|---|")
    for g in GAPS:
        w("| %s | %s | %s | %s | %s |" % (g["id"], g["dossier"], g["art"], g["teil"], md_cell(g["text"], 420)))
    w("")
    cs = defaultdict(int)
    for k in reihenfolge:
        if params[k]["confidence"] == "C":
            cs[k[0]] += 1
    w("Parameter mit Konfidenz C nach Prüfung: %s (insgesamt %d von %d)." % (
        ", ".join("d%02d: %d" % (n, cs[n]) for n in DOSSIERS if cs[n]), sum(cs.values()), len(reihenfolge)))
    w("")
    w("## 10. Prüfung dieser Arbeit")
    w("")
    w("- Das Skript läuft zweimal mit identischer Ausgabe (SHA-256 von `model_params.json` und `konsolidierung.md` verglichen).")
    w("- Jede der %d Korrekturen erscheint genau einmal: angewendet (%d), Text (%d) oder nicht zugeordnet (%d)." % (
        z["korrekturen_gesamt"], z["korrekturen_angewendet"], z["korrekturen_text"], z["korrekturen_nicht_zugeordnet"]))
    w("- Eingangs- und Ausgangsparameter: %d = %d." % (z["parameter_eingang"], z["parameter_ausgang"]))
    w("- Das Skript bricht ab, wenn eine Korrektur mit Parameter-ID keine Aktion hat, eine Zuordnung auf einen unbekannten Parameter zeigt, eine Prüftabelle „abweichend“ ohne Korrektur meldet oder die Summen nicht aufgehen.")
    w("")
    OUT_MD.write_text("\n".join(L), encoding="utf-8")


HINWEIS = ("> Stand Phase 1. Geprüft in `pruefung/%02d_pruefung.md`; maßgeblich sind die korrigierten Werte in `data/model_params.json`.")


def setze_hinweise():
    for n in range(1, 11):
        pfad = find_file(RESEARCH, n)
        zeilen = pfad.read_text(encoding="utf-8").split("\n")
        zeile = HINWEIS % n
        if any(z.startswith("> Stand Phase 1. Geprüft in") for z in zeilen[:6]):
            continue
        if not zeilen[0].startswith("#"):
            raise SystemExit("Dossier %02d beginnt nicht mit einer Überschrift" % n)
        if len(zeilen) > 1 and zeilen[1].strip() == "":
            neu = zeilen[:2] + [zeile, ""] + zeilen[2:]
        else:
            neu = zeilen[:1] + ["", zeile, ""] + zeilen[1:]
        pfad.write_text("\n".join(neu), encoding="utf-8")


def main():
    d = baue()
    out = schreibe_json(d)
    schreibe_bericht(d, out)
    if "--hinweise" in sys.argv:
        setze_hinweise()
    z = d["zaehlung"]
    print("Parameter %d -> %d; Korrekturen %d = %d angewendet + %d Text + %d nicht zugeordnet" % (
        z["parameter_eingang"], z["parameter_ausgang"], z["korrekturen_gesamt"], z["korrekturen_angewendet"], z["korrekturen_text"], z["korrekturen_nicht_zugeordnet"]))


if __name__ == "__main__":
    main()
