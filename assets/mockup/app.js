/* MockupKitchen · App-Kern v0.2: Zustand (mehrere Seiten), Container-Layout, Rendering, Interaktion, Datenmodell (TMDL/Demo) */
(function () {
  'use strict';
  const CAT = window.MK_CATALOG;
  const I18N = window.MK_I18N;
  const t = (key, vars) => I18N.t(key, vars);          // Kurzform für Übersetzungen in der UI-Sprache
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS_KEY = 'mockupkitchen.state.v1';
  const PAGE_BG = { light: '#F4F4F1', soft: '#EEF1F5', white: '#FFFFFF' };
  const pageBgOf = d => d.pageBg === 'custom' ? (d.pageBgHex || '#F4F4F1') : (PAGE_BG[d.pageBg] || PAGE_BG.light);
  const isDark = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return false; const n = parseInt(m[1], 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) < 128; };

  // ------------------------------------------------------------------ Zustand
  function defaultState() {
    // Achtung: S ist hier noch null; die Feldreferenzen der Vorlage löst load() nach dem Zuweisen auf.
    const tpl = CAT.templates.find(t => t.id === 'kpi4-main-detail');
    const p1 = { id: uid(), name: t('state.firstPage'), notes: '', layout: tpl.tree() };
    return {
      version: 2, name: t('state.newReport'),
      canvas: { w: 1920, h: 1080, preset: '1920x1080' },   // Full HD als Vorgabe; HD/UHD/… über die Auswahl
      spacing: { margin: 16, gutter: 12, pad: 8 },
      defScenario: 'AC/PL',
      chrome: {
        header: { on: true, h: 56, logoPos: 'left', title: t('state.headerTitle'), sub: t('state.headerSub'), navAuto: true, navOn: true, nav: [] },
        nav: { on: false, w: 64 },
        filter: { on: true, side: 'right', w: 200, topH: 56, collapsible: false, fields: [] },
        footer: { on: true, h: 24, text: t('state.footerText') },
      },
      design: { radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D', palette: 'teal', pageBgHex: '#F4F4F1', tileBg: '#FFFFFF', ink: '#0F1E2E', headerBg: '#0F1E2E', headerInk: '#FFFFFF' },
      report: { audience: '', purpose: '', decision: '', participants: '', version: '0.1', dataDate: '' },
      lang: I18N.lang,
      fieldMeta: {},
      pages: [p1], cur: p1.id,
      model: CAT.demoModel,
      newFields: [],
    };
  }
  function migrate(s) {
    s.report = Object.assign({ audience: '', purpose: '', decision: '', participants: '', version: '0.1', dataDate: '' }, s.report || {});
    s.lang = (s.lang === 'en' || s.lang === 'de') ? s.lang : I18N.lang; s.fieldMeta = s.fieldMeta || {};
    if (!s.version || s.version < 2) {
      const p = { id: uid(), name: s.pageName || t('state.firstPage'), notes: s.notes || '', layout: s.layout || ensureIds(CAT.templates[0].tree()) };
      s.pages = [p]; s.cur = p.id; delete s.layout; delete s.pageName; delete s.notes;
      const h = s.chrome.header; h.logoPos = h.logo === false ? 'none' : 'left'; h.navAuto = true; delete h.logo;
      s.design = { radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D' };
      s.chrome.filter.topH = 56;
      s.version = 2;
    }
    s.design = Object.assign({ radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D', palette: 'teal', pageBgHex: '#F4F4F1', tileBg: '#FFFFFF', ink: '#0F1E2E', headerBg: '#0F1E2E', headerInk: '#FFFFFF' }, s.design || {});
    s.pages.forEach(p => ensureIds(p.layout));
    if (!s.pages.find(p => p.id === s.cur)) s.cur = s.pages[0].id;
    return s;
  }
  function ensureIds(node) {
    if (!node.id) node.id = uid();
    if (node.type === 'leaf') { if (node.visual) node.visual = normVisual(node.visual); }
    else node.children.forEach(c => ensureIds(c.node));
    return node;
  }
  function normVisual(v) {
    const def = CAT.byId[v.kind];
    const out = Object.assign({ kind: v.kind, engine: def ? def.engine : 'native', title: '', sub: '', scenario: S ? S.defScenario : 'AC/PL', roles: {}, notes: '', link: '', content: '', priority: '', status: 'open', openQuestion: false, analysis: {} }, v);
    if (def && !def.engines.includes(out.engine)) out.engine = def.engine;
    out.roles = out.roles || {}; out.analysis = out.analysis || {};
    if (out.roleRefs) { out.roles = resolveRoleRefs(out.roleRefs, def); delete out.roleRefs; }
    return out;
  }
  // 'Tabelle.Feld'-Referenzen einer Vorlage gegen das geladene Modell auflösen; unbekannte Felder bleiben weg
  function resolveRoleRefs(refs, def) {
    const roles = {}; if (!S || !def) return roles;
    Object.keys(refs).forEach(key => {
      const r = def.roles.find(x => x.key === key); if (!r) return;
      const list = refs[key].map(ref => findField(ref)).filter(Boolean).slice(0, r.max);
      if (list.length) roles[key] = list;
    });
    return roles;
  }
  function findField(ref) {
    const i = ref.indexOf('.'); if (i < 0) return null;
    const table = ref.slice(0, i), name = ref.slice(i + 1);
    const t = S.model.tables.find(x => x.name === table);
    if (t) { const f = t.measures.find(x => x.name === name) || t.columns.find(x => x.name === name); if (f) return { table, name, kind: f.kind, type: f.type || '', isNew: false }; }
    const nf = S.newFields.find(x => x.table === table && x.name === name);
    if (nf) return { table, name, kind: nf.kind, type: nf.type || '', isNew: true };
    return null;
  }

  let S = null, sel = null, zoom = 1, undoStack = [], redoStack = [], lastRects = { leaves: [], gutters: [] };
  const page = () => S.pages.find(p => p.id === S.cur) || S.pages[0];
  const ui = () => clamp(S.canvas.w / 1280, 0.6, 3.2);           // Skalierungsfaktor für Schriften/Abstände
  const ANTI = { pie: true, gauge: true };                         // nicht IBCS-konforme Typen: Skizze wird markiert
  // Analyse-Angaben einer Kachel mit Defaults auflösen (Vertrag v3): alles Entschiedene steht in v.analysis, Rest wird sichtbar abgeleitet
  function primaryMeasure(v) { const r = v.roles || {}; const list = r.ac || r.indicator || r.values || r.y || []; return list[0] || null; }
  // Seitennavigation: 'header' | 'footer' | 'off' (aeltere Staende kennen nur header.navOn)
  // Typografie: zentrale Basisgroessen (px bei 1280 px Breite) und Skalierung, je Kachel ueberschreibbar
  const TYPO_DEF = { scale: 1, title: 12, sub: 9.5, chart: 9 };
  function typo() { return Object.assign({}, TYPO_DEF, (S.design && S.design.typo) || {}); }
  function tileScale(v) { return (v && v.typo && v.typo.scale) || 1; }
  function navPosOf(c) { c = c || S.chrome; return c.navPos || (c.header.navOn === false ? 'off' : 'header'); }
  function navNames(c) { c = c || S.chrome; return c.header.navAuto ? S.pages.map(p => p.name) : (c.header.nav || []); }
  function analysisOf(v) {
    const a = v.analysis || {}; const pm = primaryMeasure(v); const refs = (v.roles && v.roles.ref) || []; const goal = (v.roles && v.roles.goal) || [];
    const scen = String(v.scenario || 'AC/PL');
    const basisAuto = refs[0] ? (/PY|VJ|Vorjahr/i.test(refs[0].name) ? 'PY' : /BU|Budget/i.test(refs[0].name) ? 'BU' : /FC|Forecast/i.test(refs[0].name) ? 'FC' : 'PL') : (goal[0] ? (/PY/i.test(goal[0].name) ? 'PY' : 'PL') : (scen.includes('PY') ? 'PY' : 'PL'));
    return {
      polarity: a.polarity || CAT.polarityFor(pm ? pm.name : v.title), polarityAuto: !a.polarity,
      deltaBasis: a.deltaBasis || basisAuto, deltaBasisAuto: !a.deltaBasis,
      deltaKind: a.deltaKind || ['abs', 'rel'],
      unit: a.unit || '', displayUnits: a.displayUnits || 'auto', decimals: a.decimals == null ? null : a.decimals,
      sort: a.sort || null, topN: a.topN || null, timeGrain: a.timeGrain || null, cumulative: !!a.cumulative, scaleGroup: a.scaleGroup || '', message: a.message || '',
      smallMultiples: !!a.smallMultiples, fieldParam: !!a.fieldParam, fieldParamName: a.fieldParamName || '',
    };
  }

  function load() {
    // Die Sprache des Projekts gewinnt über die zuletzt gemerkte UI-Sprache; ein neues Projekt erbt die UI-Sprache.
    try { const raw = localStorage.getItem(LS_KEY); if (raw) { S = migrate(JSON.parse(raw)); I18N.set(S.lang); return; } } catch (e) { /* ignorieren */ }
    S = defaultState(); S.pages.forEach(p => ensureIds(p.layout));   // erst jetzt ist S gesetzt → Vorlagenfelder werden gebunden
  }
  function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* voll oder blockiert */ } }
  let snap = null;
  function commit(opts) {
    if (!(opts && opts.noUndo)) { if (snap !== null) { undoStack.push(snap); if (undoStack.length > 40) undoStack.shift(); redoStack = []; } snap = null; }
    persist(); render();
    if (snap === null) snap = JSON.stringify(S);
  }
  function mark() { if (snap !== null) { undoStack.push(snap); if (undoStack.length > 40) undoStack.shift(); redoStack = []; } snap = JSON.stringify(S); persist(); }
  function undo() {
    if (!undoStack.length) return toast(t('toast.nothingUndo'));
    redoStack.push(JSON.stringify(S));
    S = migrate(JSON.parse(undoStack.pop())); sel = null; snap = null; persist(); render(); snap = JSON.stringify(S); toast(t('toast.undone'));
  }
  function redo() {
    if (!redoStack.length) return toast(t('toast.nothingRedo'));
    undoStack.push(JSON.stringify(S));
    S = migrate(JSON.parse(redoStack.pop())); sel = null; snap = null; persist(); render(); snap = JSON.stringify(S); toast(t('toast.redone'));
  }

  // ------------------------------------------------------------------ Baum-Helfer (aktuelle Seite)
  function findNode(id, node, parent, idx) {
    node = node || page().layout;
    if (node.id === id) return { node, parent, idx };
    if (node.type === 'split') for (let i = 0; i < node.children.length; i++) { const r = findNode(id, node.children[i].node, node, i); if (r) return r; }
    return null;
  }
  function leaves(node, out) { node = node || page().layout; out = out || []; if (node.type === 'leaf') out.push(node); else node.children.forEach(c => leaves(c.node, out)); return out; }
  function visuals(p) { return leaves(p ? p.layout : null).filter(l => l.visual); }

  function splitLeaf(id, dir) {
    const f = findNode(id); if (!f) return;
    const leaf = f.node; const fresh = { id: uid(), type: 'leaf', visual: null }; const keep = { id: leaf.id, type: 'leaf', visual: leaf.visual };
    if (f.parent && f.parent.dir === dir) { const ch = f.parent.children[f.idx]; const half = ch.size / 2; ch.size = half; f.parent.children.splice(f.idx + 1, 0, { size: half, node: fresh }); }
    else {
      const split = { id: uid(), type: 'split', dir, children: [{ size: 1, node: keep }, { size: 1, node: fresh }] };
      keep.id = uid();
      if (f.parent) f.parent.children[f.idx].node = split; else page().layout = split;
      if (sel === leaf.id) sel = keep.id;
    }
    commit();
  }
  // Zwei Nachbarn im selben Split verbinden: leere Kachel geht im Nachbarn auf, zwei Leaves werden eines (linke/obere Kachel behaelt ihr Visual)
  function mergeGutter(gi) {
    const p = gi.parent, i = gi.index; const A = p.children[i], B = p.children[i + 1]; if (!A || !B) return;
    const isLeaf = c => c.node.type === 'leaf', empty = c => isLeaf(c) && !c.node.visual;
    let keep, drop;
    if (isLeaf(A) && isLeaf(B)) {
      if (A.node.visual && B.node.visual && !confirm(t('ask.mergeReplace', { t: B.node.visual.title || CAT.byId[B.node.visual.kind].label }))) return;
      keep = A; drop = B; if (!A.node.visual && B.node.visual) { keep = B; drop = A; }
    } else if (empty(A)) { keep = B; drop = A; }
    else if (empty(B)) { keep = A; drop = B; }
    else return toast(t('toast.mergeNotPossible'));
    keep.size += drop.size; p.children.splice(p.children.indexOf(drop), 1);
    if (p.children.length === 1) { const only = p.children[0].node; const pf = findNode(p.id); if (pf.parent) pf.parent.children[pf.idx].node = only; else page().layout = only; }
    sel = keep.node.type === 'leaf' ? keep.node.id : sel; commit(); toast(t('toast.merged'));
  }
  // „+" am Seitenrand: neue Kachel auf der obersten Ebene einfuegen, alle Kacheln dieser Ebene gleich verteilen (aus 2 gleichen werden 3 gleiche)
  function insertEdge(side) {
    const dir = (side === 'left' || side === 'right') ? 'row' : 'col'; const atStart = side === 'left' || side === 'top';
    const root = page().layout; const fresh = { id: uid(), type: 'leaf', visual: null };
    if (root.type === 'split' && root.dir === dir) {
      root.children.splice(atStart ? 0 : root.children.length, 0, { size: 1, node: fresh });
      root.children.forEach(c => { c.size = 1; });
    } else {
      const ch = [{ size: 1, node: root }, { size: 1, node: fresh }]; if (atStart) ch.reverse();
      page().layout = { id: uid(), type: 'split', dir, children: ch };
    }
    sel = fresh.id; commit(); toast(t('toast.inserted'));
  }
  function removeLeaf(id) {
    const f = findNode(id); if (!f) return;
    if (!f.parent) { f.node.visual = null; commit(); return; }
    f.parent.children.splice(f.idx, 1);
    if (f.parent.children.length === 1) { const only = f.parent.children[0].node; const pf = findNode(f.parent.id); if (pf.parent) pf.parent.children[pf.idx].node = only; else page().layout = only; }
    if (sel === id) sel = null;
    commit();
  }
  function rebuildGrid(rows, cols) {
    const olds = visuals().map(l => l.visual);
    const mk = () => ({ id: uid(), type: 'leaf', visual: olds.shift() || null });
    const rowNode = () => cols === 1 ? mk() : { id: uid(), type: 'split', dir: 'row', children: Array.from({ length: cols }, () => ({ size: 1, node: mk() })) };
    page().layout = rows === 1 ? rowNode() : { id: uid(), type: 'split', dir: 'col', children: Array.from({ length: rows }, () => ({ size: 1, node: rowNode() })) };
    sel = null; commit();
  }
  function applyTemplate(tplId) {
    const tpl = CAT.templates.find(t => t.id === tplId); if (!tpl) return;
    if (visuals().length && !confirm(t('ask.tplReplace', { t: tpl.label, n: visuals().length }))) return;
    if (!S.model.tables.length) { S.model = JSON.parse(JSON.stringify(CAT.demoModel)); openMeasureTable(); toast(t('toast.demoLoadedTpl')); }
    page().layout = ensureIds(tpl.tree()); sel = null; commit(); toast(t('toast.tplSet', { t: tpl.label }));
  }

  // ------------------------------------------------------------------ Seiten
  function addPage(name, tplId) {
    const tpl = CAT.templates.find(t => t.id === (tplId || 'empty'));
    const p = { id: uid(), name: name || t('state.pageN', { n: S.pages.length + 1 }), notes: '', layout: ensureIds(tpl.tree()) };
    S.pages.push(p); S.cur = p.id; sel = null; commit(); return p;
  }
  function dupPage() { const src = page(); const p = JSON.parse(JSON.stringify(src)); p.id = uid(); p.name = src.name + t('state.copySuffix'); reId(p.layout); S.pages.splice(S.pages.indexOf(src) + 1, 0, p); S.cur = p.id; sel = null; commit(); }
  function reId(n) { n.id = uid(); if (n.type === 'split') n.children.forEach(c => reId(c.node)); }
  function delPage(pid) {
    const p = S.pages.find(x => x.id === pid) || page();
    if (S.pages.length === 1) return toast(t('toast.lastPage'));
    if (!confirm(t('ask.delPage', { n: p.name }))) return;
    const i = S.pages.indexOf(p); const id = p.id; S.pages.splice(i, 1); S.cur = S.pages[Math.max(0, i - 1)].id; sel = null;
    S.pages.forEach(p => visuals(p).forEach(l => { if (l.visual.link === id) l.visual.link = ''; }));
    commit();
  }
  function movePage(d) { const i = S.pages.indexOf(page()); const j = i + d; if (j < 0 || j >= S.pages.length) return; const [p] = S.pages.splice(i, 1); S.pages.splice(j, 0, p); commit(); }
  function renderPages() {
    const bar = $('#pagebar');
    bar.innerHTML = S.pages.map((p, i) => `<span class="ptab${p.id === S.cur ? ' act' : ''}" data-page="${p.id}"><span class="n">${i + 1}</span>${esc(p.name)}${p.id === S.cur ? `<span class="x" data-renpage="${p.id}" title="${esc(t('tip.pageRename'))}">✎</span>` : ''}<span class="x" data-delpage="${p.id}" title="${esc(t('tip.pageDelete'))}">×</span></span>`).join('')
      + `<button class="padd" id="btnAddPage">${esc(t('btn.addPage'))}</button><span class="ptools"><button class="btn sm ghost" id="btnPageLeft" title="${esc(t('tip.pageLeft'))}">‹</button><button class="btn sm ghost" id="btnPageRight" title="${esc(t('tip.pageRight'))}">›</button></span>`;
  }
  $('#pagebar').addEventListener('click', e => {
    const del = e.target.closest('[data-delpage]'); if (del) { delPage(del.dataset.delpage); return; }
    const ren = e.target.closest('[data-renpage]'); if (ren) { const p = S.pages.find(x => x.id === ren.dataset.renpage); const n = prompt(t('ask.pageName'), p.name); if (n && n.trim()) { p.name = n.trim(); commit(); } return; }
    const tab = e.target.closest('[data-page]'); if (tab) { if (tab.dataset.page !== S.cur) { S.cur = tab.dataset.page; sel = null; commit({ noUndo: true }); } return; }
    if (e.target.id === 'btnAddPage') addPage();
    if (e.target.id === 'btnPageLeft') movePage(-1);
    if (e.target.id === 'btnPageRight') movePage(1);
  });
  $('#pagebar').addEventListener('dblclick', e => { const el = e.target.closest('[data-page]'); if (!el) return; const p = S.pages.find(x => x.id === el.dataset.page); const n = prompt(t('ask.pageName'), p.name); if (n && n.trim()) { p.name = n.trim(); commit(); } });

  // ------------------------------------------------------------------ Geometrie
  function zones() {
    const { w, h } = S.canvas; const c = S.chrome; const k = ui(); const m = Math.round(S.spacing.margin * k);
    let top = 0, bottom = h, left = 0, right = w; const z = {};
    if (c.nav.on) { const nw = Math.round(c.nav.w * k); z.nav = { x: 0, y: 0, w: nw, h }; left = nw; }
    if (c.header.on) { const hh = Math.round(c.header.h * k); z.header = { x: left, y: 0, w: w - left, h: hh }; top = hh; }
    if (c.footer.on) { const fh = Math.round(c.footer.h * k); z.footer = { x: left, y: h - fh, w: w - left, h: fh }; bottom = h - fh; }
    if (c.filter.on) {
      if (c.filter.side === 'right') { const fw = Math.round(c.filter.w * k); z.filter = { x: w - fw, y: top, w: fw, h: bottom - top }; right = w - fw; }
      else if (c.filter.side === 'left') { const fw = Math.round(c.filter.w * k); z.filter = { x: left, y: top, w: fw, h: bottom - top }; left += fw; }
      else if (c.filter.side === 'top') { const fh = Math.round((c.filter.topH || 56) * k); z.filter = { x: left, y: top, w: right - left, h: fh }; top += fh; }
      // burger: keine Zone, Button im Kopfband; Panel entsteht per Bookmark
    }
    z.content = { x: left + m, y: top + m, w: Math.max(40, right - left - 2 * m), h: Math.max(40, bottom - top - 2 * m) };
    return z;
  }
  function layoutRects(node, rect, out, gutter) {
    if (node.type === 'leaf') { out.leaves.push({ node, rect: roundRect(rect) }); return; }
    const g = gutter, n = node.children.length; const total = node.children.reduce((a, c) => a + c.size, 0) || 1;
    const span = (node.dir === 'row' ? rect.w : rect.h) - g * (n - 1);
    // Groessen abrunden; der Pixelrest wandert an den Rand (halb links/oben, halb rechts/unten) statt in die letzte Kachel
    const sizes = node.children.map(ch => Math.max(8, Math.floor(span * ch.size / total)));
    const rest = Math.max(0, span - sizes.reduce((a, b) => a + b, 0));
    let pos = (node.dir === 'row' ? rect.x : rect.y) + Math.floor(rest / 2);
    node.children.forEach((ch, i) => {
      const sz = sizes[i];
      const r = node.dir === 'row' ? { x: pos, y: rect.y, w: sz, h: rect.h } : { x: rect.x, y: pos, w: rect.w, h: sz };
      layoutRects(ch.node, r, out, gutter);
      pos += sz + g;
      if (i < n - 1) out.gutters.push({ parent: node, index: i, dir: node.dir, rect: node.dir === 'row' ? { x: pos - g, y: rect.y, w: g, h: rect.h } : { x: rect.x, y: pos - g, w: rect.w, h: g } });
    });
  }
  function roundRect(r) { return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }; }
  function computeAll(p) { p = p || page(); const z = zones(); const out = { leaves: [], gutters: [], zones: z }; layoutRects(p.layout, z.content, out, Math.round(S.spacing.gutter * ui())); if (p === page()) lastRects = out; return out; }
  window.MK_GEOM = { zones, computeAll };

  // ------------------------------------------------------------------ Rendering: Seite
  const pageEl = $('#page'), stage = $('#stage');
  function render() {
    const { w, h } = S.canvas; const c = S.chrome; const d = S.design; const k = ui();
    pageEl.style.width = w + 'px'; pageEl.style.height = h + 'px'; pageEl.style.transform = 'scale(' + zoom + ')';
    pageEl.style.setProperty('--ui', k); pageEl.style.setProperty('--zoom', zoom); pageEl.style.setProperty('--tile-r', Math.round(d.radius * k) + 'px'); pageEl.style.setProperty('--page-bg', pageBgOf(d)); pageEl.style.setProperty('--accent', d.accent || '#C25A2D'); pageEl.style.setProperty('--tile-bg', d.tileBg || '#FFFFFF'); pageEl.style.setProperty('--ink-page', d.ink || '#0F1E2E'); pageEl.style.setProperty('--hdr-bg', d.headerBg || '#0F1E2E'); pageEl.style.setProperty('--hdr-ink', d.headerInk || '#FFFFFF'); const ty = typo(); pageEl.style.setProperty('--fs-title', (ty.title * ty.scale) + 'px'); pageEl.style.setProperty('--fs-sub', (ty.sub * ty.scale) + 'px');
    pageEl.className = 'page tile-' + (d.tile || 'border');
    $('#stageInner').style.minWidth = `max(100%, ${Math.round(w * zoom + 56)}px)`; $('#stageInner').style.minHeight = `max(100%, ${Math.round(h * zoom + 56)}px)`;
    pageEl.style.marginRight = (w * zoom - w) + 'px'; pageEl.style.marginBottom = (h * zoom - h) + 'px';
    const all = computeAll(); const z = all.zones;
    let html = '';
    if (z.nav) html += `<div class="zone nav" style="${css(z.nav)}"><i class="logo"></i>${S.pages.map(p => `<i class="${p.id === S.cur ? 'act' : ''}" title="${esc(p.name)}"></i>`).join('')}</div>`;
    if (z.header) {
      const names = navPosOf(c) === 'header' ? navNames(c) : [];
      const cur = c.header.navAuto ? page().name : names[0];
      const nav = names.map(n => `<span class="${n === cur ? 'act' : ''}">${esc(n)}</span>`).join('');
      const logo = pos => c.header.logoPos === pos ? `<div class="logo${pos === 'right' ? ' right' : ''}">LOGO</div>` : '';
      const burger = c.filter.on && c.filter.side === 'burger' ? `<div class="burger" title="${esc(t('tip.filterMenu'))}"><i></i><i></i><i></i>${c.filter.fields.length ? `<b>${c.filter.fields.length}</b>` : ''}</div>` : '';
      html += `<div class="zone header ${d.header || 'light'}" style="${css(z.header)}">${burger}${logo('left')}<div style="min-width:0"><div class="ttl">${esc(c.header.title || t('canvas.pageTitle'))}</div>${c.header.sub ? `<div class="sub">${esc(c.header.sub)}</div>` : ''}</div>${nav ? `<div class="nav${c.header.logoPos === 'right' ? ' noauto' : ''}" style="${c.header.logoPos === 'right' ? 'margin-left:auto' : ''}">${nav}</div>` : ''}${logo('right')}</div>`;
    }
    if (z.footer) { const fnames = navPosOf(c) === 'footer' ? navNames(c) : []; const fnav = fnames.length ? `<div class="nav">${fnames.map(n => `<span class="${n === page().name ? 'act' : ''}">${esc(n)}</span>`).join('')}</div>` : ''; html += `<div class="zone footer" style="${css(z.footer)}"><span class="ft">${esc(c.footer.text || '')}</span>${fnav}</div>`; }
    // Zahnrad je Zone: oeffnet den passenden Abschnitt im Reiter Rahmen (Doppelklick auf die Zone tut dasselbe)
    ['header', 'nav', 'filter', 'footer'].forEach(key => { const r = z[key]; if (!r) return; const gx = r.x + r.w - 22 * k, gy = key === 'footer' ? r.y + (r.h - 18 * k) / 2 : r.y + 4 * k; html += `<div class="zcfg" data-zcfg="${key}" title="${esc(t('tip.zoneCfg'))}" style="left:${gx}px;top:${gy}px">⚙</div>`; });
    if (z.filter) {
      const SLG = { dropdown: '▾', list: '☰', tile: '▦', between: '⟷', date: '▤', search: '⌕', relative: '◷', button: '▣' };
      const sl = (c.filter.fields || []).map((f, i) => `<div class="sl"><span class="ty" title="${esc(t('opt.slicer.' + (f.type || 'dropdown')))}">${SLG[f.type || 'dropdown'] || '▾'}</span><span class="nm">${esc(f.name)}</span><span class="x" data-rmfilter="${i}" title="${esc(t('tip.slicerRemove'))}">✕</span></div>`).join('');
      const fh = c.filter.heading || {}; const showHead = fh.show === 'on' || (fh.show !== 'off' && !(c.filter.fields || []).length) || (fh.show == null && !!fh.text);
      const headTxt = fh.text || t('canvas.filter'); const ftxt = c.filter.text ? `<p class="txt">${esc(c.filter.text)}</p>` : '';
      html += `<div class="zone filter ${c.filter.side}" style="${css(z.filter)}" data-dropfilter="1">${showHead ? `<h4>${esc(headTxt)}${c.filter.collapsible && c.filter.side !== 'top' ? ' ⧉' : ''}</h4>` : ''}${ftxt}${sl}<div class="sl ph">${esc(t('canvas.dropField'))}</div></div>`;
    }
    all.leaves.forEach(({ node, rect }) => { html += tileHtml(node, rect); });
    all.gutters.forEach((g, i) => { html += `<div class="gutter ${g.dir === 'row' ? 'v' : 'h'}" data-gutter="${i}" style="${css(g.rect)}"><button type="button" class="gmerge" data-merge="${i}" title="${esc(t('tip.merge'))}">+</button></div>`; });
    { const c0 = z.content, eb = (side, st) => `<button type="button" class="gedge ${side}" data-edge="${side}" style="${st}" title="${esc(t('tip.edge'))}">+</button>`;
      html += eb('left', `left:${c0.x}px;top:${c0.y + c0.h / 2}px`) + eb('right', `left:${c0.x + c0.w}px;top:${c0.y + c0.h / 2}px`) + eb('top', `left:${c0.x + c0.w / 2}px;top:${c0.y}px`) + eb('bottom', `left:${c0.x + c0.w / 2}px;top:${c0.y + c0.h}px`); }
    pageEl.innerHTML = html;
    $('#stageInfo').textContent = t('canvas.info', { w, h, cw: z.content.w, ch: z.content.h, k: k.toFixed(2), z: Math.round(zoom * 100) });
    renderPages(); renderInspector(); renderModel(); syncPageInputs();
  }
  function css(r) { return `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`; }

  function tileHtml(node, rect) {
    const v = node.visual; const selc = sel === node.id ? ' sel' : ''; const k = ui();
    const tiny = rect.h < 70 * k || rect.w < 110 * k;
    const acts = `<div class="t-actions"><button data-act="row" title="${esc(t('tip.splitRow'))}">⇔</button><button data-act="col" title="${esc(t('tip.splitCol'))}">⇕</button><button data-act="rm" title="${esc(t('tip.tileRemove'))}">✕</button></div>`;
    if (!v) return `<div class="tile empty${selc}" data-leaf="${node.id}" draggable="true" tabindex="0" aria-label="${esc(t('canvas.emptyTile'))}" style="${css(rect)}"><span class="plus">+</span><span class="lbl">${tiny ? '' : esc(t('canvas.emptyHint'))}</span>${acts}</div>`;
    const def = CAT.byId[v.kind] || {}; const pad = Math.round(S.spacing.pad * k);
    const link = v.link ? S.pages.find(p => p.id === v.link) : null;
    const chips = roleChips(v) + (link ? `<span class="rchip link" title="${esc(t('tip.linkTo'))}">↗ ${esc(link.name)}</span>` : '');
    const headH = v.title || v.sub ? (tiny ? 18 : 24) * k : 0;
    const footH = chips && !tiny ? 18 * k : 0;
    const bw = Math.max(20, rect.w - 2 * pad - 4), bh = Math.max(12, rect.h - headH - footH - pad - 6);
    const an = analysisOf(v);
    const svg = window.MK_SKETCH ? (an.smallMultiples && window.MK_SKETCH.small ? window.MK_SKETCH.small : window.MK_SKETCH)(def.sketch || v.kind, bw, bh, { scenario: def.plain ? 'AC' : v.scenario, seed: seedOf(node.id), label: v.sub || '', scale: k, polarity: an.polarity, deltaBasis: an.deltaBasis, variance: { abs: an.deltaKind.includes('abs'), rel: an.deltaKind.includes('rel') }, unit: an.unit, lang: S.lang, antiPattern: !!ANTI[v.kind], palette: S.design.palette || 'teal', ink: isDark(S.design.tileBg) ? '#E6E6E6' : (S.design.ink || '#404040'), dark: isDark(S.design.tileBg), paper: S.design.tileBg || '#FFFFFF', fontScale: typo().scale * tileScale(v), fonts: { label: typo().chart } }) : '';
    const note = v.notes ? `<span class="note-ico" title="${esc(v.openQuestion ? t('canvas.noteOpen') : t('canvas.note'))}">${v.openQuestion ? '?' : '✎'}</span><div class="note-pop">${esc(v.notes)}</div>` : (v.openQuestion ? `<span class="note-ico" title="${esc(t('canvas.openQuestion'))}">?</span><div class="note-pop">${esc(t('canvas.openQuestionEmpty'))}</div>` : '');
    const missing = CAT.rolesFor(def, v).filter(r => r.req && !(v.roles[r.key] || []).length).map(r => r.label);
    const req = missing.length ? `<span class="reqdot" title="${esc(t('canvas.reqEmpty', { roles: missing.join(', ') }))}"></span>` : '';
    const pri = v.priority ? `<span class="pri ${v.priority}" title="${esc(t('canvas.priority', { p: t('opt.pri.' + v.priority) }))}">${{ must: 'M', should: 'S', could: 'C' }[v.priority] || ''}</span>` : '';
    const st = v.status && v.status !== 'open' ? `<span class="st ${v.status}" title="${esc(t('canvas.status', { s: t('opt.status.' + v.status) }))}"></span>` : '';
    return `<div class="tile${selc}${tiny ? ' tiny' : ''}" data-leaf="${node.id}" draggable="true" tabindex="0" aria-label="${esc(v.title || def.label)}" style="${css(rect)};padding:${Math.max(0, pad - 6)}px">
      ${headH ? `<div class="t-head" style="--tf:${tileScale(v)}"><span class="t-title">${esc(v.title || def.label)}</span>${v.sub ? `<span class="t-sub">${esc(v.sub)}</span>` : ''}</div>` : ''}
      <div class="t-body">${svg}${ANTI[v.kind] ? '<div class="ap"></div>' : ''}</div>
      ${footH ? `<div class="t-foot">${chips}</div>` : ''}
      <div class="badges">${req}${st}${pri}${note}<span class="badge${v.engine === 'ck' ? ' ck' : (v.engine === 'custom' ? ' cv' : '')}">${v.engine === 'ck' ? 'CK' : v.engine === 'deneb' ? 'Deneb' : v.engine === 'custom' ? 'CV' : 'PBI'}</span></div>${acts}</div>`;
  }
  function roleChips(v) {
    const out = [];
    (CAT.byId[v.kind] ? CAT.byId[v.kind].roles : []).forEach(r => (v.roles[r.key] || []).forEach(f => out.push(`<span class="rchip${f.isNew ? ' new' : ''}" title="${esc(r.label)}">${esc(f.name)}</span>`)));
    return out.join('');
  }
  function seedOf(id) { let h = 7; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 1000; }

  // ------------------------------------------------------------------ Interaktion: Seite
  pageEl.addEventListener('click', e => {
    const act = e.target.closest('[data-act]'); const tile = e.target.closest('[data-leaf]'); const rm = e.target.closest('[data-rmfilter]');
    if (rm) { S.chrome.filter.fields.splice(+rm.dataset.rmfilter, 1); commit(); return; }
    if (act && tile) { e.stopPropagation(); const id = tile.dataset.leaf; if (act.dataset.act === 'rm') removeLeaf(id); else splitLeaf(id, act.dataset.act); return; }
    const zc = e.target.closest('[data-zcfg]'); if (zc) { openFrameSection(zc.dataset.zcfg); return; }
    const ico = e.target.closest('.note-ico');
    $$('.note-pop.pinned', pageEl).forEach(p => { if (!ico || p !== ico.nextElementSibling) p.classList.remove('pinned'); });
    if (ico) { const pop = ico.nextElementSibling; if (pop) pop.classList.toggle('pinned'); return; }
    if (tile) { selectTile(tile.dataset.leaf); return; }
    sel = null; render();
  });
  pageEl.addEventListener('keydown', e => {
    const tile = e.target.closest && e.target.closest('[data-leaf]'); if (!tile) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTile(tile.dataset.leaf); if (e.key === 'Enter' && !findNode(sel).node.visual) openCatalog(); }
  });
  // Auswahl ohne Neu-Rendern der Seite, sonst geht das Zielelement zwischen zwei Klicks verloren (Doppelklick)
  function selectTile(id) { sel = id; $$('.tile', pageEl).forEach(t => t.classList.toggle('sel', t.dataset.leaf === id)); renderInspector(); }
  function openFrameSection(key) {
    const tab = $('.tab[data-tab="chrome"]'); if (tab) tab.click();
    const sec = $('#sec' + key.charAt(0).toUpperCase() + key.slice(1)); if (!sec) return;
    sec.scrollIntoView({ block: 'start', behavior: 'smooth' }); sec.classList.remove('flash'); void sec.offsetWidth; sec.classList.add('flash');
    const first = sec.querySelector('input:not([type=checkbox]), select'); if (first) first.focus({ preventScroll: true });
  }
  pageEl.addEventListener('dblclick', e => { const zn = e.target.closest('.zone'); if (zn && !e.target.closest('[data-leaf]')) { const key = ['header', 'nav', 'filter', 'footer'].find(k => zn.classList.contains(k)); if (key) { openFrameSection(key); return; } } const tile = e.target.closest('[data-leaf]'); if (tile && !e.target.closest('[data-act]')) { sel = tile.dataset.leaf; openCatalog(); } });
  stage.addEventListener('click', e => { if (e.target === stage || e.target.id === 'stageInner') { sel = null; render(); } });

  let gdrag = null;
  pageEl.addEventListener('mousedown', e => {
    if (e.target.closest('[data-edge]')) { e.preventDefault(); e.stopPropagation(); insertEdge(e.target.closest('[data-edge]').dataset.edge); return; }
    if (e.target.closest('[data-merge]')) { e.preventDefault(); e.stopPropagation(); const gi = lastRects.gutters[+e.target.closest('[data-merge]').dataset.merge]; if (gi) mergeGutter(gi); return; }
    const g = e.target.closest('[data-gutter]'); if (!g) return;
    const gi = lastRects.gutters[+g.dataset.gutter]; if (!gi) return;
    e.preventDefault();
    const p = gi.parent, a = p.children[gi.index], b = p.children[gi.index + 1]; const total = p.children.reduce((s, c) => s + c.size, 0);
    const kids = lastRects.leaves; const firstLeaf = leaves(p.children[0].node)[0], lastLeaf = leaves(p.children[p.children.length - 1].node).slice(-1)[0];
    const r0 = kids.find(l => l.node.id === firstLeaf.id).rect, r1 = kids.find(l => l.node.id === lastLeaf.id).rect;
    const spanPx = (gi.dir === 'row' ? (r1.x + r1.w - r0.x) : (r1.y + r1.h - r0.y)) - Math.round(S.spacing.gutter * ui()) * (p.children.length - 1);
    gdrag = { gi, a, b, a0: a.size, b0: b.size, unitPerPx: total / spanPx, x0: e.clientX, y0: e.clientY };
    g.classList.add('active');
  });
  window.addEventListener('mousemove', e => {
    if (!gdrag) return;
    const dpx = (gdrag.gi.dir === 'row' ? e.clientX - gdrag.x0 : e.clientY - gdrag.y0) / zoom;
    const d = dpx * gdrag.unitPerPx; const minU = 48 * ui() * gdrag.unitPerPx;
    let na = gdrag.a0 + d, nb = gdrag.b0 - d;
    if (na < minU) { nb -= (minU - na); na = minU; } if (nb < minU) { na -= (minU - nb); nb = minU; }
    gdrag.a.size = na; gdrag.b.size = nb; commit({ noUndo: true });
  });
  window.addEventListener('mouseup', () => { if (gdrag) { gdrag = null; mark(); render(); } });

  let dragTile = null;
  pageEl.addEventListener('dragstart', e => { const tile = e.target.closest('[data-leaf]'); if (!tile) return; dragTile = tile.dataset.leaf; e.dataTransfer.setData('application/mk-tile', dragTile); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => tile.classList.add('dragging'), 0); });
  pageEl.addEventListener('dragend', () => { dragTile = null; $$('.dragging', pageEl).forEach(t => t.classList.remove('dragging')); });
  pageEl.addEventListener('dragover', e => {
    const t = e.target.closest('[data-leaf],[data-dropfilter]'); if (!t) return; const types = e.dataTransfer.types;
    if (t.dataset.dropfilter && !types.includes('application/mk-field')) return;
    e.preventDefault(); e.dataTransfer.dropEffect = types.includes('application/mk-tile') ? 'move' : 'copy';
    $$('.over', pageEl).forEach(x => x.classList.remove('over')); t.classList.add('over');
  });
  pageEl.addEventListener('dragleave', e => { const t = e.target.closest('[data-leaf],[data-dropfilter]'); if (t && !t.contains(e.relatedTarget)) t.classList.remove('over'); });
  pageEl.addEventListener('drop', e => {
    const t = e.target.closest('[data-leaf],[data-dropfilter]'); if (!t) return;
    e.preventDefault(); t.classList.remove('over');
    const field = e.dataTransfer.getData('application/mk-field'), kind = e.dataTransfer.getData('application/mk-kind'), tileId = e.dataTransfer.getData('application/mk-tile');
    if (t.dataset.dropfilter) { if (field) addFilterField(JSON.parse(field)); return; }
    const id = t.dataset.leaf;
    if (field) { assignField(id, JSON.parse(field)); return; }
    if (kind) { setKind(id, kind); return; }
    if (tileId && tileId !== id) swapTiles(tileId, id);
  });

  function swapTiles(a, b) { const na = findNode(a).node, nb = findNode(b).node; const tmp = na.visual; na.visual = nb.visual; nb.visual = tmp; sel = b; commit(); }
  function setKind(id, kind) {
    const n = findNode(id).node; const def = CAT.byId[kind]; if (!def) return;
    const old = n.visual || {}; const roles = {};
    const ALIAS = { ac: ['indicator', 'values', 'y'], indicator: ['ac', 'values'], ref: ['goal'], goal: ['ref'], values: ['ac', 'indicator'], category: ['rows', 'field'], rows: ['category'], field: ['category'] };
    def.roles.forEach(r => { const src = [r.key].concat(ALIAS[r.key] || []).find(k => old.roles && old.roles[k] && old.roles[k].length); if (src) roles[r.key] = old.roles[src].filter(f => r.kind === 'any' || f.kind === r.kind).slice(0, r.max); });
    n.visual = normVisual({ kind, engine: def.engine, title: old.title || '', sub: old.sub || '', scenario: old.scenario || S.defScenario, roles, notes: old.notes || '', link: old.link || '' });
    sel = id; commit();
  }
  function assignField(id, f, roleKey) {
    const n = findNode(id).node;
    if (!n.visual) { const kind = f.kind === 'measure' ? 'kpi' : 'slicer'; n.visual = normVisual({ kind, engine: CAT.byId[kind].engine, roles: {} }); if (!n.visual.title) n.visual.title = f.name; }
    const v = n.visual; const def = CAT.byId[v.kind];
    const rolesDef = CAT.rolesFor(def, v);
    let role = roleKey ? rolesDef.find(r => r.key === roleKey) : null;
    if (!role) {
      // passende Rollen (gleiche Feldart oder „any"); genau eine frei → direkt, sonst Menü statt raten (Review Valerie: Rollenzuweisung rät)
      const fitting = rolesDef.filter(r => r.kind === 'any' || r.kind === f.kind);
      const free = fitting.filter(r => (v.roles[r.key] || []).length < r.max);
      if (free.length === 1 && fitting.length === 1) role = free[0];
      else if (fitting.length) { showRoleMenu(id, f, fitting, v); return; }
      else return toast(t('toast.noRoom', { kind: f.kind === 'measure' ? t('kind.measure') : t('kind.column') }));
    }
    const list = v.roles[role.key] = v.roles[role.key] || [];
    if (list.some(x => x.table === f.table && x.name === f.name)) return toast(t('toast.fieldAssigned'));
    if (list.length >= role.max) list.shift();
    list.push({ table: f.table, name: f.name, kind: f.kind, type: f.type || '', isNew: !!f.isNew });
    if (!v.title && role.key !== 'category' && role.key !== 'field') v.title = f.name;
    if (v.kind === 'slicer' && !v.title) v.title = f.name;
    sel = id; commit();
  }
  function removeField(id, roleKey, idx) { const v = findNode(id).node.visual; if (!v) return; v.roles[roleKey].splice(idx, 1); commit(); }
  // Kleines Rollenmenü: erscheint, wenn mehrere Datenrollen zum Feld passen (ersetzt bei vollen Rollen den ältesten Eintrag)
  let roleMenu = null;
  function showRoleMenu(id, f, roles, v) {
    closeRoleMenu();
    const m = document.createElement('div'); m.className = 'rolemenu'; roleMenu = m;
    m.innerHTML = `<div class="rm-head">${esc(t('role.menuHead', { f: f.name }))}</div>` + roles.map(r => { const cur = v.roles[r.key] || []; const full = cur.length >= r.max; return `<button data-rk="${r.key}"><b>${esc(r.label)}</b><small>${cur.length ? esc(cur.map(x => x.name).join(', ')) + (full ? esc(t('role.replaces', { n: cur[0].name })) : '') : esc(t('role.free'))}</small></button>`; }).join('') + `<button data-rk="">${esc(t('btn.cancel'))}</button>`;
    document.body.appendChild(m);
    const tile = document.querySelector(`.tile[data-leaf="${id}"]`); const r = tile ? tile.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    m.style.left = Math.min(innerWidth - 280, Math.max(8, r.left + r.width / 2 - 130)) + 'px'; m.style.top = Math.min(innerHeight - 260, Math.max(8, r.top + r.height / 2 - 40)) + 'px';
    m.addEventListener('click', e => { const b = e.target.closest('[data-rk]'); if (!b) return; const key = b.dataset.rk; closeRoleMenu(); if (key) assignField(id, f, key); });
    setTimeout(() => document.addEventListener('mousedown', outsideRoleMenu), 0);
  }
  function outsideRoleMenu(e) { if (roleMenu && !roleMenu.contains(e.target)) closeRoleMenu(); }
  function closeRoleMenu() { if (roleMenu) { roleMenu.remove(); roleMenu = null; document.removeEventListener('mousedown', outsideRoleMenu); } }
  function addFilterField(f) { const list = S.chrome.filter.fields; if (list.some(x => x.table === f.table && x.name === f.name)) return toast(t('toast.slicerExists')); list.push({ table: f.table, name: f.name, kind: f.kind, isNew: !!f.isNew }); commit(); }

  // ------------------------------------------------------------------ Inspector · Element
  const insEl = $('#insEl');
  function renderInspector() {
    const f = sel ? findNode(sel) : null;
    if (!f) { insEl.innerHTML = `<p class="hint">${esc(t('hint.pickTile'))}</p><div class="section"><h3>${esc(t('sec.quickstart'))}</h3><ol class="list-dense hint">${[1, 2, 3, 4, 5, 6].map(i => `<li>${esc(t('quickstart.s' + i))}</li>`).join('')}</ol></div>`; return; }
    const n = f.node, v = n.visual; const rect = (lastRects.leaves.find(l => l.node.id === n.id) || {}).rect || { x: 0, y: 0, w: 0, h: 0 };
    const dims = `<div class="kv" style="margin-top:8px"><span class="k">${esc(t('canvas.dims.xy'))}</span><span>${rect.x} · ${rect.y}</span><span class="k">${esc(t('canvas.dims.wh'))}</span><span>${rect.w} × ${rect.h} px</span></div>`;
    if (!v) { insEl.innerHTML = `<button class="typebtn" id="btnPickType"><div class="pv"></div><div><b>${esc(t('btn.pickType'))}</b><small>${esc(t('hint.pickTypeSub'))}</small></div></button><p class="hint">${esc(t('hint.dragField'))}</p>${dims}<div class="section"><button class="btn sm" data-ins="rm">${esc(t('btn.removeTile'))}</button></div>`; bindInspector(n); return; }
    const def = CAT.byId[v.kind] || { label: v.kind, roles: [], engines: ['native'] };
    const pv = window.MK_SKETCH ? window.MK_SKETCH(def.sketch || v.kind, 64, 36, { scenario: def.plain ? 'AC' : v.scenario, seed: 3 }) : '';
    const engines = def.engines.map(e => `<button data-engine="${e}" class="${v.engine === e ? 'on ' + e : ''}">${CAT.engineLabel[e]}</button>`).join('');
    const rolesDef = CAT.rolesFor(def, v); const hasRef = rolesDef.some(r => r.key === 'ref');
    const roles = rolesDef.map(r => {
      const list = v.roles[r.key] || [];
      const chips = list.map((x, i) => `<span class="fchip ${x.kind === 'measure' ? 'm' : 'c'}${x.isNew ? ' new' : ''}" draggable="false"><span class="ico">${x.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(x.name)}</span><button class="x" data-rmrole="${r.key}" data-i="${i}" title="${esc(t('tip.remove'))}">×</button></span>`).join('');
      const kindLbl = r.kind === 'any' ? t('kind.any') : r.kind === 'measure' ? t('kind.measure') : t('kind.column');
      return `<div class="role" data-role="${r.key}"><div class="rl">${esc(r.label)}${r.req ? '<span class="req">*</span>' : ''}<span class="k">${esc(kindLbl)} · ${esc(t('canvas.maxN', { n: r.max }))}</span></div>${chips ? `<div class="chips">${chips}</div>` : ''}${list.length < r.max ? `<div class="drop">${esc(t('canvas.dropFieldRole'))} ${esc(t('canvas.orCreate'))} <button type="button" class="lnk" data-newfield="${r.key}" data-newkind="${r.kind}" title="${esc(t('canvas.createHereTip'))}">+ ${esc(t('canvas.createHere'))}</button></div>` : ''}</div>`;
    }).join('');
    const links = `<option value="">${esc(t('opt.linkNone'))}</option>` + S.pages.filter(p => p.id !== S.cur).map(p => `<option value="${p.id}" ${v.link === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    const an = analysisOf(v); const a = v.analysis || {};
    const hasMeasure = rolesDef.some(r => ['ac', 'indicator', 'values', 'y'].includes(r.key));
    const variants = CAT.variantsFor(def) ? `<div class="section"><h3>${esc(t('sec.variants'))}</h3>
      <label class="toggle" style="padding:0 0 6px"><input type="checkbox" data-an="smallMultiples" ${an.smallMultiples ? 'checked' : ''}> ${esc(t('lbl.smallMultiples'))}</label>
      ${an.smallMultiples && !(v.roles.multiples || []).length ? `<p class="hint" style="margin:0 0 8px">${esc(t('lbl.smHint'))}</p>` : ''}
      <label class="toggle" style="padding:0 0 6px"><input type="checkbox" data-an="fieldParam" ${an.fieldParam ? 'checked' : ''}> ${esc(t('lbl.fieldParam'))}</label>
      ${an.fieldParam ? `<div class="field"><label>${esc(t('lbl.fieldParamName'))}</label><input class="ctl" data-an="fieldParamName" value="${esc(an.fieldParamName)}" placeholder="${esc(t('lbl.fieldParamPh'))}"></div><p class="hint" style="margin:0 0 8px">${esc(t('lbl.fieldParamHint'))}</p>` : ''}
    </div>` : '';
    const opt = (list, cur, labels) => list.map(x => `<option value="${x}" ${String(cur) === String(x) ? 'selected' : ''}>${labels ? labels[x] : x}</option>`).join('');
    const analysis = hasMeasure ? `<div class="section"><h3>${esc(t('sec.analysis'))}</h3>
      <div class="grid2">
        <div class="field"><label>${esc(t('lbl.polarity'))}</label><select class="ctl" data-an="polarity">${opt(['', 'higher', 'lower'], a.polarity || '', { '': t('opt.polarity.auto', { v: t('opt.polarity.' + an.polarity) }), higher: t('opt.polarity.higher'), lower: t('opt.polarity.lower') })}</select></div>
        ${hasRef ? `<div class="field"><label>${esc(t('lbl.deltaBasis'))}</label><select class="ctl" data-an="deltaBasis">${opt(['', 'PL', 'PY', 'BU', 'FC'], a.deltaBasis || '', { '': t('opt.autoBase', { v: an.deltaBasis }), PL: 'PL', PY: 'PY', BU: 'BU', FC: 'FC' })}</select></div>` : '<div></div>'}
        <div class="field"><label>${esc(t('lbl.unit'))}</label><input class="ctl" data-an="unit" value="${esc(an.unit)}" placeholder="${esc(t('ph.anUnit'))}"></div>
        <div class="field"><label>${esc(t('lbl.displayUnits'))}</label><select class="ctl" data-an="displayUnits">${opt(['auto', 'none', 'K', 'M'], an.displayUnits, { auto: t('opt.du.auto'), none: t('opt.du.none'), K: t('opt.du.K'), M: t('opt.du.M') })}</select></div>
        <div class="field"><label>${esc(t('lbl.decimals'))}</label><input class="ctl" type="number" min="0" max="4" data-an="decimals" value="${an.decimals == null ? '' : an.decimals}" placeholder="${esc(t('ph.anDecimals'))}"></div>
        <div class="field"><label>${esc(t('lbl.deltaKind'))}</label><div class="row"><label class="toggle" style="padding:0"><input type="checkbox" data-ank="abs" ${an.deltaKind.includes('abs') ? 'checked' : ''}> abs</label><label class="toggle" style="padding:0"><input type="checkbox" data-ank="rel" ${an.deltaKind.includes('rel') ? 'checked' : ''}> %</label></div></div>
        <div class="field"><label>${esc(t('lbl.sort'))}</label><select class="ctl" data-an="sortBy">${opt(['', 'value', 'delta', 'category'], an.sort ? an.sort.by : '', { '': t('opt.sort.none'), value: t('opt.sort.value'), delta: t('opt.sort.delta'), category: t('opt.sort.category') })}</select></div>
        <div class="field"><label>${esc(t('lbl.sortDir'))}</label><select class="ctl" data-an="sortDir">${opt(['desc', 'asc'], an.sort ? an.sort.dir : 'desc', { desc: t('opt.sort.desc'), asc: t('opt.sort.asc') })}</select></div>
        <div class="field"><label>${esc(t('lbl.topN'))}</label><input class="ctl" type="number" min="1" max="100" data-an="topN" value="${an.topN || ''}" placeholder="${esc(t('ph.anTopN'))}"></div>
        <div class="field"><label>${esc(t('lbl.timeGrain'))}</label><select class="ctl" data-an="timeGrain">${opt(['', 'day', 'week', 'month', 'quarter', 'year'], an.timeGrain || '', { '': t('opt.grain.none'), day: t('opt.grain.day'), week: t('opt.grain.week'), month: t('opt.grain.month'), quarter: t('opt.grain.quarter'), year: t('opt.grain.year') })}</select></div>
        <div class="field"><label>${esc(t('lbl.scaleGroup'))}</label><input class="ctl" data-an="scaleGroup" value="${esc(an.scaleGroup)}" placeholder="${esc(t('ph.anScaleGroup'))}"></div>
        <div class="field"><label class="toggle" style="text-transform:none;letter-spacing:0"><input type="checkbox" data-an="cumulative" ${an.cumulative ? 'checked' : ''}> ${esc(t('lbl.cumulative'))}</label></div>
      </div>
      <div class="field"><label>${esc(t('lbl.message'))}</label><input class="ctl" data-an="message" value="${esc(an.message)}" placeholder="${esc(t('ph.anMessage'))}"></div>
    </div>` : '';
    const isText = v.kind === 'text' || v.kind === 'button';
    insEl.innerHTML = `
      <button class="btn tilewin-btn" data-tilewin="1" title="${esc(t('tip.tileWindow'))}">⤢ ${esc(t('lbl.tileWindow'))}</button>
      <button class="typebtn" id="btnPickType"><div class="pv">${pv}</div><div><b>${esc(def.label)}</b><small>${esc(t('hint.changeType', { group: def.group || '' }))}</small></div></button>
      ${def.note ? `<p class="${def.warnNote ? 'warn' : 'hint'}" style="margin-top:8px">${esc(def.note)}</p>` : ''}
      <div class="field" style="margin-top:10px"><label>${esc(t('lbl.engine'))}</label><div class="engine">${engines}</div></div>
      <div class="field"><label>${esc(t('lbl.vizTitle'))}</label><input class="ctl" data-vk="title" value="${esc(v.title)}" placeholder="${esc(def.label)}"></div>
      <div class="field"><label>${esc(t('lbl.vizSub'))}</label><input class="ctl" data-vk="sub" value="${esc(v.sub)}" placeholder="${esc(t('ph.vizSub'))}"></div>
      ${isText ? `<div class="field"><label>${esc(v.kind === 'button' ? t('lbl.btnCaption') : t('lbl.tileText'))}</label><textarea class="ctl" data-vk="content" placeholder="${esc(t('ph.tileText'))}">${esc(v.content || '')}</textarea></div>` : ''}
      ${hasRef ? `<div class="field"><label>${esc(t('lbl.scenario'))}</label><select class="ctl" data-vk="scenario">${['AC/PL', 'AC/PY', 'AC/PL/FC', 'AC/PL/PY', 'AC/BU', 'PL/FC', 'AC'].map(s => `<option ${v.scenario === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` : ''}
      ${variants}
      <div class="section"><h3>${esc(t('sec.roles'))} <span class="k" style="font-weight:400;text-transform:none;letter-spacing:0">${esc(t('sec.rolesHint'))}</span></h3>${roles || `<p class="hint">${esc(t('hint.noRoles'))}</p>`}</div>
      ${analysis}
      <div class="section"><h3>${esc(t('sec.workshop'))}</h3>
        <div class="grid2">
          <div class="field"><label>${esc(t('lbl.priority'))}</label><select class="ctl" data-vk="priority">${opt(['', 'must', 'should', 'could'], v.priority || '', { '': t('opt.pri.none'), must: t('opt.pri.must'), should: t('opt.pri.should'), could: t('opt.pri.could') })}</select></div>
          <div class="field"><label>${esc(t('lbl.status'))}</label><select class="ctl" data-vk="status">${opt(['open', 'agreed', 'approved'], v.status || 'open', { open: t('opt.status.open'), agreed: t('opt.status.agreed'), approved: t('opt.status.approved') })}</select></div>
        </div>
        <div class="field"><label>${esc(t('lbl.notes'))}</label><textarea class="ctl" data-vk="notes" placeholder="${esc(t('ph.notes'))}">${esc(v.notes)}</textarea></div>
        <label class="toggle"><input type="checkbox" data-vkb="openQuestion" ${v.openQuestion ? 'checked' : ''}> ${esc(t('lbl.openQuestion'))}</label>
        <div class="field"><label>${esc(t('lbl.link'))}</label><select class="ctl" data-vk="link">${links}</select></div>
      </div>
      ${dims}
      <div class="section row wrap"><button class="btn sm" data-ins="clear">${esc(t('btn.clearTile'))}</button><button class="btn sm" data-ins="rm">${esc(t('btn.removeTile'))}</button></div>`;
    bindInspector(n);
    const wb = $('[data-tilewin]', insEl); if (wb) wb.onclick = () => openTileDialog(n.id);
  }
  // Kachel-Fenster: Notiz, Workshop-Status und Verhalten groß in einem Dialog; schreibt direkt in den Zustand
  function openTileDialog(id) {
    const hit = findNode(id); const n = hit && hit.node; if (!n || !n.visual) return;
    const v = n.visual; const def = CAT.byId[v.kind] || { label: v.kind, roles: [] }; const an = analysisOf(v); const it = v.interaction || {};
    const opt = (list, cur, labels) => list.map(x => `<option value="${x}" ${String(cur) === String(x) ? 'selected' : ''}>${labels ? labels[x] : x}</option>`).join('');
    const links = `<option value="">${esc(t('opt.linkNone'))}</option>` + S.pages.filter(p => p.id !== S.cur).map(p => `<option value="${p.id}" ${v.link === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    const hasCat = CAT.rolesFor(def, v).some(r => r.key === 'category'); const canVar = CAT.variantsFor(def); const isText = v.kind === 'text' || v.kind === 'button' || v.kind === 'image';
    $('#dlgTileH').textContent = v.title || def.label;
    $('#dlgTileBody').innerHTML = `<div class="tw-grid"><div class="tw-left">
      <div class="field"><label>${esc(t('lbl.vizTitle'))}</label><input class="ctl" data-tk="title" value="${esc(v.title)}" placeholder="${esc(def.label)}"></div>
      <div class="field grow"><label>${esc(t('lbl.notes'))}</label><textarea class="ctl big" data-tk="notes" placeholder="${esc(t('ph.notes'))}">${esc(v.notes || '')}</textarea></div>
      </div><div class="tw-right"><div class="box"><h3>${esc(t('sec.workshop'))}</h3>
      <div class="grid2">
        <div class="field"><label>${esc(t('lbl.priority'))}</label><select class="ctl" data-tk="priority">${opt(['', 'must', 'should', 'could'], v.priority || '', { '': t('opt.pri.none'), must: t('opt.pri.must'), should: t('opt.pri.should'), could: t('opt.pri.could') })}</select></div>
        <div class="field"><label>${esc(t('lbl.status'))}</label><select class="ctl" data-tk="status">${opt(['open', 'agreed', 'approved'], v.status || 'open', { open: t('opt.status.open'), agreed: t('opt.status.agreed'), approved: t('opt.status.approved') })}</select></div>
      </div>
      <label class="toggle"><input type="checkbox" data-tkb="openQuestion" ${v.openQuestion ? 'checked' : ''}> ${esc(t('lbl.openQuestion'))}</label></div>
      ${isText ? '' : `<div class="box"><h3>${esc(t('sec.behaviour'))}</h3>
      ${hasCat ? `<label class="toggle"><input type="checkbox" data-ti="drillDown" ${it.drillDown ? 'checked' : ''}> ${esc(t('lbl.drillDown'))}</label>` : ''}
      <label class="toggle"><input type="checkbox" data-ti="crossFilter" ${it.crossFilter === false ? '' : 'checked'}> ${esc(t('lbl.crossFilter'))}</label>
      <div class="field"><label>${esc(t('lbl.drillThrough'))}</label><select class="ctl" data-tk="link">${links}</select></div></div>`}
      ${canVar ? `<div class="box"><h3>${esc(t('sec.variants'))}</h3>
      <label class="toggle"><input type="checkbox" data-ta="smallMultiples" ${an.smallMultiples ? 'checked' : ''}> ${esc(t('lbl.smallMultiples'))}</label>
      <label class="toggle"><input type="checkbox" data-ta="fieldParam" ${an.fieldParam ? 'checked' : ''}> ${esc(t('lbl.fieldParam'))}</label>
      <div class="field" ${an.fieldParam ? '' : 'hidden'} data-fpname><label>${esc(t('lbl.fieldParamName'))}</label><input class="ctl" data-ta="fieldParamName" value="${esc(an.fieldParamName)}" placeholder="${esc(t('lbl.fieldParamPh'))}"></div></div>` : ''}<div class="box"><h3>${esc(t('sec.typo'))}</h3><div class="field"><label>${esc(t('lbl.tileFont'))}</label><select class="ctl" data-ty="scale">${[['', t('opt.tileFont.auto')], ['0.85', '85 %'], ['1', '100 %'], ['1.15', '115 %'], ['1.3', '130 %'], ['1.5', '150 %']].map(([k, l]) => `<option value="${k}" ${String(tileScale(v)) === k || (k === '' && !(v.typo && v.typo.scale)) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div></div></div></div>`;
    const body = $('#dlgTileBody');
    const setAn = (key, val) => { const a = v.analysis = v.analysis || {}; if (val === '' || val === null || val === undefined || val === false) delete a[key]; else a[key] = val; };
    $$('[data-tk]', body).forEach(x => { const f = () => { v[x.dataset.tk] = x.value; persist(); }; x.addEventListener('input', f); x.addEventListener('change', f); });
    $$('[data-tkb]', body).forEach(x => x.addEventListener('change', () => { v[x.dataset.tkb] = x.checked; persist(); }));
    $$('[data-ti]', body).forEach(x => x.addEventListener('change', () => { const o = v.interaction = v.interaction || {}; if (x.dataset.ti === 'crossFilter') { if (x.checked) delete o.crossFilter; else o.crossFilter = false; } else { if (x.checked) o[x.dataset.ti] = true; else delete o[x.dataset.ti]; } if (!Object.keys(o).length) delete v.interaction; persist(); }));
    $$('[data-ty]', body).forEach(x => x.addEventListener('change', () => { const o = v.typo = v.typo || {}; if (x.value === '' || +x.value === 1) delete o.scale; else o.scale = +x.value; if (!Object.keys(o).length) delete v.typo; persist(); }));
    $$('[data-ta]', body).forEach(x => x.addEventListener('change', () => { if (x.type === 'checkbox') { setAn(x.dataset.ta, x.checked); if (x.dataset.ta === 'fieldParam') { const r = $('[data-fpname]', body); if (r) r.hidden = !x.checked; } } else setAn(x.dataset.ta, x.value); persist(); }));
    const dlg = $('#dlgTile'); mark();
    // Schließen über ✕, Esc oder Klick auf den Hintergrund: erst schließen, dann Zustand übernehmen und neu zeichnen.
    // Nicht am close-Ereignis hängen, das feuert nicht in jedem Browser zuverlässig (Oberfläche blieb sonst stehen).
    let done = false; const finish = () => { if (done) return; done = true; if (dlg.open) dlg.close(); commit({ noUndo: true }); };
    dlg.onclose = finish; dlg.oncancel = e => { e.preventDefault(); finish(); };
    dlg.onclick = e => { if (e.target === dlg) finish(); };
    $('#dlgTileClose').onclick = finish;
    dlg.showModal();
  }
  function bindInspector(n) {
    const b = $('#btnPickType'); if (b) b.onclick = openCatalog;
    $$('[data-ins]', insEl).forEach(x => x.onclick = () => { if (x.dataset.ins === 'rm') removeLeaf(n.id); else { n.visual = null; commit(); } });
    $$('[data-engine]', insEl).forEach(x => x.onclick = () => { n.visual.engine = x.dataset.engine; commit(); });
    $$('[data-vk]', insEl).forEach(x => {
      const isSel = x.tagName === 'SELECT';
      x.addEventListener('input', () => { n.visual[x.dataset.vk] = x.value; persist(); if (!isSel && x.dataset.vk !== 'notes') renderPageOnly(); });
      x.addEventListener('change', () => { n.visual[x.dataset.vk] = x.value; mark(); if (isSel || x.dataset.vk === 'notes') render(); });
    });
    $$('[data-vkb]', insEl).forEach(x => x.addEventListener('change', () => { n.visual[x.dataset.vkb] = x.checked; commit(); }));
    // Analyse-Block: leer = nicht entschieden (Schlüssel wird entfernt), sonst Wert speichern
    const setAn = (key, val) => { const a = n.visual.analysis = n.visual.analysis || {}; if (val === '' || val === null || val === undefined) delete a[key]; else a[key] = val; };
    $$('[data-an]', insEl).forEach(x => {
      const apply = () => {
        const k = x.dataset.an; let val = x.type === 'checkbox' ? x.checked : x.value;
        if (k === 'sortBy' || k === 'sortDir') { const by = $('[data-an="sortBy"]', insEl).value; const dir = $('[data-an="sortDir"]', insEl).value; setAn('sort', by ? { by, dir } : ''); }
        else if (k === 'topN' || k === 'decimals') setAn(k, val === '' ? '' : +val);
        else if (k === 'cumulative' || k === 'smallMultiples' || k === 'fieldParam') setAn(k, val ? true : '');
        else if (k === 'displayUnits') setAn(k, val === 'auto' ? '' : val);
        else setAn(k, val);
      };
      x.addEventListener('input', () => { apply(); persist(); if (x.tagName !== 'INPUT' || x.type === 'checkbox') render(); else renderPageOnly(); });
      x.addEventListener('change', () => { apply(); mark(); if (x.tagName === 'SELECT') render(); });
    });
    $$('[data-ank]', insEl).forEach(x => x.addEventListener('change', () => { const kinds = $$('[data-ank]', insEl).filter(c => c.checked).map(c => c.dataset.ank); setAn('deltaKind', kinds.length === 2 ? '' : kinds); commit(); }));
    $$('[data-rmrole]', insEl).forEach(x => x.onclick = () => removeField(n.id, x.dataset.rmrole, +x.dataset.i));
    $$('[data-newfield]', insEl).forEach(b => b.onclick = e => { e.stopPropagation(); openNewFieldFor(n.id, b.dataset.newfield, b.dataset.newkind); });
    $$('.role .fchip', insEl).forEach(chip => chip.addEventListener('dblclick', () => { const key = chip.closest('.role').dataset.role; const i = +chip.querySelector('[data-i]').dataset.i; const f = n.visual.roles[key][i]; if (f) openFieldMeta(f); }));
    $$('.role', insEl).forEach(r => {
      r.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/mk-field')) { e.preventDefault(); r.classList.add('over'); } });
      r.addEventListener('dragleave', () => r.classList.remove('over'));
      r.addEventListener('drop', e => { e.preventDefault(); r.classList.remove('over'); const d = e.dataTransfer.getData('application/mk-field'); if (d) assignField(n.id, JSON.parse(d), r.dataset.role); });
    });
  }
  function renderPageOnly() { const act = document.activeElement; render(); if (act && act.dataset && act.dataset.vk) { const again = $(`[data-vk="${act.dataset.vk}"]`, insEl); if (again) { again.focus(); if (again.setSelectionRange && act.selectionStart != null) try { again.setSelectionRange(act.selectionStart, act.selectionEnd); } catch (e) { /* select */ } } } }

  $$('.tab').forEach(tb => tb.onclick = () => { $$('.tab').forEach(x => x.classList.toggle('active', x === tb)); ['el', 'page', 'report', 'chrome', 'design'].forEach(k => { $('#ins' + k[0].toUpperCase() + k.slice(1)).hidden = tb.dataset.tab !== k; }); });

  // ------------------------------------------------------------------ Inspector · Seite / Rahmen / Design
  const bind = (id, set, ev) => {
    const el = $('#' + id); if (!el) return; const val = () => el.type === 'checkbox' ? el.checked : el.value;
    if (ev === 'input') { el.addEventListener('input', () => { set(val()); commit({ noUndo: true }); }); el.addEventListener('change', () => { set(val()); mark(); }); }
    else el.addEventListener('change', () => { set(val()); commit(); });
    return el;
  };
  // Barrierefreiheit: Prüfung über alle Seiten, Ergebnis im Design-Reiter (Modul a11y.js)
  function a11yFindings() { if (!window.MK_A11Y) return []; const byPage = {}; S.pages.forEach(p => { byPage[p.id] = computeAll(p); }); return window.MK_A11Y.check(S, byPage, { lang: S.lang, catalog: CAT }); }
  let a11yGuideLang = null;
  function renderA11y() {
    const panel = $('#a11yPanel'); if (!panel || !window.MK_A11Y) return;
    const f = a11yFindings(); panel.innerHTML = window.MK_A11Y.renderList(f, S.lang);
    const sum = $('#dsA11y > summary'); if (sum) sum.textContent = t('sec.a11y') + ' · ' + window.MK_A11Y.summary(f, S.lang);
    if (a11yGuideLang !== S.lang) { $('#a11yGuide').innerHTML = window.MK_A11Y.renderGuide(S.lang); a11yGuideLang = S.lang; }
  }
  function syncPageInputs() {
    renderA11y();
    const c = S.chrome, d = S.design, p = page();
    $('#projName').value = S.name; $('#rpName').value = S.name; $('#pageName').value = p.name; $('#pageNotes').value = p.notes || ''; $('#pageQuestion').value = p.question || '';
    const rp = S.report; $('#rpAudience').value = rp.audience; $('#rpPurpose').value = rp.purpose; $('#rpDecision').value = rp.decision; $('#rpVersion').value = rp.version; $('#rpDataDate').value = rp.dataDate; $('#rpParticipants').value = rp.participants; $('#rpLang').value = S.lang || 'de';
    $('#canvasPreset').value = S.canvas.preset; $('#customSize').hidden = S.canvas.preset !== 'custom'; $('#canvasW').value = S.canvas.w; $('#canvasH').value = S.canvas.h;
    $('#uiScaleInfo').textContent = t('hint.uiScaleInfo', { k: ui().toFixed(2) });
    $('#spMargin').value = S.spacing.margin; $('#spGutter').value = S.spacing.gutter; $('#spPad').value = S.spacing.pad; $('#defScenario').value = S.defScenario;
    $('#hdOn').checked = c.header.on; $('#hdH').value = c.header.h; $('#hdLogoPos').value = c.header.logoPos || 'left'; $('#hdTitle').value = c.header.title; $('#hdSub').value = c.header.sub; $('#hdNavPos').value = navPosOf(c); $('#hdNavAuto').checked = !!c.header.navAuto; $('#hdNav').value = (c.header.nav || []).join(', '); $('#hdNav').disabled = !!c.header.navAuto;
    $('#nvOn').checked = c.nav.on; $('#nvW').value = c.nav.w;
    $('#ftOn').checked = c.filter.on; $('#ftSide').value = c.filter.side; const fh0 = c.filter.heading || {}; $('#ftHeadShow').value = fh0.show || 'auto'; $('#ftHeadText').value = fh0.text || ''; $('#ftText').value = c.filter.text || ''; const ty0 = typo(); $('#tyScale').value = String(ty0.scale); $('#tyTitle').value = ty0.title; $('#tySub').value = ty0.sub; $('#tyChart').value = ty0.chart; $('#ftW').value = c.filter.side === 'top' ? (c.filter.topH || 56) : c.filter.w; $('#ftWHint').textContent = c.filter.side === 'top' ? t('hint.height') : t('hint.width'); $('#ftW').disabled = c.filter.side === 'burger';
    $('#ftCollapsible').checked = c.filter.collapsible; $('#ftCollapsibleRow').style.display = (c.filter.side === 'left' || c.filter.side === 'right') ? '' : 'none';
    $('#ftFieldList').innerHTML = (c.filter.fields || []).map((f, i) => `<div class="row" style="margin-bottom:4px"><span class="fchip ${f.kind === 'measure' ? 'm' : 'c'}${f.isNew ? ' new' : ''}" draggable="false" style="margin:0;flex:1;min-width:0"><span class="ico">${f.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(f.name)}</span><button class="x" data-rmfilter2="${i}">×</button></span><select class="ctl" data-fttype="${i}" title="${esc(t('lbl.slicerType'))}" style="width:96px;padding:3px 4px;font-size:11px">${['dropdown', 'list', 'tile', 'button', 'between', 'date', 'relative', 'search'].map(k => `<option value="${k}" ${(f.type || 'dropdown') === k ? 'selected' : ''}>${esc(t('opt.slicer.' + k))}</option>`).join('')}</select><input class="ctl" data-ftdef="${i}" value="${esc(f.default || '')}" placeholder="${esc(t('ph.slicerDefault'))}" style="width:90px;padding:3px 6px;font-size:11.5px"></div>`).join('') || `<span class="hint">${esc(t('hint.noSlicers'))}</span>`;
    $('#ffOn').checked = c.footer.on; $('#ffH').value = c.footer.h; $('#ffText').value = c.footer.text;
    $('#dsRadius').value = String(d.radius); $('#dsTile').value = d.tile; $('#dsPageBg').value = d.pageBg; $('#dsHeader').value = d.header; $('#dsAccent').value = d.accent; $('#dsAccentTxt').textContent = d.accent;
    $('#dsPalette').value = d.palette || 'teal'; $('#dsPageBgRow').hidden = d.pageBg !== 'custom'; $('#dsPageBgHex').value = d.pageBgHex || '#F4F4F1'; $('#dsPageBgHexTxt').textContent = d.pageBgHex || '#F4F4F1';
    $('#dsTileBg').value = d.tileBg || '#FFFFFF'; $('#dsTileBgTxt').textContent = d.tileBg || '#FFFFFF'; $('#dsInk').value = d.ink || '#0F1E2E'; $('#dsInkTxt').textContent = d.ink || '#0F1E2E';
    $('#dsHeaderRow').hidden = d.header !== 'custom'; $('#dsHeaderBg').value = d.headerBg || '#0F1E2E'; $('#dsHeaderBgTxt').textContent = d.headerBg || '#0F1E2E'; $('#dsHeaderInk').value = d.headerInk || '#FFFFFF'; $('#dsHeaderInkTxt').textContent = d.headerInk || '#FFFFFF';
    const dsel = $('#demoModelSel'); if (!dsel.options.length || dsel.dataset.lang !== S.lang) { dsel.innerHTML = CAT.demoModels.map(m => `<option value="${m.id}">${esc(m.label)}</option>`).join(''); dsel.dataset.lang = S.lang; dsel.value = S.demoId || 'controlling'; }
  }
  bind('projName', v => S.name = v, 'input'); bind('rpName', v => S.name = v, 'input');
  bind('pageName', v => page().name = v, 'input');
  bind('pageNotes', v => page().notes = v, 'input'); bind('pageQuestion', v => page().question = v, 'input');
  bind('rpAudience', v => S.report.audience = v, 'input'); bind('rpPurpose', v => S.report.purpose = v, 'input'); bind('rpDecision', v => S.report.decision = v, 'input');
  bind('rpVersion', v => S.report.version = v, 'input'); bind('rpDataDate', v => S.report.dataDate = v, 'input'); bind('rpParticipants', v => S.report.participants = v, 'input');
  // Sprache: Auswahlfeld im Reiter „Bericht" und der kleine Umschalter oben führen auf denselben Weg
  function setLang(lang) {
    S.lang = I18N.set(lang);
    I18N.apply(document);
    persist(); render(); toast(t('toast.langSwitched'));
  }
  bind('rpLang', v => { S.lang = v; setLang(v); });
  $('#btnLang').onclick = () => setLang(I18N.lang === 'de' ? 'en' : 'de');
  $('#ftFieldList').addEventListener('input', e => { const inp = e.target.closest('[data-ftdef]'); if (inp) { S.chrome.filter.fields[+inp.dataset.ftdef].default = inp.value; persist(); } });
  $('#ftFieldList').addEventListener('change', e => { if (e.target.closest('[data-ftdef]')) mark(); const ts = e.target.closest('[data-fttype]'); if (ts) { S.chrome.filter.fields[+ts.dataset.fttype].type = ts.value; commit(); } });
  $('#btnPageDup').onclick = dupPage; $('#btnPageDel').onclick = delPage;
  bind('canvasPreset', v => { S.canvas.preset = v; if (v !== 'custom') { const [w, h] = v.split('x').map(Number); S.canvas.w = w; S.canvas.h = h; fitZoom(); } });
  bind('canvasW', v => { S.canvas.w = clamp(+v || 1280, 320, 4000); fitZoom(); }); bind('canvasH', v => { S.canvas.h = clamp(+v || 720, 200, 4000); fitZoom(); });
  bind('spMargin', v => S.spacing.margin = clamp(+v, 0, 64), 'input'); bind('spGutter', v => S.spacing.gutter = clamp(+v, 0, 48), 'input'); bind('spPad', v => S.spacing.pad = clamp(+v, 0, 32), 'input');
  bind('defScenario', v => S.defScenario = v);
  bind('hdOn', v => S.chrome.header.on = v); bind('hdH', v => S.chrome.header.h = clamp(+v, 32, 120), 'input'); bind('hdLogoPos', v => S.chrome.header.logoPos = v);
  bind('ftHeadShow', v => { S.chrome.filter.heading = Object.assign({}, S.chrome.filter.heading, { show: v }); }); bind('ftHeadText', v => { S.chrome.filter.heading = Object.assign({}, S.chrome.filter.heading, { text: v }); }, 'input'); bind('ftText', v => S.chrome.filter.text = v, 'input');
  bind('tyScale', v => { S.design.typo = Object.assign({}, S.design.typo, { scale: +v || 1 }); }); bind('tyTitle', v => { S.design.typo = Object.assign({}, S.design.typo, { title: +v || 12 }); }); bind('tySub', v => { S.design.typo = Object.assign({}, S.design.typo, { sub: +v || 9.5 }); }); bind('tyChart', v => { S.design.typo = Object.assign({}, S.design.typo, { chart: +v || 9 }); });
  bind('hdTitle', v => S.chrome.header.title = v, 'input'); bind('hdSub', v => S.chrome.header.sub = v, 'input'); bind('hdNavPos', v => { S.chrome.navPos = v; S.chrome.header.navOn = v === 'header'; }); bind('hdNavAuto', v => S.chrome.header.navAuto = v);
  bind('hdNav', v => S.chrome.header.nav = v.split(',').map(s => s.trim()).filter(Boolean), 'input');
  bind('nvOn', v => S.chrome.nav.on = v); bind('nvW', v => S.chrome.nav.w = clamp(+v, 40, 120), 'input');
  bind('ftOn', v => S.chrome.filter.on = v); bind('ftSide', v => S.chrome.filter.side = v); bind('ftCollapsible', v => S.chrome.filter.collapsible = v);
  bind('ftW', v => { if (S.chrome.filter.side === 'top') S.chrome.filter.topH = clamp(+v, 40, 160); else S.chrome.filter.w = clamp(+v, 120, 360); }, 'input');
  $('#ftFieldList').addEventListener('click', e => { const b = e.target.closest('[data-rmfilter2]'); if (b) { S.chrome.filter.fields.splice(+b.dataset.rmfilter2, 1); commit(); } });
  // ---------------------------------------------------------------- Kennzahlen-Steckbrief (fieldMeta je Tabelle.Feld)
  let fmRef = null;
  function fieldInfo(ref) { const i = ref.indexOf('.'); const t = S.model.tables.find(x => x.name === ref.slice(0, i)); if (!t) return null; return t.measures.find(x => x.name === ref.slice(i + 1)) || t.columns.find(x => x.name === ref.slice(i + 1)) || null; }
  function openFieldMeta(f) {
    fmRef = f.table + '.' + f.name; const m = S.fieldMeta[fmRef] || {}; const info = fieldInfo(fmRef); const nf = S.newFields.find(x => x.table === f.table && x.name === f.name);
    $('#fmRef').textContent = fmRef + (f.isNew ? t('model.isNew') : '');
    $('#fmModel').innerHTML = info ? `<span class="k">${esc(t('model.type'))}</span><span>${esc(info.kind === 'measure' ? t('kind.measure') : t('model.colOf', { t: info.type || '' }))}</span><span class="k">${esc(t('model.format'))}</span><span>${esc(info.format || '–')}</span><span class="k">${esc(t('model.description'))}</span><span>${esc(info.desc || t('model.noDesc'))}</span>` : (nf ? `<span class="k">${esc(t('model.description'))}</span><span>${esc(nf.desc || '–')}</span>` : '');
    $('#fmAlias').value = m.alias || ''; $('#fmConfirmed').checked = !!m.confirmed; $('#fmRename').checked = !!m.rename; $('#fmOwner').value = m.owner || (nf ? nf.owner || '' : ''); $('#fmSource').value = m.source || (nf ? nf.source || '' : ''); $('#fmTarget').value = m.target || (nf ? nf.target || '' : ''); $('#fmUnit').value = m.unit || (nf ? nf.unit || '' : ''); $('#fmNote').value = m.note || '';
    $('#dlgFieldMeta').showModal();
  }
  $('#fmOk').onclick = () => {
    if (!fmRef) return;
    const m = { alias: $('#fmAlias').value.trim(), confirmed: $('#fmConfirmed').checked, rename: $('#fmRename').checked, owner: $('#fmOwner').value.trim(), source: $('#fmSource').value.trim(), target: $('#fmTarget').value.trim(), unit: $('#fmUnit').value.trim(), note: $('#fmNote').value.trim() };
    if (Object.values(m).some(v => v === true || (typeof v === 'string' && v))) S.fieldMeta[fmRef] = m; else delete S.fieldMeta[fmRef];
    $('#dlgFieldMeta').close(); commit(); toast(t('toast.metaSaved'));
  };
  $('#ftFieldList').addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/mk-field')) e.preventDefault(); });
  $('#ftFieldList').addEventListener('drop', e => { e.preventDefault(); const d = e.dataTransfer.getData('application/mk-field'); if (d) addFilterField(JSON.parse(d)); });
  bind('ffOn', v => S.chrome.footer.on = v); bind('ffH', v => S.chrome.footer.h = clamp(+v, 16, 48), 'input'); bind('ffText', v => S.chrome.footer.text = v, 'input');
  bind('dsRadius', v => S.design.radius = +v); bind('dsTile', v => S.design.tile = v); bind('dsPageBg', v => S.design.pageBg = v); bind('dsHeader', v => S.design.header = v);
  bind('dsAccent', v => S.design.accent = v, 'input'); bind('dsPalette', v => S.design.palette = v);
  bind('dsPageBgHex', v => S.design.pageBgHex = v, 'input'); bind('dsTileBg', v => S.design.tileBg = v, 'input'); bind('dsInk', v => S.design.ink = v, 'input'); bind('dsHeaderBg', v => S.design.headerBg = v, 'input'); bind('dsHeaderInk', v => S.design.headerInk = v, 'input');
  $('#btnSplitRoot').onclick = () => $('#dlgSplit').showModal();
  $('#spOk').onclick = () => { rebuildGrid(clamp(+$('#spRows').value || 1, 1, 6), clamp(+$('#spCols').value || 1, 1, 6)); $('#dlgSplit').close(); };

  // ------------------------------------------------------------------ Katalog-Dialog
  const dlgCat = $('#dlgCatalog');
  function openCatalog() { if (!sel) return toast(t('toast.pickTileFirst')); renderCatalog(''); dlgCat.showModal(); $('#catSearch').value = ''; $('#catSearch').focus(); }
  function renderCatalog(q) {
    q = (q || '').toLowerCase(); const cur = sel ? (findNode(sel).node.visual || {}).kind : null; let html = '';
    CAT.groups.forEach(g => {
      const items = CAT.list.filter(k => k.group === g && (!q || (k.label + ' ' + k.id + ' ' + g).toLowerCase().includes(q)));
      if (!items.length) return;
      html += `<h3>${esc(g)}</h3><div class="cat-grid">` + items.map(k => `<button class="cat-item${k.id === cur ? ' cur' : ''}" data-kind="${k.id}" draggable="true" title="${esc(k.note || '')}"><div class="pv">${window.MK_SKETCH ? window.MK_SKETCH(k.sketch, 130, 56, { scenario: 'AC/PL', seed: 5 }) : ''}</div><b>${esc(k.label)}</b><small>${k.engines.map(e => CAT.engineLabel[e]).join(' · ')}</small></button>`).join('') + '</div>';
    });
    $('#catBody').innerHTML = html || `<p class="hint">${esc(t('hint.noTypeMatch'))}</p>`;
  }
  $('#catSearch').addEventListener('input', e => renderCatalog(e.target.value));
  $('#catBody').addEventListener('click', e => { const b = e.target.closest('[data-kind]'); if (!b) return; setKind(sel, b.dataset.kind); dlgCat.close(); });
  $('#catBody').addEventListener('dragstart', e => { const b = e.target.closest('[data-kind]'); if (!b) return; e.dataTransfer.setData('application/mk-kind', b.dataset.kind); dlgCat.close(); });

  // ------------------------------------------------------------------ Vorlagen-Dialog
  $('#btnNew').onclick = () => { const n = S.pages.reduce((a, p) => a + leaves(p.layout).filter(l => l.visual).length, 0); if ((n || S.pages.length > 1) && !confirm(t('ask.newReplace', { n, p: S.pages.length }))) return; window.MK.reset(); toast(t('toast.newProject')); };
  $('#btnTemplates').onclick = () => { $('#tplGrid').innerHTML = CAT.templates.map(tp => `<div class="tpl" data-tpl="${tp.id}"><div class="pv">${templateSvg(tp)}</div><b>${esc(tp.label)}</b><small>${esc(tp.desc)}</small></div>`).join(''); $('#dlgTemplates').showModal(); };
  $('#tplGrid').addEventListener('click', e => { const el = e.target.closest('[data-tpl]'); if (!el) return; applyTemplate(el.dataset.tpl); $('#dlgTemplates').close(); });
  function templateSvg(tp) {
    const tree = tp.tree(); const out = { leaves: [], gutters: [] }; layoutRects(tree, { x: 2, y: 2, w: 196, h: 92 }, out, 3);
    return `<svg viewBox="0 0 200 96">${out.leaves.map(l => `<rect x="${l.rect.x}" y="${l.rect.y}" width="${l.rect.w}" height="${l.rect.h}" rx="2" fill="${l.node.visual ? '#E9EEF5' : '#fff'}" stroke="#C9C6BA" stroke-dasharray="${l.node.visual ? '' : '3 2'}"/>${l.node.visual ? `<text x="${l.rect.x + 4}" y="${l.rect.y + 11}" font-size="7" fill="#475569" font-family="Geist,system-ui">${esc((CAT.byId[l.node.visual.kind] || {}).label || '').slice(0, Math.max(3, l.rect.w / 5))}</text>` : ''}`).join('')}</svg>`;
  }

  // ------------------------------------------------------------------ Datenmodell (TMDL / Demo)
  function parseTmdl(text) {
    const lines = text.replace(/^﻿/, '').replace(/\r/g, '').split('\n');
    let table = null, cur = null, pendingDesc = []; const out = [];
    const unq = s => { s = s.trim(); return (s.startsWith("'") && s.endsWith("'")) ? s.slice(1, -1).replace(/''/g, "'") : s; };
    for (const raw of lines) {
      const line = raw.replace(/\t/g, '    '); const indent = line.match(/^ */)[0].length; const t = line.trim();
      if (!t) continue;
      if (indent === 0) {
        if (t.startsWith('table ')) { table = { name: unq(t.slice(6).replace(/\s*\/\/.*$/, '')), columns: [], measures: [], hidden: false, desc: pendingDesc.join(' ') }; out.push(table); cur = null; pendingDesc = []; }
        else if (t.startsWith('///')) pendingDesc.push(t.slice(3).trim());
        else { cur = null; pendingDesc = []; }
        continue;
      }
      if (!table) continue;
      if (indent <= 4 && t.startsWith('///')) { pendingDesc.push(t.slice(3).trim()); continue; }
      if (indent <= 4) {
        const m = t.match(/^(measure|column|calculatedColumn|hierarchy)\s+('(?:[^']|'')+'|[^\s=]+)(\s*=.*)?$/);
        if (m) {
          const kind = m[1] === 'measure' ? 'measure' : (m[1] === 'hierarchy' ? 'hierarchy' : 'column');
          cur = { name: unq(m[2]), kind, type: kind === 'measure' ? 'measure' : '', desc: pendingDesc.join(' '), hidden: false, format: '' }; pendingDesc = [];
          if (kind === 'measure') table.measures.push(cur); else if (kind === 'column') table.columns.push(cur); else cur = null;
        } else if (t.startsWith('isHidden') && !cur) table.hidden = true;
        else { cur = null; pendingDesc = []; }
        continue;
      }
      if (cur && indent <= 8) {
        if (t.startsWith('dataType:')) cur.type = t.slice(9).trim();
        else if (t === 'isHidden' || t.startsWith('isHidden:')) cur.hidden = true;
        else if (t.startsWith('formatString:')) cur.format = t.slice(13).trim();
        else if (t.startsWith('description:')) cur.desc = t.slice(12).trim();
      }
    }
    return out;
  }
  function ingestTmdlFiles(files) {
    const tmdl = files.filter(f => /\.tmdl$/i.test(f.name) && !/^(model|database|relationships|expressions|cultures)\.tmdl$/i.test(f.name));
    if (!tmdl.length) return toast(t('toast.noTmdl', { n: files.length }));
    Promise.all(tmdl.map(f => f.text())).then(texts => {
      const tables = []; texts.forEach(txt => parseTmdl(txt).forEach(tb => tables.push(tb)));
      const rel = tmdl[0].webkitRelativePath || ''; const src = rel.includes('/') ? rel.split('/')[0] : t('model.tmdlSrc', { n: tmdl.length });
      const good = tables.filter(tb => tb.columns.length || tb.measures.length);
      if (!good.length) return toast(t('toast.tmdlEmpty'));
      S.model = { tables: good, source: src, loadedAt: new Date().toISOString() }; openMeasureTable(); commit();
      toast(t('toast.tmdlOk', { tables: good.length, measures: good.reduce((a, tb) => a + tb.measures.length, 0), columns: good.reduce((a, tb) => a + tb.columns.length, 0) }));
    }).catch(err => toast(t('toast.readFailed', { msg: err.message })));
  }
  $('#btnImportTmdl').onclick = () => $('#fileTmdl').click();
  $('#fileTmdl').addEventListener('change', e => { ingestTmdlFiles(Array.from(e.target.files)); e.target.value = ''; });
  $('#fileTmdlSingle').addEventListener('change', e => { ingestTmdlFiles(Array.from(e.target.files)); e.target.value = ''; });
  $('#btnDemoModel').onclick = () => { const id = $('#demoModelSel').value || 'controlling'; const m = CAT.demoModels.find(x => x.id === id); S.demoId = id; S.model = m ? m.build() : CAT.demoModel; openMeasureTable(); commit(); toast(t('toast.demoLoaded')); };
  function openMeasureTable() { const tb = S.model.tables.find(x => x.measures.length); if (tb) openTables.add(tb.name); }
  const mdrop = $('#modelDrop');
  mdrop.addEventListener('click', () => $('#fileTmdlSingle').click());
  mdrop.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); mdrop.classList.add('over'); } });
  mdrop.addEventListener('dragleave', () => mdrop.classList.remove('over'));
  mdrop.addEventListener('drop', async e => {
    e.preventDefault(); mdrop.classList.remove('over');
    // Entries synchron einsammeln: nach dem ersten await sind die DataTransfer-Items nicht mehr lesbar
    const items = Array.from(e.dataTransfer.items || []);
    const entries = items.map(it => (it.webkitGetAsEntry ? it.webkitGetAsEntry() : null)).filter(Boolean);
    const flat = Array.from(e.dataTransfer.files || []);
    const files = [];
    const walk = entry => new Promise(res => {
      if (entry.isFile) entry.file(f => { files.push(f); res(); }, () => res());
      else if (entry.isDirectory) { const rd = entry.createReader(); const all = []; const next = () => rd.readEntries(async ents => { if (!ents.length) { for (const en of all) await walk(en); res(); } else { all.push(...ents); next(); } }, () => res()); next(); }
      else res();
    });
    try { for (const en of entries) await walk(en); } catch (err) { /* Fallback unten */ }
    ingestTmdlFiles(files.length ? files : flat);
  });

  function usedFieldKeys() {
    const set = new Set();
    S.pages.forEach(p => visuals(p).forEach(l => Object.values(l.visual.roles).forEach(list => list.forEach(f => set.add(f.table + '|' + f.name)))));
    (S.chrome.filter.fields || []).forEach(f => set.add(f.table + '|' + f.name));
    return set;
  }
  const openTables = new Set();
  function renderModel() {
    const list = $('#modelList'); const q = ($('#modelSearch').value || '').toLowerCase(); const onlyUsed = $('#onlyUsed').checked; const used = usedFieldKeys(); const m = S.model;
    $('#modelMeta').textContent = m.tables.length ? t('model.meta', { src: m.source || t('model.fallbackSrc'), tables: m.tables.length, measures: m.tables.reduce((a, tb) => a + tb.measures.length, 0) }) : t('model.none');
    $('#nmTables').innerHTML = m.tables.map(tb => `<option value="${esc(tb.name)}">`).join('');
    const chip = (f, table, extra) => {
      const key = table + '|' + f.name; if (onlyUsed && !used.has(key)) return ''; if (q && !(f.name + ' ' + table).toLowerCase().includes(q)) return '';
      return `<span class="fchip ${f.kind === 'measure' ? 'm' : 'c'}${f.isNew ? ' new' : ''}${used.has(key) ? ' used' : ''}" draggable="true" data-field='${esc(JSON.stringify({ table, name: f.name, kind: f.kind, type: f.type || '', isNew: !!f.isNew }))}' title="${esc((f.desc || '') + (f.type ? ' · ' + f.type : '') + (f.open ? ' · offen: ' + f.open : ''))}"><span class="ico">${f.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(f.name)}</span>${extra || ''}</span>`;
    };
    let html = '';
    if (S.newFields.length) html += `<div class="table-block open"><div class="table-head"><span class="car">▸</span>${esc(t('model.newGroup'))}<span class="cnt">${S.newFields.length}</span></div><div class="table-body">${S.newFields.map((f, i) => chip(f, f.table, `<button class="x" data-rmnew="${i}" title="${esc(t('tip.rmNewField'))}">×</button>`)).join('')}</div></div>`;
    if (!m.tables.length && !S.newFields.length) html += `<div class="empty-model"><strong>${esc(t('model.emptyTitle'))}</strong>${esc(t('model.emptyText'))}</div>`;
    m.tables.forEach(tb => {
      const inner = tb.measures.map(f => chip(f, tb.name)).join('') + tb.columns.filter(c => !c.hidden || used.has(tb.name + '|' + c.name)).map(f => chip(f, tb.name)).join('');
      if (!inner) return; const open = openTables.has(tb.name) || !!q || onlyUsed;
      html += `<div class="table-block${open ? ' open' : ''}" data-table="${esc(tb.name)}"><div class="table-head"><span class="car">▸</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(tb.name)}</span><span class="cnt">${tb.measures.length}Σ ${tb.columns.length}≡</span></div><div class="table-body">${inner}</div></div>`;
    });
    list.innerHTML = html;
  }
  $('#modelList').addEventListener('dblclick', e => { const c = e.target.closest('[data-field]'); if (c) openFieldMeta(JSON.parse(c.dataset.field)); });
  $('#modelList').addEventListener('click', e => {
    // Klick-Fallback zur Feldzuweisung (Tastatur/Touch): Chip anklicken → gewählte Kachel
    const chip = e.target.closest('[data-field]');
    if (chip && !e.target.closest('.x') && sel) { assignField(sel, JSON.parse(chip.dataset.field)); return; }
    const rm = e.target.closest('[data-rmnew]');
    if (rm) {
      const f = S.newFields[+rm.dataset.rmnew]; if (!f) return;
      const same = x => x.table === f.table && x.name === f.name;
      // erst zählen, dann fragen, dann entfernen (sonst wäre der Zustand bei „Abbrechen" schon verändert)
      let n = S.chrome.filter.fields.filter(same).length;
      S.pages.forEach(p => visuals(p).forEach(l => Object.values(l.visual.roles).forEach(list => { n += list.filter(same).length; })));
      if (n && !confirm(t('ask.rmField', { n: f.name, c: n }))) return;
      S.pages.forEach(p => visuals(p).forEach(l => Object.keys(l.visual.roles).forEach(k => { l.visual.roles[k] = l.visual.roles[k].filter(x => !same(x)); })));
      S.chrome.filter.fields = S.chrome.filter.fields.filter(x => !same(x));
      S.newFields.splice(+rm.dataset.rmnew, 1); commit(); if (n) toast(t('toast.fieldRemoved', { n: f.name, c: n })); return;
    }
    const h = e.target.closest('.table-head'); if (!h) return; const blk = h.parentElement; const nm = blk.dataset.table; if (!nm) return;
    blk.classList.toggle('open'); if (blk.classList.contains('open')) openTables.add(nm); else openTables.delete(nm);
  });
  $('#modelList').addEventListener('dragstart', e => { const c = e.target.closest('[data-field]'); if (!c) return; e.dataTransfer.setData('application/mk-field', c.dataset.field); e.dataTransfer.effectAllowed = 'copy'; });
  $('#modelSearch').addEventListener('input', renderModel); $('#onlyUsed').addEventListener('change', renderModel);
  // Standardtabelle: Measures in die Measure-Tabelle (erste mit Measures, sonst „_Measures"), Dimensionen in die erste Dimensionstabelle
  const defaultTableFor = kind => { const tb = kind === 'measure' ? S.model.tables.find(x => x.measures.length) : S.model.tables.find(x => x.columns.length && !x.measures.length); return tb ? tb.name : (kind === 'measure' ? '_Measures' : 'DimNeu'); };
  // Neues Feld direkt aus einer Datenrolle heraus anlegen (erster Workshop: Kennzahlen fehlen oft noch) und sofort binden
  let pendingNewField = null;
  function openNewFieldFor(tileId, roleKey, roleKind) {
    pendingNewField = { tileId, roleKey };
    $('#nmKind').value = roleKind === 'column' ? 'column' : 'measure';
    $('#nmName').value = ''; $('#nmDesc').value = ''; $('#nmOpen').value = ''; $('#nmTable').value = defaultTableFor($('#nmKind').value);
    $('#dlgNewMeasure').showModal(); $('#nmName').focus();
  }
  $('#btnNewMeasure').onclick = () => { pendingNewField = null; $('#nmName').value = ''; $('#nmDesc').value = ''; $('#nmOpen').value = ''; $('#nmTable').value = defaultTableFor($('#nmKind').value); $('#dlgNewMeasure').showModal(); $('#nmName').focus(); };
  $('#nmKind').addEventListener('change', () => { $('#nmTable').value = defaultTableFor($('#nmKind').value); });
  $('#nmOk').onclick = () => {
    const name = $('#nmName').value.trim(); if (!name) return $('#nmName').focus();
    const kind = $('#nmKind').value;
    const nf = { id: uid(), name, table: $('#nmTable').value.trim() || (kind === 'measure' ? '_Measures' : 'DimNeu'), kind, desc: $('#nmDesc').value.trim(), open: $('#nmOpen').value.trim(), unit: $('#nmUnit').value.trim(), target: $('#nmTarget').value.trim(), owner: $('#nmOwner').value.trim(), source: $('#nmSource').value.trim(), isNew: true, type: kind === 'measure' ? 'measure' : '' };
    S.newFields.push(nf);
    ['nmUnit', 'nmTarget', 'nmOwner', 'nmSource'].forEach(id => { $('#' + id).value = ''; });
    $('#dlgNewMeasure').close();
    if (pendingNewField && findNode(pendingNewField.tileId)) { const { tileId, roleKey } = pendingNewField; pendingNewField = null; sel = tileId; assignField(tileId, { table: nf.table, name: nf.name, kind: nf.kind, type: nf.type, isNew: true }, roleKey); toast(t('toast.fieldCreated', { n: name })); return; }
    commit(); toast(t('toast.fieldCreated', { n: name }));
  };

  // ------------------------------------------------------------------ Zoom, Toolbar, Tastatur
  function fitZoom() { const r = stage.getBoundingClientRect(); zoom = clamp(Math.min((r.width - 60) / S.canvas.w, (r.height - 60) / S.canvas.h), 0.1, 2); }
  $('#btnZoomFit').onclick = () => { fitZoom(); render(); };
  $('#btnZoomIn').onclick = () => { zoom = clamp(zoom * 1.15, 0.1, 3); render(); };
  $('#btnZoomOut').onclick = () => { zoom = clamp(zoom / 1.15, 0.1, 3); render(); };
  window.addEventListener('resize', () => { fitZoom(); render(); });
  $('#btnHelp').onclick = () => $('#dlgHelp').showModal();
  $('#btnUndo').onclick = undo; $('#btnRedo').onclick = redo;
  function togglePresent(on) { document.body.classList.toggle('present', on); const p = document.body.classList.contains('present'); const b = $('#btnPresent'); b.textContent = p ? t('btn.presentEnd') : t('btn.present'); b.setAttribute('data-i18n', p ? 'btn.presentEnd' : 'btn.present'); setTimeout(() => { fitZoom(); render(); }, 30); }
  $('#btnPresent').onclick = () => togglePresent();
  $$('dialog [data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  window.addEventListener('keydown', e => {
    const tgt = e.target;
    if (document.querySelector('dialog[open]')) return;                       // Dialoge behalten Fokusfang und Esc
    if (tgt && tgt.matches && tgt.matches('input,textarea,select')) { if (e.key === 'Escape' && tgt.blur) tgt.blur(); return; }
    if (e.key === 'Escape') { const pinned = $$('.note-pop.pinned', pageEl); if (pinned.length) { pinned.forEach(p => p.classList.remove('pinned')); return; } if (document.body.classList.contains('present')) togglePresent(false); else { sel = null; render(); } }
    else if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey && !e.altKey) togglePresent();
    else if (e.key.toLowerCase() === 'n' && sel && !e.ctrlKey && !e.metaKey && !e.altKey) { const hit = findNode(sel); if (hit && hit.node.visual) openTileDialog(sel); }
    else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { const n = findNode(sel).node; if (n.visual) { n.visual = null; commit(); toast(t('toast.tileCleared')); } else removeLeaf(sel); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); $('#btnSave').click(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); $('#btnExport').click(); }
  });
  let toastT = null;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 3200); }

  // Öffentliche API für export.js
  window.MK = {
    get state() { return S; }, set state(v) { S = migrate(v); sel = null; commit(); },
    page, visuals, leaves, zones, computeAll, ui, toast, findNode, insertEdge, mergeGutter, catalog: CAT, persist, pageBg: PAGE_BG, pageBgOf, isDark, analysisOf, navPosOf, navNames, typo, tileScale, a11yFindings, primaryMeasure, fieldInfo, seedOf, anti: ANTI,
    setLang, get lang() { return I18N.lang; },
    // ensureIds wie in load(): erst mit gesetztem S werden die Vorlagenfelder gebunden (sonst fehlt visual.roles)
    reset() { S = defaultState(); S.pages.forEach(p => ensureIds(p.layout)); sel = null; undoStack = []; commit(); },
  };

  load(); I18N.apply(document); snap = JSON.stringify(S); fitZoom(); render();
})();
