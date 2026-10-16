# UX-Audit · Nutzerführung „ChartKitchen byDatenWG" (1.44.0.0)

**Scope:** Format-Panel-Architektur, Benennung (de-DE), Erst-Erlebnis, In-Chart-Bedienung.
**Quellen:** `src/settings.ts` (1 272 Z.), `src/visual.ts` (getFormattingModel Z. 742–801, renderDemo Z. 1365 ff., Chips Z. 2516–2567 / 9638–9748), `capabilities.json`, `stringResources/de-DE/resources.resjson`, `AGENT-GUIDE.md`.
**Belege:** `audit-ux-*.png` in diesem Ordner (per `test/test.html`-Harness gerendert).

---

## Die 5 wirkungsvollsten Quick-Wins (zuerst umsetzen)

| # | Maßnahme | Aufwand | Abwärtskompatibel? |
|---|---|---|---|
| **UX-1** | **Chart-Karte an Position 1**, IBCS-Titel an Position 2 (nur `cards`-Array in `VisualFormattingSettingsModel` umsortieren) | S | ✅ ja — reine Anzeige |
| **UX-2** | **„Ausrichtung" → „Chart-Typ"** umbenennen (displayName/resjson; Property `chart.orientation` bleibt!) + deutsche Enum-Labels („Säulen (Zeit)" statt „Columns (Zeit)") | S | ✅ ja |
| **UX-3** | **Bug: Struktur-Modus-Chip zeigt den falschen Tooltip** (Compare-Text) und **Modus-Chips sind nicht klickbar** → Tooltip fixen, Klick = Modus beenden | S | ✅ ja |
| **UX-4** | **Landing-Galerie: nach Modus-Wahl „Nächster Schritt"-Zeile** („Jetzt *Kategorie* + *Ist (AC)* in die Feldliste ziehen") + Hinweistext an deutsche Rollennamen angleichen | S–M | ✅ ja |
| **UX-5** | **Mega-Gruppen „Layout"/„Analyse" aufgabenorientiert neu schneiden**, u. a. neue Gruppe „Interaktion im Bericht" (Slices nur INNERHALB der Chart-Karte verschieben) | M | ✅ ja — Gruppen sind reine Anzeige |

---

## 1 · Format-Panel-Architektur

### 1.1 Ist-Zustand

Kartenreihenfolge heute (`settings.ts` Z. 1269–1270):

```
1. IBCS-Titel   2. Chart   3. IBCS-Farben   4. Datenbeschriftungen
5. Kommentare   6. Skala & Referenzlinie   7. Kategorienachse   8. Leer-Zustand
```

Die Chart-Karte (CompositeCard) trägt 6 Gruppen mit zusammen **~50 Slices**:
Layout (11) · Analyse (15) · Small Multiples (4) · Brücke (4) · Tabelle (16) · KPI-Karten (9).

### 1.2 Kernbefund: Die wichtigste Entscheidung steht an Stelle 2.3

Der Chart-Modus (`chart.orientation`, 12 Modi von Säulen bis GuV-Statement) ist **der** Hebel, der das gesamte restliche Panel umkonfiguriert — er steckt aber als erster Slice der Gruppe „Layout" **in der zweiten Karte**. Ein Controller, der das Panel öffnet, sieht zuerst „IBCS-Titel" mit 7 Textfeldern, also Kosmetik vor Substanz. Der Impuls des Besitzers („Chart-Auswahl als erstes Menü, dann Überschrift") ist exakt richtig und trivial umsetzbar: Reihenfolge im `cards`-Array ist reine Anzeige, kein persistierter Name ändert sich.

Verschärfend: Das Dropdown heißt **„Ausrichtung"** (en: „Orientation"). Das ist ein historischer Name (Säulen vs. Balken), beschreibt aber längst den **Chart-Typ**. Kein Endanwender sucht die Tabelle, die GuV oder KPI-Karten unter „Ausrichtung". → Nur `displayName`/`Chart_Orientation`-Resource ändern; der Property-Name `orientation` bleibt unangetastet (Reports im Feld!).

