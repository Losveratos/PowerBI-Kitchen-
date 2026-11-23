# Auftrag P6-C / P6-D · Die zwei Seiten von Teil 1 aus dem neuen Datensatz

**Zwei Agenten, je eine Seite** (welche, steht im Startbefehl):

| Auftrag | Modell | Seite | Datei im Repo-Wurzelverzeichnis |
|---|---|---|---|
| P6-C | Opus | Scroll-Story | `energiewende-1-story.html` |
| P6-D | Sonnet | Belegseite | `energiewende-1-belege.html` |

**Regeln:** `energiewende/agents/REGELN.md` (Haltung, Ergebnis; kein
Netzabruf), `energiewende/TRANSPARENZ.md` v0.2, Kapitel „Design-System“ in
`CLAUDE.md`. Der erste Bau-Auftrag `briefs/P4_teil1_seiten.md` gilt weiter
für Gestaltung, Entwurfsband, `noindex`, keine fremden Server — **soweit
dieser Auftrag nichts anderes sagt.**

## Warum neu

Der erste Entwurf ging durch 13 Reviews (`research/reviews_teil1/`,
Synthese `00_synthese.md`). Ergebnis: 20 kritische Punkte, die meisten
zulasten des geprüften Papiers. Drei Ursachen lagen im Bau:
Bau-Agenten schrieben eigene Tatsachensätze; Zahlen und Texte standen von
Hand in der Seite; die Prüfung am Handy war zu dünn. Die Freigabeliste ist
neu (v2), der Datensatz enthält jetzt **alle** Texte. Du baust deine Seite
auf dieser Grundlage um — Gestaltung und Mechanik der vorhandenen Datei
darfst du behalten, den Inhalt nicht.

Lies zuerst: `energiewende/docs/03_teil1_freigabe.md` (v2, besonders den
Abschnitt „Regeln für die Seiten“ und den Nachweis zur Arbeitsliste), dann
`energiewende/data/teil1_data.json` (Schlüssel `meta`, `zahlen`, `claims`,
`schritte`, `gegenpositionen`, `studien`, `glossar`, `quellen`,
`verworfen`, `verbotene_formulierungen`, `korrekturen_eigene`,
`prozess_protokoll`), dann in der Synthese die Punkte, die deine Seite
betreffen (Arbeitspakete AP3 und AP4 für die Story, AP5 für die
Belegseite), und für die Story den Bericht `07_dataviz.md` ganz.

## Die eine harte Regel

**Jeder Tatsachensatz und jede Zahl auf der Seite kommt zur Laufzeit aus
dem Datensatz.** Die Seite rendert `claims[].text`,
`gegenpositionen[].kurz` / `.lang`, `schritte[].text`, `glossar`,
`quellen`, `prozess_protokoll` — mit den Platzhaltern `[[zahl-id|format]]`
aufgelöst. Von Hand im HTML stehen nur: Überschriften, Navigation,
Bedienhinweise, Beschriftungen ohne Tatsachengehalt und reine
Übergangssätze. Brauchst du einen Satz, den es im Datensatz nicht gibt,
schreibst du ihn **nicht** — er kommt in deine Abschlussmeldung.
Die Seite behauptet nicht „keine Zahl von Hand“; das stellt die
Nachprüfung fest.

Aussagen mit `ort: "belege"` erscheinen nicht in der Story, solche mit
`ort: "story"` nicht auf der Belegseite, verworfene nirgends außer in der
Tabelle „Verworfen“ der Belegseite.

## Zwei Abzeichen je Zahl

Aus `zitat_geprueft` und `wert_konfidenz`, wie in TRANSPARENZ Abschnitt 2:
„Zitat geprüft“ und getrennt „Wert: A / B / C / Behauptung / eigene
Rechnung / Setzung (M)“. Eine Legende steht am Anfang. Ein Leser darf an
keiner Stelle „Zitat geprüft“ für „stimmt“ halten können — die Zahl aus der
Schlagzeile trägt sichtbar „Wert: Behauptung“.

## P6-C · Die Scroll-Story

- **Vorspann mit dem Befund** (die Aussagen des Abschnitts „Vorspann“),
  bevor gescrollt wird. Ehrliche Leseangabe, aus der Wortzahl errechnet.
- **Erzählbogen** aus `schritte` (Akt, Rolle, Text, Grafik-Angaben).
- **Gegenpositionen kurz** (`kurz`, zwei Sätze) mit Sprung zur Langfassung
  auf der Belegseite (Anker je Kasten — mit P6-D abgestimmt über die IDs
  der Kästen: `id="gp-<id>"`).
- **Grafiken** (alle Befunde aus `07_dataviz.md` und AP4):
  - Mehrinvestitionen und Mehrkosten in getrennten Gruppen, jede mit
    eigener Überschrift; R21s Brutto-Summe steht nie in einem
    Mehrkosten-Bild ohne sichtbare Trennung und Beschriftung.
  - Anteil am BIP als Spanne zwischen fester und wachsender Rechnung; wo
    vorhanden, die Angabe der Studie selbst als eigenes Zeichen.
  - Unsicherheit in beide Richtungen; keine Pfeile fester Länge auf einer
    Werte-Achse.
  - **Ein** Farbcode für die ganze Seite und identisch auf der Belegseite:
    lege ihn in CSS-Variablen `--c-r21`, `--c-g1`, `--c-g2`, `--c-g3a`,
    `--c-g3b`, `--c-eigen` fest und schreibe die Werte in deine
    Abschlussmeldung. Kontrast der bedeutungstragenden Elemente gegen den
    Hintergrund mindestens 3 : 1, in hell und dunkel; R21 und Mehrkosten
    klar unterscheidbar, auch bei Farbfehlsichtigkeit (zusätzlich Form oder
    Muster).
  - Jede Grafik hat eine Wertetabelle für Screenreader (aufklappbar oder
    visuell versteckt) und einen Untertitel, der sagt, was man sieht.
