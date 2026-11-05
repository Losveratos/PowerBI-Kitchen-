/* Runde 3 · A2 „Leser“ — Stimmen Saetze, Zahlen und Entscheidungslogik zusammen?
   Prueft NUR, aendert nichts an der Seite. Fuenf Presets, beide Sprachen:
     1  Ergebnissatz (#headline) gegen KPI-Karten und Kostentabelle
     2  K.O.-Block gegen evaluate().ko
     3  Break-even-Satz (#be-insight) gegen licenseBreakEven(), Sonderfaelle (Paid K.O., kein Stunden-Ansatz, Site, Angebot)
     4  Entscheidungspfad (sieben Knoten) gegen S / expected(); statische Zahlen des Entscheidungsbaums nachgerechnet
     5  Sicherheits-Leiste: Anteile summieren sich, Zahlen an drei Stellen gleich
     6  Satz in Ebene 1 (#ov-sentence) gegen Ebene 2
     7  Gefuehrter Einstieg: sieben Schritte, Zwischenstand = Ebene 2, Sprachwechsel mitten im Einstieg
     8  Englisch: gleiche Zahlen, en-GB-Format, keine deutschen Reste
     9  Rohtexte fuer die Lesbarkeits-Durchsicht nach .artifacts/a2-leser/
   Start:  node sessions/visual-standards-rechner-audit/runde3/a2-leser.test.js */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium, URL: U, artifactDir, waitStable, skipWizard, reporter } =
  require(path.join(__dirname, '..', '..', '..', 'tests', 'rechner', 'lib', 'harness'));
const DIR = artifactDir('a2-leser');
const R = reporter('a2-leser');
const ok = R.ok, watch = R.watch;
const PRESETS = ['pilot', 'mittelstand', 'konzern', 'rs', 'gross'];
const KEYS = ['paid', 'oss', 'deneb', 'core'];
const dump = {};                                      /* alles, was der Bericht zitiert */

/* Zahl aus einem lokalisierten Text: de "1.234,5" / en "1,234.5" */
const num = (s, lang) => {
  if (s === undefined || s === null) return NaN;
  s = String(s).replace(/ /g, ' ').trim();
  return lang === 'en' ? parseFloat(s.replace(/,/g, '')) : parseFloat(s.replace(/\./g, '').replace(',', '.'));
};
const rel = (a, b) => Math.abs(a - b) / Math.max(1, Math.abs(b));

/* Momentaufnahme aus der Seite: Zustand, Rechenwerte und die sichtbaren Texte */
const SNAP = `(() => {
  const qk = 'p' + S.riskQ;
  const T = id => { const e = document.getElementById(id); return e ? e.innerText.replace(/\\s+/g, ' ').trim() : ''; };
  const o = {};
  o.lang = LANG; o.eng = ENG;
  o.S = { level: S.level, creators: S.creators, viewers: S.viewers, horizon: S.horizon, riskQ: S.riskQ, weight: S.weight, lib: !!S.lib,
    mix: S.mix.slice(), rc: S.rc.sh.slice(), flags: Object.keys(S.flags).filter(k => S.flags[k]), ssShare: S.ssShare,
    ibcsAll: !!S.ibcsAll, licModel: S.licModel, lic: S.p.paid.lic.slice(), per: S.per, view: S.view };
  o.flagLabels = {}; FLAGS.forEach(f => o.flagLabels[f.id] = { label: f.label, modifier: !!f.modifier });
  o.names = {}; OPTS.forEach(x => o.names[x.key] = { name: x.name, short: x.short, tag: x.tag });
  o.sim = {}; o.fmt = {};
  o.perDiv = perDivisor();
  OPTS.forEach(x => { const s = lastSim[x.key]; const c = certSplit(s);
    o.sim[x.key] = { p10: s.p10, p50: s.p50, p90: s.p90, q: s[qk], vAvg: s.vAvg, exTotal: s.ex.total, indep: s.ex.indep,
      ibcsCheck: s.ex.ibcsCheck, variantEff: s.ex.variantEff, owners: s.owners, cert: { b: c.b, f: c.f, e: c.e },
      hoursInt: s.ex.hoursInt, firstReportH: s.firstReportH };
    o.fmt[x.key] = { q: fmtEur(s[qk]), p10: fmtEur(s.p10), p90: fmtEur(s.p90), p50: fmtEur(s.p50), per: fmtEur(s[qk] / o.perDiv),
      spread: fmtN(s.p90 / Math.max(s.p10, 1), 1) }; });
  o.ev = {}; OPTS.forEach(x => o.ev[x.key] = { ko: lastEv[x.key].ko.slice(), warn: lastEv[x.key].warn.length,
    score: lastEv[x.key].scorePct, unchecked: lastEv[x.key].unchecked || 0 });
  o.be = licenseBreakEven(); o.hk = licenseBreakEvenHourKeys(); o.lastBE = lastBreakEven;
  o.owners = ownersOf(); o.ratio = Math.round(S.viewers / Math.max(1, S.creators));
  o.rank = lastRank.map(x => x.key); o.costOrder = lastCostOrder.map(x => x.key); o.costPlace = lastCostPlace.slice();
  o.excluded = lastExcluded.map(x => x.key);
  o.musts = allReqs().filter(r => S.prio[r.id] === 'M').map(r => r.name);
  o.rcShares = rcShares();
  o.mode = modeParams().label;
  o.anchorWin = lastAnchorWin;
  o.offer = activeOffer() ? { label: offerLabel(activeOffer()), price: offerPrice(activeOffer()), model: activeOffer().model } : null;
  o.i18nFehlt = window.i18nFehlt.slice();
  if (o.rank.length) { const b = o.rank[0];
    const allowed = OPTS.filter(x => lastEv[x.key].ko.length === 0);
    const bs = allowed.slice().sort((x, y) => lastEv[y.key].scorePct - lastEv[x.key].scorePct)[0];
    if (bs && bs.key !== b) { const d = lastSim[bs.key][qk] - lastSim[b][qk], ds = lastEv[bs.key].scorePct - lastEv[b].scorePct;
      o.bestScore = { key: bs.key, d: d, dFmt: fmtEur(Math.abs(d)), perPoint: (ds > 0 && d > 0) ? fmtEur(d / ds) : null }; }
    o.koDiff = {}; o.excluded.forEach(k => { const d = lastSim[k][qk] - lastSim[b][qk]; o.koDiff[k] = { d: d, f: fmtEur(Math.abs(d)) }; });
  }
  o.txt = { headline: T('headline'), conflict: T('conflict-box'), ko: T('ko-block'), be: T('be-insight'), cert: T('certainty'),
    rclasses: T('rclasses'), ov: T('ov-sentence'), ovcert: T('ov-cert'), ovdrivers: T('ov-drivers'), table: T('res-table'),
    nulloption: T('nulloption'), premise: T('premise'), sticky: T('sticky-value'), footer: T('footer'), footerAll: (document.getElementById('footer') || {}).textContent || '', hist: (document.querySelector('#footer .foot-hist-list') || {}).textContent || '', treeHint: (document.querySelector('#d-tree .hint') || {}).innerText || '' };
  o.kpi = [...document.querySelectorAll('#kpi-allowed .kpi')].map(k => ({ rank: k.querySelector('.rank').textContent,
    name: k.querySelector('.name').textContent, big: k.querySelector('.big').textContent, range: k.querySelector('.range').textContent,
    per: [...k.querySelectorAll('.per')].map(p => p.textContent).join(' | ') }));
  o.koCards = [...document.querySelectorAll('#ko-block .kpi .name')].map(n => n.textContent);
  o.koItems = [...document.querySelectorAll('#ko-block .ko-list li')].map(li => li.innerText.replace(/\\s+/g, ' ').trim());
  o.dp = [...document.querySelectorAll('#decision-path .dp-row')].map(r => ({ t: r.querySelector('.dp-t').textContent,
    s: r.querySelector('.dp-s').innerText.replace(/\\s+/g, ' ').trim(),
    chips: [...r.querySelectorAll('.dp-chip')].map(c => ({ t: c.textContent, m: c.className.replace('dp-chip', '').trim() })),
    badge: (r.querySelector('.dp-b .badge') || {}).textContent, badgeT: (r.querySelector('.dp-b .badge') || {}).title }));
  o.dpHead = (document.querySelector('#decision-path h3') || {}).innerText || '';
  o.certRows = [...document.querySelectorAll('#certainty .cert-row')].map(r => ({ name: r.querySelector('.cr-name').textContent,
    segs: [...r.querySelectorAll('.cert-bar i')].map(i => ({ cls: i.className, title: i.title, txt: i.textContent })) }));
  o.tableRows = [...document.querySelectorAll('#res-table tr')].map(tr => [...tr.children].map(td => td.innerText.replace(/\\s+/g, ' ').trim()));
  o.versions = (document.body.innerText.match(/\\bv0\\.\\d+\\b/g) || []).reduce((a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {});
  return o;
})()`;

