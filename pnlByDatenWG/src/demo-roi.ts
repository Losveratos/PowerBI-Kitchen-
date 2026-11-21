/*
 * 1.8.1 the ROI tree (DuPont) of the gallery preview "11A ROI-Baum": the
 * numbers of the reference sheet 11A, kEUR (buildRoiDemoRows turns them into
 * EUR), years 2021 to 2027 as the period: actuals up to 2025, plan 2026 and
 * 2027. Capital turnover carries the KPI token "factor", invested capital is a
 * stock. Level names and formula references are resource keys (UI_DN_<key>),
 * like the Smart Start demo, so the preview speaks the reader's language.
 */
import { LevelInputRow, parseRowTypeInfo } from "./engine";

export const ROI_DEMO_YEARS = ["2021", "2022", "2023", "2024", "2025", "2026", "2027"];

interface RoiDemoRow {
    id: string; levels: string[]; sort: number; type: string; f: string | null; v?: number[];
}

const ROWS: RoiDemoRow[] = [
    { id: "RET", levels: ["RoiReturn"], sort: 1, type: "Account", f: null, v: [5.0, -1.8, -3.5, 3.1, 4.1, 4.7, 5.5] },
    { id: "NS", levels: ["RoiNetSales"], sort: 2, type: "Account", f: null, v: [26.1, 25.7, 26.4, 22.1, 23.8, 23.7, 27.7] },
    { id: "IC", levels: ["RoiCapital"], sort: 3, type: "Account stock", f: null, v: [20.1, 18.5, 19.4, 21.1, 22.9, 24.5, 24.5] },
    { id: "ROS", levels: ["RoiRos"], sort: 10, type: "KPI", f: "[@RoiReturn]/[@RoiNetSales]" },
    { id: "CT", levels: ["RoiCt"], sort: 11, type: "KPI factor", f: "[@RoiNetSales]/[@RoiCapital]" },
    { id: "ROI", levels: ["RoiRoi"], sort: 12, type: "KPI", f: "[@RoiRos]*[@RoiCt]" },
];

/** the example as level-input rows: one per account × year (AC up to 2025, PL after), the KPI rows once */
export function buildRoiDemoRows(name: (key: string) => string): LevelInputRow[] {
    const nm = (k: string): string => name("UI_DN_" + k);
    const rows: LevelInputRow[] = [];
    let index = 0;
    for (const r of ROWS) {
        const info = parseRowTypeInfo(r.type);
        const lv: (string | null)[] = [nm(r.levels[0]), null, null];
        const base = {
            levels: lv, account: r.id, name: null,
            sort: r.sort, rowType: info.rowType, stock: info.stock, flow: info.flow,
            ...(info.kfmt ? { kfmt: info.kfmt } : {}),
            formulaDef: r.f == null ? null : r.f.replace(/\[@([A-Za-z]+)\]/g, (_m: string, k: string) => "[" + nm(k) + "]"),
            sign: 1, displayInvert: false, varianceInvert: false, comment: null,
        };
        if (!r.v) { rows.push({ ...base, values: {}, month: null, index: index++ }); continue; }
        ROI_DEMO_YEARS.forEach((y, i) => {
            const v = r.v![i] * 1000;
            rows.push({ ...base, month: y, index: index++, values: i < 5 ? { ac: v } : { pl: v } });
        });
    }
    return rows;
}
