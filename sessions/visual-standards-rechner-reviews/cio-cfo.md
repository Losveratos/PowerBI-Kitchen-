# CIO/CFO-Review (Opus) · Testkonzern 30 Ersteller / 2.000 Viewer / 40 Reports
Läufe: C4 Viewer-Sweep 200/2.000/8.000 → oss identisch 102.900 €; C5 Indifferenzpreis Paid nur bis 1–2 €/Nutzer/Jahr; C6 Gewichtung kippt erst zwischen 25 % und 10 %; deneb Schulung 207 k€ = 58 % der Kosten (30 Ersteller × 40 h)
## CFO gut: P10/50/90 + common random numbers (fester Seed); Badges; Tornado nennt Treiber; K.O. mit Preisschild; Excel-Formelmodell
## CFO fehlt
P1 Viewer-abhängige Kosten für alle Optionen + INDIFFERENZ-LIZENZPREIS (licBreakEven = (alt − paid_ohne_lic)/(users·licF)) als „Verhandlungsgrenze €/Nutzer/Jahr" unter Break-even
P1 Ist-Zustand/Migration: existingReports, baseline-Option, parallelMonths; switchCost = existingReports·cpr·reuseH·migFactor[1,0·1,3·1,8]·rate + Parallel-Lizenz
P1 Nutzen-Seite: Stufe 1 „€ je Anforderungspunkt" (ΔKosten/ΔScore); Stufe 2 optional Leser-Nutzen = viewers·reads[12·40·120]·minSaved[0·1·3]/60·rateReader[50·70·120]·H·score
P1 Interne Stunden = Auszahlung? → intFactor [60·100·150] % auf rateInt (Kapazität frei vs Verdrängung)
P2 Keine Diskontierung; Kumuliert-Chart zeichnet Gerade obwohl licF compoundiert → calc() auf Cashflow-Vektor je Jahr, disc/WACC [4·7·10] %, NPV, Payback; Risiko als Ereignis in Jahr H/2
P2 CapEx/OpEx: Zeilen „aktivierungsfähig (setup+dev+build)" / „sofort aufwandswirksam"; Hinweis § 248 HGB / IAS 38; § 50a EStG Quellensteuer Hinweis
P2 lic → licCreator [150·300·800] / licViewer [10·60·300] + Angebotspreis-Feld + Mindestabnahme + 3-Stufen-Staffel
P2 „Vendor-Claim prüfen": nötige reuseH damit Angebot sich rechnet
P3 Kategorie-Mediane skaliert → Fußnote; „je Viewer" Nenner auf viewersAvg (384 € bei 270 € Listenpreis)
## CIO gut: Governance vor Rechnen; nogpo-Schalter; Org-Store irreversibel; Breaking-Updates ereignisgetrieben; Copilot-Konflikt-Satz
## CIO fehlt
P1 Governance-Block als eigene CATS ['gov'] (#7B5EA7): govIntake einmalig je Variante (paid 4·8·16, oss 8·24·60, deneb 4·12·30, core 0·2·6), govStore h/J (2·6·16 / 6·16·40 / 4·10·24 / 0·0·2), govReview (2·6·16 / 8·20·48 / 4·12·30 / 0·1·4), govTenant (2·4·10 / 4·10·24 / 4·10·24 / 1·2·4), govAudit (2·6·16 / 4·10·24 / 6·16·40 / 8·20·50), global govPer1000 Viewer [4·10·24] h/J; alles zu rateInt
P1 certonly → K.O. für nicht zertifiziertes OSS (Unterschalter „Ist euer OSS-Visual zertifiziert?"), Option „Zertifizierung anstoßen" certH [40·120·300] h + Wartezeit
P1 Capacity: capacityCost [50k·105k·210k] €/J × cuUplift % (paid 0·1·3, oss 0·1·3, deneb 0·2·5, core 2·6·15) + Warnung „springt statt wächst"
P1 Betriebsmodell: MODES ent/man/ss {ownerShare .10/.25/1.0, reuseF .8/1/1.4, variantF 1/1.6/3, supF .8/1/1.3, govF 1/1.2/1.6}; owners=max(2,ceil(creators·ownerShare)); Schulung: owners·trainH + (creators−owners)·lightH (2·4·8 / 2·4·8 / 4·8·16 / 4·8·20) + churn·(trainH+rampH (8·16·40 / 16·32·80 / 40·120·240 / 24·80·160)); guardrail=(6−cap(design))/4; variantEff=1+(variantF−1)·guardrail auf Wartung → deneb Schulung 189k→49k, deneb ≈ core
P2 REQS: sla [5,1,2,5] S; secdoc [4,1,2,5] S; datares „keine Verarbeitung außerhalb Tenant" [4,2,5,5] M; escrow [2,5,5,4] C; bus [5,3,2,3] S; office (PPT-Add-in/Teams) [5,3,4,5] S
P2 Gegenrisiko „Microsoft liefert nativ" obsolete % (paid 10·20·35, oss 15·25·40, deneb 15·25·40, core 30·50·70) × (setup+dev+build) = entwerteter Aufbau
P2 Standardisierungs-Dividende = Kosten(variantF=3) − Kosten(1)
## (a) Viewer-Skalierung
a1 supH100 Support-h je 100 Viewer/J: paid 2·4·8, oss 3·6·12, deneb 4·8·16, core 5·12·24 (× rateInt × H × vAvg/100)
a2 demand1000 zusätzliche Reports je 1.000 Viewer/J global [1·2·4] → reportsTotal
a3 licAdmH100 (paid) [0,5·1,5·4] h je 100 Nutzer/J
viewersAvg über Horizont für alle Posten und als Nenner
Reihenfolge: a1 → Indifferenzpreis → (b) Betriebsmodell → (c) Governance → certonly K.O. → Cashflow/NPV, Migration, Nutzen
Interessenkonflikt: Hinweis unter Headline wenn oss Platz 1 („gewinnt, weil devH=0 h unterstellt")
