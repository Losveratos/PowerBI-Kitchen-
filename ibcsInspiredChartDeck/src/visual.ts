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
    /** variance vs. the second basis (the scenario not used as primary) */
    var2Abs: number | null;
    var2Rel: number | null;
    /** benchmark marker value (e.g. market average) */
    bm: number | null;
    comment: string | null;
    /** 1-based comment marker number, assigned in category order */
    commentNo: number | null;
    /** small-multiples group label, null when the multiples role is empty */
    group: string | null;
    /** waterfall row type: 'sum' | 'delta' | null */
    rowType: string | null;
    /** true for the synthetic "Rest (n)" row produced by top-N aggregation */
    isRest: boolean;
    sel: ISelectionId | null;
}

/** one bar of a waterfall / bridge */
interface WfSeg {
    label: string;
    from: number;
    to: number;
    kind: "anchor" | "delta";
    outlined?: boolean;
    hatched?: boolean;
    good?: boolean;
    p?: DataPoint;
}

interface Domains {
    main: [number, number];
    abs: [number, number];
    rel: [number, number];
    abs2: [number, number];
    rel2: [number, number];
    /** waterfall-bridge companion panel: floats away from zero, computed with extentTight */
    bridge: [number, number];
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
    /** second-basis variance panels (dual variance) */
    showDual: boolean;
    basis2Label: string;
    showTotal: boolean;
    patId: string;
    patGood: string;
    patBad: string;
    fmt: IValueFormatter;
    /** formatter scaled to the variance magnitudes (auto units) */
    fmtVar: IValueFormatter;
    hasPy: boolean;
    hasPl: boolean;
    hasFc: boolean;
    hasBm: boolean;
    /** high-contrast mode: only foreground/background colors, outlines for distinction */
    hc: boolean;
    ink: string;
    paper: string;
    subtle: string;
    /** lower-cased category labels to emphasize (IBCS EMPHASIZE) */
    highlight: Set<string>;
    /** hard scale maximum: larger base values are capped with a break marker */
    capMax: number | null;
    /** cumulative (YTD) view: totals header shows the last running value */
    cumulative: boolean;
    /** target / threshold line across the base chart */
    refLine: number | null;
    refLineLabel: string;
    /** line chart mode for long time series (IBCS line notation) */
    lineMode: boolean;
    /** moving average window (0 = off), columns/line only */
    movingAvg: number;
    /** waterfall-bridge rendering layered on top of columns/bars orientation */
    waterfallStyle: boolean;
    sortByImpact: boolean;
}

/** running cascade of "from"/"to" positions for the waterfall-bridge style */
interface Cascade {
    from: (number | null)[];
    to: (number | null)[];
    /** sum of all basis values — where the cascade starts */
    basisSum: number;
    /** sum of all AC/FC values — where the cascade ends */
    valueSum: number;
    /** AC-only portion of valueSum (hatched vs. solid end anchor) */
    acSum: number;
    /** FC-only portion of valueSum */
    fcSum: number;
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

/**
 * Like extent(), but does NOT anchor the domain at zero. Needed for the waterfall-bridge
 * cascade: its bricks float at a running level (e.g. 17050..17750) with no "from zero" anchor
 * bar to visually justify a zero-based scale — extent() would collapse that band to a sliver
 * near one edge of a [0, 17750] range.
 */
function extentTight(values: (number | null)[]): [number, number] {
    let mn = Infinity, mx = -Infinity;
    for (const v of values) {
        if (v == null || !isFinite(v)) { continue; }
        if (v < mn) { mn = v; }
        if (v > mx) { mx = v; }
    }
    return mn === Infinity ? [0, 0] : [mn, mx];
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private host: IVisualHost;
    private root: HTMLElement;
    private svg: SVGSVGElement;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private catGroups: { g: SVGGElement; sel: ISelectionId | null }[] = [];
    private measureFormat: string | undefined;
    private measureName: string | undefined;
    /** shared waterfall domain across small-multiples cells (IBCS same scale) */
    private sharedWfDomain: [number, number] | null = null;
    /** global font multiplier from the labels "Size preset" (Full HD = 1.5) */
    private fontK = 1;
    /** per-category mark groups in build order, for the ▶ reveal animation */
    private animGroups: SVGGElement[][] = [];
    private animTimers: number[] = [];
    /** small multiples: currently zoomed-in group (transient, ⤢/← in the chart) */
    private zoomGroup: string | null = null;
    /** compare-on-click: whether the mode is active this render + picked categories */
    private compareActive = false;
    private compareCats: string[] = [];
    /** bar-end anchors of the current render, for the compare overlay */
    private compareAnchors = new Map<string, { band: number; end: number; value: number }>();
    /** last update args so in-chart interactions (zoom, compare) can re-render */
    private lastRender: { points: DataPoint[]; width: number; height: number } | null = null;
    /** data facts driving context-sensitive visibility in the format pane */
    private paneHasPy = false;
    private paneHasPl = false;
    private paneHasComments = false;
    private static instanceCounter = 0;
    private instanceId: number;

    constructor(options: VisualConstructorOptions) {
        this.events = options.host.eventService;
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService(
            options.host.createLocalizationManager());
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.root = options.element;
        this.root.classList.add("icd-root");
        this.instanceId = Visual.instanceCounter++;

        this.svg = document.createElementNS(SVG_NS, "svg");
        this.root.appendChild(this.svg);

        // click on empty space clears selection (and a pending compare pick)
        this.svg.addEventListener("click", () => {
            this.selectionManager.clear();
            this.applySelectionOpacity([]);
            if (this.compareCats.length > 0) {
                this.compareCats = [];
                this.rerender();
            }
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
                this.renderDemo(width, height);
                this.events.renderingFinished(options);
                return;
            }
            this.svg.style.display = "block";
            this.lastRender = { points, width, height };
            this.render(points, width, height);
            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    /** re-render from the last update args — used by in-chart interactions (zoom, compare) */
    private rerender(): void {
        if (!this.lastRender) { return; }
        // render() mutates order in place via groups — pass a copy of the point list
        this.render([...this.lastRender.points], this.lastRender.width, this.lastRender.height);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        // context-sensitive pane: hide options that cannot apply right now
        const fs = this.formattingSettings;
        const orient = String(fs.chartCard.orientation.value.value);
        const bothBases = this.paneHasPy && this.paneHasPl;
        fs.chartCard.topN.visible = orient === "bars" || orient === "catbridge";
        fs.chartCard.movingAverage.visible = orient === "columns" || orient === "line";
        fs.chartCard.dualVariance.visible = bothBases;
        fs.chartCard.comparisonMode.visible = bothBases;
        fs.chartCard.waterfallStyle.visible = orient === "columns" || orient === "bars";
        fs.chartCard.sortByImpact.visible = orient === "columns" || orient === "bars" || orient === "catbridge";
        fs.chartCard.chartButtons.visible = orient === "intwaterfall" || orient === "catbridge";
        fs.scaleCard.refLineLabel.visible = String(fs.scaleCard.refLine.value || "").trim() !== "";
        fs.scaleCard.capOverflow.visible = (fs.scaleCard.fixedMax.value ?? 0) > 0;
        fs.scaleCard.fixedVarMax.visible = fs.chartCard.showAbsoluteVariance.value;
        fs.commentsCard.visible = this.paneHasComments;
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ------------------------------------------------------------------ data

    private missingHint: string | null = null;

    private parseData(dataView: DataView | undefined): DataPoint[] | null {
        this.missingHint = null;
        const catCols = dataView?.categorical?.categories;
        // with drilldown, "expand all" delivers several category-role columns (one per level)
        const catLevels = catCols?.filter(c => c.source.roles?.["category"]) ?? [];
        const cat = catLevels[0];
        const mult = catCols?.find(c => c.source.roles?.["multiples"]);
        const rowTypeCol = catCols?.find(c => c.source.roles?.["rowType"]);
        const fcFlagCol = catCols?.find(c => c.source.roles?.["fcFlag"]);
        const valueCols = dataView?.categorical?.values;
        if (!cat || !valueCols || valueCols.length === 0) { return null; }

        this.missingHint = null;
        const byRole: { [role: string]: (number | null)[] } = {};
        let comments: (string | null)[] | null = null;
        this.measureFormat = undefined;
        for (const col of valueCols) {
            const roles = col.source.roles || {};
            for (const role of ["actual", "previousYear", "plan", "forecast", "benchmark"]) {
                if (roles[role]) {
                    byRole[role] = col.values.map(v => (typeof v === "number" && isFinite(v)) ? v : null);
                    if (role === "actual" || (role === "forecast" && !this.measureFormat)) {
                        if (col.source.format) { this.measureFormat = col.source.format; }
                        if (!this.measureName || role === "actual") {
                            this.measureName = col.source.displayName;
                        }
                    }
                }
            }
            if (roles["comments"]) {
                comments = col.values.map(v =>
                    v != null && String(v).trim() !== "" ? String(v) : null);
            }
        }
        this.paneHasPy = !!byRole["previousYear"];
        this.paneHasPl = !!byRole["plan"];
        this.paneHasComments = comments != null;
        if (!byRole["actual"] && !byRole["forecast"]) {
            // some fields are bound but the value measure is missing — say so
            if (valueCols.length > 0 || mult || rowTypeCol || fcFlagCol) {
                this.missingHint = "Actual (AC) fehlt — bitte Ist-Measure ins Actual-Feld ziehen";
            }
            return null;
        }

        const basisMode = this.resolveBasis(byRole);
        const points: DataPoint[] = [];
        let commentCounter = 0;
        for (let i = 0; i < cat.values.length; i++) {
            let ac = byRole["actual"] ? byRole["actual"][i] : null;
            const py = byRole["previousYear"] ? byRole["previousYear"][i] : null;
            const pl = byRole["plan"] ? byRole["plan"][i] : null;
            let fc = byRole["forecast"] ? byRole["forecast"][i] : null;
            // chart-builder compatible flag column: 1/true marks the AC value as forecast
            const flag = fcFlagCol ? fcFlagCol.values[i] : null;
            if (flag != null && flag !== 0 && flag !== "0" && flag !== false && ac != null && fc == null) {
                fc = ac;
                ac = null;
            }
            const isFc = ac == null && fc != null;
            const value = ac != null ? ac : fc;
            const basis = basisMode === "plan" ? pl : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            const basis2 = basisMode === "plan" ? py : pl;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
                ? (var2Abs / Math.abs(basis2)) * 100 : null;
            const comment = comments ? comments[i] : null;
            let selBuilder = this.host.createSelectionIdBuilder();
            for (const level of catLevels) { selBuilder = selBuilder.withCategory(level, i); }
            if (mult) { selBuilder = selBuilder.withCategory(mult, i); }
            points.push({
                cat: catLevels.map(level => this.categoryLabel(level.values[i])).join(" · "),
                ac, py, pl, fc, value, isFc, basis, varAbs, varRel, var2Abs, var2Rel,
                bm: byRole["benchmark"] ? byRole["benchmark"][i] : null,
                comment,
                commentNo: comment != null ? ++commentCounter : null,
                group: mult ? this.categoryLabel(mult.values[i]) : null,
                rowType: rowTypeCol && rowTypeCol.values[i] != null
                    ? String(rowTypeCol.values[i]).toLowerCase() : null,
                isRest: false,
                sel: selBuilder.createSelectionId()
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
            default:
                unitValue = maxAbs >= 1e9 ? 1e9 : maxAbs >= 1e6 ? 1e6 : maxAbs >= 1e4 ? 1e3 : 0;
                break;
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

    /** landing page renders a live sample chart instead of a text hint */
    private renderDemo(width: number, height: number): void {
        this.svg.style.display = "block";
        const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
        const ac = [820, 771, 900, 955, 1020, 980, 1105, null, null, null, null, null];
        const fc = [null, null, null, null, null, null, null, 1150, 1080, 1210, 1260, 1400];
        const py = [760, 800, 850, 900, 940, 1010, 1000, 1040, 1010, 1120, 1180, 1300];
        const pl = [800, 810, 870, 980, 1000, 1000, 1050, 1100, 1120, 1180, 1220, 1350];
        this.measureName = "Demo-KPI";
        this.measureFormat = undefined;
        const pts: DataPoint[] = months.map((m, i) => {
            const isFc = ac[i] == null;
            const value = ac[i] != null ? ac[i] : fc[i];
            const varAbs = (value as number) - (pl[i] as number);
            return {
                cat: m, ac: ac[i], py: py[i], pl: pl[i], fc: fc[i],
                value, isFc, basis: pl[i],
                varAbs, varRel: (varAbs / Math.abs(pl[i] as number)) * 100,
                var2Abs: (value as number) - (py[i] as number),
                var2Rel: (((value as number) - (py[i] as number)) / Math.abs(py[i] as number)) * 100,
                bm: null,
                comment: null, commentNo: null, group: null, rowType: null, isRest: false, sel: null
            };
        });
        this.render(pts, width, height);

        // hint pill on top of the sample
        const g = this.el("g", {}, this.svg);
        const msg = this.missingHint || "Beispieldaten — füge Category und Actual (AC) hinzu";
        const w = Math.min(width - 16, msg.length * 6.2 + 24);
        this.el("rect", {
            x: (width - w) / 2, y: height - 30, width: w, height: 22, rx: 11,
            fill: "#404040", "fill-opacity": 0.85
        }, g);
        const t = this.el("text", {
            x: width / 2, y: height - 15, "text-anchor": "middle",
            "font-size": 10.5, fill: "#FFFFFF", "font-family": FONT
        }, g);
        t.textContent = msg;
    }

    // ---------------------------------------------------------------- render

    private render(points: DataPoint[], width: number, height: number): void {
        while (this.svg.firstChild) { this.svg.removeChild(this.svg.firstChild); }
        this.catGroups = [];

        const s = this.formattingSettings;
        const orientationRaw = String(s.chartCard.orientation.value.value);
        const isWaterfall = orientationRaw === "waterfall";
        const lineMode = orientationRaw === "line";
        // integrated bridge (time waterfall + monthly columns + pins) and category bridge
        // (structure rows + cascade + double reconciliation) are standalone chart modes
        const isIntWf = orientationRaw === "intwaterfall";
        const isCatBridge = orientationRaw === "catbridge";
        // IBCS table: one row per category with value + AC·PY bars + ΔBasis bars + Δ% pins
        const isTable = orientationRaw === "table";
        const orientation: Orientation = orientationRaw === "bars" || isCatBridge || isTable ? "bars" : "columns";
        // waterfall-bridge is an optional add-on to columns/bars, not a separate orientation
        const wfStyleGlobal = s.chartCard.waterfallStyle.value
            && (orientationRaw === "columns" || orientationRaw === "bars");
        const sortByImpactOn = (wfStyleGlobal || isCatBridge) && s.chartCard.sortByImpact.value;

        // font preset: one switch scaling every text in the visual (Full HD = ×1.5)
        this.fontK = { compact: 1, fullhd: 1.5, presentation: 2 }[
            String(s.labelsCard.fontPreset.value.value)] ?? 1;
        this.animGroups = [];

        // compare-on-click: only meaningful where per-category value bars exist
        this.compareActive = s.chartCard.compareClick.value
            && (orientationRaw === "columns" || orientationRaw === "bars");
        this.compareAnchors.clear();
        if (!this.compareActive) { this.compareCats = []; }

        // small multiples: group by the multiples role, in order of appearance
        const groups: { name: string | null; pts: DataPoint[] }[] = [];
        for (const p of points) {
            const last = groups.length > 0 ? groups[groups.length - 1] : null;
            const found = last && last.name === p.group ? last : groups.find(g => g.name === p.group);
            if (found) { found.pts.push(p); } else { groups.push({ name: p.group, pts: [p] }); }
        }

        // top N + rest aggregation (structure comparisons only), per group
        const topN = Math.round(s.chartCard.topN.value ?? 0);
        if (orientation === "bars" && topN > 0) {
            for (const g of groups) {
                if (g.pts.length > topN + 1) { g.pts = this.applyTopN(g.pts, topN); }
            }
        }
        // cumulative (YTD) view: running totals per group, variances recomputed
        if (s.chartCard.cumulative.value) {
            const basisMode = this.resolveBasisLabel(points);
            for (const g of groups) { g.pts = this.cumulate(g.pts, basisMode); }
        }
        // waterfall-bridge: order categories by impact, largest driver first (Rest row stays last)
        if (sortByImpactOn) {
            for (const g of groups) { g.pts = this.sortByImpact(g.pts); }
        }
        points = groups.reduce<DataPoint[]>((acc, g) => acc.concat(g.pts), []);

        const maxAbs = Math.max(...points.map(p =>
            Math.max(Math.abs(p.value ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0))), 0);
        const maxVarAbs = Math.max(...points.map(p => Math.abs(p.varAbs ?? 0)), 0);
        const allInt = points.every(p =>
            [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v)));
        const allVarInt = points.every(p => p.varAbs == null || Number.isInteger(p.varAbs));

        const basisMode: Basis = this.resolveBasisLabel(points);
        const hasVar = points.some(p => p.varAbs != null);

        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        const hc: boolean = !!(palette && palette.isHighContrast);
        const fg: string = hc ? palette.foreground.value : INK;
        const bgc: string = hc ? palette.background.value : "#FFFFFF";

        // report theme colors: sentiment + neutral tones from the palette,
        // falling back to the color pickers when the theme doesn't define them
        const useTheme = s.colorsCard.useTheme.value && !hc && !!palette;
        const themed = (info: { value: string } | undefined, fallback: string) =>
            useTheme && info && info.value ? info.value : fallback;

        const cfg: ChartConfig = {
            orientation,
            showLabels: s.labelsCard.show.value,
            labelFont: Math.round(s.labelsCard.fontSize.value * this.fontK),
            catFont: Math.round(s.categoryAxisCard.fontSize.value * this.fontK),
            invert: s.chartCard.invert.value,
            colors: hc ? { ac: fg, py: fg, pl: fg, good: fg, bad: fg } : {
                ac: themed(palette?.foregroundNeutralDark, s.colorsCard.actualColor.value.value),
                py: themed(palette?.foregroundNeutralTertiary, s.colorsCard.previousYearColor.value.value),
                pl: themed(palette?.foregroundNeutralDark, s.colorsCard.planColor.value.value),
                good: themed(palette?.positive, s.colorsCard.goodColor.value.value),
                bad: themed(palette?.negative, s.colorsCard.badColor.value.value)
            },
            hc,
            ink: fg,
            paper: bgc,
            subtle: hc ? fg : "#8A8A8A",
            highlight: new Set(String(s.chartCard.highlight.value || "")
                .split(",").map(x => x.trim().toLowerCase()).filter(x => x)),
            capMax: (s.scaleCard.capOverflow.value && (s.scaleCard.fixedMax.value ?? 0) > 0)
                ? s.scaleCard.fixedMax.value : null,
            cumulative: s.chartCard.cumulative.value,
            refLine: this.parseRefLine(),
            refLineLabel: (s.scaleCard.refLineLabel.value || "").trim(),
            lineMode,
            movingAvg: Math.round(s.chartCard.movingAverage.value ?? 0),
            waterfallStyle: wfStyleGlobal,
            sortByImpact: sortByImpactOn,
            basisMode,
            basisLabel: basisMode === "plan" ? "PL" : "PY",
            showAbs: s.chartCard.showAbsoluteVariance.value && hasVar,
            showRel: s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null),
            showDual: s.chartCard.dualVariance.value && points.some(p => p.var2Abs != null),
            basis2Label: basisMode === "plan" ? "PY" : "PL",
            showTotal: s.chartCard.showTotal.value,
            patId: `icd-hatch-${this.instanceId}`,
            patGood: `icd-hatch-good-${this.instanceId}`,
            patBad: `icd-hatch-bad-${this.instanceId}`,
            fmt: this.makeFormatter(maxAbs, allInt),
            fmtVar: this.makeFormatter(maxVarAbs, allVarInt),
            hasPy: points.some(p => p.py != null),
            hasPl: points.some(p => p.pl != null),
            hasFc: points.some(p => p.isFc),
            hasBm: points.some(p => p.bm != null)
        };

        // hatch patterns for forecast (base chart + good/bad variance colors)
        const defs = this.el("defs", {}, this.svg);
        const makeHatch = (id: string, stroke: string) => {
            const pat = this.el("pattern", {
                id, patternUnits: "userSpaceOnUse", width: 5, height: 5,
                patternTransform: "rotate(45)"
            }, defs);
            this.el("rect", { width: 5, height: 5, fill: cfg.paper }, pat);
            this.el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke, "stroke-width": 2.5 }, pat);
        };
        makeHatch(cfg.patId, cfg.colors.ac);
        makeHatch(cfg.patGood, cfg.colors.good);
        makeHatch(cfg.patBad, cfg.colors.bad);

        // shared value domains across all multiples (IBCS: identical scales)
        const domains: Domains = {
            main: extent(points.flatMap(p => [p.value, p.py, p.pl, p.fc, p.bm])),
            abs: extent(points.map(p => p.varAbs)),
            rel: extent(points.map(p => p.varRel)),
            abs2: extent(points.map(p => p.var2Abs)),
            rel2: extent(points.map(p => p.var2Rel)),
            bridge: [0, 0]
        };

        // scale sync: stretch domains at least to the configured maxima;
        // with capping enabled the maximum is hard instead
        const fixedMax = s.scaleCard.fixedMax.value ?? 0;
        if (fixedMax > 0) {
            domains.main = cfg.capMax != null
                ? [domains.main[0], fixedMax]
                : [domains.main[0], Math.max(domains.main[1], fixedMax)];
        }
        const fixedVarMax = s.scaleCard.fixedVarMax.value ?? 0;
        if (fixedVarMax > 0) {
            domains.abs = [
                Math.min(domains.abs[0], -fixedVarMax),
                Math.max(domains.abs[1], fixedVarMax)
            ];
        }

        // waterfall: precompute segments per group, shared domain over all cells
        const wfByGroup = new Map<string | null, WfSeg[]>();
        this.sharedWfDomain = null;
        if (isWaterfall) {
            for (const g of groups) { wfByGroup.set(g.name, this.buildWaterfall(g.pts, cfg)); }
            const allSegs: WfSeg[] = [];
            wfByGroup.forEach(segs => allSegs.push(...segs));
            domains.main = extent(allSegs.flatMap(sg => [sg.from, sg.to]));
            this.sharedWfDomain = domains.main;
        }
        // waterfall-bridge (columns/bars add-on): running cascade per group, own shared
        // domain — a separate "bridge" panel alongside the normal AC/PY/PL comparison bars,
        // not a replacement for them. extentTight (no zero anchor) because the cascade
        // floats at a running level with no "from zero" anchor bar to justify one.
        const cascadeByGroup = new Map<string | null, Cascade>();
        if (wfStyleGlobal) {
            for (const g of groups) { cascadeByGroup.set(g.name, this.buildCascade(g.pts)); }
            const allVals: (number | null)[] = [];
            cascadeByGroup.forEach(c => { allVals.push(...c.from, ...c.to); });
            domains.bridge = extentTight(allVals);
        }
        if (cfg.refLine != null) {
            domains.main = [Math.min(domains.main[0], cfg.refLine), Math.max(domains.main[1], cfg.refLine)];
            if (this.sharedWfDomain) { this.sharedWfDomain = domains.main; }
        }

        const renderCell = (grp: { name: string | null; pts: DataPoint[] }, region: Rect) => {
            if (isWaterfall) {
                this.renderWaterfall(wfByGroup.get(grp.name) || [], region, cfg);
                return;
            }
            if (isIntWf) {
                this.renderIntegratedWaterfall(grp.pts, region, cfg);
                return;
            }
            if (isCatBridge) {
                this.renderCategoryBridge(grp.pts, region, cfg);
                return;
            }
            if (isTable) {
                this.renderTable(grp.pts, region, cfg);
                return;
            }
            this.renderChart(grp.pts, region, cfg, domains, cascadeByGroup.get(grp.name) ?? null);
        };
        // sort button (once, top-right of the whole visual) — the only literal "button":
        // toggles the format-pane property so the choice persists and stays bookmarkable
        if (wfStyleGlobal) {
            this.drawSortButton(width, cfg);
        }
        // in-chart toolbar for the bridge modes: ΔPY/ΔPL reference switch (persisted, so
        // the end user can re-base the variances in the report), sort toggle + ▶ build
        if ((isIntWf || isCatBridge) && s.chartCard.chartButtons.value) {
            this.drawChartButtons(width, cfg, {
                showRef: cfg.hasPy && cfg.hasPl,
                showSort: isCatBridge,
                showPlay: true
            });
        }
        // IBCS title block on top of everything (incl. multiples grid)
        const topOffset = s.ibcsTitleCard.show.value
            ? this.drawTitleBlock(width, points, cfg, maxAbs, orientation)
            : 0;
        const availH = height - topOffset;

        // comment panel: numbered footnote list to the right of the chart
        const commentPts = points.filter(p => p.commentNo != null);
        let chartW = width;
        if (this.formattingSettings.commentsCard.showPanel.value
            && commentPts.length > 0 && groups.length <= 1 && width >= 480) {
            const panelW = Math.min(260, Math.round(width * 0.28));
            chartW = width - panelW;
            this.drawCommentPanel({ x: chartW, y: topOffset, w: panelW, h: availH }, commentPts, cfg);
        }

        if (groups.length <= 1) {
            renderCell(groups[0] ?? { name: null, pts: points },
                { x: 0, y: topOffset, w: chartW, h: availH });
            return;
        }

        // small multiples zoom: ⤢ on a tile shows just that group full-size (same
        // shared scales — IBCS), the ← chip goes back to the grid. Transient state.
        if (this.zoomGroup != null) {
            const grp = groups.find(g => (g.name ?? "") === this.zoomGroup);
            if (grp) {
                // chart first, chip after — the click target must stay on top of the marks
                const chipH = Math.round(11 * this.fontK) + 17;
                renderCell(grp, { x: 0, y: topOffset + chipH, w: chartW, h: availH - chipH });
                this.drawZoomBackChip(topOffset, grp.name ?? "", cfg);
                return;
            }
            this.zoomGroup = null;
        }

        // grid layout for small multiples: keep cells at a usable width
        const MAX_CELLS = 24;
        const shown = groups.slice(0, MAX_CELLS);
        const n = shown.length;
        let cols = Math.ceil(Math.sqrt(n));
        cols = Math.max(1, Math.min(cols, Math.floor(width / 220) || 1));
        const rows = Math.ceil(n / cols);
        const cellW = width / cols;
        const cellH = availH / rows;
        const groupTitleH = Math.round(16 * this.fontK);

        for (let gi = 0; gi < n; gi++) {
            const cx = (gi % cols) * cellW;
            const cy = topOffset + Math.floor(gi / cols) * cellH;
            let title = shown[gi].name ?? "";
            if (gi === n - 1 && groups.length > n) {
                title += `  (+${groups.length - n} weitere)`;
            }
            // cell content first, header strip after — the click target must sit ON TOP
            // of any chart marks (labels can reach into the strip), or clicks get eaten
            renderCell(shown[gi],
                { x: cx + 2, y: cy + groupTitleH, w: cellW - 4, h: cellH - groupTitleH - 2 });
            this.drawTileHeader(cx, cy, cellW, groupTitleH, title, shown[gi].name ?? "", cfg);
        }
    }

    /**
     * small-multiples tile header: the WHOLE title strip is the zoom-in click target
     * (a 12px glyph alone is too easy to miss), with the ⤢ affordance at the right.
     */
    private drawTileHeader(x: number, y: number, w: number, h: number,
        title: string, groupName: string, cfg: ChartConfig): void {
        const k = this.fontK;
        const gtFont = Math.round(11 * k);
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", `${groupName} vergrößern`);
        (btn.style as CSSStyleDeclaration & { pointerEvents: string }).pointerEvents = "all";
        // hit area across the full strip (nearly invisible, but clickable everywhere)
        this.el("rect", {
            x: x + 1, y: y + 1, width: Math.max(w - 2, 1), height: h + 2,
            fill: cfg.paper, "fill-opacity": 0.01
        }, btn);
        const t = this.el("text", {
            x: x + 6, y: y + gtFont + 1, "font-size": gtFont, fill: cfg.ink,
            "font-family": FONT, "font-weight": 600
        }, btn);
        t.textContent = this.truncate(title, w - 16 - 14 * k, gtFont);
        const icon = this.el("text", {
            x: x + w - 6, y: y + gtFont + 1, "text-anchor": "end",
            "font-size": Math.round(12 * k), fill: cfg.subtle, "font-family": FONT
        }, btn);
        icon.textContent = "⤢";
        btn.style.cursor = "pointer";
        btn.addEventListener("mouseenter", () => { icon.setAttribute("fill", cfg.ink); });
        btn.addEventListener("mouseleave", () => { icon.setAttribute("fill", cfg.subtle); });
        const zoom = () => { this.zoomGroup = groupName; this.rerender(); };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); zoom(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); zoom();
        });
    }

    /** back chip when a small-multiples tile is zoomed in; returns consumed height */
    private drawZoomBackChip(top: number, groupName: string, cfg: ChartConfig): number {
        const k = this.fontK;
        const font = Math.round(11 * k);
        const text = "← Alle Gruppen";
        const w = text.length * font * 0.56 + 18;
        const h = font + 9;
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", "Zurück zur Kachel-Übersicht");
        this.el("rect", {
            x: 6, y: top + 3, width: w, height: h, rx: h / 2,
            fill: cfg.paper, stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const t = this.el("text", {
            x: 6 + w / 2, y: top + 3 + h / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.ink, "font-family": FONT
        }, btn);
        t.textContent = text;
        btn.style.cursor = "pointer";
        const back = () => { this.zoomGroup = null; this.rerender(); };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); back(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); back();
        });
        const gl = this.el("text", {
            x: 6 + w + 10, y: top + 3 + h / 2 + font * 0.36, "font-size": font,
            fill: cfg.ink, "font-family": FONT, "font-weight": 600
        }, this.svg);
        gl.textContent = groupName;
        return h + 8;
    }

