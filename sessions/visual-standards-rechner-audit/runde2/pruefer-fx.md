# Pruefung Fund "zeit" — Waehrung USD/EUR bei Lizenz-Ankern

## Heutiger Stand im Rechner
- `REQS`/`OPTP` Zeile `lic` (visual-standards-rechner.html:550): `v:{paid:[40,80,150]}`, `srcNote` nennt
  "Inforiver Analytics+ 2,40–3 $/Nutzer/Monat ... Zebra BI Personal 299 $/Jahr, Team 799 $/Jahr fuer 5 Nutzer
  ... 1 $ ≈ 1 € konservativ".
- `licSite` (Zeile 551): `[12000,35000,90000]` €, aus "12.000 $/Jahr" (Inforiver) abgeleitet — wieder implizit 1:1.
- `const LIC={inforiver:[25,33,60],zebra:[140,270,330],enterprise:[40,80,150]}` (Zeile 593) — feste EUR-Anker,
  die aus den USD-Preisen der `srcNote` per 1:1-Naeherung entstanden sind.
- Es gibt **keinen** eigenen Wechselkurs-Parameter; die Rate ist stumm in die Konstanten eingebacken.

## Pruefung der Evidenz
- Die zitierte EZB-Seite ist in dieser Sitzung nicht erreichbar (Egress-Proxy blockiert
  `www.ecb.europa.eu`, ebenso `x-rates.com` und `exchangerate-api.com` als Alternativquellen probiert —
  alle drei mit `EGRESS_BLOCKED` zurueckgewiesen). Der konkrete Tageskurs "1,1652 USD/EUR am 09.09.2026"
  konnte ich in dieser Sitzung **nicht verifizieren**.
- Der Kern der Aussage ist trotzdem plausibel und stimmt mit allgemein bekanntem Verlauf ueberein: EUR/USD lag
  die letzten Jahre ueberwiegend zwischen ca. 1,05 und 1,25, mit Ausreisser-Paritaet 2022 — nie dauerhaft bei
  1,00. Eine feste 1:1-Annahme ist damit strukturell falsch, unabhaengig vom exakten Tageswert.
- Rechnerisch: Wird 1 $ als 1 € behandelt, obwohl 1 € ≈ 1,10–1,20 $ gilt, werden USD-Preise um ca. 9–17 %
  ueberzeichnet (bei 1,1652: (1,1652-1)/1,1652 = 14,2 % — die "14 %" aus dem Fund sind also intern konsistent
  mit dem zitierten Kurs, nur der Kurs selbst ist unbelegt).
- Betrifft nur Inforiver (Plano, TX) und Zebra (Ljubljana, aber laut eigener Preisliste in USD) — graphomate
  (Kiel, EUR) ist nicht betroffen. Das deckt sich mit dem, was im Code steht (`enterprise`-Mischpreis
  vermutlich teils graphomate, teils Schaetzung, daher hier nicht mit 1:1-Fehler behaftet).

## Ist das ein echter Fund oder nur Umformulierung?
Echter Fund: Es handelt sich nicht nur um eine Textkorrektur der `srcNote`, sondern um einen strukturellen
Bias, der zwei von drei Paid-Ankern (und damit die dominante Wettbewerbsdimension "Lizenz je Nutzer") einheitlich
zu teuer macht — mit Vorzeichen gegen "paid" und damit indirekt pro oss/deneb/core. Das ist entscheidungsrelevant
fuer eine Controlling-Zielgruppe, die genau diese Zahl als Kernargument nutzt.

## Bewertung des Loesungsvorschlags
Die im Fund vorgeschlagene **neue globale Annahme `fxUsdEur`**, multiplikativ in `calc()` auf `p('lic')` und
`p('licSite')` angewandt, ist mir zu fragil für diese Codebasis:
- `p('lic')`/`p('licSite')` sind frei editierbare Slider (auch per `LIC`-Preset-Buttons oder Site-Presets
  gesetzt) — der Code haelt aktuell nirgends fest, ob der aktuell gewaehlte Wert aus einem USD- oder
  EUR-Anker stammt. Ein Nutzer, der manuell einen Wert eintippt oder den "Mischpreis"-Anker (`enterprise`)
  waehlt, wuerde durch eine pauschale Multiplikation falsch behandelt (Fund selbst schliesst `enterprise`
  zwar per Bedingung aus, aber das ist eine zusaetzliche Sonderfall-Verzweigung mehr in `calc()`, die zu
  Wartungslast fuehrt und bei jeder neuen Preset-Variante erneut gepflegt werden muss).
- Sauberer und mit weniger Fehleroberflaeche: die **Konstanten in `LIC` direkt korrigieren** (Vorschlag "Alternative"
  im Fund) und den FX-Fehler qualitativ als Risiko in der `srcNote` von `lic`/`licInfl` benennen — das passt zur
  bestehenden Praxis, dass `LIC`-Anker bereits "eingepreiste" Rundwerte sind (z. B. `zebra:[140,270,330]` ist
  auch keine reine 1:1-Uebernahme von 299/799, sondern schon interpretiert).

## Empfehlung (adjusted)
Kein neuer Parameter `fxUsdEur`. Stattdessen:
1. `LIC.inforiver` von `[25,33,60]` auf ca. `[22,28,52]` senken (2,40–3 $/Monat × 12 × ~0,86 €/$ ≈ 24,8–31 €,
   Rundung wie im Fund vorgeschlagen `[22,28,52]` ist plausibel; das Maximum 60→52 folgt derselben ca. 14 %
   Korrektur).
2. `LIC.zebra` proportional pruefen (299 $ × 0,86 ≈ 257 €, 799/5 $ × 0,86 ≈ 137 €) — aktuell `[140,270,330]`
   ist grob im Bereich, aber das Maximum 330 wirkt nach der gleichen Logik ~14 % zu hoch; hierzu reicht meine
   Quellenlage in dieser Sitzung nicht fuer eine przise neue Zahl, nur fuer die Richtung.
3. `licSite`-Default `[12000,35000,90000]` ebenfalls um die Kursdifferenz senken (12.000 $ × 0,86 ≈ 10.300 €
   als neuer Minimum-Anker statt 12.000 €).
4. `srcNote` von `lic` nicht mehr "1 $ ≈ 1 € konservativ" schreiben (das ist sachlich falsch, kein
   konservativer, sondern ein einseitig verzerrender Fehler), sondern z. B. "umgerechnet mit ~0,86 €/$
   (Richtwert 2026); Wechselkursrisiko ueber 10 Jahre ca. ±12 % um diesen Mittelwert, siehe `licInfl`".
5. Die Kursspanne als Satz in die `licInfl`-`srcNote` aufnehmen (wie im Fund als Alternative vorgeschlagen),
   nicht als eigene Zeile im Rechenkern.

Damit bleibt die Code-Komplexitaet unveraendert, der einseitige ~14 % Bias gegen "paid" verschwindet, und das
Wechselkursrisiko wird transparent statt stillschweigend als "konservativ" deklariert.

## Fazit
refuted = false (Kern des Funds trifft zu), aber Umsetzung angepasst: Konstanten-Korrektur statt neuer
`fxUsdEur`-Parameter/neuer `calc()`-Verzweigung. Exakter Tageskurs (1,1652 vom 09.09.2026) in dieser Sitzung
nicht verifizierbar, da ecb.europa.eu und Alternativquellen vom Netzwerk-Proxy blockiert sind — Grundaussage
(strukturelle Nicht-Paritaet EUR/USD, ~10-17 % Fehlerrichtung) ist aber unabhaengig vom exakten Tageswert
belastbar.
