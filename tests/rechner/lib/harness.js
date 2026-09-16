'use strict';
/* Gemeinsame Basis aller Rechner-Pruefsuiten.
   Loest die drei Stolpersteine der frueheren Wegwerf-Skripte:
   1) absolute file:///home/user/... Pfade  -> aus __dirname abgeleitet
   2) require('playwright') braucht NODE_PATH -> Fallback auf das globale npm-root
   3) Artefakte (Screenshots, PDF, XLSX) im Arbeitsverzeichnis -> feste .artifacts/-Ablage
   Dadurch laufen die Suiten aus jedem Verzeichnis. */

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..', '..');
const HTML = path.join(REPO, 'visual-standards-rechner.html');
const URL = pathToFileURL(HTML).href;
const XLSX_ASSET = path.join(REPO, 'assets', 'js', 'xlsx.full.min.js');

/* --- Playwright laden, ohne NODE_PATH vorauszusetzen --------------------- */
function loadPlaywright() {
  const tried = [];
  try { return require('playwright'); } catch (e) { tried.push('require("playwright")'); }
  const roots = [];
  if (process.env.NODE_PATH) roots.push(...process.env.NODE_PATH.split(path.delimiter).filter(Boolean));
  try { roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch (e) { /* npm fehlt */ }
  roots.push('/opt/node22/lib/node_modules', '/usr/lib/node_modules', '/usr/local/lib/node_modules');
  for (const r of roots) {
    const p = path.join(r, 'playwright');
    tried.push(p);
    try { if (fs.existsSync(p)) return require(p); } catch (e) { /* naechster */ }
  }
  console.error('FEHLER: Playwright nicht gefunden. Gesucht in:\n  ' + tried.join('\n  '));
  console.error('Abhilfe: npm i -g playwright   (oder NODE_PATH=$(npm root -g) setzen)');
  process.exit(4);
}
const playwright = loadPlaywright();

/* --- Artefakt-Ablage ----------------------------------------------------- */
function artifactDir(suite) {
  const d = path.join(REPO, 'tests', 'rechner', '.artifacts', suite);
  fs.mkdirSync(d, { recursive: true });
  return d + path.sep;
}

/* --- Der gefuehrte Einstieg steht sonst im Weg --------------------------- */
async function skipWizard(page) {
  await page.evaluate(() => { const b = document.getElementById('wiz-skip'); if (b) b.click(); });
  await page.waitForTimeout(200);
}

/* Seite oeffnen + Wizard ueberspringen in einem Schritt. */
async function openPage(browserOrContext, { viewport, hash = '', wait = 1000 } = {}) {
  const page = await browserOrContext.newPage(viewport ? { viewport } : {});
  await page.goto(URL + hash, { waitUntil: 'load' });
  await page.waitForTimeout(wait);
  await skipWizard(page);
  return page;
}

/* --- Ergebnis-Buchhaltung ------------------------------------------------ */
const IGNORE_CONSOLE = /ERR_CERT_AUTHORITY_INVALID|fonts\.googleapis|ERR_CONNECTION|ERR_FAILED|net::|cdnjs\.cloudflare/;

function reporter(suite) {
  let checks = 0, fails = 0;
  const errs = [];
  const ok = (name, cond, extra) => {
    checks++; if (!cond) fails++;
    console.log((cond ? 'OK   ' : 'FAIL ') + name + (extra === undefined ? '' : ' | ' + extra));
  };
  const watch = (page, tag) => {
    const pre = tag ? tag + ': ' : '';
    page.on('pageerror', e => errs.push(pre + 'pageerror: ' + e.message));
    page.on('console', m => {
      if (m.type() === 'error' && !IGNORE_CONSOLE.test(m.text())) errs.push(pre + 'console: ' + m.text());
    });
    return page;
  };
  const finish = async (browser) => {
    console.log('\nJS-Fehler: ' + (errs.length ? errs.join(' | ') : 'keine'));
    const bad = fails + errs.length;
    console.log(bad === 0
      ? '\nALLE PRUEFUNGEN BESTANDEN (' + checks + ')'
      : '\nFEHLSCHLAEGE: ' + fails + ' / JS-FEHLER: ' + errs.length + ' von ' + checks + ' Pruefungen');
    /* Von tests/run-all.js ausgewertet. */
    console.log('##SUITE## ' + JSON.stringify({ suite, checks, fails, jsErrors: errs.length }));
    if (browser) { try { await browser.close(); } catch (e) { /* egal */ } }
    process.exit(bad ? 1 : 0);
  };
  return { ok, watch, errs, finish, get checks() { return checks; }, get fails() { return fails; } };
}

module.exports = {
  playwright, chromium: playwright.chromium,
  REPO, HTML, URL, XLSX_ASSET,
  artifactDir, skipWizard, openPage, reporter,
};
