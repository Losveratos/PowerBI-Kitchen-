# Review r4-paid: Einkaufssicht, Anwalt von Paid

Ich habe sechs Jahre Preise und Enterprise-Verträge für ein Paid-Visual verhandelt und kaufe heute Software für einen Konzern ein. Ich lese die drei Ergebnisse mit der Frage: Wird Paid systematisch benachteiligt?

**Gesamturteil: 3 von 5.** Die Rechnung ist sauber, die Kostenlinse belastbar: Auf Kosten gewinnt Paid in 68 % der Fälle. Das habe ich mit dem Rechenkern auf 40.000 Firmen auf 0,1 Pp. genau nachgerechnet. Die auffälligen Schlagzeilen entstehen jedoch durch K.O.-Regeln, und die behandeln Paid härter als Core.

## Was ich nachgerechnet habe

Ich habe den Rechenkern mit der Population aus `population.json` laufen lassen und jeweils eine Annahme geändert (Skripte in `review5/work/`). Ergebnis der Must-Linse (Anteil Gewinner):

| Variante | Paid | Core |
|---|---|---|
| Basis | 28,4 | 30,6 |
| Exit-Must nur Warnung | 36,1 | 29,9 |
| Report Server für Paid nur Warnung | 32,4 | 30,3 |
| RDL-Must für alle vier K.O. (Core Cap 1) | 28,4 | 18,6 |
| RDL-Must aus | 31,9 | 22,8 |
| Alle Korrekturen plus Preis 3 % und EUR-Kurs | 42,8 | 17,0 |

Die Aussage "Core 30, Paid 28" ist also keine Aussage über Tools, sondern über drei Modellentscheidungen.

## Wo Paid benachteiligt wird

**1. RDL-Asymmetrie.** Das Must "Paginated Reports" schließt Paid, OSS und Deneb per K.O. aus, Core nur mit Warnung. Der Rechner schreibt selbst, dass der zweite Bau in RDL bei allen vier Wegen anfällt. Core-SVG-Measures laufen in RDL nicht. 15 % der Firmen haben dieses Must. Das ist der größte Einzelfehler und erklärt die 87 % im Kontrafaktum.

**2. Report Server.** Das K.O. für Paid ist hart, obwohl der Rechner "Hersteller-Lizenzwege prüfen" schreibt. Zebra BI nennt Report-Server-Unterstützung mit Lizenzschlüssel, Inforiver hat eine On-Prem-Variante mit selbst generiertem Visual (Websuche, help.zebrabi.com, docs.inforiver.com). Eine Warnung wäre fair.

**3. "Kein Vendor-Lock-in" als Binär-Must.** Mit 25 % der häufigste K.O.-Grund für Paid. Im Einkauf heißt das fast immer Exit-Klausel, Datenexport, Kündigungsrecht, nicht "kein Anbieter". Dazu kommt, dass der Ausstieg ohnehin als Kennzahl bepreist wird, mit Bindungsgraden (Paid 0,95, OSS 0,8), die laut Rechner "Autoren-Schätzung, keine Messung" sind. Ein OSS-Visual hat ebenfalls ein Property-Schema, an dem die Berichte hängen.

**4. Darstellung.** "Jeder zahlt, nur woanders" zeigt Anteile. Absolut hat Paid die niedrigsten eigenen Stunden (0,10 gegenüber 0,16 bis 0,22 FTE) und die niedrigsten Kosten je Viewer (293 gegenüber 443 bis 567 € im Median). Die erste Kachel ("30 % höchster Anteil") nimmt die Linse mit den meisten LLM-Wahrscheinlichkeiten und nicht die Kostenlinse.

**5. Preislogik.** 5 % Preissteigerung im Modus stützt sich auf Modellwechsel und Microsofts Pro-Erhöhung. Konzernverträge haben Preisbindung oder CPI-Deckel. USD wird 1:1 als EUR gerechnet. Beides ist klein (1 bis 3 Pp.), geht aber nur in eine Richtung.

## Wo Paid zu gut wegkommt (der Fairness halber)

Die Staffeln (bis minus 80 %), der Inforiver-Anker mit 33 € und der Anforderungs-Score (Paid 71 %, Core 64 %) laufen für Paid. Core hat in 100 % der Firmen mindestens eine Must-Warnung (IBCS nur per Workaround), Paid in 0 %. Das ist ein Argument für Paid, das in "Core 30 %" untergeht, und das 70/30-Ranking ändert es kaum (Core 31,7 gegen Paid 30,1).

## Wo die Autoren befangen sind

Die Offenlegung nennt den Konflikt nur für OSS, nicht die Modellentscheidungen gegen Paid. Mehrere OSS-Bewertungen sind auf ChartKitchen zugeschnitten (agentic, a11y, Daten im Tenant). Beim Bus-Faktor bekommt OSS (ein Maintainer) Cap 3, Deneb mit demselben Zustand Cap 2. Im 1-FTE-Szenario wird OSS auf Paid-Zuverlässigkeit gesetzt (Abkündigung 2 %), obwohl eine Person ein Klumpenrisiko ist und ein Hersteller mit einer Stelle weder Support noch Vertrieb noch Recht abdeckt. Die Finanzierungsrechnung (59 bis 85 € je Firma) stimmt arithmetisch, setzt aber volle Beteiligung und 4.400 Einführer je Jahr voraus, beides gesetzt.

## Bewertung der Kernaussagen

Halten: C4, C5. Wackeln: C1, C2, C3, C6, C7, C8, C10, C11, C12. Nicht beurteilbar: C9. Die qualitative Linie bleibt: Größe, Preisniveau, Bestand und harte Weichen entscheiden, nicht das Tool. Die Zahlen aber, die als Spitzenreiter genannt werden, hängen an den Modellierungsentscheidungen oben.

## Empfehlung vor Veröffentlichung

RDL symmetrisch behandeln, Report Server und Exit als Warnung mit Herstellerprüfung, Linsen gleichrangig und mit Spannweite der drei Schätzer zeigen, Absolutwerte neben die Anteile, den Bindungsgrad für OSS und Paid angleichen oder getrennt zeigen und den Satz zur Offenlegung auf die genannten Punkte erweitern.
