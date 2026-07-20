/*
 *  IBCS KPI Card — KPI tile with a mini bridge (basis → Δ → AC) for Power BI
 *  © 2026 Michael Tenner · PowerBI Kitchen — MIT License (see LICENSE in the repo root):
 *  free to use and modify, keep this author notice.
 *
 *  v2: rebuilt from the v1.1 prototype with the chart-deck learnings:
 *    - PL support + variance basis Auto/PY/PL, second reference row
 *    - locale-aware number formatting from the measure format string,
 *      auto display units (k/M/B) + decimals — readable big numbers
 *    - font size presets (Kompakt / Full HD / Präsentation) on top of
 *      the size-responsive auto scaling
 *    - invert for cost KPIs, negative-safe mini bridge, IBCS notation
 *      (PY grey, PL outlined, AC solid dark)
 *    - native tooltips, high-contrast mode, keyboard focus
 *  v2.2:
 *    - Trend role → sparkline per card (AC solid, FC dashed, PY thin grey)
 *    - FC role: fills missing AC (AC+FC), hatched share in the bridge
 *    - tile sorting (Δ absolut / Δ % / AC), neutral tolerance zone (Ampel),
 *      compact stages for narrow tiles
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

const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";

type Basis = "py" | "plan";

/** one period of the optional trend series */
interface TrendPoint {
    label: string;
    v: number | null;
    py: number | null;
    isFc: boolean;
}

interface Datum {
    name: string;
    /** display value: AC, with FC filling missing periods (AC+FC) */
    ac: number | null;
    /** solid AC share of `ac` (rest is forecast) */
    acOnly: number;
    /** FC share of `ac` */
    fcPart: number;
    py: number | null;
    pl: number | null;
    /** per-period series when the Trend role is bound */
    series: TrendPoint[] | null;
    sel: ISelectionId | null;
}

interface CardConfig {
    title: string;
    titleSize: number;
    periodLabel: string;
    basis: Basis;
    showBridge: boolean;
    bridgeHorizontal: boolean;
    showSparkline: boolean;
    showSecondary: boolean;
    invert: boolean;
    /** neutral tolerance zone in ±% — inside it variances stay grey (0 = off) */
    tolerance: number;
    good: string;
    bad: string;
    ink: string;
    paper: string;
    subtle: string;
    faint: string;
    hc: boolean;
    fmt: IValueFormatter;
    fmtVar: IValueFormatter;
}

