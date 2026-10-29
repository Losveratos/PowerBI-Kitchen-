#!/usr/bin/env python3
"""
fetch_hourly_2024.py
=====================
Beschafft echte stündliche Zeitreihen für Deutschland, Kalenderjahr 2024
(01.01.2024 00:00 – 31.12.2024 23:00, 8784 Stunden, Schaltjahr):

  - Netzlast (Stromverbrauch, Gesamt)
  - Photovoltaik
  - Wind Onshore
  - Wind Offshore
  - Wasserkraft (Laufwasser)
  - Biomasse

Quellen-Priorität (siehe CLAUDE.md / Auftrag):
  1. Energy-Charts-API (Fraunhofer ISE)   https://api.energy-charts.info
  2. SMARD-API (Bundesnetzagentur)        https://www.smard.de/app/chart_data/...
  3. Open Power System Data (Fallback)    https://data.open-power-system-data.org
  4. [Sandbox-Notlösung] öffentlicher GitHub-Mirror von SMARD-Exportdaten,
     NUR falls 1-3 wegen Netzwerk-Policy nicht erreichbar sind. Diese Quelle
     ist NICHT vollständig (siehe Kopfzeilen-Kommentar in der Ausgabedatei)
     und dient nur dazu, die Pipeline mit echten (wenn auch unvollständigen)
     Zahlen durchspielen zu können, statt gar keine Daten zu liefern.

Ausgabe: CSV-Dateien nach strommix/data/raw/, jeweils mit Kommentar-Kopfzeilen
(Quelle, Endpunkt, Abrufdatum, Lizenz, bekannte Lücken).

WICHTIG: Es werden an keiner Stelle Zahlen erfunden oder synthetisch für
fehlende Stunden/Reihen aufgefüllt. Was nicht aus einer echten, dokumentierten
Quelle stammt, bleibt NaN / fehlt in der Ausgabe und wird im Report als Lücke
gezählt.
"""
from __future__ import annotations

import io
import json
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

# --------------------------------------------------------------------------
# Konfiguration
# --------------------------------------------------------------------------

YEAR = 2024
START = f"{YEAR}-01-01"
END = f"{YEAR}-12-31"  # inklusive, energy-charts end ist inklusiv des Tages
EXPECTED_HOURS = 8784  # 2024 ist Schaltjahr: 366 * 24

REPO_ROOT = Path(__file__).resolve().parents[1]  # strommix/
RAW_DIR = REPO_ROOT / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

RETRIEVED_AT = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# Zielreihen: interner Name -> (Einheit, Pflicht?)
SERIES = {
    "load_mw": ("MW", True),          # Netzlast / Stromverbrauch
    "solar_mw": ("MW", True),         # Photovoltaik
    "wind_onshore_mw": ("MW", True),  # Wind Onshore
    "wind_offshore_mw": ("MW", True), # Wind Offshore
    "hydro_ror_mw": ("MW", False),    # Laufwasser / Wasserkraft
    "biomass_mw": ("MW", False),      # Biomasse
}

# energy-charts `production_types[].name` -> interner Name
# (die API liefert je nach Land/Zeitraum leicht unterschiedliche Labels,
# daher case-insensitive Teilstring-Suche in fetch_energy_charts())
ENERGY_CHARTS_NAME_MAP = {
    "load": "load_mw",
    "solar": "solar_mw",
    "wind offshore": "wind_offshore_mw",
    "wind onshore": "wind_onshore_mw",
    "hydro run-of-river": "hydro_ror_mw",
    "biomass": "biomass_mw",
}

# SMARD-Filter-IDs (Region DE), dokumentiert in
# https://github.com/bundesAPI/smard-api/blob/main/README.md
SMARD_FILTERS = {
    "load_mw": "410",           # Stromverbrauch: Gesamt (Netzlast)
    "solar_mw": "4068",         # Stromerzeugung: Photovoltaik
    "wind_onshore_mw": "4067",  # Stromerzeugung: Wind Onshore
    "wind_offshore_mw": "1225", # Stromerzeugung: Wind Offshore
    "hydro_ror_mw": "1226",     # Stromerzeugung: Wasserkraft
    "biomass_mw": "4066",       # Stromerzeugung: Biomasse
}
SMARD_BASE = "https://www.smard.de/app/chart_data"
SMARD_REGION = "DE"

