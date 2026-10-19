/* MockupKitchen · Pixelraster (pixelgrid.js), Konzept: KONZEPT-PIXELRASTER.md
   Reines Rechenmodul ohne DOM: Zonen (Kopfband, Nav, Filter, Fußleiste), Ränder je Achse, Linien im Pitch-Raum und
   Kachel-Rechtecke aus Brüchen. Eine Quelle für MockupKitchen (Browser, <script> vor gridcheck.js und app.js) und
   die dwg cli im Repo Fabric-Apps-Demo (holt die Datei mit `dwg mockup build`, nicht von Hand kopieren).

   Regel: k = clamp(W/1280; 0,6; 3,2), R(x) = floor(x + 0,5), g = R(12·k), m0 = R(18·k). Die Ränder je Achse liegen in
   [m0-3; m0+3] und machen den Schritt P = Z - mL - mR + g durch n (12) teilbar, Vorrang P mod 2n = 0, dann symmetrisch,
   dann nah an m0. Linie L(a/b) = floor((2·a·P + b) / (2·b)) in Ganzzahlen (BigInt). Kachel: x = content.x + L(a),
   w = L(b) - L(a) - g. Gleicher Bruch heißt gleiches Pixel, jeder Zwischenraum ist genau g.

   Ohne Rastermodus (opts.lattice fehlt) liefert zones() byte-gleich dieselben Zonen wie MockupKitchen bis 0.6.2. */
