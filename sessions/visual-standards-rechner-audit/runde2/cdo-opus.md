# Prüfung aus der Linse Chief Data Officer / Head of BI Platform

**Rechner:** `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html`, Stand v0.10 (11.09.2026)
**Prüfer-Kürzel:** `cdo-opus` · **Datum:** 11.09.2026
**Auftrag:** Was fehlt im Rechner aus Sicht der Plattformverantwortung — Plattformrisiko, Lock-in und Exit, Governance-Betriebsmodell, Skills, Standardisierungswert, Koexistenz, Adoption, Sicherheit, Time-to-value, Messbarkeit, Roadmap-Alignment.

---

## Was ich gelesen habe

`const REQS` (18 Anforderungen), `const FLAGS` (10 Schalter), `const GLOBAL` (18 Annahmen), `const OPTP` (23 Options-Annahmen), `function calc()`, `function calcSQ()`, `function modeParams()`, `function evaluate()`, `const TEXT`, `const PRESETS`, `renderTable()` und die KPI-Karten. Dazu die Vorarbeiten: `README.md` (Audit v0.7), `grundannahmen-kritik.md`, und zur Abgrenzung die Überschriften der vier bereits vorliegenden Runde-2-Berichte (`07-neue-mechaniken-fable.md`, `evidenz-opus.md`, `vollstaendigkeit-reqs-flags.md`, `zeit-fable.md`). Ich wiederhole nichts daraus.

## Netz

Microsoft Learn war über den MCP-Zugang vollständig erreichbar; alle unten mit URL belegten Aussagen habe ich dort im Volltext gelesen. Herstellerseiten (zebrabi.com, inforiver.com, graphomate.com) habe ich **nicht** angefragt — laut Audit v0.7 blockiert der Egress-Proxy sie, und keine meiner Aussagen hängt an ihnen. Wo ich keine Quelle habe, steht „keine".

## Kurzfazit in fünf Sätzen

1. **Der Rechner enthält einen belegbaren Sachfehler mit großer Wirkung:** Der Schalter „Tenant erlaubt nur zertifizierte Visuals" schließt Open Source hart aus, obwohl das Tenant-Setting laut Microsoft Learn ausdrücklich **nicht** für Visuals aus dem Organizational Store gilt. In drei von fünf Presets ist dieser Schalter gesetzt — dort steht ein falsches K.O.
2. **Die Kennzahl, die ein Architekturboard tatsächlich sehen will, fehlt:** Was kostet es, wieder herauszukommen. Alle Zutaten liegen im Modell (`switchCost`, `migFactor`, `reuseH`), sie werden nur berechnet, wenn jemand zufällig einen Basis-Wechsel einstellt.
3. **Time-to-value steht in Stunden statt in Wochen.** 40 Stunden Setup lesen sich wie eine Woche; real vergehen bei Paid Einkauf, Legal und AVV, bei nicht zertifiziertem OSS ein Security-Review, und beides sind Kalenderwochen ohne Arbeitszeit.
4. **Adoption kommt nicht vor.** Der Rechner unterstellt, dass 100 % der Reports den gewählten Standard benutzen. Genau die Ansätze, die er als billig ausweist, sind die, an denen der Fachbereich vorbeibaut.
5. **Die Plattform-Realität ist ein Portfolio, der Rechner ein Entweder-oder.** Koexistenz steht seit `grundannahmen-kritik.md` auf der Liste und ist aus meiner Sicht der wichtigste offene Struktur-Punkt, weil kein Konzern mit genau einem Ansatz arbeitet.

---

# Funde

## CDO-1 · Das K.O. „nur zertifizierte Visuals" gegen Open Source ist sachlich falsch

**Heute im Rechner** (`const FLAGS`, Zeile 515):

```js
{id:'certonly',label:'Tenant erlaubt nur zertifizierte Visuals',
 excl:{oss:'Nicht zertifiziertes Open-Source-Visual lädt im Service nicht (ChartKitchen ist aktuell nicht zertifiziert)…'},
 warn:{deneb:'Nur die AppSource-Version, kein Standalone-Build'},flag:true}
```

`PRESETS.konzern`, `PRESETS.rs` und `PRESETS.gross` setzen `flags:{certonly:true}`. In diesen drei Presets bekommt Open Source ein hartes K.O. und wird in der Ergebnisdarstellung durchgestrichen dargestellt (`renderKPI`, gestrichelte Linie im Kumulationsdiagramm). Laut `README.md` lag OSS im Konzern-Preset bei 593 k€ gegen 638 k€ für Paid — also **vorn**, und wird trotzdem als ausgeschlossen gezeigt.

**Was sich ändern soll**

