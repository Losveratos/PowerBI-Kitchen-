# IBCS-Modus — Strukturen als Elemente

Der IBCS-Modus ist ein Schalter über dem ganzen Framework: gleiche Zonen,
gleiches Raster, aber die **Notation regiert die Farben** und **Struktur-
elemente werden zu benannten Layout-Slots**. Aktivieren, wenn der Nutzer
IBCS/HICHERT/Management-Reporting nennt, ChartKitchen einsetzt (Frage 10)
oder Plan/Ist/Forecast-Vergleiche das Thema sind.

Für Chart-interne IBCS-Regeln (Szenario-Notation im Chart, Skalierung,
Varianz-Charts) den globalen Skill `ibcs-charts` bzw. projektseitig
`chartkitchen-report` nutzen — dieser Modus regelt die **Seiten-Ebene**.

## Grundsatz: Notation schlägt Branding

In Datencharts tragen **Bedeutungen** die Farben, nicht die Marke:

| Szenario | Darstellung                       |
| -------- | --------------------------------- |
| AC (Ist) | solide, dunkel (fast-schwarz)     |
| PY (Vorjahr) | grau, solide                  |
| PL (Plan) | Kontur/Rahmen, nicht gefüllt     |
| FC (Forecast) | schraffiert                  |
| Abweichung gut/schlecht | Grün/Rot (zurückhaltend, z. B. #8CB400/#FF3A21-Familie) |

Konsequenz: Die Corporate-Akzentfarbe bleibt **im Chrome** (Nav, aktive
Buttons) und taucht in keinem Datenchart auf. Wer beides mischt, zerstört
die Semantik („ist das Markenblau oder Plan?").

## Struktur-Elemente = benannte Slots

IBCS-Seiten haben wiederkehrende Strukturelemente. Der Modus behandelt sie
als **eigenständige Elemente mit festem Slot** (Name + Koordinaten im
AGENT-BRIEF), nicht als Beiwerk der Charts:

| Slot-Name            | Inhalt                                            | Platz (Variante A, 1280×720) |
| -------------------- | ------------------------------------------------- | ---------------------------- |
| `slot/title-block`   | IBCS-Titelblock: Zeile 1 Einheit/Bereich, Zeile 2 Kennzahl + Einheit (z. B. „Umsatz in Mio. EUR"), Zeile 3 Zeitraum + Szenarien | statt Seitentitel im Kopfband, linksbündig |
| `slot/message`       | Kernbotschaft (Say!) als ganzer Satz              | rechts neben/unter Titelblock |
| `slot/notation-band` | Szenario-Legende (AC · PY · PL · FC) **einmal pro Seite**, nicht je Chart | unter dem Kopfband, 24 px hoch |
| `slot/variance-strip`| Abweichungs-Charts (ΔPL, ΔPY %) über **gemeinsamer** Kategorieachse mit dem Basischart | direkt über/neben dem Haupt-Visual, bündig |
| `slot/comment-col`   | Kommentare als nummerierte Elemente ➀➁ mit Bezugslinien | rechte Spalte, 200–260 px, ersetzt ggf. das Detail-Visual |
| `slot/filter-context`| sichtbarer Filterkontext (Fußzeile bzw. `filterInfo` bei ChartKitchen) | Fußleiste |

Kommentare sind in IBCS **Berichtsbestandteil** (Check!), keine Dekoration —
deshalb bekommt `slot/comment-col` echten Platz statt Tooltips.

## Layout-Regeln im IBCS-Modus

- **Zeit horizontal, Struktur vertikal:** Zeitreihen als Säulen/Linien
  (x = Zeit), Strukturvergleiche (Produkte, Regionen) als Balken (y = Struktur).
- **Einheitliche Skalen je Zeile/Spalte:** Charts, die verglichen werden
  sollen, teilen Skala und Grundlinie; wo das nicht geht, Skalenbruch
  explizit kennzeichnen. Im AGENT-BRIEF als Regel je Chart-Zeile notieren.
- **Verdichtung statt Deko:** kleinere Gutter (8 px), mehr Inhalt pro Seite
  ist okay — IBCS-Seiten dürfen dichter sein als Dashboard-Seiten, weil
  einheitliche Notation die Lesekosten senkt.
- **Titel sind dreizeilige Titelblöcke**, keine Marketing-Headlines; die
  Botschaft wohnt in `slot/message`.

## Overrides gegenüber dem Standard-Modus

| Aspekt            | Standard-Modus                  | IBCS-Modus                                  |
| ----------------- | ------------------------------- | ------------------------------------------- |
| `dataColors`      | Markenkompatible Palette        | IBCS: `["#404040", "#9E9E9E", "#FFFFFF", …]` — AC/PY zuerst |
| Akzentfarbe       | Chrome + ggf. 1. Datenfarbe     | **nur** Chrome                              |
| Kachel-Optik      | weiße Karten, Radius bis 8      | Radius 0–2, kein Karten-Look für Charts einer Vergleichsgruppe (gemeinsame Fläche) |
| Ampeln            | sparsam erlaubt                 | nur IBCS-Abweichungslogik (gut/schlecht), nie Statusampeln zusätzlich |
| Seitentitel       | Botschafts-Headline             | `slot/title-block` + `slot/message`         |
| Legenden          | je Visual                       | `slot/notation-band` einmal pro Seite       |
| KPI-Kacheln       | frei                            | mit Szenario-Kennung und Abweichung ΔPL/ΔPY, identische Notation |

Diese Overrides in `theme.json` (zweite Variante `theme-ibcs.json` ablegen)
und im AGENT-BRIEF unter einer eigenen Sektion `## IBCS` dokumentieren, damit
Agenten nicht Standard- und IBCS-Regeln mischen.

## Accessibility im IBCS-Modus

Grün/Rot der Abweichungen ist der klassische Farbfehlsicht-Konflikt. IBCS
löst das strukturell mit: Vorzeichen (+/−), Richtung der Balken und Position —
diese zweiten Kanäle sind **Pflicht**, dann ist die Farbgebung zulässig.
Kontrast der Abweichungsfarben auf Weiß trotzdem mit `check_contrast.py`
prüfen (Label-Text ggf. dunkler als die Balkenfarbe).
