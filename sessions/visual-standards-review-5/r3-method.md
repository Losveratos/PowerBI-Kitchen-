# Review r3-method: Statistik und Methodik der Visual-Standards-Simulationen

**Rolle:** Statistiker und Methodiker für Simulationen und Entscheidungsmodelle · **Gesamturteil: 3 von 5**: nachvollziehbar und reproduzierbar, aber in mehreren Kernaussagen statistisch überzogen.

## Was ich gemacht habe

Ich habe die Rohdateien gegen die Texte nachgerechnet, vier Kontrafaktum-Hebel mit dem unveränderten Skript korrekt gekoppelt neu laufen lassen (`review5/cfpair/`), einen Cluster-Bootstrap über die Vorlagen gerechnet und den Rauschboden geschätzt (`review5/noise.py`).

## Was trägt

Der Rechenkern ist gut gebaut. `drawId` gibt jedem Parameter einen eigenen Zufallsstrom, damit sehen alle vier Wege dieselbe Zukunft. Die KI-Szenarien und die OSS-Varianten sind nachweislich gekoppelt (Nutzerzahlen in den Varianten identisch). Fast jede Schlagzeilen-Zahl ließ sich bis auf Rundung nachrechnen, etwa 68 / 45 / 30 % in den drei Linsen, die 25 sicheren und 52 Münzwurf-Firmen, 3.680 € Vorsprung und 4.400 Organisationen (2.901 × 1,3 / 0,85). Den Random Forest zu verwerfen war richtig; die Offenlegung des Interessenkonflikts ist vorbildlich.

## Drei Befunde, die das Ergebnis betreffen

**1. Das Kontrafaktum ist bei allen neun harten Hebeln nicht gekoppelt.** Das Simulationsskript zieht für jeden Flag- oder Must-Eintrag mit Wert > 0 eine Zufallszahl. `rechner-personas-cf.py` löscht den Schlüssel in Variante A und setzt ihn in B auf 1. Ab diesem Punkt laufen die Zufallsströme auseinander: Mengen, andere Musts und alle späteren Ziehungen unterscheiden sich. Man sieht es an der Nutzerzahl. Bei Kostenhebeln ist sie in A und B identisch (100 %), bei harten Hebeln nur bei 14–17 % der Firmen. Den Placebo-Test habe ich nachgeholt: Dieselben Firmen mit anderem Strom wechseln ihren Mehrheitsgewinner zu 7–9 %, ohne dass sich etwas geändert hat. Sauber gekoppelt nachgerechnet sinken „nur zertifizierte Visuals“ von 19 auf 12 % und „Support mit SLA“ von 16 auf 9 %, beide damit unter Bibliothek und Größe (16 %). Die Spitze hält: Copilot 90 %, kein Lizenzbudget 57 %. „Harte Weichen schlagen jeden Kostenhebel“ gilt also nur für die Top 7.

Dazu kommt ein konzeptioneller Punkt. Die Kipp-Raten der Hebel sind nicht vergleichbar. Ein Must von 0 auf 1 zu setzen, das drei von vier Wegen per Definition ausschließt, ergibt fast automatisch 91 %; das ist Tautologie, kein Befund. Kostenhebel dagegen werden zwischen willkürlich gewählten Extremwerten verschoben. Fair wäre, jeden Hebel über seine realistische Spannweite bzw. Prävalenz zu variieren (Copilot-Must: 9 % in der 100k-Population) und eine Varianzzerlegung zu rechnen. Statt des schwellenempfindlichen Mehrheits-Kippens sollte die Verschiebung der Gewinner-Anteile berichtet werden.

**2. Hinter den 10.000 Firmen stehen effektiv rund 55, nach Nutzern 18.** Rahmenbedingungen und Musts, also das, was die Ergebnisse treibt, stammen aus 147 Vorlagen mit sehr ungleichem Gewicht: Die Top 20 stellen 54 % der Firmen. Für das Gesamtrating nach Nutzern ist es noch schärfer. Eine Sonnet-Vorlage (D17, eine IT-Beratung mit 95 MA und einem Mandantenportal für 300–2.500 externe Leser) wird auf 260 Kleinfirmen mit rund 17 Nutzern je Mitarbeitendem skaliert. Diese 260 Firmen stellen 20,5 % aller 1,79 Mio. Nutzer. Ohne D17 dreht die Schlagzeile: Deneb 36,5 % vor Paid 31,1 %. Mit Nutzern auf die Belegschaft gedeckelt: Deneb 35 vor Paid 30. Im Cluster-Bootstrap über die Vorlagen liegt P(Paid > Deneb) bei 0,52, ein Münzwurf. Auch bei den 150 Personas reicht das 90-%-Intervall für Deneb minus Paid von −12 bis +16 Pp. 27 % der Firmen haben mehr Nutzer als Mitarbeitende; Kleinfirmen tragen 49 % der Nutzer, Konzerne 7,7 %, nicht umgekehrt wie im Text begründet.