1. `FLAGS.certonly.excl.oss` entfernen. Stattdessen `warn.oss`: *„Nicht zertifizierte Visuals laden im Service nicht — es sei denn, das Visual liegt im Organizational Store. Dort gilt das Tenant-Setting nicht. Prüft, ob eure IT den Org-Store-Weg zulässt."*
2. Neuen Modifier-Schalter in `FLAGS` ergänzen (analog zu `osscert`):
   `{id:'orgstore',label:'Visual ist im Organizational Store freigegeben',sub:'Admin-Portal → Organisationsvisuals. Hebt „nur zertifizierte Visuals" auf, auch für unzertifizierte .pbiviz-Dateien',flag:false,modifier:true}`
   Wirkung: hebt das K.O. aus `certonly` für `oss` und für den Deneb-Standalone-Build auf; **senkt `govIntake` nicht** (das Code-Review bleibt bei euch, es entfällt nur die Zertifizierungs-Wartezeit); setzt bei `rs` weiterhin eine Warnung, weil der Report Server keine Organisationsvisuals unterstützt.
3. `FLAGS.osscert.sub` präzisieren: Zertifizierung ist der eine Weg, Org-Store der andere und meist schnellere.
4. `REQS.mscert.note.oss` ergänzen: *„Nicht zertifiziert heißt nicht gesperrt: über den Org-Store nutzbar, dann aber ohne PDF/PPT-Export und ohne E-Mail-Abos."* — die Export-Einschränkung aus `REQS.export` bleibt korrekt und ist der eigentliche Preis der fehlenden Zertifizierung.

**Warum**

Die Regel ist bei Microsoft dokumentiert und eindeutig. Für einen Plattformverantwortlichen ist genau das der alltägliche Vorgang: Tenant-Setting hart auf „nur zertifiziert", und die drei bis fünf geprüften Ausnahmen liegen im Org-Store. Die Learn-Guidance empfiehlt diese Kombination sogar ausdrücklich („Consider a balanced strategy of enabling only certified custom visuals … while deploying organizational visuals to handle any exceptions"). Dass der Rechner daraus ein K.O. macht, dreht in den drei größten Presets die Rangfolge — und zwar gegen das Projekt, das die Autoren selbst offenlegen. Das ist konservativ gemeint, bleibt aber ein Sachfehler, und auf einer Konferenzbühne ist er angreifbar.

**Evidenz**

- „When you enable this setting, only certified Power BI visuals render … **This setting is disabled by default and doesn't apply to visuals in your organizational store.**" — https://learn.microsoft.com/fabric/admin/organizational-visuals
- „You can add to the list any type of visual including uncertified visuals and *.pbiviz* visuals, **even if they contradict the tenant settings of your organization**." — ebenda, Abschnitt *Organizational visuals*
- „Visuals allowed in the *Organizational visuals* page aren't affected by this setting, regardless of certification." — https://learn.microsoft.com/fabric/admin/service-admin-portal-power-bi-visuals
- „Consider a balanced strategy of enabling only certified custom visuals … while deploying organizational visuals to handle any exceptions." — https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-security-content-creator-planning
- Gegenprobe, bleibt richtig: „Power BI Report Server doesn't support organizational visuals." — https://learn.microsoft.com/fabric/admin/organizational-visuals

**Konfidenz:** hoch. **Wirkung:** hoch — kippt die Empfehlung in drei von fünf Presets.

---

## CDO-2 · Versionshoheit fehlt als Kriterium: AppSource-Visuals aktualisieren sich selbst, ohne Testfenster

