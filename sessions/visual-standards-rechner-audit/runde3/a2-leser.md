# Runde 3 · A2 „Leser“ · Visual-Standards-Rechner v0.22

**Stand:** 06.11.2026 · **Frage:** Stimmen Sätze, Zahlen und Entscheidungslogik auf der Seite zusammen, wenn man sie als Entscheider liest (Controlling-Leitung, nicht IT)? · **Grundlage:** `visual-standards-rechner.html` auf Branch `feat/rechner-review`, unverändert; Playwright-Lauf `a2-leser.test.js` (gleicher Ordner), fünf Presets × zwei Sprachen, dazu vier Sonderfälle des Break-even-Satzes und der geführte Einstieg; Rohtexte und Momentaufnahme unter `tests/rechner/.artifacts/a2-leser/` (`texte.md`, `snapshot.json`).

**Zählung:** 778 automatische Prüfungen in neun Bereichen, 756 bestanden, 22 Fehlschläge, 0 JS-Fehler (Lauf `tests/rechner/.artifacts/a2-leser-final.log`). Die Fehlschläge verdichten sich zu **10 Befunden** (3 × Priorität 1, 3 × Priorität 2, 4 × Priorität 3) und **2 Hinweisen** ohne Handlungsbedarf. Die Zahlen des Rechenkerns sind in sich stimmig: Headline, KPI-Karten, Tabelle, Knoten 7, Sicherheits-Leiste und Ebene 1 zeigen in allen zehn Läufen dieselben Beträge. Die Befunde liegen dort, wo **zwei Textstellen dieselbe Größe unabhängig voneinander ausrechnen oder eine statisch festgeschrieben ist**.

Zeilenangaben beziehen sich auf `visual-standards-rechner.html`; Zitate sind die sichtbaren Texte des Preset-Laufs (deutsch), englisch nur, wo abweichend.

---

## 1 · Ergebnissatz (#headline) gegen KPI-Karten und Tabelle — in Ordnung, ein Befund

Geprüft je Preset und Sprache: Gesamtkosten des Erstplatzierten, P10–P90, Betrag je Viewer, Horizont, Anforderungs-Score, Spannweite P90/P10, Gleichstandshinweis, Vorlagen-Bauer, Warnungszahl, Nebensatz „erfüllt die Anforderungen am besten … der Preis dafür“. Alle Beträge im Satz stehen wortgleich in Karte 1 (`.kpi .big`, `.range`, `.per`) und in den Tabellenzeilen „Gesamt über N Jahre (P50)“ und „Spanne P10 – P90“. Beispiel Mittelstand: „**3rd-Party paid** (Paid) ist mit **67.000 €** (P50, mittlerer Fall) über 5 Jahre der bestplatzierte zulässige Ansatz (P10–P90: 48.000 € bis 95.000 €), **270 €** je Viewer und Jahr“ — Karte: „67.000 € 5 J. · P10–P90 48.000 € – 95.000 € · 270 € je Viewer und Jahr“, Tabelle: „67.000 €“ / „48.000 € – 95.000 €“. Nachgerechnet: 66.917 / 48.0xx / 95.xxx aus `lastSim`, 270 = 66.917 / (40 Viewer × 5 Jahre × Wachstum). Der Nebensatz im Report-Server-Preset („+79.000 €, also 4.900 € je Anforderungspunkt“) stimmt: 79.000 / (64 − 48) = 4.937.

| # | Befund | Zitat | Stelle | Prio |
|:--|:--|:--|:--|:--|
| B5 | **Gerundete Spannweite widerspricht der Warnschwelle.** Die Warnung „hoch“ greift bei P90/P10 > 2,5; angezeigt wird auf eine Stelle gerundet. Im Report-Server-Preset ist der Wert 2,52: der Leser sieht „2,5“ und daneben „hoch“, obwohl die Regel „über 2,5“ heißt. Englisch identisch („2.5× … high“). | „Unsicherheit: P90 ist das **2,5-fache** von P10 (hoch: die größten Hebel stehen im Sensitivitäts-Chart)“ | Z. 4435 (`fmtN(spread,1)` und `spread>2.5`) | 2 |

