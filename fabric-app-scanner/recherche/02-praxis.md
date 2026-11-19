# Was Praktiker von einem Governance-Scanner erwarten (Recherche 19.11.2026)

Bezug: fabscan 0.5.1 (siehe `fabscan-faehigkeiten.md`). Zielgruppe der Recherche: Power-BI-/Fabric-Admins,
CoE-Leads, Security- und Governance-Berater, Auditoren.

**Legende zur Einschätzung**

- Verbreitung: *Standard* (in Microsoft-Leitfäden und praktisch allen Werkzeugen), *verbreitet* (mehrere
  unabhängige Quellen), *vereinzelt* (eine Quelle oder Nische).
- Belastbarkeit: *hoch* (Microsoft Learn, Quellcode, mehrere unabhängige Fachquellen), *mittel* (Fachblog,
  Community-Forum, plausibel und nicht widersprochen), *niedrig* (Herstellerwerbung, Einzelstimme,
  KI-generierte Leitfäden).

**Grenzen der Recherche:** Reddit (r/PowerBI, r/MicrosoftFabric) war für das Abrufwerkzeug gesperrt; Stimmen von
dort kommen nur indirekt über Suchtreffer an. Pain Points stammen deshalb überwiegend aus dem Fabric-Community-Forum,
Fachblogs und Microsoft-Leitfäden. Einige Forenseiten lieferten 403. Für ISO 27001 fand sich keine BI-spezifische
Quelle; dazu nur allgemeine Ableitungen.

---

## 1. Welche Kennzahlen und Auswertungen gelten als Standard?

Der maßgebliche Referenzrahmen ist die Microsoft-Reihe „Power BI implementation planning: Auditing and monitoring“.
Sie listet die Fragen, die ein Tenant-Audit beantworten soll, und FUAM, der OneLake-Catalog-Govern-Bericht und die
Drittanbieter (Rencore, Measure Killer, Power BI Sentinel) decken jeweils Teilmengen davon ab.

### 1.1 Inventar

- Workspaces mit dem meisten Inhalt, Item-Typen je Workspace, Abhängigkeiten und Lineage bis zu externen Quellen,
  Verhältnis Semantikmodelle zu Berichten, doppelte oder ähnliche Modelle, Trend der Anzahl über die Zeit.
  Quelle: https://learn.microsoft.com/en-au/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-tenant-level-auditing
  Einschätzung: Standard, hoch.
- Ein hohes Verhältnis Modelle zu Berichten (viele Modelle, die nur einen Bericht bedienen) gilt als Reifegrad-100-
  Symptom: fehlende Wiederverwendung, Doppelpflege, widersprüchliche Zahlen.
  Quelle: https://learn.microsoft.com/power-bi/guidance/fabric-adoption-roadmap-content-ownership-and-management#maturity-levels
  Einschätzung: Standard, hoch.
- FUAM sammelt Tenant-Settings (auch delegierte), Workspaces, Kapazitäten, Scanner-API-Metadaten, Activity-Logs,
  Capacity Metrics, Refreshables und Git-Verbindungen; „Engine-Level Insights“ sind angekündigt, aber nicht verfügbar.
  Quelle: https://github.com/microsoft/fabric-toolbox/tree/main/monitoring/fabric-unified-admin-monitoring
  Einschätzung: verbreitet (FUAM ist de facto der Community-Standard für Tenant-Monitoring), hoch.
- Der Govern-Bericht im OneLake-Katalog bündelt Inventar, Kapazitäten, Domänen, Feature-Nutzung, Aktivitäten,
  Freigaben, Endorsement, Kuratierung (Beschreibungen), Sensitivity-Label-Abdeckung und DLP.
  Quelle: https://learn.microsoft.com/fabric/governance/onelake-catalog-govern ,
  https://learn.microsoft.com/fabric/admin/monitoring-workspace
  Einschätzung: Standard (eingebaut), hoch; Daten aber nur einmal täglich aktualisiert.

### 1.2 Nutzung

- Meistgesehene Inhalte und ihre Betrachter, Tages-/Wochen-/Monatstrends, aktive Nutzer, Browser vs. Mobil,
  wer was wann veröffentlicht oder ändert, **Anteil der Berichtsaufrufe auf zertifizierten Modellen**, Anteil Modelle
  mit mehr als einem Bericht.
  Quelle: Tenant-Level-Auditing (URL oben). Einschätzung: Standard, hoch.
- Für Datenitems (Semantikmodelle) empfiehlt Microsoft ausdrücklich, **Abfragen** statt Aufrufe zu zählen, Trends
  gegen Vorperioden zu prüfen und „potenzielle vs. tatsächliche Betrachter“ zu vergleichen (viele Berechtigte, wenige
  Nutzer). Ersteller, Owner und Support-Personen sollen aus der Nutzerzählung herausgefiltert werden.
  Quelle: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-content-lifecycle-management-retire-archive
  Einschätzung: Standard, hoch. Für fabscan relevant: genau diese Abfragesicht hat fabscan über SemanticModelLogs.
- Zeitfenster für „ungenutzt“: Microsoft nennt 3 Monate als Standard, 1 Monat für operative Tagesberichte, über 1 Jahr
  für jährliche Prüfer-Modelle und eine Ausnahme ohne Zeitfenster für selten genutzte Vorstands-Scorecards. Die
  Admin-API „Get Unused Artifacts“ sieht nur 30 Tage. Rencore markiert Workspaces nach 30 Tagen ohne Aktivität.
  Quellen: Retire-Leitfaden (oben), https://docs.rencore.com/governance/reference/policies/powerbi
  Einschätzung: Standard, hoch.

