/* Prueft die englische Fassung visual-standards-calculator.html.
 *
 * Diese Suite sucht nicht nach Uebersetzungsqualitaet - die beurteilt ein Mensch. Sie sucht nach
 * den Fehlern, die beim fragmentweisen Uebersetzen entstehen und die man beim Lesen uebersieht:
 *
 *  1. GETEILTE SCHLUESSEL. Die Datei wurde in sieben Fragmente geschnitten und einzeln uebersetzt.
 *     Ein Objektschluessel, den Fragment A anlegt und Fragment B ausliest, muss in beiden gleich
 *     uebersetzt sein - sonst steht in der Oberflaeche "undefined". Das passiert lautlos.
 *  2. DEUTSCHE RESTE in sichtbarem Text.
 *  3. ZERBROCHENE RECHNUNG. Wenn beim Uebersetzen versehentlich Code geaendert wurde, zeigen sich
 *     NaN oder fehlende Betraege - die Zahlen muessen mit denen der deutschen Fassung
 *     uebereinstimmen, denn uebersetzt wurde Text, nicht Logik.
 *
 * Start:  node tests/rechner/englische-fassung.test.js
 */
const path = require('path');
const fs = require('fs');
const { chromium, REPO, artifactDir, reporter } = require('./lib/harness');

const EN = path.join(REPO, 'visual-standards-calculator.html');
const DE = path.join(REPO, 'visual-standards-rechner.html');
const R = reporter('englische-fassung');
const ok = R.ok, watch = R.watch;

(async () => {
  /* Solange die englische Fassung entsteht, wird diese Suite uebersprungen statt rot - sonst
     faerbt eine Datei, die es absichtlich noch nicht gibt, jeden CI-Lauf ein. Sobald
     visual-standards-calculator.html existiert, greift sie ohne weiteres Zutun. */
  if (!fs.existsSync(EN)) {
    console.log('  uebersprungen: visual-standards-calculator.html gibt es noch nicht.');
    console.log('  Erzeugen mit: node scripts/i18n-build.js');
    console.log('##SUITE## ' + JSON.stringify({ suite: 'englische-fassung', checks: 0, fails: 0, jsErrors: 0, skipped: true }));
    process.exit(0);
  }
  const b = await chromium.launch();
  const load = async (file) => {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    watch(p);
    await p.goto('file://' + file, { waitUntil: 'load' });
    await p.evaluate(() => { const x = document.getElementById('wiz-skip'); if (x) x.click(); });
    await p.waitForTimeout(700);
    return p;
  };

  const en = await load(EN);

  /* ---------- 1) Geteilte Schluessel: "undefined" und "NaN" in der Oberflaeche ---------- */
  for (const lv of [1, 2, 3]) {
    await en.evaluate(l => setLevel(l), lv);
    await en.waitForTimeout(600);
    const txt = await en.evaluate(() => document.body.innerText);
    const undef = (txt.match(/undefined/g) || []).length;
    const nan = (txt.match(/\bNaN\b/g) || []).length;
    ok('Level ' + lv + ': kein "undefined" im sichtbaren Text', undef === 0, undef + ' Treffer');
    ok('Level ' + lv + ': kein "NaN" im sichtbaren Text', nan === 0, nan + ' Treffer');
  }

  /* Die Herkunfts-Zaehlung ist der bekannte Fall: sie wird in einem Fragment aufgebaut und in
     einem anderen ausgelesen. Sie muss Zahlen liefern, keine leeren Werte. */
  await en.evaluate(() => setLevel(2));
  await en.waitForTimeout(500);
  const cert = await en.evaluate(() => {
    const el = document.getElementById('certainty');
    return el ? el.innerText.replace(/\s+/g, ' ').slice(0, 300) : null;
  });
  ok('Evidence bar rendert mit Werten', !!cert && !/undefined|NaN/.test(cert), cert ? cert.slice(0, 120) : 'fehlt');

  /* ---------- 2) Deutsche Reste im sichtbaren Text ---------- */
  const ERLAUBT = /Daten-WG|ChartKitchen|byDatenWG|BetrVG|EStG|HGB|UStG|Robert Half|TU München|Freelancer-Kompass|WSI|KPMG|Kompass/;
  for (const lv of [1, 2, 3]) {
    await en.evaluate(l => setLevel(l), lv);
    await en.waitForTimeout(500);
    const treffer = await en.evaluate(() => {
      const out = [];
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        const t = n.textContent.trim();
        if (t.length < 4) continue;
        if (!n.parentElement || !n.parentElement.offsetParent) continue;
        if (!/[äöüÄÖÜß]/.test(t)) continue;
        /* Den Umlaut MIT Umgebung melden, nicht den Satzanfang: eine Kuerzung auf die ersten
           80 Zeichen schneidet "Daten-WG" zu "Daten-W" und die Ausnahmeliste greift nicht mehr.
           Der volle Text wird zurueckgegeben, das Fenster dient nur der Anzeige. */
        const i = t.search(/[äöüÄÖÜß]/);
        out.push({ voll: t, stelle: t.slice(Math.max(0, i - 30), i + 30) });
      }
      return out;
    });
    const echte = treffer.filter(x => !ERLAUBT.test(x.voll)).map(x => x.stelle);
    ok('Level ' + lv + ': keine deutschen Umlaute im sichtbaren Text (ausser Eigennamen)',
       echte.length === 0, echte.length ? echte.slice(0, 3).join(' | ') : 'sauber');
  }

  /* ---------- 3) Die Rechnung ist unveraendert ---------- */
  const de = await load(DE);
  const zahlen = async p => p.evaluate(() => {
    const o = {};
    ['paid', 'oss', 'deneb', 'core'].forEach(k => { o[k] = Math.round(expected(k).total); });
    o.be = (typeof licenseBreakEven === 'function') ? licenseBreakEven() : null;
    return o;
  });
  const zEn = await zahlen(en), zDe = await zahlen(de);
  ['paid', 'oss', 'deneb', 'core'].forEach(k => {
    ok('Gesamtkosten ' + k + ' identisch zur deutschen Fassung', zEn[k] === zDe[k], zEn[k] + ' / ' + zDe[k]);
  });
  ok('Break-even identisch zur deutschen Fassung', zEn.be === zDe.be, zEn.be + ' / ' + zDe.be);

  /* ---------- 4) Sprache und Zahlenformat ---------- */
  const meta = await en.evaluate(() => ({
    lang: document.documentElement.lang,
    titel: document.title,
    eur: typeof fmtEur === 'function' ? fmtEur(1500) + ' · ' + fmtEur(2400000) : null,
    n: typeof fmtN === 'function' ? fmtN(1500) : null,
  }));
  ok('lang="en" gesetzt', meta.lang === 'en', meta.lang);
  ok('Titel ist englisch', !/Rechner/.test(meta.titel), meta.titel);
  ok('Waehrung im englischen Format', /^€1,500/.test(meta.eur || ''), meta.eur);
  ok('Zahlen im englischen Format', meta.n === '1,500', meta.n);

  /* ---------- 5) Die Struktur traegt: Sprungziele und Testanker existieren ---------- */
  const anker = await en.evaluate(() => ['s0', 's-map', 's1', 's5', 's-grenzen', 'd-s6', 'd-anhang',
    'headline', 'certainty', 'rclasses', 'decision-path', 'toc-list', 'graph-svg']
    .filter(id => !document.getElementById(id)));
  ok('alle Anker-IDs vorhanden (Selektoren unveraendert)', anker.length === 0, anker.join(', ') || 'vollstaendig');

  await de.close(); await en.close();
  await R.finish(b);
})();
