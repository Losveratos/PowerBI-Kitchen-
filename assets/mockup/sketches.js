/* ==========================================================================
   MockupKitchen · Mini-Chart-Skizzen im IBCS-Look
   --------------------------------------------------------------------------
   Eigenständig: kein Modulsystem, keine Abhängigkeiten, reines Browser-JS.

     window.MK_SKETCHES[kind](w, h, o)  ->  SVG-String
     window.MK_SKETCH(kind, w, h, o)    ->  Dispatcher, Fallback 'generic'

   o = { scenario:'AC/PY'|'AC/PL'|'AC/PL/FC'|'AC',
         variance:{abs:Boolean, rel:Boolean},
         seed:Number, dense:Boolean }

   Grundsätze:
   - Dummy-Daten stammen aus einem Seed-PRNG (mulberry32), damit dieselbe
     Kachel bei jedem Re-Render identisch aussieht.
   - Alle Zahlen laufen durch n(): niemals NaN/Infinity im Output.
   - Unter 120 px Breite oder 50 px Höhe wird eine reduzierte Variante
     gezeichnet (weniger Kategorien, keine Beschriftung).
   - Nur Graustufen plus die beiden Abweichungsfarben. Kein Chart-Junk.
   ========================================================================== */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- Farben */
  var AC   = '#404040';   // Ist, gefüllt
  var PY   = '#9E9E9E';   // Vorjahr, gefüllt
  var PLF  = '#FFFFFF';   // Plan, Füllung
  var PLS  = '#404040';   // Plan, Kontur
  var FCC  = '#BDBDBD';   // Forecast, Ersatzfläche wenn Schraffur zu klein
  var GOOD = '#3A9A5B';   // günstige Abweichung
  var BAD  = '#C8412F';   // ungünstige Abweichung
  var TXT  = '#6B7280';   // Textfarbe
  var GRID = '#E5E5E5';   // helle Hilfslinien (nur Tabelle/Heatmap/Raster)
  var AXIS = '#404040';   // Achsen
  var G2   = '#6E6E6E';   // Mittelgrau für Stapel
  var G3   = '#C9C9C9';   // Hellgrau für Stapel
  var FONT = 'Geist, system-ui, sans-serif';

  var MON = ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  var CAT = ['Nord', 'Süd', 'Ost', 'West', 'Mitte', 'Export', 'Online', 'Handel', 'Service'];

  var uid = 0;   // laufende Nummer für eindeutige Pattern-IDs

  /* ----------------------------------------------------------- Zahlenhilfen */

  // Sichere Zahl: nie NaN, nie Infinity, auf 2 Nachkommastellen gekürzt.
  function n(v) {
    v = +v;
    if (!isFinite(v)) v = 0;
    return Math.round(v * 100) / 100;
  }
  function clamp(v, lo, hi) { v = n(v); return v < lo ? lo : (v > hi ? hi : v); }
  function maxOf(a) {
    var m = 0, i, v;
    for (i = 0; i < a.length; i++) { v = Math.abs(+a[i]); if (isFinite(v) && v > m) m = v; }
    return m || 1;
  }
  // Deutsche Dummy-Zahl, z. B. "12,4"
  function lbl(v, d) { return n(v).toFixed(d == null ? 1 : d).replace('.', ','); }
  function plbl(v) { return (n(v) >= 0 ? '+' : '') + lbl(v, 0) + '%'; }

  // Kleiner deterministischer PRNG.
  function mulberry32(a) {
    a = (a | 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------- Primitive */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function rect(x, y, w, h, fill, stroke, sw) {
    w = n(w); h = n(h);
    if (w <= 0 || h <= 0) return '';
    var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h +
            '" fill="' + (fill || 'none') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function rrect(x, y, w, h, r, fill, stroke, sw) {
    w = n(w); h = n(h);
    if (w <= 0 || h <= 0) return '';
    var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h +
            '" rx="' + n(r) + '" fill="' + (fill || 'none') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function ln(x1, y1, x2, y2, stroke, sw, dash) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) +
           '" stroke="' + (stroke || AXIS) + '" stroke-width="' + n(sw || 1) + '"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function circ(cx, cy, r, fill, stroke, sw) {
    var s = '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(Math.max(0.4, r)) +
            '" fill="' + (fill || AC) + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function pathEl(d, fill, stroke, sw, dash) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') +
           '" stroke-width="' + n(sw || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
           ' stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function pts2str(pts) {
    var out = [], i;
    for (i = 0; i < pts.length; i++) out.push(n(pts[i][0]) + ',' + n(pts[i][1]));
    return out.join(' ');
  }
  function polyline(pts, stroke, sw, dash) {
    if (!pts || !pts.length) return '';
    return '<polyline points="' + pts2str(pts) + '" fill="none" stroke="' + (stroke || AC) +
           '" stroke-width="' + n(sw || 1.4) + '" stroke-linejoin="round" stroke-linecap="round"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function polygonEl(pts, fill, stroke, sw) {
    if (!pts || !pts.length) return '';
    return '<polygon points="' + pts2str(pts) + '" fill="' + (fill || GRID) +
           '" stroke="' + (stroke || 'none') + '" stroke-width="' + n(sw || 1) + '"/>';
  }
  function txt(x, y, s, size, fill, anchor, weight) {
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + n(size || 8) +
           '" fill="' + (fill || TXT) + '"' +
           (anchor ? ' text-anchor="' + anchor + '"' : '') +
           (weight ? ' font-weight="' + weight + '"' : '') +
           '>' + esc(s) + '</text>';
  }
  // Textplatzhalter (graue Balken) — wo echte Schrift zu klein wäre.
  function ghost(x, y, w, h, fill) { return rect(x, y, w, h || 2, fill || '#D4D4D4'); }

  /* ------------------------------------------------------------- Kontext */

  function ctx(w, h, o) {
    o = o || {};
    var W = Math.max(16, n(w) || 100);
    var H = Math.max(12, n(h) || 50);
    var v = o.variance || {};
    var pad = 4;
    var c = {
      w: W, h: H, pad: pad,
      x0: pad, y0: pad, x1: n(W - pad), y1: n(H - pad),
      iw: Math.max(4, n(W - 2 * pad)),
      ih: Math.max(4, n(H - 2 * pad)),
      small: (W < 120 || H < 50),          // reduzierte Variante
      tiny:  (W < 90  || H < 34),          // Extremfall: nur noch Silhouette
      scen: o.scenario || 'AC/PL',
      vAbs: v.abs !== false,
      vRel: v.rel !== false,
      dense: !!o.dense,
      rnd: mulberry32(o.seed == null ? 1 : o.seed)
    };
    c.lab = (!c.small && W >= 170 && H >= 90);   // Beschriftung nur wenn Platz
    c.fs  = W < 240 ? 8 : 9;
    return c;
  }

  function wrap(c, body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + c.w + ' ' + c.h +
           '" width="100%" height="100%" font-family="' + FONT + '">' + body + '</svg>';
  }

  // Zeichenfläche innerhalb des Innenrands, optional mit reservierten Rändern.
  function area(c, o) {
    o = o || {};
    var l = o.left || 0, r = o.right || 0, t = o.top || 0, b = o.bottom || 0;
    return {
      x: n(c.x0 + l), y: n(c.y0 + t),
      w: Math.max(3, n(c.iw - l - r)),
      h: Math.max(3, n(c.ih - t - b))
    };
  }

  // Horizontale Bänder (Ebenen) mit Gewichtung.
  function bands(y, h, parts, gap) {
    gap = gap == null ? 3 : gap;
    var sum = 0, i, out = [], cur = y;
    for (i = 0; i < parts.length; i++) sum += parts[i];
    var free = h - gap * (parts.length - 1);
    if (free < parts.length * 2) { free = Math.max(parts.length * 2, h); gap = 0; cur = y; }
    for (i = 0; i < parts.length; i++) {
      var bh = free * parts[i] / (sum || 1);
      out.push({ y: n(cur), h: Math.max(2, n(bh)) });
      cur += bh + gap;
    }
    return out;
  }

  // Gleichmäßige Kategorie-Slots.
  function slots(x, w, cnt, gapRatio) {
    var g = gapRatio == null ? 0.3 : gapRatio;
    cnt = Math.max(1, cnt | 0);
    var step = w / cnt;
    var bw = Math.max(0.9, step * (1 - g));
    var a = [], i;
    for (i = 0; i < cnt; i++) {
      a.push({ x: n(x + step * i + (step - bw) / 2), w: n(bw), cx: n(x + step * i + step / 2), step: n(step) });
    }
    return a;
  }

  // Wert -> Pixel. p0 = Pixel für vmin, p1 = Pixel für vmax.
  function sc(vmin, vmax, p0, p1) {
    var d = vmax - vmin;
    if (!isFinite(d) || d === 0) d = 1;
    return function (v) {
      v = +v; if (!isFinite(v)) v = vmin;
      return n(p0 + (v - vmin) / d * (p1 - p0));
    };
  }

  /* ---------------------------------------------------- Szenario-Werkzeuge */

  function refKind(c) {
    if (c.scen.indexOf('PY') >= 0) return 'PY';
    if (c.scen.indexOf('PL') >= 0) return 'PL';
    return null;                       // reines 'AC'
  }
  function hasFC(c) { return c.scen.indexOf('FC') >= 0; }

  // Ab diesem Index gelten Säulen als Forecast.
  function fcStart(c, cnt) { return hasFC(c) ? Math.max(1, Math.round(cnt * 0.68)) : cnt + 1; }

  // Schraffur-Definition für Forecast.
  function hatch() {
    var id = 'mkfc' + (++uid);
    return {
      id: id,
      defs: '<defs><pattern id="' + id + '" width="4" height="4" patternUnits="userSpaceOnUse" ' +
            'patternTransform="rotate(45 0 0)"><rect width="4" height="4" fill="#FFFFFF"/>' +
            '<line x1="0" y1="0" x2="0" y2="4" stroke="' + AC + '" stroke-width="0.9"/></pattern></defs>'
    };
  }
  function fcFill(hh, px) { return (hh && n(px) >= 6) ? 'url(#' + hh.id + ')' : FCC; }

  // Referenzbalken je Szenario.
  function refShape(x, y, w, h, kind, hh) {
    if (kind === 'PY') return rect(x, y, w, h, PY);
    if (kind === 'FC') return rect(x, y, w, h, fcFill(hh, w), AC, 0.8);
    return rect(x, y, w, h, PLF, PLS, 1);          // PL: weiß mit Kontur
  }

  /* ------------------------------------------------------ Datengeneratoren */

  function vals(c, cnt, base, spread) {
    var a = [], i;
    for (i = 0; i < cnt; i++) a.push(n(Math.max(6, base + (c.rnd() - 0.42) * spread)));
    return a;
  }
  function derive(c, src, lo, hi) {           // Referenzreihe aus der Istreihe
    var a = [], i;
    for (i = 0; i < src.length; i++) a.push(n(src[i] * (lo + c.rnd() * (hi - lo))));
    return a;
  }
  function diffs(a, b) {
    var d = [], i;
    for (i = 0; i < a.length; i++) d.push(n(a[i] - b[i]));
    return d;
  }
  function rels(a, b) {
    var d = [], i;
    for (i = 0; i < a.length; i++) d.push(n(b[i] ? (a[i] - b[i]) / Math.abs(b[i]) * 100 : 0));
    return d;
  }
  function sortDesc(a) { return a.slice().sort(function (x, y) { return y - x; }); }

  // Sparkline-Punkte: auf den eigenen Wertebereich skaliert, damit die Linie lebt.
  function sparkPts(c, cnt, x, y, w, h) {
    cnt = Math.max(2, cnt | 0);
    var v = vals(c, cnt, 60, 42), i, lo = v[0], hi = v[0];
    for (i = 1; i < cnt; i++) { if (v[i] < lo) lo = v[i]; if (v[i] > hi) hi = v[i]; }
    var pad = (hi - lo) * 0.18 || 1;
    var s = sc(lo - pad, hi + pad, y + h, y);
    var step = w / (cnt - 1), pts = [];
    for (i = 0; i < cnt; i++) pts.push([x + step * i, s(v[i])]);
    return pts;
  }

  /* --------------------------------------------------- Bausteine (Ebenen) */

  // Δ-absolut-Säulen um eine Nulllinie.
  function deltaCols(d, sl, y, h, showLbl, fs) {
    var m = maxOf(d) * 1.15, s = sc(-m, m, y + h, y), zero = s(0), b = '', i;
    b += ln(sl.length ? sl[0].x - 1 : 0, zero, sl.length ? sl[sl.length - 1].x + sl[sl.length - 1].w + 1 : 0, zero, AXIS, 0.8);
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = d[i] >= 0 ? GOOD : BAD;
      b += rect(sl[i].x, Math.min(zero, yy), sl[i].w, Math.max(0.9, Math.abs(zero - yy)), col);
      if (showLbl && sl[i].w >= 16) {
        b += txt(sl[i].cx, d[i] >= 0 ? Math.min(zero, yy) - 1.5 : Math.max(zero, yy) + fs, lbl(d[i], 0), fs, col, 'middle');
      }
    }
    return b;
  }

  // Δ-Prozent-Pins um eine Nulllinie.
  function deltaPins(d, sl, y, h, showLbl, fs) {
    var m = maxOf(d) * 1.2, s = sc(-m, m, y + h, y), zero = s(0), b = '', i;
    b += ln(sl.length ? sl[0].cx - 3 : 0, zero, sl.length ? sl[sl.length - 1].cx + 3 : 0, zero, AXIS, 0.8);
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = d[i] >= 0 ? GOOD : BAD;
      b += ln(sl[i].cx, zero, sl[i].cx, yy, col, 1);
      b += circ(sl[i].cx, yy, Math.min(2.2, Math.max(1, sl[i].w * 0.14)), col);
      if (showLbl && sl[i].w >= 18) {
        b += txt(sl[i].cx, d[i] >= 0 ? yy - 2.6 : yy + fs + 1.4, plbl(d[i]), fs, col, 'middle');
      }
    }
    return b;
  }

  // Horizontale Δ-Balken (für Balken-Kombis).
  function deltaBarsH(d, rows, x, w, showLbl, fs) {
    var m = maxOf(d) * 1.15, s = sc(-m, m, x, x + w), zero = s(0), b = '', i;
    b += ln(zero, rows[0].y - 1, zero, rows[rows.length - 1].y + rows[rows.length - 1].h + 1, AXIS, 0.8);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = d[i] >= 0 ? GOOD : BAD;
      b += rect(Math.min(zero, xx), rows[i].y, Math.max(0.9, Math.abs(xx - zero)), rows[i].h, col);
      if (showLbl && rows[i].h >= 9) {
        b += txt(d[i] >= 0 ? xx + 2 : xx - 2, rows[i].y + rows[i].h - 0.5, lbl(d[i], 0), fs, col, d[i] >= 0 ? 'start' : 'end');
      }
    }
    return b;
  }

  // Horizontale Δ%-Pins.
  function deltaPinsH(d, rows, x, w) {
    var m = maxOf(d) * 1.2, s = sc(-m, m, x, x + w), zero = s(0), b = '', i;
    b += ln(zero, rows[0].y - 1, zero, rows[rows.length - 1].y + rows[rows.length - 1].h + 1, AXIS, 0.8);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = d[i] >= 0 ? GOOD : BAD, cy = rows[i].y + rows[i].h / 2;
      b += ln(zero, cy, xx, cy, col, 1);
      b += circ(xx, cy, Math.min(2.2, Math.max(1, rows[i].h * 0.22)), col);
    }
    return b;
  }

  // Zeilenraster für horizontale Balken.
  function rowsOf(y, h, cnt, gapRatio) {
    var g = gapRatio == null ? 0.32 : gapRatio;
    cnt = Math.max(1, cnt | 0);
    var step = h / cnt, bh = Math.max(1.4, step * (1 - g)), a = [], i;
    for (i = 0; i < cnt; i++) a.push({ y: n(y + step * i + (step - bh) / 2), h: n(bh), cy: n(y + step * i + step / 2), step: n(step) });
    return a;
  }

  // Säulenblock AC gegen Referenz (Überlappungsdarstellung).
  function colBlock(c, P, ac, rf, kind, hh, baseline) {
    var cnt = ac.length, mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0) * 1.14;
    var s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, c.small ? 0.34 : 0.28);
    var b = '', i, fcAt = fcStart(c, cnt);
    for (i = 0; i < cnt; i++) {
      if (rf && kind) {
        b += refShape(sl[i].x, s(rf[i]), sl[i].w, P.y + P.h - s(rf[i]), kind, hh);
      }
      var iw = rf && kind ? sl[i].w * 0.56 : sl[i].w;
      var ix = sl[i].cx - iw / 2;
      var isFC = (i + 1) >= fcAt;
      b += isFC
        ? rect(ix, s(ac[i]), iw, Math.max(0.9, P.y + P.h - s(ac[i])), fcFill(hh, iw), AC, 0.8)
        : rect(ix, s(ac[i]), iw, Math.max(0.9, P.y + P.h - s(ac[i])), AC);
    }
    if (baseline !== false) b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    return { body: b, slots: sl, scale: s };
  }

  // Monatsbeschriftung unter einer Säulenreihe.
  function monLabels(c, sl, y) {
    if (!c.lab) return '';
    var b = '', i;
    for (i = 0; i < sl.length; i++) {
      if (sl[i].w < 11) continue;
      b += txt(sl[i].cx, y, MON[i % 12], c.fs, TXT, 'middle');
    }
    return b;
  }

  /* ====================================================================== */
  /*  Skizzen                                                               */
  /* ====================================================================== */

  var S = {};

  /* ---- 1 · Säulen: AC gegen Referenz, optional Δ-Ebene darüber ---------- */
  S.columns = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c);
    var ac = vals(c, cnt, 72, 46), rf = kind ? derive(c, ac, 0.78, 1.22) : null;
    var withDelta = (!c.small && c.h >= 130 && c.vAbs && kind);
    var labH = c.lab ? c.fs + 3 : 0;
    var P, top = 0;
    if (withDelta) {
      var bd = bands(c.y0, c.ih - labH, [26, 74], 6);
      P = { x: c.x0, y: bd[1].y, w: c.iw, h: bd[1].h };
      var slT = slots(c.x0, c.iw, cnt, 0.28);
      b += deltaCols(diffs(ac, rf), slT, bd[0].y, bd[0].h, c.lab, c.fs);
      top = bd[0].h;
    } else {
      P = area(c, { bottom: labH });
    }
    var blk = colBlock(c, P, ac, rf, kind, hh, true);
    b += blk.body + monLabels(c, blk.slots, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 2 · Säulen plus Linie ------------------------------------------- */
  S.colline = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var ac = vals(c, cnt, 68, 40);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(ac) * 1.2, s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.3), i, pts = [];
    for (i = 0; i < cnt; i++) {
      b += rect(sl[i].x, s(ac[i]), sl[i].w, Math.max(0.9, P.y + P.h - s(ac[i])), PY);
      pts.push([sl[i].cx, s(ac[i] * (0.55 + (i / cnt) * 0.5))]);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += polyline(pts, AC, c.small ? 1.2 : 1.6);
    if (!c.small) for (i = 0; i < pts.length; i++) b += circ(pts[i][0], pts[i][1], 1.6, AC);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 3 · Kombi: Säulen + Δabs + Δ% in drei Ebenen --------------------- */
  S.kombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c) || 'PL';
    var ac = vals(c, cnt, 72, 44), rf = derive(c, ac, 0.8, 1.2);
    var labH = c.lab ? c.fs + 3 : 0;
    var parts = c.small ? [34, 66] : [22, 22, 56];
    var bd = bands(c.y0, c.ih - labH, parts, c.small ? 2 : 4);
    var sl = slots(c.x0, c.iw, cnt, 0.28);
    if (c.small) {
      b += deltaCols(diffs(ac, rf), sl, bd[0].y, bd[0].h, false, c.fs);
      b += colBlock(c, { x: c.x0, y: bd[1].y, w: c.iw, h: bd[1].h }, ac, rf, kind, hh, true).body;
    } else {
      if (c.vRel) b += deltaPins(rels(ac, rf), sl, bd[0].y, bd[0].h, c.lab, c.fs);
      if (c.vAbs) b += deltaCols(diffs(ac, rf), sl, bd[1].y, bd[1].h, c.lab, c.fs);
      var blk = colBlock(c, { x: c.x0, y: bd[2].y, w: c.iw, h: bd[2].h }, ac, rf, kind, hh, true);
      b += blk.body + monLabels(c, blk.slots, c.y1 - 0.5);
    }
    return wrap(c, b);
  };

  /* ---- 4 · Nur Δ-absolut-Säulen ---------------------------------------- */
  S.absvar = function (w, h, o) {
    var c = ctx(w, h, o);
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var d = [], i;
    for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 60));
    var labH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { bottom: labH });
    var sl = slots(P.x, P.w, cnt, 0.3);
    var b = deltaCols(d, sl, P.y, P.h, c.lab, c.fs) + monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 5 · Nur Δ%-Pins -------------------------------------------------- */
  S.relvar = function (w, h, o) {
    var c = ctx(w, h, o);
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var d = [], i;
    for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 34));
    var labH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { bottom: labH });
    var sl = slots(P.x, P.w, cnt, 0.3);
    var b = deltaPins(d, sl, P.y, P.h, c.lab, c.fs) + monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 6 · Linien AC / PY ---------------------------------------------- */
  S.line = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : (c.dense ? 16 : 11);
    var ac = vals(c, cnt, 70, 34), rf = derive(c, ac, 0.72, 1.06);
    var labH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { bottom: labH });
    var mx = Math.max(maxOf(ac), maxOf(rf)) * 1.15;
    var s = sc(0, mx, P.y + P.h, P.y);
    var step = P.w / Math.max(1, cnt - 1), pa = [], pr = [], i;
    for (i = 0; i < cnt; i++) { pa.push([P.x + step * i, s(ac[i])]); pr.push([P.x + step * i, s(rf[i])]); }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    if (refKind(c)) b += polyline(pr, PY, c.small ? 1.1 : 1.4);
    b += polyline(pa, AC, c.small ? 1.3 : 1.8);
    if (!c.small) {
      b += circ(pa[pa.length - 1][0], pa[pa.length - 1][1], 2, AC);
      if (refKind(c)) b += circ(pr[pr.length - 1][0], pr[pr.length - 1][1], 2, PY);
    }
    return wrap(c, b);
  };

  /* ---- 7 · Slope-Graph, zwei Zeitpunkte -------------------------------- */
  S.slope = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : 5;
    var labW = c.lab ? 26 : 0;
    var P = area(c, { left: labW, right: labW, bottom: c.lab ? c.fs + 2 : 0 });
    var a = vals(c, cnt, 60, 60), z = vals(c, cnt, 60, 60);
    var mx = Math.max(maxOf(a), maxOf(z)) * 1.12, s = sc(0, mx, P.y + P.h, P.y), i;
    b += ln(P.x, P.y, P.x, P.y + P.h, GRID, 1);
    b += ln(P.x + P.w, P.y, P.x + P.w, P.y + P.h, GRID, 1);
    for (i = 0; i < cnt; i++) {
      var y1 = s(a[i]), y2 = s(z[i]);
      var col = z[i] >= a[i] ? AC : PY;
      b += ln(P.x, y1, P.x + P.w, y2, col, c.small ? 1.1 : 1.5);
      b += circ(P.x, y1, c.small ? 1.4 : 2, col) + circ(P.x + P.w, y2, c.small ? 1.4 : 2, col);
      if (c.lab) {
        b += txt(P.x - 3, y1 + 3, lbl(a[i], 0), c.fs, TXT, 'end');
        b += txt(P.x + P.w + 3, y2 + 3, lbl(z[i], 0), c.fs, TXT, 'start');
      }
    }
    if (c.lab) {
      b += txt(P.x, c.y1 - 0.5, 'PY', c.fs, TXT, 'middle');
      b += txt(P.x + P.w, c.y1 - 0.5, 'AC', c.fs, TXT, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 8 · Linie mit Forecast-Korridor --------------------------------- */
  S.fan = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : 12, split = Math.max(2, Math.round(cnt * 0.55));
    var ac = vals(c, cnt, 66, 26);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(ac) * 1.45, s = sc(0, mx, P.y + P.h, P.y);
    var step = P.w / Math.max(1, cnt - 1), i, hist = [], mid = [], up = [], dn = [];
    for (i = 0; i < split; i++) hist.push([P.x + step * i, s(ac[i])]);
    var lastV = ac[split - 1];
    for (i = split - 1; i < cnt; i++) {
      var t = (i - split + 1) / Math.max(1, cnt - split);
      var v = lastV * (1 + t * 0.22);
      var spread = lastV * t * 0.34;
      mid.push([P.x + step * i, s(v)]);
      up.push([P.x + step * i, s(v + spread)]);
      dn.push([P.x + step * i, s(v - spread)]);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += polygonEl(up.concat(dn.slice().reverse()), GRID);
    b += polyline(hist, AC, c.small ? 1.3 : 1.8);
    b += polyline(mid, AC, c.small ? 1 : 1.3, '3 2');
    if (!c.small) b += ln(P.x + step * (split - 1), P.y, P.x + step * (split - 1), P.y + P.h, GRID, 1);
    if (c.lab) b += txt(P.x + step * (split - 1) + 3, P.y + c.fs, 'FC', c.fs, TXT, 'start');
    return wrap(c, b);
  };

  /* ---- 9 · Z-Chart: Monat, kumuliert, gleitend 12 ---------------------- */
  S.zchart = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : 12;
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var step = P.w / Math.max(1, cnt - 1), i, mo = [], cum = [], mat = [];
    for (i = 0; i < cnt; i++) {
      var x = P.x + step * i;
      mo.push([x, P.y + P.h - P.h * (0.08 + c.rnd() * 0.12)]);
      cum.push([x, P.y + P.h - P.h * (0.06 + 0.82 * (i / Math.max(1, cnt - 1)))]);
      mat.push([x, P.y + P.h - P.h * (0.70 + (c.rnd() - 0.5) * 0.06)]);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += polyline(mo, PY, c.small ? 1 : 1.2);
    b += polyline(mat, PY, c.small ? 1 : 1.3, '3 2');
    b += polyline(cum, AC, c.small ? 1.4 : 1.9);
    if (c.lab) {
      b += txt(P.x + 2, mat[1][1] - 3, 'MAT 12', c.fs, TXT, 'start');
      b += txt(P.x + P.w - 2, cum[cnt - 1][1] - 3, 'kumuliert', c.fs, TXT, 'end');
    }
    return wrap(c, b);
  };

  /* ---- 10 · Gestapelte Säulen ------------------------------------------ */
  S.stackcol = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 4 : (c.dense ? 9 : 6);
    var segs = c.small ? 2 : 3, cols = [AC, G2, G3];
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var tot = [], parts = [], i, j;
    for (i = 0; i < cnt; i++) {
      var row = [], t = 0;
      for (j = 0; j < segs; j++) { var v = n(18 + c.rnd() * 26); row.push(v); t += v; }
      parts.push(row); tot.push(n(t));
    }
    var mx = maxOf(tot) * 1.1, s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.28);
    for (i = 0; i < cnt; i++) {
      var acc = 0;
      for (j = 0; j < segs; j++) {
        var y1 = s(acc), y2 = s(acc + parts[i][j]);
        b += rect(sl[i].x, y2, sl[i].w, Math.max(0.9, y1 - y2), cols[j % cols.length]);
        acc += parts[i][j];
      }
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 11 · Wasserfall, vertikal --------------------------------------- */
  S.waterfall = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : (c.dense ? 6 : 4);
    var cnt = mids + 2;
    var start = 70, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.4) * 34));
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var acc = start, peak = start, i2;
    for (i2 = 0; i2 < mids; i2++) { acc += steps[i2]; if (acc > peak) peak = acc; }
    var end = acc;
    var mx = Math.max(peak, start, end) * 1.18;
    var s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.26);
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, P.y + P.h - s(start)), AC);
    var cur = start;
    for (i = 0; i < mids; i++) {
      var from = cur, to = cur + steps[i];
      var yTop = s(Math.max(from, to)), yBot = s(Math.min(from, to));
      b += rect(sl[i + 1].x, yTop, sl[i + 1].w, Math.max(0.9, yBot - yTop), steps[i] >= 0 ? GOOD : BAD);
      b += ln(sl[i].x + sl[i].w, s(from), sl[i + 1].x, s(from), GRID, 1);
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[mids + 1].x, s(cur), GRID, 1);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, P.y + P.h - s(end)), AC);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    if (c.lab) {
      b += txt(sl[0].cx, c.y1 - 0.5, 'Σ', c.fs, TXT, 'middle');
      b += txt(sl[cnt - 1].cx, c.y1 - 0.5, 'Σ', c.fs, TXT, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 12 · Brücke: Σ PY -> Δ-Schritte -> Σ AC ------------------------- */
  S.bridge = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : 4, cnt = mids + 2;
    var start = 68, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 30));
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var acc = start, peak = start;
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; }
    var mx = Math.max(peak, start, acc) * 1.18, s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.26);
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, P.y + P.h - s(start)), PY);
    var cur = start;
    for (i = 0; i < mids; i++) {
      var to = cur + steps[i];
      var yTop = s(Math.max(cur, to)), yBot = s(Math.min(cur, to));
      b += ln(sl[i].x + sl[i].w, s(cur), sl[i + 1].x, s(cur), GRID, 1);
      b += rect(sl[i + 1].x, yTop, sl[i + 1].w, Math.max(0.9, yBot - yTop), steps[i] >= 0 ? GOOD : BAD);
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), GRID, 1);
    b += rect(sl[cnt - 1].x, s(cur), sl[cnt - 1].w, Math.max(0.9, P.y + P.h - s(cur)), AC);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    if (c.lab) {
      b += txt(sl[0].cx, c.y1 - 0.5, 'PY', c.fs, TXT, 'middle');
      b += txt(sl[cnt - 1].cx, c.y1 - 0.5, 'AC', c.fs, TXT, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 13 · Integrierte Varianzanalyse, vier Ebenen --------------------- */
  S.varint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var ac = vals(c, cnt, 74, 40), pl = derive(c, ac, 0.82, 1.18);
    var dAbs = diffs(ac, pl), dRel = rels(ac, pl);
    var ytd = [], run = 0, i;
    for (i = 0; i < cnt; i++) { run = n(run * 0.6 + dRel[i] * 0.5); ytd.push(run); }
    var labH = c.lab ? c.fs + 3 : 0;
    var parts = c.small ? [36, 64] : [16, 16, 24, 44];
    var bd = bands(c.y0, c.ih - labH, parts, c.small ? 2 : 3);
    var sl = slots(c.x0, c.iw, cnt, 0.28);
    if (c.small) {
      b += deltaPins(dRel, sl, bd[0].y, bd[0].h, false, c.fs);
      b += colBlock(c, { x: c.x0, y: bd[1].y, w: c.iw, h: bd[1].h }, ac, pl, 'PL', hh, true).body;
      return wrap(c, b);
    }
    b += deltaPins(ytd, sl, bd[0].y, bd[0].h, false, c.fs);
    b += deltaPins(dRel, sl, bd[1].y, bd[1].h, false, c.fs);
    // Ebene 3: Δ-Brücke (aufgelaufene Abweichung)
    var mx3 = maxOf(dAbs) * 2.4, s3 = sc(-mx3 * 0.2, mx3, bd[2].y + bd[2].h, bd[2].y), acc = 0;
    b += ln(c.x0, s3(0), c.x1, s3(0), AXIS, 0.8);
    for (i = 0; i < cnt; i++) {
      var from = acc, to = acc + dAbs[i];
      var yT = s3(Math.max(from, to)), yB = s3(Math.min(from, to));
      b += rect(sl[i].x, yT, sl[i].w, Math.max(0.9, yB - yT), dAbs[i] >= 0 ? GOOD : BAD);
      acc = to;
    }
    var blk = colBlock(c, { x: c.x0, y: bd[3].y, w: c.iw, h: bd[3].h }, ac, pl, 'PL', hh, true);
    b += blk.body + monLabels(c, blk.slots, c.y1 - 0.5);
    if (c.lab) {
      b += txt(c.x0, bd[0].y + c.fs - 1, 'Δ% YTD', c.fs, TXT, 'start');
      b += txt(c.x0, bd[1].y + c.fs - 1, 'Δ%', c.fs, TXT, 'start');
    }
    return wrap(c, b);
  };

  /* ---- 14 · Horizontale Balken, sortiert -------------------------------- */
  S.bars = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var kind = refKind(c);
    var ac = sortDesc(vals(c, cnt, 68, 50)), rf = kind ? derive(c, ac, 0.78, 1.2) : null;
    var labW = c.lab ? 34 : 0;
    var P = area(c, { left: labW });
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0) * 1.12;
    var s = sc(0, mx, P.x, P.x + P.w);
    var rw = rowsOf(P.y, P.h, cnt, c.small ? 0.36 : 0.3), i;
    for (i = 0; i < cnt; i++) {
      if (rf && kind) b += refShape(P.x, rw[i].y, Math.max(0.9, s(rf[i]) - P.x), rw[i].h, kind, hh);
      var ih = rf && kind ? rw[i].h * 0.56 : rw[i].h;
      b += rect(P.x, rw[i].cy - ih / 2, Math.max(0.9, s(ac[i]) - P.x), ih, AC);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 15 · Bullet-Balken mit Zielmarke -------------------------------- */
  S.bullet = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 2 : (c.dense ? 6 : 4);
    var labW = c.lab ? 34 : 0;
    var P = area(c, { left: labW });
    var rw = rowsOf(P.y, P.h, cnt, 0.34), i;
    for (i = 0; i < cnt; i++) {
      var v = 0.45 + c.rnd() * 0.5, t = 0.55 + c.rnd() * 0.35;
      b += rect(P.x, rw[i].y, P.w, rw[i].h, GRID);
      b += rect(P.x, rw[i].y + rw[i].h * 0.22, Math.max(0.9, P.w * Math.min(1, v)), rw[i].h * 0.56, AC);
      b += ln(P.x + P.w * Math.min(1, t), rw[i].y - 0.6, P.x + P.w * Math.min(1, t), rw[i].y + rw[i].h + 0.6, AXIS, 1.4);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 16 · Pareto: Balken plus Summenlinie ---------------------------- */
  S.pareto = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 4 : (c.dense ? 9 : 6);
    var v = sortDesc(vals(c, cnt, 60, 70)), tot = 0, i;
    for (i = 0; i < cnt; i++) tot += v[i];
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(v) * 1.15, s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.24), acc = 0, pts = [];
    for (i = 0; i < cnt; i++) {
      b += rect(sl[i].x, s(v[i]), sl[i].w, Math.max(0.9, P.y + P.h - s(v[i])), PY);
      acc += v[i];
      pts.push([sl[i].cx, P.y + P.h - P.h * 0.9 * (acc / (tot || 1))]);
    }
    if (!c.small) b += ln(P.x, P.y + P.h - P.h * 0.72, P.x + P.w, P.y + P.h - P.h * 0.72, GRID, 1, '3 2');
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += polyline(pts, AC, c.small ? 1.2 : 1.6);
    if (!c.small) for (i = 0; i < pts.length; i++) b += circ(pts[i][0], pts[i][1], 1.6, AC);
    if (c.lab) b += txt(P.x + P.w, P.y + P.h - P.h * 0.72 - 2, '80 %', c.fs, TXT, 'end');
    return wrap(c, b);
  };

  /* ---- 17 · Dot-Plot: Punkte auf Linien -------------------------------- */
  S.dotplot = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var labW = c.lab ? 34 : 0;
    var P = area(c, { left: labW, right: 4 });
    var rw = rowsOf(P.y, P.h, cnt, 0.2), i;
    var r = c.small ? 1.6 : 2.4;
    for (i = 0; i < cnt; i++) {
      b += ln(P.x, rw[i].cy, P.x + P.w, rw[i].cy, GRID, 1);
      var a = 0.25 + c.rnd() * 0.65, p = 0.2 + c.rnd() * 0.6;
      if (refKind(c)) b += circ(P.x + P.w * p, rw[i].cy, r, PY);
      b += circ(P.x + P.w * a, rw[i].cy, r, AC);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 18 · Tornado ---------------------------------------------------- */
  S.tornado = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var P = area(c, {});
    var mid = P.x + P.w / 2;
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i;
    for (i = 0; i < cnt; i++) {
      var f = 1 - i / (cnt + 1);
      var l = P.w * 0.46 * f * (0.5 + c.rnd() * 0.5);
      var r = P.w * 0.46 * f * (0.5 + c.rnd() * 0.5);
      b += rect(mid - l, rw[i].y, Math.max(0.9, l), rw[i].h, PY);
      b += rect(mid, rw[i].y, Math.max(0.9, r), rw[i].h, AC);
    }
    b += ln(mid, P.y, mid, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 19 · Balken-Kombi: Balken + Δabs + Δ% nebeneinander ------------- */
  S.barskombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var ac = sortDesc(vals(c, cnt, 68, 46)), pl = derive(c, ac, 0.8, 1.2);
    var labW = c.lab ? 30 : 0;
    var P = area(c, { left: labW });
    var gap = c.small ? 3 : 6;
    var wide = c.small, i;
    var w1 = wide ? P.w * 0.62 : P.w * 0.46;
    var w2 = wide ? P.w * 0.38 - gap : P.w * 0.27 - gap;
    var w3 = wide ? 0 : P.w * 0.27 - gap;
    var rw = rowsOf(P.y, P.h, cnt, 0.3);
    var mx = Math.max(maxOf(ac), maxOf(pl)) * 1.1, s = sc(0, mx, P.x, P.x + w1);
    for (i = 0; i < cnt; i++) {
      b += refShape(P.x, rw[i].y, Math.max(0.9, s(pl[i]) - P.x), rw[i].h, refKind(c) || 'PL', hh);
      b += rect(P.x, rw[i].cy - rw[i].h * 0.28, Math.max(0.9, s(ac[i]) - P.x), rw[i].h * 0.56, AC);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    if (c.vAbs) b += deltaBarsH(diffs(ac, pl), rw, P.x + w1 + gap, w2, false, c.fs);
    if (!wide && c.vRel) b += deltaPinsH(rels(ac, pl), rw, P.x + w1 + gap + w2 + gap, w3);
    return wrap(c, b);
  };

  /* ---- 20 · IBCS-Tabelle ----------------------------------------------- */
  S.table = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 3 : (c.dense ? 7 : 5);
    var P = area(c, {});
    var headH = c.lab ? c.fs + 3 : Math.min(7, P.h * 0.18);
    var rh = (P.h - headH) / rows;
    var colX = [0, 0.34, 0.52, 0.70, 0.86];   // Kat | AC | PL | Δ | Δ%
    var i, j;
    b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, AXIS, 1);
    if (c.lab) {
      var head = ['', 'AC', 'PL', 'Δ', 'Δ%'];
      for (j = 1; j < colX.length; j++) {
        b += txt(P.x + P.w * colX[j] + P.w * 0.13, P.y + headH - 3, head[j], c.fs, TXT, 'end');
      }
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i, cy = y + rh * 0.66;
      if (i) b += ln(P.x, y, P.x + P.w, y, GRID, 1);
      var ac = n(40 + c.rnd() * 60), pl = n(ac * (0.8 + c.rnd() * 0.4)), d = n(ac - pl);
      if (c.lab) {
        b += txt(P.x, cy, CAT[i % CAT.length], c.fs, TXT, 'start');
        b += txt(P.x + P.w * colX[1] + P.w * 0.13, cy, lbl(ac, 0), c.fs, AC, 'end');
        b += txt(P.x + P.w * colX[2] + P.w * 0.13, cy, lbl(pl, 0), c.fs, TXT, 'end');
        b += txt(P.x + P.w * 0.99, cy, plbl(d / (pl || 1) * 100), c.fs, d >= 0 ? GOOD : BAD, 'end');
      } else {
        b += ghost(P.x, y + rh * 0.35, P.w * 0.26, Math.max(1.4, rh * 0.22));
        b += ghost(P.x + P.w * 0.36, y + rh * 0.35, P.w * 0.12, Math.max(1.4, rh * 0.22), '#8A8A8A');
        b += ghost(P.x + P.w * 0.54, y + rh * 0.35, P.w * 0.12, Math.max(1.4, rh * 0.22));
      }
      // Mini-Balken in der Δ-Spalte
      var zx = P.x + P.w * (colX[3] + 0.08), bw = P.w * 0.11 * (0.3 + c.rnd() * 0.7);
      var bh = Math.max(1.6, rh * 0.42);
      b += d >= 0 ? rect(zx, y + (rh - bh) / 2, bw, bh, GOOD)
                  : rect(zx - bw, y + (rh - bh) / 2, bw, bh, BAD);
      b += ln(zx, y + rh * 0.1, zx, y + rh * 0.9, GRID, 0.8);
    }
    return wrap(c, b);
  };

  /* ---- 21 · Wasserfall-Kombi: Wasserfall + Δ --------------------------- */
  S.wfkombi = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : 4, cnt = mids + 2;
    var start = 70, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 32));
    var bd = bands(c.y0, c.ih, [66, 34], c.small ? 2 : 4);
    var P = { x: c.x0, y: bd[0].y, w: c.iw, h: bd[0].h };
    var acc = start, peak = start;
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; }
    var mx = Math.max(peak, start, acc) * 1.15, s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.26), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, P.y + P.h - s(start)), AC);
    for (i = 0; i < mids; i++) {
      var to = cur + steps[i], yT = s(Math.max(cur, to)), yB = s(Math.min(cur, to));
      b += ln(sl[i].x + sl[i].w, s(cur), sl[i + 1].x, s(cur), GRID, 1);
      b += rect(sl[i + 1].x, yT, sl[i + 1].w, Math.max(0.9, yB - yT), steps[i] >= 0 ? GOOD : BAD);
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), GRID, 1);
    b += rect(sl[cnt - 1].x, s(cur), sl[cnt - 1].w, Math.max(0.9, P.y + P.h - s(cur)), AC);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    var d = [], k;
    for (k = 0; k < cnt; k++) d.push(n((c.rnd() - 0.45) * 26));
    b += deltaCols(d, sl, bd[1].y, bd[1].h, false, c.fs);
    return wrap(c, b);
  };

  /* ---- 22 · Horizontaler Wasserfall mit integrierter Varianz ----------- */
  S.wfint = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : 4, cnt = mids + 2;
    var labW = c.lab ? 30 : 0;
    var dW = c.small ? 0 : Math.max(18, c.iw * 0.2);
    var P = area(c, { left: labW, right: dW ? dW + 4 : 0 });
    var start = 66, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 28));
    var acc = start, peak = start;
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; }
    var mx = Math.max(peak, start, acc) * 1.1, s = sc(0, mx, P.x, P.x + P.w);
    var rw = rowsOf(P.y, P.h, cnt, 0.28), cur = start;
    b += rect(P.x, rw[0].y, Math.max(0.9, s(start) - P.x), rw[0].h, AC);
    for (i = 0; i < mids; i++) {
      var to = cur + steps[i], xL = s(Math.min(cur, to)), xR = s(Math.max(cur, to));
      b += ln(s(cur), rw[i].y + rw[i].h, s(cur), rw[i + 1].y, GRID, 1);
      b += rect(xL, rw[i + 1].y, Math.max(0.9, xR - xL), rw[i + 1].h, steps[i] >= 0 ? GOOD : BAD);
      cur = to;
    }
    b += ln(s(cur), rw[mids].y + rw[mids].h, s(cur), rw[cnt - 1].y, GRID, 1);
    b += rect(P.x, rw[cnt - 1].y, Math.max(0.9, s(cur) - P.x), rw[cnt - 1].h, AC);
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    if (c.lab) {
      b += txt(P.x - 3, rw[0].cy + c.fs * 0.35, 'PY', c.fs, TXT, 'end');
      b += txt(P.x - 3, rw[cnt - 1].cy + c.fs * 0.35, 'AC', c.fs, TXT, 'end');
      for (i = 0; i < mids; i++) b += txt(P.x - 3, rw[i + 1].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    if (dW) {
      var d = [], k;
      for (k = 0; k < cnt; k++) d.push(n((c.rnd() - 0.45) * 22));
      b += deltaBarsH(d, rw, c.x1 - dW, dW, false, c.fs);
    }
    return wrap(c, b);
  };

  /* ---- 23 · Gestapelte Balken ------------------------------------------ */
  S.stackbar = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 7 : 5);
    var segs = c.small ? 2 : 3, cols = [AC, G2, G3];
    var labW = c.lab ? 32 : 0;
    var P = area(c, { left: labW });
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i, j;
    for (i = 0; i < cnt; i++) {
      var tot = 0.55 + c.rnd() * 0.45, x = P.x;
      for (j = 0; j < segs; j++) {
        var sw2 = P.w * tot * (j === segs - 1 ? 0.3 : (0.2 + c.rnd() * 0.25));
        b += rect(x, rw[i].y, Math.max(0.9, sw2), rw[i].h, cols[j % cols.length]);
        x += sw2;
      }
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 24 · Small Multiples, 2x3 --------------------------------------- */
  S.multiples = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 2 : 3, rws = c.small ? 1 : 2;
    var gx = 4, gy = c.lab ? 10 : 4;
    var cw = (c.iw - gx * (cols - 1)) / cols;
    var ch = (c.ih - gy * (rws - 1)) / rws;
    var i, j, k;
    for (i = 0; i < rws; i++) {
      for (j = 0; j < cols; j++) {
        var px = c.x0 + j * (cw + gx), py = c.y0 + i * (ch + gy);
        var hd = c.lab ? c.fs + 1 : 0;
        var P = { x: px, y: py + hd, w: cw, h: Math.max(3, ch - hd) };
        if (c.lab) b += txt(px, py + c.fs - 1, CAT[(i * cols + j) % CAT.length], c.fs, TXT, 'start');
        var v = vals(c, 4, 60, 40);
        var mx = maxOf(v) * 1.15, s = sc(0, mx, P.y + P.h, P.y);
        var sl = slots(P.x, P.w, 4, 0.34);
        for (k = 0; k < 4; k++) b += rect(sl[k].x, s(v[k]), sl[k].w, Math.max(0.9, P.y + P.h - s(v[k])), AC);
        b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 0.9);
      }
    }
    return wrap(c, b);
  };

  /* ---- 25 · Tabelle mit Sparklines -------------------------------------- */
  S.sparktable = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 2 : (c.dense ? 6 : 4);
    var P = area(c, {});
    var rh = P.h / rows;
    var labW = c.lab ? P.w * 0.24 : P.w * 0.2;
    var valW = c.lab ? P.w * 0.18 : P.w * 0.14;
    var spX = P.x + labW + 3, spW = Math.max(6, P.w - labW - valW - 6);
    var i, k;
    for (i = 0; i < rows; i++) {
      var y = P.y + rh * i, cy = y + rh * 0.66;
      if (i) b += ln(P.x, y, P.x + P.w, y, GRID, 1);
      if (c.lab) b += txt(P.x, cy, CAT[i % CAT.length], c.fs, TXT, 'start');
      else b += ghost(P.x, y + rh * 0.4, labW * 0.8, Math.max(1.4, rh * 0.18));
      var pts = sparkPts(c, 8, spX, y + rh * 0.18, spW, rh * 0.64);
      b += polyline(pts, AC, 1.1);
      b += circ(pts[7][0], pts[7][1], 1.3, AC);
      var d = n((c.rnd() - 0.42) * 20);
      if (c.lab) b += txt(P.x + P.w, cy, plbl(d), c.fs, d >= 0 ? GOOD : BAD, 'end');
      else b += ghost(P.x + P.w - valW * 0.7, y + rh * 0.4, valW * 0.7, Math.max(1.4, rh * 0.18), d >= 0 ? GOOD : BAD);
    }
    return wrap(c, b);
  };

  /* ---- 26 · Heatmap, divergierend --------------------------------------- */
  S.heatmap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 4 : (c.dense ? 12 : 8);
    var rows = c.small ? 3 : (c.dense ? 6 : 4);
    var labW = c.lab ? 28 : 0, labH = c.lab ? c.fs + 2 : 0;
    var P = area(c, { left: labW, top: labH });
    var cw = P.w / cols, ch = P.h / rows, i, j;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        var v = c.rnd() * 2 - 1;
        var a = Math.min(0.92, Math.abs(v) * 0.95 + 0.06);
        var fill = Math.abs(v) < 0.14 ? GRID : (v >= 0 ? GOOD : BAD);
        var x = P.x + cw * j, y = P.y + ch * i;
        b += '<rect x="' + n(x + 0.4) + '" y="' + n(y + 0.4) + '" width="' + n(Math.max(0.8, cw - 0.8)) +
             '" height="' + n(Math.max(0.8, ch - 0.8)) + '" fill="' + fill +
             '" fill-opacity="' + n(Math.abs(v) < 0.14 ? 1 : a) + '"/>';
      }
      if (c.lab) b += txt(P.x - 3, P.y + ch * i + ch * 0.66, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    if (c.lab) for (j = 0; j < cols && j < 12; j++) {
      if (cw < 12) break;
      b += txt(P.x + cw * j + cw / 2, P.y - 2, MON[j % 12], c.fs, TXT, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 27 · Marimekko --------------------------------------------------- */
  S.marimekko = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : 5, segs = c.small ? 2 : 3, cols = [AC, G2, G3];
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var wts = [], tot = 0, i, j;
    for (i = 0; i < cnt; i++) { var wv = 0.4 + c.rnd(); wts.push(wv); tot += wv; }
    var x = P.x, gap = c.small ? 1.5 : 2.5;
    var avail = P.w - gap * (cnt - 1);
    for (i = 0; i < cnt; i++) {
      var cw = avail * wts[i] / (tot || 1), y = P.y + P.h;
      var rest = 1;
      for (j = 0; j < segs; j++) {
        var frac = j === segs - 1 ? rest : rest * (0.28 + c.rnd() * 0.36);
        var sh = P.h * frac;
        b += rect(x, y - sh, Math.max(0.9, cw), Math.max(0.9, sh), cols[j % cols.length]);
        y -= sh; rest -= frac;
        if (rest < 0.05) rest = 0.05;
      }
      if (c.lab && cw >= 14) b += txt(x + cw / 2, c.y1 - 0.5, CAT[i % CAT.length], c.fs, TXT, 'middle');
      x += cw + gap;
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 28 · Treiberbaum / Zerlegung ------------------------------------ */
  S.tree = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var kids = c.small ? 2 : 3;
    var P = area(c, {});
    var bw = Math.min(P.w * 0.3, 54), bh = Math.min(P.h * 0.26, 22);
    var rx = P.x, ry = P.y + P.h / 2 - bh / 2;
    var cx = P.x + P.w - bw, i;
    var step = P.h / kids;
    b += rrect(rx, ry, bw, bh, 2, PLF, AC, 1);
    b += ghost(rx + 3, ry + bh * 0.3, bw * 0.55, Math.max(1.4, bh * 0.16), '#8A8A8A');
    b += rect(rx + 3, ry + bh * 0.62, Math.max(1, bw * 0.7), Math.max(1.2, bh * 0.16), AC);
    for (i = 0; i < kids; i++) {
      var ky = P.y + step * i + step / 2 - bh / 2;
      var mid = rx + bw + (cx - rx - bw) / 2;
      b += ln(rx + bw, ry + bh / 2, mid, ry + bh / 2, GRID, 1);
      b += ln(mid, ry + bh / 2, mid, ky + bh / 2, GRID, 1);
      b += ln(mid, ky + bh / 2, cx, ky + bh / 2, GRID, 1);
      b += rrect(cx, ky, bw, bh, 2, PLF, PY, 1);
      b += rect(cx + 3, ky + bh * 0.58, Math.max(1, bw * (0.3 + c.rnd() * 0.5)), Math.max(1.2, bh * 0.16), i === 0 ? AC : PY);
      if (c.lab) b += txt(cx + 3, ky + bh * 0.42, CAT[i % CAT.length], c.fs, TXT, 'start');
    }
    return wrap(c, b);
  };

  /* ---- 29 · Boxplot ----------------------------------------------------- */
  S.boxplot = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 7 : 5);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var s = sc(0, 100, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.45), i;
    for (i = 0; i < cnt; i++) {
      var med = 35 + c.rnd() * 30;
      var q1 = med - (8 + c.rnd() * 10), q3 = med + (8 + c.rnd() * 10);
      var lo = q1 - (8 + c.rnd() * 12), hi = q3 + (8 + c.rnd() * 12);
      var cxp = sl[i].cx, bwid = sl[i].w;
      b += ln(cxp, s(hi), cxp, s(lo), AXIS, 1);
      b += ln(cxp - bwid * 0.28, s(hi), cxp + bwid * 0.28, s(hi), AXIS, 1);
      b += ln(cxp - bwid * 0.28, s(lo), cxp + bwid * 0.28, s(lo), AXIS, 1);
      b += rect(sl[i].x, s(q3), bwid, Math.max(0.9, s(q1) - s(q3)), PLF, AC, 1);
      b += ln(sl[i].x, s(med), sl[i].x + bwid, s(med), AC, 1.6);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 30 · KPI-Kachel -------------------------------------------------- */
  S.kpi = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    // Ausnahme zur 8–10-px-Regel: die Kennzahl selbst ist das Erkennungsmerkmal.
    var big = clamp(Math.min(P.h * 0.38, P.w * 0.24), 11, 28);
    var d = n((c.rnd() - 0.35) * 18);
    var col = d >= 0 ? GOOD : BAD;
    var yBig = P.y + big * 0.92;
    // Beschriftung: o.label (leer = keine, weil die Kachel den Titel schon trägt), sonst Demo-Label
    var kpiLabel = (o && o.label !== undefined) ? String(o.label) : 'Umsatz';
    if (!c.small && kpiLabel) b += txt(P.x, P.y + c.fs - 1, kpiLabel, Math.min(9, c.fs), TXT, 'start');
    b += txt(P.x, yBig + (c.small ? 0 : c.fs - 2), lbl(124.6), big, AC, 'start', '600');
    var yD = yBig + (c.small ? 0 : c.fs - 2) + Math.min(12, big * 0.5);
    if (yD < P.y + P.h - 1) {
      b += pathEl(d >= 0
        ? 'M' + n(P.x) + ' ' + n(yD - 2) + ' l4 -4 l4 4 z'
        : 'M' + n(P.x) + ' ' + n(yD - 6) + ' l4 4 l4 -4 z', col);
      b += txt(P.x + 11, yD, plbl(d) + (c.small ? '' : ' vs PL'), Math.min(9, c.fs), col, 'start');
    }
    // Mini-Sparkline rechts unten
    if (P.w >= 60 && P.h >= 34) {
      var sw2 = P.w * 0.38, sh = Math.min(16, P.h * 0.3);
      var sx = P.x + P.w - sw2, sy = P.y + P.h - sh;
      var pts = sparkPts(c, 8, sx, sy, sw2, sh);
      b += polyline(pts, PY, 1.2);
      b += circ(pts[7][0], pts[7][1], 1.5, AC);
    }
    return wrap(c, b);
  };

  /* ---- 31 · Streudiagramm mit Quadranten -------------------------------- */
  S.scatter = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 7 : (c.dense ? 24 : 14);
    var P = area(c, {});
    b += ln(P.x + P.w / 2, P.y, P.x + P.w / 2, P.y + P.h, GRID, 1);
    b += ln(P.x, P.y + P.h / 2, P.x + P.w, P.y + P.h / 2, GRID, 1);
    var i, r = c.small ? 1.4 : 2.1;
    for (i = 0; i < cnt; i++) {
      var x = P.x + 3 + c.rnd() * (P.w - 6);
      var y = P.y + 3 + c.rnd() * (P.h - 6);
      b += circ(x, y, r, i % 5 === 0 ? AC : PY);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- 32 · Gantt ------------------------------------------------------- */
  S.gantt = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var labW = c.lab ? 34 : 0;
    var headH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { left: labW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.38), i;
    if (c.lab) {
      for (i = 0; i < 4; i++) {
        b += ln(P.x + P.w * (i / 4), P.y, P.x + P.w * (i / 4), P.y + P.h, GRID, 1);
        b += txt(P.x + P.w * (i / 4) + 2, P.y - 2, 'Q' + (i + 1), c.fs, TXT, 'start');
      }
    }
    for (i = 0; i < cnt; i++) {
      var st = c.rnd() * 0.5, len = 0.18 + c.rnd() * 0.42;
      if (st + len > 0.98) len = 0.98 - st;
      b += rect(P.x + P.w * st, rw[i].y, Math.max(1.2, P.w * len), rw[i].h, i % 3 === 0 ? AC : PY);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, CAT[i % CAT.length], c.fs, TXT, 'end');
    }
    b += ln(P.x + P.w * 0.62, P.y - 1, P.x + P.w * 0.62, P.y + P.h + 1, BAD, 1, '3 2');
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ====================================================================== */
  /*  Native Power-BI-Visuals                                               */
  /* ====================================================================== */

  /* ---- Karte ------------------------------------------------------------ */
  S.card = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    // Ausnahme zur 8–10-px-Regel: die Zahl ist der Inhalt der Karte.
    var big = clamp(Math.min(P.h * 0.46, P.w * 0.3), 12, 30);
    var cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    b += txt(cx, cy + big * 0.28, lbl(84.2), big, AC, 'middle', '600');
    var cardLabel = (o && o.label !== undefined) ? String(o.label) : 'Umsatz gesamt';
    if (!c.small && P.h >= 30 && cardLabel) b += txt(cx, cy + big * 0.28 + Math.min(11, c.fs + 3), cardLabel, Math.min(9, c.fs), TXT, 'middle');
    return wrap(c, b);
  };

  /* ---- Mehrzeilige Karte ------------------------------------------------ */
  S.multirow = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 2 : (c.dense ? 5 : 3);
    var P = area(c, {});
    var rh = P.h / rows, i;
    var names = ['Umsatz', 'Marge', 'Menge', 'Kunden', 'Aufträge'];
    var nums = [84.2, 31.7, 12.4, 268, 41];
    for (i = 0; i < rows; i++) {
      var y = P.y + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, GRID, 1);
      var vs = clamp(rh * 0.42, 9, 14);
      if (!c.small && P.w >= 90 && rh >= 16) {
        b += txt(P.x, y + rh * 0.42, names[i % names.length], Math.min(9, c.fs), TXT, 'start');
        b += txt(P.x, y + rh * 0.88, lbl(nums[i % nums.length]), vs, AC, 'start', '600');
      } else {
        b += ghost(P.x, y + rh * 0.28, P.w * 0.44, Math.max(1.3, rh * 0.14));
        b += rect(P.x, y + rh * 0.55, Math.max(1.2, P.w * 0.3), Math.max(1.6, rh * 0.22), AC);
      }
    }
    return wrap(c, b);
  };

  /* ---- Matrix ----------------------------------------------------------- */
  S.matrix = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 3 : (c.dense ? 6 : 4);
    var rows = c.small ? 3 : (c.dense ? 7 : 5);
    var P = area(c, {});
    var hw = P.w * (c.lab ? 0.24 : 0.28);
    var hh2 = Math.min(c.fs + 3, P.h * 0.22);
    var cw = (P.w - hw) / cols, rh = (P.h - hh2) / rows, i, j;
    b += rect(P.x, P.y, P.w, hh2, '#F2F2F2');
    b += ln(P.x, P.y + hh2, P.x + P.w, P.y + hh2, AXIS, 1);
    b += ln(P.x + hw, P.y, P.x + hw, P.y + P.h, GRID, 1);
    for (j = 0; j < cols; j++) {
      if (j) b += ln(P.x + hw + cw * j, P.y, P.x + hw + cw * j, P.y + P.h, GRID, 1);
      if (c.lab && cw >= 20) b += txt(P.x + hw + cw * (j + 1) - 2, P.y + hh2 - 3, MON[j % 12], c.fs, TXT, 'end');
      else b += ghost(P.x + hw + cw * j + cw * 0.2, P.y + hh2 * 0.42, cw * 0.6, Math.max(1.2, hh2 * 0.2), '#9E9E9E');
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + hh2 + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, GRID, 1);
      if (c.lab) b += txt(P.x + 1, y + rh * 0.68, CAT[i % CAT.length], c.fs, TXT, 'start');
      else b += ghost(P.x + 1, y + rh * 0.38, hw * 0.7, Math.max(1.2, rh * 0.2));
      for (j = 0; j < cols; j++) {
        var vx = P.x + hw + cw * (j + 1) - 2;
        if (c.lab && cw >= 20) b += txt(vx, y + rh * 0.68, lbl(20 + c.rnd() * 70, 0), c.fs, AC, 'end');
        else b += ghost(vx - cw * 0.5, y + rh * 0.38, cw * 0.44, Math.max(1.2, rh * 0.2), '#8A8A8A');
      }
    }
    return wrap(c, b);
  };

  /* ---- Datenschnitt ----------------------------------------------------- */
  S.slicer = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    if (c.small || P.h < 46) {
      // Dropdown-Variante
      var dh = Math.min(P.h, 16);
      b += rrect(P.x, P.y + (P.h - dh) / 2, P.w, dh, 2, PLF, PY, 1);
      b += ghost(P.x + 4, P.y + (P.h - dh) / 2 + dh * 0.42, P.w * 0.45, Math.max(1.2, dh * 0.16));
      var ax = P.x + P.w - 7, ay = P.y + (P.h - dh) / 2 + dh * 0.44;
      b += pathEl('M' + n(ax - 3) + ' ' + n(ay) + ' l3 3 l3 -3', 'none', AC, 1.2);
      return wrap(c, b);
    }
    var rows = c.dense ? 5 : 4, rh = P.h / rows, i;
    for (i = 0; i < rows; i++) {
      var y = P.y + rh * i, bs = Math.min(8, rh * 0.5);
      var by = y + (rh - bs) / 2;
      b += rect(P.x, by, bs, bs, i === 0 ? AC : PLF, AC, 1);
      if (i === 0) b += pathEl('M' + n(P.x + bs * 0.22) + ' ' + n(by + bs * 0.52) + ' l' + n(bs * 0.24) + ' ' + n(bs * 0.26) + ' l' + n(bs * 0.5) + ' -' + n(bs * 0.52), 'none', '#FFFFFF', 1.2);
      if (c.lab) b += txt(P.x + bs + 4, y + rh * 0.62, CAT[i % CAT.length], c.fs, TXT, 'start');
      else b += ghost(P.x + bs + 4, by + bs * 0.32, P.w * 0.5, Math.max(1.2, bs * 0.24));
    }
    return wrap(c, b);
  };

  /* ---- Textfeld ---------------------------------------------------------- */
  S.text = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var rows = Math.max(2, Math.min(6, Math.floor(P.h / 7)));
    var lh = P.h / rows, i;
    var wfrac = [1, 0.92, 0.97, 0.86, 0.94, 0.55];
    for (i = 0; i < rows; i++) {
      var f = i === rows - 1 ? 0.55 : wfrac[i % wfrac.length];
      var th = Math.max(1.6, Math.min(3, lh * 0.34));
      b += rect(P.x, P.y + lh * i + (lh - th) / 2, Math.max(1, P.w * f), th, i === 0 ? '#9E9E9E' : '#D4D4D4');
    }
    return wrap(c, b);
  };

  /* ---- Bildplatzhalter --------------------------------------------------- */
  S.image = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rect(P.x, P.y, P.w, P.h, '#F5F5F5', PY, 1);
    b += ln(P.x, P.y, P.x + P.w, P.y + P.h, PY, 1);
    b += ln(P.x + P.w, P.y, P.x, P.y + P.h, PY, 1);
    return wrap(c, b);
  };

  /* ---- Schaltfläche ------------------------------------------------------ */
  S.button = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var bh = Math.min(P.h, Math.max(12, P.h * 0.5));
    var bw = Math.min(P.w, Math.max(30, P.w * 0.7));
    var bx = P.x + (P.w - bw) / 2, by = P.y + (P.h - bh) / 2;
    b += rrect(bx, by, bw, bh, Math.min(4, bh / 2), '#F2F2F2', AC, 1);
    if (!c.small && bh >= 14 && bw >= 44) b += txt(bx + bw / 2, by + bh / 2 + c.fs * 0.35, 'Anwenden', Math.min(9, c.fs), AC, 'middle');
    else b += ghost(bx + bw * 0.28, by + bh / 2 - 1, bw * 0.44, 2, '#8A8A8A');
    return wrap(c, b);
  };

  /* ---- Karte (Landkarte) ------------------------------------------------- */
  S.map = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var norm = [[0.08, 0.46], [0.17, 0.22], [0.33, 0.13], [0.49, 0.22], [0.62, 0.10],
                [0.81, 0.19], [0.93, 0.41], [0.86, 0.67], [0.69, 0.87], [0.49, 0.92],
                [0.29, 0.83], [0.13, 0.67]];
    var pts = [], i;
    for (i = 0; i < norm.length; i++) pts.push([P.x + P.w * norm[i][0], P.y + P.h * norm[i][1]]);
    b += polygonEl(pts, '#EDEDED', PY, 1);
    var dots = c.small ? 3 : 6;
    for (i = 0; i < dots; i++) {
      var dx = P.x + P.w * (0.24 + c.rnd() * 0.52);
      var dy = P.y + P.h * (0.26 + c.rnd() * 0.48);
      b += circ(dx, dy, c.small ? 1.6 : 2.4 + c.rnd() * 1.6, AC);
    }
    return wrap(c, b);
  };

  /* ---- Kreisdiagramm ------------------------------------------------------ */
  S.pie = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var r = Math.max(4, Math.min(P.w, P.h) / 2 - 1);
    var cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    var fr = c.small ? [0.45, 0.3, 0.25] : [0.38, 0.27, 0.2, 0.15];
    var cols = [AC, G2, PY, G3];
    var a0 = -Math.PI / 2, i;
    for (i = 0; i < fr.length; i++) {
      var a1 = a0 + fr[i] * Math.PI * 2;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var lrg = (a1 - a0) > Math.PI ? 1 : 0;
      b += pathEl('M' + n(cx) + ' ' + n(cy) + ' L' + n(x0) + ' ' + n(y0) +
                  ' A' + n(r) + ' ' + n(r) + ' 0 ' + lrg + ' 1 ' + n(x1) + ' ' + n(y1) + ' Z',
                  cols[i % cols.length], '#FFFFFF', 1);
      a0 = a1;
    }
    return wrap(c, b);
  };

  /* ---- Treemap ------------------------------------------------------------ */
  S.treemap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var g = 1.2;
    var lw = P.w * 0.52;
    b += rect(P.x, P.y, lw - g, P.h, AC);
    var rx = P.x + lw, rw2 = P.w - lw;
    if (c.small) {
      b += rect(rx, P.y, rw2, P.h * 0.55 - g, G2);
      b += rect(rx, P.y + P.h * 0.55, rw2, P.h * 0.45, G3);
    } else {
      b += rect(rx, P.y, rw2, P.h * 0.48 - g, G2);
      b += rect(rx, P.y + P.h * 0.48, rw2 * 0.55 - g, P.h * 0.52, PY);
      b += rect(rx + rw2 * 0.55, P.y + P.h * 0.48, rw2 * 0.45, P.h * 0.3 - g, G3);
      b += rect(rx + rw2 * 0.55, P.y + P.h * 0.78, rw2 * 0.45, P.h * 0.22, '#E0E0E0');
    }
    if (c.lab) b += txt(P.x + 4, P.y + c.fs + 2, 'Nord', c.fs, '#FFFFFF', 'start');
    return wrap(c, b);
  };

  /* ---- Zerlegungsbaum ------------------------------------------------------ */
  S.decomp = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var lvls = c.small ? 2 : 3;
    var cw = P.w / lvls, i, j;
    var counts = c.small ? [1, 2] : [1, 3, 3];
    for (i = 0; i < lvls; i++) {
      var cnt = counts[i], step = P.h / cnt;
      var bw = cw * 0.76, bh = Math.min(step * 0.62, 20);
      for (j = 0; j < cnt; j++) {
        var x = P.x + cw * i, y = P.y + step * j + (step - bh) / 2;
        b += rrect(x, y, bw, bh, 2, PLF, i === 0 ? AC : PY, 1);
        b += rect(x + 3, y + bh * 0.6, Math.max(1, bw * (0.25 + c.rnd() * 0.5)), Math.max(1.2, bh * 0.18), i === 0 ? AC : PY);
        if (c.lab && bh >= 14) b += txt(x + 3, y + bh * 0.42, i === 0 ? 'Summe' : CAT[(i + j) % CAT.length], c.fs, TXT, 'start');
        if (i > 0) {
          var pStep = P.h / counts[i - 1], pBh = Math.min(pStep * 0.62, 20);
          var pIdx = Math.min(counts[i - 1] - 1, 0);
          var px = P.x + cw * (i - 1) + bw, py = P.y + pStep * pIdx + pStep / 2;
          b += ln(px, py, x, y + bh / 2, GRID, 1);
        }
      }
    }
    return wrap(c, b);
  };

  /* ---- Tacho --------------------------------------------------------------- */
  S.gauge = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var showV = (!c.small && P.h >= 44);
    var labH = showV ? c.fs + 8 : 0;
    var H = Math.max(6, P.h - labH);
    // Halbkreis samt Strichstärke in die Fläche einpassen, dann vertikal zentrieren.
    var r = Math.max(4, Math.min(P.w / 2.3, H / 1.2));
    var th = clamp(r * 0.2, 2.2, 22);
    var cx = P.x + P.w / 2;
    var cy = P.y + (H - (r + th)) / 2 + th / 2 + r;
    function arc(frac, col) {
      var a0 = Math.PI, a1 = Math.PI + frac * Math.PI;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      // frac zählt Halbkreise: der Bogen ist nie länger als 180°, also large-arc = 0.
      return '<path d="M' + n(x0) + ' ' + n(y0) + ' A' + n(r) + ' ' + n(r) + ' 0 0 1 ' +
             n(x1) + ' ' + n(y1) +
             '" fill="none" stroke="' + col + '" stroke-width="' + n(th) + '" stroke-linecap="butt"/>';
    }
    var v = 0.68;
    b += arc(1, GRID);
    b += arc(v, AC);
    var na = Math.PI + v * Math.PI;
    b += ln(cx, cy, cx + r * 0.86 * Math.cos(na), cy + r * 0.86 * Math.sin(na), AXIS, 1.4);
    var pr = Math.max(1.2, r * 0.07);
    b += circ(cx, cy, pr, AXIS);
    // Wert unter den Drehpunkt, mit Abstand zum Punkt.
    if (showV) b += txt(cx, Math.min(P.y + P.h, cy + pr + c.fs * 0.95), '68 %', Math.min(10, c.fs + 1), AC, 'middle', '600');
    return wrap(c, b);
  };

  /* ---- Flächendiagramm ------------------------------------------------------ */
  S.area = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : (c.dense ? 16 : 11);
    var v = vals(c, cnt, 64, 36);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(v) * 1.2, s = sc(0, mx, P.y + P.h, P.y);
    var step = P.w / Math.max(1, cnt - 1), pts = [], i;
    for (i = 0; i < cnt; i++) pts.push([P.x + step * i, s(v[i])]);
    var poly = pts.concat([[P.x + P.w, P.y + P.h], [P.x, P.y + P.h]]);
    b += polygonEl(poly, '#D9D9D9');
    b += polyline(pts, AC, c.small ? 1.2 : 1.6);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1);
    return wrap(c, b);
  };

  /* ---- Deneb / Vega-Platzhalter --------------------------------------------- */
  S.deneb = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rrect(P.x, P.y, P.w, P.h, 3, '#FFFFFF', PY, 1);
    var fs = clamp(Math.min(P.h * 0.4, P.w * 0.3), 10, 24);
    b += txt(P.x + P.w / 2, P.y + P.h / 2 + fs * 0.34, '{ }', fs, AC, 'middle', '600');
    if (!c.small && P.h >= 52) b += txt(P.x + P.w / 2, P.y + P.h - 3, 'Vega-Spec', Math.min(9, c.fs), TXT, 'middle');
    return wrap(c, b);
  };

  /* ---- Fallback -------------------------------------------------------------- */
  S.generic = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rect(P.x, P.y, P.w, P.h, '#FFFFFF', PY, 1);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y, PY, 1);
    return wrap(c, b);
  };

  /* ====================================================================== */
  /*  Dispatcher                                                            */
  /* ====================================================================== */

  root.MK_SKETCHES = S;

  root.MK_SKETCH = function (kind, w, h, o) {
    var fn = (typeof kind === 'string' && Object.prototype.hasOwnProperty.call(S, kind))
      ? S[kind] : S.generic;
    var out;
    try {
      out = fn(w, h, o);
    } catch (e) {
      out = null;
    }
    if (typeof out !== 'string' || out.indexOf('<svg') !== 0) {
      try { out = S.generic(w, h, o); } catch (e2) { out = ''; }
    }
    return out;
  };

  // Liste aller Schlüssel — praktisch für Kataloge und Tests.
  root.MK_SKETCH_KEYS = (function () {
    var k = [], key;
    for (key in S) if (Object.prototype.hasOwnProperty.call(S, key)) k.push(key);
    return k;
  })();

}(typeof window !== 'undefined' ? window : this));
