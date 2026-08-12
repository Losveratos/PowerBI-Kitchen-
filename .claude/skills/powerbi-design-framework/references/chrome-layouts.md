# Chrome-Layouts — Zonen, Maße, Varianten

„Chrome" = alles, was nicht Daten-Visual ist: Kopfband, Navigation, Logo,
Filter-Panel, Fußleiste. Hier stehen durchgerechnete Varianten für beide
Canvas-Größen. Alle Werte in Canvas-Pixeln, alle auf dem 8-px-Raster.

Die Zonen-Koordinaten (`x, y, w, h`) aus der gewählten Variante wandern
1:1 in den `AGENT-BRIEF.md` — sie sind der Vertrag zwischen allen, die auf
der Seite Visuals platzieren.

## Canvas-Größen

| Canvas     | Wann                                            | Margin | Gutter |
| ---------- | ----------------------------------------------- | ------ | ------ |
| 1280×720   | Standard, Desktop + Service, Default            | 16     | 8–16   |
| 1920×1080  | große Monitore, Wandscreens, dichte Cockpits    | 24     | 16     |

Einstellen in Desktop: Seite anklicken → Format → Seiteninformationen /
Canvas-Einstellungen → Typ „Benutzerdefiniert", Breite/Höhe eintragen.

---

## Variante A · Kopfband-Navigation (Default)

```
┌────────────────────────────────────────────────────────────┐
│ [Logo]  Seitentitel            [Nav: Übersicht|Detail|…]   │ Kopfband 56px
├────────────────────────────────────────────┬───────────────┤
│  KPI 1   KPI 2   KPI 3   KPI 4             │               │
│                                            │  Filter-      │
│  ┌──────────────────────────┐ ┌──────────┐ │  Panel        │
│  │      Haupt-Visual        │ │  Detail  │ │  200px        │
│  └──────────────────────────┘ └──────────┘ │               │
├────────────────────────────────────────────┴───────────────┤
│ Datenstand · Quelle · Kontakt                              │ Fußleiste 24px
└────────────────────────────────────────────────────────────┘
```

Zonen bei **1280×720**, Filter-Panel rechts:

| Zone            | x    | y   | w    | h   | Hinweise                          |
| --------------- | ---- | --- | ---- | --- | --------------------------------- |
| Kopfband        | 0    | 0   | 1280 | 56  | Fläche: Ink- oder Akzentfarbe     |
| Logo            | 16   | 12  | ≤120 | 32  | Höhe fix 32, Breite proportional  |
| Seitentitel     | 152  | 14  | 400  | 28  | 16–20 pt Semibold                 |
| Nav-Buttons     | ab x=800, rechtsbündig bis 1264 | 12 | je 96–128 | 32 | aktiver Button = Akzent |
| Filter-Panel    | 1064 | 64  | 200  | 632 | eigene Fläche, 1 Ton dunkler als BG |
| Content-Bereich | 16   | 72  | 1032 | 616 | hier leben KPI-Reihe + Visuals    |
| Fußleiste       | 0    | 696 | 1280 | 24  | 8–9 pt, grau                      |

Content-Raster darin (KPI-Reihe + 2 Spalten):

| Slot           | x   | y   | w    | h   |
| -------------- | --- | --- | ---- | --- |
| KPI 1–4        | 16 / 276 / 536 / 796 | 72 | je 252 | 96 |
| Haupt-Visual   | 16  | 184 | 672  | 400 |
| Detail-Visual  | 704 | 184 | 344  | 400 |
| Leiste unten (optional, z. B. Tabelle) | 16 | 592 | 1032 | 96 |

(Filter-Panel links: Panel auf x=0, Content-Bereich auf x=216 verschieben;
Logo bleibt im Kopfband.)

## Variante B · Linke Nav-Leiste

Für Reports mit vielen Seiten (>5) oder App-artigem Charakter.

| Zone            | x   | y   | w    | h   | Hinweise                            |
| --------------- | --- | --- | ---- | --- | ----------------------------------- |
| Nav-Leiste      | 0   | 0   | 64   | 720 | Icons + Tooltips; aktiv = Akzent    |
| Logo            | 12  | 12  | 40   | 40  | quadratische Bildmarke oben         |
| Kopfband        | 64  | 0   | 1216 | 48  | Titel + Zeitraum                    |
| Filter-Panel    | 1064| 48  | 200  | 648 | rechts (links kollidiert mit Nav)   |
| Content-Bereich | 80  | 64  | 968  | 624 |                                     |
| Fußleiste       | 64  | 696 | 1216 | 24  |                                     |

## Variante C · Nur native Seitenreiter (minimal)

Kein eigenes Nav-Chrome; Kopfband schrumpft auf 48 px (Logo + Titel +
Zeitraum), Rest wie Variante A. Wählen, wenn der Report im Service mit
sichtbarem Seitenbereich konsumiert wird — dann Doppel-Navigation vermeiden.

---

## Filter-Panel im Detail

- **Fest (Default):** Rechteck-Shape als Panel-Hintergrund (1 Ton dunkler
  als Seiten-BG oder Ink mit 4–6 % Deckkraft), darauf Slicer gestapelt:
  Panel-Titel „Filter" (11 pt Semibold), dann je Slicer 8 px Abstand.
  Slicer-Stil: Dropdown spart Platz; Liste nur für ≤6 Werte.
- **Ausklappbar (Bookmark-Technik):** Zwei Bookmarks „Filter offen" /
  „Filter zu" (Panel + Slicer in der Auswahl gruppieren, Sichtbarkeit
  togglen, Bookmark ohne Datenzustand speichern!), Toggle-Button (Trichter-
  Icon) im Kopfband rechts. In STEPS.md die Klickfolge dokumentieren.
- Immer dazu: **Filter-Reset-Button** (Lesezeichen auf Default-Zustand)
  und sichtbarer Filterkontext (Textfeld oder `filterInfo`-Fußzeile bei
  ChartKitchen), damit niemand gefilterte Zahlen für Gesamtzahlen hält.

## Fußleiste im Detail

Ein Textfeld, 8–9 pt, Sekundärgrau, Muster:
`Stand: <Datenstand> · Quelle: <System> · Kontakt: <Team/Mail>`
Datenstand idealerweise als Measure (Karte statt statischem Text), damit er
nicht veraltet. Fußleiste gehört auf **jede** Seite an dieselbe Position —
Konsistenz ist hier der ganze Zweck.

## Logo-Praxis

- Im Kopfband: Höhe fix (32 px bei 56-px-Band), links; nie skalierend über
  Seiten hinweg variieren.
- Dunkles Kopfband → weiße/negative Logo-Variante beim Nutzer anfragen,
  statt das Farb-Logo auf dunklen Grund zu quetschen.
- Bild einfügen → als Bild-Element, Alt-Text „Logo <Firma>", aus der
  Tab-Reihenfolge nehmen (dekorativ).

## Konsistenz über Seiten

Das Chrome (Kopfband, Nav, Panel, Fußleiste) wird **einmal** gebaut und auf
jede Seite dupliziert (Strg+C/V hält Koordinaten exakt). Änderungen am
Chrome immer auf allen Seiten nachziehen — im AGENT-BRIEF als Regel
festhalten. Nav-Buttons: aktueller Seiten-Button im Zustand „Deaktiviert"
mit Akzentfarbe formatieren (zeigt „du bist hier" und ist nicht klickbar).
