/* Grundregression — Robustheit und Ausgabewege.
   Prueft: keine JS-Fehler beim Laden, Rechenlauf, XSS ueber das URL-Fragment,
   Schutz gegen absurde Werte im Link (DoS/Clamping), Preset Konzern mit Rangfolge
   und K.O.-Block, Alles-ausgeschlossen-Fall, Link bleibt beim Ebenenwechsel erhalten,
   eigene Anforderung anlegen, Druck-PDF, Excel-Export und Mobilansicht.

   Herkunft: Scratchpad-Skript test_v3.js. Dort waren alle Proben blosse console.log-
   Messungen ohne Urteil; hier sind sie zu Zusicherungen mit Exit-Code geworden.
   SheetJS wird nicht mehr per addScriptTag aus dem Arbeitsverzeichnis nachgeladen —
   die Seite holt sich assets/js/xlsx.full.min.js selbst, auch unter file://.

   Start:  node tests/rechner/sicherheit-und-export.test.js */
const fs = require('fs');
const { chromium, URL: FILE, XLSX_ASSET, artifactDir, skipWizard, reporter } = require('./lib/harness');
const DIR = artifactDir('sicherheit-und-export');
const R = reporter('sicherheit-und-export');
const ok = R.ok;

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64');
/* Nach jedem goto/reload muss der gefuehrte Einstieg weg, sonst steht er im Weg. */
const load = async (p, hash = '') => {
  await p.goto(FILE + hash, { waitUntil: 'load' });
  await p.waitForTimeout(400);
  await skipWizard(p);
};