    /**
     * builds waterfall segments from the points. Three modes:
     * - rowType present: P&L waterfall — 'sum' rows are absolute anchors, others cumulate
     * - comparison basis present: variance bridge basis → AC (deltas are ΔPY/ΔPL)
     * - otherwise: contribution waterfall of the base values ending in a Σ anchor
     */
    private buildWaterfall(pts: DataPoint[], cfg: ChartConfig): WfSeg[] {
        const segs: WfSeg[] = [];
        const good = (v: number) => cfg.invert ? v < 0 : v > 0;
        if (pts.some(p => p.rowType != null)) {
            let cum = 0;
            for (const p of pts) {
                if (p.value == null) { continue; }
                if (p.rowType != null && p.rowType.startsWith("sum")) {
                    segs.push({ label: p.cat, from: 0, to: p.value, kind: "anchor", hatched: p.isFc, p });
                    cum = p.value;
                } else {
                    segs.push({ label: p.cat, from: cum, to: cum + p.value, kind: "delta", good: good(p.value), hatched: p.isFc, p });
                    cum += p.value;
                }
            }
        } else if (pts.some(p => p.varAbs != null)) {
            const basisSum = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
            const valueSum = pts.reduce((a, p) => a + (p.value ?? 0), 0);
            segs.push({ label: cfg.basisLabel, from: 0, to: basisSum, kind: "anchor", outlined: true });
            let cum = basisSum;
            for (const p of pts) {
                if (p.varAbs == null) { continue; }
                segs.push({ label: p.cat, from: cum, to: cum + p.varAbs, kind: "delta", good: good(p.varAbs), hatched: p.isFc, p });
                cum += p.varAbs;
            }
            segs.push({ label: cfg.hasFc ? "AC/FC" : "AC", from: 0, to: valueSum, kind: "anchor", hatched: cfg.hasFc });
        } else {
            let cum = 0;
            for (const p of pts) {
                if (p.value == null) { continue; }
                segs.push({ label: p.cat, from: cum, to: cum + p.value, kind: "delta", good: good(p.value), hatched: p.isFc, p });
                cum += p.value;
            }
            segs.push({ label: "Σ", from: 0, to: cum, kind: "anchor" });
        }
        return segs;
    }

    /** renders a waterfall / bridge into the region (vertical bars, shared domain via cfg call site) */
    private renderWaterfall(segs: WfSeg[], region: Rect, cfg: ChartConfig): void {
        if (segs.length === 0) { return; }
        const pad = 4;
        const titleH = Math.round(14 * this.fontK);
        const catArea = cfg.catFont + 10;
        const bandStart = region.x + pad + 2;
        const bandEnd = region.x + region.w - pad;
        const rect: Rect = {
            x: region.x, y: region.y + pad,
            w: region.w, h: region.h - pad - catArea
        };
        const domain = extent(segs.flatMap(sg => [sg.from, sg.to]));
        if (this.sharedWfDomain) {
            domain[0] = Math.min(domain[0], this.sharedWfDomain[0]);
            domain[1] = Math.max(domain[1], this.sharedWfDomain[1]);
        }
        const labelPad = cfg.showLabels ? cfg.labelFont + 6 : 6;
        const scale = this.makePanelScale(domain, rect, "columns", labelPad);
        const n = segs.length;
        const step = (bandEnd - bandStart) / n;
        const slotW = Math.max(2, step * 0.62);
        const pos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, "columns", bandStart, bandEnd, "ac", cfg.colors);
        if (cfg.refLine != null) {
            this.drawRefLine(bg, rect, scale, "columns", bandStart, bandEnd, cfg);
        }
        const title = segs[0].outlined ? `${cfg.basisLabel} → AC` : "AC";
        this.drawPanelTitle(bg, rect, title, "columns", titleH, region, undefined, cfg.subtle);

