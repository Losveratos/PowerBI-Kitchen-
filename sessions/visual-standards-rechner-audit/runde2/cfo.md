# Runde 2 · Linse CFO · Visual-Standards-Rechner v0.10

**Prüfer:** CFO-Perspektive (Mittelstand 800 MA, HGB · Konzern 15.000 MA, IFRS)
**Datum:** 11.09.2026 · **Grundlage:** `visual-standards-rechner.html` (v0.10, 1.413 Zeilen), `md/visual-standards-rechner.md`, Audit-Runde 1 (`README.md`, `grundannahmen-kritik.md`)
**Rolle in der Simulation:** Der Controlling-Leiter legt mir den Rechner vor und will Budget. Ich prüfe nicht die Stundenannahmen (das hat Runde 1 getan), sondern: **reicht das, was hier auf dem Bildschirm steht, damit ich unterschreibe?**

---

## Kurzfazit in drei Sätzen

Der Rechner beantwortet sauber die Frage „**welcher** Weg ist der günstigste“ — das ist eine Werkzeugwahl, keine Investitionsentscheidung. Er beantwortet nicht die Fragen, die über eine Budgetfreigabe entscheiden: **wie viel Geld verlässt wann das Unternehmen, wie viel davon ist neues Budget und wie viel vorhandene Personalkapazität, wann rechnet es sich gegen „nichts tun“, und wie komme ich wieder raus, wenn es schiefgeht.** Das Bemerkenswerte: **fast alles Nötige rechnet der Rechner heute schon** — der Zahlungsstrom je Jahr (`c.cf`), die Trennung hart/weich (`c.hard`/`c.soft`), der Barwert (`c.npv`), P90, die Phasen-Matrix (`c.phase`) —, es wird nur nicht angezeigt oder nicht zur Entscheidungsgröße gemacht. Acht meiner zehn Punkte sind **Darstellungs- und Schalter-Arbeit ohne eine einzige neue Annahme**.

Zwei Vorbemerkungen zur Fairness: (1) Der Rechner sagt an mehreren Stellen selbst, was er nicht kann (Footer: „Aktivierung/Abschreibung und steuerliche Fragen … nicht enthalten“; Tabellen-Fußnote zu § 248 Abs. 2 HGB). Das ist ehrlich und wird hier nicht als Fehler gezählt, sondern als Lücke mit bekanntem Ort. (2) Runde 1 hat „Barwert als Primärkennzahl“ und „Vertragsbindung bei Paid“ bewusst nicht umgesetzt. Ich widerspreche in beiden Fällen — aus der Budgetperspektive, nicht aus der Modellperspektive.

**Netzhinweis:** `gesetze-im-internet.de` ist über den Egress-Proxy blockiert (`EGRESS_BLOCKED`), Normwortlaute konnte ich nicht im Volltext abrufen. Die Rechtsaussagen unten sind über Suchtreffer (Deloitte Tax-News, Haufe, dejure) gegengeprüft und als solche gekennzeichnet. Kein Zahlenwert unten stammt aus einer Quelle, die ich nicht gesehen habe; wo ich schätze, steht „Autoren-Schätzung“ oder „Konvention“.

---

## Was der Rechner mir heute zeigt (Bestandsaufnahme)

| Größe | Wo | Belastbar für die Freigabe? |
|:--|:--|:--|
| Gesamtkosten P50 über 3/5/10 Jahre | KPI-Karte, Headline, Tabelle | ja, aber es ist eine **Mischgröße aus Auszahlung und bewerteter interner Zeit** |
| P10–P90-Band | KPI-Karte, Tabelle, Stack-Chart | ja, gut gemacht; **wird aber nicht zur Rangfolge genutzt** |
| Barwert | eine Tabellenzeile + Suffix auf der Karte | vorhanden, **entscheidet nichts** (`rankVal` nutzt `p50`) |
| Invest (Start) / laufend je Jahr (Mittel) | KPI-Karte, Tabelle | Mittelwert; verdeckt, dass die Lizenz jedes Jahr wächst |
| Kumulierte Kosten je Jahr | `drawCumulative`, Liniendiagramm | **einzige Jahressicht, nur als Kurve, keine Zahlen-Tabelle, kein Export** |
| hart (Auszahlung) / weich (interne Stunden) | nur Monte-Carlo-Seite (Schritt 6) | **auf der Ergebnisseite unsichtbar** |
| Erstellung/Nutzung × direkt/indirekt | nur Monte-Carlo-Seite | dito |
| Null-Option „kein Standard“ | eigene Karte unter dem Ergebnis | Summenvergleich über H Jahre, **kein Amortisationszeitpunkt** |
| Stunden | nur „erster Report ≈ X h / jeder weitere ≈ Y h“ | **keine Gesamtstunden, keine FTE, keine Kapazitätsprüfung** |
| Anforderungs-Score, K.O., „€ je Anforderungspunkt“ | Karten, Headline | gute Nutzen-Näherung, aber kein Euro-Nutzen |
| Excel-Export | „Lesen zuerst“, „Annahmen“, „Modell“ (Formeln), „Ergebnis“, „Break-even“, „Quellen“ | sehr ordentlich; **Blatt „Modell“ ohne Barwert, ohne Jahresraster, ohne hart/weich** |