/* Nackte Kipp-Punkte, unabhaengig von K.O.: kleinste Viewer-Zahl, ab der Paid (Erwartungswert) teurer ist als
   der jeweilige Stunden-Ansatz; ausserdem gegen den guenstigsten der drei. Feines Raster bis 20.000. */
const TIPS_SRC = `(({ licKey, lib }) => {
  const sv = S.viewers, sl = S.lib, slic = S.p.paid.lic;
  S.lib = lib; S.p.paid.lic = LIC[licKey].slice();
  const grid = []; for (let v = 1; v <= 60; v++) grid.push(v); for (let v = 65; v <= 20000; v = Math.round(v * 1.04 + 1)) grid.push(v); grid.push(20000);
  const keys = ['oss', 'deneb', 'core']; const res = {}; const prev = {};
  keys.concat(['min']).forEach(k => res[k] = null);
  for (const v of grid) { S.viewers = v; const pt = expected('paid').total; const t = {}; keys.forEach(k => t[k] = expected(k).total); t.min = Math.min(t.oss, t.deneb, t.core);
    for (const k of keys.concat(['min'])) { if (res[k] !== null) continue; const d = pt - t[k];
      if (prev[k] && prev[k].d <= 0 && d > 0) res[k] = Math.round(prev[k].v + (v - prev[k].v) * (-prev[k].d) / (d - prev[k].d));
      else if (!prev[k] && d > 0) res[k] = v;
      prev[k] = { v, d }; } }
  S.viewers = sv; S.lib = sl; S.p.paid.lic = slic;
  return { be: res, ratio: Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v === null ? null : Math.round(10 * v / Math.max(1, S.creators)) / 10])), creators: S.creators };
})`;
/* Playwright wertet eine Zeichenkette als Ausdruck aus und ruft sie nicht auf; als echte Funktion wird sie mit Argument gerufen. */
const TIPS = new Function('a', 'return ' + TIPS_SRC + '(a)');

