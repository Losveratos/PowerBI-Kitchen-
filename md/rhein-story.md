# 209 Jahre, ein Fluss, zwei Wahrheiten

> Eine der laengsten Abflussreihen der Welt sagt: Dem Rhein geht es gut. Dieselben Daten sagen das Gegenteil. Beides stimmt — eine Analyse, wie ein Klimasignal im Rauschen untergeht und wie man es trotzdem findet.

- **Quelle:** https://datenwgknowledgekitchen.com/rhein-story.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `rhein-story.html` · Stand 2026-08-16 (Git-Commit-Datum der Quelldatei)
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/rhein-story.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt den Fliesstext der Seite. Interaktive Elemente (Regler, Filter, animierte Charts) sind nur in der HTML-Fassung nutzbar; die zugehoerigen Zahlen stehen hier als Tabelle.
- **Datengrundlage:** Global Runoff Data Centre (GRDC), BfG Koblenz; Originaldaten: WSV, Station KOELN / Rhein (GRDC 6335060), 1816-11-01 bis 2025-12-31, 76.397 gueltige Tageswerte
- **Reproduzierbarkeit:** alle Kennzahlen ueber `src/run_all.py` bzw. `src/export_viz_data.py` aus den GRDC-Rohdaten nachrechenbar. GRDC-Daten duerfen nur nicht-kommerziell genutzt und nicht weitergegeben werden.

---
Eine der längsten Abflussreihen der Welt sagt: Dem Rhein geht es gut. Dieselben Daten sagen das **Gegenteil**. Beides stimmt. Diese Geschichte zeigt, wie ein Klimasignal im Rauschen untergeht — **und wie man es trotzdem findet**.

## „Das gab es doch schon immer“

„Der Rhein trocknet aus!“, sagen die einen. „Panikmache — Dürren und Niedrigwasser gab es schon immer“, sagen die anderen. Wer hat recht?

Beide Seiten argumentieren meist mit Anekdoten: ein trockener Sommer hier, ein historisches Foto dort. Dabei liegt die Antwort längst vor — in einer Messreihe, die seit über zwei Jahrhunderten nicht abgerissen ist. Seit dem 1. November 1816 wird am Pegel Köln täglich der Wasserstand abgelesen — und daraus bestimmt, wie viel Wasser der Rhein wirklich führt. Nicht die Zentimeter-Marke, die die Schlagzeilen zitieren — sondern der **Abfluss in m³/s**, die physikalisch ehrliche Größe.

Und diese Reihe gibt — das ist das Überraschende — **beiden Seiten ein Stück weit recht**. Folgen wir den Daten. In sechs Akten.

### 2.510 Monate Chaos

Jede Zacke ein Monatsmittel. Hochwasser um 1926, 1993, 1995. Dürren 1921, 1947, 2018. Auf den ersten Blick: reines Rauschen.

### Die Jahresmittel glätten das Bild

Verdichtet man jedes Jahr auf einen Wert, bleibt eine Reihe, die um ≈ 2.080 m³/s pendelt — seit über zwei Jahrhunderten.

### Kein nachweisbarer Trend

Die Trendgerade: +9,6 m³/s pro Jahrhundert — statistisch nicht von Null zu unterscheiden (p = 0,83; heißt: Der Befund ist mit reinem Zufall bestens vereinbar). Aber nur im Jahresmittel.

Die Skeptiker haben also recht? **Moment.** Genau deshalb ist der Jahresmittelwert das falsche Suchbild — dazu gleich mehr.

An Heiligabend 1993 steigt der Pegel Köln auf 10,63 Meter, so hoch wie seit 1926 nicht mehr; die Flut überspült die neue Schutzmauer, rund 13.000 Kölner Haushalte sind betroffen — einschließlich der Schäden durch aufsteigendes Grundwasser. Nur 13 Monate später, am 30. Januar 1995, steigt das Wasser noch höher: 10,69 Meter — praktisch auf dem Niveau von 1926 und damit an der Spitze der modernen Messreihe; rund 1.740 Hektar Stadtgebiet stehen unter Wasser. Zwei Extremhochwasser binnen 13 Monaten: Seither gilt Winterhochwasser in Köln als wiederkehrendes Thema.

