> Stand 03.10.2026 · Beta · Kitchen 0.6 live · Live-Helfer `mk-live` 0.1.2 mit Runner 0.3.2 · nur für Testkopien

# MockupKitchen live · Beta

## Was ist das?
MockupKitchen ist eine Skizzentafel für Power-BI-Berichtsseiten im Browser. Im Live-Modus ist sie mit einem Power-BI-Projekt (PBIP) auf deinem Rechner verbunden: Du skizzierst, klickst **Deploy**, ein kleiner Live-Helfer schreibt die Seite in den Bericht, Power BI Desktop lädt neu, und das Kitchen legt das Desktop-Bild neben die Skizze. Ein Workshop sieht so nach Sekunden echte Zahlen statt Beispieldaten.

**Für wen:** Report-Entwicklung und Beratung (Workshops mit Fachanwendern, Abnahme per Bildvergleich) und Power-BI-Profis, die External Tools kennen und Preview-Software an Testkopien ausprobieren. **Nicht für** Produktionsberichte, geteilte Rechner oder Terminalserver.

## Voraussetzungen
| Was | Hinweis |
|---|---|
| Windows 10 oder 11 | eigener Rechner, angemeldet, Bildschirmsperre während der Sitzung aus |
| Power BI Desktop ab August 2026 | Store oder Installer. **Desktop Bridge einschalten:** Datei → Optionen und Einstellungen → Optionen → **Sicherheit** → Zugriff externer Tools über sichere lokale APIs (englisch *Enable external tool access … through secure local APIs*). Kann per Richtlinie gesperrt sein. |
| Chrome oder Edge | Das Kitchen braucht die File System Access API. |
| Python 3.11 oder neuer | `python --version` |
| `pbir` 0.9.32 | `uv tool install pbir-cli==0.9.32` · **nur für nicht-kommerzielle Nutzung lizenziert.** Kommerzieller Einsatz braucht eine eigene Lizenzklärung. |
| Bridge-CLI `powerbi-desktop` 0.1.1 | `npm install -g @microsoft/powerbi-desktop-bridge-cli@0.1.1` (Node.js nötig, MIT-Lizenz). Getestet ist 0.1.1, `doctor` zeigt die installierte Version. |
| optional `te` (Tabular Editor CLI) | nur für Modelländerungen. Preview mit Ablaufdatum: `te --version` zeigt es, eine abgelaufene meldet „expired on …". Ohne gültiges `te` laufen Layout-Deploys, Modellwünsche bleiben Aufgaben. |