### 1.3 Verwaiste Inhalte und Eigentümerschaft

- Berichte ohne Semantikmodell, Modelle ohne Bericht, Workspaces ohne Admin, Inhalte, deren Owner das Unternehmen
  verlassen hat (Refresh scheitert, „Takeover“ nötig). Community-Empfehlung: mindestens zwei gültige Workspace-Admins,
  Dienstkonten statt persönlicher Konten für Refresh.
  Quellen: Tenant-Level-Auditing (oben), https://docs.rencore.com/governance/reference/policies/powerbi ,
  https://community.fabric.microsoft.com/t5/Service/Dataset-Refreshes-Fail-when-Ownership-Account-is-Disabled/m-p/4337338 ,
  https://powerbi.microsoft.com/en-us/blog/announcing-my-workspace-governance-improvement-public-preview/
  Einschätzung: Standard, hoch.

### 1.4 Berechtigungen

- Welche Berichte kann ein Nutzer, eine Gruppe oder ein Service Principal sehen; Workspace-Rollen; App-Zielgruppen;
  Item-Berechtigungen auf Berichte und Modelle; Modelle mit RLS; wer über Deployment Pipelines veröffentlichen darf;
  wer Gateways, Verbindungen und Kapazitäten verwaltet.
  Quelle: Tenant-Level-Auditing (oben). Einschätzung: Standard, hoch.
- **Zentrale Prüffrage zu RLS:** RLS gilt nur für Viewer. Admin, Member und Contributor umgehen RLS, weil sie das
  Modell bearbeiten dürfen. Viewer mit Build-Recht bleiben auch in „Analyze in Excel“ gefiltert.
  Quelle: https://learn.microsoft.com/fabric/security/service-admin-row-level-security
  Einschätzung: Standard, hoch. Daraus folgt eine Kennzahl, die viele Checklisten nennen: Anzahl Personen mit
  Bearbeitungsrolle auf RLS-geschützten Modellen.
- Build-Recht öffnet das ganze Modell für eigene Werkzeuge (DAX Studio, Tabular Editor, Excel); RLS filtert Zeilen,
  verbirgt aber keine Tabellen oder Spalten. Wer Struktur schützen will, braucht OLS oder ein anderes Design.
  Quelle: https://community.fabric.microsoft.com/t5/Desktop/Build-access-to-a-subset-of-a-model/m-p/4681892 (und
  verwandte Threads), https://medium.com/microsoft-power-bi/preventing-data-export-in-power-bi-a-practical-enterprise-ready-guide-to-securing-your-reports-499f86f90552
  Einschätzung: verbreitet, mittel bis hoch.
- Rezertifizierung: RLS-Rollenmitgliedschaften quartalsweise prüfen, Entra-Gruppen statt Einzelpersonen, ausgeschiedene
  Mitarbeiter entfernen.
  Quelle: https://hub.rencore.com/guides/govern/power-bi/security ,
  https://www.nextlytics.com/blog/row-level-security-on-power-bi-enforce-it-then-keep-it-current
  Einschätzung: verbreitet, mittel.

### 1.5 Export, Freigabe, externe Nutzer

- Organisationsweit geteilte Items, Publish to Web, Abonnements (Nutzer, Gruppen, Service Principals), Nutzer mit
  auffällig vielen Exporten oder Downloads, Freigaben aus persönlichen Workspaces, Zugriffe externer Nutzer,
  Änderungen an Tenant-Settings samt Admin, Label-Änderungen, Gateway-/Datenquellen-Änderungen.
  Quelle: Tenant-Level-Auditing (oben). Einschätzung: Standard, hoch.
- Relevante Activity-Log-Operationen: `ExportReport`, `ExportArtifact`, `ExportTile`, `AnalyzeInExcel`,
  `AnalyzeInExcelDataset`, `AnalyzedByExternalApplication`, `GenerateMultiResourceEmbedToken`,
  `AddDatasourceToGateway`, `ApplyChangeToPowerBIModel`.
  Quelle: https://learn.microsoft.com/fabric/admin/operation-list
  Einschätzung: hoch (offizielle Liste); welche davon Praktiker priorisieren, ist uneinheitlich.
- Rencore-Policies mit Schweregrad: externe Berichtsfreigabe (High), extern geteilte Dashboards (High), Workspaces mit
  externen Nutzern (Medium), Berichte ohne Klassifizierung (Medium), Workspaces ohne Admin (Medium), inaktive und leere
  Workspaces (Medium), verwaiste Datasets (Medium).
  Quelle: https://docs.rencore.com/governance/reference/policies/powerbi
  Einschätzung: vereinzelt (ein Hersteller), mittel; gute Vorlage für eine Schweregrad-Zuordnung.
- Export lässt sich nur per Tenant-Setting auf Sicherheitsgruppen beschränken; Admin-Einstellung schlägt
  Berichtseinstellung. Ein Community-Blog empfahl bereits 2020, „Export to Excel“ tenantweit zu sperren (Einzelmeinung).
  Quellen: https://community.powerbi.com/t5/Desktop/How-to-assign-specific-users-to-export-data/td-p/2429677 ,
  https://data-marc.com/2020/04/13/power-bi-governance-why-you-should-consider-to-disable-export-to-excel/
  Einschätzung: verbreitet, mittel.