        const marks = this.el("g", {}, this.svg);
        for (let i = 0; i < n; i++) {
            const sg = segs[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            let style: Record<string, string | number>;
            if (sg.kind === "anchor") {
                style = sg.outlined
                    ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 }
                    : sg.hatched
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac };
            } else {
                const delta = sg.to - sg.from;
                const color = delta === 0 ? cfg.colors.py : (sg.good ? cfg.colors.good : cfg.colors.bad);
                const hollowBad = cfg.hc && !sg.good && delta !== 0;
                style = hollowBad
                    ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                    : sg.hatched
                        ? { fill: `url(#${sg.good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                        : { fill: color };
            }
            this.drawBar(g, pos(i), slotW, sg.from, sg.to, scale, "columns", style);

            // connector to the next bar at the running level
            if (i < n - 1) {
                const y = scale(sg.to);
                this.el("line", {
                    x1: pos(i) + slotW, y1: y, x2: pos(i + 1), y2: y,
                    stroke: cfg.subtle, "stroke-width": 1
                }, bg);
            }

            if (cfg.showLabels && step > cfg.labelFont * 1.4) {
                const text = sg.kind === "anchor"
                    ? cfg.fmt.format(sg.to)
                    : this.fmtSigned(cfg.fmtVar, sg.to - sg.from);
                this.drawEndLabelAt(g, pos(i) + slotW / 2, sg.to, sg.to >= sg.from, scale,
                    "columns", text, cfg.labelFont, cfg.ink, 0, cfg.paper);
            }
            this.drawCategoryLabel(g, sg.label, pos(i) + slotW / 2, "columns", cfg.catFont,
                region, step, rect, cfg.ink);

            if (sg.p) {
                this.attachInteraction(g, sg.p, cfg);
                this.catGroups.push({ g, sel: sg.p.sel });
            }
        }
    }

    /** centered hint when a chart mode is missing its required reference measure */
    private drawModeHint(region: Rect, cfg: ChartConfig, msg: string): void {
        const t = this.el("text", {
            x: region.x + region.w / 2, y: region.y + region.h / 2, "text-anchor": "middle",
            "font-size": Math.round(11 * this.fontK), fill: cfg.subtle, "font-family": FONT
        }, this.svg);
        t.textContent = msg;
    }

    /**
     * Integrated bridge (time): PY/PL total column left, ΔBasis waterfall cascading
     * across the months, monthly AC·PY mini-columns at the bottom, ΔBasis% pin chart
     * on top and a stacked AC+FC total column right with a circled net callout —
     * ported from the "IBCS Chart Standalone" reference (integrierte GuV).
     */
    private renderIntegratedWaterfall(pts: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = pts.length;
        if (n === 0) { return; }
        if (!pts.some(p => p.varAbs != null)) {
            this.drawModeHint(region, cfg, "Integrierte Brücke benötigt PY oder PL als Vergleichsbasis");
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;

        // ------- totals
        const basisSum = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
        const vTot = pts.reduce((a, p) => a + (p.value ?? 0), 0);
        const acTot = pts.filter(p => !p.isFc).reduce((a, p) => a + (p.value ?? 0), 0);
        const fcTot = vTot - acTot;
        const dTot = vTot - basisSum;
        const pctTot = basisSum !== 0 ? (dTot / basisSum) * 100 : 0;
        const firstFc = pts.findIndex(p => p.isFc);
        const goodOf = (v: number) => cfg.invert ? v < 0 : v > 0;
        const colOf = (v: number) => v === 0 ? cfg.colors.py : (goodOf(v) ? cfg.colors.good : cfg.colors.bad);

        // ------- layout
        const catArea = cf * 2 + 10;
        const yBase = region.y + region.h - pad - catArea;
        const showPins = cfg.showRel && region.h >= 280 && pts.some(p => p.varRel != null);
        const pinArea = showPins ? Math.max(70, region.h * 0.24) : lf + 14;
        const plotTop = region.y + pad + pinArea;

        const left = region.x + pad;
        const right = region.x + region.w - pad;
        const calloutW = Math.max(54, Math.min(96, region.w * 0.085)) + lf * 1.6;
        const sideLblW = lf * 2.4;
        const totW = Math.max(26, Math.min(60, region.w * 0.055));
        const bandStart = left + totW + 10;
        const bandEnd = right - calloutW - sideLblW - totW - 10;
        if (bandEnd - bandStart < n * 8) {
            this.drawModeHint(region, cfg, "Zu wenig Platz für die integrierte Brücke");
            return;
        }
        const step = (bandEnd - bandStart) / n;
        const segW = Math.max(6, step * 0.8);
        const colW = Math.max(3, step * 0.5);
        const cx = (i: number) => bandStart + i * step + step / 2;
        const cxTot = bandEnd + 10 + totW / 2;

        const maxTot = Math.max(basisSum, vTot, 1);
        const S = linearScale(0, maxTot, yBase, plotTop + lf + 8);
        const maxMon = Math.max(...pts.map(p => Math.max(p.value ?? 0, p.basis ?? 0)), 1);
        const miniH = Math.min((yBase - plotTop) * 0.30, region.h * 0.16);
        const BS = linearScale(0, maxMon, 0, miniH);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // ------- ΔBasis% pin chart (top)
        if (showPins) {
            const axisY = region.y + pad + pinArea * 0.55;
            const maxPct = Math.max(...pts.map(p => Math.abs(p.varRel ?? 0)), Math.abs(pctTot), 1);
            const pinMax = pinArea * 0.42 - lf;
            const PS = (v: number) => Math.max(2, Math.abs(v) / maxPct * Math.max(pinMax, 8));
            const tPin = this.el("text", {
                x: left, y: axisY + lf * 0.35, "font-size": Math.round(11 * k),
                fill: cfg.subtle, "font-family": FONT, "font-weight": 600
            }, bg);
            tPin.textContent = `Δ${cfg.basisLabel}%`;
            this.el("line", {
                x1: bandStart - 4, y1: axisY, x2: bandEnd + 4, y2: axisY,
                stroke: cfg.colors.py, "stroke-width": 2.4
            }, bg);
            this.el("line", {
                x1: cxTot - totW / 2 - 2, y1: axisY, x2: cxTot + totW / 2 + 2, y2: axisY,
                stroke: cfg.colors.py, "stroke-width": 2.4
            }, bg);
            // pin direction follows the sign, color follows the business impact (invert-aware)
            const pin = (x: number, pct: number, hollow: boolean, parent: SVGElement) => {
                const h = PS(pct);
                const yEnd = pct >= 0 ? axisY - h : axisY + h;
                this.el("line", { x1: x, y1: axisY, x2: x, y2: yEnd, stroke: colOf(pct), "stroke-width": 2.2 }, parent);
                const r = Math.max(2.6, 3.4 * k);
                this.el("rect", {
                    x: x - r, y: yEnd - r, width: 2 * r, height: 2 * r,
                    fill: hollow ? `url(#${cfg.patId})` : cfg.ink,
                    stroke: cfg.ink, "stroke-width": hollow ? 1 : 0
                }, parent);
                const lt = this.el("text", {
                    x, y: pct >= 0 ? yEnd - r - 3 : yEnd + r + lf, "text-anchor": "middle",
                    "font-size": lf, fill: cfg.ink, "font-family": FONT,
                    stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                }, parent);
                lt.textContent = this.fmtPercent(pct);
            };
            const showPinAt = this.labelPredicate(pts, pts.map(p => p.varRel != null ? this.fmtPercent(p.varRel) : ""), lf, step, "columns");
            pts.forEach((p, i) => {
                if (p.varRel == null || !showPinAt(i)) { return; }
                pin(cx(i), p.varRel, p.isFc, marks);
            });
            pin(cxTot, pctTot, true, bg);
        }

        // ------- AC | FC separator
        if (firstFc > 0) {
            this.el("line", {
                x1: cx(firstFc) - step / 2, y1: region.y + pad + 4, x2: cx(firstFc) - step / 2, y2: yBase + catArea * 0.55,
                stroke: cfg.ink, "stroke-width": 1.4
            }, bg);
        }

        // ------- basis total column (left)
        const yB = S(basisSum);
        const basisStyle = cfg.basisMode === "plan"
            ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 }
            : cfg.hc
                ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                : { fill: cfg.colors.py };
        this.el("rect", { x: left, y: yB, width: totW, height: Math.max(yBase - yB, 1), ...basisStyle }, bg);
        const bl = this.el("text", {
            x: left + totW / 2, y: yB - 5, "text-anchor": "middle", "font-size": lf,
            fill: cfg.ink, "font-family": FONT
        }, bg);
        bl.textContent = cfg.fmt.format(basisSum);
        const bc = this.el("text", {
            x: left + totW / 2, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
            fill: cfg.ink, "font-family": FONT
        }, bg);
        bc.textContent = cfg.basisLabel;

        // ------- level guide lines
        const yV = S(vTot);
        this.el("line", { x1: left + totW, y1: yB, x2: cxTot + totW / 2, y2: yB, stroke: cfg.colors.py, "stroke-width": 1.4 }, bg);
        this.el("line", { x1: cx(n - 1) + segW / 2, y1: yV, x2: right - calloutW + 10, y2: yV, stroke: cfg.colors.py, "stroke-width": 1.4 }, bg);

        // ------- cascade + mini columns
        const showValAt = this.labelPredicate(pts, pts.map(p => p.varAbs != null ? fmtD(p.varAbs) : ""), lf, step, "columns");
        let level = basisSum;
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const x = cx(i);

            // connector at the incoming level
            const conX1 = i === 0 ? left + totW : cx(i - 1) + segW / 2;
            this.el("line", {
                x1: conX1, y1: S(level), x2: x - segW / 2, y2: S(level),
                stroke: cfg.subtle, "stroke-width": 1
            }, g);

            if (p.varAbs != null) {
                const d = p.varAbs;
                const prev = level;
                level += d;
                const segTop = S(Math.max(prev, level));
                const segH = Math.max(4, Math.abs(S(prev) - S(level)));
                const c = colOf(d);
                const hollowBad = cfg.hc && !goodOf(d) && d !== 0;
                this.el("rect", {
                    x: x - segW / 2, y: segTop, width: segW, height: segH,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(d) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
                if (cfg.showLabels && showValAt(i)) {
                    const up = d >= 0;
                    const lt = this.el("text", {
                        x, y: up ? segTop - 4 : segTop + segH + lf, "text-anchor": "middle",
                        "font-size": lf, fill: cfg.ink, "font-family": FONT,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    lt.textContent = fmtD(d);
                }
            }

            // mini columns at the base: basis grey behind, AC/FC in front
            if (p.basis != null) {
                const h = BS(p.basis);
                this.el("rect", {
                    x: x - colW * 0.8, y: yBase - h, width: colW, height: h,
                    ...(cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py })
                }, g);
            }
            if (p.value != null) {
                const h = BS(p.value);
                this.el("rect", {
                    x: x - colW * 0.2, y: yBase - h, width: colW, height: h,
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                if (cfg.showLabels && showValAt(i)) {
                    const hMax = Math.max(BS(p.value), p.basis != null ? BS(p.basis) : 0);
                    const vt = this.el("text", {
                        x: x + colW * 0.3 - colW * 0.5, y: yBase - hMax - 3, "text-anchor": "middle",
                        "font-size": lf, fill: cfg.ink, "font-family": FONT,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    vt.textContent = cfg.fmt.format(p.value);
                }
            }

            // category labels (month + FC/first-year hint)
            const showCatAt = this.labelPredicate(pts, pts.map(q => q.cat), cf, step, "columns");
            if (showCatAt(i)) {
                const ct = this.el("text", {
                    x, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
                    fill: cfg.ink, "font-family": FONT
                }, g);
                ct.textContent = this.truncate(p.cat, step - 2, cf);
            }
            if (i === firstFc) {
                const ft = this.el("text", {
                    x, y: yBase + cf * 2 + 8, "text-anchor": "middle", "font-size": cf,
                    fill: cfg.ink, "font-family": FONT, "font-weight": 600
                }, g);
                ft.textContent = "FC";
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // ------- axis
        this.el("line", {
            x1: left, y1: yBase, x2: right - calloutW + 16, y2: yBase,
            stroke: cfg.ink, "stroke-width": 1.6
        }, bg);

        // ------- stacked AC+FC total column (right)
        const xT = bandEnd + 10;
        const acH = Math.max(yBase - S(acTot), 0);
        this.el("rect", { x: xT, y: yBase - acH, width: totW, height: Math.max(acH, 1), fill: cfg.colors.ac }, bg);
        if (fcTot > 0) {
            const fcH = S(acTot) - S(vTot);
            this.el("rect", {
                x: xT, y: yBase - acH - fcH, width: totW, height: Math.max(fcH, 1),
                fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1.2
            }, bg);
            const fl = this.el("text", {
                x: xT + totW + 4, y: yBase - acH - fcH / 2 + lf * 0.35, "font-size": lf,
                fill: cfg.ink, "font-family": FONT
            }, bg);
            fl.textContent = "FC";
            const fv = this.el("text", {
                x: xT + totW / 2, y: yBase - acH - fcH / 2 + lf * 0.35, "text-anchor": "middle",
                "font-size": lf, fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, bg);
            fv.textContent = cfg.fmt.format(fcTot);
            const al = this.el("text", {
                x: xT + totW + 4, y: yBase - acH / 2 + lf * 0.35, "font-size": lf,
                fill: cfg.ink, "font-family": FONT
            }, bg);
            al.textContent = "AC";
            const av = this.el("text", {
                x: xT + totW / 2, y: yBase - acH / 2 + lf * 0.35, "text-anchor": "middle",
                "font-size": lf, fill: cfg.paper, "font-family": FONT
            }, bg);
            av.textContent = cfg.fmt.format(acTot);
        }
        const tv = this.el("text", {
            x: xT + totW / 2, y: S(vTot) - 5, "text-anchor": "middle", "font-size": lf,
            fill: cfg.ink, "font-family": FONT, "font-weight": 600
        }, bg);
        tv.textContent = cfg.fmt.format(vTot);
        const tc = this.el("text", {
            x: xT + totW / 2, y: yBase + cf + 4, "text-anchor": "middle", "font-size": cf,
            fill: cfg.ink, "font-family": FONT
        }, bg);
        tc.textContent = fcTot > 0 ? "AC+FC" : "AC";

        // ------- net variance bar + circled callout (right edge)
        const xv = xT + totW + sideLblW;
        this.el("rect", {
            x: xv, y: Math.min(yB, yV), width: 6, height: Math.max(Math.abs(yV - yB), 2),
            fill: colOf(dTot)
        }, bg);
        const text = fmtD(dTot);
        const pw = Math.max(40, text.length * lf * 0.62 + 14), ph = lf + 10;
        const pcx = Math.min(xv + 10 + pw / 2, right - pw / 2);
        const pcy = (yB + yV) / 2;
        this.el("rect", {
            x: pcx - pw / 2, y: pcy - ph / 2, width: pw, height: ph, rx: ph / 2,
            fill: cfg.paper, stroke: colOf(dTot), "stroke-width": 1.8
        }, bg);
        const pt = this.el("text", {
            x: pcx, y: pcy + lf * 0.36, "text-anchor": "middle", "font-size": lf,
            "font-weight": 600, fill: colOf(dTot), "font-family": FONT
        }, bg);
        pt.textContent = text;

        // ------- scenario caption top-left
        this.drawPanelTitle(bg, { x: region.x, y: region.y + pad, w: region.w, h: 12 },
            `${cfg.basisLabel} → AC${cfg.hasFc ? "/FC" : ""} · Brücke + Monatssäulen`,
            "columns", Math.round(12 * k), region, undefined, cfg.subtle);
    }

    /**
     * Category bridge (structure): PL/PY total rows on top, one row per category with
     * AC·PY mini-bars, a cascading ΔBasis brick and a ΔBasis% pin, an AC total row and
     * a double reconciliation (ΔBasis + Δother) with circled callout at the bottom —
     * ported from the "Waterfall Chart v2" reference.
     */
    private renderCategoryBridge(pts: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = pts.length;
        if (n === 0) { return; }
        const hasPy = pts.some(p => p.py != null);
        const hasPl = pts.some(p => p.pl != null);
        if (!hasPy && !hasPl) {
            this.drawModeHint(region, cfg, "Kategorie-Brücke benötigt PY oder PL als Vergleichsbasis");
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;

        const PYt = pts.reduce((a, p) => a + (p.py ?? 0), 0);
        const PLt = pts.reduce((a, p) => a + (p.pl ?? 0), 0);
        const ACt = pts.reduce((a, p) => a + (p.value ?? 0), 0);
        const refIsPl = cfg.basisMode === "plan" && hasPl;
        const refLabel = refIsPl ? "PL" : "PY";
        const REF = refIsPl ? PLt : PYt;
        const hasOther = refIsPl ? hasPy : hasPl;
        const otherTot = refIsPl ? PYt : PLt;
        const otherLabel = refIsPl ? "PY" : "PL";
        const dTot = ACt - REF;
        const goodOf = (v: number) => cfg.invert ? v < 0 : v > 0;
        const colOf = (v: number) => v === 0 ? cfg.colors.py : (goodOf(v) ? cfg.colors.good : cfg.colors.bad);
        const fmtD = (v: number) => this.fmtSigned(cfg.fmtVar, v);

        // ------- layout
        const rightEdge = region.x + region.w - pad;
        const catArea = Math.min(region.w * 0.22,
            this.maxTextWidth(pts.map(p => p.cat), cf) + 16);
        const x0 = region.x + pad + catArea;
        const showPins = cfg.showRel && region.w >= 520 && pts.some(p => p.varRel != null);
        const pinW = showPins ? Math.max(110, region.w * 0.15) + lf * 3 : 0;
        const valLblW = lf * 4.2;
        const xValEnd = rightEdge - pinW - valLblW;
        const maxV = Math.max(REF, ACt, hasOther ? otherTot : 0, 1);
        const X = linearScale(0, maxV, x0, xValEnd);
        const axisX = rightEdge - pinW * 0.52;
        const maxPinLen = Math.max(20, pinW * 0.52 - lf * 4.2 - 14);

        const headRows = (hasPl ? 1 : 0) + (hasPy ? 1 : 0);
        const footUnits = 1 + (hasOther ? 2.6 : 1.6);
        const availH = region.h - pad * 2 - 8;
        const rowH = availH / (n + headRows + footUnits + 0.6);
        let y = region.y + pad + 6;
        const yPL = hasPl ? y : null;
        if (hasPl) { y += rowH; }
        const yPY = hasPy ? y : null;
        if (hasPy) { y += rowH; }
        y += rowH * 0.3;
        const yS0 = y;
        const yAC = yS0 + n * rowH + rowH * 0.3;
        const yBr1 = yAC + rowH * 1.15;
        const yBr2 = hasOther ? yBr1 + rowH * 1.25 : null;

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const rowLabel = (yy: number, text: string, bold: boolean, parent: SVGElement) => {
            const t = this.el("text", {
                x: x0 - 8, y: yy + rowH / 2 + cf * 0.35, "text-anchor": "end",
                "font-size": cf, fill: cfg.ink, "font-family": FONT, "font-weight": bold ? 700 : 400
            }, parent);
            t.textContent = this.truncate(text, catArea - 10, cf);
        };
        const valLabel = (xx: number, yy: number, text: string, bold: boolean, parent: SVGElement,
            anchor: "start" | "end" = "start", color = cfg.ink) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": anchor, "font-size": lf, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = text;
        };
        const guide = (xx: number, y1: number, y2: number, strong: boolean, parent: SVGElement) => {
            this.el("line", {
                x1: xx, y1, x2: xx, y2, stroke: cfg.subtle, "stroke-width": 1,
                "stroke-opacity": strong ? 0.9 : 0.5
            }, parent);
        };

        // ------- top total rows (PL outline, PY grey)
        const barH = Math.max(6, rowH * 0.55);
        const endPrim = yBr1 + rowH * 0.5;
        const endSec = yBr2 != null ? yBr2 + rowH * 0.5 : endPrim;
        if (yPL != null) {
            rowLabel(yPL, "PL", true, bg);
            this.el("rect", {
                x: x0, y: yPL + (rowH - barH) / 2, width: Math.max(X(PLt) - x0, 1), height: barH,
                fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.5
            }, bg);
            valLabel(X(PLt) + 8, yPL + rowH / 2 + lf * 0.35, cfg.fmt.format(PLt), true, bg);
            guide(X(PLt), yPL + rowH, refIsPl ? endPrim : endSec, false, bg);
        }
        if (yPY != null) {
            rowLabel(yPY, "PY", true, bg);
            this.el("rect", {
                x: x0, y: yPY + (rowH - barH) / 2, width: Math.max(X(PYt) - x0, 1), height: barH,
                ...(cfg.hc
                    ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                    : { fill: cfg.colors.py })
            }, bg);
            valLabel(X(PYt) + 8, yPY + rowH / 2 + lf * 0.35, cfg.fmt.format(PYt), true, bg);
            guide(X(PYt), yPY + rowH, refIsPl ? endSec : endPrim, false, bg);
        }

        // ------- group separators
        const groupEvery = Math.round(this.formattingSettings.chartCard.groupEvery.value ?? 0);
        if (groupEvery > 0 && groupEvery < n) {
            for (let i = groupEvery; i < n; i += groupEvery) {
                this.el("line", {
                    x1: region.x + pad, y1: yS0 + i * rowH - 1, x2: rightEdge, y2: yS0 + i * rowH - 1,
                    stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.35
                }, bg);
            }
        }

        // ------- ΔBasis% pin axis
        if (showPins) {
            const tp = this.el("text", {
                x: axisX, y: yS0 - 8, "text-anchor": "middle", "font-size": Math.round(11 * k),
                fill: cfg.subtle, "font-family": FONT, "font-weight": 600
            }, bg);
            tp.textContent = `Δ${refLabel}%`;
            this.el("rect", {
                x: axisX - 1.5, y: yS0, width: 3, height: yAC - yS0 - rowH * 0.2,
                fill: cfg.colors.py
            }, bg);
            this.el("rect", {
                x: axisX - 1.5, y: yAC + rowH * 0.1, width: 3, height: rowH * 0.8,
                fill: cfg.colors.py
            }, bg);
        }
        const maxPct = Math.max(...pts.map(p => Math.abs(p.varRel ?? 0)),
            REF !== 0 ? Math.abs(dTot / REF * 100) : 0, 1);
        const pinLen = (v: number) => Math.max(2, Math.abs(v) / maxPct * maxPinLen);
        const drawPin = (yy: number, pct: number, bold: boolean, parent: SVGElement) => {
            const w = pinLen(pct);
            const yMid = yy + rowH / 2;
            const c = colOf(pct);
            const r = Math.max(2.6, 3.4 * k);
            if (pct >= 0) {
                this.el("rect", { x: axisX + 2, y: yMid - 1.5, width: w, height: 3, fill: c }, parent);
                this.el("rect", { x: axisX + 2 + w, y: yMid - r, width: 2 * r, height: 2 * r, fill: cfg.ink }, parent);
                valLabel(axisX + 2 + w + 2 * r + 4, yMid + lf * 0.35, this.fmtPercent(pct), bold, parent);
            } else {
                this.el("rect", { x: axisX - 2 - w, y: yMid - 1.5, width: w, height: 3, fill: c }, parent);
                this.el("rect", { x: axisX - 2 - w - 2 * r, y: yMid - r, width: 2 * r, height: 2 * r, fill: cfg.ink }, parent);
                valLabel(axisX - 2 - w - 2 * r - 4, yMid + lf * 0.35, this.fmtPercent(pct), bold, parent, "end");
            }
        };

        // ------- biggest driver
        let drvIdx = -1;
        pts.forEach((p, i) => {
            if (p.varAbs == null) { return; }
            if (drvIdx < 0 || Math.abs(p.varAbs) > Math.abs(pts[drvIdx].varAbs ?? 0)) { drvIdx = i; }
        });

        // ------- category rows
        const pyBarH = Math.max(3, rowH * 0.30);
        const acBarH = Math.max(4, rowH * 0.42);
        const brickH = Math.max(5, rowH * 0.48);
        let cum = REF;
        const refRowY = refIsPl ? (yPL as number) : (yPY as number);
        guide(X(REF), refRowY + rowH, yS0 + rowH * 0.26, true, bg);
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const yy = yS0 + i * rowH;
            rowLabel(yy, p.cat, false, g);

            // mini bars: reference (PY grey / PL outline) behind, AC in front
            const behind = hasPy ? p.py : p.pl;
            if (behind != null) {
                this.el("rect", {
                    x: x0, y: yy + rowH * 0.12, width: Math.max(X(behind) - x0, 1), height: pyBarH,
                    ...(cfg.hc || !hasPy
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1 }
                        : { fill: cfg.colors.py })
                }, g);
            }
            if (p.value != null) {
                this.el("rect", {
                    x: x0, y: yy + rowH * 0.30, width: Math.max(X(p.value) - x0, 1), height: acBarH,
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                if (cfg.showLabels) {
                    const xl = Math.max(X(p.value), behind != null ? X(behind) : 0);
                    valLabel(xl + 6, yy + rowH / 2 + lf * 0.35, cfg.fmt.format(p.value), false, g);
                }
            }

            // cascade brick + connector
            if (p.varAbs != null) {
                const d = p.varAbs;
                const a = cum, b = cum + d;
                const xA = X(Math.min(a, b)), xB = X(Math.max(a, b));
                const c = colOf(d);
                const hollowBad = cfg.hc && !goodOf(d) && d !== 0;
                this.el("rect", {
                    x: xA, y: yy + rowH * 0.26, width: Math.max(xB - xA, 2), height: brickH,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(d) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
                if (cfg.showLabels) {
                    if (d >= 0) { valLabel(xB + 6, yy + rowH / 2 + lf * 0.35, fmtD(d), false, g); }
                    else { valLabel(xA - 6, yy + rowH / 2 + lf * 0.35, fmtD(d), false, g, "end"); }
                }
                // größter Treiber annotation
                if (i === drvIdx && dTot !== 0 && region.w >= 640) {
                    const share = Math.round(Math.abs(d / dTot) * 100);
                    let note: string;
                    if (Math.sign(d) === Math.sign(dTot) && share <= 100) {
                        note = `größter Treiber · ${share} % der Gesamtabweichung`;
                    } else {
                        const sameSum = pts.reduce((a2, q) =>
                            a2 + (q.varAbs != null && Math.sign(q.varAbs) === Math.sign(d) ? Math.abs(q.varAbs) : 0), 0);
                        const sh2 = sameSum ? Math.round(Math.abs(d) / sameSum * 100) : 0;
                        note = `größter Treiber · ${sh2} % aller ${d < 0 ? "Rückgänge" : "Zuwächse"}`;
                    }
                    const noteFont = Math.round(Math.max(9, lf * 0.85));
                    const nt = this.el("text", {
                        x: d >= 0 ? xB + 6 + fmtD(d).length * lf * 0.62 + 12 : xA - 6 - fmtD(d).length * lf * 0.62 - 12,
                        y: yy + rowH / 2 + lf * 0.35, "text-anchor": d >= 0 ? "start" : "end",
                        "font-size": noteFont, fill: cfg.subtle, "font-family": FONT, "font-style": "italic",
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    nt.textContent = note;
                }
                // vertical connector to the next row / to the AC row
                const nextY = i < n - 1 ? yy + rowH + rowH * 0.26 : yAC + rowH * 0.2;
                guide(X(b), yy + rowH * 0.26 + brickH, nextY, true, bg);
                cum = b;
            }

            if (showPins && p.varRel != null) {
                drawPin(yy, p.varRel, false, g);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // ------- AC total row
        rowLabel(yAC, "AC", true, bg);
        this.el("rect", {
            x: x0, y: yAC + (rowH - barH) / 2, width: Math.max(X(ACt) - x0, 1), height: barH,
            ...(cfg.hasFc
                ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1.2 }
                : { fill: cfg.colors.ac })
        }, bg);
        valLabel(X(ACt) + 8, yAC + rowH / 2 + lf * 0.35, cfg.fmt.format(ACt), true, bg);
        guide(X(ACt), yAC + rowH, endSec, false, bg);
        if (showPins && REF !== 0) {
            drawPin(yAC, dTot / REF * 100, true, bg);
        }

        // ------- reconciliation rows: primary ΔRef with circled callout, then Δother
        const brH = Math.max(5, rowH * 0.4);
        const drawBridgeRow = (yy: number, from: number, to: number, label: string,
            withCallout: boolean) => {
            const d = to - from;
            const xA = X(Math.min(from, to)), xB = X(Math.max(from, to));
            this.el("rect", {
                x: xA, y: yy, width: Math.max(xB - xA, 2), height: brH, fill: colOf(d)
            }, bg);
            const mid = (X(from) + X(to)) / 2;
            if (withCallout) {
                const text = fmtD(d);
                const pw = Math.max(44, text.length * lf * 0.62 + 16), ph = lf + 9;
                this.el("rect", {
                    x: mid - pw / 2, y: yy + brH + 4, width: pw, height: ph, rx: ph / 2,
                    fill: cfg.paper, stroke: colOf(d), "stroke-width": 1.8
                }, bg);
                valLabel(mid, yy + brH + 4 + ph / 2 + lf * 0.36, text, true, bg, "start", colOf(d));
                const tt = bg.lastChild as SVGTextElement;
                tt.setAttribute("text-anchor", "middle");
            } else {
                valLabel(mid, yy + brH + lf + 4, fmtD(d), false, bg, "start");
                const tt = bg.lastChild as SVGTextElement;
                tt.setAttribute("text-anchor", "middle");
            }
            const lt = this.el("text", {
                x: xB + 10, y: yy + brH * 0.5 + lf * 0.35, "font-size": Math.round(Math.max(9, lf * 0.85)),
                fill: cfg.subtle, "font-family": FONT
            }, bg);
            lt.textContent = label;
        };
        drawBridgeRow(yBr1, REF, ACt, `Δ${refLabel}`, true);
        if (yBr2 != null) {
            drawBridgeRow(yBr2, otherTot, ACt, `Δ${otherLabel}`, false);
        }
    }

    /**
     * IBCS table: one row per category with the value, an AC·PY·PL bar cell, the
     * ΔBasis as number + bar and ΔBasis % as pin — a financial-statement style
     * table with integrated chart columns. 'sum' rows (Waterfall-Type role) render
     * bold with a stronger separator, like P&L subtotals. Columns drop gracefully
     * when the region gets narrow, so plain value tables still work on small tiles.
     */
    private renderTable(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = points.length;
        if (n === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;
        const hasVar = points.some(p => p.varAbs != null);
        const hasVar2 = cfg.showDual && points.some(p => p.var2Abs != null);
        const showPct = cfg.showRel && hasVar;
        const isSum = (p: DataPoint) => p.rowType != null && p.rowType.startsWith("sum");

        // ------- column layout: fixed text columns, graphic columns share the rest
        const nameW = Math.min(region.w * 0.24,
            this.maxTextWidth(points.map(p => p.cat), cf) + 18);
        const valW = lf * 4.8;
        const dValW = hasVar ? lf * 4.6 : 0;
        const d2ValW = hasVar2 ? lf * 4.6 : 0;
        const gap = 10;
        const fixed = nameW + valW + dValW + d2ValW;
        type GCol = { key: "bars" | "dbar" | "pct" | "d2bar"; min: number; w: number };
        const wanted: GCol[] = [];
        if (cfg.showAbs || cfg.hasPy || cfg.hasPl) { wanted.push({ key: "bars", min: 110 * k, w: 0 }); }
        if (hasVar && cfg.showAbs) { wanted.push({ key: "dbar", min: 80 * k, w: 0 }); }
        if (showPct) { wanted.push({ key: "pct", min: 95 * k, w: 0 }); }
        if (hasVar2) { wanted.push({ key: "d2bar", min: 80 * k, w: 0 }); }
        // greedily keep graphic columns while the leftover width fits their minimums
        const graphic: GCol[] = [];
        for (const c of wanted) {
            const need = graphic.reduce((a, g) => a + g.min, 0) + c.min;
            const leftover = region.w - pad * 2 - fixed - gap * (graphic.length + 3);
            if (need <= leftover) { graphic.push(c); }
        }
        const spare = region.w - pad * 2 - fixed - gap * (graphic.length + 3)
            - graphic.reduce((a, g) => a + g.min, 0);
        for (const g of graphic) {
            g.w = g.min + (graphic.length > 0 ? spare / graphic.length : 0);
        }
        const colX: { [key: string]: { x: number; w: number } } = {};
        let x = region.x + pad;
        colX["name"] = { x, w: nameW }; x += nameW + gap;
        colX["val"] = { x, w: valW }; x += valW + gap;
        const barsCol = graphic.find(g => g.key === "bars");
        if (barsCol) { colX["bars"] = { x, w: barsCol.w }; x += barsCol.w + gap; }
        if (hasVar) { colX["dval"] = { x, w: dValW }; x += dValW + gap; }
        const dbarCol = graphic.find(g => g.key === "dbar");
        if (dbarCol) { colX["dbar"] = { x, w: dbarCol.w }; x += dbarCol.w + gap; }
        const pctCol = graphic.find(g => g.key === "pct");
        if (pctCol) { colX["pct"] = { x, w: pctCol.w }; x += pctCol.w + gap; }
        if (hasVar2) { colX["d2val"] = { x, w: d2ValW }; x += d2ValW + gap; }
        const d2barCol = graphic.find(g => g.key === "d2bar");
        if (d2barCol) { colX["d2bar"] = { x, w: d2barCol.w }; }

        // ------- row layout + shared scales
        const headerH = Math.round(cf + 12);
        const rowH = Math.max(cf + 6, (region.h - pad * 2 - headerH) / n);
        const top = region.y + pad + headerH;
        const maxRows = Math.floor((region.h - pad * 2 - headerH) / rowH);
        const shown = points.slice(0, Math.max(1, maxRows));

        const barDomain = extent(points.flatMap(p => [p.value, p.py, p.pl]));
        const dDomain = Math.max(...points.map(p => Math.abs(p.varAbs ?? 0)), 1);
        const d2Domain = Math.max(...points.map(p => Math.abs(p.var2Abs ?? 0)), 1);
        const maxPct = Math.max(...points.map(p => Math.abs(p.varRel ?? 0)), 1);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const goodOf = (v: number) => cfg.invert ? v < 0 : v > 0;
        const colOf = (v: number) => v === 0 ? cfg.colors.py : (goodOf(v) ? cfg.colors.good : cfg.colors.bad);
        const txt = (xx: number, yy: number, text: string, anchor: string, font: number,
            bold: boolean, color: string, parent: SVGElement) => {
            const t = this.el("text", {
                x: xx, y: yy, "text-anchor": anchor, "font-size": font, fill: color,
                "font-family": FONT, "font-weight": bold ? 700 : 400
            }, parent);
            t.textContent = text;
            return t;
        };

        // ------- header row (column titles)
        const hFont = Math.round(10 * k);
        const hy = region.y + pad + hFont + 2;
        const scen = ["AC", cfg.hasPy ? "PY" : "", cfg.hasPl ? "PL" : ""].filter(v => v).join(" · ");
        txt(colX["val"].x + colX["val"].w, hy, "AC", "end", hFont, true, cfg.subtle, bg);
        if (colX["bars"]) { txt(colX["bars"].x + 2, hy, scen, "start", hFont, true, cfg.subtle, bg); }
        if (colX["dval"]) { txt(colX["dval"].x + colX["dval"].w, hy, `Δ${cfg.basisLabel}`, "end", hFont, true, cfg.subtle, bg); }
        if (colX["pct"]) { txt(colX["pct"].x + colX["pct"].w / 2, hy, `Δ${cfg.basisLabel} %`, "middle", hFont, true, cfg.subtle, bg); }
        if (colX["d2val"]) { txt(colX["d2val"].x + colX["d2val"].w, hy, `Δ${cfg.basis2Label}`, "end", hFont, true, cfg.subtle, bg); }
        this.el("line", {
            x1: region.x + pad, y1: top - 2, x2: region.x + region.w - pad, y2: top - 2,
            stroke: cfg.ink, "stroke-width": 1.2
        }, bg);

        // ------- shared axes for the graphic columns
        const barScale = colX["bars"]
            ? linearScale(Math.min(barDomain[0], 0), Math.max(barDomain[1], 1), colX["bars"].x + 2, colX["bars"].x + colX["bars"].w - 2)
            : null;
        const rowsBottom = top + shown.length * rowH;
        if (barScale && Math.min(barDomain[0], 0) < 0) {
            this.el("line", {
                x1: barScale(0), y1: top, x2: barScale(0), y2: rowsBottom,
                stroke: cfg.subtle, "stroke-width": 1
            }, bg);
        }
        const dAxis = colX["dbar"] ? colX["dbar"].x + colX["dbar"].w / 2 : 0;
        if (colX["dbar"]) {
            this.el("rect", { x: dAxis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }
        const pctAxis = colX["pct"] ? colX["pct"].x + colX["pct"].w / 2 : 0;
        if (colX["pct"]) {
            this.el("rect", { x: pctAxis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }
        const d2Axis = colX["d2bar"] ? colX["d2bar"].x + colX["d2bar"].w / 2 : 0;
        if (colX["d2bar"]) {
            this.el("rect", { x: d2Axis - 1, y: top, width: 2, height: rowsBottom - top, fill: cfg.colors.py }, bg);
        }

        // ------- rows
        shown.forEach((p, i) => {
            const y = top + i * rowH;
            const yMid = y + rowH / 2;
            const sum = isSum(p);
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;

            // separators: subtle under every row, strong above subtotals
            this.el("line", {
                x1: region.x + pad, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH,
                stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.4
            }, bg);
            if (sum) {
                this.el("line", {
                    x1: region.x + pad, y1: y, x2: region.x + region.w - pad, y2: y,
                    stroke: cfg.ink, "stroke-width": 1.2
                }, bg);
            }
            if (cfg.highlight.has(p.cat.toLowerCase())) {
                this.el("rect", {
                    x: region.x + pad, y: y + 1, width: region.w - pad * 2, height: rowH - 2,
                    fill: cfg.hc ? "none" : cfg.ink, "fill-opacity": cfg.hc ? 0 : 0.07,
                    stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1 : 0
                }, bg);
            }

            const rowFont = Math.min(cf, rowH - 4);
            txt(colX["name"].x + (sum ? 0 : Math.round(6 * k)), yMid + rowFont * 0.35,
                this.truncate(p.cat, colX["name"].w - 8, rowFont), "start", rowFont, sum, cfg.ink, g);
            if (p.value != null) {
                txt(colX["val"].x + colX["val"].w, yMid + rowFont * 0.35,
                    cfg.fmt.format(p.value), "end", rowFont, sum, cfg.ink, g);
            }

            // AC·PY·PL bar cell (shared scale across all rows — IBCS)
            if (barScale) {
                const zero = barScale(0);
                const barCell = (v: number, h: number, off: number, style: Record<string, string | number>) => {
                    const e = barScale(v);
                    this.el("rect", {
                        x: Math.min(zero, e), y: y + rowH * off,
                        width: Math.max(Math.abs(e - zero), 1), height: h, ...style
                    }, g);
                };
                const pyH = Math.max(2, rowH * 0.26), acH = Math.max(3, rowH * 0.42);
                if (p.py != null) {
                    barCell(p.py, pyH, 0.12, cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py });
                }
                if (p.pl != null) {
                    barCell(p.pl, acH, 0.30, { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.2 });
                }
                if (p.value != null) {
                    barCell(p.value, acH, 0.36, p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac });
                }
            }

            // ΔBasis: number + bar
            if (p.varAbs != null && colX["dval"]) {
                txt(colX["dval"].x + colX["dval"].w, yMid + rowFont * 0.35,
                    this.fmtSigned(cfg.fmtVar, p.varAbs), "end", rowFont, sum,
                    p.varAbs === 0 ? cfg.subtle : colOf(p.varAbs), g);
            }
            if (p.varAbs != null && colX["dbar"]) {
                const len = Math.abs(p.varAbs) / dDomain * (colX["dbar"].w / 2 - 4);
                const h = Math.max(3, rowH * 0.42);
                const c = colOf(p.varAbs);
                const hollowBad = cfg.hc && !goodOf(p.varAbs) && p.varAbs !== 0;
                this.el("rect", {
                    x: p.varAbs >= 0 ? dAxis + 1 : dAxis - 1 - len, y: yMid - h / 2,
                    width: Math.max(len, 1), height: h,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.2 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(p.varAbs) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
            }

            // ΔBasis %: pin with label
            if (p.varRel != null && colX["pct"]) {
                const len = Math.abs(p.varRel) / maxPct * (colX["pct"].w / 2 - lf * 3);
                const c = colOf(p.varRel);
                const r = Math.max(2.4, 3 * k);
                const dir = p.varRel >= 0 ? 1 : -1;
                const endX = pctAxis + dir * Math.max(len, 2);
                this.el("line", { x1: pctAxis, y1: yMid, x2: endX, y2: yMid, stroke: c, "stroke-width": 2 }, g);
                this.el("rect", {
                    x: endX - r, y: yMid - r, width: 2 * r, height: 2 * r,
                    fill: p.isFc ? cfg.paper : cfg.ink, stroke: cfg.ink, "stroke-width": p.isFc ? 1 : 0
                }, g);
                txt(endX + dir * (r + 4), yMid + rowFont * 0.35, this.fmtPercent(p.varRel),
                    dir > 0 ? "start" : "end", Math.round(rowFont * 0.92), sum, cfg.ink, g);
            }

            // ΔBasis2 (dual): number + bar
            if (hasVar2 && p.var2Abs != null && colX["d2val"]) {
                txt(colX["d2val"].x + colX["d2val"].w, yMid + rowFont * 0.35,
                    this.fmtSigned(cfg.fmtVar, p.var2Abs), "end", rowFont, sum,
                    p.var2Abs === 0 ? cfg.subtle : colOf(p.var2Abs), g);
            }
            if (hasVar2 && p.var2Abs != null && colX["d2bar"]) {
                const len = Math.abs(p.var2Abs) / d2Domain * (colX["d2bar"].w / 2 - 4);
                const h = Math.max(3, rowH * 0.42);
                this.el("rect", {
                    x: p.var2Abs >= 0 ? d2Axis + 1 : d2Axis - 1 - len, y: yMid - h / 2,
                    width: Math.max(len, 1), height: h, fill: colOf(p.var2Abs)
                }, g);
            }

            // comment marker number, if bound
            if (p.commentNo != null) {
                txt(colX["name"].x + colX["name"].w - 4, yMid + rowFont * 0.35,
                    `(${p.commentNo})`, "end", Math.round(rowFont * 0.85), false, cfg.subtle, g);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        if (shown.length < n) {
            txt(region.x + pad, rowsBottom + cf, `… ${n - shown.length} weitere Zeilen (Visual höher ziehen)`,
                "start", Math.round(cf * 0.9), false, cfg.subtle, bg);
        }
    }

    /** renders one complete IBCS chart (base + variance panels) into the given region */
    private renderChart(points: DataPoint[], region: Rect, cfg: ChartConfig, domains: Domains,
        cascade: Cascade | null = null): void {
        const n = points.length;
        const pad = 4;
        const titleH = Math.round(14 * this.fontK);
        const orientation = cfg.orientation;
        // waterfall-bridge: an extra panel alongside the normal AC/PY/PL comparison bars,
        // showing the same categories cascading from the basis total to AC with connectors
        const wfStyle = cascade != null;

        // compact mode: too little room for variance panels → deltas become labels
        const compact = orientation === "columns" ? region.h < 190 : region.w < 420;
        const showAbs = cfg.showAbs && !compact;
        const showRel = cfg.showRel && !compact;
        const showDual = cfg.showDual && !compact
            && (orientation === "columns" ? region.h >= 320 : region.w >= 640);
        const showBridge = wfStyle && !compact
            && (orientation === "columns" ? region.h >= 260 : region.w >= 520);
        // total (Σ) header row on top of the region
        const showTotal = cfg.showTotal && region.w > 240;
        const headerH = showTotal ? Math.round(17 * this.fontK) : 0;

        let bandStart: number, bandEnd: number;
        let panels: { main: Rect; abs?: Rect; rel?: Rect; abs2?: Rect; rel2?: Rect; bridge?: Rect };

        if (orientation === "columns") {
            const catArea = cfg.catFont + 10;
            bandStart = region.x + pad + 2;
            bandEnd = region.x + region.w - pad;
            const plotTop = region.y + pad + headerH, plotBottom = region.y + region.h - catArea;
            panels = this.splitPanels(plotTop, plotBottom - plotTop, showAbs, showRel, true, region, showDual, showBridge);
        } else {
            const catArea = Math.min(region.w * 0.28, this.maxTextWidth(points.map(p => p.cat), cfg.catFont) + 12);
            // room for the header and the panel titles above the first bar
            bandStart = region.y + pad + headerH + titleH + 2;
            bandEnd = region.y + region.h - pad;
            const plotLeft = region.x + pad + catArea, plotRight = region.x + region.w - pad;
            panels = this.splitPanels(plotLeft, plotRight - plotLeft, showAbs, showRel, false, region, showDual, showBridge);
        }

        const bandSpan = bandEnd - bandStart;
        const step = bandSpan / n;
        const slotW = Math.max(2, step * 0.62);
        const barW = cfg.hasPy ? slotW * 0.82 : slotW;
        const pyShift = cfg.hasPy ? slotW - barW : 0;
        const slotPos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        // the bridge panel gets its own n+2 slot grid (basis anchor, n bricks, value
        // anchor) — real anchor bars flanking the cascade, like the reference bridge
        // charts' PL/PY/AC total columns. Slightly narrower slots than the main panel
        // to make room for the two extra anchors.
        const bridgeN = n + 2;
        const bridgeStep = bandSpan / bridgeN;
        const bridgeSlotW = Math.max(2, bridgeStep * 0.62);
        const bridgeSlotPos = (i: number) => bandStart + i * bridgeStep + (bridgeStep - bridgeSlotW) / 2;

        // ------- precompute label texts + thinning predicates
        const valueTexts = points.map(p => p.value != null ? cfg.fmt.format(p.value) : "");
        const absTexts = points.map(p => p.varAbs != null ? this.fmtSigned(cfg.fmtVar, p.varAbs) : "");
        const relTexts = points.map(p => p.varRel != null ? this.fmtPercent(p.varRel) : "");
        const abs2Texts = points.map(p => p.var2Abs != null ? this.fmtSigned(cfg.fmtVar, p.var2Abs) : "");
        const rel2Texts = points.map(p => p.var2Rel != null ? this.fmtPercent(p.var2Rel) : "");
        const showValueAt = this.labelPredicate(points, valueTexts, cfg.labelFont, step, orientation);
        const showAbsAt = this.labelPredicate(points, absTexts, cfg.labelFont, step, orientation);
        const showRelAt = this.labelPredicate(points, relTexts, cfg.labelFont, step, orientation);
        const showAbs2At = this.labelPredicate(points, abs2Texts, cfg.labelFont, step, orientation);
        const showRel2At = this.labelPredicate(points, rel2Texts, cfg.labelFont, step, orientation);
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cfg.catFont, step, orientation);

        // ------- scales
        const labelPad = cfg.showLabels ? cfg.labelFont + 6 : 6;
        const compactLabelPad = compact && cfg.showLabels && orientation === "columns"
            ? labelPad + cfg.labelFont + 4 : labelPad;
        const mainScale = this.makePanelScale(domains.main, panels.main, orientation, compactLabelPad);
        const absScale = panels.abs
            ? this.makePanelScale(domains.abs, panels.abs, orientation, labelPad) : null;
        const relScale = panels.rel
            ? this.makePanelScale(domains.rel, panels.rel, orientation, labelPad) : null;
        const abs2Scale = panels.abs2
            ? this.makePanelScale(domains.abs2, panels.abs2, orientation, labelPad) : null;
        const rel2Scale = panels.rel2
            ? this.makePanelScale(domains.rel2, panels.rel2, orientation, labelPad) : null;
        // the bridge domain floats away from zero on both sides — reserve label room at
        // both ends instead of just the side a zero-anchored chart would need
        const bridgeScale = panels.bridge
            ? this.makePanelScale(domains.bridge, panels.bridge, orientation, labelPad, true) : null;

        // ------- background layer: baselines + panel titles
        const bg = this.el("g", {}, this.svg);
        const scenarioTitle = (cfg.cumulative ? "YTD · " : "")
            + ["AC", cfg.hasPy ? "PY" : "", cfg.hasPl ? "PL" : "",
                cfg.hasFc ? "FC" : "", cfg.hasBm ? "BM ‒" : ""].filter(x => x).join(" · ");

        // AC -> FC boundary (time series with a forecast tail) — not meaningful once
        // waterfall-bridge sorting reorders categories by impact instead of chronology
        let fcBoundary: number | null = null;
        if (orientation === "columns" && cfg.hasFc && !(wfStyle && cfg.sortByImpact)) {
            const fcStart = points.findIndex(p => p.isFc);
            const isTail = fcStart > 0 && points.slice(fcStart).every(p => p.isFc || p.value == null);
            if (isTail) { fcBoundary = bandStart + fcStart * step; }
        }
        // baselines are dashed underneath the forecast section (IBCS notation)
        const baseline = (rect: Rect, scale: Scale, kind: "ac" | Basis) => {
            if (fcBoundary == null) {
                this.drawBaseline(bg, rect, scale, orientation, bandStart, bandEnd, kind, cfg.colors);
            } else {
                this.drawBaseline(bg, rect, scale, orientation, bandStart, fcBoundary, kind, cfg.colors);
                this.drawBaseline(bg, rect, scale, orientation, fcBoundary, bandEnd, kind, cfg.colors, true);
            }
        };
        baseline(panels.main, mainScale, "ac");
        const compactVarHint = compact && (cfg.showAbs || cfg.showRel)
            ? `  ·  Δ${cfg.basisLabel}${cfg.showRel ? " %" : ""}` : "";
        const barsTitleY = orientation === "bars" ? bandStart - 6 : undefined;
        this.drawPanelTitle(bg, panels.main, scenarioTitle + compactVarHint,
            orientation, titleH, region, barsTitleY, cfg.subtle);
        if (panels.abs && absScale) {
            baseline(panels.abs, absScale, cfg.basisMode);
            this.drawPanelTitle(bg, panels.abs, `Δ${cfg.basisLabel}`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        if (panels.rel && relScale) {
            baseline(panels.rel, relScale, cfg.basisMode);
            this.drawPanelTitle(bg, panels.rel, `Δ${cfg.basisLabel} %`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        const basis2Mode: Basis = cfg.basisMode === "plan" ? "py" : "plan";
        if (panels.abs2 && abs2Scale) {
            baseline(panels.abs2, abs2Scale, basis2Mode);
            this.drawPanelTitle(bg, panels.abs2, `Δ${cfg.basis2Label}`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        if (panels.rel2 && rel2Scale) {
            baseline(panels.rel2, rel2Scale, basis2Mode);
            this.drawPanelTitle(bg, panels.rel2, `Δ${cfg.basis2Label} %`, orientation, titleH, region, barsTitleY, cfg.subtle);
        }
        if (panels.bridge && bridgeScale && cascade) {
            const bridgeTitle = `${cfg.basisLabel} → AC` + (cfg.sortByImpact ? " ⇅" : "");
            this.drawPanelTitle(bg, panels.bridge, bridgeTitle, orientation, titleH, region, barsTitleY, cfg.subtle);
        }

        // ------- total (Σ) header
        if (showTotal) {
            this.drawTotalHeader(bg, region, points, cfg);
        }

        // ------- AC → FC boundary separator (time series only)
        if (fcBoundary != null) {
            const yTop = Math.min(panels.main.y,
                panels.abs ? panels.abs.y : Infinity,
                panels.rel ? panels.rel.y : Infinity,
                panels.abs2 ? panels.abs2.y : Infinity,
                panels.rel2 ? panels.rel2.y : Infinity,
                panels.bridge ? panels.bridge.y : Infinity);
            const yBot = panels.main.y + panels.main.h;
            this.el("line", {
                x1: fcBoundary, y1: yTop + 2, x2: fcBoundary, y2: yBot,
                stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "3,3"
            }, bg);
        }

        // ------- category group separators: thin lines every N categories, spanning all
        // active panels — a reading aid for structure comparisons with natural subgroups
        // (e.g. regions), matching the reference bridge charts' grouped state lists
        const groupEvery = Math.round(this.formattingSettings.chartCard.groupEvery.value ?? 0);
        if (groupEvery > 0 && groupEvery < n) {
            const allPanels = [panels.main, panels.abs, panels.rel, panels.abs2, panels.rel2, panels.bridge]
                .filter((r): r is Rect => r != null);
            const stackY0 = Math.min(...allPanels.map(r => r.y));
            const stackY1 = Math.max(...allPanels.map(r => r.y + r.h));
            const stackX0 = Math.min(...allPanels.map(r => r.x));
            const stackX1 = Math.max(...allPanels.map(r => r.x + r.w));
            for (let i = groupEvery; i < n; i += groupEvery) {
                const p1 = bandStart + i * step;
                if (orientation === "columns") {
                    this.el("line", {
                        x1: p1, y1: stackY0, x2: p1, y2: stackY1,
                        stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.5
                    }, bg);
                } else {
                    this.el("line", {
                        x1: stackX0, y1: p1, x2: stackX1, y2: p1,
                        stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.5
                    }, bg);
                }
            }
        }

        // ------- highlight bands (IBCS EMPHASIZE): shaded slot background
        if (cfg.highlight.size > 0) {
            const hlTop = Math.min(panels.main.y,
                panels.abs ? panels.abs.y : Infinity,
                panels.rel ? panels.rel.y : Infinity,
                panels.abs2 ? panels.abs2.y : Infinity,
                panels.rel2 ? panels.rel2.y : Infinity,
                panels.bridge ? panels.bridge.y : Infinity) + 2;
            for (let i = 0; i < n; i++) {
                if (!cfg.highlight.has(points[i].cat.toLowerCase())) { continue; }
                const x0 = bandStart + i * step;
                if (orientation === "columns") {
                    this.el("rect", {
                        x: x0 + 1, y: hlTop, width: step - 2,
                        height: region.y + region.h - hlTop,
                        fill: cfg.hc ? "none" : cfg.ink,
                        "fill-opacity": cfg.hc ? 0 : 0.07,
                        stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1 : 0
                    }, bg);
                } else {
                    this.el("rect", {
                        x: region.x + 1, y: x0 + 1,
                        width: region.w - 2, height: step - 2,
                        fill: cfg.hc ? "none" : cfg.ink,
                        "fill-opacity": cfg.hc ? 0 : 0.07,
                        stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1 : 0
                    }, bg);
                }
            }
        }

        // ------- line mode: scenario paths underneath the markers
        const lineMode = cfg.lineMode && orientation === "columns";
        if (lineMode) {
            this.drawLinePaths(bg, points, (i: number) => slotPos(i) + slotW / 2, mainScale, cfg);
        }

        // ------- moving average overlay (time series only)
        if (cfg.movingAvg >= 2 && orientation === "columns") {
            this.drawMovingAverage(bg, points, (i: number) => lineMode
                ? slotPos(i) + slotW / 2
                : slotPos(i) + pyShift + barW / 2, mainScale, cfg);
        }

        // ------- category groups with all marks
        const marks = this.el("g", {}, this.svg);

        // bridge anchor bars: real PL/PY-total and AC(+FC)-total bars flanking the
        // cascade, drawn from the panel floor (domains.bridge[0]) up to each total —
        // replaces plain guide lines with literal bars, like the reference bridge
        // charts' PL/PY/AC total columns
        if (panels.bridge && bridgeScale && cascade) {
            const basisStyle = cfg.basisMode === "plan"
                ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 }
                : { fill: cfg.colors.py };
            const basisPos = bridgeSlotPos(0);
            this.drawBar(marks, basisPos, bridgeSlotW, domains.bridge[0], cascade.basisSum,
                bridgeScale, orientation, basisStyle);
            if (cfg.showLabels) {
                this.drawEndLabelAt(marks, basisPos + bridgeSlotW / 2, cascade.basisSum, true, bridgeScale,
                    orientation, `${cfg.basisLabel} ${cfg.fmt.format(cascade.basisSum)}`,
                    cfg.labelFont, cfg.ink, 0, cfg.paper);
            }

            const valueLabel = cascade.fcSum > 0 ? "AC/FC" : "AC";
            const valueStyle = cascade.fcSum > 0
                ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                : { fill: cfg.colors.ac };
            const valuePos = bridgeSlotPos(n + 1);
            this.drawBar(marks, valuePos, bridgeSlotW, domains.bridge[0], cascade.valueSum,
                bridgeScale, orientation, valueStyle);
            if (cfg.showLabels) {
                this.drawEndLabelAt(marks, valuePos + bridgeSlotW / 2, cascade.valueSum, true, bridgeScale,
                    orientation, `${valueLabel} ${cfg.fmt.format(cascade.valueSum)}`,
                    cfg.labelFont, cfg.ink, 0, cfg.paper);
            }
        }

        for (let i = 0; i < n; i++) {
            const p = points[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const pos = slotPos(i);
            const cx = lineMode ? pos + slotW / 2 : pos + pyShift + barW / 2;

            // base chart: PY behind, PL outline, AC/FC on top (unchanged by waterfall-bridge —
            // the cascade renders into its own panel below, see "bridge brick" further down)
            const capV = (v: number) => cfg.capMax != null ? Math.min(v, cfg.capMax) : v;
            if (!lineMode && p.py != null) {
                this.drawBar(g, pos, barW, 0, capV(p.py), mainScale, orientation,
                    cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py });
            }
            if (!lineMode && p.pl != null) {
                this.drawBar(g, pos + pyShift, barW, 0, capV(p.pl), mainScale, orientation,
                    { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.4 });
            }
            // benchmark marker: bold tick across the slot at the BM value
            if (p.bm != null) {
                const bpos = mainScale(capV(p.bm));
                if (orientation === "columns") {
                    this.el("line", {
                        x1: pos - 1, y1: bpos, x2: pos + slotW + 1, y2: bpos,
                        stroke: cfg.ink, "stroke-width": 2.4
                    }, g);
                } else {
                    this.el("line", {
                        x1: bpos, y1: pos - 1, x2: bpos, y2: pos + slotW + 1,
                        stroke: cfg.ink, "stroke-width": 2.4
                    }, g);
                }
            }

            if (p.value != null) {
                if (this.compareActive) {
                    this.compareAnchors.set(p.cat, { band: cx, end: mainScale(capV(p.value)), value: p.value });
                }
                if (lineMode) {
                    // transparent hit area for tooltips/selection + point marker
                    this.el("rect", {
                        x: pos, y: panels.main.y, width: slotW, height: panels.main.h,
                        fill: cfg.paper, "fill-opacity": 0, "pointer-events": "all"
                    }, g);
                    this.el("circle", {
                        cx, cy: mainScale(capV(p.value)), r: 2.6,
                        fill: p.isFc ? cfg.paper : cfg.colors.ac,
                        stroke: cfg.colors.ac, "stroke-width": 1.4
                    }, g);
                } else {
                    this.drawBar(g, pos + pyShift, barW, 0, capV(p.value), mainScale, orientation,
                        p.isFc
                            ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                            : { fill: cfg.colors.ac });
                    if (cfg.capMax != null && p.value > cfg.capMax) {
                        this.drawCapMarker(g, pos + pyShift, barW, mainScale, orientation, cfg);
                    }
                }
                if (cfg.showLabels && showValueAt(i)) {
                    // anchor the label beyond the PL outline when the plan column is taller
                    const anchor = capV(!lineMode && p.pl != null
                        ? (p.value >= 0 ? Math.max(p.value, p.pl) : Math.min(p.value, p.pl))
                        : p.value);
                    this.drawEndLabelAt(g, cx, anchor, p.value >= 0, mainScale,
                        orientation, valueTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                    // compact mode: variance becomes a colored second label at the bar end
                    if (compact && p.varAbs != null) {
                        const good = cfg.invert ? p.varAbs < 0 : p.varAbs > 0;
                        const vColor = p.varAbs === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                        const vText = p.varRel != null ? relTexts[i] : absTexts[i];
                        const gap = orientation === "columns"
                            ? cfg.labelFont + 2
                            : valueTexts[i].length * cfg.labelFont * 0.56 + 8;
                        this.drawEndLabelAt(g, cx, anchor, p.value >= 0, mainScale,
                            orientation, vText, cfg.labelFont, vColor, gap, cfg.paper);
                    }
                }
            }

            // waterfall-bridge brick: cascades from the running basis level to this
            // category's own contribution — on the bridge's own n+2 grid (index i+1,
            // slot 0 and n+1 are the basis/value anchor bars)
            if (panels.bridge && bridgeScale && cascade) {
                const bFrom = cascade.from[i], bTo = cascade.to[i];
                if (bFrom != null && bTo != null) {
                    const bPos = bridgeSlotPos(i + 1);
                    const bCx = bPos + bridgeSlotW / 2;
                    const good = cfg.invert ? (bTo < bFrom) : (bTo > bFrom);
                    const brickColor = bTo === bFrom ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                    const hollowBad = cfg.hc && !good && bTo !== bFrom;
                    this.drawBar(g, bPos, bridgeSlotW, bFrom, bTo, bridgeScale, orientation,
                        hollowBad
                            ? { fill: cfg.paper, stroke: brickColor, "stroke-width": 1.4 }
                            : p.isFc
                                ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: brickColor, "stroke-width": 1 }
                                : { fill: brickColor });
                    if (cfg.showLabels && showValueAt(i)) {
                        this.drawEndLabelAt(g, bCx, bTo, bTo >= bFrom, bridgeScale,
                            orientation, absTexts[i] || valueTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                    }
                }
            }

            // absolute variance bars
            if (panels.abs && absScale && p.varAbs != null) {
                const good = cfg.invert ? p.varAbs < 0 : p.varAbs > 0;
                const color = p.varAbs === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = barW; // IBCS: same width as the base bars
                const vx = cx - vw / 2;
                const hollowBad = cfg.hc && !good && p.varAbs !== 0;
                this.drawBar(g, vx, vw, 0, p.varAbs, absScale, orientation,
                    hollowBad
                        ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                            : { fill: color });
                if (cfg.showLabels && showAbsAt(i)) {
                    this.drawEndLabel(g, vx + vw / 2, p.varAbs, absScale, orientation,
                        absTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }

            // relative variance pins
            if (panels.rel && relScale && p.varRel != null) {
                const good = cfg.invert ? p.varRel < 0 : p.varRel > 0;
                const color = p.varRel === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const c = cx;
                const zero = relScale(0);
                const end = relScale(p.varRel);
                const r = Math.max(2.5, Math.min(4.5, slotW * 0.12));
                const hollowPin = p.isFc || (cfg.hc && !good && p.varRel !== 0);
                if (orientation === "columns") {
                    this.el("line", { x1: c, y1: zero, x2: c, y2: end, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: c, cy: end, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                } else {
                    this.el("line", { x1: zero, y1: c, x2: end, y2: c, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: end, cy: c, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                }
                if (cfg.showLabels && showRelAt(i)) {
                    this.drawEndLabel(g, c, p.varRel, relScale, orientation,
                        relTexts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            }

            // second-basis variance: bars + pins (dual variance)
            if (panels.abs2 && abs2Scale && p.var2Abs != null) {
                const good = cfg.invert ? p.var2Abs < 0 : p.var2Abs > 0;
                const color = p.var2Abs === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = barW; // IBCS: same width as the base bars
                const vx = cx - vw / 2;
                const hollowBad = cfg.hc && !good && p.var2Abs !== 0;
                this.drawBar(g, vx, vw, 0, p.var2Abs, abs2Scale, orientation,
                    hollowBad
                        ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                            : { fill: color });
                if (cfg.showLabels && showAbs2At(i)) {
                    this.drawEndLabel(g, cx, p.var2Abs, abs2Scale, orientation,
                        abs2Texts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }
            if (panels.rel2 && rel2Scale && p.var2Rel != null) {
                const good = cfg.invert ? p.var2Rel < 0 : p.var2Rel > 0;
                const color = p.var2Rel === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const zero = rel2Scale(0);
                const end = rel2Scale(p.var2Rel);
                const r = Math.max(2.5, Math.min(4.5, slotW * 0.12));
                const hollowPin = p.isFc || (cfg.hc && !good && p.var2Rel !== 0);
                if (orientation === "columns") {
                    this.el("line", { x1: cx, y1: zero, x2: cx, y2: end, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx, cy: end, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                } else {
                    this.el("line", { x1: zero, y1: cx, x2: end, y2: cx, stroke: color, "stroke-width": 1.6 }, g);
                    this.el("circle", { cx: end, cy: cx, r, fill: hollowPin ? cfg.paper : color, stroke: color, "stroke-width": 1.6 }, g);
                }
                if (cfg.showLabels && showRel2At(i)) {
                    this.drawEndLabel(g, cx, p.var2Rel, rel2Scale, orientation,
                        rel2Texts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            }

            // category label (highlighted categories always get one, in bold)
            const isHl = cfg.highlight.has(p.cat.toLowerCase());
            if (showCatAt(i) || isHl) {
                this.drawCategoryLabel(g, p.cat, pos + slotW / 2, orientation, cfg.catFont,
                    region, step, panels.main, cfg.ink, isHl);
            }

            // comment marker (numbered circle at the inner end of the bar)
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, cx, p, mainScale, orientation, cfg);
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
        }

        // ------- waterfall-bridge connectors: link the basis anchor to the first brick,
        // each brick's end to the next one's start, and the last brick to the value anchor
        if (panels.bridge && bridgeScale && cascade) {
            const connector = (level: number, edgeEnd: number, edgeStart: number) => {
                if (orientation === "columns") {
                    this.el("line", {
                        x1: edgeEnd, y1: level, x2: edgeStart, y2: level,
                        stroke: cfg.subtle, "stroke-width": 1
                    }, bg);
                } else {
                    this.el("line", {
                        x1: level, y1: edgeEnd, x2: level, y2: edgeStart,
                        stroke: cfg.subtle, "stroke-width": 1
                    }, bg);
                }
            };
            if (cascade.from[0] != null) {
                connector(bridgeScale(cascade.basisSum), bridgeSlotPos(0) + bridgeSlotW, bridgeSlotPos(1));
            }
            for (let i = 0; i < n - 1; i++) {
                const a = cascade.to[i], b = cascade.from[i + 1];
                if (a == null || b == null) { continue; }
                connector(bridgeScale(a), bridgeSlotPos(i + 1) + bridgeSlotW, bridgeSlotPos(i + 2));
            }
            const lastTo = [...cascade.to].reverse().find(v => v != null);
            if (lastTo != null) {
                connector(bridgeScale(lastTo), bridgeSlotPos(n) + bridgeSlotW, bridgeSlotPos(n + 1));
            }
            // ------- reconciliation callout: the net bridge total as a circled badge
            // (IBCS "Überleitung" made explicit, e.g. "-343" / "+82" in the reference chart)
            const totalVar = cascade.valueSum - cascade.basisSum;
            this.drawBridgeCallout(panels.bridge, orientation, cfg, totalVar);
        }

        // ------- reference line on top of the marks (thin, dashed)
        if (cfg.refLine != null) {
            const overlay = this.el("g", {}, this.svg);
            this.drawRefLine(overlay, panels.main, mainScale, orientation, bandStart, bandEnd, cfg);
        }

        // ------- compare-on-click overlay: Δ between two picked categories
        if (this.compareActive && this.compareCats.length > 0) {
            this.drawCompareOverlay(cfg, orientation);
        }
    }

    /**
     * compare-on-click: with one pick, a dashed ring marks the pending selection;
     * with two, a bracket connects both bar ends and shows the difference
     * (second minus first) as absolute + % — like a hand-drawn Δ annotation.
     */
    private drawCompareOverlay(cfg: ChartConfig, orientation: Orientation): void {
        const k = this.fontK;
        const picked = this.compareCats
            .map(c => ({ cat: c, a: this.compareAnchors.get(c) }))
            .filter(x => x.a != null) as { cat: string; a: { band: number; end: number; value: number } }[];
        if (picked.length === 0) { return; }
        const overlay = this.el("g", {}, this.svg);
        if (picked.length === 1) {
            const { a } = picked[0];
            const cx = orientation === "columns" ? a.band : a.end;
            const cy = orientation === "columns" ? a.end : a.band;
            this.el("circle", {
                cx, cy, r: 5.5 * k, fill: "none", stroke: cfg.ink,
                "stroke-width": 1.6, "stroke-dasharray": "3,2"
            }, overlay);
            return;
        }
        const [p1, p2] = picked;
        const d = p2.a.value - p1.a.value;
        const pct = p1.a.value !== 0 ? (d / Math.abs(p1.a.value)) * 100 : null;
        const text = `Δ ${this.fmtSigned(cfg.fmtVar, d)}${pct != null ? ` (${this.fmtPercent(pct)})` : ""}`;
        const font = Math.round(Math.max(10, cfg.labelFont));
        const stroke = { stroke: cfg.ink, "stroke-width": 1.4, fill: "none" } as const;
        if (orientation === "columns") {
            const yLine = Math.min(p1.a.end, p2.a.end) - 14 * k;
            this.el("path", {
                d: `M${p1.a.band},${p1.a.end}L${p1.a.band},${yLine}L${p2.a.band},${yLine}L${p2.a.band},${p2.a.end}`,
                ...stroke, "stroke-dasharray": "4,3"
            }, overlay);
            const t = this.el("text", {
                x: (p1.a.band + p2.a.band) / 2, y: yLine - 5, "text-anchor": "middle",
                "font-size": font, "font-weight": 600, fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, overlay);
            t.textContent = text;
        } else {
            const xLine = Math.max(p1.a.end, p2.a.end) + 14 * k;
            this.el("path", {
                d: `M${p1.a.end},${p1.a.band}L${xLine},${p1.a.band}L${xLine},${p2.a.band}L${p2.a.end},${p2.a.band}`,
                ...stroke, "stroke-dasharray": "4,3"
            }, overlay);
            const t = this.el("text", {
                x: xLine + 5, y: (p1.a.band + p2.a.band) / 2 + font * 0.35,
                "font-size": font, "font-weight": 600, fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, overlay);
            t.textContent = text;
        }
    }

    /**
     * reconciliation callout for the waterfall-bridge panel: the net total variance
     * (valueSum - basisSum) as a circled badge — the "Überleitung" made explicit,
     * matching the reference chart's circled "-343" / "+82" summary boxes.
     */
    private drawBridgeCallout(rect: Rect, orientation: Orientation, cfg: ChartConfig, totalVar: number): void {
        const text = this.fmtSigned(cfg.fmtVar, totalVar);
        const w = Math.max(44, text.length * 6.5 + 16), h = 20;
        const cx = rect.x + rect.w - w / 2 - 4;
        const cy = orientation === "columns" ? rect.y + rect.h - h / 2 - 2 : rect.y + rect.h / 2;
        const good = cfg.invert ? totalVar < 0 : totalVar > 0;
        const color = totalVar === 0 ? cfg.subtle : (good ? cfg.colors.good : cfg.colors.bad);
        const g = this.el("g", {}, this.svg);
        this.el("rect", {
            x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: h / 2,
            fill: cfg.paper, stroke: color, "stroke-width": 1.6
        }, g);
        const t = this.el("text", {
            x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 11,
            "font-weight": 600, fill: color, "font-family": FONT
        }, g);
        t.textContent = text;
    }

    /**
     * clickable sort toggle for the waterfall-bridge style. Persists the choice to the
     * 'chart.sortByImpact' format-pane property via the host, so it survives re-renders,
     * bookmarks and report reloads instead of living only in transient component state.
     */
    private drawSortButton(width: number, cfg: ChartConfig): void {
        const cx = width - 14, cy = 14;
        const btn = this.el("g", {
            "class": "icd-sortbtn", tabindex: "0", role: "button"
        }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", cfg.sortByImpact
            ? "Sortierung nach Wirkung aufheben" : "Nach Wirkung sortieren (größter Treiber zuerst)");
        this.el("circle", {
            cx, cy, r: 9, fill: cfg.sortByImpact ? cfg.colors.ac : cfg.paper,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const icon = this.el("text", {
            x: cx, y: cy + 4, "text-anchor": "middle", "font-size": 12,
            fill: cfg.sortByImpact ? cfg.paper : cfg.ink, "font-family": FONT
        }, btn);
        icon.textContent = "⇅";
        btn.style.cursor = "pointer";
        const toggle = () => {
            this.host.persistProperties({
                merge: [{
                    objectName: "chart",
                    selector: null,
                    properties: { sortByImpact: !cfg.sortByImpact }
                }]
            });
        };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); toggle(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); toggle();
        });
    }

    /**
     * in-chart button row for the integrated/category bridge modes (top-right):
     * ΔPY|ΔPL segmented reference switch (persists chart.comparisonMode so the end
     * user can flip the variance basis in the report), ⇅ sort toggle and ▶ build
     * animation — mirroring the reference charts' interactive toolbar.
     */
    private drawChartButtons(width: number, cfg: ChartConfig,
        opts: { showRef: boolean; showSort: boolean; showPlay: boolean }): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        let xRight = width - 6;
        const persist = (properties: Record<string, unknown>) => {
            this.host.persistProperties({ merge: [{ objectName: "chart", selector: null, properties }] });
        };
        const roundBtn = (icon: string, active: boolean, label: string, onClick: () => void) => {
            const r = bh / 2;
            const cx = xRight - r, cy = 6 + r;
            xRight -= bh + 6;
            const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
            btn.setAttribute("aria-label", label);
            this.el("circle", {
                cx, cy, r, fill: active ? cfg.colors.ac : cfg.paper,
                stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
            }, btn);
            const t = this.el("text", {
                x: cx, y: cy + font * 0.36, "text-anchor": "middle", "font-size": font,
                fill: active ? cfg.paper : cfg.ink, "font-family": FONT
            }, btn);
            t.textContent = icon;
            btn.style.cursor = "pointer";
            btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); onClick(); });
            btn.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault(); e.stopPropagation(); onClick();
            });
        };
        if (opts.showPlay) {
            roundBtn("▶", false, "Aufbau-Animation abspielen", () => this.playBuild());
        }
        if (opts.showSort) {
            roundBtn("⇅", cfg.sortByImpact, cfg.sortByImpact
                ? "Sortierung nach Wirkung aufheben" : "Nach Wirkung sortieren",
                () => persist({ sortByImpact: !cfg.sortByImpact }));
        }
        if (opts.showRef) {
            // segmented ΔPY | ΔPL — active side filled dark, like the reference toolbar
            const segW = Math.round(34 * k);
            const x0 = xRight - segW * 2;
            const seg = (x: number, text: string, active: boolean, label: string, onClick: () => void) => {
                const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
                btn.setAttribute("aria-label", label);
                this.el("rect", {
                    x, y: 6, width: segW, height: bh,
                    fill: active ? cfg.colors.ac : cfg.paper,
                    stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
                }, btn);
                const t = this.el("text", {
                    x: x + segW / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
                    "font-size": font, fill: active ? cfg.paper : cfg.ink, "font-family": FONT
                }, btn);
                t.textContent = text;
                btn.style.cursor = "pointer";
                btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); onClick(); });
                btn.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key !== "Enter" && e.key !== " ") { return; }
                    e.preventDefault(); e.stopPropagation(); onClick();
                });
            };
            seg(x0, "ΔPY", cfg.basisMode === "py", "Abweichungsbasis: Vorjahr (PY)",
                () => persist({ comparisonMode: "py" }));
            seg(x0 + segW, "ΔPL", cfg.basisMode === "plan", "Abweichungsbasis: Plan (PL)",
                () => persist({ comparisonMode: "plan" }));
            xRight = x0 - 6;
        }
    }

    /** ▶ build animation: reveals the per-category mark groups one after another */
    private playBuild(): void {
        for (const t of this.animTimers) { clearTimeout(t); }
        this.animTimers = [];
        const seq = this.animGroups;
        if (seq.length === 0) { return; }
        for (const gs of seq) { for (const g of gs) { g.style.opacity = "0"; } }
        seq.forEach((gs, i) => {
            this.animTimers.push(window.setTimeout(() => {
                for (const g of gs) {
                    g.style.transition = "opacity 0.18s";
                    g.style.opacity = "1";
                }
            }, 80 + i * 140));
        });
    }

    private drawTitleBlock(width: number, points: DataPoint[], cfg: ChartConfig,
        maxAbs: number, orientation: Orientation): number {
        const s = this.formattingSettings.ibcsTitleCard;
        const kpi = (s.kpi.value || this.measureName || "").trim();
        // derive the unit suffix (e.g. "M€") from a formatted sample value
        const unit = cfg.fmt.format(maxAbs).replace(/[0-9.,\s +\-−]/g, "");
        let period = (s.period.value || "").trim();
        if (!period && orientation === "columns" && points.length > 1) {
            period = `${points[0].cat} – ${points[points.length - 1].cat}`;
        }
        const valueScen = ["AC", cfg.hasFc ? "FC" : ""].filter(x => x).join(", ");
        const refScen = [
            cfg.basisMode === "plan" ? "PL" : "PY",
            cfg.basisMode === "plan" && cfg.hasPy ? "PY" : "",
            cfg.basisMode === "py" && cfg.hasPl ? "PL" : ""
        ].filter(x => x).join(", ");
        const hasRef = cfg.hasPy || cfg.hasPl;

        const k = this.fontK;
        const f1 = Math.round(12 * k), f2 = Math.round(11 * k);
        const t = this.el("text", {
            x: 6, y: f1 + 2, "font-size": f1, "font-family": FONT, fill: cfg.ink
        }, this.svg);
        const span = (text: string, bold: boolean) => {
            const ts = document.createElementNS(SVG_NS, "tspan");
            if (bold) { ts.setAttribute("font-weight", "600"); }
            ts.textContent = text;
            t.appendChild(ts);
        };
        if (kpi) { span(kpi, true); }
        if (unit) { span(` in ${unit}`, false); }
        span(`${kpi || unit ? " · " : ""}${period ? period + ": " : ""}${valueScen}${hasRef ? " vs. " + refScen : ""}`, false);

        let message = (s.message.value || "").trim();
        if (!message && s.autoMessage.value) {
            message = this.buildAutoMessage(points, cfg);
        }
        if (message) {
            const m = this.el("text", {
                x: 6, y: f1 + f2 + 7, "font-size": f2, "font-family": FONT,
                fill: cfg.ink, "font-style": "italic"
            }, this.svg);
            m.textContent = this.truncate(message, width - 12, f2);
            return f1 + f2 + 15;
        }
        return f1 + 10;
    }

    /**
     * IBCS SAY, automated: overall variance plus the strongest and weakest
     * driver — e.g. "ΔPL +171K€ (+1,4%) · stärkster Treiber: Jul (+55K€) · schwächster: Feb (−39K€)"
     */
    private buildAutoMessage(points: DataPoint[], cfg: ChartConfig): string {
        const withVar = points.filter(p => p.varAbs != null);
        if (withVar.length === 0) { return ""; }
        let sumVar = 0, sumBasis = 0;
        if (cfg.cumulative) {
            const last = withVar[withVar.length - 1];
            sumVar = last.varAbs as number;
            sumBasis = Math.abs(last.basis as number);
        } else {
            for (const p of withVar) {
                sumVar += p.varAbs as number;
                sumBasis += Math.abs(p.basis as number);
            }
        }
        const sorted = [...withVar].sort((a, b) => (b.varAbs as number) - (a.varAbs as number));
        const best = cfg.invert ? sorted[sorted.length - 1] : sorted[0];
        const worst = cfg.invert ? sorted[0] : sorted[sorted.length - 1];
        const parts = [
            `Δ${cfg.basisLabel} ${this.fmtSigned(cfg.fmtVar, sumVar)}`
            + (sumBasis !== 0 ? ` (${this.fmtPercent((sumVar / sumBasis) * 100)})` : "")
        ];
        if (withVar.length >= 3 && best !== worst && !cfg.cumulative) {
            parts.push(`stärkster Treiber: ${best.cat} (${this.fmtSigned(cfg.fmtVar, best.varAbs as number)})`);
            parts.push(`schwächster: ${worst.cat} (${this.fmtSigned(cfg.fmtVar, worst.varAbs as number)})`);
        }
        return parts.join(" · ");
    }

    /** running YTD totals for value/PY/PL with variances recomputed on the cumulated numbers */
    /** waterfall-bridge: orders by |variance| descending; a top-N "Rest" row stays pinned last */
    private sortByImpact(pts: DataPoint[]): DataPoint[] {
        const rest = pts.filter(p => p.isRest);
        const main = pts.filter(p => !p.isRest)
            .map((p, i) => ({ p, i }))
            .sort((a, b) => (Math.abs(b.p.varAbs ?? 0) - Math.abs(a.p.varAbs ?? 0)) || (a.i - b.i))
            .map(x => x.p);
        return [...main, ...rest];
    }

    /**
     * waterfall-bridge cascade: running "from"/"to" per point, starting at the sum of all
     * basis values and stepping by each point's own variance — mirrors buildWaterfall's
     * comparison-basis mode but stays in the caller's chosen orientation (columns/bars).
     */
    private buildCascade(pts: DataPoint[]): Cascade {
        const basisSum = pts.reduce((a, p) => a + (p.basis ?? 0), 0);
        let cum = basisSum, acSum = 0, fcSum = 0;
        const from: (number | null)[] = [], to: (number | null)[] = [];
        for (const p of pts) {
            if (p.varAbs == null) { from.push(null); to.push(null); continue; }
            from.push(cum);
            cum += p.varAbs;
            to.push(cum);
            if (p.isFc) { fcSum += p.value ?? 0; } else { acSum += p.value ?? 0; }
        }
        return { from, to, basisSum, valueSum: cum, acSum, fcSum };
    }

    private cumulate(pts: DataPoint[], basisMode: Basis): DataPoint[] {
        let cv = 0, cpy = 0, cpl = 0, cbm = 0;
        return pts.map(p => {
            if (p.value != null) { cv += p.value; }
            if (p.py != null) { cpy += p.py; }
            if (p.pl != null) { cpl += p.pl; }
            if (p.bm != null) { cbm += p.bm; }
            const value = p.value != null ? cv : null;
            const py = p.py != null ? cpy : null;
            const pl = p.pl != null ? cpl : null;
            const basis = basisMode === "plan" ? pl : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            const basis2 = basisMode === "plan" ? py : pl;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
                ? (var2Abs / Math.abs(basis2)) * 100 : null;
            return {
                ...p,
                ac: p.isFc ? null : value,
                fc: p.isFc ? value : null,
                value, py, pl, basis, varAbs, varRel, var2Abs, var2Rel,
                bm: p.bm != null ? cbm : null
            };
        });
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
        const basis2Sum = sum(tail.map(p => (p.var2Abs != null && p.value != null) ? p.value - p.var2Abs : null));
        const var2Abs = (value != null && basis2Sum != null) ? value - basis2Sum : null;
        const var2Rel = (var2Abs != null && basis2Sum != null && basis2Sum !== 0)
            ? (var2Abs / Math.abs(basis2Sum)) * 100 : null;
        const rest: DataPoint = {
            cat: `Rest (${tail.length})`,
            ac, py, pl, fc, value,
            isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            bm: sum(tail.map(p => p.bm)),
            comment: null, commentNo: null,
            group: head.length > 0 ? head[0].group : null,
            rowType: null,
            isRest: true,
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
            cx, cy, r, fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.2
        }, parent);
        const t = this.el("text", {
            x: cx, y: cy + 3, "text-anchor": "middle",
            "font-size": 9, fill: cfg.ink, "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = String(p.commentNo);
    }

    /** numbered footnote list; stays visible in PDF/PPT exports where tooltips are lost */
    private drawCommentPanel(region: Rect, pts: DataPoint[], cfg: ChartConfig): void {
        const font = 10;
        const lineH = font + 4;
        const textX = region.x + 26;
        const maxChars = Math.max(8, Math.floor((region.w - 34) / (font * 0.52)));
        // subtle divider between chart and comments
        this.el("line", {
            x1: region.x + 4, y1: region.y + 6, x2: region.x + 4, y2: region.y + region.h - 6,
            stroke: cfg.hc ? cfg.ink : "#E0E0E0", "stroke-width": 1
        }, this.svg);

        let y = region.y + 16;
        for (const p of pts) {
            const lines = this.wrapText(`${p.cat} — ${p.comment}`, maxChars);
            const needed = lines.length * lineH + 8;
            if (y + needed > region.y + region.h) {
                const more = this.el("text", {
                    x: textX, y, "font-size": font, fill: cfg.subtle, "font-family": FONT
                }, this.svg);
                more.textContent = "…";
                break;
            }
            const no = this.el("text", {
                x: region.x + 12, y: y + 1, "font-size": font + 2, fill: cfg.ink,
                "font-family": FONT
            }, this.svg);
            no.textContent = this.circledNo(p.commentNo as number);
            for (let li = 0; li < lines.length; li++) {
                const t = this.el("text", {
                    x: textX, y: y + li * lineH, "font-size": font,
                    fill: cfg.ink, "font-family": FONT,
                    "font-weight": li === 0 ? 600 : 400
                }, this.svg);
                t.textContent = lines[li];
            }
            y += needed;
        }
    }

    /** greedy word wrap by estimated character budget per line */
    private wrapText(text: string, maxChars: number): string[] {
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let cur = "";
        for (const w of words) {
            if (cur && (cur.length + 1 + w.length) > maxChars) {
                lines.push(cur);
                cur = w;
            } else {
                cur = cur ? cur + " " + w : w;
            }
        }
        if (cur) { lines.push(cur); }
        return lines;
    }

    /** circled digit for tooltips: ①…⑳, then (n) */
    private circledNo(no: number): string {
        return no >= 1 && no <= 20 ? String.fromCodePoint(0x2460 + no - 1) : `(${no})`;
    }

    /** Σ header: total value plus overall variance vs. the comparison basis */
    private drawTotalHeader(parent: SVGElement, region: Rect, points: DataPoint[], cfg: ChartConfig): void {
        let sum = 0, sumVar = 0, sumBasis = 0, any = false, anyVar = false;
        for (const p of points) {
            if (p.value != null) { any = true; }
            if (p.varAbs != null && p.basis != null) { anyVar = true; }
            if (cfg.cumulative) {
                // cumulated points already carry running totals — take the last ones
                if (p.value != null) { sum = p.value; }
                if (p.varAbs != null && p.basis != null) { sumVar = p.varAbs; sumBasis = Math.abs(p.basis); }
            } else {
                if (p.value != null) { sum += p.value; }
                if (p.varAbs != null && p.basis != null) {
                    sumVar += p.varAbs;
                    sumBasis += Math.abs(p.basis);
                }
            }
        }
        if (!any) { return; }

        const hFont = Math.round(11 * this.fontK);
        const t = this.el("text", {
            x: region.x + region.w - 6, y: region.y + hFont + 1, "text-anchor": "end",
            "font-size": hFont, "font-family": FONT
        }, parent);
        const span = (text: string, fill: string, bold: boolean) => {
            const ts = document.createElementNS(SVG_NS, "tspan");
            ts.setAttribute("fill", fill);
            if (bold) { ts.setAttribute("font-weight", "600"); }
            ts.textContent = text;
            t.appendChild(ts);
        };
        span(`Σ ${cfg.fmt.format(sum)}`, cfg.ink, true);
        if (anyVar) {
            const good = cfg.invert ? sumVar < 0 : sumVar > 0;
            const color = sumVar === 0 ? cfg.subtle : (good ? cfg.colors.good : cfg.colors.bad);
            span(`   Δ${cfg.basisLabel} `, cfg.subtle, false);
            span(this.fmtSigned(cfg.fmtVar, sumVar), color, true);
            if (sumBasis !== 0) {
                span(` · ${this.fmtPercent((sumVar / sumBasis) * 100)}`, color, true);
            }
        }
    }

    /** thin overlay line with the trailing N-period average of the base values */
    private drawMovingAverage(parent: SVGElement, points: DataPoint[],
        cxOf: (i: number) => number, scale: Scale, cfg: ChartConfig): void {
        const win = cfg.movingAvg;
        let d = "";
        let lastX = 0, lastY = 0, any = false;
        for (let i = win - 1; i < points.length; i++) {
            const slice = points.slice(i - win + 1, i + 1).map(p => p.value);
            if (slice.some(v => v == null)) { continue; }
            const avg = (slice as number[]).reduce((a, b) => a + b, 0) / win;
            const x = cxOf(i), y = scale(avg);
            d += d && any ? `L${x},${y}` : `M${x},${y}`;
            lastX = x; lastY = y; any = true;
        }
        if (!any) { return; }
        this.el("path", {
            d, fill: "none", stroke: cfg.subtle, "stroke-width": 1.5, "stroke-opacity": 0.9
        }, parent);
        const t = this.el("text", {
            x: lastX + 2, y: lastY + 12, "font-size": 9, fill: cfg.subtle, "font-family": FONT,
            stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
        }, parent);
        t.textContent = `Ø${win}`;
    }

    /** IBCS line notation: AC solid (FC segments dashed), PY thin grey, PL thin dashed */
    private drawLinePaths(parent: SVGElement, points: DataPoint[],
        cxOf: (i: number) => number, scale: Scale, cfg: ChartConfig): void {
        const cap = (v: number) => cfg.capMax != null ? Math.min(v, cfg.capMax) : v;
        const path = (acc: (p: DataPoint) => number | null,
            style: Record<string, string | number>, splitFc: boolean) => {
            let dSolid = "", dDash = "";
            let prev: { x: number; y: number; fc: boolean } | null = null;
            for (let i = 0; i < points.length; i++) {
                const v = acc(points[i]);
                if (v == null) { prev = null; continue; }
                const pt = { x: cxOf(i), y: scale(cap(v)), fc: points[i].isFc };
                if (prev) {
                    const seg = `M${prev.x},${prev.y}L${pt.x},${pt.y}`;
                    if (splitFc && (prev.fc || pt.fc)) { dDash += seg; } else { dSolid += seg; }
                }
                prev = pt;
            }
            if (dSolid) { this.el("path", { d: dSolid, fill: "none", ...style }, parent); }
            if (dDash) {
                this.el("path", { d: dDash, fill: "none", ...style, "stroke-dasharray": "5,4" }, parent);
            }
        };
        if (cfg.hasPy) { path(p => p.py, { stroke: cfg.colors.py, "stroke-width": 1.4 }, false); }
        if (cfg.hasPl) { path(p => p.pl, { stroke: cfg.colors.pl, "stroke-width": 1.2, "stroke-dasharray": "5,3" }, false); }
        path(p => p.value, { stroke: cfg.colors.ac, "stroke-width": 2 }, true);
    }

    private parseRefLine(): number | null {
        const raw = String(this.formattingSettings.scaleCard.refLine.value || "")
            .trim().replace(/\s/g, "").replace(",", ".");
        if (!raw) { return null; }
        // accept k/M/B (and German Mio/Mrd initials) as magnitude suffixes
        const m = /^(-?\d*\.?\d+)([kKmMbB]?)$/.exec(raw);
        if (!m) { return null; }
        const mult = { k: 1e3, m: 1e6, b: 1e9 }[m[2].toLowerCase()] ?? 1;
        const v = parseFloat(m[1]) * mult;
        return isFinite(v) ? v : null;
    }

    /** dashed target/threshold line with label at the far end of the base chart */
    private drawRefLine(parent: SVGElement, rect: Rect, scale: Scale, orientation: Orientation,
        bandStart: number, bandEnd: number, cfg: ChartConfig): void {
        const v = cfg.refLine as number;
        const pos = scale(v);
        const label = cfg.refLineLabel || cfg.fmt.format(v);
        if (orientation === "columns") {
            this.el("line", {
                x1: bandStart, y1: pos, x2: bandEnd, y2: pos,
                stroke: cfg.ink, "stroke-width": 1.1, "stroke-dasharray": "7,3"
            }, parent);
            const t = this.el("text", {
                x: bandStart + 2, y: pos - 4, "text-anchor": "start", "font-size": 9,
                fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = label;
        } else {
            this.el("line", {
                x1: pos, y1: bandStart, x2: pos, y2: bandEnd,
                stroke: cfg.ink, "stroke-width": 1.1, "stroke-dasharray": "7,3"
            }, parent);
            const t = this.el("text", {
                x: pos + 3, y: bandStart + 8, "text-anchor": "start", "font-size": 9,
                fill: cfg.ink, "font-family": FONT,
                stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
            }, parent);
            t.textContent = label;
        }
    }

    /** IBCS outlier notation: double break stroke near the capped bar end */
    private drawCapMarker(parent: SVGElement, bp: number, bw: number, scale: Scale,
        orientation: Orientation, cfg: ChartConfig): void {
        const end = scale(cfg.capMax as number);
        const stroke = (offset: number, color: string, w: number) => {
            if (orientation === "columns") {
                this.el("line", {
                    x1: bp - bw * 0.15, y1: end + 10 + offset + 2,
                    x2: bp + bw * 1.15, y2: end + 10 + offset - 2,
                    stroke: color, "stroke-width": w
                }, parent);
            } else {
                this.el("line", {
                    x1: end - 10 - offset - 2, y1: bp - bw * 0.15,
                    x2: end - 10 - offset + 2, y2: bp + bw * 1.15,
                    stroke: color, "stroke-width": w
                }, parent);
            }
        };
        // paper gap first, then the two ink strokes
        stroke(2, cfg.paper, 7);
        stroke(0, cfg.ink, 1.4);
        stroke(4, cfg.ink, 1.4);
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
        vertical: boolean, region: Rect, showDual = false, showBridge = false)
        : { main: Rect; abs?: Rect; rel?: Rect; abs2?: Rect; rel2?: Rect; bridge?: Rect } {
        const gap = 10;
        type Key = "main" | "abs" | "rel" | "abs2" | "rel2" | "bridge";
        // vertical (columns): variance panels stacked above the base chart, bridge just
        // above it (closest to main, since it explains the same base values)
        const parts: { key: Key; share: number }[] = [];
        if (vertical) {
            if (showRel) { parts.push({ key: "rel", share: 0.34 }); }
            if (showAbs) { parts.push({ key: "abs", share: 0.38 }); }
            if (showDual && showRel) { parts.push({ key: "rel2", share: 0.30 }); }
            if (showDual && showAbs) { parts.push({ key: "abs2", share: 0.34 }); }
            if (showBridge) { parts.push({ key: "bridge", share: 0.34 }); }
            parts.push({ key: "main", share: 1 });
        } else {
            parts.push({ key: "main", share: 1 });
            if (showBridge) { parts.push({ key: "bridge", share: 0.30 }); }
            if (showAbs) { parts.push({ key: "abs", share: 0.32 }); }
            if (showRel) { parts.push({ key: "rel", share: 0.26 }); }
            if (showDual && showAbs) { parts.push({ key: "abs2", share: 0.28 }); }
            if (showDual && showRel) { parts.push({ key: "rel2", share: 0.24 }); }
        }
        const totalShare = parts.reduce((a, b) => a + b.share, 0);
        const usable = span - gap * (parts.length - 1);
        const out: Partial<Record<Key, Rect>> = {};
        let cursor = start;
        for (const part of parts) {
            const size = usable * (part.share / totalShare);
            out[part.key] = vertical
                ? { x: region.x, y: cursor, w: region.w, h: size }
                : { x: cursor, y: region.y, w: size, h: region.h };
            cursor += size + gap;
        }
        return out as { main: Rect; abs?: Rect; rel?: Rect; abs2?: Rect; rel2?: Rect; bridge?: Rect };
    }

    private makePanelScale(domain: [number, number], rect: Rect, orientation: Orientation,
        labelPad: number, bothEnds = false): Scale {
        let [mn, mx] = domain;
        if (mn === 0 && mx === 0) { mx = 1; }
        const span = mx - mn;
        const padFrac = 0.02;
        const mnp = (bothEnds || mn < 0) ? mn - span * padFrac : mn;
        const mxp = (bothEnds || mx > 0) ? mx + span * padFrac : mx;
        if (orientation === "columns") {
            const top = rect.y + ((bothEnds || mx > 0) ? labelPad + 12 : 12);
            const bottom = rect.y + rect.h - ((bothEnds || mn < 0) ? labelPad : 2);
            return linearScale(mnp, mxp, bottom, top);
        } else {
            const left = rect.x + ((bothEnds || mn < 0) ? labelPad + 4 : 4);
            const right = rect.x + rect.w - ((bothEnds || mx > 0) ? labelPad + 24 : 4);
            return linearScale(mnp, mxp, left, right);
        }
    }

    /** IBCS baseline notation: AC solid black, PY fat grey, PL double line */
    private drawBaseline(parent: SVGElement, rect: Rect, scale: Scale, orientation: Orientation,
        bandStart: number, bandEnd: number, kind: "ac" | Basis,
        colors: { ac: string; py: string; pl: string }, dashed = false): void {
        const zero = scale(0);
        const line = (offset: number, stroke: string, w: number) => {
            const dash = dashed ? { "stroke-dasharray": "4,3" } : {};
            if (orientation === "columns") {
                this.el("line", { x1: bandStart, y1: zero + offset, x2: bandEnd, y2: zero + offset, stroke, "stroke-width": w, ...dash }, parent);
            } else {
                this.el("line", { x1: zero + offset, y1: bandStart, x2: zero + offset, y2: bandEnd, stroke, "stroke-width": w, ...dash }, parent);
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
        titleH: number, region: Rect, barsTitleY?: number, color = "#8A8A8A"): void {
        const font = Math.round(10 * this.fontK);
        const attrs = orientation === "columns"
            ? { x: region.x + 6, y: rect.y + titleH - 4 }
            : { x: rect.x + 2, y: barsTitleY ?? (region.y + font + 2) };
        // "bars" titles sit above their own (possibly narrow) panel and must not bleed into
        // the next one; "columns" titles have the full region width above the stacked panels
        const maxW = orientation === "columns" ? region.w - 12 : rect.w - 6;
        const t = this.el("text", {
            ...attrs, "font-size": font, fill: color,
            "font-family": FONT, "font-weight": 600
        }, parent);
        t.textContent = this.truncate(text, maxW, font);
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
        orientation: Orientation, text: string, fontSize: number, fill: string, extraGap = 0, halo = "#FFFFFF"): void {
        this.drawEndLabelAt(parent, bandCenter, v, v >= 0, scale, orientation, text, fontSize, fill, extraGap, halo);
    }

    private drawEndLabelAt(parent: SVGElement, bandCenter: number, anchorValue: number, positive: boolean,
        scale: Scale, orientation: Orientation, text: string, fontSize: number, fill: string, extraGap = 0, halo = "#FFFFFF"): void {
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
            stroke: halo, "stroke-width": 3, "paint-order": "stroke",
            "stroke-linejoin": "round"
        }, parent);
        t.textContent = text;
    }

    private drawCategoryLabel(parent: SVGElement, text: string, bandCenter: number,
        orientation: Orientation, fontSize: number, region: Rect,
        step: number, mainRect: Rect, ink = INK, bold = false): void {
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
            ...attrs, "font-size": fontSize, fill: ink,
            "font-family": FONT, "font-weight": bold ? 600 : 400
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
        // dashboards disable interactions — keep tooltips, skip selection affordances
        const allow = this.host.hostCapabilities?.allowInteractions !== false;
        g.style.cursor = allow ? "pointer" : "default";

        // keyboard navigation: tab through categories, Enter/Space selects
        g.setAttribute("tabindex", "0");
        g.setAttribute("role", "option");
        const aria = [`${p.cat}`];
        if (p.value != null) { aria.push(cfg.fmt.format(p.value)); }
        if (p.varAbs != null) { aria.push(`Δ${cfg.basisLabel} ${this.fmtSigned(cfg.fmtVar, p.varAbs)}`); }
        if (p.comment) { aria.push(p.comment); }
        g.setAttribute("aria-label", aria.join(", "));
        g.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault();
            e.stopPropagation();
            if (!p.sel || !allow) { return; }
            this.selectionManager.select(p.sel, e.ctrlKey || e.metaKey).then((ids: ISelectionId[]) => {
                this.applySelectionOpacity(ids);
            });
        });

        g.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            if (!allow) { return; }
            // compare mode: clicks collect two categories for the Δ overlay instead
            // of cross-filtering (the toggle decides which behavior clicks have)
            if (this.compareActive) {
                const i = this.compareCats.indexOf(p.cat);
                if (i >= 0) { this.compareCats.splice(i, 1); }
                else if (this.compareCats.length >= 2) { this.compareCats = [p.cat]; }
                else { this.compareCats.push(p.cat); }
                this.rerender();
                return;
            }
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
            add("Benchmark (BM)", p.bm);
            if (p.varAbs != null) {
                out.push({ displayName: `Δ${cfg.basisLabel}`, value: this.fmtSigned(cfg.fmtVar, p.varAbs) });
            }
            add(`Δ${cfg.basisLabel} %`, p.varRel, true, true);
            if (p.var2Abs != null) {
                out.push({ displayName: `Δ${cfg.basis2Label}`, value: this.fmtSigned(cfg.fmtVar, p.var2Abs) });
            }
            add(`Δ${cfg.basis2Label} %`, p.var2Rel, true, true);
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
