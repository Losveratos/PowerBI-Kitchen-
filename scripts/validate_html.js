// Validiert, dass der EPISODES-Array im HTML weiterhin parsbar ist
// und dass die Karten-Anzahl pro Bucket stimmt.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const HTML = path.resolve(__dirname, '..', 'daten_wg_learn_buckets.html');
const html = fs.readFileSync(HTML, 'utf-8');

// Re-Extraktion mit derselben Klammer-Logik
const startMarker = 'const EPISODES = [';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) { console.error('FAIL: EPISODES nicht gefunden'); process.exit(1); }
const arrStart = html.indexOf('[', startIdx);

let depth = 0, inStr = null, inLineComment = false, inBlockComment = false, escape = false;
let i = arrStart;
for (; i < html.length; i++) {
  const c = html[i];
  if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
  if (inBlockComment) { if (c === '*' && html[i+1] === '/') { inBlockComment = false; i++; } continue; }
  if (inStr) {
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === inStr) inStr = null;
    continue;
  }
  if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
  if (c === '/' && html[i+1] === '/') { inLineComment = true; i++; continue; }
  if (c === '/' && html[i+1] === '*') { inBlockComment = true; i++; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { i++; break; } }
}
const arrSource = html.substring(arrStart, i);

const ctx = { result: null };
vm.createContext(ctx);
try {
  vm.runInContext(`result = ${arrSource};`, ctx);
} catch (e) {
  console.error('FAIL: Eval-Fehler:', e.message);
  // Versuche, die Fehler-Region zu zeigen
  if (e.message.match(/at position (\d+)/)) {
    const pos = parseInt(e.message.match(/at position (\d+)/)[1]);
    console.error('Kontext:', arrSource.substring(Math.max(0, pos-50), pos+50));
  }
  process.exit(2);
}

const eps = ctx.result;
console.log(`PASS: ${eps.length} Episoden geparst`);

const byBucket = {};
const ytIds = new Set();
let dupYt = 0;
let noChapter = 0;
let withYtId = 0;
for (const e of eps) {
  byBucket[e.bucket] = (byBucket[e.bucket] || 0) + 1;
  if (e.ytId) {
    if (ytIds.has(e.ytId)) dupYt++;
    ytIds.add(e.ytId);
    withYtId++;
  }
  if (!e.chapters || e.chapters.length === 0) noChapter++;
}
console.log('  Bucket-Verteilung:', byBucket);
console.log(`  Episoden mit ytId: ${withYtId}/${eps.length}`);
console.log(`  Episoden ohne Kapitel: ${noChapter}`);
console.log(`  ytId-Duplikate: ${dupYt}`);

// Schema-Check: required fields
const required = ['bucket', 'title', 'guest', 'solo', 'date', 'duration', 'lang', 'desc', 'tags', 'chapters'];
let schemaErr = 0;
eps.forEach((e, i) => {
  for (const f of required) {
    if (!(f in e)) {
      console.error(`  SCHEMA-FAIL[${i}]: feldfehlt '${f}' in "${e.title || '?'}"`);
      schemaErr++;
    }
  }
  if (!Array.isArray(e.tags) || e.tags.length === 0) {
    console.error(`  TAG-FAIL[${i}]: tags leer in "${e.title}"`);
    schemaErr++;
  }
});

// Volltextsuche-Probe: jedes Video sollte ueber Titel oder Gast findbar sein
let searchOk = 0;
for (const e of eps) {
  const hay = `${e.title} ${e.guest}`.toLowerCase();
  if (hay.length > 5) searchOk++;
}
console.log(`  Volltextsuche-tauglich: ${searchOk}/${eps.length}`);

// Tag-Stats: wie viele Tags haben count >= 5?
const tagCounts = {};
eps.forEach(e => (e.tags || []).forEach(t => tagCounts[t] = (tagCounts[t]||0)+1));
const ge5 = Object.entries(tagCounts).filter(([_, n]) => n >= 5);
console.log(`  Tags mit count >= 5: ${ge5.length}`);
ge5.sort((a, b) => b[1] - a[1]);
console.log('  Top-Tags:', ge5.slice(0, 12).map(([t, n]) => `${t}(${n})`).join(', '));

// Unsortiert-Quote
const unsorted = eps.filter(e => e.tags.includes('Unsortiert')).length;
console.log(`  Unsortiert: ${unsorted} (${(100*unsorted/eps.length).toFixed(1)}%)`);

// Datum-Format-Pruefung
const badDates = eps.filter(e => !e.date || e.date.length < 3).length;
console.log(`  Episoden mit leerem Datum: ${badDates}`);

if (schemaErr === 0 && dupYt === 0) {
  console.log('\nALL CHECKS PASSED');
  process.exit(0);
} else {
  console.error(`\nERRORS: schema=${schemaErr} dupYt=${dupYt}`);
  process.exit(3);
}
