# Visual-Standards-Rechner: Red-Team / Blue-Team Review
## Umsetzungsbriefing für den Entwicklungsagenten

**Stand:** 10.09.2026  
**Basis:** `visualstandardsrechner.html`, Version 0.2 laut Footer, 896 physische Dateizeilen.  
**SHA-256 der geprüften Datei:** `03a3007f0f22c0309bb683b42b426f7f4ad0bc15cd0f54e92713eb04ac3c465f`  
**Ziel:** Den bestehenden Indikations- und Workshop-Rechner sicherer, fachlich fairer und rechnerisch konsistent machen. Kein Neuaufbau als Beschaffungsplattform, kein Voll-ROI-Modell.

> **Leitentscheidung:** Die Grundidee und die fünf Schritte behalten. Zuerst Fehler und irreführende Aussagen beseitigen. Danach fehlende Entscheidungskriterien ergänzen. Nicht versuchen, schwache Annahmen durch mehr mathematischen oder visuellen Aufwand glaubwürdiger wirken zu lassen.

---

## 1. Auftrag und Grenzen

Du überarbeitest die bereitgestellte HTML-Anwendung. Dieses Dokument ist ein Arbeitsauftrag mit Gegenprüfung, nicht die Aufforderung, jede denkbare Erweiterung gleichzeitig zu bauen.

Arbeite in dieser Reihenfolge:

1. Reproduziere die bestätigten Fehler und sichere sie durch Tests ab.
2. Implementiere die P0-Korrekturen in kleinen, getrennten Änderungspaketen.
3. Bearbeite die P1-Punkte für die nächste veröffentlichbare Version.
4. Dokumentiere P2 als Folgeausbau. Implementiere P2 nicht nebenbei.

**Bewahren:** Deutsche Oberfläche, Daten-WG-Stil, Mengengerüst, MoSCoW-Grundidee, sichtbare Ausschlussgründe, editierbare Annahmen, Unsicherheitsdarstellung, Sensitivität, Share-Funktion und nachvollziehbarer Export. Die vier Ansatzfamilien dürfen als Einstieg erhalten bleiben; die tatsächlich verglichene Variante muss darunter erkennbar sein. [F:218-223, 257-279, 320-348, 377-380]

**Nicht ungefragt bauen:** Backend, Nutzerkonten, Live-Preisscraping, neue Framework-Architektur, weitere Technologieplattformen, Black-Box-Empfehlungs-KI, komplexes Ereignismodell oder einen monetarisierten Nutzenrechner.

**Nicht als erledigt melden:** Ein geänderter Text ersetzt keine geänderte Rechenlogik. Ein Disclaimer macht eine falsche Zahl nicht richtig. Ein funktionierender Download beweist keine korrekten Exportformeln.

### Nachweisarten

- **[F:Zeilen]** bezeichnet die unveränderte Ausgangsdatei. Nach Umbauten sind Funktions- und Parameterbezeichnungen die stabileren Fundstellen.
- **[L]** bezeichnet eine in diesem Review erneut lokal ausgeführte Prüfung des Kostenkerns oder der Browseroberfläche. Details stehen in Abschnitt 7.
- **[W01] bis [W10]** sind gezielt geprüfte externe Primärquellen, mit Abrufdatum und URL in Abschnitt 9.
- **Empfehlung** bezeichnet eine vorgeschlagene Produkt- oder Modellentscheidung. Sie ist kein nachgewiesener Defekt.

Der Kostenkern wurde in Node.js ausgeführt. Die Browserprüfungen liefen mit Chromium auf im Speicher geladener HTML-Datei und blockierten Netzwerkzugriffen. Die produktive Website, ihre HTTP-Schutzheader, tatsächliche Power-BI-Installationen und erzeugte Excel-Dateien wurden hier nicht praktisch geprüft. Der Export wurde anhand des Quellcodes beurteilt.

---

## 2. Blue Team: Was unbedingt erhalten bleiben sollte

**Der Rechner macht ein schwieriges Gespräch greifbar.** Er verbindet Anforderungen, Governance und mehrjährige Kosten, statt nur Lizenzpreise zu vergleichen. Das ist eine passende Struktur für einen Workshop. [F:218-223, 267-279]

**Kostenlose Software wird nicht mit kostenloser Umsetzung verwechselt.** Setup, Wiederverwendung, Schulung, Wartung und Migration sind als Kostenarten angelegt. Ihre Abgrenzung braucht Verbesserung; ihr Vorhandensein ist richtig. [F:417-439, 523-546]

**Annahmen sind sichtbar und veränderbar.** Expertenschätzungen zu verwenden ist für einen Indikationsrechner legitim. Der Ehrlichkeits-Hinweis und der offengelegte Bezug zu ChartKitchen sind Stärken, keine zu entfernenden Schwächen. [F:297-301, 368, 379, 457]

**Ausgeschlossene Optionen bleiben nachvollziehbar.** Die Kosten einer Governance-Entscheidung diskutierbar zu machen ist nützlich, solange die Ausschlussgründe stimmen. [F:677-680]

**Sensitivität ist wichtiger als Scheingenauigkeit.** Die Frage, welche Annahme das Ergebnis kippt, sollte zentral bleiben. Nicht einfach mehr Simulationsläufe oder mehr Nachkommastellen ergänzen. [F:338-342, 729-742]

---

## 3. Red Team gegen Blue Team: Die fachliche Auseinandersetzung

| Thema | Red Team: stärkster Einwand | Blue Team: berechtigter Gegenpunkt | Entscheidung für die Verbesserung |
|---|---|---|---|
| Vier Ansatzfamilien | Paid vereinigt Vorteile mehrerer Produkte; Core wird über SVG-Sonderlösungen bewertet; OSS vermischt Nutzung und Entwicklung. | Vier Einstiege sind im Workshop verständlicher als ein großer Produktkatalog. | Vier Familien behalten, konkrete Variante darunter auswählen. Keine vermischten Fähigkeiten und Preise. T02/T03. |
| Expertenschätzungen | Eine Simulation gibt subjektiven Werten den Anschein einer belastbaren Prognose. | Unsicherheit gar nicht zu zeigen wäre schlechter. | PERT behalten, Herkunft und Bedeutung klarstellen; keine empirische Sicherheit behaupten. T04/T05/T11. |
| OSS-Entwicklungsaufwand | Der Default belastet ein vermeintlich fertiges Visual mit Entwicklungskosten. | Aufwand kann unsicher sein, auch wenn null Stunden am wahrscheinlichsten sind. | Die Unsicherheit ist nur in einem ausdrücklichen Entwicklungsmodus legitim. T02. |
| Lizenzierung und Governance | Pauschale Ausschlüsse können die falsche Option zum Gewinner machen. | Vereinfachte Red Flags sind eine gute Gesprächshilfe. | Die Bedienung einfach lassen, die Regeln an Produkt und Umgebung binden. T03/T07. |
| Wartung und Risiko | Prozentquote, Breaking-Updates und Migration können sich inhaltlich überlappen. | Unterschiedliche Kostenarten sind möglich und ein erwarteter Risikozuschlag ist sinnvoll. | Leistungsumfang je Posten definieren; nicht ohne Nachweis eine Doppelzählung behaupten. T06. |
| Nutzwert-Rangfolge | Der Sieger hängt auch davon ab, welche anderen Kandidaten betrachtet werden. | Jede Gewichtung ist subjektiv; ein Regler macht das sichtbar. | Subjektivität ist akzeptabel, unerklärte Rangumkehr nicht. Kosten und gewichtete Platzierung trennen. T08. |
| Hybridansatz | Reine Entweder-oder-Pfade bilden gemischte Reportlandschaften nicht ab. | Eine echte Mischkalkulation braucht Lizenz-Nutzerkreise und gemeinsam genutzte Assets. | Hoher Nutzen als Folgeausbau; kein Vorwand, P0 zu verzögern. T13. |
| Anwendernutzen | Günstigere Umsetzung kann schlechtere Berichte liefern. | Das Tool ist ein Kosten- und Eignungsrechner, kein ROI-Modell. | Gemeinsamen Zielzustand und qualitative Abnahmekriterien ergänzen; keinen unbelegten Euro-Nutzen erfinden. T02/T14. |
| Architektur | Globaler Zustand und gemischte Darstellung/Rechnung erschweren Tests. | Eine einzelne HTML-Datei ist für dieses Projekt ein legitimes Auslieferungsformat. | Reine Funktionen und klare Zuständigkeiten schaffen. Kein Framework-Wechsel erforderlich. T04/T10. |

