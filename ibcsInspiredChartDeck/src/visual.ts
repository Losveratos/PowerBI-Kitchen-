/*
 *  IBCS Inspired Chart Deck — IBCS business chart custom visual for Power BI
 *
 *  One visual that covers the core IBCS report chart:
 *    - Base chart with scenario notation: AC solid, PY grey, PL outlined, FC hatched
 *    - Absolute variance panel (ΔPY / ΔPL) with good/bad coloring
 *    - Relative variance panel (ΔPY % / ΔPL %) as pin chart
 *    - Columns (time) and bars (structure) orientation
 *    - Compact mode for small tiles, label thinning for dense axes
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
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
import IValueFormatter = valueFormatter.IValueFormatter;

import { VisualFormattingSettingsModel } from "./settings";

const SVG_NS = "http://www.w3.org/2000/svg";
const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";
const INK = "#404040";

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
    comment: string | null;
    /** 1-based comment marker number, assigned in category order */
    commentNo: number | null;
    sel: ISelectionId | null;
}

interface Rect { x: number; y: number; w: number; h: number; }

interface Scale { (v: number): number; }

/** per-render configuration shared by all chart regions */
interface ChartConfig {
    orientation: Orientation;
    showLabels: boolean;
    labelFont: number;
    catFont: number;
    invert: boolean;
    colors: { ac: string; py: string; pl: string; good: string; bad: string };
    basisMode: Basis;
    basisLabel: string;
    showAbs: boolean;
    showRel: boolean;
    showTotal: boolean;
    patId: string;
    fmt: IValueFormatter;
    /** formatter scaled to the variance magnitudes (auto units) */
    fmtVar: IValueFormatter;
    hasPy: boolean;
    hasPl: boolean;
    hasFc: boolean;
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
    private catGroups: { g: SVGGElement; sel: ISelectionId | null }[] = [];
    private measureFormat: string | undefined;
    private static instanceCounter = 0;
    private instanceId: number;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.root = options.element;
        this.root.classList.add("icd-root");
        this.instanceId = Visual.instanceCounter++;

        this.svg = document.createElementNS(SVG_NS, "svg");
        this.root.appendChild(this.svg);

        this.landing = document.createElement("div");
        this.landing.className = "icd-landing";
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
        let comments: (string | null)[] | null = null;
        this.measureFormat = undefined;
        for (const col of valueCols) {
            const roles = col.source.roles || {};
            for (const role of ["actual", "previousYear", "plan", "forecast"]) {
                if (roles[role]) {
                    byRole[role] = col.values.map(v => (typeof v === "number" && isFinite(v)) ? v : null);
                    if ((role === "actual" || (role === "forecast" && !this.measureFormat)) && col.source.format) {
                        this.measureFormat = col.source.format;
                    }
                }
            }
            if (roles["comments"]) {
                comments = col.values.map(v =>
                    v != null && String(v).trim() !== "" ? String(v) : null);
            }
        }
        if (!byRole["actual"] && !byRole["forecast"]) { return null; }

