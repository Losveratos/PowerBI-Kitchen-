# Audit der Annahmen · Visual-Standards-Rechner v0.7

**Stand:** 11.09.2026 · **Auftrag:** „alle Annahmen wirklich hart prüfen und ggf. neue Defaults setzen, offen und ehrlich“ · **Ergebnis:** 7 Struktur-Fixes im Rechenkern, 24 Defaults neu gesetzt, 9 Werte bewusst unverändert, Herkunft jedes Werts neu gekennzeichnet.

## Wie geprüft wurde

Sechs unabhängige Prüfungen, jede mit eigenem Auftrag und eigener Datei in diesem Ordner:

| Nr. | Prüfung | Modell | Ergebnis |
|:--|:--|:--|:--|
| 01 | 13 globale Annahmen, Evidenz und Modellkritik | Opus | `01-global-opus.md` |
| 02 | Options-Annahmen Paid und Open Source, Lizenzpreise, Staffel, Bias | Opus | `02-paid-oss-opus.md` |
| 03 | Options-Annahmen Deneb und Core + SVG, Bias | Opus | `03-deneb-core-opus.md` |
| 04 | Modellstruktur: Doppelzählung, fehlende Posten, Asymmetrien, Presets | Sonnet | `04-struktur-sonnet.md` |
| 05 | Web-Verifikation von Preisen und Fakten | Sonnet | `05-web-sonnet.md` |
| 06 | Blindschätzung ohne Kenntnis der bestehenden Werte (Anker-Kontrolle) | Sonnet | `06-blindschaetzung-sonnet.md` |

Alle sechs Berichte sind vollständig, obwohl die Sitzung durch ein Nutzungslimit abgebrochen wurde: die Dateien wurden vor dem Abbruch geschrieben. Netzzugang war vorhanden, aber der Egress-Proxy blockierte die Herstellerseiten (zebrabi.com, inforiver.com, graphomate.com), die Azure-Preisliste, powerbi.microsoft.com, deneb.guide und docs.okviz.com. Microsoft Learn und GitHub waren erreichbar. Preisangaben stammen daher aus Suchmaschinen-Snippets, nicht aus Primärlektüre. **Das bleibt so gekennzeichnet (Badge S), und vor der Konferenz sollte jemand mit freiem Netz die drei Preisseiten mit Datum und Screenshot festhalten.**

## Das ehrliche Kurzfazit

1. **Von 37 Annahmen sind 2 verifiziert, 8 per Snippet belegt, 3 Faustregeln, 9 aus dem simulierten Panel und 15 reine Autoren-Schätzung.** Das war vorher schon so, wurde aber unter einem Badge „E = Expertenschätzung“ versteckt, das Panel und Autorenmeinung nicht unterschied. Jetzt gibt es „P“ (Panel, 20 per Sprachmodell simulierte Profile, keine Erhebung) und „E“ (Autoren-Schätzung, keine Quelle).
2. **Die größten Fehler lagen nicht in Zahlen, sondern in Formeln.** Die Fluktuationsschulung belastete jeden Abgang mit der vollen Tiefschulung plus Einarbeitung, obwohl die Erstschulung sauber zwischen Vorlagen-Bauern und Vorlagen-Nutzern trennt: im Großkonzern-Preset 1,9 Mio. € statt rund 0,2 Mio. € für Deneb. Die Freigabe wurde je Chart-Typ statt je Visual-Paket gerechnet. Das Abkündigungsrisiko ließ die ausgerollten Reports weg. Die Lizenz-Administration lief linear und auch bei Site-Lizenz weiter.
3. **Der Parametersatz war in der Summe OSS-feindlich, nicht OSS-freundlich.** Bei elf von neunzehn vergleichbaren Parametern stand Open Source um Faktor 1,75 bis 3 schlechter als Paid, teils für dieselbe Ursache doppelt (Breaking-Updates in Wartungsquote *und* in Ereigniszahl). Das war als konservatives Runden gegen das eigene Produkt gedacht, ist aber trotzdem ein Bias. Gleichzeitig hat die Strukturprüfung drei Punkte gefunden, die OSS begünstigten (Risiko ohne Rollout, Export-Nachteil unbepreist, Presets unter der eigenen Report-Heuristik). Beides ist jetzt korrigiert.
4. **Der wichtigste Hebel bleibt ungemessen:** Stunden je Chart bei Wiederverwendung, Faktor 2 zwischen Paid und Open Source. Die Blindschätzung bestätigt den Faktor 2, der Opus-Prüfer hält 1,4 für vertretbar. Der Wert bleibt bei 2, weil zwei unabhängige Schätzungen ihn stützen, aber: wer diese Rangfolge im Mittelstand braucht, muss fünf Charts mit beiden Werkzeugen bauen und die Stunden stoppen. Rechnen hilft hier nicht weiter.
5. **Bei kleinen Mengen ist Paid gegen Open Source nicht entscheidbar.** Die P10–P90-Bänder überlappen, und die Rangfolge hängt an unbelegten Stundenannahmen. Der Rechner sagt das jetzt deutlicher (Platzgruppen, Prämissen-Box, Monte-Carlo-Seite). Bei großen Viewer-Zahlen ist die Aussage robust: die Lizenz je Kopf dominiert.

