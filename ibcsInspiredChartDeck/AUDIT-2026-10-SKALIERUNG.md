# Audit Achsen-Skalierung · ChartKitchen byDatenWG

**Stand:** 2026-10-16 · Commit `8889cb7` · Quelle `ibcsInspiredChartDeck/src/visual.ts` (9 749 Zeilen), `src/settings.ts`, `capabilities.json`
**Anlass:** Kundenfrage eines Konzern-Interessenten: *„Ist die Skalierung immer richtig? Immer gleiche Achse – oder wo nötig eine Entscheidung per Button für eine geschnittene Achse beim Wasserfall."*
**Methode:** Ich habe alle Skalierungs-Codepfade gelesen (Domain-Berechnung in `render()`, `makePanelScale`, alle Renderer). Jeder Befund ist mit einem eigens gebauten Harness-Fall gerendert. Das Harness liegt **nur lokal** unter `…/scratchpad/harness/audit.html` und ist nicht im Repo. Code wurde nicht geändert. Der Stock-Harness (`npm run test:render`) rendert fehlerfrei.
**IBCS-Regeln:** CH 1.1 (keine abgeschnittenen Werteachsen bei Säulen/Balken), CH 2.1/UN 5.3 (Kappung nur mit Ausreißer-Marker), CH 4.1 (gleiche Einheit → gleiche Skala), UN 5.2 (Skalierungslinien/-bänder, wenn eine Skala abweichen muss), CO 5.1 (Small Multiples mit gleicher Skala), Notation: „Varianz-Säulen in gleicher Breite **und gleicher Skala** wie das Basis-Chart".

---

## Kurzantwort für den Konzern

* **Kernmodi (Säulen, Balken, Linie, Wasserfall, Tabelle):** Die Skalierung ist korrekt. AC, PY, PL, FC und BM teilen sich im Hauptpanel genau **eine** Skala. Diese beginnt immer bei 0. Small Multiples teilen sich Haupt- und Δ-Skalen. Über mehrere Visuals lässt sich die Skala mit „Skalen-Minimum-Maximum" synchronisieren. Ausreißer lassen sich mit Doppelstrich-Marker kappen.
* **Fünf kritische Lücken in Spezial- und Kombinationsmodi** (siehe S1–S5 und S13):
  * Doppel-Varianz zeichnet ΔPY und ΔPL in verschiedenen Skalen.
  * Das Brücken-Panel im Säulen-/Balken-Modus hat eine unmarkiert abgeschnittene Achse.
  * Kategorie-Brücke und Integrierte Brücke laufen bei Zwischenspitzen aus dem Chart.
  * Gestapelte Small Multiples skalieren je Kachel.
  * Bei Formaten wie „#,0 T€" sind die Einheiten-Labels um Faktor 1000 falsch.
* **Geschnittene Achse beim Wasserfall:** Gibt es heute nicht. Der Wasserfall ist immer nullbasiert. Bei großem Sockel schrumpfen Deltas von 1 % des Sockels auf etwa 2–3 px (Beleg S6). Ein IBCS-konformer Achsenschnitt per Format-Schalter **und** In-Chart-Chip ist mit den vorhandenen Mustern gut machbar: etwa **3,5–4 PT** für den Wasserfall, plus **1,5–2 PT** für die übrigen Brücken (Abschnitt c).

---

## (a) Befundliste

| ID | Schweregrad | Kurztitel | Beleg |
|---|---|---|---|
| S1 | **kritisch** | Doppel-Varianz: ΔPY- und ΔPL-Panels mit getrennten Skalen | audit-s17.png |
| S2 | **kritisch** | Brücken-Panel (waterfallStyle): Achse ohne Nullpunkt, ohne Bruchzeichen | audit-s4.png |
| S3 | **kritisch** | Kategorie-Brücke: Kaskade läuft über die Werte-Spalte hinaus | audit-s5.png |
| S4 | **kritisch** | Integrierte Brücke: Kaskade ragt über das Plot-Top hinaus | audit-s6.png |
| S5 | **kritisch** | Gestapelt: keine gemeinsame Skala in Small Multiples, fixedMax wirkungslos, Negative fallen weg | audit-s7.png |
| S13 | **kritisch** | Einheiten: Anker und Deltas getrennt auto-skaliert, „T€" wird zu „K€" (Faktor 1000) | audit-s2.png, audit-s12.png |
| S6 | mittel (Kern der Kundenfrage) | Wasserfall mit großem Sockel: Deltas kaum lesbar, kein Achsenschnitt | audit-s1.png, audit-s2.png, audit-s11.png |
| S7 | mittel | Wasserfall ignoriert fixedMax/capOverflow (kein Sync über Visuals) | audit-s3.png |
| S8 | mittel | Kappung markiert nur AC; PY/PL/BM werden stumm gekappt | audit-s8.png |
| S9 | mittel | Δ-Panels mit eigener Skala ohne Skalierungsindikator | audit-s9.png |
| S10 | mittel | Hero-Layout: gleiche Domain, aber andere px/Einheit | audit-s15.png |
| S11 | mittel | Balken-Multiples: Kategorienbreite je Kachel → andere px/Einheit | audit-s16.png |
| S12 | mittel | Per-Kachel-Skalen in Brücken (Default), GuV, Tabelle-Δ%, Kombi-Linie, Karten | audit-s12.png, audit-s13.png |
| S14 | kosmetisch | Shared Domains enthalten Gruppen jenseits von 24 Kacheln | Code |
| S15 | kosmetisch | Mindestgrößen übertreiben Kleinst-Deltas (0,5 / 2 / 4 px) | Code |
| S16 | kosmetisch | Kein fixedMin; Slope einzeln vs. Multiples mit unterschiedlicher Achslogik | Code |

