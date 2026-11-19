# 04 · Unabhängige Bewertung der Recherchen und der Vorschläge für fabscan

Stand: 19.11.2026. Grundlage: 01-mslearn.md, 02-praxis.md, 03-clients.md, fabscan-faehigkeiten.md, Quellcode
fabscan 0.5.1 (checks.py, tenant.py, fetch.py, querylog.py, report.py, notebook.py) sowie eigene Stichproben in
Microsoft Learn (MCP-Abruf) und eine Websuche.

Kennzeichnung: **[geprüft]** = von mir heute in Learn nachgelesen. **[nicht geprüft]** = aus den Recherchen
übernommen. **[Einschätzung]** = mein Urteil.

---

## 0. Kurzurteil

1. Die drei Recherchen sind in den Fakten überwiegend richtig. Von den fünf besonders gefragten Behauptungen sind
   drei bestätigt (RLS bei Write, Data Agents mit Read, ApplicationName kommt vom Client), eine ist überzogen
   formuliert (Fabric-App-Connector „verteilt“ Build) und eine bleibt offen (executeQueries im Activity-Log).
2. Schwach sind die Recherchen nicht bei den Fakten, sondern bei den Schlüssen. 01 misst fabscan an einem
   vollständigen Tenant-Audit, 03 schlägt rund 30 neue Regeln vor, davon viele mit fail auf ungemessener Grundlage,
   und 02 erklärt die fabscan-Nische zur „am häufigsten genannten Lücke“, ohne das zählen zu können.
3. fabscan hat genau ein echtes Alleinstellungsmerkmal: Es bewertet den **Inhalt** der DAX-Abfragen von Clients
   außerhalb von Berichten gegen das Modell (rechnet der Client selbst, überschreibt er Measures, hebt er Filter
   auf). Dass Clients sichtbar werden, ist kein Alleinstellungsmerkmal, das leisten die Workspace-Monitoring-
   Vorlagen aus der fabric-toolbox auch.
4. Die wichtigste Ergänzung ist nicht „mehr Themen“, sondern drei Dinge: weniger Fehlalarme, ein Ausnahmeprozess
   mit Trend, und der Rechtebezug nur dort, wo fabscan ohnehin einen Client beobachtet (RLS wirksam oder nicht).
5. Alles, was FUAM, der Govern-Bericht, Purview/Defender oder ein BPA schon liefern, sollte fabscan nicht
   nachbauen.

---

## 1. Qualität der Recherche

### 1.1 Nachgeprüfte Kernbehauptungen

| Behauptung | Ergebnis | Beleg (Learn) | Folge für fabscan |
|---|---|---|---|
| RLS greift nicht bei Write-Recht | **Bestätigt.** Read und Build werden gefiltert, Write nicht. Admin, Member und Contributor haben Write. | „Semantic model permissions“, Abschnitt RLS; „Row-level security with Power BI“ | Tragfähige Grundlage für eine Regel. Zwei Zusätze, die in allen drei Dateien fehlen: Wer bei einem RLS-Modell nur Read oder Build hat und in keiner Rolle ist, sieht **nichts** (kein Leck, sondern Fehlerbild). Und: maßgeblich ist das Recht am Modell, nicht die Workspace-Rolle Viewer. Die Formulierung in 02 („RLS gilt nur für Viewer“) führt zu einer falschen Kennzahl, weil Nutzer mit Direktfreigabe oder App-Zugang ohne Workspace-Rolle ebenfalls gefiltert werden. |
| Fabric-App-Connector vergibt Build | **Nur zur Hälfte.** Belegt ist: Semantikmodell-Connectoren laufen ausschließlich delegiert, jede Abfrage braucht Build des Aufrufers. Belegt ist auch: Direktrechte aus dem Teilen-Dialog sind nicht an die App gebunden. **Nicht** belegt ist eine automatische Vergabe. Der Dialog zeigt verbundene Items, wählt Basisrechte vor, Zusatzrechte wählt der Teilende. | „Connect Fabric Apps to Fabric data“, „Share a Fabric app“ | Der Satz in 03 („jede geteilte Fabric App verteilt Build an alle App-Nutzer“) ist als Mechanismus zu stark, als Konsequenz richtig: Damit die App funktioniert, müssen alle Nutzer Build haben. Wichtiger: Die **Herkunft** eines Rechts ist per API nicht erkennbar. Die Regel ACC-BUILD-VIA-APP ist so nicht prüfbar. Möglich ist nur ein Hinweis im Repo-Modus. |
| executeQueries erscheint im Activity-Log | **Offen.** Die Operation list kennt keine eigene Operation. `AnalyzedByExternalApplication` ist dort nur mit „Generated when users interact with the service“ beschrieben. Das Feld `EndPoint` steht nicht in Learn, die Quelle in 03 war nicht abrufbar, meine Websuche fand keinen Beleg. | „Operation list“ | 01 („keine eigene Operation“) und 03 („vermutlich über EndPoint“) widersprechen sich nicht hart, aber keiner hat es belegt. Kein Feature darauf bauen. Im eigenen Tenant messen (ein Aufruf, 60 Minuten warten, Activity Events ziehen). |
| Data Agents brauchen nur Read | **Bestätigt**, in vier Learn-Seiten gleichlautend, RLS und CLS gelten weiter. | „Data agent sharing“, „Create a Fabric data agent“, „Data agent concepts“ | Die Dramatisierung in 03 („umgeht das Build-Tor“) relativiert Microsoft selbst: Laut „Semantic model permissions“ ist Build „primarily a discoverability feature“, und Read ohne Build „should not be relied upon to secure sensitive data“. Es war also nie eine Schutzgrenze. Zweite Lücke in 03: Data Agents lassen sich inzwischen auch mit Service Principal aufrufen (eigene Learn-Seite). Die Clientlandkarte nennt nur Identity Passthrough. Mit SP gilt wieder das SP/RLS-Problem. |
| ApplicationName ist fälschbar | **Bestätigt als „vom Client geliefert“.** SemanticModelLogs: „populated with the values passed by the application rather than the displayed name of the program“. Log Analytics: „provided by the application and is optional“. | „Semantic model operations“, Tabelle PowerBIDatasetsWorkspace | Für XMLA-Clients ist der Wert frei setzbar. Ob ein REST-Aufrufer (executeQueries) ihn beeinflussen kann, ist nicht dokumentiert, vermutlich setzt ihn dort der Dienst. Ebenfalls nicht dokumentiert: ob ein XMLA-Client `ApplicationContext` setzen kann. Das ist für fabscan heikel, weil `is_report_query` genau über diese beiden Felder Berichtsabfragen ausblendet. |
| Embedding: Master-User ohne Identität sieht alles, SP scheitert | **Bestätigt.** | „Embed a report with RLS“, „Generate an embed token“ | EMB-NO-IDENTITY ist fachlich sauber. |
| SP-Schalter für Fabric-APIs ist für neue Kunden an | **Bestätigt.** | „Developer tenant settings“ | Der Schalter trägt in Learn drei Namen (use Power BI APIs, can call Fabric public APIs, can use Fabric APIs). Immer über `settingName` aus der API abgleichen, nie über den Anzeigenamen. |
| executeDaxQueries (Arrow) ohne feste Zeilengrenze | **Bestätigt.** | „Mastering the Execute DAX Queries REST API“ | Dieselbe Seite verortet den Schalter „Dataset Execute Queries REST API“ unter Developer settings, REST-Referenz und Settings-Index unter Integration. Learn widerspricht sich hier selbst. |

