# Microsoft Fabric — Einsteiger-Guide

> Markdown-Fassung von [fabric_einsteiger_guide_v1.html](../fabric_einsteiger_guide_v1.html) · https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

EINSTEIGER-GUIDE · MICROSOFT FABRIC · END-TO-END

Für alle, die Power BI kennen und jetzt verstehen wollen, was Microsoft Fabric darunter aufbaut — von OneLake über Lakehouse, Warehouse, Pipelines und Notebooks bis zum Direct-Lake-Modell im Power-BI-Bericht. Mit einem End-to-End-Beispiel und Tiefenfokus auf Direct Lake und Snowflake-Integration.

**v 1 · Einsteiger** · Beta · Stand Juli 2026 · DE · 6 Sektionen · 40 klickbare Detail-Karten

Michael Tenner · Power BI · Microsoft Fabric · Daten-WG · [LinkedIn](https://www.linkedin.com/in/michael-tenner-5b885970/)

## Wo soll ich anfangen?

Dieser Guide ist **kein Buch**, das du von vorn nach hinten liest. Es ist eine Klick-Erkundung: sechs Sektionen, je 6–10 anklickbare Karten, jede führt zu einem Detail-Fenster mit Erklärung, Schritt-für-Schritt und Original-Screenshots aus Microsoft Learn.

Wenn du **aus der Power-BI-Welt** kommst, ist der rote Faden: Sektion **1 → 2 → 3** baut das mentale Modell (Was ist Fabric? → Welche Bausteine gibt es? → Wie kommt daraus ein Power-BI-Bericht?). Sektion **4** macht es einmal komplett praktisch durch. Sektion 5 (Snowflake) und 6 (Architektur-Entscheidungen) sind Vertiefung für konkrete Projektfragen.

Wenn du eine Karte anklickst, öffnet sich ein Modal. Mit `Esc` schließen, oder neben das Fenster klicken.

## Die Reise durch Microsoft Fabric

Sechs Etappen, von der Einordnung bis zur Architektur-Entscheidung. Klick führt direkt zur Sektion.

- **Einordnung** — 01 · ORIENTIERUNG
- **Architektur & Komponenten** — 02 · PLATTFORM
- **Semantik & Direct Lake** — 03 · MODELLE
- **End-to-End-Beispiel** — 04 · PRAXIS
- **Snowflake-Daten** — 05 · SPEZIAL
- **Entscheidungen** — 06 · STRATEGIE

## 01 · Einordnung von *Microsoft Fabric*

Microsoft Fabric ist kein weiteres Azure-Tool, sondern der Versuch, den kompletten Analytics-Stack — Integration, Engineering, Warehousing, Streaming, BI — als eine SaaS-Plattform zu bündeln. Wer versteht, warum es Fabric gibt und wie Power BI hineinpasst, kann jede weitere Detail-Frage einsortieren.

> Als erstes: **„Was ist Microsoft Fabric?" und „Fabric & Power BI"** lesen — das ist die Grundorientierung. Danach „Workloads & Experiences" für den Überblick, was alles dazugehört.

**1** — Plattform · Datensee · Datenkopie

**Das Kernversprechen von Fabric:** Eine SaaS-Plattform statt vieler einzeln zu konfigurierender PaaS-Dienste, ein logischer Data Lake (OneLake) für den ganzen Tenant, und eine einzige Kopie der Daten, auf der alle Engines arbeiten — Spark, T-SQL, KQL und Power BI.

**Vorher:** Azure Data Factory für Integration, Synapse für Warehouse und Spark, Event Hubs + Stream Analytics für Streaming, Power BI für Reporting — vier Dienste, vier Sicherheitsmodelle, viele Datenkopien.

**Mit Fabric:** dieselben Fähigkeiten als Workloads einer Plattform, mit gemeinsamem Speicher (OneLake), gemeinsamer Governance (Purview) und gemeinsamer Abrechnung (Capacity Units).

### Was ist Microsoft Fabric?

*EINORDNUNG · GRUNDLAGEN*

Eine End-to-End-Analytics-Plattform: Datenintegration, Data Engineering, Warehousing, Real-Time-Streaming, Data Science und Power BI — als ein SaaS-Produkt statt vieler Einzeldienste.

#### Was ist das?

Microsoft Fabric bündelt den kompletten Analytics-Lebenszyklus — vom Laden der Rohdaten bis zum fertigen Bericht — in einer Plattform. Der entscheidende Unterschied zu klassischen Azure-Diensten ist das **SaaS-Fundament**: Sicherheit, Compliance, Governance und Infrastruktur sind eingebaut („no setup or minimal setup"), statt pro Dienst konfiguriert werden zu müssen. Du legst keinen Cluster, kein Storage-Konto und keine Netzwerk-Regeln an — du legst einen Workspace an und arbeitest.

#### Die drei Plattform-Schichten unter den Workloads

- **OneLake** — ein logischer Data Lake für den ganzen Tenant, alle Engines lesen und schreiben dieselben Daten
- **Copilot & KI** — eingebettete KI-Assistenz quer durch alle Workloads
- **Governance** — powered by Microsoft Purview: Berechtigungen, Sensitivity Labels, Auditing, OneLake Catalog

![Fabric-Architektur-Diagramm: Workloads Data Factory, Analytics, Databases, Real-Time Intelligence und Power BI auf dem gemeinsamen Fundament aus OneLake, Copilot und Purview-Governance](https://learn.microsoft.com/en-us/fabric/fundamentals/media/microsoft-fabric-overview/fabric-architecture.png)

**Abb. · Die Fabric-Architektur** Alle Workloads teilen sich Speicher (OneLake), KI (Copilot) und Governance (Purview). Quelle: [What is Microsoft Fabric? · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/microsoft-fabric-overview)

> **In einem Satz für Power-BI-Menschen:** Fabric ist das, was passiert, wenn man den Power-BI-Service nimmt und den kompletten Daten-Backend-Stack (Data Factory, Synapse, Streaming) in dieselbe Oberfläche, denselben Speicher und dasselbe Lizenzmodell integriert.

> **Kostenlos ausprobieren:** Die Fabric-Trial läuft 60 Tage und entspricht einer Kapazität mit 64 Capacity Units (F64-Niveau) — genug, um alles in diesem Guide praktisch nachzubauen.

**Weiterlesen:** [What is Microsoft Fabric? · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/microsoft-fabric-overview) · [Lernpfad: Get started with Microsoft Fabric](https://learn.microsoft.com/training/paths/get-started-fabric/)

**Daten-WG dazu:**

- **[Microsoft Fabric — braucht das wirklich jemand?](https://youtu.be/mTVeZzshLzE)** · Talk · 48 min · DE · [Knowledge Kitchen](../index.html#ep-mTVeZzshLzE)
- **[Starting with Microsoft Fabric — the skills you need](https://youtu.be/m3xNYfVih0Q)** · Talk · 50 min · EN · [Knowledge Kitchen](../index.html#ep-m3xNYfVih0Q)

### Warum wurde Fabric entwickelt?

*EINORDNUNG · MOTIVATION*

Weil der klassische Analytics-Stack aus vier, fünf getrennten Diensten bestand — mit getrennten Sicherheitsmodellen, getrennter Abrechnung und vor allem: vielen Kopien derselben Daten.

#### Das Problem davor

Ein typisches Azure-BI-Projekt vor Fabric: Azure Data Factory lädt Daten in einen Data Lake (ADLS Gen2), Synapse Spark bereitet sie auf, Synapse Dedicated Pool hält das Warehouse, Power BI importiert die Daten *noch einmal* in sein eigenes Modell. Ergebnis: dieselben Daten liegen drei- bis viermal vor, jede Station hat eigene Berechtigungen, eigenes Monitoring, eigene Kostenstelle — und jede Übergabe ist eine Fehlerquelle.

#### Die Fabric-Antwort

- **Ein Speicher:** OneLake im offenen Delta-Parquet-Format — alle Engines arbeiten auf derselben Kopie („One Copy")
- **Ein Sicherheits- und Governance-Modell:** einmal definiert, gilt überall (Purview-Integration)
- **Eine Abrechnung:** Capacity Units, die sich alle Workloads teilen — kein Dienst-für-Dienst-Einkauf
- **Eine Oberfläche:** Data Engineer, Analyst und Business-User arbeiten im selben Portal in denselben Workspaces

> **Praxis-Beispiel:** Vor Fabric: Der Data Engineer exportiert nachts Parquet-Dateien, der BI-Entwickler importiert sie morgens ins Power-BI-Modell — zwei Refreshes, vier Stunden Latenz. In Fabric schreibt das Notebook eine Delta-Tabelle, das Direct-Lake-Modell sieht sie nach dem nächsten Framing — ohne zweiten Datenimport.

**Weiterlesen:** [Microsoft Fabric Overview · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/microsoft-fabric-overview) · [James Serra: Benefits of migrating from Synapse to Fabric](https://www.jamesserra.com/archive/2024/11/fabric-benefits-over-synapse/)

### Einordnung: Synapse · ADF · Power BI

*EINORDNUNG · MICROSOFT-STACK*

Fabric ist der Nachfolger des „Modern Data Warehouse"-Stacks aus Azure Synapse, Azure Data Factory und Power BI Premium — als SaaS neu zusammengesetzt.

#### Wer geht wo auf?

- **Azure Data Factory** → Fabric **Data Factory** (Pipelines + Dataflows Gen2). Die Konzepte sind fast identisch; Unterschiede im Detail: die Fabric-Pipeline kennt z. B. Dataflow- und Notebook-Activities, „Execute Pipeline" heißt „Invoke Pipeline"
- **Synapse SQL Pools** → Fabric **Data Warehouse** (T-SQL auf OneLake, ohne dedizierte Cluster)
- **Synapse Spark** → Fabric **Data Engineering** (Notebooks, Spark Job Definitions, Lakehouse)
- **Azure Data Explorer / Stream Analytics** → Fabric **Real-Time Intelligence** (Eventstream, Eventhouse/KQL, Activator)
- **Power BI Premium** → **Fabric-Kapazitäten** (F-SKUs); der Power-BI-Service ist heute Teil des Fabric-Portals

#### Was Fabric nicht ersetzt

Operative Azure-Dienste laufen weiter: Azure SQL Database als OLTP-Quelle, Event Hubs als Messaging-Backbone, ADLS Gen2 als bestehender Data Lake (den man per Shortcut einbindet statt migriert). Auch bestehende ADF- und Synapse-Umgebungen laufen weiter — es gibt aber keinen automatischen Upgrade-Pfad, Migration ist ein Projekt.

> **Für die Architektur-Diskussion:** Die Kernfrage ist nicht „Fabric oder Azure?", sondern: Welche bestehenden Azure-Bausteine bleiben Quelle (per Shortcut/Mirroring angebunden) — und welche Verarbeitungsschritte ziehen nach Fabric um?

**Weiterlesen:** [ADF vs. Fabric Data Factory · Microsoft Learn](https://learn.microsoft.com/fabric/data-factory/compare-fabric-data-factory-and-azure-data-factory) · [endjin: Synapse vs. Fabric side-by-side](https://endjin.com/blog/2023/05/azure-synapse-analytics-versus-microsoft-fabric-a-side-by-side-comparison) · [James Serra: Fabric reference architecture](https://www.jamesserra.com/archive/2024/08/microsoft-fabric-reference-architecture/)

### Fabric & Power BI

*EINORDNUNG · BEZIEHUNG*

Power BI ist nicht „kompatibel mit" Fabric — es ist eine der Fabric-Experiences. Microsoft formuliert es offiziell: „Power BI Premium is now part of Fabric."

#### Was das konkret heißt

- **Workspaces sind Fabric-Workspaces:** Derselbe Workspace, der deine Berichte enthält, kann Lakehouses, Pipelines und Notebooks enthalten
- **Kapazitäten sind F-SKUs:** Die alte Premium-P1 entspricht einer F64; die Abrechnung läuft über Capacity Units, die sich Power BI mit allen anderen Workloads teilt
- **Semantische Modelle sind Fabric-Items:** Sie liegen im Workspace neben den Daten, auf denen sie basieren — und können mit Direct Lake direkt auf OneLake-Tabellen zeigen
- **Der Service ist das Portal:** app.powerbi.com und app.fabric.microsoft.com führen in dieselbe Oberfläche, nur mit anderem Workload-Fokus

![Hierarchie-Diagramm: Ein Fabric-Tenant enthält Kapazitäten, diese enthalten Workspaces, diese enthalten Items wie Lakehouses und semantische Modelle](https://learn.microsoft.com/en-us/fabric/fundamentals/media/microsoft-fabric-overview/hierarchy-within-tenant.png)

**Abb. · Tenant → Kapazität → Workspace → Items** Berichte, Modelle und Lakehouses sind gleichberechtigte Items in derselben Hierarchie. Quelle: [Microsoft Fabric Overview · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/microsoft-fabric-overview)

#### Was sich für Power-BI-Teams ändert

Kurzfristig: wenig — Berichte, Apps, RLS und Deployment funktionieren wie bisher. Mittelfristig: Das Team bekommt Zugriff auf den Daten-Layer. Statt auf den nächtlichen DWH-Export zu warten, kann ein Power-BI-Team eigene Dataflows Gen2, Lakehouses und Direct-Lake-Modelle bauen. Wer das nicht will, kann das Anlegen von Fabric-Items per Tenant-Setting deaktivieren („Users can create Fabric items").

> **Lizenz-Merksatz:** Zum *Erstellen* von Power-BI-Inhalten braucht es weiterhin eine Pro-Lizenz. Ab F64 dürfen Free-User Inhalte auf der Kapazität *konsumieren* — für Nicht-Power-BI-Items (Lakehouse, Notebook, Pipeline) braucht es gar keine Pro-Lizenz.

**Weiterlesen:** [Power BI Premium FAQ · Microsoft Learn](https://learn.microsoft.com/fabric/enterprise/powerbi/service-premium-faq) · [Build Power BI reports in Microsoft Fabric](https://learn.microsoft.com/power-bi/fundamentals/fabric-get-started)

**Daten-WG dazu:**

- **[Power BI-Teams werden Fabric-Datendienstleister](https://youtu.be/YzfcMurbWNc)** · Talk · 32 min · DE · [Knowledge Kitchen](../index.html#ep-YzfcMurbWNc)

### Workloads & Experiences

*EINORDNUNG · ÜBERBLICK*

Fabric organisiert sich in Workloads (auch „Experiences"): fachliche Sichten auf dieselbe Plattform, jede mit eigenen Item-Typen — aber alle auf demselben OneLake.

#### Die Workload-Landkarte (Stand 2026)

- **Data Factory** — Pipelines, Dataflows Gen2, Copy Jobs, Mirroring: Daten bewegen und orchestrieren
- **Data Engineering** — Lakehouse, Notebooks, Spark Job Definitions: Daten mit Spark verarbeiten
- **Data Warehouse** — Warehouse-Items: T-SQL-Modellierung und -Transformation
- **Data Science** — ML-Modelle, Experimente (MLflow-basiert)
- **Real-Time Intelligence** — Eventstream, Eventhouse/KQL-Datenbank, Real-Time Dashboards, Activator
- **Databases** — SQL Database und Cosmos DB direkt in Fabric (OLTP/NoSQL)
- **Power BI** — semantische Modelle, Berichte, Apps

![Diagramm: Alle Fabric-Compute-Engines — Data Engineering, Warehouse, Data Factory, Power BI, Real-Time Intelligence — greifen auf denselben OneLake-Speicher zu](https://learn.microsoft.com/en-us/fabric/fundamentals/media/microsoft-fabric-overview/onelake-architecture.png)

**Abb. · Viele Engines, ein Speicher** Jeder Workload rechnet mit eigener Engine, aber alle lesen und schreiben OneLake. Quelle: [Microsoft Fabric Overview · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/microsoft-fabric-overview)

> **Warum das für dich zählt:** Du musst nicht alle Workloads lernen. Ein typischer BI-Pfad braucht genau drei: Data Factory (Daten holen) → Data Engineering oder Warehouse (strukturieren) → Power BI (modellieren und berichten). Die Karten dieses Guides folgen diesem Pfad.

**Weiterlesen:** [Fabric terminology · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/fabric-terminology)

### Capacities, F-SKUs & Lizenzen

*EINORDNUNG · LIZENZEN*

Fabric rechnet in Capacity Units (CU) ab: Eine Kapazität (F-SKU) ist ein Pool an Rechenleistung, den sich alle Workloads eines oder mehrerer Workspaces teilen.

#### Das Modell in drei Sätzen

(1) Der Tenant kauft eine oder mehrere **F-SKUs** — von F2 (2 CU) über F64 (64 CU, entspricht der alten Premium P1) bis F2048. (2) Workspaces werden einer Kapazität zugeordnet; alles, was darin rechnet (Refresh, Spark-Job, SQL-Query, Bericht), verbraucht CUs. (3) Dazu kommen **Per-User-Lizenzen**: Free, Pro, Premium-per-User — wie bisher aus Power BI bekannt.

#### Die wichtigsten Regeln

- **F-SKUs** gibt es Pay-as-you-go (stunden-genau, pausierbar) oder als Reservierung (günstiger) — P-SKUs gab es nur im Jahres-Commitment
- **P-SKU-Retirement:** Premium-P-SKUs sind nicht mehr käuflich; bestehende Verträge laufen aus, danach 90 Tage Vollzugriff für die Migration auf F-SKUs
- **Ab F64** können Free-User Power-BI-Inhalte konsumieren (wie früher bei Premium); unterhalb von F64 braucht jeder Berichts-Konsument eine Pro-Lizenz
- **Fabric-Items ohne Pro:** Lakehouses, Notebooks, Pipelines kann jeder mit Free-Lizenz nutzen — Pro braucht nur, wer Power-BI-Inhalte erstellt
- **Trial:** 60 Tage, 64 CU — ideal für den Einstieg und alle Übungen dieses Guides

> **Betriebs-Tipp:** CU-Verbrauch überwacht man mit der **Fabric Capacity Metrics App** — Pflicht-Installation, sobald mehr als ein Team auf derselben Kapazität arbeitet. Schwere Background-Jobs (Spark, große Refreshes) von interaktiven BI-Lasten trennen, sonst drosseln sich beide gegenseitig.

**Weiterlesen:** [Understand Microsoft Fabric licenses · Microsoft Learn](https://learn.microsoft.com/fabric/enterprise/licenses) · [Premium-FAQ: Übergang P-SKU → F-SKU](https://learn.microsoft.com/fabric/enterprise/powerbi/service-premium-faq)

## 02 · Architektur & *zentrale Komponenten*

Alles in Fabric folgt demselben Muster: Daten liegen einmal in OneLake (Delta Parquet), verschiedene Engines rechnen darauf, und Shortcuts holen externe Daten dazu, ohne sie zu kopieren. Wer diese Bausteine kennt, kann jede Fabric-Architektur lesen.

> Als erstes: **„OneLake" öffnen** — ohne OneLake ergibt der Rest keinen Sinn. Danach **„Lakehouse" und „Warehouse"** im Vergleich, dann „Medallion" für das Zusammenspiel.

### OneLake — der Datensee des Tenants

*KOMPONENTEN · SPEICHER*

„OneDrive für Daten": Jeder Fabric-Tenant hat automatisch genau einen OneLake. Alle Workloads speichern ihre Daten dort — im offenen Delta-Parquet-Format.

#### Was ist das?

OneLake ist ein logischer Data Lake auf Basis von Azure Data Lake Storage Gen2. „Logisch", weil du ihn nicht anlegst oder konfigurierst — er ist einfach da, so wie OneDrive bei Microsoft 365. Jeder Workspace ist ein Container darin, jedes Item (Lakehouse, Warehouse, Eventhouse) speichert seine Tabellen als **Delta Parquet** — ein offenes Format, das auch Spark, Databricks oder DuckDB lesen können. Kein Vendor-Lock-in auf Dateiebene.

#### Das „One Copy"-Prinzip

Der Kerngedanke: Daten liegen *einmal* in OneLake, und alle Engines arbeiten darauf — Spark schreibt eine Delta-Tabelle, T-SQL fragt sie ab, das Direct-Lake-Modell liest sie in den Bericht. Keine Export-Import-Ketten, keine nächtlichen Kopier-Jobs zwischen Diensten.

![Diagramm: Dieselbe Delta-Tabelle wird mit Spark geladen, mit T-SQL abgefragt und im Power-BI-Report angezeigt — ohne Datenkopie](https://learn.microsoft.com/en-us/fabric/onelake/media/onelake-overview/use-same-copy-of-data.png)

**Abb. · One Copy of Data** Laden mit Spark, Abfragen mit T-SQL, Anzeigen in Power BI — dieselbe Datenkopie. Quelle: [What is OneLake? · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-overview)

> **Praxis-Beispiel:** Du kannst OneLake wie ein Laufwerk behandeln: Der **OneLake-Explorer für Windows** bindet ihn in den Datei-Explorer ein, und jedes Tool, das ADLS Gen2 spricht (Azure Storage Explorer, azcopy), erreicht ihn über die URL onelake.dfs.fabric.microsoft.com.

> **Wo liegen meine Daten wirklich?** Physisch liegt OneLake in der Azure-Region der Kapazität — relevant für Datenschutz-Diskussionen. Die Daten-WG-Folge unten zeigt, wie man das nachprüft.

**Weiterlesen:** [What is OneLake? · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-overview) · [DatenPioniere: OneLake — Datensilos auflösen (DE)](https://www.datenpioniere.de/blog/fabric-onelake)

**Daten-WG dazu:**

- **[Wo liegen meine Daten wirklich im OneLake?](https://youtu.be/ZVVSPQj9dlc)** · Solo · 5 min · DE · [Knowledge Kitchen](../index.html#ep-ZVVSPQj9dlc)

### Medallion: Bronze · Silber · Gold

*KOMPONENTEN · ZUSAMMENSPIEL*

Die Medallion-Architektur ist das Standard-Muster, wie die Fabric-Komponenten zusammenspielen: Rohdaten (Bronze) werden schrittweise zu bereinigten (Silber) und report-fertigen Daten (Gold) veredelt.

#### Die drei Schichten

- **Bronze — Raw:** Daten im Originalformat, unverändert. Offizieller Rat: bestehende Quellen per **Shortcut referenzieren** statt kopieren
- **Silber — Enriched:** bereinigt, dedupliziert, standardisierte Formate — als Delta-Tabellen
- **Gold — Curated:** aggregiert und modelliert fürs Reporting (Sternschema), Basis für semantische Modelle

#### Wie die Komponenten die Schichten bedienen

**Pipelines/Copy** füllen Bronze. **Notebooks oder Dataflows** transformieren Bronze → Silber → Gold. **Lakehouse oder Warehouse** speichern die Schichten — Microsoft dokumentiert zwei Muster: alle drei Layer als Lakehouses, oder Bronze+Silber als Lakehouse und **Gold als Warehouse** (für SQL-Teams). Auf Gold sitzt das **semantische Modell**, darauf der Power-BI-Bericht.

![Diagramm: Daten- und Transformationsfluss durch Bronze-, Silber- und Gold-Schicht mit Quelle, Transformation und Ziel je Schritt](https://learn.microsoft.com/en-us/fabric/data-engineering/media/tutorial-lakehouse-introduction/data-transformation-flow.png)

**Abb. · Bronze → Silber → Gold** Der Transformationsfluss aus dem offiziellen Lakehouse-Tutorial. Quelle: [Lakehouse end-to-end scenario · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction)

> **Governance-Empfehlung:** Pro Schicht ein eigenes Lakehouse, idealerweise in eigenen Workspaces — so lassen sich Berechtigungen sauber trennen (Analysten sehen Gold, Engineers alles). Silber und Gold als V-Order-optimierte Delta-Tabellen schreiben, damit Direct Lake maximal profitiert.

> **Muss es immer Medallion sein?** Nein — für kleine Lösungen reicht oft ein Lakehouse mit sauberem Tabellen-Präfix (bronze_/silver_/gold_). Wichtig ist das Prinzip: Rohdaten unangetastet lassen, Veredelung nachvollziehbar in Stufen.

**Weiterlesen:** [Medallion-Architektur · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-medallion-lakehouse-architecture) · [phData: Medallion & skalierbares Modeling](https://www.phdata.io/blog/medallion-architecture-and-scalable-data-modeling-in-microsoft-fabric/)

### Rolle des semantischen Modells

*SEMANTIK · BUSINESS-SCHICHT*

Zwischen Delta-Tabellen und Bericht gehört eine kuratierte Schicht: das semantische Modell. Es übersetzt Datenstrukturen in Business-Begriffe — Measures, Hierarchien, Beziehungen.

#### Warum nicht direkt auf die Tabellen berichten?

Weil sonst jeder Bericht seine eigene Logik mitbringt: Drei Analysten definieren „Umsatz" dreimal unterschiedlich. Das semantische Modell zentralisiert diese Logik — **eine** Definition von Umsatz, Marge und Kundenzahl, die von allen Berichten, Excel-Pivots und zunehmend auch Copilot/AI-Agents genutzt wird. In Fabric ist das Modell ein eigenes Workspace-Item neben Lakehouse und Warehouse.

#### Was ins Modell gehört

- **Beziehungen** — das Sternschema zwischen Fakten und Dimensionen
- **Measures** — DAX-Kennzahlen als „single source of truth"
- **Metadaten** — Formatierungen, Beschreibungen, Anzeige-Ordner, Synonyme (auch für Copilot relevant)
- **Sicherheitslogik** — Row-Level Security auf Modell-Ebene

> **Self-Service-Effekt:** Ein gutes Gold-Layer-Modell macht aus „Kannst du mir einen Report bauen?" ein „Bau dir den Report selbst" — Fachbereiche verbinden sich mit dem zertifizierten Modell und ziehen ihre eigenen Auswertungen, ohne SQL oder DAX zu schreiben.

> **Kein Default-Modell mehr:** Seit September 2025 erzeugt ein neues Lakehouse kein automatisches Default-Semantic-Model mehr. Das ist gut so: Modelle entstehen jetzt bewusst, mit ausgewählten Tabellen statt „alles rein".

**Weiterlesen:** [Store data in Microsoft Fabric · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/store-data) · [Semantic model modes · Microsoft Learn](https://learn.microsoft.com/power-bi/connect-data/service-dataset-modes-understand)

### OneLake — der Datensee des Tenants

Siehe den gleichnamigen Abschnitt weiter oben.

### Shortcuts — einbinden statt kopieren

*KOMPONENTEN · ZERO-COPY*

Ein Shortcut ist eine Referenz auf Daten, die woanders liegen — im Nachbar-Workspace, in ADLS Gen2, Amazon S3 oder Dataverse. Die Daten erscheinen in OneLake, ohne bewegt zu werden.

#### Was ist das?

Shortcuts funktionieren wie symbolische Links: Im Lakehouse sieht der Shortcut aus wie ein normaler Ordner oder eine normale Tabelle, tatsächlich zeigt er auf den Quell-Speicherort. Alle Fabric-Engines können durch ihn hindurch lesen — ohne ETL-Strecke, ohne Duplikat, ohne Latenz durch Kopier-Jobs. Änderungen an der Quelle sind sofort sichtbar.

#### Wohin Shortcuts zeigen können

- **Fabric-intern:** andere Lakehouses, Warehouses, KQL-Datenbanken, Mirrored Databases — auch workspace-übergreifend
- **Extern:** ADLS Gen2, Azure Blob, Amazon S3 (und S3-kompatibel), Google Cloud Storage, Dataverse, OneDrive/SharePoint, Iceberg-Quellen — On-Premises-Quellen via Data Gateway

![Diagramm: Ein Shortcut im Lakehouse verbindet transparent auf Daten in einem anderen Speicherort wie ADLS oder S3](https://learn.microsoft.com/en-us/fabric/onelake/media/onelake-shortcuts/shortcut-connects-other-location.png)

**Abb. · Shortcut-Prinzip** Der Shortcut erscheint als Teil des Lakehouse, die Daten bleiben an der Quelle. Quelle: [OneLake shortcuts · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-shortcuts)

#### Sicherheit & Kosten

Interne Shortcuts autorisieren mit der Identität des abfragenden Users (Berechtigungen der Quelle gelten weiter). Externe Shortcuts nutzen eine hinterlegte Cloud-Connection. Bei Cross-Cloud-Zugriff (z. B. S3) reduziert intelligentes Caching die Egress-Kosten.

> **Erste Architektur-Regel:** Bestehende Data Lakes nicht migrieren, sondern per Shortcut einbinden — das ist der offizielle Bronze-Layer-Ratschlag der Medallion-Doku („reference statt copy").

**Weiterlesen:** [OneLake shortcuts · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-shortcuts) · [Nikola Ilic: OneLake Shortcuts — everything you need to know](https://datamozart.substack.com/p/onelake-shortcuts-everything-you) · [DatenPioniere: Shortcut-Anleitung inkl. Security (DE)](https://www.datenpioniere.de/blog/microsoft-fabric-onelake-shortcut)

**Daten-WG dazu:**

- **[Shortcut Transformation erklärt: Updates im Praxistest](https://youtu.be/Z6RZjkn_6lY)** · Tutorial · 7 min · DE

### Lakehouse

*KOMPONENTEN · FILES + TABLES*

Das Lakehouse ist der flexible Speicher- und Modellierungsansatz in Fabric: Delta-Tabellen für strukturierte Daten plus ein Files-Bereich für alles andere — verarbeitet wird primär mit Spark.

#### Was ist das?

Ein Lakehouse kombiniert Data-Lake-Flexibilität mit Warehouse-Ordnung. Es hat zwei Zonen: **Tables** (verwaltete Delta-Tabellen — automatisch registriert und für alle Engines sichtbar) und **Files** (beliebige Dateien: CSV, JSON, Parquet, Bilder). Geschrieben wird über Spark-Notebooks, Pipelines, Dataflows oder Upload; gelesen über Spark, den automatischen SQL Analytics Endpoint und Direct Lake.

#### Typische Nutzung

- Rohdaten in **Files** ablegen (oder per Shortcut referenzieren)
- Mit Notebooks bereinigen und als **Delta-Tabellen** in Tables schreiben
- Per **SQL Analytics Endpoint** mit T-SQL abfragen — oder direkt ein Direct-Lake-Modell daraufsetzen

![Screenshot: Lakehouse-Oberfläche mit dem Dropdown 'Analyze data with' — SQL analytics endpoint, Eventhouse und Notebook](https://learn.microsoft.com/en-us/fabric/data-engineering/media/lakehouse-overview/lakehouse-analyze-data.png)

**Abb. · Lakehouse-UI** Ein Lakehouse lässt sich direkt aus der Oberfläche mit SQL-Endpoint oder Notebook analysieren. Quelle: [What is a lakehouse? · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/lakehouse-overview)

> **Wann Lakehouse statt Warehouse?** Offizielle Regel: Wenn dein Team Spark kann, wenn un- oder semi-strukturierte Daten dabei sind — oder wenn du unsicher bist. Das Lakehouse ist der „safe default", denn den SQL-Zugang gibt es über den Endpoint gratis dazu.

> **Seit September 2025:** Beim Anlegen eines Lakehouse wird *kein* Default-Semantic-Model mehr automatisch erzeugt — semantische Modelle legst du bewusst selbst an (siehe Sektion 03).

**Weiterlesen:** [What is a lakehouse? · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/lakehouse-overview) · [Mainzer Datenfabrik: OneLake vs. Lakehouse vs. Warehouse (DE)](https://www.madafa.de/blog/microsoft-fabric-onelake-vs-lakehouse-vs-warehouse)

**Daten-WG dazu:**

- **[SharePoint direkt in Fabric nutzen — Lakehouse, Direct Lake & Power BI](https://youtu.be/c-LWoo-O5PQ)** · Tutorial · 18 min · DE

### Warehouse

*KOMPONENTEN · T-SQL*

Das Fabric Data Warehouse ist das relationale Gegenstück zum Lakehouse: volle T-SQL-Unterstützung inklusive DDL, DML und Multi-Table-Transaktionen — gespeichert wird trotzdem offen in OneLake.

#### Was ist das?

Ein Warehouse fühlt sich an wie eine SQL-Server-Datenbank: Du legst Schemas, Tabellen, Views und Prozeduren mit T-SQL an, lädst per `COPY INTO`, `CTAS` oder Pipelines, und transformierst mit Stored Procedures. Unter der Haube speichert es — wie alles in Fabric — Delta Parquet in OneLake. Die SQL-Engine ist dieselbe, die auch den SQL Analytics Endpoint des Lakehouse bedient.

#### Was das Warehouse exklusiv kann

- **Multi-Table-Transaktionen** — mehrere Tabellen atomar ändern (im Lakehouse nicht möglich)
- **Volle DML/DDL per T-SQL** — INSERT, UPDATE, DELETE, MERGE; der Lakehouse-Endpoint ist read-only
- **SQL-Governance-Features** — granulare GRANTs, RLS/CLS auf SQL-Ebene, Time Travel, Zero-Copy-Clones

![Screenshot: Workspace-Item-Liste mit einem Item vom Typ Warehouse](https://learn.microsoft.com/en-us/fabric/data-warehouse/media/data-warehousing/warehouse-type.png)

**Abb. · Warehouse als Workspace-Item** Ein Warehouse ist ein eigener Item-Typ neben Lakehouse und semantischem Modell. Quelle: [What is Fabric Data Warehouse? · Microsoft Learn](https://learn.microsoft.com/fabric/data-warehouse/data-warehousing)

> **Wann Warehouse statt Lakehouse?** Wenn dein Team aus SQL-Entwicklern besteht, die Daten strukturiert sind und du klassische DWH-Muster brauchst (Stored-Procedure-ELT, transaktionale Konsistenz über mehrere Tabellen). Typisch: der Gold-Layer einer Medallion-Architektur als Warehouse, während Bronze/Silber im Lakehouse liegen.

**Weiterlesen:** [What is Fabric Data Warehouse? · Microsoft Learn](https://learn.microsoft.com/fabric/data-warehouse/data-warehousing) · [Koen Verbeeck: Choosing between Lakehouse and Warehouse](https://www.red-gate.com/simple-talk/databases/sql-server/bi-sql-server/choosing-between-the-lakehouse-and-warehouse-in-microsoft-fabric/)

### SQL Analytics Endpoint

*KOMPONENTEN · LESE-ZUGRIFF*

Jedes Lakehouse bekommt automatisch einen SQL Analytics Endpoint: read-only T-SQL über alle Delta-Tabellen — ohne dass jemand etwas konfiguriert.

#### Was ist das?

Der Endpoint ist ein TDS-Endpunkt (wie ein SQL Server): Du kannst dich mit SSMS, Azure Data Studio, Power BI oder jedem SQL-Client verbinden und die Lakehouse-Tabellen mit T-SQL abfragen — Views und Funktionen anlegen inklusive. Es ist dieselbe Engine wie im Fabric Warehouse, nur im Lese-Modus: **Schreiben geht ausschließlich über Spark.**

#### Die zwei Dinge, die man wissen muss

- **Read-only:** Kein INSERT/UPDATE/DELETE — der Endpoint ist die Konsum-Schicht des Lakehouse, nicht sein Schreibweg
- **Sync-Latenz:** Neue Delta-Tabellen und -Daten erscheinen im Endpoint über einen Hintergrund-Sync — unter normalen Bedingungen in unter einer Minute. Wer in einer Pipeline schreibt und sofort per SQL liest, sollte den Metadaten-Refresh als Schritt einplanen

![Screenshot: Workspace-Liste mit dem automatisch erzeugten Item vom Typ SQL analytics endpoint neben dem Lakehouse](https://learn.microsoft.com/en-us/fabric/data-warehouse/media/data-warehousing/sql-endpoint-type.png)

**Abb. · Automatisch erzeugtes Item** Der SQL analytics endpoint erscheint als eigenes Item neben jedem Lakehouse. Quelle: [Fabric Data Warehouse Doku · Microsoft Learn](https://learn.microsoft.com/fabric/data-warehouse/data-warehousing)

> **Für Power-BI-Menschen:** Der Endpoint ist auch der Weg, ein Lakehouse per klassischem Import oder DirectQuery anzubinden — und die Grundlage der Variante „Direct Lake on SQL endpoints" (Sektion 03). SQL-seitig definierte RLS am Endpoint zwingt Direct-Lake-Modelle allerdings in den DirectQuery-Fallback.

**Weiterlesen:** [SQL analytics endpoint · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/lakehouse-sql-analytics-endpoint)

### Pipelines & Copy — Datenintegration

*KOMPONENTEN · DATA FACTORY*

Pipelines sind das Orchestrierungs-Werkzeug von Fabric Data Factory: Daten kopieren, Notebooks und Prozeduren aufrufen, Abläufe steuern — per Zeitplan, Event oder auf Abruf.

#### Die Bausteine

- **Copy Activity** — der Arbeits-Baustein in Pipelines: kopiert Daten aus 50+ Quellen nach Lakehouse/Warehouse, skaliert bis in den Petabyte-Bereich, mit leichten Transformationen (Mapping, Format)
- **Copy Job** — Datenbewegung ohne Pipeline-Bau: Bulk-Load, inkrementell (Watermark) oder CDC-Replikation als eigenständiges Item
- **Control Flow** — ForEach, Lookup, If, Invoke Pipeline: verschachtelte Orchestrierung wie in Azure Data Factory
- **Transformation-Activities** — Notebook, Dataflow Gen2, Stored Procedure, SQL Script: die eigentliche Verarbeitung delegieren
- **Trigger** — Schedule, Event-basiert (z. B. „neue Datei im Storage") oder on demand

![Diagramm: Data-Integration-Stack von Fabric Data Factory — Konnektoren, Data Movement, Orchestrierung und Transformation auf OneLake](https://learn.microsoft.com/en-us/fabric/data-factory/media/data-factory-overview/data-integration-stack.png)

**Abb. · Der Data-Factory-Stack** Konnektoren → Movement/Orchestrierung/Transformation → Analytics, alles auf OneLake. Quelle: [What is Data Factory? · Microsoft Learn](https://learn.microsoft.com/fabric/data-factory/data-factory-overview)

> **Leistungs-Referenz:** Microsofts offizielle FAQ-Benchmark: Ein 1-TB-TPC-DI-Datensatz (Parquet) landet in rund 5 Minuten im Lakehouse/Warehouse — eine Milliarde Zeilen in unter einer Minute.

> **On-Premises-Quellen:** Für lokale Datenbanken braucht es das On-Premises Data Gateway — oder man dreht die Richtung um und *pusht* von on-prem nach Fabric (z. B. aus SSIS heraus, siehe Daten-WG-Folgen unten).

**Weiterlesen:** [What is Data Factory? · Microsoft Learn](https://learn.microsoft.com/fabric/data-factory/data-factory-overview) · [Copy Activity · Microsoft Learn](https://learn.microsoft.com/fabric/data-factory/copy-data-activity)

**Daten-WG dazu:**

- **[Push statt Pull: On-Prem-Daten mit SSIS nach Microsoft Fabric](https://youtu.be/5HhNQZlB-1E)** · Tutorial · 12 min · DE · [Knowledge Kitchen](../index.html#ep-5HhNQZlB-1E)
- **[SSIS: Fabric Notebook per REST API starten](https://youtu.be/NvtZ-ehiTrg)** · Tutorial · 7 min · DE · [Knowledge Kitchen](../index.html#ep-NvtZ-ehiTrg)

### Dataflow Gen2

*KOMPONENTEN · LOW-CODE ETL*

Dataflow Gen2 ist Power Query als Fabric-Service: dieselbe Oberfläche, die jeder Power-BI-Entwickler kennt — aber das Ergebnis landet als Delta-Tabelle im Lakehouse oder Warehouse.

#### Was ist das?

Ein Dataflow Gen2 verbindet sich mit über 150 Quellen, transformiert mit über 300 Power-Query-Funktionen (M-Engine) und schreibt in ein konfigurierbares **Ziel**: Lakehouse, Warehouse, KQL-Datenbank oder Azure SQL. Damit ist er die natürliche Brücke für Power-BI-Teams: bekannte Oberfläche, neues Ziel — statt ins eigene Dataset hinein transformiert man in die Plattform hinein, wo alle das Ergebnis nutzen können.

#### Gen2 vs. Gen1 (Power-BI-Dataflows)

- **Output Destinations:** Gen1 speicherte nur in den eigenen internen Storage; Gen2 schreibt echte Delta-Tabellen in Lakehouse/Warehouse
- **Fast Copy:** große Ladevorgänge nutzen die Copy-Infrastruktur — im offiziellen Benchmark 13× schneller als Gen1 (7:43 min statt 1:42 h)
- **Pipeline-Integration:** Dataflows lassen sich als Activity orchestrieren und parametrisieren

> **Wann Dataflow, wann Notebook?** Offizielle Personas: Dataflow Gen2 für Business-Analysten und „Citizen Engineers" (Low-Code), Notebooks für Data Engineers (Code-First, komplexe Logik, unstrukturierte Daten). Beide schreiben am Ende dieselben Delta-Tabellen — die Wahl ist eine Team-Frage, keine Architektur-Frage.

**Weiterlesen:** [What is Dataflow Gen2? · Microsoft Learn](https://learn.microsoft.com/fabric/data-factory/dataflows-gen2-overview)

### Notebooks & Spark

*KOMPONENTEN · CODE-FIRST*

Fabric-Notebooks sind die Code-First-Werkbank: PySpark, Spark SQL, Scala und R in Zellen, direkt verdrahtet mit dem Lakehouse — für Transformation, Analyse und Machine Learning.

#### Was ist das?

Ein Notebook läuft auf dem verwalteten Fabric-Spark-Pool (kein Cluster-Management!) und mischt Code, Markdown und Ergebnisse. Links hängt der **Lakehouse-Explorer**: Dateien und Tabellen des angehefteten Lakehouse sind per Drag-and-drop oder Kontextmenü direkt als DataFrame ladbar. Sprachen wechselt man per Magic Command (`%%pyspark`, `%%sql`, …), Bibliotheken installiert man mit `%pip`.

#### NotebookUtils — der Werkzeugkasten

- **notebookutils.fs** — Dateisystem-Operationen auf OneLake (kopieren, verschieben, auflisten)
- **notebookutils.notebook.run / exit** — Notebooks orchestrieren, auch parallel und workspace-übergreifend
- **Credentials/Secrets** — Zugriff auf Azure Key Vault ohne Klartext-Passwörter im Code
- Achtung: der alte Namespace `mssparkutils` ist abgekündigt — neuer Code nutzt `notebookutils`

![Screenshot: Notebook-Oberfläche mit Lakehouse-Explorer links und Kontextmenü zum Laden einer Datei als Spark- oder Pandas-DataFrame](https://learn.microsoft.com/en-us/fabric/data-engineering/media/how-to-use-notebook/lakehouse-file-operation.png)

**Abb. · Notebook + Lakehouse** Dateien aus dem Lakehouse-Explorer direkt als DataFrame laden. Quelle: [Fabric Notebooks · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/author-execute-notebook)

> **Für den Einstieg:** Wer aus der Power-BI-Welt kommt und noch nie Spark geschrieben hat: Mit `spark.read` + `df.write.format("delta").saveAsTable(...)` und etwas Spark SQL deckt man 80 % der BI-Transformationen ab. Das End-to-End-Beispiel in Sektion 04 zeigt genau diesen Pfad.

**Weiterlesen:** [Notebooks entwickeln & ausführen · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/author-execute-notebook) · [NotebookUtils · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/notebook-utilities)

### Eventhouse & Real-Time Intelligence

*KOMPONENTEN · STREAMING*

Für Event- und Streamingdaten hat Fabric einen eigenen Pfad: Eventstream nimmt Ereignisse auf, das Eventhouse speichert und analysiert sie mit KQL, Activator löst Aktionen aus.

#### Die Real-Time-Kette

- **Eventstream** — No-Code-Ingestion: Quellen wie Azure Event Hubs, IoT Hub, Kafka, CDC-Feeds aus Datenbanken oder Fabric-eigene Events; unterwegs filtern, aggregieren, routen
- **Eventhouse** — der Speicher: Container für eine oder mehrere **KQL-Datenbanken**, optimiert für Zeitreihen und hohe Event-Raten („query billions of events in seconds"); abfragbar per KQL *und* T-SQL
- **Real-Time Dashboards / KQL Querysets** — Analyse und Visualisierung mit Sekunden-Latenz
- **Activator** — No-Code-Regeln: „Wenn Sensorwert über X, dann Teams-Nachricht / E-Mail / Pipeline starten"

![Architektur-Diagramm Real-Time Intelligence: Real-Time Hub, Eventstreams, Eventhouse, Dashboards und Activator im Zusammenspiel](https://learn.microsoft.com/en-us/fabric/real-time-intelligence/media/overview/overview-schematic.png)

**Abb. · Real-Time Intelligence** Vom Event über Eventstream und Eventhouse bis zu Dashboard und Aktion. Quelle: [What is Real-Time Intelligence? · Microsoft Learn](https://learn.microsoft.com/fabric/real-time-intelligence/overview)

#### Anschluss an die BI-Welt

Eventhouse-Daten lassen sich in OneLake verfügbar machen (OneLake Availability) — dann können auch Spark, SQL und Power BI darauf zugreifen. Für klassische BI-Teams ist das der Punkt, an dem Streaming- und Batch-Welt zusammenlaufen.

> **Wann brauche ich das?** IoT-Telemetrie, Clickstreams, Log-Analysen, Bewegungsdaten — überall, wo Ereignisse pro Sekunde statt Zeilen pro Nacht ankommen und die Frage „was passiert gerade?" lautet. Für klassisches Finanz-Reporting: gar nicht.

**Weiterlesen:** [Real-Time Intelligence · Microsoft Learn](https://learn.microsoft.com/fabric/real-time-intelligence/overview) · [Eventhouse overview · Microsoft Learn](https://learn.microsoft.com/fabric/real-time-intelligence/eventhouse)

### Medallion: Bronze · Silber · Gold

Siehe den gleichnamigen Abschnitt weiter oben.

## 03 · Semantische Modelle & *Direct Lake*

Das semantische Modell ist die Brücke zwischen Fabric und Power BI: Measures, Beziehungen und Business-Logik über den Delta-Tabellen. Neu in Fabric ist Direct Lake — ein Storage Mode, der Import-Performance mit DirectQuery-Frische kombiniert, weil er Delta-Dateien direkt aus OneLake liest.

> Als erstes: **„Direct Lake verstehen"** — das ist der Grund, warum sich Fabric für Power-BI-Teams lohnt. Danach **„Import · DirectQuery · Direct Lake"** für die Einordnung gegen die bekannten Modi.

**0** — Datenkopien & klassische Refreshes

**Direct Lake importiert nichts:** Das Modell lädt Spalten bei Bedarf direkt aus den Delta-Parquet-Dateien in OneLake in den Speicher. Ein „Refresh" ist nur noch eine Metadaten-Operation (Framing) — Sekunden statt Stunden, auch bei Milliarden Zeilen.

**Warum das funktioniert:** Delta-Parquet mit V-Order-Kompression ist so organisiert, dass die VertiPaq-Engine die Daten fast direkt verarbeiten kann (Transcoding statt Import). Abfragen laufen In-Memory wie im Import Mode.

**Der Haken:** Guardrails pro F-SKU (Zeilen, Dateien, Speicher) — und je nach Variante ein Fallback auf DirectQuery, den man kennen muss. Details in den Karten.

### Rolle des semantischen Modells

Siehe den gleichnamigen Abschnitt weiter oben.

### Fabric Semantic Model erstellen

*SEMANTIK · AUFBAU*

Ein semantisches Modell auf Lakehouse- oder Warehouse-Tabellen ist in Minuten angelegt — modelliert wird direkt im Browser oder klassisch in Power BI Desktop.

#### Modell anlegen

Im Lakehouse/Warehouse: **New semantic model** → Namen vergeben, Tabellen auswählen (nur Gold-Tabellen, nicht alles!). Das Modell wird als eigenes Item im Workspace angelegt — standardmäßig im Direct-Lake-Modus.

#### Beziehungen definieren

Im Web-Modeling (Model View im Browser) Fakten mit Dimensionen verbinden — per Drag-and-drop wie in Desktop. Ziel ist das Sternschema: Faktentabelle in der Mitte, Dimensionen außen, 1:n-Beziehungen mit Single-Direction-Filter.

#### Measures schreiben

DAX-Measures direkt im Browser anlegen (mit IntelliSense) — oder das Modell in Power BI Desktop öffnen: OneLake-Katalog → Modell auswählen → „Make changes to this model". Desktop-Feeling, aber das Modell bleibt im Service.

#### Einstellungen prüfen

Im Modell unter Settings: Direct-Lake-Verhalten (Automatic/DirectLakeOnly), Refresh-Zeitplan fürs Framing (Default: automatisches Update bei Datenänderung) und Endorsement (Promoted/Certified) für Self-Service-Nutzer.

> **Profi-Weg: XMLA & Tools:** Fabric-Modelle sprechen das XMLA-Protokoll — Tabular Editor, SSMS und CI/CD-Pipelines (TMDL) funktionieren wie bei Premium-Datasets. Wer aus der Enterprise-Power-BI-Welt kommt, nimmt seinen Werkzeugkasten einfach mit (Karte „Nutzung in Power BI & XMLA").

**Weiterlesen:** [Create a semantic model · Microsoft Learn](https://learn.microsoft.com/fabric/data-warehouse/create-semantic-model)

### Direct Lake verstehen

*SEMANTIK · DEEP DIVE*

Direct Lake ist der dritte Storage Mode neben Import und DirectQuery — und der Grund, warum Fabric für Power-BI-Teams strategisch ist: Import-Performance ohne Import.

#### Wie es funktioniert

Ein Direct-Lake-Modell lädt **keine Daten beim Refresh**. Stattdessen lädt die VertiPaq-Engine einzelne **Spalten on-demand** direkt aus den Delta-Parquet-Dateien in OneLake in den Speicher — genau die Spalten, die die aktuelle Abfrage braucht. Dieses Umkodieren von Parquet in VertiPaq-Strukturen heißt **Transcoding** und ist besonders schnell, wenn die Dateien mit **V-Order** geschrieben wurden (Fabric-Engines tun das standardmäßig). Einmal geladene Spalten bleiben im Cache — Folgeabfragen laufen In-Memory wie im Import Mode.

#### Framing — der neue „Refresh"

Ein Refresh ist bei Direct Lake nur noch eine **Metadaten-Operation in Sekunden**: Das Modell „rahmt" sich auf die neueste Version der Delta-Tabelle (Framing). Abfragen zeigen immer den Stand des letzten Framings — per Default passiert das automatisch, wenn sich Daten ändern. Inkrementelles Framing verwirft dabei nur die Spaltensegmente, die sich geändert haben; der Rest bleibt warm im Speicher.

![Direct-Lake-Diagramm: Das semantische Modell lädt Delta-Tabellen aus OneLake direkt in den VertiPaq-Speicher — im Vergleich zu Import und DirectQuery](https://learn.microsoft.com/en-us/fabric/fundamentals/media/direct-lake-overview/direct-lake-overview.svg)

**Abb. · Direct Lake vs. Import vs. DirectQuery** Direct Lake liest die Delta-Dateien direkt — kein Import-Duplikat, keine Quell-Query pro Visual. Quelle: [Direct Lake overview · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/direct-lake-overview)

#### Zwei Varianten — wichtig seit 2025

- **Direct Lake on OneLake** — die neue, empfohlene Variante: liest direkt aus OneLake, kann Tabellen aus mehreren Quellen kombinieren, effizientere Abfragepläne — und hat **keinen DirectQuery-Fallback** (bei Limit-Überschreitung schlägt das Framing fehl statt leise langsam zu werden)
- **Direct Lake on SQL endpoints** — die erste Generation: geht über den SQL Analytics Endpoint und kann bei Bedarf in **DirectQuery zurückfallen**

> **Performance-Grundregeln:** V-Order aktiv lassen, Integer-Keys statt Strings, Delta-Tabellen regelmäßig mit OPTIMIZE kompaktieren, Kardinalität niedrig halten. Das meiste davon ist ohnehin Sternschema-Hygiene.

**Weiterlesen:** [How Direct Lake works · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/direct-lake-how-it-works) · [Nikola Ilic: A tale of two Direct Lakes](https://data-mozart.com/a-tale-of-two-direct-lakes-in-microsoft-fabric/) · [Sandeep Pawar: Incremental framing effect](https://fabric.guru/direct-lake-incremental-framing-effect)

**Daten-WG dazu:**

- **[SharePoint direkt in Fabric nutzen — Lakehouse, Direct Lake & Power BI](https://youtu.be/c-LWoo-O5PQ)** · Tutorial · 18 min · DE

### Guardrails & DirectQuery-Fallback

*SEMANTIK · GRENZEN*

Direct Lake hat harte Obergrenzen pro F-SKU — die Guardrails. Wer sie überschreitet, landet je nach Variante im DirectQuery-Fallback oder im Framing-Fehler. Beides sollte man kennen, bevor es passiert.

#### Die Guardrails (offizielle Tabelle, Stand Juli 2026)

| Fabric SKU | Parquet-Dateien / Tabelle¹ | Zeilen / Tabelle | Modellgröße auf Disk/OneLake | Max Memory² |
| --- | --- | --- | --- | --- |
| F2–F8 | 1.000 | 300 Mio. | 10 GB | 3 GB |
| F16 | 1.000 | 300 Mio. | 20 GB | 5 GB |
| F32 | 1.000 | 300 Mio. | 40 GB | 10 GB |
| **F64** (≙ alte P1) | 5.000 | 1,5 Mrd. | unbegrenzt | 25 GB |
| F128 | 5.000 | 3 Mrd. | unbegrenzt | 50 GB |
| F256 | 5.000 | 6 Mrd. | unbegrenzt | 100 GB |
| F512 | 10.000 | 12 Mrd. | unbegrenzt | 200 GB |
| F1024–F2048 | 10.000 | 24 Mrd. | unbegrenzt | 400 GB |

¹ Dasselbe Limit gilt zusätzlich für *Row Groups* pro Tabelle. ² Max Memory ist laut Microsoft **kein Guardrail**, sondern die Obergrenze, wie viel Modelldaten gleichzeitig im Speicher gehalten werden — wird sie eng, lagert die Engine Spalten aus und lädt sie neu (Paging), was Abfragen verlangsamt, aber keinen Fallback auslöst. Die Modellgröße auf Disk wird auf Modellebene geprüft, alle übrigen Guardrails pro Abfrage.

Wichtig: **Eine einzige Tabelle über dem Limit** betrifft das ganze Modell. Häufigster Auslöser sind übrigens nicht die Zeilen, sondern zu viele kleine Parquet-Dateien — Abhilfe: `OPTIMIZE` (Kompaktierung) und `VACUUM` auf der Delta-Tabelle; erst wenn das nicht reicht, ist die größere SKU dran.

#### Was den Fallback auslöst (Direct Lake on SQL)

- Guardrail-Überschreitung (Zeilen, Dateien, Rowgroups)
- RLS/OLS oder Dynamic Data Masking, die am SQL-Endpoint (statt im Modell) definiert sind
- Nicht-materialisierte SQL-Views als Modell-Quelle

Im Fallback beantwortet DirectQuery die Abfrage — der Refresh gelingt mit Warnung, der Bericht funktioniert weiter, wird aber spürbar langsamer. **Direct Lake on OneLake** kennt keinen Fallback: dort läuft das Modell immer „DirectLakeOnly", und bei einer Guardrail-Verletzung schlägt der Refresh fehl wie im Import Mode — das Modell ist erst wieder abfragbar, wenn die Delta-Tabellen unter die Limits optimiert sind. Laut, aber ehrlich; Microsoft empfiehlt die OneLake-Variante für neue Modelle.

#### Fallback kontrollieren

Modell-Property `DirectLakeBehavior`: **Automatic** (Default), **DirectLakeOnly** (Fallback verbieten — empfohlen, damit Performance-Probleme sichtbar werden) oder **DirectQueryOnly** (zum Testen).

#### Diagnose

Per DAX prüfen, wie Tabellen laufen: `EVALUATE TABLETRAITS()` — oder im Performance Analyzer / DAX Studio nachsehen, ob Queries als DirectQuery ankommen.

**Weiterlesen:** [Direct Lake overview (Guardrail-Tabelle) · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/direct-lake-overview) · [Chris Webb: What happens when models hit guardrails?](https://blog.crossjoin.co.uk/2025/09/07/what-happens-when-power-bi-direct-lake-semantic-models-hit-guardrails/) · [Sandeep Pawar: Controlling fallback behavior](https://fabric.guru/controlling-direct-lake-fallback-behavior)

### Import · DirectQuery · Direct Lake

*SEMANTIK · STORAGE MODES*

Drei Modi, drei Trade-offs. Die offizielle Kurzformel: Import = schnellste Abfragen, DirectQuery = frischeste Daten, Direct Lake = beides — sofern die Daten als Delta in OneLake liegen.

#### Der Vergleich

- **Import** — Daten werden ins Modell kopiert und komprimiert. Schnellste Abfragen, volle DAX/Feature-Unterstützung. Preis: Refresh-Latenz, Duplikat, Refresh-Dauer wächst mit den Daten
- **DirectQuery** — jede Visual-Interaktion wird zur Quell-Query. Immer aktuell, kein Duplikat. Preis: Performance hängt an der Quelle, eingeschränkte DAX-Features, Last auf der Quelle
- **Direct Lake** — liest Delta-Parquet direkt aus OneLake in den Speicher. Import-nahe Performance, Aktualität per Framing in Sekunden, kein Duplikat. Preis: nur für Fabric-Daten (OneLake), Guardrails pro SKU, einzelne Feature-Lücken (keine Hybrid Tables, keine benutzerdefinierten Aggregations-Tabellen; Calculated Columns nur in der OneLake-Variante als Preview)

#### Wann welcher Modus?

- **Import:** kleine bis mittlere Modelle, externe Quellen ohne Fabric, maximale Feature-Tiefe (Composite, Aggregationen, Calculation Groups ohne Einschränkung)
- **DirectQuery:** operatives Reporting auf transaktionalen Systemen, wenn Sekunden-Frische wichtiger ist als Antwortzeit — oder Quell-RLS greifen soll (z. B. Snowflake-SSO)
- **Direct Lake:** große Datenmengen, die ohnehin in Fabric liegen — Microsofts Empfehlung für Large-Scale-Analytics auf OneLake-Daten

> **Community-Faustregel (Marco Russo, SQLBI):** Nicht dogmatisch entscheiden: Große Faktentabellen profitieren von Direct Lake, kleine, stabile Dimensionen können importiert bleiben — Composite-Kombinationen aus Direct Lake + Import sind möglich (via Web-Modeling) und oft der Sweet Spot.

**Weiterlesen:** [Semantic model modes · Microsoft Learn](https://learn.microsoft.com/power-bi/connect-data/service-dataset-modes-understand) · [SQLBI: Direct Lake vs Import vs Direct Lake+Import](https://www.sqlbi.com/blog/marco/2025/05/13/direct-lake-vs-import-vs-direct-lakeimport-fabric-semantic-models-may-2025/)

### Nutzung in Power BI & XMLA

*SEMANTIK · KONSUM*

Ein Fabric-Modell konsumiert man wie jedes Power-BI-Modell: Live-Verbindung aus Desktop oder Web, Excel-Pivot, oder — für Profis — über den XMLA-Endpoint mit Tabular Editor & Co.

#### Die Konsum-Wege

- **Power BI Desktop:** OneLake-Katalog → semantisches Modell → Live-Verbindung; Berichte bauen wie gewohnt. Für Direct-Lake-Modelle: „Make changes to this model" öffnet das Modell zum Live-Editing
- **Im Browser:** Bericht direkt im Service auf dem Modell anlegen — für schnelle Explorationen oft der kürzeste Weg
- **Excel:** „Analyze in Excel" liefert Pivot-Zugriff auf dieselben Measures
- **Import/DirectQuery klassisch:** Wer will, verbindet Desktop auch über den SQL Analytics Endpoint des Lakehouse und baut ein klassisches Import-Modell — z. B. für Composite-Szenarien

#### XMLA — der Enterprise-Zugang

Fabric-Workspaces sprechen das XMLA-Protokoll der Analysis-Services-Engine (Verbindung: `powerbi://api.powerbi.com/v1.0/myorg/<workspace>`). Damit funktionieren **Tabular Editor** (Modell-Entwicklung, Calculation Groups, Best-Practice-Analyzer), **SSMS** (Verwaltung, Profiler), **DAX Studio** (Performance) und CI/CD über TMDL/TMSL. Read/Write muss in den Kapazitäts-Einstellungen aktiviert sein.

> **Aktualität im Bericht prüfen:** Bei Direct-Lake-Berichten zeigt „Datenaktualisierung" das letzte Framing. Wenn ein Bericht scheinbar alte Daten zeigt: Framing-Zeitpunkt prüfen (Modell-Refresh-Historie), nicht am Bericht suchen.

**Weiterlesen:** [XMLA endpoint · Microsoft Learn](https://learn.microsoft.com/fabric/enterprise/powerbi/service-premium-connect-tools) · [Direct Lake security integration · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/direct-lake-security-integration)

## 04 · End-to-End: *von Daten zum Bericht*

Einmal komplett durch: Beispieldaten nach OneLake bringen, mit Pipeline oder Notebook transformieren, im Lakehouse strukturieren, ein semantisches Modell bauen, einen Power-BI-Bericht veröffentlichen. Die Karten folgen dem offiziellen Lakehouse-Tutorial von Microsoft (Wide World Importers) — mit einer Fabric-Trial-Kapazität komplett kostenlos nachbaubar.

> Als erstes: **Die Karten in Reihenfolge 1 → 6 lesen** — sie sind als Etappen eines durchgängigen Beispiels geschrieben. Wer mitbauen will: Fabric-Trial aktivieren (60 Tage) und das verlinkte Original-Tutorial parallel öffnen.

### Workspace & Lakehouse anlegen

*END-TO-END · SCHRITT 1*

Das Fundament steht in fünf Minuten: Kapazität aktivieren, Workspace anlegen, Lakehouse erstellen. Ab hier ist alles weitere Fleißarbeit auf einer sauberen Basis.

#### Kapazität sicherstellen

Für Übungen: **Fabric-Trial** aktivieren (app.fabric.microsoft.com → Account-Menü → Free trial) — 60 Tage, 64 CU. Im Unternehmen: bestehende F-SKU nutzen oder eine kleine Pay-as-you-go-Kapazität (F2/F4) im Azure-Portal anlegen.

#### Workspace anlegen

Neuer Workspace (z. B. „Fabric Lernprojekt"), in den Workspace-Settings der Kapazität zuordnen (License mode: Fabric capacity oder Trial). Ohne Kapazitäts-Zuordnung lassen sich keine Fabric-Items anlegen.

#### Lakehouse erstellen

Im Workspace: **New item → Lakehouse**, Namen vergeben (z. B. „wwilakehouse"). Fabric erzeugt automatisch das Lakehouse samt SQL Analytics Endpoint. Damit existiert bereits die komplette Speicher- und Abfrage-Infrastruktur.

![End-to-End-Architekturdiagramm des Lakehouse-Tutorials: Datenquellen, Ingestion über Pipelines und Shortcuts, Transformation und Speicherung im Medallion-Lakehouse, Konsum über Power BI und SQL-Endpoint](https://learn.microsoft.com/en-us/fabric/data-engineering/media/tutorial-lakehouse-introduction/lakehouse-end-to-end-architecture.png)

**Abb. · Das Ziel-Bild dieses End-to-End-Beispiels** Quellen → Ingest → Transform & Store → Consume. Genau diesen Fluss bauen die Karten 1–6 nach. Quelle: [Lakehouse end-to-end scenario · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction)

> **Das Original zum Mitbauen:** Diese Sektion folgt dem offiziellen Wide-World-Importers-Tutorial (Retail-Szenario, 5 Schritte). Link unten — parallel öffnen und mitklicken ist der schnellste Lernweg.

**Weiterlesen:** [Tutorial: Create a Fabric workspace · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-get-started)

**Daten-WG dazu:**

- **[Fabric Planning unboxing](https://youtu.be/xCzKEIB4W5I)** · WG Special · 90 min · DE · [Knowledge Kitchen](../index.html#ep-xCzKEIB4W5I)
- **[Fabric Planning Hands-On](https://youtu.be/YRoJ_6t3VrE)** · Hands-On · 66 min · DE · [Knowledge Kitchen](../index.html#ep-YRoJ_6t3VrE)

### Daten nach OneLake bringen

*END-TO-END · SCHRITT 2*

Drei Wege führen zu Beispieldaten in OneLake: manueller Upload (schnellster Start), Pipeline mit Copy Activity (der Tutorial-Weg) oder Shortcut (wenn die Daten schon irgendwo liegen).

#### Weg A · Upload für den Schnellstart

Im Lakehouse-Explorer: Files → Upload. CSV- oder Parquet-Dateien direkt hochladen — für erste Experimente völlig ausreichend. (Auch der OneLake-Explorer für Windows funktioniert: Dateien einfach ins OneLake-„Laufwerk" kopieren.)

#### Weg B · Pipeline mit Copy Activity (Tutorial-Weg)

New item → **Data pipeline** → Copy-Activity konfigurieren: Quelle ist im Tutorial ein öffentlicher Azure-Blob-Container mit den Wide-World-Importers-Parquet-Dateien, Ziel der Files-Bereich des Lakehouse. Ein Klick auf Run lädt die historischen Verkaufsdaten (11 Monate Sale-Fakt) — das ist der Bronze-Layer.

#### Weg C · Shortcut, wenn Daten schon existieren

Liegen die Daten bereits in ADLS Gen2, S3 oder einem anderen Fabric-Workspace: Tables/Files → New shortcut. Keine Kopie, sofort verfügbar — in echten Projekten oft der richtige Bronze-Ansatz.

> **Kontrolle:** Nach dem Lauf sollten die Parquet-Dateien im Files-Bereich sichtbar sein (Lakehouse-Explorer). Pipeline-Monitoring: Run-Historie mit Dauer, Durchsatz und Fehlern pro Activity — vertraut für alle, die ADF kennen.

**Weiterlesen:** [Tutorial: Ingest data into the lakehouse · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-data-ingestion)

### Transformieren: Notebook oder Dataflow

*END-TO-END · SCHRITT 3*

Aus Rohdateien werden saubere Tabellen. Das Tutorial nutzt PySpark-Notebooks — wer lieber klickt, erreicht dasselbe mit Dataflow Gen2 und Power Query.

#### Notebook-Weg (Code-First)

New item → Notebook, Lakehouse anheften. Rohdaten laden, bereinigen, als Delta-Tabelle schreiben:

`df = spark.read.parquet("Files/wwi-raw-data/full/fact_sale_1y_full")` `df.write.mode("overwrite").format("delta").saveAsTable("fact_sale")`

Dazwischen liegt die eigentliche Arbeit: Datentypen korrigieren, Duplikate entfernen, Spalten berechnen (z. B. Jahr/Monat aus dem Datum) — klassisches Silber-Layer-Handwerk in PySpark oder Spark SQL.

#### Dataflow-Weg (Low-Code)

New item → Dataflow Gen2: Quelle wählen, in Power Query transformieren (bekannte Oberfläche!), als **Data destination** das Lakehouse angeben. Das Tutorial nutzt diesen Weg für die Dimension „dimension_customer" — gut zu sehen: beide Wege koexistieren im selben Projekt.

#### Inkrementelle Läufe

Im Tutorial werden die letzten 3 Monate per Merge in die bestehende Fakten-Tabelle eingearbeitet — das Muster für den Alltag: historische Vollladung einmal, danach Delta-Merge.

> **Team-Regel statt Dogma:** Notebook vs. Dataflow ist eine Skill-Frage: SQL/Python-Menschen nehmen Notebooks, Power-Query-Menschen Dataflows. Beide erzeugen dieselben Delta-Tabellen — mischen ist ausdrücklich okay.

**Weiterlesen:** [Tutorial: Prepare and transform data · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-data-preparation)

### Delta-Tabellen im Lakehouse strukturieren

*END-TO-END · SCHRITT 4*

Der Gold-Layer entscheidet über die Berichts-Qualität: ein Sternschema aus Fakten und Dimensionen, als optimierte Delta-Tabellen im Tables-Bereich.

#### Das Ziel-Schema

Das Tutorial modelliert die Wide-World-Importers-Daten als klassisches Sternschema: **fact_sale** in der Mitte, außen **dimension_customer, dimension_date, dimension_city, dimension_employee, dimension_stock_item**. Genau die Struktur, die Power BI (und Direct Lake) am liebsten mag — die Sternschema-Regeln aus dem Power-BI-Guide gelten hier 1:1.

![Sternschema-Diagramm des Tutorials: Sale-Faktentabelle in der Mitte, verbunden mit Datums-, Kunden-, Stadt- und Artikel-Dimensionen](https://learn.microsoft.com/en-us/fabric/data-engineering/media/tutorial-lakehouse-introduction/model-sale-fact-table.png)

**Abb. · WWI-Sternschema** Fakten und Dimensionen des End-to-End-Tutorials. Quelle: [Lakehouse end-to-end scenario · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction)

#### Delta-Hygiene für Direct Lake

- **V-Order** ist in Fabric-Engines Standard — nicht abschalten, Direct Lake profitiert massiv
- **OPTIMIZE** regelmäßig ausführen (kompaktiert viele kleine Parquet-Dateien zu wenigen großen — wichtig wegen der Datei-Guardrails)
- **Datentypen:** Integer-Schlüssel statt GUIDs/Strings, keine überflüssigen Spalten ins Gold
- **Partitionierung** nur bei Bedarf und mit niedriger Kardinalität (unter ~100–200 Werten)

> **Kontrolle per SQL:** Über den SQL Analytics Endpoint das Schema gegenprüfen: `SELECT TOP 100 * FROM fact_sale` — wenn das sauber aussieht und die Row-Counts stimmen, ist der Daten-Layer fertig.

**Weiterlesen:** [Medallion-Architektur · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-medallion-lakehouse-architecture)

### Semantisches Modell aufbauen

*END-TO-END · SCHRITT 5*

Jetzt wird aus Tabellen ein Modell: Direct-Lake-Semantic-Model auf den Gold-Tabellen, Beziehungen ziehen, Measures schreiben.

#### Modell anlegen

Im Lakehouse: **New semantic model** → Namen vergeben → die Sternschema-Tabellen auswählen (fact_sale + Dimensionen). Nicht den Files-Bereich, nicht die Staging-Tabellen — nur Gold.

#### Beziehungen definieren

Im Model View (Browser): fact_sale.CityKey → dimension_city.CityKey, fact_sale.CustomerKey → dimension_customer.CustomerKey usw. — 1:n, Single Direction, wie im Sternschema-Lehrbuch.

#### Measures schreiben

Die Tutorial-Basics: `Total Revenue = SUM(fact_sale[TotalIncludingTax])` — plus das, was dein Business braucht (YTD, Vorjahresvergleich, Margen). DAX funktioniert in Direct Lake wie gewohnt.

#### Modell-Settings

Framing-Verhalten prüfen (Default: automatisch bei Datenänderung), `DirectLakeBehavior` bewusst setzen, Endorsement vergeben, wenn andere das Modell nutzen sollen.

> **Der Aha-Moment:** Lade neue Daten per Notebook in fact_sale und beobachte: kein Refresh-Job, kein Warten — nach dem automatischen Framing (Sekunden) zeigt der Bericht die neuen Zahlen. Das ist der Direct-Lake-Effekt, den man einmal selbst gesehen haben muss.

**Weiterlesen:** [Tutorial: Create a semantic model and report · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-build-report) · [Create a semantic model · Microsoft Learn](https://learn.microsoft.com/fabric/data-warehouse/create-semantic-model)

### Power-BI-Bericht erstellen

*END-TO-END · SCHRITT 6*

Der letzte Schritt ist der vertrauteste: ein Power-BI-Bericht auf dem semantischen Modell — im Browser oder in Desktop, veröffentlicht und geteilt wie immer.

#### Bericht anlegen

Direkt auf dem Modell: **Create report** im Service (schnell, für Standard-Visuals) — oder Power BI Desktop mit Live-Verbindung über den OneLake-Katalog (voller Funktionsumfang, IBCS-taugliche Gestaltung).

#### Visuals bauen

Das Tutorial baut eine Sales-Analyse über mehrere Dimensionen: Umsatz nach Stadt, Zeitverlauf, Top-Artikel. Ab hier gilt alles aus dem [Power-BI-Einsteiger-Guide](../power_bi_einsteiger_guide_v4.html) — Visualisierung, Interaktivität, IBCS.

#### Veröffentlichen & teilen

Bericht im Workspace speichern, per App oder Link teilen. Ab F64-Kapazität können auch Free-User konsumieren; darunter brauchen Konsumenten Pro. RLS definierst du im Modell — wie gewohnt.

#### Aktualität verifizieren

Ende-zu-Ende-Test: neue Zeile in die Quelldaten → Pipeline/Notebook laufen lassen → Framing abwarten (Sekunden) → Bericht aktualisieren. Wenn die Zahl durchläuft, steht die Strecke.

> **Was du jetzt gebaut hast:** Quelle → Pipeline (Bronze) → Notebook/Dataflow (Silber/Gold) → Direct-Lake-Modell → Bericht. Eine komplette, refreshbare Analytics-Strecke ohne eine einzige Datenkopie außerhalb von OneLake — und jede Etappe einzeln austauschbar.

**Weiterlesen:** [Tutorial: Build a report · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-build-report) · [Build Power BI reports in Microsoft Fabric](https://learn.microsoft.com/power-bi/fundamentals/fabric-get-started)

## 05 · Sonderthema: *Snowflake-Daten* in Fabric

Viele Unternehmen haben ihr Warehouse in Snowflake und ihr Reporting in Power BI. Fabric bietet dafür drei sehr unterschiedliche Integrationswege: Mirroring (Replikation nach OneLake), Iceberg-Shortcuts (Zero-Copy) und den klassischen Connector (Import/DirectQuery). Die Wahl bestimmt Architektur, Latenz, Kosten und Governance.

> Als erstes: **„Mirroring"** lesen — der von Microsoft empfohlene Standardweg mit kostenloser Replikation. Dann **„Die drei Ansätze im Vergleich"**, bevor du dich festlegst.

### Snowflake im Unternehmen

*SNOWFLAKE · AUSGANGSLAGE*

Die realistische Ausgangslage vieler Unternehmen: Das Data Warehouse läuft in Snowflake, das Reporting soll (weiter) mit Power BI laufen. Die Frage ist nicht „Snowflake oder Fabric?", sondern: Wie kommen die Daten am besten zusammen?

#### Warum Koexistenz statt Migration?

Snowflake-Umgebungen sind oft über Jahre gewachsen — mit ELT-Strecken (häufig DBT), Berechtigungskonzepten und angeschlossenen Systemen. Eine Migration ist selten die erste Wahl. Fabric ist dafür gebaut, **fremde Datenplattformen anzubinden statt zu ersetzen**: Mirroring, Shortcuts und offene Formate (Delta, Iceberg) sind genau für diese Koexistenz da.

#### Die drei Integrationswege im Überblick

- **Mirroring** — Fabric repliziert Snowflake-Tabellen kontinuierlich nach OneLake (Delta). Abfragen laufen danach in Fabric
- **Iceberg-Shortcuts** — Zero-Copy: Snowflake schreibt Iceberg, OneLake virtualisiert die Tabellen als Delta. Eine Datenkopie für beide Welten
- **Connector** — der klassische Weg: Power BI verbindet sich per Import oder DirectQuery direkt mit Snowflake

> **Die Leitfrage:** Wo soll die Abfrage-Last laufen (und bezahlt werden) — in Snowflake oder in Fabric? Und: Wer besitzt die Daten-Governance? Die Antworten sortieren die drei Wege fast von selbst (Karte „Die drei Ansätze im Vergleich").

**Weiterlesen:** [James Serra: Three ways to use Snowflake data in Microsoft Fabric](https://www.jamesserra.com/archive/2026/01/three-ways-to-use-snowflake-data-in-microsoft-fabric/)

### Snowflake Mirroring

*SNOWFLAKE · REPLIKATION*

Mirroring repliziert Snowflake-Tabellen kontinuierlich und near-real-time nach OneLake — als Delta-Tabellen, ohne selbstgebautes ETL. Die Replikation selbst ist kostenlos.

#### Wie es funktioniert

Beim Anlegen einer **Mirrored Database** wählst du Snowflake-Datenbank und Tabellen aus; Fabric richtet die Replikation ein — technisch basierend auf **Snowflake Streams** (CDC). Änderungen fließen fortlaufend nach OneLake und werden dort als Delta Parquet abgelegt. Ohne Quell-Änderungen drosselt der Replikator sein Polling automatisch (bis zu 1 Stunde Intervall) und beschleunigt wieder, sobald Daten kommen.

![Diagramm: Snowflake-Datenbank wird über die Replikator-Engine nach OneLake gespiegelt, inklusive SQL analytics endpoint für Abfragen](https://learn.microsoft.com/en-us/fabric/mirroring/media/snowflake/fabric-mirroring-snowflake.svg)

**Abb. · Snowflake-Mirroring** Snowflake → Replikation → Delta-Tabellen in OneLake, mit SQL-Endpoint obendrauf. Quelle: [Mirroring Snowflake · Microsoft Learn](https://learn.microsoft.com/fabric/mirroring/snowflake)

#### Die Konditionen (Stand Juli 2026)

- **Replikations-Compute: kostenlos** — verbraucht keine Fabric-CUs
- **Mirroring-Storage: frei bis 1 TB pro Capacity Unit** (eine F64 hat also 64 TB freien Mirror-Speicher)
- **Snowflake-Seite kostet:** Das Virtual Warehouse läuft, wenn geänderte Daten gelesen werden — plus Cloud-Services-Kosten für Metadaten-Checks
- **Aber:** Die „extended capabilities" (Change Data Feed, Mirroring Views) werden seit Mai 2026 nach CU-Verbrauch abgerechnet — Core-Mirroring bleibt kostenlos
- **Erzeugt wird:** die Mirrored Database + automatisch ein SQL Analytics Endpoint; die Delta-Tabellen sind Direct-Lake-tauglich

#### Grenzen, die man kennen muss

- Views & Materialized Views syncen nur alle 12 Stunden (Teil der kostenpflichtigen „extended capabilities", s. o.); External/Dynamic/Temporary Tables gar nicht
- **Snowflake-RLS/CLS wird nicht repliziert** — Sicherheit muss in Fabric neu definiert werden
- Schemaänderungen (z. B. durch DBT-Deployments) können **Reseeds** auslösen — volle Neuladung der Tabelle, mit entsprechenden Snowflake-Compute-Kosten
- Mirroring läuft kontinuierlich — es gibt kein Scheduling („nur nachts spiegeln" geht nicht)

**Weiterlesen:** [Mirroring Snowflake · Microsoft Learn](https://learn.microsoft.com/fabric/mirroring/snowflake) · [Tutorial: Mirrored database konfigurieren](https://learn.microsoft.com/fabric/mirroring/snowflake-tutorial) · [Limitations · Microsoft Learn](https://learn.microsoft.com/fabric/mirroring/snowflake-limitations)

**Daten-WG dazu:**

- **[Open Mirroring in Microsoft Fabric — Daten replizieren ohne ETL](https://youtu.be/7j34Ndng0Os)** · Tutorial · 10 min · EN · [Knowledge Kitchen](../index.html#ep-7j34Ndng0Os)

### Iceberg-Shortcuts

*SNOWFLAKE · ZERO-COPY*

Der eleganteste Weg, wenn er möglich ist: Snowflake schreibt Iceberg-Tabellen, OneLake bindet sie per Shortcut ein — und virtualisiert sie automatisch als Delta. Eine Datenkopie, beide Plattformen.

#### Wie es funktioniert

Liegt eine Snowflake-**Iceberg-Tabelle** in ADLS, S3, GCS oder direkt in OneLake, genügt ein **Table-Shortcut auf den Iceberg-Ordner** (der metadata + data enthält). OneLakes **Metadata Virtualization** erzeugt automatisch virtuelle Delta-Metadaten — die Tabelle ist sofort für alle Fabric-Engines lesbar, ohne Konvertierung, ohne Kopie. Den Speicherort einer Iceberg-Tabelle verrät Snowflake per `SYSTEM$GET_ICEBERG_TABLE_INFORMATION('<table>')`.

#### Auch umgekehrt

Snowflake on Azure kann Iceberg-Tabellen **direkt nach OneLake schreiben** (External Volume auf den Files-Ordner eines Lakehouse; Fabric-Kapazität und Snowflake-Account müssen in derselben Azure-Region liegen). Und Fabric-Delta-Tabellen bekommen virtuelle Iceberg-Metadaten, sodass Snowflake sie lesen kann. Microsofts Formulierung: „Both Fabric and Snowflake can work with the same copy of data."

#### Voraussetzungen & Trade-offs

- Die Tabellen müssen als **Iceberg** vorliegen — klassische Snowflake-Managed-Tables (proprietäres Format) brauchen erst eine Umstellung
- Updates sind **sofort sichtbar** (keine Replikations-Latenz), die Daten bleiben unter Snowflake-Kontrolle
- Abfrage-Latenz hängt am Quellspeicher; Cross-Cloud-Zugriffe puffert OneLake-Caching

> **Wann dieser Weg?** Wenn das Snowflake-Team ohnehin auf Iceberg setzt (Open-Table-Format-Strategie) und Governance bei Snowflake bleiben soll — dann ist Zero-Copy dem Mirroring vorzuziehen: keine zweite Datenhaltung, kein Sync-Monitoring.

**Weiterlesen:** [Iceberg-Tabellen mit OneLake · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-iceberg-tables) · [Snowflake + Iceberg in OneLake · Microsoft Learn](https://learn.microsoft.com/fabric/onelake/onelake-iceberg-snowflake) · [Fabric Blog: Iceberg-Ankündigung](https://blog.fabric.microsoft.com/en-US/blog/store-and-use-your-snowflake-iceberg-data-in-onelake/)

### Der Snowflake-Connector

*SNOWFLAKE · KLASSIKER*

Vor Mirroring und Shortcuts gab es nur ihn — und er bleibt für viele Szenarien richtig: der Power-BI-Connector für Snowflake, mit Import oder DirectQuery.

#### Was er kann

- **Import:** Daten werden ins Power-BI-Modell kopiert — schnellste Berichte, aber Refresh-Zyklen und Duplikat
- **DirectQuery:** jede Visual-Interaktion wird zur Snowflake-Query — immer aktuell, und per **Entra-ID-SSO** greifen Snowflakes eigene RLS-Regeln pro User
- **Kein Gateway nötig** — Snowflake ist eine Cloud-Quelle
- Seit 2025 läuft der Connector auf dem **Snowflake-ADBC-Treiber** („Implementation 2.0") statt Simba-ODBC — spürbar bei DirectQuery-Performance

#### Die ehrlichen Nachteile

- **DirectQuery:** Performance hängt komplett an Snowflake — und jede Berichts-Interaktion weckt das Virtual Warehouse (Kosten!)
- **Import:** bei großen Datenmengen lange Refreshes, und die Daten liegen doppelt (Snowflake + Modell)
- Kein OneLake-Effekt: andere Fabric-Workloads (Spark, SQL) haben nichts von den Daten

> **Wann der Connector die richtige Wahl bleibt:** (1) Kleine bis mittlere Datenmengen, die als Import problemlos laufen. (2) Harte Anforderung, dass Snowflake-RLS pro User greift → DirectQuery mit SSO. (3) Kein Fabric-Buy-in im Unternehmen — der Connector braucht nur Power BI.

**Weiterlesen:** [Snowflake-Connector · Microsoft Learn](https://learn.microsoft.com/power-query/connectors/snowflake) · [Snowflake mit SSO im Service · Microsoft Learn](https://learn.microsoft.com/power-bi/connect-data/service-connect-snowflake)

### Die drei Ansätze im Vergleich

*SNOWFLAKE · ENTSCHEIDUNG*

Mirroring, Iceberg-Shortcut oder Connector? Die Entscheidung fällt entlang von vier Fragen: Wo läuft die Last, wie frisch müssen die Daten sein, wer besitzt die Governance — und welches Format liegt vor?

#### Der Vergleich

- **Mirroring** — Kopie in OneLake (Delta), near-real-time. Abfragen treffen Fabric, *nicht* Snowflake → keine Snowflake-Compute-Kosten pro Bericht. Replikation kostenlos, 1 TB Storage/CU frei. Governance/RLS muss in Fabric neu aufgebaut werden. Ideal: BI-Workloads mit Direct Lake auf Snowflake-Daten
- **Iceberg-Shortcut** — Zero-Copy, Daten bleiben unter Snowflake-Kontrolle, Updates sofort sichtbar. Voraussetzung: Iceberg-Format. Latenz hängt am Quellspeicher. Ideal: Open-Format-Strategien, bei denen beide Plattformen dieselbe Kopie nutzen sollen
- **Connector Import** — schnellste Abfragen, aber Refresh-Latenz und Modell-Duplikat. Ideal: kleinere Datenmengen, kein Fabric nötig
- **Connector DirectQuery** — maximale Frische und Snowflake-RLS via SSO, aber jede Interaktion kostet Snowflake-Compute und Performance hängt an Snowflake. Ideal: operative Berichte mit Quell-Security

#### Governance-Perspektive

Mirroring verschiebt die Konsum-Governance nach Fabric (OneLake-Berechtigungen, Modell-RLS, Purview) — sauber für BI-Self-Service, aber ein zweites Regelwerk. Shortcut und DirectQuery lassen Snowflake die Kontrolle. Diese Frage vor der technischen Wahl klären — sie ist meist die eigentliche Entscheidung.

> **Pragmatischer Default 2026:** Für Power-BI-Reporting auf Snowflake-Beständen: Mirroring zuerst prüfen — kostenlose Replikation, Direct-Lake-Performance, minimaler Aufwand. Iceberg-Shortcuts, wenn die Format-Strategie es hergibt. Connector für Spezialfälle (SSO-RLS, kein Fabric).

**Weiterlesen:** [James Serra: Three ways to use Snowflake data in Fabric](https://www.jamesserra.com/archive/2026/01/three-ways-to-use-snowflake-data-in-microsoft-fabric/) · [What is Mirroring? · Microsoft Learn](https://learn.microsoft.com/fabric/mirroring/overview)

### Berichte auf Snowflake-Daten

*SNOWFLAKE · POWER BI*

Das Endprodukt aller drei Wege ist dasselbe: ein Power-BI-Bericht. Der Unterschied liegt darin, wie sich das Modell dahinter anfühlt — und was jede Interaktion kostet.

#### Der Mirroring-Pfad (empfohlen für BI)

Gespiegelte Tabellen liegen als Delta in OneLake → darauf ein **Direct-Lake-Modell** bauen (Sektion 03 gilt 1:1): Beziehungen, Measures, ggf. RLS im Modell. Ergebnis: Import-nahe Performance auf near-real-time Snowflake-Daten, ohne dass Berichts-Nutzung Snowflake-Kosten erzeugt. Über den SQL Analytics Endpoint der Mirrored Database lassen sich die Daten zusätzlich per T-SQL abfragen und mit anderen Lakehouses joinen.

#### Der Shortcut-Pfad

Iceberg-Shortcuts erscheinen als Tabellen im Lakehouse — von dort derselbe Weg: semantisches Modell, Direct Lake, Bericht. Achtung bei sehr großen Tabellen: Guardrails gelten auch hier.

#### Der Connector-Pfad

Klassisch in Desktop: Get Data → Snowflake → Import oder DirectQuery. Kein OneLake beteiligt — das Modell lebt für sich.

> **Kombinieren erlaubt:** Ein realistisches Muster: Die großen Fakten kommen per Mirroring (Direct Lake), sensible Detail-Berichte mit Snowflake-RLS laufen als separater DirectQuery-Bericht mit SSO. Zwei Wege, ein Portal — die Nutzer merken den Unterschied nur an der Antwortzeit.

**Weiterlesen:** [Snowflake-Mirroring-Tutorial (inkl. Report-Schritt) · Microsoft Learn](https://learn.microsoft.com/fabric/mirroring/snowflake-tutorial)

## 06 · Zusammenfassung & *typische Architekturen*

Am Ende laufen alle Fabric-Fragen auf wenige Entscheidungen zusammen: Lakehouse oder Warehouse? Copy, Dataflow oder Spark? Import oder Direct Lake? Microsoft dokumentiert dafür offizielle Decision Guides — diese Sektion fasst sie zusammen und zeigt typische Referenzarchitekturen.

> Als erstes: **„Lakehouse oder Warehouse?"** — die häufigste Frage, mit der offiziellen Drei-Fragen-Regel. Danach **„Import oder Direct Lake?"** für die Modell-Seite.

### Lakehouse oder Warehouse?

*ENTSCHEIDUNGEN · DATENSPEICHER*

Die häufigste Fabric-Frage hat einen offiziellen Decision Guide — und der reduziert sie auf drei Fragen: Welche Skills? Welche Transaktionen? Welche Datentypen?

#### Die Drei-Fragen-Regel

- **Womit entwickelt dein Team?** Spark/Python → Lakehouse · T-SQL → Warehouse
- **Brauchst du Multi-Table-Transaktionen?** Ja → Warehouse (das Lakehouse kann sie nicht)
- **Welche Daten?** Un-/semi-strukturiert oder gemischt → Lakehouse · nur strukturiert → Warehouse · unsicher → Lakehouse

Beruhigend: Beide speichern Delta in OneLake und teilen sich dieselbe SQL-Engine — man kann später das jeweils andere ergänzen, ohne Daten zu migrieren.

![Entscheidungsbaum-Diagramm: Welcher Fabric-Datenspeicher passt — Eventhouse für Streaming, Cosmos DB für AI/NoSQL, SQL database für OLTP, Warehouse für DWH/BI, Lakehouse für Big Data und ML](https://learn.microsoft.com/en-us/fabric/fundamentals/media/decision-guide-data-store/decision-guide.svg)

**Abb. · Der offizielle Entscheidungsbaum** Alle Fabric-Datenspeicher nach Ideal-Use-Case. Quelle: [Decision guide: choose a data store · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/decision-guide-data-store)

#### Und die anderen Speicher?

- **Eventhouse** — Streaming/Events mit hoher Rate (Sektion 02)
- **SQL database in Fabric** — OLTP, selektive Lookups im Millisekunden-Bereich
- **Cosmos DB in Fabric** — NoSQL, AI-/Vektor-Szenarien

> **Das verbreitetste Muster:** Bronze + Silber als Lakehouse (Spark-Transformationen), Gold wahlweise als Lakehouse (BI-Teams, Direct Lake) oder Warehouse (SQL-Teams, Prozedur-ELT). Beides ist offiziell dokumentiert — es gibt kein „falsch", nur „passt nicht zum Team".

**Weiterlesen:** [Decision guide: Warehouse vs. Lakehouse · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/decision-guide-lakehouse-warehouse) · [Reitse Eskens: Warehouse vs. Lakehouse Benchmark](https://sqlreitse.com/2024/05/31/testing-azure-fabric-capacity-data-warehouse-vs-lakehouse-performance/)

**Daten-WG dazu:**

- **[600 SQL-Tabellen in Fabric](https://youtu.be/RtUiF1J5XEg)** · Talk · 35 min · DE · [Knowledge Kitchen](../index.html#ep-RtUiF1J5XEg)

### Copy · Dataflow · Spark · Eventstream

*ENTSCHEIDUNGEN · INGESTION*

Fünf Wege, Daten nach Fabric zu bewegen — der offizielle Decision Guide sortiert sie nach Persona, Datenvolumen und Transformationsbedarf.

#### Die fünf Optionen

- **Copy Activity (Pipeline)** — Migration und Ingestion bis in den Petabyte-Bereich, 50+ Konnektoren, nur leichte Transformationen. Persona: Data Engineer / Integrator
- **Copy Job** — Datenbewegung ohne Pipeline-Bau: Bulk, inkrementell (Watermark) oder CDC — der unkomplizierte Mittelweg
- **Dataflow Gen2** — 150+ Konnektoren, 300+ Transformationen, Power-Query-Oberfläche. Persona: Business Analyst / Citizen Engineer
- **Eventstream** — kontinuierliche Event-Ingestion (Kafka, Event Hubs, CDC-Feeds), No-Code-Routing an Eventhouse/Lakehouse/Activator
- **Spark (Notebook/Job)** — Code-First, beliebig komplexe Transformationen, strukturiert + unstrukturiert. Persona: Data Engineer

#### Schnell-Heuristik

- „Ich will nur Daten von A nach B" → **Copy Job**, bei Orchestrierungsbedarf **Copy Activity** in einer Pipeline
- „Ich will transformieren und kann Power Query" → **Dataflow Gen2**
- „Ich will transformieren und kann Python/SQL" → **Notebook**
- „Es sind Events, keine Batches" → **Eventstream**
- „Die Quelle ist eine ganze Datenbank, ich will sie einfach aktuell haben" → **Mirroring** (kostenlos, aber fixes Verhalten, read-only-Ziel)

> **Nicht überdenken:** Alle Wege erzeugen dieselben Delta-Tabellen. Die Wahl ist selten irreversibel — ein Dataflow lässt sich später durch ein Notebook ersetzen, ohne dass Modell oder Bericht es merken.

**Weiterlesen:** [Decision guide: Copy, Dataflow, Eventstream oder Spark · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/decision-guide-pipeline-dataflow-spark) · [Decision guide: Data movement · Microsoft Learn](https://learn.microsoft.com/fabric/data-factory/decision-guide-data-movement)

### Import oder Direct Lake?

*ENTSCHEIDUNGEN · MODELL-MODUS*

Die Modell-Frage stellt sich in jedem Fabric-BI-Projekt neu. Offizielle Leitlinie: Direct Lake für Large-Scale-Analytics auf Fabric-Daten — aber Import ist nicht tot, im Gegenteil.

#### Wann Direct Lake gewinnt

- Daten liegen ohnehin als Delta in OneLake (Lakehouse, Warehouse, Mirrored DB)
- Große Fakten (Hunderte Millionen+ Zeilen), bei denen Import-Refreshes zu lange dauern oder das Speicherlimit sprengen
- Frische zählt: Daten sollen Sekunden nach dem Schreiben im Bericht sichtbar sein (Framing statt Refresh)
- Neue Modelle: **Direct Lake on OneLake** wählen — die von Microsoft empfohlene Variante

#### Wann Import (noch) gewinnt

- Quellen außerhalb von Fabric (SaaS-APIs, Excel, On-Prem ohne Fabric-Strecke)
- Feature-Bedarf, den Direct Lake (noch) nicht deckt: Hybrid Tables, benutzerdefinierte Aggregationstabellen, uneingeschränkte Calculated Columns/Tables
- Kleine, stabile Modelle — der Direct-Lake-Vorteil ist bei 2 Mio. Zeilen schlicht irrelevant
- Kapazität unter F64 mit vielen parallelen Nutzern: Import puffert Lastspitzen im Modell ab

> **Der Composite-Mittelweg:** Direct Lake + Import lassen sich kombinieren (via Web-Modeling): große Fakten als Direct Lake, kleine Dimensionen oder Sonderquellen als Import. SQLBI empfiehlt genau dieses Muster als pragmatischen Default für gemischte Landschaften.

> **Migrationspfad:** Bestehende Import-Modelle nicht panisch umbauen. Sinnvolle Reihenfolge: neue große Modelle in Direct Lake starten; Import-Modelle erst migrieren, wenn Refresh-Dauer oder Speicher wirklich schmerzen.

**Weiterlesen:** [Direct Lake overview · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/direct-lake-overview) · [SQLBI: Direct Lake vs Import — die Entscheidungshilfe](https://www.sqlbi.com/blog/marco/2025/05/13/direct-lake-vs-import-vs-direct-lakeimport-fabric-semantic-models-may-2025/)

### Typische Referenzarchitekturen

*ENTSCHEIDUNGEN · BLAUPAUSEN*

Man muss Fabric-Architekturen nicht erfinden — Microsoft dokumentiert die Muster. Drei Blaupausen decken die meisten Projekte ab.

#### 1 · Medallion-Lakehouse (der BI-Standard)

Quellen → Pipelines/Shortcuts → Bronze-Lakehouse (raw) → Notebooks → Silber-Lakehouse (clean) → Gold-Lakehouse oder -Warehouse (Sternschema) → Direct-Lake-Modell → Power BI. Genau das Muster aus Sektion 04 — skaliert auf getrennte Workspaces pro Layer für saubere Governance.

![Referenzarchitektur: Datenquellen über Ingestion und Medallion-Lakehouse bis zu Power BI und SQL-Endpoint](https://learn.microsoft.com/en-us/fabric/data-engineering/media/tutorial-lakehouse-introduction/lakehouse-end-to-end-architecture.png)

**Abb. · Medallion-Referenzarchitektur** Die offizielle End-to-End-Blaupause. Quelle: [Lakehouse end-to-end scenario · Microsoft Learn](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction)

#### 2 · Enterprise BI mit Warehouse

Für SQL-geprägte Organisationen: Pipelines laden ins Warehouse, Stored Procedures transformieren (klassisches ELT), semantische Modelle und Berichte obendrauf. Das Azure Architecture Center dokumentiert dieses Muster als „Enterprise BI with Microsoft Fabric" — inklusive Deployment- und Netzwerk-Empfehlungen.

#### 3 · Real-Time-Pfad

Eventstream → Eventhouse (KQL) → Real-Time Dashboard + Activator; parallel OneLake-Availability, damit Batch-Analytics und Power BI dieselben Events nutzen. Referenz: „Analytics end-to-end with Microsoft Fabric".

> **Hybrid ist normal:** Reale Architekturen mischen: Medallion für Batch, Real-Time-Pfad für Telemetrie, Mirroring für die Snowflake-Bestände — alles im selben OneLake, alles im selben Modell-Layer zusammenführbar.

**Weiterlesen:** [Analytics end-to-end with Fabric · Architecture Center](https://learn.microsoft.com/azure/architecture/example-scenario/dataplate2e/data-platform-end-to-end) · [Enterprise BI mit Fabric · Architecture Center](https://learn.microsoft.com/azure/architecture/example-scenario/analytics/enterprise-bi-microsoft-fabric) · [James Serra: Fabric reference architecture](https://www.jamesserra.com/archive/2024/08/microsoft-fabric-reference-architecture/)

### Kapazität, Governance & Team

*ENTSCHEIDUNGEN · BETRIEB*

Die technisch beste Architektur scheitert an weichen Faktoren: CU-Haushalt, Workspace-Schnitt und Team-Skills entscheiden öfter über Erfolg als Lakehouse-vs.-Warehouse.

#### Kapazitäts-Haushalt

- Alle Workloads teilen sich die CUs einer Kapazität — ein außer Kontrolle geratener Spark-Job drosselt die Berichte des Vorstands
- **Fabric Capacity Metrics App** installieren und CU-Verbrauch pro Item überwachen — Pflicht ab dem ersten Produktiv-Workspace
- Bewährt: schwere Background-Lasten (Engineering) und interaktive BI-Lasten auf getrennte Kapazitäten legen — oder zumindest zeitlich entzerren

#### Workspace-Schnitt

- Pro Medallion-Layer ein Workspace (Bronze/Silber: Engineers, Gold: BI-Team, Berichte: Fachbereich) — Berechtigungen folgen dem Datenfluss
- Deployment Pipelines (Dev → Test → Prod) funktionieren für Fabric-Items wie für Power-BI-Inhalte
- Endorsement (Promoted/Certified) und OneLake Catalog machen die „richtigen" Datenprodukte auffindbar

#### Team & Skills

Die ehrliche Frage: Hat das Team Spark-Kompetenz — oder ist es ein Power-Query/SQL-Team? Fabric bedient beide (Dataflows + Warehouse vs. Notebooks + Lakehouse), aber eine Architektur gegen die Team-Skills ist ein Wartungs-Albtraum. Governance-Rollen früh klären: Wer darf Fabric-Items anlegen (Tenant-Switch), wer administriert Kapazitäten, wer zertifiziert Modelle.

> **Well-Architected:** Microsoft hat die fünf Well-Architected-Säulen (Reliability, Security, Cost, Operational Excellence, Performance) für Fabric ausformuliert — als Checkliste für Architektur-Reviews sehr brauchbar.

**Weiterlesen:** [Well-Architected für Fabric · Microsoft Learn](https://learn.microsoft.com/azure/well-architected/microsoft-fabric/overview)

**Daten-WG dazu:**

- **[Power BI-Teams werden Fabric-Datendienstleister](https://youtu.be/YzfcMurbWNc)** · Talk · 32 min · DE · [Knowledge Kitchen](../index.html#ep-YzfcMurbWNc)

### Die Entscheidungs-Checkliste

*ENTSCHEIDUNGEN · ZUSAMMENFASSUNG*

Alle Kernentscheidungen dieses Guides auf einer Karte — in der Reihenfolge, in der sie im Projekt anstehen.

#### Plattform-Frage

Brauchen wir Fabric — oder reicht Power BI Pro? Sobald eigene Daten-Pipelines, große Modelle (Direct Lake) oder Streaming ins Spiel kommen: Fabric. Nur Berichte auf fertigen Quellen: Pro reicht. Kapazität: Trial → F2/F4 zum Entwickeln → F64+, wenn Free-User konsumieren sollen.

#### Speicher-Frage

Lakehouse (Spark-Team, gemischte Daten, unsicher) oder Warehouse (SQL-Team, Multi-Table-Transaktionen)? Streaming → Eventhouse. Bestehende Lakes → Shortcuts statt Migration.

#### Ingestion-Frage

Copy Job (einfach bewegen) · Pipeline/Copy Activity (orchestriert, Petabyte) · Dataflow Gen2 (Power-Query-Team) · Notebook (Code-Team) · Eventstream (Events) · Mirroring (ganze DBs, z. B. Snowflake — Replikation kostenlos).

#### Struktur-Frage

Medallion: Bronze roh (oder Shortcut), Silber bereinigt, Gold als Sternschema. Pro Layer ein Lakehouse, bei Governance-Bedarf eigene Workspaces. V-Order an, OPTIMIZE regelmäßig.

#### Modell-Frage

Direct Lake (on OneLake) für große Fabric-Daten · Import für kleine Modelle und externe Quellen · DirectQuery für Quell-RLS und operative Frische · Composite als Mittelweg. Guardrails der Ziel-SKU vorher prüfen.

#### Betriebs-Frage

Capacity Metrics App installiert? Workspace-Schnitt und Berechtigungen definiert? Deployment-Pipeline eingerichtet? Modelle endorsed? — Dann ist die Architektur komplett.

> **Merksatz zum Schluss:** Fast jede Fabric-Entscheidung ist reversibel, weil alles auf denselben Delta-Tabellen in OneLake basiert. Lieber mit dem einfachsten passenden Baustein starten und wachsen — als die perfekte Architektur zu planen, die nie live geht.

**Weiterlesen:** [Alle Decision Guides · Microsoft Learn](https://learn.microsoft.com/fabric/fundamentals/decision-guide-data-store) · [Lernpfad: Get started with Microsoft Fabric](https://learn.microsoft.com/training/paths/get-started-fabric/)

## Quellen & *weiterführende Literatur*

Dieser Guide stützt sich auf die offizielle Microsoft-Learn-Dokumentation zu Microsoft Fabric und auf etablierte Community-Quellen (SQLBI/Marco Russo, Chris Webb, Sandeep Pawar, Nikola Ilic, James Serra u. a.). Jede zitierte Zahl ist hier rückverfolgbar. **Quellen-Validierung Juli 2026:** F-SKU-Staffelung und P-SKU-Retirement, Direct-Lake-Guardrail-Tabelle, Framing/Transcoding-Mechanik, Snowflake-Mirroring-Konditionen (GA, kostenlose Replikations-Compute, 1 TB freier Mirroring-Storage pro CU) und die Decision-Guide-Kriterien wurden gegen Microsoft Learn verifiziert. **Screenshots:** Die in den Modal-Karten eingebetteten Abbildungen stammen direkt vom Microsoft-Learn-CDN und stehen unter der Microsoft-Dokumentations-Lizenz (CC BY 4.0) zur Nutzung mit Quellenangabe. Fabric entwickelt sich monatlich weiter — im Zweifel die jeweils verlinkte Quell-Seite konsultieren.

### Microsoft Learn · Fabric Grundlagen

- [What is Microsoft Fabric? — Übersicht](https://learn.microsoft.com/fabric/fundamentals/microsoft-fabric-overview)
- [Fabric terminology — Begriffe von Capacity bis Workspace](https://learn.microsoft.com/fabric/fundamentals/fabric-terminology)
- [Understand Microsoft Fabric licenses — F-SKUs, Free/Pro/PPU](https://learn.microsoft.com/fabric/enterprise/licenses)
- [Power BI Premium FAQ — P-SKU-Retirement & Übergang zu Fabric](https://learn.microsoft.com/fabric/enterprise/powerbi/service-premium-faq)
- [Unterschiede Azure Data Factory vs. Fabric Data Factory](https://learn.microsoft.com/fabric/data-factory/compare-fabric-data-factory-and-azure-data-factory)
- [Well-Architected Framework für Microsoft Fabric](https://learn.microsoft.com/azure/well-architected/microsoft-fabric/overview)

### Microsoft Learn · OneLake & Komponenten

- [What is OneLake?](https://learn.microsoft.com/fabric/onelake/onelake-overview)
- [OneLake shortcuts](https://learn.microsoft.com/fabric/onelake/onelake-shortcuts)
- [What is a lakehouse in Microsoft Fabric?](https://learn.microsoft.com/fabric/data-engineering/lakehouse-overview)
- [SQL analytics endpoint für Lakehouses](https://learn.microsoft.com/fabric/data-engineering/lakehouse-sql-analytics-endpoint)
- [What is Fabric Data Warehouse?](https://learn.microsoft.com/fabric/data-warehouse/data-warehousing)
- [What is Data Factory in Microsoft Fabric?](https://learn.microsoft.com/fabric/data-factory/data-factory-overview)
- [What is Dataflow Gen2?](https://learn.microsoft.com/fabric/data-factory/dataflows-gen2-overview)
- [Copy Activity — Daten kopieren in Pipelines](https://learn.microsoft.com/fabric/data-factory/copy-data-activity)
- [Fabric Notebooks entwickeln und ausführen](https://learn.microsoft.com/fabric/data-engineering/author-execute-notebook)
- [NotebookUtils — Dateisystem, Secrets, Orchestrierung](https://learn.microsoft.com/fabric/data-engineering/notebook-utilities)
- [What is Real-Time Intelligence?](https://learn.microsoft.com/fabric/real-time-intelligence/overview)
- [Eventhouse overview](https://learn.microsoft.com/fabric/real-time-intelligence/eventhouse)
- [Fabric Eventstreams — Übersicht](https://learn.microsoft.com/fabric/real-time-intelligence/event-streams/overview)
- [Medallion-Lakehouse-Architektur mit OneLake](https://learn.microsoft.com/fabric/onelake/onelake-medallion-lakehouse-architecture)

### Microsoft Learn · Direct Lake & Semantische Modelle

- [Direct Lake overview](https://learn.microsoft.com/fabric/fundamentals/direct-lake-overview)
- [How Direct Lake works — Framing & Transcoding](https://learn.microsoft.com/fabric/fundamentals/direct-lake-how-it-works)
- [Direct Lake query performance verstehen](https://learn.microsoft.com/fabric/fundamentals/direct-lake-understand-storage)
- [Direct Lake security integration](https://learn.microsoft.com/fabric/fundamentals/direct-lake-security-integration)
- [Semantic model modes — Import, DirectQuery, Direct Lake](https://learn.microsoft.com/power-bi/connect-data/service-dataset-modes-understand)
- [Semantisches Modell aus Warehouse/SQL-Endpoint erstellen](https://learn.microsoft.com/fabric/data-warehouse/create-semantic-model)
- [XMLA-Endpoint — Tools-Anbindung (SSMS, Tabular Editor)](https://learn.microsoft.com/fabric/enterprise/powerbi/service-premium-connect-tools)

### Microsoft Learn · End-to-End-Tutorials & Lernpfade

- [Lakehouse end-to-end scenario — Overview & Architektur](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-introduction)
- [Tutorial Schritt 1 — Fabric-Workspace anlegen](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-get-started)
- [Tutorial Schritt 2 — Lakehouse anlegen, Daten laden, Bericht bauen](https://learn.microsoft.com/fabric/data-engineering/tutorial-build-lakehouse)
- [Tutorial Schritt 3 — Daten ingestieren (Pipeline + Copy)](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-data-ingestion)
- [Tutorial Schritt 4 — Daten transformieren (Notebooks)](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-data-preparation)
- [Tutorial Schritt 5 — Semantisches Modell & Report](https://learn.microsoft.com/fabric/data-engineering/tutorial-lakehouse-build-report)
- [Alle offiziellen End-to-End-Tutorials (DW, Data Science, RTI …)](https://learn.microsoft.com/fabric/fundamentals/end-to-end-tutorials)
- [Lernpfad: Get started with Microsoft Fabric (10 Module)](https://learn.microsoft.com/training/paths/get-started-fabric/)
- [Lernpfad: Implement a Lakehouse with Microsoft Fabric (7 Module)](https://learn.microsoft.com/training/paths/implement-lakehouse-microsoft-fabric/)
- [Lernpfad: Ingest data with Microsoft Fabric (6 Module)](https://learn.microsoft.com/training/paths/ingest-data-with-microsoft-fabric/)
- [Build Power BI reports in Microsoft Fabric (Dataflows + Direct Lake)](https://learn.microsoft.com/power-bi/fundamentals/fabric-get-started)

### Microsoft Learn · Snowflake & Mirroring

- [What is Mirroring in Fabric?](https://learn.microsoft.com/fabric/mirroring/overview)
- [Mirroring Snowflake — Funktionsweise & Kosten](https://learn.microsoft.com/fabric/mirroring/snowflake)
- [Tutorial: Mirrored database from Snowflake konfigurieren](https://learn.microsoft.com/fabric/mirroring/snowflake-tutorial)
- [Limitations — Snowflake Mirroring](https://learn.microsoft.com/fabric/mirroring/snowflake-limitations)
- [Iceberg-Tabellen mit OneLake nutzen](https://learn.microsoft.com/fabric/onelake/onelake-iceberg-tables)
- [Snowflake mit Iceberg-Tabellen in OneLake](https://learn.microsoft.com/fabric/onelake/onelake-iceberg-snowflake)
- [Snowflake-Connector — Referenz (Import/DirectQuery)](https://learn.microsoft.com/power-query/connectors/snowflake)
- [Snowflake im Power BI Service verbinden (SSO)](https://learn.microsoft.com/power-bi/connect-data/service-connect-snowflake)

### Microsoft Learn · Decision Guides & Referenzarchitekturen

- [Decision guide: choose a data store](https://learn.microsoft.com/fabric/fundamentals/decision-guide-data-store)
- [Decision guide: Warehouse vs. Lakehouse](https://learn.microsoft.com/fabric/fundamentals/decision-guide-lakehouse-warehouse)
- [Decision guide: Copy Activity, Copy Job, Dataflow, Eventstream oder Spark](https://learn.microsoft.com/fabric/fundamentals/decision-guide-pipeline-dataflow-spark)
- [Decision guide: Data-Movement-Strategie](https://learn.microsoft.com/fabric/data-factory/decision-guide-data-movement)
- [Choose an analytical data store in Fabric (Architecture Center)](https://learn.microsoft.com/azure/architecture/data-guide/technology-choices/fabric-analytical-data-stores)
- [Analytics end-to-end with Microsoft Fabric (Referenzarchitektur)](https://learn.microsoft.com/azure/architecture/example-scenario/dataplate2e/data-platform-end-to-end)
- [Enterprise-BI-Lösung mit Microsoft Fabric designen](https://learn.microsoft.com/azure/architecture/example-scenario/analytics/enterprise-bi-microsoft-fabric)

### Community · Blogs, Benchmarks & Bücher

- [Marco Russo (SQLBI): Direct Lake vs Import vs Direct Lake+Import](https://www.sqlbi.com/blog/marco/2025/05/13/direct-lake-vs-import-vs-direct-lakeimport-fabric-semantic-models-may-2025/)
- [Chris Webb: What happens when Direct Lake models hit guardrails?](https://blog.crossjoin.co.uk/2025/09/07/what-happens-when-power-bi-direct-lake-semantic-models-hit-guardrails/)
- [Sandeep Pawar: Controlling Direct Lake fallback behavior](https://fabric.guru/controlling-direct-lake-fallback-behavior)
- [Sandeep Pawar: Direct Lake incremental framing effect](https://fabric.guru/direct-lake-incremental-framing-effect)
- [Nikola Ilic: A tale of two Direct Lakes (OneLake vs. SQL-Endpoint)](https://data-mozart.com/a-tale-of-two-direct-lakes-in-microsoft-fabric/)
- [Nikola Ilic: OneLake Shortcuts — everything you need to know](https://datamozart.substack.com/p/onelake-shortcuts-everything-you)
- [James Serra: Microsoft Fabric reference architecture](https://www.jamesserra.com/archive/2024/08/microsoft-fabric-reference-architecture/)
- [James Serra: Three ways to use Snowflake data in Microsoft Fabric](https://www.jamesserra.com/archive/2026/01/three-ways-to-use-snowflake-data-in-microsoft-fabric/)
- [endjin: Azure Synapse vs Microsoft Fabric — side-by-side](https://endjin.com/blog/2023/05/azure-synapse-analytics-versus-microsoft-fabric-a-side-by-side-comparison)
- [Koen Verbeeck: Choosing between Lakehouse and Warehouse](https://www.red-gate.com/simple-talk/databases/sql-server/bi-sql-server/choosing-between-the-lakehouse-and-warehouse-in-microsoft-fabric/)
- [Reitse Eskens: Warehouse vs Lakehouse — Kapazitäts-Benchmark F2–F64](https://sqlreitse.com/2024/05/31/testing-azure-fabric-capacity-data-warehouse-vs-lakehouse-performance/)
- [Fabric Blog: Snowflake-Iceberg-Daten in OneLake via Shortcuts](https://blog.fabric.microsoft.com/en-US/blog/store-and-use-your-snowflake-iceberg-data-in-onelake/)
- [Buch: Fundamentals of Microsoft Fabric (Ilic & Weissman, O'Reilly 2025)](https://www.oreilly.com/library/view/fundamentals-of-microsoft/9781098172916/)

### Community · Deutschsprachig & Video

- [DatenPioniere: Fabric OneLake — Datensilos sauber auflösen (DE)](https://www.datenpioniere.de/blog/fabric-onelake)
- [DatenPioniere: OneLake Shortcuts — Nutzen, Security & Anleitung (DE)](https://www.datenpioniere.de/blog/microsoft-fabric-onelake-shortcut)
- [Mainzer Datenfabrik: OneLake vs. Lakehouse vs. Warehouse (DE)](https://www.madafa.de/blog/microsoft-fabric-onelake-vs-lakehouse-vs-warehouse)
- [BI or DIE — deutschsprachige Community zu Power BI, Fabric & AI](https://www.biordie.com/)
- [Will Needham: Learn Microsoft Fabric (YouTube, EN)](https://www.youtube.com/@LearnMicrosoftFabric)
- [Daten-WG — der Kanal hinter dieser Knowledge Kitchen (DE)](https://www.youtube.com/@Daten-WG)

**Microsoft Fabric End-to-End · Einsteiger-Guide · v 1** VON MICHAEL TENNER · DEUTSCH · 6 SEKTIONEN · 40 DETAIL-KARTEN

BASIEREND AUF MICROSOFT LEARN & COMMUNITY-QUELLEN

[← Zurück zur Knowledge Kitchen](../index.html) · [Power-BI-Einsteiger-Guide](../power_bi_einsteiger_guide_v4.html) · [Impressum](../impressum.html) · [Datenschutz](../datenschutz.html)

Privates Projekt von Michael Tenner · derzeit in der Beta-Phase · inhaltlich verbunden mit der [Daten-WG-Community](https://www.daten-wg.com).

---

## Weiter

- HTML (maßgeblich): https://datenwgknowledgekitchen.com/fabric_einsteiger_guide_v1.html
- Grundlagen-Guide: [power_bi_einsteiger_guide_v4.html](../power_bi_einsteiger_guide_v4.html) · [power_bi_einsteiger_guide_v4.md](power_bi_einsteiger_guide_v4.md)
