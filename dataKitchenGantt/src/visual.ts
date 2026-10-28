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
import { GanttRenderer, GanttTask, computeTaskColors, parseVorgaenger } from "./gantt";

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

// „Hauptmeilenstein" tolerant auslegen: die Rolle wird in der Praxis mit allem
// Möglichen befüllt — Bool-Spalte, 1/0-Kennzahl oder Textspalte „Ja"/„X".
// Alles, was nicht erkennbar ein Ja ist (auch leer und null), zählt als Nein.
// Gilt genauso für "Kritisch (Ja/Nein)" aus MS-Project-Exporten.
const JA = new Set(['ja', 'yes', 'y', 'x', 'wahr', 'true', '1']);

function istJa(v: unknown): boolean {
    if (v === true) return true;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return JA.has(v.trim().toLowerCase());
    return false;
}

// Gesamte Pufferzeit: Zahl in Arbeitstagen oder MS-Project-Text wie "3 Tage",
// "-2 T", "1,5 Wochen" (W = 5, Mo = 20 Arbeitstage, h = 1/8, "e"-Präfix = fortlaufend)
function parsePuffer(v: unknown): number | null {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    const m = /^\s*(-?\d+(?:[.,]\d+)?)\s*([a-zäöü]*)/i.exec(String(v));
    if (!m) return null;
    const n = parseFloat(m[1].replace(',', '.'));
    const u = m[2].toLowerCase().replace(/^e(?=[a-zäöü])/, '');
    if (/^(w|wo|woche|wochen|wk|wks|week|weeks)$/.test(u)) return n * 5;
    if (/^(mo|mon|monat|monate|month|months)$/.test(u)) return n * 20;
    if (/^(h|std|stunde|stunden|hr|hrs|hour|hours)$/.test(u)) return n / 8;
    if (/^(m|min|minute|minuten|minutes)$/.test(u)) return n / 480;
    return n;
}

function fmtWert(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (v instanceof Date) {
        if (isNaN(v.getTime())) return '';
        return ('0' + v.getDate()).slice(-2) + '.' + ('0' + (v.getMonth() + 1)).slice(-2) + '.' + String(v.getFullYear()).slice(2);
    }
    if (typeof v === 'number') return isFinite(v) ? v.toLocaleString('de-DE', { maximumFractionDigits: 2 }) : '';
    if (typeof v === 'boolean') return v ? 'Ja' : 'Nein';
    return String(v).trim();
}

// PSP-Codes natürlich sortieren: 2.9 vor 2.10, Elternteil vor Kind
function pspVergleich(a: string, b: string): number {
    const pa = a.split('.'), pb = b.split('.');
    for (let i = 0; i < Math.min(pa.length, pb.length); i++) {
        const na = Number(pa[i]), nb = Number(pb[i]);
        const c = isFinite(na) && isFinite(nb) ? na - nb : pa[i].localeCompare(pb[i], 'de');
        if (c !== 0) return c;
    }
    return pa.length - pb.length;
}

