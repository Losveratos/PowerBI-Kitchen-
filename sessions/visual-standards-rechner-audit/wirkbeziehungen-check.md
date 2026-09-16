# Wirkbeziehungs-Check · Visual-Standards-Rechner v0.16

**Prüfer:** unabhängige Gegenlesung, 15.09.2026
**Prüffrage:** Fehlt eine Ursache-Wirkungs-Kette, die in der Realität das Ergebnis spürbar verschiebt und die das Modell nicht kennt oder falsch verknüpft?
**Nicht geprüft:** Höhe einzelner Zahlen, Oberfläche, Bedienung, Quellenqualität je Annahme.
**Grundlage:** `md/visual-standards-rechner.md`, `sessions/visual-standards-rechner-audit/kernaussagen.md`, Gegenprobe im Code (`calc()` Z. 1001–1214, `GLOBAL` Z. 733, `OPTP` Z. 760, `modeParams()` Z. 800, `licenseBreakEven()` Z. 2370 in `visual-standards-rechner.html`).

---

## Überblick

| # | Wirkkette (Kurzform) | Trifft vor allem | Größenordnung | Status | Wirkt zugunsten von |
|:--|:--|:--|:--|:--|:--|
| 1 | Report-Klassen senken die Stunden von Paid, lassen die Lizenzmenge aber bei 100 % der Viewer | Paid | zweistellig %, verschiebt den Kipp-Punkt direkt | falsch verknüpft (einseitig angewandte Mechanik) | OSS / Deneb (= Autoren) |
| 2 | Menge und Komplexität der Reports sind preisunelastisch — teure Ansätze bauen in der Realität weniger und einfacher | Core, Deneb | 10–40 % der Menge, plus eine verdeckte Leistungsdifferenz | fehlt ganz | Paid |
| 3 | Stundenbedarf → interner Durchsatz → Rollout-Dauer und externer Satz; Rollout-Tempo ist im Modell eine Eingabe | Core, Deneb, große Presets | verschiebt Amortisation und Barwert um Jahre | falsch verknüpft (Warnung ohne Rückkopplung) | Core, Deneb |
| 4 | Schlüsselpersonen: Fluktuation ist ansatzunabhängig und linear, es gibt keine Gefahrenrate für den Wissensträger | Deneb, Core, kleine Teams | im Pilot/Mittelstand 5–15 % | fehlt ganz | Deneb / OSS (= Autoren) |
| 5 | Bestand → Bindung → Verhandlungsmacht des Anbieters → Preissprung bei Vertragsverlängerung | Paid, H = 10 | Tail-Risiko, P90 | falsch verknüpft (glatte Rate statt Sprung, ohne Kopplung an `lockIn`) | Paid |
| 6 | Organisationales Lernen verfällt nicht mit der Fluktuation — `learn` und `churn` sind unverbunden | Deneb, Core, H = 10 | 10–20 % der Rollout-Stunden | teils fehlend, teils durch `rampH` abgedeckt | Deneb, Core (= Autoren) |
| 7 | Capacity-Mehrverbrauch ist ein konstanter Prozentsatz einer konstanten Basis, obwohl Bestand und Viewer bis 10× wachsen; keine SKU-Stufe | Core | nur bei eingetragener Capacity, dort 2–5× | falsch verknüpft | Core |

---

## Fund 1 · Die Lizenzmenge kennt die Report-Klassen nicht

> **Status 15.09.2026: umgesetzt in v0.18.** Neue globale Annahme `licViewerShare` (60 · 85 · 100 %), reduzierte Lizenzbasis `ueL` fuer Lizenz, Lizenz-Administration und `licUserYears`; Governance, Support und Leserzeit bleiben an der vollen Viewer-Zahl; mit IBCS-Pflicht zwingend 100 %; Site-Lizenz unberuehrt. Der Kipp-Punkt stieg dadurch von 1 : 9–1 : 19 auf 1 : 11–1 : 22. Details in `md/visual-standards-rechner.md`, Abschnitt v0.18. Funde 2 bis 7 sind offen.