### 1.2 Widersprüche zwischen den drei Dateien

1. **Service Principal: Risiko oder Empfehlung.** 02 sagt (zu Recht), ein SP sei der empfohlene Weg und pauschales
   „SP statt Nutzer“ als fail sei Rauschen. 03 schlägt drei weitere fail-Regeln rund um SP vor (CLI-SP-RLS,
   ACC-SP-WRITE, AGT-SP). 01 empfiehlt SP für die Admin-APIs. Aufzulösen ist das nur über Kontext: SP an sich ist
   info, SP mit Write auf einem RLS-Modell, das Endnutzer bedient, ist der eigentliche Befund.
2. **Was die größte Lücke ist.** 01: Berechtigungsinventur, dann Activity-Log, dann Tenant-Settings. 02:
   Client-Profil je Modell, Berechtigungsinventur nur als Zugabe. 03: Rechte und Schalter. Das sind drei
   verschiedene Produkte. Die Recherchen liefern keine gemeinsame Priorität.
3. **Activity-Log und executeQueries.** Siehe 1.1, 01 und 03 kommen zu unterschiedlichen Vermutungen.
4. **Zahlen zur Latenz.** Activity-Log: 01 „bis 60 min“, 02 „30 Minuten bis 24 Stunden“, 03 „bis 60 Minuten“.
   Für eine Regel irrelevant, für einen Hinweis im Bericht bitte nur „verzögert“ schreiben.
5. **Build als Sicherheitsthema.** 01 (R3) und 03 (R4, „Generalschlüssel“) behandeln breites Build als
   Sicherheitsrisiko. Die von beiden nicht zitierte Learn-Stelle sagt, Read ohne Build schütze ohnehin nicht.
   Build ist damit ein Governance-Thema (wer darf außerhalb der Berichte selbst rechnen), kein Datenschutzbefund.
   Für fabscan passt genau diese Lesart.
6. **RLS-Formulierung.** 01 präzise (Read/Build gegen Write), 02 unpräzise (nur Viewer), 03 präzise. Inhaltlich
   kein Widerspruch, aber 02 würde zu einer falschen Zählung führen.

### 1.3 Schwach belegt, veraltet oder vermutlich falsch

