# Gegenprüfung Runde 2 · Fund "zeit" · REQS.agentic (KI-Agent-Skills auf PBIR)

**Prüfer:** adv1 (adversarieller Prüfer, Linse Evidenz/Plausibilität)
**Geprüfter Fund:** Finder "zeit", Bereich `criterion`, "KI-Kriterium ist 2026 zweigeteilt: Copilot-UI (nur Core) vs. Agent-Skills auf PBIR (Code-Ansätze im Vorteil)"
**Datum Prüfung:** 2026-09-11

## Ergebnis kurz

**Nicht widerlegt, aber Werte angepasst (refuted=false, adjusted).**

Der Kernbefund ist sachlich richtig und die Primärquellen tragen die Aussage. Die vorgeschlagenen `cap`-Werte für `oss`, `deneb` und `core` sind aber zu optimistisch bzw. nicht differenziert genug begründet. `paid` ist plausibel.

## Schema-Check (wichtig für die Bewertung)

`REQS[].cap` ist **kein** `[min, wahrscheinlich, max]`-Array mit Buchstaben-Badge (das ist nur bei `GLOBAL`/`OPTP` so). Es ist ein 4-elementiges Array `[paid, oss, deneb, core]` mit je einem Erfüllungsgrad 1–5 (`CAP_LBL`: 1 nicht möglich … 5 sehr gut), siehe `capOf()` (Zeile 786) und `OK` (Zeile 486). Der Fund verwendet dieses Format korrekt (`cap:[2,2,4,5]` = paid 2, oss 2, deneb 4, core 5) — hier liegt **kein** Fehler vor, im Gegensatz zu einer ersten Fehleinschätzung meinerseits während der Prüfung. Das ist wichtig festzuhalten, weil die Aufgabenbeschreibung die `[min,wahrscheinlich,max]+Badge`-Konvention nur für `OPTP` nennt und man den Fund sonst fälschlich als Formatfehler abtun könnte.

## Evidenzprüfung (per Microsoft Learn MCP verifiziert)

1. **Copilot unterstützt keine Custom Visuals** — bestätigt, Primärquelle `learn.microsoft.com/power-bi/create-reports/copilot-create-reports#create-and-edit-reports`, Abschnitt "Considerations and limitations", Punkt 5: "Custom visuals: Copilot doesn't support custom visuals." Deckt sich mit dem bereits im Rechner zitierten Beleg (Zeile 620).
2. **Power BI Report Authoring skill (Preview)** — bestätigt, `learn.microsoft.com/power-bi/developer/agentic/power-bi-report-authoring-skill-overview`. Zitat bestätigt fast wörtlich: "optimized for GitHub Copilot CLI with cross-tool compatibility for VS Code Copilot, Claude Code, Cursor, Codex/Jules, and Windsurf." Skill arbeitet direkt mit PBIR/PBIP-Dateien, ist explizit "in preview", funktioniert "only with PBIP files" (nicht direkt im Service). Auch die Companion-Skills "Report Design" und "Report Planner" sind real und im selben Plugin gebündelt — stützt die Formulierung "Microsoft-Skills Report Design/Authoring/Planner (Preview)".
3. **PBIR Default-Rollout** — im Kern bestätigt, aber mit Nuance: Januar 2026 "PBIR is activated by default in the Power BI service as part of a phased rollout (full availability by end of February)", März 2026 Default in Desktop, GA für Q3 2026 geplant (`desktop-latest-update-archive`). ABER: der Juni-2026-Eintrag sagt "The PBIR default-on rollout **resumes** in the service" — das Wort "resumes" impliziert, dass der Rollout zwischenzeitlich pausiert war. Die Formulierung "PBIR seit 01/2026 Default im Service" im Fund ist damit leicht zu glatt; korrekt wäre "seit 01/2026 in phasenweisem Rollout, im Service zeitweise pausiert, GA weiterhin für Q3 2026 geplant". Für den Rechner (Stand 09/2026, Konferenz 10/2026) ändert das nichts Wesentliches, sollte aber im Sub-Text nicht als abgeschlossene Tatsache klingen.
4. **Desktop Bridge Preview 06/2026** — bestätigt (`desktop-latest-update-archive`, Juni-2026-Eintrag: "Power BI Desktop Bridge (Preview)").
5. **Community-Skill `deneb-visuals`** — nicht direkt nachprüfbar (skillsmp.com nicht in meiner Fetch-Pipeline verifiziert, laut Finder ohnehin nur "Snippet"-Qualität). Das ist ein Community-Marketplace-Eintrag eines Einzelautors ("data-goblin"), keine offizielle/verifizierte Quelle zu Reife, Wartungsstand oder tatsächlichem Funktionsumfang. Muss als schwächste Evidenz im Fund behandelt werden.
6. **Fabric Apps** — bereits im Rechner selbst dokumentiert (Zeile 442f, 639), unstrittig als "nicht modelliert" markiert. Kein Widerspruch.

