# 03 · Clients außerhalb von Power-BI-Berichten: Sicherheit und Governance

Stand der Recherche: 19.11.2026. Grundlage: Microsoft Learn (MCP-Abruf), ergänzt um Websuche.
Ausgangspunkt: fabscan 0.5.1 (siehe `fabscan-faehigkeiten.md`).

**Kennzeichnung je Aussage**

* **[D]** dokumentiert: steht so in der verlinkten Quelle (Microsoft Learn, REST-Referenz).
* **[A]** abgeleitet oder unsicher: Schlussfolgerung aus mehreren Quellen, Community-Beobachtung oder
  nicht in der Primärquelle bestätigt. Vor Einbau in eine fail-Regel im eigenen Tenant messen.

---

## 0. Kurzfazit

1. Der entscheidende Hebel ist nicht der Client, sondern **die Identität, mit der er fragt**, und ihr
   **Recht am Modell**. Wer Write hat (Workspace-Rolle Contributor oder höher, auch ein Service Principal
   als Workspace-Mitglied), sieht trotz RLS alles. Wer Build hat, kann das Modell mit beliebigem DAX/MDX
   abfragen (REST, XMLA, Excel, Notebook, MCP, Fabric App). Ein Data Agent braucht sogar nur Read.
2. Die meisten Wege sind per Voreinstellung offen (XMLA lesend, Analyze in Excel, Copilot, Service
   Principals für Fabric-APIs). Tenant-Schalter sind laut Microsoft **keine Sicherheitsgrenze**.
3. In den Logs ist der Weg nur teilweise sicher erkennbar: `ApplicationName` liefert der Client selbst
   (fälschbar), das Activity-Log kennt für executeQueries kein eigenes Ereignis, App-owns-data-Embedding
   verliert die Endnutzer-Identität, wenn die App sie nicht mitgibt.
4. fabscan prüft heute App-Code, Abfragen und Modelle. Es fehlt die **Rechte- und Schalterseite**:
   wer darf über welche Wege mit welchem Recht, und passt das tatsächliche Abfrageverhalten dazu.

---

## 1. Clientlandkarte

| Client | Weg / Protokoll | Identität am Modell | Mindestrecht am Modell | RLS greift? | Quelle |
|---|---|---|---|---|---|
| Fabric App (Rayfin), Semantikmodell-Connector | `executeQuery` über App-Backend | delegiert: angemeldeter Nutzer | Read + Build [D] | ja, sofern Nutzer nur Read/Build hat [D/A] | [L17], [L19] |
| Fabric App, SQL-Connectoren (Lakehouse, Warehouse, SQL DB) | GraphQL-Backend | Standard `application` = App-Item-Besitzer [D] | Rechte der App-Identität | Quell-Sicherheit wird **nicht je Nutzer** geprüft [D] | [L17], [L18] |
| Fabric App Functions | Server-Funktion | App-Identität über `ctx.Tokens` [D]; Semantikmodell **nicht** über `ctx.Tokens` [D] | n. a. | n. a. | [L21] |
| User Data Functions (Python) | REST-Endpunkt je Funktion | Item-Besitzer für generische Verbindungen [D]; Semantikmodell kein nativer Verbindungstyp [D] | n. a. | n. a. | [L22] |
| Eigene App über executeQueries | REST `datasets/{id}/executeQueries` | Nutzer oder Service Principal; `impersonatedUserName` optional [D] | Read + Build [D] | Nutzer: ja; SP: auf RLS-Modellen **nicht unterstützt** [D] | [L1] |
| Eigene App über executeDaxQueries (Arrow) | REST, Premium/Fabric | wie oben, `effectiveUsername` [D] | Read + Build (SP) [D] | wie oben | [L2], [L3] |
| XMLA-Endpunkt (SSMS, DAX Studio, Tabular Editor, ADOMD) | XMLA, DAX/MDX/DMV | Nutzer oder SP; `EffectiveUserName`, `Roles` [D] | Build für Lesen [D], Write für Metadaten | Build: ja; Write: nein [D] | [L7] |
| Excel (Analyze in Excel, Live-PivotTable) | XMLA/MDX | Nutzer | Build [D] | ja, RLS und OLS [D] | [L30], [L10] |
| Notebook mit Semantic Link (sempy) | XMLA (`evaluate_dax`) [D] | Interaktiv: Nutzer; Pipeline: letzter Bearbeiter der Pipeline; Zeitplan: Ersteller des Zeitplans [D] | Build [D]; TOM-Funktionen ReadWrite [D] | abhängig von der Identität | [L23], [L24] |
| Power BI Embedded, App owns data | Embed Token | Master-User oder SP, plus `EffectiveIdentity` [D] | SP: Workspace Member/Admin für Token [D] | nur mit `EffectiveIdentity` [D] | [L5], [L6] |
| Power BI MCP (Consumption, Authoring) | MCP über Fabric-API oder lokal über XMLA | Nutzer (Entra), lokal auch SP [D] | Build [D] | Nutzer: ja; SP: **nein** [D] | [L28], [L29] |
| Fabric Data Agent, Copilot, Fabric IQ | NL2DAX | Nutzer (Identity Passthrough) [D] | **Read genügt** [D] | ja, RLS und CLS [D] | [L25], [L26], [L38] |

---

## 2. Risiken (Frage 1)

### R1 · RLS-Umgehung durch Write-Recht (auch für Service Principals) [D]
* Nutzer mit Write am Modell lesen unabhängig von RLS-Rollen alles; Admin, Member und Contributor im
  Workspace haben Write. RLS wirkt nur auf Viewer. Quelle: [L9], [L4].