**Was gar nicht vorkommt:** CapEx/OpEx, Aktivierung/Abschreibung, Budgetjahr und Startzeitpunkt, Payback, Vertragslaufzeit und Ausstiegskosten, Währung, Umsatzsteuer/Quellensteuer, FTE-Kapazität, Business-Owner.

---

## Die zehn Funde

### F1 · Cash-out je Jahr fehlt — die erste Zahl, die ein CFO sehen will (Wirkung hoch)

**Heute:** Die Ergebnisseite zeigt `Invest <Summe> · laufend <Mittel>/Jahr`. In `calc()` steht mit
`c.yearly=(c.total-c.invest)/H` ein **Durchschnitt**, obwohl das Modell die Jahre kennt: `c.cf` ist ein Vektor über H+1 Jahre, in dem die Lizenz pro Jahr mit Viewer-Wachstum und Preissteigerung neu gerechnet wird (`u*Math.pow(inf,yv)*p('lic')*staffelD(u)`). Der Vektor speist ausschließlich `c.npv` und die Kurve in `drawCumulative`. Parallel existiert `c.hard` (Lizenz, Support, Capacity, Kurse, extern beauftragte Stunden) und `c.soft` (intern bewertete Stunden) — aber nur als Summe über den ganzen Horizont, und angezeigt nur auf der Monte-Carlo-Seite.

**Warum das die Freigabe blockiert:** Ich bewillige kein „5-Jahres-P50“. Ich bewillige eine Zeile im Budget eines Geschäftsjahres. Und ich brauche die Trennung: **Lizenzen sind neues Geld, interne Stunden sind in aller Regel schon bezahlt.** Ein Ergebnis von 480 k€ über fünf Jahre ist ein völlig anderer Antrag, je nachdem ob 400 k€ davon Lizenzrechnungen sind oder 400 k€ Zeit eines Teams, das ohnehin auf der Payroll steht. Genau das trennt der Rechner intern bereits — und zeigt es der entscheidenden Person nicht.

**Vorschlag (ohne neue Annahme):**
1. `c.cf` in zwei Vektoren aufspalten: `c.cfHard[y]` und `c.cfSoft[y]`. Die Aufteilung existiert bereits als `hardFrac=(g('rateExt')*ext)/rate0`; Lizenz, Support, Capacity, Kurse sind zu 100 % hart, stundenbasierte Posten mit `hardFrac`.
2. Neue Tabelle unter dem Ergebnis: Zeilen `Jahr 0 … Jahr H`, Spalten je Ansatz, in jeder Zelle zweizeilig `Auszahlung` / `interne Stunden`, darunter Summenzeile und „davon neues Budget“.
3. Headline um einen Satz ergänzen: *„Davon Auszahlung: X € (Lizenz, extern, Kurse), interne Zeit: Y €.“*
4. Im Excel-Export dieselbe Matrix als eigenes Blatt „Cash-out“ und im Blatt „Modell“ ein Jahresraster statt der Summenzeilen.
5. Budgetzyklus abbilden: Eingabefeld **Startjahr/Budgetjahr** (reine Beschriftung, keine Rechnung) — „Jahr 0“ heißt dann „GJ 2027“. Wenn die Freigabe erst im Folgejahr kommt, verschiebt sich die Beschriftung, nicht das Modell.

**Evidenz:** keine externe nötig; Code-Stellen `calc()` Z. 749–760, `drawCumulative()` Z. 1039 ff. · **Konfidenz:** hoch · **Wirkung:** hoch

---

### F2 · Der gesamte Aufbau liegt in Jahr 0 — das ist weder budgetierbar noch machbar (Wirkung hoch)

**Heute:** `c.invest=c.build+c.switch+c.rollout+train0+govOnce` und `c.cf=[c.invest]`. Der **komplette Rollout** aller Bestands-Reports landet im Startjahr. Im Preset „Großkonzern“ sind das 1.200 Reports × 8 Charts = 9.600 Chart-Instanzen. Bei den Panel-Werten für Wiederverwendung (Paid 1 h, Core 4 h) sind das zwischen rund 10.000 und 38.000 Stunden — **in einem Jahr, mit 200 Erstellern**. Rechnerisch belastbar, betrieblich frei erfunden.

