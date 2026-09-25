/* MockupKitchen · Export v0.3 (Spec v3): stabile IDs, Analyse-Block, Berichtskopf, Steckbriefe, Issues, Hash ·
   Ausgaben: mockup-spec.json, AGENT-BRIEF.md, WORKSHOP-DOKU.md, pbir-visuals je Seite, PNG je Seite, Prompt · Speichern/Öffnen
   Zweisprachig: die Prosa richtet sich nach spec.meta.lang (nicht nach der UI-Sprache), die Spec-Schlüssel bleiben unverändert. */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const MK = window.MK, CAT = window.MK_CATALOG, I18N = window.MK_I18N;
  const TOOL = 'MockupKitchen byDatenWG', VER = '0.4', SPEC_VERSION = 3;
  const fieldRef = f => `${f.table}.${f.name}`;
  const slug = s => String(s || 'seite').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Seite';
  const today = () => new Date().toISOString().slice(0, 10);
  const ENGINE = CAT.engineLabel;
  // Übersetzer für eine bestimmte Ausgabesprache (Brief/Doku/Prompt folgen spec.meta.lang)
  const lang = () => (MK.state && MK.state.lang) || I18N.lang;
  const TL = (l, k, v) => I18N.tl(l, k, v);
  const UI = (k, v) => I18N.t(k, v);
  // Übersetzung mit Rückfallwert, wenn der Schlüssel (z. B. ein unbekanntes Preset) gar nicht im Wörterbuch steht
  const tr = (l, k, fallback) => (I18N.has(k, l) ? I18N.tl(l, k) : fallback);

  // FNV-1a-Hash über eine kanonische Serialisierung (Provenienz: welcher Mockup-Stand wurde gebaut?)
  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function canon(o) { if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']'; if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canon(o[k])).join(',') + '}'; return JSON.stringify(o); }

  // Kachel hat leere Pflichtrollen? (früher über den Wortlaut der Warnung geprüft – das ging mit zwei Sprachen nicht mehr)
  function missingRequired(v) {
    const def = CAT.byId[v.kind]; if (!def) return false;
    return CAT.rolesFor(def, v).some(r => r.req && !((v.roles || {})[r.key] || []).length);
  }

  // ------------------------------------------------------------------ Spec
  function buildSpec() {
    const S = MK.state; const c = S.chrome; const d = S.design; const k = MK.ui();
    const L = S.lang || I18N.lang; const T = (key, vars) => TL(L, key, vars);
    const z = MK.zones(); const issues = []; const links = [];
    const issue = (level, code, text, page, visual) => issues.push({ level, code, text, page: page || null, visual: visual || null });
    const fieldOut = f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), isNew: !!f.isNew });
    const pages = S.pages.map((p, pi) => {
      const all = MK.computeAll(p);
      const visuals = all.leaves.filter(l => l.node.visual).map(l => {
        const v = l.node.visual; const def = CAT.byId[v.kind] || { label: v.kind, roles: [], native: null, ck: null, ckMode: null };
        const roles = {}; const vw = []; const id = 'mk_' + l.node.id; const title = v.title || def.label;
        CAT.rolesFor(def, v).forEach(r => { const list = v.roles[r.key] || []; if (list.length) roles[r.key] = list.map(fieldOut); if (r.req && !list.length) { vw.push(T('exp.issue.roleEmptyShort', { r: r.label })); issue(v.engine === 'native' ? 'error' : 'warn', 'ROLE_EMPTY', T('exp.issue.roleEmpty', { r: r.label }), p.name, id); } });
        if (MK.anti[v.kind]) { vw.push(def.note || T('exp.issue.antiShort')); issue('warn', 'ANTI_PATTERN', T('exp.issue.anti', { label: def.label, note: def.note || T('exp.issue.antiFallback') }), p.name, id); }
        if (v.engine === 'ck' && !def.ckMode) { vw.push(T('exp.issue.ckNoModeShort')); issue('error', 'CK_NO_MODE', T('exp.issue.ckNoMode', { label: def.label }), p.name, id); }
        if (v.engine === 'native' && !def.native) { vw.push(T('exp.issue.noNativeShort')); issue('error', 'NO_NATIVE', T('exp.issue.noNative', { label: def.label }), p.name, id); }
        if ((v.kind === 'text' || v.kind === 'button') && !(v.content || '').trim()) issue('warn', 'TEXT_EMPTY', T('exp.issue.textEmpty', { t: title }), p.name, id);
        if (/^\s*(Δ|Delta|Abweichung|Variance)/i.test(title) && !(v.roles.ref || []).length && !(v.roles.goal || []).length) issue('warn', 'DELTA_NO_REF', T('exp.issue.deltaNoRef', { t: title }), p.name, id);
        const native = def.native && (v.engine === 'native' || v.engine === 'ck') ? { type: def.native.type, buckets: bucketsFor(def, v) } : null;
        const target = v.link ? S.pages.find(x => x.id === v.link) : null;
        const cat = (v.roles.category || v.roles.rows || [])[0] || null;
        if (target) links.push({ fromVisual: id, fromPage: p.name, toPage: target.name, toPageId: target.id, kind: v.kind === 'button' ? 'navigation' : 'drillthrough', drillField: v.kind === 'button' ? null : (cat ? fieldRef(cat) : null) });
        const an = MK.analysisOf(v);
        if (an.smallMultiples && !(v.roles.multiples || []).length) issue('warn', 'SM_NO_FIELD', T('exp.issue.smNoField', { t: title }), p.name, id);
        if (an.fieldParam && (v.roles.category || []).length < 2) issue('info', 'FIELDPARAM_FEW', T('exp.issue.fieldParamFew', { t: title, n: an.fieldParamName || 'Achse', k: (v.roles.category || []).length }), p.name, id);
        return {
          id, stableId: l.node.id, slug: slug(title), page: p.name, kind: v.kind, label: def.label, engine: v.engine,
          chartKitchenType: v.engine === 'ck' ? def.ck : null, chartKitchenMode: v.engine === 'ck' ? def.ckMode : null, native,
          customVisual: v.engine === 'custom' && def.customVisual ? { name: def.customVisual.name, guid: def.customVisual.guid, buckets: customBuckets(def, v) } : null,
          title, subtitle: v.sub || '', content: v.content || '', scenario: def.roles.some(r => r.key === 'ref') ? v.scenario : null,
          analysis: { polarity: an.polarity, polarityAuto: an.polarityAuto, deltaBasis: an.deltaBasis, deltaBasisAuto: an.deltaBasisAuto, deltaKind: an.deltaKind, unit: an.unit || null, displayUnits: an.displayUnits === 'auto' ? null : an.displayUnits, decimals: an.decimals, sort: an.sort, topN: an.topN, timeGrain: an.timeGrain, cumulative: an.cumulative, scaleGroup: an.scaleGroup || null, message: an.message || null,
            smallMultiples: an.smallMultiples ? { field: (v.roles.multiples || [])[0] ? fieldRef(v.roles.multiples[0]) : null } : null,
            fieldParam: an.fieldParam ? { name: an.fieldParamName || 'Achse', role: 'category', fields: (v.roles.category || []).map(fieldRef) } : null },
          workshop: { priority: v.priority || null, status: v.status || 'open', openQuestion: !!v.openQuestion },
          typography: v.typo && v.typo.scale ? { scale: v.typo.scale } : null,
          samples: MK.samplesOf ? MK.samplesOf(v) : null,
          interaction: { drillDown: !!(v.interaction || {}).drillDown, crossFilter: (v.interaction || {}).crossFilter !== false, drillThrough: target && v.kind !== 'button' ? { pageId: target.id, pageName: target.name, field: cat ? fieldRef(cat) : null } : null },
          rect: l.rect, roles, notes: v.notes || '', link: target ? { pageId: target.id, pageName: target.name } : null, warnings: vw,
        };
      });
      all.leaves.filter(l => !l.node.visual).forEach(l => issue('warn', 'EMPTY_TILE', T('exp.issue.emptyTile', { x: l.rect.x, y: l.rect.y, w: l.rect.w, h: l.rect.h }), p.name));
      if (!(p.question || '').trim()) issue('info', 'PAGE_NO_QUESTION', T('exp.issue.pageNoQuestion'), p.name);
      return { id: p.id, index: pi + 1, name: p.name, question: p.question || '', notes: p.notes || '', contentRect: all.zones.content, visuals, layoutTree: stripTree(p.layout) };
    });
    const zonesOut = {};
    Object.keys(z).forEach(key => { zonesOut[key] = Object.assign({}, z[key]); });
    const navPos = MK.navPosOf(c), navList = MK.navNames(c); const navNames = navPos === 'header' ? navList : [];
    if (z.header) Object.assign(zonesOut.header, { style: d.header, logoPos: c.header.logoPos, title: c.header.title, subtitle: c.header.sub, nav: navNames, navOn: navPos === 'header', navPosition: navPos, navAuto: !!c.header.navAuto, burger: c.filter.on && c.filter.side === 'burger' });
    if (z.nav) zonesOut.nav.pages = S.pages.map(p => p.name);
    if (z.footer) { zonesOut.footer.text = c.footer.text; zonesOut.footer.nav = navPos === 'footer' ? navList : []; zonesOut.footer.navPosition = navPos; }
    const slicers = (c.filter.fields || []).map(f => Object.assign(fieldOut(f), { default: f.default || null, type: f.type || 'dropdown' }));
    if (c.filter.on) {
      const mode = c.filter.side; const fl = zonesOut.filter || {};
      const fh = c.filter.heading || {}; const headingShown = fh.show === 'on' || (fh.show !== 'off' && !slicers.length) || (fh.show == null && !!fh.text);
      Object.assign(fl, { mode, side: mode, collapsible: mode === 'burger' ? true : !!c.filter.collapsible, heading: headingShown ? (fh.text || (L === 'en' ? 'Filters' : 'Filter')) : null, text: c.filter.text || null, slicers });
      if (mode === 'burger') Object.assign(fl, { x: S.canvas.w - Math.round(c.filter.w * k), y: z.header ? z.header.h : 0, w: Math.round(c.filter.w * k), h: S.canvas.h - (z.header ? z.header.h : 0) - (z.footer ? z.footer.h : 0), overlay: true, note: T('exp.bm.overlayNote') });
      if (mode === 'burger' || c.filter.collapsible) fl.bookmarks = [{ name: T('exp.bm.open'), showsPanel: true }, { name: T('exp.bm.close'), showsPanel: false }];
      zonesOut.filter = fl;
      if (navNames.length > 5 && z.header) issue('warn', 'NAV_OVERFLOW', T('exp.issue.navOverflow', { n: navNames.length }));
    }
    // Felder: alle gebundenen Felder mit Modell-Definition und Steckbrief
    const used = new Map();
    pages.forEach(p => p.visuals.forEach(v => Object.values(v.roles).forEach(l => l.forEach(f => used.set(f.ref, f)))));
    slicers.forEach(f => used.set(f.ref, f));
    const fields = Array.from(used.values()).map(f => {
      const info = MK.fieldInfo(f.ref) || {}; const m = S.fieldMeta[f.ref] || {}; const nf = S.newFields.find(x => x.table === f.table && x.name === f.name);
      return Object.assign({}, f, { description: info.desc || (nf ? nf.desc : '') || '', formatString: info.format || '', dataType: info.type || '', alias: m.alias || '', renameInModel: !!m.rename, confirmed: !!m.confirmed, owner: m.owner || (nf ? nf.owner : '') || '', source: m.source || (nf ? nf.source : '') || '', target: m.target || (nf ? nf.target : '') || '', unit: m.unit || (nf ? nf.unit : '') || '', note: m.note || '' });
    });
    fields.filter(f => f.renameInModel && f.alias).forEach(f => issue('info', 'RENAME_REQUEST', T('exp.issue.renameRequest', { n: f.name, a: f.alias })));
    const newFields = S.newFields.map(f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), description: f.desc || '', unit: f.unit || '', target: f.target || '', owner: f.owner || '', source: f.source || '', openQuestion: f.open || '', used: used.has(fieldRef(f)) }));
    newFields.filter(f => !f.used).forEach(f => issue('info', 'NEW_FIELD_UNUSED', T('exp.issue.newFieldUnused', { n: f.name })));
    // Barrierefreiheit (Modul a11y.js): Kontrast, Schriftgrößen, Kachelgrößen, Titel, Dichte, Navigation
    if (MK.a11yFindings) MK.a11yFindings().forEach(f => issue(f.level, f.code, f.text + (f.hint ? ' (' + f.hint + ')' : ''), f.page, f.visual ? 'mk_' + f.visual : null));
    if (!S.report.audience) issue('info', 'REPORT_NO_AUDIENCE', T('exp.issue.noAudience'));
    if (!S.report.decision) issue('info', 'REPORT_NO_DECISION', T('exp.issue.noDecision'));
    const core = { canvas: { width: S.canvas.w, height: S.canvas.h }, design: d, zones: zonesOut, pages: pages.map(p => ({ name: p.name, question: p.question, visuals: p.visuals.map(v => ({ id: v.id, kind: v.kind, engine: v.engine, title: v.title, content: v.content, rect: v.rect, roles: v.roles, analysis: v.analysis, link: v.link })) })), fields, newFields, links };
    const specHash = fnv(canon(core));
    return {
      meta: { tool: TOOL, version: VER, specVersion: SPEC_VERSION, specHash, name: S.name, lang: L, exportedAt: new Date().toISOString(), skill: 'mockup-to-powerbi' },
      report: Object.assign({ name: S.name }, S.report),
      canvas: { width: S.canvas.w, height: S.canvas.h, preset: S.canvas.preset, uiScale: +k.toFixed(3) },
      spacing: { margin: Math.round(S.spacing.margin * k), gutter: Math.round(S.spacing.gutter * k), tilePadding: Math.round(S.spacing.pad * k), base: { margin: S.spacing.margin, gutter: S.spacing.gutter, tilePadding: S.spacing.pad } },
      design: { nativePalette: d.nativePalette || 'neutral', cornerRadius: Math.round(d.radius * k), tileStyle: d.tile, pageBackground: MK.pageBgOf(d), tileBackground: d.tileBg || '#FFFFFF', headerStyle: d.header, accent: d.accent, variancePalette: d.palette || 'teal', varianceColors: (d.palette || 'teal') === 'ibcs' ? { good: '#3A9A5B', bad: '#C8412F' } : { good: '#1E8F9E', bad: '#D64541' }, colors: { pageBackground: MK.pageBgOf(d), tileBackground: d.tileBg || '#FFFFFF', ink: d.ink || '#0F1E2E', headerBackground: d.header === 'custom' ? d.headerBg : (d.header === 'dark' ? '#0F1E2E' : d.header === 'accent' ? d.accent : '#FFFFFF'), headerInk: d.header === 'custom' ? d.headerInk : (d.header === 'light' ? '#0F1E2E' : '#FFFFFF') }, darkMode: MK.isDark(d.tileBg), fontScale: +k.toFixed(3), typography: Object.assign({ basis: '1280px' }, MK.typo()) },
      zones: zonesOut, pages, links,
      model: { source: S.model.source || null, tables: S.model.tables.map(t => t.name), usedFields: fields },
      fields, newFields, issues,
      warnings: issues.filter(i => i.level !== 'info').map(i => (i.page ? TL(L, 'exp.brief.openPage', { p: i.page }) + ': ' : '') + i.text),
    };
  }
  function bucketsFor(def, v) {
    const b = {}; if (!def.native) return b;
    Object.keys(def.native.map).forEach(roleKey => { const bucket = def.native.map[roleKey]; const list = v.roles[roleKey] || []; if (!list.length) return; b[bucket] = (b[bucket] || []).concat(list.map(f => ({ ref: fieldRef(f), kind: f.kind, isNew: !!f.isNew }))); });
    return b;
  }
  function customBuckets(def, v) {
    // map-Wert ist ein Rollenname des Custom Visuals oder ein Objekt { rolle: /Namensmuster/ }:
    // dann entscheidet der Feldname (z. B. PY -> py, PL -> pl); ohne Treffer die erste noch freie Rolle.
    const b = {}; const push = (bucket, f) => { (b[bucket] = b[bucket] || []).push({ ref: fieldRef(f), kind: f.kind, isNew: !!f.isNew }); };
    Object.keys(def.customVisual.map).forEach(roleKey => {
      const bucket = def.customVisual.map[roleKey]; const list = v.roles[roleKey] || []; if (!list.length) return;
      if (typeof bucket === 'string') { list.forEach(f => push(bucket, f)); return; }
      const keys = Object.keys(bucket);
      list.forEach(f => { const hit = keys.find(k => bucket[k].test(f.name)) || keys.find(k => !b[k]) || keys[keys.length - 1]; push(hit, f); });
    });
    return b;
  }
  function stripTree(n) {
    if (n.type === 'leaf') return { leaf: n.visual ? (n.visual.title || n.visual.kind) : null, stableId: n.id };
    if (n.type === 'grid') return { grid: { cols: n.cols.map(x => +x.toFixed(3)), rows: n.rows.map(x => +x.toFixed(3)) }, cells: n.children.map(c => ({ row: c.r, col: c.c, rowSpan: c.rs, colSpan: c.cs, node: stripTree(c.node) })) };
    return { split: n.dir, children: n.children.map(c => ({ size: +c.size.toFixed(3), node: stripTree(c.node) })) };
  }
  const roleLabel = (kind, key) => { const def = (CAT.byId[kind] || { roles: [] }).roles.find(x => x.key === key); return def ? def.label : key; };
  const r = o => `x=${o.x}, y=${o.y}, w=${o.w}, h=${o.h}`;
  function analysisLine(a, L) {
    const T = (k, v) => TL(L, k, v);
    const parts = [T('exp.an.polarity', { v: T(a.polarity === 'lower' ? 'exp.an.lower' : 'exp.an.higher') }) + (a.polarityAuto ? T('exp.an.auto') : '')];
    if (a.deltaBasis) parts.push(T('exp.an.basis', { b: a.deltaBasis, auto: a.deltaBasisAuto ? T('exp.an.auto') : '', kinds: a.deltaKind.join(' + ') }));
    if (a.unit) parts.push(T('exp.an.unit', { u: a.unit })); if (a.displayUnits) parts.push(T('exp.an.display', { d: a.displayUnits })); if (a.decimals != null) parts.push(T('exp.an.decimals', { n: a.decimals }));
    if (a.sort) parts.push(T('exp.an.sort', { by: a.sort.by, dir: a.sort.dir })); if (a.topN) parts.push(T('exp.an.topN', { n: a.topN })); if (a.timeGrain) parts.push(T('exp.an.grain', { g: a.timeGrain })); if (a.cumulative) parts.push(T('exp.an.cumulative'));
    if (a.scaleGroup) parts.push(T('exp.an.scaleGroup', { g: a.scaleGroup }));
    if (a.smallMultiples) parts.push(T('exp.an.smallMultiples', { f: a.smallMultiples.field || '?' }));
    if (a.fieldParam) parts.push(T('exp.an.fieldParam', { n: a.fieldParam.name, fields: (a.fieldParam.fields || []).join(', ') || '–' }));
    return parts.join(' · ');
  }

  // ------------------------------------------------------------------ Agent-Brief
  function buildBrief(spec) {
    const L = spec.meta.lang === 'en' ? 'en' : 'de'; const T = (k, v) => TL(L, k, v);
    const B = (k, v) => TL(L, 'exp.brief.' + k, v);
    const out = []; const z = spec.zones; const d = spec.design; const rp = spec.report;
    const OPEN = T('exp.open');
    out.push(`# AGENT-BRIEF · ${spec.meta.name}`, '', B('head', { tool: spec.meta.tool, ver: spec.meta.version, date: spec.meta.exportedAt.slice(0, 10), sv: spec.meta.specVersion, hash: spec.meta.specHash, lang: spec.meta.lang }), '');
    out.push(B('hReport'), '', `- **${B('audience')}:** ${rp.audience || OPEN}`, `- **${B('purpose')}:** ${rp.purpose || OPEN}`, `- **${B('decision')}:** ${rp.decision || OPEN}`, `- **${B('version')}:** ${rp.version || '0.1'} · **${B('dataDate')}:** ${rp.dataDate || OPEN}`, '');
    out.push(B('hCanvas'), '',
      B('cPages', { n: spec.pages.length, w: spec.canvas.width, h: spec.canvas.height, s: spec.canvas.uiScale }),
      B('cSpacing', { m: spec.spacing.margin, g: spec.spacing.gutter, p: spec.spacing.tilePadding }),
      B('cTiles', { r: d.cornerRadius, style: tr(L, 'exp.tileStyle.' + d.tileStyle, d.tileStyle), tb: d.tileBackground, pb: d.pageBackground }),
      B('cHeader', { s: d.headerStyle, a: d.accent, pt: Math.round(12 * spec.canvas.uiScale) }),
      B('cTheme'));
    out.push('', B('hZones'), '', B('zoneTable'), B('zoneSep'));
    if (z.nav) out.push(`| ${B('zNav')} | ${z.nav.x} | ${z.nav.y} | ${z.nav.w} | ${z.nav.h} | ${B('zNavTxt', { pages: z.nav.pages.join(' · ') })} |`);
    if (z.header) {
      const style = z.header.style === 'light' ? B('hdrLight') : z.header.style === 'dark' ? B('hdrDark') : B('hdrAccent');
      const logo = z.header.logoPos !== 'none' ? B('hdrLogo', { side: z.header.logoPos === 'right' ? B('sideRight') : B('sideLeft'), h: Math.round(32 * spec.canvas.uiScale) }) : '';
      const nav = z.header.nav && z.header.nav.length ? B('hdrNav', { nav: z.header.nav.join(' · ') }) : '';
      out.push(`| ${B('zHeader')} (${z.header.style}) | ${z.header.x} | ${z.header.y} | ${z.header.w} | ${z.header.h} | ${style}${logo}${B('hdrTitle', { t: z.header.title })}${z.header.subtitle ? B('hdrSub', { s: z.header.subtitle }) : ''}${nav}${z.header.burger ? B('hdrBurger') : ''} |`);
    }
    if (z.filter) {
      const mode = B('fMode.' + z.filter.mode);
      const list = z.filter.slicers.length ? z.filter.slicers.map(s => `\`${s.ref}\`${s.default ? ` = ${s.default}` : ''}${s.isNew ? ` ${T('exp.new')}` : ''}`).join(', ') : B('fNone');
      const slicers = B('fSlicers', { arr: z.filter.mode === 'top' ? B('fArrRow') : B('fArrCol'), list });
      const bm = z.filter.bookmarks ? B('fBookmarks', { list: z.filter.bookmarks.map(b => T('exp.quote', { t: b.name })).join(' / ') }) : '';
      out.push(`| ${B('zFilter', { mode, coll: z.filter.collapsible ? B('filterColl') : '' })} | ${z.filter.x} | ${z.filter.y} | ${z.filter.w} | ${z.filter.h} | ${slicers}${bm} |`);
    }
    if (z.footer) out.push(`| ${B('zFooter')} | ${z.footer.x} | ${z.footer.y} | ${z.footer.w} | ${z.footer.h} | ${B('zFooterTxt', { pt: Math.round(9 * spec.canvas.uiScale), text: z.footer.text })} |`);
    out.push(`| ${B('zContent')} | ${z.content.x} | ${z.content.y} | ${z.content.w} | ${z.content.h} | ${B('zContentTxt')} |`);
    spec.pages.forEach(p => {
      out.push('', B('hPage', { i: p.index, name: p.name }), '');
      if (p.question) out.push(B('pQuestion', { q: p.question }), ''); if (p.notes) out.push(B('pNotes', { n: p.notes }), '');
      if (!p.visuals.length) out.push(B('pEmpty'));
      p.visuals.forEach((v, i) => {
        out.push(`### ${p.index}.${i + 1} ${v.title} \`${v.id}\``, '',
          B('vType', { label: v.label, kind: v.kind, engine: ENGINE[v.engine] }) + (v.chartKitchenMode ? B('vCkMode', { m: v.chartKitchenMode }) : '') + (v.native ? B('vNative', { t: v.native.type }) : ''),
          B('vPos', { rect: r(v.rect), id: v.stableId }));
        if (v.subtitle) out.push(B('vSub', { s: v.subtitle }));
        if (v.content) out.push(B('vText', { t: v.content }));
        if (v.scenario) out.push(B('vScenario', { s: v.scenario }));
        const roleLines = Object.keys(v.roles).map(key => `  - ${roleLabel(v.kind, key)}: ${v.roles[key].map(f => `\`${f.ref}\`${f.isNew ? B('vNew') : ''}`).join(', ')}`);
        out.push(roleLines.length ? B('vRoles') : B('vRolesNone'), ...roleLines);
        if (v.native && Object.keys(v.native.buckets).length) out.push(B('vBuckets', { type: v.native.type }) + Object.keys(v.native.buckets).map(b => `${b} ← ${v.native.buckets[b].map(f => f.ref).join(', ')}`).join(' · '));
        if (Object.keys(v.roles).length && v.kind !== 'slicer' && v.kind !== 'text') out.push(B('vAnalysis', { a: analysisLine(v.analysis, L) }));
        { const it = v.interaction || {}; const beh = []; if (it.drillDown) beh.push(T('exp.an.drillDown')); if (it.crossFilter === false) beh.push(T('exp.an.noCross')); if (it.drillThrough) beh.push(T('exp.an.drillThrough', { p: it.drillThrough.pageName })); if (beh.length) out.push(T('exp.an.behaviour', { list: beh.join(' · ') })); }
        if (v.analysis.message) out.push(B('vMessage', { m: v.analysis.message }));
        if (v.workshop.priority || v.workshop.status !== 'open') out.push(B('vWorkshop', { p: v.workshop.priority ? T('exp.pri.' + v.workshop.priority) + ' · ' : '', s: T('exp.status.' + v.workshop.status) }));
        if (v.link) out.push(B('vLink', { p: v.link.pageName, how: v.kind === 'button' ? B('linkNav') : B('linkDrill') }));
        if (v.notes) out.push(B('vNotes', { n: v.notes }) + (v.workshop.openQuestion ? B('vOpenQ') : ''));
        v.warnings.forEach(w => out.push(`- ⚠ ${w}`));
        out.push('');
      });
    });
    if (spec.links.length) { out.push(B('hLinks'), '', B('linkTable'), '|---|---|---|---|---|'); spec.links.forEach(l => out.push(`| \`${l.fromVisual}\` | ${l.fromPage} | ${l.toPage} | ${l.kind} | ${l.drillField ? `\`${l.drillField}\`` : '–'} |`)); out.push(''); }
    out.push(B('hFields'), '', B('fieldTable'), '|---|---|---|---|---|---|---|---|---|');
    spec.fields.forEach(f => out.push(`| \`${f.ref}\`${f.isNew ? ` ${T('exp.new')}` : ''} | ${f.alias || '–'}${f.renameInModel ? ` ${T('exp.rename')}` : ''} | ${f.description || '–'} | ${f.formatString || '–'} | ${f.unit || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.target || '–'} | ${f.confirmed ? T('exp.yes') : T('exp.no')} |`));
    out.push('');
    if (spec.newFields.length) {
      out.push(B('hNewFields'), '', B('newFieldTable'), '|---|---|---|---|---|---|---|---|---|---|');
      spec.newFields.forEach(f => out.push(`| \`${f.name}\` | ${f.kind === 'measure' ? T('exp.measure') : T('exp.column')} | ${f.table} | ${f.description || '–'} | ${f.unit || '–'} | ${f.target || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.openQuestion || '–'} | ${f.used ? T('exp.yes') : T('exp.no')} |`));
      out.push('');
    }
    out.push(B('hRules'), '', B('r1'), B('r2'), B('r3'), B('r4'), B('r5'), B('r6'), B('r7'), B('r8'), B('r9'), B('r10'));
    const open = spec.issues.filter(i => i.level !== 'info');
    if (open.length) { out.push('', B('hOpen'), ''); open.forEach(i => out.push(`- [${i.level}] ${i.page ? `${B('openPage', { p: i.page })}${i.visual ? ` · \`${i.visual}\`` : ''}: ` : ''}${i.text}`)); }
    return out.join('\n');
  }

  // ------------------------------------------------------------------ Workshop-Doku
  function buildDocs(spec) {
    const L = spec.meta.lang === 'en' ? 'en' : 'de'; const T = (k, v) => TL(L, k, v);
    const D = (k, v) => TL(L, 'exp.docs.' + k, v);
    const out = []; const z = spec.zones; const d = spec.design; const rp = spec.report; const FILL = T('exp.fill');
    out.push(D('h1', { name: spec.meta.name }), '', D('head', { date: today(), v: rp.version || '0.1', hash: spec.meta.specHash, tool: spec.meta.tool, ver: spec.meta.version }), '', '| | |', '|---|---|',
      `| ${D('kParticipants')} | ${rp.participants || FILL} |`, `| ${D('kAudience')} | ${rp.audience || FILL} |`, `| ${D('kPurpose')} | ${rp.purpose || FILL} |`,
      `| ${D('kDecision')} | ${rp.decision || FILL} |`, `| ${D('kDataDate')} | ${rp.dataDate || FILL} |`, `| ${D('kPages')} | ${spec.pages.map(p => p.name).join(' · ')} |`,
      `| ${D('kModel')} | ${spec.model.source || D('modelNone')} ${D('modelTables', { n: spec.model.tables.length })} |`, '');
    const preset = spec.canvas.preset && spec.canvas.preset !== 'custom' ? ` (${tr(L, 'exp.presetName.' + spec.canvas.preset, spec.canvas.preset)})` : '';
    const headerTxt = z.header ? D('dHeaderOn', { t: z.header.title, sub: z.header.subtitle ? D('dHeaderSub', { s: z.header.subtitle }) : '', style: z.header.style, logo: z.header.logoPos === 'none' ? D('logoNone') : z.header.logoPos === 'right' ? D('logoRight') : D('logoLeft') }) : D('off');
    const fMode = z.filter ? { right: D('fRight'), left: D('fLeft'), top: D('fTop'), burger: D('fBurger') }[z.filter.mode] : '';
    const filterTxt = z.filter ? fMode + (z.filter.slicers.length ? `: ${z.filter.slicers.map(s => s.name + (s.default ? D('fPre', { v: s.default }) : '')).join(', ')}` : D('fNoFields')) : D('noneF');
    out.push(D('hDesign'), '',
      D('dFormat', { w: spec.canvas.width, h: spec.canvas.height, preset }),
      D('dHeader', { v: headerTxt }),
      D('dFilter', { v: filterTxt }),
      D('dFooter', { v: z.footer ? D('dFooterOn', { t: z.footer.text }) : D('off') }),
      D('dTiles', { corners: d.cornerRadius ? D('cornersRound', { r: d.cornerRadius }) : D('cornersSharp'), style: { border: D('tBorder'), shadow: D('tShadow'), flat: D('tFlat') }[d.tileStyle], bg: d.pageBackground, accent: d.accent }), '');
    spec.pages.forEach(p => {
      out.push(D('hPage', { i: p.index, name: p.name }), '', D('pQuestion', { q: p.question || FILL }), '');
      if (p.notes) out.push(D('pNotes', { n: p.notes }), '');
      if (p.visuals.length) {
        out.push(D('table'), D('tableSep'));
        p.visuals.forEach((v, i) => {
          const fields = Object.keys(v.roles).map(key => `${roleLabel(v.kind, key)}: ${v.roles[key].map(f => f.name + (f.isNew ? ` ${T('exp.new')}` : '')).join(', ')}`).join('; ') || '–';
          const an = Object.keys(v.roles).length && v.kind !== 'slicer' ? [v.analysis.polarity === 'lower' ? D('anLower') : '', v.analysis.sort ? D('anSort', { by: v.analysis.sort.by }) : '', v.analysis.topN ? D('anTop', { n: v.analysis.topN }) : '', v.analysis.unit || ''].filter(Boolean).join(', ') || '–' : '–';
          out.push(`| ${p.index}.${i + 1} | ${v.title}${v.subtitle ? ` (${v.subtitle})` : ''}${v.analysis.message ? `<br>_${v.analysis.message}_` : ''} | ${v.label}${v.scenario ? `, ${v.scenario}` : ''}${v.engine === 'ck' ? ', ChartKitchen' : ''} | ${fields} | ${an} | ${v.workshop.priority ? T('exp.pri.' + v.workshop.priority) : '–'} | ${T('exp.status.' + v.workshop.status)} | ${[v.content ? D('txtPrefix', { t: v.content }) : '', v.notes, v.link ? `→ ${v.link.pageName}` : ''].filter(Boolean).join(' · ') || '–'} |`);
        });
      } else out.push(D('pEmpty'));
      out.push('');
    });
    if (spec.links.length) { out.push(D('hLinks'), ''); spec.links.forEach(l => out.push(D('link', { from: l.fromPage, id: l.fromVisual, to: l.toPage, kind: l.kind === 'navigation' ? D('linkNav') : (l.drillField ? D('linkDrillOn', { f: l.drillField }) : D('linkDrill')) }))); out.push(''); }
    out.push(D('hFields'), '', D('fieldTable'), D('fieldSep'));
    spec.fields.forEach(f => out.push(`| ${f.ref}${f.isNew ? ` ${T('exp.new')}` : ''} | ${f.alias || '–'} | ${f.description || FILL} | ${f.unit || f.formatString || '–'} | ${f.target || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.confirmed ? '☑' : '☐'} |`));
    out.push('');
    if (spec.newFields.length) { out.push(D('hNew'), '', D('newTable'), D('newSep')); spec.newFields.forEach(f => out.push(`| ${f.name} | ${f.kind === 'measure' ? T('exp.measureLong') : T('exp.dimension')} | ${f.table} | ${f.description || FILL} | ${f.unit || '–'} | ${f.target || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.openQuestion || '–'} |`)); out.push(''); }
    const open = [];
    spec.newFields.forEach(f => { if (f.openQuestion) open.push(`${f.name}: ${f.openQuestion}`); });
    spec.pages.forEach(p => p.visuals.forEach(v => { if (v.workshop.openQuestion) open.push(`${p.name} / ${v.title}: ${v.notes || D('openQNoText')}`); }));
    spec.issues.filter(i => i.level !== 'info').forEach(i => open.push(`${i.page ? i.page + ': ' : ''}${i.text}`));
    spec.fields.filter(f => f.note).forEach(f => open.push(`${f.ref}: ${f.note}`));
    out.push(D('hOpen'), '', ...(open.length ? open.map(o => `- [ ] ${o}`) : [D('openNone')]), '');
    const hints = spec.issues.filter(i => i.level === 'info');
    if (hints.length) out.push(D('hHints'), '', ...hints.map(i => `- ${i.text}`), '');
    out.push(D('hNext'), '', D('n1'), D('n2'), D('n3'), '');
    return out.join('\n');
  }

  // ------------------------------------------------------------------ pbir-visuals je Seite (native Visuals mit vollständigen Pflichtrollen + Slicer)
  function buildPbir(spec, pageId) {
    const p = spec.pages.find(x => x.id === pageId) || spec.pages[0]; const out = [];
    p.visuals.forEach(v => {
      if (v.engine !== 'native' || !v.native) return;
      if (missingRequired(v)) return;                 // unvollständige Visuals nicht emittieren (Import würde die ganze Datei ablehnen)
      const fields = {}; Object.keys(v.native.buckets).forEach(b => { const refs = v.native.buckets[b].map(f => f.ref); fields[b] = refs.length === 1 ? refs[0] : refs; });
      const item = { visual_type: v.native.type, name: v.id, title: v.title, x: v.rect.x, y: v.rect.y, width: v.rect.w, height: v.rect.h };
      if (Object.keys(fields).length) item.fields = fields;
      out.push(item);
    });
    const z = spec.zones.filter;
    if (z) z.slicers.forEach((s, i) => {
      const k = spec.canvas.uiScale; const pad = Math.round(8 * k);
      const item = { visual_type: 'slicer', name: 'mk_slicer_' + slug(s.name) + '_p' + p.index, title: s.name, fields: { Values: s.ref } };
      if (z.mode === 'top') Object.assign(item, { x: z.x + pad + i * Math.round(168 * k), y: z.y + pad, width: Math.round(160 * k), height: z.h - 2 * pad });
      else Object.assign(item, { x: z.x + pad, y: z.y + Math.round(40 * k) + i * Math.round(64 * k), width: z.w - 2 * pad, height: Math.round(56 * k) });
      out.push(item);
    });
    return out;
  }
  const pbirName = p => `pbir-visuals.${slug(p.name)}.json`;

  // ------------------------------------------------------------------ Prompt
  function buildPrompt(spec) {
    const L = spec.meta.lang === 'en' ? 'en' : 'de'; const P = (k, v) => TL(L, 'exp.prompt.' + k, v);
    const all = spec.pages.flatMap(p => p.visuals);
    const ck = all.filter(v => v.engine === 'ck').length, nat = all.filter(v => v.engine === 'native').length, dn = all.filter(v => v.engine === 'deneb').length;
    return [
      P('p1', { sv: spec.meta.specVersion, hash: spec.meta.specHash, name: spec.meta.name, pages: spec.pages.length, pageList: spec.pages.map(p => p.name).join(', '), w: spec.canvas.width, h: spec.canvas.height }),
      '',
      P('p2', {
        all: all.length, ck, nat, dn, lang: spec.meta.lang,
        slicers: spec.zones.filter ? P('pSlicers', { n: spec.zones.filter.slicers.length, mode: spec.zones.filter.mode }) : '',
        links: spec.links.length ? P('pLinks', { n: spec.links.length }) : '',
        newFields: spec.newFields.length ? P('pNewFields', { n: spec.newFields.length }) : '',
      }),
      '',
      P('p3'),
    ].join('\n');
  }

  // ------------------------------------------------------------------ Dialog
  let cur = 'json', spec = null;
  const texts = () => ({ json: JSON.stringify(spec, null, 2), brief: buildBrief(spec), docs: buildDocs(spec), pbir: JSON.stringify(buildPbir(spec, MK.page().id), null, 2), prompt: buildPrompt(spec) });
  const fileNames = () => ({ json: 'mockup-spec.json', brief: 'AGENT-BRIEF.md', docs: 'WORKSHOP-DOKU.md', pbir: pbirName(MK.page()), prompt: 'claude-prompt.txt' });
  function openExport() {
    spec = buildSpec(); const checks = []; const all = spec.pages.flatMap(p => p.visuals);
    const errs = spec.issues.filter(i => i.level === 'error'), warns = spec.issues.filter(i => i.level === 'warn'), infos = spec.issues.filter(i => i.level === 'info');
    if (!all.length) checks.push(['warn', UI('exp.check.noVisual')]);
    if (errs.length) checks.push(['warn', UI('exp.check.errors', { n: errs.length, list: errs.slice(0, 3).map(i => i.text).join(' · '), more: errs.length > 3 ? ' …' : '' })]);
    if (warns.length) checks.push(['warn', UI('exp.check.warns', { n: warns.length, list: warns.slice(0, 3).map(i => i.text).join(' · '), more: warns.length > 3 ? ' …' : '' })]);
    if (infos.length) checks.push(['ok', UI('exp.check.infos', { n: infos.length, first: infos[0].text })]);
    if (!checks.length) checks.push(['ok', UI('exp.check.ready', { p: spec.pages.length, v: all.length, hash: spec.meta.specHash })]);
    $('#expChecks').innerHTML = checks.map(([k, txt]) => `<div class="${k}">${txt}</div>`).join('');
    showExp(cur); $('#dlgExport').showModal();
  }
  function showExp(k) {
    cur = k; $$('#expTabs button').forEach(b => b.classList.toggle('on', b.dataset.exp === k));
    $('#expOut').textContent = texts()[k];
    $('#expHint').textContent = {
      json: UI('exp.hint.json', { sv: SPEC_VERSION }),
      brief: UI('exp.hint.brief'),
      docs: UI('exp.hint.docs'),
      pbir: UI('exp.hint.pbir', { p: MK.page().name, file: pbirName(MK.page()) }),
      prompt: UI('exp.hint.prompt'),
    }[k];
  }
  $('#btnExport').onclick = openExport;
  $('#expTabs').addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (b) showExp(b.dataset.exp); });
  $('#btnExpCopy').onclick = () => navigator.clipboard.writeText(texts()[cur]).then(() => MK.toast(UI('toast.copied', { n: fileNames()[cur] })));
  $('#btnExpDownload').onclick = () => download(fileNames()[cur], texts()[cur]);
  $('#btnExpAll').onclick = async () => {
    const txt = texts(); const files = [['mockup-spec.json', txt.json], ['AGENT-BRIEF.md', txt.brief], ['WORKSHOP-DOKU.md', txt.docs]];
    spec.pages.forEach(p => files.push([pbirName(p), JSON.stringify(buildPbir(spec, p.id), null, 2)]));
    files.forEach(([n, body], i) => setTimeout(() => download(n, body), i * 350));
    if (window.MK_PNG && window.MK_PNG.allPagesPng) {
      try { const pngs = await window.MK_PNG.allPagesPng({ scale: 2 }); pngs.forEach((x, i) => setTimeout(() => window.MK_PNG.download(x.blob, x.fileName), (files.length + i) * 350)); MK.toast(UI('toast.filesPng', { f: files.length, p: pngs.length })); }
      catch (err) { MK.toast(UI('toast.pngFailed', { msg: err.message })); }
    }
  };
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ------------------------------------------------------------------ Speichern / Öffnen
  $('#btnSave').onclick = () => { const S = MK.state; download(slug(S.name) + '.mockup.json', JSON.stringify(S, null, 2)); MK.toast(UI('toast.saved')); };
  $('#btnOpen').onclick = () => { if (MK.visuals().length && !confirm(UI('ask.openReplace'))) return; $('#fileOpen').click(); };
  $('#fileOpen').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(txt => { try { const s = JSON.parse(txt); if (!(s.pages || s.layout) || !s.canvas) throw new Error('kein Mockup'); MK.state = s; if (s.lang && s.lang !== MK.lang) MK.setLang(s.lang); MK.toast(UI('toast.loaded', { n: s.name || f.name })); } catch (err) { MK.toast(UI('toast.notAMockup')); } e.target.value = ''; });
  });

  window.MK_EXPORT = { buildSpec, buildBrief, buildDocs, buildPbir, buildPrompt, pbirName, specVersion: SPEC_VERSION, lang };
})();
