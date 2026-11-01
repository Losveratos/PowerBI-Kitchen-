---
name: fabscan
description: >
  Governance-Prüfung für Microsoft Fabric Apps (Rayfin) und für den Fabric-Tenant: findet, wo eine App
  selbst rechnet statt Measures des Semantikmodells zu nutzen, Lineage-Brüche, Sicherheitsrisiken
  (App-Identität, fehlende RLS, ausgeblendete Felder, fremde Server, Geheimnisse), veränderte Abfragen
  (feste Filter, ALL/REMOVEFILTERS, überschriebene Measures) und Abweichungen zum Modell. Liefert einen
  HTML-Bericht in Klartext, eine Markdown-Zusammenfassung und Daten (JSON/CSV), und kann Befunde beheben.
  Auslösen, wenn der Nutzer sinngemäß sagt „prüf meine Fabric App(s)“, „Governance-Check“, „rechnet die
  App selbst?“, „wo weicht die App vom Modell ab“, „Sicherheitscheck für die App“, „fabscan“,
  „Tenant scannen“, „welche Apps fragen unsere Modelle ab“, „Notebook für den Tenant-Scan“,
  oder bevor eine neu gebaute Fabric App als fertig gemeldet wird.
---

# fabscan · Governance-Prüfung für Fabric Apps

fabscan liest Code und Abfragen, führt nichts aus und braucht keine Verbindung zu Fabric. Es kommt mit der
Python-Standardbibliothek aus (Python ≥ 3.10).

**Aufruf:** `python3 <SKILL_DIR>/run.py …`. `<SKILL_DIR>` ist der Ordner dieser SKILL.md. Ist fabscan
installiert (`fabscan --version` funktioniert), geht auch `fabscan …`.

## 1 · Apps im Repository prüfen (Standardfall)

```bash
python3 <SKILL_DIR>/run.py <repo-ordner> -o fabscan-bericht
```

- Gefunden wird jede App mit `rayfin/rayfin.yml`, dazu die Semantikmodelle als TMDL (`*.SemanticModel`) im selben Repo.
  Liegt ein Modell woanders: `--models <ordner>`.
- Ergebnis im Ausgabeordner: `bericht.html` (Klartext, Datenweg, Fundstellen), `zusammenfassung.md`,
  `befunde.json`, `befunde.csv`.
- Gibt es einen Ordner für Ausgabedateien (z. B. `/mnt/user-data/outputs` in claude.ai), dorthin schreiben, damit der
  Nutzer den Bericht öffnen kann.

**Danach antworten:** `zusammenfassung.md` lesen und dem Nutzer in Klartext sagen:
1. das Gesamtbild in zwei, drei Sätzen,
2. die wichtigsten Befunde (✗ und ⚠) mit App-Namen und Zahlen,
3. was du als Erstes angehen würdest,
4. wo der Bericht liegt.

Keine Regel-IDs und keine Code-Schnipsel in der Antwort, außer der Nutzer fragt danach.

## 2 · Befunde beheben (nur auf Wunsch oder nach Rückfrage)

Je Befund im App-Code. Danach immer erneut prüfen und sagen, was sich geändert hat.