---

### BEFUND-S1 · kritisch · Doppel-Varianz: ΔPY- und ΔPL-Panels in verschiedenen Skalen

* **Fundstelle:**
  * `visual.ts:2358-2361`: `abs`, `rel`, `abs2` und `rel2` sind **separate** `extent()`-Domains.
  * `visual.ts:7339-7346`: jeweils ein eigenes `makePanelScale`.
  * `visual.ts:2373-2379`: `fixedVarMax` wirkt nur auf `domains.abs`, nicht auf `abs2`.
  * Tabelle analog: `visual.ts:4747` (`dUnit`) gegenüber `visual.ts:4758` (`d2Unit`), getrennt aus `negD/posD` bzw. `neg2/pos2`.
* **Beleg:** `audit-s17.png`. Bei ΔPL = +2 und ΔPY = +20 (Faktor 10) sind beide Δ-Balken-Panels **exakt gleich hoch**. Bei den Pins gilt dasselbe: +1,7 % sieht aus wie +20 %.
* **Bewertung:** Gleiche Einheit (€ bzw. %) im selben Visual mit verschiedenen Skalen ohne Indikator verletzt CH 4.1 direkt. Ein Leser schließt fälschlich, dass die Abweichung zum Plan so groß ist wie die zum Vorjahr.
* **Fix-Skizze:** Die Domains vereinigen, also `abs ∪ abs2` und `rel ∪ rel2`, und `fixedVarMax` auf beide anwenden. In der Tabelle `dUnit = d2Unit = min(…)` setzen. Aufwand etwa 0,5 PT.

### BEFUND-S2 · kritisch · Brücken-Panel (Säulen/Balken + „Wasserfall-Brücke"): abgeschnittene Achse ohne Marker

* **Fundstelle:**
  * `visual.ts:351-359`: `extentTight` ohne Null-Anker.
  * `visual.ts:2395-2401`: `domains.bridge = extentTight(...)`.
  * `visual.ts:7349-7350`: Skala mit `bothEnds`.
  * `visual.ts:7493-7518`: Die **Anker-Balken** (PY- und AC-Total) werden ab `domains.bridge[0]` gezeichnet, also ab dem tiefsten Kaskadenstand und nicht ab 0.
