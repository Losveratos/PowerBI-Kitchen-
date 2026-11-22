# Auftrag P4 · Die zwei Seiten von Teil 1 bauen

**Zwei Agenten, je eine Seite** (welche, steht im Startbefehl):

| Auftrag | Modell | Seite | Datei im Repo-Wurzelverzeichnis |
|---|---|---|---|
| P4-A | Opus | Scroll-Story „Die 13,8 Billionen“ | `energiewende-1-story.html` |
| P4-B | Sonnet | Belegseite zu Teil 1 | `energiewende-1-belege.html` |

**Regeln:** `energiewende/agents/REGELN.md` (Haltung, Ergebnis; kein
Netzabruf nötig), `energiewende/TRANSPARENZ.md`, und das Kapitel
„Design-System“ in `CLAUDE.md` im Repo-Wurzelverzeichnis.

## Was erzählt werden darf

Einzige inhaltliche Grundlage ist `energiewende/docs/03_teil1_freigabe.md`
und der daraus gebaute Datensatz `energiewende/data/teil1_data.json`.

- Nur Aussagen mit Status **bestätigt**, **korrigiert** oder **Setzung (M)**
  dürfen ohne Vorbehalt erzählt werden; Setzungen tragen die Marke
  „Setzung (M)“.
- **Nicht prüfbare** Aussagen nur in dem Wortlaut, den Abschnitt 3 der
  Freigabeliste erlaubt.
- **Verworfene** Zahlen und die **verbotenen Formulierungen** (im Datensatz
  `verworfen` und `verbotene_formulierungen`) kommen auf der Seite nicht vor.
- Alle zwölf **Pflicht-Gegenpositionen** stehen auf der Seite, jede als
  eigener, sichtbarer Kasten — nicht versteckt, nicht gebündelt am Ende.
- Entscheidungen von Michael (README, Tabelle „Entscheidungen“): der
  Kernkraft-Neubau nur als kurzer Hinweis mit Verweis auf Teil 6; die
  Klimafolgekosten als **ein** Kasten mit dem Vorbehalt „Untergrenze, nicht
  addierbar“; kein Name des BILD-Autors; BIP-Bezug 2024 in der
  Studientabelle; der Förderhinweis nur im Steckbrief; der ifo-Auszug
  höchstens als Fußnote.
- Ton: sachlich, ohne Häme, ohne Unterstellung von Absicht. Wir schreiben,
  was in den Dokumenten steht und was nicht.

## Keine Zahl im HTML

Jede Zahl kommt zur Laufzeit aus `energiewende/data/teil1_data.json`
(per `fetch`, relativer Pfad). Im HTML stehen Platzhalter wie
`<span data-v="zahlen-id" data-f="format"></span>`; ein kleines Skript auf
der Seite füllt sie (deutsche Zahlenformate, Einheit, Bandbreite
„min bis max“). Auch die Zahlen in den Grafiken kommen aus dem Datensatz.
Ausnahmen sind nur Jahreszahlen, Seitenangaben und Aktenzeichen im
Fließtext. Bei Aufruf über `file://` zeigt die Seite einen Hinweis mit
`python3 -m http.server`.

Jede Zahl bekommt einen Quellen-Chip (Sprung zur Quellenliste) und ein
kleines Abzeichen: Konfidenz A / B / C und „am Original gelesen“ oder
„nicht am Original gelesen“ — beides aus dem Datensatz, nicht von Hand.

## Gestaltung

- Kitchen-Design wie die Geschwister-Seiten: Schriften Fraunces (Titel),
  Geist (Text), JetBrains Mono (Zahlen, Etiketten), **selbst gehostet** über
  `assets/fonts/<familie>/<familie>.css`. Farben aus den CSS-Variablen
  (`--bg #FAFAF7`, `--ink #0F1E2E`, `--accent #C25A2D` …).
- **Keine fremden Server:** keine Google Fonts, kein CDN, keine externen
  Skripte, Bilder oder Einbettungen. Grafiken als handgebautes Inline-SVG.
- Vorlagen im Repo, die du zuerst liest: für die Story
  `strommix/docs/04_story_format_analyse.md` und `strommix-story.html`; für
  die Belegseite `whitepaper-strommix.html` und `eauto-klimabilanz.html`.
  Übernimm Aufbau und Mechanik, nicht deren Inhalte.
- Hell und dunkel, lesbar auf 390 px Breite, kein waagerechtes Scrollen.
  Farben nie als einziger Bedeutungsträger; SVG mit `<title>`.
- Oben ein deutlich sichtbares Band **„Entwurf · noch nicht veröffentlicht ·
  Reviews stehen aus“** und `<meta name="robots" content="noindex">`.
- Fußzeile mit Verweis auf Impressum und Datenschutz wie auf den
  Geschwister-Seiten; beide Seiten verlinken einander.

## P4-A · Die Scroll-Story

Der Erzählbogen aus Abschnitt 4 der Freigabeliste: fünf Akte, je drei bis
vier Schritte, gesteuert über einen IntersectionObserver wie in
`strommix-story.html` (Grafik bleibt stehen, Text läuft).

1. **Der Satz** — was in der Schlagzeile und im Papier steht.
2. **Die Fußnote** — was in der zitierten Kurzinformation steht.
3. **Die Quelle der Quelle** — was hinter den beiden Zahlen dort steht, und
   was davon ungelesen ist.
