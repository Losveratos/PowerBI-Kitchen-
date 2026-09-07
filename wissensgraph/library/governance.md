---
id: "topic:governance"
name: "Governance"
typ: thema
stand: "2026-09-07"
build: "20260907-1012"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 27
kernaussagen: 64
mit_kernaussagen: 18
aliase:
  - "Data Governance"
  - "Compliance"
  - "Richtlinien"
---

# Governance

Einzelne Workspaces lassen sich als Mission Critical markieren, damit sie von der automatischen Pausierung durch die Search Protection ausgenommen bleiben. Bei großflächig ausgerolltem Self-Service BI ist es nicht mehr Ziel der zentralen Abteilung, einen umfassenden Single Point of Truth zu etablieren, Security bleibt aber weiterhin zentral geregelt. Metadaten lassen sich für Data Health und Data Governance nutzen, weil sie standardisiert ausgewertet werden können.

## Aliase

Data Governance, Compliance, Richtlinien

## Nachbarthemen

| Thema | Kantentyp | Belastbarkeit | Gemeinsame Segmente |
| --- | --- | --- | --- |
| [Self-Service BI](self-service-bi.md) | gegensatz | belegt | 4 |
| [Microsoft Fabric](microsoft-fabric.md) | ko-vorkommen | heuristik | 26 |
| [Power BI](power-bi.md) | ko-vorkommen | heuristik | 25 |
| [Reporting](reporting.md) | ko-vorkommen | heuristik | 15 |
| [Sicherheit](sicherheit.md) | ko-vorkommen | heuristik | 13 |
| [Snowflake](snowflake.md) | ko-vorkommen | heuristik | 12 |
| [Performance](performance.md) | ko-vorkommen | heuristik | 12 |
| [Workspace](workspace.md) | ko-vorkommen | heuristik | 11 |
| [OneLake](onelake.md) | ko-vorkommen | heuristik | 10 |
| [Warehouse](warehouse.md) | ko-vorkommen | heuristik | 10 |
| [Mirroring](mirroring.md) | ko-vorkommen | heuristik | 9 |
| [Excel](excel.md) | ko-vorkommen | heuristik | 9 |
| [Row-Level Security](row-level-security.md) | ko-vorkommen | heuristik | 9 |
| [DirectQuery](directquery.md) | ko-vorkommen | heuristik | 7 |
| [Data Pipeline](data-pipeline.md) | ko-vorkommen | heuristik | 7 |

## Kernaussagen

