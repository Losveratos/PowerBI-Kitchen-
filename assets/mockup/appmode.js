/* MockupKitchen · Zielmodus, gespeicherte Filter und Typfilter (ab 0.7.0)
 *
 * Drei Bausteine, die auf app.js aufsetzen (MK-API) und nichts an dessen Rendering ändern:
 *  1. Zielmodus S.target: 'pbi' (Power BI) · 'app' (Fabric App) · 'wire' (Wireframe allgemein).
 *     Auswahl beim Anlegen (Dialog „Neu"), oben als Pille und im Reiter Bericht.
 *  2. Gespeicherte Filter S.views[]: { id, name, filters } als Chips über den Kacheln (Reiter Zonen).
 *     Im Ziel Power BI weist ein Hinweis auf die nötigen Lesezeichen hin.
 *  3. Typauswahl mit Schlagwort-Chips (MK_CATALOG.tagsOf) zusätzlich zur Textsuche.
 * Muss nach app.js geladen werden.
 */
(function () {
  'use strict';
  const MK = window.MK, I = window.MK_I18N, CAT = window.MK_CATALOG;
  if (!MK || !I || !CAT) return;
  const t = (k, v) => I.t(k, v);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S = () => MK.state;
  const TARGETS = MK.TARGETS || ['pbi', 'app', 'wire'];
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  // ------------------------------------------------------------------ Stil
  const css = `
  .target-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line-strong);background:var(--bg-card);border-radius:999px;padding:4px 10px 4px 6px;font-size:12px;font-weight:600;white-space:nowrap}
  .target-pill:hover{background:var(--bg-soft)}
  .target-pill .ic{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:10px;font-weight:700;background:var(--tg,#475569)}
  .target-pill .car{color:var(--ink-mute);font-size:10px}
  body[data-target="pbi"]{--tg:#B8860B} body[data-target="app"]{--tg:#1F7A6D} body[data-target="wire"]{--tg:#5B6472}
  body.present .target-pill{display:none}
  /* Wireframe: Skizzen und Rahmen in Grautönen */
  body[data-target="wire"] .page .tile svg,body[data-target="wire"] .page .tile .badges,body[data-target="wire"] .page .zone{filter:grayscale(1)}
  body[data-target="wire"] .page{--accent:#5B6472}
  /* Zieldialog */
  dialog.tg-dlg{width:min(94vw,940px)}
  .tg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  @media (max-width:820px){.tg-grid{grid-template-columns:1fr}}
  .tg-card{position:relative;text-align:left;border:1.5px solid var(--line);border-radius:14px;background:var(--bg-card);padding:12px 12px 14px;display:flex;flex-direction:column;gap:8px;transition:transform .14s,box-shadow .14s,border-color .14s}
  .tg-card:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(15,30,46,.10)}
  .tg-card[aria-checked="true"]{border-color:var(--tgc);box-shadow:0 0 0 3px color-mix(in srgb,var(--tgc) 22%,transparent),0 10px 26px rgba(15,30,46,.10)}
  .tg-card .art{height:118px;border-radius:9px;background:linear-gradient(160deg,color-mix(in srgb,var(--tgc) 13%,#fff),#fff 70%);border:1px solid var(--line);overflow:hidden}
  .tg-card .art svg{width:100%;height:100%;display:block}
  .tg-card b{font-size:15px}
  .tg-card p{margin:0;color:var(--ink-soft);font-size:12.5px;line-height:1.4}
  .tg-card small{color:var(--ink-mute);font-size:11px;line-height:1.35}
  .tg-card .tick{position:absolute;top:10px;right:10px;width:20px;height:20px;border-radius:50%;background:var(--tgc);color:#fff;display:none;place-items:center;font-size:12px}
  .tg-card[aria-checked="true"] .tick{display:grid}
  .tg-note{margin:12px 0 0;padding:8px 10px;border-radius:8px;background:var(--accent-soft);color:var(--ink);font-size:12.5px}
  /* Chip-Zeile auf der Seite */
  .zone.chips{background:transparent;display:flex;align-items:center;gap:calc(6px * var(--ui));padding:0 calc(16px * var(--ui));overflow:hidden;white-space:nowrap}
  .zone.chips .chip-cap{font-size:calc(9.5px * var(--ui));letter-spacing:.07em;text-transform:uppercase;color:#6B7280;margin-right:calc(2px * var(--ui))}
  .zone.chips .chip{display:inline-flex;align-items:center;gap:calc(5px * var(--ui));height:calc(20px * var(--ui));padding:0 calc(6px * var(--ui)) 0 calc(8px * var(--ui));border-radius:999px;border:1px dashed rgba(15,30,46,.35);background:transparent;color:#6B7280;font-size:calc(10.5px * var(--ui));cursor:pointer;transition:background .15s,color .15s,border-color .15s,transform .15s}
  .zone.chips .chip.on{border:1px solid color-mix(in srgb,var(--accent) 55%,#fff);background:color-mix(in srgb,var(--accent) 12%,#fff);color:#0F1E2E}
  .zone.chips .chip .dot{width:calc(6px * var(--ui));height:calc(6px * var(--ui));border-radius:50%;background:#B5B2A6;flex:none}
  .zone.chips .chip.on .dot{background:var(--accent)}
  .zone.chips .chip.slicer.on .dot{background:#1F5FBF}.zone.chips .chip.cross.on .dot{background:#1F7A6D}
  .zone.chips .chip .x{font-weight:400;font-size:calc(9px * var(--ui));opacity:.55;padding:0 calc(2px * var(--ui))}
  .zone.chips .chip:hover .x{opacity:1}
  .zone.chips .chip:not(.on) .x{display:none}
  .zone.chips .chip.reset{border-style:solid;border-color:transparent;text-decoration:underline;padding:0 calc(6px * var(--ui))}
  /* Gespeicherte Filter im Reiter Zonen */
  .vw-row{display:grid;grid-template-columns:1fr 1.4fr auto;gap:4px;margin-bottom:4px}
  .vw-row .ctl{padding:4px 6px;font-size:12px;min-width:0}
  .vw-row button{border:0;background:transparent;color:var(--ink-mute);font-size:14px;padding:0 4px}
  .vw-row button:hover{color:var(--bad)}
  .bm-warn{margin:8px 0 0;padding:8px 10px;border-radius:8px;border:1px solid #E6C86E;background:#FFF8DC;color:#5A4500;font-size:12px;line-height:1.4}
  .bm-warn.info{border-color:#B9D8D2;background:#EAF5F3;color:#16453E}
  /* Tab-Leiste unten (navPos 'tabs', Handy-Format) */
  .zone.footer.tabs{padding:0;gap:0;justify-content:stretch;align-items:stretch;background:var(--tile-bg,#fff);border-top:1px solid #E3E1D8;color:#6B7280}
  .zone.footer.tabs .tab{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:calc(4px * var(--ui));font-size:calc(10.5px * var(--ui));position:relative}
  .zone.footer.tabs .tab i{width:calc(18px * var(--ui));height:calc(18px * var(--ui));border-radius:calc(5px * var(--ui));border:calc(1.5px * var(--ui)) solid currentColor;opacity:.55}
  .zone.footer.tabs .tab b{font-weight:500;max-width:92%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .zone.footer.tabs .tab.act{color:var(--accent)}
  .zone.footer.tabs .tab.act i{opacity:1;background:color-mix(in srgb,var(--accent) 18%,transparent)}
  .zone.footer.tabs .tab.act::before{content:"";position:absolute;top:0;left:22%;right:22%;height:calc(2.5px * var(--ui));background:var(--accent);border-radius:0 0 3px 3px}
  body.present .page .zone.footer.tabs .tab{cursor:pointer}
  /* Vorlagenauswahl: Kennzeichen je Ziel */
  .tpl .tplb{display:flex;gap:4px;margin:3px 0 2px;flex-wrap:wrap}
  .tpl .tplb i{font-style:normal;font-size:10px;line-height:15px;padding:0 6px;border-radius:999px;background:var(--bg-soft);color:var(--ink-soft);border:1px solid transparent}
  .tpl .tplb i.tb-phone{background:#EAF5F3;color:#16453E}
  .tpl .tplb i.cur{border-color:currentColor;font-weight:600}
  .tpl.phone .pv{background:linear-gradient(180deg,#fff,#F4F7F6)}
  /* KPI-Kachel: der Titel ist die Beschriftung der Karte (klein und ruhig), die Zahl trägt das Gewicht */
  .page .tile.k-kpi .t-title,.page .tile.k-card .t-title{font-weight:500;font-size:calc(var(--fs-title,12px) * var(--ui) * var(--tf,1) * .86);opacity:.72;letter-spacing:.01em}
  .page .tile.k-kpi .t-sub,.page .tile.k-card .t-sub{opacity:.6}
  /* Farbschema (Reiter Design): Kitchen Basis oder Firmenfarben */
  .sch-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}
  .sch-card{border:1.5px solid var(--line);border-radius:10px;background:var(--bg-card);padding:7px 8px;text-align:left;display:flex;flex-direction:column;gap:5px;min-width:0}
  .sch-card:hover{border-color:var(--line-strong)}
  .sch-card[aria-pressed="true"]{border-color:var(--ink);box-shadow:0 0 0 2px var(--bg-soft)}
  .sch-card b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sch-card small{font-size:10.5px;color:var(--ink-mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sch-sw{display:flex;height:16px;border-radius:4px;overflow:hidden;border:1px solid var(--line)}
  .sch-sw i{flex:1;min-width:0}
  .sch-sw.empty{background:repeating-linear-gradient(135deg,#fff 0 6px,#F1F0EA 6px 12px)}
  .sch-row{display:flex;gap:6px;margin-top:8px;align-items:center}
  .sch-row .ctl{flex:1;min-width:0;padding:4px 6px;font-size:12px}
  .sch-pick{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
  .sch-pick button{width:22px;height:22px;border-radius:6px;border:1px solid rgba(15,30,46,.25);padding:0}
  .sch-pick button[aria-pressed="true"]{outline:2px solid var(--ink);outline-offset:1px}
  .sch-lbl{font-size:10.5px;color:var(--ink-mute);margin:8px 0 0;text-transform:uppercase;letter-spacing:.05em;font-weight:600}
  /* Kachel-Leiste: erscheint an der gewählten Kachel (Visual wählen, Einrichten) */
  .tile-bar{position:fixed;z-index:30;display:none;align-items:center;gap:4px;padding:4px;border-radius:999px;background:rgba(17,29,44,.92);box-shadow:0 8px 26px rgba(15,30,46,.28);color:#fff;font-size:12px;white-space:nowrap}
  .tile-bar.on{display:flex}
  .tile-bar button{border:0;background:transparent;color:#fff;border-radius:999px;padding:5px 11px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
  .tile-bar button:hover{background:rgba(255,255,255,.16)}
  .tile-bar button.pri{background:var(--accent-strong)}
  .tile-bar button.pri:hover{background:var(--accent-strong-hover)}
  .tile-bar .ttl{padding:0 6px 0 10px;opacity:.75;max-width:240px;overflow:hidden;text-overflow:ellipsis}
  body.present .tile-bar{display:none}
  /* Einrichten-Modus: die Kachel steht groß im Blick, alles andere tritt zurück */
  .page.focus .tile:not(.foc){opacity:.14;pointer-events:none;filter:grayscale(1)}
  .page.focus .zone{opacity:.2;pointer-events:none}
  .page.focus .gutter,.page.focus .gedge,.page.focus .zcfg{display:none}
  .page.focus .tile.foc{box-shadow:0 0 0 calc(2px / var(--zoom,1)) var(--accent),0 calc(18px / var(--zoom,1)) calc(60px / var(--zoom,1)) rgba(15,30,46,.22)}
  body.tile-focus .stage{background:#E9E8E2}
  body.tile-focus .pagebar,body.tile-focus .stage-bar{visibility:hidden}
  .focus-hint{position:fixed;z-index:29;left:50%;transform:translateX(-50%);display:none;padding:6px 14px;border-radius:999px;background:var(--bg-card);border:1px solid var(--line);box-shadow:var(--sh);font-size:12px;color:var(--ink-soft)}
  body.tile-focus .focus-hint{display:block}
  /* Ansichten-Schalter im Kopfband */
  .zone.header .vsw{display:flex;margin-left:calc(18px * var(--ui));border:1px solid rgba(15,30,46,.28);border-radius:calc(7px * var(--ui));overflow:hidden;flex:none}
  .zone.header .vsw span{padding:calc(5px * var(--ui)) calc(12px * var(--ui));font-size:calc(11.5px * var(--ui));white-space:nowrap;border-right:1px solid rgba(15,30,46,.18)}
  .zone.header .vsw span:last-child{border-right:0}
  .zone.header .vsw span.act{background:var(--accent);color:#fff}
  .zone.header.dark .vsw,.zone.header.accent .vsw,.zone.header.custom .vsw{border-color:currentColor}
  .zone.header.dark .vsw span,.zone.header.accent .vsw span,.zone.header.custom .vsw span{border-right-color:rgba(255,255,255,.3)}
  .zone.header.accent .vsw span.act{background:#0F1E2E}
  body.present .page .zone.header .vsw span{cursor:pointer}
  /* Einfach-Modus: nur das Wesentliche sichtbar */
  .simple-sw{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line-strong);border-radius:999px;background:var(--bg-card);padding:4px 11px 4px 6px;font-size:12px;font-weight:500;color:var(--ink-soft)}
  .simple-sw:hover{background:var(--bg-soft)}
  .simple-sw i{width:26px;height:15px;border-radius:999px;background:#C9C6BB;position:relative;transition:background .15s;flex:none}
  .simple-sw i::after{content:"";position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:transform .15s}
  .simple-sw[aria-checked="true"]{color:var(--ink)}
  .simple-sw[aria-checked="true"] i{background:var(--ink)}
  .simple-sw[aria-checked="true"] i::after{transform:translateX(11px)}
  /* Farbschema im Dialog Neu */
  .tg-scheme{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap}
  .tg-scheme>span{font-size:11px;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em}
  .tg-scheme button{display:inline-flex;align-items:center;gap:7px;border:1.5px solid var(--line);border-radius:999px;background:var(--bg-card);padding:4px 12px 4px 6px;font-size:12.5px}
  .tg-scheme button[aria-pressed="true"]{border-color:var(--ink);font-weight:600}
  .tg-scheme .sw{display:inline-flex;width:38px;height:14px;border-radius:999px;overflow:hidden;border:1px solid var(--line)}
  .tg-scheme .sw i{flex:1}
  body.present .simple-sw{display:none}
  @media (max-width:1640px){.topbar input.name{flex:0 1 130px;width:130px;min-width:100px}.topbar{gap:6px}.topbar .btn{padding-left:9px;padding-right:9px}#btnTour .mkt-lbl{display:none}}
  body.simple #btnImportTmdl,body.simple #dsTypo,body.simple #dsA11y,body.simple #secNav,body.simple #btnDiff,body.simple #btnGridCheck,body.simple #btnGridCheck2,body.simple #btnSplitRoot,body.simple .tab[data-tab="report"],
  body.simple #dsFormat .field:has(#spPixel),body.simple #dsFormat .field:has(#spMargin),body.simple #dsFormat .grid3:has(#spMargin),body.simple #dsFormat .field:has(#defScenario),body.simple #uiScaleInfo,
  body.simple #secHeader .field:has(#hdNav),body.simple #secHeader .toggle:has(#hdNavAuto),body.simple #secHeader .grid2:has(#hdH),
  body.simple #secFilter .field:has(#ftHeadShow),body.simple #secFilter .field:has(#ftText),body.simple #secFilter .grid2:has(#ftHeadShow),body.simple #ftCollapsibleRow,
  body.simple #secFooter .grid2:has(#ffH),body.simple #dsColors .field:has(#dsNative),body.simple #dsSurface .field:has(#dsRadius),
  body.simple #insEl details[data-grp="variants"],body.simple #insEl details[data-grp="ckopts"],body.simple #insEl details[data-grp="workshop"],body.simple #insEl .field:has(> .engine),
  body.simple #pageNotes,body.simple label[for="pageNotes"],body.simple #onlyUsed,body.simple label:has(#onlyUsed){display:none!important}
  /* Feld-Vorschläge je Rolle (Kachel-Reiter) */
  #insEl .role .sugg{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;align-items:center}
  #insEl .role .sugg small{font-size:10px;color:var(--ink-mute);text-transform:uppercase;letter-spacing:.05em}
  #insEl .role .sugg button{border:1px dashed var(--line-strong);background:var(--bg-card);border-radius:999px;padding:1px 8px;font-size:11px;color:var(--ink-soft);font-family:var(--ff-mono)}
  #insEl .role .sugg button:hover{border-style:solid;border-color:var(--accent);color:var(--ink);background:var(--accent-soft)}
  /* Visual-Wechsel an einer Kachel */
  .tile .t-alts{position:absolute;top:calc(5px * var(--ui));right:calc(34px * var(--ui));display:flex;border:1px solid rgba(15,30,46,.25);border-radius:calc(6px * var(--ui));overflow:hidden;background:var(--tile-bg,#fff);z-index:3;font-size:calc(9.5px * var(--ui));line-height:1}
  .tile .t-alts span{padding:calc(3.5px * var(--ui)) calc(7px * var(--ui));cursor:pointer;white-space:nowrap;border-right:1px solid rgba(15,30,46,.15);color:#475569;max-width:calc(90px * var(--ui));overflow:hidden;text-overflow:ellipsis}
  .tile .t-alts span:last-child{border-right:0}
  .tile .t-alts span.act{background:var(--accent);color:#fff}
  .tile.tiny .t-alts{display:none}
  .page.focus .tile:not(.foc) .t-alts{display:none}
  .tile-bar .sep{width:1px;height:16px;background:rgba(255,255,255,.25);margin:0 2px}
  .tile-bar button.ghost{opacity:.85}
  /* Typauswahl */
  dialog#dlgCatalog{width:min(96vw,1180px);max-width:min(96vw,1180px)}
  .cat-filter{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 18px 0}
  .cat-filter .ct{border:1px solid var(--line-strong);background:var(--bg-card);border-radius:999px;padding:4px 11px;font-size:12px;font-weight:500;display:inline-flex;gap:6px;align-items:center;transition:background .12s,border-color .12s,color .12s}
  .cat-filter .ct:hover{background:var(--bg-soft)}
  .cat-filter .ct[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:#fff}
  .cat-filter .ct i{font-style:normal;font-family:var(--ff-mono);font-size:10px;opacity:.6}
  .cat-filter .sep{width:1px;height:18px;background:var(--line);margin:0 2px}
  .cat-filter .cnt{margin-left:auto;color:var(--ink-mute);font-size:11.5px}
  #dlgCatalog .cat-grid{grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:10px}
  #dlgCatalog .cat-item{border-radius:12px;padding:8px;gap:6px;position:relative;transition:transform .12s,box-shadow .12s,border-color .12s}
  #dlgCatalog .cat-item:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(15,30,46,.10);border-color:var(--line-strong)}
  #dlgCatalog .cat-item .pv{height:84px;border-radius:8px;background:linear-gradient(180deg,#fff,#FAFAF7)}
  #dlgCatalog .cat-item .tg{display:flex;flex-wrap:wrap;gap:3px}
  #dlgCatalog .cat-item .tg span{font-size:10px;padding:1px 6px;border-radius:999px;background:var(--bg-soft);color:var(--ink-soft)}
  #dlgCatalog .cat-item .tg span.hit{background:var(--ink);color:#fff}
  #dlgCatalog .cat-item .na{position:absolute;top:12px;left:12px;font-size:11px;background:#FFF8DC;border:1px solid #E6C86E;color:#5A4500;border-radius:999px;padding:0 6px;line-height:16px}
  #dlgCatalog .cat-item[hidden],#dlgCatalog .cat-groups h3[hidden],#dlgCatalog .cat-grid[hidden]{display:none}
  .cat-empty{padding:28px 0;text-align:center;color:var(--ink-mute)}
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  // ------------------------------------------------------------------ Zielmodus
  const TG_COLOR = { pbi: '#B8860B', app: '#1F7A6D', wire: '#5B6472' };
  const TG_LETTER = { pbi: 'P', app: 'A', wire: 'W' };
  // Kleine Illustration je Ziel (reines SVG, keine Daten)
  function art(tg) {
    const c = TG_COLOR[tg], g = '#C9C6BB', k = '#0F1E2E';
    if (tg === 'pbi') return `<svg viewBox="0 0 240 118"><rect x="14" y="12" width="212" height="94" rx="6" fill="#fff" stroke="${g}"/><rect x="14" y="12" width="212" height="16" rx="6" fill="${k}"/><rect x="150" y="17" width="20" height="6" rx="2" fill="${c}"/><rect x="174" y="17" width="20" height="6" rx="2" fill="#fff" opacity=".35"/><rect x="198" y="17" width="20" height="6" rx="2" fill="#fff" opacity=".35"/><rect x="186" y="32" width="36" height="70" rx="3" fill="#ECEBE5"/><rect x="190" y="38" width="28" height="7" rx="2" fill="#fff" stroke="${g}"/><rect x="190" y="49" width="28" height="7" rx="2" fill="#fff" stroke="${g}"/><rect x="20" y="34" width="36" height="20" rx="3" fill="#fff" stroke="${g}"/><rect x="60" y="34" width="36" height="20" rx="3" fill="#fff" stroke="${g}"/><rect x="100" y="34" width="36" height="20" rx="3" fill="#fff" stroke="${g}"/><rect x="140" y="34" width="40" height="20" rx="3" fill="#fff" stroke="${g}"/><rect x="20" y="58" width="100" height="44" rx="3" fill="#fff" stroke="${g}"/><g fill="${k}"><rect x="28" y="82" width="8" height="14"/><rect x="40" y="76" width="8" height="20"/><rect x="52" y="70" width="8" height="26"/><rect x="64" y="78" width="8" height="18"/><rect x="76" y="66" width="8" height="30"/><rect x="88" y="72" width="8" height="24"/></g><rect x="124" y="58" width="56" height="44" rx="3" fill="#fff" stroke="${g}"/><g fill="${c}"><rect x="130" y="66" width="34" height="5"/><rect x="130" y="75" width="22" height="5"/><rect x="130" y="84" width="40" height="5"/><rect x="130" y="93" width="16" height="5"/></g></svg>`;
    if (tg === 'app') return `<svg viewBox="0 0 240 118"><rect x="14" y="12" width="212" height="94" rx="10" fill="#fff" stroke="${g}"/><rect x="14" y="12" width="212" height="18" rx="10" fill="#fff"/><line x1="14" y1="30" x2="226" y2="30" stroke="${g}"/><g stroke="${k}" stroke-width="2" stroke-linecap="round"><line x1="24" y1="17.500" x2="34" y2="17.500"/><line x1="24" y1="21.500" x2="34" y2="21.500"/><line x1="24" y1="25.500" x2="34" y2="25.500"/></g><rect x="42" y="17" width="54" height="8" rx="3" fill="${k}" opacity=".85"/><g><rect x="24" y="36" width="44" height="11" rx="5.500" fill="${c}" opacity=".16" stroke="${c}"/><circle cx="31" cy="41.500" r="2" fill="${c}"/><rect x="72" y="36" width="52" height="11" rx="5.500" fill="${c}" opacity=".16" stroke="${c}"/><circle cx="79" cy="41.500" r="2" fill="${c}"/><rect x="128" y="36" width="38" height="11" rx="5.500" fill="none" stroke="${g}" stroke-dasharray="3 2"/></g><rect x="24" y="53" width="92" height="46" rx="6" fill="#fff" stroke="${g}"/><path d="M32 90 L46 78 L60 83 L74 68 L88 72 L106 60" fill="none" stroke="${k}" stroke-width="2"/><rect x="122" y="53" width="94" height="46" rx="6" fill="#fff" stroke="${g}"/><g fill="${k}"><rect x="132" y="80" width="9" height="12"/><rect x="146" y="72" width="9" height="20"/><rect x="160" y="66" width="9" height="26"/><rect x="174" y="76" width="9" height="16"/></g><rect x="188" y="62" width="9" height="30" fill="${c}"/><rect x="202" y="70" width="9" height="22" fill="${k}"/><rect x="14" y="30" width="62" height="76" fill="${k}" opacity=".06"/></svg>`;
    return `<svg viewBox="0 0 240 118"><rect x="14" y="12" width="212" height="94" rx="4" fill="#fff" stroke="#8A8F98" stroke-dasharray="4 3"/><rect x="22" y="20" width="196" height="12" fill="#E3E5E8"/><g fill="none" stroke="#8A8F98"><rect x="22" y="38" width="60" height="28"/><line x1="22" y1="38" x2="82" y2="66"/><line x1="82" y1="38" x2="22" y2="66"/><rect x="88" y="38" width="60" height="28"/><line x1="88" y1="38" x2="148" y2="66"/><line x1="148" y1="38" x2="88" y2="66"/><rect x="154" y="38" width="64" height="28"/><line x1="154" y1="38" x2="218" y2="66"/><line x1="218" y1="38" x2="154" y2="66"/><rect x="22" y="72" width="126" height="28"/><rect x="154" y="72" width="64" height="28"/></g><g fill="#B9BDC4"><rect x="30" y="80" width="80" height="4"/><rect x="30" y="88" width="56" height="4"/><rect x="162" y="80" width="40" height="4"/><rect x="162" y="88" width="48" height="4"/></g></svg>`;
  }

  // Ziel setzen. defaults: Rahmen auf die Vorgaben des Ziels; demo: Beispiele für den App-Modus
  function applyTarget(target, o) {
    o = o || {}; const s = S(); if (!TARGETS.includes(target)) return;
    s.target = target; const c = s.chrome;
    if (o.defaults) {
      if (target === 'app') {
        c.navPos = 'burger'; c.header.navOn = false; c.filter.on = true; c.filter.side = 'burger';
        c.header.h = Math.max(+c.header.h || 56, 64);                 // App-Leiste: 96 px bei Full HD wie die dwg-Shell
        s.pixel = { mode: 'lattice', n: 12 };                          // 12er-Pixelraster: Rechtecke gehen ohne Rundung in die App-Spec
      } else {
        if (c.navPos === 'burger') { c.navPos = 'header'; c.header.navOn = true; }
        if (c.filter.side === 'burger') c.filter.side = 'right';
      }
    }
    if (o.demo && target === 'app') {
      if (!s.views.length) s.views = [{ id: MK.uid(), name: t('views.demo1'), filters: t('views.demo1f') }, { id: MK.uid(), name: t('views.demo2'), filters: t('views.demo2f') }];
      const want = [['DimDate', 'Year'], ['DimRegion', 'Region'], ['DimProduct', 'Category']];
      want.forEach(([tb, nm]) => {
        const tbl = (s.model.tables || []).find(x => x.name === tb); const col = tbl && tbl.columns.find(x => x.name === nm);
        if (col && !c.filter.fields.some(f => f.table === tb && f.name === nm)) c.filter.fields.push({ table: tb, name: nm, kind: 'column', isNew: false });
      });
    }
  }

  // Pille oben und Feld im Reiter Bericht
  const pill = el(`<button type="button" class="target-pill hide-present" id="btnTarget" data-i18n-title="target.pill.tip"><span class="ic"></span><span class="nm"></span><span class="car">▾</span></button>`);
  { const brand = $('.topbar .brand'); if (brand) brand.insertAdjacentElement('afterend', pill); }
  const rpField = el(`<div class="field" id="rpTargetField"><label for="rpTarget" data-i18n="target.label"></label><select class="ctl" id="rpTarget">${TARGETS.map(k => `<option value="${k}" data-i18n="target.${k}"></option>`).join('')}</select><p class="hint" id="rpTargetHint"></p></div>`);
  { const nameField = $('#rpName') && $('#rpName').closest('.field'); if (nameField) nameField.insertAdjacentElement('afterend', rpField); }
  // Navigation im Burger-Menü als weitere Position
  { const np = $('#hdNavPos'); if (np && !np.querySelector('option[value="burger"]')) np.insertAdjacentHTML('beforeend', `<option value="burger" data-i18n="opt.navPos.burger"></option><option value="tabs" data-i18n="opt.navPos.tabs"></option>`); }
  // Canvas-Vorgabe für das Handy-Format: 1080 × 1920 mit logischer Breite 400 (Faktor 2,7 statt 0,84)
  { const cp = $('#canvasPreset'); if (cp && !cp.querySelector('option[value="1080x1920@400"]')) { const o = el(`<option value="1080x1920@400" data-i18n="opt.canvas.phone"></option>`); const cu = cp.querySelector('option[value="custom"]'); if (cu) cp.insertBefore(o, cu); else cp.appendChild(o); I.apply(cp.parentElement); } }

  // Dialog: neues Projekt bzw. Ziel wechseln
  const dlg = el(`<dialog id="dlgTarget" class="tg-dlg" aria-labelledby="dlgTargetH">
    <div class="dlg-head"><div><h2 id="dlgTargetH"></h2><p id="dlgTargetP"></p></div><span class="spacer"></span><button class="btn ghost" data-tgclose data-i18n-title="btn.close" data-i18n-aria="btn.close">✕</button></div>
    <div class="dlg-body">
      <div class="tg-grid" role="radiogroup" aria-labelledby="dlgTargetH">${TARGETS.map(k => `<button type="button" class="tg-card" role="radio" data-tg="${k}" style="--tgc:${TG_COLOR[k]}"><span class="tick">✓</span><span class="art">${art(k)}</span><b data-i18n="target.${k}"></b><p data-i18n="target.${k}.sub"></p><small data-i18n="target.feat.${k}"></small></button>`).join('')}</div>
      <div class="tg-scheme" id="tgScheme" role="group"><span data-i18n="scheme.sec"></span>
        <button type="button" data-tgscheme="kitchen"><span class="sw"><i style="background:#0F1E2E"></i><i style="background:#C25A2D"></i><i style="background:#1E8F9E"></i></span><span data-i18n="scheme.kitchen"></span></button>
        <button type="button" data-tgscheme="clean"><span class="sw"><i style="background:#404040"></i><i style="background:#B3B3B3"></i><i style="background:#FFFFFF"></i></span><span data-i18n="scheme.clean"></span> <small style="color:var(--ink-mute)" data-i18n="scheme.cleanSub"></small></button>
      </div>
      <label class="toggle" style="margin-top:12px"><input type="checkbox" id="tgOpt"> <span id="tgOptLbl"></span></label>
      <p class="tg-note" id="tgNote" hidden></p>
    </div>
    <div class="dlg-foot" style="flex-direction:column;align-items:stretch"><button class="btn accent full" id="tgGo"></button></div>
  </dialog>`);
  document.body.appendChild(dlg);
  let dlgMode = 'new', dlgPick = 'pbi', dlgScheme = 'kitchen';
  function pickScheme(k) { dlgScheme = k; $$('[data-tgscheme]', dlg).forEach(b => b.setAttribute('aria-pressed', b.dataset.tgscheme === k ? 'true' : 'false')); }
  function pickCard(k) { dlgPick = k; $$('.tg-card', dlg).forEach(b => { const on = b.dataset.tg === k; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }); $('#tgOpt').closest('label').style.display = (dlgMode === 'new' && k !== 'app') ? 'none' : ''; }
  function openTargetDialog(mode) {
    dlgMode = mode; const s = S();
    $('#dlgTargetH').textContent = t(mode === 'new' ? 'target.dlg.h' : 'target.dlg.switchH');
    $('#dlgTargetP').textContent = t(mode === 'new' ? 'target.dlg.p' : 'target.dlg.switchP');
    $('#tgGo').textContent = t(mode === 'new' ? 'target.dlg.create' : 'target.dlg.switch');
    $('#tgOptLbl').textContent = t(mode === 'new' ? 'target.dlg.demo' : 'target.dlg.defaults'); $('#tgOpt').checked = true;
    const n = s.pages.reduce((a, p) => a + MK.leaves(p.layout).filter(l => l.visual).length, 0);
    const note = $('#tgNote'); note.hidden = !(mode === 'new' && !MK.isUnchanged() && (n || s.pages.length > 1)); note.textContent = t('target.dlg.replace', { n, p: s.pages.length });
    $('#tgScheme').style.display = mode === 'new' ? '' : 'none'; pickScheme(s.design.scheme === 'clean' ? 'clean' : 'kitchen');
    pickCard(s.target || 'pbi'); dlg.showModal(); const cur = $('.tg-card[aria-checked="true"]', dlg); if (cur) cur.focus();
  }
  dlg.addEventListener('click', e => {
    const card = e.target.closest('.tg-card'); if (card) { pickCard(card.dataset.tg); return; }
    const scb = e.target.closest('[data-tgscheme]'); if (scb) { pickScheme(scb.dataset.tgscheme); return; }
    if (e.target.closest('[data-tgclose]')) dlg.close();
  });
  dlg.addEventListener('dblclick', e => { if (e.target.closest('.tg-card')) $('#tgGo').click(); });
  dlg.addEventListener('keydown', e => {
    if (!e.target.closest('.tg-card')) return; const i = TARGETS.indexOf(dlgPick);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pickCard(TARGETS[(i + 1) % TARGETS.length]); $('.tg-card[aria-checked="true"]', dlg).focus(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pickCard(TARGETS[(i + TARGETS.length - 1) % TARGETS.length]); $('.tg-card[aria-checked="true"]', dlg).focus(); }
    else if (e.key === 'Enter') { e.preventDefault(); $('#tgGo').click(); }
  });
  $('#tgGo').onclick = () => {
    const opt = $('#tgOpt').checked;
    if (dlgMode === 'new') { MK.reset(); applyTarget(dlgPick, { defaults: true, demo: opt }); if (dlgScheme === 'clean') applyScheme('clean'); MK.fitZoom(); MK.commit({ noUndo: true }); MK.toast(I.t('toast.newProject') + ' · ' + t('target.' + dlgPick)); }
    else { applyTarget(dlgPick, { defaults: opt }); MK.commit(); MK.toast(t('target.changed', { t: t('target.' + dlgPick) })); }
    dlg.close();
  };
  pill.onclick = () => openTargetDialog('switch');
  { const bn = $('#btnNew'); if (bn) bn.onclick = () => openTargetDialog('new'); }
  $('#rpTarget').addEventListener('change', e => { applyTarget(e.target.value, {}); MK.commit(); MK.toast(t('target.changed', { t: t('target.' + e.target.value) })); });

  // ------------------------------------------------------------------ Gespeicherte Filter (Reiter Zonen)
  const sec = el(`<details class="sub" id="secViews" open><summary><span data-i18n="views.sec"></span><span class="cnt" id="vwCnt" hidden></span></summary>
    <p class="hint" style="margin:0 0 6px" data-i18n="views.hint"></p>
    <div id="vwList"></div>
    <button type="button" class="btn sm" id="vwAdd" data-i18n="views.add"></button>
    <div id="vwWarn"></div>
  </details>`);
  { const foot = $('#secFooter'); if (foot) foot.insertAdjacentElement('beforebegin', sec); else { const ic = $('#insChrome'); if (ic) ic.appendChild(sec); } }
  function renderViews(force) {
    const s = S(), list = $('#vwList'); if (!list) return;
    const typing = list.contains(document.activeElement) && $$('.vw-row', list).length === s.views.length;
    if (!typing || force) {
      list.innerHTML = s.views.map((v, i) => `<div class="vw-row"><input class="ctl" data-vwname="${i}" value="${esc(v.name)}" placeholder="${esc(t('views.name'))}"><input class="ctl" data-vwf="${i}" value="${esc(v.filters)}" placeholder="${esc(t('views.filters'))}"><button type="button" data-vwrm="${i}" title="${esc(t('views.remove'))}" aria-label="${esc(t('views.remove'))}">×</button></div>`).join('') || `<p class="hint" style="margin:0 0 6px">${esc(t('views.none'))}</p>`;
    }
    const cnt = $('#vwCnt'); cnt.hidden = !s.views.length; cnt.textContent = s.views.length;
    const w = []; const burger = MK.burgerOn();
    if (s.target === 'pbi') { if (s.views.length) w.push(`<p class="bm-warn">⚠ ${esc(t('views.bmWarn'))}</p>`); if (burger) w.push(`<p class="bm-warn">⚠ ${esc(t('views.bmWarnBurger'))}</p>`); }
    else if (s.target === 'app' && (s.views.length || burger)) w.push(`<p class="bm-warn info">${esc(t('views.appNote'))}</p>`);
    $('#vwWarn').innerHTML = w.join('');
  }
  sec.addEventListener('input', e => {
    const s = S(); const a = e.target.closest('[data-vwname]'), b = e.target.closest('[data-vwf]');
    if (a && s.views[+a.dataset.vwname]) s.views[+a.dataset.vwname].name = a.value;
    if (b && s.views[+b.dataset.vwf]) s.views[+b.dataset.vwf].filters = b.value;
    if (a || b) { MK.persist(); MK.render({ inspector: false }); }
  });
  sec.addEventListener('change', e => { if (e.target.closest('[data-vwname],[data-vwf]')) MK.commit({ keep: true }); });
  sec.addEventListener('click', e => {
    const s = S(); const rm = e.target.closest('[data-vwrm]');
    if (rm) { s.views.splice(+rm.dataset.vwrm, 1); MK.commit(); renderViews(true); return; }
    if (e.target.closest('#vwAdd')) { s.views.push({ id: MK.uid(), name: '', filters: '' }); MK.commit(); renderViews(true); const last = $$('[data-vwname]', sec).pop(); if (last) last.focus(); }
  });
  // Klick auf die Chip-Zeile im Entwurf öffnet den Abschnitt (in der Präsentation übernimmt stage.js)
  document.addEventListener('click', e => {
    if (document.body.classList.contains('present')) return;
    if (!e.target.closest || !e.target.closest('#page [data-chipzone]')) return;
    MK.showTab('chrome'); sec.open = true; sec.scrollIntoView({ block: 'nearest' }); sec.classList.add('flash'); setTimeout(() => sec.classList.remove('flash'), 1300);
  });

  // ------------------------------------------------------------------ Typauswahl: Schlagwort-Chips
  const dlgCat = $('#dlgCatalog'), catBody = $('#catBody');
  const pick = { tags: new Set(), onlyTarget: false };
  const tagsOf = kind => { const d = CAT.byId[kind]; return (CAT.tagsOf ? CAT.tagsOf(kind) : (d && d.tags)) || []; };
  const TAG_IDS = () => (CAT.tagIds && CAT.tagIds.length ? CAT.tagIds : Array.from(new Set(CAT.list.flatMap(k => k.tags || []))));
  // Für die Fabric App aus der Spec erzeugbar? Katalog sagt es (targets), sonst: ChartKitchen-Modus oder P&L-Visual
  function fitsApp(def) { if (!def) return true; if (def.targets) return def.targets.includes('app'); return !!def.ckMode || !!(def.customVisual && def.customVisual.name === 'pnlByDatenWG'); }
  let bar = null, applying = false, catObs = null;
  function buildBar() {
    if (!dlgCat || !catBody) return; const ids = TAG_IDS(); if (!ids.length) return;
    if (!bar) { bar = el(`<div class="cat-filter" id="catFilter" role="group"></div>`); catBody.insertAdjacentElement('beforebegin', bar);
      bar.addEventListener('click', e => {
        const b = e.target.closest('[data-tag]'); const all = e.target.closest('[data-tagall]'); const ot = e.target.closest('[data-onlytarget]');
        if (all) pick.tags.clear(); else if (b) { if (pick.tags.has(b.dataset.tag)) pick.tags.delete(b.dataset.tag); else pick.tags.add(b.dataset.tag); }
        else if (ot) pick.onlyTarget = !pick.onlyTarget; else return;
        buildBar(); applyPick();
      }); }
    const n = id => CAT.list.filter(k => (k.tags || tagsOf(k.id)).includes(id)).length;
    const isApp = S().target === 'app';
    bar.innerHTML = `<button type="button" class="ct" data-tagall aria-pressed="${pick.tags.size ? 'false' : 'true'}">${esc(t('pick.all'))}</button>`
      + ids.filter(id => n(id)).map(id => `<button type="button" class="ct" data-tag="${id}" aria-pressed="${pick.tags.has(id) ? 'true' : 'false'}">${esc(t('tag.' + id))}<i>${n(id)}</i></button>`).join('')
      + (isApp ? `<span class="sep"></span><button type="button" class="ct" data-onlytarget aria-pressed="${pick.onlyTarget ? 'true' : 'false'}">${esc(t('target.app'))}: ${esc(t('pick.onlyTarget'))}</button>` : '')
      + `<span class="cnt" id="catCnt"></span>`;
  }
  function applyPick() {
    if (!catBody || applying) return; applying = true;
    try {
      const isApp = S().target === 'app'; let shown = 0, all = 0;
      $$('.cat-empty', catBody).forEach(x => x.remove());
      $$('.cat-item[data-kind]', catBody).forEach(it => {
        const kind = it.dataset.kind, def = CAT.byId[kind], tg = tagsOf(kind); all++;
        const okTags = !pick.tags.size || Array.from(pick.tags).every(x => tg.includes(x));
        const okTarget = !(isApp && pick.onlyTarget) || fitsApp(def);
        it.hidden = !(okTags && okTarget); if (!it.hidden) shown++;
        let line = it.querySelector('.tg'); if (!line && tg.length) { line = document.createElement('span'); line.className = 'tg'; it.appendChild(line); }
        if (line) line.innerHTML = tg.map(x => `<span class="${pick.tags.has(x) ? 'hit' : ''}">${esc(t('tag.' + x))}</span>`).join('');
        let na = it.querySelector('.na'); const need = isApp && !fitsApp(def);
        if (need && !na) { na = document.createElement('span'); na.className = 'na'; na.textContent = '⚠'; na.title = t('pick.notApp'); it.appendChild(na); } else if (!need && na) na.remove();
      });
      $$('.cat-grid', catBody).forEach(g => { const any = $$('.cat-item:not([hidden])', g).length > 0; g.hidden = !any; const h = g.previousElementSibling; if (h && h.tagName === 'H3') h.hidden = !any; });
      if (!shown && all) catBody.insertAdjacentHTML('beforeend', `<div class="cat-empty">${esc(t('pick.none'))} <button type="button" class="btn sm" id="catClear">${esc(t('pick.clear'))}</button></div>`);
      const cnt = $('#catCnt'); if (cnt) cnt.textContent = t('pick.count', { n: shown, all: CAT.list.length });
    } finally { applying = false; if (catObs) catObs.takeRecords(); }   // eigene Änderungen (Leer-Hinweis) nicht wieder als Anlass nehmen
  }
  if (catBody) {
    catObs = new MutationObserver(() => { if (!applying) { if (!bar) buildBar(); applyPick(); } }); catObs.observe(catBody, { childList: true });
    catBody.addEventListener('click', e => { if (e.target.closest('#catClear')) { pick.tags.clear(); pick.onlyTarget = false; const q = $('#catSearch'); if (q && q.value) { q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true })); } buildBar(); applyPick(); } });
  }


  // ------------------------------------------------------------------ Farbschema: Kitchen Basis oder Firmenfarben
  // S.design.scheme = 'kitchen' | 'brand'; S.design.brand = { name, colors[], source, background?, foreground? }.
  // Firmenfarben prägen Kopfband, Akzent und die Farben nativer Visuals (nativePalette 'brand'). Die Szenario-Notation
  // der ChartKitchen-Skizzen (AC dunkel, PY grau, PL Kontur, Abweichung Teal/Rot oder Grün/Rot) bleibt davon unberührt.
  const KITCHEN = { accent: '#C25A2D', header: 'light', headerBg: '#0F1E2E', headerInk: '#FFFFFF', pageBg: 'light', pageBgHex: '#F4F4F1', tileBg: '#FFFFFF', ink: '#0F1E2E', nativePalette: 'neutral' };
  const KITCHEN_SW = ['#0F1E2E', '#C25A2D', '#1E8F9E', '#F4F4F1', '#8C8C8C'];
  // „Klar": an IBCS orientiert, so wenig Gestaltung wie möglich. Weiße Seite, flache Kacheln ohne Rahmen und Rundung, kein Logo,
  // Akzent in Dunkelgrau, Abweichungen klassisch Grün/Rot. Farbe trägt nur noch Bedeutung.
  const CLEAN = { accent: '#404040', header: 'light', headerBg: '#0F1E2E', headerInk: '#FFFFFF', pageBg: 'white', pageBgHex: '#FFFFFF', tileBg: '#FFFFFF', ink: '#1A1A1A', nativePalette: 'neutral', palette: 'ibcs', tile: 'flat', radius: 0 };
  const CLEAN_SW = ['#404040', '#B3B3B3', '#FFFFFF', '#3A9A5B', '#C8412F'];
  const KITCHEN_LOOK = { palette: 'teal', tile: 'border', radius: 8 };
  const HEX = /^#[0-9a-fA-F]{6}$/;
  const normHex = v => { let s = String(v == null ? '' : v).trim(); if (/^#[0-9a-fA-F]{3}$/.test(s)) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3]; if (/^#[0-9a-fA-F]{8}$/.test(s)) s = s.slice(0, 7); return HEX.test(s) ? s.toUpperCase() : null; };
  const lumOf = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const contrast = (a, b) => { const x = lumOf(a), y = lumOf(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const satOf = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255); const mx = Math.max.apply(null, c), mn = Math.min.apply(null, c); return mx ? (mx - mn) / mx : 0; };
  const uniq = a => a.filter((x, i) => x && a.indexOf(x) === i);
  // Farben aus einer Datei oder einem eingefügten Text: Power-BI-Theme (dataColors, background, foreground, tableAccent) oder eine Liste von Hex-Werten
  function parseColors(text, fileName) {
    const hexes = s => uniq((String(s).match(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []).map(normHex));
    let j = null; try { j = JSON.parse(text); } catch (e) { j = null; }
    const base = String(fileName || '').replace(/\.[^.]+$/, '');
    if (j && typeof j === 'object' && !Array.isArray(j)) {
      const dc = uniq((Array.isArray(j.dataColors) ? j.dataColors : []).map(normHex));
      const acc = normHex(j.tableAccent);
      const cols = dc.length ? dc : hexes(text);
      return { name: String(j.name || base || ''), colors: cols.slice(0, 8), source: dc.length ? 'pbi-theme' : 'list', background: normHex(j.background), foreground: normHex(j.foreground || j.firstLevelElements), accent: acc };
    }
    return { name: base, colors: hexes(text).slice(0, 8), source: 'list' };
  }
  // Zuordnung der Firmenfarben: Kopfband = erste Farbe, Akzent = erste kräftige Farbe mit genug Kontrast auf Weiß, die nicht das Kopfband ist
  function brandMapping(b) {
    const cols = b.colors || []; const head = b.head && cols.includes(b.head) ? b.head : cols[0];
    const cand = cols.filter(x => x !== head && satOf(x) >= 0.25 && contrast(x, '#FFFFFF') >= 3);
    const accent = (b.accent && HEX.test(b.accent)) ? b.accent : (cand[0] || cols.find(x => x !== head && contrast(x, '#FFFFFF') >= 3) || head);
    return { head, accent, headInk: contrast(head, '#FFFFFF') >= contrast(head, '#0F1E2E') ? '#FFFFFF' : '#0F1E2E' };
  }
  function applyScheme(which) {
    const d = S().design;
    if (which === 'brand' && d.brand && d.brand.colors && d.brand.colors.length) {
      const m = brandMapping(d.brand);
      d.scheme = 'brand'; d.accent = m.accent; d.header = 'custom'; d.headerBg = m.head; d.headerInk = m.headInk; d.nativePalette = 'brand';
      if (d.brand.background) { d.tileBg = d.brand.background; }
      if (d.brand.foreground && contrast(d.brand.foreground, d.tileBg || '#FFFFFF') >= 4.5) d.ink = d.brand.foreground;
    } else if (which === 'clean') {
      const hd = S().chrome.header; if (d.scheme !== 'clean') d.logoBefore = hd.logoPos || 'left';
      d.scheme = 'clean'; Object.assign(d, CLEAN); hd.logoPos = 'none';
    } else {
      d.scheme = 'kitchen'; Object.assign(d, KITCHEN);
    }
    // Verlässt man „Klar", kommen Rahmen, Rundung, Teal/Rot und das Logo zurück
    if (which !== 'clean' && d.logoBefore !== undefined) { Object.assign(d, KITCHEN_LOOK); S().chrome.header.logoPos = d.logoBefore || 'left'; delete d.logoBefore; }
  }
  const sch = el(`<details class="sub" id="dsScheme" open><summary data-i18n="scheme.sec"></summary>
    <p class="hint" style="margin:0 0 6px" data-i18n="scheme.hint"></p>
    <div class="sch-grid" role="group">
      <button type="button" class="sch-card" data-scheme="kitchen"><span class="sch-sw">${KITCHEN_SW.map(c => `<i style="background:${c}"></i>`).join('')}</span><b data-i18n="scheme.kitchen"></b><small data-i18n="scheme.kitchenSub"></small></button>
      <button type="button" class="sch-card" data-scheme="clean"><span class="sch-sw">${CLEAN_SW.map(c => `<i style="background:${c}"></i>`).join('')}</span><b data-i18n="scheme.clean"></b><small data-i18n="scheme.cleanSub"></small></button>
      <button type="button" class="sch-card" data-scheme="brand"><span class="sch-sw" id="schBrandSw"></span><b id="schBrandName"></b><small id="schBrandSub"></small></button>
    </div>
    <div class="sch-row"><button type="button" class="btn sm" id="schLoad" data-i18n="scheme.load" data-i18n-title="scheme.loadTip"></button><input type="file" id="schFile" accept=".json,.txt,.css,.scss,.xml,application/json,text/plain" hidden></div>
    <div class="sch-row"><input class="ctl" id="schHex" data-i18n-ph="scheme.hexPh" spellcheck="false"><button type="button" class="btn sm" id="schHexGo" data-i18n="scheme.apply"></button></div>
    <div id="schDetail" hidden>
      <div class="sch-row"><input class="ctl" id="schName" data-i18n-ph="scheme.namePh"></div>
      <p class="sch-lbl" data-i18n="scheme.head"></p><div class="sch-pick" id="schHead"></div>
      <p class="sch-lbl" data-i18n="scheme.accent"></p><div class="sch-pick" id="schAccent"></div>
    </div>
    <p class="hint" id="schNote" style="margin-top:8px"></p>
  </details>`);
  { const first = $('#dsFormat'); if (first) first.insertAdjacentElement('beforebegin', sch); else { const idn = $('#insDesign'); if (idn) idn.appendChild(sch); } }
  { const dn = $('#dsNative'); if (dn && !dn.querySelector('option[value="brand"]')) dn.insertAdjacentHTML('beforeend', `<option value="brand" data-i18n="scheme.native"></option>`); }
  function setBrand(parsed) {
    if (!parsed || !parsed.colors || !parsed.colors.length) { MK.toast(t('scheme.none')); return false; }
    const d = S().design; d.brand = { name: parsed.name || (d.brand && d.brand.name) || '', colors: parsed.colors, source: parsed.source || 'list' };
    if (parsed.background) d.brand.background = parsed.background; if (parsed.foreground) d.brand.foreground = parsed.foreground; if (parsed.accent) d.brand.accent = parsed.accent;
    applyScheme('brand'); MK.commit(); MK.toast(t('scheme.loaded', { n: parsed.colors.length, name: d.brand.name || t('scheme.brand') })); return true;
  }
  sch.addEventListener('click', e => {
    const card = e.target.closest('[data-scheme]');
    if (card) { const w = card.dataset.scheme; if (w === 'brand' && !(S().design.brand && S().design.brand.colors && S().design.brand.colors.length)) { $('#schFile').click(); return; } applyScheme(w); MK.commit(); return; }
    if (e.target.closest('#schLoad')) { $('#schFile').click(); return; }
    if (e.target.closest('#schHexGo')) { if (setBrand(parseColors($('#schHex').value, ''))) $('#schHex').value = ''; return; }
    const h = e.target.closest('[data-schhead]'); if (h) { S().design.brand.head = h.dataset.schhead; delete S().design.brand.accent; applyScheme('brand'); MK.commit(); return; }
    const a = e.target.closest('[data-schacc]'); if (a) { S().design.brand.accent = a.dataset.schacc; applyScheme('brand'); MK.commit(); }
  });
  $('#schHex').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#schHexGo').click(); } });
  $('#schName').addEventListener('input', e => { const b = S().design.brand; if (b) { b.name = e.target.value; MK.persist(); $('#schBrandName').textContent = b.name || t('scheme.brand'); } });
  $('#schName').addEventListener('change', () => MK.commit({ keep: true }));
  $('#schFile').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = () => { setBrand(parseColors(String(rd.result || ''), f.name)); e.target.value = ''; }; rd.readAsText(f);
  });
  function renderScheme() {
    const d = S().design, b = d.brand, has = !!(b && b.colors && b.colors.length), cur = d.scheme === 'brand' && has ? 'brand' : (d.scheme === 'clean' ? 'clean' : 'kitchen');
    $$('[data-scheme]', sch).forEach(x => x.setAttribute('aria-pressed', x.dataset.scheme === cur ? 'true' : 'false'));
    const sw = $('#schBrandSw'); sw.className = 'sch-sw' + (has ? '' : ' empty'); sw.innerHTML = has ? b.colors.map(c => `<i style="background:${c}"></i>`).join('') : '';
    $('#schBrandName').textContent = has ? (b.name || t('scheme.brand')) : t('scheme.brand');
    $('#schBrandSub').textContent = has ? t('scheme.brandSub', { n: b.colors.length }) : t('scheme.brandEmpty');
    const det = $('#schDetail'); det.hidden = !(has && cur === 'brand');
    if (!det.hidden) {
      const m = brandMapping(b);
      if (document.activeElement !== $('#schName')) $('#schName').value = b.name || '';
      $('#schHead').innerHTML = b.colors.map(c => `<button type="button" data-schhead="${c}" style="background:${c}" title="${c}" aria-label="${c}" aria-pressed="${c === d.headerBg ? 'true' : 'false'}"></button>`).join('');
      $('#schAccent').innerHTML = b.colors.map(c => `<button type="button" data-schacc="${c}" style="background:${c}" title="${c}" aria-label="${c}" aria-pressed="${c === d.accent ? 'true' : 'false'}"></button>`).join('');
      const low = contrast(m.accent, '#FFFFFF') < 3;
      $('#schNote').textContent = low ? t('scheme.lowContrast', { c: d.accent }) : t('scheme.note');
    } else $('#schNote').textContent = '';
  }

  // ------------------------------------------------------------------ Kachel-Leiste und Einrichten-Modus
  // Klick auf eine Kachel zeigt an ihr zwei Wege: „Visual wählen" (Typauswahl) und „Einrichten" (die Kachel groß im Blick,
  // Felder links ziehen oder rechts zuordnen, dann zurück). Im Einrichten-Modus wird aus der Leiste „Fertig".
  const tbar = el(`<div class="tile-bar hide-present" id="tileBar" role="toolbar"><span class="ttl" id="tbTitle"></span><button type="button" data-tb="pick"></button><button type="button" class="ghost" data-tb="auto"></button><button type="button" class="ghost" data-tb="alt"></button><button type="button" class="ghost" data-tb="altdrop"></button><button type="button" class="pri" data-tb="setup"></button></div>`);
  const fhint = el(`<div class="focus-hint" id="focusHint"></div>`);
  document.body.appendChild(tbar); document.body.appendChild(fhint);
  function placeTileBar() {
    const id = MK.sel, focus = MK.focusId, pageEl = $('#page');
    const tile = id && pageEl ? pageEl.querySelector('.tile[data-leaf="' + CSS.escape(id) + '"]') : null;
    if (!tile || document.body.classList.contains('present') || document.querySelector('dialog[open]')) { tbar.classList.remove('on'); return; }
    const leaf = MK.leaves(MK.page().layout).find(l => l.id === id); const v = leaf && leaf.visual; const def = v ? CAT.byId[v.kind] : null;
    $('#tbTitle').textContent = focus ? t('tb.setupOf', { t: (v && (v.title || (def && def.label))) || '' }) : '';
    $('#tbTitle').style.display = focus ? '' : 'none';
    tbar.querySelector('[data-tb="pick"]').textContent = v ? t('tb.pick') : t('tb.pickEmpty');
    const sb = tbar.querySelector('[data-tb="setup"]'); sb.textContent = focus ? t('tb.done') : t('tb.setup'); sb.style.display = v ? '' : 'none';
    const hasEmpty = !!(v && def && CAT.rolesFor(def, v).some(r => !((v.roles || {})[r.key] || []).length));
    const ab = tbar.querySelector('[data-tb="auto"]'); ab.textContent = t('tb.auto'); ab.style.display = focus && hasEmpty ? '' : 'none';
    const al = tbar.querySelector('[data-tb="alt"]'); al.textContent = t('tb.alt'); al.style.display = focus && v ? '' : 'none';
    const ad = tbar.querySelector('[data-tb="altdrop"]'); ad.textContent = t('tb.altDrop'); ad.style.display = focus && v && (v.alts || []).length ? '' : 'none';
    tbar.classList.add('on');
    const r = tile.getBoundingClientRect(), st = $('#stage').getBoundingClientRect(), bw = tbar.offsetWidth || 260, bh = tbar.offsetHeight || 34;
    let x = r.left + r.width / 2 - bw / 2, y = r.top - bh - 8;
    if (y < st.top + 6) y = Math.min(r.bottom + 8, st.bottom - bh - 6);
    x = Math.max(st.left + 6, Math.min(x, st.right - bw - 6));
    tbar.style.left = Math.round(x) + 'px'; tbar.style.top = Math.round(y) + 'px';
    fhint.textContent = t('tb.hint'); fhint.style.top = Math.round(st.bottom - 46) + 'px'; fhint.style.left = Math.round(st.left + st.width / 2) + 'px';
  }
  tbar.addEventListener('mousedown', e => e.stopPropagation());
  tbar.addEventListener('click', e => {
    const b = e.target.closest('[data-tb]'); if (!b) return;
    if (b.dataset.tb === 'pick') { MK.openCatalog(); return; }
    if (b.dataset.tb === 'auto') { autoFill(); return; }
    if (b.dataset.tb === 'alt') { addAlt(); return; }
    if (b.dataset.tb === 'altdrop') { dropAlt(); return; }
    // Ab 0.9.0 öffnet „Einrichten“ den Arbeitsbereich (studio.js); der Zoom auf die Kachel bleibt als Rückfall
    if (MK.focusId) MK.unfocusTile(); else if (window.MK_STUDIO) window.MK_STUDIO.open(MK.sel); else MK.focusTile(MK.sel);
  });
  { const stg = $('#stage'); if (stg) stg.addEventListener('scroll', placeTileBar, { passive: true }); }
  // Auswahl per Klick oder Taste zeichnet nicht neu (kein mk:rendered), deshalb hier nachziehen
  document.addEventListener('click', () => setTimeout(() => { placeTileBar(); decorateRoles(); }, 0));
  document.addEventListener('keyup', e => { if (e.key === 'Escape' || e.key === 'Tab' || e.key === 'Enter' || e.key.indexOf('Arrow') === 0) setTimeout(placeTileBar, 0); });
  window.addEventListener('resize', () => setTimeout(placeTileBar, 60));
  // Esc beendet zuerst den Einrichten-Modus (vor den Kürzeln des Editors)
  window.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !MK.focusId || document.querySelector('dialog[open]')) return;
    const tg = e.target; if (tg && tg.matches && tg.matches('input,textarea,select')) return;
    e.stopImmediatePropagation(); e.preventDefault(); MK.unfocusTile();
  }, true);
  // Nach dem Schließen der Typauswahl die Leiste wieder zeigen
  $$('dialog').forEach(d => d.addEventListener('close', () => setTimeout(placeTileBar, 30)));

  // ------------------------------------------------------------------ Feld-Vorschläge je Rolle
  // Für leere Rollen schlägt das Tool passende Felder aus dem Modell vor (ein Klick statt Ziehen). Die Regeln sind bewusst
  // einfach und lesen nur Namen und Feldart: Zeitfelder, Szenario-Kennzahlen (AC, PL, PY, BU, FC), Dimensionen ohne Schlüssel.
  const RX = { time: /(^|[^a-z])(month|monat|date|datum|period|periode|quarter|quartal|year|jahr|week|woche)/i, key: /(key|id|sort|nr|code|order)$/i,
    fc: /forecast|prognose|isfc|fcflag/i, rowtype: /row.?type|zeilentyp/i, geo: /country|land|region|city|stadt|state|bundesland/i, start: /start|begin|von|from/i, end: /end|ende|bis|to$/i,
    dim: /category|kategorie|product|produkt|region|customer|kunde|account|konto|segment|channel|kanal|brand|marke|department|abteilung|costcenter|kostenstelle|company|gesellschaft/i, delta: /^Δ|delta|abw/i };
  function modelFields() {
    const out = []; ((S().model || {}).tables || []).forEach(tb => {
      (tb.columns || []).forEach(c => { if (!c.hidden) out.push({ table: tb.name, name: c.name, kind: 'column', type: String(c.type || '') }); });
      (tb.measures || []).forEach(m => { if (!m.hidden) out.push({ table: tb.name, name: m.name, kind: 'measure', type: 'measure' }); });
    }); return out;
  }
  function suggestFor(v, role, all) {
    const used = new Set(Object.keys(v.roles || {}).flatMap(k => (v.roles[k] || []).map(f => f.table + '.' + f.name)));
    const refs = String(v.scenario || '').split(/[\/,\s]+/).filter(x => x && x !== 'AC');
    const isTime = role.labelKey === 'time' || role.labelKey === 'timeSpark' || role.labelKey === 'period';
    const score = f => {
      if (used.has(f.table + '.' + f.name)) return -1;
      if (role.kind !== 'any' && role.kind !== f.kind) return -1;
      const nm = f.name, basis = f.kind === 'measure' && MK.basisOfName ? MK.basisOfName(nm, true) : null;
      if (f.kind === 'measure') {
        if (RX.delta.test(nm) || /%/.test(nm)) return role.key === 'values' ? 0.4 : (role.key === 'x' || role.key === 'y' ? 0.6 : -1);
        if (role.key === 'ref' || role.key === 'goal') { const i = refs.indexOf(basis); return basis && basis !== 'AC' ? (i >= 0 ? 5 - i : (role.key === 'goal' && basis === 'PL' ? 3 : 1)) : -1; }
        if (role.key === 'fc') return basis === 'FC' ? 4 : -1;
        if (role.key === 'ac') return nm === 'AC' || basis === 'AC' ? 5 : (basis ? -1 : 2);
        return basis && basis !== 'AC' ? 0.3 : (basis === 'AC' || nm === 'AC' ? 1 : 2.5);          // indicator, values, x, y, size: fachliche Kennzahlen vor Szenario-Kennzahlen
      }
      const isKey = RX.key.test(nm), isNum = /int|double|decimal|number/i.test(f.type), tim = RX.time.test(nm) || /date/i.test(f.type);
      if (role.key === 'fc') return RX.fc.test(nm) ? 5 : -1;
      if (role.key === 'rowType') return RX.rowtype.test(nm) ? 5 : -1;
      if (role.key === 'start') return /date/i.test(f.type) || RX.start.test(nm) ? (RX.start.test(nm) ? 4 : 2) : -1;
      if (role.key === 'end') return /date/i.test(f.type) || RX.end.test(nm) ? (RX.end.test(nm) ? 4 : 2) : -1;
      if (isTime) return tim && !isKey ? (/^month$|^monat$/i.test(nm) ? 5 : /month|monat/i.test(nm) ? 4 : /quarter|quartal/i.test(nm) ? 3 : /year|jahr/i.test(nm) ? 2.5 : 2) : -1;
      if (role.labelKey === 'geo') return RX.geo.test(nm) ? 4 : -1;
      if (isKey || isNum || RX.rowtype.test(nm) || RX.fc.test(nm)) return -1;
      if (tim) return 0.5;
      return (RX.dim.test(nm) ? 3 : 1.5) + (/^dim/i.test(f.table) ? 0.5 : 0);
    };
    return all.map(f => ({ f, s: score(f) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
  }
  const curLeaf = () => { const id = MK.sel; return id ? MK.leaves(MK.page().layout).find(l => l.id === id) : null; };
  function putField(leaf, roleKey, f) { const v = leaf.visual; v.roles = v.roles || {}; (v.roles[roleKey] = v.roles[roleKey] || []).push({ table: f.table, name: f.name, kind: f.kind, isNew: false }); }
  function decorateRoles() {
    const ins = $('#insEl'), leaf = curLeaf(); if (!ins || !leaf || !leaf.visual) return;
    const v = leaf.visual, def = CAT.byId[v.kind]; if (!def) return; const all = modelFields(); if (!all.length) return;
    const roles = CAT.rolesFor(def, v);
    $$('.role[data-role]', ins).forEach(rEl => {
      if (rEl.querySelector('.sugg')) return;
      const role = roles.find(x => x.key === rEl.dataset.role); if (!role || ((v.roles || {})[role.key] || []).length) return;
      const sg = suggestFor(v, role, all); if (!sg.length) return;
      const box = document.createElement('div'); box.className = 'sugg';
      box.innerHTML = `<small>${esc(t('sg.cap'))}</small>` + sg.map(x => `<button type="button" data-sgrole="${esc(role.key)}" data-sgf="${esc(JSON.stringify(x.f))}" title="${esc(x.f.table + '.' + x.f.name)}">+ ${esc(x.f.name)}</button>`).join('');
      rEl.appendChild(box);
    });
  }
  // Alle leeren Rollen mit dem besten Vorschlag füllen (nur sichere Treffer), ein Rückgängig-Schritt
  function autoFill() {
    const leaf = curLeaf(); if (!leaf || !leaf.visual) return 0; const v = leaf.visual, def = CAT.byId[v.kind]; if (!def) return 0;
    const all = modelFields(); let n = 0;
    CAT.rolesFor(def, v).forEach(role => {
      if (((v.roles || {})[role.key] || []).length) return;
      const sg = suggestFor(v, role, all); if (!sg.length) return;
      if (sg[0].s < (role.req ? 1.5 : 3)) return;                         // freiwillige Rollen nur bei klarem Treffer
      putField(leaf, role.key, sg[0].f); n++;
    });
    if (n) MK.commit({ keep: true });
    MK.toast(n ? t('sg.filled', { n }) : t('sg.none'));
    return n;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest ? e.target.closest('#insEl .sugg [data-sgf]') : null; if (!b) return;
    const leaf = curLeaf(); if (!leaf || !leaf.visual) return;
    let f = null; try { f = JSON.parse(b.dataset.sgf); } catch (err) { f = null; } if (!f) return;
    putField(leaf, b.dataset.sgrole, f); MK.commit({ keep: true });
  });

  // ------------------------------------------------------------------ Visual-Wechsel an einer Kachel
  // Eine Kachel kann mehrere Fassungen haben (z. B. Diagramm und Tabelle). Gezeigt und bearbeitet wird immer eine; die anderen
  // liegen in v.alts, v.altIx ist die Stelle der gezeigten Fassung in der Reihenfolge. Der Schalter sitzt oben rechts in der Kachel.
  const altLabel = a => a.altLabel || ((CAT.byId[a.kind] || {}).label || a.kind).replace(/\s*\(.*\)\s*$/, '');
  function altList(v) { const rest = (v.alts || []).slice(); const ix = Math.max(0, Math.min(v.altIx || 0, rest.length)); const cur = Object.assign({}, v); delete cur.alts; delete cur.altIx; rest.splice(ix, 0, cur); return { list: rest, ix }; }
  function setAlts(leaf, list, ix) { const act = Object.assign({}, list[ix]); const rest = list.filter((x, i) => i !== ix).map(x => { const o = Object.assign({}, x); delete o.alts; delete o.altIx; return o; }); if (rest.length) { act.alts = rest; act.altIx = ix; } else { delete act.alts; delete act.altIx; } leaf.visual = act; }
  function switchAlt(leaf, j) { const a = altList(leaf.visual); if (j === a.ix || !a.list[j]) return false; setAlts(leaf, a.list, j); return true; }
  function addAlt() { const leaf = curLeaf(); if (!leaf || !leaf.visual) return; const a = altList(leaf.visual); const copy = JSON.parse(JSON.stringify(a.list[a.ix])); delete copy.altLabel; a.list.splice(a.ix + 1, 0, copy); setAlts(leaf, a.list, a.ix + 1); MK.commit({ keep: true }); MK.toast(t('alt.added')); MK.openCatalog(); }
  function dropAlt() { const leaf = curLeaf(); if (!leaf || !leaf.visual || !(leaf.visual.alts || []).length) return; const a = altList(leaf.visual); a.list.splice(a.ix, 1); setAlts(leaf, a.list, Math.max(0, a.ix - 1)); MK.commit({ keep: true }); MK.toast(t('alt.dropped')); }
  function decorateAlts() {
    const pageEl = $('#page'); if (!pageEl) return;
    MK.leaves(MK.page().layout).forEach(leaf => {
      const v = leaf.visual; if (!v || !(v.alts || []).length) return;
      const tile = pageEl.querySelector('.tile[data-leaf="' + CSS.escape(leaf.id) + '"]'); if (!tile || tile.querySelector('.t-alts')) return;
      const a = altList(v); const box = document.createElement('div'); box.className = 't-alts'; box.setAttribute('role', 'group');
      box.innerHTML = a.list.map((x, i) => `<span class="${i === a.ix ? 'act' : ''}" data-alt="${i}" data-altleaf="${esc(leaf.id)}" title="${esc(altLabel(x))}">${esc(altLabel(x))}</span>`).join('');
      tile.appendChild(box);
    });
  }
  // Klick auf den Schalter: im Entwurf als Schritt (rückgängig), in der Präsentation ohne Spur im Verlauf
  document.addEventListener('click', e => {
    const s = e.target.closest ? e.target.closest('#page .t-alts [data-alt]') : null; if (!s) return;
    e.stopPropagation(); e.preventDefault();
    const leaf = MK.leaves(MK.page().layout).find(l => l.id === s.dataset.altleaf); if (!leaf) return;
    if (!switchAlt(leaf, +s.dataset.alt)) return;
    if (document.body.classList.contains('present')) MK.render({ inspector: false }); else { MK.selectTile(leaf.id); MK.commit({ keep: true }); }
  }, true);
  ['mousedown', 'pointerdown', 'dblclick'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('#page .t-alts')) e.stopPropagation(); }, true));

  // ------------------------------------------------------------------ Ansichten einer Seite (Reiter Seite)
  const vbox = el(`<details class="sub" id="pgViews" open><summary><span data-i18n="pv.sec"></span><span class="cnt" id="pvCnt" hidden></span></summary>
    <p class="hint" style="margin:0 0 6px" data-i18n="pv.hint"></p>
    <div id="pvList"></div>
    <div class="row" style="margin-top:6px"><button type="button" class="btn sm" id="pvAdd" data-i18n="pv.add"></button><button type="button" class="btn sm" id="pvDrop" data-i18n="pv.drop" hidden></button></div>
    <div id="pvWarn"></div>
  </details>`);
  { const pl = $('#pageList'); const host = pl ? (pl.closest('.section') || pl) : null; if (host && host.parentElement) host.insertAdjacentElement('beforebegin', vbox); else { const ip = $('#insPage'); if (ip) ip.appendChild(vbox); } }
  function renderPageViews() {
    const fam = MK.viewFamily(MK.page()), list = $('#pvList'); if (!list) return; const many = fam.members.length > 1;
    const typing = list.contains(document.activeElement) && $$('[data-pvlabel]', list).length === fam.members.length;
    if (!typing) list.innerHTML = many ? fam.members.map(m => `<div class="vw-row" style="grid-template-columns:1fr auto"><input class="ctl" data-pvlabel="${esc(m.id)}" value="${esc(m.viewLabel || m.name)}" title="${esc(m.name)}"><button type="button" data-pvgo="${esc(m.id)}" title="${esc(t('pv.go'))}" style="font-size:12px">${m.id === S().cur ? '●' : '→'}</button></div>`).join('') : '';
    const cnt = $('#pvCnt'); cnt.hidden = !many; cnt.textContent = fam.members.length;
    $('#pvDrop').hidden = !MK.page().viewOf;
    $('#pvWarn').innerHTML = many ? (S().target === 'pbi' ? `<p class="bm-warn">⚠ ${esc(t('pv.bmWarn'))}</p>` : (S().chrome.header.on ? '' : `<p class="bm-warn info">${esc(t('pv.needHeader'))}</p>`)) : '';
  }
  vbox.addEventListener('click', e => {
    if (e.target.closest('#pvAdd')) { MK.addView(); return; }
    if (e.target.closest('#pvDrop')) { MK.dropView(); return; }
    const g = e.target.closest('[data-pvgo]'); if (g) MK.gotoPage(g.dataset.pvgo);
  });
  vbox.addEventListener('input', e => { const i = e.target.closest('[data-pvlabel]'); if (!i) return; const p = S().pages.find(x => x.id === i.dataset.pvlabel); if (p) { p.viewLabel = i.value; MK.persist(); MK.render({ inspector: false }); } });
  vbox.addEventListener('change', e => { if (e.target.closest('[data-pvlabel]')) MK.commit({ keep: true }); });

  // ------------------------------------------------------------------ Einfach-Modus
  // Rückmeldung der Nutzer: das Tool ist viel geworden. „Einfach" blendet aus, was man für die ersten Entwürfe nicht braucht
  // (Typografie, Pixelraster, Abstände, Barrierefreiheit, Vergleich, Workshop-Angaben, Engine-Wahl). Nichts geht verloren,
  // die Werte bleiben im Projekt; „Alle Optionen" zeigt alles wieder. Gemerkt je Browser.
  const SIMPLE_LS = 'mockupkitchen.simple.v1';
  const ssw = el(`<button type="button" class="simple-sw hide-present" id="btnSimple" role="switch"><i></i><span></span></button>`);
  { const help = $('#btnHelp'); if (help) help.insertAdjacentElement('beforebegin', ssw); else { const tb = $('.topbar'); if (tb) tb.appendChild(ssw); } }
  function setSimple(on, quiet) {
    document.body.classList.toggle('simple', !!on);
    try { localStorage.setItem(SIMPLE_LS, on ? '1' : '0'); } catch (e) { /* privater Modus */ }
    ssw.setAttribute('aria-checked', on ? 'true' : 'false');
    // Stand der Reiter: liegt der aktive Reiter jetzt im Verborgenen, auf „Kachel" wechseln
    const act = $('.tab.active'); if (on && act && getComputedStyle(act).display === 'none') MK.showTab('el');
    if (!quiet) MK.toast(t(on ? 'simple.onToast' : 'simple.offToast'));
  }
  ssw.addEventListener('click', () => setSimple(!document.body.classList.contains('simple')));
  function labelSimple() { ssw.querySelector('span').textContent = t('simple.on'); ssw.title = t('simple.tip'); ssw.setAttribute('aria-label', t('simple.on')); }
  { let st = null; try { st = localStorage.getItem(SIMPLE_LS); } catch (e) { st = null; } labelSimple(); setSimple(st !== '0', true); }

  // ------------------------------------------------------------------ Abgleich nach jedem Zeichnen
  function sync() {
    const s = S(), tg = s.target || 'pbi';
    pill.querySelector('.ic').textContent = TG_LETTER[tg]; pill.querySelector('.nm').textContent = t('target.' + tg);
    const sel = $('#rpTarget'); if (sel && document.activeElement !== sel) sel.value = tg;
    const hint = $('#rpTargetHint'); if (hint) hint.textContent = t('target.' + tg + '.hint');
    renderViews(false); renderScheme(); renderPageViews(); decorateAlts(); placeTileBar(); decorateRoles();
    if (bar && dlgCat && dlgCat.open) buildBar();
  }
  window.addEventListener('mk:rendered', sync);
  I.onChange(() => { I.apply(dlg); I.apply(sec); I.apply(rpField); I.apply(sch); I.apply(vbox); labelSimple(); buildBar(); renderViews(true); sync(); });
  I.apply(dlg); I.apply(sec); I.apply(rpField); I.apply(sch); I.apply(vbox); I.apply(pill.parentElement || document); { const dn = $('#dsNative'); if (dn) I.apply(dn.parentElement); }
  { const np = $('#hdNavPos'); if (np) I.apply(np.parentElement); }
  buildBar();
  sync();

  window.MK_APPMODE = { applyTarget, openTargetDialog, fitsApp, tagsOf, pick, applyScheme, parseColors, setBrand, brandMapping, setSimple, placeTileBar, suggestFor, autoFill, addAlt, dropAlt, switchAlt, altList };
})();
