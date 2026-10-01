/* MockupKitchen · Layout aus dem PBIR lesen (v0.6)
   Das PBIP ist die Wahrheit: bestehende Berichtsseiten werden zu Kitchen-Seiten, damit am echten Layout weitergearbeitet wird.

   MK_PBIR.readDir(handle)      FileSystemDirectoryHandle des <Name>.Report-Ordners (oder des Projektordners) → Promise<Ergebnis>
   MK_PBIR.fromDefinition(def)  rein: { name?, pagesOrder:[…], pages:[{ folder, page:<page.json>, visuals:[{ folder, visual:<visual.json> }] }] } → Ergebnis
   MK_PBIR.applyTo(MK, res)     übernimmt ein Ergebnis in den Kitchen-Zustand (Leinwand, Abstände, Rahmen, Seiten) über die öffentliche MK-API

   Ergebnis: { pages, warnings, canvas, spacing, chrome, skipped, stats }
     pages    genau im Format von S.pages (app.js): { id, name, notes, question, layout, pbir:{ page } }, jede Kachel mit visual.pbir = { page, visual, type }
     canvas / spacing / chrome   berichtsweite Einstellungen, ohne die die Rechtecke nicht exakt nachgerechnet werden (Leinwand, Rand und
              Zwischenraum sowie Kopf-, Navigations-, Filter- und Fußzone gelten im Kitchen für alle Seiten)
     skipped  [{ page, visual, type, reason }] was nicht zur Kachel wurde (Rahmen, Deko, Hintergrund, Überlagerung, ausgeblendet)
     stats    je Seite { page, tiles, maxDev } und gesamt maxDev (px, Kitchen-Rechteck gegen PBIR-Position)

   Geometrie: Kitchen legt ein Raster mit einheitlichem Zwischenraum g über den Inhaltsbereich (layoutRects in app.js). Aus den Kanten der
   Visuals entstehen Spalten- und Zeilenspuren mit Gewicht = Breite in px; Visuals über mehrere Spuren bekommen Spans, Lücken werden leere
   Kacheln. Kanten innerhalb von 4 px rasten ein. Rand m und Zwischenraum g werden aus den Abständen im Bericht so gewählt, dass die
   Rechtecke am genauesten wiederkommen; Abstände, die nicht g sind, werden eigene (leere) Spuren. */
