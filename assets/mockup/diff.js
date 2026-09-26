/* MockupKitchen · Stände vergleichen (v0.4.7, Fachsprache ab v0.5.2)
   Vergleicht zwei Stände desselben Mockups: eine gespeicherte Datei (Speichern = Zustand, oder Export = mockup-spec.json)
   gegen den aktuellen Stand. Ergebnis: neue, entfernte, geänderte Kacheln je Seite, dazu Seiten, Zonen und Design.
   v0.5.2: Werte in Fachsprache (Status, Engine, Visual-Typ, Rollen, Analyse, Verhalten, Zielseite statt Seiten-ID,
   Position als Rechteck statt Baumpfad), alle Design-Felder (Ecken, Farben, Abstände, Typografie), Seiten über die ID
   (Umbenennen zählt einmal, nicht je Kachel), Anführungszeichen je Sprache, Markdown-Kopie ohne interne IDs.
   Reine Funktionen ohne DOM-Zugriff (bis auf render → HTML-String); Node-testbar (diff-test.js). */
(function (root) {
  'use strict';

  var TYPO_DEF = { scale: 1, title: 12, sub: 9.5, chart: 9 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Markdown-Kopie: Nutzertext entschärfen (kein rohes HTML, kein Link), lesbar bleiben; wie mdText in export.js
  function md(s) {
    return String(s == null ? '' : s)
      .replace(/<(?=[A-Za-z\/!?])/g, '&lt;')
      .replace(/(\\*)\[(?=[^\]\n]*\]\()/g, function (m, bs) { return bs + bs + '\\['; });
  }
  function same(a, b) { return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b); }
  function refOf(f) {
    if (!f) return '';
    if (typeof f === 'string') return f;
    if (f.ref) return String(f.ref);
    if (f.table && f.name) return f.table + '.' + f.name;
    return f.name || f.field || '';
  }
  function flatRoles(roles) {
    var out = {};
    Object.keys(roles || {}).forEach(function (k) { var l = roles[k]; if (Array.isArray(l) && l.length) out[k] = l.map(refOf).filter(Boolean); });
    return out;
  }
  function samplesOf(x) {
    if (!x) return null;
    var c = x.categories || x.cats, v = x.values, r = x.refValues || x.ref;
    var toArr = function (a) { return Array.isArray(a) ? a : (typeof a === 'string' ? a.split(/[\n;\t,]+/).map(function (s) { return s.trim(); }).filter(Boolean) : []); };
    var o = { categories: toArr(c), values: toArr(v), refValues: toArr(r) };
    return (o.categories.length || o.values.length || o.refValues.length) ? o : null;
  }
  function upper(s) { return s ? String(s).toUpperCase() : ''; }

  // ---- Normalisierung ----------------------------------------------------
  // Analyse: nur echte Entscheidungen (auto-Werte sind Vorschläge), gleiche Form für Zustand und Spec
  function normAnalysis(a, fromSpecFile) {
    a = a || {}; var o = {};
    var pol = fromSpecFile ? (a.polarityAuto ? '' : a.polarity) : a.polarity;
    if (pol === 'higher' || pol === 'lower') o.polarity = pol;
    var db = fromSpecFile ? (a.deltaBasisAuto ? '' : a.deltaBasis) : a.deltaBasis;
    if (db) o.deltaBasis = db;
    if (Array.isArray(a.deltaKind)) { var dk = a.deltaKind.slice().sort(); if (dk.join(',') !== 'abs,rel') o.deltaKind = dk; }
    if (a.sort && a.sort.by && a.sort.by !== 'none') o.sort = { by: a.sort.by, dir: a.sort.dir || 'desc' };
    if (a.topN) o.topN = a.topN;
    if (a.unit) o.unit = a.unit;
    if (a.displayUnits && a.displayUnits !== 'auto') o.displayUnits = a.displayUnits;
    if (a.decimals != null && a.decimals !== '') o.decimals = a.decimals;
    if (a.timeGrain && a.timeGrain !== 'none') o.timeGrain = a.timeGrain;
    if (a.cumulative) o.cumulative = true;
    if (a.scaleGroup) o.scaleGroup = a.scaleGroup;
    if (a.message) o.message = a.message;
    if (a.smallMultiples) o.smallMultiples = true;
    if (a.fieldParam) { o.fieldParam = true; var fpn = fromSpecFile ? a.fieldParam.name : a.fieldParamName; if (fpn) o.fieldParamName = fpn; }
    return o;
  }
  function normInteraction(it) { it = it || {}; return { drillDown: !!it.drillDown, crossFilter: it.crossFilter !== false }; }
  // Rechteck je Kachel ohne Geometrie aus app.js: Anteile am Inhaltsbereich in % (Zwischenräume ignoriert)
  function sum(a) { return a.reduce(function (x, y) { return x + (+y || 0); }, 0); }
  function fracRects(node, r, out) {
    if (!node) return;
    if (node.type === 'leaf') { out[node.id] = r; return; }
    if (node.type === 'grid') {
      var cs = node.cols || [], rs = node.rows || [], ct = sum(cs) || 1, rt = sum(rs) || 1;
      (node.children || []).forEach(function (cell) {
        var x0 = sum(cs.slice(0, cell.c)) / ct, x1 = sum(cs.slice(0, cell.c + (cell.cs || 1))) / ct;
        var y0 = sum(rs.slice(0, cell.r)) / rt, y1 = sum(rs.slice(0, cell.r + (cell.rs || 1))) / rt;
        fracRects(cell.node, { x: r.x + r.w * x0, y: r.y + r.h * y0, w: r.w * (x1 - x0), h: r.h * (y1 - y0) }, out);
      });
      return;
    }
    var ch = node.children || [], total = sum(ch.map(function (c) { return c.size; })) || 1, pos = 0;
    ch.forEach(function (c) {
      var f = (+c.size || 0) / total;
      fracRects(c.node, node.dir === 'row' ? { x: r.x + r.w * pos, y: r.y, w: r.w * f, h: r.h } : { x: r.x, y: r.y + r.h * pos, w: r.w, h: r.h * f }, out);
      pos += f;
    });
  }
  function pct(r) { return { x: Math.round(r.x * 100), y: Math.round(r.y * 100), w: Math.round(r.w * 100), h: Math.round(r.h * 100), unit: '%' }; }
  function walk(node, fn) {
    if (!node) return;
    if (node.type === 'leaf') { fn(node); return; }
    (node.children || []).forEach(function (ch) { walk(ch.node, fn); });
  }
  // opts.rects(page) → { leafId: {x,y,w,h} } in px (app.js: computeAll mit dem aktuellen Chrome, damit Zonenänderungen
  // nicht jede Kachel verschieben); ohne opts oder bei Fehler: Anteile in %.
  function fromState(S, opts) {
    opts = opts || {};
    var c = S.chrome || {}, d = S.design || {}, sp = S.spacing || {};
    var pages = (S.pages || []).map(function (p) { return { id: p.id, name: p.name }; });
    var pageName = {}; pages.forEach(function (p) { pageName[p.id] = p.name; });
    var items = [];
    (S.pages || []).forEach(function (p) {
      var rects = null;
      if (typeof opts.rects === 'function') { try { rects = opts.rects(p); } catch (e) { rects = null; } }
      var frac = null;
      if (!rects) { frac = {}; fracRects(p.layout, { x: 0, y: 0, w: 1, h: 1 }, frac); }
      walk(p.layout, function (leaf) {
        if (!leaf.visual) return; var v = leaf.visual;
        var r = rects ? rects[leaf.id] : frac[leaf.id];
        var target = v.link && pageName[v.link] != null ? v.link : '';
        items.push({
          id: 'mk_' + leaf.id, page: p.name, pageId: p.id, kind: v.kind, engine: v.engine || '', title: v.title || '',
          fields: flatRoles(v.roles), analysis: normAnalysis(v.analysis, false), priority: v.priority || '', status: v.status || 'open',
          notes: v.notes || '', openQuestion: !!v.openQuestion, interaction: normInteraction(v.interaction),
          link: target, linkName: target ? pageName[target] : '', content: v.content || '',
          pos: r ? (rects ? { x: r.x, y: r.y, w: r.w, h: r.h, unit: 'px' } : pct(r)) : null, samples: samplesOf(v.samples)
        });
      });
    });
    var h = c.header || {}, f = c.filter || {}, n = c.nav || {}, ft = c.footer || {};
    var zones = {
      header: h.on === false ? null : { title: h.title || '', sub: h.sub || '', logo: h.logoPos || (h.logo === false ? 'none' : 'left') },
      navPos: c.navPos || (h.navOn === false ? 'off' : 'header'),
      nav: n.on ? {} : null,
      filter: !f.on ? null : { mode: f.side || 'right', collapsible: f.side === 'burger' || !!f.collapsible, slicers: (f.fields || []).map(function (x) { return { ref: refOf(x), type: x.type || 'dropdown', def: x.default || '' }; }) },
      footer: ft.on ? { text: ft.text || '' } : null
    };
    var ty = Object.assign({}, TYPO_DEF, d.typo || {});
    var design = {
      palette: d.palette || 'teal', nativePalette: d.nativePalette || 'neutral', tile: d.tile || 'border', radius: d.radius == null ? 8 : +d.radius,
      pageBg: d.pageBg === 'custom' ? upper(d.pageBgHex || '#F4F4F1') : (d.pageBg || 'light'), tileBg: upper(d.tileBg || '#FFFFFF'), ink: upper(d.ink || '#0F1E2E'),
      headerStyle: d.header || 'light', headerBg: d.header === 'custom' ? upper(d.headerBg || '#0F1E2E') : '', headerInk: d.header === 'custom' ? upper(d.headerInk || '#FFFFFF') : '',
      accent: upper(d.accent), margin: sp.margin == null ? '' : +sp.margin, gutter: sp.gutter == null ? '' : +sp.gutter, pad: sp.pad == null ? '' : +sp.pad,
      typoScale: +ty.scale, typoTitle: +ty.title, typoSub: +ty.sub, typoChart: +ty.chart
    };
    return { source: 'state', name: S.name || '', canvas: S.canvas ? S.canvas.w + '×' + S.canvas.h : '', pages: pages, items: items, zones: zones, design: design };
  }
  function linkOf(l) {
    if (!l) return { id: '', name: '' };
    if (typeof l === 'string') return { id: l, name: l };
    return { id: String(l.pageId || l.toPageId || l.toPage || l.pageName || ''), name: String(l.pageName || l.toPage || l.pageId || '') };
  }
  function fromSpec(spec) {
    var pages = (spec.pages || []).map(function (p) { return { id: p.id || p.name, name: p.name }; });
    var items = [];
    (spec.pages || []).forEach(function (p) {
      (p.visuals || []).forEach(function (v) {
        var w = v.workshop || {}; var r = v.rect || {}; var lk = linkOf(v.link);
        items.push({
          id: v.id, page: p.name, pageId: p.id || p.name, kind: v.kind, engine: v.engine || '', title: v.title || '',
          fields: flatRoles(v.roles), analysis: normAnalysis(v.analysis, true), priority: w.priority || v.priority || '', status: w.status || v.status || 'open',
          notes: v.notes || w.notes || '', openQuestion: !!(w.openQuestion || v.openQuestion), interaction: normInteraction(v.interaction),
          link: lk.id, linkName: lk.name, content: v.content || '',
          pos: (r.x != null) ? { x: r.x, y: r.y, w: r.w, h: r.h, unit: 'px' } : null, samples: samplesOf(v.samples)
        });
      });
    });
    var z = spec.zones || {}; var h = z.header || null, f = z.filter || null, n = z.nav || null, ft = z.footer || null;
    var zones = {
      header: h ? { title: h.title || '', sub: h.subtitle || '', logo: h.logoPos || 'left' } : null,
      navPos: (h && h.navPosition) || (ft && ft.navPosition) || (h ? (h.navOn === false ? 'off' : 'header') : 'off'),
      nav: n ? {} : null,
      filter: f ? { mode: f.mode || f.side || 'right', collapsible: !!f.collapsible, slicers: (f.slicers || []).map(function (x) { return { ref: refOf(x), type: x.type || 'dropdown', def: x.default || '' }; }) } : null,
      footer: ft ? { text: ft.text || '' } : null
    };
    var d = spec.design || {}, col = d.colors || {}, ty = Object.assign({}, TYPO_DEF, d.typography || {}), base = (spec.spacing && spec.spacing.base) || {};
    var design = {
      palette: d.variancePalette || d.palette || 'teal', nativePalette: d.nativePalette || 'neutral', tile: d.tileStyle || 'border', radius: d.cornerRadius == null ? '' : +d.cornerRadius,
      pageBg: upper(d.pageBackground), tileBg: upper(d.tileBackground || col.tileBackground), ink: upper(col.ink),
      headerStyle: d.headerStyle || 'light', headerBg: d.headerStyle === 'custom' ? upper(col.headerBackground) : '', headerInk: d.headerStyle === 'custom' ? upper(col.headerInk) : '',
      accent: upper(d.accent), margin: base.margin == null ? '' : +base.margin, gutter: base.gutter == null ? '' : +base.gutter, pad: base.tilePadding == null ? '' : +base.tilePadding,
      typoScale: +ty.scale, typoTitle: +ty.title, typoSub: +ty.sub, typoChart: +ty.chart
    };
    var cv = spec.canvas || (spec.report && spec.report.canvas) || {};
    var cw = cv.width || cv.w, chh = cv.height || cv.h;
    return { source: 'spec', name: (spec.report && spec.report.name) || spec.name || '', canvas: cw ? cw + '×' + chh : '', pages: pages, items: items, zones: zones, design: design };
  }
  function from(json, opts) {
    if (!json || typeof json !== 'object') return null;
    if (json.meta && json.meta.specVersion) return fromSpec(json);
    if (json.pages && json.canvas) return fromState(json, opts);
    return null;
  }

  // ---- Vergleich ----------------------------------------------------------
  function compare(older, newer) {
    var res = { added: [], removed: [], changed: [], pages: [], zones: [], design: [], counts: {}, source: newer.source };
    var byId = {}; older.items.forEach(function (it) { byId[it.id] = it; });
    var seen = {};
    newer.items.forEach(function (it) {
      var o = byId[it.id];
      if (!o) { res.added.push(it); return; }
      seen[it.id] = true;
      var det = [];
      var cmp = function (what, a, b) { if (!same(a, b)) det.push({ what: what, before: a, after: b, kind: it.kind }); };
      // Seite über die stabile ID: Umbenennen der Seite ist keine Änderung der Kachel (steht einmal unter „Seiten")
      if (o.pageId !== it.pageId) det.push({ what: 'page', before: o.page, after: it.page, kind: it.kind });
      cmp('kind', o.kind, it.kind); cmp('engine', o.engine, it.engine); cmp('title', o.title, it.title);
      // Felder und Analyse je Rolle bzw. Angabe, damit nur das Geänderte dasteht
      var rk = {}; Object.keys(o.fields || {}).concat(Object.keys(it.fields || {})).forEach(function (k) { rk[k] = true; });
      Object.keys(rk).forEach(function (k) { cmp('role.' + k, (o.fields || {})[k] || [], (it.fields || {})[k] || []); });
      var ak = {}; Object.keys(o.analysis || {}).concat(Object.keys(it.analysis || {})).forEach(function (k) { ak[k] = true; });
      Object.keys(ak).forEach(function (k) { cmp('an.' + k, (o.analysis || {})[k], (it.analysis || {})[k]); });
      cmp('priority', o.priority, it.priority); cmp('status', o.status, it.status);
      cmp('notes', o.notes, it.notes); cmp('openQuestion', o.openQuestion, it.openQuestion); cmp('interaction', o.interaction, it.interaction);
      // Sprungziel über die Seiten-ID, angezeigt wird der Seitenname
      if (o.link !== it.link) det.push({ what: 'link', before: o.linkName, after: it.linkName, kind: it.kind });
      cmp('content', o.content, it.content); cmp('samples', o.samples, it.samples);
      // Position nur bei gleicher Quelle und Einheit (px aus app.js oder Anteile in %), sonst wäre jede Kachel „verschoben"
      if (older.source === newer.source && o.pos && it.pos && o.pos.unit === it.pos.unit) cmp('position', o.pos, it.pos);
      if (det.length) res.changed.push({ item: it, before: o, details: det });
    });
    older.items.forEach(function (it) { if (!seen[it.id]) res.removed.push(it); });
    // Kommt auf einer Seite eine Kachel dazu oder fällt weg, verteilt sich der Rest neu. Diese Folgeverschiebung ist keine
    // eigene Änderung der Nachbarn: je Seite nur gezählt (res.reflow), nicht als „geändert" gelistet.
    var structural = {}; res.added.forEach(function (it) { structural[it.pageId] = true; }); res.removed.forEach(function (it) { structural[it.pageId] = true; });
    res.reflow = {};
    res.changed = res.changed.filter(function (c) {
      if (!structural[c.item.pageId] || !c.details.some(function (d) { return d.what === 'position'; })) return true;
      c.details = c.details.filter(function (d) { return d.what !== 'position'; });
      res.reflow[c.item.page] = (res.reflow[c.item.page] || 0) + 1;
      return c.details.length > 0;
    });
    // Seiten
    var op = {}; older.pages.forEach(function (p) { op[p.id] = p; });
    var np = {}; newer.pages.forEach(function (p) { np[p.id] = p; });
    newer.pages.forEach(function (p) { if (!op[p.id]) res.pages.push({ type: 'added', name: p.name }); else if (op[p.id].name !== p.name) res.pages.push({ type: 'renamed', name: p.name, before: op[p.id].name }); });
    older.pages.forEach(function (p) { if (!np[p.id]) res.pages.push({ type: 'removed', name: p.name }); });
    // Zonen und Design
    Object.keys(newer.zones).forEach(function (k) { if (!same(older.zones[k], newer.zones[k])) res.zones.push({ what: k, before: older.zones[k], after: newer.zones[k] }); });
    Object.keys(newer.design).forEach(function (k) { if (!same(older.design[k], newer.design[k])) res.design.push({ what: k, before: older.design[k], after: newer.design[k] }); });
    if (older.canvas && newer.canvas && older.canvas !== newer.canvas) res.design.push({ what: 'canvas', before: older.canvas, after: newer.canvas });
    res.counts = { added: res.added.length, removed: res.removed.length, changed: res.changed.length, pages: res.pages.length, zones: res.zones.length, design: res.design.length };
    res.counts.total = res.counts.added + res.counts.removed + res.counts.changed + res.counts.pages + res.counts.zones + res.counts.design;
    return res;
  }

  // ---- Darstellung (Fachsprache über die i18n-Schlüssel der Oberfläche) --------------------
  // tr: Übersetzung mit Rückfallwert, wenn t fehlt oder den Schlüssel nicht kennt (t gibt dann den Schlüssel zurück)
  function tr(t, key, vars, fb) { var s = t ? t(key, vars) : null; return (s != null && s !== key) ? s : fb; }
  function label(t, key) { return tr(t, 'diff.' + key, null, key); }
  function quote(t, s) { return tr(t, 'exp.quote', { t: s }, '„' + s + '"'); }
  function fmt(v) {
    if (v === null || v === undefined || v === '') return '–';
    if (typeof v === 'boolean') return v ? '✓' : '–';
    if (Array.isArray(v)) return v.map(fmt).join(', ') || '–';
    if (typeof v === 'object') return Object.keys(v).map(function (k) { return k + ': ' + fmt(v[k]); }).join(' · ') || '–';
    return String(v);
  }
  function kindName(t, kind) { return tr(t, 'viz.' + kind + '.label', null, kind || ''); }
  function roleName(t, kind, key) {
    var C = root.MK_CATALOG; var def = C && C.byId && C.byId[kind];
    var r = def && (def.roles || []).filter(function (x) { return x.key === key; })[0];
    if (r && r.label) return r.label;
    return tr(t, 'role.' + key, null, key);
  }
  function rectText(r) { return r ? 'x ' + r.x + ' · y ' + r.y + ' · ' + r.w + ' × ' + r.h + ' ' + (r.unit || 'px') : '–'; }
  function anValue(t, key, v) {
    if (v === null || v === undefined || v === '') return '–';
    switch (key) {
      case 'polarity': return tr(t, 'opt.polarity.' + v, null, v);
      case 'deltaKind': return v.length ? v.map(function (k) { return k === 'rel' ? '%' : k; }).join(' + ') : '–';
      case 'sort': return tr(t, 'opt.sort.' + v.by, null, v.by) + ', ' + tr(t, 'opt.sort.' + v.dir, null, v.dir);
      case 'displayUnits': return tr(t, 'opt.du.' + v, null, v);
      case 'timeGrain': return tr(t, 'opt.grain.' + v, null, v);
      default: return fmt(v);
    }
  }
  var ZONE_FMT = {
    header: function (t, v) { return [v.title ? quote(t, v.title) : '', v.sub, tr(t, 'opt.logo.' + v.logo, null, '')].filter(Boolean).join(' · ') || tr(t, 'diff.on', null, 'on'); },
    navPos: function (t, v) { return tr(t, 'opt.navPos.' + v, null, v); },
    nav: function (t) { return tr(t, 'diff.on', null, 'on'); },
    filter: function (t, v) {
      var head = tr(t, 'opt.filter.' + v.mode, null, v.mode) + (v.collapsible && v.mode !== 'burger' ? ' · ' + tr(t, 'lbl.filterCollapsible', null, 'collapsible') : '');
      var sl = (v.slicers || []).map(function (s) { return s.ref + ' (' + tr(t, 'opt.slicer.' + s.type, null, s.type) + ')' + (s.def ? ' = ' + s.def : ''); });
      return head + (sl.length ? ': ' + sl.join(', ') : '');
    },
    footer: function (t, v) { return v.text ? quote(t, v.text) : tr(t, 'diff.on', null, 'on'); }
  };
  var px = function (t, v) { return v + ' px'; };
  var DESIGN_FMT = {
    palette: function (t, v) { return tr(t, 'opt.pal.' + v, null, v); },
    nativePalette: function (t, v) { return tr(t, 'smp.' + v, null, v); },
    tile: function (t, v) { return tr(t, 'opt.tile.' + v, null, v); },
    // Zustand: Basiswert wie im Auswahlfeld (eckig, gerundet 8 px …); Spec: skalierte px
    radius: function (t, v, ctx) { return ctx.source === 'state' ? tr(t, 'opt.radius.r' + v, null, v + ' px') : v + ' px'; },
    pageBg: function (t, v) { return v.charAt(0) === '#' ? v : tr(t, 'opt.bg.' + v, null, v); },
    headerStyle: function (t, v) { return tr(t, 'opt.hdr.' + v, null, v); },
    margin: px, gutter: px, pad: px, typoTitle: px, typoSub: px, typoChart: px,
    typoScale: function (t, v) { return Math.round(v * 100) + ' %'; },
    canvas: function (t, v) { return String(v).replace('×', ' × ') + ' px'; }
  };
  // Wert eines Details in Fachsprache; ctx = { section: 'item'|'zone'|'design', kind, source }
  function valueText(t, what, v, ctx) {
    ctx = ctx || {};
    if (ctx.section === 'zone') return v == null ? tr(t, 'diff.off', null, 'off') : (ZONE_FMT[what] ? ZONE_FMT[what](t, v) : fmt(v));
    if (v === null || v === undefined || v === '') return '–';
    if (ctx.section === 'design') return DESIGN_FMT[what] ? DESIGN_FMT[what](t, v, ctx) : fmt(v);
    if (what.indexOf('an.') === 0) return anValue(t, what.slice(3), v);
    if (what.indexOf('role.') === 0) return fmt(v);
    switch (what) {
      case 'kind': return kindName(t, v);
      case 'engine': return tr(t, 'engine.' + v, null, v);
      case 'status': return tr(t, 'opt.status.' + v, null, v);
      case 'priority': return tr(t, 'opt.pri.' + v, null, v);
      case 'interaction': {
        var l = [];
        if (v.drillDown) l.push(tr(t, 'exp.an.drillDown', null, 'drill-down'));
        if (v.crossFilter === false) l.push(tr(t, 'exp.an.noCross', null, 'no cross-filter'));
        return l.join(' · ') || '–';
      }
      case 'samples': return [['categories', 'smp.cats'], ['values', 'smp.values'], ['refValues', 'smp.ref']].filter(function (x) { return (v[x[0]] || []).length; })
        .map(function (x) { return tr(t, x[1], null, x[0]) + ': ' + v[x[0]].join(', '); }).join(' · ') || '–';
      case 'position': return rectText(v);
      default: return fmt(v);
    }
  }
  function detLabel(t, what, kind) {
    if (what.indexOf('an.') === 0) return label(t, 'analysis') + ' · ' + tr(t, 'lbl.' + what.slice(3), null, what.slice(3));
    if (what.indexOf('role.') === 0) return label(t, 'fields') + ' · ' + roleName(t, kind, what.slice(5));
    return label(t, what);
  }
  function fieldsText(t, it) { return Object.keys(it.fields || {}).map(function (k) { return roleName(t, it.kind, k) + ': ' + it.fields[k].join(', '); }).join(' · '); }
  function groupByPage(list, getPage) {
    var g = {}; var order = [];
    list.forEach(function (x) { var p = getPage(x); if (!g[p]) { g[p] = []; order.push(p); } g[p].push(x); });
    return order.map(function (p) { return { page: p, items: g[p] }; });
  }
  function entries(res) {
    var all = [];
    res.added.forEach(function (it) { all.push({ page: it.page, type: 'added', it: it }); });
    res.removed.forEach(function (it) { all.push({ page: it.page, type: 'removed', it: it }); });
    res.changed.forEach(function (c) { all.push({ page: c.item.page, type: 'changed', it: c.item, details: c.details }); });
    var groups = groupByPage(all, function (x) { return x.page; });
    Object.keys(res.reflow || {}).forEach(function (p) {
      var g = groups.filter(function (x) { return x.page === p; })[0];
      if (!g) { g = { page: p, items: [] }; groups.push(g); }
      g.reflow = res.reflow[p];
    });
    return groups;
  }
  function reflowText(t, n) { return tr(t, 'diff.reflow', { n: n }, n + ' tile(s) moved or resized by added or removed tiles'); }
  function render(res, t) {
    if (!res.counts.total) return '<p class="diff-none">' + esc(label(t, 'none')) + '</p>';
    var src = { source: res.source };
    var h = '<div class="diff-sum">' + ['added', 'removed', 'changed'].map(function (k) { return '<span class="diff-pill ' + k + '">' + res.counts[k] + ' ' + esc(label(t, k)) + '</span>'; }).join('') + '</div>';
    entries(res).forEach(function (grp) {
      h += '<h3>' + esc(label(t, 'page')) + ' ' + esc(quote(t, grp.page)) + '</h3><ul class="diff-list">';
      grp.items.forEach(function (x) {
        var name = x.it.title || kindName(t, x.it.kind); var tag = '<span class="diff-tag ' + x.type + '">' + esc(label(t, x.type)) + '</span>';
        var ft = fieldsText(t, x.it);
        // ID bleibt klein und grau zur Rückverfolgung (Export, Brief); die Markdown-Kopie lässt sie weg
        h += '<li>' + tag + ' <strong>' + esc(name) + '</strong> <span class="mono diff-mute">' + esc(x.it.id) + '</span>';
        if (x.type !== 'changed') h += ' <span class="diff-mute">' + esc(kindName(t, x.it.kind)) + (ft ? ' · ' + esc(ft) : '') + '</span>';
        if (x.details) h += '<ul class="diff-det">' + x.details.map(function (d) { var c = { section: 'item', kind: d.kind, source: res.source }; return '<li><em>' + esc(detLabel(t, d.what, d.kind)) + '</em>: <s>' + esc(valueText(t, d.what, d.before, c)) + '</s> → ' + esc(valueText(t, d.what, d.after, c)) + '</li>'; }).join('') + '</ul>';
        h += '</li>';
      });
      if (grp.reflow) h += '<li class="diff-mute">' + esc(reflowText(t, grp.reflow)) + '</li>';
      h += '</ul>';
    });
    if (res.pages.length) h += '<h3>' + esc(label(t, 'pages')) + '</h3><ul class="diff-list">' + res.pages.map(function (p) { return '<li><span class="diff-tag ' + (p.type === 'renamed' ? 'changed' : p.type) + '">' + esc(label(t, p.type)) + '</span> ' + (p.before ? '<s>' + esc(p.before) + '</s> → ' : '') + '<strong>' + esc(p.name) + '</strong></li>'; }).join('') + '</ul>';
    [['zones', 'zone'], ['design', 'design']].forEach(function (sec) {
      var list = res[sec[0]]; if (!list.length) return;
      var c = { section: sec[1], source: src.source };
      h += '<h3>' + esc(label(t, sec[0])) + '</h3><ul class="diff-det">' + list.map(function (d) { return '<li><em>' + esc(label(t, d.what)) + '</em>: <s>' + esc(valueText(t, d.what, d.before, c)) + '</s> → ' + esc(valueText(t, d.what, d.after, c)) + '</li>'; }).join('') + '</ul>';
    });
    return h;
  }
  // Markdown für Fachbereiche: ohne interne mk_-IDs, Nutzertext entschärft
  function markdown(res, t, names) {
    names = names || {};
    var out = ['# ' + label(t, 'mdTitle'), '', md(names.older || 'A') + ' → ' + md(names.newer || 'B'), ''];
    if (!res.counts.total) { out.push(label(t, 'none')); return out.join('\n'); }
    out.push('- ' + res.counts.added + ' ' + label(t, 'added') + ' · ' + res.counts.removed + ' ' + label(t, 'removed') + ' · ' + res.counts.changed + ' ' + label(t, 'changed'), '');
    entries(res).forEach(function (grp) {
      out.push('## ' + label(t, 'page') + ' ' + md(quote(t, grp.page)), '');
      grp.items.forEach(function (x) {
        var ft = fieldsText(t, x.it);
        out.push('- **' + label(t, x.type) + '** ' + md(x.it.title || kindName(t, x.it.kind)) + (x.type !== 'changed' ? ' (' + md(kindName(t, x.it.kind)) + (ft ? ' · ' + md(ft) : '') + ')' : ''));
        (x.details || []).forEach(function (d) { var c = { section: 'item', kind: d.kind, source: res.source }; out.push('  - ' + detLabel(t, d.what, d.kind) + ': ~~' + md(valueText(t, d.what, d.before, c)) + '~~ → ' + md(valueText(t, d.what, d.after, c))); });
      });
      if (grp.reflow) out.push('- ' + reflowText(t, grp.reflow));
      out.push('');
    });
    if (res.pages.length) { out.push('## ' + label(t, 'pages'), ''); res.pages.forEach(function (p) { out.push('- ' + label(t, p.type) + ': ' + (p.before ? '~~' + md(p.before) + '~~ → ' : '') + md(p.name)); }); out.push(''); }
    [['zones', 'zone'], ['design', 'design']].forEach(function (sec) {
      var list = res[sec[0]]; if (!list.length) return;
      var c = { section: sec[1], source: res.source };
      out.push('## ' + label(t, sec[0]), ''); list.forEach(function (d) { out.push('- ' + label(t, d.what) + ': ~~' + md(valueText(t, d.what, d.before, c)) + '~~ → ' + md(valueText(t, d.what, d.after, c))); }); out.push('');
    });
    return out.join('\n');
  }

  var api = { from: from, fromState: fromState, fromSpec: fromSpec, compare: compare, render: render, markdown: markdown, samplesOf: samplesOf, valueText: valueText };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MK_DIFF = api;
})(typeof window !== 'undefined' ? window : globalThis);
