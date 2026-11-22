# Auftrag P2 · Gegenprüfung eines Dossiers

**Modell:** Opus · je Dossier ein Prüfer, der es nicht geschrieben hat
**Ergebnis:** `energiewende/research/pruefung/<NN>_pruefung.md`
**Regeln:** `energiewende/agents/REGELN.md` (Quellenzugriff, Belegpflicht,
nichts umgehen) — mit den Ergänzungen unten.

## Ziel

Du prüfst **ein** Dossier der Phase 1 (die Nummer steht in deinem
Startbefehl). Du hast es nicht geschrieben und sollst ihm nicht glauben.
Für jede geprüfte Zahl schlägst du die Stelle im Primärdokument nach und
hältst fest: steht sie dort, in dieser Abgrenzung, von diesem Urheber?

Du verbesserst das Dossier nicht und schreibst nicht hinein. Du lieferst
einen Prüfbericht; die Einarbeitung macht die Orchestrierung.

## Was geprüft wird

1. **Alle Kernaussagen** des Dossiers (der Abschnitt am Anfang) und jede
   Zahl, auf die sie sich stützen.
2. **Alle Parameter mit Konfidenz A** im JSON-Block.
3. **Eine Stichprobe von zehn Parametern mit Konfidenz B:** die
   Parameter-IDs alphabetisch sortieren und jeden k-ten nehmen
   (k = Anzahl B geteilt durch 10, abgerundet, mindestens 1), beginnend beim
   ersten. So ist die Auswahl nachvollziehbar und nicht von dir gewählt.
4. **Die Schwerpunkte für dein Dossier** aus der Tabelle unten — dort
   liegen Zahlen, die bisher nur aus Suchtreffern stammen (Konfidenz C) und
   jetzt lesbar sein könnten.
5. **Rechnungen:** Jede Eigenrechnung des Dossiers, die in eine Kernaussage
   eingeht, rechnest du unabhängig nach — aus den Rohdaten oder den
   aufbereiteten Dateien unter `energiewende/data/`, mit eigenem Code, ohne
   das Skript des Dossiers zu übernehmen.
6. **Einseitigkeit:** Fehlt eine naheliegende Gegenposition? Ist eine Zahl
   günstiger oder ungünstiger dargestellt, als die Quelle es hergibt — in
   welche Richtung auch immer? Benenne beides, auch wenn es dem Hauptpfad
   „Erneuerbare + Speicher“ schadet.

## Neu freigegebene Hosts (zusätzlich zu denen in den Regeln)

dserver.bundestag.de, eur-lex.europa.eu, climate.ec.europa.eu,
www.consilium.europa.eu, www.bundeswirtschaftsministerium.de, www.ifo.de,
www.diw.de, www.ewi.uni-koeln.de, www.zew.de, www.bundesbank.de,
www.sachverstaendigenrat-wirtschaft.de, www.dena.de, www.bgr.bund.de,
www.landtag-bw.de, www.quantifiedcarbon.com, www.entsoe.eu,
www.acer.europa.eu, ag-energiebilanzen.de, umweltbundesamt.de,
files.ember-energy.org.

Hinweise: www.ifo.de antwortet auf `curl` mit einer Browser-Prüfung
(„Client Challenge“) — das wird **nicht** umgangen, auch nicht durch eine
geänderte Browser-Kennung; die Zahl bleibt dann „nicht prüfbar“. Dateien
liegen in `energiewende/quellen/raw/P2-<NN>/`. Die Rohdateien der Phase 1
liegen unter `energiewende/quellen/raw/` und `energiewende/data/raw/` und
dürfen gelesen werden.

## Schwerpunkte je Dossier

