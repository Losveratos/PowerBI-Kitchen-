---
name: dwg
description: >
  Verweis auf die dwg cli (Arbeitsname): ChartKitchen und P&L byDatenWG mit Original-Code in Fabric Apps, eine
  App-Spec für Fabric App und Power-BI-Bericht (PBIP). Code und vollständige Anleitung liegen im Repo
  Fabric-Apps-Demo. Auslösen, wenn der Nutzer hier sinngemäß „dwg“, „App-Spec“, „ChartKitchen in der Fabric App“,
  „Adapter für ChartKitchen/P&L“ oder „neues Visual-Release in die Fabric Apps bringen“ sagt.
---

# dwg · Verweis

Die dwg cli liegt im Repo **Fabric-Apps-Demo** (GitHub `Losveratos/Fabric-Apps-Demo`) unter `dwg/`. Dort gibt es den
vollständigen Skill `dwg` (`.claude/skills/dwg/SKILL.md`), die Übergabe `memory/09-dwg.md` und `dwg/README.md`.
Arbeite für dwg in jenem Repo; wenn es nicht geöffnet ist, den Nutzer bitten, es zu öffnen oder zu klonen.

Was dieses Repo dazu beiträgt:
- Visual-Quellcode, den `node dwg/dwg.mjs visuals build` bündelt: `ibcsInspiredChartDeck/` (ChartKitchen) und
  `pnlByDatenWG/` (P&L). Pfad über `DWG_KITCHEN` oder einen Klon neben Fabric-Apps-Demo.
- Release-Builds für Power-BI-Berichte (`dwg pbip register`): `ibcsInspiredChartDeck/dist/*.pbiviz`,
  `pnlByDatenWG/dist/*.pbiviz`.
- Plan und Begründung: `sessions/plan-kitchen-fabric-apps.md`.

Wer am Visual-Code etwas ändert, das die Apps betrifft: danach in Fabric-Apps-Demo `dwg visuals build`, die Seiten mit
`dwg app page` neu erzeugen und `cd dwg && npm test` laufen lassen (Adapter-, App- und PBIR-Tests).