Die Einwände beziehen sich auf die Optionsdefinitionen, das Rechenmodell und die Rangbildung der Ausgangsdatei. [F:377-439, 524-554, 659-662]

---

## 4. Priorisiertes Umsetzungs-Backlog

**P0:** Sicherheitslücke, materiell irreführende Vergleichslogik oder widersprüchliche Rechnung. Vor weiterem öffentlichem Einsatz korrigieren beziehungsweise die betroffene Funktion vorübergehend klar deaktivieren.  
**P1:** Muss in die nächste belastbare Version; teils genügt zunächst eine ehrliche, eingeschränkte Darstellung.  
**P2:** Wertvoller Folgeausbau, aber kein Release-Blocker für den korrigierten Indikationsrechner.

### T01 - P0 - Share-Import absichern und atomar validieren

**Fundstelle:** `readHash()`, `renderReqs()`, `paramRow()`, Eingabehandler. [F:609-614, 631-645, 853-864]

**Befund:** Eine über den Share-State importierte Anforderungs-ID wird ungefiltert in HTML-Attribute eingesetzt. Ein harmloser lokaler Test konnte dadurch JavaScript ausführen. Numerische Importfelder werden außerdem nicht ausreichend auf Bereich, Reihenfolge und zulässige Typen geprüft. [L]

**Umsetzung:**

- Baue neue dynamische Elemente mit DOM-Methoden. Nutze `textContent`, `dataset` und feste Eventlistener statt HTML-Verkettung mit importierten Daten. Es ist nicht nötig, jeden statischen HTML-String zu ersetzen.
- Validiere IDs, Eindeutigkeit, reservierte Namen, Arraylängen und bekannte Schlüssel. Ablehnen oder konsistent neu vergeben; bei neuer ID auch Prioritäten und Bewertungen korrekt umhängen.
- Parse in einen temporären Zustand, validiere vollständig und übernimm erst danach. Ein Fehler darf keinen halb importierten Zustand zurücklassen.
- Akzeptiere nur endliche Zahlen. Für Stunden/Preise keine negativen Werte; für echte Anteile und Wahrscheinlichkeiten 0 bis 100; für Dreipunktwerte `min <= mode <= max`. Wachstumsraten sind keine Wahrscheinlichkeiten: eigener, dokumentierter Wertebereich.
- Begrenze Größe und Verschachtelung des importierten States sowie Zahl und Textlänge eigener Anforderungen. Kein stilles Vertrauen in `__proto__`, `constructor` oder geerbte Eigenschaften.
- Ungültige Formularwerte nicht still auf andere Felder verteilen. Fehler benennen; die letzte gültige Rechnung mit entsprechendem Status erhalten oder neue Ergebnisse bis zur Korrektur sperren.

**Abnahme:** Ungewöhnliche IDs und HTML-ähnliche Texte werden abgelehnt oder als Text angezeigt; kein fremdes Element und kein Eventhandler entsteht. Kaputte Links erzeugen eine verständliche Meldung. Die App bleibt bedienbar und es gelangen keine `NaN`-/Infinity-Werte in Ranking, SVG oder Export.

**Blue-Team-Grenze:** Die bestätigte lokale DOM-XSS-Lücke rechtfertigt P0. Eine bestimmte Auswirkung auf die produktive Domain oder fehlende Schutzheader ist damit nicht nachgewiesen.

### T02 - P0 - Vergleichsgegenstand definieren und OSS-Modus trennen

**Fundstelle:** `OPTS`, `REQS`, `OPTP.devH`, `calc()`, Reportstunden-Anzeige. [F:377-399, 430-435, 534-546, 678]

**Befund:** Die vier Familien sind nicht automatisch gleichwertige Implementierungen. Insbesondere enthält OSS standardmäßig `[0,0,400]` Entwicklungsstunden. Diese PERT-Verteilung hat einen Mittelwert von 66,67 Stunden, nicht null. Die Verteilung ist mathematisch zulässig, passt aber nicht zur Lesart "fertiges Visual, keine Entwicklung". [L]

**Umsetzung:**

- OSS erhält `readyMade` und `customDevelopment`. Im ersten Modus ist `devH = [0,0,0]`; nur der zweite aktiviert Entwicklungsannahmen. Einstellungen beim Wechsel erhalten, aber inaktive Kosten nicht berechnen.
- Core erhält mindestens die Unterscheidung `native` und `svgWorkaround`. Bewertungen und Aufwand dürfen nicht automatisch vom Sonderweg auf native Visuals übertragen werden.
- Paid erhält eine konkrete Produkt-/Editionskonfiguration; Details unter T03. Deneb erhält zumindest eine klar bezeichnete Bereitstellungsvariante.
- Definiere einen Vergleichsumfang: etwa drei konkrete Finance-Darstellungen mit benötigten Szenarien, Abweichungen, Interaktion, Export und Darstellung auf relevanten Geräten. Das ist eine konfigurierbare Referenzaufgabe, kein behaupteter Universalstandard.
- Schreibe sichtbar, welche Leistungen fehlen: beispielsweise Datenaufbereitung, semantisches Modell, fachliche Measure-Definition, Projektkoordination und vollständige fachliche Abnahme, soweit nicht ausdrücklich modelliert.
- Benenne "Erster Standard-Report" enger, etwa "Visualisierungsaufwand inkl. Baukastenaufbau". Arbeitsstunden sind keine Kalenderdauer. Definiere die Grenze zwischen erster Typentwicklung und Wiederverwendungsaufwand, statt eine Doppelzählung zu unterstellen oder unbemerkt einzubauen.

**Abnahme:** Keine Entwicklungskosten bei `readyMade`; der Entwicklungsmodus aktiviert sie nachvollziehbar. Ein nativer Core-Fall erbt keine pauschale SVG-Interaktivitätsbewertung. Jede Ergebniskarte zeigt, welche konkrete Variante und welcher Leistungsumfang verglichen werden.

**Scope-Bremse:** Kein riesiger Produktkatalog. Ein neutraler "eigene Konfiguration / noch nicht geprüft"-Modus ist besser als erfundene Produktdetails.

### T03 - P0 - Lizenzmodell, Produktfähigkeiten und Umgebung zusammenführen

**Fundstelle:** Lizenz-Presets, `REQS`, `FLAGS`, `LIC`, `TEXT.paid`, `calc()`. [F:288-291, 387-412, 426-427, 448-453, 528-532, 878]

**Befund:** Ein Preis-Preset ändert nur den Preis, nicht die Fähigkeiten. Zudem wird AppSource-Lizenzverwaltung mit der grundsätzlichen Einsetzbarkeit aller kommerziellen Visuals vermischt. Die geprüften Herstellerseiten enthalten unterschiedliche Produkte, Pakete, Betriebsumgebungen und Lizenzmodelle. [W01-W04]

**Umsetzung:**

- Konfiguration mindestens aus `product`, `edition`, `deployment`, `licenseModel`, `currency`, `priceDate` und belegten Fähigkeiten bilden.
- Mindestens Named-User, Paket/Staffel und manuelle Jahrespauschale unterscheiden. Eine Jahrespauschale mit dokumentiertem Geltungsbereich reicht zunächst für individuell verhandelte Verträge. Nicht eine unbelegte Formel für jedes Herstellerangebot erfinden.
- Mengen zählen eindeutige lizenzpflichtige Personen. Klarstellen, ob Viewer zusätzlich zu Autoren gezählt werden; Autoren nicht doppelt als Viewer lizenzieren. Nutzerkreis einer Visual-Lösung nicht automatisch mit allen Power-BI-Nutzern gleichsetzen.
- Mindestmengen, Paketgrenzen, Laufzeit und gegebenenfalls abweichende Folgejahrespreise abbilden oder als nicht modellierte Bedingung ausweisen. Kein Wechselkurs ohne Quelle beziehungsweise explizite Nutzereingabe.
- Report-Server-/Embedded-Ausschlüsse nur aus dem konkreten Produkt-/Lizenzweg ableiten. Nicht pauschal `paid => ausgeschlossen`.
- Writeback nicht aus einem preisgünstigen reinen Visualisierungspreset ableiten. Kommentar, Planung und Datenspeicherung sind nicht automatisch dieselbe Funktion.
- "Kein externes Lizenzbudget" auf tatsächlich erforderliche zusätzliche Ausgaben beziehen. Bereits vorhandene Nutzungsrechte nicht ignorieren; Gesamt- und Zusatzkostenperspektive klar unterscheiden.