Archivbild zur Illustration: Rheinhochwasser am Kölner Altstadtufer, April 1983 — der Pegelturm steht mitten im Wasser · Foto: Günter Sers, Deutsches Bundesarchiv, CC BY-SA 3.0 DE, via Wikimedia Commons

## Wer nur den Mittelwert prüft, hat aufgehört zu fragen

Ein Fluss ist keine einzelne Zahl. Bevor wir „kein Trend“ zu den Akten legen, müssen wir wissen, *wie* dieser Fluss seine Wassermengen verteilt.

### Das Rauschen hat eine Form

Sortiert man alle 209 Jahre in Klassen, entsteht eine markante, schiefe Verteilung: ein steiler Berg bei niedrigen Abflüssen, ein langer Schwanz zu den Fluten.

### Mittelwert ≠ Median

Der Mittelwert (2.080) liegt deutlich über dem Median (1.840) — die seltenen Fluten ziehen ihn nach oben. Die Verteilung ist **stark rechtsschief**.

### Die Gauß-Glocke passt nicht

Der Rhein ist nicht „normal“ verteilt, sondern schief: viele mittlere Tage, ein langer Ausläufer seltener Fluten. In solchen Verteilungen können sich die Ränder dramatisch ändern, während der Mittelwert stillhält. Genau dort suchen wir weiter.

### Der alte Jahresgang

So floss der Rhein im 19. Jahrhundert (1821–1900 — hier runde Vergleichsfenster; die Extremwert-Rechnung in den Akten 5–6 nutzt die volle Referenzphase): viel Wasser im Winter und zur Schneeschmelze, ein trockener Spätsommer.

### Der neue Jahresgang kippt

Heute (1991–2025) ist der Januar um +620 m³/s (+29 %) angeschwollen, August und September sind um −330 / −281 m³/s gefallen. Das Muster passt zu einem wärmeren Alpenraum: mehr Regen statt Schnee, früherer Schmelz-Peak. Die alpine Speicherbewirtschaftung wirkt in dieselbe Richtung — an einem einzelnen Pegel lassen sich die Anteile nicht trennen.

### Dieselbe Jahressumme, andere Uhrzeit

Die Jahressumme bleibt fast gleich — deshalb sieht der Mittelwert nichts. **Das Wasser kommt im Winter, wenn niemand es braucht — und fehlt im Spätsommer, wenn Schifffahrt, Industrie und Kraftwerke davon abhängen.**

| Monat | Ø 1821–1900 (m³/s) | Ø 1991–2025 (m³/s) | Differenz |
|:---|---:|---:|---:|
| Jan | 2.168 | 2.787 | +619 |
| Feb | 2.371 | 2.587 | +216 |
| Mär | 2.420 | 2.476 | +56 |
| Apr | 2.199 | 2.088 | -111 |
| Mai | 2.070 | 2.077 | +7 |
| Jun | 2.219 | 2.137 | -82 |
| Jul | 2.115 | 1.845 | -270 |
| Aug | 1.922 | 1.592 | -330 |
| Sep | 1.763 | 1.483 | -280 |
| Okt | 1.697 | 1.515 | -182 |
| Nov | 1.904 | 1.872 | -32 |
| Dez | 2.220 | 2.373 | +153 |

### Zwölf Monate, zwölf Trends

Rechnet man den Trend für jeden Monat einzeln, zerfällt das „kein Trend“-Bild: Wintermonate steigen, Spätsommermonate fallen.

### Das ist kein Zufall

Januar +13,7 % (p = 0,006) · August −9,5 % (p = 0,001) · September −9,3 % (p = 0,002).

Der Test „alle Monate haben denselben Trend“ wird klar verworfen: p = 0,004.

### Warum die Jahresstatistik blind ist

Im Gesamttrend heben sich die gegenläufigen Monats-Signale fast vollständig auf: −0,6 % pro Jahrhundert (p = 0,80). Das „Rauschen“ aus Akt 1 war nie leer — es war die Überlagerung zweier gegenläufiger Signale.

| Monat | Trend %/100 Jahre | p-Wert (HAC) | signifikant (p<0,05) |
|:---|---:|---:|:---:|
| Jan | 13,7 % | 0,0062 | ja |
| Feb | 8,8 % | 0,0464 | ja |
| Mär | 1,2 % | 0,7803 | nein |
| Apr | 0,7 % | 0,8753 | nein |
| Mai | 1,8 % | 0,6052 | nein |
| Jun | -0,6 % | 0,8595 | nein |
| Jul | -6,0 % | 0,0596 | nein |
| Aug | -9,5 % | 0,0014 | ja |
| Sep | -9,3 % | 0,0021 | ja |
| Okt | -5,9 % | 0,1021 | nein |
| Nov | -2,7 % | 0,5447 | nein |
| Dez | 3,8 % | 0,4324 | nein |