**(a) Wirkkette.** Seit v0.14 läuft die Klasse A (Default 45 % der Reports) in jedem Ansatz über Core-Stunden — die Lizenz wird aber unverändert für **alle** Viewer plus Ersteller berechnet, obwohl diese Viewer für die operativen Reports kein gekauftes Visual brauchen.

**(b) Relevanz.** Im Code: `const users=S.creators+S.viewers`, `const v=vY(y),u=v+S.creators,ue=packU(u)` und `licY=ue*iy*p('lic')*staffelD(ue)`. Die Lizenzbasis ist die volle, gedeckelte Viewerzahl, unabhängig von `rcF[]`, `shCore` und `ibcsAll`. Die Kernaussagen nennen die Lizenz je Viewer als einen von drei Treibern und den Kipp-Punkt (heute 1 : 9 bis 1 : 19) als die Kernzahl des Rechners; `licenseBreakEven()` rastert genau diese Viewerzahl ab. Wenn nur 55–70 % der Leser überhaupt einen IBCS-Report öffnen, fällt der Lizenzblock von Paid um 30–45 % und der Kipp-Punkt verschiebt sich in derselben Größenordnung. Das ist größer als jeder andere hier genannte Effekt und größer als die meisten der 57 Annahmen. Die Asymmetrie ist neu und hausgemacht: v0.14 hat die Klassenmechanik auf die Stundenseite gelegt und die Mengenseite der Lizenz nicht angefasst — und die Kernaussagen berichten den daraus gefallenen Kipp-Punkt als Ergebnis, ohne zu benennen, dass er nur auf einer Seite gerechnet wurde.

**(c) Status.** Falsch verknüpft, nicht fehlend: die Klassenanteile sind da, die Lizenz greift nicht darauf zu.

**(d) Abbildung.** Ein Feld `licViewerShare` (Anteil der Viewer, die mindestens einen Report der Klassen B/C öffnen), Default aus den Klassenanteilen abgeleitet und nach oben übersteuerbar:
`licY = packU(creators + v*licViewerShare) * ...`, mit `licViewerShare = 1`, sobald „IBCS verbindlich für alle Reports" gesetzt ist. Governance, Anwender-Support, Zugriffs-Governance und Leserzeit bleiben an der vollen Viewerzahl — genau diese Trennung fehlt heute, weil eine einzige Zahl Lizenzbasis, Support-Basis, Governance-Basis und Nutzenbasis zugleich ist.

**(e) Evidenz.** Such-Snippet (Klasse S, dieselbe Klasse wie die Preisannahmen des Modells): die Zebra-BI-Knowledge-Base beschreibt den Umfang als „any designer of Zebra BI reports and any end-user, who **might access the Zebra BI reports** (consumer)" und führt dazu einen eigenen Artikel „Do I need to cover all the users in our company who have a Power BI PRO license?" — der Umfang ist also an den Zugriff auf Zebra-Reports gebunden, nicht an den Tenant. Inforiver lizenziert „all unique users who would create, **or view reports created with Inforiver**". Die Seiten selbst (`help.zebrabi.com`, `inforiver.com`) sind in dieser Prüfumgebung blockiert; belegt ist damit nur der Snippet, nicht der Wortlaut. **Gegenargument, das ins Modell gehört:** „might access" ist weit, ein unlizenzierter Leser bekommt ein Wasserzeichen statt eines Charts, und Einkauf und Revision neigen zur Vollabdeckung. Die Wahrheit liegt zwischen den beiden Extremen — das Modell sitzt heute ohne Regler auf dem teuren Extrem.

---

## Fund 2 · Menge und Anspruch der Reports sind preisunelastisch

**(a) Wirkkette.** Je teurer eine Stunde je Chart, desto weniger und desto einfachere Charts entstehen — im Modell entstehen in allen vier Ansätzen exakt dieselben Reports mit demselben Komplexitätsmix.

