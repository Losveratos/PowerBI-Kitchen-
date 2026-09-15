# Kernaussagen zur Diskussion · Visual-Standards-Rechner v0.16

**Stand 15.09.2026** (aktualisiert von v0.12 auf v0.16; alle Zahlen unten mit Playwright gegen den aktuellen Rechner nachgerechnet, nicht aus der v0.12-Fassung übernommen). Dieses Blatt sagt, was der Rechner nach den Audit-Runden und den Erweiterungen v0.13–v0.16 (Entscheidungspfad, Report-Klassen und IBCS-Pflicht, Anbieter-Angebote, geführter Einstieg) tragfähig aussagen kann, was nicht, und woran jedes Ergebnis hängt. Es ist als Diskussionsgrundlage für die Pre-Conference gedacht, nicht als Empfehlung für einen Ansatz.

## Was tragfähig ist

1. **Die Lizenz kostet je Viewer, die Stunden kosten je Chart.** Das ist die einzige Struktur, die keiner Annahme bedarf. Alles Weitere folgt daraus: Bei wenigen Viewern je Ersteller sind Stunden teurer als Lizenzen, bei vielen Viewern je Ersteller ist es umgekehrt.
2. **Der Kipp-Punkt liegt heute (v0.16, Mischpreis 80 €, Report-Klassen-Default, ohne Vorlagenbibliothek) deutlich niedriger als noch bei v0.12/v0.13, meist zwischen 1 : 9 und 1 : 19 Ersteller zu Viewer.** Nachgerechnet: bei 1 Ersteller kippt es bei rund 40 Viewern (v0.13 noch 60), bei 3 Erstellern bei rund 56 Viewern / 1 : 19 (v0.13 noch 101 Viewer / 1 : 34), bei 25 Erstellern bei rund 216 Viewern / 1 : 9 (v0.13 noch 306 Viewer / 1 : 12). Der Grund ist die IBCS-Report-Klassen-Mechanik aus v0.14: ein fester Anteil der Reports (Default 45 %, Klasse A) läuft in jedem Ansatz über Core-Stunden und drückt dadurch vor allem Paids Restkosten, ohne die Lizenz zu berühren. Mit Zebra-Listenpreis sinkt der Kipp-Punkt weiter auf etwa 1 : 3 bis 1 : 7 (3 Ersteller: rund 20 Viewer), mit Vorlagenbibliothek für Deneb und Core auf rund 1 : 8 bis 1 : 16. Die Richtung ist robust, die genaue Zahl nicht — und sie hat sich mit den Report-Klassen schon einmal deutlich verschoben, kann sich also wieder verschieben.
3. **Unter dem Kipp-Punkt liegt Paid vorn, darüber Open Source, dann Deneb.** Core + SVG ist in keinem geprüften Szenario das günstigste, weil es Stunden gegen Lizenz tauscht und beim Wasserfall mit Szenario-Notation das Vierfache an Stunden je Chart braucht. Core ist ein Sparmodell für einfache Charts, nicht für IBCS-Standards.
4. **Paid und Open Source sind bei kleinen Mengen nicht unterscheidbar.** Die P10–P90-Bänder überlappen, und die Reihenfolge hängt an ungemessenen Stundenannahmen (Faktor 2 je Chart). Wer diese Entscheidung braucht, entscheidet über Anforderungen und Red Flags, nicht über Kosten.
5. **Die Rangfolge dreht in vier der fünf Presets nicht** (Pilot, Mittelstand, Konzern mit Report Server, Großkonzern), weder bei P90 statt P50 noch nach reiner Kostenrangfolge. **Ausnahme: Konzern.** Dort liegt bei P50 Deneb knapp vor Paid (613.900 € gegen 726.000 €, Open Source per Red Flag ausgeschlossen), bei P90 dreht die reine Kostenrangfolge auf Paid vor Deneb (950.300 € gegen 974.600 €) — die P10–P90-Bänder von Deneb und Paid überlappen in diesem Preset bei P50/P75 so stark, dass der Rechner sie auf denselben Platz legt. Der gewichtete Rang (Kosten + Anforderungs-Score) zeigt dieselbe Drehung schon ab P75. Die alte Aussage „dreht in keinem Preset" ist damit für den aktuellen Modellstand falsch; sie gilt weiterhin für die anderen vier Presets und dafür, dass sich P50-Mediane kaum ändern.

## Die drei Treiber, die jedes Ergebnis erklären

| Treiber | Wirkung | Belegt? |
|:--|:--|:--|
| Verhältnis Ersteller : Viewer | Entscheidet, ob Lizenz oder Stunden dominieren | Struktur, kein Beleg nötig; die Zahl ist eure Eingabe |
| Lizenzpreis je Nutzer (Anker 33 / 80 / 170 €) | Verschiebt den Kipp-Punkt um Faktor 2 bis 3 | Snippets, Herstellerseiten nicht abrufbar; Zebra-Preise für Power BI nie belegt |
| Stunden je wiederverwendetem Chart (1 / 2 / 2,5 / 4 h) | Bestimmt den Abstand der Stunden-Ansätze untereinander und zu Paid | Simuliertes Panel, Blindschätzung bestätigt die Verhältnisse; keine Messung |

Alles andere (Wartungsquote, Governance, Schulung, Fluktuation, Lernkurve, Produktivitätsgewinn, Komplexität) verschiebt Ergebnisse um Prozentpunkte, nicht um Plätze. Ebene 1 des Rechners zeigt diese drei Treiber mit den Zahlen des jeweiligen Szenarios: Lizenzsumme gegen Mehrstunden, Verhandlungsgrenze des Lizenzpreises, Stundenreduktion, die den Stunden-Ansatz gleichziehen ließe.