| Aussage | Datei | Urteil |
|---|---|---|
| „Abfragen außerhalb von Berichten sind die am häufigsten genannte, am wenigsten gelöste Lücke“ | 02, 2.3 | **Schwach.** Stützt sich auf wenige Forenthreads und einen Beraterblog, Reddit war nicht abrufbar, eine Zählung gibt es nicht. Das ist der Schluss, den der Auftraggeber hören will. Plausibel ja, belegt nein. |
| „Niemand liefert eine fertige Klassifizierung der Clients“ | 02, 2.3 | **Vermutlich zu stark.** Die Learn-Seite zu SemanticModelLogs verweist selbst auf die Workspace-Monitoring-Dashboards der fabric-toolbox, die Abfragen nach Nutzer und Anwendung auswerten. Was dort fehlt, ist die fachliche Bewertung des DAX. Keine der drei Recherchen hat dieses Werkzeug betrachtet. |
| FUAM: „Engine-Level Insights angekündigt, nicht verfügbar“ | 02, 1.1 | **Nicht geprüft**, möglicherweise überholt. Vor einer öffentlichen Abgrenzung gegen FUAM bitte am Repo nachsehen. |
| Unified Audit Log: Cmdlet 90 Tage | 01, b1 | **Vermutlich veraltet.** Purview Audit Standard bewahrt nach meinem Kenntnisstand seit 2023 für neue Einträge 180 Tage auf. Nicht nachgeprüft, für fabscan ohne Belang. |
| Quellenlage in 02 | 02 | Mehrere Belege sind Herstellertexte, Beraterblogs oder Spiegel (team400.ai, epcgroup, powerbiconsulting, motio, ein Reddit-Spiegel, Patch-Notizen eines Dritten für Measure Killer, ein Skill-Verzeichnis). 02 kennzeichnet das ehrlich. Für eine öffentliche Argumentation taugen davon nur die Learn- und Quellcode-Belege. |
| SOX, DSGVO, ISO 27001, CIS | 02, 1.13 | Allgemeine Ableitungen, keine BI-spezifische Norm, CIS-Inhalt nicht im Detail geprüft. Nicht als Compliance-Abdeckung vermarkten. |
| CLI-SP-RLS: „Treffer heißt also XMLA oder Write“ | 03, 5.2 | **Abgeleitet.** executeQueries unterstützt SP auf RLS-Modellen nicht [geprüft]. Ob executeDaxQueries sich gleich verhält, steht nirgends. Das Microsoft-Tutorial legt den SP sogar als Contributor an. Als fail ungeeignet. |
| Felder `User`, `Identity`, `CallerIpAddress`, `XmlaProperties` als Erkennungsmerkmale | 03, 3.1 | Die Feldbeschreibungen stimmen [geprüft]. Die Zuverlässigkeitsangaben („mittel“, „hoch“) sind Schätzungen. 03 sagt das selbst. Jede Regel darauf ist erst nach Messung zulässig. |
| „12 Mio. Zeilen pro Minute“ | 03, R7 | Rechnerisch richtig, praktisch theoretisch. Als Begründung für eine Schwelle ungeeignet. |
| Prompt Injection über Modellbeschreibungen | 03, R6 | Ehrlich als abgeleitet markiert, kein belegter Fall für Fabric. Eine Textsuche nach „ignoriere“ ist keine Sicherheitsprüfung. |
| MDX gleich Excel | 03 | Brauchbare Heuristik, aber auch paginierte Berichte und Fremdwerkzeuge senden MDX. |
| Fabric Apps (Rayfin) allgemein | 03 | Preview, die Doku nennt Verhalten je CLI-Version (1.36.2). Regeln darauf altern schnell. |

01 ist die sauberste der drei Dateien (fast alles wörtlich aus Learn). Ihre Schwäche ist der Maßstab: Sie listet
den gesamten Microsoft-Governance-Katalog und leitet daraus sechs „größte Lücken“ ab, die fabscan zu einem
zweiten FUAM machen würden.

### 1.4 Was alle drei übersehen

1. **Mitbestimmung und Datenschutz der Auswertung selbst.** Eine Auswertung „welche Person fragt was ab“ ist in
   Deutschland eine technische Einrichtung zur Verhaltens- und Leistungskontrolle. Ohne Pseudonymisierung und
   Zweckbindung scheitert der Einsatz am Betriebsrat, nicht an der Technik. 01 und 02 erwähnen nur, dass die
   Monitoring-Daten sensibel sind.
2. **Excel bleibt ungeprüft.** Der verbreitetste Client außerhalb von Berichten sendet MDX. fabscan zählt MDX nur
   (LIN-MDX, info). Keine Recherche benennt das als größte fachliche Lücke im Kern.
3. **Abdeckung.** Workspace Monitoring muss je Workspace eingeschaltet sein, kostet Kapazität und existiert nur
   auf Fabric- oder Premium-Kapazität. Wie viel des Tenants fabscan gar nicht sieht, ist die erste Frage jedes
   Prüfers. 03 streift das unter „blinde Flecken“.
4. **Produktiv gegen Entwicklung.** 02 erwähnt es in einem Satz. Ohne diese Unterscheidung ist jede Regel zu
   Write-Rechten ein Fehlalarmgenerator.

### 1.5 Nebenbefunde am fabscan-Code (relevant für die Bewertung)

* `fetch.py` ruft die Scanner-API mit `datasetSchema` und `datasetExpressions`, aber ohne `getArtifactUsers=true`.
  Die Rechte je Modell und Workspace (inklusive ReadWrite, ReadExplore) wären im Admin-Modus mit einem Parameter
  zu haben. Das macht die RLS-Wirksamkeit billig.
* Der Leser-Weg nutzt INFO.VIEW über executeQueries. Die REST-Referenz sagt wörtlich, INFO-Funktionen würden nicht
  unterstützt [geprüft]. Es funktioniert offenbar, ist aber undokumentiert und kann ohne Ankündigung brechen.
* Laut Learn sind Semantikmodell-Connectoren nur delegiert möglich. Der Zweig „SEC-AUTH fail bei
  fabric-semanticmodel mit App-Identität“ im Repo-Modus kann damit derzeit nicht auslösen.
* `tenant.py` vergibt SEC-AUTH als fail, sobald alle Aufrufer Service Principals sind, unabhängig davon, ob das
  Modell RLS hat. Das ist der von 02 beschriebene Fehlalarm.