**(b) Relevanz.** `demand1000` trägt im Rechner die Beschriftung „Nachfrage wächst mit der Leserzahl, **unabhängig vom Werkzeug**"; `n=(ye<RY?S.reports/RY:0)+g('demand1000')*(v/1000)+g('demandCreator')*S.creators` ist in allen vier Ansätzen identisch, ebenso der Klassen-Mix. Real gilt beides nicht: bei 4 h je wiederverwendetem Chart und Faktor 3,5 auf komplexe Charts baut niemand 40 % Wasserfälle mit Szenario-Notation — er baut eine gestapelte Säule und schreibt den Rest in eine Fußnote. Umgekehrt zieht ein Klickwerkzeug Nachfrage an, die es ohne das Werkzeug nicht gäbe. Beide Richtungen treffen den Kern des Vergleichs: er unterstellt gleiche Leistung bei unterschiedlichem Preis, real ist es unterschiedliche Leistung bei ähnlichem Budget. Größenordnung: bei einer Preiselastizität von nur −0,3 auf den Grenzaufwand je Chart (Core ≈ 4× Paid) baut Core rund 30 % weniger Standard-Charts — das ist mehr, als die Report-Klassen-Mechanik insgesamt bewegt hat.

**(c) Status.** Fehlt ganz. Der Adoptionsgrad ist **nicht** dasselbe: er lenkt Charts am Standard vorbei, aber die Gesamtmenge bleibt.

**(d) Abbildung.** Am ehrlichsten als zweite Lesart statt als neuer Parameter: ein Schalter „Mengengerüst ist Bedarf (fix)" gegen „Budget ist fix" — im zweiten Fall wird nicht € je Viewer, sondern **Standard-Charts je 100 k€** ausgegeben, gerechnet mit dem vorhandenen `c.nextReportH` (Grenzaufwand am Bestand des letzten Jahres). Wer eine Elastizität will: `n_eff = n * (h_ref/nextReportH)^ε` mit ε 0,2 · 0,3 · 0,5 und `h_ref` = Grenzaufwand des günstigsten zulässigen Ansatzes; für den Klassen-Mix analog eine Verschiebung von C nach B.

**(e) Evidenz.** Keine Evidenz, Plausibilitätsargument (Preis-Mengen-Reaktion). Belegbar ist nur die Richtung, nicht ε.

---

## Fund 3 · Der Rollout hat kein Tempolimit

**(a) Wirkkette.** Ein Ansatz mit dem Vierfachen an Stunden braucht viermal so viel Durchsatz — im Modell rollt er trotzdem in denselben `rolloutYears` aus, mit demselben Anteil externer Stunden und demselben Stundensatz.

**(b) Relevanz.** Der Rechner **kennt** den Engpass bereits: er rechnet `hoursIntY`, `fteY1` und `capWarn=hoursIntY[0]>S.creators*1500*0.3` und schreibt „⚠ Das Team hat dafür keine Kapazität neben dem Tagesgeschäft". Die Warnung hat aber keinen Rückweg in die Rechnung: `RY` bleibt Eingabe, `ext` bleibt ein fester Prozentsatz je Ansatz. Real entscheidet sich an dieser Stelle dreierlei: die Amortisation gegen die Null-Option verschiebt sich um Jahre (und genau dafür wurde v0.12 gebaut), der Grenzsatz der zusätzlichen Stunden ist der externe (118 statt 82 €/h, +44 %), und der Status quo läuft länger parallel weiter. Im Großkonzern-Preset (1.200 Bestands-Reports) ist der Unterschied zwischen „geht in 2 Jahren" und „geht in 6 Jahren" eine Aussage, die der Rechner heute nicht macht, obwohl er die Zahlen dafür hat.

**(c) Status.** Falsch verknüpft — Kennzahl vorhanden, Rückkopplung fehlt.

