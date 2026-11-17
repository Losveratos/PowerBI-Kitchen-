# Review-Log Persona-Firmen (100 Stück, A01–D25)

Geprüft wurden Mengen gegenüber Größe und Story, Widersprüche zwischen Feldern, Story gegenüber Werten, Ehrlichkeit der Dreipunkte und Doppelungen.
Geändert wurde nur, was nicht stimmte: 41 Personas (A 2, B 13, C 10, D 16), 59 sind unverändert. IDs, Namen und der Kern jeder Story sind erhalten.

## Änderungen

| ID | Was | Warum |
|---|---|---|
| A02 | Story ergänzt: „mitten im Sparprogramm" | `why` und `nobudget` 0.3 berufen sich auf ein Sparprogramm, das in der Story fehlte. |
| A08 | `growth` [0,15,60] → [0,15,30] | Der Rollout auf die Töchter steckt schon in der breiten Viewer-Spanne (400–4.000). 60 %/Jahr über 10 Jahre zählt ihn doppelt und ist absurd breit. |
| B01, B02, B05, B11 | `novat` 1 ergänzt | Sparkasse, Genossenschafts- und Bausparkassen-Umsätze sind steuerfrei (§ 4 Nr. 8 UStG), also kein voller Vorsteuerabzug. Das Flag fehlte. |
| B03 | `novat` 1 ergänzt | Schweizer Privatbank: Umsätze überwiegend von der MWST ausgenommen, daher Vorsteuerkürzung. |
| B04 | `novat` 1 ergänzt | Versicherungsumsätze sind steuerfrei (§ 4 Nr. 10 UStG), kein voller Vorsteuerabzug. |
| B07 | `novat` 1 ergänzt | Österreichische Bank: unecht steuerbefreit, kein voller Vorsteuerabzug. |
| B09 | `novat` 1 ergänzt | Auch eine Digitalbank mit Vollbanklizenz hat überwiegend steuerfreie Umsätze. |
| B10 | `novat` 1 ergänzt | Schweizer Lebensversicherer: Versicherungsumsätze ausgenommen. |
| B17 | `novat` 1 ergänzt | Hoheitlich tätige Landesbehörde ohne Vorsteuerabzug. |
| B19 | `novat` 0.9 ergänzt | Kantonsverwaltung, hoheitlich tätig, kein Vorsteuerabzug. |
| B24 | `novat` 0.8 ergänzt, `growth` [5,20,50] → [0,6,15] | Leistungen eines Landesbetriebs an Landesdienststellen sind ohne Vorsteuerabzug. Die offene Teilnahme der Dienststellen steckt schon in der Viewer-Spanne (300–3.000). Mit Modus 20 % über 10 Jahre wären es ~7.400 Leser. |
| B06 | `novat` 0.5 ergänzt, `growth` [5,25,60] → [0,6,15] | Die Umsatzsteuer der Verbundtochter ist unklar (Kostenteilung möglich). Die Teilnahme der 38 Häuser steckt bereits in viewers 600–4.000. 25 %/Jahr über 10 Jahre ergäbe ~14.000 Leser, mehr als 38 Sparkassen plausibel stellen. |
| C04 | `existing` 14 → 6 | Laut Story hat der Berater „ein paar Deneb-Charts" gebaut. 14 von 18 Reports wäre fast der gesamte Bestand. |
| C05 | `library` true → false | Die Story beschreibt „jede Gesellschaft mit eigenem Power-BI-Stil", also gibt es keine gemeinsame Vorlagenbibliothek. |
| C06 | `novat` entfernt | Industrieller Hidden Champion mit vollem Vorsteuerabzug. Das ist genau der Widerspruch aus dem Prüfauftrag. |
| C07 | `decider` → „CFO, umgesetzt vom Leiter Controlling" | Laut Story treibt der CFO den Standard. |
| C09 | `viewers` [800,1500,2500] → [500,900,1500], `growth` [10,20,35] → [5,12,25], Story „und Verkaufsteams" | Vorher lag der Modus am Horizont bei ~3.700 Lesern, also 98 % der 3.800 Mitarbeitenden eines Autohändlers. Jetzt sind es ~1.600. Die Story nennt die Verkaufsteams, damit die Leserzahl erklärt ist. |
| C14 | `growth` [10,20,40] → [5,12,25]; Story, `why`, `must` mobile 0.4 → 0.8, export 0.6 ergänzt | Bei 300 MA hätten 2/3 der Belegschaft (inkl. Werk) gelesen. C14 war außerdem fast identisch mit C03 (österr. Großhändler ~300 MA, Excel → Power BI, none/inforiver/dist none/ki, kaum Muss). Mit Außendienst-Tablet und PDF-Abos an Händler bekommt C14 ein eigenes Profil. |
| C18 | `reports` [12,22,35] → [25,35,50] | 30 Bestandsreports sollen migriert werden (`why`), der Modus der Standard-Reports lag aber bei 22. |
| C21 | `novat` entfernt | Ein Chemie-Distributor hat vollen Vorsteuerabzug. |
| C22 | `library` true → false | Laut Story gibt es „noch keine Erfahrung" und `baseline` ist none. Eine fertige Vorlagenbibliothek passt dazu nicht. |
| C24 | `employees` 1.100 → 4.800, `segment` mittelstand → gehoben | 450 Objektleiter als Leser setzen eine deutlich größere, reinigungslastige FM-Belegschaft voraus (Verhältnis ~1:10–15). Die Kern-Story (viele Leser, Site-Lizenz) bleibt so erhalten. |
| D02 | Story: „neun davon mit ersten Deneb-Vorlagen eines Data Engineers"; `growth` [30,60,120] → [10,30,60] | `baseline` deneb mit Bibliothek hatte keine Grundlage in der Story. 60 %/Jahr über 5 Jahre ergäbe 1.700 Leser bei 380 MA. |
| D03 | `embed` 0.6 → 0.9 | Laut Story nutzt die Agentur Embedded-Seiten bereits. Das ist fast Tatsache, keine Diskussion. |
| D04 | `noext` 0.5 → 0.2 | Eine private Kanzlei unterliegt keiner Ausschreibungspflicht. Externe Dienstleister sind mit Verschwiegenheitsverpflichtung (§ 62a StBerG) zulässig. |
| D05 | `viewers` [60,110,180] → [40,70,110] | 110 Leser bei 120 MA für interne Reports, und das Maximum lag über der Belegschaft. |
| D07 | `growth` [20,40,80] → [5,15,35] | 40 %/Jahr über 5 Jahre hieße 38 → ~200 Studios in Österreich. |
| D09 | `employees` 55 → 140, `segment` klein → mittelstand | Sieben Dachdecker-/Spenglerbetriebe mit eigener IT-Sperrpolitik und 35 Lesern passen nicht zu 55 MA. |
| D10 | `siteLicense` true → false, `city` Düsseldorf → Stuttgart | Site-Lizenz bei ~60 Lesern und einem OSS-Bestand ist widersprüchlich. Ein „Verband Süddeutscher Metallbetriebe" sitzt nicht in Düsseldorf. |
| D12 | `viewers` [40,80,140] → [30,50,75], `growth` [10,25,60] → [5,15,35] | 80 Leser bei 85 MA, das Maximum über der Belegschaft. |
| D13 | `employees` 140 → 520, `certonly` 0.3 ergänzt | Ein vierköpfiges BI-Team und 130 Leser passen nicht zu 140 MA. `orgstore` stand ohne `certonly`. |
| D16 | `growth` [20,40,100] → [10,20,40] | Eine Boutique mit 18 MA hätte im Modus ~800 Mandanten-Leser gehabt, im Maximum fünfstellig. |
| D17 | `growth` [20,45,120] → [10,25,60] | Die Unsicherheit der Embedded-Leser steckt schon in viewers 300–2.500. 45 %/Jahr obendrauf ergäbe ~5.800. |
| D19 | `employees` 70 → 300, `segment` klein → mittelstand, `dist` none → file | Vier Pflegeheime brauchen ~250–350 MA (vgl. B14: 14 Heime, 1.250 MA). Auf dem Report Server werden Custom Visuals je Bericht eingebettet. |
| D20 | `horizon` 3 → 10, `revision` 0.6, `must` exit 0.5, Story und `why` ergänzt | Fast identisch mit D11 (Kleinstorganisation, Null-Budget, novat, none, hz 3). Eine Förderstiftung ist zudem auf Dauer angelegt, daher 10 Jahre. In der Schweiz prüfen Stiftungsaufsicht und Revisionsstelle. |
| D23 | `employees` 65 → 260, `segment` klein → mittelstand | Ein regionaler Tageszeitungsverlag mit Print, Digital und Anzeigen und 45 Lesern hat nicht nur 65 MA. |
| D24 | `viewers` [20,40,60] → [15,25,40] | 40 Leser bei 48 MA im Ingenieurbüro, das Maximum über der Belegschaft. |
| D25 | `siteLicense` true → false | Eine Site-Lizenz bei ~90 Lesern ist unrealistisch (Fall „siteLicense bei kleiner Leserzahl"). |

Nicht geändert, aber angemerkt:
- Mehrere Namen kommen über die Autoren hinweg doppelt vor: Kessler (A02/D18), Bergmann (A12/D09), Hartmann (A17/C16/D16).
- A18 und C06 sitzen beide in Schwäbisch Gmünd, haben Präzisionsteile, IBCS für alles, zebra und einen 10-Jahres-Horizont. Durch Baseline (none vs. core) und Berichtsheft unterscheiden sie sich genug.
- Bei vielen Personas liegt `existing` über `reports[0]`. Das ist als Konsolidierung beim Umstieg plausibel.
- Mehrere C-Personas haben `types` bis 9–10, über dem typischen Bereich 4–8, aber nicht falsch.

## Gesamturteil

Der Satz ist insgesamt realistisch und deckt eine breite Spanne ab: Konzerne, Mittelstand, Banken, öffentliche Hand und Kleinstfirmen, dazu alle Baselines und Verteilwege. Echte Doppelungen gibt es nur zwei (C03/C14, D11/D20).
Die Opus-Personas (A/B) haben dichtere, glaubwürdigere Storys, und die Felder passen meist genau zur Story. Der auffälligste Fehler ist systematisch: Bei fast allen Banken, Versicherern und Behörden in B fehlt `novat`, obwohl derselbe Autor es bei Kliniken, Kassen und Kirchen korrekt setzt.
Die Sonnet-Personas (C/D) sind knapper und generischer. Sie zeigen zwei typische Fehler: zu kleine Mitarbeiterzahlen für die beschriebene Struktur, sodass Leser die Belegschaft erreichen oder übersteigen (D05, D09, D12, D13, D19, D23, D24), und Wachstumsraten, die über den Horizont verzinst unrealistisch werden. Dazu kommen Feld-Ausreißer wie `novat` bei Industrie- und Handelsfirmen, `library` ohne Grundlage und Site-Lizenzen bei unter 100 Lesern.
Beide Autorengruppen zählen gelegentlich Rollout-Unsicherheit doppelt: einmal in der breiten Viewer-Spanne und ein zweites Mal in hohem Jahreswachstum (A08, B06, B24, D17).
Die Unsicherheiten sind sonst überwiegend ehrlich gesetzt: eng bei bekannten Kleinfällen, breit bei offenen Rollouts, Fusionen und Buy-and-Build.
Nach den Korrekturen taugt der Satz als realistische Stichprobe für die Simulation. Die D-Gruppe bleibt erkennbar kleinteiliger und stärker auf Sonderfälle mit externen Lesern (Franchise, Mandanten, Mitglieder) ausgerichtet als der Rest.
