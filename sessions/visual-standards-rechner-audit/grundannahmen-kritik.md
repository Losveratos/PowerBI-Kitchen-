# Grundannahmen des Visual-Standards-Rechners: was fehlt, was zu ungenau ist, wo Quellen fehlen

**Stand:** 11.09.2026, nach dem Annahmen-Audit (v0.7). **Charakter:** Kritik der Prämissen und des Rechenmodells, keine Parameterprüfung mehr (die steht in `README.md`). Alles hier ist Einschätzung des Autors dieser Zeilen, gestützt auf die sechs Prüfberichte, das Monte-Carlo-Verhalten und den Code. Wo eine Aussage belegt ist, steht die Quelle; wo nicht, steht „Meinung“.

## 1. Die zehn Prämissen, auf denen alles steht

| # | Prämisse im Rechner | Was daran fragwürdig ist | Schwere |
|:--|:--|:--|:--|
| P1 | **Vier Ansätze sind Alternativen; einer wird gewählt.** | Real endet fast jede Organisation bei zwei Ansätzen (80 % gekauft + Deneb für Sonderfälle, oder Core + ein gekauftes Visual für den Wasserfall). Koexistenz erzeugt doppelte Schulung, doppelte Governance, zwei Wartungszyklen. Der Rechner kann das nicht darstellen, also rechnet er einen Fall, der selten eintritt. | hoch |
| P2 | **Es gibt keine Null-Option.** | „Kein Standard, weiter wie bisher“ fehlt als fünfter Vergleichsfall. Ohne ihn kann der Rechner nicht sagen, ob sich ein Standard überhaupt lohnt, nur welcher der vier billiger ist. Die Kosten des Status quo (Leser interpretieren uneinheitliche Charts, Ersteller bauen jedes Mal neu, Excel-Parallelwelten) sind der eigentliche Business Case und stehen nirgends. | hoch |
| P3 | **Kosten entscheiden, Nutzen ist ein Score.** | Der Nutzen (Lesezeit, weniger Rückfragen, Entscheidungsqualität, Time-to-value) taucht nur als Nutzwert-Score mit Regler auf. Ein Ansatz, der acht Wochen früher liefert, hat im Rechner keinen Vorteil. Ehrlich ist: für die Nutzenseite gibt es keine belastbaren Zahlen außer herstellernahen Studien (Zebra: „46 % schneller lesen“, interessengeleitet). Aber die Lücke gehört benannt, nicht verschwiegen. | hoch |
| P4 | **„Datenmodell und Measures vorhanden“ gilt für alle vier gleich.** | Sie gilt für keinen gleich. Zebra und Inforiver brauchen Szenario-Felder in bestimmter Struktur, Deneb braucht berechnete Felder für Transforms, Core + SVG braucht eine Measure- oder UDF-Bibliothek, die selbst Datenmodellarbeit ist. Diese Vorleistung ist je Ansatz verschieden groß und steht in keinem Parameter. Sie trifft Core am härtesten, der Rechner rechnet Core also eher zu günstig im Aufbau, nicht zu teuer. | hoch |
| P5 | **Ein „Standard-Report“ ist eine Einheit, ein Chart ist ein Chart.** | Ein Report hat 3 bis 30 Charts, ein Chart ist ein Balken oder ein Wasserfall mit Szenario-Notation. Der Rechner mittelt beides weg: Reports × Charts je Report × Stunden je Chart. Core ist beim Balken fast kostenlos und beim Wasserfall mit Abweichungen katastrophal; Paid ist überall gleich. Ein einziger Mittelwert je Ansatz verschleiert, dass der Chart-Mix die Rangfolge dreht. | hoch |
| P6 | **Kosten skalieren linear in Reports, Charts, Viewern.** | Keine Lernkurve (der zwanzigste Deneb-Chart ist schneller als der dritte), keine Reifung der Vorlagenbibliothek, keine Koordinationskosten ab 50 Erstellern, keine Sättigung. Die Skalen-Simulation zeigt deshalb glatte Kurven, die es so nicht gibt. Bei großen Mengen ist die Linearität die dominante Annahme des gesamten Modells: Rollout ist im Großkonzern-Preset 60 % der Kosten. | hoch |
| P7 | **Der Horizont endet, und danach ist alles wertlos.** | Am Ende von 3 Jahren hat eine Vorlagenbibliothek (Deneb, Core, OSS) noch Wert, eine Lizenz nicht. Ohne Restwert bestraft der Rechner bei kurzem Horizont jeden Ansatz mit Aufbaukosten. Das ist der klassische Fehler beim Vergleich von Kauf und Eigenbau und hier unbehandelt. | mittel |
| P8 | **Die Entscheidung fällt einmal, zu Beginn, für H Jahre.** | Keine Pilotphase, kein Ausstieg nach Jahr 1, kein Wechsel, kein Optionswert („erst Deneb, bei Erfolg Zebra kaufen“). Vertragsbindungen bei Paid (Mindestlaufzeit, Mindestabnahme) sind im Text erwähnt, aber nicht gerechnet. | mittel |
| P9 | **Alle Annahmen sind unabhängig voneinander.** | Die Monte-Carlo zieht jede Annahme für sich. Real hängen sie zusammen: ein Team, das DAX kann, hat niedrige Core-Stunden *und* niedrige Deneb-Stunden *und* wenig externe Hilfe; eine Organisation mit hoher Governance hat auch hohe Freigabe- und Prüfstunden. Unabhängige Ziehung macht die Bänder an manchen Stellen zu breit (gegenläufige Effekte mitteln sich weg) und an anderen zu schmal (gleichläufige Risiken werden nicht gebündelt). Der Effekt auf die Rangfolge ist unbekannt, weil ihn niemand gerechnet hat. | mittel |
| P10 | **Der Entscheider optimiert den Erwartungswert.** | Die Rangfolge läuft über P50 (Median). Ein CFO fragt nach dem schlechten Fall: „Was, wenn es teuer wird?“ Ein Ansatz mit gutem Median und fettem rechten Schwanz (Deneb bei hoher Fluktuation, OSS bei Abkündigung) kann bei P90 hinter Paid liegen. Der Rechner zeigt die Bänder, entscheidet aber nach Mitte. | mittel |

