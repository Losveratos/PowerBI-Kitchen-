# Runde 2 · Linse „Struktur des Rechenkerns in der Zeit"

Datei: `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html`, Stand v0.10 (11.09.2026).
Geprüft: `calc()` (Zeile 677–761), `calcSQ()`, `simulate()`, `modeParams()`, `viewersAvg()`, die abgeleiteten
KPI (`invest`, `yearly`, `nextReportH`, `cf`, `npv`) und ihre Verwendung in `drawBreakEven`, `drawCumulative`,
`rankVal` und der Monte-Carlo-Facette.

Alle Zahlen unten stammen aus einem Headless-Nachbau des Kerns: `calc()` wurde unverändert aus der HTML
extrahiert (Zeilen 480–594 und 645–783), dazu ein Jahr-für-Jahr-Gegenmodell `calcY()`. Reproduktionsprobe:
Mittelstands-Preset 3/40/12, H = 5 → Paid P50 58.698 €, OSS 75.944 €, Deneb 96.390 €, Core 136.235 € —
das deckt sich mit `presets-v08.json` (59 / 76 / 98 / 139 k€). Der Nachbau rechnet also denselben Kern.

**Es geht in diesem Bericht ausschließlich um Struktur, nicht um Parameterwerte.** Kein Vorschlag unten
ändert eine einzige Annahme in `GLOBAL` oder `OPTP`; alle Wirkungen entstehen allein daraus, *wann* ein
bereits vorhandener Wert verrechnet wird.

---

## Das Kurzfazit in vier Sätzen

Der Kern ist kein Zeitmodell, sondern eine Summe von Mittelwert-Produkten: `wageF`, `licFv`, `maintYears`,
`vAvg` sind jeweils „Faktor × H" statt „Summe über Jahre". Das ist an fünf Stellen inkonsistent, und die
Fehler zeigen in **entgegengesetzte** Richtungen — der Rollout ist zu billig (bis −10 %), die Wartung zu
teuer (bis +21 %). In der **nominalen Gesamtsumme** heben sie sich weitgehend auf (Δ −3,7 % bis +1,5 % über
alle Presets), weshalb das Modell bisher unauffällig war. In **Barwert, Zahlungsstrom, Break-even-Chart und
Kumulativ-Chart** heben sie sich nicht auf: dort verschiebt die Umstellung Paid und die Stunden-Ansätze um
bis zu 8 Prozentpunkte gegeneinander (Konzern H = 10: Barwert Paid +1,6 %, OSS −8,4 %, Core −8,4 %).

---

## 1 · Wo die Zeitachse heute inkonsistent ist

### 1.1 Rollout: alle Reports der nächsten H Jahre entstehen in Jahr 0, zu Jahr-0-Löhnen

```js
const reportsTotal = S.reports + (g('demand1000')*(vAvg/1000)+g('demandCreator')*S.creators)*H;
const rollout = reportsTotal*S.cpr*p('reuseH')*compMult*libF*learnRoll*M.reuseF*rate0;
c.invest = c.build + c.switch + c.rollout + train0 + govOnce;
c.cf = [c.invest]; …
```

`reportsTotal` ist der **Endbestand** nach H Jahren. Er wird mit `rate0` bewertet — dem Stundensatz ohne
Lohnsteigerung — und komplett in `c.invest`, also in `c.cf[0]`, gebucht. Der Report, der in Jahr 5 entsteht,
wird damit in Jahr 0 zu Jahr-0-Löhnen bezahlt. Zwei Fehler in einer Zeile:

- **Preisbasis.** Wartung (`maint`), Fixes (`events`), Nachschulung (`trainRun`), Support (`supUsers`) und
  Governance nutzen `rate = rate0 × wageF`. Der Rollout nutzt `rate0`. Effekt einer kohortenweisen
  Bewertung (jede Jahresschicht mit `rate0 × (1+wageInfl)^y`):

  | | Mittelstand H=5 | Mittelstand H=10 | Konzern H=5 | Konzern H=10 |
  |:--|--:|--:|--:|--:|
  | Paid | +2,5 % | +8,6 % | +2,8 % | +9,8 % |
  | OSS | +2,3 % | +8,0 % | +2,7 % | +9,2 % |
  | Deneb | +2,1 % | +7,4 % | +2,4 % | +8,5 % |
  | Core | +2,1 % | +7,4 % | +2,4 % | +8,5 % |

- **Zeitpunkt.** Der Barwert diskontiert alles auf t = 0. Weil der Rollout dort liegt, wird er nicht
  diskontiert — und der Rollout ist genau der Posten, der die Stunden-Ansätze von Paid unterscheidet
  (Mittelstand: Paid 12,3 k€, Core 45,0 k€). Das benachteiligt im Barwert systematisch die
  aufbaulastigen Ansätze. Kohortenweise Buchung verschiebt:

  | Barwert | Mittelstand H=5 | Mittelstand H=10 | Konzern H=5 | Konzern H=10 | Großkonzern H=10 |
  |:--|--:|--:|--:|--:|--:|
  | Paid | +3,4 % | +2,1 % | +3,5 % | +1,6 % | −5,3 % |
  | OSS | +1,4 % | −2,6 % | −2,0 % | −8,4 % | −7,4 % |
  | Deneb | +1,6 % | −1,3 % | −1,1 % | −6,4 % | −5,8 % |
  | Core | +0,8 % | −2,7 % | −2,3 % | −8,4 % | −6,9 % |

  Im Konzern-Preset H = 10 schrumpft der Barwert-Vorsprung von OSS gegenüber Paid heute auf 147 k€ —
  im Jahresmodell sind es 235 k€. Das ist kein Rundungseffekt.