**Abnahme:** Ein fiktives Named-User-Angebot skaliert je relevantem Nutzer; eine belegte Jahrespauschale innerhalb ihres Geltungsbereichs nicht. Ein Paketpreis folgt Paketgrenzen. Ein Report-Server-Preset kann eine belegbar passende kommerzielle Variante zulassen. Preis und Funktionsumfang können nicht aus verschiedenen Editionen zusammengesetzt werden.

**Fallback:** Nicht belegbare kommerzielle Konfiguration als "zu prüfen" darstellen; nicht als kostenlos, unfähig oder zertifiziert behandeln.

### T04 - P0 - Jede Annahme je Szenario einmal ziehen

**Fundstelle:** `calc()`, `simulate()`, `expected()`. [F:524-557]

**Befund:** `g()` und `p()` ziehen bei jedem Aufruf erneut. Derselbe interne Stundensatz sowie Setup-/Wiederverwendungsannahmen können innerhalb eines Szenarios auseinanderfallen. Der pro Option zurückgesetzte Seed garantiert keine sauber gepaarten globalen Annahmen zwischen Optionen.

**Umsetzung:**

1. Erzeuge pro Simulationslauf einmal einen Snapshot globaler Annahmen.
2. Erzeuge je Option einmal ihre spezifischen Annahmen.
3. Berechne Kosten und Stunden ausschließlich aus diesen Werten.
4. Teile globale Annahmen desselben Szenarios zwischen Optionen.
5. Berechne Sensitivität und deterministische Referenzfälle mit derselben reinen Kostenfunktion, ohne neue Zufallsziehungen.

Ein möglicher interner Zuschnitt, kein vorgeschriebener Framework-Aufbau:

```text
validateState(raw) -> validState | validationErrors
sampleGlobalAssumptions(state, rng) -> globalDraw
sampleOptionAssumptions(option, state, rng) -> optionDraw
calculateOption(state, globalDraw, optionDraw) -> annualCosts, totals, hours
evaluateEligibility(state, evidence) -> allowed / conditional / unknown / excluded
summarizeSimulation(scenarioResults) -> means, quantiles, pairedComparisons
render(validState, calculatedResults)
```

**Abnahme:** Instrumentierter Test: Jeder Parameter wird je vorgesehenem Snapshot genau einmal gezogen. Identische globale Werte gelten für alle Optionen eines Szenarios. Derselbe Seed und Zustand ergeben dasselbe Resultat. Ein Wechsel von absoluter auf Pro-Nutzer-Darstellung ändert weder Rohkosten noch Stichproben.

**Scope-Bremse:** Ein dokumentiertes Modell mit innerhalb des Szenarios konstanten Jahreswachstumsraten reicht. Kein neues stochastisches Konjunkturmodell bauen.

### T05 - P0 - Jahreskosten, Kennzahlen und Statistik konsistent machen

**Fundstelle:** `calc()`, `simulate()`, `perDivisor()`, `drawCumulative()`, `renderTable()`, Excel-Formeln. [F:528-554, 650-651, 746-768, 819-838]

**Befund:** Viewer-Wachstum erfasst auch Autoren. Pro-Nutzer-Werte verwenden dagegen die ursprüngliche Nutzerzahl. Fluktuationsschulungen des gesamten Horizonts landen im Invest zu Jahr 0. Der Jahresverlauf verteilt wachsende Kosten als konstante Durchschnittskosten. Kostenarten-Mediane werden nachträglich auf die Gesamtkosten-P50 skaliert.

**Umsetzung:** Eine gemeinsame, pro Szenario berechnete Jahrestabelle wird die Grundlage für alle Ausgaben. Konvention: Jahr 0 enthält initialen Aufwand; Betriebsjahre 1 bis H enthalten laufende Kosten. Autoren bleiben ohne gesondertes Autorenwachstum konstant. Viewer-Wachstum beginnt nach dem ersten Betriebsjahr.

```text
viewer_y = viewer_1 * (1 + viewerGrowth)^(y - 1)
authors_y = authors_1                         # solange separat kein Wachstum modelliert ist
viewerYears = SUM(viewer_y, y=1..H)
userYears = SUM(viewer_y + authors_y, y=1..H)  # bei disjunkten Nutzergruppen

initialCost = initialSetup + initialBuild + rollout + initialTraining
operatingCost_y = license_y + support_y + maintenance_y + replacementTraining_y
```

Erwartete Nutzerzahlen dürfen in einem Planmodell gebrochen sein. Muss eine konkrete Lizenzregel ganze Seats kaufen, separat und dokumentiert runden; nicht heimlich eine Rundung auf alle Kennzahlen anwenden.

Bei unsicherem Wachstum Pro-Nutzer-Kosten zuerst **je Szenario** mit dessen Nutzerjahren berechnen und erst danach aggregieren. Ein Quotient aus separaten Medianen ist nicht allgemein der Median des Quotienten. Bei null Viewer-Jahren "nicht anwendbar" anzeigen, keinen künstlichen Viewer einsetzen.

Für Statistik und Darstellung gilt:

- P10/P50/P90 der Gesamtkosten aus den Szenario-Gesamtsummen bestimmen.
- Additive Kostenstrukturen vorzugsweise mit **arithmetischen Mittelwerten der Szenarien** darstellen. Deren Summe entspricht dem Mittelwert der Gesamtkosten.
- P50 separat kennzeichnen; die Kostenarten nicht auf P50 zurechtskalieren. Optional ist ein klar bezeichnetes repräsentatives Szenario zulässig, aber nicht als "P50 jedes Postens".
- Kumulierte Verläufe aus echten Jahreswerten berechnen. Bei Mittelwertlinien muss der Endpunkt zum mittleren Gesamtwert passen. Bei P50-Linien je Zeitpunkt den Median der bis dahin kumulierten Szenariokosten nehmen, nicht Jahresmediane addieren.
- `expected()` verwendet derzeit Parameter-Mittelwerte in einer nichtlinearen Funktion. Das ist nicht allgemein der Erwartungswert der Gesamtkosten. Entweder "Referenzrechnung mit mittleren Annahmen" nennen oder tatsächlich den Mittelwert der Simulation verwenden. Break-even, Tornado und Export entsprechend beschriften.

**Deterministischer Abnahmetest:** Drei Autoren, 40 zusätzliche Viewer, drei Betriebsjahre, 10 % Viewer-Wachstum, 100 Euro je Named User und Jahr, null Preissteigerung, alle anderen Kosten null. Ohne Seat-Rundung sind 14.140 Euro Lizenzkosten und 132,4 Viewer-Jahre korrekt. Details in Abschnitt 7.

**Wichtig:** Keine scheinbare Gleichheit zwischen P50 und Mittelwert erzwingen. Unterschiedliche korrekt bezeichnete Kennzahlen sind besser als nachträglich angepasste Zahlen.

### T06 - P1 - Risiko, Support und Wartung sauber abgrenzen

**Fundstelle:** `OPTP.maint/events/fixH/dep/support`, Risikoberechnung. [F:435-439, 537-544]

**Red Team:** Der Risikoposten ist kein simulierter vollständiger Migrationsfall. Das Abkündigungsrisiko bleibt beim Wechsel des Horizonts unverändert. Wartungsquote und Update-Reparaturen könnten denselben Aufwand enthalten.

**Blue Team:** Ein erwarteter Risikozuschlag ist für dieses Werkzeug ausreichend. Separat modellierte Routinewartung und außergewöhnliche Incidents sind nicht automatisch doppelt.

**Umsetzung:**

