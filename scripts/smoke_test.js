// Holt die gerenderte HTML vom lokalen Webserver und parst die EPISODES-Konstante
const http = require('node:http');
const vm = require('node:vm');

http.get('http://localhost:8765/daten_wg_learn_buckets.html', res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    const i = body.indexOf('const EPISODES = [');
    if (i < 0) { console.error('FAIL: EPISODES nicht im served HTML'); process.exit(1); }
    const arrStart = body.indexOf('[', i);
    let depth=0, inStr=null, esc=false, lineC=false, blockC=false, j=arrStart;
    for (; j < body.length; j++) {
      const c = body[j];
      if (lineC) { if (c === '\n') lineC = false; continue; }
      if (blockC) { if (c === '*' && body[j+1] === '/') { blockC = false; j++; } continue; }
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === '\\') { esc = true; continue; }
        if (c === inStr) inStr = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
      if (c === '/' && body[j+1] === '/') { lineC = true; j++; continue; }
      if (c === '/' && body[j+1] === '*') { blockC = true; j++; continue; }
      if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) { j++; break; } }
    }
    const src = body.substring(arrStart, j);
    const ctx = { r: null };
    vm.createContext(ctx);
    try {
      vm.runInContext('r = ' + src + ';', ctx);
      const eps = ctx.r;
      console.log('PASS: gerenderte HTML laedt mit', eps.length, 'Episoden');
      // Smoke: erste 3 mit ytId
      const sample = eps.filter(e => e.ytId).slice(0, 3);
      console.log('Sample mit ytId:');
      for (const e of sample) {
        console.log(`  ${e.bucket}  ${e.ytId}  ${e.title.substring(0, 60)}`);
      }
    } catch (e) {
      console.error('PARSE FAIL:', e.message);
      process.exit(2);
    }
  });
}).on('error', e => { console.error('HTTP-Fehler:', e.message); process.exit(3); });
