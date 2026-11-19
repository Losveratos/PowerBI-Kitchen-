// Baut assets/start/feed-data.js fuer die Startseite (index.html) aus
//   - EPISODES in folgen.html (Folgen-Bibliothek, gepflegt vom kitchen-update-Skill)
//   - den Beitraegen in beitraege.html (eine JSON-Zeile je Beitrag)
// Alle Bilder liegen lokal unter assets/start/ (yt/, shots/, covers/), damit beim
// Laden der Startseite keine Anfrage an YouTube oder andere Dienste geht.
//
// Aufruf im Repo-Root:
//   python scripts/fetch_start_thumbs.py   # fehlende YouTube-Vorschaubilder holen
//   node scripts/build_start_feed.js
const fs = require('fs');
const path = require('path');

const OUT = 'assets/start';
const html = fs.readFileSync('folgen.html', 'utf8');

function arrayLiteral(src, name) {
  const i = src.indexOf(`const ${name} = [`);
  if (i < 0) throw new Error(name + ' nicht gefunden');
  let d = 0, j = src.indexOf('[', i);
  for (; j < src.length; j++) { if (src[j] === '[') d++; else if (src[j] === ']' && --d === 0) break; }
  return new Function('return ' + src.slice(src.indexOf('[', i), j + 1))();
}

const EPISODES = arrayLiteral(html, 'EPISODES');
const BUCKETS = arrayLiteral(html, 'BUCKETS');
const bucketName = Object.fromEntries(BUCKETS.map(b => [b.id, b.name]));

const posts = fs.readFileSync('beitraege.html', 'utf8')
  .split('\n').filter(l => /^\{"id": /.test(l.trim()))
  .map(l => JSON.parse(l.trim().replace(/,$/, '')));

const MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const shotDir = path.join(OUT, 'shots');
const ytDir = path.join(OUT, 'yt');
const hasShot = n => fs.existsSync(path.join(shotDir, n + '.webp'));
const hasYt = id => fs.existsSync(path.join(ytDir, id + '.webp'));

// Beitrag -> Vorschaubild (aus gerenderten Seiten oder eigenen Bildern der Beitraege)
const SHOT_FOR = {
  'zwei-heimaten.html': 'story-zwei-heimaten', 'koelner-raser-story.html': 'story-koeln-blitzt',
  'koelner-raser-post.html': 'story-koeln-blitzt', 'rhein-story.html': 'story-rhein',
  'waermestreifen-3d.html': 'story-waermestreifen', 'strommix-story.html': 'story-strommix',
  'whitepaper-strommix.html': 'story-strommix', 'talks/budapest-bi26/': 'talk-budapest',
  'finance-reporting-budapest-post.html': 'talk-budapest', 'morally_aligned_ai.html': 'talk-morally-aligned',
  'power-bi-on-claude.html': 'talk-pbi-on-claude', 'sessions/how-i-started-to-build-custom-visuals.html': 'talk-custom-visuals',
  'wohlstandsatlas.html': 'tool-wohlstandsatlas', 'laender-indikatoren-explorer.html': 'tool-laender',
  'ibcs-trainer.html': 'tool-ibcs-trainer', 'mockup-kitchen.html': 'tool-mockup-kitchen',
  'mockupkitchen-post.html': 'tool-mockup-kitchen', 'business-chart-builder.html': 'tool-chart-builder',
  'business-chart-builder-anleitung.html': 'tool-chart-builder', 'ki-co2-simulator.html': 'tool-co2',
  'daten-imperium.html': 'tool-daten-imperium', 'sankey-wasserfall-post.html': 'post-sankey',
  'fabric-apps-controlling-post.html': 'post-fabric-apps', 'pnl-doku.html': 'vis-pnl-tabelle',
  'pnl-schnellstart.html': 'vis-pnl-tabelle', 'pnl-beta-post.html': 'vis-pnl-baum',
  'pnl-treiberbaum-demo.html': 'vis-pnl-baum', 'prototyping-pnl-treiberbaum.html': 'vis-pnl-baum',
  'chartkitchen-doku.html': 'vis-chartkitchen', 'chartkitchen-schnellstart.html': 'vis-chartkitchen',
  'wissensgraph/': 'tool-library',
};

// Was willst du? -> Art
const KIND = {
  story: 'Story', talk: 'Talk', post: 'Post', whitepaper: 'Post', werkzeug: 'Werkzeug',
  doku: 'Lernen', event: 'Event',
};
const isVisual = url => /chartkitchen|pnl-|pnl_|sankey/.test(url);

// Themen vereinheitlichen (Beitraege-Topics und Folgen-Buckets)
const TOPIC_POST = { report: 'Power BI', ibcs: 'Visualisierung & IBCS', ki: 'KI', story: 'Datenstorys',
  planung: 'Planung & Finance', fabric: 'Fabric', karriere: 'Karriere & Community', modell: 'Modellierung & DAX',
  dax: 'Modellierung & DAX', integration: 'Fabric', perf: 'Power BI', governance: 'Strategie & Governance', devops: 'Fabric' };
const TOPIC_BUCKET = { 'bucket-1': 'Power BI', 'bucket-2': 'Fabric', 'bucket-3': 'Modellierung & DAX',
  'bucket-4': 'Strategie & Governance', 'bucket-5': 'Visualisierung & IBCS', 'bucket-6': 'Power BI',
  'bucket-7': 'Karriere & Community', 'bucket-8': 'Strategie & Governance', 'bucket-9': 'Event', 'bucket-10': 'Power BI' };

// Monat -> sortierbares Datum. Folgen haben nur "Monat JJJJ": Monatsmitte.
function epDate(d) {
  const [m, y] = (d || '').split(' ');
  const mi = MONTHS.indexOf(m);
  return mi < 0 || !+y ? '2025-01-15' : `${y}-${String(mi + 1).padStart(2, '0')}-15`;
}
function postDate(d) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (/^\d{4}-\d{2}$/.test(d)) return d + '-15';
  return '2025-01-15';
}

