# Modellkonzept · Energiewende-Reihe

Status: Entwurf v0.1 vom 22.11.2026, festgeschrieben **bevor** die
Recherche-Dossiers der Phase 1 vorlagen, damit die Methodik nicht nachträglich
an gewünschte Ergebnisse angepasst wird. Änderungen werden im Prozess-Log
begründet. Baut auf `strommix/docs/02_modellkonzept.md` und
`strommix/scripts/model.py` auf.

## Die Frage, die das Modell beantwortet

Für vier Pfade, bei **gleicher Energiedienstleistung** (gleiche Kilometer,
gleiche warme Wohnungen, gleiche Industrieproduktion): Was kostet der Pfad,
hält er die Versorgung über mehrere Wetterjahre, wie viel CO₂ stößt er bis
2045 aus, und wovon macht er abhängig?

| Pfad | Kurzbeschreibung |
|---|---|
| **A · EE + Speicher** (Hauptpfad) | Wind, Sonne, Kurz- und Langzeitspeicher, Verbund, flexible Lasten; Gaskraftwerke nur als Reserve mit Umstieg auf Wasserstoff |
| **B · Regierungspfad** | geltende Gesetze und Planungen (EEG-Ziele, Kraftwerksstrategie, Netzentwicklungsplan), so wie beschlossen |
| **C · R21-Pfad** | Kernkraft reaktivieren und neu bauen, heimisches Gas, Gas und Kohle mit CCS, Steuerung nur über einen EU-Emissionshandel; in der stärksten realistisch umsetzbaren Form |
| **D · Fossil weiter** | heutige Struktur fortgeschrieben, mit CO₂-Preis und Klimaschadenskosten als Regler |

## Fünf Ebenen

| Ebene | Frage | Methode |
|---|---|---|
| **1 · Energiebilanz** | Wie viel Strom, Wasserstoff und Brennstoff braucht der Pfad je Stützjahr? | Jahresbilanz je Sektor: Aktivität × spezifischer Verbrauch × Anteil je Technik |
| **2 · Dispatch** | Geht der Strom-Mix Stunde für Stunde auf — in jedem Wetterjahr? | stündliche Simulation mit gemessenen Profilen 2015–2025, erweitert um Verbund und flexible Lasten |
| **3 · Kosten** | Was kostet das Gesamtsystem pro Jahr und kumuliert? | Annuitäten für Anlagen, Netze, Speicher und Endgeräte, plus Brennstoff, Importe, CO₂ |
| **4 · Tragfähigkeit** | Besteht der Pfad die vier Kriterien — auch unter Stress? | Kennzahlen und Stresstests |
| **5 · Unsicherheit** | Wie stabil ist das Ergebnis gegen die Annahmen? | Monte Carlo und Tornado wie in `strommix/` und `eauto/` |

Stützjahre: 2030, 2035, 2045; dazwischen linear. Jede Technik hat ein
frühestes Verfügbarkeitsjahr und eine Hochlaufgrenze (GW pro Jahr) — ein Pfad
kann nicht schneller bauen, als die Empirie hergibt.

### Ebene 1 · Energiebilanz

```
Endenergie[Sektor, Träger] = Aktivität × Σ_Technik ( Anteil × spezifischer Verbrauch )
Strombedarf   = direkte Elektrifizierung + Elektrolyse (heimischer H₂- und E-Fuel-Anteil) + Netzverluste
H₂-Bedarf     = Industrie + Lkw-Anteil H₂ + Rückverstromung (aus Ebene 2) + E-Fuel-Vorprodukt
Rest-fossil   = was nicht ersetzt ist  →  Emissionen und Importrechnung
```

Regler: Lkw-Anteil Batterie gegen Wasserstoff; Importanteil Wasserstoff und
E-Fuels; Sanierungsrate und Wärmepumpen-Anteil; Tempo der Pkw-Umstellung;
Industrieproduktion (auch ein Schrumpf-Szenario, damit das
Deindustrialisierungs-Argument rechenbar wird). Gesetzt: Pkw elektrisch,
Flug und Schiff mit E-Fuels.

### Ebene 2 · Dispatch

Der Algorithmus aus `strommix/scripts/model.py` (`dispatch`) bleibt der Kern.
Erweiterungen:

1. **Mehrere Wetterjahre:** jedes Jahr 2015–2025 einzeln; ausgewiesen werden
   Median, schlechtestes Jahr und die Spanne — nicht der Durchschnitt.
2. **Verbund:** Import und Export bis zur Kuppelkapazität, mit einer
   Verfügbarkeit, die in europaweiten Flauten sinkt (Regler; im Europa-Teil
   ersetzt durch ein Mehr-Zonen-Modell mit eigenen Profilen der Nachbarn).
3. **Flexible Lasten:** Elektrolyse läuft bei Überschuss; ein einstellbarer
   Teil des Ladens von E-Autos und des Wärmepumpen-Betriebs lässt sich um
   Stunden verschieben.
4. **Reihenfolge bei Mangel:** Batterie → Pumpspeicher → Import →
   Wasserstoff-Rückverstromung → Gasreserve → ungedeckte Last.
5. **Abregelungs-Korrektur** der gemessenen Profile, sofern das Dossier
   P1-03 eine belastbare Methode liefert; sonst als Limitation ausgewiesen.

### Ebene 3 · Kosten

Gerechnet wird das **Gesamtsystem**, nicht nur der Strom: Erzeugung, Speicher,
Netze, Endgeräte (Fahrzeuge, Heizungen, Industrieanlagen), Brennstoffe,
Importe, CO₂. Jede Summe wird in **allen** gängigen Abgrenzungen ausgegeben,
damit sichtbar wird, wie aus derselben Welt 1 oder 13 Billionen werden:

