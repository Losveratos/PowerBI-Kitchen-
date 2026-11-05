/* Runde 3 · A1 · Grenzfaelle und Invarianten des Rechenkerns
   ==========================================================================
   Prueft calc()/expected(), calcSQ(), simulate(), writeHash()/readHash() des
   Visual-Standards-Rechners auf Grenzfaelle, die eine Praesentation oder ein
   geteilter Link treffen kann. Die HTML-Datei wird NICHT geaendert.

   Jede Pruefung formuliert ihre Erwartung im Namen; die Zahl steht dahinter.
   Wo die Erwartung aus der Logik von calc() folgt (Zeilen 3811–4034), ist sie
   exakt; wo sie eine Plausibilitaet ist, steht die Toleranz dabei.

   Start:  node sessions/visual-standards-rechner-audit/runde3/a1-grenzfaelle.test.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus tests/rechner/lib/harness.js. */
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium, URL: U, skipWizard: skip, reporter } = require(path.join(__dirname, '..', '..', '..', 'tests', 'rechner', 'lib', 'harness'));
const R = reporter('a1-grenzfaelle');
const ok = R.ok;
const KEYS = ['paid', 'oss', 'deneb', 'core'];
const CATS = ['lic', 'build', 'switch', 'rollout', 'train', 'maint', 'gov', 'risk'];
const eur = x => (Math.round(x * 100) / 100).toFixed(2);
const pct = (a, b) => (100 * (a - b) / Math.abs(b || 1)).toFixed(2) + ' %';
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const fin = x => typeof x === 'number' && isFinite(x);

/* Protokoll zusaetzlich in eine Datei, damit der Bericht die Zahlen nachweisen kann. */
const LOG = path.join(__dirname, 'a1-grenzfaelle.log');
const lines = [];
const origLog = console.log;
console.log = (...a) => { const s = a.join(' '); lines.push(s); origLog(s); };
process.on('exit', () => { try { fs.writeFileSync(LOG, lines.join('\n') + '\n', 'utf8'); } catch (e) { /* egal */ } });

/* ---- Seiten-Helfer (laufen im Browser) ---- */
const INIT = () => {
  window.__base = () => { defaults(); S.g.growth = [0, 10, 20]; syncDerived(); };
  window.__snap = (k) => {
    const e = expected(k); const o = { total: e.total, cats: {}, cf: e.cf.slice(), cfHard: e.cfHard.slice(), cfSoft: e.cfSoft.slice(),
      hoursIntY: e.hoursIntY.slice(), hoursInt: e.hoursInt, fteY1: e.fteY1, invest: e.invest, yearly: e.yearly, npv: e.npv,
      licPrice: e.licPrice, licSupport: e.licSupport, licAdminC: e.licAdminC, capacityC: e.capacityC, licViewerShare: e.licViewerShare,
      licModelEff: e.licModelEff, offer: e.offer, minTerm: e.minTerm, indep: e.indep, shCore: e.shCore, cprW: e.cprW, compMult: e.compMult,
      reportsTotal: e.reportsTotal, rolloutYears: e.rolloutYears, vAvg: e.vAvg, owners: e.owners, exitCost: e.exitCost, exitLic: e.exitLic,
      capexBase: e.capexBase, bnY: e.bnY, hard: e.hard, soft: e.soft, adopt: e.adopt, modF: e.modF, inflF: e.inflF, licF: e.licF, pH: e.pH,
      rateInt: e.gd.rateInt, rateExt: e.gd.rateExt, intFactor: e.gd.intFactor, ext: e.pd.ext, lic: e.pd.lic, licInfl: e.pd.licInfl };
    ['lic', 'build', 'switch', 'rollout', 'train', 'maint', 'gov', 'risk'].forEach(c => o.cats[c] = e[c]);
    return o; };
  window.__all = () => { const o = {}; ['paid', 'oss', 'deneb', 'core'].forEach(k => o[k] = window.__snap(k)); return o; };
  window.__sq = () => { const s = calcSQ(pertMean); return { build: s.build, maint: s.maint, read: s.read, sup: s.sup, total: s.total, noRead: s.noRead, cf: s.cf.slice(), reportsTotal: s.reportsTotal, compSQ: s.compSQ }; };
  window.__bad = (o) => { /* NaN / Infinity / negativ irgendwo im Snapshot */
    const bad = [];
    const walk = (v, p) => { if (typeof v === 'number') { if (!isFinite(v)) bad.push(p + '=' + v); else if (v < -1e-9) bad.push(p + '=' + v); }
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + '[' + i + ']')); else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], p + '.' + k)); };
    ['total', 'cats', 'cf', 'cfHard', 'cfSoft', 'hoursIntY', 'invest', 'yearly', 'npv', 'licPrice', 'exitCost', 'hard', 'soft'].forEach(k => walk(o[k], k));
    return bad; };
  window.__pageBad = () => { const t = document.body.innerText; const m = t.match(/\bNaN\b|\bInfinity\b|\bundefined\b|−?∞/g); return m ? m.slice(0, 5) : []; };
};

