# LinkedIn-Posts · P&L Statement byDatenWG (Beta)

> **Fassungen zum Kopieren** — deutsch und englisch, jeweils als eigener Post
> gedacht (nicht als zweisprachiger Doppelpost).
>
> **Publish-Checkliste (vorher, ~10 Minuten):**
> 1. Prüfen, dass die verlinkten Seiten live sind:
>    `https://datenwgknowledgekitchen.com/pnl-schnellstart.html` (DE) bzw.
>    `…/pnl-schnellstart_en.html` (EN) und der jeweilige Beta-Post
>    (`pnl-beta-post.html` / `pnl-beta-post_en.html`).
>    Solange der Branch noch nicht in `main` gemergt ist: die GitHub-Links unten
>    verwenden.
> 2. Bild anhängen: ein eigener Screenshot des Visuals aus Power BI Desktop
>    (Tabelle mit Δ-Balken oder der Treiberbaum). **Keine fremden Screenshots,
>    keine IBCS-Musterbilder.**
> 3. Nach dem Posten den Kommentar-Baustein als ersten eigenen Kommentar setzen.
>
> Link-Varianten (falls kein Merge/Deploy):
> - Visual (.pbiviz): `https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/pnlByDatenWG/dist`
> - Repo-Ordner: `https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/pnlByDatenWG`
> - Feedback/Issues: `https://github.com/losveratos/powerbi-kitchen-/issues`

---

## DE · Hauptfassung

Eine GuV ist kein Diagramm. Sie ist eine Tabelle mit Gedächtnis.

Zeilen, die zueinander gehören. Zwischensummen, die sich aus ihren Kindern ergeben. Formelzeilen wie EBITDA oder Bruttomarge. Kostenzeilen, die negativ rechnen und positiv angezeigt werden. Und ein „unter Plan", das bei Umsatz schlecht und bei Kosten gut ist.

Das mit einer Matrix und ein paar bedingten Formatierungen nachzubauen, kostet jedes Mal einen Nachmittag — und ist danach trotzdem starr.

Deshalb gibt es jetzt ein eigenes Power-BI-Custom-Visual dafür: **P&L Statement byDatenWG**, ab heute als Beta zum Ausprobieren.

Was es macht:
▪ Kontenhierarchie direkt aus der Dimensionstabelle — als Ebenen-Spalten L1..Ln oder klassisch Parent-Child, unbalanciert erlaubt
▪ Summen- und Formelzeilen (`[Gross profit]+[Operating expenses]`), inklusive Vorzeichenlogik und „Abweichungsfarbe drehen" für Kostenzeilen
▪ Szenarien AC / PY / PL / FC mit Δ-Balken und Δ%-Pins — eine identische Skala je Δ-Spalte über alle Zeilen
▪ vier Ansichten aus einer Bindung: Tabelle, Struktur-Bars, Zeilen-Waterfall und ein Werttreiberbaum mit Kachel-Zoom
▪ Klick setzt die Power-BI-Selektion: Cross-Filtering und nativer Drillthrough ins Konto-Detail

Der ehrliche Teil: Es ist eine **Beta**. Nicht im AppSource, nicht von Microsoft zertifiziert, Feldrollen und Einstellungen können sich noch ändern. Erst im Testbericht ausprobieren, dann entscheiden.

Gebaut wurde es KI-gestützt — gesteuert aus dem Controlling-Fachwissen, verifiziert über Tests und eine öffentliche Git-Historie. Der Rechenkern ist bewusst ohne Power-BI-Abhängigkeiten und isoliert getestet, weil ein Reconciliation-Fehler in einer GuV der schnellste Weg wäre, Vertrauen zu verlieren.

Schnellstart mit beiden Wegen (normale Hierarchie in 2 Minuten · volle GuV mit Formelzeilen), Download und Demo-Daten: [LINK ZUM SCHNELLSTART]

Rückmeldungen, Fehler und Gegenbeispiele sind ausdrücklich erwünscht: [LINK ZU GITHUB ISSUES]

