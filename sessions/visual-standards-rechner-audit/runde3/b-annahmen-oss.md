# Runde 3 · B · Annahmen-Dossier zur Open-Source-Option

**Stand:** 05.11.2026 · **Prüfgegenstand:** `visual-standards-rechner.html` (Branch `feat/rechner-review`), Modell-Definitionen ab Z. 3464 · **Rolle der Option:** `oss` steht beispielhaft für ChartKitchen byDatenWG, das eigene Visual der Herausgeber; der Rechner trägt dafür einen Interessenkonflikt-Hinweis (`TEXT.oss.hidden`, Z. 3646), die früheren Runden haben die OSS-Parameter absichtlich konservativ gelassen (02-paid-oss-opus, runde2/synthese K6 · A11 · C9, grundannahmen-kritik „Erfüllungsgrade … für das eigene Produkt besonders schwer neutral zu vergeben“).

**Regel dieses Dossiers:** Ein Vorschlag ist nur zulässig, wenn er sich auf eine im Repo belegbare Tatsache stützt (Manifest, Doku-Seite, Changelog, Code). Einschätzungen ohne Beleg stehen als „keine Änderung“ mit Begründung. Jeder Vorschlag nennt Richtung (für/gegen OSS) und Stärke sowie das Eigeninteresse-Risiko. Die HTML wurde nicht geändert; der Eigentümer entscheidet.

**Faktenquellen (gelesen):** `ibcsInspiredChartDeck/pbiviz.json` (1.53.0.0, API 5.11.0, externalJS null), `CHANGELOG.md` (93 Versionen 1.1.0 bis 1.53.0, 06.07.–24.10.2026), `capabilities.json` (Z. 660 `supportsKeyboardFocus: true`, Z. 664 `privileges: []`), `src/visual.ts`, `chartkitchen-doku.html`, `chartkitchen-schnellstart.html`, `visuals-sicherheit.html` (Stand 23.10.2026), `downloads/latest.json` (`1.53.0.0`, 24.10.2026), `STATUS.md`, `.claude/skills/chartkitchen-report/SKILL.md`, `ibcsInspiredChartDeck/AGENT-GUIDE.md`, `appsource/` (Einreichungspaket), `pnlByDatenWG/pbiviz.json` (1.7.1.0, MIT), `dataKitchenGantt/pbiviz.json` (2.3.1.0, MIT), `git log` des Visual-Ordners.

**Quantifizierung:** `b-wirkung.js` (Playwright über `tests/rechner/lib/harness.js`), Protokoll `b-wirkung.log`. Gemessen wird `expected('oss').total` (PERT-Erwartungswert über den Horizont von 5 Jahren) und ergänzend `simulate('oss', 3000).p50`, in den Presets **Mittelstand** (3 / 40, Verteilweg offen) und **Konzern + Org-Store** (25 / 1.500, `certonly` + Modifier `orgstore`, Verteilweg `org`). Vorab die wichtigste Mechanik-Feststellung: **Erfüllungsgrade (`REQS.cap`) bewegen keine Kosten.** Seit v0.10 ist der Varianten-Effekt eine eigene Annahme (`variantG`); `capOf()` wirkt nur auf K.O. (Must und cap ≤ 1, Z. 4090), Warnung (cap 0 oder 2, Z. 4567) und den Nutzwert. Die Gegenprobe im Skript (datares und a11y oss 2 → 3) ergibt in beiden Presets 0 €.

---

## 1 · Übersicht

Legende Richtung: **→ OSS** = begünstigt Open Source · **← OSS** = belastet Open Source · **○** = neutral (Text). Stärke: schwach (nur Text oder < 1 % der Summe), mittel (1–5 %), stark (> 5 %). Stufe: **a** Text/Notiz · **b** belegte Wertänderung · **c** offen.