## 2. Rechenmodell: was zu ungenau ist

**Scheingenauigkeit.** Der Rechner zeigt „59.544 €“ und ein P10–P90-Band. Beides entsteht aus PERT-Verteilungen, deren Minimum und Maximum die Autoren gesetzt haben. Die Breite des Bandes ist damit selbst eine Annahme, keine Messung von Unsicherheit. Ehrlich wäre: „Größenordnung 50 bis 80 k€, Paid und Open Source nicht unterscheidbar, Core doppelt so teuer.“ Zwei signifikante Stellen sind das Minimum, eigentlich reicht eine.

**Die Stundenposten sind eine Kette von Multiplikationen ohne Beleg.** Rollout = Reports × Charts je Report × Stunden je Chart × Betriebsmodell-Faktor × Stundensatz × Bewertungsfaktor. Fünf Faktoren, davon drei Autoren-Schätzung, einer Panel, einer Snippet. Ein Fehler von 30 % in jedem ergibt am Ende Faktor 3,7. Genau deshalb sind Rangfolgen zwischen Ansätzen mit ähnlichen Stundenprofilen (Paid gegen OSS im Mittelstand, Deneb gegen Core) nicht belastbar, während Rangfolgen mit strukturell verschiedenen Profilen (Lizenz gegen Stunden bei 10.000 Viewern) robust sind. Der Rechner sollte diese beiden Fälle unterscheiden.

**Reports je Ersteller (2 / 4 / 6 nach Betriebsmodell plus 2 je 1.000 Viewer)** ist die folgenreichste Zahl im Modell und hat keine Quelle. Sie bestimmt den Rollout, der Rollout bestimmt den Abstand zwischen Paid und allen anderen. Die Angleichung der Presets an diese Heuristik im Audit hat die Preset-Zahlen stärker verschoben als alle 24 geänderten Annahmen zusammen. Wenn nur eine Zahl empirisch unterlegt wird, dann diese.

**Betriebsmodell als lineare Interpolation** zwischen „Enterprise“ und „Self-Service“ mit fünf erfundenen Faktoren (Owner-Anteil, Wiederverwendung, Varianten, Support, Governance). Richtung plausibel, Höhe frei. Ein Hybrid-Wert von 25 % bedeutet im Modell exakt ein Viertel des Weges auf jeder Achse, real sind die Achsen nicht gekoppelt.