- Den Betrag als "erwarteter Risikozuschlag" ausweisen. Er ist keine tatsächliche jährliche Zahlung und kein vollständig modelliertes Ausfallszenario.
- Zeitbasis explizit machen. Minimal: Risiko als Eingabe für den gewählten Horizont kennzeichnen und bei Horizontwechsel zur erneuten Bestätigung markieren. Alternativ jährliches Risiko `p` verwenden und unter ausdrücklicher Annahme konstanter bedingter Jahreswahrscheinlichkeit `p_H = 1 - (1-p)^H` berechnen.
- Verteilung des Zuschlags über Jahre entweder vermeiden und separat darstellen oder als rein rechnerische Allokation kennzeichnen.
- Routinewartung, Breaking-Update-Reparatur, Herstellersupport und Sponsoring inhaltlich trennen. Sponsoring nicht als garantierte SLA-Stunde verkaufen. [W09]
- Annahmen über höhere Risiken bestimmter Familien nicht als statistisch bewiesen darstellen.

**Abnahme:** Horizontwechsel erzeugt eine dokumentierte Neuberechnung oder einen sichtbaren Prüfstatus. Der Risikozuschlag wird in Kostenstruktur und Total genau einmal berücksichtigt. Die Anwendung behauptet nicht, P90 bilde ein vollständiges Migrationsereignis ab.

### T07 - P1 - Must-Erfüllung und unbekannte Fähigkeiten trennen

**Fundstelle:** `REQS`, `FLAGS`, `evaluate()`, `conflicts()`, eigene Anforderungen. [F:387-412, 559-582, 619-624]

**Befund:** Neue Anforderungen starten bei drei Punkten, also "eingeschränkt". Ein Must mit drei Punkten ist ohne Warnung zulässig. Pflichtbedingungen werden zugleich im weichen Score gewichtet. [F:565-569]

**Umsetzung:** Zulässigkeit von qualitativer Güte trennen. Für Pflichtbedingungen die Zustände `erfüllt`, `nur mit akzeptiertem Workaround`, `nicht erfüllt` und `nicht geprüft` vorsehen. Eigene Anforderungen starten bei "nicht geprüft".

Ungeprüfte Musts nicht als vollständig zulässig behandeln. Ihre Kosten dürfen sichtbar bleiben, jedoch als bedingt oder ungeprüft und ohne uneingeschränkte Siegerempfehlung. Workarounds benötigen eine bewusste Akzeptanz und eine Beschreibung.

Zertifikate, Plattformunterstützung und verbindliche Unternehmensrichtlinien möglichst als Status modellieren, nicht als subjektive Fünferskala. Should/Could dürfen weiterhin qualitativ bewertet werden. Eine getrennte Bewertung der Qualität einer erfüllten Pflichtanforderung ist nur mit erklärter Semantik sinnvoll.

Die Governance-Matrix muss Unternehmensregel und konkreten Tenant-Schalter unterscheiden. Organizational-Store-Ausnahmen sind keine automatisch genehmigten Unternehmensausnahmen. Umgekehrt folgt aus dem Tenant-Schalter nicht pauschal ein Verbot aller organisatorisch bereitgestellten Visuals. [W05]

**Abnahme:** Neue Must-Anforderung ohne Bewertung erzeugt Prüfbedarf. Zertifizierung "unbekannt" ist nicht "ja". Explizit verbotene Optionen erhalten keinen Platz 1. Wenn alle Optionen ausgeschlossen sind, fordert die App zur Klärung auf, nicht automatisch zur Lockerung einer Sicherheitsrichtlinie.

### T08 - P1 - Ranking, Break-even und Ergebnistexte ehrlich machen

**Fundstelle:** Sticky-Leiste, `rankVal`, `drawBreakEven()`, Headline. [F:203, 659-673, 708-726]

**Befund:** Die Sticky-Leiste heißt auch bei einer reinen Anforderungsrangfolge "Günstigste zulässige Option". Die Min-Max-Kostennormierung kann beim Hinzufügen einer von allen anderen dominierten Option die Rangfolge zweier unveränderter Kandidaten umkehren. Die Break-even-Interpretation behauptet teilweise einen späteren Schnittpunkt, obwohl keiner existiert. [L]

**Umsetzung:**

- "Günstigste zulässige Option" nur für reine Kostenrangfolge verwenden; sonst "Höchster gewichteter Score". Kostenunterschied und Score-Abstand getrennt benennen.
- Ein Score ist keine objektive Wahrscheinlichkeit, dass eine Option die beste ist. Keine entsprechende Formulierung verwenden.
- Kosten und Anforderungserfüllung immer separat zeigen. Für gemischte Rankings eine explizite, kandidatenunabhängige Kostenreferenz nutzen. Beispielsweise kann `costUtility = B / (B + cost)` mit festem, sichtbarem Referenzbudget `B > 0` verwendet werden. Das ist eine **Produktentscheidung**, kein wissenschaftlich einzig richtiges Verfahren; Wirkung und Sättigung erklären.
- Minimalalternative: Gemischte Siegerempfehlung vorübergehend deaktivieren und Kostenrang plus Anforderungsprofil separat anbieten. Nicht still die alte Normierung als unveränderlichen objektiven Score weiterverkaufen.
- Bei Break-even unterscheiden: Schnittpunkt gefunden, Gleichstand, kein Schnittpunkt im geprüften Bereich, nach der Modellfunktion kein Schnittpunkt. Außerhalb des untersuchten Bereichs nichts behaupten.
- Staffel- oder Paketpreise können Sprünge und mehrere Wechsel erzeugen. Nicht per linearer Interpolation eine Scheinschwelle erzeugen. Bei noch nicht unterstütztem Preisverlauf die Schwellenangabe ausblenden.
- Unterschiede in überlappenden Kostenbandbreiten nicht als sichere Einsparung formulieren. Überlappung allein beweist umgekehrt auch keinen Gleichstand; belastbare Vergleichsanteile benötigen gepaarte Szenarien aus T04.

**Abnahme:** Für den Rank-Reversal-Test in Abschnitt 7 bleibt A gegen B bei fester Referenz unverändert, wenn nur C hinzukommt. Bei kostenloser Paid-Lizenz und sonst konstanten Kosten behauptet die App keinen zwangsläufigen späteren Break-even. Sticky-Leiste, Karten und Export verwenden dieselbe Ranglogik.

### T09 - P1 - Konkrete irreführende Aussagen korrigieren

Die folgende Tabelle ist ein Text- und Regel-Backlog. Belegstatus nicht zwischen Produktfamilien vererben. Bei fehlender Quelle "nicht geprüft" setzen.

| Ausgangsaussage | Korrektur / Agentenauftrag | Basis |
|---|---|---|
| Paid skaliert immer mit jedem Viewer; nur Paid-Kosten steigen mit Viewern. | Als Annahme des gewählten Named-User-Modells kennzeichnen. Andere Modelle separat abbilden. | F:229-240, 332; W01-W03 |
| Paid ist im Report Server grundsätzlich nicht lizenzierbar. | Konkretes Produkt, Bereitstellung und Lizenzweg prüfen. AppSource-Lizenzdurchsetzung nicht mit jeder Herstellerlizenz gleichsetzen. | F:399, 410, 452; W01-W02 |
| Deneb hat eine universelle 30.000-Zeilen-Grenze. | Defaultlimit, mögliche Überschreitung, Ressourcengrenzen und Exportbeschränkungen unterscheiden. | F:393, 460; W06 |
| 32.766 Zeichen sind eine universelle SVG-Measure-Grenze. | Diese Schlussfolgerung aus der genannten Quelle entfernen. Importierte Textwerte, DAX-Verarbeitung und konkrete Rendering-Pfade getrennt prüfen. Keine alternative Universalgrenze erfinden. | F:393, 464, 483; W10 |
| Copilot erzeugt und liest nur Core Visuals. | Einzelne Arbeitsabläufe benennen: Berichtserstellung/-bearbeitung, Narrativ und Modellabfrage. Die geprüfte Quelle belegt die Custom-Visual-Einschränkung für Erstellung/Bearbeitung, nicht jeden denkbaren KI-Pfad. | F:396, 452, 463; W07 |
| Zertifizierung garantiert Reportqualität, fehlerfreien Export oder Sicherheit in jeder Konstellation. | Zertifizierte Fähigkeit und konkretes Reportverhalten trennen; nicht zertifiziert bedeutet umgekehrt nicht automatisch unsicher. | F:390-391, 451; W08 |
| Jedes Paid-Visual besitzt die relevanten Zertifikate und Writeback. | Status je konkretem Produkt/Edition belegen. IBCS-Produktfähigkeit nicht mit automatisch korrekter Anwendung verwechseln. | F:388-394, 451; W04, W08 |
| Kein kostenloses Visual ist IBCS-zertifiziert. | Keine universelle Negativaussage ohne vollständige belastbare Prüfung. Auf die konkret im Rechner konfigurierten Produkte begrenzen. | F:389, 408, 577; W08 |
| Deneb-Support gibt es nur über Sponsoring; Sponsoringbetrag entspricht einem garantierten persönlichen Stundenkontingent. | Sponsoring und individuell vereinbarte Unterstützung unterscheiden. Keine SLA aus einer Sponsorenstufe ableiten. | F:439, 460; W09 |
| Offen/Forkbar bedeutet Exit ohne Neubau; Core hat uneingeschränkte Exit-Fähigkeit. | Wartungsübernahme, Quellcodezugang und Portabilität getrennt bewerten. "Wechsel ohne Neubau" nur für einen definierten Zielpfad behaupten. | F:397, 455; analytischer Einwand |
| Ein KI-gestützter Beta-Aufwand belegt die Kostenersparnis gegenüber einer klassisch entwickelten Produktionslösung. | Nur vergleichbare Leistungsumfänge gegenüberstellen; Beta, Tests, Betrieb, Wartung und Verantwortlichkeit offenlegen. Die zugrunde liegende Fallstudie wurde hier nicht nachgeprüft. | F:430, 455, 492 |

