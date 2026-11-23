# Energiewende-Reihe · Ist eine Transformation mit Erneuerbaren und Speichern tragfähig?

Sechsteilige Reihe mit Rechenmodellen zur Frage:
**Trägt eine Energie-Transformation mit Erneuerbaren und Speichern — bei Kosten,
Versorgungssicherheit, CO₂-Budget und Abhängigkeiten — und wie schneidet sie
gegen die Alternativen ab?**

Anlass: BILD, 20.11.2026, „Deutschland wird Energiewende ‚nicht überleben‘“
(Autor Oskar Luis Bender), gestützt auf die „Erklärung des Expertenrates
Klima- und Energiepolitik“ der Denkfabrik R21 (November 2026, 59 Seiten).
Der BILD-Text liegt hinter BILDplus; wir zitieren nur Überschrift und frei
lesbaren Teaser und prüfen am R21-Original.

Zweites Ziel der Reihe: offen zeigen, wie weit sauber aufgesetzte KI-Agenten
bei so einem Thema kommen — und das mit derselben Messlatte belegen, die wir
an fremde Studien anlegen (`docs/01_messlatte.md`).

## Prämissen (fix)

1. **Der Klimawandel ist real und menschengemacht; CO₂ soll reduziert werden**
   (IPCC AR6). Wird belegt, aber nicht neu verhandelt.
2. **Energie ist eine Hauptressource für den Erfolg einer Volkswirtschaft.**
   Bezahlbarkeit und Versorgungssicherheit sind gleichrangige Ziele, keine
   Nebenbedingungen.
3. **Hauptpfad Erneuerbare + Speicher, mit Gegenrechnung.** Der Hauptpfad wird
   mit demselben Modell und denselben Kostenquellen gegen die Alternativen
   gerechnet. Das Ergebnis darf gegen den Hauptpfad ausfallen.
4. **Transparenz-Richtlinien** gelten vollständig: `TRANSPARENZ.md`.

## Entscheidungen (Michael, 22.11.2026, fortlaufend)

