> Simuliertes Expertenreview vom 02.10.2026: sechs Rollen (keine realen Personen), je ein eigener Agent, Modelle gemischt (Sonnet, Opus, Fable). Grundlage: Stand nach Agent-Modus v2 und dem ersten echten Desktop-Durchlauf (Testkopie MockupLive-Demo, Deploys 1 bis 10).

# Review MockupKitchen live

## Urteile

| Rolle | Modell | Nutzen | Bedienbarkeit / Robustheit / Risiko |
|---|---|---|---|
| Report-Entwicklung / IBCS-Design | Sonnet | 7 | Bedienbarkeit 6 |
| Semantikmodell / DAX | Opus | 7 | Bedienbarkeit 4 |
| Fabric-Architektur / CI-CD / Git | Fable | 7 | Bedienbarkeit 5 |
| Admin / Governance / Sicherheit | Sonnet | 7 | Risiko hoch, mittel bei reinen Testkopien |
| Workshop-Moderation / Beratung | Fable | 8 | Bedienbarkeit 5 |
| Desktop-Poweruser / External Tools | Opus | 8 | Robustheit 5 |

Einig sind sich alle: Die Idee trifft einen echten Schmerz (Skizze → echte Zahlen in Sekunden, Bildvergleich als Abnahme), Dateivertrag, Delta-Regel und Sicherungen sind gut gedacht. Schwach sind Start und Bedienung, der Umgang mit Desktop (stilles Beenden, Instanzerkennung), der Modellweg (nie gegen echtes `te`, Freigaben nur per Datei) und alles, was Teams und Unternehmen brauchen.

**Schon erledigt** (Reviewer teils auf altem Stand von FIDELITY.md): Chrome-Schrift px × k × 0,75, KPI als `ibcsKpiCard`, Waterfall ohne `rowType`, `bridge` als senkrechter Wasserfall, Szenario-Zuordnung PY/PL, Texte in Formen mit Selektor `default`, heller Hintergrund außerhalb der Seite.

## Befunde nach Thema (P1 = vor nächstem Einsatz, P2 = vor Freigabe, P3 = später)