**(d) Abbildung.** Zwei Zeilen im Jahresschleifen-Kern, ohne neue Annahme:
`kap = owners*1500*verfügbar` (verfügbar als vorhandener Faktor 0,3); wenn `hoursIntY[y] > kap`, dann entweder (i) den Überhang des Bestandsrollouts ins Folgejahr schieben — `RY_eff` wird endogen — oder (ii) den Überhang mit `rateExt` statt `rate0` bewerten. Variante (ii) ist der kleinere Eingriff und zeigt den Effekt sofort im Cash-out.

**(e) Evidenz.** Erfahrungswissen (Kapazität ist in BI-Teams der übliche Engpass, nicht Budget) plus Modell-interne Konsistenz: der Rechner warnt selbst vor der Situation, die er nicht bepreist.

---

## Fund 4 · Kein Schlüsselpersonen-Risiko, obwohl es ein Werkzeug-Risiko gibt

**(a) Wirkkette.** Das Wissen der Code-Ansätze liegt bei ein bis zwei Personen; geht diese Person, steht der Standard — im Modell kostet ihr Abgang nur `churn × (Schulung + Einarbeitung)`, linear und mit einer für alle vier Ansätze identischen Fluktuationsrate.

**(b) Relevanz.** Das Modell hat für das **Werkzeug** eine saubere Gefahrenrate (`dep`, Ereignisjahr, Schaden am Bestand dieses Jahres) und für den **Menschen** nur eine lineare Durchschnittsrechnung: `trainRunH=(churn/100)*(owners*(trainHe+rampH)+...)`. `ownersOf()` liefert mindestens 2 Personen, `churn` ist eine globale Annahme (5 · 11 · 22 %) ohne Ansatzbezug. Im Pilot- und Mittelstands-Preset sind das für Deneb rund 0,11 × 2 × (35 + 70) ≈ 23 h im Jahr — der reale Fall ist nicht „23 Stunden", sondern „der Vega-Mensch ist weg, sechs Monate lang entsteht kein neues Template, und was entsteht, entsteht ad hoc". Genau diese Asymmetrie ist die Hauptkritik, die Controlling-Bereiche gegen Deneb und SVG-Measures vorbringen, und sie ist im Modell nicht bepreist. Dazu kommt die Preisseite: es gibt **einen** internen Stundensatz für alle vier Ansätze, obwohl Vega- und DAX-SVG-Kompetenz knapper ist als Klick-Kompetenz. Teilweise abgedeckt ist das über den höheren Externanteil bei Deneb (40 % gegen 25 %), aber nicht für die intern gehaltene Kompetenz.

**(c) Status.** Fehlt ganz (Gefahrenrate Mensch, Ansatzbezug der Fluktuation, Knappheitsaufschlag auf den Satz).

**(d) Abbildung.** Spiegelbildlich zu `dep`, mit vorhandenen Größen:
`keyHaz = churn/100 × konzentration`, mit `konzentration = 1/owners` (bei 2 Vorlagen-Bauern voll, bei 20 diversifiziert), Schaden im Ereignisjahr = `rampH + Anteil × (Rollout des Folgejahres zu Null-Options-Sätzen)`. Alternativ minimal-invasiv: `churn` je Ansatz mit einem Faktor belegen und `rampH` im Ereignisjahr einmalig statt geglättet buchen.

**(e) Evidenz.** Erfahrungswissen; keine Messung. Die Richtung — Wissenskonzentration steigt mit der Spezialisierung des Werkzeugs — ist im Modell bereits implizit anerkannt (`rampH` Deneb 24 · 70 · 180 h gegen Paid 8 · 16 · 40 h), nur nicht als Risiko, sondern als Durchschnitt.

---

## Fund 5 · Preissteigerung ohne Verhandlungsmacht

**(a) Wirkkette.** Je größer der ausgerollte Bestand und je höher die Bindung, desto mehr Preissetzungsmacht hat der Anbieter bei der Verlängerung — im Modell ist `licInfl` eine glatte, exogene Jahresrate ohne Bezug zu `lockIn`, `minTerm` oder Bestandsgröße.

