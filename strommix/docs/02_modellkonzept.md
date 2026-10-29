# Modellkonzept · Kosten- und Dispatch-Modell

> Status: Entwurf, festgeschrieben **vor** Eintreffen der Recherche-Ergebnisse,
> damit die Methodik nicht nachträglich an gewünschte Ergebnisse angepasst wird.
> Änderungen an diesem Konzept werden im Prozess-Log begründet.

## Grundidee: drei Ebenen, aufeinander aufbauend

| Ebene | Frage | Methode |
|---|---|---|
| **1 · LCOE** | Was kostet eine MWh aus Technologie X? | Annuitätenmethode (wie GES-Studie, dadurch direkt vergleichbar) |
| **2 · Mix-Modell** | Was kostet ein gewählter Strommix als System? | Jahresbilanz + Zuschläge für Backup, Speicher, Netz |
| **3 · Dispatch** | Geht der Mix physikalisch auf — Stunde für Stunde? | Stündliche Simulation mit realen 2024er-Profilen (SMARD) |

Ebene 3 liefert die Backup-/Speicherbedarfe, die in Ebene 2 als Kosten
eingehen — das ist der Kern-Unterschied zu reinen LCOE-Vergleichen, und genau
der Punkt, an dem Studien (wie die GES-Studie) über ihre Annahmen streiten.

## Ebene 1 · LCOE (Annuitätenmethode)

```
CRF  = r·(1+r)^n / ((1+r)^n − 1)          r = WACC (Slider, Default 5 %), n = Lebensdauer
LCOE = (CAPEX·CRF + CAPEX·opex%) / (VLS/1000) + Brennstoff + CO₂-Preis·Emissionsfaktor
```

- Alle Parameter pro Technologie als **Bandbreite** (min/mid/max) aus `research/`
- CO₂-Kosten: `co2_preis [€/t] × emissionsfaktor [t/MWh]` — direkter Slider-Effekt
  auf fossile Erzeuger; Lebenszyklus-Emissionen werden separat ausgewiesen
  (informativ), nicht eingepreist
- WACC als eigener Slider, weil kapitalintensive Technologien (Kernkraft, Offshore)
  extrem WACC-sensitiv sind — das ist selbst ein zentraler Befund

## Ebene 2 · Mix-Modell (Systemkosten)

Nutzer wählt: Jahresbedarf (TWh, Slider z. B. 550–1000) und Erzeugungsanteile
(PV, Wind on/offshore, Kernkraft, Gas/H2-Backup, Sonstige). Das Modell rechnet:

1. Benötigte installierte Leistung je Technologie aus Anteil × Bedarf / Volllaststunden
2. Erzeugungskosten = Σ (Energie × LCOE)
3. **Systemzuschläge** (aus Ebene 3 abgeleitet, als Funktion des fEE-Anteils bzw. der Residuallast):
   - Backup-Kapazität (€/kW·a für vorzuhaltende gesicherte Leistung)
   - Kurzzeitspeicher (Batterie) und Langzeitspeicher (H2-Kette) für saisonalen Ausgleich
   - Netzausbau-Zuschlag (top-down aus NEP-Investitionsvolumina, wie GES linear skaliert — Limitation wird ausgewiesen)
   - Abregelungs-/Überschussverluste (aus Dispatch: nicht nutzbare EE-Energie)
4. Ergebnis: **System-LSCOE €/MWh** + Aufschlüsselung als gestapelte Balken,
   mit Unsicherheitsband (min/max-Parametersätze)

## Ebene 3 · Stündlicher Dispatch (Browser, vorberechnete Profile)

Daten: normierte Stundenprofile 2024 (`data/profiles_2024.json`): Last, PV,
Wind onshore, Wind offshore (+ ggf. Wasser/Biomasse als Band).

Algorithmus pro Stunde (einfache Merit-Order, deterministisch, im Browser in <100 ms für 8784 h):

```
1. fEE-Erzeugung = Kapazität × Profil          (PV, Wind on/off)
2. Must-run/Band  = Kernkraft × Verfügbarkeit, Wasser, Biomasse
3. Residuallast   = Last − fEE − Band
4. Residuallast < 0 → Überschuss: erst Batterie laden, dann Elektrolyse (H2-Speicher), Rest = Abregelung
5. Residuallast > 0 → erst Batterie entladen, dann H2-Rückverstromung, dann Gas-Backup
6. Bleibt Lücke → "ungedeckte Last" (wird rot ausgewiesen, kein Blackout-Alarmismus: Einordnung Importe/DSM als nicht modellierte Puffer)
```

Outputs: Dunkelflauten-Zeitraum-Ansicht (z. B. Dezember-Woche), Speicherfüllstände,
Abregelung TWh, Backup-Volllaststunden (→ deren realer LCOE!), CO₂-Emissionen des Mixes,
Deckungsgrad.

## Bewusste Vereinfachungen (Limitationen, werden im Paper offen gelistet)

- Ein Wetterjahr (2024) — kein Extremjahr-Ensemble; Sensitivität ggf. mit skaliertem Profil
- Kein Import/Export-Handel, kein Demand Side Management (konservativ: macht das System eher teurer als billiger → fair gegenüber allen Szenarien, wird ausgewiesen)
- Keine räumliche Netzsimulation (Netz nur als Kostenzuschlag)
- Batterie-/H2-Dispatch greedy statt optimiert (perfekte Voraussicht wird NICHT unterstellt bei greedy — leichte Überschätzung des Speicherbedarfs, dokumentiert)
- Profile von 2024 auf Zieljahr skaliert: unterstellt gleiche Wetter-/Laststruktur

## Validierung

- Ebene 1 gegen publizierte LCOE (Fraunhofer ISE, Lazard) — Modell muss deren Werte mit deren Annahmen reproduzieren
- Ebene 3 gegen Ist-Jahr 2024: mit realen Kapazitäten 2024 muss das Modell die realen Jahressummen (±5 %) treffen
- GES-Szenarien als Testfall: mit GES-Annahmen sollte das Mix-Modell in die Größenordnung der GES-LSCOE kommen (Abweichungen werden diskutiert, nicht wegoptimiert)
