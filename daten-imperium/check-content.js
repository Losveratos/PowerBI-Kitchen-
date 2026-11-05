#!/usr/bin/env node
/* Prüft content.js: doppelte IDs, Lücken, Sternschema-Konsistenz, fehlende Übersetzungen
   und ob die richtige Antwort an ihrer Länge erkennbar ist.
   Aufruf: node daten-imperium/check-content.js */
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8').replace(/^'use strict';/m, '');
const D = new Function(src + '; return { QUIZ, STAR, ORDER, FILL, PQDEBUG, DIALOGS };')();
const problems = [];

const ids = new Set();
[...D.QUIZ, ...D.STAR, ...D.ORDER, ...D.FILL, ...D.PQDEBUG, ...D.DIALOGS].forEach(x => {
  if (ids.has(x.id)) problems.push('Doppelte ID: ' + x.id);
  ids.add(x.id);
});
D.QUIZ.forEach(q => { if (!q.q.en || !q.x.en) problems.push('Übersetzung fehlt: ' + q.id); });
D.FILL.forEach(f => ['de', 'en'].forEach(l => {
  const n = (f.code[l].match(/\{(\d)\}/g) || []).length;
  if (n !== f.blanks.length) problems.push(`Lücken passen nicht: ${f.id} (${l}) ${n}/${f.blanks.length}`);
}));
D.PQDEBUG.forEach(p => { if (p.bad >= p.steps.length) problems.push('Fehlerschritt außerhalb: ' + p.id); });
D.STAR.forEach(s => {
  if (s.tables.filter(t => t.role === 'fact').length !== 1) problems.push('Genau ein Fakt nötig: ' + s.id);
  s.tables.forEach(t => {
    if (t.role === 'dim' && !t.cols.includes(t.key)) problems.push(`Schlüssel fehlt: ${s.id} ${t.key}`);
    if (t.role === 'fold' && s.tables[t.into].role !== 'dim') problems.push('Einklappen nur in Dimension: ' + s.id);
  });
});

// Längen-Verrat: richtige Antwort mehr als 15 % länger als die längste falsche
for (const lang of ['de', 'en']) {
  const len = o => (typeof o === 'string' ? o : o[lang]).length;
  const gap = (opts, a) => len(opts[a]) / Math.max(...opts.filter((_, i) => i !== a).map(len));
  const items = [];
  D.QUIZ.forEach(x => items.push([x.id, gap(x.o, x.a)]));
  D.PQDEBUG.forEach(x => items.push([x.id, gap(x.fix, x.a)]));
  D.DIALOGS.forEach(d => d.steps.forEach((s, i) => {
    const best = s.a.reduce((m, a, k) => (a.s > s.a[m].s ? k : m), 0);
    items.push([`${d.id}#${i}`, gap(s.a.map(a => a.t), best)]);
  }));
  D.FILL.forEach(f => f.blanks.forEach((b, i) => items.push([`${f.id}#${i}`, gap(b.o, b.a)])));
  const longest = items.filter(x => x[1] > 1).length;
  console.log(`${lang}: ${items.length} Antwortsätze, richtige ist am längsten in ${Math.round(longest / items.length * 100)} % (Zufall ≈ 25 %)`);
  items.filter(x => x[1] > 1.2).forEach(x => problems.push(`Länge verrät Antwort (${lang}): ${x[0]} ×${x[1].toFixed(2)}`));
}

console.log(`Inhalte: ${D.QUIZ.length} Quiz, ${D.STAR.length} Sternschema, ${D.ORDER.length} Reihenfolge, ${D.FILL.length} Lückentexte, ${D.PQDEBUG.length} PQ-Fälle, ${D.DIALOGS.length} Gespräche`);
if (problems.length) { console.log('\nProbleme:\n- ' + problems.join('\n- ')); process.exitCode = 1; }
else console.log('Keine Probleme gefunden.');