## Struktur-Fixes im Rechenkern (v0.6 → v0.7)

| # | Fund | Vorher | Nachher | Richtung | Quelle |
|:--|:--|:--|:--|:--|:--|
| 1 | Fluktuationsschulung nicht rollendifferenziert | `creators × churn × H × (trainH + rampH)` | `churn × H × [owners × (trainH + rampH) + (creators − owners) × (lightH + 0,25 × rampH)]` | entlastet Deneb und Core massiv, im Konzern-Preset −190 k€ Deneb | 01, 03, 04 |
| 2 | Freigabe je Chart-Typ multipliziert | `govIntake × types` | `govIntake × (1 + 0,2 × (types − 1))` (je Visual-Paket, plus Review je Standard) | entlastet OSS und Deneb | 02, 03, 04 |
| 3 | Abkündigungsrisiko ohne Rollout | `pH × (setup + dev + build) × migShare` | `pH × (setup + dev + build + 0,6 × rollout) × migShare` | belastet OSS (höchstes dep) und alle mit großem Bestand | 01, 02, 04 |
| 4 | Lizenz-Administration linear und bei Site-Lizenz aktiv | `users/100 × h` | `√(users/100) × h`, bei Site-Lizenz 0 | entlastet Paid (−76 k€ im Großkonzern) | 02 |
| 5 | Staffelrabatt statisch aus Jahr 0 | ein Faktor für alle Jahre | Faktor je Jahr auf die dann gültige Nutzerzahl; Stufen früher und tiefer (−20 % ab 25 bis −80 % ab 5.000) | entlastet Paid bei Wachstum und bei kleinen Teams | 02, 04 |
| 6 | Governance-Stufen mit harten Kanten | 0,3 / 0,6 / 1,0 / 1,3 bei 50 / 250 / 1.000 Viewern | log-linear zwischen 50 und 5.000 Viewern | glättet Sensitivität und Monte Carlo | 04 |
| 7 | Bewertung interner Stunden als Zufallsgröße | zwei multiplikative Meinungsparameter auf demselben Term, 4,2-fache Spanne | Erwartungswert, in der Simulation konstant | Bänder zeigen Sachunsicherheit statt Bewertungskonvention | 01 |
| 8 | Zertifiziertes OSS senkt keine Stunde | Schalter wirkte nur auf den K.O. | Freigabe wie Paid, wenn „OSS-Visual ist zertifiziert“ gesetzt ist | entlastet zertifiziertes OSS | 02 |
| 9 | Report-Zuwachs nur an Viewern | `demand1000 × Viewer` | plus `demandCreator × Ersteller` (neue Annahme, 0,2 · 0,5 · 1 je Ersteller und Jahr) | im Mittelstand entsteht jetzt überhaupt Zuwachs | 01 |
| 10 | Presets unter der eigenen Report-Heuristik | Mittelstand 6, Konzern 40, RS 25, Groß 400 Reports | 12 / 100 / 90 / 1.200 (entspricht `reportsDefault()`) | belastet alle Stunden-Ansätze relativ zu Paid; **größter Einzeleffekt auf die Preset-Zahlen** | 04 |
| 11 | Preset-Klick ließ alte Red Flags stehen | Report-Server-Flag blieb nach Wechsel auf „Großkonzern“ aktiv | Flags werden beim Preset-Klick zurückgesetzt | UX-Bug | eigene Prüfung |

