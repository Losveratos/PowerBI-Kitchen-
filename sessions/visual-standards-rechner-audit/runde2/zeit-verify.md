# Gegenpruefung: Lizenzpreis-Steigerung (Fund "zeit", assumption)

## Heute im Rechner
- Zeile 553: `licInfl` paid `[0,4,12]` %, Badge **F**, srcNote nennt bereits Power-BI-Pro-+40%-Analogie (~3,4%/Jahr).
- Formel Zeile 701: `inf=1+p('licInfl')/100` glatt exponentiell ueber alle Jahre, kein Stufenmechanismus.
- Kein `licStep`, kein `LIC_TERM` im Code vorhanden. Modellwechsel-Risiko nur implizit ueber den hohen "max"-Wert (12%) abgedeckt, nicht separat sichtbar.

## Verifikation der Evidenz (WebSearch, nicht blockierte Snippets)
- **Vertice SaaS Inflation Index**: bestaetigt aus Sekundaerquellen (resubly.com, softwareseni.com, brandsit.pl) — 11,4% (Jan 2025), 14,2% (Mai 2026), 16,4% (Juni 2026, "highest on record"). Trend nach oben real, aber Vertice misst Enterprise-SaaS-Portfolios breit (u.a. KI-Bundling-Effekte 2026), nicht spezifisch Nischen-Power-BI-Visual-Vendoren mit <50 Mitarbeitern.
- **Inforiver Developer-Lizenz**: bestaetigt (inforiver.com/blog, Feb 2024) — Preis stieg Nov 2023 von 150$ auf 245$/Monat/Dev, dann Feb 2024 fuer Neukunden abgeschafft, Bestandskunden ein weiteres Jahr zu 2.500$/Dev/Jahr, danach Named-User-Modell. Deckt sich mit dem Fund, auch wenn die Details (245$ Zwischenschritt) im Fund nicht erwaehnt sind.
- **Power BI Pro +40%**: bestaetigt (theregister.com, powerbi.microsoft.com) — 10$→14$ zum 01.04.2025, "first in almost a decade". Das ist bereits in der bestehenden srcNote verarbeitet.
- Zebra-Pricing-Umstellung 2025: nur ueber Snippet plausibel, nicht tief verifiziert, aber konsistent mit bekanntem SaaS-Trend zu gestaffelten Tiers.

Die Evidenz traegt die Kernaussage: **0% Minimum ueber 10 Jahre ist unrealistisch optimistisch**, sowohl fuer den Nischen-Fall (Inforiver/Zebra Modellwechsel real dokumentiert) als auch fuer den breiten SaaS-Trend (Vertice). "Keine öffentliche Preiserhöhung auffindbar" ist tatsächlich kein Beleg für 0% – die Erhöhungen laufen über Modellwechsel/Tier-Umbau, nicht über einen sichtbaren Listenpreis-Anstieg des bestehenden Produkts.

## Bewertung des Vorschlags
1. **licInfl-Minimum > 0 anheben**: klar richtig und gut belegt. `[0,4,12]` mit Min=0 ist die schwaechste Stelle.
2. **licStep als separate Stufenfunktion (LIC_TERM=3, [0,10,30]%) plus Formel-Eingriff in `calc()`/`c.cf`**: inhaltlich nachvollziehbar (Modellwechsel sind eher Sprung- als Dauerinflation), aber:
   - Erhoehtes Risiko der Doppelzaehlung: `licInfl` "wahrscheinlich"=4% ueberschneidet sich mit dem, was `licStep` abdecken soll (Preissprung *ist* meist die einzige Preisaenderung, keine zusaetzliche zur laufenden Inflation).
   - Zwei neue Parameter (`licStep`, `LIC_TERM`) für ein Modell, das laut CLAUDE.md/Design-Vorgabe im Kern stabil bleiben soll ("JS-Render-Logik nicht aendern" gilt zwar nur für UI-Rendering, aber `calc()` ist die sensibelste Stelle im Tool — Eingriffe dort erhoehen Verifikations-Aufwand für Runde-2-Reviewer erheblich).
   - Die Erwartungswert-Rechnung "≈8-9%/Jahr" im Fund ist mit den genannten Werten nachvollziehbar (Kontrolle: 1,04 × 1,10^(1/3) − 1 ≈ 7,3%/Jahr bei den "wahrscheinlich"-Werten, nicht ganz 8-9%, aber in der Groessenordnung plausibel unter Beruecksichtigung von Varianz).
3. Einfachere, risikoärmere Alternative, die denselben Effekt erzielt, ohne die Rechenkern-Formel zu verzweigen: **nur den Range von `licInfl` anheben** und das Modellwechsel-Risiko textuell in `TEXT.paid.hidden` verankern (wie vom Fund selbst vorgeschlagen), statt eine zweite multiplikative Variable einzufuehren.

## Urteil
**Nicht widerlegt** (refuted=false) – Kernaussage und Evidenz sind belastbar, der Rechner verbessert sich durch die Korrektur. Der Vorschlag wird aber **angepasst**: Minimum anheben und Badge von F auf S hochstufen (jetzt vendor-spezifisch belegt statt reiner Annahme), aber **ohne** die zusaetzliche `licStep`/`LIC_TERM`-Formelerweiterung — das Modellwechsel-Risiko wird stattdessen im bereits vorhandenen Range (via hoeherem "max") und im Hidden-Text abgebildet, um den Rechenkern nicht unnoetig zu verkomplizieren.

**Angepasster Wert:** `licInfl` paid `[1,5,15]` %, Badge **S** (vorher F). Zusatz in `TEXT.paid.hidden`: "Preissprünge kommen meist als Modellwechsel, nicht als Listenpreiserhöhung: Inforiver Developer-Lizenz 2024 abgeschafft (Nov 2023 150→245$/Monat, dann Named-User), Zebra BI Paketstruktur 2025 umgestellt (Free/Starter/Business/Enterprise)." srcNote entsprechend erweitern um Vertice-Referenz und Inforiver-Blog-Link.

Quellen:
- https://www.vertice.one/insights/saas-inflation-rate (blockiert, Zahlen über Sekundärquellen bestätigt: https://resubly.com/blog/saas-inflation-12-percent-2026/, https://www.softwareseni.com/why-saas-prices-are-rising-4x-faster-than-inflation-and-what-you-can-do-about-it/)
- https://inforiver.com/blog/general/inforiver-developer-based-subscription-pricing/
- https://inforiver.com/blog/general/matrix-retiring-developer-only-subscription-plan/
- https://powerbi.microsoft.com/en-us/blog/important-update-to-microsoft-power-bi-pricing/
- https://www.theregister.com/2025/04/02/microsoft_power_bi_hikes/
