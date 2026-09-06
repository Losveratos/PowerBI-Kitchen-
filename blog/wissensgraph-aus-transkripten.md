# Aus 126 Folgen wird ein Wissensgraph

> Post · Wissensgraph aus Transkripten · Von Michael Tenner · Stand September 2026
> HTML-Fassung: https://datenwgknowledgekitchen.com/wissensgraph-aus-transkripten.html
> Werkzeug: https://datenwgknowledgekitchen.com/wissensgraph/

Die Kitchen konnte bisher Titel, Beschreibungen und Kapitel durchsuchen. Das eigentliche Wissen steckt aber im Gespräch. Jetzt gibt es einen Graphen über alle Transkripte: Themen, Tools, Personen und Kernaussagen, und jede Verbindung springt auf die Sekunde genau ins Video.

## Warum ein Graph und nicht noch eine Suche?

Eine Suche beantwortet die Frage „Wo kommt das Wort vor?". Sie beantwortet nicht „Wer hat Direct Lake erklärt, und in welchem Zusammenhang mit Import Mode?". Dafür braucht es Verbindungen: Folge zu Thema, Thema zu Thema, Person zu Folge, Aussage zu Beleg. Genau das ist ein Graph.

Der zweite Grund ist der Beleg. Ein Chatbot, der über Transkripten sitzt, liefert Antworten. Ein Graph mit Zeitstempeln liefert Antworten und die Stelle im Video, an der sie fallen.

## Was wir gebaut haben

1. **Transkripte mit Zeitstempel.** Jedes Wort mit Sekunde. Daraus Segmente von rund 90 Sekunden, geschnitten am Satzende und nie über eine Kapitelgrenze.
2. **Ein Vokabular gegen die Spracherkennung.** Rund 100 Begriffe mit Aliasen, auch für Fehler der automatischen Untertitel („Power DI", „Fabrik", „Click"). Generische Wörter zählen nur mit eindeutigem Anker im selben Video.
3. **Kernaussagen und belegte Beziehungen per LLM.** 8 bis 20 prüfbare Aussagen pro Folge mit Segmentnummer und Themen aus dem Vokabular, dazu typisierte Beziehungen (ersetzt, setzt voraus, steht im Gegensatz zu) mit Zitat. Pilot: 8 Folgen, 154 Kernaussagen.
4. **Vier Tabellen, ein Explorer.** Dokumente, Segmente, Knoten, Kanten. Lokal SQLite mit Volltextindex, für die Website zwei JSON-Dateien und ein D3-Explorer ohne Server.

Zahlen aus dem Build (September 2026): 126 Folgen, 109 mit Zeitstempeln, 2.697 Segmente, 140 Konzepte, 8.047 Erwähnungen, 390 „erklärt"-Kanten aus Kapitelüberschriften, 730 Themenbeziehungen aus gemeinsamem Vorkommen.

## Was das mit Microsoft Fabric zu tun hat

Der Kitchen-Graph ist der Testfall. Ziel ist ein Vorgehen, mit dem ein Unternehmen dasselbe über Projektdokumente, Meeting-Transkripte und Mails legt, im eigenen Tenant. Das Schema ist deshalb die Schnittmenge dessen, was Graph in Microsoft Fabric (Preview) kann: gerichtete Kanten, skalare Properties, keine Schema-Evolution.

| Schritt | Kitchen lokal | Im Fabric-Tenant |
|---|---|---|
| Transkript | YouTube-Untertitel als VTT | Teams-Aufzeichnung, Azure AI Speech, VTT behalten |
| Anreicherung | Vokabular-Heuristik, Claude für Aussagen | Dieselbe Heuristik im Notebook, ai.extract mit JSON-Schema |
| Speicher | SQLite mit FTS5 | Delta-Tabellen im Lakehouse, Cosmos DB in Fabric für Vektor- und Hybridsuche |
| Graph | graph.json, D3 im Browser | Graph-Modell über die Tabellen, GQL, REST-Endpunkt |
| Fragen stellen | Volltextsuche | Data Agent mit Graph als Quelle (NL2GQL), Teams, Copilot Studio |
| Oberfläche | Statische Seite | Snapshot-Export, später Fabric App mit SSO |

Grenzen von Graph in Fabric, Stand heute: Zugriff nur für Workspace-Mitglieder, Abfragen nur lesend, Schemaänderung heißt Graph neu laden, Fabric App in North Europe nicht verfügbar. Checkpoints im Playbook: https://datenwgknowledgekitchen.com/wissensgraph/playbook.md

## Ehrlich eingeordnet

17 der 126 Folgen haben bei YouTube keine automatischen Untertitel und stehen im Graphen nur mit Metadaten. 6 weitere haben Text ohne Zeitstempel. Die Heuristik zählt Erwähnungen, keine Bedeutung. Die Kernaussagen stammen aus 8 von 126 Folgen und sind maschinell erzeugt, nicht redigiert. Bei Widersprüchen gilt das Video.
