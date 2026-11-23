# Governance- und Security-Bedarf für Power BI / Microsoft Fabric laut Microsoft Learn

Stand der Recherche: 19.11.2026, Quellen ausschließlich Microsoft Learn (Power BI implementation planning, Fabric adoption roadmap, Fabric Admin/Governance/Security, REST-Referenz, Purview, Defender for Cloud Apps).

Kennzeichnung:
* **[MS]** = Microsoft nennt es ausdrücklich (Empfehlung, Checkliste, Beispielfrage oder Warnung in der Doku).
* **[Abl.]** = eigene Ableitung bzw. Zuspitzung für fabscan, nicht wörtlich so in der Doku.
* Quellen stehen als Kürzel in eckigen Klammern, die vollständigen URLs im Quellenverzeichnis (Abschnitt d).

Grundhaltung von Microsoft, die alles Weitere rahmt:
* Governance heißt, das Verhalten der Nutzer mit Daten zu steuern, nicht die Daten selbst; Ziel ist die Balance aus Befähigung, Regulierung und internen Vorgaben. [MS] [Q-GOV]
* „You can't govern what you don't know about": Inventar von Besitz und Lineage ist Voraussetzung. [MS] [Q-GOV]
* Aktivitätsdaten sofort extrahieren und speichern, auch wenn noch keine Auswertung existiert („urgent priority"), weil die Historie nur 28 bzw. 30 bis 90 Tage vorgehalten wird. [MS] [Q-AUD-OV] [Q-TLA]
* Tenant-Einstellungen sind Governance-Hilfen, aber **keine Sicherheitsmaßnahme**: Wer Leserecht auf ein Modell hat, kann es abfragen und Ergebnisse auch ohne „Export data" sichern. [MS] [Q-TS-ABOUT]
* Auditing nur entlang konkreter Fragen und geplanter Handlungen aufbauen, sonst entsteht wenig Nutzen; Verantwortliche für Maßnahmen benennen, Tracking-System für Befunde (Kontakt, nächste Aktion, Status). [MS] [Q-TLA]

---

## (a) Informationsbedarfe nach Rolle

### a1 Fabric-Administrator (Tenant-Admin, System oversight)

| Bedarf | Inhalt | Kennz. | Quelle |
|---|---|---|---|
| Tenant-Einstellungen kennen und Änderungen nachweisen | Welche Einstellung ist an/aus, für welche Sicherheitsgruppen, welche Delegation an Kapazitäts-/Domänen-/Workspace-Admins; wer hat wann was geändert (UpdatedAdminFeatureSwitch zeigt nur „geändert", Inhalt nur per Snapshot-Vergleich); neue Einstellungen erkennen | [MS] | [Q-TADM] [Q-API-TS] |
| Regelmäßiger Snapshot der Tenant-Einstellungen | Get Tenant Settings API, geplant; Reifegrad 500 im System-oversight-Modell nennt das ausdrücklich | [MS] | [Q-SYS] [Q-TADM] |
| Admin-Rollen überwachen | 2 bis 4 Fabric-Admins, PIM für Gelegenheitsadmins, Mitgliedschaft (Fabric-Admin, Power-Platform-Admin, Global Admin) regelmäßig prüfen | [MS] | [Q-TADM] |
| Workspace-Inventar und Workspace-Änderungen | Neue Workspaces (CreateFolder), Änderungen (UpdateFolder), Zugriffsänderungen (UpdateWorkspaceAccess / UpdateFolderAccess), Kapazitätswechsel (MigrateWorkspaceIntoCapacity), Domänenzuordnung, Admin-Zugriff auf persönliche Workspaces (AddAdminPersonalWorkspaceAccess); verwaiste Workspaces ohne Admin; Namenskonventionen | [MS] | [Q-TADM] |
| Embed Codes (Publish to web) | Alle Embed Codes mit Status (Active, Blocked, Not supported, Infringed) regelmäßig prüfen, Einstellung „Publish to web" eng halten, Audit bei neuen Embed Codes und Einstellungsänderung | [MS] | [Q-TADM] [Q-P2W] [Q-EXPSHARE] |
| Organisationsvisuals, Azure-Verbindungen, Domänen | Je: Ist-Stand prüfen, entscheiden, dokumentieren, Antragsprozess, Auditing einrichten | [MS] | [Q-TADM] |
| Inventar inkl. Lineage, Datenquellen, Gateways | Tenant-Inventar wöchentlich oder monatlich, mit Aktivitätslog kombinieren | [MS] | [Q-AUD-OV] [Q-TLA] |
| Kapazität und Kosten | Lizenzmix, ungenutzte Pro/PPU-Lizenzen, Kapazitätsgröße, Autoscale, Chargeback, Trials | [MS] | [Q-AUD-OV] [Q-SYS] |
| Service Principals für Admin-APIs | Welche SP stehen in „Service principals can access read-only admin APIs" und „... used for updates", welche haben Detail-Metadaten und DAX/Mashup; Secret-Rotation | [MS] | [Q-TLA] [Q-ADMINAPI-TS] |

### a2 Security / Compliance (Informationssicherheit, Datenschutz, interne Revision)

| Bedarf | Inhalt | Kennz. | Quelle |
|---|---|---|---|
| Sensitivity Labels | Abdeckung je Itemtyp, unbeschriftete Inhalte, angewendet/geändert/entfernt, manuell vs. automatisch (Vererbung, Pipeline), Up- vs. Downgrade; Labels pro Workspace auf Plausibilität | [MS] | [Q-IPAUD] [Q-IP] [Q-GOVERN] |
| DLP | Wie oft DLP-Regeln anschlagen, wo, durch wen (DLPRuleMatch); Alerts mit Schweregrad, Bearbeitungsstatus; welche Workspaces im Scope sind (neue Workspaces fehlen sonst) | [MS] | [Q-IPAUD] [Q-DLP] |
| Externe Nutzer | Welche Inhalte sehen externe Nutzer, wer, wann, wie; Abos an Externe (Principal Type „unresolved"); Gastzugriff-Einstellungen | [MS] | [Q-TLA] [Q-TLSEC] |
| Öffentliche Inhalte | Publish to web: Inhalte sind ohne Anmeldung sichtbar, Zugriffe werden **nicht** protokolliert, auch nicht angezeigte Detaildaten sind erreichbar | [MS] | [Q-CCSEC] [Q-P2W] |
| Überteilen | Org-weite Freigabelinks (insbesondere bei hoch eingestuften Labels), Massenfreigaben, Abgleich „Highly Restricted" mit hoher Zahl an Berechtigungen | [MS] | [Q-AUD-OV] [Q-DCA] |
| Anomalien und Echtzeit | Defender for Cloud Apps: Suspicious share, Mass share of reports, ungewöhnlich viele Downloads/Exporte, Label-Massenentfernung, Label-Downgrade; Session-Policies (Download blockieren), Alert bei Admin-Aktivität | [MS] | [Q-DCA] [Q-DCA-PLAN] |
| Nachweise für Audits | Regulatorisch (wo liegen personenbezogene Daten, Spalten-/Measure-Namen per Scanner), organisatorisch (RLS auf allen zertifizierten Modellen, Pflichtlabels), vertraglich (Region der Kapazität), interne/externe Prüfer (Berechtigungen, Label-Übersicht) | [MS] | [Q-AUD-OV] |
| Identitäten | Workspace Identity ist ein automatisch verwalteter Service Principal, Zugriff darauf „sorgfältig verwalten und überwachen"; Audit-Ereignisse in Purview; Entra-Anmeldelogs mit Fabric-Logs korrelieren | [MS] | [Q-WSID] [Q-WAF] |

### a3 Data Owner / Modell-Verantwortlicher (Semantikmodell, Content Owner)

| Bedarf | Inhalt | Kennz. | Quelle |
|---|---|---|---|
| Wer darf was am Modell | Read, Build (in APIs „Explore"), Write, Reshare; Direktzugriff vs. Workspace-Rolle vs. App vs. Link | [MS] | [Q-CCSEC] [Q-DSPERM] |
| Greift RLS wirklich | RLS gilt für Read und Read+Build, **nicht** für Write (Contributor, Member, Admin oder Item-Write); Modell ohne Rollen = alle sehen alles; RLS gilt nicht für Werte außerhalb des Modells (Slicer-/Filterauswahl) | [MS] | [Q-RCSEC] |
| Welche RLS-Rollen werden für wen ausgewertet | Aus Semantikmodell-Ereignislogs (Log Analytics bzw. Workspace Monitoring) | [MS] | [Q-DLA] |
| Wer fragt das Modell wie ab | DAX- und M-Abfragen, Clientanwendungen, XMLA-Operationen, gleichzeitige Nutzer, Laufzeiten, CPU, Refresh-Dauer | [MS] | [Q-DLA] [Q-SMOPS] |
| Modellmetadaten | DMVs/INFO-Funktionen: Datenquellen, ungenutzte Spalten, RLS-DAX, Abhängigkeiten, aktive Sessions | [MS] | [Q-DLA] |
| Nutzung der eigenen Inhalte | Usage Metrics (30 Tage, ein Workspace), Seitenaufrufe, Konsummethode; Govern „My items" mit Empfehlungen zu Labels, Beschreibung, Endorsement | [MS] | [Q-RLA] [Q-GOVERN] |
| Datenquellen-Zugriff | Least Privilege für Quell-Credentials, nie Schreibrechte; Servicekonten mit Rotation (z. B. alle drei Monate) | [MS] | [Q-CCSEC] |
| Gateway-Verbindungen | Rollen Owner / User with sharing / User; Teilen begrenzen, Zugriffe regelmäßig prüfen | [MS] | [Q-GW] |

### a4 Center of Excellence (CoE) / BI-Team

| Bedarf | Inhalt | Kennz. | Quelle |
|---|---|---|---|
| Adoption und Nutzung | Top-Inhalte, Top-Nutzer, Trends, aktive Nutzer, Geräte, Anteil zertifizierter Inhalte, Views auf nicht zertifizierten Berichten | [MS] | [Q-AUD-OV] [Q-ADOPT] |
| Schulungsanlässe | Viel Teilen aus „Mein Arbeitsbereich", viel Export, viel Download, viele neue Modelle einer Person, starke Abo-Nutzung, erstes Publish eines Nutzers | [MS] | [Q-TLA] |
| Wiederverwendung | Verhältnis Modelle zu Berichten, Dubletten, Konsolidierungspotenzial, verwaiste Berichte | [MS] | [Q-TLA] |
| Ungenutzte Inhalte | Inventar gegen Aktivitätslog, frei wählbarer Zeitraum (Get Unused Artifacts nur fix 30 Tage) | [MS] | [Q-TLA] |
| Richtlinien | Data ownership policy, Certification policy, Classification and protection policy; Regelüberprüfung, Ausnahmeprozess, Erfolgskennzahlen | [MS] | [Q-GOV] |
| Reifegrad messen | System oversight Level 100 bis 500 (z. B. 300: automatischer Export von Activity Log und API-Daten; 400: Defender-Policies aktiv; 500: Tenant-Settings per API) | [MS] | [Q-SYS] |

---

## (b) Konkrete Auswertungen und Statistiken mit Datenquelle und Recht

### b1 Datenquellen im Überblick

| Quelle | Liefert | Historie / Grenzen | Recht | Quelle |
|---|---|---|---|---|
| **Get Activity Events** (Power BI Admin REST, `admin/activityevents`) | Alle Power-BI-Aktivitäten als JSON; Felder u. a. Operation, UserId, ClientIP, UserAgent, WorkspaceId, ArtifactId, DatasetId, ReportId, DistributionMethod, ConsumptionMethod, CapacityId, IsSuccess | Nur 28 Tage zurück, Start/Ende im selben UTC-Tag, Continuation Token, max. 200 Requests/Stunde, Latenz bis 60 min | Fabric-Admin (delegiert, Scope Tenant.Read.All) oder Service Principal über Tenant-Setting, SP darf **keine** admin-consent-pflichtigen Power-BI-Berechtigungen haben | [Q-ACT-API] [Q-TRACK] |
| Unified Audit Log (Purview Audit, Office 365 Management Activity API, Search-UnifiedAuditLog) | Power BI plus andere Dienste | API: 7 Tage; Cmdlet: 90 Tage, 5.000 Zeilen je Abfrage | Exchange-/Purview-Audit-Rollen | [Q-TLA] |
| Sentinel / Log Analytics (PowerBIActivity) | Teilmenge des Aktivitätslogs | Nur Subset, für umfassende Adoptionsanalyse ungeeignet | Azure-Rechte | [Q-TLA] |
| **Scanner API** (GetModifiedWorkspaces, PostWorkspaceInfo, GetScanStatus, GetScanResult) | Inventar: Items, Besitzer, Sensitivity Label, Tags, Endorsement, Nutzer, Datenquellen, Lineage; mit Zusatzsettings Tabellen, Spalten, Measures, DAX, Mashup | Inkrementell (modified date max. 30 Tage), Ergebnis binnen 24 h abholen | Fabric-Admin oder SP; Tenant-Settings „Enhance admin APIs responses with detailed metadata" und „... with DAX and mashup expressions" | [Q-SCAN] [Q-SCAN-SETUP] [Q-TLA] |
| Get Groups As Admin (`$expand` users, reports, datasets) | Workspaces, Items, Rollen | Synchron, Volltransfer, Drosselung | Admin / SP | [Q-TLA] |
| Weitere Admin-APIs (read-only, SP-fähig) | Get User Artifact Access As Admin, Get Group Users As Admin, Get App Users As Admin, Get Report Users As Admin, Get Report Subscriptions As Admin, Get User Subscriptions As Admin, WidelySharedArtifacts LinksSharedToWholeOrganization, WidelySharedArtifacts PublishedToWeb, Get Unused Artifacts As Admin, Get Datasets As Admin, Get Capacities | je API | Admin / SP | [Q-AUD-OV] [Q-SP-ADMIN] [Q-TLA] |
| **List Tenant Settings** (Fabric Admin REST, `v1/admin/tenantsettings`) | settingName, enabled, enabledSecurityGroups, excludedSecurityGroups, delegateToCapacity/Domain/Workspace, properties | 25 Requests/Minute | Fabric-Admin oder SP/Managed Identity, Scope Tenant.Read.All | [Q-API-TS] |
| Microsoft Graph | Nutzerprofile, Gruppenmitglieder und Besitzer, Service Principals, Lizenzen, Anmeldungen | Snapshot | Graph-Rechte (Entra) | [Q-TLA] |
| **Admin monitoring workspace** / **Govern-Bericht (OneLake catalog)** | Inventar, Kapazitäten, Domänen, Workspaces, Feature-Nutzung, Aktivitäten, Sharing, Endorsement, Kuratierung, Label-Abdeckung, DLP-Aktivität, „Recommended actions" | Täglicher Refresh, Aktivität rollierend 30 Tage; Feature Usage and Adoption bleibt Preview, wird nicht GA | Fabric-Admin; Teilen an Nicht-Admins möglich, Build-Recht auf Modell für eigene Berichte | [Q-AMW] [Q-FUA] [Q-GOVERN] |
| **Workspace Monitoring** (Eventhouse, Tabelle SemanticModelLogs u. a.) | Je Operation: ExecutingUser, User, ApplicationName, ApplicationContext (z. B. Report-ID), EventText (DAX), DurationMs, CpuTimeMs, DatasetMode, Status, XmlaProperties, CallerIpAddress | Je Workspace aktivieren; Tenant-Setting „Workspace admins can turn on monitoring"; Logs können sensible Inhalte enthalten, Zugriff einschränken | Workspace-Admin aktiviert; Leserechte auf Eventhouse | [Q-WSMON] [Q-SMOPS] [Q-AUDUSE-TS] |
| Log Analytics für Semantikmodelle | Wie oben (gleiche Trace-Basis) | 30 Tage Standard-Retention empfohlen, nur bei Bedarf verbinden (Kosten) | Workspace-Admin + Azure-Rechte | [Q-DLA] |
| **Fabric Capacity Metrics App** | CU-Auslastung, Throttling, Overages, abgelehnte Operationen (mit Nutzer, Operation-ID), Top-Items, Speicher | 14 Tage Compute, 30 Tage Storage; keine Alerts (dafür Capacity Events); Nutzerdaten per Tenant-Setting ausblendbar | Kapazitäts-Admin/Contributor | [Q-CMA] [Q-THROTTLE] |
| Usage Metrics (Bericht) | Views, Seitenaufrufe, Öffnungsdauer, Konsummethode | 30 Tage, max. ein Workspace, Client-Telemetrie | Contributor+ im Workspace | [Q-RLA] |
| Defender for Cloud Apps | Aktivitäten, Anomalie-Alerts, Session- und Access-Policies | Lizenz (E5 o. ä.) | Eigene Power-BI-Admin-Rolle in Defender | [Q-DCA] |
| Purview Activity Explorer, DLP-Alert-Dashboard | Label-Aktivität dienstübergreifend, Begründungen bei Labelwechsel, DLP-Treffer | | Purview-Rollen | [Q-IPAUD] [Q-DLP] |
| Gateways (Power Platform admin center, Gateway-Cmdlets, Power BI REST Get Gateways, Gateway-Logs) | Gateway-Anzahl, Installer, Verbindungen, Rollen, Fehler, Offline | | Gateway-Admin | [Q-GW] |
| Fabric identities (Govern > Configurations) | Liste aller Workspace Identities mit Status, Workspace, Rolle, Export als CSV | | Fabric-Admin | [Q-FABID] [Q-WSID] |

### b2 Relevante Activity-Log-Operationen (Auswahl, Namen aus der Operation list geprüft)

| Thema | Operationen | Zweck | Kennz. |
|---|---|---|---|
| Export / Download | ExportReport (Bericht in anderes Format oder Visual-Daten), ExportArtifact, ExportTile, DownloadReport, ExportDataflow | Wer exportiert viel; Basis für Schulung statt pauschalem Sperren | [MS] Microsoft empfiehlt, Exporte im Normalfall über das Aktivitätslog zu beobachten und Nutzer zu schulen, Formate nur bei regulatorischem Bedarf abzuschalten [Q-IP] |
| Analyze in Excel / externe Tools | AnalyzeInExcel, AnalyzeInExcelDataset, AnalyzeInExcelReport, AnalyzedByExternalApplication, ConnectFromExternalApplication, Create/Edit/Delete/RefreshDatasetFromExternalApplication | Zugriffe über Build-Recht, XMLA, Excel | [MS] (Operationen) / [Abl.] (Auswertung) |
| Teilen | ShareReport, ShareDataset, ShareArtifact, CreateOrgApp, UpdateApp, InstallApp, ArtifactAccessRequest, UpdateAccessRequestSettings | Freigabewege, Überteilen; App-Rechte: UpdateApp zeigt nur Änderungen, für vollständigen Stand Get App Users As Admin nutzen | [MS] [Q-ACTLOG] |
| Öffentlich | PublishToWebReport, DeleteEmbedCode, UpdateEmbedCodeOwner | Neue Embed Codes erkennen | [MS] [Q-TADM] |
| Embedding | GenerateEmbedToken, GenerateMultiResourceEmbedToken, Create/Update/Delete ServicePrincipalProfile | App-owns-data-Nutzung, Profile | [Abl.] (Operationen existieren, Auswertung nicht beschrieben) |
| Abos | CreateEmailSubscription, UpdateEmailSubscription, RunEmailSubscription, TakeOverEmailSubscription | Abo-Nutzung, Abos an Externe | [MS] [Q-TLA] |
| Labels / DLP | SensitivityLabelApplied, SensitivityLabelChanged, SensitivityLabelRemoved, DLPRuleMatch | Label-Hygiene, Downgrades | [MS] [Q-IPAUD] |
| Administration | UpdatedAdminFeatureSwitch, AddAdminPersonalWorkspaceAccess, CreateFolder, UpdateWorkspaceAccess, MigrateWorkspaceIntoCapacity, ChangeCapacityState, AddGroupMembers | Konfigurations- und Zugriffsänderungen | [MS] [Q-TADM] |
| Datenquellen / Gateways | AddDatasourceToGateway, BindToGateway, ChangeGatewayAdministrators, ChangeGatewayDatasourceUsers, UpdateDatasourceCredentials, UpdateGatewayClusterDatasourceCredentials, SetAllConnections, TakeOverDataset, TakeOverDatasource, UpdateDatasetParameters | Wer ändert Quellen, Credentials, Besitz | [MS] Frage „When is a gateway or data source created or updated, and by which user?" [Q-TLA] |
| Nutzung | ViewReport (DistributionMethod, ConsumptionMethod), ViewUsageMetrics, ReadArtifact | Adoption, ungenutzte Inhalte | [MS] |
| Externe Datenfreigabe | CreateExternalDataShare, AcceptExternalDataShare, RevokeExternalDataShare | OneLake-Freigaben an fremde Tenants | [Abl.] |

Hinweis [Abl.]: Für „Semantic Model Execute Queries REST API" habe ich in der Operation list keine eigene gleichnamige Operation gefunden. Ausgeführte DAX-Abfragen über die REST-API sind verlässlich nur in den Semantikmodell-Logs (Workspace Monitoring, Log Analytics) sichtbar; genau dort setzt fabscan heute schon an. Ebenso gibt es keine eigene Operation „Freigabelink erstellt"; Org-weite Links liefert die Admin-API WidelySharedArtifacts LinksSharedToWholeOrganization.

### b3 Kennzahlen, die Microsoft als Fragen formuliert (direkt nutzbar als Statistik)

Aus „Tenant-level auditing" und „Auditing and monitoring overview" [MS] [Q-TLA] [Q-AUD-OV]:
* Meistgesehene Inhalte und von wem; Tages-/Wochen-/Monatstrend; steigen oder fallen Views; Anzahl aktiver Nutzer.
* Welche Sicherheitsart wird am häufigsten genutzt (App, Workspace, Einzelfreigabe).
* Browser vs. Mobile.
* Aktivste Ersteller, was wird wann von wem veröffentlicht.
* Wer teilt zu viel aus dem persönlichen Workspace, wer exportiert viel, wer lädt regelmäßig herunter, wer veröffentlicht viele neue Modelle, wer nutzt Abos stark.
* Wann wurden Tenant-Einstellungen geändert und von welchem Admin; wer hat einen Trial gestartet.
* Welche Inhalte werden von externen Nutzern abgerufen, wer, wann, wie.
* Wer hat ein Label gesetzt oder geändert.
* **Anteil der Report-Views auf zertifizierten Modellen**; **Anteil der Modelle mit mehr als einem Bericht**.
* Wann wurde ein Gateway oder eine Datenquelle angelegt/geändert und von wem.
* Inventar: Workspaces mit den meisten Inhalten, Abhängigkeiten, Lineage inkl. externer Quellen, **verwaiste Berichte**, Dubletten, Wachstum von Berichten und Modellen, ungenutzte Berichte/Modelle.
* Sicherheit: auf welche Berichte hat ein Nutzer/Gruppe/SP Zugriff; wer abonniert; Workspace-Rollen je Nutzer/Gruppe; App-Zielgruppen; Einzelrechte je Bericht und je Modell; **welche Modelle haben RLS**; welche Items sind org-weit geteilt; welche Items sind öffentlich im Web; wer darf per Deployment Pipeline veröffentlichen; wer verwaltet Gateways und Verbindungen; wer verwaltet Kapazitäten.
* Kosten: aktive vs. lizenzierte Nutzer, ungenutzte Pro/PPU-Lizenzen.
* Aktionsregel: **Refresh häufiger als Views** heißt Owner kontaktieren. [MS] [Q-TLA]

Klassifizierungen für das Analysemodell (Nutzer nach Aktivitätsgrad, Inhalte nach Nutzungsgrad) empfiehlt Microsoft ausdrücklich. [MS] [Q-AUD-OV]

---

## (c) Risiken und Prüfpunkte mit Begründung

| # | Prüfpunkt | Begründung laut Learn | Datenquelle | Kennz. | Quelle |
|---|---|---|---|---|---|
| R1 | Zu viele Fabric-Admins (Ziel 2 bis 4), keine PIM-Nutzung | Hochprivilegierte Rolle, kann sich selbst Workspace-Zugriff geben und alle Metadaten sehen | Entra/Graph, Admin-Center | [MS] | [Q-TADM] [Q-TLA] |
| R2 | Zu viele Workspace-Admins, wo Member/Contributor/Viewer reichen | Least Privilege | Scanner, Get Group Users As Admin | [MS] | [Q-TLA] |
| R3 | Übermäßiges Build-Recht, wo Read reicht | Build erlaubt Analyze in Excel, XMLA-Abfragen, Export der Detaildaten, neue Berichte, Chaining | Scanner (Dataset-Nutzer, `Explore`), Get Datasets/Report Users As Admin | [MS] | [Q-TLA] [Q-CCSEC] [Q-DSPERM] |
| R4 | Viele Einzelrechte (Links, Direktzugriff) statt App oder Viewer-Rolle | Pflege fehleranfällig, App ist Best Practice für Konsumenten | Scanner, Get User Artifact Access As Admin | [MS] | [Q-TLA] [Q-RCSEC] |
| R5 | RLS umgangen durch Write-Recht | Contributor/Member/Admin oder Item-Write sehen alle Daten trotz RLS; RLS-Modelle nur mit Read (oder Read+Build) für Konsumenten | Scanner (Rollen + RLS-Flag) | [MS] | [Q-RCSEC] |
| R6 | Modell ohne RLS-Rollen | Wer Leserecht hat, sieht alles | Scanner mit Detailmetadaten, INFO-Funktionen | [MS] | [Q-RCSEC] |
| R7 | Zertifizierte Modelle ohne RLS (wenn Policy RLS verlangt) | Microsoft nennt RLS-Pflicht für zertifizierte Modelle als typisches internes Erfordernis, prüfbar per Get Datasets As Admin | Scanner / Admin-API | [MS] | [Q-AUD-OV] [Q-RCSEC] |
| R8 | RLS im Embedding falsch: Embed Token ohne EffectiveIdentity | Ohne EffectiveIdentity hat das Token Zugriff auf das ganze Modell; RLS-Rollen im Service wirken bei App-owns-data nicht; USERPRINCIPALNAME liefert bei SP-Embedding nicht den Endnutzer; „Test as role" simuliert Embedding nicht | Code-Review, GenerateEmbedToken-Events | [MS] | [Q-EMBTOKEN] [Q-RLS] |
| R9 | Publish to web aktiv oder breit erlaubt, Embed Codes mit sensiblen Daten | Öffentlich ohne Anmeldung, nicht protokolliert, über Suchmaschinen auffindbar, Detaildaten erreichbar; Setting nur für kleine Gruppe | WidelySharedArtifacts PublishedToWeb, Embed-Codes-Seite, PublishToWebReport, Tenant Settings | [MS] | [Q-TADM] [Q-P2W] [Q-CCSEC] |
| R10 | Org-weite Freigabelinks, besonders bei „Highly Restricted" | Unerwartete Nutzung eines Org-Links früh erkennen; Label mit vielen Berechtigungen korrelieren | LinksSharedToWholeOrganization, Scanner Labels | [MS] | [Q-AUD-OV] |
| R11 | Externe Freigaben, Ad-hoc-Gäste, Abos an Externe | Geplante Einladung empfohlen; Abos an Nicht-Gäste über Get Report Subscriptions As Admin („unresolved") | Activity Log, Admin-API, Tenant Settings | [MS] | [Q-TLSEC] [Q-TLA] |
| R12 | Häufiger Export / Download / Drucken | Datenabfluss; erst schulen, nur bei Regulierung sperren; CSV, XML, MHTML, PNG behalten keinen Labelschutz; PDF-Export aus Desktop verliert Schutz | Activity Log (ExportReport u. a.), Defender | [MS] | [Q-IP] [Q-TLA] |
| R13 | Tenant-Setting-Änderungen durch unerwartete Personen | Schnell zurücksetzen; Alert über M365- oder Defender-Policies | UpdatedAdminFeatureSwitch + Snapshot-Diff | [MS] | [Q-AUD-OV] [Q-TADM] |
| R14 | Breite Admin-API-Rechte für Service Principals | Settings geben tenantweiten Metadatenzugriff ohne Power-BI-Rechte, „tightly control"; separate App-Registrierungen read vs. write, Secret-Rotation | List Tenant Settings (enabledSecurityGroups), Graph | [MS] | [Q-TLA] [Q-ADMINAPI-TS] |
| R15 | Service Principals mit Fabric-API-Zugriff, SP-Profile, Workspace Identities | Workspace Identity: jeder mit Zugriff kann sie annehmen; Application Administrators können sie ändern | Fabric identities, Purview Audit, Developer Settings | [MS] | [Q-WSID] [Q-DEV-TS] |
| R16 | Fehlende oder inkonsistente Sensitivity Labels | Reifegrad 200 vs. 300; Pflichtlabel prüfbar per Scanner; Datenschutzmetrikbericht zeigt Anteil unbeschriftet | Scanner, Govern-Bericht | [MS] | [Q-SYS] [Q-IPAUD] |
| R17 | Label-Downgrade, Label entfernt, Massenentfernung | Admin-/Owner-Review bzw. regelmäßige Revision; Defender-Policy-Beispiele | Activity Log, Purview Activity Explorer, Defender | [MS] | [Q-IPAUD] [Q-DCA] |
| R18 | Sensible Daten in Modellen (Kreditkarten, IDs, Passwörter, Verbindungsstrings) | DLP mit Sensitive Info Types prüft Modelle bei Upload und Refresh; Hinweis: wenn ohne Analysewert, gar nicht speichern | DLP, Scanner (Spaltennamen) | [MS] | [Q-DLP] [Q-AUD-OV] |
| R19 | Unbekannte oder nicht freigegebene Datenquellen, Dateien an falschem Ort | Governance- und Risiko-Situation, aktiv danach suchen | Scanner (Datasources), Lineage | [MS] | [Q-TLA] [Q-AUD-OV] |
| R20 | Persönliche Gateways, zu viele Gateways, Gateway-Überteilen, Gateways auf Nutzerrechnern, Verbindungen auf lokale Dateien, ignorierte Privacy Levels | Governance-Risiko, unerwartete Installer prüfen | Power Platform admin center, Get Gateways, Activity Log | [MS] | [Q-GW] [Q-TLA] |
| R21 | Gespeicherte Credentials, Servicekonten | Least Privilege, nie Schreibrechte; Rotation, z. B. alle drei Monate oder bei Austritt; Credentials per REST aktualisierbar | Gateway-/Datasource-APIs, UpdateDatasourceCredentials | [MS] | [Q-CCSEC] [Q-GW] |
| R22 | Viel Nutzung nicht endorsierter Inhalte | Kritische Inhalte zertifizieren, Ownership klären | Activity Log + Scanner (Endorsement) | [MS] | [Q-TLA] |
| R23 | Ungenutzte Inhalte, verwaiste Berichte, Refresh ohne Nutzung | Stilllegen, Kosten, Klarheit | Inventar + Activity Log, Get Unused Artifacts | [MS] | [Q-TLA] [Q-AUD-OV] |
| R24 | Wiederholte Refresh-Fehler | Governance-Situation, aktiv beobachten | Refresh-Historie, Capacity Metrics, Logs | [MS] | [Q-TLA] |
| R25 | Unerwartete oder übermäßige Abos | dto. | Activity Log, Subscriptions As Admin | [MS] | [Q-TLA] |
| R26 | Workspace-Namen entgegen Konvention, verwaiste Workspaces ohne Admin | Admin-Aufgabe | Scanner, Admin-Portal | [MS] | [Q-TLA] [Q-TADM] |
| R27 | XMLA / Analyze in Excel / Live Connections für alle offen | Setting auf Gruppen wie „approved content creators" eingrenzen erwägen; XMLA-Lesen braucht Build, RLS gilt | Tenant Settings | [MS] | [Q-CCSEC] |
| R28 | Reshare-Recht großzügig vergeben | Microsoft empfiehlt, Reshare zu begrenzen und vorher den Owner zu fragen | Scanner (ReadReshare...) | [MS] | [Q-CCSEC] |
| R29 | App-Rechte und Modellrechte entkoppelt | Entzug in der App entzieht keine Modellrechte; Build über App-Audience nimmt Owner die Kontrolle | Get App Users As Admin + Dataset Users | [MS] | [Q-RCSEC] |
| R30 | Kapazität überlastet / Throttling | Dauerhaft hohes Throttling heißt verteilen oder skalieren; abgelehnte Operationen mit Nutzer sichtbar | Capacity Metrics App, Capacity Events | [MS] | [Q-CMA] [Q-THROTTLE] |
| R31 | Monitoring-Daten selbst als Risiko | Workspace-Monitoring-Logs können PII und Credentials aus Konfigurationen enthalten; Zugriff auf das Monitoring-Eventhouse beschränken; Capacity Metrics und Usage Metrics zeigen Namen und E-Mails (per Setting abschaltbar) | Tenant Settings, Eventhouse-Rollen | [MS] | [Q-WSMON-DF] [Q-AUDUSE-TS] |
| R32 | Admin monitoring workspace weit geteilt | Zugriff lässt sich ohne Neuinitialisierung nicht wieder entziehen | Workspace-Rollen | [MS] | [Q-AMW] |
| R33 | Conditional Access fehlt (MFA, konforme Geräte, IP-Bereiche) | Basis der Power-BI-Sicherheit ist Entra | Entra | [MS] | [Q-TLSEC] |
| R34 | DLP-Scope unvollständig (neue Premium-Workspaces nicht enthalten) | Auditprozess nötig, wenn nur Teilmengen im Scope | DLP-Policy vs. Workspace-Inventar | [MS] | [Q-DLP] |
| R35 | Dynamische Gruppen in Power-BI-Berechtigungen, M365-Gruppen für Tenant Settings | Dynamische Mitgliedschaft wird für Power BI nicht unterstützt; Tenant Settings nur mit Sicherheitsgruppen | Graph + Scanner | [MS] | [Q-TLSEC] |

Ergänzende Ableitungen für fabscan [Abl.]:
* **Rechte-Wirksamkeit je Modell**: Aus Scanner (Workspace-Rollen, Dataset-Nutzer mit Read/Explore/Reshare/Write) plus RLS-Definition einen Befund „RLS wirksam für N Personen, umgangen für M Personen (Write)" berechnen. Das verbindet R3, R5, R6 und ist genau die Lücke zwischen Modellprüfung (heute in fabscan) und Berechtigungsinventur (fehlt).
* **App-owns-data-Muster**: fabscan erkennt SEC-AUTH (SP statt Nutzer) bereits im Code; ergänzend GenerateEmbedToken-Ereignisse und den EffectiveIdentity-Gebrauch im Code prüfen (R8).
* **ExecuteQueries-/XMLA-Konsum**: Microsoft beschreibt Build als Tor zu Analyze in Excel, XMLA und Detailexport; fabscan wertet SemanticModelLogs schon aus und könnte Abfragen je ApplicationName und je Nutzer gegen das Build-Recht spiegeln.
* **Tenant-Settings-Ampel**: Snapshot per List Tenant Settings und Vergleich gegen eine Soll-Liste (Publish to web, Export-Formate, Guest access, Org-Links, XMLA, Execute Queries REST API, SP-Settings, MCP-Endpoint, External data sharing) ist eine direkte Umsetzung der Reifegrad-500-Empfehlung.

---

## (d) Quellenverzeichnis (Microsoft Learn)

Power BI implementation planning und Adoption Roadmap:
* [Q-AUD-OV] Auditing and monitoring (Overview): https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-overview
* [Q-TLA] Tenant-level auditing: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-tenant-level-auditing
* [Q-TLM] Tenant-level monitoring: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-tenant-level-monitoring
* [Q-DLA] Data-level auditing: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-data-level-auditing
* [Q-RLA] Report-level auditing: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-auditing-monitoring-report-level-auditing
* [Q-ACTLOG] Access the Power BI activity log: https://learn.microsoft.com/power-bi/guidance/admin-activity-log
* [Q-ADOPT] Adoption tracking: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-adoption-tracking
* [Q-RCSEC] Report consumer security planning: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-security-report-consumer-planning
* [Q-CCSEC] Content creator security planning: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-security-content-creator-planning
* [Q-TLSEC] Tenant-level security planning: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-security-tenant-level-planning
* [Q-TADM] Tenant administration: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-tenant-administration
* [Q-IP] Information protection for Power BI: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-info-protection
* [Q-IPAUD] Auditing of information protection and DLP: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-auditing-info-protection-data-loss-prevention
* [Q-DLP] Data loss prevention for Power BI: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-data-loss-prevention
* [Q-DCA-PLAN] Defender for Cloud Apps for Power BI: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-defender-for-cloud-apps
* [Q-GW] Data gateways: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-data-gateways
* [Q-GOV] Fabric adoption roadmap, Governance: https://learn.microsoft.com/power-bi/guidance/fabric-adoption-roadmap-governance
* [Q-SYS] Fabric adoption roadmap, System oversight: https://learn.microsoft.com/power-bi/guidance/fabric-adoption-roadmap-system-oversight

Fabric Administration, Governance, Security:
* [Q-AMW] Admin monitoring workspace: https://learn.microsoft.com/fabric/admin/monitoring-workspace
* [Q-FUA] Feature usage and adoption report: https://learn.microsoft.com/fabric/admin/feature-usage-adoption
* [Q-GOVERN] Govern in the OneLake catalog: https://learn.microsoft.com/fabric/governance/onelake-catalog-govern
* [Q-WSMON] Workspace monitoring: https://learn.microsoft.com/fabric/fundamentals/workspace-monitoring-overview
* [Q-WSMON-DF] Workspace monitoring, Sicherheitshinweise (Data Factory): https://learn.microsoft.com/fabric/data-factory/workspace-monitoring
* [Q-SMOPS] Semantic model operations (SemanticModelLogs): https://learn.microsoft.com/fabric/enterprise/powerbi/semantic-model-operations
* [Q-CMA] Fabric Capacity Metrics app: https://learn.microsoft.com/fabric/enterprise/metrics-app
* [Q-THROTTLE] Throttling policy: https://learn.microsoft.com/fabric/enterprise/throttling
* [Q-OPLIST] Operation list: https://learn.microsoft.com/fabric/admin/operation-list
* [Q-TRACK] Track user activities in Power BI: https://learn.microsoft.com/fabric/enterprise/powerbi/service-admin-auditing
* [Q-SCAN] Metadata scanning overview: https://learn.microsoft.com/fabric/governance/metadata-scanning-overview
* [Q-SCAN-SETUP] Set up metadata scanning: https://learn.microsoft.com/fabric/admin/metadata-scanning-setup
* [Q-SP-ADMIN] Enable service principal authentication for admin APIs: https://learn.microsoft.com/fabric/admin/enable-service-principal-admin-apis
* [Q-ADMINAPI-TS] Admin API tenant settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-admin-api-settings
* [Q-TS-ABOUT] About tenant settings: https://learn.microsoft.com/fabric/admin/about-tenant-settings
* [Q-TS-INDEX] Tenant settings index: https://learn.microsoft.com/fabric/admin/tenant-settings-index
* [Q-EXPSHARE] Export and sharing settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-export-sharing
* [Q-INTEG-TS] Integration settings (XMLA, Execute Queries REST API, MCP): https://learn.microsoft.com/fabric/admin/service-admin-portal-integration
* [Q-DEV-TS] Developer settings (SP, Profile, Fabric identities): https://learn.microsoft.com/fabric/admin/service-admin-portal-developer
* [Q-AUDUSE-TS] Audit and usage settings: https://learn.microsoft.com/fabric/admin/service-admin-portal-audit-usage
* [Q-EMBCODES] Manage embed codes: https://learn.microsoft.com/fabric/admin/service-admin-portal-embed-codes
* [Q-DCA] Defender for Cloud Apps controls in Power BI: https://learn.microsoft.com/fabric/governance/service-security-using-defender-for-cloud-apps-controls
* [Q-WSID] Workspace identity: https://learn.microsoft.com/fabric/security/workspace-identity
* [Q-FABID] Manage Fabric identities: https://learn.microsoft.com/fabric/admin/fabric-identities-manage
* [Q-RLS] Row-level security: https://learn.microsoft.com/fabric/security/service-admin-row-level-security
* [Q-LABEL] Sensitivity labels in Power BI: https://learn.microsoft.com/fabric/enterprise/powerbi/service-security-sensitivity-label-overview
* [Q-WAF] Well-Architected, Security für Fabric: https://learn.microsoft.com/azure/well-architected/microsoft-fabric/security

REST, Embedding, Purview:
* [Q-ACT-API] Admin, Get Activity Events: https://learn.microsoft.com/rest/api/power-bi/admin/get-activity-events
* [Q-API-TS] Tenants, List Tenant Settings: https://learn.microsoft.com/rest/api/fabric/admin/tenants/list-tenant-settings
* [Q-DSPERM] Semantic model REST API permissions (Read/Explore/Reshare): https://learn.microsoft.com/power-bi/developer/embedded/datasets-permissions
* [Q-EMBTOKEN] Generate an embed token: https://learn.microsoft.com/power-bi/developer/embedded/generate-embed-token
* [Q-P2W] Publish to web: https://learn.microsoft.com/power-bi/collaborate-share/service-publish-to-web
* [Q-DLP-PV] DLP for Fabric and Power BI (Purview): https://learn.microsoft.com/purview/dlp-powerbi-get-started

---

## (e) Kurzabgleich mit fabscan 0.5.1 [Abl.]

Bereits abgedeckt (Microsoft-Bezug):
* Modellebene aus Scanner bzw. getDefinition/INFO.VIEW: RLS vorhanden (SEC-NO-RLS, entspricht R6), Measures, ausgeblendete Felder.
* Tatsächlicher Abfragekonsum aus SemanticModelLogs (Microsoft: DAX-Abfragen, Clientanwendungen, RLS-Rollen je Nutzer auswerten) [Q-DLA] [Q-SMOPS].
* Service Principal statt Nutzer in Apps (SEC-AUTH), Client-seitige Filter (SEC-CLIENT-RLS) als Spezialfall von R8.

Größte Lücken gegenüber den Learn-Erwartungen (nach Gewicht):
1. Berechtigungsinventur (Workspace-Rollen, Item-Rechte inkl. Build/Write/Reshare, App-Zielgruppen, Org-Links, Publish to web) und daraus „RLS wirksam/umgangen" (R2 bis R7, R9, R10, R28, R29).
2. Activity-Log-Auswertung (Export, Teilen, Extern, Embed Token, Tenant-Setting-Änderungen) mit eigener Speicherung über 28 Tage hinaus (R11 bis R13, Kennzahlen aus b3).
3. Tenant-Settings-Snapshot und Diff gegen Soll (R13, R14, R27, Reifegrad 500).
4. Sensitivity-Label-Abdeckung und Label-Ereignisse (R16, R17), Endorsement-Anteil (R22).
5. Datenquellen, Gateways, Credentials (R19 bis R21), ungenutzte Inhalte (R23).
6. Identitäten: SP in Admin-API-Gruppen, Workspace Identities (R14, R15).
