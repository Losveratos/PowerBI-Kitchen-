# Auftrag P6-A · Synthese der 13 Reviews von Teil 1

**Modell:** Opus · **Ergebnis:** `energiewende/research/reviews_teil1/00_synthese.md`
**Regeln:** `energiewende/agents/REGELN.md` (Haltung, Ergebnis; kein Netzabruf)

## Ziel

Dreizehn Reviews haben rund 180 Befunde zu den zwei Seiten von Teil 1
geliefert, viele doppelt, manche gegenläufig. Du machst daraus **eine**
abgestimmte, nach Gewicht geordnete Arbeitsliste für die Überarbeitung —
ohne einen Befund zu verlieren und ohne einen zu glätten.

## Material

- Die 13 Berichte unter `energiewende/research/reviews_teil1/`.
- Die Seiten `energiewende-1-story.html` und `energiewende-1-belege.html`,
  die Freigabeliste `energiewende/docs/03_teil1_freigabe.md`, der Datensatz
  `energiewende/data/teil1_data.json`, die Entscheidungen in
  `energiewende/README.md`, die Messlatte `energiewende/docs/01_messlatte.md`.
- Vorbild für die Form: `strommix/research/persona_synthese.md`.

## Aufgaben

1. **Befunde zusammenführen:** Jeden Befund aller 13 Berichte erfassen
   (Kennung: Rolle und Nummer im Bericht). Gleiche Befunde zu einem Punkt
   bündeln und angeben, **wie viele Reviewer ihn unabhängig gefunden haben**
   und welche. Das Gewicht des Punkts ist das höchste Gewicht, das ein
   Reviewer ihm gab.
2. **Jeden Punkt selbst nachprüfen,** bevor er in die Liste kommt: Stimmt,
   was der Reviewer über die Seite sagt (Fundstelle im HTML oder Datensatz)?
   Stimmt sein Beleg (Original unter `energiewende/quellen/raw/`, Dossier,
   Prüfbericht)? Ein Befund, der sich nicht bestätigen lässt, bleibt in der
   Liste — mit dem Vermerk, woran die Bestätigung scheitert.
3. **Widersprüche zwischen Reviewern offenlegen** (etwa: Seite zu lang gegen
   mehr Inhalt gewünscht; Klimakosten stärker gegen Klimakosten nicht
   instrumentalisieren; R21 fairer gegen R21 härter). Für jeden Widerspruch
   beide Positionen und einen Vorschlag — die Entscheidung trifft der Mensch.
4. **Jeden Punkt einordnen:**
   - **A · auf der Seite beheben** — Text, Grafik, Darstellung; die
     Freigabeliste deckt die Korrektur schon.
   - **B · erst Freigabeliste und Datensatz ändern** — neue oder geänderte
     Aussage oder Zahl; nenne die Quelle, die Fundstelle und die
     vorgeschlagene Formulierung, und ob das Original unter `quellen/raw/`
     liegt.
   - **C · Entscheidung des Menschen** — mit den Optionen und einer
     Empfehlung.
   - **D · nicht umsetzen** — mit Begründung; der Befund bleibt sichtbar.
   - **E · gehört in einen späteren Teil** (welchen).
5. **Richtungsbilanz:** Wie viele kritische und mittlere Punkte hätten
   unkorrigiert (a) zulasten von R21, (b) zulasten der Energiewende,
   (c) zugunsten der Energiewende, (d) ohne Richtung (Handwerk,
   Darstellung) gewirkt? Diese Bilanz kommt später auf die Seite.
6. **Fehler im Verfahren:** Wo hat der Ablauf versagt (Freigabeliste selbst
   fehlerhaft, Bau-Agent schrieb nicht freigegebene Sätze, Datensatz
   unvollständig, Konfidenzstufe A falsch verwendet, Prüfung am Handy zu
   dünn)? Je Punkt ein Vorschlag, wie die Regeln oder Aufträge für Teil 2
   bis 6 geändert werden sollten.
7. **Messlatte:** die Punktwerte aus Bericht 13 übernehmen und die fünf
   vorgeschlagenen Präzisierungen der Messlatte einzeln bewerten (annehmen,
   ändern, ablehnen — mit Grund). Die Messlatte selbst änderst du nicht.
8. **Arbeitspakete für die Überarbeitung:** die Punkte der Klassen A und B
   zu Paketen ordnen, in der Reihenfolge, in der sie abgearbeitet werden
   müssen (Freigabeliste → Datensatz → Story → Belegseite → Nachprüfung),
   je Paket die Liste der Punkte.

## Form

Kein YAML-Frontmatter. Am Anfang eine Seite Zusammenfassung: Zahl der
Befunde je Gewicht vor und nach dem Bündeln, die zehn wichtigsten Punkte,
die Richtungsbilanz, die Entscheidungen für den Menschen als nummerierte
Liste mit Optionen. Danach die vollständige Tabelle. Am Ende ein
```json-Block `arbeitsliste` mit je Punkt: `id`, `gewicht`, `klasse`,
`reviewer`, `kurz`, `fundstelle`, `beleg`, `vorschlag`, `bestaetigt`.

Du änderst nichts an Seiten, Datensatz, Freigabeliste oder Messlatte.
Kein `git add`, kein Commit.

Abschlussmeldung: die Zahlen, die Richtungsbilanz, die Entscheidungen für
den Menschen.
