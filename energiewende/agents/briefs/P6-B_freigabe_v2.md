# Auftrag P6-B · Freigabeliste v2 und vollständiger Datensatz für Teil 1

**Modell:** Opus · **Ergebnis:** `energiewende/docs/03_teil1_freigabe.md`
(v2, überschreibt v1; die v1 bleibt in der Git-Historie),
`energiewende/scripts/build_teil1_data.py` (erweitert),
`energiewende/data/teil1_data.json` (neu gebaut),
`energiewende/docs/04_anfrage_r21_entwurf.md`
**Regeln:** `energiewende/agents/REGELN.md`, `energiewende/TRANSPARENZ.md`
(v0.2 — lies Abschnitt 2 und 8 genau)

## Ausgangslage

Dreizehn Reviews haben Teil 1 geprüft; die Synthese
`energiewende/research/reviews_teil1/00_synthese.md` bündelt 123 Punkte und
nennt neun Verfahrensfehler. Der wichtigste: **Die Freigabeliste v1 war an
tragenden Stellen selbst fehlerhaft und hat vorhandenes Material
weggelassen.** Du schreibst die v2 — nicht als Flickwerk, sondern so, dass
die Seiten danach allein aus dem Datensatz gebaut werden können.

Lies zuerst: die Synthese ganz (Zusammenfassung, Tabelle, Widersprüche,
Verfahrensfehler V1–V9, Arbeitspakete AP1 und AP2, den json-Block
`arbeitsliste`), dann die v1 der Freigabeliste, dann die Entscheidungen in
`energiewende/README.md`. Die 13 Einzelberichte liegen daneben; schlage dort
nach, wo die Synthese knapp ist.

## Entscheidungen von Michael (gelten, nicht neu verhandeln)

- **Zwei Abzeichen je Zahl** (TRANSPARENZ Abschnitt 2): „Zitat geprüft“
  getrennt von der Konfidenz des Werts (A · B · C · Behauptung · eigene
  Rechnung · Setzung). Stufe A nur bei mehreren unabhängigen Quellen.
  Zweitquellen höchstens C.
- **BIP-Bezug:** beide Rechnungen — festes BIP 2024 und wachsendes BIP
  (Wachstumsannahme als Setzung (M), offen ausgewiesen, mit Bandbreite) —,
  dazu die Prozentangaben, die die Studien selbst nennen.
- **Länge:** Der Befund steht im Vorspann der Story. Gegenpositionen in der
  Story je zwei Sätze mit Verweis; in voller Länge auf der Belegseite. Neue
  Inhalte vorrangig auf die Belegseite; in die Story nur, was eine
  Kernaussage ändert. Lege je Aussage fest, wohin sie gehört
  (`ort`: story · belege · beide).
- **ZEW:** die 824 Mrd. € aus der Studie nennen, mit Hinweis auf deren
  Uneinheitlichkeit; keine eigene „richtige“ Zahl als Ergebnis.
- **Kernkraft-Neubau:** kurzer Hinweis in Teil 1, volle Rechnung in Teil 6.
  Das Etikett „gebaute Projekte“ ist falsch und gestrichen: Es sind
  westliche Referenzprojekte, überwiegend geplant oder im Bau, gemischt
  abgegrenzt.
- **Klimafolgekosten:** ein Kasten mit Vorbehalt (Untergrenze, nicht
  addierbar); dazu, als Folge der Reviews, ein Satz zur Gegenrechnung, die
  einzelne Studien selbst vornehmen. Keine Überschrift „Nichtstun“, der
  R21-Pfad wird nicht mit Nichtstun gleichgesetzt.
- **Veröffentlichung und Anfrage an R21** sind zurückgestellt, bis die Reihe
  steht. **PwC-Studie und FAZ-Gastbeitrag** bleiben ungelesen; die Sätze
  dazu tragen den Vorbehalt.
- Kein Name des BILD-Autors; der Förderhinweis nur im Steckbrief; neue
  R21-Treffer als Zusatz in bestehenden Kästen, nicht als 13. Kasten.

## Aufgaben

1. **Jeden Punkt der Klassen A und B aus der Arbeitsliste abarbeiten** und
   in einer Tabelle am Ende der Freigabeliste nachweisen: Punkt → was in v2
   geändert wurde (oder warum nicht). Kein Punkt bleibt ohne Zeile.
2. **Jede neue oder geänderte Aussage selbst am Original nachschlagen**
   (`energiewende/quellen/raw/`), mit Fundstelle. Übernimm keine Zahl aus
   einem Review ungeprüft; Überschläge der Reviewer sind Setzungen, bis du
   sie nachgerechnet hast. Was nicht unter `quellen/raw/` liegt und auf
   einem freigegebenen Host steht, darfst du nachladen (Form des Abrufs in
   den Regeln; eigenes Manifest `quellen/manifest_P6-B.json`).