| # | Stelle | heute | Beleg (Datei) | Vorschlag | Richtung · Stärke | Eigeninteresse | Stufe |
|:--|:--|:--|:--|:--|:--|:--|:--|
| 1 | `FLAGS.certonly` (Z. 3510), `WIZ_FLAGS` (Z. 5171) | Label „… (AppSource)“, `excl.oss`: „aus AppSource lädt … nicht“ | visuals-sicherheit §04/§05: nicht im AppSource; Wege Datei-Import und Org-Store; `downloads/latest.json` | Text: Verteilweg richtig benennen (Datei-Import statt AppSource); Logik unverändert (`orgstore`-Modifier Z. 3512, Kopplung an `S.dist==='org'` Z. 5425, Hinweise Z. 4110–4112) | ○ · schwach | niedrig | a |
| 2 | `OPTP.libF` oss 0,9/1/1 (Z. 3582), Schalter `S.lib` (Z. 3846/3860/3886) | „Vorlagenbibliothek“ zielt auf Deneb/Core | capabilities.json: 11 Werte `C01–C13`; Doku Kap. 03/07 „elf IBCS-Vorlagen“, Galerie im Start-Hub; CHANGELOG 1.49 (17.10.), 1.50, 1.51 | Text: eingebaute Vorlagen eines fertigen Visuals gehören in `firstH`/`reuseH`, nicht in den Schalter; `libF` oss bleibt neutral (optional exakt 1/1/1) | ○ · schwach (OSS-Anteil des Schalters: 401 € / 3.401 €) | niedrig | a (+c) |
| 3a | `REQS.datares` cap oss 2 (Z. 3502) | „Ohne Zertifizierung ungeprüft“ | capabilities.json Z. 664 `privileges: []`; pbiviz.json `externalJS: null`; visuals-sicherheit §02 (12 Muster, 0 Treffer, `launchUrl`-Ausnahme), §07 Checkliste, „nicht von Microsoft auditiert“ | **cap 3** („eingeschränkt“: Netzzugriff technisch ausgeschlossen, kein Dritt-Audit); Notiz | → OSS · schwach (nur Nutzwert/Warnung) | mittel | b |
| 3b | `OPTP.govIntake` oss 8/24/60 h (Z. 3573) | Code-Review „komplett bei euch“ | dieselben; keine Stundenmessung im Repo | keine Wertänderung; srcNote: dokumentierte Prüf-Checkliste senkt den Aufwand, misst ihn nicht | ○ (c: −568 € / −2.346 € bei 8/16/40) | hoch | a (+c) |
| 4 | `REQS.agentic` cap oss 3 (Z. 3488) | Notiz „Kein Agent-Skill“ | `AGENT-GUIDE.md` (generiert, `npm run guide:check`), `.claude/skills/chartkitchen-report/SKILL.md`, Schnellstart „Für KI-Agenten“ | Notiz korrigieren; **3 bleibt** (Einzelherausgeber, ungeprüft, wie Deneb; K7-Regel) | → OSS · schwach | hoch bei 4 | a (+c) |
| 5 | `REQS.a11y` cap oss 2 (Z. 3489) | Notiz „ohne eigene Umsetzung kein Tastaturfokus und kein High-Contrast“ | capabilities Z. 660; visual.ts `isHighContrast` 5 Stellen, 35 `keydown`, Datenmarken `tabindex=0`/`role=option`/`aria-label` (Z. 16363–16372); CHANGELOG 1.6, 1.29, 1.39, 1.49, 1.50; visuals-sicherheit §06: keine formale Prüfung, Gantt ohne | **cap 3** (= Paid-Niveau, das ebenfalls nur „anfordern“ ist); Notiz je Visual | → OSS · schwach (Could, keine Kosten) | mittel | b |
| 6 | `OPTP.events` oss 0,5/1,5/3 (Z. 3578), `fixH`-Notiz (Z. 3579) | „AppSource-Update 10–14 Tage“ | CHANGELOG: 93 Releases in 16 Wochen (Jul 72 · Aug 4 · Sep 1 · Okt 16); 1.52.0 ändert bestehende Berichte „nicht abschaltbar“; 1.52.1–1.52.4 in drei Tagen; `DIST` org ×0,8 / file ×1,3 (Z. 3615/3616) | Text: Fix-Weg ohne AppSource benennen; Pinning vs. „latest“ ist über `DIST` abgebildet; **Wert bleibt** | ○ (Hebel gezeigt: Paid-Niveau wäre −2.067 € / −1.653 €) | hoch bei Senkung | a |
| 7 | `REQS.sla` cap oss 1 (Z. 3501), `OPTP.support` 0/0/1000 (Z. 3591) | „Kein SLA, Community-Support“ | STATUS.md „Umsatz über Beratung“; visuals-sicherheit §08 „ohne Gewähr … keine Zusicherung“; `supportUrl` = GitHub Issues; kein `FUNDING.yml` | sla 1 bleibt, Notiz „Beratung auf Anfrage, kein veröffentlichtes SLA“; support bleibt (Deneb-Beleg), Notiz „ChartKitchen: kein Sponsoring-Kanal“ | ○ (c: 0/0/0 → −833 € in beiden Presets) | niedrig | a (+c) |
| 8 | `REQS.mscert` cap oss 2 (Z. 3479) | „aktuell nicht zertifiziert“ | STATUS.md „technisch ready, organisatorisch hängt“; visuals-sicherheit §05 „in Vorbereitung, nicht erfolgt, kein Termin“; `appsource/` (Checkliste, Listing, Privacy) | **2 bleibt**; Notiz mit Stand 24.10.2026 | ○ | hoch bei 3 | a |
| 9 | `REQS.export` cap oss 2, `exportdata` 3 (Z. 3480/3481) | „Nur bei zertifizierten OSS-Visuals“ | Doku Kap. 07 „ehrliche Grenze“: Desktop-PDF und Druck geprüft (`test:export`, CHANGELOG 1.53), Service-Export/Abos erst nach Zertifizierung; `privileges: []` = kein `ExportContent` | **2 passt** (Desktop ist der Workaround); Notiz präzisieren; exportdata 3 bleibt | ○ | niedrig | a |
| 10 | `REQS.copilot` (Z. 3487) | vorhanden, cap 1/1/1/5 | SOURCES Z. 3663 (Learn) | Werte stimmen; `TEXT.oss.con` nennt Copilot nicht (Paid und Deneb schon) → ergänzen | ← OSS · schwach (Text) | niedrig | a |
| 11 | `OPTS.oss` (Z. 3467), `TEXT.oss` (Z. 3644–3647) | „Beta, noch nicht im AppSource“, „Bus-Faktor“ | Schnellstart „Beta-Hinweis … solange nicht im AppSource“; `git log`: ein menschlicher Autor, `CONTRIBUTING.md` mit DCO; Lizenz Apache-2.0 + NOTICE, Familie P&L 1.7.1 / Gantt 2.3.1 MIT; 93 Releases | Aussagen sind aktuell; ergänzen: Lizenz und Namensschutz, Release-Takt als „hidden“ | ○ / ← OSS · schwach | niedrig | a |
| 12 | `SOURCES` (Z. 3658–3698) | 8 Einträge berühren OSS | — | Ergänzen: visuals-sicherheit.html, chartkitchen-doku.html, capabilities.json, CHANGELOG + latest.json, AGENT-GUIDE, Learn „Capabilities / privileges“; eigene Quellen als solche kennzeichnen | ○ | niedrig | a |

