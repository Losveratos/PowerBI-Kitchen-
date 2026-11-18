# Auftrag: ChartKitchen + P&L byDatenWG als konkrete Variante im Visual-Standards-Rechner

Der Visual-Standards-Rechner (`visual-standards-rechner.html`, v0.25) vergleicht vier Wege zu IBCS-nahen Standard-Charts in
Power BI: Paid (gekauftes, zertifiziertes Visual), **Open Source**, Deneb und Core + SVG. Der Weg „Open Source“ ist bisher
generisch (ein beliebiges OSS-Visual, fertig oder selbst gebaut). Jetzt soll er als **konkretes fertiges Produkt** gerechnet
werden: **ChartKitchen byDatenWG** (`ibcsInspiredChartDeck/`) **plus P&L Statement byDatenWG** (`pnlByDatenWG/`), so wie sie im
Repository heute stehen, mit allen Vor- und Nachteilen.

**Wichtig:** Beide Visuals sind Eigenprojekte der Autoren dieses Repos. Du bist ein **unabhängiger Prüfer**, kein Fürsprecher.
Glaube keiner Werbeaussage aus README oder Listing-Text, ohne Beleg im Code, in Tests, Audits oder im Changelog. Wo du nichts
findest, schätze konservativ und markiere es als Schätzung. Nachteile sind genauso wichtig wie Vorteile.

## Was du lesen sollst (Lesezugriff, nichts ändern)

- `STATUS.md`, `README.md`
- `ibcsInspiredChartDeck/AGENT-GUIDE.md`, `README.md`, `CHANGELOG.md` (Release-Takt!), `AUDIT-2026-*.md`, `BACKLOG.md`,
  `appsource/SUBMISSION-CHECKLIST.md`, `capabilities.json`, `NOTICE`, `LICENSE`
- `pnlByDatenWG/AGENT-GUIDE.md`, `README.md`, `CHANGELOG.md`, `BACKLOG.md`, `TESTPLAN.md`, `capabilities.json`
- `.claude/skills/` (chartkitchen-report, pnl-report, finance-data-model): Gibt es Agent-Skills, die Report-Aufbau beschleunigen?
- Im Rechner: die Notizen und Quellen zu `oss` in `const OPTP=[`, `const REQS=[` und `const FLAGS=[`; dazu `md/visual-standards-rechner.md`
- Du darfst bis zu ~5 Websuchen machen (z. B. ob ChartKitchen/P&L byDatenWG in AppSource stehen, Zertifizierungsdauer).

## Die Stellschrauben (aktuelle generische OSS-Werte, Dreipunkt lo/mode/hi; zum Vergleich Paid)

| id | Bedeutung | oss | paid |
|:--|:--|:--|:--|
| setupH | Einmaliger Setup (h) | 10/22/42 | 18/40/100 |
| devH | Eigenentwicklung (h) | 0/0/0 (fertig) | – |
| firstH | Stunden je Chart-Typ erstmalig | 4.5/8.5/14 | 2/4/7.5 |
| reuseH | Stunden je Chart bei Wiederverwendung | 1/2/3.5 | 0.5/1/2 |
| trainH | Schulung je Vorlagen-Bauer (h) | 8/15/26 | 5/8.5/15 |
| lightH | Schulung je Vorlagen-Nutzer (h) | 1/2/4 | 0.5/1.5/3 |
| rampH | Einarbeitung bei Fluktuation (h) | 12/28/70 | 8/16/40 |
| supH100 | Anwender-Support je 100 Viewer/Jahr (h) | 2.5/5.5/10 | 2/4/6 |
| govIntake | Freigabe je Visual-Paket, einmalig (h) | 8/24/60 | 4/8/16 |
| govRun | Laufende Governance/Jahr (h) | 12/30/80 | 6/16/42 |
| govAudit | Prüfnachweis/Jahr (h) | 3/8/20 | 2/6/16 |
| course | Kurskosten je Vorlagen-Bauer (€) | 0/0/300 | 0/200/800 |
| maint | Wartungsquote/Jahr (%) | 12/22/32 | 6/10/18 |
| events | Breaking-Updates/Jahr (Anzahl) | 0.5/1.5/3 | 0.2/1/2 |
| fixH | Stunden je Breaking-Update im Haus | 3/7/14 | 1/3/5.5 |
| dep | Abkündigungsrisiko/Jahr (%) | 3/7/13 | 1/2/4 |
| variantG | Varianten-Anfälligkeit (×) | 0.3/0.5/0.7 | 0.1/0.25/0.4 |
| cxSimple / cxComplex | Komplexitätsfaktoren | 0.5/0.7/0.9 · 1.4/1.9/2.9 | 0.5/0.7/0.9 · 1.2/1.4/1.8 |
| lockIn | Bindungsgrad beim Ausstieg (×) | 0.6/0.8/0.95 | 0.8/0.95/1 |
| certFee | Beitrag zur Zertifizierung je Organisation/Jahr (€), nur wenn zertifiziert | 150/800/2550 | – |