function parseData(dataView: DataView | undefined, host: IVisualHost, koepfe: string[]): TaskWithId[] {
    const cat = dataView && dataView.categorical;
    if (!cat || !cat.categories || !cat.categories.length) return [];

    const byRole = (role: string): DataViewCategoryColumn | undefined =>
        cat.categories.find(c => c.source.roles && c.source.roles[role]);

    // Mehrfeld-Rolle (aktuell nur "phase"): ALLE gebundenen Spalten, in der
    // Reihenfolge des Feldbrunnens. categories folgt ihr in der Regel schon,
    // source.index stabilisiert es auch dann, wenn nicht.
    const allByRole = (role: string): DataViewCategoryColumn[] =>
        cat.categories
            .filter(c => c.source.roles && c.source.roles[role])
            .map((c, i) => ({ c, i }))
            .sort((a, b) => {
                const ai = typeof a.c.source.index === 'number' ? a.c.source.index : a.i;
                const bi = typeof b.c.source.index === 'number' ? b.c.source.index : b.i;
                return ai !== bi ? ai - bi : a.i - b.i;
            })
            .map(x => x.c);

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
    const phaseCols = allByRole('phase');
    const projektCol = byRole('projekt');
    const statusCol = byRole('status');
    const ownerCol = byRole('owner');
    const depsCol = byRole('deps');
    const planStartVals = valsByRole('planStart');
    const planEndVals = valsByRole('planEnd');
    const sortVals = valsByRole('sort');
    const hauptVals = valsByRole('hauptMs');
    const nrCol = byRole('nr');
    const pspCol = byRole('psp');
    const kritVals = valsByRole('kritisch');
    const pufferVals = valsByRole('puffer');
    const stichVals = valsByRole('stichtag');
    const farbeCol = byRole('farbeNach');
    // Zusatzspalten: Kategorie-Spalten UND Measures, in Feldbrunnen-Reihenfolge
    const zusatz: { idx: number; name: string; values: unknown[] }[] = [];
    cat.categories.forEach((c, i) => {
        if (c.source.roles && c.source.roles['zusatz']) zusatz.push({ idx: typeof c.source.index === 'number' ? c.source.index : i, name: c.source.displayName, values: c.values as unknown[] });
    });
    if (cat.values) cat.values.forEach((v, i) => {
        if (v.source.roles && v.source.roles['zusatz']) zusatz.push({ idx: typeof v.source.index === 'number' ? v.source.index : 1000 + i, name: v.source.displayName, values: v.values as unknown[] });
    });
    zusatz.sort((a, b) => a.idx - b.idx);
    zusatz.splice(3);
    koepfe.length = 0;
    zusatz.forEach(z => koepfe.push(z.name));
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

        // Ebenen-Pfad: leere Stufen werden verdichtet, damit ein Zweig, der
        // früher endet, keine namenlosen Zwischengruppen erzeugt.
        const path: string[] = [];
        for (const pc of phaseCols) {
            const v = pc.values[i];
            if (v === null || v === undefined) continue;
            const sv = String(v).trim();
            if (sv !== '') path.push(sv);
        }
        const phase = path.length ? path[0] : null;
        const projektRaw = projektCol ? projektCol.values[i] : null;
        const projekt = projektRaw === null || projektRaw === undefined || String(projektRaw).trim() === '' ? null : String(projektRaw).trim();
        const stRaw = statusCol ? statusCol.values[i] : null;
        const st = stRaw === null || stRaw === undefined || String(stRaw).trim() === '' ? null : String(stRaw).trim();
        const owRaw = ownerCol ? ownerCol.values[i] : null;
        const ow = owRaw === null || owRaw === undefined ? '' : String(owRaw).trim();
        const depsRaw = depsCol ? depsCol.values[i] : null;
        const deps = depsRaw === null || depsRaw === undefined ? [] :
            String(depsRaw).split(/[,;]/).map(d => d.trim()).filter(d => d.length > 0);
        // MS-Project-Vorgänger ("12;15EA+2T") — Namenslisten bleiben Namen
        const depRefs = depsRaw === null || depsRaw === undefined ? [] : parseVorgaenger(String(depsRaw));
        const nrRaw = nrCol ? nrCol.values[i] : null;
        const nr = nrRaw === null || nrRaw === undefined || String(nrRaw).trim() === '' ? null
            : (typeof nrRaw === 'number' ? String(Math.round(nrRaw)) : String(nrRaw).trim());
        const pspRaw = pspCol ? pspCol.values[i] : null;
        const psp = pspRaw === null || pspRaw === undefined || String(pspRaw).trim() === '' ? null : String(pspRaw).trim().replace(/\.+$/, '');
        const farbeRaw = farbeCol ? farbeCol.values[i] : null;
        const farbeWert = farbeRaw === null || farbeRaw === undefined || String(farbeRaw).trim() === '' ? null : String(farbeRaw).trim();

        // Individuelle Farbe: Instanz-Formatierung aus dem "dataPoint"-Objekt
        // (per-Task-Farbwähler im Formatbereich, siehe getFormattingModel()).
        const rowObjs = taskCol.objects ? taskCol.objects[i] : undefined;
        const fillObj = rowObjs && rowObjs.dataPoint ? (rowObjs.dataPoint.fill as powerbi.Fill) : undefined;
        const color = fillObj && fillObj.solid && fillObj.solid.color ? fillObj.solid.color : null;

        // Schlüssel = Pfad + Name. Vorgangsnamen sind in MS-Project-Plänen nicht
        // eindeutig (derselbe Name taucht in mehreren Zweigen auf); der Pfad ist es.
        // Für echte Dubletten innerhalb desselben Zweigs bleibt das Suffix.
        // Mit Nr. ist der Schlüssel eindeutig wie in MS Project; mit PSP-Code
        // trennt der Code gleichnamige Vorgänge in verschiedenen Zweigen.
        let key = (projekt !== null ? projekt + '¦' : '')
            + (nr !== null ? '#' + nr
                : (path.length ? path.join('¦') + '¦' : '') + (psp !== null ? psp + '¦' : '') + name);
        while (usedKeys.has(key)) key = key + '⁣';
        usedKeys.add(key);

        tasks.push({
            key, name, phase, path, projekt, s, e, pct, st, ow, deps, color, ps, pe,
            // ohne gebundene Rolle bleiben die Felder undefined — die zugehörigen
            // Ansichten/Spalten erscheinen dann gar nicht erst
            haupt: hauptVals ? istJa(hauptVals[i]) : undefined,
            depRefs, nr, psp, farbeWert,
            kritisch: kritVals ? istJa(kritVals[i]) : undefined,
            puffer: pufferVals ? parsePuffer(pufferVals[i]) : undefined,
            stichtag: stichVals ? toUtcMs(stichVals[i]) : undefined,
            zusatz: zusatz.length ? zusatz.map(z => fmtWert(z.values[i])) : undefined,
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
    // Ohne Sortier-Rolle die Planreihenfolge aus MS Project: Nr., sonst PSP-Code.
    // Power BI liefert die Zeilen sonst alphabetisch nach der ersten Kategorie.
    if (tasks.some(t => t.nr)) {
        const num = (t: TaskWithId) => { const v = Number(t.nr); return isFinite(v) ? v : Infinity; };
        return tasks.map((t, i) => ({ t, i })).sort((a, b) => (num(a.t) - num(b.t)) || (a.i - b.i)).map(d => d.t);
    }
    if (tasks.some(t => t.psp)) {
        return tasks.map((t, i) => ({ t, i }))
            .sort((a, b) => (a.t.psp && b.t.psp ? pspVergleich(a.t.psp, b.t.psp) : (a.t.psp ? -1 : b.t.psp ? 1 : 0)) || (a.i - b.i))
            .map(d => d.t);
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
    private zusatzKoepfe: string[] = [];

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
        const bs = this.formattingSettings.beschriftungenCard;
        const b = this.formattingSettings.basisplanCard;
        const ms = this.formattingSettings.meilensteineCard;
        const tp = this.formattingSettings.tooltipCard;
        const ze = this.formattingSettings.zeiteinheitenCard;
        const pl = this.formattingSettings.terminplanungCard;
        const bk = this.formattingSettings.balkenCard;
        const f = this.formattingSettings.schriftCard.font;
        const allow = this.host.hostCapabilities.allowInteractions !== false;
        this.renderer.setOptions({
            dark: String(d.theme.value.value) === 'dunkel',
            ibcs: d.ibcs.value,
            wochenenden: d.wochenenden.value,
            abhaengigkeiten: d.abhaengigkeiten.value,
            heuteLinie: d.heuteLinie.value,
            tabellenBreite: d.tabellenBreite.value,
            spalten: {
                start: sp.start.value, end: sp.ende.value, days: sp.tage.value,
                status: sp.status.value, pct: sp.fortschritt.value, ow: sp.wer.value,
                psp: sp.psp.value, puffer: sp.puffer.value, stichtag: sp.stichtag.value, zusatz: sp.zusatz.value
            },
            namenZweizeilig: sp.zweizeilig.value,
            zusatzKoepfe: this.zusatzKoepfe.slice(),
            startAnsicht: String(d.startAnsicht.value.value),
            kritischHervorheben: pl.kritischHervorheben.value,
            ueberfaelligMarkieren: pl.ueberfaelligMarkieren.value,
            pufferAnzeigen: pl.pufferAnzeigen.value,
            stichtageAnzeigen: pl.stichtageAnzeigen.value,
            fortschrittslinie: pl.fortschrittslinie.value,
            arbeitstage: pl.arbeitstage.value,
            feiertage: pl.feiertage.value,
            farbeNach: String(bk.farbeNach.value.value),
            legende: bk.legende.value,
            gruppenNamen: d.gruppenNamen.value,
            texte: {
                spalteTask: bs.spalteTask.value, projekt1: bs.projekt1.value, projektN: bs.projektN.value,
                ebene1: bs.ebene1.value, ebeneN: bs.ebeneN.value
            },
            kopfzeile: d.kopfzeile.value,
            tooltip: tp.anzeigen.value,
            tipZeilen: {
                zeitraum: tp.zeitraum.value, plan: tp.plan.value, abweichung: tp.abweichung.value,
                dauer: tp.dauer.value, status: tp.status.value, fortschritt: tp.fortschritt.value,
                wer: tp.wer.value, abhaengigkeiten: tp.abhaengigkeiten.value, planung: tp.planung.value
            },
            zeiteinheiten: {
                tage: ze.tage.value, wochen: ze.wochen.value, monate: ze.monate.value,
                quartale: ze.quartale.value, jahre: ze.jahre.value
            },
            basisplan: b.anzeigen.value,
            deltaSpalte: b.deltaSpalte.value,
            verzugZeilen: b.verzugZeilen.value,
            statusDatum: this.statusDatum,
            zeiteinheit: String(d.zeiteinheit.value.value),
            tageEinheit: String(d.tageEinheit.value.value),
            msAufPhase: ms.aufPhasenzeile.value,
            msDatum: ms.datumAnzeigen.value,
            msNamen: ms.namenAnzeigen.value,
            msBeschriftung: String(ms.beschriftung.value.value),
            msEndeGleichStart: ms.endeGleichStart.value,
            fontFamily: f.fontFamily.value,
            fontSize: f.fontSize.value,
            selectedKeys: this.selectedKeys(),
            interactionsAllowed: allow,
            onSelect: (task, ev) => {
                if (!allow) return;
                const multi = ev.ctrlKey || ev.metaKey;
                this.selectionManager.select((task as TaskWithId).selectionId, multi).then(() => this.pushOptions());
            },
            onSelectMany: (tasks, ev) => {
                if (!allow) return;
                const multi = ev.ctrlKey || ev.metaKey;
                const ids = tasks.map(t => (t as TaskWithId).selectionId);
                this.selectionManager.select(ids, multi).then(() => this.pushOptions());
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

            this.data = parseData(dataView, this.host, this.zusatzKoepfe);
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
            const dark = String(this.formattingSettings.darstellungCard.theme.value.value) === 'dunkel';
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
