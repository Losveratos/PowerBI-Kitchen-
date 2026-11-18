# Review-Dossier: Visual-Standards-Simulationen (Daten-WG Knowledge Kitchen)

Du reviewst eine Serie von Simulationen, die mit dem „Visual-Standards-Rechner“ gerechnet wurden. Der Rechner
vergleicht vier Wege, IBCS-nahe Standard-Charts in Power BI umzusetzen: **Paid** (gekauftes Custom Visual, Lizenz je
Nutzer), **Open Source** (fertiges OSS-Visual oder Eigenbau), **Deneb** (Vega-Lite-Templates) und **Core + SVG**
(Core Visuals mit SVG-/DAX-Workarounds). Die Autoren betreiben selbst ein Open-Source-Visual (ChartKitchen byDatenWG),
das in die Kategorie Open Source fällt — achte auf Interessenkonflikte.

Alles liegt im Repository `/home/user/PowerBI-Kitchen-` (nur lesen, nichts ändern) und im Ordner dieses Dossiers.

## Die drei Ergebnisse, lesbar als Text

- `text/01-post-100000-firmen.txt` — Post „No free lunch“: 100.000 anonyme Firmen, Population aus drei KI-Schätzungen
- `text/02-persona-150-firmen.txt` — 150 Persona-Firmen (25 je Ebene), je 5.000 Zukünfte, KI-Pflege-Szenario, Rating nach Nutzern
- `text/03-report-10000-firmen.txt` — Report: 10.000 Firmen mit realer Größenverteilung, Kontrafaktum-Test (17 Hebel),
  Szenario „Open Source mit 1 FTE gepflegt“

## Grundlagen und Daten (zum Nachprüfen)

| Was | Datei |
|---|---|
| Rechner: Kostenkern, alle Annahmen mit Quellen | `/home/user/PowerBI-Kitchen-/md/visual-standards-rechner.md` (lang; Abschnitte „Kostenkern“, „Voreinstellungen“, „Rahmenbedingungen“, „Grenzen“) |
| Rechner selbst (JS-Rechenkern `calc`, `evaluate`, `REQS`, `FLAGS`, `GLOBAL`, `OPTP`) | `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html` (sehr groß, gezielt greppen) |
| 100k: Population (3 Schätzungen + Median), Ergebnis | `/home/user/PowerBI-Kitchen-/sessions/visual-standards-population-100k/`, `/home/user/PowerBI-Kitchen-/assets/posts/no-free-lunch/population.json`, `ergebnis.json` |
| 150 Personas, MC-Ergebnis, KI-Annahmen | `/home/user/PowerBI-Kitchen-/assets/posts/persona-firmen/personas.json`, `mc-ergebnis.json`, `ki-annahmen.json` |
| Aufträge an die Agents, Rohfassungen, KI-Schätzungen, Review-Logs | `/home/user/PowerBI-Kitchen-/sessions/visual-standards-personas-100/` |
| 10k-Ergebnis, Kontrafaktum, OSS-1-FTE | `/home/user/PowerBI-Kitchen-/assets/posts/persona-firmen/report-10k.json`, `kontrafaktum.json`, `oss-1fte.json`, `oss-1fte-annahmen.json` |
| Skripte | `/home/user/PowerBI-Kitchen-/tools/rechner-population-100k.js`, `rechner-population-merge.py`, `rechner-population-analyse.py`, `rechner-personas-mc-v2.js`, `rechner-personas-10k.py`, `rechner-personas-10k-analyse.py`, `rechner-personas-cf.py`, `rechner-personas-cf-analyse.py`, `rechner-oss-fte-analyse.py`, `rechner-10k-report.py`/`.js` |

Du darfst Python/Node ausführen, um Daten nachzurechnen (Schreibzugriff nur im Dossier-Ordner). Playwright/Chromium ist
installiert (`NODE_PATH=$(npm root -g)`), falls du den Rechner direkt ansprechen willst.

## Zwölf Kernaussagen, die du bewerten sollst