Nicht umgesetzt, bewusst: Barwert als Primärkennzahl (Zeitprofile unterscheiden sich, Rangfolge läuft aber weiter über die nominale Summe; der Barwert steht daneben), Sprungmodell für die Capacity (bleibt lineare Näherung, dafür SKU-Presets F2/F8/F64), Koexistenz zweier Ansätze (80 % Zebra + 20 % Deneb), Zeit der Viewer, Vertragsbindung bei Paid, Adoptionsrisiko. Alle in `01-global-opus.md` und `04-struktur-sonnet.md` beschrieben.

## Neue Defaults

Format min · wahrscheinlich · max. Konfidenz bezieht sich auf den neuen Wert.

### Global

| Annahme | v0.6 | v0.7 | Begründung | Konfidenz |
|:--|:--|:--|:--|:--|
| Stundensatz intern | 60 · 80 · 100 | **65 · 85 · 115** | Controller Ø 71 k€ × Vollkosten 1,7 / 1.500–1.600 h ≈ 76–84 €/h; wer Standards baut, ist eher BI-Entwickler | mittel |
| Stundensatz extern | 95 · 120 · 180 | **95 · 125 · 220** | freelancermap 2026 Ø 103 €/h, Berater 121; Beratungshaus 1.000–1.500 €/Tag fehlte oben | mittel |
| Fluktuation | 5 · 15 · 30 | **5 · 11 · 22** | Finance ~10 %, IT-Dienstleister 20–22 %; 30 % ist Bruttofluktuation | mittel |
| Viewer-Wachstum | 0 · 10 · 25 | **−5 · 10 · 30** | keine Benchmark; negativ muss möglich sein; Blindschätzung sogar 15 · 35 · 80 | niedrig |
| Bewertung interner Stunden | 60 · 100 · 150 | unverändert, aber **konstant** | Bewertungskonvention, keine Unsicherheit über die Welt | hoch (methodisch) |
| Neue Reports je Ersteller und Jahr | – | **0,2 · 0,5 · 1** (neu) | Nachfrage entsteht im Fachbereich, nicht nur bei Lesern | niedrig |
| Lohnsteigerung | 1,5 · 2,5 · 4 | **2 · 3 · 4,5** | WSI-Tarifarchiv: 2025 +2,6 %, 2026 +3,1 % nominal | hoch |
| Wartungs-Abklingfaktor | 75 · 85 · 95 | **80 · 90 · 97** | Notlösung ohne Empirie; Literatur kennt eher steigende Wartung | niedrig |
| Nachbau-Faktor | 1 · 1,3 · 1,8 | **1,1 · 1,5 · 2,5** | Untergrenze 1,0 unhaltbar (Original verstehen, Abnahme, Parallelbetrieb) | mittel |
| Fabric-Capacity | 0 · 0 · 0 | unverändert, Badge V → S, **Presets F2 / F8 / F64** | Default 0 neutralisiert den Posten; Badge war irreführend | – |
| Kalkulationszins | 0 · 4 · 7 | **5 · 8 · 10** | KPMG 2025: WACC DACH Ø 8,5 %, Spanne 5,2–10,4; 4 % war ein realer Zins auf nominale Ströme | hoch |
| Migrationsanteil, Zugriffs-Governance, Reports je 1.000 Viewer | – | unverändert | keine Evidenz erreichbar; Zugriffs-Governance jetzt als ansatzunabhängig beschriftet | – |

### Je Ansatz (paid / oss / deneb / core)

