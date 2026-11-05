/* Runde 3 · B · Wirkung der OSS-Annahmen auf die Gesamtkosten
   ==========================================================================
   Begleitskript zu b-annahmen-oss.md. Misst, was jede diskutierte Aenderung an
   den OSS-Annahmen (OPTP) an der Gesamtsumme bewegt — vorher/nachher, in zwei
   Presets: „Mittelstand" (3 Ersteller / 40 Viewer) und „Konzern" mit dem
   Modifier „OSS-Visual ueber den Organizational Store" (25 / 1.500, certonly).

   Gemessen wird expected('oss').total (PERT-Erwartungswert ueber den Horizont)
   und ergaenzend simulate('oss', N).p50 (Median der Simulation). Die
   Erfuellungsgrade (REQS.cap) wirken seit v0.10 nicht mehr auf Kosten; das
   Skript prueft das als Gegenprobe mit.

   Die HTML wird nicht veraendert: alle Aenderungen passieren im Seitenzustand S
   und werden nach jeder Messung zurueckgesetzt.

   Start:  node sessions/visual-standards-rechner-audit/runde3/b-wirkung.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus tests/rechner/lib/harness.js. */
'use strict';
const path = require('path');
const { chromium, openPage } = require(path.join(__dirname, '..', '..', '..', 'tests', 'rechner', 'lib', 'harness'));

const N_SIM = 3000;
const eur = x => Math.round(x).toLocaleString('de-DE') + ' €';
const pct = (a, b) => (b === 0 ? '–' : ((a - b) / b * 100).toFixed(1).replace('.', ',') + ' %');

/* Preset laden wie der Klick im Rechner (Handler an [data-preset]); Konzern zusaetzlich
   mit Org-Store-Weg: Modifier gesetzt und Verteilweg „org", wie es der Rechner beim
   Klick auf den Verteilweg selbst tut (S.dist==='org' setzt S.flags.orgstore). */
const PRESET = {
  mittelstand: () => { document.querySelector('[data-preset="mittelstand"]').click(); S.dist = 'none'; update(); },
  konzernOrg: () => { document.querySelector('[data-preset="konzern"]').click(); S.flags.orgstore = true; S.dist = 'org'; update(); },
};

/* Jede Messung: Annahme setzen, Erwartungswert und P50 lesen, Annahme zuruecksetzen. */
async function measure(page, label, mutate) {
  return page.evaluate(({ label, mutateSrc, N }) => {
    const snap = JSON.stringify({ p: S.p, lib: S.lib, dist: S.dist, flags: S.flags, cap: S.cap });
    const mutate = eval('(' + mutateSrc + ')');
    mutate();
    update();
    const e = expected('oss');
    const sim = simulate('oss', N);
    const paid = expected('paid').total;
    const out = { label, total: e.total, p50: sim.p50, paid, gov: e.cats ? e.cats.gov : undefined,
      cats: Object.fromEntries(['lic', 'build', 'rollout', 'train', 'maint', 'gov', 'risk'].map(k => [k, e[k]])) };
    const s = JSON.parse(snap);
    S.p = s.p; S.lib = s.lib; S.dist = s.dist; S.flags = s.flags; S.cap = s.cap;
    update();
    return out;
  }, { label, mutateSrc: mutate.toString(), N: N_SIM });
}

/* Die diskutierten Aenderungen aus b-annahmen-oss.md (Stufe b und c), plus Gegenproben. */
const CASES = [
  ['Basis (heutige Werte)', () => {}],
  ['3 · govIntake oss 8/24/60 → 8/16/40 h (Stufe c)', () => { S.p.oss.govIntake = [8, 16, 40]; }],
  ['3 · govIntake oss 8/24/60 → 6/12/30 h (Stufe c, halbiert)', () => { S.p.oss.govIntake = [6, 12, 30]; }],
  ['3 · Modifier „osscert" (govIntake = Paid-Wert, vorhandene Mechanik)', () => { S.flags.osscert = true; }],
  ['6 · Verteilweg „offen" → „Organizational Store" (DIST.org, vorhandene Mechanik)', () => { S.dist = 'org'; S.flags.orgstore = true; }],
  ['6 · Verteilweg „offen" → „Datei-Import je Bericht" (DIST.file, vorhandene Mechanik)', () => { S.dist = 'file'; S.flags.orgstore = false; }],
  ['6 · events oss 0,5/1,5/3 → 0,2/1/2 (= Paid; NICHT vorgeschlagen, nur Hebelgroesse)', () => { S.p.oss.events = [0.2, 1, 2]; }],
  ['2 · Schalter Vorlagenbibliothek an, libF oss heute 0,9/1/1', () => { S.lib = true; }],
  ['2 · Schalter an, libF oss 0,8/0,9/1 (Stufe c)', () => { S.lib = true; S.p.oss.libF = [0.8, 0.9, 1]; }],
  ['7 · support oss 0/0/1000 → 0/0/0 € (Stufe c, kein Sponsoring-Kanal)', () => { S.p.oss.support = [0, 0, 0]; }],
  ['Gegenprobe · REQS.cap datares oss 2 → 3 (keine Kostenwirkung erwartet)', () => { S.cap.datares = REQS.find(r => r.id === 'datares').cap.slice(); S.cap.datares[1] = 3; }],
  ['Gegenprobe · REQS.cap a11y oss 2 → 3 (keine Kostenwirkung erwartet)', () => { S.cap.a11y = REQS.find(r => r.id === 'a11y').cap.slice(); S.cap.a11y[1] = 3; }],
];

(async () => {
  const b = await chromium.launch();
  const page = await openPage(b, { viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  const result = {};
  for (const [preset, apply] of Object.entries(PRESET)) {
    await page.evaluate(apply);
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => ({ creators: S.creators, viewers: S.viewers, reports: S.reports, types: S.types,
      horizon: S.horizon, mode: S.mode, dist: S.dist, flags: Object.keys(S.flags).filter(k => S.flags[k]), lib: S.lib }));
    const rows = [];
    for (const [label, mutate] of CASES) rows.push(await measure(page, label, mutate));
    result[preset] = { state: st, rows };
  }
  await b.close();

  /* Ausgabe: je Preset eine Markdown-Tabelle, vorher/nachher gegen die Basis. */
  for (const [preset, { state, rows }] of Object.entries(result)) {
    const base = rows[0];
    console.log('\n### ' + preset + ' · ' + JSON.stringify(state));
    console.log('Paid zum Vergleich (Erwartungswert): ' + eur(base.paid));
    console.log('| Fall | Erwartungswert OSS | Δ zur Basis | P50 (Sim., N=' + N_SIM + ') | Δ P50 |');
    console.log('|:--|--:|--:|--:|--:|');
    for (const r of rows) {
      console.log('| ' + r.label + ' | ' + eur(r.total) + ' | ' + (r === base ? '–' : eur(r.total - base.total) + ' (' + pct(r.total, base.total) + ')') +
        ' | ' + eur(r.p50) + ' | ' + (r === base ? '–' : eur(r.p50 - base.p50)) + ' |');
    }
    console.log('Posten der Basis: ' + Object.entries(base.cats).map(([k, v]) => k + ' ' + eur(v)).join(' · '));
  }
  console.log('\nJS-Fehler: ' + (errs.length ? errs.join(' | ') : 'keine'));
  console.log('##JSON## ' + JSON.stringify(result));
})().catch(e => { console.error(e); process.exit(1); });
