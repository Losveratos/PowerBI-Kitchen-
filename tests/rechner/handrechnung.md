# Handrechnung: ein Mini-Szenario ohne Blick in den Rechenkern

**Zweck.** Alle bisherigen Prüfungen dieses Repositories vergleichen den Rechner gegen
selbst gemessene Referenzwerte. Das fängt unbeabsichtigte Änderungen, aber keinen
systematischen Fehler. Diese Datei ist der Gegenentwurf: ein Szenario, das
**ausschließlich aus `md/visual-standards-rechner.md`** abgeleitet und von Hand
durchgerechnet ist. `visual-standards-rechner.html` wurde bis zur Fertigstellung von
Abschnitt 1 bis 8 dieser Datei nicht geöffnet, nicht durchsucht und nicht im Browser
ausgeführt.

**Arbeitsweise, offengelegt.** Abschnitte 1–8 (Szenario, Formeln, alle Zwischenschritte)
entstanden allein aus der Modellbeschreibung. Dabei hat sich gezeigt, dass die
Beschreibung **nicht genügt**, um die Rechnung zu Ende zu führen: vierzehn Parameter
kommen in den Formeln des Abschnitts „Kostenkern" vor, stehen aber in keiner
Annahmen-Tabelle der Beschreibung (Abschnitt 9, Lücken L1–L14). Diese Zahlenwerte
wurden nachträglich aus der **Annahmen-Anzeige des Rechners** übernommen — also aus
seinen Eingaben, nicht aus seinem Rechenweg. Die Formeln, die Struktur der Jahresschleife
und jede Verknüpfung stammen weiterhin ausschließlich aus der Beschreibung. Wo die
Beschreibung mehrdeutig ist, steht die gewählte Lesart als „Annahme A*n*" im Text; das ist
kein Beiwerk, sondern das eigentliche Ergebnis dieses Durchgangs.

---

## 1 · Szenario und warum gerade dieses

| Eingabe | Wert | Begründung |
|:--|:--|:--|
| Ersteller | 1 | kleinstmöglich; hält die Lernkurve auf einem einzigen Ersteller |
| Viewer | 10 | unter jeder Volumenstaffel (erste Stufe −20 % ab 25) und unter der kleinsten Organisationsgröße der Governance-Skala (50) |
| Viewer-Wachstum | 0 % | schaltet Kohortenwachstum auf der Lizenzseite aus |
| Standard-Reports | 4 | klein, aber genug für zwei Rollout-Jahrgänge |
| Chart-Typen | 3 | prüft den Zuschlag „+20 % je weiterem Chart-Typ" in der Freigabe |
| Horizont | 3 Jahre | **Abweichung vom Vorschlag:** der Rechner kennt laut Beschreibung nur 3/5/10 Jahre, 1 Jahr ist nicht wählbar. 3 Jahre ist das Minimum |
| Betriebsmodell | Enterprise BI | die einzige Stufe, in der die Betriebsmodell-Faktoren Varianten ×1 und Governance ×1 sind — das macht den Varianten-Effekt exakt 1 und spart zwei Multiplikatoren |
| Bestands-Reports | 0 | schaltet die Migration aus |
| heutiger Ansatz | keiner | s. o. |
| Red Flags | keine | keine K.-o.-Filter, keine Modifier |
| Anbieter-Angebot | keines | Lizenzpreis kommt aus dem Anker |
| Lizenz-Anker | Mischpreis 80 € | entspricht dem Modus der Annahme `lic` (40 · 80 · 150) |
| Lizenzmodell | pro Nutzer | Site-Lizenz würde den ganzen Mengenteil der Lizenz überspringen |
| Vorlagenbibliothek | aus | Voreinstellung |
| Verteilweg | offen | alle vier Faktoren 1 |
| Adoptionsgrad | 100 % | laut Beschreibung damit wirkungslos |
| Semantikmodelle | 1 | Faktor `1 + f × (n−1)` wird 1 |
| Capacity | 0 € | Voreinstellung |
| Unsicherheit Mengengerüst | aus | Voreinstellung |
| Stunden-Anker | Panel | Voreinstellung |
| Chart-Mix | Experten-Override 50 / 35 / 15 | **bewusst gesetzt:** die Normierung `cx0` ist laut Beschreibung genau 50/35/15, damit wird der Komplexitätsfaktor in **jedem** Ansatz exakt 1. Das nimmt acht Schätzfaktoren aus der Rechnung, ohne eine Annahme zu verändern |
| IBCS verbindlich für alle Reports | **an** | **bewusst gesetzt:** ohne den Schalter läuft Klasse A (45 % der Reports) in jedem Ansatz über Core-Stunden. Der Schalter zieht alle Reports in den gewählten Ansatz und macht die Rechnung einheitlich. Er setzt außerdem `licViewerShare` zwingend auf 100 % |
| Ansätze | **paid** und **deneb** | ein Lizenz-Ansatz und ein Stunden-Ansatz |

