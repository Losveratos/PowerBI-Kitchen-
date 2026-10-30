# DataKitchen Gantt (Projektplan) — Power BI Custom Visual

Projektplan-Gantt für Power BI, das MS-Project-Pläne so nachbildet, wie
Projektplaner sie kennen: Gliederung aus dem PSP-Code, Anordnungsbeziehungen mit
Typ und Zeitabstand, kritischer Pfad, Puffer, Stichtage, Basisplan,
Fortschrittslinie und Arbeitskalender.

Rendering-Kern host-unabhängig in [src/gantt.ts](src/gantt.ts), Power-BI-Anbindung
in [src/visual.ts](src/visual.ts).

## Schnellstart: MS-Project-Plan in einer Minute

| Feld aus dem Export | Rolle im Visual |
| --- | --- |
| Name | **Task** |
| Anfang | **Start (Datum)** |
| Ende | **Ende (Datum)** — leer = Meilenstein |
| PSP-Code (2.1.3) | **PSP-Code** — daraus entsteht die ganze Gliederung |
| Nr. | **Nr.** |
| Vorgänger (`12;15EA+2T`) | **Vorgänger** |
| % abgeschlossen | **Fortschritt** |

Damit stehen Gliederung, Sammelvorgänge, Pfeile und kritischer Pfad. Alles Weitere
ist optional: *Kritisch* und *Gesamte Pufferzeit* aus dem Export (sonst berechnet
das Visual beide), *Stichtag*, *Statusdatum*, Basisplan, Projekt, Status, Wer,
bis zu drei *Zusatzspalten*.

## Für Ersteller: Einrichtung ohne Suchen

Im **Bearbeitungsmodus** steht ganz links in der Leiste ein gestrichelter Knopf
**✎ Einrichtung** — Leser des veröffentlichten Berichts sehen ihn nie. Ein roter
Zähler daran nennt die Zahl der Warnungen in den Daten. Das Panel hat drei Teile:

- **Felder** — Checkliste der wichtigen Rollen, jeweils mit dem, was sie
  freischalten („Vorgänger (+ Nr.) → Pfeile, kritischer Pfad, Puffer"). Sind die
  Vorgänger Nummern, fehlt aber *Nr.*, steht genau das da.
- **Datenprüfung** — was beim Einlesen aufgefallen ist: Datenlimit von 30.000
  Zeilen erreicht · *Fortschritt* als „Anzahl" zusammengefasst (Textspalte — wird
  ignoriert, statt jeden Vorgang auf 100 % zu setzen) · Zeilen ohne gültigen Start
  oder ohne Namen übersprungen · Ende vor Start · doppelte Nr. / PSP-Codes ·
  Vorgänger nicht gefunden · Kreisbezüge · Termine als Text gelesen.
- **Vorlagen** — ein Klick setzt den Formatbereich passend:

  | Vorlage | setzt |
  | --- | --- |
  | Projektplaner | wie MS Project: PSP-Spalte, Puffer, Stichtage, Fortschrittslinie, Arbeitstage, Wochenansicht |
  | Management-Übersicht | Balken nach Status, Monatsansicht, ohne Planerspalten, Namen zweizeilig |
  | Meilenstein-Portfolio | Start in der Hauptmeilenstein-Ansicht, Quartale (braucht die Rolle *Hauptmeilenstein*) |
  | IBCS-Bericht | monochrom nach IBCS, Plan vs. Ist mit Δ |
  | Zurücksetzen | alles, was die Vorlagen ändern, zurück auf die Vorgaben |

  Vorlagen setzen nur Formatoptionen, nie Daten; danach lässt sich alles im
  Formatbereich weiter anpassen.

Ohne Felder zeigt das Visual dieselbe Checkliste als Startseite (der
Formatbereich ist dann schon bedienbar) und darunter **„Warum nichts zu sehen
ist"** (z. B. alle Starttermine ungültig). Sind die Felder gebunden, aber alle
Zeilen weggefiltert, sehen Leser nur „Keine Vorgänge für die aktuelle
Filterauswahl".
Abschaltbar unter *Darstellung → Allgemein → Einrichtungshilfe*.

