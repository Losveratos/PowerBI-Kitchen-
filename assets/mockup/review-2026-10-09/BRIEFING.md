# MockupKitchen byDatenWG · Persona-Review (Oktober 2026)

Du spielst eine Persona und prüfst das Werkzeug **MockupKitchen byDatenWG**, ein
Browser-Tool ohne Backend, mit dem man in Reporting-Workshops Power-BI-Berichte
skizziert und als `mockup-spec.json` plus Agent-Brief exportiert. Ein
Coding-Agent (Claude Code, Skill `mockup-to-powerbi`) baut daraus den Bericht.

## Was wir von dir wollen

**Nicht** primär Bugs. Zwei Reviews mit simulierten Nutzern gab es schon
(v0.3 am 18.09., v0.5.1 am 25.09.), 43 von 50 Befunden sind behoben. Lies beide
Reviews zuerst, damit du nichts Bekanntes meldest:

- `/home/user/PowerBI-Kitchen-/assets/mockup/REVIEW-2026-09-18.md`
- `/home/user/PowerBI-Kitchen-/assets/mockup/REVIEW-2026-09-25.md`

Wir wollen aus deiner Rolle heraus wissen:

1. **Was fehlt dir**, damit du das Werkzeug in deiner Arbeit wirklich einsetzt?
   (Features, Inhalte, Abläufe, Integrationen)
2. **Wo ist das Erlebnis schlechter als nötig**, auch wenn es funktioniert?
   (Reibung, Umwege, Unklarheiten, Vokabular, Tempo)
3. **Zusammenführung**: Der Autor will das Kitchen später sauber mit einer
   Fabric-App-Laufzeit zusammenführen und aus derselben Spec nicht nur
   Power-BI-Berichte, sondern auch **Rayfin-Apps** (Microsoft Fabric Apps,
   React) ableiten. Was muss die Spec, das Vokabular oder die Bedienung dafür
   können, was heute fehlt? Was darf dabei auf keinen Fall verloren gehen?
   Referenz für solche Apps: `/home/user/Fabric-Apps-Demo/apps/` (fünf Apps)
   und `/home/user/Fabric-Apps-Demo/memory/` (Learnings).
4. Wenn du Fehler findest, die noch nicht im Review vom 25.09. stehen oder dort
   als behoben gelten, aber noch auftreten: melde sie, aber getrennt und kurz.

## So prüfst du

- Das Werkzeug läuft unter **http://localhost:8765/mockup-kitchen.html**
  (identisch mit der veröffentlichten Version v0.5.4). Bediene es **wirklich**
  per Playwright (Chromium). Der Helfer `mk.mjs` in diesem Ordner nimmt dir
  den Start ab; Skripte in deinen Ordner `review/<dein-slug>/` legen und mit
  `node <skript>.mjs` ausführen. Mach Screenshots als Belege und schau sie dir
  an (Read auf die PNG-Datei), sonst urteilst du blind.
- Erst bedienen, dann lesen. Quelltext (`/home/user/PowerBI-Kitchen-/mockup-kitchen.html`,
  `assets/mockup/*.js`, `assets/mockup/README.md`) nur, um eine Beobachtung
  einzuordnen oder die Ursache zu benennen.
- Der Skill, der die Spec verbaut: `/home/user/PowerBI-Kitchen-/.claude/skills/mockup-to-powerbi/`
  (`SKILL.md`, `references/spec-format.md`). Die Python-Skripte dort kannst du
  auf einen eigenen Export anwenden (`python3 -I scripts/mockup_to_pbir.py <spec> --validate`).
- Echte Semantikmodelle als TMDL für den Import liegen unter
  `/home/user/Fabric-Apps-Demo/*.SemanticModel/definition/tables/*.tmdl`
  (Vertriebscontrolling, ChartKitchen Demo). Das Tool nimmt TMDL-Dateien per
  Datei-Dialog („TMDL laden", `page.setInputFiles`).
- Arbeite dich an 8 bis 12 Aufgaben entlang, die deine Rolle wirklich hätte.
  Beispiele stehen in deiner Persona, eigene sind besser. Halte je Aufgabe
  fest: Ziel, was du getan hast, Ergebnis (gelungen / teilweise / gescheitert),
  Beleg (Screenshot-Datei).
- Budget: etwa 40 bis 60 Browser-Schritte. Lieber 8 Aufgaben gründlich als 15
  oberflächlich. Wenn Playwright hakt (Selector), nicht ewig kämpfen: anders
  probieren (`getByText`, `getByTitle`, Koordinaten, `page.evaluate` mit
  `window.MK`), notfalls die Aufgabe als „nicht prüfbar“ markieren und warum.
- Du bist kein Fan und kein Gegner. Schreib so, wie die Persona in einem
  ehrlichen Gespräch mit dem Autor reden würde. Keine Floskeln.

## Dein Bericht

Datei: `/tmp/claude-0/-home-user/c43f779c-7551-5557-b0c3-800b40a4165e/scratchpad/review/<dein-slug>.md`,
auf Deutsch, Markdown, ohne Gedankenstriche (schreib Komma, Punkt oder
Doppelpunkt). Struktur genau so:

```
# <Persona-Name> · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe
(3 bis 5 Sätze: Rolle, Kontext, typischer Anwendungsfall, Erwartung)

## 2 · Aufgaben und Verlauf
| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
(gelungen / teilweise / gescheitert / nicht prüfbar)

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)
Je Punkt: Was, Warum (aus meiner Arbeit heraus), Wie es aussehen könnte,
Aufwand (klein / mittel / groß, deine Schätzung), Bezug zur Zusammenführung
(hilft Power BI / hilft Rayfin / beiden / keinem).

## 4 · Wo das Erlebnis besser sein kann
(Reibungspunkte mit Beleg; je Punkt ein konkreter Vorschlag)

## 5 · Zusammenführung mit Fabric Apps / Rayfin
(Was die Spec oder das Tool braucht, damit daraus eine App wird; was heute
Power-BI-spezifisch ist und abstrahiert werden müsste; was nicht verloren
gehen darf)

## 6 · Neue Fehler (nicht im Review vom 25.09.)
| ID | Beschreibung | Schwere | Repro | Beleg |
(oder: keine)

## 7 · Was gut ist
(kurz, ehrlich, nicht höflich)

## 8 · Noten
Bedienbarkeit: x/10 · Nutzen für meine Rolle: x/10 · Reife für Kunden: x/10
Ein Satz, ob ich es morgen einsetzen würde und unter welcher Bedingung.
```

Melde am Ende als Ergebnis an den Auftraggeber nur: Pfad deines Berichts,
Noten, deine drei wichtigsten Punkte in je einem Satz.