| Annahme | v0.6 | v0.7 | Begründung | Konfidenz |
|:--|:--|:--|:--|:--|
| Lizenz je Nutzer und Jahr | 40 · 80 · 150 | unverändert, **Label „Einstiegspreis“** | war „verhandelter Mischpreis“ und wurde trotzdem gestaffelt: Doppelrabatt | hoch (Label) |
| Site-Lizenz | 12 · 40 · 96 k€ | **12 · 35 · 90 k€** | Inforiver ab 12 k$ verhandelt (2026); 96 k$ flat ist ein alter Preis von 2024, nicht mehr belegbar | mittel |
| Lizenzpreis-Steigerung | 0 · 5 · 20 | **0 · 4 · 12** | keine öffentliche Erhöhung bei Zebra/Inforiver; Erwartungswert war 6,7 %/Jahr gegen 2,6 % Lohnsteigerung | mittel |
| Lizenz-Indikationen | Inforiver 25 · 30 · 40, Zebra 200 · 270 · 330 | **Inforiver 25 · 33 · 60, Zebra 140 · 270 · 330** | Inforiver Reporting Matrix ≈ 55 €; Zebra Team-Paket ≈ 145 € je Nutzer | mittel |
| Capacity-Mehrverbrauch Deneb | 0 · 2 · 5 | **0 · 1 · 4** | Deneb rendert im Browser; das 30k-Fenster ist ein SDK-Limit aller Custom Visuals | mittel |
| Externer Anteil | 0·20·50 / 0·30·60 / 10·50·90 / 0·30·70 | **0·25·55 / 0·25·55 / 0·40·85 / 0·30·70** | fertiges OSS braucht nicht mehr Hilfe als gekauftes; Deneb darf komplett intern laufen | mittel |
| Setup Paid | 18 · 35 · 55 | **18 · 40 · 100** | Einkauf, Legal, AVV, Rahmenvertrag bei großen Mengen fehlten | mittel |
| Einarbeitung bei Fluktuation | 8·16·40 / 16·32·80 / 40·120·240 / 24·80·160 | **8·16·40 / 12·28·70 / 24·70·180 / 16·50·130** | kein Panelwert, keine Quelle; wirkte über den Formelfehler als größter Deneb-Posten | niedrig |
| Anwender-Support je 100 Viewer | paid max 6,25; oss 3 · 7 · 12 | **paid max 6; oss 2,5 · 5,5 · 10** | Teil des Supports ist werkzeugunabhängig und steckt in der Zugriffs-Governance | mittel |
| Freigabe je Visual-Paket | deneb 4 · 12 · 30 | **deneb 1 · 4 · 10** | Deneb ist AppSource-zertifiziert; es bleibt die Tenant-Freigabe | mittel-hoch |
| Laufende Governance | oss 18·46·112, deneb 12·32·78 | **oss 12·30·80, deneb 6·16·40** | Deneb: ein Minor-Release je Jahr (07/2024, 07/2025, 03/2026); OSS aus AppSource ohne Org-Store | mittel-hoch |
| Prüfnachweis | 2·6·16 / 4·10·24 / 6·16·40 / 8·20·50 | **2·6·16 / 3·8·20 / 4·10·28 / 4·12·36** | DAX-UDFs (GA 06/2026) ersetzen 175 Measure-Kopien; Vega-Lite-Specs sind diff-fähig; Closed Source ist für die Revision nicht einsehbar | niedrig-mittel |
| Kurskosten Paid | 0 · 250 · 800 | **0 · 200 · 800** | Zebra BI Academy Grundmodule kostenlos | mittel |
| Wartungsquote | 6·10·18 / 15·26·38 / 11·19·30 / 20·34·52 | **6·10·18 / 12·22·32 / 10·17·27 / 12·30·48** | Panel begründete die Quote mit „bricht bei Monatsupdates“, das steckt bereits in Breaking-Updates; Core-Minimum 20 % verhinderte einen disziplinierten Matrix/Tabelle-Standard | mittel |
| Breaking-Updates | 0,2·1·2 / 1·2,5·4 / 1·2·3 / 2·3,25·5,25 | **0,2·1·2 / 0,5·1,5·3 / 1·2·3 / 2·3·5** | Plattform-Brüche sind werkzeugunabhängig, der Unterschied liegt in den Fix-Stunden; Deneb 3 Vorfälle in 24 Monaten belegt, Core 3–4 Regressionen 2025 belegt | mittel-hoch |
| Abkündigungsrisiko Deneb | 2 · 4 · 8 | **1 · 3 · 6** | Vega-Lite-Specs überleben das Wirtsvisual (Fabric Apps, andere Vega-Hosts) | mittel |
| Support / Sponsoring | oss 0 · 0 · 2.000, deneb 0 · 0 · 9.000 | **oss 0 · 0 · 1.000, deneb 0 · 0 · 3.000** | 9.000 war Platinum in $; Erwartungswert von 0 · 0 · max ist max/6 (Phantomkosten 1.500 €/Jahr) | hoch |

