/* MockupKitchen · App-Kern: Zustand, Container-Layout, Rendering, Interaktion, Datenmodell (TMDL) */
(function () {
  'use strict';
  const CAT = window.MK_CATALOG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS_KEY = 'mockupkitchen.state.v1';

  // ------------------------------------------------------------------ Zustand
  function defaultState() {
    const tpl = CAT.templates.find(t => t.id === 'kpi4-main-detail');
    return {
      version: 1, name: 'Neue Berichtsseite', pageName: 'Übersicht', notes: '',
      canvas: { w: 1280, h: 720, preset: '1280x720' },
      spacing: { margin: 16, gutter: 12, pad: 8 },
      defScenario: 'AC/PL',
      chrome: {
        header: { on: true, h: 56, logo: true, title: 'Management Report', sub: 'in T€ · YTD 2026', nav: ['Übersicht', 'Umsatz', 'Kosten'] },
        nav: { on: false, w: 64 },
        filter: { on: true, side: 'right', w: 200, collapsible: false, fields: [] },
        footer: { on: true, h: 24, text: 'Stand: 18.09.2026 · Quelle: DWH · Kontakt: Controlling' },
      },
      layout: ensureIds(tpl.tree()),
      model: { tables: [], source: null },
      newFields: [],
    };
  }
  function ensureIds(node) {
    if (!node.id) node.id = uid();
    if (node.type === 'leaf') {
      if (node.visual) node.visual = normVisual(node.visual);
    } else node.children.forEach(c => ensureIds(c.node));
    return node;
  }
  function normVisual(v) {
    const def = CAT.byId[v.kind];
    const out = Object.assign({ kind: v.kind, engine: def ? def.engine : 'native', title: '', sub: '', scenario: S ? S.defScenario : 'AC/PL', roles: {}, notes: '' }, v);
    if (def && !def.engines.includes(out.engine)) out.engine = def.engine;
    out.roles = out.roles || {};
    return out;
  }

  let S = null;              // aktueller Zustand
  let sel = null;            // id der gewählten Kachel
  let zoom = 1;
  let undoStack = [];
  let lastRects = { leaves: [], gutters: [] };

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { S = JSON.parse(raw); ensureIds(S.layout); return; }
    } catch (e) { /* ignorieren */ }
    S = defaultState();
  }
  function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* voll oder blockiert */ } }
  // Undo: `snap` hält den letzten bestätigten Zustand; commit() legt ihn auf den Stapel und friert den neuen ein.
  // commit({noUndo:true}) rendert nur (z. B. während Tippen/Ziehen), mark() schließt so eine Serie als einen Undo-Schritt ab.
  let snap = null;
  function commit(opts) {
    if (!(opts && opts.noUndo)) { if (snap !== null) { undoStack.push(snap); if (undoStack.length > 40) undoStack.shift(); } snap = null; }
    persist();
    render();
    if (snap === null) snap = JSON.stringify(S);
  }
  function mark() { if (snap !== null) { undoStack.push(snap); if (undoStack.length > 40) undoStack.shift(); } snap = JSON.stringify(S); persist(); }
  function undo() {
    if (!undoStack.length) return toast('Nichts rückgängig zu machen');
    S = JSON.parse(undoStack.pop()); sel = null; snap = null; persist(); render(); snap = JSON.stringify(S); toast('Rückgängig');
  }

  // ------------------------------------------------------------------ Baum-Helfer
  function findNode(id, node, parent, idx) {
    node = node || S.layout;
    if (node.id === id) return { node, parent, idx };
    if (node.type === 'split') for (let i = 0; i < node.children.length; i++) { const r = findNode(id, node.children[i].node, node, i); if (r) return r; }
    return null;
  }
  function leaves(node, out) { node = node || S.layout; out = out || []; if (node.type === 'leaf') out.push(node); else node.children.forEach(c => leaves(c.node, out)); return out; }
  function visuals() { return leaves().filter(l => l.visual); }

  function splitLeaf(id, dir) {
    const f = findNode(id); if (!f) return;
    const leaf = f.node;
    const fresh = { id: uid(), type: 'leaf', visual: null };
    const keep = { id: leaf.id, type: 'leaf', visual: leaf.visual };
    if (f.parent && f.parent.dir === dir) {
      // gleiche Richtung: neues Kind neben dem bestehenden einfügen, Gewicht teilen
      const ch = f.parent.children[f.idx]; const half = ch.size / 2;
      ch.size = half; f.parent.children.splice(f.idx + 1, 0, { size: half, node: fresh });
    } else {
      const split = { id: leaf.id + '_s', type: 'split', dir, children: [{ size: 1, node: keep }, { size: 1, node: fresh }] };
      keep.id = uid();
      if (f.parent) f.parent.children[f.idx].node = split; else S.layout = split;
      if (sel === leaf.id) sel = keep.id;
    }
    commit();
  }
  function removeLeaf(id) {
    const f = findNode(id); if (!f) return;
    if (!f.parent) { f.node.visual = null; commit(); return; }     // Wurzel: nur leeren
    f.parent.children.splice(f.idx, 1);
    if (f.parent.children.length === 1) {                            // Split mit einem Kind auflösen
      const only = f.parent.children[0].node; const pf = findNode(f.parent.id);
      if (pf.parent) pf.parent.children[pf.idx].node = only; else S.layout = only;
    }
    if (sel === id) sel = null;
    commit();
  }
  function rebuildGrid(rows, cols) {
    const olds = visuals().map(l => l.visual);
    const mk = () => ({ id: uid(), type: 'leaf', visual: olds.shift() || null });
    const rowNode = () => cols === 1 ? mk() : { id: uid(), type: 'split', dir: 'row', children: Array.from({ length: cols }, () => ({ size: 1, node: mk() })) };
    S.layout = rows === 1 ? rowNode() : { id: uid(), type: 'split', dir: 'col', children: Array.from({ length: rows }, () => ({ size: 1, node: rowNode() })) };
    sel = null; commit();
  }
  function applyTemplate(tplId) {
    const tpl = CAT.templates.find(t => t.id === tplId); if (!tpl) return;
    S.layout = ensureIds(tpl.tree()); sel = null; commit(); toast('Vorlage „' + tpl.label + '" gesetzt');
  }

  // ------------------------------------------------------------------ Geometrie
  function zones() {
    const { w, h } = S.canvas; const c = S.chrome; const m = S.spacing.margin;
    let top = 0, bottom = h, left = 0, right = w; const z = {};
    if (c.nav.on) { z.nav = { x: 0, y: 0, w: c.nav.w, h }; left = c.nav.w; }
    if (c.header.on) { z.header = { x: left, y: 0, w: w - left, h: c.header.h }; top = c.header.h; }
    if (c.footer.on) { z.footer = { x: left, y: h - c.footer.h, w: w - left, h: c.footer.h }; bottom = h - c.footer.h; }
    if (c.filter.on) {
      if (c.filter.side === 'right') { z.filter = { x: w - c.filter.w, y: top, w: c.filter.w, h: bottom - top }; right = w - c.filter.w; }
      else { z.filter = { x: left, y: top, w: c.filter.w, h: bottom - top }; left += c.filter.w; }
    }
    z.content = { x: left + m, y: top + m, w: Math.max(40, right - left - 2 * m), h: Math.max(40, bottom - top - 2 * m) };
    return z;
  }
  function layoutRects(node, rect, out) {
    if (node.type === 'leaf') { out.leaves.push({ node, rect: roundRect(rect) }); return; }
    const g = S.spacing.gutter, n = node.children.length;
    const total = node.children.reduce((a, c) => a + c.size, 0) || 1;
    const span = (node.dir === 'row' ? rect.w : rect.h) - g * (n - 1);
    let pos = node.dir === 'row' ? rect.x : rect.y, acc = 0;
    node.children.forEach((ch, i) => {
      acc += ch.size;
      const end = (node.dir === 'row' ? rect.x : rect.y) + Math.round(span * acc / total) + g * i;
      const sz = Math.max(8, end - pos);
      const r = node.dir === 'row' ? { x: pos, y: rect.y, w: sz, h: rect.h } : { x: rect.x, y: pos, w: rect.w, h: sz };
      layoutRects(ch.node, r, out);
      pos += sz + g;
      if (i < n - 1) out.gutters.push({ parent: node, index: i, dir: node.dir, rect: node.dir === 'row' ? { x: pos - g, y: rect.y, w: g, h: rect.h } : { x: rect.x, y: pos - g, w: rect.w, h: g } });
    });
  }
  function roundRect(r) { return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) }; }
  function computeAll() { const z = zones(); const out = { leaves: [], gutters: [], zones: z }; layoutRects(S.layout, z.content, out); lastRects = out; return out; }
  window.MK_GEOM = { zones, computeAll };

  // ------------------------------------------------------------------ Rendering: Seite
  const page = $('#page'), stage = $('#stage');
  function render() {
    const { w, h } = S.canvas;
    page.style.width = w + 'px'; page.style.height = h + 'px';
    page.style.transform = 'scale(' + zoom + ')';
    $('#stageInner').style.minWidth = `max(100%, ${Math.round(w * zoom + 56)}px)`; $('#stageInner').style.minHeight = `max(100%, ${Math.round(h * zoom + 56)}px)`;
    page.style.marginRight = (w * zoom - w) + 'px'; page.style.marginBottom = (h * zoom - h) + 'px';
    const all = computeAll(); const z = all.zones; const c = S.chrome;
    let html = '';
    if (z.nav) html += `<div class="zone nav" style="${css(z.nav)}"><i class="logo"></i><i class="act"></i><i></i><i></i><i></i></div>`;
    if (z.header) {
      const nav = (c.header.nav || []).map((n, i) => `<span class="${i === 0 ? 'act' : ''}">${esc(n)}</span>`).join('');
      html += `<div class="zone header" style="${css(z.header)}">${c.header.logo ? '<div class="logo">LOGO</div>' : ''}<div style="min-width:0"><div class="ttl">${esc(c.header.title || 'Seitentitel')}</div>${c.header.sub ? `<div class="sub">${esc(c.header.sub)}</div>` : ''}</div>${nav ? `<div class="nav">${nav}</div>` : ''}</div>`;
    }
    if (z.footer) html += `<div class="zone footer" style="${css(z.footer)}">${esc(c.footer.text || '')}</div>`;
    if (z.filter) {
      const sl = (c.filter.fields || []).map((f, i) => `<div class="sl"><span class="nm">${esc(f.name)}</span><span class="x" data-rmfilter="${i}" title="Slicer entfernen">✕</span></div>`).join('');
      html += `<div class="zone filter ${c.filter.side}" style="${css(z.filter)}" data-dropfilter="1"><h4>Filter${c.filter.collapsible ? ' ⧉' : ''}</h4>${sl}<div class="sl ph">+ Feld hierher ziehen</div></div>`;
    }
    all.leaves.forEach(({ node, rect }) => { html += tileHtml(node, rect); });
    all.gutters.forEach((g, i) => { html += `<div class="gutter ${g.dir === 'row' ? 'v' : 'h'}" data-gutter="${i}" style="${css(g.rect)}"></div>`; });
    page.innerHTML = html;
    $('#stageInfo').textContent = `${w} × ${h} px · Inhalt ${z.content.w} × ${z.content.h} · Zoom ${Math.round(zoom * 100)} %`;
    renderInspector(); renderModel(); syncPageInputs();
  }
  function css(r) { return `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`; }

  function tileHtml(node, rect) {
    const v = node.visual; const selc = sel === node.id ? ' sel' : '';
    const tiny = rect.h < 70 || rect.w < 110;
    const acts = `<div class="t-actions"><button data-act="row" title="In Spalten teilen">⇔</button><button data-act="col" title="In Zeilen teilen">⇕</button><button data-act="rm" title="Kachel entfernen">✕</button></div>`;
    if (!v) return `<div class="tile empty${selc}" data-leaf="${node.id}" draggable="true" style="${css(rect)}"><span class="plus">+</span><span class="lbl">${tiny ? '' : 'Visual wählen oder Feld ablegen'}</span>${acts}</div>`;
    const def = CAT.byId[v.kind] || {};
    const pad = S.spacing.pad;
    const chips = roleChips(v);
    const headH = v.title || v.sub ? (tiny ? 18 : 24) : 0;
    const footH = chips && !tiny ? 18 : 0;
    const bw = Math.max(20, rect.w - 2 * pad - 4), bh = Math.max(12, rect.h - headH - footH - pad - 6);
    const svg = window.MK_SKETCH ? window.MK_SKETCH(def.sketch || v.kind, bw, bh, { scenario: v.scenario, seed: seedOf(node.id), label: v.sub || '' }) : '';
    return `<div class="tile${selc}${tiny ? ' tiny' : ''}" data-leaf="${node.id}" draggable="true" style="${css(rect)};padding:${Math.max(0, pad - 6)}px">
      ${headH ? `<div class="t-head"><span class="t-title">${esc(v.title || def.label)}</span>${v.sub ? `<span class="t-sub">${esc(v.sub)}</span>` : ''}</div>` : ''}
      <div class="t-body">${svg}</div>
      ${footH ? `<div class="t-foot">${chips}</div>` : ''}
      <span class="badge${v.engine === 'ck' ? ' ck' : ''}">${v.engine === 'ck' ? 'CK' : (v.engine === 'deneb' ? 'Deneb' : 'PBI')}</span>${acts}</div>`;
  }
  function roleChips(v) {
    const out = [];
    (CAT.byId[v.kind] ? CAT.byId[v.kind].roles : []).forEach(r => (v.roles[r.key] || []).forEach(f => out.push(`<span class="rchip${f.isNew ? ' new' : ''}" title="${esc(r.label)}">${esc(f.name)}</span>`)));
    return out.join('');
  }
  function seedOf(id) { let h = 7; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 1000; }

  // ------------------------------------------------------------------ Interaktion: Seite
  page.addEventListener('click', e => {
    const act = e.target.closest('[data-act]');
    const tile = e.target.closest('[data-leaf]');
    const rm = e.target.closest('[data-rmfilter]');
    if (rm) { S.chrome.filter.fields.splice(+rm.dataset.rmfilter, 1); commit(); return; }
    if (act && tile) {
      e.stopPropagation();
      const id = tile.dataset.leaf;
      if (act.dataset.act === 'rm') removeLeaf(id); else splitLeaf(id, act.dataset.act);
      return;
    }
    if (tile) { sel = tile.dataset.leaf; render(); if (!findNode(sel).node.visual && e.detail === 2) openCatalog(); return; }
    sel = null; render();
  });
  page.addEventListener('dblclick', e => { const tile = e.target.closest('[data-leaf]'); if (tile && !e.target.closest('[data-act]')) { sel = tile.dataset.leaf; openCatalog(); } });
  stage.addEventListener('click', e => { if (e.target === stage || e.target.id === 'stageInner') { sel = null; render(); } });

  // Gutter-Drag (Verhältnisse ändern)
  let gdrag = null;
  page.addEventListener('mousedown', e => {
    const g = e.target.closest('[data-gutter]'); if (!g) return;
    const gi = lastRects.gutters[+g.dataset.gutter]; if (!gi) return;
    e.preventDefault();
    const p = gi.parent, a = p.children[gi.index], b = p.children[gi.index + 1];
    const total = p.children.reduce((s, c) => s + c.size, 0);
    // Pixel-Spanne des Eltern-Knotens aus den Kind-Rechtecken ableiten
    const kids = lastRects.leaves.concat();
    const firstLeaf = leaves(p.children[0].node)[0], lastLeaf = leaves(p.children[p.children.length - 1].node).slice(-1)[0];
    const r0 = kids.find(l => l.node.id === firstLeaf.id).rect, r1 = kids.find(l => l.node.id === lastLeaf.id).rect;
    const spanPx = (gi.dir === 'row' ? (r1.x + r1.w - r0.x) : (r1.y + r1.h - r0.y)) - S.spacing.gutter * (p.children.length - 1);
    gdrag = { gi, a, b, a0: a.size, b0: b.size, unitPerPx: total / spanPx, x0: e.clientX, y0: e.clientY, el: g };
    g.classList.add('active');
  });
  window.addEventListener('mousemove', e => {
    if (!gdrag) return;
    const dpx = (gdrag.gi.dir === 'row' ? e.clientX - gdrag.x0 : e.clientY - gdrag.y0) / zoom;
    const d = dpx * gdrag.unitPerPx; const minU = 48 * gdrag.unitPerPx;
    let na = gdrag.a0 + d, nb = gdrag.b0 - d;
    if (na < minU) { nb -= (minU - na); na = minU; } if (nb < minU) { na -= (minU - nb); nb = minU; }
    gdrag.a.size = na; gdrag.b.size = nb;
    commit({ noUndo: true });
  });
  window.addEventListener('mouseup', () => { if (gdrag) { gdrag = null; mark(); render(); } });

  // Drag & Drop: Felder, Katalog-Typen, Kacheln
  let dragTile = null;
  page.addEventListener('dragstart', e => {
    const tile = e.target.closest('[data-leaf]'); if (!tile) return;
    dragTile = tile.dataset.leaf; e.dataTransfer.setData('application/mk-tile', dragTile); e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => tile.classList.add('dragging'), 0);
  });
  page.addEventListener('dragend', () => { dragTile = null; $$('.dragging', page).forEach(t => t.classList.remove('dragging')); });
  page.addEventListener('dragover', e => {
    const t = e.target.closest('[data-leaf],[data-dropfilter]'); if (!t) return;
    const types = e.dataTransfer.types;
    if (t.dataset.dropfilter && !types.includes('application/mk-field')) return;
    e.preventDefault(); e.dataTransfer.dropEffect = types.includes('application/mk-tile') ? 'move' : 'copy';
    $$('.over', page).forEach(x => x.classList.remove('over')); t.classList.add('over');
  });
  page.addEventListener('dragleave', e => { const t = e.target.closest('[data-leaf],[data-dropfilter]'); if (t && !t.contains(e.relatedTarget)) t.classList.remove('over'); });
  page.addEventListener('drop', e => {
    const t = e.target.closest('[data-leaf],[data-dropfilter]'); if (!t) return;
    e.preventDefault(); t.classList.remove('over');
    const field = e.dataTransfer.getData('application/mk-field');
    const kind = e.dataTransfer.getData('application/mk-kind');
    const tileId = e.dataTransfer.getData('application/mk-tile');
    if (t.dataset.dropfilter) { if (field) addFilterField(JSON.parse(field)); return; }
    const id = t.dataset.leaf;
    if (field) { assignField(id, JSON.parse(field)); return; }
    if (kind) { setKind(id, kind); return; }
    if (tileId && tileId !== id) { swapTiles(tileId, id); }
  });

  function swapTiles(a, b) {
    const na = findNode(a).node, nb = findNode(b).node; const tmp = na.visual; na.visual = nb.visual; nb.visual = tmp; sel = b; commit();
  }
  function setKind(id, kind) {
    const n = findNode(id).node; const def = CAT.byId[kind]; if (!def) return;
    const old = n.visual || {};
    const roles = {};
    // passende Rollen vom alten Visual übernehmen (gleicher Schlüssel oder sinnverwandt)
    const ALIAS = { ac: ['indicator', 'values', 'y'], indicator: ['ac', 'values'], ref: ['goal'], goal: ['ref'], values: ['ac', 'indicator'], category: ['rows', 'field'], rows: ['category'], field: ['category'] };
    def.roles.forEach(r => {
      const src = [r.key].concat(ALIAS[r.key] || []).find(k => old.roles && old.roles[k] && old.roles[k].length);
      if (src) roles[r.key] = old.roles[src].filter(f => r.kind === 'any' || f.kind === r.kind).slice(0, r.max);
    });
    n.visual = normVisual({ kind, engine: def.engine, title: old.title || '', sub: old.sub || '', scenario: old.scenario || S.defScenario, roles, notes: old.notes || '' });
    sel = id; commit();
  }
  function assignField(id, f, roleKey) {
    const n = findNode(id).node;
    if (!n.visual) {                                         // leere Kachel: Typ aus Feldart ableiten
      const kind = f.kind === 'measure' ? 'kpi' : 'slicer';
      n.visual = normVisual({ kind, engine: CAT.byId[kind].engine, roles: {} });
      if (!n.visual.title) n.visual.title = f.name;
    }
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
  function addFilterField(f) {
    const list = S.chrome.filter.fields;
    if (list.some(x => x.table === f.table && x.name === f.name)) return toast('Slicer existiert schon');
    list.push({ table: f.table, name: f.name, kind: f.kind, isNew: !!f.isNew }); commit();
  }

  // ------------------------------------------------------------------ Inspector
  const insEl = $('#insEl');
  function renderInspector() {
    const f = sel ? findNode(sel) : null;
    if (!f) { insEl.innerHTML = `<p class="hint">Kachel auf der Seite anklicken, um Typ, Titel und Datenrollen zu setzen.</p><div class="section"><h3>Schnellstart</h3><ol class="list-dense hint"><li>Rechts „Rahmen": Kopfband, Filter, Fußleiste</li><li>Kachel teilen (⇔ ⇕), Trennlinien ziehen</li><li>Doppelklick auf Kachel → Visual wählen</li><li>Felder aus dem Modell auf Kacheln ziehen</li><li>Export für Claude Code</li></ol></div>`; return; }
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
    insEl.innerHTML = `
      <button class="typebtn" id="btnPickType"><div class="pv">${pv}</div><div><b>${esc(def.label)}</b><small>${esc(def.group)} · Typ ändern</small></div></button>
      ${def.note ? `<p class="hint">${esc(def.note)}</p>` : ''}
      <div class="field" style="margin-top:10px"><label>Engine</label><div class="engine">${engines}</div></div>
      <div class="field"><label>Titel</label><input class="ctl" data-vk="title" value="${esc(v.title)}" placeholder="${esc(def.label)}"></div>
      <div class="field"><label>Untertitel / Einheit</label><input class="ctl" data-vk="sub" value="${esc(v.sub)}" placeholder="z. B. in T€, 2026 YTD"></div>
      ${hasRef ? `<div class="field"><label>Szenario</label><select class="ctl" data-vk="scenario">${['AC/PL', 'AC/PY', 'AC/PL/FC', 'AC'].map(s => `<option ${v.scenario === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>` : ''}
      <div class="section"><h3>Datenrollen</h3>${roles || '<p class="hint">Keine Datenrollen (statisches Element).</p>'}</div>
      <div class="field" style="margin-top:10px"><label>Notizen für den Aufbau</label><textarea class="ctl" data-vk="notes" placeholder="Sortierung, Drill, Bedingte Formatierung, Kommentar …">${esc(v.notes)}</textarea></div>
      ${dims}
      <div class="section row wrap"><button class="btn sm" data-ins="clear">Kachel leeren</button><button class="btn sm" data-ins="rm">Kachel entfernen</button></div>`;
    bindInspector(n);
  }
  function bindInspector(n) {
    const b = $('#btnPickType'); if (b) b.onclick = openCatalog;
    $$('[data-ins]', insEl).forEach(x => x.onclick = () => { if (x.dataset.ins === 'rm') removeLeaf(n.id); else { n.visual = null; commit(); } });
    $$('[data-engine]', insEl).forEach(x => x.onclick = () => { n.visual.engine = x.dataset.engine; commit(); });
    $$('[data-vk]', insEl).forEach(x => x.addEventListener('input', () => { n.visual[x.dataset.vk] = x.value; persist(); if (x.dataset.vk !== 'notes') renderPageOnly(); }));
    $$('[data-vk]', insEl).forEach(x => x.addEventListener('change', () => { n.visual[x.dataset.vk] = x.value; mark(); }));
    $$('[data-rmrole]', insEl).forEach(x => x.onclick = () => removeField(n.id, x.dataset.rmrole, +x.dataset.i));
    $$('.role', insEl).forEach(r => {
      r.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('application/mk-field')) { e.preventDefault(); r.classList.add('over'); } });
      r.addEventListener('dragleave', () => r.classList.remove('over'));
      r.addEventListener('drop', e => { e.preventDefault(); r.classList.remove('over'); const d = e.dataTransfer.getData('application/mk-field'); if (d) assignField(n.id, JSON.parse(d), r.dataset.role); });
    });
  }
  function renderPageOnly() { const keep = insEl.innerHTML; const act = document.activeElement; render(); if (act && act.dataset && act.dataset.vk) { const again = $(`[data-vk="${act.dataset.vk}"]`, insEl); if (again) { again.focus(); again.setSelectionRange && again.setSelectionRange(act.selectionStart, act.selectionEnd); } } void keep; }

  // Tabs rechts
  $$('.tab').forEach(t => t.onclick = () => { $$('.tab').forEach(x => x.classList.toggle('active', x === t)); ['el', 'page', 'chrome'].forEach(k => { $('#ins' + k[0].toUpperCase() + k.slice(1)).hidden = t.dataset.tab !== k; }); });

  // Seite/Rahmen-Formulare
  const bind = (id, get, set, ev) => {
    const el = $('#' + id); const val = () => el.type === 'checkbox' ? el.checked : el.value;
    if (ev === 'input') { el.addEventListener('input', () => { set(val()); commit({ noUndo: true }); }); el.addEventListener('change', () => { set(val()); mark(); }); }
    else el.addEventListener('change', () => { set(val()); commit(); });
    return el;
  };
  function syncPageInputs() {
    const c = S.chrome;
    $('#projName').value = S.name; $('#pageName').value = S.pageName; $('#pageNotes').value = S.notes;
    $('#canvasPreset').value = S.canvas.preset; $('#customSize').hidden = S.canvas.preset !== 'custom'; $('#canvasW').value = S.canvas.w; $('#canvasH').value = S.canvas.h;
    $('#spMargin').value = S.spacing.margin; $('#spGutter').value = S.spacing.gutter; $('#spPad').value = S.spacing.pad; $('#defScenario').value = S.defScenario;
    $('#hdOn').checked = c.header.on; $('#hdH').value = c.header.h; $('#hdLogo').checked = c.header.logo; $('#hdTitle').value = c.header.title; $('#hdSub').value = c.header.sub; $('#hdNav').value = (c.header.nav || []).join(', ');
    $('#nvOn').checked = c.nav.on; $('#nvW').value = c.nav.w;
    $('#ftOn').checked = c.filter.on; $('#ftSide').value = c.filter.side; $('#ftW').value = c.filter.w; $('#ftCollapsible').checked = c.filter.collapsible;
    $('#ffOn').checked = c.footer.on; $('#ffH').value = c.footer.h; $('#ffText').value = c.footer.text;
  }
  bind('projName', 0, v => S.name = v, 'input');
  bind('pageName', 0, v => S.pageName = v, 'input');
  bind('pageNotes', 0, v => S.notes = v, 'input');
  bind('canvasPreset', 0, v => { S.canvas.preset = v; if (v !== 'custom') { const [w, h] = v.split('x').map(Number); S.canvas.w = w; S.canvas.h = h; fitZoom(); } });
  bind('canvasW', 0, v => S.canvas.w = clamp(+v || 1280, 320, 4000)); bind('canvasH', 0, v => S.canvas.h = clamp(+v || 720, 200, 4000));
  bind('spMargin', 0, v => S.spacing.margin = clamp(+v, 0, 64), 'input'); bind('spGutter', 0, v => S.spacing.gutter = clamp(+v, 0, 48), 'input'); bind('spPad', 0, v => S.spacing.pad = clamp(+v, 0, 32), 'input');
  bind('defScenario', 0, v => S.defScenario = v);
  bind('hdOn', 0, v => S.chrome.header.on = v); bind('hdH', 0, v => S.chrome.header.h = clamp(+v, 32, 120), 'input'); bind('hdLogo', 0, v => S.chrome.header.logo = v);
  bind('hdTitle', 0, v => S.chrome.header.title = v, 'input'); bind('hdSub', 0, v => S.chrome.header.sub = v, 'input'); bind('hdNav', 0, v => S.chrome.header.nav = v.split(',').map(s => s.trim()).filter(Boolean), 'input');
  bind('nvOn', 0, v => S.chrome.nav.on = v); bind('nvW', 0, v => S.chrome.nav.w = clamp(+v, 40, 120), 'input');
  bind('ftOn', 0, v => S.chrome.filter.on = v); bind('ftSide', 0, v => S.chrome.filter.side = v); bind('ftW', 0, v => S.chrome.filter.w = clamp(+v, 120, 360), 'input'); bind('ftCollapsible', 0, v => S.chrome.filter.collapsible = v);
  bind('ffOn', 0, v => S.chrome.footer.on = v); bind('ffH', 0, v => S.chrome.footer.h = clamp(+v, 16, 48), 'input'); bind('ffText', 0, v => S.chrome.footer.text = v, 'input');
  $('#btnSplitRoot').onclick = () => $('#dlgSplit').showModal();
  $('#spOk').onclick = () => { rebuildGrid(clamp(+$('#spRows').value || 1, 1, 6), clamp(+$('#spCols').value || 1, 1, 6)); $('#dlgSplit').close(); };

  // ------------------------------------------------------------------ Katalog-Dialog
  const dlgCat = $('#dlgCatalog');
  function openCatalog() {
    if (!sel) return toast('Erst eine Kachel wählen');
    renderCatalog(''); dlgCat.showModal(); $('#catSearch').value = ''; $('#catSearch').focus();
  }
  function renderCatalog(q) {
    q = (q || '').toLowerCase(); const cur = sel ? (findNode(sel).node.visual || {}).kind : null;
    let html = '';
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
  $('#btnTemplates').onclick = () => {
    $('#tplGrid').innerHTML = CAT.templates.map(t => `<div class="tpl" data-tpl="${t.id}"><div class="pv">${templateSvg(t)}</div><b>${esc(t.label)}</b><small>${esc(t.desc)}</small></div>`).join('');
    $('#dlgTemplates').showModal();
  };
  $('#tplGrid').addEventListener('click', e => { const t = e.target.closest('[data-tpl]'); if (!t) return; applyTemplate(t.dataset.tpl); $('#dlgTemplates').close(); });
  function templateSvg(t) {
    const tree = ensureIds(t.tree()); const out = { leaves: [], gutters: [] };
    const save = S.spacing.gutter; S.spacing.gutter = 3; layoutRects(tree, { x: 2, y: 2, w: 196, h: 92 }, out); S.spacing.gutter = save;
    return `<svg viewBox="0 0 200 96">${out.leaves.map(l => `<rect x="${l.rect.x}" y="${l.rect.y}" width="${l.rect.w}" height="${l.rect.h}" rx="2" fill="${l.node.visual ? '#E9EEF5' : '#fff'}" stroke="#C9C6BA" stroke-dasharray="${l.node.visual ? '' : '3 2'}"/>${l.node.visual ? `<text x="${l.rect.x + 4}" y="${l.rect.y + 11}" font-size="7" fill="#475569" font-family="Geist,system-ui">${esc((CAT.byId[l.node.visual.kind] || {}).label || '').slice(0, Math.max(3, l.rect.w / 5))}</text>` : ''}`).join('')}</svg>`;
  }

  // ------------------------------------------------------------------ Datenmodell (TMDL)
  function parseTmdl(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    let table = null; let cur = null; let pendingDesc = [];
    const out = [];
    const unq = s => { s = s.trim(); return (s.startsWith("'") && s.endsWith("'")) ? s.slice(1, -1).replace(/''/g, "'") : s; };
    for (const raw of lines) {
      const line = raw.replace(/\t/g, '    ');
      const indent = line.match(/^ */)[0].length;
      const t = line.trim();
      if (!t) { continue; }
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
          cur = { name: unq(m[2]), kind, type: kind === 'measure' ? 'measure' : '', desc: pendingDesc.join(' '), hidden: false, format: '' };
          pendingDesc = [];
          if (kind === 'measure') table.measures.push(cur); else if (kind === 'column') table.columns.push(cur); else cur = null;
        } else if (t.startsWith('isHidden') && indent <= 4 && !cur) table.hidden = true;
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
    if (!tmdl.length) return toast('Keine Tabellen-.tmdl gefunden (erwartet: definition/tables/*.tmdl)');
    Promise.all(tmdl.map(f => f.text())).then(texts => {
      const tables = [];
      texts.forEach(t => parseTmdl(t).forEach(tb => tables.push(tb)));
      const rel = tmdl[0].webkitRelativePath || '';
      const src = rel.includes('/') ? rel.split('/')[0] : `TMDL (${tmdl.length} Dateien)`;
      S.model = { tables: tables.filter(t => t.columns.length || t.measures.length), source: src, loadedAt: new Date().toISOString() };
      commit();
      const nM = tables.reduce((a, t) => a + t.measures.length, 0), nC = tables.reduce((a, t) => a + t.columns.length, 0);
      toast(`${tables.length} Tabellen, ${nM} Measures, ${nC} Spalten geladen`);
    });
  }
  $('#btnImportTmdl').onclick = () => $('#fileTmdl').click();
  $('#fileTmdl').addEventListener('change', e => ingestTmdlFiles(Array.from(e.target.files)));
  $('#fileTmdlSingle').addEventListener('change', e => ingestTmdlFiles(Array.from(e.target.files)));
  const mdrop = $('#modelDrop');
  mdrop.addEventListener('click', () => $('#fileTmdlSingle').click());
  mdrop.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); mdrop.classList.add('over'); } });
  mdrop.addEventListener('dragleave', () => mdrop.classList.remove('over'));
  mdrop.addEventListener('drop', async e => {
    e.preventDefault(); mdrop.classList.remove('over');
    const items = Array.from(e.dataTransfer.items || []);
    const files = [];
    const walk = entry => new Promise(res => {
      if (entry.isFile) entry.file(f => { files.push(f); res(); });
      else if (entry.isDirectory) { const rd = entry.createReader(); const all = []; const next = () => rd.readEntries(async ents => { if (!ents.length) { for (const en of all) await walk(en); res(); } else { all.push(...ents); next(); } }); next(); }
      else res();
    });
    for (const it of items) { const en = it.webkitGetAsEntry && it.webkitGetAsEntry(); if (en) await walk(en); else if (it.getAsFile()) files.push(it.getAsFile()); }
    ingestTmdlFiles(files.length ? files : Array.from(e.dataTransfer.files));
  });

  function usedFieldKeys() {
    const set = new Set();
    visuals().forEach(l => Object.values(l.visual.roles).forEach(list => list.forEach(f => set.add(f.table + '|' + f.name))));
    (S.chrome.filter.fields || []).forEach(f => set.add(f.table + '|' + f.name));
    return set;
  }
  function renderModel() {
    const list = $('#modelList'); const q = ($('#modelSearch').value || '').toLowerCase(); const onlyUsed = $('#onlyUsed').checked; const used = usedFieldKeys();
    const m = S.model;
    $('#modelMeta').textContent = m.tables.length ? `${m.source || 'Modell'} · ${m.tables.length} Tabellen · ${m.tables.reduce((a, t) => a + t.measures.length, 0)} Measures` : 'Kein Modell geladen';
    $('#nmTables').innerHTML = m.tables.map(t => `<option value="${esc(t.name)}">`).join('');
    const chip = (f, table, extra) => {
      const key = table + '|' + f.name; if (onlyUsed && !used.has(key)) return ''; if (q && !(f.name + ' ' + table).toLowerCase().includes(q)) return '';
      return `<span class="fchip ${f.kind === 'measure' ? 'm' : 'c'}${f.isNew ? ' new' : ''}${used.has(key) ? ' used' : ''}" draggable="true" data-field='${esc(JSON.stringify({ table, name: f.name, kind: f.kind, type: f.type || '', isNew: !!f.isNew }))}' title="${esc((f.desc || '') + (f.type ? ' · ' + f.type : ''))}"><span class="ico">${f.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(f.name)}</span>${extra || ''}</span>`;
    };
    let html = '';
    if (S.newFields.length) {
      html += `<div class="table-block open"><div class="table-head"><span class="car">▸</span>Neu · zu erstellen<span class="cnt">${S.newFields.length}</span></div><div class="table-body">${S.newFields.map((f, i) => chip(f, f.table, `<button class="x" data-rmnew="${i}" title="Entfernen">×</button>`)).join('')}</div></div>`;
    }
    if (!m.tables.length && !S.newFields.length) { html += `<div class="empty-model"><strong>Noch kein Modell</strong>TMDL-Ordner laden oder Kennzahlen manuell anlegen. Ohne Modell funktioniert alles, nur die Felder fehlen.</div>`; }
    m.tables.forEach((t, ti) => {
      const inner = t.measures.map(f => chip(f, t.name)).join('') + t.columns.filter(c => !c.hidden || used.has(t.name + '|' + c.name)).map(f => chip(f, t.name)).join('');
      if (!inner) return;
      const open = openTables.has(t.name) || !!q || onlyUsed;
      html += `<div class="table-block${open ? ' open' : ''}" data-table="${esc(t.name)}"><div class="table-head"><span class="car">▸</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.name)}</span><span class="cnt">${t.measures.length}Σ ${t.columns.length}≡</span></div><div class="table-body">${inner}</div></div>`;
      void ti;
    });
    list.innerHTML = html;
  }
  const openTables = new Set();
  $('#modelList').addEventListener('click', e => {
    const rm = e.target.closest('[data-rmnew]'); if (rm) { S.newFields.splice(+rm.dataset.rmnew, 1); commit(); return; }
    const h = e.target.closest('.table-head'); if (!h) return; const blk = h.parentElement; const nm = blk.dataset.table; if (!nm) return;
    blk.classList.toggle('open'); if (blk.classList.contains('open')) openTables.add(nm); else openTables.delete(nm);
  });
  $('#modelList').addEventListener('dragstart', e => { const c = e.target.closest('[data-field]'); if (!c) return; e.dataTransfer.setData('application/mk-field', c.dataset.field); e.dataTransfer.effectAllowed = 'copy'; });
  $('#modelSearch').addEventListener('input', renderModel); $('#onlyUsed').addEventListener('change', renderModel);
  $('#btnNewMeasure').onclick = () => { $('#nmName').value = ''; $('#nmDesc').value = ''; $('#nmTable').value = $('#nmTable').value || (S.model.tables[0] ? S.model.tables[0].name : '_Measures'); $('#dlgNewMeasure').showModal(); $('#nmName').focus(); };
  $('#nmOk').onclick = () => {
    const name = $('#nmName').value.trim(); if (!name) return $('#nmName').focus();
    S.newFields.push({ id: uid(), name, table: $('#nmTable').value.trim() || '_Measures', kind: $('#nmKind').value, desc: $('#nmDesc').value.trim(), isNew: true, type: $('#nmKind').value === 'measure' ? 'measure' : '' });
    $('#dlgNewMeasure').close(); commit(); toast('„' + name + '" angelegt · jetzt auf eine Kachel ziehen');
  };

  // ------------------------------------------------------------------ Zoom, Toolbar, Tastatur
  function fitZoom() { const r = stage.getBoundingClientRect(); zoom = clamp(Math.min((r.width - 60) / S.canvas.w, (r.height - 60) / S.canvas.h), 0.2, 2); }
  $('#btnZoomFit').onclick = () => { fitZoom(); render(); };
  $('#btnZoomIn').onclick = () => { zoom = clamp(zoom * 1.15, 0.2, 3); render(); };
  $('#btnZoomOut').onclick = () => { zoom = clamp(zoom / 1.15, 0.2, 3); render(); };
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
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

  // Öffentliche API für export.js
  window.MK = {
    get state() { return S; }, set state(v) { S = v; ensureIds(S.layout); sel = null; commit(); },
    visuals, leaves, zones, computeAll, toast, findNode, catalog: CAT, persist,
    reset() { S = defaultState(); sel = null; undoStack = []; commit(); },
  };

  load(); snap = JSON.stringify(S); fitZoom(); render();
})();
