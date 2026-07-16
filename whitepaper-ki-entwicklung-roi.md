# Ein Power-BI-Visual in 10 Tagen

## Was KI-gestützte Entwicklung für Build-vs-Buy, Open Source und den Software-Markt bedeutet

**Eine Fallstudie der Daten-WG · Juli 2026 · Entwurf v0.9**

---

## TL;DR

Wir haben mit KI-gestützter Entwicklung („Vibe Coding") in **10 Kalendertagen**
ein produktionsreifes Power-BI-Custom-Visual gebaut — **ChartKitchen
byDatenWG**: 12 Chart-Modi in IBCS-inspirierter Notation, eine
Controlling-Tabelle mit Hierarchie, Formel-Engine und Matrix-Ausbau,
KPI-Karten, vier Sprachen, 80+ automatisierte Render-Tests,
AppSource-Einreichungspaket. Der Werkzeugeinsatz: **ein 100-$-Abo plus 80 €
Zusatzbudget**. Die Steuerung: **rund 20 Stunden** eines fachlich erfahrenen
Controllers.

Klassisch geschätzt hätte derselbe Stand **150.000–350.000 €** und **6–12
Monate** gekostet. Daraus folgen drei Thesen:

1. **Build-vs-Buy kippt** für Software-Kategorien mit festem Framework:
   Ab mittlerer Unternehmensgröße ist der Eigenbau (oder die Adoption eines
   freien Community-Builds) einem Lizenzmodell nach Barwert klar überlegen.
2. **Ein glaubwürdiges freies Visual wirkt spieltheoretisch** — es verschiebt
   die Verhandlungsposition von Konzernen gegenüber kommerziellen Anbietern,
   ohne dass gewechselt werden muss.
3. **Open Source × KI-Entwicklung wirkt multiplikativ**, nicht additiv: KI
   macht Community-Software pflegbar, offener Code macht KI präzise. Der
   klassische Feature-Burggraben von Software-Vendoren wird trockengelegt;
   Wert wandert von der Lizenz zur Expertise.

Alle Zahlen dieses Papiers sind aus dem öffentlichen Repository, der
Entwicklungs-Session und transparenten Annahmen hergeleitet — Methodik im
Anhang.

---

## 1 · Der Fall: Was gebaut wurde

ChartKitchen byDatenWG ist ein natives Power-BI-Custom-Visual (TypeScript/SVG,
API 5.11.0, keine externen Abhängigkeiten zur Laufzeit) für
Controlling-Berichte in IBCS-inspirierter Notation. Stand 15. Juli 2026
(Version 1.34.1.0):

| Umfang | Wert |
| --- | --- |
| Chart-Modi | 12 (Säulen, Balken, Linie, Wasserfall, integrierte Brücke, Kategorie-Brücke, Tabelle/Matrix, GuV-Statement, KPI-Karten, Pareto, Dumbbell, Slope) |
| Kern-Code | ~10.200 Zeilen (Rendering 8.088, Settings 944, Test-Harness 748, Capabilities 405) |
| Tabelle/Matrix | N-Ebenen-Hierarchie, Scrolling mit fixiertem Header + Σ, Formelzeilen, klappbare Spaltenhierarchie, Suche, Sortierung, Zeilenformate |
| Lokalisierung | de, en, es, ja — je ~245 Oberflächen-Strings |
| Qualitätssicherung | 80+ Headless-Render-Testfälle, ESLint (Microsoft-Visual-Regeln), `npm audit` 0 Findings |
| Distribution | Apache-2.0-Lizenz, baubarer Quellcode-Export, AppSource-Einreichungspaket, Marken-/Rechtsprüfung |
| Release-Historie | ~60 Releases, 124 Commits in 10 Tagen |

Das Visual ist als **kostenloses Community-Werkzeug** angelegt; das
Geschäftsmodell der Daten-WG liegt in Beratung und Support-Abos, nicht in
Lizenzen.

---

## 2 · Zeit und Kosten — die tatsächlichen

Die Git-Historie erlaubt eine ehrliche Abgrenzung: Der erste Commit des
Visuals datiert auf den **6. Juli 2026**, der hier beschriebene Stand auf den
**15. Juli 2026**.

| Kennzahl | Wert |
| --- | --- |
| Kalenderzeit | 10 Tage |
| Tage mit Entwicklungsaktivität | 8 |
| Commits auf das Visual | ~124 (davon 40 am ersten Tag) |
| Releases | 1.0.0.0 → 1.34.1.0 |
| Steuerungszeit (Anforderungen, Tests in Power BI Desktop, Feedback) | ~20 h |
| Werkzeugkosten | ~180 € (Claude-Max-Abo ~100 $ + 80 € Zusatzbudget) |

Zur Einordnung des Rechenaufwands: Die Session verarbeitete rund **1,8
Milliarden Tokens** (davon 96 % Cache-Lesevorgänge), API-Listenpreis-Äquivalent
**~2.900 $** — abgedeckt durch das Pauschal-Abo. Der ökologische Fußabdruck
liegt nach der Methodik unseres eigenen
[KI-CO₂-Simulators](https://datenwgknowledgekitchen.com/ki-co2-simulator.html)
im mittleren Szenario bei **~0,2–1,1 t CO₂e** — Größenordnung: ein
Inlandsflug, kompensierbar für unter 35 €.

**Gesamtinvest zum externen Beratersatz gerechnet (20 h × 250 € + Werkzeuge):
~5.200 €.**

---

## 3 · Was es klassisch gekostet hätte

Wir schätzen bottom-up, was ein kompetentes Team für denselben Stand benötigt
hätte (Personenmonate Entwicklung, ohne Projektumfeld):

| Block | PM |
| --- | --- |
| Grundgerüst, Build, Settings-Modell | 0,5–1 |
| Säulen/Balken/Linie inkl. Varianz-Panels, Skalen-Sync, YTD, Labels | 2–3 |
| Wasserfall + zwei Brücken-Modi | 1–1,5 |
| Tabelle/Matrix (Hierarchie, Scroll-Freeze, Formeln, Matrix-Ausbau) | 2,5–4 |
| KPI-Karten inkl. Bullet/Benchmark | 0,75–1 |
| Small Multiples (Σ-Kachel, Top-N, Zoom, gemeinsame Skalen) | 0,75–1 |
| Landing, In-Chart-Interaktionen, Persistierung/Bookmarks | 0,5–1 |
| Lokalisierung, Barrierefreiheit, Kontrastmodus | 0,5 |
| Test-Harness + Testfälle | 0,75–1 |
| Zertifizierungsvorbereitung, Lizenz/Marken, AppSource-Kit | 0,5–1 |
| **Summe Entwicklung** | **10–14 PM** |
| + Projektrealität (Spezifikation, Reviews, Abstimmungen, QA) | **14–18 PM** |

Bewertet zu marktüblichen Sätzen:

- **Internes Team** (Senior-Vollkosten ~9 T€/PM): **~130–160 T€** — sofern
  Entwickler mit Power-BI-Visual- *und* Controlling-Erfahrung verfügbar sind.
- **Extern** (900–1.200 €/Tag): **~250–400 T€**.

Wir verwenden im Folgenden konservativ die Spanne **150–350 T€** als
Wiederbeschaffungswert. Ehrlicher Abschlag: Ein klassisches Projekt hätte
Endnutzer-Doku und formale Abnahmetests im Preis enthalten, die hier noch
ausstehen (−10–20 %). Selbst damit bleibt die Größenordnung unberührt.

---

## 4 · ROI der Entwicklung

Invest ~5.200 € gegen Wiederbeschaffungswert:

| Szenario | Gegenwert | ROI | Faktor |
| --- | ---: | ---: | ---: |
| Konservativ (intern) | 150.000 € | ~2.800 % | 29× |
| Mittel | 250.000 € | ~4.700 % | 48× |
| Extern (Agentur) | 350.000 € | ~6.700 % | 67× |

Anders gelesen: Die 20 Steuerungsstunden erzeugten einen effektiven
Stundenwert von **7.500–17.500 €** — Hebel 30–70 auf den eigenen Beratersatz.
Pro Release: ~85 €. Pro Zeile Code: ~50 Cent (klassisch: 15–35 €).

Zwei Einordnungen: Erstens ist dies ein ROI gegen den Wiederbeschaffungswert —
realisiert wird er über Reichweite, Beratungs-Leads und Abos; der wichtigere
Effekt ist jedoch, dass ein Werkzeug **überhaupt existiert**, das nie ein
250-T€-Budget bekommen hätte. Zweitens gehört der ROI zur Kombination
„Fachexperte + Werkzeug": 96,5 % des Invests ist Expertenzeit, 3,5 % Werkzeug.
**Der Engpass ist nicht mehr das Entwicklungsbudget, sondern die Person, die
weiß, was gebaut werden soll.**

---

## 5 · Build-vs-Buy im Barwertvergleich

Kommerzielle IBCS-Visuals (z. B. Zebra BI, Inforiver) kosten je nach Volumen
grob **7–12 € pro Nutzer und Monat**. Diskontiert über 5 Jahre (8 % WACC,
Annuitätenfaktor 3,99), gegen Eigenbau mit ~5,2 T€ Invest und angenommenen
3 T€/Jahr Pflege:

| Unternehmensgröße | Lizenz p. a. | Barwert Lizenz (5 J) | Barwert Eigenbau | NPV-Vorteil Eigenbau |
| --- | ---: | ---: | ---: | ---: |
| 50 Nutzer × 8 €/M | 4.800 € | 19.200 € | 17.200 € | ~2.000 € |
| 200 Nutzer × 10 €/M | 24.000 € | 95.800 € | 17.200 € | **~78.600 €** |
| 1.000 Nutzer × 7 €/M | 84.000 € | 335.400 € | 17.200 € | **~318.000 €** |

Payback des Eigenbaus: **2,6 Monate** beim 200-Nutzer-Unternehmen, ~3 Wochen
im Konzernfall. Sensitivität: Selbst bei verdreifachter Pflegeannahme
(10 T€/Jahr) bleibt der Mittelstandsfall ~50 T€ im Plus.

**Die Adopter-Perspektive verschärft das Bild.** Wer nicht selbst baut,
sondern das freie Community-Visual einsetzt, trägt nur die Einführung
(~2 Controller-Tage ≈ 1,5 T€) gegen 19–335 T€ Lizenz-Barwert. Für kleine
Unternehmen — deren reale Alternative oft nicht „Zebra kaufen", sondern „keine
IBCS-Visuals" ist — ist das keine Ersparnis, sondern der **Zugang zu einer
Fähigkeit, die es in ihrer Preisklasse bisher nicht gab**.

Fairness gebietet: Der Vergleich gilt, wo der Funktionsumfang genügt.
Kommerzielle Anbieter verkaufen zusätzlich Reife, Support-SLAs, Zertifizierung
und Roadmap-Sicherheit. Genau diese Lücke adressiert im Community-Modell ein
Support-Abo (dazu §8).

---

## 6 · Die spieltheoretische Dimension

Der vielleicht unterschätzteste Wert eines glaubwürdigen freien Visuals
realisiert sich, **ohne dass es eingesetzt wird**: Es verändert die
Verhandlungsposition (BATNA) jedes Unternehmens gegenüber kommerziellen
Anbietern.

- Bisher lautete die Alternative in Lizenzverhandlungen: „zahlen oder auf
  IBCS-Notation verzichten". Mit einer glaubwürdigen freien Option genügt
  bereits die **Möglichkeit** des Wechsels: Beim 1.000-Nutzer-Konzern
  entsprechen 10–20 % Renewal-Nachlass **33–67 T€ Barwert** — erzeugt allein
  durch die Existenz der Alternative im Beschaffungsvergleich.
- **Glaubwürdigkeit ist die Währung** dieser Karte: offener, baubarer
  Quellcode ✓, sichtbare Pflege (60 Releases in 10 Tagen) ✓,
  Microsoft-Zertifizierung und Doku als nächste Schritte. Der billigste
  glaubwürdige Zug eines Konzerns: ein Pilot auf einer einzigen Berichtsseite.
- **Grenzen:** Ohne Zertifizierung bleibt die Karte in vielen Häusern formal
  unspielbar; hohe Wechselkosten (großer Berichtsbestand) stumpfen sie ab.
  Am schärfsten ist sie bei Neueinführungen und auslaufenden Rahmenverträgen.

---

## 7 · Die Marktthese: Open Source × KI wirkt multiplikativ

Einzeln waren beide Kräfte für Software-Vendoren beherrschbar. Open Source
scheiterte im Anwendungs-Layer oft am Pflegeargument („wer wartet das?");
KI-Entwicklung allein blieb ohne offene Referenz-Codebasen und feste
Frameworks auf Prototypen-Niveau. **Zusammen hebeln sie sich:**

- KI macht Community-Software **pflegbar** — ein Ein-Personen-Projekt hat
  effektiv ein Entwicklerteam; „Bus-Faktor 1" bedeutet nicht mehr Stillstand.
- Offener Code macht KI **präzise** — jedes offene Projekt ist sofort
  erweiterbar, weil das Modell die Codebasis liest wie ein eingearbeiteter
  Entwickler.

Damit fällt der klassische Burggraben von Feature-Vendoren: „Entwicklung ist
teuer, wir haben sie bezahlt, ihr mietet sie." Am stärksten exponiert ist die
mittlere Schicht — Single-Product-Anbieter mit Feature-Differenzierung und
Sitzplatz-Preisen. Wenig bedroht sind Plattformen (Microsoft gewinnt durch
jedes gute Visual), Anbieter mit Daten-/Netzwerk-Lock-in und alles, wo
Haftung den Kaufgrund darstellt.

Das historische Muster existiert bereits: Open Source hat die
Infrastruktur-Schicht konsolidiert (Linux, Postgres), und überlebt hat dort
das **Red-Hat-Modell** — Software frei, Erlöse aus Support und Verlässlichkeit.
Unsere Erwartung: Dasselbe Modell erreicht jetzt den Anwendungs-Layer.

**Gegenkräfte, ehrlich benannt:** (1) Vendoren können ebenfalls KI-gestützt
entwickeln — was fällt, ist nicht ihr Produkt, sondern ihr
Preissetzungsspielraum gegen „gut genug und kostenlos". (2) Die kommende Flut
KI-gebauter Wegwerf-Software wird Vertrauenssignale (Zertifizierung,
Release-Historie, ein Gesicht dahinter) **aufwerten**. (3) Ein Marktsegment
zahlt dauerhaft für SLAs und Haftung — es schrumpft, verschwindet aber nicht.

---

## 8 · Warum es funktioniert hat — und wo die Grenzen liegen

Drei Zutaten erklären das Ergebnis; fehlt eine, bricht die Rechnung:

1. **Festes Framework.** Power-BI-Visuals haben einen engen Vertrag
   (Capabilities, Settings-Modell, Sandbox, eine Update-Schnittstelle). Keine
   Architektur-Grundsatzfragen, jede Entscheidung lokal verifizierbar. In
   solchen „Zäunen" ist KI-Entwicklung am stärksten.
2. **Domänenexpertise in der Steuerung.** Anforderungen kamen in Fachsprache
   mit eingebautem Qualitätsmaßstab („Bestandsgrößen darf man nicht
   summieren", „Zeilenhöhe wie die native Matrix"). Das ist der Unterschied
   zwischen zwei Iterationen und zwanzig. **KI ersetzt hier das
   Entwicklerteam, nicht den Product Owner.**
3. **Selbstverifikation im Entwicklungs-Loop.** Ein Headless-Test-Harness
   rendert jeden Stand als Screenshot; Fehler wurden gefunden, bevor der
   Mensch testen musste. Ohne diesen Loop wird der Mensch zum Flaschenhals
   jeder Sichtprüfung.

Das Rezept überträgt sich auf alles mit festem Rahmen und schnellem Feedback:
Office-Add-ins, IDE-Extensions, dbt-Pakete, interne Fachanwendungen. Es
überträgt sich **nicht** unmittelbar auf Greenfield-Architekturen, verteilte
Systeme oder Legacy-Integration — dort fehlen Zaun und schnelle Verifikation.

**Offene Punkte dieses Projekts,** die ein Käufer eines 250-T€-Projekts
eingefordert hätte: Endnutzer-Dokumentation, formale Abnahmetests mit
Anwendern, eine vollständige adversariale Prüfrunde der jüngsten Pakete.
Sie stehen im öffentlichen Backlog.

---

## 9 · Was das für Unternehmen bedeutet

**Für CFOs/Controlling-Leitung:** Prüfen Sie Visual-Lizenzverträge gegen die
freie Alternative — als Wechseloption oder als Verhandlungskarte. Ab ~150–200
Report-Nutzern ist der Barwertvorteil erheblich.

**Für IT-/BI-Verantwortliche:** Die Kombination „fester Framework-Zaun +
Fachexperte + KI" ist reproduzierbar. Kandidaten sind alle Werkzeuge, die
heute als Sitzplatz-Lizenz eingekauft werden, aber im Kern gut abgegrenzte
Fachlogik sind.

**Für Software-Anbieter:** Feature-Paritäts-Verteidigung wird teurer als
Differenzierung nach oben (Planung, Writeback, Enterprise-Integration) oder
ein Service-Modell. Die Preissetzung der Basisschicht diszipliniert sich.

**Für Beratungen:** Der Wert wandert von der Lizenz zur Expertise. Das
tragfähige Modell ist das der Infrastruktur-Welt: Software frei, Erlöse aus
Enablement, Support und Weiterentwicklung — mit dem Abo als formalisierter
Antwort auf die Pflege-Frage.

---

## Anhang · Methodik und Belege

- **Projektdaten:** Git-Historie des öffentlichen Repositories (erster
  Visual-Commit 06.07.2026; 124 Commits, ~60 Releases bis 15.07.2026);
  Code-Umfang per `wc -l`; Testfälle im Repo (`test/test.html`).
- **Token-/Kostendaten:** Session-Transkript-Auswertung (4.446 API-Aufrufe;
  Output 5,3 M, Cache-Write 70,5 M, Cache-Read 1.725 M Tokens);
  API-Listenpreise Stand Juni 2026; Abo-Kosten laut Rechnung.
- **CO₂-Schätzung:** Methodik des Daten-WG-KI-CO₂-Simulators (Wh je 1.000
  Output-Tokens nach Modellklasse, PUE 1,15–1,56, US-Strommix 300–450 g/kWh);
  Cache-Reads mit Faktor 0,1 als preis-analoge Näherung.
- **Klassische Kostenschätzung:** Bottom-up in Personenmonaten (Tabelle §3),
  bewertet mit 9 T€/PM intern bzw. 900–1.200 €/Tag extern. Keine
  Anbieter-Angebote eingeholt; Spanne bewusst breit.
- **DCF-Annahmen:** Lizenzpreise 7–12 €/Nutzer/Monat (öffentliche
  Preisindikationen kommerzieller IBCS-Visuals, volumenabhängig); 8 %
  Diskontsatz; 5 Jahre; Pflege Eigenbau 3 T€/Jahr (Sensitivität bis
  10 T€/Jahr geprüft).
- **Interessenlage:** Die Daten-WG ist Herausgeberin des beschriebenen
  Visuals und erbringt Beratungsleistungen im Power-BI-Umfeld. Alle
  Schätzungen sind als Größenordnungen zu lesen, nicht als Angebote oder
  Zusicherungen.

*Entwurf — Zahlen Stand 15.07.2026. Feedback willkommen.*