**Zwei Folgen:** (a) Der Budgetantrag für Jahr 0 ist unrealistisch hoch und wird allein deshalb zerrissen. (b) Der Barwert bestraft systematisch die aufbaulastigen Ansätze (Deneb, Core), weil deren größter Posten ganz vorne liegt — das verzerrt genau die Kennzahl, die ich in F4 zur Entscheidungsgröße machen will. `grundannahmen-kritik.md` hat das unter „Zeit“ notiert („Jahr 0 trägt den ganzen Aufbau, obwohl Rollouts über zwei Jahre laufen“), es ist aber nicht umgesetzt.

**Vorschlag:** neue globale Annahme **`rolloutYears` · Rollout-Dauer · [1, 2, 3] Jahre**, Badge E (Autoren-Schätzung/Konvention, keine Messung). Im Zahlungsstrom: `setup`, `dev`, `build`, `train0`, `govOnce` bleiben in Jahr 0; `rollout` und `switchCost` werden linear auf `rolloutYears` verteilt (Jahr 0 bis Jahr `rolloutYears-1`). Die nominale Gesamtsumme ändert sich **nicht**, nur Barwert und Jahresprofil. Voreinstellung 2 Jahre, bei Presets „Großkonzern“/„Konzern“ 3.

**Evidenz:** keine externe; `calc()` Z. 748 (`c.invest`), Z. 757 (`c.cf`) · **Konfidenz:** hoch (dass die heutige Verteilung falsch ist), mittel (für die Zahl 2 Jahre) · **Wirkung:** hoch

---

### F3 · Kein Amortisationszeitpunkt gegen „nichts tun“ (Wirkung hoch)

**Heute:** Die Null-Option wird als **Summe über H Jahre** gegen die Summe des besten Ansatzes gestellt, mit drei Aussagevarianten („liegt darunter auch ohne Leserzeit“ / „nur mit Leserzeit ab X Minuten“ / „Status quo ist günstiger“). Ein Break-even gibt es nur **über die Viewer-Zahl** (`drawBreakEven`) und über die Leserminuten — **nicht über die Zeit**. `calcSQ()` liefert nur Summen (`build, maint, read, sup, total`), keinen Jahresvektor.

**Warum das die Freigabe blockiert:** „Amortisiert sich in x Jahren“ ist in jedem mir bekannten Investitionsantrag ein Pflichtfeld. Wenn ein Standard sich erst in Jahr 7 rechnet, ein Horizont von 5 Jahren aber gewählt wurde, ist die 5-Jahres-Summe eine Aussage gegen das Projekt — und der Rechner sagt es nicht, weil er nur Endsummen vergleicht. Umgekehrt: wenn Paid sich schon in Jahr 2 gegen den Status quo trägt, ist das mein stärkstes Argument im Gremium.

**Vorschlag (ohne neue Annahme):** `calcSQ()` gibt zusätzlich `cf[]` zurück — alle vier Posten sind bereits jahresproportional modelliert (`build` über `reportsTotal`, das mit `demand1000`/`demandCreator` über die Jahre wächst; `maint` mit `maintDecay`; `read` und `sup` über `vAvg` je Jahr). Dann:
1. In `drawCumulative` die Null-Option als graue, gestrichelte Linie ergänzen.
2. **Payback-Jahr** je Ansatz = erstes Jahr, in dem die kumulierte Summe des Ansatzes unter der kumulierten Null-Option liegt; als Tabellenzeile „Amortisation gegen Status quo“ mit Werten „Jahr 3“ / „> H“ / „nie“.
3. Zweimal ausweisen: **mit** und **ohne Leserzeit**. Die Leserzeit ist laut eigenem Quellenhinweis „der am wenigsten belegte Wert im ganzen Rechner“ — ein Payback, das nur mit ihr zustande kommt, muss als solcher erkennbar sein.

**Evidenz:** keine externe; `calcSQ()` Z. 773–784, `update()` Null-Option-Block Z. 943–954 · **Konfidenz:** hoch · **Wirkung:** hoch

---

### F4 · Barwert und P90 werden gerechnet, entscheiden aber nichts (Wirkung hoch)

**Heute:** `rankVal(o)` nutzt ausschließlich `sim[o.key].p50` (nominale Summe) gegen den Anforderungs-Score. Der Barwert `c.npv` existiert, wird in der KPI-Karte als Suffix und in einer Tabellenzeile gezeigt — und beeinflusst nichts. P90 wird gezogen und angezeigt, aber ebenfalls nie zur Rangfolge benutzt. Runde 1 hat das bewusst so gelassen („Rangfolge läuft weiter über die nominale Summe; der Barwert steht daneben“).