### Die alte Spätsommer-Verteilung

Alle Aug/Sep-Tage von 1817–1920 als Verteilungskurve. Die trockensten 5 % lagen unter 1.090 m³/s — per Definition das alte P05.

### Aus P05 wird P14

Dieselbe Kurve für 1976–2025: kaum anders geformt — nur nach links gerutscht. Unter der *alten* 5-%-Schwelle liegen heute 14,3 % aller Tage. Was ein Ausnahmezustand war, ist fast **dreimal so häufig** geworden.

Trockentage klumpen in Dürrephasen: Der Anteil beschreibt das Ausmaß, nicht die Zahl unabhängiger Ereignisse.

### Reine Verschiebung, kein „wilder“ Fluss

Median −11 %, Streuung und Schiefe nahezu unverändert: Die Kurve behält ihre Form und wandert nur. Die Probe darauf: Rechnet man allein mit dieser Lageverschiebung, müssten heute rund 14,6 % der Tage unter dem alten P05 liegen — beobachtet sind es 13,9–14,3 %. Im Alltag ist die Verschiebung unsichtbar; am dünnen linken Rand entscheidet sie alles. Wie stark, zeigt der letzte Akt.

| Periode | Median m³/s | Anteil ≤ 1.090 m³/s (altes P05) |
|:---|---:|---:|
| 1817–1920 (frueh) | 1.690 | 5,0 % (Definition) |
| 1976–2025 (heute) | 1.500 | 14,3 % |

Am 23. Oktober 2018 fällt der Pegel Köln auf 69 Zentimeter — das damalige Rekordtief der modernen Messreihe. Buhnen und Uferbefestigungen liegen trocken; an der Rheingasse taucht zwei Tage zuvor sogar die sonst unsichtbare Mündung des Duffesbach aus dem Flussbett auf. Weil kaum noch Tiefgang bleibt, fahren Frachtschiffe nur mit einem Bruchteil ihrer Ladung. Was 1993 und 1995 zu viel war, ist jetzt zu wenig — sichtbar bis auf den Grund.

Freigelegte Duffesbach-Mündung bei Pegel 72 cm, Oktober 2018 · Foto: Marcus Bentfeld, CC BY-SA 4.0, via Wikimedia Commons

## Schön und gut — aber was heißt das konkret?

Ein paar Prozent Verschiebung klingen harmlos. Sind sie nicht. Denn an den Rändern einer schiefen Verteilung wirkt eine kleine Verschiebung wie ein Hebel.

Wir fitten eine Extremwertverteilung auf die Aug/Sep-Jahresminima der frühen Periode **1817–1920** und fragen: Wie oft treten deren „seltene“ Niedrigwasser-Schwellen in den letzten 50 Jahren (**1976–2025**) tatsächlich auf? Kein Modell-Zirkelschluss — am Ende wird schlicht *gezählt*.

Warum diese beiden Perioden? **1817–1920** ist eine lange Referenzphase vor dem großen alpinen Speicherausbau. **1976–2025** sind schlicht die jüngsten 50 Jahre.

### Die Spätsommer-Minima rutschen ab

Jeder Punkt: das trockenste Aug/Sep-Tagesmittel eines Jahres. Die rote Linie markiert, was früher ein **20-Jahres-Ereignis** war (892 m³/s). Früher (graue Punkte) wurde sie fast nie gerissen — heute reißt sie ständig: Zählen Sie die blauen Punkte darunter.

### Erwartet vs. gezählt

Graue Ringe: so oft *müsste* jede alte Schwelle in 50 Jahren fallen, wenn sich nichts geändert hätte. Rote Punkte: so oft fiel sie *tatsächlich* (1976–2025).

### Je seltener, desto härter der Hebel

Das alte 5-Jahres-Ereignis kommt ×1,9 so oft. Das alte 100-Jahres-Ereignis ×8. Das ist die Arithmetik dünner Verteilungsränder: Eine Lageverschiebung von gut 10 % im Spätsommer vervielfacht genau die Ereignisse, auf die Infrastruktur nie ausgelegt wurde.

