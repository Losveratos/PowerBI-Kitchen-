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

## Entscheidungen (Michael, 22.11.2026)

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
├── data/                ← Rohdaten mit offener Lizenz + aufbereitete JSON
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

## Offene Punkte

- [ ] `TRANSPARENZ.md` durch Michael freigeben (insbesondere Abschnitt 9, Interessen).
- [ ] Schwellenwerte für „nicht tragfähig“ festlegen, bevor Teil 6 gerechnet wird.
- [ ] Zweite Host-Freigabe: Liste der in Phase 1 nicht erreichbaren Quellen (steht nach dem Lauf in `agents/PROTOKOLL.md`).
- [ ] PwC-Studie 2024 (Quelle der 13,3 Billionen) ist nur nach Registrierung abrufbar.