* `is_service_principal` wertet jede Identität ohne „@“ als SP. Systemidentitäten des Dienstes würden mitgezählt.
* Das KQL liest weder `User` noch `Identity`, `Status` oder die ExecutionMetrics. Massenabzug und Impersonation
  sind ohne KQL-Erweiterung nicht prüfbar.
* Je Client werden höchstens 400 verschiedene Abfragetexte behalten, der Rest fällt still weg. Abfragen mit
  wechselnden Literalen füllen diese Grenze schnell. Der Bericht sollte das ausweisen.
* SEC-HIDDEN nimmt Sortier- und Schlüsselspalten nicht aus, der Hinweistext räumt das selbst ein.

---

## 2. Bedarf je Zielgruppe

| Zielgruppe | Muss | Schön zu haben | Wer liefert es heute |
|---|---|---|---|
| **Fabric-Admin** | Inventar mit Besitzern. Activity-Log gesichert über 28 Tage hinaus. Tenant-Schalter als Snapshot mit Änderungsnachweis. Wer ist Workspace-Admin, verwaiste Workspaces. Publish to web und org-weite Links. Kapazitätslast. | Ungenutzte Inhalte, Dubletten, Namenskonventionen, Lizenzmix, Gateway-Hygiene. | FUAM, Govern-Bericht, Capacity Metrics. fabscan trägt nur bei: welche Wege außerhalb von Berichten sind offen und werden tatsächlich genutzt. |
| **Security und Compliance** | Wer kann welche Daten über welchen Weg sehen. Greift RLS für die, für die sie gedacht ist. Technische Identitäten mit breitem Zugriff. Externe und öffentliche Freigaben. Nachweis, dass geprüft wurde, einschließlich dessen, was nicht geprüft werden konnte. Ausnahmen mit Begründung. | Label-Abdeckung, DLP-Treffer, Anomalien bei Export, Label-Downgrades. | Purview, Defender, Scanner-API. fabscan kann als einziges zeigen: dieser Client fragt dieses RLS-Modell mit dieser Identität ab, und die Identität wird nicht gefiltert. |
| **Modell-Verantwortliche** | Wer fragt mein Modell wie ab (Client, Identität, Menge). Wo wird meine Kennzahl außerhalb des Modells neu oder anders gerechnet. Welche Felder und Measures hängen an externen Clients (bricht etwas, wenn ich umbenenne). Wer hat Write auf mein RLS-Modell. | Performance je Client, ungenutzte Measures, BPA-Qualität. | Für die ersten drei Punkte: niemand außer fabscan. Für den Rest Measure Killer, BPA, Workspace-Monitoring-Vorlagen. |
| **Entscheider** | Drei bis fünf Aussagen in Klartext: Gilt die eine Zahl noch. Sieht jemand, was er nicht sehen soll. Was ist zu tun, von wem, bis wann. Wird es besser oder schlechter. | Reifegrad, Vergleich mit anderen Organisationen, eine Gesamtnote. | Der fabscan-Bericht ist hier schon nah dran („Das Wichtigste“), es fehlen Trend und Maßnahmenliste. |

Gemeinsamer Nenner aller vier: Befund, Begründung, Maßnahme, Verantwortlicher. Zahlen ohne Handlung will
niemand (das sagt auch Microsoft ausdrücklich in der Auditing-Reihe).

---

## 3. Bewertung der Vorschläge (zusammengeführt, dedupliziert)

Nutzen und Aufwand 1 (gering) bis 5 (hoch). FA = Fehlalarm-Risiko. „Kern“ = Clients außerhalb von Berichten,
„rechnet die App selbst?“.

