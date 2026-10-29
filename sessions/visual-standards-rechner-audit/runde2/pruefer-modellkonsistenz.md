# Prüfung: Fund "zeit" – KI-Kriterium zweigeteilt (Copilot-UI vs. Agent-Skills/PBIR)

Linse: Modellkonsistenz und Umsetzbarkeit. Geprüfte Datei: `visual-standards-rechner.html` (v0.10, Stand laut Kommentar im Repo, Audit-Notiz 09/2026).

## 1. Beschreibt "Heute" den Rechner korrekt?

Geprüft per Grep:

- `REQS.copilot` (Zeile 500): `sub:'Copilot erstellt und bearbeitet Reports nur mit Core Visuals'`, `cap:[1,1,1,5]`, `def:'C'` — Fund zitiert das wortgleich. ✅
- `TEXT.core.pro` (Zeile 609): enthält `'Einzige Option mit Copilot-Unterstützung, Export und Abos ohne Einschränkung'` — Fund zitiert sinngemäß korrekt. ✅
- `TEXT.deneb.con` (Zeile 606): enthält `'Kein IBCS-Zertifikat, Copilot ohne Unterstützung'` — korrekt zitiert. ✅
- Konflikt-Box Copilot vs. IBCS-Zertifikat (Zeile 807) existiert wie beschrieben. ✅
- Fabric Apps als "fünfter Weg, nicht modelliert" (Zeile 443) existiert wortgleich. ✅

Der Ist-Zustand ist **korrekt beschrieben**, keine Fehlbehauptung über den heutigen Rechner.

## 2. Externe Verifikation der Kernbehauptung

Per Websuche (Stand der Suche: heute) geprüft, ob es die behaupteten Artefakte wirklich gibt:

- Microsoft liefert offiziell eine "Power BI Report Authoring"-Skill (plus Report Design / Report Planner) für PBIR-Dateien, in Preview 2026, dokumentiert auf `learn.microsoft.com/en-us/power-bi/developer/agentic/power-bi-report-authoring-skill-overview` und im Fabric-Community-Blog "AI-Powered Power BI reporting: From design to deployment with agent skills (Preview)". Das deckt sich mit der im Fund behaupteten Note für `core`.
- Eine Community-Skill `deneb-visuals` existiert real (mehrere Marktplätze/Aggregatoren: GitHub `DuncanBoyne/Deneb-Visual-Skill`, `natalinio/agentic-powerbi-squad`, gelistet auf lobehub/skillsmp/mcpmarket), die laut Beschreibung Vega/Vega-Lite-Specs generiert und in PBIR `visual.json` injiziert. Das deckt die Note für `deneb`.
- PBIR ist laut Microsoft-eigenem Blog und mehreren Sekundärquellen seit Januar 2026 Default im Service, GA für 2026 angekündigt (genaues Quartal nicht offiziell fixiert — der Fund schreibt vorsichtig "geplant", das ist vertretbar, keine erfundene Zahl).

Die Faktenbasis ist also **nicht fabriziert**, sondern in aktueller Web-Realität nachweisbar. Das ist ungewöhnlich gut abgesichert für ein "Zeit"-Argument.

## 3. Doppelzählung mit bestehendem Posten?

Geprüft gegen benachbarte REQS-Zeilen (`version` – Git-Diff/Code-Review-Fähigkeit der Definition, `maint` – Wartbarkeit durch Fachbereich ohne Code). Beide sind **verwandt, aber nicht deckungsgleich**:

- `version`/`maint` fragen, ob ein Mensch (Fachbereich bzw. Reviewer) die Definition lesen/diffen/ändern kann.
- Das neue `agentic`-Kriterium fragt, ob ein KI-Agent die PBIR-Datei automatisiert erzeugen/ändern kann — andere Persona (Agent statt Mensch), anderer Mechanismus (Skill-gestützte Codegenerierung statt manuelles Editieren).