**(b) Relevanz.** Code: `inf=1+p('licInfl')/100` und `iy=Math.pow(inf,y)` — geometrisch, einmal je Szenario gezogen, in jedem Jahr gleich. Die eigene Quellennotiz des Modells sagt aber ausdrücklich das Gegenteil: „Erhöhungen kommen als **Modellwechsel**", belegt mit Inforiver 150 → 245 $/Monat (+63 %) und Power BI Pro +40 % zum 01.04.2025. Das Modell hat also die richtige Beobachtung und die falsche Mechanik: Sprünge an der Vertragsgrenze, deren Höhe mit der Wechselhürde steigt, statt 5 % pro Jahr. Für den Erwartungswert ändert das wenig, für P90 bei H = 10 viel — und die Kernaussagen verkaufen P90 als „konservative Lesart". Die Gegenrichtung fehlt ebenso: dass eine glaubhafte Alternative im Haus (eine funktionierende Deneb- oder OSS-Fähigkeit) den Preis deckelt, steht als Ausgabe da (Verhandlungsgrenze), wirkt aber nicht auf die Kosten.

**(c) Status.** Falsch verknüpft.

**(d) Abbildung.** `iy` als Treppe statt Exponent: Preis konstant innerhalb der Vertragsperiode, an jeder `minTerm`-Grenze ein Sprung `1 + s`, mit `s = licInfl × minTerm × (0,5 + lockIn)`. Keine neue Annahme, nur eine andere Verteilung derselben Rate über die Zeit — und ein spürbar breiteres oberes Band.

**(e) Evidenz.** Belegt (S) über die im Modell bereits zitierten Preisereignisse; die Kopplung an `lockIn` ist Plausibilitätsargument ohne Messung.

---

## Fund 6 · Gelernt wird für die Ewigkeit

**(a) Wirkkette.** Fluktuation nimmt Erfahrung mit — im Modell wächst `K` (kumulierte Charts je Ersteller) monoton und gibt den Lernkurvenrabatt bis zur Untergrenze 0,5 dauerhaft weiter, egal wie viele Ersteller inzwischen gewechselt haben.

**(b) Relevanz.** `dK=Cy*ad/max(1,S.creators); K+=dK; lrnF=learnSeg(K,K+dK)` — `churn` taucht in dieser Kette nicht auf. Bei 11 % Fluktuation und H = 10 ist rechnerisch die Mehrheit der Ersteller neu, der Rabatt bleibt aber am Anschlag. Der Effekt trifft genau die Ansätze mit der höchsten Lernrate (Deneb und Core 8 · 15 · 25 % je Verdopplung) und wächst mit dem Horizont — also dort, wo der Rechner die interessanten Aussagen macht. Größenordnung: der mittlere Lernfaktor liegt in den großen Presets nahe der Untergrenze; mit einem Verfall in Höhe der Fluktuation landet er eher bei 0,7–0,8, das sind 10–20 % mehr Rollout-Stunden für die Code-Ansätze.

**(c) Status.** Teils vorhanden, teils fehlend — `rampH` bezahlt die Einarbeitung des Nachrückers als Pauschale, der fortlaufende Lernvorsprung des Teams wird davon aber nicht berührt. Ohne diese Klarstellung wäre eine volle Kopplung Doppelzählung.

**(d) Abbildung.** `K` je Jahr um den Fluktuationsanteil abwerten: `K = K*(1 - churn/100*κ) + dK` mit κ als Anteil des Wissens, der an der Person hängt (κ ≈ 0,5, Autoren-Schätzung). Ein Regler, der bei κ = 0 exakt das heutige Verhalten reproduziert.

**(e) Evidenz.** Keine Evidenz, Plausibilitätsargument; die Lernkurve selbst ist im Modell als Faustregel (F) ohne Power-BI-Messung geführt, der Verfall wäre dieselbe Klasse.

---

## Fund 7 · Capacity wächst nicht mit

**(a) Wirkkette.** SVG-Strings und DAX-UDFs erzeugen Last je gerendertem Report und Leser — im Modell ist der Mehrverbrauch ein fester Prozentsatz einer festen Jahres-Capacity, obwohl Bestand und Viewer über den Horizont bis zum Zehnfachen wachsen.