| Thema | Entscheidung |
|---|---|
| Haltung | EE + Speicher als Hauptpfad, R21-Pfad wird gegengerechnet |
| „Tragfähig“ heißt | Kosten · Versorgungssicherheit · CO₂-Budget · Abhängigkeit (alle vier gehen ins Urteil ein; Schwellenwerte noch offen) |
| Referenzszenarien | Fossil weiter + CO₂-Preis · R21-Pfad (Kernkraft, Gas + CCS, EU-ETS) · aktueller Regierungspfad |
| Systemgrenze | Gesamtsystem als Jahres-Energiebilanz, Stromsektor stündlich |
| Europa | Erst Kuppelkapazität als Regler, im Europa-Teil ein Mehr-Zonen-Modell |
| Lieferketten | Quantitativ mit Stresstest „China liefert nicht“, Vergleich mit fossiler Abhängigkeit |
| Lkw, H₂, E-Fuels | Pkw elektrisch gesetzt, Flug mit E-Fuels; Lkw-Anteil Batterie/H₂ und Importanteile sind Regler |
| Modellbasis | `strommix/` erweitern, dessen Lücken zuerst schließen |
| KI-Vergleich | Feste Messlatte für alle Studien und für uns selbst, bewertet von einem unabhängigen Prüf-Agenten |
| Agenten | Volle Offenlegung (Rollen, Modelle, Briefings, Laufzeit, Token); großer Lauf erlaubt |
| Reviewer | 7 Strommix-Personas + R21-Verteidiger + Industrie-Energieeinkäufer + Netzbetreiber + Ökonom |
| Termin, Sprache | Kein Zeitdruck; Deutsch zuerst |
| BILD | Nur Überschrift und Teaser, geprüft wird am R21-Original |
| Quellenzugriff | Erlaubnisregeln in `.claude/settings.json` für die freigegebenen Hosts |
| Gaspreis-Regler | 20 / 35 / 85 €/MWh (min / mid / max), Vorschlag aus Dossier 09, bestätigt |
| Kernkraft-Neubaukosten | Szenario „R21 wie veröffentlicht“ (6.250 €/kW) neben der Spanne aus westlichen Referenzprojekten (7.500 / 12.000 / 17.500 €/kW), bestätigt. **Korrigiert am 23.11.2026:** Hier stand „aus gebauten Projekten“. Das war falsch — die Referenzprojekte sind überwiegend geplant oder im Bau, und ihre Kostenangaben sind gemischt abgegrenzt (teils mit Finanzierung). Gefunden im Review 06. |
| ZEW-Zahl | Die Reihe nennt die 824 Mrd. € aus der Studie, mit Hinweis auf deren Uneinheitlichkeit; keine eigene „richtige“ Zahl |
| Kernkraft-Reaktivierung | Mitte 2,7 GW (Isar 2, Emsland), oberes Ende rund 12 GW laut Radiant-Gutachten, sobald im Original gelesen |
| Dunkelflauten-Definition | Ereignisse über das Tagesmittel, Speicherbedarf über die Energielücke; das strenge Stundenkriterium als günstigste Lesart daneben |
| Stresstest China | Zwei Stufen getrennt: Rückkehr vom Überkapazitätspreis auf den Mindestpreis, dann der Aufschlag für Ware außerhalb Chinas |
| Setzungen Wasserstoff | An geprüfte Quellen anpassen; die bisherige Setzung bleibt oberes Ende der Bandbreite |
| Führende Energiebilanz | AG Energiebilanzen; Eurostat als Abgleich und für internationale Vergleiche |
| Solarleistung | einheitlich gegen die Modulleistung, wie in den Stundenprofilen |
| Interessen | Kein Auftraggeber, keine Finanzierung durch Dritte — bestätigt |
| PwC-Studie, ifo-Gastbeitrag | „später“: Teil 1 weist bis dahin offen aus, dass beide Originale nicht gelesen wurden |
| Reihenfolge | Korrekturen einarbeiten, Parameter zusammenführen, dann Teil 1 bauen und durch die Reviewer schicken |
| Teil 1 · Format | Scroll-Story plus Belegseite |
| Teil 1 · Anfrage an R21 | nach den Reviews, vor der Veröffentlichung; Antwort oder Nicht-Antwort wird auf der Seite vermerkt |
| Teil 1 · Kernkraft-Neubau | kurzer Hinweis in Teil 1, die volle Rechnung in Teil 6 |
| Teil 1 · Klimafolgekosten | ein Kasten mit Vorbehalt (Untergrenze, nicht addierbar) |
| Teil 1 · übernommene Vorschläge der Freigabeliste (nicht einzeln bestätigt) | BIP-Bezug 2024 für die Studientabelle, 2025 nur für R21s eigene Umrechnung · der ifo-Auszug höchstens als Fußnote · kein Name des BILD-Autors auf der Seite · der Förderhinweis nur im Steckbrief, gleichrangig mit den Auftraggebern der Studien |
| Veröffentlichung | Nichts wird veröffentlicht, bis die ganze Reihe steht; alles bleibt bis dahin Entwurf im Repository (23.11.2026) |
| Anfrage an R21 | zurückgestellt, bis die Reihe fertig ist; der Entwurf der Fragen liegt in der Synthese der Reviews |
| PwC-Studie | Michael lädt sie hoch, wenn er so weit ist; bis dahin tragen die PwC-Aussagen den Vorbehalt |
| Konfidenz-Abzeichen | zwei getrennte Angaben je Zahl: „Zitat geprüft“ (steht so im genannten Dokument) und die Konfidenz des Werts selbst (A, B, C oder „Behauptung, nicht belegt“) |
| Länge von Teil 1 | Story straffen, Befund in den Vorspann, Gegenpositionen in der Story kurz mit Verweis; neue Inhalte vorrangig auf die Belegseite |
| BIP-Bezug | beide Rechnungen zeigen: festes BIP 2024 und wachsendes BIP (Wachstumsannahme als Setzung), dazu die Prozentangaben der Studien selbst |
| Messlatte | präzisieren, mit Datum und Grund im Änderungsteil; die Seite zeigt die Wertung nach ursprünglicher und nach präzisierter Fassung |

## Die Reihe