        const basisMode = this.resolveBasis(byRole);
        const points: DataPoint[] = [];
        let commentCounter = 0;
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
            const comment = comments ? comments[i] : null;
            points.push({
                cat: this.categoryLabel(cat.values[i]),
                ac, py, pl, fc, value, isFc, basis, varAbs, varRel,
                comment,
                commentNo: comment != null ? ++commentCounter : null,
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

    private makeFormatter(maxAbs: number, allIntegers: boolean): IValueFormatter {
        const decimals = Math.max(0, Math.min(3, this.formattingSettings.labelsCard.decimals.value ?? 1));
        const unit = String(this.formattingSettings.labelsCard.displayUnits.value.value);
        let unitValue: number;
        switch (unit) {
            case "none": unitValue = 0; break;
            case "k": unitValue = 1e3; break;
            case "m": unitValue = 1e6; break;
            case "b": unitValue = 1e9; break;
            default: unitValue = maxAbs >= 1e4 ? maxAbs : 0; break;
        }
        // unscaled integers need no forced decimals
        const precision = unitValue === 0 && allIntegers ? 0 : decimals;
        return valueFormatter.create({
            format: this.measureFormat,
            value: unitValue,
            precision,
            cultureSelector: this.host.locale
        });
    }

    private fmtSigned(fmt: IValueFormatter, v: number): string {
        return (v > 0 ? "+" : "") + fmt.format(v);
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
        h.textContent = "IBCS Inspired Chart Deck";
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

        // top N + rest aggregation (structure comparisons only)
        const topN = Math.round(s.chartCard.topN.value ?? 0);
        if (orientation === "bars" && topN > 0 && points.length > topN + 1) {
            points = this.applyTopN(points, topN);
        }

        const maxAbs = Math.max(...points.map(p =>
            Math.max(Math.abs(p.value ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0))), 0);
        const maxVarAbs = Math.max(...points.map(p => Math.abs(p.varAbs ?? 0)), 0);
        const allInt = points.every(p =>
            [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v)));
        const allVarInt = points.every(p => p.varAbs == null || Number.isInteger(p.varAbs));

        const basisMode: Basis = this.resolveBasisLabel(points);
        const hasVar = points.some(p => p.varAbs != null);
        const cfg: ChartConfig = {
            orientation,
            showLabels: s.labelsCard.show.value,
            labelFont: s.labelsCard.fontSize.value,
            catFont: s.categoryAxisCard.fontSize.value,
            invert: s.chartCard.invert.value,
            colors: {
                ac: s.colorsCard.actualColor.value.value,
                py: s.colorsCard.previousYearColor.value.value,
                pl: s.colorsCard.planColor.value.value,
                good: s.colorsCard.goodColor.value.value,
                bad: s.colorsCard.badColor.value.value
            },
            basisMode,
            basisLabel: basisMode === "plan" ? "PL" : "PY",
            showAbs: s.chartCard.showAbsoluteVariance.value && hasVar,
            showRel: s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null),
            showTotal: s.chartCard.showTotal.value,
            patId: `icd-hatch-${this.instanceId}`,
            fmt: this.makeFormatter(maxAbs, allInt),
            fmtVar: this.makeFormatter(maxVarAbs, allVarInt),
            hasPy: points.some(p => p.py != null),
            hasPl: points.some(p => p.pl != null),
            hasFc: points.some(p => p.isFc)
        };

        // hatch pattern for forecast
        const defs = this.el("defs", {}, this.svg);
        const pat = this.el("pattern", {
            id: cfg.patId, patternUnits: "userSpaceOnUse", width: 5, height: 5,
            patternTransform: "rotate(45)"
        }, defs);
        this.el("rect", { width: 5, height: 5, fill: "#FFFFFF" }, pat);
        this.el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke: cfg.colors.ac, "stroke-width": 2.5 }, pat);

        this.renderChart(points, { x: 0, y: 0, w: width, h: height }, cfg);
    }

    /** renders one complete IBCS chart (base + variance panels) into the given region */
    private renderChart(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = points.length;
        const pad = 4;
        const titleH = 14;
        const orientation = cfg.orientation;

        // compact mode: too little room for variance panels → deltas become labels
        const compact = orientation === "columns" ? region.h < 190 : region.w < 420;
        const showAbs = cfg.showAbs && !compact;
        const showRel = cfg.showRel && !compact;
        // total (Σ) header row on top of the region
        const showTotal = cfg.showTotal && region.w > 240;
        const headerH = showTotal ? 17 : 0;

        let bandStart: number, bandEnd: number;
        let panels: { main: Rect; abs?: Rect; rel?: Rect };

        if (orientation === "columns") {
            const catArea = cfg.catFont + 10;
            bandStart = region.x + pad + 2;
            bandEnd = region.x + region.w - pad;
            const plotTop = region.y + pad + headerH, plotBottom = region.y + region.h - catArea;
            panels = this.splitPanels(plotTop, plotBottom - plotTop, showAbs, showRel, true, region);
        } else {
            const catArea = Math.min(region.w * 0.28, this.maxTextWidth(points.map(p => p.cat), cfg.catFont) + 12);
            // room for the header and the panel titles above the first bar
            bandStart = region.y + pad + headerH + titleH + 2;
            bandEnd = region.y + region.h - pad;
            const plotLeft = region.x + pad + catArea, plotRight = region.x + region.w - pad;
            panels = this.splitPanels(plotLeft, plotRight - plotLeft, showAbs, showRel, false, region);
        }

        const bandSpan = bandEnd - bandStart;
        const step = bandSpan / n;
        const slotW = Math.max(2, step * 0.62);
        const barW = cfg.hasPy ? slotW * 0.82 : slotW;
        const pyShift = cfg.hasPy ? slotW - barW : 0;
        const slotPos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        // ------- precompute label texts + thinning predicates
        const valueTexts = points.map(p => p.value != null ? cfg.fmt.format(p.value) : "");
        const absTexts = points.map(p => p.varAbs != null ? this.fmtSigned(cfg.fmtVar, p.varAbs) : "");
        const relTexts = points.map(p => p.varRel != null ? this.fmtPercent(p.varRel) : "");
        const showValueAt = this.labelPredicate(points, valueTexts, cfg.labelFont, step, orientation);
        const showAbsAt = this.labelPredicate(points, absTexts, cfg.labelFont, step, orientation);
        const showRelAt = this.labelPredicate(points, relTexts, cfg.labelFont, step, orientation);
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cfg.catFont, step, orientation);

        // ------- scales
        const labelPad = cfg.showLabels ? cfg.labelFont + 6 : 6;
        const compactLabelPad = compact && cfg.showLabels && orientation === "columns"
            ? labelPad + cfg.labelFont + 4 : labelPad;
        const mainScale = this.makePanelScale(
            extent(points.flatMap(p => [p.value, p.py, p.pl, p.fc])),
            panels.main, orientation, compactLabelPad);
        const absScale = panels.abs ? this.makePanelScale(
            extent(points.map(p => p.varAbs)), panels.abs, orientation, labelPad) : null;
        const relScale = panels.rel ? this.makePanelScale(
            extent(points.map(p => p.varRel)), panels.rel, orientation, labelPad) : null;

        // ------- background layer: baselines + panel titles
        const bg = this.el("g", {}, this.svg);
        const scenarioTitle = ["AC", cfg.hasPy ? "PY" : "", cfg.hasPl ? "PL" : "",
            cfg.hasFc ? "FC" : ""].filter(x => x).join(" · ");
        this.drawBaseline(bg, panels.main, mainScale, orientation, bandStart, bandEnd, "ac", cfg.colors);
        const compactVarHint = compact && (cfg.showAbs || cfg.showRel)
            ? `  ·  Δ${cfg.basisLabel}${cfg.showRel ? " %" : ""}` : "";
        const barsTitleY = orientation === "bars" ? bandStart - 6 : undefined;
        this.drawPanelTitle(bg, panels.main, scenarioTitle + compactVarHint,
            orientation, titleH, region, barsTitleY);
        if (panels.abs && absScale) {
            this.drawBaseline(bg, panels.abs, absScale, orientation, bandStart, bandEnd, cfg.basisMode, cfg.colors);
            this.drawPanelTitle(bg, panels.abs, `Δ${cfg.basisLabel}`, orientation, titleH, region, barsTitleY);
        }
        if (panels.rel && relScale) {
            this.drawBaseline(bg, panels.rel, relScale, orientation, bandStart, bandEnd, cfg.basisMode, cfg.colors);
            this.drawPanelTitle(bg, panels.rel, `Δ${cfg.basisLabel} %`, orientation, titleH, region, barsTitleY);
        }

        // ------- total (Σ) header
        if (showTotal) {
            this.drawTotalHeader(bg, region, points, cfg);
        }

        // ------- AC → FC boundary separator (time series only)
        if (orientation === "columns" && cfg.hasFc) {
            const fcStart = points.findIndex(p => p.isFc);
            const isTail = fcStart > 0 && points.slice(fcStart).every(p => p.isFc || p.value == null);
            if (isTail) {
                const x = bandStart + fcStart * step;
                const yTop = Math.min(panels.main.y,
                    panels.abs ? panels.abs.y : Infinity,
                    panels.rel ? panels.rel.y : Infinity);
                const yBot = panels.main.y + panels.main.h;
                this.el("line", {
                    x1: x, y1: yTop + 2, x2: x, y2: yBot,
                    stroke: "#9A9A9A", "stroke-width": 1, "stroke-dasharray": "3,3"
                }, bg);
            }
        }

        // ------- category groups with all marks
        const marks = this.el("g", {}, this.svg);
        for (let i = 0; i < n; i++) {
            const p = points[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const pos = slotPos(i);

            // base chart: PY behind, PL outline, AC/FC on top
            if (p.py != null) {
                this.drawBar(g, pos, barW, 0, p.py, mainScale, orientation,
                    { fill: cfg.colors.py });
            }
            if (p.pl != null) {
                this.drawBar(g, pos + pyShift, barW, 0, p.pl, mainScale, orientation,
                    { fill: "#FFFFFF", stroke: cfg.colors.pl, "stroke-width": 1.4 });
            }
            if (p.value != null) {
                this.drawBar(g, pos + pyShift, barW, 0, p.value, mainScale, orientation,
                    p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac });
                if (cfg.showLabels && showValueAt(i)) {
                    // anchor the label beyond the PL outline when the plan column is taller
                    const anchor = p.pl != null
                        ? (p.value >= 0 ? Math.max(p.value, p.pl) : Math.min(p.value, p.pl))
                        : p.value;
                    this.drawEndLabelAt(g, pos + pyShift + barW / 2, anchor, p.value >= 0, mainScale,
                        orientation, valueTexts[i], cfg.labelFont, INK);
                    // compact mode: variance becomes a colored second label at the bar end
                    if (compact && p.varAbs != null) {
                        const good = cfg.invert ? p.varAbs < 0 : p.varAbs > 0;
                        const vColor = p.varAbs === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                        const vText = p.varRel != null ? relTexts[i] : absTexts[i];
                        const gap = orientation === "columns"
                            ? cfg.labelFont + 2
                            : valueTexts[i].length * cfg.labelFont * 0.56 + 8;
                        this.drawEndLabelAt(g, pos + pyShift + barW / 2, anchor, p.value >= 0, mainScale,
                            orientation, vText, cfg.labelFont, vColor, gap);
                    }
                }
            }

            // absolute variance bars
            if (panels.abs && absScale && p.varAbs != null) {
                const good = cfg.invert ? p.varAbs < 0 : p.varAbs > 0;
                const color = p.varAbs === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = slotW * 0.55;
                const vx = pos + pyShift + barW / 2 - vw / 2;
                this.drawBar(g, vx, vw, 0, p.varAbs, absScale, orientation,
                    p.isFc
                        ? { fill: color, "fill-opacity": 0.55, stroke: color, "stroke-width": 1 }
                        : { fill: color });
                if (cfg.showLabels && showAbsAt(i)) {
                    this.drawEndLabel(g, vx + vw / 2, p.varAbs, absScale, orientation,
                        absTexts[i], cfg.labelFont, INK);
                }
            }

            // relative variance pins
            if (panels.rel && relScale && p.varRel != null) {
                const good = cfg.invert ? p.varRel < 0 : p.varRel > 0;
                const color = p.varRel === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
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
                if (cfg.showLabels && showRelAt(i)) {
                    this.drawEndLabel(g, c, p.varRel, relScale, orientation,
                        relTexts[i], cfg.labelFont, INK, r + 3);
                }
            }

            // category label
            if (showCatAt(i)) {
                this.drawCategoryLabel(g, p.cat, pos + slotW / 2, orientation, cfg.catFont,
                    region, step, panels.main);
            }

            // comment marker (numbered circle at the inner end of the bar)
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, pos + pyShift + barW / 2, p, mainScale, orientation, cfg);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
        }
    }

    /** keeps the N largest categories (by base value) and aggregates the tail into one "Rest" row */
    private applyTopN(points: DataPoint[], topN: number): DataPoint[] {
        const sorted = [...points].sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
        const head = sorted.slice(0, topN);
        const tail = sorted.slice(topN);

        const sum = (vals: (number | null)[]): number | null => {
            let acc: number | null = null;
            for (const v of vals) {
                if (v == null) { continue; }
                acc = (acc ?? 0) + v;
            }
            return acc;
        };
        const ac = sum(tail.map(p => p.ac));
        const py = sum(tail.map(p => p.py));
        const pl = sum(tail.map(p => p.pl));
        const fc = sum(tail.map(p => p.fc));
        const value = sum(tail.map(p => p.value));
        const basis = sum(tail.map(p => p.basis));
        const varAbs = (value != null && basis != null) ? value - basis : null;
        const varRel = (varAbs != null && basis != null && basis !== 0)
            ? (varAbs / Math.abs(basis)) * 100 : null;
        const rest: DataPoint = {
            cat: `Rest (${tail.length})`,
            ac, py, pl, fc, value,
            isFc: false, basis, varAbs, varRel,
            comment: null, commentNo: null,
            sel: null
        };
        return [...head, rest];
    }

    private drawCommentMarker(parent: SVGElement, bandCenter: number, p: DataPoint,
        scale: Scale, orientation: Orientation, cfg: ChartConfig): void {
        const r = 7;
        const end = scale(p.value as number);
        const zero = scale(0);
        const len = Math.abs(end - zero);
        // sit just inside the bar end; center in very short bars
        const inset = len >= 2 * r + 8 ? r + 5 : len / 2;
        const towardZero = end < zero ? inset : -inset;
        const cx = orientation === "columns" ? bandCenter : end + towardZero;
        const cy = orientation === "columns" ? end + towardZero : bandCenter;
        this.el("circle", {
            cx, cy, r, fill: "#FFFFFF", stroke: INK, "stroke-width": 1.2
        }, parent);
        const t = this.el("text", {
            x: cx, y: cy + 3, "text-anchor": "middle",
            "font-size": 9, fill: INK, "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = String(p.commentNo);
    }

    /** circled digit for tooltips: ①…⑳, then (n) */
    private circledNo(no: number): string {
        return no >= 1 && no <= 20 ? String.fromCodePoint(0x2460 + no - 1) : `(${no})`;
    }

    /** Σ header: total value plus overall variance vs. the comparison basis */
    private drawTotalHeader(parent: SVGElement, region: Rect, points: DataPoint[], cfg: ChartConfig): void {
        let sum = 0, sumVar = 0, sumBasis = 0, any = false, anyVar = false;
        for (const p of points) {
            if (p.value != null) { sum += p.value; any = true; }
            if (p.varAbs != null && p.basis != null) {
                sumVar += p.varAbs;
                sumBasis += Math.abs(p.basis);
                anyVar = true;
            }
        }
        if (!any) { return; }

        const t = this.el("text", {
            x: region.x + region.w - 6, y: region.y + 12, "text-anchor": "end",
            "font-size": 11, "font-family": FONT
        }, parent);
        const span = (text: string, fill: string, bold: boolean) => {
            const ts = document.createElementNS(SVG_NS, "tspan");
            ts.setAttribute("fill", fill);
            if (bold) { ts.setAttribute("font-weight", "600"); }
            ts.textContent = text;
            t.appendChild(ts);
        };
        span(`Σ ${cfg.fmt.format(sum)}`, INK, true);
        if (anyVar) {
            const good = cfg.invert ? sumVar < 0 : sumVar > 0;
            const color = sumVar === 0 ? "#8A8A8A" : (good ? cfg.colors.good : cfg.colors.bad);
            span(`   Δ${cfg.basisLabel} `, "#8A8A8A", false);
            span(this.fmtSigned(cfg.fmtVar, sumVar), color, true);
            if (sumBasis !== 0) {
                span(` · ${this.fmtPercent((sumVar / sumBasis) * 100)}`, color, true);
            }
        }
    }

    /**
     * label thinning: returns a predicate deciding which indices get a label.
     * k <= 1 → all; k <= 4 → every k-th anchored at the last point;
     * denser → only first, last, min and max.
     */
    private labelPredicate(points: DataPoint[], texts: string[], fontSize: number,
        step: number, orientation: Orientation): (i: number) => boolean {
        const n = points.length;
        let need: number;
        if (orientation === "columns") {
            const maxLen = texts.reduce((a, t) => Math.max(a, t.length), 0);
            need = maxLen * fontSize * 0.56 + 6;
        } else {
            need = fontSize + 4;
        }
        const k = Math.max(1, Math.ceil(need / Math.max(step, 1)));
        if (k <= 1) { return () => true; }
        if (k <= 4) { return (i: number) => (n - 1 - i) % k === 0; }
        let iMin = 0, iMax = 0;
        for (let i = 0; i < n; i++) {
            const v = points[i].value;
            if (v == null) { continue; }
            if (v < (points[iMin].value ?? Infinity)) { iMin = i; }
            if (v > (points[iMax].value ?? -Infinity)) { iMax = i; }
        }
        return (i: number) => i === 0 || i === n - 1 || i === iMin || i === iMax;
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

    private splitPanels(start: number, span: number, showAbs: boolean, showRel: boolean,
        vertical: boolean, region: Rect): { main: Rect; abs?: Rect; rel?: Rect } {
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
                ? { x: region.x, y: cursor, w: region.w, h: size }
                : { x: cursor, y: region.y, w: size, h: region.h };
            cursor += size + gap;
        }
        return out as { main: Rect; abs?: Rect; rel?: Rect };
    }

    private makePanelScale(domain: [number, number], rect: Rect, orientation: Orientation, labelPad: number): Scale {
        let [mn, mx] = domain;
        if (mn === 0 && mx === 0) { mx = 1; }
        const span = mx - mn;
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

    private drawPanelTitle(parent: SVGElement, rect: Rect, text: string, orientation: Orientation,
        titleH: number, region: Rect, barsTitleY?: number): void {
        const attrs = orientation === "columns"
            ? { x: region.x + 6, y: rect.y + titleH - 4 }
            : { x: rect.x + 2, y: barsTitleY ?? (region.y + 12) };
        const t = this.el("text", {
            ...attrs, "font-size": 10, fill: "#8A8A8A",
            "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = text;
    }

    /** draws a rect from `from` to `to` along the value axis at band position bp with band width bw */
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
            "font-family": FONT,
            stroke: "#FFFFFF", "stroke-width": 3, "paint-order": "stroke",
            "stroke-linejoin": "round"
        }, parent);
        t.textContent = text;
    }

    private drawCategoryLabel(parent: SVGElement, text: string, bandCenter: number,
        orientation: Orientation, fontSize: number, region: Rect,
        step: number, mainRect: Rect): void {
        let attrs: Record<string, string | number>;
        let maxW: number;
        if (orientation === "columns") {
            attrs = { x: bandCenter, y: region.y + region.h - 3, "text-anchor": "middle" };
            maxW = step - 2;
        } else {
            attrs = { x: mainRect.x - 6, y: bandCenter + fontSize * 0.35, "text-anchor": "end" };
            maxW = mainRect.x - region.x - 8;
        }
        const t = this.el("text", {
            ...attrs, "font-size": fontSize, fill: INK,
            "font-family": FONT
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

    private attachInteraction(g: SVGGElement, p: DataPoint, cfg: ChartConfig): void {
        g.style.cursor = "pointer";
        g.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            if (!p.sel) { return; }
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
                    value: pct ? this.fmtPercent(v) : (signed ? this.fmtSigned(cfg.fmt, v) : cfg.fmt.format(v))
                });
            };
            out.push({ displayName: "Category", value: p.cat });
            add("Actual (AC)", p.ac);
            add("Forecast (FC)", p.fc);
            add("Previous Year (PY)", p.py);
            add("Plan (PL)", p.pl);
            if (p.varAbs != null) {
                out.push({ displayName: `Δ${cfg.basisLabel}`, value: this.fmtSigned(cfg.fmtVar, p.varAbs) });
            }
            add(`Δ${cfg.basisLabel} %`, p.varRel, true, true);
            if (p.comment != null && p.commentNo != null) {
                out.push({ displayName: `${this.circledNo(p.commentNo)} Kommentar`, value: p.comment });
            }
            return out;
        };
        g.addEventListener("mouseover", (e: MouseEvent) => {
            this.tooltipService.show({
                dataItems: items(),
                identities: p.sel ? [p.sel] : [],
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false
            });
        });
        g.addEventListener("mousemove", (e: MouseEvent) => {
            this.tooltipService.move({
                dataItems: items(),
                identities: p.sel ? [p.sel] : [],
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
            const isSel = hasSelection && cg.sel != null && selected.some(s => s.equals(cg.sel));
            cg.g.setAttribute("opacity", !hasSelection || isSel ? "1" : "0.35");
        }
    }
}