## 2 · K.O.-Block gegen `evaluate()` — in Ordnung

Ausgeschlossen sind in allen Läufen genau die Ansätze mit `ko.length > 0`: Pilot und Mittelstand keiner, Konzern und Großkonzern Open Source („nur zertifizierte Visuals“), Report Server zusätzlich Paid („Über AppSource lizenzierte Visuals laufen nicht im Report Server“). Die K.O.-Karten, die Liste „Warum ausgeschlossen“ und die Chips in Knoten 1 nennen dieselben Ansätze; jede Begründung ist wörtlich der `ko`-Eintrag; der Zusatz „→ wäre 63.000 € günstiger als die beste zulässige Option“ entspricht `|q(K.O.) − q(Platz 1)|`. Die Headline nennt die Warnungszahl der Option exakt („2 Warnung(en) für diese Option“ = `warn.length`).

## 3 · Break-even-Satz (#be-insight) gegen `licenseBreakEven()` — zwei Befunde

| # | Befund | Zitat | Stelle | Prio |
|:--|:--|:--|:--|:--|
| B3 | **Der Kipp-Punkt wird zweimal gerechnet und kommt zweimal anders heraus.** `licenseBreakEven()` sucht auf einem groben Raster (10, 20, 50, 100, 200 …) und interpoliert linear; der Break-even-Chart rechnet seine Schnittpunkte auf dem feinen Chart-Raster. Ebene 1 und Knoten 3 nennen den groben Wert, der Satz unter dem Chart den feinen. Mittelstand: 77 gegen 64 (feines Raster über `expected()`: 66); Pilot: 63 gegen 58; Report Server: 370 gegen 339. Konzern passt (1.117 gegen 1.116), weil der Schnitt zufällig nahe einem Rasterpunkt liegt. Für den Leser sind das zwei verschiedene „etwa“-Werte für dieselbe Zahl, bis zu 20 % auseinander. | Ebene 1 / Knoten 3: „Kipp-Punkt bei etwa **77** Viewern“ — Break-even-Satz: „Noch nicht erreicht: **Open Source (ab 64 Viewern)**, Deneb (ab 142 Viewern)“ | Z. 5301 (Raster), Z. 4777–4790 (Chart-Schnitt) | 1 |
| B10 | **Verhandlungsgrenze ohne Verhandlungsgegenstand.** Ist Paid durch „Kein externes Lizenzbudget“ ausgeschlossen, bleibt der Satz stehen; der Vorbehalt davor erklärt die Linie, nicht die Zielmarke. Wer kein Lizenzbudget hat, führt kein Einkaufsgespräch. | „Paid ist aktuell durch K.O. ausgeschlossen … **Verhandlungsgrenze:** Paid rechnet sich gegen Open Source / Eigenentwicklung bis 101 € je lizenziertem Nutzer und Jahr … Das ist die Zielmarke für das Einkaufsgespräch“ | Z. 4793–4794 (`alt` wird unabhängig vom Paid-K.O. bestimmt) | 3 |

**In Ordnung:** (a) Paid K.O. — der Vorbehalt steht in allen Fällen genau dann am Anfang, wenn `ev.paid.ko.length > 0`; Ebene 1 kennzeichnet denselben Fall („Der Kipp-Punkt rechnet gegen die ausgeschlossene Paid-Lizenz, er ist hier keine Entscheidung“). (b) Kein zulässiger Stunden-Ansatz (IBCS-Zertifikat Pflicht): `licenseBreakEven()` = null, der Satz sagt „Kein zulässiger Ansatz bleibt für den Vergleich gegen Paid übrig“, nennt kein „ab N“ und keine Verhandlungsgrenze; Ebene 1 „Einen Kipp-Punkt gibt es hier nicht“, Knoten 3 „Kein Kipp-Punkt“. Nicht leer, nicht unsinnig. (c) Site-Lizenz (Großkonzern): Grenze als „(umgerechnet je Nutzer)“ gekennzeichnet, 20 € > 0. (d) Angebot aktiv (50 € je Nutzer): „Euer Angebot Testanbieter liegt bei 50 € — es trägt“ ist konsistent mit der Grenze 101 €; Knoten 5 wird „Angebot statt Lizenz-Anker“ mit Badge „Angebot“, Ebene 1 und Sicherheits-Leiste nennen das Angebot statt des Ankers.