---

## 2 · Die Stellen im Einzelnen

### 1 · `FLAGS.certonly`: Verteilweg richtig benennen, Logik lassen

Heute heißt der Schalter „Tenant erlaubt nur zertifizierte Visuals (AppSource)“ und begründet den K.O. mit „Nicht zertifiziertes Open-Source-Visual aus AppSource lädt im Service nicht“ (Z. 3510); der geführte Einstieg sagt dasselbe (Z. 5171). Das trifft ChartKitchen nicht: Es ist laut `visuals-sicherheit.html` §05 „nicht im Microsoft AppSource gelistet“, der Verteilweg ist der Direktdownload (`downloads/chartkitchen-byDatenWG-latest.pbiviz`, `latest.json` 1.53.0.0 vom 24.10.2026) mit anschließendem **Datei-Import je Bericht** oder **Organisationsvisual** (§04, drei Wege). Dort steht auch, was das Tenant-Setting trifft: beim Datei-Import „greift … ggf. *Add and use certified visuals only*“, Organisationsvisuale sind „von den beiden obigen Tenant-Settings nicht betroffen“. Der K.O. ist also sachlich richtig, nur die Begründung nennt den falschen Weg.

**Text-Vorschlag:** Label „Tenant erlaubt nur zertifizierte Visuals“ (ohne Klammer); `sub` wie heute, ergänzt um „trifft Visuals aus Datei-Import und unzertifizierte AppSource-Visuals“; `excl.oss`: „Ein nicht zertifiziertes Visual, das per Datei importiert wird (ChartKitchen: Direktdownload .pbiviz, nicht im AppSource), lädt im Service nicht. Zertifiziert oder über den Organizational Store bereitgestellt → Schalter darunter.“ `WIZ_FLAGS` analog („… aus Datei-Import …“).

**Logik:** keine Änderung nötig. Der Modifier `orgstore` existiert (Z. 3512), hebt den K.O. mit Warnung auf (Z. 4095), wird beim Verteilweg `org` automatisch gesetzt und bei anderen Wegen wieder gelöscht (Z. 5425), die Konsistenz-Hinweise (Z. 4110–4112) decken die drei Fehlkombinationen ab. Zwei Formulierungen hängen noch am AppSource-Bild und gelten für ChartKitchen heute nicht: `DIST.app` („OSS aus AppSource statt Org-Store halbiert den Posten“, srcNote `govRun` Z. 3574) — sachlich richtig als Zukunftsoption, sollte aber „nach Listing“ sagen.

Richtung: neutral. Eigeninteresse: niedrig (es wird nichts günstiger, es wird richtig benannt).

### 2 · `libF` und der Schalter „Vorlagenbibliothek“: eingebaute Vorlagen sind kein Bibliotheks-Effekt

Belegt ist: ChartKitchen bringt seit 1.49 (17.10.2026) **elf** IBCS-Vorlagen als Presets mit (`capabilities.json`, Enum-Werte C01–C06, C08–C10, C12, C13; die Doku Kap. 03 spricht von „den elf IBCS-Vorlagen“ — `STATUS.md` schreibt verkürzt „C01–C13“), seit 1.50/1.51 mit Vorlagen-Galerie im Start-Hub. Belegt ist außerdem, dass das **Expertenpanel 09/2026**, aus dem `firstH`/`reuseH` für oss stammen (Z. 3567/3568), vor diesen Vorlagen lag.

Die Modellfrage ist, wo das hingehört. Der Schalter `S.lib` bildet eine Bibliothek ab, die die Organisation **zusätzlich zum Werkzeug** hält (srcNote Z. 3582: IBCS Chart Builder, vegaviz, DenebIBCS, UDF-Bibliotheken). Vorlagen, die ein fertiges Visual mitbringt, sind dagegen Teil des Werkzeugs — bei Paid genauso (Zebra-/Inforiver-Vorlagen) wie bei ChartKitchen — und gehören in die Stunden je Chart. Deshalb ist `libF` paid 1/1/1 und oss 0,9/1/1 (PERT-Mittel 0,983) richtig neutral; ein Wert < 1 für oss würde die Vorlagen doppelt zählen, sobald das Panel sie einmal eingepreist hat.

Die Messung zeigt zudem, warum der Schalter trotzdem bei OSS Geld bewegt: Mit `S.lib=true` sinkt OSS im Mittelstand um 6.520 € (−8,6 %), im Konzern um 58.069 € (−10,7 %). Das kommt fast vollständig aus der **Klasse A** (operative Reports, die in jedem Ansatz über Core-Stunden laufen und dann `libF` core 0,5/0,7/0,9 bekommen, Z. 3846 `libC`) und aus der halbierten Schulungswirkung — und es trifft alle vier Ansätze (Mittelstand: Paid −4.892 €, Deneb −18.731 €, Core −23.172 €). Der **OSS-eigene** Anteil von 0,9/1/1 gegenüber exakt 1/1/1 beträgt 401 € (Mittelstand) bzw. 3.401 € (Konzern).