| Teil | Thema | Kernfrage |
|---|---|---|
| 1 | Die 13,8 Billionen | Woher kommt die Zahl, was misst sie, was kostet der Vergleichspfad? |
| 2 | Strom und Speicher | Geht ein EE-Mix über mehrere Wetterjahre auf, und zu welchen Systemkosten? |
| 3 | Europa | Was bringt der Verbund — und was, wenn die Nachbarn gleichzeitig Flaute haben? |
| 4 | Lieferketten | Tauschen wir eine Abhängigkeit gegen eine andere? |
| 5 | Wasserstoff und E-Fuels | Wie viel braucht es für Flug, Schiff, Lkw und Industrie, und woher? |
| 6 | Gesamtrechnung | Die vier Pfade nebeneinander, mit Bandbreiten und Kipp-Punkten |

## Ordnerstruktur

```
energiewende/
├── README.md            ← diese Datei, inkl. Prozess-Log
├── TRANSPARENZ.md       ← Transparenz-Richtlinien (Entwurf zur Freigabe)
├── docs/                ← Messlatte, Modellkonzept, Texte
├── research/            ← Recherche-Dossiers (je Thema eine Datei)
├── data/                ← aufbereitete JSON; data/raw/ (Rohabrufe) nicht im Repo, per Skript wiederherstellbar
├── scripts/             ← Python: fetch / compute / build (reproduzierbar)
├── agents/              ← Regeln, Briefings (wortgleich), Lauf-Protokoll
└── quellen/             ← Manifest (URL, Prüfsumme, Abrufdatum); raw/ nicht im Repo
```

**Regeln:** Keine Zahl landet im HTML, die nicht aus `data/` kommt. Markdown
in diesem Ordner trägt **kein YAML-Frontmatter** (der Pages-Build ist daran
schon einmal gescheitert, siehe `_config.yml`). Fremde PDFs werden nicht
gespiegelt — `quellen/raw/` ist von Git ausgenommen, im Repo steht nur das
Manifest.

## Agenten-Aufstellung

| Phase | Aufgabe | Modell | Warum |
|---|---|---|---|
| 0 | Aufhänger prüfen, Projekt aufsetzen, Briefings schreiben | Fable | Orchestrierung |
| 1 | Zehn Recherche-Dossiers parallel (`agents/briefs/P1-*.md`) | Opus für Quellenkritik und Kostenabgrenzung, Sonnet für Daten- und Parameter-Sammlung | Opus dort, wo genaues Lesen langer Dokumente entscheidet |
| 2 | Gegenprüfung: jede Zahl der Dossiers am Primärdokument nachschlagen | Opus, je Dossier ein Prüfer, der es nicht geschrieben hat | Unabhängigkeit |
| 3 | Modellkonzept, Parameter-Konsolidierung, Modellbau und Validierung | Fable (Konzept), Sonnet (Umsetzung), Opus (Review) | |
| 4 | Seiten bauen (Story + White Paper + Simulator je Teil) | Sonnet, Fable für Dramaturgie | |
| 5 | Messlatte anwenden, Persona-Reviews, Einarbeitung | Opus, je Rolle ein Agent | |

Das Lauf-Protokoll mit Laufzeit und Token je Agent steht in `agents/PROTOKOLL.md`.

## Prozess-Log

