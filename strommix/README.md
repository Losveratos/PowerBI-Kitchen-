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
| 2026-08-15 | 2 · Parameter-Konsolidierung | `scripts/consolidate_params.py` liest die ```json-Blöcke aus allen Dossiers und schreibt `data/model_params.json` (11 Technologien, jeder Parameter mit value/min/mid/max, unit, source, confidence A/B/C). Umgesetzte Modellentscheidungen: Kernkraft-Opex **absolut** in €/kW/a (130/165/200) statt %-CAPEX, Brennstoff und Entsorgung getrennt, WACC global 3/5/9 % plus IDC-Aufschlag über die Bauzeit, CO₂-Preis nur auf fossile Direktemissionen, Backup/Speicher **nicht** als pauschaler Risikoaufschlag (Doppelzählung), drei **konsistente** Szenariensätze statt mechanischer min/max-Kombinationen. 6 Lücken explizit in `gaps` (u. a. kein Erdgas-Brennstoffpreis, kein direkter Emissionsfaktor, Bauzeiten außerhalb Kernkraft unbelegt). |
| 2026-08-15 | 3 · Modell + Validierung | `scripts/model.py` (LCOE / Mix-Modell / stündlicher Dispatch mit Merit-Order laut `docs/02_modellkonzept.md`) und `scripts/validate_model.py` → `research/validierung_modell.md`. Ergebnis: GES-LCOE auf ±0,04 % reproduziert, Ist-2024-Profilsummen auf ±0,06 %, GES-Szenarien −7 / −35 / −4 / −6 % gegenüber 125/197/212/321 €/MWh. Dispatch läuft auf dem PARTIAL-Profil (Jul–Dez 2024, Ergebnisse als „H2-2024-basiert“ gekennzeichnet); Wind offshore nutzt als markierte Übergangslösung die Onshore-Profilform. Volljahres-Profil funktioniert ohne Codeänderung (getestet). |

| 2026-08-15 | 4 · White Paper (Entwurf v0.9) | **`/whitepaper-strommix.html` + `/whitepaper-strommix.js`** im Repo-Root gebaut (Kitchen-Design, Fraunces/Geist/JetBrains Mono, `--bg #FAFAF7` / `--ink #0F1E2E` / `--accent #C25A2D`, Vanilla JS, keine externen Libs außer den Google-Fonts, alle Charts als eigene Inline-SVG-Renderer). Aufbau: Hero + Prämissen- und Transparenz-Kasten → Teil A (Ist-Mix 2025, Zielerreichung PV 54 % / Wind on 59 % / Wind off 36 %, Bedarfsspannen) → Teil B (interaktiver LCOE-Rechner: CAPEX-Slider mit Presets und 13 Kernkraft-Referenzprojekten mit Landes-Label, globaler WACC-Slider 3–9 %, CO₂-Preis 0–400 €/t inkl. UBA-Schattenpreis-Umschalter, Volllaststunden, IDC-Toggle, Vergleichslinien ISE/Lazard/FÖS/BNetzA/Hinkley-CfD/GES) → Teil C (Mix-Simulator mit 5 Presets, stündlicher Dispatch-Chart je Woche inkl. Speicherfüllstand und ungedeckter Last, 9 Jahresbilanz-Kacheln, gestapeltes System-LSCOE, H2-Kavernen-Warnbox ab 30 TWh) → Teil D (Dunkelflaute-Definitionen, Kostenüberschreitungs-Empirie, Lieferketten, Endlager/KENFO beidseitig) → Limitationen → GES-Fallstudie (beide Verzerrungsrichtungen **und** die zwei Pro-GES-Befunde) → 6 Kernaussagen → 37 nummerierte Quellen mit Quellen-Chips/Popover an jeder Zahl. |
| 2026-08-15 | 4 · Modell-Port + Selbsttest | `lcoe()`, `dispatch()`, `mix_system()` (inkl. `crf`, `idc_surcharge`, `resolve_tech`, `load_profiles`) 1:1 nach JS portiert. Einzige dokumentierte Abweichung: der `return_hourly`-Zweig protokolliert zusätzlich die Erzeugungskomponenten je Stunde (rein additiv, ohne Einfluss auf Bilanzen). Neu: `scripts/export_test_vectors.py` → `data/test_vectors.json` (**23 Vektoren**: 5 CRF, 5 IDC, 11 LCOE über 7 Technologien × Szenarien × WACC 3/5/9 % × CO₂ 0/75/200/400 €/t × IDC an/aus, 2 vollständige Mix-Läufe mit Dispatch). Die Seite rechnet die Vektoren beim Laden nach (Toleranz 0,5 %), loggt in die Konsole und zeigt im Footer das Badge „Modell verifiziert ✓“. **Ergebnis: 23/23 bestanden.** |
| 2026-08-15 | 4 · Datenfluss | Neu: `scripts/build_page_data.py` → `data/page_data.json` (redaktionelle Zahlen: Ist-Mix, Zielpfade, Bedarfsspannen, LCOE-Vergleichsbänder Dritter, Kernkraft-Referenzprojekte, Dunkelflaute, Lieferketten, Endlager/KENFO, GES-Bias-Check, Quellenverzeichnis mit Zugriffsdatum und Konfidenzstufe). Damit steht **keine** inhaltliche Zahl im HTML/JS — die Seite lädt `model_params.json`, `profiles_2024.json`, `page_data.json` und `test_vectors.json` per `fetch` und zeigt bei `file://`-Aufruf eine explizite Anleitung (`python3 -m http.server`). Das Hochrechnungs-Label wird aus `meta.data_completeness` gelesen und verschwindet beim Volljahres-Update automatisch. |
| 2026-08-15 | 4 · Verifikation | Lokaler Server (`python3 -m http.server 8123`): HTML, JS und alle vier JSON-Dateien liefern 200. Render-Test mit Chromium/Playwright: **keine Konsolenfehler und keine Page-Errors**, auch nicht beim Durchklicken aller 5 Mix-Presets, aller 7 Technologien und der Slider-Extremwerte (Bedarf 500/1300 TWh, Anteile 0 %/100 %, Speicher 0, WACC 3/9 %, CO₂ 0/400, Gas-Backup fix/automatisch). Kein horizontaler Überlauf auf 1280 px und 390 px. Screenshots im Scratchpad. Farbpalette der Serien mit dem `dataviz`-Validator geprüft (adjazente CVD-ΔE 9,1 / Normalsicht 22,9 — alle harten Gates bestanden). |

