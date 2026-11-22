# Auftrag P3-A · Geprüften Parametersatz zusammenführen

**Modell:** Sonnet · **Ergebnis:** `energiewende/scripts/consolidate_params.py`,
`energiewende/data/model_params.json`, `energiewende/research/konsolidierung.md`
**Regeln:** `energiewende/agents/REGELN.md` (Abschnitte Haltung und Ergebnis;
du rufst nichts aus dem Netz ab)

## Ziel

Aus zehn Dossiers (Phase 1) und zehn Prüfberichten (Phase 2) entsteht **ein**
maschinenlesbarer, geprüfter Parametersatz. Die Dossiers bleiben als
historischer Stand unverändert; maßgeblich für Modell und Seiten ist danach
allein `data/model_params.json`.

## Eingaben

- `energiewende/research/00_…` bis `10_…`: je ein ```json-Block am Ende mit
  `parameters` und `sources`.
- `energiewende/research/pruefung/01_…` bis `10_…`: je ein ```json-Block
  `korrekturen` (Felder `id`, `alt`, `neu`, `fundstelle`, `confidence`,
  `primaer_gelesen`, `begruendung`) und eine Prüftabelle.
- `energiewende/README.md`, Tabelle „Entscheidungen“: Festlegungen von
  Michael, die über Dossier und Prüfbericht stehen.
- Vorbild für Aufbau und Stil: `strommix/scripts/consolidate_params.py` und
  `strommix/data/model_params.json`.

## Aufgaben

1. **Skript `consolidate_params.py`** (nur Standardbibliothek, deterministisch,
   kein Zeitstempel in der Ausgabe): liest alle JSON-Blöcke, wendet die
   Korrekturen an und schreibt `data/model_params.json`.
2. **Zuordnung der Korrekturen:** Eine Korrektur gehört zu einem Parameter,
   wenn ihre `id` einer Parameter-ID desselben Dossiers entspricht. Viele
   Korrekturen betreffen Kernaussagen oder Textstellen und haben keine
   Parameter-ID — die werden **nicht** geraten, sondern als
   `textkorrekturen` je Dossier in die Ausgabe übernommen. Lege für
   Zweifelsfälle eine kleine, von Hand geprüfte Zuordnungstabelle im Skript
   an und begründe jede Zeile im Bericht.
3. **Je Parameter in der Ausgabe:** `id` (mit Dossier-Präfix, z. B.
   `d05.…`, damit IDs eindeutig sind), `value` oder `min/mid/max`, `unit`,
   `source`, `fundstelle`, `confidence`, `primaer_gelesen`, `abgrenzung`
   bzw. `note`, dazu `pruefstatus`: `bestätigt` · `korrigiert` (mit
   `wert_vor_pruefung` und `begruendung`) · `nicht prüfbar` · `nicht in der
   Stichprobe`. Der Prüfstatus kommt aus der Prüftabelle und dem
   `korrekturen`-Block, nicht aus eigener Einschätzung.
4. **Konfidenz-Regel durchsetzen:** Stufe A nur bei mehreren unabhängigen
   Quellen **und** `primaer_gelesen: true`. Wo ein Prüfbericht eine
   Herabstufung vorschlägt, wird sie übernommen. Wo ein Parameter A trägt,
   aber nur eine Quelle nennt, wird er B — und im Bericht gelistet.
5. **Entscheidungen von Michael einarbeiten** als eigener Abschnitt
   `entscheidungen` in der Ausgabe und, wo sie einen Parameter betreffen,
   als Überschreibung mit `quelle: "Entscheidung Michael 22.11.2026"`:
   Gaspreis 20 / 35 / 85 €/MWh · Kernkraft-Neubau 7.500 / 12.000 / 17.500
   €/kW plus Szenario „R21 wie veröffentlicht“ 6.250 €/kW · Reaktivierung
   Mitte 2,7 GW, oben 12 GW (als „Radiant, nicht primär gelesen“ markiert) ·
   Wasserstoff-Lkw-Verhältnis: UBA-Wert als Mitte, bisherige Setzung als
   oberes Ende · E-Fuel-Menge: niedrigeren Ariadne-Wert aufnehmen ·
   Solarleistung einheitlich Modulleistung · führende Energiebilanz AG
   Energiebilanzen · Dunkelflauten-Definition Tagesmittel und Energielücke ·
   Stresstest China zweistufig.
6. **Widersprüche zwischen Dossiers finden:** Dieselbe Größe steht oft in
   mehreren Dossiers (BIP, Strombedarf 2045, Elektrolyse-Bestand,
   Netzkosten, Redispatch, CO₂-Preis, KfW-Zahlen, Batteriekosten).
   Liste jede Dopplung mit allen Werten; wähle **keinen** Sieger, außer ein
   Prüfbericht oder eine Entscheidung legt ihn fest — sonst als offener
   Punkt in den Bericht.
7. **Offene Lücken sammeln:** alle `gaps`/„Lücken“, die das Modell blockieren
   (fehlender Wert, nur Konfidenz C bei tragender Größe), als Liste `gaps`
   in der Ausgabe.
8. **Bericht `research/konsolidierung.md`:** Zahl der Parameter je Dossier
   und Prüfstatus; alle angewendeten Korrekturen als Tabelle (alt → neu);
   alle nicht zugeordneten Korrekturen; die Dopplungen; die Herabstufungen;
   die Lücken. Kein YAML-Frontmatter.
9. **Hinweiszeile in jedem Dossier:** Füge in den Dossiers 01 bis 10 direkt
   unter der Überschrift **eine** Zeile ein — und ändere sonst nichts:
   „> Stand Phase 1. Geprüft in `pruefung/<NN>_pruefung.md`; maßgeblich sind
   die korrigierten Werte in `data/model_params.json`.“

## Prüfung deiner eigenen Arbeit

- Zweimal laufen lassen: identische Ausgabe (Prüfsumme vergleichen).
- Jede Korrektur aus den zehn `korrekturen`-Blöcken taucht genau einmal auf:
  angewendet, als Textkorrektur oder als nicht zugeordnet. Die Summen im
  Bericht ausweisen.
- Kein Parameter verschwindet: Summe der Eingangs-Parameter gleich Summe der
  Ausgangs-Parameter.

Abschlussmeldung: Zahlen zu Parametern, Korrekturen (angewendet / Text /
nicht zugeordnet), Dopplungen mit Widerspruch, Lücken, und was eine
Entscheidung braucht.