| ID | Aussage |
|---|---|
| C1 | (100k) Kein Weg gewinnt immer. Nur Kosten: Paid 68 %; mit harten Regeln: Paid 45 %; mit Must-Listen: Core 30 %, Paid 28 %, Deneb 15 %, OSS 15 %, kein Weg 11 %. |
| C2 | (100k) 47 % der Organisationen dürfen ihren günstigsten Weg nicht nehmen; der zulässige Ersatz kostet im Median +60 %. |
| C3 | (100k) „Jeder zahlt, nur woanders“: Paid ~25 % Lizenz, aber > 50 % eigene Zeit und teuerster Ausstieg; OSS zahlt Wartung/Freigabe; Deneb Lernen; Core 40 % Wartung. |
| C4 | (150 Personas) Nur 25 von 150 Firmen haben eine sichere Antwort (≥ 80 % der Zukünfte), 52 sind ein Münzwurf. |
| C5 | (KI) KI-gestützte Pflege im Konzern spart 1–13 € je Viewer und Jahr und ändert die Rangfolge kaum (Gewinner kippt bei 4 % der 10k-Firmen). |
| C6 | (10k) Ohne harte Weiche: kleine Firmen → Paid am häufigsten; ab ~1.000 MA → Deneb; Core, sobald Custom Visuals ausgeschlossen sind. |
| C7 | (10k) Gesamtrating nach Nutzern: Paid 37 %, Deneb 36 %, Core 15 %, OSS 9 %, kein Weg 4 %. |
| C8 | (10k Kontrafaktum) Harte Regeln/Musts kippen den Gewinner bei 51–91 % der Firmen, Kostenhebel (Lizenzpreis, Horizont, Größe, Bibliothek, Bestand) nur bei 7–33 %. |
| C9 | (OSS 1 FTE) Fertiges + von 1 FTE gepflegtes OSS-Visual: OSS 38 % der Firmen (vor Paid 26 %); zertifiziert 45 % / 35 % der Nutzer. Das fertige Visual ist der größere Hebel, Pflege der Verstärker. |
| C10 | (OSS 1 FTE) Die FTE wäre finanzierbar: Vorsprung im Median 3.680 €/Jahr je Firma; ~4.400 Organisationen/Jahr in DACH; 59–85 €/Firma bei voller Beteiligung; bis ~840 € Beitrag kein Verlust. |
| C11 | (Methodik) Populationen aus KI-Schätzungen (Median) und 10.000 Firmen als skalierte Varianten von 150 Vorlagen mit realer Größenverteilung sind für die Aussagen tragfähig; Kontrafaktum statt Korrelation ist der richtige Weg für Treiber. |
| C12 | (Darstellung) Unsicherheit, Grenzen und Interessenkonflikt sind ausreichend offengelegt; nichts ist geschönt. |

## Was du ablieferst

Zwei Dateien im Dossier-Ordner `review5/`, Dateiname aus deinem Auftrag:

1. `<id>.json`:
```json
{
  "persona": "<Rolle>",
  "verdicts": {"C1": {"rating": "hält|wackelt|falsch|nicht beurteilbar", "why": "1–3 Sätze"}, "...": {} },
  "findings": [
    {"severity": "kritisch|wichtig|klein", "area": "Annahme|Methodik|Darstellung|Daten|Interessenkonflikt|Fehlt",
     "claim": "C-ID oder Stelle", "issue": "Was stimmt nicht", "evidence": "Beleg: Datei/Zahl/Quelle/Nachrechnung",
     "fix": "konkreter Vorschlag", "impact": "würde das Ergebnis kippen? wie stark?"}
  ],
  "missing": ["Was fehlt in der Analyse"],
  "strengths": ["Was gut ist (max. 4)"],
  "overall": {"score": 1, "summary": "3–5 Sätze Gesamturteil"}
}
```
`score`: 1 = nicht verwendbar … 5 = belastbar, so veröffentlichen.

2. `<id>.md`: dein Review als Fließtext für Menschen (max. ~900 Wörter), in deiner Rolle geschrieben.

Regeln: Begründe mit Belegen (Datei und Zahl, Nachrechnung oder Quelle; bis zu ~6 Websuchen erlaubt). Sei konkret und
ehrlich, auch unbequem; lobe nicht pauschal. Trenne „Annahme ist strittig“ von „Rechnung ist falsch“. Prüfe die JSON-Datei
am Ende mit Python auf Gültigkeit. Antworte danach mit 5–8 Sätzen: dein Gesamturteil und die drei wichtigsten Befunde.
