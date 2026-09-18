/* MockupKitchen · Export: mockup-spec.json, AGENT-BRIEF.md, pbir-visuals.json, Prompt · Speichern/Öffnen */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const MK = window.MK, CAT = window.MK_CATALOG;
  const TOOL = 'MockupKitchen byDatenWG', VER = '0.1';
  const fieldRef = f => `${f.table}.${f.name}`;
  const slug = s => String(s || 'seite').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'Seite';

  // ------------------------------------------------------------------ Spec
  function buildSpec() {
    const S = MK.state; const all = MK.computeAll(); const z = all.zones; const c = S.chrome;
    const warnings = [];
    const visuals = all.leaves.filter(l => l.node.visual).map((l, i) => {
      const v = l.node.visual; const def = CAT.byId[v.kind] || { label: v.kind, roles: [], native: null };
      const roles = {}; const vw = [];
      def.roles.forEach(r => {
        const list = v.roles[r.key] || [];
        if (list.length) roles[r.key] = list.map(f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), isNew: !!f.isNew }));
        if (r.req && !list.length) vw.push(`Pflichtrolle „${r.label}" ist leer`);
      });
      if (def.note && /nicht ibcs/i.test(def.note)) vw.push(def.note);
      if (v.engine === 'ck' && !def.ck) vw.push('ChartKitchen kennt diesen Typ nicht; Engine prüfen');
      if (v.engine === 'native' && !def.native) vw.push('Kein natives Power-BI-Visual für diesen Typ; ChartKitchen oder Deneb nötig');
      const native = def.native && (v.engine === 'native' || v.engine === 'ck') ? { type: def.native.type, buckets: bucketsFor(def, v) } : null;
      const id = 'v' + String(i + 1).padStart(2, '0') + '_' + slug(v.title || def.label);
      return { id, kind: v.kind, label: def.label, engine: v.engine, chartKitchenType: v.engine === 'ck' ? def.ck : null, native, title: v.title || def.label, subtitle: v.sub || '', scenario: def.roles.some(r => r.key === 'ref') ? v.scenario : null, rect: l.rect, roles, notes: v.notes || '', warnings: vw };
    });
    all.leaves.filter(l => !l.node.visual).forEach(l => warnings.push(`Leere Kachel bei x=${l.rect.x}, y=${l.rect.y} (${l.rect.w}×${l.rect.h})`));
    const zonesOut = {};
    Object.keys(z).forEach(k => { zonesOut[k] = Object.assign({}, z[k]); });
    if (z.header) Object.assign(zonesOut.header, { logo: c.header.logo, title: c.header.title, subtitle: c.header.sub, nav: c.header.nav });
    if (z.footer) zonesOut.footer.text = c.footer.text;
    if (z.filter) Object.assign(zonesOut.filter, { side: c.filter.side, collapsible: c.filter.collapsible, slicers: (c.filter.fields || []).map(f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), isNew: !!f.isNew })) });
    const used = new Map();
    visuals.forEach(v => Object.values(v.roles).forEach(l => l.forEach(f => used.set(f.ref, f))));
    (zonesOut.filter ? zonesOut.filter.slicers : []).forEach(f => used.set(f.ref, f));
    const newFields = S.newFields.map(f => ({ table: f.table, name: f.name, kind: f.kind, ref: fieldRef(f), description: f.desc || '', used: used.has(fieldRef(f)) }));
    return {
      meta: { tool: TOOL, version: VER, name: S.name, exportedAt: new Date().toISOString(), skill: 'mockup-to-powerbi' },
      page: { name: S.pageName || S.name, notes: S.notes || '' },
      canvas: { width: S.canvas.w, height: S.canvas.h },
      spacing: { margin: S.spacing.margin, gutter: S.spacing.gutter, tilePadding: S.spacing.pad },
      zones: zonesOut,
      visuals,
      model: { source: S.model.source || null, tables: S.model.tables.map(t => t.name), usedFields: Array.from(used.values()) },
      newFields,
      layoutTree: stripTree(S.layout),
      warnings,
    };
  }
  function bucketsFor(def, v) {
    const b = {};
    if (!def.native) return b;
    Object.keys(def.native.map).forEach(roleKey => {
      const bucket = def.native.map[roleKey]; const list = v.roles[roleKey] || [];
      if (!list.length) return;
      b[bucket] = (b[bucket] || []).concat(list.map(f => ({ ref: fieldRef(f), kind: f.kind, isNew: !!f.isNew })));
    });
    return b;
  }
  function stripTree(n) { return n.type === 'leaf' ? { leaf: n.visual ? (n.visual.title || n.visual.kind) : null } : { split: n.dir, children: n.children.map(c => ({ size: +c.size.toFixed(3), node: stripTree(c.node) })) }; }

  // ------------------------------------------------------------------ Agent-Brief
  function buildBrief(spec) {
    const L = [];
    const z = spec.zones; const r = o => `x=${o.x}, y=${o.y}, w=${o.w}, h=${o.h}`;
    L.push(`# AGENT-BRIEF · ${spec.meta.name}`, '', `Erzeugt von ${spec.meta.tool} ${spec.meta.version} am ${spec.meta.exportedAt.slice(0, 10)}. Maschinenlesbare Fassung: \`mockup-spec.json\`. Umsetzung mit dem Skill \`mockup-to-powerbi\` (pbir-CLI, ChartKitchen via Referenz-Instanz).`, '');
    L.push('## Canvas', '', `- Seite **${spec.page.name}**: ${spec.canvas.width} × ${spec.canvas.height} px (Typ „Benutzerdefiniert" in Desktop setzen).`, `- Rand ${spec.spacing.margin} px · Zwischenraum ${spec.spacing.gutter} px · Kachel-Innenabstand ${spec.spacing.tilePadding} px.`, `- Alle Koordinaten unten sind absolute Canvas-Pixel (x, y = linke obere Ecke).`);
    if (spec.page.notes) L.push('', `**Seiten-Notizen:** ${spec.page.notes}`);
    L.push('', '## Zonen (Chrome)', '', '| Zone | x | y | w | h | Inhalt |', '|---|---|---|---|---|---|');
    if (z.nav) L.push(`| Nav-Leiste | ${z.nav.x} | ${z.nav.y} | ${z.nav.w} | ${z.nav.h} | Shape Ink-Farbe, Icon-Buttons je Seite, aktive Seite Akzent |`);
    if (z.header) L.push(`| Kopfband | ${z.header.x} | ${z.header.y} | ${z.header.w} | ${z.header.h} | Shape Ink-Farbe${z.header.logo ? ', Logo links (Höhe 32)' : ''}, Titel „${z.header.title}"${z.header.subtitle ? ` · Untertitel „${z.header.subtitle}"` : ''}${z.header.nav && z.header.nav.length ? `, Nav-Buttons rechts: ${z.header.nav.join(' · ')}` : ''} |`);
    if (z.filter) L.push(`| Filter-Panel (${z.filter.side === 'right' ? 'rechts' : 'links'}${z.filter.collapsible ? ', ausklappbar per Bookmark' : ''}) | ${z.filter.x} | ${z.filter.y} | ${z.filter.w} | ${z.filter.h} | Shape 1 Ton dunkler als Seite, Titel „Filter", Slicer gestapelt: ${z.filter.slicers.length ? z.filter.slicers.map(s => `\`${s.ref}\`${s.isNew ? ' (neu)' : ''}`).join(', ') : 'noch keine'} |`);
    if (z.footer) L.push(`| Fußleiste | ${z.footer.x} | ${z.footer.y} | ${z.footer.w} | ${z.footer.h} | Textfeld 8–9 pt grau: „${z.footer.text}" |`);
    L.push(`| Inhaltsbereich | ${z.content.x} | ${z.content.y} | ${z.content.w} | ${z.content.h} | alle Visuals unten liegen exakt hier drin |`);
    L.push('', '## Visuals (Kachel-Slots)', '');
    spec.visuals.forEach((v, i) => {
      L.push(`### ${i + 1}. ${v.title} \`${v.id}\``, '', `- **Typ:** ${v.label} (\`${v.kind}\`) · **Engine:** ${CAT.engineLabel[v.engine]}${v.chartKitchenType ? ` · ChartKitchen-Typ \`${v.chartKitchenType}\`` : ''}${v.native ? ` · natives Visual \`${v.native.type}\`` : ''}`, `- **Position:** ${r(v.rect)}`);
      if (v.subtitle) L.push(`- **Untertitel / Einheit:** ${v.subtitle}`);
      if (v.scenario) L.push(`- **Szenario:** ${v.scenario}`);
      const roleLines = Object.keys(v.roles).map(k => { const def = (CAT.byId[v.kind] || { roles: [] }).roles.find(x => x.key === k); return `  - ${def ? def.label : k}: ${v.roles[k].map(f => `\`${f.ref}\`${f.isNew ? ' **(neu anlegen)**' : ''}`).join(', ')}`; });
      L.push(roleLines.length ? '- **Datenrollen:**' : '- **Datenrollen:** keine gebunden', ...roleLines);
      if (v.native && Object.keys(v.native.buckets).length) L.push(`- **pbir-Buckets (${v.native.type}):** ` + Object.keys(v.native.buckets).map(b => `${b} ← ${v.native.buckets[b].map(f => f.ref).join(', ')}`).join(' · '));
      if (v.notes) L.push(`- **Notizen:** ${v.notes}`);
      v.warnings.forEach(w => L.push(`- ⚠ ${w}`));
      L.push('');
    });
    if (spec.newFields.length) {
      L.push('## Neue Kennzahlen / Felder (im Modell anlegen, bevor Visuals gebunden werden)', '', '| Feld | Art | Tabelle | Beschreibung | verwendet |', '|---|---|---|---|---|');
      spec.newFields.forEach(f => L.push(`| \`${f.name}\` | ${f.kind === 'measure' ? 'Measure' : 'Spalte'} | ${f.table} | ${f.description || '–'} | ${f.used ? 'ja' : 'nein'} |`));
      L.push('');
    }
    L.push('## Regeln für die Umsetzung', '', '- Positionen und Größen exakt übernehmen; nichts „optisch nachjustieren". Rundungen ±1 px sind ok.', '- Kein Visual außerhalb des Inhaltsbereichs, keine Überlappung; Chrome-Zonen bleiben visualfrei.', '- Titel als Visual-Titel setzen (Typ-Label ist nur Fallback). Untertitel → Visual-Untertitel oder Einheit im Titel.', '- ChartKitchen-Visuals nur über eine vorhandene Referenz-Instanz replizieren (Skill `chartkitchen-report`), nie visual.json raten. Fehlt die Instanz: Slot als Platzhalter (Shape + Text „ChartKitchen: <Typ>") anlegen und im Bericht vermerken.', '- Native Visuals mit `pbir add visual --from-json pbir-visuals.json` anlegen, danach `pbir validate --fields`.', '- Neue Felder zuerst im Semantikmodell anlegen (`te`), dann `te validate --errors-only`, erst danach binden.', '- Farben/Schrift kommen aus dem Theme bzw. Design-Framework-Skill; dieser Brief regelt nur Struktur und Bindung.');
    if (spec.warnings.length) { L.push('', '## Offene Punkte aus dem Mockup', ''); spec.warnings.forEach(w => L.push(`- ${w}`)); }
    return L.join('\n');
  }

  // ------------------------------------------------------------------ pbir-visuals.json (nur native Visuals)
  function buildPbir(spec) {
    const out = [];
    spec.visuals.forEach(v => {
      if (v.engine !== 'native' || !v.native) return;
      const fields = {};
      Object.keys(v.native.buckets).forEach(b => { const refs = v.native.buckets[b].map(f => f.ref); fields[b] = refs.length === 1 ? refs[0] : refs; });
      const item = { visual_type: v.native.type, name: v.id, title: v.title, x: v.rect.x, y: v.rect.y, width: v.rect.w, height: v.rect.h };
      if (Object.keys(fields).length) item.fields = fields;
      out.push(item);
    });
    if (spec.zones.filter) spec.zones.filter.slicers.forEach((s, i) => {
      const z = spec.zones.filter; const y = z.y + 40 + i * 64;
      out.push({ visual_type: 'slicer', name: 'slicer' + (i + 1) + '_' + slug(s.name), title: s.name, x: z.x + 8, y, width: z.w - 16, height: 56, fields: { Values: s.ref } });
    });
    return out;
  }

  // ------------------------------------------------------------------ Prompt
  function buildPrompt(spec) {
    const ck = spec.visuals.filter(v => v.engine === 'ck').length, nat = spec.visuals.filter(v => v.engine === 'native').length, dn = spec.visuals.filter(v => v.engine === 'deneb').length;
    return [`Lies mockup-spec.json und AGENT-BRIEF.md im Projektordner und nutze den Skill mockup-to-powerbi, um die Seite „${spec.page.name}" (${spec.canvas.width}×${spec.canvas.height}) in mein PBIP-Projekt zu übertragen.`, '', `Umfang: ${spec.visuals.length} Visuals (${ck} ChartKitchen, ${nat} nativ, ${dn} Deneb)${spec.zones.filter ? `, ${spec.zones.filter.slicers.length} Slicer im Filter-Panel` : ''}${spec.newFields.length ? `, ${spec.newFields.length} neue Felder im Modell` : ''}.`, '', 'Vorgehen: erst Plan zeigen (welche Dateien du anlegst, was du am Modell änderst), dann Backup/Commit, dann native Visuals per pbir-visuals.json anlegen, ChartKitchen-Visuals über die Referenz-Instanz replizieren, Chrome-Zonen als Shapes/Textfelder setzen. Am Ende pbir validate --fields und te validate --errors-only laufen lassen und mir die offenen Punkte aus dem Brief auflisten.'].join('\n');
  }

  // ------------------------------------------------------------------ Dialog
  let cur = 'json', spec = null;
  const texts = () => ({ json: JSON.stringify(spec, null, 2), brief: buildBrief(spec), pbir: JSON.stringify(buildPbir(spec), null, 2), prompt: buildPrompt(spec) });
  const fileNames = { json: 'mockup-spec.json', brief: 'AGENT-BRIEF.md', pbir: 'pbir-visuals.json', prompt: 'claude-prompt.txt' };
  function openExport() {
    spec = buildSpec();
    const checks = [];
    const req = spec.visuals.reduce((a, v) => a + v.warnings.filter(w => w.startsWith('Pflichtrolle')).length, 0);
    if (!spec.visuals.length) checks.push(['warn', 'Noch kein Visual auf der Seite.']);
    if (req) checks.push(['warn', `${req} Pflicht-Datenrolle(n) noch leer. Export geht trotzdem, die Stellen sind im Brief markiert.`]);
    if (spec.warnings.length) checks.push(['warn', spec.warnings.length + ' leere Kachel(n) im Layout.']);
    if (spec.newFields.some(f => f.used)) checks.push(['ok', `${spec.newFields.filter(f => f.used).length} neue Kennzahl(en) werden als Modell-To-do übergeben.`]);
    if (!checks.length) checks.push(['ok', `Bereit: ${spec.visuals.length} Visuals, alle Pflichtrollen gebunden.`]);
    $('#expChecks').innerHTML = checks.map(([k, t]) => `<div class="${k}">${t}</div>`).join('');
    showExp(cur); $('#dlgExport').showModal();
  }
  function showExp(k) {
    cur = k; $$('#expTabs button').forEach(b => b.classList.toggle('on', b.dataset.exp === k));
    $('#expOut').textContent = texts()[k];
    $('#expHint').textContent = { json: 'Vollständige Spec: Zonen, Visuals mit Rechtecken und Feldbindungen, neue Felder, Layout-Baum.', brief: 'Für Menschen und Agenten lesbar; Format wie AGENT-BRIEF des Design-Framework-Skills.', pbir: 'Nur native Visuals + Slicer. Verwenden: pbir add visual "Report.Report/Seite.Page" --from-json pbir-visuals.json', prompt: 'In Claude Code einfügen, nachdem die Dateien im PBIP-Ordner liegen.' }[k];
  }
  $('#btnExport').onclick = openExport;
  $('#expTabs').addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (b) showExp(b.dataset.exp); });
  $('#btnExpCopy').onclick = () => navigator.clipboard.writeText(texts()[cur]).then(() => MK.toast(fileNames[cur] + ' kopiert'));
  $('#btnExpDownload').onclick = () => download(fileNames[cur], texts()[cur]);
  $('#btnExpAll').onclick = () => { const t = texts(); ['json', 'brief', 'pbir'].forEach((k, i) => setTimeout(() => download(fileNames[k], t[k]), i * 350)); };
  function download(name, text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ------------------------------------------------------------------ Speichern / Öffnen
  $('#btnSave').onclick = () => { const S = MK.state; download(slug(S.name) + '.mockup.json', JSON.stringify(S, null, 2)); MK.toast('Mockup gespeichert'); };
  $('#btnOpen').onclick = () => $('#fileOpen').click();
  $('#fileOpen').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { try { const s = JSON.parse(t); if (!s.layout || !s.canvas) throw new Error('kein Mockup'); MK.state = s; MK.toast('„' + (s.name || f.name) + '" geladen'); } catch (err) { MK.toast('Datei ist kein MockupKitchen-Mockup'); } e.target.value = ''; });
  });

  window.MK_EXPORT = { buildSpec, buildBrief, buildPbir, buildPrompt };
})();
