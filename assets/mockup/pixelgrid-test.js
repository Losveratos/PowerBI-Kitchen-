/* MockupKitchen · pixelgrid.js Selbsttest (Node): node assets/mockup/pixelgrid-test.js
   Sollwerte aus KONZEPT-PIXELRASTER.md, Abschnitt 3 (Basis Rand 18, Zwischenraum 12, 12er-Raster) und dem
   Standardprojekt FHD. Dazu: Zonen ohne Rastermodus byte-gleich wie zones() in app.js bis 0.6.2. */
'use strict';
const PG = require('./pixelgrid.js');

let passed = 0, failures = 0;
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) passed++; else { failures++; console.error('FAIL: ' + msg + '\n  ist  ' + a + '\n  soll ' + e); }
}

const CHROME = filter => ({ nav: { on: false, w: 64 }, header: { on: true, h: 56 }, footer: { on: true, h: 24 }, filter: { on: filter, side: 'right', w: 200, topH: 56 } });
function rowOf(w, h, filter) {
  const L = PG.zones({ w, h }, CHROME(filter));
  const kpi = PG.place(L, 0, 3, 0, 12), col1 = PG.place(L, 0, 1, 0, 12);
  const h1 = PG.place(L, 0, 3, 0, 24, 24), h2 = PG.place(L, 3, 6, 0, 24, 24);
  return { g: L.g, rand: [L.margins.l, L.margins.r, L.margins.t, L.margins.b].join('/'), inhalt: L.content.w + 'x' + L.content.h,
    spalte: L.pitch.x / 12, col1: col1[2], kpi: kpi[2], zeile: L.pitch.y / 12, halb: h1[2] + '|' + h2[2] };
}

// ---- Tabelle „Standard-Chrome, Filter rechts" -----------------------------------
const MIT = [
  ['HD', 1280, 720, 12, '18/18/20/20', '1044x600', 88, 76, 252, 51, '120|120'],
  ['FHD', 1920, 1080, 18, '27/27/27/27', '1566x906', 132, 114, 378, 77, '180|180'],
  ['UHD', 3840, 2160, 36, '54/54/54/54', '3132x1812', 264, 228, 756, 154, '360|360'],
  ['4:3', 1280, 960, 12, '18/18/20/20', '1044x840', 88, 76, 252, 71, '120|120'],
  ['Hoch', 1080, 1920, 10, '16/17/13/14', '878x1826', 74, 64, 212, 153, '101|101'],
  ['1366', 1366, 768, 13, '19/19/17/18', '1115x647', 94, 81, 269, 55, '128|128'],
  ['1600', 1600, 900, 15, '22/23/23/24', '1305x753', 110, 95, 315, 64, '150|150'],
];
MIT.forEach(([name, w, h, g, rand, inhalt, spalte, col1, kpi, zeile, halb]) => {
  eq(rowOf(w, h, true), { g, rand, inhalt, spalte, col1, kpi, zeile, halb }, 'Filter rechts ' + name);
});

// ---- Tabelle „Ohne Filter" (Rand L/R/O/U, Spaltenschritt, 1 Spalte, KPI, halbe KPI; „±1 px" = nicht exakt) ----
const OHNE = [
  ['HD', 1280, 720, '16/16/20/20', 105, 93, 303, null],
  ['FHD', 1920, 1080, '27/27/27/27', 157, 139, 453, null],
  ['UHD', 3840, 2160, '54/54/54/54', 314, 278, 906, '435|435'],
  ['4:3', 1280, 960, '16/16/20/20', 105, 93, 303, null],
  ['Hoch', 1080, 1920, '17/17/13/14', 88, 78, 254, '122|122'],
  ['1366', 1366, 768, '17/18/17/18', 112, 99, 323, '155|155'],
  ['1600', 1600, 900, '21/22/23/24', 131, 116, 378, null],
];
OHNE.forEach(([name, w, h, rand, spalte, col1, kpi, halb]) => {
  const r = rowOf(w, h, false);
  eq({ rand: r.rand, spalte: r.spalte, col1: r.col1, kpi: r.kpi }, { rand, spalte, col1, kpi }, 'ohne Filter ' + name);
  if (halb) eq(r.halb, halb, 'ohne Filter halbe KPI ' + name);
  else { const [a, b] = r.halb.split('|').map(Number); eq(Math.abs(a - b), 1, 'ohne Filter halbe KPI ±1 px ' + name); }
});