Notation nach den IBCS®-Standards 1.2 (CC BY-SA 4.0, ibcs.com); IBCS® ist eine eingetragene Marke der HICHERT+FAISST GmbH — dieses Visual ist nicht von der IBCS Association zertifiziert.

#PowerBI #Controlling #IBCS #GuV #Reporting #BusinessIntelligence #DataViz #OpenSource

---

### DE · Baustein für den ersten eigenen Kommentar

Drei Dinge, nach denen erfahrungsgemäß zuerst gefragt wird:

1. **Braucht man eine GuV-Struktur?** Nein. Weg 1 bindet nur die Ebenen einer vorhandenen Hierarchie (z. B. Kategorie → Produktlinie) plus AC/PY/PL — der Treiberbaum wächst dann aus der Hierarchie statt aus Formelzeilen.
2. **Der häufigste Stolperstein:** alle Gruppierungsfelder auf „Nicht zusammenfassen" stellen, und Ganzjahres-Measures mit MAX statt SUM (die FY-Skalare stehen auf jeder Monatszeile identisch).
3. **Fiskaljahr?** Perioden-Sortierung auf „Datenreihenfolge" — dann gilt die Reihenfolge aus dem Modell statt der Kalenderlogik.

Demo-Daten (Pharma-Sternschema, Monatsgrain, mit Abnahme-Werten zum Gegenrechnen) liegen im Repo.

---

## EN · Main version

A P&L is not a chart. It is a table with a memory.

Rows that belong together. Subtotals that follow from their children. Formula rows like EBITDA or gross margin. Cost rows that compute negative and are displayed positive. And a "below plan" that is bad for revenue and good for cost.

Rebuilding that with a matrix and a handful of conditional formats costs an afternoon every time — and it is still rigid afterwards.

So there is now a dedicated Power BI custom visual for it: **P&L Statement byDatenWG**, available from today as a beta.

What it does:
▪ the account hierarchy straight from your dimension table — as level columns L1..Ln or classic parent-child, unbalanced allowed
▪ subtotal and formula rows (`[Gross profit]+[Operating expenses]`), including sign conventions and a variance-invert for cost rows
▪ scenarios AC / PY / PL / FC with variance bars and Δ% pins — one identical scale per Δ column across all rows
▪ four views from one binding: table, structure bars, row waterfall and a value driver tree with card zoom
▪ a click sets the Power BI selection: cross-filtering and native drillthrough into the account detail

The honest part: this is a **beta**. Not on AppSource, not certified by Microsoft, field roles and settings may still change. Try it in a test report first, then decide.

It was built AI-assisted — steered from controlling domain knowledge, verified through tests and a public git history. The calculation engine is deliberately free of Power BI dependencies and tested in isolation, because a reconciliation error in a P&L would be the fastest way to lose trust.

Quick start with both paths (a plain hierarchy in 2 minutes · the full P&L with formula rows), download and demo data: [LINK TO QUICK START]

Feedback, bugs and counterexamples are explicitly welcome: [LINK TO GITHUB ISSUES]

Notation based on the IBCS® Standards 1.2 (CC BY-SA 4.0, ibcs.com); IBCS® is a registered trademark of HICHERT+FAISST GmbH — this visual is not certified by or affiliated with the IBCS Association.

#PowerBI #Controlling #IBCS #FinancialReporting #DataViz #BusinessIntelligence #OpenSource

---

### EN · Building block for the first own comment

The three questions that come up first:

1. **Do I need a P&L structure?** No. Path 1 binds only the levels of an existing hierarchy (e.g. category → product line) plus AC/PY/PL — the driver tree then grows from the hierarchy instead of from formula rows.
2. **The most common trap:** set every grouping field to "Don't summarize", and build full-year measures with MAX instead of SUM (the FY scalars repeat identically on every monthly row).
3. **Fiscal year?** Set the period sort order to "data order" — the order from the model then wins over calendar logic.

Demo data (a pharma star schema at monthly grain, with reconciliation figures to check against) is in the repository.