### 1.6 RLS-Abdeckung und RLS-Qualität

- Modelle mit/ohne RLS, Rollen ohne Mitglieder (BPA: Info), dynamische RLS (`USERPRINCIPALNAME`), zu komplexe
  RLS-Ausdrücke (`LEFT`, `UPPER`, `FILTER` usw.: Warning), Many-to-many auf RLS-Tabellen (Warning),
  `USERELATIONSHIP` zusammen mit RLS auf derselben Tabelle (Error).
  Quelle: https://raw.githubusercontent.com/microsoft/semantic-link-labs/main/src/sempy_labs/_model_bpa_rules.py ,
  https://fabricatedinsights.substack.com/p/building-your-power-bi-cicd-pipeline-660
  Einschätzung: verbreitet, hoch (Quellcode).
- Typische RLS-Fehler: DAX-Filter ohne BLANK-Behandlung gibt alle Zeilen frei; B2B-Gäste liefern andere
  UPN-Formate; „Test as role“ simuliert weder Gäste noch Embedding; Service Principals können keiner RLS-Rolle
  angehören, RLS greift dann nur mit `EffectiveIdentity`.
  Quellen: https://learn.microsoft.com/fabric/security/service-admin-row-level-security ,
  https://www.epcgroup.net/blog/power-bi-row-level-security-enterprise-configuration
  Einschätzung: hoch (Microsoft) bzw. niedrig bis mittel (Beraterblog zu BLANK).
- Measure Killer bietet im Tenant-Modus einen eigenen RLS-Reiter.
  Quelle: https://adaptiva.com/patch-library/1000001418_patch_for_measure_killer_x64 (Release Notes, Sekundärquelle)
  Einschätzung: vereinzelt, niedrig.

### 1.7 Endorsement, Zertifizierung, Kuratierung

- Anteil Aufrufe auf zertifizierten Modellen; Inhalte mit vielen Aufrufen, die nicht endorsed sind; Abdeckung von
  Beschreibungen und Endorsement.
  Quellen: Tenant-Level-Auditing (oben), https://learn.microsoft.com/fabric/governance/onelake-catalog-govern
  Einschätzung: Standard, hoch.

### 1.8 Sensitivity Labels, DLP, Insider Risk

- Anteil ungelabelter Items, Label-Verteilung nach Domäne/Workspace, DLP-Treffer. Purview Insider Risk Management
  hat fertige Indikatoren für Power-BI-Ansehen, -Download und -Export sowie eine Schnellrichtlinie „Datendiebstahl“.
  Quellen: https://learn.microsoft.com/fabric/governance/information-protection ,
  https://www.helpnetsecurity.com/2026/03/17/microsoft-purview-fabric-security-innovations/
  Einschätzung: verbreitet, hoch (aber lizenzabhängig, E5/Pay-as-you-go).

### 1.9 Datenquellen und Gateways

- Wer legt Gateways und Datenquellen an oder ändert sie; wer verwaltet sie; Lineage bis zur externen Quelle;
  Anmeldeinformationen sicher verwaltet. Bei Datenquellen nennen die Quellen eher Ereignisse als Kennzahlen.
  Quelle: Tenant-Level-Auditing (oben). Einschätzung: Standard, hoch.

### 1.10 Service Principals

- Nur über Sicherheitsgruppen freischalten; Admin-API-Lesezugriff gibt einem SP alle Admin-Metadaten inklusive DAX und
  M-Ausdrücken; die Aufteilung der SP-API-Einstellung in „globale“ und „berechtigungsbasierte“ APIs kann ungewollt
  Rechte (z. B. Workspace-Anlage) öffnen. Der CIS-Benchmark für Microsoft 365 enthält eine L1-Kontrolle „API-Zugriff
  durch Service Principals einschränken“. Im Activity-Log ist `ActorUserType` = Service Principal auswertbar.
  Quellen: https://learn.microsoft.com/power-bi/admin/service-admin-portal-developer ,
  https://www.tenable.com/audits/items/CIS_Microsoft_365_Foundations_v5.0.0_L1_E5.audit:70c252b1ecc0313824f8c7ae3c690f8e ,
  https://learn.microsoft.com/azure/azure-monitor/reference/tables/powerbiactivity
  Einschätzung: verbreitet, hoch.
- Microsoft-Best-Practice für Execute-DAX-Queries-Mittelschichten (entspricht „eigene App fragt Modell ab“):
  Aufrufer authentifizieren, kein offener Proxy, SP nur mit Build und Read auf konkreten Modellen (nicht Workspace-
  oder Tenant-Admin), Secrets in Key Vault, DAX-Eingaben validieren, `effectiveUsername` nur nach Berechtigungsprüfung,
  Abfragetext, Antwortgröße und Dauer protokollieren.
  Quelle: https://learn.microsoft.com/power-bi/developer/execute-dax-queries-arrow/best-practices
  Einschätzung: hoch; für fabscan direkt als Prüfkatalog für App-Clients nutzbar.

### 1.11 Tenant-Settings