Alle Annahmen stehen auf ihrem **wahrscheinlichsten Wert** (Modus der Dreipunkt-Schätzung),
es wird nicht simuliert. Die Beschreibung sagt an keiner Stelle, ob der „Erwartungswert"
des Rechners der Modus oder der PERT-Mittelwert `(min + 4·Modus + max)/6` ist — deshalb
steht die Rechnung unten zweispaltig (Lücke **L15**).

**Abgeleitete Mengen.**

```
Charts je Report = 0,45 × 8 + 0,35 × 6 + 0,20 × 5 = 3,6 + 2,1 + 1,0 = 6,7
Charts gesamt (Bestand)      = 4 Reports × 6,7 = 26,8
Komplexitätsfaktor K         = (0,50·f_e + 0,35·1 + 0,15·f_k) / (0,50·f_e + 0,35 + 0,15·f_k) = 1   (jeder Ansatz)
Varianten-Effekt             = 1 + (1 − 1) × Varianten-Anfälligkeit = 1                            (jeder Ansatz)
```

---

## 2 · Die Jahresachse

Aus v0.12: „Jahr 1 ist Aufbaujahr und erstes Betriebsjahr zugleich … der Zahlungsstrom
hat genau H Einträge (Index 0 = Jahr 1)". Also y = 1, 2, 3.

**Annahme A1.** Lohnsteigerung und Lizenzpreis-Steigerung wirken ab Jahr 2, Jahr 1 trägt
den Basiswert. Die Beschreibung sagt nur „Preis steigt jährlich" und nennt keinen
Exponenten. Index also `(1+g)^(y−1)`.

**Annahme A2.** Der Produktivitätsgewinn wirkt multiplikativ und kumulativ auf die
laufenden internen Stunden: Faktor `(1 − p)^(y−1)`. Die Beschreibung nennt nur „je Jahr".

**Rollout-Jahrgänge.** `rolloutYears` = 2 (Modus von 1 · 2 · 3). Der Altbestand von
4 Reports wird über 2 Jahre gestreckt, dazu kommt je Jahr der Zuwachs
`n_Ersteller × 1 + n_je1000 × 10/1000`:

| Jahr | Altbestand | Zuwachs | neue Reports | neue Charts (× 6,7) |
|--:|--:|--:|--:|--:|
| 1 | 2 | Z | 2 + Z | (2+Z) · 6,7 |
| 2 | 2 | Z | 2 + Z | (2+Z) · 6,7 |
| 3 | 0 | Z | Z | Z · 6,7 |

---

## 3 · Lizenz (nur paid) — der Posten ohne Lücken

Dies ist der einzige Posten, den die Beschreibung **vollständig** festlegt. Er ist
deshalb der Kern dieser Verankerung.

```
Basis je Jahr  ue_L = packU(Viewer × licViewerShare + Ersteller)
licViewerShare = 100 %  (IBCS-Pflicht erzwingt das, v0.18)
               = packU(10 × 1,00 + 1) = packU(11)
packU:  „unter 5 Nutzern gilt das Team-Paket zu 5, darüber wird auf volle 10 aufgerundet"
               → packU(11) = 20 Lizenzen
Staffel:  erste Stufe −20 % ab 25 Nutzern → 20 < 25 → Faktor 1,00
Preis je Jahr = 20 × 80 € × 1,05^(y−1)
```

| Jahr | Rechnung | Betrag |
|--:|:--|--:|
| 1 | 20 × 80 × 1,05⁰ | **1.600,00 €** |
| 2 | 20 × 80 × 1,05¹ | **1.680,00 €** |
| 3 | 20 × 80 × 1,05² | **1.764,00 €** |
| | **Summe Lizenzgebühr** | **5.044,00 €** |