- **Handy (390 px): Grafik und Schrittkarte untereinander,** nicht
  überlagert. Jede Schrittkarte ist vollständig lesbar, solange ihre Szene
  aktiv ist. Keine Schrift unter 12 px in Grafiken; nichts außerhalb der
  viewBox; keine überlappenden Beschriftungen.
- „Was Teil 1 nicht zeigt“, Glossar, „Wo wir uns korrigieren mussten“
  (aus `korrekturen_eigene`, mit der Richtungsbilanz aus
  `prozess_protokoll`), „So ist diese Seite entstanden“, Quellen, Verweis
  auf Belegseite und Teile 2 bis 6.

## P6-D · Die Belegseite

- Kurzfassung aus den Vorspann- und Kern-Aussagen.
- **Aussagen-Tabelle aus `claims`** (alle mit `ort` belege oder beide),
  filterbar nach Status; Text, Quelle, Fundstelle, Vorbehalt.
- **Studien-Vergleich aus `studien`:** Herausgeber, Auftraggeber, Größe
  (G1 / G2 / G3a / G3b), Zeitraum, Summe, pro Jahr, Anteil am BIP fest und
  wachsend, Angabe der Studie selbst, Preisbasis, abgezinst ja/nein,
  Systemgrenze. Sortierbar. Die Grafik folgt denselben Regeln und demselben
  Farbcode wie die Story (CSS-Variablen `--c-r21`, `--c-g1`, `--c-g2`,
  `--c-g3a`, `--c-g3b`, `--c-eigen`; die Werte legt P6-C fest — nimm bis
  dahin: R21 `#2F5D8A`, G1 `#3B4A5A`, G2 `#7A5C1E`, G3a `#B5532A`, G3b
  `#1F7A6B`, eigene Rechnung `#6B5B95`, und prüfe den Kontrast selbst).
- Gegenüberstellung Zitat und Quelle im Wortlaut.
- **Gegenpositionen in voller Länge** (`lang`), jeder Kasten mit
  `id="gp-<id>"`.
- Nicht gelesen · Verworfen (Tabelle „verworfen“; die verbotenen
  Formulierungen als Liste „verwenden wir nicht“, jede Zeile so
  gekennzeichnet).
- **Wo wir falsch lagen** aus `korrekturen_eigene`: Dossiers, Freigabe v1,
  erster Seitenentwurf — mit Richtung und der Bilanz.
- **Messlatte:** die Punktwerte nach v1.0 aus `prozess_protokoll` mit den
  drei Lesehinweisen (misst Nachprüfbarkeit, nicht Richtigkeit; Vergleich
  nur innerhalb eines Dokumenttyps; Quellentreue nur für das eigene Stück
  bewertbar) und dem Vermerk, dass die Neubewertung nach v1.1 aussteht.
- Was Teil 1 nicht zeigt · Quellen (alle mit URL und Abrufdatum aus dem
  Datensatz) · „So ist diese Seite entstanden“.
- Auf 390 px: Tabellen als Karten, aber die Seite bleibt benutzbar —
  Abschnitte zugeklappt, Sprungnavigation.

## Prüfung, bevor du fertig meldest

Alles aus dem ersten Auftrag (Konsole, fremde Hosts, waagerechtes Scrollen,
Platzhalter, `file://`-Hinweis), und zusätzlich:

1. **Layouttest bei 390 px und 1280 px, hell und dunkel, je Szene bzw. je
   Abschnitt,** per Skript in Playwright: Text außerhalb der viewBox oder
   des Bildschirms · sich überlappende Textkästen in Grafiken (Bounding
   Boxes) · Schrift in Grafiken unter 12 px · Schrittkarte verdeckt (Story)
   · leere oder abgeschnittene Beschriftungen. Ergebnis als Tabelle in der
   Abschlussmeldung; null Treffer ist das Ziel, jeder verbleibende wird
   begründet.
2. **Kontrast** der bedeutungstragenden Grafikelemente und Abzeichen,
   gemessen, hell und dunkel.
3. **Jede Szene bzw. jeden Abschnitt fotografieren** (390 und 1280) und die
   Fotos selbst ansehen — nicht nur die Messwerte.
4. **Tatsachensätze von Hand:** den HTML-Quelltext nach Sätzen mit Zahl,
   Eigenname einer Studie oder Wertung durchsuchen, die nicht aus dem
   Datensatz kommen; Liste mit Begründung in die Abschlussmeldung.
5. Verworfene Zahlen und verbotene Formulierungen im gerenderten Text
   (auch in zugeklappten Bereichen).

## Grenzen

Nur deine eine HTML-Datei. Datensatz, Freigabeliste und alles andere
bleiben unverändert; was fehlt oder unklar ist, steht in der
Abschlussmeldung. Kein `git add`, kein Commit.

Abschlussmeldung: Aufbau; Ergebnis jeder Prüfung mit Zahlen; die
Farbwerte; fehlende Sätze oder Zahlen im Datensatz; was du nicht umsetzen
konntest.