| Datum | Phase | Was |
|---|---|---|
| 2026-11-22 | 0 · Setup | Anlass geprüft, 16 Entscheidungen im Dialog getroffen (Tabelle oben). Umgebung um 18 Quell-Hosts erweitert, Erlaubnisregeln in `.claude/settings.json`. Damit ist der Volltext-Abruf erstmals möglich — bei Strommix und E-Auto war er gesperrt. |
| 2026-11-22 | 0 · Aufhänger | `research/00_aufhaenger_r21.md`: R21-Erklärung (59 S.) und Bundestags-Kurzinformation WD 5 – 3000 – 135/24 im Volltext gelesen. Erster Befund: Die zitierte Zahl „10 bis 13,8 Billionen“ steht so nicht in der zitierten Quelle. |
| 2026-11-22 | 0 · Regeln | `TRANSPARENZ.md` (Entwurf v0.1) und `docs/01_messlatte.md` (Kriterien festgelegt, bevor eine Studie bewertet wurde). |
| 2026-11-22 | 1 · Recherche | Zehn Dossier-Aufträge gestartet (`agents/briefs/`). |
| 2026-11-22 | 1 · Korrektur | Dossier 01 hat vier Ungenauigkeiten im Erstbefund `research/00_aufhaenger_r21.md` gefunden (Seitenangaben, eine zu starke Formulierung, eine unsichere Autorenangabe, eine veraltete Konfidenzstufe). Korrigiert, Tabelle „Korrekturen“ im Dokument. Der Kernbefund (13,8 steht nicht in der Quelle) bleibt. |
| 2026-11-22 | 1 · Abschluss | Zehn Dossiers, 453 Parameter. Zweite Host-Freigabe (20 Hosts). |
| 2026-11-22 | 2 · Gegenprüfung | Zehn Prüfberichte in `research/pruefung/`, je Dossier ein Opus-Prüfer, der es nicht geschrieben hat. 428 Werte geprüft: 352 bestätigt, 46 abweichend, 27 nicht prüfbar. Die Daten stimmten fast durchgängig; die Fehler lagen in Ableitungen und Zusammenfassungen — in beide Richtungen (u. a. Stresstest-Aufschlag und Wasserstoff-Lkw zulasten, Speicherkosten und Beharrungs-Mehrkosten zugunsten der Energiewende; zwei Vorwürfe gegen R21 waren zu hart). |
| 2026-11-22 | 3 · Zusammenführung | `scripts/consolidate_params.py` → `data/model_params.json`: 456 Parameter, 151 Korrekturen aus den Prüfberichten (89 angewendet, 58 Textkorrekturen, 4 nicht zugeordnet), 53 Herabstufungen der Konfidenz; nach der Regel „A nur bei mehreren unabhängigen Quellen“ bleiben 16 Parameter auf Stufe A. Bericht: `research/konsolidierung.md`. Die Dossiers tragen einen Verweis auf Prüfbericht und Parametersatz. |
| 2026-11-22 | 3 · Freigabe Teil 1 | `docs/03_teil1_freigabe.md`: 87 Aussagen einzeln eingestuft, Erzählbogen, zwölf Pflicht-Gegenpositionen, verworfene Zahlen und Formulierungen. `scripts/build_teil1_data.py` → `data/teil1_data.json` (65 freigegebene Zahlen). |
| 2026-11-22 | 4 · Seitenbau | `energiewende-1-story.html` und `energiewende-1-belege.html` als Entwurf (noindex, nicht verlinkt). |
| 2026-11-22 | 5 · Reviews | 13 Berichte in `research/reviews_teil1/`: elf Rollen, ein Freigabe-Prüfer, ein Messlatten-Prüfer. 183 Befunde, gebündelt zu 123 Punkten (20 kritisch, 52 mittel, 51 klein); alle 20 kritischen in der Synthese bestätigt. Richtung der 72 kritischen und mittleren Punkte: 22 hätten zulasten von R21 gewirkt, 13 zulasten der Energiewende, 7 zu ihren Gunsten, 30 ohne Richtung. Messlatte (ohne K3, höchstens 18): Teil 1 dieser Reihe 15, KfW/Prognos 13, DIHK/Frontier 11, R21 6. |
| 2026-11-23 | 5 · Lehren | Neun Verfahrensfehler benannt (Synthese, Abschnitt 3): Die Freigabeliste war an tragenden Stellen selbst fehlerhaft und hat vorhandenes Material weggelassen; die Bau-Agenten schrieben nicht freigegebene Sätze; der Datensatz war unvollständig; Konfidenz A wurde falsch verwendet; die Prüfung am Handy war zu dünn; eine Entscheidung trug einen falschen Begriff weiter. Die Regeln für Teil 2 bis 6 werden angepasst. |
| 2026-11-23 | 6 · Überarbeitung | Sieben weitere Entscheidungen von Michael (Tabelle oben). `TRANSPARENZ.md` v0.2 (zwei Abzeichen), Messlatte v1.1 (fünf Präzisierungen mit Datum). Freigabeliste v2 beauftragt. |
| 2026-11-23 | 6 · Neubau | Freigabeliste v2 (150 Aussagen mit Wortlaut, 180 Zahlen mit zwei getrennten Angaben; keine Zahl mehr auf Stufe A). Beide Seiten neu, allein aus dem Datensatz. |
| 2026-11-23 | 6 · Nachprüfung | Fünf unbeteiligte Prüfer (`research/reviews_teil1/runde2/`). Von den 20 kritischen Punkten der ersten Runde 17 behoben, 2 teilweise, 1 zurückgestellt. Quellentreue 12 von 12. Messlatte unabhängig neu: 15 von 18 nach v1.0, 14 von 16 nach v1.1. Die Überarbeitung hatte neue Fehler eingeführt — 9 kritisch, 26 mittel, 41 klein, wieder in beide Richtungen (u. a. ein unbelegter Satz gegen R21; die Prämissen fehlten; R21s Klimaposition nur halb zitiert). Neu: Prüfskript `scripts/check_teil1_seiten.mjs`. |
| 2026-11-23 | 7 · Abschlussrunde | Freigabeliste und Datensatz v3 (166 Aussagen, 187 Zahlen, 65 Quellen), beide Seiten nachgezogen. Abnahme: Build-Skript, Prüfskript (acht Prüfungen, Exit-Code 0) und Layout-Skripte ohne Befund. **Teil 1 ist damit als Entwurf fertig** — nicht veröffentlicht, nicht verlinkt, `noindex`. |

