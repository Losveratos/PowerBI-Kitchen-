/**
 * IBCS P&L waterfall — pure DOM/SVG, no Power BI and no charting library.
 *
 * Renders the same rows the table shows (Revenue → Net income) as vertical
 * columns, left→right in row order:
 *  - contributing rows (account/subtotal) become FLOATING segments that
 *    accumulate (positive up, negative down)
 *  - formula rows (EBITDA, EBIT, EBT, Net income) become ANCHOR columns
 *    drawn from the zero line — negative anchors hang below it; 1.7: stock
 *    rows too (opening → flows → closing balance of a cash-flow bridge)
 *  - kpi/separator rows are skipped (they carry no additive contribution)
 *
 * Notation (IBCS 1.2, UNIFY/SIMPLIFY): scenario fill encodes the scenario
 * (AC solid dark, PY solid light, PL outlined, FC/FCFY hatched), thin gray
 * assisting lines connect the segments, value labels sit outside the element
 * in the direction of growth, category labels are horizontal, and there are
 * no gridlines, no value axis and no background fill.
 */

import { PnlNode, Scenario } from "./engine";

const SVG_NS = "http://www.w3.org/2000/svg";
/** IBCS PY fill (solid light gray) — the only scenario tone not supplied by the caller. */
const PY_FILL = "#B3B3B3";

export interface WaterfallConfig {
    width: number;                 // available pixel width
    height: number;                // available pixel height
    scenario: Scenario;            // "ac" or "fcfy" — which values flow
    fmt: (v: number) => string;    // ready-made number formatting incl. scaling
    fontFamily: string;
    colors: { ac: string; text: string; soft: string; line: string };
    hatchPatternId: string;        // id of the hatch pattern defined in this SVG's defs
    /** localized "nothing to draw" text — the caller passes it (UI_NoWidth-style resource), English otherwise */
    emptyText?: string;
}

/** One column of the bridge: a floating contribution or an anchor from zero. */
interface Bar {
    node: PnlNode;
    value: number;
    anchor: boolean;
    /** value level the column starts at (anchors: 0) */
    from: number;
    /** value level the column ends at (anchors: the anchor value) */
    to: number;
    /** running total after this column — where the assisting line leaves it */
    level: number;
}

interface Fill {
    fill: string;
    stroke: string;
    strokeWidth: number;
}

// ---- small SVG helpers

function svgEl<K extends keyof SVGElementTagNameMap>(
    tag: K, attrs: Record<string, string | number>
): SVGElementTagNameMap[K] {
    const node = document.createElementNS(SVG_NS, tag);
    for (const key of Object.keys(attrs)) {
        node.setAttribute(key, String(attrs[key]));
    }
    return node;
}

function addTitle(node: SVGElement, text: string): void {
    const t = document.createElementNS(SVG_NS, "title");
    t.textContent = text;
    node.appendChild(t);
}

/** Cheap (deliberately generous) text width estimate — the SVG is not in the
 *  DOM yet when it is returned, so getBBox is not available for clamping. */
const CHAR_W = 0.62;

function estWidth(text: string, fontSize: number): number {
    return text.length * fontSize * CHAR_W;
}

function truncate(text: string, maxWidth: number, fontSize: number): string {
    if (estWidth(text, fontSize) <= maxWidth) { return text; }
    const perChar = fontSize * CHAR_W;
    const max = Math.floor(maxWidth / perChar) - 1;
    if (max <= 0) { return ""; }
    return text.slice(0, max).replace(/\s+$/, "") + "…";
}

function clamp(v: number, lo: number, hi: number): number {
    return hi < lo ? lo : Math.max(lo, Math.min(hi, v));
}

/** Scenario notation: AC solid, PY light, PL/PLFY outlined, FC/FCFY hatched. */
function scenarioFill(cfg: WaterfallConfig): Fill {
    switch (cfg.scenario) {
        case "py":
            return { fill: PY_FILL, stroke: "none", strokeWidth: 0 };
        case "pl":
        case "plfy":
            return { fill: "#FFFFFF", stroke: cfg.colors.ac, strokeWidth: 1 };
        case "fc":
        case "fcfy":
            return { fill: `url(#${cfg.hatchPatternId})`, stroke: cfg.colors.ac, strokeWidth: 1 };
        default:
            return { fill: cfg.colors.ac, stroke: "none", strokeWidth: 0 };
    }
}

function hatchDefs(cfg: WaterfallConfig): SVGDefsElement {
    const defs = svgEl("defs", {});
    const pattern = svgEl("pattern", {
        id: cfg.hatchPatternId, width: 5, height: 5,
        patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)",
    });
    pattern.appendChild(svgEl("rect", { x: 0, y: 0, width: 5, height: 5, fill: "#FFFFFF" }));
    pattern.appendChild(svgEl("line", {
        x1: 0, y1: 0, x2: 0, y2: 5,
        stroke: cfg.colors.ac, "stroke-width": 2,
    }));
    defs.appendChild(pattern);
    return defs;
}

