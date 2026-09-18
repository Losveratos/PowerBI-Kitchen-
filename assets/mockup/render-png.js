/* ==========================================================================
   MockupKitchen · render-png.js
   --------------------------------------------------------------------------
   Rendert eine Mockup-Seite als eigenstaendiges SVG und als PNG — fuer
   Workshop-Doku, PowerPoint und Handouts.

     window.MK_PNG.pageSvg(pageId, opts)   -> String (vollstaendiges <svg>)
     window.MK_PNG.pagePng(pageId, opts)   -> Promise<Blob> (image/png)
     window.MK_PNG.allPagesPng(opts)       -> Promise<[{page, blob, fileName}]>
     window.MK_PNG.download(blob, fileName)

   opts = {
     scale:      2,      // nur pagePng/allPagesPng: Aufloesungsfaktor
     background: null,   // Farbe statt Seitenhintergrund; 'transparent' = keiner
     chips:      true,   // Rollen-Chips in der Kachelfusszeile
     badges:     false,  // Engine-Badges (PBI/CK/Deneb) oben rechts
     notes:      true,   // Notiz-Symbol, wenn die Kachel eine Notiz hat
     seedBase:   0       // verschiebt die Demo-Daten aller Kacheln
   }

   Grundsaetze
   - Das SVG ist eigenstaendig: keine externen Fonts (System-Stack), keine
     CSS-Klassen aus mockup-kitchen.html, kein <foreignObject>. Damit laesst
     es sich zuverlaessig ueber <img> + Canvas zu PNG rastern.
   - Geometrie kommt komplett aus MK.computeAll(page) — dieselben Rechtecke
     wie auf dem Bildschirm. Gezeichnet wird nach den CSS-Regeln des Tools
     (Kopfband hell/dunkel/akzent, Filter-Panel, Fusszeile, Kacheln).
   - Die Kachel-Skizzen liefert MK_SKETCH; ihr aeusserer <svg>-Tag wird in ein
     positioniertes verschachteltes <svg> ueberfuehrt und die Pattern-IDs
     bekommen je Kachel ein eigenes Praefix (sonst kollidieren mehrere
     Skizzen im selben Dokument).
   - Rein lesend: kein Zugriff auf den Zustand ausser MK.state/MK.computeAll.

   Laden: nach app.js (braucht window.MK) und nach sketches.js/catalog.js.
   ========================================================================== */
