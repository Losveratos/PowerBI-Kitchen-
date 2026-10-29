# Gegenprüfung: "Rollout trägt keine Lohnsteigerung" — Fund von 'zeit' (Bereich: model)

## Ergebnis
**refuted = false.** Der Fund beschreibt den Ist-Zustand korrekt, die Zahlen sind mit
plausiblen Panel-Mittelwerten nachgerechnet und stimmen, und der Vorschlag ist mit
vorhandenen Eingaben umsetzbar, ohne einen bestehenden Ansatz zu bevorzugen.

## 1) Stimmt die Beschreibung von "Heute"?

Code (v0.10, `visual-standards-rechner.html`):

```
L714: const reportsTotal=S.reports+(g('demand1000')*(vAvg/1000)+g('demandCreator')*S.creators)*H;
L715: const chartsPerCreator=reportsTotal*S.cpr/Math.max(1,S.creators);const learnRoll=learnF(...);
L716: const rollout=reportsTotal*S.cpr*p('reuseH')*compMult*libF*learnRoll*M.reuseF*rate0;
```
vs. die "laufenden Posten":
```
L699: const rateInt=rateInt0*wageF, rate=rate0*wageF;
L722: trainRun = ... * rateInt * ...
L730: events   = ... * rate * H;
L732: supUsers = ... * rateInt * H * ...
L735: gov      = ... * rateInt * ...
```
Und in `calcSQ()`:
```
L775: reportsTotal=S.reports+(g('demand1000')*(vAvg/1000)+g('demandCreator')*S.creators)*H;
L776: build=reportsTotal*S.cpr*g('sqChartH')*rateInt0;   // rateInt0, nicht rateInt (=rateInt0*wageF)
```
→ Die Beschreibung ist exakt. `rollout` und `build` (Null-Option) bewerten die komplette,
über H Jahre entstehende Nachfrage (`reportsTotal` enthält den `*H`-Term) durchgehend zum
Jahr-0-Satz `rate0`/`rateInt0`, während alle anderen mehrjährigen Stundenposten mit
`rate`/`rateInt` (= Satz × `wageF`) rechnen. Das ist eine echte Inkonsistenz der
Zeitdimension, kein falsch zitierter Ist-Zustand.

## 2) Doppelzählung?

Geprüft: `maint` nutzt `maintBase = setup+dev+build+0.3*rollout` und multipliziert das
Ganze mit `wageF` (L727/729). Wird `rollout` künftig selbst teilweise mit `rate`
(= `rate0*wageF`) statt `rate0` bewertet, bekommt der `0.3*rollout`-Anteil in `maintBase`
eine zweite `wageF`-Schicht (Compounding statt reiner Neubewertung). Das ist real, aber
klein: 0,3 × (Nachfrage-Anteil 40–57 %) × (wageF−1 6–14 %) ≈ 0,1–2,4 % zusätzlich auf
`maintBase` – eine Nebenwirkung der *bestehenden* Konstruktion (Rollout-Proxy in
`maintBase`), nicht ein durch den Vorschlag neu eingeführter Doppel-Posten. Kein Grund für
`refuted=true`, aber erwähnenswert als Folgeanpassung (s. u.).

Kein anderer Posten verwendet `reportsTotal` oder den Nachfrage-Term ein zweites Mal zum
vollen Satz; `risk` und `switchCost` referenzieren nur den (dann korrigierten) `rollout`-Wert
selbst, keine eigene Neuberechnung der Nachfrage.

## 3) Umsetzbar mit vorhandenen Eingaben?

Ja. `S.reports`, `demand1000`, `demandCreator`, `S.creators`, `vAvg`, `H`, `rate0`, `rate`
existieren bereits exakt so im Code (`calc()` L695–716, `calcSQ()` L774–776). Es sind keine
neuen Nutzereingaben nötig — nur eine Umgruppierung der bestehenden Terme in zwei Summanden
(Jahr-0-Bestand × `rate0`, Nachfrage-Zuwachs × H × `rate`) statt eines Produkts mit `rate0`.
Der optionale `prodF`-Baustein ist klar als "wenn Z1 (separater Fund) kommt" markiert und
keine harte Voraussetzung für den Kernfix.

## 4) Bevorzugt der Vorschlag OSS/Deneb der Autoren ohne sachlichen Grund?

Nein. `wageF` wird aus dem globalen `wageInfl` (GLOBAL-Annahme, ansatzunabhängig) gebildet
und wirkt in der bestehenden Formel bereits identisch auf `rate`/`rateInt` für alle vier
Ansätze (`rate0` selbst unterscheidet sich je Ansatz nur über `p('ext')`, nicht über
`wageInfl`). Der Fix verteuert `rollout` bei allen vier Optionen um denselben relativen
Nachfrage-Anteil × (wageF−1) — keine Richtungsverzerrung zugunsten des hauseigenen
ChartKitchen-Visuals oder der Deneb-Templates.

## 5) Sind die genannten Zahlen plausibel/nachvollziehbar?

Mit Preset "Mittelstand" (`creators:3, viewers:40, reports:12`, PRESETS L588) und
Panel-Mittelwerten `demand1000=2`, `demandCreator=0.5`:

- Nachfrage/Jahr ≈ 2×(40/1000) + 0,5×3 = 0,08 + 1,5 = 1,58
- H=5: reportsTotal ≈ 12 + 7,9 = 19,9 → Nachfrage-Anteil ≈ 7,9/19,9 ≈ **40 %** ✓
- H=10: reportsTotal ≈ 12 + 15,8 = 27,8 → Anteil ≈ 15,8/27,8 ≈ **57 %** ✓
- `wageInfl` Mittelwert 3 %: `wageF`(5J) ≈ 1,06, `wageF`(10J) ≈ 1,14 ✓ (Definition L698)
- Effekt auf `rollout`: 0,40×6 % ≈ **2,4 %** (5J), 0,57×14 % ≈ **8 %** (10J) — beide vom
  Finder genannten Zahlen reproduzieren sich exakt aus den Panel-Mittelwerten.

Die Zahlen sind sauber hergeleitet, keine erfundene Präzision.

## Bewertung der einzelnen Widerlegungs-Kriterien
| Kriterium | Ergebnis |
|---|---|
| "Heute" korrekt beschrieben? | Ja, wortgenau im Code verifiziert |
| Doppelzählung mit bestehendem Posten? | Nur marginale, vorbestehende Nebenwirkung über `maintBase` (0,3×rollout), kein Disqualifikationsgrund |
| Umsetzbar mit vorhandenen Eingaben? | Ja, keine neuen Daten nötig |
| Unsachliche Bevorzugung OSS/Deneb? | Nein, wirkt ansatzneutral |
| Wirkung relevant oder Rauschen? | Relevant bei H=10 (≈8 % auf `rollout`, eine der größeren Kostenkategorien), eher klein bei H=5 |

## Empfehlung (adjusted)
Fund bestätigt. Formulierungsempfehlung für die Umsetzung, um die o.g. Nebenwirkung
transparent zu machen: bei der Korrektur von `rollout` in einer Zeile mit erwähnen, dass
`maintBase`s `0.3*rollout`-Proxy dadurch implizit eine zweite `wageF`-Schicht auf den
Nachfrage-Anteil bekommt — akzeptabel angesichts der geringen Größenordnung (< 2,5 Punkte
auf `maintBase`), aber im Audit-Report als bekannte Nebenwirkung dokumentieren statt
stillschweigend hinzunehmen. Ansonsten Formel wie vom Finder vorgeschlagen übernehmen,
inklusive des identischen Fixes in `calcSQ()`.
