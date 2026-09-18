/* ==========================================================================
   MockupKitchen · Mini-Chart-Skizzen im IBCS-Look
   --------------------------------------------------------------------------
   Eigenständig: kein Modulsystem, keine Abhängigkeiten, reines Browser-JS.

     window.MK_SKETCHES[kind](w, h, o)  ->  SVG-String
     window.MK_SKETCH(kind, w, h, o)    ->  Dispatcher, Fallback 'generic'

   o = { scenario:'AC/PY'|'AC/PL'|'AC/PL/FC'|'AC',
         variance:{abs:Boolean, rel:Boolean},
         seed:Number, dense:Boolean, scale:Number,
         label:String (nur kpi/card: '' = keine Beschriftung) }

   Grundsätze:
   - Dummy-Daten stammen aus einem Seed-PRNG (mulberry32), damit dieselbe
     Kachel bei jedem Re-Render identisch aussieht.
   - Alle Zahlen laufen durch n(): niemals NaN/Infinity im Output.
   - Unter 120 px Breite oder 50 px Höhe wird eine reduzierte Variante
     gezeichnet (weniger Kategorien, keine Beschriftung).
   - Nur Graustufen plus die beiden Abweichungsfarben. Kein Chart-Junk.

   Skalierung (o.scale, Default 1):
   - Das Tool übergibt canvas.width/1280 — also 1 bei HD, 1,5 bei Full HD,
     3 bei Ultra HD.
   - Gezeichnet wird immer im Entwurfsraum w/scale × h/scale; wrap() legt ein
     <g transform="scale(s)"> um das Ergebnis. Damit wachsen Schriftgrößen,
     Strichstärken, Marker-Radien, Pin-Längen, Innenränder und Mindestabstände
     zentral mit, und die small/tiny-Schwellen greifen erst bei
     w < 120·scale bzw. h < 50·scale. Der viewBox bleibt "0 0 w h".
   - Einzelne Zeichenfunktionen rechnen deshalb NICHT mit c.k — sie arbeiten
     unverändert in Entwurfseinheiten.

   Szenario-Notation (wie im ChartKitchen-Visual):
     AC dunkel gefüllt · PY grau gefüllt · PL weiß mit dunkler Kontur,
     versetzt hinter AC · FC schraffiert mit Kontur.
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
  var SUB  = '#9A9A9A';   // Ebenen-/Legendenbeschriftung
  var GRID = '#E5E5E5';   // helle Hilfslinien (nur Tabelle/Heatmap/Raster)
  var HAIR = '#BDBDBD';   // Verbinder, Forecast-Trenner
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
  // Vorzeichenbehafteter Δ-Wert, z. B. "+12" / "-8"
  function dlbl(v) { return (n(v) >= 0 ? '+' : '') + lbl(v, 0); }

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
  // halo = weiße Kontur hinter der Schrift, damit Werte über Konturen und
  // Schraffuren lesbar bleiben (wie die Halo-Labels im ChartKitchen-Visual).
  function txt(x, y, s, size, fill, anchor, weight, halo) {
    var fz = n(size || 8);
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + fz +
           '" fill="' + (fill || TXT) + '"' +
           (anchor ? ' text-anchor="' + anchor + '"' : '') +
           (weight ? ' font-weight="' + weight + '"' : '') +
           (halo ? ' stroke="#FFFFFF" stroke-width="' + n(Math.max(1.4, fz * 0.3)) +
                   '" stroke-linejoin="round" paint-order="stroke"' : '') +
           '>' + esc(s) + '</text>';
  }
  // Textplatzhalter (graue Balken) — wo echte Schrift zu klein wäre.
  function ghost(x, y, w, h, fill) { return rect(x, y, w, h || 2, fill || '#D4D4D4'); }

  /* ------------------------------------------------------------- Kontext */

  /* ctx() ist die einzige Stelle, an der o.scale ausgewertet wird.
     Gezeichnet wird im Entwurfsraum W0/k × H0/k, wrap() skaliert das Ergebnis
     per <g transform="scale(k)"> auf die Kachelgröße zurück. Dadurch wachsen
     Schriftgrößen, Strichstärken, Marker-Radien, Pin-Längen, Innenränder und
     Mindestabstände einheitlich mit — und die small/tiny-Schwellen greifen
     automatisch erst bei w < 120·k bzw. h < 50·k.                           */
  function ctx(w, h, o) {
    o = o || {};
    var W0 = Math.max(16, n(w) || 100);
    var H0 = Math.max(12, n(h) || 50);
    var k = +o.scale;
    if (!isFinite(k) || k <= 0) k = 1;
    // Nie so weit hochskalieren, dass der Entwurfsraum unter die Mindestmaße fällt.
    k = Math.min(k, W0 / 16, H0 / 12, 16);
    if (!(k > 0.1)) k = 0.1;
    k = Math.round(k * 1000) / 1000;
    var W = Math.floor(W0 / k * 100) / 100;
    var H = Math.floor(H0 / k * 100) / 100;
    var v = o.variance || {};
    var pad = 4;
    var c = {
      w: W, h: H, pad: pad,
      k: k, ow: W0, oh: H0,                // Ausgabemaße, nur für wrap()
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
    var g = c.k === 1 ? body : '<g transform="scale(' + c.k + ')">' + body + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + c.ow + ' ' + c.oh +
           '" width="100%" height="100%" font-family="' + FONT + '">' + g + '</svg>';
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

  // Schraffur-Definition für Forecast (Raster wie im ChartKitchen-Visual).
  function hatch() {
    var id = 'mkfc' + (++uid);
    return {
      id: id,
      defs: '<defs><pattern id="' + id + '" width="4" height="4" patternUnits="userSpaceOnUse" ' +
            'patternTransform="rotate(45 0 0)"><rect width="4" height="4" fill="#FFFFFF"/>' +
            '<line x1="0" y1="0" x2="0" y2="4" stroke="' + AC + '" stroke-width="1.4"/></pattern></defs>'
    };
  }
  function fcFill(hh, px) { return (hh && n(px) >= 5) ? 'url(#' + hh.id + ')' : FCC; }

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

  // Ebenen-Überschrift ("ΔPL", "ΔPL %") — im Visual steht sie über der Ebene.
  function layerCap(c, x, y, s) {
    return c.lab ? txt(x, y, s, c.fs, SUB, 'start') : '';
  }

  // Szenario-Legende mit Mini-Swatches, oben links — nur wenn Platz ist.
  function scenLegend(c, x, y, kind, hh) {
    if (!c.lab || c.w < 250) return '';
    var items = ['AC'], b = '', cx = x, sw = n(c.fs * 0.78), i, key, sy;
    if (kind) items.push(kind);
    if (hasFC(c)) items.push('FC');
    for (i = 0; i < items.length; i++) {
      key = items[i]; sy = y - sw;
      if (key === 'AC') b += rect(cx, sy, sw, sw, AC);
      else if (key === 'PY') b += rect(cx, sy, sw, sw, PY);
      else if (key === 'FC') b += rect(cx, sy, sw, sw, fcFill(hh, sw), AC, 0.7);
      else b += rect(cx, sy, sw, sw, PLF, PLS, 0.9);
      cx += sw + 1.8;
      b += txt(cx, y, key, c.fs, SUB, 'start');
      cx += key.length * c.fs * 0.62 + 5;
    }
    return b;
  }

  // Szenario-Marke: kleines Dreieck, Spitze auf dem Referenzwert (UN 4.1).
  function triDown(x, y, size) {
    var s2 = Math.max(1.2, n(size));
    return polygonEl([[x, y], [x - s2 * 0.62, y - s2], [x + s2 * 0.62, y - s2]], PY);
  }

  // Gestrichelte Trennlinie zwischen Ist- und Forecast-Bereich.
  function fcSplit(c, sl, yA, yB) {
    if (!hasFC(c) || sl.length < 2) return '';
    var at = fcStart(c, sl.length);
    if (at < 1 || at > sl.length - 1) return '';
    var x = n((sl[at - 1].cx + sl[at].cx) / 2);
    return ln(x, yA, x, yB, HAIR, 0.8, '2 2');
  }

  /* Δ-absolut: schmale Säulen um eine eigene Nulllinie, Labels mit Vorzeichen.
     Der Labelrand wird über die Skala reserviert — so läuft nie etwas heraus. */
  function deltaCols(c, d, sl, y, h, hh, opt) {
    opt = opt || {};
    var showLbl = opt.labels !== false && c.lab &&
                  sl.length && sl[0].w >= c.fs * 1.7 && h >= c.fs * 3.6;
    var lh = showLbl ? c.fs * 1.45 : c.fs * 0.15;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, y + h - lh, y + lh), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    b += ln(sl[0].x - 1, zero, sl[sl.length - 1].x + sl[sl.length - 1].w + 1, zero, AXIS, 1);
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = d[i] >= 0 ? GOOD : BAD, isFC = (i + 1) >= fcAt;
      var top = Math.min(zero, yy), hgt = Math.max(0.9, Math.abs(zero - yy));
      b += isFC ? rect(sl[i].x, top, sl[i].w, hgt, fcFill(hh, sl[i].w), col, 0.8)
                : rect(sl[i].x, top, sl[i].w, hgt, col);
      if (showLbl) {
        b += txt(sl[i].cx, d[i] >= 0 ? top - c.fs * 0.42 : top + hgt + c.fs * 0.95,
                 dlbl(d[i]), c.fs, col, 'middle');
      }
    }
    return b;
  }

  // Δ-Prozent: Pins mit Kopf um eine eigene Nulllinie (FC = offener Kopf).
  function deltaPins(c, d, sl, y, h, hh, opt) {
    opt = opt || {};
    var showLbl = opt.labels !== false && c.lab &&
                  sl.length && sl[0].step >= c.fs * 3.2 && h >= c.fs * 3.9;
    var lh = showLbl ? c.fs * 1.75 : c.fs * 0.4;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, y + h - lh, y + lh), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    var r = clamp(sl[0].w * 0.18, 1.1, 2.6);
    b += ln(sl[0].cx - sl[0].w * 0.6, zero,
            sl[sl.length - 1].cx + sl[sl.length - 1].w * 0.6, zero, AXIS, 1);
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = d[i] >= 0 ? GOOD : BAD, isFC = (i + 1) >= fcAt;
      b += ln(sl[i].cx, zero, sl[i].cx, yy, col, 1.3);
      b += isFC ? circ(sl[i].cx, yy, r, '#FFFFFF', col, 1) : circ(sl[i].cx, yy, r, col);
      if (showLbl) {
        b += txt(sl[i].cx, d[i] >= 0 ? yy - r - c.fs * 0.4 : yy + r + c.fs * 0.95,
                 plbl(d[i]), c.fs, col, 'middle');
      }
    }
    return b;
  }

  // Horizontale Δ-Balken (für Balken-Kombis), Labels am Balkenende.
  function deltaBarsH(c, d, rows, x, w, hh, opt) {
    opt = opt || {};
    var showLbl = opt.labels !== false && c.lab && w >= c.fs * 9 && rows[0].h >= c.fs * 0.85;
    var lw = showLbl ? Math.min(c.fs * 2.9, w * 0.28) : 0;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, x + lw, x + w - lw), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    b += ln(zero, rows[0].y - 1, zero, rows[rows.length - 1].y + rows[rows.length - 1].h + 1, AXIS, 1);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = d[i] >= 0 ? GOOD : BAD, isFC = (i + 1) >= fcAt;
      var bx = Math.min(zero, xx), bw = Math.max(0.9, Math.abs(xx - zero));
      b += isFC ? rect(bx, rows[i].y, bw, rows[i].h, fcFill(hh, bw), col, 0.8)
                : rect(bx, rows[i].y, bw, rows[i].h, col);
      if (showLbl) {
        b += txt(d[i] >= 0 ? xx + 2.2 : xx - 2.2, rows[i].cy + c.fs * 0.34,
                 dlbl(d[i]), c.fs, col, d[i] >= 0 ? 'start' : 'end');
      }
    }
    return b;
  }

  // Horizontale Δ%-Pins mit Kopf und optionalem Label.
  function deltaPinsH(c, d, rows, x, w, opt) {
    opt = opt || {};
    var showLbl = opt.labels !== false && c.lab && w >= c.fs * 10 && rows[0].step >= c.fs * 1.2;
    var lw = showLbl ? Math.min(c.fs * 3.2, w * 0.3) : 0;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, x + lw, x + w - lw), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    var r = clamp(rows[0].h * 0.24, 1.1, 2.6);
    b += ln(zero, rows[0].y - 1, zero, rows[rows.length - 1].y + rows[rows.length - 1].h + 1, AXIS, 1);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = d[i] >= 0 ? GOOD : BAD, cy = rows[i].cy, isFC = (i + 1) >= fcAt;
      b += ln(zero, cy, xx, cy, col, 1.3);
      b += isFC ? circ(xx, cy, r, '#FFFFFF', col, 1) : circ(xx, cy, r, col);
      if (showLbl) {
        b += txt(d[i] >= 0 ? xx + r + 1.8 : xx - r - 1.8, cy + c.fs * 0.34,
                 plbl(d[i]), c.fs, col, d[i] >= 0 ? 'start' : 'end');
      }
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

  /* Säulenblock AC gegen Referenz — Geometrie wie im ChartKitchen-Visual:
     AC und PL je 0,42·Slot breit, um 0,115·Slot versetzt (überlappende
     Gruppierung), PY breit und zentriert dahinter, FC schraffiert.
     `sl` kommt von slots(..., 0.55), damit die Δ-Ebenen exakt darüberliegen. */
  function colBlock(c, P, ac, rf, kind, hh, sl, opt) {
    opt = opt || {};
    var cnt = ac.length, i;
    var step = sl.length ? sl[0].step : P.w;
    var off = !!rf && kind === 'PL';
    var pw  = off ? step * 0.42 : (rf && kind ? step * 0.44 : step * 0.6);
    var rw  = off ? step * 0.42 : step * 0.66;
    var dx  = off ? step * 0.115 : 0;
    var showLbl = opt.labels !== false && c.lab &&
                  step >= c.fs * 2.6 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0) * 1.04;
    var s = sc(0, mx, P.y + P.h, P.y + lh);
    var fcAt = fcStart(c, cnt), b = '';
    for (i = 0; i < cnt; i++) {
      var cxR = sl[i].cx - dx, cxP = sl[i].cx + dx;
      if (rf && kind) {
        var yR = s(rf[i]);
        b += refShape(cxR - rw / 2, yR, rw, Math.max(0.9, P.y + P.h - yR), kind, hh);
      }
      var isFC = (i + 1) >= fcAt, yT = s(ac[i]);
      b += isFC
        ? rect(cxP - pw / 2, yT, pw, Math.max(0.9, P.y + P.h - yT), fcFill(hh, pw), AC, 0.8)
        : rect(cxP - pw / 2, yT, pw, Math.max(0.9, P.y + P.h - yT), AC);
      if (showLbl) {
        // Halo, wenn die Referenzsäule über dem Wertelabel liegt.
        var ovl = !!rf && !!kind && rf[i] > ac[i];
        b += txt(cxP, yT - c.fs * 0.42, lbl(ac[i], 0), c.fs, isFC ? TXT : AC, 'middle', null, ovl);
      }
    }
    b += fcSplit(c, sl, P.y, P.y + P.h);
    if (opt.baseline !== false) b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1.2);
    return { body: b, slots: sl, scale: s };
  }

  // Kategorie-Beschriftung unter einer Säulenreihe (bleibt im viewBox).
  function monLabels(c, sl, y, names) {
    if (!c.lab) return '';
    var b = '', i, nm = names || MON, t, tw, cx;
    for (i = 0; i < sl.length; i++) {
      if (sl[i].step < c.fs * 2.3) continue;
      t = nm[i % nm.length];
      tw = String(t).length * c.fs * 0.6;
      cx = sl[i].cx;
      if (c.x1 - c.x0 > tw) cx = clamp(cx, c.x0 + tw / 2, c.x1 - tw / 2);
      b += txt(cx, y, t, c.fs, TXT, 'middle');
    }
    return b;
  }

  /* ====================================================================== */
  /*  Skizzen                                                               */
  /* ====================================================================== */

  var S = {};

  /* ---- 1 · Säulen: AC gegen Referenz, Δ-Ebene darüber ------------------ */
  S.columns = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c);
    var ac = vals(c, cnt, 72, 46), rf = kind ? derive(c, ac, 0.78, 1.22) : null;
    var labH = c.lab ? c.fs + 4 : 0;
    var legH = (c.lab && c.w >= 250 && c.h >= 120) ? c.fs + 4 : 0;
    // Δ-Ebene: absolut, sonst relativ — je nachdem, was eingeschaltet ist.
    var dMode = c.vAbs ? 'abs' : (c.vRel ? 'rel' : null);
    var withDelta = (!c.small && c.h >= 118 && dMode && !!kind);
    var yTop = c.y0 + legH, hAvail = Math.max(8, c.ih - legH - labH);
    var sl = slots(c.x0, c.iw, cnt, 0.55), P;
    if (legH) b += scenLegend(c, c.x0, c.y0 + c.fs, kind, hh);
    if (withDelta) {
      var capH = c.lab ? c.fs + 1 : 0;
      var bd = bands(yTop, hAvail, [34, 66], c.fs * 0.8);
      var dy0 = bd[0].y + capH, dh0 = Math.max(6, bd[0].h - capH);
      b += layerCap(c, c.x0, bd[0].y + c.fs - 1, 'Δ' + kind + (dMode === 'rel' ? ' %' : ''));
      b += dMode === 'abs'
        ? deltaCols(c, diffs(ac, rf), sl, dy0, dh0, hh)
        : deltaPins(c, rels(ac, rf), sl, dy0, dh0, hh);
      P = { x: c.x0, y: bd[1].y, w: c.iw, h: bd[1].h };
    } else {
      P = { x: c.x0, y: yTop, w: c.iw, h: hAvail };
    }
    b += colBlock(c, P, ac, rf, kind, hh, sl).body;
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 2 · Säulen plus Linie (zweite Kennzahl) ------------------------- */
  S.colline = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var kind = refKind(c);
    var ac = vals(c, cnt, 68, 40), rf = kind ? derive(c, ac, 0.8, 1.2) : null;
    var topH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: topH });
    var sl = slots(P.x, P.w, cnt, 0.55), i;
    b += colBlock(c, P, ac, rf, kind, hh, sl, { labels: false }).body;
    // Zweite Kennzahl als dünne Linie mit offenen Punkten (eigene Skala).
    var q = [], pts = [];
    for (i = 0; i < cnt; i++) q.push(n(0.34 + c.rnd() * 0.46 + i * 0.015));
    var s2 = sc(0.2, 1.05, P.y + P.h, P.y + P.h * 0.1);
    for (i = 0; i < cnt; i++) pts.push([sl[i].cx, s2(q[i])]);
    b += polyline(pts, AC, c.small ? 1.2 : 1.7);
    if (!c.small) for (i = 0; i < pts.length; i++) b += circ(pts[i][0], pts[i][1], 1.9, '#FFFFFF', AC, 1.1);
    if (c.lab) b += txt(P.x, c.y0 + c.fs - 1, 'Marge %', c.fs, SUB, 'start');
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 3 · Kombi: Δ% · Δabs · Säulen in drei Ebenen -------------------- */
  S.kombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c) || 'PL';
    var ac = vals(c, cnt, 72, 44), rf = derive(c, ac, 0.8, 1.2);
    var labH = c.lab ? c.fs + 4 : 0;
    var sl = slots(c.x0, c.iw, cnt, 0.55);
    if (c.small) {
      var bs = bands(c.y0, c.ih - labH, [34, 66], 2);
      b += deltaCols(c, diffs(ac, rf), sl, bs[0].y, bs[0].h, hh, { labels: false });
      b += colBlock(c, { x: c.x0, y: bs[1].y, w: c.iw, h: bs[1].h }, ac, rf, kind, hh, sl).body;
      return wrap(c, b);
    }
    var parts = [], keys = [], capH = c.lab ? c.fs + 1 : 0, i;
    if (c.vRel) { parts.push(25); keys.push('rel'); }
    if (c.vAbs) { parts.push(25); keys.push('abs'); }
    parts.push(50); keys.push('col');
    var bd = bands(c.y0, c.ih - labH, parts, c.fs * 0.7);
    for (i = 0; i < keys.length; i++) {
      var y = bd[i].y + capH, bandH = Math.max(6, bd[i].h - capH);
      if (keys[i] === 'rel') {
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind + ' %');
        b += deltaPins(c, rels(ac, rf), sl, y, bandH, hh);
      } else if (keys[i] === 'abs') {
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind);
        b += deltaCols(c, diffs(ac, rf), sl, y, bandH, hh);
      } else {
        b += colBlock(c, { x: c.x0, y: bd[i].y, w: c.iw, h: bd[i].h }, ac, rf, kind, hh, sl).body;
        b += monLabels(c, sl, c.y1 - 0.5);
      }
    }
    return wrap(c, b);
  };

  /* ---- 4 · Nur Δ-absolut-Säulen ---------------------------------------- */
  S.absvar = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var kind = refKind(c) || 'PL';
    var d = [], i;
    for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 60));
    var capH = c.lab ? c.fs + 2 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.55);
    b += layerCap(c, c.x0, c.y0 + c.fs - 1, 'Δ' + kind);
    b += deltaCols(c, d, sl, P.y, P.h, hh);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 5 · Nur Δ%-Pins -------------------------------------------------- */
  S.relvar = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var kind = refKind(c) || 'PL';
    var d = [], i;
    for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 34));
    var capH = c.lab ? c.fs + 2 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.55);
    b += layerCap(c, c.x0, c.y0 + c.fs - 1, 'Δ' + kind + ' %');
    b += deltaPins(c, d, sl, P.y, P.h, hh);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 6 · Linien AC / Referenz, Forecast gestrichelt ------------------ */
  S.line = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : (c.dense ? 16 : 11);
    var kind = refKind(c);
    var ac = vals(c, cnt, 70, 34), rf = kind ? derive(c, ac, 0.72, 1.06) : null;
    // Szenario-Notation wie im Visual: AC kräftig, PY grau, PL dünn mit
    // offenen Punkten, Forecast gestrichelt; Codes am letzten Punkt.
    var refDark = (kind === 'PY') ? PY : AC;
    var rightW = c.lab ? c.fs * 4.2 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: c.lab ? c.fs * 0.6 : 0, right: rightW });
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0) * 1.14;
    var s = sc(0, mx, P.y + P.h, P.y);
    var step = P.w / Math.max(1, cnt - 1), pa = [], pr = [], sl = [], i;
    for (i = 0; i < cnt; i++) {
      pa.push([P.x + step * i, s(ac[i])]);
      if (rf) pr.push([P.x + step * i, s(rf[i])]);
      sl.push({ cx: n(P.x + step * i), step: n(step), w: n(step) });
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1.2);
    if (rf) b += polyline(pr, refDark, kind === 'PY' ? (c.small ? 1.2 : 1.7) : (c.small ? 0.9 : 1.2));
    var fcAt = fcStart(c, cnt);
    if (hasFC(c) && fcAt >= 1 && fcAt < cnt) {
      b += polyline(pa.slice(0, fcAt), AC, c.small ? 1.4 : 2);
      b += polyline(pa.slice(fcAt - 1), AC, c.small ? 1.2 : 1.6, '3 2');
      b += ln(pa[fcAt - 1][0], P.y, pa[fcAt - 1][0], P.y + P.h, HAIR, 0.8, '2 2');
    } else {
      b += polyline(pa, AC, c.small ? 1.4 : 2);
    }
    if (!c.small) {
      b += circ(pa[cnt - 1][0], pa[cnt - 1][1], 2.2, AC);
      if (rf) {
        b += kind === 'PY'
          ? circ(pr[cnt - 1][0], pr[cnt - 1][1], 2.2, PY)
          : circ(pr[cnt - 1][0], pr[cnt - 1][1], 2.2, '#FFFFFF', AC, 1.1);
      }
    }
    if (c.lab) {
      b += txt(pa[cnt - 1][0] + 3.4, pa[cnt - 1][1] + c.fs * 0.34, lbl(ac[cnt - 1], 0) + ' AC', c.fs, AC, 'start');
      if (rf) b += txt(pr[cnt - 1][0] + 3.4, pr[cnt - 1][1] + c.fs * 0.34, lbl(rf[cnt - 1], 0) + ' ' + kind, c.fs, kind === 'PY' ? TXT : AC, 'start');
    }
    b += monLabels(c, sl, c.y1 - 0.5);
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
    var mx = maxOf(ac) * 1.62, s = sc(0, mx, P.y + P.h, P.y);   // Kopfraum für den Korridor
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
    var tot = [], parts = [], i, j;
    for (i = 0; i < cnt; i++) {
      var row = [], t = 0;
      for (j = 0; j < segs; j++) { var v = n(18 + c.rnd() * 26); row.push(v); t += v; }
      parts.push(row); tot.push(n(t));
    }
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0 });
    var sl = slots(P.x, P.w, cnt, 0.34);
    var showLbl = c.lab && sl[0].w >= c.fs * 2.2 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    var mx = maxOf(tot) * 1.04, s = sc(0, mx, P.y + P.h, P.y + lh);
    for (i = 0; i < cnt; i++) {
      var acc = 0;
      for (j = 0; j < segs; j++) {
        var y1 = s(acc), y2 = s(acc + parts[i][j]);
        b += rect(sl[i].x, y2, sl[i].w, Math.max(0.9, y1 - y2), cols[j % cols.length]);
        if (j) b += ln(sl[i].x, y1, sl[i].x + sl[i].w, y1, '#FFFFFF', 0.7);
        acc += parts[i][j];
      }
      if (showLbl) b += txt(sl[i].cx, s(tot[i]) - c.fs * 0.42, lbl(tot[i], 0), c.fs, AC, 'middle');
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, AXIS, 1.2);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 11 · Wasserfall, vertikal: Σ · Δ-Schritte · Σ ------------------- */
  S.waterfall = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : (c.dense ? 6 : 4), cnt = mids + 2;
    var start = 70, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.4) * 34));
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0 });
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var sl = slots(P.x, P.w, cnt, 0.3);
    var showLbl = c.lab && sl[0].w >= c.fs * 1.9 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.2;
    var s = sc(low, Math.max(peak, start, end) * 1.04, P.y + P.h, P.y + lh);
    var zero = s(0), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, zero - s(start)), AC);
    if (showLbl) b += txt(sl[0].cx, s(start) - c.fs * 0.42, lbl(start, 0), c.fs, AC, 'middle', '600');
    for (i = 0; i < mids; i++) {
      var from = cur, to = n(cur + steps[i]);
      var yTop = s(Math.max(from, to)), yBot = s(Math.min(from, to));
      b += ln(sl[i].x + sl[i].w, s(from), sl[i + 1].x, s(from), HAIR, 0.9);
      b += rect(sl[i + 1].x, yTop, sl[i + 1].w, Math.max(0.9, yBot - yTop), steps[i] >= 0 ? GOOD : BAD);
      if (showLbl) b += txt(sl[i + 1].cx, yTop - c.fs * 0.42, dlbl(steps[i]), c.fs, steps[i] >= 0 ? GOOD : BAD, 'middle');
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), HAIR, 0.9);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, zero - s(end)), AC);
    if (showLbl) b += txt(sl[cnt - 1].cx, s(end) - c.fs * 0.42, lbl(end, 0), c.fs, AC, 'middle', '600');
    b += ln(P.x, zero, P.x + P.w, zero, AXIS, 1.2);
    if (c.lab) {
      var nm = ['Σ'];
      for (i = 0; i < mids; i++) nm.push(CAT[i % CAT.length]);
      nm.push('Σ');
      b += monLabels(c, sl, c.y1 - 0.5, nm);
    }
    return wrap(c, b);
  };

  /* ---- 12 · Brücke: Σ PY -> Δ-Schritte -> Σ AC ------------------------- */
  S.bridge = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : (c.dense ? 6 : 4), cnt = mids + 2;
    var start = 68, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 30));
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0 });
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var sl = slots(P.x, P.w, cnt, 0.3);
    var showLbl = c.lab && sl[0].w >= c.fs * 1.9 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.2;
    var s = sc(low, Math.max(peak, start, end) * 1.04, P.y + P.h, P.y + lh);
    var zero = s(0), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, zero - s(start)), PY);
    if (showLbl) b += txt(sl[0].cx, s(start) - c.fs * 0.42, lbl(start, 0), c.fs, TXT, 'middle', '600');
    for (i = 0; i < mids; i++) {
      var to = n(cur + steps[i]);
      var yTop = s(Math.max(cur, to)), yBot = s(Math.min(cur, to));
      b += ln(sl[i].x + sl[i].w, s(cur), sl[i + 1].x, s(cur), HAIR, 0.9);
      b += rect(sl[i + 1].x, yTop, sl[i + 1].w, Math.max(0.9, yBot - yTop), steps[i] >= 0 ? GOOD : BAD);
      if (showLbl) b += txt(sl[i + 1].cx, yTop - c.fs * 0.42, dlbl(steps[i]), c.fs, steps[i] >= 0 ? GOOD : BAD, 'middle');
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), HAIR, 0.9);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, zero - s(end)), AC);
    if (showLbl) b += txt(sl[cnt - 1].cx, s(end) - c.fs * 0.42, lbl(end, 0), c.fs, AC, 'middle', '600');
    b += ln(P.x, zero, P.x + P.w, zero, AXIS, 1.2);
    if (c.lab) {
      var nm2 = ['PY'];
      for (i = 0; i < mids; i++) nm2.push(CAT[i % CAT.length]);
      nm2.push('AC');
      b += monLabels(c, sl, c.y1 - 0.5, nm2);
    }
    return wrap(c, b);
  };

  /* ---- 13 · Integrierte Varianzanalyse: Δ% YTD · Δ% · Δ-Brücke · Säulen - */
  S.varint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c) || 'PL';
    var ac = vals(c, cnt, 74, 40), pl = derive(c, ac, 0.82, 1.18);
    var dAbs = diffs(ac, pl), dRel = rels(ac, pl);
    var ytd = [], run = 0, i;
    for (i = 0; i < cnt; i++) { run = n(run * 0.6 + dRel[i] * 0.5); ytd.push(run); }
    var labH = c.lab ? c.fs + 4 : 0;
    if (c.small) {
      var bs = bands(c.y0, c.ih - labH, [36, 64], 2);
      var slS = slots(c.x0, c.iw, cnt, 0.55);
      b += deltaPins(c, dRel, slS, bs[0].y, bs[0].h, hh, { labels: false });
      b += colBlock(c, { x: c.x0, y: bs[1].y, w: c.iw, h: bs[1].h }, ac, pl, kind, hh, slS).body;
      return wrap(c, b);
    }
    // Σ-Gesamtsäule rechts: Ist gefüllt, Forecast schraffiert darüber.
    var totW = (c.lab && c.w >= 300) ? Math.min(34, c.iw * 0.12) : 0;
    var plotW = c.iw - (totW ? totW + c.fs : 0);
    var capH = c.lab ? c.fs + 1 : 0;
    // Bei knapper Höhe entfällt die YTD-Ebene, damit die übrigen atmen können.
    var tall = c.h >= 165;
    var bd = bands(c.y0, c.ih - labH, tall ? [17, 17, 24, 42] : [22, 26, 52], c.fs * 0.6);
    var iB = tall ? 1 : 0;                     // Index der Δ%-Ebene
    var sl = slots(c.x0, plotW, cnt, 0.55);
    if (tall) {
      b += layerCap(c, c.x0, bd[0].y + c.fs - 1, 'Δ' + kind + ' % YTD');
      b += deltaPins(c, ytd, sl, bd[0].y + capH, Math.max(5, bd[0].h - capH), hh, { labels: false });
    }
    b += layerCap(c, c.x0, bd[iB].y + c.fs - 1, 'Δ' + kind + ' %');
    b += deltaPins(c, dRel, sl, bd[iB].y + capH, Math.max(5, bd[iB].h - capH), hh, { labels: false });
    // Nächste Ebene: Δ-Brücke (aufgelaufene Abweichung)
    b += layerCap(c, c.x0, bd[iB + 1].y + c.fs - 1, 'Δ' + kind + ' kumuliert');
    var y3 = bd[iB + 1].y + capH, h3 = Math.max(6, bd[iB + 1].h - capH);
    var accs = [], acc = 0;
    for (i = 0; i < cnt; i++) { accs.push(acc); acc = n(acc + dAbs[i]); }
    var hiA = 0, loA = 0;
    for (i = 0; i < cnt; i++) {
      hiA = Math.max(hiA, accs[i], accs[i] + dAbs[i]);
      loA = Math.min(loA, accs[i], accs[i] + dAbs[i]);
    }
    var s3 = sc(loA * 1.1 - 1, hiA * 1.1 + 1, y3 + h3, y3), z3 = s3(0);
    b += ln(c.x0, z3, c.x0 + plotW, z3, AXIS, 1);
    for (i = 0; i < cnt; i++) {
      var yT = s3(Math.max(accs[i], accs[i] + dAbs[i]));
      var yB = s3(Math.min(accs[i], accs[i] + dAbs[i]));
      b += rect(sl[i].x, yT, sl[i].w, Math.max(0.9, yB - yT), dAbs[i] >= 0 ? GOOD : BAD);
    }
    // Letzte Ebene: Säulen AC gegen Referenz
    var P = { x: c.x0, y: bd[iB + 2].y, w: plotW, h: bd[iB + 2].h };
    var blk = colBlock(c, P, ac, pl, kind, hh, sl);
    b += blk.body + monLabels(c, sl, c.y1 - 0.5);
    if (totW) {
      var fcAt = fcStart(c, cnt), sAC = 0, sFC = 0;
      for (i = 0; i < cnt; i++) { if ((i + 1) >= fcAt) sFC += ac[i]; else sAC += ac[i]; }
      var scT = sc(0, (sAC + sFC) * 1.06, P.y + P.h, P.y + c.fs * 1.35);
      var tx = c.x1 - totW, tw = totW;
      b += rect(tx, scT(sAC), tw, Math.max(0.9, P.y + P.h - scT(sAC)), AC);
      if (sFC) b += rect(tx, scT(sAC + sFC), tw, Math.max(0.9, scT(sAC) - scT(sAC + sFC)), fcFill(hh, tw), AC, 0.8);
      b += txt(tx + tw / 2, scT(sAC + sFC) - c.fs * 0.42, lbl(sAC + sFC, 0), c.fs, AC, 'middle', '600');
      b += ln(tx, P.y + P.h, tx + tw, P.y + P.h, AXIS, 1.2);
      b += txt(tx + tw / 2, c.y1 - 0.5, sFC ? 'AC+FC' : 'Σ AC', c.fs, TXT, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 14 · Horizontale Balken, sortiert -------------------------------- */
  S.bars = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var kind = refKind(c);
    var ac = sortDesc(vals(c, cnt, 68, 50)), rf = kind ? derive(c, ac, 0.78, 1.2) : null;
    var labW = c.lab ? Math.min(40, c.iw * 0.2) : 0;
    var valW = c.lab ? c.fs * 2.8 : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var P = area(c, { left: labW, right: valW, top: headH });
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0) * 1.04;
    var s = sc(0, mx, P.x, P.x + P.w);
    var rw = rowsOf(P.y, P.h, cnt, c.small ? 0.36 : 0.26), i;
    var off = !!rf && kind === 'PL';
    for (i = 0; i < cnt; i++) {
      var step = rw[i].step;
      var bh = off ? step * 0.40 : (rf ? step * 0.42 : step * 0.6);
      var dy = off ? step * 0.13 : 0;
      if (rf && kind) {
        var hR = off ? bh : step * 0.66;
        b += refShape(P.x, rw[i].cy - dy - hR / 2, Math.max(0.9, s(rf[i]) - P.x), hR, kind, hh);
      }
      b += rect(P.x, rw[i].cy + dy - bh / 2, Math.max(0.9, s(ac[i]) - P.x), bh, AC);
      if (c.lab) {
        b += txt(Math.max(s(ac[i]), rf ? s(rf[i]) : 0) + 2.5, rw[i].cy + c.fs * 0.34, lbl(ac[i], 0), c.fs, AC, 'start');
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, CAT[i % CAT.length], c.fs, TXT, 'end');
      }
    }
    if (c.lab) b += txt(P.x, c.y0 + c.fs, 'AC' + (kind ? ' · ' + kind : ''), c.fs, SUB, 'start');
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1.2);
    return wrap(c, b);
  };

  /* ---- 15 · Bullet-Balken mit Zielmarke -------------------------------- */
  S.bullet = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 2 : (c.dense ? 6 : 4);
    var labW = c.lab ? Math.min(38, c.iw * 0.2) : 0;
    var valW = c.lab ? c.fs * 3.4 : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var P = area(c, { left: labW, right: valW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i;
    for (i = 0; i < cnt; i++) {
      var v = 0.45 + c.rnd() * 0.5, t = 0.55 + c.rnd() * 0.35;
      var bh = rw[i].h * 0.54;
      b += rect(P.x, rw[i].y, P.w, rw[i].h, '#F1F1F1');
      b += rect(P.x, rw[i].y + rw[i].h * 0.2, P.w * Math.min(1, t) * 0.999, rw[i].h * 0.6, GRID);
      b += rect(P.x, rw[i].cy - bh / 2, Math.max(0.9, P.w * Math.min(1, v)), bh, AC);
      b += ln(P.x + P.w * Math.min(1, t), rw[i].y - 0.6, P.x + P.w * Math.min(1, t), rw[i].y + rw[i].h + 0.6, AXIS, 1.6);
      if (c.lab) {
        var d = n((v / t - 1) * 100);
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, CAT[i % CAT.length], c.fs, TXT, 'end');
        b += txt(P.x + P.w + 2.5, rw[i].cy + c.fs * 0.34, plbl(d), c.fs, d >= 0 ? GOOD : BAD, 'start');
      }
    }
    if (c.lab) b += txt(P.x, c.y0 + c.fs, 'AC · Ziel', c.fs, SUB, 'start');
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1.2);
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
    var kind = refKind(c) || 'PL';
    var ac = sortDesc(vals(c, cnt, 68, 46)), pl = derive(c, ac, 0.8, 1.2);
    var labW = c.lab ? Math.min(34, c.iw * 0.16) : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var P = area(c, { left: labW, top: headH });
    var gap = c.small ? 3 : c.fs * 1.1;
    var wide = c.small || !c.vRel || c.w < 260;
    var w1 = wide ? P.w * 0.60 : P.w * 0.46;
    var w2 = Math.max(6, (wide ? P.w * 0.40 : P.w * 0.29) - gap);
    var w3 = wide ? 0 : Math.max(6, P.w * 0.25 - gap);
    var rw = rowsOf(P.y, P.h, cnt, c.small ? 0.36 : 0.26), i;
    var valW = c.lab ? c.fs * 2.4 : 0;
    var mx = Math.max(maxOf(ac), maxOf(pl)) * 1.04;
    var s = sc(0, mx, P.x, P.x + Math.max(4, w1 - valW));
    var off = kind === 'PL';
    for (i = 0; i < cnt; i++) {
      var step = rw[i].step;
      var bh = off ? step * 0.40 : step * 0.42;
      var dy = off ? step * 0.13 : 0;
      var hR = off ? bh : step * 0.66;
      b += refShape(P.x, rw[i].cy - dy - hR / 2, Math.max(0.9, s(pl[i]) - P.x), hR, kind, hh);
      b += rect(P.x, rw[i].cy + dy - bh / 2, Math.max(0.9, s(ac[i]) - P.x), bh, AC);
      if (c.lab) {
        b += txt(Math.max(s(ac[i]), s(pl[i])) + 2.2, rw[i].cy + c.fs * 0.34, lbl(ac[i], 0), c.fs, AC, 'start');
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, CAT[i % CAT.length], c.fs, TXT, 'end');
      }
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1.2);
    if (c.lab) b += txt(P.x, c.y0 + c.fs, 'AC · ' + kind, c.fs, SUB, 'start');
    var x2 = P.x + w1 + gap;
    if (c.vAbs) {
      if (c.lab) b += txt(x2 + w2 / 2, c.y0 + c.fs, 'Δ' + kind, c.fs, SUB, 'middle');
      b += deltaBarsH(c, diffs(ac, pl), rw, x2, w2, hh);
    }
    if (!wide && c.vRel) {
      var x3 = x2 + w2 + gap;
      if (c.lab) b += txt(x3 + w3 / 2, c.y0 + c.fs, 'Δ' + kind + ' %', c.fs, SUB, 'middle');
      b += deltaPinsH(c, rels(ac, pl), rw, x3, w3);
    }
    return wrap(c, b);
  };

  /* ---- 20 · IBCS-Tabelle: AC · Referenz · Δ · Δ% mit Σ-Zeile ----------- */
  S.table = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 3 : (c.dense ? 7 : 5);
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var headH = c.lab ? c.fs + 5 : Math.min(7, P.h * 0.22);
    var rh = (P.h - headH) / (rows + 1);
    var wide = c.lab && c.w >= 300;
    var ac = [], rf = [], d = [], rel = [], sAC = 0, sRF = 0, i;
    for (i = 0; i < rows; i++) {
      var a = n(40 + c.rnd() * 60), p = n(a * (0.8 + c.rnd() * 0.4));
      ac.push(a); rf.push(p); d.push(n(a - p)); rel.push(n(p ? (a - p) / p * 100 : 0));
      sAC += a; sRF += p;
    }
    sAC = n(sAC); sRF = n(sRF);
    var dS = n(sAC - sRF), relS = n(sRF ? dS / sRF * 100 : 0);
    var acR   = P.x + P.w * (wide ? 0.25 : 0.34);
    var cellX = P.x + P.w * 0.27, cellW = P.w * 0.15;
    var dX    = P.x + P.w * (wide ? 0.46 : 0.38), dW = P.w * (wide ? 0.31 : 0.36);
    var rX    = P.x + P.w * (wide ? 0.79 : 0.76), rW = P.w * (wide ? 0.21 : 0.24);
    var dA = dX + dW / 2, rA = rX + rW / 2;
    // Labelrand aus der tatsächlichen Textbreite, damit nichts herausläuft.
    var wD = dlbl(dS).length, wR = plbl(relS).length;
    for (i = 0; i < rows; i++) { wD = Math.max(wD, dlbl(d[i]).length); wR = Math.max(wR, plbl(rel[i]).length); }
    var lwD = c.lab ? Math.min(dW * 0.42, wD * c.fs * 0.62 + 3) : 0;
    var lwR = c.lab ? Math.min(rW * 0.42, wR * c.fs * 0.62 + 4) : 0;
    var sD = sc(-maxOf(d.concat([dS])) * 1.06, maxOf(d.concat([dS])) * 1.06, dX + lwD, dX + dW - lwD);
    var sR = sc(-maxOf(rel.concat([relS])) * 1.06, maxOf(rel.concat([relS])) * 1.06, rX + lwR, rX + rW - lwR);
    // In-Zellen-Balken: Datenzeilen auf ihr Maximum, Σ-Zeile auf die Summe skaliert
    var mxAC = maxOf(ac.concat(rf)) || 1;
    // Kopfzeile
    if (c.lab) {
      b += txt(acR, P.y + headH - 4, 'AC', c.fs, AC, 'end', '600');
      if (wide) b += txt(cellX + cellW, P.y + headH - 4, kind, c.fs, SUB, 'end', '600');
      b += txt(dA, P.y + headH - 4, 'Δ' + kind, c.fs, SUB, 'middle', '600');
      b += txt(rA, P.y + headH - 4, 'Δ' + kind + ' %', c.fs, SUB, 'middle', '600');
    }
    b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, AXIS, 1.2);
    b += ln(dA, P.y + headH, dA, P.y + P.h, AXIS, 0.8);
    b += ln(rA, P.y + headH, rA, P.y + P.h, GRID, 0.9);
    function tRow(label, a, p, dv, rv, y, bold, mxr) {
      var s = '', cy = y + rh * 0.66, bh = Math.max(1.6, rh * 0.42), col = dv >= 0 ? GOOD : BAD;
      if (c.lab) {
        s += txt(P.x, cy, label, c.fs, bold ? AC : TXT, 'start', bold ? '600' : null);
        s += txt(acR, cy, lbl(a, 0), c.fs, AC, 'end', bold ? '600' : null);
      } else {
        s += ghost(P.x, y + rh * 0.34, P.w * 0.18, Math.max(1.3, rh * 0.2));
        s += ghost(P.x + P.w * 0.22, y + rh * 0.34, P.w * 0.1, Math.max(1.3, rh * 0.2), '#8A8A8A');
      }
      // In-Zellen-Balken: Referenz als Kontur, AC gefüllt davor
      if (wide) {
        s += rect(cellX, y + rh * 0.5 - bh * 0.66, Math.max(0.8, cellW * (p / mxr)), bh * 1.32, PLF, PLS, 0.9);
        s += rect(cellX, y + rh * 0.5 - bh / 2, Math.max(0.8, cellW * (a / mxr)), bh, AC);
      }
      // Δ absolut: Balken an der eigenen Nulllinie plus Wert
      var xx = sD(dv);
      s += rect(Math.min(dA, xx), y + rh * 0.5 - bh * 0.4, Math.max(0.8, Math.abs(xx - dA)), bh * 0.8, col);
      if (c.lab) s += txt(dv >= 0 ? xx + 2 : xx - 2, cy, dlbl(dv), c.fs, col, dv >= 0 ? 'start' : 'end', bold ? '600' : null);
      // Δ relativ: Pin mit Kopf
      var xr = sR(rv), cy2 = y + rh * 0.5;
      s += ln(rA, cy2, xr, cy2, col, 1.3);
      s += circ(xr, cy2, clamp(rh * 0.15, 1.1, 2.4), col);
      if (c.lab) s += txt(rv >= 0 ? xr + 3 : xr - 3, cy, plbl(rv), c.fs, col, rv >= 0 ? 'start' : 'end', bold ? '600' : null);
      return s;
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, GRID, 0.9);
      b += tRow(CAT[i % CAT.length], ac[i], rf[i], d[i], rel[i], y, false, mxAC);
    }
    var ys = P.y + headH + rh * rows;
    b += ln(P.x, ys, P.x + P.w, ys, AXIS, 1);
    b += tRow('Σ', sAC, sRF, dS, relS, ys, true, Math.max(sAC, sRF) || 1);
    return wrap(c, b);
  };

  /* ---- 21 · Wasserfall-Kombi: Wasserfall + Δ-Ebene --------------------- */
  S.wfkombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var mids = c.small ? 2 : 4, cnt = mids + 2;
    var kind = refKind(c) || 'PL';
    var start = 70, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 32));
    var labH = c.lab ? c.fs + 4 : 0, capH = c.lab ? c.fs + 1 : 0;
    var bd = bands(c.y0, c.ih - labH, [64, 36], c.fs * 0.8);
    var P = { x: c.x0, y: bd[0].y, w: c.iw, h: bd[0].h };
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var sl = slots(P.x, P.w, cnt, 0.3);
    var showLbl = c.lab && sl[0].w >= c.fs * 1.9 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.2;
    var s = sc(low, Math.max(peak, start, end) * 1.04, P.y + P.h, P.y + lh);
    var zero = s(0), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, zero - s(start)), AC);
    if (showLbl) b += txt(sl[0].cx, s(start) - c.fs * 0.42, lbl(start, 0), c.fs, AC, 'middle', '600');
    for (i = 0; i < mids; i++) {
      var to = n(cur + steps[i]);
      var yT = s(Math.max(cur, to)), yB = s(Math.min(cur, to));
      b += ln(sl[i].x + sl[i].w, s(cur), sl[i + 1].x, s(cur), HAIR, 0.9);
      b += rect(sl[i + 1].x, yT, sl[i + 1].w, Math.max(0.9, yB - yT), steps[i] >= 0 ? GOOD : BAD);
      if (showLbl) b += txt(sl[i + 1].cx, yT - c.fs * 0.42, dlbl(steps[i]), c.fs, steps[i] >= 0 ? GOOD : BAD, 'middle');
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), HAIR, 0.9);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, zero - s(end)), AC);
    if (showLbl) b += txt(sl[cnt - 1].cx, s(end) - c.fs * 0.42, lbl(end, 0), c.fs, AC, 'middle', '600');
    b += ln(P.x, zero, P.x + P.w, zero, AXIS, 1.2);
    var d = [], k;
    for (k = 0; k < cnt; k++) d.push(n((c.rnd() - 0.45) * 26));
    b += layerCap(c, c.x0, bd[1].y + c.fs - 1, 'Δ' + kind);
    b += deltaCols(c, d, sl, bd[1].y + capH, Math.max(6, bd[1].h - capH), hh);
    if (c.lab) {
      var nm = ['Σ'];
      for (i = 0; i < mids; i++) nm.push(CAT[i % CAT.length]);
      nm.push('Σ');
      b += monLabels(c, sl, c.y1 - 0.5, nm);
    }
    return wrap(c, b);
  };

  /* ---- 22 · Horizontaler Wasserfall mit integrierter Varianz ----------- */
  S.wfint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var mids = c.small ? 2 : (c.dense ? 6 : 4), cnt = mids + 2;
    var kind = refKind(c) || 'PY';
    var labW = c.lab ? Math.min(32, c.iw * 0.17) : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var dW = c.small ? 0 : Math.max(14, c.iw * (c.lab ? 0.24 : 0.18));
    var P = area(c, { left: labW, right: dW ? dW + c.fs : 0, top: headH });
    var start = 66, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 28));
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var rw = rowsOf(P.y, P.h, cnt, 0.26);
    var showLbl = c.lab && rw[0].h >= c.fs * 0.85;
    var lw = showLbl ? c.fs * 2.4 : 0;
    var s = sc(low, Math.max(peak, start, end) * 1.03, P.x, P.x + Math.max(4, P.w - lw));
    var zero = s(0), cur = start;
    // Kopfzeile Σ Referenz
    b += refShape(zero, rw[0].y, Math.max(0.9, s(start) - zero), rw[0].h, kind, hh);
    if (showLbl) b += txt(s(start) + 2.2, rw[0].cy + c.fs * 0.34, lbl(start, 0), c.fs, TXT, 'start');
    for (i = 0; i < mids; i++) {
      var to = n(cur + steps[i]);
      var xL = s(Math.min(cur, to)), xR = s(Math.max(cur, to));
      b += ln(s(cur), rw[i].y + rw[i].h, s(cur), rw[i + 1].y, HAIR, 0.9);
      b += rect(xL, rw[i + 1].y, Math.max(0.9, xR - xL), rw[i + 1].h, steps[i] >= 0 ? GOOD : BAD);
      if (showLbl) {
        b += txt(steps[i] >= 0 ? xR + 2.2 : xL - 2.2, rw[i + 1].cy + c.fs * 0.34, dlbl(steps[i]),
                 c.fs, steps[i] >= 0 ? GOOD : BAD, steps[i] >= 0 ? 'start' : 'end');
      }
      cur = to;
    }
    b += ln(s(cur), rw[mids].y + rw[mids].h, s(cur), rw[cnt - 1].y, HAIR, 0.9);
    b += rect(zero, rw[cnt - 1].y, Math.max(0.9, s(end) - zero), rw[cnt - 1].h, AC);
    if (showLbl) b += txt(s(end) + 2.2, rw[cnt - 1].cy + c.fs * 0.34, lbl(end, 0), c.fs, AC, 'start');
    b += ln(zero, P.y, zero, P.y + P.h, AXIS, 1.2);
    if (c.lab) {
      b += txt(P.x - 3, rw[0].cy + c.fs * 0.34, kind, c.fs, TXT, 'end');
      b += txt(P.x - 3, rw[cnt - 1].cy + c.fs * 0.34, 'AC', c.fs, AC, 'end', '600');
      for (i = 0; i < mids; i++) b += txt(P.x - 3, rw[i + 1].cy + c.fs * 0.34, CAT[i % CAT.length], c.fs, TXT, 'end');
      b += txt(P.x, c.y0 + c.fs, kind + ' → AC', c.fs, SUB, 'start');
    }
    if (dW) {
      var d = [], k;
      for (k = 0; k < cnt; k++) d.push(n((c.rnd() - 0.45) * 22));
      if (c.lab) b += txt(c.x1 - dW / 2, c.y0 + c.fs, 'Δ' + kind, c.fs, SUB, 'middle');
      b += deltaBarsH(c, d, rw, c.x1 - dW, dW, hh);
    }
    return wrap(c, b);
  };

  /* ---- 23 · Gestapelte Balken ------------------------------------------ */
  S.stackbar = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 7 : 5);
    var segs = c.small ? 2 : 3, cols = [AC, G2, G3];
    var labW = c.lab ? Math.min(32, c.iw * 0.16) : 0;
    var valW = c.lab ? c.fs * 2.4 : 0;
    var P = area(c, { left: labW, right: valW });
    var rw = rowsOf(P.y, P.h, cnt, 0.28), i, j;
    for (i = 0; i < cnt; i++) {
      var tot = 0.55 + c.rnd() * 0.45, x = P.x;
      // Anteile auf 1 normieren, damit der Stapel nie über die Fläche läuft.
      var fr = [], fsum = 0;
      for (j = 0; j < segs; j++) { var f = 0.2 + c.rnd() * 0.3; fr.push(f); fsum += f; }
      for (j = 0; j < segs; j++) {
        var sw2 = P.w * tot * fr[j] / fsum;
        b += rect(x, rw[i].y, Math.max(0.9, sw2), rw[i].h, cols[j % cols.length]);
        if (j) b += ln(x, rw[i].y, x, rw[i].y + rw[i].h, '#FFFFFF', 0.7);
        x += sw2;
      }
      if (c.lab) {
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, CAT[i % CAT.length], c.fs, TXT, 'end');
        b += txt(x + 2.2, rw[i].cy + c.fs * 0.34, lbl(tot * 100, 0), c.fs, AC, 'start');
      }
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, AXIS, 1.2);
    return wrap(c, b);
  };

  /* ---- 24 · Small Multiples: je Panel AC gegen Referenz ---------------- */
  S.multiples = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(), b = hh.defs;
    var kind = refKind(c);
    var cols = c.small ? 2 : 3, rws = c.small ? 1 : 2;
    var gx = c.small ? 3 : 6, gy = c.lab ? c.fs + 4 : 4;
    var cw = (c.iw - gx * (cols - 1)) / cols;
    var ch = (c.ih - gy * (rws - 1)) / rws;
    var i, j, k;
    for (i = 0; i < rws; i++) {
      for (j = 0; j < cols; j++) {
        var px = c.x0 + j * (cw + gx), py = c.y0 + i * (ch + gy);
        var hd = c.lab ? c.fs + 2 : 0;
        var P = { x: px, y: py + hd, w: cw, h: Math.max(3, ch - hd) };
        var v = vals(c, 4, 60, 40), rf = kind ? derive(c, v, 0.8, 1.2) : null;
        if (c.lab) {
          var dd = rf ? n((v[3] - rf[3]) / (rf[3] || 1) * 100) : 0;
          b += txt(px, py + c.fs - 1, CAT[(i * cols + j) % CAT.length], c.fs, TXT, 'start', '600');
          if (rf && cw >= c.fs * 7) b += txt(px + cw, py + c.fs - 1, plbl(dd), c.fs, dd >= 0 ? GOOD : BAD, 'end');
        }
        var sl = slots(P.x, P.w, 4, 0.5);
        b += colBlock(c, P, v, rf, kind, hh, sl, { labels: false }).body;
      }
    }
    return wrap(c, b);
  };

  /* ---- 25 · Tabelle mit Sparklines -------------------------------------- */
  S.sparktable = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 2 : (c.dense ? 6 : 4);
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var headH = c.lab ? c.fs + 4 : 0;
    var rh = (P.h - headH) / rows;
    var labW = c.lab ? P.w * 0.22 : P.w * 0.2;
    var numW = c.lab ? P.w * 0.14 : 0;
    var valW = c.lab ? P.w * 0.18 : P.w * 0.14;
    var spX = P.x + labW + numW + 3, spW = Math.max(6, P.w - labW - numW - valW - 6);
    var i;
    if (c.lab) {
      b += txt(P.x, P.y + headH - 4, 'AC · Verlauf', c.fs, SUB, 'start', '600');
      b += txt(P.x + P.w, P.y + headH - 4, 'Δ' + kind + ' %', c.fs, SUB, 'end', '600');
      b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, AXIS, 1.2);
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i, cy = y + rh * 0.66;
      if (i) b += ln(P.x, y, P.x + P.w, y, GRID, 0.9);
      var pts = sparkPts(c, 8, spX, y + rh * 0.2, spW, rh * 0.6);
      var poly = pts.concat([[spX + spW, y + rh * 0.8], [spX, y + rh * 0.8]]);
      b += polygonEl(poly, '#EDEBE6');
      b += polyline(pts, AC, 1.2);
      b += circ(pts[7][0], pts[7][1], 1.5, AC);
      var d = n((c.rnd() - 0.42) * 20);
      if (c.lab) {
        b += txt(P.x, cy, CAT[i % CAT.length], c.fs, TXT, 'start');
        b += txt(P.x + labW + numW - 4, cy, lbl(40 + c.rnd() * 60, 0), c.fs, AC, 'end');
        b += txt(P.x + P.w, cy, plbl(d), c.fs, d >= 0 ? GOOD : BAD, 'end');
      } else {
        b += ghost(P.x, y + rh * 0.4, labW * 0.8, Math.max(1.4, rh * 0.18));
        b += ghost(P.x + P.w - valW * 0.7, y + rh * 0.4, valW * 0.7, Math.max(1.4, rh * 0.18), d >= 0 ? GOOD : BAD);
      }
    }
    return wrap(c, b);
  };

  /* ---- 26 · Heatmap, divergierend --------------------------------------- */
  S.heatmap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 4 : (c.dense ? 12 : 8);
    var rows = c.small ? 3 : (c.dense ? 6 : 4);
    var labW = c.lab ? Math.min(c.iw * 0.34, c.fs * 5 + 3) : 0, labH = c.lab ? c.fs + 2 : 0;
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

  /* ---- 30 · KPI-Kachel im Zuschnitt der ChartKitchen-Monitoring-Karte --- */
  S.kpi = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var kind = refKind(c) || 'PL';
    var d = n((c.rnd() - 0.35) * 18);
    var col = d >= 0 ? GOOD : BAD;
    // Status-Akzent am linken Rand
    var accOK = P.w >= 46 && P.h >= 24;
    var accW = clamp(P.w * 0.022, 1.6, 4);
    if (accOK) b += rrect(P.x, P.y, accW, P.h, accW / 2, col);
    var L = P.x + (accOK ? accW + Math.min(7, P.w * 0.05) : 0);
    var R = P.x + P.w, iw = Math.max(6, R - L);
    // Beschriftung: o.label (leer = keine, weil die Kachel den Titel schon trägt)
    var kpiLabel = (o && o.label !== undefined) ? String(o.label) : 'Umsatz';
    var titleH = (!c.small && kpiLabel) ? c.fs + 3 : 0;
    // Ausnahme zur 8–10-px-Regel: die Kennzahl selbst ist das Erkennungsmerkmal.
    // Der Grad richtet sich auch nach der Textbreite, sonst läuft sie heraus.
    var num = lbl(124.6);
    var big = clamp(Math.min((P.h - titleH) * 0.5, iw / (num.length * 0.62)), 4, 40);
    var dH = Math.min(c.fs + 6, big * 0.62) + c.fs * 0.3;
    // Block aus Titel, Zahl und Δ-Zeile vertikal zentrieren.
    var T = P.y + Math.max(0, (P.h - (titleH + big * 0.82 + dH)) / 2);
    if (titleH) b += txt(L, T + c.fs - 1, kpiLabel, Math.min(9, c.fs), SUB, 'start', '600');
    var yBig = T + titleH + big * 0.82;
    b += txt(L, yBig, num, big, AC, 'start', '700');
    if (!c.small && iw >= 78) b += txt(L + num.length * big * 0.56 + 3, yBig, 'M', Math.min(10, c.fs + 1), SUB, 'start');
    // Δ-Zeile: Pfeil, Wert, Referenz
    var yD = yBig + Math.min(c.fs + 6, big * 0.62);
    if (yD <= P.y + P.h - 1) {
      var ah = Math.min(5, c.fs * 0.66);
      b += pathEl(d >= 0
        ? 'M' + n(L) + ' ' + n(yD - 1) + ' l' + n(ah) + ' ' + n(-ah) + ' l' + n(ah) + ' ' + n(ah) + ' z'
        : 'M' + n(L) + ' ' + n(yD - ah - 1) + ' l' + n(ah) + ' ' + n(ah) + ' l' + n(ah) + ' ' + n(-ah) + ' z', col);
      b += txt(L + ah * 2 + 3, yD, plbl(d) + (c.small ? '' : ' Δ' + kind), Math.min(9, c.fs), col, 'start', '600');
    }
    // Mini-Sparkline rechts oben, mit heller Fläche wie im Visual
    if (iw >= 66 && P.h >= 38) {
      var sw2 = Math.min(iw * 0.36, 52), sh = Math.min(16, P.h * 0.26);
      var sx = R - sw2, sy = P.y + titleH;
      var pts = sparkPts(c, 8, sx, sy, sw2, sh);
      b += polygonEl(pts.concat([[sx + sw2, sy + sh], [sx, sy + sh]]), '#EDEBE6');
      b += polyline(pts, PY, 1.3);
      b += circ(pts[7][0], pts[7][1], 1.8, AC);
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
    // Der Grad richtet sich auch nach der Textbreite, sonst läuft sie heraus.
    var cnum = lbl(84.2);
    var big = clamp(Math.min(P.h * 0.46, P.w / (cnum.length * 0.62)), 4, 30);
    var cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    b += txt(cx, cy + big * 0.28, cnum, big, AC, 'middle', '600');
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
