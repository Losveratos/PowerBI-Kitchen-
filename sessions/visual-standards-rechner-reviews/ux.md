# UX/UI-Review (Opus) · Messwerte: Seite 8.246 px @1024, Ergebnis bei 3.400 px, 51 sichtbare Felder Schritt 4, 240 Kästchen 8×8 px, 0 :focus-Regeln, Chart-Schrift 6,6–8,1 px @1024, update() 43–49 ms, Druck 12 Seiten
P1-1 ★ Sticky-Leiste invertiert (zeigt nur unterhalb des Ergebnisses) → IntersectionObserver !isIntersecting; Inhalt: Platz 1 Name Betrag · Platz 2 +Δ · n ausgeschlossen · ↓ zum Ergebnis; .section{scroll-margin-top:48px}
P1-2 ★ Charts auf Beamer unlesbar → unter 1280 px Charts volle Breite; SVG-Schriften ×1,6 (8,5→14, 9,5→15, 10,5→17)
P1-3 CATCOL wiederverwendet Optionsfarben (Orange=Lizenz UND Paid) → neutrale Sand/Grau-Rampe für Kostenarten; große Segmente direkt beschriften
P1-4 ★ Druck: weiß auf weiß (.result-headline, .conflict, prio.active, seg.active, cap i.on) + nur aktiver Annahmen-Tab gedruckt → print-color-adjust:exact + Fallback-Rahmen; beforeprint alle vier Tabs rendern
P1-5 ★ Kein Feedback bei Prio/Kästchen/Flag/Annahme, alter Toast bleibt 3,5 s → Toast mit Wirkung („… ist jetzt Must → Platz 1: X 48.600 € · 3 ausgeschlossen"), KPI-Karte flash
P1-6 Sackgasse alle K.O. (ibcscert=M + nobudget) ohne Konflikt-Box (Regel prüft nur Flag) → Regel auf prio ausweiten; Headline nennt Blocker + Buttons „auf Should setzen" / „Budget freigeben"
P1-7 ★ Schritt 2 nicht tastaturbedienbar, 8 px Ziele, keine :focus-visible-Regel, Slider ohne Label, keine aria-pressed → focus-visible outline; .cap i 14px+padding=24px; Prio-Buttons 28px; role=radiogroup/radio; aria-label auf ranges
P1-8 Optionsfarben als Text unter 4,5:1 (core 2,17, oss 2,82, paid 3,2) → Text-Varianten --o-*-t (#A63A16 #0E6B4A #1B4F91 #8A5E00); excluded: grayscale statt opacity
P1-9 Headline verschweigt Zielkonflikt (OSS 86 k€ Score 54 % vs Paid 1,32 Mio Score 87 %) → zweiteilige Headline immer; Modellgrenze-Text unter Break-even („Linien sind Untergrenze")
P2-1 Kumuliert-Labels überlappen („Ma5yver") → labY-Block übernehmen
P2-2 Whisker im Balken → Balken 16 px, Whisker y+22
P2-3 Achsenticks nicht gerundet (25.700/51.400…) → niceMax()
P2-4 Tornado: nur ein Wert je Zeile, keine Achse, Basis EW 35.900 ≠ P50 32.600 unerklärt; devH [0,0,400] größter Ausschlag → beide Werte, Achsenenden „günstiger/teurer", Untertitel
P2-5 Reihenfolge inkonsistent (KPI nach Rang, Rest nach OPTS) → ranked.concat(excluded) überall
P2-6 Tabellen-Header links, Werte rechts; nur Tag statt Name → th right-align, Name + Tag
P2-7 Schritt 4: 153 Felder → Progressive Disclosure: globale + 3 wirkungsstärkste je Ansatz, Rest in <details>; Einleitungssatz „müssen nicht angefasst werden"
P2-8 Zahleneingabe korrigiert still ([500,500,500]), negative Werte akzeptiert → min=0, Toast bei Auto-Korrektur
P2-9 6.000 MC-Läufe je Slider-Event → debounce 120 ms, schnelle Teile sofort
P2-10 Excel-CDN im Konferenz-WLAN oft geblockt; CSV-Fallback ohne Annahmen → xlsx.full.min.js lokal neben HTML, CDN als Zweitversuch; CSV um Annahmen/Anforderungen erweitern
P2-11 Break-even-Schwellen nur im Text → Punkte im Chart, Text sortiert, „bereits überschritten"
P2-12 Vier Namen je Option (3rd-Party paid/Easy/3RD-PARTY PAID/Paid) → überall Name (Tag)
P2-13 Mobil 20 Bildschirme, req-Tabelle scrollt ohne Affordanz → Schatten-Hinweis, <640 px Spaltenwahl
P2-14 Optionskarten 48 Bullets → Kernaussage fett, Rest <details>, dynamische Sätze nach oben
P3 tornado nicht im Hash; fmtEur mischt Einheiten; „J0..J5" → „Jahr 0"; prompt()-Dialoge → Inline-Zeile; Share-Fallback prompt → Readonly-Input; Stepper ohne aria-current/Scrollspy; reduced-motion/forced-colors; Charts ohne Datenalternative (aria-describedby auf Tabelle)
Behalten: K.O. unter dem Strich mit Preisschild; Badges V/S/F/E; Gewichtungsregler mit Warnung; P10/P50/P90 + Spread-Warnung; CSV-Fallback + Hash-Link