Belastbarer Kern: die 5- bis 50-Jahres-Schwellen. Das ×8 beim Jahrhundertereignis (4 gezählte Fälle) ist als Größenordnung zu lesen, nicht als Messwert.

### Und die Hochwasser?

Gleiche Rechnung am oberen Rand: Auch alte Hochwasser-Schwellen fallen öfter — der nassere Winter wirkt. Bei den 5- bis 50-Jahres-Schwellen liegt der Faktor bei ×1,4–2, also deutlich schwächer als beim Niedrigwasser. Und bei den Jahrhundertereignissen (2 statt 0,5) sind die Zahlen zu klein für belastbare Aussagen.

| altes Niedrigwasser-Ereignis | Schwelle m³/s | erwartet in 50 J | gezaehlt | Faktor |
|:---|---:|---:|---:|---:|
| T5 | 1.053 | 10,0 | 19 | ×1,9 |
| T10 | 955 | 5,0 | 12 | ×2,4 |
| T20 | 891 | 2,5 | 11 | ×4,4 |
| T50 | 839 | 1,0 | 6 | ×6,0 |
| T100 | 813 | 0,5 | 4 | ×8,0 |

**Gegenprobe Hochwasser**

| altes Hochwasser-Ereignis | Schwelle m³/s | erwartet in 50 J | gezaehlt | Faktor |
|:---|---:|---:|---:|---:|
| T5 | 7.426 | 10,0 | 14 | ×1,4 |
| T10 | 8.313 | 5,0 | 9 | ×1,8 |
| T20 | 9.085 | 2,5 | 4 | ×1,6 |
| T50 | 9.979 | 1,0 | 2 | ×2,0 |
| T100 | 10.580 | 0,5 | 2 | ×4,0 |

## Wer hat also recht?

Beide — und keiner. Der Rhein trocknet nicht aus: Im Jahresmittel ist ein Klimasignal tatsächlich nicht nachweisbar, es geht im Rauschen unter. Aber bei genauer Betrachtung ist es da — als hochsignifikante Verschiebung der Jahreszeiten (p = 0,004), die ehemals seltene Niedrigwasser vervielfacht.

Was heißt das konkret? **Das alte 10- oder 20-Jahres-Niedrigwasser ist heute ein 4- bis 5-Jahres-Ereignis.** Für Reedereien, Werke, Kraftwerksbetreiber und Kommunen ist es damit kein Ausnahmefall mehr, sondern der neue Normalbetrieb — Ladepläne, Lagerhaltung und Kühlkonzepte müssen darauf ausgelegt sein.

Und **für die alten 50-Jahres-Ereignisse braucht es echte Pläne**: Was einmal in 50 Jahren erwartet war, trat in den letzten 50 Jahren sechsmal ein — im Schnitt also etwa alle acht Jahre. Für die Jahrhundert-Schwelle trägt die Datenlage nur die Richtung, nicht die Zahl: Auch sie fällt deutlich häufiger als früher. Wer Infrastruktur an der Statistik des 19. Jahrhunderts ausrichtet, plant für einen Fluss, den es so nicht mehr gibt.

Und die Verschiebung ist kein abgeschlossenes Kapitel. Sie passt zum Muster eines wärmeren Alpenraums: weniger Wasser wird als Schnee zwischengespeichert, mehr fließt gleich als Regen ab. Die alpine Speicherbewirtschaftung wirkt in dieselbe Richtung — beide Anteile sind mit einem Pegel allein nicht auseinanderzuhalten. Die Szenarien der Internationalen Kommission für die Hydrologie des Rheingebietes (KHR) erwarten, dass sich dieses Muster fortsetzt.

## Rekord-Watch: Tiefstmarke 650 m³/s

Der **Tiefstrekord** für August und September stammt aus dem Dürresommer **1947: 650 m³/s** — der niedrigste Spätsommer-Tageswert der ganzen Reihe (eigene Auswertung der GRDC-Tagesdaten). Im August 2022 verfehlte der Rhein ihn um **2 m³/s**.

Im August 2026 melden Medien erneut Rekord-Tiefstände. Sobald die amtlichen Abflussdaten vorliegen, entscheidet sich, ob eine 79 Jahre alte Marke fällt. Beweisen würde das wenig: Ein Rekord ist nur das, worauf alle schauen.

