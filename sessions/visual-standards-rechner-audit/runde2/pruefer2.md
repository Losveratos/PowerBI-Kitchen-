# Gegenprüfung: prodGain (Produktivitätsgewinn je Jahr) — Fund von 'zeit'

## Status im Rechner (heute)
- `wageInfl` (Z. 538) verteuert `rateInt`/`rate` über den Horizont multiplikativ via `wageF` (Z. 698, 774).
- `learn` (Z. 576) ist eine Lernkurve nach Wright — Stundenreduktion je **Verdopplung der gebauten Charts pro Ersteller**, kein Kalenderzeit-Effekt. `learnF` (Z. 693) hängt von `chartsPerCreator`, nicht von Jahr `y` ab.
- Es existiert **keine** Annahme, die Werkzeug-/KI-Reife über Kalenderjahre gegen die Lohninflation aufrechnet. Bestätigt: Lohn steigt Jahr für Jahr, Produktivität pro Stunde bleibt in der Simulation konstant (0 %/Jahr implizit). Der Befund trifft eine reale Asymmetrie im Modell, keine Umformulierung von `learn`.

## Prüfung der Evidenz
- **METR RCT (Juli 2025, 16 erfahrene OSS-Devs, 246 Tasks):** real, gut repliziert zitiertes Ergebnis — gemessen **−19 %** (langsamer) trotz **+20 %** gefühlter Beschleunigung. Das ist der stärkste vorhandene Beleg und er zeigt das **Gegenteil** eines positiven prodGain, jedenfalls für AI-Coding-Agenten an bestehenden, ihnen vertrauten Codebasen — das ist inhaltlich näher an "Wartung/Fixes/Events" (bestehende Reports pflegen) als an "erstmaligen Aufbau".
- **METR Update 02/2026 ("small ~4–20 % productivity benefits", spätere Agentenmodelle):** als Snippet zitiert, nicht direkt geprüft (metr.org blockiert laut Finder) — plausibel als Verlaufskurve (Werkzeuge werden besser), aber die Spanne ist selbst breit und mit Selektionsvorbehalt versehen.
- **METR Survey 05/2026 (Selbstauskunft 1,4–2×):** von METR selbst laut Finder als zweifelhaft eingestuft — Selbstauskünfte zu Produktivität sind nach der RCT-Erkenntnis (Menschen überschätzen sich um ~40 Prozentpunkte) nicht als Punktschätzung verwendbar.
- **Peng et al. 2023 (+55,8 %):** Greenfield-Task, Einzelstudie, nicht auf Wartungs-/Governance-Arbeit übertragbar — die Studie sitzt am optimistischen Rand und passt eher zu `firstH`/Aufbau als zu `maint`/`events`.
- **VegaChat-Halluzinationen, Copilot-DAX-Pass-Rate 62,5 % (Einzelblog):** stützen die qualitative Reihung paid < oss < deneb ≈ core beim *Artefakt-Vorteil* (Text vs. Klick-Konfiguration), sagen aber nichts über die Größenordnung des Jahres-Prozentsatzes.
- Insgesamt: Die Evidenzlage ist **gemischt bis leicht negativ** für den unmittelbaren Ist-Zustand (2025), mit einer plausiblen, aber unsicheren Aufwärtstendenz für spätere Agentengenerationen. Das rechtfertigt einen Faktor ungleich Null als Idee, aber **nicht** die vorgeschlagenen Modalwerte von 3–4 %/Jahr (und schon gar nicht das Maximum 10 %) als „wahrscheinlich“.

## Einwände gegen den Vorschlag wie gestellt
1. **Vorzeichen fehlt.** Die einzige echte RCT-Messung ist negativ. Ein Intervall mit Minimum 0 blendet das relevanteste Einzelergebnis aus, obwohl es genau die Tätigkeit (Wartung an bestehendem Code/Charts) trifft, auf die der Vorschlag `prodGain` anwenden will (`maint`, `events`, `fixH`-Kontext via `trainRun`). Minimum sollte negativ sein.
2. **Baseline-Kontamination möglich.** Die `firstH`/`reuseH`/`trainH`-Panelwerte stammen bereits aus einem "20 simulierte Profile (Sonnet)"-Expertenpanel Stand 09/2026 — d. h. der Ist-Stand ist schon (mutmaßlich KI-gestützt geschätzt). Ein zusätzlicher `prodGain` ab Jahr 0 doppelt zählt das nur, wenn er missverständlich als "wie viel schneller als heute" statt "wie viel schneller als beim Rollout-Start" gelesen wird — im Vorschlag ist die Formel (`y=0..H-1`, Jahr 0 mit Gewicht 1) aber korrekt gegen Doppelzählung abgesichert, das ist in Ordnung.
3. **Größenordnung zu hoch.** 4 %/Jahr modal für Deneb/Core über 5–10 Jahre ist optimistisch gegenüber der einzigen kontrollierten Messung (negativ) und selbst gegenüber der vorsichtigeren METR-Folgestudie (4–20 % über die gesamte beobachtete Verbesserung der Agentengeneration, nicht pro Jahr).
4. **Kein Fund-Duplikat**, aber die Wirkung ist im Kern richtig beschrieben (multiplikativ, getrennt von `learnF`, ausgenommen Jahr-0-Posten und Lizenz) — das Rechenkern-Design ist plausibel und technisch sauber vorgeschlagen.

## Urteil
Nicht widerlegt im Kern (echte Modell-Lücke, Formel-Vorschlag korrekt), aber der Wert ist zu hoch und ohne Downside kalibriert. Empfehlung: `prodGain` aufnehmen, Badge **E** (nicht S — die Evidenz ist widersprüchlich, kein sauberer Beleg für einen positiven Erwartungswert), mit **negativer Untergrenze** und deutlich gedämpftem Modalwert:

- `paid`: [-1, 0, 2]
- `oss`: [-1, 0.5, 3]
- `deneb`: [-2, 1.5, 6]
- `core`: [-2, 1.5, 6]

Begründung der Anpassung: Minimum negativ, weil die einzige kontrollierte Messung (METR RCT) für werkzeugnahe/Wartungs-Aufgaben eine Verlangsamung zeigt. Modalwert deutlich unter dem Vorschlag (1,5 % statt 4 % für Deneb/Core), weil die optimistischeren Zahlen (Peng, Selbstauskunft-Survey) entweder für andere Aufgabentypen (Greenfield) gelten oder methodisch selbst als unsicher gekennzeichnet sind. Maximum bei 6 % statt 10 %, um die Spannweite nicht implausibel breiter zu machen als bei `learn` (8–25 %) oder `wageInfl` (2–4,5 %). Struktur, Formel und Ausschlüsse (Jahr-0, Lizenz) des Vorschlags bleiben unverändert korrekt.
