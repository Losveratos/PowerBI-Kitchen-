---
title: "Story-Claims-Check — Verifikation der neuen Inhalte aus docs/03_grundlage_erweitert_v2.md"
project: "strommix"
type: "research / freigabe-dossier"
status: "geprueft; Freigabeliste am Ende maschinenlesbar"
date: "2026-08-19"
zugriffsdatum_web_quellen: "2026-08-19"
language: "de"
scope: "Kap. 5.4a, 6a, 6a.4, 6b, 8a des erweiterten Grundlagendokuments"
---

# Story-Claims-Check

> **Zweck.** `docs/03_grundlage_erweitert_v2.md` (kurz: **MD**) enthaelt gegenueber
> `docs/01_grundlage_ges_faktencheck.md` fuenf neue Bloecke (5.4a, 6a, 6a.4, 6b, 8a).
> Bevor daraus eine Scrollytelling-Story wird, wird hier jeder neue Claim geprueft:
> gegen unsere bereits adversarial reviewte Datenbasis
> (`research/kosten_kernkraft.md`, `kosten_ee_speicher.md`, `ist_zustand_de.md`,
> `risiken_co2.md`, `review_v09.md`, `data/model_params.json`,
> `data/monte_carlo_reference.json`) und gegen die Primaerliteratur.
>
> **Praemisse des Projekts:** Alles, was erzaehlt wird, muss belegt, nachpruefbar
> und mit Bandbreite versehen sein. Was Setzung bleibt, wird als Setzung markiert
> (**M**) und darf nicht als Befund erzaehlt werden.

## 0. Lesehilfe

### 0.1 Konfidenz (wie in den bestehenden Dossiers)

| Stufe | Bedeutung |
|---|---|
| **A** | mehrfach unabhaengig belegt / institutionelle Primaerquelle |
| **B** | einfach belegt, plausibel, nicht gegengeprueft |
| **C** | kursiert, Primaerquelle in dieser Session nicht pruefbar |
| **M** | **Setzung / Modellannahme** — nicht quellenbelegt, muss als solche erzaehlt werden |

### 0.2 Prüfergebnis-Kategorien

`bestaetigt` · `korrigiert` · `verworfen` · `Setzung` · `unverifizierbar`

### 0.3 Verifikationsgrenze dieser Session

Der Volltextabruf (WebFetch) war fuer praktisch alle relevanten Domains durch den
Netzwerk-Egress blockiert — u. a. `law.stanford.edu`, `link.springer.com`,
`pure.iiasa.ac.at`, `ffe.de`, `openaccess.ffe.de`, `dewiki.de`, `aben.com.br`
und **die GES-Studien-PDF selbst** (`global-energy-solutions.org`). Die Verifikation
erfolgte ueber Suchindex-Auszuege mit woertlichen Zitaten aus den Primaerquellen.
Das ist dieselbe Einschraenkung wie in `kosten_kernkraft.md` 0.1 und
`kosten_ee_speicher.md` 0 — sie ist bekannt, dokumentiert und begrenzt die
Konfidenz einzelner Zahlen, nicht die Richtung der Befunde.

**Direkte Konsequenz:** Die Zubaufaktoren der GES-Studie (Kap. 6a.1) und die
Anhangstabellen 4/5 konnten **nicht** am Original gegengeprueft werden. Alle
Aussagen zur Studien-Methodik stehen und fallen mit der Richtigkeit der
MD-Wiedergabe.

### 0.4 Zusammenfassung in Zahlen

| Kategorie | Anzahl |
|---|---|
| bestaetigt | 7 |
| korrigiert (Wert und/oder Quelle) | 11 |
| verworfen (nicht erzaehlbar) | 4 |
| Setzung (**M**, erzaehlbar nur als Annahme) | 6 |
| unverifizierbar (Konfidenz C, nur mit Vorbehalt) | 3 |

---

# Teil 1 · Konflikte mit der eigenen validierten Datenbasis

Das MD nutzt in Kap. 5.4, 5.4a, 6a und 6b noch die **unkorrigierten** Werte des
Erstdokuments. Unsere Recherche hat mehrere davon bereits verworfen oder
korrigiert. Diese Konflikte muessen aufgeloest werden, **bevor** die Story
gebaut wird — sonst erzaehlt die Story Zahlen, die unser eigenes Dossier
widerlegt hat.

## K1 · Vogtle 3&4 — Wechselkursfehler

| | |
|---|---|
| **MD-Wert** | 12.388 €/kW (Kap. 5.4, 5.4a, JSON) |
| **Unser validierter Wert** | **13.500 €/kW**, Spanne 12.980–14.260 |
| **Warum** | 12.388 impliziert einen nicht ausgewiesenen Kurs von ~1,21 USD/EUR. Bei unserem einheitlichen EZB-Stichtagskurs (1,1555) ergeben 36,8 Mrd. USD / 2.234 MW netto = **14.258 €/kW**; die MIT-Angabe (~15.000 USD/kW) = 12.981 €/kW. `kosten_kernkraft.md` 1.2/6 |
| **Konfidenz** | A |
| **Konsequenz fuer die Story** | Ueberall 13.500 statt 12.388. Der abgeleitete „westliche Mittelwert" 14.667 €/kW aendert sich damit ebenfalls (siehe K3). |

## K2 · Ungewichteter 5-Projekte-Mittelwert 10.275 €/kW — VERWORFEN

| | |
|---|---|
| **MD-Wert** | 10.275 €/kW als „Mittelwert (5 Projekte)", darauf aufbauend LCOE 166,9 und die gesamte Kap.-6a.2-/6a.5-Neuberechnung |
| **Unser Befund** | **Methodisch nicht haltbar — streichen.** Ungewichtetes arithmetisches Mittel ueber fuenf Projekte mit voellig unterschiedlichen Kostenabgrenzungen (EPC-Vertrag vs. Gesamtprojekt vs. inkl. Finanzierung), Preisbasen (2009 / £2015 / €2023 / laufend), Baujahren und Blockzahlen (1 bis 4). Der Wert hat keine oekonomische Bedeutung. `kosten_kernkraft.md` 6 |
| **Ersatz** | Drei getrennte Cluster mit Bandbreiten: **Asien/Golf 1.870–4.950** · **EU-Serie/Vertrag 7.300–13.500** · **West-FOAK 13.500–17.300** €/kW |
| **Konfidenz** | A (die Cluster), Verwerfung des Mittelwerts: methodisch |
| **Konsequenz fuer die Story** | Alle MD-Zahlen, die auf 10.275 aufbauen (166,9 · 203,4 €/MWh LCOE; 191 · 229 €/MWh Szenario-LSCOE), duerfen **nicht** als Ergebnis erzaehlt werden. Ersetzen durch Cluster-Bandbreiten. |

## K3 · „Westlicher Mittelwert" 14.667 €/kW — methodisch dieselbe Schwaeche

| | |
|---|---|
| **MD-Wert** | (12.388 + 14.364 + 17.250)/3 = 14.667 €/kW |
| **Nachgerechnet** | Arithmetik korrekt. Mit unserem korrigierten Vogtle-Wert waeren es (13.500 + 14.364 + 17.264)/3 = **15.043 €/kW**. |
| **Aber** | Derselbe Einwand wie K2: drei Projekte, drei Preisbasen (€2023, laufende £-Preise, USD-Gesamtkosten), keine Gewichtung nach Leistung. Zusaetzlich fehlen die **guenstigeren** westlichen EU-Referenzen (EPR2 7.265–7.583, Dukovany 7.906, Polen 11.968, Sizewell C 13.472), die unser Dossier als die **direktesten** Analogien zu einem deutschen Programm ausweist. Der MD-Wert bildet damit systematisch das obere Ende ab. |
| **Ersatz** | Unser Preset-System: **EU-Serie 7.500 · EU-Mittel 12.000 · Erstprojekt 17.500 €/kW** (`kosten_kernkraft.md` 7.1, in `model_params.json` als `nuclear.capex_presets_eur_kw`). |
| **Konfidenz** | B |

## K4 · Korea 2.116 €/kW — Quelle zu schwach

| | |
|---|---|
| **MD-Wert/Quelle** | 2.116 €/kW, Quelle „Schlanj/Substack (2026)" |
| **Unser Befund** | Groessenordnung plausibel, **Quelle fuer ein wissenschaftliches Papier ungenuegend** (persoenlicher Substack-Blog ohne Peer Review). |
| **Ersatz** | Spanne **1.870–2.720 €/kW**: APR1400-Inlandswert 2.157 USD/kW (Pulaski-Foundation-Studie 2021; ScienceDirect/Energy Policy 2022) = 1.867 €/kW, und als aktuellster Vertragswert **Shin Hanul 3&4** 8,8 Mrd. USD / 2.800 MW = **2.720 €/kW**. |
| **Konfidenz** | B |
| **Zusatz, der in die Story gehoert** | Auch Korea hat Verzoegerungen: Shin Kori 3/4 wurden 3 bzw. 5 Jahre spaeter fertig, Kosten +~30 %. Der Export-Aufschlag betraegt Faktor ~2,7 (VAE ~5.800 USD/kWe ggue. Inland). „Korea baut puenktlich und im Budget" ist zu vereinfacht. `kosten_kernkraft.md` 1.2 |

## K5 · Barakah 5.257 €/kW

| | |
|---|---|
| **MD-Wert** | 5.257 €/kW |
| **Unser validierter Wert** | **Spanne 3.150–4.950 €/kW** (EPC-Vertrag 20,4 Mrd. USD → 3.153; Gesamtkosten 32 Mrd. USD → 4.945 bei einheitlichem Kurs) |
| **Konfidenz** | A (EPC) / B (Gesamt) |

## K6 · Der Opex-Ansatz „7 % des CAPEX pro Jahr" — der groesste rechnerische Konflikt

Dies ist der **wichtigste** Punkt dieses Dossiers, weil er die gesamte
Kap.-6a-Neuberechnung des MD betrifft.

Das MD uebernimmt die GES-Konvention „Opex = 7 % des CAPEX/a" und wendet sie
auf **korrigierte, viel hoehere** CAPEX-Werte an. Damit skalieren die
Betriebskosten automatisch mit:

| CAPEX €/kW | Opex nach MD-/GES-Konvention | Opex-Anteil am LCOE (8.000 h) | unser Absolutwert (165 €/kW/a, 7.500 h) |
|---:|---:|---:|---:|
| 6.000 | 420 €/kW/a | 52,5 €/MWh | 22,0 €/MWh |
| 10.275 | 719 €/kW/a | 89,9 €/MWh | 22,0 €/MWh |
| 14.667 | 1.027 €/kW/a | **128,3 €/MWh** | 22,0 €/MWh |
| 17.250 | 1.208 €/kW/a | **150,9 €/MWh** | 22,0 €/MWh |

`kosten_kernkraft.md` 4.2 nennt das ausdruecklich „physikalisch unsinnig":
Der Betrieb eines Kraftwerks wird nicht dreimal so teuer, nur weil der Bau
teurer war. Bottom-up gegengerechnet (US-Ist-Betriebskosten 16,8 €/MWh +
Brennstoff 4,6 + grosszuegig 10 fuer Rueckbau/Entsorgung) ergeben sich
~31 €/MWh ≈ 250 €/kW/a ≈ **4,2 %** von 6.000 €/kW — die GES-Annahme von 7 %
ist also schon beim Studien-CAPEX eher **grosszuegig** (also ein Befund
*zugunsten* der Studie, siehe Teil 3).

**Effekt auf die MD-Zahlen** (dieselben CAPEX, aber unsere Kernkraft-Parameter:
Opex 165 €/kW/a absolut, 7.500 h, n = 60 a, Brennstoff 8 €/MWh,
Entsorgung 8 €/MWh):

| CAPEX €/kW | MD-Rechnung 5 % | unsere Rechnung 5 % | MD 8 % | unsere Rechnung 8 % |
|---:|---:|---:|---:|---:|
| 6.000 (GES) | 101,6 | **80,3** | 122,9 | **102,6** |
| 10.275 (Ø 5) | 166,9 | **110,4** | 203,4 | **148,7** |
| 14.667 (West-Ø) | 234,0 | **141,3** | 286,0 | **196,0** |
| 16.000 (MD 8a.4) | — | **150,7** | 311,1 (MD) | **210,4** |
| 17.500 (Erstprojekt) | — | **161,3** | — | **226,5** |

→ **Die Kernkraft-LCOE des MD sind um 45–90 €/MWh ueberzeichnet.** Das ist kein
Detail, sondern der Hauptgrund, warum das MD zu „das Studienergebnis kehrt sich
um" kommt. Mit korrekt modelliertem Opex bleibt eine deutliche Verteuerung
bestehen — aber keine Umkehrung.

**Konfidenz:** A (der methodische Punkt), B (die Absolutwerte).

## K7 · Volllaststunden Wind onshore — MD uebernimmt die GES-Annahme unkritisch

| | |
|---|---|
| **MD** | uebernimmt 1.700 h fuer Wind onshore, Befund „Wind: keine systematische Verzerrung" |
| **Unser Befund** | **Zu milde.** 1.700 h ist der *Bestandsflotten*-Durchschnitt; **Neuanlagen erreichen im Mittel ueber 2.400 h**. Bei sonst identischen Annahmen sinkt der LCOE von ~93 auf ~66 €/MWh (−29 %). Realitaets-Check: BNetzA-Ausschreibung Mai 2026 = 50,6 €/MWh mengengewichtet. `kosten_ee_speicher.md` 1/4/9 |
| **Konfidenz** | A |
| **Konsequenz** | Der groesste einzelne Korrektur-Hebel bei Wind fehlt im MD komplett. In der Story gehoert er neben die PV-Korrektur — er wirkt **in dieselbe Richtung** (die EE-Szenarien werden guenstiger) und ist besser belegt als die PV-CAPEX-Spanne. |

## K8 · Weitere Quellenkonflikte (kurz)

| MD-Quelle | Unser Befund | Ersatz |
|---|---|---|
| „Logic Energy, PV-Marktbericht 2026" | Werte richtig, aber kommerzieller Anbieter-Blog | Fraunhofer ISE Juli 2024 (41–69 €/MWh) + BNetzA-Ausschreibung 01.03.2026 (3,99–5,10 ct/kWh, mengengewichtet 4,94) |
| „Branchendaten (WAB/BWE)" fuer Offshore | keine Publikation mit diesen Werten auffindbar | IRENA 2024 (global ~2.620 €/kW); Modellspanne **2.600–4.500** statt 3.000–4.500 |
| „Ontario Clean Air Alliance" (Vogtle) | nicht auffindbar | EIA / Columbia CGEP / POWER Magazine |
| „World Nuclear Association (Dez. 2025)" (Flamanville) | Zahl stammt vom **Cour des Comptes, 14.01.2025**; WNA referiert sie nur | Primaerquelle Cour des Comptes |
| „Deutsche WindGuard / BMWK 2024" | existiert, aber es gibt eine **neuere** Ausgabe „Stand 2025" (Okt. 2025) | auf 2025er-Ausgabe aktualisieren (1.240 + 550 ≈ 1.790 €/kW) |

---

# Teil 2 · Die neuen Claims im Einzelnen

## Kapitel 5.4a — Historische Kernkraft-Baukosten

### C1 · „Grubler (2010) belegt die historischen Kosten" — **bestaetigt, aber inhaltlich gegen die MD-Erzaehlung**

**MD-Aussage.** Grubler (2010) wird als Quelle fuer US-Baukosten der 1960er/1975
angefuehrt; die Erzaehlung lautet: Frankreich habe durch standardisierte
Serienfertigung „eine Stabilisierung auf vergleichsweise niedrigem Niveau
(2.000–3.700 €/kW)" erreicht.

**Prüfergebnis: die Studie ist echt und zitierfaehig — die daraus abgeleitete
Erzaehlung ist jedoch falsch herum.**

Arnulf Grubler, *„The costs of the French nuclear scale-up: A case of negative
learning by doing"*, **Energy Policy 38(9), 2010, S. 5174–5188**. Kernaussagen:

- Das franzoesische PWR-Programm gilt als der **erfolgreichste** nukleare
  Hochlauf eines Industrielands — ermoeglicht durch zentrale
  Entscheidungsstrukturen, hohe Standardisierung und regulatorische Stabilitaet.
- **Genau dieses Programm zeigt trotzdem eine erhebliche reale Kosteneskalation.**
  Grublers Referenzmodell: Anstieg von **4.200–4.400 FF98/kW** (CP0/CP1,
  Baujahre 1974–1977) auf **14.500 FF98/kW** (letzte N4, Mitte der 1990er).
  Ueber alle Reaktoren ohne N4: von ~4.000 auf ~10.000 FF98/kW, **Faktor 2,5**.
  Ueber den Gesamtzeitraum 1970–2000: **Faktor ~3,5**.
- Der Titel ist das Ergebnis: **„negative learning by doing"** — Kosten stiegen
  *mit* kumulierter Erfahrung, statt zu fallen.

**Umgerechnet** (1 FF1998 = 0,152449 €1998; Inflation 1998 → 2026 Faktor ≈ 1,66,
dt. VPI): **rund 1.060 €/kW (CP0/CP1) → rund 3.660 €/kW (N4)**, in Preisen 2026.

**Konsequenz fuer die Story — wichtig:** Das MD zitiert Grubler und erzaehlt
gleichzeitig das Gegenteil seiner Kernaussage. Der franzoesische Serienbau war
**keine Stabilisierung**, sondern eine (langsamere) Eskalation. Die ehrliche
Formulierung lautet: *Selbst der weltweit am besten standardisierte Serienbau
konnte die Kostensteigerung nur verlangsamen, nicht umkehren.* Das ist
inhaltlich staerker und besser belegt als die MD-Version — und es entzieht
gleichzeitig dem Gegenargument „Serienbau loest das Problem" die
Pauschalitaet, ohne es zu erledigen.

- **Zu verwendender Wert:** Frankreich, Messmer-Flotte: **1.060–3.660 €/kW
  (2026er Preise)**, Eskalationsfaktor **3,5** ueber 1970–2000.
- **Quelle/Konfidenz:** Grubler 2010, Energy Policy 38(9):5174–5188 — **A**
  (Studie und Kernaussage mehrfach belegt); die €-Umrechnung ist unsere
  Eigenleistung → **B**, Deflator dokumentieren.
- **Erzaehlbar:** „Selbst Frankreichs standardisiertes Serienprogramm — der
  weltweit erfolgreichste nukleare Hochlauf — verteuerte sich real um den Faktor
  3,5; der Fachbegriff dafuer lautet ,negatives Lernen'."

### C2 · US-Zeitreihe „957–1.914 €/kW (1960er) / 9.568–11.482 €/kW (1975)" — **korrigiert**

**MD-Aussage.** Diese beiden Bandbreiten, Quelle „Grubler (2010) / Achse des
Guten, bereits in 2024-USD angegeben".

**Prüfergebnis: Richtung stimmt, Punktwerte und Quelle nicht.**

1. **Grubler 2010 ist eine Frankreich-Studie.** Sie liefert keine
   US-Zeitreihe. Die Zuordnung ist falsch.
2. **„Achse des Guten" ist ein Meinungsblog, „Grokipedia" ein KI-generiertes
   Wiki.** Beide sind fuer ein Papier mit wissenschaftlichem Anspruch
   **nicht zitierfaehig** — unabhaengig davon, ob die Zahl zufaellig stimmt.
   Beide **ersatzlos entfernen**.
3. **Die zitierfaehige Primaerquelle** ist Lovering, Yip & Nordhaus,
   *„Historical construction costs of global nuclear power reactors"*,
   **Energy Policy 91 (2016), S. 371–382** — 349 Reaktoren in sieben Laendern,
   58 % aller weltweit gebauten Bloecke, Overnight Construction Cost in
   **konstanten USD 2010**. Belegte Werte:
   - Bloecke mit Baubeginn **Ende der 1960er**: **≤ 1.000 USD2010/kW**
   - Baubeginn **~1970**: **~2.000 USD2010/kW**; danach +50–200 % bis 1978
     (5–15 % p. a.)
   - Kohorte **Baubeginn 1968–1978** (51 Bloecke, bei Three Mile Island im Bau):
     **1.800–11.000 USD2010/kW**; davon 38 im Mittelband **3.000–6.000**,
     11 zwischen 1.800–3.000, 10 zwischen 6.000–11.000
   - Bloecke, die bei TMI im Bau waren und danach fertig wurden: Median-OCC
     **2,8-fach** hoeher, Bauzeit **2,2-fach** laenger
4. **Umgerechnet in €2026** (US-CPI 2010 → 2026 ≈ ×1,52; EZB-Kurs 0,86543):
   Faktor **≈ 1,32 €2026 je USD2010**.
   - Ende 1960er: **≤ ~1.320 €/kW**
   - ~1970: **~2.640 €/kW**
   - Kohorte 1968–78: **2.370–14.500 €/kW**, Mittelband **3.960–7.910 €/kW**

**Bewertung der MD-Werte:** Die untere Bandbreite (957–1.914) trifft die
1960er-Groessenordnung grob, ist aber um die Inflation 2010→2026 zu niedrig.
Die 1975er-Bandbreite (9.568–11.482) liegt im **obersten Dezil** der
Lovering-Verteilung und wird als Typwert praesentiert — das ueberzeichnet.

- **Zu verwendende Werte:** siehe oben, in €2026, mit Preisbasis-Angabe.
- **Quelle/Konfidenz:** Lovering et al. 2016, Energy Policy 91:371–382 — **A**
  fuer die Originalwerte in USD2010; die €2026-Umrechnung **B** (eigene
  Deflationierung, Deflator ausweisen).

### C3 · Pflicht-Beipackzettel: die Lovering-Kontroverse — **muss erzaehlt werden**

Wenn Lovering-Zahlen verwendet werden, **muss** die Methodikkritik mit. Sie ist
in derselben Zeitschrift erschienen:

| Kritik | Fundstelle | Kernvorwurf |
|---|---|---|
| **Gilbert, Sovacool, Johnstone, Stirling**, „A reply to ,Historical construction costs of global nuclear power reactors'" | Energy Policy **102** (2017), S. 640–643 | Die Definition der Baukosten sei **zu eng**; Overnight Capital Cost sei keine geeignete Kennzahl, um Baukosten zu beurteilen (Bauzinsen, Eigentuemerkosten, Nachruestungen fehlen). |
| **Koomey, Hultman, Grubler**, „Apples and oranges: Comparing nuclear construction costs across nations, time periods, and technologies" | Energy Policy **102** (2017), S. 650–654 | Verwechslung von Lern- und Erfahrungskurven; Vermischung von *tatsaechlichen* Kostentrends mit dem Verhaeltnis Schaetzung-zu-Ist; Vermischung von Komponenten- und Gesamtinstallationskosten; Einbeziehung frueher Demonstrationsreaktoren verzerre den Ausgangspunkt nach unten. |