(function (root) {
  'use strict';

  const SNAP = 4;          // Kanten, die höchstens so weit auseinanderliegen, rasten ein; Überlappung bis dahin gilt als Ungenauigkeit
  const MIN_TRACK = 8;     // kleinste Spur, die layoutRects zeichnet (Math.max(8, …))
  const EDGE_TOL = 2, INSIDE_TOL = 2;
  const PRESETS = ['1280x720', '1920x1080', '3840x2160', '1280x960', '1080x1920'];
  const DECOR = { textbox: 1, image: 1, shape: 1, basicShape: 1, actionButton: 1, pageNavigator: 1, bookmarkNavigator: 1 };
  const SHAPES = { shape: 1, basicShape: 1, image: 1 };
  const SLICERS = { slicer: 1, advancedSlicerVisual: 1, listSlicer: 1, textSlicer: 1 };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const kOf = w => Math.max(0.6, Math.min(3.2, w / 1280));
  const catalog = () => root.MK_CATALOG || null;

  // ------------------------------------------------------------------ PBIR-Ausdrücke lesen
  function literal(expr) {
    const v = expr && expr.expr && expr.expr.Literal ? expr.expr.Literal.Value : undefined;
    if (typeof v !== 'string') return v;
    if (v.length >= 2 && v[0] === "'" && v[v.length - 1] === "'") return v.slice(1, -1).replace(/''/g, "'");
    if (/^-?\d+(\.\d+)?[DLM]$/.test(v)) return parseFloat(v);
    if (v === 'true' || v === 'false') return v === 'true';
    return v;
  }
  function prop(objs, group, name) {
    const list = (objs || {})[group]; if (!Array.isArray(list)) return undefined;
    for (const e of list) { const p = (e && e.properties) || {}; if (name in p) return literal(p[name]); }
    return undefined;
  }
  function textboxText(vis) {
    const out = [];
    ((vis.objects || {}).general || []).forEach(e => ((e.properties || {}).paragraphs || []).forEach(para => {
      const line = (para.textRuns || []).map(r => (typeof r.value === 'string' ? r.value : '{…}')).join('');
      if (line.trim()) out.push(line.trim());
    }));
    return out.join('\n');
  }
  function shapeText(vis) { const t = prop(vis.objects, 'text', 'text'); return typeof t === 'string' ? t.trim() : ''; }
  function titleOf(vis) { const t = prop(vis.visualContainerObjects, 'title', 'text'); return typeof t === 'string' ? t.trim() : ''; }
  // Feldbezug aus einer Projektion: Column / Measure / Aggregation / HierarchyLevel
  function entityOf(e) { const s = e && e.SourceRef; return s ? (s.Entity || s.Source || '') : ''; }
  function fieldOf(f) {
    if (!f) return null;
    if (f.Column) return { table: entityOf(f.Column.Expression), name: f.Column.Property, kind: 'column' };
    if (f.Measure) return { table: entityOf(f.Measure.Expression), name: f.Measure.Property, kind: 'measure' };
    if (f.Aggregation) { const inner = fieldOf(f.Aggregation.Expression); if (inner) { inner.agg = f.Aggregation.Function; } return inner; }
    if (f.HierarchyLevel) {
      // Datumshierarchie: Hierarchy.Expression.PropertyVariationSource { Expression, Property } → die Datumsspalte; sonst Stufe als Spalte
      const h = (f.HierarchyLevel.Expression || {}).Hierarchy || {}; const src = (h.Expression || {}).PropertyVariationSource;
      if (src) return { table: entityOf(src.Expression), name: src.Property, kind: 'column', level: f.HierarchyLevel.Level };
      return { table: entityOf(h.Expression), name: f.HierarchyLevel.Level, kind: 'column', hierarchy: h.Hierarchy };
    }
    return null;
  }
  const friendlyType = t => String(t || '?').replace(/[0-9A-F]{32}$/i, '') || String(t);

  // ------------------------------------------------------------------ Typen: PBIR → Kitchen
  // Umkehrung von catalog.js (native.type) bzw. export.js: wo möglich die Art, deren native.type dem Quelltyp entspricht,
  // damit ein Rückweg per Delta den Visual-Typ nicht ändert. b = PBIR-Rolle → Kitchen-Rolle.
  const NATIVE = {
    clusteredColumnChart: { kind: 'ncolumn', b: { Category: 'category', Series: 'series', Y: 'values', Rows: 'multiples' } },
    clusteredBarChart: { kind: 'nbar', b: { Category: 'category', Series: 'series', Y: 'values', Rows: 'multiples' } },
    lineChart: { kind: 'nline', b: { Category: 'category', Series: 'series', Y: 'values', Y2: 'values', Rows: 'multiples' } },
    columnChart: { kind: 'stackcol', b: { Category: 'category', Series: 'series', Y: 'ac', Rows: 'multiples' } },
    hundredPercentStackedColumnChart: { kind: 'stackcol', b: { Category: 'category', Series: 'series', Y: 'ac' } },
    ribbonChart: { kind: 'stackcol', b: { Category: 'category', Series: 'series', Y: 'ac' } },
    barChart: { kind: 'stackbar', b: { Category: 'category', Series: 'series', Y: 'ac', Rows: 'multiples' } },
    hundredPercentStackedBarChart: { kind: 'stackbar', b: { Category: 'category', Series: 'series', Y: 'ac' } },
    funnel: { kind: 'nbar', b: { Category: 'category', Y: 'values' } },
    areaChart: { kind: 'area', b: { Category: 'category', Series: 'series', Y: 'ac' } },
    stackedAreaChart: { kind: 'area', b: { Category: 'category', Series: 'series', Y: 'ac' } },
    lineClusteredColumnComboChart: { kind: 'colline', b: { Category: 'category', Y: 'ac', Y2: 'ref' } },
    lineStackedColumnComboChart: { kind: 'colline', b: { Category: 'category', Y: 'ac', Y2: 'ref' } },
    waterfallChart: { kind: 'waterfall', b: { Category: 'category', Y: 'ac' } },
    decompositionTreeVisual: { kind: 'decomp', b: { Analyze: 'ac', ExplainBy: 'category' } },
    pivotTable: { kind: 'matrix', b: { Rows: 'rows', Columns: 'columns', Values: 'values' } },
    tableEx: { kind: 'table', b: { Values: '*table' } },
    scatterChart: { kind: 'scatter', b: { Category: 'category', Details: 'category', X: 'x', Y: 'y', Size: 'size' } },
    card: { kind: 'card', b: { Values: 'indicator' } },
    cardVisual: { kind: 'card', b: { Data: 'indicator' } },
    multiRowCard: { kind: 'multirow', b: { Values: 'values' } },
    kpi: { kind: 'kpi', b: { Indicator: 'indicator', Goal: 'goal', TrendLine: 'category' } },
    gauge: { kind: 'gauge', b: { Y: 'indicator', TargetValue: 'goal' } },
    donutChart: { kind: 'ndonut', b: { Category: 'category', Y: 'ac' } },
    pieChart: { kind: 'pie', b: { Category: 'category', Y: 'ac' } },
    treemap: { kind: 'treemap', b: { Group: 'category', Values: 'ac' } },
    map: { kind: 'map', b: { Category: 'category', Size: 'size' } },
    filledMap: { kind: 'map', b: { Category: 'category', Location: 'category', Size: 'size' } },
    azureMap: { kind: 'map', b: { Category: 'category', Location: 'category', Size: 'size' } },
    shapeMap: { kind: 'map', b: { Category: 'category', Location: 'category', Size: 'size' } },
    slicer: { kind: 'slicer', b: { Values: 'field' } },
    advancedSlicerVisual: { kind: 'slicer', b: { Values: 'field' } },
    listSlicer: { kind: 'slicer', b: { Values: 'field' } },
    textSlicer: { kind: 'slicer', b: { Values: 'field' } },
    textbox: { kind: 'text', b: {} }, image: { kind: 'image', b: {} }, actionButton: { kind: 'button', b: {} },
    pageNavigator: { kind: 'button', b: {} }, bookmarkNavigator: { kind: 'button', b: {} },
    shape: { kind: 'text', b: {} }, basicShape: { kind: 'text', b: {} },
  };
  // ChartKitchen (chart.orientation → Kitchen-Art, Umkehrung von CK_MODE in catalog.js)
  const CK_KIND = { columns: 'columns', bars: 'bars', dumbbell: 'dotplot', pareto: 'pareto', line: 'line', slope: 'slope', intwaterfall: 'varint', waterfall: 'waterfall', catbridge: 'bridge', cards: 'kpi', table: 'table' };
  const CK_ROLES = { category: 'category', actual: 'ac', plan: 'ref', previousYear: 'ref', benchmark: 'ref', prevForecast: 'ref', forecast: 'fc', multiples: 'multiples' };
  function customKind(vt) {
    if (/^chartKitchenByDatenWG|^ibcsInspiredChartDeck/i.test(vt)) return { kind: null, engine: 'ck', b: CK_ROLES };
    if (/^pnlByDatenWG/i.test(vt)) return { kind: 'pnl', engine: 'custom', b: { levels: 'rows', ac: 'ac', py: 'ref', pl: 'ref', plFy: 'ref', fc: 'fc', rowType: 'rowType' } };
    if (/^dataKitchenGantt/i.test(vt)) return { kind: 'gantt', engine: 'custom', b: { task: 'category', start: 'start', end: 'end', phase: 'series' } };
    if (/^deneb/i.test(vt)) return { kind: 'deneb', engine: 'deneb', b: { dataset: 'values' } };
    return null;
  }
  // Erste Art, die der Katalog kennt (erlaubt spätere eigene Arten für Zeit-/Button-Slicer oder unbekannte Visuals)
  function firstKind(ids) { const C = catalog(); if (!C) return ids[ids.length - 1]; return ids.find(id => C.byId[id]) || ids[ids.length - 1]; }
  function slicerTypeOf(vt, vis, fields) {
    if (vt === 'advancedSlicerVisual') return 'button';
    if (vt === 'textSlicer') return 'search';
    if (vt === 'listSlicer') return 'list';
    const mode = String(prop(vis.objects, 'data', 'mode') || '').toLowerCase();
    const orient = prop(vis.objects, 'general', 'orientation'); const search = prop(vis.objects, 'general', 'selfFilterEnabled');
    const dateish = fields.some(f => /date|datum|tag|day/i.test(f.name) || f.level);
    if (mode === 'relative' || mode === 'relativetime' || mode === 'relativedatepicker') return 'relative';
    if (mode === 'between' || mode === 'before' || mode === 'after') return dateish ? 'date' : 'between';
    if (mode === 'basic' || mode === 'verticallist' || mode === 'horizontallist') return search ? 'search' : (+orient === 1 || mode === 'horizontallist' ? 'tile' : 'list');
    return 'dropdown';
  }
  function rolesMax(kind, analysis) {
    const C = catalog(); const def = C && C.byId[kind]; if (!def) return null;
    const out = {}; (C.rolesFor ? C.rolesFor(def, { analysis: analysis || {} }) : def.roles).forEach(r => { out[r.key] = r; });
    return out;
  }

  // Ein PBIR-Visual → Kitchen-Visual (ohne Position). pageIds: Seitenordner → Kitchen-Seiten-ID (für Button-Links)
  function toVisual(it, pageFolder, pageIds, warn) {
    const vis = it.vis; const vt = it.type; const title = titleOf(vis);
    let spec = NATIVE[vt], engine = 'native', kind, fieldsLost = [];
    const cust = !spec ? customKind(vt) : null;
    if (cust) { engine = cust.engine; kind = cust.kind; spec = { b: cust.b }; if (engine === 'ck') { const o = String(prop(vis.objects, 'chart', 'orientation') || 'columns'); kind = CK_KIND[o] || 'columns'; } }
    else if (spec) kind = spec.kind;
    const v = { kind: null, engine, title, sub: '', roles: {}, notes: '', link: '', content: '', analysis: {}, priority: '', status: 'open', openQuestion: false, pbir: { page: pageFolder, visual: it.folder, type: vt } };
    // Bindungen einsammeln
    const qs = ((vis.query || {}).queryState) || {}; const byBucket = {};
    Object.keys(qs).forEach(b => { (qs[b].projections || []).forEach(pr => { const f = fieldOf(pr.field); if (f && f.table && f.name) (byBucket[b] = byBucket[b] || []).push(f); else fieldsLost.push(b + ':' + Object.keys(pr.field || {})[0]); }); });
    if (!spec) {
      // unbekanntes oder fremdes Custom Visual: allgemeine Kachel mit Typvermerk
      kind = firstKind(['custom', 'generic', 'text']);
      v.title = title || friendlyType(vt); v.content = friendlyType(vt) + (title ? ' · ' + title : '');
      const all = Object.keys(byBucket).map(b => b + ': ' + byBucket[b].map(f => f.table + '.' + f.name).join(', '));
      v.notes = 'PBIR-Visual ' + vt + (all.length ? ' · ' + all.join(' · ') : '');
      v.kind = kind; v.engine = 'native'; v.pbir.lossy = true;
      warn('VISUAL_UNKNOWN', `${friendlyType(vt)}: Typ im Kitchen nicht vorhanden, als allgemeine Kachel übernommen`, it);
      return v;
    }
    if (vt === 'cardVisual' && (byBucket.Data || []).length > 1) { kind = 'multirow'; spec = { b: { Data: 'values' } }; }
    if (SLICERS[vt]) {
      const st = slicerTypeOf(vt, vis, byBucket.Values || []);
      kind = st === 'button' ? firstKind(['btnslicer', 'buttonslicer', 'slicerButton', 'slicer']) : (st === 'date' || st === 'relative') ? firstKind(['timeslicer', 'dateslicer', 'slicerTime', 'slicer']) : 'slicer';
      v.slicerType = st;
    }
    if (vt === 'textbox') { v.content = textboxText(vis); v.title = title; }
    if (vt === 'shape' || vt === 'basicShape') { v.content = shapeText(vis); }
    if (vt === 'actionButton' || vt === 'pageNavigator' || vt === 'bookmarkNavigator') {
      v.content = shapeText(vis) || title || (vt === 'actionButton' ? '' : friendlyType(vt));
      const tgt = prop(vis.visualContainerObjects, 'visualLink', 'navigationSection') || prop(vis.objects, 'visualLink', 'navigationSection');
      if (tgt && pageIds[tgt]) v.link = pageIds[tgt];
    }
    v.kind = kind; v.engine = engine;
    // Rollen belegen, Obergrenzen aus dem Katalog; was nicht passt, bleibt im Hinweis (Rückweg darf die Bindung dann nicht überschreiben)
    if (byBucket.Rows && spec.b.Rows === 'multiples') v.analysis.smallMultiples = true;
    const lim = rolesMax(kind, v.analysis);
    const put = (role, f) => {
      const r = lim && lim[role]; const list = v.roles[role] = v.roles[role] || [];
      if (lim && !r) { fieldsLost.push(role + ':' + f.table + '.' + f.name); return; }
      if (r && list.length >= r.max) { fieldsLost.push(role + ':' + f.table + '.' + f.name); return; }
      list.push(Object.assign({ isNew: false }, f));
    };
    Object.keys(byBucket).forEach(b => {
      const role = spec.b[b];
      byBucket[b].forEach(f => {
        if (!role) { fieldsLost.push(b + ':' + f.table + '.' + f.name); return; }
        if (role === '*table') { if (f.kind === 'measure' || f.agg != null) { if (!(v.roles.ac || []).length) put('ac', f); else put('ref', f); } else put('rows', f); return; }
        put(role, f);
      });
    });
    Object.keys(v.roles).forEach(k => { if (!v.roles[k].length) delete v.roles[k]; });
    if (fieldsLost.length) { v.pbir.lossy = true; v.pbir.unmapped = fieldsLost; warn('FIELDS_UNMAPPED', `${friendlyType(vt)}${title ? ' „' + title + '"' : ''}: ${fieldsLost.length} Bindung(en) ohne passende Kitchen-Rolle (${fieldsLost.slice(0, 4).join(', ')}${fieldsLost.length > 4 ? ', …' : ''})`, it); }
    if (spec.kind && NATIVE[vt] && vt !== 'textbox' && vt !== 'shape' && vt !== 'basicShape') {
      const C = catalog(); const def = C && C.byId[kind];
      if (def && def.native && def.native.type !== vt && !SLICERS[vt] && vt !== 'pageNavigator' && vt !== 'bookmarkNavigator') v.pbir.typeDiffers = true;
    }
    return v;
  }

  // ------------------------------------------------------------------ Seite lesen und einordnen
  function items(pg, warn) {
    const raw = (pg.visuals || []).map(e => {
      const vj = e.visual || {}; const pos = vj.position || {}; const vis = vj.visual || {};
      const isGroup = !!vj.visualGroup;
      return { folder: e.folder, name: vj.name || e.folder, type: isGroup ? 'visualGroup' : (vis.visualType || '?'), vis, vj, isGroup,
        parent: vj.parentGroupName || null, hidden: !!vj.isHidden, z: +pos.z || 0,
        rel: { x: +pos.x || 0, y: +pos.y || 0, w: +pos.width || 0, h: +pos.height || 0 } };
    });
    // Gruppenmitglieder: PBIR speichert die Position relativ zur Gruppe (wie scan_report.py)
    const by = {}; raw.forEach(v => { by[v.name] = v; });
    const abs = (v, d) => {
      if (v.r) return v.r; const r = Object.assign({}, v.rel); const par = v.parent ? by[v.parent] : null;
      if (par && d < 20) {
        const pr = abs(par, d + 1);
        const relFits = r.x + r.w <= par.rel.w + 2 && r.y + r.h <= par.rel.h + 2;
        const absFits = r.x >= pr.x - 2 && r.y >= pr.y - 2 && r.x + r.w <= pr.x + pr.w + 2 && r.y + r.h <= pr.y + pr.h + 2;
        if (relFits || !absFits) { r.x += pr.x; r.y += pr.y; }
      }
      v.r = r; return r;
    };
    raw.forEach(v => abs(v, 0));
    return raw;
  }
  const x1 = r => r.x + r.w, y1 = r => r.y + r.h, area = r => Math.max(0, r.w) * Math.max(0, r.h);
  const inter = (a, b) => Math.max(0, Math.min(x1(a), x1(b)) - Math.max(a.x, b.x)) * Math.max(0, Math.min(y1(a), y1(b)) - Math.max(a.y, b.y));
  const depth = (a, b) => Math.min(Math.min(x1(a), x1(b)) - Math.max(a.x, b.x), Math.min(y1(a), y1(b)) - Math.max(a.y, b.y));
  const inside = (a, box) => a.x >= box.x - INSIDE_TOL && a.y >= box.y - INSIDE_TOL && x1(a) <= x1(box) + INSIDE_TOL && y1(a) <= y1(box) + INSIDE_TOL;
  const hasText = v => !!(v.type === 'textbox' ? textboxText(v.vis) : shapeText(v.vis));

  // Rolle je Visual: tile | chrome | field (Slicer der Filterleiste) | skip. Liefert zusätzlich die Rahmen je Seitenrand.
  function classify(list, W, H) {
    const tool = list.some(v => /^chrome_/.test(v.name));
    const frames = { top: null, bottom: null, left: null, right: null }; const blocked = {}; const sideOf = {};
    const set = (v, role, why, side) => { if (!v.role) { v.role = role; v.why = why; if (side) v.side = side; } };
    list.forEach(v => {
      if (v.isGroup) set(v, 'skip', 'Gruppe (visualGroup), Mitglieder werden einzeln gelesen');
      else if (tool && /^chrome_/.test(v.name)) set(v, 'chrome', 'Rahmen aus MockupKitchen (' + v.name + ')');
      else if (tool && SLICERS[v.type] && /^(mk_slicer_|p\d+_slicer\d+_|slicer\d+_)/.test(v.name)) set(v, 'field', 'Slicer der Filterleiste');
      else if (v.hidden) set(v, 'skip', 'ausgeblendet (isHidden, z. B. Lesezeichen-Umschaltung)');
    });
    const free = () => list.filter(v => !v.role);
    if (!tool) {
      // 1 schmale vollhohe Leisten am linken/rechten Rand (nur Deko-Typen starten einen Rahmen)
      const reg = { left: 0, right: W, top: 0, bottom: H };
      free().forEach(v => {
        const r = v.r; if (!DECOR[v.type]) return;
        if (r.h >= 0.9 * H && r.w <= 0.15 * W) {
          const left = r.x + r.w / 2 < W / 2; const span = left ? x1(r) : W - r.x; if (span > 0.3 * W) return;
          set(v, 'chrome', 'vollhohe Leiste ' + (left ? 'links' : 'rechts'), left ? 'left' : 'right');
          if (left) reg.left = Math.max(reg.left, x1(r)); else reg.right = Math.min(reg.right, r.x);
        }
      });
      const cx0 = reg.left, cw = Math.max(1, reg.right - reg.left);
      // 2 Kopf- und Fußband, Titelfeld bündig am Rand, dünne Trennlinie
      free().forEach(v => {
        const r = v.r; if (!DECOR[v.type]) return;
        const top = r.y <= EDGE_TOL, bot = y1(r) >= H - EDGE_TOL, low = r.h <= 0.15 * H;
        if (low && (top || bot) && (r.w >= 0.9 * cw || r.w >= 0.5 * cw)) set(v, 'chrome', (top ? 'Kopfband' : 'Fußband') + ' (' + Math.round(r.w / W * 100) + ' % breit)', top ? 'top' : 'bottom');
        else if (SHAPES[v.type] && r.h <= 0.02 * H && r.w >= 0.9 * cw && (y1(r) <= 0.25 * H || r.y >= 0.75 * H)) set(v, 'chrome', 'dünne Trennlinie', y1(r) <= 0.25 * H ? 'top' : 'bottom');
        if (v.side === 'top' && v.role === 'chrome') reg.top = Math.max(reg.top, y1(r));
        if (v.side === 'bottom' && v.role === 'chrome') reg.bottom = Math.min(reg.bottom, r.y);
      });
      const boxes = { left: reg.left > 0 ? { x: 0, y: 0, w: reg.left, h: H } : null, right: reg.right < W ? { x: reg.right, y: 0, w: W - reg.right, h: H } : null,
        top: reg.top > 0 ? { x: cx0, y: 0, w: cw, h: reg.top } : null, bottom: reg.bottom < H ? { x: cx0, y: reg.bottom, w: cw, h: H - reg.bottom } : null };
      Object.keys(boxes).forEach(side => {
        const box = boxes[side]; if (!box) return;
        frames[side] = side === 'left' ? reg.left : side === 'right' ? W - reg.right : side === 'top' ? reg.top : H - reg.bottom;
        free().forEach(v => {
          if (!inside(v.r, box)) return;
          if (DECOR[v.type]) set(v, 'chrome', 'liegt im Rahmen ' + ({ left: 'links', right: 'rechts', top: 'oben', bottom: 'unten' })[side], side);
          else if (SLICERS[v.type] && (side === 'left' || side === 'right')) { v.frameSide = side; (sideOf[side] = sideOf[side] || []).push(v); }
          else blocked[side] = true;
        });
      });
      // 3 Hintergrund: Form/Bild mit kleinerem z unter anderen Visuals
      free().forEach(v => {
        if (!SHAPES[v.type]) return;
        const covered = list.filter(o => o !== v && !o.isGroup && o.z > v.z && area(o.r) > 0 && inter(v.r, o.r) >= 0.8 * area(o.r));
        if (covered.length) set(v, 'skip', 'Hintergrund unter ' + covered.length + ' Visual(s)');
      });
    } else {
      // Kitchen-Bericht: Zonen stehen in den chrome_*-Visuals
      const c = n => list.find(v => v.name === n) || null;
      const hb = c('chrome_header_bg'), nb = c('chrome_nav_bg'), fb = c('chrome_filter_bg'), ft = c('chrome_footer_text'), burger = c('chrome_burger');
      if (hb) frames.top = y1(hb.r);
      if (nb) frames.left = x1(nb.r);
      if (fb && !fb.hidden && !burger) {
        const r = fb.r;
        if (r.w > W / 2) frames.filterTop = r.h; else if (r.x + r.w / 2 > W / 2) frames.right = W - r.x; else frames.filterLeft = r.w;
      }
      if (burger) frames.burger = true;
      if (ft) frames.bottom = H - ft.r.y;
      else {
        const fnav = list.filter(v => /^chrome_nav_\d+$/.test(v.name) && v.r.y > H / 2);
        if (fnav.length) { const b = fnav[0].r; frames.bottom = Math.round(2 * (H - b.y) - b.h); }
      }
      frames.tool = true;
    }
    // 4 übrige Deko im Inhalt
    free().forEach(v => {
      const r = v.r;
      if (SHAPES[v.type] && (r.w <= 4 || r.h <= 4)) set(v, 'skip', 'Linie/Deko');
      else if ((v.type === 'shape' || v.type === 'basicShape') && !hasText(v)) set(v, 'skip', 'Form ohne Text (Deko)');
      else if (r.w <= 0 || r.h <= 0) set(v, 'skip', 'ohne Fläche');
      else {
        const out = area(r) - inter(r, { x: 0, y: 0, w: W, h: H });
        if (out > 0.5 * area(r)) set(v, 'skip', 'überwiegend außerhalb der Seite');
      }
    });
    free().forEach(v => set(v, 'tile', 'Kachel'));
    return { frames, blocked, sideSlicers: sideOf, tool };
  }

  // ------------------------------------------------------------------ Raster lösen (eine Achse)
  // Werte innerhalb SNAP px zusammenfassen. Vertreter: der ganzzahlige Wert mit der kleinsten größten Abweichung in der Gruppe
  // (bei Zittern ±1 px also die Mitte), bei Gleichstand der mit der kleinsten Summe der Abweichungen.
  function clusterMap(vals) {
    const cnt = new Map(); vals.forEach(v => cnt.set(v, (cnt.get(v) || 0) + 1));
    const u = Array.from(cnt.keys()).sort((a, b) => a - b); const map = new Map(); let grp = [];
    const flush = () => {
      if (!grp.length) return; let best = null, bm = Infinity, bs = Infinity;
      for (let c = grp[0]; c <= grp[grp.length - 1]; c++) {
        let mx = 0, sm = 0; grp.forEach(v => { const d = Math.abs(v - c); mx = Math.max(mx, d); sm += d * cnt.get(v); });
        if (mx < bm || (mx === bm && sm < bs)) { best = c; bm = mx; bs = sm; }
      }
      grp.forEach(v => map.set(v, best)); grp = [];
    };
    u.forEach(v => { if (grp.length && v - grp[0] > SNAP) flush(); grp.push(v); }); flush();
    return map;
  }
  // Kanten einer Achse einrasten, und zwar als Rasterlinien: Ende e und Start s benachbarter Kacheln mit Abstand g liegen auf derselben
  // Linie (e + gl = s - gr). So werden Zwischenräume, die um wenige px von g abweichen, genau g, statt an der Kante hängenzubleiben.
  function snapAxis(starts, ends, g) {
    const gl = Math.floor(g / 2), gr = g - gl;
    const map = clusterMap(starts.map(s => s - gr).concat(ends.map(e => e + gl)));
    return { s: v => map.get(v - gr) + gr, e: v => map.get(v + gl) - gl };
  }
  // Spuren [a,b] mit genau g Abstand von R0 bis R1, sodass jeder Start auf einem Spuranfang und jedes Ende auf einem Spurende liegt.
  // Geht das nicht exakt (Abstand ≠ g und zu klein für eine eigene Spur), rückt die Kante an die nächste mögliche Stelle.
  function solveAxis(R0, R1, ivs, g) {
    const ev = new Map(); const mark = (p, k) => { const o = ev.get(p) || { s: false, e: false }; o[k] = true; ev.set(p, o); };
    ivs.forEach(iv => { mark(iv.s, 's'); mark(iv.e, 'e'); });
    const pts = Array.from(ev.keys()).sort((a, b) => a - b); const T = []; let cur = R0; const sIdx = new Map(), eIdx = new Map();
    pts.forEach(p => {
      const f = ev.get(p);
      if (f.e) { const q = Math.max(p, cur + MIN_TRACK); T.push({ a: cur, b: q }); eIdx.set(p, T.length - 1); cur = q + g; }
      if (f.s) {
        if (p > cur) {
          const fill = p - g - cur;
          if (fill >= MIN_TRACK) { T.push({ a: cur, b: p - g, fill: true }); cur = p; }
          else {
            // Lücke zu klein für eine eigene Spur: entweder der Start rückt zurück auf cur, oder es entsteht eine Mindestspur,
            // für die der Start nach rechts und das vorige Ende nach links rücken (je die Hälfte, wenn die vorige Spur das hergibt)
            const need = MIN_TRACK + g - (p - cur); const L = T[T.length - 1];
            const room = L && !L.fill ? Math.max(0, L.b - L.a - MIN_TRACK) : 0; const back = Math.min(room, Math.floor(need / 2));
            if (p - cur > need - back) { if (back) { L.b -= back; cur -= back; } T.push({ a: cur, b: cur + MIN_TRACK, fill: true }); cur += MIN_TRACK + g; }
          }
        }
        sIdx.set(p, T.length);
      }
    });
    if (!T.length) T.push({ a: R0, b: R1, fill: true });
    else {
      // Rest bis R1: eigene Spur, sonst die letzte Spur dehnen oder für eine Mindestspur kürzen (was weniger verschiebt)
      const L = T[T.length - 1]; const r = R1 - L.b;
      if (r >= g + MIN_TRACK) T.push({ a: L.b + g, b: R1, fill: true });
      else if (r > 0 && g + MIN_TRACK - r < r && L.b - L.a - (g + MIN_TRACK - r) >= MIN_TRACK) { L.b = R1 - MIN_TRACK - g; T.push({ a: L.b + g, b: R1, fill: true }); }
      else if (r !== 0) L.b = Math.max(L.a + 1, R1);
    }
    return { tracks: T, idx: ivs.map(iv => { const i0 = Math.min(sIdx.get(iv.s), T.length - 1); return { i0, i1: Math.max(i0, eIdx.get(iv.e)) }; }) };
  }

  // Nachbau von layoutRects() aus app.js (nur Raster und Blatt), für die Selbstprüfung ohne Browser-Zustand
  function gridRects(node, rect, g, out) {
    if (node.type === 'leaf') { out.push({ node, rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.w), h: Math.round(rect.h) } }); return out; }
    const tracks = (arr, start, span) => { const total = arr.reduce((a, b) => a + b, 0) || 1; const inner = span - g * (arr.length - 1); const sizes = arr.map(s => Math.max(8, Math.floor(inner * s / total))); const rest = Math.max(0, inner - sizes.reduce((a, b) => a + b, 0)); let pos = start + Math.floor(rest / 2); return sizes.map(sz => { const t = { pos, sz }; pos += sz + g; return t; }); };
    const X = tracks(node.cols, rect.x, rect.w), Y = tracks(node.rows, rect.y, rect.h);
    node.children.forEach(c => { const cx = X[Math.min(X.length - 1, c.c + c.cs - 1)], cy = Y[Math.min(Y.length - 1, c.r + c.rs - 1)]; gridRects(c.node, { x: X[c.c].pos, y: Y[c.r].pos, w: cx.pos + cx.sz - X[c.c].pos, h: cy.pos + cy.sz - Y[c.r].pos }, g, out); });
    return out;
  }
  // Abweichung eines Kitchen-Rechtecks von der PBIR-Position: größte Verschiebung einer der vier Kanten (px)
  const edgeDev = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.x + a.w - x1(b)), Math.abs(a.y + a.h - y1(b)));
  const sizeDev = (a, b) => Math.max(Math.abs(a.w - b.w), Math.abs(a.h - b.h));
  function contentRect(W, H, z, m) {
    const left = (z.nav || 0) + (z.filterLeft || 0), right = W - (z.right || 0), top = (z.top || 0) + (z.filterTop || 0), bottom = H - (z.bottom || 0);
    return { x: left + m, y: top + m, w: Math.max(40, right - left - 2 * m), h: Math.max(40, bottom - top - 2 * m) };
  }
  // Kacheln einer Seite im Inhaltsbereich lösen → { cols, rows, cells:[{tile, r, c, rs, cs}], dev }
  function solvePage(tiles, content, g) {
    const R = t => ({ x0: Math.round(t.r.x), x1: Math.round(x1(t.r)), y0: Math.round(t.r.y), y1: Math.round(y1(t.r)) });
    const rr = tiles.map(R);
    const cx = snapAxis(rr.map(r => r.x0), rr.map(r => r.x1), g), cy = snapAxis(rr.map(r => r.y0), rr.map(r => r.y1), g);
    const clampI = (v, a, b) => Math.max(a, Math.min(b, v));
    const X0 = content.x, X1 = content.x + content.w, Y0 = content.y, Y1 = content.y + content.h;
    const ivx = rr.map(r => { const s = clampI(cx.s(r.x0), X0, X1 - 1), e = clampI(cx.e(r.x1), X0 + 1, X1); return { s, e: Math.max(s + 1, e) }; });
    const ivy = rr.map(r => { const s = clampI(cy.s(r.y0), Y0, Y1 - 1), e = clampI(cy.e(r.y1), Y0 + 1, Y1); return { s, e: Math.max(s + 1, e) }; });
    const sx = solveAxis(X0, X1, ivx, g), sy = solveAxis(Y0, Y1, ivy, g);
    let dev = 0;
    const cells = tiles.map((t, i) => {
      const a = sx.idx[i], b = sy.idx[i];
      const x = sx.tracks[a.i0].a, w = sx.tracks[a.i1].b - x, y = sy.tracks[b.i0].a, h = sy.tracks[b.i1].b - y;
      const d = edgeDev({ x, y, w, h }, t.r); dev = Math.max(dev, d);
      return { tile: t, c: a.i0, cs: a.i1 - a.i0 + 1, r: b.i0, rs: b.i1 - b.i0 + 1, dev: d };
    });
    return { cols: sx.tracks.map(t => t.b - t.a), rows: sy.tracks.map(t => t.b - t.a), cells, dev };
  }

  // ------------------------------------------------------------------ Einstieg
  function fromDefinition(def) {
    def = def || {}; const warnings = [], skipped = [];
    const W_ = (code, text, page, visual) => warnings.push({ code, text, page: page || null, visual: visual || null });
    // Seitenreihenfolge: pagesOrder, dann übrige Ordner (mit Hinweis)
    const byFolder = {}; (def.pages || []).forEach(p => { if (p && p.folder) byFolder[p.folder] = p; });
    const order = (def.pagesOrder || []).filter(f => byFolder[f]);
    Object.keys(byFolder).sort().forEach(f => { if (!order.includes(f)) { order.push(f); if ((def.pagesOrder || []).length) W_('PAGE_NOT_IN_ORDER', `Seitenordner ${f} fehlt in pages.json/pageOrder (hinten angehängt)`, f); } });
    // Tooltip-Seiten gehören nicht auf die Kitchen-Leinwand
    let src = order.map(f => byFolder[f]).filter(p => {
      const pj = p.page || {}; const tip = (pj.pageBinding && pj.pageBinding.type === 'Tooltip') || pj.type === 'Tooltip';
      if (tip) { W_('PAGE_TOOLTIP', `Seite „${pj.displayName || p.folder}": QuickInfo-Seite, nicht übernommen`, p.folder); skipped.push({ page: p.folder, visual: null, type: 'page', reason: 'QuickInfo-Seite' }); }
      return !tip;
    });
    if (!src.length) return { pages: [], warnings: warnings.concat([{ code: 'NO_PAGES', text: 'Keine Seiten im Bericht gefunden', page: null, visual: null }]), canvas: null, spacing: null, chrome: null, skipped, stats: { pages: [], maxDev: 0 } };
    // Leinwand: häufigste Seitengröße (gilt im Kitchen für den ganzen Bericht)
    const sizes = {}; src.forEach(p => { const pj = p.page || {}; const key = Math.round(+pj.width || 1280) + 'x' + Math.round(+pj.height || 720); sizes[key] = (sizes[key] || 0) + 1; });
    const sizeKey = Object.keys(sizes).sort((a, b) => sizes[b] - sizes[a])[0]; let [W, H] = sizeKey.split('x').map(Number);
    if (W < 320 || W > 4000 || H < 200 || H > 4000) { W_('CANVAS_RANGE', `Seitengröße ${W} × ${H} liegt außerhalb dessen, was das Kitchen darstellt (320–4000 px)`); W = Math.max(320, Math.min(4000, W)); H = Math.max(200, Math.min(4000, H)); }
    src.forEach(p => { const pj = p.page || {}; const k = Math.round(+pj.width || 1280) + 'x' + Math.round(+pj.height || 720); if (k !== sizeKey) W_('PAGE_SIZE', `Seite „${pj.displayName || p.folder}" ist ${k.replace('x', ' × ')} px, das Kitchen nutzt für alle Seiten ${W} × ${H} px; Kacheln außerhalb werden gekürzt`, p.folder); });
    const k = kOf(W);
    const pageIds = {}; src.forEach(p => { pageIds[p.folder] = uid(); });

    // Seiten lesen und einordnen
    const P = src.map(p => {
      const pj = p.page || {}; const name = String(pj.displayName || p.folder);
      const list = items(p); const cls = classify(list, W, H);
      const size = Math.round(+pj.width || 1280) + 'x' + Math.round(+pj.height || 720);
      return { p, pj, name, list, cls, size };
    });
    // Zonen: nur wenn alle Seiten denselben Rahmen haben (±2 px) und nichts Datentragendes darin liegt.
    // Maßgeblich sind die Seiten in Leinwandgröße mit Visuals (leere Seiten und andere Größen entscheiden nicht mit).
    let Z = P.filter(x => x.list.length && x.size === sizeKey); if (!Z.length) Z = P;
    const tool = Z.some(x => x.cls.tool);
    const same = vals => vals.every(v => v != null) && Math.max.apply(null, vals) - Math.min.apply(null, vals) <= 2;
    const mode = vals => { const c = {}; vals.forEach(v => { const r = Math.round(v); c[r] = (c[r] || 0) + 1; }); return +Object.keys(c).sort((a, b) => c[b] - c[a])[0]; };
    const zone = {}; const zoneOf = key => Z.map(x => x.cls.frames[key]);
    ['top', 'bottom'].forEach(s => { const v = zoneOf(s); if (same(v) && !Z.some(x => x.cls.blocked[s])) zone[s] = mode(v); });
    // links: Filterleiste, wenn die Leiste Slicer trägt, sonst Navigationsleiste; rechts: nur als Filterleiste
    { const v = zoneOf('left'); if (same(v) && !Z.some(x => x.cls.blocked.left)) { if (Z.some(x => (x.cls.sideSlicers.left || []).length)) zone.filterLeft = mode(v); else zone.nav = mode(v); } }
    { const v = zoneOf('right'); if (same(v) && !Z.some(x => x.cls.blocked.right) && (tool || Z.some(x => (x.cls.sideSlicers.right || []).length))) zone.right = mode(v); }
    if (tool) { ['filterTop', 'filterLeft'].forEach(s => { const v = zoneOf(s); if (same(v)) zone[s] = mode(v); }); }
    const burger = Z.every(x => x.cls.frames.burger);
    // Visuals in nicht übernommenen Rahmen: Deko fällt weg, Slicer werden wieder Kacheln
    P.forEach(x => {
      x.list.forEach(v => {
        if (v.role === 'field' && !x.cls.tool) v.role = 'tile';
        if (v.frameSide && !((v.frameSide === 'left' && zone.filterLeft) || (v.frameSide === 'right' && zone.right))) { v.role = 'tile'; v.why = 'Kachel'; }
        else if (v.frameSide) { v.role = 'field'; v.why = 'Slicer der Filterleiste'; }
        if (v.role === 'field' && x.cls.tool && !(zone.right || zone.filterLeft || zone.filterTop || burger)) { v.role = 'tile'; v.why = 'Kachel'; }
        if (v.role === 'chrome' && v.side && !(v.side === 'top' ? zone.top : v.side === 'bottom' ? zone.bottom : v.side === 'left' ? (zone.nav || zone.filterLeft) : zone.right)) { v.role = 'skip'; v.why += ', Rahmen nicht auf allen Seiten gleich: entfällt'; }
      });
    });

    // Überlagerungen auflösen: echte Überlappung (tiefer als SNAP) lässt sich im Raster nicht darstellen → kleinere Kachel entfällt
    P.forEach(x => {
      const tiles = x.list.filter(v => v.role === 'tile').sort((a, b) => area(b.r) - area(a.r)); const keep = [];
      tiles.forEach(v => { const hit = keep.find(o => depth(o.r, v.r) > SNAP); if (hit) { v.role = 'skip'; v.why = 'überlappt ' + (titleOf(hit.vis) || friendlyType(hit.type)) + ' (' + hit.folder + '), im Raster nicht darstellbar'; v.overlap = true; } else keep.push(v); });
      x.tiles = keep.sort((a, b) => a.r.y - b.r.y || a.r.x - b.r.x);
      x.tiles.forEach(v => { const o = Math.max(-v.r.x, -v.r.y, x1(v.r) - W, y1(v.r) - H); if (o > 1) W_('VISUAL_OUTSIDE', `Seite „${x.name}": ${friendlyType(v.type)}${titleOf(v.vis) ? ' „' + titleOf(v.vis) + '"' : ''} ragt ${Math.round(o)} px über die Seite hinaus und wird gekürzt`, x.p.folder, v.folder); });
      x.list.forEach(v => {
        if (v.role !== 'skip' && v.role !== 'chrome') return;
        skipped.push({ page: x.p.folder, visual: v.folder, type: v.type, reason: v.why });
        if (v.role === 'skip' && !v.isGroup) W_(v.overlap ? 'VISUAL_OVERLAP' : 'VISUAL_SKIPPED', `Seite „${x.name}": ${friendlyType(v.type)}${titleOf(v.vis) ? ' „' + titleOf(v.vis) + '"' : ''} nicht übernommen: ${v.why}`, x.p.folder, v.folder);
      });
    });

    // Rand m und Zwischenraum g wählen: Kandidaten aus den Abständen im Bericht, bewertet über alle Seiten
    const zoneAll = zone; const regionNoMargin = contentRect(W, H, zoneAll, 0);
    const gapCnt = {}, marCnt = {}; const bump = (o, v) => { v = Math.round(v); o[v] = (o[v] || 0) + 1; };
    P.forEach(x => {
      const T = x.tiles.map(v => v.r);
      T.forEach(a => {
        let gx = Infinity, gy = Infinity;
        T.forEach(b => { if (a === b) return; const oy = Math.min(y1(a), y1(b)) - Math.max(a.y, b.y), ox = Math.min(x1(a), x1(b)) - Math.max(a.x, b.x);
          if (oy > SNAP && b.x - x1(a) > 0.5) gx = Math.min(gx, b.x - x1(a)); if (ox > SNAP && b.y - y1(a) > 0.5) gy = Math.min(gy, b.y - y1(a)); });
        if (gx <= 48 * k) bump(gapCnt, gx); if (gy <= 48 * k) bump(gapCnt, gy);
      });
      if (T.length) {
        const c = regionNoMargin;
        [Math.min.apply(null, T.map(r => r.x)) - c.x, Math.min.apply(null, T.map(r => r.y)) - c.y, c.x + c.w - Math.max.apply(null, T.map(x1)), c.y + c.h - Math.max.apply(null, T.map(y1))]
          .forEach(v => { if (v >= 0.5 && v <= 64 * k) bump(marCnt, v); });
      }
    });
    const top = (o, n) => Object.keys(o).map(Number).sort((a, b) => o[b] - o[a] || b - a).slice(0, n);
    const gC = [0].concat(top(gapCnt, 6).filter(v => v > 0)), mC = [0].concat(top(marCnt, 6).filter(v => v > 0));
    let best = null;
    mC.forEach(m => gC.forEach(g => {
      const content = contentRect(W, H, zoneAll, m); let bad = 0, maxDev = 0, tracks = 0;
      P.forEach(x => { if (!x.tiles.length) return; const s = solvePage(x.tiles, content, g); s.cells.forEach(c => { if (c.dev > SNAP) bad++; }); maxDev = Math.max(maxDev, s.dev); tracks += s.cols.length + s.rows.length; });
      // Reihenfolge: keine Kachel weiter als SNAP daneben, größte Abweichung (bis 1 px gleich gut), wenige Spuren, häufigster Abstand, größeres g
      const score = [bad, Math.max(1, Math.ceil(maxDev - 0.5)), tracks, -(gapCnt[g] || 0), -g, -m];
      if (!best || cmp(score, best.score) < 0) best = { m, g, score };
    }));
    function cmp(a, b) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1; return 0; }
    const m = best ? best.m : 0, g = best ? best.g : 0; const content = contentRect(W, H, zoneAll, m);

    // Seiten bauen
    const stats = []; let maxAll = 0; const usedIds = new Set(); const fields = []; const fieldKey = {};
    const pages = P.map(x => {
      const warn = (code, text, it) => W_(code, `Seite „${x.name}": ${text}`, x.p.folder, it ? it.folder : null);
      let layout; const leafOf = new Map();
      if (!x.tiles.length) layout = { id: uid(), type: 'leaf', visual: null };
      else {
        const s = solvePage(x.tiles, content, g);
        // Zellen belegen; doppelt belegte Zellen (nach dem Einrasten) → kleinere Kachel entfällt
        const nR = s.rows.length, nC = s.cols.length; const occ = Array.from({ length: nR }, () => new Array(nC).fill(null)); const children = [];
        s.cells.slice().sort((a, b) => area(b.tile.r) - area(a.tile.r)).forEach(c => {
          for (let r = c.r; r < c.r + c.rs; r++) for (let q = c.c; q < c.c + c.cs; q++) if (occ[r][q]) { c.clash = occ[r][q]; }
          if (c.clash) { skipped.push({ page: x.p.folder, visual: c.tile.folder, type: c.tile.type, reason: 'teilt sich nach dem Einrasten Rasterzellen mit ' + c.clash.folder }); warn('VISUAL_OVERLAP', `${friendlyType(c.tile.type)} (${c.tile.folder}) teilt sich nach dem Einrasten den Platz mit ${c.clash.folder}, nicht übernommen`, c.tile); return; }
          for (let r = c.r; r < c.r + c.rs; r++) for (let q = c.c; q < c.c + c.cs; q++) occ[r][q] = c.tile;
          let id = /^mk_[a-z0-9]{4,}$/i.test(c.tile.folder) ? c.tile.folder.slice(3) : uid(); if (usedIds.has(id)) id = uid(); usedIds.add(id);
          const node = { id, type: 'leaf', visual: toVisual(c.tile, x.p.folder, pageIds, warn) }; leafOf.set(c.tile, node);
          children.push({ r: c.r, c: c.c, rs: c.rs, cs: c.cs, node });
        });
        // Lücken: möglichst große leere Rechtecke
        for (let r = 0; r < nR; r++) for (let q = 0; q < nC; q++) {
          if (occ[r][q]) continue; let cs = 1; while (q + cs < nC && !occ[r][q + cs]) cs++;
          let rs = 1; while (r + rs < nR && occ[r + rs].slice(q, q + cs).every(o => !o)) rs++;
          for (let a = r; a < r + rs; a++) for (let b = q; b < q + cs; b++) occ[a][b] = { folder: '(leer)' };
          children.push({ r, c: q, rs, cs, node: { id: uid(), type: 'leaf', visual: null } });
        }
        children.sort((a, b) => a.r - b.r || a.c - b.c);
        layout = { id: uid(), type: 'grid', cols: s.cols, rows: s.rows, children };
      }
      // Selbstprüfung mit dem Nachbau von layoutRects: Kitchen-Rechteck gegen PBIR-Position
      let dev = 0, sdev = 0; const devs = [];
      gridRects(layout, content, g, []).forEach(l => {
        if (!l.node.visual) return; const t = x.tiles.find(v => leafOf.get(v) === l.node); if (!t) return;
        const d = edgeDev(l.rect, t.r); sdev = Math.max(sdev, sizeDev(l.rect, t.r));
        dev = Math.max(dev, d); if (d > 1) devs.push({ visual: t.folder, d: Math.round(d * 10) / 10 });
      });
      maxAll = Math.max(maxAll, dev);
      if (devs.length) warn('RECT_DEVIATION', `${devs.length} Kachel(n) weichen mit einer Kante mehr als 1 px von der PBIR-Position ab (max. ${Math.round(dev * 10) / 10} px): ${devs.slice(0, 4).map(d => d.visual + ' ' + d.d + ' px').join(', ')}${devs.length > 4 ? ', …' : ''}`);
      stats.push({ page: x.p.folder, name: x.name, tiles: leafOf.size, maxDev: Math.round(dev * 100) / 100, maxSizeDev: Math.round(sdev * 100) / 100 });
      // Slicer der Filterleiste → berichtsweite Filterfelder
      x.list.filter(v => v.role === 'field').forEach(v => {
        const vis = v.vis; const qs = ((vis.query || {}).queryState || {}).Values; const f = qs && qs.projections && qs.projections[0] ? fieldOf(qs.projections[0].field) : null; if (!f) return;
        const key = f.table + '|' + f.name; if (fieldKey[key]) return; fieldKey[key] = 1;
        fields.push({ table: f.table, name: f.name, kind: f.kind, isNew: false, type: slicerTypeOf(v.type, vis, [f]) });
      });
      return { id: pageIds[x.p.folder], name: x.name, notes: '', question: '', layout, pbir: { page: x.p.folder } };
    });

    // Rahmen (berichtsweit)
    const P0 = Z[0]; const find = pred => { for (const x of Z) { const v = x.list.find(pred); if (v) return v; } return null; };
    const txt = v => v ? (v.type === 'textbox' ? textboxText(v.vis) : (shapeText(v.vis) || titleOf(v.vis))).split('\n')[0].slice(0, 80) : '';
    const inTop = v => v.role === 'chrome' && (v.side === 'top' || (P0.cls.tool && zone.top && y1(v.r) <= zone.top + 1));
    const inBot = v => v.role === 'chrome' && (v.side === 'bottom' || (P0.cls.tool && zone.bottom && v.r.y >= H - zone.bottom - 1));
    const titleV = P0.cls.tool ? find(v => v.name === 'chrome_header_title') : P0.list.filter(v => inTop(v) && (v.type === 'textbox' || v.type === 'shape') && txt(v)).sort((a, b) => area(b.r) - area(a.r))[0];
    const subV = P0.cls.tool ? find(v => v.name === 'chrome_header_subtitle') : null;
    const logoV = P0.list.find(v => inTop(v) && (v.type === 'image' || v.name === 'chrome_logo'));
    const navTop = P0.list.some(v => inTop(v) && (v.type === 'actionButton' || v.type === 'pageNavigator') && v.name !== 'chrome_burger');
    const navBot = P0.list.some(v => inBot(v) && (v.type === 'actionButton' || v.type === 'pageNavigator'));
    const footV = P0.cls.tool ? find(v => v.name === 'chrome_footer_text') : P0.list.filter(v => inBot(v) && (v.type === 'textbox' || v.type === 'shape') && txt(v))[0];
    const r3 = v => Math.round(v * 1e6) / 1e6;
    const chrome = {
      header: { on: !!zone.top, h: zone.top ? r3(zone.top / k) : 56 },
      nav: { on: !!zone.nav, w: zone.nav ? r3(zone.nav / k) : 64 },
      filter: { on: !!(zone.right || zone.filterLeft || zone.filterTop || burger), side: zone.right ? 'right' : zone.filterLeft ? 'left' : zone.filterTop ? 'top' : burger ? 'burger' : 'right',
        w: r3((zone.right || zone.filterLeft || 200 * k) / k), topH: r3((zone.filterTop || 56 * k) / k), fields },
      footer: { on: !!zone.bottom, h: zone.bottom ? r3(zone.bottom / k) : 24 },
      navPos: zone.top && navTop ? 'header' : zone.bottom && navBot ? 'footer' : 'off',
    };
    if (zone.top) Object.assign(chrome.header, { title: txt(titleV), sub: txt(subV), logoPos: logoV ? (logoV.r.x + logoV.r.w / 2 > W / 2 ? 'right' : 'left') : 'none', navAuto: true, navOn: chrome.navPos === 'header' });
    if (zone.bottom) chrome.footer.text = txt(footV);
    if (fields.length && !chrome.filter.on) W_('FILTER_FIELDS', `${fields.length} Slicer der Filterleiste übernommen, die Filterzone ist aber aus`);
    if (burger && fields.length) W_('FILTER_BURGER', 'Filter als Ausklapp-Menü (Burger) übernommen');
    const zoneNames = [zone.top && 'Kopfband', zone.nav && 'Navigationsleiste', (zone.right || zone.filterLeft || zone.filterTop) && 'Filterleiste', zone.bottom && 'Fußleiste'].filter(Boolean);
    if (zoneNames.length) W_('CHROME_MAPPED', `Rahmen als Kitchen-Zonen übernommen: ${zoneNames.join(', ')}`);

    const spacing = { margin: r3(m / k), gutter: r3(g / k) };
    return {
      name: def.name || null, pages, warnings, skipped,
      canvas: { w: W, h: H, preset: PRESETS.includes(W + 'x' + H) ? W + 'x' + H : 'custom' },
      spacing, chrome,
      stats: { pages: stats, maxDev: Math.round(maxAll * 100) / 100, margin: m, gutter: g, content },
    };
  }

  // ------------------------------------------------------------------ Ordner lesen (File System Access API)
  async function childDir(dir, name) { try { return await dir.getDirectoryHandle(name); } catch (e) { return null; } }
  async function readJson(dir, name, warn, where) {
    let fh; try { fh = await dir.getFileHandle(name); } catch (e) { return undefined; }
    try { const f = await fh.getFile(); const txt = (await f.text()).replace(/^﻿/, ''); return JSON.parse(txt); }
    catch (e) { warn('FILE_UNREADABLE', `${where}${name} nicht lesbar: ${e && e.message ? e.message : e}`); return null; }
  }
  async function dirs(dir) { const out = []; for await (const [name, h] of dir.entries()) if (h.kind === 'directory') out.push([name, h]); return out.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); }
  async function readDir(handle) {
    const warnings = []; const warn = (code, text, page, visual) => warnings.push({ code, text, page: page || null, visual: visual || null });
    if (!handle || handle.kind !== 'directory') throw new Error('MK_PBIR.readDir: Ordner erwartet');
    // Projektordner statt .Report übergeben: den einen <Name>.Report darunter nehmen
    let rep = handle; let defDir = await childDir(rep, 'definition');
    if (!defDir) {
      const reps = (await dirs(handle)).filter(([n]) => /\.Report$/i.test(n));
      if (!reps.length) throw new Error('MK_PBIR.readDir: kein <Name>.Report-Ordner mit definition/ gefunden');
      if (reps.length > 1) warn('REPORT_AMBIGUOUS', `Mehrere Berichte im Ordner (${reps.map(r => r[0]).join(', ')}), gelesen wird ${reps[0][0]}`);
      rep = reps[0][1]; defDir = await childDir(rep, 'definition');
      if (!defDir) throw new Error('MK_PBIR.readDir: ' + reps[0][0] + ' hat keinen Ordner definition/ (PBIR-Format nötig, nicht report.json)');
    }
    const pagesDir = await childDir(defDir, 'pages');
    if (!pagesDir) throw new Error('MK_PBIR.readDir: definition/pages fehlt (PBIR-Format nötig)');
    const meta = (await readJson(pagesDir, 'pages.json', warn, 'definition/pages/')) || {};
    const pages = [];
    for (const [folder, pd] of await dirs(pagesDir)) {
      const page = await readJson(pd, 'page.json', warn, folder + '/');
      if (!page) { if (page === undefined) warn('PAGE_NO_JSON', `Seitenordner ${folder}: page.json fehlt, übersprungen`, folder); continue; }
      const visuals = [];
      // Aufbau 1: <Seite>/visuals/<Visual>/visual.json · Aufbau 2: <Seite>/<Visual>/visual.json (Ordner mit oder ohne .Visual-Endung)
      const vdirs = []; const vd = await childDir(pd, 'visuals');
      if (vd) (await dirs(vd)).forEach(e => vdirs.push(e));
      for (const [n, h] of await dirs(pd)) if (n !== 'visuals') vdirs.push([n, h]);
      for (const [vf, vh] of vdirs) {
        const vj = await readJson(vh, 'visual.json', warn, folder + '/' + vf + '/');
        if (vj === undefined) { if (vd && vh !== vd) warn('VISUAL_NO_JSON', `Seite ${folder}: ${vf}/visual.json fehlt`, folder, vf); continue; }
        if (vj) visuals.push({ folder: vf, visual: vj });
      }
      pages.push({ folder, page, visuals });
    }
    const res = fromDefinition({ name: String(rep.name || '').replace(/\.Report$/i, ''), pagesOrder: meta.pageOrder || [], pages });
    res.warnings = warnings.concat(res.warnings);
    return res;
  }

  // ------------------------------------------------------------------ Übernehmen (öffentliche MK-API)
  // Leinwand, Rand/Zwischenraum und Rahmen gelten im Kitchen für alle Seiten und gehören zum Import: ohne sie stimmen die Rechtecke nicht.
  function applyTo(mk, res) {
    if (!mk || !res || !res.pages || !res.pages.length) return false;
    const S = mk.state; const clone = o => JSON.parse(JSON.stringify(o));
    if (res.spacing) Object.assign(S.spacing, res.spacing);
    if (res.chrome) {
      const c = res.chrome;
      ['header', 'nav', 'filter', 'footer'].forEach(z => { if (!c[z]) return; S.chrome[z] = Object.assign({}, S.chrome[z], clone(c[z])); });
      if (c.filter && !c.filter.fields.length && S.chrome.filter) S.chrome.filter.fields = S.chrome.filter.fields || [];
      ['title', 'sub'].forEach(p => { if (c.header && p in c.header && S.chrome.header.dflt) delete S.chrome.header.dflt[p]; });
      if (c.footer && 'text' in c.footer && S.chrome.footer.dflt) delete S.chrome.footer.dflt.text;
      if (c.navPos) S.chrome.navPos = c.navPos;
    }
    if (typeof mk.setPages === 'function') return mk.setPages(res.pages, { canvas: res.canvas });
    const st = clone(S); st.pages = clone(res.pages); st.cur = st.pages[0].id; if (res.canvas) st.canvas = Object.assign({}, st.canvas, res.canvas); mk.state = st; return true;
  }

  // solveRects: beliebige Kachel-Rechtecke eines Inhaltsbereichs auf Rasterspuren legen (auch für Baum → Raster im Kitchen, v0.5.4)
  const api = { readDir, fromDefinition, applyTo, solveRects: solvePage, _solveAxis: solveAxis, _gridRects: gridRects };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MK_PBIR = api;
})(typeof window !== 'undefined' ? window : globalThis);
