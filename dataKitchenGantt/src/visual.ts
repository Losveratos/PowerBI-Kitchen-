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
import DataView = powerbi.DataView;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;

import { VisualFormattingSettingsModel } from "./settings";
import { GanttRenderer, GanttTask, computeTaskColors, isDarkHex } from "./gantt";

// ============================================================
// DataKitchen Gantt — Power-BI-Anbindung.
// Rendering-Kern liegt host-unabhängig in gantt.ts (auch vom
// Browser-Testharness unter test/ genutzt). Hier passiert nur:
// DataView → GanttTask[], Formatting-Settings → GanttOptions,
// Selektion (Crossfilter) & Kontextmenü über ISelectionManager.
//
// Meilenstein-Regel: Zeilen ohne "Ende"-Wert werden als
// Meilenstein (Raute) gerendert.
// ============================================================

interface TaskWithId extends GanttTask {
    selectionId: ISelectionId;
}

function toUtcMs(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    if (v instanceof Date) {
        if (isNaN(v.getTime())) return null;
        return Date.UTC(v.getFullYear(), v.getMonth(), v.getDate());
    }
    if (typeof v === 'number' && isFinite(v)) {
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    }
    if (typeof v === 'string') {
        const d = new Date(v);
        if (isNaN(d.getTime())) return null;
        return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    }
    return null;
}

function parseData(dataView: DataView | undefined, host: IVisualHost): TaskWithId[] {
    const cat = dataView && dataView.categorical;
    if (!cat || !cat.categories || !cat.categories.length) return [];

    const byRole = (role: string): DataViewCategoryColumn | undefined =>
        cat.categories.find(c => c.source.roles && c.source.roles[role]);

    // GroupingOrMeasure-Rollen können als Kategorie-Spalte ODER als Measure
    // ankommen (z. B. Plan-Termine aus [Anfang/Ende (Basisplan)]-Measures,
    // die den Stand-Filter per REMOVEFILTERS ignorieren)
    const valsByRole = (role: string): unknown[] | undefined => {
        const c = byRole(role);
        if (c) return c.values as unknown[];
        const v = cat.values && cat.values.find(vc => vc.source.roles && vc.source.roles[role]);
        return v ? (v.values as unknown[]) : undefined;
    };

    const taskCol = byRole('task');
    const startCol = byRole('start');
    if (!taskCol || !startCol) return [];
    const endCol = byRole('end');
    const phaseCol = byRole('phase');
    const projektCol = byRole('projekt');
    const statusCol = byRole('status');
    const ownerCol = byRole('owner');
    const depsCol = byRole('deps');
    const planStartVals = valsByRole('planStart');
    const planEndVals = valsByRole('planEnd');
    const sortVals = valsByRole('sort');
    const progCol = cat.values && cat.values.find(v => v.source.roles && v.source.roles['progress']);

    // Fortschritts-Skala erkennen: alles ≤ 1 → als Anteil interpretieren
    let pctScale = 1;
    if (progCol) {
        const nums = (progCol.values as unknown[]).filter(v => typeof v === 'number' && isFinite(v as number)) as number[];
        if (nums.length && Math.max(...nums.map(Math.abs)) <= 1) pctScale = 100;
    }

    const tasks: TaskWithId[] = [];
    const sortKeys: unknown[] = [];
    const usedKeys = new Set<string>();
    const n = taskCol.values.length;
    for (let i = 0; i < n; i++) {
        const rawName = taskCol.values[i];
        const name = rawName === null || rawName === undefined ? '' : String(rawName).trim();
        if (!name) continue;
        const s = toUtcMs(startCol.values[i]);
        if (s === null) continue;
        let e = endCol ? toUtcMs(endCol.values[i]) : null;
        if (e !== null && e < s) e = s;

        // Basisplan: Plan-Ende ohne Plan-Start erbt den Plan-Start vom Ist-Start,
        // damit auch "nur Plan-Ende gebunden" ein sinnvolles Delta liefert
        let ps = planStartVals ? toUtcMs(planStartVals[i]) : null;
        let pe = planEndVals ? toUtcMs(planEndVals[i]) : null;
        if (ps === null && pe !== null) ps = s;
        if (pe !== null && ps !== null && pe < ps) pe = ps;

        let pct: number | null = null;
        if (progCol) {
            const raw = progCol.values[i];
            if (typeof raw === 'number' && isFinite(raw)) {
                pct = Math.round(Math.max(0, Math.min(100, raw * pctScale)));
            }
        }

        const phaseRaw = phaseCol ? phaseCol.values[i] : null;
        const phase = phaseRaw === null || phaseRaw === undefined || String(phaseRaw).trim() === '' ? null : String(phaseRaw).trim();
        const projektRaw = projektCol ? projektCol.values[i] : null;
        const projekt = projektRaw === null || projektRaw === undefined || String(projektRaw).trim() === '' ? null : String(projektRaw).trim();
        const stRaw = statusCol ? statusCol.values[i] : null;
        const st = stRaw === null || stRaw === undefined || String(stRaw).trim() === '' ? null : String(stRaw).trim();
        const owRaw = ownerCol ? ownerCol.values[i] : null;
        const ow = owRaw === null || owRaw === undefined ? '' : String(owRaw).trim();
        const depsRaw = depsCol ? depsCol.values[i] : null;
        const deps = depsRaw === null || depsRaw === undefined ? [] :
            String(depsRaw).split(/[,;]/).map(d => d.trim()).filter(d => d.length > 0);

        // Individuelle Farbe: Instanz-Formatierung aus dem "dataPoint"-Objekt
        // (per-Task-Farbwähler im Formatbereich, siehe getFormattingModel()).
        const rowObjs = taskCol.objects ? taskCol.objects[i] : undefined;
        const fillObj = rowObjs && rowObjs.dataPoint ? (rowObjs.dataPoint.fill as powerbi.Fill) : undefined;
        const color = fillObj && fillObj.solid && fillObj.solid.color ? fillObj.solid.color : null;

        // Schlüssel = Task-Name; bei Duplikaten Suffix, damit Rows eindeutig bleiben
        let key = name;
        while (usedKeys.has(key)) key = key + '⁣';
        usedKeys.add(key);

        tasks.push({
            key, name, phase, projekt, s, e, pct, st, ow, deps, color, ps, pe,
            selectionId: host.createSelectionIdBuilder().withCategory(taskCol, i).createSelectionId()
        });
        sortKeys.push(sortVals ? sortVals[i] : null);
    }

    // Optionale Sortier-Rolle (z. B. MS-Project-Zeilenreihenfolge): stabil
    // aufsteigend sortieren; numerisch wenn möglich, sonst als Text
    if (sortVals) {
        const decorated = tasks.map((t, i) => ({ t, v: sortKeys[i], i }));
        decorated.sort((a, b) => {
            const av = typeof a.v === 'number' ? a.v : parseFloat(String(a.v));
            const bv = typeof b.v === 'number' ? b.v : parseFloat(String(b.v));
            if (isFinite(av) && isFinite(bv) && av !== bv) return av - bv;
            if (!isFinite(av) || !isFinite(bv)) {
                const c = String(a.v).localeCompare(String(b.v), 'de');
                if (c !== 0) return c;
            }
            return a.i - b.i;
        });
        return decorated.map(d => d.t);
    }
    return tasks;
}

