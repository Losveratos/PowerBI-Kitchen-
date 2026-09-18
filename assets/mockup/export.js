/* MockupKitchen · Export v0.2: mockup-spec.json (mehrseitig), AGENT-BRIEF.md, WORKSHOP-DOKU.md, pbir-visuals je Seite, Prompt · Speichern/Öffnen */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const MK = window.MK, CAT = window.MK_CATALOG;
  const TOOL = 'MockupKitchen byDatenWG', VER = '0.2';
  const fieldRef = f => `${f.table}.${f.name}`;
  const slug = s => String(s || 'seite').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Seite';
  const today = () => new Date().toISOString().slice(0, 10);

  // ------------------------------------------------------------------ Spec
  function buildSpec() {
    const S = MK.state; const c = S.chrome; const d = S.design; const k = MK.ui();
    const z = MK.zones(); const warnings = []; const links = [];
    const fieldOut = f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), isNew: !!f.isNew });
    const pages = S.pages.map((p, pi) => {
      const all = MK.computeAll(p);
      const visuals = all.leaves.filter(l => l.node.visual).map((l, i) => {
        const v = l.node.visual; const def = CAT.byId[v.kind] || { label: v.kind, roles: [], native: null };
        const roles = {}; const vw = [];
        def.roles.forEach(r => { const list = v.roles[r.key] || []; if (list.length) roles[r.key] = list.map(fieldOut); if (r.req && !list.length) vw.push(`Pflichtrolle „${r.label}" ist leer`); });
        if (def.note && /nicht ibcs/i.test(def.note)) vw.push(def.note);
        if (v.engine === 'ck' && !def.ck) vw.push('ChartKitchen kennt diesen Typ nicht; Engine prüfen');
        if (v.engine === 'native' && !def.native) vw.push('Kein natives Power-BI-Visual für diesen Typ; ChartKitchen oder Deneb nötig');
        const native = def.native && (v.engine === 'native' || v.engine === 'ck') ? { type: def.native.type, buckets: bucketsFor(def, v) } : null;
        const id = 'p' + (pi + 1) + '_v' + String(i + 1).padStart(2, '0') + '_' + slug(v.title || def.label);
        const target = v.link ? S.pages.find(x => x.id === v.link) : null;
        if (target) links.push({ fromVisual: id, fromPage: p.name, toPage: target.name, toPageId: target.id, kind: v.kind === 'button' ? 'navigation' : 'drillthrough' });
        return { id, page: p.name, kind: v.kind, label: def.label, engine: v.engine, chartKitchenType: v.engine === 'ck' ? def.ck : null, native, title: v.title || def.label, subtitle: v.sub || '', scenario: def.roles.some(r => r.key === 'ref') ? v.scenario : null, rect: l.rect, roles, notes: v.notes || '', link: target ? { pageId: target.id, pageName: target.name } : null, warnings: vw };
      });
      all.leaves.filter(l => !l.node.visual).forEach(l => warnings.push(`Seite „${p.name}": leere Kachel bei x=${l.rect.x}, y=${l.rect.y} (${l.rect.w}×${l.rect.h})`));
      return { id: p.id, index: pi + 1, name: p.name, notes: p.notes || '', contentRect: all.zones.content, visuals, layoutTree: stripTree(p.layout) };
    });
    const zonesOut = {};
    Object.keys(z).forEach(key => { zonesOut[key] = Object.assign({}, z[key]); });
    const navNames = c.header.navAuto ? S.pages.map(p => p.name) : (c.header.nav || []);
    if (z.header) Object.assign(zonesOut.header, { style: d.header, logoPos: c.header.logoPos, title: c.header.title, subtitle: c.header.sub, nav: navNames, navAuto: !!c.header.navAuto, burger: c.filter.on && c.filter.side === 'burger' });
    if (z.nav) zonesOut.nav.pages = S.pages.map(p => p.name);
    if (z.footer) zonesOut.footer.text = c.footer.text;
    const slicers = (c.filter.fields || []).map(fieldOut);
    if (c.filter.on) {
      const mode = c.filter.side;
      const fl = zonesOut.filter || {};
      Object.assign(fl, { mode, side: mode, collapsible: mode === 'burger' ? true : !!c.filter.collapsible, slicers });
      if (mode === 'burger') Object.assign(fl, { x: S.canvas.w - Math.round(c.filter.w * k), y: z.header ? z.header.h : 0, w: Math.round(c.filter.w * k), h: S.canvas.h - (z.header ? z.header.h : 0) - (z.footer ? z.footer.h : 0), overlay: true, note: 'Panel liegt über dem Inhalt; sichtbar nur im Bookmark „Filter öffnen".' });
      if (mode === 'burger' || c.filter.collapsible) fl.bookmarks = [{ name: 'Filter öffnen', showsPanel: true }, { name: 'Filter schließen', showsPanel: false }];
      zonesOut.filter = fl;
    }
    const used = new Map();
    pages.forEach(p => p.visuals.forEach(v => Object.values(v.roles).forEach(l => l.forEach(f => used.set(f.ref, f)))));
    slicers.forEach(f => used.set(f.ref, f));
    const newFields = S.newFields.map(f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), description: f.desc || '', openQuestion: f.open || '', used: used.has(fieldRef(f)) }));
    return {
      meta: { tool: TOOL, version: VER, specVersion: 2, name: S.name, exportedAt: new Date().toISOString(), skill: 'mockup-to-powerbi' },
      canvas: { width: S.canvas.w, height: S.canvas.h, preset: S.canvas.preset, uiScale: +k.toFixed(3) },
      spacing: { margin: Math.round(S.spacing.margin * k), gutter: Math.round(S.spacing.gutter * k), tilePadding: Math.round(S.spacing.pad * k), base: { margin: S.spacing.margin, gutter: S.spacing.gutter, tilePadding: S.spacing.pad } },
      design: { cornerRadius: Math.round(d.radius * k), tileStyle: d.tile, pageBackground: MK.pageBg[d.pageBg] || '#F4F4F1', tileBackground: '#FFFFFF', headerStyle: d.header, accent: d.accent, darkMode: false, fontScale: +k.toFixed(3) },
      zones: zonesOut,
      pages,
      links,
      model: { source: S.model.source || null, tables: S.model.tables.map(t => t.name), usedFields: Array.from(used.values()) },
      newFields,
      warnings,
    };
  }
  function bucketsFor(def, v) {
    const b = {}; if (!def.native) return b;
    Object.keys(def.native.map).forEach(roleKey => { const bucket = def.native.map[roleKey]; const list = v.roles[roleKey] || []; if (!list.length) return; b[bucket] = (b[bucket] || []).concat(list.map(f => ({ ref: fieldRef(f), kind: f.kind, isNew: !!f.isNew }))); });
    return b;
  }
  function stripTree(n) { return n.type === 'leaf' ? { leaf: n.visual ? (n.visual.title || n.visual.kind) : null } : { split: n.dir, children: n.children.map(c => ({ size: +c.size.toFixed(3), node: stripTree(c.node) })) }; }
  const roleLabel = (kind, key) => { const def = (CAT.byId[kind] || { roles: [] }).roles.find(x => x.key === key); return def ? def.label : key; };
  const r = o => `x=${o.x}, y=${o.y}, w=${o.w}, h=${o.h}`;

  // ------------------------------------------------------------------ Agent-Brief
  function buildBrief(spec) {
    const L = []; const z = spec.zones; const d = spec.design;
    L.push(`# AGENT-BRIEF · ${spec.meta.name}`, '', `Erzeugt von ${spec.meta.tool} ${spec.meta.version} am ${spec.meta.exportedAt.slice(0, 10)}. Maschinenlesbare Fassung: \`mockup-spec.json\` (specVersion 2, mehrseitig). Umsetzung mit dem Skill \`mockup-to-powerbi\` (pbir-CLI, ChartKitchen via Referenz-Instanz).`, '');
    L.push('## Canvas und Gestaltung', '', `- ${spec.pages.length} Seite(n), alle ${spec.canvas.width} × ${spec.canvas.height} px (Typ „Benutzerdefiniert" in Desktop setzen). Skalierung ×${spec.canvas.uiScale} gegenüber HD.`, `- Rand ${spec.spacing.margin} px · Zwischenraum ${spec.spacing.gutter} px · Kachel-Innenabstand ${spec.spacing.tilePadding} px.`, `- Kacheln: Ecken ${d.cornerRadius} px, Stil „${{ border: 'weiß mit feinem Rahmen', shadow: 'weiß mit weichem Schatten', flat: 'flach ohne Rahmen' }[d.tileStyle] || d.tileStyle}", Kachelhintergrund ${d.tileBackground}, Seitenhintergrund ${d.pageBackground}.`, `- Kopfband-Stil „${d.headerStyle}", Akzentfarbe ${d.accent}. Schriften proportional zur Skalierung (Visual-Titel ≈ ${Math.round(12 * spec.canvas.uiScale)} pt).`, `- Alle Koordinaten unten sind absolute Canvas-Pixel (x, y = linke obere Ecke).`);
    L.push('', '## Zonen (Chrome, auf jeder Seite identisch)', '', '| Zone | x | y | w | h | Inhalt |', '|---|---|---|---|---|---|');
    if (z.nav) L.push(`| Nav-Leiste | ${z.nav.x} | ${z.nav.y} | ${z.nav.w} | ${z.nav.h} | Shape Ink-Farbe, ein Icon-Button je Seite (${z.nav.pages.join(' · ')}), aktive Seite Akzent |`);
    if (z.header) L.push(`| Kopfband (${z.header.style}) | ${z.header.x} | ${z.header.y} | ${z.header.w} | ${z.header.h} | ${z.header.style === 'light' ? 'weiße Fläche mit Unterkante, dunkle Schrift' : z.header.style === 'dark' ? 'Shape Ink-Farbe, weiße Schrift' : 'Shape Akzentfarbe, weiße Schrift'}${z.header.logoPos !== 'none' ? `, Logo ${z.header.logoPos === 'right' ? 'rechts' : 'links'} (Höhe ${Math.round(32 * spec.canvas.uiScale)})` : ''}, Titel „${z.header.title}"${z.header.subtitle ? ` · Untertitel „${z.header.subtitle}"` : ''}${z.header.nav && z.header.nav.length ? `, Nav-Buttons: ${z.header.nav.join(' · ')} (Seitennavigation, aktive Seite als deaktivierter Akzent-Button)` : ''}${z.header.burger ? ', Burger-Button links (öffnet Filter-Bookmark)' : ''} |`);
    if (z.filter) L.push(`| Filter (${{ right: 'Panel rechts', left: 'Panel links', top: 'Leiste oben', burger: 'Overlay per Burger-Menü' }[z.filter.mode]}${z.filter.collapsible ? ', per Bookmark ein-/ausblendbar' : ''}) | ${z.filter.x} | ${z.filter.y} | ${z.filter.w} | ${z.filter.h} | Shape 1 Ton dunkler als Seite, Titel „Filter", Slicer ${z.filter.mode === 'top' ? 'nebeneinander' : 'gestapelt'}: ${z.filter.slicers.length ? z.filter.slicers.map(s => `\`${s.ref}\`${s.isNew ? ' (neu)' : ''}`).join(', ') : 'noch keine'}${z.filter.bookmarks ? `; Bookmarks: ${z.filter.bookmarks.map(b => `„${b.name}"`).join(' / ')} (Bookmark ohne Datenzustand, nur Sichtbarkeit)` : ''} |`);
    if (z.footer) L.push(`| Fußleiste | ${z.footer.x} | ${z.footer.y} | ${z.footer.w} | ${z.footer.h} | Textfeld ${Math.round(9 * spec.canvas.uiScale)} pt grau: „${z.footer.text}" |`);
    L.push(`| Inhaltsbereich | ${z.content.x} | ${z.content.y} | ${z.content.w} | ${z.content.h} | alle Visuals liegen exakt hier drin |`);
    spec.pages.forEach(p => {
      L.push('', `## Seite ${p.index} · ${p.name}`, '');
      if (p.notes) L.push(`**Zweck / Notizen:** ${p.notes}`, '');
      if (!p.visuals.length) L.push('_Noch keine Visuals._');
      p.visuals.forEach((v, i) => {
        L.push(`### ${p.index}.${i + 1} ${v.title} \`${v.id}\``, '', `- **Typ:** ${v.label} (\`${v.kind}\`) · **Engine:** ${CAT.engineLabel[v.engine]}${v.chartKitchenType ? ` · ChartKitchen-Typ \`${v.chartKitchenType}\`` : ''}${v.native ? ` · natives Visual \`${v.native.type}\`` : ''}`, `- **Position:** ${r(v.rect)}`);
        if (v.subtitle) L.push(`- **Untertitel / Einheit:** ${v.subtitle}`);
        if (v.scenario) L.push(`- **Szenario:** ${v.scenario}`);
        const roleLines = Object.keys(v.roles).map(key => `  - ${roleLabel(v.kind, key)}: ${v.roles[key].map(f => `\`${f.ref}\`${f.isNew ? ' **(neu anlegen)**' : ''}`).join(', ')}`);
        L.push(roleLines.length ? '- **Datenrollen:**' : '- **Datenrollen:** keine gebunden', ...roleLines);
        if (v.native && Object.keys(v.native.buckets).length) L.push(`- **pbir-Buckets (${v.native.type}):** ` + Object.keys(v.native.buckets).map(b => `${b} ← ${v.native.buckets[b].map(f => f.ref).join(', ')}`).join(' · '));
        if (v.link) L.push(`- **Springt zu:** Seite „${v.link.pageName}" (${v.kind === 'button' ? 'Seitennavigation per Button-Aktion' : 'Drill-through; Zielseite mit Drill-through-Feld aus der Kategorie dieses Visuals'})`);
        if (v.notes) L.push(`- **Notizen:** ${v.notes}`);
        v.warnings.forEach(w => L.push(`- ⚠ ${w}`));
        L.push('');
      });
    });
    if (spec.links.length) { L.push('## Navigation und Drill', '', '| Von (Visual) | Seite | Nach Seite | Art |', '|---|---|---|---|'); spec.links.forEach(l => L.push(`| \`${l.fromVisual}\` | ${l.fromPage} | ${l.toPage} | ${l.kind} |`)); L.push(''); }
    if (spec.newFields.length) {
      L.push('## Neue Kennzahlen / Felder (im Modell anlegen, bevor Visuals gebunden werden)', '', '| Feld | Art | Tabelle | Beschreibung | offene Frage | verwendet |', '|---|---|---|---|---|---|');
      spec.newFields.forEach(f => L.push(`| \`${f.name}\` | ${f.kind === 'measure' ? 'Measure' : 'Spalte'} | ${f.table} | ${f.description || '–'} | ${f.openQuestion || '–'} | ${f.used ? 'ja' : 'nein'} |`));
      L.push('');
    }
    L.push('## Regeln für die Umsetzung', '', '- Positionen und Größen exakt übernehmen; nichts „optisch nachjustieren". Rundungen ±1 px sind ok.', '- Chrome-Zonen auf jeder Seite identisch anlegen (Kopfband, Filter, Fußleiste); Nav-Buttons auf allen Seiten, aktive Seite als deaktivierter Akzent-Button.', '- Kein Visual außerhalb des Inhaltsbereichs, keine Überlappung; Chrome-Zonen bleiben visualfrei.', '- Titel als Visual-Titel setzen (Typ-Label ist nur Fallback). Untertitel → Visual-Untertitel oder Einheit im Titel.', `- Kachel-Container: Ecken ${d.cornerRadius} px, ${d.tileStyle === 'shadow' ? 'weicher Schatten, kein Rahmen' : d.tileStyle === 'flat' ? 'kein Rahmen, kein Schatten' : 'feiner Rahmen, kein Schatten'}, Hintergrund weiß; Seitenhintergrund ${d.pageBackground}.`, '- ChartKitchen-Visuals nur über eine vorhandene Referenz-Instanz replizieren (Skill `chartkitchen-report`), nie visual.json raten. Fehlt die Instanz: Slot als Platzhalter (Shape + Text „ChartKitchen: <Typ>") anlegen und im Bericht vermerken.', '- Native Visuals je Seite mit `pbir add visual "<Report>.Report/<Seite>.Page" --from-json pbir-visuals.<Seite>.json` anlegen, danach `pbir validate --fields`.', '- Neue Felder zuerst im Semantikmodell anlegen (`te`), dann `te validate --errors-only`, erst danach binden.', '- Farben/Schrift kommen aus dem Theme bzw. Design-Framework-Skill; dieser Brief regelt Struktur, Bindung und die Design-Entscheidungen oben.');
    if (spec.warnings.length) { L.push('', '## Offene Punkte aus dem Mockup', ''); spec.warnings.forEach(w => L.push(`- ${w}`)); }
    return L.join('\n');
  }

  // ------------------------------------------------------------------ Workshop-Doku
  function buildDocs(spec) {
    const L = []; const z = spec.zones; const d = spec.design;
    L.push(`# Workshop-Dokumentation · ${spec.meta.name}`, '', `Stand: ${today()} · erstellt mit ${spec.meta.tool} ${spec.meta.version}`, '', '| | |', '|---|---|', '| Teilnehmende | [ausfüllen] |', '| Ziel des Berichts | [ausfüllen] |', '| Zielgruppe | [ausfüllen] |', `| Seiten | ${spec.pages.map(p => p.name).join(' · ')} |`, `| Datenmodell | ${spec.model.source || 'noch nicht angebunden'} (${spec.model.tables.length} Tabellen) |`, '');
    L.push('## Entscheidungen zur Gestaltung', '', `- Format ${spec.canvas.width} × ${spec.canvas.height} px${spec.canvas.preset && spec.canvas.preset !== 'custom' ? ` (${{ '1280x720': 'HD', '1920x1080': 'Full HD', '3840x2160': 'Ultra HD' }[spec.canvas.preset] || spec.canvas.preset})` : ''}.`, `- Kopfband ${z.header ? `„${z.header.title}"${z.header.subtitle ? ` · ${z.header.subtitle}` : ''}, Stil ${z.header.style}, Logo ${z.header.logoPos === 'none' ? 'ohne' : z.header.logoPos === 'right' ? 'rechts' : 'links'}` : 'ohne'}.`, `- Filter ${z.filter ? { right: 'als Panel rechts', left: 'als Panel links', top: 'als Leiste oben', burger: 'als Burger-Menü (Bookmark)' }[z.filter.mode] + (z.filter.slicers.length ? `: ${z.filter.slicers.map(s => s.name).join(', ')}` : ', noch ohne Felder') : 'keine'}.`, `- Fußleiste ${z.footer ? `„${z.footer.text}"` : 'ohne'}.`, `- Kacheln ${d.cornerRadius ? `gerundet (${d.cornerRadius} px)` : 'eckig'}, ${{ border: 'mit feinem Rahmen', shadow: 'mit weichem Schatten', flat: 'flach' }[d.tileStyle]}, Seitenhintergrund ${d.pageBackground}, Akzent ${d.accent}.`, '');
    spec.pages.forEach(p => {
      L.push(`## Seite ${p.index} · ${p.name}`, '');
      L.push(p.notes ? `**Zweck:** ${p.notes}` : '**Zweck:** [ausfüllen]', '');
      if (p.visuals.length) {
        L.push('| # | Kachel | Darstellung | Felder | Notizen |', '|---|---|---|---|---|');
        p.visuals.forEach((v, i) => {
          const fields = Object.keys(v.roles).map(key => `${roleLabel(v.kind, key)}: ${v.roles[key].map(f => f.name + (f.isNew ? ' (neu)' : '')).join(', ')}`).join('; ') || '–';
          L.push(`| ${p.index}.${i + 1} | ${v.title}${v.subtitle ? ` (${v.subtitle})` : ''} | ${v.label}${v.scenario ? `, ${v.scenario}` : ''}${v.engine === 'ck' ? ', ChartKitchen' : ''} | ${fields} | ${[v.notes, v.link ? `→ ${v.link.pageName}` : ''].filter(Boolean).join(' · ') || '–'} |`);
        });
      } else L.push('_Noch keine Kacheln._');
      L.push('');
    });
    if (spec.links.length) { L.push('## Navigation und Drill-Wege', ''); spec.links.forEach(l => L.push(`- Von „${l.fromPage}" (${l.fromVisual}) nach „${l.toPage}" (${l.kind === 'navigation' ? 'Seitenwechsel' : 'Drill-through'})`)); L.push(''); }
    L.push('## Kennzahlen und Felder', '');
    const usedRefs = spec.model.usedFields.filter(f => !f.isNew);
    L.push(usedRefs.length ? `Verwendet aus dem Modell: ${usedRefs.map(f => `\`${f.ref}\``).join(', ')}` : 'Noch keine Modellfelder gebunden.', '');
    if (spec.newFields.length) { L.push('### Neu zu erstellen', '', '| Feld | Art | Tabelle | Beschreibung / Logik | Offene Frage |', '|---|---|---|---|---|'); spec.newFields.forEach(f => L.push(`| ${f.name} | ${f.kind === 'measure' ? 'Kennzahl' : 'Dimension'} | ${f.table} | ${f.description || '[ausfüllen]'} | ${f.openQuestion || '–'} |`)); L.push(''); }
    const open = [];
    spec.newFields.forEach(f => { if (f.openQuestion) open.push(`${f.name}: ${f.openQuestion}`); });
    spec.pages.forEach(p => p.visuals.forEach(v => { if (/\?/.test(v.notes || '')) open.push(`${p.name} / ${v.title}: ${v.notes}`); v.warnings.filter(w => w.startsWith('Pflichtrolle')).forEach(w => open.push(`${p.name} / ${v.title}: ${w}`)); }));
    spec.warnings.forEach(w => open.push(w));
    L.push('## Offene Punkte', '', ...(open.length ? open.map(o => `- [ ] ${o}`) : ['- [ ] keine offenen Punkte erfasst']), '');
    L.push('## Nächste Schritte', '', '- [ ] Fehlende Kennzahlen im Semantikmodell anlegen (siehe oben)', '- [ ] Seiten mit dem Skill `mockup-to-powerbi` ins PBIP übertragen', '- [ ] Review der gebauten Seiten mit den Teilnehmenden', '');
    return L.join('\n');
  }

  // ------------------------------------------------------------------ pbir-visuals je Seite (nur native Visuals + Slicer)
  function buildPbir(spec, pageId) {
    const p = spec.pages.find(x => x.id === pageId) || spec.pages[0]; const out = [];
    p.visuals.forEach(v => {
      if (v.engine !== 'native' || !v.native) return;
      const fields = {}; Object.keys(v.native.buckets).forEach(b => { const refs = v.native.buckets[b].map(f => f.ref); fields[b] = refs.length === 1 ? refs[0] : refs; });
      const item = { visual_type: v.native.type, name: v.id, title: v.title, x: v.rect.x, y: v.rect.y, width: v.rect.w, height: v.rect.h };
      if (Object.keys(fields).length) item.fields = fields;
      out.push(item);
    });
    const z = spec.zones.filter;
    if (z) z.slicers.forEach((s, i) => {
      const k = spec.canvas.uiScale; const pad = Math.round(8 * k);
      const item = { visual_type: 'slicer', name: 'p' + p.index + '_slicer' + (i + 1) + '_' + slug(s.name), title: s.name, fields: { Values: s.ref } };
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
    return [`Lies mockup-spec.json, AGENT-BRIEF.md und WORKSHOP-DOKU.md im Projektordner und nutze den Skill mockup-to-powerbi, um den Bericht „${spec.meta.name}" (${spec.pages.length} Seite(n): ${spec.pages.map(p => p.name).join(', ')}; ${spec.canvas.width}×${spec.canvas.height}) in mein PBIP-Projekt zu übertragen.`, '', `Umfang: ${all.length} Visuals (${ck} ChartKitchen, ${nat} nativ, ${dn} Deneb)${spec.zones.filter ? `, ${spec.zones.filter.slicers.length} Slicer (${spec.zones.filter.mode})` : ''}${spec.links.length ? `, ${spec.links.length} Drill-/Navigationsverknüpfung(en)` : ''}${spec.newFields.length ? `, ${spec.newFields.length} neue Felder im Modell` : ''}.`, '', 'Vorgehen: erst Plan zeigen (Seiten, Dateien, Modelländerungen), dann Backup/Commit, dann je Seite Chrome-Zonen, native Visuals per pbir-visuals.<Seite>.json, ChartKitchen-Slots über die Referenz-Instanz, Navigation/Drill laut Brief. Am Ende pbir validate --fields und te validate --errors-only laufen lassen und mir die offenen Punkte aus der Workshop-Doku auflisten. Danach bitte die Workshop-Doku als PowerPoint aufbereiten (Skill-Schritt „Doku").'].join('\n');
  }

  // ------------------------------------------------------------------ Dialog
  let cur = 'json', spec = null;
  const texts = () => ({ json: JSON.stringify(spec, null, 2), brief: buildBrief(spec), docs: buildDocs(spec), pbir: JSON.stringify(buildPbir(spec, MK.page().id), null, 2), prompt: buildPrompt(spec) });
  const fileNames = () => ({ json: 'mockup-spec.json', brief: 'AGENT-BRIEF.md', docs: 'WORKSHOP-DOKU.md', pbir: pbirName(MK.page()), prompt: 'claude-prompt.txt' });
  function openExport() {
    spec = buildSpec(); const checks = []; const all = spec.pages.flatMap(p => p.visuals);
    const req = all.reduce((a, v) => a + v.warnings.filter(w => w.startsWith('Pflichtrolle')).length, 0);
    if (!all.length) checks.push(['warn', 'Noch kein Visual auf den Seiten.']);
    if (req) checks.push(['warn', `${req} Pflicht-Datenrolle(n) noch leer. Export geht trotzdem, die Stellen sind im Brief und in der Doku markiert.`]);
    if (spec.warnings.length) checks.push(['warn', spec.warnings.length + ' leere Kachel(n) im Layout.']);
    if (spec.newFields.some(f => f.used)) checks.push(['ok', `${spec.newFields.filter(f => f.used).length} neue Kennzahl(en) werden als Modell-To-do übergeben.`]);
    if (!checks.length) checks.push(['ok', `Bereit: ${spec.pages.length} Seite(n), ${all.length} Visuals, alle Pflichtrollen gebunden.`]);
    $('#expChecks').innerHTML = checks.map(([k, t]) => `<div class="${k}">${t}</div>`).join('');
    showExp(cur); $('#dlgExport').showModal();
  }
  function showExp(k) {
    cur = k; $$('#expTabs button').forEach(b => b.classList.toggle('on', b.dataset.exp === k));
    $('#expOut').textContent = texts()[k];
    $('#expHint').textContent = { json: 'Vollständige Spec: Design, Zonen, Seiten mit Visuals (Rechtecke + Feldbindungen), Verknüpfungen, neue Felder.', brief: 'Für Menschen und Agenten lesbar; Format wie AGENT-BRIEF des Design-Framework-Skills.', docs: 'Workshop-Protokoll: Entscheidungen, Seiten, Felder, offene Punkte. Der Skill macht daraus auch eine PowerPoint.', pbir: `Nur native Visuals + Slicer der Seite „${MK.page().name}". Verwenden: pbir add visual "Report.Report/${MK.page().name}.Page" --from-json ${pbirName(MK.page())}`, prompt: 'In Claude Code einfügen, nachdem die Dateien im PBIP-Ordner liegen.' }[k];
  }
  $('#btnExport').onclick = openExport;
  $('#expTabs').addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (b) showExp(b.dataset.exp); });
  $('#btnExpCopy').onclick = () => navigator.clipboard.writeText(texts()[cur]).then(() => MK.toast(fileNames()[cur] + ' kopiert'));
  $('#btnExpDownload').onclick = () => download(fileNames()[cur], texts()[cur]);
  $('#btnExpAll').onclick = () => {
    const t = texts(); const files = [['mockup-spec.json', t.json], ['AGENT-BRIEF.md', t.brief], ['WORKSHOP-DOKU.md', t.docs]];
    spec.pages.forEach(p => files.push([pbirName(p), JSON.stringify(buildPbir(spec, p.id), null, 2)]));
    files.forEach(([n, txt], i) => setTimeout(() => download(n, txt), i * 350));
  };
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ------------------------------------------------------------------ Speichern / Öffnen
  $('#btnSave').onclick = () => { const S = MK.state; download(slug(S.name) + '.mockup.json', JSON.stringify(S, null, 2)); MK.toast('Mockup gespeichert'); };
  $('#btnOpen').onclick = () => $('#fileOpen').click();
  $('#fileOpen').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { try { const s = JSON.parse(t); if (!(s.pages || s.layout) || !s.canvas) throw new Error('kein Mockup'); MK.state = s; MK.toast('„' + (s.name || f.name) + '" geladen'); } catch (err) { MK.toast('Datei ist kein MockupKitchen-Mockup'); } e.target.value = ''; });
  });

  window.MK_EXPORT = { buildSpec, buildBrief, buildDocs, buildPbir, buildPrompt, pbirName };
})();