* Bei RLS-Modellen erlaubt jedes Recht **oberhalb von Build** alle Daten. Quelle: [L8].
* Service Principals können keiner RLS-Rolle angehören, also gilt für eine App mit SP als letzter
  effektiver Identität keine RLS. Quelle: [L4], [L7].
* Folge **[A]**: Ein Service Principal, der als Contributor im Workspace sitzt (üblich für CI/CD und
  für Mid-Tier-Dienste, die Microsoft-Tutorials sogar so anlegen [L3]), ist für jede Kundenanwendung,
  die ihn zum Abfragen nutzt, ein Vollzugriff auf alle Zeilen.

### R2 · App owns data ohne oder mit falscher EffectiveIdentity [D]
* Master-User ohne `username`/`roles` im Token: Token wird erzeugt, **Daten ungefiltert**.
  Service Principal ohne Identität auf RLS-Modell: Token-Erzeugung schlägt fehl. Quelle: [L5].
* `USERPRINCIPALNAME()` liefert bei SP-Embedding die App-ID oder leer; dynamische RLS filtert dann
  nicht je Nutzer. Quelle: [L4].
* `EffectiveIdentity.username` darf laut Referenz jeden ASCII-String enthalten, die App bestimmt also
  frei, als wer gefiltert wird. Quelle: [L6]. **[A]**: Ein Fehler in der App-Logik (falsche Zuordnung
  Kunde zu Rolle) ist von Power BI aus nicht erkennbar.
* Service-Principal-Profile sind keine eigene Entra-Identität und keine automatische Grenze zwischen
  Kunden; die Trennung hängt am korrekten Routing der App. Quelle: [L37].

### R3 · Impersonation über Parameter [D/A]
* executeQueries: `impersonatedUserName` wird ignoriert, wenn das Modell keine RLS hat. Quelle: [L1].
* executeDaxQueries: `effectiveUsername` nur verwenden, wenn die aufrufende Identität diesen Nutzer
  vertreten darf. Quelle: [L3].
* XMLA: `EffectiveUserName` erfordert, dass das vertretene Konto Read und Build hat; mit `Roles` kann
  ein Workspace-Admin sich auf eine Rolle herabstufen. Quelle: [L7].
* **[A]** Welche Rechte der **Aufrufer** für `impersonatedUserName` braucht, ist in der REST-Referenz
  nicht beschrieben. Ein Mid-Tier, der den Wert aus der Browser-Anfrage übernimmt, macht RLS zur
  Clientsache. Das ist im App-Code prüfbar.

### R4 · Build ist ein Generalschlüssel für alle Wege [D]
* Build erlaubt Export der zugrunde liegenden Daten, Analyze in Excel und XMLA-Lesezugriff. Quelle: [L10], [L8].
* Build wird vergeben über Contributor+, direkte Freigabe, App-Audience-Einstellung und Weiterteilen
  eines Berichts durch Nutzer mit Reshare + Build. Quelle: [L10].
* Entzug des App-Zugriffs entfernt Build und Reshare nicht automatisch. Quelle: [L10].
* **Fabric App teilen** gewährt direkte Rechte auf verbundene Items; bei delegiertem Semantikmodell
  braucht jeder Nutzer Build. Diese Grants sind nicht an die App gebunden und gelten für jeden anderen
  Weg mit. Quelle: [L18], [L17]. **[A]**: Jede geteilte Fabric App mit Semantikmodell-Connector
  verteilt Build und damit XMLA-, Excel- und REST-Zugriff an alle App-Nutzer.
* Die in der App hinterlegte DAX-Abfrage ist keine Grenze: Typen im Client sind ausdrücklich keine
  Autorisierungsgrenze. Quelle: [L17]. **[A]**: Wer die App nutzen darf, kann über dieselbe Identität
  beliebiges DAX an das Modell schicken (Browser-Konsole, eigenes Skript).

### R5 · Data Agents und Copilot umgehen das Build-Tor [D]
* Für Abfragen über einen Fabric Data Agent genügt **Read** am Modell, Build und Workspace-Zugriff sind
  nicht nötig; RLS und CLS gelten weiter. Quelle: [L25], [L26].
* **[A]**: Nutzer, denen Build bewusst verweigert wurde (nur Berichtsansicht), können über einen Agenten
  frei formulierte Abfragen stellen, die kein Bericht vorsieht. Das ist kein RLS-Bruch, aber ein Bruch
  der Annahme „nur kuratierte Sicht“.
* Data Agents lassen sich in Foundry, Copilot Studio, M365 Copilot oder als MCP-Server konsumieren;
  Antworten können dann die Compliance-Grenze oder Region verlassen. Quelle: [L27].

### R6 · Prompt Injection bei Agenten [A, mit dokumentiertem Rahmen]
* Dokumentiert: Agent-Anweisungen (bis 15.000 Zeichen) und Beispielabfragen prägen das Verhalten;
  Microsoft beschreibt eine Rangfolge Organisation > Rolle > Entwickler > Nutzer. Quelle: [L26].
* Dokumentiert: Die Consumption-MCP-Schnittstelle liefert dem Agenten auch die
  „Copilot tooling metadata“ (KI-Anweisungen aus „Prep for AI“) mit. Quelle: [L28].