// Statusdatum aus der (optionalen) statusDate-Rolle: erster nicht-leerer Wert
// (Spalte oder Measure — pro Zeile identisch, daher reicht der erste Treffer)
function parseStatusDate(dataView: DataView | undefined): number | null {
    const cat = dataView && dataView.categorical;
    if (!cat) return null;
    const catCol = cat.categories && cat.categories.find(c => c.source.roles && c.source.roles['statusDate']);
    const valCol = !catCol && cat.values ? cat.values.find(v => v.source.roles && v.source.roles['statusDate']) : undefined;
    const vals = catCol ? (catCol.values as unknown[]) : (valCol ? (valCol.values as unknown[]) : null);
    if (!vals) return null;
    for (const v of vals) {
        const ms = toUtcMs(v);
        if (ms !== null) return ms;
    }
    return null;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private events: IVisualEventService;
    private selectionManager: ISelectionManager;
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;
    private renderer: GanttRenderer;
    private data: TaskWithId[] = [];
    private statusDatum: number | null = null;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = options.host.createSelectionManager();
        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();

        this.renderer = new GanttRenderer(options.element);
        this.selectionManager.registerOnSelectCallback(() => this.pushOptions());
    }

    private selectedKeys(): ReadonlySet<string> | null {
        const ids = this.selectionManager.getSelectionIds() as unknown as ISelectionId[];
        if (!ids || !ids.length) return null;
        const keys = new Set<string>();
        this.data.forEach(t => {
            if (ids.some(id => id.equals(t.selectionId))) keys.add(t.key);
        });
        return keys.size ? keys : null;
    }

    private pushOptions(): void {
        const d = this.formattingSettings.darstellungCard;
        const sp = this.formattingSettings.spaltenCard;
        const fb = this.formattingSettings.farbenCard;
        const gr = this.formattingSettings.groessenCard;
        const b = this.formattingSettings.basisplanCard;
        const ms = this.formattingSettings.meilensteineCard;
        const f = this.formattingSettings.schriftCard.font;
        const allow = this.host.hostCapabilities.allowInteractions !== false;
        this.renderer.setOptions({
            dark: String(d.theme.value.value) === 'dunkel',
            ibcs: d.ibcs.value,
            wochenenden: d.wochenenden.value,
            abhaengigkeiten: d.abhaengigkeiten.value,
            heuteLinie: d.heuteLinie.value,
            tabellenBreite: d.tabellenBreite.value,
            // Schlüssel = Spalten-Keys aus gantt.ts (ALL_COLS)
            spalten: {
                start: sp.start.value,
                end: sp.ende.value,
                days: sp.tage.value,
                status: sp.status.value,
                pct: sp.fortschritt.value,
                ow: sp.wer.value
            },
            basisplan: b.anzeigen.value,
            deltaSpalte: b.deltaSpalte.value,
            verzugZeilen: b.verzugZeilen.value,
            statusDatum: this.statusDatum,
            zeiteinheit: String(d.zeiteinheit.value.value),
            tageEinheit: String(d.tageEinheit.value.value),
            msAufPhase: ms.aufPhasenzeile.value,
            msDatum: ms.datumAnzeigen.value,
            msEndeGleichStart: ms.endeGleichStart.value,
            farben: {
                eigene: fb.eigene.value,
                hintergrund: fb.hintergrund.value.value,
                schrift: fb.schrift.value.value,
                schriftSekundaer: fb.schriftSekundaer.value.value,
                linien: fb.linien.value.value,
                statusLinie: fb.statusLinie.value.value
            },
            groessen: {
                zeilenhoehe: gr.zeilenhoehe.value,
                balkenhoehe: gr.balkenhoehe.value,
                phasenbalken: gr.phasenbalken.value,
                meilenstein: gr.meilenstein.value,
                achsenhoehe: gr.achsenhoehe.value,
                kopfzeile: gr.kopfzeile.value,
                schriftTabelle: gr.schriftTabelle.value,
                schriftAchse: gr.schriftAchse.value,
                schriftLabels: gr.schriftLabels.value
            },
            fontFamily: f.fontFamily.value,
            fontSize: f.fontSize.value,
            selectedKeys: this.selectedKeys(),
            interactionsAllowed: allow,
            onSelect: (task, ev) => {
                if (!allow) return;
                const multi = ev.ctrlKey || ev.metaKey;
                this.selectionManager.select((task as TaskWithId).selectionId, multi).then(() => this.pushOptions());
            },
            onContextMenu: (task, ev) => {
                if (!allow) return;
                this.selectionManager.showContextMenu((task as TaskWithId).selectionId, { x: ev.clientX, y: ev.clientY });
            },
            onClear: () => {
                if (!allow) return;
                this.selectionManager.clear().then(() => this.pushOptions());
            },
            onTableWidth: (w) => {
                // Per Trenner gezogene Breite in die Formatoptionen zurückschreiben,
                // damit sie den Reload/Publish überlebt
                this.host.persistProperties({
                    merge: [{
                        objectName: 'darstellung',
                        selector: undefined as unknown as powerbi.data.Selector,
                        properties: { tabellenBreite: w }
                    }]
                });
            }
        });
    }

    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        try {
            const dataView = options.dataViews && options.dataViews[0];
            this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);

            this.data = parseData(dataView, this.host);
            this.statusDatum = parseStatusDate(dataView);
            this.renderer.setData(this.data);
            this.pushOptions();

            this.events.renderingFinished(options);
        } catch (error) {
            console.error('Error in update method', error);
            this.events.renderingFailed(options, String(error));
        }
    }

    public destroy(): void {
        this.renderer.destroy();
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        const model = this.formattingSettingsService.buildFormattingModel(this.formattingSettings);

        // Per-Task-Farbwähler: dynamisch erzeugt, da die Anzahl der Zeilen
        // erst zur Laufzeit bekannt ist (kein statisches FormattingSettingsCard
        // möglich). Vorbelegung mit der Phasen-Palette, damit die Swatches im
        // Formatbereich schon vor einer manuellen Auswahl zur Grafik passen.
        if (this.data.length) {
            // Swatches müssen zur gerenderten Palette passen: bei eigenen Farben
            // entscheidet die Helligkeit des Hintergrunds, sonst das Theme
            const fb = this.formattingSettings.farbenCard;
            const dark = fb.eigene.value
                ? isDarkHex(fb.hintergrund.value.value)
                : String(this.formattingSettings.darstellungCard.theme.value.value) === 'dunkel';
            const defaults = computeTaskColors(this.data, dark);
            model.cards.push({
                uid: 'dataPoint_card',
                displayName: 'Task-Farben',
                groups: [{
                    uid: 'dataPoint_group',
                    displayName: '',
                    slices: this.data.map((d): powerbi.visuals.SimpleVisualFormattingSlice => ({
                        uid: 'dataPoint_slice_' + d.key,
                        displayName: d.name,
                        control: {
                            type: powerbi.visuals.FormattingComponent.ColorPicker,
                            properties: {
                                descriptor: {
                                    objectName: 'dataPoint',
                                    propertyName: 'fill',
                                    selector: d.selectionId.getSelector()
                                },
                                value: { value: d.color ? d.color : (defaults.get(d.key) as string) }
                            }
                        }
                    }))
                }]
            });
        }

        return model;
    }
}
