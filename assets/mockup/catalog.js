/* MockupKitchen · Visual-Katalog
 * Jeder Eintrag beschreibt einen Kachel-Typ: Datenrollen (Mockup-Vokabular), mögliche Engines
 * (ck = ChartKitchen byDatenWG Custom Visual, native = Power-BI-Standardvisual, deneb = Deneb/Vega),
 * die ChartKitchen-Typ-ID und das Mapping der Mockup-Rollen auf pbir-Datenrollen des nativen Visuals.
 * Rollen-Vokabular: category, subcategory, series, ac, ref, fc, values, rows, columns, x, y, size,
 * indicator, goal, target, start, end, text, url, field.
 */
(function () {
  const R = {
    category:    { key: 'category',    label: 'Kategorie / Achse', kind: 'column',  req: true,  max: 1 },
    category2:   { key: 'subcategory', label: 'Unterkategorie',    kind: 'column',  req: false, max: 1 },
    time:        { key: 'category',    label: 'Zeit / Periode',    kind: 'column',  req: true,  max: 1 },
    series:      { key: 'series',      label: 'Reihe / Legende',   kind: 'column',  req: false, max: 1 },
    ac:          { key: 'ac',          label: 'AC · Ist-Wert',     kind: 'measure', req: true,  max: 1 },
    ref:         { key: 'ref',         label: 'Referenz (PL / PY / BU)', kind: 'measure', req: false, max: 2 },
    refReq:      { key: 'ref',         label: 'Referenz (PL / PY / BU)', kind: 'measure', req: true,  max: 2 },
    fc:          { key: 'fc',          label: 'FC-Flag (1/0)',     kind: 'column',  req: false, max: 1 },
    values:      { key: 'values',      label: 'Werte',             kind: 'measure', req: true,  max: 12 },
    valuesAny:   { key: 'values',      label: 'Felder',            kind: 'any',     req: true,  max: 20 },
    rows:        { key: 'rows',        label: 'Zeilen',            kind: 'column',  req: true,  max: 4 },
    cols:        { key: 'columns',     label: 'Spalten',           kind: 'column',  req: false, max: 3 },
    x:           { key: 'x',           label: 'X-Wert',            kind: 'measure', req: true,  max: 1 },
    y:           { key: 'y',           label: 'Y-Wert',            kind: 'measure', req: true,  max: 1 },
    size:        { key: 'size',        label: 'Größe',             kind: 'measure', req: false, max: 1 },
    indicator:   { key: 'indicator',   label: 'Kennzahl',          kind: 'measure', req: true,  max: 1 },
    goal:        { key: 'goal',        label: 'Ziel / Referenz',   kind: 'measure', req: false, max: 1 },
    start:       { key: 'start',       label: 'Start',             kind: 'column',  req: true,  max: 1 },
    end:         { key: 'end',         label: 'Ende',              kind: 'column',  req: true,  max: 1 },
    field:       { key: 'field',       label: 'Feld',              kind: 'column',  req: true,  max: 1 },
    text:        { key: 'text',        label: 'Text (statisch oder Measure)', kind: 'any', req: false, max: 1 },
    geo:         { key: 'category',    label: 'Geo-Feld',          kind: 'column',  req: true,  max: 1 },
  };

  // Kurzform: K(id, label, group, {engines, ck, native:{type, map}, roles, note, sketch})
  function K(id, label, group, o) {
    return Object.assign({ id, label, group, engines: ['ck', 'native'], engine: 'ck', ck: id, sketch: id, roles: [], note: '' }, o);
  }
  const STD = [R.category, R.ac, R.ref, R.fc];               // Standard-IBCS-Vergleich
  const TIME = [R.time, R.ac, R.ref, R.fc];

  const CATALOG = [
    // ---------- IBCS · Vergleich (Struktur) ----------
    K('columns', 'Säulen (AC vs Referenz)', 'IBCS · Säulen & Balken', { roles: TIME, native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('kombi', 'Säulen + Δ absolut + Δ %', 'IBCS · Säulen & Balken', { roles: TIME, engines: ['ck', 'deneb'], native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('colline', 'Säulen + Linie', 'IBCS · Säulen & Balken', { roles: TIME, native: { type: 'lineClusteredColumnComboChart', map: { category: 'Category', ac: 'Y', ref: 'Y2' } } }),
    K('absvar', 'Δ absolut (Säulen)', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac, R.refReq], native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y' } }, note: 'Abweichung wird im Visual berechnet (AC − Ref).' }),
    K('relvar', 'Δ % (Pins)', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'clusteredColumnChart', map: { category: 'Category', ac: 'Y' } } }),
    K('bars', 'Balken (Kategorien, sortiert)', 'IBCS · Säulen & Balken', { roles: STD, native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('barskombi', 'Balken + Δ absolut + Δ %', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('bullet', 'Bullet (Wert vs Ziel)', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac, R.refReq], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('tornado', 'Tornado (links/rechts)', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac, R.refReq], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('dotplot', 'Punktdiagramm', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac, R.ref], native: { type: 'clusteredBarChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('pareto', 'Pareto (Balken + kumuliert)', 'IBCS · Säulen & Balken', { roles: [R.category, R.ac], native: { type: 'lineClusteredColumnComboChart', map: { category: 'Category', ac: 'Y' } } }),
    K('stackcol', 'Gestapelte Säulen', 'IBCS · Säulen & Balken', { roles: [R.time, R.series, R.ac], native: { type: 'columnChart', map: { category: 'Category', series: 'Series', ac: 'Y' } } }),
    K('stackbar', 'Gestapelte Balken', 'IBCS · Säulen & Balken', { roles: [R.category, R.series, R.ac], native: { type: 'barChart', map: { category: 'Category', series: 'Series', ac: 'Y' } } }),
    K('marimekko', 'Marimekko', 'IBCS · Säulen & Balken', { roles: [R.category, R.series, R.ac], engines: ['ck', 'deneb'], native: null }),

    // ---------- IBCS · Zeit & Verlauf ----------
    K('line', 'Linie (AC vs Referenz)', 'IBCS · Zeitverlauf', { roles: TIME, native: { type: 'lineChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('varint', 'Integrierte Varianzanalyse', 'IBCS · Zeitverlauf', { roles: [R.time, R.ac, R.refReq, R.fc], engines: ['ck', 'deneb'], native: null, note: '4 Ebenen: Δ%_YTD · Δ% · Δ-Brücke · Säulen AC/FC vs PL.' }),
    K('slope', 'Slope (2 Zeitpunkte)', 'IBCS · Zeitverlauf', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'lineChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('fan', 'Forecast-Korridor', 'IBCS · Zeitverlauf', { roles: [R.time, R.ac, R.ref, R.fc], engines: ['ck', 'deneb'], native: { type: 'lineChart', map: { category: 'Category', ac: 'Y', ref: 'Y' } } }),
    K('zchart', 'Z-Chart (Monat · YTD · gleitend)', 'IBCS · Zeitverlauf', { roles: [R.time, R.ac], engines: ['ck', 'deneb'], native: { type: 'lineChart', map: { category: 'Category', ac: 'Y' } } }),
    K('multiples', 'Small Multiples', 'IBCS · Zeitverlauf', { roles: [R.time, { ...R.category2, key: 'series', label: 'Facette (je Kachel)', req: true }, R.ac, R.ref], native: { type: 'clusteredColumnChart', map: { category: 'Category', series: 'Rows', ac: 'Y', ref: 'Y' } } }),
    K('area', 'Fläche (nativ)', 'IBCS · Zeitverlauf', { roles: [R.time, R.ac, R.series], engines: ['native'], engine: 'native', ck: null, native: { type: 'areaChart', map: { category: 'Category', ac: 'Y', series: 'Series' } }, note: 'Nicht IBCS-typisch; Linie bevorzugen.' }),

    // ---------- IBCS · Wasserfall & Brücke ----------
    K('waterfall', 'Wasserfall (vertikal)', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.ac], native: { type: 'waterfallChart', map: { category: 'Category', ac: 'Y' } } }),
    K('wfint', 'Wasserfall horizontal + Varianz', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: null }),
    K('wfkombi', 'Wasserfall + Δ', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: null }),
    K('bridge', 'Brücke (Σ Ref → Δ → Σ AC)', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.ac, R.refReq], engines: ['ck', 'deneb'], native: { type: 'waterfallChart', map: { category: 'Category', ac: 'Y' } } }),
    K('tree', 'Baum / Zerlegung', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.category2, R.ac, R.ref], engines: ['ck', 'native'], native: { type: 'decompositionTreeVisual', map: { ac: 'Analyze', category: 'ExplainBy', subcategory: 'ExplainBy' } } }),
    K('heatmap', 'Heatmap (divergierend)', 'IBCS · Wasserfall & Struktur', { roles: [R.category, { ...R.category2, req: true }, R.ac, R.ref], engines: ['ck', 'deneb', 'native'], native: { type: 'pivotTable', map: { category: 'Rows', subcategory: 'Columns', ac: 'Values' } } }),
    K('scatter', 'Streudiagramm', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.x, R.y, R.size], native: { type: 'scatterChart', map: { category: 'Category', x: 'X', y: 'Y', size: 'Size' } } }),
    K('boxplot', 'Boxplot', 'IBCS · Wasserfall & Struktur', { roles: [R.category, { ...R.ac, label: 'Wert (Spalte, Einzelwerte)', kind: 'any' }], engines: ['ck', 'deneb'], native: null }),
    K('gantt', 'Gantt', 'IBCS · Wasserfall & Struktur', { roles: [R.category, R.start, R.end, R.series], engines: ['ck', 'deneb'], native: null }),

    // ---------- Tabellen & KPI ----------
    K('kpi', 'KPI-Kachel (IBCS)', 'Tabellen & KPI', { roles: [R.indicator, R.goal, { ...R.time, req: false, label: 'Zeit (Sparkline)' }], native: { type: 'card', map: { indicator: 'Values' } }, note: 'Große Zahl, Δ-Zeile grün/rot, optional Sparkline.' }),
    K('card', 'Karte (nativ)', 'Tabellen & KPI', { roles: [R.indicator], engines: ['native'], engine: 'native', ck: null, native: { type: 'card', map: { indicator: 'Values' } } }),
    K('multirow', 'Mehrzeilen-Karte', 'Tabellen & KPI', { roles: [R.values], engines: ['native'], engine: 'native', ck: null, native: { type: 'multiRowCard', map: { values: 'Values' } } }),
    K('table', 'IBCS-Tabelle', 'Tabellen & KPI', { roles: [R.rows, R.ac, R.ref], native: { type: 'tableEx', map: { rows: 'Values', ac: 'Values', ref: 'Values' } }, note: 'Spalten AC · Ref · Δ · Δ% mit Mini-Balken.' }),
    K('sparktable', 'Tabelle mit Sparklines', 'Tabellen & KPI', { roles: [R.rows, R.time, R.ac, R.ref], engines: ['ck', 'deneb'], native: { type: 'tableEx', map: { rows: 'Values', ac: 'Values' } } }),
    K('matrix', 'Matrix (nativ)', 'Tabellen & KPI', { roles: [R.rows, R.cols, R.values], engines: ['native'], engine: 'native', ck: null, native: { type: 'pivotTable', map: { rows: 'Rows', columns: 'Columns', values: 'Values' } } }),
    K('gauge', 'Tacho (nativ)', 'Tabellen & KPI', { roles: [R.indicator, R.goal], engines: ['native'], engine: 'native', ck: null, native: { type: 'gauge', map: { indicator: 'Y', goal: 'TargetValue' } }, note: 'Nicht IBCS-konform; Bullet oder KPI bevorzugen.' }),

    // ---------- Native Sonstige ----------
    K('pie', 'Kreis (nativ)', 'Native Sonstige', { roles: [R.category, R.ac], engines: ['native'], engine: 'native', ck: null, native: { type: 'pieChart', map: { category: 'Category', ac: 'Y' } }, note: 'Nicht IBCS-konform; Balken bevorzugen.' }),
    K('treemap', 'Treemap (nativ)', 'Native Sonstige', { roles: [R.category, R.ac], engines: ['native'], engine: 'native', ck: null, native: { type: 'treemap', map: { category: 'Group', ac: 'Values' } } }),
    K('decomp', 'Zerlegungsbaum (nativ)', 'Native Sonstige', { roles: [R.ac, { ...R.category, key: 'category', label: 'Erklären durch', max: 6 }], engines: ['native'], engine: 'native', ck: null, native: { type: 'decompositionTreeVisual', map: { ac: 'Analyze', category: 'ExplainBy' } } }),
    K('map', 'Karte (Geo, nativ)', 'Native Sonstige', { roles: [R.geo, R.size], engines: ['native'], engine: 'native', ck: null, native: { type: 'map', map: { category: 'Category', size: 'Size' } } }),
    K('deneb', 'Deneb / Vega (eigenes Spec)', 'Native Sonstige', { roles: [R.valuesAny], engines: ['deneb'], engine: 'deneb', ck: null, native: null, note: 'Spec später aus ChartKitchen exportieren oder selbst schreiben.' }),

    // ---------- Steuerung & Text ----------
    K('slicer', 'Slicer', 'Steuerung & Text', { roles: [R.field], engines: ['native'], engine: 'native', ck: null, native: { type: 'slicer', map: { field: 'Values' } } }),
    K('text', 'Textfeld', 'Steuerung & Text', { roles: [R.text], engines: ['native'], engine: 'native', ck: null, native: { type: 'textbox', map: {} } }),
    K('image', 'Bild / Logo', 'Steuerung & Text', { roles: [], engines: ['native'], engine: 'native', ck: null, native: { type: 'image', map: {} } }),
    K('button', 'Schaltfläche', 'Steuerung & Text', { roles: [], engines: ['native'], engine: 'native', ck: null, native: { type: 'actionButton', map: {} } }),
  ];

  const BY_ID = {};
  CATALOG.forEach(k => { BY_ID[k.id] = k; });
  const GROUPS = [];
  CATALOG.forEach(k => { if (!GROUPS.includes(k.group)) GROUPS.push(k.group); });

  const ENGINE_LABEL = { ck: 'ChartKitchen', native: 'Nativ', deneb: 'Deneb' };

  // Seitenvorlagen: Layout-Bäume für den Inhaltsbereich. leaf(kind, title) / row([...]) / col([...]) mit Gewichten.
  const TEMPLATES = [
    { id: 'kpi4-2x2', label: 'KPI-Reihe + 2×2', desc: '4 KPI-Kacheln oben, darunter vier Analysen.', tree: () => col([
        [1, row([[1, leaf('kpi', 'Umsatz')], [1, leaf('kpi', 'Marge')], [1, leaf('kpi', 'Kosten')], [1, leaf('kpi', 'Aufträge')]])],
        [4, col([[1, row([[1, leaf('kombi', 'Umsatz je Monat')], [1, leaf('bars', 'Umsatz je Region')]])], [1, row([[1, leaf('line', 'Trend 12 Monate')], [1, leaf('table', 'Top-Produkte')]])]])]
      ]) },
    { id: 'kpi4-main-detail', label: 'KPI-Reihe + Haupt/Detail', desc: 'Klassiker aus dem Design-Framework: KPIs, großes Hauptvisual, Detail rechts.', tree: () => col([
        [1, row([[1, leaf('kpi', 'Umsatz')], [1, leaf('kpi', 'Marge')], [1, leaf('kpi', 'Kosten')], [1, leaf('kpi', 'Aufträge')]])],
        [4, row([[2, leaf('varint', 'Umsatz AC/FC vs PL je Monat')], [1, leaf('bars', 'Δ PL je Produktlinie')]])]
      ]) },
    { id: 'pnl', label: 'Monatsreport GuV', desc: 'Wasserfall links, Tabelle rechts, Kommentarzeile unten.', tree: () => col([
        [4, row([[1, leaf('waterfall', 'GuV-Wasserfall')], [1, leaf('table', 'GuV-Positionen AC vs PL')]])],
        [1, leaf('text', 'Kommentar / Kernbotschaft')]
      ]) },
    { id: 'monitoring', label: 'Monitoring · 3×2', desc: 'Sechs gleich große Kacheln für Small Multiples oder Monitoring.', tree: () => col([
        [1, row([[1, leaf('kpi', 'KPI 1')], [1, leaf('kpi', 'KPI 2')], [1, leaf('kpi', 'KPI 3')]])],
        [1, row([[1, leaf('line', 'Verlauf 1')], [1, leaf('line', 'Verlauf 2')], [1, leaf('line', 'Verlauf 3')]])]
      ]) },
    { id: 'sales', label: 'Sales-Analyse', desc: 'Brücke oben, drei Detailanalysen unten.', tree: () => col([
        [1, leaf('bridge', 'Umsatz-Brücke PY → AC')],
        [1, row([[1, leaf('bars', 'Umsatz je Kunde')], [1, leaf('scatter', 'Menge vs Marge')], [1, leaf('heatmap', 'Region × Produkt')]])]
      ]) },
    { id: 'empty', label: 'Leer (2×2)', desc: 'Vier leere Kacheln zum Selbstbauen.', tree: () => col([[1, row([[1, leaf()], [1, leaf()]])], [1, row([[1, leaf()], [1, leaf()]])]]) },
    { id: 'single', label: 'Eine Kachel', desc: 'Ganzer Inhaltsbereich, danach teilen.', tree: () => leaf() },
  ];
  function leaf(kind, title) { return { type: 'leaf', visual: kind ? { kind, title: title || '' } : null }; }
  function row(children) { return { type: 'split', dir: 'row', children: children.map(([size, node]) => ({ size, node })) }; }
  function col(children) { return { type: 'split', dir: 'col', children: children.map(([size, node]) => ({ size, node })) }; }

  window.MK_CATALOG = { list: CATALOG, byId: BY_ID, groups: GROUPS, engineLabel: ENGINE_LABEL, templates: TEMPLATES, roleDefs: R };
})();