- Änderungen und Verantwortliche protokollieren; Reifegrad 500 heißt, Tenant-Settings regelmäßig per REST abzurufen;
  ein Hersteller fordert manipulationssichere Protokollierung.
  Quellen: https://learn.microsoft.com/power-bi/guidance/fabric-adoption-roadmap-system-oversight#maturity-levels ,
  https://motio.com/?p=18268
  Einschätzung: Standard (hoch) bzw. vereinzelt (niedrig) für die Manipulationssicherheit.

### 1.12 Modellqualität (BPA) und Aufräumen

- Tabular-Editor-Standardregeln: 27 Regeln in DAX Expressions, Formatting, Metadata, Model Layout, Naming Conventions,
  Performance; Schweregrad 1 bis 3. **Keine Sicherheitsregel.**
  Quelle: https://raw.githubusercontent.com/TabularEditor/BestPracticeRules/master/BPARules-standard.json
  Einschätzung: Standard, hoch.
- Semantic Link Labs Model-BPA: rund 60 Regeln in Performance, Error Prevention, DAX Expressions, Maintenance,
  Formatting, Naming Conventions; Info/Warning/Error; `run_model_bpa_bulk` schreibt in eine Lakehouse-Delta-Tabelle,
  dazu ein Direct-Lake-Bericht. Report-BPA mit frei definierbaren Regeln (Kategorie, Scope, Schweregrad, Ausdruck).
  Quellen: Quellcode (oben), https://community.fabric.microsoft.com/t5/Notebook-Gallery/Best-Practice-Analyzer-Report/m-p/4620418 ,
  https://community.fabric.microsoft.com/t5/Notebook-Gallery/Report-Analysis/m-p/4623058
  Einschätzung: verbreitet, hoch.
- Measure Killer: ungenutzte Measures/Spalten über alle verbundenen Berichte, paginierte Berichte und Excel-Dateien,
  Status „Used by unused“, Tenant-Analyse mit RLS-Reiter, Capacity-Metrics, kaputte Visuals und kaputtes DAX.
  Quellen: https://community.fabric.microsoft.com/t5/Desktop/How-to-identify-used-vs-unused-columns-in-a-Fabric-semantic/m-p/4796971 ,
  https://exceleratorbi.com.au/measure-killer-for-power-bi/
  Einschätzung: verbreitet, mittel (Herstellerangaben über Dritte).
- Power BI Sentinel (Drittanbieter): Backup, Änderungsverfolgung, Lineage („wo werden sensible Daten exponiert“),
  Nutzungsanalyse.
  Quelle: https://www.theta.co.nz/technology/power-bi-sentinel
  Einschätzung: vereinzelt, niedrig (Herstellertext). Zeigt aber: **Änderungshistorie von Modellen** gilt als
  eigenständiger Governance-Wert.

### 1.13 Compliance-Bezug

- SOX (ITGC): Zugriff, Änderungsmanagement, Betrieb. Als Nachweis werden Activity-Log-Ereignisse zu Workspace-
  Zugriffsänderungen, Bericht-/Modell-Publish und App-Updates genannt; Änderungen müssen autorisiert, getestet,
  dokumentiert sein.
  Quellen: https://www.sigmacomputing.com/blog/sox-compliance-bi ,
  https://www.safepaas.com/itgc/key-change-management-controls-auditors-look-for-in-sox-itgc-audits/ ,
  https://metricasoftware.com/?p=2013
  Einschätzung: verbreitet, mittel (keine BI-spezifische Normquelle).
- DSGVO: Need-to-know aus Art. 5 Abs. 1 lit. c und Art. 32, Rechenschaft nach Art. 5 Abs. 2, regelmäßige Rezertifizierung;
  versionierte Historie „wer hatte wann Zugriff worauf“ (auch für DORA genannt).
  Quellen: https://www.roedl.com/insights/berechtigungskonzept-need-to-know-prinzip/ ,
  https://www.nextlytics.com/blog/row-level-security-on-power-bi-enforce-it-then-keep-it-current
  Einschätzung: verbreitet, mittel.
- ISO 27001: keine BI-spezifische Quelle gefunden. Ableitung aus den obigen Punkten: Zugriffskontrolle,
  Protokollierung, Änderungsmanagement, Lieferantenzugriff (externe Nutzer). Einschätzung: niedrig (eigene Ableitung).
- CIS Microsoft 365 Foundations Benchmark enthält einen Power-BI/Fabric-Abschnitt (Gastzugriff, Publish to Web,
  Labels, Service Principals; Nummerierung je Version verschieden).
  Quelle: https://www.cisecurity.org/benchmark/microsoft_365
  Einschätzung: verbreitet bei Security-Teams, hoch (Inhalt nicht im Detail verifiziert).

---

## 2. Welche Lücken beklagen Praktiker?

### 2.1 Zersplitterung, keine einzige Wahrheit für Security

- Activity-Log, Purview-Audit, Admin-Monitoring-Workspace, Capacity-Metrics-App, Log Analytics, Gateway-Logs,
  Usage-Metrics: jedes zeigt einen Ausschnitt, das Zusammenführen ist Handarbeit. Auf r/MicrosoftFabric wird der
  fehlende „Single Source of Truth“ für Security-Monitoring ausdrücklich beklagt.
  Quellen: https://team400.ai/blog/2026-11-power-bi-data-level-auditing ,
  https://r.darklab.sh/r/MicrosoftFabric/comments/1l4xw91/i_dont_know_where_fabric_is_heading_with_all (Spiegel)
  Einschätzung: verbreitet, mittel.

