> Befunde aus Michaels Test am 02.10.2026 mit einem echten Projekt (Kopie der ChartKitchen-Demo, 23 Seiten, compatibilityLevel 1702, ChartKitchen 1.42 und KPI-Karte 2.2 schon im Bericht). Runner 0.2.0 und Kitchen 0.5.5 aus dem stabilen Stand (Commit 3d07710). Für die Korrekturrunde des Beta-Sprints.

# Befunde Demo-Projekt

## Ablauf
- Deploy 3: fehlgeschlagen, weil in meiner Snapshot-Kopie die Schemadatei des Konverters fehlte (kein Produktfehler).
- Deploy 4 (387 s): ChartKitchen 1.42 → 1.43 und KPI-Karte 2.2 → 2.3 aktualisiert, Desktop dafür geschlossen und nach 38 s wieder offen, neue Seite (Name anonymisiert) angelegt (4 KPI-Karten), 203 Elemente geschrieben, 23 Fehler, 23 Seiten aufgenommen (195 s), Vergleich 57 %.
- Deploy 5: 24 Elemente nachgezogen, 1 Fehler, 169 pbir-Aufrufe (72 s), Validate unverändert 2 Altfehler.

## Befunde

### B1 · `pbir batch` scheitert an Custom Visuals (Ursache gefunden)
Status `error`, Meldung `pbir batch move: {}` bzw. `pbir batch set: {}`. Nachgestellt auf einer Kopie: `pbir batch set` auf einem `ibcsKpiCard`-Visual liefert `status error, target_count 1, result {}`, derselbe Schritt auf einem Slicer liefert `ok`. Die 23 Fehler in Deploy 4 waren importierte ChartKitchen-Visuals, die 5 Fehler in Deploy 6 und 7 die KPI-Karten. pbir 0.9.32 kann Custom Visuals (unbekannter `visualType`) nicht formatieren oder verschieben, bei diesem Bericht zusätzlich mit `visualContainer` 2.10.0 nur über ein Rückfall-Schema. Position und Container-Stil solcher Visuals müssen wie beim Anlegen direkt in `visual.json` geschrieben werden (dokumentierte Ausnahme), nicht über `pbir batch`.
**Fix:** Im Runner für Visuals mit Custom-GUID (ChartKitchen, KPI-Karte, Gantt, GuV) `move`, `resize` und Container-`set` direkt in `visual.json` schreiben; `pbir batch` nur für native Visuals, Shapes und Slicer. Rohausgabe fehlgeschlagener Batches ins Log, echte pbir-Meldung im Status.

### B9 · Typwechsel eines eigenen Visuals wird nicht umgesetzt
Michael stellte die vier KPI-Kacheln im Kitchen von KPI-Karte auf nativ (`card`) um. Der Runner meldet nur „Visualtyp geändert, pbir kann den Typ nicht tauschen" und lässt die alten Karten stehen (Deploy 6 und 7: 0 Elemente, 5 Fehler, je über 200 pbir-Aufrufe durch Wiederholungen).
**Fix:** Ein vom Runner selbst angelegtes Visual darf bei Typwechsel ersetzt werden (entfernen und neu anlegen, wie bei `cards` → `ibcsKpiCard` schon umgesetzt); fremde Visuals bleiben To-do. Wiederholungen bei bekannten Dauerfehlern begrenzen.

### B2 · Stil-Abgleich und Seitenhintergrund auf allen 23 importierten Seiten
Plan: „24 Stil-Abgleiche gegen den Bericht, Seitenhintergrund auf 23 Seiten". Der Runner hat das Kitchen-Standarddesign (Seitenhintergrund, Kachelstil) auf einen fertig gestalteten Bericht geschrieben, obwohl der Nutzer nur eine Seite ergänzt hat. Das verletzt „das PBIP ist die Wahrheit" und verlängert jeden ersten Deploy massiv (alle Seiten gelten als geändert, alle werden aufgenommen).
**Fix:** Beim Layout-Import die Gestaltung des Berichts in `S.design` übernehmen (Seitenhintergrund aus `page.json`, Kachelstil aus den Visuals) oder, einfacher, importierte Seiten und Visuals nie umstylen, solange `design` seit der Baseline unverändert ist. Seitenhintergrund nur für neue Seiten oder nach bewusster Designänderung.