Am 16. August 2026 unterbietet der Kölner Pegel mit 46 Zentimetern (WSV-Messwert, ungeprüfter Rohwert) den 2018er-Tiefstand nochmals um mehr als 20 Zentimeter — nach einem ungewöhnlich frühen, trockenen Sommer. Am Südbrücken-Pfeiler liegt der Flussgrund frei; Frachtschiffe fahren kaum noch, und wenn, dann fast leer.

Aber Vorsicht, das ist der **Zentimeter-Rekord des Pegels, nicht der Abfluss-Rekord** — ein Teil der Differenz zu 2018 kann auch auf die Eintiefung der Flusssohle zurückgehen. Der Momentan-Abfluss lag am 16. August allerdings zeitweise bei rund **640 m³/s** — erstmals in Reichweite der 650er-Tagesmittel-Marke von 1947. Entschieden wird das erst mit den geprüften Tagesdaten.

Freigelegter Südbrücken-Pfeiler Anfang August 2026 — dahinter Kranhäuser und Dom · Foto: Leuni, CC BY-SA 4.0, via Wikimedia Commons

## Top 50 — wann kamen die Extreme wirklich?

Wären die letzten 30 Jahre pauschal „extremer“, müssten sie die Bestenlisten dominieren. Tun sie nicht — jedenfalls nicht dort, wo alle hinschauen.

Das ist kein Widerspruch zu Akt 6: Eine Bestenliste kürt nur die absolut extremsten Jahre der ganzen Reihe — dass eine *feste* Schwelle heute viel öfter gerissen wird, kann sie prinzipiell nicht zeigen. Beide Rechnungen messen Verschiedenes.

209 Jahre, drei Epochen. Wäre der Fluss stationär, bekäme jede Epoche ihren fairen Anteil an den 50 extremsten Jahren — proportional zu ihrer Länge. Erwartet vs. gezählt:

| Reihe | Epoche | erwartet | gezaehlt |
|:---|:---|---:|---:|
| Top 50 trockenste Jahre | vor 1920 | 24,6 | 29 |
| Top 50 trockenste Jahre | 1920–1995 | 18,2 | 17 |
| Top 50 trockenste Jahre | letzte 30 Jahre | 7,2 | 4 |
| Top 50 groesste Hochwasser | vor 1920 | 24,6 | 20 |
| Top 50 groesste Hochwasser | 1920–1995 | 18,2 | 23 |
| Top 50 groesste Hochwasser | letzte 30 Jahre | 7,2 | 7 |

Die 50 **trockensten Jahre** (gemessen am niedrigsten 7-Tage-Mittel eines Jahres) häufen sich im 19. Jahrhundert — die letzten 30 Jahre sind mit **4 von 50** eher *unter*- als überrepräsentiert. Der Unterschied liegt im Zufallsbereich — in dieselbe Richtung zeigt aber ein zweiter, diesmal signifikanter Befund: Das 100-jährliche *Jahres*-Tief stieg von **476 auf 563 m³/s** (instationäre Extremwert-Schätzung, p = 0,047). Die extremen Jahres-Tiefstwerte sind heute also entschärft, vermutlich durch Regulierung und Speicher. Der Kontrast zum Spätsommer wird dadurch nur schärfer: Selbst mit dieser Stützung häufen sich die Aug/Sep-Niedrigwasser. Die 50 größten **Hochwasser** treffen mit **7 von 50** fast exakt die Erwartung. Genau deshalb brauchte es die Akte 3–6: Das Klimasignal steckt nicht in den Jahres-Bestenlisten, sondern in der Verschiebung der Jahreszeiten — wer nur nach absoluten Rekorden sucht, wird es dort nie finden.

## Was diese Daten *nicht* sagen

Eine Analyse ist nur so glaubwürdig wie ihre Grenzen. Fünf Dinge gehören dazu:

#### Köln ≠ Deutschland

Der Rhein entwässert ein alpines Rieseneinzugsgebiet. Bodenfeuchte und Grundwasser vor Ort sind andere Messgrößen — „Dürre in Deutschland“ misst man nicht am Kölner Pegel.

#### Speicher wirken mit

