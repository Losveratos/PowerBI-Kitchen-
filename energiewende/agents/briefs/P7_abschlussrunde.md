# Auftrag P7 · Abschlussrunde Teil 1

**Drei Agenten nacheinander bzw. parallel** (welcher du bist, steht im
Startbefehl):

| Auftrag | Modell | Aufgabe | Dateien |
|---|---|---|---|
| P7-A | Opus | Freigabeliste und Datensatz nachziehen | `docs/03_teil1_freigabe.md`, `scripts/build_teil1_data.py`, `data/teil1_data.json` |
| P7-B | Opus | Story nachziehen (nach P7-A) | `energiewende-1-story.html` |
| P7-C | Sonnet | Belegseite nachziehen (nach P7-A) | `energiewende-1-belege.html` |

**Regeln:** `energiewende/agents/REGELN.md`, `energiewende/TRANSPARENZ.md`
v0.2, und der Auftrag `briefs/P6-CD_seiten_neu.md` (die eine harte Regel
gilt unverändert: jeder Tatsachensatz und jede Zahl kommt aus dem Datensatz).

## Ausgangslage

Die überarbeiteten Seiten wurden von fünf unbeteiligten Agenten
nachgeprüft: `energiewende/research/reviews_teil1/runde2/21_…` bis `25_…`.
Ergebnis: die kritischen Punkte der ersten Runde sind fast alle behoben;
die Überarbeitung hat neue, kleinere Fehler eingeführt — in **beide**
Richtungen. Lies alle fünf Berichte ganz. Jeder Befund jeder Gewichtsklasse
wird abgearbeitet oder mit Begründung nicht umgesetzt; nichts fällt
stillschweigend weg.

**Abnahme für alle drei:**

- `python3 energiewende/scripts/build_teil1_data.py` läuft ohne Fehler.
- `node energiewende/scripts/check_teil1_seiten.mjs` meldet **0 von 8
  Prüfungen gescheitert** (Exit-Code 0). Die Ausnahmeliste im Skript wird
  nicht erweitert, um das zu erreichen; ist eine neue Ausnahme sachlich
  nötig, steht sie mit Begründung in der Abschlussmeldung (das Skript ändert
  nur P7-A, und nur in der Ausnahmeliste).
- Die Layout-Skripte `energiewende/scripts/pruefung/p6e_22_layout_*.js`
  (Szenen, niedrige Bildschirmhöhe, Druck) melden keine Treffer.

## Entscheidungen der Orchestrierung für diese Runde

- Die Spalte „Vorher (falsch)“ der Korrekturen-Tabelle auf der Belegseite
  darf verworfene Wortlaute zeigen, durchgestrichen — eine Korrektur ohne
  den alten Wert ist nicht nachvollziehbar. Die Story zeigt den alten
  Wortlaut nicht.
- Die Prämissen kommen zurück auf beide Seiten, als Aussagen im Datensatz
  (TRANSPARENZ Abschnitt 1): Klimawandel real und menschengemacht, CO₂ soll
  sinken; Energie ist eine Hauptressource der Volkswirtschaft,
  Bezahlbarkeit und Versorgungssicherheit sind gleichrangige Ziele;
  Hauptpfad der Reihe sind Erneuerbare und Speicher, mit Gegenrechnung.
  Dazu **ein** belegter Satz zu den gesetzlichen Klimazielen (Quelle und
  Fundstelle am Original).
- Auf beiden Seiten steht sichtbar: kein Auftraggeber, keine Finanzierung
  durch Dritte; wer verantwortlich ist (Daten-WG Knowledge Kitchen,
  Verweis auf das Impressum); und wie man einen Fehler meldet (Issue im
  Repository `https://github.com/Losveratos/PowerBI-Kitchen-/issues`).
- Die Nutzenseite bekommt in der Story **einen** Satz mit Zahl im
  Klimakasten (ISE 2021 mit gegengerechneten Umweltkosten), die volle
  Darstellung bleibt auf der Belegseite.