### Bewusst unverändert

| Annahme | Warum |
|:--|:--|
| Stunden je Chart bei Wiederverwendung (Faktor 2 Paid zu OSS) | Blindschätzung bestätigt Faktor 2, Opus hält 1,4 für vertretbar. Ohne Messung keine Änderung; als wichtigster ungemessener Hebel gekennzeichnet |
| Stunden je Chart-Typ erstmalig | Blindschätzung liegt bei Core höher (24 h), Strukturprüfung sagt „Measure-Bibliothek fehlt“; Panel 16 h bleibt als Mitte |
| Schulung Vorlagen-Bauer | Blindschätzung niedriger (Deneb 24 statt 35 h), Panel-Spanne 14–55 h; Wert bleibt, Hinweis ergänzt |
| Abkündigungsrisiko OSS 3 · 7 · 13 % | Blindschätzung sogar 5 · 15 · 35 %; Bus-Faktor 1 ist real. Die Fork-Option (MIT-Code weiterpflegen statt Neubau) ist nicht modelliert, weil sie zugunsten des eigenen Produkts wirken würde und niemand ihre Kosten kennt |
| Migrationsanteil 50 · 80 · 100 % | qualitativ durch Charticulator, Bing Maps, OKViz gestützt, keine Zahl |
| Zugriffs-Governance je 1.000 Viewer | fällt für alle gleich an; jetzt so beschriftet, damit klar ist, dass sie die Rangfolge nicht verschiebt |
| Betriebsmodell-Faktoren | Strukturprüfung: konsistent und plausibel; doppelte Wirkung des Varianten-Effekts auf Wartung und Freigabe ist dokumentiert, nicht entfernt |

## Wirkung auf die Presets (P50, 5 Jahre)

| Preset | Ersteller / Viewer / Reports (alt → neu) | Paid | Open Source | Deneb | Core + SVG |
|:--|:--|--:|--:|--:|--:|
| Pilot | 1 / 10 / 2 → 2 | 28 → 33 k€ | 60 → 55 k€ | 77 → 68 k€ | 86 → 101 k€ |
| Mittelstand | 3 / 40 / 6 → 12 | 55 → 60 k€ | 72 → 78 k€ | 103 → 101 k€ | 105 → 145 k€ |
| Konzern | 25 / 1.500 / 40 → 100 | 690 → 638 k€ | 383 → 593 k€ (K.O.) | 602 → 757 k€ | 651 → 1.171 k€ |
| Konzern mit Report Server | 15 / 400 / 25 → 90 | 269 → 256 k€ (K.O.) | 175 → 262 k€ (K.O.) | 288 → 317 k€ | 272 → 476 k€ |
| Großkonzern (Site-Lizenz) | 200 / 10.000 / 400 → 1200 | 1.367 → 2.132 k€ | 2.081 → 4.059 k€ (K.O.) | 3.717 → 4.990 k€ | 3.964 → 7.832 k€ |

**Wichtig zum Lesen:** Der größte Teil der Veränderung kommt nicht aus den Annahmen, sondern aus den Report-Zahlen der Presets, die jetzt der eigenen Heuristik entsprechen (Ersteller × 2 bis 6 plus 2 je 1.000 Viewer). Doppelt so viele Reports verdoppeln den Rollout, und der Rollout ist bei den Stunden-Ansätzen der größte Posten. Die Struktur-Fixes wirken gegenläufig: Deneb spart im Konzern-Preset 190 k€ Fluktuationsschulung, verliert aber 260 k€ Rollout. Paid wird im Konzern günstiger (Staffel je Jahr, keine Lizenz-Administration bei Site, sanftere Governance-Kurve), im Pilot teurer (frühere Staffelstufe gilt erst ab 25 Nutzern, höhere Stundensätze).

