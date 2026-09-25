/* MockupKitchen · Raster prüfen & ausrichten (v0.5.0)
   Pixelgenau heißt: alle Kanten fluchten exakt, jeder Zwischenraum ist genau g px, kein Pixelrest am Rand.
   check(): Befunde aus Layout + berechneten Rechtecken. snap(): Baum → Raster (wenn regelmäßig), fast gleiche Spuren angleichen.
   marginFix(): Rand so verschieben, dass Spalten und Zeilen ohne Rest aufgehen. Reine Funktionen, Node-testbar. */
(function (root) {
  'use strict';
  var TOL = 3;          // Kantenabstand bis 3 px gilt als „fast fluchtend" (größere Abstände sind Absicht)
  var NEAR = 0.05;      // Spuren, die sich um weniger als 5 % unterscheiden, sollen gleich sein
  var SNAPF = 0.012;    // Kanten verschiedener Zeilen, die weniger als 1,2 % der Breite auseinanderliegen, gelten als gemeint fluchtend

  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function uniqSorted(a) { return a.slice().sort(function (x, y) { return x - y; }).filter(function (v, i, arr) { return i === 0 || v !== arr[i - 1]; }); }
  function nearGroups(vals) {
    // Werte, die sich um 1..TOL px unterscheiden, gehören zusammen -> Befund
    var v = uniqSorted(vals), groups = [], cur = [v[0]];
    for (var i = 1; i < v.length; i++) { if (v[i] - v[i - 1] <= TOL) cur.push(v[i]); else { if (cur.length > 1) groups.push(cur); cur = [v[i]]; } }
    if (cur.length > 1) groups.push(cur);
    return groups;
  }

  // ---- Baum-Analyse: ist der Baum ein regelmäßiges Raster? -----------------
  function treeShape(layout) {
    // col-Split aus row-Splits (Zeilen mit Spalten) oder row-Split aus col-Splits; Zeilen mit einer einzigen Kachel gelten als voll überspannt
    if (!layout || layout.type !== 'split') return null;
    var outer = layout.dir, inner = outer === 'col' ? 'row' : 'col';
    var counts = layout.children.map(function (ch) { var n = ch.node; if (n.type === 'leaf') return 1; if (n.type === 'split' && n.dir === inner && n.children.every(function (c) { return c.node.type === 'leaf'; })) return n.children.length; return -1; });
    if (counts.some(function (c) { return c < 0; })) return null;
    var n = Math.max.apply(null, counts); if (n < 2 && layout.children.length < 2) return null;
    return { outer: outer, inner: inner, n: n, counts: counts };
  }
  function treeToGrid(layout, uid, dims) {
    // Pixelgenaue Überführung (v0.5.1): Jede Linie wird wie im Baum in Pixeln ausgelegt (Spanne S, Zwischenraum g).
    // Spalten entstehen zwischen den Zwischenräumen aller Linien; Zwischenräume, die weniger als tol px auseinanderliegen,
    // werden zu einem zusammengelegt. Spurgewichte = Spurbreiten in px -> das Raster legt jede Kachel wieder auf dieselben Pixel.
    // Ohne dims (Tests): S = 1, g = 0, also reine Anteile.
    var sh = treeShape(layout); if (!sh) return null;
    var S = dims ? (sh.outer === 'col' ? dims.w : dims.h) : 1, g = dims ? dims.g : 0;
    var tol = dims ? Math.max(3, SNAPF * S) : SNAPF;
    var lines = layout.children.map(function (ch) { return ch.size; });
    var totalL = sum(lines) || 1; var lineW = lines.map(function (v) { return v / totalL; });
    var ends = layout.children.map(function (ch) {
      if (ch.node.type === 'leaf') return [];
      var sz = ch.node.children.map(function (c) { return c.size; }); var t = sum(sz) || 1, inner = S - g * (sz.length - 1), x = 0, out = [];
      sz.forEach(function (v, i) { x += inner * v / t; if (i < sz.length - 1) { out.push(x); x += g; } });
      return out;
    });
    var all = []; ends.forEach(function (e) { all = all.concat(e); }); all.sort(function (x, y) { return x - y; });
    var clusters = [];
    all.forEach(function (v) { var last = clusters[clusters.length - 1]; if (last && v - last.max <= tol) { last.max = v; last.vals.push(v); } else clusters.push({ min: v, max: v, vals: [v] }); });
    var reps = clusters.map(function (c) { return sum(c.vals) / c.vals.length; });
    var idx = function (v) { for (var i = 0; i < clusters.length; i++) if (v >= clusters[i].min - 1e-9 && v <= clusters[i].max + 1e-9) return i; return -1; };
    var m = reps.length, cross = [];
    for (var j = 0; j <= m; j++) cross.push((j === m ? S : reps[j]) - (j === 0 ? 0 : reps[j - 1] + g));
    if (cross.some(function (w) { return !(w > 0); })) return null;
    var cells = [], ok = true;
    layout.children.forEach(function (ch, i) {
      var e = ends[i], nodes = ch.node.type === 'leaf' ? [ch.node] : ch.node.children.map(function (c) { return c.node; });
      nodes.forEach(function (nd, k) {
        var c0 = k === 0 ? 0 : idx(e[k - 1]) + 1, c1 = k === nodes.length - 1 ? m : idx(e[k]);
        if (c0 < 0 || c1 < c0) { ok = false; return; }
        cells.push(sh.outer === 'col' ? { r: i, c: c0, rs: 1, cs: c1 - c0 + 1, node: nd } : { r: c0, c: i, rs: c1 - c0 + 1, cs: 1, node: nd });
      });
    });
    if (!ok) return null;
    var grid = { id: uid ? uid() : layout.id, type: 'grid', children: cells };
    if (sh.outer === 'col') { grid.rows = lineW; grid.cols = cross; } else { grid.cols = lineW; grid.rows = cross; }
    return grid;
  }
  function equalize(weights) {
    // fast gleiche Gewichte -> exakt gleich; sonst auf 3 Nachkommastellen glätten
    if (!weights.length) return weights;
    var mn = Math.min.apply(null, weights), mx = Math.max.apply(null, weights);
    if (mn > 0 && (mx - mn) / mx <= NEAR) return weights.map(function () { return 1; });
    return weights.map(function (w) { return Math.round(w * 1000) / 1000; });
  }
  function equalizeNearGroups(weights) {
    // Gruppen fast gleicher Gewichte angleichen (z. B. 1, 1.02, 2, 2.01 -> 1, 1, 2, 2)
    var out = weights.slice();
    var order = weights.map(function (w, i) { return { w: w, i: i }; }).sort(function (a, b) { return a.w - b.w; });
    var g = [order[0]];
    var flush = function () { if (g.length > 1) { var m = sum(g.map(function (x) { return x.w; })) / g.length; g.forEach(function (x) { out[x.i] = Math.round(m * 1000) / 1000; }); } };
    for (var k = 1; k < order.length; k++) { if (g[0].w > 0 && (order[k].w - g[0].w) / order[k].w <= NEAR) g.push(order[k]); else { flush(); g = [order[k]]; } }
    flush();
    return equalize(out);
  }

  // ---- Prüfung ---------------------------------------------------------------
  // geo: { leaves: [{node, rect}], zones: { content } }, gutter: px, layout: Seitenlayout
  function check(layout, geo, gutter) {
    var f = []; var leaves = geo.leaves || []; var rects = leaves.map(function (l) { return l.rect; });
    if (rects.length < 2) return { ok: true, findings: [], layoutType: layout && layout.type };
    var xs = [], ys = [];
    rects.forEach(function (r) { xs.push(r.x, r.x + r.w); ys.push(r.y, r.y + r.h); });
    var gx = nearGroups(xs), gy = nearGroups(ys);
    if (gx.length) f.push({ code: 'EDGE_NEAR_X', level: 'warn', n: gx.length, values: gx.map(function (g) { return g.join('/'); }).join(', ') });
    if (gy.length) f.push({ code: 'EDGE_NEAR_Y', level: 'warn', n: gy.length, values: gy.map(function (g) { return g.join('/'); }).join(', ') });
    // Zwischenräume zwischen direkten Nachbarn
    var gaps = [];
    for (var i = 0; i < rects.length; i++) for (var j = 0; j < rects.length; j++) {
      if (i === j) continue; var a = rects[i], b = rects[j];
      var ov = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); var gap = b.x - (a.x + a.w);
      if (ov > 0 && gap > 0 && gap < gutter * 3) gaps.push(gap);
      var ovx = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x); var gapy = b.y - (a.y + a.h);
      if (ovx > 0 && gapy > 0 && gapy < gutter * 3) gaps.push(gapy);
    }
    var badGaps = uniqSorted(gaps.filter(function (g) { return g !== gutter; }));
    if (badGaps.length) f.push({ code: 'GUTTER_MISMATCH', level: 'warn', n: badGaps.length, values: badGaps.join(', '), gutter: gutter });
    // Spuren
    var ct = geo.zones && geo.zones.content;
    if (layout && layout.type === 'grid') {
      ['cols', 'rows'].forEach(function (k) {
        var w = layout[k]; var eq = equalizeNearGroups(w);
        if (w.some(function (v, i) { return Math.abs(v - eq[i]) > 1e-9; })) f.push({ code: 'TRACK_NEAR', level: 'warn', axis: k, values: w.map(function (v) { return Math.round(v * 100) / 100; }).join(' · ') });
      });
      if (ct) {
        var restC = (ct.w - gutter * (layout.cols.length - 1)) % layout.cols.length, restR = (ct.h - gutter * (layout.rows.length - 1)) % layout.rows.length;
        var eqC = equalize(layout.cols).every(function (v) { return v === 1; }), eqR = equalize(layout.rows).every(function (v) { return v === 1; });
        if ((eqC && restC) || (eqR && restR)) f.push({ code: 'REST_PX', level: 'info', cols: eqC ? restC : 0, rows: eqR ? restR : 0 });
      }
    } else if (layout && layout.type === 'split') {
      f.push({ code: treeShape(layout) ? 'TREE_CONVERTIBLE' : 'TREE_IRREGULAR', level: treeShape(layout) ? 'info' : 'warn' });
    }
    return { ok: !f.some(function (x) { return x.level === 'warn'; }), findings: f, layoutType: layout && layout.type };
  }

  // ---- Ausrichten -------------------------------------------------------------
  // Liefert { layout, changed:[codes] }: Baum -> Raster, Spuren angleichen. Mutiert das Raster in place.
  function snap(layout, uid, dims) {
    var changed = [];
    if (layout && layout.type === 'split') { var g = treeToGrid(layout, uid, dims); if (g) { layout = g; changed.push('TREE_TO_GRID'); } }
    if (layout && layout.type === 'grid') {
      ['cols', 'rows'].forEach(function (k) { var eq = equalizeNearGroups(layout[k]); if (layout[k].some(function (v, i) { return Math.abs(v - eq[i]) > 1e-9; })) { layout[k] = eq; changed.push('TRACKS_' + k.toUpperCase()); } });
    }
    return { layout: layout, changed: changed };
  }
  // Rand (px, Canvas) so verschieben, dass gleiche Spalten und Zeilen ohne Rest aufgehen. Liefert delta in px oder null.
  function marginFix(layout, content, gutter, maxDelta) {
    if (!layout || layout.type !== 'grid') return null;
    var nc = layout.cols.length, nr = layout.rows.length;
    var eqC = equalize(layout.cols).every(function (v) { return v === 1; }), eqR = equalize(layout.rows).every(function (v) { return v === 1; });
    if (!eqC && !eqR) return null;
    var fits = function (d, dg) { var W = content.w - 2 * d, H = content.h - 2 * d, g = gutter + dg; return (!eqC || (W - g * (nc - 1)) % nc === 0) && (!eqR || (H - g * (nr - 1)) % nr === 0); };
    if (fits(0, 0)) return { margin: 0, gutter: 0 };
    // erst nur der Rand, dann zusätzlich der Zwischenraum um 1..2 px (bei gerader Spaltenzahl reicht der Rand allein oft nicht)
    var dgs = [0, 1, -1, 2, -2];
    for (var q = 0; q < dgs.length; q++) for (var d = 0; d <= (maxDelta || 8); d++) { if (fits(d, dgs[q])) return { margin: d, gutter: dgs[q] }; if (d && fits(-d, dgs[q])) return { margin: -d, gutter: dgs[q] }; }
    return null;
  }

  var api = { check: check, snap: snap, marginFix: marginFix, treeToGrid: treeToGrid, treeShape: treeShape, equalizeNearGroups: equalizeNearGroups, TOL: TOL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MK_GRIDCHECK = api;
})(typeof window !== 'undefined' ? window : globalThis);
