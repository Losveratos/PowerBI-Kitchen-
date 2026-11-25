/* MockupKitchen · Bühne: interaktive Präsentation (ab 0.7.0)
 *
 * Aus der reinen Ansicht wird eine klickbare Demo, ohne dass echte Daten im Spiel sind:
 *  - Burger-Menü im Kopfband öffnet ein Panel mit Seiten, gespeicherten Filtern und Slicern.
 *  - Gespeicherte Filter stehen als Chips über den Kacheln und lassen sich wegklicken oder wieder einschalten.
 *  - Klick auf eine Kachel filtert die anderen (Querfilter, als Chip sichtbar); Kacheln mit Sprungziel wechseln die Seite.
 *  - Doppelklick vergrößert eine Kachel. Pfeiltasten blättern, M öffnet das Menü, F schaltet Vollbild, Esc beendet.
 * „Filtern" heißt hier: die Skizzen bekommen einen anderen Startwert (MK_STAGE.shift) und zeichnen andere Beispielzahlen.
 * Der Zustand der Bühne ist flüchtig, er wandert weder in den Projektzustand noch in den Export.
 * Muss nach app.js geladen werden; app.js fragt MK_STAGE.on / chips() / hasFilter() / shift() beim Zeichnen ab.
 */
(function () {
  'use strict';
  const MK = window.MK, I = window.MK_I18N, CAT = window.MK_CATALOG;
  const pageEl = document.getElementById('page'), stageEl = document.getElementById('stage');
  if (!MK || !I || !pageEl) return;
  const t = (k, v) => I.t(k, v);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const S = () => MK.state;
  // Nicht requestAnimationFrame: in einem ausgeblendeten Fenster (Hintergrund-Tab, eingebettete Vorschau) feuert es nicht
  const soon = fn => setTimeout(fn, 20);
  const hash = str => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h; };

  // ------------------------------------------------------------------ Zustand der Bühne (flüchtig)
  const ST = { on: false, viewsOff: new Set(), slicer: {}, cross: null, history: [], drawer: false, focus: null, lastPage: null, dir: 1, pulse: false };
  function resetFilters() { ST.viewsOff.clear(); ST.slicer = {}; ST.cross = null; }
  const refOf = f => f.table + '.' + f.name;
  const slicerFields = () => ((S().chrome.filter || {}).fields || []);
  // Beispielwerte je Slicer-Feld: nach dem Feldnamen geraten, sonst neutrale Platzhalter
  function demoValues(f) {
    const n = String(f.name || '').toLowerCase(), en = I.lang === 'en';
    if (/year|jahr/.test(n)) return ['2026', '2025', '2024'];
    if (/quarter|quartal/.test(n)) return ['Q1', 'Q2', 'Q3', 'Q4'];
    if (/month|monat/.test(n)) return en ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] : ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun'];
    if (/region/.test(n)) return en ? ['North', 'South', 'West', 'East'] : ['Nord', 'Süd', 'West', 'Ost'];
    if (/country|land/.test(n)) return en ? ['Germany', 'Austria', 'Switzerland', 'France'] : ['Deutschland', 'Österreich', 'Schweiz', 'Frankreich'];
    if (/segment/.test(n)) return en ? ['Enterprise', 'Mid-market', 'Small business'] : ['Großkunden', 'Mittelstand', 'Kleinkunden'];
    if (/categ|kateg|produktlinie|line/.test(n)) return en ? ['Bikes', 'Accessories', 'Clothing', 'Service'] : ['Räder', 'Zubehör', 'Bekleidung', 'Service'];
    if (/channel|kanal/.test(n)) return en ? ['Online', 'Retail', 'Partner'] : ['Online', 'Handel', 'Partner'];
    if (/company|gesellschaft|firma/.test(n)) return ['AG', 'GmbH Nord', 'GmbH Süd'];
    if (/scenario|szenario/.test(n)) return ['AC', 'PL', 'FC'];
    return [f.name + ' A', f.name + ' B', f.name + ' C'];
  }
  // Chips für die Chip-Zeile: gespeicherte Filter, Slicer-Auswahl, Kachel-Auswahl
  function chips() {
    const out = S().views.map(v => ({ id: 'v:' + v.id, kind: 'view', label: v.name || t('app.viewUnnamed'), tip: v.filters || '', on: !ST.viewsOff.has(v.id) }));
    slicerFields().forEach(f => { const val = ST.slicer[refOf(f)]; if (val) out.push({ id: 's:' + refOf(f), kind: 'slicer', label: f.name + ': ' + val, tip: refOf(f), on: true }); });
    if (ST.cross) out.push({ id: 'x', kind: 'cross', label: t('stage.cross', { t: ST.cross.label }), on: true });
    return out;
  }
  const hasFilter = () => ST.viewsOff.size > 0 || Object.keys(ST.slicer).length > 0 || !!ST.cross;
  // Verschiebung des Skizzen-Startwerts je Kachel: 0 im Ausgangszustand, sonst aus dem Filterzustand abgeleitet
  function shift(v, id) {
    const parts = [];
    if (ST.viewsOff.size) parts.push('v' + Array.from(ST.viewsOff).sort().join(','));
    const sk = Object.keys(ST.slicer).sort(); if (sk.length) parts.push('s' + sk.map(k => k + '=' + ST.slicer[k]).join(';'));
    if (ST.cross && ST.cross.leaf !== id && !(v && v.interaction && v.interaction.crossFilter === false)) parts.push('x' + ST.cross.leaf);
    if (v && (v.kind === 'text' || v.kind === 'image' || v.kind === 'button' || v.kind === 'slicer')) return 0;
    return parts.length ? 1 + (hash(parts.join('|')) % 911) : 0;
  }

  // ------------------------------------------------------------------ Stil
  const css = `
  body.present .topbar{height:0;min-height:0;padding:0;border:0;overflow:hidden}
  body.present .stage{background:radial-gradient(1200px 760px at 50% 22%,#22364D 0%,#111D2C 55%,#0A121C 100%)}
  body.present .stage-bar,body.present .pagebar{display:none}
  body.present .toast{bottom:74px;background:rgba(17,29,44,.86);backdrop-filter:blur(8px)}
  body.present .page{outline:0;border-radius:calc(10px * var(--ui) * var(--zoom));box-shadow:0 30px 90px rgba(0,0,0,.55),0 4px 18px rgba(0,0,0,.35);overflow:hidden}
  body.present .page .tile{cursor:pointer;transition:box-shadow .18s,transform .18s,opacity .25s}
  body.present .page .tile:hover{box-shadow:0 6px 22px rgba(15,30,46,.16);transform:translateY(-1px)}
  body.present .page .tile.sel{box-shadow:none}
  body.present .page .tile.empty{visibility:hidden}
  body.present .page .tile .badges,body.present .page .tile .rchip.ph{display:none}
  body.present .page .tile.st-src{box-shadow:0 0 0 calc(2px * var(--ui)) #1F7A6D,0 8px 26px rgba(31,122,109,.25)}
  body.present .page .tile.st-dim{opacity:.92}
  body.present .page .tile.st-link::after{content:"↗";position:absolute;right:calc(7px * var(--ui));top:calc(5px * var(--ui));font-size:calc(11px * var(--ui));color:var(--accent);opacity:.85}
  body.present .page .zone.header .burger,body.present .page .zone.header .nav span,body.present .page .zone.footer .nav span,body.present .page .zone.nav i{cursor:pointer}
  body.present .page .zone.header .burger:hover{background:rgba(127,127,127,.18)}
  body.present .page .zone.header .nav span:hover,body.present .page .zone.footer .nav span:hover{border-color:var(--accent)}
  body.present .page .zone.filter .sl{cursor:pointer}
  body.present .page .zone.filter .sl.ph,body.present .page .zone.filter .sl .x{display:none}
  body.present .page .zone.filter .sl.st-on{border-color:#1F5FBF;background:#EEF4FD;color:#0F1E2E;font-weight:500}
  body.present .page .zone.chips.float{position:absolute;z-index:8;pointer-events:auto}
  body.present .page .zone.chips.float .chip{background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(15,30,46,.12)}
  /* Menü (Burger) */
  .st-scrim{position:absolute;inset:0;z-index:40;background:rgba(10,18,28,.36);opacity:0;pointer-events:none;transition:opacity .22s}
  .st-scrim.open{opacity:1;pointer-events:auto}
  .st-drawer{position:absolute;left:0;top:0;bottom:0;z-index:41;width:calc(300px * var(--ui));max-width:86%;background:#fff;color:#0F1E2E;box-shadow:0 0 60px rgba(0,0,0,.35);transform:translateX(-104%);transition:transform .26s cubic-bezier(.2,.8,.2,1);display:flex;flex-direction:column;font-size:calc(12px * var(--ui))}
  .st-drawer.open{transform:none}
  .st-drawer header{display:flex;align-items:center;gap:calc(8px * var(--ui));padding:calc(14px * var(--ui)) calc(16px * var(--ui)) calc(10px * var(--ui));border-bottom:1px solid #ECEAE2}
  .st-drawer header b{font-size:calc(15px * var(--ui));flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .st-drawer header button{border:0;background:transparent;font-size:calc(15px * var(--ui));color:#66707F;width:calc(28px * var(--ui));height:calc(28px * var(--ui));border-radius:50%}
  .st-drawer header button:hover{background:#F1F0EA}
  .st-drawer .body{flex:1;overflow:auto;padding:calc(6px * var(--ui)) calc(10px * var(--ui)) calc(12px * var(--ui))}
  .st-drawer h5{margin:calc(14px * var(--ui)) calc(6px * var(--ui)) calc(6px * var(--ui));font-size:calc(9.5px * var(--ui));letter-spacing:.08em;text-transform:uppercase;color:#66707F;font-weight:600}
  .st-drawer .nv{display:flex;align-items:center;gap:calc(8px * var(--ui));width:100%;text-align:left;border:0;background:transparent;border-radius:calc(8px * var(--ui));padding:calc(8px * var(--ui)) calc(10px * var(--ui));font-size:calc(12.5px * var(--ui));color:inherit}
  .st-drawer .nv:hover{background:#F4F3EE}
  .st-drawer .nv.act{background:color-mix(in srgb,var(--accent) 13%,#fff);font-weight:600}
  .st-drawer .nv .n{font-family:var(--ff-mono);font-size:calc(9.5px * var(--ui));color:#8A8F98;width:calc(16px * var(--ui))}
  .st-drawer .nv.sub{padding-left:calc(34px * var(--ui));font-size:calc(11.5px * var(--ui));color:#475569}
  .st-drawer .vw{display:flex;align-items:center;gap:calc(8px * var(--ui));width:100%;border:0;background:transparent;padding:calc(7px * var(--ui)) calc(10px * var(--ui));border-radius:calc(8px * var(--ui));text-align:left;color:inherit;font-size:calc(12px * var(--ui))}
  .st-drawer .vw:hover{background:#F4F3EE}
  .st-drawer .vw .sw{flex:none;width:calc(28px * var(--ui));height:calc(16px * var(--ui));border-radius:999px;background:#D5D2C8;position:relative;transition:background .15s}
  .st-drawer .vw .sw::after{content:"";position:absolute;top:calc(2px * var(--ui));left:calc(2px * var(--ui));width:calc(12px * var(--ui));height:calc(12px * var(--ui));border-radius:50%;background:#fff;transition:transform .15s}
  .st-drawer .vw.on .sw{background:var(--accent)}.st-drawer .vw.on .sw::after{transform:translateX(calc(12px * var(--ui)))}
  .st-drawer .vw small{display:block;color:#8A8F98;font-size:calc(10px * var(--ui))}
  .st-drawer .fl{padding:calc(4px * var(--ui)) calc(10px * var(--ui)) calc(8px * var(--ui))}
  .st-drawer .fl label{display:block;font-size:calc(11px * var(--ui));color:#475569;margin-bottom:calc(4px * var(--ui))}
  .st-drawer .fl .vals{display:flex;flex-wrap:wrap;gap:calc(4px * var(--ui))}
  .st-drawer .fl .vals button{border:1px solid #D9D6CC;background:#fff;border-radius:999px;padding:calc(3px * var(--ui)) calc(9px * var(--ui));font-size:calc(11px * var(--ui));color:inherit}
  .st-drawer .fl .vals button:hover{border-color:#1F5FBF}
  .st-drawer .fl .vals button.on{background:#1F5FBF;border-color:#1F5FBF;color:#fff}
  .st-drawer footer{padding:calc(10px * var(--ui)) calc(14px * var(--ui)) calc(14px * var(--ui));border-top:1px solid #ECEAE2}
  .st-drawer footer button{width:100%;border:0;border-radius:calc(8px * var(--ui));background:var(--accent);color:#fff;font-weight:600;padding:calc(9px * var(--ui));font-size:calc(12px * var(--ui))}
  .st-drawer footer button[disabled]{opacity:.35}
  .st-drawer footer small{display:block;text-align:center;margin-top:calc(6px * var(--ui));color:#8A8F98;font-size:calc(9.5px * var(--ui))}
  /* Vergrößerte Kachel */
  .st-focus{position:absolute;inset:0;z-index:45;background:rgba(10,18,28,.55);display:grid;place-items:center;opacity:0;transition:opacity .2s}
  .st-focus.open{opacity:1}
  .st-focus .card{background:var(--tile-bg,#fff);color:var(--ink-page,#0F1E2E);border-radius:calc(12px * var(--ui));box-shadow:0 30px 80px rgba(0,0,0,.45);padding:calc(16px * var(--ui)) calc(18px * var(--ui));display:flex;flex-direction:column;gap:calc(8px * var(--ui));transform:scale(.965);transition:transform .22s cubic-bezier(.2,.8,.2,1)}
  .st-focus.open .card{transform:none}
  .st-focus .card h4{margin:0;font-size:calc(17px * var(--ui));font-weight:600}
  .st-focus .card p{margin:0;font-size:calc(11.5px * var(--ui));opacity:.7}
  .st-focus .card .x{position:absolute;right:calc(14px * var(--ui));top:calc(12px * var(--ui));border:0;background:transparent;font-size:calc(16px * var(--ui));color:inherit;opacity:.6}
  .st-focus .card .x:hover{opacity:1}
  .st-focus .card svg{display:block}
  /* Steuerleiste */
  .st-hud{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:60;display:none;align-items:center;gap:2px;padding:5px;border-radius:999px;background:rgba(17,29,44,.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 40px rgba(0,0,0,.4);color:#fff;font-family:var(--ff-sans);font-size:12.5px;transition:opacity .35s}
  body.present .st-hud{display:flex}
  .st-hud.idle{opacity:0;pointer-events:none}
  .st-hud button{border:0;background:transparent;color:#fff;min-width:32px;height:32px;border-radius:999px;font-size:14px;display:grid;place-items:center;padding:0 9px}
  .st-hud button:hover{background:rgba(255,255,255,.14)}
  .st-hud button[disabled]{opacity:.3}
  .st-hud .pg{padding:0 10px;white-space:nowrap;max-width:38vw;overflow:hidden;text-overflow:ellipsis}
  .st-hud .pg small{opacity:.6;margin-left:8px;font-family:var(--ff-mono);font-size:11px}
  .st-hud .sep{width:1px;height:18px;background:rgba(255,255,255,.2);margin:0 3px}
  .st-hud .end{background:rgba(255,255,255,.1)}
  /* Hochformat (Handy): die Leiste steht rechts neben der Seite, sonst verdeckte sie die Tab-Leiste */
  .st-hud.side{left:auto;right:18px;bottom:50%;transform:translateY(50%);flex-direction:column;border-radius:22px;padding:6px 5px}
  .st-hud.side .pg{padding:6px 0;max-width:none}.st-hud.side .pg .nm{display:none}.st-hud.side .pg small{margin:0}
  .st-hud.side .sep{width:18px;height:1px;margin:3px 0}
  .st-hud.side button{padding:0}
  @media (prefers-reduced-motion:reduce){.st-drawer,.st-scrim,.st-focus,.st-focus .card,body.present .page .tile{transition:none}}
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ Seiten
  const navPages = () => S().pages.filter(p => MK.roleOf(p) === 'nav');
  const curPage = () => MK.page();
  // Ansichten einer Seite zählen beim Blättern als ihre Hauptseite
  const rootOf = p => (MK.viewFamily ? MK.viewFamily(p).root : p);
  function go(ref, opts) {
    const s = S(); const from = s.cur; const target = s.pages.find(p => p.id === ref) || s.pages.find(p => p.name === ref); if (!target || target.id === from) return false;
    if (opts && opts.push) ST.history.push(from); else if (!(opts && opts.back)) ST.history = [];
    ST.dir = s.pages.indexOf(target) >= s.pages.findIndex(p => p.id === from) ? 1 : -1;
    ST.cross = null; closeFocus(true);
    MK.gotoPage(target.id); return true;
  }
  function step(d) {
    const list = navPages(); if (!list.length) return; const i = list.findIndex(p => p.id === rootOf(curPage()).id);
    if (i < 0) { if (ST.history.length) back(); else go(list[0].id); return; }
    const n = i + d; if (n < 0 || n >= list.length) return; go(list[n].id);
  }
  function back() { const id = ST.history.pop(); if (id) go(id, { back: true }); }

  // ------------------------------------------------------------------ Neu zeichnen
  function redraw(pulse) { ST.pulse = !!pulse; MK.render({ inspector: false }); }

  // Menü
  let drawer = null, scrim = null, hud = null, focusEl = null;
  function drawerHtml() {
    const s = S(), c = s.chrome; const nav = navPages(); const det = s.pages.filter(p => MK.roleOf(p) !== 'nav');
    const item = (p, i, sub) => `<button type="button" class="nv${sub ? ' sub' : ''}${p.id === s.cur ? ' act' : ''}" data-stgo="${esc(p.id)}">${sub ? '' : `<span class="n">${i + 1}</span>`}<span>${esc(p.name)}</span></button>`;
    const views = s.views.map(v => `<button type="button" class="vw${ST.viewsOff.has(v.id) ? '' : ' on'}" data-stview="${esc(v.id)}" role="switch" aria-checked="${ST.viewsOff.has(v.id) ? 'false' : 'true'}"><span class="sw"></span><span><span>${esc(v.name || t('app.viewUnnamed'))}</span>${v.filters ? `<small>${esc(v.filters)}</small>` : ''}</span></button>`).join('');
    const fl = slicerFields().map(f => { const r = refOf(f), cur = ST.slicer[r] || ''; return `<div class="fl"><label>${esc(f.name)}</label><div class="vals"><button type="button" class="${cur ? '' : 'on'}" data-stsl="${esc(r)}" data-val="">${esc(t('stage.all'))}</button>${demoValues(f).map(v => `<button type="button" class="${cur === v ? 'on' : ''}" data-stsl="${esc(r)}" data-val="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`; }).join('');
    return `<header><b>${esc(c.header.title || s.name || 'App')}</b><button type="button" data-stclose title="${esc(t('stage.close'))}" aria-label="${esc(t('stage.close'))}">✕</button></header>
      <div class="body">
        <h5>${esc(t('stage.nav'))}</h5>${nav.map((p, i) => item(p, i, false)).join('')}
        ${det.length ? `<h5>${esc(t('stage.navDetail'))}</h5>${det.map((p, i) => item(p, i, true)).join('')}` : ''}
        ${views ? `<h5>${esc(t('stage.views'))}</h5>${views}` : ''}
        ${fl ? `<h5>${esc(t('stage.filters'))}</h5>${fl}` : ''}
      </div>
      <footer><button type="button" data-streset ${hasFilter() ? '' : 'disabled'}>${esc(t('stage.reset'))}</button><small>${esc(t('stage.demo'))}</small></footer>`;
  }
  function ensureDrawer() {
    if (!drawer) {
      scrim = document.createElement('div'); scrim.className = 'st-scrim';
      drawer = document.createElement('aside'); drawer.className = 'st-drawer'; drawer.setAttribute('aria-label', t('stage.menu'));
      scrim.addEventListener('click', () => setDrawer(false));
      drawer.addEventListener('click', onDrawerClick);
    }
    drawer.innerHTML = drawerHtml();
  }
  function setDrawer(open) {
    ST.drawer = !!open; ensureDrawer(); attach();
    // erst anhängen, dann öffnen: sonst greift die Übergangsanimation nicht
    soon(() => { drawer.classList.toggle('open', ST.drawer); scrim.classList.toggle('open', ST.drawer); });
  }
  function onDrawerClick(e) {
    e.stopPropagation();
    if (e.target.closest('[data-stclose]')) return setDrawer(false);
    const g = e.target.closest('[data-stgo]'); if (g) { setDrawer(false); go(g.dataset.stgo); return; }
    const v = e.target.closest('[data-stview]'); if (v) { const id = v.dataset.stview; if (ST.viewsOff.has(id)) ST.viewsOff.delete(id); else ST.viewsOff.add(id); redraw(true); return; }
    const sl = e.target.closest('[data-stsl]'); if (sl) { if (sl.dataset.val) ST.slicer[sl.dataset.stsl] = sl.dataset.val; else delete ST.slicer[sl.dataset.stsl]; redraw(true); return; }
    if (e.target.closest('[data-streset]')) { resetFilters(); redraw(true); }
  }
  // Menü, Vergrößerung und schwebende Chips hängen in der Seite (skalieren mit); render() ersetzt deren innerHTML, daher nach jedem Zeichnen neu anhängen
  function attach() {
    if (!ST.on) return;
    if (drawer && (ST.drawer || drawer.classList.contains('open'))) { if (scrim.parentNode !== pageEl) pageEl.appendChild(scrim); if (drawer.parentNode !== pageEl) pageEl.appendChild(drawer); }
    if (focusEl && focusEl.parentNode !== pageEl) pageEl.appendChild(focusEl);
  }

  // Vergrößerte Kachel
  function openFocus(leafId) {
    const leaf = MK.leaves(curPage().layout).find(l => l.id === leafId); const v = leaf && leaf.visual; if (!v || !window.MK_SKETCH) return;
    const def = CAT.byId[v.kind] || {}; const z = MK.zones().content; const k = MK.ui();
    const w = Math.round(z.w * 0.86), h = Math.round(z.h * 0.82), pad = Math.round(18 * k), head = Math.round((v.sub ? 58 : 40) * k);
    const opts = MK.sketchOpts(v, leafId); let svg = '';
    try { svg = window.MK_SKETCH(def.sketch || v.kind, w - 2 * pad, h - head - pad, opts) || ''; } catch (e) { svg = ''; }
    closeFocus(true);
    focusEl = document.createElement('div'); focusEl.className = 'st-focus';
    focusEl.innerHTML = `<div class="card" style="position:relative;width:${w}px;height:${h}px"><button type="button" class="x" data-stfx title="${esc(t('stage.focusClose'))}" aria-label="${esc(t('stage.focusClose'))}">✕</button><h4>${esc(v.title || def.label || '')}</h4>${v.sub ? `<p>${esc(v.sub)}</p>` : ''}<div style="flex:1;min-height:0">${svg}</div></div>`;
    focusEl.addEventListener('click', e => { e.stopPropagation(); if (!e.target.closest('.card') || e.target.closest('[data-stfx]')) closeFocus(); });
    ST.focus = leafId; pageEl.appendChild(focusEl); soon(() => focusEl && focusEl.classList.add('open'));
  }
  function closeFocus(now) {
    if (!focusEl) return; const elx = focusEl; focusEl = null; ST.focus = null;
    if (now || reduced()) { elx.remove(); return; }
    elx.classList.remove('open'); setTimeout(() => elx.remove(), 220);
  }

  // Steuerleiste (außerhalb der Seite, nicht skaliert)
  let idleT = null;
  function buildHud() {
    if (hud) return;
    hud = document.createElement('div'); hud.className = 'st-hud'; hud.setAttribute('role', 'toolbar');
    hud.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const a = b.dataset.a;
      if (a === 'prev') step(-1); else if (a === 'next') step(1); else if (a === 'menu') setDrawer(!ST.drawer); else if (a === 'full') toggleFull(); else if (a === 'back') back(); else if (a === 'end') MK.togglePresent(false);
    });
    document.body.appendChild(hud);
    const wake = () => { hud.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(() => { if (ST.on && !hud.matches(':hover')) hud.classList.add('idle'); }, 2600); };
    window.addEventListener('mousemove', wake, { passive: true }); window.addEventListener('keydown', wake, true); wake();
  }
  function syncHud() {
    if (!hud) return; const list = navPages(); const p = curPage(); const i = list.findIndex(x => x.id === rootOf(p).id);
    hud.classList.toggle('side', S().canvas.h > S().canvas.w);
    hud.innerHTML = `${ST.history.length ? `<button type="button" data-a="back" title="${esc(t('stage.back'))}">↩</button><span class="sep"></span>` : ''}
      <button type="button" data-a="prev" title="${esc(t('stage.prev'))}" aria-label="${esc(t('stage.prev'))}" ${i <= 0 ? 'disabled' : ''}>‹</button>
      <span class="pg"><span class="nm">${esc(p.name)}</span><small>${i >= 0 ? esc(t('stage.pageOf', { i: i + 1, n: list.length })) : '↗'}</small></span>
      <button type="button" data-a="next" title="${esc(t('stage.next'))}" aria-label="${esc(t('stage.next'))}" ${i < 0 || i >= list.length - 1 ? 'disabled' : ''}>›</button>
      <span class="sep"></span>
      <button type="button" data-a="menu" title="${esc(t('stage.menu'))} (M)" aria-label="${esc(t('stage.menu'))}">☰</button>
      <button type="button" data-a="full" title="${esc(t('stage.full'))}" aria-label="${esc(t('stage.full'))}">⛶</button>
      <button type="button" class="end" data-a="end" title="${esc(t('stage.end'))}" aria-label="${esc(t('stage.end'))}">✕</button>`;
  }
  function toggleFull() {
    try { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) { /* Vollbild nicht erlaubt (eingebettete Ansicht) */ }
  }
  document.addEventListener('fullscreenchange', () => { if (ST.on) setTimeout(() => { MK.fitZoom(); MK.render({ inspector: false }); }, 60); });

  // ------------------------------------------------------------------ Nach jedem Zeichnen
  function decorate() {
    if (!ST.on) return;
    const p = curPage(); const leaves = MK.leaves(p.layout);
    // schwebende Chip-Zeile, wenn das Projekt keine eigene hat, aber auf der Bühne gefiltert wurde
    if (!pageEl.querySelector('.zone.chips') && hasFilter()) {
      const z = MK.zones().content, k = MK.ui(), h = Math.round(24 * k);
      const list = chips();
      const d = document.createElement('div'); d.className = 'zone chips float'; d.dataset.chipzone = '1';
      d.style.cssText = `left:${z.x}px;top:${Math.max(0, z.y - Math.round(h * 0.6))}px;height:${h}px;padding:0`;
      d.innerHTML = list.map(ch => `<span class="chip ${ch.kind} on" data-chip="${esc(ch.id)}" data-chipkind="${ch.kind}"><i class="dot"></i><span class="tx">${esc(ch.label)}</span><b class="x" data-chipx="${esc(ch.id)}" aria-hidden="true">✕</b></span>`).join('') + `<span class="chip reset" data-chipreset="1">${esc(t('app.chipReset'))}</span>`;
      pageEl.appendChild(d);
    }
    pageEl.querySelectorAll('.tile[data-leaf]').forEach(el => {
      el.removeAttribute('title'); el.setAttribute('draggable', 'false');
      const leaf = leaves.find(l => l.id === el.dataset.leaf); const v = leaf && leaf.visual; if (!v) return;
      if (v.link) el.classList.add('st-link');
      if (ST.cross) el.classList.add(ST.cross.leaf === el.dataset.leaf ? 'st-src' : 'st-dim');
    });
    // Slicer im Filterbereich zeigen die Auswahl
    const fields = slicerFields();
    pageEl.querySelectorAll('.zone.filter .sl:not(.ph)').forEach((el, i) => { const f = fields[i]; if (!f) return; const val = ST.slicer[refOf(f)]; el.dataset.stslrow = String(i); el.classList.toggle('st-on', !!val); const nm = el.querySelector('.nm'); if (nm) nm.textContent = val ? f.name + ': ' + val : f.name; });
    if (drawer && ST.drawer) drawer.innerHTML = drawerHtml();
    attach(); syncHud();
    // Bewegung: Seitenwechsel blendet ein, Filterwechsel lässt die Kacheln kurz aufatmen
    if (!reduced() && pageEl.animate) {
      const tiles = Array.from(pageEl.querySelectorAll('.tile[data-leaf]:not(.empty)'));
      if (ST.lastPage !== p.id) {
        tiles.forEach((el, i) => el.animate([{ opacity: 0, transform: `translate(${ST.dir * 14}px,6px)` }, { opacity: 1, transform: 'none' }], { duration: 300, delay: Math.min(i, 10) * 28, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }));
      } else if (ST.pulse) {
        tiles.forEach((el, i) => { if (ST.cross && ST.cross.leaf === el.dataset.leaf) return; el.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 320, delay: Math.min(i, 10) * 18, easing: 'ease-out', fill: 'backwards' }); });
      }
    }
    ST.lastPage = p.id; ST.pulse = false;
  }
  window.addEventListener('mk:rendered', decorate);

  // ------------------------------------------------------------------ Klicks auf der Seite (nur auf der Bühne; fängt die Bearbeitung ab)
  function onPageClick(e) {
    if (!ST.on) return;
    if (e.target.closest('.st-drawer,.st-scrim,.st-focus')) return;          // eigene Elemente behandeln sich selbst
    e.stopImmediatePropagation(); e.preventDefault();
    const x = e.target.closest('[data-chipx]');
    if (x) { const id = x.dataset.chipx; if (id === 'x') ST.cross = null; else if (id.indexOf('s:') === 0) delete ST.slicer[id.slice(2)]; else if (id.indexOf('v:') === 0) ST.viewsOff.add(id.slice(2)); return redraw(true); }
    if (e.target.closest('[data-chipreset]')) { resetFilters(); return redraw(true); }
    const ch = e.target.closest('[data-chip]');
    if (ch) { const id = ch.dataset.chip; if (id.indexOf('v:') === 0) { const vid = id.slice(2); if (ST.viewsOff.has(vid)) ST.viewsOff.delete(vid); else ST.viewsOff.add(vid); return redraw(true); } return; }
    if (e.target.closest('[data-burger]')) return setDrawer(!ST.drawer);
    const g = e.target.closest('[data-goto]'); if (g) return void go(g.dataset.goto);
    const ni = e.target.closest('.zone.nav i[title]'); if (ni) return void go(ni.getAttribute('title'));
    const sl = e.target.closest('.zone.filter [data-stslrow]');
    if (sl) { const f = slicerFields()[+sl.dataset.stslrow]; if (!f) return; const vals = [''].concat(demoValues(f)); const r = refOf(f); const next = vals[(vals.indexOf(ST.slicer[r] || '') + 1) % vals.length]; if (next) ST.slicer[r] = next; else delete ST.slicer[r]; return redraw(true); }
    const tile = e.target.closest('.tile[data-leaf]'); if (!tile) return;
    const leaf = MK.leaves(curPage().layout).find(l => l.id === tile.dataset.leaf); const v = leaf && leaf.visual; if (!v) return;
    if (v.link) return void go(v.link, { push: true });
    if (v.kind === 'text' || v.kind === 'image' || v.kind === 'button' || v.kind === 'slicer') return;
    if (e.detail > 1) return;                                              // zweiter Klick eines Doppelklicks: dblclick vergrößert
    if (v.interaction && v.interaction.crossFilter === false) return;
    const def = CAT.byId[v.kind] || {};
    ST.cross = ST.cross && ST.cross.leaf === leaf.id ? null : { leaf: leaf.id, label: v.title || def.label || '' };
    redraw(true);
  }
  function onPageDbl(e) {
    if (!ST.on) return; if (e.target.closest('.st-drawer,.st-scrim,.st-focus')) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const tile = e.target.closest('.tile[data-leaf]'); if (tile) { if (ST.cross && ST.cross.leaf === tile.dataset.leaf) { ST.cross = null; redraw(false); } openFocus(tile.dataset.leaf); }
  }
  const swallow = e => { if (!ST.on) return; if (e.target.closest('.st-drawer,.st-scrim,.st-focus')) return; e.stopImmediatePropagation(); if (e.type !== 'mousedown' && e.type !== 'pointerdown') e.preventDefault(); };
  pageEl.addEventListener('click', onPageClick, true);
  pageEl.addEventListener('dblclick', onPageDbl, true);
  ['mousedown', 'pointerdown', 'dragstart', 'contextmenu', 'drop', 'dragover'].forEach(ev => pageEl.addEventListener(ev, swallow, true));

  // ------------------------------------------------------------------ Tastatur (vor den Kürzeln des Editors)
  window.addEventListener('keydown', e => {
    if (!ST.on) return;
    if (document.querySelector('dialog[open]')) return;
    const k = e.key;
    if (k === 'Escape') { if (ST.focus) { e.stopImmediatePropagation(); e.preventDefault(); closeFocus(); } else if (ST.drawer) { e.stopImmediatePropagation(); e.preventDefault(); setDrawer(false); } return; }   // sonst beendet app.js die Präsentation
    if ((k === 'p' || k === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) return;                                    // P schaltet die Präsentation (app.js)
    if (e.ctrlKey || e.metaKey || e.altKey) { if (/^[a-z]$/i.test(k)) e.stopImmediatePropagation(); return; }           // Editor-Kürzel (Strg+Z …) wirken hier nicht
    e.stopImmediatePropagation();
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); step(1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); step(-1); }
    else if (k === 'Home') { const l = navPages(); if (l[0]) go(l[0].id); }
    else if (k === 'End') { const l = navPages(); if (l.length) go(l[l.length - 1].id); }
    else if (k === 'm' || k === 'M' || k === 'b' || k === 'B') setDrawer(!ST.drawer);
    else if (k === 'f' || k === 'F') toggleFull();
    else if (k === 'Backspace' && ST.history.length) back();
    else if (k === '0' || k === 'r' || k === 'R') { if (hasFilter()) { resetFilters(); redraw(true); } }
  }, true);

  // ------------------------------------------------------------------ Ein und aus (folgt body.present)
  function enter() {
    ST.on = true; resetFilters(); ST.history = []; ST.drawer = false; ST.lastPage = null; ST.dir = 1;
    buildHud(); syncHud(); hud.classList.remove('idle');
    try { MK.toast(t('stage.hintKeys')); } catch (e) { /* ohne Hinweis */ }
  }
  function leave() {
    ST.on = false; resetFilters(); ST.history = []; ST.drawer = false; closeFocus(true);
    if (drawer) { drawer.remove(); scrim.remove(); drawer.classList.remove('open'); scrim.classList.remove('open'); }
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* egal */ }
  }
  new MutationObserver(() => { const on = document.body.classList.contains('present'); if (on !== ST.on) { if (on) enter(); else leave(); } }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  window.MK_STAGE = { get on() { return ST.on; }, chips, hasFilter, shift, go, step, setDrawer, openFocus, closeFocus, reset() { resetFilters(); redraw(true); }, state: ST, demoValues };
})();
