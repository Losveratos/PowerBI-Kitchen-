# Kritische Prüfung: OPTIONS-Annahmen `paid` und `oss`

**Prüfgegenstand:** `/home/user/PowerBI-Kitchen-/visual-standards-rechner.html`, `const OPTP` (Z. 490–514), `const LIC` (Z. 529), Volumenstaffel (Z. 633/683), Site-Presets (Z. 793), Rechenkern `calc` (Z. 609–690).
**Prüfer:** unabhängiger Review, Stand 10.09.2026.
**Methode:** Code-Lektüre, Nachbau des Rechenkerns als Erwartungswert-Modell (PERT-Mittel, ohne Simulation) zur Quantifizierung der Hebel, Web-Recherche zu Belegen.

## Netz-Situation in dieser Sandbox — bitte zuerst lesen

- **Direkter Abruf von Herstellerseiten ist blockiert.** `zebrabi.com`, `help.zebrabi.com` und `inforiver.com` liefern `EGRESS_BLOCKED` über den Proxy. Ich konnte **keine Preisseite im Original lesen**.
- **Websuche funktioniert** und liefert Snippets aus diesen Seiten. Alle Preisangaben unten sind daher **Suchmaschinen-Snippets, nicht am Original verifiziert** — genau die Qualitätsstufe „S“, die die Datei selbst vergibt. Das ist korrekt gelabelt und soll so bleiben.
- **Microsoft Learn ist erreichbar** (über den Learn-MCP). Alles, was mit Zertifizierung, Lizenz-Durchsetzung und Visual-API zu tun hat, ist **hart verifizierbar** — und ich habe es verifiziert.
- Ich habe **keine Zahl erfunden** und keine Quelle konstruiert. Wo unten „keine“ steht, gibt es tatsächlich keinen Beleg, und das Urteil beruht auf Modelllogik.

---

## (a) Parametertabelle

Legende Urteil: **B** = behalten · **Ä** = ändern · **U** = unsicher, aber plausibel.
Konfidenz bezieht sich auf mein Urteil, nicht auf den Default.

### Ansatz `paid`