**(b) Relevanz.** `capacityY=g('capacityCost')*p('cuUplift')/100*iy*capF*vatF` — die einzige Zeitabhängigkeit ist die Preissteigerung. Weder `reportsTotal` noch `vY(y)` gehen ein, und die F-SKU ist real keine lineare Größe, sondern eine Verdopplungstreppe (F2 → F4 → F8). Der `capAtLimit`-Schalter (×3 Overage) ist der richtige Gedanke, aber er ist ein Schalter statt eines Schwellenwerts. Wirkung: nur relevant, wenn Capacity-Jahreskosten eingetragen sind (Default 0) — dort aber erheblich, weil Core mit 2 · 6 · 15 % startet und bei zehnfachem Bestand eher bei 20–60 % landet, und weil ein einziger SKU-Schritt (F8 → F16, rund +11 k€/Jahr) den gesamten Lizenzvorteil einer kleinen Paid-Installation auffrisst.

**(c) Status.** Falsch verknüpft.

**(d) Abbildung.** `cuUplift` auf eine wachsende Basis legen: `capacityY = capacityCost * cuUplift/100 * (stock_y/stock_1) * iy` mit `stock_y` aus der vorhandenen Bestandsrechnung; optional eine Stufe: überschreitet `1 + uplift` den Wert 1,0 der gebuchten SKU, springt `capacityCost` auf die nächste Stufe der bereits hinterlegten Presets F2/F8/F64 statt linear zu wachsen.