**Warum ich widerspreche:** Die vier Ansätze haben **strukturell unterschiedliche Zeitprofile** — das ist kein Detail, sondern der Kern des Vergleichs. Paid ist spätes Geld (Lizenz je Jahr, wächst mit Viewern und Preis), Deneb und Core sind frühes Geld (Aufbau). Bei 10 Jahren und dem neuen Default-Zins von 8 % ist der Diskontfaktor in Jahr 10 rund 0,46: die Hälfte der Lizenzlast verschwindet im Barwert. Eine Rangfolge über die nominale Summe behauptet implizit einen Zins von null — und der Rechner selbst hält 5–10 % für richtig (KPMG-Kapitalkostenstudie, Badge S). Zwei Kennzahlen, die sich widersprechen, nebeneinander zu stellen und die schwächere entscheiden zu lassen, ist keine Vorsicht, sondern eine versteckte Annahme.

Dasselbe für das Risiko: ich entscheide nicht auf dem Median. Bei einem Projekt, das schiefgehen darf, entscheide ich auf P50; bei einem, das nicht schiefgehen darf, auf **P90**. Der Rechner hat P90 bereits.

**Vorschlag (ohne neue Annahme):** Segmented Control über dem Ergebnis: **„Entscheidungsgröße: nominale Summe · Barwert · P90 (risikoavers)“**. Der gewählte Wert ersetzt `p50` in `rankVal`, in der Headline, in der großen Zahl der KPI-Karte und in der Sticky-Leiste; die anderen beiden bleiben als Nebenzeilen sichtbar. Dazu ein Satz, wenn sich die Rangfolge beim Umschalten ändert: *„Bei Barwert-Betrachtung tauschen Platz 1 und 2.“* Das ist die ehrlichste Form: nicht eine Kennzahl wählen, sondern zeigen, dass die Wahl die Antwort ändert.

**Evidenz:** keine externe; `update()` Z. 910–912 (`rankVal`), `calc()` Z. 759 (`npv`), KPMG-Zins bereits als Quelle im Rechner · **Konfidenz:** hoch · **Wirkung:** hoch

---

### F5 · CapEx/OpEx, Aktivierung und P&L-Wirkung fehlen (Wirkung hoch im Konzern, mittel im Mittelstand)

**Heute:** eine einzige Fußnote unter der Kostentabelle — *„Aktivierungsfähig wären Setup, Eigenentwicklung und Chart-Aufbau (§ 248 Abs. 2 HGB Wahlrecht, IAS 38); hier nicht modelliert.“* — plus der Hinweis im Footer, dass Aktivierung/Abschreibung nicht enthalten sind. Korrekt benannt, aber nicht gerechnet.

**Warum das entscheidungsrelevant ist:** Der Vergleich verändert sich, sobald man ihn nicht in Cash, sondern in GuV-Wirkung je Jahr liest — und **im Konzern lese ich ihn so, weil das EBIT die gesteuerte Größe ist**:

- **Lizenzen sind niemals aktivierbar.** Sie belasten die GuV in voller Höhe in jedem Jahr, in dem sie anfallen.
- **Selbst erstellte Entwicklungsleistung ist im HGB-Abschluss aktivierbar** — § 248 Abs. 2 S. 1 HGB als **Wahlrecht**, begrenzt auf die Herstellungskosten der Entwicklungsphase nach § 255 Abs. 2a HGB; Forschung bleibt Aufwand. **Nach IAS 38 ist die Aktivierung Pflicht**, sobald die Kriterien erfüllt sind. Für den Konzern-CFO heißt das: Der interne Stundenaufwand für Setup, Eigenentwicklung und den erstmaligen Aufbau der Chart-Standards drückt nicht das EBIT des laufenden Jahres, sondern läuft über die Nutzungsdauer ab.
- **In der Steuerbilanz gilt das Gegenteil:** § 5 Abs. 2 EStG erlaubt den Ansatz immaterieller Wirtschaftsgüter nur bei entgeltlichem Erwerb — selbst geschaffene sind verboten. Ergebnis: Auseinanderfallen von Handels- und Steuerbilanz, latente Steuern.
- **Praktische Hürde, die ins Werkzeug gehört:** Aktivierung setzt eine **verlässliche Stundenerfassung je Projekt** voraus. Wer die nicht hat, kann nicht aktivieren — und die schöne EBIT-Entlastung ist Theorie. Das muss der Rechner sagen, sonst verspricht er etwas, das die Buchhaltung nachher nicht liefert.

