// Kitchen-Update-Helfer: Bestand zaehlen und neue Videos des Daten-WG-Kanals finden.
//
//   node scripts/kitchen_diff.js                      # nur Bestand: Folgen je Bucket
//   node scripts/kitchen_diff.js _ch_videos.json _ch_shorts.json _ch_streams.json
//
// Die Kanal-Dateien kommen von yt-dlp --flat-playlist --dump-single-json fuer die Tabs
// /videos, /shorts und /streams. Der Tab /streams (Live) enthaelt die BI Thinkers Talks
// und GxP Talks, die im Tab /videos NICHT auftauchen. Angekuendigte Livestreams
// (live_status is_upcoming) werden uebersprungen, die kommen nach der Ausstrahlung.
// Schreibt die neuen IDs nach _new_ids.txt (eine je Zeile).
const fs = require('fs');

const FILE = 'daten_wg_learn_buckets.html';
const src = fs.readFileSync(FILE, 'utf8');
const i = src.indexOf('const EPISODES = [');
if (i < 0) throw new Error('EPISODES nicht gefunden in ' + FILE);
let d = 0, j = src.indexOf('[', i);
for (; j < src.length; j++) { if (src[j] === '[') d++; else if (src[j] === ']' && --d === 0) break; }
const EPISODES = new Function('return ' + src.slice(src.indexOf('[', i), j + 1))();

const counts = {};
EPISODES.forEach(e => { counts[e.bucket] = (counts[e.bucket] || 0) + 1; });
const ids = EPISODES.map(e => e.ytId).filter(Boolean);
const dups = ids.filter((x, k) => ids.indexOf(x) !== k);
console.log(`Bestand: ${EPISODES.length} Folgen`, JSON.stringify(counts), dups.length ? `| DOPPELT: ${dups.join(', ')}` : '| keine Duplikate');

const files = process.argv.slice(2);
if (!files.length) process.exit(0);

const existing = new Set(ids);
const seen = new Set();
const fresh = [];
for (const f of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { console.log(`${f}: nicht lesbar, uebersprungen`); continue; }
  const entries = (data.entries || []).flatMap(e => (e && e.entries ? e.entries : [e])).filter(e => e && e.id && e.id.length === 11);
  const neu = entries.filter(e => !existing.has(e.id) && !seen.has(e.id));
  const upcoming = neu.filter(e => e.live_status === 'is_upcoming');
  const take = neu.filter(e => e.live_status !== 'is_upcoming');
  take.forEach(e => { seen.add(e.id); fresh.push(e); });
  console.log(`${f}: ${entries.length} im Tab | neu: ${take.length}` + (upcoming.length ? ` | angekuendigt (uebersprungen): ${upcoming.map(e => e.title).join(', ')}` : ''));
}
for (const v of fresh) console.log(' ', v.id, '|', Math.round((v.duration || 0) / 60) + ' min', '|', v.title);
fs.writeFileSync('_new_ids.txt', fresh.map(v => v.id).join('\n') + (fresh.length ? '\n' : ''));
console.log(fresh.length ? `${fresh.length} neue Videos -> _new_ids.txt` : 'Keine neuen Videos.');