Anforderungs-Fähigkeiten `cap` (1 = K.O. bei Must, 2 = Warnung, 3–5 = erfüllt, abgestuft), Reihenfolge paid/oss/deneb/core:
ibcs 5,4,4,2 · ibcscert 5,1,1,1 · mscert 5,1,4,5 · export 5,1,3,5 · exportdata 4,3,2,5 · interact 5,4,4,2 · drill 4,3,2,5 ·
bigdata 3,3,3,4 · writeback 5,2,1,1 · maint 5,5,2,2 · copilot 1,1,1,5 · agentic 2,3,3,4 · a11y 3,3,2,3 · pin 2,5,3,1 ·
alm 2,2,4,5 · themeable 3,3,3,5 · mobile 4,3,2,4 · copyppt 2,2,3,5 · paginated 2,2,2,2 · exit 2,3,4,5 · design 5,4,2,2 ·
rs 2,2,2,5 · scale 5,4,4,2 · version 2,3,5,4 · sla 5,1,1,5 · datares 4,3,5,5 · bus 5,3,2,3.
(mscert und export bei oss = 1, solange das Visual nicht zertifiziert ist; mit Zertifizierung gilt der Paid-Wert.)

## Fragen

1. **Welche Parameter weichen für ChartKitchen + P&L vom generischen OSS-Wert ab, und wie?** Nur die mit Beleg oder klarer
   Begründung. Bedenke: Es sind **zwei** Visual-Pakete (Freigabe, Governance, Schulung je Paket?), es gibt Agent-Skills und
   Agent-Guides, IBCS-Vorlagen, 4 Sprachen, einen hohen Release-Takt, einen kleinen Herausgeberkreis (Bus-Faktor), kein
   Sponsoring-Modell (Finanzierung über Beratung), keine SLA, keine IBCS-Zertifizierung.
2. **Welche `cap`-Werte weichen für oss ab** (z. B. writeback, exportdata, drill, a11y, agentic, bigdata, mobile, bus)?
3. **Zertifizierung:** Wie ist der Stand heute (AppSource, Microsoft-Zertifizierung)? Zwei Szenarien:
   - **ck_heute:** so wie es heute ist.
   - **ck_zert:** nach AppSource-Listung und Microsoft-Zertifizierung (angekündigt, ohne Termin). Was zahlt eine nutzende
     Organisation dafür (certFee, Beratung ist optional und nicht Pflicht), wie stark hinken Versionen hinterher?
4. **Vorteile und Nachteile** in Klartext, je 5–8 Punkte, mit Beleg (Datei) oder „Schätzung“.

## Ausgabe

Genau eine JSON-Datei (Pfad aus deinem Auftrag):
```json
{
  "estimator": "<Modell>",
  "pOver": {"<param>": [lo, mode, hi], ...},          // nur abweichende oss-Parameter, für beide Szenarien gleich
  "capOver": {"<req-id>": <neuer oss-cap 1..5>, ...}, // nur abweichende Fähigkeiten (ohne mscert/export)
  "ck_heute": {"certAvailable": false, "note": "..."},
  "ck_zert": {"certFee": [lo, mode, hi], "lagWeeks": [lo, mode, hi], "pOverExtra": {"<param>": [lo, mode, hi]}, "note": "..."},
  "pros": [{"t": "...", "src": "Datei oder Schätzung"}],
  "cons": [{"t": "...", "src": "Datei oder Schätzung"}],
  "rationale": {"<param oder cap>": "1–2 Sätze, Quelle"},
  "biggest_uncertainties": ["..."]
}
```
Prüfe die Datei mit Python auf gültiges JSON und aufsteigende Dreipunkte (lo ≤ mode ≤ hi). Antworte danach mit 5–8 Sätzen.