(async () => {
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
R.watch(p);
await p.goto(U); await p.waitForTimeout(1000); await skip(p);
await p.evaluate(INIT);
const ev = (fn, arg) => p.evaluate(fn, arg);
const base = () => ev(() => window.__base());

/* ====================================================================== */
console.log('\n--- Fall 1 · Horizont 3 / 5 / 10 ---');
/* Erwartung: jedes Jahr liefert einen Zahlungsstrom >= 0 (alle Posten sind Produkte nicht-negativer
   Groessen), also ist die Summe monoton in H. Kosten je Jahr (total/H) duerfen sich bewegen
   (Aufbau wird ueber mehr Jahre verteilt, Lohn- und Lizenzsteigerung wirken gegen), aber nicht um
   mehr als Faktor 2 zwischen H=3 und H=10. cf hat genau H Eintraege. */
{
  await base();
  const res = {};
  for (const H of [3, 5, 10]) { res[H] = await ev(H => { S.horizon = H; return window.__all(); }, H); }
  for (const k of KEYS) {
    const t3 = res[3][k].total, t5 = res[5][k].total, t10 = res[10][k].total;
    ok('[' + k + '] Gesamtkosten steigen monoton mit dem Horizont', t3 < t5 && t5 < t10, eur(t3) + ' < ' + eur(t5) + ' < ' + eur(t10));
    const y3 = t3 / 3, y5 = t5 / 5, y10 = t10 / 10;
    ok('[' + k + '] Kosten je Jahr grob stabil (Faktor H10/H3 zwischen 0,5 und 2)', y10 / y3 > .5 && y10 / y3 < 2, 'je Jahr H3 ' + eur(y3) + ' · H5 ' + eur(y5) + ' · H10 ' + eur(y10) + ' · Faktor ' + (y10 / y3).toFixed(3));
    for (const H of [3, 5, 10]) {
      const s = res[H][k]; const bad = await ev(o => window.__bad(o), s);
      ok('[' + k + '] H=' + H + ': keine NaN/Infinity/negativ, cf hat H Eintraege', bad.length === 0 && s.cf.length === H, bad.join(',') || ('cf.length=' + s.cf.length));
    }
  }
}

/* ====================================================================== */
console.log('\n--- Fall 2 · Viewer 0 / Viewer 1 / 1 Ersteller mit 100.000 Viewern ---');
/* Erwartung: keine Division durch null (alle Teiler in calc() sind mit Math.max(1, …) oder ||1
   geschuetzt, perDivisor() mit Math.max(v,1)), keine Negativwerte, Seite zeigt nirgends NaN.
   Bei Viewer 0: Lizenz > 0 (Mindestpaket 5 fuer die Ersteller), Governance-Groessenfaktor 0,3. */
{
  const EDGE = [['Viewer 0', { creators: 3, viewers: 0 }], ['Viewer 1', { creators: 3, viewers: 1 }], ['1 Ersteller / 100.000 Viewer', { creators: 1, viewers: 100000 }]];
  for (const [lbl, q] of EDGE) {
    await base();
    const r = await ev(async q => { S.creators = q.creators; S.viewers = q.viewers; syncDerived(); update(); await new Promise(r => setTimeout(r, 300));
      const o = window.__all(); o.page = window.__pageBad(); o.be = licenseBreakEven(); o.sim = {}; ['paid', 'oss', 'deneb', 'core'].forEach(k => { const s = lastSim[k]; o.sim[k] = { p10: s.p10, p50: s.p50, p90: s.p90 }; }); return o; }, q);
    for (const k of KEYS) {
      const bad = await ev(o => window.__bad(o), r[k]);
      ok('[' + lbl + '][' + k + '] Erwartungswert endlich und nicht negativ', bad.length === 0, bad.join(',') || ('total ' + eur(r[k].total)));
      ok('[' + lbl + '][' + k + '] Simulation P10/P50/P90 endlich', fin(r.sim[k].p10) && fin(r.sim[k].p50) && fin(r.sim[k].p90), Math.round(r.sim[k].p10) + ' / ' + Math.round(r.sim[k].p50) + ' / ' + Math.round(r.sim[k].p90));
    }
    ok('[' + lbl + '] Seite zeigt kein NaN / Infinity / undefined', r.page.length === 0, r.page.join(',') || 'sauber');
    ok('[' + lbl + '] Break-even-Viewerzahl ist Zahl oder null', r.be === null || fin(r.be), String(r.be));
    if (q.viewers === 0) ok('[' + lbl + '] Paid-Lizenz > 0 trotz 0 Viewer (Mindestpaket fuer Ersteller)', r.paid.licPrice > 0, eur(r.paid.licPrice));
  }
}

/* ====================================================================== */
console.log('\n--- Fall 3 · Adoptionsgrad 0 % ---');
/* Erwartung aus calc() Z. 3917–3923: mit ad = 0 entsteht kein Chart nach dem Standard. Rollout-Stunden =
   n·w·sqChartH·comp (Null-Options-Satz), Wartung des Ad-hoc-Bestands mit sqMaint, Anwender-Support mit
   sqSupH100. Es bleiben die Fixkosten des Standards (Aufbau A, Schulung, Freigabe, Lizenz, Pruefung,
   Wartung des Baukastens, Abkuendigung). Deshalb: total(ad=0) = SQ.noRead + Fixkosten, und
   rollout(ad=0) soll SQ.build entsprechen. Die Posten Wartung und Governance tragen dagegen den Overhead
   des ungenutzten Standards (Baukasten-Wartung, Breaking-Fixes, Governance-Betrieb, Audit, Pruefung) und
   liegen deshalb UEBER der Null-Option; das ist gewollt und wird nur dokumentiert. Zwei Abweichungen sind in der Formel sichtbar:
   (a) calc() bewertet den Ad-hoc-Rollout mit rate0 (Mischsatz intern/extern), calcSQ() mit rateInt;
   (b) calc() nimmt fuer Klassen B/C die Komplexitaetsfaktoren des Ansatzes (cxOwn), calcSQ() die von Core.
   Mit ext = 0 und cx = Core-Werte fuer alle Ansaetze muss rollout(ad=0) == SQ.build auf den Cent stimmen. */
{
  await base();
  const r = await ev(() => { ['paid', 'oss', 'deneb', 'core'].forEach(k => { S.p[k].adopt = [0, 0, 0]; }); const o = window.__all(); o.sq = window.__sq(); return o; });
  for (const k of KEYS) {
    const s = r[k]; const fix = s.cats.build + s.cats.train + s.cats.lic + s.cats.risk;
    const varPart = s.total - fix; /* rollout + maint + gov (inkl. Freigabe, Betrieb, Pruefung, Anwender-Support) */
    ok('[' + k + '] ad=0: Rollout liegt in der Groessenordnung des Null-Options-Baus (±20 %)', near(s.cats.rollout, r.sq.build, .2 * r.sq.build),
       'rollout ' + eur(s.cats.rollout) + ' vs SQ.build ' + eur(r.sq.build) + ' (' + pct(s.cats.rollout, r.sq.build) + ')');
    ok('[' + k + '] ad=0: Mehrkosten gegen SQ ohne Leserzeit dokumentiert (Standard-Overhead ohne Nutzen)', true,
       'total ' + eur(s.total) + ' = SQ.noRead ' + eur(r.sq.noRead) + ' + Fix ' + eur(fix) + ' (Lizenz ' + eur(s.cats.lic) + ') + variabler Overhead ' + eur(varPart - r.sq.noRead) + ' (' + pct(varPart, r.sq.noRead) + ' auf den variablen Teil)');
  }
  /* Exakte Variante: ext = 0, Komplexitaetsfaktoren = Core, kein Baukasten-Anteil in der Wartung ist nicht abschaltbar -> nur Rollout vergleichen */
  const r2 = await ev(() => { ['paid', 'oss', 'deneb', 'core'].forEach(k => { S.p[k].adopt = [0, 0, 0]; S.p[k].ext = [0, 0, 0]; S.p[k].cxSimple = S.p.core.cxSimple.slice(); S.p[k].cxComplex = S.p.core.cxComplex.slice(); }); const o = window.__all(); o.sq = window.__sq(); return o; });
  for (const k of KEYS) {
    ok('[' + k + '] ad=0, ext=0, cx=Core: Rollout == Null-Options-Bau (Cent-genau)', near(r2[k].cats.rollout, r2.sq.build, .01), eur(r2[k].cats.rollout) + ' vs ' + eur(r2.sq.build));
  }
  ok('Default-Fall: Abweichung Rollout(ad=0) zu SQ.build je Ansatz dokumentiert', true,
     KEYS.map(k => k + ' ' + pct(r[k].cats.rollout, r.sq.build)).join(' · '));
}

/* ====================================================================== */
console.log('\n--- Fall 4 · IBCS verbindlich fuer alle Reports ---');
/* Erwartung aus Z. 3881 und 3836: lvs = 1 (statt PERT-Mittel 85 %), Klasse A laeuft ueber den Ansatz
   (cls[0].core = false), shCore = 0, indep = 0. Paid-Lizenz steigt gegenueber „aus“, weil die
   Lizenzbasis von 0,8333·V+C auf V+C waechst; Lizenz der drei anderen (Support/Capacity) bleibt gleich. */
{
  await base();
  const off = await ev(() => window.__all());
  const lvsDef = await ev(() => pertMean(S.g.licViewerShare) / 100);
  const on = await ev(() => { S.ibcsAll = true; return window.__all(); });
  ok('[paid] licViewerShare wirkt als 1 (aus: PERT-Mittel von 60/85/100 = 0,8333)', on.paid.licViewerShare === 1 && near(off.paid.licViewerShare, lvsDef, 1e-9), off.paid.licViewerShare.toFixed(4) + ' -> ' + on.paid.licViewerShare);
  ok('[paid] Lizenzpreis steigt mit IBCS-Pflicht', on.paid.licPrice > off.paid.licPrice, eur(off.paid.licPrice) + ' -> ' + eur(on.paid.licPrice) + ' (' + pct(on.paid.licPrice, off.paid.licPrice) + ')');
  for (const k of KEYS) {
    ok('[' + k + '] Klasse A laeuft ueber den Ansatz: shCore = 0 und indep = 0', on[k].shCore === 0 && near(on[k].indep, 0, .01), 'shCore ' + on[k].shCore + ' indep ' + eur(on[k].indep) + ' (aus: shCore ' + off[k].shCore.toFixed(4) + ', indep ' + eur(off[k].indep) + ')');
    if (k !== 'paid') ok('[' + k + '] Lizenzblock unveraendert (kein Lizenzpreis)', near(on[k].cats.lic, off[k].cats.lic, .01), eur(off[k].cats.lic) + ' / ' + eur(on[k].cats.lic));
    ok('[' + k + '] Gesamt an/aus dokumentiert', true, eur(off[k].total) + ' -> ' + eur(on[k].total) + ' (' + pct(on[k].total, off[k].total) + ')');
  }
}

/* ====================================================================== */
console.log('\n--- Fall 5 · Aktives Anbieter-Angebot ---');
/* Erwartung aus offerPatch() Z. 3758 und calc() Z. 3833–3835, 3878, 3943: lic = 50, support = 0
   (supInc), minTerm = 1, lmEff = 'peruser' -> staffelD = 1, Mindestpaket packU bleibt.
   licPrice = Σ_y packU(V_y·lvs + C) · inf^y · 50 · vatF. Mit S.licModel = 'staffel' gesetzt darf die
   Staffel trotzdem nicht wirken. */
{
  await base();
  const r = await ev(() => {
    S.licModel = 'staffel';
    S.offers = [{ vendor: 'X', model: 'peruser', price: 50, users: 0, term: 1, disc: 0, supInc: true, sup: 0, infl: '', note: '' }]; S.offerOn = 0;
    const e = expected('paid'); const g = pertMean(S.g.growth), lvs = pertMean(S.g.licViewerShare) / 100, inf = 1 + e.pd.licInfl / 100;
    const packU = u => u <= 5 ? 5 : Math.ceil(u / 10) * 10;
    let soll = 0, units = []; for (let y = 0; y < S.horizon; y++) { const v = S.viewers * Math.pow(1 + g / 100, y); const u = packU(v * lvs + S.creators); units.push(u); soll += u * Math.pow(inf, y) * 50; }
    const staffelD = u => u <= 25 ? 1 : u <= 100 ? .8 : u <= 500 ? .6 : u <= 2000 ? .45 : u <= 5000 ? .3 : .2;
    let mitStaffel = 0; for (let y = 0; y < S.horizon; y++) mitStaffel += units[y] * Math.pow(inf, y) * 50 * staffelD(units[y]);
    const off = (() => { S.offerOn = -1; const x = expected('paid'); S.offerOn = 0; return { licPrice: x.licPrice, lic: x.pd.lic, lm: x.licModelEff }; })();
    const bad = (() => { S.offerOn = 7; const x = expected('paid'); S.offerOn = 0; return { licPrice: x.licPrice, offer: x.offer }; })();
    return { licPrice: e.licPrice, soll, mitStaffel, lic: e.pd.lic, support: e.licSupport, minTerm: e.minTerm, lm: e.licModelEff, offer: e.offer, units, off, bad, inf };
  });
  ok('Lizenzpreis je Nutzer = 50 EUR, Support 0, Mindestlaufzeit 1, Modell pro Nutzer', r.lic === 50 && r.support === 0 && r.minTerm === 1 && r.lm === 'peruser' && r.offer === 'X', JSON.stringify({ lic: r.lic, support: r.support, minTerm: r.minTerm, lm: r.lm, offer: r.offer }));
  ok('Lizenzpreis = Σ packU(V_y·lvs + C) · inf^y · 50 EUR (Staffel aus, Mindestpaket an)', near(r.licPrice, r.soll, .01), eur(r.licPrice) + ' vs ' + eur(r.soll) + ' · Einheiten ' + r.units.join('/') + ' · inf ' + r.inf.toFixed(4));
  ok('Staffel wirkt trotz S.licModel = staffel NICHT (sonst waere es ' + eur(r.mitStaffel) + ')', !near(r.licPrice, r.mitStaffel, .01), eur(r.licPrice));
  ok('Ohne Angebot: Lizenz-Anker = PERT-Mittel 85 EUR (40/80/150), Modell staffel', r.off.lic === 85 && r.off.lm === 'staffel', eur(r.off.licPrice) + ' | ' + r.off.lic + ' ' + r.off.lm);
  ok('Ungueltiger offerOn (7) faellt auf den Anker zurueck', near(r.bad.licPrice, r.off.licPrice, .01) && r.bad.offer === null, eur(r.bad.licPrice));
}

/* ====================================================================== */
console.log('\n--- Fall 6 · Budgetfreigabe erst im Folgejahr ---');
/* Erwartung aus Z. 3933 und 3938: bnY = 1, cf[0] = cfHard[0] = cfSoft[0] = hoursIntY[0] = 0, Σcf = total
   (die Summe laeuft ueber dieselben Jahresposten). Nebenfolgen, die aus der Formel folgen:
   fteY1 = hoursIntY[0]/1500 = 0; yearly = (total−invest)/H teilt durch H statt H−1; bei
   rolloutYears >= H faellt die letzte Tranche des Bestands aus dem Horizont (ye < RY). */
{
  await base();
  const r = await ev(() => { S.horizon = 3; const vor = window.__all(); S.flags.budgetnext = true; const o = window.__all(); o.vor = vor;
    S.g.rolloutYears = [3, 3, 3]; o.ry3 = window.__all(); S.flags.budgetnext = false; o.ry3off = window.__all(); S.flags.budgetnext = true; return o; });
  for (const k of KEYS) {
    const s = r[k]; const sum = s.cf.reduce((a, v) => a + v, 0);
    ok('[' + k + '] cf[0] = 0, cfHard[0] = 0, hoursIntY[0] = 0', s.cf[0] === 0 && s.cfHard[0] === 0 && s.hoursIntY[0] === 0, s.cf.map(eur).join(' / '));
    ok('[' + k + '] Σcf = total', near(sum, s.total, .01), eur(sum) + ' / ' + eur(s.total));
    ok('[' + k + '] Jahr 1 des Betriebs traegt die Einmalkosten (cf[1] > cf[2])', s.cf[1] > s.cf[2], eur(s.cf[1]) + ' > ' + eur(s.cf[2]));
    ok('[' + k + '] Nebenfolge dokumentiert: fteY1 = 0 (Aufbaujahr ist Jahr 2), yearly teilt durch H=3', true, 'fteY1 ' + s.fteY1 + ' · hoursIntY ' + s.hoursIntY.map(x => Math.round(x)).join('/') + ' · yearly ' + eur(s.yearly) + ' · (total−invest)/2 = ' + eur((s.total - s.invest) / 2));
  }
  ok('rolloutYears = 3, H = 3, budgetnext: Bestand nur zu 2/3 gehoben (reportsTotal faellt)', r.ry3.paid.reportsTotal < r.ry3off.paid.reportsTotal - 1,
     'mit ' + r.ry3.paid.reportsTotal.toFixed(2) + ' vs ohne ' + r.ry3off.paid.reportsTotal.toFixed(2) + ' Reports (Bestand ' + 12 + ')');
}

/* ====================================================================== */
console.log('\n--- Fall 7 · CapEx an / aus ---');
/* Erwartung: calc() liest S.capex nicht (nur c.capexBase = A wird ausgewiesen, Z. 4019). Summe, cf und
   alle Posten sind identisch; nur die GuV-Zeile (Z. 4514) aendert sich um capexBase·(1 − 1/life). */
{
  await base();
  const r = await ev(async () => { S.capex = { on: false, life: 5 }; update(); await new Promise(r => setTimeout(r, 300)); const off = window.__all(); off.dom = document.getElementById('capex').innerText;
    S.capex = { on: true, life: 5 }; update(); await new Promise(r => setTimeout(r, 300)); const on = window.__all(); on.dom = document.getElementById('capex').innerText; return { off, on }; });
  for (const k of KEYS) {
    const a = r.off[k], c = r.on[k];
    ok('[' + k + '] Zahlungssumme und Posten identisch', near(a.total, c.total, 1e-6) && CATS.every(x => near(a.cats[x], c.cats[x], 1e-6)) && a.cf.every((v, i) => near(v, c.cf[i], 1e-6)), eur(a.total) + ' / ' + eur(c.total));
    const guvOff = c.cf[c.bnY] /* alles Aufwand */, guvOn = c.cf[c.bnY] - c.capexBase + c.capexBase / 5;
    ok('[' + k + '] GuV-Wirkung Jahr 1 sinkt um capexBase·(1−1/5)', near(guvOff - guvOn, c.capexBase * .8, .01), 'Aufwand ' + eur(guvOff) + ' -> ' + eur(guvOn) + ' · aktivierbar ' + eur(c.capexBase) + ' (' + (100 * c.capexBase / c.total).toFixed(1) + ' % der Summe)');
  }
  ok('GuV-Zeilen erscheinen nur bei eingeschalteter Aktivierung', !/GuV-Wirkung im ersten Betriebsjahr/.test(r.off.dom) && /GuV-Wirkung im ersten Betriebsjahr/.test(r.on.dom), 'aus: ' + /GuV-Wirkung im ersten Betriebsjahr/.test(r.off.dom) + ' an: ' + /GuV-Wirkung im ersten Betriebsjahr/.test(r.on.dom));
  await ev(() => { S.capex = { on: false, life: 5 }; });
}

/* ====================================================================== */
console.log('\n--- Fall 8 · Viewer-Deckel unter der Viewerzahl ---');
/* Erwartung aus Z. 3873: V(y) = min(V·gr^y, cap). Mit cap = 20 < V = 40 ist V(y) = 20 in JEDEM Jahr,
   also auch im Jahr 0 — der Deckel kappt nicht nur das Wachstum, er senkt die Eingabe. Lizenzbasis
   je Jahr = packU(20·0,85 + 3) = 20 Einheiten, konstant; vAvg = 20. */
{
  await base();
  const r = await ev(() => { const ohne = window.__all(); S.viewerCap = 20; const mit = window.__all(); S.viewerCap = 0; S.viewers = 20; S.g.growth = [0, 0, 0]; const v20 = window.__all(); S.g.growth = [0, 10, 20]; S.viewers = 40; return { ohne, mit, v20 }; });
  ok('[paid] Lizenz waechst nicht ueber den Deckel: licF (Nutzerjahre je Kopf) · users = 20 Einheiten je Jahr', near(r.mit.paid.licF * (40 + 3) / r.mit.paid.inflF, 20, .01), (r.mit.paid.licF * 43 / r.mit.paid.inflF).toFixed(3) + ' Einheiten');
  ok('[paid] Lizenz mit Deckel 20 < Lizenz ohne Deckel', r.mit.paid.licPrice < r.ohne.paid.licPrice, eur(r.mit.paid.licPrice) + ' < ' + eur(r.ohne.paid.licPrice));
  ok('vAvg = 20 (Deckel wirkt ab Jahr 0, nicht erst auf das Wachstum)', near(r.mit.paid.vAvg, 20, 1e-9), r.mit.paid.vAvg);
  for (const k of KEYS) ok('[' + k + '] Deckel 20 bei 40 Viewern == 20 Viewer ohne Wachstum (Deckel ersetzt die Eingabe, Cent-genau)', near(r.mit[k].total, r.v20[k].total, .01), 'Deckel ' + eur(r.mit[k].total) + ' · 20 Viewer/0 % ' + eur(r.v20[k].total) + ' · 40 Viewer ' + eur(r.ohne[k].total));
}

/* ====================================================================== */
console.log('\n--- Fall 9 · Bestand 60 Reports auf Paid, Wechsel ---');
/* Erwartung aus Z. 3890–3893: doSwitch nur fuer key != baseline. switch = 60·rprLib·migFactor·rate0 > 0
   fuer oss/deneb/core, 0 fuer paid. Zusaetzlich zaehlt der Bestand in jedem Ansatz in die
   Stichprobe der Konformitaetspruefung (stockRep) und in die Ausstiegs-Kennzahl. */
{
  await base();
  const r = await ev(() => { const none = window.__all(); S.baseline = 'paid'; S.existing = 60; const sw = window.__all(); return { none, sw }; });
  for (const k of KEYS) {
    const s = r.sw[k].cats.switch;
    if (k === 'paid') ok('[paid] Migration = 0 (Bestand bleibt)', s === 0, eur(s));
    else ok('[' + k + '] Migration > 0', s > 0, eur(s) + ' = ' + (100 * s / r.sw[k].total).toFixed(1) + ' % der Summe');
    ok('[' + k + '] ohne Bestand: Migration = 0', r.none[k].cats.switch === 0, eur(r.none[k].cats.switch));
    ok('[' + k + '] Bestand erhoeht Governance (Pruef-Stichprobe) und Ausstieg', r.sw[k].cats.gov > r.none[k].cats.gov && r.sw[k].exitCost > r.none[k].exitCost, 'gov +' + eur(r.sw[k].cats.gov - r.none[k].cats.gov) + ' · exit ' + eur(r.none[k].exitCost) + ' -> ' + eur(r.sw[k].exitCost));
  }
}

/* ====================================================================== */
console.log('\n--- Fall 10 · Gepaarte vs. ungepaarte Ziehung ---');
/* Erwartung: expected() nutzt pertMean, der Schalter S.paired greift nur bei draw === pert (Z. 3812).
   Erwartungswert identisch auf den Cent. P50 aus 2.000 Szenarien weicht < 3 % ab (gleiche
   Randverteilungen, andere Kopplung). */
{
  await base();
  const r = await ev(() => { const o = {}; ['paid', 'oss', 'deneb', 'core'].forEach(k => { S.paired = true; const e1 = expected(k).total, s1 = simulate(k, 2000); S.paired = false; const e2 = expected(k).total, s2 = simulate(k, 2000); o[k] = { e1, e2, p50a: s1.p50, p50b: s2.p50, p90a: s1.p90, p90b: s2.p90 }; }); S.paired = true; return o; });
  for (const k of KEYS) {
    ok('[' + k + '] Erwartungswert unabhaengig von paired', r[k].e1 === r[k].e2, eur(r[k].e1) + ' / ' + eur(r[k].e2));
    ok('[' + k + '] P50 gepaart vs. ungepaart < 3 % Abstand', Math.abs(r[k].p50a - r[k].p50b) / r[k].p50a < .03, Math.round(r[k].p50a) + ' / ' + Math.round(r[k].p50b) + ' (' + pct(r[k].p50b, r[k].p50a) + ') · P90 ' + Math.round(r[k].p90a) + ' / ' + Math.round(r[k].p90b));
  }
}

/* ====================================================================== */
console.log('\n--- Fall 11 · Share-Link-Rundlauf ---');
/* Erwartung: writeHash() → defaults() → readHash() stellt S feldweise wieder her, inkl. rc, dist, capex,
   offers, hAnchor, mUnc, mixOv. Zweiter Teil: readHash() setzt S.mixOv nicht zurueck, wenn der Link
   kein mv traegt (Z. 4997–5000: nur Zuweisung im if-Zweig) — ein Link ohne Override in eine Sitzung
   mit Override geladen behaelt den Override. */
{
  await base();
  const r = await ev(() => {
    S.creators = 7; S.viewers = 333; S.reports = 41; S.types = 4; S.horizon = 10; S.ssShare = 40; S.licModel = 'peruser'; S.baseline = 'deneb'; S.existing = 17;
    S.flags.certonly = true; S.flags.novat = true; S.lib = true; S.paired = false; S.riskQ = 75; S.viewerCap = 900; S.models = 4; S.dist = 'file'; S.mUnc = 10;
    S.capex = { on: true, life: 3 }; S.rc = { sh: [30, 50, 20], cpr: [7, 5.5, 4], mix: [[80, 20, 0], [30, 50, 20], [10, 40, 50]] }; S.ibcsAll = true; S.mixOv = [40, 35, 25];
    S.offers = [{ vendor: 'X', model: 'peruser', price: 50, users: 0, term: 1, disc: 0, supInc: true, sup: 0, infl: '', note: '' }, { vendor: 'Y', model: 'site', price: 20000, users: 500, term: 3, disc: 10, supInc: false, sup: 1500, infl: 4, note: 'Rahmen' }]; S.offerOn = 1;
    applyAnchor('blind'); S.g.growth = [0, 5, 12]; S.p.paid.lic = [45, 70, 120]; S.prio.copilot = 'M'; S.level = 3; S.weight = 55;
    syncDerived();
    const before = JSON.parse(JSON.stringify(S)); const tBefore = expected('paid').total;
    writeHash(); const hash = location.hash;
    defaults(); const okRead = readHash(); const after = JSON.parse(JSON.stringify(S)); const tAfter = expected('paid').total;
    const diffs = []; const walk = (a, b, p) => { if (Array.isArray(a) || (a && typeof a === 'object')) { const ks = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]); ks.forEach(k => walk(a ? a[k] : undefined, b ? b[k] : undefined, p + '.' + k)); } else if (a !== b) diffs.push(p + ': ' + JSON.stringify(a) + ' -> ' + JSON.stringify(b)); };
    walk(before, after, 'S');
    /* Teil 2: Link ohne Override in eine Sitzung mit Override */
    defaults(); writeHash(); const hashNoOv = location.hash; S.mixOv = [40, 35, 25]; S.rc.mix[0] = [70, 30, 0]; readHash(); const mixOvAfter = S.mixOv, rcMix0 = S.rc.mix[0].join('/');
    defaults(); return { okRead, diffs, hashLen: hash.length, tBefore, tAfter, mixOvAfter, rcMix0, hashNoOvLen: hashNoOv.length };
  });
  ok('readHash() liest den eigenen Link', r.okRead === true, 'Laenge ' + r.hashLen);
  ok('S nach Rundlauf feldweise gleich (rc, dist, capex, offers, hAnchor, mUnc, mixOv, flags, g, p, prio)', r.diffs.length === 0, r.diffs.length ? r.diffs.slice(0, 8).join(' | ') : 'keine Abweichung');
  ok('Erwartungswert Paid vor/nach Rundlauf identisch', near(r.tBefore, r.tAfter, .01), eur(r.tBefore) + ' / ' + eur(r.tAfter));
  ok('Link ohne Chart-Mix-Override setzt einen vorhandenen Override zurueck', r.mixOvAfter === null, 'mixOv nach readHash: ' + JSON.stringify(r.mixOvAfter) + ' (erwartet null)');
  ok('Link mit rc.m stellt die Klassen-Mixe wieder her', r.rcMix0 === '85/15/0', r.rcMix0);
}