OPSD_TIME_SERIES_URL = (
    "https://data.open-power-system-data.org/time_series/latest/"
    "time_series_60min_singleindex.csv"
)

# Sandbox-Notlösung: öffentlicher GitHub-Mirror von SMARD-Exportdaten
# (private Auswertung, keine offizielle Fraunhofer/BNetzA-Quelle, aber
# Zahlen sind reale SMARD-Downloads, siehe Kopf der Ausgabedatei).
GITHUB_MIRROR_REPO = "https://github.com/hakimdalim/smard-data-extractor"
GITHUB_MIRROR_CSV = "juli24-25_energie_zusammengefasst_mit_aufloesung.csv"
GITHUB_MIRROR_COLMAP = {
    "Wind Onshore [MWh] Berechnete Auflösungen": "wind_onshore_mw",  # Werte sind MWh/h == MW im Stundenmittel
    "Photovoltaik [MWh] Berechnete Auflösungen": "solar_mw",
    "Netzlast [MWh] Berechnete Auflösungen": "load_mw",
}

TIMEOUT = 30
HEADERS = {"User-Agent": "strommix-whitepaper/1.0 (+https://github.com/, research use)"}


class SourceUnavailable(Exception):
    """Eine Datenquelle konnte nicht erreicht / nicht geparst werden."""


# --------------------------------------------------------------------------
# Quelle 1: Energy-Charts API
# --------------------------------------------------------------------------

def fetch_energy_charts() -> pd.DataFrame:
    """Holt öffentliche Erzeugung + Last für DE, Kalenderjahr 2024.

    Endpoint: GET https://api.energy-charts.info/public_power
              ?country=de&start=2024-01-01&end=2024-12-31
    Die API liefert für DE 15-Minuten-Auflösung; wir aggregieren auf Stunden
    (Mittelwert MW -> das entspricht bei Stundenmitteln auch MWh/h).
    Aus API-Limits heraus wird monatsweise abgefragt und zusammengefügt.
    """
    frames = []
    session = requests.Session()
    session.headers.update(HEADERS)

    for month in range(1, 13):
        m_start = f"{YEAR}-{month:02d}-01"
        if month == 12:
            m_end = f"{YEAR}-12-31"
        else:
            next_month_first = pd.Timestamp(year=YEAR, month=month + 1, day=1)
            m_end = (next_month_first - pd.Timedelta(days=1)).strftime("%Y-%m-%d")

        url = "https://api.energy-charts.info/public_power"
        params = {"country": "de", "start": m_start, "end": m_end}
        try:
            resp = session.get(url, params=params, timeout=TIMEOUT)
            resp.raise_for_status()
        except requests.RequestException as e:
            raise SourceUnavailable(f"energy-charts.info: {e}") from e

        payload = resp.json()
        ts = pd.to_datetime(payload["unix_seconds"], unit="s", utc=True)
        month_df = pd.DataFrame(index=ts)
        for series in payload.get("production_types", []):
            name = (series.get("name") or "").strip().lower()
            for key, target in ENERGY_CHARTS_NAME_MAP.items():
                if key in name:
                    month_df[target] = series.get("data")
                    break
        frames.append(month_df)

    df = pd.concat(frames).sort_index()
    df = df[~df.index.duplicated(keep="first")]
    # Auf Stunden aggregieren (Mittelwert, falls Rohauflösung < 1h)
    hourly = df.resample("1h").mean()
    return hourly


# --------------------------------------------------------------------------
# Quelle 2: SMARD API (Bundesnetzagentur)
# --------------------------------------------------------------------------

def _smard_available_timestamps(filter_id: str) -> list[int]:
    url = f"{SMARD_BASE}/{filter_id}/{SMARD_REGION}/index_hour.json"
    resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()["timestamps"]


def _smard_series_for_timestamp(filter_id: str, timestamp_ms: int) -> pd.Series:
    url = (
        f"{SMARD_BASE}/{filter_id}/{SMARD_REGION}/"
        f"{filter_id}_{SMARD_REGION}_hour_{timestamp_ms}.json"
    )
    resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    series = resp.json()["series"]
    idx = pd.to_datetime([p[0] for p in series], unit="ms", utc=True)
    vals = [p[1] for p in series]
    return pd.Series(vals, index=idx)


