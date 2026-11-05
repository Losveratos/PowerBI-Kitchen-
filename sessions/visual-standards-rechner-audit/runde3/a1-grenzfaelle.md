# Runde 3 · A1 · Grenzfälle und Invarianten des Rechenkerns · Visual-Standards-Rechner v0.22

**Stand:** 05.11.2026 · **Grundlage:** `visual-standards-rechner.html` (Branch `feat/rechner-review`, 6.016 Zeilen), gelesen: `calc()` Z. 3811–4034 mit Jahresschleife, `calcSQ()` Z. 4054–4079, `simulate()` Z. 4035–4051, `writeHash()`/`readHash()` Z. 4973–5011, `applyParamEdit()` Z. 4243–4249 · **Werkzeug:** `runde3/a1-grenzfaelle.test.js` (Playwright, Harness aus `tests/rechner/lib/harness.js`), Protokoll in `a1-grenzfaelle.log` · **Methode:** Erwartung vor dem Rechnen aus der gelesenen Formel formuliert, dann gemessen. Die HTML-Datei ist unverändert.

**Zählung:** 13 Pflichtfälle plus 13 Zusatzfälle, 187 Einzelprüfungen, davon 180 bestanden. Die 7 Fehlschläge sind bewusst stehen gelassene Zusicherungen, die einen Befund markieren. **7 Befunde: 2 mittel, 5 niedrig.** Kein Befund betrifft die Voreinstellungen oder die fünf Presets; alle liegen an Rändern, die eine Eingabe oder ein Link erreichen kann.

Basis-Szenario, wenn nichts anderes steht: Voreinstellung (3 Ersteller, 40 Viewer, 12 Reports, 5 Chart-Typen, Horizont 5, Mittelstand), Viewer-Wachstum fest auf 0 · 10 · 20 %. Alle Beträge sind Erwartungswerte über `expected()`, also PERT-Mittel; Simulationen laufen mit 2.000 Szenarien.

---

## 1 · Ergebnis je Fall

### Fall 1 · Horizont 3 / 5 / 10

**Erwartung.** Jeder Jahresposten in der Schleife ist ein Produkt nicht-negativer Größen, also ist jedes `cf[y] ≥ 0` und die Summe monoton in H. Kosten je Jahr dürfen sinken (Aufbau, Freigabe und Erstschulung verteilen sich auf mehr Jahre), aber nicht unter die Hälfte fallen. `cf` hat genau H Einträge.

**Ergebnis.**

| Ansatz | H = 3 | H = 5 | H = 10 | je Jahr H3 → H10 | Faktor |
|:--|--:|--:|--:|--:|--:|
| Paid | 47.816 € | 69.045 € | 142.690 € | 15.939 → 14.269 € | 0,90 |
| OSS | 57.087 € | 79.076 € | 140.773 € | 19.029 → 14.077 € | 0,74 |
| Deneb | 69.816 € | 94.628 € | 161.397 € | 23.272 → 16.140 € | 0,69 |
| Core | 87.526 € | 121.470 € | 211.812 € | 29.175 → 21.181 € | 0,73 |

Monoton in allen vier Ansätzen, keine NaN/Infinity, `cf.length = H`. Der Paid-Faktor liegt nahe 1, weil die Lizenz jedes Jahr neu anfällt und mit 6 % steigt; bei den Stunden-Ansätzen dominieren die Einmalposten.

**Bewertung:** in Ordnung.

### Fall 2 · Viewer 0, Viewer 1, 1 Ersteller mit 100.000 Viewern

**Erwartung.** Alle Teiler in `calc()` sind geschützt (`Math.max(1, S.creators)`, `cprW || 1`, `Math.max(users, 1)`), `perDivisor()` nutzt `Math.max(v, 1)`. Bei 0 Viewern bleibt eine Paid-Lizenz über das Mindestpaket (5 Einheiten für die Ersteller). Die Seite darf nirgends `NaN` zeigen.

