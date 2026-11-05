/* Prueft die englische Fassung des Rechners.
 *
 * Seit November 2026 gibt es keine zweite Datei mehr: visual-standards-rechner.html traegt beide
 * Sprachen. Deutsch steht im Quelltext, Englisch im Woerterbuch I18N_EN, und der Umschalter oben
 * rechts laedt die Seite mit ?lang=en neu. Diese Suite sucht nicht nach Uebersetzungsqualitaet -
 * die beurteilt ein Mensch. Sie sucht nach den Fehlern, die man beim Lesen uebersieht:
 *
 *  1. FEHLENDE EINTRAEGE. Was im Woerterbuch fehlt, erscheint englisch als deutscher Text. Die
 *     Seite sammelt das selbst in window.i18nFehlt — hier wird es ausgelesen und bewertet.
 *  2. INTERNE SCHLUESSEL, DIE UEBERSETZT WURDEN. Die Herkunfts-Klassen (belegt/Faustregel/
 *     Meinung) sind Schluessel von CERTCOL und der Zaehler in grpSrc() UND Anzeigetext. Wer sie
 *     uebersetzt, bekommt "undefined" in der Oberflaeche. Das passiert lautlos.
 *  3. DEUTSCHE RESTE in sichtbarem Text.
 *  4. ZERBROCHENE RECHNUNG. Uebersetzt wird Text, nicht Logik: die Zahlen muessen in beiden
 *     Sprachen aufs Euro gleich sein.
 *
 * Start:  node tests/rechner/englische-fassung.test.js
 */
const path = require('path');
const { chromium, REPO, reporter } = require('./lib/harness');

const DATEI = path.join(REPO, 'visual-standards-rechner.html');
const R = reporter('englische-fassung');
const ok = R.ok, watch = R.watch;