**Vorschlag (a):** srcNote `libF` und die Beschreibung des Schalters ergänzen: „Eingebaute Vorlagen eines fertigen Visuals (Paid: Hersteller-Vorlagen; ChartKitchen: elf IBCS-Vorlagen C01–C13 seit 1.49 mit Galerie im Start-Hub) sind kein Bibliotheks-Effekt, sondern stecken in den Stunden je Chart.“ **Optional (c):** oss auf exakt 1/1/1 setzen, damit die Neutralität sichtbar ist — wirkt gegen OSS (+401 € / +3.401 €), ohne Deneb/Core-Hebel zu verwässern. **Offen (c):** Das Panel kennt die Vorlagen nicht; die bestehende srcNote `reuseH` („fünf Charts mit beiden Werkzeugen messen“) ist der richtige Weg, nicht eine Schätzkorrektur.

Richtung: neutral bis leicht gegen OSS. Eigeninteresse: niedrig.

### 3 · `datares` und `govIntake`: `privileges: []` ist Fakt, Stunden sind keiner

Die Notiz „Ohne Zertifizierung ungeprüft: eigenes Code-Review nötig“ (Z. 3502) unterschlägt eine Tatsache, die der Host durchsetzt: `capabilities.json` Z. 664 `"privileges": []`, `pbiviz.json` `externalJS: null`, `dependencies: null`. `visuals-sicherheit.html` §02 erklärt die Bedeutung („kein WebAccess …, kein ExportContent, kein LocalStorage“; seit API 4.6.0 müssen Berechtigungen deklariert werden) und dokumentiert einen Bundle-Scan mit zwölf Mustern und 0 Treffern in allen drei Visuals, mit der einen Ausnahme `host.launchUrl` für „Doku öffnen“ (ohne Daten). Dieselbe Seite begrenzt sich selbst: „Ein Suchlauf belegt das Fehlen der genannten Muster, nicht das Fehlen jeder denkbaren Umgehung … Die Visuals sind nicht von Microsoft auditiert.“

Damit ist `cap 2` („nur Workaround“) für ChartKitchen falsch — es gibt keinen Workaround, es gibt eine deklarierte und vom Host erzwungene Nulllizenz für Netzzugriff. `cap 4` („gut“) wie bei Paid wäre aber ein Vorgriff: Paid bezieht die 4 aus dem Dritt-Review der Zertifizierung, das hier fehlt. **Vorschlag (b): cap oss 3** („eingeschränkt“), Notiz: „Je Visual `capabilities.privileges` prüfen. ChartKitchen, P&L, Gantt: `privileges: []` (vom Host durchgesetzt, kein Netzzugriff), Bundle-Scan und Admin-Checkliste dokumentiert; kein Microsoft-Audit, eine Ausnahme `launchUrl` auf Klick.“ Kostenwirkung: keine (Gegenprobe 0 €); bei Priorität Must verschwindet die Warnung (cap 2), ein K.O. gab es weder vorher noch nachher.

`govIntake` oss 8/24/60 h (Z. 3573) bleibt. Die Checkliste (§07, sieben Schritte, PowerShell-Befehle) senkt den Review-Aufwand plausibel, aber **gemessen ist nichts**, und die Freigabe-Stunden sind der Posten, bei dem die Herausgeber am wenigsten neutral sind. Zur Einordnung der Hebelgröße: 8/16/40 h würden im Mittelstand −568 € (−0,7 %), im Konzern −2.346 € (−0,4 %) bringen; die vorhandene Mechanik `osscert` (Paid-Wert nach Zertifizierung) −1.223 € bzw. −5.053 €. srcNote ergänzen: „Eine dokumentierte Prüf-Checkliste des Herausgebers (visuals-sicherheit.html §07) senkt den Aufwand des Reviews, ersetzt ihn nicht und ist nicht gemessen.“

Richtung: cap → OSS, schwach; govIntake neutral. Eigeninteresse: mittel (cap), hoch (Stunden).

### 4 · `agentic`: Notiz ist falsch, Wert ist richtig

„Kein Agent-Skill, aber offener Quellcode“ (Z. 3488) stimmt seit Monaten nicht: `ibcsInspiredChartDeck/AGENT-GUIDE.md` ist eine maschinenlesbare Property-Referenz, seit 1.53 aus `capabilities.json` und `settings.ts` generiert (`npm run guide`, Drift-Prüfung `guide:check`); `.claude/skills/chartkitchen-report/SKILL.md` ist ein Skill im Modus „vorbereiten + Plan“ mit Referenz-Instanz; der Schnellstart wirbt mit „Für KI-Agenten: der Agent-Guide“. **Vorschlag (a):** Notiz: „Agent-Guide (generierte Property-Referenz) und Skill des Herausgebers vorhanden; Einzelherausgeber, nicht unabhängig geprüft.“

Der Wert 3 bleibt. Runde 2 (K7) hat Deneb mit „Community-Skill, Einzelautor, Reifegrad ungeprüft“ auf 3 gesetzt und festgehalten, dass der Rechner an Preview- oder ungeprüfte Werkzeugketten keine 5 vergibt; ChartKitchens Skill ist nach denselben Kriterien ein Einzelherausgeber-Skill ohne Fremdprüfung. Eine 4 würde das eigene Projekt auf das Niveau der Microsoft-Skills heben — das gehört in Stufe c, bis jemand Außenstehender den Skill gegen ein echtes PBIP getestet hat.

Richtung: → OSS, schwach (Text). Eigeninteresse: hoch bei Wertänderung.

### 5 · `a11y`: der Code widerspricht der Notiz

Die Notiz „Opt-in im Visual-Code; ohne eigene Umsetzung kein Tastaturfokus und kein High-Contrast-Modus“ beschreibt das SDK, nicht ChartKitchen. Belegt im Repo:

