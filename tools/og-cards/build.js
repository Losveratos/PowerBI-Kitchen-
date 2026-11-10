#!/usr/bin/env node
// Erzeugt assets/og/zwei-heimaten.png und assets/og/wohlstandsatlas.png (1200x630).
// Zahlen/Quadrate kommen zur Bauzeit aus wohlstand-story/data/story_data.json (nichts eingecheckt dupliziert).
// Die Atlas-Karte wird live von der echten Seite (eigener Server, Port 8766) aufgenommen.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'assets/og');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };

function serve(port) {
  const srv = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const story = JSON.parse(fs.readFileSync(path.join(ROOT, 'wohlstand-story/data/story_data.json'), 'utf8'));
  const srv = await serve(8766);
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'light' });
    const shot = async (name, init) => {
      const page = await ctx.newPage();
      if (init) await page.addInitScript(init.fn, init.arg);
      await page.goto(`http://127.0.0.1:8766/tools/og-cards/${name}.html`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, `${name}.png`), clip: { x: 0, y: 0, width: 1200, height: 630 } });
      await page.close();
    };
    await shot('zwei-heimaten', { fn: d => { window.__STORY__ = d; }, arg: story });

    // Atlas-Karte: nur das Canvas-Element aufnehmen
    const atlas = await (await browser.newContext({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 1, colorScheme: 'light' })).newPage();
    await atlas.goto('http://127.0.0.1:8766/wohlstandsatlas.html', { waitUntil: 'load' });
    await atlas.addStyleTag({ content: '#zoom,.zoom,#tip,.tip{display:none!important}' });
    await atlas.waitForTimeout(4000);
    await atlas.locator('#map').scrollIntoViewIfNeeded();
    const buf = await atlas.locator('#map').screenshot();
    await atlas.close();
    await shot('wohlstandsatlas', { fn: m => { window.__MAP__ = m; }, arg: 'data:image/png;base64,' + buf.toString('base64') });
  } finally { await browser.close(); srv.close(); }
  console.log('OK ->', OUT);
})().catch(e => { console.error(e); process.exit(1); });