def fetch_smard() -> pd.DataFrame:
    """SMARD liefert Chunks ab einem Start-Timestamp; wir picken den größten
    verfügbaren Timestamp <= 2024-01-01 und lesen den Chunk, der 2024
    abdeckt (SMARD-Chunks sind i.d.R. mehrere Monate lang)."""
    out = {}
    for target, filter_id in SMARD_FILTERS.items():
        try:
            timestamps = _smard_available_timestamps(filter_id)
        except requests.RequestException as e:
            raise SourceUnavailable(f"smard.de index ({target}): {e}") from e

        year_start_ms = int(pd.Timestamp(f"{YEAR}-01-01", tz="UTC").timestamp() * 1000)
        candidates = [t for t in timestamps if t <= year_start_ms]
        pick = max(candidates) if candidates else min(timestamps)

        try:
            s = _smard_series_for_timestamp(filter_id, pick)
        except requests.RequestException as e:
            raise SourceUnavailable(f"smard.de chunk ({target}): {e}") from e

        out[target] = s

    df = pd.DataFrame(out)
    df = df.loc[f"{YEAR}-01-01":f"{YEAR}-12-31 23:00"]
    return df


# --------------------------------------------------------------------------
# Quelle 3: Open Power System Data
# --------------------------------------------------------------------------

def fetch_opsd() -> pd.DataFrame:
    """OPSD `time_series` wurde 2020 eingestellt und enthält keine 2024er
    Daten mehr; Aufruf bleibt der Vollständigkeit halber implementiert,
    schlägt aber für 2024 erwartbar fehl (Spalten fehlen bzw. Zeitraum
    endet vor 2024)."""
    try:
        resp = requests.get(OPSD_TIME_SERIES_URL, headers=HEADERS, timeout=60)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise SourceUnavailable(f"open-power-system-data.org: {e}") from e

    df = pd.read_csv(io.StringIO(resp.text), parse_dates=["utc_timestamp"], index_col="utc_timestamp")
    df = df.loc[f"{YEAR}-01-01":f"{YEAR}-12-31 23:00"]
    if df.empty:
        raise SourceUnavailable("open-power-system-data.org: keine Daten für 2024 im Datensatz (Projekt seit 2020 eingestellt)")

    colmap = {
        "DE_load_actual_entsoe_transparency": "load_mw",
        "DE_solar_generation_actual": "solar_mw",
        "DE_wind_onshore_generation_actual": "wind_onshore_mw",
        "DE_wind_offshore_generation_actual": "wind_offshore_mw",
    }
    df = df.rename(columns=colmap)
    keep = [c for c in colmap.values() if c in df.columns]
    return df[keep]


# --------------------------------------------------------------------------
# Quelle 4 (Sandbox-Notlösung): GitHub-Mirror echter SMARD-Exportdaten
# --------------------------------------------------------------------------