3. **Die tragenden Korrekturen** (alle in der Synthese belegt):
   - R21s Kapitalstock-Argument richtig wiedergeben (es wird gebaut, aber
     Ersatz ohne Mehrproduktion) und das Gegenargument nennen (ohnehin
     fällige Ersatzinvestitionen; eingesparte Brennstoffkäufe).
   - Die unscharfe Bezeichnung „Kosten der Energiewende“ steht schon in der
     Kurzinformation; fair verteilen, was auf R21 und was auf den
     Wissenschaftlichen Dienst geht.
   - R21s eigene Systemzahl (8,2 ct/kWh, Factsheet B) und der Vergleichswert
     derselben Quelle aufnehmen; „R21 beziffert den eigenen Kurs nicht“
     entsprechend einschränken.
   - R21s Batterierechnung (1,4 Bio. €) aufnehmen, mit dem vollständigen
     freigegebenen Schluss.
   - Mehrinvestitionen und Mehrkosten in **allen** Sätzen und Grafik-Angaben
     sauber trennen; R21s Brutto-Summe nicht in ein Mehrkosten-Bild.
   - Unsicherheit in beide Richtungen, mit Belegen.
   - Die 109 Tage mit ihren Einschränkungen (Resterzeugung, Inselrechnung,
     Original ungelesen).
   - Strompreis: nach Verbrauchsband und vor/nach Steuern; Netzentgelte.
   - Netzentwicklungsplan 2025: anderer Umfang, nicht gesunkene Preise;
     Engpassmanagement, wo R21 recht hat.
   - Nutzenseite der Studien (ISE 2021 mit gegengerechneten Klimaschäden,
     Ariadne); der nicht freigegebene „aufrechnen“-Satz entfällt.
   - Abzinsung: welche Summen abgezinst sind und welche nicht.
   - Die Zählung der Zahlen im R21-Haupttext (39 gegen 37) am Original
     klären, sodass sie aufgeht.
4. **Das Papier verteidigen, bevor du freigibst:** Lies jede Aussage über
   R21 gegen die Stelle im Original und frage: Würde der Autor sagen, das
   habe ich so geschrieben? Führe am Ende eine Liste der Stellen, an denen
   du v1 zugunsten von R21 geändert hast — und eine der Stellen, an denen
   R21s Darstellung auch in der stärksten Lesart nicht trägt.
5. **Datensatz-Schema erweitern** (Verfahrensfehler V3, V4, V5) und
   `build_teil1_data.py` anpassen. Der Datensatz enthält danach alles, was
   auf den Seiten als Tatsache steht:
   - `claims`: je Aussage `id`, **`text`** (der Satz, wie er auf der Seite
     stehen darf, mit Platzhaltern `[[zahl-id|format]]` für Zahlen),
     `status`, `ort`, `quelle`, `fundstelle`, `vorbehalt` (Pflichtsatz, falls
     nicht prüfbar).
   - `zahlen`: je Zahl zusätzlich `zitat_geprueft` (true/false) und
     `wert_konfidenz` (A · B · C · Behauptung · eigene Rechnung · Setzung),
     `art` (Zitat · Statistik · eigene Rechnung · Setzung), bei eigenen
     Rechnungen `rechenweg` und `eingaben`.
   - Studien: je Studie die eigene Prozentangabe (falls vorhanden),
     Preisbasis, abgezinst ja/nein, Systemgrenze; Anteil am BIP in beiden
     Rechnungen.
   - `gegenpositionen`: je Kasten Kurzfassung (zwei Sätze, Story) und
     Langfassung (Belegseite), jeweils als Text mit Platzhaltern.
   - `schritte`: je Erzählschritt der Text und die Grafik-Angaben.
   - `quellen`: je Quelle Titel, Herausgeber, Datum, URL, Abrufdatum,
     Auftraggeber — vollständig für alle.
   - `prozess`: die Zahlen aus `agents/PROTOKOLL.md` (Läufe, Token je
     Phase, geprüfte Werte, Befunde, Richtungsbilanz, Messlatten-Punkte
     nach v1.0).
   - `korrekturen_eigene`: wo unsere Dossiers, die Freigabe v1 und die
     Seiten falsch lagen, mit Richtung.
   Das Skript prüft: jeder Platzhalter verweist auf eine vorhandene Zahl;
   Stufe A nur mit mindestens zwei Quellen; jede nicht prüfbare Aussage hat
   einen Vorbehalt; jede Quelle hat URL und Abrufdatum oder den Vermerk,
   warum nicht; keine verworfene Zahl in einem Text; IDs eindeutig. Es
   bricht mit einer lesbaren Meldung ab, wenn eine Prüfung scheitert.
6. **Regeln für die Seiten** als Abschnitt in der Freigabeliste: was die
   Bau-Agenten dürfen (Übergangssätze ohne Tatsachengehalt, Überschriften,
   Bedienhinweise) und was nicht (jeder Tatsachensatz kommt aus `claims`).
7. **Entwurf der Anfrage an R21** in `docs/04_anfrage_r21_entwurf.md`:
   sachlich, kurz, fünf Fragen, keine Wertung, Platzhalter für Frist und
   Absender. Oben der Vermerk: „Entwurf. Nicht versendet. Zurückgestellt,
   bis die Reihe fertig ist (Entscheidung vom 23.11.2026).“

## Grenzen

Du änderst die beiden HTML-Seiten **nicht** — das machen die Bau-Agenten
danach aus deinem Datensatz. Du änderst nicht README, TRANSPARENZ,
Messlatte oder die Reviews. Kein `git add`, kein Commit.

Abschlussmeldung: Zahl der Aussagen je Status und Ort; Zahl der Zahlen je
`wert_konfidenz`; wie viele Punkte der Arbeitsliste umgesetzt, wie viele
begründet nicht; die Liste der Änderungen zugunsten von R21; was sich nicht
klären ließ; Ergebnis der Skript-Prüfungen.
