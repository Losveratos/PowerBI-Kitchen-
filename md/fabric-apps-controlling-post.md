# Fabric Apps im Heimrevier von Power BI: Vertrieb und Finance

> Markdown-Fassung von [fabric-apps-controlling-post.html](../fabric-apps-controlling-post.html) · https://datenwgknowledgekitchen.com/fabric-apps-controlling-post.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

Post · Fabric Apps & Visualisierung

Fabric Apps sind jetzt in unserer Fabric-Umgebung verfügbar, also haben wir angefangen zu testen. Ich habe viele großartige, fancy, super coole Apps gesehen. Dann kam die Idee: Warum nicht etwas bauen, das viele wirklich brauchen? **Vertriebscontrolling und Finance Reporting**, das klassische Heimrevier von Power-BI-Berichten. Mit klaren Standards statt Show.

Von **Michael Tenner** · Stand · **Oktober 2026** · Werkzeuge · **Rayfin CLI · Claude Code · MockupKitchen · ChartKitchen** · Status · **Fabric Apps (Preview)**

Visualisierung Fabric IBCS

**Demo-Video:** ../assets/fabric-apps/fabric-apps-live.mp4

**Standbild:** ../assets/fabric-apps/fabric-apps-live-poster.jpg

**89 Sekunden, live aufgenommen, ohne Schnitt:** erst das Vertriebscontrolling mit Dark Mode, Filtern, Analyse, Pipeline, Deals und dem Zoom in Small Multiples. Dann das Finance KPI Cockpit mit AC gegen PY, Plan und Forecast. Alle Daten sind Demodaten.

## Was sind *Fabric Apps?*

Fabric Apps sind ein neuer Item-Typ in Microsoft Fabric, aktuell in der Preview. Microsoft hat sie zur Build 2026 zusammen mit **Rayfin** vorgestellt, einem Open-Source-SDK und einer CLI. Man schreibt eine Web-App in TypeScript und React, verbindet sie über Konnektoren mit Fabric-Daten und deployt sie mit `rayfin up` in einen Workspace. Angemeldet wird über Fabric SSO, und jeder sieht nur die Daten, auf die er auch im Modell Zugriff hat.

Für Reporting ist vor allem der Konnektor auf das **Semantikmodell** interessant. Die App schickt DAX-Abfragen über die Execute-Queries-API an das bestehende Modell. Das Modell bleibt die Datenquelle, die App übernimmt die Darstellung und die Interaktion.