function emptyChart(cfg: WaterfallConfig, message: string): SVGSVGElement {
    const svg = newSvg(cfg);
    const fontSize = 11;
    const text = svgEl("text", {
        x: Math.round(cfg.width / 2), y: Math.round(cfg.height / 2),
        "text-anchor": "middle", "font-size": fontSize,
        "font-family": cfg.fontFamily, fill: cfg.colors.soft,
    });
    text.textContent = truncate(message, Math.max(0, cfg.width - 8), fontSize);
    svg.appendChild(text);
    return svg;
}

function newSvg(cfg: WaterfallConfig): SVGSVGElement {
    const w = Math.max(1, Math.round(cfg.width));
    const h = Math.max(1, Math.round(cfg.height));
    const svg = svgEl("svg", {
        width: w, height: h, viewBox: `0 0 ${w} ${h}`,
        xmlns: SVG_NS, role: "img",
    });
    svg.style.cssText = "display:block;background:#FFFFFF;";
    return svg;
}

// ---- cascade geometry (shared: this column bridge, the row waterfall view of
// the visual and the mega table's Δ waterfall / value cascade, T04 + 12A)

/** One element of a cascade. `children` cascade inside their parent. */
export interface CascadeNode {
    id: string;
    /** contribution in the cascade's orientation; null = no segment (the subtree is skipped) */
    value: number | null;
    /** "=" row: drawn from the zero line, restarts the run (its children start at 0) */
    anchor: boolean;
    children: CascadeNode[];
}

/** anchor = from zero · step = on the running total · span = over its children */
export type CascadeSegType = "anchor" | "step" | "span";
export interface CascadeSeg { s: number; e: number; type: CascadeSegType; }

/**
 * How a non-anchor element WITH children is drawn:
 *  - "value": parent first — it floats on the running total with its own
 *    value, the children cascade inside it from its start, the run then moves
 *    on by the parent's value (row waterfall view, parent-first tree order);
 *  - "span": IBCS statement order (children first, total below, T04B /
 *    12A) — the total spans from the run before its first child to the run
 *    after its last child, the run continues from there. A total without a
 *    drawn child (folded) is an ordinary step.
 */
export type CascadeContainer = "value" | "span";

/**
 * cascade(): every step starts where the previous one ended; anchors draw
 * from 0 and reset the run. Pure numbers — the callers turn the segments into
 * columns (renderWaterfall), row bars (visual: row waterfall) or cell bars
 * (megatable: Δ waterfall, value cascade).
 */
export function cascade(roots: CascadeNode[], container: CascadeContainer): Map<string, CascadeSeg> {
    const out = new Map<string, CascadeSeg>();
    const walk = (nodes: CascadeNode[], start: number): number => {
        let cum = start;
        for (const n of nodes) {
            const v = n.value;
            if (v == null) { continue; }
            if (n.anchor) {
                out.set(n.id, { s: 0, e: v, type: "anchor" });
                walk(n.children, 0);
                cum = v;
            } else if (n.children.length === 0 || container === "value") {
                out.set(n.id, { s: cum, e: cum + v, type: "step" });
                walk(n.children, cum);
                cum += v;
            } else {
                const seg: CascadeSeg = { s: cum, e: cum, type: "span" };
                out.set(n.id, seg);
                const before = out.size;
                const end = walk(n.children, cum);
                if (out.size === before) { seg.e = cum + v; seg.type = "step"; cum += v; }
                else { seg.e = end; cum = end; }
            }
        }
        return cum;
    };
    walk(roots, 0);
    return out;
}

// ---- model → bars

function toBars(rows: PnlNode[], scenario: Scenario): Bar[] {
    const vals = rows.map(node => {
        const type = node.row.rowType;
        const value = type === "kpi" || type === "separator" ? null : node.computed[scenario];
        return value == null || !isFinite(value) ? null : value;
    });
    // formula rows anchor at zero — and 1.7 every stock row (opening and closing
    // balance of a cash-flow bridge): the flows between them float
    const segs = cascade(rows.map((node, i) => ({
        id: String(i), value: vals[i], anchor: node.row.rowType === "formula" || node.stock != null, children: [],
    })), "value");
    const bars: Bar[] = [];
    rows.forEach((node, i) => {
        const seg = segs.get(String(i));
        if (!seg) { return; }
        bars.push({ node, value: vals[i]!, anchor: seg.type === "anchor", from: seg.s, to: seg.e, level: seg.e });
    });
    return bars;
}

