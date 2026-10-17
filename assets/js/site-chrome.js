/*!
 * Daten-WG Knowledge Kitchen · globale Navigation + Footer für Unterseiten
 *
 * Einbinden direkt nach <body> (synchron, damit die Leiste ohne Layout-Sprung steht):
 *   <script src="assets/js/site-chrome.js" data-chrome="full"></script>
 * In Unterordnern den Pfad anpassen (../assets/js/site-chrome.js). Alle Links werden
 * aus der Adresse dieses Skripts abgeleitet und funktionieren deshalb aus jeder Tiefe.
 *
 * data-chrome
 *   full    Navigation oben + Footer unten (Standard)
 *   footer  nur Footer (App-Seiten mit eigener Werkzeugleiste)
 *   mini    kleine feste Pille „← Kitchen“ + Footer (immersive Storys, Visualisierungen)
 * data-chrome-pill   Position der Pille: tl | tr | bl | br | off   (Standard tl)
 * data-chrome-legal  corner-bl | corner-br: statt Footer kleine feste Rechtliches-Ecke
 *                    (für Seiten ohne Scrollen oder mit Vollbild-Ebenen)
 *
 * Automatisch:
 *   - Im iframe passiert nichts (Seiten, die in andere eingebettet sind).
 *   - Der Footer entfällt, wenn die Seite schon auf impressum.html UND datenschutz.html verlinkt.
 *   - Lässt sich die Seite nicht scrollen (overflow:hidden auf html/body), gibt es die Rechtliches-Ecke.
 *   - Die Pille entfällt, wenn oben schon ein sichtbarer Link zur Startseite steht.
 * Alles lebt im Shadow DOM: Seiten-CSS wirkt nicht hinein, Chrome-CSS nicht hinaus.
 */