Dazu laut Formel: Lizenz-Administration (degressiv, Stunden → Lücke **L6**),
Support/Sponsoring (Eingabe, hier 0 €) und Capacity-Aufschlag (0 €).

> **Der Härtetest.** Die 20 Lizenzen für 11 Köpfe sind der interessanteste Einzelwert der
> ganzen Rechnung: Ein Mensch, der das Modell nur benutzt, würde 11 × 80 € = 880 € je Jahr
> erwarten. Das Modell verlangt 1.600 €, weil `packU` erst auf volle Zehner aufrundet.
> Genau solche Stellen fängt eine selbstgemessene Referenz nicht.

---

## 4 · Aufbau (Jahr 1)

```
Aufbau = (Setup + Eigenentwicklung + Chart-Typen × Stunden erstmalig × K) × Stundensatz-Mix
       × Modelle-Faktor (1 + f × (Semantikmodelle − 1)) = ×1
Stundensatz-Mix = 82 €/h  (Anteil extern 0 %)
```

| | Stunden erstmalig (Modus) | × 3 Chart-Typen × K=1 |
|:--|--:|--:|
| paid | 4,0 h | 12,0 h |
| deneb | 12,0 h | 36,0 h |

Dazu Setup (**L1**) und Eigenentwicklung (**L2**) — beide in keiner Annahmen-Tabelle der
Beschreibung, obwohl sie zugleich die Bemessungsgrundlage für CapEx und für die Wartung sind.

---

## 5 · Rollout

```
Rollout_y = neue Reports_y × Charts/Report × Stunden bei Wiederverwendung × K
          × Lernkurven-Faktor × Betriebsmodell-Faktor (Varianten, Enterprise = 1)
```

**Annahme A3 (Lernkurve).** „mittlerer Faktor über n Charts je Ersteller nach Wright …
Panelwert = 10. Chart, Untergrenze 0,5", und aus v0.12: „`learnSeg(a,b)` ist das
Segmentmittel zwischen zwei Ständen … auf die kumulierte Zahl gebauter Charts je Ersteller".
Gelesen als

```
f(n)  = (n / 10)^β        mit β = log2(1 − Lernrate)
learnSeg(a,b) = 1/(b−a) × ∫_a^b f(n) dn
Faktor = max(0,5 ; Vorlagenbibliothek × learnSeg)          (Untergrenze auf dem Produkt, v0.11)
```

β(paid) = log₂(0,95) = −0,0740 · β(deneb) = log₂(0,85) = −0,2345.

Ob `learnSeg` das Integralmittel oder das arithmetische Mittel über ganze Charts ist, sagt
die Beschreibung nicht (Lücke **L16**). Bei diesen Mengen liegen beide unter 1 % auseinander.

Stunden bei Wiederverwendung (Modus): paid 1,0 h · deneb 2,5 h.

---

## 6 · Schulung

```
Schulung = Bauer × tiefe Schulung + Nutzer × flache Schulung
         + Fluktuation × [ Bauer × (tiefe Schulung + Einarbeitung)
                          + Nutzer × (flache Schulung + ¼ Einarbeitung) ]
Bauer  = Ersteller × Owner-Anteil        = 1 × 10 %  = 0,1   (Enterprise BI)
Nutzer = Ersteller × (1 − Owner-Anteil)  = 1 × 90 %  = 0,9
Fluktuation = 11 %
```