/** rows = already filtered, sorted top-level rows (account/subtotal/formula) */
export function renderWaterfall(rows: PnlNode[], cfg: WaterfallConfig): SVGSVGElement {
    const bars = toBars(rows, cfg.scenario);
    if (bars.length === 0) {
        return emptyChart(cfg, cfg.emptyText ?? "No rows to draw a waterfall from");
    }

    const width = Math.max(1, Math.round(cfg.width));
    const height = Math.max(1, Math.round(cfg.height));

    // --- geometry: category slots left→right
    const padX = 6;
    const inner = Math.max(1, width - 2 * padX);
    const slot = inner / bars.length;
    const barW = Math.max(2, Math.min(slot * 0.68, 64));

    // fonts shrink with the slot so labels keep a chance of fitting
    const valueFont = clamp(Math.round(Math.min(slot * 0.42, height * 0.05, 11)), 7, 11);
    const catFont = clamp(valueFont - 0.5, 7, 10.5);

    // --- vertical scale: zero line is never truncated (IBCS CH 1.1)
    let lo = 0;
    let hi = 0;
    for (const b of bars) {
        lo = Math.min(lo, b.from, b.to);
        hi = Math.max(hi, b.from, b.to);
    }
    const span = hi - lo || 1;

    // space reserved so that no label can leave the SVG: one label row above
    // the highest point, one below the lowest, plus the category label row
    const labelH = valueFont + 4;
    const catH = catFont + 6;
    let plotTop = 2 + labelH;
    let plotBottom = height - 2 - catH - labelH;
    if (plotBottom - plotTop < 16) {
        // degenerate size: give the columns what is left, labels get clamped
        plotTop = 1;
        plotBottom = Math.max(plotTop + 4, height - 2 - catH);
    }
    const plotH = plotBottom - plotTop;
    const yOf = (v: number): number => plotTop + ((hi - v) / span) * plotH;
    const zeroY = yOf(0);

    const svg = newSvg(cfg);
    svg.appendChild(hatchDefs(cfg));
    const fillStyle = scenarioFill(cfg);

    // zero / category axis line — the only line besides the assisting lines
    svg.appendChild(svgEl("line", {
        x1: padX - 2, x2: width - padX + 2, y1: zeroY, y2: zeroY,
        stroke: cfg.colors.text, "stroke-width": 1,
    }));

    // --- assisting lines first, so the columns sit on top of them
    for (let i = 0; i < bars.length - 1; i++) {
        const y = yOf(bars[i].level);
        const xFrom = padX + slot * (i + 0.5) + barW / 2;
        const xTo = padX + slot * (i + 1.5) - barW / 2;
        if (xTo <= xFrom) { continue; }
        svg.appendChild(svgEl("line", {
            x1: xFrom, x2: xTo, y1: y, y2: y,
            stroke: cfg.colors.line, "stroke-width": 0.75, opacity: 0.55,
        }));
    }

    // --- columns + value labels + category labels
    for (let i = 0; i < bars.length; i++) {
        const b = bars[i];
        const cx = padX + slot * (i + 0.5);
        const x = cx - barW / 2;
        const yA = yOf(b.from);
        const yB = yOf(b.to);
        const top = Math.min(yA, yB);
        const h = Math.max(Math.abs(yB - yA), 1);

        const rect = svgEl("rect", {
            x, y: top, width: barW, height: h, fill: fillStyle.fill,
        });
        if (fillStyle.strokeWidth > 0) {
            rect.setAttribute("stroke", fillStyle.stroke);
            rect.setAttribute("stroke-width", String(fillStyle.strokeWidth));
        }
        addTitle(rect, `${b.node.row.name}: ${cfg.fmt(b.value)}`);
        svg.appendChild(rect);

        // value label outside the element, in the direction of growth
        const label = truncate(cfg.fmt(b.value), Math.max(0, width - 2), valueFont);
        if (label !== "") {
            const up = b.value >= 0;
            const labelY = up
                ? clamp(top - 3, valueFont + 1, height - 2)
                : clamp(top + h + valueFont, valueFont + 1, height - 2);
            const halfW = estWidth(label, valueFont) / 2;
            const text = svgEl("text", {
                x: clamp(cx, halfW + 1, Math.max(halfW + 1, width - halfW - 1)),
                y: labelY, "text-anchor": "middle", "font-size": valueFont,
                "font-family": cfg.fontFamily, fill: cfg.colors.text,
            });
            if (b.anchor) { text.setAttribute("font-weight", "600"); }
            text.textContent = label;
            svg.appendChild(text);
        }

        // horizontal category label, ellipsised when the slot is too narrow
        const full = b.node.row.name;
        const shown = truncate(full, Math.max(0, slot - 2), catFont);
        if (shown !== "") {
            const catHalf = estWidth(shown, catFont) / 2;
            const cat = svgEl("text", {
                x: clamp(cx, catHalf + 1, Math.max(catHalf + 1, width - catHalf - 1)),
                y: clamp(height - 3, catFont + 1, height - 1),
                "text-anchor": "middle", "font-size": catFont,
                "font-family": cfg.fontFamily,
                fill: b.anchor ? cfg.colors.text : cfg.colors.soft,
            });
            cat.textContent = shown;
            if (shown !== full) { addTitle(cat, full); }
            svg.appendChild(cat);
        }
    }

    return svg;
}