| # | Vorschlag (Herkunft) | Nutzen | Aufwand | FA | Recht | Datenquelle | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | Client-Klassifizierung je Modell: Bericht, Excel, REST, XMLA-Werkzeug, Notebook, Agent, App (02 Nr. 1, 03 CLI-INVENTORY) | 5 | 3 | mittel | Leser auf Monitoring-Eventhouse | SemanticModelLogs | **Kern, bauen.** Nur mit vorheriger Messung der Fingerabdrücke und mit Vertrauensstufe je Zuordnung. |
| 2 | Fehlalarme senken: SEC-AUTH nach Kontext abstufen, SEC-HIDDEN-Ausnahmen, SEC-NO-RLS an Kontext koppeln (02 Nr. 2 und 3) | 4 | 2 | senkt FA | keins | vorhandene Daten, TMDL (Sortierspalte, Beziehungen) | **Kern, sofort.** Im Scanner-Modus fehlen Sortierangaben, dort Hinweis statt Befund. |
| 3 | Ausnahmen mit Begründung, im Bericht als „bewusst akzeptiert“ (02 Nr. 4) | 5 | 2 | niedrig | keins | Allowlist-Datei, stabile Befund-ID | **Kern, sofort.** Voraussetzung für jeden Trend. |
| 4 | RLS-Wirksamkeit: Write auf RLS-Modell, davon Service Principals (01 Abl., 03 ACC-WRITE-RLS, ACC-SP-WRITE) | 5 | 2 bis 3 | mittel, hoch ohne Unterscheidung Produktiv/Entwicklung | Fabric-Admin (Scanner) oder Workspace-Rolle zum Lesen der Rollen | Scanner mit `getArtifactUsers`, Workspace-Rollen-API, RLS aus TMDL | **Bauen, aber begrenzt** auf Modelle mit beobachteten Clients. Gruppen werden ohne Graph nicht aufgelöst, das offen sagen. |
| 5 | Beobachteter SP fragt RLS-Modell ab (03 CLI-SP-RLS) | 4 | 1 | mittel | wie 1 | Logs plus RLS-Info | **Kern, bauen** als warn mit Allowlist, nicht als fail. Ersetzt das heutige pauschale SEC-AUTH im Tenant-Modus. |
| 6 | Abdeckung und blinde Flecken: Modelle ohne Monitoring, Modelle ohne lesbare Rollen, abgeschnittene Abfragen (03 CLI-NO-MONITORING, 4.3 Nr. 6) | 4 | 2 | niedrig | Workspace-Mitglied | Workspace- und Item-Listen, eigene Laufdaten | **Kern, bauen.** Glaubwürdigkeit des ganzen Berichts hängt daran. |
| 7 | Massenabzug: Ergebniszeilen und Abfragefrequenz je Identität (03 CLI-BULK) | 4 | 2 | mittel | wie 1 | ExecutionMetrics | **Bauen** als Kennzahl im Clientprofil, Befund nur relativ zur Modellgröße. |
| 8 | MDX-Anteil je Modell (03 CLI-MDX) | 3 | 1 | niedrig | wie 1 | vorhanden | **Bauen** als Kennzahl. MDX nicht parsen. |
| 9 | Zwei Sichten, Ampel je Thema, Maßnahmenliste, Trend (02 Nr. 5) | 5 | 3 | entfällt | keins | Delta-Tabelle, befunde.json | **Kern, bauen.** |
| 10 | Rayfin: anonyme Datenrolle erkennen (03 TEN-ANON-APPS, Teil Repo) | 4 | 1 | niedrig | Repo | rayfin.yml | **Kern, sofort.** |
| 11 | Rayfin: Hinweis „delegierter Modell-Connector heißt Build für alle Nutzer“ und „application-Connector läuft als Item-Besitzer“ (03 R4, R10) | 3 | 1 | niedrig | Repo | rayfin.yml | **Bauen** als info-Text. Mehr ist nicht prüfbar. |
| 12 | Endorsement und Sensitivity Label der abgefragten Modelle als Kontextspalte (02 Nr. 6) | 3 | 1 | niedrig | Fabric-Admin | Scanner (Endorsement wird schon gelesen) | **Bauen** als Spalte und zur Gewichtung, keine eigene Abdeckungsstatistik. |
| 13 | Schaltermatrix der Clientwege (01 Abl., 03 TEN-MATRIX, TEN-SP-ALL) | 3 | 2 | niedrig | Fabric-Admin | List Tenant Settings | **Rand, optional.** Nur die rund zehn Schalter der Wege, kein Soll-Ist über alle Schalter. Immer mit dem Satz „Schalter sind keine Sicherheitsgrenze“. |
| 14 | Build-Reichweite je Modell (01 R3, 03 ACC-BUILD-WIDE) | 3 | 2 | hoch als Befund | Fabric-Admin | Scanner | **Nur als Kennzahl** („so viele dürfen außerhalb der Berichte selbst rechnen“), nicht als Sicherheitsbefund. |
| 15 | Impersonation: `User` ungleich `ExecutingUser` (03 CLI-IMPERSONATE) | 3 | 2 | hoch bis gemessen | wie 1 | Logs | **Erst messen**, dann entscheiden. |
| 16 | Embedding- und Mid-Tier-Code: Token ohne Identität, Nutzername aus der Anfrage (03 EMB-NO-IDENTITY, EMB-USERNAME-FROM-CLIENT, 02 1.10) | 4 | 3 bis 4 | mittel | Repo | App-Code | **Später.** Passt zum Repo-Modus, ist aber ein zweiter App-Typ. Nur diese zwei Regeln lohnen. |
| 17 | Übrige Embedding-Regeln (EMB-NO-AUDIT, EMB-XMLA-TOKEN, EMB-LONG-TOKEN, EMB-MASTER-USER) | 2 | 3 | mittel | Repo | App-Code | Nicht bauen. |
| 18 | Data Agents als Inventar und Rechteabgleich (03 AGT-INVENTORY, AGT-RLS-NONE, ACC-READ-ONLY-AGENT, AGT-SP) | 3 | 4 | unklar | Workspace-Leser, teils Admin | Item-Definition (Format undokumentiert) | **Später.** Zuerst Agenten als Client in den Logs erkennen (Teil von Nr. 1). |
| 19 | Textsuche nach Prompt Injection in Modellmetadaten (03 AGT-INSTR-SCAN) | 1 | 3 | hoch | Repo | TMDL | Nicht bauen. Scheinsicherheit. |
| 20 | `ApplicationName` deutet auf Bericht, Kontext fehlt (03 CLI-NAME-UNTRUSTED) | 2 | 2 | hoch | wie 1 | Logs | Nicht als Regel. Stattdessen Vertrauensstufe in Nr. 1. |
| 21 | Build stammt aus App-Freigabe (03 ACC-BUILD-VIA-APP) | 2 | 4 | hoch | Admin | nicht ermittelbar | Nicht bauen (siehe 1.1). |
| 22 | Activity-Log-Auswertung: Export, Teilen, externe Zugriffe, Embed-Token, Setting-Änderungen (01 Lücke 2, 02 Nr. 6, 03 CLI-EXTERNAL-ACT) | 4 allgemein, 2 für fabscan | 4 | mittel | Fabric-Admin | Activity Events, eigene Historie | **FUAM überlassen.** fabscan verweist darauf. |
| 23 | Vollständige Berechtigungsinventur: Freigaben, App-Zielgruppen, Org-Links, Publish to web, Reshare (01 Lücke 1) | 4 allgemein | 5 | mittel | Fabric-Admin | Scanner, Admin-APIs | **FUAM und Govern überlassen.** |
| 24 | Label-Abdeckung, Label-Ereignisse, DLP (01 Lücke 4) | 3 allgemein | 4 | niedrig | Admin, Purview | Scanner, Purview | Govern-Bericht und Purview überlassen. |
| 25 | Datenquellen, Gateways, Credentials, ungenutzte Inhalte, Kapazität (01 Lücke 5) | 3 allgemein | 5 | hoch bei „ungenutzt“ | diverse Admin-Rollen | diverse | Nicht bauen. |
| 26 | Identitäten: SP in Admin-API-Gruppen, Workspace Identities, ausgeschiedene Besitzer, Pipeline-Identität (01 Lücke 6, 03 ACC-STALE-OWNER, ACC-PIPELINE-IDENTITY) | 3 | 4 | mittel | Admin plus Graph | Graph, Job Scheduler | Nicht bauen. Graph-Rechte sprengen den Anspruch „läuft ohne Admin“. |
| 27 | RLS-Qualitätsregeln im Modell (02 1.6) | 2 | 3 | mittel | Modellzugriff | TMDL | **BPA überlassen**, im Bericht darauf verweisen. |
| 28 | Kapazität mit XMLA Read Write (03 TEN-XMLA-RW) | 2 | 3 | niedrig | Kapazitäts-Admin | API unklar | Nicht bauen. |
| 29 | Modellstände zwischen Läufen vergleichen, etwa geänderte RLS-Rollen (03 R12) | 3 | 3 | niedrig | wie Modellabruf | eigene Laufdaten | Später, fällt mit dem Trend fast ab. |
| 30 | Reifegrad 100 bis 500 als Bewertung (02 Nr. 5) | 2 | 1 | entfällt | keins | entfällt | Nicht übernehmen. fabscan sieht einen Ausschnitt, eine Reifegradzahl wäre Scheingenauigkeit. |