- Kein 13. Kasten. Der Hinweis „Mehrkosten können auch zu hoch geschätzt
  sein“ kommt als Satz in den vorhandenen Kasten zur Unsicherheit.
- Die Anfrage an R21 und die PwC-Studie bleiben zurückgestellt.

## P7-A · Freigabeliste und Datensatz

Pflichtpunkte (alle in den Berichten belegt; schlage jede Stelle selbst am
Original nach, bevor du formulierst):

1. **V14** („Das Geld liegt im Wie der Energiewende, nicht in ihrem
   Abbruch“) — Wertung ohne Beleg, von zwei Prüfern unabhängig beanstandet.
   Ersetzen durch das, was DIHK und ZEW tatsächlich rechnen, mit Geltungs­
   bereich (ZEW: EU; R21s eigener Vorschlag).
2. **V04** („auch nach R21s eigener Bauzeit nicht erreichbar“) — R21 nennt
   die rund 15 Jahre für das ganze Programm. Der Einwand stützt sich auf
   Erfahrungswerte und unsere Setzung; so formulieren. Auch die
   Grafik-Angabe „2042“ als R21s Termin des ersten Blocks prüfen.
3. **S09** („Für die Mehrkosten trifft R21s Argument dagegen zu“) — von
   beiden Zweitlesern aus entgegengesetzter Richtung beanstandet:
   einschränken („im engen Sinn“) und den Gegenwert nennen (weniger
   Emissionen, weniger Importe; Drs. 21/903).
4. **B02 (Vorspann):** R21s Anteil nicht nur neben Mehrkosten stellen; das
   Brutto-Band gehört dazu. Prüfen, welches BIP für R21s eigene Umrechnung
   gilt (Entscheidung: 2025 nur dort).
5. **K05:** R21s Klimaposition vollständig wiedergeben (Bindung an das
   Mitziehen anderer, „Pause“), mit Fundstelle.
6. **R17** („tragen das Papier auch ohne die Billionen-Zahl“) — unbelegte
   Wertung, streichen oder belegen.
7. **F07 / R21s Untergrenze 10 Billionen:** Die Zahl ist R21s Behauptung;
   Setzung ist nur unsere vermutete Herleitung. Zwei getrennte Zahlen.
8. **„Eine Spanne steht dort auch nicht“** gegen das eigene Zitat
   („zwischen … oder“) prüfen und richtigstellen.
9. **Zweitquellenregel durchsetzen:** z. B. R21s 200.000 €/MWh (Quelle
   dahinter ungelesen) höchstens C.
10. **`korrekturen_eigene`:** die Richtung eindeutig machen — ein Feld
    „wem der alte Fehler geschadet hätte“ und ein Erklärsatz als Aussage;
    Ziffern in `neu` als Platzhalter mit Zahl-ID.
11. **`studien`:** die Angabe der Studie selbst als strukturierte Zahl
    (auch ISE 2021, ISE 2024 G3b, KfW-Zuwachs), nicht nur als Text; ein Feld
    `original_gelesen` je Studie; je Erzählschritt ein Untertitel; Titel der
    Teile 2 bis 6; die Lesegeschwindigkeit als Setzung im Datensatz.
12. **109 Tage:** in der Story-Fassung mit Konfidenz C und dem Zusatz zur
    Resterzeugung; Dunkelflauten-Kachel der Story nennt neben R21s Summe
    auch unsere Rechnung.
13. **Messlatte:** Punktwerte nach v1.0 **und** v1.1 aus Bericht 25 in
    `prozess_protokoll`; der Vergleich nur innerhalb eines Dokumenttyps als
    Datenregel (welche Dokumente dürfen nebeneinander stehen).
14. Die übrigen mittleren und kleinen Befunde der Berichte 21, 23, 24, 25,
    soweit sie Text oder Daten betreffen (internes Kürzel „(P120)“, Satz zur
    Waage in Akt 5, doppeltes Minus, Seitenangabe Wendland, Abzeichen
    mitten in einer Spanne über die Platzhalter-Form, M4/M5 aus 25 …).

