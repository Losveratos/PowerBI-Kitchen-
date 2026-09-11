# Blindschätzung Runde 2 — Visual-Standards-Rechner

**Rolle:** Power-BI-Architekt mit Controlling-Hintergrund (DACH)
**Methode:** Blindschätzung. Keine Datei im Repository gelesen, kein Rechner-Code gesichtet.
Grundlage: Erfahrungswerte aus IBCS-Rollouts, Zebra-BI-/Inforiver-Projekten, Deneb-Template-Arbeit
und SVG-Measure-/DAX-Bibliotheken. Alle Werte als Dreipunkt **[min, wahrscheinlich, max]**.
**Datum:** 2026-09-11

## Ansätze
| Kürzel | Ansatz |
|---|---|
| `paid` | Zebra BI / Inforiver (kommerzielle IBCS-Visuals, Klick-Werkzeug) |
| `oss` | Fertiges OSS-Custom-Visual (z. B. ChartKitchen byDatenWG) |
| `deneb` | Deneb / Vega-Lite-Templates (Code) |
| `core` | Core Visuals + SVG-Measures / DAX-UDFs (Code) |

Datenmodell ist vorhanden — Modellierungsaufwand ist in allen Zahlen **nicht** enthalten.

---

## (a) Faktor Stunden „einfach" gegenüber „mittel" (mittel = 1,0)
Einfach = Balken mit Abweichung, KPI-Karte. Mittel = Tabelle mit Charts, Kleine Multiples, Szenario-Notation.

| Ansatz | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| paid | 0,30 | 0,50 | 0,70 | Beides ist Feld-Drag-and-drop; die Spreizung bleibt klein, weil auch Small Multiples und Szenario-Notation im Produkt eingebaut sind. |
| oss | 0,30 | 0,45 | 0,65 | Ähnlich klickgetrieben, aber mittlere Charts brauchen mehr manuelle Format-/Rollen-Konfiguration als beim kommerziellen Pendant. |
| deneb | 0,20 | 0,30 | 0,45 | Ein einzelnes Balken-Spec ist in Vega-Lite trivial, sobald `layer`/`facet`/`concat` dazukommt, steigt der Aufwand überproportional. |
| core | 0,15 | 0,30 | 0,45 | Einfache Fälle lösen native Visuals fast ohne Code, mittlere zwingen zum Sprung in SVG-Measures — das ist der teuerste Bruch im ganzen Vergleich. |

## (b) Faktor Stunden „komplex" gegenüber „mittel" (mittel = 1,0)
Komplex = Wasserfall mit Abweichungen, kombinierte Charts, Kommentierung.

| Ansatz | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| paid | 1,2 | 1,6 | 2,2 | Wasserfall, Kombi-Charts und Kommentarfunktion sind Produktfeatures; es bleibt Konfigurations-, kein Konstruktionsaufwand. |
| oss | 1,5 | 2,2 | 3,5 | Der Featureschnitt fertiger OSS-Visuals endet meist vor Kommentierung und beliebigen Kombis — Workarounds oder Verzicht. |
| deneb | 1,8 | 2,5 | 4,0 | Wasserfall-Transformationen, Annotationslayer und Kombi-Achsen sind in Vega-Lite machbar, aber Handarbeit mit hohem Debug-Anteil. |
| core | 2,0 | 3,0 | 5,0 | Jede Abweichungsbrücke und jedes Kommentar-Element muss als DAX/SVG-String erzeugt und getestet werden; Skalierung und Klickverhalten kommen obendrauf. |

## (c) Typischer Chart-Mix in Controlling-Reports (Anteile in %)
| Klasse | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| einfach | 40 | 55 | 65 | Der Löwenanteil klassischer Management-Reports sind KPI-Kacheln und einfache Ist-/Plan-Balken. |
| mittel | 25 | 33 | 42 | Strukturtabellen mit Inline-Charts und Small Multiples sind das IBCS-Arbeitspferd, aber nicht die Mehrheit. |
| komplex | 5 | 12 | 20 | Wasserfall, Kombi und Kommentierung konzentrieren sich auf wenige Kernseiten je Report. |
Summe der wahrscheinlichen Werte = 100 %.

## (d) Lernrate je Verdopplung gebauter Charts je Ersteller (% Aufwandssenkung)
| Ansatz | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| paid | 5 | 10 | 15 | Wenig Wiederholungsgewinn, weil die Standardisierung bereits im Produkt steckt und das Klicken nicht schneller wird. |
| oss | 7 | 12 | 18 | Etwas mehr Lerneffekt durch Kenntnis der Eigenheiten und Grenzen des Visuals. |
| deneb | 12 | 18 | 25 | Klassische Code-Lernkurve: Snippet-Vorrat, Encoding-Routine und Debug-Erfahrung wirken stark. |
| core | 12 | 20 | 28 | Höchste Ausgangskomplexität, daher der größte relative Gewinn pro Verdopplung — bei gleichzeitig höchster Streuung nach Personenqualifikation. |

