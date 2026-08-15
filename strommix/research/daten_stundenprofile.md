# Stündliche Zeitreihen Deutschland 2024 — Recherche & Datenaufbereitung

**Abrufdatum:** 2026-08-15
**Skripte:** `strommix/scripts/fetch_hourly_2024.py`, `strommix/scripts/build_profiles.py`
**Ausgabe:** `strommix/data/raw/de_2024_hourly_PARTIAL.csv`, `strommix/data/raw/fetch_report.json`,
`strommix/data/profiles_2024.json`

## Kurzfassung

Alle drei im Auftrag vorgegebenen Primärquellen (Energy-Charts-API, SMARD-API,
Open Power System Data) sind aus dieser Sandbox-Umgebung heraus **nicht
erreichbar** — die ausgehende Netzwerk-Policy (Egress-Proxy) blockiert die
Ziel-Hosts kategorisch mit `403` auf den TLS-CONNECT. Das ist keine
API-spezifische Fehlermeldung (kein 404/429/Auth-Fehler), sondern eine
Infrastruktur-Policy-Entscheidung, die für praktisch jeden externen Host
außer GitHub (`github.com`, `raw.githubusercontent.com`, git-Klon-Zugriff)
und den Paket-Registries (`pypi.org`, `files.pythonhosted.org`,
`registry.npmjs.org` u.a.) gilt (siehe unten, "Netzwerk-Diagnose").

Da echte Live-Daten aus den drei Zielquellen also nicht beschafft werden
konnten, wurde als **dokumentierte Notlösung** ein öffentlicher, über Git
klonbarer GitHub-Mirror realer SMARD-Exportdaten verwendet
(`hakimdalim/smard-data-extractor`). Diese Daten sind real (SMARD-Downloads,
keine Simulation/Fabrikation), decken aber **nur Juli–Dezember 2024** ab und
enthalten **nur drei der sechs geforderten Reihen** (Netzlast, Wind Onshore,
Photovoltaik — kein Wind Offshore, keine Wasserkraft, keine Biomasse).

