# Power BI End-to-End — Einsteiger-Guide

> Der ganze Weg von der Datenanbindung bis zum Sharing: Architektur, Power Query, Query Folding, Stern-Schema, DAX, IBCS, Interaktivitaet, Service, Row-Level Security und externe Tools — mit Schritt-fuer-Schritt-Anleitungen und typischen Anfaengerfallen.

- **Quelle:** https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `power_bi_einsteiger_guide_v4.html` · Stand 2026-07-09 (Git-Commit-Datum der Quelldatei)
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/power_bi_einsteiger_guide_v4.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt den Fliesstext der Seite. Interaktive Elemente (Regler, Filter, animierte Charts) sind nur in der HTML-Fassung nutzbar; die zugehoerigen Zahlen stehen hier als Tabelle.

---

## Wo soll ich anfangen?

Dieser Guide ist **kein Buch**, das du von vorn nach hinten liest. Es ist eine Klick-Erkundung: zehn Sektionen, je 4–10 anklickbare Karten, jede führt zu einem Detail-Fenster mit Schritt-für-Schritt, Beispielen und Anfänger-Fallen.

Wenn du **1–2 Jahre Power BI** gemacht hast, kennst du die Oberfläche, aber wahrscheinlich noch nicht das *Warum* dahinter. Genau das schließen wir hier. Empfohlene Reihenfolge: **Sektion 1 → 2 → 4 → 5 → 6** abdecken die Kern-Workflows; Sektion 3, 7–10 sind Vertiefung.

Wenn du eine Karte anklickst, öffnet sich ein Modal. Mit Esc schließen, oder neben das Fenster klicken.

## Architektur & Komponenten

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