## 4 · Entscheidungspfad (sieben Knoten) — dynamisch in Ordnung, statisch ein Befund

Dynamische Knoten, alle Läufe: Knoten 1 nennt die aktiven Red Flags mit Label, „raus“-Chips = Ansätze mit Flag-K.O.; Knoten 2 „Kein Kriterium ist als Must gesetzt“ (Voreinstellung ohne Must, `musts.length` = 0); Knoten 3 „Aktuell 1 : N“ = `round(viewers/creators)`, Kipp-Punkt = `licenseBreakEven()`, „darüber/darunter“ passt zu `S.viewers`, Chart-Mix = `S.mix`, Chip „vorn“ = günstigster zulässiger Stunden-Ansatz oberhalb bzw. Paid unterhalb; Knoten 4 „39 % der Reports brauchen überhaupt eine IBCS-Spezialgrafik“ = `rcShares()[1]+[2]`, Horizont genannt; Knoten 5 Anker-Zellen = `lastAnchorWin`, Bibliotheks-Status = `S.lib`; Knoten 6 Betriebsmodell-Label, „2 von 3 Erstellern“, Self-Service-Anteil; Knoten 7 Beträge aller zulässigen Ansätze in Kostenreihenfolge, „19 % der Paid-Kosten hängen an belegten Preisen“ = `certSplit().b`, Badge-Tooltip 19/29/52 summiert auf 100 und ist identisch mit der Sicherheits-Leiste.

| # | Befund | Zitat | Stelle | Prio |
|:--|:--|:--|:--|:--|
| B2 | **Die statischen Zahlen im Entscheidungsbaum sind veraltet** — wie der Kommentar im Quelltext selbst befürchtet und `md/visual-standards-rechner.md` Z. 400 festhält („hält keine Prüfung gegen den Rechenkern“). Nachgerechnet mit dem heutigen Modell (Erwartungswert, Standardannahmen, Panel-Stunden, Lizenzbasis 85 %, ohne Bibliothek; Verhältnis = Kipp-Punkt-Viewer ÷ Ersteller, K.O. ignoriert, wie der Baum es tut): **Mischpreis 80 €** gegen den günstigsten Stunden-Ansatz: Pilot 1 : 58, Mittelstand 1 : 22, Konzern 1 : 28, Report Server 1 : 16, Großkonzern kein Kipp-Punkt bis 20.000 (Site-Lizenz). Der Baum sagt „1 : 12 bis 1 : 26“; heute sind es 1 : 16 bis 1 : 58, ohne den Pilot 1 : 16 bis 1 : 28. **Zebra 170 €:** heute 1 : 5,5 / 8 / 8,7 / 22 (Pilot); der Baum sagt „1 : 5 bis 1 : 9“ — ohne Pilot richtig, mit Pilot nicht. **Inforiver 33 €:** „Paid hält auch bei vielen Viewern“ — heute kippt Paid bei 266 (Mittelstand), 281 (Pilot), 885 (Report Server) und 3.112 (Konzern) Viewern; „hält“ gilt nur im Großkonzern. **„über etwa 1 : 26 → Open Source vorn“:** gegen Open Source allein kippt Paid bei 1 : 22 (Mittelstand), 1 : 28 (Konzern), 1 : 16 (Report Server), 1 : 58 (Pilot) — die Grenze 26 trifft kein Preset. Mit Bibliothek (80 €): 1 : 47 / 20 / 26 / 13. **Richtig geblieben:** „vorhanden → Deneb und Core 30 bis 40 % weniger Stunden je Chart“ (`libF` Erwartungswert 0,6 / 0,7) und „Core + SVG ist in keinem geprüften Szenario das günstigste“ (Platz 1 in den Presets: Paid, Paid, Deneb, Deneb, Paid). | Vorspann: „Der Kipp-Punkt-Bereich 1 : 12 bis 1 : 26 gilt für Standardannahmen … gemessen über die fünf Presets, **Stand v0.19**“; SVG: „unter etwa 1 : 12 → Paid vorn“, „über etwa 1 : 26 → Open Source vorn“, „170 € → der Kipp-Punkt rutscht auf 1 : 5 bis 1 : 9“, „33 € → Paid hält auch bei vielen Viewern“ | Z. 566 (Vorspann), Z. 567–570 (Warnkommentar), Z. 571 (SVG) | 1 |