Im Build-Skript: Ziffern-Prüfung auch für `korrekturen_eigene.neu` und alle
Studientexte; die neuen Felder als Pflichtfelder. In der Freigabeliste am
Ende eine Tabelle „Runde 2: Befund → Änderung“ für **alle** Befunde der
fünf Berichte (auch die für P7-B und P7-C, dort mit „Seite“ vermerkt).

## P7-B · Story

- Alle Text- und Datenänderungen kommen über den Datensatz; du passt nur
  an, was die Seite daraus macht.
- **Stehende Grafik:** bei jeder Breite ab 1020 px und jeder Höhe ab 600 px
  vollständig sichtbar (Panel nie höher als der Bildschirm: verkleinern,
  umbrechen oder innen scrollbar — aber alle Zeilen erreichbar). Test mit
  `p6e_22_layout_lowvh.js` und zusätzlich bei 1024×700, 1152×720,
  1280×720, 1366×768.
- **Druck und PDF:** alle Grafiken erscheinen (`p6e_22_layout_print.js`).
- **Akt 5 / Schritt 2:** die Achse richtet sich nach den Mehrinvestitionen
  und Mehrkosten; R21s Brutto-Spanne steht außerhalb dieses Bildes (als
  Hinweiszeile mit Zahl oder als eigenes kleines Bild darunter), nichts
  überlagert Namen und Werte am Handy; die Wertetabelle ist vorhanden.
- Das Band „Spanne der Gruppe“ sagt, was es einschließt. „Nicht am Original
  gelesen“ hat **eine** Form, die keine gelesene Zahl trägt; „Zuwachs“ eine
  andere. Der BIP-Umschalter ändert die Achse nicht.
- Die 22 Konsolenfehler bei 1280 px (negative Breiten) beheben; die Seite
  meldet bei jeder Breite null.
- Abzeichenfarben wie auf der Belegseite (gemeinsame CSS-Variablen; stimme
  dich über diese Namen ab: `--b-zitat`, `--b-wert-b`, `--b-wert-c`,
  `--b-behauptung`, `--b-eigen`, `--b-setzung`; Werte der Story gelten).
- Prämissen-Kasten, Verantwortung und Fehlermeldeweg aus dem Datensatz.
- Die Waage in Akt 5 und alle weiteren Darstellungsbefunde aus Bericht 22
  und 23.

## P7-C · Belegseite

- **Zahlenformat:** die Formatfunktion der Story übernehmen (lies sie in
  `energiewende-1-story.html`), sodass beide Seiten dieselbe Zahl gleich
  schreiben; Jahreszahlen ohne Tausenderpunkt; keine Vorzeichen neben
  „fielen“, „sanken“, „Minderung“; kein Abzeichen mitten in einer Spanne.
- **Beide Abzeichen im Fließtext** wie in der Story, mit den gemeinsamen
  Abzeichenfarben (`--b-…`, Werte aus der Story übernehmen).
- **Angabe der Studie** aus dem neuen strukturierten Feld, nicht per
  Mustererkennung aus Text; ISE 2021 wird gezeichnet.
- **Ungelesene Studien** (PwC und andere) sichtbar anders als gelesene, mit
  derselben Form wie in der Story.
- **Messlatten-Abschnitt:** kein gemeinsames Balkenbild über verschiedene
  Dokumenttypen; je Typ getrennt; Wertung nach v1.0 und v1.1.
- Prämissen, Verantwortung, Fehlermeldeweg; die Spalte „wem der alte Fehler
  geschadet hätte“ mit Erklärsatz.
- Alle weiteren Befunde aus den Berichten 21, 22, 25, die die Belegseite
  betreffen.

## Abschlussmeldung

Je Agent: Tabelle Befund → erledigt / nicht umgesetzt (mit Grund); die
Ausgabe der Abnahme-Skripte (letzte Zeilen); was offen bleibt. P7-B und
P7-C: Fotos der geänderten Szenen bzw. Abschnitte angesehen, Pfade nennen.
Kein `git add`, kein Commit.