Alpine Stauseen verlagern Wasser vom Sommer in den Winter — in dieselbe Richtung wie das Klima. Mit einem einzigen Pegel sind beide Effekte nicht sauber trennbar.

#### Pegelstand ≠ Abfluss

Die „Rekord-Zentimeter“ der Schlagzeilen sinken auch durch Sohlerosion. Diese Analyse nutzt durchgehend den Abfluss in m³/s.

#### Gletscher sind der kleinere Hebel

Gletschereis liefert im Jahresmittel nur 1–2 % — an einzelnen extremen Augusttagen aber bis zu einem Drittel bei Basel und, weiter flussab und damit näher an Köln, 17–21 % bei Kaub und Lobith. Der größere Klimahebel bleibt die Schneespeicherung.

#### 209 Jahre sind keine Laborreihe

Abfluss wird nicht direkt gemessen, sondern aus Wasserständen über Abflusskurven abgeleitet. Messpraxis, Rheinkorrektionen und Eichungen haben sich seit 1816 mehrfach geändert. Die GRDC/BfG-Reihe ist geprüft, aber die frühen Jahrzehnte tragen größere Unsicherheit.

## Methoden & Glossar — zum Nachprüfen

Dieser Anhang legt die Begriffe und Verfahren offen, auf denen die sechs Akte beruhen — für alle, die die Kette nicht glauben, sondern prüfen wollen. Sämtliche hier genannten Kennzahlen sind über **src/run_all.py** bzw. **src/export_viz_data.py** aus den GRDC-Rohdaten reproduzierbar.

Der p-Wert ist die Wahrscheinlichkeit, Daten wie die beobachteten (oder extremere) zu sehen, *wenn die Nullhypothese zutrifft* — hier also: wenn es gar keinen Trend gäbe. Er ist keine Wahrscheinlichkeit dafür, dass die Nullhypothese wahr ist.

Deshalb heißt p = 0,83 beim Jahresmittel: **kein nachweisbarer Trend** — nicht „bewiesene Null“. Ein hoher p-Wert ist Abwesenheit von Nachweis, nicht Nachweis von Abwesenheit.

Umgekehrt gilt Vorsicht beim Mehrfachtesten: Bei 12 Einzeltests (den Monats-Trends) sind allein durch Zufall rund 0,6 falschpositive Treffer auf dem 5-%-Niveau zu erwarten. Die Globalaussage hängt deshalb nicht an einzelnen Monaten, sondern am gemeinsamen Wald-Test (χ² ≈ 27; p = 0,004). Von den Einzelmonaten überstehen August und September auch die strenge Bonferroni-Korrektur, Januar (p = 0,006) die mildere FDR-Korrektur, Februar (p = 0,046) keine von beiden.

Abflüsse sind rechtsschief verteilt: Schiefe 2,08, Mittelwert 2.080 m³/s gegenüber Median 1.840 m³/s, Spannweite 401 bis 10.900 m³/s. Wenige sehr große Werte ziehen den Mittelwert nach oben, der Median bleibt liegen.

Eine lognormale Größe ist eine, die nach Logarithmieren annähernd normalverteilt ist. Genau deshalb rechnen wir die Trendregression auf log(Q) statt auf Q: Die Koeffizienten sind dann als **relative Änderung in Prozent** lesbar und die Fehlerstruktur ist näher an den Modellannahmen.

Der didaktische Kern: In schiefen Verteilungen können sich die Ränder stark ändern, während der Mittelwert stillhält. Wer nur auf den Mittelwert schaut, sieht die Bewegung am Rand nicht.

Geschätzt wird ein einziges Modell über alle Monatsmittel: log(Q) ~ Monats-Fixeffekte × Jahrestrend. Die Zeitvariable t ist auf 1921 zentriert und in Jahrhunderten skaliert, die Stichprobe umfasst n = 2.510 Monatsmittel. Der Interaktionsterm erlaubt jedem Monat seinen eigenen Trend.

Monatsabflüsse sind stark autokorreliert — nasse Phasen folgen auf nasse Phasen. Klassische OLS-Standardfehler wären deshalb zu optimistisch und die p-Werte zu klein. Korrigiert wird mit **Newey-West/HAC**, Lag 18.

Ergebnisse je Monat (Trend pro Jahrhundert, HAC-p):