def fetch_github_mirror() -> tuple[pd.DataFrame, str]:
    """Klont ein öffentliches GitHub-Repo, das reale SMARD-Stundenexporte
    (Wind Onshore, Photovoltaik, Netzlast) als CSV eincheckt, und liest
    daraus den 2024er Anteil (Juli-Dezember 2024) heraus.

    Das ist AUSDRÜCKLICH eine Notlösung für Sandbox-Umgebungen ohne
    Zugriff auf api.energy-charts.info / smard.de / open-power-system-data.org
    (Egress-Policy blockiert diese Hosts, siehe research/daten_stundenprofile.md).
    Liefert echte, aber UNVOLLSTÄNDIGE Daten:
      - nur Juli-Dezember 2024 (kein Jan-Jun 2024)
      - nur Wind Onshore, Photovoltaik, Netzlast (kein Wind Offshore,
        Wasserkraft, Biomasse)
    """
    with tempfile.TemporaryDirectory() as tmp:
        try:
            subprocess.run(
                ["git", "clone", "--depth", "1", GITHUB_MIRROR_REPO, tmp],
                check=True, capture_output=True, text=True, timeout=120,
            )
            commit = subprocess.run(
                ["git", "-C", tmp, "rev-parse", "HEAD"],
                check=True, capture_output=True, text=True,
            ).stdout.strip()
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
            raise SourceUnavailable(f"github-mirror clone fehlgeschlagen: {e}") from e

        csv_path = Path(tmp) / GITHUB_MIRROR_CSV
        if not csv_path.exists():
            raise SourceUnavailable(f"github-mirror: Datei {GITHUB_MIRROR_CSV} nicht im Repo gefunden")

        raw = pd.read_csv(csv_path, sep=";", encoding="utf-8")

    def de_number(series: pd.Series) -> pd.Series:
        return (
            series.astype(str)
            .str.replace(".", "", regex=False)
            .str.replace(",", ".", regex=False)
            .astype(float)
        )

    # Hinweis Zeitzone: SMARD-Exporte sind in lokaler Zeit Europe/Berlin,
    # DST-Umstellungen führen im Rohexport zu 23/25-Stunden-Tagen. Ein
    # sauberes tz_localize über den vollen Zeitraum ist mit den doppelten/
    # fehlenden Stunden an den Umstellungstagen nicht robust möglich; wir
    # behalten daher den Zeitstempel als naive lokale Zeit (Europe/Berlin)
    # bei und dokumentieren das explizit im CSV-Header. Für die spätere
    # Normierung (build_profiles.py, Jahressummen) ist das unkritisch, für
    # eine exakte UTC-Stunden-Simulation müsste an den zwei DST-Tagen manuell
    # nachjustiert werden (siehe research/daten_stundenprofile.md).
    ts = pd.to_datetime(raw["Datum von"], format="%d.%m.%Y %H:%M")

    out = pd.DataFrame(index=ts)
    for col, target in GITHUB_MIRROR_COLMAP.items():
        out[target] = de_number(raw[col]).to_numpy()

    out = out[~out.index.duplicated(keep="first")].sort_index()
    out = out.loc[f"{YEAR}-01-01":f"{YEAR}-12-31 23:00"]
    return out, commit


# --------------------------------------------------------------------------
# Orchestrierung
# --------------------------------------------------------------------------

@dataclass
class FetchResult:
    df: pd.DataFrame
    source_name: str
    source_note: str
    complete: bool
    errors: list[str] = field(default_factory=list)
    tz_note: str = "UTC (ISO 8601)"


def try_sources() -> FetchResult:
    errors: list[str] = []

    for label, fn, note in [
        ("energy-charts.info", fetch_energy_charts,
         "GET https://api.energy-charts.info/public_power?country=de&start=...&end=... (monatsweise)"),
        ("smard.de", fetch_smard,
         "GET https://www.smard.de/app/chart_data/{filter}/DE/... (Filter-IDs siehe SMARD_FILTERS)"),
        ("open-power-system-data.org", fetch_opsd,
         f"GET {OPSD_TIME_SERIES_URL}"),
    ]:
        print(f"[fetch] Versuche Quelle: {label} ...", file=sys.stderr)
        try:
            df = fn()
            mandatory = [k for k, (_, req) in SERIES.items() if req]
            have = [c for c in mandatory if c in df.columns and df[c].notna().sum() > 0]
            hours = len(df)
            complete = (
                set(mandatory).issubset(set(have))
                and hours >= EXPECTED_HOURS - 2  # kleine Toleranz für DST/Randeffekte
            )
            print(f"[fetch]   OK: {hours} Stunden, Pflichtreihen vorhanden: {have}", file=sys.stderr)
            if complete:
                return FetchResult(df, label, note, True, errors)
            else:
                errors.append(
                    f"{label}: unvollständig (Stunden={hours}/{EXPECTED_HOURS}, "
                    f"fehlende Pflichtreihen={sorted(set(mandatory) - set(have))})"
                )
        except SourceUnavailable as e:
            print(f"[fetch]   FEHLGESCHLAGEN: {e}", file=sys.stderr)
            errors.append(str(e))
        except Exception as e:  # defensiv: unerwarteter Parse-/API-Fehler
            print(f"[fetch]   FEHLER (unerwartet): {e}", file=sys.stderr)
            errors.append(f"{label}: unerwarteter Fehler: {e}")

    # Sandbox-Notlösung
    print("[fetch] Versuche Quelle: github-mirror (Sandbox-Notlösung) ...", file=sys.stderr)
    try:
        df, commit = fetch_github_mirror()
        note = (
            f"NOTLÖSUNG (nicht Teil der offiziellen Quellen-Priorität): "
            f"öffentlicher GitHub-Mirror {GITHUB_MIRROR_REPO} (Datei "
            f"{GITHUB_MIRROR_CSV}, Commit {commit}), enthält reale SMARD-"
            f"Exportdaten, aber nur Jul-Dez 2024 und nur Wind Onshore/"
            f"Photovoltaik/Netzlast. Grund: api.energy-charts.info, "
            f"smard.de und open-power-system-data.org sind aus dieser "
            f"Sandbox heraus per Egress-Policy blockiert (403 auf CONNECT), "
            f"siehe research/daten_stundenprofile.md."
        )
        print(f"[fetch]   OK (PARTIAL): {len(df)} Stunden, Spalten={list(df.columns)}", file=sys.stderr)
        return FetchResult(
            df, "github-mirror (Notlösung)", note, False, errors,
            tz_note="naive lokale Zeit Europe/Berlin (kein UTC, siehe Kommentar in fetch_github_mirror())",
        )
    except SourceUnavailable as e:
        print(f"[fetch]   FEHLGESCHLAGEN: {e}", file=sys.stderr)
        errors.append(str(e))

    # Nichts hat funktioniert
    return FetchResult(pd.DataFrame(), "none", "keine Quelle erreichbar", False, errors)


