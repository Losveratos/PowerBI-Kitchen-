# Kernaussagen zur Diskussion · Visual-Standards-Rechner v0.12

**Stand 12.09.2026.** Dieses Blatt sagt, was der Rechner nach zwei Audit-Runden tragfähig aussagen kann, was nicht, und woran jedes Ergebnis hängt. Es ist als Diskussionsgrundlage für die Pre-Conference gedacht, nicht als Empfehlung für einen Ansatz.

## Was tragfähig ist

1. **Die Lizenz kostet je Viewer, die Stunden kosten je Chart.** Das ist die einzige Struktur, die keiner Annahme bedarf. Alles Weitere folgt daraus: Bei wenigen Viewern je Ersteller sind Stunden teurer als Lizenzen, bei vielen Viewern je Ersteller ist es umgekehrt.
2. **Der Kipp-Punkt liegt zwischen 1 : 30 und 1 : 60 Ersteller zu Viewer** (Standardannahmen, Mischpreis 80 €, ohne Vorlagenbibliothek). Bei 3 Erstellern kippt es bei etwa 100 Viewern, bei 25 Erstellern bei etwa 900. Mit Zebra-Listenpreis rutscht der Kipp-Punkt auf etwa 1 : 15, mit Vorlagenbibliothek für Deneb ebenfalls deutlich nach unten. Diese Richtung ist robust, die genaue Zahl nicht.
3. **Unter dem Kipp-Punkt liegt Paid vorn, darüber Open Source, dann Deneb.** Core + SVG ist in keinem geprüften Szenario das günstigste, weil es Stunden gegen Lizenz tauscht und beim Wasserfall mit Szenario-Notation das Vierfache an Stunden je Chart braucht. Core ist ein Sparmodell für einfache Charts, nicht für IBCS-Standards.
4. **Paid und Open Source sind bei kleinen Mengen nicht unterscheidbar.** Die P10–P90-Bänder überlappen, und die Reihenfolge hängt an ungemessenen Stundenannahmen (Faktor 2 je Chart). Wer diese Entscheidung braucht, entscheidet über Anforderungen und Red Flags, nicht über Kosten.
5. **Die Rangfolge dreht in keinem Preset**, weder bei P90 statt P50, noch mit gepaarter Ziehung, noch mit Jahresmodell, noch mit Team-Faktor. Was sich ändert, ist der Abstand, nicht die Reihenfolge. Das gilt für die Presets; für ein eigenes Szenario nahe am Kipp-Punkt gilt es nicht.

## Die drei Treiber, die jedes Ergebnis erklären

| Treiber | Wirkung | Belegt? |
|:--|:--|:--|
| Verhältnis Ersteller : Viewer | Entscheidet, ob Lizenz oder Stunden dominieren | Struktur, kein Beleg nötig; die Zahl ist eure Eingabe |
| Lizenzpreis je Nutzer (Anker 33 / 80 / 170 €) | Verschiebt den Kipp-Punkt um Faktor 2 bis 3 | Snippets, Herstellerseiten nicht abrufbar; Zebra-Preise für Power BI nie belegt |
| Stunden je wiederverwendetem Chart (1 / 2 / 2,5 / 4 h) | Bestimmt den Abstand der Stunden-Ansätze untereinander und zu Paid | Simuliertes Panel, Blindschätzung bestätigt die Verhältnisse; keine Messung |

Alles andere (Wartungsquote, Governance, Schulung, Fluktuation, Lernkurve, Produktivitätsgewinn, Komplexität) verschiebt Ergebnisse um Prozentpunkte, nicht um Plätze. Ebene 1 des Rechners zeigt diese drei Treiber mit den Zahlen des jeweiligen Szenarios: Lizenzsumme gegen Mehrstunden, Verhandlungsgrenze des Lizenzpreises, Stundenreduktion, die den Stunden-Ansatz gleichziehen ließe.

## Was der Rechner nicht sagen kann

- **Ob sich ein Standard überhaupt lohnt.** Die Null-Option rechnet den Status quo, aber die Leserzeit darin hat keine unabhängige Quelle (blueforte / TU München 2019 ist die einzige Studie). Ohne Leserzeit amortisiert sich kein Ansatz im Horizont.
- **Beträge auf mehr als eine signifikante Stelle.** 54 Annahmen, davon 30 Autoren-Schätzung, 9 simuliertes Panel, 3 Faustregeln, 9 Snippets, 3 verifiziert. Die Sicherheits-Leiste in Ebene 2 zeigt je Ansatz, welcher Anteil der Kosten an belegten Preisen hängt (Paid rund die Hälfte, die Stunden-Ansätze ein Drittel).
- **Die Nutzenseite.** Lesezeit, Entscheidungsqualität, Time-to-value stehen nur als Score und als Null-Option-Annahme drin.
- **Koexistenz.** Real endet fast jede Organisation bei zwei Ansätzen; der Rechner vergleicht Reinformen.

## Warum Paid so oft vorn steht, und wann nicht

- Die Presets Pilot (1 : 10) und Mittelstand (1 : 13) liegen unter dem Kipp-Punkt. Konzern und Großkonzern schließen Open Source per Red Flag „nur zertifizierte Visuals“ aus. Der Großkonzern nutzt eine Site-Lizenz. In allen vier Fällen ist Paid vorn, aus vier verschiedenen Gründen.
- Ebene 1 sortiert seit v0.12 rein nach Kosten. Der gewichtete Rang (70 % Kosten, 30 % Anforderungs-Score) bevorzugt Paid zusätzlich, weil Paid den höchsten Score hat; wenn beide Reihenfolgen auseinanderfallen, steht das im Satz.
- Bei 1 : 40 und mehr liegt Open Source vorn, bei 1 : 100 auch Deneb vor Paid. Mit Zebra-Listenpreis verliert Paid schon im Mittelstand gegen Open Source und Deneb.

## Was die Aussage wirklich belastbar machen würde

1. Fünf Chart-Typen mit Zebra oder Inforiver, ChartKitchen, Deneb-Vorlagen und SVG-Measures bauen, Stunden stoppen. Zwei Personentage. Ersetzt den wichtigsten ungemessenen Treiber.
2. Fünf Fragen an die Konferenz-Teilnehmer: Ersteller, Viewer, Standard-Reports, Betriebsmodell, Lizenzpreis, wenn vorhanden. 30 Antworten reichen für den Kipp-Punkt aus echten Verhältnissen.
3. Drei Preisseiten mit Datum sichern; Zebra-Preise für Power BI sind derzeit nicht belegbar.

Bis dahin gilt: Der Rechner zeigt die Richtung und die Hebel. Wer ihn als Preisauskunft liest, liest ihn falsch.