**Vorschlag (Darstellung, keine neue Annahme; eine Konvention):**
1. Jeden Kostenposten klassifizieren: **aktivierungsfähig** = `setup`, `dev`, `build`, plus optional der Erstausstattungsanteil des Rollouts; **sofort Aufwand** = Lizenz, Support, Capacity, Schulung, Governance, Wartung, Risiko, Migration. (Schulung ist unstrittig Aufwand, Migration in aller Regel auch.)
2. Schalter **„Interne Entwicklungsstunden aktivieren (HGB-Wahlrecht / IFRS-Pflicht)“**, Default aus, und ein Feld **Nutzungsdauer** (3 · 5 Jahre, Konvention, klar als solche beschriftet).
3. Zweite Ergebniszeile: **„GuV-Belastung je Jahr“** neben „Auszahlung je Jahr“ aus F1 — Abschreibung statt Einmalaufwand, Lizenz unverändert.
4. Ein Satz Warnung: *„Aktivierung setzt projektbezogene Stundenerfassung voraus und ist mit dem Abschlussprüfer abzustimmen. Keine Bilanz- oder Steuerberatung.“*

**Evidenz:** § 248 Abs. 2, § 255 Abs. 2a HGB, § 5 Abs. 2 EStG, IAS 38 — Volltext über den Proxy nicht abrufbar (`gesetze-im-internet.de` blockiert), inhaltlich über Suchtreffer gegengeprüft: https://dejure.org/gesetze/HGB/248.html · https://www.haufe.de/id/beitrag/immaterielle-vermoegensgegenstaende-des-anlagevermoegens-in-4-ausweis-immaterieller-vermoegensgegenstaende-in-der-steuerbilanz-HI13933306.html · **Konfidenz:** hoch (Rechtslage), mittel (Zuordnung der Posten im Einzelfall) · **Wirkung:** hoch (Konzern/IFRS), mittel (Mittelstand/HGB)

---

### F6 · Keine Kapazitätsaussage: Euro ja, FTE nein (Wirkung hoch)

**Heute:** Stunden erscheinen genau zweimal — `firstReportH` („erster Standard-Report ≈ X h“) und `nextReportH`. Die **Gesamtstunden** eines Ansatzes werden gerechnet (jeder stundenbasierte Posten entsteht als Stunden × Satz), aber sofort in Euro umgerechnet und nie zurückgegeben.

**Warum das die Freigabe blockiert:** Meine erste Rückfrage an den Controlling-Leiter lautet nie „was kostet das“, sondern **„wer macht das?“**. Diese Projekte scheitern nicht am Geld, sondern daran, dass die drei Leute, die es können, schon im Monatsabschluss stecken. Der Rechner verkauft mir den günstigsten Ansatz — und der günstigste ist meist der stundenintensivste (Core, Deneb), also genau der, der an meiner knappsten Ressource zieht. Der Rechner macht diesen Zielkonflikt heute unsichtbar, weil er Stunden und Euro in einer Zahl verschmilzt. Der `intFactor` (60 = Kapazität frei, 150 = verdrängt Fachaufgaben) adressiert genau das — **bewertet** es aber nur, statt es **zu zeigen**, und steht per Default auf 100.

**Vorschlag (ohne neue Annahme, eine Konvention):**
1. In `calc()` einen Stundenzähler mitführen: `c.hoursInt` (interne Stunden gesamt) und `c.hoursIntY[y]` (je Jahr), analog zum Cash-Vektor aus F1.
2. Ausgabe je Ansatz: **„≈ X.XXX interne Stunden über H Jahre ≈ Y,Y FTE im Jahr des Aufbaus, Z,Z FTE im Betrieb“**, bei 1.500 h/Jahr als offen benannter Konvention (konsistent zum `rateInt`-Quellenhinweis, der mit 1.500–1.600 produktiven Stunden rechnet).
3. Warnhinweis, wenn die Aufbaustunden je Jahr die eingegebene Erstellerzahl × einen plausiblen Standard-Anteil überschreiten — in der Sprache des Rechners eine Warnung, kein K.O.: *„Dieser Ansatz bindet im Aufbaujahr 1,8 FTE bei 3 Erstellern. Prüft die Kapazität, bevor ihr die Kosten prüft.“* Dieser Hinweis ist mit F2 gekoppelt: Wer den Rollout auf 2–3 Jahre streckt, entschärft ihn.

**Evidenz:** keine externe; `calc()` durchgehend, `GLOBAL.intFactor` Z. 534 · **Konfidenz:** hoch · **Wirkung:** hoch

---

### F7 · USD-Preise, aber keine Währungsannahme (Wirkung mittel–hoch)

**Heute:** Die Lizenz-Quellenhinweise nennen durchgehend Dollarpreise — „Inforiver Analytics+ 2,40–3 $/Nutzer/Monat“, „Zebra BI Personal 299 $/Jahr, Team 799 $/Jahr“, „Inforiver Domain-wide ab 12.000 $/Jahr“ — und lösen das mit einem Halbsatz auf: **„1 $ ≈ 1 € konservativ“**. `licInfl` [0 · 4 · 12] deckt ausdrücklich nur die Preisanpassung des Anbieters ab („Vendor-Preisanpassung, Preissprünge bei Vertragswechsel“).