* **[A]**: Wer Write am Modell hat, kann über KI-Anweisungen, Beschreibungen oder Synonyme Text in den
  Kontext jedes Agenten bringen (indirekte Prompt Injection). Ebenso Textwerte in Dimensionstabellen,
  die in Antworten landen. Belegte Muster aus anderen Microsoft-Copilot-Produkten (Datenabfluss über
  präparierte Inhalte, z. B. EchoLeak) zeigen, dass Klassifikatoren umgangen werden können [W3].
  Für Fabric Data Agents fand die Recherche keinen öffentlichen Fall.
* **[A]**: Agent-Ergebnisse sind nicht deterministisch; eine Kennzahl kann je Lauf anders gefiltert
  sein. Für den Ontologie-Agenten in Fabric IQ ausdrücklich dokumentiert [L39], für Data Agents
  sinngemäß übertragen.

### R7 · Datenabfluss und Grenzen der REST-Wege [D]
* executeQueries: höchstens 100.000 Zeilen oder 1.000.000 Werte und 15 MB je Abfrage, 120 Abfragen pro
  Minute und Nutzer. Quelle: [L1].
* executeDaxQueries (Arrow): **keine feste Zeilengrenze**, Streaming; Begrenzung nur freiwillig über
  `resultsetRowcountLimit`. Quelle: [L2].
* sempy über XMLA: Menge nur durch Speicher begrenzt. Quelle: [L23].
* **[A]**: 120 Abfragen/Minute × 100.000 Zeilen bedeutet bis zu 12 Mio. Zeilen pro Minute je Nutzer über
  executeQueries; die alte Grenze ist kein Schutz gegen Massenabzug.
* Tenant-Schalter wie „Export data“ beschränken nicht das Recht, das Modell abzufragen und Ergebnisse
  zu speichern. Quelle: [L32].

### R8 · Zwischenspeicher außerhalb von Power BI [A]
* Sensitivity Labels werden bei Analyze in Excel und Live-PivotTables vererbt. Quelle: [L31].
* Ergebnisse aus executeQueries, Fabric Apps, Notebooks und MCP tragen **kein** Label; die
  executeQueries-Antwort liefert nur ein Feld `informationProtectionLabel` mit, das der Client
  auswerten müsste. Quelle: [L1]. Was der Client daraus macht (Browser-Speicher, Service Worker, Pandas
  in Lakehouse, Chatverlauf), ist von Power BI aus nicht sichtbar.
* Fabric Apps: anonyme Datenrolle ist möglich, wenn Tenant-Schalter, App-Einstellung und
  `anonymous`-Rolle zusammenkommen; dann kann jeder mit der URL die Operation nutzen. Quelle: [L20].
  fabscan erkennt Browser-Speicher schon (SEC-STORAGE), nicht aber die anonyme Rolle.

### R9 · Kennzahlen-Logik außerhalb des Modells [A]
* Jeder Client mit Build kann DEFINE MEASURE, eigene Filter und ALL/REMOVEFILTERS senden. fabscan
  prüft das für App-Code und für Abfragen in SemanticModelLogs (CALC-*, QRY-*). Neu ist die Frage,
  **welche Clients** das tun: Excel (MDX, eigene berechnete Elemente in Pivot), Notebooks (Logik in
  Pandas, nicht im Log sichtbar), Agenten (NL2DAX erzeugt pro Frage neue Logik).
* Bei Agenten ist der erzeugte DAX in den Ausführungsschritten sichtbar. Quelle: [L26]
  (Abschnitt „Ask questions“). Ob er vollständig in SemanticModelLogs erscheint, ist nicht dokumentiert.

### R10 · Ausführungsidentität bei Notebooks, Pipelines, UDF [D]
* Pipeline-Notebook läuft unter dem **zuletzt bearbeitenden Nutzer der Pipeline**, Zeitplan unter dem
  Ersteller des Zeitplans. Quelle: [L24].
* UDF-Generic-Connections und Fabric-App-SQL-Connectoren nutzen die Identität des Item-Besitzers.
  Quelle: [L22], [L17].
* **[A]**: Rechteausweitung durch „Bearbeiten“: wer eine Pipeline bearbeiten darf, lässt Code unter
  eigener Identität laufen; wer eine App mit `application`-Connector besitzt, stellt seine Rechte allen
  App-Nutzern bereit.

### R11 · Service Principals breit freigeschaltet [D]
* „Service principals can call Fabric public APIs“ ist für neue Kunden **standardmäßig an**. Quelle: [L16].
* Für executeDaxQueries mit SP ist zusätzlich der SP-Schalter nötig, für executeQueries nennt die
  Referenz noch den alten Namen „Allow service principals to use Power BI APIs“. Quelle: [L1], [L2].
  **[A]**: Namensdrift zwischen alter und neuer Doku; im Bericht beide Namen zeigen.
* Workspace Identity ist ein automatisch verwalteter Service Principal; für Notebook-Aktivitäten in
  Pipelines verlangt sie den SP-Schalter. Quelle: [L36], [L24].

### R12 · Externe Schreibwege über XMLA und MCP [D]
* XMLA read-write ist pro Kapazität einstellbar; Contributor+ kann dann TMSL ausführen und Rollen
  ändern. Quelle: [L7].
* Der lokale Authoring-MCP-Server lässt sich per Tenant-Schalter nicht sperren, nur über XMLA.
  Quelle: [L29]. Nur der gehostete Server schreibt `ReadByPowerBIMCP`/`ModifiedByPowerBIMCP`. Quelle: [L29].
* **[A]**: Ein Agent mit Write kann RLS-Rollen oder KI-Anweisungen ändern; Erkennung nur über
  Activity-Log oder Modellvergleich (fabscan kann Modellstände vergleichen, wenn es Läufe speichert).