4. **Drei Größen** — Brutto-Gesamtkosten, Brutto-Investitionen, Mehrkosten:
   dieselbe Welt, drei Zahlen. Die Kern-Grafik der Seite.
5. **Der Vergleichspfad und was R21 richtig sieht.**

Danach: die Gegenpositionen, soweit sie nicht schon im Lauf stehen; „Was
Teil 1 nicht zeigt“; ein kurzes Glossar (brutto, Mehrkosten, Barwert, Anteil
am BIP, Referenzszenario) mit Hin- und Rücksprung; die Quellenliste; der
Kasten „So ist diese Seite entstanden“ (siehe unten); Verweis auf die
Belegseite und auf die kommenden Teile 2 bis 6.

Die Seite soll jemand ohne Vorwissen in zehn Minuten lesen können.
Schreibe kurze Sätze. Erkläre jeden Fachbegriff beim ersten Auftreten.

## P4-B · Die Belegseite

Nüchtern, vollständig, zitierbar — für alle, die nachprüfen wollen.

1. Kurzfassung: die Kernaussagen von Teil 1, jede mit Status und Konfidenz.
2. **Die Aussagen-Tabelle:** alle 87 Aussagen der Freigabeliste mit Status,
   Fundstelle und Quelle; filterbar nach Status.
3. **Die Studien-Vergleichstabelle** (Abschnitt 8 der Freigabeliste), in
   zwei Teilen: Kernzahl am Original gelesen · nicht am Original gelesen.
   Spalten: Herausgeber, Auftraggeber, was sie misst, Zeitraum, Summe, pro
   Jahr, Anteil am BIP. Sortierbar. Dazu eine Grafik, die alle Studien nach
   den drei Größen ordnet.
4. Gegenüberstellung Zitat und Quelle im Wortlaut (kurze Zitate mit
   Fundstelle): R21 gegen Kurzinformation; Netzkosten gegen DIHK/Frontier.
5. Alle zwölf Pflicht-Gegenpositionen in voller Länge.
6. Was nicht am Original gelesen ist, und was wir verworfen haben — mit
   Begründung (die verworfenen Zahlen dürfen **hier**, und nur hier, in
   einer Tabelle „verworfen“ genannt werden, klar als verworfen markiert).
7. Wo unsere eigenen Dossiers falsch lagen (Abschnitt 2.9).
8. Was Teil 1 nicht zeigt.
9. Quellenliste mit URL, Datum, Abrufdatum.
10. Der Kasten „So ist diese Seite entstanden“.

## Der Kasten „So ist diese Seite entstanden“ (beide Seiten)

Inhalt aus `energiewende/README.md` und `energiewende/agents/PROTOKOLL.md`,
ohne etwas zu beschönigen: erstellt mit KI-Agenten (Claude); die Phasen
(Recherche, Gegenprüfung durch andere Agenten, Zusammenführung, Freigabe,
Bau, Reviews); die Zahl der Agentenläufe und Token laut Protokoll; was der
Mensch entschieden hat; was nicht gelesen werden konnte; kein Auftraggeber,
keine Finanzierung durch Dritte. Verweise auf die Dateien im Repository
(`https://github.com/Losveratos/PowerBI-Kitchen-/tree/main/energiewende`).
**Keine Modellbezeichnungen** auf der Seite — dort steht „KI-Agenten
(Claude)“; die Aufstellung je Rolle steht im Protokoll.

## Prüfung, bevor du fertig meldest

- `python3 -m http.server` im Repo-Wurzelverzeichnis; Seite mit Playwright
  (ist installiert, `require('playwright')`, `chromium.launch()` ohne
  Optionen) bei 1280 px und 390 px öffnen und ganz durchscrollen.
- Keine Konsolen- und Seitenfehler; kein waagerechtes Scrollen; alle
  `data-v`-Platzhalter gefüllt (kein leerer, kein „undefined“/„NaN“).
- Kein Abruf an einen fremden Host (Netzwerkprotokoll auswerten).
- Im gerenderten Text nach jeder verworfenen Zahl und jeder verbotenen
  Formulierung suchen (auf der Belegseite: nur in der Tabelle „verworfen“).
- Im HTML-Quelltext nach Ziffernfolgen suchen, die keine Jahreszahl,
  Seitenangabe oder kein Aktenzeichen sind — jede einzelne begründen oder
  durch einen Platzhalter ersetzen.
- Bildschirmfotos (hell, dunkel, 390 px) in deinen Scratch-Ordner; nenne die
  Pfade in der Abschlussmeldung.

## Grenzen

Du schreibst nur deine eine HTML-Datei. Nichts an `index.html`,
`beitraege.html`, der Sitemap oder anderen Seiten ändern — verlinkt wird
erst nach den Reviews. Den Datensatz änderst du nicht; fehlt dir eine Zahl
oder ist eine Angabe unklar, steht das in deiner Abschlussmeldung. Kein
`git add`, kein Commit.

Abschlussmeldung: Dateigröße, Aufbau in Stichworten, Ergebnis jeder
Prüfung mit Zahlen, die Liste der im Quelltext verbliebenen Ziffernfolgen
mit Begründung, was du nicht umsetzen konntest.