- **Nebenwirkung auf die KPI-Karte.** Die Karte zeigt „Invest 61.469 € · laufend 15.330 €/Jahr" (Core,
  Mittelstand). Der Invest enthält den Bau von Reports, die es in Jahr 0 noch gar nicht gibt. 44 bis 47 %
  der Gesamtkosten stehen als Jahr-0-Auszahlung da. Im Mittelstand ist das noch halbwegs richtig (12 der
  ~16 Reports sind Bestand); im Großkonzern-Preset mit 30 % Viewer-Wachstum nicht mehr.

### 1.2 Lernkurve ohne Zeitbezug

```js
const chartsPerCreator = reportsTotal*S.cpr/Math.max(1,S.creators);
const learnRoll = learnF(chartsPerCreator, p('learn'));
```

`learnF` liefert den **Mittelwert der Wright-Kurve über alle Charts des ganzen Horizonts** und multipliziert
ihn auf *jeden* Chart, auch auf den allerersten. Konzern H = 10, Core: `learnRoll` = 0,759. Kohortenweise
sind die Jahresfaktoren 0,932 / 0,712 / 0,690 / … / 0,588. Der erste Jahrgang bekommt heute also 24 %
Rabatt, den niemand erarbeitet hat, die späten Jahrgänge zu wenig.

Wichtig und angenehm: **die Summe ändert sich dadurch nicht.** Der Wright-Mittelwert teleskopiert
(`learnSeg(0,a) · a + learnSeg(a,b) · (b−a) = learnSeg(0,b) · b`), gemessene Abweichung 0,0 % in allen vier
Presets. Falsch ist nur das **Zeitprofil** — und die KPI „jeder weitere Report ≈ x h", die den Horizontmittel-
wert statt des Grenzwerts am heutigen Bestand zeigt:

| Mittelstand H=5 | heute angezeigt | marginal (nach dem Erst-Rollout) |
|:--|--:|--:|
| Paid | 6,0 h | 5,8 h |
| OSS | 11,1 h | 10,3 h |
| Deneb | 13,4 h | 11,7 h |
| Core | 21,2 h | 18,4 h |

Konzern H = 5, Core: 26,0 h angezeigt gegen 22,9 h marginal. Die Anzeige ist um 3–13 % zu pessimistisch,
und zwar am stärksten bei den Code-Ansätzen. Das ist der einzige Zeitfehler im Modell, der *zugunsten* von
Paid wirkt.

### 1.3 Wartung: Endbestand ab Jahr 0, Abklingfaktor am Kalenderjahr statt am Kohortenalter

```js
const maintBase = setup + dev + build + 0.3*rollout;         // rollout = Endbestand
let maintYears = 0; for (let y=0; y<H; y++) maintYears += Math.pow(decay, y);
const maint = maintBase*(p('maint')/100)*maintYears*variantEff*wageF;
```

Zwei Annahmen, die einander widersprechen: der zu wartende Bestand ist der **Endbestand** (wächst nicht),
der Abklingfaktor `decay^y` tut so, als altere dieser Bestand **ab Jahr 0** gleichmäßig. In Wahrheit wächst
der Bestand und jede Schicht altert ab ihrem eigenen Entstehungsjahr. Kohortenweise gerechnet:

| Wartung, kohortenweise gegen heute | Mittelstand H=5 | Mittelstand H=10 | Konzern H=5 | Konzern H=10 |
|:--|--:|--:|--:|--:|
| Paid | −5,4 % | −10,3 % | −13,7 % | −21,1 % |
| OSS | −6,9 % | −12,3 % | −13,5 % | −20,6 % |
| Deneb | −6,5 % | −11,5 % | −12,4 % | −19,0 % |
| Core | −7,1 % | −12,4 % | −12,6 % | −19,3 % |

Absolut trifft das Core am härtesten, weil Wartung dort 44 % der Gesamtkosten ist (Paid: 12 %). Konzern
H = 10: Core −133 k€ Wartung gegen +59 k€ Rollout, netto −74 k€; Paid −13 k€ gegen +21 k€, netto +8 k€.
**Die beiden Zeitfehler heben sich in der Summe auf — aber nicht innerhalb einer Option.**

### 1.4 Viewer-Wachstum exponentiell und ohne Deckel

```js
function viewersAvg(gPct){const gr=1+gPct/100;let t=0;for(let y=0;y<S.horizon;y++)t+=S.viewers*Math.pow(gr,y);return t/S.horizon;}
```

