/* MockupKitchen · gridcheck.js Selbsttest (Node): node assets/mockup/gridcheck-test.js
   Rasterprüfung (checkLattice) mit pixelgrid.js und die bisherige Kantenprüfung check() auf freien Rechtecken. */
'use strict';
const PG = require('./pixelgrid.js');
const GC = require('./gridcheck.js');

let passed = 0, failures = 0;
function eq(actual, expected, msg) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) passed++; else { failures++; console.error('FAIL: ' + msg + '\n  ist  ' + a + '\n  soll ' + e); }
}
const codes = r => r.findings.map(f => f.code);

const chrome = { nav: { on: false }, header: { on: true, h: 56 }, footer: { on: true, h: 24 }, filter: { on: true, side: 'right', w: 200 } };
const lat = PG.zones({ w: 1920, h: 1080 }, chrome);
const span = (a, b, c, d) => { const r = PG.place(lat, a, b, c, d); return { x: r[0], y: r[1], w: r[2], h: r[3] }; };
const kpis = [0, 3, 6, 9].map((a, i) => Object.assign({ id: 'k' + i }, span(a, a + 3, 0, 3)));
const main = [Object.assign({ id: 'main' }, span(0, 8, 3, 12)), Object.assign({ id: 'detail' }, span(8, 12, 3, 12))];
const ok = kpis.concat(main);

eq(GC.checkLattice(ok, lat), { ok: true, findings: [] }, 'Raster: alles auf Linien und bündig');
eq(codes(GC.check(null, { leaves: ok.map(r => ({ rect: r })) }, lat.g)), [], 'check(): keine Kanten- und Spaltbefunde');

// Eine Kachel um 2 px verschoben: Kante knapp neben der Linie, Zwischenraum ≠ g
const shifted = ok.map(r => (r.id === 'k1' ? Object.assign({}, r, { x: r.x + 2 }) : r));
const res = GC.checkLattice(shifted, lat);
eq(codes(res), ['OFF_LATTICE'], 'Raster: 2 px daneben');
eq(res.findings[0].edges.map(e => [e.id, e.edge, e.delta]), [['k1', 'left', 2], ['k1', 'right', 2]], 'Raster: betroffene Kanten');
eq(codes(GC.check(null, { leaves: shifted.map(r => ({ rect: r })) }, lat.g)), ['GUTTER_MISMATCH'], 'check(): Zwischenraum ≠ g');

// Freie Linie (1/5 der Breite) ist kein Befund
const fifth = [Object.assign({ id: 'a' }, PG.placeFrac(lat, [0, 1], [1, 5], [0, 1], [1, 1])), Object.assign({ id: 'b' }, PG.placeFrac(lat, [1, 5], [1, 1], [0, 1], [1, 1]))];
eq(GC.checkLattice(fifth, lat).ok, true, 'Raster: 1/5 ist eine freie Linie');

// Knapp nicht bündig (rechts 10 px Luft) und außerhalb des Inhalts
const loose = ok.map(r => (r.id === 'detail' || r.id === 'k3' ? Object.assign({}, r, { w: r.w - 10 }) : r));
eq(GC.checkLattice(loose, lat).findings.map(f => f.code + (f.sides ? ':' + f.sides.map(s => s.side + s.delta).join() : '')), ['NOT_FLUSH:right10'], 'Raster: rechts nicht bündig');
const out = ok.concat([{ id: 'x', x: lat.content.x - 5, y: lat.content.y, w: 100, h: 100 }]);
eq(codes(GC.checkLattice(out, lat)).includes('OUTSIDE_CONTENT'), true, 'Raster: außerhalb des Inhalts');

console.log((failures ? 'FEHLER ' : 'OK ') + passed + ' bestanden, ' + failures + ' fehlgeschlagen');
process.exit(failures ? 1 : 0);
