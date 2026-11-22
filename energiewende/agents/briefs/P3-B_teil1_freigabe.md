# Auftrag P3-B · Freigabeliste für Teil 1 „Die 13,8 Billionen“

**Modell:** Opus · **Ergebnis:** `energiewende/docs/03_teil1_freigabe.md`
**Regeln:** `energiewende/agents/REGELN.md` und `energiewende/TRANSPARENZ.md`

## Ziel

Teil 1 der Reihe wird eine Seite, die erzählt, woher die Schlagzeilen-Zahl
kommt, was sie misst und was der Vergleichspfad kostet. Bevor jemand die
Seite baut, legst du fest, **was erzählt werden darf**: Nur was in deiner
Freigabeliste steht, kommt auf die Seite. Vorbild ist
`strommix/research/story_claims_check.md`.

## Material

- `energiewende/research/00_aufhaenger_r21.md` (Erstbefund, korrigiert)
- Dossiers 01, 02, 05, 09, 10 unter `energiewende/research/` und **ihre
  Prüfberichte** unter `energiewende/research/pruefung/`. Wo Dossier und
  Prüfbericht sich widersprechen, gilt der Prüfbericht.
- `energiewende/README.md`, Tabelle „Entscheidungen“.
- Die Originale unter `energiewende/quellen/raw/` (R21-Erklärung,
  Bundestags-Kurzinformation, DIHK/Frontier, KfW und andere) — schlage jede
  tragende Zahl dort selbst nach, bevor du sie freigibst.

## Aufgaben

1. **Jede Aussage, die Teil 1 tragen soll, einzeln prüfen** und einstufen:
   **bestätigt** (am Original gelesen, Fundstelle) · **korrigiert** (mit
   altem und neuem Wert) · **verworfen** (darf nicht erzählt werden, mit
   Grund) · **Setzung (M)** · **nicht prüfbar** (darf nur mit diesem
   Vorbehalt im Satz erzählt werden).
2. **Offen ausweisen, was ungelesen ist:** Die PwC-Studie (Registrierung)
   und der FAZ-Gastbeitrag (ifo.de) sind nicht am Original gelesen. Alles,
   was daran hängt, bekommt den Vorbehalt. Formuliere für jede dieser
   Aussagen den genauen Satz, der auf der Seite stehen darf — so, dass er
   auch dann noch stimmt, wenn das Original etwas anderes sagt als die
   Sekundärquellen.
3. **Erzählbogen vorschlagen** (fünf Akte, je drei bis vier Schritte, wie
   in `strommix-story.html`): vom Satz in der Schlagzeile über die Fußnote,
   die Quelle der Quelle, die drei verschiedenen Größen (Brutto-Gesamtkosten,
   Brutto-Investitionen, Mehrkosten), den Vergleichspfad, bis zu dem, was
   R21 richtig sieht. Je Schritt: Kernaussage in einem Satz, die Zahlen
   dazu, die Grafik-Idee.
4. **Pflicht-Gegenpositionen** — mindestens acht, jede mit Beleg, die auf
   der Seite als eigener Kasten stehen müssen. Darunter zwingend:
   - wo R21 recht hat (Abhängigkeit von China, Industrierückgang,
     Strompreis, Energiemenge der Dunkelflaute, ETS-Minderung);
   - warum niedrige Mehrkosten-Schätzungen zu optimistisch sein können
     (Referenz enthält schon Klimaschutz, Finanzierungskosten fehlen,
     Beharrung, Bundesrechnungshof, gestiegene Netz- und Windkosten);
   - wo unsere eigenen Dossiers falsch lagen und die Gegenprüfung sie
     korrigiert hat — in beide Richtungen.
5. **Was Teil 1 nicht zeigt:** fünf bis acht ehrliche Grenzen (kein eigenes
   Kostenmodell in Teil 1; Studien nicht selbst nachgerechnet; welche
   Originale fehlen; BIP-Bezug als Setzung).
6. **Fairness-Check gegenüber R21:** Lies deine Liste am Ende als jemand,
   der das Papier verteidigt. Welche Formulierung wäre unfair, verkürzt
   oder unterstellt Absicht? Wir schreiben „steht so nicht in der Quelle“,
   nicht „gefälscht“; wir kennen die Gründe nicht.
7. **Der Datenblock:** am Ende **ein** ```json-Block `teil1_data` — die
   maschinenlesbare Freigabeliste: jede freigegebene Zahl mit `id`, `value`
   (oder `min/mid/max`), `unit`, `abgrenzung`, `source`, `fundstelle`,
   `confidence`, `primaer_gelesen`, `status`, und je Erzählschritt die
   Liste der Zahlen-IDs, die er verwenden darf. Dazu `verworfen`: Zahlen
   und Formulierungen, die auf der Seite nicht vorkommen dürfen.
8. **Die Studien-Vergleichstabelle für die Seite:** je Studie eine Zeile —
   Herausgeber, Auftraggeber, was sie misst (eine der drei Größen),
   Zeitraum, Summe, pro Jahr, % des BIP. Nur Zeilen, deren Kernzahl am
   Original gelesen ist; die anderen in einer zweiten Tabelle „nicht am
   Original gelesen“.

## Ton

Sachlich, ohne Häme. Der Leser soll nachvollziehen können, nicht belehrt
werden. Kein YAML-Frontmatter. Deutsch mit echten Umlauten.

Abschlussmeldung: Zahl der Aussagen je Status, die drei heikelsten
Formulierungen, und was vor Veröffentlichung noch eine Entscheidung braucht.
