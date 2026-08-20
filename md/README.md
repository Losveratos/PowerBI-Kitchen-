# /md/ — die Markdown-Fassungen der Kitchen

Dieser Ordner enthaelt die KI- und agentenfreundlichen Fassungen der
inhaltlich wichtigen Seiten. Sie werden unter stabilen URLs als **roher
Markdown-Text** ausgeliefert:

    https://datenwgknowledgekitchen.com/md/whitepaper-strommix.md

Der Einstiegspunkt fuer Agenten ist `/llms.txt` im Repo-Wurzelverzeichnis
(Konvention nach llmstxt.org), dazu `/llms-full.txt` als Volltext-Buendel.

---

## Die drei Regeln

### 1. Neuer inhaltlicher Beitrag → Markdown-Fassung + llms.txt-Eintrag

Sobald eine neue Seite mit Substanz dazukommt (erklaerender Text, eigene
Daten, eine Analyse — kein reines Werkzeug und kein Spiel):

1. Markdown-Fassung nach `md/<slug>.md` legen, Dateiname in Kleinbuchstaben
   mit Bindestrichen.
2. Kopfblock nicht vergessen (siehe unten).
3. Eintrag in `/llms.txt` ergaenzen — Markdown-Link plus **eine** Zeile
   Beschreibung, die sagt, was drinsteht, nicht wie schoen es ist.
4. Wenn das Dokument kompakt ist und ins Buendel passt: in
   `scripts/build_llms_full.py` die Liste `DOCS` ergaenzen und neu bauen.

Bewusst **nicht** aufgenommen werden interaktive Werkzeuge und Spiele ohne
eigenen Fliesstext (Business Chart Builder, IBCS-Trainer, P&L-Treiberbaum,
Daten-WG-Spiel) sowie Seiten, deren Inhalt live von einer fremden API kommt
(Konferenz-Agenda aus Sessionize).

### 2. Datengetriebene Seiten IMMER per Skript generieren

Wenn eine Seite ihre Zahlen aus einer Datendatei zieht, darf die
Markdown-Fassung **nicht** von Hand geschrieben werden — sonst driftet sie
gegen die Webseite, sobald sich die Daten aendern.

Vorbild ist `strommix/scripts/build_md_exports.py`: es liest dieselben
JSON-Dateien, aus denen `whitepaper-strommix.html` und `strommix-story.html`
zur Laufzeit ihre Zahlen holen, und erzeugt daraus
`md/whitepaper-strommix.md` und `md/strommix-story.md`.

Anforderungen an so ein Generator-Skript:

- **Deterministisch.** Zwei Laeufe auf demselben Repo-Stand muessen
  byteidentische Dateien liefern. Insbesondere: kein `datetime.now()`. Das
  Stand-Datum kommt aus dem **Git-Commit-Datum der Quelldaten**
  (`git log -1 --format=%cs -- <datei>`).
- **Selbstpruefend.** `--check` rendert zweimal, vergleicht untereinander und
  gegen die Dateien auf der Platte, und meldet Abweichungen.
- **Nur Standardbibliothek.** Kein pip-Install noetig, damit das Skript in
  jeder Umgebung laeuft.

Pruefen vor dem Commit:

    python3 strommix/scripts/build_md_exports.py --check
    python3 scripts/build_llms_full.py --check

Die einmalig aus HTML extrahierten Dateien (siehe Tabelle unten) sind davon
ausgenommen: ihre Quellseiten sind handgeschriebener Text, kein Datensatz.
Aendert sich so eine Seite substanziell, wird die Markdown-Fassung von Hand
nachgezogen und das Stand-Datum im Kopfblock aktualisiert.

### 3. KEIN YAML-Frontmatter. Niemals.

GitHub Pages baut dieses Repo mit Jekyll. Eine Markdown-Datei mit
YAML-Header (`---` als erste Zeile) wird von Jekyll als *Page* behandelt,
durch Liquid geschickt und der Header abgeschnitten. Ein ungueltiges
Datumsfeld darin hat den Pages-Build schon einmal vollstaendig zerlegt:

    Liquid Exception: Invalid Date: '"2026-08"' is not a valid datetime.

Danach war die **ganze Site** offline, nicht nur die eine Datei.

Deshalb: Dateien unter `/md/` beginnen mit `# Titel`, nie mit `---`.

Dieselbe Falle lauert bei Code-Beispielen, nur leiser.
`md/power-bi-einsteiger-guide.md` enthaelt die Power-Query-Zeile

    Table.Sort({{"Datum", Order.Descending}})

Die doppelte geschweifte Klammer ist gueltiges M — und gleichzeitig eine
Liquid-Variable. Ginge die Datei durch Liquid, meldet der Build einen
`Liquid syntax error` als blosse **Warnung** und macht aus der Zeile
stillschweigend `Table.Sort(Datum)`. Kein Abbruch, kein roter Balken, nur
falscher Code auf der Seite. Mit der `markdown_ext`-Einstellung unten kommt
die Datei gar nicht erst in die Naehe des Template-Renderers.

---

## Wie die Auslieferung als roher Text funktioniert

Jekyll behandelt `.md` standardmaessig als Markdown-Quelle, und GitHub Pages
laedt zusaetzlich `jekyll-optional-front-matter`, das auch Dateien ohne
YAML-Header zu Seiten macht.