**Termine als Text** werden verstanden: `06.03.2026`, `Fr 06.03.26`,
`06.03.2026 08:00`, ISO (`2026-03-06`) und `3/6/2026` (US, außer die erste Zahl
ist > 12). Sicherer bleibt der Datentyp *Datum* im Modell.

**Formatbereich, der mitdenkt**: Karten in Gruppen, jede Option mit Erklärung
beim Darüberfahren. Was die gebundenen Daten nicht hergeben, verschwindet oder ist
ausgegraut — mit Grund („Braucht „Plan-Start" oder „Plan-Ende"."): Spaltenschalter
ohne Daten, Kritischer-Pfad-Gruppe ohne Vorgänger/Kritisch/Puffer, Stichtag-Schalter
ohne Stichtage, Basisplan ohne Plan-Termine. Tooltip und Basisplan haben einen
Hauptschalter im Kartenkopf. Einzelfarben je Vorgang gibt es bis 100 Vorgänge,
darüber über *Balken → Balkenfarbe nach*.

## Datenrollen

| Rolle | Typ | Hinweise |
| --- | --- | --- |
| Task | Grouping | **Pflicht.** Vorgangsname |
| Start (Datum) | Grouping | **Pflicht.** Zeilen ohne gültigen Start werden übersprungen |
| Ende (Datum) | Grouping | leer = Meilenstein (Raute) |
| PSP-Code | Grouping | Gliederung ohne vorbereitete Ebenen-Spalten: `2.1.3` hängt unter `2` und `2.1`. Ein Vorgang mit Kindern ist ein Sammelvorgang und wird zur Gruppe — mit seinen eigenen Terminen. Je Projekt getrennt. Ohne Sortierung natürlich sortiert (2.9 vor 2.10) |
| Nr. | Grouping | Vorgangs-ID; Bezug für die Vorgänger. Ohne Sortierung gibt sie die Reihenfolge vor |
| Vorgänger | Grouping | MS-Project-Spalte `12;15EA+2T;7AA-1 Tag;3EE+50%` — EA/AA/EE/AE (auch FS/SS/FF/SF), Zeitabstand in T, W (5 AT), Mo (20 AT), h, min, % der Vorgängerdauer. Nicht-numerische Einträge gelten als Vorgangsnamen (wie bis 1.18). Je Projekt aufgelöst |
| Ebenen (Gruppierung) | Grouping | Alternative zum PSP-Code: **bis zu 5 Felder** als geschachtelte Klappebenen in Feldbrunnen-Reihenfolge. Hat Vorrang vor dem PSP-Code |
| Projekt (oberste Ebene) | Grouping | Portfolio: klappbare Projektzeile über allem; trägt immer alle Meilensteine des Projekts |
| Fortschritt | Measure | 0–1 oder 0–100, Skala wird erkannt. Als Summe/Durchschnitt binden — „Anzahl“ (Textspalte) wird erkannt und ignoriert |
| Status | Grouping | „Fertig/In Arbeit/Blockiert/Offen" (auch EN) → farbige Pills |
| Wer (Owner) | Grouping | |
| Kritisch (Ja/Nein) | GroupingOrMeasure | aus MS Project. Hat Vorrang vor allem Berechneten |
| Gesamte Pufferzeit (Tage) | GroupingOrMeasure | Zahl in Arbeitstagen oder Text wie „3 Tage", „1,5 Wochen" |
| Stichtag (Deadline) | GroupingOrMeasure | Marker im Chart, rot wenn überschritten |
| Statusdatum (rote Linie) | GroupingOrMeasure | Berichtsstand statt „Heute"; Bezug für *überfällig* und die Fortschrittslinie |
| Plan-Start / Plan-Ende (Basisplan) | GroupingOrMeasure | Plan vs. Ist; Δ = Ist-Ende − Plan-Ende |
| Hauptmeilenstein (Ja/Nein) | GroupingOrMeasure | für die Ansicht „Nur Hauptmeilensteine" |
| Farbe nach (Kategorie) | Grouping | z. B. Gewerk oder Ampel, für *Balken → Balkenfarbe nach: Feld* |
| Zusatzspalten (bis zu 3) | GroupingOrMeasure | erscheinen als Tabellenspalten mit dem Feldnamen als Kopf |
| Sortierung | GroupingOrMeasure | stabile aufsteigende Reihenfolge; schlägt Nr. und PSP |

Ja/Nein-Felder sind tolerant: `true`, `1`, `ja`, `yes`, `y`, `x`, `wahr` = ja.

## Bedienung

### Die Leiste

```
[⊞][⊟][Ebene ▾] [Suchen …]  11 Vorgänge · 5 Gruppen     [Tage|Wochen|…] [−][+] [Heute][Alles][Auswahl] [◆ Meilensteine][▭ Basisplan] [Gesamter Terminplan ▾]
```

- **⊞ / ⊟** klappen alles auf bzw. zu. **Ebene ▾** zeigt die Gliederung bis
  Ebene 1, 2, … — wie „Gliederung anzeigen" in MS Project.
- **Suchen** findet Vorgänge über Name, PSP-Code (Präfix) oder Nr.; Treffer sind
  gelb hinterlegt. **Enter** springt zum nächsten Treffer und klappt dafür die
  Vorfahren auf, **Umschalt+Enter** zurück, **Esc** leert.
- **Heute** springt zum Statusdatum, **Alles** passt den Plan ein, **Auswahl**
  (nur bei Selektion) zoomt auf die selektierten Vorgänge.
- **Ansicht ▾** (seit 2.3 nach den Sichten eines Terminplaners):
  *Sammelvorgänge* (je Projekt nur die oberste Gliederungsebene, zugeklappt;
  Aufklappen zeigt die nächste Ebene wieder zugeklappt) · *Gesamter Terminplan*
  (alles aufgeklappt) · *Nur Meilensteine* (alle Meilensteine in ihren Gruppen —
  nur Gruppen, die Meilensteine enthalten; zugeklappt tragen sie die Rauten) ·
  *Nur Hauptmeilensteine* (flache Liste, jeder Name einmal, Vorkommen als
  Rauten) · *Je Projekt ein Balken* (nur mit mehreren Projekten) · *Nur
  kritischer Pfad* · *Nur überfällige*. Die gefilterten Ansichten behalten die
  Gliederung. Nicht verfügbare Ansichten stehen ausgegraut im Menü und sagen,
  welche Rolle fehlt. Erneut gewählt, stellt eine Ansicht ihren Klappzustand
  wieder her. Alles folgt Slicern und Crossfiltern; bleibt nichts übrig,
  erscheint ein Hinweis statt einer leeren Fläche.
  Die **Startansicht** *Je Projekt ein Balken* (seit 2.2, Wert `projekte`)
  öffnet mit allen Gruppen zugeklappt — mit Rolle *Projekt* also ein
  Summenbalken je Projekt; ⊞ oder Klick auf die Zeile klappt auf.
- **◆ Meilensteine** und **▭ Basisplan** (seit 2.3, auch für Leser): blenden
  Meilenstein-Zeilen und -Rauten bzw. Basisplan-Balken, -Rauten, Legende,
  Δ-Spalte, Δ-Beschriftung und Verzug-Hinterlegung aus und wieder ein.
  Gedrückt = sichtbar. Der Zustand gilt nur für die Sitzung (wie der
  Klappzustand); Zoom und Zeitachse bleiben stehen. *◆ Meilensteine* fehlt in
  den beiden Meilenstein-Ansichten, *▭ Basisplan* ohne Basisplan-Termine oder bei
  ausgeschaltetem Basisplan. Beide lassen sich unter *Darstellung → Knöpfe für
  Leser* abschalten.

### Im Plan

- **Gruppenzeile** anklicken (Tabelle oder Chart, an jeder Stelle) = auf-/zuklappen.
- **Vorgang** anklicken = Crossfilter (Strg = Mehrfachauswahl), Rechtsklick =
  Kontextmenü. Klick auf eine Hauptmeilenstein-Zeile selektiert alle Vorkommen.
- Pannen: Chart ziehen oder scrollen · Zoomen: Strg+Scrollen oder −/+.
- Trenner zwischen Tabelle und Chart ziehen = Tabellenbreite (wird gespeichert).

### Was der Plan zeigt

- **Kritischer Pfad** — rote Balkenrahmen, rote Pfeile zwischen kritischen
  Vorgängen, roter Punkt in der Tabelle. Quelle in dieser Reihenfolge: Rolle
  *Kritisch* → Rolle *Gesamte Pufferzeit* (≤ 0) → **berechnet** aus Terminen und
  Vorgängern (Rückwärtsrechnung in Arbeitstagen, mit Feiertagen und Stichtagen).
  Abgeschlossenes ist nie kritisch. Der Tooltip kennzeichnet berechnete Werte.
- **Puffer** — dünne Linie unter dem Balken bis zum spätesten Ende, Spalte *Puffer*.
- **Überfällig** — Ende vor dem Statusdatum, aber nicht fertig: Ende-Datum rot,
  „überfällig n t" am Balken. Braucht Fortschritt oder Status.
- **Stichtage** — Dreieck am Stichtag, grün eingehalten, rot überschritten.
- **Fortschrittslinie** (Option) — vom Statusdatum zu jedem laufenden Vorgang an
  den Punkt seines Ist-Fortschritts: Knick nach links = Rückstand, nach rechts = Vorsprung.
- **Anordnungsbeziehungen** — Pfeile je Typ: EA verlässt den Vorgänger am Ende
  und trifft den Nachfolger am Anfang, AA Anfang→Anfang, EE Ende→Ende, AE Anfang→Ende.
- **Basisplan** — wie MS Project („Balkendiagramm: Überwachung“): oben der farbige
  **Aktuell**-Balken, direkt darunter der grau gefüllte **Basisplan**-Balken;
  Meilensteine mit abweichendem Plan zeigen zusätzlich eine kleinere graue Raute.
  Legende „Aktuell / Basisplan“ in der Leiste, Tooltip mit *Aktuell* und
  *Basisplan*, Spalte *Δ Basisplan*, Verzug rot. Das „Δ +n t“ an Balken und
  Rauten ist abschaltbar (*Basisplan → Δ an Balken und Meilensteinen*).
- Vorgänger als Nummern, aber Rolle *Nr.* nicht gebunden? Die Infozeile sagt es.

## Hierarchie

Gliederung aus dem **PSP-Code** (ohne Ebenen-Felder) oder aus bis zu fünf
**Ebenen**-Feldern, darüber optional **Projekt**:

```
▼ 1   Vor- und Entwurfsplanung          Sammelvorgang = Gruppe
  ▼ 1.1 Kampfmittelfreiheit
       1.1.1 Antrag auf Luftbildauswertung
       1.1.2 Luftbildauswertung durch Behörde
     ◆ 1.1.3 Kampfmittelfreiheit liegt vor
  ▼ 1.2 PV-Anlage
       1.2.1 Artenschutzgutachten …
```

- **Sammelvorgänge** werden zur Gruppenzeile; ihre eigene Datenzeile erscheint
  nicht doppelt — auch dann nicht, wenn ihre Kinder nur weitere Sammelvorgänge
  sind. Der Gruppenbalken nimmt die eigenen Termine des Sammelvorgangs mit auf.
- Ein **Sammelvorgang nur aus Meilensteinen** zeigt seinen Balken; die
  Meilensteine erscheinen erst beim Aufklappen.
- **Ungleich tiefe Zweige** erzeugen keine namenlosen Zwischengruppen.
- **Farbe** fällt auf der obersten Ebene und wird vererbt (ein Zweig, eine Farbe).
- **Reihenfolge**: Sortierung → Nr. → PSP-Code → Datenreihenfolge.
- Mit genau einem Ebenen-Feld und ohne PSP-Code verhält sich das Visual wie 1.10.

## Formatierungsbereich

Reihenfolge nach Häufigkeit der Nutzung; jede Karte hat „Auf Standard zurücksetzen".

| Karte | Gruppen und Inhalt |
| --- | --- |
| **Darstellung** | *Allgemein*: Theme · **Startansicht** (Gesamter Terminplan / Sammelvorgänge / je Projekt ein Balken / Meilensteine / Hauptmeilensteine / kritischer Pfad / überfällige — im Bericht über *Ansicht ▾* wechselbar) · IBCS · Einrichtungshilfe — *Knöpfe für Leser* (2.3): ◆ Meilensteine · ▭ Basisplan — *Zeitachse*: Standard-Zeiteinheit · Einheit für Tage · Wochenenden und Feiertage schattieren · Status-/Heute-Linie — *Plan und Tabelle*: Pfeile · Gruppennamen im Chart · Infozeile · Tabellenbreite |
| **Terminplanung** | *Kritischer Pfad*: hervorheben · Puffer als Linie — *Termine*: Überfällige markieren · Stichtage · Fortschrittslinie (aus) — *Kalender*: **Dauer in Arbeitstagen** (aus) · **Feiertage** (`01.01.2026, 03.04.2026` — wirken auf Dauer, Δ, Puffer, kritischen Pfad und die Schattierung) |
| **Balken** | Balkenfarbe nach Zweig / Status / kritischem Pfad / Feld „Farbe nach" · Legende |
| **Tabellenspalten** | PSP-Code · Start · Ende · Tage · Puffer · Stichtag · Status · Fortschritt · Wer · Zusatzspalten · **Lange Namen zweizeilig**. Spalten ohne Daten erscheinen nicht; bei Platzmangel weichen sie in fester Reihenfolge |
| **Basisplan** | Hauptschalter (Basisplan-Balken, grau gefüllt unter dem farbigen Aktuell-Balken, wie MS Project „Überwachung“) · Legende Aktuell/Basisplan · Δ an Balken und Meilensteinen · Δ-Spalte · Verzug-Zeilen rot |
| **Meilensteine** | auf zugeklappten Gruppen · Datum · Name · Beschriftung auf zugeklappten Zeilen · Ende = Start als Meilenstein |
| **Tooltip** | Hauptschalter, zeilenweise inkl. „Kritisch, Puffer, Stichtag, überfällig" |
| **Beschriftungen** | Überschrift der Namensspalte, Projekt und Phase/Ebene in Einzahl/Mehrzahl |
| **Zeiteinheiten** | welche Zoomstufen die Leiste anbietet (alle aus = alle an) |
| **Schrift** | Schriftart und -größe (alle Maße skalieren mit) |

Bestehende Berichte behalten alle Einstellungen — die Gruppen ändern nur die
Anordnung, nicht die gespeicherten Eigenschaften.

Die Option *Meilensteine → Nur Hauptmeilensteine* aus 1.16–1.18 ist in
*Darstellung → Startansicht* aufgegangen; bestehende Berichte mit der alten
Einstellung starten weiterhin in der Hauptmeilenstein-Ansicht.

## Technische Notizen

- **Klicks** laufen über mousedown + mouseup (Zeilen) bzw. mousedown (Leiste,
  Menüs), nie über `click`: wird der Knoten zwischen Drücken und Loslassen ersetzt,
  stellt der Browser kein `click` zu. `setState()` zeichnet nur bei echter Änderung neu.
- **Skalierung** (Anpassen an Seite, Fokusmodus, Browser-Zoom) wird bei Treffern,
  Pannen, Scrollbalken, Zoom-Anker und Tooltip herausgerechnet.
- **30.000 Zeilen**: Zeilen sind virtualisiert, die Planungsanalyse (Netzplan,
  überfällig) ist je Datenstand gecacht, der Baum je Struktur. Erstes Bild ~0,5 s
  mit Vorgängern, Hover ~30 ms.
- **Termine und Zeitzone** (2.2.1): jeder Wert wird auf seinen Kalendertag als UTC-Mitternacht gebracht — Datum, Zahl und ISO-Zeitstempel mit Zone („…T22:00:00Z“ = lokale Mitternacht) lokal, ISO ohne Zone und TT.MM.JJJJ wörtlich (2.1/2.2 zeigten in MEZ/MESZ alle Termine einen Tag zu früh); Test: `npm run test:datum`.
- **Berechneter Puffer**: ohne Uhrzeiten endet ein Vorgang am Ende seines letzten
  Tages, ein Meilenstein am Ende seines Tages; ein EA-Nachfolger, der selbst ein
  Vorgang ist, beginnt frühestens am nächsten Arbeitstag. Ohne Stichtage wird
  negativer Puffer aus der Tagesrundung auf 0 gesetzt. MS Projects eigene Werte
  (Rollen *Kritisch*, *Gesamte Pufferzeit*) kennen Ressourcenkalender und
  Einschränkungen und haben deshalb Vorrang.

## Entwicklung

```bash
npm install
npm run package        # baut dist/*.pbiviz
npm run harness        # kompiliert src/gantt.ts nach test/ für den Browser-Test
```

Testharness `test/harness.html`. Samples: Standard „BI-Rollout 2026" ·
**`?msp=1`** Plan wie aus MS Project (PSP-Code, Nr., Vorgänger mit Typ/Zeitabstand,
Sammelvorgänge, Stichtage, Feiertage, Statusdatum 16.03.26) · `?ebenen=1`
mehrstufig über Ebenen-Felder · `?proj=1` Portfolio mit zwei Projekten ·
`?nproj=5` Portfolio aus n Projekten, alle mit Basisplan und wachsendem Verzug ·
`?tip=<Name>` öffnet den Tooltip eines Balkens (für Screenshots).

Parameter: `?ansicht=sammel|projekte|meilensteine|haupt|kritisch|ueberfaellig` ·
`?aus=meilensteine,basisplan` (drückt die Leser-Knöpfe nach dem ersten Bild) ·
`?knopfms=0` `?knopfplan=0` (Knöpfe abgeschaltet) · `?fl=1` Fortschrittslinie ·
`?at=1` Arbeitstage · `?fei=…` Feiertage (leer = keine) · `?farbe=status|kritisch|feld` ·
`?legende=0` · `?zweizeilig=1` · `?kritrolle=1` (Kritisch aus der Rolle statt berechnet) ·
`?krit=0` `?ueber=0` `?puffer=0` `?stich=0` · `?status=2026-03-16` · `?dark=1` ·
`?ibcs=1` · `?tw=430` · `?deps=0` · `?wochenenden=0` · `?heute=0` · `?plan=0` ·
`?delta=0` · `?pleg=0` (Legende Aktuell/Basisplan) · `?dlbl=0` (kein Δ an Balken) · `?verzug=0` · `?msnamen=0` · `?mslabel=nurName|beides` · `?gnamen=0` ·
`?kopf=0` · `?tooltip=0` · `?tipzeilen=dauer,wer` · `?zeinheiten=Tage,Monate` ·
`?nurhaupt=1` · `?txt=Vorgang|Vorhaben|Vorhaben|Paket|Pakete`.

Zum Testen in Power BI Desktop: `dist/dataKitchenGantt….pbiviz` importieren.