**(e) Evidenz.** Vermutung für die Höhe; die Richtung ist im Modell selbst belegt („Core: SVG-Strings entstehen in der Engine per DAX (echte CU-Last); Custom Visuals rendern im Browser") und die SKU-Treppe ist Microsoft-Preisstruktur. Keine Messung der CU-Last je Chart — hier ist auch keine öffentlich verfügbar.

---

## Systematische Schieflage

Es gibt keine saubere einseitige Schieflage, aber ein erkennbares Muster: **die drei Ketten, die mit Menschen und Wissen zu tun haben (Funde 4 und 6) sowie die größte einzelne Kette (Fund 1) wirken alle zugunsten der Ansätze, die die Autor:innen selbst betreiben** — Fund 1 lässt Paid teurer aussehen, als es sein muss; Funde 4 und 6 ersparen Deneb und OSS ihr spezifischstes Risiko, die Abhängigkeit von wenigen Köpfen, und lassen ihnen einen Lernvorsprung, den Fluktuation real aufzehrt. Dagegen stehen Fund 2 und Fund 5, die in die Gegenrichtung wirken (Fund 2 belastet Core und Deneb, Fund 5 entlastet Paid im oberen Band). Netto: kein bewusster Daumen auf der Waage, aber die **unbepreisten Risiken sind ungleich verteilt** — Werkzeugrisiken sind modelliert (Abkündigung, Breaking-Updates, Bindungsgrad), Personenrisiken nicht, und Personenrisiken sind genau die Schwäche der Code-Ansätze. Wer nur einen Fund umsetzt, sollte Fund 1 nehmen (größte Wirkung, klarste Mechanik); wer die Unabhängigkeit der Darstellung stärken will, nimmt Fund 4 (kostet das eigene Projekt etwas, wie es die Autor:innen bei `cxComplex` und der 50-%-Untergrenze schon einmal getan haben).

---

## Verworfen und warum

- **Koexistenz zweier Ansätze.** Als Grenze benannt — und seit v0.14 faktisch teilweise umgesetzt: Klasse A läuft in jedem Ansatz über Core. Kein neuer Fund.
- **Nutzenverlust uneinheitlicher Charts bei niedrigem Adoptionsgrad.** Die Autor:innen benennen es wörtlich („bepreist ist nur der Mehraufwand, nicht der Wertverlust"). Bekannt, nicht übersehen.
- **Leserzeit-Nutzen je Ansatz unterschiedlich** (ein IBCS-Chart aus Zebra liest sich anders als ein SVG-Nachbau). Real, aber die Leserzeit ist der schwächst belegte Wert des ganzen Modells und steht bewusst außerhalb der Rangfolge; eine Differenzierung würde Scheingenauigkeit auf einen unbelegten Wert setzen.
- **Restwert am Horizontende.** Die Autor:innen haben ihn durchgerechnet (−4,8 % / −2,8 %) und begründet verworfen; das Gegenstück steht als Ausstiegskosten drin.
- **Paginated Reports / RDL als zweiter Bau.** Als Grenze benannt und plausibel ansatzneutral.
- **Anforderungslücken ohne Kostenpfad** (z. B. `themeable` 3/3/3/5 → Corporate-Design-Relaunch kostet je Ansatz unterschiedlich viel Nacharbeit). Hätte eine saubere Mechanik, aber die Erfüllungsgrade sind laut eigener Notiz „je Implementierung ungeprüft", und ein CD-Wechsel im Horizont ist spekulativ. Der Score geht zudem bereits über den gewichteten Rang ein. Im Rauschen.
- **Korrelation der Breaking-Updates zwischen den Ansätzen** (eine Power-BI-Release bricht mehreres gleichzeitig). Die gepaarte Ziehung deckt das teilweise ab, und die Wirkung auf die Differenz ist klein.
- **Lizenzmodell „Ersteller-Seat mit unbegrenzten Viewern"** als fehlende Option. Eine erste Suchtreffer-Spur deutete darauf hin; die Gegenprobe ergibt, dass Inforiver die Zweiteilung Creator/Viewer im Februar 2024 abgeschafft hat und heute jeder Nutzer einen Named Seat braucht. Die Modellaussage „Ersteller und Viewer zählen gleich" ist damit korrekt — verworfen, bevor es ein Fund wurde.
- **Knappheitsaufschlag auf den internen Stundensatz je Ansatz** als eigener Fund. Teilweise bereits über den höheren Externanteil bei Deneb (40 % gegen 25 %) und den externen Satz abgebildet; als Teilaspekt in Fund 4 aufgenommen statt separat gemeldet.

---

## Was ich nicht prüfen konnte

- **Herstellerseiten.** `help.zebrabi.com` und `inforiver.com` sind in dieser Umgebung durch den Egress-Proxy blockiert (`EGRESS_BLOCKED`). Der Lizenzumfang in Fund 1 stützt sich deshalb auf Suchtreffer-Auszüge, nicht auf den Originalwortlaut — dieselbe Evidenzklasse (S), die das Modell für seine Preise verwendet, und vor einer Modelländerung am Original zu prüfen. Konkret zu prüfen: ob der Lizenzumfang „Nutzer, die Zebra-/Inforiver-Reports öffnen können" oder „alle Power-BI-Nutzer im Tenant" ist und ob Vertragswerke eine Vollabdeckung erzwingen.
- **CU-Last je Chart-Typ.** Für Fund 7 gibt es keine öffentliche Messung von SVG-Measures gegen Custom Visuals; alles über die Richtung hinaus wäre erfunden.
- **Elastizität der Report-Nachfrage (Fund 2).** Keine Quelle gefunden und keine erwartet; die Größenordnung im Bericht ist eine Rechnung mit einer angenommenen Elastizität, kein Messwert.
- **Laufzeitverhalten.** Ich habe den Rechner nicht im Browser ausgeführt und keine Playwright-Gegenrechnung gemacht; alle Aussagen über die Mechanik stammen aus dem Quelltext von `calc()` und aus den Zahlen, die Modellbeschreibung und Kernaussagen selbst nennen. Die Prozentangaben zu den Wirkungen sind deshalb Abschätzungen aus der Struktur, keine nachgerechneten Ergebnisse.
- **Die übrigen Ausgabepfade** (Excel-Export, Monte-Carlo-Seite, Entscheidungspfad) habe ich nur insoweit gelesen, wie sie den Rechenkern berühren.