## Was der Rechner nicht sagen kann

- **Ob sich ein Standard überhaupt lohnt.** Die Null-Option rechnet den Status quo, aber die Leserzeit darin hat keine unabhängige Quelle (blueforte / TU München 2019 ist die einzige Studie). Ohne Leserzeit amortisiert sich kein Ansatz im Horizont.
- **Beträge auf mehr als eine signifikante Stelle.** 57 Annahmen (24 global, 33 je Ansatz), davon 33 Autoren-Schätzung, 9 simuliertes Panel, 3 Faustregeln, 9 Snippets, 3 verifiziert. Die Sicherheits-Leiste in Ebene 2 zeigt je Ansatz, welcher Anteil der Kosten an belegten Preisen hängt — und seit v0.15 ist das für Paid nicht mehr die beste, sondern ohne Angebot die **schlechteste** Zahl im Feld: **ohne** ein eingetragenes Anbieter-Angebot fällt der belegte Anteil von Paid von vormals rund 50 % auf **19 %** (Mittelstand-Preset), weil die drei Lizenz-Anker nur noch als Snippet zählen; Open Source liegt bei 26 %, Deneb bei 37 %, Core bei 34 %. **Mit** einem eingetragenen Angebot steigt Paids belegter Anteil wieder auf rund 50 % oder mehr, je nach Konditionen. Ein echtes Angebot ist damit die einzige harte Preisquelle im ganzen Modell — jeder andere Preis, bei jedem Ansatz, ist Schätzung, Snippet oder Faustregel.
- **Die Nutzenseite.** Lesezeit, Entscheidungsqualität, Time-to-value stehen nur als Score und als Null-Option-Annahme drin.
- **Koexistenz.** Real endet fast jede Organisation bei zwei Ansätzen; der Rechner vergleicht Reinformen.

## Warum Paid so oft vorn steht, und wann nicht

- Die Presets Pilot (1 : 10) und Mittelstand (1 : 13) liegen unter dem (heute niedrigeren) Kipp-Punkt, dort ist Paid klar vorn. Konzern und Großkonzern schließen Open Source per Red Flag „nur zertifizierte Visuals“ aus; der Großkonzern nutzt eine Site-Lizenz und Paid bleibt dort vorn. **Zwei Presets weichen davon ab:** Im Konzern-Preset liegt bei P50 Deneb knapp vor Paid, erst bei P90 dreht es auf Paid (siehe Punkt 5 oben) — dort ist Paid also nicht eindeutig vorn, sondern von der gewählten Entscheidungsgröße abhängig. Im Preset „Konzern mit Report Server“ ist Paid selbst per Red Flag ausgeschlossen (Report Server unterstützt keine gekauften Custom Visuals) — dort konkurriert nur noch Deneb gegen Core. Paid ist damit in dreien von fünf Presets (Pilot, Mittelstand, Großkonzern) eindeutig vorn, in einem umstritten (Konzern) und in einem gar nicht im Rennen (Report Server).
- Ebene 1 sortiert seit v0.12 rein nach Kosten. Der gewichtete Rang (70 % Kosten, 30 % Anforderungs-Score) bevorzugt Paid zusätzlich, weil Paid den höchsten Score hat; wenn beide Reihenfolgen auseinanderfallen, steht das im Satz.
- Bei 1 : 40 und mehr liegt Open Source vorn, bei 1 : 100 auch Deneb vor Paid. Mit Zebra-Listenpreis verliert Paid schon im Mittelstand gegen Open Source und Deneb.
- **Die Report-Klassen (v0.14) verengen den Abstand zu Core, nicht nur den Kipp-Punkt.** Weil operative Reports (Default 45 %, Klasse A) jetzt in **jedem** Ansatz mit Core Visuals gebaut werden, solange IBCS nicht verbindlich ist, schrumpft der Abstand Paid zu Core im Mittelstand-Preset von **Faktor 2,1 (vor v0.14) auf Faktor 1,6 (aktuell)** — nachgerechnet gegen den v0.13-Code (Paid 60.500 €, Core 127.400 €) und den aktuellen Code (Paid 70.400 €, Core 112.500 €). Core bleibt trotzdem in jedem Preset am teuersten; nur der Vorsprung von Paid und den anderen Stunden-Ansätzen ist kleiner geworden, weil ein Teil ihrer Reports jetzt zu Core-Konditionen läuft statt zu ihren eigenen.

## Was die Aussage wirklich belastbar machen würde

1. Fünf Chart-Typen mit Zebra oder Inforiver, ChartKitchen, Deneb-Vorlagen und SVG-Measures bauen, Stunden stoppen. Zwei Personentage. Ersetzt den wichtigsten ungemessenen Treiber.
2. Fünf Fragen an die Konferenz-Teilnehmer: Ersteller, Viewer, Standard-Reports, Betriebsmodell, Lizenzpreis, wenn vorhanden. 30 Antworten reichen für den Kipp-Punkt aus echten Verhältnissen.
3. Drei Preisseiten mit Datum sichern; Zebra-Preise für Power BI sind derzeit nicht belegbar.

Bis dahin gilt: Der Rechner zeigt die Richtung und die Hebel. Wer ihn als Preisauskunft liest, liest ihn falsch.