## (e) Wirkung einer fertigen Vorlagenbibliothek (Faktor auf Stunden, <1 = Ersparnis)
| Ansatz | Erstbau [min/wahrsch./max] | Wiederverwendung [min/wahrsch./max] | Begründung |
|---|---|---|---|
| paid | 0,80 / 0,90 / 0,95 | 0,75 / 0,85 / 0,95 | Die Vorlage ist das Produkt; zusätzliche Bibliotheken sparen nur noch Layout- und Benennungsentscheidungen. |
| oss | 0,60 / 0,75 / 0,90 | 0,50 / 0,70 / 0,85 | Vorkonfigurierte Visual-Definitionen nehmen vor allem die Feldrollen- und Formatarbeit ab. |
| deneb | 0,25 / 0,40 / 0,55 | 0,15 / 0,30 / 0,45 | Größter Hebel: ein geprüftes IBCS-Spec-Set ersetzt den teuersten Teil, den Neubau des Specs. |
| core | 0,30 / 0,45 / 0,60 | 0,20 / 0,35 / 0,50 | Eine UDF-Bibliothek für SVG-Bausteine kapselt den Großteil der Fummelarbeit, Einbindung und Test bleiben. |

## (f) Anteil Varianten-Wildwuchs im Self-Service, den Vorlagen NICHT verhindern (0 = alles verhindert, 1 = nichts)
| Ansatz | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| paid | 0,15 | 0,25 | 0,40 | Das Visual erzwingt Notation und Layout weitgehend selbst, Abweichen kostet den Nutzer aktiv Mühe. |
| oss | 0,25 | 0,40 | 0,55 | Gleiche Mechanik, aber lückenhafter Featureschnitt treibt Nutzer bei Speziallayouts zurück zu Core Visuals. |
| deneb | 0,35 | 0,50 | 0,65 | Self-Service-Ersteller fassen JSON nicht an; sie greifen zu nativen Visuals statt zur Vorlage — Drift entsteht daneben, nicht darin. |
| core | 0,45 | 0,60 | 0,80 | Ohne technische Sperre bleibt jedes native Visual frei formatierbar; Vorlagen sind hier reine Empfehlung. |

## (g) Null-Option ohne Standard
| Größe | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| Stunden je Chart ad hoc | 1,5 | 3,0 | 6,0 | Ohne Vorlage wird jedes Chart neu gestaltet und neu diskutiert; Formatarbeit dominiert die Zeit. |
| Wartungsquote p. a. (% des Erstbauaufwands) | 15 | 30 | 50 | Uneinheitliche Einzellösungen brechen bei Modell-, Layout- und Zeitraumänderungen einzeln und müssen einzeln repariert werden. |
| Minuten je Viewer und Woche | 3 | 8 | 15 | Umlernen bei jeder abweichenden Skala, Farbe und Vorzeichenlogik kostet Lesezeit und erzeugt Fehlinterpretationen. |
| Rückfragen je 100 Viewer und Jahr | 40 | 120 | 300 | „Warum ist die Abweichung hier rot und dort blau?" ist der Standard-Ticket-Typ uneinheitlicher Reportlandschaften. |

## (h) Neue Standard-Reports je Ersteller und Jahr
| min | wahrsch. | max | Begründung |
|---|---|---|---|
| 3 | 6 | 12 | Ein typischer Controlling-nahe BI-Ersteller liefert grob einen neuen Standardbericht je zwei Monate, neben Betrieb und Ad-hoc-Arbeit. |

## (i) Jährlicher Produktivitätsgewinn durch KI-Assistenz 2026–2031 (%/Jahr)
| Kategorie | min | wahrsch. | max | Begründung |
|---|---|---|---|---|
| Code-Ansätze (deneb, core) | 8 | 15 | 25 | Vega-Specs, DAX und SVG-Strings sind textuell, prüfbar und damit genau die Arbeit, die Assistenzsysteme am stärksten beschleunigen. |
| Klick-Werkzeuge (paid, oss) | 2 | 5 | 9 | GUI-Arbeit lässt sich kaum generieren; Gewinne kommen nur indirekt über Dokumentation, Feldwahl und Review. |

## (j) Jährliche Preissteigerung 3rd-Party-Visual-Lizenzen (%)
| min | wahrsch. | max | Begründung |
|---|---|---|---|
| 3 | 6 | 10 | Nischen-Software mit hoher Wechselhürde liegt üblicherweise spürbar über der allgemeinen Inflation, mit gelegentlichen Modellwechsel-Sprüngen nach oben. |

---

## Hinweise zur Verwendung
1. Die Faktoren in (a) und (b) sind **relativ zu „mittel"** definiert — im Rechner muss „mittel" die Basisgröße in Stunden sein.
2. (e) wirkt **multiplikativ nach** der Lernkurve aus (d); beide gemeinsam dürfen den Aufwand nicht unter eine physikalische Untergrenze (~0,25 h je Chart) drücken.
3. (f) und (g) sind die einzigen Größen, die den Nutzen auf der **Viewer-Seite** tragen; sie dominieren das Ergebnis bei großen Nutzerzahlen und sind gleichzeitig am schwächsten belegt.
4. Größte Ergebnisunsicherheit insgesamt: (g) Minuten je Viewer und Woche sowie (f) — beide mit Spannweiten über Faktor 4.
