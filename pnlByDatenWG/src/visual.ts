/*
 *  P&L Statement byDatenWG — IBCS-inspired GuV visual for Power BI
 *  © 2026 Michael Tenner · PowerBI Kitchen — MIT License (see LICENSE in the repo root):
 *  free to use and modify, keep this author notice.
 *
 *  MVP (Phase 1): unbalanced parent-child account hierarchy driven by a
 *  dimension table, subtotal + formula rows (EBITDA, margins), sign
 *  conventions with display/variance invert, scenarios AC/PY/PL/FC with
 *  Δ bars and Δ% pins against a selectable reference, expand/collapse with
 *  persisted state, k/m scaling, 3-line IBCS title block, landing page.
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
import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
import DataViewValueColumn = powerbi.DataViewValueColumn;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;

import { VisualFormattingSettingsModel } from "./settings";
import {
    buildModel, flattenVisible, collapseToLevel, variance, displayValue,
    parseRowType, parseBool, parseSign, rowsFromLevels,
    InputRow, LevelInputRow, PnlModel, PnlNode, Scenario,
} from "./engine";

const FONT = "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif";

// IBCS semantic colors (spec chapter 6)
const C_AC = "#404040";
const C_PY = "#B3B3B3";
const C_GOOD = "#8CB400";
const C_BAD = "#FF2600";
const C_TEXT = "#252423";
const C_SOFT = "#8A8886";
const C_LINE = "#404040";
const C_GRID_SOFT = "#EDEBE9";

type ScalingMode = "auto" | "none" | "k" | "m";

interface ColumnLayout {
    nameW: number;
    valW: number;
    barW: number;
    pctW: number;
    barHalf: number;
    pinHalf: number;
    showRef: boolean;
    showBar: boolean;
    showPct: boolean;
    showPct2: boolean;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private selection: ISelectionManager;
    private formattingSettingsService: FormattingSettingsService;
    private settings: VisualFormattingSettingsModel;

    private root: HTMLElement;

    private model: PnlModel | null = null;
    private lastHasScenario: Record<Scenario, boolean> = { ac: true, py: false, pl: false, fc: false };
    private collapsed = new Set<string>();
    private stateLoaded = false;
    private pendingPersist: string | null = null;
    private lastAppliedState: string | null = null;
    private prevDefaultLevel: number | null = null;
    private locale = "en-US";

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.selection = options.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();
        this.locale = options.host.locale || "en-US";

        this.root = document.createElement("div");
        this.root.className = "pnl-root";
        this.root.style.cssText =
            `width:100%;height:100%;overflow:auto;background:#FFFFFF;` +
            `font-family:${FONT};color:${C_TEXT};box-sizing:border-box;`;
        options.element.appendChild(this.root);
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.settings = this.formattingSettingsService.populateFormattingSettingsModel(
                VisualFormattingSettingsModel, dataView);

            const rows = dataView ? this.parseRows(dataView) : null;
            if (!rows) {
                // fields not bound yet → onboarding landing page
                this.model = null;
                this.renderLanding();
                this.events.renderingFinished(options);
                return;
            }
            if (rows.rows.length === 0) {
                // fields bound, but the current filter selection yields no rows
                this.model = null;
                this.renderEmptySelection();
                this.events.renderingFinished(options);
                return;
            }

            this.model = buildModel(rows.rows, this.str("Unassigned (orphans)", "Nicht zugeordnet (Waisen)"));
            if (rows.truncated) {
                this.model.warnings.push(this.str(
                    "row limit (30k) reached — hierarchy may be incomplete",
                    "Zeilenlimit (30k) erreicht — Hierarchie evtl. unvollständig"));
            }
            this.lastHasScenario = rows.hasScenario;
            this.syncExpandState(dataView);
            this.render(rows.hasScenario);
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, e instanceof Error ? e.message : String(e));
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    // ---------------- data ----------------

    private parseRows(dataView: DataView): { rows: InputRow[]; hasScenario: Record<Scenario, boolean>; truncated: boolean } | null {
        const cat = dataView.categorical;
        if (!cat || !cat.categories || cat.categories.length === 0) { return null; }

        const byRole = (role: string): DataViewCategoryColumn | undefined =>
            cat.categories.find(c => c.source.roles && c.source.roles[role]);
        const measure = (role: string): DataViewValueColumn | undefined =>
            (cat.values || []).find(v => v.source.roles && v.source.roles[role]) as DataViewValueColumn | undefined;

        const idCol = byRole("account");
        const levelCols = cat.categories.filter(c => c.source.roles && c.source.roles["levels"]);
        const acCol = measure("ac");
        if (!acCol || (!idCol && levelCols.length === 0)) { return null; }

        const nameCol = byRole("accountName");
        const parentCol = byRole("parent");
        const sortCol = byRole("sortOrder");
        const typeCol = byRole("rowType");
        const formulaCol = byRole("formulaDef");
        const signCol = byRole("signConvention");
        const dispInvCol = byRole("displayInvert");
        const varInvCol = byRole("varianceInvert");
        const pyCol = measure("py");
        const plCol = measure("pl");
        const fcCol = measure("fc");

        const num = (col: DataViewValueColumn | undefined, i: number): number | null => {
            if (!col) { return null; }
            const v = col.values[i];
            if (v == null) { return null; }
            // DirectQuery / high-precision decimals can arrive as strings
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
            const trimmed = s.trim(); // "A100 " must match "A100"
            return trimmed === "" ? null : trimmed;
        };

        const n = (idCol ?? levelCols[0]).values.length;
        const hasScenario = { ac: !!acCol, py: !!pyCol, pl: !!plCol, fc: !!fcCol };

        // star-schema mode: flattened L1..Ln columns build the tree; an
        // explicitly bound Parent ID keeps the parent-child contract in charge
        if (levelCols.length > 0 && !parentCol) {
            const lrows: LevelInputRow[] = [];
            for (let i = 0; i < n; i++) {
                const sortRaw = Number(txt(sortCol, i) ?? NaN);
                lrows.push({
                    levels: levelCols.map(c => txt(c, i)),
                    account: idCol ? key(idCol, i) : null,
                    name: nameCol ? txt(nameCol, i) : null,
                    sort: isFinite(sortRaw) ? sortRaw : null,
                    rowType: parseRowType(txt(typeCol, i)),
                    formulaDef: txt(formulaCol, i),
                    sign: signCol ? parseSign(txt(signCol, i)) : 1,
                    displayInvert: dispInvCol ? parseBool(txt(dispInvCol, i)) : false,
                    varianceInvert: varInvCol ? parseBool(txt(varInvCol, i)) : false,
                    values: { ac: num(acCol, i), py: num(pyCol, i), pl: num(plCol, i), fc: num(fcCol, i) },
                    index: i,
                });
            }
            return { rows: rowsFromLevels(lrows), hasScenario, truncated: n >= 30000 };
        }
        if (!idCol) { return null; }

        const rows: InputRow[] = [];
        for (let i = 0; i < n; i++) {
            const id = key(idCol, i);
            if (id == null) { continue; }
            const sortRaw = Number(txt(sortCol, i) ?? i);
            rows.push({
                id,
                parent: key(parentCol, i),
                name: txt(nameCol, i) ?? id,
                sort: isFinite(sortRaw) ? sortRaw : Number.MAX_SAFE_INTEGER,
                rowType: parseRowType(txt(typeCol, i)),
                formulaDef: txt(formulaCol, i),
                sign: signCol ? parseSign(txt(signCol, i)) : 1,
                displayInvert: dispInvCol ? parseBool(txt(dispInvCol, i)) : false,
                varianceInvert: varInvCol ? parseBool(txt(varInvCol, i)) : false,
                values: { ac: num(acCol, i), py: num(pyCol, i), pl: num(plCol, i), fc: num(fcCol, i) },
                index: i,
            });
        }
        return { rows, hasScenario, truncated: n >= 30000 };
    }

    private renderEmptySelection(): void {
        const box = document.createElement("div");
        box.style.cssText = `padding:18px 22px;font-size:12px;color:${C_SOFT};`;
        box.textContent = this.str(
            "No data for the current selection.",
            "Keine Daten für die aktuelle Auswahl.");
        this.root.replaceChildren(box);
    }

    /**
     * Expand/collapse state (F7): in-memory across cross-filter updates,
     * persisted for bookmarks. An incoming expandState that differs from what
     * we last applied is an external change (bookmark switch) and is adopted;
     * a changed default level in the format pane re-applies the level.
     */
    private syncExpandState(dataView: DataView | undefined): void {
        const persisted = dataView?.metadata?.objects?.["state"]?.["expandState"];
        const persistedStr = persisted == null ? null : String(persisted);
        const lvl = this.settings.hierarchyCard.defaultLevel.value;

        if (this.pendingPersist != null) {
            // one round-trip grace, then clear — a host that drops the write
            // (reading view, embed) must not wedge the ignore branch forever
            if (persistedStr === this.pendingPersist) { this.lastAppliedState = persistedStr; }
            this.pendingPersist = null;
        }

        if (persistedStr != null && persistedStr !== this.lastAppliedState) {
            // external change: bookmark switch or report reopen
            try {
                this.collapsed = new Set(JSON.parse(persistedStr) as string[]);
                this.lastAppliedState = persistedStr;
                this.stateLoaded = true;
            } catch { /* malformed → keep current state */ }
        }

        if (!this.stateLoaded) {
            this.stateLoaded = true;
            this.collapsed = lvl > 0 && this.model
                ? collapseToLevel(this.model.roots, lvl)
                : new Set<string>();
        } else if (this.prevDefaultLevel != null && lvl !== this.prevDefaultLevel && this.model) {
            // format-pane change of the default level wins over the persisted state
            this.collapsed = lvl > 0 ? collapseToLevel(this.model.roots, lvl) : new Set<string>();
            this.persistExpandState();
        }
        this.prevDefaultLevel = lvl;
    }

    private persistExpandState(): void {
        // prune ids that no longer exist in the model — keeps the persisted
        // property bounded and avoids surprise-collapsed rows after refilters
        const ids = [...this.collapsed].filter(id => this.model == null || this.model.byId.has(id));
        const json = JSON.stringify(ids);
        this.pendingPersist = json;
        this.lastAppliedState = json;
        this.host.persistProperties({
            merge: [{ objectName: "state", selector: null, properties: { expandState: json } }],
        });
    }

    // ---------------- reference + formatting ----------------

    private resolveReference(hasScenario: Record<Scenario, boolean>): Scenario | null {
        const pref = String(this.settings.columnsCard.reference.value.value);
        if (pref === "py" || pref === "pl" || pref === "fc") {
            return hasScenario[pref] ? pref : null;
        }
        if (hasScenario.pl) { return "pl"; }
        if (hasScenario.py) { return "py"; }
        if (hasScenario.fc) { return "fc"; }
        return null;
    }

    private scaleInfo(maxAbs: number): { div: number; suffix: string } {
        const mode = String(this.settings.numbersCard.scaling.value.value) as ScalingMode;
        if (mode === "k") { return { div: 1e3, suffix: "k" }; }
        if (mode === "m") { return { div: 1e6, suffix: "m" }; }
        if (mode === "none") { return { div: 1, suffix: "" }; }
        if (maxAbs >= 5e7) { return { div: 1e6, suffix: "m" }; }
        if (maxAbs >= 5e4) { return { div: 1e3, suffix: "k" }; }
        return { div: 1, suffix: "" };
    }

    private fmtValue(v: number | null, div: number, isRatio: boolean, explicitPlus = false): string {
        if (v == null) { return "·"; }
        if (isRatio) {
            const dec = this.settings.numbersCard.pctDecimals.value;
            const s = (v * 100).toLocaleString(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
            return (explicitPlus && v > 0 ? "+" : "") + s + " %";
        }
        const dec = this.settings.numbersCard.decimals.value;
        const s = (v / div).toLocaleString(this.locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });
        return (explicitPlus && v > 0 ? "+" : "") + s;
    }

    private str(en: string, de: string): string {
        return this.locale.toLowerCase().startsWith("de") ? de : en;
    }

    // ---------------- rendering ----------------

    private renderLanding(): void {
        this.root.replaceChildren();
        const box = document.createElement("div");
        box.style.cssText = "padding:22px 26px;max-width:560px;";
        const h = document.createElement("div");
        h.style.cssText = "font-size:15px;font-weight:600;margin-bottom:8px;";
        h.textContent = this.str("P&L Statement byDatenWG", "GuV / P&L Statement byDatenWG");
        const p = document.createElement("div");
        p.style.cssText = `font-size:12px;color:${C_SOFT};line-height:1.55;`;
        p.textContent = this.str(
            "Add the AC measure plus either level columns (L1..Ln, star schema) or Account ID + Parent ID " +
            "(parent-child). Optional: Name, Sort, Row type, Formula, Sign and PY / PL / FC for variance " +
            "columns with IBCS Δ bars and Δ% pins.",
            "AC-Measure zuweisen plus entweder Ebenen-Spalten (L1..Ln, Sternschema) oder Konto-ID + Parent-ID " +
            "(Parent-Child). Optional: Name, Sortierung, Zeilentyp, Formel, Vorzeichen sowie PY / PL / FC für " +
            "Abweichungsspalten mit IBCS-Δ-Balken und Δ%-Pins.");
        box.appendChild(h);
        box.appendChild(p);
        this.root.replaceChildren(box);
    }

    private render(hasScenario: Record<Scenario, boolean>): void {
        const model = this.model;
        if (!model) { return; }
        this.root.replaceChildren();

        const ref = this.resolveReference(hasScenario);
        const visible = flattenVisible(model.roots, this.collapsed);

        // one common scale per Δ column over ALL rows — not just the visible
        // ones, so unit and bar lengths stay stable across expand/collapse;
        // ratio rows (KPI) are excluded so a margin row cannot break the EUR scale
        let maxAbsVal = 0;
        let maxAbsDelta = 0;
        for (const node of model.byId.values()) {
            if (node.row.rowType === "kpi") { continue; }
            for (const s of ["ac", "py", "pl", "fc"] as Scenario[]) {
                const v = node.computed[s];
                if (v != null) { maxAbsVal = Math.max(maxAbsVal, Math.abs(v)); }
            }
            if (ref) {
                const d = variance(node, ref).delta;
                if (d != null) { maxAbsDelta = Math.max(maxAbsDelta, Math.abs(d)); }
            }
        }
        const scale = this.scaleInfo(maxAbsVal);
        const secondRef = this.secondReference(ref, hasScenario);

        // Δ columns get their width from the widest label so SVG text can never
        // be clipped (numbers silently truncated in a finance report are poison)
        let dLabelLen = 1;
        let pLabelLen = 2;
        if (ref) {
            for (const node of model.byId.values()) {
                if (node.row.rowType === "kpi") { continue; }
                const refs: Scenario[] = secondRef ? [ref, secondRef] : [ref];
                for (const r of refs) {
                    const v = variance(node, r);
                    if (v.delta != null) {
                        dLabelLen = Math.max(dLabelLen, this.fmtValue(v.delta, scale.div, false, true).length);
                    }
                    if (v.deltaPct != null) {
                        pLabelLen = Math.max(pLabelLen, this.fmtPctLabel(v.deltaPct).length);
                    }
                }
            }
        }
        const BAR_HALF = 36;
        const PIN_HALF = 26;
        const dLabelW = Math.ceil(dLabelLen * 5.6) + 4;
        const pLabelW = Math.ceil(pLabelLen * 5.6) + 4;

        const cols: ColumnLayout = {
            nameW: 0, valW: 86,
            barW: 2 * (BAR_HALF + dLabelW + 4) + 8,
            pctW: 2 * (PIN_HALF + pLabelW + 4) + 8,
            barHalf: BAR_HALF, pinHalf: PIN_HALF,
            showRef: ref != null && this.settings.columnsCard.showReferenceCol.value,
            showBar: ref != null && this.settings.columnsCard.showDeltaBar.value,
            showPct: ref != null && this.settings.columnsCard.showDeltaPct.value,
            showPct2: false,
        };
        cols.showPct2 = secondRef != null && this.settings.columnsCard.showSecondDelta.value;

        if (this.settings.titleCard.show.value) {
            this.root.appendChild(this.renderTitle(ref, scale.suffix));
        }
        if (this.settings.hierarchyCard.showLevelButtons.value && model.maxDepth > 1) {
            this.root.appendChild(this.renderLevelButtons(model.maxDepth));
        }

        const table = document.createElement("div");
        table.style.cssText = "display:table;border-collapse:collapse;margin:2px 12px 14px 12px;";
        table.appendChild(this.renderHeader(ref, secondRef, cols));
        for (const node of visible) {
            table.appendChild(this.renderRow(node, ref, secondRef, cols, scale, maxAbsDelta));
        }
        this.root.appendChild(table);

        if (model.warnings.length > 0) {
            const warn = document.createElement("div");
            warn.style.cssText = `margin:0 12px 10px 12px;font-size:10px;color:${C_SOFT};`;
            const extra = model.warnings.length - 2;
            warn.textContent = "⚠ " + model.warnings.slice(0, 2).join(" · ")
                + (extra > 0 ? this.str(` · (+${extra} more)`, ` · (+${extra} weitere)`) : "");
            warn.title = model.warnings.join("\n");
            this.root.appendChild(warn);
        }
    }

    private secondReference(ref: Scenario | null, hasScenario: Record<Scenario, boolean>): Scenario | null {
        if (!ref) { return null; }
        const order: Scenario[] = ref === "py" ? ["pl", "fc"] : ["py", "fc"];
        for (const s of order) { if (s !== ref && hasScenario[s]) { return s; } }
        return null;
    }

    private renderTitle(ref: Scenario | null, suffix: string): HTMLElement {
        const t = this.settings.titleCard;
        const wrap = document.createElement("div");
        wrap.style.cssText = "padding:10px 12px 6px 12px;";
        const msg = t.message.value.trim();
        if (msg) {
            const m = document.createElement("div");
            m.style.cssText = "font-size:13px;font-weight:600;margin-bottom:6px;";
            m.textContent = msg;
            wrap.appendChild(m);
        }
        const lines = [
            t.unitLine.value.trim(),
            t.measureLine.value.trim() ||
                (this.str("P&L", "GuV") + (suffix ? ` ${this.str("in", "in")} ${suffix}` : "")),
            t.periodLine.value.trim() ||
                (ref ? `AC, ${ref.toUpperCase()}, Δ${ref.toUpperCase()}` : "AC"),
        ].filter(s => s !== "");
        for (let i = 0; i < lines.length; i++) {
            const el = document.createElement("div");
            el.style.cssText = i === 0
                ? "font-size:12px;font-weight:600;line-height:1.4;"
                : `font-size:11px;color:${C_TEXT};line-height:1.4;`;
            el.textContent = lines[i];
            wrap.appendChild(el);
        }
        return wrap;
    }

    private renderLevelButtons(maxDepth: number): HTMLElement {
        const bar = document.createElement("div");
        bar.style.cssText = "padding:2px 12px 8px 12px;display:flex;gap:4px;";
        const mk = (label: string, title: string, onClick: () => void): void => {
            const b = document.createElement("button");
            b.textContent = label;
            b.title = title;
            b.style.cssText =
                `font-family:${FONT};font-size:10px;padding:2px 8px;cursor:pointer;` +
                `background:#FFF;border:1px solid ${C_GRID_SOFT};border-radius:2px;color:${C_SOFT};`;
            b.onclick = (e) => { e.stopPropagation(); onClick(); };
            bar.appendChild(b);
        };
        for (let lvl = 1; lvl < Math.min(maxDepth, 8); lvl++) {
            mk(String(lvl), this.str(`Expand to level ${lvl}`, `Bis Ebene ${lvl} aufklappen`), () => {
                this.collapsed = collapseToLevel(this.model.roots, lvl);
                this.persistExpandState();
                this.rerender();
            });
        }
        mk(this.str("all", "alle"), this.str("Expand everything", "Alles aufklappen"), () => {
            this.collapsed = new Set();
            this.persistExpandState();
            this.rerender();
        });
        return bar;
    }

    private rerender(): void {
        // re-render from the in-memory model without waiting for the persist round-trip
        this.render(this.lastHasScenario);
    }

    private cell(w: number, align: string): HTMLElement {
        const c = document.createElement("div");
        c.style.cssText =
            `display:table-cell;vertical-align:middle;padding:2px 8px 2px 0;` +
            `width:${w > 0 ? w + "px" : "auto"};text-align:${align};font-size:11px;white-space:nowrap;`;
        return c;
    }

    private renderHeader(ref: Scenario | null, secondRef: Scenario | null, cols: ColumnLayout): HTMLElement {
        const row = document.createElement("div");
        row.style.cssText = "display:table-row;";
        const name = this.cell(0, "left");
        name.style.color = C_SOFT;
        row.appendChild(name);

        const mkScen = (label: string, style: "ac" | "py" | "pl" | "fc"): HTMLElement => {
            const c = this.cell(cols.valW, "right");
            c.style.cssText += `color:${C_SOFT};font-size:10px;`;
            const chip = document.createElement("span");
            const base = "display:inline-block;width:9px;height:9px;margin-right:4px;vertical-align:-1px;";
            if (style === "ac") { chip.style.cssText = base + `background:${C_AC};`; }
            else if (style === "py") { chip.style.cssText = base + `background:${C_PY};`; }
            else if (style === "pl") { chip.style.cssText = base + `background:#FFF;border:1px solid ${C_AC};box-sizing:border-box;`; }
            else {
                chip.style.cssText = base +
                    `background:repeating-linear-gradient(45deg,#FFF,#FFF 2px,${C_AC} 2px,${C_AC} 3px);` +
                    `border:1px solid ${C_AC};box-sizing:border-box;`;
            }
            c.appendChild(chip);
            c.appendChild(document.createTextNode(label));
            return c;
        };

        row.appendChild(mkScen("AC", "ac"));
        if (cols.showRef && ref) { row.appendChild(mkScen(ref.toUpperCase(), ref)); }
        if (cols.showBar && ref) {
            const c = this.cell(cols.barW, "center");
            c.style.cssText += `color:${C_SOFT};font-size:10px;`;
            c.textContent = `Δ${ref.toUpperCase()}`;
            row.appendChild(c);
        }
        if (cols.showPct && ref) {
            const c = this.cell(cols.pctW, "center");
            c.style.cssText += `color:${C_SOFT};font-size:10px;`;
            c.textContent = `Δ${ref.toUpperCase()}%`;
            row.appendChild(c);
        }
        if (cols.showPct2 && secondRef) {
            const c = this.cell(cols.pctW, "center");
            c.style.cssText += `color:${C_SOFT};font-size:10px;`;
            c.textContent = `Δ${secondRef.toUpperCase()}%`;
            row.appendChild(c);
        }
        return row;
    }

    private renderRow(
        node: PnlNode, ref: Scenario | null, secondRef: Scenario | null,
        cols: ColumnLayout, scale: { div: number; suffix: string }, maxAbsDelta: number
    ): HTMLElement {
        const t = node.row.rowType;
        const isRatio = t === "kpi";
        const isSum = t === "subtotal" || t === "formula";
        const indent = this.settings.hierarchyCard.indent.value;

        const row = document.createElement("div");
        row.style.cssText = "display:table-row;cursor:default;";
        if (t === "separator") {
            const c = this.cell(0, "left");
            c.style.cssText += "padding-top:10px;font-weight:600;font-size:10px;color:" + C_SOFT + ";";
            c.textContent = node.row.name === node.row.id ? "" : node.row.name;
            row.appendChild(c);
            return row;
        }

        // name cell: indent + chevron + label
        const name = this.cell(0, "left");
        name.style.paddingLeft = `${node.level * indent}px`;
        name.style.minWidth = "170px";
        if (isSum) { name.style.fontWeight = "600"; }
        if (node.isOrphanBucket) { name.style.color = C_BAD; }
        if (isRatio) { name.style.fontStyle = "italic"; name.style.color = C_SOFT; }

        if (node.hasChildren) {
            const chev = document.createElement("span");
            const open = !this.collapsed.has(node.row.id);
            chev.textContent = open ? "▾ " : "▸ ";
            chev.style.cssText = `cursor:pointer;color:${C_SOFT};font-size:9px;`;
            chev.onclick = (e) => {
                e.stopPropagation();
                if (open) { this.collapsed.add(node.row.id); }
                else { this.collapsed.delete(node.row.id); }
                this.persistExpandState();
                this.rerender();
            };
            name.appendChild(chev);
            name.style.cursor = "pointer";
            name.onclick = chev.onclick;
        } else {
            const pad = document.createElement("span");
            pad.textContent = "  ";
            pad.style.fontSize = "9px";
            name.appendChild(pad);
        }
        const label = document.createElement("span");
        label.textContent = node.row.name;
        name.appendChild(label);
        if (node.error) {
            const err = document.createElement("span");
            err.textContent = " ⚠ " + node.error;
            err.style.cssText = `color:${C_BAD};font-size:9px;`;
            name.appendChild(err);
        }
        row.appendChild(name);

        // subtotal/formula rows get IBCS result lines
        const lineTop = isSum && !isRatio;

        const valCell = (v: number | null, bold: boolean): HTMLElement => {
            const c = this.cell(cols.valW, "right");
            c.style.cssText += "font-variant-numeric:tabular-nums;";
            if (bold) { c.style.fontWeight = "600"; }
            if (lineTop) { c.style.borderTop = `1px solid ${C_LINE}`; }
            c.textContent = this.fmtValue(v, isRatio ? 1 : scale.div, isRatio);
            return c;
        };

        row.appendChild(valCell(displayValue(node, "ac"), isSum));
        if (cols.showRef && ref) { row.appendChild(valCell(displayValue(node, ref), false)); }

        if (ref) {
            const v = variance(node, ref);
            if (cols.showBar) { row.appendChild(this.deltaBarCell(node, v, cols, scale, maxAbsDelta, lineTop, isRatio)); }
            if (cols.showPct) { row.appendChild(this.deltaPctCell(v, cols, lineTop, isRatio)); }
            if (cols.showPct2 && secondRef) {
                const v2 = variance(node, secondRef);
                row.appendChild(this.deltaPctCell(v2, cols, lineTop, isRatio));
            }
        }

        row.onmouseenter = () => { row.style.background = "#FAF9F8"; };
        row.onmouseleave = () => { row.style.background = "transparent"; };
        row.oncontextmenu = (e) => {
            e.preventDefault();
            this.selection.showContextMenu({}, { x: e.clientX, y: e.clientY });
        };
        this.attachTooltip(row, node, scale);
        return row;
    }

    /** Δ bar: horizontal bar from a shared zero line, identical scale for every row (IBCS) */
    private deltaBarCell(
        node: PnlNode, v: { delta: number | null; good: boolean },
        cols: ColumnLayout, scale: { div: number; suffix: string },
        maxAbsDelta: number, lineTop: boolean, isRatio: boolean
    ): HTMLElement {
        const c = this.cell(cols.barW, "left");
        if (lineTop) { c.style.borderTop = `1px solid ${C_LINE}`; }
        if (isRatio || v.delta == null) {
            // ratio rows: Δ in percentage points as text only — no bar, no scale break (F8 guard)
            if (isRatio && v.delta != null) {
                c.style.cssText += "font-variant-numeric:tabular-nums;text-align:center;font-size:10px;";
                c.style.color = v.good ? C_GOOD : C_BAD;
                c.textContent = this.fmtPp(v.delta);
            } else { c.textContent = ""; }
            return c;
        }
        const w = cols.barW - 8;
        const h = 15;
        const mid = w / 2;
        const frac = maxAbsDelta > 0 ? Math.min(Math.abs(v.delta) / maxAbsDelta, 1) : 0;
        const barLen = Math.max(frac * cols.barHalf, v.delta === 0 ? 0 : 1.5);
        const barX = v.delta >= 0 ? mid : mid - barLen;
        const color = v.good ? C_GOOD : C_BAD;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", String(w));
        svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";

        const axis = document.createElementNS(svgNS, "line");
        axis.setAttribute("x1", String(mid)); axis.setAttribute("x2", String(mid));
        axis.setAttribute("y1", "0"); axis.setAttribute("y2", String(h));
        axis.setAttribute("stroke", C_AC); axis.setAttribute("stroke-width", "1");
        svg.appendChild(axis);

        const rect = document.createElementNS(svgNS, "rect");
        rect.setAttribute("x", String(barX)); rect.setAttribute("y", "3");
        rect.setAttribute("width", String(barLen)); rect.setAttribute("height", String(h - 6));
        rect.setAttribute("fill", color);
        svg.appendChild(rect);

        const txt = document.createElementNS(svgNS, "text");
        const label = this.fmtValue(v.delta, scale.div, false, true);
        const anchor = v.delta >= 0 ? "start" : "end";
        const tx = v.delta >= 0 ? mid + barLen + 3 : mid - barLen - 3;
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + 3.5));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", "9.5"); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", C_TEXT);
        txt.textContent = label;
        svg.appendChild(txt);

        c.appendChild(svg);
        return c;
    }

    /** Δ% pin: needle + dot from zero line, capped at ±cap with overflow marker */
    private deltaPctCell(
        v: { deltaPct: number | null; good: boolean },
        cols: ColumnLayout, lineTop: boolean, isRatio: boolean
    ): HTMLElement {
        const c = this.cell(cols.pctW, "left");
        if (lineTop) { c.style.borderTop = `1px solid ${C_LINE}`; }
        if (isRatio || v.deltaPct == null) { c.textContent = ""; return c; }

        const w = cols.pctW - 8;
        const h = 15;
        const mid = w / 2;
        const cap = 0.4; // ±40 % occupies the full pin range; beyond → overflow arrow
        const clamped = Math.max(-cap, Math.min(cap, v.deltaPct));
        const px = mid + (clamped / cap) * cols.pinHalf;
        const overflow = Math.abs(v.deltaPct) > cap;
        const color = v.good ? C_GOOD : C_BAD;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", String(w));
        svg.setAttribute("height", String(h));
        svg.style.cssText = "display:block;";

        const axis = document.createElementNS(svgNS, "line");
        axis.setAttribute("x1", String(mid)); axis.setAttribute("x2", String(mid));
        axis.setAttribute("y1", "0"); axis.setAttribute("y2", String(h));
        axis.setAttribute("stroke", C_AC); axis.setAttribute("stroke-width", "1");
        svg.appendChild(axis);

        const needle = document.createElementNS(svgNS, "line");
        needle.setAttribute("x1", String(mid)); needle.setAttribute("x2", String(px));
        needle.setAttribute("y1", String(h / 2)); needle.setAttribute("y2", String(h / 2));
        needle.setAttribute("stroke", color); needle.setAttribute("stroke-width", "1.4");
        svg.appendChild(needle);

        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", String(px)); dot.setAttribute("cy", String(h / 2));
        dot.setAttribute("r", overflow ? "2.2" : "3");
        dot.setAttribute("fill", color);
        svg.appendChild(dot);

        const txt = document.createElementNS(svgNS, "text");
        const label = this.fmtPctLabel(v.deltaPct);
        const anchor = v.deltaPct >= 0 ? "start" : "end";
        const tx = v.deltaPct >= 0 ? Math.max(px + 4, mid + 4) : Math.min(px - 4, mid - 4);
        txt.setAttribute("x", String(tx)); txt.setAttribute("y", String(h / 2 + 3.5));
        txt.setAttribute("text-anchor", anchor);
        txt.setAttribute("font-size", "9.5"); txt.setAttribute("font-family", FONT);
        txt.setAttribute("fill", C_TEXT);
        txt.textContent = label;
        svg.appendChild(txt);

        c.appendChild(svg);
        return c;
    }

    private fmtPctLabel(deltaPct: number): string {
        const dec = this.settings.numbersCard.pctDecimals.value;
        const overflow = Math.abs(deltaPct) > 0.4;
        return (deltaPct > 0 ? "+" : "") + (deltaPct * 100).toLocaleString(this.locale,
            { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (overflow ? "▸" : "");
    }

    private fmtPp(delta: number): string {
        const dec = this.settings.numbersCard.pctDecimals.value;
        const s = (delta * 100).toLocaleString(this.locale,
            { minimumFractionDigits: dec, maximumFractionDigits: dec });
        return (delta > 0 ? "+" : "") + s + " pp";
    }

    private attachTooltip(row: HTMLElement, node: PnlNode, scale: { div: number; suffix: string }): void {
        const tooltipService = this.host.tooltipService;
        if (!tooltipService || !tooltipService.enabled || !tooltipService.enabled()) { return; }
        const isRatio = node.row.rowType === "kpi";
        // build once per row — not on every mousemove
        const dataItems: VisualTooltipDataItem[] = [];
        for (const s of ["ac", "py", "pl", "fc"] as Scenario[]) {
            const v = displayValue(node, s);
            if (v == null) { continue; }
            dataItems.push({
                displayName: s.toUpperCase(),
                value: this.fmtValue(v, isRatio ? 1 : scale.div, isRatio) + (isRatio || !scale.suffix ? "" : " " + scale.suffix),
                header: node.row.name,
            });
        }
        row.onmousemove = (e) => {
            tooltipService.show({
                coordinates: [e.clientX, e.clientY],
                isTouchEvent: false,
                dataItems,
                identities: [],
            });
        };
        // merge with the hover-background handler; mouseleave (not mouseout)
        // so moving across child elements does not flicker the tooltip
        const prevLeave = row.onmouseleave;
        row.onmouseleave = (e) => {
            if (prevLeave) { prevLeave.call(row, e); }
            tooltipService.hide({ immediately: false, isTouchEvent: false });
        };
    }
}