### 1.3 Vergrabene / falsch gruppierte / konkurrierende Einstellungen

| Einstellung | Heute | Problem |
|---|---|---|
| `smartStart` | Layout, direkt unter Chart-Typ | Editor-Assistenz zwischen fachlichen Einstellungen; gehört ans Gruppen-Ende oder in eine „Assistenz"-Gruppe |
| `compareClick` | Analyse | ist eine **Interaktion**, keine Analyse — steht 10 Slices von `chartButtons` (Brücke) und `cumulativeButton` (Analyse) entfernt, obwohl alle drei dasselbe tun: End-User-Bedienung im Bericht freischalten |
| `structureEdit` (Tabelle) · `editComments` (Karte „Kommentare") | 2 andere Orte | dritter und vierter Klick-Modus, jeweils woanders — wer einen Modus ausschalten will, muss wissen, in welcher der drei Karten er wohnt (siehe UX-3/UX-11) |
| `pinStyle`, `deltaIcons` | Analyse | reine **Darstellung** (Form/Icons), keine Analyse; zudem immer sichtbar, auch in Modi ohne Pins/Tabelle |
| `topN` | Analyse, Name „Top N (Balken)" | wirkt laut eigener Beschreibung auch auf Kategorie-Brücke, Tabelle, Dumbbell, KPI-Karten — der Klammerzusatz „(Balken)" ist falsch und versteckt die Funktion |
| `exportExpandAll` | Gruppe Tabelle | Export-Verhalten, kein Tabellen-Layout; wird nur sichtbar, wenn gerade `table` aktiv ist — wer im GuV-Modus den Export sucht, findet nichts (bridgeGroup ist bei `pnl` sichtbar, tableGroup nicht) |
| `hideBlankCat`, `acFcSplit` | Layout | Daten-Hygiene/-Semantik zwischen Anzeige-Schaltern; `acFcSplit` trägt die längste Beschreibung des Panels (Doppelzähl-Warnung) und ist **immer sichtbar, auch ohne FC-Measure** (`paneHasFc` existiert in visual.ts, wird hier aber nicht genutzt) |
| `waterfallStyle` | Brücke | konkurriert konzeptionell mit den drei dedizierten Brücken-Modi im Chart-Typ-Dropdown — zwei Wege zum selben Begriff „Brücke", ohne Erklärung, wann welcher |
| Σ-Steuerung | 3 Orte | `showTotal` (Layout) · `multiplesTotal` (Multiples) · `totalRowPosition` (Tabelle) — drei „Σ"-Begriffe, drei Gruppen, drei Benennungs-Muster |
| Sortierung | 3 Orte + Chips | `sortByImpact` (Brücke) · `cardSort` (KPI-Karten) · Tabellen-Header-Sort (nur persistiert, kein Pane-Slice) — in Ordnung je Modus, aber nirgends konsistent benannt („Nach Wirkung" vs. „Nach Abweichung sortieren") |
| Schriftgröße | 4 Regler | `fontPreset` × `fontScale` × `fontSize` (Datenbeschriftungen) + `categoryAxis.fontSize` (eigene Ein-Slice-Karte!) — für Endanwender undurchschaubar, welcher Regler was multipliziert. Preset + freier %-Regler reichen im Normalfall; `fontSize`/Kategorienachse als „Feinjustierung" ans Ende, Karte „Kategorienachse" direkt hinter „Datenbeschriftungen" einsortieren |

### 1.4 Kontextsensitives Ein-/Ausblenden — gut, mit Lücken

`getFormattingModel()` (Z. 742–801) ist für ein Custom Visual überdurchschnittlich: tableGroup/cardsGroup/bridgeGroup/multiplesGroup, Skala-Karte, topN, movingAverage, cumulative*, materiality*, compareClick u. v. m. werden je Modus/Datenlage ein- und ausgeblendet. Inkonsequent sind:

- **`acFcSplit`**: sichtbar ohne FC-Measure (s. o.) — sollte `this.paneHasFc` prüfen.
- **`exceptionOnly`**: erscheint erst, wenn eine Wesentlichkeits-Schwelle > 0 gesetzt ist. Logisch korrekt, aber **unentdeckbar** — niemand setzt eine Schwelle, um ein Feature zu finden, das er nicht sieht. Besser: Slice sichtbar, aber `disabled` + Beschreibung „setzt eine Wesentlichkeits-Schwelle voraus" (das Formatting-Model-Util unterstützt `disabled`), oder Reihenfolge Materialität → direkt darunter exceptionOnly beibehalten und sichtbar lassen.
- **`pinStyle`, `deltaIcons`, `invert`, `invertList`, `highlight`**: nie gegated, auch in Modi ohne Wirkung.
- **Karte „Datenbeschriftungen"**: nie gegated — `sumSafeRounding` z. B. ist in KPI-Karten wirkungslos.
- **`comparisonMode`** verschwindet komplett, wenn nur EINE Basis gebunden ist. Nachvollziehbar, aber der Anwender sieht dann nirgends, *gegen was* verglichen wird („Auto: PL wenn vorhanden, sonst PY" steht in einer unsichtbaren Beschreibung).

### 1.5 Soll-Kartenreihenfolge (alles anzeige-seitig, keine Property-Änderung)

| Pos. | Karte | Begründung |
|---|---|---|
| 1 | **Chart** (umbenannt, erster Slice „Chart-Typ") | Die Modus-Wahl rekonfiguriert alles andere — Erstentscheidung gehört an Position 1 (Besitzer-Impuls bestätigt). |
| 2 | **IBCS-Titel** | Zweites, was ein Report-Autor tut: Titel/Botschaft — und IBCS-Verkaufsargument des Visuals. |
| 3 | **Datenbeschriftungen** | Dezimalstellen/Einheiten/Schrift-Preset sind die häufigsten Alltagseingriffe eines Controllers. |
| 4 | **Kategorienachse** | gehört thematisch direkt hinter die Beschriftungen (heute isoliert zwischen Skala und Leer-Zustand). |
| 5 | **IBCS-Farben** | Einmal-Einstellung pro Report (Theme/Preset), danach selten angefasst. |
| 6 | **Skala & Referenzlinie** | Experten-Feature (Skalen-Sync über Visuals) — wichtig, aber nicht täglich. |
| 7 | **Kommentare** | Spezialworkflow; Modus-Schalter zusätzlich über Interaktions-Gruppe auffindbar machen (UX-11). |
| 8 | **Leer-Zustand** | Randfall, korrekt am Ende. |

**Soll-Gruppen innerhalb der Chart-Karte** (Slices nur innerhalb derselben Karte verschieben — Karte wechseln wäre ein Objektwechsel und damit **breaking**):

1. **Chart-Typ** — orientation (als „Chart-Typ"), smartStart
2. **Vergleich & Abweichung** — comparisonMode, showAbsoluteVariance, showRelativeVariance, dualVariance, pyTriangle, invert, invertList, materialityAbs, materialityPct, exceptionOnly
3. **Daten & Zeit** — cumulative, cumulativeKind, fiscalStart, acFcSplit, topN, showTotal, hideBlankCat, movingAverage, highlight, groupEvery
4. **Interaktion im Bericht** *(neu)* — chartButtons, cumulativeButton, compareClick (+ perspektivisch structureEdit; der bleibt aus Kompatibilität in der Chart-Karte/Tabellen-Gruppe, kann aber zusätzlich hier gelistet werden, da gleiche Karte)
5. **Darstellung** *(neu)* — pinStyle, deltaIcons, driverNote, exportExpandAll
6. **Small Multiples** · 7. **Brücke** (nur noch waterfallStyle, sortByImpact) · 8. **Tabelle** · 9. **KPI-Karten** — wie heute, kontextsensitiv

---

## 2 · Benennung (de-DE)

Grundsätzlich stark: „Wesentlichkeit ab (absolut)", „Σ-treue Rundung", „Zeilen aus Summen ausnehmen" sind echtes Controller-Deutsch. Schwachstellen — **alle nur displayName/resjson, nie Property-Namen**:

| Heute (de-DE) | Vorschlag | Warum |
|---|---|---|
| „Ausrichtung" | **„Chart-Typ"** | s. o. — meistgesuchte Einstellung, irreführender Name |
| „Columns (Zeit)" / „Bars (Struktur)" / „Line (Zeit, viele Punkte)" | **„Säulen (Zeit)" / „Balken (Struktur)" / „Linie (lange Zeitreihe)"** | halb­übersetzte Anglizismen in einem sonst deutschen Panel; Power BI selbst sagt „Säulendiagramm" |
| „Dumbbell (Struktur)" | „Dumbbell · Vorher/Nachher (Struktur)" | Fachjargon; der Zusatz erklärt ihn, analog zu Slope |
| Karte „Chart" | „Chart & Analyse" (oder „Diagramm") | Grab-Bag-Name für 50 Einstellungen |
| „IBCS-Farben" | „Farben (IBCS)" | Nutzer suchen alphabetisch/semantisch „Farben", nicht „IBCS" |
| „Δ%-Pin-Form" + Beschreibung „Lollipop-Kopf" | „Form der Δ%-Marker" | „Pin"/„Lollipop" ist Entwickler-Sprech |
| „Top N (Balken)" | „Top N (Struktur-Modi)" | wirkt auf 5 Modi, nicht nur Balken |
| „FC Vormonat (Revision)" (Rolle + Enum) | „Forecast Vorzyklus (ΔFC)" o. ä. | „Revision" liest ein Konzern-Controller als Wirtschaftsprüfung |
| „Kumulierungs-Art" | „Kumulierung (YTD · QTD · R12)" | Werte direkt im Label sichtbar |
| „Leer-Zustand" | „Hinweis ohne Daten" | UI-Jargon → Nutzen |
| `Demo_Hint`: „füge **Category und Actual (AC)** hinzu" | „füge **Kategorie** und **Ist (AC)** hinzu" | Der Hinweis nennt die ENGLISCHEN Rollennamen, die Feldliste zeigt aber „Kategorie"/„Ist (AC)" — Erstnutzer suchen ein Feld, das es scheinbar nicht gibt |

Zusätzlich: In `settings.ts` sind die **Fallback-displayNames englisch, die Fallback-descriptions deutsch** (z. B. `comparisonMode`). Für Locales ohne resjson (fr-FR, it-IT …) ergibt das ein gemischtsprachiges Panel. Empfehlung: Fallbacks konsequent englisch, Deutsch nur via de-DE-resjson. (Nur Textpflege, keine Risiken.)

---

## 3 · Erst-Erlebnis (Landing-Galerie)

**Beleg:** `audit-ux-landing-galerie.png`

Die Galerie ist ein echtes Asset und klar über Marktniveau: 12 klickbare Vorschau-Kacheln mit Use-Case + benötigten Feldern, aktive Kachel markiert, Klick persistiert `chart.orientation`, Schrift-Preset-Pills mit Live-Vorschau, gestufte Layouts bis hinunter zur Hero-Kachel, Custom-Empty-State für die Leseansicht. Lücken:

1. **Kein „nächster Schritt" nach der Modus-Wahl.** Nach dem Klick auf z. B. „GuV-Statement" bleibt die Galerie unverändert stehen; die Feld-Info steht klein auf der Kachel. Erwartung eines Erstnutzers: eine prominente Zeile „✓ GuV-Statement gewählt — ziehe jetzt *Kategorie*, *Ist (AC)* und *Vorjahr (PY)* in die Feldliste" (idealerweise mit den lokalisierten Rollennamen aus den `Role_*`-Keys, nicht hart kodiert — behebt zugleich den `Demo_Hint`-Mismatch).
2. **Galerie ist nach Datenbindung unerreichbar.** Der Modus-Wechsel passiert danach nur noch über das vergrabene Pane-Dropdown (siehe UX-1/2). Ein kleiner „Modus wechseln"-Einstieg im Edit-Modus (Chip neben Smart-Start oder Kontextmenü) würde die Galerie als dauerhaften Chart-Picker etablieren — sie ist der beste Teil der Nutzerführung und wird nach 30 Sekunden weggesperrt.
3. **Smart-Start** (Chip oben links, nur Edit-Modus, Konstellation-genaues Dismiss, persistiert): vorbildlich. Aber nur 4 Regeln (rowType→Waterfall, colgroup→Tabelle, Nicht-Zeit→Balken, >24 Zeitpunkte→Linie). Naheliegende fehlende Regeln: Benchmark gebunden + wenige Kategorien → KPI-Karten; AC+PY gebunden, Modus Balken → Hinweis auf Kategorie-Brücke. (Erweiterung M, risikofrei — gleiche Chip-Mechanik.)

---

## 4 · In-Chart-Bedienung

**Belege:** `audit-ux-catbridge-buttons.png` (ΔPY|ΔPL · ⇅ · ▶), `audit-ux-cards-sort-chip.png` (↓ Worst), `audit-ux-ytd-button-kommentar.png`, `audit-ux-struktur-modus-chip.png`, `audit-ux-kommentar-modus-chip.png`, `audit-ux-pnl-toolbar.png`.

**Stärken:** Alle In-Chart-Schalter persistieren Properties (bookmark-fähig, überleben Export-Logik), Export rendert ohne Chrome (`allowInteractions`), Chips haben `role="button"`, `tabindex`, `aria-label`, Tastatur-Handler — sauber.

**Schwächen:**

1. **Bug — falscher Tooltip & toter Chip:** `drawModeChip` (visual.ts Z. 9654–9656) unterscheidet nur `✎` (Kommentar) vs. Rest → der **⚙ Struktur-Modus-Chip bekommt den Vergleichs-Tooltip** („zwei Elemente anklicken …"). Zudem ist der Modus-Chip das einzige nicht klickbare Pill-Element — Erwartung aus allen anderen Chips (⚠, YTD, Sortierung): Klick schaltet um. Hier führt der Klick ins Leere; zum Beenden muss der Nutzer wissen, dass Kommentar-Modus in Karte „Kommentare", Struktur-Modus in „Chart → Tabelle" und Vergleich in „Chart → Analyse" wohnt. → Tooltip-Branch um `⚙` ergänzen, Chip klickbar machen („Klick beendet den Modus", persistiert das jeweilige Property auf false). Das ist die größte Konsistenzlücke der In-Chart-Bedienung.
2. **Uneinheitliche Chip-Sprache:** oben links Vorschlag (💡), oben rechts Zustand+Schalter (⚠/YTD/⇅/ΔPY|ΔPL/▶) und reine Status-Pills (✎/⚙/⇄) im selben Look. Aktive Schalter füllen sich dunkel, der Status-Pill ebenfalls — optisch nicht unterscheidbar, was klickbar ist. Einheitliche Grammatik empfohlen: Schalter = Umrandung + Füllung bei aktiv, Status = dezente Füllung + „✕ beenden"-Affordance.
3. **Platz-Arithmetik von Hand:** Die rechte Chip-Reihe wird über manuell addierte Reserven positioniert (Z. 2547–2558, u. a. `toolbarReserve ≈ 170·k`). Jede neue Schaltfläche erhöht das Überlapp-Risiko (schmale Kacheln!); zudem schätzt `drawModeChip` die Textbreite per `text.length × 0.62` statt `textWidth()` wie alle anderen Chips. → kleiner „Chip-Row"-Layouter, der von rechts nach links stapelt.
4. **Inkonsistente Defaults:** Brücken-Toolbar (`chartButtons`) default **an**, YTD-Chip (`cumulativeButton`) default **aus**, Karten-Sortier-Chip erscheint nur ab ≥220 px Regionbreite und nur, wenn … (cardSort) — dieselbe Interaktionsklasse, drei Entdeckbarkeits-Niveaus. Mindestens im Pane in EINER Gruppe bündeln (UX-5), damit der Autor sie als Familie sieht.
5. **Klick = Crossfilter** ist der Normalfall und wird von drei Modi still umgewidmet — die Pills adressieren das grundsätzlich richtig („damit niemand rätselt, warum Crossfiltern aufhört"), siehe aber Punkt 1.

---

## 5 · Priorisierter Maßnahmenkatalog

Risikolegende: 🟢 = rein anzeigeseitig (Kartenläufe/Slice-Reihenfolge/displayName/resjson) — **abwärtskompatibel, persistierte Property-Namen unverändert**. 🔴 = würde `objects`/`properties` in capabilities.json umbenennen/verschieben — **bricht bestehende Reports, nicht tun**.

| ID | Problem | Vorschlag | Aufwand | Risiko |
|---|---|---|---|---|
| **UX-1** | Chart-Typ-Wahl in Karte 2 vergraben; Titel-Karte zuerst | `cards`-Array umsortieren: Chart → IBCS-Titel → Datenbeschriftungen → Kategorienachse → Farben → Skala → Kommentare → Leer-Zustand (Abschnitt 1.5) | S | 🟢 |
| **UX-2** | „Ausrichtung"/„Orientation" beschreibt nicht den Chart-Typ; Enum halb englisch | displayName + `Chart_Orientation`/`Enum_Orientation_*` in allen resjson anpassen („Chart-Typ", „Säulen (Zeit)" …). Property `orientation` + Enum-**Values** unverändert | S | 🟢 |
| **UX-3** | ⚙-Chip zeigt ⇄-Tooltip; Modus-Pills nicht klickbar | `drawModeChip`: Tooltip-Branch für `⚙` (`ChipTip_Structure` neu in resjson), Klick-Handler = Modus-Property auf false persistieren | S | 🟢 |
| **UX-4** | Galerie sagt nach Modus-Wahl nicht, was als Nächstes zu tun ist; `Demo_Hint` nennt englische Rollennamen | „Nächster Schritt"-Zeile mit lokalisierten `Role_*`-Namen je gewähltem Modus; `Demo_Hint` de-DE auf „Kategorie und Ist (AC)" | S–M | 🟢 |
| **UX-5** | Mega-Gruppen Layout (11)/Analyse (15) mischen Typ, Semantik, Darstellung und Interaktion | Gruppen neu schneiden (Abschnitt 1.5), inkl. neuer Gruppe „Interaktion im Bericht". Nur Slice-Zuordnung innerhalb der Chart-Karte — Gruppen sind nicht persistiert | M | 🟢 |
| **UX-6** | `topN` heißt „Top N (Balken)", wirkt auf 5 Modi | displayName „Top N (Struktur-Modi)", Beschreibung bleibt | S | 🟢 |
| **UX-7** | `acFcSplit` sichtbar ohne FC-Measure; längste Beschreibung des Panels an prominenter Stelle | in `getFormattingModel` mit `this.paneHasFc` gaten; Beschreibung auf 2 Sätze kürzen, Doppelzähl-Warnung an den Anfang | S | 🟢 |
| **UX-8** | `exceptionOnly` unentdeckbar (erscheint erst nach gesetzter Schwelle) | sichtbar lassen und `disabled` setzen solange Schwelle = 0 (Beschreibung nennt die Voraussetzung) | S | 🟢 |
| **UX-9** | 4 konkurrierende Schriftregler (Preset × Skala × Textgröße + Kategorienachse) | Reihenfolge: Preset → Skala %; `fontSize` ans Karten-Ende als „Feinjustierung Beschriftungstext"; Karte „Kategorienachse" hinter „Datenbeschriftungen" (UX-1-Reihenfolge). Langfristig `fontSize`-Slices nur noch anzeigen, wenn ≠ Default (sanfte Deprecation) | S | 🟢 |
| **UX-10** | Chip-Reihe oben rechts: manuelle Pixel-Reserven, Breiten-Schätzung im Modus-Pill, Überlapp-Risiko | gemeinsamer rechts-nach-links-Stacker für ⚠/YTD/⇅/Toolbar/Modus-Pill; `textWidth()` statt Länge×Faktor | M | 🟢 |
| **UX-11** | 3 Klick-Modi an 3 Pane-Orten (Kommentar/Struktur/Vergleich) | kurzfristig UX-3 (Chip beendet Modus); mittelfristig alle drei zusätzlich in Gruppe „Interaktion im Bericht" sichtbar machen — `editComments` bleibt im Objekt `commentsPanel` (Karte kann nicht wechseln ohne Property-Bruch), daher dort nur per Beschreibungstext querverweisen | M | 🟢 (Karte-Wechsel der Property wäre 🔴) |
| **UX-12** | Galerie nach Datenbindung unerreichbar; Modus-Wechsel nur übers Pane | „Modus wechseln"-Einstieg im Edit-Modus (Chip/Kontextmenü öffnet die Galerie als Overlay über den Daten) | L | 🟢 (nur neues UI; keine neuen Properties nötig, sonst additiv) |
| **UX-13** | Smart-Start deckt nur 4 Konstellationen ab | Regeln ergänzen (BM+wenige Kategorien → KPI-Karten; AC+PY in Balken → Kategorie-Brücke anbieten); gleiche Chip-/Dismiss-Mechanik | M | 🟢 (additiv; `smartStartDismissed`-Format bleibt) |
| **UX-14** | Fallback-Sprachmix in settings.ts (en-Namen + de-Beschreibungen) für Locales ohne resjson | Fallback-Beschreibungen auf Englisch drehen, Deutsch lebt in de-DE-resjson | M (reine Textpflege) | 🟢 |
| **UX-15** | `waterfallStyle` konkurriert unerklärt mit den Brücken-Modi des Chart-Typ-Dropdowns | displayName „Als Brücke zeichnen (statt Einzelbalken)" + 1 Satz Abgrenzung zu Waterfall-Modus in der Beschreibung | S | 🟢 |
| ⚠ Nicht-Maßnahme | — | **Keine** Umbenennung von `objects`/`properties` (z. B. `orientation` → `chartType`, `commentsPanel.editComments` → Chart-Karte): bricht jede im Feld gespeicherte Report-Definition und alle PBIR-/Agent-Workflows (AGENT-GUIDE referenziert die Namen) | — | 🔴 |

---

## 6 · Fazit

Das Visual ist funktional außergewöhnlich tief und die kontextsensitive Pane-Logik sowie die Landing-Galerie sind besser als bei den meisten kommerziellen IBCS-Visuals. Die Nutzerführungs-Schuld liegt fast vollständig in **Anordnung und Benennung**, nicht in der Architektur: Chart-Typ nach vorn (UX-1/2), die zwei Mega-Gruppen aufgabenorientiert schneiden (UX-5) und die Modus-Chips reparieren (UX-3) sind zusammen < 1 Entwicklertag und ändern **kein einziges persistiertes Property** — maximaler Konzern-Eindruck bei null Migrationsrisiko.

*Screenshots in diesem Ordner: `audit-ux-landing-galerie.png`, `audit-ux-catbridge-buttons.png`, `audit-ux-cards-sort-chip.png`, `audit-ux-ytd-button-kommentar.png`, `audit-ux-struktur-modus-chip.png`, `audit-ux-kommentar-modus-chip.png`, `audit-ux-pnl-toolbar.png`.*