**Warum das zählt:** Bei Paid ist die Lizenz im Großkonzern-Preset der mit Abstand größte Posten. Ein Wechselkurs ist über 5 bis 10 Jahre keine Nebensache, und „1 $ = 1 €“ ist keine konservative Annahme, sondern **eine unausgesprochene Punktschätzung**, die je nach Kursniveau um zehn bis zwanzig Prozent in die eine oder andere Richtung danebenliegt. Ich nenne bewusst keinen Tageskurs — der gehört nicht in ein Modell mit fünfjährigem Horizont, und ich habe ihn nicht verifiziert. Aber die **Spanne** gehört hinein, denn genau nach ihr fragt mein Treasury.

**Vorschlag:** neue globale Annahme **`fxLic` · „Wechselkurs-Effekt auf Lizenzen (Anbieter fakturiert in USD)“ · Faktor [0,85 · 1,00 · 1,20]**, Badge E, wirksam als Multiplikator auf `lic` und `licSite` (zwei Zeilen in `calc()`). Quellenhinweis: *„Zebra BI und Inforiver veröffentlichen Dollarpreise; der Rechner setzt bislang still 1 $ = 1 €. Die Spanne bildet Kursschwankung über den Horizont ab, nicht den Tageskurs. Wer in Euro kontrahiert hat, setzt 1,00 · 1,00 · 1,00.“* Rechtsschiefe (bis 1,20) ist beabsichtigt: Der Fall, der wehtut, ist der teure Dollar. Zusätzlich in die „versteckte Kosten“-Liste bei Paid: **in Euro kontrahieren oder eine Kursklausel verhandeln** — das ist eine der wenigen Stellen, an denen der Einkauf ohne Preisnachlass Geld spart.

**Evidenz:** die Dollarpreise stehen in den `srcNote`-Feldern des Rechners selbst (`OPTP.lic`, `OPTP.licSite`); Herstellerseiten waren schon in Runde 1 über den Proxy nicht abrufbar und sind es weiterhin · **Konfidenz:** hoch (dass die Annahme fehlt), niedrig (für die konkrete Bandbreite) · **Wirkung:** mittel–hoch bei Paid mit vielen Nutzern, null sonst

---

### F8 · Vertragsbindung und Ausstiegskosten fehlen — und damit der halbe Wert eines Pilotprojekts (Wirkung mittel–hoch)

**Heute:** Es gibt keine Mindestlaufzeit, keine Kündigungsfrist, keine Ausstiegskosten. Migration erscheint nur als `switchCost` **zu Beginn** (Wechsel vom heutigen Ansatz, gesteuert über `S.baseline`/`S.existing`). Das Abkündigungsrisiko `dep` modelliert, dass der **Anbieter** aufgibt — nicht, dass **wir** aussteigen wollen. `grundannahmen-kritik.md` hat das als Prämisse P8 markiert („Die Entscheidung fällt einmal, zu Beginn, für H Jahre… kein Optionswert“), Runde 1 hat es bewusst nicht umgesetzt.

**Warum ich widerspreche:** Der wichtigste Satz in jeder Vorlage, die ich unterschreibe, lautet „und wenn es nicht funktioniert, kostet der Rückweg X“. Der Rechner blendet eine **fundamentale Asymmetrie** aus:

- **Ausstieg aus Paid:** Report-Definitionen hängen am Visual — der Rechner sagt das selbst in der Nachteilsliste („Wechsel bedeutet Neubau“). Der Rückweg kostet den **kompletten Nachbau** aller bis dahin ausgerollten Reports, plus die Restlaufzeit des Vertrags.
- **Ausstieg aus Deneb/Core:** Der Rückweg heißt „wir kaufen jetzt doch Lizenzen“ — teuer, aber sofort und ohne Restlaufzeit.

Wer das sieht, entscheidet anders: nicht „welcher Ansatz ist über fünf Jahre am billigsten“, sondern „mit welchem Ansatz fange ich an, ohne mich einzumauern“. Genau das ist die Entscheidung, die im Gremium tatsächlich fällt.

**Vorschlag (ohne neue Stundenannahme):**
1. Neuer Schalter bei Paid: **Mindestvertragslaufzeit 12 / 36 Monate** (Auswahl, keine Dreipunkt-Schätzung nötig).
2. Neue Tabellenzeile **„Ausstieg nach Jahr 2“** je Ansatz = Restlaufzeit-Lizenz (bei Paid) + bis dahin ausgerollte Reports × `cpr` × `reuseH` des zweitplatzierten Ansatzes × `migFactor`. Alle Bausteine existieren; es ist eine Wiederverwendung der `switchCost`-Formel mit vertauschten Rollen.
3. Ein Satz in der Headline, wenn die Asymmetrie groß ist: *„Der Rückweg aus Platz 1 kostet X, der Rückweg aus Platz 2 kostet Y. Bei enger Rangfolge ist das das stärkere Argument als die 5-Jahres-Summe.“*