**Heute im Rechner:** `REQS.version` misst nur die *Nachvollziehbarkeit* der Definition („Git-Diff, Revision"), `OPTP.govRun.sub` nennt „Versions-Reviews" als Stundenposten, und `OPTP.events`/`fixH` bepreisen Brüche, nachdem sie passiert sind. Es gibt kein Kriterium dafür, **ob ihr den Zeitpunkt eines Visual-Updates selbst bestimmen könnt**.

**Was sich ändern soll** — neue Anforderung in `REQS`, nach `version` einsortiert:

```js
{id:'pin',name:'Versionshoheit über das Visual',
 sub:'Version einfrieren, in Test prüfen, Rollout selbst terminieren',
 cap:[2,5,3,1],def:'S',
 note:{paid:'AppSource-Visuals aktualisieren sich automatisch; Versionshoheit nur, wenn der Hersteller eine .pbiviz-Datei für den Org-Store liefert',
       oss:'Eigene .pbiviz im Org-Store: ihr entscheidet, wann aktualisiert wird',
       deneb:'AppSource-Version aktualisiert sich automatisch; Standalone-Build gibt Hoheit, kostet aber das Zertifikat',
       core:'Keine Hoheit: das monatliche Plattform-Update kommt, ob ihr wollt oder nicht'}}
```

Zusätzlich in `TEXT.paid.hidden` und `TEXT.deneb.hidden` je eine Zeile: *„AppSource-Updates kommen ohne Ankündigungsfenster in Produktion; ein Dev/Test/Prod-Staging für das Visual gibt es nicht."*

Und ein Hinweis in `TEXT.oss.hidden` gehört korrigiert: dort steht heute nur „Löschen ist irreversibel". Richtig und wichtiger ist der Doppelsatz: *Löschen ist irreversibel und bricht Reports sofort; Deaktivieren ist reversibel und bricht sie ebenfalls sofort.*

**Warum**

Aus Plattformsicht ist das der Unterschied zwischen „wir haben ein Change-Verfahren" und „wir haben keins". Wer `events × fixH` bezahlt, zahlt reaktiv. Wer die Version einfriert, kann vorher testen — das ist der einzige Hebel, der Breaking-Updates wirklich senkt, und er liegt ausgerechnet beim selbst gepflegten .pbiviz, nicht beim gekauften Produkt. Das ist ein Vorteil von Open Source, den der Rechner heute nicht sieht, und gleichzeitig eine versteckte Schwäche von Paid und Deneb, die er ebenfalls nicht sieht. Wer den Punkt umsetzt, sollte ihn konsequent zu Ende rechnen: mit Versionshoheit sinken die Fix-Stunden (Vorschlag: `fixH × 0,75`, weil der Fix vor Produktion statt in Produktion passiert), dafür steigt `govRun` um die Regressionstests je Version (Vorschlag: +2 bis +6 h je Jahr).

**Evidenz**

- „AppSource Power BI visuals **automatically update**. Users in your organization always have the latest version of the visual." / „After a new version is available from AppSource, it replaces an older version deployed via the organizational visuals list." — https://learn.microsoft.com/fabric/admin/organizational-visuals
- „To update a *.pbiviz* visual … Select **Browse** … Select **Update**." (manuell, also terminierbar) — ebenda
- „**Deletion is irreversible.** After the visual is deleted, it immediately stops rendering in existing reports." / Deaktivieren: „the visual doesn't render in existing reports" — ebenda
- „Microsoft reserves the right to remove a visual from the certified list, at its discretion." — https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified

**Konfidenz:** hoch (Mechanik belegt), mittel für die vorgeschlagenen Erfüllungsgrade. **Wirkung:** hoch — neues Kriterium, das die Rangfolge im Anforderungs-Score verschiebt, und ein belastbarer Hebel auf `fixH`.

---

## CDO-3 · Ausstiegskosten werden gerechnet, aber nicht gezeigt

**Heute im Rechner** (`calc()`, Zeile 718):

```js
const switchCost=(S.baseline!=='none'&&S.baseline!==key&&S.existing>0)
  ? S.existing*S.cpr*p('reuseH')*compMult*libF*g('migFactor')*rate0 : 0;
```

Der Posten entsteht nur, wenn jemand in Schritt 1 einen heutigen Ansatz und einen Bestand einträgt. Standard ist `baseline:'none'`, `existing:0` — dann ist die Kategorie „Migration des Bestands" in der Ergebnistabelle durchgängig 0 €. Das Gegenstück, der **Ausstieg aus dem gewählten Ansatz**, wird nie berechnet. `REQS.exit` („Exit-Fähigkeit / kein Vendor-Lock-in", `cap:[1,3,4,5]`) hat Default-Priorität **`'C'` = Could**.

**Was sich ändern soll**

1. In `calc()` eine immer berechnete Kennzahl ergänzen:
   ```js
   c.exitH = (S.existing + c.reportsTotal) * S.cpr * p('reuseH') * compMult * g('migFactor');
   c.exitCost = c.exitH * rate0;
   ```
   Bewusst mit `reuseH` **des verlassenen Ansatzes** als Näherung, solange kein Zielansatz feststeht; sauberer wäre der Zielansatz (billigste nicht ausgeschlossene Alternative), das ist ein Zweizeiler in `render()`, weil dort alle vier `sim`-Objekte vorliegen.
2. Neue Zeile in `renderTable()`: `„Ausstieg: alle Reports auf einen anderen Ansatz bringen"` → `fmtN(exitH,0) + ' h ≈ ' + fmtEur(exitCost)`, und eine Zeile im CSV-Export (`R.push(...)`, Zeile 1144).
3. `REQS.exit.def` von `'C'` auf `'S'`. Ebenso `REQS.version.def` von `'C'` auf `'S'`. Begründung im Fließtext: für die Fachabteilung ist Exit ein Could, für den, der die Plattform über zehn Jahre verantwortet, ein Should.
4. Im Paid-Block `TEXT.paid.hidden` ergänzen: *„Zum Ausstieg kommen Kündigungsfrist und Restlaufzeit des Vertrags — im Rechner nicht modelliert."*

**Warum**

