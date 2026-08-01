/**
 * P&L calc engine — pure TypeScript, no Power BI dependencies.
 *
 * Responsibilities (requirements F1–F4):
 *  - build an unbalanced parent-child tree from account-dimension rows,
 *    orphans go to a visible "unassigned" bucket (never silently dropped)
 *  - subtotal rows sum their children using each row's sign convention
 *  - formula rows evaluate FormulaDef expressions like "[EBITDA]/[Revenue]"
 *    with cycle detection; errors surface on the row instead of breaking
 *  - variances Δ / Δ% against a selectable reference scenario with
 *    variance-invert support (costs below plan = good)
 *
 * The engine only ever computes on the rows it is given — RLS/filters are
 * respected by construction (rule 4.4: never invent values).
 */

export type Scenario = "ac" | "py" | "pl" | "fc";
export const SCENARIOS: Scenario[] = ["ac", "py", "pl", "fc"];

export type RowType = "account" | "subtotal" | "formula" | "kpi" | "separator";

export interface InputRow {
    id: string;
    parent: string | null;
    name: string;
    sort: number;
    rowType: RowType;
    formulaDef: string | null;
    sign: number;
    displayInvert: boolean;
    varianceInvert: boolean;
    values: Partial<Record<Scenario, number | null>>;
    index: number;
}

export interface PnlNode {
    row: InputRow;
    children: PnlNode[];
    level: number;
    computed: Record<Scenario, number | null>;
    error: string | null;
    hasChildren: boolean;
    isOrphanBucket: boolean;
}

export interface PnlModel {
    roots: PnlNode[];
    byId: Map<string, PnlNode>;
    maxDepth: number;
    warnings: string[];
}

export interface Variance {
    delta: number | null;
    deltaPct: number | null;
    good: boolean;
}

const ORPHAN_ID = "__unassigned__";

export function parseRowType(raw: unknown): RowType {
    const s = String(raw ?? "").trim().toLowerCase();
    if (s.startsWith("sub") || s === "sum" || s === "summe") { return "subtotal"; }
    if (s.startsWith("form")) { return "formula"; }
    if (s === "kpi" || s === "ratio" || s === "margin") { return "kpi"; }
    if (s.startsWith("sep")) { return "separator"; }
    return "account";
}