## Offene Punkte

- [ ] **Volljahresprofil nachziehen** — stärkster inhaltlicher Hebel. Solange `profiles_2024.json` `PARTIAL` ist, hängt insbesondere der H₂-Saisonspeicher am gesetzten Startfüllstand (beide Varianten sind falsch, die Wahrheit liegt dazwischen). Der Code läuft ohne Änderung auf einem Volljahr; die Hochrechnungs-Labels verschwinden dann automatisch.
- [ ] **Volltext-Verifikation der Primärquellen** (WebFetch war blockiert) — Checklisten stehen in jedem Dossier; Konfidenzstufen B/C zuerst.
- [ ] Erdgas-Brennstoffpreis und direkter Emissionsfaktor ergänzen (`gaps.gaspreis_erdgas`, `gaps.emissionsfaktor_direkt`) — solange sie fehlen, ist jedes Szenario mit Gas-Backup eine ausgewiesene **Untergrenze**.
- [ ] Offshore-Stundenprofil ergänzen (aktuell Onshore-Profilform als markierte Übergangslösung)
- [ ] EN-Version nach Fertigstellung der DE-Version (auf Anfrage — Erinnerung an Michael)
- [ ] Verlinkung von `index.html` auf das fertige White Paper
- [x] Disclaimer (keine Anlage-/Rechtsberatung, eigene Berechnungen, keine Gewähr) — im Footer von `whitepaper-strommix.html`
