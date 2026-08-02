/*
 *  P&L Statement byDatenWG — IBCS-inspired GuV visual for Power BI
 *  © 2026 Michael Tenner · PowerBI Kitchen — MIT License (see LICENSE in the repo root):
 *  free to use and modify, keep this author notice.
 *
 *  v0.3: full concept-demo parity — in-visual toolbar (view, column presets,
 *  Δ reference, unit, density, expand level, % of revenue, zero-row hiding),
 *  two period blocks (YTD + FY outlook FC vs PL with hatched Δ bars),
 *  monthly sparklines, comment markers with footnote section, account ids,
 *  waterfall view, uniform Δ scale, documented teal deviation.
 *  Notation based on the IBCS® Standards 1.2 (CC BY-SA 4.0, ibcs.com).
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
import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;

import { VisualFormattingSettingsModel } from "./settings";
import {
    buildModel, flattenVisible, collapseToLevel, variance, displayValue,
    parseRowType, parseBool, parseSign, rowsFromLevels, aggregateMonthly,
    isZeroRow, revenueBase,
    InputRow, LevelInputRow, PnlModel, PnlNode, Scenario,
} from "./engine";
import { renderWaterfall } from "./waterfall";

const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";
const NBSP_GROUP = " "; // narrow space, IBCS number grouping

const C = {
    ac: "#404040", py: "#B3B3B3",
    text: "#1A1A1A", soft: "#8A8886", line: "#404040", gridSoft: "#EDEBE9",
    tealGood: "#0E8585", tealBad: "#E02B1D",
    ibcsGood: "#8CB400", ibcsBad: "#FF2600",
    comment: "#0064FF",
};

type ViewMode = "table" | "waterfall";
type Preset = "full" | "acref" | "acpydpy" | "acpldpl" | "dpct";
type Unit = "auto" | "none" | "k" | "m";
type Density = "normal" | "compact";

interface UiState {
    view: ViewMode;
    preset: Preset;
    ref: Scenario;        // ytd Δ reference (py | pl | fc)
    unit: Unit;
    density: Density;
    pctRev: boolean;
    hideZero: boolean;
    collapsed: string[];
    spark: string[];      // row ids with open sparkline
}

interface ColSpec {
    kind: "val" | "pct" | "bar" | "pin" | "gap";
    scen?: Scenario;      // for val
    ref?: Scenario;       // for bar/pin
    minuend?: Scenario;   // for bar/pin ("ac" | "fcfy")
    label: string;
}

interface Fmt {
    div: number;
    suffix: string;
    val: (v: number | null, plus?: boolean) => string;
    pct: (v: number | null, plus?: boolean) => string;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private formattingSettingsService: FormattingSettingsService;
    private settings: VisualFormattingSettingsModel;

    private root: HTMLElement;
    private model: PnlModel | null = null;
    private has: Record<Scenario, boolean> = { ac: false, py: false, pl: false, fc: false, fcfy: false, plfy: false };
    private comments: { n: number; node: PnlNode; text: string }[] = [];
    private locale = "en-US";

    private ui: UiState | null = null;
    private stateLoaded = false;
    private pendingPersist: string | null = null;
    private lastApplied: string | null = null;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.formattingSettingsService = new FormattingSettingsService();
        this.locale = options.host.locale || "en-US";
        this.root = document.createElement("div");
        this.root.className = "pnl-root";
        this.root.style.cssText =
            `width:100%;height:100%;overflow:auto;background:#FFF;font-family:${FONT};` +
            `color:${C.text};box-sizing:border-box;`;
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel, dataView);
            const parsed = dataView ? this.parseRows(dataView) : null;
            if (!parsed) { this.model = null; this.renderLanding(); this.events.renderingFinished(options); return; }
            if (parsed.rows.length === 0) { this.model = null; this.renderEmpty(); this.events.renderingFinished(options); return; }

            this.model = buildModel(parsed.rows, this.str("Not assigned", "Nicht zugeordnet"), parsed.months);
            if (parsed.truncated) {
                this.model.warnings.push(this.str("row limit (30k) reached", "Zeilenlimit (30k) erreicht"));
            }
            this.has = parsed.has;
            this.syncUiState(dataView);
            this.render();
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, e instanceof Error ? e.message : String(e));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    // ---------------- data ----------------

    private parseRows(dataView: DataView): {
        rows: InputRow[]; months: string[]; truncated: boolean; has: Record<Scenario, boolean>;
    } | null {
        const cat = dataView.categorical;
        if (!cat || !cat.categories || cat.categories.length === 0) { return null; }
        const byRole = (r: string): DataViewCategoryColumn | undefined =>
            cat.categories.find(c => c.source.roles && c.source.roles[r]);
        const measure = (r: string): DataViewValueColumn | undefined =>
            (cat.values || []).find(v => v.source.roles && v.source.roles[r]) as DataViewValueColumn | undefined;

        const idCol = byRole("account");
        const levelCols = cat.categories.filter(c => c.source.roles && c.source.roles["levels"]);
        const acCol = measure("ac");
        if (!acCol || (!idCol && levelCols.length === 0)) { return null; }

        const nameCol = byRole("accountName"); const parentCol = byRole("parent");
        const sortCol = byRole("sortOrder"); const typeCol = byRole("rowType");
        const formulaCol = byRole("formulaDef"); const signCol = byRole("signConvention");
        const dispCol = byRole("displayInvert"); const varCol = byRole("varianceInvert");
        const periodCol = byRole("period"); const commentCol = byRole("comment");
        const pyCol = measure("py"); const plCol = measure("pl"); const fcCol = measure("fc");
        const fcFyCol = measure("fcFy"); const plFyCol = measure("plFy");

        const num = (col: DataViewValueColumn | undefined, i: number): number | null => {
            if (!col) { return null; }
            const v = col.values[i];
            if (v == null) { return null; }
            const n = typeof v === "number" ? v : Number(v);
            return isFinite(n) ? n : null;
        };
        const txt = (col: DataViewCategoryColumn | undefined, i: number): string | null => {
            if (!col) { return null; }
            const v = col.values[i];
            return v == null ? null : String(v);
        };
        const key = (col: DataViewCategoryColumn | undefined, i: number): string | null => {
            const s = txt(col, i);
            if (s == null) { return null; }
            const t = s.trim();
            return t === "" ? null : t;
        };

        const n = (idCol ?? levelCols[0]).values.length;
        const has: Record<Scenario, boolean> = {
            ac: !!acCol, py: !!pyCol, pl: !!plCol, fc: !!fcCol, fcfy: !!fcFyCol, plfy: !!plFyCol,
        };
        const values = (i: number): Partial<Record<Scenario, number | null>> => ({
            ac: num(acCol, i), py: num(pyCol, i), pl: num(plCol, i), fc: num(fcCol, i),
            fcfy: num(fcFyCol, i), plfy: num(plFyCol, i),
        });
        const attrs = (i: number): Pick<LevelInputRow, "rowType" | "formulaDef" | "sign" | "displayInvert" | "varianceInvert" | "comment"> => ({
            rowType: parseRowType(txt(typeCol, i)),
            formulaDef: txt(formulaCol, i),
            sign: signCol ? parseSign(txt(signCol, i)) : 1,
            displayInvert: dispCol ? parseBool(txt(dispCol, i)) : false,
            varianceInvert: varCol ? parseBool(txt(varCol, i)) : false,
            comment: key(commentCol, i),
        });

        if (levelCols.length > 0 && !parentCol) {
            const lrows: LevelInputRow[] = [];
            for (let i = 0; i < n; i++) {
                const sortRaw = Number(txt(sortCol, i) ?? NaN);
                lrows.push({
                    levels: levelCols.map(c => txt(c, i)),
                    account: idCol ? key(idCol, i) : null,
                    name: nameCol ? txt(nameCol, i) : null,
                    sort: isFinite(sortRaw) ? sortRaw : null,
                    ...attrs(i),
                    values: values(i),
                    month: periodCol ? key(periodCol, i) : null,
                    index: i,
                });
            }
            const lr = rowsFromLevels(lrows);
            return { rows: lr.rows, months: lr.months, truncated: n >= 30000, has };
        }
        if (!idCol) { return null; }

        const raw: (InputRow & { month: string | null })[] = [];
        for (let i = 0; i < n; i++) {
            const id = key(idCol, i);
            if (id == null) { continue; }
            const sortRaw = Number(txt(sortCol, i) ?? i);
            raw.push({
                id, parent: key(parentCol, i),
                name: txt(nameCol, i) ?? id,
                sort: isFinite(sortRaw) ? sortRaw : Number.MAX_SAFE_INTEGER,
                ...attrs(i),
                values: values(i),
                month: periodCol ? key(periodCol, i) : null,
                index: i,
            });
        }
        const agg = aggregateMonthly(raw);
        return { rows: agg.rows, months: agg.months, truncated: n >= 30000, has };
    }

    // ---------------- ui state ----------------

    private defaultUi(): UiState {
        const s = this.settings;
        const lvl = s.hierarchyCard.defaultLevel.value;
        return {
            view: "table",
            preset: String(s.columnsCard.preset.value.value) as Preset,
            ref: this.resolveRef(String(s.columnsCard.reference.value.value)),
            unit: String(s.numbersCard.scaling.value.value) as Unit,
            density: String(s.styleCard.density.value.value) as Density,
            pctRev: s.columnsCard.pctRevenue.value,
            hideZero: s.columnsCard.hideZeroRows.value,
            collapsed: this.model && lvl > 0 ? [...collapseToLevel(this.model.roots, lvl)] : [],
            spark: [],
        };
    }

    private resolveRef(pref: string): Scenario {
        if (pref === "py" || pref === "pl" || pref === "fc") { return pref; }
        if (this.has.pl) { return "pl"; }
        if (this.has.py) { return "py"; }
        return "fc";
    }

    private syncUiState(dataView: DataView | undefined): void {
        const persisted = dataView?.metadata?.objects?.["state"]?.["uiState"];
        const str = persisted == null ? null : String(persisted);
        if (this.pendingPersist != null) {
            if (str === this.pendingPersist) { this.lastApplied = str; }
            this.pendingPersist = null;
        }
        if (str != null && str !== this.lastApplied) {
            try {
                this.ui = { ...this.defaultUi(), ...JSON.parse(str) as Partial<UiState> };
                this.lastApplied = str;
                this.stateLoaded = true;
            } catch { /* keep current */ }
        }
        if (!this.stateLoaded || this.ui == null) {
            this.stateLoaded = true;
            this.ui = this.defaultUi();
        }
    }

    private persistUi(): void {
        if (!this.ui) { return; }
        if (this.model) {
            this.ui.collapsed = this.ui.collapsed.filter(id => this.model!.byId.has(id));
            this.ui.spark = this.ui.spark.filter(id => this.model!.byId.has(id));
        }
        const json = JSON.stringify(this.ui);
        this.pendingPersist = json;
        this.lastApplied = json;
        this.host.persistProperties({
            merge: [{ objectName: "state", selector: null, properties: { uiState: json } }],
        });
    }

    // ---------------- formatting ----------------

    private str(en: string, de: string): string {
        return this.locale.toLowerCase().startsWith("de") ? de : en;
    }

    private makeFmt(maxAbs: number): Fmt {
        const u = this.ui!.unit;
        let div = 1; let suffix = "";
        if (u === "k") { div = 1e3; suffix = "k"; }
        else if (u === "m") { div = 1e6; suffix = "m"; }
        else if (u === "auto") {
            if (maxAbs >= 5e7) { div = 1e6; suffix = "m"; }
            else if (maxAbs >= 5e4) { div = 1e3; suffix = "k"; }
        }
        const dec = this.settings.numbersCard.decimals.value;
        const pdec = this.settings.numbersCard.pctDecimals.value;
        const nf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        const pf = new Intl.NumberFormat(this.locale, { minimumFractionDigits: pdec, maximumFractionDigits: pdec });
        const grp = (nfr: Intl.NumberFormat, v: number): string =>
            nfr.formatToParts(v).map(p => (p.type === "group" ? NBSP_GROUP : p.value)).join("");
        return {
            div, suffix,
            val: (v, plus = false) => v == null ? "·" : (plus && v > 0 ? "+" : "") + grp(nf, v / div),
            pct: (v, plus = false) => v == null ? "–" : (plus && v > 0 ? "+" : "") + grp(pf, v * 100) + "%",
        };
    }

    private goodColor(): string {
        return String(this.settings.styleCard.colorMode.value.value) === "ibcs" ? C.ibcsGood : C.tealGood;
    }
    private badColor(): string {
        return String(this.settings.styleCard.colorMode.value.value) === "ibcs" ? C.ibcsBad : C.tealBad;
    }

    private monthLabel(m: string): string {
        const parts = /^(\d{4})-(\d{2})/.exec(m);
        if (!parts) { return m; }
        const d = new Date(Number(parts[1]), Number(parts[2]) - 1, 1);
        return d.toLocaleDateString(this.locale, { month: "short" });
    }

    // ---------------- render entry ----------------

    private renderLanding(): void {
        const box = document.createElement("div");
        box.style.cssText = "padding:22px 26px;max-width:600px;";
        const h = document.createElement("div");
        h.style.cssText = "font-size:15px;font-weight:600;margin-bottom:8px;";
        h.textContent = "P&L Statement byDatenWG";
        const p = document.createElement("div");
        p.style.cssText = `font-size:12px;color:${C.soft};line-height:1.55;`;
        p.textContent = this.str(
            "Add the AC measure plus level columns (L1..Ln, star schema) or Account ID + Parent ID. " +
            "Optional: PY / PL / FC, FY outlook measures (FC/PL full year), period (month) for sparklines, " +
            "row type, formula, sign, comment.",
            "AC-Measure zuweisen plus Ebenen-Spalten (L1..Ln, Sternschema) oder Konto-ID + Parent-ID. " +
            "Optional: PY / PL / FC, FY-Outlook-Measures (FC/PL Gesamtjahr), Periode (Monat) für Sparklines, " +
            "Zeilentyp, Formel, Vorzeichen, Kommentar.");
        box.appendChild(h); box.appendChild(p);
        this.root.replaceChildren(box);
    }

    private renderEmpty(): void {
        const box = document.createElement("div");
        box.style.cssText = `padding:18px 22px;font-size:12px;color:${C.soft};`;
        box.textContent = this.str("No data for the current selection.", "Keine Daten für die aktuelle Auswahl.");
        this.root.replaceChildren(box);
    }

    private rerender(): void { this.render(); }

    private render(): void {
        const model = this.model; const ui = this.ui;
        if (!model || !ui) { return; }
        this.root.replaceChildren();
        this.comments = [];

        // uniform scale basis over ALL rows (stable across expand/collapse)
        let maxAbsVal = 0; let maxAbsDelta = 0;
        const deltaCombos = this.deltaCombos();
        for (const node of model.byId.values()) {
            if (node.row.rowType === "kpi") { continue; }
            for (const s of ["ac", "py", "pl", "fc", "fcfy", "plfy"] as Scenario[]) {
                const v = node.computed[s];
                if (v != null) { maxAbsVal = Math.max(maxAbsVal, Math.abs(v)); }
            }
            for (const dc of deltaCombos) {
                const d = variance(node, dc.ref, dc.minuend).delta;
                if (d != null) { maxAbsDelta = Math.max(maxAbsDelta, Math.abs(d)); }
            }
        }
        const fmt = this.makeFmt(maxAbsVal);

        if (this.settings.titleCard.show.value) { this.root.appendChild(this.buildTitle(fmt)); }
        if (this.settings.toolbarCard.show.value) { this.root.appendChild(this.buildToolbar()); }
        if (this.settings.toolbarCard.showLegend.value) { this.root.appendChild(this.buildLegend()); }

        if (ui.view === "waterfall") {
            this.root.appendChild(this.buildWaterfall(fmt));
        } else {
            this.root.appendChild(this.buildTable(fmt, maxAbsDelta));
        }
        this.buildFootnotes(fmt);
        this.root.appendChild(this.buildFooter());
    }

    /** which Δ combinations the current preset shows (drives the uniform scale) */
    private deltaCombos(): { ref: Scenario; minuend: Scenario }[] {
        const ui = this.ui!;
        const out: { ref: Scenario; minuend: Scenario }[] = [];
        if (ui.preset === "full") {
            if (this.has.py) { out.push({ ref: "py", minuend: "ac" }); }
            if (this.has.pl) { out.push({ ref: "pl", minuend: "ac" }); }
            if (this.has.fcfy && this.has.plfy) { out.push({ ref: "plfy", minuend: "fcfy" }); }
        } else if (ui.preset === "acpydpy") { if (this.has.py) { out.push({ ref: "py", minuend: "ac" }); } }
        else if (ui.preset === "acpldpl") { if (this.has.pl) { out.push({ ref: "pl", minuend: "ac" }); } }
        else if (ui.preset === "dpct") {
            if (this.has.py) { out.push({ ref: "py", minuend: "ac" }); }
            if (this.has.pl) { out.push({ ref: "pl", minuend: "ac" }); }
        } else { out.push({ ref: this.ui!.ref, minuend: "ac" }); }
        return out.filter(dc => this.has[dc.ref]);
    }

    // ---------------- title / toolbar / legend ----------------

    private buildTitle(fmt: Fmt): HTMLElement {
        const t = this.settings.titleCard;
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:12px 14px 4px 14px;";
        const msg = t.message.value.trim();
        if (msg) {
            const m = document.createElement("div");
            m.style.cssText = "font-size:13.5px;font-weight:700;line-height:1.45;margin-bottom:8px;max-width:900px;";
            m.textContent = msg;
            wrap.appendChild(m);
        }
        const months = this.model!.months;
        const autoPeriod = months.length > 0
            ? `${months[0].slice(0, 4)} ${this.monthLabel(months[0])}..${this.monthLabel(months[months.length - 1])} (_${this.monthLabel(months[months.length - 1])})`
            : "";
        const scen = ["AC", this.has.py ? "PY" : "", this.has.pl ? "PL" : ""].filter(Boolean).join(", ");
        const lines = [
            t.unitLine.value.trim(),
            t.measureLine.value.trim() || (this.str("Income statement (P&L)", "GuV (P&L)") + (fmt.suffix ? ` in ${fmt.suffix}${this.settings.numbersCard.unitText.value}` : "")),
            t.periodLine.value.trim() || [autoPeriod, scen && `${scen} · Δ ${this.ui!.ref.toUpperCase()}`].filter(Boolean).join(": "),
        ].filter(s => s !== "");
        lines.forEach((line, i) => {
            const el = document.createElement("div");
            el.style.cssText = i === 1
                ? "font-size:12px;line-height:1.5;font-weight:600;"
                : `font-size:12px;line-height:1.5;color:${i === 0 ? C.text : C.text};`;
            el.textContent = line;
            wrap.appendChild(el);
        });
        return wrap;
    }

    private tbBtn(label: string, active: boolean, onClick: () => void, title?: string): HTMLElement {
        const b = document.createElement("button");
        b.textContent = label;
        if (title) { b.title = title; }
        b.style.cssText =
            `font-family:${FONT};font-size:10.5px;padding:3px 10px;cursor:pointer;border-radius:2px;` +
            (active
                ? `background:${C.ac};border:1px solid ${C.ac};color:#FFF;font-weight:600;`
                : `background:#FFF;border:1px solid ${C.gridSoft};color:${C.text};`);
        b.onclick = (e) => { e.stopPropagation(); onClick(); this.persistUi(); this.rerender(); };
        return b;
    }

    private tbGroup(label: string, buttons: HTMLElement[]): HTMLElement {
        const g = document.createElement("div");
        g.style.cssText = "display:flex;flex-direction:column;gap:3px;";
        const l = document.createElement("div");
        l.style.cssText = `font-size:8.5px;letter-spacing:.08em;color:${C.soft};text-transform:uppercase;`;
        l.textContent = label;
        const row = document.createElement("div");
        row.style.cssText = "display:flex;gap:4px;flex-wrap:wrap;";
        buttons.forEach(b => row.appendChild(b));
        g.appendChild(l); g.appendChild(row);
        return g;
    }

    private buildToolbar(): HTMLElement {
        const ui = this.ui!;
        const bar = document.createElement("div");
        bar.style.cssText = "display:flex;gap:18px;flex-wrap:wrap;padding:8px 14px 6px 14px;align-items:flex-end;";

        bar.appendChild(this.tbGroup(this.str("View", "Ansicht"), [
            this.tbBtn("Table", ui.view === "table", () => { ui.view = "table"; }),
            this.tbBtn("Waterfall", ui.view === "waterfall", () => { ui.view = "waterfall"; }),
        ]));

        const presets: [Preset, string][] = [
            ["full", "AC·PY·PL·FC"], ["acref", "AC vs Ref"], ["acpydpy", "AC·PY·ΔPY"],
            ["acpldpl", "AC·PL·ΔPL"], ["dpct", "ΔPY% · ΔPL%"],
        ];
        bar.appendChild(this.tbGroup(this.str("Column preset", "Spalten-Preset"),
            presets.map(([p, label]) => this.tbBtn(label, ui.preset === p, () => { ui.preset = p; }))));

        const refs: Scenario[] = (["py", "pl", "fc"] as Scenario[]).filter(s => this.has[s]);
        if (refs.length > 0) {
            bar.appendChild(this.tbGroup("Δ " + this.str("reference", "Referenz"),
                refs.map(r => this.tbBtn(r.toUpperCase(), ui.ref === r, () => { ui.ref = r; }))));
        }

        const unitText = this.settings.numbersCard.unitText.value || "EUR";
        bar.appendChild(this.tbGroup(this.str("Unit", "Einheit"), [
            this.tbBtn("k" + unitText, ui.unit === "k", () => { ui.unit = "k"; }),
            this.tbBtn("m" + unitText, ui.unit === "m", () => { ui.unit = "m"; }),
        ]));

        bar.appendChild(this.tbGroup(this.str("Density", "Dichte"), [
            this.tbBtn("Normal", ui.density === "normal", () => { ui.density = "normal"; }),
            this.tbBtn("Compact", ui.density === "compact", () => { ui.density = "compact"; }),
        ]));

        const maxL = Math.min(this.model!.maxDepth, 8);
        const lvlBtns: HTMLElement[] = [];
        for (let l = 1; l < maxL; l++) {
            lvlBtns.push(this.tbBtn(String(l), false, () => { ui.collapsed = [...collapseToLevel(this.model!.roots, l)]; }));
        }
        lvlBtns.push(this.tbBtn(this.str("All", "Alle"), false, () => { ui.collapsed = []; }));
        bar.appendChild(this.tbGroup(this.str("Expand to level", "Bis Ebene"), lvlBtns));

        bar.appendChild(this.tbGroup(this.str("Options", "Optionen"), [
            this.tbBtn(this.str("% of revenue", "% vom Umsatz"), ui.pctRev, () => { ui.pctRev = !ui.pctRev; }),
            this.tbBtn(this.str("Hide zero rows", "Nullzeilen aus"), ui.hideZero, () => { ui.hideZero = !ui.hideZero; }),
        ]));
        return bar;
    }

    private legendChip(style: "ac" | "py" | "pl" | "fc"): HTMLElement {
        const chip = document.createElement("span");
        const base = "display:inline-block;width:10px;height:10px;margin-right:5px;vertical-align:-1px;";
        if (style === "ac") { chip.style.cssText = base + `background:${C.ac};`; }
        else if (style === "py") { chip.style.cssText = base + `background:${C.py};`; }
        else if (style === "pl") { chip.style.cssText = base + `background:#FFF;border:1.4px solid ${C.ac};box-sizing:border-box;`; }
        else {
            chip.style.cssText = base +
                `background:repeating-linear-gradient(45deg,#FFF,#FFF 2px,${C.ac} 2px,${C.ac} 3.2px);` +
                `border:1px solid ${C.ac};box-sizing:border-box;`;
        }
        return chip;
    }

    private buildLegend(): HTMLElement {
        const bar = document.createElement("div");
        bar.style.cssText = `display:flex;gap:16px;flex-wrap:wrap;align-items:center;` +
            `padding:6px 14px;font-size:10px;color:${C.soft};`;
        const item = (chipEl: HTMLElement | null, label: string, color?: string): void => {
            const s = document.createElement("span");
            if (chipEl) { s.appendChild(chipEl); }
            const t = document.createElement("span");
            if (color) { t.style.color = color; }
            t.textContent = label;
            s.appendChild(t);
            bar.appendChild(s);
        };
        item(this.legendChip("ac"), " AC actual");
        if (this.has.py) { item(this.legendChip("py"), " PY previous year"); }
        if (this.has.pl || this.has.plfy) { item(this.legendChip("pl"), " PL plan"); }
        if (this.has.fc || this.has.fcfy) { item(this.legendChip("fc"), " FC forecast"); }
        const g = document.createElement("span");
        const sq = (color: string): HTMLElement => {
            const el = document.createElement("span");
            el.style.cssText = `display:inline-block;width:10px;height:10px;background:${color};margin:0 5px 0 0;vertical-align:-1px;`;
            return el;
        };
        const fav = document.createElement("span"); fav.appendChild(sq(this.goodColor()));
        fav.appendChild(document.createTextNode(this.str("favorable Δ", "günstige Δ")));
        const unfav = document.createElement("span"); unfav.appendChild(sq(this.badColor()));
        unfav.appendChild(document.createTextNode(this.str("unfavorable Δ", "ungünstige Δ")));
        bar.appendChild(fav); bar.appendChild(unfav); bar.appendChild(g);
        if (String(this.settings.styleCard.colorMode.value.value) !== "ibcs") {
            const note = document.createElement("span");
            note.style.cssText = "font-style:italic;";
            note.textContent = this.str(
                "Documented IBCS deviation: teal replaces green (safe for red–green color-vision deficiency).",
                "Dokumentierte IBCS-Abweichung: Teal statt Grün (sicher bei Rot-Grün-Sehschwäche).");
            bar.appendChild(note);
        }
        const axes = document.createElement("span");
        axes.style.cssText = "font-style:italic;";
        axes.textContent = this.str("Δ axes encode the reference: gray = PY, double line = PL, dashed = FC.",
            "Δ-Achsen kodieren die Referenz: grau = PY, Doppellinie = PL, gestrichelt = FC.");
        bar.appendChild(axes);
        return bar;
    }

    // ---------------- table ----------------

    private colSpecs(): { ytd: ColSpec[]; fy: ColSpec[] } {
        const ui = this.ui!;
        const ytd: ColSpec[] = [{ kind: "val", scen: "ac", label: "AC" }];
        if (ui.pctRev) { ytd.push({ kind: "pct", label: "% Rev" }); }
        const fy: ColSpec[] = [];
        const push = (arr: ColSpec[], ref: Scenario, minuend: Scenario, withVal: boolean, valScen?: Scenario): void => {
            if (withVal && valScen) { arr.push({ kind: "val", scen: valScen, label: valScen === "plfy" ? "PL" : valScen.toUpperCase() }); }
            arr.push({ kind: "bar", ref, minuend, label: `Δ${ref === "plfy" ? "PL" : ref.toUpperCase()}` });
            arr.push({ kind: "pin", ref, minuend, label: `Δ${ref === "plfy" ? "PL" : ref.toUpperCase()}%` });
        };
        if (ui.preset === "full") {
            if (this.has.py) {
                ytd.push({ kind: "val", scen: "py", label: "PY" });
                ytd.push({ kind: "bar", ref: "py", minuend: "ac", label: "ΔPY" });
            }
            if (this.has.pl) {
                ytd.push({ kind: "val", scen: "pl", label: "PL" });
                ytd.push({ kind: "bar", ref: "pl", minuend: "ac", label: "ΔPL" });
                ytd.push({ kind: "pin", ref: "pl", minuend: "ac", label: "ΔPL%" });
            }
            if (this.has.fcfy && this.has.plfy) {
                fy.push({ kind: "val", scen: "fcfy", label: "FC" });
                fy.push({ kind: "val", scen: "plfy", label: "PL" });
                fy.push({ kind: "bar", ref: "plfy", minuend: "fcfy", label: "ΔPL" });
                fy.push({ kind: "pin", ref: "plfy", minuend: "fcfy", label: "ΔPL%" });
            }
        } else if (ui.preset === "acref") {
            const r = this.ui!.ref;
            if (this.has[r]) { ytd.push({ kind: "val", scen: r, label: r.toUpperCase() }); push(ytd, r, "ac", false); }
        } else if (ui.preset === "acpydpy" && this.has.py) {
            ytd.push({ kind: "val", scen: "py", label: "PY" }); push(ytd, "py", "ac", false);
        } else if (ui.preset === "acpldpl" && this.has.pl) {
            ytd.push({ kind: "val", scen: "pl", label: "PL" }); push(ytd, "pl", "ac", false);
        } else if (ui.preset === "dpct") {
            if (this.has.py) { ytd.push({ kind: "pin", ref: "py", minuend: "ac", label: "ΔPY%" }); }
            if (this.has.pl) { ytd.push({ kind: "pin", ref: "pl", minuend: "ac", label: "ΔPL%" }); }
        }
        return { ytd, fy };
    }

    private buildTable(fmt: Fmt, maxAbsDelta: number): HTMLElement {
        const model = this.model!; const ui = this.ui!;
        const collapsed = new Set(ui.collapsed);
        let visible = flattenVisible(model.roots, collapsed);
        if (ui.hideZero) { visible = visible.filter(n => n.row.rowType === "separator" || !isZeroRow(n)); }

        const revBase = revenueBase(model, this.settings.columnsCard.revenueBase.value);
        const { ytd, fy } = this.colSpecs();
        const cols = [...ytd, ...(fy.length ? [{ kind: "gap", label: "" } as ColSpec] : []), ...fy];

        // label maxima → column widths (no clipped numbers, uniform per column kind)
        let dLabelLen = 2; let pLabelLen = 3;
        for (const node of model.byId.values()) {
            if (node.row.rowType === "kpi") { continue; }
            for (const c of cols) {
                if (c.kind === "bar") {
                    const v = variance(node, c.ref!, c.minuend!);
                    if (v.delta != null) { dLabelLen = Math.max(dLabelLen, fmt.val(v.delta, true).length); }
                } else if (c.kind === "pin") {
                    const v = variance(node, c.ref!, c.minuend!);
                    if (v.deltaPct != null) { pLabelLen = Math.max(pLabelLen, (fmt.pct(this.capPct(v.deltaPct), true) + "▸").length); }
                }
            }
        }
        const compact = ui.density === "compact";
        const rowH = compact ? 18 : 23;
        const fs = compact ? 10 : 11;
        const BAR_HALF = 34; const PIN_HALF = 24;
        const dLabelW = Math.ceil(dLabelLen * (fs * 0.52)) + 4;
        const pLabelW = Math.ceil(pLabelLen * (fs * 0.52)) + 4;
        const barW = 2 * (BAR_HALF + dLabelW + 4) + 8;
        const pinW = 2 * (PIN_HALF + pLabelW + 4) + 8;
        const valW = compact ? 66 : 76;

        const geo = { rowH, fs, BAR_HALF, PIN_HALF, barW, pinW, valW, maxAbsDelta };

        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:2px 14px 8px 14px;";

        const scaleNote = document.createElement("div");
        scaleNote.style.cssText = `font-size:9px;color:${C.soft};text-align:right;padding:0 0 3px 0;`;
        scaleNote.textContent = this.str("uniform Δ scale: bars ±", "einheitliche Δ-Skala: Balken ±")
            + fmt.val(maxAbsDelta) + " " + fmt.suffix + this.settings.numbersCard.unitText.value
            + " · pins ±40%";
        wrap.appendChild(scaleNote);

        const table = document.createElement("div");
        table.style.cssText = "display:table;border-collapse:collapse;";
        table.appendChild(this.blockHeaderRow(ytd, fy, geo));
        table.appendChild(this.headerRow(cols, geo));
        for (const node of visible) {
            table.appendChild(this.bodyRow(node, cols, fmt, geo, revBase));
            if (ui.spark.includes(node.row.id) && node.series.ac && model.months.length > 1) {
                table.appendChild(this.sparkRow(node, cols.length, geo));
            }
        }
        wrap.appendChild(table);
        return wrap;
    }

    private cell(w: number, align: string, fs: number): HTMLElement {
        const c = document.createElement("div");
        c.style.cssText = `display:table-cell;vertical-align:middle;padding:1px 7px 1px 0;` +
            `width:${w > 0 ? w + "px" : "auto"};text-align:${align};font-size:${fs}px;white-space:nowrap;`;
        return c;
    }

    private blockHeaderRow(ytd: ColSpec[], fy: ColSpec[], geo: { valW: number; barW: number; pinW: number; fs: number }): HTMLElement {
        const months = this.model!.months;
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        row.appendChild(this.cell(0, "left", geo.fs));
        const span = (specs: ColSpec[], label: string): void => {
            if (specs.length === 0) { return; }
            const c = this.cell(0, "center", 9);
            c.style.cssText += `color:${C.soft};border-bottom:1px solid ${C.gridSoft};`;
            let colCount = 0;
            for (const s of specs) { colCount++; void s; }
            // emulate colspan with a positioned wrapper: use table-cell per col but label only once
            c.textContent = label;
            row.appendChild(c);
            for (let i = 1; i < colCount; i++) {
                const f = this.cell(0, "center", 9);
                f.style.cssText += `border-bottom:1px solid ${C.gridSoft};`;
                row.appendChild(f);
            }
        };
        const last = months.length > 0 ? this.monthLabel(months[months.length - 1]) : "";
        const year = months.length > 0 ? months[0].slice(0, 4) : "";
        span(ytd, months.length > 0
            ? `${year} ${this.monthLabel(months[0])}..${last} (_${last}) · ${this.str("year to date", "Jahresverlauf")}`
            : this.str("current period", "aktueller Zeitraum"));
        if (fy.length > 0) {
            const gap = this.cell(18, "center", 9); row.appendChild(gap);
            span(fy, `FY ${year || ""} · ${this.str("outlook (FC)", "Ausblick (FC)")}`);
        }
        return row;
    }

    private headerRow(cols: ColSpec[], geo: { valW: number; barW: number; pinW: number; fs: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        row.appendChild(this.cell(0, "left", geo.fs));
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(18, "center", 9)); continue; }
            const w = c.kind === "val" || c.kind === "pct" ? geo.valW : c.kind === "bar" ? geo.barW : geo.pinW;
            const cell = this.cell(w, c.kind === "val" || c.kind === "pct" ? "right" : "center", 9.5);
            cell.style.color = C.soft;
            if (c.kind === "val" && c.scen) {
                const style = c.scen === "ac" ? "ac" : c.scen === "py" ? "py" : (c.scen === "fc" || c.scen === "fcfy") ? "fc" : "pl";
                cell.appendChild(this.legendChip(style as "ac"));
            }
            cell.appendChild(document.createTextNode(c.label));
            row.appendChild(cell);
        }
        return row;
    }

    private capPct(p: number): number { return Math.max(-0.4, Math.min(0.4, p)); }

    private bodyRow(node: PnlNode, cols: ColSpec[], fmt: Fmt,
        geo: { rowH: number; fs: number; BAR_HALF: number; PIN_HALF: number; barW: number; pinW: number; valW: number; maxAbsDelta: number },
        revBase: PnlNode | null): HTMLElement {
        const ui = this.ui!;
        const t = node.row.rowType;
        const isRatio = t === "kpi";
        const isSum = t === "subtotal" || t === "formula";
        const indent = this.settings.hierarchyCard.indent.value;

        const row = document.createElement("div");
        row.style.cssText = `display:table-row;height:${geo.rowH}px;`;
        if (t === "separator") {
            const c = this.cell(0, "left", 9);
            c.style.cssText += `padding-top:9px;font-weight:600;color:${C.soft};`;
            c.textContent = node.row.name === node.row.id ? "" : node.row.name;
            row.appendChild(c);
            return row;
        }

        // name cell
        const name = this.cell(0, "left", geo.fs);
        name.style.paddingLeft = `${node.level * indent}px`;
        name.style.minWidth = "230px";
        if (isSum) { name.style.fontWeight = "600"; }
        if (node.isOrphanBucket) { name.style.color = this.badColor(); }
        if (isRatio) { name.style.fontStyle = "italic"; name.style.color = C.soft; }

        if (node.hasChildren) {
            const open = !ui.collapsed.includes(node.row.id);
            const chev = document.createElement("span");
            chev.textContent = open ? "▾ " : "▸ ";
            chev.style.cssText = `cursor:pointer;color:${C.soft};font-size:9px;`;
            const toggle = (e: Event): void => {
                e.stopPropagation();
                if (open) { ui.collapsed.push(node.row.id); }
                else { ui.collapsed = ui.collapsed.filter(id => id !== node.row.id); }
                this.persistUi(); this.rerender();
            };
            chev.onclick = toggle;
            name.style.cursor = "pointer";
            name.onclick = toggle;
            name.appendChild(chev);
        }
        // small account id (only when it differs from the display name and is not synthetic)
        const rid = node.row.id;
        if (!rid.startsWith("L:") && rid !== node.row.name && rid !== "__unassigned__") {
            const idEl = document.createElement("span");
            idEl.style.cssText = `font-size:8px;color:${C.soft};margin-right:6px;`;
            idEl.textContent = rid;
            name.appendChild(idEl);
        }
        if (node.isOrphanBucket) { name.appendChild(document.createTextNode("⚠ ")); }
        const label = document.createElement("span");
        label.textContent = node.row.name;
        name.appendChild(label);
        if (node.error) {
            const err = document.createElement("span");
            err.style.cssText = `color:${this.badColor()};font-size:8.5px;`;
            err.textContent = " ⚠ " + node.error;
            name.appendChild(err);
        }
        if (node.row.comment) {
            const n = this.comments.length + 1;
            this.comments.push({ n, node, text: node.row.comment });
            const mark = document.createElement("span");
            mark.style.cssText = `color:${C.comment};font-size:9.5px;margin-left:5px;cursor:default;`;
            mark.textContent = String.fromCharCode(0x2460 + this.comments.length - 1);
            mark.title = node.row.comment;
            name.appendChild(mark);
        }
        // 12M sparkline chip
        if (node.series.ac && this.model!.months.length > 1) {
            const chip = document.createElement("span");
            const active = ui.spark.includes(node.row.id);
            chip.textContent = `${this.model!.months.length}M`;
            chip.style.cssText = `font-size:8px;margin-left:6px;padding:0 4px;cursor:pointer;border-radius:2px;` +
                (active ? `background:${C.ac};color:#FFF;` : `border:1px solid ${C.gridSoft};color:${C.soft};`);
            chip.onclick = (e) => {
                e.stopPropagation();
                if (active) { ui.spark = ui.spark.filter(id => id !== node.row.id); }
                else { ui.spark.push(node.row.id); }
                this.persistUi(); this.rerender();
            };
            chip.title = this.str("Toggle monthly sparkline", "Monats-Sparkline umschalten");
            name.appendChild(chip);
        }
        row.appendChild(name);

        const lineTop = isSum && !isRatio;
        for (const c of cols) {
            if (c.kind === "gap") { row.appendChild(this.cell(18, "center", geo.fs)); continue; }
            let cell: HTMLElement;
            if (c.kind === "val") {
                cell = this.cell(geo.valW, "right", geo.fs);
                cell.style.cssText += "font-variant-numeric:tabular-nums;";
                if (isSum) { cell.style.fontWeight = "600"; }
                cell.textContent = isRatio
                    ? fmt.pct(displayValue(node, c.scen!))
                    : fmt.val(displayValue(node, c.scen!));
            } else if (c.kind === "pct") {
                cell = this.cell(geo.valW, "right", geo.fs - 1);
                cell.style.cssText += `color:${C.soft};font-variant-numeric:tabular-nums;`;
                const base = revBase?.computed.ac;
                const v = node.computed.ac;
                cell.textContent = !isRatio && base != null && base !== 0 && v != null
                    ? fmt.pct(Math.abs(v / base)) : "";
            } else {
                const v = variance(node, c.ref!, c.minuend!);
                if (isRatio) {
                    cell = this.cell(c.kind === "bar" ? geo.barW : geo.pinW, "center", geo.fs - 1);
                    if (c.kind === "bar" && v.delta != null) {
                        cell.style.color = v.good ? this.goodColor() : this.badColor();
                        cell.style.fontStyle = "italic";
                        cell.textContent = (v.delta > 0 ? "+" : "") + fmt.pct(v.delta).replace("%", "pp");
                    }
                } else if (c.kind === "bar") {
                    cell = this.deltaBarCell(v, c, geo, fmt);
                } else {
                    cell = this.deltaPinCell(v, c, geo, fmt);
                }
                if (lineTop) { cell.style.borderTop = `1px solid ${C.line}`; }
            }
            if (lineTop && (c.kind === "val" || c.kind === "pct")) { cell.style.borderTop = `1px solid ${C.line}`; }
            row.appendChild(cell);
        }
        return row;
    }

    /** reference-scenario axis per IBCS: gray = PY, double line = PL, dashed = FC */
    private drawAxis(svg: SVGSVGElement, ns: string, x: number, h: number, ref: Scenario): void {
        const mk = (xx: number, dash: string | null, color: string, wd: number): void => {
            const l = document.createElementNS(ns, "line");
            l.setAttribute("x1", String(xx)); l.setAttribute("x2", String(xx));
            l.setAttribute("y1", "0"); l.setAttribute("y2", String(h));
            l.setAttribute("stroke", color); l.setAttribute("stroke-width", String(wd));
            if (dash) { l.setAttribute("stroke-dasharray", dash); }
            svg.appendChild(l);
        };
        if (ref === "py") { mk(x, null, C.py, 2); }
        else if (ref === "pl" || ref === "plfy") { mk(x - 1.2, null, C.ac, 0.9); mk(x + 1.2, null, C.ac, 0.9); }
        else { mk(x, "3,2", C.ac, 1); }
    }

    private hatchPattern(svg: SVGSVGElement, ns: string, id: string, color: string): void {
        const defs = document.createElementNS(ns, "defs");
        const p = document.createElementNS(ns, "pattern");
        p.setAttribute("id", id); p.setAttribute("width", "4"); p.setAttribute("height", "4");
        p.setAttribute("patternUnits", "userSpaceOnUse");
        p.setAttribute("patternTransform", "rotate(45)");
        const r = document.createElementNS(ns, "rect");
        r.setAttribute("width", "4"); r.setAttribute("height", "4"); r.setAttribute("fill", "#FFF");
        const l = document.createElementNS(ns, "rect");
        l.setAttribute("width", "1.8"); l.setAttribute("height", "4"); l.setAttribute("fill", color);
        p.appendChild(r); p.appendChild(l); defs.appendChild(p); svg.appendChild(defs);
    }

    private deltaBarCell(v: { delta: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; BAR_HALF: number; barW: number; maxAbsDelta: number }, fmt: Fmt): HTMLElement {
        const cell = this.cell(geo.barW, "left", geo.fs);
        if (v.delta == null) { return cell; }
        const w = geo.barW - 8; const h = geo.rowH - 4; const mid = w / 2;
        const frac = geo.maxAbsDelta > 0 ? Math.min(Math.abs(v.delta) / geo.maxAbsDelta, 1) : 0;
        const len = Math.max(frac * geo.BAR_HALF, v.delta === 0 ? 0 : 1.5);
        const x = v.delta >= 0 ? mid : mid - len;
        const color = v.good ? this.goodColor() : this.badColor();
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";
        const hatch = c.minuend === "fcfy";
        const pid = `pnlh${Math.abs(v.delta).toFixed(2).replace(".", "")}${color.slice(1)}`;
        if (hatch) { this.hatchPattern(svg, ns, pid, color); }
        this.drawAxis(svg, ns, mid, h, c.ref!);
        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", String(x)); rect.setAttribute("y", "2.5");
        rect.setAttribute("width", String(len)); rect.setAttribute("height", String(h - 5));
        rect.setAttribute("fill", hatch ? `url(#${pid})` : color);
        if (hatch) { rect.setAttribute("stroke", color); rect.setAttribute("stroke-width", "1"); }
        svg.appendChild(rect);
        const txt = document.createElementNS(ns, "text");
        const anchor = v.delta >= 0 ? "start" : "end";
        const tx = v.delta >= 0 ? mid + len + 3 : mid - len - 3;
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", String(geo.fs - 1.5)); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", v.good ? this.goodColor() : this.badColor());
        txt.textContent = fmt.val(v.delta, true);
        svg.appendChild(txt);
        cell.appendChild(svg);
        return cell;
    }

    private deltaPinCell(v: { deltaPct: number | null; good: boolean }, c: ColSpec,
        geo: { rowH: number; fs: number; PIN_HALF: number; pinW: number }, fmt: Fmt): HTMLElement {
        const cell = this.cell(geo.pinW, "left", geo.fs);
        if (v.deltaPct == null) { return cell; }
        const w = geo.pinW - 8; const h = geo.rowH - 4; const mid = w / 2;
        const cap = 0.4;
        const clamped = this.capPct(v.deltaPct);
        const px = mid + (clamped / cap) * geo.PIN_HALF;
        const overflow = Math.abs(v.deltaPct) > cap;
        const color = v.good ? this.goodColor() : this.badColor();
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg") as SVGSVGElement;
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";
        this.drawAxis(svg, ns, mid, h, c.ref!);
        const needle = document.createElementNS(ns, "line");
        needle.setAttribute("x1", String(mid)); needle.setAttribute("x2", String(px));
        needle.setAttribute("y1", String(h / 2)); needle.setAttribute("y2", String(h / 2));
        needle.setAttribute("stroke", color); needle.setAttribute("stroke-width", "1.4");
        svg.appendChild(needle);
        const head = document.createElementNS(ns, "circle");
        head.setAttribute("cx", String(px)); head.setAttribute("cy", String(h / 2));
        head.setAttribute("r", overflow ? "2" : "2.8");
        // pin head carries the minuend's scenario fill (IBCS): FC → outlined
        if (c.minuend === "fcfy") {
            head.setAttribute("fill", "#FFF"); head.setAttribute("stroke", color); head.setAttribute("stroke-width", "1.4");
        } else { head.setAttribute("fill", color); }
        svg.appendChild(head);
        const txt = document.createElementNS(ns, "text");
        const anchor = v.deltaPct >= 0 ? "start" : "end";
        const tx = v.deltaPct >= 0 ? Math.max(px + 4, mid + 4) : Math.min(px - 4, mid - 4);
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + geo.fs * 0.32));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", String(geo.fs - 1.5)); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", color);
        txt.textContent = fmt.pct(v.deltaPct, true) + (overflow ? "▸" : "");
        svg.appendChild(txt);
        cell.appendChild(svg);
        return cell;
    }

    private sparkRow(node: PnlNode, colCount: number, geo: { fs: number }): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        const lead = this.cell(0, "left", geo.fs);
        lead.style.cssText += "padding:2px 0 4px 24px;";
        const months = this.model!.months;
        const w = 300; const h = 34;
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("width", String(w)); svg.setAttribute("height", String(h));
        let min = 0; let max = 0;
        for (const s of ["ac", "py", "fc"] as Scenario[]) {
            for (const v of node.series[s] ?? []) {
                if (v != null) { min = Math.min(min, v); max = Math.max(max, v); }
            }
        }
        if (max === min) { max = min + 1; }
        const X = (i: number): number => 26 + (i / Math.max(months.length - 1, 1)) * (w - 60);
        const Y = (v: number): number => 4 + (1 - (v - min) / (max - min)) * (h - 12);
        const line = (arr: (number | null)[], color: string, dash: string | null, sw: number): void => {
            let d = ""; let pen = false;
            arr.forEach((v, i) => {
                if (v == null) { pen = false; return; }
                d += (pen ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1);
                pen = true;
            });
            if (d === "") { return; }
            const p = document.createElementNS(ns, "path");
            p.setAttribute("d", d); p.setAttribute("fill", "none");
            p.setAttribute("stroke", color); p.setAttribute("stroke-width", String(sw));
            if (dash) { p.setAttribute("stroke-dasharray", dash); }
            svg.appendChild(p);
        };
        if (node.series.py) { line(node.series.py, C.py, null, 1); }
        if (node.series.fc) { line(node.series.fc, C.ac, "3,2", 1.2); }
        if (node.series.ac) { line(node.series.ac, C.ac, null, 1.6); }
        const l0 = document.createElementNS(ns, "text");
        l0.setAttribute("x", "0"); l0.setAttribute("y", String(h / 2));
        l0.setAttribute("font-size", "8"); l0.setAttribute("font-family", FONT); l0.setAttribute("fill", C.soft);
        l0.textContent = this.monthLabel(months[0]);
        const l1 = document.createElementNS(ns, "text");
        l1.setAttribute("x", String(w - 30)); l1.setAttribute("y", String(h / 2));
        l1.setAttribute("font-size", "8"); l1.setAttribute("font-family", FONT); l1.setAttribute("fill", C.soft);
        l1.textContent = this.monthLabel(months[months.length - 1]);
        svg.appendChild(l0); svg.appendChild(l1);
        lead.appendChild(svg);
        row.appendChild(lead);
        for (let i = 0; i < colCount; i++) { row.appendChild(this.cell(0, "left", geo.fs)); }
        return row;
    }

    // ---------------- waterfall / footnotes / footer ----------------

    private buildWaterfall(fmt: Fmt): HTMLElement {
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:6px 14px;";
        const rows = this.model!.roots.filter(r =>
            !r.isOrphanBucket && r.row.rowType !== "kpi" && r.row.rowType !== "separator");
        const width = Math.max(this.root.clientWidth - 40, 640);
        const svg = renderWaterfall(rows, {
            width, height: 380, scenario: "ac",
            fmt: (v) => fmt.val(v),
            fontFamily: FONT,
            colors: { ac: C.ac, text: C.text, soft: C.soft, line: C.gridSoft },
            hatchPatternId: "pnlWfHatch",
        });
        wrap.appendChild(svg);
        return wrap;
    }

    private buildFootnotes(fmt: Fmt): void {
        void fmt;
        const model = this.model!;
        if (this.comments.length === 0 && model.warnings.length === 0) { return; }
        const box = document.createElement("div");
        box.style.cssText = "padding:8px 14px 4px 14px;max-width:960px;";
        const h = document.createElement("div");
        h.style.cssText = `font-size:9px;font-weight:700;letter-spacing:.08em;color:${C.soft};margin-bottom:4px;`;
        h.textContent = this.str("COMMENTS & DATA-QUALITY SIGNALS", "KOMMENTARE & DATENQUALITÄTS-SIGNALE");
        box.appendChild(h);
        for (const cm of this.comments) {
            const li = document.createElement("div");
            li.style.cssText = "font-size:10px;line-height:1.5;margin-bottom:3px;";
            const m = document.createElement("span");
            m.style.cssText = `color:${C.comment};margin-right:6px;`;
            m.textContent = String.fromCharCode(0x2460 + cm.n - 1);
            li.appendChild(m);
            li.appendChild(document.createTextNode(cm.text));
            box.appendChild(li);
        }
        for (const w of model.warnings) {
            const li = document.createElement("div");
            li.style.cssText = `font-size:10px;line-height:1.5;margin-bottom:3px;color:${C.soft};`;
            li.textContent = "⚠ " + w;
            box.appendChild(li);
        }
        this.root.appendChild(box);
    }

    private buildFooter(): HTMLElement {
        const f = document.createElement("div");
        f.style.cssText = `padding:10px 14px 12px 14px;border-top:1px solid ${C.gridSoft};` +
            `margin-top:8px;font-size:8.5px;color:${C.soft};line-height:1.5;max-width:960px;`;
        const dev = String(this.settings.styleCard.colorMode.value.value) !== "ibcs"
            ? this.str(" Documented corporate deviation: teal replaces the IBCS variance green to remain readable with red–green color-vision deficiency.",
                " Dokumentierte Abweichung: Teal ersetzt das IBCS-Varianz-Grün, um bei Rot-Grün-Sehschwäche lesbar zu bleiben.")
            : "";
        f.textContent = this.str(
            "Notation based on the IBCS® Standards 1.2 by the IBCS Association (CC BY-SA 4.0, ibcs.com)." + dev +
            " IBCS® is a registered trademark of HICHERT+FAISST GmbH. This visual is not certified by or affiliated with the IBCS Association.",
            "Notation nach den IBCS®-Standards 1.2 der IBCS Association (CC BY-SA 4.0, ibcs.com)." + dev +
            " IBCS® ist eine eingetragene Marke der HICHERT+FAISST GmbH. Dieses Visual ist nicht von der IBCS Association zertifiziert.");
        return f;
    }
}