**3. Die Gewinner-Definitionen sind vermischt und falsch beschriftet.** Gerechnet wird der nutzergewichtete Mittelwert der Gewinner-Anteile über die Zukünfte. Beschriftet ist er als „Anteil der Nutzer, deren Firma damit am günstigsten fährt“ bzw. „in den meisten Zukünften“, also als Mehrheit. Nach der Mehrheitsdefinition ergibt sich Paid 48 % gegen Deneb 33 %, nicht 37 zu 36. Die OSS-Finanzierung nimmt dann ausgerechnet die Mehrheitsquote 47,5 % statt der 38 % aus der Schlagzeile.

## Weitere Punkte

- **C2:** Die 47 % lassen die 10,9 % ohne jeden zulässigen Weg weg. Richtig wären 57,5 %. Die +60 % sind der Preis aller Regeln zusammen, nicht der „eines K.O. zu viel“.
- **C4 und „1 von 5“:** Die Sicherheit der Antwort vermischt Kostenunsicherheit mit der Unsicherheit der Firma über ihre eigenen Musts (bei 117 von 150 Personas der stärkste Treiber) und mit der gesetzten Modellunsicherheit von 25 % je Weg. Die Münzwurf-Zahl springt mit der Schwelle von 35 über 52 auf 71. „1 von 5 hätte anders gewählt“ zählt Organisationen mit nur einem zulässigen Weg als Treffer. Unter denen, die wirklich wählen können, sind es 29 %.
- **C6:** „Ohne harte Weiche“ ist unbedingt gerechnet. Nur unter Firmen ohne K.O. gewinnt Paid bei den Kleinen in 68 % der Fälle, ab 1.000 MA Deneb in 37 % (n = 101).
- **C5:** Die 1–13 € Ersparnis sind im Konzern relativ 10–14 % für die Bau-Wege. Platz 1 der 150er-Seite wechselt mit dem KI-Szenario von Paid zu Deneb.
- **C10:** Der Vorsprung wird nur über Zukünfte gemessen, in denen OSS gewinnt, und ist damit nach oben verzerrt. Bei 57 % der OSS-Mehrheitsfirmen gewinnt OSS in weniger als 60 % der Zukünfte, ein Beitrag würde dort kippen. Firmen mit „kein Lizenzbudget“ dürften nach der Rechner-Logik gar nicht zahlen. Die Größenordnung „zweistellige € je Firma“ bleibt plausibel, „kein Verlust bis 840 €“ ist so nicht belegt.
- **100k:** Musts werden unabhängig gezogen; die drei Claude-Schätzer sind sich auffällig einig, was eher für korrelierte Vorannahmen spricht als für Robustheit. Der Bestand als „stärkster Prädiktor“ widerspricht den 12 % im 10k-Kontrafaktum.

## Annahme oder Rechnung?

Rechenfehler im engeren Sinn sind nur die gebrochene Kopplung und die zu niedrig angegebenen 47 %. Alles andere ist Darstellung (Definitionen, Etiketten, fehlende Intervalle) oder Design (Vorlagen-Konzentration, Hebel-Spannen). Die OSS-Pflege-Parameter sind eine Setzung der Autoren für ihr eigenes Produkt. Rechnerisch ist das Szenario sauber; ob es eintritt, belegt die Simulation nicht. Absichtliches Schönen sehe ich nicht. Mehrere Fehler wirken sogar gegen Open Source.

## Was vor der Veröffentlichung passieren sollte

1. Das Kontrafaktum gekoppelt neu rechnen (Hebel auf 0 statt löschen) und einen Placebo-Lauf ausweisen.
2. Intervalle per Bootstrap über die Vorlagen berichten; Platz 1 nur nennen, wenn das Intervall der Differenz die Null ausschließt.
3. Externe Leser deckeln oder getrennt ausweisen; Jackknife je Vorlage.
4. Eine Gewinner-Definition festlegen und durchgängig beschriften.
5. C2, C6 und C10 wie oben korrigieren.

Danach ist die Kernbotschaft belastbar: Kein Weg gewinnt immer, und Regeln entscheiden vor Kosten. Die Rangfolge Paid gegen Deneb ist es nicht.