### 2.2 Kurze Aufbewahrung, Verzögerung

- Activity-Log 28 Tage Standard (Defender 30), API nur ein Tag je Aufruf, Ereignisse 30 Minuten bis 24 Stunden
  verzögert. Microsoft empfiehlt mindestens zwei Jahre Historie selbst aufzubauen. Govern-Bericht nur täglich.
  Quellen: Tenant-Level-Auditing (oben), https://learn.microsoft.com/fabric/enterprise/powerbi/service-admin-auditing
  Einschätzung: Standard, hoch.

### 2.3 Abfragen außerhalb von Berichten (Notebooks, Excel, eigene Apps, XMLA, executeQueries)

Das ist die am häufigsten genannte, am wenigsten gelöste Lücke und passt genau zu fabscan.

- Das Activity-Log weist XMLA-Leseoperationen nicht ausdrücklich aus; Workarounds sind die Capacity-Metrics-App
  (zeigt XMLA Read mit Nutzer), Log Analytics oder Live-Traces per Profiler.
  Quelle: https://community.fabric.microsoft.com/t5/Service/Need-help-identifying-who-performed-a-XMLA-Read-Operation-that/m-p/3270031
  Einschätzung: verbreitet, mittel.
- `AnalyzeInExcel` entsteht nur, wenn im Service eine Excel-Datei erzeugt wird; was danach in Excel abgefragt wird,
  steht nur in den Engine-Logs.
  Quelle: https://learn.microsoft.com/fabric/admin/operation-list
  Einschätzung: hoch.
- Echte Abfragen je Nutzer und Client gibt es nur in Log Analytics bzw. Workspace Monitoring (`SemanticModelLogs`:
  `ApplicationName`, `ApplicationContext` mit Report-ID, `ExecutingUser`, `EventText` mit DAX) und nur auf
  Premium/PPU/Fabric. Auf Pro/Shared Capacity fehlt diese Ebene ganz. `ApplicationName` ist ein vom Client gesetzter
  Wert, also keine harte Identifikation.
  Quellen: https://learn.microsoft.com/fabric/enterprise/powerbi/semantic-model-operations ,
  https://team400.ai/blog/2026-11-power-bi-data-level-auditing
  Einschätzung: hoch. Lücke: niemand liefert eine fertige Klassifizierung der Clients (Bericht, Excel, Notebook,
  App, DAX Studio, Power Automate) mit Bewertung, was sie abfragen.
- DMVs wie `DISCOVER_SESSIONS` zeigen nur aktuelle Sitzungen, Einträge verschwinden unter Last.
  Quelle: https://community.fabric.microsoft.com/t5/Service/Usage-see-connections-from-Power-Automate-to-Semantic-models/m-p/4923625
  (Treffertext; Seite selbst lieferte 403). Einschätzung: vereinzelt, mittel.
- Notebooks/Semantic Link: Unter welcher Identität `evaluate_dax` läuft und ob RLS greift, ist in der Community
  ungeklärt; dokumentiert ist nur, dass Workspace-Contributor ohnehin an RLS vorbei lesen. Semantic Link erscheint in
  den Engine-Logs unter eigenem `ApplicationName`.
  Quellen: https://learn.microsoft.com/fabric/data-science/read-write-power-bi ,
  https://community.fabric.microsoft.com/t5/Fabric-platform/fabric-evaluate-dax-when-run-in-context-of-SPN-fails/m-p/4621390/highlight/true
  Einschätzung: verbreitet als Unsicherheit, niedrig bis mittel als Fakt.
- Eigene Apps und Embedding: Service Principals stehen nicht unter RLS; ohne `EffectiveIdentity` sieht die App alles;
  „Test as role“ simuliert das nicht. Execute DAX Queries (Arrow) hebt das 100.000-Zeilen-Limit auf, also größeres
  Abflussrisiko.
  Quellen: https://learn.microsoft.com/fabric/security/service-admin-row-level-security ,
  https://learn.microsoft.com/power-bi/developer/execute-dax-queries-arrow/overview
  Einschätzung: hoch.
- Aufräum-Werkzeuge sehen Excel- und Notebook-Nutzung nur teilweise: Measures, die nur in Excel verwendet werden,
  laufen Gefahr, als „ungenutzt“ gelöscht zu werden; Measure Killer meldet im Tenant-Modus immerhin Analyze-in-Excel-
  Aktivität.
  Quelle: https://community.fabric.microsoft.com/t5/Desktop/How-to-identify-used-vs-unused-columns-in-a-Fabric-semantic/m-p/4796971
  Einschätzung: verbreitet, mittel.

### 2.4 Berechtigungsinventur ist mühsam

- Nicht-Admins sehen nur Workspace-Rollen, nicht Item-Freigaben; App-Zielgruppen sind per API nicht je Zielgruppe
  abrufbar; `GetReportUsersAsAdmin` drosselt nach rund 200 Aufrufen; der Weg ist die Scanner-API mit
  Nutzerberechtigungen. Abonnements haben keine tenantweite Übersicht.
  Quellen: https://community.fabric.microsoft.com/t5/Developer/How-to-extract-a-list-of-reports-and-users-with-access-across/m-p/4806864 ,
  https://community.fabric.microsoft.com/t5/Service/Auditing-report-dashboard-access-without-Tenant-Power-BI-Admin/td-p/4385027 ,
  https://community.fabric.microsoft.com/t5/Fabric-Ideas/Fabric-Admin-Portal-Tenant-wide-subscription-management-is/idi-p/5004338
  Einschätzung: verbreitet, mittel.