/* ====================================================================== */
console.log('\n--- Fall 12 · Raster Ersteller × Viewer × Horizont ---');
/* Erwartung: in allen 48 Kombinationen und vier Ansaetzen total und alle Posten endlich und >= 0,
   Σ Posten = total (0,5 EUR), Σcf = total (0,5 EUR), cf.length = H, hard + soft = total. */
{
  await base();
  const grid = await ev(() => { const out = []; for (const c of [1, 3, 25, 200]) for (const v of [10, 40, 1500, 10000]) for (const h of [3, 5, 10]) { S.creators = c; S.viewers = v; S.horizon = h; syncDerived(); const o = window.__all(); out.push({ c, v, h, r: o, bad: ['paid', 'oss', 'deneb', 'core'].map(k => window.__bad(o[k])).flat() }); } return out; });
  let fails = 0, worstCat = 0, worstCf = 0, minTot = Infinity, maxTot = 0;
  for (const g of grid) for (const k of KEYS) {
    const s = g.r[k]; const sc = CATS.reduce((a, c) => a + s.cats[c], 0), scf = s.cf.reduce((a, v) => a + v, 0);
    worstCat = Math.max(worstCat, Math.abs(sc - s.total)); worstCf = Math.max(worstCf, Math.abs(scf - s.total)); minTot = Math.min(minTot, s.total); maxTot = Math.max(maxTot, s.total);
    const good = g.bad.length === 0 && near(sc, s.total, .5) && near(scf, s.total, .5) && s.cf.length === g.h && near(s.hard + s.soft, s.total, .01);
    if (!good) { fails++; ok('[' + k + '] c=' + g.c + ' v=' + g.v + ' H=' + g.h, false, g.bad.join(',') + ' Σcats−total ' + eur(sc - s.total) + ' Σcf−total ' + eur(scf - s.total)); }
  }
  ok('48 Kombinationen × 4 Ansaetze: endlich, nicht negativ, Σcats = total, Σcf = total, hard+soft = total', fails === 0, 'max |Σcats−total| ' + worstCat.toExponential(2) + ' · max |Σcf−total| ' + worstCf.toExponential(2) + ' · Summen von ' + eur(minTot) + ' bis ' + eur(maxTot));
}

