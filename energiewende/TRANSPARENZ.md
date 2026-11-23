# Transparenz-Richtlinien · Daten-WG Knowledge Kitchen

**Stand:** Entwurf v0.2 vom 23.11.2026, zur Freigabe durch Michael. Geändert gegenüber v0.1:
Abschnitt 2 (zwei getrennte Angaben je Zahl), Abschnitt 4 (keine Ausnahme für Prozesszahlen),
Abschnitt 8 (Freigabe vor dem Bau). Anlass: die Reviews von Teil 1.
Zusammengeführt aus den gelebten Regeln der Projekte `strommix/` und `eauto/`,
ergänzt um Quellentreue, KI-Offenlegung und Korrekturpraxis. Gilt zuerst für
die Energiewende-Reihe; nach Freigabe für alle Daten-Geschichten der Kitchen.

## 1. Prämissen stehen vorn

Jedes Stück nennt am Anfang, was es als gegeben setzt und nicht neu verhandelt.
Wer die Prämissen nicht teilt, soll das vor der ersten Zahl wissen.

## 2. Jede Zahl hat eine Herkunft

Zu jeder Zahl gehören: Quelle, URL, Veröffentlichungsdatum, Abrufdatum,
Fundstelle (Seite, Tabelle oder Abschnitt), Konfidenzstufe und die Angabe, ob
wir das Primärdokument selbst gelesen haben.

| Stufe | Bedeutung |
|---|---|
| **A** | Aus mehreren unabhängigen Quellen übereinstimmend belegt |
| **B** | Aus einer Quelle belegt, plausibel, nicht gegengeprüft |
| **C** | Kursiert, Primärquelle nicht auffindbar oder nicht prüfbar |

`primaer_gelesen: ja/nein` ist ein eigenes Pflichtfeld. Eine Zahl, die nur aus
einem Suchtreffer-Auszug stammt, kann nie Stufe A sein.

**Zwei getrennte Angaben je Zahl.** Eine Zahl korrekt zu zitieren heißt nicht,
dass sie stimmt. Auf den Seiten trägt deshalb jede Zahl zwei Abzeichen:

| Angabe | Bedeutung |
|---|---|
| **Zitat geprüft** | Die Zahl steht so im genannten Dokument, an der genannten Stelle; wir haben sie dort selbst gelesen. Sagt nichts darüber, ob sie zutrifft. |
| **Wert: A / B / C** | Wie gut der Wert selbst belegt ist, nach der Tabelle oben. |
| **Wert: Behauptung** | Das Dokument nennt die Zahl ohne nachprüfbaren Beleg, oder der genannte Beleg trägt sie nicht. |
| **Wert: eigene Rechnung** | Wir haben die Zahl aus belegten Eingangswerten errechnet; der Rechenweg ist offen. |
| **Wert: Setzung (M)** | Eigene Annahme. |

Stufe A gibt es nur bei mehreren unabhängigen Quellen. Zweitquellen (eine
Quelle berichtet über eine andere, die wir nicht gelesen haben) sind höchstens
C, gleich ob die Zweitquelle ein Institut, ein Parlament oder eine Zeitung ist.

## 3. Quellentreue

Wir geben eine Quelle so wieder, wie sie es sagt: gleiche Zahl, gleiche
Abgrenzung (brutto oder Mehrkosten, Zeitraum, Preisbasis), gleicher Urheber.
Wenn eine Quelle nur andere Studien referiert, schreiben wir die Zahl der
Ursprungsstudie zu, nicht dem Referat.

## 4. Keine Zahl im HTML, die nicht aus `data/` kommt

Seiten laden ihre Zahlen aus `data/*.json`. Diese Dateien entstehen per Skript
aus den Dossiers. Wer eine Zahl ändert, ändert sie im Dossier.
Das gilt auch für Zahlen über den eigenen Prozess (Agentenläufe, Token,
Zahl der geprüften Werte) und für die Texte der Aussagen: Auch sie stehen im
Datensatz, nicht von Hand in der Seite. Eine Seite behauptet nur dann „keine
Zahl von Hand“, wenn ein Prüfskript das bestätigt hat.

