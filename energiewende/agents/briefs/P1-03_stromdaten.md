# Auftrag P1-03 · Stündliche Stromdaten über mehrere Wetterjahre

**Modell:** Sonnet · **Ergebnis:** `energiewende/research/03_stromdaten.md`
plus Daten unter `energiewende/data/` und Skripte unter `energiewende/scripts/`
**Regeln:** `energiewende/agents/REGELN.md`

## Ziel

Die größte Lücke des Strommix-Modells schließen: Dort gibt es nur ein halbes
Jahr (Juli–Dezember 2024) und kein Offshore-Profil (siehe
`strommix/README.md`, „Offene Punkte“, und `strommix/research/daten_stundenprofile.md`).
Für Teil 2 brauchen wir vollständige Stundenreihen über möglichst viele
Wetterjahre, damit Dunkelflauten nicht an einem Einzeljahr hängen.

## Aufgaben

1. **Datenquelle klären und dokumentieren:** SMARD (www.smard.de,
   Bundesnetzagentur, CC BY 4.0) und Energy-Charts
   (api.energy-charts.info, Fraunhofer ISE). Welche Endpunkte liefern
   stündliche Werte, welche Lizenz, welche Zeitzone, wie werden
   Sommer-/Winterzeit und Datenlücken behandelt? Probiere zuerst einen
   kleinen Abruf und dokumentiere die funktionierende URL-Form.
2. **Herunterladen, je Jahr 2015 bis 2025** (soweit verfügbar), stündlich für
   Deutschland: Netzlast, Photovoltaik, Wind an Land, Wind auf See,
   Laufwasser, Biomasse, Pumpspeicher (Erzeugung und Verbrauch), und die
   installierte Leistung je Technologie und Jahr (für Kapazitätsfaktoren).
   Rohdateien nach `energiewende/data/raw/strom/`, mit Begleitdatei zu Quelle
   und Lizenz.
3. **Aufbereiten** per Skript `energiewende/scripts/build_profiles.py` zu
   `energiewende/data/profiles_<jahr>.json`: Kapazitätsfaktor je Stunde und
   Technologie (Erzeugung geteilt durch installierte Leistung zum Zeitpunkt),
   Last in MW. Format an `strommix/data/profiles_2024.json` anlehnen, damit
   das bestehende Modell die Dateien lesen kann. Schaltjahre, fehlende
   Stunden und Ausreißer ausweisen, nichts stillschweigend auffüllen.
4. **Plausibilität:** Jahressummen je Technologie gegen veröffentlichte
   Jahreswerte (AG Energiebilanzen, Fraunhofer ISE, BNetzA) abgleichen;
   Abweichung in Prozent je Jahr und Technologie als Tabelle.
5. **Wetterjahr-Kennzahlen je Jahr:** Volllaststunden PV, Wind an Land, Wind
   auf See; die längste Phase mit Wind+PV-Kapazitätsfaktor unter 10 % (und
   unter 5 %), jeweils mit Datum; das windschwächste Winterquartal.
6. **Was fehlt:** Abregelung ist in den Messwerten bereits enthalten
   (verzerrt Kapazitätsfaktoren nach unten) — recherchiere, wie groß der
   Effekt ist und wie man ihn korrigieren könnte. Gibt es frei zugängliche
   Reanalyse-Reihen (z. B. renewables.ninja, ERA5-basiert) für längere
   Zeiträume? Nur dokumentieren, nicht laden, wenn der Host nicht
   freigegeben ist.

## Hinweise

- Abruf nur per `curl` in der Form aus den Regeln. Wenn ein Python-Skript
  selbst Netzabrufe machen müsste: stattdessen eine URL-Liste erzeugen und
  die Dateien einzeln mit `curl` holen.
- Lieber zehn vollständige, geprüfte Jahre für die Kernreihen als alle
  Reihen lückenhaft. Wenn die Zeit knapp wird: Last, PV, Wind an Land und
  Wind auf See zuerst.
- Ändere nichts unter `strommix/`.