| Abgrenzung | Bedeutung |
|---|---|
| Brutto-Investitionen | alles, was im Pfad investiert wird, auch Ersatz, der ohnehin fällig wäre |
| Mehr-Investitionen | Differenz zum Referenzpfad D |
| Mehrkosten netto | Mehr-Investitionen minus eingesparte Brennstoff- und CO₂-Kosten |
| jährliche Systemkosten | Annuität + Betrieb + Brennstoff, in Mrd. € pro Jahr und % des BIP |

Preisbasis real (ein Basisjahr), Diskontierung als Regler (0 / 2 / 4 %),
Kapitalkosten über den WACC wie in `strommix/`. Kostenüberschreitungen nach
derselben Empirie für alle Technikklassen (Flyvbjerg, Sovacool).

### Ebene 4 · Tragfähigkeit

| Kriterium | Kennzahlen |
|---|---|
| Kosten | Systemkosten in % des BIP; Strom-Systemkosten in €/MWh; Mehrkosten netto gegen Pfad D |
| Versorgungssicherheit | ungedeckte Last (TWh, Stunden, größte Lücke in GW) im schlechtesten Wetterjahr; nötige gesicherte Leistung |
| CO₂-Budget | kumulierte Emissionen 2025–2045 gegen das Restbudget; Jahr der Klimaneutralität |
| Abhängigkeit | Importquote Energie (TWh und €/Jahr); importierter Anlagenwert pro Jahr; Konzentration auf einzelne Lieferländer |

Die **Schwellenwerte**, ab denen ein Pfad als nicht tragfähig gilt, legt
Michael fest, bevor Teil 6 gerechnet wird. Sie stehen dann hier, mit Datum.

Stresstests, auf alle Pfade angewendet:

- **China liefert zwei Jahre nicht:** Zubau von PV, Batterien und betroffenen
  Komponenten verzögert und verteuert (Parameter aus P1-07).
- **Gaspreisschock** wie 2022.
- **Europaweite Dunkelflaute** im schlechtesten Wetterjahr, Importe nahe null.
- **Bauverzug** bei Großprojekten (Kernkraft, Netze, Wasserstoff-Kavernen)
  nach empirischer Verteilung.
- **Hoher und niedriger CO₂-Preis.**

### Ebene 5 · Unsicherheit

Wie bisher: Dreiecksverteilungen aus min / mid / max, fester Startwert,
Zufallsgenerator mulberry32 (bitgleich in Python und JavaScript), 10.000
Ziehungen, Tornado je Annahme. Ausgewiesen wird, **welche Pfad-Paare sich
überlappen** — eine Rangfolge wird nur behauptet, wo die Verteilungen sie
tragen.

## Fairness-Regeln (gelten für alle Pfade)

1. Gleiche Energiedienstleistung, gleiche Wetterjahre, gleicher CO₂-Preispfad,
   gleiche Brennstoffpreise, gleiche WACC-Logik.
2. Jede Technik mit Kosten aus **gebauten Projekten**, nicht aus Prospekten —
   das gilt für Kernkraft genauso wie für Elektrolyse, Kavernen und CCS.
3. Jeder Pfad in seiner stärksten realistisch umsetzbaren Form; die
   Parametrisierung des R21-Pfads wird vom Reviewer „R21-Verteidiger“ geprüft.
4. Die Zeitachse zählt: Was ein Pfad erst 2040 liefern kann, hilft 2030
   nicht; die Emissionen und Kosten der Zwischenzeit werden mitgerechnet.
5. Kein Pfad bekommt Puffer geschenkt, die ein anderer nicht bekommt
   (Importe, Lastverschiebung).

## Validierung

- **Ebene 1** gegen die Energiebilanz des jüngsten Ist-Jahres (AG
  Energiebilanzen): je Sektor und Träger ±3 %.
- **Ebene 2** gegen jedes Ist-Jahr 2015–2025: mit den realen Kapazitäten
  müssen die realen Jahressummen auf ±5 % herauskommen.
- **Ebene 3** gegen veröffentlichte Szenarien: Mit den Annahmen von Ariadne,
  Agora und KfW/Prognos muss das Modell in deren Größenordnung landen;
  Abweichungen werden erklärt, nicht wegoptimiert.
- **Nachstellung R21-Factsheet A:** Mit dessen Annahmen muss exakt 1,4
  Billionen € herauskommen — erst dann wird Annahme für Annahme variiert.
- Testvektoren und Selbsttest im Browser wie in `strommix/`.

## Bewusste Vereinfachungen

- Keine räumliche Netzsimulation; Netze als Kostenblock mit Bandbreite.
- Kein Marktmodell: Das Modell rechnet Systemkosten, keine Börsenpreise und
  keine Verteilung auf Haushalte und Industrie.
- Keine gesamtwirtschaftliche Rückkopplung: Wachstums- und
  Beschäftigungseffekte werden aus der Literatur referiert (P1-10), nicht
  simuliert.
- Speicherbetrieb ohne Voraussicht (überschätzt den Speicherbedarf leicht).
- Gemessene Profile enthalten Abregelung und den damaligen Anlagenpark
  (unterschätzt moderne Schwachwind-Anlagen eher).
- Nachbarländer bis zum Europa-Teil nur als Regler.

Jede Vereinfachung bekommt im Stück eine Angabe, in welche Richtung sie das
Ergebnis vermutlich verschiebt und welchem Pfad das nützt.
