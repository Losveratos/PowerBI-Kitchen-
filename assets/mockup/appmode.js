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
      <label class="toggle" style="margin-top:12px"><input type="checkbox" id="tgOpt"> <span id="tgOptLbl"></span></label>
      <p class="tg-note" id="tgNote" hidden></p>
    </div>
    <div class="dlg-foot" style="flex-direction:column;align-items:stretch"><button class="btn accent full" id="tgGo"></button></div>
  </dialog>`);
  document.body.appendChild(dlg);
  let dlgMode = 'new', dlgPick = 'pbi';
  function pickCard(k) { dlgPick = k; $$('.tg-card', dlg).forEach(b => { const on = b.dataset.tg === k; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }); $('#tgOpt').closest('label').style.display = (dlgMode === 'new' && k !== 'app') ? 'none' : ''; }
  function openTargetDialog(mode) {
    dlgMode = mode; const s = S();
    $('#dlgTargetH').textContent = t(mode === 'new' ? 'target.dlg.h' : 'target.dlg.switchH');
    $('#dlgTargetP').textContent = t(mode === 'new' ? 'target.dlg.p' : 'target.dlg.switchP');
    $('#tgGo').textContent = t(mode === 'new' ? 'target.dlg.create' : 'target.dlg.switch');
    $('#tgOptLbl').textContent = t(mode === 'new' ? 'target.dlg.demo' : 'target.dlg.defaults'); $('#tgOpt').checked = true;
    const n = s.pages.reduce((a, p) => a + MK.leaves(p.layout).filter(l => l.visual).length, 0);
    const note = $('#tgNote'); note.hidden = !(mode === 'new' && !MK.isUnchanged() && (n || s.pages.length > 1)); note.textContent = t('target.dlg.replace', { n, p: s.pages.length });
    pickCard(s.target || 'pbi'); dlg.showModal(); const cur = $('.tg-card[aria-checked="true"]', dlg); if (cur) cur.focus();
  }
  dlg.addEventListener('click', e => {
    const card = e.target.closest('.tg-card'); if (card) { pickCard(card.dataset.tg); return; }
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
    if (dlgMode === 'new') { MK.reset(); applyTarget(dlgPick, { defaults: true, demo: opt }); MK.fitZoom(); MK.commit({ noUndo: true }); MK.toast(I.t('toast.newProject') + ' · ' + t('target.' + dlgPick)); }
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
    if (!e.target.closest('#page [data-chipzone]')) return;
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

  // ------------------------------------------------------------------ Abgleich nach jedem Zeichnen
  function sync() {
    const s = S(), tg = s.target || 'pbi';
    pill.querySelector('.ic').textContent = TG_LETTER[tg]; pill.querySelector('.nm').textContent = t('target.' + tg);
    const sel = $('#rpTarget'); if (sel && document.activeElement !== sel) sel.value = tg;
    const hint = $('#rpTargetHint'); if (hint) hint.textContent = t('target.' + tg + '.hint');
    renderViews(false);
    if (bar && dlgCat && dlgCat.open) buildBar();
  }
  window.addEventListener('mk:rendered', sync);
  I.onChange(() => { I.apply(dlg); I.apply(sec); I.apply(rpField); buildBar(); renderViews(true); sync(); });
  I.apply(dlg); I.apply(sec); I.apply(rpField); I.apply(pill.parentElement || document);
  { const np = $('#hdNavPos'); if (np) I.apply(np.parentElement); }
  buildBar();
  sync();

  window.MK_APPMODE = { applyTarget, openTargetDialog, fitsApp, tagsOf, pick };
})();