---

## 4. Positionierung

### Wo fabscan heute allein steht

* **Inhaltliche Prüfung der Abfragen außerhalb von Berichten gegen das Modell.** DEFINE MEASURE, überschriebene
  Measures, ALL und REMOVEFILTERS, Rohdaten statt Measures, Rechnen im TypeScript. Kein BPA führt Abfragen aus,
  FUAM und Govern sehen kein DAX, die Monitoring-Vorlagen zeigen DAX nur als Text.
* **Code und Wirklichkeit zusammen.** Repo-Modus (was die App tun soll) und Log-Modus (was tatsächlich ankam)
  im selben Regelwerk.
* **Läuft ohne Admin-Rechte**, nur lesend, ohne Abhängigkeiten, mit Bericht in Klartext. Für Berater und für
  Modell-Verantwortliche ohne Tenant-Rolle ist das ein praktischer Vorteil gegenüber FUAM.
* **Fabric Apps (Rayfin)** kennt sonst kein Werkzeug. Das ist früh, aber die Nische ist klein und in Preview.

### Wo fabscan schwach ist

* Es beantwortet „was tut der Client“, aber nicht „wer darf das und mit welcher Folge“. Ohne Rechtebezug bleibt
  jeder Sicherheitsbefund eine Vermutung.
* Excel, der häufigste Client außerhalb von Berichten, wird nicht geprüft.
* Die Client-Erkennung hängt an Feldern, die der Client liefert. Standardmäßig werden Berichtsabfragen
  ausgeblendet. fabscan ist damit ein Werkzeug für kooperative Umgebungen, kein forensisches.
* Schweregrade sind nicht risikobasiert (SP gleich fail).
* Kein Ausnahmeprozess, kein Trend im Bericht, keine Maßnahmenliste mit Verantwortlichen.
* Abhängig von Workspace Monitoring je Workspace und von undokumentiertem Verhalten (INFO.VIEW über
  executeQueries).

### Was ein erfahrener Governance-Verantwortlicher kritisieren würde

1. „Wie viel meines Tenants haben Sie überhaupt gesehen?“ Der Bericht nennt keine Abdeckung.
2. „Das Modell hat RLS, schön. Für wen gilt sie nicht?“ Diese Frage bleibt offen.
3. „Service Principal ist bei uns Vorgabe, warum ist das rot?“ Der erste Fehlalarm kostet das Vertrauen in alle
   weiteren Befunde.
4. „Wo trage ich ein, dass wir das geprüft und akzeptiert haben?“ Ohne das meldet jeder Lauf dasselbe.
5. „Sie werten Abfragen je Person aus. Hat der Betriebsrat zugestimmt, wo liegen die Ergebnisse, wer liest sie?“
   befunde.json und der HTML-Bericht enthalten Nutzerkennungen und Abfragetext.
6. „Excel fehlt.“
7. „Ein Mustervergleich auf DAX-Text ist kein Parser.“ Parametrisierte, erzeugte oder verschachtelte Abfragen
   können durchrutschen, und nach 400 Texten je Client wird abgeschnitten.