| Dossier | Schwerpunkte |
|---|---|
| 01 R21-Behauptungen | Quellen von Factsheet B bei Quantified Carbon (8,2 gegen 10,5 ct/kWh, 310 Mrd. €); ZEW (Rausch 2026: 824 oder 850 Mrd. €); DIW/MCC 2020 zur Dunkelflaute; die Rechenfehler in Factsheet H nachrechnen; die Zuordnung der 2.100 Mrd. € |
| 02 Kostenstudien | Herkunft und Abgrenzung der 13,3 Bio. € (PwC ist nur nach Registrierung lesbar — prüfe, ob eine frei zugängliche Fassung, Pressemitteilung oder Bundestagsquelle die Abgrenzung belegt); der FAZ-Gastbeitrag hinter den „500 Mrd. € pro Jahr“; 740 Mrd. € Netzausbau (EWI, ef.Ruhr); dena-Leitstudie; Bericht des Bundesrechnungshofs (Drs. 21/903); UBA-Kostensätze; die Umrechnung in % des BIP |
| 03 Stromdaten | Aus `energiewende/data/profiles_*.json` unabhängig nachrechnen: Volllaststunden, längste Phase unter 10 % und unter 5 % je Jahr; Abweichung Solar gegen SMARD 2024; Redispatch-Mengen 2023–2025 an der Quelle; AG-Energiebilanzen-Jahreswerte (jetzt erreichbar) |
| 04 Energiesystem | AG-Energiebilanzen-Tabellen 2024/2025 (jetzt erreichbar); der Widerspruch beim Strombedarf 2030 der Langfristszenarien (765–792 gegen 594–638 TWh); Strombedarf 2045 je Studie an der Fundstelle; Treibhausgase 2025 |
| 05 Speicher, Dunkelflaute | Die Energielücke im schwächsten 5-Tage-Fenster je Jahr (4,8 / 5,7 / 7,0 TWh) unabhängig aus `data/profiles_*.json` nachrechnen, samt der Annahmen (215 GW PV, 145 GW Wind, 520 TWh); die drei Kostenvarianten (nur Batterien, Wasserstoff-Turbinen mit Kavernen, Auktionspreis); DIW/MCC 2020 am Original (diw.de); die Batteriekosten-Lücke (ISE 400–600 gegen strommix 180–260 €/kWh — was misst jede Zahl?); Wasserstoff-Kraftwerke und Batterien im Netzentwicklungsplan 2045; Stunden mit negativen Preisen |
| 06 Europa | ENTSO-E (ERAA, TYNDP) und ACER (70-%-Regel, Wohlfahrtsgewinn) jetzt am Original; Handelsbilanz je Jahr aus den aufbereiteten Daten nachrechnen; die Wind-Korrelation nachrechnen; die Aussage zu Preisspitzen und Importen |
| 07 Lieferketten | Chinas Anteile an den Extra-EU-Einfuhren aus den Comext-Dateien nachrechnen (PV, Akkus, Transformatoren); fossile Importrechnung 2021/2022/2024; die Herleitung der Stresstest-Preisfaktoren; Importquoten je Energieträger (AG Energiebilanzen) |
| 08 Wasserstoff, E-Fuels, Lkw | Elektrolyse-Bestand und Pipeline (EWI); ReFuelEU-Unterquoten am Amtsblatt (EUR-Lex); die Wirkungsgradkette (UBA); das Regler-Skript `scripts/p1_08_regler.py` unabhängig nachrechnen (140 TWh, 56 GW); der Widerspruch beim E-Kerosin-Preis |
| 09 Referenzpfade | Antwort der Bundesregierung zum Rückbau der Kernkraftwerke (Drucksachen auf dserver.bundestag.de); Radiant-Gutachten (Landtag BW); BGR-Schiefergas-Studie; die Einigung von Rat und Parlament zur Löschung von Zertifikaten (consilium.europa.eu) und COM(2026) 616; das Ende der Zertifikatsausgabe um 2039; EPR2-Kosten |
| 10 Wirtschaftslage | Bundesbank, Sachverständigenrat und ifo zum Anteil der Energiepreise am Produktionsrückgang; Industrieproduktion und Strompreise aus den Eurostat-Dateien nachrechnen; Ember-Jahresdatei für die Aussage „als einziges Industrieland“; EEG-Zuschuss aus dem Bundeshaushalt |

## Ergebnis

`energiewende/research/pruefung/<NN>_pruefung.md`, kein YAML-Frontmatter:

1. **Urteil in fünf Zeilen:** Wie belastbar ist das Dossier insgesamt?
2. **Prüftabelle:** Parameter-ID oder Kernaussage · Wert im Dossier ·
   geprüfte Fundstelle (Dokument, Seite) · Ergebnis: **bestätigt** ·
   **abweichend** (mit dem Wert, der dort steht) · **nicht prüfbar** (mit
   Grund) · neue Konfidenz und `primaer_gelesen`.
3. **Abweichungen im Detail,** nach Gewicht sortiert: was trägt eine
   Kernaussage und ist falsch oder schief?
4. **Nachrechnungen** mit Ergebnis und Abweichung in Prozent; dein Code liegt
   unter `energiewende/scripts/pruefung/`.
5. **Einseitigkeit und fehlende Gegenpositionen.**
6. **Weiterhin nicht erreichbar** (Host, Dokument).
7. Ein ```json-Block `korrekturen`: je Eintrag `id`, `alt`, `neu`,
   `fundstelle`, `confidence`, `primaer_gelesen`, `begruendung`.

Abschlussmeldung: fünf bis zehn Zeilen — Zahl der geprüften Werte, davon
bestätigt / abweichend / nicht prüfbar, die drei gewichtigsten Abweichungen.
