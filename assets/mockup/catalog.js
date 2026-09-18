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

  // Demo-Modell: kleines Beispielmodell für Workshops ohne TMDL. Gleiche Struktur wie der TMDL-Parser liefert.
  const col_ = (name, type, desc) => ({ name, kind: 'column', type, desc: desc || '', hidden: false, format: '' });
  const mea_ = (name, format, desc) => ({ name, kind: 'measure', type: 'measure', desc: desc || '', hidden: false, format: format || '#,##0' });
  const DEMO_MODEL = {
    source: 'Demo-Modell',
    tables: [
      { name: 'DimDate', desc: 'Kalender', columns: [col_('Date', 'dateTime'), col_('Year', 'int64'), col_('Quarter', 'string'), col_('Month', 'string', 'Monatsname, sortiert nach MonthKey'), col_('MonthKey', 'int64'), col_('IsForecast', 'int64', '1 = Forecast-Monat, 0 = Ist')], measures: [] },
      { name: 'DimProduct', desc: 'Produkte', columns: [col_('Product', 'string'), col_('Category', 'string', 'Produktlinie'), col_('Brand', 'string')], measures: [] },
      { name: 'DimRegion', desc: 'Regionen', columns: [col_('Region', 'string'), col_('Country', 'string'), col_('SalesOffice', 'string')], measures: [] },
      { name: 'DimCustomer', desc: 'Kunden', columns: [col_('Customer', 'string'), col_('Segment', 'string'), col_('KeyAccount', 'string')], measures: [] },
      { name: 'DimAccount', desc: 'GuV-Konten', columns: [col_('Account', 'string', 'GuV-Position'), col_('AccountGroup', 'string'), col_('SortKey', 'int64')], measures: [] },
      { name: '_Measures', desc: 'Kennzahlen', columns: [], measures: [
        mea_('AC', '#,##0', 'Ist'), mea_('PY', '#,##0', 'Vorjahr'), mea_('PL', '#,##0', 'Plan'), mea_('FC', '#,##0', 'Forecast'), mea_('BU', '#,##0', 'Budget'),
        mea_('ΔPL', '#,##0', 'AC − PL'), mea_('ΔPL%', '0.0%', '(AC − PL) / PL'), mea_('ΔPY', '#,##0', 'AC − PY'), mea_('ΔPY%', '0.0%', '(AC − PY) / PY'),
        mea_('Umsatz', '#,##0'), mea_('Kosten', '#,##0'), mea_('Marge', '#,##0', 'Umsatz − Kosten'), mea_('Marge%', '0.0%'), mea_('Menge', '#,##0'), mea_('Aufträge', '#,##0'), mea_('Kunden', '#,##0'), mea_('Ø Auftragswert', '#,##0', 'Umsatz / Aufträge'),
      ] },
    ],
  };

  // Seitenvorlagen: Layout-Bäume für den Inhaltsbereich. leaf(kind, title, roles, opts) / row([...]) / col([...]) mit Gewichten.
  // roles: { roleKey: ['Tabelle.Feld', ...] } – wird beim Anwenden gegen das geladene Modell aufgelöst (fehlende Felder bleiben leer).
  const M = f => '_Measures.' + f;
  const KPI = (title, ac, ref) => leaf('kpi', title, { indicator: [M(ac)], goal: ref ? [M(ref)] : [], category: ['DimDate.Month'] });
  const TEMPLATES = [
    { id: 'kpi4-main-detail', label: 'Management-Übersicht', desc: 'KPI-Reihe, große integrierte Varianzanalyse, Δ je Produktlinie rechts.', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Marge', 'Marge', 'PL')], [1, KPI('Kosten', 'Kosten', 'PL')], [1, KPI('Aufträge', 'Aufträge', 'PY')]])],
        [4, row([[2, leaf('varint', 'Umsatz AC/FC vs PL je Monat', { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PL')], fc: ['DimDate.IsForecast'] }, { scenario: 'AC/PL/FC', sub: 'in T€' })], [1, leaf('bars', 'Δ PL je Produktlinie', { category: ['DimProduct.Category'], ac: [M('AC')], ref: [M('PL')] }, { notes: 'Absteigend nach Δ sortieren.' })]])]
      ]) },
    { id: 'exec', label: 'Executive One-Pager', desc: 'KPIs, Umsatz-Brücke PY → AC, Kernbotschaft als Text.', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PY')], [1, KPI('Marge %', 'Marge%', 'PL')], [1, KPI('Kunden', 'Kunden', 'PY')], [1, KPI('Ø Auftragswert', 'Ø Auftragswert', 'PY')]])],
        [3, row([[2, leaf('bridge', 'Umsatz-Brücke PY → AC je Region', { category: ['DimRegion.Region'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('text', 'Kernbotschaft', {}, { notes: 'Drei Sätze: Was, warum, was tun wir.' })]])],
        [2, row([[1, leaf('kombi', 'Umsatz je Monat AC vs PL', { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PL')] })], [1, leaf('table', 'Top-Produkte', { rows: ['DimProduct.Product'], ac: [M('AC')], ref: [M('PL')] })]])]
      ]) },
    { id: 'kpi4-2x2', label: 'KPI-Reihe + 2×2', desc: 'Vier KPIs oben, darunter vier Analysen.', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Marge', 'Marge', 'PL')], [1, KPI('Kosten', 'Kosten', 'PL')], [1, KPI('Aufträge', 'Aufträge', 'PY')]])],
        [4, col([[1, row([[1, leaf('kombi', 'Umsatz je Monat', { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PL')] })], [1, leaf('bars', 'Umsatz je Region', { category: ['DimRegion.Region'], ac: [M('AC')], ref: [M('PL')] })]])], [1, row([[1, leaf('line', 'Trend 12 Monate', { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('table', 'Top-Produkte', { rows: ['DimProduct.Product'], ac: [M('AC')], ref: [M('PL')] })]])]])]
      ]) },
    { id: 'pnl', label: 'Monatsreport GuV', desc: 'GuV-Wasserfall links, Positionen als IBCS-Tabelle rechts, Kommentarzeile unten.', tree: () => col([
        [4, row([[1, leaf('waterfall', 'GuV-Wasserfall', { category: ['DimAccount.Account'], ac: [M('AC')] })], [1, leaf('table', 'GuV-Positionen AC vs PL', { rows: ['DimAccount.Account'], ac: [M('AC')], ref: [M('PL')] })]])],
        [1, leaf('text', 'Kommentar / Kernbotschaft', {}, { notes: 'Kommentar-Modus: Controller pflegt den Text monatlich.' })]
      ]) },
    { id: 'sales', label: 'Sales-Analyse', desc: 'Brücke oben, drei Detailanalysen unten.', tree: () => col([
        [1, leaf('bridge', 'Umsatz-Brücke PY → AC je Produktlinie', { category: ['DimProduct.Category'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })],
        [1, row([[1, leaf('bars', 'Umsatz je Kunde (Top 10)', { category: ['DimCustomer.Customer'], ac: [M('AC')], ref: [M('PY')] }, { notes: 'Top-N-Filter: 10' })], [1, leaf('scatter', 'Menge vs Marge je Produkt', { category: ['DimProduct.Product'], x: [M('Menge')], y: [M('Marge%')], size: [M('Umsatz')] })], [1, leaf('heatmap', 'Region × Produktlinie', { category: ['DimRegion.Region'], subcategory: ['DimProduct.Category'], ac: [M('AC')], ref: [M('PL')] })]])]
      ]) },
    { id: 'drill', label: 'Detailseite (Drill)', desc: 'Zielseite für Drill-through: Filterhinweis, Kennzahlen, Detailtabelle, Verlauf.', tree: () => col([
        [1, row([[2, leaf('text', 'Detail: gewählte Produktlinie', {}, { notes: 'Drill-through-Ziel. Titel zeigt den gefilterten Wert (SELECTEDVALUE).' })], [1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Marge %', 'Marge%', 'PL')]])],
        [3, row([[3, leaf('table', 'Einzelpositionen', { rows: ['DimProduct.Product', 'DimCustomer.Customer'], ac: [M('AC')], ref: [M('PL')] })], [2, leaf('line', 'Verlauf 24 Monate', { category: ['DimDate.Month'], ac: [M('AC')], ref: [M('PY')] }, { scenario: 'AC/PY' })]])]
      ]) },
    { id: 'cost', label: 'Kosten-Monitoring', desc: 'Small Multiples je Kostenart, Tornado der Abweichungen, KPI-Reihe.', tree: () => col([
        [1, row([[1, KPI('Kosten', 'Kosten', 'PL')], [1, KPI('Δ PL', 'ΔPL', null)], [1, KPI('Δ PL %', 'ΔPL%', null)]])],
        [3, row([[2, leaf('multiples', 'Kosten je Konto und Monat', { category: ['DimDate.Month'], series: ['DimAccount.AccountGroup'], ac: [M('AC')], ref: [M('PL')] })], [1, leaf('tornado', 'Δ PL je Konto', { category: ['DimAccount.Account'], ac: [M('AC')], ref: [M('PL')] })]])]
      ]) },
    { id: 'monitoring', label: 'Monitoring · 3×2', desc: 'Sechs gleich große Kacheln: KPIs oben, Verläufe unten.', tree: () => col([
        [1, row([[1, KPI('Umsatz', 'Umsatz', 'PL')], [1, KPI('Aufträge', 'Aufträge', 'PY')], [1, KPI('Kunden', 'Kunden', 'PY')]])],
        [1, row([[1, leaf('line', 'Umsatz-Verlauf', { category: ['DimDate.Month'], ac: [M('Umsatz')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('line', 'Aufträge-Verlauf', { category: ['DimDate.Month'], ac: [M('Aufträge')], ref: [M('PY')] }, { scenario: 'AC/PY' })], [1, leaf('line', 'Kunden-Verlauf', { category: ['DimDate.Month'], ac: [M('Kunden')], ref: [M('PY')] }, { scenario: 'AC/PY' })]])]
      ]) },
    { id: 'empty', label: 'Leer (2×2)', desc: 'Vier leere Kacheln zum Selbstbauen.', tree: () => col([[1, row([[1, leaf()], [1, leaf()]])], [1, row([[1, leaf()], [1, leaf()]])]]) },
    { id: 'single', label: 'Eine Kachel', desc: 'Ganzer Inhaltsbereich, danach teilen.', tree: () => leaf() },
  ];
  function leaf(kind, title, roles, opts) { return { type: 'leaf', visual: kind ? Object.assign({ kind, title: title || '', roleRefs: roles || {} }, opts || {}) : null }; }
  function row(children) { return { type: 'split', dir: 'row', children: children.map(([size, node]) => ({ size, node })) }; }
  function col(children) { return { type: 'split', dir: 'col', children: children.map(([size, node]) => ({ size, node })) }; }

  window.MK_CATALOG = { list: CATALOG, byId: BY_ID, groups: GROUPS, engineLabel: ENGINE_LABEL, templates: TEMPLATES, roleDefs: R, demoModel: DEMO_MODEL };
})();