## Offene Punkte

Vor einer Veröffentlichung von Teil 1:

- [ ] **PwC-Studie lesen** (Registrierung durch Michael). An ihr hängt die Aussage, die 13,3 Billionen seien dort das Szenario „Weiter wie bisher“; bisher nur über DIW belegt (Konfidenz C).
- [ ] **FAZ-Gastbeitrag** hinter den „500 Milliarden pro Jahr“ lesen (ifo.de verlangt eine Browser-Prüfung).
- [ ] **Anfrage an R21** (`docs/04_anfrage_r21_entwurf.md`, nicht versendet) — zurückgestellt, bis die Reihe steht.
- [ ] **Ungelesene Originale**, deren Aussagen einen Vorbehalt tragen: Quantified Carbon (Factsheet B), Kittel/Schill (109 Tage; bisher nur ein Podcast-Transkript), Klimafolgen-Studie IÖW/Prognos/GWS, Radiant-Gutachten, Bischof/RBID, der Text des Klimaschutzgesetzes.
- [ ] **Dritte Host-Freigabe** für diese Originale und für Teil 2 bis 5 (IEA, Fraunhofer ISI, KBA, ENTSO-E-Dateiserver, gesetze-im-internet.de und andere).
- [ ] Zwei Fragen zur Messlatte: Dokumenttyp unseres eigenen Stücks; ob „Meldung im Repository“ als offener Korrekturweg reicht.
- [ ] `TRANSPARENZ.md` v0.2 als Ganzes freigeben.
- [ ] Teil 1 erneut von einem unbeteiligten Prüfer lesen lassen, wenn PwC und die Antwort von R21 eingearbeitet sind.

Für Teil 2 bis 6:

- [ ] Regeln und Aufträge nach den neun Verfahrensfehlern anpassen (`research/reviews_teil1/00_synthese.md`, Abschnitt 3): Freigabeliste vor dem Bau gegenlesen lassen, Datensatz mit allen Texten von Anfang an, Prüf- und Layout-Skripte als Abnahme, Konfidenz-Regeln im Build.
- [ ] Schwellenwerte für „nicht tragfähig“ festlegen, bevor Teil 6 gerechnet wird.
- [ ] Modell bauen: `strommix/` erweitern, Stundenprofile 2015–2025 einbinden (Abregelung korrigieren, Modulleistung einheitlich), Energiebilanz nach AG Energiebilanzen.
- [ ] Offene Widersprüche aus der Zusammenführung klären (`research/konsolidierung.md`), u. a. Strombedarf 2030 der Langfristszenarien.
