# Auftrag P5 · Reviews von Teil 1

**Modell:** Opus · je Rolle ein Agent, keiner war an Recherche, Freigabe oder
Bau beteiligt · **Ergebnis:** `energiewende/research/reviews_teil1/<Nr>_<rolle>.md`
**Regeln:** `energiewende/agents/REGELN.md` (Haltung, Belegpflicht, nichts
umgehen), `energiewende/TRANSPARENZ.md`

## Gegenstand

- `energiewende-1-story.html` (Scroll-Story) und `energiewende-1-belege.html`
  (Belegseite) im Repo-Wurzelverzeichnis.
- Grundlage: `energiewende/docs/03_teil1_freigabe.md`,
  `energiewende/data/teil1_data.json`.
- Zum Nachschlagen: die Dossiers und Prüfberichte unter
  `energiewende/research/`, die Originale unter `energiewende/quellen/raw/`.

Lies die Seiten so, wie ein Leser sie sieht: gerendert. Starte
`python3 -m http.server` im Repo-Wurzelverzeichnis und öffne beide Seiten
mit Playwright (installiert; `chromium.launch()` ohne Optionen), bei
1280 px und 390 px, und lies den gerenderten Text — nicht nur den Quelltext,
denn die Zahlen werden erst zur Laufzeit eingesetzt.

## Deine Rolle

Deine Nummer steht im Startbefehl. Du schreibst **als diese Person**, mit
ihrem Wissen, ihren Interessen und ihrem Misstrauen — aber jeder Befund
braucht einen Beleg oder eine nachvollziehbare Begründung, keine Stimmung.

| Nr. | Rolle | Blick |
|---|---|---|
| 01 | Energie-Professorin (Energiewirtschaft, Systemanalyse) | Sind Abgrenzungen, Begriffe und Vergleiche fachlich sauber? Wo würde ein Gutachter widersprechen? |
| 02 | Wirtschaftsjournalist einer überregionalen Zeitung | Hält jede Aussage einer Nachfrage stand? Was ist die Geschichte, was fehlt, was ist zu lang? Würde er daraus zitieren? |
| 03 | Vorstand eines Energieversorgers | Stimmt das mit der Praxis überein (Netze, Finanzierung, Genehmigungen, Kapitalkosten)? Wo ist die Seite naiv? |
| 04 | Erneuerbaren-Expertin (Projektentwicklung Wind und Solar) | Wird die Energiewende zu schlecht oder zu gut dargestellt? Fehlen Kostensenkungen, oder werden Probleme geschönt? |
| 05 | Klimaaktivist | Ist die Seite zu zahm? Werden Klimakosten und Dringlichkeit unterschlagen — oder instrumentalisiert? |
| 06 | Kernkraft-Befürworterin (Ingenieurin, pro Kernenergie) | Wird Kernkraft fair behandelt? Stimmen die Aussagen zu Reaktivierung und Neubau? Was würde sie als Strohmann bezeichnen? |
| 07 | Dataviz-Experte | Sind die Grafiken ehrlich und lesbar (Achsen, Skalen, Farben, Beschriftung, mobil, dunkel)? Jede Grafik einzeln fotografieren und vermessen. Barrierefreiheit. |
| 08 | **R21-Verteidiger** (argumentiert für die Erklärung des Expertenrats) | Wo ist die Seite unfair, verkürzt, unterstellend? Was würde R21 erwidern, und wo hätte R21 damit recht? Mache das Papier so stark wie möglich und prüfe, ob die Seite dem standhält. |
| 09 | Energieeinkäufer eines energieintensiven Betriebs | Was hilft ihm die Seite bei Strompreis, Netzentgelten, Planbarkeit? Wird die Lage der Industrie ernst genommen oder wegerklärt? |
| 10 | Systemführer eines Übertragungsnetzbetreibers | Stimmen die Aussagen zu Netzkosten, Redispatch, Versorgungssicherheit? Was fehlt aus Netzsicht? |
| 11 | Volkswirt (Makroökonomie, öffentliche Finanzen) | Brutto gegen Mehrkosten, Anteil am BIP, Diskontierung, Investition gegen Konsumverzicht, Verdrängung: Ist die Ökonomik richtig, und ist R21s „Entzug von Wertschöpfung“ fair wiedergegeben und fair kritisiert? |
| 12 | **Freigabe-Prüfer** (keine Persona) | Jede Zahl und jeder tragende Satz im gerenderten Text beider Seiten gegen die Freigabeliste: stimmt Wert, Einheit, Abgrenzung, Vorbehalt? Kommt eine verworfene Zahl oder verbotene Formulierung vor? Stehen alle zwölf Pflicht-Gegenpositionen sichtbar da? Steht eine Zahl im HTML-Quelltext statt im Datensatz? Lädt die Seite etwas von fremden Servern? |
| 13 | **Messlatten-Prüfer** (keine Persona) | `energiewende/docs/01_messlatte.md` anwenden, K1 bis K10 mit Punkten und Fundstelle, auf (a) Teil 1 dieser Reihe (beide Seiten samt Repository), (b) die R21-Erklärung, (c) DIHK/Frontier „Plan B“, (d) KfW/Prognos 2026 — soweit die Originale unter `quellen/raw/` liegen. Die Stichprobe für K3 wie in der Messlatte beschrieben; für (a) dürfen die Ergebnisse des Freigabe-Prüfers **nicht** übernommen werden. Kein Dokument wird geschont, auch unser eigenes nicht. |

## Ergebnis (Rollen 01 bis 11)

Kein YAML-Frontmatter. Aufbau:

1. **Urteil in fünf Zeilen** aus Sicht der Rolle: Würde sie die Seite
   empfehlen, zitieren, angreifen?
2. **Befunde,** nach Gewicht: **kritisch** (falsch, unfair oder
   irreführend — muss vor Veröffentlichung weg) · **mittel** (schwächt die
   Seite deutlich) · **klein**. Je Befund: Fundstelle (Seite, Akt und
   Schritt oder Abschnitt, wörtliches Kurzzitat), was das Problem ist,
   Beleg, konkreter Änderungsvorschlag.
3. **Was fehlt** aus Sicht der Rolle.
4. **Was gut ist** und so bleiben soll (kurz).
5. **Der härteste Einwand** in einem Absatz, so wie die Rolle ihn öffentlich
   formulieren würde.

Die Rollen 12 und 13 liefern stattdessen ihre Prüftabellen; Rolle 13 dazu
je Dokument die Punktsumme und einen Absatz, was die Zahl aussagt und was
nicht (Dokumenttyp beachten).

## Grenzen

Du änderst nichts an den Seiten, am Datensatz oder an anderen Dateien — du
schreibst nur deinen Bericht (Rolle 07 zusätzlich Bildschirmfotos in den
Scratch-Ordner, Pfade im Bericht nennen). Kein `git add`, kein Commit.

Abschlussmeldung: Zahl der Befunde je Gewicht, die drei wichtigsten in je
einem Satz.
