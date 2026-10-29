/* MockupKitchen · a11y.js Selbsttest (Node)
 * Aufruf: node assets/mockup/a11y-test.js
 * Baut einen kleinen Fake-Zustand (zwei Seiten) und eine Fake-computeAll-Ausgabe nach, statt echte
 * Layout-Geometrie zu berechnen — a11y.js ist bewusst ohne Abhängigkeit zu app.js/catalog.js.
 */
'use strict';
global.window = global.window || global;
require('./a11y.js');
var MK_A11Y = global.window.MK_A11Y;

var failures = 0, passed = 0;
function assert(cond, msg) {
  if (cond) { passed++; }
  else { failures++; console.error('FAIL: ' + msg); }
}
function approx(a, b, eps) { return Math.abs(a - b) <= (eps == null ? 0.05 : eps); }

// ---------------------------------------------------------------- contrastRatio()
(function testContrast() {
  var r1 = MK_A11Y.contrastRatio('#0F1E2E', '#FFFFFF');
  assert(approx(r1, 16.4, 0.5), 'contrastRatio(#0F1E2E, #FFFFFF) ~ 16.4:1, got ' + r1);

  var r2 = MK_A11Y.contrastRatio('#FFFFFF', '#C25A2D');
  assert(approx(r2, 4.4, 0.2), 'contrastRatio(#FFFFFF, #C25A2D) ~ 4.4:1, got ' + r2);

  // Symmetrie
  var r3 = MK_A11Y.contrastRatio('#C25A2D', '#FFFFFF');
  assert(approx(r3, r2, 0.001), 'contrastRatio is symmetric');

  // #rgb Kurzform
  var r4 = MK_A11Y.contrastRatio('#000', '#fff');
  assert(approx(r4, 21, 0.1), 'contrastRatio(#000, #fff) = 21:1, got ' + r4);

  // robust gegen kaputte Eingabe
  assert(MK_A11Y.contrastRatio('not-a-color', '#fff') === null, 'bad hex A -> null');
  assert(MK_A11Y.contrastRatio('#fff', null) === null, 'bad hex B -> null');
  assert(MK_A11Y.contrastRatio('#12345', '#fff') === null, 'wrong length -> null');
})();

// ---------------------------------------------------------------- Fake-Zustand
function leaf(id, visual) { return { id: id, type: 'leaf', visual: visual }; }
function split(id, dir, children) { return { id: id, type: 'split', dir: dir, children: children }; }

// Seite 1: dicht (10 Kacheln), eine winzige Kachel (unter Fehler-Schwelle), eine ohne Titel,
// tief verschachtelt (4 Ebenen), damit A11Y_DENSITY, A11Y_TILE_SMALL (error), A11Y_TITLE_MISSING und
// A11Y_READING_ORDER sicher auslösen.
var tinyLeaf = leaf('tile-tiny', { kind: 'kpi', title: 'Umsatz', roles: {}, analysis: {} });
var noTitleLeaf = leaf('tile-notitle', { kind: 'ncolumn', title: '', roles: {}, analysis: {} });
function normalLeaf(n) { return leaf('tile-' + n, { kind: 'ncolumn', title: 'Kachel ' + n, roles: {}, analysis: {} }); }

// vier Ebenen tief: split > split > split > split > leaf
var deepLeaf = leaf('tile-deep', { kind: 'ncolumn', title: 'Tief verschachtelt', roles: {}, analysis: {} });
var deepTree = split('s1', 'row', [
  { size: 1, node: split('s2', 'col', [
    { size: 1, node: split('s3', 'row', [
      { size: 1, node: split('s4', 'col', [
        { size: 1, node: deepLeaf }
      ]) }
    ]) }
  ]) }
]);

var page1Children = [
  { size: 1, node: tinyLeaf },
  { size: 1, node: noTitleLeaf }
];
for (var i = 1; i <= 8; i++) page1Children.push({ size: 1, node: normalLeaf(i) });
var page1Layout = split('root1', 'row', [
  { size: 1, node: split('root1a', 'col', page1Children.slice(0, 5)) },
  { size: 1, node: split('root1b', 'col', page1Children.slice(5)) }
]);

var page2Layout = deepTree;

var S = {
  lang: 'de',
  canvas: { w: 1280, h: 720 },
  chrome: {
    navPos: 'off',
    header: { on: true, navOn: false },
    filter: { on: true, fields: [ { table: 'Sales', name: '' }, { table: 'Sales', name: 'Region' } ] },
    footer: { on: true }
  },
  design: {
    ink: '#0F1E2E', tileBg: '#FFFFFF',       // gut lesbar
    header: 'custom', headerInk: '#444444', headerBg: '#3A3A3A', // schlechter Kontrast (~1.6:1)
    accent: '#C25A2D',
    palette: 'ibcs'
  },
  pages: [
    { id: 'p1', name: 'Übersicht', layout: page1Layout },
    { id: 'p2', name: 'Detail', layout: page2Layout }
  ]
};