**Ergebnis.** Alle Erwartungswerte, Posten, Zahlungsströme und Simulationsquantile endlich und nicht negativ. Seite nach `update()` ohne `NaN`/`Infinity`/`undefined`. Viewer 0: Paid 50.654 €, Lizenz 2.396 € (Mindestpaket), Break-even 82 Viewer. 1 Ersteller mit 100.000 Viewern: Paid 13,79 Mio. €, OSS 4,97 Mio. €, Deneb 5,27 Mio. €, Core 7,68 Mio. €; Break-even 51 Viewer.

**Bewertung:** in Ordnung.

### Fall 3 · Adoptionsgrad 0 %

**Erwartung.** Mit `ad = 0` (Z. 3921) entsteht kein Chart nach dem Standard; der Rollout läuft über `n·w·sqChartH·comp` (Z. 3947), die Wartung des Ad-hoc-Bestands über `sqMaint`, der Anwender-Support über `sqSupH100`. Der Rollout sollte deshalb `SQ.build` entsprechen. Zwei Abweichungen sind in der Formel sichtbar: `calc()` bewertet den Ad-hoc-Rollout mit `rate0` (Mischsatz intern/extern), `calcSQ()` mit dem reinen Innensatz; und `calc()` nimmt für die Klassen B und C die Komplexitätsfaktoren des Ansatzes (`cxOwn`), `calcSQ()` die von Core. Wartung und Governance bleiben über der Null-Option, weil Baukasten-Wartung, Breaking-Fixes, Governance-Betrieb, Audit und Konformitätsprüfung weiterlaufen; das ist der Preis eines ungenutzten Standards und gewollt.

**Ergebnis.** Rollout(ad = 0) gegen SQ.build = 20.872 €: Paid +5,2 %, OSS +6,5 %, Deneb +18,4 %, Core +16,6 %. Mit `ext = 0` und Core-Komplexitätsfaktoren für alle vier Ansätze trifft der Rollout die Null-Option auf den Cent (20.871,50 €, viermal). Die Gesamtsumme bei ad = 0 liegt deutlich über der Null-Option ohne Leserzeit (47.203 €): Paid 95.092 € (Fix 32.660 €, davon Lizenz 19.164 € für alle Viewer; variabler Overhead +32 %), OSS 92.413 € (+59 %), Deneb 108.648 € (+64 %), Core 114.802 € (+92 %).

**Bewertung:** in Ordnung als Rechenlogik. Die Erwartung „nahe an der Null-Option“ gilt nur für den Rollout; die Summe trägt systematisch den Overhead. Zwei Hinweise ohne Befundcharakter: (a) der Ad-hoc-Anteil wird mit dem Mischsatz des Ansatzes bewertet, obwohl ad hoc gebaute Charts der Fachbereich selbst macht; (b) die Paid-Lizenz läuft bei 0 % Adoption für alle Viewer weiter, was sachlich stimmt (gekauft ist gekauft), aber in der Karte nicht erklärt wird.

### Fall 4 · IBCS verbindlich für alle Reports

**Erwartung.** `lvs = 1` (Z. 3881) statt des PERT-Mittels von 60/85/100 = 0,8333; Klasse A läuft über den Ansatz (`cls[0].core = false`, Z. 3845), also `shCore = 0` und `indep = 0`. Paid-Lizenz steigt mit der Lizenzbasis von 0,8333·V + C auf V + C; der Lizenzblock der drei anderen Ansätze bleibt gleich.

**Ergebnis.** `licViewerShare` 0,8333 → 1. Paid-Lizenz 18.624 → 22.457 € (+20,6 %). `shCore` 0,5373 → 0 und `indep` 17.061 → 0 € in allen vier Ansätzen. Lizenzblock OSS 833 €, Deneb 2.500 €, Core 0 € unverändert. Gesamtsummen: Paid 69.045 → 65.661 € (−4,9 %), OSS −1,7 %, Deneb −1,3 %, Core +1,7 %.

