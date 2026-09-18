/* MockupKitchen · Export v0.3 (Spec v3): stabile IDs, Analyse-Block, Berichtskopf, Steckbriefe, Issues, Hash ·
   Ausgaben: mockup-spec.json, AGENT-BRIEF.md, WORKSHOP-DOKU.md, pbir-visuals je Seite, PNG je Seite, Prompt · Speichern/Öffnen */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const MK = window.MK, CAT = window.MK_CATALOG;
  const TOOL = 'MockupKitchen byDatenWG', VER = '0.3', SPEC_VERSION = 3;
  const fieldRef = f => `${f.table}.${f.name}`;
  const slug = s => String(s || 'seite').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Seite';
  const today = () => new Date().toISOString().slice(0, 10);
  const PRI = { must: 'Must', should: 'Should', could: 'Could' }, STATUS = { open: 'offen', agreed: 'abgestimmt', approved: 'abgenommen' };
  const ENGINE = CAT.engineLabel;

  // FNV-1a-Hash über eine kanonische Serialisierung (Provenienz: welcher Mockup-Stand wurde gebaut?)
  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function canon(o) { if (Array.isArray(o)) return '[' + o.map(canon).join(',') + ']'; if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canon(o[k])).join(',') + '}'; return JSON.stringify(o); }

  // ------------------------------------------------------------------ Spec
  function buildSpec() {
    const S = MK.state; const c = S.chrome; const d = S.design; const k = MK.ui();
    const z = MK.zones(); const issues = []; const links = [];
    const issue = (level, code, text, page, visual) => issues.push({ level, code, text, page: page || null, visual: visual || null });
    const fieldOut = f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), isNew: !!f.isNew });
    const pages = S.pages.map((p, pi) => {
      const all = MK.computeAll(p);
      const visuals = all.leaves.filter(l => l.node.visual).map(l => {
        const v = l.node.visual; const def = CAT.byId[v.kind] || { label: v.kind, roles: [], native: null, ck: null, ckMode: null };
        const roles = {}; const vw = []; const id = 'mk_' + l.node.id; const title = v.title || def.label;
        def.roles.forEach(r => { const list = v.roles[r.key] || []; if (list.length) roles[r.key] = list.map(fieldOut); if (r.req && !list.length) { vw.push(`Pflichtrolle „${r.label}" ist leer`); issue(v.engine === 'native' ? 'error' : 'warn', 'ROLE_EMPTY', `Pflichtrolle „${r.label}" leer`, p.name, id); } });
        if (MK.anti[v.kind]) { vw.push(def.note || 'Nicht IBCS-konform'); issue('warn', 'ANTI_PATTERN', `${def.label}: ${def.note || 'nicht IBCS-konform'}`, p.name, id); }
        if (v.engine === 'ck' && !def.ckMode) { vw.push('ChartKitchen hat keinen Modus für diesen Typ'); issue('error', 'CK_NO_MODE', `ChartKitchen kann „${def.label}" nicht; Engine auf nativ oder Deneb stellen`, p.name, id); }
        if (v.engine === 'native' && !def.native) { vw.push('Kein natives Power-BI-Visual für diesen Typ'); issue('error', 'NO_NATIVE', `Kein natives Visual für „${def.label}"`, p.name, id); }
        if ((v.kind === 'text' || v.kind === 'button') && !(v.content || '').trim()) issue('warn', 'TEXT_EMPTY', `„${title}" hat keinen Text; Kachel käme leer im Bericht an`, p.name, id);
        if (/^\s*(Δ|Delta|Abweichung)/i.test(title) && !(v.roles.ref || []).length && !(v.roles.goal || []).length) issue('warn', 'DELTA_NO_REF', `„${title}" verspricht eine Abweichung, hat aber keine Referenz gebunden`, p.name, id);
        const native = def.native && (v.engine === 'native' || v.engine === 'ck') ? { type: def.native.type, buckets: bucketsFor(def, v) } : null;
        const target = v.link ? S.pages.find(x => x.id === v.link) : null;
        const cat = (v.roles.category || v.roles.rows || [])[0] || null;
        if (target) links.push({ fromVisual: id, fromPage: p.name, toPage: target.name, toPageId: target.id, kind: v.kind === 'button' ? 'navigation' : 'drillthrough', drillField: v.kind === 'button' ? null : (cat ? fieldRef(cat) : null) });
        const an = MK.analysisOf(v);
        return {
          id, stableId: l.node.id, slug: slug(title), page: p.name, kind: v.kind, label: def.label, engine: v.engine,
          chartKitchenType: v.engine === 'ck' ? def.ck : null, chartKitchenMode: v.engine === 'ck' ? def.ckMode : null, native,
          title, subtitle: v.sub || '', content: v.content || '', scenario: def.roles.some(r => r.key === 'ref') ? v.scenario : null,
          analysis: { polarity: an.polarity, polarityAuto: an.polarityAuto, deltaBasis: an.deltaBasis, deltaBasisAuto: an.deltaBasisAuto, deltaKind: an.deltaKind, unit: an.unit || null, displayUnits: an.displayUnits === 'auto' ? null : an.displayUnits, decimals: an.decimals, sort: an.sort, topN: an.topN, timeGrain: an.timeGrain, cumulative: an.cumulative, scaleGroup: an.scaleGroup || null, message: an.message || null },
          workshop: { priority: v.priority || null, status: v.status || 'open', openQuestion: !!v.openQuestion },
          rect: l.rect, roles, notes: v.notes || '', link: target ? { pageId: target.id, pageName: target.name } : null, warnings: vw,
        };
      });
      all.leaves.filter(l => !l.node.visual).forEach(l => issue('warn', 'EMPTY_TILE', `Leere Kachel bei x=${l.rect.x}, y=${l.rect.y} (${l.rect.w}×${l.rect.h})`, p.name));
      if (!(p.question || '').trim()) issue('info', 'PAGE_NO_QUESTION', 'Seite ohne Fragestellung / Kernbotschaft', p.name);
      return { id: p.id, index: pi + 1, name: p.name, question: p.question || '', notes: p.notes || '', contentRect: all.zones.content, visuals, layoutTree: stripTree(p.layout) };
    });
    const zonesOut = {};
    Object.keys(z).forEach(key => { zonesOut[key] = Object.assign({}, z[key]); });
    const navNames = c.header.navAuto ? S.pages.map(p => p.name) : (c.header.nav || []);
    if (z.header) Object.assign(zonesOut.header, { style: d.header, logoPos: c.header.logoPos, title: c.header.title, subtitle: c.header.sub, nav: navNames, navAuto: !!c.header.navAuto, burger: c.filter.on && c.filter.side === 'burger' });
    if (z.nav) zonesOut.nav.pages = S.pages.map(p => p.name);
    if (z.footer) zonesOut.footer.text = c.footer.text;
    const slicers = (c.filter.fields || []).map(f => Object.assign(fieldOut(f), { default: f.default || null }));
    if (c.filter.on) {
      const mode = c.filter.side; const fl = zonesOut.filter || {};
      Object.assign(fl, { mode, side: mode, collapsible: mode === 'burger' ? true : !!c.filter.collapsible, slicers });
      if (mode === 'burger') Object.assign(fl, { x: S.canvas.w - Math.round(c.filter.w * k), y: z.header ? z.header.h : 0, w: Math.round(c.filter.w * k), h: S.canvas.h - (z.header ? z.header.h : 0) - (z.footer ? z.footer.h : 0), overlay: true, note: 'Panel liegt über dem Inhalt; sichtbar nur im Bookmark „Filter öffnen".' });
      if (mode === 'burger' || c.filter.collapsible) fl.bookmarks = [{ name: 'Filter öffnen', showsPanel: true }, { name: 'Filter schließen', showsPanel: false }];
      zonesOut.filter = fl;
      if (navNames.length > 5 && z.header) issue('warn', 'NAV_OVERFLOW', `${navNames.length} Nav-Buttons im Kopfband; ab etwa 6 Seiten wird es eng, linke Nav-Leiste prüfen`);
    }
    // Felder: alle gebundenen Felder mit Modell-Definition und Steckbrief
    const used = new Map();
    pages.forEach(p => p.visuals.forEach(v => Object.values(v.roles).forEach(l => l.forEach(f => used.set(f.ref, f)))));
    slicers.forEach(f => used.set(f.ref, f));
    const fields = Array.from(used.values()).map(f => {
      const info = MK.fieldInfo(f.ref) || {}; const m = S.fieldMeta[f.ref] || {}; const nf = S.newFields.find(x => x.table === f.table && x.name === f.name);
      return Object.assign({}, f, { description: info.desc || (nf ? nf.desc : '') || '', formatString: info.format || '', dataType: info.type || '', alias: m.alias || '', renameInModel: !!m.rename, confirmed: !!m.confirmed, owner: m.owner || (nf ? nf.owner : '') || '', source: m.source || (nf ? nf.source : '') || '', target: m.target || (nf ? nf.target : '') || '', unit: m.unit || (nf ? nf.unit : '') || '', note: m.note || '' });
    });
    fields.filter(f => f.renameInModel && f.alias).forEach(f => issue('info', 'RENAME_REQUEST', `Fachbereich möchte „${f.name}" in „${f.alias}" umbenennen`));
    const newFields = S.newFields.map(f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), description: f.desc || '', unit: f.unit || '', target: f.target || '', owner: f.owner || '', source: f.source || '', openQuestion: f.open || '', used: used.has(fieldRef(f)) }));
    newFields.filter(f => !f.used).forEach(f => issue('info', 'NEW_FIELD_UNUSED', `Neues Feld „${f.name}" ist auf keiner Kachel gebunden`));
    if (!S.report.audience) issue('info', 'REPORT_NO_AUDIENCE', 'Berichtskopf: Zielgruppe fehlt');
    if (!S.report.decision) issue('info', 'REPORT_NO_DECISION', 'Berichtskopf: Entscheidung fehlt');
    const core = { canvas: { width: S.canvas.w, height: S.canvas.h }, design: d, zones: zonesOut, pages: pages.map(p => ({ name: p.name, question: p.question, visuals: p.visuals.map(v => ({ id: v.id, kind: v.kind, engine: v.engine, title: v.title, content: v.content, rect: v.rect, roles: v.roles, analysis: v.analysis, link: v.link })) })), fields, newFields, links };
    const specHash = fnv(canon(core));
    return {
      meta: { tool: TOOL, version: VER, specVersion: SPEC_VERSION, specHash, name: S.name, lang: S.lang || 'de', exportedAt: new Date().toISOString(), skill: 'mockup-to-powerbi' },
      report: Object.assign({ name: S.name }, S.report),
      canvas: { width: S.canvas.w, height: S.canvas.h, preset: S.canvas.preset, uiScale: +k.toFixed(3) },
      spacing: { margin: Math.round(S.spacing.margin * k), gutter: Math.round(S.spacing.gutter * k), tilePadding: Math.round(S.spacing.pad * k), base: { margin: S.spacing.margin, gutter: S.spacing.gutter, tilePadding: S.spacing.pad } },
      design: { cornerRadius: Math.round(d.radius * k), tileStyle: d.tile, pageBackground: MK.pageBg[d.pageBg] || '#F4F4F1', tileBackground: '#FFFFFF', headerStyle: d.header, accent: d.accent, darkMode: false, fontScale: +k.toFixed(3) },
      zones: zonesOut, pages, links,
      model: { source: S.model.source || null, tables: S.model.tables.map(t => t.name), usedFields: fields },
      fields, newFields, issues,
      warnings: issues.filter(i => i.level !== 'info').map(i => (i.page ? `Seite „${i.page}": ` : '') + i.text),
    };
  }
  function bucketsFor(def, v) {
    const b = {}; if (!def.native) return b;
    Object.keys(def.native.map).forEach(roleKey => { const bucket = def.native.map[roleKey]; const list = v.roles[roleKey] || []; if (!list.length) return; b[bucket] = (b[bucket] || []).concat(list.map(f => ({ ref: fieldRef(f), kind: f.kind, isNew: !!f.isNew }))); });
    return b;
  }
  function stripTree(n) { return n.type === 'leaf' ? { leaf: n.visual ? (n.visual.title || n.visual.kind) : null, stableId: n.id } : { split: n.dir, children: n.children.map(c => ({ size: +c.size.toFixed(3), node: stripTree(c.node) })) }; }
  const roleLabel = (kind, key) => { const def = (CAT.byId[kind] || { roles: [] }).roles.find(x => x.key === key); return def ? def.label : key; };
  const r = o => `x=${o.x}, y=${o.y}, w=${o.w}, h=${o.h}`;
  function analysisLine(a) {
    const parts = [`Polarität ${a.polarity === 'lower' ? 'kleiner = besser' : 'größer = besser'}${a.polarityAuto ? ' (auto)' : ''}`];
    if (a.deltaBasis) parts.push(`Δ-Basis ${a.deltaBasis}${a.deltaBasisAuto ? ' (auto)' : ''}, Δ ${a.deltaKind.join(' + ')}`);
    if (a.unit) parts.push(`Einheit ${a.unit}`); if (a.displayUnits) parts.push(`Anzeige ${a.displayUnits}`); if (a.decimals != null) parts.push(`${a.decimals} Dezimalstellen`);
    if (a.sort) parts.push(`Sortierung ${a.sort.by} ${a.sort.dir}`); if (a.topN) parts.push(`Top ${a.topN}`); if (a.timeGrain) parts.push(`Granularität ${a.timeGrain}`); if (a.cumulative) parts.push('kumuliert');
    if (a.scaleGroup) parts.push(`Skalengruppe ${a.scaleGroup}`);
    return parts.join(' · ');
  }

  // ------------------------------------------------------------------ Agent-Brief
  function buildBrief(spec) {
    const L = []; const z = spec.zones; const d = spec.design; const rp = spec.report;
    L.push(`# AGENT-BRIEF · ${spec.meta.name}`, '', `Erzeugt von ${spec.meta.tool} ${spec.meta.version} am ${spec.meta.exportedAt.slice(0, 10)} · Spec v${spec.meta.specVersion} · Hash \`${spec.meta.specHash}\` · Sprache ${spec.meta.lang}. Maschinenlesbare Fassung: \`mockup-spec.json\`. Umsetzung mit dem Skill \`mockup-to-powerbi\`.`, '');
    L.push('## Berichtskopf', '', `- **Zielgruppe:** ${rp.audience || '[offen]'}`, `- **Ziel:** ${rp.purpose || '[offen]'}`, `- **Entscheidung:** ${rp.decision || '[offen]'}`, `- **Version:** ${rp.version || '0.1'} · **Datenstand:** ${rp.dataDate || '[offen]'}`, '');
    L.push('## Canvas und Gestaltung', '', `- ${spec.pages.length} Seite(n), alle ${spec.canvas.width} × ${spec.canvas.height} px. Skalierung ×${spec.canvas.uiScale} gegenüber HD.`, `- Rand ${spec.spacing.margin} px · Zwischenraum ${spec.spacing.gutter} px · Kachel-Innenabstand ${spec.spacing.tilePadding} px.`, `- Kacheln: Ecken ${d.cornerRadius} px, Stil „${{ border: 'weiß mit feinem Rahmen', shadow: 'weiß mit weichem Schatten', flat: 'flach ohne Rahmen' }[d.tileStyle] || d.tileStyle}", Kachelhintergrund ${d.tileBackground}, Seitenhintergrund ${d.pageBackground}.`, `- Kopfband-Stil „${d.headerStyle}", Akzentfarbe ${d.accent}. Schriften proportional zur Skalierung (Visual-Titel ≈ ${Math.round(12 * spec.canvas.uiScale)} pt).`, `- Gestaltung bevorzugt als Theme-Fragment umsetzen (visualStyles), Overrides je Visual nur für Ausnahmen.`);
    L.push('', '## Zonen (Chrome, auf jeder Seite identisch)', '', '| Zone | x | y | w | h | Inhalt |', '|---|---|---|---|---|---|');
    if (z.nav) L.push(`| Nav-Leiste | ${z.nav.x} | ${z.nav.y} | ${z.nav.w} | ${z.nav.h} | Shape Ink-Farbe, ein Icon-Button je Seite (${z.nav.pages.join(' · ')}), aktive Seite Akzent |`);
    if (z.header) L.push(`| Kopfband (${z.header.style}) | ${z.header.x} | ${z.header.y} | ${z.header.w} | ${z.header.h} | ${z.header.style === 'light' ? 'weiße Fläche mit Unterkante, dunkle Schrift' : z.header.style === 'dark' ? 'Shape Ink-Farbe, weiße Schrift' : 'Shape Akzentfarbe, weiße Schrift'}${z.header.logoPos !== 'none' ? `, Logo ${z.header.logoPos === 'right' ? 'rechts' : 'links'} (Höhe ${Math.round(32 * spec.canvas.uiScale)})` : ''}, Titel „${z.header.title}"${z.header.subtitle ? ` · Untertitel „${z.header.subtitle}"` : ''}${z.header.nav && z.header.nav.length ? `, Nav-Buttons: ${z.header.nav.join(' · ')} (Seitennavigation, aktive Seite als deaktivierter Akzent-Button)` : ''}${z.header.burger ? ', Burger-Button links (öffnet Filter-Bookmark)' : ''} |`);
    if (z.filter) L.push(`| Filter (${{ right: 'Panel rechts', left: 'Panel links', top: 'Leiste oben', burger: 'Overlay per Burger-Menü' }[z.filter.mode]}${z.filter.collapsible ? ', per Bookmark ein-/ausblendbar' : ''}) | ${z.filter.x} | ${z.filter.y} | ${z.filter.w} | ${z.filter.h} | Slicer ${z.filter.mode === 'top' ? 'nebeneinander' : 'gestapelt'}: ${z.filter.slicers.length ? z.filter.slicers.map(s => `\`${s.ref}\`${s.default ? ` = ${s.default}` : ''}${s.isNew ? ' (neu)' : ''}`).join(', ') : 'noch keine'}${z.filter.bookmarks ? `; Bookmarks: ${z.filter.bookmarks.map(b => `„${b.name}"`).join(' / ')}` : ''} |`);
    if (z.footer) L.push(`| Fußleiste | ${z.footer.x} | ${z.footer.y} | ${z.footer.w} | ${z.footer.h} | Textfeld ${Math.round(9 * spec.canvas.uiScale)} pt grau: „${z.footer.text}" |`);
    L.push(`| Inhaltsbereich | ${z.content.x} | ${z.content.y} | ${z.content.w} | ${z.content.h} | alle Visuals liegen exakt hier drin |`);
    spec.pages.forEach(p => {
      L.push('', `## Seite ${p.index} · ${p.name}`, '');
      if (p.question) L.push(`**Fragestellung:** ${p.question}`, ''); if (p.notes) L.push(`**Notizen:** ${p.notes}`, '');
      if (!p.visuals.length) L.push('_Noch keine Visuals._');
      p.visuals.forEach((v, i) => {
        L.push(`### ${p.index}.${i + 1} ${v.title} \`${v.id}\``, '', `- **Typ:** ${v.label} (\`${v.kind}\`) · **Engine:** ${ENGINE[v.engine]}${v.chartKitchenMode ? ` · ChartKitchen-Modus \`${v.chartKitchenMode}\`` : ''}${v.native ? ` · natives Visual \`${v.native.type}\`` : ''}`, `- **Position:** ${r(v.rect)} · **stabile ID:** \`${v.stableId}\``);
        if (v.subtitle) L.push(`- **Untertitel / Einheit:** ${v.subtitle}`);
        if (v.content) L.push(`- **Text:** ${v.content}`);
        if (v.scenario) L.push(`- **Szenario:** ${v.scenario}`);
        const roleLines = Object.keys(v.roles).map(key => `  - ${roleLabel(v.kind, key)}: ${v.roles[key].map(f => `\`${f.ref}\`${f.isNew ? ' **(neu anlegen)**' : ''}`).join(', ')}`);
        L.push(roleLines.length ? '- **Datenrollen:**' : '- **Datenrollen:** keine gebunden', ...roleLines);
        if (v.native && Object.keys(v.native.buckets).length) L.push(`- **pbir-Buckets (${v.native.type}):** ` + Object.keys(v.native.buckets).map(b => `${b} ← ${v.native.buckets[b].map(f => f.ref).join(', ')}`).join(' · '));
        if (Object.keys(v.roles).length && v.kind !== 'slicer' && v.kind !== 'text') L.push(`- **Analyse:** ${analysisLine(v.analysis)}`);
        if (v.analysis.message) L.push(`- **Kernaussage (Titelzeile):** ${v.analysis.message}`);
        if (v.workshop.priority || v.workshop.status !== 'open') L.push(`- **Workshop:** ${v.workshop.priority ? PRI[v.workshop.priority] + ' · ' : ''}Status ${STATUS[v.workshop.status]}`);
        if (v.link) L.push(`- **Springt zu:** Seite „${v.link.pageName}" (${v.kind === 'button' ? 'Seitennavigation per Button-Aktion' : 'Drill-through; Zielseite mit Drill-through-Feld aus der Kategorie dieses Visuals'})`);
        if (v.notes) L.push(`- **Notizen:** ${v.notes}${v.workshop.openQuestion ? ' **(offene Frage)**' : ''}`);
        v.warnings.forEach(w => L.push(`- ⚠ ${w}`));
        L.push('');
      });
    });
    if (spec.links.length) { L.push('## Navigation und Drill', '', '| Von (Visual) | Seite | Nach Seite | Art | Drill-Feld |', '|---|---|---|---|---|'); spec.links.forEach(l => L.push(`| \`${l.fromVisual}\` | ${l.fromPage} | ${l.toPage} | ${l.kind} | ${l.drillField ? `\`${l.drillField}\`` : '–'} |`)); L.push(''); }
    L.push('## Kennzahlen-Steckbrief (gebundene Felder)', '', '| Feld | Alias (Fachbereich) | Definition laut Modell | Format | Einheit | Owner | Quelle | Ziel | bestätigt |', '|---|---|---|---|---|---|---|---|---|');
    spec.fields.forEach(f => L.push(`| \`${f.ref}\`${f.isNew ? ' (neu)' : ''} | ${f.alias || '–'}${f.renameInModel ? ' (umbenennen)' : ''} | ${f.description || '–'} | ${f.formatString || '–'} | ${f.unit || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.target || '–'} | ${f.confirmed ? 'ja' : 'nein'} |`));
    L.push('');
    if (spec.newFields.length) {
      L.push('## Neue Kennzahlen / Felder (im Modell anlegen, bevor Visuals gebunden werden)', '', '| Feld | Art | Tabelle | Beschreibung | Einheit/Format | Ziel | Owner | Quelle | offene Frage | verwendet |', '|---|---|---|---|---|---|---|---|---|---|');
      spec.newFields.forEach(f => L.push(`| \`${f.name}\` | ${f.kind === 'measure' ? 'Measure' : 'Spalte'} | ${f.table} | ${f.description || '–'} | ${f.unit || '–'} | ${f.target || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.openQuestion || '–'} | ${f.used ? 'ja' : 'nein'} |`));
      L.push('');
    }
    L.push('## Regeln für die Umsetzung', '', '- Positionen und Größen exakt übernehmen; nichts „optisch nachjustieren". Rundungen ±1 px sind ok.', '- Visual-Namen im PBIR = `id` aus der Spec (stabil über Läufe hinweg); ein zweiter Lauf ist ein Delta, kein Neubau.', '- Chrome-Zonen auf jeder Seite identisch anlegen; Nav-Buttons auf allen Seiten, aktive Seite als deaktivierter Akzent-Button.', '- Kein Visual außerhalb des Inhaltsbereichs, keine Überlappung; Chrome-Zonen bleiben visualfrei.', '- Text-Kacheln mit `content` als Shape mit Text bauen (Textbox per CLI bleibt leer).', '- Analyse-Angaben je Kachel umsetzen: Polarität (invert), Δ-Basis, Sortierung, Top-N, Einheit/Dezimalen, Granularität; `auto`-Werte sind Vorschläge, keine Entscheidungen.', '- ChartKitchen-Visuals nur über eine vorhandene Referenz-Instanz replizieren, nie visual.json raten. Fehlt die Instanz: Platzhalter und Hinweis.', '- Native Visuals je Seite mit `pbir add visual "<Report>.Report/<Seite>.Page" --from-json pbir-visuals.<Seite>.json` anlegen; Visuals mit leeren Pflichtrollen sind dort nicht enthalten.', '- Neue Felder zuerst im Semantikmodell anlegen (`te`), dann `te validate --errors-only`, erst danach binden. Umbenennungswünsche (Alias) nur nach Freigabe umsetzen.', '- Farben/Schrift kommen aus dem Theme; dieser Brief regelt Struktur, Bindung und Design-Entscheidungen.');
    const open = spec.issues.filter(i => i.level !== 'info');
    if (open.length) { L.push('', '## Offene Punkte aus dem Mockup', ''); open.forEach(i => L.push(`- [${i.level}] ${i.page ? `Seite „${i.page}"${i.visual ? ` · \`${i.visual}\`` : ''}: ` : ''}${i.text}`)); }
    return L.join('\n');
  }

  // ------------------------------------------------------------------ Workshop-Doku
  function buildDocs(spec) {
    const L = []; const z = spec.zones; const d = spec.design; const rp = spec.report;
    L.push(`# Workshop-Dokumentation · ${spec.meta.name}`, '', `Stand: ${today()} · Version ${rp.version || '0.1'} · Spec-Hash \`${spec.meta.specHash}\` · erstellt mit ${spec.meta.tool} ${spec.meta.version}`, '', '| | |', '|---|---|', `| Teilnehmende | ${rp.participants || '[ausfüllen]'} |`, `| Zielgruppe | ${rp.audience || '[ausfüllen]'} |`, `| Ziel des Berichts | ${rp.purpose || '[ausfüllen]'} |`, `| Entscheidung | ${rp.decision || '[ausfüllen]'} |`, `| Datenstand / Aktualisierung | ${rp.dataDate || '[ausfüllen]'} |`, `| Seiten | ${spec.pages.map(p => p.name).join(' · ')} |`, `| Datenmodell | ${spec.model.source || 'noch nicht angebunden'} (${spec.model.tables.length} Tabellen) |`, '');
    L.push('## Entscheidungen zur Gestaltung', '', `- Format ${spec.canvas.width} × ${spec.canvas.height} px${spec.canvas.preset && spec.canvas.preset !== 'custom' ? ` (${{ '1280x720': 'HD', '1920x1080': 'Full HD', '3840x2160': 'Ultra HD' }[spec.canvas.preset] || spec.canvas.preset})` : ''}.`, `- Kopfband ${z.header ? `„${z.header.title}"${z.header.subtitle ? ` · ${z.header.subtitle}` : ''}, Stil ${z.header.style}, Logo ${z.header.logoPos === 'none' ? 'ohne' : z.header.logoPos === 'right' ? 'rechts' : 'links'}` : 'ohne'}.`, `- Filter ${z.filter ? { right: 'als Panel rechts', left: 'als Panel links', top: 'als Leiste oben', burger: 'als Burger-Menü (Bookmark)' }[z.filter.mode] + (z.filter.slicers.length ? `: ${z.filter.slicers.map(s => s.name + (s.default ? ` (Vorauswahl ${s.default})` : '')).join(', ')}` : ', noch ohne Felder') : 'keine'}.`, `- Fußleiste ${z.footer ? `„${z.footer.text}"` : 'ohne'}.`, `- Kacheln ${d.cornerRadius ? `gerundet (${d.cornerRadius} px)` : 'eckig'}, ${{ border: 'mit feinem Rahmen', shadow: 'mit weichem Schatten', flat: 'flach' }[d.tileStyle]}, Seitenhintergrund ${d.pageBackground}, Akzent ${d.accent}.`, '');
    spec.pages.forEach(p => {
      L.push(`## Seite ${p.index} · ${p.name}`, '', `**Fragestellung:** ${p.question || '[ausfüllen]'}`, '');
      if (p.notes) L.push(`**Notizen:** ${p.notes}`, '');
      if (p.visuals.length) {
        L.push('| # | Kachel | Darstellung | Felder | Analyse | Prio | Status | Notizen |', '|---|---|---|---|---|---|---|---|');
        p.visuals.forEach((v, i) => {
          const fields = Object.keys(v.roles).map(key => `${roleLabel(v.kind, key)}: ${v.roles[key].map(f => f.name + (f.isNew ? ' (neu)' : '')).join(', ')}`).join('; ') || '–';
          const an = Object.keys(v.roles).length && v.kind !== 'slicer' ? [v.analysis.polarity === 'lower' ? 'kleiner = besser' : '', v.analysis.sort ? `sortiert nach ${v.analysis.sort.by}` : '', v.analysis.topN ? `Top ${v.analysis.topN}` : '', v.analysis.unit || ''].filter(Boolean).join(', ') || '–' : '–';
          L.push(`| ${p.index}.${i + 1} | ${v.title}${v.subtitle ? ` (${v.subtitle})` : ''}${v.analysis.message ? `<br>_${v.analysis.message}_` : ''} | ${v.label}${v.scenario ? `, ${v.scenario}` : ''}${v.engine === 'ck' ? ', ChartKitchen' : ''} | ${fields} | ${an} | ${v.workshop.priority ? PRI[v.workshop.priority] : '–'} | ${STATUS[v.workshop.status]} | ${[v.content ? `Text: ${v.content}` : '', v.notes, v.link ? `→ ${v.link.pageName}` : ''].filter(Boolean).join(' · ') || '–'} |`);
        });
      } else L.push('_Noch keine Kacheln._');
      L.push('');
    });
    if (spec.links.length) { L.push('## Navigation und Drill-Wege', ''); spec.links.forEach(l => L.push(`- Von „${l.fromPage}" (${l.fromVisual}) nach „${l.toPage}" (${l.kind === 'navigation' ? 'Seitenwechsel' : 'Drill-through' + (l.drillField ? ` auf ${l.drillField}` : '')})`)); L.push(''); }
    L.push('## Kennzahlen-Steckbrief', '', '| Feld | Heißt beim Fachbereich | Definition laut Modell | Einheit | Ziel | Owner | Quelle | bestätigt |', '|---|---|---|---|---|---|---|---|');
    spec.fields.forEach(f => L.push(`| ${f.ref}${f.isNew ? ' (neu)' : ''} | ${f.alias || '–'} | ${f.description || '[ausfüllen]'} | ${f.unit || f.formatString || '–'} | ${f.target || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.confirmed ? '☑' : '☐'} |`));
    L.push('');
    if (spec.newFields.length) { L.push('### Neu zu erstellen', '', '| Feld | Art | Tabelle | Beschreibung / Logik | Einheit | Ziel | Owner | Quelle | Offene Frage |', '|---|---|---|---|---|---|---|---|---|'); spec.newFields.forEach(f => L.push(`| ${f.name} | ${f.kind === 'measure' ? 'Kennzahl' : 'Dimension'} | ${f.table} | ${f.description || '[ausfüllen]'} | ${f.unit || '–'} | ${f.target || '–'} | ${f.owner || '–'} | ${f.source || '–'} | ${f.openQuestion || '–'} |`)); L.push(''); }
    const open = [];
    spec.newFields.forEach(f => { if (f.openQuestion) open.push(`${f.name}: ${f.openQuestion}`); });
    spec.pages.forEach(p => p.visuals.forEach(v => { if (v.workshop.openQuestion) open.push(`${p.name} / ${v.title}: ${v.notes || 'offene Frage ohne Text'}`); }));
    spec.issues.filter(i => i.level !== 'info').forEach(i => open.push(`${i.page ? i.page + ': ' : ''}${i.text}`));
    spec.fields.filter(f => f.note).forEach(f => open.push(`${f.ref}: ${f.note}`));
    L.push('## Offene Punkte', '', ...(open.length ? open.map(o => `- [ ] ${o}`) : ['- [ ] keine offenen Punkte erfasst']), '');
    const hints = spec.issues.filter(i => i.level === 'info');
    if (hints.length) L.push('## Hinweise', '', ...hints.map(i => `- ${i.text}`), '');
    L.push('## Nächste Schritte', '', '- [ ] Kennzahlen-Definitionen bestätigen (Steckbrief), fehlende Kennzahlen im Semantikmodell anlegen', '- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen', '- [ ] Review der gebauten Seiten mit den Teilnehmenden, Status auf „abgenommen" setzen', '');
    return L.join('\n');
  }

  // ------------------------------------------------------------------ pbir-visuals je Seite (native Visuals mit vollständigen Pflichtrollen + Slicer)
  function buildPbir(spec, pageId) {
    const p = spec.pages.find(x => x.id === pageId) || spec.pages[0]; const out = [];
    p.visuals.forEach(v => {
      if (v.engine !== 'native' || !v.native) return;
      if (v.warnings.some(w => w.startsWith('Pflichtrolle'))) return;                 // unvollständige Visuals nicht emittieren (Import würde die ganze Datei ablehnen)
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
    const all = spec.pages.flatMap(p => p.visuals);
    const ck = all.filter(v => v.engine === 'ck').length, nat = all.filter(v => v.engine === 'native').length, dn = all.filter(v => v.engine === 'deneb').length;
    return [`Lies mockup-spec.json (Spec v${spec.meta.specVersion}, Hash ${spec.meta.specHash}), AGENT-BRIEF.md und WORKSHOP-DOKU.md im Projektordner und nutze den Skill mockup-to-powerbi, um den Bericht „${spec.meta.name}" (${spec.pages.length} Seite(n): ${spec.pages.map(p => p.name).join(', ')}; ${spec.canvas.width}×${spec.canvas.height}) in mein PBIP-Projekt zu übertragen.`, '', `Umfang: ${all.length} Visuals (${ck} ChartKitchen, ${nat} nativ, ${dn} Deneb)${spec.zones.filter ? `, ${spec.zones.filter.slicers.length} Slicer (${spec.zones.filter.mode})` : ''}${spec.links.length ? `, ${spec.links.length} Drill-/Navigationsverknüpfung(en)` : ''}${spec.newFields.length ? `, ${spec.newFields.length} neue Felder im Modell` : ''}. Sprache der Ausgaben: ${spec.meta.lang}.`, '', 'Vorgehen: Spec validieren, Plan zeigen (Seiten, Dateien, Modelländerungen, Delta gegenüber einem bestehenden Bau), Backup/Commit, dann je Seite Chrome-Zonen, native Visuals per pbir-visuals.<Seite>.json, Text-Kacheln als Shapes mit Inhalt, ChartKitchen-Slots über die Referenz-Instanz, Analyse-Angaben (Polarität, Sortierung, Top-N, Einheit) umsetzen, Navigation/Drill/Bookmarks laut Brief. Am Ende pbir validate --fields, te validate --errors-only und den Abnahme-Check laufen lassen; danach die Workshop-Doku als PowerPoint erzeugen (PNG-Seitenbilder liegen bei, falls exportiert).'].join('\n');
  }

  // ------------------------------------------------------------------ Dialog
  let cur = 'json', spec = null;
  const texts = () => ({ json: JSON.stringify(spec, null, 2), brief: buildBrief(spec), docs: buildDocs(spec), pbir: JSON.stringify(buildPbir(spec, MK.page().id), null, 2), prompt: buildPrompt(spec) });
  const fileNames = () => ({ json: 'mockup-spec.json', brief: 'AGENT-BRIEF.md', docs: 'WORKSHOP-DOKU.md', pbir: pbirName(MK.page()), prompt: 'claude-prompt.txt' });
  function openExport() {
    spec = buildSpec(); const checks = []; const all = spec.pages.flatMap(p => p.visuals);
    const errs = spec.issues.filter(i => i.level === 'error'), warns = spec.issues.filter(i => i.level === 'warn'), infos = spec.issues.filter(i => i.level === 'info');
    if (!all.length) checks.push(['warn', 'Noch kein Visual auf den Seiten.']);
    if (errs.length) checks.push(['warn', `${errs.length} Fehler: ${errs.slice(0, 3).map(i => i.text).join(' · ')}${errs.length > 3 ? ' …' : ''}`]);
    if (warns.length) checks.push(['warn', `${warns.length} Warnung(en): ${warns.slice(0, 3).map(i => i.text).join(' · ')}${warns.length > 3 ? ' …' : ''}`]);
    if (infos.length) checks.push(['ok', `${infos.length} Hinweis(e) für die Doku (z. B. ${infos[0].text}).`]);
    if (!checks.length) checks.push(['ok', `Bereit: ${spec.pages.length} Seite(n), ${all.length} Visuals, alle Pflichtrollen gebunden. Hash ${spec.meta.specHash}.`]);
    $('#expChecks').innerHTML = checks.map(([k, t]) => `<div class="${k}">${t}</div>`).join('');
    showExp(cur); $('#dlgExport').showModal();
  }
  function showExp(k) {
    cur = k; $$('#expTabs button').forEach(b => b.classList.toggle('on', b.dataset.exp === k));
    $('#expOut').textContent = texts()[k];
    $('#expHint').textContent = { json: `Spec v${SPEC_VERSION}: Berichtskopf, Design, Zonen, Seiten mit Visuals (stabile IDs, Rechtecke, Rollen, Analyse, Workshop-Status), Verknüpfungen, Steckbriefe, Issues, Hash.`, brief: 'Für Menschen und Agenten lesbar; Format wie AGENT-BRIEF des Design-Framework-Skills.', docs: 'Workshop-Protokoll: Berichtskopf, Entscheidungen, Seiten, Steckbriefe, offene Punkte. Der Skill macht daraus auch eine PowerPoint.', pbir: `Native Visuals mit vollständigen Pflichtrollen + Slicer der Seite „${MK.page().name}". Verwenden: pbir add visual "Report.Report/${MK.page().name}.Page" --from-json ${pbirName(MK.page())}`, prompt: 'In Claude Code einfügen, nachdem die Dateien im PBIP-Ordner liegen.' }[k];
  }
  $('#btnExport').onclick = openExport;
  $('#expTabs').addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (b) showExp(b.dataset.exp); });
  $('#btnExpCopy').onclick = () => navigator.clipboard.writeText(texts()[cur]).then(() => MK.toast(fileNames()[cur] + ' kopiert'));
  $('#btnExpDownload').onclick = () => download(fileNames()[cur], texts()[cur]);
  $('#btnExpAll').onclick = async () => {
    const t = texts(); const files = [['mockup-spec.json', t.json], ['AGENT-BRIEF.md', t.brief], ['WORKSHOP-DOKU.md', t.docs]];
    spec.pages.forEach(p => files.push([pbirName(p), JSON.stringify(buildPbir(spec, p.id), null, 2)]));
    files.forEach(([n, txt], i) => setTimeout(() => download(n, txt), i * 350));
    if (window.MK_PNG && window.MK_PNG.allPagesPng) {
      try { const pngs = await window.MK_PNG.allPagesPng({ scale: 2 }); pngs.forEach((x, i) => setTimeout(() => window.MK_PNG.download(x.blob, x.fileName), (files.length + i) * 350)); MK.toast(`${files.length} Dateien + ${pngs.length} Seitenbilder`); }
      catch (err) { MK.toast('PNG-Export fehlgeschlagen: ' + err.message); }
    }
  };
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ------------------------------------------------------------------ Speichern / Öffnen
  $('#btnSave').onclick = () => { const S = MK.state; download(slug(S.name) + '.mockup.json', JSON.stringify(S, null, 2)); MK.toast('Mockup gespeichert'); };
  $('#btnOpen').onclick = () => { if (MK.visuals().length && !confirm('Öffnen ersetzt das aktuelle Mockup. Vorher speichern? (Abbrechen = zurück)')) return; $('#fileOpen').click(); };
  $('#fileOpen').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { try { const s = JSON.parse(t); if (!(s.pages || s.layout) || !s.canvas) throw new Error('kein Mockup'); MK.state = s; MK.toast('„' + (s.name || f.name) + '" geladen'); } catch (err) { MK.toast('Datei ist kein MockupKitchen-Mockup'); } e.target.value = ''; });
  });

  window.MK_EXPORT = { buildSpec, buildBrief, buildDocs, buildPbir, buildPrompt, pbirName, specVersion: SPEC_VERSION };
})();