## Installation in 3 Schritten
1. **Holen:** `git clone https://github.com/Losveratos/PowerBI-Kitchen-.git` oder das ZIP von GitHub entpacken.
2. **Einrichten:** im Repo-Ordner `mockup-live\bin\mk-live.cmd setup`. Prüft Python, `pbir`, Bridge-CLI, `te` und das Desktop-Programm, installiert Pillow und psutil und legt den Befehl `mk-live` in einen Ordner aus dem PATH (zum Beispiel `%USERPROFILE%\.local\bin`). Findet `setup` keinen passenden Ordner, sagt es das; dann statt `mk-live` immer `mockup-live\bin\mk-live.cmd` schreiben (gleichwertig: `python mockup-live\mk_live.py`).
3. **Optional, Knopf in Desktop:** `mk-live register-tool` in einer Konsole **als Administrator** (legt die Datei unter `C:\Program Files (x86)\Common Files\Microsoft Shared\Power BI Desktop\External Tools\` ab; ohne Adminrechte nennt es den Kopierbefehl). Nach dem nächsten Desktop-Start: Menüband **Externe Tools → MockupKitchen live**.

## Erste Sitzung mit dem Beispielprojekt
1. **Kopieren und öffnen.** Nie im Repo-Ordner arbeiten:
   ```powershell
   # im Repo-Ordner
   robocopy mockup-live\sample\MockupLive-Sample "$env:USERPROFILE\Desktop\MockupLive-Sample" /E
   ```
   `PBI-IBCS-Testbed.pbip` per Doppelklick öffnen, **genau einmal**. Bleiben Visuals leer: Start → Aktualisieren (die Daten stecken in den Abfragen, keine Quelle, keine Anmeldung).
2. **Live-Helfer starten.** In Desktop: Externe Tools → MockupKitchen live. Oder in der Konsole:
   ```powershell
   mk-live doctor "$env:USERPROFILE\Desktop\MockupLive-Sample"   # Ampel, Rot erst beheben
   mk-live start  "$env:USERPROFILE\Desktop\MockupLive-Sample"
   ```
   `start` prüft zuerst wie `doctor` (ein blockierender roter Punkt hält den Start an), startet den Helfer losgelöst von Desktop, schreibt `mockup\desktop-session.json` und öffnet das Kitchen mit `?live=1&project=<Name>`. Läuft für den Ordner schon ein Helfer, startet es keinen zweiten.
   **Wichtig vor dem ersten Neustart:** Zeigt `mk-live doctor` die Zeile **Losgelöster Start** gelb, kann ein bestätigter Desktop-Neustart den Helfer mitbeenden, und Desktop bleibt danach zu. Dann `mk-live stop` und `mk-live start` aus einer **eigenen Konsole** (Start → Terminal), nicht aus Desktop heraus und nicht aus der Konsole eines Editors oder Agenten. Ob der Start über Externe Tools am Store-Desktop grün wird, ist noch nicht geprüft.
3. **Verbinden.** Im Kitchen oben **PBIP verbinden**, den Ordner `MockupLive-Sample` wählen (den mit der `.pbip`, nicht `*.Report`), Lesen und Schreiben erlauben. Die Frage „Layout aus dem Projekt übernehmen?" bestätigen. Das Sitzungsband zeigt Projekt, vollen Pfad und Desktop-Stand; weichen die Pfade von Kitchen, Helfer und Desktop voneinander ab, ist Deploy gesperrt.
4. **Sitzung vorbereiten.** Im Sitzungsband **Sitzung vorbereiten …**, im Dialog **Jetzt vorbereiten**. Der Helfer bringt ChartKitchen, KPI-Karte und Theme in den Bericht (ein eingelesener Bericht behält sein Theme, solange du die Gestaltung im Kitchen nicht änderst) und startet Desktop dafür einmal neu, erst nach deiner Bestätigung (siehe unten). Danach in Desktop in der gelben Leiste die Visuals erlauben. Ab jetzt gibt es keinen Neustart mehr.
5. **Erster Deploy.** Kachel „Säulen" anlegen, Kategorie `DimDate · MonthName`, Istwert `_Measures · AC`, Bezug `_Measures · PY`. Strg+Enter zeigt die Vorschau, Enter überträgt. Das Band zeigt `Prüfen` → `Sichern` → `Schreiben` → `Desktop lädt neu` → `Vergleichen`, danach **Ergebnis** öffnen.

## Der Schalter `?live=1`
Ohne Schalter sieht das Kitchen aus wie immer, die Live-Oberfläche ist ganz weg. `?live=1` an der Adresse schaltet sie ein (das Kitchen merkt es sich im Browser), `?live=0` schaltet sie wieder aus, `?project=<Name>` wählt das Projekt im Hinweis vor. `mk-live start` öffnet `https://datenwgknowledgekitchen.com/mockup-kitchen.html?live=1&project=<Name>`; eine andere Adresse geht mit `--open-kitchen <URL>` oder der Umgebungsvariablen `MK_KITCHEN_URL`.

## Neustart nur nach Bestätigung
Manche Deploys brauchen einen Desktop-Neustart, etwa wenn ein Kitchen-Visual zum ersten Mal in den Bericht kommt. Der Helfer wartet dann auf deine Antwort im Kitchen und beendet Desktop nie von sich aus. Ohne Antwort ist nach 10 Minuten Schluss: Der Deploy endet als „blockiert", geschrieben wird nichts.
- **Fall A, in Desktop ist nichts ungespeichert:** Das Kitchen zeigt **Jetzt neu starten** mit einem 10-s-Countdown, der bei jeder Bewegung im Kitchen anhält. **Abbrechen** und **Ohne Neustart deployen** gehen immer.
- **Fall B, Desktop hat Ungespeichertes:** kein Countdown und kein direkter Neustart. **In Desktop speichern, ich warte** (der Helfer erkennt das Speichern und macht weiter), **Ohne Neustart deployen** (fehlende Visuals bleiben Skizze bzw. Aufgabe), **Verwerfen und neu starten** (Ungespeichertes geht verloren, nie vorausgewählt) oder **Abbrechen**. Das gilt auch, wenn die Markierung nur vom letzten Deploy stammt (jeder Reload markiert Desktop als „ungespeichert"): Der Helfer kann sie nicht von Änderungen unterscheiden, die du seitdem in Desktop gemacht und nicht gespeichert hast, und der Dialog sagt das so.
- **Update eines Visuals, das schon im Bericht ist** (z. B. ChartKitchen 1.42 → 1.43): Der Dialog nennt das Update. **Vorhandene Version behalten** deployt ohne Neustart mit der Version im Bericht.
- **Ohne Neustart, aber ein Reload würde echte Arbeit überschreiben:** derselbe Dialog (ohne Countdown) mit **In Desktop speichern, ich warte**, **Schreiben, nicht neu laden**, **Verwerfen und neu laden** und **Abbrechen**, dazu eine Zeile im Sitzungsband.
- **Während eines Deploys nicht in Desktop arbeiten.** Ändert sich in Desktop etwas, während der Helfer schreibt, setzt er den Bericht zurück, lädt nicht neu und meldet „blockiert". Und: Was du nach einem Deploy in Desktop änderst, vor dem nächsten Deploy speichern (Strg+S). Ungespeichertes nach einem Deploy erkennt der Helfer nicht; ein Deploy ohne Neustart lädt dann neu und es ist weg. Das Sitzungsband warnt davor: beim Desktop steht „ungespeichert seit #n“, darunter die Zeile „Ungespeichertes in Desktop seit Deploy #n wird beim nächsten Deploy verworfen“.
- Während des Neustarts zeigt das Kitchen eine Pausenkarte, weiter skizzieren ist möglich. Geschlossen wird nur die Desktop-Instanz dieses Projekts, andere Fenster bleiben unberührt.

## Was dich erwartet (Richtwerte, wir messen im Beta nach)
- **Deploy ohne Neustart:** etwa 10 bis 20 s bei kleinen Berichten. Desktop lädt den ganzen Bericht neu, Filter springen zurück, Desktop zeigt danach „ungespeichert". Das ist normal.
- **Sitzung vorbereiten:** 1 bis 2 Minuten mit einem Neustart. Guter Moment für die Vorstellungsrunde.
- **Deploy mit Neustart** (neues Kitchen-Visual mitten in der Sitzung): 40 bis 60 s, nur nach Bestätigung.
- **Bildvergleich:** prüft den Aufbau, nicht die Zahlen. 12 echte Monate gegen 6 Beispielmonate sind kein Fehler.

## Bekannte Grenzen aus dem ersten Praxistest
Ein Test mit einem fertig gestalteten Bericht (23 Seiten, Kitchen-Visuals schon drin) hat gezeigt, wo die Beta hakte. Stand jetzt (Runner 0.3.2, Kitchen 0.6):
- **Behoben:** Der erste Deploy schreibt keine Kitchen-Gestaltung mehr auf eingelesene Seiten (das Kitchen übernimmt die Gestaltung des Berichts, erst eine bewusste Designänderung im Kitchen gilt). Ein Bericht ohne eigenes Theme behält sein Theme. Kitchen-Visuals im Bericht (ChartKitchen, KPI-Karte, Gantt, GuV) lassen sich verschieben (der Helfer schreibt ihre Lage direkt, nicht über `pbir batch`). Ein Typwechsel ersetzt ein Visual, das der Helfer selbst angelegt hat; fremde Visuals bleiben eine Aufgabe. Ein neues Visual, das beim Anlegen fehlt, versucht der Helfer im selben Deploy noch einmal. Aufgenommen werden nur geänderte Seiten.
- **KPI-Karte:** Die Größe wird aus der Kachel berechnet (in Desktop noch zu bestätigen). Eine Verlaufslinie gibt es nur mit Zeitfeld, die Skizze zeigt sie auch nur dann.
- **Bildvergleich bei vielen hellen Flächen:** Findet der Helfer die Seite im Desktop-Bild nicht, nimmt er das Rechteck derselben Desktop-Sitzung und markiert den Vergleich als unsicher. Der Deploy gilt immer.
- **Kitchen mit anderem Ordner verbunden als der Helfer:** Das Kitchen meldet „Agent nicht aktiv" bzw. sperrt Deploy. Den Pfad im Sitzungsband mit dem Ordner des Helfers vergleichen, den Helfer für den richtigen Ordner starten.
- **Updates vorhandener Kitchen-Visuals:** Hat dein Bericht eine ältere ChartKitchen- oder KPI-Karten-Version, bietet der Neustart-Dialog **Vorhandene Version behalten** an. Ist Desktop beim Deploy geschlossen, aktualisiert der Helfer ohne Frage (dauerhaft abschalten: Helfer mit `-- --keep-visual-versions` starten).
- **Neuere Formate** (`compatibilityLevel` 1702, neuere Visual-Schemas) liefen durch; `pbir` meldet dabei nur, dass es ein Schema nicht kennt.
- **Noch nicht an einem echten Desktop geprüft:** Neustart aus der Store-Version über Externe Tools, die direkt geschriebene Lage von Custom Visuals nach dem Neuladen, die Größe der KPI-Karte.

## Grenzen und Sicherheit
- **Previews:** Desktop Bridge, `te` und Teile von Desktop sind Preview. Ein Desktop-Update kann Verhalten ändern.
- **Der Deploy ist führend.** Ändert der Deploy eine Kachel, gilt der Kitchen-Stand. Was in Desktop bleiben soll: dort speichern und im Kitchen neu einlesen.
- **Screenshots enthalten echte Daten.** `mockup\shots\`, `mockup\kitchen\` und Protokolle nicht weitergeben, ohne hineinzuschauen.
- **Nur Testkopien,** nie das Original, Kundenprojekte nur mit Freigabe. Ein Rechner, ein Benutzer: die Bridge hat keine eigene Anmeldung.
- **`mockup\` und Git:** Der Helfer legt `mockup\.gitignore` an. Versioniert werden höchstens Spec, Brief und Freigaben, nie Bilder, Sicherungen oder Laufzeitdateien.
- **Weitere Lücken:** Drill-through, Lesezeichen-Zustand, Seitenreihenfolge, Deneb-Typen. Liste in [PLAYBOOK.md](PLAYBOOK.md), Abschnitt Grenzen.

## Fehler melden
1. `mk-live diag "<Projektordner>"` schreibt ein ZIP nach `mockup\.state\diag\`: Status, doctor-Ergebnis, Sitzung, letzte Anfrage und Antwort, Verlauf, Protokoll des Helfers, Versionen. Benutzerpfade sind auf `C:\Users\<du>` gekürzt, der Projektordner samt übergeordneten Ordnern heißt `<Projekt>`, der Benutzername auch in anderen Ordnernamen `<du>`. **Ohne Bilder und ohne Konverter-Ausgabe**; die kommen nur mit `mk-live diag "<Projektordner>" --with-images` dazu und zeigen echte Daten. Auch ohne Bilder stehen Seiten-, Kachel- und Feldnamen drin: vor dem Hochladen öffnen und prüfen.
2. Auf GitHub ein Issue mit der Vorlage **MockupKitchen live · Beta** öffnen, ZIP anhängen. **Issues sind öffentlich:** keine Kundendaten, keine Screenshots mit echten Zahlen.

## Zurück zu einem früheren Stand
- **Im Kitchen:** Live-Tab → Verlauf → **Zu diesem Stand zurück …** (oder Deploy-Menü → Zurück zu Deploy …). Läuft als neuer Deploy, die späteren Deploys bleiben im Verlauf.
- **Von Hand:** Desktop schließen, `<Name>.Report` umbenennen (nicht löschen), `mockup\backup\<n>\<Name>.Report` (Stand vor Deploy n) an seine Stelle kopieren, Desktop öffnen.
- **Ganz zurück:** Testkopie verwerfen und neu kopieren.

## Dazu wollen wir deine Meinung
1. Wie lange hat es vom Download bis zum ersten erfolgreichen Deploy gedauert, und wo bist du hängen geblieben?
2. Wusstest du in jedem Moment, was gerade passiert und was als Nächstes kommt (Sitzungsband, Vorschau, Neustart-Dialog)?
3. Hat der Bildvergleich deine Abnahme erleichtert? Wo lag er daneben?
4. Würdest du das vor Fachanwendern im Workshop einsetzen? Was fehlt dafür?
5. Welche Kachel oder Einstellung kam in Desktop anders an als skizziert?
