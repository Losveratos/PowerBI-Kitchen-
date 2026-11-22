// SEO-Pflege fuer alle Seiten der Knowledge Kitchen (ausser wissensgraph/, die hat eigene Sitemap):
//   1. Canonical-Link in jede indexierbare Seite, die noch keinen hat
//      (Varianten und Spiegel zeigen auf ihr Original, siehe ALIAS)
//   2. Strukturierte Daten (JSON-LD) zwischen den Markern <!--seo-ld:start--> ... <!--seo-ld:end-->
//      im <head>: WebSite/Organisation, Podcast, Artikel, Werkzeuge, Power-BI-Visuals
//   3. sitemap-seiten.xml mit allen indexierbaren Seiten und lastmod aus der Git-Historie
//
// Idempotent. Aufruf im Repo-Root, nach neuen Seiten oder Beitraegen (auch im kitchen-update-Skill):
//   node scripts/build_seo.js
const fs = require('fs');
const { execSync } = require('child_process');

const SITE = 'https://datenwgknowledgekitchen.com/';
const today = new Date().toISOString().slice(0, 10);

// Nicht fuer Suchmaschinen: Tests, Prototypen, interne Werkzeuge, Verifizierungsdateien
const SKIP = [/^wissensgraph\//, /(^|\/)tests?\//, /^assets\//, /\/prototype\//, /^tools\/social-collage\//,
  /^fabric-app-scanner\//, /^google[0-9a-f]+\.html$/];
// Varianten und Spiegel -> Original
const ALIAS = {
  'daten_wg_learn_buckets.html': 'folgen.html',
  'koelner-raser-story-v1.html': 'koelner-raser-story.html',
  'koelner-raser-story-v2.html': 'koelner-raser-story.html',
  'koeln-raser/story_template.html': 'koelner-raser-story.html',
  'blog/assets/raser-infografik.html': 'koelner-raser-post.html',
  'pnl-treiberbaum-standalone.html': 'pnl-treiberbaum-demo.html',
};
const VISUALS = {
  'chartkitchen-doku.html': 'ChartKitchen byDatenWG', 'chartkitchen-doku_en.html': 'ChartKitchen byDatenWG',
  'pnl-doku.html': 'P&L Statement byDatenWG', 'pnl-doku_en.html': 'P&L Statement byDatenWG',
};

const urlOf = f => SITE + f.replace(/(^|\/)index\.html$/, '$1');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => String(s || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const meta = (h, re) => { const m = h.match(re); return m ? unesc(m[1]).trim() : ''; };
const git = cmd => { try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const dirty = new Set(git('git status --porcelain').split('\n').filter(Boolean).map(l => l.slice(3)));
const lastmod = f => (dirty.has(f) ? today : git(`git log -1 --format=%cs -- "${f}"`) || today);
const created = f => git(`git log --diff-filter=A --format=%cs -- "${f}"`).split('\n').pop() || lastmod(f);

// Beitraege (Typ, Datum) und Vorschaubilder der Startseite
const posts = {};
fs.readFileSync('beitraege.html', 'utf8').split('\n').filter(l => /^\{"id": /.test(l.trim()))
  .map(l => JSON.parse(l.trim().replace(/,$/, ''))).forEach(p => {
    const k = p.url.replace(/^\.?\//, '');
    posts[k] = p; if (p.enUrl) posts[p.enUrl.replace(/^\.?\//, '')] = { ...p, lang: 'EN', isEn: true };
  });
const feedImg = {};
{ const w = {}; new Function('window', fs.readFileSync('assets/start/feed-data.js', 'utf8'))(w);
  w.FEED.forEach(i => { if (i.img && !/^folgen\.html/.test(i.url)) feedImg[i.url] = SITE + i.img; }); }
const isoDate = d => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d : /^\d{4}-\d{2}$/.test(d) ? d + '-01' : null);

const ORG = { '@type': 'Organization', '@id': SITE + '#org', name: 'Daten-WG', url: 'https://www.daten-wg.com/',
  logo: SITE + 'assets/favicon-192.png',
  sameAs: ['https://www.youtube.com/@Daten-WG', 'https://podcasters.spotify.com/pod/show/daten-wg', 'https://www.daten-wg.com/'] };
const WEBSITE = { '@type': 'WebSite', '@id': SITE + '#website', name: 'Daten-WG Knowledge Kitchen', url: SITE,
  inLanguage: ['de', 'en'], publisher: { '@id': SITE + '#org' } };

function ldFor(f, h) {
  const url = urlOf(f);
  const lang = (h.match(/<html[^>]*\blang="([a-z]{2})/i) || [])[1] || 'de';
  const title = meta(h, /<title>([^<]*)<\/title>/i).replace(/(\s*[·|–]\s*(Daten-WG|Knowledge Kitchen|Daten-WG Knowledge Kitchen|DWG Knowledge Kitchen))+\s*$/i, '');
  const desc = meta(h, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const og = meta(h, /<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const author = meta(h, /<meta\s+name="author"\s+content="([^"]*)"/i);
  const img = og ? new URL(og, url).href : feedImg[f] || feedImg[f.replace(/_en\.html$/, '.html')] || null;
  const base = { '@context': 'https://schema.org' };
  const page = { url, name: title, inLanguage: lang, isPartOf: { '@id': SITE + '#website' } };
  if (desc) page.description = desc;
  if (img) page.image = img;

  if (f === 'index.html' || f === 'index_en.html')
    return { ...base, '@graph': [ORG, WEBSITE, { '@type': 'WebPage', '@id': url, ...page, about: { '@id': SITE + '#org' } }] };
  if (f === 'folgen.html')
    return { ...base, '@type': 'PodcastSeries', name: 'Daten-WG Podcast', url, description: desc, inLanguage: 'de',
      image: img || SITE + 'assets/start/og.jpg', author: { '@id': SITE + '#org' }, publisher: ORG,
      sameAs: ['https://www.youtube.com/@Daten-WG', 'https://podcasters.spotify.com/pod/show/daten-wg'] };
  if (f === 'beitraege.html' || /(^|\/)index\.html$/.test(f))
    return { ...base, '@type': 'CollectionPage', ...page, publisher: ORG };
  if (VISUALS[f])
    return { ...base, '@type': 'SoftwareApplication', name: VISUALS[f], url, description: desc, inLanguage: lang,
      applicationCategory: 'BusinessApplication', applicationSubCategory: 'Power BI Custom Visual',
      operatingSystem: 'Microsoft Power BI', ...(img ? { image: img } : {}), publisher: ORG, author: { '@id': SITE + '#org' } };

  const p = posts[f];
  if (p && p.type === 'werkzeug')
    return { ...base, '@type': 'WebApplication', ...page, applicationCategory: 'BusinessApplication',
      operatingSystem: 'Webbrowser', publisher: ORG };
  if (p || /-post(_en)?\.html$|story|whitepaper/.test(f)) {
    const type = !p ? 'Article' : p.type === 'doku' ? 'TechArticle' : p.type === 'post' ? 'BlogPosting' : 'Article';
    const pub = (p && isoDate(p.date)) || created(f);
    return { ...base, '@type': type, '@id': url + '#article', headline: title.slice(0, 110), ...page,
      mainEntityOfPage: url, datePublished: pub, dateModified: [lastmod(f), pub].sort().pop(),
      author: author ? { '@type': 'Person', name: author.split(/\s*·\s*/)[0], worksFor: { '@id': SITE + '#org' } } : ORG,
      publisher: ORG };
  }
  return { ...base, '@type': 'WebPage', ...page, publisher: ORG };
}

const files = git('git ls-files "*.html"').split('\n').concat([...dirty].filter(f => f.endsWith('.html')))
  .filter((f, i, a) => f && a.indexOf(f) === i && fs.existsSync(f) && !SKIP.some(r => r.test(f))).sort();

const sitemap = [];
let nCanon = 0, nLd = 0;
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8');
  const before = h;
  if (/<meta\s+name="robots"[^>]*noindex/i.test(h) || /http-equiv="refresh"/i.test(h)) continue;
  const head = h.indexOf('</head>');
  if (head < 0) continue;

  const target = ALIAS[f] ? SITE + ALIAS[f] : urlOf(f);
  if (!/<link\s+rel="canonical"/i.test(h)) {
    h = h.replace(/(<title>[^<]*<\/title>\n?)/i, `$1<link rel="canonical" href="${target}">\n`);
    if (h === before) h = h.replace('</head>', `<link rel="canonical" href="${target}">\n</head>`);
    nCanon++;
  }
  const canon = (h.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i) || [])[1];
  if (canon !== urlOf(f) || ALIAS[f]) { if (h !== before) fs.writeFileSync(f, h); continue; }

  if (!['impressum.html', 'datenschutz.html'].includes(f)) {
    const ld = JSON.stringify(ldFor(f, h), null, 0).replace(/<\//g, '<\\/');
    const block = `<!--seo-ld:start--><script type="application/ld+json">${ld}</script><!--seo-ld:end-->`;
    const rx = /<!--seo-ld:start-->[\s\S]*?<!--seo-ld:end-->/;
    h = rx.test(h) ? h.replace(rx, () => block) : h.replace('</head>', () => block + '\n</head>');
    nLd++;
  }
  if (h !== before) fs.writeFileSync(f, h);
  sitemap.push({ loc: urlOf(f), lastmod: lastmod(f) });
}

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- Seiten der Knowledge Kitchen ausserhalb der Library (die hat eine eigene Sitemap unter wissensgraph/).\n' +
  '     Erzeugt von scripts/build_seo.js. Nicht von Hand bearbeiten. -->\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemap.sort((a, b) => (a.loc === SITE ? -1 : b.loc === SITE ? 1 : a.loc.localeCompare(b.loc)))
    .map(u => `  <url>\n    <loc>${esc(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync('sitemap-seiten.xml', xml);
console.log(`SEO: ${nCanon} Canonicals ergaenzt, ${nLd} Seiten mit JSON-LD, ${sitemap.length} URLs in sitemap-seiten.xml`);