// ---- Standardprojekt FHD (Vorlage kpi4-main-detail): KPIs 27/423/819/1215, 378 breit, 167 hoch; Hauptzeile 1038 + 510 ----
{
  const z = PG.zones({ w: 1920, h: 1080 }, CHROME(true));
  const leaf = id => ({ type: 'leaf', id, visual: null });
  const tree = { type: 'split', dir: 'col', children: [
    { size: 1, node: { type: 'split', dir: 'row', children: [1, 2, 3, 4].map(i => ({ size: 1, node: leaf('k' + i) })) } },
    { size: 4, node: { type: 'split', dir: 'row', children: [{ size: 2, node: leaf('main') }, { size: 1, node: leaf('detail') }] } },
  ] };
  const geo = PG.layout(tree, z), byId = {};
  geo.leaves.forEach(l => { byId[l.node.id] = l.rect; });
  eq([1, 2, 3, 4].map(i => byId['k' + i].x), [27, 423, 819, 1215], 'Standardprojekt: KPI-x');
  eq([1, 2, 3, 4].map(i => [byId['k' + i].w, byId['k' + i].h]), [[378, 167], [378, 167], [378, 167], [378, 167]], 'Standardprojekt: KPI-Größe');
  eq([byId.main.w, byId.detail.w], [1038, 510], 'Standardprojekt: Hauptzeile');
  // Garantien: jeder Zwischenraum genau g, erste und letzte Kachel bündig mit dem Inhaltsrand
  const c = z.content;
  eq(byId.detail.x + byId.detail.w, c.x + c.w, 'bündig rechts');
  eq(byId.main.y + byId.main.h, c.y + c.h, 'bündig unten');
  eq(byId.k2.x - (byId.k1.x + byId.k1.w), z.g, 'Zwischenraum = g');
  eq(byId.main.y - (byId.k1.y + byId.k1.h), z.g, 'Zwischenraum senkrecht = g');
  eq(geo.gutters.length, 5, 'Zwischenräume zum Ziehen');
  eq(geo.leaves[0].cell, { x: [[0, 1], [1, 4]], y: [[0, 1], [1, 5]] }, 'cell als Brüche');
  eq(PG.pixelBlock(z), { mode: 'lattice', n: 12, pitchX: 132, pitchY: 77, gutter: 18, margins: { l: 27, r: 27, t: 27, b: 27 }, exact: true }, 'canvas.pixel');
  // Grid mit gleichen Spuren liefert dieselben Pixel wie der Baum
  const grid = { type: 'grid', cols: [1, 1, 1, 1], rows: [1, 4], children: [0, 1, 2, 3].map(i => ({ r: 0, c: i, rs: 1, cs: 1, node: leaf('g' + i) })).concat([{ r: 1, c: 0, rs: 1, cs: 4, node: leaf('unten') }]) };
  const gg = PG.layout(grid, z);
  eq(gg.leaves.slice(0, 4).map(l => l.rect), [1, 2, 3, 4].map(i => byId['k' + i]), 'Grid = Baum');
}

// ---- Fünf Spalten (12 nicht teilbar): Kanten exakt, Breiten ±1 px wie im Konzept (299/299/298/299/299) ----
{
  const z = PG.zones({ w: 1920, h: 1080 }, CHROME(true));
  const tree = { type: 'split', dir: 'row', children: [0, 1, 2, 3, 4].map(i => ({ size: 1, node: { type: 'leaf', id: 's' + i } })) };
  const geo = PG.layout(tree, z);
  eq(geo.leaves.map(l => l.rect.w), [299, 299, 298, 299, 299], 'fünf Spalten');
  const gaps = geo.leaves.slice(1).map((l, i) => l.rect.x - (geo.leaves[i].rect.x + geo.leaves[i].rect.w));
  eq(gaps, [18, 18, 18, 18], 'fünf Spalten: Zwischenräume');
}

// ---- Sweep: 12er-Raster immer lösbar (Breiten 320 bis 4000); mL in [m0-3; m0+3], mR = mL oder mL+1 ----
{
  let bad = 0;
  for (let w = 320; w <= 4000; w += 1) {
    const k = PG.kOf(w), g = PG.R(12 * k), m0 = PG.R(18 * k);
    const s = PG.solveMargins(w - Math.round(200 * k), m0, g, 12);
    if (Math.abs(s.mL - m0) > 3 || (s.mR !== s.mL && s.mR !== s.mL + 1) || (s.P % 12)) bad++;
  }
  eq(bad, 0, 'Sweep 320..4000: immer lösbar');
}

// ---- Linie in Ganzzahlen, auch für große Nenner (kein Gleitkomma-Rauschen) ----
eq(PG.line(1, 2, 1584), 792, 'L(1/2)');
eq(PG.line(1, 3, 100), 33, 'L(1/3) bei P = 100');
eq(PG.line(2, 3, 100), 67, 'L(2/3) bei P = 100');
eq(PG.line(123456789, 987654321, 1584), Math.floor((2 * 123456789 * 1584 + 987654321) / (2 * 987654321)), 'große Nenner');
eq(PG.R(0.5), 1, 'R(0,5) = 1');
eq(PG.R(2.5), 3, 'R(2,5) = 3 (nicht Bankers Rounding)');
eq(PG.line(2 / 3, 1, 1584), Math.floor((2 * (2 / 3) * 1584 + 1) / 2), 'Kommazahl-Bruch wie bisher (spans)');