// Fake computeAll()-Ergebnis je Seite (normalerweise von MK.computeAll(page) geliefert).
// Alle Kacheln bekommen ein normales Rect (300x200), außer der bewusst winzigen (80x40, unter 100x60 -> Fehler).
var computedByPage = {
  p1: {
    leaves: page1Children.map(function (c) {
      var rect = c.node === tinyLeaf ? { x: 0, y: 0, w: 80, h: 40 } : { x: 0, y: 0, w: 300, h: 200 };
      return { node: c.node, rect: rect };
    }),
    zones: {}
  },
  p2: {
    leaves: [ { node: deepLeaf, rect: { x: 0, y: 0, w: 300, h: 200 } } ],
    zones: {}
  }
};

var findings = MK_A11Y.check(S, computedByPage, { lang: 'de' });
var codes = findings.map(function (f) { return f.code; });
function has(code) { return codes.indexOf(code) >= 0; }

assert(has('A11Y_CONTRAST_HEADER'), 'expected A11Y_CONTRAST_HEADER, got codes: ' + codes.join(','));
assert(has('A11Y_PALETTE_COLOUR_ONLY'), 'expected A11Y_PALETTE_COLOUR_ONLY');
assert(has('A11Y_TILE_SMALL'), 'expected A11Y_TILE_SMALL');
assert(has('A11Y_TITLE_MISSING'), 'expected A11Y_TITLE_MISSING');
assert(has('A11Y_DENSITY'), 'expected A11Y_DENSITY (page1 has 10 tiles)');
assert(has('A11Y_READING_ORDER'), 'expected A11Y_READING_ORDER (page2 is 5 levels deep)');
assert(has('A11Y_NAV_OFF'), 'expected A11Y_NAV_OFF (nav off + 2 pages)');
assert(has('A11Y_SLICER_LABEL'), 'expected A11Y_SLICER_LABEL (one field without name)');
assert(!has('A11Y_CONTRAST_TEXT'), 'ink/tileBg is high contrast, should NOT fire A11Y_CONTRAST_TEXT');

// error level check for the tiny tile
var tinyFinding = findings.find(function (f) { return f.code === 'A11Y_TILE_SMALL' && f.visual === 'tile-tiny'; });
assert(!!tinyFinding && tinyFinding.level === 'error', 'tiny tile (80x40) must be level "error"');

// title-missing finding carries the right page/visual
var titleFinding = findings.find(function (f) { return f.code === 'A11Y_TITLE_MISSING'; });
assert(!!titleFinding && titleFinding.page === 'Übersicht' && titleFinding.visual === 'tile-notitle', 'title-missing finding has page/visual set');

// summary()
var sum = MK_A11Y.summary(findings, 'de');
assert(/Probleme/.test(sum) && /Hinweise/.test(sum), 'summary(de) mentions Probleme/Hinweise: ' + sum);
var sumEn = MK_A11Y.summary(findings, 'en');
assert(/issues/.test(sumEn) && /notes/.test(sumEn), 'summary(en) mentions issues/notes: ' + sumEn);
assert(MK_A11Y.summary([], 'de') === 'Keine Auffälligkeiten', 'summary([]) de');
assert(MK_A11Y.summary([], 'en') === 'No issues found', 'summary([]) en');

// guide()
var g = MK_A11Y.guide('de');
assert(Array.isArray(g) && g.length >= 8 && g.length <= 10, 'guide(de) has 8-10 items, got ' + g.length);
assert(g.every(function (x) { return x.title && x.text; }), 'every guide item has title+text');
var gEn = MK_A11Y.guide('en');
assert(gEn.length === g.length, 'guide(en) has same item count as guide(de)');

// renderList() / renderGuide()
var html = MK_A11Y.renderList(findings, 'de');
assert(/<ul class="a11y-list">/.test(html), 'renderList wraps in <ul class="a11y-list">');
assert(/a11y-err/.test(html) || /a11y-warn/.test(html), 'renderList uses level classes');
var emptyHtml = MK_A11Y.renderList([], 'de');
assert(/Keine Auffälligkeiten/.test(emptyHtml), 'renderList([]) shows "nothing found" message');

var guideHtml = MK_A11Y.renderGuide('de');
assert(/<details class="a11y-guide-item">/.test(guideHtml), 'renderGuide uses <details> blocks');
assert((guideHtml.match(/<summary>/g) || []).length === g.length, 'renderGuide has one <summary> per guide item');

// ---------------------------------------------------------------- Ergebnis
console.log('');
console.log('Codes gefunden: ' + codes.join(', '));
console.log(MK_A11Y.summary(findings, 'de'));
console.log('');
console.log(passed + ' Tests bestanden, ' + failures + ' fehlgeschlagen.');
if (failures) process.exit(1);
