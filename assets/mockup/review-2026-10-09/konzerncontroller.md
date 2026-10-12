# Leiter Konzerncontrolling · Review MockupKitchen v0.5.4

## 1 · Wer ich bin und was ich damit vorhabe

Ich leite das Konzerncontrolling eines Industrieunternehmens mit rund 800 Mio. Umsatz, SAP als Vorsystem, Monatsreporting an Vorstand und Quartalsreporting an den Aufsichtsrat. IBCS nutzen wir seit Jahren in PowerPoint und Excel, Power BI seit zwei Jahren, gebaut vom BI-Team. Ich bin Auftraggeber, kein Entwickler. Im Workshop will ich meine Inhalte festlegen: Kennzahlendefinitionen, Szenarien (AC, PY, BU, FC1 bis FC3), Zeitlogik (MTD, YTD, rollierend 12), Einheiten und Währungen, Vorzeichen bei Aufwand und GuV, Kommentare mit Verantwortlichen, Ampeln und Schwellen, Datenstand und Freigabe. Meine Erwartung: Das Werkzeug spricht meine Sprache, hält meine Entscheidungen fest, und das Protokoll geht ohne Nacharbeit an mein Team und ans BI-Team. Später will ich dasselbe Mockup als interaktive App mit echten Zahlen sehen.

Getestet per Playwright (Chromium, 1600 × 1000) gegen http://localhost:8765, etwa 55 Browser-Schritte. Belege liegen unter `review/konzerncontroller/` (Screenshots, Skripte `s01.mjs` bis `s07.mjs`, Exporte unter `export/` und `export2/`, echtes Modell unter `tmdl-in/`).

## 2 · Aufgaben und Verlauf