---

## 3. Erkennung in Logs (Frage 2)

### 3.1 SemanticModelLogs (Workspace Monitoring) und Log Analytics

| Feld | Bedeutung laut Doku | Zuverlässigkeit | Quelle |
|---|---|---|---|
| `ApplicationName` | Name, den der Client beim Verbinden **selbst übergibt**, nicht der Programmname | **niedrig** als Sicherheitsmerkmal: frei setzbar, optional [D]; gut als Heuristik | [L11], [L12], [L40] |
| `ApplicationContext` | Property Bag, z. B. Bericht-ID; bei Power-BI-Visuals auch Visual-ID [D für ReportId, A für Struktur] | **mittel**: vom Dienst gesetzt bei Berichten; fehlt bei externen Clients meist [A] | [L11] |
| `ExecutingUser` | Nutzer, der die Operation ausführt (Aufrufer) | **hoch** für Nutzer; bei SP erscheint App-ID/Objekt-ID [A] | [L11] |
| `User` | Nutzer, in dessen Namen auf dem Server ausgeführt wird (Impersonation) | **mittel**: zeigt `EffectiveUserName`/`impersonatedUserName` [A, aus Feldbeschreibung abgeleitet] | [L11] |
| `Identity` | Nutzer und Claims (dynamic) | **hoch**, enthält Claims; Struktur nicht dokumentiert [A] | [L11], [L12] |
| `CallerIpAddress` | aufrufende IP | **mittel** [A]: bei Dienst-zu-Dienst (Fabric App Backend, Agent) vermutlich Microsoft-IP | [L11] |
| `XmlaProperties`, `XmlaSessionId` | Eigenschaften der XMLA-Anfrage | **mittel**: zeigt u. a. Verbindungseigenschaften [A] | [L11] |
| `EventText` (ExecutionMetrics) | `queryDialect` (MDX 0, DAX 3), `queryResultRows`, `capacityThrottlingMs` | **hoch** [D]: MDX = Excel/Pivot, große `queryResultRows` = Abzug | [L12] |

Community-Beobachtungen [A]: Bei MDX-Abfragen stand in `ExecutingUser` teils „Power BI Service“ statt
eines Nutzers [W2]; bei App owns data fehlt die Endnutzer-Identität im Log, Microsoft-Idee dazu offen [W1].

**Empfehlung [A]:** Clients über eine **Kombination** klassifizieren, nie über `ApplicationName` allein:
Dialekt (MDX → Excel/Pivot), Vorhandensein von Bericht-IDs in `ApplicationContext`, Identitätstyp
(UPN vs. GUID), `User` ≠ `ExecutingUser` (Impersonation), Abfragemuster (z. B. `EVALUATE` mit
`TOPN` aus Agenten). Die Fingerabdrücke je Client im eigenen Tenant messen und als Tabelle pflegen.

### 3.2 Activity-Log (Admin API `activityevents`, Purview Audit)

| Ereignis | Was es zeigt | Zuverlässigkeit | Quelle |
|---|---|---|---|
| `AnalyzedByExternalApplication` | Interaktion eines externen Clients mit einem Modell (Excel u. a.) | hoch für „wer“, grob für „wie“ [D] | [L13], [L14] |
| dto., Feld `EndPoint` = „Dataset Execute Queries REST API“ | executeQueries-Aufruf | **[A]**: laut Ankündigung zur GA, nicht in der Learn-Referenz bestätigt | [W4] |
| `ConnectFromExternalApplication` | Verbindung aus externer App | [D] Name, Inhalt nicht beschrieben | [L13] |
| `AnalyzeInExcel`, `AnalyzeInExcelDataset/Report` | Erzeugung einer Excel-Datei | hoch [D] | [L13] |
| `GenerateEmbedToken`, `GenerateMultiResourceEmbedToken` | Embed Token erzeugt; `tokenId` korreliert spätere Operationen | hoch [D]; Endnutzer nur, wenn `auditableContext` gesetzt wurde [D] | [L13], [L6] |
| `ReadByPowerBIMCP`, `ModifiedByPowerBIMCP` | gehosteter Authoring-MCP | hoch, aber **nur gehostet**, lokal nichts [D] | [L13], [L29] |
| `CopilotInteraction`, `RequestCopilot` | Copilot-Nutzung | [D] Name; Inhalt über Purview [D] | [L13], [L26] |
| `ShareDataset`, `GetDatasetUsersAsAdmin` | Freigaben, Rechte-Abfragen | hoch [D] | [L13] |
| `Create/Update/DeleteServicePrincipalProfile` | SP-Profile | hoch [D] | [L13] |
| Workspace-Identity-Ereignisse (Token abgerufen) | Nutzung der Workspace Identity | hoch [D] | [L36] |

Latenz bis 60 Minuten, Abruf je Tag, Fabric-Admin nötig. Quelle: [L35].

**Nicht gefunden [A]:** Ein eigenes Ereignis für executeDaxQueries (Arrow), für Fabric-App-Connector-
Abfragen oder für Data-Agent-Abfragen gegen Semantikmodelle. Diese Wege sind derzeit nur in
SemanticModelLogs sichtbar, wenn Workspace Monitoring im Workspace des **Modells** aktiv ist.

---

## 4. Tenant-Einstellungen und Berechtigungen (Frage 3)

### 4.1 Schalter