## Warum ich die Werte anpasse

### 1. `oss` sollte nicht automatisch `paid` gleichgesetzt werden (Wert 2)
Der Fund liefert für `paid` eine explizite Begründung ("Property-Schema des Vendor-Visuals undokumentiert, Agent kann nur kopieren"), für `oss` aber keine eigene Notiz — es wird stillschweigend derselbe Wert (2) übernommen. Das ignoriert einen zentralen Unterschied: ChartKitchen ist laut Kontext "eigenes Projekt der Autoren, offengelegt" — der TypeScript-Quellcode liegt offen, ein Agent kann die Property-Namen direkt aus dem Quellcode lesen, auch ohne dedizierte Agent-Skill. Das ist etwas anderes als ein closed-source Vendor-Visual, dessen internes JSON-Schema nirgends dokumentiert ist. Ohne Beleg, dass für ChartKitchen dieselbe Undurchsichtigkeit gilt wie für Zebra BI/Inforiver/graphomate, ist die Gleichsetzung nicht sauber begründet.

**Vorschlag:** `oss` auf 3 anheben, mit eigener Notiz z. B. "Kein Agent-Skill vorhanden, aber Quellcode offen einsehbar — Agent kann Property-Namen aus dem Repo ableiten, nicht aus Dokumentation".

### 2. `deneb` = 4 ist zu hoch für eine unverifizierte Community-Marketplace-Skill
Der Rechner behandelt Deneb an anderer Stelle konsequent vorsichtig bei Einzelmaintainer-Risiko (`TEXT.deneb.con`: "Ein Maintainer, Support nur über Sponsoring"; `REQS.sla` Notiz: "Support nur über GitHub-Sponsoring (50–750 $/Monat)"). Ein einzelner, nicht offiziell verifizierter Community-Skill von einem Marketplace-Drittanbieter, dessen Qualität der Finder selbst nur mit "Snippet"-Evidenz belegen kann, passt score-mäßig eher zu "eingeschränkt" (3) als zu "gut" (4) — insbesondere weil unklar ist, ob der Skill aktiv gepflegt wird und mit künftigen Deneb-/PBIR-Versionen kompatibel bleibt.

**Vorschlag:** `deneb` auf 3 senken.

### 3. `core` = 5 ist zu hoch für explizit als Preview markierte Skills
Report Authoring/Design/Planner sind laut Primärquelle alle "in preview", funktionieren nur mit PBIP-Dateien (nicht direkt gegen den Service) und die Doku warnt selbst vor Legacy-Visual-Fallstricken ("Some visuals … will be deprecated soon"). Der Rechner selbst vergibt an anderer Stelle für Preview-Funktionen keine Bestnote (z. B. würde man "Translytical Task Flows" vor GA nicht mit 5 bewerten). "Sehr gut" (5) sollte GA-Reife oder zumindest breite Serviceabdeckung bedeuten; eine Preview-Toolkette, die zusätzlich einen externen Coding-Agenten (GitHub Copilot CLI o. ä.) voraussetzt, ist eher "gut" (4).

**Vorschlag:** `core` auf 4 senken.

### 4. Zielgruppen-Check
Der Rechner richtet sich an Controlling/Finance DACH (Pre-Conference 14.10.2026). Der beschriebene Workflow (Agent schreibt PBIR-JSON über GitHub Copilot CLI/VS Code/Claude Code) ist ein Entwickler-Workflow, kein typischer Finance-Self-Service. Das spricht klar für die vom Finder bereits gewählte niedrige Priorität `def:'C'` (Could) — hier besteht kein Widerspruch, im Gegenteil, das bestätigt die gewählte Priorisierung als richtig kalibriert.

