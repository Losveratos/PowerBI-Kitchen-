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
| 2026-08-15 | 1 · Recherche (Risiken & CO₂-Preis) | `research/risiken_co2.md` erstellt: IPCC-Klimaprämisse (4 zitierfähige Kernaussagen), LCA-CO₂-Intensitäten (UNECE 2022 + Fraunhofer-ISE-Korrektur für DE), CO₂-Preis (ETS 1 Historie, ETS 2 **auf 2028 verschoben**, UBA-Schattenpreise MK 3.2/4.0, Projektionen 2030), Dunkelflaute (Uniper 2026 / LBBW / BNetzA-Dez-2024-Analyse), Netz-/Systemkosten (Redispatch, Abregelung, negative Preise, NEP), Lieferketten (PV/Uran/Gas/Rohstoffe), Kernkraft-Restrisiken (Onkalo, KENFO, Haftung — beide Seiten), Kostenüberschreitungs-Empirie (Flyvbjerg + Sovacool 2025). Inkl. JSON-Block für das Simulationsmodell. **Einschränkung:** `WebFetch` war per Egress-Policy komplett blockiert (ipcc.ch, unece.org, umweltbundesamt.de u. a.) — alle Werte stammen aus Websuche-Ergebnissen und sind mit Verifikationsstufen A/B/C markiert; Stufe B/C vor Veröffentlichung am Primärdokument prüfen. 9 Datenlücken explizit benannt. |
| 2026-08-15 | 1 · Recherche (stündliche Daten) | `fetch_hourly_2024.py` / `build_profiles.py` gebaut. Alle 3 Primärquellen (Energy-Charts, SMARD, OPSD) aus dieser Sandbox per Egress-Policy blockiert (403, siehe `research/daten_stundenprofile.md`). Notlösung: realer GitHub-Mirror von SMARD-Exporten liefert Netzlast/PV/Wind-Onshore für Jul–Dez 2024 (50% des Jahres). Wind Offshore, Wasserkraft, Biomasse sowie Jan–Jun 2024 fehlen — `data/profiles_2024.json` ist als `PARTIAL` markiert, kein Platzhalter/Fake-Wert enthalten. Folgeaktion nötig: Netzwerk-Freigabe oder manueller CSV-Import. |

| 2026-08-15 | 1 · Recherche abgeschlossen | Alle 5 Recherche-Dossiers liegen in `research/` (EE+Speicher, Kernkraft, Ist-Zustand, Stundendaten, Risiken/CO₂). Gemeinsame Einschränkung: Primärquellen-Domains per Egress-Policy blockiert → Zahlen aus Suchindex-Mehrfachbelegen, je Wert Konfidenzstufe A/B/C; Volltext-Verifikation vor Publikation nötig (in jedem Dossier als Checkliste). |
| 2026-08-15 | 2/3 · Konsolidierung + Modell | Start: `data/model_params.json` aus den JSON-Blöcken der Dossiers, Python-Modell (LCOE/Mix/Dispatch) + Validierung nach `docs/02_modellkonzept.md` |

## Offene Punkte

- [ ] EN-Version nach Fertigstellung der DE-Version (auf Anfrage — Erinnerung an Michael)
- [ ] Verlinkung von `index.html` auf das fertige White Paper
- [ ] Disclaimer (keine Anlage-/Rechtsberatung, eigene Berechnungen, keine Gewähr)