**Bewertung:** in Ordnung. Beobachtung für den Text: die IBCS-Pflicht macht Paid in der Summe **billiger**, obwohl die Lizenz um ein Fünftel steigt, weil 54 % der Charts (Klasse A) von Core-Stunden (4 h je Chart) auf Paid-Stunden (1 h) wechseln. Das ist Modellkonsequenz, keine Panne, wird aber auf einer Bühne als Widerspruch gelesen, solange es nicht dasteht.

### Fall 5 · Aktives Anbieter-Angebot

**Erwartung.** `offerPatch()` (Z. 3758) setzt `lic = 50`, `support = 0` (Support enthalten), `minTerm = 1`; `licModelEff()` liefert `peruser`, also `staffelD = 1` (Z. 3874), das Mindestpaket `packU` bleibt (Z. 3876). Lizenz = Σ_y packU(V_y·lvs + C)·inf^y·50 € mit `inf` aus der Paid-Annahme `licInfl` (Angebot ohne Gleitklausel). `S.licModel = 'staffel'` darf nicht durchschlagen.

**Ergebnis.** `lic 50, support 0, minTerm 1, peruser, Angebot „X“`. Lizenz 13.693,97 € = Handformel 13.693,97 € (Einheiten 40/40/50/50/60, inf 1,06). Mit Staffel wären es 10.955 €, die Staffel ist also aus. Ohne Angebot: Anker 85 € (PERT-Mittel von 40/80/150), Modell Staffel, Lizenz 18.624 €. Ungültiger `offerOn = 7` fällt auf den Anker zurück, `offer = null`.

**Bewertung:** in Ordnung. Nebenbefund zur Erwartung selbst: der „Anker 80 €“ im Sprachgebrauch ist der Modus; gerechnet wird mit 85 €. Das steht korrekt in `handrechnung.test.js`, nicht aber in jeder Erläuterung.

### Fall 6 · Budgetfreigabe erst im Folgejahr

**Erwartung.** `bnY = min(1, H−1) = 1` (Z. 3920), Wartejahr: `cf[0] = cfHard[0] = cfSoft[0] = hoursIntY[0] = 0` (Z. 3933). Σcf = total, weil die Summe über dieselben Jahresposten läuft. Aus der Formel folgen drei Nebenwirkungen: `fteY1 = hoursIntY[0]/1500 = 0` (Z. 4001), `yearly = (total − invest)/H` teilt durch H statt H − 1 (Z. 3999), und bei `rolloutYears ≥ H` fällt die letzte Tranche des Bestands aus dem Horizont, weil `ye < RY` in Betriebsjahren zählt (Z. 3940), während `calcSQ()` den Bestand ohne Wartejahr vollständig baut (Z. 4069).

**Ergebnis (H = 3).** Alle vier Ansätze: `cf[0] = 0`, Σcf = total auf den Cent (Paid 40.165 €, OSS 47.655 €, Deneb 59.037 €, Core 72.720 €), Jahr 2 trägt die Einmalkosten. `fteY1 = 0` in allen Ansätzen, `hoursIntY` Paid 0/180/95 h. `yearly` Paid 7.476 € gegen 11.214 € je tatsächlichem Betriebsjahr. Mit `rolloutYears = 3`: `reportsTotal` 11,40 statt 17,09, also werden 4 der 12 Bestandsreports nie gehoben, die Null-Option baut alle 12.

**Bewertung:** Kern in Ordnung; **Befund B7 (niedrig)** für die drei Nebenwirkungen.

### Fall 7 · CapEx an / aus

**Erwartung.** `calc()` liest `S.capex` nicht; es weist nur `c.capexBase = A` aus (Z. 4019). Summe, Posten und Zahlungsstrom sind identisch, nur die GuV-Zeile (Z. 4514) ändert sich um `capexBase·(1 − 1/life)`.

