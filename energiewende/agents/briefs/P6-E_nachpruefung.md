# Auftrag P6-E · Nachprüfung der überarbeiteten Seiten von Teil 1

**Modell:** Opus · fünf Agenten, keiner war an Freigabe v2 oder Neubau
beteiligt · **Ergebnis:** `energiewende/research/reviews_teil1/runde2/<Nr>_<rolle>.md`
**Regeln:** `energiewende/agents/REGELN.md`, `energiewende/TRANSPARENZ.md` v0.2

## Gegenstand

`energiewende-1-story.html` und `energiewende-1-belege.html` in der
überarbeiteten Fassung, gebaut aus `energiewende/data/teil1_data.json`
(Freigabeliste v2: `energiewende/docs/03_teil1_freigabe.md`).

Lies die Seiten gerendert: `python3 -m http.server` im
Repo-Wurzelverzeichnis, Playwright über Node (`require('playwright')`,
`chromium.launch()` ohne Optionen; das Python-Paket ist nicht installiert),
bei 1280 px und 390 px.

Die erste Runde liegt unter `energiewende/research/reviews_teil1/`
(13 Berichte, Synthese `00_synthese.md`). Welche Rolle sie lesen darf,
steht in der Tabelle.

## Rollen (deine Nummer steht im Startbefehl)

| Nr. | Rolle | Aufgabe | Darf die erste Runde lesen? |
|---|---|---|---|
| 21 | **Freigabe-Prüfer mit Prüfskript** | Schreibe `energiewende/scripts/check_teil1_seiten.mjs` (Node, Playwright): rendert beide Seiten und prüft maschinell — (a) jeder sichtbare Satz mit Ziffer, Prozent, Euro oder Studienname stammt aus dem Datensatz (Abgleich des gerenderten Texts gegen die aufgelösten Texte von `claims`, `gegenpositionen`, `schritte`, `glossar`, `quellen`, `studien`, `prozess_protokoll`, `korrekturen_eigene`); Ausnahmen in einer kurzen, begründeten Liste im Skript; (b) Aussagen stehen nur auf der Seite, die ihr `ort` erlaubt; verworfene nur in der Tabelle „Verworfen“; (c) keine verbotene Formulierung außerhalb der Liste „verwenden wir nicht“; (d) jede Zahl trägt beide Abzeichen und sie stimmen mit dem Datensatz überein; (e) jede nicht prüfbare Aussage zeigt ihren Vorbehalt; (f) alle Gegenpositionen stehen sichtbar da, in der Story kurz mit funktionierendem Sprung zur Langfassung; (g) kein Abruf an fremde Hosts, keine Konsolenfehler, kein leerer Platzhalter. Das Skript endet mit Exit-Code ungleich null, wenn etwas scheitert. Dazu von Hand: die 20 kritischen Punkte der Synthese einzeln — behoben, teilweise, offen. | ja |
| 22 | **Layout- und Dataviz-Prüfer** | Jede Szene der Story und jeden Abschnitt der Belegseite bei 390 px und 1280 px, hell und dunkel, fotografieren, **ansehen** und vermessen: Text außerhalb von viewBox oder Bildschirm, überlappende Beschriftungen, Schrift unter 12 px in Grafiken, verdeckte Schrittkarten am Handy, Kontrast der bedeutungstragenden Elemente (mindestens 3 : 1), gleicher Farbcode auf beiden Seiten, Wertetabellen für Screenreader. Sind Mehrinvestitionen und Mehrkosten in jeder Grafik getrennt? Steht R21s Brutto-Summe irgendwo in einem Mehrkosten-Bild? Zeigen die Grafiken Unsicherheit in beide Richtungen? Sind die zwei BIP-Rechnungen und die Angabe der Studie unterscheidbar und erklärt? | nur `07_dataviz.md` |
| 23 | **R21-Verteidiger, zweite Lesung** | Wie in der ersten Runde (Rolle 08): das Papier so stark wie möglich machen und prüfen, ob die Seite dem standhält. Das Original liegt unter `energiewende/quellen/raw/P0/`. Wo ist die Seite jetzt noch unfair, verkürzt, unterstellend? Wo ist sie in der Überarbeitung zu weich geworden und lässt etwas durchgehen, das die Belege nicht tragen? | nur `08_r21_verteidiger.md` |
| 24 | **Klima- und Energiewende-Sicht, zweite Lesung** | Wie die Rollen 04 und 05 der ersten Runde: Wird die Energiewende zu schlecht oder zu gut dargestellt, fehlt die Nutzenseite, wird Dringlichkeit unterschlagen oder instrumentalisiert? Wo ist die Seite in der Überarbeitung zugunsten von R21 über das hinausgegangen, was die Belege tragen? | nur `04_…` und `05_…` |
| 25 | **Messlatten-Prüfer, unabhängig** | `energiewende/docs/01_messlatte.md` in der Fassung v1.1 auf Teil 1 anwenden (beide Seiten, Freigabeliste, Datensatz, Skripte). Punkte nach v1.0 **und** nach v1.1, je Kriterium mit Fundstelle. K3: Stichprobe von zwölf Zahlen aus dem Stichprobenrahmen der Präzisierung 2, gezogen mit festem Startwert 25, jede am Original unter `quellen/raw/` nachgeschlagen bzw. nachgerechnet. Du liest **nicht** die Berichte der ersten Runde, nicht die Synthese und nicht `research/reviews_teil1/` — nur die Seiten, die Freigabeliste, den Datensatz, die Messlatte und die Originale. | **nein** |

## Ergebnis

Kein YAML-Frontmatter. Je Bericht: Urteil in fünf Zeilen · Befunde nach
Gewicht (kritisch · mittel · klein) mit Fundstelle, Beleg und konkretem
Vorschlag · was gegenüber der ersten Fassung besser ist (Rollen 21 bis 24)
· was weiterhin fehlt. Rolle 21 dazu die Tabelle der 20 kritischen Punkte
und die Ausgabe des Prüfskripts; Rolle 22 die Messwerte und Foto-Pfade;
Rolle 25 die Punktetabellen nach v1.0 und v1.1.

## Grenzen

Du änderst nichts an den Seiten, am Datensatz oder an der Freigabeliste.
Rolle 21 schreibt zusätzlich das Prüfskript, sonst schreibt jede Rolle nur
ihren Bericht. Kein `git add`, kein Commit.

Abschlussmeldung: Zahl der Befunde je Gewicht, die drei wichtigsten, und
ein Wort zum Stand: **freigabereif als Entwurf** · **noch eine Runde
nötig** (mit den Punkten, an denen es hängt).