// ---- Chrome-Vorlagen, Übertragung, Slicer-Stapel (Rahmen der dwg-Shell) ----
{
  const z = PG.zones({ w: 1920, h: 1080 }, PG.DWG_CHROME);
  eq([z.header, z.filter, z.footer, z.content], [{ x: 0, y: 0, w: 1920, h: 96 }, { x: 0, y: 96, w: 300, h: 948 }, { x: 0, y: 1044, w: 1920, h: 36 }, { x: 327, y: 123, w: 1566, h: 894 }], 'dwg-Chrome FHD');
  eq(PG.slicerStack(z, 2), [[27, 123, 246, 78], [27, 219, 246, 78]], 'Slicer-Stapel');
  const hd = PG.zones({ w: 1280, h: 720 }, PG.DWG_CHROME), haupt = PG.place(z, 0, 12, 2, 12);
  eq(PG.cellOf(z, haupt), { a: 0, b: 12, c: 2, d: 12, den: 12 }, 'cellOf');
  eq(PG.transfer(haupt, z, hd), PG.place(hd, 0, 12, 2, 12), 'transfer pixelgenau FHD → HD');
  eq(PG.inside(z, [300, 123, 1593, 438]), false, 'inside');
  eq(PG.zones({ w: 1280, h: 720 }).content, PG.zones({ w: 1280, h: 720 }, PG.MOCKUP_CHROME).content, 'Standard-Chrome = MOCKUP_CHROME');
}

// ---- Ohne Rastermodus: Zonen wie zones() in app.js bis 0.6.2 ----
function legacyZones(S) {  // Referenz: app.js 0.6.2, Zeilen 700-714, unverändert übernommen
  const { w, h } = S.canvas; const c = S.chrome; const k = Math.max(0.6, Math.min(3.2, S.canvas.w / 1280)); const m = Math.round(S.spacing.margin * k);
  let top = 0, bottom = h, left = 0, right = w; const z = {};
  if (c.nav.on) { const nw = Math.round(c.nav.w * k); z.nav = { x: 0, y: 0, w: nw, h }; left = nw; }
  if (c.header.on) { const hh = Math.round(c.header.h * k); z.header = { x: left, y: 0, w: w - left, h: hh }; top = hh; }
  if (c.footer.on) { const fh = Math.round(c.footer.h * k); z.footer = { x: left, y: h - fh, w: w - left, h: fh }; bottom = h - fh; }
  if (c.filter.on) {
    if (c.filter.side === 'right') { const fw = Math.round(c.filter.w * k); z.filter = { x: w - fw, y: top, w: fw, h: bottom - top }; right = w - fw; }
    else if (c.filter.side === 'left') { const fw = Math.round(c.filter.w * k); z.filter = { x: left, y: top, w: fw, h: bottom - top }; left += fw; }
    else if (c.filter.side === 'top') { const fh = Math.round((c.filter.topH || 56) * k); z.filter = { x: left, y: top, w: right - left, h: fh }; top += fh; }
  }
  z.content = { x: left + m, y: top + m, w: Math.max(40, right - left - 2 * m), h: Math.max(40, bottom - top - 2 * m) };
  return z;
}
{
  let diff = 0, n = 0;
  const sides = ['right', 'left', 'top', 'burger'];
  [[1280, 720], [1920, 1080], [3840, 2160], [1080, 1920], [1366, 768], [1600, 900], [640, 360], [333, 777]].forEach(([w, h]) => {
    sides.forEach(side => [true, false].forEach(navOn => [true, false].forEach(hdr => [16, 18, 0].forEach(margin => {
      const S = { canvas: { w, h }, spacing: { margin }, chrome: { nav: { on: navOn, w: 64 }, header: { on: hdr, h: 56 }, footer: { on: !hdr, h: 24 }, filter: { on: side !== 'off', side, w: 200, topH: 48 } } };
      const a = legacyZones(S), b = PG.zones(S.canvas, S.chrome, { legacy: true, margin });
      delete b.area; n++;
      if (JSON.stringify(a) !== JSON.stringify(b)) diff++;
    }))));
  });
  eq(diff, 0, 'Zonen ohne Rastermodus byte-gleich (' + n + ' Fälle)');
}

console.log((failures ? 'FEHLER ' : 'OK ') + passed + ' bestanden, ' + failures + ' fehlgeschlagen');
process.exit(failures ? 1 : 0);