| # | Aufgabe | Ergebnis | Beleg | Anmerkung |
|---|---|---|---|---|
| 1 | GuV-Demo-Modell laden, Vokabular prüfen, Vorlage „Monatsreport GuV" setzen | teilweise | `01-guv-modell-felder.png`, `02-monatsreport-guv-vorlage.png` | Modell spricht meine Sprache: AC, PY, PL, FC, BU, Umsatzerlöse bis Jahresüberschuss, Sign, RowType. Die GuV-Skizzen zeigen aber Nord, Süd, Ost, West statt GuV-Positionen, obwohl `Account` gebunden ist. Für einen Controller sieht das nach falscher Bindung aus. |
| 2 | Vorstandsseite aus Vorlage „Management-Übersicht" mit dem GuV-Modell | teilweise | `01-t2-vorlage-mgmt.png` | Vier KPI-Kacheln und die Δ-Kachel kommen mit roten Punkten (Pflichtrolle leer), weil die Vorlage am Controlling-Demo hängt. Die KPI-Kachel zeigt trotzdem „328,2 M · ΔPL −5 %", obwohl keine Kennzahl gebunden ist. |
| 3 | Kennzahlen per Ziehen umbinden: Umsatzerlöse auf KPI, Materialaufwand auf „Kosten", `Area` als Struktur nach Bereich, Top 5 nach Δ | gelungen | `02-t4-drag-umsatzerloese.png`, `03-t4-struktur-bereich.png` | Das Rollenmenü („zuordnen als Kennzahl / Ziel, ersetzt PL") ist genau richtig. Sortierung nach Δ und Top N sind in zwei Klicks gesetzt. |
| 4 | Szenario AC vs BU: Szenario umstellen, Δ-Basis BU, Polarität Kosten, kumuliert YTD, Kernaussage | gelungen | `03-t3-kosten-analyse-gesetzt.png`, `04-t3-szenario-ac-bu.png`, `01-t3-bu-gebunden.png` | Nach dem Umstellen kommt sofort „Szenario AC/BU, gebunden ist aber PL" mit dem Knopf „BU binden". Das ist die beste Stelle im Tool. Die Δ-Zeile der Kostenkachel wird mit „kleiner = besser" korrekt rot. Grenzen: kein AC/BU/PY, keine Forecast-Versionen, kein MTD, kein R12 (siehe 3). |
| 5 | GuV-Kachel anlegen (Rand-+, Katalog „GuV-Statement") und mit Account, AC, BU, PY, FC, RowType binden | teilweise | `04-t5-katalog-guv.png`, `05-t5-guv-kachel.png` | Die P&L-Skizze ist sofort lesbar (AC, PY, ΔPY, PL, ΔPL, ΔPL %). Aber die Warnung „Szenario AC/PL passt nicht zur Referenz BU" bleibt, weil es kein Szenario AC/BU/PY gibt. Im Export landet BU im Bucket `py` und PY im Bucket `pl` (siehe 6, F1). |
| 6 | Abweichungserläuterung als Text-Kachel, Priorität Must, offene Frage im Kachelfenster | gelungen | `03-t6-kommentar-auf-canvas.png`, `02-t6-kachelfenster-kommentar.png` | Der Text steht auf der Kachel (B14 ist behoben), Must und „?" als Badge, die offene Frage landet in der Doku unter „Offene Punkte". |
| 7 | Steckbrief Materialaufwand: Alias, Owner, Quelle, Ziel, Einheit, bestätigt | teilweise | `07-t7-steckbrief-materialaufwand.png` | Alles wird übernommen und erscheint in Doku und Brief. Es fehlen Polarität, Vorzeichenlogik, Schwellen und Währung am Steckbrief. Meine Anmerkung wird in der Doku als offener Punkt gelistet, obwohl „bestätigt" angehakt ist. |
| 8 | Berichtskopf: Zielgruppe, Ziel, Entscheidung, Version, Datenstand; Seite: Fragestellung | teilweise | `08-t8-bericht-reiter.png`, `export2/WORKSHOP-DOKU.md` | Alles landet im Protokoll. Die Fußleiste zeigt aber weiter „Stand: 18.09.2026 · Quelle: DWH", mein Datenstand „Abschluss M09/2026" steht nur im Reiter. Zwei Wahrheiten im selben Protokoll. Ein Freigabe-Status (Entwurf, freigegeben, versendet) fehlt. |
| 9 | Präsentieren vor dem Team | gelungen | `04-t9-praesentieren.png` | Seite ist am Beamer lesbar, Kommentar steht drauf. Die Badges M und ? sind klein, das steht schon im Review vom 25.09. |
| 10 | Echtes GuV-Modell (16 TMDL-Dateien) importieren, meine Measures wiederfinden | gelungen | `01-t10-tmdl-import.png`, `02-t10-tmdl-felder.png`, `03-t10-suche-ytg.png` | 1,5 s, 16 Tabellen, 49 Measures, zehn gebundene Felder korrekt rot als „fehlt im Modell". Die Suche findet `GuV YTG` sofort. Die Tabellen sind unsortiert (fact-klima vor fact-guv), `AC`, `PY`, `PL` gibt es dreimal (Sales Demo, fact-guv, fehlend) ohne Tabellenname am Chip, Anzeigeordner wie „03 Abweichungen" werden nicht genutzt. |
| 11 | Steckbriefe mit DAX lesen: `GuV YTG`, `PY YTD`, `GuV Δ PL %`, `SignConvention` | gelungen | `04-t11-steckbrief-ytg.png`, `05-t11-steckbrief-py-ytd.png`, `06-t11-steckbrief-dpl.png` | Formel, Ordner, Beschreibung und Format in Klartext mit Beispiel: so will ich Definitionen abnehmen. `[GuV FC FY] - [GuV AC YTD]` verstehe ich. `TOTALYTD([PY],Calender[Date],Calender[Month]<8)` verstehe ich nicht, und das Tool sagt mir nicht, dass hier ein Monat fest verdrahtet ist. Format „+0.0 %;-0.0 %" wird als „Einheit „+"" beschrieben (F2). |
| 12 | Vorlage „Monatsreport GuV" auf dem echten Modell | gescheitert | `07-t12-vorlage-echtes-modell.png` | Alle drei Kacheln rot, nichts gebunden, obwohl `GuV AC`, `GuV PL` und `dim-konten.Name` im Modell liegen. Die Vorlage kennt nur Demo-Namen. |
| 13 | Export: Spec validieren, Workshop-Doku als Protokoll prüfen | gelungen | `09-t9-export-dialog.png`, `05-t9-export-doku.png`, `export/WORKSHOP-DOKU.md` | `mockup_to_pbir.py --validate`: „Spec in Ordnung". Das Protokoll hat Berichtskopf, Kacheltabelle mit Prio und Status, Steckbrief, offene Punkte, nächste Schritte. Es fehlen Entscheidungen zu Szenario und Zeitlogik als eigener Abschnitt, Verantwortliche je Kachel und das Datum der Entscheidung. |

## 3 · Was mir fehlt (Top 5, nach Wichtigkeit)

**1. Szenarien und Versionen als Objekt, nicht als sieben feste Strings.**
Was: Ein Szenario-Modell je Bericht mit Basis (AC), beliebig vielen Referenzen (PY, BU, PL, FC) und Versionen (FC1 bis FC3, PL1/PL2), plus je Kachel die Auswahl daraus. Heute gibt es `AC/PL`, `AC/PY`, `AC/PL/FC`, `AC/PL/PY`, `AC/BU`, `PL/FC`, `AC`. Mein Standardfall „AC vs BU vs PY" existiert nicht, FC-Versionen gar nicht, und im Design-Reiter stehen nur vier der sieben Optionen.
Warum: Meine Vorstandsseite ist immer Ist gegen Budget und Vorjahr, dazu der aktuelle Forecast. Das echte Modell hat FC, FC2, FC3, PL, PL2 (`Sales Demo.tmdl`). Wenn ich das nicht festlegen kann, steht in der Doku „AC/PL" und der Agent baut Plan statt Budget.
Wie: Reiter „Bericht" bekommt eine Szenario-Tabelle (Kürzel, Bedeutung, Measure im Modell, Version, Gültig ab). Je Kachel wählt man Referenzen per Häkchen aus dieser Tabelle. Export `report.scenarios[]` und `visuals[].scenario {base, refs[], fcVersion}`. Die Skizzen können das schon (AC/PL/PY-Notation vorhanden).
Aufwand: mittel. Bezug: beiden (für Rayfin zwingend, weil die App Szenarien als Zeilen aus `dim-szenario` lädt).

**2. Zeitlogik je Kennzahl: MTD, YTD, rollierend 12, Geschäftsjahr, „AC bis / FC ab".**
Was: Heute gibt es Zeitgranularität (Tag bis Jahr) und ein Häkchen „kumuliert (YTD)". Es fehlen MTD, R12, FY, Vorperiode, und der Stichtag „letzter Ist-Monat".
Warum: Jede meiner Vorstandskacheln hat eine Periodenlogik, oft zwei (Monat und YTD nebeneinander). Das Modell hat sie schon (`GuV AC YTD`, `AC R12`, `GuV YTG`, `GuV Letzter Ist-Monat`), das Tool kann sie nicht benennen.
Wie: Statt Häkchen ein Feld „Periode: Monat · YTD · R12 · FY · YTG" plus „Stichtag: letzter Ist-Monat / fester Monat", und beim TMDL-Import die vorhandenen YTD/R12-Measures erkennen und vorschlagen („für AC gibt es GuV AC YTD, binden?").
Aufwand: mittel. Bezug: beiden.

**3. Kennzahl-Steckbrief als Vertrag: Polarität, Vorzeichen, Schwellen, Währung, Verantwortlicher.**
Was: Polarität steht heute an der Kachel, nicht an der Kennzahl. Vorzeichenlogik (Aufwand positiv gespeichert, Δ gedreht, wie in `dim-konten.SignConvention`) gibt es nirgends als Feld. Ampelschwellen (gelb ab 3 %, rot ab 5 %) gibt es nicht. Währung und Umrechnungskurs gibt es nicht, nur „Einheit" als Freitext.
Warum: Das sind genau die Punkte, über die mein Team und das BI-Team drei Abstimmungsschleifen drehen. Wenn ich im Workshop „Materialaufwand: kleiner = besser, Schwelle 5 %, Owner Einkaufscontrolling" nicht festhalten kann, steht es später in E-Mails.
Wie: Steckbrief um Polarität, Vorzeichen (Ertrag/Aufwand, wie gespeichert, wie gezeigt), Schwellen (gelb/rot, absolut oder relativ), Währung und Kommentar-Verantwortlichen erweitern. Kacheln erben von der Kennzahl und übersteuern nur bei Bedarf. Export `fields[].polarity/sign/thresholds/currency`, in der Doku als Tabelle „Kennzahl-Vertrag".
Aufwand: klein bis mittel. Bezug: beiden (die App rechnet KPIs und Ampeln im Browser, braucht diese Definitionen als Daten).

**4. Vorlagen, die das geladene Modell kennen.**
Was: Alle Vorlagen binden Felder des Controlling-Demos. Mit dem GuV-Demo oder einem echten Modell bleiben die Pflichtrollen leer, die KPI-Skizze zeigt trotzdem eine Zahl.
Warum: Der erste Eindruck im Workshop ist eine Seite voller roter Punkte, und ich binde sieben Kacheln von Hand, bevor wir über Inhalte reden.
Wie: Vorlagen beschreiben Rollen semantisch („Basis-Measure", „Referenz Budget", „Konto-Hierarchie", „Monat") und das Tool schlägt beim Anwenden Felder aus dem geladenen Modell vor, mit den Mustern, die es für Polarität und Referenz schon hat. Rest bleibt rot. Leere KPI-Kachel zeigt „?" statt einer Zahl.
Aufwand: mittel. Bezug: beiden.

**5. Kommentare als Prozess, nicht als Textfeld.**
Was: Eine Kachel „Kommentar" kann Text tragen. Es fehlt: wer kommentiert (Bereichscontroller, Konzern), bis wann (AT 5), zu welcher Kennzahl und Periode, und ein Freigabe-Status des Berichts (Entwurf, freigegeben, versendet).
Warum: Abweichungserläuterungen sind der Teil meines Reports, den der Vorstand wirklich liest. Im Power-BI-Bericht landet das später als Writeback oder als Kommentartabelle, in der App als Eingabemaske. Beides braucht heute die Festlegung.
Wie: Kacheltyp „Kommentar" mit Rollen Kennzahl, Periode, Verantwortlicher, Frist und Quelle (Tabelle oder Writeback). Berichtskopf mit Freigabe-Status, Datenstand aus einem Feld in Fußleiste und Doku.
Aufwand: mittel. Bezug: beiden, für Rayfin besonders.

## 4 · Wo das Erlebnis besser sein kann

- **Datenstand doppelt gepflegt.** Reiter „Bericht" hat „Datenstand / Aktualisierung", die Fußleiste zeigt den festen Text „Stand: 18.09.2026 · Quelle: DWH · Kontakt: Controlling". Beides steht nebeneinander im Protokoll (`export2/WORKSHOP-DOKU.md`, Zeile „Datenstand" und Zeile „Fußleiste"). Vorschlag: Fußleiste aus Platzhaltern `{Datenstand}`, `{Quelle}`, `{Kontakt}` speisen.
- **GuV-Skizzen mit Regionen.** Die Vorlage „Monatsreport GuV" zeigt Nord, Süd, Ost, West im GuV-Wasserfall und in den GuV-Positionen (`02-monatsreport-guv-vorlage.png`). B9 sagt, das ist gewollt. Für eine GuV ist es trotzdem falsch: Ein Controller erwartet Umsatzerlöse, Materialaufwand, Rohertrag. Vorschlag: Wenn die Kategorie `Account` oder die Tabelle `*Konten*/*Account*` heißt, Standardwerte aus dem GuV-Demo nehmen.
- **Modellpanel nach TMDL-Import.** Tabellen in Dateireihenfolge, Measures ohne Anzeigeordner, drei Chips „AC" ohne Tabellenname (`02-t10-tmdl-felder.png`). Vorschlag: Tabellen alphabetisch mit Fakten zuerst, Measures nach `displayFolder` gruppiert, bei gleichen Namen den Tabellennamen klein am Chip zeigen, Option „nur Measures".
- **Formeln in Fachsprache.** Der Steckbrief zeigt DAX, aber nicht, was er tut. `Calender[Month]<8` erkenne ich nicht als fest verdrahteten Juli. Vorschlag: Eine Zeile „in Worten" (kann der Agent beim Export erzeugen, oder einfache Muster im Tool: TOTALYTD → „Jahr bis Datum", DATEADD −1 YEAR → „Vorjahr", harte Konstante → Hinweis „fester Wert in der Formel").
- **Bestätigte Definition wird offener Punkt.** Meine Anmerkung am bestätigten Steckbrief („Rechnung in Excel heute inkl. Bestandsveränderung") steht in „Offene Punkte" (`export/WORKSHOP-DOKU.md`). Vorschlag: Bei „bestätigt" die Anmerkung unter „Entscheidungen" führen, nicht unter „Offen".
- **Titel folgt dem Szenario nicht.** Nach dem Wechsel auf AC/BU heißt die Kachel weiter „Umsatz AC/FC vs PL je Monat" (`04-t3-szenario-ac-bu.png`). Vorschlag: Vorlagentitel als Muster „{Kennzahl} {Szenario} je Monat" und beim Wechsel nachziehen, solange der Titel unverändert ist.
- **Protokollstruktur.** Die Doku listet Kacheln, Steckbrief, offene Punkte. Was ich als Auftraggeber zusätzlich brauche: einen Abschnitt „Festlegungen" (Szenarien, Perioden, Einheit, Währung, Vorzeichen), je Kachel „verantwortlich" und das Datum der Entscheidung. Vorschlag: Status „abgestimmt/abgenommen" mit Datum stempeln und in die Tabelle schreiben.
- **Vokabular.** „Pflichtrolle", „Engine", „Bucket", „Spec" sind Entwicklerwörter im Panel und im Export-Dialog. Für mich reicht „Feld fehlt", „Umsetzung: ChartKitchen / Standard-Visual". Der Hinweis zu leeren `pbir-visuals`-Dateien ist für meine Rolle Rauschen.

## 5 · Zusammenführung mit Fabric Apps / Rayfin

Ich habe die fünf Apps unter `/home/user/Fabric-Apps-Demo/apps/` und die Learnings in `memory/` quergelesen. Die Apps laden Daten auf feinem Korn und rechnen KPIs, Perioden und Vergleiche im Browser (`03-daten.md`). Damit wird die Spec nicht nur Layoutvertrag, sondern auch Fachvertrag. Aus meiner Rolle heraus:

**Was die Spec braucht, damit daraus eine App wird**
- **Kennzahl-Katalog als eigene Ebene.** Heute hängt Polarität, Einheit und Δ-Basis an der Kachel. Eine App braucht je Kennzahl: Definition (DAX oder Verweis auf das Measure), Polarität, Vorzeichen, Einheit, Währung, Format, Schwellen, Owner. Die `fields[]` sind der richtige Ort, `expression` und `formatDescription` sind schon drin. Fehlt: alles, was die KPI-Logik in `use-pnl-data.ts` oder `KpiStrip.tsx` heute im Code hat.
- **Szenario- und Periodenmodell** (siehe 3, Punkt 1 und 2). Die Apps kennen PL1/PL2, FC1 bis FC3, VP statt PY, „AC bis / FC ab". Die Spec muss das benennen können, sonst rät der Agent.
- **Datenvertrag.** `05-agenten-workflow.md` sagt „Vertrag zuerst": Welche Tabelle, welches Korn, welche Dimensionen, welche Zeilenzahl, Kontrollwerte. Das Kitchen weiß nach dem TMDL-Import Tabellen, Felder und Beziehungen und könnte einen Entwurf dieses Vertrags ausgeben: je Kachel die benötigte Abfrage (Dimensionen × Szenarien × Perioden) und Kontrollwerte, die ich im Workshop nenne („Umsatz YTD M09: 612,4 Mio.").
- **Interaktion abstrakt.** `interaction {drillDown, crossFilter, drillThrough}` und `links[]` sind Power-BI-Begriffe. Die Apps haben Filter-Chips, Zoom zu Small Multiples, Klick filtert quer, Zustand im URL-Hash (`04-design-ibcs.md`). Besser: „Was passiert bei Klick auf ein Element", „Welche Filter gelten seitenweit", „Welche Ansicht ist teilbar", und der Übersetzer entscheidet je Ziel.
- **Layout zweistufig.** Pixelrechtecke für 1920 × 1080 sind richtig für PBIR. Die App braucht das Raster (Spuren, Spannen, Reihenfolge), das im `layoutTree` mit `grid/cells` schon steckt. Beides exportieren, die App nimmt das Raster und bricht bei schmalen Fenstern um.
- **Engine-Vokabular abstrahieren.** `ck`, `native`, `deneb`, `custom` sind Umsetzungen. Für die App zählt der Visualtyp aus dem Katalog (`varint`, `pnl`, `kpi`, `bars`) und eine Zuordnung zu Komponenten (`VarIntChart`, `PnlTable`, `KpiStrip`, `StructureBridge`). Der Katalog ist dafür schon gut: eine Spalte „App-Komponente" neben `native.map` reicht.
- **Kommentare und Writeback.** Die App kann Eingaben entgegennehmen, Power BI nur über Umwege. Die Spec muss sagen, welche Kacheln Eingaben sind (Kommentar, Simulation wie in der PnL-App), mit Rollen und Rechten.

**Was heute Power-BI-spezifisch ist**
`pbir-visuals.*.json`, `customVisual.buckets`, `native.map`, Slicer-Typen (`advancedSlicerVisual`, Relative), `filter.mode burger`, die Chrome-Zonen in Pixeln, `A11Y_*`- und `LAYOUT_NOT_PIXEL_PERFECT`-Issues. Das darf bleiben, gehört aber in einen Zweig `targets.powerbi`, neben `targets.app`.

**Was auf keinen Fall verloren gehen darf**
Stabile IDs und Spec-Hash (Delta-Läufe), der Kennzahl-Steckbrief mit DAX und Klartextformat, Priorität, Status und offene Fragen je Kachel, der Analyse-Block (Polarität, Δ-Basis, Sortierung, Top N), die IBCS-Skizzen als gemeinsame Sprache, der AGENT-BRIEF als lesbare Fassung und die Workshop-Doku als Protokoll. Und der TMDL-Import: Er ist der Grund, warum die Spec echte Namen trägt.

**Was ich heute schon festlegen können müsste, damit ich das Mockup später als App mit echten Zahlen sehe**
Szenarien mit Versionen und ihr Measure im Modell. Periodenlogik je Kachel und Stichtag. Kennzahl-Vertrag mit Polarität, Vorzeichen, Einheit, Währung, Schwellen und Owner. Kontrollwerte je Kennzahl für den Abnahmetest. Kommentar-Verantwortliche und Fristen. Freigabe-Status und Datenstand als Felder, nicht als Fußleistentext. Filter mit Standardwerten (Jahr, Monat, Konzern/Bereich). Welche Kacheln Eingaben sind. Nichts davon ist Technik, alles davon ist Workshop-Inhalt.

## 6 · Neue Fehler (nicht im Review vom 25.09.)

| ID | Beschreibung | Schwere | Repro | Beleg |
|---|---|---|---|---|
| F1 | GuV-Kachel (`pnl`): Referenz-Measures landen in den falschen Buckets des Custom Visuals. BU steht im Bucket `py`, PY im Bucket `pl`. Die Namensregel aus `catalog.js:130` (`pl: /(pl\|bu\|budget\|plan\|target)/i`) greift nicht, es fällt auf „erste freie Rolle" zurück (`export.js:189`). Der gebaute Report zeigt dann Budget als Vorjahr. | hoch | GuV-Demo laden, Kachel „GuV-Statement" anlegen, Referenz BU und dann PY binden, Export, `visuals[].customVisual.buckets` prüfen | `export/mockup-spec.json` (Visual `mk_b04ruy8`), `05-t5-guv-kachel.png` |
| F2 | Formatbeschreibung im Steckbrief liest das Vorzeichen als Einheit: `+0.0 %;-0.0 %;0.0 %` wird zu „Prozent, 1 Nachkommastelle, Einheit „+", eigenes Format für negative Werte". Ursache `fmtinfo.js:152-157` (Prefix vor dem ersten `0` wird zur Einheit). | niedrig | Echtes Modell laden, Steckbrief `GuV Δ PL %` | `06-t11-steckbrief-dpl.png`, `s06.log` |
| F3 | KPI-Kachel ohne gebundene Kennzahl zeigt einen Wert („328,2 M · ΔPL −5 %") und eine Sparkline, nur der rote Punkt verrät die Lücke. Im Präsentiermodus und im PNG wirkt die Kachel fertig. | mittel | GuV-Demo laden, Vorlage „Management-Übersicht" | `01-t2-vorlage-mgmt.png` |
| F4 | Szenario AC/BU/PY lässt sich nicht wählen, obwohl die Rolle „Referenz" bis zu drei Measures nimmt. Bindet man BU und PY, bleibt dauerhaft `SCENARIO_REF_MISMATCH`, die Doku trägt „AC/PL". | mittel | GuV-Kachel mit Referenz BU und PY, Export-Dialog | `export/WORKSHOP-DOKU.md` („Offene Punkte"), `05-t5-guv-kachel.png` |

## 7 · Was gut ist

Der TMDL-Import ist das Herz: 16 Dateien in 1,5 Sekunden, Formel, Ordner, Beschreibung und Format in Klartext im Steckbrief, fehlende Felder rot. Damit kann ich Definitionen abnehmen, das konnte ich bisher nur in Excel-Listen. Der Hinweis „Szenario AC/BU, gebunden ist aber PL" mit „BU binden" ist genau die Art Mitdenken, die ich von einem Workshop-Werkzeug will. Das Rollenmenü beim Ziehen erklärt, was ersetzt wird. Die IBCS-Skizzen sind richtig (Ist voll, Plan umrandet, Forecast schraffiert, Δ mit eigener Nulllinie), und die P&L-Skizze liest sich wie meine Vorstandsunterlage. Kommentar mit Must und offener Frage steht auf der Kachel und im Protokoll. Der Validator meldet „Spec in Ordnung", ohne dass ich etwas wusste, was ich nicht wissen muss.

## 8 · Noten

Bedienbarkeit: 7/10 · Nutzen für meine Rolle: 7/10 · Reife für Kunden: 6/10

Ich würde es morgen in einem internen Workshop einsetzen, wenn der BI-Kollege die Vorlagen vorher auf unser Modell bindet und das Szenario AC vs BU vs PY sowie die Perioden als Text in Notizen stehen dürfen; für einen Kunden-Workshop erst, wenn Szenarien, Perioden und der Kennzahl-Vertrag als Felder da sind und F1 behoben ist.