Der `srcNote` zu `growth` sagt es selbst: „Exponentiell ohne Sättigung: bei 10 Jahren Horizont Deckel prüfen".
Er ist nicht geprüft. Bei H = 10 und dem Maximum 30 %/Jahr wächst der Bestand auf das **10,6-fache**:

| Start-Viewer | H = 10, g = 30 % | letzter Jahrgang |
|:--|--:|--:|
| 40 (Mittelstand) | vAvg 170 | 424 |
| 1.500 (Konzern) | vAvg 6.393 | 15.907 |
| 10.000 (Großkonzern) | vAvg 42.619 | **106.045** |

106.000 Leser in einem Unternehmen, das mit 10.000 gestartet ist — das zieht in jedem Monte-Carlo-Lauf das
obere Ende des Bandes hoch, und zwar **ungleich**: die Lizenz je Nutzer skaliert linear mit den Viewern,
Governance nur log-linear über `sizeF`. Test Konzern H = 10, Obergrenze des Wachstums von 30 % auf 15 %:
Paid-P90 −10,1 %, OSS −5,4 %, Deneb −4,8 %, Core −4,4 %. Das P90 von Paid ist heute also rund 5 Punkte zu
hoch **relativ** zu den anderen — genau die Kennzahl, die eine Risikoaversions-Rangfolge (Abschnitt 4)
benutzen würde.

### 1.5 Staffel jahresgenau, alles andere statisch × H

`lic` rechnet korrekt jahresweise mit wachsender Nutzerzahl und `staffelD(u_y)`. Direkt daneben:

```js
const licAdmin = Math.sqrt(users/100)*p('licAdmH100')*rateInt*H;   // users = creators + viewers in Jahr 0
const support  = p('support')*H;                                    // keine Preissteigerung
const capacity = g('capacityCost')*p('cuUplift')/100*H;             // kein Mengenwachstum, keine Preissteigerung
const gov      = govOnce + ((p('govRun')+p('govAudit'))*H*sizeF + g('govPer1000')*(vAvg/1000)*H)*rateInt*M.govF;
const supUsers = (vAvg/100)*p('supH100')*rateInt*H*M.supF;
```

- `licAdmin` nimmt die Nutzerzahl aus Jahr 0, während die Lizenz jahresweise wächst. Jahresgenau gerechnet:
  Mittelstand H = 5 +11 %, H = 10 +27 %, Konzern H = 10 +29 %. Absolut klein (0,5–9 k€), aber es ist
  derselbe Nutzerbestand, zweimal unterschiedlich behandelt.
- `support` und `capacity` sind Euro-Posten ohne jede Preissteigerung, während die Lizenz `licInfl` bekommt
  und alle Stunden `wageInfl`. Keine Position im Modell steht real konstant — außer diesen zweien.
- `vAvg × rateInt × H` ist ein Produkt von Mittelwerten statt einer Summe von Produkten. Weil Viewer und
  Löhne **beide** wachsen, ist die echte Summe größer: H = 5 / g = 10 % / w = 3 % → +0,6 %; H = 10 / 10 % /
  3 % → +2,3 %; H = 10 / 30 % / 4,5 % → **+8,7 %**. Betrifft Support und Governance, also die Posten, die
  bei OSS und Core am größten sind.

### 1.6 Abkündigungsrisiko: Endbestand und ein fixes Ereignisjahr

```js
const pH  = 1 - Math.pow(1-p('dep')/100, H);
const hit = sim ? (rnd() < pH ? 1 : 0) : pH;
const risk = hit*(setup+dev+build+0.6*rollout)*(g('migShare')/100);
…
const riskYear = Math.max(1, Math.ceil(H/2));                 // nur im Zahlungsstrom
```

Die Wahrscheinlichkeit wird über H akkumuliert, die Schadenshöhe aber immer am **Endbestand** bemessen —
auch wenn das Ereignis in Jahr 1 einträte, wo erst ein Bruchteil ausgerollt ist. Im Zahlungsstrom wird das
Ereignis auf ein einziges, festes Jahr `ceil(H/2)` gelegt, in der Simulation dagegen gar nicht datiert.
Gefahrenraten-Rechnung (Ereignis in Jahr y mit `(1−dep)^y · dep`, Schaden am Bestand von Jahr y):

| | Mittelstand H=5 | Mittelstand H=10 | Konzern H=5 | Konzern H=10 |
|:--|--:|--:|--:|--:|
| Paid | −2,4 % | −2,9 % | −11,2 % | −16,8 % |
| OSS | −5,0 % | −8,7 % | −11,8 % | **−19,5 %** |
| Deneb | −3,5 % | −4,4 % | −9,3 % | −13,8 % |
| Core | −3,9 % | −4,2 % | −9,0 % | −12,4 % |

OSS hat mit 7 %/Jahr die höchste Abkündigungsrate und wird deshalb heute am stärksten überbelastet —
konkret 19 k€ (Konzern H = 10) zu viel in einer Position, die genau das Argument gegen das eigene Projekt
der Autoren trägt. Das ist der Zeitfehler mit der unangenehmsten Optik.

### 1.7 Der Zahlungsstrom ist eine Fiktion

```js
c.cf=[c.invest];
{const perYear=(c.total-c.invest-lic-risk)/H; …}
```