**Ergebnis.** Alle vier Ansätze: Summe, acht Posten und `cf` identisch (Paid 69.045,41 € beidseitig). GuV-Wirkung im ersten Betriebsjahr: Paid 24.145 → 18.206 € (aktivierbar 7.423 € = 10,8 % der Summe), OSS 29.063 → 23.995 €, Deneb 37.644 → 31.785 €, Core 43.927 → 37.518 €. Die GuV-Zeilen stehen nur bei eingeschalteter Aktivierung in der Tabelle.

**Bewertung:** in Ordnung.

### Fall 8 · Viewer-Deckel unter der Viewerzahl

**Erwartung.** `V(y) = min(V·gr^y, cap)` (Z. 3873). Mit cap = 20 < V = 40 ist V(y) = 20 in **jedem** Jahr, auch im Jahr 0; der Deckel kappt nicht das Wachstum, er ersetzt die Eingabe. Lizenzbasis je Jahr = packU(20·0,8333 + 3) = 20 Einheiten, `vAvg = 20`.

**Ergebnis.** 20,000 Einheiten je Jahr, Lizenz 9.583 € statt 18.624 €, `vAvg = 20`. Deckel 20 bei 40 Viewern und 10 % Wachstum ergibt in allen vier Ansätzen **auf den Cent** dasselbe wie 20 Viewer ohne Wachstum (Paid 58.703,92 €, OSS 77.573,41 €, Deneb 93.144,85 €, Core 119.425,47 €). Kein Hinweis in `conflicts()`, der Handler (Z. 5416) prüft nur `v ≥ 0`.

**Bewertung:** Lizenz wächst wie gefordert nicht über den Deckel; **Befund B6 (niedrig)**, weil die Eingabe stillschweigend überschrieben wird.

### Fall 9 · Bestand 60 Reports auf Paid, Wechsel

**Erwartung.** `doSwitch` nur für `key ≠ baseline` (Z. 3890); Migration = 60·rprLib·migFactor·rate0 > 0 für OSS/Deneb/Core, 0 für Paid. Der Bestand zählt in jedem Ansatz in die Prüf-Stichprobe (`stockRep`, Z. 3928) und in die Ausstiegs-Kennzahl.

**Ergebnis.** Paid Migration 0 €; OSS 126.671 € (59,0 % der Summe), Deneb 157.373 € (60,3 %), Core 207.530 € (61,4 %). Ohne Bestand überall 0. Governance steigt um 4.076 € (Paid) bzw. 8.825–8.907 € (Stunden-Ansätze), Ausstieg Paid 34.917 → 136.969 €.

**Bewertung:** in Ordnung.

### Fall 10 · Gepaarte vs. ungepaarte Ziehung

**Erwartung.** `expected()` zieht mit `pertMean`, der Schalter greift nur bei `draw === pert` (Z. 3812): Erwartungswert identisch. P50 aus 2.000 Szenarien weicht unter 3 % ab.

**Ergebnis.** Erwartungswert viermal auf den Cent gleich. P50 gepaart/ungepaart: Paid 68.492/68.384 (−0,16 %), OSS 78.089/77.906 (−0,23 %), Deneb 92.833/93.036 (+0,22 %), Core 117.765/120.768 (**+2,55 %**); P90 Core 202.052/208.598 (+3,2 %).

**Bewertung:** in Ordnung, Core knapp unter der Toleranz. Core hat die breiteste Verteilung (Panelwerte 10–27 h je Chart-Typ) und reagiert deshalb am stärksten auf die Kopplung der Zufallsströme. Für Aussagen auf 1 % genau reichen 1.500 Szenarien (Standard in `update()`) bei Core nicht.

### Fall 11 · Share-Link-Rundlauf

**Erwartung.** `writeHash()` → `defaults()` → `readHash()` stellt S feldweise wieder her. Zweiter Teil: `readHash()` setzt `S.mixOv` nur im `if`-Zweig (Z. 4998) und nirgends zurück; ein Link ohne Override, in eine Sitzung mit Override geladen, behält den Override.