(async () => {
  const b = await chromium.launch();
  const open = async (lang, tag) => {
    const p = watch(await b.newPage({ viewport: { width: 1280, height: 900 } }), tag);
    await p.goto(U + (lang === 'en' ? '?lang=en' : ''), { waitUntil: 'load' });
    await p.waitForTimeout(900);
    if (await p.evaluate(() => LANG) !== lang) { await p.evaluate(l => localStorage.setItem('vsr-lang', l), lang); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900); }
    return p;
  };
  const preset = async (p, k) => { await p.click('.preset-row [data-preset="' + k + '"]'); await p.waitForTimeout(1400); await waitStable(p); };
  const snap = p => p.evaluate(SNAP);

  const first = {};   /* DE-Zahlen je Preset, fuer den Vergleich mit EN */
  for (const lang of ['de', 'en']) {
    const p = await open(lang, lang);
    await skipWizard(p);
    await p.evaluate(() => setLevel(3, false)); await p.waitForTimeout(400);
    dump[lang] = {};
    for (const pk of PRESETS) {
      await preset(p, pk);
      const o = await snap(p);
      dump[lang][pk] = o;
      const H = '[' + lang + '/' + pk + '] ';
      const best = o.rank[0];
      const Q = o.S.riskQ;

      /* ---------- 1 · Ergebnissatz gegen KPI und Tabelle ---------- */
      if (!best) { ok(H + '1 Headline: alle vier ausgeschlossen benannt', /ausgeschlossen|excluded/.test(o.txt.headline)); }
      else {
        const hl = o.txt.headline, f = o.fmt[best];
        ok(H + '1 Headline nennt Gesamtkosten des Erstplatzierten (' + f.q + ')', hl.includes(f.q), hl.slice(0, 160));
        ok(H + '1 Headline nennt P10 und P90 (' + f.p10 + ' / ' + f.p90 + ')', hl.includes(f.p10) && hl.includes(f.p90));
        ok(H + '1 Headline nennt Kosten je Viewer (' + f.per + ')', hl.includes(f.per));
        ok(H + '1 Headline nennt Horizont ' + o.S.horizon, new RegExp('\\b' + o.S.horizon + '\\b').test(hl));
        ok(H + '1 Headline nennt Score ' + o.ev[best].score + ' %', new RegExp(o.ev[best].score + '\\s?%').test(hl));
        const m = hl.match(lang === 'en' ? /P90 is ([\d.,]+)×/ : /P90 ist das ([\d.,]+)-fache/);
        const spread = o.sim[best].p90 / Math.max(1, o.sim[best].p10);
        ok(H + '1 Spannweite P90/P10 im Satz = ' + spread.toFixed(2), !!m && Math.abs(num(m[1], lang) - spread) < 0.06, m ? m[1] : 'kein Treffer');
        ok(H + '1 Spannweite-Warnung „hoch“ nur bei > 2,5', (/hoch|high/.test((hl.match(/P90 (ist das|is) .{0,24}P10[^)]{0,40}/) || [''])[0])) === (spread > 2.5));
        /* KPI-Karte des Erstplatzierten */
        const k0 = o.kpi[0];
        ok(H + '1 KPI-Karte 1 zeigt denselben Betrag', !!k0 && k0.big.startsWith(f.q) && k0.name === o.names[best].name, k0 ? k0.big : '-');
        ok(H + '1 KPI-Karte 1: P10–P90 und je Viewer gleich', !!k0 && k0.range.includes(f.p10) && k0.range.includes(f.p90) && k0.per.includes(f.per));
        /* Tabelle */
        const tot = o.tableRows.find(r => /Gesamt über|Total over/.test(r[0]));
        ok(H + '1 Tabelle: Gesamt P50 = KPI/Headline', !!tot && tot.slice(1).includes(o.fmt[best].p50), tot ? tot.join(' | ') : '-');
        const sp = o.tableRows.find(r => /Spanne|Range/.test(r[0]));
        ok(H + '1 Tabelle: Spanne P10–P90 wie im Satz', !!sp && sp.some(c => c.includes(f.p10) && c.includes(f.p90)));
        /* bestScore-Nebensatz */
        if (o.bestScore) ok(H + '1 Nebensatz „erfüllt Anforderungen am besten“: Preis ' + o.bestScore.dFmt + ' stimmt',
          hl.includes(o.names[o.bestScore.key].name) && hl.includes(o.bestScore.dFmt) && (!o.bestScore.perPoint || hl.includes(o.bestScore.perPoint)));
        /* Gleichstand-Hinweis <-> Rang-Etikett */
        const tie = o.kpi.length > 1 && o.kpi[0].rank === o.kpi[1].rank;
        ok(H + '1 „statistisch nicht unterscheidbar“ genau dann, wenn Karte 1 und 2 denselben Platz tragen', /nicht unterscheidbar|cannot be told apart/.test(hl) === tie, o.kpi.map(k => k.rank).join(' / '));
        ok(H + '1 Vorlagen-Bauer „' + o.owners + ' von ' + o.S.creators + '“ im Satz', new RegExp('\\b' + o.owners + '\\b[^.]*\\b' + o.S.creators + '\\b').test(hl.slice(-220)));
        ok(H + '1 Warnungen-Zahl im Satz = evaluate().warn', (o.ev[best].warn > 0) === new RegExp('\\b' + o.ev[best].warn + ' (Warnung|warning)').test(hl));
      }

      /* ---------- 2 · K.O.-Block ---------- */
      const exp = { pilot: [], mittelstand: [], konzern: ['oss'], rs: ['paid', 'oss'], gross: ['oss'] }[pk];
      ok(H + '2 Ausgeschlossen = evaluate().ko.length>0 (' + o.excluded.join(',') + ')', o.excluded.join() === exp.join(), o.excluded.join());
      ok(H + '2 K.O.-Karten = ausgeschlossene Ansätze', o.koCards.join('|') === o.excluded.map(k => o.names[k].name).join('|'), o.koCards.join('|'));
      o.excluded.forEach(k => {
        const li = o.koItems.find(x => x.startsWith(o.names[k].name));
        const reasons = o.ev[k].ko.map(s => s.replace(/<[^>]+>/g, ''));
        ok(H + '2 Begründung ' + k + ' = K.O.-Gründe aus evaluate()', !!li && reasons.every(r => li.includes(r)), li ? li.slice(0, 160) : '-');
        if (best) ok(H + '2 „wäre … günstiger/teurer“ ' + k + ' = ' + o.koDiff[k].f, !!li && li.includes(o.koDiff[k].f) && (o.koDiff[k].d < 0 ? /günstiger|cheaper/ : /teurer|more expensive/).test(li));
      });
      /* passen die Gruende zu den Flags? */
      if (pk === 'konzern' || pk === 'gross') ok(H + '2 OSS-Grund nennt „zertifiziert“', /zertifiziert|certified/i.test(o.ev.oss.ko.join(' ')), o.ev.oss.ko.join(' | ').slice(0, 140));
      if (pk === 'rs') ok(H + '2 Paid-Grund nennt den Report Server', /Report Server/.test(o.ev.paid.ko.join(' ')), o.ev.paid.ko.join(' | ').slice(0, 140));

      /* ---------- 3 · Break-even-Satz ---------- */
      {
        const be = o.txt.be;
        const nums = [...be.matchAll(lang === 'en' ? /\(from ([\d,]+)/g : /\(ab ([\d.]+)/g)].map(m => num(m[1], lang));
        const paidKO = o.ev.paid.ko.length > 0;
        ok(H + '3 Paid-K.O.-Vorbehalt steht genau dann am Anfang, wenn Paid K.O. ist', paidKO === /^(Paid ist aktuell durch K\.O\.|Paid is currently knocked out)/.test(be), be.slice(0, 90));
        if (o.hk.length && o.be !== null) {
          const mn = nums.length ? Math.min(...nums) : null;
          ok(H + '3 kleinster Schnittpunkt im Satz ≈ licenseBreakEven() ' + o.be, mn !== null && rel(mn, o.be) < 0.15, 'Satz ' + nums.join('/') + ' · Funktion ' + o.be);
        } else if (o.hk.length && o.be === null) {
          ok(H + '3 ohne Kipp-Punkt bis 20.000 nennt der Satz keinen „ab N“', nums.length === 0 || /jenseits|beyond/.test(be), be.slice(0, 200));
        }
        ok(H + '3 Satz hat eine Verhandlungsgrenze', /(Verhandlungsgrenze|Negotiation ceiling)[^.]*\d/.test(be), (be.match(/(Verhandlungsgrenze|Negotiation ceiling).{0,120}/) || [''])[0]);
        if (o.S.licModel === 'site') ok(H + '3 Site-Lizenz: Grenze „umgerechnet je Nutzer“ gekennzeichnet', /umgerechnet|converted to a per-user/.test(be), (be.match(/(Verhandlungsgrenze|Negotiation ceiling).{0,160}/) || [''])[0]);
        dump[lang][pk].beNums = nums;
      }

      /* ---------- 4 · Entscheidungspfad ---------- */
      {
        ok(H + '4 sieben Knoten', o.dp.length === 7, o.dp.map(r => r.t).join(' › '));
        const n3 = o.dp[2] || { s: '' }, n4 = o.dp[3] || { s: '' }, n6 = o.dp[5] || { s: '' }, n7 = o.dp[6] || { s: '' }, n1 = o.dp[0] || { s: '', chips: [] }, n2 = o.dp[1] || { s: '' }, n5 = o.dp[4] || { s: '' };
        const r3 = n3.s.match(/1 : ([\d.,]+)/);
        ok(H + '4 Knoten 3: Verhältnis 1 : ' + o.ratio, !!r3 && num(r3[1], lang) === o.ratio, r3 ? r3[0] : n3.s.slice(0, 60));
        if (o.be !== null) {
          const kb = n3.s.match(lang === 'en' ? /at about ([\d,]+) viewers/ : /bei etwa ([\d.]+) Viewern/);
          ok(H + '4 Knoten 3: Kipp-Punkt ' + o.be + ' = licenseBreakEven()', !!kb && num(kb[1], lang) === o.be, kb ? kb[0] : n3.s.slice(0, 120));
          const above = o.S.viewers >= o.be;
          ok(H + '4 Knoten 3: „darüber/darunter“ passt zu Viewern ' + o.S.viewers, above === /darüber|above/.test(n3.s) && !above === /darunter|below/.test(n3.s));
        } else ok(H + '4 Knoten 3: ohne Kipp-Punkt der richtige Satz', o.hk.length ? /20.000|20,000/.test(n3.s) : /Kein Kipp-Punkt|No tipping point/.test(n3.s), n3.s.slice(0, 120));
        ok(H + '4 Knoten 3: Chart-Mix ' + o.S.mix.join('/'), n3.s.includes(o.S.mix.join(' / ')));
        /* Chip in Knoten 3: wer liegt vorn */
        {
          const lead = n3.chips.find(c => /lead/.test(c.m));
          const hourBest = o.hk.slice().sort((a, b2) => o.sim[a].q - o.sim[b2].q)[0];
          const above = o.be !== null && o.S.viewers >= o.be;
          const want = (above && hourBest) ? o.names[hourBest].short : (o.ev.paid.ko.length === 0 ? 'Paid' : (hourBest ? o.names[hourBest].short : null));
          ok(H + '4 Knoten 3: Chip „vorn“ = ' + want, (!!lead ? lead.t : null) === want, lead ? lead.t : '-');
        }
        const need = Math.round(100 * (o.rcShares[1] + o.rcShares[2]));
        ok(H + '4 Knoten 4: ' + need + ' % brauchen IBCS-Grafik', new RegExp('^' + need + '\\s?%').test(n4.s), n4.s.slice(0, 80));
        ok(H + '4 Knoten 4: Horizont ' + o.S.horizon + ' genannt', new RegExp('\\b' + o.S.horizon + ' (Jahre|years)').test(n4.s));
        ok(H + '4 Knoten 6: ' + o.owners + ' von ' + o.S.creators + ' Erstellern, Self-Service ' + o.S.ssShare + ' %', new RegExp(o.S.ssShare + '\\s?%').test(n6.s) && new RegExp('\\b' + o.owners + ' (von|of) ' + o.S.creators.toLocaleString(lang === 'en' ? 'en-GB' : 'de-DE')).test(n6.s), n6.s.slice(0, 120));
        ok(H + '4 Knoten 6: Betriebsmodell „' + o.mode + '“', n6.s.startsWith(o.mode));
        /* Knoten 7: Rangfolge nach Kosten mit Betraegen */
        ok(H + '4 Knoten 7: alle zulässigen Beträge genannt', o.costOrder.every(k => n7.s.includes(o.fmt[k].q)), n7.s.slice(0, 160));
        if (o.costOrder.length) {
          const c0 = o.costOrder[0], cs = o.sim[c0].cert;
          const pb = n7.s.match(/([\d]+)\s?% (der|of the) /);
          ok(H + '4 Knoten 7: „' + Math.round(100 * cs.b) + ' % belegt“ = certSplit', !!pb && +pb[1] === Math.round(100 * cs.b), pb ? pb[0] : '-');
          const bt = n7.badgeT || '';
          const pcts = [...bt.matchAll(/(\d+)\s?%/g)].map(m => +m[1]);
          ok(H + '4 Knoten 7: Badge-Anteile ' + pcts.join('/') + ' summieren auf 100', pcts.length === 3 && Math.abs(pcts.reduce((a, c) => a + c, 0) - 100) <= 1, bt.slice(0, 120));
          ok(H + '4 Knoten 7: Badge-Anteile = Sicherheits-Leiste', pcts[0] === Math.round(100 * cs.b) && pcts[1] === Math.round(100 * cs.f) && pcts[2] === Math.round(100 * cs.e));
          ok(H + '4 Knoten 7: Chip „vorn“ = ' + o.names[c0].short, (n7.chips[0] || {}).t === o.names[c0].short);
        }
        /* Knoten 1: Flags und raus-Chips */
        const act = o.S.flags.filter(k => !o.flagLabels[k].modifier);
        ok(H + '4 Knoten 1: aktive Red Flags genannt (' + act.join(',') + ')', act.every(k => n1.s.includes(o.flagLabels[k].label)) && (act.length > 0 || /Keine Red Flag|No red flag/.test(n1.s)), n1.s.slice(0, 120));
        const outByFlag = KEYS.filter(k => o.ev[k].ko.some(s => !/^Must /.test(s)));
        ok(H + '4 Knoten 1: „raus“-Chips = ' + outByFlag.join(','), n1.chips.filter(c => /out/.test(c.m)).map(c => c.t).join() === outByFlag.map(k => o.names[k].short).join(), n1.chips.map(c => c.t + ':' + c.m).join(' '));
        /* Knoten 2: Must-Zahl */
        ok(H + '4 Knoten 2: ' + o.musts.length + ' Must(s)', o.musts.length ? new RegExp('^' + o.musts.length + ' ').test(n2.s) : /Kein Kriterium|No criterion/.test(n2.s), n2.s.slice(0, 80));
        /* Knoten 5: Anker-Vergleich = lastAnchorWin, Lib-Status */
        if (o.anchorWin) ok(H + '4 Knoten 5: Anker-Zellen = lastAnchorWin', o.anchorWin[0].every(w => n5.s.includes(w)) && n5.s.includes(o.S.lib ? (lang === 'en' ? 'library on' : 'Bibliothek an') : (lang === 'en' ? 'library off' : 'Bibliothek aus')), n5.s.slice(0, 160));
        ok(H + '4 Kopf nennt Entscheidungsgröße P' + Q, o.dpHead.includes('P' + Q));
      }

      /* ---------- 5 · Sicherheits-Leiste ---------- */
      {
        ok(H + '5 Leiste hat vier Zeilen in Reihenfolge der Rangfolge+K.O.', o.certRows.map(r => r.name).join('|') === o.costOrder.concat(o.excluded).map(k => o.names[k].short).join('|') || o.certRows.map(r => r.name).join('|') === o.rank.concat(o.excluded).map(k => o.names[k].short).join('|'), o.certRows.map(r => r.name).join('|'));
        o.certRows.forEach(r => {
          const key = KEYS.find(k => o.names[k].short === r.name);
          const pct = r.segs.map(s => +((s.title.match(/(\d+)\s?%/) || [])[1]));
          const sum = pct.reduce((a, c) => a + c, 0);
          ok(H + '5 ' + r.name + ': Tooltips ' + pct.join('/') + ' summieren auf 100 (±2)', Math.abs(sum - 100) <= 2, r.segs.map(s => s.title).join(' · '));
          if (key) { const c = o.sim[key].cert; const want = [c.b, c.f, c.e].filter(v => v > 0.001).map(v => Math.round(v * 100));
            ok(H + '5 ' + r.name + ': Tooltips = certSplit (' + want.join('/') + ')', pct.join() === want.join(), pct.join()); }
          /* Beschriftung im Segment nur ab 9 %, dann gleich dem Tooltip */
          ok(H + '5 ' + r.name + ': Segmentbeschriftung = Tooltip', r.segs.every(s => !s.txt.trim() || s.title.includes(s.txt.trim())));
        });
      }

      /* ---------- 6 · Satz in Ebene 1 gegen Ebene 2 ---------- */
      {
        const ov = o.txt.ov;
        if (o.costOrder.length) {
          const c0 = o.costOrder[0];
          const per = o.sim[c0].q / Math.max(1, o.sim[c0].vAvg * o.S.horizon);
          const m = ov.match(lang === 'en' ? /around €([\d,]+) per viewer/ : /rund ([\d.]+) € je Viewer/);
          ok(H + '6 Ebene 1: „rund N € je Viewer und Jahr“ = Kosten/(Viewer·Jahre) = ' + Math.round(per), !!m && num(m[1], lang) === Math.round(per), m ? m[0] : ov.slice(0, 120));
          ok(H + '6 Ebene 1 nennt denselben Ansatz wie Knoten 7 (' + o.names[c0].short + ')', ov.includes(o.names[c0].short));
          /* gleiche Zahl wie KPI-Karte (dort auf zwei Stellen gerundet) */
          const kp = o.kpi.find(k => k.name === o.names[c0].name);
          const kpm = kp ? kp.per.match(lang === 'en' ? /€([\d,.]+)(m)?/ : /([\d.,]+)( Mio\.)? €/) : null; const kv = kpm ? num(kpm[1], lang) * (kpm[2] ? 1e6 : 1) : NaN;
          ok(H + '6 Ebene 2 (KPI je Viewer) ≈ Ebene 1 (±5 % Rundung)', isFinite(kv) && rel(kv, per) <= 0.055, 'KPI ' + (kp ? kp.per.slice(0, 40) : '-') + ' · Ebene 1 ' + Math.round(per));
          ok(H + '6 Divisor Ebene 1 (vAvg·H) = Divisor Ebene 2 (perDivisor)', rel(o.sim[c0].vAvg * o.S.horizon, o.perDiv) < 0.001, (o.sim[c0].vAvg * o.S.horizon).toFixed(1) + ' vs ' + o.perDiv.toFixed(1));
          /* Faktoren „kostet das X-fache“ */
          const fx = [...ov.matchAll(lang === 'en' ? /(Paid|Open Source|Deneb|Core \+ SVG) costs ([\d.]+) times/g : /(Paid|Open Source|Deneb|Core \+ SVG) kostet das ([\d,]+)-fache/g)];
          fx.forEach(m => { const k = KEYS.find(x => o.names[x].short === m[1]); const f = o.sim[k].q / o.sim[c0].q;
            ok(H + '6 Faktor ' + m[1] + ' ' + m[2] + ' ≈ ' + f.toFixed(2), Math.abs(num(m[2], lang) - f) < 0.06); });
          /* Kipp-Punkt-Satz in Ebene 1 */
          if (o.be !== null && o.be > 10) { const kb = ov.match(lang === 'en' ? /from around ([\d,]+) viewers/i : /ab etwa ([\d.]+) Viewern/i);
            ok(H + '6 Ebene 1: Kipp-Punkt ' + o.be + ' wie Knoten 3', !!kb && num(kb[1], lang) === o.be, kb ? kb[0] : ov.slice(0, 200)); }
          ok(H + '6 Ebene 1: Paid-K.O.-Vorbehalt beim Kipp-Punkt', (o.ev.paid.ko.length > 0) === /ausgeschlossene|excluded/.test(ov.match(/Kipp-Punkt rechnet|tipping point is measured|tipping point/ ) ? ov : ''), '');
          /* Herkunfts-Prozente = Leiste */
          const cs = o.sim[c0].cert;
          const pb = ov.match(lang === 'en' ? /(\d+)\s?% of the .{0,40}? cost rests on evidenced prices, (\d+)\s?%/ : /(\d+)\s?% der .{0,40}?-Kosten beruhen auf belegten Preisen, (\d+)\s?%/);
          ok(H + '6 Ebene 1: belegt/Schätzung ' + Math.round(100 * cs.b) + '/' + Math.round(100 * cs.e) + ' = Leiste', !!pb && +pb[1] === Math.round(100 * cs.b) && +pb[2] === Math.round(100 * cs.e), pb ? pb[0] : ov.slice(-200));
          /* Anker und Bibliothek */
          ok(H + '6 Ebene 1: Anker-Etikett passt zu S.p.paid.lic', ov.includes(o.S.lic[1] + ' €') || ov.includes('€' + o.S.lic[1]), (ov.match(/(Lizenz-Anker|Price anchor)[^.]*/) || [''])[0]);
          ok(H + '6 Ebene 1: Bibliotheks-Status', o.S.lib === /mit Vorlagenbibliothek|with template library/.test(ov));
        }
        ok(H + '6 Ebene 1 nennt Ersteller und Viewer', ov.includes(o.S.creators.toLocaleString(lang === 'en' ? 'en-GB' : 'de-DE')) && ov.includes(o.S.viewers.toLocaleString(lang === 'en' ? 'en-GB' : 'de-DE')));
        ok(H + '6 Ebene 1: Ausgeschlossene benannt', o.excluded.every(k => ov.includes(o.names[k].short)) && ((o.excluded.length > 0) === /ausgeschlossen|excluded/.test(ov.replace(/Kipp-Punkt rechnet gegen die ausgeschlossene|measured against the excluded/g, ''))));
      }

      /* ---------- 9 · Zwei Saetze, eine Groesse: Verhandlungsgrenze (Break-even) gegen Gleichstand (Treiber 2) ---------- */
      {
        const g1 = o.txt.be.match(lang === 'en' ? /up to €?([\d,.]+) per licensed user/ : /bis ([\d.,]+) € je lizenziertem Nutzer/);
        const g2 = o.txt.ovdrivers.match(lang === 'en' ? /Parity with (.+?) at around €([\d,.]+)/ : /Gleichstand mit (.+?) bei etwa ([\d.,]+) €/);
        const a1 = o.txt.be.match(lang === 'en' ? /Negotiation ceiling:<\/b>? against (.+?), paid pays off/ : /Paid rechnet sich gegen (.+?) bis /);
        if (g1 && g2) { const v1 = num(g1[1], lang), v2 = num(g2[2], lang);
          ok(H + '9 Verhandlungsgrenze ' + v1 + ' € (Break-even-Satz) = Gleichstand ' + v2 + ' € (Treiber 2)' + (a1 ? ' · gegen ' + a1[1] + ' / ' + g2[1] : ''), rel(v1, v2) < 0.05, (o.txt.be.match(/(Verhandlungsgrenze|Negotiation ceiling).{0,110}/) || [''])[0] + ' || ' + g2[0]); }
        dump[lang][pk].grenzen = { be: g1 ? g1[1] : null, drivers: g2 ? g2.slice(1) : null };
        if (best) { const m = o.txt.headline.match(lang === 'en' ? /P90 is ([\d.,]+)×/ : /P90 ist das ([\d.,]+)-fache/);
          if (m) ok(H + '9 Spannweiten-Rundung: gezeigte Zahl ' + m[1] + ' und Warnung „hoch“ (> 2,5) widersprechen sich nicht', (num(m[1], lang) > 2.5) === /hoch|high/.test((o.txt.headline.match(/P90 (ist das|is) .{0,24}P10[^)]{0,40}/) || [''])[0]), (o.txt.headline.match(/P90 (ist das|is) .{0,60}/) || [''])[0]); }
      }

      /* ---------- 8 · Englisch: Format und Reste ---------- */
      if (lang === 'de') first[pk] = o;
      else {
        const d = first[pk];
        ok(H + '8 Zahlen wie deutsch (P50 je Ansatz, Kipp-Punkt)', KEYS.every(k => Math.abs(o.sim[k].p50 - d.sim[k].p50) < 0.5) && o.be === d.be, KEYS.map(k => Math.round(o.sim[k].p50) + '/' + Math.round(d.sim[k].p50)).join(' '));
        ok(H + '8 Rangfolge und K.O. wie deutsch', o.rank.join() === d.rank.join() && o.excluded.join() === d.excluded.join());
        const blocks = { headline: o.txt.headline, ko: o.txt.ko, be: o.txt.be, dp: o.dp.map(r => r.t + ' ' + r.s + ' ' + r.badge).join(' '), cert: o.txt.cert, ov: o.txt.ov, kpi: o.kpi.map(k => k.rank + ' ' + k.range + ' ' + k.per).join(' ') };
        const all = Object.values(blocks).join(' ');
        ok(H + '8 Waehrung en-GB: Zeichen vor der Zahl, kein „1.234 €“', /€[\d,]+/.test(blocks.headline) && !/\d\s?€(?!\d)/.test(all), (all.match(/\d\s?€(?!\d).{0,30}/) || [''])[0]);
        ok(H + '8 Dezimaltrenner en-GB in der Spannweite', /P90 is [\d]+(\.\d+)?×/.test(blocks.headline), (blocks.headline.match(/P90 is .{0,12}/) || [''])[0]);
        const DE_RX = /\b(Jahre|Viewern|Erstellern|günstigste|günstiger|teurer|Ansatz|Ansätze|zulässig\w*|Kipp-Punkt|Lizenz|Stunden|Schätzung\w*|Faustregel|Meinung|ausgeschlossen|Platz|Unsicherheit|Rangfolge|Betriebsmodell|Anforderung\w*|Warnung\w*|Verhandlungsgrenze|Bibliothek|Vorlagen\w*)\b/g;
        const rest = {}; Object.entries(blocks).forEach(([k, v]) => { const m = v.match(DE_RX); if (m) rest[k] = [...new Set(m)]; });
        ok(H + '8 keine deutschen Reste in Headline/K.O./Break-even/Pfad/Leiste/Ebene 1/KPI', Object.keys(rest).length === 0, JSON.stringify(rest).slice(0, 300));
        { const NEUTRAL = /^(markup \| (Deneb|Details|Presets:|Enterprise BI|Managed Self-Service|Self-Service|functions\.tmdl|AppSource|P10 \/ P50 \/ P90|PERT|MoSCoW|P50 · in €|Microsoft Learn, Fabric Apps overview|ChartKitchen byDatenWG|Core \+ SVG)|attr title \| Markdown)$/;
          const miss = [...new Set(o.i18nFehlt)].filter(x => !NEUTRAL.test(x));
          ok(H + '8 Woerterbuch vollstaendig (i18nFehlt nur sprachneutrale Stuecke)', miss.length === 0, miss.slice(0, 5).join(' | ').slice(0, 300)); }
        /* Waehrungszeichen an den drei Stellen, an denen deutsch „ €“ steht */
        ok(H + '8 Verhandlungsgrenze nennt das Waehrungszeichen', /(Negotiation ceiling)[^.]*up to €\d/.test(blocks.be), (blocks.be.match(/up to .{0,40}/) || [''])[0]);
        ok(H + '8 Treiber 2: „Parity … at around“ mit Waehrungszeichen', !/Parity with/.test(o.txt.ovdrivers) || /at around €\d/.test(o.txt.ovdrivers), (o.txt.ovdrivers.match(/Parity.{0,60}/) || [''])[0]);
      }
    }

    /* ---------- 4 · statische Zahlen des Entscheidungsbaums nachrechnen (nur einmal, DE) ---------- */
    if (lang === 'de') {
      const tips = {};
      for (const pk of PRESETS) {
        await preset(p, pk);
        tips[pk] = {};
        for (const [lk, lib] of [['inforiver', false], ['enterprise', false], ['zebra', false], ['enterprise', true]]) {
          tips[pk][lk + (lib ? '+lib' : '')] = await p.evaluate(TIPS, { licKey: lk, lib: lib });
        }
        await p.evaluate(() => update());   /* Zustand ist restauriert; einmal neu zeichnen */
        tips[pk].costOrder = (await snap(p)).costOrder;
        tips[pk].flags = (await snap(p)).S.flags;
      }
      dump.tips = tips;
      /* Baum, Knoten 3: „unter etwa 1 : 12 → Paid vorn … über etwa 1 : 26 → Open Source vorn“, Mischpreis 80, ohne Bibliothek */
      const r80 = PRESETS.map(pk => tips[pk].enterprise.ratio.min).filter(v => v !== null);
      const rOss = PRESETS.map(pk => tips[pk].enterprise.ratio.oss).filter(v => v !== null);
      console.log('  Kipp-Punkt-Verhaeltnisse heute (Mischpreis 80 €, ohne Bibliothek, gegen guenstigsten Stunden-Ansatz): ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk].enterprise.ratio.min + ' (' + tips[pk].enterprise.be.min + ' Viewer)').join(' · '));
      console.log('  … gegen Open Source allein: ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk].enterprise.ratio.oss).join(' · '));
      console.log('  … gegen Deneb allein: ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk].enterprise.ratio.deneb).join(' · '));
      console.log('  … gegen Core allein: ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk].enterprise.ratio.core).join(' · '));
      console.log('  Zebra 170 €: ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk].zebra.ratio.min).join(' · '));
      console.log('  Inforiver 33 €: ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk].inforiver.ratio.min + ' (' + tips[pk].inforiver.be.min + ')').join(' · '));
      console.log('  Mischpreis 80 € mit Bibliothek: ' + PRESETS.map(pk => pk + ' 1 : ' + tips[pk]['enterprise+lib'].ratio.min).join(' · '));
      const lo = Math.min(...r80), hi = Math.max(...r80);
      ok('4 Baum: „1 : 12 bis 1 : 26“ deckt die heutigen Werte (' + lo + ' bis ' + hi + ')', lo >= 11 && hi <= 27, r80.join(' / '));
      ok('4 Baum: „über 1 : 26 → Open Source vorn“: OSS-Kipp-Punkt der Presets liegt bei ≤ 1 : 27', rOss.length && Math.max(...rOss) <= 27, rOss.join(' / '));
      const rZ = PRESETS.map(pk => tips[pk].zebra.ratio.min).filter(v => v !== null);
      ok('4 Baum: „170 € → 1 : 5 bis 1 : 9“ deckt die heutigen Werte (' + Math.min(...rZ) + ' bis ' + Math.max(...rZ) + ')', Math.min(...rZ) >= 4 && Math.max(...rZ) <= 10, rZ.join(' / '));
      const rI = PRESETS.map(pk => tips[pk].inforiver.be.min);
      ok('4 Baum: „33 € → Paid hält auch bei vielen Viewern“: kein Kipp-Punkt unter 20.000 Viewern', rI.every(v => v === null || v >= 20000), rI.join(' / '));
      ok('4 Baum: „Core + SVG ist in keinem geprüften Szenario das günstigste“', PRESETS.every(pk => tips[pk].costOrder[0] !== 'core'), PRESETS.map(pk => tips[pk].costOrder[0]).join(' / '));
      const lib = await p.evaluate(() => ({ deneb: pertMean(S.p.deneb.libF), core: pertMean(S.p.core.libF), denebT: S.p.deneb.libF, coreT: S.p.core.libF }));
      ok('4 Baum: „Deneb und Core 30 bis 40 % weniger Stunden“ = libF-Erwartungswert (' + Math.round(100 - 100 * lib.deneb) + ' / ' + Math.round(100 - 100 * lib.core) + ' %)', Math.round(100 - 100 * lib.deneb) === 40 && Math.round(100 - 100 * lib.core) === 30, JSON.stringify(lib));
      dump.lib = lib;

      /* ---------- 3 · Sonderfaelle des Break-even-Satzes (Mittelstand als Basis) ---------- */
      await preset(p, 'mittelstand');
      /* (a) Paid K.O. durch „kein Lizenzbudget“ */
      await p.evaluate(() => { S.flags.nobudget = true; renderFlags(); update(); }); await p.waitForTimeout(600);
      let s = await snap(p); dump.special = { nobudget: { be: s.txt.be, ov: s.txt.ov, n3: s.dp[2].s, hl: s.txt.headline } };
      ok('3a Paid K.O.: Break-even-Satz beginnt mit dem Vorbehalt', /^Paid ist aktuell durch K\.O\./.test(s.txt.be), s.txt.be.slice(0, 100));
      ok('3a Paid K.O.: Ebene-1-Satz kennzeichnet den Kipp-Punkt als Vergleichswert', /rechnet gegen die ausgeschlossene Paid-Lizenz/.test(s.txt.ov), (s.txt.ov.match(/Kipp-Punkt.{0,120}/) || [''])[0]);
      ok('3a Paid K.O.: Verhandlungsgrenze wird trotzdem genannt (sinnvoll?)', /Verhandlungsgrenze/.test(s.txt.be), (s.txt.be.match(/Verhandlungsgrenze.{0,140}/) || [''])[0]);
      /* (b) kein zulaessiger Stunden-Ansatz: IBCS-Zertifikat Pflicht schliesst oss, deneb, core aus */
      await p.evaluate(() => { S.flags.nobudget = false; S.flags.ibcsmust = true; renderFlags(); update(); }); await p.waitForTimeout(600);
      s = await snap(p); dump.special.ibcsmust = { be: s.txt.be, ov: s.txt.ov, n3: s.dp[2].s, n5: s.dp[4].s, hl: s.txt.headline, hk: s.hk, be_fn: s.be };
      ok('3b kein Stunden-Ansatz: licenseBreakEven() = null, hk leer', s.be === null && s.hk.length === 0, JSON.stringify({ be: s.be, hk: s.hk }));
      ok('3b kein Stunden-Ansatz: Break-even-Satz sagt es, ohne „ab N Viewern“', /Kein zulässiger Ansatz bleibt/.test(s.txt.be) && !/\(ab \d/.test(s.txt.be), s.txt.be.slice(0, 200));
      ok('3b kein Stunden-Ansatz: keine Verhandlungsgrenze gegen einen ausgeschlossenen Ansatz', !/Verhandlungsgrenze/.test(s.txt.be), (s.txt.be.match(/Verhandlungsgrenze.{0,120}/) || [''])[0]);
      ok('3b kein Stunden-Ansatz: Ebene 1 „Einen Kipp-Punkt gibt es hier nicht“', /Einen Kipp-Punkt gibt es hier nicht/.test(s.txt.ov), (s.txt.ov.match(/Kipp-Punkt.{0,100}/) || [''])[0]);
      ok('3b kein Stunden-Ansatz: Knoten 3 „Kein Kipp-Punkt“', /Kein Kipp-Punkt/.test(s.dp[2].s), s.dp[2].s.slice(0, 120));
      /* (c) Site-Lizenz im Grosskonzern — Verhandlungsgrenze „umgerechnet je Nutzer“ */
      await p.evaluate(() => { S.flags.ibcsmust = false; renderFlags(); update(); });
      await preset(p, 'gross'); s = await snap(p); dump.special.site = { be: s.txt.be, licModel: s.S.licModel };
      ok('3c Site-Lizenz (Großkonzern): Grenze „(umgerechnet je Nutzer)“ und > 0 €', /umgerechnet je Nutzer/.test(s.txt.be) && !/0 €, also nie/.test(s.txt.be), (s.txt.be.match(/Verhandlungsgrenze.{0,160}/) || [''])[0]);
      /* (d) Angebot aktiv */
      await preset(p, 'mittelstand');
      await p.evaluate(() => { S.offers = [normOffer({ vendor: 'Testanbieter', model: 'peruser', price: 50, users: 40, term: 1, disc: 0 })]; S.offerOn = 0; update(); }); await p.waitForTimeout(700);
      s = await snap(p); dump.special.offer = { be: s.txt.be, n5: s.dp[4], ov: s.txt.ov, cert: s.txt.cert.slice(0, 400), be_fn: s.be };
      ok('3d Angebot aktiv: Satz nennt das Angebot und seinen Preis (50 €)', /Euer Angebot Testanbieter liegt bei 50 €/.test(s.txt.be), (s.txt.be.match(/Euer Angebot.{0,120}/) || [''])[0]);
      {
        const g = s.txt.be.match(/Paid rechnet sich gegen .*? bis ([\d.]+) € je lizenziertem Nutzer/);
        const grenze = g ? num(g[1], 'de') : NaN;
        const traegt = /es trägt\./.test(s.txt.be);
        ok('3d Angebot aktiv: „es trägt“ genau dann, wenn 50 € ≤ Verhandlungsgrenze ' + grenze, isFinite(grenze) && traegt === (50 <= grenze), (s.txt.be.match(/Verhandlungsgrenze.{0,220}/) || [''])[0]);
      }
      ok('3d Angebot aktiv: Knoten 5 heißt „Angebot statt Lizenz-Anker“ mit Badge Angebot', /Angebot statt Lizenz-Anker/.test(s.dp[4].t) && s.dp[4].badge === 'Angebot', s.dp[4].t + ' / ' + s.dp[4].badge);
      ok('3d Angebot aktiv: Ebene 1 nennt das Angebot statt des Ankers', /Angebot Testanbieter/.test(s.txt.ov) && !/Lizenz-Anker: Mischpreis/.test(s.txt.ov));
      ok('3d Angebot aktiv: Leiste trägt den Hinweis „beruht auf dem Angebot“', /beruht auf dem Angebot von Testanbieter/.test(s.txt.cert));
      await p.evaluate(() => { S.offers = []; S.offerOn = -1; update(); });

      /* ---------- 9 · Versionsnummern im sichtbaren Text ---------- */
      await preset(p, 'mittelstand');
      s = await snap(p);
      dump.versions = s.versions;
      console.log('  Versionsnummern im sichtbaren Text (Ebene 3): ' + JSON.stringify(s.versions));
      ok('9 Seite nennt eine aktuelle Versionsnummer v0.22 irgendwo sichtbar', !!s.versions['v0.22'], Object.keys(s.versions).join(', '));
      { const hist = s.txt.hist; const vs = [...hist.matchAll(/v0\.(\d+)/g)].map(m => +m[1]); const mx = vs.length ? Math.max(...vs) : 0;
        ok('9 Änderungshistorie reicht bis zur Fußnoten-Version v0.22 (höchster Eintrag v0.' + mx + ')', mx >= 22, (s.txt.footer.match(/Änderungshistorie[^)]*\)/) || [''])[0] + ' · Versionen ' + [...new Set(vs)].join(',')); }
      ok('9 Entscheidungsbaum-Vorspann nennt nicht mehr „Stand v0.19“ als Messstand (Zahlen sind laut Kommentar statisch)', !/Stand v0\.19/.test(s.txt.treeHint), (s.txt.treeHint.match(/Stand v0\.\d+/) || [''])[0]);
    }
    await p.close();
  }

  /* ---------- 7 · Gefuehrter Einstieg ---------- */
  {
    const p = watch(await b.newPage({ viewport: { width: 1280, height: 900 } }), 'wiz');
    await p.goto(U, { waitUntil: 'load' }); await p.waitForTimeout(900);
    const live = () => p.evaluate(() => { const t = document.getElementById('wiz-live').innerText; const m = t.match(/rund ([\d.]+) € je Viewer und Jahr/); const g = t.match(/\(([\d.,]+( Mio\.)? €) insgesamt, P(\d+)\)/);
      const b = lastRank[0]; const st = b ? lastSim[b.key] : null; const q = st ? st['p' + S.riskQ] : null;
      return { txt: t, per: m ? +m[1].replace(/\./g, '') : null, tot: g ? g[1] : null, calc: st ? Math.round(q / Math.max(1, st.vAvg * S.horizon)) : null, calcTot: st ? fmtEur(q) : null, best: b ? b.short : null, step: document.getElementById('wiz-count').textContent }; });
    const wl = [];
    const stepCheck = async (n, note) => { const l = await live(); wl.push(l);
      ok('7 Schritt ' + n + ' (' + note + '): Zwischenstand ' + l.per + ' € = Rechenwert ' + l.calc + ', Summe ' + l.tot + ' = ' + l.calcTot, l.per === l.calc && l.tot === l.calcTot && l.step === 'Schritt ' + n + ' von 7', l.txt.slice(0, 120)); };
    ok('7 Einstieg startet ohne Link bei Schritt 1', await p.evaluate(() => wizOn() && wizStep === 0));
    /* Schritt 1 */
    await p.click('[data-wact="preset"][data-wval="mittelstand"]'); await p.waitForTimeout(700);
    await p.fill('#wiz-creators', '5'); await p.press('#wiz-creators', 'Tab'); await p.waitForTimeout(600);
    await p.fill('#wiz-viewers', '120'); await p.press('#wiz-viewers', 'Tab'); await p.waitForTimeout(800);
    ok('7 Schritt 1: Ersteller 5 / Viewer 120 in S', await p.evaluate(() => S.creators === 5 && S.viewers === 120));
    await stepCheck(1, 'Ersteller/Viewer');
    await p.click('#wiz-next'); await p.waitForTimeout(400);
    /* Schritt 2 */
    await p.fill('#wiz-reports', '20'); await p.press('#wiz-reports', 'Tab'); await p.waitForTimeout(700);
    await p.click('[data-wact="rc"][data-wval="mgmt"]'); await p.waitForTimeout(800);
    const s2 = await p.evaluate(() => ({ r: S.reports, sh: S.rc.sh.join(), hint: document.getElementById('wiz-rc-hint').innerText, cpr: fmtN(S.cpr, 1), mix: S.mix.join(' / ') }));
    ok('7 Schritt 2: Reports 20, Klassen 20/40/40 in S', s2.r === 20 && s2.sh === '20,40,40', s2.sh);
    ok('7 Schritt 2: Hinweis nennt dieselben Charts je Report und Mix wie S', s2.hint.includes(s2.cpr + ' Charts je Report') && s2.hint.includes(s2.mix), s2.hint);
    await stepCheck(2, 'Reports/Klassen');
    await p.click('#wiz-next'); await p.waitForTimeout(400);
    /* Schritt 3 */
    await p.click('[data-wact="mode"][data-wval="ent"]'); await p.waitForTimeout(800);
    ok('7 Schritt 3: Enterprise BI in S (ssShare 0)', await p.evaluate(() => S.mode === 'ent' && S.ssShare === 0));
    await stepCheck(3, 'Betriebsmodell');
    await p.click('#wiz-next'); await p.waitForTimeout(400);
    /* Schritt 4 */
    await p.click('input[data-wflag="certonly"]'); await p.waitForTimeout(800);
    await p.click('input[data-wflag="ibcsAll"]'); await p.waitForTimeout(800);
    let s4 = await p.evaluate(() => ({ c: !!S.flags.certonly, ia: !!S.ibcsAll, live: document.getElementById('wiz-live').innerText }));
    ok('7 Schritt 4: certonly und IBCS-Pflicht in S', s4.c && s4.ia);
    ok('7 Schritt 4: Zwischenstand zeigt „1 Ansatz ausgeschlossen“', /1 Ansatz ausgeschlossen/.test(s4.live), s4.live.slice(0, 160));
    await p.click('input[data-wflag="ibcsAll"]'); await p.waitForTimeout(800);
    ok('7 Schritt 4: IBCS-Pflicht wieder aus', await p.evaluate(() => !S.ibcsAll));
    await stepCheck(4, 'Red Flags');
    await p.click('#wiz-next'); await p.waitForTimeout(400);
    /* Schritt 5 */
    await p.click('[data-wact="lic"][data-wval="zebra"]'); await p.waitForTimeout(800);
    ok('7 Schritt 5: Zebra-Anker in S', await p.evaluate(() => S.p.paid.lic.join() === '90,170,300'));
    await stepCheck(5, 'Lizenz-Anker');
    await p.click('#wiz-next'); await p.waitForTimeout(400);
    /* Schritt 6 */
    await p.click('[data-wact="hor"][data-wval="10"]'); await p.waitForTimeout(900);
    ok('7 Schritt 6: Horizont 10 in S', await p.evaluate(() => S.horizon === 10));
    await stepCheck(6, 'Horizont');
    await p.click('#wiz-next'); await p.waitForTimeout(500);
    /* Schritt 7 */
    const s7 = await p.evaluate(() => ({ sum: document.getElementById('wiz-summary').innerText, mode: modeParams().label, flags: FLAGS.filter(f => f.flag && S.flags[f.id]).length }));
    ok('7 Schritt 7: Zusammenfassung nennt 5 Ersteller · 120 Viewer, 20 Reports, Klassen 20 / 40 / 40, Enterprise BI, Zebra, 10 Jahre',
      /5 Ersteller · 120 Viewer/.test(s7.sum) && /20 Standard-Reports · Klassen 20 \/ 40 \/ 40/.test(s7.sum) && s7.sum.includes(s7.mode) && /Zebra-Niveau/.test(s7.sum) && /Horizont: 10 Jahre/.test(s7.sum), s7.sum.replace(/\n/g, ' | '));
    ok('7 Schritt 7: Red-Flag-Zahl in der Zusammenfassung = gesetzte Flags (' + s7.flags + ')', new RegExp('Red Flags: ' + s7.flags + '\\b').test(s7.sum), (s7.sum.match(/Red Flags: [^\n]*/) || [''])[0]);
    await stepCheck(7, 'Abschluss');
    dump.wizard = { live: wl, summary: s7.sum };
    /* Ergebnis ansehen -> Ebene 2; dieselbe Zahl? */
    await p.click('#wiz-next'); await p.waitForTimeout(1000); await waitStable(p);
    const after = await p.evaluate(SNAP);
    const lastLive = wl[wl.length - 1];
    const c0 = after.costOrder[0];
    const ovm = after.txt.ov.match(/rund ([\d.]+) € je Viewer/);
    ok('7 nach dem Einstieg: Ebene 1 zeigt dieselbe Zahl wie der letzte Zwischenstand (' + lastLive.per + ' €)', after.S.level === 2 && !!ovm && num(ovm[1], 'de') === lastLive.per, (ovm ? ovm[0] : after.txt.ov.slice(0, 100)) + ' · Ebene ' + after.S.level);
    ok('7 nach dem Einstieg: Headline-Gesamtkosten = Zwischenstand-Summe (' + lastLive.tot + ')', after.txt.headline.includes(lastLive.tot), after.txt.headline.slice(0, 140));
    const kp = after.kpi[0];
    ok('7 nach dem Einstieg: KPI-Karte 1 ist der Zwischenstand-Ansatz (' + lastLive.best + ')', !!kp && after.names[c0].short === lastLive.best && kp.name === after.names[c0].name, kp ? kp.name : '-');
    const kpm2 = kp ? kp.per.match(/([\d.,]+)( Mio\.)? €/) : null; const kv = kpm2 ? num(kpm2[1], 'de') * (kpm2[2] ? 1e6 : 1) : NaN;
    ok('7 nach dem Einstieg: KPI je Viewer ≈ Zwischenstand (±5 % Rundung auf zwei Stellen)', isFinite(kv) && rel(kv, lastLive.per) <= 0.055, 'KPI ' + (kp ? kp.per.slice(0, 40) : '-') + ' · live ' + lastLive.per);
    ok('7 Einstieg-Zwischenstand nennt keinen Horizont-losen Betrag', wl.every(l => /über \d+ Jahre/.test(l.txt)));
    await p.close();
  }
  /* Sprachwechsel mitten im Einstieg */
  {
    const p = watch(await b.newPage({ viewport: { width: 1280, height: 900 } }), 'wiz-lang');
    await p.goto(U, { waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.click('[data-wact="preset"][data-wval="konzern"]'); await p.waitForTimeout(700);
    for (let i = 0; i < 3; i++) { await p.click('#wiz-next'); await p.waitForTimeout(250); }
    ok('7 Sprachwechsel: vor dem Wechsel Schritt 4 von 7', await p.evaluate(() => wizStep === 3 && S.creators === 25));
    /* Weg A: der Umschalter der Seite (setLang) */
    await p.evaluate(() => setLang('en')); await p.waitForLoadState('load'); await p.waitForTimeout(1200);
    const la = await p.evaluate(() => ({ lang: LANG, on: wizOn(), step: wizStep, c: S.creators, v: S.viewers, cnt: document.getElementById('wiz-count').textContent, q: document.querySelector('#wiz-pane .wiz-q').textContent }));
    ok('7 Sprachwechsel über den Umschalter landet englisch im selben Schritt (4) mit denselben Eingaben', la.lang === 'en' && la.on && la.step === 3 && la.c === 25 && la.v === 1500, JSON.stringify(la));
    ok('7 Sprachwechsel: Schrittzähler und Frage englisch', /Step 4 of 7/.test(la.cnt) && !/Vorgaben/.test(la.q), la.cnt + ' · ' + la.q);
    /* Weg B: nur localStorage + reload (so beschrieben im Auftrag) */
    await p.evaluate(() => { localStorage.setItem('vsr-lang', 'de'); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200);
    const lb = await p.evaluate(() => ({ lang: LANG, on: wizOn(), step: wizStep, c: S.creators, hash: location.hash.length, search: location.search }));
    console.log('  Weg B (localStorage + reload ohne setLang): ' + JSON.stringify(lb));
    ok('7 Sprachwechsel nur über localStorage + reload: Schritt bleibt NICHT erhalten (Hinweis, kein Fehler: Schritt wird nur von setLang gemerkt)', lb.step === 0 || lb.on === false, JSON.stringify(lb));
    await p.close();
  }

  fs.writeFileSync(DIR + 'snapshot.json', JSON.stringify(dump, null, 1), 'utf8');
  /* Lesefassung der Texte fuer die Durchsicht */
  let md = '';
  for (const lang of ['de', 'en']) for (const pk of PRESETS) { const o = dump[lang][pk];
    md += '\n\n## ' + lang + ' · ' + pk + '\n\n### headline\n' + o.txt.headline + '\n\n### ov-sentence\n' + o.txt.ov + '\n\n### ov-drivers\n' + o.txt.ovdrivers + '\n\n### be-insight\n' + o.txt.be + '\n\n### decision-path\n' + o.dp.map((r, i) => (i + 1) + ' · ' + r.t + ' [' + r.badge + '] — ' + r.s + ' | Chips: ' + r.chips.map(c => c.t + '(' + c.m + ')').join(', ')).join('\n') + '\n\n### ko-block\n' + o.txt.ko + '\n\n### certainty\n' + o.certRows.map(r => r.name + ': ' + r.segs.map(s => s.title).join(' · ')).join('\n') + '\n\n### kpi\n' + o.kpi.map(k => k.rank + ' ' + k.name + ' ' + k.big + ' | ' + k.range + ' | ' + k.per).join('\n') + '\n\n### nulloption\n' + o.txt.nulloption + '\n\n### rclasses\n' + o.txt.rclasses.slice(0, 1500) + '\n\n### premise\n' + o.txt.premise + '\n\n### conflicts\n' + o.txt.conflict; }
  md += '\n\n## Sonderfaelle\n' + JSON.stringify(dump.special, null, 1) + '\n\n## Kipp-Punkte\n' + JSON.stringify(dump.tips, null, 1) + '\n\n## Footer (de)\n' + dump.de.mittelstand.txt.footer;
  fs.writeFileSync(DIR + 'texte.md', md, 'utf8');
  console.log('\nTexte und Momentaufnahme: ' + DIR);
  await R.finish(b);
})().catch(e => { console.error(e); process.exit(2); });
