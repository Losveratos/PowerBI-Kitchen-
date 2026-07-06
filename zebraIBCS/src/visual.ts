/*
 *  zebraIBCS — IBCS business chart for Power BI (Zebra BI inspired)
 *
 *  One visual that covers the core IBCS report chart:
 *    - Base chart with scenario notation: AC solid, PY grey, PL outlined, FC hatched
 *    - Absolute variance panel (ΔPY / ΔPL) with good/bad coloring
 *    - Relative variance panel (ΔPY % / ΔPL %) as pin chart
 *    - Columns (time) and bars (structure) orientation
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import ITooltipService = powerbi.extensibility.ITooltipService;
import DataView = powerbi.DataView;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel } from "./settings";

const SVG_NS = "http://www.w3.org/2000/svg";

type Orientation = "columns" | "bars";
type Basis = "py" | "plan";

interface DataPoint {
    cat: string;
    ac: number | null;
    py: number | null;
    pl: number | null;
    fc: number | null;
    /** value shown in the base chart: AC, or FC where AC is missing */
    value: number | null;
    isFc: boolean;
    basis: number | null;
    varAbs: number | null;
    varRel: number | null;
    sel: ISelectionId;
}

interface Rect { x: number; y: number; w: number; h: number; }

interface Scale { (v: number): number; }

interface PanelCtx {
    rect: Rect;
    scale: Scale;
    title: string;
}

function linearScale(d0: number, d1: number, r0: number, r1: number): Scale {
    const dd = (d1 - d0) || 1;
    return (v: number) => r0 + ((v - d0) / dd) * (r1 - r0);
}

