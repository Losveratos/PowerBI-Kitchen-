// Baut aus einem Abfrageergebnis die kategoriale DataView, die Power BI dem Visual
// sonst liefert. Abfragen mit SUMMARIZECOLUMNS sind schon gruppiert: eine Zeile je
// Kombination der gruppierenden Spalten, so wie Power BI sie an das Visual gibt.

import { ROLES } from "./_generated";
import type { Bindings, QueryTable, VisualKind, VisualObjects } from "./types";

/** `'Kalender'[Monat]` → `Kalender[Monat]` (so heißen die Spalten im Abfrageergebnis). */
export function normalizeRef(ref: string): string {
    const m = /^\s*'((?:[^']|'')*)'\s*(\[.*\])\s*$/.exec(ref);
    return m ? m[1].replace(/''/g, "'") + m[2] : ref.trim();
}

/** `Kalender[Monat]` → `Monat`, `[AC]` → `AC`. */
export function bareName(ref: string): string {
    const n = normalizeRef(ref);
    const m = /\[([^\]]*)\]$/.exec(n);
    return m ? m[1] : n;
}

export function columnIndex(table: QueryTable, ref: string): number {
    const want = normalizeRef(ref);
    const exact = table.columns.findIndex(c => normalizeRef(c.name) === want);
    if (exact >= 0) { return exact; }
    const bare = bareName(ref);
    const hits = table.columns.map((c, i) => (bareName(c.name) === bare ? i : -1)).filter(i => i >= 0);
    if (hits.length === 1) { return hits[0]; }
    const have = table.columns.map(c => c.name).join(", ");
    throw new Error(hits.length > 1
        ? `Spalte "${ref}" ist nicht eindeutig (${hits.map(i => table.columns[i].name).join(", ")}). Mit Tabellennamen angeben.`
        : `Spalte "${ref}" fehlt im Abfrageergebnis. Vorhanden: ${have}`);
}

// Geschützte Leerzeichen (U+00A0) entfernt DAX TRIM nicht, deshalb hier (memory/03-daten.md).
const EDGE_WS = /^[\s ]+|[\s ]+$/g;

function groupValue(v: unknown): unknown {
    if (v == null) { return null; }
    return typeof v === "string" ? v.replace(EDGE_WS, "") : v;
}

function measureValue(v: unknown): number | null {
    if (v == null || v === "") { return null; }
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : null;
}

export interface DataViewOptions {
    objects?: VisualObjects;
    formats?: Record<string, string>;
    displayNames?: Record<string, string>;
}

interface Source {
    displayName: string;
    queryName: string;
    roles: Record<string, boolean>;
    index: number;
    isMeasure?: boolean;
    format?: string;
}

export function buildDataView(kind: VisualKind, table: QueryTable, bindings: Bindings, opts: DataViewOptions = {}) {
    const spec = ROLES[kind];
    const kinds = spec.kind as Record<string, string>;
    const max = spec.max as Record<string, number>;
    for (const role of Object.keys(bindings)) {
        if (!kinds[role]) {
            throw new Error(`${kind} kennt die Rolle "${role}" nicht. Rollen: ${spec.order.join(", ")}`);
        }
        const n = ([] as string[]).concat(bindings[role]).length;
        if (max[role] != null && n > max[role]) {
            throw new Error(`Rolle "${role}" nimmt höchstens ${max[role]} Feld(er), gebunden sind ${n}.`);
        }
    }

    const categories: { source: Source; values: unknown[] }[] = [];
    const values: { source: Source; values: (number | null)[] }[] = [];
    let index = 0;
    for (const role of spec.order) {
        const refs = bindings[role];
        if (refs == null) { continue; }
        for (const ref of ([] as string[]).concat(refs)) {
            const ci = columnIndex(table, ref);
            const name = table.columns[ci].name;
            const source: Source = {
                displayName: opts.displayNames?.[ref] ?? opts.displayNames?.[name] ?? bareName(name),
                queryName: name,
                roles: { [role]: true },
                index: index++,
            };
            if (kinds[role] === "Measure") {
                source.isMeasure = true;
                const fmt = opts.formats?.[ref] ?? opts.formats?.[name];
                if (fmt) { source.format = fmt; }
                values.push({ source, values: table.rows.map(r => measureValue(r[ci])) });
            } else {
                categories.push({ source, values: table.rows.map(r => groupValue(r[ci])) });
            }
        }
    }

    return {
        metadata: { columns: [...categories, ...values].map(c => c.source), objects: opts.objects ?? {} },
        categorical: { categories, values },
    };
}