**Governance und Support hängen nur an Viewern.** Support-Tickets entstehen auch je Report und je Ersteller; Governance-Aufwand hängt an der Zahl der Visual-Versionen, nicht an Lesern. Die log-lineare Kurve nach Viewern ist glatter als die alte Stufenfunktion, aber nicht richtiger.

**Externer Anteil als ein Prozentsatz für alles.** Real: Setup und Erstbau extern, Rollout intern, Fixes gemischt. Der Mischsatz verschmiert das.

**Lizenzlogik bildet drei verschiedene Preismodelle mit einer Staffel ab.** Zebra (Named User, jeder Leser zahlt), Inforiver (Analytics+ pro Nutzer, Domain-wide pauschal), graphomate (Recipients und Designer, je Frontend) werden auf „€ je Nutzer × Staffel“ reduziert. Die Staffelstufen sind Faustregel. Für eine Kaufentscheidung ist das zu grob, für die Indikation „Lizenz dominiert ab N Viewern“ reicht es.

**Risiko ist nur Abkündigung.** Es fehlen: Preiserhöhung bei Vertragsverlängerung (nur als Trend), Plattformrisiko durch Microsoft (Copilot, neue Core-Funktionen machen Custom Visuals überflüssig oder brechen sie), Schlüsselpersonenrisiko bei Deneb/Core über die Fluktuation hinaus, Projektabbruch, Sicherheitsvorfall bei nicht zertifiziertem Code. Und: Risiko wird als Erwartungswert addiert, nicht als Szenario gezeigt.

**Zeit.** Löhne steigen, Produktivität nicht. Der Barwert steht daneben, entscheidet aber nicht. Kein Restwert (P7). Jahr 0 trägt den ganzen Aufbau, obwohl Rollouts über zwei Jahre laufen.

**K.O.-Logik ist binär.** „Nur zertifizierte Visuals“ schließt Open Source aus, statt die Zertifizierung des eigenen Visuals zu bepreisen (Aufwand, Dauer, Wiederholung je Version). „Kein Lizenzbudget“ schließt Paid aus, obwohl Budget verhandelbar ist. Der Preis der Rahmenbedingung wird immerhin gezeigt.

**Erfüllungsgrade 1 bis 5 je Anforderung** stammen von den Autoren, koppeln über den Varianten-Effekt in die Wartungskosten und sind für das eigene Produkt (ChartKitchen) besonders schwer neutral zu vergeben. Der Score ist überschreibbar, aber die Voreinstellung wirkt.

## 3. Was fehlt (nach Wichtigkeit)

1. **Null-Option „kein Standard“** mit den Kosten des Status quo (Leserzeit, Neubau je Report, Rückfragen). Ohne sie ist das Werkzeug ein Vergleichsrechner, kein Business-Case-Rechner. Quelle nötig: Lesezeit-Studien jenseits der Hersteller (IBCS-Institut, Hochschulen), sonst ehrlich als Annahme.
2. **Chart-Mix** statt eines Mittelwerts: mindestens vier Typen (Balken mit Abweichung, Wasserfall, Kleine Multiples, Tabelle mit integriertem Chart) mit eigenen Stunden je Ansatz. Core und Deneb unterscheiden sich um Faktor 5 zwischen Balken und Wasserfall.
3. **Datenmodell-Vorleistung je Ansatz** (Szenario-Struktur, UDF-Bibliothek, berechnete Felder) als eigener Posten.
4. **Koexistenz**: Anteil der Charts, die ein zweiter Ansatz abdeckt, mit doppelter Schulung und Governance.
5. **Restwert** der Vorlagenbibliothek am Horizontende oder Abschreibung des Aufbaus über die Nutzungsdauer statt über den Horizont.
6. **Kapazitätsprüfung**: benötigte Stunden gegen verfügbare Ersteller-Stunden. Die häufigste reale Frage („schaffen wir das mit dem Team?“) wird nicht beantwortet.
7. **Risikoaversion** als Schalter: Rangfolge nach P50, P75 oder P90.
8. **Korrelation** in der Simulation, mindestens ein gemeinsamer „Team-Skill-Faktor“ für alle Stundenposten eines Szenarios.
9. **Zeitprofil**: Rollout über zwei Jahre, Barwert als Umschalter neben der nominalen Summe.
10. **Vertragsbindung** bei Paid (Laufzeit, Mindestabnahme, Ausstiegskosten).

