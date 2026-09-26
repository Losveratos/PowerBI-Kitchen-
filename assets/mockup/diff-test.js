/* MockupKitchen · diff.js Selbsttest (Node)
 * Aufruf: node assets/mockup/diff-test.js
 * Lädt i18n.js (mit einem kleinen document-Stub) für echte DE/EN-Texte und prüft den Vergleich zweier Stände:
 * Design-Felder (Ecken, Farben, Abstände, Typografie), Fachsprache statt interner Werte, Seiten-Umbenennung,
 * Anführungszeichen je Sprache, Markdown-Kopie ohne IDs und ohne rohes HTML.
 */
'use strict';
global.window = global.window || global;
global.document = global.document || { documentElement: { setAttribute: function () {} } };
require('./i18n.js');
require('./diff.js');
var I18N = global.window.MK_I18N, D = global.window.MK_DIFF;
var de = function (k, v) { return I18N.tl('de', k, v); };
var en = function (k, v) { return I18N.tl('en', k, v); };

var failures = 0, passed = 0;
function assert(cond, msg) { if (cond) passed++; else { failures++; console.error('FAIL: ' + msg); } }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function leaf(id, visual) { return { type: 'leaf', id: id, visual: visual || null }; }
function vis(kind, title, extra) { return Object.assign({ kind: kind, engine: 'ck', title: title, roles: {} }, extra || {}); }