**Evidenz:** keine externe; `TEXT.paid.con` (Rechner-eigene Aussage zur Bindung), `calc()` Z. 723 (`switchCost`) · **Konfidenz:** hoch (Asymmetrie), mittel (Höhe) · **Wirkung:** mittel–hoch

---

### F9 · Steuern: Reverse Charge und § 50a EStG nur als Fußnote — für manche Branchen ein echter Aufschlag (Wirkung mittel, hoch für Betroffene)

**Heute:** Der Footer listet „steuerliche Fragen (z. B. § 50a EStG bei Lizenzen ausländischer Anbieter)“ unter „nicht enthalten“. Sonst nichts.

**Was inhaltlich gilt (und was der Rechner daraus machen sollte):**
- **§ 50a EStG:** Der Steuerabzug bei beschränkt Steuerpflichtigen greift nach dem BMF-Schreiben vom 27.10.2017 zur grenzüberschreitenden Software- und Datenbanküberlassung nur, wenn **umfassende Verwertungsrechte** zur eigenständigen wirtschaftlichen Verwertung eingeräumt werden. Die reine Endnutzerlizenz eines Power-BI-Visuals fällt üblicherweise **nicht** darunter. Das ist eine Entwarnung — aber eine, die der Steuerabteilung vorgelegt werden muss, nicht eine, die man stillschweigend unterstellt. Für den Fall, dass der Vertrag doch Verwertungsrechte enthält: 15 % Abzug plus SolZ, in der Praxis über eine Freistellungsbescheinigung oder eine Gross-up-Klausel im Vertrag geregelt — die Klausel verteuert die Lizenz für uns.
- **Reverse Charge (§ 13b UStG):** Bei Leistungen ausländischer Anbieter schuldet der deutsche Leistungsempfänger die Umsatzsteuer. **Für einen voll vorsteuerabzugsberechtigten Industriekonzern ist das ein Nullsummenspiel** — deshalb ist es richtig, dass der Rechner netto rechnet. **Für eine Bank, eine Versicherung, ein Krankenhaus oder eine öffentliche Einrichtung ist es keines:** Bei eingeschränktem Vorsteuerabzug wird die Umsatzsteuer zu echten Kosten, die Lizenz verteuert sich um bis zu 19 %. Das ist kein Randfall — Finanzdienstleister und öffentliche Hand sind eine relevante Zielgruppe für IBCS-Standards.

**Vorschlag:** neuer Red-Flag-Schalter (Typ `modifier`, wie `noext`): **„Kein voller Vorsteuerabzug (Bank, Versicherung, öffentliche Hand)“** → erhöht alle **harten Auszahlungen** (Lizenz, Support, Capacity, Kurse, externe Stunden) um den nicht abziehbaren Anteil; Feld mit Default 19 %, weil der Vorsteuerschlüssel je Haus unterschiedlich ist. Zusätzlich in `TEXT.paid.hidden` zwei Zeilen: *„Ausländischer Lizenzgeber: § 50a-Prüfung durch die Steuerabteilung, Freistellungsbescheinigung oder Gross-up-Klausel“* und *„Reverse Charge ist nur bei vollem Vorsteuerabzug neutral“*.

**Evidenz:** https://www.deloitte-tax-news.de/steuern/unternehmensteuer/bmf-grenzueberschreitende-software--und-datenbankueberlassungen2.html · https://www.haufe.de/steuern/finanzverwaltung/bmf-grenzueberschreitende-ueberlassung-von-software_164_429698.html (BMF v. 27.10.2017, IV C 5 - S 2300/12/10003 :004); § 13b und § 15 Abs. 2 UStG im Volltext über den Proxy nicht abrufbar · **Konfidenz:** hoch (Grundaussagen), mittel (Anwendung im Einzelfall — das entscheidet die Steuerabteilung, nicht der Rechner) · **Wirkung:** mittel; hoch für Häuser ohne vollen Vorsteuerabzug

---

### F10 · Keine Entscheidungsvorlage, kein Business-Owner (Wirkung mittel)

**Heute:** Das Werkzeug endet mit Charts, Tabelle, Textbausteinen, Share-Link und Excel-Export. Das Blatt „Lesen zuerst“ ist vorbildlich (Zweck, Offenlegung, Quellenlage, geänderte Annahmen, ungeprüfte Musts, „was diese Zahl nicht sagt“) — aber es steht **kein Name darauf**: kein Antragsteller, kein Business-Owner, kein Entscheider, kein Budgetjahr, kein Datum der Vorlage. Es gibt auch keine Druckansicht der Ergebnisseite (`@media print` existiert nur in der erzeugten Monte-Carlo-Seite).