Der Pilot (1 Ersteller, 10 Viewer) sprengt jede Verhältnisregel, weil die Fixkosten dominieren; wenn der Baum weiter mit Verhältnissen argumentiert, sollte er sagen, ab welcher Hausgröße sie gelten.

## 5 · Sicherheits-Leiste (#certainty) und Herkunfts-Badges — in Ordnung, ein Befund

In allen 40 Zeilen (4 Ansätze × 10 Läufe) summieren die Tooltip-Anteile auf 100 ± 1, sind identisch mit `certSplit()`, die Segmentbeschriftung (ab 9 %) ist Teil des Tooltips, Knoten 7 (Badge) und Ebene 1 („19 % der Paid-Kosten beruhen auf belegten Preisen, 52 % auf Schätzungen“) nennen dieselben Zahlen wie die Leiste.

| # | Befund | Zitat | Stelle | Prio |
|:--|:--|:--|:--|:--|
| B8 | **Ein Segment mit „0 %“ und einem Betrag.** Die Sichtbarkeitsschwelle liegt bei 0,1 %, die Anzeige rundet auf ganze Prozent — dazwischen entsteht ein Segment, das 0 % behauptet und 357 € trägt. | Pilot, Core + SVG: „Faustregel: **0 % ≈ 357 €**“ (Tooltip) | Z. 4478 (`v<=0.001` und `Math.round(v*100)`) | 3 |

## 6 · Satz in Ebene 1 (#ov-sentence) gegen Ebene 2 — in Ordnung, ein Befund

Geprüft: „rund N € je Viewer und Jahr“ = `q / (vAvg × H)` (exakt, alle Läufe), Divisor identisch mit `perDivisor()` der KPI-Karten, Faktoren „kostet das 1,3-fache“ auf ±0,05 richtig, Kipp-Punkt wie Knoten 3, Ausgeschlossene und Anker/Bibliothek wie `S`. Ein Beispiel, das sich erst beim zweiten Lesen auflöst: Konzern — Ebene 1 „liegen **Deneb und Paid gleichauf** bei rund 66 € je Viewer und Jahr (P50) … mit Anforderungs-Score (Regler 70 % Kosten) liegt in Ebene 2 **Paid** vorn“, Headline „3rd-Party paid … **74 €** je Viewer und Jahr“. Beide Zahlen stimmen (66 ist Deneb, 74 ist Paid), aber der Leser bekommt zwei Sieger und zwei Beträge je Viewer in zwei Sätzen; der Satz erklärt die Rangfolge, nicht den Betragswechsel.

| # | Befund | Zitat | Stelle | Prio |
|:--|:--|:--|:--|:--|
| B1 | **Zwei Verhandlungsgrenzen für dieselbe Entscheidung.** Treiber 2 in Ebene 1 und der Break-even-Satz in Ebene 3 rechnen die Grenze mit verschiedenen Formeln: Ebene 1 skaliert den Anker mit `(Kosten_Stunden − Kosten_Paid) / Lizenzblock`, Ebene 3 teilt `(Kosten_Stunden − Paid ohne Lizenz) / (Nutzer × Lizenzfaktor × Staffel)`. Ergebnis für dasselbe Szenario: Pilot **228 €** gegen **210 €**, Mittelstand **101 €** gegen **118 €**, Konzern **53 €** gegen **61 €**. Im Großkonzern (Site-Lizenz) bricht die Ebene-1-Formel: **464 €** gegen **20 €** — mit einer Pauschale ist der Lizenzblock nicht proportional zum Preis je Nutzer, Treiber 2 multipliziert trotzdem den Anker. Für eine Controlling-Leitung ist die Verhandlungsgrenze die wichtigste Zahl des Rechners; sie darf nur einmal vorkommen. | Ebene 1: „**2 · Lizenzpreis.** Anker 80 € je lizenziertem Nutzer und Jahr (vor Staffel). **Gleichstand mit Deneb bei etwa 464 €.** Das ist die Verhandlungsgrenze, nicht der Listenpreis.“ — Ebene 3: „**Verhandlungsgrenze:** Paid rechnet sich gegen Deneb / Vega bis **20 €** je lizenziertem Nutzer und Jahr (umgerechnet je Nutzer).“ | Z. 5354 (`indiff`), Z. 4793 (`be`) | 1 |