- `capabilities.json` Z. 660 `"supportsKeyboardFocus": true` (Gegenprobe: Gantt setzt es nicht, visuals-sicherheit §06).
- `src/visual.ts`: `colorPalette.isHighContrast` an fünf Stellen (Z. 1618, 1647, 2688, 3711, 5732) mit eigener Palette (Muster statt Farbe, Tour-Karte 8 „Dark mode & high contrast“); 35 `keydown`-Handler; Datenmarken erhalten im interaktiven Kontext `tabindex="0"`, `role="option"` und ein `aria-label` (Z. 16363–16372), Hub- und Bedienknöpfe `role="button"`, `aria-pressed`, `aria-label`, Fokusring.
- CHANGELOG: 1.6 (`aria-expanded`), 1.29 (barrierefreie Standardfarbe), 1.39 (WCAG-Kontrast für Sekundärtexte), 1.49 (Hochkontrast-Palette des Hosts), 1.50 („alle Hub-Knöpfe per Tab erreichbar“); README Z. 172.
- Grenze: visuals-sicherheit §06 „Eine formale Barrierefreiheits-Prüfung (z. B. mit Screenreader) liegt für keines der Visuals vor.“

**Vorschlag (b): cap oss 3** („eingeschränkt“) — dasselbe Niveau wie Paid, dessen 3 ebenfalls nur auf „Konformitätsaussage anfordern“ beruht. Notiz: „Je Visual prüfen. ChartKitchen und P&L: Tastaturfokus (`supportsKeyboardFocus`), Hochkontrast, ARIA-Beschriftungen im Code belegt; keine formale Prüfung (Screenreader, EN 301 549); Gantt ohne beides.“ Kostenwirkung keine; die Anforderung ist Could.

Richtung: → OSS, schwach. Eigeninteresse: mittel — es wird nur auf das Paid-Niveau gehoben, und nur mit Code-Beleg.

### 6 · `events` und `fixH`: Release-Takt sagt nichts über Brüche, Pinning ist schon drin

Zahlen aus dem CHANGELOG: 93 Versionen zwischen 1.1.0 (06.07.2026) und 1.53.0 (24.10.2026) — Juli 72, August 4, September 1, Oktober 16; allein 1.45 bis 1.53 sind 14 Releases in neun Tagen. 1.52.0 (20.10.) ändert ausdrücklich das Bild bestehender Berichte: „Das ist gewollt und nicht abschaltbar … wer Seiten mit festen Erwartungen an Panel-Höhen gebaut hat (Screenshots, Abo-PDFs), sieht sie nach dem Update neu an.“ 1.52.1 bis 1.52.4 folgten binnen drei Tagen. `latest.json` zeigt immer auf die neueste Version.

Für `events` (Anzahl Ereignisse, die Reports **brechen**) folgt daraus keine Zahl: Eine beabsichtigte Bildänderung ist kein Bruch, aber ein Review-Anlass; und wer per Direktdownload „latest“ zieht, bekommt jede der 16 Oktober-Versionen, wer im Org-Store pinnt, entscheidet selbst. Genau das bildet `DIST` bereits ab (Z. 3615/3616: Org-Store `ev` ×0,8, Datei-Import ×1,3). Messung: Verteilweg offen → Org-Store senkt OSS im Mittelstand um 1.190 € (−1,6 %); Datei-Import erhöht um 4.051 € (+5,3 %), im Konzern um 10.525 € (+1,9 %). Der Wert 0,5/1,5/3 bleibt; die Hebelgröße einer Angleichung an Paid wäre −2.067 € bzw. −1.653 €, ist aber nicht vorgeschlagen — der hohe Release-Takt spricht eher gegen eine Senkung.

**Text (a):** `fixH`-srcNote: „OSS: kein SLA. Ohne AppSource kommt ein Fix als Release über den Direktdownload (ChartKitchen 1.52.1 → 1.52.4 in drei Tagen); der AppSource-Zyklus (10–14 Tage Produktion, Zertifizierung bis 3 Wochen) gilt erst nach einem Listing.“ `events`-srcNote ergänzen: „ChartKitchen 1.52.0: beabsichtigte Änderung des Bilds bestehender Berichte ohne Schalter — kein Bruch, aber ein Prüfanlass; Org-Store-Pinning (×0,8) bildet die Versionshoheit ab.“

Richtung: neutral. Eigeninteresse: hoch bei jeder Senkung, deshalb keine.

### 7 · `sla` und `support`: Beratung ist kein SLA

`STATUS.md`: „Geschäftsmodell: kostenlos, Open Source …, für immer frei; Umsatz über Beratung.“ `visuals-sicherheit.html` §08: „Die Visuals werden ohne Gewähr bereitgestellt … Diese Seite ist keine Zusicherung im Rechtssinn.“ `supportUrl` ist der GitHub-Issue-Tracker. Es gibt weder ein SLA-Produkt noch eine veröffentlichte Reaktionszeit noch einen Sponsoring-Kanal (`FUNDING.yml` fehlt). `sla` cap 1 („nicht möglich“) bleibt damit richtig; Notiz präziser: „Kein SLA-Produkt; Issues auf GitHub; Beratung des Herausgebers auf Anfrage, ohne veröffentlichten Preis oder Reaktionszeit.“

`support` 0/0/1000 € (Z. 3591) ist ein Deneb-Beleg (Sponsoring-Stufen) und wirkt im Erwartungswert mit 167 €/Jahr, 833 € über fünf Jahre — das ist der Posten „Lizenz“ der OSS-Spalte in beiden Presets. Für ChartKitchen gibt es den Kanal nicht; weil die Option generisch ist, bleibt der Wert, die srcNote sollte sagen: „ChartKitchen: kein Sponsoring-Kanal, der Wert gilt für Projekte mit Sponsoring.“ Stufe c: 0/0/0 → −833 € in beiden Presets.

