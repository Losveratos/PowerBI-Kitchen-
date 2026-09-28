#!/usr/bin/env python3
"""Lädt die Rohdaten der Kölner Geschwindigkeitsüberwachung 2025 in SQLite.

Eingabe  (data/raw/, Latin-1, Semikolon):
  Geschwindigkeitsueberwachung_Koeln_Gesamt_2025.csv(.gz) – ein Verstoß pro Zeile
  sloc-01.csv, sloc-02.csv, sloc-04.csv, sloc-11.csv – Standorttabellen je Dienststelle

Ausgabe:
  data/raser_2025.sqlite  (Tabellen: verstoss, standort, monat_kontrolle)

Die Monats-CSV ist ein aneinandergehängter SQL-Export: je Monat Kopfzeile,
Trennlinie und eine Zeile „(N Zeile(n) betroffen)". Diese Zeilen werden
übersprungen, die N-Werte aber als Kontrollsumme gespeichert und geprüft.
"""
import csv
import gzip
import re
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
DB = ROOT / "data" / "raser_2025.sqlite"

ROW_RX = re.compile(r"^2025;\d{1,2};\d{6};")
COUNT_RX = re.compile(r"^2025;(\d{1,2});\((\d+);Zeile")

SCHEMA = """
DROP TABLE IF EXISTS verstoss;
DROP TABLE IF EXISTS standort;
DROP TABLE IF EXISTS monat_kontrolle;
CREATE TABLE verstoss (
  id              INTEGER PRIMARY KEY,
  datum           TEXT NOT NULL,     -- ISO yyyy-mm-dd
  monat           INTEGER NOT NULL,
  wochentag       INTEGER,           -- 0=Mo … 6=So
  stunde          INTEGER NOT NULL,
  uhrzeit         TEXT NOT NULL,     -- hh:mm:ss
  kennz           TEXT,              -- Zulassungsbezirk, z. B. 'K', 'BM'
  kmh             INTEGER NOT NULL,  -- gemessene Geschwindigkeit
  ueber           INTEGER NOT NULL,  -- vorwerfbare Überschreitung (nach Toleranzabzug)
  fahrzeugart     TEXT,
  dienststelle    TEXT NOT NULL,     -- S-01 … S-11
  standort        TEXT NOT NULL      -- Standort-Code, 4-stellig
);
CREATE TABLE standort (
  dienststelle  TEXT NOT NULL,
  code          TEXT NOT NULL,
  typ           TEXT,
  limit_pkw     INTEGER,
  limit_2       INTEGER,
  kurz          TEXT,
  ort           TEXT,
  lage          TEXT,
  richtung      TEXT,
  PRIMARY KEY (dienststelle, code)
);
CREATE TABLE monat_kontrolle (monat INTEGER PRIMARY KEY, zeilen_laut_export INTEGER);
"""


def to_int(s):
    s = (s or "").strip()
    return int(s) if s.isdigit() else None


def load_verstoesse(con):
    rows, counts, skipped, broken = [], {}, 0, []
    path = RAW / "Geschwindigkeitsueberwachung_Koeln_Gesamt_2025.csv"
    opener = (lambda: open(path, encoding="latin-1", newline="")) if path.exists() else \
        (lambda: gzip.open(path.with_suffix(".csv.gz"), "rt", encoding="latin-1", newline=""))
    with opener() as fh:
        for line in fh:
            line = line.rstrip("\r\n")
            m = COUNT_RX.match(line)
            if m:
                counts[int(m.group(1))] = int(m.group(2))
                continue
            if not ROW_RX.match(line):
                skipped += 1
                continue
            f = line.split(";")
            # Verrutschte Zeilen normalisieren: Die Geschwindigkeit ist das erste
            # Paar rein numerischer Felder ab Spalte 5. Davor steht das
            # Kennzeichen – fehlt (~1 %) oder ist zweiteilig (Sonderkennzeichen
            # wie „0 172-", „NRW 5-"; dann fehlt am Zeilenende der Standort).
            k = next((i for i in range(4, 7) if f[i].strip().isdigit() and f[i + 1].strip().isdigit()), None)
            if k is None:  # z. B. Überschreitung fehlt ganz → nicht auswertbar
                broken.append(line)
                continue
            f = f[:4] + [" ".join(x.strip() for x in f[4:k])] + f[k:]
            f += [""] * (10 - len(f))
            _, monat, d, t, kennz, kmh, ueber, fz, dst, sto = f[:10]
            day, mon, yy = int(d[:2]), int(d[2:4]), 2000 + int(d[4:6])
            t = t.zfill(6)
            rows.append((
                f"{yy:04d}-{mon:02d}-{day:02d}", int(monat),
                None, int(t[:2]), f"{t[:2]}:{t[2:4]}:{t[4:6]}",
                kennz.strip().rstrip("-") or None,
                int(kmh), int(ueber), fz.strip() or None, dst.strip(), sto.strip().zfill(4),
            ))
    con.executemany(
        "INSERT INTO verstoss (datum, monat, wochentag, stunde, uhrzeit, kennz, kmh, ueber, fahrzeugart, dienststelle, standort)"
        " VALUES (?,?,?,?,?,?,?,?,?,?,?)", rows)
    # Wochentag in SQLite: strftime('%w') liefert 0=So; auf 0=Mo umrechnen
    con.execute("UPDATE verstoss SET wochentag = (CAST(strftime('%w', datum) AS INTEGER) + 6) % 7")
    con.executemany("INSERT INTO monat_kontrolle VALUES (?,?)", sorted(counts.items()))
    return len(rows), skipped, counts, broken


def load_standorte(con):
    n = 0
    for p in sorted(RAW.glob("sloc-*.csv")):
        dst = "S-" + p.stem.split("-")[1]
        with open(p, encoding="latin-1", newline="") as fh:
            for f in csv.reader(fh, delimiter=";"):
                if len(f) < 7:
                    continue
                name = f[4]
                kurz, ort = name[:5].strip(), name[5:].strip()
                con.execute(
                    "INSERT OR REPLACE INTO standort VALUES (?,?,?,?,?,?,?,?,?)",
                    (dst, f[0].strip().zfill(4), f[1].strip(), to_int(f[2]), to_int(f[3]),
                     kurz or None, ort, f[5].strip(), f[6].strip()))
                n += 1
    return n


def main():
    DB.unlink(missing_ok=True)
    con = sqlite3.connect(DB)
    con.executescript(SCHEMA)
    n, skipped, counts, broken = load_verstoesse(con)
    ns = load_standorte(con)
    con.executescript("""
      CREATE INDEX ix_v_standort ON verstoss(dienststelle, standort);
      CREATE INDEX ix_v_datum ON verstoss(datum);
    """)
    con.commit()

    # Kontrollsumme: geladene Zeilen je Monat vs. „(N Zeile(n) betroffen)"
    got = dict(con.execute("SELECT monat, COUNT(*) FROM verstoss GROUP BY monat"))
    for line in broken:
        got[int(line.split(";")[1])] = got.get(int(line.split(";")[1]), 0) + 1
    bad = {m: (got.get(m), c) for m, c in counts.items() if got.get(m) != c}
    print(f"✓ {n:,} Verstöße geladen, {skipped + len(counts)} Nicht-Datenzeilen übersprungen "
          f"(davon {len(counts)} Zählzeilen), {ns} Standorte")
    print(f"  {len(broken)} unvollständige Zeile(n) verworfen: {broken}")
    print(f"  Kontrollsumme je Monat: {'OK' if not bad else 'ABWEICHUNG ' + str(bad)}")
    con.close()


if __name__ == "__main__":
    main()
