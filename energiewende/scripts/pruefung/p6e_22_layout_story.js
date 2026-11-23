const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const OUT = __dirname + '/shots';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://127.0.0.1:8822/';

// in-page helpers
const MEASURE = () => {
  function rgb(s) { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); if (p.length > 3 && p[3] === 0) return null; return p.slice(0, 3); }
  function lum(c) { return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]); function ch(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); } }
  function cr(a, b) { const A = lum(a), B = lum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); }
  window.__m = { rgb, cr };
};

(async () => {
  const browser = await chromium.launch();
  const report = [];
  for (const [vw, vh] of [[1280, 800], [390, 844]]) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, colorScheme: scheme, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      const errs = [], ext = [];
      page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
      page.on('pageerror', e => errs.push(String(e)));
      page.on('request', r => { const u = r.url(); if (!u.startsWith(BASE)) ext.push(u); });
      await page.goto(BASE + 'energiewende-1-story.html', { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__storyReady === true, null, { timeout: 20000 });
      await page.evaluate(MEASURE);
      await page.waitForTimeout(400);
      const sids = await page.$$eval('.step', ss => ss.map(s => s.dataset.sid));
      for (const sid of sids) {
        await page.evaluate(sid => {
          const st = document.querySelector(`.step[data-sid="${sid}"]`);
          st.scrollIntoView({ block: 'center', behavior: 'instant' });
        }, sid);
        await page.waitForTimeout(vw > 1000 ? 700 : 250);
        const m = await page.evaluate(sid => {
          const { rgb, cr } = window.__m;
          const st = document.querySelector(`.step[data-sid="${sid}"]`);
          const desk = matchMedia('(min-width:1020px)').matches;
          const slot = desk ? document.querySelector(`.dslot[data-sid="${sid}"]`) : st.querySelector('.mslot');
          const fig = slot.querySelector('figure');
          const fr = fig.getBoundingClientRect();
          const res = { sid, title: fig.querySelector('.ft').textContent, sub: fig.querySelector('.fs').textContent, slotOn: desk ? slot.classList.contains('on') : true,
            figTop: Math.round(fr.top), figBottom: Math.round(fr.bottom), figH: Math.round(fr.height), figLeft: Math.round(fr.left), figRight: Math.round(fr.right), vw: innerWidth, vh: innerHeight,
            docOverflowX: document.documentElement.scrollWidth - innerWidth };
          const surf = rgb(getComputedStyle(fig).backgroundColor);
          const svg = fig.querySelector('svg');
          if (svg) {
            const vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect();
            const scale = r.width / vb.width;
            res.vb = [vb.width, Math.round(vb.height)]; res.rend = [Math.round(r.width), Math.round(r.height)]; res.scale = +scale.toFixed(3);
            const texts = Array.from(svg.querySelectorAll('text'));
            const sizes = texts.map(t => parseFloat(getComputedStyle(t).fontSize) * scale);
            res.minFont = +Math.min(...sizes).toFixed(1);
            res.small = texts.filter((t, i) => sizes[i] < 12).map(t => t.textContent.slice(0, 30));
            const boxes = texts.map(t => { const b = t.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height, s: t.textContent.slice(0, 45), cls: t.getAttribute('class') }; });
            res.outside = boxes.filter(b => b.x < -0.5 || b.x + b.w > vb.width + 0.5 || b.y < -0.5 || b.y + b.h > vb.height + 0.5).map(b => b.s + ` [${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.w)}x${Math.round(b.h)}]`);
            const ov = [];
            for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
              const A = boxes[i], B = boxes[j];
              const ix = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), iy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
              if (ix > 1.5 && iy > 2.5) ov.push(A.s + ' ⟂ ' + B.s);
            }
            res.overlaps = ov;
            // text over marks: text bbox intersecting a filled data mark (rect/path) that is not its own card
            const marks = Array.from(svg.querySelectorAll('rect, path, circle')).filter(e => !e.closest('defs') && !e.closest('pattern') && !e.closest('marker'));
            const tom = [];
            boxes.forEach((b, i) => {
              if (/halo/.test(b.cls)) return;
              marks.forEach(mk => {
                const c = mk.getAttribute('class') || '';
                if (/k-card|f-band/.test(c)) return;
                const mb = mk.getBBox();
                if (mb.width > vb.width * 0.8) return;
                const ix = Math.min(b.x + b.w, mb.x + mb.width) - Math.max(b.x, mb.x), iy = Math.min(b.y + b.h, mb.y + mb.height) - Math.max(b.y, mb.y);
                if (ix > 2 && iy > 3) tom.push(b.s + ' ⟂ ' + mk.tagName + '.' + c);
              });
            });
            res.textOverMark = [...new Set(tom)].slice(0, 12);
            // screen: text outside viewport
            res.offscreen = texts.filter(t => { const q = t.getBoundingClientRect(); return q.left < -0.5 || q.right > innerWidth + 0.5; }).map(t => t.textContent.slice(0, 40));
            // contrast of marks vs surface
            const low = [];
            marks.forEach(mk => {
              const cs = getComputedStyle(mk), c = mk.getAttribute('class') || '';
              if (/k-grid|f-band/.test(c)) return;
              const fillAttr = mk.getAttribute('fill') || '';
              const f = fillAttr.startsWith('url') ? null : rgb(cs.fill);
              const s = (cs.stroke && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0) ? rgb(cs.stroke) : null;
              const fc = f && surf ? cr(f, surf) : 0, sc = s && surf ? cr(s, surf) : 0;
              const best = Math.max(fc, sc);
              if (best < 3 && !fillAttr.startsWith('url')) low.push(`${mk.tagName}.${c || '-'} fill ${fc.toFixed(2)} stroke ${sc.toFixed(2)}`);
            });
            res.lowContrastMarks = [...new Set(low)];
            const lowT = [];
            texts.forEach(t => { const f = rgb(getComputedStyle(t).fill); if (f && surf) { const c = cr(f, surf); const fs = parseFloat(getComputedStyle(t).fontSize); const need = fs >= 18.66 || (fs >= 14 && +getComputedStyle(t).fontWeight >= 700) ? 3 : 4.5; if (c < need) lowT.push(t.textContent.slice(0, 30) + ' ' + c.toFixed(2)); } });
            res.lowContrastText = [...new Set(lowT)];
            res.svgLabel = svg.getAttribute('aria-labelledby');
          } else {
            const b = fig.querySelector('.figbody');
            res.html = true; res.htmlOverflow = b.scrollWidth - b.clientWidth;
            res.minFont = Math.min(...Array.from(b.querySelectorAll('*')).filter(e => e.childNodes.length && Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())).map(e => parseFloat(getComputedStyle(e).fontSize)));
          }
          const card = st.querySelector('.card').getBoundingClientRect();
          res.cardH = Math.round(card.height); res.cardTop = Math.round(card.top);
          res.coverCard = Math.round(Math.max(0, Math.min(card.bottom, fr.bottom) - Math.max(card.top, fr.top)) * (desk ? (fr.left < card.right ? 1 : 0) : 1));
          res.twin = !!st.querySelector('details.twin');
          res.twinRows = st.querySelectorAll('details.twin tbody tr').length;
          res.active = st.classList.contains('is-active');
          return res;
        }, sid);
        report.push(Object.assign({ vw, scheme }, m));
        const tag = sid.replace('.', '-');
        const figEl = await page.$(vw > 1000 ? `.dslot[data-sid="${sid}"] figure` : `.step[data-sid="${sid}"] .mslot figure`);
        await figEl.screenshot({ path: `${OUT}/story_${vw}_${scheme}_s${tag}.png` });
        if (scheme === 'light') await page.screenshot({ path: `${OUT}/story_${vw}_viewport_s${tag}.png` });
      }
      // toggle wachsend in 4.3
      await page.evaluate(() => document.querySelector('.step[data-sid="4.3"]').scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(500);
      await page.click(vw > 1000 ? '.dslot[data-sid="4.3"] button[data-m="wachsend"]' : '.step[data-sid="4.3"] .mslot button[data-m="wachsend"]');
      await page.waitForTimeout(500);
      const figEl = await page.$(vw > 1000 ? `.dslot[data-sid="4.3"] figure` : `.step[data-sid="4.3"] .mslot figure`);
      await figEl.screenshot({ path: `${OUT}/story_${vw}_${scheme}_s4-3_wachsend.png` });
      // other parts: kacheln, gp, legend
      for (const id of ['lesehilfe', 'r21-recht', 'gegenpositionen', 'korrekturen']) {
        const el = await page.$('#' + id);
        await el.screenshot({ path: `${OUT}/story_${vw}_${scheme}_${id}.png` });
      }
      const loadnote = await page.$eval('#loadnote', e => e.className + ' ' + e.textContent.slice(0, 300));
      report.push({ vw, scheme, errors: errs, external: [...new Set(ext)], loadnote, storyErrors: await page.evaluate(() => window.__storyErrors) });
      await ctx.close();
    }
  }
  fs.writeFileSync(__dirname + '/story_report.json', JSON.stringify(report, null, 1));
  await browser.close();
})();
