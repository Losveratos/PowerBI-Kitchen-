# Prüfung: Fund "zeit" – Produktivitätsgewinn je Jahr (prodGain)

## Fund im Original
Neue OPTP-Annahme `prodGain` als Gegenstück zu `wageInfl`, multiplikativ angewandt auf `maint`, `events`, `trainRun` und den nachfragegetriebenen Rollout-Anteil, mit `prodF` analog zu `wageF` berechnet.

## Prüfung des Ist-Zustands (Grep, v0.10)

Zeilen 692–729, 774–778:

```js
const wageF=(()=>{const w=1+g('wageInfl')/100;let t=0;for(let y=0;y<H;y++)t+=Math.pow(w,y);return t/H;})();
const rateInt=rateInt0*wageF, rate=rate0*wageF;           /* laufende Posten */
...
const setup=p('setupH')*rate0, dev=p('devH')*rate0, build=S.types*p('firstH')*compMult*libF*rate0;
...
const rollout=reportsTotal*S.cpr*p('reuseH')*compMult*libF*learnRoll*M.reuseF*rate0;
...
const maint=maintBase*(p('maint')/100)*maintYears*variantEff*wageF;
const events=p('events')*p('fixH')*rate*H;
const trainRun=(g('churn')/100)*H*rateInt*(...);
```

**Zentraler Befund: `rollout` ist im Ist-Zustand NICHT wage-eskaliert.** Es wird mit `rate0` (unskaliertem Basissatz), nicht mit `rate` oder `rateInt` (beide `*wageF`) gerechnet — genau wie `setup`, `dev`, `build`. Nur `maint`, `events`, `gov`, `supUsers`, `licAdmin`, `trainRun` tragen `wageF`. `train0` läuft explizit über `rateInt0` (unskaliert).

Der Fund beschreibt "Heute" so, als würde `wageInfl` pauschal "interne und externe Stunden über den Horizont" verteuern — das trifft auf die laufenden Posten zu, aber **nicht** auf den nachfragegetriebenen Rollout, den der Fund selbst als Ziel für `prodGain` nennt. Damit ist die "Heute"-Beschreibung an der für den Vorschlag entscheidenden Stelle ungenau.

## Zwei Probleme, die zur Widerlegung führen

**1. Fehlbeschreibung des Ist-Zustands beim Rollout.**
Der Fund verlangt `prodF` "multiplikativ auf ... den nachfragegetriebenen Rollout-Anteil", mit der Begründung, es sei das "Gegenstück zur Lohnsteigerung". Da `rollout` aber keine Lohnsteigerung trägt, gibt es dort nichts zu neutralisieren — die zentrale Rechnung des Funds ("4 %/Jahr neutralisiert Lohnsteigerung für Deneb/Core fast exakt") bezieht sich auf `maint`/`events`, nicht auf `rollout`, wird aber unpräzise auf den ganzen Vorschlag verallgemeinert. Würde man `prodF` trotzdem auf `rollout` anwenden, entstünde eine reine Kostensenkung ohne eskaliertes Gegenstück — kein symmetrischer Effekt, wie suggeriert.

**2. Doppelzählung mit `learnF` bei Deneb/Core.**
Die bestehende `learn`-Annahme (Zeile 576) hat für `deneb`/`core` explizit die höchste Rate (8–25 %, `srcNote`: *"Code-Ansätze lernen mehr (Vorlagenbibliothek reift)"*). Das ist bereits ein Werkzeug-/Vorlagenreife-Effekt, nicht nur individuelle Übung — genau die Begründung, die der Fund für `prodGain` bei Deneb/Core anführt ("Vega-Lite-JSON, DAX-UDFs ... sind genau die Textartefakte, die Sprachmodelle erzeugen"). `learnRoll=learnF(chartsPerCreator, p('learn'))` wirkt bereits multiplikativ auf `rollout`. Ein zusätzlicher `prodGain`-Faktor auf demselben `rollout`-Term für dieselben Buckets (deneb/core mit 4–10 %) zählt den Reifungseffekt der Vorlagenbibliothek/KI-Assistenz zweimal — einmal über Chart-Volumen (`learn`), einmal über Kalenderzeit (`prodGain`). Das ist genau der Doppelzählungsfall, den die Prüfvorgabe als Widerlegungsgrund nennt.

## Was trägfähig bleibt

Der Kern-Gedanke — Löhne/Lizenzen steigen im Modell über `wageInfl`, aber kein Gegenstück auf der Stundenseite — ist berechtigt und trifft tatsächlich auf `maint`, `events`, `trainRun` (und `gov`/`supUsers`/`licAdmin`) zu, die real mit `wageF` skaliert werden. Dort gibt es kein Überschneidungsproblem mit `learnF`, weil `learnF` nur auf `rollout` (über `learnRoll`) wirkt, nicht auf `maint`/`events`/`trainRun`.

## Urteil

`refuted = true` — nicht weil die Grundidee falsch ist, sondern weil der konkrete Vorschlag (a) den Ist-Zustand an der entscheidenden Stelle (Rollout ist nicht wage-eskaliert) falsch darstellt und (b) für Deneb/Core eine Doppelzählung mit der bestehenden `learn`-Annahme einführen würde.

## Angepasster Vorschlag

`prodGain` einführen, aber **nur** auf die tatsächlich wage-eskalierten laufenden Posten anwenden, die kein Analogon in `learnF` haben:

```js
const prodF=(()=>{const d=1-g('prodGain')/100;let t=0;for(let y=0;y<H;y++)t+=Math.pow(d,y);return t/H;})();
```

Anwendung: `maint`, `events`, `gov` (Run/Audit-Anteil), `supUsers`, `licAdmin`, `trainRun` — **nicht** auf `rollout`, `setup`, `dev`, `build`, `switchCost`, `train0`, Lizenz. Werte ggf. moderater ansetzen, da die Trigger-Buckets kleiner/andere sind als ursprünglich angenommen (die großen Hebel `rollout`/`build` bleiben unberührt, daher ist die Gesamt-NPV-Wirkung schwächer als im Fund behauptet — Neuberechnung der Beispielzahlen nötig, hier nicht spekulativ vorweggenommen). Badge weiterhin S/E, min 0.

Evidenz: keine (Ist-Stand per Grep verifiziert, v0.10, Zeilen 692–729, 774–778).

Konfidenz: hoch für die beiden Widerlegungsgründe (Code-Lesart eindeutig); mittel für die Größenordnung des angepassten Effekts.

Wirkung: mittel — verhindert eine strukturelle Doppelzählung, die sonst die Kostenvorteile von Deneb/Core systematisch zu positiv darstellen würde, gerade weil `learn` dort ohnehin schon die höchsten Werte trägt (8–25 % vs. 0–10 % bei paid).
