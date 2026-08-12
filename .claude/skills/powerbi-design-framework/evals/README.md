# Trigger-Eval-Set · powerbi-design-framework

`trigger-evals.json` enthält 20 realistische Nutzer-Queries (10x
`should_trigger: true`, 10x `should_trigger: false`), mit denen sich die
`description` im SKILL.md-Frontmatter dieses Skills auf Auslöse-Genauigkeit
prüfen und optimieren lässt.

## Aufbau des Sets

- **Positiv-Fälle (10):** decken die Kern-Trigger-Szenarien ab — neues
  Seitengerüst/Layout, Branding aus Website/Präsi ziehen, Theme/Farben,
  Filterpanel/Navigation, "Charts/Report schöner/konsistenter machen",
  Bulk-Restyle ("überall Schatten weg"), Design-Review/Linting, IBCS-
  Seitenlayout, Dark Mode, Komponenten-/Vorlagenseite.
- **Negativ-Fälle (10):** bewusst als *Near-Misses* zu den vier
  Nachbar-Skills formuliert, nicht als offensichtlich fremde Themen:
  reine DAX-Frage, Deneb/Vega-Spec-Debugging (→ `vega-charts`),
  ChartKitchen-Report aus Daten aufbauen (→ `chartkitchen-report`),
  einzelnes Deneb-Template in PBIP einfügen (→ `deploy-to-powerbi`),
  PowerPoint-Folien-Design, Datenmodellierungs-Frage, Performance-Problem,
  YouTube-Kanal-Update (→ `kitchen-update`), Webseiten-Design ohne
  Power-BI-Bezug, Power-BI-Lizenzfrage.

Sprache: überwiegend Deutsch (teils Kleinschreibung, Umgangssprache,
Tippfehler), 3 Queries auf Englisch. Enthält Dateinamen- und
Firmenkontext (z. B. `Sales.pbix`, `Umsatz-Dashboard.pbix`, Q3-Präsi),
damit die Queries wie echte Chat-Eingaben wirken statt wie
Lehrbuch-Sätze.

## Wie man das Set später nutzt

Sobald ein Mensch die Queries inhaltlich freigegeben hat, mit dem
Optimierungs-Loop aus dem `skill-creator`-Skill laufen lassen:

```bash
python3 /root/.claude/skills/synced/skill-creator/scripts/run_loop.py \
  --eval-set /home/user/PowerBI-Kitchen-/.claude/skills/powerbi-design-framework/evals/trigger-evals.json \
  --skill-path /home/user/PowerBI-Kitchen-/.claude/skills/powerbi-design-framework \
  --model <model-id>
```

Nützliche Zusatz-Flags: `--holdout 0.4` (Split in Train/Test),
`--runs-per-query 3` (Mehrfachläufe gegen Varianz), `--results-dir …`
(Ergebnisse inkl. HTML-Report persistieren). Details siehe
`--help` bzw. das `skill-creator`-SKILL.md.

Der Loop verändert iterativ die `description` im Frontmatter, misst pro
Iteration die Trigger-Rate auf Positiv-/Negativ-Fällen und behält die
beste Version. Änderungen an der `description` bitte danach im
SKILL.md-Diff gegenlesen, bevor sie committet werden.

## Status

**Der Loop wurde noch nicht ausgeführt** (Token-Budget bewusst
geschont). Das passiert erst, nachdem ein Mensch die 20 Queries oben
inhaltlich geprüft und freigegeben hat — insbesondere ob die
Negativ-Fälle wirklich als "kein Trigger" gewünscht sind und ob den
Positiv-Fällen keine wichtigen Szenarien fehlen.