### 2.5 Schwächen von FUAM und Bordmitteln

- FUAM: kein offizielles Produkt, kein Support, hängt an der Capacity-Metrics-App, braucht Admin-Rechte, Pflege und
  Selbstüberwachung (Pipelines brechen, Tabellen bleiben stehen), verbraucht Kapazität, enthält selbst sensible
  Tenant-Daten; Engine-Level-Analyse fehlt noch; Wunsch nach einer vollständigen Nutzerübersicht.
  Quellen: https://telefonicatech.uk/blog/fabric-unified-admin-monitoring-part3/ ,
  https://sqlreitse.com/2025/07/04/streamline-fabric-monitoring-and-administration-using-fuam/ ,
  https://community.fabric.microsoft.com/t5/Fabric-platform/FUAM-Help-tracing-FUAM-table-sources-after-pipeline-recovery/m-p/4795747/highlight/true
  Einschätzung: verbreitet, mittel bis hoch.
- Eingebauter Admin-Monitoring-Bericht „nur begrenzte Informationen“.
  Quelle: https://community.fabric.microsoft.com/t5/Service/Report-on-Tenant/m-p/3996959
  Einschätzung: vereinzelt, mittel.
- BPA-Werkzeuge prüfen Struktur, nicht Nutzung: kein BPA führt Abfragen aus oder weiß, wer das Modell wie nutzt; die
  Tabular-Editor-Standardregeln haben keine Sicherheitsregel, die RLS-Regeln in Semantic Link Labs sind
  performancegetrieben.
  Quellen: Regel-JSON und Quellcode (oben), https://skills.sh/data-goblin/power-bi-agentic-development/review-semantic-model
  Einschätzung: hoch.
- Workspace Monitoring kann selbst sensible Werte enthalten (DAX-Text, Pipeline-Parameter); Zugriff auf das
  Monitoring-Eventhouse muss eingeschränkt werden.
  Quelle: https://learn.microsoft.com/fabric/data-factory/workspace-monitoring
  Einschätzung: hoch.

### 2.6 Organisatorische Lücken

- Alarme an Einzelpersonen gehen nach deren Weggang verloren; Monatsreviews werden übersprungen; „Daten, die niemand
  ansieht, sind kein Auditing, sondern Speicher“ (sinngemäß); Kapazitäts-App für Nicht-Spezialisten schwer lesbar;
  Log Analytics braucht Azure, KQL und Kostenkontrolle.
  Quelle: https://team400.ai/blog/2026-11-power-bi-data-level-auditing
  Einschätzung: verbreitet, mittel (Beraterblog, deckt sich mit Microsoft-Leitfaden).

---

## 3. Darstellungsform: Entscheider vs. Techniker, Bewertungsskalen

### 3.1 Zielgruppengerechte Sichten

- Microsoft unterscheidet ausdrücklich: Führung (Zusammenfassung, Trends), CoE (wer nutzt was wie), Kapazitäts-Admins
  (Last, Stabilität), Workspace-Admins und Entwickler (Detail), Auditoren und Admins (Inventar, Lineage,
  Sicherheitseinstellungen). Regel: nur zeigen, worauf man handeln will; jede Seite mit Zweck und erwarteter Aktion.
  Quelle: https://learn.microsoft.com/en-au/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-tenant-level-auditing
  Einschätzung: Standard, hoch.
- Der Govern-Bereich im OneLake-Katalog nutzt „Insights“ plus „Recommended Actions“: Karte mit Befund, **warum es
  wichtig ist** und **Schritten zur Behebung**, in „Meine Items“ mit Direktlink auf jedes betroffene Objekt.
  Quelle: https://learn.microsoft.com/fabric/governance/onelake-catalog-govern
  Einschätzung: Standard (Microsofts eigenes Muster), hoch. Entspricht dem Dreiklang Befund, Begründung, Maßnahme.
- Für Techniker: Objektliste mit Regel-ID, Schweregrad, Erklärung, Link und Fix; Unterdrückung einzelner Befunde per
  Annotation am Objekt („Ignore object“) oder ganzer Regeln auf Modellebene; Team-Baseline: erst alle Regeln an,
  gemeinsam festlegen, was gilt, Abschaltungen begründen.
  Quellen: https://docs.tabulareditor.com/en/features/using-bpa.html ,
  https://docs.tabulareditor.com/features/built-in-bpa-rules.html ,
  https://tabulareditor.com/blog/best-practice-analyzer-bpa-rules-for-semantic-models
  Einschätzung: Standard, hoch.
- In CI/CD gilt: Error (Stufe 3) blockiert die Veröffentlichung, Warning (2) je nach Kontext, Info (1) nur Hinweis.
  Quelle: https://fabricatedinsights.substack.com/p/building-your-power-bi-cicd-pipeline-660
  Einschätzung: verbreitet, mittel.
