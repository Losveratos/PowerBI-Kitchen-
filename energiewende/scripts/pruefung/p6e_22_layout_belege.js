const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const OUT = __dirname + '/shots';
const BASE = 'http://127.0.0.1:8822/';
(async () => {
  const browser = await chromium.launch();
  const rep = [];
  for (const [vw, vh] of [[1280, 800], [390, 844]]) for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, colorScheme: scheme, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); const errs = [], ext = [];
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
    page.on('request', r => { if (!r.url().startsWith(BASE)) ext.push(r.url()); });
    await page.goto(BASE + 'energiewende-1-belege.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // open all sections
    await page.evaluate(() => document.querySelectorAll('details.sec').forEach(d => d.open = true));
    await page.waitForTimeout(800);
    const ids = await page.$$eval('details.sec', ds => ds.map(d => d.id));
    for (const id of ids) {
      const el = await page.$('#' + id);
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: `${OUT}/belege_${vw}_${scheme}_${id}.png` });
    }
    const box = await page.$('#chartbox');
    await box.screenshot({ path: `${OUT}/belege_${vw}_${scheme}_chart.png` });
    const m = await page.evaluate(() => {
      function rgb(s) { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; return m[1].split(',').slice(0, 3).map(parseFloat); }
      const host = document.getElementById('chart'); const hr = host.getBoundingClientRect();
      const svgs = Array.from(host.querySelectorAll('svg.sc'));
      const texts = svgs.flatMap(s => Array.from(s.querySelectorAll('text')));
      const sizes = texts.map(t => { const sv = t.ownerSVGElement; const sc = sv.getBoundingClientRect().width / sv.viewBox.baseVal.width; return parseFloat(getComputedStyle(t).fontSize) * sc; });
      const outHost = texts.filter(t => { const r = t.getBoundingClientRect(); return r.left < hr.left - 0.5 || r.right > hr.right + 0.5; }).map(t => t.textContent + ' @' + t.closest('.sc-row')?.querySelector('b')?.textContent);
      const ov = [];
      svgs.forEach(s => { const bs = Array.from(s.querySelectorAll('text')).map(t => t.getBoundingClientRect()); const ts = Array.from(s.querySelectorAll('text'));
        for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const A = bs[i], B = bs[j]; const ix = Math.min(A.right, B.right) - Math.max(A.left, B.left), iy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top); if (ix > 1 && iy > 2) ov.push(ts[i].textContent + ' ⟂ ' + ts[j].textContent); } });
      // text over marks within same svg
      const tom = [];
      svgs.forEach(s => { const ts = Array.from(s.querySelectorAll('text')); const ms = Array.from(s.querySelectorAll('rect,path,circle'));
        ts.forEach(t => { const a = t.getBoundingClientRect(); ms.forEach(mk => { const b = mk.getBoundingClientRect(); const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ix > 2 && iy > 2) tom.push(t.textContent + ' ⟂ ' + mk.tagName + ' @' + (t.closest('.sc-row')?.querySelector('b')?.textContent || '')); }); }); });
      // values beyond axis max (17)
      const tables = Array.from(document.querySelectorAll('table')).map(t => ({ id: t.id || t.closest('details,section')?.id, sw: t.scrollWidth, pw: t.parentElement.clientWidth, overflowX: getComputedStyle(t.parentElement).overflowX, caption: !!t.querySelector('caption'), thScope: t.querySelectorAll('th[scope]').length, th: t.querySelectorAll('th').length }));
      const groups = Array.from(host.querySelectorAll('.sc-group')).map(g => ({ cls: g.className, h: g.querySelector('h4').textContent, sw: getComputedStyle(g.querySelector('h4 i')).backgroundColor, n: g.querySelectorAll('.sc-row').length }));
      const docOverflow = document.documentElement.scrollWidth - innerWidth;
      const wide = Array.from(document.querySelectorAll('body *')).filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && !e.closest('[style*="overflow"]') && getComputedStyle(e.parentElement).overflowX === 'visible'; }).slice(0, 10).map(e => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right));
      const twinRows = document.querySelectorAll('#twin tbody tr').length;
      const svgsAria = svgs.filter(s => s.getAttribute('aria-label')).length;
      return { minFont: Math.min(...sizes).toFixed(1), outHost, ov, tom: [...new Set(tom)].slice(0, 30), tables, groups, docOverflow, wide, twinRows, svgs: svgs.length, svgsAria, legend: document.getElementById('chart-legend').innerText, sub: document.getElementById('chart-sub').innerText };
    });
    rep.push(Object.assign({ vw, scheme, errs, ext: [...new Set(ext)] }, m));
    if (scheme === 'light') await page.screenshot({ path: `${OUT}/belege_${vw}_full.png`, fullPage: true });
    await ctx.close();
  }
  fs.writeFileSync(__dirname + '/belege_report.json', JSON.stringify(rep, null, 1));
  await browser.close();
})();