**Abnahme:** Ein Repository-Textcheck findet die beanstandeten pauschalen Formulierungen nicht mehr in Oberfläche, Tooltips, Konfliktmeldungen, Methodik und Export. Korrigierter Text und korrigierte Ausschlussregeln widersprechen sich nicht.

### T10 - P1 - Navigation, Speichern und Versionswechsel stabilisieren

**Fundstelle:** Schrittlinks, `writeHash()`, `readHash()`, Preset-Handler. [F:218-223, 853-864, 877-880]

**Befund:** Navigation und Share-State belegen denselben Hash. Ein Schritt-Klick ersetzt `#s=...` durch beispielsweise `#s4`; bei erneuter Initialisierung fehlt der gespeicherte Zustand. Ein Mengengerüst-Preset setzt außerdem Governance-Schalter zurück. [L; F:877]

**Umsetzung:** State und Navigation entkoppeln, beispielsweise durch Scroll-Buttons bei weiter im Fragment gespeichertem Share-State. Ein Wechsel zu Query-Parametern ist nicht automatisch gleichwertig, weil sich dadurch die Übertragung der Eingaben an Server und Infrastruktur ändern kann.

Presets sollen ihren Geltungsbereich zeigen: Mengenpreset ändert Mengen, nicht unbemerkt Sicherheitsregeln; ein vollständiges Szenariopreset darf weitere Werte nach klarer Ankündigung ersetzen. Eigene Bewertungen nicht versehentlich löschen.

State mit `schemaVersion`, `modelVersion` und `defaultsVersion` versionieren. Alte Links möglichst migrieren, aber nicht behaupten, ein korrigiertes Modell müsse die alten fehlerhaften Ergebnisse reproduzieren. Veraltete Quellen beziehungsweise Defaultannahmen beim Laden sichtbar machen. Der gewählte Tornado-Ansatz ist derzeit nicht im Share-State enthalten; bewusst entscheiden, welche Ansichtseinstellungen mitgeteilt werden sollen. [F:496, 854]

**Abnahme:** Eigene Werte und Bewertungen bleiben nach Schrittwechsel, Browser-Zurück, Neuinitialisierung und Share-Roundtrip erhalten. Alte gültige Links werden migriert oder verständlich abgelehnt. Ein Mengenpreset deaktiviert keine Governance-Regel ohne explizite Entscheidung.

### T11 - P1 - Quellenstatus und Ergebnis-Transparenz verbessern

**Fundstelle:** Badges, Quellenliste, Methodenhinweise, Export. [F:297-301, 368, 469-492, 631-645, 780-782, 798-849]

**Befund:** Ein manuell geänderter Parameter kann weiterhin den ursprünglichen Status "verifiziert" tragen. Teilweise wird eine ganze Bandbreite durch eine Quelle legitimiert, die nur eine Teilinformation belegt.

**Umsetzung:**

- Pro Annahme und wesentlicher Produktfähigkeit Quelle, Datum, Geltungsbereich und Herkunft speichern.
- Zwischen Herstellerangabe, eigener Messung, Expertenschätzung und Nutzereingabe unterscheiden. "In Herstellerdokumentation belegt" ist präziser als ein unbegrenztes "verifiziert".
- Nach Änderungen aktuellen Status "eigene Annahme" zeigen, die ursprüngliche Quelle als Herkunft erhalten. Auch min/mode/max müssen nachvollziehbar sein.
- Direkt am Ergebnis eine kompakte Modellgrenze zeigen; nicht nur im Footer.
- Datenstand, gewählte Konfiguration, Overrides, offene Must-Prüfungen und wichtigste Kostentreiber in die geteilte beziehungsweise exportierte Zusammenfassung aufnehmen.

**Vorgeschlagener Ergebnishinweis:**

> Diese Bandbreiten entstehen aus den gewählten Modellannahmen. Sie sind keine empirisch abgesicherte Prognose tatsächlicher Projektkosten. Die Rangfolge gilt nur für den beschriebenen Leistungsumfang, die geprüften Produktvarianten und die angezeigten Rahmenbedingungen.

**Abnahme:** Ein geänderter Lizenzwert wird nicht weiterhin als unverändert belegter Herstellerpreis ausgegeben. Ein Empfänger kann aus dem Export erkennen, welche Annahmen geändert und welche Eigenschaften noch ungeprüft sind.

### T12 - P1 - Bedienbarkeit, Export und Abhängigkeiten prüfen

**Fundstelle:** Bewertungsfelder, Parameterinputs, Update-Handler, Excel-Export, Druck-CSS. [F:99-108, 610-616, 631-645, 785-850, 868-882, 889-894]

**Befund:** Im lokalen Browserzustand gab es 240 Bewertungs-Kästchen ohne eigene Tastaturbedienung und 51 sichtbare Zahlenfelder ohne programmatische Beschriftung. Die Mobile-Annahmentabelle ist bei 390 Pixeln sehr gedrängt. Der Excel-Export enthält ein separates Formelmodell und einen Simulations-Snapshot; der Download wurde hier nicht praktisch geprüft. [L; F:805-838]

**Umsetzung:**

- Bewertungen als semantische Buttons/Radio-Gruppen mit zugänglichen Namen, Status und Fokus umsetzen. Jeder Zahleneingang erhält eine Beschriftung aus Annahme, Einheit und min/mode/max.
- Fokus nach Neurendern erhalten. Hinweise und Fehlermeldungen nicht nur durch Farbe oder Hover vermitteln. Zahlenfelder für präzise Mengeneingabe neben Slidern vorsehen.
- Mobile Annahmen untereinander oder in aufklappbaren Gruppen darstellen. Breite Datentabellen dürfen einen bezeichneten eigenen Scrollbereich behalten. Keine pauschale Forderung, jede Tabelle auf 320 Pixel ohne horizontales Scrollen zu pressen.
- Rechenergebnisse cachen; reine Ansichtswahl darf nicht unnötig die gesamte Simulation neu starten. Bei Bedarf Input-Updates entprellen. Einen Worker erst nach Messung einsetzen.
- Nach T04/T05 Browser und Excel mit denselben deterministischen Fixtures vergleichen. Der Excel-Snapshot muss als nicht dynamisch gekennzeichnet bleiben. Das Formelmodell berechnet keine P10/P50/P90, nur weil ein anderes Blatt solche Zahlen enthält.
- Einheiten, Quellenstand, offene Anforderungen und Overrides mit exportieren. Die Behauptung "grüne Eingaben" nur verwenden, wenn die exportierten Eingaben tatsächlich entsprechend gestaltet sind. [F:834-835]
- Druckansicht so gestalten, dass relevante Annahmen aller verglichenen Optionen zugänglich sind, nicht nur der gerade aktive Parameter-Tab. Print-Zusammenfassung vor schönem Mehrseitenlayout priorisieren.
- Externe Fonts und nachgeladene Excel-Bibliothek dokumentieren. Bibliotheksversion, Herkunft und Lizenz gezielt prüfen, vorzugsweise lokal ausliefern. Hier wird keine konkrete bekannte Schwachstelle dieser Bibliotheksversion behauptet.
- Präziser Datenschutztext: Berechnung lokal; Share-Link enthält Einstellungen und ist nicht verschlüsselt; externe Ressourcen erzeugen Netzwerkzugriffe. Nicht behaupten, das Fragment werde automatisch als Teil einer HTTP-Anfrage übertragen. [F:14-16, 782, 786-789, 854]

