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
    /** small-multiples group label, null when the multiples role is empty */
    group: string | null;
    /** waterfall row type: 'sum' | 'delta' | null */
    rowType: string | null;
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
    patGood: string;
    patBad: string;
    fmt: IValueFormatter;
    /** formatter scaled to the variance magnitudes (auto units) */
    fmtVar: IValueFormatter;
    hasPy: boolean;
    hasPl: boolean;
    hasFc: boolean;
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
    private measureName: string | undefined;
    /** shared waterfall domain across small-multiples cells (IBCS same scale) */
    private sharedWfDomain: [number, number] | null = null;
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
        const catCols = dataView?.categorical?.categories;
        // with drilldown, "expand all" delivers several category-role columns (one per level)
        const catLevels = catCols?.filter(c => c.source.roles?.["category"]) ?? [];
        const cat = catLevels[0];
        const mult = catCols?.find(c => c.source.roles?.["multiples"]);
        const rowTypeCol = catCols?.find(c => c.source.roles?.["rowType"]);
        const fcFlagCol = catCols?.find(c => c.source.roles?.["fcFlag"]);
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
        if (!byRole["actual"] && !byRole["forecast"]) { return null; }

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
            const comment = comments ? comments[i] : null;
            let selBuilder = this.host.createSelectionIdBuilder();
            for (const level of catLevels) { selBuilder = selBuilder.withCategory(level, i); }
            if (mult) { selBuilder = selBuilder.withCategory(mult, i); }
            points.push({
                cat: catLevels.map(level => this.categoryLabel(level.values[i])).join(" · "),
                ac, py, pl, fc, value, isFc, basis, varAbs, varRel,
                comment,
                commentNo: comment != null ? ++commentCounter : null,
                group: mult ? this.categoryLabel(mult.values[i]) : null,
                rowType: rowTypeCol && rowTypeCol.values[i] != null
                    ? String(rowTypeCol.values[i]).toLowerCase() : null,
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
        const orientationRaw = String(s.chartCard.orientation.value.value);
        const isWaterfall = orientationRaw === "waterfall";
        const lineMode = orientationRaw === "line";
        const orientation: Orientation = orientationRaw === "bars" ? "bars" : "columns";

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
            labelFont: s.labelsCard.fontSize.value,
            catFont: s.categoryAxisCard.fontSize.value,
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
            basisMode,
            basisLabel: basisMode === "plan" ? "PL" : "PY",
            showAbs: s.chartCard.showAbsoluteVariance.value && hasVar,
            showRel: s.chartCard.showRelativeVariance.value && points.some(p => p.varRel != null),
            showTotal: s.chartCard.showTotal.value,
            patId: `icd-hatch-${this.instanceId}`,
            patGood: `icd-hatch-good-${this.instanceId}`,
            patBad: `icd-hatch-bad-${this.instanceId}`,
            fmt: this.makeFormatter(maxAbs, allInt),
            fmtVar: this.makeFormatter(maxVarAbs, allVarInt),
            hasPy: points.some(p => p.py != null),
            hasPl: points.some(p => p.pl != null),
            hasFc: points.some(p => p.isFc)
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
            main: extent(points.flatMap(p => [p.value, p.py, p.pl, p.fc])),
            abs: extent(points.map(p => p.varAbs)),
            rel: extent(points.map(p => p.varRel))
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
        if (cfg.refLine != null) {
            domains.main = [Math.min(domains.main[0], cfg.refLine), Math.max(domains.main[1], cfg.refLine)];
            if (this.sharedWfDomain) { this.sharedWfDomain = domains.main; }
        }

        const renderCell = (grp: { name: string | null; pts: DataPoint[] }, region: Rect) => {
            if (isWaterfall) {
                this.renderWaterfall(wfByGroup.get(grp.name) || [], region, cfg);
                return;
            }
            this.renderChart(grp.pts, region, cfg, domains);
        };
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

        // grid layout for small multiples: keep cells at a usable width
        const MAX_CELLS = 24;
        const shown = groups.slice(0, MAX_CELLS);
        const n = shown.length;
        let cols = Math.ceil(Math.sqrt(n));
        cols = Math.max(1, Math.min(cols, Math.floor(width / 220) || 1));
        const rows = Math.ceil(n / cols);
        const cellW = width / cols;
        const cellH = availH / rows;
        const groupTitleH = 16;

        for (let gi = 0; gi < n; gi++) {
            const cx = (gi % cols) * cellW;
            const cy = topOffset + Math.floor(gi / cols) * cellH;
            let title = shown[gi].name ?? "";
            if (gi === n - 1 && groups.length > n) {
                title += `  (+${groups.length - n} weitere)`;
            }
            const t = this.el("text", {
                x: cx + 6, y: cy + 12, "font-size": 11, fill: cfg.ink,
                "font-family": FONT, "font-weight": 600
            }, this.svg);
            t.textContent = this.truncate(title, cellW - 12, 11);
            renderCell(shown[gi],
                { x: cx + 2, y: cy + groupTitleH, w: cellW - 4, h: cellH - groupTitleH - 2 });
        }
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
        const titleH = 14;
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

    /** renders one complete IBCS chart (base + variance panels) into the given region */
    private renderChart(points: DataPoint[], region: Rect, cfg: ChartConfig, domains: Domains): void {
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
        const mainScale = this.makePanelScale(domains.main, panels.main, orientation, compactLabelPad);
        const absScale = panels.abs
            ? this.makePanelScale(domains.abs, panels.abs, orientation, labelPad) : null;
        const relScale = panels.rel
            ? this.makePanelScale(domains.rel, panels.rel, orientation, labelPad) : null;

        // ------- background layer: baselines + panel titles
        const bg = this.el("g", {}, this.svg);
        const scenarioTitle = (cfg.cumulative ? "YTD · " : "")
            + ["AC", cfg.hasPy ? "PY" : "", cfg.hasPl ? "PL" : "",
                cfg.hasFc ? "FC" : ""].filter(x => x).join(" · ");

        // AC -> FC boundary (time series with a forecast tail)
        let fcBoundary: number | null = null;
        if (orientation === "columns" && cfg.hasFc) {
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

        // ------- total (Σ) header
        if (showTotal) {
            this.drawTotalHeader(bg, region, points, cfg);
        }

        // ------- AC → FC boundary separator (time series only)
        if (fcBoundary != null) {
            const yTop = Math.min(panels.main.y,
                panels.abs ? panels.abs.y : Infinity,
                panels.rel ? panels.rel.y : Infinity);
            const yBot = panels.main.y + panels.main.h;
            this.el("line", {
                x1: fcBoundary, y1: yTop + 2, x2: fcBoundary, y2: yBot,
                stroke: cfg.subtle, "stroke-width": 1, "stroke-dasharray": "3,3"
            }, bg);
        }

        // ------- highlight bands (IBCS EMPHASIZE): shaded slot background
        if (cfg.highlight.size > 0) {
            const hlTop = Math.min(panels.main.y,
                panels.abs ? panels.abs.y : Infinity,
                panels.rel ? panels.rel.y : Infinity) + 2;
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

        // ------- category groups with all marks
        const marks = this.el("g", {}, this.svg);
        for (let i = 0; i < n; i++) {
            const p = points[i];
            const g = this.el("g", { "class": "icd-cat" }, marks) as SVGGElement;
            const pos = slotPos(i);
            const cx = lineMode ? pos + slotW / 2 : pos + pyShift + barW / 2;

            // base chart: PY behind, PL outline, AC/FC on top
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
            if (p.value != null) {
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

            // absolute variance bars
            if (panels.abs && absScale && p.varAbs != null) {
                const good = cfg.invert ? p.varAbs < 0 : p.varAbs > 0;
                const color = p.varAbs === 0 ? cfg.colors.py : (good ? cfg.colors.good : cfg.colors.bad);
                const vw = slotW * 0.55;
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

        // ------- reference line on top of the marks (thin, dashed)
        if (cfg.refLine != null) {
            const overlay = this.el("g", {}, this.svg);
            this.drawRefLine(overlay, panels.main, mainScale, orientation, bandStart, bandEnd, cfg);
        }
    }

    /**
     * IBCS title block: "KPI in Unit · Period: AC, FC vs. PL" plus optional
     * message line (IBCS SAY). Returns the consumed height.
     */
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

        const t = this.el("text", {
            x: 6, y: 14, "font-size": 12, "font-family": FONT, fill: cfg.ink
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

        const message = (s.message.value || "").trim();
        if (message) {
            const m = this.el("text", {
                x: 6, y: 30, "font-size": 11, "font-family": FONT,
                fill: cfg.ink, "font-style": "italic"
            }, this.svg);
            m.textContent = this.truncate(message, width - 12, 11);
            return 38;
        }
        return 22;
    }

    /** running YTD totals for value/PY/PL with variances recomputed on the cumulated numbers */
    private cumulate(pts: DataPoint[], basisMode: Basis): DataPoint[] {
        let cv = 0, cpy = 0, cpl = 0;
        return pts.map(p => {
            if (p.value != null) { cv += p.value; }
            if (p.py != null) { cpy += p.py; }
            if (p.pl != null) { cpl += p.pl; }
            const value = p.value != null ? cv : null;
            const py = p.py != null ? cpy : null;
            const pl = p.pl != null ? cpl : null;
            const basis = basisMode === "plan" ? pl : py;
            const varAbs = (value != null && basis != null) ? value - basis : null;
            const varRel = (varAbs != null && basis != null && basis !== 0)
                ? (varAbs / Math.abs(basis)) * 100 : null;
            return {
                ...p,
                ac: p.isFc ? null : value,
                fc: p.isFc ? value : null,
                value, py, pl, basis, varAbs, varRel
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
        const rest: DataPoint = {
            cat: `Rest (${tail.length})`,
            ac, py, pl, fc, value,
            isFc: false, basis, varAbs, varRel,
            comment: null, commentNo: null,
            group: head.length > 0 ? head[0].group : null,
            rowType: null,
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
        const v = parseFloat(raw);
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
        const attrs = orientation === "columns"
            ? { x: region.x + 6, y: rect.y + titleH - 4 }
            : { x: rect.x + 2, y: barsTitleY ?? (region.y + 12) };
        const t = this.el("text", {
            ...attrs, "font-size": 10, fill: color,
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
        g.style.cursor = "pointer";

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
            if (!p.sel) { return; }
            this.selectionManager.select(p.sel, e.ctrlKey || e.metaKey).then((ids: ISelectionId[]) => {
                this.applySelectionOpacity(ids);
            });
        });

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