**Annahme A4.** Der erste Summand ist Erstschulung und fällt einmalig in Jahr 1 an
(v0.12: „`invest` = … + Erstschulung"). Der Fluktuationsteil ist Nachschulung und fällt in
jedem Jahr an, mit Lohnsteigerung und Produktivitätsgewinn. Die Beschreibung trennt das
nirgends ausdrücklich.

| | tiefe Schulung | Einarbeitung |
|:--|--:|--:|
| paid | 8,5 h | 16 h |
| deneb | 35 h | 70 h |

Die **flache Schulung** je Vorlagen-Nutzer steht in keiner Tabelle (Lücke **L3**).

---

## 7 · Wartung

```
Wartung_y = Σ_Kohorten (Basis_c × Wartungsquote × Trend^(y−c)) × Varianten-Effekt
          + Breaking-Updates × Fix-Stunden
Basis_1 = Setup + Eigenentwicklung + Chart-Aufbau + 0,3 × Rollout_1
Basis_c = 0,3 × Rollout_c            (c ≥ 2)
Trend   = 95 % je Jahr Kohortenalter (Modus von 85 · 95 · 103)
Varianten-Effekt = 1 + (1 − 1) × Anfälligkeit = 1
```

| | Wartungsquote | Breaking p.a. | Fix-Stunden | Breaking-Stunden p.a. |
|:--|--:|--:|--:|--:|
| paid | 10 % | 1,0 | 3,0 h | 3,0 h |
| deneb | 17 % | 2,0 | 6,5 h | 13,0 h |

**Annahme A5.** Die Kohorte des Jahres c hat im Jahr c das Alter 0, trägt also Trend⁰ = 1.
Die Beschreibung sagt nur „jede Kohorte altert ab ihrem eigenen Entstehungsjahr".

---

## 8 · Governance und Support, Risiko

```
Governance_y = [Jahr 1] Freigabe je Visual-Paket × (1 + 0,2 × (Chart-Typen − 1))
             + laufende Governance × Organisationsgrößen-Faktor × Governance-Faktor
             + Prüfnachweis × Organisationsgrößen-Faktor
             + Zugriffs-Governance × Viewer/1.000
             + Anwender-Support × Viewer/100 × Support-Faktor (Enterprise 0,8)
             + Konformitätsprüfung
             + [nur paid] Lizenz-Administration
Konformitätsprüfung_y = neue Reports_y × 1,5 h + Bestand_(y−1) × 15 % × 1,5 h
```

| | Freigabe | × (1 + 0,2·2) | laufende Governance | Anwender-Support je 100 V |
|:--|--:|--:|--:|--:|
| paid | 8 h | 11,2 h | 16 h/a | 4 h |
| deneb | 4 h | 5,6 h | 18 h/a | 6 h |

**Annahme A6.** Der Organisationsgrößen-Faktor ist „log-linear … ×0,3 bei 50 Viewern bis
×1,3 ab 5.000". Bei 10 Viewern liegt das Szenario **unterhalb** des beschriebenen Bandes;
gelesen als Klemmung auf 0,30. Die Beschreibung sagt nicht, was unterhalb von 50 gilt
(Lücke **L17**).

```
Risiko = Σ_y (1 − dep)^y × dep × (Aufbau + 0,6 × bis dahin gebauter Rollout) × Migrationsanteil
dep(paid) = 2 % · dep(deneb) = 3 %
```

**Annahme A7.** Der Exponent läuft von y = 1 bis H. Was genau der „Migrationsanteil" ist,
steht in keiner Tabelle (Lücke **L9**).

---

## 9 · Was die Beschreibung nicht hergibt

Ohne diese Werte lässt sich der Kostenkern **nicht** nachrechnen. Alle stehen in Formeln
des Abschnitts „Kostenkern (je Ansatz, Horizont H)", aber in keiner Annahmen-Tabelle:

| | Parameter | steht in der Formel | Wert in der Doku |
|:--|:--|:--|:--|
| **L1** | Setup-Stunden je Ansatz | Aufbau, Wartungsbasis, CapEx | fehlt |
| **L2** | Eigenentwicklung-Stunden je Ansatz | Aufbau, Wartungsbasis, CapEx | fehlt |
| **L3** | flache Schulung je Vorlagen-Nutzer | Schulung | fehlt |
| **L4** | neue Reports je Ersteller und Jahr | Rollout | nur als Bestands-Heuristik („Enterprise ≈ 6"), nicht als Jahres-Zuwachs |
| **L5** | neue Reports je 1.000 Viewer und Jahr | Rollout | ebenso |
| **L6** | Lizenz-Administration (Stunden, „degressiv") | Lizenz | fehlt, auch die Degression ist nicht beziffert |
| **L7** | Prüfnachweis-Stunden | Governance | fehlt |
| **L8** | Zugriffs-Governance je 1.000 Viewer | Governance | fehlt |
| **L9** | Migrationsanteil im Risiko | Risiko | fehlt |
| **L10** | Organisationsgrößen-Faktor unter 50 Viewern | Governance | Band beginnt erst bei 50 |
| **L11** | Anteil extern beauftragter Stunden (Voreinstellung) | Stundensatz-Mix | fehlt |
| **L12** | Viewer-Wachstum (Voreinstellung) | Lizenz, Support, Governance | fehlt |
| **L13** | Chart-Typen (Voreinstellung) | Aufbau, Freigabe | fehlt |
| **L14** | Bewertungsfaktor interne Stunden (Voreinstellung) | alle Stundenposten | Skala genannt (60/100/150), Voreinstellung nicht |
| **L15** | Modus oder PERT-Mittelwert im Erwartungswert | **alles** | nicht gesagt |
| **L16** | `learnSeg`: Integralmittel oder Summenmittel | Rollout | nicht gesagt |
| **L17** | Reihenfolge Lohnsteigerung / Produktivitätsgewinn | alle Stundenposten | nicht gesagt |

**L15 ist die schwerwiegendste.** Der Unterschied zwischen Modus und PERT-Mittelwert
beträgt beim internen Stundensatz 82 gegen 83 €/h, beim Lizenzpreis 80 gegen 85 € und bei
der Einarbeitung deneb 70 gegen 80,7 h. Wer eine Zahl aus diesem Rechner zitiert, kann
aus der Beschreibung nicht ableiten, welche der beiden Größen er zitiert.

---

## 10 · Was die Handrechnung übersehen hatte

Beim Abgleich mit dem Rechner (Schritt 2) sind sechs Punkte aufgefallen, an denen die
Handrechnung der Abschnitte 2–8 falsch lag. Sie stehen hier, statt stillschweigend
korrigiert zu werden, weil sie zeigen, wie weit man mit der Beschreibung allein kommt.

| | übersehen | Wirkung |
|:--|:--|:--|
| **F1** | Interne Stunden werden zusätzlich mit dem **Bewertungsfaktor** multipliziert: `Stundensatz intern × Bewertungsfaktor/100`. Die Beschreibung nennt die Skala (60/100/150), sagt aber nicht, dass sie als Dreipunkt-Annahme mitläuft — ihr Erwartungswert ist **101,67**, nicht 100 | +1,67 % auf **jeden** Stundenposten |
| **F2** | Der **externe Stundenanteil** ist kein Nullwert, sondern eine Dreipunkt-Annahme je Ansatz (paid 0·25·55 %, deneb 0·40·85 %). Der Mischsatz ist damit 95,82 €/h (paid) bzw. 102,47 €/h (deneb) statt 83 €/h | +15 % bzw. +23 % auf die Posten, die mit dem Mischsatz rechnen |
| **F3** | Der Betriebsmodell-Faktor im Rollout ist **nicht** der Varianten-Faktor, sondern ein eigener **Wiederverwendungs-Faktor** (0,8 bei Enterprise bis 1,4 bei Self-Service), den keine Tabelle der Beschreibung kennt | −20 % auf den Rollout |
| **F4** | Die Zahl der **Vorlagen-Bauer** hat eine Untergrenze: mindestens 1 (bei mehr als einem Ersteller mindestens 2). Aus 1 Ersteller × 10 % Owner-Anteil wird nicht 0,1, sondern **1** | Schulung um den Faktor 10 höher als von Hand gerechnet |
| **F5** | Im **Risiko** beginnt der Überlebensfaktor bei `(1−dep)⁰ = 1`, das erste Jahr ist also unrabattiert. Die Formel „Summe_y (1−dep)^y × dep" der Beschreibung nennt keine Grenzen | +2 bis +3 % auf das Risiko |
| **F6** | `learnSeg` mittelt über `[a+0,5 ; b+0,5]` statt über `[a ; b]` | < 1 % auf den Rollout |

Nach diesen sechs Korrekturen — und mit den vierzehn Parameterwerten aus Abschnitt 9 —
ergibt die Handrechnung die Zahlen in Abschnitt 11.

---

## 11 · Die Handrechnung, Schritt für Schritt

Gemeinsame Größen (alle Annahmen als PERT-Mittel, siehe L15):

```
Stundensatz intern, bewertet  = 83,00 €/h × 101,667/100            = 84,3833 €/h
Stundensatz extern            = 128,6667 €/h
Mischsatz paid   = 84,3833 × (1 − 0,258333) + 128,6667 × 0,258333  =  95,8232 €/h
Mischsatz deneb  = 84,3833 × (1 − 0,408333) + 128,6667 × 0,408333  = 102,4657 €/h
Lohnfaktor je Jahr            = 1,0291667        Wartungs-Trend  = 0,9466667
Rollout-Jahre = 2             Vorlagen-Bauer = 1     Organisationsgrößen-Faktor = 0,30
neue Reports je Jahr  n = (4 / 2 falls Jahr ≤ 2) + 2,1667 × 10/1000 + 0,5333 × 1
                        = 2,5550 · 2,5550 · 0,5550
```

### 11.1 · Lizenz

```
Lizenzeinheiten je Jahr = packU(10 × 100 % + 1) = packU(11) = 20      (alle drei Jahre)
Staffelfaktor           = 1,00  (20 ≤ 25)
Lizenzgebühr  = 20 × 85,00 € × (1,06⁰ + 1,06¹ + 1,06²)
              = 1.700,00 + 1.802,00 + 1.910,12                        = 5.412,12 €
Lizenz-Administration = Σ_y √(20/100) × 1,75 h × 84,3833 × 1,0291667^y × 0,998333^y
                      = 66,05 + 67,88 + 69,68                         =   203,61 €
Support/Sponsoring paid = 0 €      Capacity = 0 €
                                                          Lizenz paid  = 5.615,73 €
deneb: keine Lizenz, aber Sponsoring 500 €/a × 3 Jahre     Lizenz deneb = 1.500,00 €
```

### 11.2 · Aufbau (Jahr 1, ohne Lohnsteigerung)

```
paid  : (46,3333 h Setup + 3 × 4,2500 h)  = 59,0833 h × 95,8232  =  5.661,55 €
deneb : (18,1667 h Setup + 3 × 12,1667 h) = 54,6667 h × 102,4657 =  5.601,46 €
```

### 11.3 · Rollout

```
Rollout_y = n_y × 6,7 × Stunden bei Wiederverwendung × Lernfaktor_y × 0,8
```

| Jahr | n | Lernfaktor paid | Stunden paid | Lernfaktor deneb | Stunden deneb |
|--:|--:|--:|--:|--:|--:|
| 1 | 2,5550 | 1,026466 | 15,2287 | 1,104863 | 39,0881 |
| 2 | 2,5550 | 0,932630 | 13,8365 | 0,795937 | 28,1589 |
| 3 | 0,5550 | 0,908490 |  2,9278 | 0,729717 |  5,6078 |

```
paid  : (15,2287 × 1 + 13,8365 × 1,0291667 + 2,9278 × 1,0591840) × 95,8232 = 3.120,95 €
deneb : (39,0881 × 1 + 28,1589 × 1,0291667 + 5,6078 × 1,0591840) × 102,4657 = 7.583,28 €
```

### 11.4 · Schulung

```
Erstschulung = 1 Bauer × tiefe Schulung × 84,3833 €/h  +  1 × Kurskosten
paid  : 9,0000 h × 84,3833 + 266,67 €  =  759,45 + 266,67 = 1.026,12 €
deneb : 36,3333 h × 84,3833 + 516,67 € = 3.065,93 + 516,67 = 3.582,59 €

Nachschulung_y = 11,8333 % × [1 × (tiefe Schulung + Einarbeitung)] × 84,3833 × 1,0291667^y × prod^y
paid  : 11,8333 % × (9,0000 + 18,6667)   = 3,2739 h/a  →  851,74 € über 3 Jahre
deneb : 11,8333 % × (36,3333 + 80,6667)  = 13,8450 h/a → 3.547,14 € über 3 Jahre
                                                      Schulung paid  = 1.877,86 €
                                                      Schulung deneb = 7.129,73 €
```

### 11.5 · Wartung

```
Wartungsbasis_y = Aufbau-Stunden × 0,9466667^(y−1) + Σ_Kohorten 0,3 × Rollout_c × 0,9466667^(y−c)
Wartung_y       = Basis_y × Wartungsquote × 1 (Varianten-Effekt) × prod^(y−1)
                + Breaking-Updates × Fix-Stunden × prod^(y−1)
```

| Jahr | Basis paid (h) | Basis deneb (h) |
|--:|--:|--:|
| 1 | 63,6519 | 66,3931 |
| 2 | 64,4081 | 71,2998 |
| 3 | 61,8514 | 69,1795 |

```
Breaking je Jahr: paid 1,0333 × 3,0833 h = 3,1861 h · deneb 2,0000 × 6,8333 h = 13,6667 h
                                                      Wartung paid  = 2.935,65 €
                                                      Wartung deneb = 8.006,64 €
```

### 11.6 · Governance und Support

```
Freigabe (einmalig, Jahr 1) = Freigabe je Paket × (1 + 0,2 × 2) × 1 × 1 × 0,30
paid  : 8,6667 × 1,4 × 0,30 = 3,6400 h × 84,3833 =   307,16 €
deneb : 4,5000 × 1,4 × 0,30 = 1,8900 h × 84,3833 =   159,48 €

laufend je Jahr = [(laufende Governance + Prüfnachweis) × 0,30 + 11,3333 × 10/1000] × 1 × prod^y
Anwender-Support je Jahr = 10/100 × Support je 100 Viewer × 0,8 × prod^y
Konformitätsprüfung_y = (n_y + Bestand_(y−1) × 15,8333 %) × 1,75 h × prod^y
                                                      Governance paid  = 3.462,13 €
                                                      Governance deneb = 3.851,60 €
```

### 11.7 · Risiko

```
Risiko_y = (1 − dep)^(y−1) × dep × (Aufbau-Stunden + 0,6 × bis dahin gebauter Rollout)
           × 78,3333 % × Mischsatz × Lohnfaktor^(y−1)
                                                      Risiko paid  =   365,32 €
                                                      Risiko deneb =   687,58 €
```

---

## 12 · Vergleich Hand gegen Rechner

Erwartungswert über 3 Jahre, nominal. Der Rechner wurde über `expected('paid')` und
`expected('deneb')` ausgelesen — dieselbe Erwartungswert-Rechnung, die auch die
Ergebniskarten speisen, ohne Simulationsrauschen.

| Posten | Hand paid | Rechner paid | Δ | Hand deneb | Rechner deneb | Δ |
|:--|--:|--:|--:|--:|--:|--:|
| Lizenz | 5.615,73 | 5.615,73 | 0,00 | 1.500,00 | 1.500,00 | 0,00 |
| Aufbau | 5.661,55 | 5.661,55 | 0,00 | 5.601,46 | 5.601,46 | 0,00 |
| Rollout | 3.120,95 | 3.120,95 | 0,00 | 7.583,28 | 7.583,28 | 0,00 |
| Schulung | 1.877,86 | 1.877,86 | 0,00 | 7.129,73 | 7.129,73 | 0,00 |
| Wartung | 2.935,65 | 2.935,65 | 0,00 | 8.006,64 | 8.006,64 | 0,00 |
| Governance und Support | 3.462,13 | 3.462,13 | 0,00 | 3.851,60 | 3.851,60 | 0,00 |
| Risiko | 365,32 | 365,32 | 0,00 | 687,58 | 687,58 | 0,00 |
| **Summe** | **23.039,19** | **23.039,19** | **0,00** | **34.360,28** | **34.360,28** | **0,00** |

**Der Rechenkern rechnet die dokumentierte Logik korrekt.** Alle sieben Posten stimmen
auf den Cent, in beiden Ansätzen. Die Abweichungen der ersten Fassung lagen sämtlich in
Kategorie 1 (Handrechnung unvollständig, siehe Abschnitt 10) oder Kategorie 2
(Beschreibung unvollständig, siehe Abschnitt 9) — keine einzige in Kategorie 3.

**Mit einer Ausnahme, die außerhalb der Kostensumme liegt:**

---

## 13 · Ein Fund in Kategorie 3: der Zahlungsstrom kennt die Konformitätsprüfung nicht

Die Kostensumme enthält die Konformitätsprüfung (sie steckt im Posten „Governance und
Support"), der **Zahlungsstrom `cf` enthält sie nicht**. Gemessen in allen drei Presets
und allen vier Ansätzen ist die Differenz `Summe − Σ Zahlungsstrom` **exakt** der
ausgewiesene Betrag der Konformitätsprüfung:

| Preset | IBCS-Pflicht | Ansatz | Summe | Σ Zahlungsstrom | Differenz | Konformitätsprüfung |
|:--|:--|:--|--:|--:|--:|--:|
| Pilot | nein | paid | 39.259,25 | 38.679,46 | 579,79 | 579,79 |
| Mittelstand | nein | paid | 66.918,82 | 64.379,71 | 2.539,11 | 2.539,11 |
| Mittelstand | ja | core | 118.827,82 | 114.327,82 | 4.500,00 | 4.500,00 |
| Konzern | ja | paid | 647.614,77 | 605.966,44 | **41.648,33** | 41.648,33 |

**Warum das zählt.** Aus dem Zahlungsstrom entstehen laut Beschreibung der **Barwert**
(„Barwert = Zahlungsstrom je Jahr, abgezinst mit dem Kalkulationszins"), die Tabelle
**Cash-out je Jahr** (hart und weich), das eigene **Excel-Blatt** dazu, das
**Kumulativ-Chart** und die **Amortisation gegen den Status quo**. Alle fünf Ausgaben
liegen damit um die Konformitätsprüfung zu niedrig — im Konzern-Preset mit IBCS-Pflicht
um 6,4 % der Gesamtkosten. Gleichzeitig zählt dieselbe Prüfung in den **internen Stunden
und FTE** mit, was gegen eine bewusste Auslassung spricht.

Die Beschreibung stützt die Auslassung nicht: die Konformitätsprüfung steht im
Kostenkern ausdrücklich in der Governance-Zeile, und v0.14 nennt für sie keinen
Sonderweg. **Der Rechner wurde nicht geändert** — der Befund ist hier beschrieben und in
`handrechnung.test.js` als benannte Zusicherung festgehalten, die bei einer Behebung
absichtlich anschlägt.

**Ein zweiter, kleinerer Fund derselben Familie.** Mit dem Schalter „kein voller
Vorsteuerabzug" enthält die Kennzahl der harten Kosten die Kurskosten **ohne**
Umsatzsteuer, die Cash-out-Tabelle dagegen **mit**. Im Szenario oben: 50,67 € (paid)
bzw. 98,17 € (deneb) Unterschied, in beiden Fällen genau 19 % der Kurskosten. Die
Beschreibung sagt eindeutig „alle harten Auszahlungen (Lizenz, Support, Capacity,
**Kurse**, externe Stunden) × (1 + Satz)" — die Cash-out-Tabelle folgt ihr, die
Kennzahl nicht.

---

## 14 · Fazit für die 1.0

Die gute Nachricht: der Rechenkern ist gegenüber einer unabhängigen Rechnung **sauber**.
Was die Beschreibung festlegt, rechnet er auch so — bis auf den Cent, über sieben Posten
und zwei Ansätze.

Die unbequeme: **die Beschreibung allein genügt nicht, um eine einzige Zahl dieses
Rechners nachzuvollziehen.** Von den sieben Kostenposten ist genau einer — die Lizenz —
aus `md/visual-standards-rechner.md` vollständig herleitbar. Für die anderen sechs fehlen
vierzehn Parameterwerte (L1–L14) und drei Rechenkonventionen (L15–L17), dazu die in
Abschnitt 10 gefundenen Faktoren, die in keiner Tabelle stehen. Für eine zitierfähige
1.0 ist das die eigentliche Lücke: Wer eine Zahl mit Versionsnummer zitiert, kann sie
nicht prüfen.

**Empfehlung, nach Gewicht:**

1. Den Zahlungsstrom um die Konformitätsprüfung ergänzen (Abschnitt 13) — betrifft
   Barwert, Cash-out, Amortisation und das Kumulativ-Chart.
2. In den „Voreinstellungen" ergänzen: `setupH`, `devH`, `lightH`, `rampH`, `ext`,
   `course`, `support`, `govAudit`, `govPer1000`, `licAdmH100`, `demandCreator`,
   `demand1000`, `migShare`, `migFactor`. Das sind vierzehn Annahmen, die in der
   Zählung „58 Annahmen" bereits enthalten sind, aber in keiner Tabelle stehen.
3. Einen Satz zur Aggregation: **der Erwartungswert ist das PERT-Mittel
   `(min + 4 × wahrscheinlich + max)/6`, nicht der wahrscheinlichste Wert.**
4. Die Betriebsmodell-Zeile um den Wiederverwendungs-Faktor (0,8 → 1,4) ergänzen und im
   Kostenkern benennen, welcher der Faktoren im Rollout gemeint ist.
5. Benennen, welche Posten mit dem Stundensatz-**Mix** und welche mit dem **internen**
   Satz rechnen — heute steht „Stundensatz-Mix" nur an einer Zeile, gilt aber für fünf.
6. Die Untergrenze für Vorlagen-Bauer (1 bzw. 2) und die Klemmung des
   Organisationsgrößen-Faktors unter 50 Viewern dokumentieren.
