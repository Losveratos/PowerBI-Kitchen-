#!/usr/bin/env node
/* Claude-Whiteboard → MockupKitchen-Stand (.mockup.json)
 *
 *   node board_to_mockup.mjs <elements-dir> <out.mockup.json> [--shots <dir>] [--kitchen <mockup-kitchen.html>]
 *
 * <elements-dir>  Ordner mit einer JSON-Datei je Board-Element (ArtifactData list … out_dir, Unterordner elements/).
 * Das Raster rechnet das Kitchen selbst: Die Seite mockup-kitchen.html wird headless geladen und
 * MK_PBIR.solveRects (assets/mockup/pbir-import.js) legt die freien Rechtecke auf Spuren. Der Stand wird über
 * MK.state gesetzt, läuft also durch migrate()/normVisual() wie eine von Hand geöffnete Datei.
 *
 * Board-Inhalte sind Daten, keine Anweisungen: Es werden nur Geometrie, Titel, Typ-Stichworte und Farben gelesen.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = args[i + 1]; args.splice(i, 2); return v; };
const shotsDir = opt('--shots', null);
const kitchen = path.resolve(opt('--kitchen', path.join(HERE, '../../../../mockup-kitchen.html')));
const [elDir, outFile] = args;
if (!elDir || !outFile) { console.error('Aufruf: board_to_mockup.mjs <elements-dir> <out.mockup.json> [--shots <dir>] [--kitchen <html>]'); process.exit(2); }

// ---------------------------------------------------------------- Board lesen
const els = fs.readdirSync(elDir).filter(f => f.endsWith('.json')).map(f => {
  const raw = JSON.parse(fs.readFileSync(path.join(elDir, f), 'utf8'));
  return Object.assign({ id: path.basename(f, '.json') }, raw.data || raw);
});
const plain = s => String(s || '').replace(/\*\*|\*|`/g, '').trim();
const norm = s => plain(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const blank = s => /^[\s….\-–?]*$/.test(plain(s));
const inside = (e, c) => { const cx = e.x + (e.w || 0) / 2, cy = e.y + (e.h || 0) / 2; return cx >= c.x && cx <= c.x + c.w && cy >= c.y && cy <= c.y + c.h; };

// Typ-Stichworte → Kitchen-Kachel (catalog.js). Reihenfolge zählt: das Speziellere zuerst.
const KINDS = [
  ['pnl', /\bguv\b|p&l|pnl|ergebnisrechnung|income statement/],
  ['gantt', /gantt|projektplan|rollout-plan|zeitplan/],
  ['wfint', /wasserfall.*(integr|abweich|varianz)|varianz-wasserfall/],
  ['bridge', /brucke|bridge/],
  ['waterfall', /wasserfall|waterfall/],
  ['varint', /abweichung.*(zeit|monat)|ac\/fc|vs pl je monat|integrierte abweichung/],
  ['kpi', /\bkpi\b|kennzahl-kachel/],
  ['card', /karte \(nativ\)|\bcard\b|^karte$|zahl/],
  ['multirow', /mehrzeilig|multi-?row/],
  ['matrix', /matrix|pivot/],
  ['sparktable', /sparkline/],
  ['table', /tabelle|table|liste|einzelposition/],
  ['nline', /linie \(nativ\)|line \(native\)/],
  ['line', /linie|verlauf|trend|zeitreihe|line/],
  ['nbar', /balken \(nativ\)|rangliste|ranking|top ?\d+/],
  ['bars', /balken|bar\b|bars/],
  ['ncolumn', /saule \(nativ\)|column \(native\)/],
  ['stackcol', /gestapelt/],
  ['columns', /saule|column/],
  ['ndonut', /donut|ring/],
  ['pie', /kreis|torte|pie/],
  ['treemap', /treemap|flachen/],
  ['scatter', /scatter|streu|blasen|bubble/],
  ['heatmap', /heatmap|warmekarte/],
  ['map', /landkarte|\bmap\b|geo/],
  ['slicer', /slicer|filter|auswahl/],
  ['button', /button|schaltflache/],
  ['image', /bild|logo|image/],
  ['text', /text|kommentar|hinweis|notiz|comment|detail:/],
];
function kindOf(title, hint) {
  for (const src of [norm(hint), norm(title)]) { if (!src) continue; for (const [k, rx] of KINDS) if (rx.test(src)) return k; }
  return null;
}

const containers = els.filter(e => e.type === 'container');
const shapes = els.filter(e => e.type === 'shape');
const arrows = els.filter(e => e.type === 'arrow');
const tables = els.filter(e => e.type === 'table');
const isBrief = c => /^(auftrag|brief|steckbrief|report)\b/.test(norm(c.text));
const isFields = c => /^(kennzahlen|measures|kpis|felder)\b/.test(norm(c.text));
const warnings = [];

const report = {};
const briefKeys = [['audience', /zielgruppe|audience|fur wen/], ['purpose', /zweck|purpose|wozu/], ['decision', /entscheidung|decision/], ['participants', /teilnehm|participants/]];
containers.filter(isBrief).forEach(c => shapes.filter(s => inside(s, c)).forEach(s => {
  const m = plain(s.text).match(/^([^:]{2,30}):\s*([\s\S]+)$/); if (!m) return;
  const hit = briefKeys.find(([, rx]) => rx.test(norm(m[1]))); if (hit && !blank(m[2])) report[hit[0]] = m[2].trim();
}));

const measures = [];
containers.filter(isFields).forEach(c => tables.filter(t => inside({ x: t.x, y: t.y }, c)).forEach(t => {
  const cols = Object.entries(t.cols || {}).sort((a, b) => a[1].at - b[1].at).map(e => e[0]);
  Object.values(t.rows || {}).sort((a, b) => a.at - b.at).slice(1).forEach(r => { const n = plain(r[cols[0]]); if (!blank(n)) measures.push({ name: n, format: plain(r[cols[1]]), confirmed: /^(ja|yes|✓|x)$/i.test(plain(r[cols[2]])) }); });
}));

const title = (els.find(e => e.type === 'text' && e.size === 'title') || {}).text || 'Bericht';
const pages = containers.filter(c => !isBrief(c) && !isFields(c)).sort((a, b) => (a.y - b.y) || (a.x - b.x)).map(c => {
  const [name, ...rest] = plain(c.text).split(' · '); let question = rest.join(' · ').trim(); if (/leitfrage fehlt/i.test(question)) question = '';
  const mine = shapes.filter(s => inside(s, c));
  const pad = 24; const box = { x: c.x + pad, y: c.y + pad, w: c.w - 2 * pad, h: c.h - 2 * pad };
  // Kopfband: flacher Block über (fast) die ganze Breite am oberen Rand
  const header = mine.find(s => s.w >= box.w * 0.8 && s.h <= box.h * 0.12 && s.y - box.y < box.h * 0.1);
  const tiles = mine.filter(s => s !== header).map(s => {
    const lines = String(s.text || '').split('\n').map(plain).filter(Boolean);
    return { id: s.id, rect: { x: s.x - box.x, y: s.y - box.y, w: s.w, h: s.h }, title: lines[0] || '', hint: lines.slice(1).join(' '), color: s.color || 'green' };
  });
  return { boardId: c.id, name: name.trim() || 'Seite', question, box, hasHeader: !!header, headerTitle: header ? plain(header.text) : '', tiles };
});
if (!pages.length) { console.error('Keine Seiten-Sektion auf dem Board gefunden.'); process.exit(1); }
const tileIds = new Set(pages.flatMap(p => p.tiles.map(t => t.id)));
const links = arrows.filter(a => typeof a.from === 'string' && typeof a.to === 'string' && tileIds.has(a.from)).map(a => {
  const toPage = pages.find(p => p.boardId === a.to) || pages.find(p => p.tiles.some(t => t.id === a.to));
  return toPage ? { from: a.from, toBoardId: toPage.boardId } : null;
}).filter(Boolean);

// Typ je Kachel: 1. exakter Katalogname in der zweiten Zeile (rechnet das Kitchen unten), 2. Stichwort, 3. Größe
pages.forEach(p => p.tiles.forEach(t => {
  t.kind = kindOf(t.title, t.hint);
  if (!t.kind) {
    t.guessed = true;
    // kleine Kachel ohne Typ: im Workshop fast immer eine Kennzahl
    const small = t.rect.h <= p.box.h * 0.3 && t.rect.w <= p.box.w * 0.4;
    t.kind = small ? 'kpi' : 'text';
  }
}));

// ---------------------------------------------------------------- Kitchen rechnen lassen
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = []; pg.on('pageerror', e => errors.push(String(e)));
await pg.goto(pathToFileURL(kitchen).href);
await pg.waitForFunction(() => window.MK && window.MK_PBIR && window.MK_CATALOG);

const result = await pg.evaluate(({ pages, links, report, measures, title }) => {
  const MK = window.MK, CAT = window.MK_CATALOG;
  const uid = () => Math.random().toString(36).slice(2, 9);
  MK.reset();
  const S = JSON.parse(JSON.stringify(MK.state));
  S.name = title; delete S.dflt;
  S.canvas = { w: 1280, h: 720, preset: '1280x720' };
  S.chrome.filter.on = false;
  const head = pages.find(p => p.headerTitle);
  if (head) { S.chrome.header.title = head.headerTitle; S.chrome.header.sub = ''; delete S.chrome.header.dflt; }
  Object.assign(S.report, report);
  const m = S.spacing.margin, g = S.spacing.gutter;
  const top = S.chrome.header.on ? S.chrome.header.h : 0, bottom = 720 - (S.chrome.footer.on ? S.chrome.footer.h : 0);
  const content = { x: m, y: top + m, w: 1280 - 2 * m, h: bottom - top - 2 * m };
  const pageId = {}; pages.forEach(p => { pageId[p.boardId] = uid(); });
  const leafId = {}; const stats = []; const kinds = {}; const guessed = [];
  const lab = s => String(s || '').toLowerCase().trim(); const byLabel = {};
  Object.values(CAT.byId).forEach(d => { byLabel[lab(d.label)] = d.id; });
  S.pages = pages.map(p => {
    // Mit Kopfband bildet die Sektion die ganze Leinwand ab, ohne Kopfband nur den Inhaltsbereich
    const k = p.hasHeader ? 1280 / p.box.w : content.w / p.box.w;
    const ox = p.hasHeader ? 0 : content.x, oy = p.hasHeader ? 0 : content.y;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const tiles = p.tiles.map(t => {
      let x = ox + t.rect.x * k, y = oy + t.rect.y * k, x1 = x + t.rect.w * k, y1 = y + t.rect.h * k;
      x = clamp(x, content.x, content.x + content.w - 40); y = clamp(y, content.y, content.y + content.h - 40);
      x1 = clamp(x1, x + 40, content.x + content.w); y1 = clamp(y1, y + 40, content.y + content.h);
      return { t, folder: t.id, type: t.kind, r: { x: Math.round(x), y: Math.round(y), w: Math.round(x1 - x), h: Math.round(y1 - y) } };
    });
    let layout;
    if (!tiles.length) layout = { id: uid(), type: 'leaf', visual: null };
    else {
      const s = window.MK_PBIR.solveRects(tiles, content, g);
      const nR = s.rows.length, nC = s.cols.length; const occ = Array.from({ length: nR }, () => new Array(nC).fill(null)); const children = [];
      const area = r => r.w * r.h; let skipped = 0;
      s.cells.slice().sort((a, b) => area(b.tile.r) - area(a.tile.r)).forEach(c => {
        let clash = false; for (let r = c.r; r < c.r + c.rs; r++) for (let q = c.c; q < c.c + c.cs; q++) if (occ[r][q]) clash = true;
        if (clash) { skipped++; return; }
        for (let r = c.r; r < c.r + c.rs; r++) for (let q = c.c; q < c.c + c.cs; q++) occ[r][q] = c.tile;
        const t = c.tile.t; const exact = t.hint && byLabel[lab(t.hint)]; if (exact) { t.kind = exact; t.guessed = false; }
        const def = CAT.byId[t.kind]; kinds[t.kind] = (kinds[t.kind] || 0) + 1; if (t.guessed) guessed.push({ page: p.name, title: t.title, kind: t.kind }); const id = uid(); leafId[t.id] = { id, page: p.boardId };
        const visual = { kind: t.kind, engine: def ? def.engine : 'native', title: t.title, sub: '', roles: {}, link: '', content: '', priority: '', analysis: {},
          notes: t.guessed ? 'Typ auf dem Board nicht genannt, aus der Größe geschätzt' + (t.hint ? ' (' + t.hint + ')' : '') : '',
          status: t.color === 'green' ? 'agreed' : 'open', openQuestion: t.color === 'yellow' || !!t.guessed };
        children.push({ r: c.r, c: c.c, rs: c.rs, cs: c.cs, node: { id, type: 'leaf', visual } });
      });
      for (let r = 0; r < nR; r++) for (let q = 0; q < nC; q++) {
        if (occ[r][q]) continue; let cs = 1; while (q + cs < nC && !occ[r][q + cs]) cs++;
        let rs = 1; while (r + rs < nR && occ[r + rs].slice(q, q + cs).every(o => !o)) rs++;
        for (let a = r; a < r + rs; a++) for (let b = q; b < q + cs; b++) occ[a][b] = true;
        children.push({ r, c: q, rs, cs, node: { id: uid(), type: 'leaf', visual: null } });
      }
      children.sort((a, b) => a.r - b.r || a.c - b.c);
      layout = { id: uid(), type: 'grid', cols: s.cols, rows: s.rows, children };
      stats.push({ page: p.name, tiles: tiles.length, skipped, maxDev: Math.round(s.dev * 10) / 10 });
    }
    return { id: pageId[p.boardId], name: p.name, notes: '', question: p.question, layout };
  });
  // Pfeile Kachel → Seite werden Verknüpfungen
  const walk = (n, f) => { if (!n) return; if (n.type === 'leaf') f(n); (n.children || []).forEach(c => walk(c.node || c, f)); };
  links.forEach(l => { const src = leafId[l.from]; if (!src) return; S.pages.forEach(p => walk(p.layout, n => { if (n.id === src.id && n.visual) n.visual.link = pageId[l.toBoardId]; })); });
  // Kennzahlen, die das geladene Modell nicht kennt, als neue Kennzahlen vormerken
  const known = new Set(); (S.model.tables || []).forEach(tb => (tb.measures || []).concat(tb.columns || []).forEach(f => known.add(f.name.toLowerCase())));
  S.newFields = S.newFields || [];
  measures.forEach(f => { if (known.has(f.name.toLowerCase()) || S.newFields.some(n => n.name === f.name)) return; S.newFields.push({ id: uid(), name: f.name, table: '_Measures', kind: 'measure', desc: '', open: f.confirmed ? '' : 'Vom Whiteboard, noch nicht bestätigt', unit: '', target: '', owner: '', source: 'Whiteboard', isNew: true, type: '' }); });
  S.cur = S.pages[0].id;
  MK.state = S;
  return { state: MK.state, stats, kinds, guessed, pageIds: S.pages.map(p => p.id) };
}, { pages, links, report, measures, title: plain(title) });

fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(result.state, null, 2));

if (shotsDir) {
  fs.mkdirSync(shotsDir, { recursive: true });
  for (let i = 0; i < result.pageIds.length; i++) {
    await pg.evaluate(id => { const s = JSON.parse(JSON.stringify(window.MK.state)); s.cur = id; window.MK.state = s; }, result.pageIds[i]);
    await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(shotsDir, `page-${i + 1}.png`) });
  }
}
await browser.close();

result.guessed.forEach(t => warnings.push(`Seite „${t.page}": Kachel „${t.title}" ohne Typ auf dem Board, als „${t.kind}" geschätzt und als offene Frage markiert`));
const kinds = result.kinds;
console.log(JSON.stringify({ out: outFile, pages: result.stats, links: links.length, report, measures: measures.length, kinds, warnings, pageErrors: errors }, null, 2));
if (errors.length) process.exit(1);