**Abnahme:** Tastaturnutzung, zugängliche Labels, sinnvoller mobiler Flow, Verlustfreiheit des Share-States, funktionierender Export-Fallback und numerische Excel-Parität werden getrennt getestet und dokumentiert. Kein pauschales "barrierefrei" ohne entsprechende Prüfung.

### T13 - P2 - Hybridstrategie und vorhandene Assets

**Empfehlung:** Nach Korrektur der Grundlagen einen Mischfall ermöglichen: native Visuals für einfache Darstellungen, eine spezialisierte Lösung für Finance und gegebenenfalls Deneb für Sonderfälle.

Nicht die Gesamtkosten der Familien einfach mit Chart-Prozenten multiplizieren. Gemeinsame Infrastruktur und wiederverwendbare Assets nur einmal rechnen; zusätzliches Setup kann mehrfach nötig sein. Lizenzen nach tatsächlichen Nutzerkreisen, Überschneidungen und Vertragsmodell berechnen.

Vorhandene Templates, Wissen und Lizenzen als Ausgangslage erfassen. Bereits entstandene Kosten sind nicht automatisch künftige Zusatzkosten. "Start bei null" und "bestehenden Standard ausbauen" sollen unterschiedliche Szenarien sein.

**Abnahme für später:** Ein einziges lizenziertes Visual führt nicht automatisch zu einem entsprechend kleinen Bruchteil der Nutzungsrechte. Gemeinsam verwendete Grundlagen und einmalige Aufwände werden nicht mehrfach verbucht.

### T14 - P2 - Referenzmessung und qualitative Eignung

**Empfehlung:** Vor mehr Defaultzahlen einen kleinen Referenztest aufsetzen: dieselben Darstellungen bauen, wiederverwenden, ändern und exportieren. Kenntnisstand, Datenumfang, Version, Qualitätsziel und Fehlerbehebung protokollieren. Keine neue große Studie voraussetzen.

Als qualitative Anforderungen ergänzen: Tastatur-/Screenreader-Nutzung, mobile Darstellung, Lade-/Interaktionszeit, Verhalten bei langen Bezeichnungen und Verständlichkeit typischer Finance-Aufgaben. Fehlende Messung heißt "nicht geprüft", nicht ein erfundener mittlerer Score.

**Abnahme für später:** Mindestens ein dokumentierter Vergleichsfall mit identischem Zielzustand und nachvollziehbarer Aufwandsmessung. Beta und produktionsreife Lösung nicht gleichsetzen. Eigene Messergebnisse nicht ohne Begründung auf andere Teams verallgemeinern.

---

## 5. Minimales Datenmodell für die nächste Version

Das folgende Schema beschreibt Verantwortlichkeiten, nicht zwingend neue Dateien oder Klassen.

| Objekt | Benötigte Informationen |
|---|---|
| Szenario | Versionen, Mengen, Zeitraum, Referenz-Leistungsumfang, gemeinsame Plattformannahme, Gesamt- oder Zusatzkostenperspektive |
| Variante | Familie, konkretes Produkt/Edition oder Implementierungsmodus, Bereitstellungsweg, Lizenzmodell, genutzte Nutzergruppe |
| Annahme | min/mode/max oder fester Wert, Einheit, zulässiger Bereich, Herkunft, geprüfter Stand, Nutzeroverride |
| Fähigkeit | Anforderung, Status, gegebenenfalls Qualitätsscore, Beleg, Umgebung, Einschränkung, akzeptierter Workaround |
| Berechnung | Szenario-ID, gezogene Werte, Jahreskosten, Nutzerjahre, Stunden, separater Risikozuschlag, Gesamtkosten |
| Ergebnis | Aggregationsart, Kostenrang, gegebenenfalls gewichteter Rang, Ausschlüsse, ungeprüfte Musts, Quellenstand |

**Wichtig:** Eine Quelle ist nicht automatisch Beleg für alle Werte eines Objekts. Ein geprüfter Lizenzpreis beweist weder einen Schulungsaufwand noch einen Zertifizierungsstatus.

---

## 6. Prüfplan / Definition of Done

Die folgenden Tests sind Aufgaben für den Agenten. Nur die in Abschnitt 7 ausdrücklich genannten Ausgangsfehler wurden in diesem Review erneut ausgeführt.

| Test-ID | Prüffall | Erwartetes Verhalten | Ticket |
|---|---|---|---|
| SEC-01 | Eigene Anforderung mit HTML-ähnlichem Namen, Beschreibung und ungültiger ID importieren | Keine Codeausführung und kein eingeschleustes Element | T01 |
| SEC-02 | Kaputte Kodierung, falsche Datentypen, doppelte IDs, reservierte Schlüssel | Atomare Ablehnung oder erklärte Migration; kein Teilimport | T01 |
| VAL-01 | Negative Stunden, nicht endliche Zahl, `mode > max`, unzulässige Wahrscheinlichkeit | Konkrete Feldmeldung, keine neue ungültige Rechnung | T01 |
| VAL-02 | Sehr langer Share-State beziehungsweise zu viele Anforderungen | Dokumentierte Grenze; App bleibt reaktionsfähig | T01 |
| MOD-01 | Alle Dreipunktwerte fest: `[x,x,x]` | P10 = P50 = P90 = deterministischer Gesamtwert | T04/T05 |
| MOD-02 | OSS `readyMade` versus Entwicklungsmodus | Null Entwicklung im ersten Modus; deklarierter Aufwand im zweiten | T02 |
| MOD-03 | Ziehungen instrumentieren | Eine Ziehung je Annahme/Snapshot; gemeinsame globale Szenarien | T04 |
| MOD-04 | Seed, State und Modellversion unverändert | Reproduzierbare Ergebnisse | T04 |
| MOD-05 | Drei Jahre, drei Autoren, 40 Viewer, 10 % Wachstum, Lizenz 100 Euro | 14.140 Euro, 132,4 Viewer-Jahre; Konventionen aus Abschnitt 7 | T05 |
| MOD-06 | Null Viewer und mehrere Autoren | Gesamtkosten weiterhin korrekt; Viewer-Kennzahl nicht anwendbar | T05 |
| MOD-07 | Fluktuation aktiv | Ersatzschulung in Betriebsjahren, nicht komplett in Jahr 0 | T05 |
| MOD-08 | Jede Kostenkategorie und jedes Jahr aufaddieren | Summenidentitäten für jede einzelne Realisierung | T05 |
| MOD-09 | Mittelwert-Kostenstruktur und kumulierter Mittelwert | Passende Gesamtsumme und Endpunkt, keine Median-Skalierung | T05 |
| MOD-10 | Wachstum und Lizenzsteigerung null versus positiv | Korrekte konstante beziehungsweise wachsende Lizenz-Jahreskosten | T03/T05 |
| MOD-11 | Horizontwechsel 3/5/10 | Dokumentierte Risikobehandlung, keine unbemerkte alte Zeitbasis | T06 |
| LIC-01 | Named User, Jahrespauschale und Paketgrenze | Jeweils passende Preisfunktion; keine pauschale Viewer-Steigung | T03 |
| GOV-01 | Neu angelegtes Must ohne Bewertung | "Nicht geprüft"; kein uneingeschränktes Zulässigkeitssignal | T07 |
| GOV-02 | Workaround für Must | Explizite Akzeptanz erforderlich und im Export erkennbar | T07 |
| GOV-03 | Zertifizierung unbekannt; Unternehmensverbot; Tenant-Ausnahme | Unterschiedliche Zustände, kein unzulässiger automatischer Schluss | T03/T07 |
| GOV-04 | Alle Varianten ausgeschlossen | Keine Siegerempfehlung; Konflikte und Klärungsbedarf sichtbar | T07 |
| RANK-01 | Gewichtung 100 %, 0 %, gemischt | Korrekte Bezeichnungen und konsistente Reihenfolge | T08 |
| RANK-02 | Dominierte dritte Option hinzufügen | Unveränderter Vergleich A/B bei fester Score-Referenz | T08 |
| BE-01 | Kostenkurven ohne Schnittpunkt, Gleichstand, Schnittpunkt im Bereich | Keine unbelegte Extrapolation | T08 |
| BE-02 | Paketpreise mit Sprüngen | Keine lineare Scheinschwelle; mehrere Wechsel oder Einschränkung benennen | T03/T08 |
| STATE-01 | Wert ändern, Schritt wechseln, neu initialisieren, Link teilen | Identischer fachlicher Zustand | T10 |
| STATE-02 | Mengenpreset nach Governance-Anpassung | Keine stille Governance-Änderung | T10 |
| SRC-01 | Belegten Wert manuell ändern | Status Nutzereingabe, ursprüngliche Herkunft erhalten | T11 |
| UI-01 | Alle Interaktionen nur mit Tastatur | Fokus, Namen, Auswahl und Fehlermeldungen nutzbar | T12 |
| UI-02 | 390 und 320 Pixel Breite; 200 % Zoom | Keine verdeckten Pflichtfelder; Tabellen separat sinnvoll scrollbar | T12 |
| EXP-01 | Browser-Referenzrechnung gegen Excel-Formeln | Numerische Gleichheit vor Darstellungsrundung | T05/T12 |
| EXP-02 | Annahme in Excel ändern | Formelmodell reagiert; Simulations-Snapshot klar als veraltet/statisch erklärt | T12 |
| EXP-03 | Druck, Clipboard-Fehler, blockierte Exportbibliothek | Vollständige relevante Annahmen oder klarer begrenzter Report; funktionierender Fallback | T12 |