### A · Start und Bedienung
- **P1 Ein Knopf in Desktop** (External Tools): `mk-launch` ermittelt PID über den Elternprozess (Gegenprobe Port aus `%server%`), Datei über `pbir desktop list`, startet den Runner aus dem Prozessbaum gelöst (sonst beendet `taskkill /T` ihn mit), schreibt `mockup/desktop-session.json`, öffnet das Kitchen mit `?live=`. Registrierung in `C:\Program Files (x86)\Common Files\Microsoft Shared\Power BI Desktop\External Tools\` braucht einmal Admin. Desktop übergibt nur `%server%`/`%database%`.
- **P1 `doctor` und Setup** mit Ampel: pbir, te und Ablaufdatum, Bridge je Prozess (Instanzen ohne Bridge wie PID 5672), Store/MSI-Pfad, Vorschau „Detect and reload external PBIP changes", Policies, compatibilityLevel.
- **P1 Sitzung vorbereiten** statt Neustart mitten im Deploy: alle Kitchen-Visuals und das Theme einmal am Anfang installieren (ein angekündigter Neustart), danach nie mehr. Im Workshop als Pflichtschritt „Warm-up-Deploy".
- **P1 Eindeutiges Projekt:** Runner schreibt absoluten Pfad und Sitzungs-ID, Kitchen zeigt Ordner und warnt bei Abweichung; Zähler je Ordner statt je Projektname.
- **P2 Deploy-Vorschau** (Änderungszähler, Neustart ja/nein, Modell-Ops), **„Neu messen"** ohne Deploy, **„Zurück zu Deploy n"**, Klartext-Schrittnamen, Beamer-Ansicht (Skizze / Desktop / Overlay), **Sitzungsprotokoll** als Export.
- **P3 Drag & Drop** von Ordner oder `.pbip`; **Auto-Deploy** höchstens als Opt-in nach 60 s Ruhe; **Nur-TMDL-Modus** (siehe C).

### B · Desktop und Sicherheit der Arbeit
- **P1 Kein stilles hartes Beenden:** Da jeder Reload „ungespeichert" setzt, endet heute jeder Neustart mit `taskkill /F`, und `--respect-unsaved` blockiert immer. Neustart nur nach Bestätigung im Kitchen (Countdown, Abbrechen). Den eigenen Reload als Ursache der Markierung merken, damit echte Desktop-Arbeit unterscheidbar bleibt.
- **P1 Ungespeichertes je Deploy im Kitchen abfragen** („überschreiben / erst speichern") statt per Flag.
- **P1 Instanz festnageln:** `--pin-pid`, Pipes abgleichen, bei mehreren Treffern blockieren statt den ersten zu nehmen.
- **P2 Bridge „busy":** Sperre je PID, Wiederholung mit Backoff statt Backend-Wechsel. Reload-Rückfall lädt das Modell immer mit (Status korrigieren oder `file.reload/v1` mit `reloadModelDefinition:false` direkt).
- **P2 Render abwarten** auch, wenn die Seitenfläche nicht erkannt wird; nach Reopen längere Wartezeit; alle Kacheln leer → „ungültig, Freigabe in Desktop?".
- **P2 Doku:** Bridge-Einstellung jetzt unter Optionen → Sicherheit, per Policy abschaltbar; getrennte Vorschau „Detect and reload" und Banner-Rennen während `write`; Desktop ab August 2026; Versionen von pbir und Bridge-CLI pinnen.

### C · Modell
- **P1 Echter Lauf mit aktuellem `te`** (MODEL-OPS offene Punkte) und ein Ausweichweg fürs Preview-Ende 31.10.2026.
- **P1 Bei offenem Desktop nicht in TMDL schreiben,** sondern in die lokale AS-Instanz (TOM/XMLA oder Power BI Modeling MCP); `te` nur offline. Drei Wege: live, offline, Export als Skript.
- **P1 Freigaben im Kitchen** mit DAX-Diff, gebunden an einen Hash des Inhalts; fehlgeschlagene Ops wieder freigebbar; DAX-Vorschlag per `EVALUATE` testen.
- **P2 Umbenennen** transaktional über Modell, Bericht und Spec oder in der öffentlichen Fassung aus; Standard „Alias als Anzeigename".
- **P2 `model-index.json` vom Runner** (über `te ls`) statt Browser-Parser für „fehlt"; Berechnungsgruppen und Feldparameter erkennen; Steckbrief-Metadaten als Annotations statt in der Beschreibung.
- **P3 Nur-TMDL-Modus** (Modell-Review ohne Bericht): Arbeitsordner neben dem Modell, Inventar, Kommentare, Freigabe, Anwenden ohne Reload, Änderungsprotokoll. Im Workshop nicht gebraucht, für Berater-Solo-Arbeit sinnvoll.

### D · Treue
- **P1 ChartKitchen-Hinweistext** („größter Treiber …") überdeckt die Δ%-Spalte: abschalten oder Platz reservieren.
- **P2 Bildvergleich als „Aufbau" beschriften,** Befunde in „Layout" und „vermutlich Daten" trennen; ein Score prüft keine Zahlen.
- **P2 Teilziele beim Deploy** („nur Layout", „nur Theme", „nur Modell").

### E · Governance und Team
- **P1 `.gitignore` für den ganzen Ordner `mockup/`** mit Erlaubnisliste (Spec, Brief, Freigaben); Laufzeitdateien und Bilder mit echten Daten nie committen; `unappliedChanges.json` behandeln.
- **P2 Visual-Herkunft:** Manifest mit erlaubten Versionen und Hashes statt „neueste Datei im Repo gewinnt"; Organisations-Visuals bevorzugen, wenn vorhanden; Hinweis, dass „nur zertifizierte Visuals" in Desktop nur per Gruppenrichtlinie wirkt.
- **P2 Protokoll:** `mockup/log/` append-only je Deploy, Freigaben mit Urheber und Zeit.
- **P2 Sperre gegen zwei Kitchens** am selben Projekt; Zeitlimit für die Schreibberechtigung im Browser.
- **P2 Nur auf Einzelbenutzer-Rechnern, nur Testkopien** (Bridge-Pipe ohne eigene Anmeldung).

### F · Stufe 2 (Service), Konzept korrigieren
- `definition.pbir` bleibt `byPath`; `byConnection` nur in einer Exportkopie für den Push.
- Kein XMLA-Schreiben (zweite Wahrheit); Modell und Bericht als Definition deployen (`fab import` beider Ordner oder fabric-cicd), Modell zuerst.
- Deployment Pipelines unterstützen keine PBIR-Berichte: Zielbild Git-Branch je Workspace plus PR oder fabric-cicd.
- Workspace-Erlaubnisliste, Sicherung vor dem ersten Push, Dry-Run-Diff; Push blockieren, wenn Visuals im Tenant nicht erlaubt sind.
- Deploy-Ziele im Kitchen: „Desktop", „Desktop + Service (dev)", „Commit + PR".

### G · Vor jeder öffentlichen Freigabe
- Lizenz von `pbir` (nicht-kommerziell) klären oder Schreibschicht ersetzen.
- Abhängigkeit von zwei Desktop-Previews und der `te`-Preview offen benennen.

## Vorschlag Reihenfolge
1. **Sprint Bedienung und Sicherheit:** A (Knopf, doctor, Sitzung vorbereiten, eindeutiges Projekt), B (Bestätigung statt stillem Beenden, Abfrage Ungespeichertes, PID festnageln, busy), D (Hinweistext), E (`.gitignore`).
2. **Sprint Modell:** echtes `te`, Schreiben in die lokale Instanz bei offenem Desktop, Freigaben im Kitchen mit Hash, `model-index.json`.
3. **Sprint Workshop-Komfort:** Deploy-Vorschau, Neu messen, Zurück zu Deploy n, Protokoll-Export, Beamer-Ansicht.
4. **Stufe 2** nach korrigiertem Konzept.