const items = [];

EPISODES.forEach((e, k) => {
  const short = e.bucket === 'bucket-10';
  items.push({
    id: 'ep-' + e.ytId,
    kind: short ? 'Short' : 'Folge',
    title: e.title.replace(/\s*\|\s*Daten-WG Podcast (mit|with)\s*/i, ' · mit ').replace(/^#(\d+) · /, '#$1 '),
    desc: e.desc,
    date: epDate(e.date),
    dateLabel: e.date,
    meta: [e.guest && e.guest !== 'Solo' ? e.guest : null, e.duration].filter(Boolean).join(' · '),
    topic: TOPIC_BUCKET[e.bucket],
    topics: [TOPIC_BUCKET[e.bucket]].concat(
      /\b(KI|AI|LLM|MCP|GenAI)\b|\b(Agent|Agents|Agenten|Copilot|Claude|ChatGPT)\b/.test(e.title.replace(/\[AI dubbed\]/i, '') + ' ' + (e.tags || []).join(' ')) ? ['KI'] : []),
    section: bucketName[e.bucket] || '',
    url: `folgen.html#ep-${e.ytId}`,
    img: hasYt(e.ytId) ? `${OUT}/yt/${e.ytId}.webp` : null,
    guest: !e.solo,
    tags: (e.tags || []).filter(t => !/^(DE|EN|Podcast|Shorts?)$/i.test(t)),
    order: k,
  });
});

posts.forEach(p => {
  const url = p.url;
  const key = url.replace(/^\.?\//, '');
  const shot = SHOT_FOR[key];
  items.push({
    id: 'p-' + p.id,
    kind: isVisual(url) && p.type !== 'story' ? 'Visual' : (KIND[p.type] || 'Post'),
    title: p.title,
    desc: p.desc,
    date: postDate(p.date),
    dateLabel: p.date,
    meta: p.eyebrow || '',
    topic: TOPIC_POST[(p.topics || [])[0]] || 'Power BI',
    topics: (p.topics || []).map(t => TOPIC_POST[t]).filter(Boolean),
    section: p.eyebrow || '',
    tags: (p.eyebrow || '').split(/\s*·\s*/).filter(t => t && t.length < 28),
    url: url.replace(/^\.\//, ''),
    img: shot && hasShot(shot) ? `${OUT}/shots/${shot}.webp` : null,
  });
});

// Seiten, die nicht in beitraege.html stehen
items.push({ id: 'p-visuals-sicherheit', kind: 'Lernen', title: 'Sicherheit & Betrieb der byDatenWG-Visuals',
  desc: 'Eine Seite für Power-BI-Admins, IT-Security und Datenschutz: was die Custom Visuals tun, was nicht, und wie man sie prüft und verteilt.',
  date: '2026-10-20', dateLabel: '2026-10', meta: 'Visuals · Admin & Security', topic: 'Visualisierung & IBCS', topics: ['Visualisierung & IBCS'],
  section: 'Visuals', url: 'visuals-sicherheit.html', img: hasShot('p-visuals-sicherheit') ? `${OUT}/shots/p-visuals-sicherheit.webp` : null });

// Eigene Titelbilder (covers/<id>.webp, scripts/build_start_covers.py) gehen vor
for (const i of items) if (fs.existsSync(path.join(OUT, 'covers', i.id + '.webp'))) i.img = `${OUT}/covers/${i.id}.webp`;
// Seiten-Screenshots p-<slug> (scripts/render_start_shots.py) fuer Beitraege ohne eigene Zuordnung
const slug = u => u.toLowerCase().replace('.html', '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const i of items) if (!i.img && i.id.startsWith('p-')) { const n = 'p-' + slug(i.url); if (hasShot(n)) i.img = `${OUT}/shots/${n}.webp`; }
const noImg = items.filter(i => !i.img);
if (noImg.length) console.warn('Ohne Bild (erscheinen als Text, ggf. render_start_shots.py / fetch_start_thumbs.py laufen lassen):', noImg.map(i => i.id).join(', '));

// Wichtigkeit: neuer ist wichtiger; Stories, Talks und Gast-Folgen wiegen mehr; mit Bild mehr.
const WEIGHT = { Story: 34, Talk: 30, Visual: 24, Werkzeug: 22, Post: 20, Folge: 14, Lernen: 8, Event: 6, Short: 2 };
const newest = items.reduce((m, i) => (i.date > m ? i.date : m), '0');
const days = d => (Date.parse(newest) - Date.parse(d)) / 864e5;
for (const i of items) {
  i.score = Math.round(100 - days(i.date) * 0.9 + (WEIGHT[i.kind] || 0) + (i.img ? 18 : 0) + (i.guest ? 10 : 0));
}

fs.writeFileSync(path.join(OUT, 'feed-data.js'),
  '// erzeugt von scripts/build_start_feed.js aus folgen.html (EPISODES) und beitraege.html. Nicht von Hand bearbeiten.\n' +
  'window.FEED = ' + JSON.stringify(items, null, 0) + ';\n');

const c = {};
items.forEach(i => { c[i.kind] = (c[i.kind] || 0) + 1; });
console.log(items.length, 'Eintraege', JSON.stringify(c), '| mit Bild:', items.filter(i => i.img).length);
console.log('Top 8 nach Wichtigkeit:');
[...items].sort((a, b) => b.score - a.score).slice(0, 8)
  .forEach(i => console.log(' ', i.score, i.kind.padEnd(8), i.date, i.img ? 'IMG' : '   ', i.title.slice(0, 60)));