- Für Auditoren: Änderungsprotokoll „was, wann, warum, durch wen“ und reproduzierbare Nachweise; Power BI ist dabei
  Präsentationsschicht der Evidenz, die Kontrollen liegen in Entra, Git und Prozessen.
  Quellen: Retire-Leitfaden (oben), https://www.epcgroup.net/audit-ready-analytics-compliance-framework-guide
  Einschätzung: verbreitet, mittel.

### 3.2 Bewertungsskalen

- **Reifegrad 100 bis 500** (Initial, Repeatable, Defined, Capable, Efficient) aus der Microsoft-Adoption-Roadmap, mit
  Kriterien je Bereich (Governance, System Oversight, Content Ownership, CoE). Ziel laut Microsoft mindestens 300 bis
  400. Wird von Beratern als Gesamtbewertung übernommen.
  Quelle: https://learn.microsoft.com/power-bi/guidance/fabric-adoption-roadmap-maturity-levels
  Einschätzung: Standard für Entscheider, hoch.
- **Drei Schweregrade** Info/Warning/Error (BPA) bzw. fail/warn/info; Rencore nutzt High/Medium. Ampel ist die
  übliche Übersetzung für Entscheider.
  Quellen: siehe 1.12 und 1.5. Einschätzung: Standard, hoch.
- **Punktwerte:** Das Power-Platform-CoE-Dashboard vergibt einen Archivierungs-Score (maximal 6 für eine App);
  Purview IRM vergibt Risikostufen je Nutzer. Für Power BI selbst gibt es keinen etablierten numerischen Risikoscore.
  Quellen: https://learn.microsoft.com/power-platform/guidance/coe/power-bi-govern ,
  https://www.helpnetsecurity.com/2026/03/17/microsoft-purview-fabric-security-innovations/
  Einschätzung: vereinzelt, mittel.
- **Warnung vor der Einzelzahl:** Ein Gesamtscore verdeckt große Lücken zwischen Bereichen; besser Ampel je Thema.
  Quelle: https://endjin.com/blog/ask-right-questions-get-data-insights-projects-back-on-track
  Einschätzung: vereinzelt, mittel; deckt sich mit Microsofts bereichsweisen Reifegraden.
- **Trend:** Microsoft verlangt Trendvergleiche gegen Vorperioden und zwei Jahre Historie; FUAM und Semantic Link Labs
  schreiben deshalb in Delta-Tabellen.
  Quellen: Tenant-Level-Auditing und Retire-Leitfaden (oben). Einschätzung: Standard, hoch.

---

## 4. Welche Fehlalarme nerven?

### 4.1 „Keine RLS“, obwohl keine nötig ist

- Keine Quelle nennt diesen Fall wörtlich, aber die Regelwerke zeigen die Haltung: Semantic Link Labs stellt sogar
  vorhandene dynamische RLS nur als Info-Frage („ist sie nötig?“); Tabular Editor empfiehlt, nicht passende Regeln zu
  ignorieren und die Abschaltung zu begründen. Microsoft sagt zudem, RLS greife ohnehin nicht für Bearbeiter.
  Folgerung: „Keine RLS“ ist nur dann ein Befund, wenn das Modell personen- oder mandantenbezogene Daten trägt oder
  breit an Viewer verteilt wird; bei Gesamt-/Konzernkennzahlen ist es Rauschen.
  Quellen: Quellcode Semantic Link Labs (oben), https://tabulareditor.com/blog/best-practice-analyzer-bpa-rules-for-semantic-models
  Einschätzung: verbreitet als Praxisregel, mittel (Ableitung).

### 4.2 Ausgeblendete Spalten, die legitim abgefragt werden

- Power BI nimmt die Sortierspalte („Sort by Column“) automatisch in die Visual-Abfrage auf, auch wenn sie ausgeblendet
  und im Visual nicht sichtbar ist; das verändert sogar den Filterkontext (ALL/ALLSELECTED müssen beide Spalten nennen).
  Quellen: https://sqlbi.com/articles/side-effects-in-dax-of-the-sort-by-column-setting ,
  https://community.fabric.microsoft.com/t5/Desktop/Calculation-not-working-when-adding-a-Column-Sort/m-p/3376812/highlight/true
  Einschätzung: verbreitet, hoch.
- Die BPA-Regelwerke nehmen Sortierspalten, Beziehungs-, Hierarchie- und referenzierte Spalten ausdrücklich aus
  („UsedInSortBy“, Relationships, Dependencies); Fremdschlüssel sollen sogar ausgeblendet sein. Ein Befund
  „ausgeblendetes Feld abgefragt“ muss diese Fälle ausnehmen.
  Quellen: https://raw.githubusercontent.com/TabularEditor/BestPracticeRules/master/BPARules-standard.json ,
  Quellcode Semantic Link Labs (oben)
  Einschätzung: hoch.

### 4.3 „Ungenutzt“, obwohl genutzt

- Nutzung in Excel, Thin Reports, Notebooks oder Apps ist für reine Modellanalyse unsichtbar; Namenskollisionen
  Measure/Spalte täuschen Nutzung vor (Power BI Cleaner); dynamische M-Ausdrücke lassen Datenquellen ungenutzt
  wirken; saisonale Inhalte (Quartals-, Jahresabschluss, Prüfermodell) fallen aus 30- oder 90-Tage-Fenstern; Dev-/Test-
  Workspaces haben naturgemäß schwankende Nutzung.
  Quellen: https://www.thebiccountant.com/2021/06/27/power-bi-cleaner-gen2-is-here/ ,
  https://docs.tabulareditor.com/en/kb/bpa-remove-unused-data-sources.html ,
  https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-content-lifecycle-management-retire-archive ,
  https://team400.ai/blog/2026-10-power-bi-retire-archive-content
  Einschätzung: verbreitet, hoch.