function extent(values: (number | null)[]): [number, number] {
    let mn = 0, mx = 0;
    for (const v of values) {
        if (v == null || !isFinite(v)) { continue; }
        if (v < mn) { mn = v; }
        if (v > mx) { mx = v; }
    }
    return [mn, mx];
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private host: IVisualHost;
    private root: HTMLElement;
    private svg: SVGSVGElement;
    private landing: HTMLDivElement;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private catGroups: { g: SVGGElement; sel: ISelectionId }[] = [];
    private static instanceCounter = 0;
    private instanceId: number;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.root = options.element;
        this.root.classList.add("zebra-ibcs-root");
        this.instanceId = Visual.instanceCounter++;

        this.svg = document.createElementNS(SVG_NS, "svg");
        this.root.appendChild(this.svg);

        this.landing = document.createElement("div");
        this.landing.className = "zebra-ibcs-landing";
        this.landing.style.display = "none";
        this.root.appendChild(this.landing);

        // click on empty space clears selection, right click opens context menu
        this.svg.addEventListener("click", () => {
            this.selectionManager.clear();
            this.applySelectionOpacity([]);
        });
        this.svg.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.selectionManager.showContextMenu(null, { x: e.clientX, y: e.clientY });
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView: DataView | undefined = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);

            const width = options.viewport.width;
            const height = options.viewport.height;
            this.svg.setAttribute("width", String(width));
            this.svg.setAttribute("height", String(height));

            const points = this.parseData(dataView);
            if (!points || points.length === 0) {
                this.showLanding();
                this.events.renderingFinished(options);
                return;
            }
            this.landing.style.display = "none";
            this.svg.style.display = "block";
            this.render(points, width, height);
            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ------------------------------------------------------------------ data

    private parseData(dataView: DataView | undefined): DataPoint[] | null {
        const cat = dataView?.categorical?.categories?.[0];
        const valueCols = dataView?.categorical?.values;
        if (!cat || !valueCols || valueCols.length === 0) { return null; }

        const byRole: { [role: string]: (number | null)[] } = {};
        for (const col of valueCols) {
            const roles = col.source.roles || {};
            for (const role of ["actual", "previousYear", "plan", "forecast"]) {
                if (roles[role]) {
                    byRole[role] = col.values.map(v => (typeof v === "number" && isFinite(v)) ? v : null);
                }
            }
        }
        if (!byRole["actual"] && !byRole["forecast"]) { return null; }

        const basisMode = this.resolveBasis(byRole);
        const points: DataPoint[] = [];
        for (let i = 0; i < cat.values.length; i++) {
            const ac = byRole["actual"] ? byRole["actual"][i] : null;
            const py = byRole["previousYear"] ? byRole["previousYear"][i] : null;
            const pl = byRole["plan"] ? byRole["plan"][i] : null;
            const fc = byRole["forecast"] ? byRole["forecast"][i] : null;
            const isFc = ac == null && fc != null;
            const value = ac != null ? ac : fc;
            const basis = basisMode === "plan" ? pl : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            points.push({
                cat: this.categoryLabel(cat.values[i]),
                ac, py, pl, fc, value, isFc, basis, varAbs, varRel,
                sel: this.host.createSelectionIdBuilder().withCategory(cat, i).createSelectionId()
            });
        }
        return points;
    }

    private categoryLabel(v: powerbi.PrimitiveValue): string {
        if (v == null) { return "(blank)"; }
        if (v instanceof Date) {
            return v.toLocaleDateString(this.host.locale, { year: "2-digit", month: "short" });
        }
        return String(v);
    }

    private resolveBasis(byRole: { [role: string]: (number | null)[] }): Basis {
        const mode = String(this.formattingSettings.chartCard.comparisonMode.value.value);
        if (mode === "py") { return "py"; }
        if (mode === "plan") { return "plan"; }
        // auto: prefer plan if the role is filled, otherwise previous year
        return byRole["plan"] && byRole["plan"].some(v => v != null) ? "plan" : "py";
    }

    // ------------------------------------------------------------ formatting

    private unitDivisor(maxAbs: number): { div: number; suffix: string } {
        const unit = String(this.formattingSettings.labelsCard.displayUnits.value.value);
        if (unit === "k") { return { div: 1e3, suffix: "k" }; }
        if (unit === "m") { return { div: 1e6, suffix: "M" }; }
        if (unit === "b") { return { div: 1e9, suffix: "B" }; }
        if (unit === "none") { return { div: 1, suffix: "" }; }
        if (maxAbs >= 1e9) { return { div: 1e9, suffix: "B" }; }
        if (maxAbs >= 1e6) { return { div: 1e6, suffix: "M" }; }
        if (maxAbs >= 1e4) { return { div: 1e3, suffix: "k" }; }
        return { div: 1, suffix: "" };
    }

    private fmtValue(v: number, unit: { div: number; suffix: string }, signed = false): string {
        const decimals = Math.max(0, Math.min(3, this.formattingSettings.labelsCard.decimals.value ?? 1));
        const scaled = v / unit.div;
        const abs = Math.abs(scaled);
        const nf = new Intl.NumberFormat(this.host.locale, {
            minimumFractionDigits: unit.div === 1 && Number.isInteger(scaled) ? 0 : decimals,
            maximumFractionDigits: unit.div === 1 && Number.isInteger(scaled) ? 0 : decimals
        });
        const sign = signed ? (v > 0 ? "+" : v < 0 ? "−" : "") : (v < 0 ? "−" : "");
        return sign + nf.format(abs) + unit.suffix;
    }

    private fmtPercent(v: number): string {
        const nf = new Intl.NumberFormat(this.host.locale, {
            minimumFractionDigits: 1, maximumFractionDigits: 1
        });
        const sign = v > 0 ? "+" : v < 0 ? "−" : "";
        return sign + nf.format(Math.abs(v)) + "%";
    }

    // --------------------------------------------------------------- landing

    private showLanding(): void {
        this.svg.style.display = "none";
        this.landing.style.display = "flex";
        while (this.landing.firstChild) { this.landing.removeChild(this.landing.firstChild); }
        const box = document.createElement("div");
        const h = document.createElement("h3");
        h.textContent = "IBCS Business Chart";
        const p = document.createElement("p");
        p.textContent = "Füge mindestens Category und Actual (AC) hinzu. "
            + "Optional: Previous Year (PY), Plan/Budget (PL) und Forecast (FC) "
            + "für IBCS-Szenario-Notation und Abweichungs-Panels.";
        box.appendChild(h);
        box.appendChild(p);
        this.landing.appendChild(box);
    }

    // ---------------------------------------------------------------- render

    private render(points: DataPoint[], width: number, height: number): void {
        while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
        this.catGroups = [];

        const s = this.formattingSettings;
        const orientation = String(s.chartCard.orientation.value.value) as Orientation;
        const showLabels = s.labelsCard.show.value;
        const labelFont = s.labelsCard.fontSize.value;
        const catFont = s.categoryAxisCard.fontSize.value;
        const invert = s.chartCard.invert.value;
        const colors = {
            ac: s.colorsCard.actualColor.value.value,
            py: s.colorsCard.previousYearColor.value.value,
            pl: s.colorsCard.planColor.value.value,
            good: s.colorsCard.goodColor.value.value,
            bad: s.colorsCard.badColor.value.value
        };

        const hasPy = points.some(p => p.py != null);
        const hasPl = points.some(p => p.pl != null);
        const hasVar = points.some(p => p.varAbs != null);
        const basisMode: Basis = this.resolveBasisLabel(points);
        const basisLabel = basisMode === "plan" ? "PL" : "PY";
        const showAbs = s.chartCard.showAbsoluteVariance.value && hasVar;
        const showRel = s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null);

        // hatch pattern for forecast
        const defs = this.el("defs", {}, this.svg);
        const patId = `zibcs-hatch-${this.instanceId}`;
        const pat = this.el("pattern", {
            id: patId, patternUnits: "userSpaceOnUse", width: 5, height: 5,
            patternTransform: "rotate(45)"
        }, defs);
        this.el("rect", { width: 5, height: 5, fill: "#FFFFFF" }, pat);
        this.el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke: colors.ac, "stroke-width": 2.5 }, pat);

        // ------- layout: band axis shared, panels split along the value axis
        const n = points.length;
        const pad = 4;
        const titleH = 14;
        const unit = this.unitDivisor(Math.max(...points.map(p =>
            Math.max(Math.abs(p.value ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0)))));

        let bandStart: number, bandEnd: number;
        let panels: { main: Rect; abs?: Rect; rel?: Rect };

        if (orientation === "columns") {
            const catArea = catFont + 10;
            bandStart = pad + 2;
            bandEnd = width - pad;
            const plotTop = pad, plotBottom = height - catArea;
            panels = this.splitPanels(plotTop, plotBottom - plotTop, showAbs, showRel, true);
        } else {
            const catArea = Math.min(width * 0.28, this.maxTextWidth(points.map(p => p.cat), catFont) + 12);
            bandStart = pad + titleH + 2; // room for panel titles above the first bar
            bandEnd = height - pad;
            const plotLeft = pad + catArea, plotRight = width - pad;
            panels = this.splitPanels(plotLeft, plotRight - plotLeft, showAbs, showRel, false);
        }

        const bandSpan = bandEnd - bandStart;
        const step = bandSpan / n;
        const slotW = Math.max(2, step * 0.62);
        const barW = hasPy ? slotW * 0.82 : slotW;
        const pyShift = hasPy ? slotW - barW : 0;
        const slotPos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        // ------- scales
        const labelPad = showLabels ? labelFont + 6 : 6;
        const mainScale = this.makePanelScale(
            extent(points.flatMap(p => [p.value, p.py, p.pl, p.fc])),
            panels.main, orientation, labelPad);
        const absScale = panels.abs ? this.makePanelScale(
            extent(points.map(p => p.varAbs)), panels.abs, orientation, labelPad) : null;
        const relScale = panels.rel ? this.makePanelScale(
            extent(points.map(p => p.varRel)), panels.rel, orientation, labelPad) : null;

        // ------- background layer: baselines + panel titles
        const bg = this.el("g", {}, this.svg);
        const scenarioTitle = ["AC", hasPy ? "PY" : "", hasPl ? "PL" : "",
            points.some(p => p.isFc) ? "FC" : ""].filter(x => x).join(" · ");
        this.drawBaseline(bg, panels.main, mainScale, orientation, bandStart, bandEnd, "ac", colors);
        this.drawPanelTitle(bg, panels.main, scenarioTitle, orientation, titleH);
        if (panels.abs && absScale) {
            this.drawBaseline(bg, panels.abs, absScale, orientation, bandStart, bandEnd, basisMode, colors);
            this.drawPanelTitle(bg, panels.abs, `Δ${basisLabel}`, orientation, titleH);
        }
        if (panels.rel && relScale) {
            this.drawBaseline(bg, panels.rel, relScale, orientation, bandStart, bandEnd, basisMode, colors);
            this.drawPanelTitle(bg, panels.rel, `Δ${basisLabel} %`, orientation, titleH);
        }

        // ------- category groups with all marks
        const marks = this.el("g", {}, this.svg);
        for (let i = 0; i < n; i++) {
            const p = points[i];
            const g = this.el("g", { "class": "zibcs-cat" }, marks) as SVGGElement;
            const pos = slotPos(i);

            // base chart: PY behind, PL outline, AC/FC on top
            if (p.py != null) {
                this.drawBar(g, pos, barW, 0, p.py, mainScale, orientation,
                    { fill: colors.py });
            }
            if (p.pl != null) {
                this.drawBar(g, pos + pyShift, barW, 0, p.pl, mainScale, orientation,
                    { fill: "#FFFFFF", stroke: colors.pl, "stroke-width": 1.4 });
            }
            if (p.value != null) {
                this.drawBar(g, pos + pyShift, barW, 0, p.value, mainScale, orientation,
                    p.isFc
                        ? { fill: `url(#${patId})`, stroke: colors.ac, "stroke-width": 1 }
                        : { fill: colors.ac });
                if (showLabels && step > labelFont * 1.4) {
                    // anchor the label beyond the PL outline when the plan column is taller
                    const anchor = p.pl != null
                        ? (p.value >= 0 ? Math.max(p.value, p.pl) : Math.min(p.value, p.pl))
                        : p.value;
                    this.drawEndLabelAt(g, pos + pyShift + barW / 2, anchor, p.value >= 0, mainScale,
                        orientation, this.fmtValue(p.value, unit), labelFont, "#404040");
                }
            }

            // absolute variance bars
            if (panels.abs && absScale && p.varAbs != null) {
                const good = invert ? p.varAbs < 0 : p.varAbs > 0;
                const color = p.varAbs === 0 ? colors.py : (good ? colors.good : colors.bad);
                const vw = slotW * 0.55;
                const vx = pos + pyShift + barW / 2 - vw / 2;
                this.drawBar(g, vx, vw, 0, p.varAbs, absScale, orientation,
                    p.isFc
                        ? { fill: color, "fill-opacity": 0.55, stroke: color, "stroke-width": 1 }
                        : { fill: color });
                if (showLabels && step > labelFont * 1.4) {
                    this.drawEndLabel(g, vx + vw / 2, p.varAbs, absScale, orientation,
                        this.fmtValue(p.varAbs, unit, true), labelFont, "#404040");
                }
            }

            // relative variance pins
            if (panels.rel && relScale && p.varRel != null) {
                const good = invert ? p.varRel < 0 : p.varRel > 0;
                const color = p.varRel === 0 ? colors.py : (good ? colors.good : colors.bad);
                const c = pos + pyShift + barW / 2;
                const zero = relScale(0);
                const end = relScale(p.varRel);
                const r = Math.max(2.5, Math.min(4.5, slotW * 0.12));
                if (orientation === "columns") {
                    this.el("line", { x1: c, y1: zero, x2: c, y2: end, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: c, cy: end, r, fill: p.isFc ? "#FFFFFF" : color, stroke: color, "stroke-width": 1.6 }, g);
                } else {
                    this.el("line", { x1: zero, y1: c, x2: end, y2: c, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: end, cy: c, r, fill: p.isFc ? "#FFFFFF" : color, stroke: color, "stroke-width": 1.6 }, g);
                }
                if (showLabels && step > labelFont * 1.4) {
                    this.drawEndLabel(g, c, p.varRel, relScale, orientation,
                        this.fmtPercent(p.varRel), labelFont, "#404040", r + 3);
                }
            }

            // category label
            this.drawCategoryLabel(g, p.cat, pos + slotW / 2, orientation, catFont,
                width, height, step, bandStart, panels.main);

            this.attachInteraction(g, p, unit, basisLabel);
            this.catGroups.push({ g, sel: p.sel });
        }
    }

    private resolveBasisLabel(points: DataPoint[]): Basis {
        // the basis that parseData actually used: check whether basis matches pl
        for (const p of points) {
            if (p.basis != null) {
                if (p.pl != null && p.basis === p.pl && p.basis !== p.py) { return "plan"; }
                if (p.py != null && p.basis === p.py) { return "py"; }
            }
        }
        const mode = String(this.formattingSettings.chartCard.comparisonMode.value.value);
        return mode === "plan" ? "plan" : "py";
    }

    // ------------------------------------------------------------ primitives

    private el<K extends keyof SVGElementTagNameMap>(
        tag: K, attrs: Record<string, string | number>, parent: Node
    ): SVGElementTagNameMap[K] {
        const node = document.createElementNS(SVG_NS, tag);
        for (const k of Object.keys(attrs)) {
            node.setAttribute(k, String(attrs[k]));
        }
        parent.appendChild(node);
        return node;
    }

    private splitPanels(start: number, span: number, showAbs: boolean, showRel: boolean, vertical: boolean)
        : { main: Rect; abs?: Rect; rel?: Rect } {
        const gap = 10;
        // vertical (columns): order top→bottom rel, abs, main; horizontal (bars): main, abs, rel
        const parts: { key: "main" | "abs" | "rel"; share: number }[] = [];
        if (vertical) {
            if (showRel) { parts.push({ key: "rel", share: 0.34 }); }
            if (showAbs) { parts.push({ key: "abs", share: 0.38 }); }
            parts.push({ key: "main", share: 1 });
        } else {
            parts.push({ key: "main", share: 1 });
            if (showAbs) { parts.push({ key: "abs", share: 0.32 }); }
            if (showRel) { parts.push({ key: "rel", share: 0.26 }); }
        }
        const totalShare = parts.reduce((a, b) => a + b.share, 0);
        const usable = span - gap * (parts.length - 1);
        const out: { main?: Rect; abs?: Rect; rel?: Rect } = {};
        let cursor = start;
        for (const part of parts) {
            const size = usable * (part.share / totalShare);
            out[part.key] = vertical
                ? { x: 0, y: cursor, w: 0, h: size }
                : { x: cursor, y: 0, w: size, h: 0 };
            cursor += size + gap;
        }
        return out as { main: Rect; abs?: Rect; rel?: Rect };
    }

    private makePanelScale(domain: [number, number], rect: Rect, orientation: Orientation, labelPad: number): Scale {
        let [mn, mx] = domain;
        if (mn === 0 && mx === 0) { mx = 1; }
        const span = mx - mn;
        // headroom for labels at both value ends
        const padFrac = 0.02;
        const mnp = mn < 0 ? mn - span * padFrac : mn;
        const mxp = mx > 0 ? mx + span * padFrac : mx;
        if (orientation === "columns") {
            const top = rect.y + (mx > 0 ? labelPad + 12 : 12);
            const bottom = rect.y + rect.h - (mn < 0 ? labelPad : 2);
            return linearScale(mnp, mxp, bottom, top);
        } else {
            const left = rect.x + (mn < 0 ? labelPad + 4 : 4);
            const right = rect.x + rect.w - (mx > 0 ? labelPad + 24 : 4);
            return linearScale(mnp, mxp, left, right);
        }
    }

    /** IBCS baseline notation: AC solid black, PY fat grey, PL double line */
    private drawBaseline(parent: SVGElement, rect: Rect, scale: Scale, orientation: Orientation,
        bandStart: number, bandEnd: number, kind: "ac" | Basis,
        colors: { ac: string; py: string; pl: string }): void {
        const zero = scale(0);
        const line = (offset: number, stroke: string, w: number) => {
            if (orientation === "columns") {
                this.el("line", { x1: bandStart, y1: zero + offset, x2: bandEnd, y2: zero + offset, stroke, "stroke-width": w }, parent);
            } else {
                this.el("line", { x1: zero + offset, y1: bandStart, x2: zero + offset, y2: bandEnd, stroke, "stroke-width": w }, parent);
            }
        };
        if (kind === "ac") {
            line(0, colors.ac, 1.6);
        } else if (kind === "py") {
            line(0, colors.py, 3);
        } else {
            line(-1.2, colors.pl, 1);
            line(1.2, colors.pl, 1);
        }
    }

    private drawPanelTitle(parent: SVGElement, rect: Rect, text: string, orientation: Orientation, titleH: number): void {
        const attrs = orientation === "columns"
            ? { x: 6, y: rect.y + titleH - 4 }
            : { x: rect.x + 2, y: 12 };
        const t = this.el("text", {
            ...attrs, "font-size": 10, fill: "#8A8A8A",
            "font-family": "'Segoe UI', sans-serif", "font-weight": 600
        }, parent);
        t.textContent = text;
    }

    /** draws a rect from 0 to v along the value axis at band position bp with band width bw */
    private drawBar(parent: SVGElement, bp: number, bw: number, from: number, to: number,
        scale: Scale, orientation: Orientation, style: Record<string, string | number>): void {
        const a = scale(from), b = scale(to);
        const lo = Math.min(a, b), hi = Math.max(a, b);
        const size = Math.max(hi - lo, 0.5);
        if (orientation === "columns") {
            this.el("rect", { x: bp, y: lo, width: bw, height: size, ...style }, parent);
        } else {
            this.el("rect", { x: lo, y: bp, width: size, height: bw, ...style }, parent);
        }
    }

    private drawEndLabel(parent: SVGElement, bandCenter: number, v: number, scale: Scale,
        orientation: Orientation, text: string, fontSize: number, fill: string, extraGap = 0): void {
        this.drawEndLabelAt(parent, bandCenter, v, v >= 0, scale, orientation, text, fontSize, fill, extraGap);
    }

    private drawEndLabelAt(parent: SVGElement, bandCenter: number, anchorValue: number, positive: boolean,
        scale: Scale, orientation: Orientation, text: string, fontSize: number, fill: string, extraGap = 0): void {
        const end = scale(anchorValue);
        let attrs: Record<string, string | number>;
        if (orientation === "columns") {
            attrs = positive
                ? { x: bandCenter, y: end - 4 - extraGap, "text-anchor": "middle" }
                : { x: bandCenter, y: end + fontSize + 2 + extraGap, "text-anchor": "middle" };
        } else {
            attrs = positive
                ? { x: end + 4 + extraGap, y: bandCenter + fontSize * 0.35, "text-anchor": "start" }
                : { x: end - 4 - extraGap, y: bandCenter + fontSize * 0.35, "text-anchor": "end" };
        }
        const t = this.el("text", {
            ...attrs, "font-size": fontSize, fill,
            "font-family": "'Segoe UI', sans-serif",
            stroke: "#FFFFFF", "stroke-width": 3, "paint-order": "stroke",
            "stroke-linejoin": "round"
        }, parent);
        t.textContent = text;
    }

    private drawCategoryLabel(parent: SVGElement, text: string, bandCenter: number,
        orientation: Orientation, fontSize: number, width: number, height: number,
        step: number, bandStart: number, mainRect: Rect): void {
        let attrs: Record<string, string | number>;
        let maxW: number;
        if (orientation === "columns") {
            attrs = { x: bandCenter, y: height - 3, "text-anchor": "middle" };
            maxW = step - 2;
        } else {
            attrs = { x: mainRect.x - 6, y: bandCenter + fontSize * 0.35, "text-anchor": "end" };
            maxW = mainRect.x - 8;
        }
        const t = this.el("text", {
            ...attrs, "font-size": fontSize, fill: "#404040",
            "font-family": "'Segoe UI', sans-serif"
        }, parent);
        t.textContent = this.truncate(text, maxW, fontSize);
    }

    private truncate(text: string, maxWidth: number, fontSize: number): string {
        const charW = fontSize * 0.56;
        const maxChars = Math.max(1, Math.floor(maxWidth / charW));
        if (text.length <= maxChars) { return text; }
        if (maxChars <= 2) { return text.slice(0, 1); }
        return text.slice(0, maxChars - 1) + "…";
    }

    private maxTextWidth(labels: string[], fontSize: number): number {
        const longest = labels.reduce((a, b) => (b.length > a.length ? b : a), "");
        return longest.length * fontSize * 0.56;
    }

    // ---------------------------------------------------------- interaction

    private attachInteraction(g: SVGGElement, p: DataPoint,
        unit: { div: number; suffix: string }, basisLabel: string): void {
        g.style.cursor = "pointer";
        g.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            this.selectionManager.select(p.sel, e.ctrlKey || e.metaKey).then((ids: ISelectionId[]) => {
                this.applySelectionOpacity(ids);
            });
        });
        g.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.selectionManager.showContextMenu(p.sel, { x: e.clientX, y: e.clientY });
        });

        const items = (): VisualTooltipDataItem[] => {
            const out: VisualTooltipDataItem[] = [];
            const add = (name: string, v: number | null, signed = false, pct = false) => {
                if (v == null) { return; }
                out.push({
                    displayName: name,
                    value: pct ? this.fmtPercent(v) : this.fmtValue(v, unit, signed)
                });
            };
            out.push({ displayName: "Category", value: p.cat });
            add("Actual (AC)", p.ac);
            add("Forecast (FC)", p.fc);
            add("Previous Year (PY)", p.py);
            add("Plan (PL)", p.pl);
            add(`Δ${basisLabel}`, p.varAbs, true);
            add(`Δ${basisLabel} %`, p.varRel, true, true);
            return out;
        };
        g.addEventListener("mouseover", (e: MouseEvent) => {
            this.tooltipService.show({
                dataItems: items(),
                identities: [p.sel],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mousemove", (e: MouseEvent) => {
            this.tooltipService.move({
                dataItems: items(),
                identities: [p.sel],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mouseout", () => {
            this.tooltipService.hide({ immediately: false, isTouchEvent: false });
        });
    }

    private applySelectionOpacity(selected: ISelectionId[]): void {
        const hasSelection = selected && selected.length > 0;
        for (const cg of this.catGroups) {
            const isSel = hasSelection && selected.some(s => s.equals(cg.sel));
            cg.g.setAttribute("opacity", !hasSelection || isSel ? "1" : "0.35");
        }
    }
}