**Warum das zählt:** Was ich unterschreibe, ist ein Dokument mit einem Verantwortlichen. Ohne benannten Business-Owner ist ein visueller Standard ein Hobby der BI-Abteilung — und genau daran sterben diese Initiativen: Das Werkzeug wird gekauft, die Vorlagen werden gebaut, und nach achtzehn Monaten baut wieder jeder seine eigenen Charts, weil niemand die Einhaltung verantwortet. Die laufenden Governance-Stunden, die der Rechner sauber einpreist (`govRun`, `govAudit`, `variantG`), unterstellen implizit, dass jemand diese Rolle hat. Der Rechner sollte danach fragen.

**Vorschlag (ohne jede neue Rechnung):**
1. Drei Freitextfelder: **Business-Owner (fachlich verantwortlich für den Standard), Antragsteller, Entscheidungsgremium/Budgetjahr.** In Share-Link, Excel-Deckblatt und Druckansicht.
2. Eine einseitige **Druckansicht „Entscheidungsvorlage“**, die ausschließlich aus bereits Berechnetem besteht: Empfehlung mit einem Satz Begründung · Cash-out je Jahr, getrennt hart/weich (F1) · FTE-Bedarf (F6) · Payback gegen Status quo (F3) · Ausstiegskosten (F8) · die drei größten Unsicherheiten aus dem Tornado-Chart · K.O.-Kriterien und ungeprüfte Musts · Owner und Datum · der bestehende Satz „Alle Zahlen sind Indikationen unter Unsicherheit, keine Angebote“.
3. Ergänzend die **Nutzenseite ehrlich einordnen**: Der Rechner vergleicht vier Wege zum selben Ziel — der Nutzen kürzt sich in der Rangfolge heraus und steckt allein im Vergleich gegen die Null-Option. Das sollte auf der Vorlage stehen, sonst liest ein Gremium die Kostenrangfolge als Business Case. Eine Euro-Bezifferung vermiedener Fehlentscheidungen wäre erfunden; sie gehört ausdrücklich **nicht** ins Modell. Der eine belastbare Nutzenhebel, die Leserzeit, ist bereits vorhanden, abschaltbar und getrennt ausgewiesen — das ist die richtige Behandlung und sollte auf der Vorlage genauso getrennt erscheinen.

**Evidenz:** keine externe; `buildXlsx()` Blatt „Lesen zuerst“ Z. 1102, `renderSources()` Footer · **Konfidenz:** hoch · **Wirkung:** mittel (für die Wirksamkeit des Werkzeugs im Gremium hoch)

---

## Was ich bewusst nicht fordere

- **Euro-Bezifferung vermiedener Fehlentscheidungen.** Ohne Datengrundlage wäre das eine frei gewählte Zahl, die den ganzen Rechner unglaubwürdig macht. Der Anforderungs-Score plus „€ je Anforderungspunkt“ ist die ehrlichere Näherung.
- **Restwert der aufgebauten Vorlagen am Horizontende.** Theoretisch richtig (`grundannahmen-kritik.md`, P7), praktisch nicht schätzbar und in beide Richtungen manipulierbar.
- **Ein weiterer Ansatz oder ein Koexistenz-Modell (80 % Paid + 20 % Deneb).** Aus CFO-Sicht wäre das realistisch, erhöht aber die Komplexität des Werkzeugs stärker, als es die Entscheidung verbessert. Der Pilot-Preset deckt den Einstieg ab.
- **Präzisere Lizenzpreise.** Das ist Einkaufsarbeit, kein Modellproblem: Die Verhandlungsgrenze (Indifferenz-Lizenzpreis) im Break-even-Chart ist dafür bereits das richtige Instrument — sie sagt dem Einkauf, welchen Preis er erreichen muss, damit Paid gewinnt. Das ist besser als jede Preisrecherche.

## Reihenfolge der Umsetzung, wenn die Zeit bis zum 14.10.2026 knapp ist

1. **F1 + F4** zusammen (Cash-out-Tabelle je Jahr, hart/weich getrennt, plus Umschalter der Entscheidungsgröße) — beides nutzt vorhandene Größen, zusammen sind das die zwei Zahlen, ohne die kein Antrag durchgeht.
2. **F3** (Payback gegen Status quo) — kleiner Eingriff in `calcSQ`, größter Erklärwert auf der Bühne.
3. **F6** (FTE) — ein Zähler in `calc()`, beantwortet die häufigste Rückfrage aus dem Publikum.
4. **F2** (Rollout strecken) — verbessert F1 und F4 rückwirkend.
5. **F10** (Entscheidungsvorlage) — reine Darstellung, hoher Nutzen als Konferenz-Mitnahme.
6. **F5, F8, F9, F7** — inhaltlich wichtig, aber je Thema eine eigene Diskussion; F9 und F7 sind je ein Schalter und eine Annahme.
