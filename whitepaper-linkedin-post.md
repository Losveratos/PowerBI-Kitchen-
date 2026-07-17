# LinkedIn-Post · Einstieg zum Thesenpapier

> **Finalfassung zum Kopieren** — geplant: 17.07.2026, 8:00 Uhr.
>
> **Publish-Checkliste (vorher, ~10 Minuten):**
> 1. Branch `claude/inspired-ibcs-power-bi-visual-h04y05` in `main` mergen,
>    damit die Links unten stabil sind (sonst Branch-Links verwenden).
> 2. Optional: `whitepaper-ki-entwicklung-roi.html` auf
>    datenwgknowledgekitchen.com legen und den PDF-Link im Post durch die
>    Domain-URL ersetzen — eigene Domain wirkt seriöser als GitHub.
> 3. Bild anhängen: `whitepaper-assets/social-cover.png` (Deckblatt) oder
>    `social-prozess.png` (Prozessvergleich, Querformat — auf LinkedIn
>    meist stärker).
> 4. Nach dem Posten: den Kommentar-Baustein unten als ersten eigenen
>    Kommentar setzen.
>
> Link-Varianten (falls kein Merge/Deploy vor 8 Uhr):
> - PDF: `https://github.com/Losveratos/PowerBI-Kitchen-/blob/claude/inspired-ibcs-power-bi-visual-h04y05/whitepaper-ki-entwicklung-roi.pdf`
> - Repo: `https://github.com/Losveratos/PowerBI-Kitchen-`

---

Zehn Tage. 124 Commits. Ein marktfähiges Power-BI-Visual.

Klassisch geschätzt: 14–18 Personenmonate, 150.000–350.000 €.
Tatsächlich investiert: ~20 dokumentierte Steuerungsstunden + 180 € Werkzeugkosten.

Ich habe das nicht als Erfolgsstory aufgeschrieben, sondern als empirisch gestütztes Thesenpapier:

▪ jede Zahl aus der öffentlichen Git-Historie nachrechenbar
▪ Bewertung nach anerkannten Verfahren (COCOMO II, Function Points, DCF, Lizenzpreisanalogie)
▪ jede Aussage mit Evidenz-Label: gemessen · Annahme · Schätzung · Hypothese
▪ inklusive der Gegenrechnung, die meinen eigenen Kostenhebel von 161× auf ehrliche 13× drückt

Die eigentliche These ist nämlich nicht „KI ist schnell":

Feste Frameworks reduzieren die Freiheitsgrade so weit, dass KI-Entwicklung kontrollierbar und reproduzierbar wird. Die Formel lautet KI × Framework × Domänenexpertise × Git — nicht KI allein.

Und die Konsequenz ist ökonomisch: Wenn der Nachbau von Framework-Software plötzlich Tage statt Monate kostet, gehört jede Build-vs.-Buy-Entscheidung — und manche Lizenzverhandlung — auf den Prüfstand.

Was das Papier NICHT behauptet: dass KI Entwickler ersetzt, dass jede Software in zehn Tagen entsteht, oder dass ein Einzelfall einen Markt beweist. Es zeigt einen vollständig dokumentierten Fall — und lädt ausdrücklich zum Widerlegen ein.

📄 34 Seiten, mit allen Rechenwegen: [LINK ZUM PDF/HTML]
🔓 Quellcode & Historie öffentlich: [LINK ZUM REPO]

Replikationen, Kritik, Rückfragen — gern hier in den Kommentaren oder direkt an mich.

#PowerBI #KI #GenAI #Controlling #BuildVsBuy #OpenSource #IBCS #BusinessIntelligence

---

## Varianten-Baustein für den ersten Kommentar (eigener Kommentar unter dem Post)

Die drei Zahlen, nach denen am häufigsten gefragt wird:

1. Kostenhebel symmetrisch gerechnet (gleicher Leistungsumfang beider Seiten): 13–93×
2. Break-even gegen kommerzielle Visual-Lizenzen: ab ~30–45 Report-Nutzern
3. Sensitivität: Selbst bei 6× mehr Steuerungsstunden bleibt Faktor ≥ 5

Methodik, Annahmen und Grenzen stehen alle im Papier — Anhang B rechnet jede Zahl vor.


---

# Variante B — Dokument-Post (PDF hängt direkt am Post) · „Wochenend-Read"

> Empfohlen für Freitag 8:00. PDF über „Dokument hinzufügen" hochladen
> (nicht verlinken), Dokumenttitel: „Zehn Tage bis zum marktfähigen Stand".
> Repo-Link in den ersten Kommentar.

Wochenend-Lektüre, wer mag: Ich habe dokumentiert, wie weit man mit KI-gestützter Entwicklung bei Power BI wirklich kommt. Das ganze Papier hängt als PDF an diesem Post. Wem 34 Seiten zu viel sind, hier die Kurzfassung.

Ich habe in zehn Tagen ein Power-BI-Visual gebaut, das man ernsthaft benutzen kann. Zwölf Diagrammtypen, Controlling-Tabelle mit Hierarchie, vier Sprachen. Hätte ich das klassisch beauftragt, wäre ich nach meiner Schätzung bei 14 bis 18 Personenmonaten gelandet, irgendwo zwischen 150.000 und 350.000 Euro. Tatsächlich gekostet hat es mich rund 20 dokumentierte Stunden Steuerung und 180 Euro für Werkzeuge.

Was ich dabei gelernt habe:

Es liegt nicht an der KI allein. Es funktioniert, weil vier Dinge zusammenkommen: KI, ein festes Framework, Fachwissen und Git. Fehlt eins davon, kippt das Ganze.

Feste Frameworks wie Power-BI-Visuals, Office-Add-ins oder dbt-Pakete engen den Lösungsraum so ein, dass KI-Entwicklung kontrollierbar und wiederholbar wird. Das halte ich für die eigentliche Erkenntnis aus den zehn Tagen. Und sie bleibt gültig, wenn die nächste Modellgeneration kommt.

Ohne Versionskontrolle wäre das alles nichts wert gewesen. Erst Git macht die Arbeit prüfbar und rückholbar. Alle 124 Commits des Projekts sind öffentlich, jeder kann nachschauen, was wann warum passiert ist.

Zu den Zahlen: Ehrlich gerechnet, also mit gleichem Leistungsumfang auf beiden Seiten, bleibt ein Faktor von 13 bis 93 zwischen meinem Einsatz und dem klassischen Nachbau. Die Gegenrechnung gegen meine eigene Schlagzeile steht mit im Papier. Und ab etwa 30 bis 45 Report-Nutzern lohnt sich der Eigenbau gegenüber der Lizenz nach Barwert.

Was das Papier nicht sagt: dass KI Entwickler ersetzt, dass jede Software in zehn Tagen entsteht, oder dass ein einzelner Fall einen Markttrend beweist. Es ist ein Fall, sauber dokumentiert, mit offengelegten Annahmen. Jede Aussage ist markiert als gemessen, Annahme, Schätzung oder Hypothese.

Wer nachrechnen oder widersprechen will: gern. Genau dafür ist es geschrieben.

Schönes Wochenende.

#PowerBI #Controlling #KI #BuildVsBuy
