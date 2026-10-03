# MockupKitchen live

Das Kitchen als gemeinsame Tafel, das Power-BI-Projekt (PBIP) als Wahrheit, ein Live-Helfer dazwischen. Ein Klick auf „Deploy" im Kitchen überträgt die Änderungen ins Projekt, Power BI Desktop lädt neu, und das Kitchen zeigt je Kachel, was angekommen ist, mit Bildvergleich Kitchen gegen Desktop.

**Stand 02.10.2026: Beta.** Einstieg für Testerinnen und Tester: [BETA.md](BETA.md) mit Beispielprojekt [`sample/MockupLive-Sample`](sample/MockupLive-Sample/README.md). Sitzung fahren: [PLAYBOOK.md](PLAYBOOK.md). Agenten: Skill `mockup-live` (`.claude/skills/mockup-live/SKILL.md`). Fehler melden: Issue-Vorlage „MockupKitchen live · Beta" mit `mk-live diag`.

```powershell
mockup-live\bin\mk-live.cmd setup              # einmal im Repo-Ordner, danach heißt der Befehl mk-live
mk-live doctor "<Projektordner>"               # Ampel: pbir, te, Bridge, Desktop, compatibilityLevel, Visuals
mk-live start  "<Projektordner>"               # Helfer losgelöst starten, Kitchen mit ?live=1 öffnen
mk-live stop                                   # Helfer beenden
mk-live diag   "<Projektordner>"               # Diagnose-ZIP ohne Bilder (mit Bildern: --with-images)
mk-live register-tool                          # Knopf „Externe Tools → MockupKitchen live", einmal als Administrator
```

Ohne eingerichteten Befehl gilt `mockup-live\bin\mk-live.cmd <Befehl>` oder `python mockup-live\mk_live.py <Befehl>`. Für Profis startet der Runner auch direkt: `python mockup-live\agent\live_runner.py watch "<Projektordner>"`.

| Datei | Inhalt |
|---|---|
| [BETA.md](BETA.md) | Für Tester: Voraussetzungen, Installation, erste Sitzung, Schalter `?live=1`, Neustart nach Bestätigung, bekannte Grenzen aus dem ersten Praxistest, Fehler melden, Feedback-Fragen |
| [PLAYBOOK.md](PLAYBOOK.md) | Sitzung fahren: Start mit `mk-live`, Ablauf eines Deploys, Bestätigungen (Neustart, Ungespeichertes), Abnahme, Stolpersteine, Rückgängig, Grenzen |
| [CONTRACT.md](CONTRACT.md) | Dateivertrag zwischen Kitchen und Runner im Ordner `<Projekt>/mockup/` (Version 1 mit Beta-Ergänzungen) |
| [UX-KONZEPT.md](UX-KONZEPT.md) | Oberfläche des Live-Modus: Deploy-Knopf, Sitzungsband, Neustart Fall A/B, Ergebnis, Freigaben, Moderation/Werkstatt |
| `prototype/live-ux.html` | klickbarer UX-Entwurf (15 Szenen) |
| [KONZEPT.md](KONZEPT.md) | Arbeitsweise, Kreislauf, Stufe 1 (PBIP und Desktop), Stufe 2 (Service, korrigiert am 02.10.2026) |
| [FINDINGS-DEMO-2026-10-02.md](FINDINGS-DEMO-2026-10-02.md) | Befunde B1 bis B9 aus dem ersten Praxistest mit einem 23-seitigen Bericht |
| [REVIEW-LIVE-2026-10-02.md](REVIEW-LIVE-2026-10-02.md) | simuliertes Expertenreview nach dem ersten echten Desktop-Durchlauf, Befunde P1 bis P3 |
| [PLAN-V2.md](PLAN-V2.md) | Agent-Modus v2: Entscheidungen und Arbeitspakete 0 bis E |
| [FIDELITY.md](FIDELITY.md) | Abgleich Kitchen → Power BI je Einstellung, Lücken nach Priorität |
| [AUDIT-DEPLOY4.md](AUDIT-DEPLOY4.md) | Kitchen-Bild gegen Desktop-Bild je Kachel am Deploy vom 29.09.2026 |
| [SPIKE-VISUALS.md](SPIKE-VISUALS.md) | Kitchen-Visuals ohne Desktop installieren |
| [MODEL-OPS.md](MODEL-OPS.md) | Modelländerungen über `te` mit Freigabe |
| `sample/MockupLive-Sample/` | Beispielprojekt (PBIP, Daten in den Abfragen, `compatibilityLevel` 1600) |
| `bin/mk-live.cmd`, `mk_live.py` | Aufruf des Live-Helfers aus dem Repo (beide starten `agent/mk_live.py`) |
| `agent/mk_live.py` | Live-Helfer: `setup`, `doctor`, `start`, `stop`, `diag`, `register-tool` |
| `agent/mk_launch.pyw` | Start aus Desktop (Externe Tools), ruft `mk-live start --pin-pid` |
| `agent/live_runner.py` | Runner: beobachtet Deploys, schreibt per `pbir`, steuert Desktop über `pbir desktop` (Rückfall Bridge-CLI `powerbi-desktop`) |
| `agent/visuals_install.py` | ChartKitchen, KPI-Karte, Gantt, GuV nach `CustomVisuals/` installieren und in `report.json` registrieren |
| `agent/model_ops.py` | Modellwünsche als `te`-Ops planen, freigegebene ausführen, prüfen, bei Fehlern zurücksetzen |
| `agent/tile_compare.py` | Bildvergleich je Kachel (Aufbau-Score und Befunde) |
| `tests/` | Tests mit Attrappen für Bridge, `pbir desktop` und `te` (`python mockup-live/tests/run_tests.py`) |

Die Kitchen-Seite steckt in `assets/mockup/live.js` (Projekt verbinden, Spec schreiben, Deploy, Vergleichsbild, Status) und `assets/mockup/pbir-import.js` (Layout aus dem PBIR lesen); der Live-Modus erscheint nur mit `?live=1`. Den Konverter Spec → `pbir`-Bausteine teilt sich der Runner mit dem Skill `mockup-to-powerbi`. Die Standalone-Fassung `dist/MockupKitchen.html` ist ein Build-Ergebnis (`scripts/build_mockup_standalone.py`) und wird nicht eingecheckt.

**Lizenzen und Previews:** `pbir` ist nur für nicht-kommerzielle Nutzung lizenziert. Desktop Bridge und `te` sind Preview, `te` mit Ablaufdatum.