## 4. Wo Quellen fehlen, und wie man sie bekommt

| Größe | Heutige Basis | Was belastbar wäre | Aufwand |
|:--|:--|:--|:--|
| Stunden je Chart (erstmalig, Wiederverwendung) | simuliertes Panel, Blindschätzung | **Messung:** dieselben fünf Charts mit Zebra oder Inforiver, ChartKitchen, Deneb und SVG bauen, Stunden stoppen, zwei Personen je Werkzeug | 2 Personentage, vor der Konferenz machbar |
| Reports je Ersteller, Ersteller : Viewer | Autoren-Heuristik | **Umfrage** unter Daten-WG-Community und Pre-Conference-Teilnehmern: Ersteller, Viewer, Standard-Reports, Betriebsmodell (5 Fragen, anonym). 30 Antworten reichen für Größenordnungen | 1 Formular, Auswertung 2 Stunden |
| Lizenzpreise | Suchsnippets, Herstellerseiten aus der Sandbox nicht abrufbar | Screenshots der drei Preisseiten mit Datum; anonymisierte Angebote für 100 / 1.000 / 10.000 Nutzer anfragen | 1 Stunde plus Wartezeit |
| Breaking-Updates je Jahr | Panel, drei belegte Deneb-Vorfälle, drei bis vier Core-Regressionen | **Zählung:** Fabric-Community-Threads und Release Notes 09/2025 bis 09/2026 je Visual auswerten | 4 Stunden |
| Governance-Stunden (Freigabe, Org-Store, Prüfnachweis) | Autoren-Schätzung | drei Interviews mit Power-BI-Admins in Konzernen, je 30 Minuten | 1 Tag inklusive Terminfindung |
| Anwender-Support je 100 Viewer | Panel | Ticketdaten einer Organisation für ein Jahr, nach Visual-Thema gefiltert | abhängig vom Zugang |
| Fluktuation, Stundensätze, Lohnsteigerung, WACC | Sekundärquellen, teils Primärquelle | ausreichend; nur Controller-Gehalt streut je Quelle 54 bis 88 k€ | – |
| Nutzen (Lesezeit, Fehlinterpretation) | nichts Unabhängiges | IBCS-Institut und Hochschulstudien sichten; wenn nichts belastbar ist, als offene Annahme führen | 1 Tag Literatur |
| Erfüllungsgrade je Anforderung | Autoren | zwei externe Bewerter (ein Zebra-Partner, ein Deneb-Praktiker) bewerten blind; Abweichungen ausweisen | 2 Stunden je Bewerter |

## 5. Was der Rechner trotzdem leisten kann

Er ist belastbar für drei Aussagen: **(a)** ab welcher Viewer-Zahl die Lizenz je Kopf jeden Stundenansatz dominiert (robust, weil strukturell); **(b)** dass bei kleinen Mengen Paid und Open Source innerhalb der Unsicherheit liegen und die Entscheidung über Anforderungen und Red Flags fällt, nicht über Kosten; **(c)** dass Core + SVG bei Wasserfall und Szenario-Notation kein Sparmodell ist, sondern Stunden gegen Lizenz tauscht. Für alles Feinere ist er eine Indikation, und das steht auch drin.

Er ist nicht belastbar für: die Reihenfolge Deneb gegen Core, die Reihenfolge Paid gegen OSS im Mittelstand, absolute Beträge auf mehr als eine signifikante Stelle, und jede Aussage über den Nutzen.

## 6. Empfehlung in einem Satz

Keine weiteren Parameter feilen, sondern drei Dinge tun, die den Charakter des Werkzeugs ändern: Null-Option und Chart-Mix einbauen, die Umfrage bei der Pre-Conference laufen lassen, die Messung der Chart-Stunden durchführen. Danach ist der Rechner ein Business-Case-Werkzeug mit einem empirischen Kern; heute ist er ein sauber gebauter Vergleichsrechner auf Meinung.
