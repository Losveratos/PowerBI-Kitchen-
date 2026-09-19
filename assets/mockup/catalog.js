/* MockupKitchen · Visual-Katalog
 * Jeder Eintrag beschreibt einen Kachel-Typ: Datenrollen (Mockup-Vokabular), mögliche Engines
 * (ck = ChartKitchen byDatenWG Custom Visual, native = Power-BI-Standardvisual, deneb = Deneb/Vega),
 * die ChartKitchen-Typ-ID und das Mapping der Mockup-Rollen auf pbir-Datenrollen des nativen Visuals.
 * Rollen-Vokabular: category, subcategory, series, ac, ref, fc, values, rows, columns, x, y, size,
 * indicator, goal, target, start, end, text, url, field.
 *
 * Zweisprachigkeit: IDs, Rollen-Schlüssel und Gruppen-IDs sind stabil und wandern unverändert in den
 * Export. Nur die Anzeige (label, group, note, Vorlagen-Texte, Demo-Beschreibungen) kommt über
 * MK_I18N und wird als Getter aufgelöst, damit bestehender Code weiterhin Strings bekommt.
 */
(function () {
  const T = (key, vars) => (window.MK_I18N ? window.MK_I18N.t(key, vars) : key);
  const HAS = key => !!(window.MK_I18N && window.MK_I18N.has(key));
  // Eigenschaft als sprachabhängigen Getter anlegen (Spread kopiert Getter nicht – dafür gibt es RX)
  const lazy = (obj, prop, fn) => { Object.defineProperty(obj, prop, { get: fn, enumerable: true, configurable: true }); return obj; };

  // Rollendefinition mit übersetztem Label. labelKey zeigt in den i18n-Zweig role.*
  function role(key, labelKey, kind, req, max) {
    return lazy({ key, kind, req, max, labelKey }, 'label', function () { return T('role.' + this.labelKey); });
  }
  // Rolle abwandeln, ohne den Label-Getter zu verlieren (ersetzt das frühere { ...R.x, … })
  function RX(base, over) {
    const o = {};
    Object.defineProperties(o, Object.getOwnPropertyDescriptors(base));
    Object.keys(over || {}).forEach(k => {
      if (k === 'labelKey') { o.labelKey = over.labelKey; }
      else o[k] = over[k];
    });
    return o;
  }

  const R = {
    category:    role('category',    'category',   'column',  true,  1),
    category2:   role('subcategory', 'category2',  'column',  false, 1),
    time:        role('category',    'time',       'column',  true,  1),
    series:      role('series',      'series',     'column',  false, 1),
    ac:          role('ac',          'ac',         'measure', true,  1),
    ref:         role('ref',         'ref',        'measure', false, 2),
    refReq:      role('ref',         'ref',        'measure', true,  2),
    fc:          role('fc',          'fc',         'column',  false, 1),
    values:      role('values',      'values',     'measure', true,  12),
    valuesAny:   role('values',      'valuesAny',  'any',     true,  20),
    rows:        role('rows',        'rows',       'column',  true,  4),
    cols:        role('columns',     'cols',       'column',  false, 3),
    x:           role('x',           'x',          'measure', true,  1),
    y:           role('y',           'y',          'measure', true,  1),
    size:        role('size',        'size',       'measure', false, 1),
    indicator:   role('indicator',   'indicator',  'measure', true,  1),
    goal:        role('goal',        'goal',       'measure', false, 1),
    start:       role('start',       'start',      'column',  true,  1),
    end:         role('end',         'end',        'column',  true,  1),
    field:       role('field',       'field',      'column',  true,  1),
    text:        role('text',        'text',       'any',     false, 1),
    geo:         role('category',    'geo',        'column',  true,  1),
    rowType:     role('rowType',     'rowType',    'column',  false, 1),
  };

  // Rollen einer konkreten Kachel: Katalogrollen plus Darstellungsvarianten.
  // Small Multiples → Zusatzrolle „Small Multiples nach"; Feldparameter → die Achsenrolle nimmt mehrere Felder (die Optionen des Parameters).
  const R_MULT = role('multiples', 'multiples', 'column', false, 1);
  const NO_VARIANTS = ['multiples', 'map', 'treemap', 'decomp', 'pie', 'gauge', 'ndonut'];
  const hasCategory = def => !!(def && def.roles && def.roles.some(r => r.key === 'category' && r.kind === 'column'));
  const variantsFor = def => !!(def && hasCategory(def) && !NO_VARIANTS.includes(def.id));
  function rolesFor(def, v) {
    const base = (def && def.roles) || []; const a = (v && v.analysis) || {};
    if (!variantsFor(def) || (!a.smallMultiples && !a.fieldParam)) return base;
    const out = base.map(r => (a.fieldParam && r.key === 'category' && r.kind === 'column') ? RX(r, { max: Math.max(r.max, 8) }) : r);
    if (a.smallMultiples && !out.some(r => r.key === 'multiples')) out.push(R_MULT);
    return out;
  }

  // Kurzform: K(id, groupId, {engines, ck, native:{type, map}, roles, warnNote, sketch})
  // label kommt aus i18n (viz.<id>.label), note aus viz.<id>.note (falls vorhanden).
  function K(id, groupId, o) {
    const k = Object.assign({ id, groupId, engines: ['ck', 'native'], engine: 'ck', ck: id, sketch: id, roles: [], warnNote: false, noModeAs: null }, o);
    lazy(k, 'label', () => T('viz.' + id + '.label'));
    lazy(k, 'group', () => T('group.' + groupId));
    lazy(k, 'note', function () {
      if (HAS('viz.' + id + '.note')) return T('viz.' + id + '.note');
      return this.noModeAs ? T('viz.noMode.' + this.noModeAs) : '';
    });
    return k;
  }
  const STD = [R.category, R.ac, R.ref, R.fc];               // Standard-IBCS-Vergleich
  const TIME = [R.time, R.ac, R.ref, R.fc];

  const CATALOG = [
    // ---------- IBCS · Vergleich (Struktur) ----------
    K('columns', 'cols', { roles: TIME, native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('kombi', 'cols', { roles: TIME, engines: ['ck', 'deneb'], native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('colline', 'cols', { roles: TIME, native: { type: 'lineClusteredColumnComboChart', map: { category: 'Category', ac: 'Y', ref: 'Y2' } } }),
    K('absvar', 'cols', { roles: [R.category, R.ac, R.refReq], native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y' } } }),
    K('relvar', 'cols', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y' } } }),
    K('bars', 'cols', { roles: STD, native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('barskombi', 'cols', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('bullet', 'cols', { roles: [R.category, R.ac, R.refReq], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('tornado', 'cols', { roles: [R.category, R.ac, R.refReq], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('dotplot', 'cols', { roles: [R.category, R.ac, R.ref], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('pareto', 'cols', { roles: [R.category, R.ac], native: { type: 'lineClusteredColumnComboChart', map: { category: 'Category', ac: 'Y' } } }),
    K('stackcol', 'cols', { roles: [R.time, R.series, R.ac], native: { type: 'columnChart', map: { category: 'Category', series: 'Series', ac: 'Y' } } }),
    K('stackbar', 'cols', { roles: [R.category, R.series, R.ac], native: { type: 'barChart', map: { category: 'Category', series: 'Series', ac: 'Y' } } }),
    K('marimekko', 'cols', { roles: [R.category, R.series, R.ac], engines: ['ck', 'deneb'], native: null }),

    // ---------- IBCS · Zeit & Verlauf ----------
    K('line', 'time', { roles: TIME, native: { type: 'lineChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('varint', 'time', { roles: [R.time, R.ac, R.refReq, R.fc], engines: ['ck', 'deneb'], native: null }),
    K('slope', 'time', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'lineChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('fan', 'time', { roles: [R.time, R.ac, R.ref, R.fc], engines: ['ck', 'deneb'], native: { type: 'lineChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('zchart', 'time', { roles: [R.time, R.ac], engines: ['ck', 'deneb'], native: { type: 'lineChart', map: { category: 'Category', ac: 'Y' } } }),
    K('multiples', 'time', { roles: [R.time, RX(R.category2, { key: 'series', labelKey: 'facet', req: true }), R.ac, R.ref], native: { type: 'clusteredColumnChart', map: { category: 'Category', series: 'Rows', ac: 'Y', ref: 'Y' } } }),
    K('area', 'time', { roles: [R.time, R.ac, R.series], engines: ['native'], engine: 'native', ck: null, warnNote: true, native: { type: 'areaChart', map: { category: 'Category', ac: 'Y', series: 'Series' } } }),

    // ---------- IBCS · Wasserfall & Brücke ----------
    K('waterfall', 'struct', { roles: [R.category, R.ac], native: { type: 'waterfallChart', map: { category: 'Category', ac: 'Y' } } }),
    K('wfint', 'struct', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: null }),
    K('wfkombi', 'struct', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: null }),
    K('bridge', 'struct', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'waterfallChart', map: { category: 'Category', ac: 'Y' } } }),
    K('tree', 'struct', { roles: [R.category, R.category2, R.ac, R.ref], engines: ['ck', 'native'], native: { type: 'decompositionTreeVisual', map: { ac: 'Analyze', category: 'ExplainBy', subcategory: 'ExplainBy' } } }),
    K('heatmap', 'struct', { roles: [R.category, RX(R.category2, { req: true }), R.ac, R.ref], engines: ['ck', 'deneb', 'native'], native: { type: 'pivotTable', map: { category: 'Rows', subcategory: 'Columns', ac: 'Values' } } }),
    K('scatter', 'struct', { roles: [R.category, R.x, R.y, R.size], native: { type: 'scatterChart', map: { category: 'Category', x: 'X', y: 'Y', size: 'Size' } } }),
    K('boxplot', 'struct', { roles: [R.category, RX(R.ac, { labelKey: 'valueCol', kind: 'any' })], engines: ['ck', 'deneb'], native: null }),
    K('gantt', 'struct', { roles: [R.category, R.start, R.end, R.series], engines: ['custom', 'deneb'], engine: 'custom', ck: null, native: null, customVisual: { name: 'dataKitchenGantt', guid: 'dataKitchenGanttD7C41F0A93E24B6BA1F3C5E8A20D9B44', map: { category: 'task', start: 'start', end: 'end', series: 'phase' } } }),

    // ---------- Tabellen & KPI ----------
    K('kpi', 'table', { roles: [R.indicator, R.goal, RX(R.time, { req: false, labelKey: 'timeSpark' })], native: { type: 'card', map: { indicator: 'Values' } } }),
    K('card', 'table', { roles: [R.indicator], engines: ['native'], engine: 'native', ck: null, native: { type: 'card', map: { indicator: 'Values' } } }),
    K('multirow', 'table', { roles: [R.values], engines: ['native'], engine: 'native', ck: null, native: { type: 'multiRowCard', map: { values: 'Values' } } }),
    K('table', 'table', { roles: [R.rows, R.ac, R.ref], native: { type: 'tableEx', map: { rows: 'Values', ac: 'Values', ref: 'Values' } } }),
    K('pnl', 'table', { roles: [R.rows, R.ac, RX(R.ref, { max: 3 }), RX(R.fc, { kind: 'measure', labelKey: 'fcM' }), R.rowType], engines: ['custom'], engine: 'custom', ck: null, native: null, customVisual: { name: 'pnlByDatenWG', guid: 'pnlByDatenWG3F9A7D2C51E64B08A1C4E7F0B92D6358', map: { rows: 'levels', ac: 'ac', ref: { py: /(py|vj|vorjahr|prior|previous|ly)/i, pl: /(pl|bu|budget|plan|target)/i, fc: /(fc|forecast|prognose)/i }, fc: 'fc', rowType: 'rowType' } } }),
    K('sparktable', 'table', { roles: [R.rows, R.time, R.ac, R.ref], engines: ['ck', 'deneb'], native: { type: 'tableEx', map: { rows: 'Values', ac: 'Values' } } }),
    K('matrix', 'table', { roles: [R.rows, R.cols, R.values], engines: ['native'], engine: 'native', ck: null, native: { type: 'pivotTable', map: { rows: 'Rows', columns: 'Columns', values: 'Values' } } }),
    K('gauge', 'table', { roles: [R.indicator, R.goal], engines: ['native'], engine: 'native', ck: null, warnNote: true, native: { type: 'gauge', map: { indicator: 'Y', goal: 'TargetValue' } } }),

    // ---------- Native Sonstige ----------
    // Klassiker für Berichte, die nur mit nativen Visuals arbeiten: ohne Szenario-Notation, Legende optional
    K('ncolumn', 'native', { roles: [R.category, R.series, RX(R.values, { max: 5 })], engines: ['native'], engine: 'native', ck: null, plain: true, sketch: 'columns', native: { type: 'clusteredColumnChart', map: { category: 'Category', series: 'Series', values: 'Y' } } }),
    K('nbar', 'native', { roles: [R.category, R.series, RX(R.values, { max: 5 })], engines: ['native'], engine: 'native', ck: null, plain: true, sketch: 'bars', native: { type: 'clusteredBarChart', map: { category: 'Category', series: 'Series', values: 'Y' } } }),
    K('nline', 'native', { roles: [R.time, R.series, RX(R.values, { max: 5 })], engines: ['native'], engine: 'native', ck: null, plain: true, sketch: 'line', native: { type: 'lineChart', map: { category: 'Category', series: 'Series', values: 'Y' } } }),
    K('ndonut', 'native', { roles: [R.category, R.ac], engines: ['native'], engine: 'native', ck: null, plain: true, sketch: 'donut', native: { type: 'donutChart', map: { category: 'Category', ac: 'Y' } } }),
    K('pie', 'native', { roles: [R.category, R.ac], engines: ['native'], engine: 'native', ck: null, warnNote: true, native: { type: 'pieChart', map: { category: 'Category', ac: 'Y' } } }),
    K('treemap', 'native', { roles: [R.category, R.ac], engines: ['native'], engine: 'native', ck: null, native: { type: 'treemap', map: { category: 'Group', ac: 'Values' } } }),
    K('decomp', 'native', { roles: [R.ac, RX(R.category, { key: 'category', labelKey: 'explainBy', max: 6 })], engines: ['native'], engine: 'native', ck: null, native: { type: 'decompositionTreeVisual', map: { ac: 'Analyze', category: 'ExplainBy' } } }),
    K('map', 'native', { roles: [R.geo, R.size], engines: ['native'], engine: 'native', ck: null, native: { type: 'map', map: { category: 'Category', size: 'Size' } } }),
    K('deneb', 'native', { roles: [R.valuesAny], engines: ['deneb'], engine: 'deneb', ck: null, native: null }),

    // ---------- Steuerung & Text ----------
    K('slicer', 'ctrl', { roles: [R.field], engines: ['native'], engine: 'native', ck: null, native: { type: 'slicer', map: { field: 'Values' } } }),
    K('text', 'ctrl', { roles: [R.text], engines: ['native'], engine: 'native', ck: null, native: { type: 'textbox', map: {} } }),
    K('image', 'ctrl', { roles: [], engines: ['native'], engine: 'native', ck: null, native: { type: 'image', map: {} } }),
    K('button', 'ctrl', { roles: [], engines: ['native'], engine: 'native', ck: null, native: { type: 'actionButton', map: {} } }),
  ];

  // ChartKitchen-Modi (chart.orientation laut Feldvertrag). Typen ohne Modus bekommen keine ck-Engine (Review: Engine-Whitelist).
  const CK_MODE = {
    columns: 'columns', kombi: 'columns', colline: 'columns', absvar: 'columns', relvar: 'columns', stackcol: 'columns', multiples: 'columns',
    bars: 'bars', barskombi: 'bars', bullet: 'bars', tornado: 'bars', stackbar: 'bars',
    dotplot: 'dumbbell', pareto: 'pareto', line: 'line', fan: 'line', zchart: 'line', slope: 'slope',
    varint: 'intwaterfall', wfint: 'intwaterfall', waterfall: 'waterfall', wfkombi: 'waterfall', bridge: 'catbridge',
    kpi: 'cards', table: 'table', sparktable: 'table', heatmap: 'table',
  };
  CATALOG.forEach(k => {
    k.ckMode = CK_MODE[k.id] || null;
    if (!k.ckMode) {
      k.ck = null; k.engines = k.engines.filter(e => e !== 'ck');
      if (!k.engines.length) k.engines = k.native ? ['native'] : ['deneb'];
      if (!k.engines.includes(k.engine)) k.engine = k.engines[0];
      // note ist ein Getter: statt zuzuweisen nur merken, worauf der Hinweis hinausläuft
      if (!HAS('viz.' + k.id + '.note')) k.noModeAs = k.engines[0] === 'deneb' ? 'deneb' : 'native';
    }
  });
  // Polarität raten: Kennzahlen, bei denen „kleiner = besser" gilt (Review Data-Viz: Kostenüberschreitung darf nicht grün sein)
  const LOWER_RX = /kosten|cost|aufwand|expense|ausgaben|churn|fehler|defect|reklamation|retour|return|verlust|loss|dso|durchlauf|lead ?time|risiko|risk|ausfall|downtime|abgang|attrition|schulden|debt/i;
  const polarityFor = name => LOWER_RX.test(String(name || '')) ? 'lower' : 'higher';

  const BY_ID = {};
  CATALOG.forEach(k => { BY_ID[k.id] = k; });
  const GROUP_IDS = [];
  CATALOG.forEach(k => { if (!GROUP_IDS.includes(k.groupId)) GROUP_IDS.push(k.groupId); });

  // Engine-Beschriftungen sprachabhängig (die Schlüssel ck/native/deneb bleiben)
  const ENGINE_LABEL = {};
  ['ck', 'native', 'deneb', 'custom'].forEach(e => lazy(ENGINE_LABEL, e, () => T('engine.' + e)));

  // Demo-Modell: kleines Beispielmodell für Workshops ohne TMDL. Gleiche Struktur wie der TMDL-Parser liefert.
  const col_ = (name, type, desc) => ({ name, kind: 'column', type, desc: desc || '', hidden: false, format: '' });
  const mea_ = (name, format, desc) => ({ name, kind: 'measure', type: 'measure', desc: desc || '', hidden: false, format: format || '#,##0' });
  // Als Funktion, damit die Beschreibungen in der aktuell gewählten Sprache entstehen. Fünf typische Modelle.
  const DEMO_IDS = ['controlling', 'sales', 'hr', 'marketing', 'pnl'];
  const dimDate = () => ({ name: 'DimDate', desc: T('demo.date'), columns: [col_('Date', 'dateTime'), col_('Year', 'int64'), col_('Quarter', 'string'), col_('Month', 'string', T('demo.month')), col_('MonthKey', 'int64'), col_('IsForecast', 'int64', T('demo.isForecast'))], measures: [] });
  const scen = () => [mea_('AC', '#,##0', T('demo.ac')), mea_('PY', '#,##0', T('demo.py')), mea_('PL', '#,##0', T('demo.pl')), mea_('FC', '#,##0', T('demo.fc')), mea_('BU', '#,##0', T('demo.bu')), mea_('ΔPL', '#,##0', 'AC − PL'), mea_('ΔPL%', '0.0%', '(AC − PL) / PL'), mea_('ΔPY', '#,##0', 'AC − PY'), mea_('ΔPY%', '0.0%', '(AC − PY) / PY')];
  function demoModel(id) {
    id = DEMO_IDS.includes(id) ? id : 'controlling';
    const src = T('demo.sourceOf', { m: T('demo.models.' + id) });
    if (id === 'sales') return { source: src, tables: [
      dimDate(),
      { name: 'DimProduct', desc: T('demo.products'), columns: [col_('Product', 'string'), col_('Category', 'string', T('demo.productLine')), col_('Brand', 'string')], measures: [] },
      { name: 'DimRegion', desc: T('demo.regions'), columns: [col_('Region', 'string'), col_('Country', 'string'), col_('SalesOffice', 'string')], measures: [] },
      { name: 'DimCustomer', desc: T('demo.customers'), columns: [col_('Customer', 'string'), col_('Segment', 'string'), col_('KeyAccount', 'string'), col_('Industry', 'string')], measures: [] },
      { name: 'DimSalesRep', desc: T('demo.salesReps'), columns: [col_('SalesRep', 'string'), col_('Team', 'string')], measures: [] },
      { name: '_Measures', desc: T('demo.measures'), columns: [], measures: scen().concat([mea_('Umsatz', '#,##0'), mea_('Auftragseingang', '#,##0'), mea_('Aufträge', '#,##0'), mea_('Ø Auftragswert', '#,##0', T('demo.avgOrder')), mea_('Marge', '#,##0', T('demo.margin')), mea_('Marge%', '0.0%'), mea_('Menge', '#,##0'), mea_('Kunden', '#,##0'), mea_('Neukunden', '#,##0'), mea_('Pipeline', '#,##0'), mea_('Win-Rate%', '0.0%'), mea_('Retouren%', '0.0%'), mea_('Rabatt%', '0.0%')]) },
    ] };
    if (id === 'hr') return { source: src, tables: [
      dimDate(),
      { name: 'DimEmployee', desc: T('demo.employees'), columns: [col_('Employee', 'string'), col_('Department', 'string'), col_('Location', 'string'), col_('ContractType', 'string'), col_('Gender', 'string'), col_('AgeGroup', 'string'), col_('Tenure', 'string')], measures: [] },
      { name: 'DimOrgUnit', desc: T('demo.orgUnits'), columns: [col_('OrgUnit', 'string'), col_('Division', 'string'), col_('CostCenter', 'string')], measures: [] },
      { name: '_Measures', desc: T('demo.measures'), columns: [], measures: [mea_('Headcount', '#,##0'), mea_('FTE', '#,##0.0'), mea_('Eintritte', '#,##0'), mea_('Austritte', '#,##0'), mea_('Fluktuation%', '0.0%'), mea_('Krankenquote%', '0.0%'), mea_('Überstunden', '#,##0'), mea_('Personalkosten AC', '#,##0'), mea_('Personalkosten PL', '#,##0'), mea_('Personalkosten PY', '#,##0'), mea_('Vakanzen', '#,##0'), mea_('Time-to-Hire', '#,##0'), mea_('Weiterbildungstage', '#,##0.0'), mea_('Frauenanteil%', '0.0%'), mea_('Ø Alter', '#,##0.0')] },
    ] };
    if (id === 'marketing') return { source: src, tables: [
      dimDate(),
      { name: 'DimChannel', desc: T('demo.channels'), columns: [col_('Channel', 'string'), col_('Campaign', 'string'), col_('Source', 'string'), col_('Medium', 'string'), col_('Device', 'string')], measures: [] },
      { name: 'DimLanding', desc: T('demo.landing'), columns: [col_('LandingPage', 'string'), col_('Funnel', 'string'), col_('Country', 'string')], measures: [] },
      { name: '_Measures', desc: T('demo.measures'), columns: [], measures: [mea_('Sessions', '#,##0'), mea_('Visitors', '#,##0'), mea_('Impressions', '#,##0'), mea_('Clicks', '#,##0'), mea_('CTR%', '0.00%'), mea_('Conversions', '#,##0'), mea_('Conversion-Rate%', '0.00%'), mea_('Bounce-Rate%', '0.0%'), mea_('Ad Spend', '#,##0'), mea_('Ad Spend PL', '#,##0'), mea_('CPC', '#,##0.00'), mea_('CPA', '#,##0.00'), mea_('ROAS', '#,##0.0'), mea_('Umsatz', '#,##0'), mea_('Umsatz PY', '#,##0'), mea_('Newsletter-Anmeldungen', '#,##0'), mea_('Ø Sitzungsdauer', '#,##0')] },
    ] };
    if (id === 'pnl') return { source: src, tables: [
      dimDate(),
      { name: 'DimAccount', desc: T('demo.pnlAccounts'), columns: [col_('L1', 'string'), col_('L2', 'string'), col_('L3', 'string'), col_('Account', 'string', T('demo.accountItem')), col_('RowType', 'string', T('demo.rowType')), col_('Sign', 'int64', T('demo.sign')), col_('SortKey', 'int64')], measures: [] },
      { name: 'DimCostCenter', desc: T('demo.costCenters'), columns: [col_('CostCenter', 'string'), col_('Area', 'string')], measures: [] },
      { name: 'DimCompany', desc: T('demo.companies'), columns: [col_('Company', 'string'), col_('Country', 'string'), col_('Currency', 'string')], measures: [] },
      { name: '_Measures', desc: T('demo.measures'), columns: [], measures: scen().concat([mea_('Umsatzerlöse', '#,##0'), mea_('Materialaufwand', '#,##0'), mea_('Rohertrag', '#,##0'), mea_('Personalaufwand', '#,##0'), mea_('Sonstige Aufwendungen', '#,##0'), mea_('EBITDA', '#,##0'), mea_('Abschreibungen', '#,##0'), mea_('EBIT', '#,##0'), mea_('Finanzergebnis', '#,##0'), mea_('Steuern', '#,##0'), mea_('Jahresüberschuss', '#,##0'), mea_('EBITDA-Marge%', '0.0%')]) },
    ] };
    return { source: src, tables: [
      dimDate(),
      { name: 'DimProduct', desc: T('demo.products'), columns: [col_('Product', 'string'), col_('Category', 'string', T('demo.productLine')), col_('Brand', 'string')], measures: [] },
      { name: 'DimRegion', desc: T('demo.regions'), columns: [col_('Region', 'string'), col_('Country', 'string'), col_('SalesOffice', 'string')], measures: [] },
      { name: 'DimCustomer', desc: T('demo.customers'), columns: [col_('Customer', 'string'), col_('Segment', 'string'), col_('KeyAccount', 'string')], measures: [] },
      { name: 'DimAccount', desc: T('demo.accounts'), columns: [col_('Account', 'string', T('demo.accountItem')), col_('AccountGroup', 'string'), col_('SortKey', 'int64')], measures: [] },
      { name: '_Measures', desc: T('demo.measures'), columns: [], measures: scen().concat([mea_('Umsatz', '#,##0'), mea_('Kosten', '#,##0'), mea_('Marge', '#,##0', T('demo.margin')), mea_('Marge%', '0.0%'), mea_('Menge', '#,##0'), mea_('Aufträge', '#,##0'), mea_('Kunden', '#,##0'), mea_('Ø Auftragswert', '#,##0', T('demo.avgOrder'))]) },
    ] };
  }

  // Seitenvorlagen: Layout-Bäume für den Inhaltsbereich. leaf(kind, title, roles, opts) / row([...]) / col([...]) mit Gewichten.
  // roles: { roleKey: ['Tabelle.Feld', ...] } – wird beim Anwenden gegen das geladene Modell aufgelöst (fehlende Felder bleiben leer).
  // Feldnamen bleiben in jeder Sprache gleich (sie sind Modell-Referenzen); übersetzt werden nur Titel und Notizen.
  const M = f => '_Measures.' + f;
  const TT = k => T('tpl.t.' + k);
  const KPI = (title, ac, ref) => leaf('kpi', title, { indicator: [M(ac)], goal: ref ? [M(ref)] : [], category: ['DimDate.Month'] });
  const TPL = [
    { id: 'kpi4-main-detail', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Marge', 'Marge', 'PL')], [1, KPI('Kosten', 'Kosten', 'PL')], [1, KPI('Aufträge', 'Aufträge', 'PY')]])],
        [4, row([[2, leaf('varint', TT('revMonthAcFcPl'), { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PL')], fc: ['DimDate.IsForecast'] }, { scenario: 'AC/PL/FC', sub: TT('inKEUR') })], [1, leaf('bars', TT('dPlByLine'), { category: ['DimProduct.Category'], ac: [M('AC')], ref: [M('PL')] }, { analysis: { sort: { by: 'delta', dir: 'desc' } } })]])]
      ]) },
    { id: 'exec', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PY')], [1, KPI('Marge %', 'Marge%', 'PL')], [1, KPI('Kunden', 'Kunden', 'PY')], [1, KPI('Ø Auftragswert', 'Ø Auftragswert', 'PY')]])],
        [3, row([[2, leaf('bridge', TT('bridgePyAcRegion'), { category: ['DimRegion.Region'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('text', TT('keyMessage'), {}, { notes: TT('keyMessageNote') })]])],
        [2, row([[1, leaf('kombi', TT('revMonthAcPl'), { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PL')] })], [1, leaf('table', TT('topProducts'), { rows: ['DimProduct.Product'], ac: [M('AC')], ref: [M('PL')] })]])]
      ]) },
    { id: 'kpi4-2x2', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Marge', 'Marge', 'PL')], [1, KPI('Kosten', 'Kosten', 'PL')], [1, KPI('Aufträge', 'Aufträge', 'PY')]])],
        [4, col([[1, row([[1, leaf('kombi', TT('revByMonth'), { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PL')] })], [1, leaf('bars', TT('revByRegion'), { category: ['DimRegion.Region'], ac: [M('AC')], ref: [M('PL')] })]])], [1, row([[1, leaf('line', TT('trend12'), { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('table', TT('topProducts'), { rows: ['DimProduct.Product'], ac: [M('AC')], ref: [M('PL')] })]])]])]
      ]) },
    { id: 'pnl', tree: () => col([
        [4, row([[1, leaf('waterfall', TT('pnlWaterfall'), { category: ['DimAccount.Account'], ac: [M('AC')] })], [1, leaf('table', TT('pnlItems'), { rows: ['DimAccount.Account'], ac: [M('AC')], ref: [M('PL')] })]])],
        [1, leaf('text', TT('comment'), {}, { notes: TT('commentNote') })]
      ]) },
    { id: 'sales', tree: () => col([
        [1, leaf('bridge', TT('bridgePyAcLine'), { category: ['DimProduct.Category'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })],
        [1, row([[1, leaf('bars', TT('revTop10Customers'), { category: ['DimCustomer.Customer'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY', analysis: { topN: 10, sort: { by: 'value', dir: 'desc' } } })], [1, leaf('scatter', TT('qtyVsMargin'), { category: ['DimProduct.Product'], x: [M('Menge')], y: [M('Marge%')], size: [M('Umsatz')] })], [1, leaf('heatmap', TT('regionByLine'), { category: ['DimRegion.Region'], subcategory: ['DimProduct.Category'], ac: [M('AC')], ref: [M('PL')] })]])]
      ]) },
    { id: 'drill', tree: () => col([
        [1, row([[2, leaf('text', TT('detailLine'), {}, { notes: TT('detailLineNote') })], [1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Marge %', 'Marge%', 'PL')]])],
        [3, row([[3, leaf('table', TT('lineItems'), { rows: ['DimProduct.Product', 'DimCustomer.Customer'], ac: [M('AC')], ref: [M('PL')] })], [2, leaf('line', TT('trend24'), { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })]])]
      ]) },
    { id: 'cost', tree: () => col([
        [1, row([[1, KPI('Kosten', 'Kosten', 'PL')], [1, KPI('Δ PL', 'ΔPL', null)], [1, KPI('Δ PL %', 'ΔPL%', null)]])],
        [3, row([[2, leaf('multiples', TT('costByAccountMonth'), { category: ['DimDate.Month'], series: ['DimAccount.AccountGroup'], ac: [M('AC')], ref: [M('PL')] })], [1, leaf('tornado', TT('dPlByAccount'), { category: ['DimAccount.Account'], ac: [M('AC')], ref: [M('PL')] })]])]
      ]) },
    { id: 'monitoring', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Aufträge', 'Aufträge', 'PY')], [1, KPI('Kunden', 'Kunden', 'PY')]])],
        [1, row([[1, leaf('line', TT('revTrend'), { category: ['DimDate.Month'], ac: [M('Umsatz')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('line', TT('orderTrend'), { category: ['DimDate.Month'], ac: [M('Aufträge')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('line', TT('customerTrend'), { category: ['DimDate.Month'], ac: [M('Kunden')], ref: [M('PY')] }, { scenario: 'AC/PY' })]])]
      ]) },
    { id: 'empty', tree: () => col([[1, row([[1, leaf()], [1, leaf()]])], [1, row([[1, leaf()], [1, leaf()]])]]) },
    { id: 'single', tree: () => leaf() },
  ];
  // label/desc sprachabhängig nachrüsten (tpl.<id>.label / .desc)
  const TEMPLATES = TPL.map(t => {
    lazy(t, 'label', () => T('tpl.' + t.id + '.label'));
    lazy(t, 'desc', () => T('tpl.' + t.id + '.desc'));
    return t;
  });
  function leaf(kind, title, roles, opts) { return { type: 'leaf', visual: kind ? Object.assign({ kind, title: title || '', roleRefs: roles || {} }, opts || {}) : null }; }
  function row(children) { return { type: 'split', dir: 'row', children: children.map(([size, node]) => ({ size, node })) }; }
  function col(children) { return { type: 'split', dir: 'col', children: children.map(([size, node]) => ({ size, node })) }; }

  const API = { list: CATALOG, byId: BY_ID, engineLabel: ENGINE_LABEL, templates: TEMPLATES, roleDefs: R, ckMode: CK_MODE, polarityFor, groupIds: GROUP_IDS, rolesFor, variantsFor };
  // groups = Anzeige-Namen in der aktuellen Sprache; k.group liefert denselben String, damit der Filter weiter greift
  lazy(API, 'groups', () => GROUP_IDS.map(id => T('group.' + id)));
  lazy(API, 'demoModel', () => demoModel('controlling'));
  API.demoModels = DEMO_IDS.map(id => { const m = { id, build: () => demoModel(id) }; lazy(m, 'label', () => T('demo.models.' + id)); return m; });
  window.MK_CATALOG = API;
})();