| Typ | Dokument | Zeit | Aussage | Beleg |
| --- | --- | --- | --- | --- |
| Empfehlung | GxP Talk - KI im regulierten Umfeld? | 03:08 | Arthur überträgt das Prinzip, dass in der Pharmabranche Prozesse validiert und Systeme qualifiziert werden statt Mitarbeiter, auch auf den Umgang mit KI. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=188s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 04:49 | Ein großer Pharmakonzern hat bei einem KI-Projekt im GXP-Bereich die prüfenden Behörden aktiv eingebunden, um gemeinsam die Grenzen des Machbaren auszuloten. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=289s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 10:37 | Für traditionelle KI existiert im GXP-Umfeld ein risikobasierter Ansatz, bei dem für jede Eigenentwicklung mögliche Fehlerquellen bewertet und Maßnahmen dokumentiert werden müssen. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=637s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 12:09 | Der GAMP-5-Leitfaden unterteilt den KI-Einsatz je nach Grad der Autarkie des Systems in unterschiedliche Sphären. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=729s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 15:13 | Die Abkürzung TPLC steht für Total Product Lifecycle und stammt ursprünglich aus der Regulierung physischer Medizinprodukte, wird aber auch auf Software und KI übertragen. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=913s) |
| Meinung | GxP Talk - KI im regulierten Umfeld? | 16:48 | Martin unterscheidet Anwendungsfälle danach, ob eine KI-Aufgabe überhaupt GXP-reguliert ist, etwa ist Predictive Forecasting für die Budgetplanung nicht GXP-reguliert. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1008s) |
| Meinung | GxP Talk - KI im regulierten Umfeld? | 18:29 | Sobald eine KI über die Verwendbarkeit eines Zwischen- oder Endprodukts in der Produktion mitentscheidet, fällt der Einsatz laut Martin in einen regulierten Bereich. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1109s) |
| Warnung | GxP Talk - KI im regulierten Umfeld? | 20:06 | Arthur warnt davor, die Software beziehungsweise KI selbst validieren zu wollen, statt wie üblich den Prozess zu validieren und die notwendigen Systeme zu qualifizieren. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=1206s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 33:21 | Ein nicht veröffentlichter Entwurf der britischen Behörde MHRA forderte erstmals, dass der manuelle Prozess mindestens so sicher sein müsse wie der computergestützte Prozess, statt umgekehrt. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=2001s) |
| Fakt | GxP Talk - KI im regulierten Umfeld? | 39:01 | In der Praxis wird ein KI-gesteuerter Produktionsprozess häufig zusätzlich durch weiterhin gemessene kritische Prozessparameter als Sicherheitsnetz abgesichert, sodass eine Fehlentscheidung der KI kein Produktrisiko erzeugt. | [▶](https://www.youtube.com/watch?v=XtH4JqTwaqM&t=2341s) |
| Empfehlung | GxP Talk - Testing im GxP-Umfeld | 04:53 | Nach dem risikobasierten GAMP-5-Ansatz sollte Software zunächst klassifiziert werden, um daraus die notwendigen Testaktivitäten abzuleiten. | [▶](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=293s) |
| Fakt | GxP Talk - Testing im GxP-Umfeld | 16:20 | Im GxP-Umfeld zielt Regulierung primär auf den Schutz von Menschenleben ab, weshalb dort strenger getestet werden muss als etwa im Maschinenbau. | [▶](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=980s) |
| Fakt | GxP Talk - Testing im GxP-Umfeld | 19:34 | Im GxP-Umfeld kommt zu automatisierten Tests zusätzlich die Pflicht hinzu, Testfälle und Testergebnisse lückenlos auf die Anforderungen zurückzuführen (Traceability). | [▶](https://www.youtube.com/watch?v=B0_sSJQVG8w&t=1174s) |
| Fakt | BI Thinkers Talk nr.75 | 36:20 | Der Power BI Fixer kann den Best Practice Analyser auf dem Semantic Model ausführen und gefundene Verstöße direkt automatisiert fixen lassen. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2180s) |
| Warnung | BI Thinkers Talk nr.75 | 41:21 | Perspektiven in Analysis Services und Power BI bilden keine echte Sicherheitsgrenze ab, sodass Nutzer trotz eingeschränkter Perspektive weiterhin das komplette zugrunde liegende Modell nutzen können. | [▶](https://www.youtube.com/watch?v=BQdSo6ZnmKY&t=2481s) |
| Fakt | Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake? | 01:19 | Bestimmte Szenarien erfordern, dass Daten aus rechtlichen oder regulatorischen Gründen in einem bestimmten Land oder einer bestimmten Region abgelegt und verarbeitet werden. | [▶](https://www.youtube.com/watch?v=ZVVSPQj9dlc&t=79s) |
| Fakt | GxP Talk - Validierung vs. Agilität | 06:17 | Manche Pharmaunternehmen bilden ihre Validierungsprozesse bereits digital ab, etwa über einen Git-Stack oder eine DevOps-Umgebung. | [▶](https://www.youtube.com/watch?v=KO_qFge77o8&t=377s) |
| Fakt | BI Thinkers Talk n.74 | 14:34 | In den Fabric-Tenant-Einstellungen lässt sich der Zugriff auf Copilot für Power BI global deaktivieren oder auf vorab genehmigte Elemente beschränken. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=874s) |
| Fakt | GxP Talk - Validierung vs. Agilität | 17:28 | In einem der begleiteten GXP-Projekte ist die Validierung nach Einschätzung der Sprecherin bereits zu rund 30 Prozent digital und toolgestützt dokumentiert. | [▶](https://www.youtube.com/watch?v=KO_qFge77o8&t=1048s) |
| Fakt | GxP Talk - Validierung vs. Agilität | 22:28 | Seit 2022 müssen größere Unternehmen im Rahmen der EU-Taxonomie ihre Nachhaltigkeit dokumentieren. | [▶](https://www.youtube.com/watch?v=KO_qFge77o8&t=1348s) |
| Fakt | BI Thinkers Talk n.74 | 24:19 | Die Berechtigung für den Zugriff von Copilot wird zentral am semantischen Modell gesetzt und von dort automatisch an Berichte und Apps vererbt. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1459s) |
| Fakt | BI Thinkers Talk n.74 | 30:50 | Copilot generiert bei einer Anfrage in der Regel keine eigenen Kennzahlen, sondern verlinkt bevorzugt auf einen bereits vom Fachbereich verifizierten und freigegebenen Bericht. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=1850s) |
| Meinung | GxP Talk - Validierung vs. Agilität | 39:58 | Die Definition of Ready gilt als Schlüsselkriterium dafür, ob Agilität und GXP-Anforderungen zusammenpassen, weil dem Lieferanten vorab klar sein muss, was genau geliefert werden soll. | [▶](https://www.youtube.com/watch?v=KO_qFge77o8&t=2398s) |
| Empfehlung | BI Thinkers Talk n.74 | 44:26 | Für den Produktivbetrieb sollte statt einer persönlichen Anmeldung ein Service Principal verwendet werden. | [▶](https://www.youtube.com/watch?v=rWE0gMx7v7I&t=2666s) |
| Fakt | Prinzipien oder Paragrafen | 01:43 | GXP-Systeme müssen revisionssicher und vollständig reproduzierbar sein, was bei datengetriebenen Prozessen schwierig ist, weil Daten selbst Teil des Outputs sind. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=103s) |
| Fakt | Prinzipien oder Paragrafen | 05:33 | Der Produktionsstandort ist Bestandteil der pharmazeutischen Zulassung, weshalb eine digitale Freigabe in einem Cloud-Rechenzentrum in einem anderen Land formal nicht dem zugelassenen Standort entspricht. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=333s) |
| Meinung | Prinzipien oder Paragrafen | 05:33 | Christof Layher bevorzugt prinzipienbasierte Regulierung gegenüber kleinteiligen Detailvorschriften, weil starre Regeln von der Technologieentwicklung schnell überholt werden. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=333s) |
| Fakt | Prinzipien oder Paragrafen | 07:30 | Aufsichtsbehörden beantworten die Frage nach konkreten Vorgaben in der Regel damit, dass Unternehmen selbst einschätzen sollen, was schiefgehen kann. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=450s) |
| Fakt | Prinzipien oder Paragrafen | 09:56 | Im Rechtssystem der FDA gilt praktisch eine Beweislastumkehr, bei der Unternehmen nachweisen müssen, dass sie nichts falsch gemacht haben, statt dass ihnen ein Verstoß nachgewiesen werden muss. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=596s) |
| Warnung | Digitalisierung seit 20 Jahren — wann sind wir endlich fertig? | 11:36 | Wird ein Zielbild nur innerhalb eines Silos wie dem CDO-Bereich entwickelt und die IT nicht einbezogen, scheitert die Umsetzung später an fehlender Infrastruktur oder Datenbereitstellung. | [▶](https://www.youtube.com/watch?v=jETxUNQSl-w&t=696s) |
| Meinung | Prinzipien oder Paragrafen | 13:05 | Layher beobachtet, dass deutschsprachige Unternehmen regulatorische Anforderungen häufig übertreiben und pauschal auf alle Unternehmensbereiche anwenden, auch wo der Gesetzgeber das nicht verlangt. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=785s) |
| Fakt | Prinzipien oder Paragrafen | 17:06 | Ob strenge Datenregeln gelten, wird anhand einer einmaligen Initialprüfung entschieden, ob die Daten Einfluss auf die Patientenqualität haben, und das Ergebnis muss dokumentiert werden. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1026s) |
| Empfehlung | Prinzipien oder Paragrafen | 18:40 | Layher empfiehlt, Fachbereiche zu befähigen, nicht-kritische Engineering-Daten selbst zu analysieren, weil zentrale IT-Abteilungen solche Anfragen gegenüber dem Kerngeschäft oft niedrig priorisieren. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1120s) |
| Empfehlung | Digitalisierung seit 20 Jahren — wann sind wir endlich fertig? | 19:44 | Will sich ein Unternehmen auf Power BI als BI-Standard konzentrieren statt auf weitere Lösungen, sollte dies mit den Fachbereichen abgestimmt werden, unter anderem um Stammdaten wie Lieferantendaten zu standardisieren. | [▶](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1184s) |
| Meinung | Prinzipien oder Paragrafen | 20:43 | Nur ein Bruchteil der Entscheidungen in einem Unternehmen sind tatsächliche Qualitätsentscheidungen, sodass nur die dafür genutzten Daten strenger Kontrolle bedürfen. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1243s) |
| Fakt | Prinzipien oder Paragrafen | 23:31 | Die strengen Datenintegritätsregeln der Pharmabranche sind historisch aus echten Datenproblemen und Fehlverhalten wie dem selektiven Verwerfen von Messergebnissen in klinischen Studien entstanden. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1411s) |
| Fakt | Digitalisierung seit 20 Jahren — wann sind wir endlich fertig? | 23:36 | Bei großflächig ausgerolltem Self-Service BI ist es nicht mehr Ziel der zentralen Abteilung, einen umfassenden Single Point of Truth zu etablieren, Security bleibt aber weiterhin zentral geregelt. | [▶](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1416s) |
| Empfehlung | Digitalisierung seit 20 Jahren — wann sind wir endlich fertig? | 25:30 | Reports, die von niemandem für operative Entscheidungen genutzt werden, sollten identifiziert und abgeschaltet werden. | [▶](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1530s) |
| Empfehlung | Prinzipien oder Paragrafen | 37:14 | Layher empfiehlt, innerhalb eines Unternehmens unterschiedlich schnelle Bereiche zuzulassen: streng regulierte Produktion stabil halten, in weniger regulierten Bereichen aber mehr Agilität zulassen. | [▶](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=2234s) |
| Meinung | Power BI vs. Qlik | 07:12 | Oliver betont, dass Qlik trotz der Möglichkeit, Daten zwischenzuspeichern, kein Data Warehouse ist. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=432s) |
| Fakt | Fabric & Power BI Quarterly · 2026-1 | 16:46 | Einzelne Workspaces lassen sich als Mission Critical markieren, damit sie von der automatischen Pausierung durch die Search Protection ausgenommen bleiben. | [▶](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1006s) |
| Meinung | Denken in Tabellen | 22:07 | Redundante Daten in mehreren Views sind laut Markus nur dann problematisch, wenn sie inkonsistent werden, ansonsten kann Redundanz den Datenzugriff beschleunigen. | [▶](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=1327s) |
| Warnung | Power BI vs. Qlik | 23:07 | Arthur warnt davor, ein gut funktionierendes BI-Tool nur wegen konzernweiter Vereinheitlichung ohne echten Grund zu wechseln. | [▶](https://www.youtube.com/watch?v=vd1r02bj9Qk&t=1387s) |
| Warnung | BI Thinkers Talk nr.71 | 31:56 | Copilot kann laut den Sprechern automatisch Beschreibungen zu Measures erzeugen, darf aber in bestimmten regulierten Umgebungen wie der Finanzverwaltung nicht eingesetzt werden. | [▶](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=1916s) |
| Empfehlung | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 1:20:42 | Sobald mehrere Faktentabellen für einen Drill-Across kombiniert werden sollen oder unternehmensweit standardisierte Dimensionen benötigt werden, ist ein dimensionales Modell mit Sternschema vorzuziehen. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=4842s) |
| Meinung | BI Thinkers Talk Nr.62 | 28:28 | Aus Sicht des Sprechers sind Datenfunktionen zum Zurückschreiben noch nicht vollständig self-service-tauglich, weil Modell, Datenhaltung und Funktion aktuell nicht an Fachbereiche übergeben werden sollten. | [▶](https://www.youtube.com/watch?v=Wwvhv8WA2Qc&t=1708s) |
| Fakt | Metadaten als Superkraft | 00:01 | Metadaten lassen sich für Data Health und Data Governance nutzen, weil sie standardisiert ausgewertet werden können. | [▶](https://www.youtube.com/watch?v=UUlPoJOhco8&t=1s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 02:09 | Weil Fabric viele Technologien mit jeweils eigenen Workarounds bündelt, muss die IT laut Martin diese alle statt eines einzigen Standards beherrschen. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=129s) |
| Meinung | Metadaten als Superkraft | 07:17 | Ein vollständiges Metadatenkonzept sollte neben technischen Informationen auch einen Business Layer mit Ansprechpartnern und Datenherkunft umfassen. | [▶](https://www.youtube.com/watch?v=UUlPoJOhco8&t=437s) |
| Warnung | Metadaten als Superkraft | 10:24 | Ein von Anfang an zu detailliert geplanter Datenkatalog mit sehr vielen Pflichtfeldern führt in der Praxis eher zur Ablehnung durch die Nutzer. | [▶](https://www.youtube.com/watch?v=UUlPoJOhco8&t=624s) |
| Meinung | Was ist Self-Service und warum ist das so schwer? | 12:51 | Wartbarkeit ist für Tom Martens keine Kür, sondern eine grundsätzliche Voraussetzung für eine gute Self-Service-Lösung. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=771s) |
| Warnung | Microsoft Fabric — braucht das wirklich jemand? | 18:45 | Zugriffsrechte und Nutzungsumfang lassen sich in Fabric laut Martin nicht granular genug steuern. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1125s) |
| Meinung | Metadaten als Superkraft | 18:55 | Ein zentrales Hindernis für Metadaten-Initiativen ist, dass Unternehmen das Thema für unnötig kompliziert halten und stattdessen in Tool- und Lizenzdiskussionen abgleiten. | [▶](https://www.youtube.com/watch?v=UUlPoJOhco8&t=1135s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 26:39 | Fabric schafft laut Artur unternehmensweite Transparenz, weil zentrale Experten dadurch mehrfach duplizierte semantische Modelle erkennen können. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1599s) |
| Meinung | Was ist Self-Service und warum ist das so schwer? | 26:45 | Zwischen IT und Self-Service besteht laut Tom Martens ein dauerhaftes Spannungsfeld, das er als ITQ bezeichnet. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1605s) |
| Warnung | Was ist Self-Service und warum ist das so schwer? | 27:56 | Tom Martens befürchtet, dass auf die frühere Spreadsheet Hell durch generative KI-Agenten künftig eine Agent Hell folgen könnte. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1676s) |
| Fakt | Fabric & Power BI Quarterly · 2026-2 | 28:37 | OneLake Security stellt dieselben Zugriffsinformationen sowohl nativen Fabric-Workloads als auch Third-Party-Workloads zur Verfügung. | [▶](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=1717s) |
| Empfehlung | Was ist Self-Service und warum ist das so schwer? | 29:34 | Eine sichere Self-Service-Plattform erfordert aus Sicht von Tom Martens permanentes Monitoring und kontinuierlichen Dialog mit den Anwendern statt eines einmalig abgeschlossenen Projekts. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1774s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 30:57 | Martin sieht keinen Bedarf, dass jeder Fachanwender eigene Fabric-Artefakte erstellen können muss. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=1857s) |
| Fakt | Was ist Self-Service und warum ist das so schwer? | 36:46 | Power BI ist häufig zunächst unautorisiert in Konzerne gelangt, weil Fachbereiche es herunterluden, weil es effizienter war als das zentrale Reporting, und wurde erst später offiziell und professionell aufgesetzt. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=2206s) |
| Meinung | Microsoft Fabric — braucht das wirklich jemand? | 37:38 | Arturs zentraler Wert ist, Probleme der Endanwender sofort zu lösen; Governance und Konsolidierung kommen für ihn erst danach. | [▶](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2258s) |
| Empfehlung | Was ist Self-Service und warum ist das so schwer? | 38:20 | Tom Martens plädiert dafür, neue Werkzeuge grundsätzlich erst einmal zu erlauben, weil das die Anwender befähigt. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=2300s) |
| Empfehlung | Was ist Self-Service und warum ist das so schwer? | 42:03 | Schatten-IT einfach zu ignorieren ist aus Sicht von Tom Martens keine Strategie; ein Mittelweg mit einer abgespeckt unterstützten Lösung ist besser, als die Fachbereiche komplett am System vorbeiarbeiten zu lassen. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=2523s) |
| Meinung | Was ist Self-Service und warum ist das so schwer? | 55:21 | Tom Martens' finale Definition von Self-Service lautet: das, was ein Business-User ohne IT tun kann, innerhalb von Guardrails, die Governance und Compliance berücksichtigen. | [▶](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=3321s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Zehn Tage bis zum marktfähigen Stand](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage.html#:~:text=Was%20das%20%2Awirtschaftlich%2A%20bedeutet) |
| [Microsoft Fabric — braucht das wirklich jemand?](https://www.youtube.com/watch?v=mTVeZzshLzE) | — | kernaussagen+zeitstempel | [03:41](https://www.youtube.com/watch?v=mTVeZzshLzE&t=221s) · [06:05](https://www.youtube.com/watch?v=mTVeZzshLzE&t=365s) · [37:38](https://www.youtube.com/watch?v=mTVeZzshLzE&t=2258s) |
| [The Day After Tomorrow – Nach der Einführung geht es erst richtig los \| Power BI Summit 2023](https://www.youtube.com/watch?v=KwySyTxW_EI) | 2023-03-01 | nur-zeitstempel | [12:03](https://www.youtube.com/watch?v=KwySyTxW_EI&t=723s) · [15:04](https://www.youtube.com/watch?v=KwySyTxW_EI&t=904s) · [45:10](https://www.youtube.com/watch?v=KwySyTxW_EI&t=2710s) |
| [Ten Days to a Market-Ready State](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage_en.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/ki-entwicklung-zehn-tage_en.html#:~:text=What%20it%20means%20%2Aeconomically%2A) |
| [Microsoft Fabric — Einsteiger-Guide](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=01%20%C2%B7%20Einordnung%20von%20%2AMicrosoft%20Fabric%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Was%20ist%20das%3F) · [Abschnitt](https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html#:~:text=Die%20drei%20Plattform-Schichten%20unter%20den%20Workloads) |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | nur-zeitstempel | [16:10](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=970s) · [24:37](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1477s) |
| [Fabric & Power BI Quarterly · 2026-1](https://www.youtube.com/watch?v=TYp5xCAU2AU) | 2026-01-01 | kernaussagen+zeitstempel | [25:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=1503s) · [52:25](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=3145s) · [54:03](https://www.youtube.com/watch?v=TYp5xCAU2AU&t=3243s) |
| [Denken in Tabellen](https://www.youtube.com/watch?v=hbUYMyqb6r8) | 2026-01-01 | kernaussagen+zeitstempel | [00:00](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=0s) · [37:00](https://www.youtube.com/watch?v=hbUYMyqb6r8&t=2220s) |
| [Realtalk zu Self Service mit Power BI](https://www.youtube.com/watch?v=27rC2zefFOU) | 2024-02-01 | nur-zeitstempel | [05:02](https://www.youtube.com/watch?v=27rC2zefFOU&t=302s) |
| [Digitalisierung seit 20 Jahren — wann sind wir endlich fertig?](https://www.youtube.com/watch?v=jETxUNQSl-w) | 2026-02-01 | kernaussagen+zeitstempel | [18:11](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1091s) · [19:44](https://www.youtube.com/watch?v=jETxUNQSl-w&t=1184s) |
| [Metadaten als Superkraft](https://www.youtube.com/watch?v=UUlPoJOhco8) | — | kernaussagen+zeitstempel | [00:01](https://www.youtube.com/watch?v=UUlPoJOhco8&t=1s) |
| [Daten-WG Life-Update \| Fabric Architekturen](https://www.youtube.com/watch?v=J-lN5JN-F5I) | 2026-08-01 | nur-zeitstempel | [18:58](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=1138s) · [40:30](https://www.youtube.com/watch?v=J-lN5JN-F5I&t=2430s) |
| [Fabric & Power BI Quarterly \| 2025 Q2](https://www.youtube.com/watch?v=lAh9ajR2Nrw) | 2025-04-01 | nur-zeitstempel | [02:30](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=150s) · [32:41](https://www.youtube.com/watch?v=lAh9ajR2Nrw&t=1961s) |
| [Was ist Self-Service und warum ist das so schwer?](https://www.youtube.com/watch?v=EVsJ6zyGUWc) | — | kernaussagen+zeitstempel | [31:37](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=1897s) · [52:11](https://www.youtube.com/watch?v=EVsJ6zyGUWc&t=3131s) |
| [Push statt Pull: So bringst du On-Prem-Daten mit SSIS nach Microsoft Fabric \| Fabric Tutorial](https://www.youtube.com/watch?v=5HhNQZlB-1E) | 2025-12-01 | kernaussagen+zeitstempel | [06:21](https://www.youtube.com/watch?v=5HhNQZlB-1E&t=381s) |
| [Daten-WG 2026 Lineup](https://www.youtube.com/watch?v=AX7b8_aNekw) | 2026-05-01 | nur-zeitstempel | [11:28](https://www.youtube.com/watch?v=AX7b8_aNekw&t=688s) · [19:13](https://www.youtube.com/watch?v=AX7b8_aNekw&t=1153s) |
| [Von Patronen zu Prozessen](https://www.youtube.com/watch?v=0cHtxIm7fVw) | 2025-08-01 | nur-zeitstempel | [11:38](https://www.youtube.com/watch?v=0cHtxIm7fVw&t=698s) |
| [Von Patronen zu Prozessen (nur Ton)](https://www.youtube.com/watch?v=s3CveEVoDvo) | 2025-07-01 | nur-zeitstempel | [11:38](https://www.youtube.com/watch?v=s3CveEVoDvo&t=698s) |
| [Datenmodellierung ist Governance](https://www.youtube.com/watch?v=lH_-A8NAQ-k) | 2025-11-01 | nur-zeitstempel | [07:04](https://www.youtube.com/watch?v=lH_-A8NAQ-k&t=424s) |
| [Prinzipien oder Paragrafen](https://www.youtube.com/watch?v=6WhWLcuFvZE) | 2026-02-01 | kernaussagen+zeitstempel | [23:31](https://www.youtube.com/watch?v=6WhWLcuFvZE&t=1411s) |
| [BI Thinkers Talk nr.71](https://www.youtube.com/watch?v=LUrL8A5lNgI) | 2025-12-01 | kernaussagen+zeitstempel | [05:01](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=301s) · [09:41](https://www.youtube.com/watch?v=LUrL8A5lNgI&t=581s) |
| [Fabric & Power BI Quarterly · 2025 Q3](https://www.youtube.com/watch?v=lZvpCBMKASM) | — | nur-zeitstempel | [55:18](https://www.youtube.com/watch?v=lZvpCBMKASM&t=3318s) |
| [Fabric & Power BI Quarterly · 2026-2](https://www.youtube.com/watch?v=pTTYySb0Cyg) | — | kernaussagen+zeitstempel | [55:02](https://www.youtube.com/watch?v=pTTYySb0Cyg&t=3302s) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=08%20%C2%B7%20Service%20%26%20%2ASharing%2A) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Die%20Reise%20durch%20Power%20BI) · [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Aus%20dem%20Kanal%20%C2%B7%20Modellierung%20praktisch%20durchgespielt) |
| [Fabric & Power BI Quarterly · 2025 Q4](https://www.youtube.com/watch?v=9TsHkV8sIRo) | — | nur-zeitstempel | [56:17](https://www.youtube.com/watch?v=9TsHkV8sIRo&t=3377s) |
| [BI Thinkers Talk nr.69](https://www.youtube.com/watch?v=r416vanitYw) | 2025-11-01 | nur-zeitstempel | [16:50](https://www.youtube.com/watch?v=r416vanitYw&t=1010s) |
| [From Oracle to Empathy](https://www.youtube.com/watch?v=1yuQVABBrNs) | 2025-09-01 | nur-metadaten | — |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Agovernance
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Agovernance&f=topic%3Agovernance
