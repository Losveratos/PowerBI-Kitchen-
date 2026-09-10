# Expertenpanel Aufwandsannahmen (simuliert, 20 Profile, Sonnet, 09/2026)

Median von min / wahrscheinlich / max je Parameter und Ansatz. Rohdaten: p1.json bis p5.json. Kein Ersatz für Messung.

| Parameter | paid | oss | deneb | core |
|:--|:--|:--|:--|:--|
| firstH | 2.0·4.0·7.5 | 4.5·8.5·14 | 7.0·12·18 | 10·16·27 |
| reuseH | 0.5·1.0·2.0 | 1.0·2.0·3.5 | 1.0·2.5·4.5 | 2.0·4.0·6.5 |
| setupH | 18·35·55 | 10·22·42 | 9.0·18·28 | 5.0·14·22 |
| trainH | 5.0·8.5·15 | 8.0·15·26 | 20·35·58 | 18·28·43 |
| lightH | 0.5·1.5·3.0 | 1.0·2.0·4.0 | 1.5·2.75·4.5 | 1.25·3.0·5.0 |
| maint | 6.0·10·18 | 15·26·38 | 11·19·30 | 20·34·52 |
| events | 0.2·1.0·2.0 | 1.0·2.5·4.0 | 1.0·2.0·3.0 | 2.0·3.25·5.25 |
| fixH | 1.0·3.0·5.5 | 3.0·7.0·14 | 3.0·6.5·12 | 5.0·9.5·17 |
| supH100 | 2.0·4.0·6.25 | 3.0·7.0·12 | 3.0·6.0·10 | 5.0·9.5·16 |

## Profile
- E01 Freelance-Power-BI-Consultant, DACH-Mittelstand, Zebra BI + Core Visuals: Zebra-BI- und Core-Routine aus 30+ Reports drückt diese Zahlen, Deneb-Unerfahrenheit treibt dort Aufwand und Unsicherheit hoch.
- E02 Senior Consultant BI-Beratung, Deneb-Spezialistin, Konzernkunden: Die eigene Vega-Lite-Bibliothek drückt Deneb-Zahlen deutlich nach unten, Konzern-Governance treibt Paid-Setup nach oben.
- E03 IBCS-zertifizierter Berater, Zebra BI/graphomate/Inforiver, misstraut Workarounds: 15 Jahre IBCS-Praxis heißt eingeschwungene Paid-Tools, aber Core-Workarounds werden konsequent mit Wartungs- und Risikoaufschlag bewertet.
- E04 Power-BI-Trainer, Core Visuals + Deneb, 200+ Teilnehmende: Aus 200+ Trainings-Teilnehmenden weiß ich: lightH für Deneb ist die kritische Stellschraube, Core-Visuals sind für Fachbereiche fehleranfälliger als gedacht.
- E05 Controllerin im Maschinenbau (400 MA), 5 Jahre Power BI Selbstbau, Core Visuals + SVG-Measures, keine Custom Visuals erlaubt: Ohne eigene Praxis bei paid/oss/deneb treibt vor allem die vermutete IT-Security-Freigabe die Unsicherheit; bei Core zählt die Bruchanfälligkeit der SVG-Measures bei PBI-Updates.
- E06 Head of FP&A Konzern (12.000 MA), 10 Jahre, Zebra BI seit 3 Jahren mit 40 Erstellern: Beim Paid-Ansatz kenne ich die Zahlen aus dem echten Konzern-Rollout, bei den anderen drei schätze ich über das zentrale BI-Team und damit vorsichtiger.
- E07 BI-Teamlead Enterprise BI, 12 Jahre, zentrales Team, 200 Reports, Deneb für Sonderfälle, Core als Standard: Ticket-Historie macht Core und Deneb präzise schätzbar, bei OSS treibt das Abandonment-Risiko Wartung und Breaking-Updates am stärksten nach oben.
- E08 Power-BI-Center-of-Excellence-Lead, 8 Jahre, 120 Fachbereichs-Ersteller, Managed Self-Service: Governance-Fähigkeit im Self-Service-Modell dominiert: paid und core sind erprobt und schlank, OSS und Deneb kosten das COE zusätzlichen Kontroll- und Betreuungsaufwand.
- E09 Custom-Visual-Entwickler (TypeScript, Power BI Visuals SDK), OSS-Maintainer: OSS-Zertifizierung und gelebte SDK-Breaking-Changes treiben bei mir setupH, events und fixH für OSS am stärksten nach oben.
- E10 Deneb-Community-MVP, Vega-Lite-Templateautor: Wiederverwendung von Templates drückt reuseH/firstH bei Deneb stark, während ich die Vega-Lite-Lernkurve bewusst nicht schönrechne.
- E11 DAX-Spezialist, SVG-Measures/DAX-UDFs für IBCS in Matrix und Karten: Die 175-Measures-Falle und DAX-UDF-Fragilität treiben maint und trainH bei Core am stärksten, reuseH bleibt dank Measure-Bibliothek niedrig.
- E12 Data Engineer / Fabric-Architekt, Betriebs- und Ticket-Perspektive: Aus Ticket-/Betriebssicht treiben Governance-Freigabe (setupH) und laufender Support (supH100, maint) bei OSS und Core die Zahlen am stärksten, nicht der Erstaufbau.
- E13 Presales-Engineer Paid-Visual-Hersteller: Paid-Zahlen stammen aus 80+ realen Onboardings und sind bewusst optimistisch, weil Eigenentwicklung dort fast vollständig entfällt.
- E14 Graphomate/Inforiver-Implementierungspartner: Konzern-Rollouts mit Security-Review und Multi-BU-Abstimmung treiben Setup und Training bei Paid weit über Demo-Niveau.
- E15 Power-BI-Tenant-Admin und Governance-Verantwortliche: Externe Visuals brauchen volle Security-/Lizenz-Freigabe im Tenant, während native Deneb/Core-Visuals ohne diese Hürde starten, dafür bei Updates und Tickets stärker durchschlagen.
- E16 Revisor / Interne Revision mit BI-Schwerpunkt: Prüfungen zeigen, dass undokumentierte DAX/SVG-Workarounds bei Core die höchste Wartungsquote und die größten Nachvollziehbarkeits-Lücken erzeugen.
- E17 Werkscontroller Produktion, Report Server on-prem, Core Visuals only: Eigene Unsicherheit bei Deneb und Paid treibt die Bandbreiten nach oben, nur die Core-Zahlen stützen sich auf echte eigene Erfahrung.
- E18 Business Analystin Vertriebscontrolling, Deneb-Fan, Self-Service-Kultur: Deneb-Routine und JSON-Vorwissen drücken Aufwand und Schulung bei Deneb deutlich, Self-Service-Kultur erschwert dagegen den Paid-Tool-Rollout.
- E19 Projektleiterin BI-Einführung, 3 Standardisierungsprojekte inkl. Nachkalkulation: Nachkalkulationen der drei Standardisierungsprojekte zeigen systematisch höhere Wartungs- und Setup-Aufwände als initial geschätzt, besonders bei Core-Workarounds.
- E20 Skeptischer CFO-Stabsmitarbeiter, Excel-Hintergrund, korrigiert Beraterschätzungen konservativ: Konservative Aufschläge, weil Beraterzahlen in der Vergangenheit regelmäßig nach oben korrigiert werden mussten — v. a. laufende Kosten werden meist zu niedrig angesetzt.
