# Power BI von A bis Z — Einsteiger-Guide (End-to-End)

> Markdown-Fassung von [power_bi_einsteiger_guide_v4.html](../power_bi_einsteiger_guide_v4.html) · https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

EINSTEIGER-GUIDE · POWER BI · END-TO-END

Für alle, die Power BI seit ein bis zwei Jahren nutzen und jetzt den ganzen Weg verstehen wollen — von der Datenanbindung bis zum Sharing. Mit Schritt-für-Schritt-Anleitungen, konkreten Beispielen, und Tiefenfokus auf Query Folding und IBCS.

**v 4 · Einsteiger** · Beta · Stand Mai 2026 · DE · 10 Sektionen · 87 klickbare Detail-Karten

Michael Tenner · Power BI · Data Engineering · Daten-WG · [LinkedIn](https://www.linkedin.com/in/michael-tenner-5b885970/)

## Wo soll ich anfangen?

Dieser Guide ist **kein Buch**, das du von vorn nach hinten liest. Es ist eine Klick-Erkundung: zehn Sektionen, je 4–10 anklickbare Karten, jede führt zu einem Detail-Fenster mit Schritt-für-Schritt, Beispielen und Anfänger-Fallen.

Wenn du **1–2 Jahre Power BI** gemacht hast, kennst du die Oberfläche, aber wahrscheinlich noch nicht das *Warum* dahinter. Genau das schließen wir hier. Empfohlene Reihenfolge: **Sektion 1 → 2 → 4 → 5 → 6** abdecken die Kern-Workflows; Sektion 3, 7–10 sind Vertiefung.

Wenn du eine Karte anklickst, öffnet sich ein Modal. Mit `Esc` schließen, oder neben das Fenster klicken.

## Die Reise durch Power BI

Zehn Etappen, von der Datenanbindung bis zum Sharing. Klick führt direkt zur Sektion.

- **Architektur** — 01 · INFRASTRUKTUR
- **Power Query** — 02 · ETL
- **Query Folding** — 03 · DEEP DIVE
- **Datenmodell** — 04 · DESIGN
- **DAX** — 05 · LOGIK
- **Viz & IBCS** — 06 · DEEP DIVE
- **Interaktivität** — 07 · UX
- **Service & Sharing** — 08 · DEPLOY
- **RLS** — 09 · GOVERNANCE
- **Tools** — 10 · ERWEITERT

## 01 · Architektur & *Komponenten*

Power BI ist nicht eine einzelne App, sondern ein verteiltes System: Authoring-Tool auf deinem Rechner, Cloud-Service, On-Prem-Brücken, Lizenzschichten. Wer das nicht früh versteht, trifft teure Architektur-Entscheidungen rückwirkend.

> Als erstes: **Lies "Desktop", "Service" und "Storage Modes"** in dieser Reihenfolge — das ist das mentale Modell. Den Rest klickst du, wenn du konkret damit zu tun hast.

### Power BI Desktop

*ARCHITEKTUR · AUTHORING*

Das kostenfreie Authoring-Tool. Hier entstehen Datenmodelle, Measures und Berichte. Nur für Windows.

#### Was ist das?

Power BI Desktop ist die App, die du auf deinem Windows-Rechner installierst. Sie kombiniert vier Werkzeuge in einer Oberfläche: Power Query (Datenaufbereitung), Data View (Modellierung), Model View (Beziehungen) und Report View (Visualisierung). Das Ergebnis ist eine `.pbix`-Datei — sie enthält alles: Mashup-Code, Datenmodell und Visuals.

#### Was wo entsteht

- **Power Query Editor** — Datenanbindung und Transformation in M-Code
- **Data View** — geladene Tabellen ansehen, Datentypen ändern, berechnete Spalten anlegen
- **Model View** — Beziehungen pflegen, Hierarchien anlegen, Berechtigungen definieren
- **Report View** — Visuals platzieren, formatieren, interaktiv verknüpfen

#### Einstellungen, die du sofort ändern solltest

File → Options and Settings → Options → Data Load. Hier findest du Defaults, die für Produktiv-Arbeit ungünstig sind.

#### Auto Date/Time deaktivieren

Power BI erzeugt sonst für jede Datums-Spalte eine versteckte Datums-Hierarchie und bläht das Modell auf. **Current File → Auto Date/Time → Haken raus.** Stattdessen eine echte Datums-Dimension verwenden.

![Power BI Desktop Options dialog mit Time Intelligence Sektion und Auto date/time Checkbox](https://learn.microsoft.com/power-bi/transform-model/media/desktop-auto-date-time/auto-date-time-configure-global-options.png)

**Abb. · File → Options → Data Load** "Auto date/time" pro Datei oder global deaktivierbar. Quelle: [Auto date/time · Microsoft Learn](https://learn.microsoft.com/power-bi/transform-model/desktop-auto-date-time)

#### Updates monatlich installieren

Microsoft veröffentlicht jeden Monat ein Desktop-Update. Wer Updates auslässt, verpasst Features (Step Folding Indicators, Field Parameters, Small Multiples) und Bugfixes.

#### Externe Tools aktivieren

Wenn du Tabular Editor 2 und DAX Studio installierst, erscheinen sie im "External Tools"-Tab in Desktop und sind nahtlos integriert (siehe Sektion 10).

> **Praxis-Beispiel:** Du öffnest Desktop, wählst "Get Data" → "SQL Server", verbindest dich. Power Query Editor öffnet sich (das ist Phase 1: Aufbereitung). Du machst deine Transformationen, klickst "Close & Apply". Jetzt bist du im Data View / Report View und kannst Visualisierungen bauen.

> **Format PBIP:** Seit 2023 unterstützt Desktop das Power BI Project Format (`.pbip`) — textbasierte Dateien statt einer binären `.pbix`. Vorteil: Git-Versionskontrolle, Code-Review zwischen Entwicklern. Aktivieren unter Options → Preview features → Power BI Project (.pbip) save option.

**Lizenzhinweis:** Desktop ist immer kostenfrei. Erst die Veröffentlichung im Service braucht eine Pro- oder PPU-Lizenz.

### Power BI Service

*ARCHITEKTUR · CLOUD*

Der Cloud-Service ist das, was aus einer .pbix-Datei eine Lösung macht. Ohne ihn ist Power BI ein Einzelplatztool.

#### Was ist das?

Der Service läuft auf Microsoft-Servern (erreichbar unter app.powerbi.com). Hier werden Inhalte in Workspaces organisiert, automatisch aktualisiert, mit RLS abgesichert, in Apps gebündelt und an Endnutzer verteilt. Seit November 2023 läuft der Service als Teil von Microsoft Fabric.

#### Was nur im Service geht

- **Geplante Aktualisierung** — Datasets refreshen sich von selbst (8 mal/Tag mit Pro, 48 mit Premium/Fabric)
- **Apps und Audiences** — verpackter Inhalt für Konsumenten
- **RLS-Rollenzuweisung** — die Filter-Logik kommt aus Desktop, die Mitglieder werden im Service zugewiesen
- **Deployment Pipelines** — DEV/TEST/PROD-Trennung mit Auto-Binding
- **Embedding** — Berichte in eigene Anwendungen einbetten
- **Subscriptions** — periodische E-Mail-Snapshots

#### Bericht in den Service hochladen

In Desktop: Home → Publish → Workspace auswählen. Der Service erstellt automatisch ein Dataset (das Datenmodell) und einen Report (die Visuals) — beide getrennte Objekte.

#### Refresh einrichten

Im Service auf das Dataset gehen → "Schedule refresh" → Datenquellen-Credentials hinterlegen → Refresh-Zeiten festlegen.

#### App aus Workspace publizieren

Wenn Berichte fertig sind: Workspace → "Create app" → Audiences definieren → Publish. Konsumenten greifen über die App zu, nicht über den Workspace.

#### Workspace-Typen

- **My Workspace** — persönlich, nicht teilbar; nur für Experimente
- **Standard-Workspace** — gemeinsamer Container für Inhalte und Apps
- **Premium-/Fabric-Workspace** — auf einer Capacity, mit erweiterten Funktionen

> **Anfänger-Falle:** Bericht ist publiziert, aber Refresh schlägt fehl. Häufigste Ursache: Datenquellen-Credentials nicht hinterlegt oder Gateway nicht eingerichtet (bei On-Prem-Quellen). Im Service unter "Settings" → Dataset → "Data source credentials" prüfen.

### Web · Mobil · Embedded

*ARCHITEKTUR · KONSUM*

Wo Power BI tatsächlich konsumiert wird. Drei Kanäle, jeder mit eigenen Stärken.

#### Power BI Web (Browser)

Der Hauptkanal. Vollständige Funktionalität: Filter, Drill, Bookmarks, Personal Bookmarks, Subscriptions. Beste Erfahrung für Analyse-Arbeit.

#### Power BI Mobile Apps

iOS und Android. Berichte können mit **Phone Layout** speziell für mobile Bildschirme aufbereitet werden. Push-Benachrichtigungen für Data Alerts.

#### Phone Layout erstellen

In Desktop: View → Mobile Layout. Es öffnet sich eine vertikale Smartphone-Ansicht. Visuals aus dem normalen Layout-Pane reinziehen und für Mobile arrangieren.

#### Welche Visuals mobile-tauglich machen

Nicht alle. KPI-Karten, Säulen-Charts mit wenigen Werten, kurze Tabellen — ja. Komplexe Matrizen mit vielen Spalten — nein, die taugen nur für Desktop/Web.

#### Embedded

- **Embed for Customers** — externe Nutzer ohne Power-BI-Lizenz, App-Owns-Data-Modell, Voraussetzung Premium-/Embedded-Capacity
- **Embed for Organization** — interne Nutzer mit Power-BI-Lizenz, User-Owns-Data
- **PowerPoint-Add-In** — Live-Berichte direkt in Folien einbetten (seit 2023)
- **Teams-Integration** — Berichte als Tab oder im Chat anzeigen

> **Tipp:** Phone Layout früh planen, nicht nachträglich. Visuals und Slicer skalieren auf kleinen Screens schlecht, wenn das Layout nicht explizit angepasst ist. Bei Berichten, die viel mobil konsumiert werden: gleich beim Design parallel ein Phone Layout aufbauen.

### On-Premises Data Gateway

*ARCHITEKTUR · GATEWAY*

Die Brücke zwischen Cloud-Service und On-Premises-Datenquellen. Ohne Gateway erreicht der Service keine SQL-Server hinter der Firewall.

#### Wann brauche ich ein Gateway?

Immer wenn der Service Daten aus einer Quelle holen muss, die nicht direkt aus der Cloud erreichbar ist:

- SQL Server, Oracle, MySQL on-prem
- SharePoint on-prem, Network Shares
- Excel-Dateien auf File-Servern
- SAP-Systeme im internen Netzwerk

**Kein Gateway nötig:** Cloud-Quellen wie Azure SQL, Snowflake, Salesforce, OneDrive for Business — der Service erreicht sie direkt.

#### Zwei Gateway-Modi

| Modus | Verwendung |
| --- | --- |
| **Personal Mode** | Läuft im User-Kontext, nur für Einzelnutzer, keine Skalierung. **Nicht für Produktion.** |
| **Standard Mode** | Service-Konto, mehrere User, Cluster-fähig, zentral verwaltet. Die richtige Wahl für Unternehmen. |

#### Gateway installieren

Download von `powerbi.microsoft.com/gateway`. Auf einem dedizierten Server installieren — nicht auf einem User-Rechner. Standard Mode wählen.

#### Datenquelle registrieren

Im Service: Settings → Manage gateways → Add data source. Server, Datenbank, Anmeldedaten eintragen. Die Quelle ist jetzt für alle Datasets verfügbar, die diesen Server nutzen.

#### Cluster bilden

Auf einem zweiten Server denselben Cluster-Namen verwenden. Microsoft empfiehlt mindestens zwei Gateway-Instanzen für Hochverfügbarkeit.

#### Updates einplanen

Gateway-Updates sind monatlich. Microsoft erzwingt sie nach 6 Monaten — sonst lässt der Service das Gateway irgendwann nicht mehr zu.

> **Beispiel-Setup:** Du hast einen on-prem SQL Server mit Verkaufsdaten. Im Büro stehen zwei Windows Server: srv-bi-gw01 und srv-bi-gw02. Auf beiden Standard Gateway installieren, gleicher Cluster-Name "Production-GW". Im Service die SQL-Datenquelle einmal anlegen, Cluster auswählen. Beide Server teilen sich die Last automatisch — fällt einer aus, übernimmt der andere.

> **Anfänger-Falle:** Personal Mode auf dem eigenen Laptop installieren und glücklich sein. Funktioniert beim Tester, fällt bei Urlaub/Krankheit/Rechnerwechsel aus. Für Produktion immer Standard Mode auf einem Server.

### Free · Pro · PPU · Premium / Fabric

*ARCHITEKTUR · LIZENZEN*

Die Lizenzierung ist eines der häufigsten Stolper-Themen. Wer welche Lizenz braucht, hängt davon ab, was er mit den Inhalten tut.

#### Die vier Lizenz-Stufen

| Lizenz | Authoring | Konsum | Typischer Use Case |
| --- | --- | --- | --- |
| **Free** | Desktop nur lokal | My Workspace | Lernen, Experimentieren |
| **Pro** | Service, Sharing | Alle Pro-Inhalte | Standard-Business-User |
| **PPU** | + Premium-Features | Premium-Inhalte | Power-User ohne Capacity |
| **Premium / Fabric** | Capacity-basiert | Free-User können konsumieren | Enterprise-Bereitstellung |

#### Die wichtigsten Regeln

- **Pro reicht meistens** — Pro-User können Inhalte erstellen und mit anderen Pro-Usern teilen
- **Premium/Fabric-Capacity erlaubt Sharing mit Free-Usern** — die Capacity wird einmal bezahlt, Konsumenten brauchen keine Pro-Lizenz
- **PPU ist Pro mit Premium-Features** — gut für kleine Teams ohne große Capacity-Investition
- **Fabric-Capacity (F-SKU)** — neuer Standard, F64+ schaltet Free-Konsum frei

> **Lizenz-Kalkulation für 100 Konsumenten:** Option A: 100 × Pro-Lizenz à ~14 USD/Monat = 1.400 USD/Monat. Option B: Fabric F64-Capacity ~5.000 USD/Monat, aber Konsumenten haben Free-Lizenz. Klingt teurer, aber: ab ~30-40 Konsumenten und mit Premium-Features (Aggregations, inkrementelle Aktualisierung) ist Capacity oft sinnvoller. Plus: Skaliert besser mit weiteren Konsumenten.

> **Anfänger-Falle:** Pro-Lizenzen für reine Konsumenten kaufen. Bei kleinen Teams (5–10 Konsumenten) OK, aber sobald die Konsumenten-Zahl wächst, ist Capacity wirtschaftlicher. Auch häufig: jemand will Inkrementelle Aktualisierung nutzen, hat aber nur Pro — geht nicht, ist Premium-Feature.

### Microsoft Fabric & OneLake

*ARCHITEKTUR · FABRIC*

Microsoft Fabric ist die Plattform-Erweiterung des klassischen Power BI Service. Statt nur BI-Inhalten beherbergt sie Data Engineering, Data Science, Real-Time Analytics und Data Warehouse — alles in einem Workspace.

#### Was ist OneLake?

"OneDrive for Data". Ein logischer Storage über alle Fabric-Workloads — Tabellen liegen einmal im Delta-Parquet-Format und werden von allen Workloads gelesen, ohne Kopien.

#### Was Power-BI-Nutzer wissen müssen

- **Workspaces sind dieselben** — wenn die Workspace-Capacity eine F-SKU ist, ist sie automatisch in Fabric
- **Direct Lake Mode** — Power BI liest direkt aus Delta-Tabellen im OneLake, ohne Import und ohne DirectQuery-Latenz
- **Lakehouse** — eine OneLake-basierte Tabellen-Sammlung; ersetzt für viele Szenarien die klassische Import-Pipeline
- **Notebooks** — Spark-Notebooks für ETL und Data Science direkt im Workspace
- **Shortcuts** — Daten anderer Quellen ohne Kopie referenzieren (z. B. ADLS, S3)

#### Fabric vs. klassisches Power BI

Power BI im klassischen Service läuft weiter — es wird nicht abgekündigt. Aber neue Investitionen fließen in Fabric. Wer heute neue Modelle baut, sollte Direct Lake und Lakehouse als Optionen kennen, auch wenn das Projekt zunächst klassisch aufgesetzt wird.

> **Tipp für Einsteiger:** Du musst Fabric nicht sofort lernen. Aber: wenn dein Unternehmen eine F-SKU-Capacity hat, schau dir Direct Lake an — das ändert die Storage-Mode-Wahl für viele Szenarien fundamental.

**Status:** Fabric ist seit November 2023 GA. Die Plattform entwickelt sich monatlich weiter — vor Produktiv-Entscheidungen den aktuellen Release Plan prüfen.

> **Tiefer einsteigen:** Dieser Guide bleibt bewusst an der Oberfläche von Fabric — Power BI ist hier der Fokus. Für OneLake, Lakehouse vs. Warehouse, Direct Lake im Detail, ein komplettes End-to-End-Beispiel und Snowflake-Integration: [Microsoft-Fabric-Einsteiger-Guide →](../fabric_einsteiger_guide_v1.html)

**Daten-WG dazu:**

- **[Wo liegen meine Daten wirklich im OneLake?](https://youtu.be/ZVVSPQj9dlc)** · Tutorial · 5 min · [Knowledge Kitchen](../index.html#ep-ZVVSPQj9dlc)
- **[Microsoft Fabric — braucht das wirklich jemand?](https://youtu.be/mTVeZzshLzE)** · Talk · 48 min · [Knowledge Kitchen](../index.html#ep-mTVeZzshLzE)

### Import · DirectQuery · Dual · Direct Lake

*ARCHITEKTUR · STORAGE MODES*

Vier Storage-Modi, vier verschiedene Trade-offs zwischen Performance, Aktualität und Datenmenge.

#### Import (Default)

- Daten werden ins VertiPaq-Modell geladen und komprimiert
- **Pro:** schnellste Abfragen, alle DAX-Funktionen verfügbar, offline-fähig
- **Contra:** begrenzte Datenmenge (im Pro-Modell ~10 GB), Daten so aktuell wie der letzte Refresh

#### DirectQuery

- Jede Visual-Interaktion erzeugt eine Live-Query an die Quelle
- **Pro:** immer aktuell, beliebig große Datenmengen, RLS am Quellsystem möglich
- **Contra:** langsamer, eingeschränkte DAX-Funktionalität, Quellsystem muss schnell sein
- Folding ist bei DirectQuery **Pflicht** — alle Schritte müssen folden, sonst bricht Power Query ab

#### Dual

- Kombination — Tabelle kann beide Modi je nach Query-Kontext nutzen
- Typisch für Dimensionstabellen in Composite Models

#### Direct Lake (Fabric)

- Power BI liest direkt aus Delta-Tabellen im OneLake — ohne Import-Refresh, ohne DirectQuery-Latenz
- **Pro:** Performance fast wie Import, Aktualität fast wie DirectQuery
- **Contra:** braucht Fabric-Capacity, fällt bei unsupported features auf DirectQuery zurück
- Aktuell die spannendste Innovation — verändert die Modus-Wahl für viele neue Modelle

Framing, Guardrails pro F-SKU und die zwei Direct-Lake-Varianten (on OneLake vs. on SQL endpoints) im Detail: [Fabric-Guide → Sektion „Semantik & Direct Lake"](../fabric_einsteiger_guide_v1.html)

> **Entscheidungs-Beispiel:** Tagesumsatz-Bericht aus on-prem SQL, Daten der letzten 5 Jahre. Volumen: 80 Millionen Zeilen, wird einmal nachts aktualisiert. → **Import.**
>
> Echtzeit-Lager-Bestand-Dashboard, Zahlen müssen aktuell auf die Sekunde stimmen. → **DirectQuery.**
>
> Modell mit 500-Millionen-Zeilen-Faktentabelle plus kleinen Dimensionen. → **Composite**: Fakt in DirectQuery (oder Direct Lake bei Fabric), Dimensionen in Dual oder Import.

**Faustregel:** Im Zweifel Import. DirectQuery nur, wenn Aktualität oder Datenmenge es erzwingen. Direct Lake, wenn die Plattform Fabric ist.

> **Anfänger-Falle:** DirectQuery wählen, weil "es klingt moderner". DirectQuery ist deutlich langsamer als Import in Bezug auf Reaktionszeit der Visuals. Nur einsetzen, wenn die Trade-offs (Aktualität, Datenmenge) bewusst akzeptiert werden.

## 02 · Power Query *Workflow*

70 % der BI-Arbeitszeit fließt typischerweise in Datenaufbereitung. Sauber gemachte Power Query spart später Stunden bei Modellierung und Performance.

> Als erstes: **Verstehe die drei Spalten: Quellen → Staging → Modell.** Das Trennprinzip ist wichtiger als jeder einzelne Klick. Dann klick "Datentypen früh setzen" — das ist der wichtigste Einzeltipp.

### 01 · EXTRACT · Quellen

Rohdaten aus heterogenen Systemen. Power Query hat für jeden Typ einen Connector.

#### Datei-Quellen · CSV · Excel · JSON · Parquet

*POWER QUERY · QUELLEN*

Die häufigste Quellart in Einsteiger-Projekten. CSVs aus Exporten, Excel-Listen aus Fachabteilungen, JSON von Web-APIs.

##### Was ist das?

Power Query hat für jeden Dateityp einen nativen Connector — er weiß, wie er CSV-Trennzeichen erkennt, Excel-Sheets auflistet oder JSON-Strukturen aufdröselt. Die Funktion heißt im M-Code immer `<Format>.Document`: `Csv.Document`, `Excel.Workbook`, `Json.Document`.

##### Wichtige Connectors

- **CSV** — `Csv.Document`: Trennzeichen, Encoding, Quoting
- **Excel** — `Excel.Workbook`: Sheets, benannte Bereiche, Tabellen
- **JSON** — `Json.Document`: oft mit Pagination und Auth
- **Parquet** — `Parquet.Document`: spaltenorientiert, sehr effizient
- **Ordner** — `Folder.Files`: für mehrere Dateien gleichzeitig

##### CSV richtig laden

Encoding und Trennzeichen explizit setzen. Power Query rät meist richtig, aber bei Sonderzeichen oder Komma-/Semikolon-Mischungen kann es zu Fehlern kommen. `UTF-8` entspricht Encoding-Code `65001`.

```powerquery
let
  Source = Csv.Document(
    File.Contents("C:\Daten\verkauf.csv"),
    [Delimiter=";", Columns=18,
     Encoding=65001, QuoteStyle=QuoteStyle.None]
  ),
  Headers = Table.PromoteHeaders(Source)
in Headers
```

##### Excel mit mehreren Sheets

Bei Excel zeigt Power Query alle Sheets und Tabellen an. **Benannte Tabellen sind vorzuziehen** (in Excel: Einfügen → Tabelle). Sie sind robuster gegen Layoutänderungen als Sheet-Bereiche.

##### Ordner-Quelle für viele gleiche Dateien

"Get Data → Folder" — Power Query liest alle Dateien im Ordner. Ideal für monatliche Exporte: neue Datei reinkopieren, Refresh klicken, automatisch ergänzt.

> **Praxis-Beispiel:** Du bekommst monatlich eine CSV von der Buchhaltung in einen SharePoint-Ordner. Statt jeden Monat manuell zu laden: SharePoint-Folder-Connector verwenden, alle CSVs werden automatisch kombiniert. Refresh erkennt neue Dateien automatisch.

> **Anfänger-Falle:** Excel-Datei mit verbundenen Zellen oder ohne Header laden. Power Query erwartet eine Tabellenstruktur. Verbundene Zellen werden zu NULL-Wüsten, fehlende Header zu Spalten "Column1, Column2". Vor dem Laden in Excel: Tabelle erzeugen, Header definieren.

#### Web- & API-Quellen

*POWER QUERY · QUELLEN*

Daten direkt aus Web-APIs oder HTML-Tabellen ziehen. Mächtig, aber mit Stolperfallen bei Authentifizierung und Pagination.

##### Drei Arten von Web-Quellen

- **HTML-Tabellen** — Power Query erkennt `<table>`-Elemente auf Webseiten automatisch (z. B. Wikipedia)
- **REST APIs** — JSON oder XML über HTTP, oft mit Auth-Header oder API-Key
- **OData-Feeds** — strukturierte API-Feeds mit eigenem Connector (`OData.Feed`)

##### Einfacher Web-Connector

Get Data → Web → URL eintragen. Power Query analysiert die Seite und zeigt alle erkannten Tabellen. Für statische HTML-Tabellen reicht das.

##### REST API mit Authentifizierung

Über `Web.Contents` mit `RelativePath` und `Headers`:

```powerquery
let
  Source = Json.Document(
    Web.Contents(
      "https://api.example.com",
      [RelativePath="v1/orders",
        Headers=[#"Authorization"="Bearer xyz123"]]
    )
  )
in Source
```

##### Pagination handhaben

Viele APIs liefern Daten paginiert (Seite 1, 2, 3, ...). In M-Code mit `List.Generate` alle Seiten holen und kombinieren:

```powerquery
List.Generate(
  () => [page=1, data=GetPage(1)],
  each [data][has_more] = true,
  each [page=[page]+1, data=GetPage([page]+1)]
)
```

> **Praxis-Beispiel:** Wikipedia-Tabelle "Liste deutscher Großstädte" laden: Get Data → Web → URL der Wikipedia-Seite → Power Query zeigt mehrere Tabellen → die richtige auswählen. Hat 80 Zeilen, ist nach Bevölkerung sortiert, kann ohne weitere Logik importiert werden.

> **Anfänger-Falle:** API-Key direkt in den M-Code schreiben. Sieht im Editor harmlos aus, aber: wenn die `.pbix` geteilt wird, ist der Key sichtbar. Stattdessen: bei Web.Contents die Auth über die Power-Query-Anmeldedaten setzen, oder mit Parametern arbeiten.

> **Rate Limits:** Viele APIs haben Rate Limits (z. B. 100 Requests/Minute). Power Query macht keine eigene Drosselung. Bei großen Datenmengen oder häufigem Refresh: in der Doku der API nach Limits suchen.

#### Datenbank-Quellen · der Folding-Hebel

*POWER QUERY · QUELLEN*

SQL Server, Oracle, PostgreSQL, Snowflake, MySQL — alle Datenbank-Connectors unterstützen Query Folding. Das ist der Hauptgrund, warum DB-Quellen den Datei-Quellen vorzuziehen sind, wenn die Wahl besteht.

##### Was ist das Besondere?

Bei einer Datei muss Power Query immer die **ganze Datei** einlesen, dann transformieren. Bei einer Datenbank kann es Filter, Joins und Aggregationen **an die Datenbank delegieren** — und nur das gefilterte Ergebnis kommt zurück. Das nennt sich **Query Folding** (siehe Sektion 3).

##### Wichtige Connectors

- **SQL Server** — Microsoft-eigener Connector, beste Integration
- **Azure SQL / Synapse** — Cloud, schnellster Folding-Hebel
- **Oracle, PostgreSQL, MySQL** — etablierte Connectors
- **Snowflake, BigQuery, Databricks** — moderne Cloud-DWHs, native Connectors
- **SAP HANA, SAP BW** — SAP-Welt
- **ODBC** — Notbehelf, foldet schlechter; immer nativen Connector bevorzugen

##### Verbindung herstellen

Get Data → SQL Server → Server-Name und Datenbank eintragen. **Import-Modus wählen**, nicht DirectQuery (es sei denn, du brauchst Live-Daten).

##### Authentifizierung

Drei Optionen: Windows-Authentifizierung (Default in Firmennetzen), Datenbank-Authentifizierung (User/Passwort), Microsoft-Konto (für Azure-Quellen).

##### Navigator: was laden?

Power Query zeigt alle Tabellen und Views. **Nur die wirklich benötigten Tabellen anhaken** — jede zusätzliche Tabelle bedeutet mehr Speicher und Komplexität.

##### Views vs. Tabellen

Wenn die Datenbank-Admins Views bereitstellen, diese bevorzugen. Views sind oft schon optimiert und enthalten Joins/Filter, die der DBA für Reports vorbereitet hat.

> **Praxis-Beispiel mit Folding-Effekt:** Faktentabelle mit 200 Millionen Zeilen. Du brauchst nur Daten der letzten 12 Monate.
>
> **Falsch:** Tabelle komplett laden, dann mit `Table.SelectRows` filtern. Ergebnis: 200 Mio Zeilen werden übertragen, dann lokal gefiltert. Refresh dauert ewig.
>
> **Richtig:** Tabelle laden, sofort filtern. Power Query erkennt den Filter, schickt das SQL `WHERE Datum >= ...` an die Datenbank, nur 30 Mio Zeilen werden übertragen.

> **Tipp:** Bei großen Quellen **Native Query** als letzte Option — eine handgeschriebene SQL-Query, die du Power Query gibst. Foldet zwar nicht (alles dahinter bricht), aber wenn die SQL hochoptimiert ist, kann das insgesamt schneller sein als M-Code-Pipeline.

> **Anfänger-Falle:** DirectQuery ausprobieren, weil "es immer aktuell ist". DirectQuery bei großen Faktentabellen ohne saubere Indizes ist eine Performance-Katastrophe. Im Zweifel Import wählen.

#### In M generiert · Datums- & Zeit-Dimensionen

*POWER QUERY · QUELLEN*

Die wichtigste Dimension im Modell — die Datums-Tabelle — wird nicht aus Quelldaten abgeleitet, sondern in M-Code generiert. Vollständig, konsistent, unabhängig vom Datenstand.

##### Warum generieren statt extrahieren?

- **Vollständigkeit** — auch Tage ohne Bewegung sind enthalten (z. B. Sonntage, Feiertage)
- **Konsistenz** — gleicher Aufbau über alle Modelle der Organisation
- **Unabhängigkeit** — keine Abhängigkeit von Quellsystem-Zeitstempeln
- **Vorausschauend** — kann Zukunfts-Daten enthalten (für Plan-Werte)

##### Datums-Liste erzeugen

Mit `List.Dates` alle Tage zwischen Start und Ende generieren:

```powerquery
let
  StartDatum = #date(2020, 1, 1),
  EndDatum    = #date(2030, 12, 31),
  Tage = List.Dates(
    StartDatum,
    Duration.Days(EndDatum - StartDatum) + 1,
    #duration(1, 0, 0, 0)
  ),
  Tabelle = Table.FromList(Tage,
    Splitter.SplitByNothing(), {"Datum"})
in Tabelle
```

##### Spalten ergänzen

Aus dem Datum alle relevanten Attribute ableiten: Jahr, Quartal, Monat, Monatsname (mit Sortier-Spalte), Wochentag, KW, Feiertag-Flag.

```powerquery
Tabelle
|> Table.AddColumn("Jahr", each Date.Year([Datum]))
|> Table.AddColumn("Quartal", each "Q" & Text.From(Date.QuarterOfYear([Datum])))
|> Table.AddColumn("Monat", each Date.Month([Datum]))
|> Table.AddColumn("Monatsname", each Date.MonthName([Datum]))
|> Table.AddColumn("Wochentag", each Date.DayOfWeek([Datum], Day.Monday))
```

##### Tabelle als Datums-Tabelle markieren

In Desktop: Modeling-Tab → Mark as date table → Datums-Spalte auswählen. **Pflicht für Time-Intelligence-Funktionen.**

##### Pflicht-Spalten

- **DateKey** — eindeutiger Datums-Primärschlüssel
- **Jahr, Quartal, Monat** — Hierarchie-Ebenen
- **Monatsname** + **Sortier-Spalte** (sonst alphabetisch sortiert: April, August, ...)
- **Wochentag** als Zahl und als Name
- **Kalenderwoche** (ISO-Standard)
- Optional: Geschäftsjahr, Feiertag-Flag, Arbeitstag-Flag, Relative-Date-Spalten

> **Use Case · Geschäftsjahr:** Dein Unternehmen hat ein Geschäftsjahr Juli–Juni. Standard-DAX-Funktionen rechnen aber kalendarisch. In der Datums-Dimension eine Spalte "Geschäftsjahr" mit M-Logik erzeugen: wenn Monat >= 7, dann Jahr, sonst Jahr-1. Time Intelligence darauf abstützen.

> **Anfänger-Falle:** Vergessen, die Tabelle als Datums-Tabelle zu markieren. Folge: TOTALYTD, SAMEPERIODLASTYEAR und andere Time-Intelligence-Funktionen liefern falsche Ergebnisse oder gar nichts.

### 02 · TRANSFORM · Staging (Power Query)

Staging-Queries bereinigen, standardisieren und formen. Die Modelltabellen verweisen ausschließlich darauf.

#### Datentypen früh setzen

*POWER QUERY · STAGING*

Der wichtigste Einzelschritt in Power Query — und der, der bei Einsteigern am häufigsten verschlampt wird.

##### Warum so wichtig?

- **Folding** — bei Datenbank-Quellen werden Filter und Joins korrekt übersetzt nur mit korrekten Typen
- **Beziehungen** — funktionieren nur zwischen kompatiblen Typen
- **Sortierung & Aggregation** — Text-Datumsangaben werden alphabetisch sortiert (April, August, Dezember…), nicht chronologisch
- **Berechnungen** — Text + Text gibt nicht "Summe", sondern Stringverknüpfung

##### Schritt 1: Header promoten

Erster Schritt nach dem Laden: Home → "Use First Row as Headers". Erzeugt einen Schritt `Table.PromoteHeaders`.

##### Schritt 2: Datentypen manuell setzen

Den automatisch erzeugten "Changed Type"-Schritt entfernen (er rät oft falsch) und manuell typisieren:

```powerquery
let
  Source = …,
  Headers = Table.PromoteHeaders(Source),
  Typed = Table.TransformColumnTypes(Headers, {
    {"Datum",         type date},
    {"Bestellnr",    type text},
    {"Menge",         Int64.Type},
    {"Preis",         Currency.Type},
    {"Erstellt am", type datetime}
  })
in Typed
```

##### Schritt 3: Lokalisierung beachten

Bei Datum-Texten mit "01.05.2024" musst du Power Query mitteilen, dass das deutsches Format ist — sonst wird es als 5. Januar interpretiert:

```powerquery
Table.TransformColumnTypes(t,
  {{"Datum", type date}},
  "de-DE")
```

##### Häufige Power-Query-Typen

| Typ | Verwendung |
| --- | --- |
| `Int64.Type` | Ganzzahlen (Mengen, Anzahlen, IDs) |
| `Currency.Type` | Beträge mit fester Dezimalstellen-Genauigkeit |
| `type number` | Dezimalzahlen (Quoten, Faktoren) |
| `type date` | Reines Datum (ohne Uhrzeit) |
| `type datetime` | Datum + Uhrzeit |
| `type text` | Strings, IDs, Schlüssel |
| `type logical` | true / false |

> **Anfänger-Falle:** Den automatisch eingefügten "Changed Type"-Schritt akzeptieren. Power Query macht oft schlechte Vermutungen — typisiert IDs als Number (führende Nullen verloren), Datumsangaben als Text (chronologische Sortierung kaputt). Schritt entfernen und manuell typisieren.

#### Schlüssel bereinigen

*POWER QUERY · STAGING*

Vor jedem Join müssen die Verbindungs-Spalten konsistent sein. "Berlin" ≠ "Berlin " ≠ "berlin" ≠ "BERLIN" — ohne Bereinigung entstehen Mismatches, die als NULL durchschlüpfen.

##### Die fünf typischen Probleme

- **Whitespace** — Leerzeichen am Anfang/Ende
- **Schreibweise** — Groß-/Kleinschreibung uneinheitlich
- **Unsichtbare Zeichen** — Non-Breaking Spaces, Tabs
- **Synonyme** — "DE" vs. "Deutschland" vs. "Germany"
- **Format-Inkonsistenz** — "12345" vs. "012345" vs. "12.345"

##### Trim und Clean

`Text.Trim` entfernt Whitespace am Anfang und Ende. `Text.Clean` entfernt nicht-druckbare Zeichen.

```powerquery
Table.TransformColumns(t, {
  {"Stadt", each Text.Trim(Text.Clean(_)), type text}
})
```

##### Schreibweise vereinheitlichen

Für Schlüssel: `Text.Lower` oder `Text.Upper` — egal welches, Hauptsache konsistent.

```powerquery
Table.TransformColumns(t, {
  {"PLZ", Text.Upper, type text}
})
```

##### Synonyme harmonisieren

Mit `Table.ReplaceValue` für einzelne Ersetzungen oder einer Mapping-Tabelle mit Merge für viele.

```powerquery
Table.ReplaceValue(t,
  "Germany", "DE",
  Replacer.ReplaceText,
  {"Land"})
```

##### Padding bei fester Länge

PLZ in Deutschland 5-stellig, in der CSV manchmal als "1234" geliefert (führende Null verloren):

```powerquery
Table.TransformColumns(t, {
  {"PLZ", each Text.PadStart(_, 5, "0"), type text}
})
```

> **Praxis-Beispiel:** Faktentabelle hat "Stadt"-Spalte: "Berlin", "berlin", " Berlin", "Berlín". Dimension hat: "Berlin". Ohne Bereinigung match nur "Berlin" — die anderen drei Zeilen werden im Join zu NULL. Mit Trim + Lower + Replace ("Berlín" → "Berlin") gleichen sich alle 4 ab.

> **Tipp:** Nach jedem Join die Match-Quote prüfen. Wenn mehr als ein paar Prozent NULL nach Expand, dann ist die Bereinigung unvollständig. `Table.RowCount(Table.SelectRows(t, each [Land]=null))` liefert die Mismatches.

> **Anfänger-Falle:** "Sieht doch alles gleich aus." Power Query unterscheidet zwischen sichtbar gleichen Strings mit unterschiedlichen Unicode-Zeichen. Excel-Exporte enthalten oft Non-Breaking Spaces (Unicode U+00A0), die wie normale Leerzeichen aussehen, aber von `Text.Trim` nicht entfernt werden. Lösung: vorher `Text.Replace(_, "#(00A0)", " ")`.

#### Joins (Merges) · Tabellen verknüpfen

*POWER QUERY · STAGING*

Power Query nennt SQL-Joins "Merges". Sechs Varianten, jede für einen anderen Zweck — die falsche Wahl produziert falsche Berichte, ohne Warnung.

##### Die sechs Join-Typen

| Typ | Verhalten | Use Case |
| --- | --- | --- |
| **Left Outer** | Alle linken Zeilen, passende rechte | Default · meist richtig |
| **Inner** | Nur passende Zeilen | Vorsicht — verliert ungematche |
| **Full Outer** | Alle Zeilen aus beiden | Abgleichs-Reports |
| **Left Anti** | Nur linke ohne Match | Fehlende Stammdaten finden |
| **Right Anti** | Nur rechte ohne Match | Ungenutzte Stammdaten finden |
| **Right Outer** | Spiegelung Left Outer | Selten — Tabellen-Reihenfolge tauschen klarer |

##### Merge starten

Im Power Query Editor: linke Tabelle auswählen → Home-Tab → Merge Queries. Es öffnet sich ein Dialog mit beiden Tabellen und der Join-Vorschau.

##### Schlüsselspalten auswählen

In beiden Tabellen die Verknüpfungsspalte anklicken. Wenn der Schlüssel aus mehreren Spalten besteht: Strg+Klick für Mehrfachauswahl. Beide Seiten müssen denselben Datentyp haben.

##### Join-Typ wählen

"Join Kind" unten im Dialog. Default ist Left Outer. Unten zeigt Power Query die Match-Statistik: "X aus Y rows match" — das ist deine Qualitätskontrolle.

##### Expand

Nach OK erscheint eine neue Spalte mit verschachtelten Tabellen. Auf das Doppelpfeil-Icon klicken → die gewünschten Spalten aus der rechten Tabelle auswählen → "Use original column name" deaktivieren (sonst Präfixe).

> **Praxis-Beispiel:** Faktentabelle `Verkauf` hat `KundenID`, Dimension `Kunde` hat `KundenID` + `Stadt`. Left Outer Join auf KundenID, Stadt expandieren. Ergebnis: `Verkauf` hat jetzt eine Stadt-Spalte. Wenn 5 Verkäufe einen unbekannten Kunden haben (Tippfehler in der ID), bleibt Stadt dort NULL — sichtbarer Hinweis, dass Stammdaten unvollständig sind.

> **Anfänger-Falle:** **Inner Join statt Left Outer** wählen, ohne es zu merken. Inner verliert ungematche Zeilen still und leise. Wenn du dachtest, die Faktentabelle hat 1 Mio Zeilen, und sie hat nach dem Join nur noch 950 Tsd — Inner Join hat 50 Tsd Zeilen entfernt, weil sie keinen Match in der Dimension hatten.

> **Anfänger-Falle 2:** Wenn die rechte Tabelle Duplikate enthält (Schlüssel nicht eindeutig), multipliziert der Join die linken Zeilen. Aus 1 Mio werden plötzlich 1,5 Mio — Summen sind falsch. Lösung: vor dem Join auf der rechten Seite Duplikate prüfen mit `Table.Distinct` oder `Table.RemoveDuplicates`.

#### Dimensionen extrahieren

*POWER QUERY · STAGING*

Wenn deine Quelle eine einzige breite Tabelle ist (alles in einer CSV), brauchst du Power Query um daraus Stern-Schema-Tabellen zu bauen.

##### Warum Dimensionen rausziehen?

- **Speicher** — Texte werden in der Faktentabelle nur als IDs gespeichert, in der Dimension einmal
- **Performance** — VertiPaq komprimiert kleinere Dimensions-Tabellen besser
- **Konsistenz** — Stammdaten an einer Stelle, nicht in Millionen Faktzeilen
- **Modellierung** — Stern-Schema setzt Dimensionen voraus

##### Original-Query duplizieren

Rechtsklick auf die Quell-Query → "Reference". Das ist der Ausgangspunkt für die Dimension. Die Faktentabelle nimmt einen eigenen Reference-Pfad.

##### Dimension reduzieren

In der Dimensions-Query: nur die relevanten Spalten behalten (`Table.SelectColumns`), dann Duplikate entfernen (`Table.Distinct`).

```powerquery
let
  Source = stg_verkauf,
  Selected = Table.SelectColumns(Source,
    {"ProduktID", "Produkt", "Kategorie", "Hersteller"}),
  Distinct = Table.Distinct(Selected)
in Distinct
```

##### Surrogate Key vergeben

Optional, aber empfohlen: `Table.AddIndexColumn` erzeugt einen aufsteigenden Integer-Schlüssel. In der Dimension als PK, in der Faktentabelle wird der Business-Key durch den Surrogate ersetzt.

##### Spalten in der Faktentabelle entfernen

Die jetzt in der Dimension stehenden Spalten (Produkt, Kategorie, Hersteller) aus der Faktentabelle entfernen. Nur die Schlüssel-Spalte (ProduktID) bleibt.

> **Praxis-Beispiel:** Quelle: CSV mit 5 Mio Zeilen, Spalten `BestellNr, Datum, KundenID, Kundenname, Stadt, Land, ProduktID, Produkt, Kategorie, Menge, Preis`.
>
> **Nach Extraktion:**
>
> - `fact_verkauf` — 5 Mio Zeilen: BestellNr, Datum, KundenID, ProduktID, Menge, Preis (6 Spalten)
> - `dim_kunde` — ~10 000 Zeilen: KundenID, Kundenname, Stadt, Land
> - `dim_produkt` — ~5 000 Zeilen: ProduktID, Produkt, Kategorie
>
> Speicherbedarf des Modells sinkt drastisch, Performance steigt, Modell ist verständlich.

> **Tipp:** Wenn dieselbe Information in der Quelle mehrfach pro Schlüssel auftaucht (z. B. "Müller GmbH" vs "Müller Gmbh" für dieselbe KundenID), entstehen Duplikate in der Dimension. Vor `Table.Distinct` die Texte bereinigen (Trim, Lower, etc.).

#### Klassifizierungen ableiten

*POWER QUERY · STAGING*

Aus Rohwerten Kategorien machen — Umsatz-Buckets, Status-Flags, Altersgruppen. Wenn die Klassifizierung stabil ist, gehört sie in Power Query, nicht in DAX.

##### Warum in Power Query, nicht in DAX?

- **Performance** — einmal beim Refresh berechnet, nicht bei jeder Query neu
- **Filterbar** — Calculated Columns sind als Slicer/Filter nutzbar
- **Sichtbar im Modell** — kein Geheimwissen im DAX

##### Vier typische Klassifizierungs-Pattern

1. **Buckets aus numerischen Werten** — "Umsatz < 1000 = klein, sonst groß"
2. **Flags aus Spalten** — "ist Geschenk?" basierend auf Produktgruppe
3. **Mapping über Lookup-Tabelle** — Region aus PLZ ableiten
4. **Berechnete Kennzahlen** — Umsatz = Menge × Preis

##### Conditional Column

Add Column → Conditional Column. Visueller Editor für einfache if/then/else-Logik. Erzeugt M-Code:

```powerquery
Table.AddColumn(t, "Größe", each
  if [Umsatz] < 1000 then "klein"
  else if [Umsatz] < 10000 then "mittel"
  else "groß")
```

##### Custom Column für Komplexes

Wenn die Logik mehr als simple if/else hat — z. B. mehrere Spalten kombinieren — Custom Column verwenden:

```powerquery
Table.AddColumn(t, "Wert-Status", each
  if [Menge] = 0 then "Storniert"
  else if [Datum] >= Date.From(DateTime.LocalNow())
        then "Geplant"
  else "Realisiert")
```

##### Berechnete Kennzahlen früh

Umsatz = Menge × Preis. Wenn das stabil ist und immer gebraucht wird → in Power Query, nicht in DAX:

```powerquery
Table.AddColumn(t, "Umsatz", each
  [Menge] * [Preis], Currency.Type)
```

> **Praxis-Beispiel · Altersgruppen:** Quelle hat `Geburtstag`. Du brauchst Altersgruppen "0-17, 18-29, 30-49, 50+". In Power Query: Custom Column mit `Date.Year(DateTime.LocalNow()) - Date.Year([Geburtstag])` für Alter, dann Conditional Column für die Gruppen. Beide Spalten im Modell verfügbar — die Altersgruppe ist als Slicer nutzbar.

> **Tipp:** Bei komplexen Mappings (z. B. PLZ → Region mit 200 Einträgen): Mapping als eigene Tabelle (CSV oder Excel-Sheet) anlegen und per Merge anschließen. Wartbarer als ein 200-zeiliges if/else.

> **Anfänger-Falle:** Klassifizierungen, die ständig wechseln (z. B. "Top-10-Kunden") in Power Query implementieren. Nicht praktikabel — Top-10 hängt vom Filter-Kontext im Bericht ab. Das gehört in DAX als Measure.

### 03 · LOAD · Datenmodell

Das Datenmodell ist ein Stern-Schema — Faktentabelle in der Mitte, Dimensionen außen.

#### 1 Faktentabelle

*POWER QUERY · MODELL*

Im Stern-Schema gibt es eine zentrale Faktentabelle. Sie enthält die **Kennzahlen** (was gemessen wird) plus die **Fremdschlüssel** zu allen Dimensionen.

##### Was gehört rein?

- **Fremdschlüssel (FK)** — Verweise auf Dimensionen: DateKey, ProduktKey, KundenKey, ...
- **Kennzahlen (Measures-Quellen)** — Menge, Preis, Betrag, Dauer, ...
- **Optional: Degenerate Dimensions** — Identifikatoren ohne eigene Dimensions-Tabelle (z. B. Bestellnummer)

##### Was NICHT rein gehört

- **Beschreibende Attribute** — Produktname, Stadt, Kundenname — die gehören in Dimensionen
- **Vorberechnete Aggregate** — Monats-/Jahressummen vermischt mit Tageswerten (Granularitäts-Bruch)
- **Daten anderer Granularität** — wenn Bestellpositionen die Granularität sind, keine Bestellsummen reinmischen

##### Faktentabelle benennen

Konvention: `fact_*` oder `F_*`. In Power Query Editor klar erkennbar machen.

##### Schlüsselspalten verifizieren

Jeder Fremdschlüssel muss einen Match in der entsprechenden Dimension haben. Im Modell View entstehen sonst Beziehungs-Konflikte.

##### Spalten-Datentypen prüfen

Kennzahlen als `Currency.Type` oder `Int64.Type`, Schlüssel als gleicher Typ wie in der Dimension.

##### Granularität dokumentieren

Im Description-Feld der Tabelle: "Eine Zeile pro Bestellposition" — damit das Team später weiß, was eine Zeile bedeutet.

> **Praxis-Beispiel:**
>
> `fact_verkauf` · Granularität: eine Zeile pro Bestellposition
>
> - DateKey (FK)
> - KundenKey (FK)
> - ProduktKey (FK)
> - BestellNr (degenerate dim)
> - Menge (int)
> - Einzelpreis (currency)
> - Rabatt (currency)
>
> Umsatz wird als DAX-Measure berechnet: `SUMX(fact_verkauf, fact_verkauf[Menge] * fact_verkauf[Einzelpreis] - fact_verkauf[Rabatt])`.

> **Anfänger-Falle:** **Mehrere Granularitäten in einer Faktentabelle.** Beispiel: Tagesumsätze und Monatssummen in derselben Tabelle. Bei `SUM([Umsatz])` wird alles addiert — Tageswerte werden doppelt gezählt, weil die Monatssumme schon enthalten ist. Eine Granularität pro Faktentabelle. Wenn beide gebraucht: zwei getrennte Faktentabellen.

#### 5+ Dimensionstabellen

*POWER QUERY · MODELL*

Dimensionen sind die "Wer / Was / Wann / Wo" — sie beantworten, wie man die Kennzahlen filtern und gruppieren kann.

##### Welche Dimensionen braucht jedes Modell?

1. **Datum** (immer) — Pflicht für Zeitreihen-Analyse
2. **Zeit** (oft) — wenn Stunden-/Minuten-Granularität gefragt ist
3. **Geschäftsobjekte** — Produkt, Kunde, Verkäufer, Filiale, ...
4. **Klassifizierungen** — Kategorie, Status, Region

##### Was gehört in eine Dimension?

- **Primärschlüssel** — eindeutig, idealerweise Integer (Surrogate Key)
- **Business Key** — der externe Schlüssel aus dem Quellsystem (ProduktID, KundenID, ...)
- **Beschreibende Attribute** — Name, Kategorie, Adresse, alle textuellen Eigenschaften
- **Hierarchie-Ebenen** — Kategorie > Unterkategorie > Produkt
- **Optional: Sort-By-Spalten** — z. B. Monatsname mit numerischer Sortier-Spalte

##### Pro Dimension eine eigene Query

Mehrere Dimensionen NICHT in einer Tabelle vermischen. Jede Dimension hat ihre eigene Query in Power Query, ihre eigene Tabelle im Modell.

##### Distinct sicherstellen

Eine Dimensions-Zeile pro Wert. Vor dem Laden mit `Table.Distinct` oder `Table.RemoveDuplicates` sicherstellen, dass kein Schlüssel doppelt vorkommt.

##### Beziehung im Modell View

Nach dem Laden: Modell View → Dimensions-Schlüssel auf Faktentabellen-Schlüssel ziehen. Power BI erkennt 1:n automatisch.

##### Star-Schema-Regel

Microsoft Learn: *"The 'one' side is always a dimension table while the 'many' side is always a fact table."*

Mit anderen Worten: **Dimensionen sind auf der 1-Seite, Faktentabelle auf der n-Seite**. Wenn die Beziehung anders gepolt ist, ist eine der Tabellen falsch klassifiziert.

> **Anfänger-Falle:** Dimensions-Attribute (z. B. Stadt, Land) in der Faktentabelle lassen. Bequem ("ist ja schon da"), aber unsauber — Speicherverschwendung, schwerer wartbar, blockiert sauberes Star-Schema.

#### Beziehungen 1:n

*POWER QUERY · MODELL*

Die Beziehung zwischen Faktentabelle und Dimensionen ist immer 1:n — eine Zeile in der Dimension, viele in der Faktentabelle. Diese Beziehungen sind das Rückgrat des Stern-Schemas.

##### Was passiert bei einer Beziehung?

Filter propagieren über Beziehungen. Wenn du die Region "Süd" in der Region-Dimension filterst, propagiert dieser Filter über die 1:n-Beziehung in die Faktentabelle — und alle DAX-Measures berücksichtigen nur Süd-Daten.

##### Beziehung erstellen

Modell View → Spalte von Dimension auf entsprechende Spalte in Faktentabelle ziehen. Power BI erstellt automatisch die Beziehung mit korrekter Kardinalität.

##### Beziehung prüfen

Doppelklick auf die Beziehung. Wichtige Eigenschaften:

- **Cardinality**: 1:n (Dimension : Fakt) — Default
- **Cross filter direction**: Single (von 1 nach n) — Default und sicher
- **Make this relationship active**: aktiv (durchgezogen) oder inaktiv (gestrichelt)

##### Aktive vs. inaktive Beziehung

Pro Tabellen-Paar kann nur **eine** Beziehung aktiv sein. Bei mehreren Datums-Spalten in der Faktentabelle (Bestelldatum + Lieferdatum) eine Beziehung aktiv, andere inaktiv. In DAX mit `USERELATIONSHIP` aktivieren bei Bedarf.

##### Filterrichtungen

| Richtung | Verwendung |
| --- | --- |
| **Single (1 → n)** | Default. Filter fließt von Dimension zur Faktentabelle. Sicher. |
| **Both (1 ↔ n)** | Filter fließt in beide Richtungen. Mächtig, aber gefährlich — kann zu Mehrdeutigkeiten und Performance-Problemen führen. |

> **Praxis-Beispiel mit zwei Datums-Beziehungen:** Faktentabelle hat `BestellDatum` und `LieferDatum`, beide zeigen auf dieselbe Datums-Dimension. Du machst Bestelldatum aktiv, Lieferdatum inaktiv. Default-Measures verwenden Bestelldatum. Für eine Lieferzeit-Measure aktivierst du temporär die andere Beziehung:
>
> ```dax
> Umsatz nach Lieferdatum =
> CALCULATE([Umsatz],
>   USERELATIONSHIP(
>     fact_verkauf[LieferDatum],
>     dim_datum[Datum]))
> ```

> **Anfänger-Falle:** **Bidirektional aus Versehen**. Power BI Desktop hatte früher "Auto detect relationships during load" aktiviert, was teils bidirektionale Beziehungen erzeugte. Heute meistens single-direction. Trotzdem: nach dem Laden alle Beziehungen im Modell View prüfen.

#### Modell schlank halten

*POWER QUERY · MODELL*

Power Query Editor zeigt oft 20+ Queries — Quellen, Staging, Zwischenschritte, Dimensionen. Nur die Modell-Tabellen sollen am Ende geladen werden.

##### Was bedeutet "Laden aktivieren / deaktivieren"?

Jede Query in Power Query hat eine Eigenschaft "Enable load":

- **Enabled (Default)** — Query wird als Tabelle ins Modell geladen
- **Disabled** — Query existiert nur als Helfer, wird nicht ins Modell geladen

##### Welche Queries sollten NICHT geladen werden?

- `src_*` — Quell-Queries (Anschluss an Quelle)
- `stg_*` — Staging-Queries (Bereinigung)
- Helper-Queries (Mapping-Tabellen, die per Merge konsumiert werden)
- Parameter-Queries

##### Welche Queries SOLLEN geladen werden?

- `dim_*` — Dimensions-Tabellen
- `fact_*` — Faktentabellen

##### Laden deaktivieren

Im Power Query Editor: Rechtsklick auf Query → "Enable Load" abwählen. Die Query erscheint im Editor kursiv und wird beim Close & Apply nicht als Modell-Tabelle erzeugt.

##### Queries in Ordner gruppieren

Rechtsklick im Query-Pane → "New Group". Empfohlene Ordner: **1. Quellen**, **2. Staging**, **3. Modell**, **4. Helfer**. Bei größeren Modellen unverzichtbar.

##### Naming Convention konsequent

`src_` für Quellen, `stg_` für Staging, `dim_` für Dimensionen, `fact_` für Fakten. Wer das durchhält, hat in 6 Monaten noch Übersicht.

> **Praxis-Beispiel · saubere Struktur:**
>
> - 📁 **1. Quellen** (Laden deaktiviert)
>   - src_csv_verkauf
>   - src_sql_kunde
>   - src_excel_produkte
> - 📁 **2. Staging** (Laden deaktiviert)
>   - stg_verkauf
>   - stg_kunde
> - 📁 **3. Modell** (Laden aktiviert)
>   - fact_verkauf
>   - dim_kunde
>   - dim_produkt
>   - dim_datum
>
> Im Power BI Modell erscheinen nur die 4 Modell-Tabellen.

> **Tipp:** Nach dem Close & Apply im Modell View prüfen: sind nur die Modell-Tabellen sichtbar? Wenn Staging-Tabellen auftauchen, hast du irgendwo "Enable Load" vergessen.

## 03 · Deep Dive: *Query Folding*

Das Thema, das den Unterschied macht zwischen einem Refresh in 30 Sekunden und einem in sechs Minuten. Microsoft Learn dokumentiert: Vollständig gefoldete Queries sind ca. 12-mal schneller als nicht-gefoldete (Benchmark auf Azure Synapse).

> Als erstes: **"Was ist Query Folding?"** öffnen — das Konzept. Dann **"Step Folding Indicators"** — das ist die schnellste Diagnose, die du sofort in deinem nächsten Power Query anwenden kannst.

**~12×** — Performance-Faktor

**361 Sekunden** ohne Folding versus **31 Sekunden** mit vollständigem Folding — gemessen von Microsoft auf Azure Synapse (DW2000c) mit identischer Datenmenge. Faktor ~12 schneller. Der einzige Unterschied: ob die Engine die Transformation an die Datenquelle delegieren konnte oder selbst durchführen musste.

**Was passiert beim Folding?** Power Query übersetzt deine Schritte in eine native Quell-Query — bei SQL Server in ein einziges `SELECT`-Statement. Filter, Joins und Gruppierungen werden auf der Datenbank ausgeführt, nicht in der Mashup-Engine.

**Was bricht Folding?** Schritte ohne SQL-Äquivalent. Sobald einer drin ist, foldet alles dahinter nicht mehr. Die Reihenfolge entscheidet.

### Was ist Query Folding?

*QUERY FOLDING · GRUNDLAGE*

Query Folding ist die Fähigkeit der Power-Query-Engine, mehrere M-Schritte in eine einzige native Quell-Query zu übersetzen — bei SQL Server in ein einziges `SELECT`-Statement.

#### Wie funktioniert das?

Du klickst in Power Query: "Filter Region = Süd" → "Spalten Menge und Datum behalten" → "Sortieren nach Datum". Power Query erzeugt M-Code. Wenn die Quelle eine Datenbank ist, übersetzt Power Query diese drei Schritte intern in:

```sql
SELECT Menge, Datum
FROM Verkauf
WHERE Region = 'Süd'
ORDER BY Datum
```

Die Datenbank führt die Operation aus, nur das gefilterte Ergebnis kommt zurück.

#### Warum ist das wichtig?

Datenbanken sind für Filter, Joins und Aggregationen **massiv optimiert** — sie haben Indizes, Statistiken, parallele Verarbeitung. Power Query muss das alles in der Mashup-Engine emulieren, einzeln pro Zeile. Bei großen Datenmengen ist die Datenbank typischerweise um Größenordnungen schneller.

#### Microsoft-Benchmark

| Szenario | Dauer |
| --- | --- |
| Kein Folding (alles in der Mashup-Engine) | 361 Sekunden |
| Teilweises Folding | 184 Sekunden |
| Vollständiges Folding | 31 Sekunden |

Identische Datenmenge, identische Endergebnisse — nur die Folding-Stufe ist verschieden. **Faktor ~12** zwischen kein und vollständigem Folding (genau: 361/31 ≈ 11,6).

![Chart Refresh-Zeit nach Folding-Grad: kein Folding 361s, partielles Folding 184s, volles Folding 31s](https://learn.microsoft.com/power-query/media/query-folding-basics/outcome-timing.png)

**Abb. · Microsoft Learn Benchmark** Refresh-Zeit nach Folding-Grad (Azure Synapse DW2000c). Quelle: [Query folding examples · Microsoft Learn](https://learn.microsoft.com/power-query/query-folding-examples)

#### Wo foldet was?

- **Datenbank-Quellen** (SQL Server, Oracle, Snowflake, ...) — foldet
- **OData / SharePoint Lists** — foldet eingeschränkt
- **Datei-Quellen** (CSV, Excel, JSON) — foldet NICHT (es gibt keine Engine, an die delegiert werden könnte)
- **Web-API ohne OData** — foldet meist nicht

> **Anfänger-Falle:** Folding bei CSV-Quellen suchen. Geht nicht — eine CSV-Datei hat keine Query-Engine, die Filter ausführen könnte. Bei Datei-Quellen hilft nur: früh filtern, schmale Spaltenauswahl, kleinere Dateien.

### Foldable vs. nicht-foldable

*QUERY FOLDING · OPERATIONEN*

Nicht jede Power-Query-Operation foldet. Und sobald eine nicht-foldende Operation in der Pipeline ist, foldet auch **nichts dahinter** mehr.

#### Operationen, die foldet (bei DB-Quellen)

- **Filter** — `Table.SelectRows` mit einfachen Bedingungen
- **Spaltenauswahl** — `Table.SelectColumns`, `Table.RemoveColumns`
- **Umbenennen** — `Table.RenameColumns`
- **Datentyp ändern** — `Table.TransformColumnTypes` (für die meisten Typen)
- **Sortieren** — `Table.Sort`
- **Distinct** — `Table.Distinct`
- **Top N** — `Table.FirstN`
- **Aggregationen** — `Table.Group` mit Standard-Funktionen (Sum, Count, Avg)
- **Joins** — `Table.NestedJoin` wenn beide Tabellen aus derselben Quelle
- **Spalten teilen** — `Table.SplitColumn` (oft)
- **Replace** — `Table.ReplaceValue` (einfache Fälle)

#### Operationen, die NICHT foldet

- **Index-Spalte hinzufügen** — `Table.AddIndexColumn`
- **Komplexe berechnete Spalten** — Custom Columns mit komplexen Funktionen
- **Pivot/Unpivot** — meist nicht
- **Joins über verschiedene Quellen** — z. B. SQL + Excel
- **Custom Functions** — eigene M-Funktionen
- **Listenoperationen** — die mit `List.*` aus Power Query

> **Reihenfolge entscheidet:** Beide Pipelines machen dasselbe:
>
> **A:** Source → Filter Datum → Index hinzufügen → 1 Mio Zeilen werden geliefert, dann Index
>
> **B:** Source → Index hinzufügen → Filter Datum → 50 Mio Zeilen werden geliefert, dann lokal gefiltert
>
> Variante A ist 30× schneller. Reihenfolge der Schritte ist Performance-relevant.

> **Faustregel · Reihenfolge:** Erst alles, was foldet (Filter, Spaltenauswahl, Joins). Erst danach Operationen, die Folding brechen (Index, komplexe Custom Columns, Pivot). So bleibt möglichst viel auf der DB-Seite.

> **Anfänger-Falle:** Custom Column ganz vorn in der Pipeline einbauen ("ich brauche die ja sowieso später"). Damit ist alles dahinter nicht-foldend. Wenn die Custom Column komplex ist, am Ende der Pipeline platzieren.

### Step Folding Indicators

*QUERY FOLDING · DIAGNOSE*

Seit 2023 zeigt Power Query direkt im Editor an, ob jeder Schritt foldet. Die schnellste Diagnose-Methode überhaupt.

#### Wo finden?

Im Power Query Editor: Klick auf eine Query → "Applied Steps"-Pane rechts. Neben jedem Schritt erscheint ein kleines Icon:

- **Grüner Kreis** — Schritt foldet vollständig
- **Gelbes Dreieck** — Folding ist eingeschränkt / Teil-Folding
- **Roter Kreis** — Schritt foldet nicht (oder nichts dahinter foldet mehr)
- **Kein Icon** — Quelle unterstützt kein Folding (z. B. CSV)

#### Indicators aktivieren

File → Options and Settings → Options → Diagnostics → "Query Folding (preview)" anhaken. Möglicherweise schon Standard, je nach Version.

#### Pipeline durchgehen

Eine Query auswählen. Schritt für Schritt durchgehen: solange grün, alles gut. Beim ersten roten Icon: hier bricht Folding. Schritt umsortieren oder umformulieren.

![Power Query Applied Steps mit grünen Folding-Indikatoren für alle Schritte](https://learn.microsoft.com/power-query/media/step-folding-indicators/example-step-diagnostics-2.png)

**Abb. · Alle Schritte folden (grün)** Optimaler Fall — die grüne Linie zeigt: alle Operationen werden an die Datenbank delegiert. Quelle: [Query folding indicators · Microsoft Learn](https://learn.microsoft.com/power-query/step-folding-indicators)

![Power Query Applied Steps - ein Schritt bricht Folding, danach kein Folding mehr](https://learn.microsoft.com/power-query/media/step-folding-indicators/example-step-diagnostics-3.png)

**Abb. · Folding bricht (rot/grau)** "Capitalize each word" foldet nicht — ab hier bricht die grüne Linie ab, alle nachfolgenden Schritte werden lokal in der Mashup-Engine ausgeführt. Quelle: [Microsoft Learn](https://learn.microsoft.com/power-query/step-folding-indicators)

#### Hover für Details

Mit der Maus über das Icon hovern. Power Query erklärt, warum gerade nicht gefoldet wird ("Step contains a function that doesn't fold").

> **Praxis-Beispiel · Pipeline-Reparatur:** Du hast eine Pipeline mit 7 Schritten. Bei Schritt 4 ändert sich das Icon von grün auf rot.
>
> Klick auf Schritt 4: "Added Custom Column 'Status'" — komplexe if/else-Logik bricht Folding. Du verschiebst diesen Schritt ans Ende der Pipeline (per Drag & Drop). Jetzt: Schritte 1-6 grün, Schritt 7 (Custom Column) rot. Aber: 50 Mio statt 100 Mio Zeilen werden aus der DB geholt, weil der Filter (Schritt 5) wieder foldet. Refresh-Zeit halbiert.

> **Tipp:** Bei jeder neuen Query nach dem Bauen einmal durchscrollen und prüfen, wo die Indicators rot werden. Optimierungs-Potential ist meistens da, wo der erste Bruch passiert.

**Microsoft Learn:** Step Folding Indicators sind seit Power BI Desktop Mai 2023 standardmäßig verfügbar und einer der wichtigsten Diagnose-Hebel.

### View Native Query

*QUERY FOLDING · DIAGNOSE*

Das tatsächlich an die Quelle gesendete SQL ansehen. Wenn die Option verfügbar ist, foldet der Schritt. Wenn ausgegraut: foldet nicht.

#### So funktioniert es

In Applied Steps: Rechtsklick auf einen Schritt → "View Native Query". Es öffnet sich ein Fenster mit dem generierten SQL.

#### Was zeigt das SQL?

- **Bestätigung** — Folding funktioniert tatsächlich
- **Diagnostics** — du siehst, was die DB ausführen muss (für DBA-Optimierung)
- **Verifikation** — Ist der Filter korrekt übersetzt? Sind die Spalten richtig?

![Power Query Applied Steps mit View Native Query Option und Folding-Indikator](https://learn.microsoft.com/power-query/media/native-query-folding/filter-step-folded.png)

**Abb. · Rechtsklick auf Schritt → View Native Query** Wenn die Option verfügbar ist (nicht ausgegraut), foldet der Schritt. Quelle: [Query folding on native queries · Microsoft Learn](https://learn.microsoft.com/power-query/native-query-folding)

#### Schritt für Schritt prüfen

Bei großer Pipeline: am letzten Schritt View Native Query aufrufen. Wenn verfügbar → alles davor foldet. Wenn ausgegraut → den Punkt finden, wo Folding bricht (schrittweise zurückgehen).

#### SQL kopieren für Diagnose

Im View-Native-Query-Dialog: SQL kopieren, in SQL Server Management Studio oder DBeaver ausführen. Performance dort messen. Wenn auch dort langsam: Datenbank-Indizes prüfen.

#### DBA einbinden

Wenn Refresh wegen Folding-SQL langsam ist: Native Query an den DBA. Oft helfen Indizes auf den Filter-Spalten oder bessere Statistiken.

> **Praxis-Beispiel:** M-Code:
>
> ```
> Source → Filter Datum >= "2024-01-01"
>        → Filter Region = "Süd"
>        → Select Columns Datum, Menge, Region
> ```
>
> Native Query liefert:
>
> ```sql
> SELECT Datum, Menge, Region
> FROM Verkauf
> WHERE Datum >= '2024-01-01'
>   AND Region = 'Süd'
> ```
>
> Alle drei Schritte sind ein einziges SELECT geworden. Perfekt.

> **Anfänger-Falle:** Die ausgegraute "View Native Query"-Option ist kein Bug. Sie zeigt: dieser Schritt foldet nicht. Wenn du es übersehe, denkst du Folding läuft — aber es läuft nicht. Step Folding Indicators sind die zuverlässigere Anzeige.

> **DirectQuery-Spezial:** Bei DirectQuery muss jeder Schritt folden. View Native Query ist dort Pflicht-Test vor dem Publish. Ohne Folding scheitert die Abfrage zur Laufzeit mit Fehler.

### Query Plan

*QUERY FOLDING · TIEFENANALYSE*

Die mächtigste Folding-Diagnose. Power Query zeigt einen Plan-Baum mit drei Knotentypen — und ihrer Performance-Charakteristik.

#### Was ist der Query Plan?

Wie ein SQL-Execution-Plan, aber für Power Query. Zeigt, wie die Engine eine Query physisch ausführt: was wird an die Quelle delegiert, was im Speicher verarbeitet, was zeilenweise gestreamt.

#### Drei Knotentypen

| Knoten | Bedeutung | Performance |
| --- | --- | --- |
| **Remote** | An Datenquelle delegiert | Schnell — Idealfall |
| **Streaming** | Zeile für Zeile durch die Engine | OK — Pass-Through ohne Zwischenspeicher |
| **Full Scan** | Komplette Tabelle in den Speicher | Langsam — Speicher- und Zeit-Risiko |

#### Query Plan öffnen

In Applied Steps: Rechtsklick auf den Schritt → "View Query Plan". Öffnet eine Baum-Ansicht mit Knoten und Verbindungen.

#### Den Baum lesen

Von unten nach oben: unten ist die Quelle, oben das Ergebnis. Knoten erweitern für Details.

#### Bottlenecks identifizieren

Full Scan ist die Achtung-Markierung — besonders gefährlich, wenn er auf einer großen Tabelle steht. Knoten umsortieren oder Schritt umformulieren.

#### Wann brauche ich den Query Plan?

Wenn Step Folding Indicators ein grünes Bild zeigen, aber der Refresh trotzdem langsam ist. Der Plan deckt Probleme auf, die der Indicator nicht zeigt — z. B. ineffiziente Joins oder Aggregationen.

> **Praxis-Beispiel:** Refresh dauert 8 Minuten, alle Schritte zeigen grün. Query Plan öffnen: ein `Table.NestedJoin` zwischen zwei großen Tabellen wird als "Full Scan + Hash Join" ausgeführt — beide Tabellen werden komplett in den Speicher geladen. Lösung: Filter auf beiden Seiten **vor** dem Join, sodass die DB nur die nötigen Zeilen liefert.

**Microsoft hat den Query Plan 2022 eingeführt** als ergänzendes Diagnose-Werkzeug zu den Step Folding Indicators.

### Folding wiederherstellen — 6 Strategien

*QUERY FOLDING · PRAXIS*

Wenn ein Schritt das Folding bricht, gibt es sechs konkrete Strategien, das zu beheben.

#### Strategie 1: Schritt umsortieren

Foldende Schritte vor nicht-foldende. Index-Spalte, Custom Column, Pivot ans Ende. Filter, Spaltenauswahl, Joins an den Anfang.

#### Strategie 2: UI-Code überschreiben

Power Query erzeugt manchmal komplizierten Code, der nicht foldet. Manuell vereinfachen in der Formula Bar. Oft löst das schon das Problem.

> **Beispiel:** UI generiert: `Table.AddColumn(t, "Jahr", each Date.Year([Datum]))` — foldet bei einigen Quellen nicht. Manuell: `Table.AddColumn(t, "Jahr", each Date.Year([Datum]), Int64.Type)` mit explizitem Datentyp — foldet.

#### Strategie 3: Filter umformulieren

`Table.LastN` foldet nicht (kein "BOTTOM" in SQL), aber:

```powerquery
Source
|> Table.Sort({{"Datum", Order.Descending}})
|> Table.FirstN(100)
```

...foldet, weil `ORDER BY ... DESC` + `TOP 100` SQL-fähig sind.

#### Strategie 4: Native Query als Ausweg

Wenn nichts hilft: eine handgeschriebene SQL als Source. Foldet zwar nicht (Power Query kann das SQL nicht weiter optimieren), aber: wenn die SQL hochoptimiert ist und alle Filter enthält, kann das besser sein als M-Code.

```powerquery
Source = Sql.Database("server", "db",
  [Query="SELECT a, b, c FROM t WHERE region = 'Süd'"])
```

#### Strategie 5: Cross-Source-Joins vermeiden

Join zwischen SQL-Tabelle und Excel-Datei foldet niemals. Lösung: die Excel-Daten ins SQL importieren (oder als CSV in einen DB-fähigen Storage), dann beide aus derselben Quelle laden.

#### Strategie 6: Privacy Levels prüfen

Wenn zwei Quellen verschiedene Privacy Levels haben, verhindert Power Query Folding zwischen ihnen aus Sicherheitsgründen. File → Options → Privacy → Privacy levels einheitlich setzen (z. B. alle auf "Organizational").

> **Anfänger-Falle:** Sich auf Native Query verlassen ("die SQL macht alles"). Native Query foldet selbst nicht — alle nachfolgenden Power-Query-Schritte sind dann nicht-foldend. Native Query nur, wenn die ganze Pipeline darin enthalten ist.

> **Tipp · Strategie zuerst:** Bevor du in Spitzfindigkeiten gehst: **Filter früh setzen**. Der größte Hebel bei großen Faktentabellen ist, die Datenmenge zu reduzieren, die überhaupt aus der DB kommt. Ein Filter "letzte 12 Monate" macht oft mehr aus als jede andere Optimierung.

## 04 · Datenmodell & *Stern-Schema*

Microsoft Learn ist eindeutig: Power BI ist auf Stern-Schemata optimiert. Ein gut entworfenes Modell macht DAX einfacher, Berichte schneller und verhindert die häufigste Fehlerquelle — falsche oder mehrdeutige Beziehungen.

> Als erstes: **Klick auf die "Faktentabelle"** in der Mitte — das Konzept der Fakt vs. Dimension ist die Basis. Dann **"Granularität"** rechts oben — das ist die Regel, die am häufigsten verletzt wird.

### Datums-Dimension (Kalender)

*STAR SCHEMA · DIMENSION*

DateKey (PK) · Datum · Wochentag · Monat · Quartal · Jahr · Feiertag

Die wichtigste Dimension überhaupt. Microsoft nennt sie "die konsistenteste Tabelle, die du in einem Stern-Schema findest".

#### Pflicht-Spalten

- **DateKey** (PK) — eindeutiger Datums-Primärschlüssel, `type date`
- **Jahr** — Integer, für Hierarchie und Filter
- **Quartal** — als "Q1, Q2, Q3, Q4" mit Sortier-Spalte
- **Monat** — Integer (1-12)
- **Monatsname** — "Januar", "Februar", ... mit Sortier-Spalte (sonst alphabetische Reihenfolge!)
- **Wochentag** — als Zahl (Mo=1, So=7) und als Name
- **Kalenderwoche** — ISO-Standard (KW 1 ist die Woche mit dem ersten Donnerstag)

#### Optional aber empfohlen

- **Geschäftsjahr** — bei abweichendem Geschäftsjahr
- **Feiertag-Flag** — Boolean
- **Arbeitstag-Flag** — Boolean, ohne Wochenenden & Feiertage
- **Tag im Jahr** (1-366) — für Jahresvergleiche
- **Relative-Date-Spalten** — "ist letzter Monat?", "ist YTD?"

#### Tabelle generieren

Nicht aus Quelldaten ableiten — immer im Power-Query-Code generieren (siehe *"In M generiert"* in Sektion 2).

#### Sortier-Spalte für Monatsname

Nach dem Laden: Im Data View "Monatsname" anklicken → Column Tools → "Sort by column" → "Monat" (die numerische Spalte) auswählen. Sonst sortieren Visuals alphabetisch.

#### Als Datums-Tabelle markieren

Modeling-Tab → "Mark as date table" → DateKey-Spalte auswählen. **Pflicht**, damit Time-Intelligence-Funktionen sauber arbeiten.

#### Hierarchie erstellen

Im Modell View: Rechtsklick auf Datums-Tabelle → "Create hierarchy" → Jahr, Quartal, Monat, Tag zusammenführen. Visuals können dann per Drilldown navigieren.

> **Beispiel · Wartbarkeit:** Wenn das Unternehmen das Geschäftsjahr von Januar–Dezember auf Juli–Juni ändert, ist das eine Power-Query-Änderung in der Datums-Dimension. Alle Time-Intelligence-Measures, die FY-Spalten nutzen, passen sich automatisch an. Ohne zentrale Datums-Dimension müsstest du das in jeder Measure einzeln pflegen.

> **Anfänger-Falle:** Datums-Tabelle nicht als solche markieren. Folge: Beziehungen funktionieren, aber Time-Intelligence-Funktionen wie `SAMEPERIODLASTYEAR` liefern komische oder leere Ergebnisse. Immer markieren.

### Zeit-Dimension (Uhrzeit)

*STAR SCHEMA · DIMENSION*

TimeKey (PK) · Stunde · Minute · Sekunde · Zeitintervall

Separate Dimension für Uhrzeiten. Nötig, wenn deine Faktentabelle Sekunden- oder Minuten-Granularität hat — z. B. Logistik, Call Center, IoT-Daten.

#### Warum Zeit separat von Datum?

Wenn du Datum und Uhrzeit in einer Spalte (datetime) zusammenführst, hat die Dimension 365 × 86 400 = 31,5 Mio Zeilen pro Jahr — ineffizient. Stattdessen:

- **Datum** — eine Zeile pro Tag (365/Jahr)
- **Zeit** — eine Zeile pro Sekunde des Tages (86 400) oder pro Minute (1 440)

Faktentabelle hat zwei Fremdschlüssel: DateKey und TimeKey. Massiv kleiner.

#### Pflicht-Spalten der Zeit-Dimension

- **TimeKey** (PK) — Sekunden- oder Minuten-Index, Integer
- **Stunde** (0-23)
- **Minute** (0-59)
- **Sekunde** (0-59) — nur wenn Sekunden-Granularität
- **Zeitintervall** — z. B. "Morgen", "Mittag", "Nachmittag", "Abend", "Nacht"

> **Praxis-Beispiel · Call Center:** Faktentabelle `fact_calls`: 20 Mio Anrufe pro Jahr, jeder mit Zeitstempel. Auswertung: "Wann sind die meisten Anrufe?".
>
> Statt mit datetime-Spalte zu filtern (langsam): TimeKey = Stunde × 60 + Minute. Zeit-Dimension hat 1 440 Zeilen, jeder Anruf hat einen DateKey + TimeKey. Bericht "Anrufe nach Stunde" filtert über Zeit-Dimension — Millisekunden statt Sekunden.

> **Anfänger-Falle:** Zeit-Dimension anlegen, obwohl die Faktentabelle nur Tages-Granularität hat. Unnötiger Aufwand. Zeit-Dimension nur, wenn du tatsächlich Zeiträume kleiner als ein Tag analysieren willst.

> **Tipp:** Sekunden-Granularität (86 400 Zeilen) ist fast immer Overkill. Minuten-Granularität (1 440 Zeilen) reicht für Business-Analysen. 15-Minuten-Intervalle (96 Zeilen) sind oft sogar sinnvoller, weil Berichte selten sekundengenau analysieren.

### Dimension A · z. B. Produkt

*STAR SCHEMA · DIMENSION*

DimAKey (PK) · Attribut A1 · Attribut A2 · Attribut A3 · Attribut A4

Dimensionen sind die "Was-/Wer-/Wo-"Tabellen. Sie enthalten beschreibende Attribute, nach denen du in Berichten filtern und gruppieren kannst.

#### Anatomie einer Dimension

- **Surrogate Key** (PK) — künstlich generierter Integer-Schlüssel
- **Business Key** — die externe ID aus dem Quellsystem (z. B. ProduktID)
- **Beschreibende Attribute** — Name, Beschreibung, Eigenschaften
- **Hierarchie-Ebenen** — Kategorie > Unterkategorie > Produkt
- **Optional: SCD-Spalten** — bei Slowly Changing Dimensions (StartDate, EndDate, IsCurrent)

> **Beispiel · Produkt-Dimension:**
>
> `dim_produkt`
>
> - `ProduktKey` (PK, Surrogate)
> - `ProduktID` (Business Key)
> - `Produktname`
> - `Hersteller`
> - `Kategorie` (Hierarchie L1)
> - `Unterkategorie` (Hierarchie L2)
> - `Listenpreis`
> - `Einführungsdatum`
> - `IsActive` (Boolean)

#### Conformed Dimensions

Eine "konforme" Dimension wird von mehreren Faktentabellen geteilt — z. B. `dim_datum` verbindet `fact_verkauf` und `fact_lager`. Das macht Cross-Fact-Analysen möglich ("Wieviel verkaufen wir an einem Tag, an dem Lieferung X eintraf?").

> **Tipp:** Dimensionen können ruhig "breit" sein — viele Spalten mit beschreibenden Attributen. VertiPaq komprimiert sie sehr effektiv, weil die Werte sich oft wiederholen.

### Die Faktentabelle

*STAR SCHEMA · ZENTRUM*

DateKey (FK) · TimeKey (FK) · DimAKey (FK) · DimBKey (FK) · DimCKey (FK) · Kennzahl 1 · Kennzahl 2 · Kennzahl 3

Das Zentrum jedes Stern-Schemas. Enthält die Kennzahlen und die Fremdschlüssel zu allen Dimensionen.

![Power BI Desktop Model View mit Stern-Schema: Sales-Faktentabelle in der Mitte, Date/State/Region/Product Dimensionen außen, 1:n-Beziehungen](https://learn.microsoft.com/power-bi/transform-model/media/desktop-relationships-understand/model-diagram-star-schema.png)

**Abb. · Stern-Schema in Power BI Desktop (Model View)** Adventure-Works-Beispiel: `Sales`-Faktentabelle in der Mitte, vier Dimensionen außen, 1:n-Beziehungen (1-Seite an Dimension, n-Seite an Fakt). Quelle: [Model relationships · Microsoft Learn](https://learn.microsoft.com/power-bi/transform-model/desktop-relationships-understand)

#### Eigenschaften einer guten Faktentabelle

- **Eine klare Granularität** — eine Zeile bedeutet immer dasselbe
- **Schmal in der Spaltenbreite** — nur Schlüssel + Kennzahlen
- **Lang in der Zeilenzahl** — Millionen Zeilen sind normal
- **Numerische Spalten dominieren** — Texte gehören in Dimensionen

#### Spalten-Anatomie

| Typ | Beispiele |
| --- | --- |
| **Fremdschlüssel** | DateKey, KundenKey, ProduktKey |
| **Additive Kennzahlen** | Menge, Umsatz (lassen sich beliebig summieren) |
| **Semi-additive** | Lagerbestand (über Zeit nicht summierbar, über Produkte schon) |
| **Non-additive** | Preis pro Stück, Quoten (nicht direkt summierbar) |
| **Degenerate Dimensions** | Bestellnummer — Identifikator ohne eigene Dim-Tabelle |

> **Praxis-Beispiel:**
>
> `fact_verkauf` mit 50 Mio Zeilen:
>
> - Spalten: `DateKey, KundenKey, ProduktKey, VerkäuferKey, BestellNr, Menge, Einzelpreis, Rabatt`
> - Granularität: eine Zeile pro Bestellposition
> - Umsatz wird nicht gespeichert — als DAX-Measure berechnet (`Menge × Einzelpreis - Rabatt`)
>
> Wenn Umsatz als Spalte mitgespeichert wäre: Redundanz, mehr Speicher, Risiko von Inkonsistenz.

> **Tipp:** Auch wenn die Quelle eine breite Tabelle mit 80 Spalten ist: in der Faktentabelle nur das halten, was tatsächlich Kennzahl oder Schlüssel ist. Beschreibendes Attribut wie "Verkäufer-Telefonnummer" gehört in `dim_verkäufer`.

> **Anfänger-Falle:** Berechnete Kennzahlen wie "Marge", "ROI", "Quote" als Spalten speichern, statt als Measure zu berechnen. Konsequenz: bei jedem Filter müssen die Spalten konsistent sein — bei Aggregation kommt es zu Fehlern (z. B. Mittelwert von Mittelwerten).

### Dimension B · z. B. Kunde

*STAR SCHEMA · DIMENSION*

DimBKey (PK) · Attribut B1 · Attribut B2 · Attribut B3 · Attribut B4

Kunden-Dimension ist oft die größte Dimension nach Datum. Hier verstecken sich häufig Datenqualitäts-Probleme.

#### Typische Spalten einer Kunden-Dimension

- `KundenKey` (PK)
- `KundenID` (Business Key)
- `Kundenname`
- `Kundentyp` — z. B. "B2B", "B2C", "Reseller"
- Adresse: `Straße, PLZ, Ort, Land`
- `Region` — abgeleitet aus PLZ oder Land
- Beziehung: `VertriebsgebietKey` oder `VerkäuferKey`
- `RegistriertSeit`
- `KundenSegment` — "A-Kunde", "B-Kunde", "C-Kunde"

#### Slowly Changing Dimensions (SCD)

Was tun, wenn ein Kunde umzieht? Drei Standard-Ansätze:

| Typ | Verhalten | Use Case |
| --- | --- | --- |
| **SCD 1** | Aktueller Wert überschreibt alten | Default — meistens richtig |
| **SCD 2** | Neue Zeile mit StartDate, EndDate, IsCurrent | Wenn historische Auswertung wichtig |
| **SCD 3** | Spalte "Aktuell" + Spalte "Vorher" | Selten, nur wenn ein Vergleich relevant |

> **Praxis-Beispiel · SCD 2:** Kunde Müller GmbH zieht von Berlin nach München. SCD 2:
>
> Zeile 1: KundenKey=101, Stadt=Berlin, StartDate=2020-01-01, EndDate=2024-06-30, IsCurrent=false
>
> Zeile 2: KundenKey=102, Stadt=München, StartDate=2024-07-01, EndDate=9999-12-31, IsCurrent=true
>
> Die Faktentabelle verweist auf KundenKey. Verkäufe vor Juli 2024 zeigen Berlin, danach München. Historie ist erhalten.

> **Anfänger-Falle:** SCD 2 sofort einbauen, "weil das wichtig sein könnte". SCD 2 ist deutlich aufwendiger. Erst SCD 1 (Default), und nur wenn die Fachseite explizit fragt "Wie war das damals?" auf SCD 2 wechseln.

### Dimension C · z. B. Geografie

*STAR SCHEMA · DIMENSION*

DimCKey (PK) · Attribut C1 · C2 · C3 · C4

Eine Beispiel-Dimension für geografische Daten. Häufiges Stolperthema: Hierarchie Stadt > Region > Land vs. Snowflake-Trap.

#### Star-Variante (empfohlen)

Alles in einer Dimension:

```
dim_geo
- GeoKey (PK)
- StadtID
- Stadt
- Region
- Land
- Kontinent
- Hauptstadt-Flag
```

#### Snowflake-Variante (nicht empfohlen)

Mehrere Tabellen:

```
dim_stadt → dim_region → dim_land → dim_kontinent
```

Theoretisch normalisierter, praktisch:

- Mehr Joins zur Laufzeit — Performance-Nachteil
- Komplexere DAX
- Schlechter komprimiert im VertiPaq

**Microsoft-Empfehlung:** Star vor Snowflake. Eine Dimension auflösen statt in mehrere Tabellen aufspalten.

> **Praxis-Beispiel · Hierarchie:** Sortier-Drilldown in einem Visual: Land → Region → Stadt. Mit Star-Dimension ein einziges `dim_geo` mit allen drei Spalten. Power BI baut die Hierarchie automatisch, Drilldown funktioniert nativ.

> **Tipp:** Wenn die Quelle bereits Snowflake-strukturiert ist (z. B. relational normalisierte DB): in Power Query joinen, in einer einzigen Dimension landen. Quellseitige Normalisierung muss nicht ins Modell durchschlagen.

### Modell-Prinzipien

#### Eine Granularität pro Faktentabelle

*STAR SCHEMA · PRINZIP*

**Eine Granularität pro Faktentabelle.** Tageswerte und Monatssummen niemals mischen.

Microsoft Learn: *"Fact tables always load data at a consistent grain."* Diese Regel wird häufig verletzt und produziert dann stille Fehler.

##### Was ist Granularität?

Granularität definiert, was eine Zeile in der Faktentabelle bedeutet. Beispiele:

- **Granular: eine Zeile pro Verkaufsposition** — atomarste Form
- **Aggregiert: eine Zeile pro Bestellung** — Summe über mehrere Positionen
- **Aggregiert: eine Zeile pro Tag und Produkt** — vorberechnete Tagessummen

##### Warum nicht mischen?

Wenn deine Faktentabelle teils Tageswerte und teils Monatssummen enthält, addiert `SUM([Umsatz])` beides — die Monatssumme wird doppelt gezählt.

> **Praxis-Beispiel · Doppelzählung:** Tag 1: 100 €
>
> Tag 2: 200 €
>
> ...
>
> Tag 30: 150 €
>
> Monatssumme Januar: 4 500 € (vorberechnet, mit drin)
>
> `SUM([Umsatz]) → 9 000 €` — fast doppelt so hoch wie tatsächlich. Berichte sind kaputt, niemand merkt es.

##### Was tun, wenn beide Granularitäten gebraucht werden?

Zwei getrennte Faktentabellen, beide mit Beziehung zur Datums-Dimension:

- `fact_verkauf_tag` — Tages-Granularität
- `fact_verkauf_monat` — Monats-Granularität

In Berichten je nach Bedarf eine der beiden Measures nutzen. Aggregations (siehe Sektion 10) ist die Microsoft-Lösung dafür.

> **Anfänger-Falle:** "Nur ein paar zusätzliche Aggregat-Zeilen, ist ja praktisch." Praktisch heute, falsche Zahlen morgen. Granularität ist die wichtigste Modell-Entscheidung — sauber halten.

> **Tipp · Granularität dokumentieren:** In jeder Faktentabelle eine "Description" hinzufügen (im Model View): "Granularität: eine Zeile pro Verkaufsposition". Hilft dem nächsten Entwickler.

#### Surrogate Keys vor Business Keys

*STAR SCHEMA · PRINZIP*

**Surrogate Keys (Integer)** bevorzugen — kompakter und schneller als Text-Schlüssel.

Microsoft empfiehlt: in Dimensionen Integer-Surrogate-Keys, nicht Business-Keys. Klingt bürokratisch, hat aber konkrete Vorteile.

##### Surrogate vs. Business Key

| Surrogate Key | Business Key |
| --- | --- |
| Künstlich generiert (1, 2, 3, ...) | Kommt aus dem Quellsystem ("ABC-12345") |
| Integer | Oft Text |
| Klein | Variabel groß |
| Stabil | Kann sich ändern |

##### Vier Vorteile von Surrogate Keys

1. **Speicher** — 4 Bytes pro Integer vs. 30+ Bytes pro Text-Key. Bei 50 Mio Faktzeilen × 5 Fremdschlüsseln: massiv weniger Modellgröße.
2. **Performance** — Joins über Integer sind die schnellsten überhaupt. VertiPaq komprimiert Integer-Spalten am besten.
3. **Stabilität** — wenn das Quellsystem Schlüssel ändert (Migration, Konsolidierung), bleibt dein Modell-Schlüssel stabil.
4. **Inkrementelle Aktualisierung** — bei großen Modellen erforderlich, funktioniert besser mit Integer-Keys.

##### In Power Query Surrogate erzeugen

```powerquery
let
  Source = stg_kunde,
  WithKey = Table.AddIndexColumn(
    Source, "KundenKey",
    1, 1, Int64.Type
  )
in WithKey
```

##### Business Key behalten

KundenID (Business Key) bleibt als zusätzliche Spalte erhalten — für Anzeige und Cross-System-Verknüpfung. Aber: KundenKey ist der PK und FK.

##### Faktentabelle anpassen

In der Faktentabelle den Business Key durch den Surrogate Key ersetzen (per Merge mit der Dimension).

> **Anfänger-Falle:** Business Key als PK in der Dimension behalten. Funktioniert technisch, aber: bei Stammdaten-Migration kannst du im Quellsystem den Schlüssel verlieren. Surrogate macht dich unabhängig.

> **Tipp:** Bei einfachen Modellen mit kleinen Dimensionen ist der Surrogate-Aufwand kaum spürbar. Bei großen Faktentabellen (10 Mio+ Zeilen) ist er ein deutlicher Performance- und Speicher-Hebel.

#### Single-Direction Beziehungen

*STAR SCHEMA · PRINZIP*

**Single-Direction als Default.** Bidirektional nur bei nachweislichem Bedarf — Performance-Risiko.

Beziehungen in Power BI haben zwei Richtungs-Optionen: Single (Default) und Both. Microsoft empfiehlt explizit: Single als Default, Both nur bei Bedarf.

##### Single-Direction

Filter propagieren von der 1-Seite zur n-Seite — also von der Dimension zur Faktentabelle. Filter auf Dimension `dim_produkt[Kategorie] = "Elektronik"` filtert `fact_verkauf` auf alle Elektronik-Verkäufe.

##### Both (Bidirektional)

Filter fließen in beide Richtungen. Filter auf der Faktentabelle propagiert zurück zur Dimension. Klingt mächtig, hat aber Probleme:

- **Performance** — jeder Filter wird in beide Richtungen evaluiert
- **Mehrdeutigkeit** — bei mehreren Beziehungspfaden weiß die Engine nicht, welcher gilt
- **Sicherheit** — bei RLS kann ein bidirektionaler Filter ungewollte Daten freigeben

##### Wann ist Both legitim?

- **Bridge-Tabellen für M:N** — Many-to-Many über eine Brückentabelle
- **RLS-spezifische Szenarien** — bewusst und mit Tests
- **Spezial-Berichte** — wenn ein Filter explizit in beide Richtungen wirken soll und es keinen besseren Weg gibt

> **Beispiel · M:N mit Bridge:** Ein Bestellung kann mehrere Tags haben, ein Tag mehrere Bestellungen → M:N. Lösung:
>
> `fact_bestellung` ↔ `bridge_bestellung_tag` ↔ `dim_tag`
>
> Beide Beziehungen über Bridge sind bidirektional, sodass Filter auf Tag die Bestellungen filtert und umgekehrt.

> **Anfänger-Falle:** "Funktioniert nicht, mach ich mal bidirektional" als Default-Reaktion bei Filter-Problemen. Meistens ist nicht die Richtung das Problem, sondern das Modell oder die Measure. Bidirektional ist Symptom-Bekämpfung — Ursache suchen.

#### Star vor Snowflake

*STAR SCHEMA · ANTI-PATTERN*

**Star vor Snowflake.** Eine Dimensions-Hierarchie auflösen statt sie als Sub-Dimensionen zu modellieren.

Snowflake-Schema = Dimensionen werden weiter normalisiert in Sub-Dimensionen. Theoretisch sauberer, praktisch schlechter für Power BI.

##### Star-Schema

```
fact_verkauf ←→ dim_produkt
              (Kategorie, Unterkat, Hersteller in einer Tabelle)
```

##### Snowflake

```
fact_verkauf ←→ dim_produkt ←→ dim_kategorie ←→ dim_kategorie_gruppe
                                ←→ dim_hersteller ←→ dim_hersteller_land
```

##### Warum Star besser?

- **Performance** — weniger Joins = schnellere Queries
- **VertiPaq-Kompression** — denormalisierte Spalten komprimieren gut
- **DAX einfacher** — Filter müssen nur einen Hop machen
- **Berichts-UX** — alle Attribute in einer Dimension, leichter zu finden

##### Wann ist Snowflake unvermeidlich?

- Sehr breite Dimension (100+ Spalten), die nur teilweise gebraucht wird
- Hierarchie mit eigenen Kennzahlen pro Ebene (z. B. Region hat eigene Verkaufs-Quote)
- Aus Performance-Gründen bei massiv großen Dimensionen (selten)

> **Praxis-Beispiel · von Snowflake zu Star:** Quelle ist ein normalisiertes DWH:
>
> `produkt → kategorie → kat_gruppe → kat_oberkat`
>
> In Power Query joinen, alle relevanten Spalten in eine Dimension `dim_produkt`:
>
> ```
> dim_produkt
> - ProduktKey, Produktname
> - Kategorie, KategorieGruppe, Oberkategorie
> ```
>
> Im Modell nur ein Hop von Faktentabelle zu Dimension.

> **Tipp:** Beim ersten Modellieren immer Star anstreben. Wenn später aus konkretem Grund Snowflake nötig wird, ist Refactoring nicht schwer — umgekehrt ist Snowflake → Star aufwendig.

**Daten-WG dazu:**

- **[Mythos Data Vault und richtig große Modelle](https://youtu.be/rrCi0lnGrCg)** · Talk · 33 min · [Knowledge Kitchen](../index.html#ep-rrCi0lnGrCg)

### Aus dem Kanal · Modellierung praktisch durchgespielt

Warum Modellierung das ist, woran Self-Service später scheitert — und wie Stern-Schemata für Nicht-Modellierer plausibel werden.

- **[Denken in Tabellen — Stern-Schema-Grundlagen](https://youtu.be/hbUYMyqb6r8)** · Talk · 39 min · [Knowledge Kitchen](../index.html#ep-hbUYMyqb6r8)
- **[Datenmodellierung ist Governance](https://youtu.be/lH_-A8NAQ-k)** · Talk · 43 min · [Knowledge Kitchen](../index.html#ep-lH_-A8NAQ-k)

## 05 · DAX *· Formelsprache*

DAX ist das Herz der analytischen Auswertung in Power BI. Ohne DAX bleibt man bei einfachen Summen — mit DAX werden Time-Intelligence, dynamische Filter und komplexe Geschäftslogik möglich.

> Als erstes: **"Measures vs. Calculated Columns"** — das ist die Entscheidung, die du jedes Mal triffst, wenn du DAX schreibst. Dann **"Filter- und Row-Context"** — die zwei Begriffe, ohne die DAX ein Rate-Spiel bleibt.

### Measures vs. Calculated Columns

*DAX · GRUNDLAGE*

Die fundamentale Entscheidung in DAX. Faustregel: 99 % der Berechnungen gehören in Measures, nicht in Calculated Columns.

#### Calculated Column

- Berechnet beim Refresh, einmal pro Zeile
- Im Modell gespeichert (verbraucht Speicher)
- Hat einen **Row Context** — kennt die "aktuelle Zeile"
- Nutzbar als Filter, Slicer, Achsen-Kategorie

#### Measure

- Berechnet zur Laufzeit, im aktuellen Filter-Kontext
- Kein Speicherverbrauch
- Hat einen **Filter Context** — kennt die aktiven Filter
- Nutzbar in Visuals als Wert (Y-Achse, Tabellen-Spalte)

#### Wann was?

| Use Case | Calculated Column | Measure |
| --- | --- | --- |
| Umsatz aus Menge × Preis | OK in Power Query, nicht in DAX | ✓ als `SUMX` |
| Altersgruppe aus Geburtsdatum | ✓ — als Slicer nutzbar | — |
| Top-10-Kunden-Flag | — | ✓ — Kontext-abhängig |
| Marge (Gewinn / Umsatz) | — | ✓ — über DIVIDE |
| Region aus PLZ | OK, aber besser in Power Query | — |

> **Schlechte Calculated Column:**
>
> ```dax
> Umsatz = [Menge] * [Preis]
> ```
>
> Verbraucht Speicher pro Zeile (50 Mio × 8 Bytes = 400 MB im Modell). Gleiche Berechnung als Measure:
>
> ```dax
> Umsatz = SUMX(fact_verkauf, fact_verkauf[Menge] * fact_verkauf[Preis])
> ```
>
> Kein Speicherverbrauch, gleiches Ergebnis.

#### Implizite Measures vermeiden

Wenn du eine numerische Spalte in ein Visual ziehst, erzeugt Power BI eine implizite Measure (typischerweise SUM). Sieht praktisch aus, hat aber Probleme:

- Keine zentrale Definition
- Schwierig zu wiederverwenden
- Format und Logik kann nicht angepasst werden
- In Tabular Editor und externe Tools nicht sichtbar

**Stattdessen:** explizite Measures schreiben. `SumUmsatz = SUM(fact_verkauf[Menge])`.

> **Anfänger-Falle:** Calculated Columns für Aggregate verwenden ("ist ja einfacher"). Speicher wächst, Performance leidet. Aggregate gehören in Measures.

### CALCULATE — die wichtigste Funktion

*DAX · KERNFUNKTION*

CALCULATE ist die einzige DAX-Funktion, die den Filter-Kontext gezielt modifizieren kann. Wer CALCULATE versteht, beherrscht 80 % von DAX.

#### Was macht CALCULATE?

Wertet einen Ausdruck (typischerweise eine Measure) in einem modifizierten Filter-Kontext aus. Die Filter-Argumente können:

- Bestehende Filter **ersetzen** — `CALCULATE([Umsatz], Region[Name] = "Süd")`
- Bestehende Filter **entfernen** — `CALCULATE([Umsatz], ALL(Region))`
- Filter **ergänzen** — `CALCULATE([Umsatz], KEEPFILTERS(...))`

#### Häufige Patterns

```dax
// Filter setzen
Umsatz Süd = CALCULATE(
  [Umsatz],
  Region[Name] = "Süd"
)

// Alle Filter auf einer Tabelle entfernen
Umsatz Gesamt = CALCULATE(
  [Umsatz],
  ALL(Region)
)

// Time Intelligence
Umsatz YTD = CALCULATE(
  [Umsatz],
  DATESYTD('Datum'[Datum])
)

// Mehrere Filter kombinieren
Umsatz Süd Q3 = CALCULATE(
  [Umsatz],
  Region[Name] = "Süd",
  'Datum'[Quartal] = "Q3"
)
```

#### Context Transition

Wenn CALCULATE im Row Context aufgerufen wird (z. B. innerhalb von `SUMX`), wandelt es den Row Context in einen Filter Context um. Diese "Context Transition" ist eines der mächtigsten DAX-Konzepte — und Quelle vieler Bugs.

> **Beispiel · Context Transition:**
>
> ```dax
> SUMX(
>   fact_verkauf,
>   CALCULATE([Umsatz])
> )
> ```
>
> Pro Zeile in fact_verkauf wird CALCULATE aufgerufen, der Row Context wird zu Filter Context — die aktuelle Zeile filtert die ganze Faktentabelle auf "diese eine Zeile". `[Umsatz]` berechnet sich dann nur über die eine Zeile, das Ergebnis wird summiert. Mathematisch korrekt, aber langsam — und meistens nicht das, was man wollte.

> **Anfänger-Falle:** CALCULATE-Filter-Argumente mit FILTER umschließen, obwohl Boolean-Filter reicht. `CALCULATE([Umsatz], FILTER(VALUES(Region[Name]), Region[Name]="Süd"))` ist langsamer als `CALCULATE([Umsatz], Region[Name]="Süd")`. Boolean-Filter werden optimiert.

> **Tipp · Lesen lernen:** Bei jeder CALCULATE-Measure mental drei Fragen stellen: 1) Was ist der Ausdruck (Hauptargument)? 2) Welche Filter werden ergänzt/ersetzt? 3) Was bleibt vom umgebenden Kontext? Wenn du diese drei Fragen beantworten kannst, hast du die Measure verstanden.

### Filter Context vs. Row Context

*DAX · KONZEPT*

Die zwei Kontext-Arten in DAX. Wer den Unterschied nicht versteht, debuggt DAX durch Probieren.

#### Filter Context

Die Menge aller aktiven Filter zu einem Zeitpunkt. Filter Context entsteht durch:

- Visuals (Slicer, Filter-Pane, Achsen-Werte)
- Filter-Argumente in CALCULATE
- Beziehungen (Filter propagieren von 1 nach n)

**Measures werden immer im Filter Context ausgewertet.**

#### Row Context

"Die aktuelle Zeile". Entsteht in:

- Calculated Columns (implizit — Spalte iteriert durch alle Zeilen)
- Iteratoren wie `SUMX`, `FILTER`, `ADDCOLUMNS` (explizit — Funktion iteriert)

**Wichtig:** Row Context filtert **nicht** automatisch andere Tabellen. Dafür braucht es Context Transition (über CALCULATE).

#### Der entscheidende Unterschied

| Aspekt | Filter Context | Row Context |
| --- | --- | --- |
| Wer hat? | Measures | Calculated Columns, Iteratoren |
| Wirkt auf | Alle Tabellen über Beziehungen | Nur die aktuelle Tabelle |
| Sichtbar in Spalten | Aggregat | Einzelwert pro Zeile |

> **Beispiel · Unterschiedliche Ergebnisse:**
>
> ```dax
> // Calculated Column: Row Context
> fact_verkauf[ZeilenUmsatz] = [Menge] * [Preis]  → pro Zeile berechnet
>
> // Measure: Filter Context
> [Umsatz] = SUMX(fact_verkauf, [Menge] * [Preis])  → aggregiert für aktuellen Filter
> ```
>
> Die Calculated Column liefert pro Zeile einen Wert. Die Measure liefert eine Summe für den aktuellen Filter-Kontext.

#### Context Transition

Der Brücken-Mechanismus. Wenn du CALCULATE oder eine Measure (die intern CALCULATE nutzt) im Row Context aufrufst, wird der aktuelle Row Context in einen Filter Context umgewandelt.

> **Anfänger-Falle:** Calculated Column nutzen, um eine Aggregation zu speichern: `fact_verkauf[Tagessumme] = SUM(fact_verkauf[Umsatz])`. Da Calculated Column im Row Context ist, summiert SUM hier **alle Zeilen der Tabelle**, nicht nur die der aktuellen Zeile. Ergebnis: jede Zeile bekommt die Gesamtsumme. Falsch verstandener Kontext.

> **Tipp · SQLBI:** Marco Russo und Alberto Ferrari haben dazu das Buch "The Definitive Guide to DAX" geschrieben. Wer DAX ernsthaft betreibt: das Buch ist Pflicht. Kostenfreie Alternative: [dax.guide](https://dax.guide).

**Daten-WG dazu:**

- **[Expanded Tables in DAX verstehen](https://youtu.be/LQQEn7IOb7w)** · Tutorial · 12 min · [Knowledge Kitchen](../index.html#ep-LQQEn7IOb7w)

### Variables (VAR / RETURN)

*DAX · PERFORMANCE*

Microsoft Learn: Variablen halbieren oft die Ausführungszeit, machen DAX lesbar und vereinfachen Debugging. Sollten Standard sein.

#### Syntax

```dax
Marge =
VAR Umsatz = [Umsatz]
VAR Kosten = [Kosten]
VAR Gewinn = Umsatz - Kosten
RETURN
  DIVIDE(Gewinn, Umsatz)
```

#### Drei Vorteile

1. **Performance** — eine Variable wird einmal ausgewertet, dann gecacht. Ohne Variable würde z. B. `[Umsatz]` mehrfach evaluiert.
2. **Lesbarkeit** — selbsterklärende Namen statt verschachtelter Logik
3. **Debugging** — RETURN auskommentieren, einzelne Variable zurückgeben, schrittweise testen

> **Vorher · ohne Variablen:**
>
> ```dax
> YoY % =
> DIVIDE(
>   [Umsatz] - CALCULATE([Umsatz], SAMEPERIODLASTYEAR('Datum'[Datum])),
>   CALCULATE([Umsatz], SAMEPERIODLASTYEAR('Datum'[Datum]))
> )
> ```
>
> CALCULATE wird zweimal ausgeführt — Engine erkennt Identität nicht zuverlässig.
>
> **Nachher · mit Variablen**
>
> ```dax
> YoY % =
> VAR Vorjahr = CALCULATE([Umsatz], SAMEPERIODLASTYEAR('Datum'[Datum]))
> RETURN
>   DIVIDE([Umsatz] - Vorjahr, Vorjahr)
> ```
>
> Vorjahr wird einmal berechnet, zweimal verwendet. In Tests oft 30–50 % schneller.

#### Variablen sind Konstanten

Wichtige Eigenschaft: Variablen werden zum Zeitpunkt der Definition ausgewertet und bleiben dann konstant — sie ändern sich nicht durch nachfolgende CALCULATE-Aufrufe.

> **Beispiel:**
>
> ```dax
> VAR Aktuell = [Umsatz]
> RETURN CALCULATE(Aktuell, Region[Name] = "Süd")
> ```
>
> `Aktuell` wird im aktuellen Filter-Kontext berechnet — vor dem CALCULATE. Der CALCULATE-Filter ändert die Variable nicht. Ergebnis: der Umsatz des aktuellen Filters, nicht der Umsatz für Süd. Das ist meistens nicht, was man will — aber es ist konsistent und vorhersagbar.

> **Tipp · Naming Convention:** Variablen-Namen sprechend wählen. `VAR Umsatz_VJ` sagt mehr als `VAR x`. Wenn die Measure später jemand anders liest, ist die Variable selbsterklärend.

### Time Intelligence

*DAX · ZEITANALYSE*

Zeitreihen-Funktionen — YTD, MTD, Same-Period-Last-Year. DAX hat dafür eingebaute Funktionen, vorausgesetzt die Datums-Dimension ist sauber.

#### Voraussetzungen

1. Echte Datums-Dimension (siehe Sektion 2 und 4)
2. Beziehung von Datums-Dim zur Faktentabelle
3. Datums-Tabelle **markiert** (Mark as date table) mit DateKey-Spalte
4. Lückenlose Datumsfolge in der Dimension (jeden Tag eine Zeile, auch Wochenenden)

#### Die wichtigsten Funktionen

```dax
// Year-to-Date
Umsatz YTD = TOTALYTD([Umsatz], 'Datum'[Datum])

// Quarter-to-Date / Month-to-Date
Umsatz QTD = TOTALQTD([Umsatz], 'Datum'[Datum])
Umsatz MTD = TOTALMTD([Umsatz], 'Datum'[Datum])

// Vorjahr (Same Period Last Year)
Umsatz VJ = CALCULATE(
  [Umsatz],
  SAMEPERIODLASTYEAR('Datum'[Datum])
)

// Vergleich Vorjahr
Umsatz YoY = [Umsatz] - [Umsatz VJ]
Umsatz YoY % = DIVIDE([Umsatz YoY], [Umsatz VJ])

// Rolling 12 Months
Umsatz R12 = CALCULATE(
  [Umsatz],
  DATESINPERIOD('Datum'[Datum], MAX('Datum'[Datum]), -12, MONTH)
)
```

#### Geschäftsjahr abweichend von Kalenderjahr

Wenn das Geschäftsjahr im Juli beginnt, müssen die Standard-Funktionen angepasst werden:

```dax
// YTD mit Geschäftsjahr-Ende 30. Juni
Umsatz FY YTD = TOTALYTD(
  [Umsatz],
  'Datum'[Datum],
  "30/06"
)
```

Oder: eigene Geschäftsjahr-Spalte in der Datums-Dim und manuelle CALCULATE-Logik.

> **Praxis-Beispiel · Variance-Bericht:** Visual zeigt nebeneinander: `Umsatz Aktuell`, `Umsatz VJ`, `Umsatz YoY %`. Mit dynamischen Titeln ("YoY +12 % über Vorjahr"). Das ist der Kern jeder Management-Reports.

> **Anfänger-Falle 1:** Time Intelligence ohne markierte Datums-Tabelle nutzen. Funktioniert teilweise, aber unzuverlässig. Erst markieren, dann Time Intelligence.

> **Anfänger-Falle 2:** Time Intelligence mit Auto-Date/Time-Tabellen (die versteckten Power-BI-Hierarchien). Funktioniert sehr eingeschränkt. Auto-Date/Time deaktivieren, eigene Dimension verwenden.

**Daten-WG dazu:**

- **[Visual Calculations erklärt — Prozent vom übergeordneten Wert](https://youtu.be/GsLfiuPlsQE)** · Tutorial · 7 min · [Knowledge Kitchen](../index.html#ep-GsLfiuPlsQE)

### Anti-Patterns

*DAX · FALLSTRICKE*

Sechs typische Fehler, die jeder Einsteiger einmal macht. Wer sie kennt, spart sich Wochen Debugging.

#### 1. FILTER statt Boolean

```dax
// Schlecht — FILTER iteriert
CALCULATE(
  [Umsatz],
  FILTER(VALUES(Region[Name]), Region[Name] = "Süd")
)

// Gut — Boolean-Filter wird optimiert
CALCULATE([Umsatz], Region[Name] = "Süd")
```

Boolean-Filter werden von der Engine zu einer effizienten Set-Operation übersetzt. FILTER iteriert zeilenweise — langsamer.

#### 2. Slash statt DIVIDE

```dax
// Schlecht — wirft Fehler bei 0
Marge = [Gewinn] / [Umsatz]

// Gut — DIVIDE liefert BLANK bei 0
Marge = DIVIDE([Gewinn], [Umsatz])

// Mit Default
Marge = DIVIDE([Gewinn], [Umsatz], 0)
```

#### 3. IFERROR maskiert Probleme

```dax
// Schlecht — versteckt Bugs
IFERROR([Komplexe Logik], 0)

// Gut — Logik so schreiben, dass kein Fehler entsteht
VAR Wert = [Komplexe Logik]
RETURN IF(ISBLANK(Wert), 0, Wert)
```

#### 4. Implizite Measures durch Drag-and-Drop

Statt einer numerischen Spalte ins Visual zu ziehen (was eine implizite SUM-Measure erzeugt): eine explizite Measure schreiben. Bessere Wartbarkeit, klare Definition, in Tabular Editor sichtbar.

#### 5. Calculated Columns für Aggregate

```dax
// Schlecht — verbraucht Speicher pro Zeile
fact_verkauf[Umsatz] = [Menge] * [Preis]

// Gut — Measure, kein Speicher
Umsatz = SUMX(fact_verkauf, fact_verkauf[Menge] * fact_verkauf[Preis])
```

#### 6. SUMX über die ganze Tabelle

Bei großen Faktentabellen ist `SUMX` über alle Zeilen langsam. Wenn möglich: vorberechnete Spalte in Power Query, dann `SUM` statt `SUMX`.

> **Beispiel · SUM vs SUMX:**
>
> `SUMX(fact_verkauf, [Menge] * [Preis])` — 50 Mio Zeilen iterieren, multiplizieren, summieren.
>
> Wenn `Umsatz` in Power Query als Spalte berechnet: `SUM(fact_verkauf[Umsatz])` — VertiPaq-optimierte Summen-Operation, deutlich schneller.
>
> Trade-off: Speicher (Spalte vs. keine Spalte) vs. Performance (langsam vs. schnell). Bei großen Tabellen Performance gewinnt meistens.

> **Tipp · Best Practice Analyzer:** Tabular Editor 2 hat einen "Best Practice Analyzer" (BPA), der diese Anti-Patterns automatisch erkennt. Microsoft pflegt ein Standard-Regelset auf GitHub. Lohnt sich, vor jedem Production-Deploy zu laufen.

### Aus dem Kanal · DAX-Konzepte am Beispiel

Expanded Tables sind das Modell hinter Filter- und Row-Context. UDFs + TMDL zeigen, wohin DAX 2026 läuft.

- **[Expanded Tables in DAX verstehen — Beziehungen & Filter erklärt](https://youtu.be/LQQEn7IOb7w)** · Tutorial · 12 min · [Knowledge Kitchen](../index.html#ep-LQQEn7IOb7w)
- **[DAX User Defined Functions + TMDL](https://youtu.be/0FPA1k5YiTs)** · Deep Dive · 49 min · [Knowledge Kitchen](../index.html#ep-0FPA1k5YiTs)

## 06 · Deep Dive: *IBCS* & Visualisierung

International Business Communication Standards — ein Regelwerk von Rolf Hichert, das Business-Reporting weltweit vereinheitlicht. Seit 2024 als ISO/AWI 24896 in der Standardisierung. SAP, Philips und Siemens haben ihr Reporting daran ausgerichtet. Die sieben SUCCESS-Regeln sind das Rückgrat.

> Als erstes: **SAY und UNIFY** im SUCCESS-Wheel klicken — die beiden zentralen Regeln. Dann **"Solid / Outlined / Hatched"** — die visuelle Notation, die du sofort in jedem Bericht einsetzen kannst.

**7** — SUCCESS-Regeln

**Things that mean the same should look the same.** Das ist der zentrale IBCS-Tenet. Wenn Ist-Werte überall solide gefüllt, Plan-Werte überall hohl und Vorjahres-Werte überall schraffiert sind — dann liest sich jedes Diagramm in Sekundenbruchteilen.

**Power BI & IBCS:** Out-of-the-box ist Power BI nicht IBCS-konform. Aber mit der Inforiver- oder Zebra-BI-Erweiterung — beide kostenpflichtig, aber etabliert — und mit eigenen Themes lässt sich IBCS sauber umsetzen. Selbst ohne Extra-Tool gehen rund 70 % der SUCCESS-Regeln mit Bordmitteln.

**Status:** ISO/AWI 24896 — seit Juli 2024 als ISO-Projekt registriert.

### Die SUCCESS-Formel

#### SAY — Convey a message

*IBCS · SAY*

Jede Visualisierung hat einen Sinn — eine Aussage. Die Aussage gehört nicht versteckt in eine Beschriftung am Rand, sondern an den Anfang des Visuals.

##### Was bedeutet das konkret?

- **Klare Botschaft** statt beschreibender Titel
- **Quantifiziert** — Zahlen mit Kontext, nicht nur "viel/wenig"
- **Action-Orientiert** — was bedeutet das für den Empfänger

##### Beschreibender Titel vs. Botschaft

| Schlecht (beschreibend) | Gut (Botschaft) |
| --- | --- |
| "Umsatz Q3 2024" | "Umsatz Q3 plus 15 % über Plan dank Süd-Region" |
| "Verkaufszahlen nach Region" | "Drei Regionen unterhalb Plan, größte Lücke: West" |
| "Auftragseingang Dashboard" | "Auftragseingang erholt sich, +8 % gegenüber Vormonat" |

##### Dynamische Titel via DAX

Eine Measure schreibt den Titel:

```dax
VAR Diff = [Umsatz] - [Plan]
VAR Pct = DIVIDE(Diff, [Plan])
RETURN "Umsatz " & FORMAT([Umsatz], "#,0") &
  IF(Diff >= 0,
    " · +" & FORMAT(Pct, "0 %") & " über Plan",
    " · " & FORMAT(Pct, "0 %") & " unter Plan")
```

##### Titel an Visual binden

Im Visual-Format-Pane: "Title" → fx-Knopf rechts neben Title text → "Field value" → die Measure auswählen.

> **Praxis-Beispiel:** Statt eines starren Titels "Q3-Umsatz" zeigt der Titel: "Q3-Umsatz: 4,2 M€ · +12 % über Plan". Wenn der Anwender den Filter ändert (z. B. nur Region Süd), passt sich der Titel automatisch an: "Q3-Umsatz Süd: 1,1 M€ · +18 % über Plan". Dynamische Botschaft.

> **Tipp:** Bei Cockpits/Dashboards: ein "Lead-Visual" mit einer Hauptbotschaft am oberen Bildschirmrand. Wer das liest, weiß den Tenor der Seite — auch ohne den Rest zu studieren.

#### UNIFY — Apply semantic notation

*IBCS · UNIFY*

"Things that mean the same should look the same." Wenn Ist-Werte überall solide gefüllt, Plan-Werte überall hohl und Vorjahres-Werte überall schraffiert sind, liest sich jedes Diagramm in Sekundenbruchteilen.

##### Was ist semantische Notation?

Visuelle Eigenschaften (Form, Füllung, Farbe) werden für Bedeutung verwendet — nicht für Dekoration.

##### Die IBCS-Notation

| Bedeutung | Notation |
| --- | --- |
| Ist-Werte (ACT) | Solid · vollständig gefüllt |
| Plan / Budget (PL, BU) | Outlined · nur Kontur |
| Forecast / Vorjahr (FC, PY) | Hatched · schraffiert |
| Positiver Wert | schwarz / dunkel |
| Negativer Wert | rot |

> **Beispiel · Notation Manual:** SAP hat ein internes "Notation Manual" — ein Regelwerk, das die SUCCESS-Regeln für ihre Reports konkretisiert. Jeder Report-Entwickler bei SAP folgt diesen Regeln. Konsequenz: zwei Reports von verschiedenen Teams sehen **gleich aus**. Konsumenten müssen nicht jedes Mal neu lernen, wie ein Bericht zu lesen ist.

##### Power-BI-Umsetzung

- Custom Theme (JSON) mit definierten Farben für ACT/PL/FC
- Inforiver oder Zebra BI Custom Visual für Variance-Charts mit Solid/Outlined/Hatched
- Bei Bordmitteln: gleicher Farb-Code für gleiche Bedeutung konsequent durchziehen

> **Anfänger-Falle:** Pro Bericht eigene Farben wählen ("das sieht doch schöner aus"). Schöner für den Ersteller, schwerer für den Leser. Konsistenz schlägt Schönheit.

#### CONDENSE — Increase information density

*IBCS · CONDENSE*

Mehr Information pro Quadratzentimeter Bildschirm. Edward Tufte nennt das "data-ink ratio" — möglichst viel Tinte für Daten, möglichst wenig für Dekoration.

##### Wie erhöht man Datendichte?

- **Small Multiples** — Mini-Charts in einer Matrix, vergleichbare Werte nebeneinander
- **Sparklines** — Mini-Linien-Charts in Tabellen-Zellen
- **Tabellen statt Liste-Charts** — eine Tabelle zeigt 5× mehr Information als 5 Säulendiagramme
- **Variance-Charts** — Abweichung zeigt mehr als nur Wert
- **Mehrere Achsen-Werte** — Säulen mit Plan-Kontur darüber statt zwei getrennte Charts

> **Praxis-Beispiel · Small Multiples:** Statt 12 separate Säulendiagramme (eines pro Monat) eine Matrix mit 12 kleinen Charts, alle in derselben Skala. Mit einem Blick erkennbar: welche Monate weichen vom Muster ab. Power BI hat dafür ein eingebautes "Small multiples"-Feature seit 2021.

##### Sparklines in Tabellen

Preview seit Dezember 2021, GA seit Juni 2025. In einer Matrix-Tabelle eine Spalte zeigt einen Mini-Linien-Chart über die letzten 12 Monate. Mit der Zeile-für-Zeile-Übersicht der Tabelle plus dem visuellen Trend pro Zeile.

> **Tipp:** Berichte werden oft auf Papier ausgedruckt oder als PDF verteilt. Hohe Datendichte ist dort doppelt wichtig — Scrollen geht nicht, alles muss auf eine Seite. Plane das ein.

> **Anfänger-Falle:** Datendichte falsch verstehen als "viele Visuals" — und 20 Charts auf eine Seite quetschen, ohne dass sie miteinander reden. Datendichte bedeutet: **viel relevante Information pro Visual**, nicht viele Visuals.

#### CHECK — Ensure visual integrity

*IBCS · CHECK*

Was groß aussieht, muss auch numerisch groß sein. Verzerrte Achsen, abgeschnittene Skalen und 3D-Effekte erzeugen falsche Eindrücke.

##### Vier Integritätsregeln

1. **Y-Achse beginnt bei Null** bei Säulen- und Balken-Charts. Immer.
2. **Skalen konsistent** — wenn mehrere Charts vergleichbar sein sollen, gleiche Y-Achse
3. **Keine 3D-Effekte** — verzerren die Wahrnehmung
4. **Doppelachsen vermeiden** — sie suggerieren Korrelationen, die nicht real sind

##### Y-Achse bei Null

Klassischer Trick zur Verzerrung: ein Säulen-Chart mit Werten 95, 97, 99, 102. Wenn die Y-Achse bei 90 startet, sehen die Säulen extrem unterschiedlich aus. Bei Null-Achse: nur wenige Prozent Unterschied. Erste Variante manipuliert die Wahrnehmung.

> **Default-Falle in Power BI:** Power BI Desktop hat per Default Y-Achse "Auto" — beginnt häufig nicht bei Null. Im Visual-Format unter "Y-Axis" → "Range" → "Start" auf 0 setzen. Manuell, jedes Mal.

##### Linien-Charts sind anders

Bei Linien-Charts kann abgeschnittene Y-Achse legitim sein — wenn die Aussage über Veränderung geht, nicht über absolute Werte. Aber: dann **klar als Skalenbruch markieren**.

> **Anfänger-Falle:** Y-Achse anpassen, "damit der Unterschied sichtbar wird". Das ist Manipulation, auch wenn unbeabsichtigt. Wenn der Unterschied wichtig ist, separates Variance-Chart einbauen, das Differenz und Prozent zeigt — die Null-Achse bleibt.

> **Tipp:** Skalen-Bruch-Indikator: kleines Zickzack-Symbol an der Achse, wenn die Skala abgeschnitten ist. Macht Power BI nicht automatisch — manuell als Annotation hinzufügen, wenn unvermeidbar.

#### EXPRESS — Choose proper visualization

*IBCS · EXPRESS*

Den richtigen Chart-Typ für die Aussage. Drei Chart-Typen reichen für 90 % aller Business-Berichte.

##### Die drei Standard-Chart-Typen

| Aussage | Chart-Typ |
| --- | --- |
| Entwicklung über Zeit (wenige Punkte) | **Säulen-Chart** (vertikal) |
| Entwicklung über Zeit (viele Punkte) | Linien-Chart |
| Ranking / Vergleich | **Balken-Chart** (horizontal) |
| Korrelation | Scatter / Bubble |
| Anteile am Ganzen | Balken-Chart sortiert (nicht Pie!) |

##### Was vermeiden?

- **Pie-Charts** — Menschen können Winkel nicht gut vergleichen
- **Donut-Charts** — schlechter als Pie (Lücke in der Mitte hilft nicht)
- **Radar / Spider** — verzerren Skalen, schwer lesbar
- **3D-Säulen** — visuell verzerrend
- **Stacked Lines** — verwirrend, weil die Linien nicht direkt vergleichbar sind

> **Beispiel · Pie vs. Balken:** Daten: Marktanteil A=32 %, B=28 %, C=22 %, D=18 %.
>
> Pie-Chart: schwierig zu sagen, wer Zweiter ist (B oder C? Anteile ähnlich).
>
> Balken sortiert: A klar oben, B drunter, C drunter, D drunter — Reihenfolge auf einen Blick.

##### Wann Säulen, wann Linien?

Bei diskreten Zeitpunkten (Monatsabschlüsse, Quartale): Säulen. Bei kontinuierlichem Verlauf (Tageswerte, IoT-Daten): Linien. Faustregel: bis ~12 Datenpunkte Säulen, danach Linien.

> **Anfänger-Falle:** "Wir brauchen einen Pie-Chart, weil die Geschäftsführung das so will." Notation Manual schreiben, mit Beispielen aus der Forschung argumentieren, Alternativen zeigen. Lernkurve, aber zahlt sich aus.

#### SIMPLIFY — Avoid clutter

*IBCS · SIMPLIFY*

Alles raus, was keinen Informationswert hat. Edward Tufte: "Erase non-data ink."

##### Was ist Noise?

- **Gridlines** in voller Stärke — Lichtgrau reicht oder ganz weglassen
- **Doppelte Achsen-Beschriftungen** — wenn die Werte daneben stehen, Achse weg
- **Schatten und Verläufe** — Dekoration ohne Mehrwert
- **3D-Effekte** — verzerren und ablenken
- **Bunte Hintergründe** — weißer Hintergrund ist meistens besser
- **Logos auf jedem Visual** — einmal im Header reicht
- **Legenden, wenn nicht nötig** — direkte Beschriftung im Visual ist klarer

##### Visual aufräumen

Im Format-Pane systematisch durchgehen:

- "Background" — falls farbig: auf Weiß setzen
- "Gridlines" — auf "Off" oder hellgrau
- "Data labels" — wenn lesbar, Achse weglassen
- "Title" — nur wenn aussagekräftig, sonst weg
- "Legend" — wenn nur eine Serie, weg

##### Theme als Standard

Einmal ein sauberes Theme bauen (JSON-Datei), für alle Berichte als Default setzen. Macht aus jedem Bericht automatisch ein Simplify-konformes Visual.

> **Praxis-Beispiel · Vorher-Nachher:** Standard-Säulen-Chart von Power BI: blauer Hintergrund, dicke Gridlines, große Schrift, Schatten.
>
> Nach SIMPLIFY: weißer Hintergrund, keine Gridlines, schmale Schrift, direkt am Datenpunkt beschriftet, kein Schatten. Die Säulen wirken klarer und größer — paradoxerweise, weil weniger Konkurrenz.

> **Tipp:** Bei jedem neuen Visual: erst alles platzieren, dann Element für Element fragen "Brauche ich das wirklich?". Wenn nicht: weg. Im Zweifel: weg.

#### STRUCTURE — Organize content

*IBCS · STRUCTURE*

Inhalte folgen einer Logik. Barbara Mintos Pyramid Principle, MECE-Strukturierung, klare Lese-Reihenfolge.

##### Pyramidenprinzip

Wichtigste Aussage zuerst (Pyramide-Spitze), dann die Belege (Pyramide-Basis):

1. **Antwort** — was ist die Kernaussage?
2. **Argumente** — drei Hauptpunkte, die die Antwort stützen
3. **Belege** — Daten und Details pro Argument

##### MECE-Struktur

**M** utually **E** xclusive, **C** ollectively **E** xhaustive — Kategorien dürfen sich nicht überlappen und müssen alle Fälle abdecken.

Schlechte Kategorisierung: "Männer / Frauen / Mitarbeiter / Kunden" — Mitarbeiter und Kunden sind nicht exklusiv zu Männern/Frauen. Bessere: "Mitarbeiter / Kunden / Andere" UND "Männlich / Weiblich / Divers".

##### Lese-Reihenfolge in Berichten

- **Oben links** — wichtigster Inhalt (Lead-Visual, KPIs)
- **Oben rechts** — Filter, Auswahl
- **Mitte** — Hauptanalyse
- **Unten** — Detail, Drilldown-Möglichkeiten

> **Praxis-Beispiel · Management-Cockpit:** Lead-Visual (oben groß): "Umsatz Q3: 4,2 M€ · +12 % über Plan"
>
> Darunter 3 KPI-Karten: Umsatz, Marge, Auftragseingang
>
> Mitte: zwei Variance-Charts (Plan vs. Ist, Vorjahres-Vergleich)
>
> Unten: Tabelle mit Top-10 Detail-Abweichungen
>
> Geschäftsführer liest oben links, sieht in 2 Sekunden den Tenor. Wer mehr wissen will, scrollt nach unten.

> **Tipp · Storytelling:** Bei mehrseitigen Berichten: jede Seite hat eine klare Frage, die sie beantwortet. Seite 1: "Wie war Q3 gesamt?". Seite 2: "Wo war Q3 am stärksten/schwächsten?". Seite 3: "Welche Maßnahmen leiten wir ab?". Linearer Aufbau, klare Lese-Erwartung.

### IBCS-Notation: *Solid · Outlined · Hatched*

Die Füllung verrät das Szenario.

#### Solid · Ist-Werte (ACT)

*IBCS · NOTATION*

Solide Füllung steht für realisierte Werte — was tatsächlich passiert ist. Die "stärkste" visuelle Form.

##### Visuelle Eigenschaften

- Vollständig gefüllt, ohne Muster
- Dunkle, gesättigte Farben (typischerweise schwarz oder Unternehmens-Hauptfarbe)
- Wirkt "schwer" und definitiv — passt zur Bedeutung "ist gewesen"

##### Verwendung

- **ACT** — Actual, Ist-Werte des aktuellen Zeitraums
- Manchmal: vollendete Vergangenheit (Letztes Jahr abgeschlossen)

> **Praxis-Beispiel:** Monatlicher Bericht zeigt Umsatz Januar bis Oktober (alle abgeschlossen, solide), November und Dezember kommen — der November ist gerade halb durchlaufen.
>
> Variante A: November als Solid mit halbem Wert — irreführend, suggeriert volles Monatsbild
>
> Variante B: Januar–Oktober solid, November und Dezember hatched (forecast) — klare Trennung

##### Power-BI-Umsetzung

Default in Power BI ist solide Füllung — also keine Sonderaktion nötig. Wichtig: **konsistent** beim ACT bleiben. Wenn an einer Stelle solide, dann überall.

> **Tipp:** Farbe für ACT: typischerweise schwarz oder das dunkelste der Unternehmens-Farben. Vermeidet Farb-Konkurrenz mit anderen Notationen.

#### Outlined · Plan / Budget (PL, BU)

*IBCS · NOTATION*

Nur Kontur, keine Füllung. Steht für geplante oder budgetierte Werte — was sein sollte.

##### Visuelle Eigenschaften

- Nur Linie (Border), Füllung transparent oder weiß
- Gleicher Farbton wie das ACT, aber ohne Fülle
- Wirkt "leichter" und "noch nicht da" — passt zur Bedeutung "wird angestrebt"

##### Verwendung

- **PL** — Plan, verbindlicher Plan
- **BU** — Budget, bewilligtes Budget
- Manchmal: Ziel, Soll-Wert

##### Power-BI-Umsetzung

Native nicht direkt verfügbar, aber Workarounds:

1. **Im Bar-Chart:** Fill auf "No fill", Border auf 2px in der ACT-Farbe
2. **In Tabellen-Visuals:** Conditional Formatting für Border
3. **Mit Custom Visuals:** Inforiver oder Zebra BI nativ unterstützt

> **Praxis-Beispiel · Variance-Chart:** Säulen für ACT (solid, schwarz) und Säulen für PL (outlined, schwarze Kontur, weiß gefüllt) nebeneinander pro Kategorie. Auf einen Blick: wo ist ACT > PL (Säule überragt Kontur), wo ist ACT < PL (Säule innerhalb der Kontur).

> **Tipp:** Custom Visuals wie Inforiver machen Outlined-Charts mit einem Klick. Wer in den Bordmitteln bleibt, baut mit zwei übereinandergelegten Säulen-Charts.

#### Hatched · Forecast / Vorjahr (FC, PY)

*IBCS · NOTATION*

45°-Schraffur. Steht für Forecast (Prognose) oder Previous Year (Vorjahr).

##### Visuelle Eigenschaften

- 45°-Schräglinien als Füllmuster
- Gleicher Farbton wie ACT, aber als Schraffur
- Wirkt "weicher" als Solid — passt zur Bedeutung "voraussichtlich / verglichen"

##### Verwendung

- **FC** — Forecast, Hochrechnung künftiger Werte
- **PY** — Previous Year, Vorjahres-Vergleich
- **FC1, FC2, FC3** — verschiedene Forecast-Stände (z. B. Anfang, Mitte, Ende des Jahres)

##### Power-BI-Umsetzung

**Schwierig nativ.** Power BI hat keine eingebaute Schraffur-Füllung für Charts. Drei Optionen:

1. **Custom Visuals** — Inforiver, Zebra BI: nativ unterstützt
2. **SVG-Marker** in Tabellen mit DAX
3. **Annähernde Lösung** — leichtere Farbsättigung statt Schraffur (verliert die strenge IBCS-Notation, aber besser als nichts)

> **Praxis-Beispiel · Forecast-Verlauf:** Säulen-Chart Monatsumsatz: Januar–Oktober solid (ACT), November–Dezember hatched (FC). Mit einem Blick erkennbar: was ist Tatsache, was Prognose. Wenn der FC im November einen Sprung macht, fällt das sofort auf — die Schraffur signalisiert "Vorsicht: Annahme".

> **Tipp:** Wer ohne Custom Visual auskommen muss: PY als helleres Solid (z. B. ACT schwarz, PY 50 % grau) — verletzt zwar die strenge Notation, ist aber visuell klar interpretierbar. Konsistenz innerhalb des Berichts bleibt wichtig.

### Praktische Best Practices

#### Richtigen Chart-Typ wählen

*VIZ · EXPRESS*

Drei Chart-Typen reichen für 90 % aller Business-Berichte. Säulen, Balken, Linien.

##### Entscheidungsbaum

- **Entwicklung über Zeit, wenige Datenpunkte** (bis ca. 12) → **Säulen-Chart** vertikal
- **Entwicklung über Zeit, viele Datenpunkte** (Tageswerte, IoT) → **Linien-Chart**
- **Ranking, Vergleich von Kategorien** → **Balken-Chart** horizontal, sortiert
- **Korrelation zweier Kennzahlen** → Scatter-Chart
- **Verteilung** → Histogramm oder Box-Plot
- **Anteile am Ganzen** → sortierter Balken-Chart (NICHT Pie!)

##### Säulen vs. Balken

| Säulen (vertikal) | Balken (horizontal) |
| --- | --- |
| Zeit-Achse: Monate, Quartale | Kategorien-Liste: Produkte, Kunden |
| Bis ~12 Werte | Bis ~20-30 Werte |
| Beschriftung kurz | Beschriftung kann lang sein (steht waagerecht) |

> **Beispiel · Top-10-Kunden:** Balken-Chart horizontal, von oben (größter Kunde) nach unten sortiert. Mit Plan-Werten als Outlined-Marker daneben. Auf einen Blick: wer ist groß, wer hat den größten Plan-Unterschritt.

##### Pie-Chart-Diskussion

Pie ist ein Anti-Pattern. Menschen können Winkel nicht gut vergleichen. "33 % oder 28 %?" ist im Pie kaum unterscheidbar, im Balken-Chart sofort klar. Wenn die Geschäftsführung Pies fordert: höflich Alternative vorschlagen, mit Beispiel zeigen.

> **Anfänger-Falle:** Stacked-Bar-Chart, weil "schön kompakt". Funktioniert nur, wenn man die erste Kategorie vergleichen will (die mit gemeinsamer Basislinie). Alle anderen Kategorien haben keine gemeinsame Basis und werden unvergleichlich. Stattdessen mehrere kleine Charts (Small Multiples) oder grouped Bars.

#### Noise eliminieren

*VIZ · SIMPLIFY*

Power BI Default-Charts sind voller Dekoration ohne Informationswert. Wer das nicht aufräumt, schwächt die Botschaft.

##### Was raus muss

- **Gridlines** — bei Bar-Charts fast nie nötig; bei Line-Charts hellgrau
- **Schatten** — Visuals werfen Default-Schatten; weg damit
- **Verläufe** — Farben sollten einfarbig sein
- **3D-Effekte** — immer raus (verzerren Wahrnehmung)
- **Farbige Hintergründe** — Weiß ist die Default-Wahl
- **Redundante Labels** — wenn Y-Achse beschriftet, keine Data Labels (oder umgekehrt)
- **Legenden mit einer Serie** — selbsterklärend, weg
- **Borders um Visuals** — Whitespace zwischen Visuals reicht

##### Format-Pane systematisch

Visual auswählen → Format-Pane öffnen → durch jede Sektion klicken: General, X-Axis, Y-Axis, Data labels, Title, Legend, Background, Lock aspect.

##### Eigenes Theme erstellen

Wenn die Standard-Aufräum-Operationen jedes Mal wiederholt werden: ein Theme als JSON-Datei. Im Theme: Default-Werte für Gridlines, Schriftarten, Farben. Wird dann automatisch auf jedes Visual angewendet.

##### Theme laden

View-Tab → Themes → Browse for themes → JSON-Datei wählen. Alle bestehenden Visuals erben die neuen Defaults.

##### Theme-JSON Beispiel

```json
{
  "name": "Clean",
  "dataColors": ["#1F2937", "#6B7280", "#D1D5DB"],
  "background": "#FFFFFF",
  "visualStyles": {
    "*": {
      "*": {
        "background": [{"show": false}],
        "border": [{"show": false}]
      }
    }
  }
}
```

> **Tipp · Test der Lesbarkeit:** Bericht-Screenshot machen, auf 50 % verkleinern und ansehen. Was bei 50 % noch erkennbar ist, ist gut designed. Was bei 50 % verschwimmt, ist überfrachtet.

#### Achsen-Integrität

*VIZ · CHECK*

Eine falsch skalierte Achse kann die wahre Botschaft komplett verfälschen — meistens versehentlich, manchmal gezielt manipulativ.

##### Drei Achsen-Regeln

1. **Y-Achse beginnt bei Null** bei Säulen- und Balken-Charts
2. **Gleiche Skala für vergleichbare Charts**
3. **Skalenbruch sichtbar markieren**, wenn unvermeidbar

> **Manipulation durch Skalierung:** Werte: 95, 97, 99, 102 (alle ähnlich)
>
> Y-Achse 0–110: Säulen sehen fast gleich aus, kaum Unterschied
>
> Y-Achse 90–110: Säulen sehen sehr unterschiedlich aus, dramatischer Effekt
>
> Die Realität ist Variante A. Variante B manipuliert die Wahrnehmung.

##### Power BI Default-Falle

Power BI Desktop hat Y-Achse standardmäßig auf "Auto" — beginnt häufig nicht bei Null. Sondern beim niedrigsten Wert. Das ist nicht "Daten richtig zeigen", sondern eine willkürliche Vergrößerung des sichtbaren Bereichs.

##### Y-Achse fixieren

Visual auswählen → Format → Y-Axis → "Range" → Minimum auf 0 setzen.

##### Mehrere Charts vergleichbar machen

Wenn zwei Charts nebeneinander stehen, die thematisch verglichen werden: gleiche Y-Achse manuell setzen (Maximum auf den größeren Wert beider Charts).

##### Skalenbruch (wenn unvermeidbar)

Wenn ein Wert massiv größer ist als alle anderen (z. B. Mega-Kunde verzerrt Top-10-Liste): Skalenbruch mit Zickzack-Symbol markieren. Power BI hat das nicht nativ — manuell als Text-Annotation.

> **Anfänger-Falle:** Y-Achse anpassen, um "Detail sichtbar zu machen". Wenn der Unterschied wichtig ist, separates Variance-Chart bauen mit Differenzen oder Prozenten. Die absolute Skala bleibt ehrlich.

**Daten-WG dazu:**

- **[Die 3 Zustände der sekundären Y-Achse](https://youtu.be/8DsgIfWJkoI)** · Tutorial · 3 min · [Knowledge Kitchen](../index.html#ep-8DsgIfWJkoI)
- **[Sekundäre Y-Achse umkehren](https://youtu.be/9BpzcWErzwQ)** · Tutorial · 6 min · [Knowledge Kitchen](../index.html#ep-9BpzcWErzwQ)

#### Botschaften statt beschreibender Titel

*VIZ · SAY*

Der Titel eines Visuals sollte sagen, was zu sehen ist — quantifiziert. Nicht beschreiben, was gemessen wird.

##### Vorher / Nachher

| Beschreibend | Botschaft |
| --- | --- |
| Umsatz nach Region | Süd treibt Wachstum, drei Regionen unter Plan |
| Lieferzeit Q3 | Lieferzeit Q3 verkürzt sich auf 3,2 Tage (−12 %) |
| Auftragseingang Monat | Auftragseingang März: 1,8 M€ · höchster Wert seit 2 Jahren |
| Mitarbeiterfluktuation | Fluktuation steigt: 8,5 % p. a. · Ziel 5 % |

##### Dynamischer Titel als DAX-Measure

```dax
Titel Umsatz =
VAR Wert  = [Umsatz]
VAR Plan  = [Umsatz Plan]
VAR Diff  = Wert - Plan
VAR Pct   = DIVIDE(Diff, Plan)
RETURN
  "Umsatz: " & FORMAT(Wert, "#,0 €") &
  IF(Pct >= 0,
    " · +" & FORMAT(Pct, "0 %") & " über Plan",
    " · "  & FORMAT(Pct, "0 %") & " unter Plan")
```

##### Titel an Measure binden

Visual auswählen → Format → Title → fx-Knopf neben "Title text" → "Field value" → die Measure auswählen.

> **Praxis-Beispiel · Cockpit-Header:** Oben auf dem Bericht eine Karte mit Lead-Botschaft: "Q3 Gesamt: +12 % über Plan dank Süd und Online-Kanal". Diese Karte zieht sich aktualisiert durch den ganzen Bericht. Wer die ersten 3 Sekunden auf den Bericht schaut, weiß die Hauptbotschaft.

> **Tipp:** Botschaften nicht überfrachten. Maximal 1 Hauptaussage + 1 Quantifizierung. "Umsatz +12 % über Plan, +8 % über Vorjahr, dank Süd-Region und Online-Kanal mit besonders starken Wachstum bei Privatkunden" ist zu viel — kein Mensch liest das. Eine klare Aussage, alles andere unten.

#### Farbe nur für Bedeutung

*VIZ · UNIFY*

Farbe ist mächtig — und wird ständig falsch eingesetzt. Regel: Farbe trägt Bedeutung. Wenn keine Bedeutung dahinter steht, ist Grau die richtige Farbe.

##### Wann welche Farbe?

| Verwendung | Farbe |
| --- | --- |
| Standard-Datenwert | Schwarz oder Dunkelgrau |
| Negative Abweichung | Rot |
| Positive Abweichung | Schwarz oder Grün (zurückhaltend) |
| Hervorhebung (eine Kategorie) | Akzentfarbe (z. B. Unternehmensfarbe) |
| Status-Indikatoren | Ampel (rot, gelb, grün) — aber sparsam |

##### Anti-Patterns

- **Jede Kategorie eine andere Farbe** — Regenbogen-Chart ohne Bedeutung
- **Farbverläufe** — suggerieren Reihenfolge, wo keine ist
- **Rot und Grün allein** — Farbenblinde (~8 % aller Männer) sehen es gleich; immer mit Symbol/Text kombinieren

> **Praxis-Beispiel · Hervorhebung:** Balken-Chart mit 10 Kategorien, alle grau außer der eigenen Region in Akzent-Schwarz. Auf einen Blick: hier sind wir. Vergleich zu allen anderen sofort sichtbar. Mit allen 10 in verschiedenen Farben: visuelle Verwirrung.

##### Custom Theme

Eigene Theme-JSON mit definierten `dataColors` und Status-Farben. Wird automatisch auf alle Visuals angewendet. Konsistenz über alle Berichte des Teams.

> **Anfänger-Falle:** "Sieht doch hübsch aus mit vielen Farben." Hübsch ist nicht das Ziel — Verstehen ist das Ziel. Bunt verschleiert, monochrom mit Akzent klärt.

> **Tipp · Print-Test:** Bericht ausdrucken und in Schwarz-Weiß betrachten. Wenn die Aussage immer noch klar ist: gut designed. Wenn alle Säulen gleich aussehen: zu sehr auf Farbe verlassen.

#### Informationsdichte erhöhen

*VIZ · CONDENSE*

Mehr Information pro Quadratzentimeter Bildschirm — ohne die Klarheit zu verlieren. Vier konkrete Werkzeuge in Power BI.

##### 1. Small Multiples

Seit 2021 nativ in Power BI. Im Visual: "Small multiples" Feld setzen — und der Chart wird zu einer Matrix kleiner Charts, einer pro Kategorie.

> **Beispiel:** Säulen-Chart "Umsatz pro Monat" mit Small Multiples = Region. Ergebnis: 5 kleine Charts in einer Matrix, alle mit gleicher Skala. Auf einen Blick: welche Region weicht vom Muster ab.

##### 2. Sparklines in Tabellen

Preview seit Dezember 2021, GA seit Juni 2025. In einer Matrix: rechte Spalte als Sparkline (Mini-Linien-Chart) für den Verlauf der letzten 12 Monate. Werte und Trend in einer Tabelle.

##### 3. Variance Charts

Zeigt nicht zwei Werte, sondern die Differenz — fokussiert auf die Botschaft. Power BI nativ: kein eingebauter Variance-Chart, aber:

- Mit zwei übereinandergelegten Säulen (ACT solid, PL outlined) bauen
- Mit DAX die Differenz als Measure berechnen, in separates Chart
- Custom Visuals: Inforiver, Zebra BI haben Variance nativ

##### 4. Tabellen mit visuellen Elementen

Eine Matrix mit Conditional Formatting: Hintergrundfarbe nach Wert, Icon-Spalten für Status, Sparkline für Trend. Mehr Information als ein "schönes" Säulen-Chart.

> **Praxis-Beispiel · Cockpit-Übersicht:** Matrix mit Zeilen pro Region, Spalten: ACT, PL, Diff, Diff %, Trend (Sparkline). 10 Regionen × 5 Spalten = 50 Werte plus 10 Sparklines auf einer Karte. Ein klassisches Säulen-Chart hätte für dieselbe Information 5 Charts gebraucht.

> **Tipp · Informationsdichte vs. Lesbarkeit:** Dichte hat ein Limit — irgendwann ist zu viel auf zu wenig Raum. Faustregel: Bericht-Seite druckbar auf A4? Wenn ja, wahrscheinlich ok. Wenn nein, zu dicht oder zu groß.

### Aus dem Kanal · Visualisierung in Aktion

Von IBCS-First-Principles bis zu deklarativer Custom-Visualisierung mit Deneb/Vega — beide Wege zeigen, warum Default-Charts selten reichen.

- **[Boring Charts, Better Insights](https://youtu.be/inko8wG9jlY)** · IBCS-Talk · 40 min · [Knowledge Kitchen](../index.html#ep-inko8wG9jlY)
- **[Declarative Visualization with DENEB](https://youtu.be/AxLQtBVAI9o)** · Deep Dive · 47 min · EN · [Knowledge Kitchen](../index.html#ep-AxLQtBVAI9o)

## 07 · Interaktivität *· UX*

Statische Berichte beantworten eine Frage. Interaktive Berichte werden zum Analyse-Werkzeug. Mit Drillthrough, Bookmarks, Buttons und Field Parameters wird aus einer Reportseite ein Tool, mit dem Anwender selbst in die Daten eintauchen.

> Als erstes: **Drillthrough** — die einfachste High-Impact-Interaktion. Anschließend **Field Parameters** — der Game-Changer aus 2022 (Preview) bzw. seit Juli 2025 GA, der viele alte Bookmark-Tricks überflüssig macht.

### Drillthrough

*INTERAKTIVITÄT · NAVIGATION*

Vom Aggregat zum Detail springen. Der Anwender klickt rechts auf einen Wert, wählt "Drillthrough → [Zielseite]", landet auf einer Detailseite — mit dem Filter-Kontext der Ausgangs-Auswahl.

#### Was passiert beim Drillthrough?

Wenn du in einem Bar-Chart auf "Region: Süd" rechtsklickst und Drillthrough wählst, springt Power BI auf die Detailseite und filtert sie automatisch auf Region=Süd. Der Anwender muss den Filter nicht manuell setzen.

#### Detailseite anlegen

Neue Bericht-Seite erstellen (rechtsklick auf Reiter → "Add Page"). Diese wird zur Drillthrough-Zielseite.

#### Drillthrough-Feld festlegen

Im Visualization-Pane unten ein Feld in "Drillthrough fields" ziehen — z. B. `dim_region[RegionName]`. Damit weiß Power BI: wenn jemand von außen auf eine Region drillt, wird hier nach diesem Feld gefiltert.

#### Visuals auf der Detailseite

Visuals platzieren, die das Detail zeigen. Sie filtern sich automatisch beim Drillthrough-Aufruf — kein manueller Filter nötig.

#### Zurück-Button

Power BI fügt automatisch einen "Back"-Button oben links ein. Anwender kann zum Ursprung zurückspringen.

> **Praxis-Beispiel:** Übersichtsseite zeigt Umsatz pro Region (Balken-Chart). Anwender sieht: "Süd ist auffällig schwach". Rechtsklick auf den Süd-Balken → "Drillthrough → Region Detail". Detailseite zeigt: Top-Produkte Süd, Top-Kunden Süd, Umsatzverlauf Süd, mit Kommentarfeld. Anwender versteht in 30 Sekunden, woher die Schwäche kommt.

#### Cross-Report-Drillthrough

Seit 2020: Drillthrough kann sogar in einen anderen Bericht im selben Workspace springen. Praktisch für aufgeteilte Berichte (z. B. von Übersicht in eine Detail-Lösung).

> **Tipp:** Drillthrough-Felder können mehrere sein. Wenn der Anwender Region+Quartal+Kunde auswählt, wird die Detailseite auf alle drei gefiltert. Sehr mächtig, aber: zu viele Drillthrough-Felder führen zu kaum noch ladenden Detailseiten.

> **Anfänger-Falle:** Drillthrough einrichten, aber im Drillthrough-Feld eine Spalte aus der Faktentabelle wählen statt aus der Dimension. Funktioniert technisch, ist aber schwer zu verstehen für den Anwender. Immer Dimensions-Spalten als Drillthrough-Feld.

**Daten-WG dazu:**

- **[Drillthrough-Auswahl sortieren — Reihenfolge kontrollieren](https://youtu.be/0n8hZ6v_0Lc)** · Tutorial · 7 min · [Knowledge Kitchen](../index.html#ep-0n8hZ6v_0Lc)

### Bookmarks

*INTERAKTIVITÄT · STATE*

Bookmarks speichern den aktuellen Zustand einer Bericht-Seite — Filter, Selektion, Slicer-Werte, Visual-Sichtbarkeit. Mit einem Klick wieder herstellbar.

#### Was Bookmarks speichern

- Aktuelle Slicer-Werte
- Filter im Filter-Pane
- Visual-Sichtbarkeit (über Selection Pane)
- Drill-Stand in einem Visual
- Sort-Reihenfolge
- Cross-Highlight-Status

#### Bookmark-Pane öffnen

View-Tab → Bookmarks. Pane öffnet sich rechts.

#### Bookmark erstellen

Filter und Slicer in den gewünschten Zustand bringen → "Add" im Bookmark-Pane → Name vergeben (z. B. "Q3 Süd").

#### Bookmark verwenden

Klick auf den Bookmark stellt den Zustand wieder her. Anwender im Service kann das, ohne den Editor zu öffnen.

#### Bookmark mit Button verbinden

Insert → Button → Im Action-Pane: Type = "Bookmark", Bookmark = "Q3 Süd". Klick auf den Button stellt den Zustand her.

#### Use Cases

- **Voreingestellte Sichten** — "Aktueller Monat", "Letzte 12 Monate", "Year-to-Date"
- **Reset-Button** — Bookmark mit Default-Zustand, Reset-Button ruft ihn auf
- **Story-Modus** — Bookmarks der Reihe nach durchklicken, wie eine Präsentation
- **Toggle-Visuals** — zwischen zwei Visuals (z. B. Chart vs. Tabelle) per Bookmark wechseln

> **Praxis-Beispiel · Toggle:** Du zeigst Umsatz wahlweise als Säulen-Chart oder als Tabelle. Beide Visuals übereinander platzieren. Im Selection Pane das eine ausblenden. Bookmark "Als Chart" speichert: Chart sichtbar, Tabelle versteckt. Bookmark "Als Tabelle" umgekehrt. Zwei Buttons, jeder lädt einen Bookmark. Anwender wechselt mit einem Klick.

#### Personal Bookmarks

Im Service können Anwender eigene Bookmarks speichern — getrennt von den vom Autor angelegten "Report Bookmarks". Praktisch für Power-User, die ihre Lieblings-Filter merken wollen.

> **Anfänger-Falle:** Bookmark mit "Data" UND "Display" UND "Current page" speichern, ohne zu wissen, was was bedeutet. Diese drei Optionen im Bookmark-Kontextmenü bestimmen, welche Aspekte gespeichert werden. Wenn der Bookmark "auch die Seite wechselt", obwohl du nur Filter ändern wolltest: "Current page" deaktivieren.

### Buttons & Navigation

*INTERAKTIVITÄT · STEUERUNG*

Buttons machen aus einem statischen Bericht ein Tool. Power BI hat eine Reihe von Aktions-Typen, die Buttons auslösen können.

#### Sieben Button-Aktionen

- **Back** — zur vorherigen Seite zurück
- **Bookmark** — Bookmark anwenden
- **Drill through** — Drillthrough zu einer Seite
- **Page navigation** — direkt zu einer anderen Seite
- **Q&A** — Q&A-Visual öffnen
- **Web URL** — externe URL öffnen
- **Apply all slicers / Clear all slicers** — Filter-Steuerung (seit 2022)

#### Button einfügen

Insert-Tab → Button → Typ wählen (Blank, Back, Forward, Reset, ...).

#### Aktion konfigurieren

Format-Pane → "Action" aktivieren → Type wählen → Ziel angeben (Bookmark, Seite, URL).

#### Anwender-Hinweis

Im Service-Mode muss der Anwender **Strg + Klick** machen, damit der Button auslöst. Im Editor-Mode reicht Klick. Hinweis im Bericht klar kommunizieren.

#### Page Navigator

Seit 2021 ein eingebauter Visual-Typ. Insert → Buttons → Navigator → Page navigator. Erstellt automatisch Buttons für alle (sichtbaren) Bericht-Seiten. Ideal für mehrseitige Cockpits.

#### Bookmark Navigator

Analog für Bookmark-Gruppen. Insert → Buttons → Navigator → Bookmark navigator → Bookmark group wählen. Erstellt Buttons für alle Bookmarks der Gruppe. Praktisch für "Aktuell / Letzter Monat / Year-to-Date"-Umschalter.

> **Praxis-Beispiel · Toggle zwischen Sichten:** Drei Bookmarks: "Tagesbasis", "Monatsbasis", "Jahresbasis" — alle auf einer Bookmark-Gruppe "Zeitebene". Bookmark Navigator daraus generieren. Anwender hat oben drei Pill-Buttons, ein Klick wechselt die Zeitebene aller Visuals.

> **Tipp:** Button-States gestalten: Hover, Selected, Disabled — alle haben eigene Format-Properties. Lohnt sich, um klar zu zeigen, welcher Button aktiv ist.

### Field Parameters

*INTERAKTIVITÄT · DYNAMIK*

Preview seit Mai 2022, GA seit Juli 2025. Der Anwender wählt selbst, welche Measure oder Dimension das Visual gerade anzeigt. Macht viele alte Bookmark-Tricks überflüssig.

#### Was sind Field Parameters?

Ein Parameter, dessen Werte Verweise auf Measures oder Dimensionen sind. Wenn der Anwender den Parameter wechselt (per Slicer), wechseln alle damit gebundenen Visuals automatisch.

#### Field Parameter erstellen

Modeling-Tab → "New parameter" → "Fields". Dialog erscheint.

#### Felder auswählen

Felder anhaken, die wechselbar sein sollen — z. B. `[Umsatz]`, `[Marge]`, `[Menge]`. Power BI generiert automatisch eine Hilfstabelle und einen Slicer.

#### Visual binden

Im Visual-Pane das Parameter-Feld in "Values" ziehen statt einer fixen Measure. Slicer mit dem Parameter wirkt jetzt auf das Visual.

> **Praxis-Beispiel · Anwender wählt Kennzahl:** Bericht zeigt Säulen-Chart "X pro Region". Slicer oben rechts: Umsatz / Marge / Menge. Anwender klickt "Marge" → Säulen wechseln zu Margen-Werten, Titel aktualisiert. Mit demselben Visual bedienst du drei Use Cases. Vorher: drei separate Visuals oder Bookmark-Workaround.

#### Field Parameters für Dimensionen

Funktioniert auch für die X-Achse oder Legend-Spalte. Anwender wählt: "Nach Region", "Nach Kategorie", "Nach Kunde" — die Achse des Visuals wechselt entsprechend.

> **Tipp · Format-Strings:** Wenn die wechselnden Measures unterschiedliche Format-Strings haben (€ vs. % vs. Stk), muss der Visual-Default das übernehmen. Im Field-Parameter-Setup unter "Add slicer to this page" und ggf. Format dynamisch per DAX schalten.

> **Anfänger-Falle:** Field Parameters für jeden Wechsel einsetzen ("eleganter Code"). Wenn der Anwender zwischen zwei Sichten wechselt, ist ein Toggle-Button manchmal verständlicher als ein Slicer mit Parameter.

**Daten-WG dazu:**

- **[Field Parameter (Feldparameter) richtig nutzen](https://youtu.be/v8dvnqqa7f8)** · Tutorial · 5 min · [Knowledge Kitchen](../index.html#ep-v8dvnqqa7f8)
- **[TMDL Magie: Multi-Parameter-Tabelle — Feldparameter Next Level](https://youtu.be/sShNdgnHjr4)** · Tutorial · 9 min · [Knowledge Kitchen](../index.html#ep-sShNdgnHjr4)

### Report-Page Tooltips

*INTERAKTIVITÄT · TIEFE*

Eine ganze Bericht-Seite als Tooltip. Wenn der Anwender mit der Maus über einen Datenpunkt fährt, erscheint kein simpler Wert, sondern eine komplette Detail-Karte. Die unterschätzteste Funktion in Power BI.

#### Tooltip-Seite erstellen

Neue Bericht-Seite. Im Format-Pane der Seite: "Page Information" → "Allow use as tooltip" auf On. Page Size: "Tooltip" — kleine Standard-Größe.

#### Visuals auf der Tooltip-Seite

2–4 kompakte Visuals platzieren: KPI-Karten, kleiner Trend-Chart, Top-3-Liste. Sollte in der kleinen Tooltip-Größe lesbar sein.

#### Hauptvisual mit Tooltip-Seite verbinden

Im Format-Pane des Hauptvisuals: "Tooltip" → "Type": Report page → "Page" → Tooltip-Seite auswählen.

#### Filter-Kontext

Wenn du auf einem Region-Balken hoverst, filtert die Tooltip-Seite automatisch auf diese Region. Visuals zeigen die Region-spezifischen Werte.

> **Praxis-Beispiel:** Übersichtsseite zeigt Säulen-Chart "Umsatz pro Region". Tooltip-Seite zeigt für die jeweils gehoverte Region: Umsatz-Trend (kleiner Linien-Chart), Top-3-Produkte, Plan-Erreichung. Anwender muss nicht drillen — hover reicht für die wichtigste Detailinformation.

> **Tipp · Mehrere Tooltips pro Bericht:** Jede Visual-Sektion kann ihre eigene Tooltip-Seite haben. Region-Chart hat Region-Tooltip, Kunden-Chart hat Kunden-Tooltip. Tooltip-Seiten im Seiten-Reiter ausblenden, damit Anwender sie nicht direkt aufrufen.

> **Anfänger-Falle:** Tooltip-Seite zu voll machen. Anwender hovert eine halbe Sekunde — wenn er da Romane lesen muss, geht der Effekt verloren. Maximal 3 kompakte Visuals + 2 KPI-Karten.

### Conditional Formatting

*INTERAKTIVITÄT · VISUELL*

Format-Eigenschaften nicht statisch setzen, sondern dynamisch per DAX oder Regel berechnen. Das versteckte Geheimnis vieler Profi-Berichte.

#### Was lässt sich konditional formatieren?

- **Hintergrundfarbe** einer Tabellen-Zelle
- **Schriftfarbe**
- **Icons** in Tabellen-Zellen (Ampel, Pfeile, Sterne)
- **Data Bars** in Tabellen-Zellen
- **Visual-Titel** dynamisch per Measure
- **Datenfarben** in Charts pro Kategorie
- **Web URLs** in Tabellen für klickbare Links

#### Conditional Formatting öffnen

In einem Tabellen-/Matrix-Visual: Format-Pane → "Cell elements" → Spalte auswählen → Background color / Font color / Data bars / Icons.

#### Regel definieren

Drei Modi:

- **Color scale** — Gradient von Min zu Max
- **Rules** — explizite Regeln (Wenn < 0, dann rot)
- **Field value** — eine Measure liefert die Farbe als Hex-Code

#### Dynamische Farbe per Measure

```dax
Ampel = IF(
  [Umsatz] >= [Plan], "#22C55E",
  IF([Umsatz] >= 0.9*[Plan], "#F59E0B", "#EF4444"))
```

Diese Measure als "Field value" in Conditional Formatting nutzen.

> **Praxis-Beispiel · Cockpit-Matrix:** Matrix mit Regionen und Monaten. Zellen-Hintergrundfarbe per Conditional Formatting: rot wenn unter 90 % Plan, gelb wenn 90-100 %, grün wenn über 100 %. Auf einen Blick erkennbar: wo brennt es. Mehr Information als ein Säulen-Chart, kompakter.

#### Dynamische Titel

Im Format-Pane → Title → fx-Knopf neben Title text → Measure auswählen, die den Titel-String liefert. Titel passt sich an Filter an.

> **Tipp · Hex-Codes:** Conditional Formatting per Measure braucht Hex-Codes ("#FF0000"). Theme-Farben kannst du als Konstanten in eigene Measures speichern und wiederverwenden.

**Daten-WG dazu:**

- **[Jedes Power BI Visual dynamisch — auch ohne fx-Button](https://youtu.be/c5zxZLRuV_s)** · Tutorial · 6 min · [Knowledge Kitchen](../index.html#ep-c5zxZLRuV_s)

### Aus dem Kanal · Interaktivität konkret

Ein 54-Min-Solo-Deep-Dive verbindet Buttons, Drilling, Navigation und dynamisches Filtern in einem Report. TMDL-Magie zeigt, was Field Parameters jenseits der GUI können.

- **[Buttons, Drilling, Navigation und Dynamisches Filtern in einem Power BI Report](https://youtu.be/K27nB68nR1M)** · Solo Deep Dive · 54 min · [Knowledge Kitchen](../index.html#ep-K27nB68nR1M)
- **[TMDL Magie: Multi-Parameter-Tabelle — Feldparameter Next Level](https://youtu.be/sShNdgnHjr4)** · Tutorial · 9 min · [Knowledge Kitchen](../index.html#ep-sShNdgnHjr4)

## 08 · Service & *Sharing*

Erst durch den Power BI Service wird aus einer .pbix-Datei eine geteilte, automatisch aktualisierte und governance-konforme Lösung. Microsoft empfiehlt klar: Sicherheitsgruppen statt Einzelnutzer.

> Als erstes: **"Workspaces"** und **"Workspace-Rollen"** — wer darf was im Service. Dann **"Power BI Apps"** — der Microsoft-empfohlene Sharing-Weg, den viele noch nicht nutzen.

### Workspaces

*SERVICE · CONTAINER*

Workspaces sind die Container, in denen Power-BI-Inhalte organisiert werden. Reports, Datasets, Dashboards, Apps — alles lebt in einem Workspace.

#### Drei Workspace-Typen

| Typ | Beschreibung |
| --- | --- |
| **My Workspace** | Persönlich, nicht teilbar. Für Experimente und Lernen. |
| **Standard-Workspace** | Gemeinsam, Pro-User können Inhalte teilen. |
| **Premium-/Fabric-Workspace** | Auf einer Capacity. Free-User können konsumieren, erweiterte Funktionen verfügbar. |

#### Sinnvolle Workspace-Struktur

Microsoft empfiehlt: Workspaces nach **Inhalt** (Themenbereich), nicht nach **Personen**. Beispiele:

- `WS Vertrieb` — alle Vertriebs-Berichte
- `WS Finanzen` — alle Finanz-Berichte
- `WS Marketing` — alle Marketing-Berichte

NICHT pro Person ("WS Max"), NICHT pro Bericht ("WS Q3-Cockpit") — sonst entsteht ein unwartbares Chaos.

#### DEV/TEST/PROD-Workspaces

Best Practice für ernsthafte Bereitstellung: drei Workspaces pro Themenbereich.

- `WS Vertrieb DEV` — Entwickler arbeiten hier
- `WS Vertrieb TEST` — Test-Phase mit ausgewählten Anwendern
- `WS Vertrieb PROD` — produktiv für alle Endnutzer

Mit Deployment Pipelines (siehe nächste Karte) wird zwischen den Workspaces verschoben.

> **Praxis-Beispiel:** Unternehmen mit 50 Power-BI-Berichten. Schlechte Struktur: 50 Workspaces, einer pro Bericht. Gute Struktur: 5 Workspaces nach Themen (Vertrieb, Finanzen, HR, Marketing, IT), je 10 Berichte. Wartung und Berechtigungs-Management werden 10× einfacher.

> **Anfänger-Falle:** Alles in My Workspace bauen. My Workspace ist persönlich, nicht teilbar, und beim Verlassen des Unternehmens gehen Inhalte verloren. Sobald andere Personen einen Bericht sehen sollen: in einen Standard-Workspace umziehen.

### Power BI Apps

*SERVICE · DISTRIBUTION*

Apps sind der Microsoft-empfohlene Weg, Inhalte an Konsumenten zu verteilen. Eine App ist die "Vitrine" eines Workspaces — gepackt und veröffentlicht.

#### Workspace vs. App

| Workspace | App |
| --- | --- |
| Entwicklungs-Umgebung | Konsum-Umgebung |
| Authoren arbeiten direkt drin | Konsumenten sehen "gepackte" Version |
| Änderungen sofort sichtbar | Änderungen erst nach erneutem Publish sichtbar |
| Vollzugriff für Member | Eingeschränkter Zugriff für Konsumenten |

#### Audiences (seit 2022)

Eine App kann mehrere Audiences haben — z. B. "Management" sieht andere Berichte als "Vertriebsteam". Aus einer App-Quelle werden mehrere Sichten verteilt.

#### App erstellen

Workspace → oben rechts "Create app". Wenn die App schon existiert: "Update app".

#### Setup

App-Name, Beschreibung, Logo, Theme.

#### Content

Berichte und Dashboards auswählen, die in der App veröffentlicht werden. Reihenfolge per Drag-and-Drop.

#### Audiences

"Audiences"-Tab → mehrere Sichten erstellen. Pro Audience festlegen: welche Berichte sichtbar, welche User-Gruppen Zugriff haben.

#### Permissions

Pro Audience eine Berechtigung: einzelne Personen oder (besser) Microsoft-Entra-Sicherheitsgruppen.

#### Publish

Klick auf "Publish app" — alle Audience-Mitglieder bekommen Zugriff. Eine URL wird vergeben, die per E-Mail geteilt werden kann.

> **Praxis-Beispiel · App mit zwei Audiences:** App "Vertriebs-Cockpit" für 200 Konsumenten:
>
> **Audience Management:** Cockpit + Detail-Reports + Forecast. Mitglieder: SG-Vertriebsleitung.
>
> **Audience Vertriebsteam:** Cockpit + eigene Region. Mitglieder: SG-Vertrieb-Außendienst.
>
> Beide sehen unterschiedliche Berichte aus derselben App. Power-BI-Apps + RLS = das vollständige Distribution-Modell.

> **Anfänger-Falle:** Workspace direkt mit Konsumenten teilen statt eine App zu bauen. Konsumenten sehen dann den Entwicklungsstand inklusive halbfertiger Berichte. Apps schaffen die saubere Trennung zwischen Entwicklung und Produktion.

### Workspace-Rollen

*SERVICE · BERECHTIGUNGEN*

Vier Rollen, vier Berechtigungsstufen. Wer welche Rolle bekommt, ist die Grundlage von Power-BI-Governance.

#### Die vier Rollen

| Rolle | Berechtigung |
| --- | --- |
| **Admin** | Vollzugriff — User hinzufügen, Workspace löschen, App publishen |
| **Member** | Inhalte erstellen + publishen, andere User hinzufügen (Contributor/Viewer) |
| **Contributor** | Inhalte erstellen und bearbeiten, aber nicht publishen |
| **Viewer** | Berichte ansehen, eigene Personal Bookmarks setzen, keine Änderungen |

#### Welche Rolle für wen?

- **Admin** — sehr wenige Personen, typisch 1-2 pro Workspace
- **Member** — Hauptentwickler des Teams
- **Contributor** — Mitentwickler ohne Publish-Rechte
- **Viewer** — interne Konsumenten OHNE App (selten — meist über App verteilen)

#### RLS-Wichtig

Row-Level Security gilt **nur für Viewer**. Admin, Member, Contributor sehen alle Daten. Wenn jemand RLS-gefiltert sehen soll: Viewer-Rolle ODER (besser) über App-Audience.

#### Rollen zuweisen

Workspace → "Manage access" → User suchen → Rolle wählen → Add.

#### Sicherheitsgruppen statt Einzelpersonen

Microsoft-Empfehlung: keine einzelnen Personen, sondern Microsoft-Entra-Sicherheitsgruppen zuweisen. Bei Mitarbeiterwechsel braucht nur die Gruppe gepflegt zu werden, nicht jeder einzelne Workspace.

> **Praxis-Beispiel · saubere Workspace-Rollen:** Workspace "Vertrieb PROD":
>
> - Admin: SG-BI-Admin (1 Person + Vertretung)
> - Member: SG-BI-Vertrieb-Developer (3 Personen)
> - Contributor: leer (für gelegentliche Helfer)
> - Viewer: leer (Konsumenten kommen über App, nicht über Workspace)
>
> Konsumenten greifen über die App zu, die als Audiences die Rollen feiner unterteilt.

> **Anfänger-Falle:** 100 Konsumenten als Viewer in den Workspace einladen. Klingt einfach, ist aber nicht Best Practice — Konsumenten sehen Entwicklungsstand und können sich verirren. App + Audiences ist sauberer.

### Deployment Pipelines

*SERVICE · LIFECYCLE*

DEV → TEST → PROD ohne manuelles Hin-und-Her-Kopieren. Deployment Pipelines automatisieren das Verschieben von Inhalten zwischen Workspaces.

#### Voraussetzung

Premium-Capacity oder Fabric-Capacity (F-SKU). Pipelines stehen unter Premium-Features.

#### Wie es funktioniert

Eine Pipeline hat drei Stages, die mit drei Workspaces verbunden sind:

```
WS Vertrieb DEV → WS Vertrieb TEST → WS Vertrieb PROD
```

Mit einem Klick "Deploy to test" werden alle Inhalte aus DEV in TEST kopiert. Verbunden mit dem Source-Workspace bleibt nichts — die TEST-Version ist eigenständig.

![Fabric Deployment Pipeline mit drei Stages Development Test Production und Inhalt im Development-Stage](https://learn.microsoft.com/fabric/cicd/media/cicd-tutorial/development-stage.png)

**Abb. · Deployment Pipeline mit drei Stages** Development gefüllt mit Semantic Model + Report + Dashboard, Test/Production noch leer. "Deploy"-Button verschiebt Inhalte zur nächsten Stage. Quelle: [ALM Tutorial · Microsoft Learn](https://learn.microsoft.com/fabric/cicd/cicd-tutorial)

#### Pipeline erstellen

Im Power BI Service: Deployment pipelines (im linken Menü) → "Create pipeline" → Name vergeben.

#### Workspaces zuweisen

Pro Stage einen Workspace zuweisen. Wenn TEST und PROD noch nicht existieren, lässt Power BI sie automatisch anlegen.

#### Deploy

"Deploy to test" oder "Deploy to production" Knopf. Status-Anzeige zeigt: was wird verschoben.

#### Deployment Rules

Wichtig: Pro Stage können Rules definiert werden — z. B. "in PROD verwende eine andere Datenbank-Connection". So bleibt DEV mit Test-DB, PROD verbindet sich mit Prod-DB.

#### Auto-Binding

Wenn ein Bericht von einem Dataset in DEV abhängt, wird beim Deployment in TEST automatisch das TEST-Dataset verlinkt. Keine manuelle Reparatur der Verbindungen.

> **Praxis-Beispiel · Release-Zyklus:** Montag-Morgen Release:
>
> 1. Entwickler schließt Feature in DEV ab
>
> 2. "Deploy to test" → Inhalte gehen nach TEST. Test-Anwender prüfen.
>
> 3. Wenn Tests OK: "Deploy to production"
>
> 4. Konsumenten sehen die neue Version
>
> Roll-back: einfach zurückdeployen aus einer früheren Stage.

> **Tipp · Git-Integration (Fabric):** Fabric-Workspaces können mit Azure DevOps oder GitHub verknüpft werden. Pull/Push wie bei Code. Pipelines + Git zusammen ergeben einen vollwertigen ALM-Prozess für Power BI.

### Scheduled Refresh

*SERVICE · AKTUALISIERUNG*

Damit der Bericht im Service aktuelle Daten zeigt, muss das Dataset regelmäßig aktualisiert werden. Pro-User: bis zu 8 Refreshes/Tag. Premium/Fabric: bis 48.

#### Im Service zum Dataset

Workspace → Dataset auswählen → "..." → "Settings".

#### Datenquellen-Credentials

"Data source credentials" → für jede Datenquelle Anmeldedaten hinterlegen. Bei On-Prem-Quellen: Gateway auswählen.

#### Refresh-Zeiten

"Scheduled refresh" → On. Zeitzone wählen. Bis zu 8 (Pro) oder 48 (Premium) Zeitpunkte pro Tag.

#### E-Mail-Benachrichtigung

"Send refresh failure notifications to" → eigene E-Mail oder Verteiler. Wenn ein Refresh scheitert, sofortige Info.

#### Refresh-Limits

| Lizenz / SKU | Refresh/Tag | Max-Modellgröße |
| --- | --- | --- |
| Pro (Shared Capacity) | 8 | 1 GB |
| PPU | 48 | 100 GB |
| Fabric F64 (= P1) | 48 | 25 GB |
| Fabric F128 (= P2) | 48 | 50 GB |
| Fabric F256 (= P3) | 48 | 100 GB |
| Fabric F512 / F1024 / F2048 | 48 | 200 / 400 / 400 GB |

Quelle: Microsoft Learn · *Semantic model SKU limitation*. Die Modellgröße ist Obergrenze — Refresh und Queries reservieren zusätzlichen Speicher.

#### Häufige Refresh-Fehler

- **Credentials abgelaufen** — DB-Passwort wurde geändert, Service kennt es nicht
- **Gateway offline** — bei On-Prem-Quellen, Gateway-Server nicht erreichbar
- **Timeout** — Refresh dauert länger als 2h (Pro) oder 5h (Premium)
- **Quelle nicht verfügbar** — DB-Server down, API-Endpunkt geändert
- **Lizenz-Konflikt** — Dataset auf Premium-Capacity, aber Owner hat nur Pro

#### Refresh-Performance verbessern

- Query Folding (siehe Sektion 3) — größter Hebel
- **Inkrementelle Aktualisierung** (siehe Sektion 10) — nur neue Daten laden
- Spalten-Reduktion — unnötige Spalten in Power Query entfernen
- Datentypen früh setzen

> **Anfänger-Falle:** Refresh-Failures ignorieren. Nach 4 Wochen Failures pausiert der Service den Refresh komplett. Plötzlich sind alle Daten 4 Wochen alt. E-Mail-Notifications immer aktivieren.

### Sharing-Methoden im Vergleich

*SERVICE · TEILEN*

Vier Wege, Inhalte zu teilen. Jeder mit eigenen Stärken und Use Cases.

#### 1. Power BI Apps (empfohlen)

- Verpackter Inhalt aus einem Workspace
- Audiences für verschiedene Zielgruppen
- Konsumenten sehen "Production"-Stand
- Microsoft-Standard für externe Verteilung

#### 2. Direct Sharing (Single Item)

- Einzelner Bericht direkt teilen (Share-Knopf)
- Quick und einfach, aber: skaliert schlecht
- Empfohlen nur für: Ad-hoc-Teilung mit wenigen Personen

#### 3. Embedding

- Bericht in externe Anwendung einbetten (Iframe oder PowerPoint)
- "Embed for Organization" — interne User mit Power-BI-Lizenz
- "Embed for Customers" — externe User ohne Power-BI-Lizenz, braucht Embedded Capacity
- Auch: PowerPoint-Live-Embedding (seit 2023)

#### 4. Subscriptions

- Periodische E-Mail mit Bericht-Snapshot (PDF oder Bild)
- Täglich, wöchentlich, monatlich
- Auch für Anwender ohne Power-BI-Lizenz (wenn Capacity vorhanden)
- Schwächer als interaktiver Bericht — kein Drill, kein Filter

#### Vergleichs-Matrix

| Methode | Skalierung | Anwender-Lizenz | Interaktion |
| --- | --- | --- | --- |
| App | Sehr gut | Pro (oder Capacity) | Vollständig |
| Direct Share | Schlecht | Pro | Vollständig |
| Embed | Gut | Variiert | Variabel |
| Subscription | Sehr gut | Optional | Keine |

> **Praxis-Beispiel · Mischmodell:** Großes Unternehmen, 5 000 Mitarbeiter:
>
> — Vertriebsteam (50 Personen) bekommt App "Vertriebs-Cockpit" mit Live-Daten
>
> — Geschäftsführung (10 Personen) bekommt zusätzlich täglich um 7 Uhr eine Subscription mit dem Tages-PDF
>
> — Externe Partner (200 Personen, keine Power-BI-Lizenzen) sehen ein eingebettetes Cockpit im Partner-Portal (Embed for Customers)

> **Tipp:** Apps + Subscriptions sind oft die richtige Kombination: App für die Power-User mit Interaktion, Subscription für die "Schau-Anwender", die nur die wichtigsten Zahlen brauchen.

## 09 · Row-Level Security *· RLS*

Microsoft Learn ist eindeutig: RLS gilt nur für die Viewer-Rolle, nicht für Admins, Members oder Contributors. Und: RLS-Filter werden auf jede DAX-Query angewendet — ein gut designtes Stern-Schema ist die Voraussetzung für performante RLS.

> Als erstes: **"Statische RLS"** öffnen — das einfachere Konzept. Dann **"Dynamische RLS"** — das Pattern, das in der echten Welt skaliert. **"View As Role"** ist Pflicht vor jedem Production-Deploy.

Statische RLS · EINFACH · WARTUNGSAUFWAND · [Region] = "Süd" · Eine Rolle pro Filter-Variante. Funktioniert, skaliert aber schlecht.

Dynamische RLS · SKALIERBAR · GOLDSTANDARD · [UserEmail] = USERPRINCIPALNAME() · Eine Rolle für alle. Filter wird zur Laufzeit anhand der angemeldeten Identität ausgewertet.

RLS auf Dimensionen · PERFORMANT · EMPFOHLEN · Dim_User[Email] = USERPRINCIPALNAME() · Filter auf Dimension; propagiert über Beziehungen zur Faktentabelle.

### Statische RLS

*RLS · METHODE 1*

Die einfachste Form: Hardcodierte Filter pro Rolle. Funktioniert, skaliert aber schlecht.

#### Funktionsweise

Pro Rolle wird ein DAX-Filter definiert. Anwender werden den Rollen zugewiesen — sie sehen nur Daten, die ihr Filter durchlässt.

#### Rolle erstellen

In Power BI Desktop: Modeling-Tab → "Manage roles" → "New" → Rollenname (z. B. "Region Süd").

#### Filter definieren

Tabelle wählen (z. B. `dim_region`) → Filter-Ausdruck:

```dax
[RegionName] = "Süd"
```

![Power BI Desktop Manage Security Roles Dialog mit Tabellen-Auswahl und Default-Editor für RLS-Filter](https://learn.microsoft.com/power-bi/includes/media/rls-desktop-define-roles/powerbi-security-default-editor.png)

**Abb. · Manage Roles Dialog (Default Editor)** Tabellen-Auswahl links, Filter-Ausdruck rechts. "Switch to DAX editor" für komplexere Ausdrücke. Quelle: [RLS · Microsoft Learn](https://learn.microsoft.com/fabric/security/service-admin-row-level-security)

#### Test

Modeling → "View as" → Rolle auswählen → der Bericht filtert sich, als wäre der Anwender in dieser Rolle.

#### Im Service Anwender zuweisen

Bericht publishen → im Service: Dataset → "Security" → Rolle auswählen → User oder Sicherheitsgruppe hinzufügen.

> **Praxis-Beispiel:** Drei Regionen, drei Rollen:
>
> - "Region Nord" mit Filter `dim_region[Name] = "Nord"`
> - "Region Süd" mit Filter `dim_region[Name] = "Süd"`
> - "Region West" mit Filter `dim_region[Name] = "West"`
>
> Jeder Anwender wird der entsprechenden Rolle zugewiesen. Sieht nur seine Region.

#### Vor- und Nachteile

| Pro | Contra |
| --- | --- |
| Einfach zu verstehen | Eine Rolle pro Filter-Variante |
| Klare Filter-Logik | Bei 50 Regionen: 50 Rollen — unwartbar |
| Test einfach (View as) | Manuelle Anwender-Zuweisung pro Rolle |

> **Wann statische RLS?** Wenn die Anzahl der Filter-Varianten klein und stabil ist (z. B. 3–5 Regionen, einige Abteilungen). Bei mehr → dynamische RLS.

### Dynamische RLS · Goldstandard

*RLS · METHODE 2*

Eine Rolle für alle Anwender. Filter wird zur Laufzeit anhand der angemeldeten Identität ausgewertet. Skaliert auf beliebige Anzahl von Anwendern.

#### Funktionsweise

Eine Berechtigungstabelle verbindet Anwender (per E-Mail) mit Daten-Filtern. Der RLS-Filter nutzt `USERPRINCIPALNAME()` — eine DAX-Funktion, die die E-Mail des aktuell angemeldeten Anwenders zurückgibt.

#### Modell-Setup

Neue Dimension: `dim_berechtigung`

```
UserEmail        | Region
max@firma.de    | Nord
max@firma.de    | West
anna@firma.de    | Süd
chef@firma.de    | Nord
chef@firma.de    | Süd
chef@firma.de    | West
```

Beziehung: `dim_berechtigung[Region]` → `dim_region[Name]`.

#### Eine Rolle definieren

Modeling → Manage roles → "DynamicRLS". Filter auf `dim_berechtigung`:

```dax
[UserEmail] = USERPRINCIPALNAME()
```

![Power BI Desktop Manage Security Roles Dialog mit DAX-Editor und beispielhaftem DAX-Filterausdruck](https://learn.microsoft.com/power-bi/includes/media/rls-desktop-define-roles/powerbi-security-dax-editor.png)

**Abb. · DAX Editor in Manage Roles** Für dynamische Filter mit USERPRINCIPALNAME() / USERNAME() ist der DAX-Editor Pflicht (Switch to DAX editor). Mit IntelliSense und Syntax-Validierung. Quelle: [RLS · Microsoft Learn](https://learn.microsoft.com/fabric/security/service-admin-row-level-security)

#### Filter propagiert über Beziehungen

Wenn der Anwender Max sich anmeldet, filtert die Rolle `dim_berechtigung` auf seine Zeilen. Die Beziehung zu `dim_region` filtert die Regionen entsprechend. Die Beziehung zur Faktentabelle filtert die Verkaufsdaten.

#### Im Service einmal zuweisen

Eine Rolle, alle Anwender werden ihr zugewiesen (am besten via Sicherheitsgruppe "alle Vertriebsmitarbeiter"). Pflege passiert ausschließlich in der Berechtigungstabelle.

> **Praxis-Beispiel · Skalierung:** 500 Vertriebsmitarbeiter, jeder hat eigene Kunden-Zuordnung. Berechtigungstabelle aus dem CRM-System geladen: 50 000 Zeilen (jeder MA × seine Kunden). Eine RLS-Rolle, alle 500 MA als Mitglieder. Wenn ein neuer MA dazukommt: CRM-Datenpflege, beim nächsten Refresh ist er drin. **Null Aufwand in Power BI.**

#### Bidirektionale Beziehung manchmal nötig

Wenn die Berechtigung über mehrere Tabellen propagiert, muss eine Beziehung bidirektional sein. Vorsicht: bidirektional ist Performance- und Sicherheits-Risiko. **Nur bei dynamischer RLS und nur nach Test.**

> **Anfänger-Falle:**
>
> `USERPRINCIPALNAME()` mit Test-User in Desktop testen. In Desktop liefert die Funktion die echte UPN des Entwicklers — Tests funktionieren nur eingeschränkt. Im Service: "Test as role" mit einem konkreten User-Account. Nach dem Publish: aus dem Service heraus testen.

> **Tipp:** UserPrincipalName ist üblicherweise die E-Mail-Adresse, aber nicht immer. In Azure AD können sie abweichen. Bei Tests die UPN explizit prüfen.

### View As Role — Pflicht vor Production

*RLS · VALIDIERUNG*

RLS testen, bevor sie publiziert wird. Wer das vergisst, riskiert Datenlecks.

#### In Desktop

Modeling-Tab → "View as" → "Other user" und/oder eine Rolle wählen → "OK".

![Power BI Desktop View as roles Dialog mit Auswahl-Optionen für Rollen und Other user](https://learn.microsoft.com/power-bi/includes/media/rls-desktop-view-as-roles/powerbi-desktop-rls-view-as-roles-dialog.png)

**Abb. · "View as" Dialog im Modeling-Tab** Rolle und/oder konkreten User simulieren — Bericht filtert sich entsprechend. Quelle: [RLS Guidance · Microsoft Learn](https://learn.microsoft.com/power-bi/guidance/rls-guidance)

#### Bericht überprüfen

Alle Visuals werden gefiltert, als ob der gewählte User angemeldet wäre. Werte prüfen: sind sie korrekt?

#### Edge Cases testen

- User ohne Berechtigung — sollte leere Visuals sehen oder Hinweis
- User mit voller Berechtigung — sollte alles sehen
- User mit Teil-Berechtigung — sollte exakt seine Daten sehen

#### Im Service erneut testen

Nach dem Publish: im Service Dataset → Security → "..." neben einer Rolle → "Test as role". Test direkt im Service-Kontext.

#### Wichtig: RLS gilt nur für Viewer

Microsoft Learn ist eindeutig: Workspace-Rollen Admin, Member und Contributor **umgehen RLS**. Nur Viewer-Rolle oder App-Konsumenten sind RLS-gefiltert.

> **Praxis-Beispiel · Test-Matrix:** Vor jedem PROD-Deploy ein Test mit drei Personas:
>
> — Standardmitarbeiter (Region Nord) → sieht nur Nord
>
> — Manager (mehrere Regionen) → sieht alle zugewiesenen Regionen
>
> — Externer Tester ohne Eintrag → sieht keine Daten
>
> Wenn diese drei Tests passen, ist die RLS-Logik robust.

> **Tipp:** Testen schon in DEV-Phase, nicht erst vor Production. Wenn RLS-Probleme spät auffallen, ist die Reparatur aufwendig.

> **Anfänger-Falle:** "Ich bin Admin im Workspace, also sehe ich alles — Test im Service zeigt mir aber gefilterte Daten." Wenn das passiert: Test über "Test as role" macht es richtig. Direkter Konsum durch Admin: keine Filter.

### RLS-Performance

*RLS · PERFORMANCE*

RLS-Filter werden auf jede Abfrage angewendet. Schlecht designte RLS macht den ganzen Bericht langsam.

#### Drei Performance-Regeln

1. **Filter auf Dimensionen, nicht auf Faktentabelle**
2. **Integer-Schlüssel statt Text**
3. **Bidirektional vermeiden, wenn möglich**

#### 1. Dimension vs. Faktentabelle

```dax
// Schlecht — auf 50 Mio Zeilen filtern
fact_verkauf[Region] = USERPRINCIPALNAME()

// Gut — auf kleine Dimension filtern
dim_region[UserEmail] = USERPRINCIPALNAME()
```

Die Faktentabelle hat Millionen Zeilen, die Dimension einige Hundert. Filter auf die Dimension propagiert über die Beziehung — viel schneller.

#### 2. Integer statt Text

VertiPaq verarbeitet Integer-Spalten massiv schneller als Text-Spalten. Wenn möglich: Berechtigungstabelle nutzt Integer-IDs statt Text-Schlüssel.

#### 3. Bidirektional sparsam

Bidirektionale Beziehungen multiplizieren den Filter-Aufwand. RLS mit bidirektional kann den Bericht massiv verlangsamen. Im Zweifel: alternativen Pfad finden.

> **Praxis-Beispiel · Performance-Diagnose:** Bericht lädt ohne RLS in 2 Sekunden, mit RLS in 30 Sekunden. Mit DAX Studio messen: welcher Teil ist langsam? Wenn der Filter-Setup viel Zeit kostet — RLS-Filter zu komplex. Vereinfachen oder Modell anpassen.

> **Anfänger-Falle:** RLS testen nur mit einem User. Bei 5 000 Anwendern mit individuellen Berechtigungs-Zeilen wird die Abfrage langsamer. Mit größerer Berechtigungstabelle testen.

> **Tipp · Aggregation Cache:** Bei großen RLS-Modellen und Premium-Capacity: User Defined Aggregations (siehe Sektion 10) können vorberechnete Aggregate cachen, die unabhängig von RLS-Filtern sind. Beschleunigt drastisch.

### Object-Level Security (OLS)

*RLS · ERWEITERT*

RLS schützt Zeilen — OLS schützt ganze Spalten oder Tabellen. Brauchst du, wenn bestimmte Anwender bestimmte Informationen **gar nicht** sehen sollen.

#### Unterschied RLS vs. OLS

| RLS | OLS |
| --- | --- |
| Filtert Zeilen | Versteckt Spalten / Tabellen |
| "Du siehst nur deine Region" | "Du siehst die Gehalts-Spalte nicht" |
| In Power BI Desktop einrichtbar | NUR über Tabular Editor (extern) |

#### OLS-Einrichtung

OLS ist nicht in Power BI Desktop direkt einrichtbar — du brauchst **Tabular Editor 2** (kostenfrei, siehe Sektion 10).

#### Tabular Editor öffnen

Tabular Editor mit dem Modell verbinden (in Desktop: External Tools → Tabular Editor).

#### Rolle wählen

"Roles"-Bereich → eine bestehende Rolle wählen oder neue erstellen.

#### Object-Level Security setzen

Im Properties-Pane einer Rolle: "Object-Level Security" → Tabelle oder Spalte wählen → "None" (versteckt) oder "Read" (sichtbar).

#### Speichern und in Desktop neu öffnen

Tabular Editor speichern → das Modell schließen und in Desktop wieder öffnen. OLS-Regeln sind aktiv.

> **Praxis-Beispiel · Gehälter-Spalte verstecken:** HR-Modell mit Mitarbeiter-Tabelle inklusive Gehalts-Spalte. Rolle "Standard-User" bekommt OLS-Regel: Gehalts-Spalte = None. Anwender mit dieser Rolle sehen die Spalte gar nicht — sie ist nicht auswählbar, taucht in keinem Visual auf. Nur Rolle "HR" sieht sie.

> **Anfänger-Falle:** OLS funktioniert nicht mit allen Spalten-Typen sauber. Bei Spalten, die in Beziehungen verwendet werden, können Errors auftreten. Vor Production-Deploy gründlich testen.

> **Wann OLS?** Wenn Compliance-Vorgaben es verlangen — z. B. DSGVO oder branchenspezifische Vorgaben für Gehalts-, Gesundheits- oder Finanzdaten. Bei normalen Berechtigungen reicht RLS oder Ausblenden im Visual.

### Sicherheitsgruppen statt Einzelpersonen

*RLS · VERWALTUNG*

Microsoft empfiehlt explizit: bei RLS keine einzelnen Personen zuweisen, sondern Microsoft-Entra-Sicherheitsgruppen.

#### Warum Gruppen?

- **Wartbarkeit** — Mitarbeiterwechsel: nur die Gruppe pflegen, nicht jeden Bericht
- **Konsistenz** — gleiche Gruppe für mehrere Berichte, gleiche Berechtigung überall
- **Audit** — IT kann zentral nachvollziehen, wer wo Zugriff hat
- **Compliance** — Berechtigungs-Management folgt Unternehmens-Standards

#### Gruppen-Konzept abstimmen

Mit IT/HR klären: welche Gruppen existieren? Welche stehen für welche Berechtigungs-Stufen? Oft gibt es bereits Gruppen wie "alle Vertriebsmitarbeiter", "Vertriebsleitung", etc.

#### RLS-Rolle anlegen

Wie in "Dynamische RLS" beschrieben — eine Rolle mit USERPRINCIPALNAME-Filter.

#### Im Service: Gruppe zuweisen

Dataset → Security → Rolle auswählen → "+ Add user, group, or service principal" → Gruppe suchen → Add.

> **Praxis-Beispiel · Mitarbeiterwechsel:** Max verlässt das Unternehmen, Lisa kommt neu. Mit Personen-Zuweisung: bei 12 Berichten manuell Lisa hinzufügen und Max entfernen. Mit Gruppen-Zuweisung: HR fügt Lisa zur Gruppe "Vertrieb Nord" hinzu und entfernt Max — alle 12 Berichte automatisch aktualisiert. 12 manuelle Schritte gespart.

#### Hybrid: Personen UND Gruppen

Manchmal sinnvoll: Gruppe als Standard + Einzelne Personen für Ausnahmen. Aber: Ausnahmen kosten Wartung. So sparsam wie möglich.

> **Anfänger-Falle:** Eigene "BI-Gruppen" anlegen, parallel zur IT-Gruppen-Struktur. Doppelte Pflege. Lieber bestehende Gruppen nutzen, auch wenn sie nicht perfekt für BI-Zwecke designed sind.

### Bidirektionale Filter mit RLS

*RLS · VORSICHT*

In manchen RLS-Setups unvermeidbar — aber mit Performance- und Sicherheits-Risiken. Vorsichtig einsetzen.

#### Wann nötig?

Wenn der RLS-Filter über mehrere Beziehungen propagieren muss und die Standard-Single-Direction nicht ausreicht. Typisches Szenario:

```
dim_berechtigung[UserEmail] → dim_kunde[KundenID]
                                    ↓ (1:n)
                              fact_verkauf
```

Filter aus `dim_berechtigung` muss zu `dim_kunde` kommen. Wenn die Beziehung `dim_berechtigung` → `dim_kunde` nur Single-Direction (von berechtigung zu kunde) ist, und beide Tabellen auf der "1"-Seite zur Faktentabelle stehen, klappt es nicht. Bidirektional macht den Filter durchgängig.

#### Was im Modell ändern

1. Beziehung im Modell-View doppelklicken
2. "Cross filter direction" auf "Both" setzen
3. "Apply security filter in both directions" aktivieren

![Power BI Edit Relationship Dialog mit Apply security filter in both directions Checkbox](https://learn.microsoft.com/fabric/includes/media/powerbi-security-apply-filter-in-both-directions.png)

**Abb. · "Apply security filter in both directions"** Zusätzlich zur bidirektionalen Cross-Filter-Richtung muss diese Checkbox aktiv sein, damit RLS-Filter in beide Richtungen propagieren. Quelle: [Microsoft Learn](https://learn.microsoft.com/fabric/security/service-admin-row-level-security)

#### Risiken

- **Performance** — Filter wird in beide Richtungen evaluiert, kann Queries verlangsamen
- **Mehrdeutigkeit** — bei komplexen Modellen kann die Engine nicht eindeutig auflösen
- **Sicherheit** — falsche bidirektionale Filter können ungewollt Daten freigeben

> **Praxis-Beispiel · sauber testen:** Bidirektionalen Filter eingeführt → mit drei Personas testen:
>
> - User mit eingeschränkter Berechtigung — sieht er nur seine Daten?
> - User ohne Berechtigung — sieht er gar nichts?
> - User mit Vollberechtigung — sieht er alles?
>
> Wenn alle drei Tests passen, ist die bidirektionale RLS sicher.

> **Anfänger-Falle:** Bidirektional als "Standard-Lösung bei Problemen" einsetzen. Meistens ist nicht die Richtung das Problem, sondern das Modell. Erst die Modell-Struktur überprüfen.

### RLS-Anti-Patterns

*RLS · FALLSTRICKE*

Fünf häufige Fehler, die RLS-Setups unsicher oder unbrauchbar machen.

#### 1. LOOKUPVALUE statt Beziehung

```dax
// Schlecht — LOOKUPVALUE im RLS-Filter
[Region] = LOOKUPVALUE(
  dim_berechtigung[Region],
  dim_berechtigung[UserEmail], USERPRINCIPALNAME()
)
```

Funktioniert, ist aber langsam und versteckt die Logik. Besser: Berechtigungstabelle mit Beziehung modellieren.

#### 2. Filter auf Faktentabelle

RLS-Filter direkt auf die Faktentabelle anwenden:

```dax
fact_verkauf[Region] = USERPRINCIPALNAME()
```

Performance-Desaster bei großen Faktentabellen. Filter auf Dimensionen, propagieren lassen.

#### 3. Admin-Test als Validierung

"Ich bin Admin, sehe alles, also funktioniert RLS" — Admin sieht **alle** Daten, weil Admin-Rolle RLS umgeht. Test muss mit Viewer-Rolle oder "Test as role" erfolgen.

#### 4. Personal Workspace

RLS in einem persönlichen "My Workspace" — funktioniert nicht für andere Anwender. RLS gilt erst, wenn der Bericht in einen geteilten Workspace publiziert wird.

#### 5. Fehlende Edge Cases

RLS funktioniert für die Hauptfälle, aber:

- Was sieht ein User, der gar nicht in der Berechtigungstabelle steht? → leere Visuals oder Fehler?
- Was sieht ein User mit mehrfachen Einträgen? → korrekte Union der Berechtigungen?
- Was passiert beim Refresh der Berechtigungstabelle? → bleibt die Sicht aktuell?

> **Praxis-Beispiel · Edge Case "User ohne Eintrag":** Ein User wird in HR angelegt, aber noch nicht in der BI-Berechtigungstabelle. Login in Power BI → RLS findet keinen Eintrag → leerer Bericht. Anwender ist verwirrt.
>
> Lösung: in der Berechtigungstabelle eine Default-Zeile oder im Bericht einen Hinweis-Text: "Keine Berechtigung. Wende dich an: bi@firma.de"

> **Tipp · RLS-Logik dokumentieren:** Im Modell die RLS-Regeln dokumentieren — welche Rolle, welche Filter, welche User-Gruppe. In 6 Monaten kommt jemand anders, der das pflegen muss.

## 10 · Erweitert & *Externe Tools*

Power BI Desktop ist mächtig, aber die Community-Tools heben das Niveau. Tabular Editor 2 ist der Goldstandard für Modellierung, DAX Studio für Performance-Analyse. Profis nutzen sie täglich.

> Als erstes: **Tabular Editor 2** herunterladen und einrichten — kostenfrei, Open Source, ändert deinen Workflow. Dann **DAX Studio** für Performance-Diagnose. Beides sind Pflicht-Tools für jeden, der über 1 Jahr Power BI macht.

### Inkrementelle Aktualisierung

*TOOLS · REFRESH*

Statt jedes Mal die gesamte Faktentabelle neu zu laden: nur die geänderten und neuen Daten. Bei großen Modellen reduziert das Refresh-Zeit von Stunden auf Minuten.

#### Voraussetzungen

- Premium-, PPU- oder Fabric-Capacity (NICHT mit Standard-Pro)
- Datenquelle, die Query Folding unterstützt
- Datums-Spalte in der Faktentabelle, nach der gefiltert werden kann

#### Funktionsweise

Du definierst zwei Parameter in Power Query: `RangeStart` und `RangeEnd`. Die Faktentabelle wird darauf gefiltert. Im Service teilst du die Tabelle in **Archivpartitionen** (alte Daten, nie neu geladen) und **Inkrement-Partitionen** (letzte X Tage, regelmäßig aktualisiert).

#### Parameter erstellen

Power Query Editor → Manage Parameters → New:

- `RangeStart` — Type: Date/Time, Current Value: ein altes Datum (z. B. 1.1.2020)
- `RangeEnd` — Type: Date/Time, Current Value: ein zukünftiges Datum

#### Faktentabelle filtern

In der Faktentabelle: Datums-Spalte filtern "is between" → Parameter `RangeStart` bis `RangeEnd` verwenden.

#### Inkrementelle Aktualisierung definieren

In Desktop: Modeling → Inkrementelle Aktualisierung → Tabelle wählen → aktivieren. Konfiguration:

- **Daten archivieren**: z. B. 5 Jahre (Archivpartitionen)
- **Daten inkrementell aktualisieren**: z. B. 7 Tage (Inkrement)
- **Nur Datenzeilen erkennen, die sich geändert haben** (optional)

#### Publish und ersten Refresh abwarten

Beim ersten Refresh im Service werden die Archivpartitionen einmalig befüllt — dauert lange. Ab dann sind nur Inkrement-Partitionen jeden Refresh dran — schnell.

> **Praxis-Beispiel · Performance-Gewinn:** Faktentabelle mit 5 Jahren Verkaufsdaten, 200 Mio Zeilen. Vollständiger Refresh: 4 Stunden. Mit inkrementeller Aktualisierung (Archiv 5 Jahre, Inkrement 7 Tage): erster Refresh 4 Stunden, dann täglich 8 Minuten. Faktor 30 schneller.

> **Anfänger-Falle:** Ohne Query Folding einsetzen. Wenn die Quelle nicht foldet, kann Power BI die Inkrement-Filter nicht effizient anwenden — die Filterung passiert nach dem vollständigen Laden. Folding ist Pflicht für inkrementelle Aktualisierung.

### Dataflows

*TOOLS · WIEDERVERWENDUNG*

Power Query in der Cloud. Eine Aufbereitung — viele Datasets können sie konsumieren. Ideal für zentralisierte ETL-Logik.

#### Was ist ein Dataflow?

Ein Dataflow ist eine Power-Query-basierte Datenaufbereitung, die im Service läuft (nicht in Desktop). Das Ergebnis wird als Tabellen im Power BI Service (oder ADLS) gespeichert. Andere Datasets können diese Tabellen importieren — ohne die Power Query erneut zu schreiben.

#### Wann lohnt sich ein Dataflow?

- **Gemeinsame Stammdaten** — Kunden-, Produkt-, Datums-Dimension einmal zentral aufbereitet
- **Komplexe ETL** — Logik, die mehrere Datasets nutzen sollen
- **Performance-Trennung** — Datenaufbereitung im Dataflow läuft separat, belastet das Dataset nicht
- **Power-Query-Wiederverwendung** — DRY-Prinzip für Power Query

#### Dataflow erstellen

Im Service: Workspace → "New" → Dataflow → Web-basierter Power Query Editor öffnet sich.

#### Tabellen entwickeln

Wie in Desktop: Quellen anbinden, transformieren, Modell-Tabellen vorbereiten. Save → Refresh.

#### Im Desktop konsumieren

Get Data → "Power BI Dataflows" → den Dataflow wählen → Tabellen importieren. Datasets können den Dataflow als Datenquelle nutzen.

#### Dataflow Gen2 (Fabric)

Mit Fabric kam Dataflow Gen2 — moderner, mit verbesserter Performance, Daten landen in OneLake als Delta-Tabellen, von dort von vielen Workloads lesbar (nicht nur Power BI).

> **Praxis-Beispiel · zentralisierte Datums-Dimension:** Statt in jedem Power-BI-Modell die Datums-Dimension neu in M-Code zu generieren: ein Dataflow "Master-Datums-Dimension" zentral. Alle Datasets importieren diesen Dataflow. Wenn das Geschäftsjahr-Logik geändert wird: einmal im Dataflow, alle Datasets ziehen mit.

> **Anfänger-Falle:** Jeden Power-Query-Schritt in einen Dataflow auslagern, weil "modern". Dataflows haben Overhead — Refresh-Logik, Storage, Latenz. Für kleine Modelle: in Desktop bleiben. Für Wiederverwendung über mehrere Modelle: lohnt sich.

### Composite Models & Aggregations

*TOOLS · HYBRID*

Import und DirectQuery in einem Modell mischen. Performance fast wie Import, Aktualität fast wie DirectQuery — bei massiv großen Datenmengen die einzige Lösung.

#### Was ist ein Composite Model?

Ein Modell, in dem manche Tabellen im Import-Modus sind, andere im DirectQuery-Modus. Microsoft hat 2018 die Funktion eingeführt und 2020 erweitert (Composite Models über Datasets).

#### Typisches Szenario

- Faktentabelle "Detail" (500 Mio Zeilen) — **DirectQuery**
- Faktentabelle "Aggregat" (1 Mio Zeilen vorberechnete Tages-Summen) — **Import**
- Dimensionen — **Dual** (kann beide Modi)

Power BI entscheidet automatisch, welche Tabelle für welche Query genutzt wird. Visual auf Tageswert-Niveau → schnelles Import-Aggregat. Visual mit Drill auf Detail → DirectQuery.

#### User Defined Aggregations

Microsoft führte 2018 dieses Feature ein. Du sagst Power BI: "Diese Aggregat-Tabelle ist die vorberechnete Version dieser Detail-Tabelle". Power BI sucht für jede Query automatisch die billigste Quelle.

#### Detail-Tabelle in DirectQuery

Get Data → DirectQuery zur großen Faktentabelle.

#### Aggregat in Import

Aggregat-Tabelle (z. B. `fact_verkauf_tag`) als separate Quelle in Import.

#### Aggregat definieren

Modeling → "Manage aggregations" → Aggregat-Tabelle mit Detail-Tabelle verknüpfen, Mapping pro Spalte definieren (Detail.Datum → Aggregat.Datum, etc.).

#### Test

Performance Analyzer (siehe ext-bestpr) zeigt, welche Tabelle für welche Query genutzt wurde.

> **Praxis-Beispiel:** 500 Mio Zeilen Detail-Daten. Tagesumsatz-Visual nutzt vorberechnetes Aggregat (1 Mio Zeilen) → 0,3 Sekunden. Wer drillt auf Transaktions-Niveau, geht über DirectQuery in die echte Detail-Tabelle → 5 Sekunden. Aggregations sparen 90 % der Queries die DirectQuery-Latenz.

> **Anfänger-Falle:** Composite Models bei kleinen Datenmengen einsetzen. Komplexität ohne Nutzen. Erst ab Datenmengen, die im reinen Import nicht mehr passen (üblicherweise 100 Mio+ Zeilen).

### Tabular Editor — der Goldstandard

*TOOLS · MODELLIERUNG*

Drittwerkzeug, das Power BI Desktop in Sachen Modellierung deutlich übertrifft. TE2 ist kostenfrei und Open Source. Pflicht-Tool für ernsthafte Power-BI-Arbeit.

#### Was Tabular Editor besser kann

- **Bulk-Operationen** — 50 Measures auf einmal umbenennen, formatieren, mit Display Folder versehen
- **Display Folders** — Measures in Ordnern gruppieren (in Desktop unmöglich)
- **Calculation Groups** — wiederverwendbare Measure-Logik (nur über TE definierbar)
- **Object-Level Security** — siehe rls-ols
- **Best Practice Analyzer** — siehe ext-bpa
- **Skripting** — C#-Snippets für Automatisierung
- **Schneller** — nicht UI-getrieben wie Desktop

#### TE2 vs. TE3

| Tabular Editor 2 | Tabular Editor 3 |
| --- | --- |
| Kostenfrei, Open Source | Kommerziell (Abo, Preis je Edition) |
| Reicht für 90 % der Aufgaben | UI-Komfort, DAX-Debug, Visual DAX-Diff |
| Empfohlen für Einsteiger | Lohnt sich für Power-User |

#### TE2 installieren

Download von `github.com/TabularEditor/TabularEditor`. Installieren. TE2 erscheint in Power BI Desktop unter External Tools.

#### Mit Modell verbinden

In Desktop: External Tools → Tabular Editor. TE2 öffnet sich, mit dem aktuellen Modell verbunden.

#### Beispiel · Bulk-Format

In TE2: alle Measures markieren (Tabellenansicht) → Properties → Format String setzen auf "#,##0" → Save. Alle markierten Measures haben jetzt das Format.

#### Beispiel · Display Folder

Measure auswählen → Properties → "Display Folder" auf "Umsatz / KPIs" setzen. In Desktop erscheint die Measure in einem Ordner gruppiert.

> **Praxis-Beispiel · Calculation Groups:** Statt 20 Measures wie `[Umsatz YTD]`, `[Marge YTD]`, `[Umsatz Vorjahr]`, etc. zu schreiben: eine Calculation Group "Time" mit Items "YTD", "Vorjahr", "MTD" — jedes Item modifiziert die Standard-Measure. Anwender wählt im Slicer das Item. Drastisch weniger Code.

> **Tipp:** Sobald du mehr als 20 Measures hast oder Display Folder brauchst: TE2 installieren. Lohnt sich ab dem ersten ernsthaften Projekt.

### DAX Studio — Performance-Diagnose

*TOOLS · PERFORMANCE*

Was im Hintergrund deines Berichts passiert. Query-Plan, Server Timings, VertiPaq Analyzer — die Werkzeuge der Profis.

#### Was DAX Studio kann

- **DAX-Queries direkt absetzen** — testen, ohne in Desktop zu hantieren
- **Server Timings** — wie lange dauert eine Query, wer ist langsam? Storage Engine vs. Formula Engine
- **Query Plan** — physischer und logischer Plan
- **VertiPaq Analyzer** — wie viel Speicher verbraucht welche Spalte? Welche Tabellen blähen das Modell auf?
- **Trace** — Aufzeichnen aller Queries, die ein laufender Bericht abfeuert

#### Installieren

Von `daxstudio.org`. Installieren. Erscheint in Desktop unter External Tools.

#### Performance einer Measure messen

External Tools → DAX Studio → "Server Timings" aktivieren → eine Test-Query schreiben:

```dax
EVALUATE
SUMMARIZECOLUMNS(
  dim_region[Name],
  "Umsatz", [Umsatz]
)
```

Run drücken → Server Timings zeigt: Storage Engine ms, Formula Engine ms.

#### VertiPaq-Analyse

Advanced-Tab → View Metrics. Zeigt pro Tabelle/Spalte: Speicherverbrauch, Kardinalität, Dictionary-Größe. Identifiziert Speicher-Fresser.

#### Storage Engine vs. Formula Engine

| Storage Engine (SE) | Formula Engine (FE) |
| --- | --- |
| Liest komprimierte Daten | Berechnet DAX-Logik |
| Parallel, sehr schnell | Single-threaded, langsamer |
| Wenn SE langsam → Modell zu groß / Filter ungünstig | Wenn FE langsam → DAX-Code zu komplex |

> **Praxis-Beispiel:** Eine Measure dauert 5 Sekunden. Server Timings: 800 ms SE, 4200 ms FE. → DAX-Code ist das Problem. Bei FILTER-Funktion in CALCULATE-Argumenten? Bei verschachtelten Iteratoren? Code refactoren.

> **Tipp · Performance Analyzer in Desktop:** Desktop hat einen eingebauten Performance Analyzer (View → Performance Analyzer). Klick "Start recording", durch den Bericht navigieren, dann die Queries der einzelnen Visuals ansehen. Die langsamsten Queries dann in DAX Studio analysieren.

### Best Practice Analyzer (BPA)

*TOOLS · QUALITÄT*

Automatische Qualitätsprüfung gegen ein Regelwerk. Findet typische Modell-Probleme, bevor sie produktiv werden.

#### Was prüft BPA?

- Fehlende Format Strings auf Measures
- Auto-Date/Time aktiv (oft unbeabsichtigt)
- Float-Datentypen statt Decimal Currency
- Bidirektionale Beziehungen ohne Notwendigkeit
- Calculated Columns, die als Measure besser wären
- Fehlende Beziehungen zwischen Tabellen
- Spalten in Faktentabellen, die in Dimensionen gehören
- Implizite Measures
- ~80 weitere Regeln

#### BPA installieren

BPA läuft im Tabular Editor. Microsoft pflegt ein Standard-Regelset auf GitHub.

#### Regelset herunterladen

In Tabular Editor 2: Tools → Manage BPA Rules → "Load from..." → "Microsoft Best Practice Rules" auswählen (kann auch aus GitHub geladen werden: `github.com/microsoft/Analysis-Services/tree/master/BestPracticeRules`).

#### Analyse starten

Tools → Best Practice Analyzer → Run. Liste von Verstößen erscheint, sortiert nach Severity.

#### Findings korrigieren

Jeden Befund anklicken → "Generate fix script" (wenn vorhanden). TE führt die Korrektur automatisch durch. Bei manuellen Korrekturen: Spalte/Measure ändern, BPA erneut laufen lassen.

#### Vor Production-Deploy

BPA als Schritt im Release-Prozess. Wenn BPA fehlerfrei ist, ist das Modell auf einem hohen Qualitätsniveau.

> **Praxis-Beispiel:** Neu übernommenes Modell. BPA-Lauf zeigt 47 Findings:
>
> - 23 × fehlende Format Strings → "Generate fix script" → automatisch korrigiert
> - 5 × Auto-Date/Time aktiv → manuell deaktivieren
> - 8 × Float statt Currency → datatype umstellen
> - 4 × unnötige bidirektionale Beziehungen → prüfen, umstellen
> - 7 × andere
>
> Modell ist nach 1 Stunde Cleanup auf BPA-konformem Niveau.

> **Tipp · eigene Regeln:** BPA-Regeln sind C#-Snippets. Eigene Regeln definierbar für unternehmensspezifische Standards. Z. B. "alle Measures müssen Display Folder haben" oder "alle Tabellen müssen Description haben".

### Copilot in Power BI

*TOOLS · KI*

KI-Unterstützung für Power BI: DAX schreiben, Berichte aus Beschreibungen generieren, Q&A-Fragen formulieren. Funktioniert nicht überall.

#### Was Copilot kann

- **DAX schreiben** — natürliche Sprache → DAX-Code: "Erstelle eine Measure für den Umsatz Year-over-Year"
- **Bericht-Generierung** — aus einer Beschreibung einen ersten Bericht-Vorschlag
- **Q&A-Erweiterung** — natürlichsprachliche Fragen werden besser interpretiert
- **Bericht-Zusammenfassung** — automatische Text-Insights zu einem Bericht

#### Voraussetzungen

- Fabric F64+ Capacity ODER PPU-Lizenz
- Modell muss vom Admin freigegeben sein für Copilot
- Aktuell viele Funktionen in Preview, ändern sich monatlich

#### Realistische Erwartung

Copilot ist **Hilfsmittel, nicht Ersatz**. Was es liefert, ist ein erster Vorschlag — der gegengeprüft werden muss. Bei einfachen Measures funktioniert es gut, bei komplexer Geschäftslogik versagt es regelmäßig.

> **Praxis-Beispiel · DAX-Vorschlag:** Anwender tippt: "Erstelle eine Measure, die den Umsatz in den letzten 90 Tagen zeigt."
>
> Copilot generiert:
>
> ```dax
> Umsatz 90T = CALCULATE([Umsatz],
>   DATESINPERIOD('Datum'[Datum],
>     LASTDATE('Datum'[Datum]), -90, DAY))
> ```
>
> Funktioniert für das Standard-Szenario. Wenn Geschäftsjahr-Logik oder ungewöhnliche Datumsdefinition: Anwender muss anpassen.

> **Anfänger-Falle:** Copilot-Output ungeprüft übernehmen. Bei komplexer Logik produziert er regelmäßig syntaktisch korrekten, aber semantisch falschen Code. Immer gegenprüfen, am besten mit Testdaten.

> **Tipp · Roadmap im Blick:** Copilot-Funktionen ändern sich schnell. Microsoft veröffentlicht monatliche Updates. Bei ernsthafter Nutzung: aktuelle Roadmap und Release Notes prüfen.

### Microsoft Fabric

*TOOLS · PLATTFORM*

Die Plattform-Erweiterung von Power BI. Statt isolierter BI-Lösung: ein einheitlicher Data Stack mit Data Engineering, Data Science, Real-Time und Power BI in einem.

#### Fabric-Bausteine

- **OneLake** — der einheitliche Storage (Delta-Parquet)
- **Lakehouse** — Tabellen + Dateien, SQL-fähig
- **Data Warehouse** — klassisches DWH auf OneLake
- **Data Engineering** — Spark-Notebooks, Pipelines
- **Data Factory** — Datenintegration (Dataflows Gen2)
- **Real-Time Intelligence** — Event Streams, KQL Databases
- **Data Science** — ML-Notebooks, AutoML
- **Power BI** — als Bestandteil, mit Direct Lake

#### Was ist für Power-BI-Nutzer relevant?

1. **Direct Lake** — neue Storage-Mode (siehe Architektur), schneller als DirectQuery, aktueller als Import
2. **Lakehouse als Quelle** — statt SQL Server importieren: aus Lakehouse direkt lesen
3. **Shortcuts** — Daten aus ADLS, S3 oder anderen OneLake-Tenants ohne Kopie referenzieren
4. **Git-Integration** — Workspace mit Azure DevOps/GitHub verbinden, ALM-Prozess

#### Soll man von Power BI Premium auf Fabric umstellen?

Fabric F-SKU ist der Nachfolger von Power BI Premium. Bestehende Premium-Lizenzen laufen weiter, neue Verträge typischerweise als Fabric. Für reine Power-BI-Nutzung: keine erzwungene Migration nötig — bestehende Funktionen bleiben. Wer mehr will (Data Engineering, Direct Lake): Fabric.

> **Praxis-Beispiel · Wann lohnt sich Fabric?** Unternehmen baut neue analytische Plattform auf. Optionen:
>
> — Klassisch: Azure SQL DWH + Power BI Premium → drei Tools, drei Refresh-Zyklen
>
> — Fabric: Lakehouse + Power BI Direct Lake → ein Tool, eine Daten-Quelle, automatische Aktualität
>
> Bei Greenfield-Projekten ist Fabric oft die einfachere Wahl. Bei bestehenden Systemen: gradueller Übergang.

> **Tipp · Lernreihenfolge:** Wer mit Power BI vertraut ist: erst Direct Lake verstehen, dann Lakehouse, dann Pipelines. Fabric komplett lernen ist Wochen-Aufwand — nicht alles auf einmal.

**Daten-WG dazu:**

- **[Microsoft Fabric — braucht das wirklich jemand?](https://youtu.be/mTVeZzshLzE)** · Talk · 48 min · [Knowledge Kitchen](../index.html#ep-mTVeZzshLzE)
- **[Open Mirroring in Microsoft Fabric — replizieren ohne ETL](https://youtu.be/7j34Ndng0Os)** · Tutorial · 10 min · [Knowledge Kitchen](../index.html#ep-7j34Ndng0Os)

### Performance-Optimierung

*TOOLS · ÜBERGREIFEND*

Power-BI-Modelle werden mit der Zeit langsam — größere Datenmengen, mehr Measures, mehr Visuals. Vier Werkzeuge zur Diagnose und Optimierung.

#### 1. Performance Analyzer (Desktop)

View-Tab → Performance Analyzer. "Start recording" → durch den Bericht klicken → die Queries jedes Visuals werden aufgezeichnet. Sortiert nach Dauer. Identifiziert die langsamsten Visuals.

![Power BI Desktop Performance Analyzer Pane mit aufgezeichneten Visual-Ladezeiten und DAX-Query-Durationen](https://learn.microsoft.com/power-bi/create-reports/media/desktop-performance-analyzer/performance-analyzer-04.png)

**Abb. · Performance Analyzer Pane** Pro Visual werden DAX query, Direct query, Visual display und Other Zeiten erfasst. Klick auf "Copy query" → Query in DAX Studio analysierbar. Quelle: [Performance Analyzer · Microsoft Learn](https://learn.microsoft.com/power-bi/create-reports/performance-analyzer)

#### 2. DAX Studio Server Timings

(Siehe ext-daxstudio.) Misst pro Query: Storage Engine vs. Formula Engine. Identifiziert ob Modell oder DAX-Code das Problem ist.

#### 3. VertiPaq Analyzer

In DAX Studio: Advanced → View Metrics. Zeigt Speicher-Verbrauch pro Spalte. Identifiziert Speicher-Fresser. Typische Findings:

- Hochkardinale Spalten (z. B. eindeutige IDs als Text) — viel Dictionary-Speicher
- Decimal/Currency vs. Float — Float ist meist überdimensioniert
- Text-Spalten mit langen Werten

#### 4. Best Practice Analyzer (Tabular Editor)

(Siehe ext-bpa.) Automatische Regel-Prüfung gegen Microsoft-Standards.

#### Optimierungs-Checkliste

1. **Power Query:** Folding maximieren (Sektion 3)
2. **Datentypen:** Currency statt Float, Int statt Text wo möglich
3. **Auto-Date/Time:** deaktivieren
4. **Unnötige Spalten:** entfernen — VertiPaq braucht nur, was tatsächlich verwendet wird
5. **Stern-Schema:** Snowflake vermeiden, Granularität sauber
6. **DAX:** Variables nutzen, FILTER richtig verwenden
7. **Visuals:** komplexe Visuals (Tabellen mit 50 Spalten) zerlegen
8. **Inkrementelle Aktualisierung:** bei großen Modellen aktivieren
9. **Aggregations:** für DirectQuery-Bottlenecks
10. **Tabular Editor:** Bulk-Cleanup mit BPA

> **Praxis-Beispiel · 4-Stunden-Optimierung:** Bestehendes Modell, Refresh 45 Minuten, Visuals langsam. Nach 4 Stunden Optimierung:
>
> - Folding wiederhergestellt → Refresh 8 Minuten
> - Float auf Currency → Modell von 800 MB auf 320 MB
> - Auto-Date/Time aus → weitere 50 MB
> - Drei komplexe DAX-Measures mit Variables → Bericht-Ladezeit von 8s auf 2s
>
> Faktor 5 schneller, Faktor 2.5 kleiner — mit Standard-Tools.

> **Tipp · monatliches Health Check:** Bei produktiven Modellen einmal im Monat: Performance Analyzer + BPA durchlaufen lassen. Findet Regressionen früh, bevor Anwender klagen.

### Aus dem Kanal · Fabric & Tooling in der Praxis

OneLake-Speicherorte, Mirroring ohne ETL und MCP Server für Power-BI-Modelling — drei Folgen für das Drumherum jenseits von Desktop.

- **[Microsoft Fabric: Wo liegen meine Daten wirklich im OneLake?](https://youtu.be/ZVVSPQj9dlc)** · Tutorial · 5 min · [Knowledge Kitchen](../index.html#ep-ZVVSPQj9dlc)
- **[Open Mirroring in Microsoft Fabric — Daten replizieren ohne ETL](https://youtu.be/7j34Ndng0Os)** · Tutorial · 10 min · [Knowledge Kitchen](../index.html#ep-7j34Ndng0Os)
- **[Unboxing MCP Server for Power BI Modelling](https://youtu.be/iinfiHxznOU)** · Deep Dive · 67 min · [Knowledge Kitchen](../index.html#ep-iinfiHxznOU)

## Beispiele · *Live Power BI Reports*

Vier produktive Reports, direkt aus dem Power BI Service eingebettet. Anklicken, Filter setzen, durch die Seiten navigieren — die Konzepte aus den Sektionen darüber in echt angewendet.

Reisekosten · Multi-Country

### Travelspendings

Beispiel-Auswertung von Reisekosten für verschiedene Länder über mehrere Jahre. Klassische BI-Storyline: Trend-Analyse, Filter pro Land, Drill von Aggregat zu Detail.

Power BI Service · Public Embed · [In neuem Tab öffnen →](https://app.powerbi.com/view?r=eyJrIjoiYjgyMjljMmEtMTQ2MC00NTdiLWI2NjYtZjlmZjg5Nzk5YjgzIiwidCI6IjI0ZWIxMGYwLTBmY2QtNGU5Ny1hMGQ0LTg0NjhhODRhOWU5MCIsImMiOjh9)

Open Data · Stadt Köln

### Stolpersteine Köln

Report über die Stolpersteine in Köln auf Basis von Open Data. Zeigt geografische Verteilung und Detail-Informationen pro Person — Power BI angewandt auf Bürgerdaten und Gedenkkultur.

Power BI Service · Public Embed · [In neuem Tab öffnen →](https://app.powerbi.com/view?r=eyJrIjoiZDZhMDhmZTUtODgzYi00OTZmLTgyZDEtNmRkOGVlZDVmZjAyIiwidCI6IjI0ZWIxMGYwLTBmY2QtNGU5Ny1hMGQ0LTg0NjhhODRhOWU5MCIsImMiOjh9)

IBCS-angelehnt · viel Interaktion

### Sales Controlling

IBCS-angelehnter Sales-Report mit reichhaltiger Interaktivität: Bookmarks, Drillthrough, Field Parameters in der Praxis. Spielwiese für alles aus Sektion 06 (IBCS) und 07 (Interaktivität) zusammen.

Power BI Service · Public Embed · [In neuem Tab öffnen →](https://app.powerbi.com/view?r=eyJrIjoiNWI1ZWVlNTgtNjdmMy00YjM3LWFkMGEtMDFiYWU4YjI5NTA0IiwidCI6IjI0ZWIxMGYwLTBmY2QtNGU5Ny1hMGQ0LTg0NjhhODRhOWU5MCIsImMiOjh9)

Custom Visuals · Von Claude Code gebaut

### Custom IBCS Viz Demo

Eigene Power-BI-Custom-Visuals — IBCS-Waterfall, KPI-Card, interaktives Gantt — ganz ohne klassisches Pflichtenheft entstanden: im Describe-Render-Refine-Loop mit Claude Code, vom HTML-Prototyp über Deneb/Vega-Lite bis zum echten `.pbiviz`.

Power BI Service · Public Embed · [In neuem Tab öffnen →](https://app.powerbi.com/view?r=eyJrIjoiZDAxYzk2YWUtMDI4My00ZWM5LTljZjAtYzkxYmUzMGJkMjRkIiwidCI6IjI0ZWIxMGYwLTBmY2QtNGU5Ny1hMGQ0LTg0NjhhODRhOWU5MCIsImMiOjh9)

### Aus dem Kanal · Reports von Grund auf

Ein knapp einstündiger Solo-Walkthrough vom leeren Power-BI-Canvas zum fertigen Report-Einreichung — Entscheidungen werden laut erklärt.

- **[Walkthrough for my first Submission to the Maven Analytics Challenge](https://youtu.be/z3eVRymUp30)** · Solo Deep Dive · 57 min · EN · [Knowledge Kitchen](../index.html#ep-z3eVRymUp30)

## Quellen & *weiterführende Literatur*

Dieser Guide stützt sich auf die offizielle Microsoft-Learn-Dokumentation, die IBCS-Standards von Hichert+Faisst und etablierte Community-Quellen (Marco Russo & Alberto Ferrari / SQLBI, Tabular-Editor- und DAX-Studio-Communities). Jede zitierte Zahl und jede Best-Practice-Empfehlung ist hier rückverfolgbar. **Quellen-Validierung Mai 2026:** Folding-Benchmark, Refresh-Limits, F-SKU-Modellgrößen, Star-Schema-Quotes, RLS-Viewer-Regel, DAX-Variables-Performance und Auto-Date/Time-Empfehlung wurden gegen Microsoft Learn verifiziert. Versionsdaten (Field Parameters Preview Mai 2022/GA Juli 2025, Sparklines Preview Dez 2021/GA Juni 2025, Small Multiples GA Juli 2021, ISO/AWI 24896 Juli 2024) sind im Text präzisiert. **Screenshots:** Die in einzelnen Modal-Karten eingebetteten Screenshots stammen direkt von Microsoft-Learn-CDN und stehen unter der Microsoft-Dokumentations-Lizenz (CC BY 4.0) zur freien Nutzung mit Quellenangabe. Da sich die Plattform monatlich weiterentwickelt, im Zweifel die jeweils aktuellste Quell-Seite konsultieren.

### Microsoft Learn · Power BI Grundlagen

- [Was ist Power BI? — Übersicht](https://learn.microsoft.com/de-de/power-bi/fundamentals/power-bi-overview)
- [Power BI Desktop — Einstieg](https://learn.microsoft.com/de-de/power-bi/fundamentals/desktop-getting-started)
- [Power BI in Microsoft Fabric](https://learn.microsoft.com/de-de/power-bi/fundamentals/fabric-power-bi)
- [Power BI Premium & Capacity](https://learn.microsoft.com/de-de/power-bi/enterprise/service-premium-what-is)
- [On-Premises Data Gateway](https://learn.microsoft.com/de-de/power-bi/connect-data/service-gateway-onprem)
- [Storage Modes: Import, DirectQuery, Direct Lake](https://learn.microsoft.com/de-de/power-bi/connect-data/service-dataset-modes-understand)

### Microsoft Learn · Power Query & Folding

- [Power Query — komplette Dokumentation](https://learn.microsoft.com/de-de/power-query/)
- [Power Query Best Practices](https://learn.microsoft.com/de-de/power-query/best-practices)
- [M-Sprache · Referenz](https://learn.microsoft.com/de-de/powerquery-m/)
- [Query Folding — Grundlagen](https://learn.microsoft.com/de-de/power-query/query-folding-basics)
- [Query Folding — Beispiele & 12×-Benchmark](https://learn.microsoft.com/de-de/power-query/query-folding-examples)
- [Step Folding Indicators](https://learn.microsoft.com/de-de/power-query/step-folding-indicators)
- [Query Plan — Tiefenanalyse](https://learn.microsoft.com/de-de/power-query/query-plan)
- [Query Folding Guidance · Power BI](https://learn.microsoft.com/de-de/power-bi/guidance/power-query-folding)
- [Merge Queries — Joins im Detail](https://learn.microsoft.com/de-de/power-query/merge-queries-overview)
- [Inkrementelle Aktualisierung](https://learn.microsoft.com/de-de/power-bi/connect-data/incremental-refresh-overview)
- [Dataflows · Einführung](https://learn.microsoft.com/de-de/power-bi/transform-model/dataflows/dataflows-introduction-self-service)

### Microsoft Learn · Datenmodellierung

- [Star-Schema — Relevanz und Anleitung](https://learn.microsoft.com/de-de/power-bi/guidance/star-schema)
- [Beziehungen verstehen](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-relationships-understand)
- [Beziehungen erstellen und verwalten](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-create-and-manage-relationships)
- [Datums-Tabelle markieren](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-date-tables)
- [Bidirektionale Beziehungen](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-bidirectional-filtering)

### Microsoft Learn · DAX

- [DAX — Übersicht](https://learn.microsoft.com/de-de/dax/dax-overview)
- [CALCULATE · Funktions-Referenz](https://learn.microsoft.com/de-de/dax/calculate-function-dax)
- [DAX Variables · Best Practice](https://learn.microsoft.com/de-de/dax/best-practices/dax-variables)
- [FILTER als Filter-Argument vermeiden](https://learn.microsoft.com/de-de/dax/best-practices/dax-avoid-avoid-filter-as-filter-argument)
- [DIVIDE · Division durch Null abfangen](https://learn.microsoft.com/de-de/dax/divide-function-dax)
- [Time Intelligence Functions](https://learn.microsoft.com/de-de/dax/time-intelligence-functions-dax)
- [USERPRINCIPALNAME · DAX-Referenz](https://learn.microsoft.com/de-de/dax/userprincipalname-function-dax)

### Microsoft Learn · Visualisierung & Interaktivität

- [Visualisierungstypen in Power BI](https://learn.microsoft.com/de-de/power-bi/visuals/power-bi-visualization-types-for-reports-and-q-and-a)
- [Drillthrough einrichten](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-drillthrough)
- [Bookmarks · Übersicht](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-bookmarks)
- [Field Parameters](https://learn.microsoft.com/de-de/power-bi/create-reports/power-bi-field-parameters)
- [Report-Page Tooltips](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-tooltips)
- [Dynamische Titel · Conditional Formatting](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-conditional-format-visual-titles)
- [Small Multiples](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-small-multiples)

### Microsoft Learn · Service · Sharing · RLS

- [Workspaces erstellen und verwalten](https://learn.microsoft.com/de-de/power-bi/collaborate-share/service-create-the-new-workspaces)
- [Workspace-Rollen](https://learn.microsoft.com/de-de/power-bi/collaborate-share/service-roles-new-workspaces)
- [Apps publizieren · mit Audiences](https://learn.microsoft.com/de-de/power-bi/collaborate-share/service-create-distribute-apps)
- [Deployment Pipelines](https://learn.microsoft.com/de-de/fabric/cicd/deployment-pipelines/intro-to-deployment-pipelines)
- [Datenaktualisierung · Übersicht](https://learn.microsoft.com/de-de/power-bi/connect-data/refresh-data)
- [Row-Level Security · Power BI](https://learn.microsoft.com/de-de/fabric/security/service-admin-row-level-security)
- [RLS Guidance · Best Practices](https://learn.microsoft.com/de-de/power-bi/guidance/rls-guidance)
- [Object-Level Security · Tabular Models](https://learn.microsoft.com/de-de/analysis-services/tabular-models/object-level-security)
- [Performance-Optimierung · Übersicht](https://learn.microsoft.com/de-de/power-bi/guidance/power-bi-optimization)

### IBCS · International Business Communication Standards

- [IBCS Association · Standards-Übersicht](https://www.ibcs.com/)
- [IBCS Standards · vollständig (CC BY-SA)](https://www.ibcs.com/standards/)
- [SUCCESS-Formel · die 7 Regeln im Detail](https://www.ibcs.com/success/)
- [ISO/AWI 24896 · Standard notation for business reports](https://www.iso.org/standard/79518.html)
- [Zebra BI · IBCS-Praxis-Guide für Power BI](https://zebrabi.com/ibcs/)

### Community · SQLBI & Tools

- [SQLBI · Marco Russo & Alberto Ferrari (DAX-Experten)](https://www.sqlbi.com/)
- [SQLBI · Star-Schema oder Single Table?](https://www.sqlbi.com/articles/power-bi-star-schema-or-single-table/)
- [DAX Guide · Funktions-Referenz (SQLBI)](https://dax.guide/)
- [Buch · The Definitive Guide to DAX (Russo / Ferrari)](https://www.sqlbi.com/books/the-definitive-guide-to-dax-2nd-edition/)
- [Tabular Editor 2 · kostenfrei, Open Source](https://github.com/TabularEditor/TabularEditor)
- [Tabular Editor · Offizielle Website (TE2 & TE3)](https://tabulareditor.com/)
- [DAX Studio · Performance-Diagnose (kostenfrei)](https://daxstudio.org/)
- [Best Practice Analyzer Rules · Microsoft GitHub](https://github.com/microsoft/Analysis-Services/tree/master/BestPracticeRules)

### Power BI Blog & Roadmap

- [Power BI Blog · monatliche Updates](https://powerbi.microsoft.com/de-de/blog/)
- [Microsoft Fabric Release Plan](https://learn.microsoft.com/en-us/fabric/release-plan/)
- [Fabric Community Forum](https://community.fabric.microsoft.com/)

### Daten-WG-Community · Eigene YouTube-Kanäle

- [Daten-WG · Podcast-Kanal](https://www.youtube.com/@Daten-WG)
- [Michael Tenner · Power BI Tutorials & Deep Dives](https://www.youtube.com/channel/UCv51V-2Gt7sQGVkN_6SNZfw)
- [Artur König · datakoenig · Power BI Deep Dives](https://www.youtube.com/channel/UC9Ovg7-t5zuca0E2jx2YF3A)

Michael Tenner · Power BI · Data Engineering · Datenmodellierung — diesen End-to-End-Guide habe ich zusammengestellt für alle, die nach ein bis zwei Jahren Power BI das große Bild sehen wollen. · VERBINDE DICH AUF LINKEDIN — FÜR FRAGEN, FEEDBACK, AUSTAUSCH · [Auf LinkedIn vernetzen](https://www.linkedin.com/in/michael-tenner-5b885970/)

**Power BI End-to-End · Einsteiger-Guide · v 4** VON MICHAEL TENNER · DEUTSCH · 10 SEKTIONEN · 87 DETAIL-KARTEN

BASIEREND AUF MICROSOFT LEARN & IBCS STANDARDS

[← Zurück zur Knowledge Kitchen](../index.html) · [Microsoft-Fabric-Einsteiger-Guide](../fabric_einsteiger_guide_v1.html) · [Impressum](../impressum.html) · [Datenschutz](../datenschutz.html)

Privates Projekt von Michael Tenner · derzeit in der Beta-Phase · inhaltlich verbunden mit der [Daten-WG-Community](https://www.daten-wg.com).

---

## Weiter

- HTML (maßgeblich): https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html
- Anschluss-Guide: [fabric_einsteiger_guide_v1.html](../fabric_einsteiger_guide_v1.html) · [fabric_einsteiger_guide_v1.md](fabric_einsteiger_guide_v1.md)
- Übungspfad für absolute Anfänger: [powerbi_praxis_pfad.html](../powerbi_praxis_pfad.html) · [powerbi_praxis_pfad.md](powerbi_praxis_pfad.md)