**Erzaehlbare Fassung (neutral):** „Der einzige globale Datensatz historischer
Baukosten stammt von Lovering et al. (2016). Er wird breit genutzt — und ist
zugleich fachlich umstritten: Zwei Erwiderungen in derselben Zeitschrift
kritisieren, dass ,Overnight'-Kosten Bauzinsen und Eigentuemerkosten
ausklammern und dass fruehe Demonstrationsreaktoren den Startpunkt kuenstlich
senken. Wir zeigen die Zahlen deshalb als Bandbreite, nicht als Trendlinie."

**Konfidenz:** A (beide Erwiderungen sind belegt und zitierfaehig).

### C4 · Isar 2 ≈ 3.730 €/kW — **unverifizierbar (C), nur mit Vorbehalt**

**MD-Aussage.** DM 4,75 Mrd. / 1.400 MW netto, eigene Inflationsbereinigung
(Faktor 2,15), Quelle „IAEA INIS".

**Prüfergebnis:**
- Die **Inflationsrechnung ist nachvollziehbar**: DM 4,75 Mrd. / 1.400 MW =
  3.393 DM/kW (1988) = 1.735 €/kW nominal; × 2,10–2,15 (dt. VPI 1988 → 2026)
  = **3.640–3.730 €/kW**. Methodisch in Ordnung.
