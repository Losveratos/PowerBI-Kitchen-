// Erzeugt aus einer Rollenbindung (Rolle → Spalte oder Measure im Modell) die
// DAX-Abfrage, die Power BI für dasselbe Visual stellen würde: SUMMARIZECOLUMNS über
// die gruppierenden Rollen, je Measure-Rolle eine Spalte. Die Zahlen kommen damit aus
// den Measures des Modells und stimmen mit dem Power-BI-Bericht überein.

import { ROLES } from "./_generated";
import { normalizeRef } from "./dataview";
import type { Bindings, VisualKind } from "./types";

/** Spaltenreferenz mit korrekt maskiertem Tabellennamen: col("Pipeline Status", "Sort Order"). */
export function col(table: string, column: string): string {
    return `'${table.replace(/'/g, "''")}'[${column.replace(/]/g, "]]")}]`;
}

export type DaxValue = string | number | boolean | Date | null;

export interface DaxFilter {
    column: string;
    /** Werteliste (TREATAS). */
    values: DaxValue[];
}

export interface DaxOptions {
    /** feste Filter und Querfilter aus der App (Auswahl in anderen Visuals) */
    filters?: DaxFilter[];
    /** Sortierspalte je gruppierender Spalte, z. B. Monatsname → Monatsnummer (wie „Nach Spalte sortieren"). */
    sortBy?: Record<string, string>;
    /** Elemente ohne Daten behalten (ADDMISSINGITEMS), z. B. Summen- und Formelzeilen der GuV. */
    showItemsWithNoData?: boolean;
}

export interface DaxQuery {
    query: string;
    /** Rollenbindung auf die Spalten des Abfrageergebnisses, direkt für mountVisual. */
    bindings: Bindings;
    /** Anzeigename je Measure-Spalte (`[actual]` → `Umsatz AC`), direkt für mountVisual. */
    displayNames: Record<string, string>;
}

const COLUMN_REF = /^\s*(?:'(?:[^']|'')+'|[A-Za-z_][\w ]*)?\s*\[(?:[^\]]|\]\])+\]\s*$/;

export function daxLiteral(v: DaxValue): string {
    if (v == null) { return "BLANK()"; }
    if (typeof v === "number") {
        if (!Number.isFinite(v)) { throw new Error(`Ungültige Zahl im Filter: ${v}`); }
        return String(v);
    }
    if (typeof v === "boolean") { return v ? "TRUE()" : "FALSE()"; }
    if (v instanceof Date) { return `DATE(${v.getFullYear()}, ${v.getMonth() + 1}, ${v.getDate()})`; }
    return `"${String(v).replace(/"/g, '""')}"`;
}

function isColumnRef(ref: string): boolean {
    return COLUMN_REF.test(ref) && !/^\s*\[/.test(ref);
}

export function daxQuery(kind: VisualKind, bindings: Bindings, opts: DaxOptions = {}): DaxQuery {
    const spec = ROLES[kind];
    const kinds = spec.kind as Record<string, string>;
    const groups: string[] = [];
    const measures: [string, string][] = [];
    const out: Bindings = {};
    const displayNames: Record<string, string> = {};

    for (const role of spec.order) {
        const refs = bindings[role];
        if (refs == null) { continue; }
        const list = ([] as string[]).concat(refs);
        if (kinds[role] === "Measure") {
            if (list.length !== 1) { throw new Error(`Measure-Rolle "${role}" braucht genau einen Ausdruck.`); }
            measures.push([role, list[0]]);
            out[role] = `[${role}]`;
            // Measure-Verweis [Umsatz AC] oder 'Sales'[Umsatz AC] → Anzeigename „Umsatz AC“, sonst die Rolle
            const m = /^\s*(?:'(?:[^']|'')+'|[A-Za-z_][\w\- ]*)?\s*\[((?:[^\]]|\]\])+)\]\s*$/.exec(list[0]);
            displayNames[`[${role}]`] = m ? m[1].replace(/\]\]/g, "]") : role;
        } else {
            for (const ref of list) {
                if (!isColumnRef(ref)) {
                    throw new Error(`Rolle "${role}": "${ref}" ist keine Spaltenreferenz ('Tabelle'[Spalte]).`);
                }
                if (!groups.includes(ref)) { groups.push(ref); }
            }
            out[role] = list.length === 1 ? normalizeRef(list[0]) : list.map(normalizeRef);
        }
    }
    for (const role of Object.keys(bindings)) {
        if (!kinds[role]) { throw new Error(`${kind} kennt die Rolle "${role}" nicht. Rollen: ${spec.order.join(", ")}`); }
    }
    if (!groups.length && !measures.length) { throw new Error("Keine Rolle gebunden."); }

    // Sortierspalten gruppieren mit (1:1 zur Anzeigespalte) und ordnen das Ergebnis
    const order: string[] = [];
    for (const g of groups) {
        const s = opts.sortBy?.[g] ?? opts.sortBy?.[normalizeRef(g)];
        if (s) {
            if (!isColumnRef(s)) { throw new Error(`Sortierspalte "${s}" ist keine Spaltenreferenz.`); }
            order.push(s);
        } else {
            order.push(g);
        }
    }
    const groupBy = [...groups];
    for (const s of order) { if (!groupBy.includes(s)) { groupBy.push(s); } }

    const filters = (opts.filters ?? []).map(f => {
        if (!isColumnRef(f.column)) { throw new Error(`Filterspalte "${f.column}" ist keine Spaltenreferenz.`); }
        return `TREATAS({${f.values.map(daxLiteral).join(", ")}}, ${f.column})`;
    });

    const indent = "        ";
    const args = [
        ...groupBy,
        ...filters,
        ...measures.map(([role, expr]) => `"${role}", ${expr}`),
    ];
    let table = `SUMMARIZECOLUMNS(\n${args.map(a => indent + a).join(",\n")}\n    )`;
    if (opts.showItemsWithNoData && groupBy.length) {
        table = `ADDMISSINGITEMS(\n${groupBy.map(a => indent + a).join(",\n")},\n    ${table},\n${groupBy.map(a => indent + a).join(",\n")}\n    )`;
    }
    const query = `EVALUATE\n    ${table}${order.length ? `\nORDER BY ${order.join(", ")}` : ""}`;
    return { query, bindings: out, displayNames };
}