| Schalter (Anzeigename) | Gruppe | Wirkung | Standard | Quelle |
|---|---|---|---|---|
| Semantic Model Execute Queries REST API (früher „Dataset Execute Queries REST API“) | Integration | executeQueries und executeDaxQueries; Voraussetzung für Fabric-App-Semantikmodell-Connector | [A] an | [L15], [L1], [L19] |
| Allow XMLA endpoints and Analyze in Excel with on-premises semantic models | Integration | XMLA-Verbindungen, auch nötig für executeDaxQueries | an [D] | [L7], [L2] |
| Users can work with semantic models in Excel using a live connection | Export und Freigabe | Analyze in Excel | an [D] | [L7] |
| XMLA Endpoint (Off / Read Only / Read Write) | **Kapazität**, nicht Tenant | Lesen/Schreiben je Kapazität | Read Only [D] | [L7] |
| Embed content in apps | Entwickler | App-owns-data-Embedding | [A] | [L16] |
| Service principals can call Fabric public APIs | Entwickler | SP-Zugriff auf Fabric-APIs | **an** für neue Kunden [D] | [L16] |
| Service principals can create workspaces, connections, and deployment pipelines | Entwickler | SP legt Workspaces an | aus für neue Kunden [D] | [L16] |
| Allow service principals to create and use profiles | Entwickler | SP-Profile (Multitenancy) | [A] | [L16] |
| Users can use the Power BI Model Context Protocol server endpoint (preview) | Integration | gehosteter MCP; SP zusätzlich über SP-Schalter | [A] | [L15] |
| Users can use Copilot and other features powered by Azure OpenAI | Copilot und KI | Copilot und Data Agents | **an** [D] | [L27] |
| Data sent to Azure OpenAI can be processed/stored outside … | Copilot und KI | Datenverarbeitung außerhalb Region | aus [D] | [L27] |
| Enable Fabric App Items (preview) | Microsoft Fabric | Fabric Apps anlegen | [A] | [L34] |
| Enable anonymous data access for Fabric Apps (Preview) | Microsoft Fabric | anonyme Datenrolle | aus [D] | [L20], [L34] |
| Service principals can access read-only admin APIs | Admin API | Voraussetzung für fabscan-Tenantlauf mit SP | [A] | [L33] |
| Block republish and disable package refresh | Gruppe [A] | XMLA-Discovery nur eigene Modelle, Nicht-Besitzer nur Leser [D] | [A] | [L7] |

Wichtig für den Bericht: Microsoft schreibt ausdrücklich, dass Tenant-Schalter **Governance, keine
Sicherheitsmaßnahme** sind; Nutzer mit Lesezugriff können ein Modell abfragen und Ergebnisse speichern,
auch wenn „Export data“ aus ist. Quelle: [L32].

Auslesbar über die Fabric-Admin-API „Tenants · List Tenant Settings“ (Fabric-Admin) inkl.
Sicherheitsgruppen, Delegation an Kapazität/Domäne/Workspace über die Overrides-Endpunkte. Quelle: [L41].

### 4.2 Berechtigungen am Modell

* Rechte in der API: `Read`, `ReadExplore` (= Build), `ReadReshare`, `ReadReshareExplore`; Write kommt
  über die Workspace-Rolle. Quelle: [L8].
* Auslesbar je Modell über `GetDatasetUsersAsAdmin` (Admin) bzw. `Get Dataset Users In Group`
  (ohne Admin, mit Rechten am Modell [A]); Scanner-API mit Nutzerliste. Quelle: [L8], [L42].

### 4.3 Was ein Prüfbericht ausweisen sollte

1. **Schaltermatrix** je Weg (REST, XMLA, Excel, MCP, Copilot/Agent, Embedding, Fabric Apps, anonym):
   an/aus, für wen (Sicherheitsgruppen), delegiert an Kapazität/Domäne/Workspace, Kapazitäts-XMLA-Modus.
2. **Rechteinventur je Modell**: Anzahl Principals mit Write (über Rolle), Build, nur Read; davon
   Service Principals, Gruppen, Gäste; Herkunft (Rolle, direkte Freigabe, App-Audience, Fabric-App-Share).
3. **RLS-Wirksamkeit**: Modell hat RLS, aber X Principals mit Write sehen alles (davon SPs).
4. **Beobachtete Clients je Modell** (aus SemanticModelLogs und Activity-Log): Excel/MDX, REST, XMLA-Tools,
   Notebooks, Agenten, Embedding, Fabric Apps; je Client Identitätstyp und Datenmenge.
5. **Abweichungen**: Client genutzt, obwohl der Weg laut Konzept nicht vorgesehen ist; SP fragt RLS-Modell
   ab; große Ergebnismengen; Impersonation ohne erkennbare Regel.
6. **Blinde Flecken** ehrlich benennen: Modelle ohne Workspace Monitoring, lokaler MCP, Embedding ohne
   `auditableContext`, Notebooks (Logik nach der Abfrage).

---

## 5. Vorschlag: neue Prüfregeln für fabscan (Frage 4)

Neue Kategorien: **Zugang** (ACC), **Client** (CLI), **Tenant** (TEN), **Agent** (AGT), **Embedding** (EMB).
„Recht“ = was der Lauf braucht. Schweregrad als Vorschlag.

### 5.1 Zugang und Rechte