Richtung: neutral. Eigeninteresse: niedrig.

### 8 · `mscert`: Stand aktualisieren, Wert halten

Stand laut Repo (24.10.2026): `STATUS.md` „AppSource-Listing in Vorbereitung (hängt organisatorisch, technisch ready)“; `visuals-sicherheit.html` §05 „Die Einreichung ist in Vorbereitung und noch nicht erfolgt; ein Zeitpunkt oder Ergebnis lässt sich nicht zusagen“; Ordner `appsource/` mit `SUBMISSION-CHECKLIST.md`, `PRIVACY.md`, Listing-Text, Icon, vier Screenshots. Für P&L und Gantt liegt kein Paket vor.

Der Wert 2 („nur Workaround“ = Org-Store) ist korrekt und bleibt; eine 3 wäre ein Vorgriff auf eine Entscheidung, die Microsoft trifft. Notiz: „Je Visual. ChartKitchen: nicht zertifiziert; Einreichungspaket vorbereitet, nicht eingereicht, kein Termin (Stand 24.10.2026). P&L und Gantt: kein Paket.“ Das Dossier sollte nach einem Listing zuerst hier wieder ansetzen — dann ändern sich `mscert`, `export`, `copyppt`, `certonly`-K.O. und die `DIST.app`-Faktoren zugleich.

Richtung: neutral. Eigeninteresse: hoch bei jeder Anhebung.

### 9 · `export` und `exportdata`: die Zwei stimmt, die Notiz nicht ganz

Die Doku nennt in Kapitel 07 die „ehrliche Grenze“: PDF-/PowerPoint-Export und Abo-Mails im Service rendern nur zertifizierte Visuals; Desktop-PDF und Druck funktionieren, dafür gibt es seit 1.53 eine Prüfsuite (`npm run test:export`, A4-quer, halbe Seite, PowerPoint-Kachel, HD und Full HD). `visuals-sicherheit.html` §04 bestätigt: Rendering-Events umgesetzt, Export im Service erst nach Zertifizierung. Das ist genau „nur Workaround“ (Desktop-Export, Screenshot, natives Visual für Exportseiten): **cap 2 bleibt.** Notiz: „Service-Export und Abos nur zertifiziert; Desktop-PDF und Druck funktionieren (ChartKitchen: geprüftes Export-Layout 1.53).“

`exportdata` 3: `privileges: []` heißt auch kein `ExportContent`, also kein visual-eigener Excel-Export. Ob „Daten anzeigen“ des Hosts die Zahlen liefert, ist im Repo nicht geprüft — deshalb 3 („eingeschränkt“) belassen, Notiz um den `privileges`-Hinweis ergänzen.

Richtung: neutral. Eigeninteresse: niedrig.

### 10 · `copilot`: vorhanden, Werte stimmen, ein Text fehlt

`REQS.copilot` existiert (Z. 3487) mit cap 1/1/1/5 und identischer Notiz für Paid, OSS und Deneb; Quelle ist Learn (SOURCES Z. 3663). Das ist konsistent — Copilot kennt keine Custom Visuals, egal von wem. Ungleich ist nur die Textseite: `TEXT.paid.con` und `TEXT.deneb.con` nennen Copilot, `TEXT.oss.con` nicht. **Vorschlag (a):** „Copilot liest und erzeugt keine Custom Visuals“ auch bei OSS aufnehmen. Richtung: ← OSS, schwach (nur Text, stellt Symmetrie her).

### 11 · `OPTS.oss` / `TEXT.oss`: wenig veraltet, etwas fehlt

Gegen den Repo-Stand gehalten:

- „ChartKitchen: Beta, noch nicht im AppSource“ — **aktuell.** Der Schnellstart selbst sagt: „Solange ChartKitchen nicht im Microsoft AppSource gelistet ist, ist jeder Build eine Beta-Version — nicht von Microsoft zertifiziert.“ Version 1.53.0.0 ändert daran nichts.
- „Bus-Faktor: oft ein Maintainer“ — **aktuell.** `git log` des Visual-Ordners zeigt einen menschlichen Autor (29 Commits) neben KI-assistierten Commits (125); `CONTRIBUTING.md` mit DCO macht Beiträge formal möglich, belegt aber keinen zweiten Maintainer.
- „Kein IBCS-Zertifikat verfügbar“ — **aktuell** und gewollt (`STATUS.md`: „bewusst nicht IBCS-zertifiziert“; Doku-Footer: IBCS ist eine eingetragene Marke, das Visual steht in keiner Verbindung zur Association).
- **Fehlt:** die Lizenz. `pro` sagt „Code offen, forkbar“, nennt aber nicht Apache-2.0 (ChartKitchen, mit `NOTICE`: Namen und Logo sind ausgenommen) bzw. MIT (P&L 1.7.1, Gantt 2.3.1). Für die Exit-Frage ist das relevant: forkbar ja, unter eigenem Namen.
- **Fehlt:** der Release-Takt als versteckte Kostenstelle: „93 Versionen in 16 Wochen (07–10/2026): ohne Versionshoheit über den Org-Store wird jede Version zur Prüfaufgabe.“ Das wirkt gegen OSS und gehört deshalb hin.
- Nebenbefund: `STATUS.md` führt dataKitchenGantt mit 1.15.0.0, `pbiviz.json` sagt 2.3.1.0 — Repo-Pflege, nicht Rechner.