**Ergebnis.** Gesetzt wurden 7 Ersteller, 333 Viewer, 41 Reports, H 10, Hybrid 40 %, Pro-Nutzer, Bestand 17 auf Deneb, zwei Red Flags, Bibliothek, ungepaart, P75, Deckel 900, 4 Modelle, Datei-Import, Mengen-Unsicherheit 10 %, CapEx an/3 Jahre, eigene Report-Klassen, IBCS-Pflicht, Mix-Override 40/35/25, zwei Angebote (zweites aktiv, Site-Pauschale mit Rabatt und Gleitklausel), Anker Blindschätzung, geänderte Annahmen, Prio-Änderung, Ebene 3, Gewichtung 55. Link 6.151 Zeichen. Nach dem Rundlauf **keine** Abweichung in S (rekursiver Vergleich aller Felder), Erwartungswert Paid 460.838,57 € vor und nach. `rc.m` wird wiederhergestellt (85/15/0). **Aber:** Link ohne `mv` in Sitzung mit `mixOv = [40,35,25]` → `mixOv` bleibt `[40,35,25]`.

**Bewertung:** Rundlauf in Ordnung; **Befund B5 (niedrig)**.

### Fall 12 · Raster Ersteller × Viewer × Horizont

**Erwartung.** 4 × 4 × 3 = 48 Kombinationen, je vier Ansätze: alles endlich und ≥ 0, Σ Posten = total (0,5 €), Σcf = total (0,5 €), `cf.length = H`, hart + weich = total.

**Ergebnis.** 192 Rechnungen, keine Abweichung. Max |Σcats − total| = 0 (die Summe ist per `Object.values(c).reduce` definiert), max |Σcf − total| = 2,8·10⁻⁹ €. Summen von 35.537 € (1 Ersteller, 10 Viewer, H 3) bis 7,66 Mio. € (200 Ersteller, 10.000 Viewer, H 10).

**Bewertung:** in Ordnung.

### Fall 13 · Monotonie

**Erwartung Viewer.** Mehr Viewer, sonst gleich → Paid nie billiger. Aus Z. 3874 folgt das Gegenteil an den Staffelgrenzen: `staffelD` ist eine Stufenfunktion auf **alle** Einheiten, 100·0,8 = 80 > 110·0,6 = 66. Ohne Wachstum liegt die erste Klippe bei 116 → 117 Viewern (packU(116·0,8333 + 3) = 100 → 110); mit 10 % Wachstum rutscht sie in spätere Jahre und damit auf kleinere Eingaben. Bei Modell „pro Nutzer“ muss die Lizenz monoton sein. **Erwartung Ersteller.** `build = A` hängt nicht von Erstellern ab (gleich), Schulung und Rollout steigen.

**Ergebnis.** Sweep 10…6.000 Viewer (Staffel, 10 % Wachstum): **19 Rückgänge** der Paid-Summe, z. B. 79 → 80 Viewer −1.417 € (Lizenz −1.502 €), 87 → 88 −684 €, 405 → 410 **−7.300 €** (Lizenz −7.565 €), 445 → 450 −6.390 €. Ohne Wachstum, 116 → 117 Viewer: Lizenz 38.332 → 31.624 € (**−17,5 %**), Summe 93.517 → 86.906 €. `staffelCliff()` (Z. 3794) meldet 0, weil sie nur die reduzierte gegen die volle Lizenzbasis vergleicht. Pro Nutzer: 0 Rückgänge. OSS/Deneb/Core: monoton. Ersteller 1…200: Aufbau konstant (Paid 7.423 €), Schulung Paid 2.485 → 224.089 €, Rollout 13.214 → 552.491 €, alle monoton.

**Bewertung:** Ersteller in Ordnung; **Befund B1 (mittel)** für die Staffel.

### Zusatz Z1 · Rollout-Jahre > Horizont, 20 Modelle, Verteilweg Datei, Stunden-Anker, Mengen-Unsicherheit

