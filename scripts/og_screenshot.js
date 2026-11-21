#!/usr/bin/env node
// Hilfsprogramm fuer build_og_images.py: macht Viewport-Screenshots (1200x630).
// Aufruf: node scripts/og_screenshot.js <jobs.json>
// jobs.json: [{ "url": "...", "out": "/pfad/x.png", "wait": 1500, "js": "optional" }]
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: 'de-DE',
  });
  let failed = 0;
  for (const job of jobs) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
      await Promise.race([
        page.evaluate(async () => {
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          await Promise.all(Array.from(document.images).map((im) =>
            im.complete ? null : new Promise((r) => { im.onload = im.onerror = r; })));
        }),
        new Promise((r) => setTimeout(r, 8000)),
      ]).catch(() => {});
      if (job.js) { try { await page.evaluate(job.js); } catch (e) { errors.push('js: ' + e); } }
      await page.waitForTimeout(job.wait || 1500);
      // kleine feststehende Schaltflaechen (Zurueck-Knopf, Impressum-Pille) ausblenden
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('body *')) {
          const cs = getComputedStyle(el);
          if (cs.position !== 'fixed') continue;
          const r = el.getBoundingClientRect();
          if (r.width < 420 && r.height < 90) el.style.setProperty('display', 'none', 'important');
        }
      }).catch(() => {});
      await page.screenshot({ path: job.out, type: 'png', timeout: 20000, animations: 'allow' });
      console.log('ok  ' + job.url + (errors.length ? '  (' + errors.length + ' Seitenfehler)' : ''));
    } catch (e) {
      failed++;
      console.log('ERR ' + job.url + ' ' + e.message);
    }
    await page.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