(function (root) {
  'use strict';

  const BASE = { margin: 18, gutter: 12, n: 12 };          // Basiswerte bei 1280 px (k = 1) im Rastermodus
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const R = x => Math.floor(x + 0.5);
  const kOf = width => clamp(width / 1280, 0.6, 3.2);

  // ---- Brüche (BigInt, gekürzt) ----------------------------------------------
  const big = v => (typeof v === 'bigint' ? v : BigInt(v));
  const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { const t = a % b; a = b; b = t; } return a || 1n; };
  function frac(n, d) { n = big(n); d = big(d === undefined ? 1 : d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; }
  const fAdd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
  const fSub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
  const fMulInt = (a, num, den) => frac(a.n * big(num), a.d * big(den));
  const asFrac = f => (Array.isArray(f) ? frac(f[0], f[1]) : (f && typeof f === 'object' ? frac(f.n, f.d) : frac(f, 1)));

  /** Linie als Ganzzahl-Bruch: L(n/d) = floor((2·n·P + d) / (2·d)), auch für Brüche mit großen Nennern */
  function line(n, d, P) {
    const N = big(n), D = big(d), p = big(P);
    const num = 2n * N * p + D, den = 2n * D;
    let q = num / den; if (num % den !== 0n && (num < 0n) !== (den < 0n)) q -= 1n;   // floor auch für negative Werte
    return Number(q);
  }
  const lineF = (f, P) => line(f.n, f.d, P);

  /** Ränder einer Achse: P mod n = 0 (Pflicht), Vorrang P mod 2n = 0, dann symmetrisch, dann nah an m0 */
  function solveMargins(span, m0, g, n) {
    n = n || BASE.n;
    let best = null;
    for (let mL = m0 - 3; mL <= m0 + 3; mL++) {
      if (mL < 0) continue;
      for (const mR of [mL, mL + 1]) {
        const P = span - mL - mR + g;
        if (P <= 0 || P % n !== 0) continue;
        const rank = [P % (2 * n) === 0 ? 0 : 1, mL === mR ? 0 : 1, Math.abs(mL - m0) + Math.abs(mR - m0)];
        const i = best ? rank.findIndex((v, j) => v !== best.rank[j]) : -1;
        if (!best || (i >= 0 && rank[i] < best.rank[i])) best = { mL, mR, P, rank };
      }
    }
    if (best) return { mL: best.mL, mR: best.mR, P: best.P, exact: true };
    return { mL: m0, mR: m0, P: span - 2 * m0 + g, exact: false };   // nur bei sehr kleinem Rand (m0 < 3): ±1 px
  }

  /**
   * Raster einer Fläche (Z nach Kopf, Fuß, Filter und Nav, ohne Rand).
   * @param area {x,y,w,h}  @param k Skalierung  @param o {margin, gutter, n} Basiswerte bei k = 1
   */
  function lattice(area, k, o) {
    o = o || {};
    const n = o.n || BASE.n;
    const g = R((o.gutter == null ? BASE.gutter : o.gutter) * k), m0 = R((o.margin == null ? BASE.margin : o.margin) * k);
    const mx = solveMargins(area.w, m0, g, n), my = solveMargins(area.h, m0, g, n);
    const content = { x: area.x + mx.mL, y: area.y + my.mL, w: area.w - mx.mL - mx.mR, h: area.h - my.mL - my.mR };
    return { k, n, g, m0, area, content, margins: { l: mx.mL, r: mx.mR, t: my.mL, b: my.mR }, P: { x: mx.P, y: my.P }, exact: mx.exact && my.exact };
  }

  /**
   * Zonen einer Seite wie MockupKitchen zones(): Nav links über die volle Höhe, Kopfband oben, Fußleiste unten,
   * Filter rechts, links oder oben (burger: keine Zone). chrome = { nav:{on,w}, header:{on,h}, footer:{on,h},
   * filter:{on,side,w,topH} } mit Basismaßen bei 1280 px.
   * @param canvas {w,h}  @param o { margin (Basis), lattice: {n, gutter, margin} | null }
   * @returns zones { nav?, header?, footer?, filter?, area, content, lattice? }
   */
  function zones(canvas, chrome, o) {
    o = o || {};
    const w = canvas.w, h = canvas.h, c = chrome || {}, k = kOf(w);
    const on = x => !!(x && x.on);
    let top = 0, bottom = h, left = 0, right = w; const z = {};
    if (on(c.nav)) { const nw = Math.round(c.nav.w * k); z.nav = { x: 0, y: 0, w: nw, h }; left = nw; }
    if (on(c.header)) { const hh = Math.round(c.header.h * k); z.header = { x: left, y: 0, w: w - left, h: hh }; top = hh; }
    if (on(c.footer)) { const fh = Math.round(c.footer.h * k); z.footer = { x: left, y: h - fh, w: w - left, h: fh }; bottom = h - fh; }
    if (on(c.filter)) {
      const f = c.filter;
      if (f.side === 'right') { const fw = Math.round(f.w * k); z.filter = { x: w - fw, y: top, w: fw, h: bottom - top }; right = w - fw; }
      else if (f.side === 'left') { const fw = Math.round(f.w * k); z.filter = { x: left, y: top, w: fw, h: bottom - top }; left += fw; }
      else if (f.side === 'top') { const fh = Math.round((f.topH || 56) * k); z.filter = { x: left, y: top, w: right - left, h: fh }; top += fh; }
      // burger: keine Zone, Button im Kopfband; Panel entsteht per Lesezeichen
    }
    z.area = { x: left, y: top, w: right - left, h: bottom - top };
    if (o.lattice) {
      const lat = lattice(z.area, k, o.lattice);
      z.content = lat.content; z.lattice = lat;
    } else {
      const m = Math.round((o.margin || 0) * k);
      z.content = { x: left + m, y: top + m, w: Math.max(40, right - left - 2 * m), h: Math.max(40, bottom - top - 2 * m) };
    }
    return z;
  }

  /** Kachel aus Brüchen im Pitch-Raum: x0..x1 und y0..y1 als [Zähler, Nenner], Zahl oder {n, d} */
  function place(lat, x0, x1, y0, y1) {
    const c = lat.content, g = lat.g;
    const ax = lineF(asFrac(x0), lat.P.x), bx = lineF(asFrac(x1), lat.P.x), ay = lineF(asFrac(y0), lat.P.y), by = lineF(asFrac(y1), lat.P.y);
    return { x: c.x + ax, y: c.y + ay, w: bx - ax - g, h: by - ay - g };
  }
  /** Kachel über die Spalten a..b und Zeilen c..d (in 1/n), z. B. span(lat, 0, 12, 0, 3) = volle Breite, oberes Viertel */
  function span(lat, a, b, c, d, n) {
    n = n || lat.n;
    return place(lat, [a, n], [b, n], [c, n], [d, n]);
  }

  // Gewichte als ganze Zahlen („Kachel plus ein Zwischenraum"); Kommazahlen aus dem freien Ziehen auf 1/1000 genau
  function intWeights(arr) {
    const list = (arr || []).map(v => (Number.isFinite(v) && v > 0 ? v : 0));
    const ints = list.every(v => Number.isInteger(v)) ? list : list.map(v => Math.round(v * 1000));
    const out = ints.map(v => BigInt(v));
    return out.some(v => v > 0n) ? out : out.map(() => 1n);
  }
  function bounds(weights, a, b) {
    // Grenzen C(0..n) über [a; b]: a + (b - a)·C(i)/S
    const S = weights.reduce((s, v) => s + v, 0n), d = fSub(b, a); let acc = 0n; const out = [a];
    weights.forEach(v => { acc += v; out.push(fAdd(a, fMulInt(d, acc, S))); });
    return out;
  }

  /**
   * Rechtecke eines Layoutbaums im Rastermodus (split/grid/leaf wie MockupKitchen). Gleiche Form wie layoutRects():
   * leaves [{node, rect, cell}] und gutters (Zwischenräume zum Ziehen). cell = Brüche der Kachel im Pitch-Raum.
   */
  function layout(tree, lat) {
    const out = { leaves: [], gutters: [] }, g = lat.g, c = lat.content;
    const Lx = f => c.x + lineF(f, lat.P.x), Ly = f => c.y + lineF(f, lat.P.y);
    const fs = f => [f.n.toString(), f.d.toString()].map(Number);
    function walk(node, x0, x1, y0, y1) {
      if (!node) return;
      if (node.type === 'leaf' || !node.children) {
        const r = place(lat, x0, x1, y0, y1);
        out.leaves.push({ node, rect: { x: r.x, y: r.y, w: Math.max(8, r.w), h: Math.max(8, r.h) }, cell: { x: [fs(x0), fs(x1)], y: [fs(y0), fs(y1)] } });
        return;
      }
      if (node.type === 'grid') {
        const X = bounds(intWeights(node.cols), x0, x1), Y = bounds(intWeights(node.rows), y0, y1);
        const nc = X.length - 1, nr = Y.length - 1;
        const cx0 = cl => X[Math.min(nc, cl.c)], cx1 = cl => X[Math.min(nc, cl.c + cl.cs)];
        const cy0 = cl => Y[Math.min(nr, cl.r)], cy1 = cl => Y[Math.min(nr, cl.r + cl.rs)];
        node.children.forEach(cl => walk(cl.node, cx0(cl), cx1(cl), cy0(cl), cy1(cl)));
        node.children.forEach(A => node.children.forEach(B => {
          if (A.c + A.cs === B.c) { const t0 = Math.max(Ly(cy0(A)), Ly(cy0(B))), t1 = Math.min(Ly(cy1(A)), Ly(cy1(B))) - g; if (t1 > t0) out.gutters.push({ grid: node, axis: 'col', boundary: B.c, cells: [A, B], dir: 'row', rect: { x: Lx(cx0(B)) - g, y: t0, w: g, h: t1 - t0 } }); }
          if (A.r + A.rs === B.r) { const t0 = Math.max(Lx(cx0(A)), Lx(cx0(B))), t1 = Math.min(Lx(cx1(A)), Lx(cx1(B))) - g; if (t1 > t0) out.gutters.push({ grid: node, axis: 'row', boundary: B.r, cells: [A, B], dir: 'col', rect: { x: t0, y: Ly(cy0(B)) - g, w: t1 - t0, h: g } }); }
        }));
        return;
      }
      const row = node.dir === 'row';
      const B = bounds(intWeights(node.children.map(ch => ch.size)), row ? x0 : y0, row ? x1 : y1);
      node.children.forEach((ch, i) => {
        if (row) walk(ch.node, B[i], B[i + 1], y0, y1); else walk(ch.node, x0, x1, B[i], B[i + 1]);
        if (i < node.children.length - 1) {
          const rect = row
            ? { x: Lx(B[i + 1]) - g, y: Ly(y0), w: g, h: Ly(y1) - Ly(y0) - g }
            : { x: Lx(x0), y: Ly(B[i + 1]) - g, w: Lx(x1) - Lx(x0) - g, h: g };
          out.gutters.push({ parent: node, index: i, dir: node.dir, rect });
        }
      });
    }
    walk(tree, frac(0), frac(1), frac(0), frac(1));
    return out;
  }

  /** Alle Linienpositionen einer Achse (linke bzw. obere Kanten) für 1/n und, wenn exakt, 1/2n */
  function lines(lat, axis) {
    const P = lat.P[axis], start = lat.content[axis], set = new Set();
    [lat.n, 2 * lat.n].forEach(n => { for (let j = 0; j <= n; j++) set.add(start + line(j, n, P)); });
    return Array.from(set).sort((a, b) => a - b);
  }

  /** Block für die Spec (canvas.pixel), wie im Konzept Abschnitt 5 */
  function pixelBlock(lat) {
    return { mode: 'lattice', n: lat.n, pitchX: lat.P.x / lat.n, pitchY: lat.P.y / lat.n, gutter: lat.g, margins: Object.assign({}, lat.margins), exact: lat.exact };
  }

  const api = { BASE, R, clamp, kOf, frac, line, solveMargins, lattice, zones, place, span, layout, lines, pixelBlock };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MK_PIXELGRID = api;
})(typeof window !== 'undefined' ? window : globalThis);