**Zusätzliche Invarianten:** Eine ausgeschlossene Variante ist niemals Sieger. Eine reine Darstellungsänderung verändert keine Kosten. Keine Statistik wird durch kosmetische Skalierung passend gemacht. Eine unbekannte Lizenz bedeutet nicht null Euro. Keine Kostensteigerung soll unbeabsichtigt aus dem Wechsel einer Quellenmarkierung entstehen.

---

## 7. Erneut ausgeführte lokale Prüfungen

### 7.1 Baseline und OSS-Entwicklung

Mit dem originalen Kostenkern, Originaldefaults, 1.500 Läufen und originalem Seed ergaben sich:

| Option | P50 Gesamtkosten |
|---|---:|
| Paid | 48.647,07 Euro |
| OSS / Eigenentwicklung | 32.637,86 Euro |
| Deneb | 77.219,11 Euro |
| Core + SVG | 50.176,76 Euro |

Nach ausschließlicher Eingabeänderung von `S.p.oss.devH` auf `[0,0,0]` ergab der bestehende OSS-Rechner **21.301,91 Euro P50**.

Diese Zahlen sind **Reproduktionsbelege des alten Modells**, keine Zielwerte für die korrigierte Version und keine Kostenempfehlung. Die Änderung einer degenerierten Verteilung verändert im bestehenden Generator auch den Verbrauch von Zufallszahlen; die Differenz ist deshalb nicht als exakte isolierte Kostenzerlegung zu interpretieren.

Der mathematisch sichere Befund lautet:

```text
PERT-Mittelwert([0,0,400]) = (0 + 4*0 + 400) / 6 = 66,6667 Stunden
```

### 7.2 Deterministischer Wachstumstest

Eingaben: drei Autoren, 40 zusätzliche Viewer, drei Jahre, 10 % Viewer-Wachstum, null Preissteigerung, 100 Euro Lizenz je Named User/Jahr, alle übrigen Kosten null. Autoren bleiben konstant, Viewer steigen erst nach Jahr 1. Keine Seat-Rundung.

| Betriebsjahr | Autoren | Viewer | Lizenzpflichtige Nutzer | Lizenzkosten |
|---|---:|---:|---:|---:|
| 1 | 3 | 40 | 43 | 4.300 Euro |
| 2 | 3 | 44 | 47 | 4.700 Euro |
| 3 | 3 | 48,4 | 51,4 | 5.140 Euro |
| Gesamt / Personenjahre | 9 | 132,4 | 141,4 | **14.140 Euro** |

Der alte Kostenkern errechnet **14.233 Euro**, weil die drei Autoren mitwachsen. Sein aktueller Viewer-Divisor beträgt **120** statt 132,4. Die alten Lizenzkosten wurden direkt reproduziert; die korrekte Jahrestabelle ist die aus der genannten Konvention abgeleitete Referenz.

### 7.3 Nachgewiesene Kontextabhängigkeit des Rankings

Originalformel, 50 % Kosten / 50 % Anforderungen:

```text
costNormalized = (cost - minCost) / (maxCost - minCost)
rankValue = 0.5 * costNormalized + 0.5 * (1 - requirementScore/100)
# Kleiner rankValue ist besser.
```

- A: Kosten 100, Anforderungs-Score 40.
- B: Kosten 150, Anforderungs-Score 60.
- Nur A und B: A = 0,30; B = 0,70. A liegt vorn.
- C ergänzen: Kosten 1.000, Score 0. C ist teurer und schlechter als beide.
- Mit C: A = 0,30; B = 0,2278. Jetzt liegt B vorn, obwohl A und B unverändert sind.

Das ist kein Rechenfehler der Formel, sondern eine problematische Eigenschaft der kandidatenabhängigen Normierung. Die Entscheidung, sie zu ersetzen, ist eine Modellentscheidung.

### 7.4 Unzutreffende Break-even-Extrapolation

Originaldefaults, aber Paid-Lizenz `[0,0,0]` und Wachstum `[0,0,0]`. Damit sind die berechneten Gesamtkosten aller vier Ansätze unabhängig von der Viewer-Zahl. Paid ist in diesem Test günstiger. Trotzdem sagt die Oberfläche, die anderen Ansätze würden erst jenseits von 200 Viewern günstiger. Das kann unter diesen unveränderten Modellannahmen nicht eintreten.

### 7.5 Browserprüfungen

**Sicherheit:** Eine importierte eigene Anforderungs-ID mit einem harmlosen DOM-Test setzte `window.__review_xss` auf `1`. Alle Netzwerkzugriffe waren blockiert. Keine fremde Website wurde angegriffen und keine Daten wurden ausgelesen.

**State:** Viewer auf 990 gesetzt; Schritt "Annahmen" angeklickt; Hash wechselte von gespeichertem State zu `#s4`. Bei neuer Initialisierung der HTML-Datei mit diesem Fragment erschienen wieder 40 Viewer. Diese Prüfung ist eine Reinitialisierung mit dem resultierenden Fragment, kein Test der Reload-Funktion auf der produktiven Website.

**Beschriftung:** Bei 0 % Kosten / 100 % Anforderungen lag Paid laut Headline vorn; OSS war nach den angezeigten Kosten rund 16.000 Euro günstiger. Die Sticky-Beschriftung blieb dennoch "Günstigste zulässige Option".

**Zugänglichkeit:** Im getesteten Defaultzustand 240 Bewertungs-Kästchen ohne eigene Tastaturbedienung, 51 sichtbare numerische Annahmenfelder ohne zugeordnetes Label oder ARIA-Beschriftung. Das ist kein vollständiges Accessibility-Audit.

---

## 8. Empfohlene Umsetzungspakete und Agenten-Rückgabe

### Paket A - Sichere, verlustfreie Interaktion

T01 und T10: Importvalidierung, sichere DOM-Ausgabe, Share-/Navigationskonflikt und klare Preset-Grenzen. Zuerst Tests, dann Fixes. Bestehendes visuelles Erscheinungsbild weitgehend erhalten.

### Paket B - Fairer Vergleich

T02, T03 und die direkt dazugehörigen Texte aus T09: Varianten, fertiges OSS ohne Entwicklung, konkrete Lizenzmodelle und keine pauschal falschen K.O.-Regeln. Ungeprüfte Angebote nicht erfinden.

