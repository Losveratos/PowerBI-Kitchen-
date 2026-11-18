# Review r5-oss: „Open Source mit 1 FTE" aus Sicht eines Maintainers

*Rolle: langjähriger Maintainer eines Open-Source-Power-BI-Visuals, Deneb-Praktiker, skeptisch gegenüber KI-Produktivitätsversprechen.*

## Kurzurteil

Das Rechenwerk ist sauber. Ich habe einen Teil des Szenarios „fertig und gepflegt" (2.500 Firmen, 200 Zukünfte) mit dem unveränderten Rechenkern neu gerechnet und die gespeicherten Gewinneranteile exakt reproduziert. Die Finanzierungsarithmetik stimmt ebenfalls: 4.437 ≈ 4.400 Organisationen, 59–85 € bzw. 588–846 € je Firma, 7,3 % der OSS-Gewinner unter 1.770 €. Die Rechnung ist also nicht falsch. Strittig sind die Annahmen, und das vor allem an der Stelle, die die Autoren selbst betrifft. **Note: 3 von 5**, verwendbar nach Korrekturen am OSS-1-FTE-Teil.

## Was eine FTE wirklich trägt

Das Szenario rechnet nur die Firmenseite. Weniger Breaking-Events, eine Wartungsquote von 14 statt 22 %, weniger Governance und ein Abkündigungsrisiko „wie Paid": Das alles wird gebucht, als ob eine Person das für alle liefert. Die Person selbst kommt im Modell nicht vor. Rechnen wir ihre Last grob durch:

- **Nutzerbasis:** 2.092 neue OSS-Mehrheitsfirmen pro Jahr (4.400 × 47,6 %). Nach fünf Jahren sind das rund 10.000 Organisationen. Zum Vergleich: Zebra BI betreut über 3.000 Kunden mit rund 70 Beschäftigten (Drittanbieter-Schätzung 2026).
- **Zertifizierung:** Laut Microsoft-FAQ muss jedes Update eines zertifizierten Visuals neu zertifiziert werden. Das dauert bis zu drei Wochen und verlangt die neueste API und die neuesten Tools. ChartKitchen hatte zwischen Juli und Oktober 2026 93 Releases. Diesen Takt gibt es mit Zertifizierung nicht mehr; Releases müssen gebündelt, getestet, eingereicht und bei Ablehnung nachgebessert werden.
- **Laufende Pflichten:** API- und pbiviz-Migrationen, Dependency-Security, Regressionstests über Desktop, Service, Mobile, Export und Embedded, Issue-Triage, Doku. Schon 0,1 Issues je Firma und Jahr sprengen ab etwa 5.000 Firmen die 1.500 Stunden. Urlaub, Krankheit und Bus-Faktor sind dabei noch gar nicht eingerechnet.

Aus meiner Erfahrung ist „1 FTE so verlässlich wie ein Nischen-Hersteller" für tausende Organisationen nicht realistisch. Realistisch sind mindestens 2 FTE wegen der Vertretung, eher 3.

## Was meine Neuläufe zeigen

Ich habe die Sensitivitäten gepaart neu gerechnet, auf denselben 2.500 Firmen und mit KI im Konzern. Anteil der Firmen, in denen der Weg gewinnt:

| Variante | Paid | OSS | Deneb |
|---|---|---|---|
| heute | 38 % | 10 % | 28 % |
| gepflegt (Autoren) | 26 % | 38 % | 16 % |
| Abkündigungsrisiko wie OSS heute | 27 % | 36 % | 17 % |
| Fixes wie heute (Pflege kommt nicht hinterher) | 28 % | 34 % | 18 % |
| 846 € Beitrag als Kosten (1 FTE, jede zehnte zahlt) | 28 % | 35 % | 18 % |
| fair: Vorlagenbibliothek auch für Deneb | 23 % | 34 % | 22 % |
| kombiniert realistisch | 26 % | **24 %** | 27 % |
| 3 FTE, jede zehnte zahlt (≈ 2.150 €) | **31 %** | 27 % | 20 % |

Das spricht für die Autoren: Einzelne Verschlechterungen kosten OSS nur 2–4 Pp, und die Aussage „das fertige Visual ist der größere Hebel" hält. Der Spitzenplatz hält aber nicht. Unter einer kombinierten realistischen Setzung wird daraus ein Dreikampf, und mit der FTE-Zahl, die ich für nötig halte, liegt Paid wieder vorn.

## Finanzierung: Arithmetik richtig, Schluss voreilig