## 7 · Geführter Einstieg — in Ordnung, ein Hinweis

Sieben Schritte durchgeklickt (Preset Mittelstand, dann 5 Ersteller / 120 Viewer; 20 Reports, „Fast alles ist Management-Reporting“; Enterprise BI; „nur zertifizierte Visuals“ und IBCS-Pflicht an, IBCS-Pflicht wieder aus; Zebra-Anker; 10 Jahre). Nach jedem Schritt steht das Versprochene in `S` (`creators`, `viewers`, `reports`, `rc.sh` = 20/40/40, `mode`/`ssShare`, `flags`, `ibcsAll`, `p.paid.lic`, `horizon`), der Hinweis unter Schritt 2 nennt dieselben „Charts je Report“ und denselben Chart-Mix wie `S`, der Zwischenstand nennt in allen sieben Schritten exakt `round(q / (vAvg × H))` und `fmtEur(q)` des Erstplatzierten (137 → 141 → 133 → 133 → 156 → 102 → 102 € je Viewer und Jahr). Nach „Ergebnis ansehen“ steht in Ebene 1 „rund 102 € je Viewer und Jahr“, die Headline nennt die Zwischenstand-Summe 200.000 €, Karte 1 ist der Zwischenstand-Ansatz (Deneb) mit 102 € je Viewer. Die Zusammenfassung in Schritt 7 nennt alle Antworten und die richtige Red-Flag-Zahl.

Sprachwechsel mitten im Einstieg über den Umschalter (`setLang('en')`, Schritt 4, Preset Konzern): nach dem Neuladen englisch, Einstieg aktiv, Schritt 4 von 7 („Step 4 of 7“), Eingaben erhalten (25 / 1.500).

**Hinweis H1:** Der im Auftrag beschriebene Weg „`localStorage['vsr-lang']='en'` + reload“ allein landet **nicht** im Einstieg, sondern im Rechner (Ebene 1), weil nur `setLang()` den Schritt in `sessionStorage['vsr-wiz']` merkt und der Link nach dem ersten Wechsel Einstellungen trägt (Z. 3444–3448, Z. 5985–5987). Über den Knopf funktioniert es; das ist das Verhalten, das ein Nutzer auslöst. Kein Handlungsbedarf, aber der Test sollte es so beschreiben.

## 8 · Englisch — Zahlen in Ordnung, ein Befund

P50 je Ansatz, Kipp-Punkt, Rangfolge und K.O. sind in allen fünf Presets auf den Euro gleich (Simulation mit festem Seed). Zahlformat en-GB: „€67,000“, „P90 is 2× P10“, „1,117 viewers“. Keine deutschen Reste in Headline, K.O.-Block, Break-even-Satz, Entscheidungspfad, Sicherheits-Leiste, Ebene 1 und KPI-Karten; `window.i18nFehlt` enthält nur sprachneutrale Stücke (Deneb, AppSource, PERT, MoSCoW, functions.tmdl …).

| # | Befund | Zitat | Stelle | Prio |
|:--|:--|:--|:--|:--|
| B4 | **Die Verhandlungsgrenze steht englisch ohne Währung.** Der deutsche Baustein trägt das „ €“ mit, die Übersetzung lässt es weg; in allen fünf Presets steht eine nackte Zahl. (In Treiber 2 ist es richtig: „Parity with Open source at around €118“.) | „Negotiation ceiling: against Open source / in-house, paid pays off up to **101 per licensed user and year** (list price before tiering).“ | I18N Z. 953 (`"be#1": " per licensed user and year"`), Aufruf Z. 4794 | 2 |

## 9 · Lesbarkeit als Entscheider — Stellen mit Zitat

Zusätzlich zu B1, B3, B5 und B10 oben:

| # | Stelle | Zitat | Was stört |
|:--|:--|:--|:--|
| B6 | Fußzeile Z. 4865; Vorspann Baum Z. 566; `md/visual-standards-rechner.md` Z. 8 | „Visual-Standards-Rechner **v0.22** · … · **Stand 09/2026**“ — „Änderungshistorie v0.8 bis heute (11 Einträge)“, letzter Eintrag **v0.19** — „gemessen über die fünf Presets, **Stand v0.19**“ — md: „Stand: **v0.20**“ | Vier Versionsstände auf einer Seite und ihrer Doku. Die Historie endet drei Versionen vor der Fußnote (v0.20 Barrierefreiheit, v0.21 Entprellung, v0.22 Zweisprachigkeit fehlen); „Stand 09/2026“ passt nicht zu einer Version, die den November-Sprachwechsel enthält. **Prio 2** |
| B7 | Großkonzern, Ebene 1 Z. 5332 / Knoten 3 Z. 4592 gegen Break-even-Satz Z. 4788 | „Auch bei **20.000** Viewern bleibt die Lizenz je Kopf im Modell günstiger“ — „Deneb wird erst jenseits von **30.000** Viewern günstiger als Paid“ | Zwei Obergrenzen für dieselbe Aussage (Raster von `licenseBreakEven()` endet bei 20.000, das Chart bei 2 × bzw. 3 × Viewer). Dazu „Lizenz **je Kopf**“ bei einem Preset, das mit **Site-Pauschale** rechnet. **Prio 3** |
| B9 | Ebene 1 Z. 5320; Headline Z. 4437; KPI-Karte | „Bei **1 Erstellern** und 10 Viewern“ — „(**1 von 1 Erstellern** bauen Vorlagen)“ — „frühestens nach ≈ **1 Wochen**“ | Numerus im Pilot-Preset. Klein, aber es ist der erste Satz, den ein Pilot-Leser sieht. **Prio 3** |
| — | Knoten 6 | „Varianten ×1,25, Governance ×1,13, Support ×1,13, Wiederverwendung ×0,9“ | Vier Faktoren ohne Bezugsgröße im selben Satz; erst der Tooltip des Badges sagt, dass es Autoren-Schätzungen sind. Lesbar, aber nur für Modellkenner. Kein Befund, Beobachtung. |
| — | Headline, alle Presets | „Rangfolge: **70 % Kosten, 30 % Anforderungen**“ | Die Voreinstellung ist 70/30, der Regler im Markup steht auf `value="100"` (Z. 742) und wird per JS nachgezogen; der Baum-Vorspann spricht von „Standardannahmen“, ohne die Gewichtung zu nennen. Beobachtung, kein Widerspruch im Ergebnis. |

Keine Stelle nennt einen Geldbetrag ohne Horizont: Headline, Karten, Tabelle, Knoten 4 und 7, Null-Option und Cash-out tragen „über N Jahre“ oder „je Jahr“; der Zwischenstand im Einstieg ebenso. Prozentangaben tragen überall ihre Bezugsgröße („% der Paid-Kosten“, „% der Reports“).

---

## Was aus Sicht des Lesers zuerst zu tun wäre

1. **B1** — eine Verhandlungsgrenze, eine Formel, an beiden Stellen dieselbe Zahl; bei Site-Lizenz die Ebene-1-Zeile auf die Pauschale umstellen oder weglassen.
2. **B2** — die statischen Baum-Zahlen gegen den Rechenkern setzen oder live rechnen (die Werte oben sind der heutige Stand); zugleich den Vorspann „Stand v0.19“ auf den Lauf datieren, der sie gemessen hat.
3. **B3** — `licenseBreakEven()` auf dasselbe Raster wie den Chart stellen (oder umgekehrt), damit Ebene 1, Knoten 3 und Break-even-Satz denselben Kipp-Punkt nennen.
4. **B4, B5, B6** — Währungszeichen englisch, Warnschwelle auf der gerundeten Zahl, Versionsstände vereinheitlichen.

Nicht geändert wurde nichts: Prüfung und Bericht liegen in `sessions/visual-standards-rechner-audit/runde3/`, die Seite selbst ist unberührt.
