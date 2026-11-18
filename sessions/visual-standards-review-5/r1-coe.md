# Review r1-coe: Leiterin BI Center of Excellence, DAX-Konzern

**Gesamturteil: 3 von 5.** Die Rechnungen sind solide und reproduzierbar. Die Schlagzeilen hängen aber an einer K.O.-Matrix, die so nicht veröffentlicht werden sollte.

## Was ich nachgerechnet habe

Den 100k-Lauf habe ich mit dem unveränderten Rechenkern (`visual-standards-rechner.html`, Profilgenerator aus `tools/rechner-population-100k.js`) erneut laufen lassen. Die dritte Linse kommt exakt wieder heraus: Paid 28,4 %, OSS 15,1 %, Deneb 15,2 %, Core 30,4 %, kein Weg 10,9 %. Die Arithmetik ist also in Ordnung. Strittig sind die Bewertungen in der Anforderungstabelle `REQS`: Ein Must schließt einen Weg nur dann aus, wenn er dort mit `cap = 1` bewertet ist. Wo eine 1 oder eine 2 steht, entscheidet damit über die Rangfolge, und mehrere dieser Werte halten der Praxis nicht stand.

## Vier K.O.-Bewertungen, die ich als Tenant-Admin nicht unterschreiben würde

1. **RDL schließt Core nicht aus.** `paginated` hat die Bewertung `[1,1,1,2]`. Der eigene Abschnitt „Grenzen“ sagt aber zu Recht: Weder Custom Visuals noch Core Visuals existieren in RDL, der Zweitbau trifft alle vier Wege gleich. Trotzdem gewinnt Core, sobald RDL Must ist. Im Kontrafaktum ist das der zweitstärkste Hebel (87 %). Setze ich RDL neutral, fällt Core in der dritten Linse von 30,4 % auf 22,7 %.
2. **Report Server schließt Paid aus.** In der Praxis stimmt das nicht. Inforiver lizenziert den Power BI Report Server direkt über einen Lizenzschlüssel, Zebra BI läuft dort mit Lizenz je Nutzer. Nur der AppSource-Lizenzweg fällt weg, und die eigene Notiz („Hersteller-eigene Lizenzwege je Produkt prüfen“) sagt das selbst. Aus dem K.O. sollte eine Warnung mit Aufschlag werden. Dann steigt Paid um 4 Pp., im Konzern-Segment von 19,9 % auf 24,9 %.
3. **Deneb übersteht ein SLA-Must.** Für Deneb gibt es laut eigener Notiz nur GitHub-Sponsoring. Das ist kein vertraglich zugesicherter Support mit Reaktionszeit. Unser Einkauf würde das nicht als SLA akzeptieren. Mit `cap = 1` fällt Deneb nutzergewichtet von 15,8 % auf 6,4 %, im Konzern auf 3,8 %. Damit steht der Deneb-Spitzenplatz im nutzergewichteten Rating (C7: Deneb 36 %) auf wackligem Grund, denn Konzerne tragen dieses Rating.
4. **Unzertifiziertes Open Source übersteht die Musts „PDF/PPT-Export und Abos“ und „Microsoft-zertifiziert“.** Beide sind nur mit 2 bewertet. Unzertifizierte Visuals exportieren im Service aber nicht nach PDF oder PowerPoint und erscheinen nicht in E-Mail-Abos; laut Microsoft Learn sind nur zertifizierte Custom Visuals ausgenommen. Der Code des Rechners schreibt genau diese Warnung selbst. In meinem Haus sind Export und Abos für das Vorstandsreporting nicht verhandelbar. Bei den Personas kommt eines der beiden Musts im Mittel mit 54 % Wahrscheinlichkeit vor. Mit korrekter Bewertung fällt OSS in der 100k-Linse von 15,1 % auf 6,0 %. **Dieser Fehler begünstigt die Kategorie der Autoren.** Er ist vermutlich nicht absichtlich entstanden, ist aber nicht offengelegt.

Korrigiere ich Punkt 1 bis 3 und lasse das Copilot-Must weg (dazu weiter unten), ergibt die dritte Linse **Paid 41,6 %, Core 22,0 %, OSS 17,4 %, Deneb 12,1 %, kein Weg 7,0 %**. Nehme ich Punkt 4 dazu, sinkt OSS auf 6,7 %. „Kein Weg gewinnt immer“ bleibt richtig. „Paid und Core gleichauf“ ist dann aber nicht mehr haltbar.

## Das Kontrafaktum ist richtig gebaut, aber falsch gelesen