## Ist das nur eine Umformulierung des Bestehenden?

Nein. `REQS.copilot` deckt ausschließlich den Copilot-Pane-Workflow ab (Service/Desktop, GUI-Assistent). Der neue Aspekt — Agenten, die direkt PBIR-JSON-Dateien schreiben — ist ein strukturell anderer Erstellungspfad mit eigener Werkzeugkette (Skills-Marketplace, Git-Workflow, CLI-Agenten) und eigenen Erfüllungsmustern je Ansatz (Deneb-Specs sind Text und AI-freundlich, Vendor-JSON ist es nicht). Eine neue Zeile ist gerechtfertigt, keine Duplikation von `REQS.copilot`.

## Bewertung nach den vier Prüffragen

- **Ist die Evidenz echt und trägt sie die Aussage?** Ja für Copilot-Limitierung, Report-Authoring-Skill, PBIR-Rollout-Zeitpunkte (mit der oben genannten "resumes"-Nuance) und Desktop-Bridge-Preview — alles primär über Microsoft Learn verifiziert. Die `deneb-visuals`-Skill-Referenz bleibt schwach belegt (Marketplace-Snippet, nicht unabhängig geprüft).
- **Ist der Wert plausibel für DACH-Controlling 2026–2031?** Die Priorität (`C`) ja. Die konkreten `cap`-Zahlen sind in der vorgeschlagenen Form zu optimistisch für oss/deneb/core, siehe oben.
- **Fund oder Umformulierung?** Echter neuer Fund, kein Duplikat.
- **Blindschätzungen mit Erfahrung vereinbar?** Die Grundrichtung (Core hat MS-eigene Skills, Deneb hat Community-Skill, Vendor-Visuals sind für Agenten am schwersten zugänglich) ist erfahrungsplausibel. Die Feinabstufung war zu grob positiv gerundet.

## Empfohlene Werte (adjusted)

```
REQS.agentic: cap:[2,3,3,4], def:'C'
notes:
  paid:  'Property-Schema des Vendor-Visuals undokumentiert, Agent kann nur kopieren'
  oss:   'Kein Agent-Skill vorhanden, aber offener Quellcode (TypeScript) – Agent kann Property-Namen aus dem Repo ableiten, nicht aus Dokumentation'
  deneb: 'Community-Skill deneb-visuals (Einzelautor, Marketplace, Reifegrad ungeprüft) erzeugt Specs und injiziert sie in visual.json'
  core:  'Microsoft-Skills Report Design/Authoring/Planner (Preview, nur gegen PBIP-Dateien, kein direkter Service-Zugriff)'
```

Sub-Text-Korrektur für den PBIR-Rollout-Hinweis (falls im Konflikt-Box-Text oder Notes verwendet): "seit 01/2026 phasenweiser Rollout im Service (zwischenzeitlich pausiert, GA Q3 2026 geplant)" statt "seit 01/2026 Default im Service" als abgeschlossene Aussage.

Die Umbenennung von `REQS.copilot.sub` zu "Copilot-Pane im Service/Desktop" ist unkritisch und sinnvoll zur Abgrenzung — keine Einwände.

## Konfidenz

Mittel-hoch für den Kernbefund (gut belegte Primärquellen), niedrig-mittel für die exakte Höhe der `oss`/`deneb`/`core`-Werte (dort teils Ermessensentscheidung, keine harte Quelle für die genaue Punktzahl).

## Wirkung

Mittel: Eine neue Zeile mit `def:'C'` wirkt sich bei Standard-Gewichtung nur gering auf das Gesamtranking aus, schärft aber die Argumentation im Vortrag (Copilot-Pane vs. Agent-Skills-auf-PBIR ist ein for Finance/Controlling nachvollziehbarer, aktueller Unterschied) und verhindert, dass Zuhörer den bestehenden `REQS.copilot`-Eintrag als abschließende KI-Aussage über Deneb/OSS missverstehen.