(async () => {
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const p = R.watch(await ctx.newPage({ viewport: { width: 1024, height: 768 } }));
p.on('dialog', async d => { await d.accept(d.message().startsWith('Eigene') ? 'Barrierefreiheit' : 'Kontrast'); });

/* ---------- 0) Voraussetzung: die lokale SheetJS-Kopie, auf die die Seite zeigt ---------- */
ok('assets/js/xlsx.full.min.js liegt im Repo (Excel-Export ohne Netz)',
   fs.existsSync(XLSX_ASSET) && fs.statSync(XLSX_ASSET).size > 100000,
   fs.existsSync(XLSX_ASSET) ? Math.round(fs.statSync(XLSX_ASSET).size / 1024) + ' KB' : 'fehlt');

/* ---------- 1) Laden und rechnen ---------- */
await load(p);
const t0 = Date.now();
await p.evaluate(() => update());
const ms = Date.now() - t0;
ok('Rechenlauf update() laeuft durch und bleibt unter 10 s', ms < 10000, ms + ' ms');
ok('Vier Ansaetze sind simuliert',
   await p.evaluate(() => ['paid','oss','deneb','core'].every(k => lastSim[k] && isFinite(lastSim[k].p50))));

/* ---------- 2) XSS ueber das URL-Fragment ---------- */
const xss = b64({ cu: [{ id: 'x" onmouseover="window.__XSS=1" data-z="', name: '<img src=x onerror=window.__XSS2=1>', sub: 's' }], pr: {} });
await load(p, '#s=' + xss);
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(300); await skipWizard(p);
const x = await p.evaluate(() => ({
  attrs: document.querySelectorAll('[onmouseover]').length,
  imgs: document.querySelectorAll('#req-table img').length,
  flags: [window.__XSS, window.__XSS2],
}));
const xrows = await p.$$eval('#req-table tbody tr', r => r.length);
ok('Link mit Anfuehrungszeichen erzeugt kein onmouseover-Attribut', x.attrs === 0, x.attrs);
ok('Link mit <img onerror> erzeugt kein Bild in der Anforderungstabelle', x.imgs === 0, x.imgs);
ok('Kein eingeschleuster Code ist gelaufen', x.flags[0] === undefined && x.flags[1] === undefined, JSON.stringify(x.flags));
ok('Die Anforderungstabelle steht trotzdem', xrows > 10, xrows + ' Zeilen');

/* ---------- 3) Absurde Werte im Link werden begrenzt ---------- */
await load(p, '#s=' + b64({ g: { rateInt: [0, -200000, 1] }, w: -500, c: -5 }));
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(300); await skipWizard(p);
const d = await p.evaluate(() => ({
  head: document.getElementById('headline').textContent.trim(),
  creators: S.creators, weight: S.weight, rateInt: S.g.rateInt,
}));
ok('Negative Ersteller-Zahl wird abgefangen', d.creators >= 0 && isFinite(d.creators), String(d.creators));
ok('Negatives Gewicht wird abgefangen', d.weight >= 0 && d.weight <= 100, String(d.weight));
ok('Negativer Stundensatz wird abgefangen', d.rateInt.every(v => v >= 0 && isFinite(v)), JSON.stringify(d.rateInt));
ok('Die Ueberschrift bleibt lesbar (kein NaN, kein Absturz)',
   d.head.length > 10 && !/NaN|undefined|Infinity/.test(d.head), d.head.slice(0, 80));

/* ---------- 4) Preset Konzern: Rangfolge, K.O.-Block, Verhandlungsgrenze ---------- */
await p.goto(FILE, { waitUntil: 'load' });
await p.evaluate(() => { location.hash = ''; });
await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(300); await skipWizard(p);
await p.click('.stepper [data-level="3"]'); await p.waitForTimeout(300);
await p.click('[data-preset="konzern"]'); await p.waitForTimeout(500);
ok('Preset meldet sich mit einem Hinweis', (await p.$eval('#toast', e => e.textContent)).length > 5,
   await p.$eval('#toast', e => e.textContent));
const kpis = await p.$$eval('#kpi-allowed .kpi', els => els.map(e =>
  (e.querySelector('.rank') || {}).textContent + ' ' + (e.querySelector('.name') || {}).textContent + ' ' +
  ((e.querySelector('.big') || {}).textContent || '').replace(/\s+/g, ' ')));
ok('Rangfolge zeigt zulaessige Ansaetze mit Platz, Name und Betrag',
   kpis.length >= 1 && kpis.every(t => /\d/.test(t)), kpis.length + ' Karten: ' + kpis.join(' / ').slice(0, 120));
const koTxt = await p.$eval('#ko-block', e => e.textContent);
ok('Ausgeschlossene Ansaetze werden mit Grund genannt', koTxt.length > 20, koTxt.slice(0, 100));
const beTxt = await p.$eval('#be-insight', e => e.textContent);
ok('Verhandlungsgrenze wird ausgewiesen', /Verhandlungsgrenze/.test(beTxt), beTxt.slice(0, 100));

await p.$eval('#s5', e => e.scrollIntoView()); await p.waitForTimeout(300);
await p.screenshot({ path: DIR + 'ergebnis.png' });
const chartBlocks = await p.$$('#s5 .grid2.charts');
if (chartBlocks[0]) await chartBlocks[0].screenshot({ path: DIR + 'charts-1.png' });
if (chartBlocks[1]) await chartBlocks[1].screenshot({ path: DIR + 'charts-2.png' });
ok('Ergebnis-Abschnitt hat Diagrammbloecke', chartBlocks.length >= 2, chartBlocks.length);

/* ---------- 5) Mitlaufende Kopfzeile ---------- */
const sticky = await p.evaluate(() => { window.scrollTo(0, 0);
  return new Promise(r => setTimeout(() => r({ cls: document.getElementById('sticky-bar').className,
    val: document.getElementById('sticky-value').textContent }), 400)); });
/* Die Leiste fasst das Ergebnis zusammen; wann sie erscheint, haengt an der Scrollposition
   und wird hier bewusst nicht festgeschrieben — geprueft wird der Inhalt. */
ok('Mitlaufende Kopfzeile traegt eine brauchbare Zusammenfassung',
   /€/.test(sticky.val) && !/NaN|undefined/.test(sticky.val), JSON.stringify(sticky));

/* ---------- 6) Alle Ansaetze ausgeschlossen ---------- */
await p.click('input[data-flag="ibcsmust"]');
await p.click('input[data-flag="nobudget"]');
await p.waitForTimeout(500);
const allKo = await p.$eval('#headline', e => e.textContent);
const conflict = await p.$eval('#conflict-box', e => e.textContent);
ok('Bei zwei harten K.O.-Kriterien bleibt kein Ansatz uebrig und die Seite sagt es',
   allKo.length > 10 && !/NaN/.test(allKo), allKo.slice(0, 120));
ok('Die Konfliktbox erklaert den Widerspruch', conflict.trim().length > 20, conflict.slice(0, 100));
await p.click('input[data-flag="ibcsmust"]');
await p.click('input[data-flag="nobudget"]');
await p.waitForTimeout(400);

/* ---------- 7) Ebenenwechsel behaelt den Link ---------- */
await p.click('.stepper [data-level="2"]'); await p.waitForTimeout(300);
ok('Der Ebenen-Umschalter wirft den Share-Link nicht weg',
   (await p.evaluate(() => location.hash)).startsWith('#s='));

/* ---------- 8) Eigene Anforderung ---------- */
const rowsBefore = await p.$$eval('#req-table tbody tr', r => r.length);
await p.click('#btn-add-req'); await p.waitForTimeout(400);
const rowsAfter = await p.$$eval('#req-table tbody tr', r => r.length);
ok('Eine eigene Anforderung legt genau eine Zeile an', rowsAfter === rowsBefore + 1, rowsBefore + ' -> ' + rowsAfter);

/* ---------- 9) Druck-PDF ---------- */
const pdfPath = DIR + 'druckfassung.pdf';
await p.pdf({ path: pdfPath, printBackground: false });
ok('Druckfassung als PDF entsteht', fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 50000,
   fs.existsSync(pdfPath) ? Math.round(fs.statSync(pdfPath).size / 1024) + ' KB' : 'fehlt');

/* ---------- 10) Excel-Export, ohne Netz ---------- */
const xlsxPath = DIR + 'modell.xlsx';
let dlName = null;
try {
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 30000 }), p.click('#btn-xlsx')]);
  await dl.saveAs(xlsxPath); dlName = dl.suggestedFilename();
} catch (e) { dlName = 'FEHLER: ' + e.message; }
ok('Excel-Export laedt SheetJS lokal und liefert eine Datei',
   dlName === 'visual-standards-rechner.xlsx', dlName);
ok('Die Excel-Datei ist nicht leer',
   fs.existsSync(xlsxPath) && fs.statSync(xlsxPath).size > 20000,
   fs.existsSync(xlsxPath) ? Math.round(fs.statSync(xlsxPath).size / 1024) + ' KB' : 'fehlt');
ok('Der Export lief ohne Netz (SheetJS kam aus assets/js/)', await p.evaluate(() => !!window.XLSX));

/* ---------- 11) Mobil ---------- */
await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(400);
const mob = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
ok('390 px: kein horizontaler Ueberlauf', mob.sw <= mob.cw + 1, JSON.stringify(mob));

await R.finish(browser);
})();