Keine Doppelzählung im engeren Sinn. Die textliche Nähe zu `copilot` (beide "KI") ist beabsichtigt und wird im Vorschlag selbst durch die Zweiteilung sauber getrennt (Service-Copilot-Pane vs. Agent-Skill auf Dateiebene).

## 4. Umsetzbarkeit mit vorhandener Struktur

`cap` ist ein 4er-Array in fester Reihenfolge `[paid, oss, deneb, core]`, Werte 0–5 (`CAP_LBL`). Der Vorschlag `cap:[2,2,4,5]` passt exakt in dieses Schema, ebenso `def:'C'` (gültiger PRIO-Key) und die `note`-Struktur je Options-Key. Umsetzbar ohne neue Dateneingaben, die niemand hat — keine externen Daten nötig, nur eine weitere Zeile in `REQS` plus Notes/TEXT-Ergänzung.

## 5. Bevorzugt der Vorschlag Deneb/OSS ohne sachlichen Grund?

Hier liegt der einzige **echte Schwachpunkt**: `paid=2` und `oss=2` werden identisch bewertet, mit der Begründung "Property-Schema des Vendor-Visuals undokumentiert, Agent kann nur kopieren" — das ist eine paid-spezifische Begründung (closed-source Vendor-Schema). Für `oss` (Open Source, Quellcode einsehbar) ist diese Begründung nicht direkt übertragbar: Ein Agent könnte bei einem offenen Visual den Quellcode/die Capabilities.json lesen und darauf aufbauen, selbst wenn (noch) keine fertige Skill wie `deneb-visuals` existiert. Die Gleichsetzung mit `paid` wirkt daher **unterbegründet** und tendenziell zu niedrig für `oss` — nicht zwingend als Bevorzugung von Deneb/eigenem OSS-Projekt der Autoren zu werten (im Gegenteil: hier wird das eigene OSS-Projekt eher zu schlecht bewertet), aber ein Konsistenzfehler.

Ansonsten keine erkennbare unsachliche Bevorzugung: `core` bekommt den Höchstwert (5), obwohl die Autoren kein Core-Visual vertreiben — plausibel, da die MS-eigene Skill am weitesten offiziell dokumentiert ist. `deneb` bekommt 4, nicht 5 — kein Maximalvorteil für die eigene Präferenz.

## 6. Wirkung relevant oder Rauschen?

Bei `def:'C'` (Could, Gewicht 1 in `PRIO_W`) ist der Score-Einfluss klein, aber nicht null — bei ansonsten knappen Ergebnissen zwischen Optionen kann ein zusätzliches Could-Kriterium mit klarer Differenzierung (2/2/4/5) das Ranking verschieben, gerade zugunsten `core` und `deneb` gegenüber `paid`/`oss`. Relevant genug, um aufgenommen zu werden, nicht Rauschen.

## Fazit

**refuted = false.**

Der Fund beschreibt den Ist-Zustand korrekt, dupliziert keinen bestehenden Posten, ist mit dem vorhandenen `cap`/`REQS`-Schema direkt umsetzbar, und die zentrale Tatsachenbehauptung (MS Report-Authoring-Skill, Community-Skill `deneb-visuals`, PBIR-Default seit 01/2026) ließ sich per Websuche bestätigen — ungewöhnlich gut belegt für ein zukunftsbezogenes Argument.

**Einzige Anpassung:** `oss`-Wert im neuen Kriterium critical prüfen. Empfehlung: `cap:[2,3,4,5]` statt `[2,2,4,5]`, oder die `oss`-Note umformulieren zu etwas wie *"Kein fertiges Community-Skill-Pendant zu deneb-visuals bekannt; Agent kann bei offenem Quellcode aber selbst Anpassungen vornehmen"*, damit die Bewertung intern konsistent begründet ist. Zusätzlich: Die Begründung im Bericht sollte die oben gefundenen URLs (learn.microsoft.com Report-Authoring-Skill, Fabric-Community-Blog, deneb-visuals-Repo) explizit als Evidenz führen statt "keine" — die Quellen existieren und sind auffindbar.
