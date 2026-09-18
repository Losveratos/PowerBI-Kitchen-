/* MockupKitchen · App-Kern v0.2: Zustand (mehrere Seiten), Container-Layout, Rendering, Interaktion, Datenmodell (TMDL/Demo) */
(function () {
  'use strict';
  const CAT = window.MK_CATALOG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS_KEY = 'mockupkitchen.state.v1';
  const PAGE_BG = { light: '#F4F4F1', soft: '#EEF1F5', white: '#FFFFFF' };

  // ------------------------------------------------------------------ Zustand
  function defaultState() {
    const tpl = CAT.templates.find(t => t.id === 'kpi4-main-detail');
    const p1 = { id: uid(), name: 'Übersicht', notes: '', layout: ensureIds(tpl.tree()) };
    return {
      version: 2, name: 'Neuer Bericht',
      canvas: { w: 1280, h: 720, preset: '1280x720' },
      spacing: { margin: 16, gutter: 12, pad: 8 },
      defScenario: 'AC/PL',
      chrome: {
        header: { on: true, h: 56, logoPos: 'left', title: 'Management Report', sub: 'in T€ · YTD 2026', navAuto: true, nav: [] },
        nav: { on: false, w: 64 },
        filter: { on: true, side: 'right', w: 200, topH: 56, collapsible: false, fields: [] },
        footer: { on: true, h: 24, text: 'Stand: 18.09.2026 · Quelle: DWH · Kontakt: Controlling' },
      },
      design: { radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D' },
      pages: [p1], cur: p1.id,
      model: { tables: [], source: null },
      newFields: [],
    };
  }
  function migrate(s) {
    if (!s.version || s.version < 2) {
      const p = { id: uid(), name: s.pageName || 'Übersicht', notes: s.notes || '', layout: s.layout || ensureIds(CAT.templates[0].tree()) };
      s.pages = [p]; s.cur = p.id; delete s.layout; delete s.pageName; delete s.notes;
      const h = s.chrome.header; h.logoPos = h.logo === false ? 'none' : 'left'; h.navAuto = true; delete h.logo;
      s.design = { radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D' };
      s.chrome.filter.topH = 56;
      s.version = 2;
    }
    s.design = Object.assign({ radius: 8, tile: 'border', pageBg: 'light', header: 'light', accent: '#C25A2D' }, s.design || {});
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
    const out = Object.assign({ kind: v.kind, engine: def ? def.engine : 'native', title: '', sub: '', scenario: S ? S.defScenario : 'AC/PL', roles: {}, notes: '', link: '' }, v);
    if (def && !def.engines.includes(out.engine)) out.engine = def.engine;
    out.roles = out.roles || {};
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

  let S = null, sel = null, zoom = 1, undoStack = [], lastRects = { leaves: [], gutters: [] };
  const page = () => S.pages.find(p => p.id === S.cur) || S.pages[0];
  const ui = () => clamp(S.canvas.w / 1280, 0.6, 3.2);           // Skalierungsfaktor für Schriften/Abstände

  function load() {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) { S = migrate(JSON.parse(raw)); return; } } catch (e) { /* ignorieren */ }
    S = defaultState();
  }
  function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* voll oder blockiert */ } }
  let snap = null;
  function commit(opts) {
    if (!(opts && opts.noUndo)) { if (snap !== null) { undoStack.push(snap); if (undoStack.length > 40) undoStack.shift(); } snap = null; }
    persist(); render();
    if (snap === null) snap = JSON.stringify(S);
  }
  function mark() { if (snap !== null) { undoStack.push(snap); if (undoStack.length > 40) undoStack.shift(); } snap = JSON.stringify(S); persist(); }
  function undo() {
    if (!undoStack.length) return toast('Nichts rückgängig zu machen');
    S = migrate(JSON.parse(undoStack.pop())); sel = null; snap = null; persist(); render(); snap = JSON.stringify(S); toast('Rückgängig');
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
    if (!S.model.tables.length) { S.model = JSON.parse(JSON.stringify(CAT.demoModel)); toast('Demo-Modell geladen, Vorlage gebunden'); }
    page().layout = ensureIds(tpl.tree()); sel = null; commit(); toast('Vorlage „' + tpl.label + '" gesetzt');
  }

  // ------------------------------------------------------------------ Seiten
  function addPage(name, tplId) {
    const tpl = CAT.templates.find(t => t.id === (tplId || 'empty'));
    const p = { id: uid(), name: name || ('Seite ' + (S.pages.length + 1)), notes: '', layout: ensureIds(tpl.tree()) };
    S.pages.push(p); S.cur = p.id; sel = null; commit(); return p;
  }
  function dupPage() { const src = page(); const p = JSON.parse(JSON.stringify(src)); p.id = uid(); p.name = src.name + ' (Kopie)'; reId(p.layout); S.pages.splice(S.pages.indexOf(src) + 1, 0, p); S.cur = p.id; sel = null; commit(); }
  function reId(n) { n.id = uid(); if (n.type === 'split') n.children.forEach(c => reId(c.node)); }
  function delPage() {
    if (S.pages.length === 1) return toast('Die letzte Seite bleibt');
    if (!confirm('Seite „' + page().name + '" löschen?')) return;
    const i = S.pages.indexOf(page()); const id = page().id; S.pages.splice(i, 1); S.cur = S.pages[Math.max(0, i - 1)].id; sel = null;
    S.pages.forEach(p => visuals(p).forEach(l => { if (l.visual.link === id) l.visual.link = ''; }));
    commit();
  }
  function movePage(d) { const i = S.pages.indexOf(page()); const j = i + d; if (j < 0 || j >= S.pages.length) return; const [p] = S.pages.splice(i, 1); S.pages.splice(j, 0, p); commit(); }
  function renderPages() {
    const bar = $('#pagebar');
    bar.innerHTML = S.pages.map((p, i) => `<span class="ptab${p.id === S.cur ? ' act' : ''}" data-page="${p.id}" title="Doppelklick: umbenennen"><span class="n">${i + 1}</span>${esc(p.name)}<span class="x" data-delpage="${p.id}" title="Seite löschen">×</span></span>`).join('')
      + `<button class="padd" id="btnAddPage">+ Seite</button><span class="ptools"><button class="btn sm ghost" id="btnPageLeft" title="Seite nach links">‹</button><button class="btn sm ghost" id="btnPageRight" title="Seite nach rechts">›</button></span>`;
  }
  $('#pagebar').addEventListener('click', e => {
    const del = e.target.closest('[data-delpage]'); if (del) { S.cur = del.dataset.delpage; delPage(); return; }
    const t = e.target.closest('[data-page]'); if (t) { S.cur = t.dataset.page; sel = null; commit({ noUndo: true }); return; }
    if (e.target.id === 'btnAddPage') addPage();
    if (e.target.id === 'btnPageLeft') movePage(-1);
    if (e.target.id === 'btnPageRight') movePage(1);
  });
  $('#pagebar').addEventListener('dblclick', e => { const t = e.target.closest('[data-page]'); if (!t) return; const p = S.pages.find(x => x.id === t.dataset.page); const n = prompt('Seitenname', p.name); if (n && n.trim()) { p.name = n.trim(); commit(); } });

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
    let pos = node.dir === 'row' ? rect.x : rect.y, acc = 0;
    node.children.forEach((ch, i) => {
      acc += ch.size;
      const end = (node.dir === 'row' ? rect.x : rect.y) + Math.round(span * acc / total) + g * i;
      const sz = Math.max(8, end - pos);
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
    pageEl.style.setProperty('--ui', k); pageEl.style.setProperty('--tile-r', Math.round(d.radius * k) + 'px'); pageEl.style.setProperty('--page-bg', PAGE_BG[d.pageBg] || PAGE_BG.light); pageEl.style.setProperty('--accent', d.accent || '#C25A2D');
    pageEl.className = 'page tile-' + (d.tile || 'border');
    $('#stageInner').style.minWidth = `max(100%, ${Math.round(w * zoom + 56)}px)`; $('#stageInner').style.minHeight = `max(100%, ${Math.round(h * zoom + 56)}px)`;
    pageEl.style.marginRight = (w * zoom - w) + 'px'; pageEl.style.marginBottom = (h * zoom - h) + 'px';
    const all = computeAll(); const z = all.zones;
    let html = '';
    if (z.nav) html += `<div class="zone nav" style="${css(z.nav)}"><i class="logo"></i>${S.pages.map(p => `<i class="${p.id === S.cur ? 'act' : ''}" title="${esc(p.name)}"></i>`).join('')}</div>`;
    if (z.header) {
      const names = c.header.navAuto ? S.pages.map(p => p.name) : (c.header.nav || []);
      const cur = c.header.navAuto ? page().name : names[0];
      const nav = names.map(n => `<span class="${n === cur ? 'act' : ''}">${esc(n)}</span>`).join('');
      const logo = pos => c.header.logoPos === pos ? `<div class="logo${pos === 'right' ? ' right' : ''}">LOGO</div>` : '';
      const burger = c.filter.on && c.filter.side === 'burger' ? `<div class="burger" title="Filter-Menü (Bookmark)"><i></i><i></i><i></i>${c.filter.fields.length ? `<b>${c.filter.fields.length}</b>` : ''}</div>` : '';
      html += `<div class="zone header ${d.header || 'light'}" style="${css(z.header)}">${burger}${logo('left')}<div style="min-width:0"><div class="ttl">${esc(c.header.title || 'Seitentitel')}</div>${c.header.sub ? `<div class="sub">${esc(c.header.sub)}</div>` : ''}</div>${nav ? `<div class="nav${c.header.logoPos === 'right' ? ' noauto' : ''}" style="${c.header.logoPos === 'right' ? 'margin-left:auto' : ''}">${nav}</div>` : ''}${logo('right')}</div>`;
    }
    if (z.footer) html += `<div class="zone footer" style="${css(z.footer)}">${esc(c.footer.text || '')}</div>`;
    if (z.filter) {
      const sl = (c.filter.fields || []).map((f, i) => `<div class="sl"><span class="nm">${esc(f.name)}</span><span class="x" data-rmfilter="${i}" title="Slicer entfernen">✕</span></div>`).join('');
      html += `<div class="zone filter ${c.filter.side}" style="${css(z.filter)}" data-dropfilter="1"><h4>Filter${c.filter.collapsible && c.filter.side !== 'top' ? ' ⧉' : ''}</h4>${sl}<div class="sl ph">+ Feld hierher ziehen</div></div>`;
    }
    all.leaves.forEach(({ node, rect }) => { html += tileHtml(node, rect); });
    all.gutters.forEach((g, i) => { html += `<div class="gutter ${g.dir === 'row' ? 'v' : 'h'}" data-gutter="${i}" style="${css(g.rect)}"></div>`; });
    pageEl.innerHTML = html;
    $('#stageInfo').textContent = `${w} × ${h} px · Inhalt ${z.content.w} × ${z.content.h} · Skalierung ×${k.toFixed(2)} · Zoom ${Math.round(zoom * 100)} %`;
    renderPages(); renderInspector(); renderModel(); syncPageInputs();
  }
  function css(r) { return `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`; }

  function tileHtml(node, rect) {
    const v = node.visual; const selc = sel === node.id ? ' sel' : ''; const k = ui();
    const tiny = rect.h < 70 * k || rect.w < 110 * k;
    const acts = `<div class="t-actions"><button data-act="row" title="In Spalten teilen">⇔</button><button data-act="col" title="In Zeilen teilen">⇕</button><button data-act="rm" title="Kachel entfernen">✕</button></div>`;
    if (!v) return `<div class="tile empty${selc}" data-leaf="${node.id}" draggable="true" style="${css(rect)}"><span class="plus">+</span><span class="lbl">${tiny ? '' : 'Visual wählen oder Feld ablegen'}</span>${acts}</div>`;
    const def = CAT.byId[v.kind] || {}; const pad = Math.round(S.spacing.pad * k);
    const link = v.link ? S.pages.find(p => p.id === v.link) : null;
    const chips = roleChips(v) + (link ? `<span class="rchip link" title="Springt zu Seite">↗ ${esc(link.name)}</span>` : '');
    const headH = v.title || v.sub ? (tiny ? 18 : 24) * k : 0;
    const footH = chips && !tiny ? 18 * k : 0;
    const bw = Math.max(20, rect.w - 2 * pad - 4), bh = Math.max(12, rect.h - headH - footH - pad - 6);
    const svg = window.MK_SKETCH ? window.MK_SKETCH(def.sketch || v.kind, bw, bh, { scenario: v.scenario, seed: seedOf(node.id), label: v.sub || '', scale: k }) : '';
    const note = v.notes ? `<span class="note-ico" title="Notiz">✎</span><div class="note-pop">${esc(v.notes)}</div>` : '';
    return `<div class="tile${selc}${tiny ? ' tiny' : ''}" data-leaf="${node.id}" draggable="true" style="${css(rect)};padding:${Math.max(0, pad - 6)}px">
      ${headH ? `<div class="t-head"><span class="t-title">${esc(v.title || def.label)}</span>${v.sub ? `<span class="t-sub">${esc(v.sub)}</span>` : ''}</div>` : ''}
      <div class="t-body">${svg}</div>
      ${footH ? `<div class="t-foot">${chips}</div>` : ''}
      <div class="badges">${note}<span class="badge${v.engine === 'ck' ? ' ck' : ''}">${v.engine === 'ck' ? 'CK' : (v.engine === 'deneb' ? 'Deneb' : 'PBI')}</span></div>${acts}</div>`;
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
    if (e.target.closest('.note-ico')) { const pop = e.target.closest('.tile').querySelector('.note-pop'); pop.classList.toggle('pinned'); return; }
    if (tile) { sel = tile.dataset.leaf; render(); return; }
    sel = null; render();
  });
  pageEl.addEventListener('dblclick', e => { const tile = e.target.closest('[data-leaf]'); if (tile && !e.target.closest('[data-act]')) { sel = tile.dataset.leaf; openCatalog(); } });
  stage.addEventListener('click', e => { if (e.target === stage || e.target.id === 'stageInner') { sel = null; render(); } });

  let gdrag = null;
  pageEl.addEventListener('mousedown', e => {
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
    let role = roleKey ? def.roles.find(r => r.key === roleKey) : null;
    if (!role) role = def.roles.find(r => (r.kind === 'any' || r.kind === f.kind) && (v.roles[r.key] || []).length < r.max);
    if (!role) role = def.roles.find(r => (v.roles[r.key] || []).length < r.max);
    if (!role) return toast('Keine freie Datenrolle in dieser Kachel');
    const list = v.roles[role.key] = v.roles[role.key] || [];
    if (list.some(x => x.table === f.table && x.name === f.name)) return toast('Feld ist schon zugewiesen');
    if (list.length >= role.max) list.shift();
    list.push({ table: f.table, name: f.name, kind: f.kind, type: f.type || '', isNew: !!f.isNew });
    if (!v.title && role.key !== 'category' && role.key !== 'field') v.title = f.name;
    if (v.kind === 'slicer' && !v.title) v.title = f.name;
    sel = id; commit();
  }
  function removeField(id, roleKey, idx) { const v = findNode(id).node.visual; if (!v) return; v.roles[roleKey].splice(idx, 1); commit(); }
  function addFilterField(f) { const list = S.chrome.filter.fields; if (list.some(x => x.table === f.table && x.name === f.name)) return toast('Slicer existiert schon'); list.push({ table: f.table, name: f.name, kind: f.kind, isNew: !!f.isNew }); commit(); }

  // ------------------------------------------------------------------ Inspector · Element
  const insEl = $('#insEl');
  function renderInspector() {
    const f = sel ? findNode(sel) : null;
    if (!f) { insEl.innerHTML = `<p class="hint">Kachel anklicken, um Typ, Titel, Datenrollen, Notizen und Sprungziel zu setzen.</p><div class="section"><h3>Schnellstart</h3><ol class="list-dense hint"><li>„Vorlagen" oben wählen (lädt bei Bedarf das Demo-Modell)</li><li>Rechts „Rahmen" und „Design" einstellen</li><li>Kachel teilen (⇔ ⇕), Trennlinien ziehen</li><li>Doppelklick auf Kachel → Visual wählen</li><li>Felder aus dem Modell auf Kacheln ziehen</li><li>Weitere Seiten über „+ Seite", Export für Claude Code</li></ol></div>`; return; }
    const n = f.node, v = n.visual; const rect = (lastRects.leaves.find(l => l.node.id === n.id) || {}).rect || { x: 0, y: 0, w: 0, h: 0 };
    const dims = `<div class="kv" style="margin-top:8px"><span class="k">x · y</span><span>${rect.x} · ${rect.y}</span><span class="k">w × h</span><span>${rect.w} × ${rect.h} px</span></div>`;
    if (!v) { insEl.innerHTML = `<button class="typebtn" id="btnPickType"><div class="pv"></div><div><b>Visual wählen …</b><small>ChartKitchen oder nativ</small></div></button><p class="hint">Oder ein Feld aus dem Modell auf die Kachel ziehen: Kennzahl → KPI, Spalte → Slicer.</p>${dims}<div class="section"><button class="btn sm" data-ins="rm">Kachel entfernen</button></div>`; bindInspector(n); return; }
    const def = CAT.byId[v.kind] || { label: v.kind, roles: [], engines: ['native'] };
    const pv = window.MK_SKETCH ? window.MK_SKETCH(def.sketch || v.kind, 64, 36, { scenario: v.scenario, seed: 3 }) : '';
    const engines = def.engines.map(e => `<button data-engine="${e}" class="${v.engine === e ? 'on ' + e : ''}">${CAT.engineLabel[e]}</button>`).join('');
    const hasRef = def.roles.some(r => r.key === 'ref');
    const roles = def.roles.map(r => {
      const list = v.roles[r.key] || [];
      const chips = list.map((x, i) => `<span class="fchip ${x.kind === 'measure' ? 'm' : 'c'}${x.isNew ? ' new' : ''}" draggable="false"><span class="ico">${x.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(x.name)}</span><button class="x" data-rmrole="${r.key}" data-i="${i}" title="entfernen">×</button></span>`).join('');
      return `<div class="role" data-role="${r.key}"><div class="rl">${esc(r.label)}${r.req ? '<span class="req">*</span>' : ''}<span class="k">${r.kind === 'any' ? 'Feld' : r.kind === 'measure' ? 'Measure' : 'Spalte'} · max ${r.max}</span></div>${chips ? `<div class="chips">${chips}</div>` : ''}${list.length < r.max ? `<div class="drop">Feld hierher ziehen</div>` : ''}</div>`;
    }).join('');
    const links = `<option value="">– keins –</option>` + S.pages.filter(p => p.id !== S.cur).map(p => `<option value="${p.id}" ${v.link === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
    insEl.innerHTML = `
      <button class="typebtn" id="btnPickType"><div class="pv">${pv}</div><div><b>${esc(def.label)}</b><small>${esc(def.group)} · Typ ändern</small></div></button>
      ${def.note ? `<p class="hint">${esc(def.note)}</p>` : ''}
      <div class="field" style="margin-top:10px"><label>Engine</label><div class="engine">${engines}</div></div>
      <div class="field"><label>Titel</label><input class="ctl" data-vk="title" value="${esc(v.title)}" placeholder="${esc(def.label)}"></div>
      <div class="field"><label>Untertitel / Einheit</label><input class="ctl" data-vk="sub" value="${esc(v.sub)}" placeholder="z. B. in T€, 2026 YTD"></div>
      ${hasRef ? `<div class="field"><label>Szenario</label><select class="ctl" data-vk="scenario">${['AC/PL', 'AC/PY', 'AC/PL/FC', 'AC'].map(s => `<option ${v.scenario === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` : ''}
      <div class="section"><h3>Datenrollen</h3>${roles || '<p class="hint">Keine Datenrollen (statisches Element).</p>'}</div>
      <div class="field" style="margin-top:10px"><label>Workshop-Notiz (✎ auf der Kachel)</label><textarea class="ctl" data-vk="notes" placeholder="Sortierung, Drill, Bedingte Formatierung, Kommentar, offene Frage …">${esc(v.notes)}</textarea></div>
      <div class="field"><label>Springt zu (Seite, Drill / Navigation)</label><select class="ctl" data-vk="link">${links}</select></div>
      ${dims}
      <div class="section row wrap"><button class="btn sm" data-ins="clear">Kachel leeren</button><button class="btn sm" data-ins="rm">Kachel entfernen</button></div>`;
    bindInspector(n);
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
    $$('[data-rmrole]', insEl).forEach(x => x.onclick = () => removeField(n.id, x.dataset.rmrole, +x.dataset.i));
    $$('.role', insEl).forEach(r => {
      r.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/mk-field')) { e.preventDefault(); r.classList.add('over'); } });
      r.addEventListener('dragleave', () => r.classList.remove('over'));
      r.addEventListener('drop', e => { e.preventDefault(); r.classList.remove('over'); const d = e.dataTransfer.getData('application/mk-field'); if (d) assignField(n.id, JSON.parse(d), r.dataset.role); });
    });
  }
  function renderPageOnly() { const act = document.activeElement; render(); if (act && act.dataset && act.dataset.vk) { const again = $(`[data-vk="${act.dataset.vk}"]`, insEl); if (again) { again.focus(); if (again.setSelectionRange && act.selectionStart != null) try { again.setSelectionRange(act.selectionStart, act.selectionEnd); } catch (e) { /* select */ } } } }

  $$('.tab').forEach(t => t.onclick = () => { $$('.tab').forEach(x => x.classList.toggle('active', x === t)); ['el', 'page', 'chrome', 'design'].forEach(k => { $('#ins' + k[0].toUpperCase() + k.slice(1)).hidden = t.dataset.tab !== k; }); });

  // ------------------------------------------------------------------ Inspector · Seite / Rahmen / Design
  const bind = (id, set, ev) => {
    const el = $('#' + id); if (!el) return; const val = () => el.type === 'checkbox' ? el.checked : el.value;
    if (ev === 'input') { el.addEventListener('input', () => { set(val()); commit({ noUndo: true }); }); el.addEventListener('change', () => { set(val()); mark(); }); }
    else el.addEventListener('change', () => { set(val()); commit(); });
    return el;
  };
  function syncPageInputs() {
    const c = S.chrome, d = S.design, p = page();
    $('#projName').value = S.name; $('#pageName').value = p.name; $('#pageNotes').value = p.notes || '';
    $('#canvasPreset').value = S.canvas.preset; $('#customSize').hidden = S.canvas.preset !== 'custom'; $('#canvasW').value = S.canvas.w; $('#canvasH').value = S.canvas.h;
    $('#uiScaleInfo').textContent = `Skalierung ×${ui().toFixed(2)}: Schriften, Rahmenhöhen und Abstände werden aus HD-Basiswerten hochgerechnet.`;
    $('#spMargin').value = S.spacing.margin; $('#spGutter').value = S.spacing.gutter; $('#spPad').value = S.spacing.pad; $('#defScenario').value = S.defScenario;
    $('#hdOn').checked = c.header.on; $('#hdH').value = c.header.h; $('#hdLogoPos').value = c.header.logoPos || 'left'; $('#hdTitle').value = c.header.title; $('#hdSub').value = c.header.sub; $('#hdNavAuto').checked = !!c.header.navAuto; $('#hdNav').value = (c.header.nav || []).join(', '); $('#hdNav').disabled = !!c.header.navAuto;
    $('#nvOn').checked = c.nav.on; $('#nvW').value = c.nav.w;
    $('#ftOn').checked = c.filter.on; $('#ftSide').value = c.filter.side; $('#ftW').value = c.filter.side === 'top' ? (c.filter.topH || 56) : c.filter.w; $('#ftWHint').textContent = c.filter.side === 'top' ? 'Höhe' : 'Breite'; $('#ftW').disabled = c.filter.side === 'burger';
    $('#ftCollapsible').checked = c.filter.collapsible; $('#ftCollapsibleRow').style.display = (c.filter.side === 'left' || c.filter.side === 'right') ? '' : 'none';
    $('#ftFieldList').innerHTML = (c.filter.fields || []).map((f, i) => `<span class="fchip ${f.kind === 'measure' ? 'm' : 'c'}${f.isNew ? ' new' : ''}" draggable="false"><span class="ico">${f.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(f.name)}</span><button class="x" data-rmfilter2="${i}">×</button></span>`).join('') || '<span class="hint">Noch keine Slicer. Feld aus dem Modell hierher ziehen.</span>';
    $('#ffOn').checked = c.footer.on; $('#ffH').value = c.footer.h; $('#ffText').value = c.footer.text;
    $('#dsRadius').value = String(d.radius); $('#dsTile').value = d.tile; $('#dsPageBg').value = d.pageBg; $('#dsHeader').value = d.header; $('#dsAccent').value = d.accent; $('#dsAccentTxt').textContent = d.accent;
  }
  bind('projName', v => S.name = v, 'input');
  bind('pageName', v => page().name = v, 'input');
  bind('pageNotes', v => page().notes = v, 'input');
  $('#btnPageDup').onclick = dupPage; $('#btnPageDel').onclick = delPage;
  bind('canvasPreset', v => { S.canvas.preset = v; if (v !== 'custom') { const [w, h] = v.split('x').map(Number); S.canvas.w = w; S.canvas.h = h; fitZoom(); } });
  bind('canvasW', v => { S.canvas.w = clamp(+v || 1280, 320, 4000); fitZoom(); }); bind('canvasH', v => { S.canvas.h = clamp(+v || 720, 200, 4000); fitZoom(); });
  bind('spMargin', v => S.spacing.margin = clamp(+v, 0, 64), 'input'); bind('spGutter', v => S.spacing.gutter = clamp(+v, 0, 48), 'input'); bind('spPad', v => S.spacing.pad = clamp(+v, 0, 32), 'input');
  bind('defScenario', v => S.defScenario = v);
  bind('hdOn', v => S.chrome.header.on = v); bind('hdH', v => S.chrome.header.h = clamp(+v, 32, 120), 'input'); bind('hdLogoPos', v => S.chrome.header.logoPos = v);
  bind('hdTitle', v => S.chrome.header.title = v, 'input'); bind('hdSub', v => S.chrome.header.sub = v, 'input'); bind('hdNavAuto', v => S.chrome.header.navAuto = v);
  bind('hdNav', v => S.chrome.header.nav = v.split(',').map(s => s.trim()).filter(Boolean), 'input');
  bind('nvOn', v => S.chrome.nav.on = v); bind('nvW', v => S.chrome.nav.w = clamp(+v, 40, 120), 'input');
  bind('ftOn', v => S.chrome.filter.on = v); bind('ftSide', v => S.chrome.filter.side = v); bind('ftCollapsible', v => S.chrome.filter.collapsible = v);
  bind('ftW', v => { if (S.chrome.filter.side === 'top') S.chrome.filter.topH = clamp(+v, 40, 160); else S.chrome.filter.w = clamp(+v, 120, 360); }, 'input');
  $('#ftFieldList').addEventListener('click', e => { const b = e.target.closest('[data-rmfilter2]'); if (b) { S.chrome.filter.fields.splice(+b.dataset.rmfilter2, 1); commit(); } });
  $('#ftFieldList').addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/mk-field')) e.preventDefault(); });
  $('#ftFieldList').addEventListener('drop', e => { e.preventDefault(); const d = e.dataTransfer.getData('application/mk-field'); if (d) addFilterField(JSON.parse(d)); });
  bind('ffOn', v => S.chrome.footer.on = v); bind('ffH', v => S.chrome.footer.h = clamp(+v, 16, 48), 'input'); bind('ffText', v => S.chrome.footer.text = v, 'input');
  bind('dsRadius', v => S.design.radius = +v); bind('dsTile', v => S.design.tile = v); bind('dsPageBg', v => S.design.pageBg = v); bind('dsHeader', v => S.design.header = v);
  bind('dsAccent', v => S.design.accent = v, 'input');
  $('#btnSplitRoot').onclick = () => $('#dlgSplit').showModal();
  $('#spOk').onclick = () => { rebuildGrid(clamp(+$('#spRows').value || 1, 1, 6), clamp(+$('#spCols').value || 1, 1, 6)); $('#dlgSplit').close(); };

  // ------------------------------------------------------------------ Katalog-Dialog
  const dlgCat = $('#dlgCatalog');
  function openCatalog() { if (!sel) return toast('Erst eine Kachel wählen'); renderCatalog(''); dlgCat.showModal(); $('#catSearch').value = ''; $('#catSearch').focus(); }
  function renderCatalog(q) {
    q = (q || '').toLowerCase(); const cur = sel ? (findNode(sel).node.visual || {}).kind : null; let html = '';
    CAT.groups.forEach(g => {
      const items = CAT.list.filter(k => k.group === g && (!q || (k.label + ' ' + k.id + ' ' + g).toLowerCase().includes(q)));
      if (!items.length) return;
      html += `<h3>${esc(g)}</h3><div class="cat-grid">` + items.map(k => `<button class="cat-item${k.id === cur ? ' cur' : ''}" data-kind="${k.id}" draggable="true" title="${esc(k.note || '')}"><div class="pv">${window.MK_SKETCH ? window.MK_SKETCH(k.sketch, 130, 56, { scenario: 'AC/PL', seed: 5 }) : ''}</div><b>${esc(k.label)}</b><small>${k.engines.map(e => CAT.engineLabel[e]).join(' · ')}</small></button>`).join('') + '</div>';
    });
    $('#catBody').innerHTML = html || '<p class="hint">Kein Typ passt zur Suche.</p>';
  }
  $('#catSearch').addEventListener('input', e => renderCatalog(e.target.value));
  $('#catBody').addEventListener('click', e => { const b = e.target.closest('[data-kind]'); if (!b) return; setKind(sel, b.dataset.kind); dlgCat.close(); });
  $('#catBody').addEventListener('dragstart', e => { const b = e.target.closest('[data-kind]'); if (!b) return; e.dataTransfer.setData('application/mk-kind', b.dataset.kind); dlgCat.close(); });

  // ------------------------------------------------------------------ Vorlagen-Dialog
  $('#btnTemplates').onclick = () => { $('#tplGrid').innerHTML = CAT.templates.map(t => `<div class="tpl" data-tpl="${t.id}"><div class="pv">${templateSvg(t)}</div><b>${esc(t.label)}</b><small>${esc(t.desc)}</small></div>`).join(''); $('#dlgTemplates').showModal(); };
  $('#tplGrid').addEventListener('click', e => { const t = e.target.closest('[data-tpl]'); if (!t) return; applyTemplate(t.dataset.tpl); $('#dlgTemplates').close(); });
  function templateSvg(t) {
    const tree = t.tree(); const out = { leaves: [], gutters: [] }; layoutRects(tree, { x: 2, y: 2, w: 196, h: 92 }, out, 3);
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
    if (!tmdl.length) return toast('Keine Tabellen-.tmdl gefunden (erwartet: definition/tables/*.tmdl, ' + files.length + ' Dateien geprüft)');
    Promise.all(tmdl.map(f => f.text())).then(texts => {
      const tables = []; texts.forEach(t => parseTmdl(t).forEach(tb => tables.push(tb)));
      const rel = tmdl[0].webkitRelativePath || ''; const src = rel.includes('/') ? rel.split('/')[0] : `TMDL (${tmdl.length} Dateien)`;
      const good = tables.filter(t => t.columns.length || t.measures.length);
      if (!good.length) return toast('TMDL gelesen, aber keine Spalten/Measures erkannt. Datei ist vermutlich kein Tabellen-TMDL.');
      S.model = { tables: good, source: src, loadedAt: new Date().toISOString() }; commit();
      toast(`${good.length} Tabellen, ${good.reduce((a, t) => a + t.measures.length, 0)} Measures, ${good.reduce((a, t) => a + t.columns.length, 0)} Spalten geladen`);
    }).catch(err => toast('Lesen fehlgeschlagen: ' + err.message));
  }
  $('#btnImportTmdl').onclick = () => $('#fileTmdl').click();
  $('#fileTmdl').addEventListener('change', e => { ingestTmdlFiles(Array.from(e.target.files)); e.target.value = ''; });
  $('#fileTmdlSingle').addEventListener('change', e => { ingestTmdlFiles(Array.from(e.target.files)); e.target.value = ''; });
  $('#btnDemoModel').onclick = () => { S.model = JSON.parse(JSON.stringify(CAT.demoModel)); commit(); toast('Demo-Modell geladen'); };
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
    $('#modelMeta').textContent = m.tables.length ? `${m.source || 'Modell'} · ${m.tables.length} Tabellen · ${m.tables.reduce((a, t) => a + t.measures.length, 0)} Measures` : 'Kein Modell geladen';
    $('#nmTables').innerHTML = m.tables.map(t => `<option value="${esc(t.name)}">`).join('');
    const chip = (f, table, extra) => {
      const key = table + '|' + f.name; if (onlyUsed && !used.has(key)) return ''; if (q && !(f.name + ' ' + table).toLowerCase().includes(q)) return '';
      return `<span class="fchip ${f.kind === 'measure' ? 'm' : 'c'}${f.isNew ? ' new' : ''}${used.has(key) ? ' used' : ''}" draggable="true" data-field='${esc(JSON.stringify({ table, name: f.name, kind: f.kind, type: f.type || '', isNew: !!f.isNew }))}' title="${esc((f.desc || '') + (f.type ? ' · ' + f.type : '') + (f.open ? ' · offen: ' + f.open : ''))}"><span class="ico">${f.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(f.name)}</span>${extra || ''}</span>`;
    };
    let html = '';
    if (S.newFields.length) html += `<div class="table-block open"><div class="table-head"><span class="car">▸</span>Neu · zu erstellen<span class="cnt">${S.newFields.length}</span></div><div class="table-body">${S.newFields.map((f, i) => chip(f, f.table, `<button class="x" data-rmnew="${i}" title="Entfernen">×</button>`)).join('')}</div></div>`;
    if (!m.tables.length && !S.newFields.length) html += `<div class="empty-model"><strong>Noch kein Modell</strong>TMDL-Ordner laden, „Demo-Modell" klicken oder Kennzahlen/Dimensionen manuell anlegen.</div>`;
    m.tables.forEach(t => {
      const inner = t.measures.map(f => chip(f, t.name)).join('') + t.columns.filter(c => !c.hidden || used.has(t.name + '|' + c.name)).map(f => chip(f, t.name)).join('');
      if (!inner) return; const open = openTables.has(t.name) || !!q || onlyUsed;
      html += `<div class="table-block${open ? ' open' : ''}" data-table="${esc(t.name)}"><div class="table-head"><span class="car">▸</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.name)}</span><span class="cnt">${t.measures.length}Σ ${t.columns.length}≡</span></div><div class="table-body">${inner}</div></div>`;
    });
    list.innerHTML = html;
  }
  $('#modelList').addEventListener('click', e => {
    const rm = e.target.closest('[data-rmnew]'); if (rm) { S.newFields.splice(+rm.dataset.rmnew, 1); commit(); return; }
    const h = e.target.closest('.table-head'); if (!h) return; const blk = h.parentElement; const nm = blk.dataset.table; if (!nm) return;
    blk.classList.toggle('open'); if (blk.classList.contains('open')) openTables.add(nm); else openTables.delete(nm);
  });
  $('#modelList').addEventListener('dragstart', e => { const c = e.target.closest('[data-field]'); if (!c) return; e.dataTransfer.setData('application/mk-field', c.dataset.field); e.dataTransfer.effectAllowed = 'copy'; });
  $('#modelSearch').addEventListener('input', renderModel); $('#onlyUsed').addEventListener('change', renderModel);
  $('#btnNewMeasure').onclick = () => { $('#nmName').value = ''; $('#nmDesc').value = ''; $('#nmOpen').value = ''; $('#nmTable').value = $('#nmTable').value || (S.model.tables[0] ? S.model.tables[0].name : '_Measures'); $('#dlgNewMeasure').showModal(); $('#nmName').focus(); };
  $('#nmOk').onclick = () => {
    const name = $('#nmName').value.trim(); if (!name) return $('#nmName').focus();
    const kind = $('#nmKind').value;
    S.newFields.push({ id: uid(), name, table: $('#nmTable').value.trim() || (kind === 'measure' ? '_Measures' : 'DimNeu'), kind, desc: $('#nmDesc').value.trim(), open: $('#nmOpen').value.trim(), isNew: true, type: kind === 'measure' ? 'measure' : '' });
    $('#dlgNewMeasure').close(); commit(); toast('„' + name + '" angelegt · jetzt auf eine Kachel ziehen');
  };

  // ------------------------------------------------------------------ Zoom, Toolbar, Tastatur
  function fitZoom() { const r = stage.getBoundingClientRect(); zoom = clamp(Math.min((r.width - 60) / S.canvas.w, (r.height - 60) / S.canvas.h), 0.1, 2); }
  $('#btnZoomFit').onclick = () => { fitZoom(); render(); };
  $('#btnZoomIn').onclick = () => { zoom = clamp(zoom * 1.15, 0.1, 3); render(); };
  $('#btnZoomOut').onclick = () => { zoom = clamp(zoom / 1.15, 0.1, 3); render(); };
  window.addEventListener('resize', () => { fitZoom(); render(); });
  $('#btnHelp').onclick = () => $('#dlgHelp').showModal();
  $$('dialog [data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());
  window.addEventListener('keydown', e => {
    const t = e.target;
    if ((t && t.matches && t.matches('input,textarea,select')) || document.querySelector('dialog[open]')) { if (e.key === 'Escape' && t && t.blur) t.blur(); return; }
    if (e.key === 'Escape') { sel = null; render(); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { const n = findNode(sel).node; if (n.visual) { n.visual = null; commit(); } else removeLeaf(sel); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); $('#btnSave').click(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); $('#btnExport').click(); }
  });
  let toastT = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }

  // Öffentliche API für export.js
  window.MK = {
    get state() { return S; }, set state(v) { S = migrate(v); sel = null; commit(); },
    page, visuals, leaves, zones, computeAll, ui, toast, findNode, catalog: CAT, persist, pageBg: PAGE_BG,
    reset() { S = defaultState(); sel = null; undoStack = []; commit(); },
  };

  load(); snap = JSON.stringify(S); fitZoom(); render();
})();