export class Visual implements IVisual {
    private events: IVisualEventService;
    private host: IVisualHost;
    private root: HTMLElement;
    private selectionManager: ISelectionManager;
    private tooltipService: ITooltipService;
    private formattingSettings: VisualFormattingSettingsModel;
    private formattingSettingsService: FormattingSettingsService;
    private data: Datum[] = [];
    private tiles: { datum: Datum; el: HTMLElement }[] = [];
    private measureFormat: string | undefined;
    private measureName: string | undefined;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService(
            options.host.createLocalizationManager());
        this.selectionManager = options.host.createSelectionManager();
        this.tooltipService = options.host.tooltipService;
        this.root = options.element;
        // append, don't replace: cssText would wipe the host's own sizing styles
        this.root.style.overflow = "auto";
        this.root.style.boxSizing = "border-box";
        this.root.addEventListener("click", (e: MouseEvent) => {
            if (e.target !== this.root) { return; }
            this.selectionManager.clear().then(() => this.syncSelection());
        });
        this.selectionManager.registerOnSelectCallback(() => this.syncSelection());
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView: DataView | undefined = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService
                .populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
            this.data = this.parseData(dataView);
            this.render(options.viewport.width, options.viewport.height);
            this.events.renderingFinished(options);
        } catch (error) {
            this.events.renderingFailed(options, String(error));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    // ------------------------------------------------------------------ data

    private parseData(dataView: DataView | undefined): Datum[] {
        const cats = dataView?.categorical?.categories;
        const catCol = cats?.find(c => c.source.roles?.["category"]);
        const trendCol = cats?.find(c => c.source.roles?.["trend"]);
        const values = dataView?.categorical?.values;
        if (!values || values.length === 0) { return []; }

        const byRole = (role: string) => values.find(v => v.source.roles?.[role]);
        const acCol = byRole("ac"), pyCol = byRole("py"), plCol = byRole("pl"), fcCol = byRole("fc");
        if (!acCol && !fcCol) { return []; }
        this.measureFormat = acCol?.source.format ?? fcCol?.source.format;
        this.measureName = acCol?.source.displayName ?? fcCol?.source.displayName;
        const num = (col: powerbi.DataViewValueColumn | undefined, i: number): number | null => {
            const v = col ? col.values[i] : null;
            return typeof v === "number" && isFinite(v) ? v : null;
        };
        const rowCount = (catCol ?? trendCol)?.values.length ?? 1;

        // aggregate rows into one datum per category (order of appearance);
        // with a trend column each datum also collects its per-period series
        const makeDatum = (name: string, sel: ISelectionId | null): Datum => ({
            name, ac: null, acOnly: 0, fcPart: 0, py: null, pl: null,
            series: trendCol ? [] : null, sel
        });
        const order: Datum[] = [];
        const index = new Map<string, Datum>();
        for (let i = 0; i < rowCount; i++) {
            const key = catCol ? (catCol.values[i] == null ? "(leer)" : String(catCol.values[i])) : "";
            let d = index.get(key);
            if (!d) {
                const sel = catCol
                    ? this.host.createSelectionIdBuilder().withCategory(catCol, i).createSelectionId()
                    : null;
                d = makeDatum(key, sel);
                index.set(key, d);
                order.push(d);
            }
            const acV = num(acCol, i), fcV = num(fcCol, i);
            const v = acV != null ? acV : fcV;
            const isFc = acV == null && fcV != null;
            if (v != null) {
                d.ac = (d.ac ?? 0) + v;
                if (isFc) { d.fcPart += v; } else { d.acOnly += v; }
            }
            const pyV = num(pyCol, i), plV = num(plCol, i);
            if (pyV != null) { d.py = (d.py ?? 0) + pyV; }
            if (plV != null) { d.pl = (d.pl ?? 0) + plV; }
            if (d.series) {
                d.series.push({
                    label: trendCol && trendCol.values[i] != null ? String(trendCol.values[i]) : "",
                    v, py: pyV, isFc
                });
            }
        }
        return order;
    }

    // ------------------------------------------------------------ formatting

    private makeFormatter(maxAbs: number): IValueFormatter {
        const s = this.formattingSettings.labelsCard;
        const decimals = Math.max(0, Math.min(3, s.decimals.value ?? 1));
        const unit = String(s.displayUnits.value.value);
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
        const allInt = this.data.every(d =>
            [d.ac, d.py, d.pl].every(v => v == null || Number.isInteger(v)));
        return valueFormatter.create({
            format: this.measureFormat,
            value: unitValue,
            precision: unitValue === 0 && allInt ? 0 : decimals,
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
        return sign + nf.format(Math.abs(v)) + " %";
    }

    // ---------------------------------------------------------------- render

    private render(width: number, height: number): void {
        this.tiles = [];
        if (this.data.length === 0 || this.data.every(d => d.ac == null)) {
            const hint = document.createElement("div");
            hint.style.cssText = `font-family:${FONT};color:#8a8886;padding:16px;font-size:12px`;
            hint.textContent = "Keine Daten — Actual (AC) zuweisen, optional PY/PL/FC, Category und Trend.";
            this.root.replaceChildren(hint);
            return;
        }

        const s = this.formattingSettings;
        const palette = this.host.colorPalette as powerbi.extensibility.ISandboxExtendedColorPalette;
        const hc = !!(palette && palette.isHighContrast);
        const ink = hc ? palette.foreground.value : "#1a1a1a";
        const paper = hc ? palette.background.value : "#ffffff";

        const hasPl = this.data.some(d => d.pl != null);
        const hasPy = this.data.some(d => d.py != null);
        const mode = String(s.displayCard.comparisonMode.value.value);
        const basis: Basis = mode === "py" ? "py" : mode === "plan" ? "plan" : (hasPl ? "plan" : "py");

        const maxAbs = Math.max(...this.data.map(d =>
            Math.max(Math.abs(d.ac ?? 0), Math.abs(d.py ?? 0), Math.abs(d.pl ?? 0))), 0);
        const maxVar = Math.max(...this.data.map(d => {
            const b = basis === "plan" ? d.pl : d.py;
            return d.ac != null && b != null ? Math.abs(d.ac - b) : 0;
        }), 0);

        const cfg: CardConfig = {
            title: (s.displayCard.title.value || this.measureName || "KPI").trim(),
            titleSize: Math.max(8, Math.min(40, s.displayCard.titleSize.value ?? 11)),
            periodLabel: (s.displayCard.periodLabel.value || "").trim(),
            basis,
            showBridge: s.displayCard.showBridge.value,
            bridgeHorizontal: String(s.displayCard.bridgeOrientation.value.value) === "bars",
            showSparkline: s.displayCard.showSparkline.value && this.data.some(d => (d.series?.length ?? 0) > 1),
            showSecondary: s.displayCard.showSecondary.value && hasPl && hasPy,
            invert: s.displayCard.invert.value,
            tolerance: Math.max(0, s.displayCard.tolerance.value ?? 0),
            good: hc ? ink : s.colorsCard.goodColor.value.value,
            bad: hc ? ink : s.colorsCard.badColor.value.value,
            ink, paper, hc,
            subtle: hc ? ink : "#8a8886",
            faint: hc ? ink : "#c9c7c3",
            fmt: this.makeFormatter(maxAbs),
            fmtVar: this.makeFormatter(maxVar)
        };
        const fontK = { compact: 1, fullhd: 1.5, presentation: 2 }[
            String(s.labelsCard.fontPreset.value.value)] ?? 1;

        // auto period label: first – last trend period when no label is configured
        if (!cfg.periodLabel) {
            const withSeries = this.data.find(d => (d.series?.length ?? 0) > 1);
            const labels = withSeries?.series?.map(p => p.label).filter(l => l) ?? [];
            if (labels.length > 1) { cfg.periodLabel = `${labels[0]} – ${labels[labels.length - 1]}`; }
        }

        // in-chart toolbar: ΔPY|ΔPL basis switch + ⇅ tile sort, persisted like the deck
        const isGrid = !(this.data.length === 1 && this.data[0].sel == null);
        const sortMode = String(s.displayCard.sortTiles.value.value);
        const toolbar = s.displayCard.chartButtons.value && (hasPy && hasPl || isGrid)
            ? this.buildToolbar(cfg, hasPy && hasPl, isGrid, sortMode, fontK)
            : null;

        // single card: scale with the viewport; grid: scale with the tile width
        if (!isGrid) {
            const scale = Math.max(0.7, Math.min(2.6, Math.min(width / 460, height / 150))) * fontK;
            const wrap = document.createElement("div");
            wrap.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:8px";
            wrap.appendChild(this.buildCard(this.data[0], cfg, scale, false, width / scale));
            this.root.replaceChildren(...(toolbar ? [toolbar, wrap] : [wrap]));
            return;
        }

        // tile sort: original / by |Δ| / by Δ% / by AC (largest first)
        let tilesData = this.data;
        if (sortMode !== "orig") {
            const basisOf = (d: Datum) => cfg.basis === "plan" ? d.pl : d.py;
            const key = (d: Datum): number => {
                const b = basisOf(d);
                if (sortMode === "ac") { return d.ac ?? -Infinity; }
                if (d.ac == null || b == null) { return -Infinity; }
                const dd = d.ac - b;
                return sortMode === "pct"
                    ? (b !== 0 ? Math.abs(dd / b) : 0)
                    : Math.abs(dd);
            };
            tilesData = [...this.data]
                .map((d, i) => ({ d, i }))
                .sort((a, b) => (key(b.d) - key(a.d)) || (a.i - b.i))
                .map(x => x.d);
        }

        const minTile = Math.max(140, Math.round((s.displayCard.minTileWidth.value ?? 240) * fontK));
        const gap = 10;
        const cols = Math.max(1, Math.floor((width - 8 + gap) / (minTile + gap)));
        const tileW = (width - 8 - gap * (cols - 1)) / cols;
        const tileScale = Math.max(0.55, Math.min(1.4, minTile / 380));
        const grid = document.createElement("div");
        grid.style.cssText = `display:grid;grid-template-columns:repeat(auto-fill,minmax(${minTile}px,1fr));gap:${gap}px;width:100%;box-sizing:border-box;padding:4px`;
        for (const d of tilesData) {
            const el = this.buildCard(d, cfg, tileScale, true, tileW / tileScale);
            grid.appendChild(el);
            this.tiles.push({ datum: d, el });
        }
        this.root.replaceChildren(...(toolbar ? [toolbar, grid] : [grid]));
        this.syncSelection();
    }

    /**
     * in-chart toolbar (sticky top-right): ΔPY|ΔPL segmented basis switch and the
     * ⇅ sort toggle (orig ↔ Δ absolut). Both persist their format-pane property via
     * the host, so the end user's choice survives re-renders, bookmarks and reloads.
     */
    private buildToolbar(cfg: CardConfig, showRef: boolean, showSort: boolean,
        sortMode: string, fontK: number): HTMLElement {
        const k = fontK;
        const px = (v: number) => `${Math.round(v * k)}px`;
        const bar = document.createElement("div");
        bar.style.cssText = "position:sticky;top:0;text-align:right;z-index:5;pointer-events:none";
        const inner = document.createElement("div");
        inner.style.cssText = `display:inline-flex;gap:${px(6)};padding:${px(4)} ${px(6)} ${px(4)} 0;pointer-events:auto`;
        bar.appendChild(inner);
        const persist = (properties: Record<string, unknown>) => {
            this.host.persistProperties({ merge: [{ objectName: "display", selector: null, properties }] });
        };
        const btnBase = `font-family:${FONT};font-size:${px(11)};line-height:${px(18)};height:${px(20)};` +
            `padding:0 ${px(8)};border:1px solid ${cfg.hc ? cfg.ink : "#c9c7c3"};cursor:pointer;box-sizing:border-box`;
        const mkBtn = (text: string, active: boolean, label: string, radius: string,
            onClick: () => void): HTMLElement => {
            const b = document.createElement("button");
            b.style.cssText = btnBase + `;background:${active ? cfg.ink : cfg.paper};` +
                `color:${active ? cfg.paper : cfg.ink};border-radius:${radius}`;
            b.textContent = text;
            b.setAttribute("aria-label", label);
            b.addEventListener("click", (e: MouseEvent) => { e.stopPropagation(); onClick(); });
            return b;
        };
        if (showRef) {
            const seg = document.createElement("div");
            seg.style.cssText = "display:inline-flex";
            const py = mkBtn("ΔPY", cfg.basis === "py", "Abweichungsbasis: Vorjahr (PY)",
                `${px(10)} 0 0 ${px(10)}`, () => persist({ comparisonMode: "py" }));
            const pl = mkBtn("ΔPL", cfg.basis === "plan", "Abweichungsbasis: Plan (PL)",
                `0 ${px(10)} ${px(10)} 0`, () => persist({ comparisonMode: "plan" }));
            pl.style.borderLeft = "none";
            seg.appendChild(py); seg.appendChild(pl);
            inner.appendChild(seg);
        }
        if (showSort) {
            const active = sortMode !== "orig";
            inner.appendChild(mkBtn("⇅", active,
                active ? "Sortierung zurücksetzen (Datenreihenfolge)" : "Nach Abweichung sortieren (größte zuerst)",
                px(10), () => persist({ sortTiles: active ? "orig" : "delta" })));
        }
        return bar;
    }

    /**
     * one KPI card: header, big AC + Δ pill, reference row(s), mini bridge and/or
     * sparkline. `availW` is the card width in unscaled units — drives the compact
     * stages: < 340 drops bridge/sparkline, < 210 also drops the reference rows.
     */
    private buildCard(d: Datum, cfg: CardConfig, k: number, isTile: boolean, availW: number): HTMLElement {
        const px = (v: number) => `${Math.round(v * k * 10) / 10}px`;
        const compact = availW < 340;
        const ultra = availW < 210;
        const basisVal = cfg.basis === "plan" ? d.pl : d.py;
        const basisLabel = cfg.basis === "plan" ? "PL" : "PY";
        const otherVal = cfg.basis === "plan" ? d.py : d.pl;
        const otherLabel = cfg.basis === "plan" ? "PY" : "PL";
        const ac = d.ac ?? 0;
        const dAbs = basisVal != null ? ac - basisVal : null;
        const dPct = dAbs != null && basisVal !== 0 && basisVal != null
            ? (dAbs / Math.abs(basisVal)) * 100 : null;
        // neutral tolerance zone (Ampel): inside ±N % the variance stays grey
        const neutral = cfg.tolerance > 0 && dPct != null && Math.abs(dPct) <= cfg.tolerance;
        const good = dAbs == null ? true : (cfg.invert ? dAbs < 0 : dAbs >= 0);
        const vColor = dAbs == null || dAbs === 0 || neutral
            ? cfg.subtle : (good ? cfg.good : cfg.bad);

        const card = document.createElement("div");
        card.style.cssText =
            `position:relative;display:flex;align-items:center;gap:${px(12)};box-sizing:border-box;` +
            `background:${cfg.paper};border:1px solid ${cfg.hc ? cfg.ink : "#e4e2de"};border-radius:${px(8)};` +
            `padding:${px(12)} ${px(14)} ${px(12)} ${px(16)};font-family:${FONT};color:${cfg.ink};` +
            (isTile ? "cursor:pointer;" : "") + "overflow:hidden";
        const accent = document.createElement("div");
        accent.style.cssText = `position:absolute;left:0;top:0;bottom:0;width:${px(4)};background:${vColor}`;
        card.appendChild(accent);

        const main = document.createElement("div");
        main.style.cssText = "flex:1;min-width:0";

        // header: title (category name on tiles) + period
        const head = document.createElement("div");
        head.style.cssText = `display:flex;justify-content:space-between;gap:${px(8)};` +
            `font-size:${px(cfg.titleSize)};letter-spacing:0.06em;text-transform:uppercase;color:${cfg.subtle};white-space:nowrap`;
        const ht = document.createElement("div");
        ht.style.cssText = "overflow:hidden;text-overflow:ellipsis";
        ht.textContent = isTile && d.name ? d.name : cfg.title;
        head.appendChild(ht);
        if (cfg.periodLabel && !ultra) {
            const hp = document.createElement("div");
            hp.textContent = cfg.periodLabel;
            head.appendChild(hp);
        }
        main.appendChild(head);

        // value row: big AC + Δ% pill
        const row = document.createElement("div");
        row.style.cssText = `display:flex;align-items:baseline;gap:${px(10)};margin-top:${px(3)}`;
        const big = document.createElement("div");
        big.style.cssText = `font-size:${px(26)};font-weight:700;letter-spacing:-0.01em;` +
            "font-variant-numeric:tabular-nums;white-space:nowrap";
        big.textContent = d.ac != null ? cfg.fmt.format(d.ac) : "–";
        row.appendChild(big);
        if (dPct != null) {
            const pill = document.createElement("div");
            pill.style.cssText = cfg.hc
                ? `font-size:${px(12)};font-weight:700;color:${cfg.ink};border:1px solid ${cfg.ink};` +
                `padding:${px(2)} ${px(7)};border-radius:99px;white-space:nowrap`
                : `font-size:${px(12)};font-weight:700;color:#ffffff;background:${vColor};` +
                `padding:${px(2)} ${px(7)};border-radius:99px;white-space:nowrap`;
            pill.textContent = neutral
                ? `● ${this.fmtPercent(dPct)}`
                : `${dAbs != null && dAbs >= 0 ? "▲" : "▼"} ${this.fmtPercent(dPct)}`;
            row.appendChild(pill);
        }
        main.appendChild(row);

        // reference rows: primary basis, then the other one
        const refRow = (label: string, val: number, emphasized: boolean) => {
            const r = document.createElement("div");
            r.style.cssText = `display:flex;gap:${px(12)};margin-top:${px(emphasized ? 8 : 3)};` +
                `font-size:${px(12)};font-variant-numeric:tabular-nums;white-space:nowrap`;
            const lv = document.createElement("div");
            lv.style.color = cfg.subtle;
            lv.textContent = `${label} ${cfg.fmt.format(val)}`;
            r.appendChild(lv);
            const dd = ac - val;
            const g = cfg.invert ? dd < 0 : dd >= 0;
            const pct = val !== 0 ? (dd / Math.abs(val)) * 100 : null;
            const isNeutral = cfg.tolerance > 0 && pct != null && Math.abs(pct) <= cfg.tolerance;
            const dv = document.createElement("div");
            dv.style.cssText = `font-weight:700;color:${dd === 0 || isNeutral ? cfg.subtle : (g ? cfg.good : cfg.bad)}`;
            dv.textContent = this.fmtSigned(cfg.fmtVar, dd);
            r.appendChild(dv);
            main.appendChild(r);
        };
        if (!ultra && basisVal != null) { refRow(basisLabel, basisVal, true); }
        if (!ultra && cfg.showSecondary && otherVal != null) { refRow(otherLabel, otherVal, false); }
        card.appendChild(main);

        // right side: sparkline and/or mini bridge (dropped in compact tiles)
        if (!compact && cfg.showSparkline && (d.series?.length ?? 0) > 1) {
            card.appendChild(this.buildSparkline(d.series as TrendPoint[], vColor, cfg, k));
        }
        const roomForBoth = availW >= 460;
        if (!compact && cfg.showBridge && basisVal != null && d.ac != null
            && (roomForBoth || !cfg.showSparkline || (d.series?.length ?? 0) <= 1)) {
            card.appendChild(this.buildBridge(d, basisVal, basisLabel, vColor, cfg, k));
        }

        // interaction: crossfilter + context menu + tooltip
        if (isTile && d.sel) {
            card.addEventListener("click", (e: MouseEvent) => {
                if (!this.host.hostCapabilities.allowInteractions) { return; }
                e.stopPropagation();
                this.selectionManager.select(d.sel as ISelectionId, e.ctrlKey || e.metaKey)
                    .then(() => this.syncSelection());
            });
            card.addEventListener("contextmenu", (e: MouseEvent) => {
                e.preventDefault(); e.stopPropagation();
                if (!this.host.hostCapabilities.allowInteractions) { return; }
                this.selectionManager.showContextMenu(d.sel, { x: e.clientX, y: e.clientY });
            });
            card.tabIndex = 0;
            card.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key !== "Enter" && e.key !== " ") { return; }
                e.preventDefault();
                this.selectionManager.select(d.sel as ISelectionId, e.ctrlKey || e.metaKey)
                    .then(() => this.syncSelection());
            });
        }
        card.addEventListener("mousemove", (e: MouseEvent) => {
            const items = this.tooltipItems(d, cfg);
            if (items.length === 0) { return; }
            this.tooltipService.show({
                coordinates: [e.clientX, e.clientY], isTouchEvent: false,
                dataItems: items, identities: d.sel ? [d.sel] : []
            });
        });
        card.addEventListener("mouseleave", () => this.tooltipService.hide({ immediately: false, isTouchEvent: false }));
        return card;
    }

    /** sparkline: AC solid (FC periods dashed), PY thin grey — SVG, negative-safe */
    private buildSparkline(series: TrendPoint[], vColor: string, cfg: CardConfig, k: number): HTMLElement {
        const W = 130, H = 104, padY = 14;
        const wrap = document.createElement("div");
        wrap.style.cssText = `position:relative;width:${Math.round(W * k)}px;height:${Math.round(H * k)}px;flex-shrink:0`;
        const NS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", String(Math.round(W * k)));
        svg.setAttribute("height", String(Math.round(H * k)));
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        wrap.appendChild(svg);

        const vals: number[] = [];
        for (const p of series) {
            if (p.v != null) { vals.push(p.v); }
            if (p.py != null) { vals.push(p.py); }
        }
        if (vals.length === 0) { return wrap; }
        let mn = Math.min(...vals, 0), mx = Math.max(...vals, 0);
        if (mn === mx) { mx = mn + 1; }
        const X = (i: number) => 4 + i * ((W - 8) / Math.max(series.length - 1, 1));
        const Y = (v: number) => H - padY - ((v - mn) / (mx - mn)) * (H - padY * 2);

        const path = (acc: (p: TrendPoint) => number | null, stroke: string, width: number,
            dashWhenFc: boolean) => {
            let dSolid = "", dDash = "";
            let prev: { x: number; y: number; fc: boolean } | null = null;
            series.forEach((p, i) => {
                const v = acc(p);
                if (v == null) { prev = null; return; }
                const pt = { x: X(i), y: Y(v), fc: p.isFc };
                if (prev) {
                    const seg = `M${prev.x.toFixed(1)},${prev.y.toFixed(1)}L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                    if (dashWhenFc && (prev.fc || pt.fc)) { dDash += seg; } else { dSolid += seg; }
                }
                prev = pt;
            });
            const mk = (dd: string, dashed: boolean) => {
                if (!dd) { return; }
                const el = document.createElementNS(NS, "path");
                el.setAttribute("d", dd);
                el.setAttribute("fill", "none");
                el.setAttribute("stroke", stroke);
                el.setAttribute("stroke-width", String(width));
                if (dashed) { el.setAttribute("stroke-dasharray", "4,3"); }
                svg.appendChild(el);
            };
            mk(dSolid, false);
            mk(dDash, true);
        };
        // zero line if the range crosses zero
        if (mn < 0 && mx > 0) {
            const zl = document.createElementNS(NS, "line");
            zl.setAttribute("x1", "2"); zl.setAttribute("x2", String(W - 2));
            zl.setAttribute("y1", Y(0).toFixed(1)); zl.setAttribute("y2", Y(0).toFixed(1));
            zl.setAttribute("stroke", cfg.faint); zl.setAttribute("stroke-width", "1");
            svg.appendChild(zl);
        }
        path(p => p.py, cfg.hc ? cfg.ink : "#c9c7c3", 1.4, false);
        path(p => p.v, cfg.hc ? cfg.ink : "#1a1a1a", 2, true);
        // end-point marker in variance color
        for (let i = series.length - 1; i >= 0; i--) {
            const v = series[i].v;
            if (v == null) { continue; }
            const c = document.createElementNS(NS, "circle");
            c.setAttribute("cx", X(i).toFixed(1));
            c.setAttribute("cy", Y(v).toFixed(1));
            c.setAttribute("r", "3");
            c.setAttribute("fill", series[i].isFc ? cfg.paper : vColor);
            c.setAttribute("stroke", vColor);
            c.setAttribute("stroke-width", "1.6");
            svg.appendChild(c);
            break;
        }
        return wrap;
    }

    /** mini bridge: basis → Δ → AC with connectors and a baseline (columns or bars) */
    private buildBridge(d: Datum, basisVal: number, basisLabel: string,
        vColor: string, cfg: CardConfig, k: number): HTMLElement {
        const ac = d.ac ?? 0;
        const px = (v: number) => `${Math.round(v * k * 10) / 10}px`;
        const wrap = document.createElement("div");
        const div = (style: string, text?: string) => {
            const el = document.createElement("div");
            el.style.cssText = "position:absolute;" + style;
            if (text !== undefined) { el.textContent = text; }
            wrap.appendChild(el);
        };
        // IBCS scenario styles: PY solid grey, PL outlined, AC solid dark (FC hatched)
        const basisStyle = basisLabel === "PL"
            ? `background:${cfg.paper};border:1.5px solid ${cfg.ink};box-sizing:border-box`
            : `background:${cfg.hc ? cfg.paper : "#c9c7c3"};${cfg.hc ? `border:1px dashed ${cfg.ink};box-sizing:border-box` : ""}`;
        const acBg = cfg.hc ? cfg.ink : "#1a1a1a";
        const hatch = `repeating-linear-gradient(45deg,${cfg.paper} 0 3px,${acBg} 3px 5px)`;
        // FC share of the AC column/bar (0..1 of its length)
        const fcFrac = d.ac != null && d.ac !== 0 && d.fcPart > 0
            ? Math.min(1, Math.max(0, d.fcPart / Math.abs(d.ac))) : 0;
        // target marker: the OTHER reference (PL when comparing vs PY, and vice versa)
        // as a tick across the AC column — "über Vorjahr, aber unter Plan?" at a glance
        const otherVal = cfg.basis === "plan" ? d.py : d.pl;
        const otherAbs = otherVal != null ? Math.abs(otherVal) : 0;

        if (cfg.bridgeHorizontal) {
            // three bars below each other: basis on top, Δ floating, AC at the bottom
            const W = 150, H = 104, x0 = 26, maxW = W - x0 - 4;
            wrap.style.cssText = `position:relative;width:${px(W)};height:${px(H)};flex-shrink:0`;
            const S = maxW / Math.max(Math.abs(ac), Math.abs(basisVal), otherAbs, 1);
            const wB = Math.round(Math.abs(basisVal) * S);
            const wA = Math.round(Math.abs(ac) * S);
            const endB = x0 + wB, endA = x0 + wA;
            const dLeft = Math.min(endB, endA);
            const dW = Math.max(4, Math.abs(endB - endA));
            const rowH = 18, yB = 8, yD = 42, yA = 76;
            div(`left:${px(x0)};top:${px(4)};width:1px;height:${px(H - 8)};background:${cfg.faint}`);
            const lbl = `width:${px(x0 - 5)};text-align:right;font-size:${px(10)};line-height:${px(rowH)}`;
            div(`left:0;top:${px(yB)};${lbl};color:${cfg.subtle}`, basisLabel);
            div(`left:0;top:${px(yD)};${lbl};font-weight:700;color:${vColor}`, "Δ");
            div(`left:0;top:${px(yA)};${lbl};font-weight:700;color:${cfg.ink}`, "AC");
            div(`left:${px(x0)};top:${px(yB)};width:${px(wB)};height:${px(rowH)};${basisStyle};border-radius:0 ${px(2)} ${px(2)} 0`);
            div(`left:${px(endB)};top:${px(yB + rowH)};width:1px;height:${px(yD - yB - rowH)};background:${cfg.faint}`);
            div(`left:${px(endA)};top:${px(yD + rowH)};width:1px;height:${px(yA - yD - rowH)};background:${cfg.faint}`);
            div(`left:${px(dLeft)};top:${px(yD)};width:${px(dW)};height:${px(rowH)};background:${vColor};border-radius:${px(2)}`);
            // AC bar: solid part + hatched FC share at the outer end
            const wFc = Math.round(wA * fcFrac);
            div(`left:${px(x0)};top:${px(yA)};width:${px(wA - wFc)};height:${px(rowH)};background:${acBg}`);
            if (wFc > 0) {
                div(`left:${px(x0 + wA - wFc)};top:${px(yA)};width:${px(wFc)};height:${px(rowH)};` +
                    `background:${hatch};border:1px solid ${acBg};box-sizing:border-box;border-radius:0 ${px(2)} ${px(2)} 0`);
            }
            // target tick: the other reference on the AC row
            if (otherVal != null) {
                const xT = x0 + Math.round(otherAbs * S);
                div(`left:${px(xT - 1)};top:${px(yA - 3)};width:${px(2)};height:${px(rowH + 6)};background:${cfg.ink}`);
            }
            return wrap;
        }

        // vertical: three columns next to each other (basis | Δ | AC)
        const W = 150, H = 104, baseY = 86, maxH = 72;
        wrap.style.cssText = `position:relative;width:${px(W)};height:${px(H)};flex-shrink:0`;
        const S = maxH / Math.max(Math.abs(ac), Math.abs(basisVal), otherAbs, 1);
        const hB = Math.round(Math.abs(basisVal) * S);
        const hA = Math.round(Math.abs(ac) * S);
        const topB = baseY - hB, topA = baseY - hA;
        const dTop = Math.min(topB, topA);
        const dH = Math.max(4, Math.abs(topB - topA));

        div(`left:0;top:${px(baseY)};width:${px(W)};height:1px;background:${cfg.faint}`);
        div(`left:0;top:${px(topB)};width:${px(40)};height:${px(hB)};${basisStyle};border-radius:${px(2)} ${px(2)} 0 0`);
        div(`left:${px(40)};top:${px(topB)};width:${px(15)};height:1px;background:${cfg.faint}`);
        div(`left:${px(95)};top:${px(topA)};width:${px(15)};height:1px;background:${cfg.faint}`);
        div(`left:${px(55)};top:${px(dTop)};width:${px(40)};height:${px(dH)};background:${vColor};border-radius:${px(2)}`);
        // AC column: solid part + hatched FC share at the top
        const hFc = Math.round(hA * fcFrac);
        div(`left:${px(110)};top:${px(topA + hFc)};width:${px(40)};height:${px(hA - hFc)};background:${acBg}`);
        if (hFc > 0) {
            div(`left:${px(110)};top:${px(topA)};width:${px(40)};height:${px(hFc)};` +
                `background:${hatch};border:1px solid ${acBg};box-sizing:border-box;border-radius:${px(2)} ${px(2)} 0 0`);
        }
        // target tick: the other reference across the AC column
        if (otherVal != null) {
            const yT = baseY - Math.round(otherAbs * S);
            div(`left:${px(107)};top:${px(yT - 1)};width:${px(46)};height:${px(2)};background:${cfg.ink}`);
        }
        div(`left:0;top:${px(92)};width:${px(40)};text-align:center;font-size:${px(10)};color:${cfg.subtle}`, basisLabel);
        div(`left:${px(55)};top:${px(92)};width:${px(40)};text-align:center;font-size:${px(10)};font-weight:700;color:${vColor}`, "Δ");
        div(`left:${px(110)};top:${px(92)};width:${px(40)};text-align:center;font-size:${px(10)};font-weight:700;color:${cfg.ink}`, "AC");
        return wrap;
    }

    private tooltipItems(d: Datum, cfg: CardConfig): VisualTooltipDataItem[] {
        const items: VisualTooltipDataItem[] = [];
        const name = d.name || cfg.title;
        if (d.ac != null) {
            items.push({
                displayName: d.fcPart > 0 ? "AC+FC" : "AC",
                value: cfg.fmt.format(d.ac), header: name
            });
        }
        if (d.fcPart > 0) {
            items.push({ displayName: "davon FC", value: cfg.fmt.format(d.fcPart), header: name });
        }
        if (d.py != null) { items.push({ displayName: "PY", value: cfg.fmt.format(d.py), header: name }); }
        if (d.pl != null) { items.push({ displayName: "PL", value: cfg.fmt.format(d.pl), header: name }); }
        const basisVal = cfg.basis === "plan" ? d.pl : d.py;
        if (d.ac != null && basisVal != null) {
            const dd = d.ac - basisVal;
            items.push({
                displayName: `Δ${cfg.basis === "plan" ? "PL" : "PY"}`,
                value: `${this.fmtSigned(cfg.fmtVar, dd)}${basisVal !== 0 ? ` (${this.fmtPercent(dd / Math.abs(basisVal) * 100)})` : ""}`,
                header: name
            });
        }
        return items;
    }

    private syncSelection(): void {
        const ids = this.selectionManager.getSelectionIds() as ISelectionId[];
        const any = ids && ids.length > 0;
        for (const { datum, el } of this.tiles) {
            if (!datum.sel) { continue; }
            const on = !any || ids.some(id => id.equals(datum.sel as ISelectionId));
            el.style.opacity = on ? "1" : "0.35";
        }
    }
}