| ID | Regel | Begründung | Datenquelle | Recht | Grad |
|---|---|---|---|---|---|
| ACC-WRITE-RLS | Modell hat RLS, und Principals außer dem Kernteam haben Write (Workspace-Rolle ≥ Contributor) | Write hebelt RLS aus [L9] | Scanner-API (Rollen, Workspace-Nutzer) oder Workspace-Rollen-API; RLS aus TMDL/INFO.VIEW | Fabric-Admin (Scanner) oder Workspace-Admin | warn, fail wenn SP |
| ACC-SP-WRITE | Service Principal mit Write auf Modell mit RLS | SP keiner Rolle zuordenbar, sieht alles [L4] | wie oben, Principal-Typ `App` | wie oben | fail |
| ACC-BUILD-WIDE | Build an große Gruppen / ganze Organisation / Gäste | Build öffnet REST, XMLA, Excel [L10] | `GetDatasetUsersAsAdmin`, Scanner `getArtifactUsers` | Fabric-Admin | warn |
| ACC-BUILD-VIA-APP | Build stammt aus Fabric-App-Share oder App-Audience | nicht an die App gebunden, bleibt nach App-Entzug [L18], [L10] | Rechte-API + Fabric-App-Connector (rayfin.yml) | Admin | info/warn |
| ACC-READ-ONLY-AGENT | Nutzer nur mit Read, aber Modell ist Quelle eines Data Agents | Agent umgeht Build-Tor [L25] | Data-Agent-Definition (Item-Definition) + Rechte | Admin oder Workspace-Rechte | info |
| ACC-STALE-OWNER | Fabric App mit `application`-Connector oder UDF, Besitzer ist ausgeschieden/deaktiviert | Identität des Besitzers trägt den Zugriff [L17], [L22] | Item-Metadaten + Entra (Graph) | Admin + Graph-Leserecht | warn |
| ACC-PIPELINE-IDENTITY | Notebook mit sempy in Pipeline/Zeitplan; ausführende Identität ≠ Besitzer | Rechteausweitung über „letzter Bearbeiter“ [L24] | Job-Scheduler-API, Pipeline-Metadaten | Workspace-Leser | info |

### 5.2 Clients aus Logs

| ID | Regel | Begründung | Datenquelle | Recht | Grad |
|---|---|---|---|---|---|
| CLI-INVENTORY | Clients je Modell klassifizieren (Bericht, Excel/MDX, REST, XMLA-Tool, Notebook, Agent, Fabric App, Embedded) | Grundlage aller weiteren Regeln | SemanticModelLogs (`ApplicationName`, `ApplicationContext`, `ExecutionMetrics.queryDialect`, Identität) | Leser auf Monitoring-Eventhouse | info |
| CLI-SP-RLS | SP-Identität fragt Modell mit RLS ab | RLS greift nicht für SP [L4]; executeQueries verbietet es sogar [L1], Treffer heißt also XMLA/Write | SemanticModelLogs + RLS-Info | wie oben | fail |
| CLI-IMPERSONATE | `User` ≠ `ExecutingUser` | Impersonation, Aufrufer bestimmt Filter [L11], [L7] | SemanticModelLogs | wie oben | warn (info bei bekannten Diensten) |
| CLI-BULK | `queryResultRows` über Schwelle (z. B. 100.000) oder viele Abfragen pro Minute je Identität | Massenabzug, Arrow ohne Grenze [L2], [L12] | `ExecutionMetrics` | wie oben | warn |
| CLI-NAME-UNTRUSTED | `ApplicationName` deutet auf Bericht, aber `ApplicationContext` ohne Bericht-ID | Name ist clientgesetzt [L11] | SemanticModelLogs | wie oben | warn |
| CLI-MDX | MDX-Abfragen auf Modell, das laut Konzept nur über Apps/Berichte genutzt wird | Excel/Pivot-Zugriff, Logik in Excel | `queryDialect` = 0 [L12] | wie oben | info |
| CLI-EXTERNAL-ACT | `AnalyzedByExternalApplication` / `ConnectFromExternalApplication` je Modell und Nutzer | zweite, unabhängige Spur zu SemanticModelLogs [L13] | Activity-Log | Fabric-Admin | info |
| CLI-NO-MONITORING | Modell wird von Fabric Apps/Agenten genutzt, Workspace des Modells ohne Monitoring | blinder Fleck | Workspace-Einstellungen + Lineage | Workspace-Admin | warn |

### 5.3 Embedding

| ID | Regel | Begründung | Datenquelle | Recht | Grad |
|---|---|---|---|---|---|
| EMB-NO-IDENTITY | Code ruft `GenerateToken` für RLS-Modell ohne `identities` | Master-User: ungefiltert [L5] | App-Code (wie SEC-*) | Repo | fail |
| EMB-NO-AUDIT | `identities` ohne `auditableContext` | Endnutzer fehlt im Audit [L6] | App-Code; Activity-Log `GenerateEmbedToken` | Repo / Admin | warn |
| EMB-XMLA-TOKEN | `xmlaPermissions: ReadOnly` im Token | Token erlaubt XMLA-Lesezugriff [L6] | App-Code | Repo | warn |
| EMB-USERNAME-FROM-CLIENT | `username`/`impersonatedUserName`/`effectiveUsername` aus Request-Parametern übernommen | RLS wird Clientsache [L3] | App-Code (Datenfluss) | Repo | fail |
| EMB-LONG-TOKEN | kein `lifetimeInMinutes` bei Tokens für sensible Modelle | Token im Browser länger gültig [L6] | App-Code | Repo | info |
| EMB-MASTER-USER | App owns data mit Master-User statt SP | unfiltrierte Token möglich, MFA-Probleme [L5] | App-Code/Config | Repo | warn |

### 5.4 Tenant

