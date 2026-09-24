/* MockupKitchen · Stände vergleichen (v0.4.7)
   Vergleicht zwei Stände desselben Mockups: eine gespeicherte Datei (Speichern = Zustand, oder Export = mockup-spec.json)
   gegen den aktuellen Stand. Ergebnis: neue, entfernte, geänderte Kacheln je Seite, dazu Seiten, Zonen und Design.
   Reine Funktionen ohne DOM-Zugriff (bis auf render → HTML-String); Node-testbar. */
(function (root) {
  'use strict';

  var ANALYSIS_KEYS = ['polarity', 'deltaBasis', 'deltaKind', 'sort', 'sortDir', 'topN', 'unit', 'displayUnits', 'smallMultiples', 'fieldParam', 'fieldParamName'];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function same(a, b) { return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b); }
  function pick(o, keys) { var r = {}; keys.forEach(function (k) { if (o && o[k] !== undefined && o[k] !== null && o[k] !== '' && o[k] !== false) r[k] = o[k]; }); return r; }
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

  // ---- Normalisierung ----------------------------------------------------
  function walk(node, path, fn) {
    if (!node) return;
    if (node.type === 'leaf') { fn(node, path); return; }
    (node.children || []).forEach(function (ch, i) { walk(ch.node, path.concat(i), fn); });
  }
  function fromState(S) {
    var c = S.chrome || {}, d = S.design || {};
    var pages = (S.pages || []).map(function (p) { return { id: p.id, name: p.name }; });
    var items = [];
    (S.pages || []).forEach(function (p) {
      walk(p.layout, [], function (leaf, path) {
        if (!leaf.visual) return; var v = leaf.visual; var an = v.analysis || {};
        items.push({
          id: 'mk_' + leaf.id, page: p.name, pageId: p.id, kind: v.kind, engine: v.engine || '', title: v.title || '',
          fields: flatRoles(v.roles), analysis: pick(an, ANALYSIS_KEYS), priority: v.priority || '', status: v.status || 'open',
          notes: v.notes || '', openQuestion: !!v.openQuestion, interaction: pick(v.interaction || {}, ['drillDown', 'crossFilter', 'drillThrough']),
          link: v.link || '', content: v.content || '', pos: path.join('.'), samples: samplesOf(v.samples)
        });
      });
    });
    var h = c.header || {}, f = c.filter || {}, n = c.nav || {}, ft = c.footer || {};
    var zones = {
      header: h.on === false ? 'off' : ('on · ' + (h.title || '') + (h.sub ? ' · ' + h.sub : '') + ' · nav:' + (c.navPos || (h.navOn === false ? 'off' : 'header'))),
      nav: n.on ? 'on' : 'off',
      filter: f.on === false || !f.on ? 'off' : ('on · ' + (f.side || '') + ' · ' + (f.fields || []).map(function (x) { return refOf(x) + (x.type ? ' (' + x.type + ')' : ''); }).join(', ')),
      footer: ft.on ? ('on · ' + (ft.text || '')) : 'off'
    };
    var design = { palette: d.palette || 'teal', nativePalette: d.nativePalette || 'neutral', tile: d.tile || '', pageBg: d.pageBg || '', header: d.header || '', accent: d.accent || '', typo: d.typo ? JSON.stringify(d.typo) : '' };
    return { source: 'state', name: S.name || '', canvas: S.canvas ? S.canvas.w + '×' + S.canvas.h : '', pages: pages, items: items, zones: zones, design: design };
  }
  function fromSpec(spec) {
    var pages = (spec.pages || []).map(function (p) { return { id: p.id || p.name, name: p.name }; });
    var items = [];
    (spec.pages || []).forEach(function (p) {
      (p.visuals || []).forEach(function (v) {
        var w = v.workshop || {}; var an = v.analysis || {}; var r = v.rect || {};
        items.push({
          id: v.id, page: p.name, pageId: p.id || p.name, kind: v.kind, engine: v.engine || '', title: v.title || '',
          fields: flatRoles(v.roles), analysis: pick(an, ANALYSIS_KEYS), priority: w.priority || v.priority || '', status: w.status || v.status || 'open',
          notes: w.notes || v.notes || '', openQuestion: !!(w.openQuestion || v.openQuestion), interaction: pick(v.interaction || {}, ['drillDown', 'crossFilter', 'drillThrough']),
          link: (v.link && (v.link.toPage || v.link)) || '', content: v.content || '', pos: (r.x != null) ? (r.x + ',' + r.y + ' ' + r.w + '×' + r.h) : '', samples: samplesOf(v.samples)
        });
      });
    });
    var z = spec.zones || {}; var h = z.header || null, f = z.filter || null, n = z.nav || null, ft = z.footer || null;
    var zones = {
      header: h ? ('on · ' + (h.title || '') + (h.subtitle ? ' · ' + h.subtitle : '') + ' · nav:' + (h.navPosition || (h.navOn === false ? 'off' : 'header'))) : 'off',
      nav: n ? 'on' : 'off',
      filter: f ? ('on · ' + (f.mode || f.side || '') + ' · ' + (f.slicers || []).map(function (x) { return refOf(x) + (x.type ? ' (' + x.type + ')' : ''); }).join(', ')) : 'off',
      footer: ft ? ('on · ' + (ft.text || '')) : 'off'
    };
    var d = spec.design || {};
    var design = { palette: d.variancePalette || d.palette || 'teal', nativePalette: d.nativePalette || 'neutral', tile: d.tileStyle || '', pageBg: d.pageBackground || '', header: d.headerStyle || '', accent: d.accent || '', typo: d.typography ? JSON.stringify(d.typography) : '' };
    var cv = spec.canvas || (spec.report && spec.report.canvas) || {};
    return { source: 'spec', name: (spec.report && spec.report.name) || spec.name || '', canvas: cv.w ? cv.w + '×' + cv.h : '', pages: pages, items: items, zones: zones, design: design };
  }
  function from(json) {
    if (!json || typeof json !== 'object') return null;
    if (json.meta && json.meta.specVersion) return fromSpec(json);
    if (json.pages && json.canvas) return fromState(json);
    return null;
  }

  // ---- Vergleich ----------------------------------------------------------
  function compare(older, newer) {
    var res = { added: [], removed: [], changed: [], pages: [], zones: [], design: [], counts: {} };
    var byId = {}; older.items.forEach(function (it) { byId[it.id] = it; });
    var seen = {};
    newer.items.forEach(function (it) {
      var o = byId[it.id];
      if (!o) { res.added.push(it); return; }
      seen[it.id] = true;
      var det = [];
      var cmp = function (what, a, b) { if (!same(a, b)) det.push({ what: what, before: a, after: b }); };
      cmp('page', o.page, it.page); cmp('kind', o.kind, it.kind); cmp('engine', o.engine, it.engine); cmp('title', o.title, it.title);
      cmp('fields', o.fields, it.fields); cmp('analysis', o.analysis, it.analysis); cmp('priority', o.priority, it.priority); cmp('status', o.status, it.status);
      cmp('notes', o.notes, it.notes); cmp('openQuestion', o.openQuestion, it.openQuestion); cmp('interaction', o.interaction, it.interaction);
      cmp('link', o.link, it.link); cmp('content', o.content, it.content); cmp('samples', o.samples, it.samples);
      if (older.source === newer.source) cmp('position', o.pos, it.pos);
      if (det.length) res.changed.push({ item: it, before: o, details: det });
    });
    older.items.forEach(function (it) { if (!seen[it.id]) res.removed.push(it); });
    // Seiten
    var op = {}; older.pages.forEach(function (p) { op[p.id] = p; });
    var np = {}; newer.pages.forEach(function (p) { np[p.id] = p; });
    newer.pages.forEach(function (p) { if (!op[p.id]) res.pages.push({ type: 'added', name: p.name }); else if (op[p.id].name !== p.name) res.pages.push({ type: 'renamed', name: p.name, before: op[p.id].name }); });
    older.pages.forEach(function (p) { if (!np[p.id]) res.pages.push({ type: 'removed', name: p.name }); });
    // Zonen und Design
    Object.keys(newer.zones).forEach(function (k) { if (older.zones[k] !== newer.zones[k]) res.zones.push({ what: k, before: older.zones[k], after: newer.zones[k] }); });
    Object.keys(newer.design).forEach(function (k) { if (older.design[k] !== newer.design[k]) res.design.push({ what: k, before: older.design[k], after: newer.design[k] }); });
    if (older.canvas && newer.canvas && older.canvas !== newer.canvas) res.design.push({ what: 'canvas', before: older.canvas, after: newer.canvas });
    res.counts = { added: res.added.length, removed: res.removed.length, changed: res.changed.length, pages: res.pages.length, zones: res.zones.length, design: res.design.length };
    res.counts.total = res.counts.added + res.counts.removed + res.counts.changed + res.counts.pages + res.counts.zones + res.counts.design;
    return res;
  }

  // ---- Darstellung --------------------------------------------------------
  function fmt(v) {
    if (v === null || v === undefined || v === '') return '–';
    if (typeof v === 'boolean') return v ? '✓' : '–';
    if (Array.isArray(v)) return v.join(', ') || '–';
    if (typeof v === 'object') {
      var parts = Object.keys(v).map(function (k) { var x = v[k]; return k + ': ' + (Array.isArray(x) ? x.join(', ') : (typeof x === 'object' ? JSON.stringify(x) : String(x))); });
      return parts.join(' · ') || '–';
    }
    return String(v);
  }
  function label(t, key) { var s = t ? t('diff.' + key) : null; return (s && s !== 'diff.' + key) ? s : key; }
  function groupByPage(list, getPage) {
    var g = {}; var order = [];
    list.forEach(function (x) { var p = getPage(x); if (!g[p]) { g[p] = []; order.push(p); } g[p].push(x); });
    return order.map(function (p) { return { page: p, items: g[p] }; });
  }
  function render(res, t) {
    if (!res.counts.total) return '<p class="diff-none">' + esc(label(t, 'none')) + '</p>';
    var h = '<div class="diff-sum">' + ['added', 'removed', 'changed'].map(function (k) { return '<span class="diff-pill ' + k + '">' + res.counts[k] + ' ' + esc(label(t, k)) + '</span>'; }).join('') + '</div>';
    var all = [];
    res.added.forEach(function (it) { all.push({ page: it.page, type: 'added', it: it }); });
    res.removed.forEach(function (it) { all.push({ page: it.page, type: 'removed', it: it }); });
    res.changed.forEach(function (c) { all.push({ page: c.item.page, type: 'changed', it: c.item, details: c.details }); });
    groupByPage(all, function (x) { return x.page; }).forEach(function (grp) {
      h += '<h3>' + esc(label(t, 'page')) + ' „' + esc(grp.page) + '"</h3><ul class="diff-list">';
      grp.items.forEach(function (x) {
        var name = x.it.title || x.it.kind; var tag = '<span class="diff-tag ' + x.type + '">' + esc(label(t, x.type)) + '</span>';
        h += '<li>' + tag + ' <strong>' + esc(name) + '</strong> <span class="mono">' + esc(x.it.id) + '</span>';
        if (x.type !== 'changed') h += ' <span class="diff-mute">' + esc(x.it.kind) + (Object.keys(x.it.fields).length ? ' · ' + esc(fmt(x.it.fields)) : '') + '</span>';
        if (x.details) h += '<ul class="diff-det">' + x.details.map(function (d) { return '<li><em>' + esc(label(t, d.what)) + '</em>: <s>' + esc(fmt(d.before)) + '</s> → ' + esc(fmt(d.after)) + '</li>'; }).join('') + '</ul>';
        h += '</li>';
      });
      h += '</ul>';
    });
    if (res.pages.length) h += '<h3>' + esc(label(t, 'pages')) + '</h3><ul class="diff-list">' + res.pages.map(function (p) { return '<li><span class="diff-tag ' + (p.type === 'renamed' ? 'changed' : p.type) + '">' + esc(label(t, p.type)) + '</span> ' + (p.before ? '<s>' + esc(p.before) + '</s> → ' : '') + '<strong>' + esc(p.name) + '</strong></li>'; }).join('') + '</ul>';
    if (res.zones.length) h += '<h3>' + esc(label(t, 'zones')) + '</h3><ul class="diff-det">' + res.zones.map(function (d) { return '<li><em>' + esc(label(t, d.what)) + '</em>: <s>' + esc(fmt(d.before)) + '</s> → ' + esc(fmt(d.after)) + '</li>'; }).join('') + '</ul>';
    if (res.design.length) h += '<h3>' + esc(label(t, 'design')) + '</h3><ul class="diff-det">' + res.design.map(function (d) { return '<li><em>' + esc(label(t, d.what)) + '</em>: <s>' + esc(fmt(d.before)) + '</s> → ' + esc(fmt(d.after)) + '</li>'; }).join('') + '</ul>';
    return h;
  }
  function markdown(res, t, names) {
    names = names || {};
    var out = ['# ' + label(t, 'mdTitle'), '', (names.older || 'A') + ' → ' + (names.newer || 'B'), ''];
    if (!res.counts.total) { out.push(label(t, 'none')); return out.join('\n'); }
    out.push('- ' + res.counts.added + ' ' + label(t, 'added') + ' · ' + res.counts.removed + ' ' + label(t, 'removed') + ' · ' + res.counts.changed + ' ' + label(t, 'changed'), '');
    var all = [];
    res.added.forEach(function (it) { all.push({ page: it.page, type: 'added', it: it }); });
    res.removed.forEach(function (it) { all.push({ page: it.page, type: 'removed', it: it }); });
    res.changed.forEach(function (c) { all.push({ page: c.item.page, type: 'changed', it: c.item, details: c.details }); });
    groupByPage(all, function (x) { return x.page; }).forEach(function (grp) {
      out.push('## ' + label(t, 'page') + ' „' + grp.page + '"', '');
      grp.items.forEach(function (x) {
        out.push('- **' + label(t, x.type) + '** ' + (x.it.title || x.it.kind) + ' `' + x.it.id + '`' + (x.type !== 'changed' ? ' (' + x.it.kind + (Object.keys(x.it.fields).length ? ' · ' + fmt(x.it.fields) : '') + ')' : ''));
        (x.details || []).forEach(function (d) { out.push('  - ' + label(t, d.what) + ': ~~' + fmt(d.before) + '~~ → ' + fmt(d.after)); });
      });
      out.push('');
    });
    if (res.pages.length) { out.push('## ' + label(t, 'pages'), ''); res.pages.forEach(function (p) { out.push('- ' + label(t, p.type) + ': ' + (p.before ? '~~' + p.before + '~~ → ' : '') + p.name); }); out.push(''); }
    if (res.zones.length) { out.push('## ' + label(t, 'zones'), ''); res.zones.forEach(function (d) { out.push('- ' + label(t, d.what) + ': ~~' + fmt(d.before) + '~~ → ' + fmt(d.after)); }); out.push(''); }
    if (res.design.length) { out.push('## ' + label(t, 'design'), ''); res.design.forEach(function (d) { out.push('- ' + label(t, d.what) + ': ~~' + fmt(d.before) + '~~ → ' + fmt(d.after)); }); out.push(''); }
    return out.join('\n');
  }

  var api = { from: from, fromState: fromState, fromSpec: fromSpec, compare: compare, render: render, markdown: markdown, samplesOf: samplesOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MK_DIFF = api;
})(typeof window !== 'undefined' ? window : globalThis);