Alles Stufe a. Richtung: neutral bis leicht gegen OSS. Eigeninteresse: niedrig.

### 12 · `SOURCES`: was OSS heute belegt und was fehlt

OSS-relevant sind heute: Z. 3659 (Org-Store-Regeln), 3660 (Zertifizierung → Export/Abos), 3662 (Org-Visuals: Löschen irreversibel, kein Report Server), 3685 (Admin-Portal: certified-only trifft Org-Store nicht), 3681 (Whitepaper, `devH`), 3686 (fetchMoreData), 3690–3692 (Tastatur/Hochkontrast Opt-in, Core eingebaut). Keine davon belegt die ChartKitchen-spezifischen Aussagen in den Notizen (nicht zertifiziert, `privileges`, Vorlagen, Agent-Guide).

**Ergänzen (a):**

| Quelle | belegt | Badge |
|:--|:--|:--|
| `visuals-sicherheit.html` (Sicherheit & Betrieb, 23.10.2026) | `privileges: []`, Bundle-Scan, Freigabewege, Export-Grenze, Zertifizierungsstand, Barrierefreiheits-Tabelle | V, **eigene Quelle** |
| `chartkitchen-doku.html` Kap. 03/07 | elf IBCS-Vorlagen, Start-Hub, „ehrliche Grenze“ beim Export | V, eigene Quelle |
| `ibcsInspiredChartDeck/capabilities.json` | `privileges`, `supportsKeyboardFocus`, Vorlagen-Enum | V, eigene Quelle |
| `ibcsInspiredChartDeck/CHANGELOG.md` + `downloads/latest.json` | Version 1.53.0.0 vom 24.10.2026, Release-Takt, 1.52.0-Bildänderung | V, eigene Quelle |
| `ibcsInspiredChartDeck/AGENT-GUIDE.md` + `.claude/skills/chartkitchen-report` | Agent-Guide, Skill | V, eigene Quelle |
| Microsoft Learn: Capabilities, `privileges` (API 4.6) | Berechtigungen müssen deklariert werden, Host setzt sie durch | V |

Das Badge-System kennt keine Stufe „eigene Quelle“; das Whitepaper (Z. 3681) steht heute als „V“ ohne Kennzeichnung. Vorschlag: die Beschreibung mit „(eigene Quelle des Herausgebers)“ beginnen lassen, damit der Interessenkonflikt an der Quelle sichtbar ist, nicht nur im Hinweis.

---

## 3 · Quantifizierung (aus `b-wirkung.log`)

Horizont 5 Jahre, Erwartungswert = PERT-Mittel, P50 aus 3.000 Simulationsläufen. Paid zum Vergleich: Mittelstand 66.919 €, Konzern + Org-Store 712.636 €.

| Fall | Mittelstand EW | Δ | Mittelstand P50 | Konzern + Org-Store EW | Δ | Konzern P50 |
|:--|--:|--:|--:|--:|--:|--:|
| Basis (heutige Werte) | 76.003 € | – | 75.279 € | 544.289 € | – | 537.299 € |
| 3 · govIntake 8/24/60 → 8/16/40 h (c) | 75.435 € | −568 € (−0,7 %) | 74.718 € | 541.943 € | −2.346 € (−0,4 %) | 534.474 € |
| 3 · govIntake → 6/12/30 h (c) | 75.130 € | −873 € (−1,1 %) | 74.406 € | 540.680 € | −3.610 € (−0,7 %) | 533.382 € |
| 3 · Modifier `osscert` (vorhandene Mechanik) | 74.780 € | −1.223 € (−1,6 %) | 74.069 € | 539.236 € | −5.053 € (−0,9 %) | 531.814 € |
| 6 · Verteilweg offen → Org-Store (vorhanden) | 74.813 € | −1.190 € (−1,6 %) | 74.085 € | 544.289 € | 0 € (ist Basis) | 537.299 € |
| 6 · Verteilweg offen → Datei-Import (vorhanden) | 80.054 € | +4.051 € (+5,3 %) | 79.286 € | 554.814 € | +10.525 € (+1,9 %) | 546.436 € |
| 6 · events → Paid-Niveau 0,2/1/2 (nicht vorgeschlagen) | 73.937 € | −2.067 € (−2,7 %) | 73.174 € | 542.636 € | −1.653 € (−0,3 %) | 535.566 € |
| 2 · Schalter Vorlagenbibliothek an, libF oss heute | 69.483 € | −6.520 € (−8,6 %) | 68.955 € | 486.221 € | −58.069 € (−10,7 %) | 484.256 € |
| 2 · Schalter an, libF oss 1/1/1 (neutral, c) | 69.884 € | −6.119 € | – | 489.622 € | −54.667 € | – |
| 2 · Schalter an, libF oss 0,8/0,9/1 (c, nicht empfohlen) | 67.483 € | −8.520 € (−11,2 %) | 66.986 € | 469.213 € | −75.076 € (−13,8 %) | 467.966 € |
| 7 · support 0/0/1000 → 0/0/0 € (c) | 75.170 € | −833 € (−1,1 %) | 74.383 € | 543.456 € | −833 € (−0,2 %) | 536.125 € |
| Gegenprobe · cap datares oss 2 → 3 | 76.003 € | 0 € | 75.279 € | 544.289 € | 0 € | 537.299 € |
| Gegenprobe · cap a11y oss 2 → 3 | 76.003 € | 0 € | 75.279 € | 544.289 € | 0 € | 537.299 € |