## 5. Bandbreiten, Setzungen, Rechenweg

- Bandbreiten statt Punktwerte, wo die Datenlage streut.
- Eigene Annahmen heißen „Setzung (M)“ und sind als solche markiert.
- Der Rechenweg ist reproduzierbar: Skripte im Repo, fester Zufalls-Startwert,
  Testvektoren. Die Seite rechnet beim Laden nach und zeigt das Ergebnis an.
- Kalibrierte Nachstellungen fremder Studien heißen so und nicht „die Studie“.

## 6. Gegenpositionen und Grenzen

- Jede Kernaussage bekommt die stärkste Gegenposition, die wir finden.
- Jedes Stück hat ein Kapitel „Was diese Rechnung nicht zeigt“.
- Wo das Modell irrt, sagen wir, in welche Richtung es vermutlich irrt.

## 7. Gleiche Messlatte für alle

Fremde Studien werden nach festen, vorab veröffentlichten Kriterien bewertet
(`docs/01_messlatte.md`) — unabhängig davon, ob uns ihr Ergebnis passt.
Auftraggeber und Finanzierung nennen wir bei jeder Studie. Unser eigenes
Stück wird nach denselben Kriterien bewertet, von einem Prüfer, der an der
Erstellung nicht beteiligt war. Das Ergebnis wird veröffentlicht, auch wenn es
schlecht ausfällt.

## 8. KI-Offenlegung

- Die Stücke entstehen mit KI-Agenten (Claude). Das steht auf jeder Seite.
- Veröffentlicht werden: Rollen, eingesetztes Modell je Rolle, die Briefings im
  Wortlaut, Laufzeit und Token-Verbrauch je Agent.
- Veröffentlicht wird auch, was der Mensch entschieden hat (Entscheidungstabelle
  im README) und was die Agenten ohne Rückfrage gesetzt haben.
- Kein Agent prüft sein eigenes Ergebnis ab. Gegenprüfung und Reviews laufen
  mit Agenten, die den geprüften Text nicht geschrieben haben.
- Was nicht geprüft werden konnte (gesperrte Quelle, Bezahlschranke), steht als
  offener Punkt im Stück, nicht nur intern.
- Bau-Agenten schreiben keine eigenen Tatsachensätze. Jeder tragende Satz
  einer Seite stammt aus der Freigabeliste; fehlt einer, wird er dort
  nachgetragen und geprüft, nicht auf der Seite ergänzt.
- Die Freigabeliste wird selbst gegengelesen, bevor gebaut wird — auch von
  einem Agenten, der das geprüfte Papier verteidigt.

## 9. Interessen

Die Kitchen nennt, wer hinter dem Stück steht und ob es Auftraggeber oder
Geldgeber gibt. Für die Energiewende-Reihe gibt es keinen Auftraggeber und keine
Finanzierung durch Dritte (bestätigt von Michael am 22.11.2026).

## 10. Reviews sind öffentlich

Persona-Reviews und adversariale Reviews liegen im Repo, mit allen Befunden.
Nicht umgesetzte Befunde bleiben sichtbar und bekommen eine Begründung.

## 11. Korrekturen

Fehler werden sichtbar korrigiert: Eintrag im Prozess-Log mit Datum, alter und
neuer Aussage. Die Git-Historie ist öffentlich und bleibt ungeschönt.

## 12. Fremde Inhalte

- Inhalte hinter Bezahlschranken geben wir nicht wieder.
- Zitate sind kurz und tragen eine Quelle.
- Fremde PDFs spiegeln wir nicht; im Repo stehen URL, Prüfsumme und Abrufdatum.
- Offene Daten übernehmen wir mit Lizenz- und Quellenangabe.