/* ====================================================================== */
console.log('\n--- Fall 13 · Monotonie ---');
/* Erwartung Viewer: mehr Viewer -> Paid nie billiger. Aus Z. 3875 folgt das Gegenteil an den
   Staffelgrenzen: staffelD ist eine Stufenfunktion auf ALLE Einheiten (100·0,8 = 80 > 110·0,6 = 66).
   Mit lvs = 0,8333, 3 Erstellern und ohne Wachstum liegt die erste Klippe zwischen 116 und 117 Viewern
   (packU(116·0,8333+3) = 100 -> packU(117·0,8333+3) = 110); mit 10 % Wachstum rutscht sie in spaetere Jahre und
   damit auf kleinere Eingaben (79 -> 80 Viewer). Bei Modell 'peruser' muss die Lizenz monoton sein.
   Erwartung Ersteller: build = A haengt nicht von Erstellern ab (gleich), Schulung steigt. */
{
  await base();
  const r = await ev(() => {
    const sweep = []; for (let v = 10; v <= 6000; v += (v < 200 ? 1 : v < 1000 ? 5 : 25)) { S.viewers = v; sweep.push([v, expected('paid').total, expected('paid').licPrice]); }
    const drops = []; for (let i = 1; i < sweep.length; i++) if (sweep[i][1] < sweep[i - 1][1] - .005) drops.push({ from: sweep[i - 1][0], to: sweep[i][0], d: sweep[i][1] - sweep[i - 1][1], lic: sweep[i][2] - sweep[i - 1][2] });
    S.licModel = 'peruser'; const sweepPU = []; for (let v = 10; v <= 6000; v += (v < 200 ? 1 : v < 1000 ? 5 : 25)) { S.viewers = v; sweepPU.push([v, expected('paid').total]); }
    const dropsPU = []; for (let i = 1; i < sweepPU.length; i++) if (sweepPU[i][1] < sweepPU[i - 1][1] - .005) dropsPU.push([sweepPU[i - 1][0], sweepPU[i][0]]);
    S.licModel = 'staffel'; S.viewers = 40;
    const cr = {}; ['paid', 'oss', 'deneb', 'core'].forEach(k => { cr[k] = []; for (const c of [1, 2, 3, 5, 8, 13, 25, 50, 100, 200]) { S.creators = c; syncDerived(); const e = expected(k); cr[k].push([c, e.build, e.train, e.rollout, e.total]); } });
    S.creators = 3; syncDerived();
    const other = {}; ['oss', 'deneb', 'core'].forEach(k => { const t = []; for (let v = 10; v <= 6000; v += (v < 200 ? 1 : v < 1000 ? 5 : 25)) { S.viewers = v; t.push(expected(k).total); } other[k] = t.some((x, i) => i > 0 && x < t[i - 1] - .005); }); S.viewers = 40;
    return { drops, dropsPU, cr, other };
  });
  ok('[paid] Gesamtkosten steigen monoton mit den Viewern (Staffel)', r.drops.length === 0, r.drops.length + ' Rueckgaenge: ' + r.drops.slice(0, 6).map(d => d.from + '->' + d.to + ' Viewer: ' + eur(d.d) + ' (Lizenz ' + eur(d.lic) + ')').join(' | '));
  ok('[paid] Gesamtkosten monoton mit den Viewern (pro Nutzer, ohne Staffel)', r.dropsPU.length === 0, r.dropsPU.length + ' Rueckgaenge ' + JSON.stringify(r.dropsPU.slice(0, 4)));
  for (const k of ['oss', 'deneb', 'core']) ok('[' + k + '] Gesamtkosten monoton mit den Viewern', !r.other[k], r.other[k] ? 'Rueckgang gefunden' : 'kein Rueckgang 10…6000');
  for (const k of KEYS) {
    const a = r.cr[k]; const buildMono = a.every((x, i) => i === 0 || x[1] >= a[i - 1][1] - .005), trainMono = a.every((x, i) => i === 0 || x[2] >= a[i - 1][2] - .005), rollMono = a.every((x, i) => i === 0 || x[3] >= a[i - 1][3] - .005);
    ok('[' + k + '] mehr Ersteller: Aufbau nie kleiner (ist von Erstellern unabhaengig), Schulung nie kleiner, Rollout nie kleiner', buildMono && trainMono && rollMono,
       'build ' + eur(a[0][1]) + '…' + eur(a[a.length - 1][1]) + ' · train ' + eur(a[0][2]) + '…' + eur(a[a.length - 1][2]) + ' · rollout ' + eur(a[0][3]) + '…' + eur(a[a.length - 1][3]));
  }
}