### B3 · KPI-Karte in Desktop winzig, ohne Verlaufslinie
Kitchen-Skizze: große Zahl, Δ, Verlaufslinie. Desktop (`ibcsKpiCard` 2.3, `fontPreset compact`, `titleSize 21.5`, `showSparkline false`): kleiner Kasten „UMSATZ 118M" in der Kachelmitte.
- Die Kacheln haben nur `indicator` gebunden, kein Zeitfeld. Die Kitchen-Skizze zeichnet trotzdem eine Verlaufslinie: Skizze unehrlich (wie bei den Referenzen in 0.5.5 behoben, hier für `kpi` nachziehen).
- Die Kartengröße passt nicht zur Kachel. `fontPreset`/`titleSize`/Skalierung gegen die echte Karte in Desktop abstimmen (bei 1920 px Seiten vermutlich `fullhd` und Größen aus `display.fontPt`), Ergebnis mit Screenshot belegen.

### B4 · Natives Säulendiagramm der neuen Seite erst im zweiten Deploy
Kachel `ncolumn` (Rollen category, values, multiples → PBIR Category, Y, Rows) fehlte nach Deploy 4 (Status „1 übersprungen", ohne Grund im Status), Deploy 5 legte sie an und sie rendert korrekt als Small Multiples mit AC und PY. Die Slicer derselben `--from-json`-Datei kamen schon in Deploy 4 an.
**Fix:** Grund fürs Überspringen ins Status-Feld `msg` und ins Log (vermutlich Teil-Ablehnung der `--from-json`-Datei beim Einzel-Retry); ein übersprungenes neues Visual im selben Deploy erneut versuchen, nicht erst im nächsten.

### B5 · Seitenaufnahme und Vergleich bei großen Berichten
- 23 Seiten aufnehmen dauerte 195 s, weil alle Seiten als geändert galten (Folge von B2) und je Seite bis 19 s aufs Zeichnen gewartet wurde. Nur geänderte Seiten aufnehmen (steht im Sprint), Wartezeit je Seite deckeln.
- Seitenfläche in 10 von 23 Aufnahmen nicht erkannt („Seitenverhältnis passt nicht, gefunden 801×581"): Seiten mit großen hellen Visuals oder weißen Flächen verwirren die Umgebungsfarben-Suche. Erkennung robuster machen (bekannte Seitenverhältnisse, Kanten des Berichtsrahmens, Rückfall auf das zuletzt erkannte Rechteck derselben Desktop-Sitzung, da sich das Fenster nicht ändert).

### B6 · Kein Runner für einen neu verbundenen Ordner
Michael verband das Kitchen mit einem neuen Ordner, der Runner lief auf einem anderen. Das Kitchen sagte nur „Agent nicht aktiv". Bestätigt den Sprint-Punkt: Startbefehl kopierbar anzeigen, Pfadabgleich, Knopf in Desktop.

### B7 · Desktop wurde ohne Rückfrage geschlossen (Visual-Update 1.42 → 1.43)
Erwartetes Verhalten des alten Runners, in der Beta nur noch nach Bestätigung. Zusätzlich: Ein Versions-Update eines schon vorhandenen Visuals sollte optional sein („vorhandene Version behalten"), weil es den Bericht des Nutzers verändert.

### B8 · compatibilityLevel 1702 und neuere Schemas
Modell 1702 und `visualContainer` 2.10.0 liefen durch; pbir meldet nur „schema not available locally, fallback". Kein Blocker, aber im doctor als Hinweis ausgeben.

### Positiv
- Neue Seite mit Kopfband, KPI-Karten und Slicern kam an, Umlaute und Kopfband-Texte korrekt.
- Visual-Update und Theme-Registrierung im Bestandsbericht funktionierten, Validate zeigte keine neuen Befunde.
- Deploy 5 ohne Neustart.
