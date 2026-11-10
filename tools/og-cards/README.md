# og-cards

Open-Graph-Vorschaubilder (1200x630 PNG) für LinkedIn & Co.: `zwei-heimaten` (Story) und `wohlstandsatlas`.

Aufruf (Repo-Root, Node + vorinstalliertes Playwright): `node tools/og-cards/build.js`
Ausgabe: `assets/og/zwei-heimaten.png`, `assets/og/wohlstandsatlas.png`.

- Die Karten sind HTML (`*.html`), Schriften lokal aus `assets/fonts/`, keine externen Requests.
- Zahlen und Quadrate der Story-Karte werden beim Build aus `wohlstand-story/data/story_data.json` gelesen (kein eingecheckter Zwischenstand).
- Die Atlas-Karte wird beim Build live von `wohlstandsatlas.html` (eigener Server, Port 8766) als Canvas-Screenshot aufgenommen und eingesetzt.
- Nach Änderungen an Daten oder Atlas-Design neu bauen und die PNGs mit committen.
