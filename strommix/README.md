# Strommix-Projekt · Was braucht ein gesunder Strommix — und was kostet er?

Interaktives Online-White-Paper (HTML mit Simulations-Elementen) zur Frage:
**Welchen Strommix braucht Deutschland für ein klimaneutrales, bezahlbares und
versorgungssicheres Stromsystem — was kostet er, wo stehen wir, was sind die Risiken?**

## Prämissen (fix)

1. **Der Klimawandel ist real und menschengemacht; CO₂ ist der entscheidende
   Treiber.** Das wird als gegeben angesehen und mit Quellen belegt
   (IPCC AR6), aber nicht neu verhandelt.
2. **Neutralität & Wissenschaftlichkeit:** Jede Zahl mit Quelle (URL, Datum,
   Zugriffsdatum). Unsicherheiten und Lücken werden offen ausgewiesen —
   Bandbreiten statt Punktwerte, wo die Datenlage das erfordert.
3. **CO₂-Bepreisung** ist eine explizite Variable im Modell, kein Dogma.
4. Keine Technologie wird vorab aus- oder eingeschlossen; bewertet wird nach
   Kosten, Systembeitrag und Risiken auf Basis realer Marktdaten.

## Zielergebnis

Eine HTML-Seite (Kitchen-Design, GitHub Pages) mit:

- **Teil A · Wo stehen wir:** Ist-Strommix DE (Erzeugung, Kapazitäten, Bedarfspfade)
- **Teil B · Kostenmodell:** LCOE-Rechner pro Technologie (CAPEX/WACC/Volllaststunden-Slider)
  und ein System-Mix-Modell (Nutzer mischt Anteile → Systemkosten inkl.
  Backup/Speicher/Netz, CO₂-Preis als Variable)
- **Teil C · Dispatch-Simulation:** stündliche Simulation mit echten
  Last- und Erzeugungsprofilen (SMARD 2024) — Dunkelflauten, Speicherbedarf,
  Residuallast sichtbar machen
- **Teil D · Risiken & Unsicherheiten:** Dunkelflaute, Netzausbau, Lieferketten,
  Endlagerung/Ewigkeitskosten, Kostenüberschreitungen — inkl. Limitationen des
  eigenen Modells

Die Fallstudie „GES-Studie Faktencheck" (`docs/01_grundlage_ges_faktencheck.md`)
fließt als eine Quelle unter vielen ein.

## Ordnerstruktur

```
strommix/
├── README.md            ← diese Datei, inkl. Prozess-Log unten
├── docs/                ← Grundlagen-Dokumente, Konzepte, Texte
├── research/            ← Recherche-Ergebnisse der Agenten (je Thema eine Datei)
├── data/                ← Rohdaten + aufbereitete JSON für die Simulation
└── scripts/             ← Python-Skripte: fetch / compute / build (reproduzierbar)
```

**Regel:** Keine Zahl landet im HTML, die nicht aus `data/` kommt und dort per
Skript aus dokumentierten Quellen erzeugt wurde.

## Prozess-Log

| Datum | Phase | Was |
|---|---|---|
| 2026-08-15 | 0 · Setup | Ordnerstruktur, Prämissen, Grundlagen-MD (LinkedIn-Faktencheck GES-Studie) eingecheckt |
| 2026-08-15 | 1 · Recherche | Parallele Recherche gestartet: Kosten EE+Speicher, Kernkraft-Referenzen, Ist-Zustand DE, stündliche SMARD-Daten, Risiken & CO₂-Preis |

## Offene Punkte

- [ ] EN-Version nach Fertigstellung der DE-Version (auf Anfrage — Erinnerung an Michael)
- [ ] Verlinkung von `index.html` auf das fertige White Paper
- [ ] Disclaimer (keine Anlage-/Rechtsberatung, eigene Berechnungen, keine Gewähr)
