// Extrahiert die EPISODES-Konstante aus daten_wg_learn_buckets.html
// und schreibt sie als JSON nach existing_episodes.json.
//
// Trick: Wir kopieren den JS-Block in einen vm.Context und evaluieren ihn.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'daten_wg_learn_buckets.html');
const OUT  = path.join(ROOT, 'existing_episodes.json');

const html = fs.readFileSync(HTML, 'utf-8');

// EPISODES-Block finden via Regex (balanciertes Klammer-Match manuell)
const startMarker = 'const EPISODES = [';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Konnte "const EPISODES = [" nicht finden.');
  process.exit(1);
}
// Position des öffnenden [
const arrStart = html.indexOf('[', startIdx);

// Klammer-Tracking: ueberspringe strings/comments
let depth = 0;
let inStr = null;     // null | '"' | "'" | '`'
let inLineComment = false;
let inBlockComment = false;
let i = arrStart;
let escape = false;
for (; i < html.length; i++) {
  const c = html[i];
  if (inLineComment) {
    if (c === '\n') inLineComment = false;
    continue;
  }
  if (inBlockComment) {
    if (c === '*' && html[i+1] === '/') { inBlockComment = false; i++; }
    continue;
  }
  if (inStr) {
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === inStr) { inStr = null; }
    continue;
  }
  if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
  if (c === '/' && html[i+1] === '/') { inLineComment = true; i++; continue; }
  if (c === '/' && html[i+1] === '*') { inBlockComment = true; i++; continue; }
  if (c === '[') depth++;
  else if (c === ']') {
    depth--;
    if (depth === 0) { i++; break; }
  }
}
// Falls i landet auf das schliessende ]
const arrEnd = i; // exclusive

const arrSource = html.substring(arrStart, arrEnd);  // "[ ... ]"

// In einer VM auswerten
const ctx = { result: null };
vm.createContext(ctx);
try {
  vm.runInContext(`result = ${arrSource};`, ctx);
} catch (e) {
  console.error('Fehler beim Eval des EPISODES-Arrays:', e.message);
  process.exit(2);
}

const eps = ctx.result;
if (!Array.isArray(eps)) {
  console.error('EPISODES ist kein Array.');
  process.exit(3);
}

fs.writeFileSync(OUT, JSON.stringify(eps, null, 2), 'utf-8');
console.log(`[done] ${eps.length} bestehende Episoden -> ${path.basename(OUT)}`);
console.log(`  Array-Range im HTML: ${arrStart} .. ${arrEnd}`);
console.log(`  Bytes: ${arrEnd - arrStart}`);
// Range zusaetzlich speichern fuer den Build-Step
fs.writeFileSync(path.join(ROOT, '.episodes_range.json'),
  JSON.stringify({ start: arrStart, end: arrEnd }, null, 2), 'utf-8');