/* ====================================================================== */
console.log('\n--- Zusatz Z1 · Rollout-Jahre > Horizont, Modelle = 20, Verteilweg Datei, Stunden-Anker, Mengen-Unsicherheit ---');
{
  await base();
  const r = await ev(() => {
    const o = {};
    S.horizon = 3; S.g.rolloutYears = [20, 20, 20]; o.ry = window.__all(); o.rySQ = window.__sq();
    S.g.rolloutYears = [3, 3, 3]; o.ry3 = window.__all(); S.g.rolloutYears = [1, 2, 3]; S.horizon = 5;
    o.m1 = window.__all(); S.models = 20; o.m20 = window.__all(); S.models = 1;
    o.dn = window.__all(); S.dist = 'file'; o.df = window.__all(); S.dist = 'none';
    o.panel = window.__all(); applyAnchor('kons'); o.kons = window.__all(); applyAnchor('blind'); o.blind = window.__all(); applyAnchor('panel');
    const keep = JSON.stringify([S.creators, S.viewers, S.reports, S.cpr, S.types]); S.mUnc = 20; const e0 = expected('paid').total; const s20 = simulate('paid', 2000); const after = JSON.stringify([S.creators, S.viewers, S.reports, S.cpr, S.types]); S.mUnc = 0; const s0 = simulate('paid', 2000); const e1 = expected('paid').total;
    o.mu = { keep, after, e0, e1, p50a: s0.p50, p50b: s20.p50, p10a: s0.p10, p10b: s20.p10, p90a: s0.p90, p90b: s20.p90 };
    return o;
  });
  for (const k of KEYS) {
    ok('[' + k + '] rolloutYears = 20 bei H = 3: RY = 3, Werte endlich, reportsTotal wie bei RY = 3', r.ry[k].rolloutYears === 3 && near(r.ry[k].reportsTotal, r.ry3[k].reportsTotal, 1e-6) && (await ev(o => window.__bad(o), r.ry[k])).length === 0, 'RY ' + r.ry[k].rolloutYears + ' · reportsTotal ' + r.ry[k].reportsTotal.toFixed(3) + ' · SQ ' + r.rySQ.reportsTotal.toFixed(3));
    const mf = 1 + { paid: .05, oss: .05, deneb: .15, core: .5 }[k] * 19;
    ok('[' + k + '] 20 Modelle: modF = ' + mf.toFixed(2) + ', Aufbau skaliert (ohne devH) entsprechend', near(r.m20[k].modF, mf, 1e-9) && r.m20[k].cats.build > r.m1[k].cats.build, 'build ' + eur(r.m1[k].cats.build) + ' -> ' + eur(r.m20[k].cats.build) + ' (×' + (r.m20[k].cats.build / r.m1[k].cats.build).toFixed(2) + ') · total ' + eur(r.m1[k].total) + ' -> ' + eur(r.m20[k].total));
    ok('[' + k + '] Verteilweg Datei: Governance aendert sich, Lizenz nicht, endlich', !near(r.df[k].cats.gov, r.dn[k].cats.gov, .01) && near(r.df[k].cats.lic, r.dn[k].cats.lic, .01), 'gov ' + eur(r.dn[k].cats.gov) + ' -> ' + eur(r.df[k].cats.gov) + ' · maint ' + eur(r.dn[k].cats.maint) + ' -> ' + eur(r.df[k].cats.maint));
    ok('[' + k + '] Anker Konservativ (×1,5) teurer als Panel, Lizenz gleich', r.kons[k].total > r.panel[k].total && near(r.kons[k].licPrice, r.panel[k].licPrice, .01), 'Panel ' + eur(r.panel[k].total) + ' · Kons ' + eur(r.kons[k].total) + ' (' + pct(r.kons[k].total, r.panel[k].total) + ') · Blind ' + eur(r.blind[k].total));
  }
  ok('Mengen-Unsicherheit 20 %: simulate() stellt das Mengengeruest wieder her, Erwartungswert unveraendert', r.mu.keep === r.mu.after && r.mu.e0 === r.mu.e1, r.mu.keep + ' / ' + r.mu.after);
  ok('Mengen-Unsicherheit 20 %: P50 bewegt sich < 3 %, Band wird breiter', Math.abs(r.mu.p50b - r.mu.p50a) / r.mu.p50a < .03 && (r.mu.p90b - r.mu.p10b) > (r.mu.p90a - r.mu.p10a), 'P50 ' + Math.round(r.mu.p50a) + ' -> ' + Math.round(r.mu.p50b) + ' · Band ' + Math.round(r.mu.p90a - r.mu.p10a) + ' -> ' + Math.round(r.mu.p90b - r.mu.p10b));
}