- Die **Eingangszahl DM 4,75 Mrd. konnte nicht belegt werden.** In dieser Session
  auffindbar war nur, dass die Kosten fuer den Standort Isar bereits in der
  Planungsphase von 840 Mio. auf 1,274 Mrd. DM stiegen und fuer einen weiteren
  Reaktor „rund vier Milliarden DM" veranschlagt wurden. Die IAEA-INIS-Eintraege
  zu Isar 2 („plant model of Convoy", „Planning, construction and commissioning
  of the Isar-2 convoy lead project") existieren, waren aber nicht abrufbar.
- Auch die **Abgrenzung** ist unklar: Overnight, inkl. Bauzinsen, inkl.
  Erstkernladung? Ohne diese Angabe ist eine €/kW-Zahl laut
  `kosten_kernkraft.md` 0.3 „praktisch wertlos".

- **Zu verwendender Wert:** 3.600–3.750 €/kW (2026er Preise), **Konfidenz C**,
  Abgrenzung unbekannt.
- **Story-Empfehlung:** Entweder mit sichtbarem C-Badge und dem Zusatz
  „Abgrenzung unbekannt", oder ganz weglassen und stattdessen den belegten
  Grubler-Frankreich-Korridor als europaeische Serien-Referenz zeigen. Die
  Aussage der Story haengt nicht an diesem Datenpunkt.

### C5 · „U-foermiger Verlauf" als Interpretation — **teilweise korrigiert**

**MD-Aussage.** Vier Phasen: guenstige 1960er → Explosion Mitte der 1970er
(USA, **vor** Three Mile Island) → Stabilisierung durch Serienfertigung in
Frankreich/Deutschland → erneute Explosion seit den 2000ern.

**Prüfergebnis, Punkt fuer Punkt:**

| Teilaussage | Ergebnis |
|---|---|
| 1960er sehr guenstig | **bestaetigt** (Lovering: ≤ 1.000 USD2010/kW) |
| Explosion Mitte der 1970er, **vor** TMI 1979 | **bestaetigt** (Lovering: +50–200 % zwischen 1970 und 1978, also vor dem Unfall). Zugleich zeigt derselbe Datensatz, dass TMI die Kosten der bereits im Bau befindlichen Bloecke noch einmal um Median-Faktor 2,8 erhoehte. **Beides erzaehlen**, sonst wird ein Regulierungs-Narrativ einseitig. |
| „Stabilisierung auf niedrigem Niveau" in Frankreich | **korrigiert → falsch.** Grubler 2010 belegt Faktor 3,5 Eskalation im selben Zeitraum (C1). Richtig ist: **langsamere** Eskalation als in den USA und auf niedrigerem Absolutniveau. |
| Deutschland/Konvoi als Beleg fuer Stabilisierung | **unverifizierbar** (C4) — ein einzelner, ungeprüfter Datenpunkt traegt keine Phasenaussage. |
| Erneute Explosion seit den 2000ern auf 8.000–17.000+ €/kW | **bestaetigt**, aber unvollstaendig: Die EU-Referenzen liegen **darunter** (EPR2 7.265–7.583 OCC, Dukovany-EPC 7.906, Polen 11.968, Sizewell C 13.472). `kosten_kernkraft.md` 2 |

**Erzaehlbare Fassung:** „Kernkraft-Baukosten folgen keiner Lernkurve nach
unten. Sie waren in den 1960ern niedrig, stiegen in den USA schon vor Three
Mile Island um ein Vielfaches, stiegen selbst im standardisierten
franzoesischen Serienprogramm real um den Faktor 3,5 — und liegen bei
westlichen Erstprojekten seit den 2000ern noch einmal deutlich hoeher. Der
Befund ist nicht ,Kernkraft war frueher billig', sondern: **Baukosten sind
institutionenabhaengig und historisch nach oben, nicht nach unten gelaufen.**"

---

## Kapitel 6a.1 — Zurueckgerechnete GES-Kapazitaeten

### C6 · Das Gleichungssystem — **nachgerechnet, arithmetisch bestaetigt; Eingangsgroessen nicht pruefbar**

**Eigene Nachrechnung** (Skript-Ergebnis, reproduzierbar):

Gegeben: 2022-Verteilung PV : Wind on : Wind off = 66,5 : 58,1 : 8,1 GW;
Zubaufaktoren laut MD 5,3 / 3,6 / 10,0; Summenbedingung 438 GW.

```
Ansatz:  Basis_i = k · b_i          mit b = (66,5 ; 58,1 ; 8,1)
Bedingung: Σ k · b_i · f_i = 438
Nenner:  Σ b_i · f_i = 66,5·5,3 + 58,1·3,6 + 8,1·10,0
                     = 352,45 + 209,16 + 81,00 = 642,61
k = 438 / 642,61 = 0,68160

Modell-Basis 2022:  PV 45,33 · Wind on 39,60 · Wind off 5,52 GW  (Σ 90,45)
80-%-Szenario:      PV 240,2 · Wind on 142,6 · Wind off 55,2 GW  (Σ 438,0)
```

| MD-Wert | Nachgerechnet | Ergebnis |
|---|---|---|
| Basis 45,3 / 39,6 / 5,5 (Σ 90,4) | 45,33 / 39,60 / 5,52 (Σ 90,45) | ✅ **exakt bestaetigt** |
| 80-%-Szenarien 240,2 / 142,6 / 55,2 | 240,2 / 142,6 / 55,2 | ✅ **exakt bestaetigt** |
| 100-%-Szenario 519,3 / 213,5 / 53,2 | Summe 786,0 ✅; implizierte Faktoren **11,46 / 5,39 / 9,64** | ⚠️ **arithmetisch konsistent, aber die Faktoren sind im MD nicht genannt** — die Aufteilung auf die drei Technologien ist im 100-%-Fall nicht rekonstruierbar, nur die Summe. |

**Bewertung der MD-Aussage „Kontrollrechnung weicht nur um ~4 % ab".**
Die Aussage ist nicht nachvollziehbar dokumentiert. Was sich pruefen laesst:
die 100-%-Kapazitaeten summieren sich exakt auf 786 GW — das ist eine
Definition, kein unabhaengiger Test. Ein echter Konsistenztest waere nur
moeglich, wenn die 100-%-Zubaufaktoren der Studie bekannt waeren. **Diese
Aussage nicht als Validierungssignal erzaehlen.**

**Was dagegen ein echtes Signal ist:** Die aus der 438-GW-Bedingung
*unabhaengig* abgeleitete Modell-Basis (90,45 GW) trifft die im
Kostenminimum-Szenario ausgewiesene fEE-Leistung (90 GW) auf 0,5 % genau. Das
ist ein sauberer Kreuztest und stuetzt die Rueckrechnung.

### C7 · Der uebersehene Befund: die Modellbasis liegt 32 % unter der Realitaet 2022

**Eigener Befund, im MD nicht adressiert.** Die reale deutsche fEE-Leistung
Ende 2022 betrug **132,7 GW** (66,5 + 58,1 + 8,1). Die zurueckgerechnete
Modell-Basis der Studie betraegt **90,45 GW** — nur **68 %** davon.

Daraus folgen zwei erzaehlbare Punkte:

1. Entweder verwendet die Studie eine andere Bezugsgroesse als die installierte
   Leistung (z. B. Erzeugungsmengen, Netto- statt Bruttoleistung, oder eine
   normalisierte Groesse), **oder** ihre Zubaufaktoren beziehen sich nicht auf
   den realen Anlagenbestand. Ohne den Studienanhang (nicht abrufbar) ist das
   nicht entscheidbar. → als **offene Frage** kennzeichnen, nicht als Fehler
   behaupten.
2. Nimmt man die 90 GW des „Kostenminimum"-Szenarios woertlich als installierte
   Leistung, dann liegt dieses Szenario **unter dem Bestand von 2022 (132,7 GW)
   und rund 118 GW unter dem Bestand von Mitte 2026 (≈ 208 GW: PV 126,6 +
   Wind on 71,0 + Wind off 10,8)** — es wuerde also einen Rueckbau bestehender
   Anlagen implizieren. `ist_zustand_de.md` 2.1

- **Konfidenz:** A (die Ist-Kapazitaeten), B (die Schlussfolgerung, weil die
  Definition der Studien-Groesse unklar ist).
- **Erzaehlbar:** „Das ,Kostenminimum'-Szenario der Studie kommt mit 90 GW
  Wind und Solar aus. Deutschland hatte Mitte 2026 bereits rund 208 GW am Netz.
  Das Szenario beschreibt damit kein Ausbauziel, sondern einen Zustand unterhalb
  des heutigen Bestands — worauf sich die 90 GW genau beziehen, laesst sich ohne
  den Studienanhang nicht klaeren."

---

## Kapitel 6a.2 / 6a.5 — Neuberechnete Szenario-LSCOE

### C8 · Die MD-Neuberechnung — **arithmetisch korrekt, methodisch nicht uebernehmbar**

**Nachrechnung der MD-Werte (bestaetigt):** Alle LCOE-Werte des MD lassen sich
mit der angegebenen Formel exakt reproduzieren — PV Studie 124,9 · Wind onshore
90,8 · Kernkraft 6.000 → 101,6 · 10.275 → 166,9 · 14.667 → 234,0 · bei 8 %
WACC 122,9 / 203,4 / 286,0. **Die Rechnung ist sauber.**

**Warum die Ergebnisse trotzdem nicht in die Story duerfen:**

1. **Opex-Artefakt** (K6): ueberzeichnet die Kernkraft-LCOE um 45–90 €/MWh.
2. **Basiswerte** (K1–K3): 10.275 und 14.667 sind verworfen bzw. zu ersetzen.
3. **Nur die Erzeugungsseite korrigiert.** Das MD sagt selbst, Netz-, Speicher-
   und Backup-Kosten bleiben unveraendert. Das ist als Vorbehalt korrekt
   benannt, macht die Ergebnisse aber zu Teilrechnungen, nicht zu
   Systemkosten.
4. **Wind-Volllaststunden** (K7) bleiben unkorrigiert, obwohl das der
   bestbelegte Hebel ist.

**Was stattdessen erzaehlt wird:** unsere eigenen, dispatch-basierten
Ergebnisse aus `data/monte_carlo_reference.json` (Modell `scripts/model.py`,
1.000 Ziehungen, Dreiecksverteilungen aus `model_params.json`):

| Preset | deterministisch | Median (WACC fest) | p5–p95 (WACC fest) | Median (WACC unsicher) | p5–p95 (WACC unsicher) |
|---|---:|---:|---|---:|---|
| GES · Kostenminimum | 155,8 | **161** | 133–190 | 175 | 127–256 |
| GES · 80 % EE + Gas | 140,7 | **142** | 132–152 | 148 | 123–185 |
| GES · 80 % EE + H₂ | 197,2 | **197** | 186–208 | 205 | 177–246 |
| GES · 100 % Erneuerbare | 270,9 | **270** | 253–288 | 286 | 239–352 |
| Ist 2025 (Referenz) | 107,1 | 108 | 101–115 | 113 | 95–140 |

- **Konfidenz:** B (Modellergebnis auf validierten Parametern; Profile PARTIAL,
  Gas-Brennstoffkosten = 0 → alle Werte sind **Untergrenzen**).

### C9 · „Das Studienergebnis kehrt sich faktisch um" — **VERWORFEN (Ueberdehnung)**

**MD-Aussage** (6a.3 und 6a.5): Mit realistischem CAPEX und 8 % WACC werde das
Kostenminimum-Szenario „zum teuersten oder zweitteuersten aller vier Szenarien"
und die zentrale Kernaussage der Studie kehre sich „faktisch um".

**Prüfergebnis: nicht haltbar.** Drei Gruende:

1. **Der Effekt ist grossenteils ein Rechenartefakt** (K6, Opex-Skalierung).
2. **Die Unsicherheitsbaender ueberlappen.** Unsere Monte-Carlo-Rechnung
   (1.000 Ziehungen, Dreiecksverteilungen) ergibt fuer das Kostenminimum
   p5–p95 = **133–190 €/MWh** und fuer 80 % EE + Gas **132–152 €/MWh**. Die
   Baender ueberschneiden sich vollstaendig im unteren Bereich. Eine Aussage
   „das eine ist teurer als das andere" ist bei dieser Streuung **nicht
   trennscharf**. Die ehrliche Aussage lautet: *Der Median des
   Kostenminimum-Szenarios liegt bei unseren Parametern rund 19 €/MWh ueber dem
   des 80-%-EE-Gas-Pfads — aber die Verteilungen ueberlappen, und in etwa einem
   Fuenftel der Ziehungen ist das Kernkraft-Szenario guenstiger.*
3. **Die Rangfolge bleibt in unserem Modell teilweise erhalten.** Das
   Kostenminimum bleibt guenstiger als **beide** H₂-lastigen Pfade (197 und
   270 €/MWh) — die Studie hat in diesem Punkt recht behalten. Nur gegenueber
   dem Gas-gestuetzten 80-%-Pfad dreht sich das Vorzeichen.

**Erzaehlbare Fassung:** „Mit unseren Kostenannahmen verliert das
Kernkraft-Szenario seinen grossen Vorsprung: Es rutscht vom ersten auf den
zweiten Platz, hinter den gasgestuetzten 80-%-Erneuerbaren-Pfad. Von einer
Umkehr des Studienergebnisses zu sprechen, waere allerdings zu viel — die
Unsicherheitsbaender ueberlappen, und gegenueber beiden wasserstofflastigen
Pfaden bleibt das Kernkraft-Szenario guenstiger."

---

## Kapitel 6a.4 — Elektrolyseur und technologiespezifischer WACC

### C10 · Elektrolyseur-CAPEX 800–1.200 €/kW — **VERWORFEN, Richtung ist umgekehrt**

**MD-Aussage.** Die Studie setze 1.760 €/kW an, aktuelle Marktdaten (dena, FfE
2026) zeigten 800–1.200 €/kW; die Studie ueberschaetze also die Kosten um
45–120 %. Daraus abgeleitet: −2,9 €/MWh fuer „80 % + mehr H₂", −5,0 €/MWh fuer
„100 % EE".

**Prüfergebnis: Der Claim faellt in beiden Quellen durch — und die zitierte
FfE-Studie sagt genau das Gegenteil.**

1. **FfE, Discussion Paper Juli 2025**, *„Von der Theorie zur Praxis: Warum
   gruener Wasserstoff teurer ist als gedacht"*. Kernergebnis: realistische
   **Systemkosten von rund 3.120 €/kW im Jahr 2025 — etwa das Zweieinhalbfache
   des ueblicherweise Angenommenen.** Begruendung woertlich: Viele Studien
   betrachteten ausschliesslich die Hardware (Stack, Gleichrichter,
   Kompressoren) und blendeten Planung, Genehmigung und Installation nahezu
   vollstaendig aus. Passend dazu die Marktbeobachtung derselben Quelle:
   oeffentliche Prognosen von 2,50–4,50 €/kg bis 2030 stehen realen
   Projektentwickler-Angaben von **9–13 €/kg (2024)** gegenueber.
   → **Genau die vom Auftrag befuerchtete Stack-vs.-System-Verwechslung.** Die
   800–1.200 €/kW sind Hardware-/Stack-nahe Werte, keine Systemkosten.
2. **dena.** Die zitierte dena-Quelle („Elektrolysekapazitaeten in Deutschland",
   Stand April 2026) ist eine **Kapazitaets- und Projektdatenbank** (rund
   200 MW realisiert, 1,2 GW im Bau, > 260 Projekte) — sie weist keine
   €/kW-Investitionskosten aus. Die Quellenzuordnung im MD ist eine
   **Fehlzuordnung**.
3. **Unser eigenes Dossier** kommt unabhaengig zum selben Ergebnis:
   `kosten_ee_speicher.md` 7.1 nennt europaeische Ist-CAPEX 2025 von
   **~2.075 €/kW (Alkali)** bzw. **~2.196 €/kW (PEM)** und stellt ausdruecklich
   fest, diese laegen „deutlich ueber den in vielen Energiesystemmodellen
   unterstellten 800–1.500 €/kW". Modellansatz in `model_params.json`:
   **1.200 / 2.100 / 2.600 €/kW**.

**Ergebnis:** Die GES-Annahme von 1.760 €/kW ist **nicht zu hoch, sondern eher
zu niedrig**. Der MD-Befund „benachteiligt H₂-Szenarien" ist damit
**verworfen** — die Verzerrung geht, wenn ueberhaupt, in die andere Richtung.
Die abgeleiteten Korrekturen (−2,9 / −5,0 €/MWh) sind zu streichen.

- **Zu verwendender Wert:** **2.100 €/kW** (Spanne **1.200–2.600**, Ist-Markt EU
  2.075–2.196); als Obergrenze/Vollkosten-Referenz **FfE 3.120 €/kW (2025,
  inkl. Planung/Genehmigung/Installation)**.
- **Quelle/Konfidenz:** FfE Discussion Paper 07/2025 — **B** (Zahl aus
  Sekundaerwiedergabe, PDF nicht abrufbar); Global Hydrogen Hub 2025 (EU-Ist) —
  **B**; unser Modellwert — **B**.
- **Erzaehlbar:** „Bei den Elektrolyseuren dreht sich der Vorwurf um: Wer
  800–1.200 €/kW ansetzt, rechnet nur die Hardware. Nimmt man Planung,
  Genehmigung und Installation dazu, kommt das Muenchner FfE fuer 2025 auf rund
  3.120 €/kW — das Zweieinhalbfache. Die Studie rechnet hier also eher zu
  guenstig als zu teuer."

### C11 · Technologiespezifischer WACC von 8 % fuer Kernkraft — **bestaetigt (Richtung), Wert als Bandbreite**

**MD-Aussage.** Einheitliche 5 % WACC seien nicht neutral; real seien bei
Erstprojekten 7–9 %+ ueblich; mit 8 % steige die Kernkraft-LCOE deutlich.

**Prüfergebnis: bestaetigt — und in unserem Dossier sogar staerker begruendet.**
`kosten_kernkraft.md` 5.2/5.4 fuehrt zwei unabhaengige Argumente:

1. **Bauzinsen (IDC).** 5 % ueber eine einjaehrige PV-Bauzeit ist praktisch
   null; 5 % ueber 10 Jahre Kernkraft-Bauzeit sind **+25–30 % auf die
   Baukosten**, bei 12 Jahren und 7 % **+45–50 %**. Empirischer Anker: EDF nennt
   fuer EPR2 72,8 Mrd. € ohne, aber ~100 Mrd. € **mit** Finanzierungskosten =
   **+37 %**. Ein Modell, das nur CAPEX × CRF rechnet, verschenkt diesen
   Aufschlag zugunsten der Technologie mit der laengsten Bauzeit.
2. **Risikoprofil.** Jedes einzelne europaeische Neubauprojekt braucht ein
   staatliches Instrument zur kuenstlichen Senkung des Kapitalkostensatzes:
   CfD (Hinkley), RAB (Sizewell C), Staatsgarantien fuer 100 % des Fremdkapitals
   (Polen), zinsguenstige Staatsdarlehen (Tschechien). Das ist ein Faktum, kein
   Werturteil.

**Empirischer Beleg fuer die Hebelwirkung** (IEA/NEA, *Projected Costs of
Generating Electricity* 2020, 243 Anlagen aus 24 Laendern): Nuklear-LCOE bei
3 % Diskontsatz 27–61 USD/MWh, bei 7 % 42–102, bei 10 % 57–146. Eigene
CRF-Rechnung bei n = 60: Faktor **2,78** zwischen 3 % und 10 %.

**Wichtige Gegenrichtung, die mit muss** (`review_v09.md` M10): Derselbe
IEA/NEA-Befund lautet auch — **bei 3 % ist Kernkraft in allen untersuchten
Laendern die guenstigste Option, bei 10 % in praktisch keinem.** Die
Kernkraftfrage ist in Europa im Kern eine **Finanzierungsfrage**. Das ist ein
Argument in beide Richtungen und darf nicht einseitig erzaehlt werden.

- **Zu verwendender Wert:** WACC als **Regler 3 % / 5 % / 9 %**
  (`model_params.global.wacc`), nicht als einzelner „realistischer" Punktwert.
  8 % liegt darin.
- **Quelle/Konfidenz:** A (IEA/NEA-Spanne, EPR2-Finanzierungsaufschlag,
  Existenz der staatlichen Instrumente).

---

## Kapitel 6b — Annahmen-Audit (10 Parameter)

### C12 · Der Audit-Zaehler „4 pro Kernkraft : 1 pro EE : 5 neutral" — **korrigiert**

Zeilenweise geprueft:

| # | MD-Zeile | Prüfergebnis |
|---|---|---|
| 1 | PV-CAPEX 1.500 vs. 600–1.000 → „zu teuer" | **bestaetigt** (`kosten_ee_speicher.md` 9), zusaetzlich durch BNetzA-Zuschlaege 3,99–5,10 ct/kWh gestuetzt. Quelle auf Fraunhofer/BNetzA umstellen (K8). |
| 2 | Kernkraft-CAPEX 6.000 vs. 10.275–17.250 → „zu guenstig" | **korrigiert.** Richtung bestaetigt, Ausmass ueberzeichnet. Differenzieren: **~25–45 % Unterschaetzung** ggue. einem seriellen EU-Programm (EPR2 7.265–7.583, Dukovany 7.906), **~100–190 %** ggue. einem westlichen Erstprojekt. `kosten_kernkraft.md` 6 |
| 3 | Kernkraft-WACC 5 % → „zu guenstig" | **bestaetigt** (C11), Bandbreite statt Punktwert. |
| 4 | Wind-CAPEX → „plausibel" | **korrigiert → zu milde.** CAPEX ja, aber die **Volllaststunden** (1.700 h Bestandsflotte statt 2.400 h Neuanlagen) sind der groessere Hebel (K7). Diese Zeile wechselt damit von „neutral" zu „zulasten der EE-Szenarien". |
| 5 | Elektrolyseur 1.760 vs. 800–1.200 → „zu teuer" | **VERWORFEN** (C10). Richtung dreht sich um. |
| 6 | Netzausbau 732 Mrd. € → „grob plausibel" | **bestaetigt.** Unsere Referenzen: IMK/Hans-Boeckler 12/2024 **651 Mrd. €** bis 2045 (Uebertragung 328 + Verteilung 323); NEP 2037/2045 V2025 **365–392 Mrd. €** nur Uebertragung. `ist_zustand_de.md` 5.1 |
| 7 | Erdgaspreis 40 €/MWh, keine ETS-Kosten auf Restemissionen | **korrigiert** — siehe C13. |
| 8 | Kernkraft-Brennstoff 10 €/MWh → „plausibel" | **bestaetigt.** Frankreich ~8 €/MWh (2025), USA 4,6 €/MWh. Unsere Modellspanne 6/8/11. |
| 9 | CCS-Kosten 80 €/t → „plausibel" | **bestaetigt** als Groessenordnung; in unseren Dossiers nicht eigenstaendig geprueft → **C**. |
| 10 | Interkonnektoren 20 GW → „plausibel bis leicht guenstig fuer EE" | **bestaetigt.** Unser Modell rechnet Import/Export bewusst **gar nicht** — das ist konservativer als die Studie und muss in der Story gesagt werden. |

**Fehlend im MD-Audit, aber in unseren Dossiers belegt und relevant:**

| Zusatzbefund | Richtung |
|---|---|
| **Gaskraftwerks-CAPEX-Explosion**: der Standardwert 800 €/kW ist fuer 2026 um Faktor 2–2,5 zu niedrig (Gasturbinenpreise +bis 195 %; deutsches 0,5-GW-GuD > 1 Mrd. €). Trifft **alle** Szenarien mit Gas-Backup, auch das Kostenminimum. `kosten_ee_speicher.md` 8 | neutral bis leicht **gegen** die gasgestuetzten Pfade |
| **Kernkraft-Opex 7 %/a ist eher grosszuegig** als knapp (bottom-up ~4,2 % von 6.000 €/kW). `kosten_kernkraft.md` 4.2 | **fuer** die Studie |
| **Saisonale H₂-Speicherung trifft strukturell das teure Ende** der EWI-Spanne, weil geringe Zyklenzahl = hohe spezifische Kosten (Faktor ~7,8 zwischen hoher und niedriger Zyklenzahl). `kosten_ee_speicher.md` 7.2 | **fuer** die Studie |
| **Round-Trip Strom→H₂→Strom realistisch 30–40 %**, nicht 50 %+. Fuer 1 kWh rueckverstromten Strom braucht es 2,5–3,3 kWh EE-Strom — genau der Mechanismus, der die 1.162 GW im 100-%-Szenario erzeugt. **Physikalisch korrekt, darf nicht kleingeredet werden.** `kosten_ee_speicher.md` 7.3 | **fuer** die Studie |
| **Keine Batteriespeicher modelliert** — bei > 31 GWh Bestand Mitte 2026 und Rekordzubau eine relevante Modell-Luecke. `ist_zustand_de.md` 2.2 | **gegen** die Studie |

**Korrigierter Zaehler:** statt „4 : 1 : 5" eher **4–5 Befunde zulasten der
EE-Szenarien · 3–4 Befunde zugunsten der EE-Szenarien (d. h. zulasten der
Studie) · Rest plausibel** — mit dem entscheidenden Zusatz, dass die Befunde
**unterschiedlich stark** sind. Ein reiner Abzaehlbalken waere irrefuehrend;
die Story sollte die Effektgroessen zeigen, nicht die Anzahl.

### C13 · ETS-Luecke bei Gas+CCS-Restemissionen — **plausibel, aber falsch bepreist und in der Groesse ueberzeichnet**

**MD-Aussage.** „ETS-Preis laut EWI > 200 €/t bis 2035" → Luecke bei
Restemissionen aus Gas+CCS → beguenstigt die gasgestuetzten 80-%-Szenarien.

**Prüfergebnis, drei Teile:**

1. **Die Luecke selbst ist real.** CCS eliminiert Emissionen nicht.
   `risiken_co2.md` 1.2: Erdgas-GuD **mit** CCS 49–220 g CO₂/kWh
   (Lebenszyklus), Default 120. Wenn ein Modell darauf keinen CO₂-Preis legt,
   fehlt ein Kostenblock. **Richtung bestaetigt.**
2. **Der zitierte Preis ist aus dem falschen System.** Die EWI-Werte
   (~120 €/t 2027, ~205 €/t 2035) stammen aus dem **ETS 2** (Gebaeude,
   Verkehr, kleine Industrie) — und `risiken_co2.md` 2.2 haelt ausdruecklich
   fest: *„Der ETS 2 betrifft nicht die Stromerzeugung (die liegt im ETS 1)."*
   Zusaetzlich startet ETS 2 nicht 2027, sondern **2028** (Rat 05.11.2025,
   EP 13.11.2025). Fuer den Stromsektor gilt **ETS 1**: Marktpreis Mai 2026
   ~74 €/t; 2030-Konsensmedian **126 €/t** (Analystenspanne 80–147); fuer 2040
   existiert **keine belastbare Projektion** (Ziel regulatorisch offen).
   → **Zahl korrigieren.**
3. **Die Groessenordnung ist klein.** Eigene Rechnung:

   | Restemission Gas+CCS | bei 75 €/t | bei 126 €/t | bei 205 €/t |
   |---|---:|---:|---:|
   | 49 g/kWh (unteres Ende) | 3,7 €/MWh | 6,2 €/MWh | 10,0 €/MWh |
   | 120 g/kWh (Default) | 9,0 €/MWh | 15,1 €/MWh | 24,6 €/MWh |
   | 220 g/kWh (oberes Ende) | 16,5 €/MWh | 27,7 €/MWh | 45,1 €/MWh |

   Das gilt **je MWh Gasstrom**. Systemweit, bei rund 10 % Gasanteil, sind das
   **0,4–4,5 €/MWh** — eine bis zwei Groessenordnungen unter dem
   Kernkraft-CAPEX-Effekt. Als „Gegengewicht" im Audit taugt der Posten
   **nicht**.
4. **Zusatzbefund:** Die Luecke trifft **nicht nur** die 80-%-Szenarien. In
   unserem Dispatch braucht auch das GES-Kostenminimum-Szenario
   **53,9 GW Gas-Spitzenleistung** (`monte_carlo_reference.json`,
   `presets.kostenminimum.gas_peak_gw`). Ein kernkraftlastiges System ist in
   unserer Rechnung nicht gasfrei.

- **Konfidenz:** A (ETS-1/ETS-2-Abgrenzung, ETS-2-Verschiebung auf 2028),
  B (ETS-1-Projektion 2030), B (CCS-Restemissionen).
- **Erzaehlbar:** „Dass auf die Restemissionen von Gas-mit-CCS kein CO₂-Preis
  gelegt wird, ist eine echte Luecke — aber eine kleine: Sie bewegt die
  Systemkosten um weniger als fuenf Euro je Megawattstunde. Und der oft zitierte
  Preis von ueber 200 €/t stammt aus dem ETS 2, der fuer Strom gar nicht gilt."

---

## Kapitel 8a — 30-Jahres-Plan 2026–2056

### C14 · Startwerte 2026 — **korrigiert, drei von sechs zu niedrig**

| Groesse | MD 2026 | Unser validierter Wert | Abweichung | Quelle/Konfidenz |
|---|---:|---|---|---|
| **Photovoltaik** | 110 GW | **117,0 GW** (Ende 2025) · **≈ 126,6 GW** (Juli 2026) | **−6 % bis −13 %** | MaStR/BNetzA, Datenstand 26.06.2026 · **A** |
| **Wind onshore** | 65 GW | **68,1 GW** (Ende 2025) · **≈ 71,0 GW** (Juli 2026) | **−5 % bis −8 %** | BNetzA/IWR · **A** |
| **Wind offshore** | 10 GW | **9,6 GW** (Ende 2025) · **10,8 GW** in Betrieb (Jahresmitte 2026) | ✅ vertretbar | Stiftung Offshore-Windenergie · **A** |
| **Batteriespeicher** | 5 GW / 15 GWh | **18,5–20,0 GW / 31,0–31,5 GWh** (alle Groessenklassen inkl. Heimspeicher, H1 2026) | **um Faktor 3,7 bzw. 2,1 zu niedrig** | MaStR/BSW/IWR · **A** ⚠ | 
| **Gaskraftwerke** | 30 GW | **≈ 35–36 GW** | −14 % bis −17 % | BNetzA-Kraftwerksliste · **B** |
| **Kernkraft** | 0 GW | 0 GW | ✅ | **A** |
| **Strombedarf** | 560 TWh | Bruttostromverbrauch **518 TWh** (2024, NEP-Basisjahr) · **512–526 TWh** (2025) | **+7 bis +9 % zu hoch** | UBA/AGEB/BDEW · **A** ⚠ |

⚠ **Wichtige Praezisierung zur Batterie:** Die 18,5–20 GW / 31 GWh sind der
**MaStR-Gesamtbestand inklusive Heimspeicher**. Fuer *netzdienliche
Grossspeicher* kursiert ein deutlich niedrigerer Wert (1,2 GW / 2,4 GWh, Q2
2026), den `ist_zustand_de.md` 2.2 aber ausdruecklich als **implausibel niedrig
und nicht ohne Pruefung verwendbar** kennzeichnet. Wenn die MD-Zahl 5 GW/15 GWh
als *Grossspeicher* gemeint war, liegt sie zwischen beiden Fundstellen. **In der
Story die Abgrenzung immer mitnennen** — sonst entsteht ein Scheinkonflikt.

**Konsequenz:** Der Plan startet zu niedrig und muss deshalb bis 2035/2045
weniger zubauen, als er ausweist. Bei PV bedeutet die Korrektur von 110 auf
126,6 GW, dass die Phase-1-Investition um rund 11 Mrd. € ueberschaetzt ist —
klein gegenueber den anderen Befunden, aber die Startwerte sind das Fundament
der ganzen Erzaehlung und muessen stimmen.

### C15 · Lernkurven PV 650→420 / Batterie 200→120 €/kWh — **Setzung (M) mit teilweise belegbarer Richtung**

**PV: Richtung belegt, Tempo Setzung.**
- Belegt: Fraunhofer ISE, *Stromgestehungskosten Erneuerbare Energien*, Juli
  2024 — Freiflaechen-PV heute **4,1–6,9 ct/kWh**, bis **2045 3,1–5,0 ct/kWh**
  (**−24 % bis −28 %**), auf Basis technologiespezifischer Lernraten und
  Marktszenarien. **A**
- Belegt: historische **Lernrate** der PV-Industrie **26 %** je Verdopplung der
  kumulierten Produktion fuer 1976–2025 (ITRPV, 16. Ausgabe; zuvor 24,9 %). **B**
- Belegt: IRENA erwartet global rund **500 USD/kW** fuer PV im Jahr 2030 —
  **aber mit ausdruecklichem Vorbehalt**, dass in Europa und Nordamerika
  strukturell hoehere Kosten fortbestehen (Genehmigungen, Balance-of-System). **B**
- **Setzung bleibt:** die konkreten Stuetzstellen **650 → 500 → 420 €/kW**. Die
  Degression von −35 % ueber 30 Jahre ist etwas ambitionierter als die
  ISE-Projektion (−24 bis −28 % bis 2045), liegt aber in derselben
  Groessenordnung. → **M**, als Annahme erzaehlen, mit ISE-Korridor als
  Vergleichslinie.
- **Und:** der MD-Startwert 650 €/kW liegt **unter** unserem Modellwert
  (750 €/kW, Spanne 600–1.000). Das ist zulaessig, aber es ist bereits das
  optimistische Ende — die Lernkurve startet also nicht neutral.

**Batterie: Setzung mit dokumentierter Gegenevidenz.**
- Pro: BNEF-Preissurvey Dez. 2025 — Pack-Preise auf Rekordtief **108 USD/kWh**
  (−8 % ggue. 2024), stationaere Packs **70 USD/kWh**; berechnete **Lernrate
  ~18 %** je Verdopplung. **A**
- Pro: IRENA 2024 — Batteriespeichersysteme **−93 % seit 2010**, 2024 bei
  **192 USD/kWh**. **B**
- **Contra, und das muss mit:** Lazard LCOE+ v19 (Juli 2026) weist aus, dass
  **Speicher*system*kosten seit 2020 um 27 % gestiegen** sind (LCOS 100 MW/4 h:
  210–292 USD/MWh). Ursachen: Zinsen, Zoelle, Lieferkettendruck,
  Rechenzentrumsnachfrage. `kosten_ee_speicher.md` 6 **A**
- **Der zentrale Unterschied:** Zelle/Pack ≠ System. Der Faktor zwischen
  Pack-Preis und betriebsbereitem Netzspeicher betraegt in Europa aktuell
  **2,5–3×**. Unser Modellwert fuer schluesselfertige 4-h-Systeme in Europa:
  **180–260 €/kWh** (Default 210). Der MD-Startwert **200 €/kWh** liegt darin —
  **das ist korrekt und gut gewaehlt.** Der Endwert **120 €/kWh (2046–2056)**
  liegt unterhalb der heutigen Systemkosten-Untergrenze und ist **reine
  Setzung**. `kosten_ee_speicher.md` 6 warnt explizit: *„keine automatische
  Lernkurven-Extrapolation nach unten ohne Sensitivitaetsbetrachtung."*
- → **M**, mit sichtbarer Gegenlinie „Systemkosten sind seit 2020 gestiegen".

**Wind onshore konstant 1.750 €/kW ueber 30 Jahre** — plausible Setzung
(ausgereifte Technologie), deckt sich mit unserem Modellwert 1.790 €/kW. **M/B**.

**Elektrolyseur 900 → 480 €/kW** — **verworfen**, siehe C10: Der Startwert liegt
bereits um Faktor 2,3 unter den europaeischen Ist-Systemkosten (~2.100 €/kW) und
um Faktor 3,5 unter der FfE-Vollkostenrechnung (3.120 €/kW). Die gesamte
Elektrolyseur-Lernkurve des Plans ist damit nicht tragfaehig. Ersatzvorschlag:
Start **2.100 €/kW**, Degression auf **1.200–1.400 €/kW** bis 2056 als
**Setzung** kennzeichnen.

### C16 · Investitionsrechnung 1.412 Mrd. € — **arithmetisch bestaetigt, aber unvollstaendig**

**Nachgerechnet, Ergebnis exakt reproduziert:**

| Phase | Erzeugung + Speicher + Elektrolyse (eigene Nachrechnung) | MD-Gesamtzahl | impliziter Netzanteil |
|---|---:|---:|---:|
| 2026–2035 | 234,8 Mrd. € | 415 | 180,2 |
| 2036–2045 | 226,8 Mrd. € | 527 | 300,2 |
| 2046–2056 | 190,3 Mrd. € | 470 | 279,7 |
| **Summe** | **652 Mrd. €** (MD: 652 ✅) | **1.412** ✅ | **760** (MD: 760 ✅) |

Die Investitionsarithmetik ist also vollstaendig nachvollziehbar. **Zwei
substanzielle Luecken:**

1. **Es sind ausschliesslich Netto-Zubauten gerechnet, keine Ersatzinvestitionen.**
   Der PV-Bestand von 2026 (110–126 GW) erreicht bei 25–30 Jahren Lebensdauer
   zwischen 2051 und 2056 sein Lebensende; die 65–71 GW Wind onshore muessen
   bis ~2045 repowert werden; Batterien haben 15–20 Jahre. Phase 3 traegt zwar
   den Titel „Konsolidierung & Repowering", enthaelt aber keinen einzigen Euro
   dafuer. Groessenordnung des fehlenden Blocks (grob, mit den
   MD-eigenen Endpreisen):

   | Ersatz | Betrag |
   |---|---:|
   | PV-Bestand 110 GW @ 420 €/kW | 46 Mrd. € |
   | Wind onshore 65 GW @ 1.750 €/kW | 114 Mrd. € |
   | Wind offshore 10 GW @ 3.400 €/kW | 34 Mrd. € |
   | Batterie Phase 1, 120 GWh @ 120 €/kWh | 14 Mrd. € |
   | **Summe (nur Erstersatz)** | **≈ 208 Mrd. €** |

   → Die realistische Gesamtinvestition liegt eher bei **1.550–1.650 Mrd. €**.
   **Konfidenz B** (eigene Abschaetzung, als solche kennzeichnen).
2. **Der Netzanteil von 760 Mrd. € ist eine Setzung.** Unsere belegten
   Referenzen: **IMK 651 Mrd. €** bis **2045** (Uebertragung + Verteilung) und
   **NEP 365–392 Mrd. €** bis 2045 (nur Uebertragung). 760 Mrd. € bis **2056**
   ist eine Extrapolation ueber elf zusaetzliche Jahre — plausibel, aber nicht
   belegt. Das MD verweist auf „Kapitel 6a.4", wo Netzkosten gar nicht behandelt
   werden. → **M**.

### C17 · LSCOE 2056 = 121,7 €/MWh — **korrigiert; unser Modell ergibt rund 163 €/MWh**

**Rekonstruktion der MD-Rechnung** (aus den im MD genannten Bausteinen):

```
PV      400 GW ×  940 h =  376 TWh ×  53 EUR/MWh =  19,9 Mrd. EUR/a
Wind on 150 GW × 1700 h =  255 TWh ×  91 EUR/MWh =  23,2 Mrd. EUR/a
Wind off 70 GW × 3500 h =  245 TWh × 102 EUR/MWh =  25,0 Mrd. EUR/a
+ Netz 44,0 + Batterie 7,0 + Elektrolyse/Peaker 8,5
                                    Summe        = 127,6 Mrd. EUR/a

127,6 / 1050 TWh (Bedarf)     = 121,5 EUR/MWh   <- MD-Wert 121,7
127,6 /  876 TWh (Erzeugung)  = 145,7 EUR/MWh   <- korrekter Nenner
```

**Drei Befunde:**

1. **Der Nenner ist falsch.** Das MD teilt durch den **Bedarf** (1.050 TWh),
   obwohl die eigene Rechnung nur **876 TWh** erzeugt. Die Deckungsluecke von
   **174 TWh (17 %)** wird damit implizit zum Nulltarif gedeckt. Allein diese
   Korrektur hebt den Wert auf **145,7 €/MWh**. Das MD benennt die Luecke
   ehrlich im Kleingedruckten („muesste ueber Importe, Gas/H₂-Backup oder
   Lastmanagement geschlossen werden") — traegt sie aber nicht in die Zahl ein.
2. **Der Backup-Block ist zu klein.** 8,5 Mrd. €/a fuer Elektrolyse **und**
   Gas-/H₂-Peaker zusammen. In unserem Dispatch-Modell kosten dieselben
   Kapazitaeten (55 GW Elektrolyse, 45 GW Backup, H₂-Speicher, H₂-Turbine)
   **rund 36 Mrd. €/a** — Faktor 4. Zusaetzlich fehlen im MD **Brennstoff- und
   CO₂-Kosten** des Gasbetriebs vollstaendig.
3. **Unsere eigene Nachrechnung** mit `scripts/model.py` (`mix_system`), denselben
   Kapazitaeten (PV 400 / Wind on 150 / Wind off 70 GW, Batterie 110 GW /
   450 GWh, Elektrolyse 55 GW, H₂-Turbine 45 GW, Gas-Backup 45 GW,
   Bedarf 1.050 TWh, CO₂-Preis 75 €/t):

   | Parametersatz | LSCOE 2056 | Bemerkung |
   |---|---:|---|
   | `guenstig` (CAPEX min, VLh max, WACC 3 %) | **106,9 €/MWh** | fEE-Potenzial 1.225 TWh |
   | **`mittel`** (Zentralwerte, WACC 5 %) | **162,8 €/MWh** | fEE-Potenzial 1.038 TWh, ungedeckt 39 TWh |
   | `teuer` (CAPEX max, VLh min, WACC 9 %) | **290,1 €/MWh** | |
   | `mittel`, aber mit den **MD-eigenen** Volllaststunden (940/1.700/3.500 h) | **148,6 €/MWh** | fEE-Potenzial 876 TWh, ungedeckt 57 TWh |

   Kostenstruktur im Zentralfall (€/MWh): Netz 38,6 · Wind on 26,7 ·
   Wind off 25,3 · PV 25,2 · Elektrolyse 13,0 · Gas-Backup 11,3 ·
   Batterie 9,7 · H₂-Turbine 6,5 · H₂-Speicher 6,4.

   **Abweichung zum MD: +41 €/MWh (+34 %) im Zentralfall.** Und selbst dieser
   Wert ist eine **Untergrenze**, weil unser Modell keine Erdgas-Brennstoffkosten
   enthaelt (dokumentierte harte Datenluecke) und keine Importe modelliert.

   *Modell-Vorbehalte, die in die Story muessen:* Profile sind **PARTIAL**
   (H2-2024, 4.416 h, auf ein Jahr hochgerechnet — winterlastig, Backup-Mengen
   eher ueber- als unterschaetzt); fuer Offshore wird ersatzweise das
   Onshore-Profil verwendet; Import/Export und Lastmanagement sind bewusst nicht
   modelliert.

4. **Nebenbefund zu den Volllaststunden:** Die 174-TWh-Deckungsluecke des MD ist
   groesstenteils ein Artefakt der GES-Volllaststunden. Mit unseren
   Neuanlagen-Werten (PV 1.030 h, Wind on 2.400 h, Wind off 3.800 h) erzeugt
   derselbe Anlagenpark **1.038 TWh** statt 876 TWh — die Luecke schrumpft von
   17 % auf 1 %. Das ist ein Befund **zugunsten** des Plans, den das MD selbst
   verschenkt.

- **Zu verwendender Wert:** **LSCOE 2056 ≈ 163 €/MWh**, Bandbreite
  **107–290 €/MWh**, ausdruecklich als Untergrenze (ohne Gas-Brennstoff, ohne
  Import). **Konfidenz B.**

### C18 · Kernkraft-Vergleichspfad (8a.4) — **Richtung bestaetigt, Groesse korrigiert**

**MD-Aussage.** Zwei Reaktoren à 1,6 GW (2045, 2052), 16.000 €/kW, 8 % WACC →
Kernkraft-LCOE 311 €/MWh, Investition 51 Mrd. €, System-LSCOE 129,3 statt
121,7 €/MWh (**+7,6**).

**Prüfergebnis:**

| Teilaussage | Ergebnis |
|---|---|
| Vorlaufzeit 15–20+ Jahre, erster Block fruehestens Mitte der 2040er | **bestaetigt und sogar untermauert.** `kosten_kernkraft.md` 5.1: realistischer Gesamtpfad von der politischen Entscheidung bis zum ersten kommerziellen Block **18–25 Jahre** — inkl. Aufhebung des Neubauverbots, Behoerdenaufbau, Standortverfahren. Vergleich: Polen 6 Jahre Technologieentscheidung → Beton, Tschechien 5 Jahre Vergabe → Beton. **A** |
| CAPEX 16.000 €/kW fuer die 2040er | **plausibel, aber am oberen Rand.** Unsere Presets: 7.500 / 12.000 / **17.500**. 16.000 liegt zwischen „EU-Mittel" und „Erstprojekt". Bei nur zwei Bloecken ist die Naehe zum Erstprojekt-Wert begruendbar. **B** — aber als **Bandbreite 12.000–17.500** zeigen, nicht als Punktwert. |
| WACC 8 % | **plausibel** (C11), als Regler zeigen. |
| Kernkraft-LCOE **311 €/MWh** | **korrigiert.** Opex-Artefakt (K6). Mit unseren Parametern (Opex 165 €/kW/a absolut, 7.500 h, n = 60, Brennstoff 8, Entsorgung 8): **150,7 €/MWh bei 5 %**, **210,4 €/MWh bei 8 %** — statt 311. Plausibilitaetsanker: Fraunhofer ISE Juli 2024 nennt fuer Kernkraft-Neubau **136–490 €/MWh**, Lazard v18 **122–190 €/MWh**, der Hinkley-CfD (indexiert 17.01.2026) **~147 €/MWh**. 311 liegt im oberen Drittel, 210 mittig. |
| Investition 51 Mrd. € fuer 3,2 GW | **arithmetisch bestaetigt** (3,2 GW × 16.000 €/kW = 51,2 Mrd. €). |
| Systemeffekt **+7,6 €/MWh** | **korrigiert → kleiner.** Unser Modell mit denselben Kapazitaeten: **165,1 statt 162,8 €/MWh = +2,3 €/MWh**. Richtung bestaetigt, Betrag rund ein Drittel. |

**Der eigentliche, robuste Befund bleibt stehen** und ist unabhaengig von allen
Kostenannahmen: **3,2 GW auf ueber 600 GW Gesamtkapazitaet sind ein
Rundungsfehler.** Zwei Bloecke liefern rund 25 TWh/a bei 1.050 TWh Bedarf
(2,4 %) — bei 51 Mrd. € Kapitalbindung und ohne jeden Beitrag vor 2045. Das ist
ein **Skalen**-Argument, kein Kosten-Argument, und es traegt ohne
Zahlenakrobatik.

**Gegenposition, die mit muss:** Ein Programm mit *zwei* Bloecken ist die
denkbar unguenstigste Konstruktion — genau die Konstellation, in der keine
Serieneffekte entstehen. `kosten_kernkraft.md` 7.1 weist den Low-Fall
(7.500 €/kW) ausdruecklich als „nur erreichbar bei ≥ 6 Bloecken identischer
Bauart und Turnkey-Festpreis" aus. Wer Kernkraft fair pruefen will, muss sie
als **Programm** durchrechnen, nicht als Alibi-Paar. Ebenso gehoert der
dokumentierte SMR-Serieneffekt dazu (OPG Darlington: −32 % vom ersten Block zum
Durchschnitt ueber vier Bloecke) — und die Tatsache, dass er bislang der
einzige quantifizierte ist.

---

# Teil 3 · Neutralitaet: wo das MD ueberzieht, und was dagegensteht

Das MD argumentiert erkennbar in eine Richtung. Fuer die Story wird jede
Ueberdehnung entschaerft und die Gegenposition mitgefuehrt.

| # | MD-Ueberdehnung | Ehrlichere Fassung | Beleg |
|---|---|---|---|
| U1 | „kehrt sich faktisch um" (6a.3, 6a.5) | Rangwechsel um **einen** Platz, bei **ueberlappenden** Unsicherheitsbaendern (Kostenminimum p5–p95 133–190 vs. 80 % EE + Gas 132–152) | `monte_carlo_reference.json` |
| U2 | „Die Studie unterschaetzt Kernkraft um 100–170 %" | **25–45 %** ggue. seriellem EU-Programm, **100–190 %** ggue. westlichem Erstprojekt — und die grosszuegige Opex-Annahme der Studie kompensiert einen Teil davon | `kosten_kernkraft.md` 6, 4.2 |
| U3 | „westliche Gruppe ist der relevantere Vergleichsmassstab" — belegt nur mit USA/FR/UK | Die **EU-Neubauprojekte** sind die direktesten Analogien und liegen **darunter**: EPR2 7.265–7.583 (OCC), Dukovany-EPC 7.906, Polen 11.968, Sizewell C 13.472 €/kW. Die GES-Annahme von 6.000 €/kW ist **keine willkuerliche Zahl** — sie liegt nur knapp unter dem, was EDF selbst fuer ein serielles Programm ohne Finanzierungskosten ansetzt. | `kosten_kernkraft.md` 2.3 |
| U4 | Elektrolyseur-Korrektur zugunsten der H₂-Pfade | **Umgekehrt** — die H₂-Kette ist teurer, nicht billiger, als die Studie annimmt | C10 |
| U5 | Audit-Zaehler „4 : 1 : 5" | Effektgroessen statt Abzaehlen; **drei belegte Befunde sprechen fuer die Studie**: grosszuegige Opex-Annahme, saisonale H₂-Speicherung am teuren Ende der EWI-Spanne, Round-Trip-Wirkungsgrad 30–40 % (physikalisch korrekt und der eigentliche Treiber der 1.162 GW im 100-%-Szenario) | `kosten_ee_speicher.md` 1/7.2/7.3, `kosten_kernkraft.md` 4.2, `review_v09.md` M7 |
| U6 | WACC-Abschnitt nur in kostensteigernder Richtung | Gegenbefund Stufe A: **Bei 3 % Diskontsatz ist Kernkraft in allen von IEA/NEA untersuchten Laendern die guenstigste Option, bei 10 % in praktisch keinem.** Und: globaler Bauzeit-**Median 6,3 Jahre**, 68 % der Reaktoren weltweit unter 8 Jahren — auch wenn fuer eine Deutschland-Prognose das obere Quartil die richtige Kennzahl ist. | `review_v09.md` M10, `kosten_kernkraft.md` 5.1/5.2 |
| U7 | Korea/VAE nur als Fussnote „andere Wege" | Ausfuehren: standardisierte Baureihe ohne Designaenderungen, ununterbrochene Lieferkette seit den 1970ern, ein Betreiber, ein Regulator, staatlich gesteuerte Finanzierung. **Und die Gegenseite:** Shin Kori 3/4 mit 3 bzw. 5 Jahren Verzug und +30 % Kosten; Export-Aufschlag Faktor 2,7. Die Voraussetzungen sind in Deutschland rechtlich nicht herstellbar — das ist eine Feststellung, kein Werturteil. | `kosten_kernkraft.md` 1.2 |
| U8 | Ewigkeitskosten-Kapitel (7) suggeriert unbezifferbares Zusatzrisiko | Praezisieren: Rueckbau tragen die Betreiber selbst (unbegrenzte Nachschusspflicht); fuer Zwischen-/Endlagerung haben sie sich 2017 mit 24,1 Mrd. € **vollstaendig freigekauft** — jedes darueber hinausgehende Risiko traegt der Steuerzahler. KENFO-Vermoegen Ende 2025 ~25,6 Mrd. €, Rendite 2025 +6,2 % bei Zielrendite ~4 %. Die kursierende Zahl „170 Mrd. € bis 2100" ist **nicht primaerquellengeprueft und darf nicht verwendet werden.** | `kosten_kernkraft.md` 4.3 |
| U9 | Der Plan in 8a wird als „ganz ohne Risiken" der Kernkraft praesentiert | Der EE-Pfad hat eigene, belegte Risiken: China-Anteil in der PV-Lieferkette, kritische Rohstoffe fuer Batterien und Wind, Round-Trip-Verluste, saisonale Speicherkosten am teuren Ende, Netzausbau-Aufwaertsrisiken (Rohstoffe, Transformatorenknappheit, Genehmigungen) | `risiken_co2.md` 5.1/5.4, `ist_zustand_de.md` 5.1 |

**Zusaetzlich einzublenden (Fairness gegenueber der Studie):** Die GES-Studie
legt ihre Annahmen ungewoehnlich offen (Basisjahr, Interkonnektor-Deckelung,
keine Batterien, keine H₂-Importe als Standardloesung, WACC). **Diese
Transparenz ist der Grund, warum dieser Check ueberhaupt moeglich ist** — und
gehoert an prominenter Stelle in die Story, nicht in eine Fussnote.

---

# Teil 4 · Freigabe-Uebersicht

| ID | Claim | Ergebnis | In die Story? |
|---|---|---|---|
| K1 | Vogtle 12.388 €/kW | korrigiert → 13.500 | ja, korrigiert |
| K2 | Mittelwert 5 Projekte 10.275 | **verworfen** | nein |
| K3 | West-Ø 14.667 | korrigiert → Cluster/Presets | nein als Punktwert |
| K4 | Korea 2.116 (Substack) | korrigiert → 1.870–2.720 | ja, korrigiert |
| K5 | Barakah 5.257 | korrigiert → 3.150–4.950 | ja, korrigiert |
| K6 | Opex = 7 % CAPEX auf korrigierte CAPEX | **verworfen** (Artefakt) | nein; als Methodenhinweis ja |
| K7 | Wind „keine Verzerrung" | korrigiert (VLh-Hebel fehlt) | ja, ergaenzt |
| C1 | Grubler 2010 | bestaetigt, Erzaehlung gedreht | ja |
| C2 | US-Zeitreihe / Achse d. Guten / Grokipedia | korrigiert, Quellen ersetzt | ja, mit Lovering |
| C3 | Lovering-Kontroverse | bestaetigt | **Pflicht** |
| C4 | Isar 2 3.730 €/kW | unverifizierbar (C) | optional, mit C-Badge |
| C5 | U-foermiger Verlauf | teilweise korrigiert | ja, umformuliert |
| C6 | Rueckrechnung 6a.1 | arithmetisch bestaetigt | ja, mit Vorbehalt |
| C7 | Modellbasis 32 % unter Realitaet 2022 | neuer Befund | ja |
| C8 | MD-Neuberechnung 6a.2/6a.5 | arithmetisch ok, nicht uebernehmbar | nein; ersetzt durch MC |
| C9 | „kehrt sich um" | **verworfen** | nein |
| C10 | Elektrolyseur 800–1.200 €/kW | **verworfen**, Richtung dreht | ja, als Korrektur |
| C11 | WACC 8 % Kernkraft | bestaetigt (Richtung) | ja, als Regler |
| C12 | Audit-Zaehler 4:1:5 | korrigiert | ja, als Effektgroessen |
| C13 | ETS-Luecke Gas+CCS | korrigiert (ETS 1 statt 2, klein) | ja, quantifiziert |
| C14 | Startwerte 2026 | korrigiert | ja |
| C15 | Lernkurven | **Setzung (M)** | ja, als Annahme |
| C16 | 1.412 Mrd. € | bestaetigt, unvollstaendig | ja, + 208 Mrd. Ersatz |
| C17 | LSCOE 2056 121,7 | korrigiert → ~163 | ja, korrigiert |
| C18 | Kernkraft-Vergleichspfad | Richtung ok, Groesse korrigiert | ja, korrigiert |

**Was als Setzung markiert bleiben muss (M):** Lernkurven PV/Batterie/
Elektrolyseur (C15) · Netzanteil 760 Mrd. € bis 2056 (C16) · Phasenkapazitaeten
2035/2045/2056 (kein Optimierungsergebnis, sondern gesetzt) · Strombedarf
1.050 TWh 2056 (ausserhalb aller offiziellen Szenariohorizonte; NEP reicht bis
2045 mit 948–1.275 TWh) · Elektrolyseur-Volllaststunden · Kernkraft-Volllaststunden
7.500 h.

---

# Teil 5 · Maschinenlesbarer Freigabe-Datensatz (`story_data`)

Der folgende Block ist der einzige ```` ```json ````-Block dieser Datei und wird
von `build_page_data.py`-artigen Skripten mit derselben Fence-Konvention gelesen
wie die uebrigen Dossiers (`JSON_FENCE = ```json ... ```). Er traegt
`meta.block = "story_data"`. Er enthaelt **ausschliesslich freigegebene Werte** —
alles, was in `rejected_do_not_use` steht, darf nicht erzaehlt werden.

```json
{
  "meta": {
    "block": "story_data",
    "document": "story_claims_check.md",
    "created": "2026-08-19",
    "checks_source": "docs/03_grundlage_erweitert_v2.md (Kap. 5.4a, 6a, 6a.4, 6b, 8a)",
    "validated_against": [
      "research/kosten_kernkraft.md",
      "research/kosten_ee_speicher.md",
      "research/ist_zustand_de.md",
      "research/risiken_co2.md",
      "research/review_v09.md",
      "data/model_params.json",
      "data/monte_carlo_reference.json",
      "scripts/model.py"
    ],
    "confidence_scale": {
      "A": "mehrfach unabhaengig belegt / institutionelle Primaerquelle",
      "B": "einfach belegt, plausibel, nicht gegengeprueft",
      "C": "kursiert, Primaerquelle nicht pruefbar",
      "M": "SETZUNG / Modellannahme - nicht quellenbelegt, als Annahme erzaehlen"
    },
    "verification_limit": "WebFetch war fuer praktisch alle Primaerquellen-Domains durch den Netzwerk-Egress blockiert, einschliesslich der GES-Studien-PDF. Verifikation ueber Suchindex-Auszuege mit woertlichen Quellenzitaten.",
    "counts": {"bestaetigt": 7, "korrigiert": 11, "verworfen": 4, "setzung": 6, "unverifizierbar": 3},
    "fx_and_deflators": {
      "eur_per_usd": 0.86543,
      "eur_per_gbp": 1.15567,
      "fx_basis": "EZB-Referenzkurse 2026-03-09 (wie kosten_kernkraft.md 0.2)",
      "usd2010_to_eur2026": 1.32,
      "usd2010_to_eur2026_note": "US-CPI 2010->2026 ca. x1.52, dann x0.86543. Eigene Umrechnung, Konfidenz B.",
      "ff1998_to_eur2026": 0.2523,
      "ff1998_to_eur2026_note": "1 FF1998 = 0.152449 EUR1998, dt. VPI 1998->2026 ca. x1.655. Eigene Umrechnung, Konfidenz B.",
      "dm1988_to_eur2026": 1.0742,
      "dm1988_to_eur2026_note": "1 DM = 0.511292 EUR nominal, dt. VPI 1988->2026 ca. x2.10. Eigene Umrechnung, Konfidenz C."
    }
  },

  "rejected_do_not_use": [
    {"id": "mean_of_5_nuclear", "value": 10275, "unit": "EUR/kW",
     "reason": "Ungewichtetes Mittel ueber fuenf Projekte mit unterschiedlichen Kostenabgrenzungen, Preisbasen, Baujahren und Blockzahlen. Ohne oekonomische Bedeutung.",
     "replace_with": "nuclear.clusters"},
    {"id": "electrolyser_800_1200", "value": [800, 1200], "unit": "EUR/kW",
     "reason": "Stack-/Hardwarekosten, keine Systemkosten. FfE 2025 nennt fuer das Gesamtsystem rund 3120 EUR/kW. dena-Quelle weist gar keine Kosten aus.",
     "replace_with": "electrolyser"},
    {"id": "study_result_reverses", "claim": "Das GES-Ergebnis kehrt sich faktisch um",
     "reason": "Unsicherheitsbaender ueberlappen (Kostenminimum p5-p95 133-190 vs. 80%EE+Gas 132-152); Effekt beruht teilweise auf dem Opex-Artefakt; gegenueber beiden H2-Pfaden bleibt das Kernkraft-Szenario guenstiger.",
     "replace_with": "monte_carlo_headline"},
    {"id": "opex_pct_on_slider_capex", "claim": "Opex = 7 % des (korrigierten) CAPEX",
     "reason": "Betriebskosten skalieren nicht mit den Baukosten. Bei 14667 EUR/kW ergaebe das 128 EUR/MWh reine Betriebskosten.",
     "replace_with": "nuclear.opex_eur_kw_a"},
    {"id": "sources_not_citable", "items": ["Achse des Guten", "Grokipedia", "Schlanj/Substack"],
     "reason": "Meinungsblog, KI-generiertes Wiki, Blog ohne Peer Review. Fuer ein Papier mit wissenschaftlichem Anspruch nicht zitierfaehig.",
     "replace_with": ["grubler-2010", "lovering-2016", "pulaski-2021", "sciencedirect-intl-costs"]}
  ],

  "nuclear": {
    "clusters": [
      {"id": "asien_golf", "label": "Asien / Golf (Serienbau)", "capex_eur_kw": [1870, 4950], "confidence": "B",
       "anchors": ["APR1400 Inland 1867", "Shin Hanul 3&4 2720", "Barakah EPC 3153", "Barakah gesamt 4945"],
       "caveat": "Voraussetzungen (ununterbrochene Lieferkette, ein Regulator, staatlich gesteuerte Finanzierung, niedrige Bau- und Ingenieursloehne, eingeschraenkte Drittanfechtung) in Deutschland rechtlich nicht herstellbar. Auch hier Verzoegerungen: Shin Kori 3/4 3 bzw. 5 Jahre, +30 Prozent Kosten. Export-Aufschlag Faktor 2,7."},
      {"id": "eu_serie", "label": "EU-Serie / Vertragspreise", "capex_eur_kw": [7265, 13472], "confidence": "A",
       "anchors": ["EPR2 OCC 2020er Preise 7265-7583", "Dukovany II EPC 7906", "EPR2 inkl. Finanzierung ca. 10400", "Lubiatowo-Kopalino 11968", "Sizewell C 13472"]},
      {"id": "west_foak", "label": "Westliches Erstprojekt (FOAK)", "capex_eur_kw": [13500, 17264], "confidence": "A",
       "anchors": ["Vogtle 3&4 13500", "Flamanville 3 14364", "Hinkley Point C 17264 nominal / 12408 real GBP2015"]}
    ],
    "model_presets_eur_kw": {"eu_serie": 7500, "eu_mittel": 12000, "erstprojekt": 17500, "ges_annahme": 6000},
    "opex_eur_kw_a": {"min": 130, "mid": 165, "max": 200, "confidence": "B",
      "note": "ABSOLUT modellieren, nicht als CAPEX-Prozentsatz."},
    "fuel_eur_mwh": {"min": 6, "mid": 8, "max": 11, "confidence": "A"},
    "waste_eur_mwh": {"min": 5, "mid": 8, "max": 14, "confidence": "B"},
    "full_load_hours": {"min": 6500, "mid": 7500, "max": 8000, "confidence": "M"},
    "lifetime_years": 60,
    "wacc_slider": {"min": 0.03, "mid": 0.05, "max": 0.09, "confidence": "A"},
    "construction_years": {"min": 8, "mid": 12, "max": 17, "confidence": "A"},
    "lead_time_before_concrete_years": {"min": 5, "mid": 8, "max": 12, "confidence": "M"},
    "idc_surcharge_pct": {"min": 0.20, "mid": 0.33, "max": 0.55, "confidence": "B",
      "empirical_anchor": "EPR2 72,8 Mrd. EUR ohne -> ca. 100 Mrd. EUR mit Finanzierung = +37 Prozent"},
    "lcoe_recomputed_eur_mwh": {
      "method": "CRF(r,60), Opex 165 EUR/kW/a absolut, 7500 h, Brennstoff 8, Entsorgung 8",
      "wacc_5": {"6000": 80.3, "7500": 90.8, "10275": 110.4, "12000": 122.5, "14667": 141.3, "16000": 150.7, "17500": 161.3},
      "wacc_8": {"6000": 102.6, "7500": 118.8, "10275": 148.7, "12000": 167.3, "14667": 196.0, "16000": 210.4, "17500": 226.5},
      "confidence": "B"
    },
    "md_values_for_contrast_only": {
      "note": "Nur zum Zeigen des Opex-Artefakts, NICHT als Ergebnis erzaehlen.",
      "wacc_5": {"6000": 101.6, "10275": 166.9, "14667": 234.0},
      "wacc_8": {"6000": 122.9, "10275": 203.4, "14667": 286.0}
    },
    "independent_benchmarks_eur_mwh": [
      {"source": "Fraunhofer ISE, Stromgestehungskosten, Juli 2024", "range": [136, 490], "confidence": "A"},
      {"source": "Lazard LCOE+ v18, Juni 2025 (unsubventioniert, USA)", "range": [122, 190], "confidence": "A"},
      {"source": "Hinkley Point C CfD, indexiert 17.01.2026", "value": 147, "confidence": "A",
       "note": "Einziger real vertraglich fixierter Neubau-Strompreis."},
      {"source": "IEA/NEA 2020 bei 7 Prozent Diskontsatz", "range": [36, 88], "confidence": "A",
       "note": "Ueberwiegend nicht-westliche Laender, Vorab-Schaetzung."}
    ]
  },

  "nuclear_history_timeseries": {
    "note": "Fuer ein Zeitverlaufs-Chart. Alle Werte in EUR 2026 je kW, eigene Deflationierung (siehe meta.fx_and_deflators). ACHTUNG: Die Kostenabgrenzungen sind NICHT einheitlich (Overnight vs. Gesamtprojekt vs. inkl. Finanzierung) - im Chart als Bandbreite zeigen, nicht als Trendlinie, und die Abgrenzung je Punkt einblenden.",
    "must_show_disclaimer": "Der einzige globale Datensatz historischer Baukosten (Lovering et al. 2016) ist fachlich umstritten: Gilbert et al. und Koomey et al. kritisieren in derselben Zeitschrift, dass Overnight-Kosten Bauzinsen und Eigentuemerkosten ausklammern und fruehe Demonstrationsreaktoren den Startpunkt senken.",
    "points": [
      {"id": "us_1960s", "label": "USA, Baubeginne Ende 1960er", "period_start": 1965, "period_end": 1970,
       "capex_eur_kw_range": [900, 1320], "original": "<= 1000 USD2010/kW", "scope": "overnight",
       "source_id": "lovering-2016", "confidence": "A"},
      {"id": "us_1970", "label": "USA, Baubeginn ca. 1970", "period_start": 1970, "period_end": 1970,
       "capex_eur_kw": 2640, "original": "ca. 2000 USD2010/kW", "scope": "overnight",
       "source_id": "lovering-2016", "confidence": "A"},
      {"id": "us_1968_1978_cohort", "label": "USA, Kohorte Baubeginn 1968-1978 (51 Bloecke)", "period_start": 1968, "period_end": 1978,
       "capex_eur_kw_range": [2370, 14500], "capex_eur_kw_midband": [3960, 7910],
       "original": "1800-11000 USD2010/kW, Mittelband 3000-6000", "scope": "overnight",
       "source_id": "lovering-2016", "confidence": "A",
       "note": "Bloecke, die bei Three Mile Island 1979 im Bau waren und danach fertig wurden: Median-OCC 2,8-fach hoeher, Bauzeit 2,2-fach laenger. Die Eskalation begann aber bereits VOR dem Unfall (+50 bis +200 Prozent zwischen 1970 und 1978)."},
      {"id": "fr_cp0_cp1", "label": "Frankreich, CP0/CP1 (Baujahre 1974-1977)", "period_start": 1974, "period_end": 1977,
       "capex_eur_kw_range": [1060, 1110], "original": "4200-4400 FF1998/kW", "scope": "overnight",
       "source_id": "grubler-2010", "confidence": "A"},
      {"id": "fr_fleet_excl_n4", "label": "Frankreich, Flotte ohne N4 (Verlauf)", "period_start": 1974, "period_end": 1990,
       "capex_eur_kw_range": [1010, 2520], "original": "ca. 4000 -> 10000 FF1998/kW, Faktor 2,5", "scope": "overnight",
       "source_id": "grubler-2010", "confidence": "A"},
      {"id": "fr_n4", "label": "Frankreich, N4 (Mitte 1990er)", "period_start": 1993, "period_end": 1997,
       "capex_eur_kw": 3660, "original": "14500 FF1998/kW", "scope": "overnight",
       "source_id": "grubler-2010", "confidence": "A",
       "note": "Grublers Gesamtbefund: Faktor ca. 3,5 reale Kostensteigerung 1970-2000 - 'negative learning by doing'."},
      {"id": "de_isar2", "label": "Deutschland, Isar 2 (1988, Konvoi)", "period_start": 1982, "period_end": 1988,
       "capex_eur_kw_range": [3600, 3750], "original": "angegeben: 4,75 Mrd. DM / 1400 MW", "scope": "unbekannt",
       "source_id": "md-isar2-unverified", "confidence": "C",
       "note": "Eingangszahl NICHT belegbar; Kostenabgrenzung unbekannt. Nur mit sichtbarem C-Badge verwenden oder weglassen."},
      {"id": "ges_assumption_2045", "label": "GES-Studie, Annahme fuer 2045", "period_start": 2045, "period_end": 2045,
       "capex_eur_kw": 6000, "scope": "unklar", "source_id": "ges-study", "confidence": "A",
       "note": "Zum Vergleich: EDF setzt fuer das serielle EPR2-Programm 7265-7583 EUR/kW Overnight an. Die GES-Annahme ist also keine willkuerliche Zahl, ignoriert aber die Finanzierungskosten."},
      {"id": "epr2", "label": "Frankreich, EPR2-Programm (6 Bloecke, Planung)", "period_start": 2027, "period_end": 2038,
       "capex_eur_kw_range": [7265, 10417], "scope": "overnight bis inkl. Finanzierung",
       "source_id": "edf-epr2-2025", "confidence": "A"},
      {"id": "dukovany2", "label": "Tschechien, Dukovany II (EPC-Vertrag)", "period_start": 2029, "period_end": 2036,
       "capex_eur_kw": 7906, "scope": "epc_only", "source_id": "enerdata-dukovany", "confidence": "A",
       "note": "Nur EPC. Gesamtprojekt realistisch 9000-11000 EUR/kW."},
      {"id": "lubiatowo", "label": "Polen, Lubiatowo-Kopalino (Planzahl)", "period_start": 2028, "period_end": 2039,
       "capex_eur_kw": 11968, "scope": "total_project", "source_id": "ec-ip-25-2963", "confidence": "A"},
      {"id": "sizewell_c", "label": "UK, Sizewell C (FID 2025)", "period_start": 2025, "period_end": 2035,
       "capex_eur_kw": 13472, "scope": "total_project", "source_id": "nucnet-sizewell-fid", "confidence": "A"},
      {"id": "vogtle", "label": "USA, Vogtle 3&4 (fertig 2023/24)", "period_start": 2013, "period_end": 2024,
       "capex_eur_kw": 13500, "capex_eur_kw_range": [12980, 14260], "scope": "total_project",
       "source_id": "eia-vogtle4", "confidence": "A",
       "corrects": "MD-Wert 12388 (nicht ausgewiesener Kurs ca. 1,21 USD/EUR)"},
      {"id": "flamanville3", "label": "Frankreich, Flamanville 3 (fertig 2024/25)", "period_start": 2007, "period_end": 2025,
       "capex_eur_kw": 14364, "scope": "total_incl_financing", "source_id": "cour-des-comptes-2025", "confidence": "A"},
      {"id": "hinkley_c", "label": "UK, Hinkley Point C (im Bau)", "period_start": 2016, "period_end": 2030,
       "capex_eur_kw": 17264, "capex_eur_kw_real_2015": 12408, "scope": "total_project, laufende Preise",
       "source_id": "iwr-hinkley-2026", "confidence": "A",
       "note": "Beide Preisbasen zeigen, sonst wird HPC im Vergleich systematisch zu teuer dargestellt."}
    ],
    "narrative": "Kernkraft-Baukosten folgen keiner Lernkurve nach unten. Sie waren in den 1960er Jahren niedrig, stiegen in den USA schon vor Three Mile Island um ein Vielfaches, stiegen selbst im standardisierten franzoesischen Serienprogramm real um den Faktor 3,5 - und liegen bei westlichen Erstprojekten seit den 2000er Jahren noch einmal deutlich hoeher. Der Befund lautet nicht 'frueher war Kernkraft billig', sondern: Baukosten haengen an Institutionen, und sie sind historisch nach oben gelaufen."
  },

  "reverse_engineered_ges_capacities": {
    "status": "arithmetisch bestaetigt; Eingangsgroessen (Zubaufaktoren) nicht am Original pruefbar",
    "confidence": "B",
    "method": "Basis_i = k * b_i mit b = (66.5, 58.1, 8.1) GW und Faktoren f = (5.3, 3.6, 10.0); Bedingung Summe(k*b_i*f_i) = 438",
    "denominator_sum_b_f": 642.61,
    "k": 0.68160,
    "model_baseline_2022_gw": {"pv": 45.33, "wind_onshore": 39.60, "wind_offshore": 5.52, "sum": 90.45},
    "cross_check": "Die unabhaengig aus der 438-GW-Bedingung abgeleitete Basis (90.45 GW) trifft die im Kostenminimum-Szenario ausgewiesene fEE-Leistung (90 GW) auf 0,5 Prozent genau - ein sauberer Kreuztest.",
    "capacities_by_scenario_gw": {
      "ee80_gas": {"pv": 240.2, "wind_onshore": 142.6, "wind_offshore": 55.2, "sum": 438.0, "verified": true},
      "ee80_h2": {"pv": 240.2, "wind_onshore": 142.6, "wind_offshore": 55.2, "sum": 438.0, "verified": true},
      "ee100": {"pv": 519.3, "wind_onshore": 213.5, "wind_offshore": 53.2, "sum": 786.0, "verified": "nur die Summe; die impliziten Faktoren 11.46/5.39/9.64 sind im MD nicht genannt"},
      "kostenminimum": {"pv": 45.3, "wind_onshore": 39.6, "wind_offshore": 5.5, "baseload_nuclear": 125}
    },
    "rejected_claim": "Die MD-Aussage, die Kontrollrechnung gegen das 100-Prozent-Szenario weiche nur um 4 Prozent ab, ist nicht nachvollziehbar dokumentiert und darf nicht als Validierungssignal erzaehlt werden.",
    "new_finding": {
      "id": "baseline_below_reality",
      "real_2022_fee_gw": 132.7,
      "model_baseline_gw": 90.45,
      "ratio": 0.68,
      "real_mid_2026_fee_gw": 208.4,
      "components_mid_2026_gw": {"pv": 126.6, "wind_onshore": 71.0, "wind_offshore": 10.8},
      "confidence": "A (Ist-Kapazitaeten) / B (Schlussfolgerung)",
      "statement": "Die zurueckgerechnete Modell-Basis liegt 32 Prozent unter der realen deutschen fEE-Leistung Ende 2022. Nimmt man die 90 GW des Kostenminimum-Szenarios woertlich als installierte Leistung, liegt dieses Szenario rund 118 GW unter dem Bestand von Mitte 2026. Worauf sich die Groesse genau bezieht, laesst sich ohne den Studienanhang nicht klaeren - als offene Frage kennzeichnen, nicht als Fehler behaupten."
    }
  },

  "monte_carlo_headline": {
    "source": "data/monte_carlo_reference.json, Modell scripts/model.py, 1000 Ziehungen, Dreiecksverteilungen aus data/model_params.json",
    "co2_price_eur_t": 75,
    "caveat": "Profile PARTIAL (H2-2024, 4416 h, hochgerechnet); Erdgas-Brennstoffkosten fehlen in den Dossiers und sind mit 0 angesetzt - alle Werte sind UNTERGRENZEN; Import/Export und Lastmanagement nicht modelliert.",
    "confidence": "B",
    "presets": [
      {"id": "ist2025", "label": "Ist 2025 (Referenz)", "deterministic": 107.1, "p50_base": 108, "p5_p95_base": [101, 115], "p50_wacc": 113, "p5_p95_wacc": [95, 140]},
      {"id": "kostenminimum", "label": "GES - Kostenminimum", "deterministic": 155.8, "p50_base": 161, "p5_p95_base": [133, 190], "p50_wacc": 175, "p5_p95_wacc": [127, 256], "gas_peak_gw": 53.9},
      {"id": "ee80_gas", "label": "GES - 80 % EE + Gas", "deterministic": 140.7, "p50_base": 142, "p5_p95_base": [132, 152], "p50_wacc": 148, "p5_p95_wacc": [123, 185]},
      {"id": "ee80_h2", "label": "GES - 80 % EE + H2", "deterministic": 197.2, "p50_base": 197, "p5_p95_base": [186, 208], "p50_wacc": 205, "p5_p95_wacc": [177, 246]},
      {"id": "ee100", "label": "GES - 100 % Erneuerbare", "deterministic": 270.9, "p50_base": 270, "p5_p95_base": [253, 288], "p50_wacc": 286, "p5_p95_wacc": [239, 352]}
    ],
    "honest_statement": "Mit unseren Kostenannahmen rutscht das Kernkraft-Szenario vom ersten auf den zweiten Platz - hinter den gasgestuetzten 80-Prozent-Erneuerbaren-Pfad. Von einer Umkehr des Studienergebnisses zu sprechen waere zu viel: Die Unsicherheitsbaender ueberlappen, und gegenueber beiden wasserstofflastigen Pfaden bleibt das Kernkraft-Szenario guenstiger."
  },

  "electrolyser": {
    "status": "MD-Claim verworfen, Richtung dreht sich um",
    "study_assumption_eur_kw": 1760,
    "md_claim_eur_kw": [800, 1200],
    "md_claim_verdict": "verworfen - Stack-/Hardwarekosten statt Systemkosten; dena-Quelle weist gar keine Kosten aus",
    "eu_actual_2025_eur_kw": {"alkali": 2075, "pem": 2196, "source_id": "global-hydrogen-hub-2025", "confidence": "B"},
    "ffe_full_system_2025_eur_kw": 3120,
    "ffe_note": "FfE Discussion Paper 07/2025: realistische Systemkosten rund 3120 EUR/kW - etwa das Zweieinhalbfache des ueblicherweise Angenommenen. Viele Studien betrachten nur die Hardware (Stack, Gleichrichter, Kompressoren) und blenden Planung, Genehmigung und Installation aus. Reale Projektentwickler-Angaben 2024: 9-13 EUR/kg statt der prognostizierten 2,50-4,50 EUR/kg bis 2030.",
    "model_range_eur_kw": {"min": 1200, "mid": 2100, "max": 2600, "confidence": "B"},
    "recommended_upper_reference_eur_kw": 3120,
    "confidence": "B",
    "statement": "Bei den Elektrolyseuren dreht sich der Vorwurf um: Wer 800 bis 1200 Euro je Kilowatt ansetzt, rechnet nur die Hardware. Mit Planung, Genehmigung und Installation kommt das Muenchner FfE fuer 2025 auf rund 3120 Euro je Kilowatt. Die GES-Studie rechnet hier also eher zu guenstig als zu teuer."
  },

  "ets_gap_gas_ccs": {
    "status": "Richtung bestaetigt, Preisquelle korrigiert, Groesse klein",
    "md_claim": "ETS-Preis laut EWI > 200 EUR/t bis 2035",
    "correction": "Die EWI-Werte (ca. 120 EUR/t 2027, ca. 205 EUR/t 2035) stammen aus dem ETS 2 (Gebaeude, Verkehr, kleine Industrie). Der ETS 2 betrifft die Stromerzeugung NICHT - dafuer gilt ETS 1. Zusaetzlich startet ETS 2 nicht 2027, sondern 2028 (Rat 05.11.2025, EP 13.11.2025).",
    "ets1_prices_eur_t": {"mai_2026": 74, "allzeithoch_feb_2023": 100.34, "konsens_2030": 126, "analystenspanne_2030": [80, 147], "2040": null},
    "ets1_2040_note": "Keine belastbare Projektion - EU-Ziel fuer 2040 regulatorisch nicht abschliessend festgelegt. Alle 2040-Werte sind Szenario, nicht Prognose.",
    "gas_ccs_residual_g_co2_kwh": {"min": 49, "default": 120, "max": 220, "confidence": "B"},
    "cost_impact_eur_mwh_gas": {
      "at_75": {"min": 3.7, "default": 9.0, "max": 16.5},
      "at_126": {"min": 6.2, "default": 15.1, "max": 27.7},
      "at_205": {"min": 10.0, "default": 24.6, "max": 45.1}
    },
    "system_impact_eur_mwh_at_10pct_gas_share": [0.4, 4.5],
    "additional_finding": "Die Luecke trifft nicht nur die 80-Prozent-Szenarien: In unserem Dispatch braucht auch das GES-Kostenminimum-Szenario 53,9 GW Gas-Spitzenleistung.",
    "confidence": "A (ETS1/ETS2-Abgrenzung) / B (Projektion 2030, Restemissionen)",
    "statement": "Dass auf die Restemissionen von Gas mit CCS kein CO2-Preis gelegt wird, ist eine echte Luecke - aber eine kleine: Sie bewegt die Systemkosten um weniger als fuenf Euro je Megawattstunde. Und der oft zitierte Preis von ueber 200 Euro je Tonne stammt aus dem ETS 2, der fuer Strom gar nicht gilt."
  },

  "thirty_year_plan": {
    "start_2026_corrected": {
      "pv_gw": {"md": 110, "corrected": 126.6, "as_of": "2026-07", "eoy2025": 117.0, "confidence": "A"},
      "wind_onshore_gw": {"md": 65, "corrected": 71.0, "as_of": "2026-07", "eoy2025": 68.1, "confidence": "A"},
      "wind_offshore_gw": {"md": 10, "corrected": 10.8, "as_of": "2026 Jahresmitte", "eoy2025": 9.6, "confidence": "A"},
      "battery": {"md_gw": 5, "md_gwh": 15, "corrected_gw": [18.5, 20.0], "corrected_gwh": [31.0, 31.5],
        "scope": "alle Groessenklassen inkl. Heimspeicher (MaStR, H1 2026)",
        "warning": "Ein kursierender Grossspeicher-Wert von 1,2 GW / 2,4 GWh (Q2 2026) ist laut ist_zustand_de.md 2.2 implausibel niedrig und nicht ohne Pruefung verwendbar. Abgrenzung IMMER mitnennen.",
        "confidence": "A"},
      "gas_gw": {"md": 30, "corrected": [35, 36], "confidence": "B"},
      "nuclear_gw": {"md": 0, "corrected": 0, "confidence": "A"},
      "demand_twh": {"md": 560, "corrected_2024": 518, "corrected_2025_range": [512, 526],
        "note": "Bruttostromverbrauch. Der MD-Startwert liegt 7-9 Prozent zu hoch.", "confidence": "A"}
    },
    "learning_curves": {
      "status": "SETZUNG (M) mit teilweise belegbarer Richtung",
      "pv_eur_kw": {"values": [650, 500, 420], "verdict": "M",
        "supporting_evidence": [
          {"claim": "Fraunhofer ISE Juli 2024: PV-Freiflaeche 4,1-6,9 ct/kWh heute -> 3,1-5,0 ct/kWh 2045 (minus 24 bis 28 Prozent), auf Basis technologiespezifischer Lernraten", "confidence": "A"},
          {"claim": "ITRPV: historische Lernrate der PV-Industrie 26 Prozent je Verdopplung der kumulierten Produktion (1976-2025); zuvor 24,9 Prozent", "confidence": "B"},
          {"claim": "IRENA: global rund 500 USD/kW fuer PV im Jahr 2030 erwartet - mit ausdruecklichem Vorbehalt, dass in Europa und Nordamerika strukturell hoehere Kosten fortbestehen", "confidence": "B"}
        ],
        "caveat": "Die Degression von minus 35 Prozent ueber 30 Jahre ist etwas ambitionierter als die ISE-Projektion. Zusaetzlich liegt der Startwert 650 EUR/kW bereits am optimistischen Ende unserer Modellspanne (600-1000, Default 750)."},
      "battery_eur_kwh": {"values": [200, 150, 120], "verdict": "M",
        "supporting_evidence": [
          {"claim": "BNEF Dez. 2025: Pack-Preise auf Rekordtief 108 USD/kWh (minus 8 Prozent), stationaere Packs 70 USD/kWh; berechnete Lernrate rund 18 Prozent je Verdopplung", "confidence": "A"},
          {"claim": "IRENA 2024: Batteriespeichersysteme minus 93 Prozent seit 2010, 2024 bei 192 USD/kWh", "confidence": "B"}
        ],
        "counter_evidence": [
          {"claim": "Lazard LCOE+ v19 (Juli 2026): Speichersystemkosten seit 2020 um 27 Prozent GESTIEGEN; LCOS 100 MW / 4 h bei 210-292 USD/MWh. Ursachen: Zinsen, Zoelle, Lieferkettendruck, Rechenzentrumsnachfrage.", "confidence": "A"},
          {"claim": "Zelle/Pack ist nicht System: Faktor 2,5 bis 3 zwischen Pack-Preis und betriebsbereitem Netzspeicher in Europa. Schluesselfertige 4-h-Systeme in Europa 180-260 EUR/kWh.", "confidence": "B"}
        ],
        "verdict_detail": "Startwert 200 EUR/kWh liegt korrekt in unserer Modellspanne. Endwert 120 EUR/kWh liegt unterhalb der heutigen Systemkosten-Untergrenze und ist reine Setzung. kosten_ee_speicher.md 6 warnt explizit vor automatischer Lernkurven-Extrapolation nach unten."},
      "wind_onshore_eur_kw": {"values": [1750, 1750, 1750], "verdict": "M/B",
        "note": "Plausible Setzung (ausgereifte Technologie), deckt sich mit unserem Modellwert 1790 EUR/kW."},
      "wind_offshore_eur_kw": {"values": [3700, 3500, 3400], "verdict": "M",
        "note": "Modellspanne 2600-4500, Default 3400. Die MD-Werte liegen darin."},
      "electrolyser_eur_kw": {"values": [900, 650, 480], "verdict": "verworfen",
        "reason": "Startwert liegt um Faktor 2,3 unter den europaeischen Ist-Systemkosten (ca. 2100 EUR/kW) und um Faktor 3,5 unter der FfE-Vollkostenrechnung (3120 EUR/kW).",
        "replacement_proposal": {"start_2026": 2100, "end_2056": [1200, 1400], "verdict": "M"}},
      "gas_eur_kw": {"values": [2200, 2200, 2200], "verdict": "B",
        "note": "Konsistent mit unserem Befund, dass der alte Referenzwert 800 EUR/kW fuer 2026 um Faktor 2-2,5 zu niedrig ist. Modellspanne 1000/1600/2200."}
    },
    "investment_check": {
      "md_total_bn_eur": 1412,
      "reproduced": true,
      "breakdown_bn_eur": {"generation_storage_electrolysis": 652, "grid": 760},
      "phase_generation_bn_eur": {"2026-2035": 234.8, "2036-2045": 226.8, "2046-2056": 190.3},
      "phase_implied_grid_bn_eur": {"2026-2035": 180.2, "2036-2045": 300.2, "2046-2056": 279.7},
      "missing_replacement_capex_bn_eur": {
        "pv_stock_110gw_at_420": 46, "wind_onshore_65gw_at_1750": 114,
        "wind_offshore_10gw_at_3400": 34, "battery_phase1_120gwh_at_120": 14, "sum": 208,
        "confidence": "B",
        "note": "Der Plan rechnet ausschliesslich Netto-Zubauten. Phase 3 heisst 'Konsolidierung & Repowering', enthaelt aber keinen Euro dafuer. Realistische Gesamtinvestition eher 1550-1650 Mrd. EUR."
      },
      "grid_share_verdict": "M - 760 Mrd. EUR bis 2056 ist eine Extrapolation. Belegte Referenzen: IMK 651 Mrd. EUR bis 2045 (Uebertragung 328 + Verteilung 323, Konfidenz A) und NEP 2037/2045 V2025 365-392 Mrd. EUR bis 2045 (nur Uebertragung, Konfidenz B)."
    },
    "lscoe_2056": {
      "md_value": 121.7,
      "md_reconstruction": {
        "total_cost_bn_eur_a": 127.6,
        "generation_twh": 876,
        "demand_twh": 1050,
        "divided_by_demand": 121.5,
        "divided_by_generation": 145.7,
        "flaw": "Das MD teilt die Gesamtkosten durch den Bedarf (1050 TWh), obwohl nur 876 TWh erzeugt werden. Die Deckungsluecke von 174 TWh (17 Prozent) wird damit implizit zum Nulltarif gedeckt."
      },
      "our_model": {
        "engine": "scripts/model.py mix_system",
        "inputs": {"pv_gw": 400, "wind_onshore_gw": 150, "wind_offshore_gw": 70,
                   "battery_gw": 110, "battery_gwh": 450, "electrolyser_gw": 55,
                   "h2_turbine_gw": 45, "gas_backup_gw": 45, "demand_twh": 1050, "co2_price_eur_t": 75},
        "guenstig": 106.9, "mittel": 162.8, "teuer": 290.1,
        "mittel_with_md_flh": 148.6,
        "cost_components_eur_mwh_mittel": {"netz": 38.6, "wind_onshore": 26.7, "wind_offshore": 25.3,
          "pv": 25.2, "electrolyser": 13.0, "gas_backup": 11.3, "battery": 9.7, "h2_turbine": 6.5, "h2_storage": 6.4},
        "deviation_vs_md_eur_mwh": 41.1,
        "confidence": "B",
        "caveats": "Profile PARTIAL (H2-2024, 4416 h, auf ein Jahr hochgerechnet - winterlastig); fuer Offshore wird ersatzweise das Onshore-Profil verwendet; Erdgas-Brennstoffkosten mit 0 angesetzt (harte Datenluecke) - der Wert ist eine UNTERGRENZE; Import/Export und Lastmanagement nicht modelliert."
      },
      "flh_finding": {
        "statement": "Die 174-TWh-Deckungsluecke ist groesstenteils ein Artefakt der GES-Volllaststunden. Mit unseren Neuanlagen-Werten (PV 1030 h, Wind onshore 2400 h, Wind offshore 3800 h) erzeugt derselbe Anlagenpark 1038 statt 876 TWh - die Luecke schrumpft von 17 auf 1 Prozent.",
        "confidence": "A",
        "note": "Ein Befund ZUGUNSTEN des Plans, den das MD selbst verschenkt."
      },
      "recommended_value": {"mid": 163, "range": [107, 290], "unit": "EUR/MWh", "is_lower_bound": true, "confidence": "B"}
    },
    "nuclear_variant": {
      "md": {"reactors": 2, "gw_each": 1.6, "online": [2045, 2052], "capex_eur_kw": 16000, "wacc": 0.08,
             "lcoe_eur_mwh": 311.1, "investment_bn_eur": 51.2, "system_lscoe": 129.3, "delta": 7.6},
      "corrected": {"capex_eur_kw_range": [12000, 17500], "lcoe_eur_mwh_at_16000": {"wacc_5": 150.7, "wacc_8": 210.4},
             "investment_bn_eur": 51.2, "our_model_system_lscoe": 165.1, "our_model_delta": 2.3, "confidence": "B"},
      "robust_finding": "3,2 GW auf ueber 600 GW Gesamtkapazitaet sind ein Rundungsfehler. Zwei Bloecke liefern rund 25 TWh pro Jahr bei 1050 TWh Bedarf (2,4 Prozent) - bei 51 Mrd. EUR Kapitalbindung und ohne jeden Beitrag vor 2045. Das ist ein Skalen-Argument, kein Kosten-Argument.",
      "counterposition": "Ein Programm mit nur zwei Bloecken ist die denkbar unguenstigste Konstruktion - genau die Konstellation ohne Serieneffekte. kosten_kernkraft.md 7.1 weist den Low-Fall (7500 EUR/kW) als 'nur erreichbar bei mindestens 6 Bloecken identischer Bauart und Turnkey-Festpreis' aus. Wer Kernkraft fair prueft, muss sie als Programm rechnen. Einziger dokumentierter Serieneffekt: OPG Darlington, minus 32 Prozent vom ersten Block zum Durchschnitt ueber vier Bloecke.",
      "lead_time": {"statement": "Realistischer Gesamtpfad von der politischen Entscheidung bis zum ersten kommerziellen Block: 18-25 Jahre - inklusive Aufhebung des gesetzlichen Neubauverbots, Behoerdenaufbau und Standortverfahren. Vergleich: Polen 6 Jahre von der Technologieentscheidung bis zum ersten Beton, Tschechien 5 Jahre von der Vergabe.", "confidence": "A"}
    }
  },

  "assumption_audit_corrected": {
    "note": "Effektgroessen statt Abzaehlen. Ein reiner Zaehler waere irrefuehrend, weil die Befunde stark unterschiedlich gross sind.",
    "items": [
      {"id": "pv_capex", "direction": "zulasten_ee", "verdict": "bestaetigt", "magnitude": "gross", "confidence": "A"},
      {"id": "wind_flh", "direction": "zulasten_ee", "verdict": "neu (im MD fehlend)", "magnitude": "gross", "confidence": "A",
       "detail": "1700 h Bestandsflotte statt 2400 h Neuanlagen; LCOE 93 -> 66 EUR/MWh (minus 29 Prozent). BNetzA Mai 2026: 50,6 EUR/MWh mengengewichtet."},
      {"id": "nuclear_capex", "direction": "zugunsten_kernkraft", "verdict": "korrigiert", "magnitude": "gross", "confidence": "A",
       "detail": "Unterschaetzung 25-45 Prozent ggue. seriellem EU-Programm, 100-190 Prozent ggue. westlichem Erstprojekt - nicht pauschal 100-170 Prozent."},
      {"id": "nuclear_wacc", "direction": "zugunsten_kernkraft", "verdict": "bestaetigt", "magnitude": "gross", "confidence": "A"},
      {"id": "electrolyser_capex", "direction": "zugunsten_h2_szenarien", "verdict": "verworfen, Richtung dreht", "magnitude": "mittel", "confidence": "B"},
      {"id": "no_batteries_modelled", "direction": "zulasten_ee", "verdict": "neu (im MD fehlend)", "magnitude": "mittel", "confidence": "A"},
      {"id": "gas_capex_explosion", "direction": "zulasten_gas_pfade", "verdict": "neu (im MD fehlend)", "magnitude": "mittel", "confidence": "B",
       "detail": "Standardwert 800 EUR/kW fuer 2026 um Faktor 2-2,5 zu niedrig. Trifft alle Szenarien mit Gas-Backup, auch das Kostenminimum."},
      {"id": "nuclear_opex_generous", "direction": "zugunsten_ee", "verdict": "neu (im MD fehlend)", "magnitude": "mittel", "confidence": "A",
       "detail": "GES rechnet 7 Prozent CAPEX/a; bottom-up ergeben sich rund 4,2 Prozent. Die Studie rechnet Kernkraft-Betrieb also eher zu teuer - ein Befund zugunsten der Studie."},
      {"id": "seasonal_h2_storage_expensive_end", "direction": "zugunsten_ee", "verdict": "neu (im MD fehlend)", "magnitude": "mittel", "confidence": "A",
       "detail": "Faktor 7,8 zwischen hoher und niedriger Zyklenzahl. Saisonspeicher = niedrige Zyklenzahl = teures Ende. Stuetzt die Kernthese der Studie."},
      {"id": "h2_roundtrip", "direction": "zugunsten_ee", "verdict": "bestaetigt", "magnitude": "gross", "confidence": "B",
       "detail": "Realistisch 30-40 Prozent, nicht 50+. Fuer 1 kWh rueckverstromten Strom braucht es 2,5-3,3 kWh EE-Strom - der eigentliche Treiber der 1162 GW im 100-Prozent-Szenario. Physikalisch korrekt, darf nicht kleingeredet werden."},
      {"id": "ets_gap_gas_ccs", "direction": "zugunsten_gas_pfade", "verdict": "korrigiert", "magnitude": "klein", "confidence": "B"},
      {"id": "grid_investment", "direction": "neutral", "verdict": "bestaetigt", "magnitude": "-", "confidence": "A"},
      {"id": "nuclear_fuel", "direction": "neutral", "verdict": "bestaetigt", "magnitude": "-", "confidence": "A"},
      {"id": "ccs_cost", "direction": "neutral", "verdict": "bestaetigt (Groessenordnung)", "magnitude": "-", "confidence": "C"},
      {"id": "interconnectors", "direction": "zugunsten_ee", "verdict": "bestaetigt", "magnitude": "klein", "confidence": "B",
       "detail": "Unser eigenes Modell rechnet Import/Export gar nicht - das ist konservativer als die Studie und muss gesagt werden."}
    ]
  },

  "must_show_counterpositions": [
    {"id": "cp_transparency", "text": "Die GES-Studie legt ihre Annahmen ungewoehnlich offen - Basisjahr, Interkonnektor-Deckelung, keine Batterien, keine Wasserstoffimporte als Standardloesung, WACC. Genau diese Transparenz macht diesen Check erst moeglich.", "confidence": "A"},
    {"id": "cp_wacc_both_ways", "text": "Bei drei Prozent Diskontsatz ist Kernkraft in allen von IEA und NEA untersuchten Laendern die guenstigste Option, bei zehn Prozent in praktisch keinem. Dieselbe Technologie, dieselben Baukosten - nur eine andere Finanzierungsannahme.", "confidence": "A"},
    {"id": "cp_construction_time", "text": "Der globale Median der Bauzeit liegt bei 6,3 Jahren, 68 Prozent aller Reaktoren weltweit wurden in unter acht Jahren gebaut. Fuer eine Deutschland-Prognose ist der Median allerdings die falsche Kennzahl: Jedes westliche Neubauprojekt der letzten 20 Jahre lag zwischen 10 und 18 Jahren.", "confidence": "A"},
    {"id": "cp_eu_references", "text": "Die europaeischen Neubauprojekte liegen deutlich unter Hinkley Point C: EPR2 7265 bis 7583 Euro je Kilowatt Overnight, Dukovany 7906 als EPC-Vertrag, Polen 11968, Sizewell C 13472. Die GES-Annahme von 6000 Euro ist keine willkuerliche Zahl - sie liegt nur knapp unter dem, was EDF selbst fuer ein serielles Programm ansetzt.", "confidence": "A"},
    {"id": "cp_ges_opex", "text": "Bei den Betriebskosten hat die GES-Studie eher zu hoch als zu niedrig gerechnet. Das relativiert die Aussage, sie unterschaetze Kernkraft.", "confidence": "A"},
    {"id": "cp_h2_physics", "text": "Der Round-Trip-Wirkungsgrad der Wasserstoffkette liegt realistisch bei 30 bis 40 Prozent. Fuer eine Kilowattstunde rueckverstromten Strom braucht es zweieinhalb bis dreieinhalb Kilowattstunden erneuerbaren Strom. Genau daraus entsteht die Ueberkapazitaet im 100-Prozent-Szenario - dieser Mechanismus ist physikalisch korrekt.", "confidence": "B"},
    {"id": "cp_korea_both_ways", "text": "Korea baut guenstig, weil eine Baureihe ohne Designaenderungen, eine ununterbrochene Lieferkette seit den 1970er Jahren, ein Betreiber, ein Regulator und staatlich gesteuerte Finanzierung zusammenkommen. Aber auch dort wurden Shin Kori 3 und 4 drei beziehungsweise fuenf Jahre spaeter fertig, mit rund 30 Prozent Mehrkosten - und derselbe Reaktortyp kostete im Export rund das 2,7-Fache.", "confidence": "B"},
    {"id": "cp_ee_risks", "text": "Auch der erneuerbare Pfad hat Risiken: der China-Anteil in der Photovoltaik-Lieferkette, kritische Rohstoffe fuer Batterien und Windkraft, die Verluste der Wasserstoffkette, saisonale Speicherung am teuren Ende der Spanne und Aufwaertsrisiken beim Netzausbau durch Rohstoffpreise, Transformatorenknappheit und Genehmigungsverzuege.", "confidence": "A"}
  ],

  "sources": [
    {"id": "grubler-2010", "title": "The costs of the French nuclear scale-up: A case of negative learning by doing", "author": "Arnulf Grubler", "publisher": "Energy Policy 38(9), S. 5174-5188", "date": "2010", "url": "https://www.sciencedirect.com/science/article/abs/pii/S0301421510003526", "accessed": "2026-08-19", "confidence": "A", "replaces": ["Achse des Guten"]},
    {"id": "lovering-2016", "title": "Historical construction costs of global nuclear power reactors", "author": "Jessica R. Lovering, Arthur Yip, Ted Nordhaus", "publisher": "Energy Policy 91, S. 371-382", "date": "2016-04", "url": "https://www.sciencedirect.com/science/article/pii/S0301421516300106", "accessed": "2026-08-19", "confidence": "A", "note": "349 Reaktoren in 7 Laendern, 58 Prozent aller weltweit gebauten Bloecke, Overnight Construction Cost in konstanten USD 2010. NUR gemeinsam mit den beiden Erwiderungen zitieren."},
    {"id": "gilbert-2017", "title": "A reply to 'Historical construction costs of global nuclear power reactors'", "author": "Alexander Gilbert, Benjamin K. Sovacool, Phil Johnstone, Andy Stirling", "publisher": "Energy Policy 102, S. 640-643", "date": "2017", "url": "https://law.stanford.edu/publications/a-reply-to-historical-construction-costs-of-global-nuclear-power-reactors/", "accessed": "2026-08-19", "confidence": "A"},
    {"id": "koomey-2017", "title": "Apples and oranges: Comparing nuclear construction costs across nations, time periods, and technologies", "author": "Jonathan Koomey, Nathan E. Hultman, Arnulf Grubler", "publisher": "Energy Policy 102, S. 650-654", "date": "2017", "url": "https://www.sciencedirect.com/science/article/abs/pii/S0301421516306000", "accessed": "2026-08-19", "confidence": "A"},
    {"id": "ffe-elektrolyse-2025", "title": "Von der Theorie zur Praxis: Warum gruener Wasserstoff teurer ist als gedacht (Discussion Paper)", "publisher": "Forschungsstelle fuer Energiewirtschaft (FfE), Muenchen", "date": "2025-07", "url": "https://www.ffe.de/wp-content/uploads/2025/07/Discussion_Paper-Investitionskosten_Elektrolyse-2.pdf", "accessed": "2026-08-19", "confidence": "B", "note": "PDF in dieser Session durch den Netzwerk-Egress blockiert; Inhalte ueber Suchindex-Auszuege mit woertlichen Zitaten verifiziert."},
    {"id": "dena-elektrolysekapazitaeten", "title": "Elektrolysekapazitaeten in Deutschland", "publisher": "Deutsche Energie-Agentur (dena)", "date": "2026-04", "url": "https://www.dena.de/infocenter/elektrolysekapazitaeten-in-deutschland/", "accessed": "2026-08-19", "confidence": "A", "note": "Kapazitaets- und Projektdatenbank - weist KEINE Investitionskosten je kW aus. Die Zuordnung im MD ist eine Fehlzuordnung."},
    {"id": "fraunhofer-ise-2024", "title": "Stromgestehungskosten Erneuerbare Energien", "publisher": "Fraunhofer ISE", "date": "2024-07", "url": "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/studies/DE2024_ISE_Studie_Stromgestehungskosten_Erneuerbare_Energien.pdf", "accessed": "2026-08-19", "confidence": "A"},
    {"id": "itrpv-2026", "title": "International Technology Roadmap for Photovoltaic (ITRPV), 16. Ausgabe - Lernrate 26 Prozent 1976-2025", "publisher": "VDMA / ITRPV", "date": "2026", "url": "https://www.pv-tech.org/itrpv-2026-solar-industry-maintains-historic-learning-curve-despite-market-turbulence/", "accessed": "2026-08-19", "confidence": "B"},
    {"id": "bnef-battery-2025", "title": "Lithium-Ion Battery Pack Prices Fall to 108 USD per Kilowatt-Hour (Battery Price Survey 2025); berechnete Lernrate rund 18 Prozent", "publisher": "BloombergNEF", "date": "2025-12", "url": "https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/", "accessed": "2026-08-19", "confidence": "A"},
    {"id": "irena-rpgc-2024", "title": "Renewable Power Generation Costs in 2024", "publisher": "IRENA", "date": "2025-07", "url": "https://www.irena.org/Publications/2024/Sep/Renewable-Power-Generation-Costs-in-2023", "accessed": "2026-08-19", "confidence": "B", "note": "BESS 192 USD/kWh (2024), minus 93 Prozent seit 2010; PV-Projektion rund 500 USD/kW fuer 2030 mit ausdruecklichem Europa-/Nordamerika-Vorbehalt."},
    {"id": "lazard-lcoe-19", "title": "LCOE+ v19.0", "publisher": "Lazard", "date": "2026-07", "confidence": "A", "note": "Speicherkosten seit 2020 um 27 Prozent gestiegen; LCOS 100 MW / 4 h 210-292 USD/MWh."},
    {"id": "ews-ets2", "title": "Auswirkungen und Preispfade des EU ETS2, Endbericht", "publisher": "EWI, Universitaet zu Koeln", "date": "2025-04", "url": "https://www.ewi.uni-koeln.de/cms/wp-content/uploads/2025/04/EU-ETS2_Endbericht.pdf", "accessed": "2026-08-19", "confidence": "B", "note": "ETS 2, NICHT Stromsektor. Im MD faelschlich als Strom-CO2-Preis verwendet."},
    {"id": "ges-study", "title": "Der klimaneutrale Strommix der Zukunft", "publisher": "Global Energy Solutions e.V.", "date": "2026-07", "url": "https://global-energy-solutions.org/wp-content/uploads/2026/05/DER-KLIMANEUTRALE-STROMMIX-DER-ZUKUNFT-veroeffentlicht-V1.1.pdf", "accessed": "2026-08-19", "confidence": "C", "note": "PDF in dieser Session durch den Netzwerk-Egress blockiert. Alle Aussagen zur Studien-Methodik beruhen auf der MD-Wiedergabe und konnten nicht am Original gegengeprueft werden."},
    {"id": "md-isar2-unverified", "title": "Isar 2 Baukosten (4,75 Mrd. DM / 1400 MW)", "publisher": "im MD als IAEA INIS angegeben", "confidence": "C", "note": "Eingangszahl nicht belegbar, Kostenabgrenzung unbekannt."}
  ],

  "internal_source_ids_reused": [
    "cour-des-comptes-2025", "eia-vogtle4", "mit-climate-nuclear-cost", "iwr-hinkley-2026",
    "edf-epr2-2025", "enerdata-dukovany", "ec-ip-25-2963", "nucnet-sizewell-fid",
    "pulaski-2021", "sciencedirect-intl-costs", "nei-shinhanul34", "iea-nea-2020",
    "ritchie-construction-time", "fraunhofer-ise-2024", "lazard-lcoe-18",
    "global-hydrogen-hub-2025"
  ]
}
```

---

# Teil 6 · Nachtrag v0.2b (Story-Redigat) — zusätzlicher Freigabe-Datensatz

**Angelegt:** 2026-08-19 · **Anlass:** Modellstand **v0.2b** (`research/modell_v02_ergebnis.md`,
Fixes M1–M7 plus Abschnitt 4b: Gas mit CCS, Kontrastverteilung Asien/Golf) und das darauf
aufsetzende Story-Redigat (Redigat-Punkte R1–R23, Panel-Punkte E1–E7 / V1–V4).

**Was dieser Nachtrag tut.** Er **ersetzt** den Block `monte_carlo_headline` aus Teil 5 — dessen
Zahlen (107,1 / 155,8 / 140,7 / 197,2 / 270,9 €/MWh, alle Perzentile, der Gaspreis-Caveat und das
`honest_statement`) stammen aus Modellstand v0.1 und sind seit v0.2 **falsch** (R7, R8). Und er
**ergänzt** die Blöcke, die das Redigat neu braucht und die in Teil 5 noch nicht vorgesehen waren.
Alles Übrige aus Teil 5 bleibt unverändert gültig.

Der Block trägt `meta.block = "story_data_v02b"`. `scripts/build_story_data.py` liest ihn zusätzlich
zum Block aus Teil 5 und legt ihn darüber (Schlüssel gleichen Namens gewinnen, `sources` werden
angehängt). Der Lauf bleibt deterministisch: keine Zeitstempel, keine Modellaufrufe zur Bauzeit.

**Herkunft der neuen Zahlen — kurz und prüfbar:**

| Block | Woher |
|---|---|
| `monte_carlo_headline` | `data/monte_carlo_reference.json` (v0.2b) — dieselbe Datei, aus der auch `shared.monte_carlo` gefüllt wird |
| `co2_sensitivity` | eigener Lauf von `scripts/model.py → mix_system` über alle sieben Presets, **nur** `co2_price` variiert, sonst identische Parameter und Profile wie im Basislauf. Reproduzierbar; der Kipppunkt wurde per Bisektion auf 0,1 €/t bestimmt. |
| `ccs_narrative` | `research/modell_v02_ergebnis.md` 4b.1 (Zerlegung des Aufschlags, implizite Vermeidungskosten) |
| `ges_absender` | unser eigenes Grundlagenpapier `docs/03_grundlage_erweitert_v2.md` Kap. 2 — **nicht** unabhängig gegengeprüft, deshalb Konfidenz C |
| `klimapraemisse` | `research/risiken_co2.md` 1.1 (IPCC AR6 K1 und K4) und 2.4 (UBA) |
| `marktdesign` | `research/ist_zustand_de.md` 6.2 |
| `dunkelflaute_definition` | `research/risiken_co2.md` 3.1 und 3.2, inklusive des dort ausgewiesenen Interessenlagen-Hinweises |
| `wind_flh_open_question` | `research/kosten_ee_speicher.md` 4, Absatz „Gegen-Einwand, der fairerweise dazugehört" |
| `import_dsm_asymmetry` | Persona-Review 04 (EE-Expertin) K2 — der Befund ist inhaltlich unstrittig |
| `grubler_repliken`, `akt3_hinweis` | Persona-Review 06 (Nuklear-Advocacy) K3 plus WebSearch 2026-08-19 nach den beiden Erwiderungen |
| neue `sources` | drei Einträge (zwei Fachaufsätze, eine Ministeriumsquelle) |

**Was ausdrücklich nicht freigegeben ist:** Der im Panel-Review (05, Klimaaktivist:in) mit dem
**alten** Modellstand v0.1 errechnete CO₂-Kipppunkt von rund **260 €/t** darf nicht als aktueller
Wert erzählt werden. Er steht unten als `superseded_v01_estimate_eur_t` und ist ausschließlich als
*abgelöste* Zahl zitierbar — mit dem Grund, warum er sich verschoben hat.

```json
{
  "meta": {
    "block": "story_data_v02b",
    "document": "story_claims_check.md · Teil 6",
    "created": "2026-08-19",
    "model_version": "0.2b",
    "replaces": ["monte_carlo_headline"],
    "basis": [
      "research/modell_v02_ergebnis.md",
      "data/monte_carlo_reference.json",
      "research/risiken_co2.md",
      "research/ist_zustand_de.md",
      "research/kosten_ee_speicher.md"
    ],
    "story_version": "v0.2 (Entwurf)"
  },

  "monte_carlo_headline": {
    "source": "data/monte_carlo_reference.json (Modell v0.2b, scripts/model.py, 1000 gepaarte Ziehungen je Konfiguration)",
    "model_version": "0.2b",
    "co2_price_eur_t": 75,
    "caveat": "Profile PARTIAL (H2-2024, 4416 h, hochgerechnet). Der Erdgas-Brennstoffpreis ist seit v0.2 bepreist (20/35/60 EUR/MWh_th, Marktspanne, Konfidenz B fuer die Spanne und C fuer die Uebertragbarkeit auf 2045) - die früheren Untergrenzen-Vorbehalte gelten dafuer nicht mehr. Weiterhin fehlen Netzbetrieb, Redispatch und Verluste; der Netzblock der Zukunftsszenarien bleibt eine Untergrenze. Import, Export und Lastmanagement sind nicht modelliert.",
    "confidence": "B",
    "presets": [
      {"id": "ist2025", "label": "Ist 2025 (Referenzsystem)", "deterministic": 180.8, "p50_base": 182, "p5_p95_base": [174, 192], "emissions_mt_co2_a": 136.0, "gas_backup_twh_a": 148.1, "gas_peak_gw": 58.0, "comparable": false},
      {"id": "kostenminimum", "label": "GES - Kostenminimum", "deterministic": 152.3, "p50_base": 158, "p5_p95_base": [147, 180], "emissions_mt_co2_a": 27.9, "gas_backup_twh_a": 69.2, "gas_peak_gw": 53.9, "comparable": true},
      {"id": "kostenminimum_ccs", "label": "GES - Kostenminimum (Gas mit CCS)", "deterministic": 163.3, "p50_base": 170, "p5_p95_base": [157, 191], "emissions_mt_co2_a": 8.3, "gas_backup_twh_a": 69.2, "gas_peak_gw": 53.9, "comparable": true},
      {"id": "ee80_gas", "label": "GES - 80 % EE + Gas", "deterministic": 154.6, "p50_base": 157, "p5_p95_base": [145, 169], "emissions_mt_co2_a": 106.5, "gas_backup_twh_a": 264.4, "gas_peak_gw": 137.0, "comparable": true},
      {"id": "ee80_gas_ccs", "label": "GES - 80 % EE + Gas mit CCS", "deterministic": 184.4, "p50_base": 188, "p5_p95_base": [171, 210], "emissions_mt_co2_a": 31.7, "gas_backup_twh_a": 264.4, "gas_peak_gw": 137.0, "comparable": true},
      {"id": "ee80_h2", "label": "GES - 80 % EE + H2", "deterministic": 198.4, "p50_base": 198, "p5_p95_base": [188, 209], "emissions_mt_co2_a": 4.8, "gas_backup_twh_a": 11.9, "gas_peak_gw": 20.0, "comparable": true},
      {"id": "ee100", "label": "GES - 100 % Erneuerbare", "deterministic": 245.2, "p50_base": 244, "p5_p95_base": [228, 262], "emissions_mt_co2_a": 1.3, "gas_backup_twh_a": 3.2, "gas_peak_gw": 20.0, "comparable": true}
    ],
    "honest_statement": "Nach allen sieben Korrekturen liegen die beiden vorderen Pfade fast gleichauf: 152,3 Euro je Megawattstunde fuer das kernkraftgestützte Kostenminimum, 154,6 fuer die gasgestuetzten 80 Prozent Erneuerbare. Ueber 1.000 gepaarte Ziehungen ist das Kernkraft-Szenario in 45 von 100 Fällen das günstigere - die Rangfolge zwischen diesen beiden ist offen, und das ist jetzt gerechnet statt behauptet. Nur vergleicht dieser Beinahe-Gleichstand 28 gegen 107 Millionen Tonnen CO2 im Jahr. Auf gleichem Emissionsniveau - beide Pfade mit Abscheidung, so wie die geprüften Studienszenarien ihren Gas-Pfad meinen - führt das Kernkraft-Szenario mit 90 Prozent.",
    "ranking_note": "Der Ist-2025-Anker ist NICHT ranking-fähig: er trägt das heutige Netzentgelt statt der Netzinvestition bis 2045 und seine Bestandsbänder ohne Kapital- und Betriebskosten. Er ist ein Größenordnungs-Bezug, kein fünfter Platz."
  },

  "co2_sensitivity": {
    "method": "scripts/model.py, mix_system, Szenariensatz mittel, WACC 5 %, Netzvariante mid, Profil H2-2024; alle Parameter unverändert, variiert wird ausschließlich co2_price. Kipppunkt per Bisektion.",
    "model_version": "0.2b",
    "unit_costs": "EUR/MWh Systemkosten",
    "confidence": "B",
    "levels": [
      {"co2_eur_t": 0,   "label": "kein CO₂-Preis",                  "ist2025": 161.2, "kostenminimum": 150.1, "kostenminimum_ccs": 162.6, "ee80_gas": 146.2, "ee80_gas_ccs": 181.9, "ee80_h2": 198.0, "ee100": 245.1},
      {"co2_eur_t": 75,  "label": "Modellwert (ETS-1-Marktniveau)",  "ist2025": 180.8, "kostenminimum": 152.3, "kostenminimum_ccs": 163.3, "ee80_gas": 154.6, "ee80_gas_ccs": 184.4, "ee80_h2": 198.4, "ee100": 245.2},
      {"co2_eur_t": 350, "label": "UBA-Klimakostensatz MK 3.2 (1 % Diskontierung)", "ist2025": 252.8, "kostenminimum": 160.4, "kostenminimum_ccs": 165.7, "ee80_gas": 185.5, "ee80_gas_ccs": 193.6, "ee80_h2": 199.8, "ee100": 245.5},
      {"co2_eur_t": 990, "label": "UBA-Klimakostensatz MK 4.0 (Zentralwert)",       "ist2025": 420.2, "kostenminimum": 179.2, "kostenminimum_ccs": 171.3, "ee80_gas": 257.2, "ee80_gas_ccs": 214.9, "ee80_h2": 203.0, "ee100": 246.4}
    ],
    "crossover_kernkraft_vs_gas_eur_t": 47.5,
    "crossover_note": "Oberhalb von rund 48 Euro je Tonne ist das Kernkraft-Szenario im deterministischen Lauf guenstiger als der gasgestützte Pfad. Der Modellwert von 75 Euro liegt bereits darüber - der Beinahe-Gleichstand von 152,3 zu 154,6 ist also selbst schon ein Ergebnis des angesetzten CO₂-Preises.",
    "superseded_v01_estimate_eur_t": 260,
    "superseded_note": "Im Panel-Review 05 wurde derselbe Kipppunkt mit Modellstand v0.1 auf rund 260 Euro je Tonne bestimmt. Er ist um mehr als das Fünffache gefallen, weil v0.2 dem Gas-Pfad seinen Brennstoff in Rechnung stellt (M2) und die Bauzinsen-Doppelzählung bei der Kernkraft entfernt (M1). Die alte Zahl darf nur als abgelöster Wert zitiert werden.",
    "ets1_market_may_2026_eur_t": 74,
    "uba_mk32_1pct_eur_t": 350,
    "uba_mk40_central_eur_t": 990,
    "uba_note": "Der Abstand zwischen Marktpreis und Klimakostensatz ist keine Rechenfrage, sondern eine ethische Setzung: 350 Euro je Tonne folgen einer Zeitpräferenzrate von 1 Prozent, die Werte um 990 bis 1.000 Euro gewichten heutige und künftige Generationen gleich.",
    "source_ids": ["uba-methodenkonvention", "ews-ets2"]
  },

  "ccs_narrative": {
    "delta_eur_mwh": {"kostenminimum": 10.9, "ee80_gas": 29.8},
    "decomposition_ee80_gas_eur_mwh": {"kapazitaet": 23.9, "mehrbrennstoff": 2.5, "ccs_kette": 9.3, "gesparte_co2_kosten": -5.9},
    "decomposition_kostenminimum_eur_mwh": {"kapazitaet": 9.4, "mehrbrennstoff": 0.7, "ccs_kette": 2.4, "gesparte_co2_kosten": -1.5},
    "implied_abatement_cost_eur_t": {"kostenminimum": 531, "ee80_gas": 378},
    "backup_full_load_hours": {"kostenminimum": 1282, "ee80_gas": 1930},
    "note": "Der dominante Posten ist die verdoppelte Kapazität, nicht die Abscheidung selbst: ein verdoppelter Kapitalblock verteilt sich auf 1.300 bis 1.900 Betriebsstunden im Jahr. Die impliziten Vermeidungskosten sind deshalb eine OBERGRENZE - ein real optimiertes System würde nur die hoch ausgelasteten Bloecke mit Abscheidung bauen und die Spitzenlast unabgeschieden fahren.",
    "confidence": "B",
    "source": "research/modell_v02_ergebnis.md 4b.1"
  },

  "ges_absender": {
    "organisation": "Global Energy Solutions e.V.",
    "gegruendet": "2020 in Ulm, initiiert aus dem Umfeld des Forschungsinstituts FAW/n",
    "urspruenglicher_fokus": "gruener Wasserstoff, Methanol und Power-to-X-Importe",
    "studie_erschienen": "Juli 2026",
    "zieljahr": 2045,
    "jahresbedarf_twh": 950,
    "fairness_hinweis": "Dass ausgerechnet ein wasserstoffnaher Verein die wasserstofflastigen Pfade als die teuersten ausweist, spricht eher fuer als gegen die Unbefangenheit der Rechnung.",
    "volltext_status": "Das Studien-PDF war in dieser Arbeitsumgebung nicht abrufbar. Alles, was hier ueber die Methodik der Studie steht, stützt sich auf unsere eigene, vor Wochen angefertigte Wiedergabe ihrer Annahmetabellen — jede einzelne Zahl daraus ist gegen unabhängige Quellen gehalten, die Studie im Original haben wir nicht gelesen.",
    "confidence": "C",
    "confidence_note": "Angaben zu Trägerschaft und Vereinsgeschichte stammen aus unserem eigenen Grundlagenpapier und sind nicht unabhängig gegengeprueft.",
    "source_ids": ["ges-studie-2026"]
  },

  "klimapraemisse": {
    "titel": "Was hier nicht verhandelt wird",
    "k1_zitat": "Human activities, principally through emissions of greenhouse gases, have unequivocally caused global warming, with global surface temperature reaching 1.1 °C above 1850-1900 in 2011-2020.",
    "k1_fundstelle": "IPCC AR6 Synthesis Report, Summary for Policymakers, A.1",
    "k4_aussage": "Zwischen kumulativen CO₂-Emissionen und dem Anstieg der globalen Oberflächentemperatur besteht ein nahezu linearer Zusammenhang (high confidence). Erst das rechtfertigt es, überhaupt einen einheitlichen Preis je Tonne anzusetzen — unabhängig davon, wo und wann emittiert wird.",
    "k4_fundstelle": "IPCC AR6 WG1, Summary for Policymakers, D.1.1 und Abbildung SPM.10",
    "restbudget_gt_co2": {"1_5_grad_50_prozent": 500, "2_grad_67_prozent": 1150, "stand": "Anfang 2020", "fundstelle": "AR6 Synthesis Report SPM, B.5.2"},
    "grenze": "Dieses Modell vergleicht Endzustände, keine Transformationspfade. Kumulative Emissionen — nach AR6 die klimarelevante Größe — sind darin nicht bilanziert.",
    "confidence": "A",
    "confidence_note": "Substanz Konfidenz A. Der Wortlaut der Zitate ist aus Suchindex-Auszügen rekonstruiert, das PDF war in dieser Arbeitsumgebung nicht abrufbar (Konfidenz B fuer die wörtliche Fassung).",
    "source_ids": ["ipcc-ar6-syr", "ipcc-ar6-wg1"]
  },

  "marktdesign": {
    "gesetz": "StromVKG - Gesetz zur Sicherung der Versorgungssicherheit Strom und zur Bereitstellung neuer Kapazitaeten",
    "grundsatzeinigung_eu": "2026-01-15",
    "kabinettsbeschluss": "2026-05-13",
    "ausschreibung_1": {"datum": "1. September 2026", "volumen_gw": 4.5},
    "ausschreibung_2": {"datum": "8. Dezember 2026", "volumen_gw": 4.5},
    "gesamtvolumen_zunaechst_gw": 11,
    "inbetriebnahme_spaetestens": 2031,
    "koalitionsvertrag_ziel_gw_bis_2030": 20,
    "technologiefokus": "wasserstofffähige Gaskraftwerke, daneben ausdruecklich Speicher und andere steuerbare Anlagen",
    "offener_widerspruch": "11 GW Ausschreibungsarchitektur gegen 20 GW Koalitionsvertragsziel; die Ausgestaltung des Kapazitätsmechanismus ist nicht final entschieden.",
    "bezug_zum_modell": "Unser Modell setzt die Backup-Leistung als Ergebnis des Dispatch, nicht als Marktprozess. Wer die 137 GW Gasleistung des gasgestuetzten Pfades liest, sollte wissen, in welchem Tempo Deutschland gesicherte Leistung derzeit tatsächlich beschafft.",
    "confidence": "A",
    "source_ids": ["bmwe-kraftwerksstrategie"]
  },

  "dunkelflaute_definition": {
    "kernaussage": "Es gibt keine einheitliche Definition. Deshalb koennen beide Seiten mit korrekten Zahlen das Gegenteil behaupten.",
    "definitionen": [
      {"quelle": "Deutscher Wetterdienst", "schwelle": "unter 10 % der Nennleistung", "mindestdauer_h": 48},
      {"quelle": "Uniper-Kurzstudie 2026", "schwelle": "unter 10 % der installierten Leistung von Wind und PV zusammen, gleitender 6-Stunden-Mittelwert", "mindestdauer_h": 10}
    ],
    "haeufigkeit_uniper": "1.435 Ereignisse ueber 10 Stunden zwischen 2016 und 2025, mittlere Dauer 12,9 Stunden - also im Mittel öfter als alle drei Tage.",
    "haeufigkeit_lang": "Ereignisse ueber 48 Stunden treten rund zwei- bis dreimal im Jahr auf; das längste Ereignis der letzten zehn Jahre dauerte 5,4 Tage.",
    "interessenlage": "Uniper betreibt konventionelle Kraftwerke und hat ein wirtschaftliches Interesse daran, den Backup-Bedarf zu betonen. Die 10-Stunden-Schwelle ist nicht falsch, sie produziert aber naturgemäß viel höhere Ereigniszahlen als die 48-Stunden-Definition des DWD. Umgekehrt blendet die DWD-Definition Erzeugungslücken von 10 bis 24 Stunden aus, die fuer den Speicherbedarf sehr wohl zählen.",
    "dezember_2024": "Beim Referenzereignis im Dezember 2024 hat das System die Dunkelflaute technisch bewältigt - Reserven waren vorhanden, es gab keine Versorgungsunterbrechung -, aber zu Day-Ahead-Preisen zeitweise ueber 1.000 Euro je Megawattstunde. Bundesnetzagentur und Bundeskartellamt fanden keinen Marktmissbrauch, wohl aber ein strukturelles Problem.",
    "confidence": "A",
    "source_ids": ["uniper-dunkelflaute-2026", "lbbw-dunkelflaute-2025", "bnetza-preisspitzen-2025"]
  },

  "wind_flh_open_question": {
    "text": "Offene Frage, nicht erwiesener Fehler: Wir lesen die 1.700 Stunden als Neuanlagenwert - dann ist es der Schnitt der Bestandsflotte und der Hebel ist groß. Es ist aber moeglich, dass die Studie damit einen systemweiten Flottendurchschnitt fuer 2045 meint, inklusive Altanlagen und Abregelung. Ohne Zugriff auf den Volltext ihrer Annahmetabelle lässt sich das nicht entscheiden. Wäre es ein Flottenwert inklusive Abregelung, wären die 1.700 und unsere 2.400 Stunden nicht dieselbe Größe - unser Modell erzeugt die Abregelung erst im Dispatch.",
    "confidence": "B",
    "source": "research/kosten_ee_speicher.md 4"
  },

  "import_dsm_asymmetry": {
    "text": "Import, Export und flexible Nachfrage sind nicht modelliert. Das ist konservativ, aber NICHT symmetrisch: Flexibilität und Interkonnektoren ersetzen Speicher und Backup, ihr Wert steigt also mit dem Anteil wetterabhängiger Erzeugung. Im Kostenminimum-Szenario mit seiner grossen Bandlast ersetzt verschiebbare Last fast nichts, im 100-Prozent-Pfad ersetzt sie Batterieleistung, Elektrolyse und Rückverstromung. Die Auslassung fällt damit zulasten der erneuerbaren Pfade aus - und sie bleibt zusaetzlich hinter der geprüften Studie zurück, die 20 GW Interkonnektoren ansetzt.",
    "confidence": "A",
    "source": "Persona-Review 04 (EE-Expertise) K2"
  },

  "grubler_repliken": {
    "text": "Grublers Befund ist belegt und er ist bestritten. Escobar Rangel und Lévêque rechnen die französische Kostenentwicklung 2015 mit den Daten des Rechnungshofs nach und finden eine deutlich geringere Eskalation als Grubler - und, neben dem verteuernden Skalierungseffekt, sehr wohl Lerneffekte: die Standardisierungsstrategie des französischen Programms habe die Kosten spürbar gesenkt. Berthelemy und Escobar Rangel finden im selben Jahr ueber französische und US-amerikanische Reaktoren, dass Standardisierung Bauzeiten und Kosten senkt, waehrend Designaenderungen beides erhöhen. Wer Grubler zitiert, sollte die Erwiderungen mitzitieren - und umgekehrt.",
    "confidence": "C",
    "confidence_note": "Beide Aufsätze wurden ueber Suchindex-Auszuege erfasst, nicht im Volltext gelesen. Die Richtung der Befunde ist eindeutig, die genauen Effektgrößen sind hier bewusst nicht beziffert.",
    "source_ids": ["grubler-2010", "escobar-rangel-leveque-2015", "berthelemy-2015"]
  },

  "akt3_hinweis": {
    "titel": "Das hier ist eine westliche Kostengeschichte",
    "text": "Die Zeitreihe oben enthaelt 15 Datenpunkte und keinen einzigen asiatischen. Sie zeigt damit nicht die Geschichte der Kernkraft, sondern die des westlichen Kernkraftbaus nach der Bauunterbrechung. In den letzten zwanzig Jahren wurde die Mehrheit aller Reaktoren weltweit in Asien gebaut. Zu chinesischen Neubaukosten liegt uns keine prüfbare Quelle vor; der koreanische und der emiratische Teil des Weltbestands steht in unserem Datensatz und taucht in Akt 2 als Cluster Asien/Golf auf - und in Akt 4 als eigene, durchgerechnete Kontrastverteilung.",
    "confidence": "A",
    "source": "Persona-Review 06 (Pro-Kernkraft-Advocacy) K3"
  },

  "sources": [
    {"id": "escobar-rangel-leveque-2015", "title": "Revisiting the Cost Escalation Curse of Nuclear Power: New Lessons from the French Experience", "author": "Lina Escobar Rangel, Francois Lévêque", "publisher": "Economics of Energy & Environmental Policy 4(2)", "date": "2015", "url": "https://ideas.repec.org/a/aen/eeepjl/eeep4-2-escobar.html", "accessed": "2026-08-19", "confidence": "C", "note": "Erwiderung auf Grubler 2010: geringere Eskalation als dort berichtet, Belege fuer Lerneffekte und fuer eine kostensenkende Wirkung der Standardisierung. Ueber Suchindex-Auszuege erfasst, nicht im Volltext gelesen."},
    {"id": "berthelemy-2015", "title": "Nuclear reactors' construction costs: The role of lead-time, standardization and technological progress", "author": "Michel Berthelemy, Lina Escobar Rangel", "publisher": "Energy Policy 82, S. 118-130", "date": "2015", "url": "https://doi.org/10.1016/j.enpol.2015.03.015", "accessed": "2026-08-19", "confidence": "C", "note": "Oekonometrie ueber französische und US-amerikanische Reaktoren: Standardisierung senkt Bauzeit und Kosten, Designaenderungen erhöhen beides. Ueber Suchindex-Auszuege erfasst, nicht im Volltext gelesen."},
    {"id": "bmwe-kraftwerksstrategie", "title": "Kraftwerksstrategie / StromVKG - Grundsatzeinigung mit der Europaeischen Kommission und Kabinettsbeschluss", "publisher": "Bundesministerium fuer Wirtschaft und Energie (BMWE)", "date": "2026-01 / 2026-05", "url": "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Pressemitteilungen/2026/01/20260115-grundsatzeinigung-mit-europaeischen-kommission-ueber-eckpunkte-der-kraftwerksstrategie.html", "accessed": "2026-08-15", "confidence": "A", "note": "Termine und Volumina der ersten beiden Ausschreibungsrunden nach research/ist_zustand_de.md 6.2."}
  ],

  "story_cited_source_ids": [
    "ipcc-ar6-syr", "ipcc-ar6-wg1", "unece-2022", "uba-methodenkonvention",
    "uniper-dunkelflaute-2026", "lbbw-dunkelflaute-2025", "bnetza-preisspitzen-2025",
    "escobar-rangel-leveque-2015", "berthelemy-2015", "bmwe-kraftwerksstrategie",
    "grubler-2010", "lovering-2016", "gilbert-2017", "koomey-2017"
  ]
}
```

---

## Anhang · Reproduzierbarkeit

Alle Nachrechnungen dieses Dossiers sind mit Bordmitteln des Repos
reproduzierbar:

- **Gleichungssystem 6a.1, LCOE-Vergleiche, Investitionsarithmetik,
  LSCOE-Rekonstruktion, ETS-Quantifizierung:** reine Arithmetik, im Text
  vollstaendig ausgeschrieben.
- **Systemkosten 2056:** `scripts/model.py`, Funktion `mix_system`, mit den in
  `story_data.thirty_year_plan.lscoe_2056.our_model.inputs` genannten
  Kapazitaeten; Energieanteile aus Kapazität × Volllaststunden / Bedarf.
- **Monte-Carlo-Bandbreiten:** unverändert aus
  `data/monte_carlo_reference.json` uebernommen (erzeugt von
  `scripts/monte_carlo.py`).

**Offene Punkte fuer eine spaetere Session:**

1. GES-Studien-PDF beschaffen (Egress-Blockade umgehen oder Autoren
   kontaktieren) — dann Kap. 6a.1 gegen die Original-Zubaufaktoren pruefen.
2. Isar-2-Baukosten am IAEA-INIS-Datensatz verifizieren oder den Datenpunkt
   streichen (C4).
3. Lovering-Rohdaten (Supplementary Material zu Energy Policy 91) ziehen, um
   die US-/Frankreich-/BRD-Zeitreihe punktgenau statt bandweise zu zeigen.
4. Erdgas-Brennstoffpreis schliessen — solange er fehlt, sind **alle**
   Modell-LSCOE Untergrenzen. Die GES-Annahme (40 €/MWh) waere ein brauchbarer
   Anker, ist aber nicht unabhängig belegt.
5. Fraunhofer ISE „Stromgestehungskosten" auf eine 2025/2026-Neuauflage pruefen
   (Stand dieser Recherche: Juli 2024 ist die aktuellste Ausgabe).

---

# Teil 7 · Nachtrag v0.2c (Story-Redigat v0.3) — zusätzlicher Freigabe-Datensatz

**Angelegt:** 2026-08-19 · **Anlass:** Modellstand **v0.2c**
(`research/modell_v02c_ergebnis.md`, Fixes 1–5: Übertragungsnetz-Sockel,
gemeinsame Rohstoffziehungen, Überschreitungs-Monotonie, CCS-Massenbilanz,
LCOE-Regler) und die Redigat-Liste in dessen Abschnitt 8 (V1–V10).

**Was dieser Nachtrag tut.** Er **ersetzt** aus Teil 6 die Blöcke
`monte_carlo_headline`, `co2_sensitivity`, `ccs_narrative` und `ges_absender` —
deren Zahlen stammen aus Modellstand v0.2b und sind nach v0.2c falsch (V1, V2,
V4) bzw. sprachlich unbrauchbar (K-R2-4 Journalist). Und er **ergänzt** die
Blöcke, die das Redigat v0.3 neu braucht: den Haushalts-Anker, die Einordnung
gegen das Klimaschutzgesetz, die neue Überschreitungsregel und den Anteil der
Netzregel am Vorsprung. Alles Übrige aus Teil 5 und Teil 6 bleibt gültig.

Der Block trägt `meta.block = "story_data_v02c"`. `scripts/build_story_data.py`
legt die Nachträge in der Reihenfolge Teil 5 → Teil 6 → Teil 7 übereinander
(gleichnamige Blöcke gewinnen aus dem jüngsten Nachtrag, `sources` werden
angehängt). Der Lauf bleibt deterministisch.

**Herkunft der neuen und geänderten Zahlen — kurz und prüfbar:**

| Block | Woher |
|---|---|
| `monte_carlo_headline` | `data/monte_carlo_reference.json` (v0.2c) · Punktwerte und Perzentile aus `modell_v02c_ergebnis.md` 6.1/6.2, Rangwahrscheinlichkeiten aus 6.3 |
| `co2_sensitivity` | `modell_v02c_ergebnis.md` 6.4 (Bisektion auf 0,1 €/t; MC-Umschlagpunkt aus den gepaarten Ziehungen) |
| `ccs_narrative` | `modell_v02c_ergebnis.md` 6.5. Die Zerlegung des Aufschlags (Kapazität/Mehrbrennstoff/CCS-Kette/gesparte CO₂-Kosten) ist mit v0.2c **nicht** neu gerechnet worden und deshalb aus dem Datensatz entfernt statt veraltet weitergeführt |
| `ueberschreitung` | `modell_v02c_ergebnis.md` 4.1–4.4 (Schätzbasis, Rest-Anteile, effektive CAPEX-Verteilung über 200.000 Ziehungen) |
| `netzregel_anteil` | `modell_v02c_ergebnis.md` 2.3 (Sensitivität der Sockelquote, Anteil am Median-Vorsprung) |
| `modell_offene_punkte` | `modell_v02c_ergebnis.md` 4.3 und 9 (WACC-Abhängigkeit der CAPEX-Anker — Altbefund, in v0.2c sichtbar gemacht, nicht behoben) |
| `haushalt_anker` | reine Umrechnung (1 €/MWh = 0,1 ct/kWh); der Referenzverbrauch 3.500 kWh/a ist eine **Setzung** und als solche gekennzeichnet |
| `klimaziel_2045` | Bundes-Klimaschutzgesetz § 3a (Senkenziele 25/35/40 Mt CO₂-Äq. für 2030/2040/2045), über Suchindex-Auszüge und Sekundärquellen erfasst — **Konfidenz B**, der Gesetzestext war im Volltext nicht abrufbar |
| `ges_absender` | unverändert aus Teil 6, nur das Feld `gegruendet` in `gegruendet` + `gegruendet_kontext` getrennt (der bisherige Wert war ein ganzer Nebensatz und erzeugte im Markup einen unlesbaren Satz) |

**Was ausdrücklich nicht mehr erzählt werden darf:** die Pointe „der reale
ETS-Preis liegt schon über der Kippmarke". Sie galt für den v0.2b-Kipppunkt von
47,5 €/t; mit dem Übertragungsnetz-Sockel liegt der Kipppunkt bei **101,8 €/t**
und damit **über** dem ETS-1-Marktpreis von 74 €/t. Ebenfalls abgelöst: die
90,3-%-Aussage zum CCS-Paar (jetzt 82,2 %) und die Einlagerungsmenge von
110,6 Mt/a (jetzt 91,2 Mt/a).

```json
{
  "meta": {
    "block": "story_data_v02c",
    "document": "story_claims_check.md · Teil 7",
    "created": "2026-08-19",
    "model_version": "0.2c",
    "replaces": ["monte_carlo_headline", "co2_sensitivity", "ccs_narrative", "ges_absender"],
    "basis": [
      "research/modell_v02c_ergebnis.md",
      "data/monte_carlo_reference.json",
      "data/story_data.json (shared, v0.2c)"
    ],
    "story_version": "v0.3 (Entwurf)"
  },

  "monte_carlo_headline": {
    "source": "data/monte_carlo_reference.json (Modell v0.2c, scripts/model.py, 1000 gepaarte Ziehungen je Konfiguration)",
    "model_version": "0.2c",
    "co2_price_eur_t": 75,
    "caveat": "Profile PARTIAL (H2-2024, 4416 h, hochgerechnet). Seit v0.2c hat das Übertragungsnetz einen mixunabhängigen Sockel (Setzung 0,40, Sensitivität 0,20-0,60) - diese eine Setzung bewegt den Abstand zwischen dem Kernkraft- und dem gasgestützten Pfad über die ganze Breite von -2,3 bis +4,5 EUR/MWh. Weiterhin fehlen Netzbetrieb, Redispatch und Verluste; der Netzblock der Zukunftsszenarien bleibt eine Untergrenze. Import, Export und Lastmanagement sind nicht modelliert.",
    "confidence": "B",
    "presets": [
      {"id": "ist2025", "label": "Ist 2025 (Referenzsystem)", "deterministic": 180.8, "p50_base": 183, "p5_p95_base": [174, 192], "emissions_mt_co2_a": 136.0, "gas_backup_twh_a": 148.1, "gas_peak_gw": 58.0, "comparable": false},
      {"id": "kostenminimum", "label": "GES - Kostenminimum", "deterministic": 159.0, "p50_base": 165, "p5_p95_base": [154, 186], "emissions_mt_co2_a": 27.9, "gas_backup_twh_a": 69.2, "gas_peak_gw": 53.9, "comparable": true},
      {"id": "kostenminimum_ccs", "label": "GES - Kostenminimum (Gas mit CCS)", "deterministic": 169.6, "p50_base": 176, "p5_p95_base": [164, 197], "emissions_mt_co2_a": 8.3, "gas_backup_twh_a": 69.2, "gas_peak_gw": 53.9, "comparable": true},
      {"id": "ee80_gas", "label": "GES - 80 % EE + Gas", "deterministic": 156.8, "p50_base": 159, "p5_p95_base": [148, 171], "emissions_mt_co2_a": 106.5, "gas_backup_twh_a": 264.4, "gas_peak_gw": 137.0, "comparable": true},
      {"id": "ee80_gas_ccs", "label": "GES - 80 % EE + Gas mit CCS", "deterministic": 185.0, "p50_base": 189, "p5_p95_base": [172, 206], "emissions_mt_co2_a": 31.7, "gas_backup_twh_a": 264.4, "gas_peak_gw": 137.0, "comparable": true},
      {"id": "ee80_h2", "label": "GES - 80 % EE + H2", "deterministic": 199.5, "p50_base": 200, "p5_p95_base": [189, 210], "emissions_mt_co2_a": 4.8, "gas_backup_twh_a": 11.9, "gas_peak_gw": 20.0, "comparable": true},
      {"id": "ee100", "label": "GES - 100 % Erneuerbare", "deterministic": 245.2, "p50_base": 245, "p5_p95_base": [228, 263], "emissions_mt_co2_a": 1.3, "gas_backup_twh_a": 3.2, "gas_peak_gw": 20.0, "comparable": true}
    ],
    "honest_statement": "Die beiden vorderen Pfade liegen so eng beieinander, dass schon die Wahl der Kennzahl den Sieger wechselt: Im Punktwert kostet der gasgestützte 80-Prozent-Pfad 156,8 Euro je Megawattstunde und das kernkraftgestützte Kostenminimum 159,0 - von 1.000 durchgerechneten Zukünften gehen 257 an die Kernkraft und 743 an den Gas-Pfad. Entschieden ist damit nichts. Nur vergleicht dieser Beinahe-Gleichstand 28 gegen 107 Millionen Tonnen CO2 im Jahr. Verlangt man vom Gas-Pfad dieselbe Emissionsmenge - mit Abscheidung, so wie die geprüfte Studie ihren Gas-Pfad meint -, liegt das Kernkraft-Szenario in 943 von 1.000 Zukünften vorn; nach unserer eigenen Schwelle von 950 ist auch das formal kein entschiedener Vergleich, aber die Richtung dreht sich.",
    "ranking_note": "Der Ist-2025-Anker ist NICHT ranking-fähig: er trägt das heutige Netzentgelt statt der Netzinvestition bis 2045 und seine Bestandsbänder ohne Kapital- und Betriebskosten. Er ist ein Größenordnungs-Bezug, kein fünfter Platz."
  },

  "co2_sensitivity": {
    "method": "scripts/model.py, mix_system, Szenariensatz mittel, WACC 5 %, Netzvariante mid, Profil H2-2024; alle Parameter unverändert, variiert wird ausschließlich co2_price. Kipppunkt per Bisektion; der Umschlagpunkt über die gepaarten Ziehungen ist der CO2-Preis, bei dem die Median-Differenz null wird.",
    "model_version": "0.2c",
    "unit_costs": "EUR/MWh Systemkosten",
    "confidence": "B",
    "levels": [
      {"co2_eur_t": 0,   "label": "kein CO₂-Preis",                  "ist2025": 161.2, "kostenminimum": 156.8, "kostenminimum_ccs": 168.9, "ee80_gas": 148.4, "ee80_gas_ccs": 182.5, "ee80_h2": 199.1, "ee100": 245.1},
      {"co2_eur_t": 75,  "label": "Modellwert (ETS-1-Marktniveau)",  "ist2025": 180.8, "kostenminimum": 159.0, "kostenminimum_ccs": 169.6, "ee80_gas": 156.8, "ee80_gas_ccs": 185.0, "ee80_h2": 199.5, "ee100": 245.2},
      {"co2_eur_t": 350, "label": "UBA-Klimakostensatz MK 3.2 (1 % Diskontierung)", "ist2025": 252.8, "kostenminimum": 167.1, "kostenminimum_ccs": 172.0, "ee80_gas": 187.7, "ee80_gas_ccs": 194.1, "ee80_h2": 200.9, "ee100": 245.5},
      {"co2_eur_t": 990, "label": "UBA-Klimakostensatz MK 4.0 (Zentralwert)",       "ist2025": 420.2, "kostenminimum": 185.9, "kostenminimum_ccs": 177.6, "ee80_gas": 259.4, "ee80_gas_ccs": 215.5, "ee80_h2": 204.1, "ee100": 246.4}
    ],
    "crossover_kernkraft_vs_gas_eur_t": 101.8,
    "crossover_mc_median_eur_t": 152,
    "crossover_note": "Diese Marke gilt für den deterministischen Lauf mit den mittleren Annahmen: Darunter ist der gasgestützte Pfad günstiger, darüber das Kernkraft-Szenario. Über die 1.000 gepaarten Ziehungen wird die Median-Differenz erst bei rund 152 Euro je Tonne null. Der ETS-1-Marktpreis von 74 Euro (Mai 2026) und der Modellwert von 75 Euro liegen unter beiden Marken - beim heutigen CO2-Preis führt in dieser Rechnung der Gas-Pfad. Die Marke wandert mit dem Gaspreis und mit der Netzregel; sie ist keine Naturkonstante. Mit Abscheidung auf beiden Seiten gibt es gar keinen Kipppunkt: Dort liegt das Kernkraft-Szenario bei jedem CO2-Preis vorn.",
    "superseded_v01_estimate_eur_t": 260,
    "superseded_v02b_estimate_eur_t": 47.5,
    "superseded_note": "Dieselbe Marke lag im Panel-Review 05 mit Modellstand v0.1 bei rund 260 Euro je Tonne und in v0.2b bei 47,5 Euro. Der Sturz auf 47,5 kam daher, dass v0.2 dem Gas-Pfad seinen Brennstoff in Rechnung stellt und die Bauzinsen-Doppelzählung bei der Kernkraft entfernt; der Wiederanstieg auf 101,8 kommt vom Übertragungsnetz-Sockel aus v0.2c, der den Kernkraft-Pfad um 6,7 und den Gas-Pfad nur um 2,2 Euro je Megawattstunde verteuert. Beide älteren Zahlen dürfen nur als abgelöste Werte zitiert werden.",
    "ets1_market_may_2026_eur_t": 74,
    "uba_mk32_1pct_eur_t": 350,
    "uba_mk40_central_eur_t": 990,
    "uba_note": "Der Abstand zwischen Marktpreis und Klimakostensatz ist keine Rechenfrage, sondern eine Wertentscheidung: 350 Euro je Tonne folgen einer Zeitpräferenzrate von 1 Prozent, die Werte um 990 bis 1.000 Euro gewichten heutige und künftige Generationen gleich.",
    "source_ids": ["uba-methodenkonvention", "ews-ets2"]
  },

  "ccs_narrative": {
    "delta_eur_mwh": {"kostenminimum": 10.5, "ee80_gas": 28.1},
    "implied_abatement_cost_eur_t": {"kostenminimum": 510, "ee80_gas": 357},
    "stored_mt_co2_a": {"kostenminimum": 23.9, "ee80_gas": 91.2},
    "residual_mt_co2_a": {"kostenminimum": 8.3, "ee80_gas": 31.7},
    "backup_full_load_hours": {"kostenminimum": 1282, "ee80_gas": 1930},
    "decomposition_note": "Die Zerlegung des Aufschlags in Kapazität, Mehrbrennstoff, CCS-Kette und gesparte CO2-Kosten stammte aus dem v0.2b-Lauf und ist mit v0.2c nicht neu gerechnet worden. Sie ist deshalb aus dem Datensatz entfernt; qualitativ bleibt der Befund: Der dominante Posten ist der verdoppelte Kapitalblock, nicht die Abscheidung selbst.",
    "note": "Ein Gaskraftwerk mit Abscheidung kostet in der Anschaffung rund das Doppelte, läuft aber nur 1.300 bis 1.900 Stunden im Jahr. Die impliziten Vermeidungskosten sind eine OBERGRENZE - und zwar für beides, für die Vermeidungskosten und für den Aufschlag selbst: Die Rechnung rüstet den GESAMTEN Backup-Park aus, auch die Blöcke mit sehr wenigen Betriebsstunden. Ein real optimiertes System würde nur die hoch ausgelasteten Blöcke ausrüsten und die Spitzenlast unabgeschieden fahren - dann fällt der Aufschlag kleiner aus, dafür bleibt mehr Restemission.",
    "confidence": "B",
    "source": "research/modell_v02c_ergebnis.md 6.5"
  },

  "ueberschreitung": {
    "schaetzbasis_eur_kw": 7500,
    "rest_anteile": [0.48, 0.50, 0.0],
    "capex_effektiv_median_eur_kw": 15941,
    "capex_effektiv_faktor": 1.3,
    "capex_effektiv_median_v02b_eur_kw": 22770,
    "hpc_nominal_eur_kw": 17264,
    "text": "Der empirische Überschreitungsfaktor wird seit v0.2c nicht mehr auf jeden gezogenen Baukostenwert multipliziert, sondern als absoluter Betrag auf einer einzigen Schätzbasis von 7.500 Euro je Kilowatt gerechnet - und nur auf den Teil der Eskalation, der noch aussteht. Auf Anker, die ihre Verteuerung bereits hinter sich haben (Hinkley Point C in laufenden Preisen), kommt gar nichts mehr obendrauf. Ergebnis: Der effektive Baukostenwert liegt im Überschreitungs-Lauf im Median bei 15.941 statt 22.770 Euro je Kilowatt - ein effektiver Faktor von 1,30 statt 1,86, und damit erstmals vollständig unterhalb des teuersten je gebauten westlichen Reaktors (17.264 Euro je Kilowatt).",
    "confidence": "B",
    "source": "research/modell_v02c_ergebnis.md 4.1-4.4"
  },

  "netzregel_anteil": {
    "sockel_effekt_kernkraft_eur_mwh": 6.7,
    "sockel_effekt_gas_eur_mwh": 2.2,
    "median_vorsprung_ccs_paar_eur_mwh": 11.7,
    "anteil_am_median_vorsprung_pct": 58,
    "anteil_am_deterministischen_abstand_pct": 44,
    "sensitivitaet_abstand_eur_mwh": [-2.3, 4.5],
    "text": "Von den 11,7 Euro je Megawattstunde, mit denen das Kernkraft-Szenario im technologiesymmetrischen Vergleich vorn liegt, stammen 6,7 aus einer einzigen Modellsetzung: dem Anteil des Übertragungsnetzes, der auch ohne wetterabhängige Erzeugung gebaut werden müsste (0,40, Sensitivität 0,20 bis 0,60). Über diese Spanne bewegt sich der Abstand der beiden Pfade um 6,8 Euro je Megawattstunde - mehr als der Abstand selbst. Es ist der einzige Parameter des Modells, der die Rangfolge allein durch seine Wahl dreht.",
    "confidence": "M",
    "source": "research/modell_v02c_ergebnis.md 2.3"
  },

  "modell_offene_punkte": {
    "wacc_anker_monotonie": {
      "text": "Die drei Baukosten-Anker der Kernkraft haben verschiedene Kostenabgrenzungen: 7.500 Euro je Kilowatt sind reine Baukosten, 12.000 und 17.500 enthalten Finanzierung. Bei einem Kapitalkostensatz über rund 8,2 Prozent überholt der bauzinsbelastete untere Anker den mittleren - dort ist die Abbildung von gezogener zu effektiver Bausumme auch ohne jede Kostenüberschreitung nicht mehr monoton. Betroffen sind rund 2,7 Prozent der Ziehungen in den Zins-Konfigurationen. Der saubere Weg wäre, alle Anker auf dieselbe Abgrenzung zu bringen; bei 5 Prozent Zins wäre das ergebnisneutral. Er ist nicht umgesetzt.",
      "confidence": "A",
      "source": "research/modell_v02c_ergebnis.md 4.3 und 9"
    }
  },

  "haushalt_anker": {
    "verbrauch_kwh_a": 3500,
    "umrechnung": "1 Euro je Megawattstunde sind 0,1 Cent je Kilowattstunde - und bei 3.500 Kilowattstunden Jahresverbrauch 3,50 Euro im Jahr.",
    "guardrail": "Systemkosten, kein Strompreis: Diese Zahlen sagen, was Erzeugung, Speicher, Backup und Netzausbau je Kilowattstunde kosten. Auf einer Stromrechnung stehen zusätzlich Vertrieb, Messung, Steuern und Abgaben, und die Netzkosten werden dort anders verteilt als hier modelliert. Der Haushalts-Anker macht Größenordnungen fühlbar - er ist keine Preisprognose.",
    "confidence": "M",
    "note": "3.500 Kilowattstunden im Jahr sind die gerundete Referenzgröße für einen Zwei- bis Drei-Personen-Haushalt. Sie ist hier eine Rechenhilfe und keine Messung, deshalb als Setzung gekennzeichnet."
  },

  "klimaziel_2045": {
    "gesetz": "Bundes-Klimaschutzgesetz (KSG), § 3a",
    "netto_neutralitaet_jahr": 2045,
    "senke_mt_co2_aeq": {"2030": 25, "2040": 35, "2045": 40},
    "text": "Das Klimaschutzgesetz verlangt für 2045 Netto-Treibhausgasneutralität. Die dafür vorgesehene nationale Senkenleistung aus Landnutzung und Forstwirtschaft steht im selben Gesetz bei 40 Millionen Tonnen CO2-Äquivalent im Jahr - für alle Sektoren zusammen, Industrieprozesse, Landwirtschaft und Abfall eingeschlossen.",
    "confidence": "B",
    "confidence_note": "Zielwerte aus § 3a KSG, über Suchindex-Auszüge und Sekundärquellen erfasst; der Gesetzestext war in dieser Arbeitsumgebung nicht im Volltext abrufbar. Es ist ein Zielwert, kein Ist-Wert - die tatsächliche Senkenleistung des Sektors liegt derzeit deutlich darunter und war zuletzt sogar negativ.",
    "source_ids": ["ksg-3a"]
  },

  "ges_absender": {
    "organisation": "Global Energy Solutions e.V.",
    "gegruendet": "2020 in Ulm",
    "gegruendet_kontext": "initiiert aus dem Umfeld des Forschungsinstituts FAW/n",
    "urspruenglicher_fokus": "gruener Wasserstoff, Methanol und Power-to-X-Importe",
    "studie_erschienen": "Juli 2026",
    "zieljahr": 2045,
    "jahresbedarf_twh": 950,
    "fairness_hinweis": "Dass ausgerechnet ein wasserstoffnaher Verein die wasserstofflastigen Pfade als die teuersten ausweist, spricht eher fuer als gegen die Unbefangenheit der Rechnung.",
    "volltext_status": "Das Studien-PDF war in dieser Arbeitsumgebung nicht abrufbar. Alles, was hier ueber die Methodik der Studie steht, stützt sich auf unsere eigene, vor Wochen angefertigte Wiedergabe ihrer Annahmetabellen — jede einzelne Zahl daraus ist gegen unabhängige Quellen gehalten, die Studie im Original haben wir nicht gelesen.",
    "confidence": "C",
    "confidence_note": "Angaben zu Trägerschaft und Vereinsgeschichte stammen aus unserem eigenen Grundlagenpapier und sind nicht unabhängig gegengeprueft.",
    "source_ids": ["ges-studie-2026"]
  },

  "sources": [
    {"id": "ksg-3a", "title": "Bundes-Klimaschutzgesetz (KSG) § 3a - Nationale Klimaschutzziele fuer den Sektor Landnutzung, Landnutzungsaenderung und Forstwirtschaft", "publisher": "Bundesrepublik Deutschland", "date": "2021/2024", "url": "https://www.gesetze-im-internet.de/ksg/__3a.html", "accessed": "2026-08-19", "confidence": "B", "note": "Senkenziele 25 Mt (2030), 35 Mt (2040), 40 Mt CO2-Aequivalent (2045). Ueber Suchindex-Auszuege und Sekundaerquellen erfasst, nicht am Gesetzestext im Volltext geprueft."}
  ],

  "story_cited_source_ids": ["ksg-3a"]
}
```
