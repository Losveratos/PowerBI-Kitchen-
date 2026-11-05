# Pruefrunde 3 · Visual-Standards-Rechner (11/2026)

Dritte Pruefrunde, nach der Umstellung auf eine zweisprachige Datei (v0.22). Drei Subagents, je eine
Fragestellung, alle gegen `visual-standards-rechner.html` auf Branch `feat/rechner-review`; die HTML wurde
von keinem Pruefer veraendert. Umsetzung in v0.23, siehe `md/visual-standards-rechner.md`.

| Bericht | Frage | Umfang | Ergebnis |
|---|---|---|---|
| `a1-grenzfaelle.md` (+ `.test.js`, `.log`) | Haelt der Rechenkern an den Raendern? Invarianten, Raster, Share-Link-Rundlauf | 26 Faelle, 187 Pruefungen | 7 Befunde (2 mittel, 5 niedrig); Kern-Invarianten tragen |
| `a2-leser.md` (+ `.test.js`) | Stimmen Saetze, Zahlen und Entscheidungslogik aus Sicht einer Controlling-Leitung? DE und EN | 5 Presets × 2 Sprachen, 778 Pruefungen | 10 Befunde (3 × Prio 1), Rechenkern in sich stimmig |
| `b-annahmen-oss.md` (+ `b-wirkung.js`, `.log`) | Passen die Annahmen zur Open-Source-Option zu dem, was Manifest, Doku und Changelog von ChartKitchen belegen? | 12 Stellen, Wirkung in zwei Presets quantifiziert | 10 Textkorrekturen, 2 belegte Stufenaenderungen (0 € Wirkung), Rest bewusst offen |

## Was umgesetzt wurde (v0.23)

- A1-B2/B3/B4 Obergrenzen je Annahme (Lernrate, Fremdanteil, Produktivitaetsgewinn); A1-B5 `readHash()` setzt den Experten-Override zurueck; A1-B7 Budget im Folgejahr (Tranchen, FTE, Kennzahl je Jahr).
- A1-B1 Volumenstaffel als guenstigste deckende Stufe — monoton; Beleg: Zebra-BI-Preisseite (Pakete), Abruf 06.11.2026.
- A2-B1/B3/B10 ein Kipp-Punkt und eine Verhandlungsgrenze (`crossViewers`, `negotiationCeiling`), keine Grenze bei Paid-K.O.
- A2-B2 Entscheidungsbaum rechnet live (`renderTree`).
- A2-B6/B8/B9 Versionsstaende, Historie bis v0.23, Tooltip ohne „0 %", Numerus.
- B Stufe a und b: Texte, Quellen, `datares` 3, `a11y` 3.
- Block C: fuenf Szenario-Presets, Klick-Handler setzt die Extras und nennt sie.

## Was offen bleibt

- B Stufe c (Einschaetzungen ohne Beleg): `govIntake`, `events`, `agentic` 4, Panel-Nachmessung `firstH`/`reuseH`, `support` 0; alles rund um AppSource erst nach einem Listing.
- A1-B6 Viewer-Deckel unter der Viewer-Zahl ersetzt die Eingabe still (Warnung waere angemessen).
- Anker „Zebra-Niveau" 90 · 170 · 300 € gegen die heutige Preisseite (65–70 € je Nutzer, Pakete) — Entscheidung des Eigentuemers, weil der Anker die Paid-Geschichte traegt.
- Die Wirkketten 2–7 aus Runde 2 (preisunelastische Report-Menge, Rollout-Tempolimit, Schluesselpersonen, Preissprung, Lernkurve vs. Fluktuation, Capacity) sind unveraendert offen.

## Interessenkonflikt

Die Open-Source-Option steht beispielhaft fuer ChartKitchen byDatenWG, das eigene Visual. Jede Aenderung an
OSS-Annahmen in dieser Runde stuetzt sich auf eine im Repo nachlesbare Tatsache (Manifest, Doku, Changelog, Code)
und traegt die Quelle in der Notiz; Einschaetzungen blieben unveraendert. Die Erfuellungsgrade bewegen keine
Kosten; keine Aenderung dieser Runde kippt eine Rangfolge.
