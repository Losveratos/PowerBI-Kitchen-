# Was man in 657 Mails findet

> Markdown-Fassung von [newsletter-lupe-post.html](../newsletter-lupe-post.html) · https://datenwgknowledgekitchen.com/newsletter-lupe-post.html · generiert mit scripts/build_md.py — bei Abweichungen gilt die HTML-Fassung.

Post · Newsletter-Analytics

Drei Jahre Newsletter einer bekannten deutschen Beratung, ausgewertet mit Zählregeln und statistischen Gruppen: Takt, Abfolge, Textlänge, Absätze, Zahlen, Großbuchstaben und Wortketten. Keine Bewertung, die Schlüsse zieht jeder selbst.

Von **Michael Tenner** · Stand · **November 2026** · Zeitraum · **August 2023 bis November 2026** · Story · **[14 Akte](../newsletter-lupe-story.html)**

- **79 %**der Mails seit 2024 kamen montags, dienstags oder donnerstags
- **306 → 546 Wörter** je Text im Median, 2023 zu 2025
- **98,2 %**der Absätze bestanden 2026 aus genau einem Satz (2023: 80,7 %)
- **254 von 594** Texten enthalten dieselbe Wortkette mit Link zum Gesprächstermin

## Worum es geht

Seit August 2023 bekomme ich den Newsletter einer bekannten deutschen Beratung für Agenturen und Selbständige. Nach gut drei Jahren lagen 657 Mails in meinem Postfach. Mich hat nicht interessiert, ob die Angebote gut oder schlecht sind, sondern wie diese Textsorte gebaut ist: wann die Mails kommen, in welcher Abfolge, wie lang sie sind, wie sie Absätze, Zahlen und Großbuchstaben einsetzen und welche Wortketten wiederkehren.

Den Absender nenne ich bewusst nicht. Es geht um Muster, nicht um ein Unternehmen. Alles in der Story ist gezählt oder statistisch gruppiert, mit offengelegten Regeln. Wertungen gibt es keine.

## Was die Zählungen zeigen

- **Ein fester Wochentakt.** Seit 2024 kamen 79 % der Mails montags, dienstags oder donnerstags. 66 % der Übergänge folgten genau der Folge Montag → Dienstag → Donnerstag → Montag, also 1, 2 und 4 Tage Abstand.
- **Launch-Wochen rücken zusammen.** In Wochen, in denen dasselbe Angebot mehrfach genannt wird, lag der Abstand zur vorigen Mail im Median bei 19 Stunden, sonst bei 47.
- **Längere Texte, kürzere Absätze.** Ein Newsletter-Text hatte 2023 im Median 306 Wörter in 20 Absätzen, 2025 546 Wörter in 55 Absätzen. Der Anteil der Absätze aus genau einem Satz stieg von 80,7 auf 98,2 %.
- **Kurze Sätze.** Der mittlere Satz hatte 2023 9 und 2025 8 Wörter. Ausrufezeichen je 1.000 Wörter: 1,7 (2023), 7,1 (2025), 5,7 (2026).
- **Zahlen und Versalien.** Rund 21 bis 26 Zahlen je 1.000 Wörter, oft Geldbeträge und Stellenangaben. Häufigste einzeln großgeschriebene Wörter: „JETZT“ (154), „NICHT“ (98), „OHNE“ (35).
- **Weniger Fristwörter.** Frist-, Knappheits- und Zeitwörter sanken von 14,7 auf 9,5 je 1.000 Wörter.
- **Eine Wortkette, immer wieder.** „klicke hier und sichere dir einen termin für dein kostenloses strategiegespräch bei …“ steht in 254 der 594 Newsletter-Texte.

## Gruppen statt Etiketten

Statt Texte von Hand in Kategorien wie „Angst“ oder „Druck“ zu sortieren, habe ich sie rechnen lassen: Wörter und Wortpaare gewichtet (TF-IDF), mit k-means in 8 Textgruppen und 12 Absatz-Themen geteilt. Die Gruppen haben nur Nummern und ihre typischen Wörter. Sie überlappen deutlich (Silhouette 0,04), und mit anderen Startwerten entstehen teils andere Gruppen (Übereinstimmung 0,52 von 1). Die Story sagt das offen: Die Gruppen sind eine Lesehilfe, keine Kategorien.

Wo eine Zählung nach Muster aussieht, steht der Zufall daneben. Ein Absatz mit Problemwörtern, auf den ein Angebotsabsatz folgt, kommt in 26 % der Texte vor. Bei zufällig gemischten Absätzen wären 34 % zu erwarten. Eine feste Abfolge zeigt diese Zählung also nicht, und so steht es auch in der Story.

## Was die Daten nicht können

- **Ein Postfach.** Was andere Empfänger bekommen, weiß ich nicht. Ich habe nie reagiert; solche Empfänger bekommen oft andere Strecken als Kunden.
- **Keine Wirkung.** Keine Öffnungen, keine Klicks, keine Käufe, keine Aussagen über Absichten oder Kunden.
- **Kein Vergleich.** Ohne andere Newsletter mit denselben Regeln lässt sich nicht sagen, ob ein Wert hoch oder niedrig ist.

## Selbst bauen

Gebaut habe ich das mit Claude Code, einem KI-Agenten im Terminal. Das Rezept funktioniert mit jedem eigenen Postfach:

1. **Mails holen.** Per IMAP mit App-Passwort in eine SQLite-Datenbank: Datum, Uhrzeit, Betreff, Text. Eigene Adresse und Tracking-Kennungen vor dem Speichern entfernen.
2. **Doppelte raus.** Gleiche Kampagnenkennung binnen einer Stunde zählt einmal; erneut verschickte Texte erkennen und für Jahresvergleiche nur einmal zählen.
3. **Zählregeln festschreiben.** Absatz, Satz, Versalwort, Zahl, Wortliste. Jede Regel steht im Code und in der Story.
4. **Gruppieren.** scikit-learn: TF-IDF, k-means, t-SNE für die Karte. Stabilität mit anderen Startwerten prüfen.
5. **Grundlinie und Gegenlesen.** Jedes Muster gegen Zufall prüfen und die fertige Story von einem zweiten Modell mit Rollen wie Statistikerin, Medienanwältin und Leserin gegenlesen lassen.

```
Lade alle Mails des Absenders per IMAP in eine SQLite-Datenbank. Entferne meine Adresse und alle Tracking-Kennungen, bevor du etwas speicherst. Jede Zahl, die du mir nennst, kommt per SQL aus der Datenbank, und zu jedem Muster rechnest du aus, was bei Zufall zu erwarten wäre.
```

## Wer schreibt

Ich bin Power-BI-Berater bei der Daten-WG. Ich war nie Kunde dieses Absenders und habe keine Geschäftsbeziehung zu ihm. Marketing- oder Vertriebsberatung biete ich nicht an. Ich habe nichts gekauft, kein Gespräch gebucht und auf keine Mail geantwortet.

[Zur Story mit 14 Akten](../newsletter-lupe-story.html) [Video als MP4](../assets/posts/newsletter-lupe/newsletter-teaser.mp4)

Korrekturen und Hinweise: michael.tenner84@gmail.com · Markdown: [Story als Markdown](../md/newsletter-lupe-story.md)

---

## Weiterlesen

- HTML (maßgeblich): https://datenwgknowledgekitchen.com/newsletter-lupe-post.html
- Story: [newsletter-lupe-story.html](../newsletter-lupe-story.html) · [newsletter-lupe-story.md](newsletter-lupe-story.md)
