#!/usr/bin/env node
/* Baut aus content.js die Fassung für die Fabric App:
   - <spiel-ordner>/content.js   öffentliche Inhalte OHNE Lösungen und Erklärungen
   - <function-ordner>/answer-key.ts   Lösungsschlüssel für die Function `grade`
   Aufruf: node daten-imperium/build-public-content.js <spiel-ordner> <function-src-ordner> */
'use strict';
const fs = require('fs');
const path = require('path');
const SPLIT = require('./split-content.js');

const [gameDir, fnDir] = process.argv.slice(2);
if (!gameDir || !fnDir) {
  console.error('Aufruf: node build-public-content.js <spiel-ordner> <function-src-ordner>');
  process.exit(1);
}
const NAMES = ['CATS', 'QUIZ', 'STAR', 'ORDER', 'CLINIC_ERRORS', 'CLINIC_SETS', 'DIALOGS', 'EXTRA_CARDS', 'CLIENTS',
  'SIZES', 'SUBJECTS', 'BODIES', 'ITEMS', 'OFFICES', 'STAFF', 'RIVALS', 'CONFS', 'RANKS', 'EVENTS', 'FILL', 'PQDEBUG'];
const src = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8').replace(/^'use strict';/m, '');
const C = new Function(src + '; return {' + NAMES.join(',') + '};')();
const { pub, key } = SPLIT.split(C);

const out = Object.assign({}, C, pub);
let js = '/* Daten-Imperium · öffentliche Inhalte für die Fabric App (generiert, nicht bearbeiten).\n' +
  '   Ohne Lösungen und Erklärungen; bewertet wird serverseitig in der Function `grade`.\n' +
  '   Quelle: daten-imperium/content.js, Generator: build-public-content.js */\n\'use strict\';\nconst DI_PUBLIC_CONTENT = true;\n';
for (const n of NAMES) js += 'const ' + n + ' = ' + JSON.stringify(out[n]) + ';\n';
fs.mkdirSync(gameDir, { recursive: true });
fs.writeFileSync(path.join(gameDir, 'content.js'), js);

// Kontrolle: Die öffentliche Fassung darf keine Lösungsfelder enthalten.
const leaks = [];
pub.QUIZ.forEach(q => { if ('a' in q || 'x' in q) leaks.push(q.id); });
pub.FILL.forEach(f => { if ('x' in f || f.blanks.some(b => 'a' in b)) leaks.push(f.id); });
pub.PQDEBUG.forEach(p => { if ('bad' in p || 'a' in p || 'x' in p) leaks.push(p.id); });
pub.ORDER.forEach(o => { if ('x' in o) leaks.push(o.id); });
pub.STAR.forEach(s => { if (s.tables.some(t => 'role' in t || 'key' in t || 'into' in t)) leaks.push(s.id); });
pub.DIALOGS.forEach(d => { if (d.steps.some(st => st.a.some(a => 's' in a || 'f' in a))) leaks.push(d.id); });
if (leaks.length) { console.error('Lösungen in der öffentlichen Fassung:', leaks); process.exit(2); }

const ts = '/* Generiert von daten-imperium/build-public-content.js. Nicht bearbeiten.\n' +
  '   Lösungsschlüssel des Daten-Imperiums, nur serverseitig in der Function. */\n' +
  '/* eslint-disable */\nexport const KEY: any = ' + JSON.stringify(key) + ';\n';
fs.mkdirSync(fnDir, { recursive: true });
fs.writeFileSync(path.join(fnDir, 'answer-key.ts'), ts);

const n = k => Object.keys(key[k]).length;
console.log(`öffentlich: ${(js.length / 1024).toFixed(0)} KB · Schlüssel: quiz ${n('quiz')}, fill ${n('fill')}, pq ${n('pq')}, star ${n('star')}, order ${n('order')}, dialog ${n('dialog')} · keine Lösungen im Browser`);