„Was kostet der Rückweg" ist die Frage, die in jedem Architekturboard gestellt wird, und sie ist hier mit vorhandenen Größen beantwortbar. Der Effekt ist außerdem asymmetrisch und deshalb entscheidungsrelevant: Bei Paid ist die Reportdefinition an das Visual gebunden (steht schon in `TEXT.paid.con`), bei Deneb überlebt die Vega-Lite-Spezifikation das Wirtsvisual, bei Core steckt der Standard im Semantikmodell. Eine Zahl daneben zu stellen, kostet zehn Zeilen Code und ändert die Diskussion — heute ist Lock-in im Rechner eine Meinung auf einer 1–5-Skala mit Priorität „Could".

**Evidenz:** keine externe nötig, rein rechnerisch aus vorhandenen Größen. Qualitative Stütze für den Nachbau statt Migration: Charticulator, Bing Maps, OKViz (bereits im Rechner zitiert).

**Konfidenz:** hoch. **Wirkung:** hoch — neue Primärkennzahl ohne neue Annahme.

---

## CDO-4 · Time-to-value steht in Stunden, nicht in Kalenderwochen

**Heute im Rechner** (`calc()`, Zeile 744, und die KPI-Karte):

```js
c.firstReportH = p('setupH')+p('devH')+S.types*p('firstH')*compMult*libF+S.cpr*p('reuseH')*compMult*libF;
```
Anzeige: *„Erster Standard-Report ≈ 82 h · jeder weitere ≈ 6,0 h"*.

**Was sich ändern soll** — neue Options-Annahme in `OPTP`:

```js
{id:'leadWeeks',label:'Vorlaufzeit bis zur Produktivfreigabe',
 sub:'Kalenderwochen ohne Arbeitszeit: Einkauf, Legal, AVV, Security-Review, Zertifizierung, Org-Store-Eintrag, Tenant-Setting',
 unit:'Wochen',
 v:{paid:[4,10,26], oss:[2,6,16], deneb:[1,3,8], core:[0,1,3]},
 src:'E', srcNote:'Autoren-Schätzung. Belegt ist nur die Zertifizierungs-Wartezeit (Microsoft nennt bis zu drei Wochen, im Rechner bereits bei fixH zitiert) und der Org-Store-Vorgang selbst; Einkaufs- und AVV-Dauern sind organisationsabhängig und haben keine Quelle. Wer den Wert kennt, trägt ihn ein.'}
```

Anzeige in der KPI-Karte um eine Zeile erweitern: *„Erster Standard-Report ≈ 82 h Arbeitszeit · frühestens nach ≈ 10 Wochen"*, dazu eine Tabellenzeile und eine CSV-Spalte. Der Wert geht **nicht** in die Kosten ein — er ist eine eigene Dimension und soll es bleiben.

**Warum**

Die Zielgruppe entscheidet im Budgetjahr und plant gegen einen Monatsabschluss. Der Unterschied zwischen „Core kostet mehr Stunden, ist aber morgen einsatzbereit" und „Paid kostet weniger Stunden, steht aber erst im Q2 im Tenant" ist für einen Plattformverantwortlichen oft wichtiger als ±20 % auf die Fünfjahressumme. Heute suggerieren 82 Stunden eine Lieferzeit von zwei Wochen, was für Paid mit Rahmenvertrag und AVV nie stimmt und für Core meist untertrieben ist. Nebeneffekt: Der Posten macht sichtbar, warum der Org-Store-Weg (CDO-1) attraktiv ist — er ist der kurze.

**Evidenz**