/* ====================================================================== */
console.log('\n--- Zusatz Z2 · Eingaben ohne Obergrenze: Lernrate 100 %, Produktivitaetsgewinn > 100 %, extern > 100 % ---');
/* Erwartung aus applyParamEdit() (nur Untergrenze geprueft) und learnSeg() Z. 3862: lrn = 100 ->
   be = −log(0)/ln2 = ∞ -> NaN. prodGain > 100 -> prod < 0 -> pf wechselt das Vorzeichen -> negative
   Posten. ext > 100 -> rate0 mit negativem Innenanteil. Das sind keine Rechenfehler im Normalbetrieb,
   sondern fehlende Deckel: das Feld traegt max=…, der Handler prueft es nicht. */
{
  await base();
  const r = await ev(() => { const o = {};
    S.p.paid.learn = [100, 100, 100]; o.learn = window.__snap('paid'); S.p.paid.learn = [99.9, 99.9, 99.9]; o.learn999 = window.__snap('paid');
    S.p.paid.learn = [50, 50, 50]; o.learn50 = window.__snap('paid'); S.p.paid.learn = [49, 49, 49]; o.learn49 = window.__snap('paid'); S.p.paid.learn = [51, 51, 51]; o.learn51 = window.__snap('paid'); S.p.paid.learn = [30, 30, 30]; o.learn30 = window.__snap('paid'); S.p.paid.learn = [0, 5, 10];
    S.p.paid.prodGain = [150, 150, 150]; o.prod = window.__snap('paid'); S.p.paid.prodGain = [-1, 0, 2];
    S.p.paid.ext = [150, 150, 150]; o.ext = window.__snap('paid'); S.p.paid.ext = [0, 25, 55];
    S.g.churn = [300, 300, 300]; o.churn = window.__snap('paid'); S.g.churn = [5, 11, 22];
    o.maxAttr = { learn: (GLOBAL.concat(OPTP).find(x => x.id === 'learn') || {}).max, prodGain: (GLOBAL.concat(OPTP).find(x => x.id === 'prodGain') || {}).max, ext: (GLOBAL.concat(OPTP).find(x => x.id === 'ext') || {}).max };
    return o; });
  const badL = await ev(o => window.__bad(o), r.learn), badP = await ev(o => window.__bad(o), r.prod), badE = await ev(o => window.__bad(o), r.ext), badC = await ev(o => window.__bad(o), r.churn);
  ok('Lernrate 100 % liefert endliche Zahlen', badL.length === 0, badL.slice(0, 4).join(',') || eur(r.learn.total));
  ok('Lernrate 99,9 % liefert plausible Zahlen (Rollout < 10 × Default)', (await ev(o => window.__bad(o), r.learn999)).length === 0 && r.learn999.cats.rollout < 10 * 13214, 'rollout ' + eur(r.learn999.cats.rollout) + ' (Default 13.214)');
  ok('Lernrate exakt 50 % liefert endliche Zahlen (al = 1 − be = 0 -> 0/0 in learnSeg)', (await ev(o => window.__bad(o), r.learn50)).length === 0, (await ev(o => window.__bad(o), r.learn50)).slice(0, 3).join(',') || eur(r.learn50.total));
  ok('Lernrate 49 % -> 51 % stetig (Rollout aendert sich < 20 %)', Math.abs(r.learn51.cats.rollout - r.learn49.cats.rollout) < .2 * r.learn49.cats.rollout, 'rollout 30 % ' + eur(r.learn30.cats.rollout) + ' · 49 % ' + eur(r.learn49.cats.rollout) + ' · 51 % ' + eur(r.learn51.cats.rollout));
  {const pg = await ev(async () => { S.p.paid.learn = [100, 100, 100]; update(); await new Promise(r => setTimeout(r, 300)); const t = window.__pageBad(); const h = document.getElementById('headline').innerText.slice(0, 160); S.p.paid.learn = [0, 5, 10]; update(); return { t, h }; });
   ok('Seite mit Lernrate 100 % zeigt kein NaN', pg.t.length === 0, (pg.t.join(',') || 'sauber') + ' · Headline: ' + pg.h);}
  ok('Produktivitaetsgewinn 150 %/Jahr liefert keine negativen Posten', badP.length === 0, badP.slice(0, 4).join(',') || eur(r.prod.total));
  ok('Externer Anteil 150 % liefert keine negativen Posten', badE.length === 0, badE.slice(0, 4).join(',') || ('total ' + eur(r.ext.total) + ' hard ' + eur(r.ext.hard) + ' soft ' + eur(r.ext.soft)));
  ok('Fluktuation 300 %/Jahr: endlich (Nachschulung dreifach, kein Deckel)', badC.length === 0, 'train ' + eur(r.churn.cats.train));
  ok('max-Attribute der drei Felder (Information)', true, JSON.stringify(r.maxAttr));
}