Drei Punkte.

1. **Der Vorsprung ist bedingt gemessen.** `gapYr` wird nur in den Zukünften erfasst, in denen OSS gewinnt, und ist deshalb per Konstruktion positiv. Unter den OSS-Mehrheitsfirmen gewinnt OSS im Median nur 57 % der Zukünfte, und bei 27 % dieser Firmen sind es unter 50 %. Der Satz „bis 840 € kein Verlust" ist fester Text im Report-Skript und beruht auf keinem Neulauf. Mit 846 € als echten Kosten kippt der Gewinner bei 6 % der Firmen.
2. **Zahlungsbereitschaft.** „Jede zehnte zahlt" wird als pessimistischer Fall präsentiert. Für B2B-OSS ohne Gegenleistung ist das eher optimistisch. Tidelift 2024 meldet rund 60 % unbezahlte Maintainer. Der Deneb-Maintainer pflegt in seiner Freizeit und wirbt um Sponsoren. Der eigene Rechner setzt die OSS-Sponsoring-Bereitschaft auf 0 · 0 · 1.000 €. Fair ist allerdings auch: Der Erwartungswert davon (≈ 167 €) liegt schon über 59–85 € bei voller Beteiligung.
3. **Fluss statt Bestand und Ein-Visual-Annahme.** Die 4.400 sind Einführungen pro Jahr, berechnet aus gesetzten Wahrscheinlichkeiten. Wählen alle OSS-Gewinner dasselbe Visual? Forks und Konkurrenzprojekte kommen nicht vor.

## Deneb und KI

Die Deneb-Lernkurve halte ich für Vorlagen-Bauer für plausibel (35 h Schulung, bis zu 180 h Einarbeitung). Optimistisch ist die flache Schulung für Vorlagen-Nutzer (2,75 h) im Self-Service, denn jede Formatänderung außerhalb der Properties ist JSON-Arbeit. Ein Widerspruch: Deneb ist selbst ein zertifiziertes Visual mit einem einzigen Maintainer, bekommt aber ein Abkündigungsrisiko von 1–3–6 %. Die gepflegte OSS-Lösung bekommt sogar 1–2–4 %. Im Modell wirkt das kaum (Deneb auf OSS-Risiko: −1,4 Pp), die Logik sollte trotzdem einheitlich sein.

Die KI-Faktoren sind einseitig. Bei Wartung und Fixes liegen die Obergrenzen bei etwa 1,0, obwohl METR 2025 gerade für die Wartung reifer Repos eine Verlangsamung um 19 % misst. Weil die Faktoren für alle Wege ähnlich sind, bleibt die Rangfolge stabil (C5 hält). Die Ersparnis von 1–13 € ist aber ein Echo der Eingaben und keine Erkenntnis. Die Voreinstellung „KI-Eigenentwicklung 200 h" stützt sich auf die eigene Fallstudie („~20 h bis Beta"). ChartKitchen hat heute rund 19.000 Zeilen TypeScript, vier Audits und ist noch nicht gelistet. Das passt nicht zu 200 h.

## Interessenkonflikt

Die Offenlegung ist vorbildlich explizit („beschreibt genau ihren Fall"). Offenlegen allein neutralisiert aber nicht. Nur der eigene Weg bekommt eine geschenkte Pflege-FTE, und die Überschrift lautet „Die FTE wäre bezahlbar". Fair wäre ein symmetrischer Vergleich: dieselbe FTE für eine Deneb- oder Core-Vorlagenbibliothek. Eine Bibliothek allein hebt Deneb schon von 28 % auf 35 %.

## Was ich vor der Veröffentlichung verlangen würde

1. Ein Upstream-Kapazitätsmodell, Varianten mit 1, 2 und 3 FTE und eine Bandbreite inklusive „Pflege scheitert" (≈ „nur fertig": OSS 27 %, Paid 31 %).
2. Den Beitrag als `pOver.oss.support` neu rechnen statt mit dem bedingten Vorsprung argumentieren.
3. Ein symmetrisches Szenario für eine gepflegte Deneb- bzw. Core-Bibliothek.
4. Die OSS-Ergebnisse nach Autorengruppe der Vorlagen trennen: Opus-Personas haben 18 OSS-Mehrheiten, Sonnet-Personas 4.
5. Die Überschrift neutral formulieren und „bezahlbar" in „offene Frage: Wer zahlt?" ändern.

Daten meiner Neuläufe: `review5/r5oss/` (`v1`–`v12`, `ana.py`).