- Januar +13,7 % · p = 0,006
- Februar +8,8 % · p = 0,046
- Juli −6,0 % · p = 0,060
- August −9,5 % · p = 0,001
- September −9,3 % · p = 0,002

Der Gesamttrend über alle Monate liegt bei −0,6 % pro Jahrhundert (p = 0,80) — also praktisch Null. Die entscheidende Frage ist deshalb nicht „gibt es einen Trend?“, sondern „ist der Trend in allen Monaten derselbe?“. Genau das prüft der Wald-Test, und er verwirft die Gleichheit: χ² ≈ 27, p = 0,004.

Daraus folgt der didaktische Schlusspunkt der ganzen Story: Summenstatistiken wie der saisonale Mann-Kendall-Test (p ≈ 0,6) sehen hier nichts — nicht weil nichts da wäre, sondern weil sich gegenläufige Monats-Trends in der Summe gegenseitig aufheben.

Die generalisierte Extremwertverteilung (GEV) beschreibt Blockextrema — hier die Jahres- bzw. Aug/Sep-*Minima* je Jahr, für die Hochwasser-Gegenprobe entsprechend die Jahres-*Maxima*. Minima werden gefittet, indem die Reihe negiert und als Maxima-Problem behandelt wird.

Die Parameter werden über **L-Momente nach Hosking** geschätzt, nicht über Maximum-Likelihood: Die MLE-Schätzung ist auf diesen Daten numerisch instabil und lieferte absurde Return-Level (in einem Lauf ein HQ100 in der Größenordnung 10¹¹ m³/s). L-Momente sind robust und für Reihen dieser Länge die belastbarere Wahl.

Das Return-Level zur Wiederkehrperiode T:

Mit Lageparameter ξ, Skalenparameter α und Formparameter k. Für T ≥ 100 ist die Extrapolation unsicher; empirisch verankert ist der Bereich T5–T50.

Das Verfahren in zwei Schritten. Erstens: Aus der frühen Periode (1817–1920) wird eine GEV gefittet und daraus werden Schwellen abgeleitet — das, was damals ein 5-, 10-, 20-, 50- oder 100-Jahres-Ereignis war. Zweitens: In den 50 Jahren 1976–2025 wird schlicht **gezählt**, wie oft diese feste Schwelle tatsächlich unterschritten (bzw. beim Hochwasser überschritten) wurde. Unter Stationarität wäre 50/T zu erwarten; der Faktor ist gezählt / erwartet.

Ergebnis: Niedrigwasser ×1,9 (T5) bis ×8,0 (T100), Hochwasser ×1,4 bis ×4,0. Beim Niedrigwasser wächst der Faktor monoton mit der Seltenheit, die absolute Zahl der Zusatzereignisse sinkt; beim Hochwasser ist der Verlauf unregelmäßiger.

Die ehrlichen Grenzen: Die Schwelle selbst stammt aus einem Modell — das Argument ist also nicht vollständig modellfrei, nur der Zählschritt ist es. Die Unsicherheit der Schwelle wird nicht in den Faktor propagiert. Und ab T ≥ 50 sind die Zählungen klein (6 bzw. 4 Ereignisse beim Niedrigwasser, 2 beim Hochwasser), sodass Poisson-Rauschen dominiert: Die Faktoren dort sind eine **Größenordnung, kein Messwert**.

Eine Verteilung kann sich auf zwei grundsätzlich verschiedene Arten ändern: in der **Lage** (Parameter μ — die ganze Kurve wandert) oder in **Skala und Form** (σ, Schiefe — die Kurve wird breiter, schwänziger, „wilder“). Der Unterschied ist der häufigste Streitpunkt in der Debatte, weil mehr Überschreitungen einer *festen* Schwelle bereits mechanisch aus einer reinen Lageverschiebung folgen.

Der Befund hier ist eindeutig: August und September zeigen fast reine Lageverschiebung — −13 % auf Monatsebene bzw. −11 % im Median der Tageswerte, bei stabiler Varianz und Schiefe. Im Winter steht eine Lageverschiebung von +620 m³/s bei unveränderter Skala und Form. Die Sommer-GEV-Skala schrumpfte sogar (354 → 222), mutmaßlich durch Speicherpufferung.

Konsistenzprobe: Rechnet man *allein* mit einer lognormalen Lageverschiebung, ergäbe sich eine Unterschreitung des alten P05 von rund 14,6 % — beobachtet sind 13,9–14,3 % (je nach Zählweise: unter bzw. bis einschließlich der Schwelle). Der Fluss wird also nicht wilder, er wandert.

