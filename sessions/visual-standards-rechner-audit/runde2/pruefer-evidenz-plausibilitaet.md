# Prüfung (Evidenz & Plausibilität) — Fund "zeit": Rollout ohne Lohnsteigerung

## Fund
Finder 'zeit' (Bereich model): `rollout` in `calc()` und `build` in `calcSQ()` werden vollständig zum Jahr-0-Satz (`rate0` bzw. `rateInt0`) bewertet, obwohl `reportsTotal` einen über den Horizont H wachsenden Nachfrage-Anteil enthält (`(demand1000·vAvg/1000 + demandCreator·creators)·H`). Andere laufende Posten (`maint`, `events`, `gov`-Laufteil, `supUsers`, `trainRun`) nutzen konsequent `rate`/`rateInt` (= `rate0·wageF`).

## Prüfung der Evidenz
Code direkt gelesen, `visual-standards-rechner.html`:

- Zeile 714: `const reportsTotal=S.reports+(g('demand1000')*(vAvg/1000)+g('demandCreator')*S.creators)*H;`
- Zeile 716: `const rollout=reportsTotal*S.cpr*p('reuseH')*compMult*libF*learnRoll*M.reuseF*rate0;` → **rate0**, kein `wageF`.
- Zeile 776 (calcSQ): `const build=reportsTotal*S.cpr*g('sqChartH')*rateInt0;` → ebenfalls **rateInt0**.
- Gegenprobe, dass andere Posten `wageF` tragen: Zeile 699 (`rateInt=rateInt0*wageF, rate=rate0*wageF`), Zeile 729 (`maint=...*wageF`), Zeile 730 (`events=...*rate*H`), Zeile 732 (`supUsers=...*rateInt*H`), Zeile 722 (`trainRun=...*rateInt*...`).

Die Evidenz ist exakt wie vom Finder zitiert und trägt die Aussage vollständig. Kein Interpretationsspielraum — `rollout`/`build` sind die einzigen mengenmäßig H-abhängigen Kostenblöcke, die trotzdem am Jahr-0-Satz hängen.

## Plausibilität der Werte
Nachvollgerechnet mit Preset "Mittelstand" (S.reports=12, creators=3, viewers=40) und Mittelwerten `demand1000=2`, `demandCreator=0.5`, `wageInfl=3%`:

- H=5: `reportsTotal = 12 + (2·0,04 + 0,5·3)·5 = 12 + 7,9 = 19,9`. Nachfrage-Anteil = 7,9/19,9 ≈ **39,7 %** (Finder: ~40 %, stimmt).
  `wageF = Σ_{y=0}^{4} 1,03^y / 5 ≈ 1,0618` (Finder: 1,06 — stimmt, leicht gerundet).
  Effekt auf Rollout ≈ 0,397 · (1,0618−1) ≈ **+2,45 %** (Finder: +2,4 % — stimmt).

- H=10: `reportsTotal = 12 + (2·0,04 + 0,5·3)·10 = 12 + 15,8 = 27,8`. Anteil = 15,8/27,8 ≈ **56,8 %** (Finder: ~57 %, stimmt).
  `wageF = Σ_{y=0}^{9} 1,03^y / 10 ≈ 1,1464` (Finder: 1,14 — im Rahmen der Rundung ok, minimal konservativ).
  Effekt ≈ 0,568 · (0,1464) ≈ **+8,3 %** (Finder: +8 % — trifft, geringfügig konservativ).

Beide Nachrechnungen bestätigen die Größenordnung des Finders auf ±0,3 Prozentpunkte. Keine Fantasiezahlen, keine falsche Präzision — die Beträge sind explizit als Ableitung aus den bereits im Modell vorhandenen Default-Werten gekennzeichnet, nicht als externe Quelle behauptet (korrekt: "keine" Evidenz nötig).

## Einordnung: Fund oder bloße Umformulierung?
Echter Fund, kein Duplikat: Es handelt sich um eine tatsächliche Inkonsistenz in der Zeit-Dimension zwischen strukturell gleich behandelten Kostenblöcken (`reportsTotal` ist H-abhängig und wächst über den Horizont, wird aber am Anfangssatz bepreist, während alle anderen H-abhängigen laufenden Posten wageF tragen). Das ist ein Formelfehler im Kern, keine Meinungsfrage.

## Kritikpunkt am Vorschlag
Der Verweis auf `prodF aus Z1` ist spekulativ — im aktuellen Code existiert kein `prodF`/Produktivitätsfaktor (grep bestätigt: kein Treffer). Der Finder markiert das selbst als bedingt ("Ohne Z1 … mit Z1 …"), das ist sauber gekennzeichnet und keine Erfindung einer Codestelle, sondern ein Verweis auf einen möglichen anderen Fund. Die Kernformel-Korrektur ist davon unabhängig umsetzbar.

Kleinere Präzisierung: Die Formel `[S.reports·rate0 + demandReports·H·rate·prodF]` sollte, um korrekt zu bleiben, `demandReports` als reine Pro-Jahr-Rate definieren (`demand1000·vAvg/1000 + demandCreator·creators`), nicht mit `H` vormultipliziert — sonst quadriert sich H. Das ist im Vorschlag implizit richtig gemeint, aber die Notation ist leicht missverständlich; sollte im Umsetzungsschritt klargestellt werden.

## Urteil
**Nicht widerlegt.** Fund bestätigt sich vollständig am Code, die Größenordnung (2–8 % Rollout-Verteuerung je nach Horizont) ist mit den bestehenden Default-Annahmen konsistent nachgerechnet. Einzige Anpassung: `prodF`-Bezug als optional/nachrangig kennzeichnen (hängt von separatem Fund "Z1" ab, nicht im aktuellen Code vorhanden) und die Formel-Notation für `demandReports` (Pro-Jahr-Größe, nicht H-multipliziert) präzisieren.

**Konfidenz:** hoch (Code-Evidenz eindeutig, Nachrechnung bestätigt Größenordnung).
**Wirkung:** mittel — betrifft Rollout-Komponente (typischerweise einer der größeren Kostenblöcke bei OSS/Deneb/Core mit vielen Reports), Effekt 2–8 % je nach Horizont, real aber nicht dominant für Gesamt-TCO.