(function () {
  'use strict';
  try { if (window.self !== window.top) return; } catch (e) { return; }
  if (window.__kcChrome) return;
  window.__kcChrome = true;

  var script = document.currentScript || document.querySelector('script[src*="site-chrome.js"]');
  if (!script) return;
  var ds = script.dataset || {};
  var mode = ds.chrome || 'full';
  var ROOT = new URL('../../', script.src).href;
  function U(p) { return ROOT + p; }

  var here = location.href.split('#')[0].split('?')[0];
  var rel = here.indexOf(ROOT) === 0 ? here.slice(ROOT.length) : '';
  if (rel === '' ) rel = 'index.html';

  /* ---------------------------------------------------------------- Inhalt */
  var LERNEN = [
    ['Dein erstes Dashboard', 'powerbi_praxis_pfad.html', 'Praxis-Pfad, in gut zwei Stunden'],
    ['Power BI von A bis Z', 'power_bi_einsteiger_guide_v4.html', 'Einsteiger-Guide End-to-End'],
    ['Microsoft Fabric End-to-End', 'fabric_einsteiger_guide_v1.html', 'Einsteiger-Guide'],
    ['IBCS-Trainer', 'ibcs-trainer.html', 'Quiz und „Finde den Verstoß“'],
    ['Fabric Alchemie', 'fabric-alchemie-post.html', 'Lernspiel nach Little-Alchemy-Prinzip']
  ];
  var WERKZEUGE = [
    ['Skizzieren & bauen', [
      ['MockupKitchen', 'mockup-kitchen.html'],
      ['Chart-Builder', 'business-chart-builder.html'],
      ['ChartKitchen Visual', 'chartkitchen-schnellstart.html'],
      ['P&L-Visual', 'pnl-schnellstart.html'],
      ['P&L-Treiberbaum', 'pnl-treiberbaum-demo.html']
    ]],
    ['Entscheiden & lernen', [
      ['Visual-Standards-Rechner', 'visual-standards-rechner.html'],
      ['IBCS-Trainer', 'ibcs-trainer.html']
    ]],
    ['Spielwiese', [
      ['Länder-Indikatoren-Explorer', 'laender-indikatoren-explorer.html'],
      ['KI-CO₂-Simulator', 'ki-co2-simulator.html'],
      ['Daten-WG-Spiel', 'daten-wg-game.html']
    ]]
  ];
  var FOOTER = [
    ['Folgen', [['Alle Folgen', 'index.html#folgen'], ['Start hier', 'index.html#start'], ['Suche', 'index.html#suche'], ['Library', 'wissensgraph/']]],
    ['Lernen', LERNEN.map(function (l) { return [l[0], l[1]]; })],
    ['Werkzeuge', [['MockupKitchen', 'mockup-kitchen.html'], ['Chart-Builder', 'business-chart-builder.html'], ['ChartKitchen Visual', 'chartkitchen-schnellstart.html'], ['P&L-Visual', 'pnl-schnellstart.html'], ['Visual-Standards-Rechner', 'visual-standards-rechner.html'], ['Alle Werkzeuge', 'beitraege.html#werkzeuge']]],
    ['Beiträge', [['Alle Beiträge', 'beitraege.html'], ['Posts', 'beitraege.html#posts'], ['Visual Stories', 'beitraege.html#stories'], ['Whitepaper', 'beitraege.html#whitepaper'], ['Talks', 'beitraege.html#talks'], ['Doku', 'beitraege.html#doku'], ['Blog', 'blog/']]],
    ['Event-Rückblick', [['Agenda 2026', 'daten-wg-agenda.html'], ['Sponsoren', 'daten-wg-sponsoren.html'], ['Spiel', 'daten-wg-game.html']]],
    ['Abonnieren', [['YouTube', 'https://www.youtube.com/@Daten-WG'], ['Spotify', 'https://podcasters.spotify.com/pod/show/daten-wg'], ['daten-wg.com', 'https://daten-wg.com']]],
    ['Rechtliches', [['Impressum', 'impressum.html'], ['Datenschutz', 'datenschutz.html'], ['llms.txt', 'llms.txt']]]
  ];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function isExt(h) { return /^https?:/.test(h); }
  function href(h) { return isExt(h) ? h : U(h); }
  function cur(h) { return !isExt(h) && h.split('#')[0] === rel ? ' aria-current="page"' : ''; }
  function a(label, h, cls, extra) {
    return '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(href(h)) + '"' + cur(h) +
      (isExt(h) ? ' target="_blank" rel="noopener"' : '') + (extra || '') + '>' + esc(label) + '</a>';
  }
  function inList(list) { return list.some(function (l) { return l[1] === rel; }); }
  var werkzeugFlat = [].concat.apply([], WERKZEUGE.map(function (g) { return g[1]; }));
  var section =
    /^wissensgraph\//.test(rel) ? 'library' :
    rel === 'beitraege.html' || /^(blog|sessions)\//.test(rel) ? 'beitraege' :
    inList(LERNEN) ? 'lernen' : inList(werkzeugFlat) ? 'werkzeuge' : '';

  var ICON_SEARCH = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';
  var ICON_MENU = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var ICON_X = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  var CARET = '<svg class="caret" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="m3 4.5 3 3 3-3"/></svg>';

  /* ---------------------------------------------------------------- CSS */
  var BASE_CSS =
    ':host{all:initial;display:block;--bg:#FAFAF5;--card:#FFFFFF;--soft:#F4F1E8;--ink:#1A1A1A;--ink2:#4A4A4A;--mute:#6B6B6B;--line:#E5E2D8;--accent:#117865;--accent-d:#0A5A4D;' +
    '--sans:"Segoe UI Variable Text","Segoe UI",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;--serif:"Segoe UI Variable Display","Segoe UI",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;' +
    '}' +
    /* Schrift auf den Wurzel-Elementen setzen: das Inline-„all:initial“ am Host schlägt :host */
    '.bar,.sheet,.ft,.pill,.corner{font-family:var(--sans);font-size:15px;line-height:1.45;color:var(--ink);-webkit-font-smoothing:antialiased;text-align:left;font-weight:400;letter-spacing:normal;text-transform:none;font-style:normal;}' +
    '*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}' +
    'a{color:inherit;text-decoration:none;}' +
    'button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;}' +
    'ul{list-style:none;}' +
    'a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px;}' +
    '[hidden]{display:none !important;}' +
    '@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important;}}';

  var NAV_CSS =
    '.bar{background:rgba(250,250,245,.97);border-bottom:1px solid var(--line);position:relative;}' +
    '.in{max-width:1240px;margin:0 auto;padding:0 24px;height:60px;display:flex;align-items:center;gap:16px;}' +
    '.brand{font-family:var(--serif);font-size:15.5px;font-weight:500;letter-spacing:-.01em;white-space:nowrap;display:inline-flex;align-items:center;min-height:44px;color:var(--ink);}' +
    '.brand em{font-style:italic;color:var(--accent);margin-left:.3em;}' +
    '.main{display:flex;align-items:center;gap:2px;margin-left:12px;flex:1;min-width:0;}' +
    '.main>li{position:relative;}' +
    '.top{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border-radius:8px;font-size:14.5px;font-weight:500;color:var(--ink2);white-space:nowrap;}' +
    '.top:hover,.top[aria-expanded="true"]{background:var(--soft);color:var(--ink);}' +
    '.top.on{color:var(--accent);}' +
    '.top.on::after{content:"";position:absolute;left:12px;right:12px;bottom:6px;height:2px;border-radius:2px;background:var(--accent);}' +
    '.top[aria-expanded="true"] .caret{transform:rotate(180deg);}' +
    '.caret{transition:transform .15s ease;}' +
    '.panel{position:absolute;top:calc(100% + 6px);left:0;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 24px 60px rgba(10,10,10,.14),0 6px 16px rgba(10,10,10,.08);padding:10px;min-width:300px;z-index:2;}' +
    '.panel.wide{display:grid;grid-template-columns:repeat(3,minmax(190px,1fr));gap:4px 10px;min-width:640px;}' +
    '.panel a{display:flex;flex-direction:column;justify-content:center;min-height:44px;padding:8px 12px;border-radius:8px;font-size:14px;color:var(--ink);}' +
    '.panel a:hover,.panel a:focus-visible{background:var(--soft);}' +
    '.panel a small{display:block;font-size:12px;color:var(--mute);margin-top:1px;}' +
    '.panel a[aria-current="page"]{color:var(--accent);font-weight:600;}' +
    '.gh{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);padding:10px 12px 4px;}' +
    '.more{grid-column:1/-1;border-top:1px solid var(--line);margin-top:6px;padding-top:6px;}' +
    '.more a{color:var(--accent);font-weight:600;}' +
    '.act{display:flex;align-items:center;gap:6px;margin-left:auto;}' +
    '.ib{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;color:var(--ink2);}' +
    '.ib:hover{background:var(--soft);color:var(--ink);}' +
    '.start{display:inline-flex;align-items:center;min-height:40px;padding:0 16px;border-radius:999px;background:var(--accent);color:#fff;font-size:14px;font-weight:600;white-space:nowrap;}' +
    '.start:hover{background:var(--accent-d);}' +
    '.burger{display:none;}' +
    '@media (max-width:1060px){.main .top{padding:0 9px;font-size:14px;}.in{gap:10px;}}' +
    '@media (max-width:900px){.in{height:56px;padding:0 8px 0 16px;gap:4px;}.main,.start{display:none;}.burger{display:inline-flex;}.brand{font-size:15px;min-width:0;overflow:hidden;text-overflow:ellipsis;}}' +
    '@media (max-width:360px){.brand{font-size:14px;}}' +
    /* Sheet */
    '.sheet{position:fixed;inset:0;z-index:10;background:var(--bg);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}' +
    '.sh-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 8px 0 16px;background:var(--bg);border-bottom:1px solid var(--line);}' +
    '.sh-body{padding:8px 16px 32px;max-width:640px;margin:0 auto;}' +
    '.sh-item{border-bottom:1px solid var(--line);}' +
    '.sh-link,.sh-acc{display:flex;width:100%;align-items:center;justify-content:space-between;min-height:56px;font-size:18px;font-weight:500;color:var(--ink);text-align:left;}' +
    '.sh-link[aria-current="page"],.sh-acc.on,.sh-link.on{color:var(--accent);}' +
    '.sh-acc[aria-expanded="true"] .caret{transform:rotate(180deg);}' +
    '.sh-acc .caret{width:16px;height:16px;}' +
    '.sh-sub{padding:0 0 12px 4px;}' +
    '.sh-sub a{display:flex;align-items:center;min-height:44px;padding:0 8px;font-size:16px;color:var(--ink2);border-radius:8px;}' +
    '.sh-sub a[aria-current="page"]{color:var(--accent);font-weight:600;}' +
    '.sh-sub .gh{padding:12px 8px 2px;}' +
    '.sh-sub .more a{color:var(--accent);font-weight:600;}' +
    '.sh-cta{display:flex;gap:10px;margin-top:20px;}' +
    '.sh-cta a{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;border-radius:999px;font-size:16px;font-weight:600;border:1px solid var(--line);background:var(--card);}' +
    '.sh-cta a.start{background:var(--accent);color:#fff;border-color:var(--accent);}' +
    '.sh-legal{display:flex;flex-wrap:wrap;gap:4px 18px;margin-top:24px;font-size:14px;color:var(--mute);}' +
    '.sh-legal a{display:inline-flex;align-items:center;min-height:44px;}';

  var FOOT_CSS =
    '.ft{background:var(--soft);border-top:1px solid var(--line);color:var(--ink2);font-size:14px;}' +
    '.ft-in{max-width:1240px;margin:0 auto;padding:40px 24px 28px;}' +
    '.ft-brand{font-family:var(--serif);font-size:18px;font-weight:500;color:var(--ink);display:inline-flex;align-items:center;min-height:44px;}' +
    '.ft-brand em{font-style:italic;color:var(--accent);margin-left:.3em;}' +
    '.ft-lead{max-width:56ch;margin:2px 0 26px;color:var(--mute);font-size:13.5px;line-height:1.5;}' +
    '.ft-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:24px 20px;}' +
    '.ft h2{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink);margin-bottom:6px;}' +
    '.ft li a{display:inline-flex;align-items:center;min-height:32px;color:var(--ink2);line-height:1.3;}' +
    '.ft li a:hover{color:var(--accent);text-decoration:underline;text-underline-offset:3px;}' +
    '.ft li a[aria-current="page"]{color:var(--accent);font-weight:600;}' +
    '.ft-legal{font-weight:600;}' +
    '.ft-base{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;margin-top:28px;padding-top:16px;border-top:1px solid var(--line);font-size:12.5px;color:var(--mute);}' +
    '.ft-base a{display:inline-flex;align-items:center;min-height:44px;color:var(--ink2);}' +
    '.ft-base a:hover{color:var(--accent);}' +
    '@media (max-width:1100px){.ft-grid{grid-template-columns:repeat(4,minmax(0,1fr));}}' +
    '@media (max-width:700px){.ft-in{padding:32px 16px 20px;}.ft-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 16px;}.ft li a{min-height:44px;}}';

  var MINI_CSS =
    '.pill{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:999px;background:rgba(26,26,26,.78);color:#fff;font-size:13.5px;font-weight:600;letter-spacing:.01em;box-shadow:0 2px 10px rgba(0,0,0,.18);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);}' +
    '.pill:hover{background:rgba(17,120,101,.95);}' +
    '.pill:focus-visible{outline:2px solid #fff;outline-offset:2px;box-shadow:0 0 0 4px var(--accent);}' +
    '.corner{display:inline-flex;align-items:center;gap:2px;border-radius:999px;background:rgba(250,250,245,.92);border:1px solid var(--line);font-size:12px;color:var(--ink2);box-shadow:0 1px 6px rgba(0,0,0,.08);}' +
    '.corner a{display:inline-flex;align-items:center;min-height:36px;padding:0 10px;}' +
    '.corner a:hover{color:var(--accent);}' +
    '.corner span{color:var(--line);}';

  /* ---------------------------------------------------------------- Helfer */
  function host(id, style) {
    var h = document.createElement('div');
    h.id = id;
    h.setAttribute('data-kc-chrome', '');
    h.setAttribute('style', 'all:initial;display:block;' + (style || ''));
    var root = h.attachShadow ? h.attachShadow({ mode: 'open' }) : h;
    return { el: h, root: root };
  }
  function bodyIsFlexy() {
    var d = getComputedStyle(document.body).display;
    return /flex|grid/.test(d);
  }
  // Flex-/Grid-Bodys (z. B. zentrierte Einzelkarten) würden die Chrome-Elemente als
  // Spalten nebeneinander legen. Dort hängen wir sie direkt an <html>, vor bzw. hinter <body>.
  function insertTop(el) {
    if (bodyIsFlexy()) document.documentElement.insertBefore(el, document.body);
    else document.body.insertBefore(el, document.body.firstChild);
  }
  function insertBottom(el) {
    if (bodyIsFlexy()) document.documentElement.appendChild(el);
    else document.body.appendChild(el);
  }
  function pageLinksBothLegal() {
    var imp = false, dsg = false;
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href') || '';
      if (/impressum\.html(#.*)?$/.test(h)) imp = true;
      if (/datenschutz\.html(#.*)?$/.test(h)) dsg = true;
    }
    if (/impressum\.html$/.test(rel)) imp = true;
    if (/datenschutz\.html$/.test(rel)) dsg = true;
    return imp && dsg;
  }
  function cannotScroll() {
    var h = getComputedStyle(document.documentElement).overflowY;
    var b = getComputedStyle(document.body).overflowY;
    return /hidden|clip/.test(h) || /hidden|clip/.test(b);
  }
  function hasTopHomeLink() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var raw = links[i].getAttribute('href');
      if (!raw || raw.charAt(0) === '#') continue;
      var abs;
      try { abs = new URL(raw, location.href).href.split('#')[0]; } catch (e) { continue; }
      if (abs !== ROOT && abs !== ROOT + 'index.html') continue;
      var r = links[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.top < 140 && r.bottom > 0) return true;
    }
    return false;
  }

  /* ---------------------------------------------------------------- Navigation */
  function buildNav() {
    var lernenOn = section === 'lernen', werkOn = section === 'werkzeuge';
    var lernenPanel = LERNEN.map(function (l) {
      return '<a href="' + esc(U(l[1])) + '"' + cur(l[1]) + '>' + esc(l[0]) + '<small>' + esc(l[2]) + '</small></a>';
    }).join('');
    var werkPanel = WERKZEUGE.map(function (g) {
      return '<div><p class="gh">' + esc(g[0]) + '</p>' + g[1].map(function (l) { return a(l[0], l[1]); }).join('') + '</div>';
    }).join('') + '<div class="more">' + a('Alle Werkzeuge →', 'beitraege.html#werkzeuge') + '</div>';

    var html =
      '<style>' + BASE_CSS + NAV_CSS + '</style>' +
      '<div class="bar" role="navigation" aria-label="Kitchen-Navigation"><div class="in">' +
        '<a class="brand" href="' + esc(U('index.html')) + '">Daten-WG ·<em>Knowledge Kitchen</em></a>' +
        '<ul class="main">' +
          '<li><a class="top" href="' + esc(U('index.html#folgen')) + '">Folgen</a></li>' +
          '<li class="dd"><button class="top' + (lernenOn ? ' on' : '') + '" type="button" aria-expanded="false" aria-controls="kc-p-lernen">Lernen' + CARET + '</button>' +
            '<div class="panel" id="kc-p-lernen" hidden>' + lernenPanel + '</div></li>' +
          '<li class="dd"><button class="top' + (werkOn ? ' on' : '') + '" type="button" aria-expanded="false" aria-controls="kc-p-werk">Werkzeuge' + CARET + '</button>' +
            '<div class="panel wide" id="kc-p-werk" hidden>' + werkPanel + '</div></li>' +
          '<li><a class="top' + (section === 'beitraege' ? ' on' : '') + '" href="' + esc(U('beitraege.html')) + '"' + cur('beitraege.html') + '>Beiträge</a></li>' +
          '<li><a class="top' + (section === 'library' ? ' on' : '') + '" href="' + esc(U('wissensgraph/')) + '">Library</a></li>' +
        '</ul>' +
        '<div class="act">' +
          '<a class="ib" href="' + esc(U('index.html#suche')) + '" aria-label="Folgen durchsuchen" title="Suche">' + ICON_SEARCH + '</a>' +
          '<a class="start" href="' + esc(U('index.html#start')) + '">Start hier</a>' +
          '<button class="ib burger" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="kc-sheet">' + ICON_MENU + '</button>' +
        '</div>' +
      '</div></div>' +
      '<div class="sheet" id="kc-sheet" role="dialog" aria-modal="true" aria-label="Menü" hidden>' +
        '<div class="sh-head"><a class="brand" href="' + esc(U('index.html')) + '">Daten-WG ·<em>Knowledge Kitchen</em></a>' +
          '<button class="ib sh-close" type="button" aria-label="Menü schließen">' + ICON_X + '</button></div>' +
        '<div class="sh-body"><ul>' +
          '<li class="sh-item"><a class="sh-link" href="' + esc(U('index.html#folgen')) + '">Folgen</a></li>' +
          '<li class="sh-item"><button class="sh-acc' + (lernenOn ? ' on' : '') + '" type="button" aria-expanded="false" aria-controls="kc-s-lernen">Lernen' + CARET + '</button>' +
            '<div class="sh-sub" id="kc-s-lernen" hidden>' + LERNEN.map(function (l) { return a(l[0], l[1]); }).join('') + '</div></li>' +
          '<li class="sh-item"><button class="sh-acc' + (werkOn ? ' on' : '') + '" type="button" aria-expanded="false" aria-controls="kc-s-werk">Werkzeuge' + CARET + '</button>' +
            '<div class="sh-sub" id="kc-s-werk" hidden>' + WERKZEUGE.map(function (g) {
              return '<p class="gh">' + esc(g[0]) + '</p>' + g[1].map(function (l) { return a(l[0], l[1]); }).join('');
            }).join('') + '<div class="more">' + a('Alle Werkzeuge →', 'beitraege.html#werkzeuge') + '</div></div></li>' +
          '<li class="sh-item">' + a('Beiträge', 'beitraege.html', 'sh-link' + (section === 'beitraege' ? ' on' : '')) + '</li>' +
          '<li class="sh-item">' + a('Library', 'wissensgraph/', 'sh-link' + (section === 'library' ? ' on' : '')) + '</li>' +
        '</ul>' +
        '<div class="sh-cta"><a class="start" href="' + esc(U('index.html#start')) + '">Start hier</a>' +
          '<a href="' + esc(U('index.html#suche')) + '">' + ICON_SEARCH + 'Suche</a></div>' +
        '<div class="sh-legal">' + a('Impressum', 'impressum.html') + a('Datenschutz', 'datenschutz.html') + a('YouTube', 'https://www.youtube.com/@Daten-WG') + '</div>' +
        '</div></div>';

    var h = host('kc-nav', 'position:relative;z-index:1000;');
    h.root.innerHTML = html;
    insertTop(h.el);
    wireNav(h.el, h.root);
  }

  function wireNav(hostEl, R) {
    var dds = R.querySelectorAll('.dd');
    function closeAll(except) {
      for (var i = 0; i < dds.length; i++) {
        if (dds[i] === except) continue;
        var b = dds[i].querySelector('button'), p = dds[i].querySelector('.panel');
        b.setAttribute('aria-expanded', 'false'); p.hidden = true;
      }
      if (!except) raise(false);
    }
    function raise(on) { hostEl.style.zIndex = on ? '2147483000' : '1000'; }
    function open(dd, focusFirst) {
      closeAll(dd);
      var b = dd.querySelector('button'), p = dd.querySelector('.panel');
      b.setAttribute('aria-expanded', 'true'); p.hidden = false; raise(true);
      p.style.left = '0px';
      var r = p.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      if (r.right > vw - 12) p.style.left = Math.min(0, vw - 12 - r.right) + 'px';
      if (focusFirst) { var f = p.querySelector('a'); if (f) f.focus(); }
    }
    Array.prototype.forEach.call(dds, function (dd) {
      var b = dd.querySelector('button'), p = dd.querySelector('.panel');
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-expanded') === 'true') closeAll(); else open(dd, false);
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); open(dd, true); }
      });
      dd.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { e.stopPropagation(); closeAll(); b.focus(); }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && p.contains(e.target)) {
          e.preventDefault();
          var ls = Array.prototype.slice.call(p.querySelectorAll('a')), i = ls.indexOf(e.target);
          var n = ls[(i + (e.key === 'ArrowDown' ? 1 : -1) + ls.length) % ls.length]; if (n) n.focus();
        }
      });
      dd.addEventListener('focusout', function (e) {
        if (e.relatedTarget && !dd.contains(e.relatedTarget)) { if (b.getAttribute('aria-expanded') === 'true') closeAll(); }
      });
    });
    document.addEventListener('click', function (e) {
      var path = e.composedPath ? e.composedPath() : [];
      for (var i = 0; i < dds.length; i++) if (path.indexOf(dds[i]) !== -1) return;
      closeAll();
    });

    // Mobiles Vollbild-Menü
    var burger = R.querySelector('.burger'), sheet = R.querySelector('.sheet'), closeBtn = R.querySelector('.sh-close');
    var saved = null;
    function lock(on) {
      var h = document.documentElement, bd = document.body;
      if (on) { saved = [h.style.overflow, bd.style.overflow]; h.style.overflow = 'hidden'; bd.style.overflow = 'hidden'; }
      else if (saved) { h.style.overflow = saved[0]; bd.style.overflow = saved[1]; saved = null; }
    }
    function openSheet() {
      closeAll(); sheet.hidden = false; burger.setAttribute('aria-expanded', 'true'); raise(true); lock(true);
      closeBtn.focus();
    }
    function closeSheet(restoreFocus) {
      if (sheet.hidden) return;
      sheet.hidden = true; burger.setAttribute('aria-expanded', 'false'); raise(false); lock(false);
      if (restoreFocus) burger.focus();
    }
    burger.addEventListener('click', openSheet);
    closeBtn.addEventListener('click', function () { closeSheet(true); });
    sheet.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('a') : null;
      if (t) closeSheet(false);
    });
    Array.prototype.forEach.call(R.querySelectorAll('.sh-acc'), function (b) {
      b.addEventListener('click', function () {
        var p = R.getElementById ? R.getElementById(b.getAttribute('aria-controls')) : R.querySelector('#' + b.getAttribute('aria-controls'));
        var on = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', on ? 'true' : 'false'); p.hidden = !on;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!sheet.hidden) { closeSheet(true); return; }
        closeAll();
      }
      if (e.key === 'Tab' && !sheet.hidden) {
        var f = Array.prototype.filter.call(sheet.querySelectorAll('a,button'), function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        var act = R.activeElement, first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (act === first || !sheet.contains(act))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (act === last || !sheet.contains(act))) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (!sheet.hidden && window.innerWidth > 900) closeSheet(false); });
  }

  /* ---------------------------------------------------------------- Footer */
  function buildFooter() {
    var cols = FOOTER.map(function (g) {
      return '<div><h2>' + esc(g[0]) + '</h2><ul>' + g[1].map(function (l) {
        return '<li>' + a(l[0], l[1], g[0] === 'Rechtliches' && /\.html$/.test(l[1]) ? 'ft-legal' : '') + '</li>';
      }).join('') + '</ul></div>';
    }).join('');
    var html = '<style>' + BASE_CSS + FOOT_CSS + '</style>' +
      '<div class="ft" role="contentinfo"><div class="ft-in">' +
        '<a class="ft-brand" href="' + esc(U('index.html')) + '">Daten-WG ·<em>Knowledge Kitchen</em></a>' +
        '<p class="ft-lead">Podcast, Tutorials, Werkzeuge und Datenstorys rund um Power BI, Microsoft Fabric und ehrliches Reporting.</p>' +
        '<div class="ft-grid">' + cols + '</div>' +
        '<div class="ft-base"><span>Daten-WG Knowledge Kitchen · Michael Tenner</span>' +
          '<span>' + a('Impressum', 'impressum.html') + ' · ' + a('Datenschutz', 'datenschutz.html') + '</span></div>' +
      '</div></div>';
    var h = host('kc-footer', 'position:relative;z-index:1;clear:both;');
    h.root.innerHTML = html;
    insertBottom(h.el);
  }

  function buildCorner(pos) {
    var side = pos === 'corner-br' ? 'right:10px;' : 'left:10px;';
    var h = host('kc-legal', 'position:fixed;bottom:10px;' + side + 'z-index:2147482000;');
    h.root.innerHTML = '<style>' + BASE_CSS + MINI_CSS + '</style><div class="corner" role="contentinfo" aria-label="Rechtliches">' +
      a('Impressum', 'impressum.html') + '<span aria-hidden="true">·</span>' + a('Datenschutz', 'datenschutz.html') + '</div>';
    document.documentElement.appendChild(h.el);
  }

  function buildPill() {
    var pos = ds.chromePill || 'tl';
    if (pos === 'off' || hasTopHomeLink()) return;
    var v = pos.charAt(0) === 'b' ? 'bottom:12px;' : 'top:12px;';
    var s = pos.charAt(1) === 'r' ? 'right:12px;' : 'left:12px;';
    var h = host('kc-mini', 'position:fixed;' + v + s + 'z-index:2147482000;');
    h.root.innerHTML = '<style>' + BASE_CSS + MINI_CSS + '</style>' +
      '<a class="pill" href="' + esc(U('index.html')) + '" aria-label="Zurück zur Knowledge Kitchen"><span aria-hidden="true">←</span> Kitchen</a>';
    document.documentElement.appendChild(h.el);
  }

  /* ---------------------------------------------------------------- Start */
  function legal() {
    if (pageLinksBothLegal()) return;
    var forced = ds.chromeLegal;
    if (forced && /^corner/.test(forced)) buildCorner(forced);
    else if (cannotScroll()) buildCorner('corner-bl');
    else buildFooter();
  }
  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function start() {
    if (mode === 'full') buildNav();
    onReady(function () {
      if (mode === 'mini') buildPill();
      legal();
    });
  }
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