### 4.4 Legitime externe Freigaben und Service Principals

- Policies, die jede externe Freigabe melden, treffen auch genehmigte Partner; Empfehlung: Allowlist genehmigter
  Tenants/Workspaces, Alarm nur bei Ungenehmigtem. Allgemein: zu viele Alarme erzeugen Alarmmüdigkeit.
  Quellen: https://docs.rencore.com/governance/reference/policies/powerbi ,
  https://powerbiconsulting.com/blog/power-bi-monitoring-alerting-setup-guide
  Einschätzung: verbreitet, mittel (Allowlist ist Ableitung).
- Service Principals sind für Embedding und Automatisierung der empfohlene Weg (Dienstkonto statt Person). Das Risiko
  liegt in zu breiten Rechten (Workspace-Admin, Tenant-Admin-API) und fehlender `EffectiveIdentity`, nicht im SP an
  sich. Pauschales „SP statt Nutzer“ als fail ist deshalb oft Rauschen.
  Quellen: https://learn.microsoft.com/power-bi/developer/execute-dax-queries-arrow/best-practices ,
  https://learn.microsoft.com/fabric/security/service-admin-row-level-security
  Einschätzung: hoch.

### 4.5 Kontextfreie Best-Practice-Regeln

- Formatierungs-, Namens-, Übersetzungs- und Beschreibungsregeln erzeugen Masse ohne Risiko; Praktiker beginnen mit
  allen Regeln, einigen sich dann auf eine Teilmenge. Semantic Link Labs hat eingebaute Ausnahmen (Direct Lake,
  Calculation Groups, Field Parameters, Time-Tabellen), die zeigen, wo Regeln sonst falsch anschlagen.
  Quellen: https://docs.tabulareditor.com/features/built-in-bpa-rules.html , Quellcode Semantic Link Labs (oben)
  Einschätzung: verbreitet, hoch.
- Eigene Erfahrung im Projekt (keine externe Quelle): „Do not summarize numeric columns“ pauschal anzuwenden ist falsch,
  wenn Faktenspalten in Visuals als `Sum(...)` gebunden sind. Einschätzung: vereinzelt, intern belegt.
- „Workspace-Mitglieder umgehen RLS“ ist in Entwicklungs-Workspaces erwartet; als Befund nur in Produktiv-Workspaces
  mit Viewer-Publikum sinnvoll (Ableitung aus Microsoft-Doku zu Rollen). Einschätzung: mittel.

### 4.6 Zeit- und Datenstandsartefakte

- Govern-Daten nur täglich, Audit-Ereignisse bis 24 Stunden verspätet, Workspace-Monitoring 10 bis 15 Minuten: frische
  Änderungen erscheinen als „fehlt“ oder „ungenutzt“.
  Quellen: https://learn.microsoft.com/fabric/governance/onelake-catalog-govern , Tenant-Level-Auditing (oben)
  Einschätzung: hoch.

---

## Ableitungen für fabscan (Vorschlag, nicht Teil der Quellenlage)

1. **Client-Profil je Modell** aus SemanticModelLogs: Bericht, Excel, Notebook/Semantic Link, eigene App, XMLA-Werkzeug,
   Power Automate; je Client Nutzer, SP oder Person, Abfragevolumen, Zeilenmenge, ob ausgeblendete/sensible Felder
   gelesen werden. Das ist die größte von Praktikern beschriebene Lücke und fabscans Alleinstellung.
2. **RLS-Wirksamkeit statt RLS-Vorhandensein:** Wer fragt ein RLS-Modell mit Bearbeiterrolle, als SP ohne
   EffectiveIdentity oder über Build-Recht ab. SEC-NO-RLS an Datenkontext koppeln (Personen-/Mandantenbezug,
   Viewer-Reichweite), sonst Info.
3. **Fehlalarm-Ausnahmen** in SEC-HIDDEN: Sortierspalten, Beziehungsschlüssel, Hierarchie- und RLS-Spalten ausnehmen.
   SEC-AUTH nach Rechteumfang des SP abstufen.
4. **Ausnahmen mit Begründung** (Annotation oder Allowlist-Datei) nach BPA-Vorbild, im Bericht sichtbar als „bewusst
   akzeptiert“.
5. **Zwei Sichten:** Entscheider mit Ampel je Thema, Trend gegen Vorlauf und Reifegrad-Anlehnung 100 bis 500; Techniker
   mit Regel-ID, Begründung, Maßnahme, Objektlink (Muster wie Govern „Recommended Actions“). Keine einzelne Gesamtnote.
6. **Lücken, die Praktiker zusätzlich erwarten** und fabscan heute auslässt: Berechtigungsinventur (Workspace-Rollen,
   Build, App-Zielgruppen soweit möglich), Export-/Analyze-in-Excel-Ereignisse aus dem Activity-Log, Endorsement und
   Labels der abgefragten Modelle, Verweise auf vorhandene Werkzeuge (FUAM, Semantic Link Labs BPA) statt eigener BPA.
