// @dwg/visuals: ChartKitchen und P&L Statement byDatenWG außerhalb von Power BI.
//
//   const { query, bindings } = daxQuery("chartkitchen", {
//       category: "'Kalender'[Monat]", actual: "[Umsatz AC]", previousYear: "[Umsatz PY]",
//   }, { sortBy: { "'Kalender'[Monat]": "'Kalender'[MonatNr]" } });
//   const table = (await connector.executeQuery({ query })).table;   // Rayfin-Konnektor
//   await mountVisual(el, { visual: "chartkitchen", table, bindings,
//       objects: { chart: { orientation: "intwaterfall" } }, onSelect: keys => … });

export { mountVisual } from "./mount";
export { daxQuery, daxLiteral, col } from "./dax";
export type { DaxFilter, DaxOptions, DaxQuery, DaxValue } from "./dax";
export { buildDataView, columnIndex, normalizeRef, bareName } from "./dataview";
export { applyPersist } from "./host";
export { ROLES, VERSIONS } from "./_generated";
export type {
    Bindings, MountOptions, QueryTable, SelectionKey, TooltipItem, VisualHandle, VisualKind, VisualObjects,
} from "./types";
