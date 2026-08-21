# Country Indicator Explorer — Lebenszufriedenheit und ihre Korrelate

> Interaktiver Explorer: Wie Lebenszufriedenheit mit Wohlstand, Institutionen und Gesundheit in 164 Laendern zusammenhaengt — 15 Indikatoren, Pearson-Korrelationen, OLS-Trendlinien, Regionenfilter.

- **Quelle:** https://datenwgknowledgekitchen.com/laender-indikatoren-explorer.html
- **Autor:** Michael Tenner · Daten-WG Knowledge Kitchen
- **Extrahiert aus:** `laender-indikatoren-explorer.html` · Stand 2026-08-14 (Git-Commit-Datum der Quelldatei)
- **Zitierhinweis:** Michael Tenner, Daten-WG Knowledge Kitchen, https://datenwgknowledgekitchen.com/laender-indikatoren-explorer.html — Abruf mit Datum angeben. Weiterverwendung mit Quellenangabe erwuenscht.
- **Hinweis fuer Agenten:** Diese Markdown-Fassung enthaelt den Fliesstext der Seite. Interaktive Elemente (Regler, Filter, animierte Charts) sind nur in der HTML-Fassung nutzbar; die zugehoerigen Zahlen stehen hier als Tabelle.
- **Datendownload:** https://datenwgknowledgekitchen.com/assets/country_data_15_indicators.csv (164 Laender × 15 Indikatoren, UTF-8, komma-getrennt)
- **Wichtige Einschraenkung:** Laender-Korrelationen sind deskriptiv, nicht kausal. Spitzensteuersaetze sind statutarische Hoechstsaetze und sagen nichts ueber die effektive Steuerlast.

---
Pick a Y-axis variable — every other indicator is plotted against it, with Pearson’s r and an OLS trendline (GDP per capita is always on a log₁₀ scale). Choose the lead variable (Y-axis) and toggle which indicators to plot against it. Panels are sorted by correlation strength (|r|, strongest first). Click the region chips to filter continents (r, ranking and panel order update). Hover a country in the list (or search it) to see all its values, ranks and distribution position — and to highlight it in every plot. Click a row or a dot to pin it. Set a reference country to keep it labelled in all plots; dot area scales with population.

**Sources:** Gapminder compilations (World Happiness Report, World Bank Gini, GDP per capita PPP, UNDP HDI, UN life expectancy, EIU Democracy Index, Transparency International CPI, ILO unemployment) · RSF World Press Freedom Index 2025 · Trading Economics top personal income tax rates 2025/26. Latest available value per country (happiness mostly 2023). r is computed on the values shown (log₁₀ for GDP) within the active region filter.

### Daten zum Download

`country_data_15_indicators.csv` — 164 Länder × 15 Indikatoren (plus Bevölkerung, Region, ISO2). UTF-8, komma-getrennt, ~21 KB.

### Quellen je Indikator

Sofern nicht anders vermerkt, sind die Werte über **Gapminder** (CC BY 4.0) harmonisiert, das mehrere Primärquellen bündelt — Einzelwerte können daher leicht von den Originalpublikationen abweichen. „Neuester ≤ 2024" heißt: jüngste verfügbare Beobachtung pro Land bis 2024, Projektionen darüber hinaus ausgeschlossen.

| Indikator | Primärquelle | Stand / Jahr |
|---|---|---|
| Lebenszufriedenheit (0–10) | World Happiness Report (via Gapminder) | überw. 2023 |
| BIP pro Kopf (PPP) | Weltbank / Maddison (via Gapminder) | 2024 |
| HDI | UNDP (via Gapminder) | 2023 |
| Lebenserwartung | UN WPP / IHME (via Gapminder) | 2024 |
| Demokratie-Index | Economist Intelligence Unit (via Gapminder) | neuester ≤ 2024 |
| Korruptionswahrnehmung (CPI) | Transparency International (via Gapminder) | 2023 |
| Gini (Einkommen) | Weltbank (via Gapminder) | neuester ≤ 2024 |
| Arbeitslosenquote | ILO / Weltbank (via Gapminder) | neuester ≤ 2024 |
| Steuerquote (% BIP) | Weltbank (via Gapminder) | neuester ≤ 2024 (oft ~2018–2022) |
| Suizidrate (pro 100 000) | WHO / IHME (via Gapminder) | neuester ≤ 2024 |
| Urbanisierung (%) | UN / Weltbank (via Gapminder) | 2024 |
| Internetnutzung (%) | ITU / Weltbank (via Gapminder) | 2024 |
| Wochenarbeitszeit | ILO (via Gapminder) | neuester ≤ 2024 |
| Spitzensteuersatz (%) | Trading Economics | 2025/26 |
| Pressefreiheit (RSF) | Reporter ohne Grenzen | 2025 |
| Bevölkerung (Blasengröße) | Gapminder | 2024 |

Lizenz: Gapminder-Daten unter CC BY 4.0. Spitzensteuersätze sind statutarische Höchstsätze (Trading Economics) und sagen nichts über die effektive Steuerlast. Länder-Korrelationen sind deskriptiv, nicht kausal.