Das Kontrafaktum statt eines Random Forest zu nehmen, ist methodisch die richtige Entscheidung. Die Aussage „91 % kippen, wenn Copilot Must wird; harte Weichen schlagen jeden Kostenhebel“ ist aber eine bedingte Wahrscheinlichkeit: Jeder Hebel wird bei allen 1.000 Firmen umgelegt. Ein K.O., das drei von vier Wegen streicht, kippt den Gewinner fast zwangsläufig. Für die Bedeutung im Markt zählt Verbreitung mal Flip-Rate. Laut `personas.json` ist Copilot bei 4 % Must, RDL bei 7 %, die Sperre für Custom Visuals bei 4 %, „kein Lizenzbudget“ bei 10 % und „kein Vendor-Lock-in“ bei 18 %. Daraus ergeben sich erwartete Wechsel von 3–10 % der Firmen. Den Lizenzpreis muss dagegen jede Firma bezahlen, und dieser Hebel kippt den Gewinner bei 33 %. In Populationssicht stehen Preis und Horizont also mindestens gleichauf mit den harten Weichen.

Dazu kommt ein Etikettenproblem: Die Zeile heißt im Rechner „Copilot / KI im Visual“, im Report steht „Copilot muss Reports bauen“. Seiten, die Copilot erstellt, nutzen Core Visuals. Ein Custom-Visual-Standard in den übrigen Reports ist damit nicht ausgeschlossen. Als K.O. für den Visual-Standard würde ich das nicht führen.

## Konzern-Realität

- **29 % der Konzerne ohne zulässigen Weg** (100k, `win_by_seg.konzern`) gibt es in der Praxis nicht. Musts werden unabhängig voneinander gezogen, im Schnitt sind es 6,4 je Konzern. Bei uns wird eine Must-Liste verhandelt, bis ein Weg übrig bleibt. Ich wünsche mir eine Variante „nach Priorisierung“.
- **„Kein Lizenzbudget“ als dauerhaft harte Regel** über 5–10 Jahre, während dieselbe Organisation 0,1–0,2 FTE an internen Stunden ausgibt: Das ist ein Haushaltsprozess und kein K.O.
- **Die Ersteller-Zahlen in den Persona-Konzernen** sind klein: im Median etwa 25 (Spanne 6–150). Wir haben 250. Die Schulungskosten für Deneb skalieren damit.
- **KI-Adoption im Konzern mit Modus 50 %** halte ich für optimistisch. Betriebsvereinbarung, Datenschutzfreigabe für Coding-Agents und Lizenzzuteilung dauern bei uns 6–18 Monate. Für C5 spielt das aber kaum eine Rolle, denn der Effekt ist ohnehin klein. Die Aussage „KI ändert die Rangfolge kaum“ halte ich für die robusteste des ganzen Pakets.
- **Fix-Stunden je Breaking-Update** sind pauschal und wachsen nicht mit der Zahl der Reports oder Modelle. Bei Deneb (Spec je Instanz) und Core + SVG (Measures je Modell) ist das systematisch zu niedrig. In Euro geht es um etwa 2 € je Viewer und Jahr, also wenig, aber immer in dieselbe Richtung.
- **Mischbetrieb fehlt.** Wir fahren Paid im Management-Reporting und Core im Self-Service parallel. Ein einzelner Gewinner je Firma bildet das nicht ab.

## OSS mit 1 FTE (C9, C10)

Dieses Szenario beschreibt genau das Geschäftsmodell der Autoren, und das ist offengelegt. Drei Punkte halten aber nicht:

1. Ohne Zertifizierung scheitert das Visual bei uns an Export und Abos (siehe Punkt 4 oben). Tragfähig ist nur die zertifizierte Variante.
2. Eine einzelne FTE bekommt 2 % Abkündigungsrisiko wie ein Hersteller, obwohl der Rechner selbst 11 % Fluktuation p. a. annimmt.
3. Der Text rechnet mit „48 % OSS-Mehrheit“ (`ossMajority`), die Tabelle zeigt 38 %; das sind zwei verschiedene Kennzahlen.

Außerdem kann unser Einkauf nicht ohne Vertrag „mitfinanzieren“. Mit Vertrag und SLA wäre es aber faktisch Paid.

## Was gut ist

Die Ergebnisse sind reproduzierbar, die Läufe gepaart und das Kontrafaktum sauber begründet. Interessenkonflikt, KI-Herkunft und die Selbstbewertung von Opus werden offen benannt. Die Botschaft „erst Regeln und Musts klären, dann rechnen“ würde ich jedem CoE so mitgeben.

## Vor der Veröffentlichung

1. Die K.O.-Matrix korrigieren: RDL neutral, Report Server bei Paid als Warnung, SLA bei Deneb mit 1, OSS ohne Zertifizierung bei Export und Zertifizierung mit 1.
2. Im Kontrafaktum die prävalenzgewichtete Spalte ergänzen und die Schlagzeile „91 %“ als bedingte Aussage umformulieren.
3. Das OSS-Szenario auf die zertifizierte Variante stützen, eine einzige Kennzahl durchziehen und das Abkündigungsrisiko für eine einzelne FTE realistisch ansetzen.
4. Eine Must-Ziehung mit Priorisierung ergänzen.

*Nachlauf-Skript und Daten: `review5/r1-work/variants-100k.js`, `var-100k.json`.*