* **Beleg:** `audit-s4.png` (PY 100 → AC 96, nur negative Deltas). Der PY-100-Balken ist ein kurzer Stummel (75 px für „4 Einheiten"). Der AC-96-Anker hat **die Länge 0**, es steht nur die Beschriftung „AC 96,0" da. Es gibt kein Bruchzeichen.
* **Bewertung:** Das ist faktisch schon ein Achsenschnitt, aber **unmarkiert**, und mit Balken als Totals (CH 1.1, UN 5.3). Der Code-Kommentar (2391-2394) begründet `extentTight` damit, dass es „keine Ankerbalken" gebe. Die Ankerbalken wurden aber später ergänzt (7489-7492), damit ist die Begründung hinfällig.
* **Fix-Skizze:** Entweder `extent()` (nullbasiert) verwenden oder denselben Achsenschnitt-Helper wie im Wasserfall (Abschnitt c) mit ⫽-Marker auf den Ankern einsetzen.

### BEFUND-S3 · kritisch · Kategorie-Brücke: Skala kennt die Kaskaden-Zwischenstände nicht

* **Fundstelle:**
  * `visual.ts:3441-3443`: `maxV = max(REF, ACt, otherTot)` berücksichtigt nur die Totals und weder laufende Kaskadenstände noch Kategoriewerte.
  * `visual.ts:3618-3631`: Bricks werden mit `X(cum)` ohne Clamp gezeichnet.
  * Bei gemeinsamer Skala gleich: `visual.ts:2453`.
* **Beleg:** `audit-s5.png` (PY 100, A +60 → Stand 160, dann −45, −25 → AC 90). Der A-Brick läuft durch die ΔPY%-Spalte bis über den Rand. Die Pins und Prozent-Labels (+300 %, −90 %) werden übermalt, B und C liegen in der Pin-Zone.
* **Bewertung:** Falsche Darstellung und Überlagerung. Das tritt bei jeder Struktur-Brücke mit gegenläufigen Treibern auf, sobald der Zwischenstand über PY und AC hinausgeht.
* **Fix-Skizze:** `maxV` über `max(REF, ACt, other, alle cum-Stände, alle p.value/p.py)` bilden und im Shared-Loop (2440-2462) spiegeln. Negative Kaskadenstände bräuchten zusätzlich ein `minV`.

### BEFUND-S4 · kritisch · Integrierte Brücke: Kaskade ragt aus dem Chart

* **Fundstelle:**
  * `visual.ts:3088-3090`: `maxTot = max(basisSum, vTot, py/pl-Summen)`, die laufenden Stände fehlen.
  * `visual.ts:3201-3218`: Segmente über `S(level)` ohne Clamp.
  * Shared: `visual.ts:2424`.
* **Beleg:** `audit-s6.png` (PY 60, Jan/Feb je +15 → Stand 90, dann 4× −8 → AC 58). Die Segmente liegen über der ΔPY%-Pin-Achse und über dem Titel, der Feb-Brick ist oben abgeschnitten.
* **Fix-Skizze:** Laufende Stände in `maxTot` aufnehmen, im Shared-Loop ebenso. Aufwand zusammen mit S3 etwa 0,5 PT.

### BEFUND-S5 · kritisch · Gestapelt (Stack-Series): keine gemeinsame Skala, kein fixedMax, negative Werte verschwinden

* **Fundstelle:**
  * `visual.ts:7136-7142`: `domain = [0, max(totals of THIS tile)]`, also immer lokal. `cfg.sharedScale` und `cfg.mainDomain` werden nicht gelesen, `fixedMax` und `capMax` ebenfalls nicht.
  * `visual.ts:7209-7211`: `Math.max(value, 0)`, negative Segmente werden nicht gezeichnet und fehlen im Total.
  * Der Format-Bereich zeigt die Skalen-Karte trotzdem an (`visual.ts:794`, columns/bars).
  * `capabilities.json:109` verspricht für die Multiples-Rolle „all sharing the same scale".
* **Beleg:** `audit-s7.png`. Nord (Total 3 900) und Süd (Total 390) sind **pixelgleich**.
* **Fix-Skizze:**
  * In `render()` eine geteilte Stack-Total-Domain über alle Gruppen bilden, etwa `domains.stack`, plus `fixedMax`.
  * Negative Werte entweder unter der Nulllinie stapeln oder mit Hinweis ablehnen.
  * Aufwand etwa 0,5–1 PT.

### BEFUND-S13 · kritisch · Einheitenmaßstab: Anker und Deltas mit getrennter Auto-Einheit, Präfix „T" geht verloren

* **Fundstelle:**
  * `visual.ts:2161-2163`: `maxAbs` und `maxVarAbs` werden getrennt ermittelt.
  * `visual.ts:2305-2306`: `fmt` und `fmtVar` sind getrennte Formatter.
  * `visual.ts:1180-1196`: Auto-Einheit ab 1e4 → „K".
  * `visual.ts:2990-2992`: Wasserfall-Anker mit `fmt`, Deltas mit `fmtVar`.
* **Beleg:**
  * `audit-s2.png`: GuV-Wasserfall mit Format „#,0 T€". Die Anker zeigen „100,0K€" und „90,0K€" (gemeint sind 100 000 T€ = 100 Mio €), die Deltas „+2.000 T€". Im selben Chart stehen also zwei Einheitensysteme, und das „K€" ist um **Faktor 1000 falsch**. Der Titel „Umsatz in K€" ist ebenfalls falsch.
  * `audit-s12.png` (GuV-Statement): „10,0K€" neben „+500 T€".
* **Bewertung:** Für Konzern-Controlling mit T€- bzw. Mio-Formaten ist das ein Vertrauensbruch. Der Befund steht bereits in `AUDIT-2026-07.md` (Abschnitt „kombi-stress", MEDIUM) und ist **weiterhin offen**. Ich stufe ihn hoch, weil er die Frage „ist der Maßstab richtig" direkt betrifft.
* **Fix-Skizze:**
  * Einen Formatter für Werte **und** Abweichungen derselben Einheit verwenden (gemeinsame Einheit aus `maxAbs`).
  * Bei einem Format-String mit eigenem Präfix (T€, Mio €) die Auto-Einheit unterdrücken oder korrekt multiplizieren.
  * Aufwand 0,5–1 PT.

### BEFUND-S6 · mittel (Kern der Kundenfrage) · Wasserfall mit großem Sockel: Deltas kaum lesbar, kein Schnitt möglich

* **Fundstelle:**
  * `visual.ts:2798/2808/2815/2823`: Anker immer `from: 0`.
  * `visual.ts:2880-2886`: Domain = `extent()` aller from/to-Werte, also nullbasiert, ohne Alternative.
  * `visual.ts:8907`: `drawBar` mit Mindesthöhe 0,5 px.
* **Beleg (gemessene Geometrie):**
  * `audit-s1.png`: PY 100 Mio = 246 px, damit 1 Mio ≈ 2,5 px. ΔProdukt D (−1,0 Mio) ist 2,46 px hoch, ΔB (−1,5 Mio) 3,7 px. In einer typischen Dashboard-Kachel mit ca. 250 px Höhe wird ein Delta von 0,5 % des Sockels zur Haarlinie. Ablesbar sind die Deltas nur noch über die Labels.
  * `audit-s2.png`: GuV-Wasserfall Umsatz 100 000 T€ → Deltas 1 500–5 000 T€ = 5–16 px.
  * `audit-s11.png`: In Small Multiples verschärft sich das. Süd (1/10 von Nord) zeigt Deltas von ±3–12 als ≤1-px-Linien, weil die gemeinsame Skala (korrekt) von Nord bestimmt wird.
* **Bewertung:** IBCS-korrekt (Nulllinie, CH 1.1), aber für die Aussage „was treibt die Veränderung" kaum lesbar. IBCS lässt hier den **gekennzeichneten Achsenschnitt** (UN 5.3) bzw. eine Skalierungs-Lupe zu. Das Visual bietet beides heute nicht. Die einzige Alternative wären die Δ-Stufen über dem Wasserfall, die es nur im Nicht-Varianz-Modus gibt (`visual.ts:2864`: `!isVarBridge`). → Umsetzungsplan in Abschnitt (c).

### BEFUND-S7 · mittel · Wasserfall ignoriert fixedMax und capOverflow

* **Fundstelle:**
  * `visual.ts:2367-2372` setzt `fixedMax` auf `domains.main`.
  * `visual.ts:2384-2390` **überschreibt** `domains.main` danach für den Wasserfall komplett.
  * `visual.ts:796` blendet die Sync-Gruppe im Wasserfall aus.
  * `cfg.capMax` (2226-2227) bleibt gesetzt, `renderWaterfall` liest es aber nie.
  * Im Backlog steht der Punkt bereits offen („refLine / fixedMax in allen Modi").
* **Beleg:** `audit-s3.png`, pixelidentisch zu `audit-s2.png`, obwohl `fixedMax = 20 000` und `capOverflow = true` persistiert sind (etwa nach einem Wechsel aus dem Säulen-Modus).
* **Bewertung:**
  * Zwei Wasserfälle auf einer Seite (z. B. zwei Gesellschaften) lassen sich **nicht** auf eine Skala synchronisieren (CH 4.1 seitenweit).
  * Stumm wirkungslose, persistierte Einstellungen machen das Verhalten für Autoren schwer vorhersagbar.
* **Fix:** `fixedMax` nach Zeile 2388 erneut anwenden, ähnlich wie `refLine` in 2402-2405. Die Sync-Gruppe im Wasserfall sichtbar machen. Aufwand etwa 0,25 PT.

### BEFUND-S8 · mittel · Kappung (capOverflow) markiert nur den AC-Balken

* **Fundstelle:**
  * `visual.ts:7528`: `capV` kappt PY, PL, BM, AC und Linie.
  * `visual.ts:7582-7597`: `drawCapMarker` gibt es nur für `p.value > capMax`.
  * PY-, PL- und BM-Balken bzw. -Ticks (7529-7557) werden **ohne** Marker gekappt.
  * Zusätzlich verlängert `refLine` die Domain über das Cap hinaus (2402-2405). Der Bruch liegt dann mitten in der Achse statt am Rand.
* **Beleg:** `audit-s8.png` (Cap 700, AC 500–650, PY 900–1 200). Die PY-Säulen enden flach am Cap, ohne Doppelstrich, und PY hat kein Label. Der Leser hält PY für ≈ 700.
* **Positiv-Referenz:** `audit-ok-c4-cap.png` zeigt, dass der AC-Marker funktioniert.
* **Fix:** Marker für jedes gekappte Element zeichnen. Domain-Maximum bei aktivem Cap nicht durch `refLine` erweitern. Aufwand etwa 0,25 PT.

### BEFUND-S9 · mittel · Δ-Panels mit eigener Skala ohne Skalierungsindikator

* **Fundstelle:**
  * `visual.ts:7339-7342`: Das ΔPY-Panel hat eine eigene `extent()`-Domain, unabhängig von `mainScale`.
  * Analog: Mini-Monatssäulen der Integrierten Brücke mit eigener Skala `BS` (3091-3094); Δ-Spalte im GuV-Statement (`dPX`, 3905-3908); Wasserfall-Δ-Stufen (2924-2927).
* **Beleg:** `audit-s9.png` (AC/PY ≈ 100 Mio). Die ΔPY-Säule +4 Mio ist ca. 33 px hoch, die AC-Säule 104 Mio ca. 195 px. Das Δ-Panel ist damit etwa 4,4-fach überhöht, ohne Skalierungslinie oder -band (UN 5.2) und ohne Hinweis.
* **Bewertung:** Die Lupe ist fachlich sinnvoll (sonst wären Deltas unsichtbar, siehe S6). Die IBCS-Notation verlangt aber „gleiche Skala wie das Basis-Chart" **oder** einen Skalierungsindikator. Das Backlog-Item „Skalierungsbänder" ist offen.
* **Fix:** Option „Δ in Basis-Skala" anbieten, oder einen Skalierungsindikator zeichnen (z. B. eine gestrichelte Linie in beiden Panels auf identischem Wert, etwa 1 Mio). Aufwand 1 PT.

### BEFUND-S10 · mittel · Hero-Layout: gleiche Domain, verschiedene px pro Einheit

* **Fundstelle:** `visual.ts:2671-2691`. Die Hero-Kachel erhält die volle Höhe `availH`, die Grid-Kacheln `cellH`. Der Kommentar „the shared scale is untouched, only the allotted space differs" übersieht, dass dieselbe Domain auf eine andere Pixelhöhe abgebildet wird.
* **Beleg:** `audit-s15.png`. Alle Regionen haben exakt 1 000. Die Hero-Säule ist ca. 215 px hoch, die Grid-Säulen ca. 60 px (≈ 3,5×). Die Δ-Panels sind ebenso betroffen.
* **Fix:** Für die Hero-Kachel die Plothöhe auf die der Grid-Kacheln begrenzen (den Platz für Labels oder Kommentar nutzen) oder Skalierungslinien zeichnen. Aufwand 0,5 PT.

### BEFUND-S11 · mittel · Balken-Small-Multiples: Kategorienbreite je Kachel verschiebt die Skala

* **Fundstelle:** `visual.ts:7286`: `catArea = min(region.w*0.28, maxTextWidth(points dieser Kachel)+12)`. Die Plotbreite hängt also von den Namen in der jeweiligen Kachel ab.
* **Beleg:** `audit-s16.png`. Identische Werte (500/400/300): Die Kachel „West" mit langen Kundennamen zeichnet 500 ca. 28 % kürzer als „Nord".
* **Fix:** `catArea` über alle Gruppen bestimmen und in `cfg` reichen. Aufwand etwa 0,25 PT.

### BEFUND-S12 · mittel · Per-Kachel-Skalen in mehreren Modi

* **Brücken (Default):** `settings.ts:564-570`, `multiplesSameScale` steht per Default auf `false`. Integrierte Brücke und Kategorie-Brücke skalieren damit je Kachel. `audit-s13.png`: Nord PY 330 und Süd PY 110 sind gleich lang. Das ist bekannt aus `AUDIT-2026-07.md` (LOW). Der Default sollte für IBCS auf `true` stehen.
* **GuV-Statement:** `visual.ts:3825-3829` und `3855`. `lo/hi` und `PX` gelten je Kachel, **ohne** Option. `audit-s12.png`: Umsatz Nord 10 000 und Süd 1 000 sind gleich lang.
* **Tabelle:** Die Δ%-Pin-Spalte (`negP/posP` lokal, 4583-4584, 4753) und die Δ2-Spalte (4758) skalieren je Kachel. Δ1 und Balken sind korrekt geteilt.
* **Kombi-Linie:** `visual.ts:7795`, die Linienskala ist je Kachel `extent(lVals)`. Eine zweite Skala ist nicht deklariert (Backlog).
* **KPI-Karten:** Mini-Brücke und Bullet skalieren je Karte (6517-6519, 6589-6592). Bei KPIs verschiedener Einheiten ist das gewollt. Bei Karten derselben Einheit (z. B. Regionen-Umsatz) sind die Balken aber nicht vergleichbar. Ein Hinweis in der Doku würde reichen.

### BEFUND-S14 · kosmetisch · Gemeinsame Domains enthalten nie gezeichnete Gruppen

`visual.ts:2357` und `2384-2389` laufen über **alle** Gruppen, gezeichnet werden aber nur `MULT_MAX_CELLS = 24` (73, 2666-2667). Für die Brücken-Shared-Maxima ist das schon behoben (`groups.slice(0, MULT_MAX_CELLS)` in 2416/2440), für Haupt-, Δ- und Wasserfall-Domain nicht. Das ist bekannt (LOW) und tritt erst ab mehr als 24 Gruppen auf.

### BEFUND-S15 · kosmetisch · Mindestgrößen übertreiben Kleinst-Deltas

* `drawBar` mit mindestens 0,5 px (8907).
* Integrierte Brücke `segH ≥ 4 px` (3218).
* Kategorie-Brücke Brick ≥ 2 px (3625).
* GuV-Statement ≥ 2 px (3997, 4033).

Bei großen Sockeln wirkt so ein Delta von 0,1 % so groß wie eines von 1 %. Das ist vertretbar (Sichtbarkeit), sollte aber dokumentiert sein. Mit Achsenschnitt (c) entschärft sich das von selbst.

### BEFUND-S16 · kosmetisch · Kleinere Inkonsistenzen

* `fixedMax` gilt nur für das Maximum (`settings.ts` minValue 0). Für rein negative Domains (Verlust- bzw. Kostenreihen) gibt es keinen synchronisierbaren Minimalwert.
* Slope einzeln: `extentTight`, nicht nullbasiert (7040). In Small Multiples nullbasiert über `mainDomain` (7038-7039). Bei Linien ist beides zulässig, aber dasselbe Chart sieht je nach Kontext anders aus.

---

## (b) Was bereits korrekt ist (für den Konzern zitierfähig)

1. **Eine Skala für alle Szenarien im Hauptpanel.**
   * Fundstelle: `visual.ts:2357`, `domains.main = extent(value, py, pl, fc, bm)`, eine einzige Domain. `renderChart` nutzt genau ein `mainScale` (7338) für PY-Säule, PL-Umriss, AC/FC, BM-Tick und die Linie im Line-Modus.
   * Belege: `audit-s9.png`, `audit-s17.png` (Hauptpanel).
2. **Nulllinie bei Säulen und Balken (CH 1.1).**
   * `extent()` (335-343) bezieht 0 immer ein. `makePanelScale` (8812-8829) polstert nur die von 0 abgewandte Seite. Alle Basisbalken starten bei 0 (7533, 7540, 7586).
   * Gemischte Vorzeichen (Ergebnisreihen) erhalten eine Nulllinie innerhalb des Panels.
3. **Wasserfall nullbasiert und ohne Überlauf.**
   * Anker von 0 (2798, 2808, 2815, 2823).
   * Die Domain umfasst alle Zwischenstände (2880). Varianz-Brücken-Anker sind IBCS-notiert (PL umrandet, AC solid bzw. AC/FC schraffiert).
4. **Small Multiples mit gemeinsamer Skala in Säulen, Balken, Linie und Wasserfall.**
   * Haupt- und Δ-Domains werden über alle Kacheln berechnet (2350-2363). Die Wasserfall-Domain ist geteilt (2384-2390, 2881-2884). Auch Σ-Gesamt- und Rest-Kacheln fließen ein.
   * Die Zoom-Ansicht behält die Skala.
   * Belege: `audit-s10.png` (Nord 4× Ost, sauber proportional, Δ-Panels ebenfalls geteilt), `audit-s11.png`.
5. **Pareto, Dumbbell und Slope** nutzen in Small Multiples `cfg.mainDomain` (6821, 6946, 7038).
6. **Tabelle.**
   * Die AC·PY-Balkenspalte teilt `cfg.mainDomain` inklusive `fixedMax` (4570-4574) und skaliert über den **vollen** Baum, also ohne Neuskalierung beim Aufklappen (4560-4565).
   * Die ΔPY-Balken teilen die deckweite `varDomain` (4581-4582).
   * Nicht-€-Zeilen (Pct-, Skip- und rowFormat-Zeilen) sind aus den €-Skalen ausgeschlossen (4566-4569).
7. **Intern konsistente Brücken.**
   * Kategorie-Brücke: eine Skala `X` für Totals, Kategorie-Balken und Bricks (3443).
   * GuV-Statement: ein `PX` für Referenz- und Szenario-Spalte (3855).
8. **Skalen-Sync über Visuals:** `fixedMax` bzw. `fixedVarMax` (2365-2379; nicht im Wasserfall, siehe S7).
9. **Ausreißer-Kappung mit IBCS-Doppelstrich** für AC (`drawCapMarker` 8671-8693). Das Label zeigt den echten Wert. Beleg: `audit-ok-c4-cap.png` (Einschränkung siehe S8).
10. **Opt-in gemeinsame Skala für die Brücken-Modi**, und zwar sauber implementiert.
    * Abgelehnte Kacheln (negativ bzw. ohne Basis) und Kacheln jenseits des 24er-Rasters beeinflussen die Skala nicht (2410-2464). Das ist ein Fix aus dem Juli-Audit.
    * Beleg: `audit-ok-c82-samescale.png`.
11. **Präzedenz für einen gekennzeichneten Achsenschnitt existiert:** der Bullet-Zoom der KPI-Karten (6576-6617, `cardBulletZoom`) mit Achsenbruch-Doppelstrich am Balkenende.

---

## (c) Umsetzungsplan: Achsenschnitt per Button beim Wasserfall

### Fachliches Zielbild (IBCS UN 5.3)

Entwurf: `audit-s14.png`. Das ist ein Mock mit den S1-Daten, gezeichnet außerhalb des Visuals.

* **Anker (PY, AC, Zwischensummen)** werden gekürzt dargestellt. Der Bereich 0..Schnitt schrumpft auf einen festen Stummel von ca. 20–24 px × fontK. Darüber liegt das **Bruchzeichen ⫽ über die volle Balkenbreite** mit ±15 % Überstand: Papierlücke plus zwei Tintenstriche, dieselbe Grafik wie `drawCapMarker`.
* **Deltas** werden linear im Fenster [Schnitt, Max] gezeichnet und sind dadurch lesbar. In S1 werden aus 2,5 px etwa 18 px pro Mio, also rund 7-fach.
* **Labels** zeigen immer echte Werte (das ist schon heute so).
* **Transparenz:** Der Paneltitel erhält den Zusatz „· Achse ab 90 Mio geschnitten" (2952-2953). Zusätzlich kommt ein Eintrag in die Filter-Fußzeile (2586-2610), damit auch PDF- und PowerPoint-Exporte ohne Chip den Schnitt ausweisen.
* **Zulässigkeit:** Ein Schnitt ist **nur** erlaubt, wenn alle Delta-Segmente **und alle Anker** vollständig oberhalb des Schnittwerts liegen. Andernfalls würde ein Element im Stummel verschwinden.
  * Typische GuV „Umsatz 100 → EBIT 10" ist nicht schneidbar. Der Chip zeigt dann den Zustand „nicht möglich" mit Tooltip, und das Visual rendert nullbasiert.
  * Das Kundenszenario (100 Mio → Deltas 1–5 Mio → 90–107 Mio) ist schneidbar.
* **Schnittwert automatisch:** `cut = niceFloor(minLevel − 0,25 · (maxLevel − minLevel))`, gerundet auf eine „schöne" Zahl (1/2/5 × 10ⁿ). Optional als manueller Wert.
* **Auto-Vorschlag (Modus „auto"):** Der Chip erscheint hervorgehoben, wenn die Delta-Spanne kleiner als 25 % des größten Ankers ist. Geschnitten wird aber erst nach dem Klick. **Default bleibt nullbasiert** (IBCS-Grundregel, keine Überraschung beim Leser).
* **Small Multiples:** Der Schnitt wird **einmal** über alle gezeichneten Kacheln berechnet (`groups.slice(0, MULT_MAX_CELLS)`) und ist in jeder Kachel identisch. Ist eine Kachel nicht schneidbar (etwa Süd in S11), wird gar nicht geschnitten, und der Tooltip nennt die Kachel.
* **Variante 1 nur für positive Domains.** Rein negative Kaskaden (spiegelbildlich) folgen in Phase 2.

### Bedienung: Format-Schalter **und** In-Chart-Chip

* **Format-Schalter (Autor):** In der Skalen-Karte, Gruppe „Wasserfall-Achse":
  * `wfAxisBreak` als Dropdown mit `off | auto | on`, Default `off`.
  * `wfBreakAt` als Zahlenfeld, 0 = automatisch.
  * Der Autor legt damit fest, ob Leser überhaupt schneiden dürfen. `off` blendet den Chip aus, für Konzern-Governance.
* **In-Chart-Chip (Leser):** „⫽ Achse" oben rechts, gezeichnet wie der YTD-Chip (`drawCumButton` 9712-9748), aktiv gefüllt. Der Chip schaltet `on ↔ auto`. Er erscheint nur bei `allowInteractions` (also nicht in Export oder Abo-Mail) und nur, wenn ein Schnitt zulässig ist (sonst deaktiviert mit Tooltip).
* **Empfehlung:** beides. Der Chip beantwortet die Kundenfrage „Entscheidung per Button". Der Schalter gibt dem Autor die Kontrolle und macht den Zustand bookmarkfähig.

### Persistenz (vorhandenes Muster)

* Der Chip schreibt **dieselbe** Pane-Eigenschaft: `persistProperties({ merge: [{ objectName: "scale", selector: null, properties: { wfAxisBreak: v } }] })`.
* **Optimistisch** mit Echo-Guard und TTL nach dem Vorbild von `pendingOrientation`:
  1. Den Slice sofort setzen.
  2. `pendingWfBreak = v; pendingWfBreakTtl = 5`, dann `rerender()`. Vorbild: Smart-Start-Chip 1110-1122 bzw. `pickMode` 1515-1526.
  3. Im `update()` direkt neben 583-592 den Guard prüfen: Echo erkannt oder TTL abgelaufen → `pending = null`, sonst den Slice auf den Pending-Wert zwingen.
* Da es **eine** Quelle gibt (der Pane-Slice), entfällt der Zwei-Quellen-Abgleich, den die Karten-Sortierung braucht (`cardSortSel` + `lastPaneCardSort`, 685-702).
* Der Zustand ist damit bookmark- und lesezeichenfähig und verhält sich bei Lese-Rechten wie die bestehenden YTD- und ⇅-Chips.

### Code-Stellen, die angefasst werden müssen

| Datei:Zeile | Änderung |
|---|---|
| `capabilities.json:426-434` | `scale.properties` um `wfAxisBreak` (text/enum) und `wfBreakAt` (numeric) ergänzen |
| `settings.ts:1169-1239` (`ScaleCardSettings`) | Neue Slices plus Gruppe „Wasserfall-Achse"; `groups` erweitern |
| `stringResources/*` (4 Sprachen) | displayName-, description- und Chip-/Tooltip-Keys |
| `visual.ts:434-435` | Felder `pendingWfBreak` und `pendingWfBreakTtl`; neben `sharedWfDomain` (377) ein Feld `sharedWfBreak: number \| null` |
| `visual.ts:583-592` (`update`) | Echo-Guard für `wfAxisBreak` |
| `visual.ts:742-801` (`getFormattingModel`) | Sichtbarkeit: Gruppe nur bei `orient === "waterfall"`; `wfBreakAt` nur bei `on/auto`. Dabei S7 mit beheben (Sync-Gruppe 796) |
| `visual.ts:297` (`ChartConfig`) | Neues Feld `wfBreak: { at: number; possible: boolean; suggested: boolean } \| null` |
| `visual.ts:2381-2390` (`render`) | Nach dem Segmentbau Zulässigkeit, Schnittwert und Vorschlag **über alle gezeichneten Gruppen** berechnen → `cfg.wfBreak` und `this.sharedWfBreak` |
| `visual.ts:2516-2568` (In-Chart-Chrome) | `drawWfBreakChip()` aufrufen; Reserve in der Modus-Chip-Rechnung (2547-2558) ergänzen |
| `visual.ts:2586-2610` | Fußzeilen-Eintrag „⫽ Achse ab X" (für Exporte) |
| `visual.ts:2829-3012` (`renderWaterfall`) | Bei aktivem Schnitt `makeBrokenScale()` statt `makePanelScale` (2880-2886); nach den Ankern (2978) `drawAxisBreak()`; Titel-Suffix (2952); `refLine` unter dem Schnitt ausblenden (2949-2951); Label-Flip-Logik (2997-3000) gegen den Stummel prüfen |
| `visual.ts:~8812` (neu, neben `makePanelScale`) | `makeBrokenScale(domain, cutAt, rect, labelPad, stubPx)`: stückweise lineare `Scale`. Der Typ `Scale = (v) => number` passt ohne Änderung |
| `visual.ts:~8671` (neu, neben `drawCapMarker`) | `drawAxisBreak(parent, bp, bw, y, orientation, cfg)`: aus `drawCapMarker` herauslösen, damit Cap, Bullet-Zoom (6609-6617) und Wasserfall eine Grafik teilen |
| `visual.ts:~9712` (neu, neben `drawCumButton`) | `drawWfBreakChip(xRight, cfg)`: Pille plus `aria-label`, Tastatur (Enter/Space), Tooltip-Zustände |
| `visual.ts:1050` (optional) | Smart-Start-Vorschlag „Achse schneiden?" bei Auto-Kriterium |
| `test/test.html` | Neue Fälle: Schnitt an (S1-Daten), auto-Vorschlag, nicht zulässig (GuV bis EBIT 10), Multiples mit gemeinsamem Schnitt, HC- und Dark-Mode, `allowInteractions=false` (kein Chip, Fußzeile vorhanden) |
| `README.md` / `CHANGELOG.md` / AppSource-Text | Feature und IBCS-Begründung dokumentieren |

### Phase 2 (gleiches Muster)

* Das Brücken-Panel in Säulen/Balken auf `extent()` plus optionalen Schnitt umstellen (behebt S2): Zeilen 2395-2401 und 7493-7518.
* Integrierte Brücke (`S` in 3090) und Kategorie-Brücke (`X` in 3443) erhalten denselben Helper (horizontal für die Kategorie-Brücke). Voraussetzung ist der Fix von S3 und S4.

### Aufwandsschätzung

| Paket | PT |
|---|---|
| **P0 Bugfixes vor der Konzern-Demo:** S1 (0,5), S3+S4 (0,5), S2 nullbasiert (0,25), S5 (0,5–1), S13 (0,5–1), S7+S8 (0,5) | **≈ 3–4** |
| Achsenschnitt Wasserfall: Settings, Capabilities, i18n | 0,5 |
| Stückweise Skala, Zulässigkeit, Auto-Schnittwert, Bruchzeichen-Helper | 1 |
| Chip, Persistenz, Echo-Guard, Fußzeile, Titel | 0,75 |
| Small-Multiples-Teilung, HC/Dark, Tests im Harness, Doku | 1–1,5 |
| **Summe Achsenschnitt Wasserfall** | **≈ 3,5–4** |
| Phase 2: Brücken-Panel, Integrierte Brücke, Kategorie-Brücke | 1,5–2 |
| Optional: Skalierungsindikatoren für Δ-Panels und Hero (S9, S10) | 1–1,5 |

**Empfohlene Reihenfolge:**
1. P0 Bugfixes, weil sie die Aussage „Skalierung ist immer richtig" erst ermöglichen.
2. Achsenschnitt Wasserfall (Default aus, Chip nur wenn zulässig).
3. Phase 2 und Skalierungsindikatoren.

---

## Anhang: Belegdateien

Alle Dateien liegen in `/tmp/claude-0/-home-user-PowerBI-Kitchen-/48cefe9d-d129-536d-a96e-98e1dded6421/scratchpad/`.

| Datei | Inhalt |
|---|---|
| `audit-s1.png` | Wasserfall Varianz-Brücke, Sockel 100 Mio (S6) |
| `audit-s2.png` | GuV-Wasserfall 100 000 T€ (S6, S13) |
| `audit-s3.png` | wie S2 plus fixedMax/capOverflow, wirkungslos (S7) |
| `audit-s4.png` | Brücken-Panel ohne Nullpunkt, AC-Anker mit Länge 0 (S2) |
| `audit-s5.png` | Kategorie-Brücke mit Überlauf (S3) |
| `audit-s6.png` | Integrierte Brücke mit Überlauf (S4) |
| `audit-s7.png` | Gestapelt: Small Multiples je Kachel skaliert (S5) |
| `audit-s8.png` | PY stumm gekappt (S8) |
| `audit-s9.png` | Δ-Panel überhöht ohne Indikator (S9; Hauptpanel korrekt) |
| `audit-s10.png` | Säulen-Multiples mit gemeinsamer Skala (korrekt) |
| `audit-s11.png` | Wasserfall-Multiples mit gemeinsamer Skala (korrekt; zeigt S6) |
| `audit-s12.png` | GuV-Statement-Multiples je Kachel (S12, S13) |
| `audit-s13.png` | Kategorie-Brücke-Multiples, Default je Kachel (S12) |
| `audit-s14.png` | **Entwurf** Achsenschnitt mit ⫽-Marker und Chip (Mock) |
| `audit-s15.png` | Hero-Layout, andere px/Einheit (S10) |
| `audit-s16.png` | Balken-Multiples mit Namensbreite (S11) |
| `audit-s17.png` | Doppel-Varianz mit getrennten Skalen (S1) |
| `audit-ok-c4-cap.png` | Stock-Fall c4: Cap-Marker AC (korrekt) |
| `audit-ok-c82-samescale.png` | Stock-Fall c82: Brücken mit gemeinsamer Skala (korrekt) |
| `harness/audit.html`, `harness/shot.js` | Lokales Repro-Harness (`node harness/shot.js` erzeugt alle Bilder neu) |