/* ====================================================================== */
console.log('\n--- Zusatz Z3 · Mengengeruest-Raender: Report-Klassen ohne Charts, Wachstum −100 %, Staffelklippe der Lizenzbasis ---');
{
  await base();
  const r = await ev(() => { const o = {};
    S.rc.cpr = [0, 0, 0]; syncDerived(); o.cpr0 = window.__all(); o.cpr0cpr = S.cpr; S.rc.cpr = [8, 6, 5]; syncDerived();
    S.g.growth = [-100, -100, -100]; o.gneg = window.__all(); S.g.growth = [0, 10, 20];
    S.g.growth = [0, 0, 0]; const lvs = pertMean(S.g.licViewerShare) / 100; const pk = u => u <= 5 ? 5 : Math.ceil(u / 10) * 10; let vc = 50; while (pk(vc * lvs + S.creators) <= 100) vc++; o.vc = vc; S.viewers = vc - 1; o.v114 = window.__snap('paid'); S.viewers = vc; o.v115 = window.__snap('paid'); S.viewers = 40; S.g.growth = [0, 10, 20];
    o.cliff = staffelCliff();
    return o; });
  for (const k of KEYS) {
    ok('[' + k + '] Report-Klassen mit 0 Charts: endlich (Rollout 0, cprW-Schutz ||1)', (await ev(o => window.__bad(o), r.cpr0[k])).length === 0, 'total ' + eur(r.cpr0[k].total) + ' rollout ' + eur(r.cpr0[k].cats.rollout) + ' compMult ' + r.cpr0[k].compMult + ' S.cpr ' + r.cpr0cpr);
    ok('[' + k + '] Wachstum −100 %: Viewer ab Jahr 2 = 0, endlich', (await ev(o => window.__bad(o), r.gneg[k])).length === 0 && near(r.gneg[k].vAvg, 40 / 5, 1e-9), 'vAvg ' + r.gneg[k].vAvg + ' total ' + eur(r.gneg[k].total));
  }
  ok('[paid] ' + (r.vc - 1) + ' -> ' + r.vc + ' Viewer (ohne Wachstum): Lizenz faellt (Staffelklippe 100 -> 110 Einheiten, Faktor 0,8 -> 0,6)', r.v115.licPrice < r.v114.licPrice, eur(r.v114.licPrice) + ' -> ' + eur(r.v115.licPrice) + ' (' + pct(r.v115.licPrice, r.v114.licPrice) + ') · total ' + eur(r.v114.total) + ' -> ' + eur(r.v115.total));
  ok('staffelCliff() meldet diese Klippe nicht (prueft nur reduzierte vs. volle Basis)', true, 'staffelCliff() bei 40 Viewern = ' + r.cliff);
}

await R.finish(b);
})();
