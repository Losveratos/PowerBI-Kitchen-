/* MockupKitchen · Essentials-Tour
 * Geführte Tour mit Spotlight und kleiner Karte. Lädt nach app.js, appmode.js und stage.js.
 * Globale API: window.MK_TOUR = { start(id), stop(), tours }
 * Ändert nichts am Projekt: keine Kachel löschen, keine Vorlage anwenden, kein Reset.
 */
(function () {
  'use strict';
  if (window.MK_TOUR) return;

  // ------------------------------------------------------------------ Texte
  const I = window.MK_I18N;
  if (I && I.dict) {
    Object.assign(I.dict.de, {
      'tour.btn': 'Tour',
      'tour.btnTip': 'Essentials-Tour: das Wichtigste in zwei Minuten',
      'tour.dialog': 'Geführte Tour',
      'tour.next': 'Weiter',
      'tour.back': 'Zurück',
      'tour.skip': 'Überspringen',
      'tour.done': 'Fertig',
      'tour.toApp': 'Weiter mit der App-Tour',
      'tour.progress': '{i} von {n}',
      'tour.offer.text': 'Neu hier? Die Essentials-Tour zeigt das Wichtigste in zwei Minuten.',
      'tour.offer.start': 'Tour starten',
      'tour.offer.later': 'Später',

      'tour.ess.welcome.h': 'Willkommen in der MockupKitchen',
      'tour.ess.welcome.b': 'Hier skizzierst du Berichtsseiten für Power BI und Fabric Apps, bevor gebaut wird. Die Tour dauert zwei Minuten.',
      'tour.ess.target.h': 'Ziel wählen',
      'tour.ess.target.b': 'Hier legst du fest, wofür du skizzierst: Power BI, Fabric App oder Wireframe. Das Ziel bestimmt den Rahmen der Seite und was der Export enthält.',
      'tour.ess.templates.h': 'Mit einer Vorlage starten',
      'tour.ess.templates.b': 'Vorlagen sind fertige Seiten mit Beispielbindungen. Sie sind ein guter Startpunkt, auch für das Handy-Format.',
      'tour.ess.page.h': 'Seite und Kacheln',
      'tour.ess.page.b': 'Jede Kachel ist ein Visual. Zieh an den Trennlinien, um Größen zu ändern. Mit „+“ teilst du eine Kachel oder verbindest zwei.',
      'tour.ess.tile.h': 'Kachel einrichten',
      'tour.ess.tile.b': 'Wähle eine Kachel aus. Mit „Visual wählen“ legst du fest, was sie zeigt, danach ordnest du die Felder den Rollen zu.',
      'tour.ess.fields.h': 'Felder aus dem Datenmodell',
      'tour.ess.fields.b': 'Zieh ein Feld auf eine Kachel oder in eine Rolle im Reiter Kachel. Dein eigenes Modell holst du über „TMDL laden“.',
      'tour.ess.design.h': 'Rahmen und Gestaltung',
      'tour.ess.design.b': 'Im Reiter Zonen stellst du Kopfband, Filter, gespeicherte Filter und Fußleiste ein. Im Reiter Design wählst du das Farbschema: Kitchen Basis oder deine Firmenfarben.',
      'tour.ess.present.h': 'Präsentieren',
      'tour.ess.present.b': 'Zeigt die Seiten als klickbare Demo mit Menü und Filtern. So stimmst du den Entwurf ab, bevor jemand baut.',
      'tour.ess.export.h': 'Export für den Bau',
      'tour.ess.export.b': 'Der Export liefert eine Spec, mit der Claude Code den Bericht oder die App baut.',
      'tour.ess.done.h': 'Das war das Wichtigste',
      'tour.ess.done.b': 'Die Tour startest du jederzeit wieder über den Knopf „Tour“ oben. Für das Ziel Fabric App gibt es eine kurze Zusatztour.',

      'tour.app.intro.h': 'Fabric App: was anders ist',
      'tour.app.intro.b': 'Diese kurze Tour zeigt die Teile, die im Ziel Fabric App dazukommen.',
      'tour.app.intro.switch': 'Dein Projekt hat gerade ein anderes Ziel. Über die Pille oben stellst du auf Fabric App um.',
      'tour.app.burger.h': 'Burger-Menü',
      'tour.app.burger.b': 'In der App liegen Seitennavigation und Filter im Burger-Menü im Kopfband. Wo die Navigation sitzt, stellst du im Reiter Zonen ein.',
      'tour.app.views.h': 'Gespeicherte Filter',
      'tour.app.views.b': 'Gespeicherte Filter erscheinen in der App als Chips über der Seite. Ein Klick setzt mehrere Filter auf einmal.',
      'tour.app.phone.h': 'Handy-Vorlage',
      'tour.app.phone.b': 'Unter den Vorlagen findest du Seiten im Handy-Format. Sie zeigen, wie die App auf dem Telefon aussieht.',
      'tour.app.present.h': 'Interaktiv präsentieren',
      'tour.app.present.b': 'Im Präsentieren bedienst du die App wie später in Fabric: Menü öffnen, Seiten wechseln, Filter und Chips ausprobieren.',
      'tour.app.done.h': 'Fertig',
      'tour.app.done.b': 'Die Essentials-Tour startest du jederzeit über den Knopf „Tour“ oben.',
    });
    Object.assign(I.dict.en, {
      'tour.btn': 'Tour',
      'tour.btnTip': 'Essentials tour: the key parts in two minutes',
      'tour.dialog': 'Guided tour',
      'tour.next': 'Next',
      'tour.back': 'Back',
      'tour.skip': 'Skip',
      'tour.done': 'Done',
      'tour.toApp': 'Continue with the app tour',
      'tour.progress': '{i} of {n}',
      'tour.offer.text': 'New here? The essentials tour shows the key parts in two minutes.',
      'tour.offer.start': 'Start tour',
      'tour.offer.later': 'Later',

      'tour.ess.welcome.h': 'Welcome to MockupKitchen',
      'tour.ess.welcome.b': 'Here you sketch report pages for Power BI and Fabric apps before anyone builds them. The tour takes two minutes.',
      'tour.ess.target.h': 'Choose a target',
      'tour.ess.target.b': 'Set what you are sketching for: Power BI, Fabric app or wireframe. The target defines the page frame and what the export contains.',
      'tour.ess.templates.h': 'Start from a template',
      'tour.ess.templates.b': 'Templates are ready pages with sample bindings. They are a good starting point, also for the phone format.',
      'tour.ess.page.h': 'Page and tiles',
      'tour.ess.page.b': 'Each tile is a visual. Drag the dividers to resize. Use “+” to split a tile or merge two.',
      'tour.ess.tile.h': 'Set up a tile',
      'tour.ess.tile.b': 'Select a tile. “Choose a visual” sets what it shows, then you assign fields to its roles.',
      'tour.ess.fields.h': 'Fields from the data model',
      'tour.ess.fields.b': 'Drag a field onto a tile or into a role on the Tile tab. Load your own model with “Load TMDL”.',
      'tour.ess.design.h': 'Frame and design',
      'tour.ess.design.b': 'The Zones tab sets header, filters, saved filters and footer. The Design tab sets the color scheme: Kitchen base or your company colors.',
      'tour.ess.present.h': 'Present',
      'tour.ess.present.b': 'Shows the pages as a clickable demo with menu and filters. Use it to agree on the draft before anyone builds.',
      'tour.ess.export.h': 'Export for the build',
      'tour.ess.export.b': 'The export creates a spec that Claude Code uses to build the report or the app.',
      'tour.ess.done.h': 'That covers the essentials',
      'tour.ess.done.b': 'You can restart the tour any time with the “Tour” button at the top. There is a short extra tour for the Fabric app target.',

      'tour.app.intro.h': 'Fabric app: what is different',
      'tour.app.intro.b': 'This short tour shows the parts that come with the Fabric app target.',
      'tour.app.intro.switch': 'Your project currently has a different target. Use the pill at the top to switch to Fabric app.',
      'tour.app.burger.h': 'Burger menu',
      'tour.app.burger.b': 'In the app, page navigation and filters sit in the burger menu in the header. Set where navigation goes on the Zones tab.',
      'tour.app.views.h': 'Saved filters',
      'tour.app.views.b': 'Saved filters appear in the app as chips above the page. One click sets several filters at once.',
      'tour.app.phone.h': 'Phone template',
      'tour.app.phone.b': 'The templates include pages in phone format. They show how the app looks on a phone.',
      'tour.app.present.h': 'Present interactively',
      'tour.app.present.b': 'In present mode you use the app as later in Fabric: open the menu, switch pages, try filters and chips.',
      'tour.app.done.h': 'Done',
      'tour.app.done.b': 'You can start the essentials tour any time with the “Tour” button at the top.',
    });
  }
  function t(key, vars) {
    try { return (window.MK_I18N && window.MK_I18N.t) ? window.MK_I18N.t(key, vars) : key; } catch (e) { return key; }
  }

  const LS_KEY = 'mockupkitchen.tour.v1';
  function lsGet() { try { return localStorage.getItem(LS_KEY); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LS_KEY, v); } catch (e) { /* privater Modus */ } }

  // ------------------------------------------------------------------ Stil
  const css = `
.mkt-block{position:fixed;inset:0;z-index:2147482990;background:transparent}
.mkt-spot{position:fixed;z-index:2147482995;pointer-events:none;border-radius:10px;
  box-shadow:0 0 0 2px rgba(255,255,255,.85),0 0 0 9999px rgba(15,30,46,.55);
  transition:left .28s ease,top .28s ease,width .28s ease,height .28s ease,border-radius .28s ease}
.mkt-spot.center{box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 0 9999px rgba(15,30,46,.55);border-radius:0}
.mkt-card{position:fixed;z-index:2147483000;width:340px;max-width:calc(100vw - 24px);box-sizing:border-box;
  background:var(--bg-card,#fff);color:var(--ink,#0F1E2E);border:1px solid var(--line,#E4E2DA);border-radius:10px;
  box-shadow:0 10px 32px rgba(15,30,46,.28);padding:14px 16px 12px;font-family:var(--ff-sans,system-ui,sans-serif);
  font-size:13px;line-height:1.5;transition:left .28s ease,top .28s ease,opacity .2s ease}
.mkt-card.hidden{opacity:0}
.mkt-card h3{margin:0 0 6px;font-family:var(--ff-sans,system-ui,sans-serif);font-size:15px;font-weight:600;line-height:1.3}
.mkt-card p{margin:0;color:var(--ink-soft,#475569)}
.mkt-card .mkt-foot{display:flex;align-items:center;gap:6px;margin-top:12px;flex-wrap:wrap}
.mkt-card .mkt-prog{font-size:11.5px;color:var(--ink-mute,#66707F);margin-right:auto;white-space:nowrap}
.mkt-btn{font:inherit;font-size:12.5px;border:1px solid var(--line,#E4E2DA);background:transparent;color:var(--ink,#0F1E2E);
  border-radius:6px;padding:5px 11px;cursor:pointer;white-space:nowrap}
.mkt-btn:hover{border-color:var(--ink-soft,#475569)}
.mkt-btn.ghost{border-color:transparent;color:var(--ink-soft,#475569)}
.mkt-btn.ghost:hover{color:var(--ink,#0F1E2E)}
.mkt-btn.primary{background:var(--accent-strong,#BD572B);border-color:var(--accent-strong,#BD572B);color:#fff;font-weight:500}
.mkt-btn.primary:hover{background:var(--accent-strong-hover,#A94C25);border-color:var(--accent-strong-hover,#A94C25)}
.mkt-btn:focus-visible{outline:2px solid var(--sel,#1F5FBF);outline-offset:2px}
.mkt-card .mkt-full{flex-basis:100%;display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.mkt-offer{position:fixed;right:16px;bottom:16px;z-index:2147482900;width:300px;max-width:calc(100vw - 32px);box-sizing:border-box;
  background:var(--bg-card,#fff);color:var(--ink,#0F1E2E);border:1px solid var(--line,#E4E2DA);border-radius:10px;
  box-shadow:0 8px 24px rgba(15,30,46,.18);padding:12px 14px;font-family:var(--ff-sans,system-ui,sans-serif);font-size:13px;line-height:1.5;
  transition:opacity .2s ease,transform .2s ease}
.mkt-offer.hidden{opacity:0;transform:translateY(8px)}
.mkt-offer p{margin:0 0 10px;color:var(--ink,#0F1E2E)}
.mkt-offer .mkt-row{display:flex;gap:6px;justify-content:flex-end}
body.present .mkt-offer{display:none}
#btnTour .mkt-ic{display:inline-block;margin-right:4px}
@media (prefers-reduced-motion: reduce){
  .mkt-spot,.mkt-card,.mkt-offer{transition:none}
}`;
  function injectStyle() {
    if (document.getElementById('mktStyle')) return;
    const st = document.createElement('style'); st.id = 'mktStyle'; st.textContent = css;
    document.head.appendChild(st);
  }

  // ------------------------------------------------------------------ Hilfen
  const $ = s => { try { return document.querySelector(s); } catch (e) { return null; } };
  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    try {
      const r = el.getBoundingClientRect();
      if (!r || r.width <= 0 || r.height <= 0) return false;
      if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
      return true;
    } catch (e) { return false; }
  }
  const MKx = () => window.MK || null;
  function showTab(key) { try { const M = MKx(); if (M && M.showTab) M.showTab(key); } catch (e) { /* robust */ } }
  function closeDialogs() { try { document.querySelectorAll('dialog[open]').forEach(d => { try { d.close(); } catch (e) { /* robust */ } }); } catch (e) { /* robust */ } }
  function isPresent() { return document.body.classList.contains('present'); }

  // Erste Kachel wählen, bevorzugt eine mit Visual; eine schon gewählte bleibt.
  function selectFirstTile() {
    if ($('#page .tile.sel[data-leaf]')) return;
    let el = null;
    try {
      const M = MKx();
      if (M && M.leaves && M.page) {
        const lv = (M.leaves(M.page().layout) || []).find(l => l && l.visual);
        if (lv) el = $('#page .tile[data-leaf="' + String(lv.id).replace(/"/g, '') + '"]');
      }
    } catch (e) { el = null; }
    if (!el) el = $('#page .tile[data-leaf]');
    if (el) el.click();
  }

  // ------------------------------------------------------------------ Touren
  // Schritt: { k: Textschlüssel, target: () => Element|null (fehlt = zentriert), before: () => void, final: true }
  const tours = {
    essentials: {
      prefix: 'tour.ess.',
      steps: [
        { k: 'welcome' },
        { k: 'target', target: () => $('#btnTarget') },
        { k: 'templates', target: () => $('#btnTemplates') },
        { k: 'page', target: () => $('#page') },
        {
          k: 'tile',
          before: () => { selectFirstTile(); showTab('el'); },
          target: () => { const tb = $('#tileBar'); if (isVisible(tb)) return tb; return $('#page .tile.sel[data-leaf]') || $('#page .tile[data-leaf]'); },
        },
        {
          k: 'fields',
          target: () => { const l = $('#modelList'); if (isVisible(l) && l.getBoundingClientRect().height > 40) return l; return $('.panel.left'); },
        },
        {
          k: 'design',
          before: () => { showTab('design'); const s = $('#dsScheme'); if (s && 'open' in s) s.open = true; },
          target: () => $('#dsScheme') || $('.tab[data-tab="design"]'),
        },
        { k: 'present', target: () => $('#btnPresent') },
        { k: 'export', target: () => $('#btnExport') },
        { k: 'done', final: true, next: 'app' },
      ],
    },
    app: {
      prefix: 'tour.app.',
      steps: [
        { k: 'intro', extra: () => { try { const M = MKx(); return (M && M.state && M.state.target !== 'app') ? 'tour.app.intro.switch' : null; } catch (e) { return null; } } },
        {
          k: 'burger',
          before: () => { if (!isVisible($('#page .burger'))) showTab('chrome'); },
          target: () => {
            const b = $('#page .burger'); if (isVisible(b)) return b;
            const np = $('#hdNavPos'); if (!np) return null;
            return np.closest('label,.row,.fld,.field') || np;
          },
        },
        {
          k: 'views',
          before: () => { showTab('chrome'); const s = $('#secViews'); if (s && 'open' in s) s.open = true; },
          target: () => $('#secViews'),
        },
        { k: 'phone', target: () => $('#btnTemplates') },
        { k: 'present', target: () => $('#btnPresent') },
        { k: 'done', final: true },
      ],
    },
  };

  // ------------------------------------------------------------------ Zustand und Elemente
  let cur = null;          // { id, i }
  let els = null;          // { block, spot, card, title, body, prog, foot }
  let token = 0;           // verwirft veraltete Zeitgeber
  let posTimer = 0;
  let prevFocus = null;

  function build() {
    if (els) return els;
    injectStyle();
    const block = document.createElement('div'); block.className = 'mkt-block';
    block.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); });
    block.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
    const spot = document.createElement('div'); spot.className = 'mkt-spot center'; spot.setAttribute('aria-hidden', 'true');
    const card = document.createElement('div'); card.className = 'mkt-card hidden';
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'false');
    card.id = 'mktCard'; card.setAttribute('aria-labelledby', 'mktTitle'); card.setAttribute('aria-describedby', 'mktBody');
    card.innerHTML = '<h3 id="mktTitle"></h3><div aria-live="polite"><p id="mktBody"></p></div><div class="mkt-foot"></div>';
    card.addEventListener('click', e => {
      const b = e.target.closest('[data-mkt]'); if (!b) return;
      const a = b.getAttribute('data-mkt');
      if (a === 'next') next(); else if (a === 'back') back(); else if (a === 'skip' || a === 'done') stop(); else if (a === 'toApp') start('app');
    });
    document.body.appendChild(block); document.body.appendChild(spot); document.body.appendChild(card);
    els = { block, spot, card, title: card.querySelector('#mktTitle'), body: card.querySelector('#mktBody'), foot: card.querySelector('.mkt-foot') };
    return els;
  }
  function teardown() {
    if (!els) return;
    [els.block, els.spot, els.card].forEach(n => { try { n.remove(); } catch (e) { /* robust */ } });
    els = null;
  }

  function stepOf() { if (!cur) return null; const tr = tours[cur.id]; return tr ? tr.steps[cur.i] : null; }

  function label() {
    const s = stepOf(); if (!s || !els) return;
    const tr = tours[cur.id]; const n = tr.steps.length;
    const pre = tr.prefix + s.k;
    els.title.textContent = t(pre + '.h');
    let body = t(pre + '.b');
    try { const x = s.extra && s.extra(); if (x) body += ' ' + t(x); } catch (e) { /* robust */ }
    els.body.textContent = body;
    els.card.setAttribute('aria-label', t('tour.dialog'));
    const prog = '<span class="mkt-prog">' + esc(t('tour.progress', { i: cur.i + 1, n })) + '</span>';
    const backB = cur.i > 0 ? '<button type="button" class="mkt-btn ghost" data-mkt="back">' + esc(t('tour.back')) + '</button>' : '';
    if (s.final) {
      const toApp = s.next === 'app' ? '<button type="button" class="mkt-btn" data-mkt="toApp">' + esc(t('tour.toApp')) + '</button>' : '';
      els.foot.innerHTML = prog + backB + toApp + '<button type="button" class="mkt-btn primary" data-mkt="done">' + esc(t('tour.done')) + '</button>';
    } else {
      els.foot.innerHTML = prog + '<button type="button" class="mkt-btn ghost" data-mkt="skip">' + esc(t('tour.skip')) + '</button>' + backB +
        '<button type="button" class="mkt-btn primary" data-mkt="next">' + esc(t('tour.next')) + '</button>';
    }
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function focusPrimary() {
    if (!els) return;
    const b = els.foot.querySelector('.mkt-btn.primary');
    try { if (b) b.focus({ preventScroll: true }); } catch (e) { try { b.focus(); } catch (e2) { /* robust */ } }
  }

  function currentTarget() {
    const s = stepOf(); if (!s || !s.target) return null;
    let el = null;
    try { el = s.target(); } catch (e) { el = null; }
    return isVisible(el) ? el : null;
  }

  // Spotlight und Karte setzen
  function position() {
    if (!els || !cur) return;
    try {
      const vw = window.innerWidth || document.documentElement.clientWidth || 1024;
      const vh = window.innerHeight || document.documentElement.clientHeight || 768;
      const card = els.card, spot = els.spot;
      const cw = card.offsetWidth || 340, ch = card.offsetHeight || 160;
      const M = 12, GAP = 14, PAD = 6;
      const el = currentTarget();
      if (!el) {
        spot.classList.add('center');
        spot.style.left = Math.round(vw / 2) + 'px'; spot.style.top = Math.round(vh / 2) + 'px'; spot.style.width = '0px'; spot.style.height = '0px';
        card.style.left = Math.max(M, Math.round((vw - cw) / 2)) + 'px';
        card.style.top = Math.max(M, Math.round((vh - ch) / 2)) + 'px';
        return;
      }
      const r0 = el.getBoundingClientRect();
      // Ausschnitt auf das Fenster begrenzen (große Ziele wie die Seite oder ein Panel)
      const l = Math.max(4, r0.left - PAD), tp = Math.max(4, r0.top - PAD);
      const rr = Math.min(vw - 4, r0.right + PAD), bb = Math.min(vh - 4, r0.bottom + PAD);
      const r = { left: l, top: tp, right: Math.max(rr, l + 8), bottom: Math.max(bb, tp + 8) };
      r.width = r.right - r.left; r.height = r.bottom - r.top;
      spot.classList.remove('center');
      spot.style.left = Math.round(r.left) + 'px'; spot.style.top = Math.round(r.top) + 'px';
      spot.style.width = Math.round(r.width) + 'px'; spot.style.height = Math.round(r.height) + 'px';

      const clampX = x => Math.min(Math.max(M, x), Math.max(M, vw - cw - M));
      const clampY = y => Math.min(Math.max(M, y), Math.max(M, vh - ch - M));
      const space = { bottom: vh - r.bottom - GAP, top: r.top - GAP, right: vw - r.right - GAP, left: r.left - GAP };
      const fits = { bottom: space.bottom >= ch + M, top: space.top >= ch + M, right: space.right >= cw + M, left: space.left >= cw + M };
      let side = ['bottom', 'top', 'right', 'left'].find(k => fits[k]);
      let x, y;
      if (!side) {
        // Kein Platz neben dem Ziel (z. B. die ganze Seite): Karte unten im Ziel überlagern
        x = clampX(r.left + (r.width - cw) / 2);
        y = clampY(r.bottom - ch - 16);
      } else if (side === 'bottom') { x = clampX(r.left + (r.width - cw) / 2); y = clampY(r.bottom + GAP); }
      else if (side === 'top') { x = clampX(r.left + (r.width - cw) / 2); y = clampY(r.top - GAP - ch); }
      else if (side === 'right') { x = clampX(r.right + GAP); y = clampY(r.top + (r.height - ch) / 2); }
      else { x = clampX(r.left - GAP - cw); y = clampY(r.top + (r.height - ch) / 2); }
      card.style.left = Math.round(x) + 'px'; card.style.top = Math.round(y) + 'px';
    } catch (e) { /* Positionierung darf nie werfen */ }
  }
  function schedule() {
    if (!cur) return;
    clearTimeout(posTimer);
    posTimer = setTimeout(position, 60);
  }

  function show(i) {
    if (!cur) return;
    const tr = tours[cur.id]; if (!tr) return;
    cur.i = Math.max(0, Math.min(i, tr.steps.length - 1));
    const s = stepOf();
    const my = ++token;
    try { if (s.before) s.before(); } catch (e) { /* Vorbereitung darf scheitern */ }
    label();
    els.card.classList.remove('hidden');
    // Vorbereitung kann neu zeichnen lassen: kurz warten, dann Ziel frisch suchen
    setTimeout(() => {
      if (my !== token || !cur) return;
      try {
        const el = currentTarget();
        if (el) {
          const r = el.getBoundingClientRect(); const vh = window.innerHeight || 768; const vw = window.innerWidth || 1024;
          if (r.top < 0 || r.bottom > vh || r.left < 0 || r.right > vw) { if (r.height < vh && r.width < vw) el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
        }
      } catch (e) { /* robust */ }
      position();
      focusPrimary();
      setTimeout(() => { if (my === token) position(); }, 320);
    }, 90);
  }

  function next() { if (!cur) return; const tr = tours[cur.id]; if (cur.i >= tr.steps.length - 1) { stop(); return; } show(cur.i + 1); }
  function back() { if (!cur || cur.i <= 0) return; show(cur.i - 1); }

  function start(id) {
    try {
      id = tours[id] ? id : 'essentials';
      hideOffer(true);
      const wasRunning = !!cur;
      if (!wasRunning) prevFocus = document.activeElement;
      closeDialogs();
      let delay = 0;
      if (isPresent()) { try { const M = MKx(); if (M && M.togglePresent) M.togglePresent(false); } catch (e) { /* robust */ } delay = 140; }
      cur = { id, i: 0 };
      build();
      els.card.classList.add('hidden');
      els.spot.classList.add('center');
      const my = ++token;
      setTimeout(() => { if (my === token && cur) show(0); }, delay);
      return true;
    } catch (e) { stop(); return false; }
  }

  function stop() {
    token++;
    clearTimeout(posTimer);
    const had = !!cur;
    cur = null;
    teardown();
    if (had) {
      const f = (prevFocus && prevFocus.isConnected && prevFocus !== document.body) ? prevFocus : $('#btnTour');
      try { if (f && f.focus) f.focus({ preventScroll: true }); } catch (e) { /* robust */ }
    }
    prevFocus = null;
  }

  // ------------------------------------------------------------------ Tastatur (vor allen Kürzeln des Editors und der Bühne)
  window.addEventListener('keydown', e => {
    if (!cur || !els) return;
    e.stopImmediatePropagation();
    const k = e.key;
    const inCard = els.card.contains(document.activeElement);
    if (k === 'Escape') { e.preventDefault(); stop(); return; }
    if (k === 'ArrowRight') { e.preventDefault(); next(); return; }
    if (k === 'ArrowLeft') { e.preventDefault(); back(); return; }
    if (k === 'Enter') {
      e.preventDefault();
      const a = document.activeElement;
      if (inCard && a && a.matches && a.matches('[data-mkt]')) a.click(); else next();
      return;
    }
    if (k === ' ' && inCard) return;          // Leertaste löst den fokussierten Knopf aus
    if (k === 'Tab') {
      // Fokus in der Karte halten
      const bs = Array.from(els.card.querySelectorAll('button'));
      if (!bs.length) { e.preventDefault(); return; }
      const idx = bs.indexOf(document.activeElement);
      e.preventDefault();
      const n = e.shiftKey ? (idx <= 0 ? bs.length - 1 : idx - 1) : (idx < 0 || idx >= bs.length - 1 ? 0 : idx + 1);
      try { bs[n].focus(); } catch (er) { /* robust */ }
      return;
    }
    // übrige Tasten: Editor-Kürzel unterdrücken, Eingaben außerhalb der Karte verhindern
    if (!inCard) e.preventDefault();
  }, true);

  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('mk:rendered', schedule);

  // ------------------------------------------------------------------ Knopf in der Kopfleiste
  function tourButton() {
    let b = $('#btnTour');
    if (!b) {
      const anchor = $('#btnTemplates'); if (!anchor || !anchor.parentNode) return null;
      b = document.createElement('button');
      b.type = 'button'; b.className = 'btn hide-present'; b.id = 'btnTour';
      b.innerHTML = '<span class="mkt-ic" aria-hidden="true">◎</span><span class="mkt-lbl"></span>';
      anchor.parentNode.insertBefore(b, anchor.nextSibling);
      b.addEventListener('click', () => { lsSet('started'); start('essentials'); });
    }
    const l = b.querySelector('.mkt-lbl'); if (l) l.textContent = t('tour.btn');
    b.setAttribute('title', t('tour.btnTip'));
    return b;
  }

  // ------------------------------------------------------------------ Angebot beim ersten Besuch
  let offerEl = null;
  function relabelOffer() {
    if (!offerEl) return;
    offerEl.setAttribute('aria-label', t('tour.dialog'));
    offerEl.querySelector('p').textContent = t('tour.offer.text');
    offerEl.querySelector('[data-o="start"]').textContent = t('tour.offer.start');
    offerEl.querySelector('[data-o="later"]').textContent = t('tour.offer.later');
  }
  function showOffer() {
    if (offerEl || cur) return;
    if (lsGet()) return;
    if (isPresent()) return;
    if (isVisible($('#mobileNote'))) return;   // Hinweis für kleine Bildschirme liegt vorn: nicht zusätzlich anbieten
    injectStyle();
    offerEl = document.createElement('div');
    offerEl.className = 'mkt-offer hidden'; offerEl.setAttribute('role', 'region');
    offerEl.innerHTML = '<p></p><div class="mkt-row"><button type="button" class="mkt-btn ghost" data-o="later"></button><button type="button" class="mkt-btn primary" data-o="start"></button></div>';
    offerEl.addEventListener('click', e => {
      const b = e.target.closest('[data-o]'); if (!b) return;
      if (b.getAttribute('data-o') === 'start') { lsSet('started'); start('essentials'); }
      else { lsSet('later'); hideOffer(); }
    });
    relabelOffer();
    document.body.appendChild(offerEl);
    setTimeout(() => { if (offerEl) offerEl.classList.remove('hidden'); }, 20);
  }
  function hideOffer(now) {
    const o = offerEl; if (!o) return; offerEl = null;
    if (now) { try { o.remove(); } catch (e) { /* robust */ } return; }
    o.classList.add('hidden'); setTimeout(() => { try { o.remove(); } catch (e) { /* robust */ } }, 250);
  }

  // ------------------------------------------------------------------ Sprache
  if (I && I.onChange) I.onChange(() => {
    try { tourButton(); relabelOffer(); if (cur && els) { label(); schedule(); focusPrimary(); } } catch (e) { /* robust */ }
  });

  // ------------------------------------------------------------------ Start
  function init() {
    injectStyle();
    tourButton();
    if (!lsGet()) setTimeout(showOffer, 1200);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.MK_TOUR = {
    start(id) { return start(id || 'essentials'); },
    stop() { stop(); },
    tours,
    get active() { return cur ? { id: cur.id, step: cur.i, total: tours[cur.id].steps.length } : null; },
  };
})();