def write_csv(result: FetchResult) -> Path:
    if result.df.empty:
        fname = "de_2024_hourly_FAILED.csv"
    elif result.complete:
        fname = "de_2024_hourly.csv"
    else:
        fname = "de_2024_hourly_PARTIAL.csv"

    out_path = RAW_DIR / fname

    lines = [
        f"# Deutschland, stündliche Zeitreihen {YEAR} (Netzlast, PV, Wind on/offshore, Wasserkraft, Biomasse)",
        f"# Quelle: {result.source_name}",
        f"# Endpunkt/Hinweis: {result.source_note}",
        f"# Abrufdatum (UTC): {RETRIEVED_AT}",
        f"# Vollständig (alle Pflichtreihen, {EXPECTED_HOURS} Stunden): {result.complete}",
        f"# Einheit: MW (Stundenmittel je Spalte == MWh im jeweiligen Stundenintervall)",
        f"# Zeitzone Index: {result.tz_note}",
    ]
    if result.errors:
        lines.append("# Fehlgeschlagene/übersprungene Quellen:")
        for e in result.errors:
            lines.append(f"#   - {e}")
    if not result.df.empty:
        missing = {c: int(result.df[c].isna().sum()) for c in result.df.columns}
        lines.append(f"# Fehlende Stundenwerte je Spalte: {missing}")
        expected_cols = list(SERIES.keys())
        absent_cols = [c for c in expected_cols if c not in result.df.columns]
        if absent_cols:
            lines.append(f"# Komplett fehlende Reihen (nicht in dieser Datei): {absent_cols}")

    header_comment = "\n".join(lines) + "\n"

    with out_path.open("w", encoding="utf-8") as f:
        f.write(header_comment)
        if not result.df.empty:
            out_df = result.df.copy()
            out_df.index.name = "timestamp_utc"
            out_df.to_csv(f)

    return out_path


def write_report(result: FetchResult, csv_path: Path) -> Path:
    report = {
        "year": YEAR,
        "expected_hours": EXPECTED_HOURS,
        "retrieved_at_utc": RETRIEVED_AT,
        "source_used": result.source_name,
        "source_note": result.source_note,
        "complete": result.complete,
        "output_csv": str(csv_path.relative_to(REPO_ROOT)),
        "rows": int(len(result.df)),
        "columns": list(result.df.columns) if not result.df.empty else [],
        "missing_per_column": (
            {c: int(result.df[c].isna().sum()) for c in result.df.columns}
            if not result.df.empty else {}
        ),
        "attempts_log": result.errors,
    }
    report_path = RAW_DIR / "fetch_report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    return report_path


def main() -> int:
    result = try_sources()
    csv_path = write_csv(result)
    report_path = write_report(result, csv_path)

    print("\n=== Zusammenfassung ===", file=sys.stderr)
    print(f"Quelle: {result.source_name}", file=sys.stderr)
    print(f"Vollständig: {result.complete}", file=sys.stderr)
    print(f"CSV: {csv_path}", file=sys.stderr)
    print(f"Report: {report_path}", file=sys.stderr)

    return 0 if not result.df.empty else 1


if __name__ == "__main__":
    raise SystemExit(main())