- `rolloutYears = 20` bei H = 3: `RY = min(H, …) = 3`, `reportsTotal` 17,087 wie bei RY = 3 und wie die Null-Option; endlich. **In Ordnung.**
- 20 Semantikmodelle: `modF` = 1,95 (Paid/OSS), 3,85 (Deneb), 10,50 (Core), Aufbau skaliert exakt (Core 8.012 → 84.125 €, Summe 121.470 → 351.150 €). **In Ordnung**, Faktor 10,5 ist eine Aussage über die Annahme, nicht über die Rechnung.
- Verteilweg Datei: Governance Paid 8.204 → 9.669 €, Core 7.683 → 7.932 €; Wartung steigt über Breaking-Fixes ×1,3; Lizenz unverändert. **In Ordnung.**
- Anker Konservativ (×1,5): Paid +28,0 %, OSS +45,4 %, Deneb +44,2 %, Core +55,7 %, Lizenz unverändert; Blindschätzung günstiger als Panel in allen vier. **In Ordnung.**
- Mengen-Unsicherheit 20 %: `simulate()` stellt Ersteller/Viewer/Reports/cpr/Typen wieder her (3/40/12/6,7/5), Erwartungswert unverändert, P50 68.492 → 68.478, P10–P90-Band 48.523 → 48.925 €. **In Ordnung** und deckungsgleich mit dem Hinweistext („nur um wenige Prozent breiter“: hier 0,8 %).

### Zusatz Z2 · Eingaben ohne Obergrenze

**Erwartung.** `applyParamEdit()` (Z. 4245) prüft nur die Untergrenze; `learn`, `prodGain` und `ext` tragen kein `max` (Z. 4232 schreibt `max` nur, wenn definiert; Abfrage liefert `{}`), `readHash()` klemmt mit `cl()` nur auf [min, 10⁹]. Aus `learnSeg` (Z. 3863): `lrn = 50` → `be = 1`, `al = 0` → `(x⁰ − y⁰)/(0·(b−a))` = 0/0 = NaN; `lrn = 100` → `log(0)` → NaN; `lrn → 100` → `10^be` explodiert. `prodGain > 100` → `prod < 0`, `pf` wechselt das Vorzeichen (Z. 3909). `ext > 100` → `rate0` mit negativem Innenanteil (Z. 3838), `cfSoft` und `hoursIntY` negativ.

**Ergebnis.**
- Lernrate **100 %**: total, rollout, maint, risk = NaN. Seite nach `update()`: Headline zeigt „–“ (`fmtEur` fängt), aber an fünf Stellen steht „NaN“ (`fmtN`), dazu 43 Konsolenfehler aus SVG-Attributen (`<rect width="NaN">`, `<path d="… NaN">`).
- Lernrate **exakt 50 %**: NaN (hebbare Singularität; 49 % → Rollout 20.796 €, 51 % → 21.845 €, stetig).
- Lernrate 99,9 %: Rollout 2,16·10¹⁴ € (Default 13.214 €).
- Produktivitätsgewinn 150 %/Jahr: Summe 51.561 € statt 69.045 €, keine sichtbar negative Aggregatzahl, aber alternierende Jahresfaktoren.
- Externer Anteil 150 %: `cfSoft[0]` = −2.844 €, `hoursIntY[0]` = −33,7 h.
- Fluktuation 300 %/Jahr: endlich, Schulung 84.534 € (dreifache Nachschulung, kein Deckel; vertretbar).

**Bewertung:** **Befund B2 (mittel)** Lernrate, **B3 (niedrig)** ext, **B4 (niedrig)** prodGain.

### Zusatz Z3 · Mengengerüst-Ränder

- Report-Klassen mit 0 Charts je Klasse: `cprW || 1` greift, Rollout 0, `compMult` 0, `S.cpr` wird 1; Summen endlich (Paid 45.127 €). **In Ordnung.**
- Wachstum −100 %: Viewer ab Jahr 2 = 0, `vAvg` = 8, endlich. **In Ordnung.**
- Staffelklippe der Lizenzbasis: siehe Fall 13; `staffelCliff()` deckt den Fall „volle Basis, Staffelsprung durch Wachstum oder Eingabe“ nicht ab.