Die Rangfolge der Presets ändert sich nicht: Paid vorn im Pilot, Mittelstand und Konzern; Deneb vorn, wenn Paid per Red Flag ausfällt. Open Source liegt im Konzern jetzt näher an Paid (593 gegen 638 k€), ist dort aber durch „nur zertifizierte Visuals“ ausgeschlossen.

## Monte-Carlo-Facetten nach dem Audit (6.000 Ziehungen, € je Viewer und Jahr)

| Facette | Paid | Open Source | Deneb | Core + SVG | Harter Anteil Paid / OSS |
|:--|--:|--:|--:|--:|--:|
| Klein (1–3 Ersteller, 5–40 Viewer, Self-Service) | Ø 627, Platz 1 in 99 % | Ø 1.144 | Ø 1.525 | Ø 2.343 | 37 % / 26 % |
| Mittelstand (2–8 / 30–200, Managed) | Ø 206, Platz 1 in 79 % | Ø 281, 21 % | Ø 361 | Ø 535 | 51 % / 28 % |
| Konzern (15–60 / 800–4.000, Managed) | Ø 69, 45 % | Ø 73, 54 % | Ø 95 | Ø 144 | 62 % / 27 % |

Vor dem Audit: Klein Paid 100 %, Mittelstand Paid 75 %, Konzern OSS 84 %. Das Bild ist paid-freundlicher geworden, weil das Risiko jetzt den Rollout enthält (trifft OSS mit dem höchsten Abkündigungsrisiko) und die Staffel je Jahr greift. Der Kipp-Punkt Paid zu Open Source liegt bei 1 : 50 jetzt um 5 Ersteller / 250 Viewer (vorher 2 / 100), bei 1 : 100 unverändert beim ersten Ersteller. Dashboard: `../visual-standards-rechner-reviews/monte-carlo-kosten-je-viewer.html`.

## Was offen bleibt

1. **Messung statt Schätzung:** fünf Chart-Typen einmal mit Zebra oder Inforiver, einmal mit ChartKitchen, einmal mit Deneb und einmal mit SVG-Measures bauen, Stunden stoppen. Das ersetzt die neun Panelwerte durch einen Datenpunkt und ist die einzige Möglichkeit, den Faktor 2 bei der Wiederverwendung zu klären.
2. **Preisseiten mit Datum sichern:** Zebra BI, Inforiver, graphomate waren aus der Prüfumgebung nicht abrufbar. Snippets widersprechen sich bei Zebra in den Paketgrößen (Personal/Team gegen Starter/Business/Enterprise).
3. **Barwert als Umschalter neben der Rangfolge:** Paid ist lizenzlastig (spätes Geld), Deneb und Core aufbaulastig (frühes Geld). Bei 10 Jahren und 8 % kann das Plätze drehen; heute steht der Barwert nur als Zeile.
4. **Koexistenz:** fast jede Organisation endet bei zwei Ansätzen. Ein Parameter „Anteil der Charts beim Zweitansatz“ wäre der realistischste fehlende Baustein.
5. **Ersteller-Kapazität:** der Rechner prüft nie, ob drei Controller die 400 Stunden im ersten Jahr überhaupt haben. Eine Warnung „benötigte Stunden über x % der Kapazität“ wäre der praktischste Zusatz.
6. **Datenmodell-Vorleistung bei Core:** die Measure- oder UDF-Bibliothek ist Datenmodellarbeit und sitzt genau auf der Ausschlussgrenze „Datenmodell vorhanden“. Entweder eigener Posten oder klarere Grenze.

## Rohdaten

`presets-v06.json` und `presets-v07.json` enthalten P10/P50/P90, Kategorien und Rangfolge je Preset vor und nach dem Audit (Headless-Lauf mit 1.500 Ziehungen je Ansatz). Die sechs Prüfberichte stehen unverändert daneben, inklusive der Stellen, an denen die Prüfer einander widersprechen.
