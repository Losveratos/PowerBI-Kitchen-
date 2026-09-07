# Playbook: Wissensgraph aus Transkripten, Dokumenten und E-Mails im Microsoft-Umfeld

Stand: September 2026. Dieses Dokument wächst mit dem Projekt. Jeder Abschnitt hat
Checkpoints, die man in einem Unternehmensszenario abhaken sollte, bevor der
nächste Schritt kommt. Was wir im Kitchen-Testfall lokal machen, steht jeweils
daneben, damit der Übergang zu Fabric kein Bruch ist.

## 0. Rahmen klären

| Checkpoint | Warum |
|---|---|
| Welche Quellen: Transkripte (Teams-Aufzeichnungen, YouTube), Word, PDF, E-Mail, Tickets | Jede Quelle braucht einen Adapter und eine eigene Datenschutzbewertung |
| Wer darf was sehen: Workspace-Rollen, Sensitivity Labels, RLS | Graph in Fabric ist nur für Workspace-Mitglieder erreichbar |
| Verlässt Text den Tenant (LLM außerhalb) oder nicht | Entscheidet zwischen AI Functions in Fabric und externem Modell |
| Region und Capacity: F2 oder höher, Region mit Graph und ggf. Fabric Apps | Fabric Apps fehlt in North Europe, Graph ist dort verfügbar |
| Wer pflegt das Vokabular (Themen, Tools, Personen) | Entity Resolution ist Fachaufgabe, kein Technikthema |

**Kitchen lokal:** Quelle YouTube, öffentlich, kein Datenschutzthema, LLM darf extern laufen.

## 1. Ingest: Quelle zu Segmenten