(async () => {
  const b = await chromium.launch();

  /* Sprache kommt aus ?lang=; falls eine Umgebung Parameter an file://-Adressen verschluckt,
     greift der zweite Weg ueber den Browser-Speicher, den der Umschalter ebenfalls setzt. */
  const load = async (lang) => {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    watch(p);
    await p.goto('file://' + DATEI + '?lang=' + lang, { waitUntil: 'load' });
    const ist = await p.evaluate(() => LANG);
    if (ist !== lang) {
      await p.evaluate(l => localStorage.setItem('vsr-lang', l), lang);
      await p.reload({ waitUntil: 'load' });
    }
    await p.evaluate(() => { const x = document.getElementById('wiz-skip'); if (x) x.click(); });
    await p.waitForTimeout(700);
    return p;
  };

  const en = await load('en');
  ok('Seite laeuft auf Englisch', await en.evaluate(() => LANG === 'en' && ENG === true));

  /* ---------- 1) Was fehlt im Woerterbuch? ---------- */
  await en.evaluate(() => { setLevel(3); update(); });
  await en.waitForTimeout(700);
  const fehlt = await en.evaluate(() => window.i18nFehlt.slice());
  /* Begriffe, die in beiden Sprachen gleich heissen, stehen absichtlich nicht im Woerterbuch. */
  const gleich = /^(markup|attr \w+) \| (Deneb|Details|Presets:|Enterprise BI|Managed Self-Service|Self-Service|functions\.tmdl|AppSource|P10 \/ P50 \/ P90|PERT|MoSCoW|P50 · in €|Microsoft Learn.*|ChartKitchen byDatenWG|Core \+ SVG|Markdown)$/;
  const echtFehlend = fehlt.filter(s => !gleich.test(s));
  ok('kein Text ohne Woerterbuch-Eintrag', echtFehlend.length === 0,
     echtFehlend.length ? echtFehlend.slice(0, 5).join(' | ') : (fehlt.length + ' bewusst gleich'));

  /* ---------- 2) undefined / NaN: interne Schluessel ---------- */
  for (const lv of [1, 2, 3]) {
    await en.evaluate(l => setLevel(l), lv);
    await en.waitForTimeout(600);
    const txt = await en.evaluate(() => document.body.innerText);
    const undef = (txt.match(/undefined/g) || []).length;
    const nan = (txt.match(/\bNaN\b/g) || []).length;
    ok('Level ' + lv + ': kein "undefined" im sichtbaren Text', undef === 0, undef + ' Treffer');
    ok('Level ' + lv + ': kein "NaN" im sichtbaren Text', nan === 0, nan + ' Treffer');
  }

  await en.evaluate(() => setLevel(2));
  await en.waitForTimeout(500);
  const cert = await en.evaluate(() => {
    const el = document.getElementById('certainty');
    return el ? el.innerText.replace(/\s+/g, ' ').slice(0, 300) : null;
  });
  ok('Evidence bar rendert mit Werten', !!cert && !/undefined|NaN/.test(cert), cert ? cert.slice(0, 120) : 'fehlt');

  /* Die Herkunfts-Klassen bleiben intern deutsch und werden erst bei der Anzeige uebersetzt. */
  const herkunft = await en.evaluate(() => ({
    intern: typeof SRC_CLASS === 'object' ? Object.values(SRC_CLASS) : [],
    angezeigt: [...document.querySelectorAll('.badge.w')].map(b => b.textContent),
  }));
  ok('Herkunfts-Klassen bleiben intern deutsch',
     herkunft.intern.every(v => ['belegt', 'Faustregel', 'Meinung'].includes(v)),
     herkunft.intern.join(', '));
  ok('Herkunfts-Klassen erscheinen englisch',
     herkunft.angezeigt.length > 0 && herkunft.angezeigt.every(v => /evidenced|rule of thumb|opinion|quote/.test(v)),
     herkunft.angezeigt.slice(0, 4).join(', '));

  /* ---------- 3) Deutsche Reste im sichtbaren Text ---------- */
  const ERLAUBT = /Daten-WG|ChartKitchen|byDatenWG|BetrVG|EStG|HGB|UStG|Robert Half|TU München|Freelancer-Kompass|WSI|KPMG|Kompass|für Controlling und Finance/;
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
        const i = t.search(/[äöüÄÖÜß]/);
        out.push({ voll: t, stelle: t.slice(Math.max(0, i - 30), i + 30) });
      }
      return out;
    });
    const echte = treffer.filter(x => !ERLAUBT.test(x.voll)).map(x => x.stelle);
    ok('Level ' + lv + ': keine deutschen Umlaute im sichtbaren Text (ausser Eigennamen)',
       echte.length === 0, echte.length ? echte.slice(0, 3).join(' | ') : 'sauber');
  }

  /* Die Monte-Carlo-Seite ist ein eigenes HTML-Dokument aus einem Template — eigener Pruefpunkt,
     weil sie nie im Seitenbaum haengt und von den Pruefungen oben nicht erfasst wird. */
  const mc = await en.evaluate(() => {
    const h = buildMcHtml(runMonteCarlo());
    const txt = h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
    return { lang: (h.match(/<html lang="(\w+)"/) || [])[1], cdn: /fonts\.googleapis|cdnjs|unpkg|jsdelivr/.test(h),
             umlaute: (txt.match(/[^\s]{0,25}[äöüÄÖÜß][^\s]{0,25}/g) || []).filter(s => !/Daten-WG|München/.test(s)) };
  });
  ok('Monte-Carlo-Seite traegt lang="en"', mc.lang === 'en', String(mc.lang));
  ok('Monte-Carlo-Seite ohne Fremd-CDN', mc.cdn === false);
  ok('Monte-Carlo-Seite ohne deutsche Reste', mc.umlaute.length === 0, mc.umlaute.slice(0, 3).join(' | ') || 'sauber');

  /* ---------- 4) Die Rechnung ist unveraendert ---------- */
  const de = await load('de');
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
  ok('deutsche Fassung meldet nichts Fehlendes', await de.evaluate(() => window.i18nFehlt.length === 0));

  /* ---------- 5) Sprache und Zahlenformat ---------- */
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

  const metaDe = await de.evaluate(() => ({
    lang: document.documentElement.lang,
    eur: fmtEur(1500) + ' · ' + fmtEur(2400000),
    n: fmtN(1500),
  }));
  ok('deutsche Fassung unveraendert formatiert', metaDe.lang === 'de' && metaDe.n === '1.500'
     && /^1\.500 €/.test(metaDe.eur), metaDe.eur + ' / ' + metaDe.n);

  /* ---------- 6) Der Umschalter ---------- */
  const knoepfe = await de.evaluate(() => [...document.querySelectorAll('.lang-btn')]
    .map(b => b.dataset.lang + (b.classList.contains('active') ? '*' : '')));
  ok('Umschalter zeigt beide Sprachen, deutsch aktiv', knoepfe.join(',') === 'de*,en', knoepfe.join(','));
  /* Umschalten schreibt die Eingaben vorher in die Adresse — sonst waeren sie nach dem
     Neuladen weg. Geprueft wird der Zustand, nicht das Neuladen selbst. */
  const vorher = await de.evaluate(() => { S.viewers = 123; update(); return location.hash.length > 20; });
  ok('Eingaben stehen vor dem Umschalten in der Adresse', vorher === true);
  const gemerkt = await de.evaluate(() => {
    document.getElementById('lang-en').click();
    return localStorage.getItem('vsr-lang');
  });
  ok('Umschalter merkt die Wahl', gemerkt === 'en', String(gemerkt));

  /* ---------- 7) Die Struktur traegt: Sprungziele und Testanker existieren ---------- */
  const anker = await en.evaluate(() => ['s0', 's-map', 's1', 's5', 's-grenzen', 'd-s6', 'd-anhang',
    'headline', 'certainty', 'rclasses', 'decision-path', 'toc-list', 'graph-svg']
    .filter(id => !document.getElementById(id)));
  ok('alle Anker-IDs vorhanden (Selektoren unveraendert)', anker.length === 0, anker.join(', ') || 'vollstaendig');

  await de.close(); await en.close();
  await R.finish(b);
})();
