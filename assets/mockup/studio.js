/* MockupKitchen · Arbeitsbereich „Visual einrichten" (ab 0.9.0)
 *
 * Ein ganzseitiger Dialog für eine Kachel. Drei Spalten:
 *   links   Felder aus dem Modell (Suche, Klick oder Ziehen ordnet zu)
 *   Mitte   große Vorschau, Titel und Untertitel, darunter „Das kann dieses Visual"
 *   rechts  Rollen (mit Vorschlägen), Darstellung (Szenario, Abweichung, Sortierung, Top N, Small Multiples, Optionen)
 * Jede Änderung wirkt sofort auf die Kachel (MK.commit) und die Vorschau. Öffnen über die Kachel-Leiste „Einrichten"
 * oder MK_STUDIO.open(leafId). Muss nach app.js und appmode.js geladen werden.
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

  // ------------------------------------------------------------------ Texte
  Object.assign(I.dict.de, {
    'st.h': 'Visual einrichten', 'st.type': 'Typ ändern', 'st.done': 'Fertig', 'st.auto': 'Felder vorschlagen', 'st.alt': '+ Alternative', 'st.altDrop': 'Alternative entfernen',
    'st.fields': 'Felder', 'st.search': 'Feld suchen …', 'st.fieldsHint': 'Klick ordnet das Feld der markierten Rolle zu. Ziehen geht auch.',
    'st.title': 'Titel', 'st.sub': 'Untertitel oder Einheit', 'st.message': 'Kernaussage (ein Satz)', 'st.roles': 'Rollen', 'st.rolesHint': 'Eine Rolle anklicken, dann links ein Feld wählen.',
    'st.empty': 'noch leer', 'st.req': 'Pflicht', 'st.opt': 'freiwillig', 'st.max': 'bis {n}', 'st.sugg': 'Vorschlag', 'st.active': 'markiert',
    'st.look': 'Darstellung', 'st.scenario': 'Vergleich', 'st.delta': 'Abweichung zeigen', 'st.abs': 'absolut', 'st.rel': 'in Prozent',
    'st.polarity': 'Bewertung', 'st.pol.auto': 'automatisch', 'st.pol.higher': 'mehr ist besser', 'st.pol.lower': 'weniger ist besser',
    'st.sort': 'Sortierung', 'st.sort.none': 'wie im Modell', 'st.sort.valDesc': 'nach Wert, größte zuerst', 'st.sort.valAsc': 'nach Wert, kleinste zuerst', 'st.sort.deltaDesc': 'nach Abweichung',
    'st.topN': 'Top N', 'st.topN.none': 'alle zeigen', 'st.topN.n': 'Top {n}', 'st.sm': 'Small Multiples (ein Diagramm je Wert)', 'st.cum': 'kumuliert (YTD)',
    'st.can': 'Das kann dieses Visual', 'st.here': 'hier einstellbar', 'st.viaType': 'über „Typ ändern“', 'st.inVisual': 'im Bericht einstellbar',
    'st.engine': 'Umsetzung', 'st.notApp': 'In der Fabric App heute nicht aus der Spec erzeugbar.', 'st.noVisual': 'Diese Kachel hat noch kein Visual.', 'st.pick': 'Visual wählen',
    'st.assigned': '{f} zugeordnet: {r}', 'st.noFit': 'Dieses Feld passt in keine freie Rolle.', 'st.kind.measure': 'Kennzahl', 'st.kind.column': 'Spalte', 'st.kind.any': 'beliebig', 'st.filled': '{n} Felder zugeordnet. Bitte kurz prüfen.', 'st.noSugg': 'Kein sicherer Vorschlag.',
    'st.ready': 'Alle Pflichtrollen sind belegt.', 'st.missing': 'Es fehlt noch: {r}',
    // Möglichkeiten je Umsetzung (kurz, aus AGENT-GUIDE und capabilities der Visuals)
    'st.cap.scen': 'Szenarien in fester Notation: AC gefüllt, PY grau, PL als Kontur, FC schraffiert', 'st.cap.delta': 'Abweichung absolut und in Prozent als eigene Ebenen',
    'st.cap.sm': 'Small Multiples mit gleicher Skala', 'st.cap.cum': 'Kumulierte Sicht (YTD, QTD, rollierend)', 'st.cap.line2': 'Zweite Kennzahl als Linie über den Säulen',
    'st.cap.stack': 'Gestapelt nach einer Reihe, auch als Fläche oder auf 100 Prozent', 'st.cap.topn': 'Top N mit Restposition', 'st.cap.sort': 'Sortierung nach Wert oder Abweichung',
    'st.cap.series': 'Mehrere Linien je Reihe, wahlweise als Index (Start = 100)', 'st.cap.bridgeSum': 'Summen- und Zwischensummen-Säulen über die Rolle Zeilentyp',
    'st.cap.bridgeTime': 'Brücke vom Bezug zum Ist über die Perioden', 'st.cap.bridgeCat': 'Brücke vom Bezug zum Ist über die Kategorien, waagerecht oder senkrecht',
    'st.cap.tableHier': 'Hierarchie mit Zwischensummen und Chart-Spalten', 'st.cap.matrix': 'Spaltengruppen (Matrix) mit bis zu zwei Ebenen', 'st.cap.pareto': 'Kumulierte Prozentlinie mit 80-Prozent-Marke',
    'st.cap.dumbbell': 'Zwei Punkte je Kategorie: Bezug und Ist mit Verbinder', 'st.cap.slope': 'Steigungslinie je Kategorie vom Bezug zum Ist',
    'st.cap.cardTrend': 'Verlauf in der Karte als Sparkline oder Säulen', 'st.cap.cardGrid': 'Mit einer Kategorie entsteht ein Raster aus Karten, sortierbar nach Abweichung', 'st.cap.cardBullet': 'Vergleichsbalken gegen einen Richtwert',
    'st.cap.scQuad': 'Quadranten am Mittelwert oder Median', 'st.cap.scBubble': 'Blasengröße aus einer dritten Kennzahl', 'st.cap.scPath': 'Zeitpfad je Einheit und Abspielen über die Perioden', 'st.cap.scColor': 'Färbung nach Status oder Gruppe, Trendlinie',
    'st.cap.sf': 'Bestand als Linie oder Fläche, Zu- und Abflüsse als Säulen, Netto-Ebene', 'st.cap.pnlRows': 'Kontenhierarchie mit Summen-, Formel- und Margenzeilen',
    'st.cap.pnlCols': 'Spaltensätze und Vorlagen (AC, PY, PL, FC mit Abweichungen)', 'st.cap.pnlViews': 'Ansichten: Tabelle, Balken, Wasserfall, Werttreiberbaum, Sankey', 'st.cap.pnlSpark': 'Sparklines und Monatsblöcke über ein Periodenfeld', 'st.cap.pnlComment': 'Kommentare als Fußnoten, nur Ausnahmen zeigen',
    'st.cap.gantt': 'Vorgänge mit Start und Ende, Phasen als Gruppen', 'st.cap.native': 'Natives Power-BI-Visual: Formatierung über das Theme und den Formatbereich', 'st.cap.deneb': 'Freie Vega-Lite-Spezifikation, wird beim Bau ausgearbeitet',
  });
  Object.assign(I.dict.en, {
    'st.h': 'Set up visual', 'st.type': 'Change type', 'st.done': 'Done', 'st.auto': 'Suggest fields', 'st.alt': '+ Alternative', 'st.altDrop': 'Remove alternative',
    'st.fields': 'Fields', 'st.search': 'Search fields …', 'st.fieldsHint': 'A click assigns the field to the highlighted role. Dragging works too.',
    'st.title': 'Title', 'st.sub': 'Subtitle or unit', 'st.message': 'Key message (one sentence)', 'st.roles': 'Roles', 'st.rolesHint': 'Click a role, then pick a field on the left.',
    'st.empty': 'still empty', 'st.req': 'required', 'st.opt': 'optional', 'st.max': 'up to {n}', 'st.sugg': 'Suggestion', 'st.active': 'highlighted',
    'st.look': 'Display', 'st.scenario': 'Comparison', 'st.delta': 'Show variance', 'st.abs': 'absolute', 'st.rel': 'in percent',
    'st.polarity': 'Rating', 'st.pol.auto': 'automatic', 'st.pol.higher': 'more is better', 'st.pol.lower': 'less is better',
    'st.sort': 'Sorting', 'st.sort.none': 'as in the model', 'st.sort.valDesc': 'by value, largest first', 'st.sort.valAsc': 'by value, smallest first', 'st.sort.deltaDesc': 'by variance',
    'st.topN': 'Top N', 'st.topN.none': 'show all', 'st.topN.n': 'Top {n}', 'st.sm': 'Small multiples (one chart per value)', 'st.cum': 'cumulative (YTD)',
    'st.can': 'What this visual can do', 'st.here': 'set here', 'st.viaType': 'via “Change type”', 'st.inVisual': 'set in the report',
    'st.engine': 'Built as', 'st.notApp': 'Cannot be generated from the spec in the Fabric App today.', 'st.noVisual': 'This tile has no visual yet.', 'st.pick': 'Choose visual',
    'st.assigned': '{f} assigned: {r}', 'st.noFit': 'This field fits no free role.', 'st.kind.measure': 'measure', 'st.kind.column': 'column', 'st.kind.any': 'any', 'st.filled': '{n} fields assigned. Please check them.', 'st.noSugg': 'No confident suggestion.',
    'st.ready': 'All required roles are filled.', 'st.missing': 'Still missing: {r}',
    'st.cap.scen': 'Scenarios in fixed notation: AC solid, PY grey, PL outlined, FC hatched', 'st.cap.delta': 'Absolute and percentage variance as separate layers',
    'st.cap.sm': 'Small multiples on a shared scale', 'st.cap.cum': 'Cumulative view (YTD, QTD, rolling)', 'st.cap.line2': 'Second measure as a line above the columns',
    'st.cap.stack': 'Stacked by a series, also as area or to 100 percent', 'st.cap.topn': 'Top N with a remainder item', 'st.cap.sort': 'Sorting by value or variance',
    'st.cap.series': 'Several lines per series, optionally indexed (start = 100)', 'st.cap.bridgeSum': 'Total and subtotal columns via the row type role',
    'st.cap.bridgeTime': 'Bridge from the basis to actual across periods', 'st.cap.bridgeCat': 'Bridge from the basis to actual across categories, horizontal or vertical',
    'st.cap.tableHier': 'Hierarchy with subtotals and chart columns', 'st.cap.matrix': 'Column groups (matrix) with up to two levels', 'st.cap.pareto': 'Cumulative percentage line with an 80 percent mark',
    'st.cap.dumbbell': 'Two dots per category: basis and actual with a connector', 'st.cap.slope': 'Slope line per category from basis to actual',
    'st.cap.cardTrend': 'Trend inside the card as sparkline or columns', 'st.cap.cardGrid': 'With a category you get a grid of cards, sortable by variance', 'st.cap.cardBullet': 'Bullet bar against a benchmark',
    'st.cap.scQuad': 'Quadrants at mean or median', 'st.cap.scBubble': 'Bubble size from a third measure', 'st.cap.scPath': 'Time path per unit and play across periods', 'st.cap.scColor': 'Colour by status or group, trend line',
    'st.cap.sf': 'Stock as line or area, inflows and outflows as columns, net layer', 'st.cap.pnlRows': 'Account hierarchy with subtotal, formula and margin rows',
    'st.cap.pnlCols': 'Column sets and templates (AC, PY, PL, FC with variances)', 'st.cap.pnlViews': 'Views: table, bars, waterfall, value driver tree, Sankey', 'st.cap.pnlSpark': 'Sparklines and monthly blocks via a period field', 'st.cap.pnlComment': 'Comments as footnotes, show exceptions only',
    'st.cap.gantt': 'Tasks with start and end, phases as groups', 'st.cap.native': 'Native Power BI visual: formatting via the theme and the format pane', 'st.cap.deneb': 'Free Vega-Lite specification, worked out during the build',
  });
  // Möglichkeiten je ChartKitchen-Modus bzw. Custom Visual. Ob eine Möglichkeit „hier einstellbar" ist, entscheidet capWhere()
  // an der Kachel selbst (gibt es die Rolle, den Schalter, die Option?), damit das Etikett nie mehr verspricht als der Dialog kann.
  const CAPS = {
    columns: ['scen', 'delta', 'cum', 'sm', 'line2', 'stack'],
    bars: ['scen', 'delta', 'sort', 'topn', 'sm', 'stack'],
    line: ['scen', 'cum', 'series', 'sm'],
    waterfall: ['bridgeSum', 'delta', 'scen'],
    intwaterfall: ['bridgeTime', 'scen', 'delta'],
    catbridge: ['bridgeCat', 'sort', 'topn'],
    table: ['tableHier', 'scen', 'delta', 'matrix', 'topn'],
    pareto: ['pareto', 'topn'],
    dumbbell: ['dumbbell', 'sort', 'topn'],
    slope: ['slope', 'scen'],
    cards: ['cardTrend', 'delta', 'cardGrid', 'cardBullet'],
    scatter: ['scQuad', 'scBubble', 'scPath', 'scColor'],
    stockflow: ['sf', 'scen'],
    pnl: ['pnlRows', 'scen', 'delta'],
    pnlByDatenWG: ['pnlRows', 'pnlCols', 'pnlViews', 'pnlSpark', 'pnlComment'],
    dataKitchenGantt: ['gantt'],
    native: ['native'], deneb: ['deneb'],
  };
  // 'here' = im Arbeitsbereich einstellbar, 'type' = über „Typ ändern", 'visual' = erst im Bericht
  function capWhere(key, c) {
    const opt = k => c.opts.some(o => o.key === k), role = k => c.roles.some(r => r.key === k);
    const here = { scen: role('ref'), delta: c.hasRef, sort: c.hasCat, topn: c.hasCat, sm: c.sm, cum: c.hasTime, series: role('series'), stack: role('series'),
      cardTrend: opt('cardTrendChart'), scQuad: opt('scatterQuadrant'), scBubble: role('size'), scPath: opt('scatterPlay'), sf: opt('sfNet'), bridgeCat: opt('bridgeOrientation'), pnlCols: opt('template') || role('ref') }[key];
    if (here) return 'here';
    return ({ pnlViews: 1, scQuad: 1, scPath: 1, line2: 1, stack: 1, matrix: 1, cardBullet: 1 }[key]) ? 'type' : 'visual';
  }
  const SCEN_OPTIONS = ['AC/PL', 'AC/PY', 'AC/PL/FC', 'AC/PL/PY', 'AC/BU', 'PL/FC', 'AC'];

  // ------------------------------------------------------------------ Stil
  const css = `
  dialog.studio{width:100vw;max-width:100vw;height:100vh;max-height:100vh;margin:0;border-radius:0;padding:0;background:var(--bg);display:none;flex-direction:column}
  dialog.studio[open]{display:flex}
  .stu-head{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg-card);border-bottom:1px solid var(--line);flex:none}
  .stu-head h2{margin:0;font-size:16px;font-weight:700}
  .stu-type{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line-strong);border-radius:999px;background:var(--bg-card);padding:4px 12px 4px 6px;font-size:12.5px;font-weight:500}
  .stu-type:hover{background:var(--bg-soft)}
  .stu-type .pv{width:44px;height:24px;border:1px solid var(--line);border-radius:5px;background:#fff;overflow:hidden}.stu-type .pv svg{width:100%;height:100%}
  .stu-alts{display:inline-flex;border:1px solid var(--line-strong);border-radius:8px;overflow:hidden;font-size:12px}
  .stu-alts button{border:0;background:var(--bg-card);padding:5px 10px;border-right:1px solid var(--line)}.stu-alts button:last-child{border-right:0}
  .stu-alts button[aria-pressed="true"]{background:var(--ink);color:#fff}
  .stu-body{flex:1;min-height:0;display:grid;grid-template-columns:270px minmax(0,1fr) 380px;gap:0}
  @media (max-width:1100px){.stu-body{grid-template-columns:220px minmax(0,1fr) 320px}}
  .stu-col{min-height:0;overflow:auto;padding:14px}
  .stu-col.left{background:var(--bg-card);border-right:1px solid var(--line)}
  .stu-col.right{background:var(--bg-card);border-left:1px solid var(--line)}
  .stu-col h3{margin:0 0 6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-soft)}
  .stu-col h3:not(:first-child){margin-top:18px}
  .stu-hint{color:var(--ink-mute);font-size:11.5px;margin:0 0 8px}
  .stu-tbl{font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-mute);margin:10px 0 4px}
  .stu-f{display:flex;align-items:center;gap:6px;width:100%;text-align:left;border:1px solid var(--line);background:var(--bg-card);border-radius:6px;padding:4px 8px;margin-bottom:3px;font-size:12px;cursor:grab}
  .stu-f:hover{border-color:var(--sel);background:var(--sel-soft)}
  .stu-f .ic{font-family:var(--ff-mono);font-size:10px;width:14px;text-align:center;color:var(--accent-strong)}
  .stu-f.c .ic{color:var(--sel)}
  .stu-f.off{opacity:.38}
  .stu-f.used{border-style:dashed}
  .stu-f .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .stu-mid{display:flex;flex-direction:column;gap:12px;padding:16px 20px}
  .stu-ttl{display:grid;grid-template-columns:1.3fr 1fr;gap:8px}
  .stu-ttl input{font-size:14px;padding:7px 10px}
  .stu-pv{background:var(--tile-bg,#fff);border:1px solid var(--line);border-radius:12px;box-shadow:var(--sh);padding:14px 16px;min-height:300px;flex:1 1 380px;display:flex;flex-direction:column;gap:4px}
  .stu-pv .pt{font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .stu-pv .ps{font-size:12px;color:var(--ink-soft)}
  .stu-pv .pm{font-size:12.5px;font-weight:500}
  .stu-pv .box{flex:1;min-height:220px;display:flex;align-items:center;justify-content:center}
  .stu-pv .box svg{max-width:100%;max-height:100%}
    .stu-card{background:var(--bg-card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
  .stu-can{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:5px 18px}
  @media (max-width:1300px){.stu-can{grid-template-columns:1fr}}
  .stu-can li{display:flex;gap:8px;align-items:baseline;font-size:12px}
  .stu-can .tg{flex:none;font-size:10px;padding:0 6px;border-radius:999px;line-height:16px;background:var(--bg-soft);color:var(--ink-mute)}
  .stu-can .tg.here{background:#EAF5F3;color:#16453E}
  .stu-can .tg.type{background:var(--sel-soft);color:var(--ink-soft)}
  .stu-role{border:1.5px solid var(--line);border-radius:10px;padding:8px 10px;margin-bottom:6px;background:var(--bg-card);cursor:pointer}
  .stu-role.act{border-color:var(--sel);box-shadow:0 0 0 2px var(--sel-soft)}
  .stu-role.over{border-color:var(--accent);background:var(--accent-soft)}
  .stu-role.miss:not(.act){border-color:#E3B7B2}
  .stu-role .hd{display:flex;align-items:baseline;gap:6px;font-size:12.5px;font-weight:600}
  .stu-role .hd small{font-weight:400;color:var(--ink-mute);font-size:10.5px;margin-left:auto;white-space:nowrap}
  .stu-role .hd .rq{color:var(--bad)}
  .stu-role .ds{font-size:11.5px;color:var(--ink-soft);margin:2px 0 5px;line-height:1.35}
  .stu-chips{display:flex;flex-wrap:wrap;gap:4px}
  .stu-chip{display:inline-flex;align-items:center;gap:5px;border-radius:999px;background:var(--sel-soft);border:1px solid #BFD3F2;padding:1px 4px 1px 9px;font-size:12px}
  .stu-chip.m{background:var(--accent-soft);border-color:#E9C9B8}
  .stu-chip button{border:0;background:transparent;font-size:13px;line-height:1;color:var(--ink-mute);padding:0 3px}
  .stu-chip button:hover{color:var(--bad)}
  .stu-empty{font-size:11.5px;color:var(--ink-mute);font-style:italic}
  .stu-sg{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;align-items:center}
  .stu-sg small{font-size:10px;color:var(--ink-mute);text-transform:uppercase;letter-spacing:.05em}
  .stu-sg button{border:1px dashed var(--line-strong);background:var(--bg-card);border-radius:999px;padding:1px 8px;font-size:11px;font-family:var(--ff-mono);color:var(--ink-soft)}
  .stu-sg button:hover{border-style:solid;border-color:var(--accent);background:var(--accent-soft);color:var(--ink)}
  .stu-set{display:grid;gap:8px}
  .stu-set label.f{display:grid;gap:3px;font-size:11px;font-weight:600;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em}
  .stu-set .ctl{font-size:12.5px;text-transform:none;letter-spacing:0;font-weight:400}
  .stu-set .tog{display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer}
  .stu-set .tog input{accent-color:var(--accent);width:15px;height:15px;margin:0}
  .stu-set .rowc{display:flex;gap:14px;flex-wrap:wrap}
  .stu-foot{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg-card);border-top:1px solid var(--line);flex:none}
  .stu-foot .stu-msg{flex:1;min-width:0;font-size:12.5px;color:var(--ink-soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .stu-foot .stu-msg.is-ok{color:var(--ok)}.stu-foot .stu-msg.is-warn{color:var(--bad)}
  .stu-foot .btn.accent{padding:9px 28px;font-size:14px;font-weight:600}
  `;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  // ------------------------------------------------------------------ Zustand und Helfer
  const dlg = document.createElement('dialog'); dlg.className = 'studio'; dlg.id = 'dlgStudio'; dlg.setAttribute('aria-labelledby', 'stuH');
  document.body.appendChild(dlg);
  let cur = null, active = null, q = '', flash = null, pvTimer = null, hold = false;
  const leafOf = () => (cur ? MK.leaves(MK.page().layout).find(l => l.id === cur) : null);
  const defOf = v => CAT.byId[v.kind] || { label: v.kind, roles: [], engines: [] };
  const rolesOf = v => CAT.rolesFor(defOf(v), v);
  const fits = (r, f) => r.kind === 'any' || r.kind === f.kind;
  function modelFields() {
    const out = []; ((S().model || {}).tables || []).forEach(tb => {
      (tb.measures || []).forEach(m => { if (!m.hidden) out.push({ table: tb.name, name: m.name, kind: 'measure', type: 'measure' }); });
      (tb.columns || []).forEach(c => { if (!c.hidden) out.push({ table: tb.name, name: c.name, kind: 'column', type: String(c.type || '') }); });
    }); return out;
  }
  const usedRefs = v => new Set(Object.keys(v.roles || {}).flatMap(k => (v.roles[k] || []).map(f => f.table + '.' + f.name)));
  function assign(v, role, f) {
    v.roles = v.roles || {}; const list = v.roles[role.key] = v.roles[role.key] || [];
    if (list.some(x => x.table === f.table && x.name === f.name)) return false;
    if (list.length >= role.max) list.pop();
    list.push({ table: f.table, name: f.name, kind: f.kind, isNew: false }); return true;
  }
  function change(fn, msg, after) {
    const leaf = leafOf(); if (!leaf || !leaf.visual) return;
    fn(leaf.visual, leaf); hold = true; try { MK.commit({ keep: true }); } finally { hold = false; }
    if (after) after(); if (msg) flash = msg; render();
  }
  const setAn = (v, key, val) => { const a = v.analysis = v.analysis || {}; if (val === '' || val == null || val === false) delete a[key]; else a[key] = val; };
  const capKey = (v, def) => (v.engine === 'ck' && def.ckMode) ? def.ckMode : (v.engine === 'custom' && def.customVisual ? def.customVisual.name : (v.engine === 'deneb' ? 'deneb' : 'native'));

  // ------------------------------------------------------------------ Zeichnen
  function previewSvg(leaf) {
    const v = leaf.visual, def = defOf(v), box = $('.stu-pv .box', dlg);
    const w = Math.max(320, Math.min(1500, (box && box.clientWidth) || 760)), h = Math.max(220, Math.min(900, (box && box.clientHeight) || 380));
    const sc = Math.max(1.25, Math.min(2.4, w / 480));
    try {
      const an = MK.analysisOf(v); const opts = MK.sketchOpts(v, leaf.id, { scale: sc, fontScale: sc });
      const fn = an.smallMultiples && window.MK_SKETCH.small ? window.MK_SKETCH.small : window.MK_SKETCH;
      return fn(def.sketch || v.kind, w, h, opts) || '';
    } catch (e) { return ''; }
  }
  function render() {
    const leaf = leafOf(); if (!leaf) { if (dlg.open) dlg.close(); return; }
    const v = leaf.visual;
    if (!v) { dlg.innerHTML = `<div class="stu-head"><h2 id="stuH">${esc(t('st.h'))}</h2><span class="spacer"></span><button class="btn ghost" data-stu="close">✕</button></div><div class="stu-body" style="display:grid;place-items:center;grid-template-columns:1fr"><div style="text-align:center"><p>${esc(t('st.noVisual'))}</p><button class="btn accent" data-stu="type">${esc(t('st.pick'))}</button></div></div>`; return; }
    const def = defOf(v), roles = rolesOf(v), an = MK.analysisOf(v), a = v.analysis || {}, all = modelFields(), used = usedRefs(v);
    if (!roles.some(r => r.key === active)) active = (roles.find(r => r.req && !((v.roles || {})[r.key] || []).length) || roles.find(r => !((v.roles || {})[r.key] || []).length) || roles[0] || {}).key || null;
    const actRole = roles.find(r => r.key === active) || null;
    const keepScroll = { l: ($('.stu-col.left', dlg) || {}).scrollTop || 0, r: ($('.stu-col.right', dlg) || {}).scrollTop || 0, m: ($('.stu-col.mid', dlg) || {}).scrollTop || 0 };
    const focusId = document.activeElement && dlg.contains(document.activeElement) ? document.activeElement.getAttribute('data-stf') : null;
    // Kopf
    const alts = window.MK_APPMODE && MK_APPMODE.altList ? MK_APPMODE.altList(v) : { list: [v], ix: 0 };
    const altLab = x => x.altLabel || ((CAT.byId[x.kind] || {}).label || x.kind).replace(/\s*\(.*\)\s*$/, '');
    const head = `<div class="stu-head"><h2 id="stuH">${esc(t('st.h'))}</h2>
      <button type="button" class="stu-type" data-stu="type" title="${esc(t('st.type'))}"><span class="pv">${window.MK_SKETCH ? window.MK_SKETCH(def.sketch || v.kind, 88, 48, { scenario: 'AC/PL', seed: 5, lang: S().lang }) : ''}</span><span>${esc(def.label)}</span><span style="color:var(--ink-mute)">▾</span></button>
      ${alts.list.length > 1 ? `<span class="stu-alts" role="group">${alts.list.map((x, i) => `<button type="button" data-stualt="${i}" aria-pressed="${i === alts.ix ? 'true' : 'false'}">${esc(altLab(x))}</button>`).join('')}</span>` : ''}
      <button type="button" class="btn sm" data-stu="alt">${esc(t('st.alt'))}</button>${alts.list.length > 1 ? `<button type="button" class="btn sm ghost" data-stu="altdrop">${esc(t('st.altDrop'))}</button>` : ''}
      <span class="spacer"></span><button type="button" class="btn ghost" data-stu="close" title="Esc" aria-label="${esc(t('st.done'))}">✕</button></div>`;
    // Felder links
    const ql = q.trim().toLowerCase(); const byTable = {};
    all.filter(f => !ql || (f.name + ' ' + f.table).toLowerCase().includes(ql)).forEach(f => { (byTable[f.table] = byTable[f.table] || []).push(f); });
    const left = `<div class="stu-col left"><h3>${esc(t('st.fields'))}</h3><input class="ctl" id="stuQ" data-stf="q" value="${esc(q)}" placeholder="${esc(t('st.search'))}" style="width:100%;margin-bottom:6px"><p class="stu-hint">${esc(t('st.fieldsHint'))}</p>
      ${Object.keys(byTable).map(tb => `<div class="stu-tbl">${esc(tb)}</div>` + byTable[tb].map(f => `<button type="button" class="stu-f ${f.kind === 'measure' ? 'm' : 'c'}${actRole && !fits(actRole, f) ? ' off' : ''}${used.has(f.table + '.' + f.name) ? ' used' : ''}" draggable="true" data-stufield="${esc(JSON.stringify(f))}" title="${esc(f.table + '.' + f.name)}"><span class="ic">${f.kind === 'measure' ? 'Σ' : '≡'}</span><span class="nm">${esc(f.name)}</span></button>`).join('')).join('')}</div>`;
    // Mitte
    const capCtx = { roles, opts: (v.engine === 'ck' || v.engine === 'custom') ? CAT.ckOptsFor(v.kind) : [], hasRef: roles.some(r => r.key === 'ref' || r.key === 'goal'), hasCat: roles.some(r => (r.key === 'category' && r.labelKey !== 'time') || r.key === 'rows'), hasTime: roles.some(r => r.labelKey === 'time'), sm: CAT.variantsFor(def) };
    const WH = { here: 'st.here', type: 'st.viaType', visual: 'st.inVisual' };
    const caps = (CAPS[capKey(v, def)] || []).map(k => { const w = capWhere(k, capCtx); return `<li><span class="tg ${w}">${esc(t(WH[w]))}</span><span>${esc(t('st.cap.' + k))}</span></li>`; }).join('');
    const engLbl = (CAT.engineLabel[v.engine] || v.engine) + (v.engine === 'ck' && def.ckMode ? ' · ' + def.ckMode : (v.engine === 'custom' && def.customVisual ? ' · ' + def.customVisual.name : ''));
    const notApp = S().target === 'app' && window.MK_APPMODE && MK_APPMODE.fitsApp && !MK_APPMODE.fitsApp(def);
    const mid = `<div class="stu-col mid stu-mid">
      <div class="stu-ttl"><input class="ctl" data-stf="title" data-stutext="title" value="${esc(v.title || '')}" placeholder="${esc(t('st.title'))}"><input class="ctl" data-stf="sub" data-stutext="sub" value="${esc(v.sub || '')}" placeholder="${esc(t('st.sub'))}"></div>
      <div class="stu-pv"><div class="pt" id="stuPt">${esc(v.title || def.label)}</div>${`<div class="ps" id="stuPs">${esc(v.sub || '')}</div>`}<div class="pm" id="stuPm">${esc(a.message || '')}</div><div class="box" id="stuBox"></div></div>
      <div class="stu-card"><h3>${esc(t('st.can'))}</h3><ul class="stu-can">${caps}</ul><p class="stu-hint" style="margin:8px 0 0">${esc(t('st.engine'))}: ${esc(engLbl)}${def.note ? ' · ' + esc(def.note) : ''}</p>${notApp ? `<p class="bm-warn" style="margin-top:6px">⚠ ${esc(t('st.notApp'))}</p>` : ''}</div></div>`;
    // rechts: Rollen
    const sg = r => (window.MK_APPMODE && MK_APPMODE.suggestFor ? MK_APPMODE.suggestFor(v, r, all) : []);
    const roleHtml = roles.map(r => {
      const list = (v.roles || {})[r.key] || [];
      const chips = list.map((f, i) => `<span class="stu-chip ${f.kind === 'measure' ? 'm' : ''}">${esc(f.name)}<button type="button" data-sturm="${esc(r.key)}:${i}" aria-label="✕">×</button></span>`).join('');
      const sug = !list.length ? sg(r) : [];
      return `<div class="stu-role${r.key === active ? ' act' : ''}${r.req && !list.length ? ' miss' : ''}" data-sturole="${esc(r.key)}" tabindex="0">
        <div class="hd"><span>${esc(r.label)}${r.req ? ' <span class="rq">*</span>' : ''}</span><small>${esc(t('st.kind.' + r.kind))} · ${esc(r.req ? t('st.req') : t('st.opt'))}${r.max > 1 ? ' · ' + esc(t('st.max', { n: r.max })) : ''}</small></div>
        <div class="ds">${esc(I.has('tip.role.' + r.labelKey) ? t('tip.role.' + r.labelKey) : '')}</div>
        ${chips ? `<div class="stu-chips">${chips}</div>` : `<div class="stu-empty">${esc(t('st.empty'))}</div>`}
        ${sug.length ? `<div class="stu-sg"><small>${esc(t('st.sugg'))}</small>${sug.map(x => `<button type="button" data-stusg="${esc(r.key)}" data-stusgf="${esc(JSON.stringify(x.f))}">+ ${esc(x.f.name)}</button>`).join('')}</div>` : ''}</div>`;
    }).join('');
    // rechts: Darstellung
    const hasRef = capCtx.hasRef, hasCat = capCtx.hasCat, hasTime = capCtx.hasTime, hasMeasure = roles.some(r => r.kind === 'measure');
    const sel = (key, opts, curv) => `<select class="ctl" data-stuset="${key}">${opts.map(o => `<option value="${esc(o[0])}" ${String(curv) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
    const sortCur = a.sort ? (a.sort.by === 'delta' ? 'deltaDesc' : (a.sort.dir === 'asc' ? 'valAsc' : 'valDesc')) : 'none';
    const ckOpts = capCtx.opts;
    const set = `<div class="stu-set">
      ${roles.some(r => r.key === 'ref') ? `<label class="f">${esc(t('st.scenario'))}${sel('scenario', SCEN_OPTIONS.map(s => [s, t('tip.scenOpt.' + s.toLowerCase().replace(/\W/g, ''))]), v.scenario)}</label>` : ''}
      ${hasRef ? `<div><label class="f" style="margin-bottom:4px">${esc(t('st.delta'))}</label><div class="rowc"><label class="tog"><input type="checkbox" data-studk="abs" ${an.deltaKind.includes('abs') ? 'checked' : ''}> ${esc(t('st.abs'))}</label><label class="tog"><input type="checkbox" data-studk="rel" ${an.deltaKind.includes('rel') ? 'checked' : ''}> ${esc(t('st.rel'))}</label></div></div>` : ''}
      ${hasMeasure && hasRef ? `<label class="f">${esc(t('st.polarity'))}${sel('polarity', [['', t('st.pol.auto')], ['higher', t('st.pol.higher')], ['lower', t('st.pol.lower')]], a.polarity || '')}</label>` : ''}
      ${hasCat ? `<label class="f">${esc(t('st.sort'))}${sel('sort', [['none', t('st.sort.none')], ['valDesc', t('st.sort.valDesc')], ['valAsc', t('st.sort.valAsc')]].concat(hasRef ? [['deltaDesc', t('st.sort.deltaDesc')]] : []), sortCur)}</label>
      <label class="f">${esc(t('st.topN'))}${sel('topN', [['', t('st.topN.none')], [3, t('st.topN.n', { n: 3 })], [5, t('st.topN.n', { n: 5 })], [10, t('st.topN.n', { n: 10 })]], a.topN || '')}</label>` : ''}
      ${hasTime ? `<label class="tog"><input type="checkbox" data-stuan="cumulative" ${a.cumulative ? 'checked' : ''}> ${esc(t('st.cum'))}</label>` : ''}
      ${CAT.variantsFor(def) ? `<label class="tog"><input type="checkbox" data-stuan="smallMultiples" ${a.smallMultiples ? 'checked' : ''}> ${esc(t('st.sm'))}</label>` : ''}
      ${ckOpts.map(o => `<label class="f" title="${esc(I.has('ck.tip.' + o.key) ? t('ck.tip.' + o.key) : '')}">${esc(I.has('ck.lbl.' + o.key) ? t('ck.lbl.' + o.key) : o.key)}<select class="ctl" data-stuck="${esc(o.key)}">${o.values.map(x => `<option value="${esc(x)}" ${CAT.ckValue(v, o.key) === x ? 'selected' : ''}>${esc(I.has('ck.opt.' + o.key + '.' + x) ? t('ck.opt.' + o.key + '.' + x) : x)}</option>`).join('')}</select></label>`).join('')}
      <label class="f">${esc(t('st.message'))}<input class="ctl" data-stf="message" data-stutext="message" value="${esc(a.message || '')}"></label>
    </div>`;
    const right = `<div class="stu-col right"><h3>${esc(t('st.roles'))}</h3><p class="stu-hint">${esc(t('st.rolesHint'))}</p>${roleHtml}<h3>${esc(t('st.look'))}</h3>${set}</div>`;
    // Fuß
    const missing = roles.filter(r => r.req && !((v.roles || {})[r.key] || []).length).map(r => r.label);
    const msg = flash || (missing.length ? t('st.missing', { r: missing.join(', ') }) : t('st.ready'));
    const foot = `<div class="stu-foot"><button type="button" class="btn" data-stu="auto">${esc(t('st.auto'))}</button><span class="stu-msg ${flash ? '' : (missing.length ? 'is-warn' : 'is-ok')}" role="status" aria-live="polite">${esc(msg)}</span><button type="button" class="btn accent" data-stu="close">✓ ${esc(t('st.done'))}</button></div>`;
    dlg.innerHTML = head + `<div class="stu-body">${left}${mid}${right}</div>` + foot;
    flash = null;
    const L = $('.stu-col.left', dlg), R = $('.stu-col.right', dlg), M = $('.stu-col.mid', dlg); if (L) L.scrollTop = keepScroll.l; if (R) R.scrollTop = keepScroll.r; if (M) M.scrollTop = keepScroll.m;
    if (focusId) { const fe = dlg.querySelector('[data-stf="' + focusId + '"]'); if (fe) { fe.focus(); try { const n = fe.value.length; fe.setSelectionRange(n, n); } catch (e) { /* kein Textfeld */ } } }
    drawPreview();
  }
  function drawPreview() { const leaf = leafOf(), box = $('#stuBox', dlg); if (!leaf || !leaf.visual || !box) return; box.innerHTML = previewSvg(leaf); }

  // ------------------------------------------------------------------ Bedienung
  dlg.addEventListener('click', e => {
    const leaf = leafOf(); const tg = e.target;
    const b = tg.closest('[data-stu]');
    if (b) {
      const a = b.dataset.stu;
      if (a === 'close') return dlg.close();
      if (a === 'type') { MK.selectTile(cur); MK.openCatalog(); return; }
      if (a === 'auto') { if (!leaf || !leaf.visual) return; let n = 0; const all = modelFields(); change(v => { rolesOf(v).forEach(r => { if (((v.roles || {})[r.key] || []).length) return; const s = MK_APPMODE.suggestFor(v, r, all); if (!s.length || s[0].s < (r.req ? 1.5 : 3)) return; if (assign(v, r, s[0].f)) n++; }); }, null, () => { flash = n ? t('st.filled', { n }) : t('st.noSugg'); }); return; }
      if (a === 'alt') { MK.selectTile(cur); MK_APPMODE.addAlt(); return; }
      if (a === 'altdrop') { MK.selectTile(cur); MK_APPMODE.dropAlt(); return; }
    }
    const al = tg.closest('[data-stualt]'); if (al && leaf) { active = null; change((v, lf) => { MK_APPMODE.switchAlt(lf, +al.dataset.stualt); }); return; }
    const rm = tg.closest('[data-sturm]'); if (rm) { const p = rm.dataset.sturm.split(':'); active = p[0]; change(v => { const l = (v.roles || {})[p[0]]; if (l) { l.splice(+p[1], 1); if (!l.length) delete v.roles[p[0]]; } }); return; }
    const sgb = tg.closest('[data-stusg]'); if (sgb) { let f = null; try { f = JSON.parse(sgb.dataset.stusgf); } catch (err) { f = null; } if (!f) return; const key = sgb.dataset.stusg; change(v => { const r = rolesOf(v).find(x => x.key === key); if (r) assign(v, r, f); }); return; }
    const fb = tg.closest('[data-stufield]'); if (fb && leaf && leaf.visual) {
      let f = null; try { f = JSON.parse(fb.dataset.stufield); } catch (err) { f = null; } if (!f) return;
      const v = leaf.visual, roles = rolesOf(v);
      let r = roles.find(x => x.key === active && fits(x, f)) || roles.find(x => fits(x, f) && ((v.roles || {})[x.key] || []).length < x.max);
      if (!r) { flash = t('st.noFit'); render(); return; }
      // danach zur nächsten leeren Pflichtrolle weitergehen
      change(vv => { assign(vv, r, f); }, t('st.assigned', { f: f.name, r: r.label }), () => { const nv = leafOf().visual, nxt = rolesOf(nv).find(x => x.req && x.key !== r.key && !((nv.roles || {})[x.key] || []).length) || null; active = nxt ? nxt.key : r.key; });
      return;
    }
    const role = tg.closest('[data-sturole]'); if (role) { active = role.dataset.sturole; render(); }
  });
  dlg.addEventListener('keydown', e => { const role = e.target.closest && e.target.closest('[data-sturole]'); if (role && e.target === role && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); active = role.dataset.sturole; render(); } });
  dlg.addEventListener('input', e => {
    const x = e.target;
    if (x.id === 'stuQ') { q = x.value; render(); return; }
    const leaf = leafOf(); if (!leaf || !leaf.visual) return; const v = leaf.visual;
    if (x.dataset.stutext === 'title') { v.title = x.value; if (v.dflt) delete v.dflt.title; $('#stuPt', dlg).textContent = x.value || defOf(v).label; }
    else if (x.dataset.stutext === 'sub') { v.sub = x.value; if (v.dflt) delete v.dflt.sub; $('#stuPs', dlg).textContent = x.value; }
    else if (x.dataset.stutext === 'message') { setAn(v, 'message', x.value); $('#stuPm', dlg).textContent = x.value; }
    else return;
    MK.persist(); clearTimeout(pvTimer); pvTimer = setTimeout(() => { MK.render({ inspector: false }); }, 250);
  });
  dlg.addEventListener('change', e => {
    const x = e.target;
    if (x.dataset.stutext) { MK.commit({ keep: true }); return; }
    if (x.dataset.stuset === 'scenario') return change(v => { v.scenario = x.value; });
    if (x.dataset.stuset === 'polarity') return change(v => setAn(v, 'polarity', x.value));
    if (x.dataset.stuset === 'sort') return change(v => setAn(v, 'sort', x.value === 'none' ? '' : (x.value === 'deltaDesc' ? { by: 'delta', dir: 'desc' } : { by: 'value', dir: x.value === 'valAsc' ? 'asc' : 'desc' })));
    if (x.dataset.stuset === 'topN') return change(v => setAn(v, 'topN', x.value ? +x.value : ''));
    if (x.dataset.studk) return change(v => { const k = $$('[data-studk]', dlg).filter(c => c.checked).map(c => c.dataset.studk); setAn(v, 'deltaKind', k.length === 2 ? '' : k); });
    if (x.dataset.stuan) return change(v => setAn(v, x.dataset.stuan, x.checked));
    if (x.dataset.stuck) return change(v => { const o = CAT.ckOptsFor(v.kind).find(z => z.key === x.dataset.stuck); if (!o) return; const p = v.ckProps = v.ckProps || {}; if (x.value === o.def) delete p[o.key]; else p[o.key] = x.value; if (!Object.keys(p).length) delete v.ckProps; });
  });
  // Ziehen: Feld auf eine Rolle
  dlg.addEventListener('dragstart', e => { const fb = e.target.closest && e.target.closest('[data-stufield]'); if (fb && e.dataTransfer) { e.dataTransfer.setData('application/mk-stufield', fb.dataset.stufield); e.dataTransfer.effectAllowed = 'copy'; } });
  dlg.addEventListener('dragover', e => { const r = e.target.closest && e.target.closest('[data-sturole]'); if (r) { e.preventDefault(); $$('.stu-role.over', dlg).forEach(x => x !== r && x.classList.remove('over')); r.classList.add('over'); } });
  dlg.addEventListener('dragleave', e => { const r = e.target.closest && e.target.closest('[data-sturole]'); if (r && !r.contains(e.relatedTarget)) r.classList.remove('over'); });
  dlg.addEventListener('drop', e => {
    const r = e.target.closest && e.target.closest('[data-sturole]'); if (!r) return; e.preventDefault();
    let f = null; try { f = JSON.parse(e.dataTransfer.getData('application/mk-stufield')); } catch (err) { f = null; } if (!f) return;
    const key = r.dataset.sturole; const leaf = leafOf(); if (!leaf || !leaf.visual) return; const role = rolesOf(leaf.visual).find(x => x.key === key);
    if (!role || !fits(role, f)) { flash = t('st.noFit'); render(); return; }
    active = key; change(v => { assign(v, role, f); }, t('st.assigned', { f: f.name, r: role.label }));
  });
  // Jede Änderung am Projekt (auch Typwechsel über die Typauswahl) zeichnet den Arbeitsbereich neu
  window.addEventListener('mk:rendered', () => { if (dlg.open && !hold) render(); });
  window.addEventListener('resize', () => { if (dlg.open) { clearTimeout(pvTimer); pvTimer = setTimeout(drawPreview, 120); } });
  I.onChange(() => { if (dlg.open) render(); });

  function open(id) {
    const leaf = MK.leaves(MK.page().layout).find(l => l.id === (id || MK.sel)); if (!leaf) return false;
    if (document.body.classList.contains('present')) return false;
    if (MK.focusId) MK.unfocusTile();
    cur = leaf.id; active = null; q = ''; flash = null; MK.selectTile(cur);
    render(); if (!dlg.open) dlg.showModal(); setTimeout(drawPreview, 30);
    return true;
  }
  window.MK_STUDIO = { open, close() { if (dlg.open) dlg.close(); }, get open_() { return dlg.open; }, render };
})();