| Checkpoint | Fabric-Weg | Kitchen lokal |
|---|---|---|
| Rohdaten unverändert ablegen (Bronze) | Lakehouse Files, OneLake Shortcuts auf SharePoint | data/raw/*.json |
| Segmentierung festlegen: Kapitel, Zeitfenster, Absatz, Mail-Body | Notebook (PySpark oder pandas) | kgk/adapters |
| Deep-Link pro Segment (Zeitstempel, Seite, Mail-ID) | Pflichtfeld im Schema | YouTube `?t=` |
| Sprache pro Dokument erkennen | ai.classify oder Metadaten | Metadaten |
| E-Mail: Threads deduplizieren, Signaturen und Zitate entfernen, PII markieren | Purview-Labels beachten | noch offen |

## 2. Anreicherung: Segmente zu Knoten und Kanten

| Checkpoint | Fabric-Weg | Kitchen lokal |
|---|---|---|
| Kontrolliertes Vokabular mit Aliasen (Tools, Themen, Produkte) | Tabelle im Lakehouse, fachlich gepflegt | kgk/enrich/vocabulary.py |
| Heuristik zuerst: Vokabular-Treffer, Metadaten, Ko-Vorkommen | Notebook | heuristic.py |
| LLM zweitens: Aussagen, Relationen mit JSON-Schema erzwingen | `ai.extract` mit JSON-Schema, `ai.classify`, `ai.summarize` | llm.py (Claude) |
| Embeddings pro Segment | `ai.embed`, Ablage im Lakehouse oder Cosmos DB in Fabric | optional |
| Qualität messen: Stichprobe von 30 Segmenten, Precision der Entitäten | AI Functions Eval-Notebooks (LLM as Judge) | manuell |
| Kosten: CU-Verbrauch der AI Functions vorher schätzen | Capacity Metrics App | egal |

## 3. Speicher: vier Tabellen

`documents`, `segments`, `nodes`, `edges`. Gerichtete Kanten, skalare Properties.

| Checkpoint | Fabric-Weg | Kitchen lokal |
|---|---|---|
| Tabellen als Delta im Lakehouse (Silber) | Notebook `saveAsTable` | SQLite |
| Volltext | Cosmos DB in Fabric (BM25) oder Azure AI Search | SQLite FTS5 |
| Vektorsuche | Cosmos DB in Fabric (DiskANN, Hybrid mit RRF) | später |
| Graph-Modell in Fabric über die Tabellen legen: Node-Typen, Edge-Typen, Mappings | Graph-Item, Preview | Export nach Parquet |
| Schema einfrieren: jede Änderung heißt Graph neu laden | Versionsnummer im Tabellennamen | egal |

## 4. Abfrage und Ausgabe

| Checkpoint | Fabric-Weg | Kitchen lokal |
|---|---|---|
| Standardfragen als GQL formulieren und testen | Graph Code Editor, REST `executeQuery` | SQL / graph.json |
| Natürliche Sprache | Data Agent mit Graph als Quelle (NL2GQL), bis zu fünf Quellen | keine |
| Für alle sichtbar ohne Fabric-Login | Snapshot-Export als statische Seite | web/explorer.html |
| Interaktiv mit SSO | Fabric App (Preview, Region beachten) oder Data Agent in Copilot Studio / Teams | später |

## 5. Betrieb

| Checkpoint | Warum |
|---|---|
| Refresh-Takt: neue Folgen, neue Dokumente, Graph neu laden | Graph-Ingest ist ein Vollaufbau |
| Vokabular-Review monatlich | neue Produkte, umbenannte Features |
| Löschkonzept: Dokument raus heißt Segmente, Knoten und Kanten raus | DSGVO bei E-Mails |
| Monitoring: Graph-CU, AI-Functions-CU, Storage-Minimum 100 GB | Capacity Metrics App |

## Learnings aus dem Kitchen-Testfall (September 2026)

- **Zeitstempel sind der Kern, nicht Beiwerk.** Die erste Transkript-Pipeline hatte sie weggeworfen. Ohne Sekunde kein Beleg, ohne Beleg kein Vertrauen. Bei Teams-Aufzeichnungen und Stream-Transkripten gilt dasselbe: VTT behalten, nicht nur den Text.
- **Automatische Untertitel fehlen bei etwa jedem sechsten Video** (23 von 126, vor allem englische Folgen). Im Unternehmen heißt das: Transkription selbst erzeugen (Azure AI Speech oder Whisper), nicht auf die Plattform verlassen.
- **Die Spracherkennung schreibt Produktnamen falsch** ("Power DI", "Fabrik", "Click" für Qlik). Das Vokabular braucht deshalb Alias-Listen mit den typischen Fehlern, sonst fehlen die häufigsten Erwähnungen.
- **Generische Wörter nur mit Anker zählen.** "Desktop", "Delta", "Design" zählen nur, wenn im selben Dokument ein spezifischer Alias vorkommt. Das hält die Precision hoch, ohne Recall zu verlieren.
- **Heuristik vor LLM lohnt sich.** 7.900 Erwähnungen, 390 "erklärt"-Kanten und 730 Themenbeziehungen kamen ohne ein einziges Modell zustande, reproduzierbar und in Sekunden. Das LLM kommt erst für Aussagen und typisierte Beziehungen dazu.
- **Kapitel aus der Beschreibung sind Gold.** Eine Kapitelüberschrift, die ein Thema nennt, ist eine sehr belastbare "erklärt"-Kante. Im Unternehmen entsprechen dem Agenda-Punkte, Überschriften in Word und Betreffzeilen.
- **Der Graph darf nicht zu voll sein.** 140 Konzepte plus 126 Dokumente auf einmal sind unlesbar. Standardansicht: Konzepte ab N Folgen und Beziehungen ab M gemeinsamen Segmenten, Dokumente erst auf Klick.

- **Teilnehmer kommen aus dem Format, nicht aus dem Transkript.** „Thinkers Talk" heißt Marcus und Artur, „Quarterly" heißt Gabi und Artur. Im Unternehmen ist das die Kalender-Einladung. Wer wirklich spricht, weiß nur eine Diarisierung, das steht im Backlog.
- **Dokumente sind nur ein weiterer Adapter.** Die 21 Kitchen-Seiten kamen als Markdown mit Überschriften-Abschnitten in dasselbe Schema wie die Folgen. Der Absprung geht auf den Abschnitt per Text-Fragment, weil die Seiten keine stabilen Anker haben. Bei Word und SharePoint entsprechend: Überschrift als Anker, Seite als Fallback.
- **Fragen als Vorlagen, nicht als Freitext.** Fünf Fragetypen decken den Alltag ab und lassen sich 1:1 als GQL formulieren. Das ist die Brücke zum Data Agent in Fabric: dieselben Muster werden dort NL2GQL-Beispiele.
- **Zustand in die URL.** Jede Sicht (Knoten, Frage, Zeitraum, Fokus) ist ein Link. Im Unternehmen ist das der Unterschied zwischen „schau mal im Tool" und „hier ist die Antwort".

## Offene Fragen

- Ontology (Fabric IQ) als formale Vokabular-Definition: lohnt erst, wenn mehrere Domänen zusammenkommen.
- Wie weit trägt NL2GQL bei deutschen Fragen? Testen, sobald der Graph steht.