---

## 2 · Befunde

Reihenfolge nach Schwere, dann nach Nähe zur Voreinstellung. Zeilen beziehen sich auf `visual-standards-rechner.html` im geprüften Stand. Vorschläge sind Vorschläge; nichts davon ist umgesetzt.

| # | Schwere | Befund | Wo | Zahlen | Vorschlag |
|:--|:--|:--|:--|:--|:--|
| **B1** | mittel | **Volumenstaffel macht Paid bei mehr Viewern billiger.** `staffelD` ist eine Stufenfunktion auf alle Einheiten; an jeder Grenze (25/100/500/2.000/5.000 Einheiten) fällt die Lizenz des Jahres um 17–30 %. Mit Wachstum wandern die Klippen in spätere Jahre und treffen damit beliebige Eingaben. `staffelCliff()` warnt nur vor der Variante „reduzierte Basis schlechter als volle“ | Z. 3874 (`staffelD`), Z. 3943 (Lizenz des Jahres), Z. 3794–3802 (`staffelCliff`) | 19 Rückgänge im Sweep 10…6.000 Viewer; 405 → 410 Viewer: Summe −7.300 €; ohne Wachstum 116 → 117 Viewer: Lizenz −17,5 % | Entweder Grenzpreis-Staffel (jede Stufe gilt nur für die Einheiten oberhalb der Schwelle) oder lineare Interpolation des Faktors zwischen den Stützstellen; mindestens eine Erweiterung von `staffelCliff()`, die auch den Sprung der vollen Basis zwischen den Jahren meldet. In den Prämissen benennen: „Staffel auf alle Einheiten, wie bei den belegten Listen; dadurch kann mehr Nutzer weniger kosten“ |
| **B2** | mittel | **Lernrate ohne Obergrenze: 50 % ergibt NaN, 100 % ergibt NaN, dazwischen explodiert der Rollout.** Das Feld hat kein `max`, der Handler prüft nur die Untergrenze, der Link-Leser klemmt nur auf 10⁹. Die Seite zeigt dann „–“ in der Headline, „NaN“ in fünf Zahlen und wirft 43 SVG-Fehler | Z. 3863 (`learnSeg`), Z. 3585 (Definition ohne `max`), Z. 4245 (`applyParamEdit`), Z. 5002 (`cl()` in `readHash`) | 50 % → NaN; 99,9 % → Rollout 2,16·10¹⁴ €; 49 % → 20.796 €, 51 % → 21.845 € | `max: 45` am Parameter; in `applyParamEdit` und `cl()` auch die Obergrenze prüfen; in `learnSeg` den Fall `al === 0` über den Grenzwert (`ln((b+.5)/(a+.5))/(b−a)·10`) oder schlicht per Deckel ausschließen. Im Untertitel den Gültigkeitsbereich der Wright-Kurve nennen |
| **B3** | niedrig | **Externer Anteil > 100 % liefert negative interne Zeit.** `ext` ist nicht auf 1 geklemmt, `rate0 = rateInt·(1−ext) + rateExt·ext` wird mit negativem Innenanteil gebildet | Z. 3838 | ext = 150 %: `cfSoft[0]` −2.844 €, `hoursIntY[0]` −33,7 h | `Math.min(1, Math.max(0, p('ext')/100))`, `max: 100` am Parameter |
| **B4** | niedrig | **Produktivitätsgewinn > 100 % kehrt das Vorzeichen der Jahresfaktoren.** `prod = 1 − prodGain/100` wird negativ, `pf = prod^ye` alterniert; Aggregate bleiben positiv und verschleiern das | Z. 3909 | 150 %/Jahr: Summe 51.561 € statt 69.045 € | `max: 100` (fachlich eher 50) und Klemmen von `prod` auf [0, 1] |
| **B5** | niedrig | **`readHash()` setzt `S.mixOv` nicht zurück.** Ein Link ohne Chart-Mix-Override, in eine Sitzung mit Override geladen, behält den Override; alle anderen optionalen Felder werden gesetzt oder haben einen Default-Zweig | Z. 4996–5000 | `mixOv` bleibt [40,35,25] | Vor dem Block `S.mixOv = null;` setzen, analog zu `S.offers = []` in Z. 4989 |
| **B6** | niedrig | **Viewer-Deckel unter der Viewerzahl ersetzt die Eingabe still.** `min(V·gr^y, cap)` greift schon im Jahr 0; kein Hinweis in `conflicts()`, der Eingabe-Handler prüft nur `≥ 0` | Z. 3873, Z. 4056 (`calcSQ`), Z. 5416 (Handler) | Deckel 20 bei 40 Viewern = 20 Viewer ohne Wachstum, auf den Cent (Paid 58.703,92 €) | Handler: `S.viewerCap = Math.max(S.viewers, v)` oder Hinweis in `conflicts()`: „Deckel liegt unter der Viewerzahl, gerechnet wird mit dem Deckel“ |
| **B7** | niedrig | **Budgetfreigabe im Folgejahr: drei Nebenwirkungen.** (a) Bei `rolloutYears ≥ H` fällt die letzte Bestandstranche aus dem Horizont, die Null-Option baut den Bestand vollständig; (b) `fteY1` und `capWarn` messen das leere Wartejahr; (c) `yearly` teilt durch H statt durch die Betriebsjahre | Z. 3940 (`ye < RY`), Z. 4001 (`fteY1`, `capWarn`), Z. 3999 (`yearly`), Z. 4849 (Anzeige „erstes Jahr“) | H 3, RY 3: 11,40 statt 17,09 Reports (4 von 12 nie gehoben); `fteY1 = 0`; `yearly` 7.476 € statt 11.214 € je Betriebsjahr | `RY = Math.min(H − bnY, …)`; `fteY1 = hoursIntY[bnY]/1500` und `capWarn` darauf; `yearly = (total − invest)/(H − bnY)`; Spaltenkopf „erstes Betriebsjahr“ |