| id | aktuell (min·wahrsch·max) | Evidenz | Urteil | Vorschlag | Konfidenz |
|---|---|---|---|---|---|
| `lic` | 40 · 80 · 150 €/Nutzer·Jahr | Zebra Personal 299 $/Jahr, Team 799 $/Jahr für 5 User (≈160 $/User) — [Suche, zebrabi.com/pricing](https://zebrabi.com/pricing/), nicht am Original geprüft; Inforiver Analytics+ 3,00 → 2,40 $/User·Monat = 36 → 29 $/Jahr — [Suche, inforiver.com/analytics-plus/pricing](https://inforiver.com/analytics-plus/pricing/) | **U** | Spanne behalten, aber **Label korrigieren**: 40–150 € deckt Inforiver-Volumen bis Zebra-Team ab, **nicht** Zebra-Listenpreis (≈270 €). Alternativ min auf 25 senken, damit die Inforiver-Indikation ohne Preset-Klick im Band liegt. | mittel |
| `licSite` | 12.000 · 40.000 · 96.000 € | Widerspruch **aufgelöst**: 96 k$ war der alte *flat* Domain-wide-Preis (Inforiver-Blog 02/2024), 12 k$ ist der heutige *Einstieg* der verhandelten, größenabhängigen Domain-wide-Lizenz — [Suche, inforiver.com/blog/general/february-2024-update](https://inforiver.com/blog/general/february-2024-update/) und [zebrabi.com/reviews/inforiver-review](https://zebrabi.com/reviews/inforiver-review/) | **B** (Spanne) / **Ä** (Note) | Spanne halten, `srcNote` umschreiben: kein „widersprüchliche Quellen“, sondern „12 k$ Einstieg (2026, verhandelt) bis 96 k$ (alter Flat-Preis 2024)“. **Währung:** Werte sind $, werden als € gerechnet (≈ −8 % Understatement). | hoch |
| `cuUplift` | 0 · 1 · 3 % | keine | **B** | Wirkungslos, solange `capacityCost = 0`. Sachlich plausibel: Custom Visuals rendern clientseitig, CU-Last entsteht über Queries, nicht über das Visual. paid = oss ist neutral und richtig. | mittel |
| `licInfl` | 0 · 5 · 20 %/Jahr | keine herstellerspezifische Preiserhöhung auffindbar (mehrere Suchen); Power BI Pro +40 % 04/2025 ist ein Microsoft-Einmalsprung nach ~10 Jahren (≈3,4 %/Jahr äquivalent) — [MS Blog](https://powerbi.microsoft.com/en-us/blog/important-update-to-microsoft-power-bi-pricing/) | **Ä** | **[0 · 4 · 12]**. Begründung: (1) der zitierte Beleg trägt 5 % nicht; (2) durch die Rechtsschiefe liegt der **Erwartungswert des Defaults bei 6,67 %/Jahr**, nicht bei 5 % — bei H=10 sind das ~9 % mehr Lizenzkosten als der Nutzer erwartet. Gegenüber `wageInfl` (EV 2,58 %) ist das ein struktureller Nachteil für paid. | mittel |
| `licAdmH100` | 0,5 · 1,5 · 4 h je 100 Nutzer·Jahr | Named-User-Modell und Zuweisung im M365 Admin Center **verifiziert** — [MS Learn, ISV app license management](https://learn.microsoft.com/partner-center/marketplace-offers/isv-app-license-power-bi-visual), [licensing-api](https://learn.microsoft.com/power-bi/developer/visuals/licensing-api) | **Ä** | Wert plausibel, **Skalierung falsch**: Zuweisung läuft über Entra-Sicherheitsgruppen, der Aufwand ist weitgehend fix plus Stufen, nicht linear in der Nutzerzahl. Bei 10.200 Nutzern ergibt der Default **76.400 € reine Lizenzadministration über 5 Jahre** — unglaubwürdig. Vorschlag: Mode auf 1,0 und im Kern degressiv rechnen (z. B. `sqrt(users/100)`), oder Deckel bei ~40 h/Jahr. | hoch |
| `ext` | 0 · 20 · 50 % | keine | **Ä** (im Verhältnis zu oss) | Sachlich für sich plausibel, aber **paid < oss ist nicht begründbar** (siehe Bias-Abschnitt): Paid-Rollouts laufen häufig partnergetrieben — das Panel enthält dafür sogar ein eigenes Profil (E14 „graphomate/Inforiver-Implementierungspartner“). Vorschlag: paid und oss gleichsetzen, z. B. beide **[0 · 25 · 55]**. | mittel |
| `setupH` | 18 · 35 · 55 h | Panel (20 simulierte Profile) | **Ä** (nach oben, größenabhängig) | Für KMU plausibel. Für Konzern/Site-Lizenz **zu niedrig**: Einkauf, Legal, AVV und Verhandlung eines 200–300 k€-Rahmenvertrags sind nirgends im Modell. Im Preset „gross“ stehen 6.323 € Aufbau gegen 331.602 € Lizenz — das ist unrealistisch. Vorschlag: entweder Spanne auf **[18 · 45 · 110]** oder ein eigener, mengenabhängiger Posten „Beschaffung/Vertrag“ für paid. | mittel |
| `firstH` | 2 · 4 · 7,5 h | Panel; kein Literaturbeleg (Recherche-Notiz sagt das selbst) | **U** | Behalten. Ist der Kern der Paid-These („IBCS out of the box“) und mit Zebra/Inforiver-Praxis vereinbar. Aber: **kein einziger externer Beleg**, und Vendor-Zahlen (Zebra „46 % weniger Entwicklungszeit“) sind interessengeleitet und stammen aus einer Lesegeschwindigkeitsstudie — bitte nicht nachträglich als Stütze verwenden. | mittel |
| `reuseH` | 0,5 · 1 · 2 h | Panel | **U** | Absolut plausibel. Kritisch ist nicht der paid-Wert, sondern der **Faktor 2 zu oss** (siehe unten) — dieser eine Parameter verschiebt im Preset „gross“ rund **254.000 €**. | hoch (zur Hebelwirkung) |
| `trainH` | 5 · 8,5 · 15 h | Panel; Zebra betreibt eine öffentliche Academy/Zertifizierung (Snippet) | **B** | — | mittel |
| `lightH` | 0,5 · 1,5 · 3 h | Panel | **B** | — | mittel |
| `rampH` | 8 · 16 · 40 h | **kein Panelwert** (nicht in `agg.json`), Badge „E“ | **B** (Wert) / **Ä** (Kennzeichnung) | Plausibel, aber es sieht wie ein Panelwert aus und ist keiner. Siehe Abschnitt „Bias“, Punkt 8. | mittel |
| `supH100` | 2 · 4 · 6,25 h je 100 Viewer·Jahr | Panel; Zebra-Support-Reaktion „12–24 Werkstunden“ (Snippet, [zebrabi.com/contact-support](https://zebrabi.com/contact-support/)) | **B** | Hinweis: Der Hersteller-Support entlastet den *zweiten* Level, nicht den ersten; die Fachbereichsfragen („warum sieht das so aus“) landen weiterhin intern. Der Wert bildet das ab. | mittel |
| `govIntake` | 4 · 8 · 16 h | Zertifizierung ersetzt kein Kundenreview, Microsoft ist nicht Autor — **verifiziert** ([MS Learn, Certified visuals](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified)) | **Ä** (Bezugsgröße) | Wert ok, **Multiplikation mit `S.types` ist falsch**: Security-Review und AVV gelten je *Visual-Paket*, nicht je Chart-Typ. Ein Zebra-Review deckt alle Chart-Typen ab. Vorschlag: `govOnce` nicht mit `S.types` multiplizieren, sondern höchstens mit einem kleinen Variantenfaktor. | hoch |
| `govRun` | 6 · 16 · 42 h/Jahr | Jede Vendor-Version wird erneut zertifiziert; Update-Zertifizierung bis 3 Wochen; abgelehnte Updates statt Dezertifizierung — **verifiziert** ([MS Learn FAQ](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-faq)) | **B** | 16 h/Jahr ≈ 1,3 h/Monat für Versions-Review und Tenant-Settings ist realistisch. | mittel |
| `govAudit` | 2 · 6 · 16 h/Jahr | keine | **Ä** | Fragwürdige Richtung: Bei einem *Closed-Source*-Visual kann die Revision die Rendering-Logik gerade **nicht** einsehen; das Zertifikat prüft Sicherheit, nicht Richtigkeit der Darstellung. paid < oss ist damit nicht begründet. Vorschlag: paid **[3 · 7 · 16]**, oss auf gleiches Niveau (siehe unten). | niedrig |
| `course` | 0 · 250 · 800 € | EPC Group 500–2.000 $ je Kopf (Snippet, nicht am Original geprüft) | **U** | Kleine Doppelzählung: `support`-Note sagt „Paid: im Preis enthalten“, Enterprise-Pakete enthalten laut Snippet Onboarding/CSM. Dann sind 250 € Kurs zusätzlich teilweise doppelt. Wirkung klein (Mode × `owners`). | niedrig |
| `maint` | 6 · 10 · 18 %/Jahr | Panel; Faustregel 15–20 % aus der Recherche-Notiz (Primärquelle nicht verifiziert) | **U** | 10 % liegt **unter** der branchenüblichen Faustregel — beim gekauften Visual verteidigbar (der Hersteller wartet den Code, ihr wartet nur Templates). Behalten, aber siehe Doppelzählung mit `events`. | mittel |
| `events` | 0,2 · 1 · 2 /Jahr | Visual-API-Changelog: letzte dokumentierte Version 5.10 (Desktop 06/2024), keine Breaking Changes seit v2.1 — **verifiziert** ([MS Learn changelog](https://learn.microsoft.com/power-bi/developer/visuals/changelog)); reale Brüche kommen aus Desktop-/Service-Regressionen (SQLBI 02/2025 Dialog-API) | **B** | 1 Ereignis/Jahr ist gut belegt durch die dokumentierten Einzelfälle. | mittel |
| `fixH` | 1 · 3 · 5,5 h | Panel | **B** | Konsistent mit „Hersteller fixt, ihr testet nach“. | mittel |
| `dep` | 1 · 2 · 4 %/Jahr | Charticulator (Microsoft, EOL 31.12.2023), OKViz Synoptic v1 (EOL 10.03.2026 — [docs.okviz.com](https://docs.okviz.com/visuals/synoptic-panel/versions/deprecated)), Bing-Maps-Ablösung | **U** | 2 %/Jahr für einen etablierten Anbieter ist plausibel. Aber: die zitierten Belege betreffen überwiegend **Microsoft**-Produkte, nicht Community-OSS — die `srcNote` stützt damit nicht die Spreizung paid ≪ oss ≪, sondern eher core. | mittel |
| `support` | — (nicht gesetzt) | — | **B** | Korrekt: im Lizenzpreis enthalten. | hoch |

### Ansatz `oss`

| id | aktuell (min·wahrsch·max) | Evidenz | Urteil | Vorschlag | Konfidenz |
|---|---|---|---|---|---|
| `cuUplift` | 0 · 1 · 3 % | keine | **B** | identisch zu paid, neutral. | mittel |
| `ext` | 0 · 30 · 60 % | keine | **Ä** | **[0 · 20 · 50]** (= paid). Warum sollte ein *fertiges* OSS-Visual mehr externe Beratung brauchen als ein gekauftes? Der Wert wirkt doppelt: er erhöht den Mischsatz (extern 120 € vs. intern ~81 €) **und** liegt auf ohnehin höheren Stundenzahlen. Effekt im Preset „gross“: **≈ 36.000 €** allein aus dieser Differenz. | mittel |
| `setupH` | 10 · 22 · 42 h | Panel | **B** | Einziger Parameter, bei dem oss günstiger als paid steht — sachlich richtig (keine Beschaffung). | mittel |
| `devH` | 0 · 0 · 0 h | Fallstudie Daten-WG (eigene Quelle) | **B** | Default korrekt und ehrlich; Eigenentwicklung nur per Preset. **Aber:** der Default „fertiges Visual, ihr entwickelt nicht“ wird von `events`, `fixH`, `maint` und `govRun` faktisch wieder eingezogen (siehe Bias, Punkt 3). | hoch |
| `firstH` | 4,5 · 8,5 · 14 h | Panel | **Ä** | **[3,5 · 7 · 12]**. Faktor 2,1 gegenüber paid ist für ein *fertiges IBCS-Visual mit Szenario-Notation* nicht begründet; verteidigbar sind schlechtere Doku, weniger Formatoptionen, kein Support-Kanal — das trägt vielleicht Faktor 1,5–1,7. Wirkung klein (≈1.800 € im KMU). | niedrig–mittel |
| `reuseH` | 1 · 2 · 3,5 h | Panel | **Ä** | **[0,7 · 1,4 · 2,6]**. **Der wichtigste Parameter des ganzen Vergleichs.** „Vorlage übernehmen, Felder binden, Titel anpassen“ ist eine Operation, die vom Visual-Hersteller praktisch unabhängig ist. Der Faktor 2 zu paid verschiebt im Preset „gross“ **≈ 254.000 €** und ist der Hauptgrund, warum oss dort verliert. Ohne Beleg darf dieser Faktor nicht so groß sein. | hoch (Hebel) / mittel (Wert) |
| `trainH` | 8 · 15 · 26 h | Panel | **U** | Faktor 1,8 zu paid; verteidigbar über fehlende Academy/Zertifizierungskurse. Behalten, aber im Text begründen. | mittel |
| `lightH` | 1 · 2 · 4 h | Panel | **B** | — | mittel |
| `rampH` | 16 · 32 · 80 h | **kein Panelwert**, Badge „E“ | **U** | Faktor 2 zu paid, unbelegt, wirkt zusammen mit `churn` über `trainRun`. Behalten, aber als Autoren-Schätzung kenntlich machen. | niedrig |
| `supH100` | 3 · 7 · 12 h | Panel | **Ä** | **[2,5 · 5,5 · 10]**. Ein großer Teil des Viewer-Supports ist **werkzeugunabhängig** (IBCS-Notation erklären) und steckt bereits global in `govPer1000`. Faktor 1,75 zu paid ist zu hoch; Faktor ~1,4 ist verteidigbar. Wirkung im Preset „gross“: ≈ 60.000 €. | mittel |
| `govIntake` | 8 · 24 · 60 h | Zertifizierbarkeit von OSS ist belegt (Deneb ist zertifiziert); Code-Review-Umfang der MS-Zertifizierung **verifiziert** | **Ä** | Zwei Probleme: (1) Multiplikation mit `S.types` (s. o.) — 24 h × 5 Typen = 120 h Freigabe für **ein** Visual-Paket ist falsch; (2) der Schalter „OSS-Visual ist zertifiziert“ (`osscert`) hebt zwar den K.O. auf, **senkt aber keine einzige Stunde** — obwohl genau dann Microsoft das Code-Review gemacht hat. Vorschlag: `govIntake` je Paket, und bei `osscert=true` auf paid-Niveau reduzieren. | hoch |
| `govRun` | 18 · 46 · 112 h/Jahr | Org-Store-Regeln (Löschen irreversibel, kein PPT-Export, nicht im Report Server) **verifiziert** ([MS Learn organizational visuals](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-organization)) | **Ä** | 46 h/Jahr = gut eine Arbeitswoche nur für Org-Store-Pflege, skaliert im Kern noch mit `sizeF` (×1,3) und `govF` (×1,6) auf bis zu **96 h/Jahr**. Wenn das OSS-Visual aus AppSource kommt (Deneb-Fall) entfällt der Org-Store ganz. Vorschlag: **[12 · 30 · 80]**, plus Hinweistext „AppSource statt Org-Store halbiert diesen Posten“. | mittel |
| `govAudit` | 4 · 10 · 24 h/Jahr | keine | **Ä** | Richtung fragwürdig: Bei MIT-Code **kann** die Revision die Berechnung nachvollziehen, bei Closed Source nicht. Vorschlag: oss **[3 · 8 · 20]**, paid **[3 · 7 · 16]** — nahezu gleich, Differenz nur aus „kein Herstellernachweis/keine SOC2-Attestierung“. | niedrig |
| `course` | 0 · 0 · 300 € | keine | **B** | Achtung: PERT-Mittel von [0·0·300] ist **50 €**, nicht 0. | hoch |
| `maint` | 15 · 26 · 38 %/Jahr | Panel | **Ä** | **[10 · 18 · 28]**. 26 % liegt **über** der 15–20-%-Faustregel und über paid um Faktor 2,6 — begründet wird das mit „Breaking Updates“, die im Modell aber **schon in `events × fixH` stecken**. Bei devH = 0 wartet ihr Templates, nicht Code. Wirkung im Preset „gross“: ≈ 65.000 €. | mittel |
| `events` | 1 · 2,5 · 4 /Jahr | API-Changelog **verifiziert**: paid und oss nutzen dasselbe SDK, dieselben Monatsupdates | **Ä** | **[0,5 · 1,5 · 3]**. Die *Anzahl* brechender Plattform-Ereignisse ist werkzeugunabhängig — was sich unterscheidet, ist **wer fixt und wie schnell**, und das steckt in `fixH`. Faktor 2,5 auf die Ereigniszahl **und** Faktor 2,3 auf `fixH` ist eine doppelte Bestrafung derselben Ursache. | mittel–hoch |
| `fixH` | 3 · 7 · 14 h | Panel | **B** | Hier gehört der OSS-Nachteil hin: kein SLA, Wartezeit auf den Maintainer, und **AppSource-Update-Zyklus verifiziert: neue Version 10–14 Tage bis Produktion, Update-Zertifizierung bis 3 Wochen** ([MS Learn publication timeline](https://learn.microsoft.com/power-bi/developer/visuals/power-bi-custom-visuals-certified#publication-timeline)). Der Wert ist gut belegbar — nur eben nicht zusätzlich über `events`. | mittel |
| `dep` | 3 · 7 · 13 %/Jahr | Charticulator/OKViz/Bing Maps — aber das sind **Microsoft- bzw. kommerzielle** Produkte, kein Community-OSS | **U** | Wert plausibel für ein Beta-Visual mit einem Maintainer (Bus-Faktor 1). **Aber:** (1) die zitierten Belege stützen ihn nicht spezifisch; (2) MIT-Code ist **forkbar** — „abgekündigt“ heißt bei OSS nicht „Neubau“, sondern „ihr übernehmt die Wartung“. Der globale `migShare` von 80 % ist für OSS deshalb zu hoch. Vorschlag: `dep` behalten, aber im Risiko-Term für oss einen reduzierten `migShare` (Fork-Option) zulassen. | mittel |
| `support` | 0 · 0 · 2.000 € | Deneb Sponsors 50–750 $/Monat (verifiziert für Deneb) | **Ä** (Note) | Die Note sagt „Default 0, weil niemand zahlen muss“ — im Erwartungswert sind es aber **333 €/Jahr, also 1.667 € über 5 Jahre**. Entweder Note korrigieren oder Max senken. | hoch |

---

## (b) Lizenzpreise und Staffel

### Was ich belegen konnte

| Aussage | Beleg | Status |
|---|---|---|
| Zebra BI Personal ≈ 299 $/User·Jahr; Team 799 $/Jahr für bis zu 5 User | Suche zu [zebrabi.com/pricing](https://zebrabi.com/pricing/) | Snippet, Original blockiert |
| Zebra BI: **jeder** Nutzer, der Reports mit Zebra-Visuals *ansieht*, braucht eine Lizenz; kein Unterschied Designer/Viewer; Viewer geben keinen Key ein, brauchen aber eine Lizenz | Suche zu [help.zebrabi.com/kb/power-bi/zebra-bi-licensing](https://help.zebrabi.com/kb/power-bi/zebra-bi-licensing/) | Snippet, Original blockiert — **inhaltlich aber die tragende Annahme des Rechners und damit bestätigt** |
| Zebra BI: Pakete zu 10/50/custom Usern, „unlimited site license“ im Enterprise-Paket, Preis nur auf Anfrage; Drittquelle nennt „ab ~5.000 $/Jahr“ | Suchen zu zebrabi.com, Capterra/GetApp | Snippet, **kein Preis für Site** |
| Inforiver Analytics+ 3,00 $ → 2,40 $/User·Monat, Creator = Viewer | Suche zu [inforiver.com/analytics-plus/pricing](https://inforiver.com/analytics-plus/pricing/) | Snippet |
| Inforiver Domain-wide: **96 k$/Jahr flat (Stand 02/2024)** → heute **ab 12 k$/Jahr, größenabhängig verhandelt** | Suchen zu [inforiver.com/blog/general/february-2024-update](https://inforiver.com/blog/general/february-2024-update/), [zebrabi.com/reviews/inforiver-review](https://zebrabi.com/reviews/inforiver-review/) | Snippet — **löst den in der `srcNote` behaupteten „Widerspruch“ auf** |
| graphomate: Recipients **und** Designer zählen als Nutzer, Zählung je BI-Frontend, Desktop kostenlos, Preise nur auf Anfrage | Suche zu [graphomate.com/en/licences](https://www.graphomate.com/en/licences/) | Snippet, kein Preis |
| Lizenz-Durchsetzung fehlt in Report Server, Sovereign/Government Clouds, PaaS-Embed (app owns data), Publish-to-web, PDF/PPT-Export via REST | [MS Learn, custom-visual-licenses](https://learn.microsoft.com/power-bi/developer/visuals/custom-visual-licenses) | **verifiziert** |
| Named-User-Modell, Zuweisung je Entra-User oder -Sicherheitsgruppe im M365 Admin Center | [MS Learn, ISV app license management](https://learn.microsoft.com/partner-center/marketplace-offers/isv-app-license-power-bi-visual) | **verifiziert** |
| Keine öffentliche Preiserhöhung von Zebra BI oder Inforiver auffindbar (mehrere Suchen) | — | **Beleglücke für `licInfl`** |

### Bewertung der Presets `LIC`

| Preset | Wert | Urteil |
|---|---|---|
| `inforiver` [25 · 30 · 40] | 30 € ≈ 33 $/Jahr ≈ 2,75 $/Monat | **Passt** zu Analytics+ (3,00 → 2,40 $/Monat). **Aber:** Inforiver ist kein Produkt, sondern eine Produktfamilie. Für die *Reporting Matrix* nennt die eigene Recherche-Notiz 50 $/Monat für 10 User = 60 $/User·Jahr ≈ 55 € — **oberhalb des Maximums von 40 €**. Vorschlag: Preset auf **[25 · 33 · 60]** oder Beschriftung präzisieren auf „Inforiver Analytics+“. Konfidenz mittel. |
| `zebra` [200 · 270 · 330] | 270 € ≈ 299 $ = Listenpreis Personal | **Behalten.** Kleine Inkonsistenz: das **Maximum liegt über dem Listenpreis** — begründbar nur mit Preissteigerung/USt., sollte in der `srcNote` stehen. Der Minimalwert 200 € unterschreitet die Team-Staffel (799 $/5 ≈ 160 $ ≈ 145 €) **nicht ausreichend**: Zebra gewährt schon bei 5 Nutzern ~46 % Rabatt. Vorschlag **[140 · 270 · 330]**. Konfidenz mittel. |
| `enterprise` [40 · 80 · 150] | identisch mit dem `lic`-Default | **Problem:** Der Default ist bereits „verhandelter Mischpreis“, und das Preset ist derselbe Wert. Der Button suggeriert eine Auswahl, ändert aber nichts. Entweder Preset entfernen oder klar als „Rückstellen auf Default“ beschriften. Konfidenz hoch. |

### Bewertung der Volumenstaffel (−25 % / −45 % / −60 % / −70 % ab 100 / 500 / 2.000 / 5.000)

1. **Die Stufenlage ist zu spät.** Zebra gewährt beim Sprung Personal → Team (5 Nutzer!) bereits ≈ −46 %. Die erste Staffelstufe des Rechners greift erst ab 100 Nutzern. Für Mengen zwischen 5 und 100 überschätzt der Rechner die Lizenzkosten systematisch.
2. **Die Endstufe ist zu flach.** Inforiver Domain-wide ab 12 k$ bedeutet bei 2.000 Nutzern rechnerisch ≈ 6 $/User·Jahr — gegenüber 36 $ Liste sind das ≈ **−83 %**, nicht −60 %. Ab ~1.000 Nutzern ist die Per-User-Rechnung ökonomisch irrelevant; das Modell weist zwar bei >2.000 Nutzern und `peruser` einen Hinweis aus (Z. 724), aber die *Staffel* selbst bleibt zu teuer.
3. **Doppelrabatt.** Der `lic`-Default ist laut Label „verhandelter Mischpreis, kein Listenpreis“, das Default-Lizenzmodell ist aber `staffel`. Damit wird auf einen bereits verhandelten Preis ein zweites Mal rabattiert (bei 500 Nutzern: 80 € → 44 €). Entweder Label auf „Listen-/Einstiegspreis“ ändern (dann ist die Staffel korrekt) oder Default-Lizenzmodell auf `peruser` stellen. **Das ist der sauberste Einzelfix im Lizenzblock.**
4. **Site-Lizenz und `licAdmH100` schließen sich aus.** Der Kern rechnet `licAdmin` auch bei `licModel='site'` weiter (Z. 634 ohne Modell-Bedingung). Im Preset „gross“ sind das **≈ 76.400 €** Lizenzadministration für eine Lizenz, deren Verkaufsargument gerade „eliminates license management hassles“ ist. **Bug, bitte fixen:** `licAdmin` nur bei `peruser`/`staffel`.
5. **Rechtsschiefe.** `licSite` [12.000 · 40.000 · 96.000] hat einen PERT-Erwartungswert von **44.667 €**, nicht 40.000 €. Analog `licInfl` (6,67 % statt 5 %) und `licAdmH100` (1,75 h statt 1,5 h). In Summe rechnet der Erwartungswert paid ~5–8 % teurer, als die „wahrscheinlich“-Spalte suggeriert. Das ist methodisch korrekt (PERT), sollte aber irgendwo im UI stehen, sonst wirkt es wie ein Rechenfehler.
6. **Währung.** Alle Belege sind USD, alle Felder sind mit € beschriftet. Bei ~1,08–1,10 USD/EUR sind die Site-Werte um ~8 % zu hoch, die Per-User-Werte je nach Preset zu hoch oder zu niedrig. Einheitlich eine Annahme dokumentieren (z. B. „1 $ ≈ 1 €, konservativ“).
7. **Site-Presets.** Inforiver 10–90 k€ ist durch die Recherche gedeckt. Zebra 40–150 k€ und Konzern-Rahmenvertrag 80–300 k€ sind **frei geschätzt** — sie sind im UI als „(Schätzung)“ gekennzeichnet, das ist ausreichend ehrlich. Bei Zebra würde ich die Untergrenze auf **~25 k€** senken: die Drittquelle nennt Enterprise „ab ~5.000 $/Jahr“, 40 k€ als Minimum ist damit nicht belegt.

---

## (c) Bias und Doppelzählung

Ich habe den Rechenkern nachgebaut und mit den Defaults durchgerechnet (Erwartungswerte, keine Simulation; alle Zahlen ± Rundung, ohne die Requirement-K.O.s):

| Szenario | paid | oss (Default) | oss (mit meinen 8 Korrekturen) |
|---|---|---|---|
| Mittelstand (3 Ersteller / 40 Viewer, 5 J.) | **53.980 €** | 66.714 € | **50.473 €** |
| Konzern (25 / 1.500) | 705.528 € | **387.442 €** | 302.645 € |
| Groß (200 / 10.000, Site-Lizenz) | **1.394.618 €** | 2.113.214 € | 1.705.846 € |

**Die Kernaussage:** Im Mittelstands-Szenario **kippt die Rangfolge**, sobald man die acht OSS-Parameter korrigiert, für die es keinen Beleg gibt. Die Aussage „Paid ist im Mittelstand günstiger“ ist damit **kein Ergebnis des Modells, sondern eine Folge nicht belegter Annahmen**. Meine Korrekturen sind ebenfalls nicht belegt — die ehrliche Schlussfolgerung ist: **bei kleinen Mengen ist die Rangfolge paid vs. oss mit der vorliegenden Evidenz nicht entscheidbar**, und der Rechner sollte das sagen (die P10–P90-Bänder tun es vermutlich schon; im Text steht es nicht).

### Richtung des Bias

**Der Parametersatz ist systematisch OSS-feindlich, nicht OSS-freundlich.** Bei elf von neunzehn vergleichbaren Parametern steht oss schlechter als paid, und zwar meist um Faktor 1,75 bis 3. Angesichts des offengelegten Interessenkonflikts (ChartKitchen ist ein Projekt der Autoren) ist konservatives Runden gegen das eigene Produkt nachvollziehbar und ehrenhaft — **aber es ist trotzdem ein Bias**, und er stapelt sich multiplikativ:

Ein OSS-Chart trägt gegenüber paid gleichzeitig: 2,0× Wiederverwendungsstunden × 1,5× externen Satzanteil × 2,6× Wartungsquote × 2,5× Ereignisse × 2,3× Fixstunden × 3,0× Freigabestunden × 2,9× laufende Governance × 1,75× Support × 3,5× Abkündigungsrisiko. Jeder einzelne Faktor ist für sich diskutabel; ihr Produkt ist keine Schätzung mehr, sondern ein Urteil.

### Konkrete Befunde

1. **`reuseH` ist der heimliche Entscheider.** Faktor 2 zwischen paid und oss, ohne Beleg, bewegt im Preset „gross“ ≈ 254.000 € — mehr als die komplette Site-Lizenz. Kein anderer Parameter kommt in die Nähe. Wenn nur eine Zahl nachgemessen werden kann, dann diese.
2. **Doppelzählung `maint` × `events`/`fixH`.** Die Panel-Note zu `maint` begründet die Quote explizit mit „Core-Workarounds brechen bei Monatsupdates“ — genau der Vorgang, der als `events × fixH` schon separat abgerechnet wird. Im Mittelstands-Szenario stehen bei oss 10.930 € `maint` neben 9.347 € `events`: zwei Posten fast gleicher Größe für dieselbe Ursache. Empfehlung: `maint` als „geplante Pflege ohne Plattform-Brüche“ neu definieren und die Panel-Note ändern, oder `events` streichen.
3. **`devH = 0` wird durch die Hintertür wieder eingezogen.** Der Default sagt „fertiges OSS-Visual nutzen“ — also seid ihr **Nutzer**, nicht Maintainer. Dann gehören 7 h Fix-Aufwand je Plattform-Bruch, 26 % Wartungsquote und 46 h/Jahr Org-Store-Governance nur teilweise zu euch; den Code fixt der Maintainer. Der Parametersatz beschreibt in Wahrheit eine Mischung aus „Nutzer“ und „Mit-Maintainer“, ohne das zu sagen. Empfehlung: die drei Werte an den `devH`-Preset koppeln (fertig / KI-Eigenbau / klassisch).
4. **`govIntake` × `S.types` ist eine Bezugsgrößen-Verwechslung.** Security-Review, Architekturboard und AVV gelten je Visual-Paket, nicht je Chart-Typ. Der Fehler trifft beide Ansätze, verstärkt aber den Abstand um Faktor `S.types` (5–8), weil der OSS-Einzelwert dreimal so hoch ist. Im Mittelstand: 4.794 € statt ~960 €.
5. **`govIntake` vs. `setupH` überschneiden sich.** `setupH` ist beschrieben als „Evaluierung, **Freigabe**, Theme, Template-Bibliothek“, `govIntake` als „**Security-Review**, Architekturboard, AVV“. Das Panel hat `setupH` mit dem Wort „Freigabe“ im Label geschätzt. Mindestens teilweise doppelt.
6. **`supH100` vs. `govPer1000` vs. `govRun`.** Drei viewer- bzw. zeitabhängige Governance-/Supportposten laufen nebeneinander und werden zusätzlich mit `M.supF`, `M.govF` und `sizeF` (bis ×1,3) multipliziert. Im Preset „gross“ sind Governance + Support bei oss 423.608 € — 20 % der Gesamtkosten für ein Visual, das niemand lizenzieren muss. Ich halte das für überzeichnet, kann es aber nicht mit Zahlen widerlegen: Urteil „unsicher“.
7. **Der `osscert`-Schalter ist wirkungslos außer beim K.O.** Wenn das OSS-Visual zertifiziert ist (Deneb ist es, ChartKitchen laut Doku noch nicht), hat **Microsoft** das Code-Review gemacht — dann müssen `govIntake` und `dep` sinken. Aktuell ändert der Schalter nur die Ausschluss-Logik (Z. 712). Klarer Modell-Gap.
8. **Herkunft der „E“-Werte ist nicht unterscheidbar.** Neun Parameter (`setupH`, `firstH`, `reuseH`, `trainH`, `lightH`, `maint`, `events`, `fixH`, `supH100`) stammen aus dem simulierten Panel und sagen das in der `srcNote`. Neun weitere tragen dasselbe Badge „E“ **ohne** Panel-Hinterlegung: `cuUplift`, `licAdmH100`, `ext`, `rampH`, `govIntake`, `govRun`, `govAudit` sowie global `growth`, `intFactor`, `demand1000`, `govPer1000`. Genau die unbelegten sind es, die den OSS-Abstand tragen. Empfehlung: zwei Badges (`E-P` Panel / `E-A` Autor).
9. **Das Panel selbst ist keine Evidenz.** 20 sprachmodell-simulierte Rollenprofile erzeugen plausible, aber korrelierte Zahlen — sie messen im Wesentlichen die Priors des Modells, nicht die Realität. Der Median über 20 solcher Profile hat **keine** unabhängige Stichprobenqualität; die scheinbare Präzision (`3,25` Ereignisse/Jahr, `6,25` h) ist Scheingenauigkeit. Die Datei sagt das an einer Stelle („Kein Ersatz für Messung“) — das sollte auch im Rechner-UI stehen, nicht nur in der Session-Notiz. Empfehlung: alle Panelwerte auf sinnvolle Stellen runden (`3,25` → `3`).
10. **Qualitative Bewertung sickert in die Kosten.** `variantEff` leitet sich aus der Requirement-Bewertung `design` ab (paid 5, oss 4) und multipliziert `maint` und `govOnce`: paid 1,125 vs. oss 1,25. Eine subjektive 5-vs-4-Sterne-Bewertung wird damit zu ~11 % Kostenunterschied. Das ist eine versteckte Kopplung zwischen Nutzwertanalyse und Kostenmodell, die die Nutzwertanalyse-Kritik im Quellenverzeichnis eigentlich verbietet.
11. **`0 · 0 · X`-Spannen sind nicht null.** `support` (oss) trägt 1.667 €, `course` (oss) 50 € — obwohl die Note „Default 0“ behauptet. Betrifft nur oss und deneb, also **zugunsten** von paid.
12. **Anti-paid-Befunde (zur Balance).** Vier Punkte benachteiligen paid: (a) `licAdmH100` skaliert linear und läuft auch bei Site-Lizenz weiter (76 k€ im Preset „gross“); (b) `licInfl` mit EV 6,67 %/Jahr gegen `wageInfl` mit EV 2,58 % — eine unbelegte Scherenannahme; (c) die Volumenstaffel bildet reale Großkunden-Rabatte zu flach ab; (d) `govAudit` paid < oss ist bei Closed Source sachlich schwer haltbar. Gegenläufig: `setupH` paid enthält **keine** Beschaffung/Vertragsverhandlung für Großverträge — das begünstigt paid im Konzern deutlich.
13. **Der Risikoterm ist zu klein, um zu wirken — bei beiden.** `risk = pH × (setup+dev+build) × migShare` lässt den Rollout außen vor. Im Mittelstand sind das 1.576 € für oss (2,4 % der Kosten), obwohl 30 % Abkündigungswahrscheinlichkeit über 5 Jahre unterstellt sind. Ein realer Abkündigungsfall würde auch alle Report-Instanzen treffen (`switchCost` rechnet das ja korrekt — nur eben nicht im Risikofall). **Ehrlichkeitshalber:** dieser Fix würde oss *schlechter* stellen, nicht besser. Er gehört trotzdem gemacht.
14. **Fork-Option fehlt.** `migShare` (50/80/100 %) gilt global. Für MIT-lizenzierten Code bedeutet Abkündigung „ihr wartet selbst weiter“ (Kosten ≈ devH-Bruchteil), nicht „Neubau“. Für ein Paid-Visual bedeutet sie tatsächlich Neubau. Der einzige echte strukturelle Vorteil von OSS ist im Modell nicht abgebildet.

---

## (d) Was ich nicht prüfen konnte

- **Alle Herstellerpreisseiten im Original.** `zebrabi.com`, `help.zebrabi.com`, `inforiver.com` sind in dieser Sandbox durch den Egress-Proxy blockiert (`EGRESS_BLOCKED`). Ich habe ausschließlich Suchmaschinen-Snippets gesehen. Snippets zu Zebra widersprechen sich außerdem in den Paketgrößen („Personal/Team bis 5“ vs. „Starter bis 10 / Business bis 50 / Enterprise“) — vermutlich hat sich die Preisseite geändert. **Vor der Konferenz sollte jemand mit Netzzugang die drei Preisseiten mit Datum und Screenshot festhalten.**
- **graphomate-Preise.** Nicht öffentlich, nur das Zählmodell (Recipients + Designer, je BI-Frontend) ist per Snippet belegt. Kein Eurobetrag.
- **Zebra-BI-Site-Lizenz.** Kein öffentlicher Preis. Die 40–150 k€ im Preset sind eine Schätzung ohne Beleg (korrekt so gekennzeichnet).
- **Preissteigerungen der Hersteller.** Mehrere Suchen, keine öffentliche Ankündigung von Zebra BI oder Inforiver gefunden. `licInfl` bleibt eine reine Faustregel.
- **Vendor-Support-SLA.** Nur ein Snippet („12–24 Werkstunden Reaktionszeit“, Zebra Contact-Support-Seite), keine vertragliche Zusage, keine Enterprise-SLA-Stufen. Für `fixH` paid ist das zu dünn, um mehr zu sein als plausibel.
- **Zertifizierungsstatus von ChartKitchen.** Die Suche bestätigt Version 1.38 vom 19.07.2026 und 13 Chart-Modi über die Projektdoku, **aber keine AppSource-/Zertifizierungsangabe**. Die Recherche-Notiz sagt „Beta, noch nicht AppSource/zertifiziert“ — das habe ich nicht unabhängig bestätigen können.
- **Empirische Stunden je IBCS-Chart.** Existieren nicht öffentlich; das sagt die Recherche-Notiz selbst („KEINE Quelle“). Alles Weitere ist Schätzung. Die belastbarste Verbesserung wäre keine bessere Schätzung, sondern **eine Messung**: dieselben fünf Chart-Typen einmal mit Zebra/Inforiver und einmal mit ChartKitchen bauen und die Stunden stoppen.
- **Wartungsquoten-Faustregel (15–20 %).** Als Gartner/Forrester-Regel zitiert, Primärquelle in der Recherche-Notiz selbst als „nicht verifiziert“ markiert. Ich konnte sie ebenfalls nicht auf eine Primärquelle zurückführen.
- **Ich habe die Monte-Carlo-Simulation nicht ausgeführt**, sondern nur den Erwartungswert nachgebaut. Aussagen über P10/P90-Überlappung im Report beruhen daher nicht auf eigener Rechnung.

---

## Priorisierte Empfehlungen

**Bugs zuerst (unstrittig):**
1. `licAdmin` bei `licModel='site'` auf 0 setzen (Z. 634). Wirkung: −76 k€ paid im Preset „gross“.
2. `govOnce` nicht mit `S.types` multiplizieren (Z. 664). Wirkung: −80 % auf einen Posten, der bei oss vierstellig bis fünfstellig ist.
3. `srcNote` von `licSite` korrigieren: kein Widerspruch, sondern alter Flat-Preis vs. heutiger Verhandlungseinstieg.
4. `srcNote` von `support` (oss): „Default 0“ stimmt nicht, PERT-Mittel ist 333 €/Jahr.
5. Preset „Enterprise-Verhandlung“ ist identisch mit dem Default — entfernen oder umbenennen.

**Modellentscheidungen (Autorenentscheidung nötig):**
6. Doppelzählung `maint` × `events` auflösen.
7. `ext` für paid und oss angleichen.
8. `events` (oss) auf paid-Niveau bringen — der Unterschied gehört in `fixH`, nicht in die Ereigniszahl.
9. `reuseH` (oss) von Faktor 2,0 auf ~1,4 senken oder den Faktor 2 belegen. **Wichtigster Einzelpunkt.**
10. `osscert` auf `govIntake` und `dep` wirken lassen.
11. Fork-Option für OSS im Risikoterm (reduzierter `migShare`) — und im Gegenzug den Rollout in den Risikoterm aufnehmen.
12. „E“ in „E-Panel“ und „E-Autor“ aufspalten; Panelwerte runden.
13. Im Ergebnistext einen Satz ergänzen: *„Bei kleinen Mengen liegen paid und Open Source innerhalb der Unsicherheit der Stundenannahmen. Wer diese Rangfolge braucht, muss messen, nicht rechnen.“*
