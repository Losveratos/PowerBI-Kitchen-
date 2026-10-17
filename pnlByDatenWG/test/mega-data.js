// Mega-table test data — the numbers of the IBCS reference sheets in
// prototype/refs/ (same source as prototype/megatable.html), shaped as the
// visual's level-column input (L1..L3 + measures, optional period).
//
//  MEGA_DEMO.statement(set) — T03 / T04 / 12A income statement (single period):
//      Sales revenue (= chain start) · Other op. income · Operating expenses
//      (costs: sign −1 + DisplayInvert) · formula rows · Gross margin (KPI)
//  MEGA_DEMO.regions()      — T01 / T02 regions, 11 months 2026-01..2026-11:
//      November = the month column of the sheet, Jan..Nov = its _November YTD.
(function () {
  const ST = {
    T03: {
      py: [713.3, 72.0, 22.0, 15.0, 45.0, 344.2, 11.0, 76.0, 56.0, 78.0, 43.0, 73.0, 132.1, 50.0],
      pl: [749.0, 75.6, 22.0, 25.0, 35.0, 361.4, 11.6, 79.8, 56.0, 76.0, 39.0, 66.0, 115.0, 52.0],
      ac: [896.4, 90.0, 20.4, 24.4, 38.8, 379.2, 15.8, 87.6, 44.4, 75.6, 53.0, 69.6, 111.1, 56.7],
      fc: [897.9, 93.0, 18.0, 22.5, 36.7, 389.0, 13.4, 83.6, 45.6, 78.6, 53.0, 68.9, 99.7, 50.5],
    },
    T04: {
      py: [751.30, 76.45, 22.01, 55.70, 45.02, 603.58, 48.66, 76.03, 56.02, 78.03, 43.02, 73.03, 132.06, 50.00],
      pl: [748.97, 75.63, 22.01, 62.77, 40.54, 589.45, 55.89, 79.83, 56.02, 76.00, 44.68, 66.00, 127.79, 52.00],
      ac: [745.89, 80.11, 27.57, 65.03, 49.68, 600.57, 54.02, 85.62, 47.46, 79.67, 53.02, 66.03, 135.31, 55.02],
      fc: [749.89, 82.45, 25.45, 65.99, 48.94, 603.45, 55.06, 88.35, 46.77, 77.99, 53.02, 66.03, 134.57, 55.02],
    },
    // 12A (PY / AC); PL from 12H, FC from 12G — "Support" instead of
    // "Maintenance", no gross margin row
    "12A": {
      py: [713, 72, 22, 6, 45, 344, 11, 76, 56, 78, 43, 73, 132, 89],
      ac: [896, 90, 10, 65, 17, 379, 54, 127, 40, 152, 53, 66, 111, 55],
      pl: [896, 90, 10, 8, 17, 379, 15, 127, 40, 114, 53, 66, 111, 55],
      fc: [1434, 144, 16, 104, 27, 606, 86, 203, 64, 243, 42, 33, 178, 88],
      labels: { mai: "Support" }, noMargin: true,
    },
  };
  // [levels, account, sort, sign, displayInvert] in ST order
  const ACC = [
    [["Sales revenue", "Licences"], "lic", 11, 1, false],
    [["Sales revenue", "Consulting"], "con", 12, 1, false],
    [["Sales revenue", "Maintenance"], "mai", 13, 1, false],
    [["Sales revenue", "Other revenue"], "orev", 14, 1, false],
    [["Other op. income"], "ooi", 21, 1, false],
    [["Operating expenses", "Purchases"], "pur", 31, -1, true],
    [["Operating expenses", "Material expenses"], "mat", 32, -1, true],
    [["Operating expenses", "Personnel expenses"], "per", 33, -1, true],
    [["Operating expenses", "Amortization"], "amo", 34, -1, true],
    [["Operating expenses", "Other op. expenses"], "oox", 35, -1, true],
    [["Investment income"], "inv", 51, 1, false],
    [["Financial income, net"], "fin", 52, 1, false],
    [["Income tax"], "tax", 61, -1, true],
    [["Profit to other investors"], "oth", 71, -1, true],
  ];
  const FORMULAS = [
    [["Operating result"], "opres", 40, "formula", "[Sales revenue]+[Other op. income]+[Operating expenses]"],
    [["Gross margin"], "gm", 41, "kpi", "[Operating result]/[Sales revenue]"],
    [["Result before tax"], "rbt", 55, "formula", "[Operating result]+[Investment income]+[Financial income, net]"],
    [["Result after tax"], "rat", 65, "formula", "[Result before tax]+[Income tax]"],
    [["Group result"], "grp", 75, "formula", "[Result after tax]+[Profit to other investors]"],
  ];

  function statement(set) {
    const src = ST[set || "T03"];
    const rows = [];
    ACC.forEach(([levels, account, sort, sign, di], i) => {
      if (src.labels && src.labels[account]) { levels = [...levels.slice(0, -1), src.labels[account]]; }
      rows.push({
        levels, account, sort, rowType: "account", formulaDef: null, sign, displayInvert: di,
        varianceInvert: false, month: null, comment: null,
        values: { ac: src.ac[i], py: src.py[i], pl: src.pl[i], fc: src.fc[i] },
      });
    });
    for (const [levels, account, sort, rowType, formulaDef] of FORMULAS) {
      if (rowType === "kpi" && src.noMargin) { continue; }
      rows.push({
        levels, account, sort, rowType, formulaDef, sign: 1, displayInvert: false,
        varianceInvert: false, month: null, comment: null, values: {},
      });
    }
    return rows;
  }

  // Regions (T01): November PY PL AC | _November PY PL AC ; FC (month, YTD) from T02E
  const GROUPS = [
    ["Europe", ["Austria", "Belgium", "France", "Germany", "Poland", "Sweden", "Switzerland", "Other"]],
    ["Americas", ["Brazil", "Canada", "USA", "Other"]],
    ["Rest of World", ["Australia", "China", "Japan", "Other"]],
  ];
  const BASE = {
    "Europe:Austria": [500, 590, 559, 5078, 5611, 5509], "Europe:Belgium": [56, 72, 58, 531, 529, 484],
    "Europe:France": [140, 149, 134, 1290, 1488, 1354], "Europe:Germany": [345, 279, 260, 3124, 2815, 2850],
    "Europe:Poland": [78, 91, 86, 816, 818, 854], "Europe:Sweden": [77, 81, 86, 809, 722, 764],
    "Europe:Switzerland": [61, 70, 66, 604, 582, 678], "Europe:Other": [502, 498, 545, 5602, 6022, 5441],
    "Americas:Brazil": [119, 109, 121, 1205, 1254, 1314], "Americas:Canada": [65, 71, 59, 629, 656, 718],
    "Americas:USA": [346, 326, 311, 3406, 3124, 3239], "Americas:Other": [438, 401, 399, 4166, 4219, 4008],
    "Rest of World:Australia": [54, 66, 62, 517, 609, 588], "Rest of World:China": [266, 204, 231, 2107, 1925, 2399],
    "Rest of World:Japan": [9, 12, 11, 67, 87, 144], "Rest of World:Other": [243, 323, 266, 2531, 2099, 2145],
  };
  const FC = {
    "Europe:Austria": [590, 5426], "Europe:Belgium": [58, 597], "Europe:France": [135, 1333], "Europe:Germany": [324, 3022],
    "Europe:Poland": [66, 768], "Europe:Sweden": [65, 929], "Europe:Switzerland": [72, 678], "Europe:Other": [489, 5359],
    "Americas:Brazil": [123, 1324], "Americas:Canada": [73, 699], "Americas:USA": [378, 3190], "Americas:Other": [492, 4008],
    "Rest of World:Australia": [56, 579], "Rest of World:China": [281, 2001], "Rest of World:Japan": [8, 166], "Rest of World:Other": [262, 2647],
  };
  const MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06",
    "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];

  /** month value: November = the sheet's month, the 10 months before share the rest of the YTD */
  const split = (nov, ytd, mi) => mi === 10 ? nov : Math.round((ytd - nov) / 10 * 1000) / 1000;

  function regions() {
    const rows = [];
    let sort = 0;
    for (const [g, leaves] of GROUPS) {
      for (const leaf of leaves) {
        sort++;
        const k = g + ":" + leaf;
        const b = BASE[k]; const f = FC[k];
        MONTHS.forEach((m, mi) => rows.push({
          levels: ["World", g, leaf], account: k, sort, rowType: "account", formulaDef: null,
          sign: 1, displayInvert: false, varianceInvert: false, month: m, comment: null,
          values: {
            py: split(b[0], b[3], mi), pl: split(b[1], b[4], mi),
            ac: split(b[2], b[5], mi), fc: split(f[0], f[1], mi),
          },
        }));
      }
    }
    return rows;
  }

  window.MEGA_DEMO = { statement, regions, months: MONTHS };
})();
