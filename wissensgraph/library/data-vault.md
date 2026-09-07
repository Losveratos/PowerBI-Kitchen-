---
id: "topic:data-vault"
name: "Data Vault"
typ: thema
stand: "2026-09-07"
build: "20260907-1949"
zitieren_als: "Daten-WG, <Dokumenttitel>, <mm:ss>, <url>"
dokumente: 3
kernaussagen: 23
mit_kernaussagen: 3
url: "https://datenwgknowledgekitchen.com/wissensgraph/thema/data-vault.html"
canonical: "https://datenwgknowledgekitchen.com/wissensgraph/thema/data-vault.html"
markdown: "https://datenwgknowledgekitchen.com/wissensgraph/library/data-vault.md"
json: "https://datenwgknowledgekitchen.com/wissensgraph/library/data-vault.json"
aliase:
  - "Datavault"
  - "Hub"
  - "Satellite"
---

# Data Vault

Data Vault besteht laut Volker Nürnberg aus den drei Komponenten Modellierung, Architektur und Vorgehensweise. (Stand 2025-07) Data-Vault-Modelle sind wegen ihrer wenigen, einfachen und wiederholbaren Muster ideal für Automatisierungstools geeignet. (Stand 2025-07) Bei Änderungen an Quellsystemen kann ein Data-Vault-Automatisierungssystem im Moment nur bei sogenannten Non-Breaking-Changes automatisch reagieren, bei Breaking Changes muss noch ein Mensch eingreifen. (Stand 2025-07)

## Aliase

Datavault, Hub, Satellite

## Nachbarthemen

| Thema | Beziehung (Lesart) | Belastbarkeit | Zitat und Quelle | Gemeinsame Segmente |
| --- | --- | --- | --- | --- |
| [Datenmodellierung](datenmodellierung.md) | Data Vault teil-von Datenmodellierung | automatisch extrahiert, Quellenstelle vorhanden | „Data W ist z.B. auch so eine entsprechende Modellierungsmethode... eine der Art, wie man erstmal Daten vormodellieren kann“ (BI Thinkers Talk - Data Modelling - Fabric Data Days Edition, 2025-11) | 0 |
| [Warehouse](warehouse.md) | Data Vault teil-von Warehouse | automatisch extrahiert, Quellenstelle vorhanden | „Data Volt ist das Data Warehouse, wo wirklich Warehousing und Delivery komplett werden“ (Mythos Data Vault und richtig große Modelle, 2025-07) | 4 |
| [Sternschema](sternschema.md) | Data Vault gegensatz Sternschema | automatisch extrahiert, Quellenstelle vorhanden | „was ist ein Sternschema überhaupt für die Enduser ... Data World ist ja jetzt nicht unbedingt ein Modell“ (Mythos Data Vault und richtig große Modelle, 2025-07) | 0 |
| [Performance](performance.md) | Data Vault und Performance im selben Segment | Heuristik, gezählt |  | 4 |
| [Power BI](power-bi.md) | Data Vault und Power BI im selben Segment | Heuristik, gezählt |  | 3 |

## Kernaussagen

Alle Aussagen sind automatisch aus dem Transkript extrahiert und nicht redaktionell geprüft. „Stelle“ sagt, wie genau der Sprung sitzt: auf die Sekunde (im Transkript wiedergefunden) oder Abschnittsanfang (bis zu drei Minuten vor der Aussage).

