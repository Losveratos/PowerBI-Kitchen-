# Beispielprojekt MockupLive-Sample

Kleines Power-BI-Projekt (PBIP mit PBIR-Bericht und TMDL-Modell) für die erste Live-Sitzung mit MockupKitchen. Anleitung: [BETA.md](../../BETA.md).

**Vor dem Öffnen kopieren.** Nie hier im Repo-Ordner arbeiten, der Live-Helfer legt im Projekt den Ordner `mockup\` mit Sicherungen und Screenshots an.

```powershell
# im Repo-Ordner
robocopy mockup-live\sample\MockupLive-Sample "$env:USERPROFILE\Desktop\MockupLive-Sample" /E
mockup-live\bin\mk-live.cmd doctor "$env:USERPROFILE\Desktop\MockupLive-Sample"
mockup-live\bin\mk-live.cmd start  "$env:USERPROFILE\Desktop\MockupLive-Sample"
```

Nach `mockup-live\bin\mk-live.cmd setup` reicht `mk-live doctor …` bzw. `mk-live start …`.

## Inhalt
- `PBI-IBCS-Testbed.pbip` · zum Öffnen in Power BI Desktop
- `PBI-IBCS-Testbed.Report` · eine leere Seite „IBCS Testbed", 1920 × 1080
- `PBI-IBCS-Testbed.SemanticModel` · Sternschema, `compatibilityLevel` 1600
  - Dimensionen `DimDate` (täglich 2024 bis 2025, `MonthName` sortiert nach `MonthNo`), `DimProduct`, `DimRegion`
  - Fakten `FactActuals`, `FactPlan`, `FactBudget`, `FactForecast`, `FactDaily`
  - Kennzahlen in `_Measures`: `AC`, `PY`, `PL`, `BU`, `FC`, `FC_FY`, `ΔPY`, `ΔPY%`, `ΔPL`, `ΔPL%`, `ΔBU`, `ΔBU%`, `Umsatz`, `Kosten`, `Marge`, `Marge%`, `Orders_AC`, `Orders_PY`, `Revenue_AC`, `Revenue_PY`

## Daten
Alle Daten stecken als Tabellen direkt in den Power-Query-Abfragen. Es gibt keine Datenquelle, keine Anmeldung und keinen Datenordner. Der Daten-Cache (`.pbi\cache.abf`) fehlt bewusst: Zeigen die Visuals nach dem ersten Öffnen nichts, einmal **Start → Aktualisieren**.

Herkunft: Kopie des Testbeds `PBI-IBCS-Testbed` (Stand 02.10.2026) ohne `.pbi`-Ordner, ohne CSV-Kopien der Daten und ohne die Handanleitung zum Einfügen.

## Geprüft
- `pbir validate "PBI-IBCS-Testbed.Report" --all` (pbir 0.9.32, Kopie im Scratch-Ordner, 02.10.2026): gültig, 1 Seite, 0 Visuals, Modell geladen, 1 Hinweis.
- Keine Pfade mit Benutzernamen, keine Kundendaten.
- Öffnen in Power BI Desktop mit dieser Fassung: noch nicht geprüft (die Vorlage lief als Testkopie mit `compatibilityLevel` 1600).