### Paket C - Nachvollziehbare Rechnung

T04 und T05, dazu die minimale Risikoklarstellung aus T06: deterministische Szenario-Snapshots, Jahreskosten, Nutzerjahre, korrekt beschriftete Statistik. Danach die bisherige Excel-Rechenlogik synchronisieren oder als vorübergehend nicht kompatibel deaktivieren.

### Paket D - Entscheidungs- und Ausgabequalität

T07 bis T12 vervollständigen: Unknown-Status, korrekte Rankingtexte und Break-even-Aussagen, Quellenstatus, Tastaturbedienung, Mobile und Exporte. Vollständige Regressionstests aus Abschnitt 6 ausführen.

### Paket E - Bewusst später

T13/T14: Hybridmodell, vorhandene Assets und empirische Kalibrierung. Für den korrigierten Indikationsrechner nicht zwingend vor dem nächsten Release notwendig.

### Was der Agent zurückgeben soll

1. Geänderte Anwendung und ausführbare Tests beziehungsweise genaue Testbefehle.
2. Kurzes Changelog mit Ticket-IDs und Trennung zwischen Bugfix, Modellentscheidung und Textkorrektur.
3. Testbericht mit tatsächlich ausgeführten Prüfungen, Ergebnissen und nicht ausgeführten Checks.
4. Liste offener Hersteller-/Produktfragen, statt ausgedachter Fakten.
5. Modellmigration: Welche Ergebnisse ändern sich warum? Keine bloße Aussage "Zahlen wurden aktualisiert".

**Release-Gate:** Keine bekannte ausnutzbare Share-Import-Lücke, keine unbemerkte Zustandslöschung, keine offensichtlich widersprüchliche Rechnung, kein erfundener Produkt-Funktionsumfang, kein ungeprüftes Must als erfüllt und keine falsche statistische Beschriftung. Optional noch nicht korrekte Funktionen lieber gezielt deaktivieren als still unzuverlässig ausliefern.

---

## 9. Quellen und Prüfgrenzen

### Ausgangsdatei

`[F:...]` verweist auf die am Anfang eindeutig bezeichnete Datei `visualstandardsrechner.html`. Inhaltliche Aussagen über Implementierung und Defaults sind daraus abgeleitet, nicht aus einer unabhängigen Bewertung der genannten Produkte.

### Externe Primärquellen - gezielter Abgleich am 10.09.2026

**[W01] Microsoft Learn - License models for Power BI AppSource visuals**  
`https://learn.microsoft.com/en-us/power-bi/developer/visuals/custom-visual-licenses`  
Belegt Einschränkungen der AppSource-Lizenzverwaltung beziehungsweise -durchsetzung. Daraus folgt kein universelles Verbot aller kommerziellen Lizenzwege in diesen Umgebungen.

**[W02] Inforiver - Analytics+ Pricing**  
`https://inforiver.com/analytics-plus/pricing/`  
Die geprüfte Seite unterscheidet unter anderem Power BI Service, Report Server und Embedded sowie Named-User- und weitere Vertragsmodelle. Preis und Eignung hängen von der gewählten Konfiguration ab. Nicht alle angebotenen Varianten sind für alle Umgebungen gleich nutzbar.

**[W03] Zebra BI - Power BI plans / Pricing**  
`https://zebrabi.com/pricing/power-bi-plans/`  
`https://zebrabi.com/pricing/`  
Die geprüften Seiten nennen unter anderem Pakete für 10 beziehungsweise 50 Nutzer und individuelle Enterprise-Angebote. Das Business-Paket wird mit 3.792 USD jährlich für 50 Nutzer beschrieben. Starter enthält eine Erstjahresbedingung. Das sind datierte Quellenbelege, keine unveränderlichen neuen Defaults oder in Euro umgerechnete Angebote.

**[W04] Inforiver - Writeback Matrix Pricing**  
`https://inforiver.com/writeback-matrix/pricing/`  
Eigenständiges Produkt-/Editions- und Preisangebot. Die Existenz eines günstigen Analytics+-Preises belegt keinen identischen Writeback-Umfang zu diesem Preis. Die dynamische Preisoberfläche ist kein Ersatz für ein konkretes Angebot.

**[W05] Microsoft Learn - Manage Power BI visuals admin settings**  
`https://learn.microsoft.com/en-us/fabric/admin/organizational-visuals`  
Beschreibt Unterschiede zwischen Service und Desktop sowie Ausnahmen für Organizational Visuals. Diese technischen Ausnahmen sind getrennt von verbindlichen Unternehmensrichtlinien zu behandeln.

**[W06] Deneb - Dataset / Query (Row) Limits**  
`https://deneb.guide/docs/dataset`  
30.000 Zeilen als Default, mögliche Überschreitung unter Ressourcenbedingungen und ausdrückliche Einschränkungen für zuverlässigen PDF-/PPT-Export bei zusätzlichem Nachladen.

**[W07] Microsoft Learn - Create and edit Power BI reports with Copilot**  
`https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-create-reports`  
Custom-Visual- und Formatierungsbeschränkungen im beschriebenen Erstellungs-/Bearbeitungsworkflow. Keine vollständige Bewertung aller Copilot-Erlebnisse, Modellabfragen und Narrativfunktionen.

**[W08] Microsoft Learn - Certified visuals; IBCS - Certified Software**  
`https://learn.microsoft.com/en-us/power-bi/developer/visuals/power-bi-custom-visuals-certified`  
`https://www.ibcs.com/software/`  
Beschreiben Gegenstand und Grenzen der jeweiligen Zertifizierung. Eine Software-Zertifizierung belegt nicht die korrekte fachliche Umsetzung jedes einzelnen Berichts. Die komplette aktuelle Zertifikatslage aller einzelnen Produkte wurde in diesem Review nicht katalogisiert.

**[W09] Deneb - GitHub Sponsors**  
`https://github.com/sponsors/deneb-viz`  
Unterscheidet Sponsoring von separat vereinbarbaren Unterstützungs-/Serviceleistungen. Sponsorenstufen sind ohne konkrete Vereinbarung kein allgemeines SLA.

**[W10] Chris Webb - What Is The Maximum Length Of A Text Value In Power BI?**  
`https://blog.crossjoin.co.uk/2019/05/17/maximum-length-text-value-power-bi/`  
Primärbericht eines technischen Experiments zu unterschiedlichen Textgrenzen. Die Ausgangsdatei verwendet ihn zu pauschal als Beleg für SVG-Measures. Der Beitrag ist kein aktueller Nachweis aller heutigen Renderingpfade.

### Nicht geprüft / nicht daraus ableiten

Kein komplettes Sicherheitsaudit, keine rechtliche Freigabe, kein vollständiger Markt- und Lizenzkatalog, keine produktive Power-BI-Kompatibilitätsmatrix und keine empirisch validierte Standardkostenstudie. Die Fallstudie zur KI-Eigenentwicklung und der Fabric-Apps-Ausblick der Ausgangsdatei wurden hier nicht gesondert verifiziert. Behauptungen daraus nicht ungeprüft in neue Defaults übernehmen.

---

## 10. Abschließende Red-/Blue-Team-Entscheidung

**Red Team:** In der Ausgangsversion sind einzelne Sicherheits-, Rechen- und Vergleichsprobleme stark genug, um Ergebnisse materiell zu verfälschen oder falsch zu interpretieren. Ein Disclaimer allein reicht nicht.

**Blue Team:** Die zentrale Idee ist tragfähig. Ein Indikationsrechner darf vereinfachen, Expertenschätzungen verwenden und einen moderierten Austausch unterstützen. Er muss dafür weder ein Beschaffungssystem noch eine wissenschaftliche Vollsimulation werden.

**Gemeinsamer Beschluss:** Den bestehenden Rechner gezielt härten. Erst Sicherheit, Vergleichbarkeit und Zahlenkonsistenz; dann Eignungsstatus, Bedienung und Belegbarkeit; erst danach Hybridfunktionen und weitere Ausbaustufen. Das Ziel ist nicht ein bestimmter Gewinner, sondern eine nachvollziehbare Entscheidung unter offen gelegten Annahmen.