export function parseBool(raw: unknown): boolean {
    if (typeof raw === "boolean") { return raw; }
    if (typeof raw === "number") { return raw !== 0; }
    const s = String(raw ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes" || s === "ja" || s === "x";
}

export function parseSign(raw: unknown): number {
    const n = Number(raw);
    return n < 0 ? -1 : 1;
}

export function buildModel(rows: InputRow[], orphanLabel: string): PnlModel {
    const warnings: string[] = [];
    const byId = new Map<string, PnlNode>();

    for (const row of rows) {
        if (byId.has(row.id)) {
            warnings.push(`duplicate id: ${row.id}`);
            continue;
        }
        byId.set(row.id, {
            row, children: [], level: 0,
            computed: { ac: null, py: null, pl: null, fc: null },
            error: null, hasChildren: false, isOrphanBucket: false,
        });
    }

    const roots: PnlNode[] = [];
    const orphans: PnlNode[] = [];
    for (const node of byId.values()) {
        const pid = node.row.parent;
        if (pid == null || pid === "" || pid === node.row.id) {
            roots.push(node);
        } else {
            const parent = byId.get(pid);
            if (parent) { parent.children.push(node); }
            else { orphans.push(node); }
        }
    }

    if (orphans.length > 0) {
        const bucketRow: InputRow = {
            id: ORPHAN_ID, parent: null, name: orphanLabel, sort: Number.MAX_SAFE_INTEGER,
            rowType: "subtotal", formulaDef: null, sign: 1,
            displayInvert: false, varianceInvert: false, values: {}, index: -1,
        };
        const bucket: PnlNode = {
            row: bucketRow, children: orphans, level: 0,
            computed: { ac: null, py: null, pl: null, fc: null },
            error: null, hasChildren: true, isOrphanBucket: true,
        };
        byId.set(ORPHAN_ID, bucket);
        roots.push(bucket);
        warnings.push(`${orphans.length} orphan row(s) moved to "${orphanLabel}"`);
    }

    const bySort = (a: PnlNode, b: PnlNode): number =>
        (a.row.sort - b.row.sort) || a.row.name.localeCompare(b.row.name);
    const sortRec = (nodes: PnlNode[], level: number): void => {
        nodes.sort(bySort);
        for (const n of nodes) {
            n.level = level;
            n.hasChildren = n.children.length > 0;
            sortRec(n.children, level + 1);
        }
    };
    sortRec(roots, 0);

    let maxDepth = 0;
    for (const n of byId.values()) { maxDepth = Math.max(maxDepth, n.level + 1); }

    computeValues(roots, byId, warnings);
    return { roots, byId, maxDepth, warnings };
}

/** Sum contribution of a node into its parent: accounts and subtotals count, ratio/separator rows never do. */
function contributes(node: PnlNode): boolean {
    const t = node.row.rowType;
    return t === "account" || t === "subtotal";
}

function computeValues(roots: PnlNode[], byId: Map<string, PnlNode>, warnings: string[]): void {
    // pass 1: additive values bottom-up (accounts + subtotals)
    const sumNode = (node: PnlNode): void => {
        for (const c of node.children) { sumNode(c); }
        const t = node.row.rowType;
        for (const s of SCENARIOS) {
            const own = node.row.values[s];
            let acc: number | null = null;
            // own value counts for account rows; a subtotal's own value would
            // double count its children and is ignored; formula/kpi/separator
            // rows never carry additive values (pass 2 computes formula/kpi)
            const ownCounts = t === "account" || (t === "subtotal" && !node.hasChildren);
            if (own != null && ownCounts) { acc = own * node.row.sign; }
            for (const c of node.children) {
                if (!contributes(c)) { continue; }
                const cv = c.computed[s];
                if (cv == null) { continue; }
                acc = (acc ?? 0) + cv;
            }
            node.computed[s] = acc;
        }
    };
    for (const r of roots) { sumNode(r); }

    // pass 2: formula / kpi rows with memoized evaluation + cycle detection
    const visiting = new Set<string>();
    const done = new Set<string>();

    const evalNode = (node: PnlNode): void => {
        const t = node.row.rowType;
        if (t !== "formula" && t !== "kpi") { return; }
        if (done.has(node.row.id)) { return; }
        if (visiting.has(node.row.id)) {
            node.error = "cycle";
            return;
        }
        visiting.add(node.row.id);
        const def = (node.row.formulaDef ?? "").trim();
        if (def === "") {
            node.error = "empty formula";
        } else {
            try {
                const ast = parseFormula(def);
                for (const s of SCENARIOS) {
                    node.computed[s] = evalAst(ast, s, byId, evalNode, node);
                    if (node.error) { break; }
                }
            } catch (e) {
                node.error = e instanceof Error ? e.message : "parse error";
            }
        }
        visiting.delete(node.row.id);
        done.add(node.row.id);
        if (node.error) {
            for (const s of SCENARIOS) { node.computed[s] = null; }
            warnings.push(`formula error in ${node.row.id}: ${node.error}`);
        }
    };
    for (const n of byId.values()) { evalNode(n); }
}

// ---- formula parser (recursive descent: + - * / parentheses, [refs], numbers)

type Ast =
    | { kind: "num"; value: number }
    | { kind: "ref"; id: string }
    | { kind: "bin"; op: "+" | "-" | "*" | "/"; left: Ast; right: Ast }
    | { kind: "neg"; arg: Ast };

function parseFormula(src: string): Ast {
    let pos = 0;
    const skipWs = (): void => { while (pos < src.length && /\s/.test(src[pos])) { pos++; } };
    const peek = (): string => { skipWs(); return src[pos] ?? ""; };

    const parsePrimary = (): Ast => {
        skipWs();
        const ch = src[pos];
        if (ch === "(") {
            pos++;
            const inner = parseAddSub();
            skipWs();
            if (src[pos] !== ")") { throw new Error("missing )"); }
            pos++;
            return inner;
        }
        if (ch === "[") {
            const end = src.indexOf("]", pos);
            if (end < 0) { throw new Error("missing ]"); }
            const id = src.slice(pos + 1, end).trim();
            pos = end + 1;
            if (id === "") { throw new Error("empty reference"); }
            return { kind: "ref", id };
        }
        if (ch === "-") { pos++; return { kind: "neg", arg: parsePrimary() }; }
        const m = /^\d+(?:[.,]\d+)?/.exec(src.slice(pos));
        if (m) {
            pos += m[0].length;
            return { kind: "num", value: parseFloat(m[0].replace(",", ".")) };
        }
        throw new Error(`unexpected "${ch}"`);
    };

    const parseMulDiv = (): Ast => {
        let left = parsePrimary();
        for (;;) {
            const op = peek();
            if (op !== "*" && op !== "/") { return left; }
            pos++;
            left = { kind: "bin", op, left, right: parsePrimary() };
        }
    };

    const parseAddSub = (): Ast => {
        let left = parseMulDiv();
        for (;;) {
            const op = peek();
            if (op !== "+" && op !== "-") { return left; }
            pos++;
            left = { kind: "bin", op, left, right: parseMulDiv() };
        }
    };

    const ast = parseAddSub();
    skipWs();
    if (pos < src.length) { throw new Error(`trailing "${src.slice(pos)}"`); }
    return ast;
}

function evalAst(
    ast: Ast, s: Scenario, byId: Map<string, PnlNode>,
    evalNode: (n: PnlNode) => void, owner: PnlNode
): number | null {
    switch (ast.kind) {
        case "num": return ast.value;
        case "neg": {
            const v = evalAst(ast.arg, s, byId, evalNode, owner);
            return v == null ? null : -v;
        }
        case "ref": {
            const target = byId.get(ast.id);
            if (!target) { owner.error = `unknown reference [${ast.id}]`; return null; }
            evalNode(target);
            if (target.error === "cycle") { owner.error = "cycle"; return null; }
            return target.computed[s];
        }
        case "bin": {
            const l = evalAst(ast.left, s, byId, evalNode, owner);
            const r = evalAst(ast.right, s, byId, evalNode, owner);
            if (l == null || r == null) { return null; }
            switch (ast.op) {
                case "+": return l + r;
                case "-": return l - r;
                case "*": return l * r;
                case "/": return r === 0 ? null : l / r;
            }
        }
    }
}

// ---- variances

export function variance(node: PnlNode, ref: Scenario): Variance {
    const ac = node.computed.ac;
    const rv = node.computed[ref];
    if (ac == null || rv == null) { return { delta: null, deltaPct: null, good: true }; }
    const delta = ac - rv;
    const deltaPct = rv !== 0 ? delta / Math.abs(rv) : null;
    let good = delta >= 0;
    if (node.row.varianceInvert) { good = !good; }
    return { delta, deltaPct, good };
}

/** Value as shown in the value columns (DisplayInvert flips the sign for cost rows). */
export function displayValue(node: PnlNode, s: Scenario): number | null {
    const v = node.computed[s];
    if (v == null) { return null; }
    return node.row.displayInvert ? -v : v;
}

// ---- visible rows (expand/collapse)

export function flattenVisible(roots: PnlNode[], collapsed: ReadonlySet<string>): PnlNode[] {
    const out: PnlNode[] = [];
    const walk = (nodes: PnlNode[]): void => {
        for (const n of nodes) {
            out.push(n);
            if (n.hasChildren && !collapsed.has(n.row.id)) { walk(n.children); }
        }
    };
    walk(roots);
    return out;
}

/** Collapse set for "expand everything down to level n" (n = 1-based; n>=maxDepth expands all). */
export function collapseToLevel(roots: PnlNode[], level: number): Set<string> {
    const collapsed = new Set<string>();
    const walk = (nodes: PnlNode[]): void => {
        for (const n of nodes) {
            if (n.hasChildren && n.level + 1 >= level) { collapsed.add(n.row.id); }
            walk(n.children);
        }
    };
    walk(roots);
    return collapsed;
}