8. „Ein Werkzeug einer Einzelperson auf Preview-Funktionen. Wer pflegt das in zwei Jahren?“
9. „Warum sollte ich das neben FUAM betreiben?“ Die Antwort muss ein Satz sein: FUAM zeigt, was es gibt und was
   geschieht, fabscan zeigt, ob außerhalb der Berichte anders gerechnet oder an der Zeilensicherheit vorbei
   gelesen wird.

---

## 5. Empfehlung

### 5.1 Roadmap (zehn Punkte, in dieser Reihenfolge)

| # | Was | Warum | Datenquelle und Recht | Aufwand |
|---|---|---|---|---|
| 1 | **Fehlalarme senken.** SEC-AUTH: SP allein ist info, warn erst bei RLS-Modell. SEC-HIDDEN: Sortier-, Schlüssel-, Hierarchiespalten ausnehmen. SEC-NO-RLS: nur bei breitem Leserkreis oder vertraulich klingenden Feldern über info. `is_service_principal` schärfen. | Ohne das überlebt fabscan den ersten Termin bei einem Governance-Team nicht. | Vorhandene Daten, kein neues Recht | klein |
| 2 | **Ausnahmen mit Begründung und stabile Befund-ID.** Datei im Repo oder im Lakehouse, Bericht zeigt „bewusst akzeptiert“ mit Datum und Verantwortlichem. | Voraussetzung für Trend und für jede Wiederholung des Laufs. | Keins | klein bis mittel |
| 3 | **Abdeckung ausweisen.** Workspaces und Modelle mit und ohne Monitoring, Modelle ohne lesbare Rollen, Anteil geprüfter Abfragen (MDX, abgeschnittene Texte). | Ehrlichkeit über blinde Flecken ist das stärkste Argument gegenüber Prüfern. | Workspace- und Item-Listen, Workspace-Mitglied | klein |
| 4 | **Fingerabdrücke messen, dann Clients klassifizieren.** Im eigenen Tenant je Weg (Fabric App, executeQueries, Arrow, Semantic Link, Excel, DAX Studio, Data Agent, MCP) `ApplicationName`, `ApplicationContext`, Identitätsform, Dialekt festhalten. Zuordnung mit Vertrauensstufe (vom Dienst gesetzt, vom Client behauptet, unbekannt). | Kern des Werkzeugs. Ohne Messung sind alle Client-Regeln aus 03 Vermutungen. Dabei auch die offene Frage zum Activity-Log klären. | SemanticModelLogs, Leser auf Eventhouse | mittel |
| 5 | **KQL erweitern.** `User`, `Identity`, `Status`, Ergebniszeilen aus ExecutionMetrics. Daraus Kennzahlen je Client: Abfragen, Identitäten (Personen, SP), Ergebnismenge, MDX-Anteil, Fehlerquote. | Liefert Massenabzug und SP-Erkennung, macht den Clientsteckbrief für Modell-Verantwortliche brauchbar. | Wie 4 | klein bis mittel |
| 6 | **RLS-Wirksamkeit für beobachtete Modelle.** „Modell hat RLS, N Identitäten mit Write werden nicht gefiltert, davon M Service Principals, davon K fragen tatsächlich ab.“ Produktiv und Entwicklung über Konvention oder Konfiguration unterscheiden. | Die eine Rechtefrage, die direkt zum Kern gehört und die alle drei Recherchen nennen. | Admin: Scanner mit `getArtifactUsers=true`. Ohne Admin: Rollen des Workspaces, soweit lesbar. RLS aus TMDL | mittel |
| 7 | **Bericht umbauen.** Ampel je Thema, Maßnahmenliste, Trend gegen Vorlauf (siehe 5.3). Option zur Pseudonymisierung der Nutzerkennungen. | Entscheider und Betriebsrat. | Delta-Tabelle `fabscan_findings` um Lauf-ID und Befund-ID ergänzen | mittel |
| 8 | **Rayfin-Regeln nachziehen.** Anonyme Datenrolle, Hinweis zur Build-Folge des delegierten Modell-Connectors, Hinweis zur Besitzer-Identität bei application-Connectoren. | Billig, im Kern, sonst von niemandem geprüft. | rayfin.yml, Repo | klein |
| 9 | **Kontextspalten und optionale Schaltermatrix.** Endorsement und Label je abgefragtem Modell. Mit Admin-Recht die rund zehn Schalter der Clientwege anzeigen, ohne Bewertung als Sicherheitsgrenze. | Gewichtung der Befunde (zertifiziertes Modell wiegt schwerer), Antwort auf „welche Wege sind offen“. | Scanner, List Tenant Settings, Fabric-Admin | klein bis mittel |
| 10 | **Zweiter App-Typ: Embedding und Mid-Tier im Repo-Modus** (Token ohne Identität bei RLS-Modell, Nutzername aus der Anfrage). Danach Excel: MDX wenigstens auf berechnete Elemente und abgefragte Measures auswerten. Data Agents erst, wenn Punkt 4 zeigt, dass sie im Log erkennbar sind. | Erweitert den Kern auf die verbreiteteren Clients, ohne das Thema zu verlassen. | App-Code, Logs | groß |

### 5.2 Drei Dinge, die fabscan bewusst nicht tun sollte

1. **Kein Tenant-Inventar und kein Activity-Log-Archiv.** Berechtigungsinventur über alles, Freigaben, Labels,
   Gateways, ungenutzte Inhalte, Kapazität: Das leisten FUAM und der Govern-Bericht, mit Admin-Rechten, die
   fabscan gerade nicht voraussetzen will. Im Bericht darauf verweisen.