| Typ | Dokument | Stand | Zeit | Stelle | Aussage | Beleg |
| --- | --- | --- | --- | --- | --- | --- |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 08:08 | auf die Sekunde | Größere Unternehmen setzen auf der Ebene des Kern-Data-Warehouse heute häufig entweder auf normalisierte Datenhaltung oder auf Data Vault. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=488s) |
| Meinung | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 08:12 | Abschnittsanfang | Data Vault bietet gegenüber klassischen Cube-Strukturen laut Peter Gluchowski eine deutlich höhere Änderungsflexibilität. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=492s) |
| Fakt | 27 Jahre in 10 Minuten - Peter Gluchowski beim Daten-WG Offsite | 2026-05 | 08:23 | auf die Sekunde | Data Vault ist als Konzept bereits rund 25 Jahre alt, hat sich in Europa aber erst seit etwa zehn Jahren verbreitet. | [▶](https://www.youtube.com/watch?v=dKA-38gRD8Q&t=503s) |
| Fakt | BI Thinkers Talk - Data Modelling - Fabric Data Days Edition | 2025-11 | 09:17 | auf die Sekunde | Data Vault ist eine Modellierungsmethode für die mittlere Datenschicht, die auf Hubs für Business Keys, Links für Beziehungen und Satelliten für zusätzliche Attribute aufbaut. | [▶](https://www.youtube.com/watch?v=mUALlPmGcEk&t=557s) |
| Meinung | Mythos Data Vault und richtig große Modelle | 2025-07 | 02:52 | auf die Sekunde | Data Vault ist laut Volker Nürnberg weit weg von den Endanwendern und keine Modellierungsstruktur, mit der Nutzer selbst arbeiten sollen. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=172s) |
| Empfehlung | Mythos Data Vault und richtig große Modelle | 2025-07 | 03:01 | auf die Sekunde | Nutzer sollen laut Volker Nürnberg niemals direkt auf die Data-Vault-Modellierungsstruktur zugreifen. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=181s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 03:50 | auf die Sekunde | Data Vault besteht laut Volker Nürnberg aus den drei Komponenten Modellierung, Architektur und Vorgehensweise. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=230s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 05:55 | auf die Sekunde | Data-Vault-Modelle sind wegen ihrer wenigen, einfachen und wiederholbaren Muster ideal für Automatisierungstools geeignet. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=355s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 07:14 | auf die Sekunde | Bei Änderungen an Quellsystemen kann ein Data-Vault-Automatisierungssystem im Moment nur bei sogenannten Non-Breaking-Changes automatisch reagieren, bei Breaking Changes muss noch ein Mensch eingreifen. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=434s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 07:50 | auf die Sekunde | Ändert sich eine Quelltabelle, betrifft das im Data-Vault-Modell typischerweise nur einen kleinen Bereich der Daten, meist einen einzelnen Satelliten. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=470s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 09:47 | auf die Sekunde | Bei neuen Anforderungen des Business kann in Data Vault ein neuer Satellit parallel zum alten aufgebaut und mit Produktionsdaten getestet werden, bevor umgeschaltet wird. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=587s) |
| Empfehlung | Mythos Data Vault und richtig große Modelle | 2025-07 | 11:38 | auf die Sekunde | Volker Nürnberg würde ab etwa 5 bis 10 Quellsystemen mit gemeinsamen Geschäftsobjekten auf jeden Fall über den Einsatz von Data Vault nachdenken. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=698s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 12:24 | auf die Sekunde | In Data Vault liegen alle Geschäftsschlüssel eines Objekts wie Kunde technisch in einer Tabelle, dem sogenannten Hub, mit den zugehörigen Attributen in umgebenden Satelliten. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=744s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 16:46 | auf die Sekunde | Ein Hub im Data-Vault-Modell muss nicht physisch materialisiert sein, sondern kann auch virtuell als Select Distinct auf den Data Lake abgebildet werden. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1006s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 18:25 | auf die Sekunde | Beziehungen zwischen Geschäftsschlüsseln verschiedener Quellsysteme, sogenannte Same-Links, sind im Data Lake nicht automatisch vorhanden und müssen aktiv hergestellt werden. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1105s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 21:06 | auf die Sekunde | Die Data-Vault-Modellierung ist laut Volker Nürnberg vollständig auditierbar und lässt sich verlustfrei bis zur Quelle zurückverfolgen und refaktorieren. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1266s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 23:13 | auf die Sekunde | Ein Tool namens Flowbi entsteht gerade, das für große und sehr große Unternehmen rein datengetrieben ein Data-Vault-Modell erzeugt. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1393s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 24:03 | auf die Sekunde | Ein solches automatisiertes Data-Vault-Tool erkennt vermutliche Geschäftsschlüssel unter anderem an den Namen oder Inhalten von Spalten. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1443s) |
| Meinung | Mythos Data Vault und richtig große Modelle | 2025-07 | 25:04 | auf die Sekunde | Data Vault passt laut Volker Nürnberg gut zu einem dezentralen Data-Mesh-Ansatz und ist für ihn sogar der entscheidende Weg zu dessen wirklichem Erfolg. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1504s) |
| Empfehlung | Mythos Data Vault und richtig große Modelle | 2025-07 | 29:17 | auf die Sekunde | Im beschriebenen Zielbild soll der Fachbereich seine Datenprodukte über ein konzeptuelles Geschäftsmodell selbst definieren. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1757s) |
| Empfehlung | Mythos Data Vault und richtig große Modelle | 2025-07 | 29:36 | auf die Sekunde | Dateningenieure sollen laut Volker Nürnberg keinen Code mehr schreiben, der selbst etwas tut, sondern nur noch Code, der Code generiert und mit Metadaten arbeitet. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1776s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 30:59 | auf die Sekunde | Volker Nürnberg arbeitet seit 2005 ausschließlich mit Data Warehouses und kam in den frühen 2010er-Jahren zu Data Vault. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1859s) |
| Fakt | Mythos Data Vault und richtig große Modelle | 2025-07 | 31:12 | auf die Sekunde | Es gibt weltweit nur sechs von Dan Linstedt, dem Erfinder der Methodik, zertifizierte Data-Vault-Trainer, zu denen Volker Nürnberg seit 2018 zählt. | [▶](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=1872s) |

## Dokumente

| Dokument | Datum | Abdeckung | Sprungmarken |
| --- | --- | --- | --- |
| [Mythos Data Vault und richtig große Modelle](https://www.youtube.com/watch?v=rrCi0lnGrCg) | 2025-07-01 | kernaussagen+zeitstempel | [07:44](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=464s) · [09:20](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=560s) · [12:07](https://www.youtube.com/watch?v=rrCi0lnGrCg&t=727s) |
| [BI Thinkers Talk - Data Modeling - Fabric Data Days Edition [EN]](https://www.youtube.com/watch?v=uxYFqwe_Wiw) | 2025-12-01 | nur-text | [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) · [Abschnitt](https://www.youtube.com/watch?v=uxYFqwe_Wiw) |
| [Power BI von A bis Z — Einsteiger-Guide (End-to-End)](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html) | 2026-08-31 | nur-text | [Abschnitt](https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html#:~:text=Star%20vor%20Snowflake) |

## Hinweise

Kernaussagen und Beziehungen sind maschinell erzeugt und nicht redigiert. Heuristische Kanten zählen Erwähnungen, keine Bedeutung. Bei Widersprüchen gilt das Video.

So zitieren: Daten-WG, <Dokumenttitel>, <mm:ss>, <url>

- Wiki-Ansicht: https://datenwgknowledgekitchen.com/wissensgraph/#n=topic%3Adata-vault
- Graph-Sicht: https://datenwgknowledgekitchen.com/wissensgraph/graph.html#n=topic%3Adata-vault&f=topic%3Adata-vault