> ### Die Grundlagen bei Microsoft Learn
>
> - [What is Fabric Apps (Preview)?](https://learn.microsoft.com/fabric/apps/overview) · Überblick, Voraussetzungen und Kapazität
> - [Create your first Fabric app](https://learn.microsoft.com/fabric/apps/create-app) · Schnellstart mit Node und Rayfin
> - [Create a Fabric app with the Rayfin CLI](https://learn.microsoft.com/fabric/apps/create-app-with-cli) · der Weg über die Kommandozeile
> - [Connect Fabric Apps to Fabric data](https://learn.microsoft.com/fabric/apps/connectors) · Konnektoren für Semantikmodell, Lakehouse, Warehouse
> - [Create an app connected to a semantic model](https://learn.microsoft.com/fabric/apps/data-apps-template) · App auf einem Semantikmodell
> - [Deploy a Fabric app to Fabric](https://learn.microsoft.com/fabric/apps/deploy-app) · was `rayfin up` macht
> - [Troubleshoot Fabric Apps](https://learn.microsoft.com/fabric/apps/troubleshooting) · bekannte Grenzen
> - [Fabric region availability](https://learn.microsoft.com/fabric/admin/region-availability) · Fabric Apps gibt es noch nicht in jeder Region
> - [Datasets · Execute Queries](https://learn.microsoft.com/rest/api/power-bi/datasets/execute-queries) · die API hinter dem Modell-Konnektor
> - [Ankündigung zur Build 2026](https://azure.microsoft.com/en-us/blog/microsoft-build-2026-building-agentic-apps-with-microsoft-fabric-and-microsoft-databases/) · Azure Blog

## Was wir *gebaut haben*

Zwei Apps im selben Workspace, beide auf einem bestehenden Semantikmodell. Jede ist in etwa einer Stunde entstanden.

- **Vertriebscontrolling:** vier Seiten mit Übersicht, Analyse, Pipeline & Forecast sowie Deals & Kunden. Auftragseingang AC gegen PY, integrierte Varianzanalyse, Strukturbrücke, Werttreiberbaum und ein Zoom, der aus einer Grafik Small Multiples macht.
- **Finance KPI Cockpit:** sechs Kennzahlen gegen Vorjahr, Plan und Forecast, mit wählbaren Plan- und Forecast-Versionen, Forecast schraffiert ab dem ersten offenen Monat, alle Kennzahlen als Tabelle und Ergebnisbrücke.

![Vertriebscontrolling, Übersicht mit KPI-Karten, integrierter Varianzanalyse und Strukturbrücke](../blog/assets/fabric-apps/vertrieb-uebersicht.jpg)

***Übersicht:** KPI-Karten, integrierte Varianzanalyse je Monat, Strukturbrücke je Produktgruppe.*

[![Vertriebscontrolling, Übersicht mit KPI-Karten, integrierter Varianzanalyse und Strukturbrücke](../blog/assets/fabric-apps/vertrieb-uebersicht.jpg)](../blog/assets/fabric-apps/vertrieb-uebersicht.jpg)

![Vertriebscontrolling im Dark Mode](../blog/assets/fabric-apps/vertrieb-darkmode.jpg)

***Dark Mode:** ein Klick, dieselbe Notation.*

[![Vertriebscontrolling im Dark Mode](../blog/assets/fabric-apps/vertrieb-darkmode.jpg)](../blog/assets/fabric-apps/vertrieb-darkmode.jpg)

![Zoom aus einer Grafik in Small Multiples je Vertriebler](../blog/assets/fabric-apps/vertrieb-zoom-small-multiples.jpg)

***Zoom:** aus einer Grafik in Small Multiples, umschaltbar nach Dimension.*

[![Zoom aus einer Grafik in Small Multiples je Vertriebler](../blog/assets/fabric-apps/vertrieb-zoom-small-multiples.jpg)](../blog/assets/fabric-apps/vertrieb-zoom-small-multiples.jpg)

![Analyse-Seite mit Small Multiples je Produktgruppe](../blog/assets/fabric-apps/vertrieb-analyse.jpg)

***Analyse:** Kennzahl wählen, Small Multiples und Werttreiberbaum.*

[![Analyse-Seite mit Small Multiples je Produktgruppe](../blog/assets/fabric-apps/vertrieb-analyse.jpg)](../blog/assets/fabric-apps/vertrieb-analyse.jpg)

![Pipeline und Forecast](../blog/assets/fabric-apps/vertrieb-pipeline.jpg)

***Pipeline & Forecast:** offene Angebote nach Wahrscheinlichkeit und Vertriebler.*

[![Pipeline und Forecast](../blog/assets/fabric-apps/vertrieb-pipeline.jpg)](../blog/assets/fabric-apps/vertrieb-pipeline.jpg)

![Deals und Kunden als Liste](../blog/assets/fabric-apps/vertrieb-deals.jpg)

***Deals & Kunden:** jedes Angebot im Detail, Demodaten.*

[![Deals und Kunden als Liste](../blog/assets/fabric-apps/vertrieb-deals.jpg)](../blog/assets/fabric-apps/vertrieb-deals.jpg)

![Finance KPI Cockpit, Übersicht](../blog/assets/fabric-apps/cockpit-uebersicht.jpg)

***Finance KPI Cockpit:** ΔPY, ΔPL und ΔFC auf jeder Karte.*

[![Finance KPI Cockpit, Übersicht](../blog/assets/fabric-apps/cockpit-uebersicht.jpg)](../blog/assets/fabric-apps/cockpit-uebersicht.jpg)

![Cockpit mit aktiven Filtern als Chips über der Seite](../blog/assets/fabric-apps/cockpit-filter.jpg)

***Filter:** sichtbar über der Seite, mit einem Klick entfernt.*

[![Cockpit mit aktiven Filtern als Chips über der Seite](../blog/assets/fabric-apps/cockpit-filter.jpg)](../blog/assets/fabric-apps/cockpit-filter.jpg)

![Alle Kennzahlen als Tabelle und Ergebnisbrücke im Dark Mode](../blog/assets/fabric-apps/cockpit-alle-kennzahlen.jpg)

***Alle Kennzahlen:** Tabelle und Ergebnisbrücke.*

[![Alle Kennzahlen als Tabelle und Ergebnisbrücke im Dark Mode](../blog/assets/fabric-apps/cockpit-alle-kennzahlen.jpg)](../blog/assets/fabric-apps/cockpit-alle-kennzahlen.jpg)

![Auswahl der Plan- und Forecast-Version](../blog/assets/fabric-apps/cockpit-versionen.jpg)

***Versionen:** Plan und Forecast direkt wechseln.*

[![Auswahl der Plan- und Forecast-Version](../blog/assets/fabric-apps/cockpit-versionen.jpg)](../blog/assets/fabric-apps/cockpit-versionen.jpg)

Was mir besonders gefällt: die **Filter über der Seite**, gut sichtbar und mit einem Klick gelöscht. Der **Zoom mit neuen Aktionen**. Und das „Beste": der einfache Wechsel in den **Dark Mode**. Das hätte ich in Power BI nie gebaut. Dazu steckt jede Ansicht in der URL, also lässt sich genau dieser Stand teilen.

## Wie wir es gebaut haben: *ein Playbook*

Um Fabric Apps zu bekommen, die sich an IBCS-Konzepten orientieren, habe ich meinen Skill mit der MockupKitchen und dem Code meiner Power-BI-Custom-Visuals kombiniert. Daraus ist ein erster Versuch eines Playbooks entstanden: ein reproduzierbares Setup, mit dem mein Coding-Agent über Rayfin solche Apps baut.

### 1 · Seitengerüst — MockupKitchen

Kopfband, KPI-Leiste, Kachelraster und Filterpanel rechts. Jede Kachel hat Titel, Untertitel und eine Kernaussage. So steht fest, **was** auf die Seite gehört, bevor eine Zeile Code entsteht.

### 2 · Erprobte Grafikmuster — ChartKitchen · Custom Visuals

Integrierte Varianzanalyse, Pins für prozentuale Abweichungen, Brücken, Werttreiberbaum. Diese Muster laufen schon als Power-BI-Custom-Visuals. Der Agent **portiert sie**, statt sie neu zu erfinden.

### 3 · Regeln als Skill — Notation · Farben · Interaktion

Szenarien, Farben für gut und schlecht, Skalierung, Beschriftung. Dazu Regeln für die Interaktion nach dem Shneiderman-Mantra: erst Überblick, dann zoomen und filtern, dann Details bei Bedarf.

### 4 · Bauen, testen, deployen — Claude Code · Rayfin CLI

Der Coding-Agent legt das Projekt an, schreibt die DAX-Abfragen für den Konnektor, baut die Seiten, lässt die Tests laufen und deployt mit `rayfin up`. Für größere Seiten arbeiten mehrere Agenten parallel gegen denselben Datenkontext.

~1 Stunde — **je App, vom leeren Projekt bis zur deployten Fabric App.** Möglich ist das, weil das Playbook die Entscheidungen schon enthält: Seitengerüst, Grafikmuster und Notation muss der Agent nicht erfinden.

## Warum wir auf *Standards* setzen

Fabric Apps können alles, was eine Web-App kann. Genau das ist im Controlling ein Risiko. Ein Finanzbericht wird jeden Monat wieder gelesen, von Menschen, die schnell entscheiden müssen. Dafür braucht man kein fancy Feuerwerk, sondern ein **verlässliches Arbeitspferd**, das jedes Mal gleich funktioniert.

Ein bekannter Standard dafür sind die **International Business Communication Standards (IBCS)**. Sie legen fest, wie Szenarien, Abweichungen und Strukturen einheitlich dargestellt werden. Seit Juni 2026 gibt es IBCS in Version 2.0, abgestimmt mit der neuen Norm **ISO 24896** zur Notation im Business Reporting. Unsere Apps greifen einzelne Konzepte daraus auf:

**AC · Ist** Voll und dunkel

**PY · Vorjahr** Grau

**PL · Plan** Umrandet

**FC · Forecast** Schraffiert

Dazu kommen Abweichungen als eigene Grafik, eine einheitliche Skalierung und eine klare Farbe für gut und schlecht. Statt Grün nehmen wir unser Kitchen-Teal, damit die Farben auch bei Rot-Grün-Sehschwäche unterscheidbar bleiben.

Mit einem Coding-Agent wird ein Standard noch wertvoller. **Er ist eine Spezifikation, die der Agent befolgen kann.** Ohne Standard erfindet der Agent bei jeder App ein neues Design, und jede App muss man neu lesen lernen. Mit Standard sieht die dritte App aus wie die erste, und Leser erkennen AC, PY, Plan und Forecast sofort wieder. Das macht das Ergebnis reproduzierbar, und genau darum geht es beim Playbook.

> ### Die Grundlagen zu IBCS
>
> - [IBCS · International Business Communication Standards](https://www.ibcs.com/) · Startseite
> - [IBCS Standards Version 2.0](https://www.ibcs.com/ibcs-version-2-0/) · seit Juni 2026, abgestimmt mit ISO 24896
> - [ISO 24896 bei IBCS](https://www.ibcs.com/iso-24896/) · was die Norm regelt
> - [ISO 24896:2026 · Notation for business reporting](https://www.iso.org/standard/88366.html) · die Norm bei ISO
> - [IBCS Association](https://www.ibcs.com/ibcs-association/) · gemeinnütziger Verein, der die Standards frei unter Creative Commons veröffentlicht

## Was man *bedenken sollte*

Es ist nicht alles Sonnenschein. Diese Punkte gehören zur ehrlichen Bewertung dazu:

- **Rechenlogik wandert in den App-Code.** Wenn die App Kennzahlen im Browser rechnet, liegt diese Logik nicht mehr im Semantikmodell. Sie muss getestet und dokumentiert werden, sonst gibt es zwei Wahrheiten.
- **Governance.** Die Fabric-Git-Integration synchronisiert das App-Item nicht. Den Quellcode versionieren wir deshalb separat im Repository.
- **Preview und Regionen.** Fabric Apps sind Preview, der Tenant-Admin muss sie freischalten, und nicht jede Region unterstützt sie.
- **Kapazität und Grenzen.** Apps verbrauchen Capacity Units, und kleine Kapazitäten drosseln schnell. Die Execute-Queries-API hat Grenzen bei Zeilen und Abfragen pro Minute.
- **Kein Ersatz für Power BI.** Für viele Berichte bleibt ein Power-BI-Bericht der einfachere Weg. Fabric Apps lohnen sich dort, wo Interaktion den Unterschied macht.

## Warum das *sinnvoll ist*

Fabric Apps sind eine Ergänzung, kein Ersatz. Spannend werden sie, wenn man sie mit Standards und einem Playbook kombiniert. Dann bekommt man die Freiheit einer Web-App, ohne bei jeder App bei null anzufangen. Das Semantikmodell bleibt die Quelle, die Notation bleibt gleich, und der Agent baut in einer Stunde, was sonst Tage an Design und Abstimmung kostet.

Das ist ein erster Versuch. **Was denkt ihr?** Ich freue mich über Feedback, Kritik und eigene Experimente.

Fragen, Kritik, eigene Experimente: **Michael Tenner** · [michael.tenner84@gmail.com](mailto:michael.tenner84@gmail.com)

Alle gezeigten Zahlen, Kunden und Namen sind Demodaten. Werkzeuge: Rayfin CLI, Claude Code, MockupKitchen, ChartKitchen.

Einzelne Konzepte wie Szenario-Kennzeichnung und Abweichungsdarstellung sind an IBCS® angelehnt. Die Apps sind nicht zertifiziert und stehen in keiner Verbindung zur IBCS Association. IBCS® ist eine eingetragene Marke des IBCS Institute.

---

## Weiterlesen

- HTML (maßgeblich): https://datenwgknowledgekitchen.com/fabric-apps-controlling-post.html
- Englische Fassung: [fabric-apps-controlling-post_en.html](../fabric-apps-controlling-post_en.html) · [fabric-apps-controlling-post_en.md](fabric-apps-controlling-post_en.md)