Alles außer Lizenz und Risiko wird **flach** über H Jahre verteilt. Der Barwert, das Break-even-Chart
(`drawBreakEven`) und das Kumulativ-Chart (`drawCumulative`, Zeile 1042) hängen ausschließlich an diesem
`cf`. Der einzige Profilunterschied zwischen den Optionen, den die Charts heute zeigen können, ist die
Höhe von `c.invest` — und die ist nach 1.1 selbst ein Artefakt. Die Aussage „Paid ist lizenzlastig, also
spätes Geld; Deneb und Core sind aufbaulastig, also frühes Geld", die der Rechner im Text macht, ist im
Zahlungsstrom nicht abgebildet, sondern nur behauptet. Sichtbar an Mittelstand/Paid: heute
`[21.901, 6.203, 6.648, 8.315, 7.759, 8.449]` — der Sprung in Jahr 3 ist allein das fixe Risiko-Jahr
`ceil(5/2)`, kein Geschäftsvorfall. Jahresmodell: `[24.287, 7.757, 8.361, 9.104, 9.968]`, monoton steigend.

Nebenbei: `c.cf` hat **H + 1** Einträge, während jede Summe im Kern über y = 0…H−1 läuft. Der Betriebsteil
liegt also in den Perioden 1…H, die Lizenz des ersten Betriebsjahres wird um ein Jahr zusätzlich
diskontiert. Als Konvention („Invest bei t = 0, Betrieb nachschüssig") vertretbar, aber nirgends erklärt
und nicht dieselbe Zeitachse wie `lic`.

---

## 2 · Die kleinste Umstellung auf ein echtes Jahr-für-Jahr-Modell

Eine Schleife, ein neuer Parameter (Viewer-Deckel), sonst nichts. Alle Formeln unten sind direkt
implementierbar und benutzen ausschließlich Größen, die es heute schon gibt.

### 2.1 Vorbereitung (einmal, vor der Schleife)

```js
const w   = 1 + g('wageInfl')/100;      // Lohnfaktor
const inf = 1 + (P.licInfl ? p('licInfl') : 0)/100;
const gr  = 1 + g('growth')/100;
const vCap = S.viewerCap || Infinity;   // NEU, Abschnitt 3.4
const V  = y => Math.min(S.viewers*Math.pow(gr,y), vCap);
const A  = setup + dev + build;         // Aufbau in Jahr 0, Preise Jahr 0
// Wright-Segmentmittel zwischen zwei kumulierten Chart-Zahlen je Ersteller
const learnSeg = (a,b,r) => {
  if (r<=0 || b<=a) return 1;
  const be = -Math.log(1-r/100)/Math.LN2, al = 1-be;
  return Math.max(.5, (Math.pow(b+.5,al)-Math.pow(a+.5,al))/(al*(b-a)) * Math.pow(10,be));
};
// heutiges learnF(n,r) ist exakt learnSeg(0,n,r) — die Summe bleibt identisch
let K = 0;                 // kumulierte Charts je Ersteller
const R = [];              // Rollout-Kohorten zu Preisen von Jahr 0
let surv = 1;              // Überlebenswahrscheinlichkeit des Ansatzes
```

### 2.2 Die Schleife, `y = 0 … H−1`

```js
const wy = Math.pow(w,y), iy = Math.pow(inf,y);
const v  = V(y), u = v + S.creators;
const rateY = rate0*wy, rateIntY = rateInt0*wy;

// (a) Bestand und Zuwachs
const n  = (y===0 ? S.reports : 0) + g('demand1000')*(v/1000) + g('demandCreator')*S.creators;
const Cy = n*S.cpr;                         // neue Charts dieses Jahres
const dK = Cy/Math.max(1,S.creators);
const lf = learnSeg(K, K+dK, p('learn'));   // Lernkurve auf DIESEN Jahrgang
K += dK;

// (b) Rollout dieses Jahres
const rollConst = Cy*p('reuseH')*compMult*libF*lf*M.reuseF*rate0;   // Preisbasis Jahr 0
R.push(rollConst);
const rollout_y = rollConst*wy;                                     // Lohnsteigerung

// (c) Wartung des VORHANDENEN Bestands, jede Kohorte altert ab ihrem eigenen Jahr
let mb = A*Math.pow(decay,y);
for (let j=0; j<=y; j++) mb += 0.3*R[j]*Math.pow(decay, y-j);
const maint_y = mb*(p('maint')/100)*variantEff*wy;
const events_y = p('events')*p('fixH')*rateY;

// (d) Lizenz des Jahres
let lic_y = 0;
if (key==='paid') lic_y = (S.licModel==='site') ? p('licSite')*iy
                                                : u*iy*p('lic')*staffelD(u);
const support_y  = p('support')*iy;
const capacity_y = g('capacityCost')*p('cuUplift')/100*iy;
const licAdmin_y = (key==='paid' && S.licModel!=='site')
                 ? Math.sqrt(u/100)*p('licAdmH100')*rateIntY : 0;

// (e) Betrieb: Anwender-Support, Governance, Nachschulung
const supUsers_y = (v/100)*p('supH100')*rateIntY*M.supF;
const gov_y = ((p('govRun')+p('govAudit'))*sizeF(v) + g('govPer1000')*(v/1000))*rateIntY*M.govF;
const trainRun_y = (g('churn')/100)*rateIntY
                 * (owners*(trainHe+p('rampH')) + (S.creators-owners)*(p('lightH')+0.25*p('rampH')));

// (f) Abkündigung als Gefahrenrate auf den Bestand DIESES Jahres
const haz = p('dep')/100;
const stock_y = (A + 0.6*R.reduce((a,b)=>a+b,0)) * wy;
const risk_y = surv*haz*stock_y*(g('migShare')/100);   // Erwartungswert-Pfad
surv *= (1-haz);
// in der Simulation stattdessen: erstes y mit rnd()<haz bestimmt Jahr und Schaden, danach Abbruch

cf[y] = rollout_y + maint_y + events_y + lic_y + support_y + capacity_y + licAdmin_y
      + supUsers_y + gov_y + trainRun_y + risk_y
      + (y===0 ? A + switchCost + govOnce + train0 : 0);
```

### 2.3 Nach der Schleife

```js
c.total = Σ cf[y]  (plus Restwert/Exit, Abschnitt 3)
c.npv   = Σ cf[y] / (1+disc)^y        // Zeitachse jetzt identisch zu allen Summen
c.invest      = A + switchCost + govOnce + train0 + rollout_0   // nur der ERSTE Rollout-Jahrgang
c.yearly      = (c.total − cf[0]) / (H−1)
c.nextReportH = S.cpr*p('reuseH')*compMult*libF*learnSeg(K, K+S.cpr/S.creators, p('learn'))*M.reuseF
```

Die letzte Zeile ist der ehrliche Wert für „jeder weitere Report": der Grenzaufwand am **heutigen**
Bestand, nicht das Horizontmittel.

### 2.4 Was sich dadurch ändert (Richtung und Größenordnung)

Nominale Gesamtsumme (die Rangfolge-Kennzahl) — kleiner Effekt, weil sich 1.1 und 1.3 gegenseitig fressen:

| | Mittelstand H=5 | Mittelstand H=10 | Konzern H=5 | Konzern H=10 | Großkonzern H=10 |
|:--|--:|--:|--:|--:|--:|
| Paid | +0,3 % | +0,6 % | 0,0 % | +0,6 % | +1,5 % |
| OSS | −0,7 % | −1,8 % | −2,1 % | −2,9 % | −1,8 % |
| Deneb | −0,5 % | −0,8 % | −1,2 % | −1,2 % | −0,1 % |
| Core | −1,5 % | −2,6 % | −2,5 % | −3,7 % | −1,8 % |

Barwert — großer Effekt (Tabelle in 1.1). Der Barwert wird damit überhaupt erst eine belastbare Zahl.
Break-even- und Kumulativ-Chart zeigen erstmals echte Profile statt Geraden.
Keine Rangfolge dreht sich in den fünf Presets; die **Abstände** zwischen Paid und den Stunden-Ansätzen
schrumpfen im Barwert um 2 bis 8 Prozentpunkte.

Aufwand: eine Schleife von ~35 Zeilen ersetzt `wageF`, `licFv`, `licFa`, `maintYears`, `viewersAvg` und die
`cf`-Konstruktion. `vAvg` bleibt als Anzeigegröße erhalten.

---

## 3 · Restwert am Horizontende

### 3.1 Warum es einen braucht

Heute wird der gesamte Aufbau innerhalb von H abgeschrieben. Der Horizont-Schieber ist damit der stärkste
Einzelhebel des ganzen Rechners — stärker als jede Annahme:

| Mittelstand | Paid | OSS | Deneb | Core | OSS/Paid | Core/Paid |
|:--|--:|--:|--:|--:|--:|--:|
| H = 3 | 40 k€ | 57 k€ | 73 k€ | 101 k€ | **1,40** | **2,51** |
| H = 5 | 59 k€ | 78 k€ | 98 k€ | 140 k€ | 1,31 | 2,36 |
| H = 7 | 82 k€ | 101 k€ | 125 k€ | 179 k€ | 1,22 | 2,18 |
| H = 10 | 124 k€ | 137 k€ | 168 k€ | 242 k€ | **1,11** | **1,95** |

Die unbegründete Voreinstellung H = 5 entscheidet also, wie deutlich Paid vorn liegt.

### 3.2 Der naheliegende Restwert ist der falsche

Ein positiver Restwert auf die Vorlagenbibliothek, `RV = residShare × A × (1+wageInfl)^H × (1−dep)^H`,
mit `A = setup + dev + build`, klingt richtig, ist aber wirkungslos und zeigt in die falsche Richtung.
Grund: `A` ist winzig gegenüber dem Rollout. Anteil von `A` am Gesamt: Mittelstand 7–11 %, Konzern 1,2–1,4 %,
Großkonzern 0,2–0,3 %. Mit `residShare = 0,4`:

| Mittelstand H=5 | Aufbau A | Restwert | Entlastung |
|:--|--:|--:|--:|
| Paid | 6.788 € | 2.833 € | **−4,8 %** |
| OSS | 6.738 € | 2.144 € | −2,8 % |
| Deneb | 8.500 € | 3.369 € | −3,4 % |
| Core | 10.116 € | 4.464 € | −3,2 % |

Entlastet wird **Paid am stärksten** — weil Paid die kleinste Gesamtsumme bei vergleichbarem Aufbau hat.
Im Konzern und Großkonzern liegt der Effekt bei 0,1–0,6 %. Diesen Restwert einzubauen wäre Aufwand ohne
Erkenntnis.

### 3.3 Der wirksame Term ist eine Exit-Verpflichtung, keine Gutschrift

Alle vier Ansätze liefern dieselben Reports — die Bibliothek ist deshalb kein Vermögenswert, den man
gegenrechnen könnte. Was am Horizontende **tatsächlich asymmetrisch** ist: wie viel vom Bestand man neu
bauen muss, wenn man nach H wechselt. Der Rechner behauptet diese Asymmetrie schon im Text
(Paid: „Report-Definitionen sind an das Visual gebunden: Wechsel bedeutet Neubau"; Deneb-`srcNote`:
„Vega-Lite-Specs überleben das Wirtsvisual"), rechnet sie aber nur *innerhalb* von H über `dep`.

```js
// neue Annahme je Ansatz, Bindungsgrad: Anteil des Bestands, der bei einem Wechsel neu entsteht
lockIn = { paid:[0.8,0.95,1.0], oss:[0.6,0.8,0.95], deneb:[0.2,0.4,0.6], core:[0.3,0.5,0.7] }

Exit_H = p('lockIn') × (A + 0.6·Σ R[j]·w^j) × g('migShare')/100 × (1 − p('dep')/100)^H
c.totalExit = c.total + Exit_H
c.npv      += Exit_H / (1+disc)^H
```

Struktur bewusst identisch zu `switchCost` und `risk` — derselbe Bestandsbegriff, dieselbe `migShare`,
nur am anderen Ende der Zeitachse und mit dem Überlebensfaktor, damit das Risiko nicht doppelt zählt.
Größenordnung mit den Beispiel-Bandbreiten oben:

| | Mittelstand H=5 | | Konzern H=5 | | Konzern H=10 | |
|:--|--:|--:|--:|--:|--:|--:|
| | Exit | % des Gesamts | Exit | % | Exit | % |
| Paid | 9.413 € | **15,8 %** | 63.586 € | 10,3 % | 88.224 € | 6,1 % |
| OSS | 8.837 € | 11,5 % | 72.200 € | 13,1 % | 74.614 € | 7,2 % |
| Deneb | 7.121 € | **7,3 %** | 56.841 € | **8,4 %** | 70.297 € | **5,7 %** |
| Core | 13.997 € | 10,2 % | 118.820 € | 11,8 % | 164.070 € | 8,9 % |

Wirkung: Mittelstand H = 5 verschiebt sich OSS/Paid von 1,31 auf 1,25, Deneb/Paid von 1,66 auf 1,53,
Core/Paid von 2,36 auf 2,20. Das Feld rückt um 5–7 % zusammen, Deneb gewinnt am meisten, Core verliert
relativ (größter Bestand). Der Term wirkt damit als Gegengewicht zum H-Artefakt aus 3.1.
Vorschlag: Schalter „Wechselkosten nach dem Horizont einrechnen", Default **aus**, mit dem Hinweis, dass
er ein Szenario unterstellt (Wechsel nach H), das nicht eintreten muss.

### 3.4 Viewer-Deckel als neue Struktur-Eingabe

```js
S.viewerCap  // Voreinstellung: Belegschaft, ersatzweise 3 × S.viewers
V = y => Math.min(S.viewers*Math.pow(gr,y), S.viewerCap)
```

Ein Feld in Schritt 1, kein Annahmen-Parameter. Ohne ihn ist jedes Ergebnis bei H ≥ 7 im oberen Band
Fantasie (Abschnitt 1.4).

---

## 4 · Risikoaversion: P50 / P75 / P90 als Schalter

Heute läuft die Rangfolge über den Median:

```js
const cminAll = Math.max(1, Math.min(...OPTS.map(o => sim[o.key].p50)));
const rankVal = o => { const cn = Math.min(1.5, Math.log(Math.max(sim[o.key].p50,1)/cminAll)/Math.log(4)); … };
```

Vorschlag: `S.riskQ ∈ {0.5, 0.75, 0.9}`, `simulate()` liefert zusätzlich `p75`, und `rankVal` sowie
`cminAll` benutzen `sim[o.key][S.riskQ]`. Drei Zeilen. Beschriftung: „Wir vergleichen bei P50 (mittlerer
Fall) / P75 (vorsichtig) / P90 (Worst-Case-nah)".

**Ehrliches Ergebnis: die Rangfolge dreht in keinem Preset** (je 4.000 Ziehungen, P50/P75/P90/P95 geprüft
für Mittelstand H = 5, Konzern H = 5 und H = 10, Großkonzern H = 5 und H = 10). Die Spannen sind zu ähnlich
(P90/P10 = 1,46 bis 1,80). Was sich ändert, ist der **Abstand**, und zwar erheblich:

| Konzern H = 5 | P50 | P75 | P90 |
|:--|--:|--:|--:|
| Paid | 628 k€ | 705 k€ | 781 k€ |
| OSS | 549 k€ | 642 k€ | 739 k€ |
| Vorsprung OSS | **−78 k€** | −62 k€ | **−42 k€** |

Der Vorsprung von OSS halbiert sich, wenn man vorsichtig rechnet — weil OSS die breitere Verteilung hat
(1,79 gegen 1,56). Das ist genau die Information, die ein CFO für eine Werkzeugentscheidung braucht, und
sie steht heute nirgends. Der Schalter ist also kein Rangwechsler, sondern ein Abstandsmesser; so sollte er
auch beschriftet sein. Vorbedingung: 1.4 (Viewer-Deckel), sonst ist das P90 von Paid um rund 5 Punkte
relativ zu hoch.

---

## 5 · Korrelationen in der Simulation

### 5.1 Der eigentliche Fund: die vier Optionen werden unabhängig gezogen

```js
function simulate(key,N){ for (let i=0;i<N;i++){ seed=(987654+i*7919)>>>0; const c=calc(key,pert); … } }
…
const pd={}; OPTP.forEach(q=>{ if (P[q.id]!==undefined) pd[q.id]=draw(P[q.id]); });
```

Der Kommentar `T04` verspricht, dass Szenario *i* für alle vier Optionen dieselben globalen Annahmen zieht.
Für `GLOBAL` stimmt das. Für `OPTP` stimmt es **nicht**, aus zwei Gründen: erstens werden Parameter
übersprungen, die es für die Option nicht gibt (`devH` nur OSS, `lic`/`licSite`/`licInfl`/`licAdmH100` nur
Paid); zweitens verbraucht `pert()` über den Ablehnungs-Sampler in `gammaS()` eine **variable** Anzahl von
`rnd()`-Aufrufen. Der Zufallsstrom läuft nach dem ersten Parameter auseinander. Konsequenz: in Szenario *i*
kann Paid ein `reuseH` am unteren Rand ziehen und Core eines am oberen — obwohl es dasselbe Szenario,
dasselbe Team, dieselbe Woche sein soll. Der **Vergleich** der Optionen enthält damit Rauschen, das sich
herausrechnen ließe.

Minimale Reparatur: einen Sub-Seed je Parameter statt eines Stroms je Option, oder — sauberer und zugleich
Voraussetzung für 5.2 — ein Uniform je Parameter und eine Inverse-CDF-PERT:

```js
function pertQ(t,u){                                   // ersetzt pert(t) in der Simulation
  const lo=t[0], hi=t[2], m=Math.min(hi,Math.max(lo,t[1])); if (hi<=lo) return lo;
  const a=1+4*(m-lo)/(hi-lo), b=1+4*(hi-m)/(hi-lo);
  return lo + ibetaInv(a,b,u)*(hi-lo);                 // ibetaInv: 60 Bisektionsschritte auf ibeta()
}
// je Szenario i: EIN Uniform je Parameter-ID, für alle vier Optionen dasselbe
const U={}; GLOBAL.forEach(p=>U[p.id]=rnd()); OPTP.forEach(p=>U[p.id]=rnd());
// dann je Option: pertQ(S.p[key][id], U[id])
```

Messung, 2.500 gepaarte Szenarien, Differenz OSS − Paid:

| Mittelstand H = 5 | P50 Paid | P50 OSS | Differenz P10 / P50 / P90 | OSS < Paid |
|:--|--:|--:|:--|--:|
| heute (unabhängig) | 58.707 € | 76.463 € | −318 / **+17.290** / +37.725 € | **10,2 %** |
| gepaart | 58.709 € | 76.696 € | +7.084 / +18.270 / +29.642 € | **1,6 %** |

| Konzern H = 5 | P50 Paid | P50 OSS | Differenz P10 / P50 / P90 | OSS < Paid |
|:--|--:|--:|:--|--:|
| heute | 627.876 € | 551.881 € | −259.147 / −78.483 / +125.890 € | 68,6 % |
| gepaart | 625.495 € | 553.509 € | −204.523 / −64.486 / **+62.890** € | 72,4 % |

Die Mediane bleiben praktisch unverändert — der Fehler ist symmetrisch. Aber das Differenzband schrumpft um
40 bis 50 %, und die Kennzahl, die auf der Monte-Carlo-Facette ganz oben steht („Anteil der Szenarien, in
denen Open Source günstiger als Paid ist", Zeile 1290), springt im Mittelstand von 10,2 % auf 1,6 %.
**Neun von zehn dieser Szenarien sind heute Sampling-Rauschen, kein Sachverhalt.** Für ein Werkzeug, dessen
Autoren selbst ein OSS-Visual bauen, ist das die Zahl, die am saubersten sein muss.

### 5.2 Gemeinsamer Team-Skill-Faktor

Alle Stundenannahmen werden unabhängig gezogen: ein Szenario kann `setupH` am Maximum und `reuseH` am
Minimum haben. Real ist ein Team, das beim Setup trödelt, auch beim Wiederverwenden langsam. Mit der
Inverse-CDF aus 5.1 ist die Kopplung eine Gauß-Copula mit einem einzigen latenten Faktor:

```js
const HOURP = new Set(['setupH','devH','firstH','reuseH','trainH','lightH','rampH','fixH',
                       'supH100','govIntake','govRun','govAudit','maint','events','learn','licAdmH100']);
// einmal je Szenario, für ALLE vier Optionen identisch (es ist dasselbe Team):
const zs = ninv(rnd());
// je Stundenparameter:
const z  = ninv(rnd());
const u  = ncdf( rho*zs + Math.sqrt(1-rho*rho)*z );      // rho neu in GLOBAL, z. B. [0.3, 0.6, 0.8]
value    = pertQ(S.p[key][id], u);
```

`ninv` (Acklam) und `ncdf` (Zelen-Severo) sind je ~10 Zeilen; `ibetaInv` braucht `lgamma` + Kettenbruch,
zusammen ~35 Zeilen. Bei 4 × 2.000 Ziehungen × ~25 Parametern läuft das in JS im Bereich einer Sekunde.

Messung mit ρ = 0,6 gegen den gepaarten Lauf ohne Kopplung:

| | Spanne P90/P10 Paid | OSS | Core | Differenz OSS−Paid P10/P90 |
|:--|--:|--:|--:|:--|
| Mittelstand, gepaart | 1,46 | 1,54 | 1,60 | +7.084 / +29.642 € |
| Mittelstand, + Skill 0,6 | **1,61** | **1,81** | **1,84** | +5.263 / +32.549 € |
| Konzern, gepaart | 1,55 | 1,72 | 1,78 | −204.523 / +62.890 € |
| Konzern, + Skill 0,6 | **1,57** | **1,84** | **1,87** | −206.667 / +73.306 € |

Genau das erwünschte Verhalten: das **Niveau**-Band wird deutlich breiter (bis +18 % Spanne, weil sich
15 unabhängige Stundenannahmen heute gegenseitig glattmitteln — ein Portfolioeffekt, den es in der Realität
nicht gibt), das **Differenz**-Band bleibt eng, weil der Skill-Faktor allen vier Optionen gemeinsam ist.
Die Aussage „so viel kostet es" wird ehrlicher unsicher, die Aussage „dieser Ansatz ist günstiger als jener"
bleibt scharf. Betroffen sind am stärksten die Ansätze mit vielen Stundenposten: OSS, Deneb, Core.

Ein zweiter, kleinerer Kandidat für dieselbe Mechanik: `events` und `fixH` sind heute unabhängig, obwohl
eine instabile Plattform-Phase beides gleichzeitig hochtreibt. Dasselbe gilt für `govIntake`, `govRun` und
`govAudit` (eine strenge Organisation ist überall streng). Beide würden vom Skill-/Strenge-Faktor
automatisch miterfasst, wenn man sie in `HOURP` aufnimmt — was oben bereits geschehen ist.

---

## Reihenfolge, wenn nur Zeit für drei Dinge ist

1. **Gepaarte Ziehung (5.1).** Billigster Eingriff, größte Wirkung auf die Aussage, die am meisten unter
   Interessenverdacht steht. Kein Parameter ändert sich, keine Rangfolge dreht, nur das Rauschen geht raus.
2. **Die Jahresschleife (2).** Macht Barwert, Invest, Break-even und Kumulativ-Chart überhaupt erst
   belastbar; repariert nebenbei 1.1 bis 1.6 gemeinsam.
3. **Viewer-Deckel (3.4).** Eine Zeile, verhindert dass jedes Ergebnis bei H ≥ 7 im oberen Band unbrauchbar
   ist — Voraussetzung für den Risikoaversions-Schalter.

Der Exit-Term (3.3) und der Skill-Faktor (5.2) sind die beiden Ergänzungen, die inhaltlich am meisten
hinzufügen, aber beide brauchen je einen neuen Annahmensatz und damit eine eigene Begründung.

## Was nicht geprüft wurde

- Keine Netzrecherche. Alle Belege stammen aus dem Rechner selbst und aus der Rechnung.
- `calcSQ()` (Null-Option) hat dieselben Zeitfehler (`build` auf `reportsTotal` in Jahr 0, `sqMaint` auf dem
  Endbestand, `read` über `vAvg × H`). Weil die Null-Option außerhalb der Rangfolge steht und ihre
  Parameter ohnehin unbelegt sind, habe ich sie nicht durchgerechnet — die Schleife aus Abschnitt 2 lässt
  sich aber eins zu eins übertragen.
- Die Koexistenz zweier Ansätze (offener Punkt 4 im Audit-README) ist ein Mengen-, kein Zeitproblem und
  bleibt hier außen vor.

Reproduktion: `/tmp/…/scratchpad/core.js` (extrahierter Kern), `yearmodel.js` (Jahresmodell), `mc.js`
(Inverse-CDF-PERT, gepaarte Ziehung, Skill-Copula). Nicht dauerhaft abgelegt; alle Formeln stehen oben.