Die Gegenprobe wurde lokal gefahren, mit Jekyll 3.10.0 — der Version, die
Pages faehrt — plus dem Plugin. Mit dem Standardwert legt Jekyll fuer jede
`.md`-Datei **zwei** Dateien ab: die gerenderte `.html` *und* die rohe `.md`.
Die `.md`-URL funktioniert dabei zwar, aber nur als Nebenprodukt davon, wie
das Plugin mit statischen Dateien umgeht — darauf baut man keine stabilen
URLs. Und der gerenderte Zwilling schadet aktiv: er schickt den Inhalt durch
Liquid (siehe die `Table.Sort`-Zeile oben) und legt jede Seite unter einer
zweiten, ungepflegten URL ab.

Die Loesung steht in `_config.yml`:

    markdown_ext: "markdown,mkdown,mkdn,mkd"

`md` fehlt in dieser Liste. Damit ist jede `.md`-Datei fuer Jekyll eine
gewoehnliche **statische Datei**: sie wird unveraendert nach `_site` kopiert
und unter ihrem eigenen Namen ausgeliefert — kein Konverter, kein Liquid,
kein Plugin dazwischen. Lokal verifiziert: alle Dateien unter `md/` landen
byteidentisch im Build, ohne `.html`-Zwillinge.

Geprueft und unkritisch:

- Kein internes `href` der Site zeigt auf eine von Jekyll gerenderte
  Markdown-Seite; alle internen Links gehen auf `.html`.
- `ibcsInspiredChartDeck/AGENT-GUIDE.md` wird aus den
  ChartKitchen-Schnellstart-Seiten verlinkt. Die Datei wurde schon vorher
  roh mit ausgeliefert und wird es weiterhin — jetzt garantiert statt
  zufaellig.
- `blog/ibcs-reporting-power-bi.md`, `README.md`, `STATUS.md`,
  `PowerBIhub.md` und die uebrigen Repo-Markdowns verlieren ihren nirgends
  verlinkten HTML-Zwilling. Die `.md`-URLs bleiben.
- Die Arbeitsdokumente unter `strommix/docs/`, `strommix/research/` und
  `strommix/scripts/` bleiben ueber `exclude` vom Build ausgenommen.
  `strommix/data/` bleibt ausdruecklich **drin**: beide Strommix-Seiten
  laden von dort zur Laufzeit ihre Zahlen.

Wer `_config.yml` anfasst, faengt bitte bei den Kommentaren dort an.

---

## Der Kopfblock

Jede Datei unter `/md/` beginnt mit Titel, einer Kurzbeschreibung als
Blockzitat und einem Kopfblock aus Metazeilen:

    # Titel der Seite

    > Ein bis drei Saetze, was drinsteht.

    - **Quelle:** https://datenwgknowledgekitchen.com/<seite>.html
    - **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
    - **Extrahiert aus:** `<seite>.html` · Stand JJJJ-MM-TT (Git-Commit-Datum)
    - **Zitierhinweis:** ...
    - **Hinweis fuer Agenten:** ...

Generierte Dateien nennen stattdessen ihr Skript, den Modellstand und die
maschinenlesbaren Rohdaten, und tragen den Statushinweis „Entwurf,
Konfidenzstufen beachten".

---

## Bestand

| Datei | Quelle | Herkunft |
|:---|:---|:---|
| `whitepaper-strommix.md` | `whitepaper-strommix.html` | generiert · `strommix/scripts/build_md_exports.py` |
| `strommix-story.md` | `strommix-story.html` | generiert · `strommix/scripts/build_md_exports.py` |
| `rhein-story.md` | `rhein-story.html` | einmalig extrahiert (Tabellen aus dem JS-Datenblock) |
| `power-bi-einsteiger-guide.md` | `power_bi_einsteiger_guide_v4.html` | einmalig extrahiert (87 Detailabschnitte) |
| `fabric-einsteiger-guide.md` | `fabric_einsteiger_guide_v1.html` | einmalig extrahiert (40 Detailabschnitte) |
| `powerbi-praxis-pfad.md` | `powerbi_praxis_pfad.html` | einmalig extrahiert |
| `chartkitchen-doku.md` | `chartkitchen-doku.html` | einmalig extrahiert |
| `laender-indikatoren-explorer.md` | `laender-indikatoren-explorer.html` | einmalig extrahiert |
| `pdoom-ki-risiko.md` | `pdoom-ki-risiko.html` | einmalig extrahiert |
| `ki-co2-simulator.md` | `ki-co2-simulator.html` | einmalig extrahiert (Annahmen und Quellenanhang aus dem JS) |
| `zugfahrten-europa.md` | `zugfahrten-infografik.html` | einmalig extrahiert |
| `waermestreifen-3d.md` | `waermestreifen-3d.html` | einmalig extrahiert |
| `daten-wg-videos.md` | `daten_wg_learn_buckets.html` | einmalig extrahiert (aus `EPISODES`/`BUCKETS`) |

Nicht in diesem Ordner, aber in `llms.txt` verlinkt:
`whitepaper-ki-entwicklung-roi.md` und `whitepaper-ki-entwicklung-roi_en.md`
liegen bereits im Repo-Wurzelverzeichnis und werden seit der
`markdown_ext`-Aenderung ebenfalls roh ausgeliefert. Sie werden bewusst
**nicht** nach `/md/` kopiert — eine zweite Kopie waere nur eine weitere
Stelle, die driften kann.