Lesehilfe zum Schalter „Vorlagenbibliothek“: Er senkt alle vier Ansätze (Mittelstand: Paid −4.892 €, OSS −6.520 €, Deneb −18.731 €, Core −23.172 €), weil die Klasse-A-Reports in jedem Ansatz über Core-Stunden laufen und die Schulung halbiert wird. Der OSS-spezifische Anteil des `libF`-Werts beträgt 401 € bzw. 3.401 €. Die Rangfolge Paid vor OSS im Mittelstand (Abstand 9.084 €) kippt durch keinen der hier belegten Vorschläge; sie kippt erst, wenn der Schalter gesetzt ist — für alle Ansätze gleich.

Posten der OSS-Basis, Mittelstand: Lizenz/Support 833 · Aufbau 6.335 · Rollout 22.290 · Schulung 8.474 · Wartung 20.965 · Governance 12.777 · Risiko 4.329 €. Konzern + Org-Store: 833 · 7.154 · 256.808 · 46.387 · 91.256 · 109.920 · 31.930 €.

---

## 4 · Empfehlung in drei Stufen

**(a) Nur Text und Notizen aktualisieren — ohne Zahl, ohne Rangfolge-Effekt, sofort umsetzbar**

1. `FLAGS.certonly` und `WIZ_FLAGS`: „Datei-Import“ statt „AppSource“, Label ohne Klammer; `DIST.app`/`govRun`-Note „nach Listing“.
2. `libF`-srcNote und Schalter-Beschreibung: eingebaute Vorlagen (ChartKitchen elf, C01–C13, seit 1.49) gehören in die Stunden je Chart.
3. `REQS.agentic` Notiz oss: Agent-Guide und Skill vorhanden, Einzelherausgeber, ungeprüft.
4. `OPTP.govIntake` srcNote: dokumentierte Checkliste senkt, misst nicht.
5. `fixH`-Notiz (Fix-Weg ohne AppSource) und `events`-srcNote (1.52.0 als Prüfanlass, Pinning über `DIST`).
6. `REQS.sla` Notiz („Beratung auf Anfrage, kein SLA“), `support`-srcNote („ChartKitchen: kein Sponsoring-Kanal“).
7. `REQS.mscert` Notiz mit Stand 24.10.2026 (Paket vorbereitet, nicht eingereicht, kein Termin; P&L/Gantt ohne Paket).
8. `REQS.export` Notiz (Desktop-PDF/Druck funktionieren, Service erst nach Zertifizierung), `exportdata` Notiz (`privileges: []` = kein `ExportContent`).
9. `TEXT.oss.con`: Copilot ergänzen; `TEXT.oss.pro`: Lizenz Apache-2.0/MIT mit Namensschutz; `TEXT.oss.hidden`: Release-Takt.
10. `SOURCES`: sechs Einträge ergänzen, eigene Quellen als solche kennzeichnen (auch Z. 3681).

**(b) Belegte Wertänderungen — zwei Erfüllungsgrade, keine Kostenannahme**

- `REQS.datares` cap oss **2 → 3**: `privileges: []` ist vom Host erzwungen und im Manifest nachlesbar; 3 statt 4, weil das Dritt-Audit fehlt. Richtung → OSS, Wirkung nur auf Warnung und Nutzwert (0 € Kosten).
- `REQS.a11y` cap oss **2 → 3**: `supportsKeyboardFocus`, Hochkontrast und ARIA im Code belegt; 3 statt mehr, weil keine formale Prüfung vorliegt und die Zeile generisch für OSS gilt (Gantt hätte 1). Richtung → OSS, 0 € Kosten.

Beide heben das eigene Visual nur auf das Niveau, das der Rechner Paid ohne Beleg zugesteht. Wer das Eigeninteresse-Risiko dennoch scheut, setzt stattdessen nur die Notizen (Stufe a) — dann bleibt eine Zahl stehen, die der Code widerlegt.

**(c) Offen — Einschätzungen ohne Beleg, nicht ändern**

- `govIntake` oss senken (8/16/40 oder weniger): plausibel durch die Checkliste, nicht gemessen; −568 € / −2.346 €. Erst mit einer protokollierten Freigabe in einer fremden Organisation.
- `events` oss an Paid angleichen: −2.067 € / −1.653 €; der Release-Takt spricht dagegen.
- `agentic` oss 4: erst nach Fremdtest des Skills gegen ein echtes PBIP.
- `firstH`/`reuseH` oss nach Vorlagen neu einholen: das Panel 09/2026 kennt die Vorlagen nicht; Messung statt Schätzung („fünf Charts mit beiden Werkzeugen“).
- `libF` oss exakt 1/1/1: kosmetisch (+401 € / +3.401 € gegen OSS), macht die Neutralität sichtbar.
- `support` oss 0/0/0 für ChartKitchen: −833 €; die Option ist generisch, deshalb bleibt der Deneb-Wert.
- `mscert`, `export`, `copyppt`, `certonly`-K.O., `DIST.app`: alle zugleich neu bewerten, sobald ein AppSource-Listing vorliegt — vorher nichts.

Summe der Wirkung aller Stufe-b-Vorschläge auf die Gesamtkosten: 0 €. Summe der Stufe-c-Posten mit Kostenwirkung (govIntake 8/16/40, events auf Paid-Niveau, support 0), wenn man sie alle zugunsten von OSS setzte: rund −3.470 € (−4,6 %) im Mittelstand, −4.830 € (−0,9 %) im Konzern (additiv genähert) — die Rangfolge änderte sich in keinem der beiden Presets.
