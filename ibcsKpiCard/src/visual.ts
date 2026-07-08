/*
 *  IBCS KPI Card — KPI tile with a mini bridge (basis → Δ → AC) for Power BI
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

interface Datum {
    name: string;
    ac: number | null;
    py: number | null;
    pl: number | null;
    sel: ISelectionId | null;
}

interface CardConfig {
    title: string;
    periodLabel: string;
    basis: Basis;
    showBridge: boolean;
    showSecondary: boolean;
    invert: boolean;
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
        this.root.style.cssText = "width:100%;height:100%;overflow:auto;box-sizing:border-box";
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
        const cat = dataView?.categorical?.categories?.find(c => c.source.roles?.["category"]);
        const values = dataView?.categorical?.values;
        if (!values || values.length === 0) { return []; }

        const byRole = (role: string) => values.find(v => v.source.roles?.[role]);
        const acCol = byRole("ac"), pyCol = byRole("py"), plCol = byRole("pl");
        if (!acCol) { return []; }
        this.measureFormat = acCol.source.format;
        this.measureName = acCol.source.displayName;
        const num = (col: powerbi.DataViewValueColumn | undefined, i: number): number | null => {
            const v = col ? col.values[i] : null;
            return typeof v === "number" && isFinite(v) ? v : null;
        };

        if (cat && cat.values.length > 0) {
            return cat.values.map((v, i) => ({
                name: v == null ? "(leer)" : String(v),
                ac: num(acCol, i), py: num(pyCol, i), pl: num(plCol, i),
                sel: this.host.createSelectionIdBuilder().withCategory(cat, i).createSelectionId()
            }));
        }
        return [{ name: "", ac: num(acCol, 0), py: num(pyCol, 0), pl: num(plCol, 0), sel: null }];
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
            hint.textContent = "Keine Daten — Actual (AC) zuweisen, optional PY/PL und Category.";
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
            periodLabel: (s.displayCard.periodLabel.value || "").trim(),
            basis,
            showBridge: s.displayCard.showBridge.value,
            showSecondary: s.displayCard.showSecondary.value && hasPl && hasPy,
            invert: s.displayCard.invert.value,
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

        // single card: scale with the viewport; grid: scale with the tile width
        if (this.data.length === 1 && this.data[0].sel == null) {
            const scale = Math.max(0.7, Math.min(2.6, Math.min(width / 460, height / 150))) * fontK;
            const wrap = document.createElement("div");
            wrap.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:8px";
            wrap.appendChild(this.buildCard(this.data[0], cfg, scale, false));
            this.root.replaceChildren(wrap);
            return;
        }

        const minTile = Math.max(140, Math.round((s.displayCard.minTileWidth.value ?? 240) * fontK));
        const tileScale = Math.max(0.55, Math.min(1.4, minTile / 380));
        const grid = document.createElement("div");
        grid.style.cssText = `display:grid;grid-template-columns:repeat(auto-fill,minmax(${minTile}px,1fr));gap:10px;width:100%;box-sizing:border-box;padding:4px`;
        for (const d of this.data) {
            const el = this.buildCard(d, cfg, tileScale, true);
            grid.appendChild(el);
            this.tiles.push({ datum: d, el });
        }
        this.root.replaceChildren(grid);
        this.syncSelection();
    }

    /** one KPI card: header, big AC + Δ pill, reference row(s), mini bridge */
    private buildCard(d: Datum, cfg: CardConfig, k: number, isTile: boolean): HTMLElement {
        const px = (v: number) => `${Math.round(v * k * 10) / 10}px`;
        const basisVal = cfg.basis === "plan" ? d.pl : d.py;
        const basisLabel = cfg.basis === "plan" ? "PL" : "PY";
        const otherVal = cfg.basis === "plan" ? d.py : d.pl;
        const otherLabel = cfg.basis === "plan" ? "PY" : "PL";
        const ac = d.ac ?? 0;
        const dAbs = basisVal != null ? ac - basisVal : null;
        const dPct = dAbs != null && basisVal !== 0 && basisVal != null
            ? (dAbs / Math.abs(basisVal)) * 100 : null;
        const good = dAbs == null ? true : (cfg.invert ? dAbs < 0 : dAbs >= 0);
        const vColor = dAbs == null || dAbs === 0 ? cfg.subtle : (good ? cfg.good : cfg.bad);

        const card = document.createElement("div");
        card.style.cssText =
            `position:relative;display:flex;align-items:center;gap:${px(14)};box-sizing:border-box;` +
            `background:${cfg.paper};border:1px solid ${cfg.hc ? cfg.ink : "#e4e2de"};border-radius:${px(8)};` +
            `padding:${px(14)} ${px(16)} ${px(14)} ${px(18)};font-family:${FONT};color:${cfg.ink};` +
            (isTile ? "cursor:pointer;" : "") + "overflow:hidden";
        // left accent bar in variance color
        const accent = document.createElement("div");
        accent.style.cssText = `position:absolute;left:0;top:0;bottom:0;width:${px(4)};background:${vColor}`;
        card.appendChild(accent);

        const main = document.createElement("div");
        main.style.cssText = "flex:1;min-width:0";

        // header: title (category name on tiles) + period
        const head = document.createElement("div");
        head.style.cssText = `display:flex;justify-content:space-between;gap:${px(8)};` +
            `font-size:${px(11)};letter-spacing:0.06em;text-transform:uppercase;color:${cfg.subtle};white-space:nowrap`;
        const ht = document.createElement("div");
        ht.style.cssText = "overflow:hidden;text-overflow:ellipsis";
        ht.textContent = isTile && d.name ? d.name : cfg.title;
        head.appendChild(ht);
        if (cfg.periodLabel) {
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
            pill.textContent = `${dAbs != null && dAbs >= 0 ? "▲" : "▼"} ${this.fmtPercent(dPct)}`;
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
            const dv = document.createElement("div");
            dv.style.cssText = `font-weight:700;color:${dd === 0 ? cfg.subtle : (g ? cfg.good : cfg.bad)}`;
            dv.textContent = this.fmtSigned(cfg.fmtVar, dd);
            r.appendChild(dv);
            main.appendChild(r);
        };
        if (basisVal != null) { refRow(basisLabel, basisVal, true); }
        if (cfg.showSecondary && otherVal != null) { refRow(otherLabel, otherVal, false); }
        card.appendChild(main);

        // mini bridge: basis | Δ | AC — IBCS styles, negative-safe
        if (cfg.showBridge && basisVal != null && d.ac != null) {
            card.appendChild(this.buildBridge(d.ac, basisVal, basisLabel, vColor, cfg, k));
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

    /** mini bridge: three columns basis → Δ → AC with connectors and a baseline */
    private buildBridge(ac: number, basisVal: number, basisLabel: string,
        vColor: string, cfg: CardConfig, k: number): HTMLElement {
        const px = (v: number) => `${Math.round(v * k * 10) / 10}px`;
        const W = 150, H = 104, baseY = 86, maxH = 72;
        const wrap = document.createElement("div");
        wrap.style.cssText = `position:relative;width:${px(W)};height:${px(H)};flex-shrink:0`;
        const div = (style: string, text?: string) => {
            const el = document.createElement("div");
            el.style.cssText = "position:absolute;" + style;
            if (text !== undefined) { el.textContent = text; }
            wrap.appendChild(el);
        };
        // negative-safe scale over the magnitudes
        const S = maxH / Math.max(Math.abs(ac), Math.abs(basisVal), 1);
        const hB = Math.round(Math.abs(basisVal) * S);
        const hA = Math.round(Math.abs(ac) * S);
        const topB = baseY - hB, topA = baseY - hA;
        const dTop = Math.min(topB, topA);
        const dH = Math.max(4, Math.abs(topB - topA));

        // baseline
        div(`left:0;top:${px(baseY)};width:${px(W)};height:1px;background:${cfg.faint}`);
        // basis column: PY solid grey / PL outlined (IBCS)
        const basisStyle = basisLabel === "PL"
            ? `background:${cfg.paper};border:1.5px solid ${cfg.ink};box-sizing:border-box`
            : `background:${cfg.hc ? cfg.paper : "#c9c7c3"};${cfg.hc ? `border:1px dashed ${cfg.ink};box-sizing:border-box` : ""}`;
        div(`left:0;top:${px(topB)};width:${px(40)};height:${px(hB)};${basisStyle};border-radius:${px(2)} ${px(2)} 0 0`);
        // connectors
        div(`left:${px(40)};top:${px(topB)};width:${px(15)};height:1px;background:${cfg.faint}`);
        div(`left:${px(95)};top:${px(topA)};width:${px(15)};height:1px;background:${cfg.faint}`);
        // Δ float
        div(`left:${px(55)};top:${px(dTop)};width:${px(40)};height:${px(dH)};background:${vColor};border-radius:${px(2)}`);
        // AC column (solid dark)
        div(`left:${px(110)};top:${px(topA)};width:${px(40)};height:${px(hA)};background:${cfg.hc ? cfg.ink : "#1a1a1a"};border-radius:${px(2)} ${px(2)} 0 0`);
        // labels
        div(`left:0;top:${px(92)};width:${px(40)};text-align:center;font-size:${px(10)};color:${cfg.subtle}`, basisLabel);
        div(`left:${px(55)};top:${px(92)};width:${px(40)};text-align:center;font-size:${px(10)};font-weight:700;color:${vColor}`, "Δ");
        div(`left:${px(110)};top:${px(92)};width:${px(40)};text-align:center;font-size:${px(10)};font-weight:700;color:${cfg.ink}`, "AC");
        return wrap;
    }

    private tooltipItems(d: Datum, cfg: CardConfig): VisualTooltipDataItem[] {
        const items: VisualTooltipDataItem[] = [];
        const name = d.name || cfg.title;
        if (d.ac != null) { items.push({ displayName: "AC", value: cfg.fmt.format(d.ac), header: name }); }
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
