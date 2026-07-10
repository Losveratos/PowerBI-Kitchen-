/*
 *  IBCS Inspired Chart Deck — IBCS business chart custom visual for Power BI
 *  © 2026 Michael Tenner · PowerBI Kitchen — MIT License (see LICENSE in the repo root):
 *  free to use and modify, keep this author notice.
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
type Basis = "py" | "plan" | "fcrev";

interface DataPoint {
    cat: string;
    /** per-level labels when the category field is an expanded hierarchy (else null) */
    catLevels: string[] | null;
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
    /** forecast of the previous cycle (revision basis, role prevForecast) */
    fcPrev: number | null;
    /** combo: second measure rendered as a line over the columns (own scale) */
    lineVal: number | null;
    /** stacked mode: series label when the Stack-Series role is bound (else null) */
    stackSeries: string | null;
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
    /** per-point polarity: global invert XOR per-category invert list */
    isGood: (v: number, pp?: DataPoint | null) => boolean;
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
    /** true only in modes that actually draw the BM marker — gates the tooltip row */
    bmInChart: boolean;
    /** IBCS three-scenario notation: PY drawn as a grey triangle marker instead of a third column */
    pyTriangle: boolean;
    /** small multiples active: self-scaling renderers must use the shared domain */
    sharedScale: boolean;
    /** shared value domain over ALL groups (assigned once domains are computed) */
    mainDomain: [number, number];
    /** materiality: false → variance is drawn grey instead of good/bad (thresholds in the
     *  pane). Callers pass the variance pair of the basis they draw; defaults to Δ1. */
    isMaterial: (p: DataPoint | null | undefined, vAbs?: number | null, vRel?: number | null) => boolean;
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
    /** combo: second measure as a line over the columns (own zero-anchored scale) */
    hasLine: boolean;
    lineName: string;
    fmtLine: IValueFormatter;
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
    private lineFormat: string | undefined;
    private lineName: string | undefined;
    /** shared waterfall domain across small-multiples cells (IBCS same scale) */
    private sharedWfDomain: [number, number] | null = null;
    /** global font multiplier from the labels "Size preset" (Full HD = 1.5) */
    private fontK = 1;
    /** per-category mark groups in build order, for the ▶ reveal animation */
    private animGroups: SVGGElement[][] = [];
    private animTimers: number[] = [];
    /** small multiples: currently zoomed-in group (transient, ⤢/← in the chart) */
    private zoomGroup: string | null = null;
    /** table mode: expanded hierarchy parents (transient, chevron click in the chart) */
    private expandedRows = new Set<string>();
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
    private paneHasMultiples = false;
    /** basis parseData actually used — single source of truth for ΔBasis labels */
    private basisMode: Basis = "py";
    /** secondary basis (the dual-variance counterpart of basisMode) */
    private basis2Mode: "py" | "plan" = "plan";
    private paneHasFcPrev = false;
    /** user-entered comments persisted in the report (commentsPanel.userComments JSON) */
    private userComments = new Map<string, string>();
    private commentEdit = false;
    private commentEditor: HTMLDivElement | null = null;
    /** JSON just persisted, until the host round-trip echoes it back */
    private pendingCommentsJson: string | null = null;
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
            this.closeCommentEditor();
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

            // a just-persisted comment must survive a stale metadata update that
            // arrives before the host round-trip echoes the new store back
            const rawStore = dataView?.metadata?.objects?.["commentsPanel"]?.["userComments"];
            const rawJson = typeof rawStore === "string" ? rawStore : "";
            if (this.pendingCommentsJson == null || rawJson === this.pendingCommentsJson) {
                this.pendingCommentsJson = null;
                this.userComments = this.readUserComments(dataView);
            }
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
        fs.chartCard.topN.visible = orient === "bars" || orient === "catbridge"
            || orient === "table" || orient === "dumbbell" || orient === "cards";
        fs.chartCard.movingAverage.visible = orient === "columns" || orient === "line";
        fs.chartCard.dualVariance.visible = bothBases;
        fs.chartCard.comparisonMode.visible = bothBases || this.paneHasFcPrev;
        fs.chartCard.pyTriangle.visible = bothBases
            && (orient === "columns" || orient === "bars" || orient === "table");
        fs.chartCard.waterfallStyle.visible = orient === "columns" || orient === "bars";
        fs.chartCard.sortByImpact.visible = orient === "catbridge"
            || ((orient === "columns" || orient === "bars") && fs.chartCard.waterfallStyle.value);
        fs.chartCard.groupEvery.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "catbridge";
        fs.chartCard.bridgeGroup.visible = orient === "columns" || orient === "bars"
            || orient === "intwaterfall" || orient === "catbridge";
        fs.chartCard.chartButtons.visible = orient === "intwaterfall" || orient === "catbridge";
        fs.scaleCard.refLineLabel.visible = String(fs.scaleCard.refLine.value || "").trim() !== "";
        fs.scaleCard.capOverflow.visible = (fs.scaleCard.fixedMax.value ?? 0) > 0;
        fs.scaleCard.fixedVarMax.visible = fs.chartCard.showAbsoluteVariance.value;
        // comments card stays visible without a comment measure — the in-chart
        // capture mode works on any category
        fs.commentsCard.visible = true;
        fs.chartCard.multiplesGroup.visible = this.paneHasMultiples;
        fs.chartCard.cumulativeButton.visible = orient === "columns" || orient === "line";
        fs.chartCard.cumulative.visible = orient === "columns" || orient === "line" || orient === "table";
        fs.chartCard.materialityAbs.visible = this.paneHasPy || this.paneHasPl;
        fs.chartCard.materialityPct.visible = this.paneHasPy || this.paneHasPl;
        fs.chartCard.compareClick.visible = orient === "columns" || orient === "bars";
        fs.chartCard.showTotal.visible = orient === "columns" || orient === "bars" || orient === "line";
        // scale card only where the shared main scale exists; the sync group
        // additionally needs renderChart (waterfall computes its own domain)
        fs.scaleCard.visible = orient === "columns" || orient === "bars"
            || orient === "line" || orient === "waterfall";
        fs.scaleCard.syncGroup.visible = orient !== "waterfall";
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
        this.paneHasMultiples = !!mult;
        const seriesCol = catCols?.find(c => c.source.roles?.["series"]);
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
            for (const role of ["actual", "previousYear", "plan", "forecast", "benchmark", "lineMeasure", "prevForecast"]) {
                if (roles[role]) {
                    byRole[role] = col.values.map(v => (typeof v === "number" && isFinite(v)) ? v : null);
                    if (role === "actual" || (role === "forecast" && !this.measureFormat)) {
                        if (col.source.format) { this.measureFormat = col.source.format; }
                        if (!this.measureName || role === "actual") {
                            this.measureName = col.source.displayName;
                        }
                    }
                    if (role === "lineMeasure") {
                        this.lineFormat = col.source.format;
                        this.lineName = col.source.displayName;
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
        this.paneHasFcPrev = !!byRole["prevForecast"];
        this.paneHasComments = comments != null;
        if (!byRole["actual"] && !byRole["forecast"]) {
            // some fields are bound but the value measure is missing — say so
            if (valueCols.length > 0 || mult || rowTypeCol || fcFlagCol) {
                this.missingHint = "Actual (AC) fehlt — bitte Ist-Measure ins Actual-Feld ziehen";
            }
            return null;
        }

        const basisMode = this.resolveBasis(byRole);
        this.basisMode = basisMode;
        this.basis2Mode = basisMode === "plan" ? "py"
            : basisMode === "fcrev" ? (byRole["plan"] ? "plan" : "py") : "plan";
        const points: DataPoint[] = [];
        let commentCounter = 0;
        for (let i = 0; i < cat.values.length; i++) {
            let ac = byRole["actual"] ? byRole["actual"][i] : null;
            const py = byRole["previousYear"] ? byRole["previousYear"][i] : null;
            const pl = byRole["plan"] ? byRole["plan"][i] : null;
            let fc = byRole["forecast"] ? byRole["forecast"][i] : null;
            // chart-builder compatible flag column: 1/true marks the AC value as forecast
            const flag = fcFlagCol ? fcFlagCol.values[i] : null;
            const flagStr = flag != null ? String(flag).trim().toLowerCase() : "";
            const flagOn = flagStr !== "" && flagStr !== "0" && flagStr !== "false"
                && flagStr !== "nein" && flagStr !== "no";
            if (flagOn && ac != null && fc == null) {
                fc = ac;
                ac = null;
            }
            const isFc = ac == null && fc != null;
            const value = ac != null ? ac : fc;
            const fcPrev = byRole["prevForecast"] ? byRole["prevForecast"][i] : null;
            const basis = basisMode === "plan" ? pl : basisMode === "fcrev" ? fcPrev : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            const basis2 = this.basis2Mode === "plan" ? pl : py;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
                ? (var2Abs / Math.abs(basis2)) * 100 : null;
            const comment = comments ? comments[i] : null;
            let selBuilder = this.host.createSelectionIdBuilder();
            for (const level of catLevels) { selBuilder = selBuilder.withCategory(level, i); }
            if (mult) { selBuilder = selBuilder.withCategory(mult, i); }
            const levelLabels = catLevels.map(level => this.categoryLabel(level.values[i]));
            points.push({
                cat: levelLabels.join(" · "),
                catLevels: levelLabels.length > 1 ? levelLabels : null,
                ac, py, pl, fc, value, isFc, basis, varAbs, varRel, var2Abs, var2Rel,
                bm: byRole["benchmark"] ? byRole["benchmark"][i] : null,
                fcPrev,
                lineVal: byRole["lineMeasure"] ? byRole["lineMeasure"][i] : null,
                stackSeries: seriesCol && seriesCol.values[i] != null
                    ? this.categoryLabel(seriesCol.values[i]) : null,
                comment,
                commentNo: comment != null ? ++commentCounter : null,
                group: mult ? this.categoryLabel(mult.values[i]) : null,
                rowType: rowTypeCol && rowTypeCol.values[i] != null
                    ? String(rowTypeCol.values[i]).toLowerCase() : null,
                isRest: false,
                sel: selBuilder.createSelectionId()
            });
        }
        // merge user-entered comments (persisted via the in-chart editor) and renumber;
        // with a stack series the same category repeats — only its first point gets the marker
        if (this.userComments.size > 0) {
            const seen = new Set<string>();
            for (const p of points) {
                const key = this.commentKey(p);
                if (seen.has(key)) { continue; }
                const uc = this.userComments.get(key);
                if (uc == null) { continue; }
                seen.add(key);
                p.comment = p.comment ? `${p.comment} · ✎ ${uc}` : `✎ ${uc}`;
            }
            let no = 0;
            for (const p of points) { p.commentNo = p.comment != null ? ++no : null; }
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
        if (mode === "fcrev" && byRole["prevForecast"] && byRole["prevForecast"].some(v => v != null)) {
            return "fcrev";
        }
        // auto (or fcrev without the role): prefer plan, otherwise previous year
        return byRole["plan"] && byRole["plan"].some(v => v != null) ? "plan" : "py";
    }

    // ------------------------------------------------------------ formatting

    private makeFormatter(maxAbs: number, allIntegers: boolean, formatOverride?: string): IValueFormatter {
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
            format: formatOverride ?? this.measureFormat,
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
        // no live data: in-chart interactions must not re-render a stale dataset
        this.lastRender = null;
        this.compareCats = [];
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
                bm: null, fcPrev: null,
                comment: null, commentNo: null, group: null, rowType: null, isRest: false, sel: null, catLevels: null, lineVal: null, stackSeries: null
            };
        });
        this.basisMode = "plan";
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
        // builder-parity modes on existing AC/PY data — no extra fields needed
        const isPareto = orientationRaw === "pareto";
        const isDumbbell = orientationRaw === "dumbbell";
        const isSlope = orientationRaw === "slope";
        // KPI cards: one tile per category — the KPI-card visual folded into the deck
        const isCards = orientationRaw === "cards";
        const orientation: Orientation =
            orientationRaw === "bars" || isCatBridge || isTable || isDumbbell || isCards ? "bars" : "columns";
        // stacked mode: field-driven — filling the Stack-Series role stacks the plain
        // columns/bars automatically, an empty role leaves everything untouched
        const isStacked = (orientationRaw === "columns" || orientationRaw === "bars")
            && points.some(p => p.stackSeries != null);
        // waterfall-bridge is an optional add-on to columns/bars, not a separate orientation
        const wfStyleGlobal = s.chartCard.waterfallStyle.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "bars");
        const sortByImpactOn = (wfStyleGlobal || isCatBridge) && s.chartCard.sortByImpact.value;
        // YTD only where a running total over the category axis makes sense — bridge,
        // structure and stacked modes would silently cumulate nonsense
        const cumulativeOn = s.chartCard.cumulative.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "line" || orientationRaw === "table");

        // font preset: one switch scaling every text in the visual (Full HD = ×1.5)
        this.fontK = { compact: 1, fullhd: 1.5, presentation: 2 }[
            String(s.labelsCard.fontPreset.value.value)] ?? 1;
        this.animGroups = [];

        // compare-on-click: only meaningful where per-category value bars exist
        this.compareActive = s.chartCard.compareClick.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "bars");
        this.compareAnchors.clear();
        if (!this.compareActive) { this.compareCats = []; }

        // comment capture mode: clicks open the editor instead of cross-filtering
        this.commentEdit = s.commentsCard.editComments.value
            && this.host.hostCapabilities?.allowInteractions !== false;
        this.closeCommentEditor();

        // small multiples: group by the multiples role, in order of appearance
        const groups: { name: string | null; pts: DataPoint[] }[] = [];
        for (const p of points) {
            const last = groups.length > 0 ? groups[groups.length - 1] : null;
            const found = last && last.name === p.group ? last : groups.find(g => g.name === p.group);
            if (found) { found.pts.push(p); } else { groups.push({ name: p.group, pts: [p] }); }
        }

        // multiples options: Top-N tiles (remainder merged into one "Rest" tile) and a
        // leading "Σ Gesamt" tile — applied before the per-group transforms and domain
        // computation so all tiles, including the larger total, share one IBCS scale
        if (groups.length > 1 && groups[0].name != null) {
            const mTopN = Math.round(s.chartCard.multiplesTopN.value ?? 0);
            const allGroups = groups.slice();
            if (mTopN > 0 && groups.length > mTopN + 1) {
                const size = (g: { pts: DataPoint[] }) =>
                    g.pts.reduce((a, p) => a + Math.abs(p.value ?? 0), 0);
                const ranked = groups.slice().sort((a, b) => size(b) - size(a));
                const rest = ranked.slice(mTopN);
                groups.length = 0;
                groups.push(...ranked.slice(0, mTopN),
                    this.aggregateGroups(rest.map(g => g.pts), `Rest (${rest.length})`));
            }
            if (s.chartCard.multiplesTotal.value) {
                groups.unshift(this.aggregateGroups(allGroups.map(g => g.pts), "Σ Gesamt"));
            }
        }

        // compare-on-click anchors per category label — ambiguous across multiples
        // tiles (same categories in every tile), so the mode is off in a grid
        if (this.compareActive && groups.length > 1) {
            this.compareActive = false;
            this.compareCats = [];
        }

        // top N + rest aggregation (structure comparisons only), per group
        const topN = Math.round(s.chartCard.topN.value ?? 0);
        if (orientation === "bars" && topN > 0) {
            for (const g of groups) {
                if (g.pts.length > topN + 1) { g.pts = this.applyTopN(g.pts, topN); }
            }
        }
        // cumulative (YTD) view: running totals per group, variances recomputed
        if (cumulativeOn) {
            const basisMode = this.resolveBasisLabel();
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

        const basisMode: Basis = this.resolveBasisLabel();
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
            isGood: (() => {
                const inv = s.chartCard.invert.value;
                const invSet = new Set(String(s.chartCard.invertList.value || "")
                    .split(",").map(x => x.trim().toLowerCase()).filter(x => x));
                return (v: number, pp?: DataPoint | null) =>
                    (inv !== (pp != null && invSet.has(pp.cat.toLowerCase()))) ? v < 0 : v > 0;
            })(),
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
            cumulative: cumulativeOn,
            refLine: this.parseRefLine(),
            refLineLabel: (s.scaleCard.refLineLabel.value || "").trim(),
            lineMode,
            movingAvg: Math.round(s.chartCard.movingAverage.value ?? 0),
            hasLine: orientationRaw === "columns" && !isStacked && points.some(p => p.lineVal != null),
            lineName: this.lineName ?? "Linie",
            fmtLine: this.makeFormatter(
                Math.max(...points.map(p => Math.abs(p.lineVal ?? 0)), 0),
                points.every(p => p.lineVal == null || Number.isInteger(p.lineVal)),
                this.lineFormat),
            waterfallStyle: wfStyleGlobal,
            sortByImpact: sortByImpactOn,
            basisMode,
            basisLabel: basisMode === "plan" ? "PL" : basisMode === "fcrev" ? "FC Vm" : "PY",
            showAbs: s.chartCard.showAbsoluteVariance.value && hasVar,
            showRel: s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null),
            showDual: s.chartCard.dualVariance.value && points.some(p => p.var2Abs != null),
            basis2Label: this.basis2Mode === "plan" ? "PL" : "PY",
            showTotal: s.chartCard.showTotal.value,
            patId: `icd-hatch-${this.instanceId}`,
            patGood: `icd-hatch-good-${this.instanceId}`,
            patBad: `icd-hatch-bad-${this.instanceId}`,
            fmt: this.makeFormatter(maxAbs, allInt),
            fmtVar: this.makeFormatter(maxVarAbs, allVarInt),
            hasPy: points.some(p => p.py != null),
            hasPl: points.some(p => p.pl != null),
            hasFc: points.some(p => p.isFc),
            hasBm: points.some(p => p.bm != null),
            bmInChart: (orientationRaw === "columns" || orientationRaw === "bars"
                || orientationRaw === "line" || isTable) && points.some(p => p.bm != null),
            // triangle notation only when all three scenarios actually appear together
            pyTriangle: s.chartCard.pyTriangle.value
                && points.some(p => p.py != null) && points.some(p => p.pl != null),
            sharedScale: groups.length > 1,
            mainDomain: [0, 0],
            isMaterial: (() => {
                const mAbs = s.chartCard.materialityAbs.value ?? 0;
                const mPct = s.chartCard.materialityPct.value ?? 0;
                if (mAbs <= 0 && mPct <= 0) { return () => true; }
                // material = every configured threshold exceeded (AND) — filters both
                // small absolute noise and small percentage noise
                return (p: DataPoint | null | undefined, vAbs?: number | null, vRel?: number | null) => {
                    if (!p) { return true; }
                    const a = vAbs !== undefined ? vAbs : p.varAbs;
                    const r = vRel !== undefined ? vRel : p.varRel;
                    if (a == null && r == null) { return true; }
                    if (mAbs > 0 && a != null && Math.abs(a) < mAbs) { return false; }
                    if (mPct > 0 && r != null && Math.abs(r) < mPct) { return false; }
                    return true;
                };
            })()
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

        // IBCS same-scale rule also for the self-scaling renderers (pareto/dumbbell/slope)
        cfg.mainDomain = domains.main;

        const renderCell = (grp: { name: string | null; pts: DataPoint[] }, region: Rect) => {
            if (isWaterfall) {
                this.renderWaterfall(wfByGroup.get(grp.name) || [], region, cfg,
                    { abs: domains.abs, rel: domains.rel });
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
            if (isCards) {
                this.renderCards(grp.pts, region, cfg);
                return;
            }
            if (isPareto) {
                this.renderPareto(grp.pts, region, cfg);
                return;
            }
            if (isDumbbell) {
                this.renderDumbbell(grp.pts, region, cfg);
                return;
            }
            if (isSlope) {
                this.renderSlope(grp.pts, region, cfg);
                return;
            }
            if (isStacked) {
                this.renderStacked(grp.pts, region, cfg);
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
        // active-mode chip: comment capture and compare-on-click silently repurpose
        // clicks — show a pill so nobody wonders why crossfiltering stopped working
        if (this.commentEdit || this.compareActive) {
            const toolbarReserve = ((isIntWf || isCatBridge) && s.chartCard.chartButtons.value)
                ? Math.round(170 * this.fontK) : 0;
            const sortReserve = wfStyleGlobal ? 26 : 0;
            const ytdReserve = (s.chartCard.cumulativeButton.value && !isStacked
                && (orientationRaw === "columns" || orientationRaw === "line"))
                ? Math.round(44 * this.fontK) : 0;
            const text = this.commentEdit
                ? "✎ Kommentar-Modus"
                : `⇄ Vergleich (${this.compareCats.length}/2)`;
            this.drawModeChip(width - 6 - toolbarReserve - sortReserve - ytdReserve, text, cfg);
        }

        // YTD chip (opt-in): the end user flips the cumulative view on the report
        // canvas; persisted like the other in-chart buttons
        if (s.chartCard.cumulativeButton.value && !isStacked
            && (orientationRaw === "columns" || orientationRaw === "line")) {
            this.drawCumButton(width - (wfStyleGlobal ? 30 : 6), cfg);
        }
        // IBCS title block on top of everything (incl. multiples grid)
        const topOffset = s.ibcsTitleCard.show.value
            ? this.drawTitleBlock(width, points, cfg, maxAbs, orientation)
            : 0;
        const footerText = (s.ibcsTitleCard.footer.value || "").trim();
        const footerH = footerText ? Math.round(11 * this.fontK) + 6 : 0;
        const availH = height - topOffset - footerH;
        if (footerText) {
            const ff = Math.round(9.5 * this.fontK);
            const ft = this.el("text", {
                x: 6, y: height - 5, "font-size": ff, fill: cfg.subtle, "font-family": FONT
            }, this.svg);
            ft.textContent = this.truncate(footerText, width - 12, ff);
        }

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
        const groupTitleH = Math.round(16 * this.fontK);

        // hero layout (IBCS CT 13): the first tile — Σ Gesamt or the largest group —
        // gets a full-height cell on the left, the rest form a grid beside it; the
        // shared scale is untouched, only the allotted space differs
        const heroOn = s.chartCard.multiplesHero.value && n >= 2 && width >= 460;
        const heroW = heroOn ? Math.round(Math.min(Math.max(width * 0.42, 250), width * 0.55)) : 0;
        const gridX = heroW;
        const gridW = width - heroW;
        const rest = heroOn ? shown.slice(1) : shown;
        const rn = rest.length;
        let cols = Math.ceil(Math.sqrt(rn));
        cols = Math.max(1, Math.min(cols, Math.floor(gridW / 220) || 1));
        const rows = Math.ceil(rn / cols);
        const cellW = gridW / cols;
        const cellH = availH / rows;

        if (heroOn) {
            renderCell(shown[0],
                { x: 2, y: topOffset + groupTitleH, w: heroW - 6, h: availH - groupTitleH - 2 });
            this.drawTileHeader(0, topOffset, heroW, groupTitleH,
                shown[0].name ?? "", shown[0].name ?? "", cfg);
        }
        for (let gi = 0; gi < rn; gi++) {
            const cx = gridX + (gi % cols) * cellW;
            const cy = topOffset + Math.floor(gi / cols) * cellH;
            let title = rest[gi].name ?? "";
            if (gi === rn - 1 && groups.length > n) {
                title += `  (+${groups.length - n} weitere)`;
            }
            // cell content first, header strip after — the click target must sit ON TOP
            // of any chart marks (labels can reach into the strip), or clicks get eaten
            renderCell(rest[gi],
                { x: cx + 2, y: cy + groupTitleH, w: cellW - 4, h: cellH - groupTitleH - 2 });
            this.drawTileHeader(cx, cy, cellW, groupTitleH, title, rest[gi].name ?? "", cfg);
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
        const zoomTip = this.el("title", {}, btn);
        zoomTip.textContent = `${groupName} vergrößern (Klick auf die Titelzeile)`;
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
        const good = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        if (pts.some(p => p.rowType != null)) {
            let cum = 0;
            for (const p of pts) {
                if (p.value == null) { continue; }
                if (p.rowType != null && p.rowType.startsWith("sum")) {
                    segs.push({ label: p.cat, from: 0, to: p.value, kind: "anchor", hatched: p.isFc, p });
                    cum = p.value;
                } else {
                    segs.push({ label: p.cat, from: cum, to: cum + p.value, kind: "delta", good: good(p.value, p), hatched: p.isFc, p });
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
                segs.push({ label: p.cat, from: cum, to: cum + p.varAbs, kind: "delta", good: good(p.varAbs, p), hatched: p.isFc, p });
                cum += p.varAbs;
            }
            segs.push({ label: cfg.hasFc ? "AC/FC" : "AC", from: 0, to: valueSum, kind: "anchor", hatched: cfg.hasFc });
        } else {
            let cum = 0;
            for (const p of pts) {
                if (p.value == null) { continue; }
                segs.push({ label: p.cat, from: cum, to: cum + p.value, kind: "delta", good: good(p.value, p), hatched: p.isFc, p });
                cum += p.value;
            }
            segs.push({ label: "Σ", from: 0, to: cum, kind: "anchor" });
        }
        return segs;
    }

    /** renders a waterfall / bridge into the region (vertical bars, shared domain via cfg call site) */
    private renderWaterfall(segs: WfSeg[], region: Rect, cfg: ChartConfig,
        varDomains?: { abs: [number, number]; rel: [number, number] }): void {
        if (segs.length === 0) { return; }
        const pad = 4;
        const k = this.fontK;
        const titleH = Math.round(14 * k);
        const catArea = cfg.catFont + 10;
        const bandStart = region.x + pad + 2;
        const bandEnd = region.x + region.w - pad;
        const outer: Rect = {
            x: region.x, y: region.y + pad,
            w: region.w, h: region.h - pad - catArea
        };

        // variance tiers above the waterfall (IBCS CT 12): ΔBasis bars and ΔBasis %
        // pins per calculation line. In the variance-bridge mode the waterfall bars
        // ARE the absolute deltas, so only the relative tier is added there.
        const good = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const isVarBridge = segs.some(sg => sg.outlined);
        const tierPts = segs.map(sg => (sg.p && sg.p.varAbs != null) ? sg.p : null);
        const compactH = outer.h < 170 * k;
        const wantRel = cfg.showRel && !compactH && tierPts.some(p => p?.varRel != null);
        const wantAbs = cfg.showAbs && !compactH && !isVarBridge && tierPts.some(p => p != null);
        let rect = outer;
        let relRect: Rect | null = null, absRect: Rect | null = null;
        if (wantRel || wantAbs) {
            let yCur = outer.y;
            if (wantRel) {
                relRect = { x: outer.x, y: yCur, w: outer.w, h: Math.round(outer.h * 0.20) };
                yCur += relRect.h;
            }
            if (wantAbs) {
                absRect = { x: outer.x, y: yCur, w: outer.w, h: Math.round(outer.h * 0.24) };
                yCur += absRect.h;
            }
            rect = { x: outer.x, y: yCur, w: outer.w, h: outer.y + outer.h - yCur };
        }

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
        const showTierLabels = cfg.showLabels && step > cfg.labelFont * 1.4;

        // ΔBasis % pins tier
        if (relRect) {
            const tg = this.el("g", {}, this.svg);
            const relDomain: [number, number] = varDomains
                ? [...varDomains.rel] as [number, number]
                : extent(tierPts.map(p => p?.varRel ?? null));
            const relScale = this.makePanelScale(relDomain, relRect, "columns", labelPad, true);
            this.drawBaseline(tg, relRect, relScale, "columns", bandStart, bandEnd, cfg.basisMode, cfg.colors);
            this.drawPanelTitle(tg, relRect, `Δ${cfg.basisLabel} %`, "columns", titleH, region, undefined, cfg.subtle);
            const zero = relScale(0);
            for (let i = 0; i < n; i++) {
                const v = tierPts[i]?.varRel;
                if (v == null) { continue; }
                const c = pos(i) + slotW / 2;
                const col = (v === 0 || !cfg.isMaterial(tierPts[i]))
                    ? cfg.colors.py : (good(v, tierPts[i]) ? cfg.colors.good : cfg.colors.bad);
                const y = relScale(v);
                this.el("line", { x1: c, y1: zero, x2: c, y2: y, stroke: col, "stroke-width": Math.max(1.6, 1.4 * k) }, tg);
                this.el("circle", { cx: c, cy: y, r: Math.max(2.6, 2.2 * k), fill: col }, tg);
                if (showTierLabels) {
                    const headR = Math.max(2.6, 2.2 * k);
                    const flip = v > 0 && this.collidesPanelTitle(c, this.fmtPercent(v), cfg.labelFont,
                        relScale(v) - headR - cfg.labelFont, relRect.y, region.x, `Δ${cfg.basisLabel} %`);
                    this.drawEndLabelAt(tg, c, v, v >= 0 && !flip, relScale, "columns", this.fmtPercent(v),
                        cfg.labelFont, cfg.ink, Math.round(2 * k), cfg.paper);
                }
            }
        }
        // ΔBasis bars tier
        if (absRect) {
            const tg = this.el("g", {}, this.svg);
            const absDomain: [number, number] = varDomains
                ? [...varDomains.abs] as [number, number]
                : extent(tierPts.map(p => p?.varAbs ?? null));
            const absScale = this.makePanelScale(absDomain, absRect, "columns", labelPad, true);
            this.drawBaseline(tg, absRect, absScale, "columns", bandStart, bandEnd, cfg.basisMode, cfg.colors);
            this.drawPanelTitle(tg, absRect, `Δ${cfg.basisLabel}`, "columns", titleH, region, undefined, cfg.subtle);
            for (let i = 0; i < n; i++) {
                const p = tierPts[i];
                const v = p?.varAbs;
                if (p == null || v == null) { continue; }
                const mat = cfg.isMaterial(p);
                const col = (v === 0 || !mat) ? cfg.colors.py : (good(v, p) ? cfg.colors.good : cfg.colors.bad);
                const style = p.isFc && mat
                    ? { fill: `url(#${good(v, p) ? cfg.patGood : cfg.patBad})`, stroke: col, "stroke-width": 1 }
                    : { fill: col };
                this.drawBar(tg, pos(i), slotW, 0, v, absScale, "columns", style);
                if (showTierLabels) {
                    this.drawEndLabel(tg, pos(i) + slotW / 2, v, absScale, "columns",
                        this.fmtSigned(cfg.fmtVar, v), cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }
        }

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
                // in the variance bridge the delta bars ARE variances — materiality greys them
                const imm = isVarBridge && sg.p != null && !cfg.isMaterial(sg.p);
                const color = (delta === 0 || imm) ? cfg.colors.py : (sg.good ? cfg.colors.good : cfg.colors.bad);
                const hollowBad = cfg.hc && !sg.good && delta !== 0;
                style = hollowBad
                    ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                    : sg.hatched && !imm
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
        // the stacked totals and mini columns assume positive magnitudes — negative
        // series would render negative rect heights; fail loudly instead of wrongly
        if (pts.some(p => (p.value ?? 0) < 0 || (p.basis ?? 0) < 0)) {
            this.drawModeHint(region, cfg,
                "Integrierte Brücke unterstützt keine negativen Werte — bitte Waterfall oder Columns + Brücke nutzen");
            return;
        }
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
        const pctTot = basisSum !== 0 ? (dTot / Math.abs(basisSum)) * 100 : 0;
        const firstFc = pts.findIndex(p => p.isFc);
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);

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
            const pin = (x: number, pct: number, hollow: boolean, parent: SVGElement, pp?: DataPoint) => {
                const h = PS(pct);
                const yEnd = pct >= 0 ? axisY - h : axisY + h;
                this.el("line", { x1: x, y1: axisY, x2: x, y2: yEnd, stroke: colOf(pct, pp), "stroke-width": 2.2 }, parent);
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
                pin(cx(i), p.varRel, p.isFc, marks, p);
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
                const c = colOf(d, p);
                const hollowBad = cfg.hc && !goodOf(d, p) && d !== 0;
                this.el("rect", {
                    x: x - segW / 2, y: segTop, width: segW, height: segH,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(d, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
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
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
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
        const drawPin = (yy: number, pct: number, bold: boolean, parent: SVGElement, pp?: DataPoint) => {
            const w = pinLen(pct);
            const yMid = yy + rowH / 2;
            const c = colOf(pct, pp);
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
                const c = colOf(d, p);
                const hollowBad = cfg.hc && !goodOf(d, p) && d !== 0;
                this.el("rect", {
                    x: xA, y: yy + rowH * 0.26, width: Math.max(xB - xA, 2), height: brickH,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.4 }
                        : p.isFc
                            ? { fill: `url(#${goodOf(d, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
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
                drawPin(yy, p.varRel, false, g, p);
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
            drawPin(yAC, dTot / Math.abs(REF) * 100, true, bg);
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
        if (points.length === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 6;

        // ------- expandable hierarchy: with an expanded category hierarchy (≥2 level
        // columns in the field well), level-0 rows render aggregated with a ▸/▾
        // chevron — clicking the category toggles its indented child rows in and out
        type TableRow = { p: DataPoint; indent: boolean; parentKey?: string; expanded?: boolean };
        const hasLevels = points.some(p => (p.catLevels?.length ?? 0) >= 2);
        let rows: TableRow[];
        if (hasLevels) {
            rows = [];
            const orderKeys: string[] = [];
            const byKey = new Map<string, DataPoint[]>();
            for (const p of points) {
                const key = p.catLevels && p.catLevels.length > 1 ? p.catLevels[0] : p.cat;
                if (!byKey.has(key)) { byKey.set(key, []); orderKeys.push(key); }
                (byKey.get(key) as DataPoint[]).push(p);
            }
            for (const key of orderKeys) {
                const kids = byKey.get(key) as DataPoint[];
                if (kids.length === 1 && !(kids[0].catLevels && kids[0].catLevels.length > 1)) {
                    rows.push({ p: kids[0], indent: false });
                    continue;
                }
                const expanded = this.expandedRows.has(key);
                rows.push({ p: this.aggregateHierarchy(key, kids), indent: false, parentKey: key, expanded });
                if (expanded) {
                    for (const c of kids) {
                        rows.push({
                            p: { ...c, cat: c.catLevels ? c.catLevels.slice(1).join(" · ") : c.cat },
                            indent: true
                        });
                    }
                }
            }
        } else {
            rows = points.map(p => ({ p, indent: false }));
        }
        const rowPts = rows.map(r => r.p);
        const n = rows.length;

        const hasVar = rowPts.some(p => p.varAbs != null);
        const hasVar2 = cfg.showDual && rowPts.some(p => p.var2Abs != null);
        const showPct = cfg.showRel && hasVar;
        const isSum = (p: DataPoint) => p.rowType != null && p.rowType.startsWith("sum");

        // ------- column layout: fixed text columns, graphic columns share the rest
        const chevW = hasLevels ? 14 * k : 0;
        const nameW = Math.min(region.w * 0.26,
            this.maxTextWidth(rowPts.map(p => p.cat), cf) + 18 + chevW);
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
        const shown = rows.slice(0, Math.max(1, maxRows));

        const barDomain = extent(rowPts.flatMap(p => [p.value, p.py, p.pl]));
        const dDomain = Math.max(...rowPts.map(p => Math.abs(p.varAbs ?? 0)), 1);
        const d2Domain = Math.max(...rowPts.map(p => Math.abs(p.var2Abs ?? 0)), 1);
        const maxPct = Math.max(...rowPts.map(p => Math.abs(p.varRel ?? 0)), 1);

        const bg = this.el("g", {}, this.svg);
        const marks = this.el("g", {}, this.svg);
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const colOf2 = (v: number, pp: DataPoint) => (v === 0 || !cfg.isMaterial(pp, pp.var2Abs, pp.var2Rel))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
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
        shown.forEach((row, i) => {
            const p = row.p;
            const isParent = row.parentKey != null;
            const y = top + i * rowH;
            const yMid = y + rowH / 2;
            const sum = isSum(p) || isParent;
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;

            // separators: subtle under every row, strong above subtotals
            this.el("line", {
                x1: region.x + pad, y1: y + rowH, x2: region.x + region.w - pad, y2: y + rowH,
                stroke: cfg.subtle, "stroke-width": 0.6, "stroke-opacity": 0.4
            }, bg);
            if (isSum(p)) {
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
            const indentX = row.indent ? Math.round(14 * k) : 0;
            const nameText = isParent
                ? `${row.expanded ? "▾" : "▸"} ${p.cat}`
                : p.cat;
            txt(colX["name"].x + (sum && !row.indent ? 0 : Math.round(6 * k)) + indentX,
                yMid + rowFont * 0.35,
                this.truncate(nameText, colX["name"].w - 8 - indentX, rowFont),
                "start", rowFont, sum, cfg.ink, g);
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
                    if (cfg.pyTriangle) {
                        // triangle above the AC bar at PY level (three-scenario notation);
                        // scaled to the row height so it stays subtle in dense tables
                        this.drawPyTriangle(g, y + rowH * 0.36, rowH * 0.55, p.py, barScale, "bars", cfg);
                    } else {
                        barCell(p.py, pyH, 0.12, cfg.hc
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1, "stroke-dasharray": "3,2" }
                            : { fill: cfg.colors.py });
                    }
                }
                if (p.pl != null) {
                    barCell(p.pl, acH, 0.30, { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.2 });
                }
                if (p.value != null) {
                    barCell(p.value, acH, 0.36, p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac });
                }
                if (p.bm != null) {
                    const bx = barScale(p.bm);
                    this.el("rect", {
                        x: bx - 1.2, y: y + rowH * 0.22, width: 2.4, height: rowH * 0.56,
                        fill: cfg.ink
                    }, g);
                }
            }

            // ΔBasis: number + bar
            if (p.varAbs != null && colX["dval"]) {
                txt(colX["dval"].x + colX["dval"].w, yMid + rowFont * 0.35,
                    this.fmtSigned(cfg.fmtVar, p.varAbs), "end", rowFont, sum,
                    p.varAbs === 0 ? cfg.subtle : colOf(p.varAbs, p), g);
            }
            if (p.varAbs != null && colX["dbar"]) {
                const len = Math.abs(p.varAbs) / dDomain * (colX["dbar"].w / 2 - 4);
                const h = Math.max(3, rowH * 0.42);
                const c = colOf(p.varAbs, p);
                const hollowBad = cfg.hc && !goodOf(p.varAbs, p) && p.varAbs !== 0;
                this.el("rect", {
                    x: p.varAbs >= 0 ? dAxis + 1 : dAxis - 1 - len, y: yMid - h / 2,
                    width: Math.max(len, 1), height: h,
                    ...(hollowBad
                        ? { fill: cfg.paper, stroke: c, "stroke-width": 1.2 }
                        : p.isFc && cfg.isMaterial(p)
                            ? { fill: `url(#${goodOf(p.varAbs, p) ? cfg.patGood : cfg.patBad})`, stroke: c, "stroke-width": 1 }
                            : { fill: c })
                }, g);
            }

            // ΔBasis %: pin with label
            if (p.varRel != null && colX["pct"]) {
                const len = Math.abs(p.varRel) / maxPct * (colX["pct"].w / 2 - lf * 3);
                const c = colOf(p.varRel, p);
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
                    p.var2Abs === 0 ? cfg.subtle : colOf2(p.var2Abs, p), g);
            }
            if (hasVar2 && p.var2Abs != null && colX["d2bar"]) {
                const len = Math.abs(p.var2Abs) / d2Domain * (colX["d2bar"].w / 2 - 4);
                const h = Math.max(3, rowH * 0.42);
                this.el("rect", {
                    x: p.var2Abs >= 0 ? d2Axis + 1 : d2Axis - 1 - len, y: yMid - h / 2,
                    width: Math.max(len, 1), height: h, fill: colOf2(p.var2Abs, p)
                }, g);
            }

            // comment marker number, if bound
            if (p.commentNo != null) {
                txt(colX["name"].x + colX["name"].w - 4, yMid + rowFont * 0.35,
                    `(${p.commentNo})`, "end", Math.round(rowFont * 0.85), false, cfg.subtle, g);
            }

            // full-width transparent hit area so the whole row is clickable
            this.el("rect", {
                x: region.x + pad, y, width: region.w - pad * 2, height: rowH,
                fill: cfg.paper, "fill-opacity": 0.01
            }, g);

            this.attachInteraction(g, p, cfg);
            if (isParent) {
                // clicking a parent row toggles its children (crossfilter stays on the
                // child rows — the parent's sel is null, so attachInteraction is inert)
                g.setAttribute("aria-expanded", String(!!row.expanded));
                const key = row.parentKey as string;
                const toggle = () => {
                    if (this.expandedRows.has(key)) { this.expandedRows.delete(key); }
                    else { this.expandedRows.add(key); }
                    this.rerender();
                };
                // comment mode wins: attachInteraction opens the editor on this row,
                // the expand toggle would immediately re-render and close it again
                g.addEventListener("click", (e: MouseEvent) => {
                    e.stopPropagation();
                    if (this.commentEdit) { return; }
                    toggle();
                });
                g.addEventListener("keydown", (e: KeyboardEvent) => {
                    if (e.key !== "Enter" && e.key !== " ") { return; }
                    e.preventDefault(); e.stopPropagation();
                    if (this.commentEdit) { return; }
                    toggle();
                });
            }
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        if (shown.length < n) {
            txt(region.x + pad, rowsBottom + cf, `… ${n - shown.length} weitere Zeilen (Visual höher ziehen)`,
                "start", Math.round(cf * 0.9), false, cfg.subtle, bg);
        }
    }

    /** aggregates the child rows of one hierarchy parent into a synthetic table row */
    private aggregateHierarchy(key: string, kids: DataPoint[]): DataPoint {
        const sum = (get: (p: DataPoint) => number | null): number | null => {
            let acc: number | null = null;
            for (const c of kids) {
                const v = get(c);
                if (v != null) { acc = (acc ?? 0) + v; }
            }
            return acc;
        };
        const ac = sum(p => p.ac), py = sum(p => p.py), pl = sum(p => p.pl), fc = sum(p => p.fc);
        const value = sum(p => p.value), basis = sum(p => p.basis);
        const varAbs = (value != null && basis != null) ? value - basis : null;
        const varRel = (varAbs != null && basis != null && basis !== 0)
            ? (varAbs / Math.abs(basis)) * 100 : null;
        // secondary basis summed directly from the scenario fields — reconstructing it
        // from var2Abs dropped points whose AC/FC is missing
        const basis2 = this.basis2Mode === "plan" ? pl : py;
        const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
        const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
            ? (var2Abs / Math.abs(basis2)) * 100 : null;
        return {
            cat: key, catLevels: null,
            ac, py, pl, fc, value, isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            bm: null, fcPrev: sum(p => p.fcPrev), lineVal: null, stackSeries: null, comment: null, commentNo: null,
            group: kids[0].group, rowType: null, isRest: false, sel: null
        };
    }

    /**
     * merges the point lists of several small-multiples groups into one synthetic tile
     * ("Σ Gesamt" / "Rest (n)"): categories aligned by label (+ stack series), values
     * summed, variances recomputed on the sums
     */
    private aggregateGroups(subsets: DataPoint[][], name: string): { name: string; pts: DataPoint[] } {
        const order: string[] = [];
        const byKey = new Map<string, DataPoint[]>();
        for (const pts of subsets) {
            for (const p of pts) {
                const key = `${p.cat}¦${p.stackSeries ?? ""}`;
                const bucket = byKey.get(key);
                if (bucket) { bucket.push(p); } else { byKey.set(key, [p]); order.push(key); }
            }
        }
        const pts = order.map(key => {
            const kids = byKey.get(key) as DataPoint[];
            const agg = this.aggregateHierarchy(kids[0].cat, kids);
            agg.group = name;
            agg.stackSeries = kids[0].stackSeries;
            // a period is still forecast in the total only if every tile flags it
            agg.isFc = kids.every(c => c.isFc);
            agg.rowType = kids[0].rowType;
            let bm: number | null = null;
            for (const c of kids) { if (c.bm != null) { bm = (bm ?? 0) + c.bm; } }
            agg.bm = bm;
            return agg;
        });
        return { name, pts };
    }

    /**
     * KPI cards: one tile per category with the KPI-card layout — big value, mini
     * bridge basis → Δ → AC in IBCS notation, and Δ reference rows. Two layouts:
     * stacked (default) and flat — wide, short tiles put the Δ rows and the bridge
     * to the RIGHT of the value instead of dropping them, so a KPI strip across the
     * top of a page keeps its variances.
     */
    private renderCards(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const k = this.fontK;
        const pts = points.filter(p => p.value != null);
        const n = pts.length;
        if (n === 0) { return; }
        const gap = Math.round(8 * k);
        let cols = Math.max(1, Math.min(n, Math.floor(region.w / (185 * k)) || 1));
        // avoid a lonely last row when a squarer grid fits the same width
        cols = Math.min(cols, Math.ceil(n / Math.ceil(n / cols)));
        const rows = Math.ceil(n / cols);
        const cw = (region.w - gap) / cols;
        const ch = (region.h - gap) / rows;
        const good = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);

        pts.forEach((p, i) => {
            const x = region.x + gap / 2 + (i % cols) * cw + 2;
            const y = region.y + gap / 2 + Math.floor(i / cols) * ch + 2;
            const w = cw - gap, h = ch - gap;
            const g = this.el("g", { "class": "icd-cat" }, this.svg) as SVGGElement;
            const emph = cfg.highlight.has(p.cat.toLowerCase());
            this.el("rect", {
                x, y, width: w, height: h, rx: Math.round(6 * k),
                fill: cfg.hc ? cfg.paper : (emph ? "#F4F4F0" : cfg.paper),
                stroke: emph ? cfg.ink : (cfg.hc ? cfg.ink : "#DDDDD8"),
                "stroke-width": emph ? 1.6 : 1
            }, g);
            // status stripe at the left edge (KPI-card style): variance direction at a
            // glance — grey without basis, when Δ = 0 or below the materiality thresholds
            const stripeCol = (p.varAbs == null || p.varAbs === 0 || !cfg.isMaterial(p))
                ? (cfg.hc ? cfg.ink : cfg.colors.py)
                : (good(p.varAbs, p) ? cfg.colors.good : cfg.colors.bad);
            this.el("rect", {
                x: x + 1.2, y: y + 1.2, width: Math.round(4 * k), height: h - 2.4,
                rx: Math.round(3 * k), fill: stripeCol
            }, g);

            const pad = Math.round(10 * k) + Math.round(5 * k);
            // wired to the pane: data-label size drives value/Δ rows, category-axis
            // size drives the card title (both already include the font preset)
            const titleF = Math.max(9, cfg.catFont);
            const valueF = Math.round(cfg.labelFont * 1.9);
            const refF = Math.max(9, Math.round(cfg.labelFont * 0.95));
            const legRoom = Math.round(11 * k);
            // per-card formatters: KPI tiles often mix magnitudes (revenue vs. units),
            // so auto display units scale per card instead of across the whole deck
            const pInt = [p.value, p.py, p.pl, p.fc].every(v => v == null || Number.isInteger(v));
            const fmtP = this.makeFormatter(Math.max(
                Math.abs(p.value ?? 0), Math.abs(p.basis ?? 0), Math.abs(p.py ?? 0), Math.abs(p.pl ?? 0)), pInt);
            const fmtVarP = this.makeFormatter(Math.max(
                Math.abs(p.varAbs ?? 0), Math.abs(p.var2Abs ?? 0)), pInt);
            const valueText = fmtP.format(p.value as number);

            const txt = (tx: number, ty: number, text: string, font: number, bold: boolean,
                color: string, anchor = "start") => {
                const t = this.el("text", {
                    x: tx, y: ty, "font-size": font, fill: color, "font-family": FONT,
                    "font-weight": bold ? 700 : 400, "text-anchor": anchor
                }, g);
                t.textContent = text;
                return t;
            };
            const titleValue = (tyTitle: number, tyValue: number, maxW: number) => {
                txt(x + pad, tyTitle, this.truncate(p.cat, maxW, titleF), titleF, false, cfg.subtle);
                txt(x + pad, tyValue, valueText, valueF, true, cfg.ink);
                if (p.isFc) {
                    const vw = valueText.length * valueF * 0.58;
                    txt(x + pad + vw + 6 * k, tyValue, "FC", Math.round(9 * k), true, cfg.subtle);
                }
            };
            const refText = (vAbs: number, vRel: number | null) =>
                `${this.fmtSigned(fmtVarP, vAbs)}${vRel != null ? ` · ${this.fmtPercent(vRel)}` : ""}`;
            const refRowAt = (tx: number, ty: number, label: string,
                vAbs: number | null, vRel: number | null) => {
                if (vAbs == null) { return; }
                const col = (vAbs === 0 || !cfg.isMaterial(p, vAbs, vRel))
                    ? cfg.subtle : (good(vAbs, p) ? cfg.colors.good : cfg.colors.bad);
                txt(tx, ty, `Δ${label}`, refF, false, cfg.subtle);
                txt(tx + refF * 2.6, ty, refText(vAbs, vRel), refF, true, col);
            };
            // mini bridge basis → Δ → AC in IBCS notation; byBottom is the axis line
            const drawBridge = (bx: number, byBottom: number, bw2: number, bridgeH: number) => {
                if (p.basis == null) { return; }
                const maxV = Math.max(Math.abs(p.basis), Math.abs(p.value as number), 1);
                const hOf = (v: number) => Math.max(1.5, Math.abs(v) / maxV * bridgeH);
                const colW = Math.min(44 * k, bw2 / 3.6);
                const step2 = bw2 / 3;
                const cxs = [bx + step2 / 2, bx + step2 * 1.5, bx + step2 * 2.5];
                // baseline in the notation of the basis scenario
                if (cfg.basisMode === "py") {
                    this.el("line", { x1: bx, y1: byBottom, x2: bx + bw2, y2: byBottom, stroke: cfg.colors.py, "stroke-width": 3 }, g);
                } else {
                    this.el("line", { x1: bx, y1: byBottom - 1.2, x2: bx + bw2, y2: byBottom - 1.2, stroke: cfg.colors.pl, "stroke-width": 1 }, g);
                    this.el("line", { x1: bx, y1: byBottom + 1.2, x2: bx + bw2, y2: byBottom + 1.2, stroke: cfg.colors.pl, "stroke-width": 1 }, g);
                }
                const basisStyle = cfg.basisMode === "plan"
                    ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.3 }
                    : cfg.basisMode === "fcrev"
                    ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                    : cfg.hc
                        ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                        : { fill: cfg.colors.py };
                this.el("rect", { x: cxs[0] - colW / 2, y: byBottom - hOf(p.basis), width: colW, height: hOf(p.basis), ...basisStyle }, g);
                if (p.varAbs != null && p.varAbs !== 0) {
                    const lo = Math.min(p.basis, p.value as number), hi = Math.max(p.basis, p.value as number);
                    const dTop = byBottom - hOf(hi), dH = Math.max(1.5, (hi - lo) / maxV * bridgeH);
                    const dCol = !cfg.isMaterial(p) ? cfg.colors.py
                        : (good(p.varAbs, p) ? cfg.colors.good : cfg.colors.bad);
                    this.el("rect", {
                        x: cxs[1] - colW / 2, y: dTop, width: colW, height: dH,
                        ...(p.isFc && cfg.isMaterial(p)
                            ? { fill: `url(#${good(p.varAbs, p) ? cfg.patGood : cfg.patBad})`, stroke: dCol, "stroke-width": 1 }
                            : { fill: dCol })
                    }, g);
                    this.el("line", {
                        x1: cxs[0] + colW / 2, y1: byBottom - hOf(p.basis), x2: cxs[1] - colW / 2, y2: byBottom - hOf(p.basis),
                        stroke: cfg.subtle, "stroke-width": 1
                    }, g);
                    this.el("line", {
                        x1: cxs[1] + colW / 2, y1: byBottom - hOf(p.value as number), x2: cxs[2] - colW / 2, y2: byBottom - hOf(p.value as number),
                        stroke: cfg.subtle, "stroke-width": 1
                    }, g);
                }
                this.el("rect", {
                    x: cxs[2] - colW / 2, y: byBottom - hOf(p.value as number), width: colW, height: hOf(p.value as number),
                    ...(p.isFc
                        ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                        : { fill: cfg.colors.ac })
                }, g);
                const legF = Math.round(8 * k);
                txt(cxs[0], byBottom + legF + 2, cfg.basisLabel, legF, false, cfg.subtle, "middle");
                txt(cxs[1], byBottom + legF + 2, "Δ", legF, false, cfg.subtle, "middle");
                txt(cxs[2], byBottom + legF + 2, cfg.hasFc && p.isFc ? "FC" : "AC", legF, false, cfg.subtle, "middle");
            };

            // flat layout: wide + short tile → Δ rows and bridge move to the right
            const flat = h < 118 * k && w >= 250 * k;
            if (flat) {
                const blockH = titleF + Math.round(4 * k) + valueF;
                const top = y + Math.max(Math.round(6 * k), (h - blockH) / 2);
                const valueW = valueText.length * valueF * 0.58 + (p.isFc ? 24 * k : 0);
                const titleFull = this.maxTextWidth([p.cat], titleF);
                const leftW = Math.max(valueW, Math.min(titleFull, 170 * k));
                titleValue(top + titleF, top + titleF + Math.round(4 * k) + valueF, leftW);

                let refX = x + pad + leftW + Math.round(20 * k);
                let maxRefW = 0;
                if (p.varAbs != null) { maxRefW = this.maxTextWidth([refText(p.varAbs, p.varRel)], refF); }
                if (p.var2Abs != null) { maxRefW = Math.max(maxRefW, this.maxTextWidth([refText(p.var2Abs, p.var2Rel)], refF)); }
                const hasRow2 = p.var2Abs != null && h >= 52 * k;
                if (p.varAbs != null && refX + refF * 2.6 + maxRefW <= x + w - pad) {
                    const yMid = y + h / 2;
                    if (hasRow2) {
                        refRowAt(refX, yMid - Math.round(2 * k), cfg.basisLabel, p.varAbs, p.varRel);
                        refRowAt(refX, yMid + refF + Math.round(4 * k), cfg.basis2Label, p.var2Abs, p.var2Rel);
                    } else {
                        refRowAt(refX, yMid + refF * 0.35, cfg.basisLabel, p.varAbs, p.varRel);
                    }
                    refX += refF * 2.6 + maxRefW + Math.round(24 * k);
                }
                // bridge on the right edge when there is still room for it
                const bw2 = Math.min(170 * k, x + w - pad - refX);
                const bh2 = Math.min(Math.round(34 * k), h - Math.round(12 * k) - legRoom);
                if (p.basis != null && bw2 >= 100 * k && bh2 >= 18 * k) {
                    const byBottom = y + (h - legRoom + bh2) / 2;
                    drawBridge(x + w - pad - bw2, byBottom, bw2, bh2);
                }
            } else {
                let yCur = y + pad + titleF;
                titleValue(yCur, yCur + valueF + Math.round(4 * k), w - pad * 2);
                yCur += valueF + Math.round(4 * k) + refF + Math.round(9 * k);
                if (p.varAbs != null && yCur <= y + h - 4) {
                    refRowAt(x + pad, yCur, cfg.basisLabel, p.varAbs, p.varRel);
                    yCur += refF + Math.round(5 * k);
                }
                if (p.var2Abs != null && h >= 118 * k && yCur <= y + h - 4) {
                    refRowAt(x + pad, yCur, cfg.basis2Label, p.var2Abs, p.var2Rel);
                    yCur += refF + Math.round(5 * k);
                }
                const bridgeH = Math.round(40 * k);
                if (p.basis != null && h - (yCur - y) >= bridgeH + pad + legRoom && w >= 150 * k) {
                    const bw2 = Math.min(w - pad * 2, 190 * k);
                    drawBridge(x + pad, y + h - pad - legRoom, bw2, bridgeH);
                }
            }

            // comment marker number, if present
            if (p.commentNo != null) {
                txt(x + w - pad, y + pad + titleF, this.circledNo(p.commentNo),
                    Math.round(10 * k), false, cfg.subtle, "end");
            }

            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });
    }

    /**
     * Pareto (structure): AC columns sorted descending plus the cumulative share as
     * a line with markers, an 80 % reference and a marker at the category where the
     * cumulative share crosses it — works on Category + AC alone.
     */
    private renderPareto(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const pts = points.filter(p => p.value != null)
            .slice().sort((a, b) => (b.value as number) - (a.value as number));
        const n = pts.length;
        if (n === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 4;
        const titleH = Math.round(14 * k);

        const catArea = cf + 10;
        const bandStart = region.x + pad + 2;
        const bandEnd = region.x + region.w - pad;
        const rect: Rect = { x: region.x, y: region.y + pad, w: region.w, h: region.h - pad - catArea };
        const labelPad = cfg.showLabels ? lf + 6 : 6;
        const total = pts.reduce((a, p) => a + Math.max(p.value as number, 0), 0);
        const scale = this.makePanelScale(
            [0, cfg.sharedScale ? Math.max(cfg.mainDomain[1], 1) : Math.max(...pts.map(p => p.value as number), 1)],
            rect, "columns", labelPad);
        // own cumulative-% scale sharing the plot area (top padding for the line labels)
        const pctTop = rect.y + titleH + lf + 10;
        const pctBottom = rect.y + rect.h - 2;
        const pctY = (v: number) => pctBottom - (v / 100) * (pctBottom - pctTop);

        const step = (bandEnd - bandStart) / n;
        const slotW = Math.max(2, step * 0.62);
        const pos = (i: number) => bandStart + i * step + (step - slotW) / 2;
        const cx = (i: number) => pos(i) + slotW / 2;

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, "columns", bandStart, bandEnd, "ac", cfg.colors);
        this.drawPanelTitle(bg, rect, "Pareto · AC · kumulierter Anteil", "columns", titleH, region, undefined, cfg.subtle);

        // 80 % reference line
        this.el("line", {
            x1: bandStart, y1: pctY(80), x2: bandEnd, y2: pctY(80),
            stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "5,3"
        }, bg);
        const t80 = this.el("text", {
            x: bandEnd - 2, y: pctY(80) - 3, "text-anchor": "end", "font-size": Math.round(9 * k),
            fill: cfg.subtle, "font-family": FONT
        }, bg);
        t80.textContent = "80 %";

        const marks = this.el("g", {}, this.svg);
        const valueTexts = pts.map(p => cfg.fmt.format(p.value as number));
        const showValueAt = this.labelPredicate(pts, valueTexts, lf, step, "columns");
        const showCatAt = this.labelPredicate(pts, pts.map(p => p.cat), cf, step, "columns");

        let cum = 0;
        let cross = -1;
        let d = "";
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            this.drawBar(g, pos(i), slotW, 0, Math.max(p.value as number, 0), scale, "columns",
                p.isFc
                    ? { fill: `url(#${cfg.patId})`, stroke: cfg.colors.ac, "stroke-width": 1 }
                    : { fill: cfg.colors.ac });
            if (cfg.showLabels && showValueAt(i)) {
                this.drawEndLabelAt(g, cx(i), Math.max(p.value as number, 0), true, scale,
                    "columns", valueTexts[i], lf, cfg.ink, 0, cfg.paper);
            }
            if (showCatAt(i)) {
                this.drawCategoryLabel(g, p.cat, cx(i), "columns", cf, region, step, rect, cfg.ink);
            }
            cum += Math.max(p.value as number, 0) / (total || 1) * 100;
            if (cross < 0 && cum >= 80) { cross = i; }
            d += `${d ? "L" : "M"}${cx(i).toFixed(1)},${pctY(Math.min(cum, 100)).toFixed(1)}`;
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, cx(i), p, scale, "columns", cfg);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });

        // cumulative line + markers + thinned % labels, on top of the bars
        const overlay = this.el("g", {}, this.svg);
        this.el("path", { d, fill: "none", stroke: cfg.ink, "stroke-width": 1.8 }, overlay);
        cum = 0;
        pts.forEach((p, i) => {
            cum += Math.max(p.value as number, 0) / (total || 1) * 100;
            const y = pctY(Math.min(cum, 100));
            this.el("circle", {
                cx: cx(i), cy: y, r: Math.max(2.4, 2.8 * k),
                fill: i === cross ? cfg.ink : cfg.paper, stroke: cfg.ink, "stroke-width": 1.4
            }, overlay);
            // label only when the marker sits clearly above the bar (avoids collisions
            // on the tall leading bars, where the value label already tells the story)
            const barTop = scale(Math.max(p.value as number, 0));
            if (cfg.showLabels && (showValueAt(i) || i === cross) && (y < barTop - lf || i === cross)) {
                const lt = this.el("text", {
                    x: cx(i), y: y - 6, "text-anchor": "middle", "font-size": Math.round(lf * 0.9),
                    fill: i === cross ? cfg.ink : cfg.subtle, "font-family": FONT,
                    "font-weight": i === cross ? 700 : 400,
                    stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                }, overlay);
                lt.textContent = this.fmtPercent(cum).replace("+", "");
            }
        });
        // vertical marker at the 80 % crossing
        if (cross >= 0) {
            this.el("line", {
                x1: cx(cross), y1: pctTop, x2: cx(cross), y2: rect.y + rect.h,
                stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "3,3"
            }, bg);
        }
    }

    /**
     * Dumbbell (structure): basis → AC per category as two dots with a connector in
     * the variance color — reads like "where from, where to" per category.
     */
    private renderDumbbell(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const n = points.length;
        if (n === 0) { return; }
        if (!points.some(p => p.basis != null)) {
            this.drawModeHint(region, cfg, "Dumbbell benötigt PY oder PL als Vergleichsbasis");
            return;
        }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 4;
        const titleH = Math.round(14 * k);

        const catArea = Math.min(region.w * 0.24, this.maxTextWidth(points.map(p => p.cat), cf) + 12);
        const bandStart = region.y + pad + titleH + 4;
        const bandEnd = region.y + region.h - pad;
        const rect: Rect = { x: region.x + pad + catArea, y: region.y, w: region.w - pad * 2 - catArea, h: region.h };
        const labelPad = cfg.showLabels ? lf + 6 : 6;
        const domain: [number, number] = cfg.sharedScale
            ? [cfg.mainDomain[0], cfg.mainDomain[1]]
            : extent(points.flatMap(p => [p.value, p.basis]));
        const scale = this.makePanelScale(domain, rect, "bars", labelPad);

        const step = (bandEnd - bandStart) / n;
        const rowMid = (i: number) => bandStart + i * step + step / 2;
        const r = Math.max(3.5, Math.min(6, step * 0.16)) * Math.min(k, 1.4);

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, "bars", bandStart, bandEnd, "ac", cfg.colors);
        this.drawPanelTitle(bg, rect, `${cfg.basisLabel} ⟶ AC · Dumbbell`, "bars", titleH, region,
            bandStart - 6, cfg.subtle);

        const marks = this.el("g", {}, this.svg);
        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const showCatAt = this.labelPredicate(points, points.map(p => p.cat), cf, step, "bars");
        const showValAt = this.labelPredicate(points,
            points.map(p => p.value != null ? cfg.fmt.format(p.value) : ""), lf, step, "bars");

        points.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const y = rowMid(i);
            const xV = p.value != null ? scale(p.value) : null;
            const xB = p.basis != null ? scale(p.basis) : null;
            if (xV != null && xB != null) {
                const d = (p.value as number) - (p.basis as number);
                this.el("line", {
                    x1: xB, y1: y, x2: xV, y2: y, stroke: colOf(d, p),
                    "stroke-width": Math.max(2.5, r * 0.7), "stroke-linecap": "round"
                }, g);
            }
            if (xB != null) {
                // basis dot in scenario notation: PY solid grey, PL outlined
                this.el("circle", {
                    cx: xB, cy: y, r,
                    ...(cfg.basisMode === "plan"
                        ? { fill: cfg.paper, stroke: cfg.colors.pl, "stroke-width": 1.6 }
                        : { fill: cfg.hc ? cfg.paper : cfg.colors.py, stroke: cfg.colors.py, "stroke-width": 1.2 })
                }, g);
            }
            if (xV != null) {
                this.el("circle", {
                    cx: xV, cy: y, r,
                    fill: p.isFc ? cfg.paper : (cfg.hc ? cfg.ink : cfg.colors.ac),
                    stroke: cfg.colors.ac, "stroke-width": 1.6
                }, g);
                if (cfg.showLabels && showValAt(i)) {
                    const outward = xB == null || xV >= xB;
                    const lt = this.el("text", {
                        x: outward ? xV + r + 4 : xV - r - 4, y: y + lf * 0.35,
                        "text-anchor": outward ? "start" : "end", "font-size": lf, fill: cfg.ink,
                        "font-family": FONT, "font-weight": 600,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, g);
                    lt.textContent = cfg.fmt.format(p.value as number);
                }
            }
            if (showCatAt(i)) {
                this.drawCategoryLabel(g, p.cat, y, "bars", cf, region, step, rect, cfg.ink,
                    cfg.highlight.has(p.cat.toLowerCase()));
            }
            if (p.commentNo != null && p.value != null) {
                this.drawCommentMarker(g, y, p, scale, "bars", cfg);
            }
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });
    }

    /**
     * Slope (before/after): basis on the left axis, AC on the right, one line per
     * category in the variance color — the classic Vorher/Nachher comparison.
     */
    private renderSlope(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const pts = points.filter(p => p.value != null && p.basis != null);
        if (pts.length === 0) {
            this.drawModeHint(region, cfg, "Slope benötigt AC und PY/PL je Kategorie");
            return;
        }
        const k = this.fontK;
        const cf = cfg.catFont;
        const pad = 6;
        const headFont = Math.round(11 * k);

        const x0 = region.x + region.w * 0.30;
        const x1 = region.x + region.w * 0.70;
        const top = region.y + pad + headFont + 10;
        const bottom = region.y + region.h - pad - 6;
        const dom: [number, number] = cfg.sharedScale
            ? [cfg.mainDomain[0], cfg.mainDomain[1]]
            : extentTight(pts.flatMap(p => [p.value, p.basis]));
        const span = (dom[1] - dom[0]) || 1;
        const Y = (v: number) => bottom - ((v - (dom[0] - span * 0.06)) / (span * 1.12)) * (bottom - top);

        const bg = this.el("g", {}, this.svg);
        for (const [x, label] of [[x0, cfg.basisLabel], [x1, "AC"]] as [number, string][]) {
            this.el("line", { x1: x, y1: top - 4, x2: x, y2: bottom, stroke: cfg.subtle, "stroke-width": 1, "stroke-opacity": 0.6 }, bg);
            const ht = this.el("text", {
                x, y: region.y + pad + headFont, "text-anchor": "middle", "font-size": headFont,
                fill: cfg.subtle, "font-family": FONT, "font-weight": 700
            }, bg);
            ht.textContent = label;
        }

        // greedy de-overlap for the side labels: sort by y, push down to a minimum gap
        const gap = cf + 2;
        const place = (ys: number[]): number[] => {
            const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
            let prev = -Infinity;
            const out = new Array(ys.length).fill(0);
            for (const o of order) {
                const y = Math.max(o.y, prev + gap);
                out[o.i] = y;
                prev = y;
            }
            return out;
        };
        const leftY = place(pts.map(p => Y(p.basis as number)));
        const rightY = place(pts.map(p => Y(p.value as number)));

        const goodOf = (v: number, pp?: DataPoint | null) => cfg.isGood(v, pp);
        const colOf = (v: number, pp?: DataPoint) => (v === 0 || (pp != null && !cfg.isMaterial(pp)))
            ? cfg.colors.py : (goodOf(v, pp) ? cfg.colors.good : cfg.colors.bad);
        const marks = this.el("g", {}, this.svg);
        pts.forEach((p, i) => {
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const yB = Y(p.basis as number), yV = Y(p.value as number);
            const d = (p.value as number) - (p.basis as number);
            const c = colOf(d, p);
            this.el("line", {
                x1: x0, y1: yB, x2: x1, y2: yV, stroke: c, "stroke-width": 2,
                ...(p.isFc ? { "stroke-dasharray": "5,4" } : {})
            }, g);
            this.el("circle", { cx: x0, cy: yB, r: 3 * Math.min(k, 1.4), fill: cfg.hc ? cfg.paper : cfg.colors.py, stroke: cfg.colors.py, "stroke-width": 1.2 }, g);
            this.el("circle", { cx: x1, cy: yV, r: 3 * Math.min(k, 1.4), fill: p.isFc ? cfg.paper : cfg.colors.ac, stroke: cfg.colors.ac, "stroke-width": 1.4 }, g);
            const isHl = cfg.highlight.has(p.cat.toLowerCase());
            const lt = this.el("text", {
                x: x0 - 8, y: leftY[i] + cf * 0.35, "text-anchor": "end", "font-size": cf,
                fill: cfg.ink, "font-family": FONT, "font-weight": isHl ? 700 : 400
            }, g);
            lt.textContent = this.truncate(`${p.cat}  ${cfg.fmt.format(p.basis as number)}`, x0 - region.x - 12, cf);
            const rt = this.el("text", {
                x: x1 + 8, y: rightY[i] + cf * 0.35, "text-anchor": "start", "font-size": cf,
                fill: cfg.ink, "font-family": FONT, "font-weight": isHl ? 700 : 400
            }, g);
            rt.textContent = this.truncate(`${cfg.fmt.format(p.value as number)}  ${p.cat}`, region.x + region.w - x1 - 12, cf);
            this.attachInteraction(g, p, cfg);
            this.catGroups.push({ g, sel: p.sel });
            this.animGroups.push([g]);
        });
    }

    /**
     * Stacked columns/bars — field-driven: filling the Stack-Series role stacks AC by
     * series with a legend and total labels. PY/PL/variance panels don't apply here;
     * an empty role leaves the plain chart untouched.
     */
    private renderStacked(points: DataPoint[], region: Rect, cfg: ChartConfig): void {
        const cats: string[] = [];
        const series: string[] = [];
        const cell = new Map<string, DataPoint>();
        for (const p of points) {
            if (!cats.includes(p.cat)) { cats.push(p.cat); }
            const s = p.stackSeries ?? "(leer)";
            if (!series.includes(s)) { series.push(s); }
            const key = `${p.cat}¦${s}`;
            if (!cell.has(key)) { cell.set(key, p); }
        }
        const n = cats.length;
        if (n === 0) { return; }
        const k = this.fontK;
        const lf = cfg.labelFont, cf = cfg.catFont;
        const pad = 4;
        const titleH = Math.round(14 * k);
        const orientation = cfg.orientation;

        // legend row under the panel title
        const legFont = Math.round(10 * k);
        const legendH = legFont + 10;
        const shade = (idx: number): string => {
            // ramp from the AC color towards light grey, first series darkest
            const mix = series.length > 1 ? idx / (series.length - 1) : 0;
            const from = cfg.hc ? [26, 26, 26] : this.hexRgb(cfg.colors.ac);
            const to = [200, 200, 200];
            const c = from.map((f, ci) => Math.round(f + (to[ci] - f) * mix * 0.85));
            return `rgb(${c[0]},${c[1]},${c[2]})`;
        };

        const totals = cats.map(c => series.reduce((a, s) => {
            const p = cell.get(`${c}¦${s}`);
            return a + Math.max(p?.value ?? 0, 0);
        }, 0));
        const domain: [number, number] = [0, Math.max(...totals, 1)];

        let bandStart: number, bandEnd: number, rect: Rect;
        if (orientation === "columns") {
            const catArea = cf + 10;
            bandStart = region.x + pad + 2;
            bandEnd = region.x + region.w - pad;
            rect = { x: region.x, y: region.y + pad + legendH, w: region.w, h: region.h - pad - catArea - legendH };
        } else {
            const catArea = Math.min(region.w * 0.24, this.maxTextWidth(cats, cf) + 12);
            bandStart = region.y + pad + titleH + legendH + 2;
            bandEnd = region.y + region.h - pad;
            rect = { x: region.x + pad + catArea, y: region.y + legendH, w: region.w - pad * 2 - catArea, h: region.h - legendH };
        }
        const labelPad = cfg.showLabels ? lf + 6 : 6;
        const scale = this.makePanelScale(domain, rect, orientation, labelPad);
        const step = (bandEnd - bandStart) / n;
        const slotW = Math.max(2, step * 0.62);
        const pos = (i: number) => bandStart + i * step + (step - slotW) / 2;

        const bg = this.el("g", {}, this.svg);
        this.drawBaseline(bg, rect, scale, orientation, bandStart, bandEnd, "ac", cfg.colors);
        this.drawPanelTitle(bg, rect, "AC · gestapelt", orientation, titleH, region,
            orientation === "bars" ? region.y + legendH + Math.round(10 * k) : undefined, cfg.subtle);

        // legend (top-left, truncating to the region width)
        let lx = region.x + 6;
        const ly = region.y + (orientation === "columns" ? pad + legendH - 4 : legendH - 2);
        for (let si = 0; si < series.length; si++) {
            if (lx > region.x + region.w - 60) { break; }
            this.el("rect", {
                x: lx, y: ly - legFont + 1, width: legFont, height: legFont,
                fill: shade(si), ...(cfg.hc ? { stroke: cfg.ink, "stroke-width": 1 } : {})
            }, bg);
            const st = this.el("text", {
                x: lx + legFont + 4, y: ly, "font-size": legFont, fill: cfg.ink, "font-family": FONT
            }, bg);
            const label = this.truncate(series[si], 120 * k, legFont);
            st.textContent = label;
            lx += legFont + 8 + label.length * legFont * 0.56;
        }

        const marks = this.el("g", {}, this.svg);
        const totalTexts = totals.map(t => cfg.fmt.format(t));
        const fakePts = cats.map((c, i) => ({ cat: c, value: totals[i] } as DataPoint));
        const showTotalAt = this.labelPredicate(fakePts, totalTexts, lf, step, orientation);
        const showCatAt = this.labelPredicate(fakePts, cats, cf, step, orientation);

        cats.forEach((c, i) => {
            const gCat = this.el("g", {}, marks) as SVGGElement;
            let cum = 0;
            series.forEach((s, si) => {
                const p = cell.get(`${c}¦${s}`);
                const v = Math.max(p?.value ?? 0, 0);
                if (v <= 0 || !p) { cum += v; return; }
                const g = this.el("g", { "class": "icd-cat" }, gCat) as SVGGElement;
                this.drawBar(g, pos(i), slotW, cum, cum + v, scale, orientation,
                    { fill: shade(si), ...(cfg.hc ? { stroke: cfg.ink, "stroke-width": 1 } : {}) });
                // segment label when the slice is tall/wide enough
                const a = scale(cum), b = scale(cum + v);
                if (cfg.showLabels && Math.abs(a - b) > lf + 6) {
                    const mid = (a + b) / 2;
                    const light = si > (series.length - 1) / 2;
                    const st = this.el("text", {
                        x: orientation === "columns" ? pos(i) + slotW / 2 : mid,
                        y: orientation === "columns" ? mid + lf * 0.35 : pos(i) + slotW / 2 + lf * 0.35,
                        "text-anchor": "middle", "font-size": Math.round(lf * 0.92),
                        fill: cfg.hc ? cfg.ink : (light ? cfg.ink : cfg.paper), "font-family": FONT
                    }, g);
                    st.textContent = cfg.fmt.format(v);
                }
                this.attachInteraction(g, p, cfg);
                this.catGroups.push({ g, sel: p.sel });
                cum += v;
            });
            // total label at the stack end
            if (cfg.showLabels && showTotalAt(i)) {
                this.drawEndLabelAt(gCat, pos(i) + slotW / 2, totals[i], true, scale,
                    orientation, totalTexts[i], lf, cfg.ink, 0, cfg.paper);
            }
            if (showCatAt(i)) {
                this.drawCategoryLabel(gCat, c, pos(i) + slotW / 2, orientation, cf, region, step, rect, cfg.ink);
            }
            this.animGroups.push([gCat]);
        });
    }

    /** hex "#rrggbb" → [r,g,b] (defaults to dark grey on malformed input) */
    private hexRgb(hex: string): number[] {
        const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
        if (!m) { return [64, 64, 64]; }
        return [0, 2, 4].map(o => parseInt(m[1].slice(o, o + 2), 16));
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
        // with the PY triangle the third column disappears — AC/PL get the full slot back
        const pyAsCol = cfg.hasPy && !cfg.pyTriangle;
        const barW = pyAsCol ? slotW * 0.82 : slotW;
        const pyShift = pyAsCol ? slotW - barW : 0;
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
                if (cfg.pyTriangle) {
                    this.drawPyTriangle(g, pos, slotW, capV(p.py), mainScale, orientation, cfg);
                } else {
                    this.drawBar(g, pos, barW, 0, capV(p.py), mainScale, orientation,
                        cfg.hc
                            ? { fill: cfg.paper, stroke: cfg.colors.py, "stroke-width": 1.2, "stroke-dasharray": "3,2" }
                            : { fill: cfg.colors.py });
                }
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
                    const cand = [p.value];
                    if (!lineMode && p.pl != null) { cand.push(p.pl); }
                    if (!lineMode && p.bm != null) { cand.push(p.bm); }
                    const anchor = capV(p.value >= 0 ? Math.max(...cand) : Math.min(...cand));
                    this.drawEndLabelAt(g, cx, anchor, p.value >= 0, mainScale,
                        orientation, valueTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                    // compact mode: variance becomes a colored second label at the bar end
                    if (compact && p.varAbs != null) {
                        const good = cfg.isGood(p.varAbs, p);
                        const vColor = (p.varAbs === 0 || !cfg.isMaterial(p))
                            ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
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
                    const good = cfg.isGood(bTo - bFrom, p);
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
                const good = cfg.isGood(p.varAbs, p);
                const mat = cfg.isMaterial(p);
                const color = (p.varAbs === 0 || !mat) ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = barW; // IBCS: same width as the base bars
                const vx = cx - vw / 2;
                const hollowBad = cfg.hc && !good && p.varAbs !== 0;
                this.drawBar(g, vx, vw, 0, p.varAbs, absScale, orientation,
                    hollowBad
                        ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                        : p.isFc && mat
                            ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                            : { fill: color });
                if (cfg.showLabels && showAbsAt(i)) {
                    this.drawEndLabel(g, vx + vw / 2, p.varAbs, absScale, orientation,
                        absTexts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }

            // relative variance pins
            if (panels.rel && relScale && p.varRel != null) {
                const good = cfg.isGood(p.varRel, p);
                const color = (p.varRel === 0 || !cfg.isMaterial(p))
                    ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
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
                    const flip = orientation === "columns" && p.varRel > 0 && panels.rel != null
                        && this.collidesPanelTitle(c, relTexts[i], cfg.labelFont,
                            relScale(p.varRel) - (r + 3) - cfg.labelFont,
                            panels.rel.y, region.x, `Δ${cfg.basisLabel} %`);
                    this.drawEndLabelAt(g, c, p.varRel, p.varRel >= 0 && !flip, relScale, orientation,
                        relTexts[i], cfg.labelFont, cfg.ink, r + 3, cfg.paper);
                }
            }

            // second-basis variance: bars + pins (dual variance)
            if (panels.abs2 && abs2Scale && p.var2Abs != null) {
                const good = cfg.isGood(p.var2Abs, p);
                const mat = cfg.isMaterial(p, p.var2Abs, p.var2Rel);
                const color = (p.var2Abs === 0 || !mat) ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = barW; // IBCS: same width as the base bars
                const vx = cx - vw / 2;
                const hollowBad = cfg.hc && !good && p.var2Abs !== 0;
                this.drawBar(g, vx, vw, 0, p.var2Abs, abs2Scale, orientation,
                    hollowBad
                        ? { fill: cfg.paper, stroke: color, "stroke-width": 1.4 }
                        : p.isFc && mat
                            ? { fill: `url(#${good ? cfg.patGood : cfg.patBad})`, stroke: color, "stroke-width": 1 }
                            : { fill: color });
                if (cfg.showLabels && showAbs2At(i)) {
                    this.drawEndLabel(g, cx, p.var2Abs, abs2Scale, orientation,
                        abs2Texts[i], cfg.labelFont, cfg.ink, 0, cfg.paper);
                }
            }
            if (panels.rel2 && rel2Scale && p.var2Rel != null) {
                const good = cfg.isGood(p.var2Rel, p);
                const color = (p.var2Rel === 0 || !cfg.isMaterial(p, p.var2Abs, p.var2Rel))
                    ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
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
                    const flip = orientation === "columns" && p.var2Rel > 0 && panels.rel2 != null
                        && this.collidesPanelTitle(cx, rel2Texts[i], cfg.labelFont,
                            rel2Scale(p.var2Rel) - (r + 3) - cfg.labelFont,
                            panels.rel2.y, region.x, `Δ${cfg.basis2Label} %`);
                    this.drawEndLabelAt(g, cx, p.var2Rel, p.var2Rel >= 0 && !flip, rel2Scale, orientation,
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

        // ------- combo line: second measure over the columns, own zero-anchored scale
        if (cfg.hasLine && orientation === "columns" && !lineMode) {
            const overlay = this.el("g", {}, this.svg);
            const lVals = points.map(p => p.lineVal);
            const lScale = this.makePanelScale(extent(lVals), panels.main, "columns", labelPad);
            const cxOf = (i: number) => slotPos(i) + pyShift + barW / 2;
            let d = "";
            points.forEach((p, i) => {
                if (p.lineVal == null) { return; }
                d += `${d ? "L" : "M"}${cxOf(i).toFixed(1)},${lScale(p.lineVal).toFixed(1)}`;
            });
            this.el("path", { d, fill: "none", stroke: cfg.ink, "stroke-width": 2 }, overlay);
            const lineTexts = points.map(p => p.lineVal != null ? cfg.fmtLine.format(p.lineVal) : "");
            const showLineAt = this.labelPredicate(points, lineTexts, cfg.labelFont, step, "columns");
            points.forEach((p, i) => {
                if (p.lineVal == null) { return; }
                this.el("circle", {
                    cx: cxOf(i), cy: lScale(p.lineVal), r: Math.max(2.6, 3 * this.fontK),
                    fill: cfg.paper, stroke: cfg.ink, "stroke-width": 1.6
                }, overlay);
                if (cfg.showLabels && showLineAt(i)) {
                    const lt = this.el("text", {
                        x: cxOf(i), y: lScale(p.lineVal) - 7, "text-anchor": "middle",
                        "font-size": Math.round(cfg.labelFont * 0.92), fill: cfg.ink, "font-family": FONT,
                        stroke: cfg.paper, "stroke-width": 3, "paint-order": "stroke", "stroke-linejoin": "round"
                    }, overlay);
                    lt.textContent = lineTexts[i];
                }
            });
            // line-measure name at the top right of the main panel (its scale is its own)
            const nt = this.el("text", {
                x: panels.main.x + panels.main.w - 6, y: panels.main.y + Math.round(14 * this.fontK) - 4,
                "text-anchor": "end", "font-size": Math.round(10 * this.fontK), fill: cfg.subtle,
                "font-family": FONT, "font-weight": 600
            }, overlay);
            nt.textContent = this.truncate(`— ${cfg.lineName}`, panels.main.w * 0.5, 10 * this.fontK);
        }

        // ------- reference line behind the marks: dashed target line must not
        // strike through the value labels (they carry the message)
        if (cfg.refLine != null) {
            this.drawRefLine(bg, panels.main, mainScale, orientation, bandStart, bandEnd, cfg);
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
        const good = cfg.isGood(totalVar);
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
        const sortTip = this.el("title", {}, btn);
        sortTip.textContent = cfg.sortByImpact
            ? "Sortierung nach Wirkung aufheben" : "Nach Wirkung sortieren (größter Treiber zuerst)";
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
            const tip = this.el("title", {}, btn);
            tip.textContent = label;
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
                const tip = this.el("title", {}, btn);
                tip.textContent = label;
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
            cfg.basisMode === "plan" ? "PL" : cfg.basisMode === "fcrev" ? "FC Vm" : "PY",
            cfg.basisMode !== "py" && cfg.hasPy ? "PY" : "",
            cfg.basisMode !== "plan" && cfg.hasPl ? "PL" : ""
        ].filter(x => x).join(", ");
        const hasRef = cfg.hasPy || cfg.hasPl || cfg.basisMode === "fcrev";

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
            // points with only one side still move the bridge (new category: Δ = value,
            // discontinued: Δ = −basis) — the end anchor stays the true AC/FC total
            const delta = p.varAbs != null
                ? p.varAbs
                : (p.value != null || p.basis != null) ? (p.value ?? 0) - (p.basis ?? 0) : null;
            if (delta == null) { from.push(null); to.push(null); continue; }
            from.push(cum);
            cum += delta;
            to.push(cum);
            if (p.value != null) {
                if (p.isFc) { fcSum += p.value; } else { acSum += p.value; }
            }
        }
        return { from, to, basisSum, valueSum: cum, acSum, fcSum };
    }

    private cumulate(pts: DataPoint[], basisMode: Basis): DataPoint[] {
        let cv = 0, cpy = 0, cpl = 0, cbm = 0, cfp = 0;
        return pts.map(p => {
            if (p.value != null) { cv += p.value; }
            if (p.py != null) { cpy += p.py; }
            if (p.pl != null) { cpl += p.pl; }
            if (p.bm != null) { cbm += p.bm; }
            if (p.fcPrev != null) { cfp += p.fcPrev; }
            const value = p.value != null ? cv : null;
            const py = p.py != null ? cpy : null;
            const pl = p.pl != null ? cpl : null;
            const fcPrev = p.fcPrev != null ? cfp : null;
            const basis = basisMode === "plan" ? pl : basisMode === "fcrev" ? fcPrev : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            const basis2 = this.basis2Mode === "plan" ? pl : py;
            const var2Abs = (value != null && basis2 != null) ? value - basis2 : null;
            const var2Rel = (var2Abs != null && basis2 != null && basis2 !== 0)
                ? (var2Abs / Math.abs(basis2)) * 100 : null;
            return {
                ...p,
                ac: p.isFc ? null : value,
                fc: p.isFc ? value : null,
                value, py, pl, fcPrev, basis, varAbs, varRel, var2Abs, var2Rel,
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
        const basis2Sum = this.basis2Mode === "plan" ? pl : py;
        const var2Abs = (value != null && basis2Sum != null) ? value - basis2Sum : null;
        const var2Rel = (var2Abs != null && basis2Sum != null && basis2Sum !== 0)
            ? (var2Abs / Math.abs(basis2Sum)) * 100 : null;
        const rest: DataPoint = {
            cat: `Rest (${tail.length})`,
            catLevels: null,
            ac, py, pl, fc, value,
            isFc: false, basis, varAbs, varRel, var2Abs, var2Rel,
            bm: sum(tail.map(p => p.bm)),
            fcPrev: sum(tail.map(p => p.fcPrev)),
            lineVal: null, stackSeries: null,
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
            const good = cfg.isGood(sumVar);
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

    private resolveBasisLabel(): Basis {
        // the basis parseData actually used — stored there, so an explicit
        // comparisonMode wins even when PL happens to equal PY
        return this.basisMode;
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

    /**
     * IBCS three-scenario notation: PY as a small grey triangle pointing at the
     * column/bar at previous-year level (like the reference year chart) — right-pointing
     * at the left edge for columns, down-pointing above the bar for bars.
     */
    private drawPyTriangle(parent: SVGElement, slotStart: number, slotW: number, py: number,
        scale: Scale, orientation: Orientation, cfg: ChartConfig): void {
        const s = Math.max(4.5, Math.min(9, slotW * 0.3)) * Math.min(this.fontK, 1.6);
        const v = scale(py);
        const points = orientation === "columns"
            ? `${slotStart - s},${v - s * 0.8} ${slotStart - s},${v + s * 0.8} ${slotStart},${v}`
            : `${v - s * 0.8},${slotStart - s} ${v + s * 0.8},${slotStart - s} ${v},${slotStart}`;
        this.el("polygon", {
            points,
            fill: cfg.hc ? cfg.paper : cfg.colors.py,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": cfg.hc ? 1.2 : 0.8,
            "stroke-linejoin": "round"
        }, parent);
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

    /** true when a label ABOVE this pin would run into the panel title (top-left corner) */
    private collidesPanelTitle(bandCenter: number, text: string, font: number,
        labelTop: number, panelY: number, regionX: number, title: string): boolean {
        const tF = Math.round(10 * this.fontK);
        const titleRight = regionX + 6 + title.length * tF * 0.66 + 8;
        const titleBottom = panelY + tF + 6;
        return bandCenter - text.length * font * 0.28 < titleRight && labelTop < titleBottom;
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
        g.style.cursor = !allow ? "default" : this.commentEdit ? "text" : "pointer";

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
            // comment capture mode: clicks open the editor instead of cross-filtering
            if (this.commentEdit) {
                this.openCommentEditor(p, e);
                return;
            }
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
            add("FC Vormonat", p.fcPrev);
            if (cfg.bmInChart) { add("Benchmark (BM)", p.bm); }
            if (p.lineVal != null) {
                out.push({ displayName: cfg.lineName, value: cfg.fmtLine.format(p.lineVal) });
            }
            if (p.stackSeries != null) {
                out.push({ displayName: "Serie", value: p.stackSeries });
            }
            if (p.varAbs != null) {
                out.push({ displayName: `Δ${cfg.basisLabel}`, value: this.fmtSigned(cfg.fmtVar, p.varAbs) });
            }
            add(`Δ${cfg.basisLabel} %`, p.varRel, true, true);
            if (p.var2Abs != null) {
                out.push({ displayName: `Δ${cfg.basis2Label}`, value: this.fmtSigned(cfg.fmtVar, p.var2Abs) });
            }
            add(`Δ${cfg.basis2Label} %`, p.var2Rel, true, true);
            if (!cfg.isMaterial(p)) {
                out.push({ displayName: "Wesentlichkeit", value: "unter Schwelle — grau dargestellt" });
            }
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

    // ------------------------------------------------- user comments (in-chart)

    /** parses the persisted commentsPanel.userComments JSON store */
    private readUserComments(dataView: DataView | undefined): Map<string, string> {
        const raw = dataView?.metadata?.objects?.["commentsPanel"]?.["userComments"];
        const map = new Map<string, string>();
        if (typeof raw === "string" && raw.trim() !== "") {
            try {
                const obj = JSON.parse(raw) as Record<string, string>;
                for (const key of Object.keys(obj)) {
                    const v = obj[key];
                    if (typeof v === "string" && v.trim() !== "") { map.set(key, v); }
                }
            } catch { /* corrupt store: start clean rather than fail the visual */ }
        }
        return map;
    }

    private commentKey(p: DataPoint): string {
        return `${p.group ?? ""}¦${p.cat}`;
    }

    private persistUserComments(): void {
        const obj: Record<string, string> = {};
        this.userComments.forEach((v, k) => { obj[k] = v; });
        const json = JSON.stringify(obj);
        this.pendingCommentsJson = json;
        this.host.persistProperties({
            merge: [{
                objectName: "commentsPanel", selector: null,
                properties: { userComments: json }
            }]
        });
    }

    private closeCommentEditor(): void {
        if (this.commentEditor) {
            this.commentEditor.remove();
            this.commentEditor = null;
        }
    }

    /** small HTML editor next to the clicked category; saving persists into the report */
    private openCommentEditor(p: DataPoint, e: MouseEvent): void {
        this.closeCommentEditor();
        const key = this.commentKey(p);
        const rootRect = this.root.getBoundingClientRect();
        if (window.getComputedStyle(this.root).position === "static") {
            this.root.style.position = "relative";
        }
        const boxW = 250, boxH = 132;
        const left = Math.max(2, Math.min(e.clientX - rootRect.left, rootRect.width - boxW - 4));
        const top = Math.max(2, Math.min(e.clientY - rootRect.top, rootRect.height - boxH - 4));

        const box = document.createElement("div");
        this.commentEditor = box;
        box.style.cssText = `position:absolute;left:${left}px;top:${top}px;z-index:10;`
            + `width:${boxW}px;box-sizing:border-box;background:#FFFFFF;color:#252423;`
            + "border:1px solid #8A8A8A;border-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,0.25);"
            + "padding:8px;font-family:'Segoe UI',sans-serif;font-size:12px;";
        box.addEventListener("click", ev => ev.stopPropagation());
        box.addEventListener("contextmenu", ev => ev.stopPropagation());

        const title = document.createElement("div");
        title.style.cssText = "font-weight:600;margin-bottom:5px;white-space:nowrap;"
            + "overflow:hidden;text-overflow:ellipsis;";
        title.textContent = `✎ ${p.group != null ? `${p.group} · ` : ""}${p.cat}`;
        box.appendChild(title);

        const ta = document.createElement("textarea");
        ta.rows = 3;
        ta.style.cssText = "width:100%;box-sizing:border-box;resize:vertical;"
            + "font-family:inherit;font-size:12px;padding:4px;";
        ta.value = this.userComments.get(key) ?? "";
        ta.addEventListener("keydown", ev => {
            ev.stopPropagation();
            if (ev.key === "Escape") { this.closeCommentEditor(); }
            if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { save(); }
        });
        box.appendChild(ta);

        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:6px;margin-top:6px;justify-content:flex-end;";
        const mkBtn = (label: string, primary: boolean, onClick: () => void) => {
            const b = document.createElement("button");
            b.textContent = label;
            b.style.cssText = "font-size:12px;padding:3px 10px;cursor:pointer;border-radius:3px;"
                + (primary
                    ? "background:#252423;color:#FFFFFF;border:1px solid #252423;"
                    : "background:#FFFFFF;color:#252423;border:1px solid #8A8A8A;");
            b.addEventListener("click", ev => { ev.stopPropagation(); onClick(); });
            row.appendChild(b);
        };
        const save = () => {
            const text = ta.value.trim();
            if (text) { this.userComments.set(key, text); }
            else { this.userComments.delete(key); }
            this.closeCommentEditor();
            this.persistUserComments();
        };
        if (this.userComments.has(key)) {
            mkBtn("Löschen", false, () => {
                this.userComments.delete(key);
                this.closeCommentEditor();
                this.persistUserComments();
            });
        }
        mkBtn("Abbrechen", false, () => this.closeCommentEditor());
        mkBtn("Speichern", true, save);
        box.appendChild(row);

        this.root.appendChild(box);
        ta.focus();
    }

    /** small dark pill top-right announcing an active click mode (comment/compare) */
    private drawModeChip(xRight: number, text: string, cfg: ChartConfig): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(10 * k);
        const w = Math.round(text.length * font * 0.62) + Math.round(16 * k);
        const g = this.el("g", {}, this.svg);
        this.el("rect", {
            x: xRight - w, y: 6, width: w, height: bh, rx: bh / 2,
            fill: cfg.hc ? cfg.paper : cfg.colors.ac,
            stroke: cfg.hc ? cfg.ink : "none", "stroke-width": cfg.hc ? 1.2 : 0
        }, g);
        const t = this.el("text", {
            x: xRight - w / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.hc ? cfg.ink : cfg.paper, "font-family": FONT, "font-weight": 600
        }, g);
        t.textContent = text;
        const tip = this.el("title", {}, g);
        tip.textContent = text.startsWith("✎")
            ? "Kommentar-Modus aktiv: Klick auf eine Kategorie öffnet den Editor (ausschalten unter Kommentare → Kommentare im Chart erfassen)"
            : "Vergleichs-Modus aktiv: zwei Elemente anklicken zeigt die Differenz, Klick ins Leere setzt zurück";
    }

    /** YTD chip top-right: persists chart.cumulative so end users can flip the view */
    private drawCumButton(xRight: number, cfg: ChartConfig): void {
        const k = this.fontK;
        const bh = Math.round(18 * k), font = Math.round(11 * k);
        const segW = Math.round(38 * k);
        const x = xRight - segW;
        const btn = this.el("g", { tabindex: "0", role: "button" }, this.svg) as SVGGElement;
        btn.setAttribute("aria-label", cfg.cumulative
            ? "Kumulierte Sicht (YTD) ausschalten" : "Kumulierte Sicht (YTD) einschalten");
        const cumTip = this.el("title", {}, btn);
        cumTip.textContent = cfg.cumulative
            ? "Kumulierte Sicht (YTD) ausschalten" : "Kumulierte Sicht (YTD) einschalten";
        this.el("rect", {
            x, y: 6, width: segW, height: bh, rx: bh / 2,
            fill: cfg.cumulative ? cfg.colors.ac : cfg.paper,
            stroke: cfg.hc ? cfg.ink : cfg.subtle, "stroke-width": 1
        }, btn);
        const t = this.el("text", {
            x: x + segW / 2, y: 6 + bh / 2 + font * 0.36, "text-anchor": "middle",
            "font-size": font, fill: cfg.cumulative ? cfg.paper : cfg.ink, "font-family": FONT
        }, btn);
        t.textContent = "YTD";
        btn.style.cursor = "pointer";
        const toggle = () => {
            this.host.persistProperties({
                merge: [{
                    objectName: "chart", selector: null,
                    properties: { cumulative: !cfg.cumulative }
                }]
            });
        };
        btn.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); toggle(); });
        btn.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key !== "Enter" && e.key !== " ") { return; }
            e.preventDefault(); e.stopPropagation(); toggle();
        });
    }
}
