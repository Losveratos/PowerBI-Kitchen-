#!/usr/bin/env node
/* Kachel-Palette aus MockupKitchen für ein Claude-Whiteboard
 *
 *   node kitchen_palette.mjs <out-dir> [--x 0] [--y 960] [--start 14] [--kitchen <mockup-kitchen.html>]
 *
 * Rendert jeden Kachel-Typ des Kitchen-Katalogs (assets/mockup/catalog.js) mit seiner Skizze
 * (assets/mockup/sketches.js) als kleines PNG und schreibt je Typ ein Board-Element `image`.
 * Der Typ steckt im Link des Bildes (`…/mockup-kitchen.html#kind=<id>`): Wer das Bild auf dem Board
 * kopiert und in eine Seiten-Sektion zieht, hat eine Kachel dieses Typs; board_to_mockup.mjs liest ihn exakt.
 *
 * --start  erste freie e-Nummer auf dem Board (höchste vorhandene + 1)
 * Ausgabe: Schreibliste für ArtifactData `batch`, eine Zeile je Paket (höchstens 20 Einträge, wegen der Bildgröße).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); if (i < 0) return dflt; const v = args[i + 1]; args.splice(i, 2); return v; };
const X = +opt('--x', 0), Y = +opt('--y', 960), START = +opt('--start', 1);
const kitchen = path.resolve(opt('--kitchen', path.join(HERE, '../../../../mockup-kitchen.html')));
const out = path.resolve(args[0] || '');
if (!args[0]) { console.error('Aufruf: kitchen_palette.mjs <out-dir> [--x 0] [--y 960] [--start 14]'); process.exit(2); }
export const KIND_URL = 'https://datenwgknowledgekitchen.com/mockup-kitchen.html#kind=';
export const PALETTE_TITLE = 'Kitchen-Kacheln';

const TW = 160, TH = 100, GAP = 16, PER_ROW = 8, PAD = 24;   // Maße auf dem Board
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });   // 320×200 px für 160×100 auf dem Board: schon doppelte Auflösung
await pg.goto(pathToFileURL(kitchen).href);
await pg.waitForFunction(() => window.MK && window.MK_SKETCH && window.MK_CATALOG);
await pg.evaluate(() => document.fonts.ready);

const kinds = await pg.evaluate(() => {
  const CAT = window.MK_CATALOG; const seen = []; const groups = [];
  Object.values(CAT.byId).forEach(d => { if (!groups.includes(d.groupId)) groups.push(d.groupId); seen.push({ id: d.id, label: d.label, group: d.groupId, groupLabel: d.group, sketch: d.sketch || d.id, engine: (CAT.engineLabel && CAT.engineLabel[d.engine]) || d.engine }); });
  return seen;
});

// Karte je Typ: Name, Engine, Skizze – im Kitchen selbst gerendert und fotografiert
await pg.evaluate(() => {
  const host = document.createElement('div'); host.id = 'wbPalette';
  host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;width:320px;height:200px;background:#fff;border:1px solid #D9D6CC;border-radius:10px;box-sizing:border-box;padding:10px 12px;font-family:Geist,sans-serif;color:#0F1E2E;display:flex;flex-direction:column;gap:6px';
  document.body.appendChild(host);
});
const els = []; const groups = [];
kinds.forEach(k => { if (!groups.find(g => g.id === k.group)) groups.push({ id: k.group, label: k.groupLabel, items: [] }); groups.find(g => g.id === k.group).items.push(k); });
let n = START; const id = () => `e${n++}`;
const cont = { id: id(), data: null };
let y = Y + PAD; const width = PAD * 2 + PER_ROW * TW + (PER_ROW - 1) * GAP;
for (const g of groups) {
  els.push({ id: id(), data: { type: 'text', x: X + PAD, y, text: String(g.label || g.id), size: 'body' } });
  y += 32;
  for (let i = 0; i < g.items.length; i++) {
    const k = g.items[i];
    await pg.evaluate(({ k }) => {
      const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const svg = window.MK_SKETCH(k.sketch, 294, 140, { scenario: 'AC/PL', seed: 5, lang: 'de' });
      document.getElementById('wbPalette').innerHTML = `<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><b style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(k.label)}</b><span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#475569;white-space:nowrap">${esc(k.engine)}</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center">${svg}</div>`;
    }, { k });
    const png = await pg.locator('#wbPalette').screenshot({ type: 'png' });
    if (png.length > 75000) { console.error(`Bild für ${k.id} ist ${png.length} Byte, zu groß für ein Board-Bild`); process.exit(1); }
    const col = i % PER_ROW, row = Math.floor(i / PER_ROW);
    els.push({ id: id(), kind: k.id, bytes: png.length, data: { type: 'image', x: X + PAD + col * (TW + GAP), y: y + row * (TH + GAP), w: TW, h: TH, src: 'data:image/png;base64,' + png.toString('base64'), href: KIND_URL + k.id } });
  }
  y += Math.ceil(g.items.length / PER_ROW) * (TH + GAP) + 8;
}
await browser.close();
cont.data = { type: 'container', x: X, y: Y, w: width, h: y - Y + PAD - GAP, text: `${PALETTE_TITLE} · kopieren und in eine Seite ziehen` };

fs.mkdirSync(out, { recursive: true });
const all = [cont, ...els]; const batches = [[]]; let size = 0;
for (const e of all) {
  const file = path.join(out, e.id + '.json'); const txt = JSON.stringify(e.data); fs.writeFileSync(file, txt);
  if (batches[batches.length - 1].length >= 20 || size + txt.length > 700000) { batches.push([]); size = 0; }
  batches[batches.length - 1].push({ op: 'set', collection: 'elements', doc_id: e.id, file_path: file }); size += txt.length;
}
batches.forEach(b => console.log(JSON.stringify(b)));
const imgs = els.filter(e => e.kind);
console.error(JSON.stringify({ kinds: imgs.length, groups: groups.map(g => `${g.label}: ${g.items.length}`), maxBytes: Math.max(...imgs.map(e => e.bytes)), totalKB: Math.round(imgs.reduce((a, e) => a + e.bytes, 0) / 1024), box: cont.data, ids: `${cont.id}–e${n - 1}` }));