| ID | Regel | Begründung | Datenquelle | Recht | Grad |
|---|---|---|---|---|---|
| TEN-MATRIX | Schaltermatrix wie 4.1 ausgeben | Transparenz | List Tenant Settings + Overrides [L41] | Fabric-Admin | info |
| TEN-SP-ALL | SP-Schalter für ganze Organisation statt Gruppe | Standard ist offen [L16] | dto. | Fabric-Admin | warn |
| TEN-XMLA-RW | Kapazität mit XMLA Read Write, auf der RLS-Modelle liegen | Schreibweg für Rollen/Modell [L7] | Kapazitätseinstellungen [A: API prüfen] | Kapazitäts-Admin | info/warn |
| TEN-ANON-APPS | anonymer Datenzugriff für Fabric Apps an | öffentliche Daten über URL [L20] | Tenant Settings + rayfin.yml (`anonymous`-Rolle) | Fabric-Admin / Repo | warn, fail mit Modellbezug |
| TEN-AI-EXPORT | Copilot an + Datenverarbeitung außerhalb Region an + Agents in externen Diensten | Antworten verlassen Compliance-Grenze [L27] | Tenant Settings | Fabric-Admin | info |
| TEN-SCHALTER-HINWEIS | Bericht weist bei jedem „aus“ darauf hin, dass Schalter keine Sicherheitsgrenze sind | [L32] | statisch | keins | info |

### 5.5 Agenten und KI

| ID | Regel | Begründung | Datenquelle | Recht | Grad |
|---|---|---|---|---|---|
| AGT-INVENTORY | Data Agents mit Semantikmodell-Quelle auflisten (Modell, Freigabe, veröffentlicht, externe Kanäle) | Agent als eigener Client | Item-Definitionen (Data Agent) [A: Format prüfen] | Workspace-Leser | info |
| AGT-INSTR-SCAN | KI-Anweisungen im Modell (Prep for AI, Beschreibungen, Synonyme) und Agent-Anweisungen auf Steuertext prüfen („ignoriere“, URLs, Markdown-Bilder, Aufforderungen zum Ausgeben) | indirekte Prompt Injection [A], [W3]; MCP liefert diese Metadaten an Agenten [L28] | TMDL/Modelldefinition, Agent-Definition | Repo oder getDefinition | warn |
| AGT-RLS-NONE | Modell ohne RLS als Agent-Quelle für breite Leserschaft | Read genügt, freie Fragen auf alle Zeilen [L25] | Agent + Rechte + RLS | Admin | warn |
| AGT-SP | Agent oder MCP mit SP-Authentifizierung | RLS greift nicht [L28] | Config/Logs | Repo/Logs | fail bei RLS-Modell |

### 5.6 Benötigte Rechte für den Lauf (Zusammenfassung)

* **Ohne Admin** (heutiger Workspace-Modus): App-Code, TMDL, SemanticModelLogs (Leser auf Monitoring-
  Eventhouse), Rechte je Modell nur wo man selbst Admin/Reshare ist [A], Data-Agent-Definitionen im
  eigenen Workspace.
* **Fabric-Admin**: Tenant Settings und Overrides, Scanner mit Nutzerlisten, `GetDatasetUsersAsAdmin`,
  Activity-Log. Für SP-Lauf: „Service principals can access read-only admin APIs“ [L33].
* **Entra/Graph-Leserecht**: Besitzer- und SP-Status (deaktiviert, ausgeschieden), Gruppenmitglieder.
* **Kapazitäts-Admin**: XMLA-Modus je Kapazität.

---

## 6. Offene Punkte (im eigenen Tenant messen)

1. Fingerabdrücke je Client in SemanticModelLogs: `ApplicationName`, `ApplicationContext`, `CallerIpAddress`
   für Fabric-App-Connector, executeQueries, executeDaxQueries, sempy, Excel, DAX Studio, Data Agent,
   gehosteter MCP. Ergebnis als Tabelle in fabscan aufnehmen.
2. Wie erscheint ein SP in `ExecutingUser`/`Identity` (App-ID, Objekt-ID, Name)?
3. Steht `impersonatedUserName` in `User`? Welche Rechte braucht der Aufrufer dafür?
4. Enthält `AnalyzedByExternalApplication` das Feld `EndPoint` noch, und für welche Wege?
5. Schreibt der Fabric-App-Semantikmodell-Connector ein eigenes Activity-Ereignis? Ist `ApplicationName`
   stabil genug, um App und Agent zu unterscheiden?
6. Format der Data-Agent-Definition über `getDefinition` (Anweisungen, Quellen, Kanäle).
7. API für Kapazitäts-XMLA-Modus bei Fabric-Kapazitäten.

---

## 7. Quellen

**Microsoft Learn und REST-Referenz**