- Zertifizierungs-Wartezeit: bereits im Rechner unter `fixH.srcNote` zitiert („AppSource-Update 10–14 Tage bis Produktion, Zertifizierung bis 3 Wochen (Microsoft Learn)") — nicht neu belegt, aber konsistent.
- Vorgang Org-Store (Admin-Portal, Datei hochladen, „Enable for Visualization Pane", automatische Verteilung an Desktop): https://learn.microsoft.com/fabric/admin/organizational-visuals
- Prozessschritte Prüfung/Freigabe/Audit von Organisationsvisuals als eigener Verwaltungsvorgang: https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-tenant-administration
- Einkauf, Legal, AVV-Dauern: **keine Quelle**, Autoren-Schätzung.

**Konfidenz:** hoch für die Lücke, niedrig-mittel für die Zahlen. **Wirkung:** hoch für die Zielgruppe, keine auf die Kostenrangfolge.

---

## CDO-5 · Adoption fehlt: der Rechner unterstellt 100 % Standardtreue

**Heute im Rechner:** `calc()` rechnet alle `reportsTotal` Reports mit `reuseH` des gewählten Ansatzes. `calcSQ()` („kein Standard") ist eine **Alternative** zu den vier Ansätzen, nicht ihr Rückfall. `REQS.maint` („Wartbar durch den Fachbereich", `cap:[5,5,2,2]`) und `REQS.design` („Einheitliches Design ohne Styleguide-Disziplin", `cap:[5,4,2,2]`) bewerten die Fachbereichstauglichkeit — aber nur im Anforderungs-Score, nicht in den Kosten.

**Was sich ändern soll** — minimale Variante, ohne neue Ebene:

1. Neue Options-Annahme `adopt` (Anteil der Reports, die den Standard tatsächlich nutzen), Vorschlag
   `paid [70, 85, 95] · oss [60, 80, 92] · deneb [50, 70, 85] · core [40, 65, 85]` in %, `src:'E'`.
2. In `calc()`: Rollout, Wartung und Anwender-Support auf `adopt` skalieren, und die verbleibenden `(1 − adopt)` Reports zum Satz der Null-Option abrechnen, indem `calcSQ`-Bausteine (`sqChartH`, `sqMaint`, `sqSupH100`) auf diesen Anteil angewandt werden. Das koppelt die bereits gebaute Null-Option an die vier Ansätze, statt sie daneben zu stellen.
3. Als Schieberegler in Schritt 1 sichtbar machen („Anteil der Reports, die den Standard nutzen"), Default aus `adopt`, überschreibbar.

**Warum**

Das ist die Data-Literacy- und Change-Dimension, und sie fehlt vollständig. Die Logik der Werte: Je weniger der Fachbereich selbst kann, desto mehr wird am Standard vorbeigebaut — genau die Achse, die `REQS.maint` mit 5/5/2/2 bereits beschreibt. Ein Deneb-Standard, den nur zwei Leute ändern können, erzeugt Schattenreports; das ist kein Schulungsproblem, sondern ein Kostenposten, und heute zahlt ihn niemand. Der Effekt wirkt gegen die Code-Ansätze und ist damit unbequem für die Autoren — das spricht dafür, ihn einzubauen, nicht dagegen.

Wichtig für die Ehrlichkeit: Für die Zahlen habe ich **keine** Quelle. Die Mechanik ist der Fund, die Werte sind Platzhalter. Wer sie nicht setzen will, baut den Schieberegler und lässt ihn auf 100 % stehen — dann sieht wenigstens jeder, welche Annahme er gerade trifft.

**Evidenz:** keine. Rückendeckung nur indirekt: Der Rechner selbst bewertet Fachbereichstauglichkeit bereits sehr unterschiedlich (`REQS.maint`, `REQS.design`), zieht daraus aber keine Kostenfolge.

**Konfidenz:** hoch für die Lücke, niedrig für die Werte. **Wirkung:** hoch — verschiebt die Rangfolge zwischen Klick- und Code-Ansätzen systematisch.

---

## CDO-6 · Koexistenz: der Rechner ist ein Entweder-oder, die Plattform ist ein Portfolio

**Heute im Rechner:** Genau ein Ansatz gewinnt. In `grundannahmen-kritik.md` steht Koexistenz als Punkt 4 unter „was fehlt"; im `README.md` steht sie unter „nicht umgesetzt, bewusst". Ich melde sie trotzdem, weil sie aus Plattformsicht der wichtigste offene Strukturpunkt ist: Kein Haus mit 25 Erstellern hat genau ein Werkzeug.

**Was sich ändern soll** — konkrete Minimalmechanik, damit die Umsetzung nicht wieder an der Größe scheitert:

1. Zweite Auswahl „Zweiter Ansatz" (Default: keiner) plus Regler `secShare` = Anteil der Chart-Typen, die der zweite Ansatz abdeckt (typisch 10–30 %).
2. Kosten = `calc(primär)` mit `types`, `reports`, `cpr` skaliert auf `(1 − secShare)` **plus** `calc(sekundär)` auf `secShare`, **plus** zwei Aufschläge, die genau der Grund sind, warum Koexistenz teurer ist als die Summe:
   - Schulung: die Vorlagen-Bauer (`ownersOf()`) brauchen **beide** Tiefschulungen, nicht anteilige — also `train0` des Zweitansatzes **ungekürzt** für die Owner.
   - Governance: `govIntake` und `govRun` beider Ansätze voll, nicht anteilig (zwei Freigaben, zwei Tenant-Einträge, zwei Versionsstände).
3. Ergebnis als fünfte Spalte „Kombination" neben den vier Reinformen.

**Warum**

Die realistische Konzernfrage lautet nicht „Zebra oder Deneb", sondern „Zebra für 80 % und Deneb für die Sonderfälle — was kostet das gegenüber Zebra allein?". Die Antwort ist nicht-trivial, weil Schulung und Governance nicht teilbar sind und der Nutzen der Einheitlichkeit (das IBCS-Argument) beim zweiten Werkzeug leidet. Ohne diese Spalte empfiehlt der Rechner eine Disziplin, die in der Praxis niemand durchhält, und die Zuhörer wissen das.

**Evidenz:** keine externe. Strukturargument.

**Konfidenz:** hoch für die Lücke und die Mechanik, keine Aussage zu Zahlen. **Wirkung:** hoch, aber Aufwand ebenfalls hoch — realistisch nach der Konferenz.

---

## CDO-7 · Der Standard skaliert mit der Zahl der Semantikmodelle — bei Core, nicht bei Custom Visuals

**Heute im Rechner:** `build = S.types * p('firstH') * compMult * libF * rate0`. Die Zahl der Semantikmodelle kommt in `const S` nicht vor. `OPTP.firstH.srcNote` sagt ausdrücklich: *„Core: Measure-Bibliothek (UDFs) ist Datenmodellarbeit und steckt nur teilweise hier drin"* — die Lücke ist also bekannt, aber unbeziffert.

**Was sich ändern soll**

1. Neues Eingabefeld in Schritt 1: „Semantikmodelle, die den Standard tragen müssen" (`S.models`, Default 1).
2. Multiplikator auf `setup + build` je Ansatz:
   `paid/oss: 1 + 0,05 × (models − 1)` · `deneb: 1 + 0,15 × (models − 1)` · `core: 1 + 0,5 × (models − 1)`
   `src:'E'`, Faktoren als Autoren-Schätzung gekennzeichnet.
3. In `TEXT.core.hidden` ergänzen: *„Die Measure- und UDF-Bibliothek lebt im Semantikmodell. Zwanzig Modelle heißen zwanzig Bibliotheken — oder ein zentrales Modell, das ihr erst bauen müsst."*

**Warum**

Das ist der Punkt, an dem Visual-Wahl und Plattformarchitektur zusammenstoßen, und er fehlt komplett. Ein Custom Visual ist ein **Tenant**-Objekt: einmal im Org-Store registriert, steht es allen Erstellern in allen Workspaces zur Verfügung. Eine DAX-UDF ist ein **Modell**-Objekt: sie liegt in `functions.tmdl` im Definitionsordner des jeweiligen Semantikmodells und muss in jedes Modell ausgerollt und dort gepflegt werden. Genau deshalb ist „Core + SVG" in einer Tenant-Landschaft mit vielen Modellen deutlich teurer als im Rechner-Szenario mit implizit einem Modell — und zwar überproportional, weil jede Modelländerung eine eigene Testkette hat. Deneb liegt dazwischen: die Spezifikation ist report-gebunden und über Templates portabel, muss aber je Modell auf Feldnamen gemappt werden.

Das ist zugleich die Brücke zum Punkt „Semantikmodell als Quelle der Wahrheit": Wer den Standard in Measures gießt, koppelt Darstellungslogik an das Modell — schön für Konsistenz innerhalb eines Modells, teuer über viele.

**Evidenz**

- UDFs sind Modellobjekte: „UDFs **live in the model** and can be viewed in Model Explorer", „Function names … must be well-formed and **unique within the model**", „functions are also stored in `functions.tmdl` within the *definition* folder" — https://learn.microsoft.com/power-bi/transform-model/desktop-user-defined-functions-overview und https://learn.microsoft.com/dax/best-practices/dax-user-defined-functions
- Custom Visuals sind Tenant-Objekte: Verwaltung im Admin-Portal, „Organizational visuals settings automatically deploy to Power BI Desktop" — https://learn.microsoft.com/fabric/admin/organizational-visuals

**Konfidenz:** hoch für die Richtung, niedrig für die Faktoren. **Wirkung:** hoch in Konzern- und Großkonzern-Presets, keine im Pilot.

---

## CDO-8 · Der Verteilweg ist der eigentliche Governance-Kostentreiber, steckt aber unsichtbar in den Options-Werten

**Heute im Rechner:** `govIntake` (Freigabe je Visual-Paket) und `govRun` (laufende Governance) sind je Ansatz gesetzt: `govIntake` oss `[8,24,60]` gegen deneb `[1,4,10]`, `govRun` oss `[12,30,80]` gegen deneb `[6,16,40]`. Die `srcNote` verrät, dass der wahre Treiber gar nicht der Ansatz ist: *„OSS aus AppSource statt Org-Store halbiert den Posten."*

**Was sich ändern soll**

Verteilweg aus den Options-Werten herausziehen und als eigene Auswahl in Schritt 2 sichtbar machen — drei Wege, drei Faktorensätze auf `govIntake`, `govRun`, `events` und `leadWeeks` (CDO-4):

| Weg | `govIntake` | `govRun` | `events` | Versionshoheit (CDO-2) |
|:--|:--|:--|:--|:--|
| AppSource (zertifiziert) | ×0,5 | ×0,7 | ×1,0 | nein |
| Organizational Store (.pbiviz) | ×1,0 | ×1,0 | ×0,8 | ja |
| Datei-Import je Ersteller | ×0,4 | ×1,6 | ×1,3 | nein (Versionswildwuchs) |

Die Faktoren sind Autoren-Schätzung; die **Richtung** ist belegt: Der Org-Store beseitigt Versions-Wildwuchs und macht das Visual für alle Ersteller gleich, kostet dafür einen Admin-Vorgang je Änderung; der Datei-Import spart die Freigabe und erzeugt genau den Wildwuchs, den Microsoft in der Implementation-Planning-Guidance als Hauptargument für den Org-Store nennt.

**Warum**

Zwei Organisationen mit demselben Visual haben völlig unterschiedliche Governance-Kosten, je nachdem, wie es verteilt wird. Heute kann der Nutzer diesen Hebel nicht ziehen, obwohl er ihn in der Realität als Erstes zieht. Nebeneffekt: Der Schalter macht CDO-1 bedienbar — „Org-Store" ist die Antwort auf „nur zertifizierte Visuals".

**Evidenz**

- Vorteile des Org-Store, wörtlich: „The version of the custom visuals is **consistent for all reports**", „Reports and dashboards will be **automatically updated** when an organizational visual is updated", „New and changed custom visuals can be **methodically tested and pre-approved**" — https://learn.microsoft.com/power-bi/guidance/powerbi-implementation-planning-tenant-administration
- Gegenargument ebenda: „it does require the Fabric administrator to get involved, **which could lead to delays**" — genau der Posten, der in `govRun` und `leadWeeks` gehört.
- Auditierbarkeit als eigener laufender Aufwand: `InsertOrganizationalGalleryItem`, `UpdateOrganizationalGalleryItem`, `UpdatedAdminFeatureSwitch` im Activity Log — ebenda.

**Konfidenz:** hoch für die Mechanik, niedrig für die Faktoren. **Wirkung:** mittel-hoch.

---

## CDO-9 · ALM: die Visual-Bindung reist nicht mit Deployment-Pipeline und Git

**Heute im Rechner:** `REQS.version` deckt Diff und Historie ab. Deployment-Pipelines, Git-Integration und die Frage „wie kommt der Standard von Dev nach Prod" kommen nirgends vor — weder in `REQS` noch in `FLAGS` noch in den `TEXT`-Blöcken.

**Was sich ändern soll** — neue Anforderung:

```js
{id:'alm',name:'Reist mit Git und Deployment-Pipeline',
 sub:'Standard von Dev über Test nach Prod befördern, ohne Handarbeit',
 cap:[2,2,4,5],def:'C',
 note:{paid:'Visual ist ein Tenant-Objekt, kein Workspace-Element: die Pipeline befördert nur die Referenz',
       oss:'Wie Paid; dafür liegt die .pbiviz-Datei bei euch und kann versioniert werden',
       deneb:'Die Vega-Lite-Spezifikation liegt in der Reportdefinition (PBIR) und reist mit; das Wirtsvisual nicht',
       core:'Alles liegt in Reportdefinition und Semantikmodell und reist vollständig mit'}}
```

**Warum**

Ein BI-Team mit CI/CD promotet Workspaces. Custom Visuals sind aber Tenant-weit registriert, nicht Workspace-Inhalt — die Pipeline schiebt die Reportdefinition mit ihrer Visual-Referenz weiter, das Visual selbst ist in allen Stages dasselbe. Praktische Folge: Ein Visual-Update lässt sich nicht in Dev testen, ohne Prod zu treffen (der Umweg ist, zwei Org-Store-Einträge als „v1" und „v2" zu führen). Das ist die ALM-Seite von CDO-2 und für ein Team mit Deployment-Pipelines ein echtes Auswahlkriterium — in die Richtung, dass Core hier gewinnt und Deneb als Zweiter mit dem Argument, dass die Spec Text in der Reportdefinition ist.

**Evidenz**

- Org-Visuals werden im Fabric-Admin-Portal verwaltet und tenant-weit verteilt („Organizational visuals settings automatically deploy to Power BI Desktop") — https://learn.microsoft.com/fabric/admin/organizational-visuals
- Git-Integration und Deployment-Pipelines arbeiten auf **Workspace-Elementen** — https://learn.microsoft.com/fabric/cicd/cicd-overview
- PBIP/PBIR-Reportdefinitionen sind Text und Git-fähig — https://learn.microsoft.com/power-bi/developer/projects/projects-git

**Konfidenz:** mittel-hoch (die Einzelfakten sind belegt, der Schluss „Visual reist nicht mit" ist von mir abgeleitet, nicht wörtlich zitiert). **Wirkung:** mittel.

---

## CDO-10 · Messbarkeit: der Rechner sagt, was es kostet, aber nicht, woran ihr merkt, dass es wirkt

**Heute im Rechner:** Die Ergebnisseite zeigt Summe, P10–P90, Barwert, Invest, laufende Kosten, Kosten je Viewer, Stunden für den ersten und jeden weiteren Report, Abkündigungswahrscheinlichkeit und den Anforderungs-Score. Keine einzige Kennzahl ist so formuliert, dass man sie nach zwölf Monaten nachmessen könnte.

**Was sich ändern soll** — ein Ergebnisblock „Woran ihr in einem Jahr messt, ob der Standard wirkt", der ausschließlich vorhandene Größen als **Zielwerte** ausgibt:

| Kennzahl | Quelle im Modell | Beispiel-Zielwert |
|:--|:--|:--|
| Stunden je neuem Standard-Report | `nextReportH` | „≤ 6 h" |
| Rückfragen je 100 Viewer und Jahr | `supH100` | „≤ 4 h" |
| Zeit bis zum ersten Report | `leadWeeks` + `firstReportH` (CDO-4) | „≤ 10 Wochen" |
| Anteil konformer Reports | `adopt` (CDO-5) | „≥ 80 %" |
| Ausstiegskosten | `exitH` (CDO-3) | „bekannt und < X h" |
| Breaking-Updates je Jahr | `events` | „≤ 1,5" |
| Vorlagen-Bauer im Haus | `ownersOf()` | „≥ 2" |

Dazu ein Satz: *Die Zielwerte sind die Annahmen dieses Rechners. Wenn ihr sie nach einem Jahr nachmesst und sie nicht stimmen, war nicht der Ansatz falsch, sondern die Annahme — und ihr habt dann echte Zahlen statt Schätzungen.*

**Warum**

Das ist billig, ehrlich und dreht das Werkzeug vom Entscheidungs- zum Steuerungsinstrument. Es adressiert außerdem die stärkste Kritik aus `grundannahmen-kritik.md` („15 von 37 Annahmen sind reine Autoren-Schätzung") auf die einzige Art, die skaliert: Wer den Rechner benutzt, wird zum Datenlieferanten für die nächste Version. Für die Pre-Conference ist das zusätzlich der beste Aufhänger für die Umfrage, die im Audit ohnehin empfohlen wird.

Zwei davon sind zugleich das Skills- und Bus-Faktor-Thema, das heute nur qualitativ in `REQS.bus` steckt: „Vorlagen-Bauer im Haus ≥ 2" ist die operative Fassung, und `ownersOf()` erzwingt das Minimum bereits rechnerisch (`Math.max(S.creators>1?2:1, …)`), sagt es aber niemandem. Ein zusätzlicher Warnhinweis bei `owners < 2` und Ansatz Deneb oder Core („Wissensmonopol: Fluktuation von einer Person blockiert alle Änderungen; `churn × rampH` ist dann keine Durchschnitts-, sondern eine Ausfallgröße") kostet drei Zeilen.

**Evidenz:** keine externe nötig, reine Darstellung vorhandener Größen.

**Konfidenz:** hoch. **Wirkung:** mittel für die Rechnung, hoch für die Glaubwürdigkeit.

---

## Geprüft und für richtig befunden

- `REQS.copilot` mit `cap:[1,1,1,5]`: „Copilot doesn't support custom visuals" ist am 11.09.2026 weiterhin so dokumentiert (https://learn.microsoft.com/power-bi/create-reports/copilot-create-reports). Die Aufspaltung in Copilot-UI und agentisches Authoring auf PBIR behandelt bereits `zeit-fable.md`, ich ergänze dort nichts.
- `REQS.rs` und `FLAGS.rs`: „Power BI Report Server doesn't support organizational visuals" ist belegt; die Warnung „nur als Datei-Import" ist korrekt.
- `FLAGS.embed`, `FLAGS.sovereign`: decken sich mit der Learn-Liste der vier Umgebungen ohne Lizenzdurchsetzung (RS, Sovereign, PaaS app-owns-data, Publish-to-web).
- `REQS.datares` mit `cap:[4,2,5,5]`: Die Zertifizierung prüft genau das (keine externen Dienste). Die Tenant-Schalter „Allow downloads from custom visuals", „Local storage" und „AppSource Custom Visuals SSO" wären fachlich eine Erweiterung, überschneiden sich aber mit Fund 4 aus `vollstaendigkeit-reqs-flags.md` (Datenexport) — ich melde sie deshalb nicht als eigenen Fund.
- `modeParams()`: Die Kopplung von Self-Service-Anteil an `ownerShare`, `variantF` und `govF` ist konsistent; `govF` steigt auf 1,6 bei vollem Self-Service, das ist für eine Plattformorganisation eher zu niedrig als zu hoch, aber innerhalb der Spanne vertretbar.

## Was jemand mit freiem Netz nachziehen sollte

1. Ob Zebra BI, Inforiver und graphomate eine **.pbiviz-Datei für den Organizational Store** ausliefern (nicht nur AppSource). Davon hängt `REQS.pin` für Paid ab (2 oder 5) und ein Teil von CDO-8. Herstellerseiten waren hier blockiert.
2. Ob es eine dokumentierte Möglichkeit gibt, eine **AppSource-Visual-Version festzuhalten**. Ich habe keine gefunden; die Learn-Dokumentation sagt das Gegenteil.
3. Die drei Wartezeiten für CDO-4 aus der eigenen Organisation: Einkaufsvorgang, Security-Review, Org-Store-Eintrag. Drei Telefonate, danach ist der Parameter belegt statt geschätzt.
