> Stand 01.10.2026. Plan für den Agent-Modus v2, mit Michael abgestimmt.

# Agent-Modus v2

## Ausgangslage (Test am 29.09.2026)
- Der Deploy läuft technisch durch, aber das Ergebnis in Desktop entspricht nicht dem, was im Kitchen zu sehen war. Michael: „eigentlich alles … das war nicht gut".
- Kitchen-Visuals (ChartKitchen u. a.) funktionierten nur, weil Michael vorher eine Instanz von Hand gesetzt hatte.
- `te` (Preview) ist am 30.09.2026 abgelaufen; die neue Preview läuft bis 31.10.2026, Download nur mit Konto (Michael lädt, der Agent installiert).

## Entscheidungen
- Der Deploy ist führend (Ungespeichertes in Desktop wird überschrieben).
- Der Runner darf Desktop schließen und wieder öffnen, um Kitchen-Visuals zu installieren (`report.json` ist bei offenem Desktop tabu).
- Die Übergabe muss insgesamt besser werden. Messlatte ist ein Bildvergleich Kitchen gegen Desktop je Kachel.
- Werkzeuge: Bericht nur über `pbir` (inkl. `pbir desktop reload/screenshot`), Modell nur über `te`.

## Arbeitspakete
- **0 · Bestandsaufnahme**
  - 0a Abgleichsliste Kitchen → Power BI (`FIDELITY.md`): jede Kacheleinstellung, jede Zone, Gestaltung; Ziel (ChartKitchen-Eigenschaft, `pbir`-Eigenschaft, Theme, Modell) und heutiger Stand.
  - 0b Audit des letzten Deploys (`AUDIT-DEPLOY4.md`): Kitchen-Bild gegen Desktop-Bild je Kachel, konkrete Abweichungen.
- **A · Kitchen-Visuals installieren:** `.pbiviz` aus dem Repo nach `CustomVisuals/<guid>/` und in `report.json` registrieren; einmaliger Schritt mit Desktop schließen, installieren, öffnen. Danach keine Referenz-Instanz mehr nötig.
- **B · Treue:** Lücken aus 0a/0b schließen, sichtbare zuerst; Bildvergleich nach jedem Deploy mit Befunden je Kachel im Status.
- **C · Modell über `te`:** neue Kennzahlen, Formatwünsche, Beschreibungen, DAX-Korrekturen (DAX nur nach OK), danach `pbir desktop reload --model`.
- **D · Playbook und Skill:** `PLAYBOOK.md` und Skill `mockup-live`, inklusive aller Stolpersteine.
- **E · Echter Durchlauf** an der Testkopie mit Treue-Messung.

## Reihenfolge
0a + 0b + Spike A parallel → A, B, C parallel (getrennte Dateien) → D → E.