### Beobachtungen ohne Befundcharakter

1. **IBCS-Pflicht senkt die Paid-Summe** (−4,9 %) trotz +20,6 % Lizenz, weil Klasse A von 4 h auf 1 h je Chart wechselt. Konsistent mit v0.14, aber ein Satz in der Paid-Karte würde die Rückfrage vorwegnehmen.
2. **Adoption 0 %** lässt die Paid-Lizenz für alle Viewer stehen (19.164 €) und bewertet den Ad-hoc-Anteil mit dem Mischsatz des Ansatzes statt mit dem Innensatz der Null-Option. Beides ist vertretbar, beides steht nirgends.
3. **Core in der Simulation**: gepaart gegen ungepaart 2,55 % im P50, 3,2 % im P90. Bei 1.500 Szenarien im Standardlauf ist die zweite Nachkommastelle der Core-Quantile Rauschen.
4. **Zahlungsstrom und Posten** schließen in allen 192 Rasterrechnungen auf 10⁻⁹ €; die v0.20-Korrektur (Konformitätsprüfung im Zahlungsstrom) hält an jedem geprüften Rand.
5. **Angebotslogik** rechnet mit dem PERT-Mittel 85 € als Anker, nicht mit dem Modus 80 €. Richtig, aber im Sprachgebrauch leicht zu verwechseln.

---

## 3 · Was diese Prüfung nicht leistet

Sie prüft Invarianten und Ränder, nicht die Höhe einzelner Annahmen (das war Runde 2) und nicht die Bedienung. Die sieben Fehlschläge in `a1-grenzfaelle.test.js` sind bewusst stehen gelassen: wer einen der Befunde behebt, dreht die zugehörige Zusicherung um und bekommt grün. Die Suite läuft in rund zwei Minuten und kann nach `tests/rechner/` umziehen, sobald die Befunde entschieden sind.