// ---------------------------------------------------------------- Grundzustand (zwei Seiten)
function base() {
  return {
    version: 2, name: 'Test', canvas: { w: 1920, h: 1080, preset: '1920x1080' }, spacing: { margin: 16, gutter: 12, pad: 8 },
    chrome: { header: { on: true, title: 'Umsatz', sub: '', logoPos: 'left' }, nav: { on: false }, filter: { on: true, side: 'right', fields: [] }, footer: { on: true, text: 'Stand' } },
    design: { radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D', palette: 'teal', nativePalette: 'neutral', pageBgHex: '#F4F4F1', tileBg: '#FFFFFF', ink: '#0F1E2E', headerBg: '#0F1E2E', headerInk: '#FFFFFF' },
    pages: [
      { id: 'p1', name: 'Übersicht', layout: { type: 'split', dir: 'row', children: [
        { size: 1, node: leaf('a', vis('kpi', 'Umsatz', { roles: { ac: [{ table: 'Sales', name: 'Umsatz' }] }, status: 'agreed' })) },
        { size: 1, node: leaf('b', vis('columns', 'Umsatz je Monat')) }
      ] } },
      { id: 'p2', name: 'Details', layout: leaf('c', vis('bars', 'Top Kunden')) }
    ]
  };
}
function run(older, newer, t) { var res = D.compare(D.fromState(older), D.fromState(newer)); return { res: res, html: D.render(res, t || de), md: D.markdown(res, t || de, { older: 'alt.json', newer: 'aktuell' }) }; }

// ---------------------------------------------------------------- B44: Eckenradius und weitere Design-Felder
(function () {
  var a = base(), b = base(); b.design.radius = 0;
  var r = run(a, b);
  assert(r.res.counts.total === 1 && r.res.counts.design === 1, 'nur Radius geändert → genau 1 Design-Änderung, war ' + JSON.stringify(r.res.counts));
  assert(r.res.design[0] && r.res.design[0].what === 'radius', 'Design-Eintrag heißt radius');
  assert(r.html.indexOf('Kachel-Ecken') >= 0 && r.html.indexOf('gerundet (8 px)') >= 0 && r.html.indexOf('eckig') >= 0, 'Radius in Fachsprache (Kachel-Ecken: gerundet (8 px) → eckig): ' + r.html);
  assert(r.html.indexOf('Keine Unterschiede') < 0, 'kein falsches „Keine Unterschiede"');

  var c = base(); c.design.tileBg = '#fafafa'; c.design.ink = '#111111'; c.spacing.gutter = 16; c.design.typo = { title: 14 };
  var r2 = run(a, c);
  var keys = r2.res.design.map(function (d) { return d.what; }).sort().join(',');
  assert(keys === 'gutter,ink,tileBg,typoTitle', 'tileBg, ink, Zwischenraum, Typografie erkannt: ' + keys);
  assert(r2.html.indexOf('Zwischenraum') >= 0 && r2.html.indexOf('12 px') >= 0 && r2.html.indexOf('16 px') >= 0, 'Zwischenraum in px');

  // Kleinschreibung aus dem Farbwähler ist keine Änderung
  var d1 = base(); d1.design.accent = '#c25a2d';
  assert(run(a, d1).res.counts.total === 0, 'Hex-Groß/Kleinschreibung zählt nicht');
  // Kopfband-Farben zählen nur beim Stil „eigene Farben"
  var e1 = base(); e1.design.headerBg = '#123456';
  assert(run(a, e1).res.counts.total === 0, 'headerBg ohne custom-Stil ist unsichtbar → keine Änderung');
  var e2 = base(); e2.design.header = 'custom'; e2.design.headerBg = '#123456';
  var r3 = run(a, e2); var k3 = r3.res.design.map(function (d) { return d.what; }).sort().join(',');
  assert(k3 === 'headerBg,headerInk,headerStyle', 'custom-Kopfband: Stil + Farben, war ' + k3);
  assert(r3.html.indexOf('eigene Farben') >= 0, 'Kopfband-Stil übersetzt');
  // ältere Datei ohne neue Design-Felder: keine Scheinänderungen
  var old = base(); delete old.design.tileBg; delete old.design.ink; delete old.design.nativePalette;
  assert(run(old, a).res.counts.total === 0, 'fehlende Felder im alten Stand = Standardwerte');
})();

// ---------------------------------------------------------------- B45: Fachsprache statt interner Werte
(function () {
  var a = base(), b = base();
  var va = b.pages[0].layout.children[0].node.visual; va.status = 'approved'; va.link = 'p2';
  var r = run(a, b);
  assert(r.html.indexOf('abgestimmt') >= 0 && r.html.indexOf('abgenommen') >= 0, 'Status übersetzt (abgestimmt → abgenommen)');
  assert(r.html.indexOf('agreed') < 0 && r.html.indexOf('approved') < 0, 'keine englischen Status-Schlüssel in DE');
  assert(r.html.indexOf('Details') >= 0 && r.html.indexOf('>p2<') < 0 && r.html.indexOf(' p2') < 0, 'Drill-through zeigt Seitennamen statt ID');
  var rEn = run(a, b, en);
  assert(rEn.html.indexOf('agreed') >= 0 && rEn.html.indexOf('approved') >= 0, 'EN: Status englisch');

  // Baumpfad ändert sich, Rechteck nicht → keine Positionsänderung
  var c = base(); c.pages[1].layout = { type: 'split', dir: 'col', children: [{ size: 1, node: leaf('c', vis('bars', 'Top Kunden')) }] };
  assert(run(a, c).res.counts.total === 0, 'nur Baumpfad anders, gleiches Rechteck → keine Änderung');
  // Nachbar entfernt → Kachel wird breiter: Folgeverschiebung, keine eigene Änderung der Nachbarkachel
  var d = base(); d.pages[0].layout = leaf('a', clone(a.pages[0].layout.children[0].node.visual));
  var rd = run(a, d);
  assert(rd.res.counts.removed === 1 && rd.res.counts.changed === 0, 'Nachbar entfernt: 1 entfernt, 0 geändert, war ' + JSON.stringify(rd.res.counts));
  assert(rd.res.reflow['Übersicht'] === 1 && rd.html.indexOf('1 Kachel(n) durch neue oder entfernte Kacheln') >= 0, 'Folgeverschiebung als eine Zeile je Seite');
  assert(rd.md.indexOf('- 1 Kachel(n) durch neue oder entfernte Kacheln') >= 0, 'Folgeverschiebung auch in der Markdown-Kopie');
  // eigene Änderung (Trennlinie gezogen, nichts entfernt) → Position als Rechteck statt „0.1 → 0.0"
  var g = base(); g.pages[0].layout.children[0].size = 3;
  var rg = run(a, g);
  assert(rg.res.counts.changed === 2, 'Trennlinie verschoben → 2 Kacheln geändert, war ' + rg.res.counts.changed);
  assert(/x 0 · y 0 · 50 × 100 %<\/s> → x 0 · y 0 · 75 × 100 %/.test(rg.html), 'Position als Rechteck: ' + rg.html);
  assert(!/Position[^<]*<\/em>: <s>\d+(\.\d+)*<\/s>/.test(rg.html), 'kein Baumpfad als Position');
  // Nachbar entfernt UND Status geändert: Status bleibt, Position fällt in die Folgeverschiebung
  var h = clone(d); h.pages[0].layout.visual.status = 'approved';
  var rh = run(a, h);
  assert(rh.res.counts.changed === 1 && rh.res.changed[0].details.length === 1 && rh.res.changed[0].details[0].what === 'status', 'nur der Status bleibt als Änderung');
  // mit Geometrie aus app.js: px
  var rects = function (p) { var m = {}; if (p.id === 'p1') { m.a = { x: 24, y: 80, w: 400, h: 300 }; m.b = { x: 436, y: 80, w: 400, h: 300 }; } else m.c = { x: 24, y: 80, w: 812, h: 300 }; return m; };
  var rp = D.compare(D.fromState(a, { rects: rects }), D.fromState(a, { rects: rects }));
  assert(rp.counts.total === 0, 'gleiche Geometrie → keine Änderung');
  var s1 = D.fromState(a, { rects: rects }); assert(s1.items[0].pos.unit === 'px' && s1.items[0].pos.w === 400, 'px-Rechteck aus opts.rects');

  // Verhalten: Cross-Filter aus wird erkannt und übersetzt (früher fiel false weg)
  var e = base(); e.pages[0].layout.children[1].node.visual.interaction = { crossFilter: false };
  var re = run(a, e);
  assert(re.res.counts.changed === 1 && re.html.indexOf('kein Cross-Filter') >= 0, 'Cross-Filter aus erkannt und übersetzt');
  // Analyse je Angabe, mit Labels
  var f = base(); f.pages[0].layout.children[0].node.visual.analysis = { sort: { by: 'value', dir: 'desc' } };
  var rf = run(a, f);
  assert(rf.html.indexOf('Sortierung') >= 0 && rf.html.indexOf('nach Wert, absteigend') >= 0 && rf.html.indexOf('{') < 0, 'Sortierung in Fachsprache, kein JSON');
})();

// ---------------------------------------------------------------- B45: Export-Spec gegen Export-Spec
(function () {
  function spec(link, pageName) {
    return { meta: { specVersion: 3 }, report: { name: 'T' }, canvas: { width: 1920, height: 1080 }, design: { cornerRadius: 12, tileStyle: 'border', pageBackground: '#F4F4F1', tileBackground: '#FFFFFF', headerStyle: 'light', accent: '#C25A2D', colors: { ink: '#0F1E2E' } },
      zones: {}, pages: [{ id: 'p1', name: 'Übersicht', visuals: [{ id: 'mk_a', kind: 'kpi', engine: 'ck', title: 'Umsatz', roles: {}, rect: { x: 1, y: 2, w: 3, h: 4 }, workshop: { status: 'open' },
        analysis: { polarity: 'higher', polarityAuto: true, deltaKind: ['abs', 'rel'], sort: null },
        interaction: { drillDown: false, crossFilter: true, drillThrough: link ? { pageId: 'p2', pageName: pageName, field: 'DimDate.Month' } : null }, link: link ? { pageId: 'p2', pageName: pageName } : null }] },
      { id: 'p2', name: pageName, visuals: [] }] };
  }
  var r = D.compare(D.fromSpec(spec(true, 'Details')), D.fromSpec(spec(false, 'Details')));
  var html = D.render(r, de);
  assert(r.counts.changed === 1, 'Drill-through entfernt → 1 Änderung');
  assert(html.indexOf('pageId') < 0 && html.indexOf('{') < 0, 'kein rohes JSON aus der Spec: ' + html);
  assert(html.indexOf('Details') >= 0, 'Zielseite mit Namen');
  var r2 = D.compare(D.fromSpec(spec(true, 'Details')), D.fromSpec(spec(true, 'Details Region')));
  assert(r2.counts.changed === 0 && r2.counts.pages === 1, 'Zielseite umbenannt → nur „Seiten: umbenannt"');
  var s3 = spec(true, 'Details'); s3.design.cornerRadius = 0;
  var r3 = D.compare(D.fromSpec(spec(true, 'Details')), D.fromSpec(s3));
  assert(r3.counts.design === 1 && D.render(r3, de).indexOf('12 px') >= 0, 'Spec: cornerRadius erkannt');
})();

// ---------------------------------------------------------------- B46: Seite umbenennen
(function () {
  var a = base(), b = base(); b.pages[0].name = 'Details Region';
  var r = run(a, b);
  assert(r.res.counts.changed === 0, 'Umbenennen markiert keine Kachel als geändert, war ' + r.res.counts.changed);
  assert(r.res.counts.pages === 1 && r.res.pages[0].type === 'renamed', 'genau ein Eintrag „umbenannt"');
  assert(r.res.counts.total === 1, 'insgesamt 1 Änderung');
  // echte Verschiebung auf eine andere Seite wird weiter gemeldet
  var c = base(); var moved = c.pages[0].layout.children[1].node; c.pages[0].layout = c.pages[0].layout.children[0].node;
  c.pages[1].layout = { type: 'split', dir: 'row', children: [{ size: 1, node: c.pages[1].layout }, { size: 1, node: moved }] };
  var rc = run(a, c);
  assert(rc.res.changed.some(function (x) { return x.details.some(function (d) { return d.what === 'page' && d.before === 'Übersicht' && d.after === 'Details'; }); }), 'Verschieben auf andere Seite bleibt sichtbar');
})();

// ---------------------------------------------------------------- B41: Anführungszeichen je Sprache, Markdown ohne IDs
(function () {
  var a = base(), b = base(); b.pages[0].layout.children[0].node.visual.title = 'Umsatz <b>neu</b>';
  var rEn = run(a, b, en), rDe = run(a, b, de);
  assert(rEn.html.indexOf('Page “Übersicht”') >= 0, 'EN: “…” in der Überschrift: ' + rEn.html.slice(0, 300));
  assert(rEn.html.indexOf('„') < 0, 'EN: kein deutsches „');
  assert(rEn.md.indexOf('## Page “Übersicht”') >= 0, 'EN: Markdown mit “…”');
  assert(rDe.html.indexOf('Seite „Übersicht&quot;') >= 0 && rDe.md.indexOf('## Seite „Übersicht"') >= 0, 'DE bleibt „…"');
  assert(rDe.md.indexOf('mk_') < 0, 'Markdown-Kopie ohne mk_-IDs');
  assert(rDe.html.indexOf('mk_a') >= 0, 'Dialog behält die ID zur Rückverfolgung');
  assert(rDe.md.indexOf('&lt;b>neu&lt;/b>') >= 0 && rDe.md.indexOf('<b>') < 0, 'Markdown: HTML im Titel entschärft');
  assert(rDe.html.indexOf('&lt;b&gt;') >= 0, 'HTML-Dialog escapet');
})();

console.log((failures ? 'FEHLER' : 'OK') + ': ' + passed + ' bestanden, ' + failures + ' fehlgeschlagen');
process.exit(failures ? 1 : 0);
