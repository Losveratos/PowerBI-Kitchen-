#!/usr/bin/env node
'use strict';
/* Startet alle Pruefsuiten des Visual-Standards-Rechners nacheinander und fasst zusammen.
   Exit-Code 0 nur, wenn jede Suite ohne Fehlschlag und ohne JS-Fehler durchlaeuft.

   node tests/run-all.js              alle Suiten
   node tests/run-all.js lizenz graph nur Suiten, deren Dateiname eines der Muster enthaelt
   node tests/run-all.js --list       nur auflisten, nichts starten
   node tests/run-all.js --quiet      nur die Zusammenfassung, keine Einzelzeilen

   Einzeln bleibt jede Suite startbar:  node tests/rechner/<name>.test.js
   Laeuft aus jedem Verzeichnis — alle Pfade kommen aus __dirname. */

const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const TESTS = __dirname;
const SUITE_DIR = path.join(TESTS, 'rechner');

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const listOnly = args.includes('--list');
const filters = args.filter(a => !a.startsWith('-'));

/* Reihenfolge: erst die breite Grundregression, dann die Themen-Suiten. */
const ORDER = [
  'sicherheit-und-export',
  'eingaben-und-annahmen',
  'gefuehrter-einstieg',
  'inhaltsverzeichnis-und-graph',
  'lizenzbasis',
  'wirkungsgraph-abschnitt',
];

const found = fs.readdirSync(SUITE_DIR).filter(f => f.endsWith('.test.js')).sort();
const rank = f => { const i = ORDER.indexOf(f.replace(/\.test\.js$/, '')); return i < 0 ? 999 : i; };
let suites = found.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
if (filters.length) suites = suites.filter(f => filters.some(q => f.includes(q)));

if (!suites.length) {
  console.error('Keine Suite gefunden' + (filters.length ? ' fuer: ' + filters.join(', ') : ' in ' + SUITE_DIR));
  process.exit(2);
}
if (listOnly) { suites.forEach(s => console.log(path.join('tests', 'rechner', s))); process.exit(0); }

console.log('Visual-Standards-Rechner — ' + suites.length + ' Pruefsuite(n)\n');

const results = [];
for (const file of suites) {
  const name = file.replace(/\.test\.js$/, '');
  process.stdout.write('▶ ' + name + ' … ');
  const t0 = Date.now();
  const run = spawnSync(process.execPath, [path.join(SUITE_DIR, file)], {
    cwd: TESTS, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const out = (run.stdout || '') + (run.stderr || '');
  const m = out.match(/^##SUITE## (.+)$/m);
  const stats = m ? JSON.parse(m[1]) : null;
  const rec = {
    name, secs, code: run.status,
    checks: stats ? stats.checks : 0,
    fails: stats ? stats.fails : null,
    jsErrors: stats ? stats.jsErrors : null,
    out,
  };
  rec.bad = rec.code !== 0 || !stats || rec.fails > 0 || rec.jsErrors > 0;
  results.push(rec);
  console.log(rec.bad ? 'FEHLGESCHLAGEN (' + secs + ' s)' : rec.checks + ' Pruefungen OK (' + secs + ' s)');
  /* Ausgabe der Suite: im Fehlerfall immer, sonst nur ohne --quiet. */
  if (rec.bad || !quiet) {
    const lines = out.split('\n').filter(l => (rec.bad ? true : /^OK |^FAIL /.test(l)));
    console.log(lines.map(l => '    ' + l).join('\n').replace(/\s+$/, ''));
    console.log('');
  }
}

/* ---------------- Zusammenfassung ---------------- */
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const w = Math.max(20, ...results.map(r => r.name.length));
console.log('\n' + '='.repeat(w + 42));
console.log(pad('Suite', w) + lpad('Pruefungen', 12) + lpad('Fehler', 9) + lpad('Zeit', 8) + '  Ergebnis');
console.log('-'.repeat(w + 42));
for (const r of results) {
  const fehler = r.fails === null ? '?' : (r.fails + (r.jsErrors ? ' +' + r.jsErrors + ' JS' : ''));
  console.log(pad(r.name, w) + lpad(r.checks || '?', 12) + lpad(fehler, 9) + lpad(r.secs + ' s', 8) +
    '  ' + (r.bad ? 'FEHLGESCHLAGEN' : 'bestanden'));
}
console.log('-'.repeat(w + 42));
const totalChecks = results.reduce((a, r) => a + (r.checks || 0), 0);
const totalFails = results.reduce((a, r) => a + (r.fails || 0), 0);
const totalJs = results.reduce((a, r) => a + (r.jsErrors || 0), 0);
const badSuites = results.filter(r => r.bad);
const totalSecs = results.reduce((a, r) => a + Number(r.secs), 0).toFixed(1);
console.log(pad('SUMME (' + results.length + ' Suiten)', w) + lpad(totalChecks, 12) +
  lpad(totalFails + (totalJs ? ' +' + totalJs + ' JS' : ''), 9) + lpad(totalSecs + ' s', 8));
console.log('='.repeat(w + 42));
if (badSuites.length) {
  console.log('\nFEHLGESCHLAGEN: ' + badSuites.map(r => r.name).join(', '));
  process.exit(1);
}
console.log('\nAlle Suiten bestanden.');
process.exit(0);