**Ergebnis ist damit ausdrücklich unvollständig** gegenüber dem Auftrag
("Kalenderjahr 2024 komplett", "mindestens Last + PV + Wind on/offshore
sind Pflicht"). Wind Offshore — eine Pflichtreihe — fehlt komplett. Das ist
in `data/raw/de_2024_hourly_PARTIAL.csv` (Dateiname trägt bewusst den
Zusatz `PARTIAL`), `data/raw/fetch_report.json` und
`data/profiles_2024.json` (`meta.data_completeness = "PARTIAL"`,
`meta.gaps`) an jeder Stelle explizit ausgewiesen — es wird an keiner Stelle
so getan, als läge ein vollständiger Datensatz vor.

## Netzwerk-Diagnose (was genau blockiert ist)

Geprüft via `curl --cacert /root/.ccr/ca-bundle.crt` und `$HTTPS_PROXY/__agentproxy/status`:

| Host | Ergebnis |
|---|---|
| `api.energy-charts.info` | 403 auf CONNECT (Proxy-Policy) |
| `www.smard.de` / `smard.de` | 403 auf CONNECT |
| `data.open-power-system-data.org` | 403 auf CONNECT |
| `transparency.entsoe.eu` | 403 auf CONNECT |
| `opendata-download-current-observations.dwd.de` | 403 auf CONNECT |
| `www.destatis.de`, `www.bundesnetzagentur.de` | 403 auf CONNECT |
| `huggingface.co`, `zenodo.org`, `www.kaggle.com` | 403 auf CONNECT |
| `grep.app`, `sourcegraph.com`, `gist.githubusercontent.com` | 403 auf CONNECT |
| `example.com`, `en.wikipedia.org`, `www.google.com`, `httpbin.org` | 403 auf CONNECT (Kontroll-Test: **generelles Default-Deny**, nicht energie-spezifisch) |
| `github.com` | erreichbar (HTTP-Antwort, kein CONNECT-Fehler) |
| `raw.githubusercontent.com` | erreichbar, liefert Inhalte |
| `api.github.com` | separat gate-gehalten (Claude-Code-eigene Repo-Attach-Logik, nicht die Egress-Policy) |
| Git-Klon `https://github.com/...` (anonymer Read) | funktioniert über den session-eigenen Git-Proxy |

`WebFetch` auf `api.energy-charts.info` liefert ebenfalls `EGRESS_BLOCKED` —
läuft also über dieselbe Policy, kein Umweg über einen separaten
Anthropic-Dienst. `WebSearch` funktioniert (liefert Snippets/Metadaten,
aber keine Rohdaten-Downloads).

**Schlussfolgerung:** Dies ist ein Sandbox-/Session-Netzwerk-Limit, kein
Problem der Skripte oder der APIs selbst. `fetch_hourly_2024.py` implementiert
alle drei Quellen korrekt (inkl. SMARD-Filter-IDs, siehe unten) und würde in
einer Umgebung mit offenem Internetzugang funktionieren — das wurde durch
Code-Review der API-Dokumentation sichergestellt, konnte hier aber nicht
End-to-End gegen die echten Endpunkte verifiziert werden.

**Empfehlung an Orchestrator/Nutzer:** Entweder (a) die Egress-Policy für
`api.energy-charts.info` und/oder `www.smard.de` freischalten und
`fetch_hourly_2024.py` erneut laufen lassen (dann automatisch vollständige
Daten), oder (b) eine SMARD-/Energy-Charts-CSV-Exportdatei manuell
bereitstellen (z. B. Download über Browser, dann Datei nach
`strommix/data/raw/` legen) — das Skript kann darauf angepasst werden.

## Primärquellen (dokumentiert, aber nicht erreichbar)

### 1. Energy-Charts-API (Fraunhofer ISE)

- Endpoint: `GET https://api.energy-charts.info/public_power?country=de&start=YYYY-MM-DD&end=YYYY-MM-DD`
- Liefert JSON mit `unix_seconds` (Zeitachse, für DE i. d. R. 15-Minuten-Raster)
  und `production_types[]` (je Erzeugungsart ein `{name, data}`-Objekt,
  u. a. `Load`, `Solar`, `Wind onshore`, `Wind offshore`,
  `Hydro Run-of-River`, `Biomass`).
- Lizenz: überwiegend CC BY 4.0 (Fraunhofer ISE).
- Im Skript implementiert als `fetch_energy_charts()` — Monatschunks,
  Resampling auf Stundenmittel.
- **Status:** nicht erreichbar (403 CONNECT).

### 2. SMARD-API (Bundesnetzagentur)

- Basis: `https://www.smard.de/app/chart_data/{filter}/{region}/...`
- Filter-IDs (Region `DE`), Quelle: `bundesAPI/smard-api` README
  (github.com/bundesAPI/smard-api, per `raw.githubusercontent.com`
  einsehbar, obwohl `smard.de` selbst blockiert ist):

  | Filter-ID | Reihe |
  |---|---|
  | `410` | Stromverbrauch: Gesamt (Netzlast) |
  | `4068` | Stromerzeugung: Photovoltaik |
  | `4067` | Stromerzeugung: Wind Onshore |
  | `1225` | Stromerzeugung: Wind Offshore |
  | `1226` | Stromerzeugung: Wasserkraft |
  | `4066` | Stromerzeugung: Biomasse |
  | `4359` | Stromverbrauch: Residuallast |

- Ablauf: erst Index-Endpunkt (`index_hour.json`) für verfügbare Chunk-
  Timestamps abfragen, dann den Chunk laden, der 2024 abdeckt.
- Lizenz: CC BY 4.0.
- Im Skript implementiert als `fetch_smard()`.
- **Status:** nicht erreichbar (403 CONNECT).

### 3. Open Power System Data (Fallback laut Auftrag)

- `https://data.open-power-system-data.org/time_series/latest/time_series_60min_singleindex.csv`
- **Wichtige Einschränkung, unabhängig vom Netzwerkzugriff:** Das OPSD-
  `time_series`-Paket wurde **2020 eingestellt** (letzte reguläre Version
  2020-10-06) und enthält **keine 2024er Daten**. Selbst mit offenem
  Netzwerkzugriff wäre diese Quelle für den Auftrag (Kalenderjahr 2024)
  **nicht nutzbar** — sie ist im Skript nur der Vollständigkeit halber als
  dritte Fallback-Stufe implementiert (`fetch_opsd()`), schlägt aber
  erwartbar fehl (leerer 2024-Ausschnitt), selbst wenn der Host erreichbar
  wäre.
- **Status:** ohnehin ungeeignet für 2024; zusätzlich nicht erreichbar (403 CONNECT).

## Tatsächlich verwendete Quelle (Sandbox-Notlösung)

- Repo: `https://github.com/hakimdalim/smard-data-extractor`
  (öffentlich, per anonymem Git-Klon erreichbar; MIT-artige/offene
  Projektlizenz laut Repo, zugrunde liegende Daten sind SMARD-Exporte
  und damit CC BY 4.0, Bundesnetzagentur)
- Datei: `juli24-25_energie_zusammengefasst_mit_aufloesung.csv`
- Commit zum Abrufzeitpunkt: siehe `data/raw/fetch_report.json` /
  CSV-Kopfzeile (`source_note`, enthält den Commit-Hash)
- Enthaltene Spalten: `Wind Onshore [MWh]`, `Photovoltaik [MWh]`,
  `Erdgas [MWh]` (nicht in unser Schema übernommen, keine der sechs
  Zielreihen), `Netzlast [MWh]`, Day-Ahead-Preis `€/MWh` (nicht übernommen).
- Zeitlicher Umfang der Datei: Juli 2024 – Juni 2025; **verwendet wird nur
  der 2024er Anteil, Juli–Dezember 2024 (4 416 von 8 784 Stunden = 50,3 %
  des Kalenderjahres)**.
- Zahlenformat: deutsches Format (`.` Tausendertrenner, `,` Dezimaltrennzeichen),
  im Skript korrekt geparst.
- **Zeitzone:** Die Zeitstempel im Original sind lokale Zeit
  (Europe/Berlin). Wegen der beiden DST-Umstellungstage im Jahr (23-/25-
  Stunden-Tage) wurde bewusst **keine** pauschale `tz_localize` über den
  vollen Zeitraum durchgeführt (das würde bei einem Mehrmonats-DataFrame
  mit mehreren Umstellungen scheitern bzw. stillschweigend falsche Stunden
  erzeugen) — die Zeitstempel bleiben **naive lokale Zeit Europe/Berlin**.
  Für eine exakte UTC-Simulation müssten die zwei DST-Tage (letzter
  Sonntag im März/Oktober) manuell nachjustiert werden. Für die reine
  Profil-Normierung (Summe = 1) ist das unkritisch, da die Reihenfolge und
  Anzahl der Stunden erhalten bleibt.

## Definitionsfragen

- **Last vs. Verbrauch:** "Netzlast" (SMARD-Filter `410`, energy-charts
  `Load`) ist die **im deutschen Übertragungsnetz gemessene Last** —
  das ist NICHT identisch mit dem gesamten Bruttostromverbrauch
  (Eigenverbrauch von Kraftwerken, Netzverluste, dezentrale
  PV-Eigenerzeugung hinter dem Zähler sind teils nicht erfasst). Für die
  Dispatch-Simulation ist "Netzlast" die richtige Bezugsgröße (das ist die
  Größe, die durch Erzeugung + Speicher + Import/Export gedeckt werden
  muss), sollte im Whitepaper aber explizit als "Netzlast" und nicht als
  "Gesamtstromverbrauch Deutschlands" bezeichnet werden (Letzterer liegt
  wegen Eigenverbrauch/Übertragungsverlusten etwas höher, ca. 500+ TWh je
  nach Abgrenzung).
- **Wasserkraft/Laufwasser:** Der Auftrag verlangt "Wasserkraft/Laufwasser".
  SMARD trennt "Wasserkraft" (Filter `1226`, entspricht im Wesentlichen
  Laufwasserkraft, da Pumpspeicher separat unter `4070`/`4387` geführt
  wird) von Pumpspeicher. Energy-Charts nennt die Reihe
  "Hydro Run-of-River". Für die Simulation ist das die relevante,
  wetterunabhängige Grundlast-Erzeugung aus Wasserkraft (keine
  Speicherfahrweise).
- **MW vs. MWh:** Alle Quellen liefern MW-Werte im jeweiligen
  Zeitraster (energy-charts: 15-Min-Mittel, SMARD: stündlich). Bei
  stündlicher Aggregation entspricht ein MW-Stundenmittel numerisch einem
  MWh-Stundenwert — im Code/CSV wird das als `_mw`-Suffix geführt, ist aber
  pro Stunde gleichbedeutend mit MWh.
- **Lückenbehandlung:** Grundsatz für beide Skripte: **keine Interpolation,
  keine Fabrikation**. Fehlende Einzelstunden würden (falls sie in einer
  echten API-Antwort vorkämen) als `NaN` im Rohdaten-CSV stehen und in
  `build_profiles.py` aus der Summenbildung und dem `hourly_profile`-Array
  herausfallen (`dropna()`), mit Zählung in `coverage.missing_hours`. Ganze
  fehlende Reihen (hier: Wind Offshore, Wasserkraft, Biomasse) werden mit
  `available: false` und einer Begründung ausgewiesen, `hourly_profile` ist
  dann `null` — die Simulation muss das Fehlen dieser Reihen aktiv
  behandeln (z. B. Nutzer-Hinweis "Wind Offshore nicht verfügbar,
  Näherungswert nötig"), nicht stillschweigend mit 0 auffüllen.

## Ergebnis / Plausibilitätscheck

Aus `de_2024_hourly_PARTIAL.csv` (Juli–Dezember 2024, 4 416 Stunden):

| Reihe | Summe Jul–Dez 2024 | Kapazitätsfaktor (Jul–Dez, Richtwert-Kapazität) |
|---|---|---|
| Netzlast | 231,8 TWh | — |
| Photovoltaik | 30,5 TWh | 6,96 % (Richtwert 99,3 GW installiert Ende 2024) |
| Wind Onshore | 52,0 TWh | 18,86 % (Richtwert 62,4 GW installiert Ende 2024) |
| Wind Offshore | **nicht verfügbar** | — |
| Wasserkraft | **nicht verfügbar** | — |
| Biomasse | **nicht verfügbar** | — |

Einordnung: Für ein Halbjahr sind ~232 TWh Netzlast, ~52 TWh Wind Onshore und
~30,5 TWh PV grössenordnungsmäßig konsistent mit den im Auftrag genannten
Vollzahlen-Bandbreiten für 2024 (Last ~460–470 TWh, Wind Onshore ~100–115 TWh,
PV ~60–75 TWh) — ein Halbjahreswert von grob 45–55 % der Jahresbandbreite ist
plausibel, gibt aber **keine belastbare Aussage über das Gesamtjahr**, da H1
2024 (Jan–Jun) fehlt und die beiden Halbjahre unterschiedliche
Wind-/Solar-Charakteristik haben (Frühjahr/Sommer i. d. R. mehr Solar,
Winterhalbjahr i. d. R. mehr Wind). Kein harter Jahres-Plausibilitätscheck
möglich, siehe `profiles_2024.json` → `meta.plausibility_check_2024`
(dort pro Reihe explizit als "Teilzeitraum, nicht direkt vergleichbar"
ausgewiesen, kein falsches "plausibel: true/false" auf Basis von
Halbjahresdaten).

## Offene Punkte / nächste Schritte

- [ ] Netzwerk-Policy für `api.energy-charts.info` (bevorzugt) oder
      `www.smard.de` freischalten, dann `fetch_hourly_2024.py` erneut
      ausführen → sollte automatisch die vollständige, korrekte
      Jahres-Zeitreihe für alle sechs Reihen liefern (Skript-Logik ist
      dafür bereits vollständig implementiert, nur die drei Primärquellen
      wurden in dieser Session nie tatsächlich erreicht).
- [ ] Alternativ: manuellen SMARD-CSV-Export (smard.de → Downloadbereich,
      Zeitraum 01.01.2024–31.12.2024, Auflösung Stunde, alle sechs
      Kategorien) besorgen und nach `strommix/data/raw/` legen; Skript
      dafür um einen "lokale Datei"-Eingabepfad erweitern (aktuell nicht
      implementiert, da kein Testfall verfügbar).
- [ ] Sobald vollständige Daten vorliegen: `build_profiles.py` erneut
      laufen lassen (Skript ist bereits dafür ausgelegt, erkennt
      `de_2024_hourly.csv` automatisch bevorzugt gegenüber der
      `_PARTIAL`-Variante) und den echten Jahres-Plausibilitätscheck gegen
      die Bandbreiten aus dem Auftrag durchführen (Logik dafür ist bereits
      in `build_profiles.py` vorhanden, `PLAUSIBILITY_RANGES_TWH_FULL_YEAR`).
- [ ] Installierte-Leistung-Richtwerte (`INSTALLED_CAPACITY_GW_REF` in
      `build_profiles.py`) sind Literaturwerte, keine Live-Abfrage — für
      belastbare LCOE-/Kapazitätsfaktor-Aussagen im Whitepaper mit
      MaStR-Primärquelle verifizieren.