| Regel | Was tun |
| --- | --- |
| `CALC-RAW`, `CALC-TS` | Abfragen auf `SUMMARIZECOLUMNS` mit den Measures des Modells umstellen; Summen, Quoten und Δ im TypeScript entfernen. Fehlt ein Measure, eine DAX-Definition vorschlagen, nicht selbst ins Modell schreiben. |
| `CALC-PROJ`, `CALC-DEFINE` | Ausdruck als Measure vorschlagen; in der Abfrage das Measure verwenden. |
| `DEV-NAME` | Das gleichnamige Measure abfragen statt nachrechnen. |
| `DEV-TRANSFORM` | `ROUND`/`FORMAT` aus der Abfrage entfernen und in der Anzeige formatieren; `TRIM` als Hinweis für die Datenaufbereitung. |
| `QRY-HARDCODED` | Feste Werte (Jahr, Szenario, Stichtag) als sichtbare Auswahl oder Parameter der App. |
| `QRY-SHADOW` | `DEFINE MEASURE` mit Modell-Namen entfernen und das Modell-Measure nutzen. |
| `QRY-OVERRIDE` | Prüfen, ob gewollt; sonst `ALL`/`REMOVEFILTERS` entfernen oder in der App kennzeichnen. |
| `SEC-CDN` | Schriften lokal ausliefern (woff2 ins Bundle, `@font-face`), `<link>` zu fonts.googleapis.com entfernen. |
| `SEC-AUTH` | In `rayfin/rayfin.yml` `auth.type: delegated`. Nur ändern, wenn der Nutzer zustimmt. |
| `SEC-STORAGE` | Nur UI-Zustand speichern, keine Abfrageergebnisse. |
| `SEC-SECRET`, `SEC-TRACKED` | Sofort melden. Nicht im Chat zitieren; Schlüssel austauschen lassen. |
| `LIN-NO-MODEL` | Erklären, dass das Modell per Fabric-Git ins Repo gehört, oder `--models` nutzen. |
| `SEC-NO-RLS`, `SEC-HIDDEN` | Nur berichten: Änderungen am Modell (RLS, OLS) gehören zum Modell-Owner. |

Nie deployen (`rayfin up`), nie Fabric-Items oder Modelle ändern, keine Geheimnisse ins Repo schreiben.

## 3 · Den ganzen Tenant prüfen

Für Admins: Welche Anwendungen fragen die Modelle außerhalb von Power-BI-Berichten ab, und wie?

- **Direkt aus dem CLI (am schnellsten):**
  `python3 <SKILL_DIR>/run.py fetch -w "<Workspace>" --days 14 -o fabscan-tenant`
  - Liest die Modelle über die Admin-Scanner-API und die Abfragen aus dem Workspace Monitoring.
  - Findet die Monitoring-Datenbank selbst. Sonst mit `--monitoring <Abfrage-URI>=<KQL-Datenbank>` angeben.
  - Ohne `-w` prüft es alle aktiven Workspaces.
  - Anmeldung: `az login` vorher, oder ein Service Principal über `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` und
    `AZURE_CLIENT_SECRET`.
  - Nur Lesezugriffe. Braucht Fabric-Admin-Rechte bzw. einen Service Principal, der für Admin-APIs freigegeben ist.
  - Bei Abbruch die Meldung in Klartext erklären, zum Beispiel fehlende Admin-Rechte, Tenant-Einstellungen,
    Monitoring aus oder keine Verbindung.

- **Notebook erzeugen:** `python3 <SKILL_DIR>/run.py notebook -o fabscan_tenant.ipynb`.
  Dem Nutzer erklären: In einen Fabric-Workspace importieren, ein Lakehouse anhängen, in der Parameter-Zelle die
  Monitoring-Eventhouses eintragen, alle ausführen. Voraussetzungen stehen in der ersten Zelle (Fabric-Admin,
  zwei Tenant-Einstellungen für detaillierte Metadaten, Workspace Monitoring).
- **Exportierte Dateien auswerten:** Hat der Nutzer eine Scanner-API-Antwort und einen Log-Export:
  `python3 <SKILL_DIR>/run.py --scan-result scan.json --query-log logs.csv -o tenant-bericht`.

## 4 · Ausgaben für später

`befunde.json` und `befunde.csv` folgen einem festen Datenvertrag (`schema_version` 1, eine Zeile je Befund:
run_id, run_date, source, scope, client, workspace, model, category, severity, rule, headline, why, todo, …).
Das Notebook schreibt dieselben Spalten in die Tabelle `fabscan_findings`. Damit kann ein Power-BI-Bericht
oder eine Fabric App die Läufe über die Zeit zeigen.

## Grenzen

fabscan erkennt Muster in DAX und TypeScript, es versteht den Code nicht vollständig. Befunde sind Hinweise
zum Prüfen. Abfragen, die erst zur Laufzeit entstehen, sind nur teilweise sichtbar. Kennzahlen mit sehr kurzen
Namen (z. B. „FC“) erkennt die Namensprüfung nicht.