2. **Keine Modell-BPA und keine Gesamtnote.** Modellqualität gehört Tabular Editor und Semantic Link Labs. Eine
   einzelne Zahl oder ein Reifegrad würde eine Vollständigkeit behaupten, die fabscan nicht hat.
3. **Keine Angriffserkennung versprechen.** Keine Prompt-Injection-Suche, keine Anomalie-Alarme, keine Aussage
   „Client gibt sich als Bericht aus“. Die Felder kommen vom Client, die Daten sind verzögert, und für Echtzeit
   gibt es Defender und Purview. fabscan prüft Governance in kooperativen Umgebungen und sollte das so sagen.

### 5.3 Darstellung im Bericht

**Kopf: Abdeckung zuerst.** „Geprüft: 14 von 37 Workspaces (nur diese haben Monitoring), 22 Modelle, 9 Clients,
Zeitraum 14 Tage, 3 Prozent der Abfragen waren MDX und wurden nicht geprüft.“ Danach erst Befunde.

**Ampel je Thema, nie eine Gesamtnote.** Fünf Themen, je Modell und je Client eine Zeile:

| Thema | Frage in Klartext | Rot wenn | Gelb wenn | Grau wenn |
|---|---|---|---|---|
| Eine Zahl | Rechnet der Client Kennzahlen selbst oder verändert er sie? | Measure überschrieben, Kennzahl mit Modellnamen anders gerechnet | Eigene Kennzahlen, Rohdaten statt Measures, Filter aufgehoben | nur MDX, nicht prüfbar |
| Zeilensicherheit | Greift RLS für diesen Client? | Identität mit Write oder SP fragt RLS-Modell ab und bedient Endnutzer | Modell ohne RLS bei breitem Leserkreis, Filter nach Nutzer im Browser | Rollen nicht lesbar (Leser-Weg) |
| Datenweg | Kommt alles aus dem Modell? | Feld oder Tabelle fehlt, Quelle am Modell vorbei mit App-Identität | lokale Dateien, unbekannte Referenzen | kein Modell zugeordnet |
| Abfluss | Wie viel geht raus und wohin? | Geheimnis im Code, anonyme Datenrolle, Abruf an fremde Server mit Daten | große Ergebnismengen, Browser-Speicher | keine Mengenangaben im Log |
| Vertrauen in die Zuordnung | Wie sicher ist, wer der Client ist? | entfällt | Zuordnung nur über den vom Client gelieferten Namen | unbekannter Client |

Grau („nicht prüfbar“) als vierter Zustand ist wichtig. Grün darf nur heißen: geprüft und unauffällig.
Schweregrad eines Befunds mit dem Kontext gewichten (zertifiziertes Modell, Label, Leserkreis, Produktiv).

**Maßnahmenliste statt Befundliste.** Je Zeile: Was ist los (ein Satz), warum es wichtig ist (ein Satz), nächster
Schritt, wer (Modell-Besitzer aus dem Scanner, sonst Workspace), grober Aufwand, Status (neu, offen seit Lauf X,
bewusst akzeptiert mit Begründung, behoben). Gleichartige Befunde je Modell zu einer Maßnahme bündeln. Das
entspricht dem Muster „Insight plus Recommended Action“ aus dem Govern-Bereich, das Admins schon kennen.

**Trend als Veränderung, nicht als Zählerstand.** „Seit dem letzten Lauf: 3 neu, 5 behoben, 12 unverändert,
2 akzeptiert.“ Dazu je Thema eine kleine Zeitreihe der roten und gelben Zeilen über die letzten Läufe. Absolute
Befundzahlen sind irreführend, weil sie mit der Abdeckung wachsen. Deshalb die Abdeckung im Trend mitführen.
Neue Clients und verschwundene Clients eigens ausweisen, das ist für Modell-Verantwortliche die wertvollste
Zeile.

**Zwei Sichten aus denselben Daten.** Seite 1 für Entscheider (Abdeckung, Ampel, drei wichtigste Maßnahmen,
Trend). Dahinter die Technikersicht mit Regel-ID, Abfragetext, Fundstelle, Vertrauensstufe und dem Hinweis,
welche Recherche-Annahme der Regel zugrunde liegt. Nutzerkennungen in der Entscheidersicht nie, in der
Technikersicht nur auf Wunsch im Klartext.

---

## 6. Vor der Umsetzung im eigenen Tenant zu messen

1. Wie erscheinen Fabric-App-Connector, executeQueries, executeDaxQueries, Semantic Link, Excel, DAX Studio, Data
   Agent und gehosteter MCP in `ApplicationName`, `ApplicationContext`, `ExecutingUser`, `User`, `Identity`?
2. Kann ein XMLA-Client `ApplicationContext` mit einer Bericht-ID setzen?
3. Schreibt executeQueries ein Activity-Ereignis, und trägt es ein Feld `EndPoint`?
4. Lässt sich ein RLS-Modell von einem SP mit Contributor-Rolle über executeDaxQueries abfragen, und was steht
   dann im Log?
5. Liefert die Scanner-API mit `getArtifactUsers=true` Write-Rechte je Modell so, dass Workspace-Rolle und
   Direktrecht unterscheidbar sind?
6. Bleibt INFO.VIEW über executeQueries stabil (heute entgegen dem Wortlaut der REST-Referenz nutzbar)?