**Abb. · File → Options → Data Load** "Auto date/time" pro Datei oder global deaktivierbar. Quelle: [Auto date/time · Microsoft Learn](https://learn.microsoft.com/power-bi/transform-model/desktop-auto-date-time)

#### Updates monatlich installieren

Microsoft veröffentlicht jeden Monat ein Desktop-Update. Wer Updates auslässt, verpasst Features (Step Folding Indicators, Field Parameters, Small Multiples) und Bugfixes.

#### Externe Tools aktivieren

Wenn du Tabular Editor 2 und DAX Studio installierst, erscheinen sie im "External Tools"-Tab in Desktop und sind nahtlos integriert (siehe Sektion 10).

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
|---|---|
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

### Free · Pro · PPU · Premium / Fabric

*ARCHITEKTUR · LIZENZEN*

Die Lizenzierung ist eines der häufigsten Stolper-Themen. Wer welche Lizenz braucht, hängt davon ab, was er mit den Inhalten tut.

#### Die vier Lizenz-Stufen

| Lizenz | Authoring | Konsum | Typischer Use Case |
|---|---|---|---|
| **Free** | Desktop nur lokal | My Workspace | Lernen, Experimentieren |
| **Pro** | Service, Sharing | Alle Pro-Inhalte | Standard-Business-User |
| **PPU** | + Premium-Features | Premium-Inhalte | Power-User ohne Capacity |
| **Premium / Fabric** | Capacity-basiert | Free-User können konsumieren | Enterprise-Bereitstellung |

#### Die wichtigsten Regeln

- **Pro reicht meistens** — Pro-User können Inhalte erstellen und mit anderen Pro-Usern teilen
- **Premium/Fabric-Capacity erlaubt Sharing mit Free-Usern** — die Capacity wird einmal bezahlt, Konsumenten brauchen keine Pro-Lizenz
- **PPU ist Pro mit Premium-Features** — gut für kleine Teams ohne große Capacity-Investition
- **Fabric-Capacity (F-SKU)** — neuer Standard, F64+ schaltet Free-Konsum frei

### Microsoft Fabric &amp; OneLake

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

**Status:** Fabric ist seit November 2023 GA. Die Plattform entwickelt sich monatlich weiter — vor Produktiv-Entscheidungen den aktuellen Release Plan prüfen.

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

Framing, Guardrails pro F-SKU und die zwei Direct-Lake-Varianten (on OneLake vs. on SQL endpoints) im Detail: [Fabric-Guide → Sektion „Semantik & Direct Lake"](fabric_einsteiger_guide_v1.html)

**Faustregel:** Im Zweifel Import. DirectQuery nur, wenn Aktualität oder Datenmenge es erzwingen. Direct Lake, wenn die Plattform Fabric ist.

## Power Query · Workflow

### Datei-Quellen · CSV · Excel · JSON · Parquet

*POWER QUERY · QUELLEN*

Die häufigste Quellart in Einsteiger-Projekten. CSVs aus Exporten, Excel-Listen aus Fachabteilungen, JSON von Web-APIs.

#### Was ist das?

Power Query hat für jeden Dateityp einen nativen Connector — er weiß, wie er CSV-Trennzeichen erkennt, Excel-Sheets auflistet oder JSON-Strukturen aufdröselt. Die Funktion heißt im M-Code immer `<Format>.Document`: `Csv.Document`, `Excel.Workbook`, `Json.Document`.

#### Wichtige Connectors

- **CSV** — `Csv.Document`: Trennzeichen, Encoding, Quoting
- **Excel** — `Excel.Workbook`: Sheets, benannte Bereiche, Tabellen
- **JSON** — `Json.Document`: oft mit Pagination und Auth
- **Parquet** — `Parquet.Document`: spaltenorientiert, sehr effizient
- **Ordner** — `Folder.Files`: für mehrere Dateien gleichzeitig

#### CSV richtig laden

Encoding und Trennzeichen explizit setzen. Power Query rät meist richtig, aber bei Sonderzeichen oder Komma-/Semikolon-Mischungen kann es zu Fehlern kommen. `UTF-8` entspricht Encoding-Code `65001`.

```

let
  Source = Csv.Document(
    File.Contents("C:\\Daten\\verkauf.csv"),
    [Delimiter=";", Columns=18,
     Encoding=65001, QuoteStyle=QuoteStyle.None]
  ),
  Headers = Table.PromoteHeaders(Source)
in Headers

```

#### Excel mit mehreren Sheets

Bei Excel zeigt Power Query alle Sheets und Tabellen an. **Benannte Tabellen sind vorzuziehen** (in Excel: Einfügen → Tabelle). Sie sind robuster gegen Layoutänderungen als Sheet-Bereiche.

#### Ordner-Quelle für viele gleiche Dateien

"Get Data → Folder" — Power Query liest alle Dateien im Ordner. Ideal für monatliche Exporte: neue Datei reinkopieren, Refresh klicken, automatisch ergänzt.

### Web- &amp; API-Quellen

*POWER QUERY · QUELLEN*

Daten direkt aus Web-APIs oder HTML-Tabellen ziehen. Mächtig, aber mit Stolperfallen bei Authentifizierung und Pagination.

#### Drei Arten von Web-Quellen

- **HTML-Tabellen** — Power Query erkennt `<table>`-Elemente auf Webseiten automatisch (z. B. Wikipedia)
- **REST APIs** — JSON oder XML über HTTP, oft mit Auth-Header oder API-Key
- **OData-Feeds** — strukturierte API-Feeds mit eigenem Connector (`OData.Feed`)

#### Einfacher Web-Connector

Get Data → Web → URL eintragen. Power Query analysiert die Seite und zeigt alle erkannten Tabellen. Für statische HTML-Tabellen reicht das.

#### REST API mit Authentifizierung

Über `Web.Contents` mit `RelativePath` und `Headers`:

```

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

#### Pagination handhaben

Viele APIs liefern Daten paginiert (Seite 1, 2, 3, ...). In M-Code mit `List.Generate` alle Seiten holen und kombinieren:

```

List.Generate(
  () => [page=1, data=GetPage(1)],
  each [data][has_more] = true,
  each [page=[page]+1, data=GetPage([page]+1)]
)

```

### Datenbank-Quellen · der Folding-Hebel

*POWER QUERY · QUELLEN*

SQL Server, Oracle, PostgreSQL, Snowflake, MySQL — alle Datenbank-Connectors unterstützen Query Folding. Das ist der Hauptgrund, warum DB-Quellen den Datei-Quellen vorzuziehen sind, wenn die Wahl besteht.

#### Was ist das Besondere?

Bei einer Datei muss Power Query immer die **ganze Datei** einlesen, dann transformieren. Bei einer Datenbank kann es Filter, Joins und Aggregationen **an die Datenbank delegieren** — und nur das gefilterte Ergebnis kommt zurück. Das nennt sich **Query Folding** (siehe Sektion 3).

#### Wichtige Connectors

- **SQL Server** — Microsoft-eigener Connector, beste Integration
- **Azure SQL / Synapse** — Cloud, schnellster Folding-Hebel
- **Oracle, PostgreSQL, MySQL** — etablierte Connectors
- **Snowflake, BigQuery, Databricks** — moderne Cloud-DWHs, native Connectors
- **SAP HANA, SAP BW** — SAP-Welt
- **ODBC** — Notbehelf, foldet schlechter; immer nativen Connector bevorzugen

#### Verbindung herstellen

Get Data → SQL Server → Server-Name und Datenbank eintragen. **Import-Modus wählen**, nicht DirectQuery (es sei denn, du brauchst Live-Daten).

#### Authentifizierung

Drei Optionen: Windows-Authentifizierung (Default in Firmennetzen), Datenbank-Authentifizierung (User/Passwort), Microsoft-Konto (für Azure-Quellen).

#### Navigator: was laden?

Power Query zeigt alle Tabellen und Views. **Nur die wirklich benötigten Tabellen anhaken** — jede zusätzliche Tabelle bedeutet mehr Speicher und Komplexität.

#### Views vs. Tabellen

Wenn die Datenbank-Admins Views bereitstellen, diese bevorzugen. Views sind oft schon optimiert und enthalten Joins/Filter, die der DBA für Reports vorbereitet hat.

### In M generiert · Datums- &amp; Zeit-Dimensionen

*POWER QUERY · QUELLEN*

Die wichtigste Dimension im Modell — die Datums-Tabelle — wird nicht aus Quelldaten abgeleitet, sondern in M-Code generiert. Vollständig, konsistent, unabhängig vom Datenstand.

#### Warum generieren statt extrahieren?

- **Vollständigkeit** — auch Tage ohne Bewegung sind enthalten (z. B. Sonntage, Feiertage)
- **Konsistenz** — gleicher Aufbau über alle Modelle der Organisation
- **Unabhängigkeit** — keine Abhängigkeit von Quellsystem-Zeitstempeln
- **Vorausschauend** — kann Zukunfts-Daten enthalten (für Plan-Werte)

#### Datums-Liste erzeugen

Mit `List.Dates` alle Tage zwischen Start und Ende generieren:

```

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

#### Spalten ergänzen

Aus dem Datum alle relevanten Attribute ableiten: Jahr, Quartal, Monat, Monatsname (mit Sortier-Spalte), Wochentag, KW, Feiertag-Flag.

```

Tabelle
|> Table.AddColumn("Jahr", each Date.Year([Datum]))
|> Table.AddColumn("Quartal", each "Q" & Text.From(Date.QuarterOfYear([Datum])))
|> Table.AddColumn("Monat", each Date.Month([Datum]))
|> Table.AddColumn("Monatsname", each Date.MonthName([Datum]))
|> Table.AddColumn("Wochentag", each Date.DayOfWeek([Datum], Day.Monday))

```

#### Tabelle als Datums-Tabelle markieren

In Desktop: Modeling-Tab → Mark as date table → Datums-Spalte auswählen. **Pflicht für Time-Intelligence-Funktionen.**

#### Pflicht-Spalten

- **DateKey** — eindeutiger Datums-Primärschlüssel
- **Jahr, Quartal, Monat** — Hierarchie-Ebenen
- **Monatsname** + **Sortier-Spalte** (sonst alphabetisch sortiert: April, August, ...)
- **Wochentag** als Zahl und als Name
- **Kalenderwoche** (ISO-Standard)
- Optional: Geschäftsjahr, Feiertag-Flag, Arbeitstag-Flag, Relative-Date-Spalten

### Datentypen früh setzen

*POWER QUERY · STAGING*

Der wichtigste Einzelschritt in Power Query — und der, der bei Einsteigern am häufigsten verschlampt wird.

#### Warum so wichtig?

- **Folding** — bei Datenbank-Quellen werden Filter und Joins korrekt übersetzt nur mit korrekten Typen
- **Beziehungen** — funktionieren nur zwischen kompatiblen Typen
- **Sortierung & Aggregation** — Text-Datumsangaben werden alphabetisch sortiert (April, August, Dezember…), nicht chronologisch
- **Berechnungen** — Text + Text gibt nicht "Summe", sondern Stringverknüpfung

#### Schritt 1: Header promoten

Erster Schritt nach dem Laden: Home → "Use First Row as Headers". Erzeugt einen Schritt `Table.PromoteHeaders`.

#### Schritt 2: Datentypen manuell setzen

Den automatisch erzeugten "Changed Type"-Schritt entfernen (er rät oft falsch) und manuell typisieren:

```

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

#### Schritt 3: Lokalisierung beachten

Bei Datum-Texten mit "01.05.2024" musst du Power Query mitteilen, dass das deutsches Format ist — sonst wird es als 5. Januar interpretiert:

```

Table.TransformColumnTypes(t,
  {{"Datum", type date}},
  "de-DE")

```

#### Häufige Power-Query-Typen

| Typ | Verwendung |
|---|---|
| `Int64.Type` | Ganzzahlen (Mengen, Anzahlen, IDs) |
| `Currency.Type` | Beträge mit fester Dezimalstellen-Genauigkeit |
| `type number` | Dezimalzahlen (Quoten, Faktoren) |
| `type date` | Reines Datum (ohne Uhrzeit) |
| `type datetime` | Datum + Uhrzeit |
| `type text` | Strings, IDs, Schlüssel |
| `type logical` | true / false |

### Schlüssel bereinigen

*POWER QUERY · STAGING*

Vor jedem Join müssen die Verbindungs-Spalten konsistent sein. "Berlin" ≠ "Berlin " ≠ "berlin" ≠ "BERLIN" — ohne Bereinigung entstehen Mismatches, die als NULL durchschlüpfen.

#### Die fünf typischen Probleme

- **Whitespace** — Leerzeichen am Anfang/Ende
- **Schreibweise** — Groß-/Kleinschreibung uneinheitlich
- **Unsichtbare Zeichen** — Non-Breaking Spaces, Tabs
- **Synonyme** — "DE" vs. "Deutschland" vs. "Germany"
- **Format-Inkonsistenz** — "12345" vs. "012345" vs. "12.345"

#### Trim und Clean

`Text.Trim` entfernt Whitespace am Anfang und Ende. `Text.Clean` entfernt nicht-druckbare Zeichen.

```

Table.TransformColumns(t, {
  {"Stadt", each Text.Trim(Text.Clean(_)), type text}
})

```

#### Schreibweise vereinheitlichen

Für Schlüssel: `Text.Lower` oder `Text.Upper` — egal welches, Hauptsache konsistent.

```

Table.TransformColumns(t, {
  {"PLZ", Text.Upper, type text}
})

```

#### Synonyme harmonisieren

Mit `Table.ReplaceValue` für einzelne Ersetzungen oder einer Mapping-Tabelle mit Merge für viele.

```

Table.ReplaceValue(t,
  "Germany", "DE",
  Replacer.ReplaceText,
  {"Land"})

```

#### Padding bei fester Länge

PLZ in Deutschland 5-stellig, in der CSV manchmal als "1234" geliefert (führende Null verloren):

```

Table.TransformColumns(t, {
  {"PLZ", each Text.PadStart(_, 5, "0"), type text}
})

```

### Joins (Merges) · Tabellen verknüpfen

*POWER QUERY · STAGING*

Power Query nennt SQL-Joins "Merges". Sechs Varianten, jede für einen anderen Zweck — die falsche Wahl produziert falsche Berichte, ohne Warnung.

#### Die sechs Join-Typen

| Typ | Verhalten | Use Case |
|---|---|---|
| **Left Outer** | Alle linken Zeilen, passende rechte | Default · meist richtig |
| **Inner** | Nur passende Zeilen | Vorsicht — verliert ungematche |
| **Full Outer** | Alle Zeilen aus beiden | Abgleichs-Reports |
| **Left Anti** | Nur linke ohne Match | Fehlende Stammdaten finden |
| **Right Anti** | Nur rechte ohne Match | Ungenutzte Stammdaten finden |
| **Right Outer** | Spiegelung Left Outer | Selten — Tabellen-Reihenfolge tauschen klarer |

#### Merge starten

Im Power Query Editor: linke Tabelle auswählen → Home-Tab → Merge Queries. Es öffnet sich ein Dialog mit beiden Tabellen und der Join-Vorschau.

#### Schlüsselspalten auswählen

In beiden Tabellen die Verknüpfungsspalte anklicken. Wenn der Schlüssel aus mehreren Spalten besteht: Strg+Klick für Mehrfachauswahl. Beide Seiten müssen denselben Datentyp haben.

#### Join-Typ wählen

"Join Kind" unten im Dialog. Default ist Left Outer. Unten zeigt Power Query die Match-Statistik: "X aus Y rows match" — das ist deine Qualitätskontrolle.

#### Expand

Nach OK erscheint eine neue Spalte mit verschachtelten Tabellen. Auf das Doppelpfeil-Icon klicken → die gewünschten Spalten aus der rechten Tabelle auswählen → "Use original column name" deaktivieren (sonst Präfixe).

### Dimensionen extrahieren

*POWER QUERY · STAGING*

Wenn deine Quelle eine einzige breite Tabelle ist (alles in einer CSV), brauchst du Power Query um daraus Stern-Schema-Tabellen zu bauen.

#### Warum Dimensionen rausziehen?

- **Speicher** — Texte werden in der Faktentabelle nur als IDs gespeichert, in der Dimension einmal
- **Performance** — VertiPaq komprimiert kleinere Dimensions-Tabellen besser
- **Konsistenz** — Stammdaten an einer Stelle, nicht in Millionen Faktzeilen
- **Modellierung** — Stern-Schema setzt Dimensionen voraus

#### Original-Query duplizieren

Rechtsklick auf die Quell-Query → "Reference". Das ist der Ausgangspunkt für die Dimension. Die Faktentabelle nimmt einen eigenen Reference-Pfad.

#### Dimension reduzieren

In der Dimensions-Query: nur die relevanten Spalten behalten (`Table.SelectColumns`), dann Duplikate entfernen (`Table.Distinct`).

```

let
  Source = stg_verkauf,
  Selected = Table.SelectColumns(Source,
    {"ProduktID", "Produkt", "Kategorie", "Hersteller"}),
  Distinct = Table.Distinct(Selected)
in Distinct

```

#### Surrogate Key vergeben

Optional, aber empfohlen: `Table.AddIndexColumn` erzeugt einen aufsteigenden Integer-Schlüssel. In der Dimension als PK, in der Faktentabelle wird der Business-Key durch den Surrogate ersetzt.

#### Spalten in der Faktentabelle entfernen

Die jetzt in der Dimension stehenden Spalten (Produkt, Kategorie, Hersteller) aus der Faktentabelle entfernen. Nur die Schlüssel-Spalte (ProduktID) bleibt.

- `fact_verkauf` — 5 Mio Zeilen: BestellNr, Datum, KundenID, ProduktID, Menge, Preis (6 Spalten)
- `dim_kunde` — ~10 000 Zeilen: KundenID, Kundenname, Stadt, Land
- `dim_produkt` — ~5 000 Zeilen: ProduktID, Produkt, Kategorie

### Klassifizierungen ableiten

*POWER QUERY · STAGING*

Aus Rohwerten Kategorien machen — Umsatz-Buckets, Status-Flags, Altersgruppen. Wenn die Klassifizierung stabil ist, gehört sie in Power Query, nicht in DAX.

#### Warum in Power Query, nicht in DAX?

- **Performance** — einmal beim Refresh berechnet, nicht bei jeder Query neu
- **Filterbar** — Calculated Columns sind als Slicer/Filter nutzbar
- **Sichtbar im Modell** — kein Geheimwissen im DAX

#### Vier typische Klassifizierungs-Pattern

1. **Buckets aus numerischen Werten** — "Umsatz < 1000 = klein, sonst groß"

2. **Flags aus Spalten** — "ist Geschenk?" basierend auf Produktgruppe

3. **Mapping über Lookup-Tabelle** — Region aus PLZ ableiten

4. **Berechnete Kennzahlen** — Umsatz = Menge × Preis

#### Conditional Column

Add Column → Conditional Column. Visueller Editor für einfache if/then/else-Logik. Erzeugt M-Code:

```

Table.AddColumn(t, "Größe", each
  if [Umsatz] < 1000 then "klein"
  else if [Umsatz] < 10000 then "mittel"
  else "groß")

```

#### Custom Column für Komplexes

Wenn die Logik mehr als simple if/else hat — z. B. mehrere Spalten kombinieren — Custom Column verwenden:

```

Table.AddColumn(t, "Wert-Status", each
  if [Menge] = 0 then "Storniert"
  else if [Datum] >= Date.From(DateTime.LocalNow())
        then "Geplant"
  else "Realisiert")

```

#### Berechnete Kennzahlen früh

Umsatz = Menge × Preis. Wenn das stabil ist und immer gebraucht wird → in Power Query, nicht in DAX:

```

Table.AddColumn(t, "Umsatz", each
  [Menge] * [Preis], Currency.Type)

```

### 1 Faktentabelle

*POWER QUERY · MODELL*

Im Stern-Schema gibt es eine zentrale Faktentabelle. Sie enthält die **Kennzahlen** (was gemessen wird) plus die **Fremdschlüssel** zu allen Dimensionen.

#### Was gehört rein?

- **Fremdschlüssel (FK)** — Verweise auf Dimensionen: DateKey, ProduktKey, KundenKey, ...
- **Kennzahlen (Measures-Quellen)** — Menge, Preis, Betrag, Dauer, ...
- **Optional: Degenerate Dimensions** — Identifikatoren ohne eigene Dimensions-Tabelle (z. B. Bestellnummer)

#### Was NICHT rein gehört

- **Beschreibende Attribute** — Produktname, Stadt, Kundenname — die gehören in Dimensionen
- **Vorberechnete Aggregate** — Monats-/Jahressummen vermischt mit Tageswerten (Granularitäts-Bruch)
- **Daten anderer Granularität** — wenn Bestellpositionen die Granularität sind, keine Bestellsummen reinmischen

#### Faktentabelle benennen

Konvention: `fact_*` oder `F_*`. In Power Query Editor klar erkennbar machen.

#### Schlüsselspalten verifizieren

Jeder Fremdschlüssel muss einen Match in der entsprechenden Dimension haben. Im Modell View entstehen sonst Beziehungs-Konflikte.

#### Spalten-Datentypen prüfen

Kennzahlen als `Currency.Type` oder `Int64.Type`, Schlüssel als gleicher Typ wie in der Dimension.

#### Granularität dokumentieren

Im Description-Feld der Tabelle: "Eine Zeile pro Bestellposition" — damit das Team später weiß, was eine Zeile bedeutet.

- DateKey (FK)
- KundenKey (FK)
- ProduktKey (FK)
- BestellNr (degenerate dim)
- Menge (int)
- Einzelpreis (currency)
- Rabatt (currency)

### 5+ Dimensionstabellen

*POWER QUERY · MODELL*

Dimensionen sind die "Wer / Was / Wann / Wo" — sie beantworten, wie man die Kennzahlen filtern und gruppieren kann.

#### Welche Dimensionen braucht jedes Modell?

1. **Datum** (immer) — Pflicht für Zeitreihen-Analyse

2. **Zeit** (oft) — wenn Stunden-/Minuten-Granularität gefragt ist

3. **Geschäftsobjekte** — Produkt, Kunde, Verkäufer, Filiale, ...

4. **Klassifizierungen** — Kategorie, Status, Region

#### Was gehört in eine Dimension?

- **Primärschlüssel** — eindeutig, idealerweise Integer (Surrogate Key)
- **Business Key** — der externe Schlüssel aus dem Quellsystem (ProduktID, KundenID, ...)
- **Beschreibende Attribute** — Name, Kategorie, Adresse, alle textuellen Eigenschaften
- **Hierarchie-Ebenen** — Kategorie > Unterkategorie > Produkt
- **Optional: Sort-By-Spalten** — z. B. Monatsname mit numerischer Sortier-Spalte

#### Pro Dimension eine eigene Query

Mehrere Dimensionen NICHT in einer Tabelle vermischen. Jede Dimension hat ihre eigene Query in Power Query, ihre eigene Tabelle im Modell.

#### Distinct sicherstellen

Eine Dimensions-Zeile pro Wert. Vor dem Laden mit `Table.Distinct` oder `Table.RemoveDuplicates` sicherstellen, dass kein Schlüssel doppelt vorkommt.

#### Beziehung im Modell View

Nach dem Laden: Modell View → Dimensions-Schlüssel auf Faktentabellen-Schlüssel ziehen. Power BI erkennt 1:n automatisch.

#### Star-Schema-Regel

Microsoft Learn: *"The 'one' side is always a dimension table while the 'many' side is always a fact table."*

Mit anderen Worten: **Dimensionen sind auf der 1-Seite, Faktentabelle auf der n-Seite**. Wenn die Beziehung anders gepolt ist, ist eine der Tabellen falsch klassifiziert.

### Beziehungen 1:n

*POWER QUERY · MODELL*

Die Beziehung zwischen Faktentabelle und Dimensionen ist immer 1:n — eine Zeile in der Dimension, viele in der Faktentabelle. Diese Beziehungen sind das Rückgrat des Stern-Schemas.

#### Was passiert bei einer Beziehung?

Filter propagieren über Beziehungen. Wenn du die Region "Süd" in der Region-Dimension filterst, propagiert dieser Filter über die 1:n-Beziehung in die Faktentabelle — und alle DAX-Measures berücksichtigen nur Süd-Daten.

#### Beziehung erstellen

Modell View → Spalte von Dimension auf entsprechende Spalte in Faktentabelle ziehen. Power BI erstellt automatisch die Beziehung mit korrekter Kardinalität.

#### Beziehung prüfen

Doppelklick auf die Beziehung. Wichtige Eigenschaften:

- **Cardinality**: 1:n (Dimension : Fakt) — Default
- **Cross filter direction**: Single (von 1 nach n) — Default und sicher
- **Make this relationship active**: aktiv (durchgezogen) oder inaktiv (gestrichelt)

#### Aktive vs. inaktive Beziehung

Pro Tabellen-Paar kann nur **eine** Beziehung aktiv sein. Bei mehreren Datums-Spalten in der Faktentabelle (Bestelldatum + Lieferdatum) eine Beziehung aktiv, andere inaktiv. In DAX mit `USERELATIONSHIP` aktivieren bei Bedarf.

#### Filterrichtungen

| Richtung | Verwendung |
|---|---|
| **Single (1 → n)** | Default. Filter fließt von Dimension zur Faktentabelle. Sicher. |
| **Both (1 ↔ n)** | Filter fließt in beide Richtungen. Mächtig, aber gefährlich — kann zu Mehrdeutigkeiten und Performance-Problemen führen. |

```

Umsatz nach Lieferdatum =
CALCULATE([Umsatz],
  USERELATIONSHIP(
    fact_verkauf[LieferDatum],
    dim_datum[Datum]))

```

### Modell schlank halten

*POWER QUERY · MODELL*

Power Query Editor zeigt oft 20+ Queries — Quellen, Staging, Zwischenschritte, Dimensionen. Nur die Modell-Tabellen sollen am Ende geladen werden.

#### Was bedeutet "Laden aktivieren / deaktivieren"?

Jede Query in Power Query hat eine Eigenschaft "Enable load":

- **Enabled (Default)** — Query wird als Tabelle ins Modell geladen
- **Disabled** — Query existiert nur als Helfer, wird nicht ins Modell geladen

#### Welche Queries sollten NICHT geladen werden?

- `src_*` — Quell-Queries (Anschluss an Quelle)
- `stg_*` — Staging-Queries (Bereinigung)
- Helper-Queries (Mapping-Tabellen, die per Merge konsumiert werden)
- Parameter-Queries

#### Welche Queries SOLLEN geladen werden?

- `dim_*` — Dimensions-Tabellen
- `fact_*` — Faktentabellen

#### Laden deaktivieren

Im Power Query Editor: Rechtsklick auf Query → "Enable Load" abwählen. Die Query erscheint im Editor kursiv und wird beim Close & Apply nicht als Modell-Tabelle erzeugt.

#### Queries in Ordner gruppieren

Rechtsklick im Query-Pane → "New Group". Empfohlene Ordner: **1. Quellen**, **2. Staging**, **3. Modell**, **4. Helfer**. Bei größeren Modellen unverzichtbar.

#### Naming Convention konsequent

`src_` für Quellen, `stg_` für Staging, `dim_` für Dimensionen, `fact_` für Fakten. Wer das durchhält, hat in 6 Monaten noch Übersicht.

- 📁 **1. Quellen** (Laden deaktiviert) src_csv_verkauf src_sql_kunde src_excel_produkte
- 📁 **2. Staging** (Laden deaktiviert) stg_verkauf stg_kunde
- 📁 **3. Modell** (Laden aktiviert) fact_verkauf dim_kunde dim_produkt dim_datum

## Deep Dive: Query Folding

### Was ist Query Folding?

*QUERY FOLDING · GRUNDLAGE*

Query Folding ist die Fähigkeit der Power-Query-Engine, mehrere M-Schritte in eine einzige native Quell-Query zu übersetzen — bei SQL Server in ein einziges `SELECT`-Statement.

#### Wie funktioniert das?

Du klickst in Power Query: "Filter Region = Süd" → "Spalten Menge und Datum behalten" → "Sortieren nach Datum". Power Query erzeugt M-Code. Wenn die Quelle eine Datenbank ist, übersetzt Power Query diese drei Schritte intern in:

```

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
|---|---|
| Kein Folding (alles in der Mashup-Engine) | 361 Sekunden |
| Teilweises Folding | 184 Sekunden |
| Vollständiges Folding | 31 Sekunden |

Identische Datenmenge, identische Endergebnisse — nur die Folding-Stufe ist verschieden. **Faktor ~12** zwischen kein und vollständigem Folding (genau: 361/31 ≈ 11,6).

**Abb. · Microsoft Learn Benchmark** Refresh-Zeit nach Folding-Grad (Azure Synapse DW2000c). Quelle: [Query folding examples · Microsoft Learn](https://learn.microsoft.com/power-query/query-folding-examples)

#### Wo foldet was?

- **Datenbank-Quellen** (SQL Server, Oracle, Snowflake, ...) — foldet
- **OData / SharePoint Lists** — foldet eingeschränkt
- **Datei-Quellen** (CSV, Excel, JSON) — foldet NICHT (es gibt keine Engine, an die delegiert werden könnte)
- **Web-API ohne OData** — foldet meist nicht

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

**Abb. · Alle Schritte folden (grün)** Optimaler Fall — die grüne Linie zeigt: alle Operationen werden an die Datenbank delegiert. Quelle: [Query folding indicators · Microsoft Learn](https://learn.microsoft.com/power-query/step-folding-indicators)

**Abb. · Folding bricht (rot/grau)** "Capitalize each word" foldet nicht — ab hier bricht die grüne Linie ab, alle nachfolgenden Schritte werden lokal in der Mashup-Engine ausgeführt. Quelle: [Microsoft Learn](https://learn.microsoft.com/power-query/step-folding-indicators)

#### Hover für Details

Mit der Maus über das Icon hovern. Power Query erklärt, warum gerade nicht gefoldet wird ("Step contains a function that doesn't fold").

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

**Abb. · Rechtsklick auf Schritt → View Native Query** Wenn die Option verfügbar ist (nicht ausgegraut), foldet der Schritt. Quelle: [Query folding on native queries · Microsoft Learn](https://learn.microsoft.com/power-query/native-query-folding)

#### Schritt für Schritt prüfen

Bei großer Pipeline: am letzten Schritt View Native Query aufrufen. Wenn verfügbar → alles davor foldet. Wenn ausgegraut → den Punkt finden, wo Folding bricht (schrittweise zurückgehen).

#### SQL kopieren für Diagnose

Im View-Native-Query-Dialog: SQL kopieren, in SQL Server Management Studio oder DBeaver ausführen. Performance dort messen. Wenn auch dort langsam: Datenbank-Indizes prüfen.

#### DBA einbinden

Wenn Refresh wegen Folding-SQL langsam ist: Native Query an den DBA. Oft helfen Indizes auf den Filter-Spalten oder bessere Statistiken.

```

Source → Filter Datum >= "2024-01-01"
       → Filter Region = "Süd"
       → Select Columns Datum, Menge, Region

```

```

SELECT Datum, Menge, Region
FROM Verkauf
WHERE Datum >= '2024-01-01'
  AND Region = 'Süd'

```

### Query Plan

*QUERY FOLDING · TIEFENANALYSE*

Die mächtigste Folding-Diagnose. Power Query zeigt einen Plan-Baum mit drei Knotentypen — und ihrer Performance-Charakteristik.

#### Was ist der Query Plan?

Wie ein SQL-Execution-Plan, aber für Power Query. Zeigt, wie die Engine eine Query physisch ausführt: was wird an die Quelle delegiert, was im Speicher verarbeitet, was zeilenweise gestreamt.

#### Drei Knotentypen

| Knoten | Bedeutung | Performance |
|---|---|---|
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

**Microsoft hat den Query Plan 2022 eingeführt** als ergänzendes Diagnose-Werkzeug zu den Step Folding Indicators.

### Folding wiederherstellen — 6 Strategien

*QUERY FOLDING · PRAXIS*

Wenn ein Schritt das Folding bricht, gibt es sechs konkrete Strategien, das zu beheben.

#### Strategie 1: Schritt umsortieren

Foldende Schritte vor nicht-foldende. Index-Spalte, Custom Column, Pivot ans Ende. Filter, Spaltenauswahl, Joins an den Anfang.

#### Strategie 2: UI-Code überschreiben

Power Query erzeugt manchmal komplizierten Code, der nicht foldet. Manuell vereinfachen in der Formula Bar. Oft löst das schon das Problem.

#### Strategie 3: Filter umformulieren

`Table.LastN` foldet nicht (kein "BOTTOM" in SQL), aber:

```

Source
|> Table.Sort({{"Datum", Order.Descending}})
|> Table.FirstN(100)

```

...foldet, weil `ORDER BY ... DESC` + `TOP 100` SQL-fähig sind.

#### Strategie 4: Native Query als Ausweg

Wenn nichts hilft: eine handgeschriebene SQL als Source. Foldet zwar nicht (Power Query kann das SQL nicht weiter optimieren), aber: wenn die SQL hochoptimiert ist und alle Filter enthält, kann das besser sein als M-Code.

```

Source = Sql.Database("server", "db",
  [Query="SELECT a, b, c FROM t WHERE region = 'Süd'"])

```

#### Strategie 5: Cross-Source-Joins vermeiden

Join zwischen SQL-Tabelle und Excel-Datei foldet niemals. Lösung: die Excel-Daten ins SQL importieren (oder als CSV in einen DB-fähigen Storage), dann beide aus derselben Quelle laden.

#### Strategie 6: Privacy Levels prüfen

Wenn zwei Quellen verschiedene Privacy Levels haben, verhindert Power Query Folding zwischen ihnen aus Sicherheitsgründen. File → Options → Privacy → Privacy levels einheitlich setzen (z. B. alle auf "Organizational").

## Datenmodell & Stern-Schema

### Die Faktentabelle

*STAR SCHEMA · ZENTRUM*

Das Zentrum jedes Stern-Schemas. Enthält die Kennzahlen und die Fremdschlüssel zu allen Dimensionen.

**Abb. · Stern-Schema in Power BI Desktop (Model View)** Adventure-Works-Beispiel: `Sales`-Faktentabelle in der Mitte, vier Dimensionen außen, 1:n-Beziehungen (1-Seite an Dimension, n-Seite an Fakt). Quelle: [Model relationships · Microsoft Learn](https://learn.microsoft.com/power-bi/transform-model/desktop-relationships-understand)

#### Eigenschaften einer guten Faktentabelle

- **Eine klare Granularität** — eine Zeile bedeutet immer dasselbe
- **Schmal in der Spaltenbreite** — nur Schlüssel + Kennzahlen
- **Lang in der Zeilenzahl** — Millionen Zeilen sind normal
- **Numerische Spalten dominieren** — Texte gehören in Dimensionen

#### Spalten-Anatomie

| Typ | Beispiele |
|---|---|
| **Fremdschlüssel** | DateKey, KundenKey, ProduktKey |
| **Additive Kennzahlen** | Menge, Umsatz (lassen sich beliebig summieren) |
| **Semi-additive** | Lagerbestand (über Zeit nicht summierbar, über Produkte schon) |
| **Non-additive** | Preis pro Stück, Quoten (nicht direkt summierbar) |
| **Degenerate Dimensions** | Bestellnummer — Identifikator ohne eigene Dim-Tabelle |
- Spalten: `DateKey, KundenKey, ProduktKey, VerkäuferKey, BestellNr, Menge, Einzelpreis, Rabatt`
- Granularität: eine Zeile pro Bestellposition
- Umsatz wird nicht gespeichert — als DAX-Measure berechnet (`Menge × Einzelpreis - Rabatt`)

### Datums-Dimension (Kalender)

*STAR SCHEMA · DIMENSION*

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

### Zeit-Dimension (Uhrzeit)

*STAR SCHEMA · DIMENSION*

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

### Dimension A · z. B. Produkt

*STAR SCHEMA · DIMENSION*

Dimensionen sind die "Was-/Wer-/Wo-"Tabellen. Sie enthalten beschreibende Attribute, nach denen du in Berichten filtern und gruppieren kannst.

#### Anatomie einer Dimension

- **Surrogate Key** (PK) — künstlich generierter Integer-Schlüssel
- **Business Key** — die externe ID aus dem Quellsystem (z. B. ProduktID)
- **Beschreibende Attribute** — Name, Beschreibung, Eigenschaften
- **Hierarchie-Ebenen** — Kategorie > Unterkategorie > Produkt
- **Optional: SCD-Spalten** — bei Slowly Changing Dimensions (StartDate, EndDate, IsCurrent)
- `ProduktKey` (PK, Surrogate)
- `ProduktID` (Business Key)
- `Produktname`
- `Hersteller`
- `Kategorie` (Hierarchie L1)
- `Unterkategorie` (Hierarchie L2)
- `Listenpreis`
- `Einführungsdatum`
- `IsActive` (Boolean)

#### Conformed Dimensions

Eine "konforme" Dimension wird von mehreren Faktentabellen geteilt — z. B. `dim_datum` verbindet `fact_verkauf` und `fact_lager`. Das macht Cross-Fact-Analysen möglich ("Wieviel verkaufen wir an einem Tag, an dem Lieferung X eintraf?").

### Dimension B · z. B. Kunde

*STAR SCHEMA · DIMENSION*

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
|---|---|---|
| **SCD 1** | Aktueller Wert überschreibt alten | Default — meistens richtig |
| **SCD 2** | Neue Zeile mit StartDate, EndDate, IsCurrent | Wenn historische Auswertung wichtig |
| **SCD 3** | Spalte "Aktuell" + Spalte "Vorher" | Selten, nur wenn ein Vergleich relevant |

### Dimension C · z. B. Geografie

*STAR SCHEMA · DIMENSION*

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

### Eine Granularität pro Faktentabelle

*STAR SCHEMA · PRINZIP*

Microsoft Learn: *"Fact tables always load data at a consistent grain."* Diese Regel wird häufig verletzt und produziert dann stille Fehler.

#### Was ist Granularität?

Granularität definiert, was eine Zeile in der Faktentabelle bedeutet. Beispiele:

- **Granular: eine Zeile pro Verkaufsposition** — atomarste Form
- **Aggregiert: eine Zeile pro Bestellung** — Summe über mehrere Positionen
- **Aggregiert: eine Zeile pro Tag und Produkt** — vorberechnete Tagessummen

#### Warum nicht mischen?

Wenn deine Faktentabelle teils Tageswerte und teils Monatssummen enthält, addiert `SUM([Umsatz])` beides — die Monatssumme wird doppelt gezählt.

#### Was tun, wenn beide Granularitäten gebraucht werden?

Zwei getrennte Faktentabellen, beide mit Beziehung zur Datums-Dimension:

- `fact_verkauf_tag` — Tages-Granularität
- `fact_verkauf_monat` — Monats-Granularität

In Berichten je nach Bedarf eine der beiden Measures nutzen. Aggregations (siehe Sektion 10) ist die Microsoft-Lösung dafür.

### Surrogate Keys vor Business Keys

*STAR SCHEMA · PRINZIP*

Microsoft empfiehlt: in Dimensionen Integer-Surrogate-Keys, nicht Business-Keys. Klingt bürokratisch, hat aber konkrete Vorteile.

#### Surrogate vs. Business Key

| Surrogate Key | Business Key |
|---|---|
| Künstlich generiert (1, 2, 3, ...) | Kommt aus dem Quellsystem ("ABC-12345") |
| Integer | Oft Text |
| Klein | Variabel groß |
| Stabil | Kann sich ändern |

#### Vier Vorteile von Surrogate Keys

1. **Speicher** — 4 Bytes pro Integer vs. 30+ Bytes pro Text-Key. Bei 50 Mio Faktzeilen × 5 Fremdschlüsseln: massiv weniger Modellgröße.

2. **Performance** — Joins über Integer sind die schnellsten überhaupt. VertiPaq komprimiert Integer-Spalten am besten.

3. **Stabilität** — wenn das Quellsystem Schlüssel ändert (Migration, Konsolidierung), bleibt dein Modell-Schlüssel stabil.

4. **Inkrementelle Aktualisierung** — bei großen Modellen erforderlich, funktioniert besser mit Integer-Keys.

#### In Power Query Surrogate erzeugen

```

let
  Source = stg_kunde,
  WithKey = Table.AddIndexColumn(
    Source, "KundenKey",
    1, 1, Int64.Type
  )
in WithKey

```

#### Business Key behalten

KundenID (Business Key) bleibt als zusätzliche Spalte erhalten — für Anzeige und Cross-System-Verknüpfung. Aber: KundenKey ist der PK und FK.

#### Faktentabelle anpassen

In der Faktentabelle den Business Key durch den Surrogate Key ersetzen (per Merge mit der Dimension).

### Single-Direction Beziehungen

*STAR SCHEMA · PRINZIP*

Beziehungen in Power BI haben zwei Richtungs-Optionen: Single (Default) und Both. Microsoft empfiehlt explizit: Single als Default, Both nur bei Bedarf.

#### Single-Direction

Filter propagieren von der 1-Seite zur n-Seite — also von der Dimension zur Faktentabelle. Filter auf Dimension `dim_produkt[Kategorie] = "Elektronik"` filtert `fact_verkauf` auf alle Elektronik-Verkäufe.

#### Both (Bidirektional)

Filter fließen in beide Richtungen. Filter auf der Faktentabelle propagiert zurück zur Dimension. Klingt mächtig, hat aber Probleme:

- **Performance** — jeder Filter wird in beide Richtungen evaluiert
- **Mehrdeutigkeit** — bei mehreren Beziehungspfaden weiß die Engine nicht, welcher gilt
- **Sicherheit** — bei RLS kann ein bidirektionaler Filter ungewollte Daten freigeben

#### Wann ist Both legitim?

- **Bridge-Tabellen für M:N** — Many-to-Many über eine Brückentabelle
- **RLS-spezifische Szenarien** — bewusst und mit Tests
- **Spezial-Berichte** — wenn ein Filter explizit in beide Richtungen wirken soll und es keinen besseren Weg gibt

### Star vor Snowflake

*STAR SCHEMA · ANTI-PATTERN*

Snowflake-Schema = Dimensionen werden weiter normalisiert in Sub-Dimensionen. Theoretisch sauberer, praktisch schlechter für Power BI.

#### Star-Schema

```

fact_verkauf ←→ dim_produkt
              (Kategorie, Unterkat, Hersteller in einer Tabelle)

```

#### Snowflake

```

fact_verkauf ←→ dim_produkt ←→ dim_kategorie ←→ dim_kategorie_gruppe
                                ←→ dim_hersteller ←→ dim_hersteller_land

```

#### Warum Star besser?

- **Performance** — weniger Joins = schnellere Queries
- **VertiPaq-Kompression** — denormalisierte Spalten komprimieren gut
- **DAX einfacher** — Filter müssen nur einen Hop machen
- **Berichts-UX** — alle Attribute in einer Dimension, leichter zu finden

#### Wann ist Snowflake unvermeidlich?

- Sehr breite Dimension (100+ Spalten), die nur teilweise gebraucht wird
- Hierarchie mit eigenen Kennzahlen pro Ebene (z. B. Region hat eigene Verkaufs-Quote)
- Aus Performance-Gründen bei massiv großen Dimensionen (selten)

```

dim_produkt
- ProduktKey, Produktname
- Kategorie, KategorieGruppe, Oberkategorie

```

## DAX · Formelsprache

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
|---|---|---|
| Umsatz aus Menge × Preis | OK in Power Query, nicht in DAX | ✓ als `SUMX` |
| Altersgruppe aus Geburtsdatum | ✓ — als Slicer nutzbar | — |
| Top-10-Kunden-Flag | — | ✓ — Kontext-abhängig |
| Marge (Gewinn / Umsatz) | — | ✓ — über DIVIDE |
| Region aus PLZ | OK, aber besser in Power Query | — |

```

Umsatz = [Menge] * [Preis]

```

```

Umsatz = SUMX(fact_verkauf, fact_verkauf[Menge] * fact_verkauf[Preis])

```

#### Implizite Measures vermeiden

Wenn du eine numerische Spalte in ein Visual ziehst, erzeugt Power BI eine implizite Measure (typischerweise SUM). Sieht praktisch aus, hat aber Probleme:

- Keine zentrale Definition
- Schwierig zu wiederverwenden
- Format und Logik kann nicht angepasst werden
- In Tabular Editor und externe Tools nicht sichtbar

**Stattdessen:** explizite Measures schreiben. `SumUmsatz = SUM(fact_verkauf[Menge])`.

### CALCULATE — die wichtigste Funktion

*DAX · KERNFUNKTION*

CALCULATE ist die einzige DAX-Funktion, die den Filter-Kontext gezielt modifizieren kann. Wer CALCULATE versteht, beherrscht 80 % von DAX.

#### Was macht CALCULATE?

Wertet einen Ausdruck (typischerweise eine Measure) in einem modifizierten Filter-Kontext aus. Die Filter-Argumente können:

- Bestehende Filter **ersetzen** — `CALCULATE([Umsatz], Region[Name] = "Süd")`
- Bestehende Filter **entfernen** — `CALCULATE([Umsatz], ALL(Region))`
- Filter **ergänzen** — `CALCULATE([Umsatz], KEEPFILTERS(...))`

#### Häufige Patterns

```

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

```

SUMX(
  fact_verkauf,
  CALCULATE([Umsatz])
)

```

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
|---|---|---|
| Wer hat? | Measures | Calculated Columns, Iteratoren |
| Wirkt auf | Alle Tabellen über Beziehungen | Nur die aktuelle Tabelle |
| Sichtbar in Spalten | Aggregat | Einzelwert pro Zeile |

```

// Calculated Column: Row Context
fact_verkauf[ZeilenUmsatz] = [Menge] * [Preis]  → pro Zeile berechnet

// Measure: Filter Context
[Umsatz] = SUMX(fact_verkauf, [Menge] * [Preis])  → aggregiert für aktuellen Filter

```

#### Context Transition

Der Brücken-Mechanismus. Wenn du CALCULATE oder eine Measure (die intern CALCULATE nutzt) im Row Context aufrufst, wird der aktuelle Row Context in einen Filter Context umgewandelt.

### Variables (VAR / RETURN)

*DAX · PERFORMANCE*

Microsoft Learn: Variablen halbieren oft die Ausführungszeit, machen DAX lesbar und vereinfachen Debugging. Sollten Standard sein.

#### Syntax

```

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

```

YoY % =
DIVIDE(
  [Umsatz] - CALCULATE([Umsatz], SAMEPERIODLASTYEAR('Datum'[Datum])),
  CALCULATE([Umsatz], SAMEPERIODLASTYEAR('Datum'[Datum]))
)

```

```

YoY % =
VAR Vorjahr = CALCULATE([Umsatz], SAMEPERIODLASTYEAR('Datum'[Datum]))
RETURN
  DIVIDE([Umsatz] - Vorjahr, Vorjahr)

```

#### Variablen sind Konstanten

Wichtige Eigenschaft: Variablen werden zum Zeitpunkt der Definition ausgewertet und bleiben dann konstant — sie ändern sich nicht durch nachfolgende CALCULATE-Aufrufe.

```

VAR Aktuell = [Umsatz]
RETURN CALCULATE(Aktuell, Region[Name] = "Süd")

```

### Time Intelligence

*DAX · ZEITANALYSE*

Zeitreihen-Funktionen — YTD, MTD, Same-Period-Last-Year. DAX hat dafür eingebaute Funktionen, vorausgesetzt die Datums-Dimension ist sauber.

#### Voraussetzungen

1. Echte Datums-Dimension (siehe Sektion 2 und 4)

2. Beziehung von Datums-Dim zur Faktentabelle

3. Datums-Tabelle **markiert** (Mark as date table) mit DateKey-Spalte

4. Lückenlose Datumsfolge in der Dimension (jeden Tag eine Zeile, auch Wochenenden)

#### Die wichtigsten Funktionen

```

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

```

// YTD mit Geschäftsjahr-Ende 30. Juni
Umsatz FY YTD = TOTALYTD(
  [Umsatz],
  'Datum'[Datum],
  "30/06"
)

```

Oder: eigene Geschäftsjahr-Spalte in der Datums-Dim und manuelle CALCULATE-Logik.

### Anti-Patterns

*DAX · FALLSTRICKE*

Sechs typische Fehler, die jeder Einsteiger einmal macht. Wer sie kennt, spart sich Wochen Debugging.

#### 1. FILTER statt Boolean

```

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

```

// Schlecht — wirft Fehler bei 0
Marge = [Gewinn] / [Umsatz]

// Gut — DIVIDE liefert BLANK bei 0
Marge = DIVIDE([Gewinn], [Umsatz])

// Mit Default
Marge = DIVIDE([Gewinn], [Umsatz], 0)

```

#### 3. IFERROR maskiert Probleme

```

// Schlecht — versteckt Bugs
IFERROR([Komplexe Logik], 0)

// Gut — Logik so schreiben, dass kein Fehler entsteht
VAR Wert = [Komplexe Logik]
RETURN IF(ISBLANK(Wert), 0, Wert)

```

#### 4. Implizite Measures durch Drag-and-Drop

Statt einer numerischen Spalte ins Visual zu ziehen (was eine implizite SUM-Measure erzeugt): eine explizite Measure schreiben. Bessere Wartbarkeit, klare Definition, in Tabular Editor sichtbar.

#### 5. Calculated Columns für Aggregate

```

// Schlecht — verbraucht Speicher pro Zeile
fact_verkauf[Umsatz] = [Menge] * [Preis]

// Gut — Measure, kein Speicher
Umsatz = SUMX(fact_verkauf, fact_verkauf[Menge] * fact_verkauf[Preis])

```

#### 6. SUMX über die ganze Tabelle

Bei großen Faktentabellen ist `SUMX` über alle Zeilen langsam. Wenn möglich: vorberechnete Spalte in Power Query, dann `SUM` statt `SUMX`.

## Deep Dive: IBCS

### SAY — Convey a message

*IBCS · SAY*

Jede Visualisierung hat einen Sinn — eine Aussage. Die Aussage gehört nicht versteckt in eine Beschriftung am Rand, sondern an den Anfang des Visuals.

#### Was bedeutet das konkret?

- **Klare Botschaft** statt beschreibender Titel
- **Quantifiziert** — Zahlen mit Kontext, nicht nur "viel/wenig"
- **Action-Orientiert** — was bedeutet das für den Empfänger

#### Beschreibender Titel vs. Botschaft

| Schlecht (beschreibend) | Gut (Botschaft) |
|---|---|
| "Umsatz Q3 2024" | "Umsatz Q3 plus 15 % über Plan dank Süd-Region" |
| "Verkaufszahlen nach Region" | "Drei Regionen unterhalb Plan, größte Lücke: West" |
| "Auftragseingang Dashboard" | "Auftragseingang erholt sich, +8 % gegenüber Vormonat" |

#### Dynamische Titel via DAX

Eine Measure schreibt den Titel:

```

VAR Diff = [Umsatz] - [Plan]
VAR Pct = DIVIDE(Diff, [Plan])
RETURN "Umsatz " & FORMAT([Umsatz], "#,0") &
  IF(Diff >= 0,
    " · +" & FORMAT(Pct, "0 %") & " über Plan",
    " · " & FORMAT(Pct, "0 %") & " unter Plan")

```

#### Titel an Visual binden

Im Visual-Format-Pane: "Title" → fx-Knopf rechts neben Title text → "Field value" → die Measure auswählen.

### UNIFY — Apply semantic notation

*IBCS · UNIFY*

"Things that mean the same should look the same." Wenn Ist-Werte überall solide gefüllt, Plan-Werte überall hohl und Vorjahres-Werte überall schraffiert sind, liest sich jedes Diagramm in Sekundenbruchteilen.

#### Was ist semantische Notation?

Visuelle Eigenschaften (Form, Füllung, Farbe) werden für Bedeutung verwendet — nicht für Dekoration.

#### Die IBCS-Notation

| Bedeutung | Notation |
|---|---|
| Ist-Werte (ACT) | Solid · vollständig gefüllt |
| Plan / Budget (PL, BU) | Outlined · nur Kontur |
| Forecast / Vorjahr (FC, PY) | Hatched · schraffiert |
| Positiver Wert | schwarz / dunkel |
| Negativer Wert | rot |

#### Power-BI-Umsetzung

- Custom Theme (JSON) mit definierten Farben für ACT/PL/FC
- Inforiver oder Zebra BI Custom Visual für Variance-Charts mit Solid/Outlined/Hatched
- Bei Bordmitteln: gleicher Farb-Code für gleiche Bedeutung konsequent durchziehen

### CONDENSE — Increase information density

*IBCS · CONDENSE*

Mehr Information pro Quadratzentimeter Bildschirm. Edward Tufte nennt das "data-ink ratio" — möglichst viel Tinte für Daten, möglichst wenig für Dekoration.

#### Wie erhöht man Datendichte?

- **Small Multiples** — Mini-Charts in einer Matrix, vergleichbare Werte nebeneinander
- **Sparklines** — Mini-Linien-Charts in Tabellen-Zellen
- **Tabellen statt Liste-Charts** — eine Tabelle zeigt 5× mehr Information als 5 Säulendiagramme
- **Variance-Charts** — Abweichung zeigt mehr als nur Wert
- **Mehrere Achsen-Werte** — Säulen mit Plan-Kontur darüber statt zwei getrennte Charts

#### Sparklines in Tabellen

Preview seit Dezember 2021, GA seit Juni 2025. In einer Matrix-Tabelle eine Spalte zeigt einen Mini-Linien-Chart über die letzten 12 Monate. Mit der Zeile-für-Zeile-Übersicht der Tabelle plus dem visuellen Trend pro Zeile.

### CHECK — Ensure visual integrity

*IBCS · CHECK*

Was groß aussieht, muss auch numerisch groß sein. Verzerrte Achsen, abgeschnittene Skalen und 3D-Effekte erzeugen falsche Eindrücke.

#### Vier Integritätsregeln

1. **Y-Achse beginnt bei Null** bei Säulen- und Balken-Charts. Immer.

2. **Skalen konsistent** — wenn mehrere Charts vergleichbar sein sollen, gleiche Y-Achse

3. **Keine 3D-Effekte** — verzerren die Wahrnehmung

4. **Doppelachsen vermeiden** — sie suggerieren Korrelationen, die nicht real sind

#### Y-Achse bei Null

Klassischer Trick zur Verzerrung: ein Säulen-Chart mit Werten 95, 97, 99, 102. Wenn die Y-Achse bei 90 startet, sehen die Säulen extrem unterschiedlich aus. Bei Null-Achse: nur wenige Prozent Unterschied. Erste Variante manipuliert die Wahrnehmung.

#### Linien-Charts sind anders

Bei Linien-Charts kann abgeschnittene Y-Achse legitim sein — wenn die Aussage über Veränderung geht, nicht über absolute Werte. Aber: dann **klar als Skalenbruch markieren**.

### EXPRESS — Choose proper visualization

*IBCS · EXPRESS*

Den richtigen Chart-Typ für die Aussage. Drei Chart-Typen reichen für 90 % aller Business-Berichte.

#### Die drei Standard-Chart-Typen

| Aussage | Chart-Typ |
|---|---|
| Entwicklung über Zeit (wenige Punkte) | **Säulen-Chart** (vertikal) |
| Entwicklung über Zeit (viele Punkte) | Linien-Chart |
| Ranking / Vergleich | **Balken-Chart** (horizontal) |
| Korrelation | Scatter / Bubble |
| Anteile am Ganzen | Balken-Chart sortiert (nicht Pie!) |

#### Was vermeiden?

- **Pie-Charts** — Menschen können Winkel nicht gut vergleichen
- **Donut-Charts** — schlechter als Pie (Lücke in der Mitte hilft nicht)
- **Radar / Spider** — verzerren Skalen, schwer lesbar
- **3D-Säulen** — visuell verzerrend
- **Stacked Lines** — verwirrend, weil die Linien nicht direkt vergleichbar sind

#### Wann Säulen, wann Linien?

Bei diskreten Zeitpunkten (Monatsabschlüsse, Quartale): Säulen. Bei kontinuierlichem Verlauf (Tageswerte, IoT-Daten): Linien. Faustregel: bis ~12 Datenpunkte Säulen, danach Linien.

### SIMPLIFY — Avoid clutter

*IBCS · SIMPLIFY*

Alles raus, was keinen Informationswert hat. Edward Tufte: "Erase non-data ink."

#### Was ist Noise?

- **Gridlines** in voller Stärke — Lichtgrau reicht oder ganz weglassen
- **Doppelte Achsen-Beschriftungen** — wenn die Werte daneben stehen, Achse weg
- **Schatten und Verläufe** — Dekoration ohne Mehrwert
- **3D-Effekte** — verzerren und ablenken
- **Bunte Hintergründe** — weißer Hintergrund ist meistens besser
- **Logos auf jedem Visual** — einmal im Header reicht
- **Legenden, wenn nicht nötig** — direkte Beschriftung im Visual ist klarer

#### Visual aufräumen

Im Format-Pane systematisch durchgehen:

- "Background" — falls farbig: auf Weiß setzen
- "Gridlines" — auf "Off" oder hellgrau
- "Data labels" — wenn lesbar, Achse weglassen
- "Title" — nur wenn aussagekräftig, sonst weg
- "Legend" — wenn nur eine Serie, weg

#### Theme als Standard

Einmal ein sauberes Theme bauen (JSON-Datei), für alle Berichte als Default setzen. Macht aus jedem Bericht automatisch ein Simplify-konformes Visual.

### STRUCTURE — Organize content

*IBCS · STRUCTURE*

Inhalte folgen einer Logik. Barbara Mintos Pyramid Principle, MECE-Strukturierung, klare Lese-Reihenfolge.

#### Pyramidenprinzip

Wichtigste Aussage zuerst (Pyramide-Spitze), dann die Belege (Pyramide-Basis):

1. **Antwort** — was ist die Kernaussage?

2. **Argumente** — drei Hauptpunkte, die die Antwort stützen

3. **Belege** — Daten und Details pro Argument

#### MECE-Struktur

**M**utually **E**xclusive, **C**ollectively **E**xhaustive — Kategorien dürfen sich nicht überlappen und müssen alle Fälle abdecken.

Schlechte Kategorisierung: "Männer / Frauen / Mitarbeiter / Kunden" — Mitarbeiter und Kunden sind nicht exklusiv zu Männern/Frauen. Bessere: "Mitarbeiter / Kunden / Andere" UND "Männlich / Weiblich / Divers".

#### Lese-Reihenfolge in Berichten

- **Oben links** — wichtigster Inhalt (Lead-Visual, KPIs)
- **Oben rechts** — Filter, Auswahl
- **Mitte** — Hauptanalyse
- **Unten** — Detail, Drilldown-Möglichkeiten

### Solid · Ist-Werte (ACT)

*IBCS · NOTATION*

Solide Füllung steht für realisierte Werte — was tatsächlich passiert ist. Die "stärkste" visuelle Form.

#### Visuelle Eigenschaften

- Vollständig gefüllt, ohne Muster
- Dunkle, gesättigte Farben (typischerweise schwarz oder Unternehmens-Hauptfarbe)
- Wirkt "schwer" und definitiv — passt zur Bedeutung "ist gewesen"

#### Verwendung

- **ACT** — Actual, Ist-Werte des aktuellen Zeitraums
- Manchmal: vollendete Vergangenheit (Letztes Jahr abgeschlossen)

#### Power-BI-Umsetzung

Default in Power BI ist solide Füllung — also keine Sonderaktion nötig. Wichtig: **konsistent** beim ACT bleiben. Wenn an einer Stelle solide, dann überall.

### Outlined · Plan / Budget (PL, BU)

*IBCS · NOTATION*

Nur Kontur, keine Füllung. Steht für geplante oder budgetierte Werte — was sein sollte.

#### Visuelle Eigenschaften

- Nur Linie (Border), Füllung transparent oder weiß
- Gleicher Farbton wie das ACT, aber ohne Fülle
- Wirkt "leichter" und "noch nicht da" — passt zur Bedeutung "wird angestrebt"

#### Verwendung

- **PL** — Plan, verbindlicher Plan
- **BU** — Budget, bewilligtes Budget
- Manchmal: Ziel, Soll-Wert

#### Power-BI-Umsetzung

Native nicht direkt verfügbar, aber Workarounds:

1. **Im Bar-Chart:** Fill auf "No fill", Border auf 2px in der ACT-Farbe

2. **In Tabellen-Visuals:** Conditional Formatting für Border

3. **Mit Custom Visuals:** Inforiver oder Zebra BI nativ unterstützt

### Hatched · Forecast / Vorjahr (FC, PY)

*IBCS · NOTATION*

45°-Schraffur. Steht für Forecast (Prognose) oder Previous Year (Vorjahr).

#### Visuelle Eigenschaften

- 45°-Schräglinien als Füllmuster
- Gleicher Farbton wie ACT, aber als Schraffur
- Wirkt "weicher" als Solid — passt zur Bedeutung "voraussichtlich / verglichen"

#### Verwendung

- **FC** — Forecast, Hochrechnung künftiger Werte
- **PY** — Previous Year, Vorjahres-Vergleich
- **FC1, FC2, FC3** — verschiedene Forecast-Stände (z. B. Anfang, Mitte, Ende des Jahres)

#### Power-BI-Umsetzung

**Schwierig nativ.** Power BI hat keine eingebaute Schraffur-Füllung für Charts. Drei Optionen:

1. **Custom Visuals** — Inforiver, Zebra BI: nativ unterstützt

2. **SVG-Marker** in Tabellen mit DAX

3. **Annähernde Lösung** — leichtere Farbsättigung statt Schraffur (verliert die strenge IBCS-Notation, aber besser als nichts)

## Visualisierung

### Richtigen Chart-Typ wählen

*VIZ · EXPRESS*

Drei Chart-Typen reichen für 90 % aller Business-Berichte. Säulen, Balken, Linien.

#### Entscheidungsbaum

- **Entwicklung über Zeit, wenige Datenpunkte** (bis ca. 12) → **Säulen-Chart** vertikal
- **Entwicklung über Zeit, viele Datenpunkte** (Tageswerte, IoT) → **Linien-Chart**
- **Ranking, Vergleich von Kategorien** → **Balken-Chart** horizontal, sortiert
- **Korrelation zweier Kennzahlen** → Scatter-Chart
- **Verteilung** → Histogramm oder Box-Plot
- **Anteile am Ganzen** → sortierter Balken-Chart (NICHT Pie!)

#### Säulen vs. Balken

| Säulen (vertikal) | Balken (horizontal) |
|---|---|
| Zeit-Achse: Monate, Quartale | Kategorien-Liste: Produkte, Kunden |
| Bis ~12 Werte | Bis ~20-30 Werte |
| Beschriftung kurz | Beschriftung kann lang sein (steht waagerecht) |

#### Pie-Chart-Diskussion

Pie ist ein Anti-Pattern. Menschen können Winkel nicht gut vergleichen. "33 % oder 28 %?" ist im Pie kaum unterscheidbar, im Balken-Chart sofort klar. Wenn die Geschäftsführung Pies fordert: höflich Alternative vorschlagen, mit Beispiel zeigen.

### Noise eliminieren

*VIZ · SIMPLIFY*

Power BI Default-Charts sind voller Dekoration ohne Informationswert. Wer das nicht aufräumt, schwächt die Botschaft.

#### Was raus muss

- **Gridlines** — bei Bar-Charts fast nie nötig; bei Line-Charts hellgrau
- **Schatten** — Visuals werfen Default-Schatten; weg damit
- **Verläufe** — Farben sollten einfarbig sein
- **3D-Effekte** — immer raus (verzerren Wahrnehmung)
- **Farbige Hintergründe** — Weiß ist die Default-Wahl
- **Redundante Labels** — wenn Y-Achse beschriftet, keine Data Labels (oder umgekehrt)
- **Legenden mit einer Serie** — selbsterklärend, weg
- **Borders um Visuals** — Whitespace zwischen Visuals reicht

#### Format-Pane systematisch

Visual auswählen → Format-Pane öffnen → durch jede Sektion klicken: General, X-Axis, Y-Axis, Data labels, Title, Legend, Background, Lock aspect.

#### Eigenes Theme erstellen

Wenn die Standard-Aufräum-Operationen jedes Mal wiederholt werden: ein Theme als JSON-Datei. Im Theme: Default-Werte für Gridlines, Schriftarten, Farben. Wird dann automatisch auf jedes Visual angewendet.

#### Theme laden

View-Tab → Themes → Browse for themes → JSON-Datei wählen. Alle bestehenden Visuals erben die neuen Defaults.

#### Theme-JSON Beispiel

```

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

### Achsen-Integrität

*VIZ · CHECK*

Eine falsch skalierte Achse kann die wahre Botschaft komplett verfälschen — meistens versehentlich, manchmal gezielt manipulativ.

#### Drei Achsen-Regeln

1. **Y-Achse beginnt bei Null** bei Säulen- und Balken-Charts

2. **Gleiche Skala für vergleichbare Charts**

3. **Skalenbruch sichtbar markieren**, wenn unvermeidbar

#### Power BI Default-Falle

Power BI Desktop hat Y-Achse standardmäßig auf "Auto" — beginnt häufig nicht bei Null. Sondern beim niedrigsten Wert. Das ist nicht "Daten richtig zeigen", sondern eine willkürliche Vergrößerung des sichtbaren Bereichs.

#### Y-Achse fixieren

Visual auswählen → Format → Y-Axis → "Range" → Minimum auf 0 setzen.

#### Mehrere Charts vergleichbar machen

Wenn zwei Charts nebeneinander stehen, die thematisch verglichen werden: gleiche Y-Achse manuell setzen (Maximum auf den größeren Wert beider Charts).

#### Skalenbruch (wenn unvermeidbar)

Wenn ein Wert massiv größer ist als alle anderen (z. B. Mega-Kunde verzerrt Top-10-Liste): Skalenbruch mit Zickzack-Symbol markieren. Power BI hat das nicht nativ — manuell als Text-Annotation.

### Botschaften statt beschreibender Titel

*VIZ · SAY*

Der Titel eines Visuals sollte sagen, was zu sehen ist — quantifiziert. Nicht beschreiben, was gemessen wird.

#### Vorher / Nachher

| Beschreibend | Botschaft |
|---|---|
| Umsatz nach Region | Süd treibt Wachstum, drei Regionen unter Plan |
| Lieferzeit Q3 | Lieferzeit Q3 verkürzt sich auf 3,2 Tage (−12 %) |
| Auftragseingang Monat | Auftragseingang März: 1,8 M€ · höchster Wert seit 2 Jahren |
| Mitarbeiterfluktuation | Fluktuation steigt: 8,5 % p. a. · Ziel 5 % |

#### Dynamischer Titel als DAX-Measure

```

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

#### Titel an Measure binden

Visual auswählen → Format → Title → fx-Knopf neben "Title text" → "Field value" → die Measure auswählen.

### Farbe nur für Bedeutung

*VIZ · UNIFY*

Farbe ist mächtig — und wird ständig falsch eingesetzt. Regel: Farbe trägt Bedeutung. Wenn keine Bedeutung dahinter steht, ist Grau die richtige Farbe.

#### Wann welche Farbe?

| Verwendung | Farbe |
|---|---|
| Standard-Datenwert | Schwarz oder Dunkelgrau |
| Negative Abweichung | Rot |
| Positive Abweichung | Schwarz oder Grün (zurückhaltend) |
| Hervorhebung (eine Kategorie) | Akzentfarbe (z. B. Unternehmensfarbe) |
| Status-Indikatoren | Ampel (rot, gelb, grün) — aber sparsam |

#### Anti-Patterns

- **Jede Kategorie eine andere Farbe** — Regenbogen-Chart ohne Bedeutung
- **Farbverläufe** — suggerieren Reihenfolge, wo keine ist
- **Rot und Grün allein** — Farbenblinde (~8 % aller Männer) sehen es gleich; immer mit Symbol/Text kombinieren

#### Custom Theme

Eigene Theme-JSON mit definierten `dataColors` und Status-Farben. Wird automatisch auf alle Visuals angewendet. Konsistenz über alle Berichte des Teams.

### Informationsdichte erhöhen

*VIZ · CONDENSE*

Mehr Information pro Quadratzentimeter Bildschirm — ohne die Klarheit zu verlieren. Vier konkrete Werkzeuge in Power BI.

#### 1. Small Multiples

Seit 2021 nativ in Power BI. Im Visual: "Small multiples" Feld setzen — und der Chart wird zu einer Matrix kleiner Charts, einer pro Kategorie.

#### 2. Sparklines in Tabellen

Preview seit Dezember 2021, GA seit Juni 2025. In einer Matrix: rechte Spalte als Sparkline (Mini-Linien-Chart) für den Verlauf der letzten 12 Monate. Werte und Trend in einer Tabelle.

#### 3. Variance Charts

Zeigt nicht zwei Werte, sondern die Differenz — fokussiert auf die Botschaft. Power BI nativ: kein eingebauter Variance-Chart, aber:

- Mit zwei übereinandergelegten Säulen (ACT solid, PL outlined) bauen
- Mit DAX die Differenz als Measure berechnen, in separates Chart
- Custom Visuals: Inforiver, Zebra BI haben Variance nativ

#### 4. Tabellen mit visuellen Elementen

Eine Matrix mit Conditional Formatting: Hintergrundfarbe nach Wert, Icon-Spalten für Status, Sparkline für Trend. Mehr Information als ein "schönes" Säulen-Chart.

## Interaktivität · UX

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

#### Cross-Report-Drillthrough

Seit 2020: Drillthrough kann sogar in einen anderen Bericht im selben Workspace springen. Praktisch für aufgeteilte Berichte (z. B. von Übersicht in eine Detail-Lösung).

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

#### Personal Bookmarks

Im Service können Anwender eigene Bookmarks speichern — getrennt von den vom Autor angelegten "Report Bookmarks". Praktisch für Power-User, die ihre Lieblings-Filter merken wollen.

### Buttons &amp; Navigation

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

#### Field Parameters für Dimensionen

Funktioniert auch für die X-Achse oder Legend-Spalte. Anwender wählt: "Nach Region", "Nach Kategorie", "Nach Kunde" — die Achse des Visuals wechselt entsprechend.

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

```

Ampel = IF(
  [Umsatz] >= [Plan], "#22C55E",
  IF([Umsatz] >= 0.9*[Plan], "#F59E0B", "#EF4444"))

```

Diese Measure als "Field value" in Conditional Formatting nutzen.

#### Dynamische Titel

Im Format-Pane → Title → fx-Knopf neben Title text → Measure auswählen, die den Titel-String liefert. Titel passt sich an Filter an.

## Service & Sharing

### Workspaces

*SERVICE · CONTAINER*

Workspaces sind die Container, in denen Power-BI-Inhalte organisiert werden. Reports, Datasets, Dashboards, Apps — alles lebt in einem Workspace.

#### Drei Workspace-Typen

| Typ | Beschreibung |
|---|---|
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

### Power BI Apps

*SERVICE · DISTRIBUTION*

Apps sind der Microsoft-empfohlene Weg, Inhalte an Konsumenten zu verteilen. Eine App ist die "Vitrine" eines Workspaces — gepackt und veröffentlicht.

#### Workspace vs. App

| Workspace | App |
|---|---|
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

### Workspace-Rollen

*SERVICE · BERECHTIGUNGEN*

Vier Rollen, vier Berechtigungsstufen. Wer welche Rolle bekommt, ist die Grundlage von Power-BI-Governance.

#### Die vier Rollen

| Rolle | Berechtigung |
|---|---|
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

- Admin: SG-BI-Admin (1 Person + Vertretung)
- Member: SG-BI-Vertrieb-Developer (3 Personen)
- Contributor: leer (für gelegentliche Helfer)
- Viewer: leer (Konsumenten kommen über App, nicht über Workspace)

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
|---|---|---|
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
|---|---|---|---|
| App | Sehr gut | Pro (oder Capacity) | Vollständig |
| Direct Share | Schlecht | Pro | Vollständig |
| Embed | Gut | Variiert | Variabel |
| Subscription | Sehr gut | Optional | Keine |

## Row-Level Security · RLS

### Statische RLS

*RLS · METHODE 1*

Die einfachste Form: Hardcodierte Filter pro Rolle. Funktioniert, skaliert aber schlecht.

#### Funktionsweise

Pro Rolle wird ein DAX-Filter definiert. Anwender werden den Rollen zugewiesen — sie sehen nur Daten, die ihr Filter durchlässt.

#### Rolle erstellen

In Power BI Desktop: Modeling-Tab → "Manage roles" → "New" → Rollenname (z. B. "Region Süd").

#### Filter definieren

Tabelle wählen (z. B. `dim_region`) → Filter-Ausdruck:

```

[RegionName] = "Süd"

```

**Abb. · Manage Roles Dialog (Default Editor)** Tabellen-Auswahl links, Filter-Ausdruck rechts. "Switch to DAX editor" für komplexere Ausdrücke. Quelle: [RLS · Microsoft Learn](https://learn.microsoft.com/fabric/security/service-admin-row-level-security)

#### Test

Modeling → "View as" → Rolle auswählen → der Bericht filtert sich, als wäre der Anwender in dieser Rolle.

#### Im Service Anwender zuweisen

Bericht publishen → im Service: Dataset → "Security" → Rolle auswählen → User oder Sicherheitsgruppe hinzufügen.

- "Region Nord" mit Filter `dim_region[Name] = "Nord"`
- "Region Süd" mit Filter `dim_region[Name] = "Süd"`
- "Region West" mit Filter `dim_region[Name] = "West"`

#### Vor- und Nachteile

| Pro | Contra |
|---|---|
| Einfach zu verstehen | Eine Rolle pro Filter-Variante |
| Klare Filter-Logik | Bei 50 Regionen: 50 Rollen — unwartbar |
| Test einfach (View as) | Manuelle Anwender-Zuweisung pro Rolle |

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

```

[UserEmail] = USERPRINCIPALNAME()

```

**Abb. · DAX Editor in Manage Roles** Für dynamische Filter mit USERPRINCIPALNAME() / USERNAME() ist der DAX-Editor Pflicht (Switch to DAX editor). Mit IntelliSense und Syntax-Validierung. Quelle: [RLS · Microsoft Learn](https://learn.microsoft.com/fabric/security/service-admin-row-level-security)

#### Filter propagiert über Beziehungen

Wenn der Anwender Max sich anmeldet, filtert die Rolle `dim_berechtigung` auf seine Zeilen. Die Beziehung zu `dim_region` filtert die Regionen entsprechend. Die Beziehung zur Faktentabelle filtert die Verkaufsdaten.

#### Im Service einmal zuweisen

Eine Rolle, alle Anwender werden ihr zugewiesen (am besten via Sicherheitsgruppe "alle Vertriebsmitarbeiter"). Pflege passiert ausschließlich in der Berechtigungstabelle.

#### Bidirektionale Beziehung manchmal nötig

Wenn die Berechtigung über mehrere Tabellen propagiert, muss eine Beziehung bidirektional sein. Vorsicht: bidirektional ist Performance- und Sicherheits-Risiko. **Nur bei dynamischer RLS und nur nach Test.**

### View As Role — Pflicht vor Production

*RLS · VALIDIERUNG*

RLS testen, bevor sie publiziert wird. Wer das vergisst, riskiert Datenlecks.

#### In Desktop

Modeling-Tab → "View as" → "Other user" und/oder eine Rolle wählen → "OK".

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

### RLS-Performance

*RLS · PERFORMANCE*

RLS-Filter werden auf jede Abfrage angewendet. Schlecht designte RLS macht den ganzen Bericht langsam.

#### Drei Performance-Regeln

1. **Filter auf Dimensionen, nicht auf Faktentabelle**

2. **Integer-Schlüssel statt Text**

3. **Bidirektional vermeiden, wenn möglich**

#### 1. Dimension vs. Faktentabelle

```

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

### Object-Level Security (OLS)

*RLS · ERWEITERT*

RLS schützt Zeilen — OLS schützt ganze Spalten oder Tabellen. Brauchst du, wenn bestimmte Anwender bestimmte Informationen **gar nicht** sehen sollen.

#### Unterschied RLS vs. OLS

| RLS | OLS |
|---|---|
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

#### Hybrid: Personen UND Gruppen

Manchmal sinnvoll: Gruppe als Standard + Einzelne Personen für Ausnahmen. Aber: Ausnahmen kosten Wartung. So sparsam wie möglich.

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

**Abb. · "Apply security filter in both directions"** Zusätzlich zur bidirektionalen Cross-Filter-Richtung muss diese Checkbox aktiv sein, damit RLS-Filter in beide Richtungen propagieren. Quelle: [Microsoft Learn](https://learn.microsoft.com/fabric/security/service-admin-row-level-security)

#### Risiken

- **Performance** — Filter wird in beide Richtungen evaluiert, kann Queries verlangsamen
- **Mehrdeutigkeit** — bei komplexen Modellen kann die Engine nicht eindeutig auflösen
- **Sicherheit** — falsche bidirektionale Filter können ungewollt Daten freigeben
- User mit eingeschränkter Berechtigung — sieht er nur seine Daten?
- User ohne Berechtigung — sieht er gar nichts?
- User mit Vollberechtigung — sieht er alles?

### RLS-Anti-Patterns

*RLS · FALLSTRICKE*

Fünf häufige Fehler, die RLS-Setups unsicher oder unbrauchbar machen.

#### 1. LOOKUPVALUE statt Beziehung

```

// Schlecht — LOOKUPVALUE im RLS-Filter
[Region] = LOOKUPVALUE(
  dim_berechtigung[Region],
  dim_berechtigung[UserEmail], USERPRINCIPALNAME()
)

```

Funktioniert, ist aber langsam und versteckt die Logik. Besser: Berechtigungstabelle mit Beziehung modellieren.

#### 2. Filter auf Faktentabelle

RLS-Filter direkt auf die Faktentabelle anwenden:

```

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

## Erweitert & externe Tools

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

### Composite Models &amp; Aggregations

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
|---|---|
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

```

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
|---|---|
| Liest komprimierte Daten | Berechnet DAX-Logik |
| Parallel, sehr schnell | Single-threaded, langsamer |
| Wenn SE langsam → Modell zu groß / Filter ungünstig | Wenn FE langsam → DAX-Code zu komplex |

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

- 23 × fehlende Format Strings → "Generate fix script" → automatisch korrigiert
- 5 × Auto-Date/Time aktiv → manuell deaktivieren
- 8 × Float statt Currency → datatype umstellen
- 4 × unnötige bidirektionale Beziehungen → prüfen, umstellen
- 7 × andere

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

```

Umsatz 90T = CALCULATE([Umsatz],
  DATESINPERIOD('Datum'[Datum],
    LASTDATE('Datum'[Datum]), -90, DAY))

```

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

### Performance-Optimierung

*TOOLS · ÜBERGREIFEND*

Power-BI-Modelle werden mit der Zeit langsam — größere Datenmengen, mehr Measures, mehr Visuals. Vier Werkzeuge zur Diagnose und Optimierung.

#### 1. Performance Analyzer (Desktop)

View-Tab → Performance Analyzer. "Start recording" → durch den Bericht klicken → die Queries jedes Visuals werden aufgezeichnet. Sortiert nach Dauer. Identifiziert die langsamsten Visuals.

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

- Folding wiederhergestellt → Refresh 8 Minuten
- Float auf Currency → Modell von 800 MB auf 320 MB
- Auto-Date/Time aus → weitere 50 MB
- Drei komplexe DAX-Measures mit Variables → Bericht-Ladezeit von 8s auf 2s

## Quellen & *weiterführende Literatur*

Dieser Guide stützt sich auf die offizielle Microsoft-Learn-Dokumentation, die IBCS-Standards von Hichert+Faisst und etablierte Community-Quellen (Marco Russo & Alberto Ferrari / SQLBI, Tabular-Editor- und DAX-Studio-Communities). Jede zitierte Zahl und jede Best-Practice-Empfehlung ist hier rückverfolgbar. **Quellen-Validierung Mai 2026:** Folding-Benchmark, Refresh-Limits, F-SKU-Modellgrößen, Star-Schema-Quotes, RLS-Viewer-Regel, DAX-Variables-Performance und Auto-Date/Time-Empfehlung wurden gegen Microsoft Learn verifiziert. Versionsdaten (Field Parameters Preview Mai 2022/GA Juli 2025, Sparklines Preview Dez 2021/GA Juni 2025, Small Multiples GA Juli 2021, ISO/AWI 24896 Juli 2024) sind im Text präzisiert. **Screenshots:** Die in einzelnen Modal-Karten eingebetteten Screenshots stammen direkt von Microsoft-Learn-CDN und stehen unter der Microsoft-Dokumentations-Lizenz (CC BY 4.0) zur freien Nutzung mit Quellenangabe. Da sich die Plattform monatlich weiterentwickelt, im Zweifel die jeweils aktuellste Quell-Seite konsultieren.

- [Was ist Power BI? — Übersicht](https://learn.microsoft.com/de-de/power-bi/fundamentals/power-bi-overview)
- [Power BI Desktop — Einstieg](https://learn.microsoft.com/de-de/power-bi/fundamentals/desktop-getting-started)
- [Power BI in Microsoft Fabric](https://learn.microsoft.com/de-de/power-bi/fundamentals/fabric-power-bi)
- [Power BI Premium & Capacity](https://learn.microsoft.com/de-de/power-bi/enterprise/service-premium-what-is)
- [On-Premises Data Gateway](https://learn.microsoft.com/de-de/power-bi/connect-data/service-gateway-onprem)
- [Storage Modes: Import, DirectQuery, Direct Lake](https://learn.microsoft.com/de-de/power-bi/connect-data/service-dataset-modes-understand)
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
- [Star-Schema — Relevanz und Anleitung](https://learn.microsoft.com/de-de/power-bi/guidance/star-schema)
- [Beziehungen verstehen](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-relationships-understand)
- [Beziehungen erstellen und verwalten](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-create-and-manage-relationships)
- [Datums-Tabelle markieren](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-date-tables)
- [Bidirektionale Beziehungen](https://learn.microsoft.com/de-de/power-bi/transform-model/desktop-bidirectional-filtering)
- [DAX — Übersicht](https://learn.microsoft.com/de-de/dax/dax-overview)
- [CALCULATE · Funktions-Referenz](https://learn.microsoft.com/de-de/dax/calculate-function-dax)
- [DAX Variables · Best Practice](https://learn.microsoft.com/de-de/dax/best-practices/dax-variables)
- [FILTER als Filter-Argument vermeiden](https://learn.microsoft.com/de-de/dax/best-practices/dax-avoid-avoid-filter-as-filter-argument)
- [DIVIDE · Division durch Null abfangen](https://learn.microsoft.com/de-de/dax/divide-function-dax)
- [Time Intelligence Functions](https://learn.microsoft.com/de-de/dax/time-intelligence-functions-dax)
- [USERPRINCIPALNAME · DAX-Referenz](https://learn.microsoft.com/de-de/dax/userprincipalname-function-dax)
- [Visualisierungstypen in Power BI](https://learn.microsoft.com/de-de/power-bi/visuals/power-bi-visualization-types-for-reports-and-q-and-a)
- [Drillthrough einrichten](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-drillthrough)
- [Bookmarks · Übersicht](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-bookmarks)
- [Field Parameters](https://learn.microsoft.com/de-de/power-bi/create-reports/power-bi-field-parameters)
- [Report-Page Tooltips](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-tooltips)
- [Dynamische Titel · Conditional Formatting](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-conditional-format-visual-titles)
- [Small Multiples](https://learn.microsoft.com/de-de/power-bi/create-reports/desktop-small-multiples)
- [Workspaces erstellen und verwalten](https://learn.microsoft.com/de-de/power-bi/collaborate-share/service-create-the-new-workspaces)
- [Workspace-Rollen](https://learn.microsoft.com/de-de/power-bi/collaborate-share/service-roles-new-workspaces)
- [Apps publizieren · mit Audiences](https://learn.microsoft.com/de-de/power-bi/collaborate-share/service-create-distribute-apps)
- [Deployment Pipelines](https://learn.microsoft.com/de-de/fabric/cicd/deployment-pipelines/intro-to-deployment-pipelines)
- [Datenaktualisierung · Übersicht](https://learn.microsoft.com/de-de/power-bi/connect-data/refresh-data)
- [Row-Level Security · Power BI](https://learn.microsoft.com/de-de/fabric/security/service-admin-row-level-security)
- [RLS Guidance · Best Practices](https://learn.microsoft.com/de-de/power-bi/guidance/rls-guidance)
- [Object-Level Security · Tabular Models](https://learn.microsoft.com/de-de/analysis-services/tabular-models/object-level-security)
- [Performance-Optimierung · Übersicht](https://learn.microsoft.com/de-de/power-bi/guidance/power-bi-optimization)
- [IBCS Association · Standards-Übersicht](https://www.ibcs.com/)
- [IBCS Standards · vollständig (CC BY-SA)](https://www.ibcs.com/standards/)
- [SUCCESS-Formel · die 7 Regeln im Detail](https://www.ibcs.com/success/)
- [ISO/AWI 24896 · Standard notation for business reports](https://www.iso.org/standard/79518.html)
- [Zebra BI · IBCS-Praxis-Guide für Power BI](https://zebrabi.com/ibcs/)
- [SQLBI · Marco Russo & Alberto Ferrari (DAX-Experten)](https://www.sqlbi.com/)
- [SQLBI · Star-Schema oder Single Table?](https://www.sqlbi.com/articles/power-bi-star-schema-or-single-table/)
- [DAX Guide · Funktions-Referenz (SQLBI)](https://dax.guide/)
- [Buch · The Definitive Guide to DAX (Russo / Ferrari)](https://www.sqlbi.com/books/the-definitive-guide-to-dax-2nd-edition/)
- [Tabular Editor 2 · kostenfrei, Open Source](https://github.com/TabularEditor/TabularEditor)
- [Tabular Editor · Offizielle Website (TE2 & TE3)](https://tabulareditor.com/)
- [DAX Studio · Performance-Diagnose (kostenfrei)](https://daxstudio.org/)
- [Best Practice Analyzer Rules · Microsoft GitHub](https://github.com/microsoft/Analysis-Services/tree/master/BestPracticeRules)
- [Power BI Blog · monatliche Updates](https://powerbi.microsoft.com/de-de/blog/)
- [Microsoft Fabric Release Plan](https://learn.microsoft.com/en-us/fabric/release-plan/)
- [Fabric Community Forum](https://community.fabric.microsoft.com/)
- [Daten-WG · Podcast-Kanal](https://www.youtube.com/@Daten-WG)
- [Michael Tenner · Power BI Tutorials & Deep Dives](https://www.youtube.com/channel/UCv51V-2Gt7sQGVkN_6SNZfw)
- [Artur König · datakoenig · Power BI Deep Dives](https://www.youtube.com/channel/UC9Ovg7-t5zuca0E2jx2YF3A)