- **NM7Q** — das niedrigste gleitende 7-Tage-Mittel eines Jahres. Der Standard-Kennwert für Niedrigwasser, weil er kurze Messausreißer glättet und trotzdem die Trockenphase abbildet.
- **HQ100 / NQ100** — das 100-jährliche Hochwasser bzw. Niedrigwasser: der Abfluss, der statistisch im Mittel einmal in 100 Jahren erreicht wird (aus der GEV, siehe oben).
- **P05** — das 5-%-Quantil: der Wert, den nur 5 % aller betrachteten Tage unterschreiten. Hier für Aug/Sep der frühen Periode: 1.090 m³/s.
- **Tagesmittel vs. Momentanwert** — diese Analyse arbeitet durchgehend mit geprüften Tagesmitteln. Ein Momentanwert kann kurzzeitig deutlich tiefer liegen als das Tagesmittel desselben Tages; beide sind nicht direkt vergleichbar.
- **Pegelstand (W, in cm) vs. Abfluss (Q, in m³/s)** — gemessen wird der Wasserstand, gebraucht wird die Wassermenge. Die Umrechnung erfolgt über die **W-Q-Beziehung** (Abflusskurve) der Station. Weil sich die Flusssohle eintieft, kann derselbe Abfluss über die Jahrzehnte zu immer niedrigeren Zentimeter-Werten gehören — „Rekord-Pegel“ in der Presse ist deshalb nicht dasselbe wie „Rekord-Abfluss“.

Grundlage ist die Station 6335060 (KOELN / Rhein) des Global Runoff Data Centre, Tageswerte vom 01.11.1816 bis 31.12.2025 mit 76.397 gültigen Werten (Fehlwerte −999 ausgeschlossen). Jahreskennzahlen werden nur für Jahre mit mindestens 360 Tageswerten berechnet, damit angeschnittene Randjahre die Statistik nicht verzerren. Monatsmittel werden aus den Tagesdaten selbst aggregiert.

Zwei Vergleichsfenster, bewusst unterschiedlich gewählt: Der Jahresgang (Akt 3) nutzt die runden Kalenderfenster 1821–1900 gegen 1991–2025. Die Extremwertanalyse (Akte 5–6) braucht möglichst viele Extremjahre und nutzt deshalb die lange Referenzphase 1817–1920 — vor dem großen alpinen Speicherausbau — gegen die jüngsten 50 Jahre 1976–2025.

Homogenitäts-Caveats: Abfluss wird nicht direkt gemessen, sondern über die W-Q-Beziehung aus Wasserständen abgeleitet; Messpraxis, Eichungen und die Rheinkorrektionen haben sich seit 1816 mehrfach geändert. Die GRDC/BfG-Reihe ist geprüft, die frühen Jahrzehnte tragen aber größere Unsicherheit.

Reproduktion: **src/run_all.py** erzeugt alle Kennzahlen als Konsolen-Report, **src/export_viz_data.py** die Datengrundlage dieser Seite. Die Rohdaten selbst sind nicht Teil dieser Seite — GRDC-Daten dürfen nur nicht-kommerziell genutzt und nicht an Dritte weitergegeben werden; Bezug kostenfrei nach Registrierung über [portal.grdc.bafg.de](https://portal.grdc.bafg.de).
---

## Kennzahlen im Ueberblick (maschinenlesbar)

| Kennzahl | Wert |
|:---|---:|
| Trend Jahresmittel | +9,6 m³/s pro Jahrhundert |
| p-Wert Jahresmittel-Trend | 0,83 |
| Gesamttrend ueber alle Monate | -0,6 % pro Jahrhundert (p = 0,8) |
| Wald-Test „alle Monate gleicher Trend“ | p = 0,004 — verworfen |
| Mittelwert / Median Tagesabfluss | 2.080 / 1.840 m³/s |
| Schiefe der Verteilung | 2,08 |
| Spannweite | 401 bis 10.900 m³/s |
| Median Aug/Sep frueh → heute | 1.690 → 1.500 m³/s (-11,2 %) |
| GEV-Referenzperiode / Zaehlperiode | 1817–1920 / 1976–2025 (50 Jahre) |