(function (root) {
  'use strict';

  var SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
  var MONO = "ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', Consolas, monospace";
  var LH = 1.45;                 // Zeilenhoehe wie im Tool
  var ASC = 1.025;               // Grundlinie einer Zeile ab Zeilenoberkante (Faktor der Schriftgroesse)
  var MID = 0.355;               // Grundlinie ab vertikaler Boxmitte
  var SEQ = 0;                   // laufende Nummer fuer eindeutige ID-Praefixe

  /* ------------------------------------------------------------- Textmasse */
  var _ctx = null, _ctxTried = false;
  function ctx2d() {
    if (_ctxTried) return _ctx;
    _ctxTried = true;
    try { _ctx = document.createElement('canvas').getContext('2d'); } catch (e) { _ctx = null; }
    return _ctx;
  }
  function textW(str, fs, weight, mono, ls) {
    str = String(str == null ? '' : str);
    if (!str || !(fs > 0)) return 0;
    var c = ctx2d(), w;
    if (c) {
      c.font = (weight ? weight + ' ' : '') + fs + 'px ' + (mono ? MONO : SANS);
      w = c.measureText(str).width;
      if (!isFinite(w)) w = str.length * fs * 0.55;
    } else w = str.length * fs * (mono ? 0.6 : 0.55);
    return w + (ls ? ls * str.length : 0);
  }
  // Text auf maxW kuerzen, mit Auslassungszeichen — wie text-overflow:ellipsis
  function fit(str, maxW, fs, weight, mono, ls) {
    str = String(str == null ? '' : str);
    if (!str) return '';
    if (maxW <= 0) return '';
    if (textW(str, fs, weight, mono, ls) <= maxW) return str;
    var lo = 0, hi = str.length, mid;
    while (lo < hi) {
      mid = (lo + hi + 1) >> 1;
      if (textW(str.slice(0, mid) + '…', fs, weight, mono, ls) <= maxW) lo = mid; else hi = mid - 1;
    }
    return lo > 0 ? str.slice(0, lo).replace(/\s+$/, '') + '…' : '';
  }

  /* -------------------------------------------------------- SVG-Bausteine */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function nm(v) { v = +v; if (!isFinite(v)) v = 0; return Math.round(v * 100) / 100; }

  function rc(x, y, w, h, o) {
    o = o || {};
    var a = 'x="' + nm(x) + '" y="' + nm(y) + '" width="' + nm(Math.max(0, w)) + '" height="' + nm(Math.max(0, h)) + '"';
    if (o.r) a += ' rx="' + nm(o.r) + '" ry="' + nm(o.r) + '"';
    a += ' fill="' + (o.fill || 'none') + '"';
    if (o.fillOpacity != null) a += ' fill-opacity="' + o.fillOpacity + '"';
    if (o.stroke) a += ' stroke="' + o.stroke + '" stroke-width="' + nm(o.sw == null ? 1 : o.sw) + '"';
    if (o.dash) a += ' stroke-dasharray="' + o.dash + '"';
    if (o.opacity != null) a += ' opacity="' + o.opacity + '"';
    if (o.filter) a += ' filter="url(#' + o.filter + ')"';
    return '<rect ' + a + '/>';
  }
  function ln(x1, y1, x2, y2, color, sw) {
    return '<line x1="' + nm(x1) + '" y1="' + nm(y1) + '" x2="' + nm(x2) + '" y2="' + nm(y2) +
           '" stroke="' + color + '" stroke-width="' + nm(sw == null ? 1 : sw) + '"/>';
  }
  function tx(x, y, s, o) {
    o = o || {};
    if (s === '' || s == null) return '';
    var a = 'x="' + nm(x) + '" y="' + nm(y) + '" font-size="' + nm(o.size || 12) + '" fill="' + (o.fill || '#0F1E2E') + '"';
    if (o.mono) a += ' font-family="' + MONO + '"';
    if (o.weight) a += ' font-weight="' + o.weight + '"';
    if (o.anchor) a += ' text-anchor="' + o.anchor + '"';
    if (o.ls) a += ' letter-spacing="' + nm(o.ls) + '"';
    if (o.opacity != null) a += ' opacity="' + o.opacity + '"';
    return '<text ' + a + '>' + esc(s) + '</text>';
  }

  /* ------------------------------------------------------------- Helferlein */
  // identisch zur Tool-Funktion, damit PNG und Bildschirm dieselben Demo-Daten zeigen
  function seedOf(id) { var h = 7, i; id = String(id || ''); for (i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h % 1000; }
  function slug(s) {
    return String(s || 'seite').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).toLowerCase() || 'seite';
  }
  function mk() {
    var M = root.MK;
    if (!M || !M.state) throw new Error('MK_PNG: window.MK fehlt — render-png.js nach app.js laden.');
    return M;
  }
  function pageOf(M, pageId) {
    var S = M.state;
    if (pageId && typeof pageId === 'object' && pageId.layout) return pageId;
    if (!pageId) return M.page();
    var p = S.pages.filter(function (x) { return x.id === pageId; })[0];
    if (!p) throw new Error('MK_PNG: Seite „' + pageId + '" gibt es nicht.');
    return p;
  }
  function norm(o) {
    o = o || {};
    return {
      scale: o.scale == null ? 2 : Math.max(0.25, Math.min(8, +o.scale || 2)),
      background: o.background == null ? null : o.background,
      chips: o.chips !== false,
      badges: o.badges === true,
      notes: o.notes !== false,
      seedBase: (+o.seedBase || 0) | 0
    };
  }

  // Skizze aus MK_SKETCH in ein positioniertes verschachteltes <svg> ueberfuehren
  function sketchAt(kind, x, y, w, h, sopt, prefix) {
    if (!root.MK_SKETCH || !(w > 0) || !(h > 0)) return '';
    var s;
    try { s = root.MK_SKETCH(kind, w, h, sopt); } catch (e) { s = ''; }
    if (typeof s !== 'string' || s.indexOf('<svg') !== 0) return '';
    var open = /^<svg\b[^>]*>/.exec(s);
    if (!open) return '';
    var attrs = open[0];
    var vb = /viewBox="([^"]*)"/.exec(attrs);
    var end = s.lastIndexOf('</svg>');
    var inner = s.slice(attrs.length, end < 0 ? undefined : end);
    // Pattern-IDs (mkfc…) eindeutig machen, sonst greifen mehrere Kacheln auf dieselbe Schraffur zu.
    // Durchnummeriert je Kachel, damit dieselbe Seite zweimal gerendert dasselbe Ergebnis liefert
    // (der globale Zaehler in sketches.js laeuft sonst bei jedem Aufruf weiter).
    var seq = 0, map = {};
    inner = inner.replace(/mkfc(\d+)/g, function (all, digits) {
      if (!map[digits]) map[digits] = prefix + 'fc' + (++seq);
      return map[digits];
    });
    return '<svg x="' + nm(x) + '" y="' + nm(y) + '" width="' + nm(w) + '" height="' + nm(h) + '"' +
           ' viewBox="' + (vb ? vb[1] : '0 0 ' + nm(w) + ' ' + nm(h)) + '" font-family="' + SANS + '">' + inner + '</svg>';
  }

  /* ====================================================================== */
  /*  Seitenaufbau                                                          */
  /* ====================================================================== */
  function build(pageId, opts, outW, outH) {
    var M = mk(), S = M.state, o = norm(opts);
    var p = pageOf(M, pageId);
    var geo = M.computeAll(p), z = geo.zones;
    var W = S.canvas.w, H = S.canvas.h, k = M.ui();
    var d = S.design || {}, c = S.chrome || {};
    var accent = d.accent || '#C25A2D';
    var PB = M.pageBg || { light: '#F4F4F1', soft: '#EEF1F5', white: '#FFFFFF' };
    var P = 'mkp' + (++SEQ) + '_';
    var body = '';

    var ctx = {
      S: S, p: p, k: k, d: d, c: c, o: o, accent: accent, P: P,
      radius: Math.round((d.radius || 0) * k),
      tileBg: d.tileBg || '#FFFFFF', ink: d.ink || '#0F1E2E',
      dark: !!(M.isDark && M.isDark(d.tileBg)),
      palette: d.palette || 'teal',
      pad: Math.round((S.spacing ? S.spacing.pad : 8) * k),
      cat: (M.catalog && M.catalog.byId) || {}
    };

    /* Seitenhintergrund */
    var bg = o.background != null ? o.background : (M.pageBgOf ? M.pageBgOf(d) : (PB[d.pageBg] || PB.light));
    if (bg && bg !== 'transparent') body += rc(0, 0, W, H, { fill: bg });

    /* Zonen */
    if (z.nav) body += navRail(ctx, z.nav);
    if (z.header) body += headerZone(ctx, z);
    if (z.footer) body += footerZone(ctx, z.footer);
    if (z.filter) body += filterZone(ctx, z.filter);

    /* Kacheln */
    geo.leaves.forEach(function (l, i) { body += tile(ctx, l, i); });

    var defs = '<defs>' +
      '<pattern id="' + P + 'empty" width="' + nm(20 * k) + '" height="' + nm(20 * k) + '" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      rc(0, 0, 20 * k, 20 * k, { fill: '#FFFFFF' }) + rc(0, 0, 10 * k, 20 * k, { fill: '#FAFAF7' }) + '</pattern>' +
      '<filter id="' + P + 'sh" x="-25%" y="-25%" width="150%" height="150%">' +
      '<feDropShadow dx="0" dy="' + nm(2 * k) + '" stdDeviation="' + nm(3 * k) + '" flood-color="#0F1E2E" flood-opacity="0.10"/></filter>' +
      '</defs>';

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
      ' viewBox="0 0 ' + W + ' ' + H + '" width="' + nm(outW == null ? W : outW) + '" height="' + nm(outH == null ? H : outH) + '"' +
      ' font-family="' + SANS + '" text-rendering="optimizeLegibility">' +
      '<title>' + esc((S.name || 'Mockup') + ' · ' + (p.name || 'Seite')) + '</title>' +
      defs + body + '</svg>';

    return { svg: svg, page: p, w: W, h: H };
  }

  /* --------------------------------------------------------- Navigationsleiste */
  function navRail(ctx, z) {
    var k = ctx.k, S = ctx.S, out = rc(z.x, z.y, z.w, z.h, { fill: '#0F1E2E' });
    var sz = 28 * k, cx = z.x + z.w / 2, y = z.y + 12 * k;
    out += rc(cx - sz / 2, y, sz, sz, { r: 6 * k, stroke: 'rgba(255,255,255,.35)', sw: 1.5 * k, dash: nm(4 * k) + ' ' + nm(3 * k) });
    y += sz + 10 * k + 6 * k;
    S.pages.forEach(function (pg) {
      var act = pg.id === ctx.p.id;
      out += rc(cx - sz / 2, y, sz, sz, act
        ? { r: 6 * k, fill: ctx.accent }
        : { r: 6 * k, stroke: 'rgba(255,255,255,.35)', sw: 1.5 * k });
      y += sz + 10 * k;
    });
    return out;
  }

  /* ------------------------------------------------------------- Kopfband */
  function logoBox(x, y, w, h, light, k) {
    return rc(x, y, w, h, { r: 4 * k, stroke: light ? 'rgba(15,30,46,.4)' : 'rgba(255,255,255,.55)', sw: 1.5 * k, dash: nm(4 * k) + ' ' + nm(3 * k) }) +
      tx(x + w / 2, y + h / 2 + 10 * k * MID, 'LOGO', {
        size: 10 * k, mono: true, anchor: 'middle', ls: 0.6 * k,
        fill: light ? 'rgba(15,30,46,.6)' : 'rgba(255,255,255,.75)'
      });
  }
  function headerZone(ctx, zones) {
    var z = zones.header, k = ctx.k, c = ctx.c.header, d = ctx.d, S = ctx.S;
    var style = d.header || 'light', light = style === 'light';
    var bgc = style === 'dark' ? '#0F1E2E' : style === 'accent' ? ctx.accent : style === 'custom' ? (d.headerBg || '#0F1E2E') : '#FFFFFF';
    var fg = style === 'custom' ? (d.headerInk || '#FFFFFF') : light ? '#0F1E2E' : '#FFFFFF';
    var out = rc(z.x, z.y, z.w, z.h, { fill: bgc });
    if (light) out += ln(z.x, z.y + z.h - 0.5, z.x + z.w, z.y + z.h - 0.5, '#E3E1D8', 1);

    var padX = 16 * k, gap = 14 * k, cy = z.y + z.h / 2;
    var x = z.x + padX;

    /* Burger, wenn das Filter-Panel als Bookmark-Menue gedacht ist */
    if (ctx.c.filter && ctx.c.filter.on && ctx.c.filter.side === 'burger') {
      var bs = 32 * k;
      out += rc(x, cy - bs / 2, bs, bs, { r: 4 * k, stroke: light ? 'rgba(15,30,46,.3)' : 'rgba(255,255,255,.4)', sw: 1 });
      for (var i = -1; i <= 1; i++) out += ln(x + 7 * k, cy + i * 6 * k, x + bs - 7 * k, cy + i * 6 * k, fg, 2 * k);
      var n = (ctx.c.filter.fields || []).length;
      if (n) {
        var bw = textW(String(n), 9 * k, null, true) + 10 * k, bh = 13 * k;
        out += rc(x + bs - bw + 6 * k, cy - bs / 2 - 6 * k, bw, bh, { r: bh / 2, fill: ctx.accent }) +
          tx(x + bs - bw / 2 + 6 * k, cy - bs / 2 - 6 * k + bh / 2 + 9 * k * MID, String(n), { size: 9 * k, mono: true, anchor: 'middle', fill: '#fff' });
      }
      x += bs + gap;
    }
    /* Logo links */
    var lw = 88 * k, lh = 30 * k;
    if (c.logoPos === 'left') { out += logoBox(x, cy - lh / 2, lw, lh, light, k); x += lw + gap; }

    /* rechte Gruppe: Navigation, danach Logo rechts */
    var rightX = z.x + z.w - padX;
    if (c.logoPos === 'right') { rightX -= lw; out += logoBox(rightX, cy - lh / 2, lw, lh, light, k); rightX -= gap; }

    var names = c.navAuto ? S.pages.map(function (pg) { return pg.name; }) : (c.nav || []).slice();
    var cur = c.navAuto ? ctx.p.name : names[0];
    var navW = 0, items = [];
    if (names.length) {
      var fs = 11.5 * k, bh2 = Math.round(fs * LH + 10 * k + 2), g2 = 6 * k;
      names.forEach(function (nme) { items.push({ t: nme, w: Math.round(textW(nme, fs, null, false) + 24 * k + 2) }); });
      // von rechts auffuellen, solange Platz neben dem Titel bleibt
      var avail = rightX - (x + 90 * k);
      while (items.length) {
        navW = items.reduce(function (a, it) { return a + it.w; }, 0) + g2 * (items.length - 1);
        if (navW <= avail) break;
        items.pop();
      }
      if (!items.length) navW = 0;
      var nx = rightX - navW;
      items.forEach(function (it) {
        var act = it.t === cur;
        out += rc(nx, cy - bh2 / 2, it.w, bh2, act
          ? { r: 4 * k, fill: style === 'accent' ? '#0F1E2E' : ctx.accent }
          : { r: 4 * k, stroke: light ? 'rgba(15,30,46,.3)' : 'rgba(255,255,255,.35)', sw: 1 });
        out += tx(nx + it.w / 2, cy + fs * MID, fit(it.t, it.w - 8 * k, fs), { size: fs, anchor: 'middle', fill: act ? '#FFFFFF' : fg });
        nx += it.w + g2;
      });
      if (items.length) rightX = rightX - navW - gap;
    }

    /* Titelblock */
    var tfs = 17 * k, sfs = 11 * k;
    var maxW = Math.max(20, rightX - x);
    var title = fit(c.title || 'Seitentitel', maxW, tfs, 600);
    var blockH = tfs * LH + (c.sub ? sfs * LH : 0);
    var top = cy - blockH / 2;
    out += tx(x, top + tfs * ASC, title, { size: tfs, weight: 600, fill: fg });
    if (c.sub) out += tx(x, top + tfs * LH + sfs * ASC, fit(c.sub, maxW, sfs), { size: sfs, fill: fg, opacity: 0.7 });
    return out;
  }

  /* ------------------------------------------------------------ Fusszeile */
  function footerZone(ctx, z) {
    var k = ctx.k, fs = 10 * k;
    return ln(z.x, z.y + 0.5, z.x + z.w, z.y + 0.5, '#E3E1D8', 1) +
      tx(z.x + 16 * k, z.y + z.h / 2 + fs * MID, fit(ctx.c.footer.text || '', z.w - 32 * k, fs), { size: fs, fill: '#6B7280' });
  }

  /* --------------------------------------------------------- Filter-Panel */
  function filterZone(ctx, z) {
    var k = ctx.k, f = ctx.c.filter, side = f.side;
    var out = rc(z.x, z.y, z.w, z.h, { fill: '#ECEBE5' });
    if (side === 'right') out += ln(z.x + 0.5, z.y, z.x + 0.5, z.y + z.h, '#E3E1D8', 1);
    else if (side === 'left') out += ln(z.x + z.w - 0.5, z.y, z.x + z.w - 0.5, z.y + z.h, '#E3E1D8', 1);
    else if (side === 'top') out += ln(z.x, z.y + z.h - 0.5, z.x + z.w, z.y + z.h - 0.5, '#E3E1D8', 1);

    var hfs = 11 * k, sfs = 10.5 * k;
    var slH = Math.round(sfs * LH + 10 * k + 2);
    var fields = f.fields || [];
    var head = 'FILTER';

    if (side === 'top') {
      var x = z.x + 16 * k, cy = z.y + z.h / 2;
      out += tx(x, cy + hfs * MID, head, { size: hfs, fill: '#6B7280', ls: 0.66 * k });
      x += textW(head, hfs, null, false, 0.66 * k) + 8 * k;
      var bw = 160 * k;
      fields.forEach(function (fl) {
        if (x + bw > z.x + z.w - 16 * k) return;
        out += slicer(ctx, x, cy - slH / 2, bw, slH, fl.name, sfs);
        x += bw + 8 * k;
      });
      return out;
    }
    var px = z.x + 10 * k, pw = Math.max(20, z.w - 20 * k), y = z.y + 12 * k;
    out += tx(px, y + hfs * ASC, head, { size: hfs, fill: '#6B7280', ls: 0.66 * k });
    y += hfs * LH + 8 * k;
    fields.forEach(function (fl) {
      if (y + slH > z.y + z.h - 6 * k) return;
      out += slicer(ctx, px, y, pw, slH, fl.name, sfs);
      y += slH + 7 * k;
    });
    return out;
  }
  function slicer(ctx, x, y, w, h, name, fs) {
    var k = ctx.k;
    return rc(x + 0.5, y + 0.5, w - 1, h - 1, { r: 4 * k, fill: '#FFFFFF', stroke: '#D9D6CC', sw: 1 }) +
      tx(x + 7 * k, y + h / 2 + fs * MID, fit(name, w - 14 * k, fs), { size: fs, fill: '#374151' });
  }

  /* --------------------------------------------------------------- Kachel */
  function tile(ctx, leaf, idx) {
    var r = leaf.rect, v = leaf.node.visual, k = ctx.k, o = ctx.o;
    var tr = ctx.radius, pad = ctx.pad, ip = Math.max(0, pad - 6);
    var style = ctx.d.tile || 'border';
    var P = ctx.P + 't' + idx + '_';

    if (!v) {
      var tinyE = r.h < 70 * k || r.w < 110 * k;
      var out0 = rc(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, {
        r: tr, fill: 'url(#' + ctx.P + 'empty)', stroke: '#C9C6BA', sw: 1, dash: nm(5 * k) + ' ' + nm(4 * k)
      });
      out0 += tx(r.x + r.w / 2, r.y + r.h / 2 + (tinyE ? 22 * k * MID : -2 * k), '+', { size: 22 * k, anchor: 'middle', fill: '#C9C6BA' });
      if (!tinyE) out0 += tx(r.x + r.w / 2, r.y + r.h / 2 + 16 * k, fit('Visual wählen oder Feld ablegen', r.w - 16 * k, 11 * k), { size: 11 * k, anchor: 'middle', fill: '#8A94A6' });
      return out0;
    }

    var def = ctx.cat[v.kind] || {};
    var tiny = r.h < 70 * k || r.w < 110 * k;
    var link = v.link ? ctx.S.pages.filter(function (pg) { return pg.id === v.link; })[0] : null;
    var chips = [];
    if (o.chips) {
      (def.roles || []).forEach(function (role) {
        ((v.roles || {})[role.key] || []).forEach(function (fl) { chips.push({ t: fl.name, kind: fl.isNew ? 'new' : 'plain' }); });
      });
      if (link) chips.push({ t: '↗ ' + link.name, kind: 'link' });
    }
    var hasNote = !!(o.notes && v.notes);
    var hasBadge = o.badges && !tiny;
    var headH = (v.title || v.sub) ? (tiny ? 18 : 24) * k : 0;
    var footH = (chips.length && !tiny) ? 18 * k : 0;

    /* Kachelflaeche */
    var out = rc(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, {
      r: tr, fill: ctx.tileBg,
      stroke: style === 'border' ? (ctx.dark ? '#3A4756' : '#E1DFD6') : null, sw: 1,
      filter: style === 'shadow' ? ctx.P + 'sh' : null
    });

    /* Kopfzeile */
    if (headH) {
      var tfs = 12 * k, sfs = 9.5 * k;
      var tx0 = r.x + 1 + ip + 9 * k;
      var reserve = (hasBadge || hasNote) ? 58 * k : 12 * k;
      var availW = Math.max(10, r.x + r.w - 1 - ip - reserve - tx0);
      var base = r.y + 1 + ip + 6 * k + tfs * ASC;
      var title = fit(v.title || def.label || v.kind, availW, tfs, 600);
      out += tx(tx0, base, title, { size: tfs, weight: 600, fill: ctx.dark ? '#E6E6E6' : ctx.ink });
      if (v.sub && !tiny) {
        var used = textW(title, tfs, 600) + 6 * k;
        out += tx(tx0 + used, base, fit(v.sub, availW - used, sfs), { size: sfs, fill: ctx.dark ? '#A8B0BC' : '#6B7280' });
      }
    }

    /* Skizze — Masse exakt wie im Tool, damit die small/tiny-Schwellen greifen */
    var bw = Math.max(20, r.w - 2 * pad - 4);
    var bh = Math.max(12, r.h - headH - footH - pad - 6);
    var bx = r.x + (r.w - bw) / 2;
    var by = r.y + 1 + ip + headH + 2;
    var bottom = r.y + r.h - 1 - ip - footH - 4;
    if (by + bh > bottom) by = Math.max(r.y + 1 + ip + headH, bottom - bh);
    var sopt = {
      scenario: v.scenario, seed: (seedOf(leaf.node.id) + o.seedBase) % 1000,
      label: v.sub || '', scale: k, lang: ctx.S.lang,
      palette: ctx.palette, ink: ctx.dark ? '#E6E6E6' : (ctx.d.ink || '#404040'), dark: ctx.dark, paper: ctx.tileBg,
      antiPattern: !!(mk().anti && mk().anti[v.kind])
    };
    try {
      var an = mk().analysisOf ? mk().analysisOf(v) : null;
      if (an) {
        sopt.polarity = an.polarity; sopt.deltaBasis = an.deltaBasis; sopt.unit = an.unit;
        sopt.variance = { abs: (an.deltaKind || []).indexOf('abs') >= 0, rel: (an.deltaKind || []).indexOf('rel') >= 0 };
      }
    } catch (e) { /* Analyse optional */ }
    out += sketchAt(def.sketch || v.kind, bx, by, bw, bh, sopt, P);

    /* Fusszeile mit Rollen-Chips */
    if (footH) {
      var cfs = 8.5 * k, ch = Math.round(cfs * LH + 2);
      var cy2 = r.y + r.h - 1 - ip - 5 * k - ch / 2;
      var cx2 = r.x + 1 + ip + 8 * k, limit = r.x + r.w - 1 - ip - 8 * k;
      chips.forEach(function (c2) {
        var w2 = textW(c2.t, cfs, null, true) + 10 * k + 2;
        if (cx2 + w2 > limit) return;
        out += rc(cx2, cy2 - ch / 2, w2, ch, c2.kind === 'new'
          ? { r: 3 * k, fill: '#FFFFFF', stroke: ctx.accent, sw: 1, dash: nm(2.5 * k) + ' ' + nm(2 * k) }
          : { r: 3 * k, fill: c2.kind === 'link' ? (ctx.dark ? '#28405E' : '#E3ECFA') : (ctx.dark ? '#2A3646' : '#F1F0EA') });
        out += tx(cx2 + 5 * k, cy2 + cfs * MID, c2.t, {
          size: cfs, mono: true,
          fill: c2.kind === 'new' ? ctx.accent : (c2.kind === 'link' ? (ctx.dark ? '#9CC0F5' : '#1F5FBF') : (ctx.dark ? '#C9D1DB' : '#475569'))
        });
        cx2 += w2 + 3 * k;
      });
    }

    /* Badges oben rechts: Engine-Badge und Notiz-Symbol */
    var rx = r.x + r.w - 1 - ip - 6 * k, ty = r.y + 1 + ip + 5 * k;
    if (hasBadge) {
      var bfs = 8.5 * k, bh3 = Math.round(bfs * LH + 2);
      var lab = v.engine === 'ck' ? 'CK' : (v.engine === 'deneb' ? 'Deneb' : (v.engine === 'custom' ? 'CV' : 'PBI'));
      var bw3 = textW(lab, bfs, null, true) + 10 * k + 2;
      out += rc(rx - bw3, ty, bw3, bh3, { r: 3 * k, fill: v.engine === 'ck' ? ctx.accent : (v.engine === 'custom' ? '#1E8F9E' : '#0F1E2E'), opacity: 0.75 });
      out += tx(rx - bw3 / 2, ty + bh3 / 2 + bfs * MID, lab, { size: bfs, mono: true, anchor: 'middle', fill: '#FFFFFF' });
      rx -= bw3 + 3 * k;
    }
    if (hasNote) {
      var nr = 8 * k, ncx = rx - nr, ncy = ty + nr;
      out += '<circle cx="' + nm(ncx) + '" cy="' + nm(ncy) + '" r="' + nm(nr) + '" fill="#FDE7D9"/>';
      out += pencil(ncx, ncy, nr, ctx.accent);
    }
    return out;
  }
  // kleines Stift-Symbol als Pfad (kein Font-Glyph, damit es ueberall gleich aussieht)
  function pencil(cx, cy, r, color) {
    var s = r * 0.95;
    var p = 'M ' + nm(cx - s * 0.62) + ' ' + nm(cy + s * 0.62) +
      ' l ' + nm(s * 0.28) + ' ' + nm(-s * 0.1) +
      ' l ' + nm(s * 0.86) + ' ' + nm(-s * 0.86) +
      ' l ' + nm(-s * 0.18) + ' ' + nm(-s * 0.18) +
      ' l ' + nm(-s * 0.86) + ' ' + nm(s * 0.86) + ' Z';
    return '<path d="' + p + '" fill="' + color + '"/>';
  }

  /* ====================================================================== */
  /*  Oeffentliche API                                                      */
  /* ====================================================================== */
  function pageSvg(pageId, opts) { return build(pageId, opts).svg; }

  function svgToPng(svg, w, h) {
    return new Promise(function (res, rej) {
      var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
          var c2 = cv.getContext('2d');
          c2.drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(function (b) { b ? res(b) : rej(new Error('MK_PNG: canvas.toBlob lieferte nichts.')); }, 'image/png');
        } catch (e) { rej(e); }
      };
      img.onerror = function () { rej(new Error('MK_PNG: SVG liess sich nicht als Bild laden.')); };
      img.src = url;
    });
  }

  function pagePng(pageId, opts) {
    var o = norm(opts);
    var M = mk(), S = M.state;
    var w = Math.round(S.canvas.w * o.scale), h = Math.round(S.canvas.h * o.scale);
    var r = build(pageId, opts, w, h);
    return svgToPng(r.svg, w, h);
  }

  function allPagesPng(opts) {
    var M = mk(), pages = M.state.pages.slice();
    var out = [];
    return pages.reduce(function (chain, p, i) {
      return chain.then(function () {
        return pagePng(p.id, opts).then(function (blob) {
          out.push({
            page: { id: p.id, name: p.name, index: i + 1 },
            blob: blob,
            fileName: 'page-' + (i + 1) + '-' + slug(p.name) + '.png'
          });
        });
      });
    }, Promise.resolve()).then(function () { return out; });
  }

  function download(blob, fileName) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName || 'mockup.png';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  root.MK_PNG = {
    pageSvg: pageSvg,
    pagePng: pagePng,
    allPagesPng: allPagesPng,
    download: download,
    // Zusatz, praktisch fuer Tests und Vorschauen
    svgToPng: svgToPng,
    slug: slug
  };
}(typeof window !== 'undefined' ? window : this));