* [L1] Datasets · Execute Queries: https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries
* [L2] Execute DAX Queries API, Überblick und Grenzen: https://learn.microsoft.com/power-bi/developer/execute-dax-queries-arrow/overview
* [L3] Execute DAX Queries, Best Practices (Mid-Tier absichern): https://learn.microsoft.com/power-bi/developer/execute-dax-queries-arrow/best-practices
* [L4] Row-level security mit Power BI (SP, dynamische RLS, Workspace-Rollen): https://learn.microsoft.com/fabric/security/service-admin-row-level-security
* [L5] Embed a report with RLS: https://learn.microsoft.com/power-bi/developer/embedded/cloud-rls
* [L6] Embed Token · Generate Token (EffectiveIdentity, auditableContext, xmlaPermissions, lifetimeInMinutes): https://learn.microsoft.com/en-us/rest/api/power-bi/embed-token/generate-token
* [L7] Semantic model connectivity with the XMLA endpoint: https://learn.microsoft.com/fabric/enterprise/powerbi/service-premium-connect-tools
* [L8] Semantic model REST API permissions: https://learn.microsoft.com/power-bi/developer/embedded/datasets-permissions
* [L9] Semantic model permissions: https://learn.microsoft.com/power-bi/connect-data/service-datasets-permissions
* [L10] Build permission for shared semantic models: https://learn.microsoft.com/power-bi/connect-data/service-datasets-build-permissions
* [L11] Semantic model operations (SemanticModelLogs): https://learn.microsoft.com/fabric/enterprise/powerbi/semantic-model-operations
* [L12] Configure Azure Log Analytics for Power BI (Schema, ExecutionMetrics): https://learn.microsoft.com/power-bi/transform-model/log-analytics/desktop-log-analytics-configure
* [L13] Operation list: https://learn.microsoft.com/fabric/admin/operation-list
* [L14] Monitor usage of semantic models in Excel: https://learn.microsoft.com/power-bi/collaborate-share/office-integration/service-monitor-usage-power-bi-datasets-excel
* [L15] Integration tenant settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-integration
* [L16] Developer tenant settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-developer
* [L17] Connect Fabric Apps to Fabric data: https://learn.microsoft.com/fabric/apps/connectors
* [L18] Share a Fabric app: https://learn.microsoft.com/fabric/apps/share-app
* [L19] Create an app connected to a semantic model: https://learn.microsoft.com/fabric/apps/data-apps-template
* [L20] Anonymous data access in Fabric apps: https://learn.microsoft.com/fabric/apps/anonymous-data-access
* [L21] Fabric Apps Functions, externe Ressourcen: https://learn.microsoft.com/fabric/apps/functions-connect-external-resources
* [L22] User data functions, Programmiermodell: https://learn.microsoft.com/fabric/data-engineering/user-data-functions/python-programming-model
* [L23] Read from semantic models with SemPy: https://learn.microsoft.com/fabric/data-science/read-write-power-bi-python
* [L24] Notebooks, Security context: https://learn.microsoft.com/fabric/data-engineering/how-to-use-notebook#security-context-of-running-notebook
* [L25] Data agent sharing and permissions: https://learn.microsoft.com/fabric/data-science/data-agent-sharing
* [L26] Data agent concepts: https://learn.microsoft.com/fabric/data-science/concept-data-agent
* [L27] Copilot and Agent tenant settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-copilot
* [L28] Power BI Consumption MCP server: https://learn.microsoft.com/power-bi/developer/mcp/remote-mcp-server-get-started
* [L29] Power BI Authoring MCP server: https://learn.microsoft.com/power-bi/developer/mcp/power-bi-authoring-mcp
* [L30] Analyze in Excel: https://learn.microsoft.com/power-bi/collaborate-share/office-integration/service-analyze-in-excel
* [L31] Sensitivity labels in Power BI: https://learn.microsoft.com/fabric/enterprise/powerbi/service-security-sensitivity-label-overview
* [L32] About tenant settings (keine Sicherheitsmaßnahme): https://learn.microsoft.com/fabric/admin/about-tenant-settings
* [L33] Admin API tenant settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-admin-api-settings
* [L34] Tenant settings index: https://learn.microsoft.com/fabric/admin/tenant-settings-index
* [L35] Track user activities in Power BI: https://learn.microsoft.com/fabric/enterprise/powerbi/service-admin-auditing
* [L36] Workspace identity: https://learn.microsoft.com/fabric/security/workspace-identity
* [L37] Multitenancy mit Power BI Embedding (SP-Profile): https://learn.microsoft.com/power-bi/guidance/develop-scalable-multitenancy-apps-with-powerbi-embedding
* [L38] Foundry, Fabric-Data-Agent-Tool (Identity Passthrough, kein SP): https://learn.microsoft.com/azure/foundry/agents/how-to/tools/fabric
* [L39] Ontologie-Agent, Responsible AI FAQ (Nichtdeterminismus): https://learn.microsoft.com/fabric/iq/ontology/resources-responsible-ai-faq
* [L40] Log-Analytics-Tabelle PowerBIDatasetsWorkspace: https://learn.microsoft.com/azure/azure-monitor/reference/tables/powerbidatasetsworkspace
* [L41] Tenants · List Tenant Settings (Fabric Admin API): https://learn.microsoft.com/en-us/rest/api/fabric/admin/tenants/list-tenant-settings
* [L42] Admin · Datasets GetDatasetUsersAsAdmin: https://learn.microsoft.com/en-us/rest/api/power-bi/admin/datasets-get-dataset-users-as-admin

**Websuche (Einordnung [A])**

* [W1] Fabric Ideas, Endnutzer-Identität in Embedded-Logs: https://community.fabric.microsoft.com/t5/Fabric-Ideas/Include-User-Identity-in-Power-BI-Embedded-Logs-Especially/idi-p/4773792
* [W2] Community, Nutzerinfo bei MDX-Ereignissen in Log Analytics: https://community.fabric.microsoft.com/t5/Service/Capturing-User-Information-from-MdxQuery-events-in-Log-Analytics/m-p/2334875
* [W3] EchoLeak, Zero-Click-Prompt-Injection in M365 Copilot (Forschungsarbeit): https://arxiv.org/html/2509.10540v1
* [W4] Ankündigung GA executeQueries (Audit-Ereignis, Feld EndPoint; Seite beim Abruf 403, Inhalt nur über Suchtreffer): https://powerbi.microsoft.com/blog/announcing-general-availability-of-the-executequeries-rest-api
