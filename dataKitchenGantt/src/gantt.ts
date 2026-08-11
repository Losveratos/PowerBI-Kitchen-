"use strict";

// ============================================================
// DataKitchen Gantt — Rendering-Kern, portiert aus
// "Gantt Chart - DataKitchen.html" (dc-Runtime-Komponente).
//
// Host-unabhängig gehalten: keine Power-BI-Imports, damit derselbe
// Code sowohl im Custom Visual (src/visual.ts) als auch im
// Browser-Testharness (test/harness.html) läuft.
//
// Gegenüber der Referenz entfällt das Drag-Verschieben/-Verlängern
// der Balken bewusst — Power BI bindet Start/Ende aus dem Datenmodell,
// ein Verschieben im Visual hätte keinen persistenten Effekt (gleiche
// Entscheidung wie beim CSV-Overlay im ibcsCategoryWaterfall-Port).
// Erhalten bleiben: Pannen (Drag/Scrollen), Zoomen (Strg+Scrollen,
// +/−, Modi Tage/Wochen/Monate), "Heute"/"Alles", Phasen-Collapse,
// Hover-Tooltip, vertikales Scrollen. Neu für Power BI: Klick auf
// Task = Selektion (Crossfilter via Callback), Rechtsklick = Kontextmenü.
//
// Rendering per DOM-Knoten (textContent, kein innerHTML) — Task-Namen
// stammen aus dem DataView (Nutzerdaten).
// ============================================================

export interface GanttTask {
    key: string;           // eindeutiger Schlüssel (i. d. R. Task-Name)
    name: string;
    projekt?: string | null;   // oberste Ebene (Portfolio): Projektzeile über den Phasen
    phase: string | null;
    s: number;             // Start als UTC-Mitternacht (ms)
    e: number | null;      // Ende (ms); null → Meilenstein
    pct: number | null;    // 0..100 oder null (nicht gebunden)
    st: string | null;
    ow: string;
    deps: string[];        // Schlüssel anderer Tasks
    color?: string | null; // individuelle Farbe (Format-Pane-Override, hex)
    ps?: number | null;    // Basisplan-Start (ms); null/fehlend = kein Plan
    pe?: number | null;    // Basisplan-Ende (ms)
}

// Eigene Farbpalette (Karte „Farben"). Greift nur bei eigene=true; alles, was
// hier nicht steht (Wochenend-Schattierung, Hover, Tooltip, Status-Pills), wird
// aus der Helligkeit des Hintergrunds abgeleitet — damit bleibt ein dunkler
// Wunsch-Hintergrund auch ohne Dunkel-Theme lesbar.
export interface GanttFarben {
    eigene: boolean;
    hintergrund: string;    // Fläche von Tabelle und Chart
    schrift: string;        // Task-Namen, Überschriften, Balken-Beschriftung
    schriftSekundaer: string;  // Datumsangaben, Achsen, Meta-Texte
    linien: string;         // Rahmen, Zeilentrenner, Raster
    statusLinie: string;    // Status-/Heute-Linie
}

// Größen-Overrides (Karte „Größen"). 0 bedeutet überall „automatisch", also der
// bisherige, aus der Basis-Schriftgröße abgeleitete Wert.
export interface GanttGroessen {
    zeilenhoehe: number;
    balkenhoehe: number;
    phasenbalken: number;
    meilenstein: number;
    achsenhoehe: number;
    kopfzeile: number;
    schriftTabelle: number;   // Referenzgröße der Tabellentexte (Default 12)
    schriftAchse: number;     // Referenzgröße der Zeitachse (Default 12)
    schriftLabels: number;    // Referenzgröße der Beschriftungen am Balken (Default 11)
}

export interface GanttOptions {
    dark: boolean;
    ibcs: boolean;                      // IBCS-inspiriertes Styling (monochrom, Weiß-BG)
    wochenenden: boolean;
    abhaengigkeiten: boolean;
    heuteLinie: boolean;
    tabellenBreite: number;             // 0 = Tabelle ausblenden
    spalten?: { [key: string]: boolean };  // Tabellenspalten an/aus, Schlüssel wie ALL_COLS
                                        // (start|end|days|delta|status|pct|ow); fehlend = an
    basisplan?: boolean;                // Plan-Balken zeichnen (default true)
    deltaSpalte?: boolean;              // Δ-Spalte in der Tabelle (default true)
    verzugZeilen?: boolean;             // Zeilen mit Verzug rot hinterlegen (default true)
    statusDatum?: number | null;        // rote Linie: Statusdatum statt "Heute" (UTC ms)
    zeiteinheit?: string;               // 'auto' | 'Tage' | 'Wochen' | 'Monate' | 'Quartale' | 'Jahre'
    tageEinheit?: string;               // 't' | 'd' | 'ohne'
    msAufPhase?: boolean;               // Meilensteine auf zugeklappten Phasenzeilen zeigen (default true)
    msDatum?: boolean;                  // Datum am Meilenstein anzeigen (default true)
    msEndeGleichStart?: boolean;        // Ende = Start ebenfalls als Meilenstein werten (default false)
    farben?: GanttFarben;               // eigene Farben statt Theme-Palette
    groessen?: GanttGroessen;           // Größen-Overrides (jeweils 0 = automatisch)
    fontFamily: string;
    fontSize: number;                   // Basisgröße in px (Referenz-Design: 13)
    selectedKeys: ReadonlySet<string> | null;   // aktive Selektion (Dimmen)
    interactionsAllowed: boolean;
    onSelect: (task: GanttTask, ev: MouseEvent) => void;
    onContextMenu: (task: GanttTask, ev: MouseEvent) => void;
    onClear: () => void;
    onTableWidth?: (w: number) => void;   // Tabellenbreite per Trenner gezogen (zum Persistieren)
}

const DAY = 86400000;
const BASE_FONT = 13;      // Referenz-Schriftgröße; alle Metriken skalieren relativ dazu
const ROW_H = 36;
const AXIS_H = 44;
const HEADER_H = 44;
const MN = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
// Phasen-Palette: vorberechnete sRGB-Hexwerte der oklch-Farben aus dem Sample
// (L 0.56 / 0.70, C 0.11, Hues 250/310/60/150/25/200/340/100) — als Hex, damit
// die Farb-Picker im Formatbereich exakt die gerenderten Farben zeigen.
const PHASE_HEX_LIGHT = ['#3D78B2', '#8861A4', '#A36328', '#3E8651', '#AC5853', '#00878E', '#9F5989', '#847514'];
const PHASE_HEX_DARK = ['#67A3E0', '#B38BD2', '#D08D54', '#69B27A', '#DA827B', '#2BB3B9', '#CC83B4', '#AEA048'];
// IBCS-Konstanten (Standards 1.2): AC solid dark, PY hellgrau, Rot = negativ
const IBCS_AC = '#404040';
const IBCS_RED = '#FF2600';
const IBCS_GREEN = '#0E8A3E';   // positive Abweichung (früher als Plan)

// Einheiten-Suffix für Tageswerte: 't' (Default), 'd' oder leer
function unitSuffix(tageEinheit: string | undefined): string {
    if (tageEinheit === 'ohne') return '';
    if (tageEinheit === 'd') return ' d';
    return ' t';
}

// Abweichung in Tagen formatieren: "+3 t" (Verzug), "−2 t" (früher), "±0 t"
function fmtDelta(d: number, u: string): string {
    return (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(d) + u;
}

// Effektive Task-Farben (Override oder Phasen-Palette) — auch von visual.ts
// genutzt, um die Default-Swatches der Farb-Picker zu befüllen.
export function computeTaskColors(tasks: GanttTask[], dark: boolean): Map<string, string> {
    const pal = dark ? PHASE_HEX_DARK : PHASE_HEX_LIGHT;
    const order: (string | null)[] = [];
    tasks.forEach(t => { if (!order.includes(t.phase)) order.push(t.phase); });
    const out = new Map<string, string>();
    tasks.forEach(t => {
        out.set(t.key, t.color ? t.color : pal[order.indexOf(t.phase) % pal.length]);
    });
    return out;
}

function okl(l: number, c: number, h: number, a?: number): string {
    return 'oklch(' + l + ' ' + c + ' ' + h + (a !== undefined ? ' / ' + a : '') + ')';
}

// hex (#RRGGBB) + Alpha 0..1 → #RRGGBBAA
function hexA(hex: string, alpha: number): string {
    return hex + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
}

// Ist ein #RRGGBB-Wert dunkel? Entscheidet bei eigenen Farben über alles, was
// als heller/dunkler Schleier auf dem Hintergrund liegt (Wochenenden, Hover,
// Status-Pills, Tooltip-Inversion). Unparsbare Werte gelten als hell.
export function isDarkHex(hex: string): boolean {
    const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex || '');
    if (!m) return false;
    const h = m[1].length === 3 ? m[1].replace(/./g, c => c + c) : m[1];
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

function fmtDate(ms: number): string {
    const d = new Date(ms);
    return ('0' + d.getUTCDate()).slice(-2) + '.' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '.' + String(d.getUTCFullYear()).slice(2);
}

function el(tag: string, css: string, text?: string): HTMLElement {
    const n = document.createElement(tag);
    n.style.cssText = css;
    if (text !== undefined) n.textContent = text;
    return n;
}

function svgEl(tag: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

type StatusKind = 'done' | 'progress' | 'blocked' | 'open';

function statusKind(st: string): StatusKind {
    const s = st.toLowerCase();
    if (/fertig|done|abgeschlossen|erledigt|complete/.test(s)) return 'done';
    if (/arbeit|progress|laufend|läuft|umsetzung|active|im plan/.test(s)) return 'progress';
    if (/block|risiko|kritisch|verzug|delayed|overdue|stopp/.test(s)) return 'blocked';
    return 'open';   // z. B. "Offen", "Nicht begonnen"
}

interface Theme {
    bg: string; panel: string; border: string; grid: string;
    text: string; sub: string; weekend: string; hoverBg: string;
    today: string; dep: string; tipBg: string; tipFg: string; tipSub: string;
}

interface RenderItem {
    id: string;
    kind: 'proj' | 'phase' | 'task' | 'ms';   // proj = Projektzeile (Portfolio-Ebene)
    name: string;
    s: number;
    e: number;
    pct: number | null;
    st: string | null;
    ow: string;
    color: string;
    soft: string;
    laneTint: string;
    phaseKey: string | null;
    task: GanttTask | null;
    depTasks: GanttTask[];
    ps: number | null;      // Basisplan-Start
    pe: number | null;      // Basisplan-Ende
    delta: number | null;   // Ist-Ende minus Plan-Ende in Tagen (+ = Verzug)
    msKids: GanttTask[];    // Meilensteine einer ZUGEKLAPPTEN Phase (Kompakt-Anzeige)
}

// Skalierte Layout-Metriken (alles relativ zur Basis-Schriftgröße 13px);
// gesetzte Größen-Overrides ersetzen den abgeleiteten Wert 1:1
interface Metrics {
    s: number;          // Skalierungsfaktor fontSize/13
    rowH: number;
    axisH: number;
    headerH: number;
    barH: number;       // Task-Balken
    phBarH: number;     // Phasen-Summenbalken
    dia: number;        // Meilenstein-Kantenlänge
    fTab: number;       // Schrift-Faktor Tabelle (Referenz 12px)
    fAxis: number;      // Schrift-Faktor Zeitachse (Referenz 12px)
    fLbl: number;       // Schrift-Faktor Balken-Beschriftung (Referenz 11px)
}

// Referenzgrößen der drei Schrift-Gruppen: ein Override setzt diese Größe und
// alle anderen Texte der Gruppe skalieren proportional mit
const REF_TAB = 12, REF_AXIS = 12, REF_LBL = 11;

interface ColDef { key: string; label: string; w: number; }

const ALL_COLS: ColDef[] = [
    { key: 'start', label: 'Start', w: 74 },
    { key: 'end', label: 'Ende', w: 74 },
    { key: 'days', label: 'Tage', w: 46 },
    { key: 'delta', label: 'Δ Plan', w: 62 },
    { key: 'status', label: 'Status', w: 100 },
    { key: 'pct', label: 'Fortschritt', w: 110 },
    { key: 'ow', label: 'Wer', w: 60 }
];
// Reihenfolge, in der Spalten bei schmaler Tabelle weichen — Δ bleibt lange
// sichtbar, weil die Abweichung das wichtigste Steuerungssignal ist
const DROP_ORDER = ['ow', 'days', 'status', 'pct', 'delta', 'end', 'start'];
const MIN_TASK_COL = 140;

export class GanttRenderer {
    private container: HTMLElement;
    private opts: GanttOptions | null = null;
    private tasks: GanttTask[] = [];
    private byKey: Map<string, GanttTask> = new Map();

    // Zeitachsen-Zustand (wie im Referenz-Sample)
    private pxd = 9;
    private view = Date.UTC(2026, 0, 1);
    private mode = '';
    private collapsed: Record<string, boolean> = {};
    private hover: string | null = null;
    private tip: { id: string; x: number; y: number } | null = null;
    private sy = 0;
    private maxSy = 0;
    private pan: { x0: number; y0: number; v0: number; moved: boolean; taskKey: string | null } | null = null;
    private fitted = false;
    private lastSig = '';
    private raf = 0;
    private timer = 0;
    private pending = false;
    private m: Metrics = { s: 1, rowH: ROW_H, axisH: AXIS_H, headerH: HEADER_H, barH: 20, phBarH: 9, dia: 14, fTab: 1, fAxis: 1, fLbl: 1 };
    private darkUi = false;                 // Oberfläche wirkt dunkel (Theme oder eigener Hintergrund)
    private phaseKeys: string[] = [];
    private projKeys: string[] = [];        // Collapse-Schlüssel der Projekt-Ebene ("P:<Name>")
    private hasProj = false;                // Projekt-Rolle gebunden → 3-Ebenen-Hierarchie
    private lastItems: RenderItem[] = [];   // Items des letzten Renders (für Koordinaten-Treffer)
    private hasPlan = false;                // mindestens ein Task mit Basisplan-Daten
    private sbDrag: { y0: number; sy0: number } | null = null;   // aktiver Scrollbalken-Drag
    private sbGeom: { trackH: number; thumbH: number } | null = null;
    private twDrag: { x0: number; w0: number } | null = null;    // aktiver Tabellen-Trenner-Drag
    private twOverride: number | null = null;                    // per Drag gesetzte Tabellenbreite
    private lastOptTW: number | null = null;                     // letzter Options-Wert (Override-Reset)
    private curTableW = 0;

    // Statische DOM-Hülle (einmal gebaut, Inhalte werden je Render ersetzt)
    private root: HTMLElement;
    private toolbarInfo: HTMLElement;
    private toolbarBtns: HTMLElement;
    private panel: HTMLElement;
    private tableWrap: HTMLElement;
    private tableHead: HTMLElement;
    private rowsViewport: HTMLElement;
    private rowsLayer: HTMLElement;
    private chartArea: HTMLElement;
    private axisHost: HTMLElement;
    private bodyClip: HTMLElement;
    private fixedLayer: HTMLElement;    // Wochenenden + Gitterlinien (nicht v-scrollt)
    private scrollLayer: HTMLElement;   // Lanes, Pfeile, Balken (v-scrollt)
    private todayHost: HTMLElement;
    private tipHost: HTMLElement;
    private divider: HTMLElement;   // ziehbarer Trenner Tabelle ↔ Chart
    private vTrack: HTMLElement;    // vertikaler Scrollbalken (Spur)
    private vThumb: HTMLElement;    // vertikaler Scrollbalken (Griff)
    private landing: HTMLElement;
    private resizeObs: ResizeObserver | null = null;

    constructor(container: HTMLElement) {
        this.container = container;

        this.root = el('div', 'width:100%;height:100%;display:flex;flex-direction:column;font-family:"Segoe UI",-apple-system,sans-serif;font-size:13px;overflow:hidden;user-select:none;padding:8px;box-sizing:border-box');
        const toolbar = el('div', 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 2px 8px;flex-wrap:wrap');
        this.toolbarInfo = el('div', 'font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis');
        this.toolbarBtns = el('div', 'display:flex;gap:8px;align-items:center');
        toolbar.appendChild(this.toolbarInfo);
        toolbar.appendChild(this.toolbarBtns);

        const panelWrap = el('div', 'flex:1;display:flex;min-height:0');
        this.panel = el('div', 'flex:1;display:flex;min-width:0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06)');

        this.tableWrap = el('div', 'flex-shrink:0;display:flex;flex-direction:column;min-width:0');
        this.tableHead = el('div', 'height:' + HEADER_H + 'px;display:grid;align-items:center;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;padding-left:14px');
        this.rowsViewport = el('div', 'flex:1;overflow:hidden;position:relative');
        this.rowsLayer = el('div', 'position:absolute;left:0;right:0;top:0;bottom:0');
        this.rowsViewport.appendChild(this.rowsLayer);
        this.tableWrap.appendChild(this.tableHead);
        this.tableWrap.appendChild(this.rowsViewport);

        this.chartArea = el('div', 'flex:1;min-width:0;position:relative;overflow:hidden');
        this.axisHost = el('div', 'position:absolute;top:0;left:0;right:0;height:' + AXIS_H + 'px;overflow:hidden');
        this.bodyClip = el('div', 'position:absolute;top:' + AXIS_H + 'px;left:0;right:0;bottom:0;overflow:hidden');
        this.fixedLayer = el('div', 'position:absolute;left:0;right:0;top:0;bottom:0');
        this.scrollLayer = el('div', 'position:absolute;left:0;right:0;top:0;bottom:0');
        this.bodyClip.appendChild(this.fixedLayer);
        this.bodyClip.appendChild(this.scrollLayer);
        this.todayHost = el('div', 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden');
        this.tipHost = el('div', 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden');
        this.chartArea.appendChild(this.axisHost);
        this.chartArea.appendChild(this.bodyClip);
        this.chartArea.appendChild(this.todayHost);
        this.chartArea.appendChild(this.tipHost);
        // Vertikaler Scrollbalken am rechten Rand (sichtbar sobald der Plan
        // höher ist als die Fläche; Mausrad scrollt weiterhin ebenfalls)
        this.vTrack = el('div', 'position:absolute;right:2px;width:9px;top:0;bottom:2px;display:none;z-index:5');
        this.vThumb = el('div', 'position:absolute;left:1px;right:1px;border-radius:5px;cursor:default');
        this.vTrack.appendChild(this.vThumb);
        this.chartArea.appendChild(this.vTrack);

        // Ziehbarer Trenner: Tabellen-/Task-Spaltenbreite direkt anpassen
        // (ganz nach links = Tabelle ausblenden; wieder aufziehbar)
        this.divider = el('div', 'width:6px;flex-shrink:0;cursor:col-resize');
        this.divider.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.twDrag = { x0: e.clientX, w0: this.curTableW };
        });
        this.panel.appendChild(this.tableWrap);
        this.panel.appendChild(this.divider);
        this.panel.appendChild(this.chartArea);
        panelWrap.appendChild(this.panel);

        this.landing = el('div', 'flex:1;display:none;align-items:center;justify-content:center;text-align:center;padding:24px;line-height:1.6');

        this.root.appendChild(toolbar);
        this.root.appendChild(panelWrap);
        this.root.appendChild(this.landing);
        this.container.appendChild(this.root);

        // --- stabile Event-Verdrahtung (überlebt die Re-Renders) ---
        this.vThumb.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.sbDrag = { y0: e.clientY, sy0: this.sy };
            this.invalidate();
        });
        this.vTrack.addEventListener('mousedown', (e) => {
            if (e.target === this.vThumb) return;
            e.stopPropagation();
            e.preventDefault();
            // Klick auf die Spur: Griffmitte zur Klickposition springen, dann direkt draggbar
            const g = this.sbGeom;
            if (!g || g.trackH <= g.thumbH) return;
            const r = this.vTrack.getBoundingClientRect();
            const frac = Math.max(0, Math.min(1, (e.clientY - r.top - g.thumbH / 2) / (g.trackH - g.thumbH)));
            this.sbDrag = { y0: e.clientY, sy0: frac * this.maxSy };
            this.setState({ sy: frac * this.maxSy });
        });
        this.panel.addEventListener('wheel', this.onWheel, { passive: false });
        this.chartArea.addEventListener('mousedown', this.onChartDown);
        this.chartArea.addEventListener('contextmenu', this.onChartCtx);
        this.chartArea.addEventListener('mouseleave', () => { this.setState({ tip: null, hover: null }); });
        this.rowsViewport.addEventListener('mouseleave', () => { this.setState({ hover: null }); });
        // Klicks laufen über den stabilen Viewport und werden per Koordinate zur
        // Zeile aufgelöst — NICHT über per-Zeilen-Listener: Hover/Tooltip lösen
        // Re-Renders aus, die die Zeilen-Knoten ersetzen. Wird ein Knoten zwischen
        // Mousedown und Mouseup erneuert, feuert sein click-Event nie ("verschluckte"
        // Klicks — das machte das Auf-/Zuklappen unzuverlässig).
        this.rowsViewport.addEventListener('click', (ev) => {
            if (!this.opts) return;
            const it = this.tableItemAtY(ev.clientY);
            if (!it) { this.opts.onClear(); return; }
            if (it.kind === 'phase' || it.kind === 'proj') this.togglePhase(it.phaseKey as string);
            else if (it.task) {
                this.opts.onSelect(it.task, ev);
                // Detail-Tooltip wie beim Hover im Chart — verankert am Balken;
                // zweiter Klick auf dieselbe Zeile blendet ihn wieder aus
                if (this.tip && this.tip.id === it.id) {
                    this.tip = null;
                } else {
                    const r = this.chartArea.getBoundingClientRect();
                    const bx = (it.s - this.view) / DAY * this.pxd + 14;
                    const by = this.m.axisH + this.lastItems.indexOf(it) * this.m.rowH - this.sy + Math.round(this.m.rowH * 0.7);
                    this.tip = {
                        id: it.id,
                        x: Math.max(4, Math.min(bx, r.width - 250)),
                        y: Math.max(4, Math.min(by, r.height - 200))
                    };
                }
                this.invalidate();
            }
        });
        this.rowsViewport.addEventListener('contextmenu', (ev) => {
            const it = this.tableItemAtY(ev.clientY);
            if (it && it.task && this.opts) { ev.preventDefault(); ev.stopPropagation(); this.opts.onContextMenu(it.task, ev); }
        });
        window.addEventListener('mousemove', this.onWinMove);
        window.addEventListener('mouseup', this.onWinUp);

        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObs = new ResizeObserver(() => this.invalidate());
            this.resizeObs.observe(this.container);
        }
    }

    public destroy(): void {
        window.removeEventListener('mousemove', this.onWinMove);
        window.removeEventListener('mouseup', this.onWinUp);
        if (this.resizeObs) this.resizeObs.disconnect();
        this.pending = false;
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.timer) clearTimeout(this.timer);
        this.container.removeChild(this.root);
    }

    public setData(tasks: GanttTask[]): void {
        this.tasks = tasks;
        this.byKey = new Map(tasks.map(t => [t.key, t]));
        // Nur neu einpassen, wenn sich die Task-Menge wirklich ändert —
        // sonst springt die Ansicht bei jeder Crossfilter-Interaktion.
        const sig = tasks.map(t => t.key).join('|');
        if (sig !== this.lastSig) {
            this.lastSig = sig;
            this.fitted = false;
        }
        this.invalidate();
    }

    public setOptions(opts: GanttOptions): void {
        this.opts = opts;
        this.invalidate();
    }

    // ---------- Zustands-Helfer ----------

    private setState(patch: Partial<{ pxd: number; view: number; mode: string; hover: string | null; tip: { id: string; x: number; y: number } | null; sy: number }>): void {
        if (patch.pxd !== undefined) this.pxd = patch.pxd;
        if (patch.view !== undefined) this.view = patch.view;
        if (patch.mode !== undefined) this.mode = patch.mode;
        if (patch.hover !== undefined) this.hover = patch.hover;
        if (patch.tip !== undefined) this.tip = patch.tip;
        if (patch.sy !== undefined) this.sy = patch.sy;
        this.invalidate();
    }

    private invalidate(): void {
        // rAF für flüssiges Pannen/Zoomen; setTimeout-Fallback, weil rAF in
        // versteckten Tabs pausiert (z. B. Power-BI-Export nach PDF/PPT oder
        // Hintergrund-Rendering) — sonst bliebe das Visual dort leer.
        if (this.pending) return;
        this.pending = true;
        const run = () => {
            if (!this.pending) return;
            this.pending = false;
            if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
            if (this.timer) { clearTimeout(this.timer); this.timer = 0; }
            this.render();
        };
        this.raf = requestAnimationFrame(run);
        this.timer = window.setTimeout(run, 32);
    }

    // ---------- Interaktion ----------

    private onWheel = (e: WheelEvent): void => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            const r = this.chartArea.getBoundingClientRect();
            const mx = e.clientX - r.left;
            const f = Math.exp(-e.deltaY * 0.0022);
            const np = Math.min(60, Math.max(0.25, this.pxd * f));
            const tms = this.view + mx / this.pxd * DAY;
            this.setState({ pxd: np, view: tms - mx / np * DAY, mode: '' });
            return;
        }
        let dx = e.deltaX, dy = e.deltaY;
        if (e.shiftKey && Math.abs(dy) > Math.abs(dx)) { dx = dy; dy = 0; }
        const patch: { view?: number; sy?: number } = {};
        if (dx) patch.view = this.view + dx / this.pxd * DAY;
        if (dy) {
            if (this.maxSy > 0) patch.sy = Math.max(0, Math.min(this.maxSy, this.sy + dy));
            else if (!dx) patch.view = this.view + dy / this.pxd * DAY;
        }
        if (patch.view !== undefined || patch.sy !== undefined) this.setState(patch);
    };

    private taskKeyFromEvent(ev: Event): string | null {
        const t = ev.target as HTMLElement;
        const hit = t && t.closest ? (t.closest('[data-task]') as HTMLElement) : null;
        return hit ? hit.getAttribute('data-task') : null;
    }

    // Zeile aus einer Bildschirm-Y-Koordinate ableiten (render-fest: braucht
    // keine lebenden DOM-Knoten, nur die Item-Liste des letzten Renders)
    private tableItemAtY(clientY: number): RenderItem | null {
        return this.itemAt(this.rowsViewport.getBoundingClientRect(), clientY);
    }

    private chartItemAtY(clientY: number): RenderItem | null {
        return this.itemAt(this.bodyClip.getBoundingClientRect(), clientY);
    }

    private itemAt(r: DOMRect, clientY: number): RenderItem | null {
        if (clientY < r.top || clientY > r.bottom) return null;
        const idx = Math.floor((clientY - r.top + this.sy) / this.m.rowH);
        return idx >= 0 && idx < this.lastItems.length ? this.lastItems[idx] : null;
    }

    private togglePhase(k: string): void {
        this.collapsed[k] = !this.collapsed[k];
        this.invalidate();
    }

    private onChartDown = (e: MouseEvent): void => {
        if (e.button !== 0) return;
        this.pan = { x0: e.clientX, y0: e.clientY, v0: this.view, moved: false, taskKey: this.taskKeyFromEvent(e) };
        this.setState({ tip: null });
    };

    private onChartCtx = (e: MouseEvent): void => {
        const key = this.taskKeyFromEvent(e);
        if (!key || !this.opts) return;
        const task = this.byKey.get(key);
        if (task) { e.preventDefault(); e.stopPropagation(); this.opts.onContextMenu(task, e); }
    };

    private onWinMove = (e: MouseEvent): void => {
        // Tabellen-Trenner-Drag: Breite live anpassen
        if (this.twDrag) {
            const availW = this.panel.clientWidth || this.container.clientWidth;
            const w = Math.max(0, Math.min(Math.round(availW * 0.7), this.twDrag.w0 + (e.clientX - this.twDrag.x0)));
            this.twOverride = w;
            this.invalidate();
            return;
        }
        // Scrollbalken-Drag hat Vorrang vor dem Pannen
        if (this.sbDrag) {
            const g = this.sbGeom;
            if (g && g.trackH > g.thumbH) {
                const dy = e.clientY - this.sbDrag.y0;
                const sy = Math.max(0, Math.min(this.maxSy, this.sbDrag.sy0 + dy * this.maxSy / (g.trackH - g.thumbH)));
                this.setState({ sy });
            }
            return;
        }
        if (!this.pan) return;
        // Klick-Toleranz 8px: Touchpad-Klicks verschieben den Cursor beim
        // physischen Drücken oft um einige Pixel — mit 4px wurde daraus ein
        // Pan statt eines Klicks (Auf-/Zuklappen ging nur per Touchscreen)
        if (!this.pan.moved && Math.abs(e.clientX - this.pan.x0) < 8 && Math.abs(e.clientY - this.pan.y0) < 8) return;
        this.pan.moved = true;
        this.setState({ view: this.pan.v0 - (e.clientX - this.pan.x0) / this.pxd * DAY });
    };

    private onWinUp = (e: MouseEvent): void => {
        if (this.twDrag) {
            this.twDrag = null;
            // gezogene Breite an den Host melden (persistiert nach tabellenBreite)
            if (this.twOverride !== null && this.opts && this.opts.onTableWidth) this.opts.onTableWidth(this.twOverride);
            this.invalidate();
            return;
        }
        if (this.sbDrag) { this.sbDrag = null; this.invalidate(); return; }
        const pan = this.pan;
        this.pan = null;
        if (!pan) return;
        if (!pan.moved && this.opts) {
            // Klick ohne Bewegung: Task selektieren, Phasen-Zeile klappen
            // (jetzt auch im Chart möglich, nicht nur in der Tabelle) oder
            // Selektion aufheben
            const task = pan.taskKey ? this.byKey.get(pan.taskKey) : null;
            if (task) this.opts.onSelect(task, e);
            else {
                const it = this.chartItemAtY(pan.y0);
                if (it && (it.kind === 'phase' || it.kind === 'proj')) this.togglePhase(it.phaseKey as string);
                else this.opts.onClear();
            }
        }
        this.invalidate();
    };

    private tipAt(item: RenderItem, e: MouseEvent): void {
        const r = this.chartArea.getBoundingClientRect();
        let x = e.clientX - r.left + 16, y = e.clientY - r.top + 16;
        x = Math.max(4, Math.min(x, r.width - 240));
        y = Math.max(4, Math.min(y, r.height - 190));
        this.setState({ tip: { id: item.id, x, y }, hover: item.id });
    }

    // ---------- Navigation (Toolbar) ----------

    // Setzt pxd/view direkt (ohne setState), damit der laufende Render die
    // frischen Werte nutzt; fitAll() ist die Toolbar-Variante mit Re-Render.
    // px/Tag je Zeiteinheit (Referenz-Sample + neu Quartale/Jahre)
    private static MODE_PXD: Record<string, number> = { Tage: 24, Wochen: 9, Monate: 3.2, Quartale: 1.1, Jahre: 0.32 };

    private computeFit(erzwingeEinpassen?: boolean): void {
        const cw = this.chartArea.clientWidth;
        const ts = this.tasks;
        if (!ts.length || cw <= 0) return;
        const mn = Math.min(...ts.map(x => x.s));
        // Standard-Zeiteinheit aus den Optionen: beim ERSTEN Layout fester
        // Maßstab statt Einpassen; der "Alles"-Button passt immer ein
        const ze = this.opts && this.opts.zeiteinheit;
        if (!erzwingeEinpassen && ze && GanttRenderer.MODE_PXD[ze]) {
            this.pxd = GanttRenderer.MODE_PXD[ze];
            this.view = mn - 6 * DAY;
            this.mode = ze;
            return;
        }
        const mx = Math.max(...ts.map(x => x.e === null ? x.s : x.e));
        const span = (mx - mn) / DAY + 16;
        this.pxd = Math.min(30, Math.max(0.25, (cw - 40) / span));
        this.view = mn - 6 * DAY;
        this.mode = '';
    }

    private fitAll(): void {
        this.computeFit(true);
        this.invalidate();
    }

    private goToday(): void {
        const cw = this.chartArea.clientWidth;
        this.setState({ view: Date.now() - cw / 2 / this.pxd * DAY });
    }

    private setMode(m: string): void {
        const cw = this.chartArea.clientWidth;
        const c = this.view + cw / 2 / this.pxd * DAY;
        const np = GanttRenderer.MODE_PXD[m];
        if (!np) return;
        this.setState({ mode: m, pxd: np, view: c - cw / 2 / np * DAY });
    }

    private zoomBy(f: number): void {
        const cw = this.chartArea.clientWidth;
        const c = this.view + cw / 2 / this.pxd * DAY;
        const np = Math.min(60, Math.max(0.25, this.pxd * f));
        this.setState({ pxd: np, view: c - cw / 2 / np * DAY, mode: '' });
    }

    // ---------- Ableitungen ----------

    private theme(dark: boolean): Theme {
        return dark ? {
            bg: '#151619', panel: '#1E2023', border: '#33363C', grid: '#2A2D32',
            text: '#E9E7E2', sub: '#90939A', weekend: 'rgba(255,255,255,0.035)',
            hoverBg: 'rgba(255,255,255,0.055)', today: okl(0.66, 0.16, 30),
            dep: '#6A6E76', tipBg: '#F3F2EE', tipFg: '#26251F', tipSub: '#7A776F'
        } : {
            bg: '#F4F3F0', panel: '#FFFFFF', border: '#E4E2DC', grid: '#F0EEE9',
            text: '#2A2925', sub: '#8B887E', weekend: 'rgba(60,55,40,0.05)',
            hoverBg: 'rgba(60,55,40,0.055)', today: okl(0.58, 0.17, 30),
            dep: '#B5B2A9', tipBg: '#26251F', tipFg: '#F5F4F0', tipSub: '#A3A098'
        };
    }

    // Meilenstein-Erkennung: Ende leer ist immer ein Meilenstein; optional
    // zählt auch Ende = Start (MS-Project-Exporte liefern Meilensteine oft so).
    // Als Option, weil eintägige Vorgänge sonst fälschlich zur Raute würden.
    private isMs(c: GanttTask): boolean {
        if (c.e === null) return true;
        return !!this.opts && this.opts.msEndeGleichStart === true && c.e === c.s;
    }

    // Basisplan je Task: Plan-Ende fällt auf Plan-Start zurück (Plan-Meilenstein);
    // Abweichung = Ist-Ende − Plan-Ende in Tagen (+ = Verzug)
    private static planOf(c: GanttTask): { ps: number | null; pe: number | null; delta: number | null } {
        const ps = c.ps !== undefined && c.ps !== null ? c.ps : null;
        const peRaw = c.pe !== undefined && c.pe !== null ? c.pe : ps;
        const pe = peRaw !== null && ps !== null && peRaw < ps ? ps : peRaw;
        const actualEnd = c.e === null ? c.s : c.e;
        return { ps, pe, delta: pe === null ? null : Math.round((actualEnd - pe) / DAY) };
    }

    // Aggregat einer Gruppe (Phase oder Projekt): Zeitraum-Hülle, dauergewichteter
    // Fortschritt, Basisplan-Hülle und Verzugs-Delta
    private static aggOf(kids: GanttTask[]): { s: number; e: number; pct: number | null; ps: number | null; pe: number | null; delta: number | null } {
        const s = Math.min(...kids.map(c => c.s));
        const e = Math.max(...kids.map(c => c.e === null ? c.s : c.e));
        let wd = 0, wp = 0, anyPct = false;
        kids.forEach(c => {
            const d = c.e !== null ? (c.e - c.s) / DAY + 1 : 1;
            wd += d;
            if (c.pct !== null) { anyPct = true; wp += d * c.pct; }
        });
        const plans = kids.map(GanttRenderer.planOf);
        const pss = plans.map(p => p.ps).filter((v): v is number => v !== null);
        const pes = plans.map(p => p.pe).filter((v): v is number => v !== null);
        const ps = pss.length ? Math.min(...pss) : null;
        const pe = pes.length ? Math.max(...pes) : null;
        return { s, e, pct: anyPct ? Math.round(wp / wd) : null, ps, pe, delta: pe === null ? null : Math.round((e - pe) / DAY) };
    }

    private buildItems(dark: boolean, ibcs: boolean): RenderItem[] {
        const pal = dark ? PHASE_HEX_DARK : PHASE_HEX_LIGHT;
        const msOn = !this.opts || this.opts.msAufPhase !== false;

        // Ebene 0 (optional): Projekt — Portfolio-Sicht mit einer Zeile je Projekt
        this.hasProj = this.tasks.some(t => t.projekt !== undefined && t.projekt !== null);
        const projOrder: (string | null)[] = [];
        const projGroups = new Map<string | null, GanttTask[]>();
        this.tasks.forEach(t => {
            const pk = this.hasProj ? (t.projekt !== undefined && t.projekt !== null ? t.projekt : null) : null;
            if (!projGroups.has(pk)) { projGroups.set(pk, []); projOrder.push(pk); }
            (projGroups.get(pk) as GanttTask[]).push(t);
        });

        this.phaseKeys = [];
        this.projKeys = [];
        const items: RenderItem[] = [];
        let phaseColorIdx = 0;
        const projColor = ibcs ? IBCS_AC : (dark ? '#C6C9CF' : '#454851');

        projOrder.forEach(pk => {
            const projKids = projGroups.get(pk) as GanttTask[];
            let projCollapsed = false;
            if (pk !== null) {
                const ck = 'P:' + pk;   // Collapse-Schlüssel der Projekt-Ebene
                this.projKeys.push(ck);
                projCollapsed = !!this.collapsed[ck];
                const a = GanttRenderer.aggOf(projKids);
                items.push({
                    id: 'pr:' + pk, kind: 'proj', name: pk, s: a.s, e: a.e, pct: a.pct,
                    st: null, ow: '', color: projColor,
                    soft: ibcs ? '#FFFFFF' : hexA(projColor, 0.16),
                    laneTint: ibcs ? 'transparent' : hexA(projColor, 0.05),
                    phaseKey: ck, task: null, depTasks: [],
                    ps: a.ps, pe: a.pe, delta: a.delta,
                    // Projektzeile trägt IMMER alle Meilensteine des Projekts —
                    // die Meilensteinübersicht des Portfolios (Option "Meilensteine")
                    msKids: msOn ? projKids.filter(c => this.isMs(c)) : []
                });
                if (projCollapsed) return;
            }

            // Ebene 1: Phasen innerhalb des Projekts (bzw. flach ohne Projekt-Rolle)
            const order: (string | null)[] = [];
            const groups = new Map<string | null, GanttTask[]>();
            projKids.forEach(t => {
                if (!groups.has(t.phase)) { groups.set(t.phase, []); order.push(t.phase); }
                (groups.get(t.phase) as GanttTask[]).push(t);
            });

            order.forEach(key => {
                const kids = groups.get(key);
                if (!kids) return;
                // IBCS: monochrom (solid dark = Ist, outlined = Plan); individuelle
                // Task-Farben werden im IBCS-Modus bewusst ignoriert.
                const phaseHex = pal[phaseColorIdx % pal.length];
                if (key !== null) phaseColorIdx++;
                const color = ibcs ? IBCS_AC : phaseHex;
                const soft = ibcs ? '#FFFFFF' : hexA(phaseHex, 0.18);
                const laneTint = ibcs ? 'transparent' : hexA(phaseHex, 0.06);
                if (key !== null) {
                    // Collapse-Schlüssel je (Projekt, Phase) — gleiche Phasennamen
                    // in verschiedenen Projekten klappen unabhängig
                    const ck = (pk !== null ? pk + '¦' : '') + key;
                    this.phaseKeys.push(ck);
                    const collapsedNow = !!this.collapsed[ck];
                    const a = GanttRenderer.aggOf(kids);
                    items.push({
                        id: 'ph:' + ck, kind: 'phase', name: key, s: a.s, e: a.e, pct: a.pct,
                        st: null, ow: '', color, soft, laneTint,
                        phaseKey: ck, task: null, depTasks: [],
                        ps: a.ps, pe: a.pe, delta: a.delta,
                        // Zugeklappte Phase: Meilensteine kompakt auf der Summenzeile
                        msKids: collapsedNow && msOn ? kids.filter(c => this.isMs(c)) : []
                    });
                    if (collapsedNow) return;
                }
                kids.forEach(c => {
                    const tColor = !ibcs && c.color ? c.color : color;
                    const tSoft = !ibcs && c.color ? hexA(c.color, 0.18) : soft;
                    const plan = GanttRenderer.planOf(c);
                    items.push({
                        id: c.key, kind: this.isMs(c) ? 'ms' : 'task', name: c.name,
                        s: c.s, e: c.e === null ? c.s : c.e, pct: c.pct, st: c.st, ow: c.ow,
                        color: tColor, soft: tSoft, laneTint, phaseKey: (pk !== null ? pk + '¦' : '') + (key === null ? '' : key), task: c,
                        depTasks: c.deps.map(d => this.byKey.get(d)).filter(Boolean) as GanttTask[],
                        ps: plan.ps, pe: plan.pe, delta: plan.delta, msKids: []
                    });
                });
            });
        });
        this.hasPlan = this.tasks.some(c => (c.ps !== undefined && c.ps !== null) || (c.pe !== undefined && c.pe !== null));
        return items;
    }

    private visibleCols(tableW: number): ColDef[] {
        // Spaltenbreiten folgen der Tabellenschrift (ohne Override = Basisskalierung),
        // damit größere Tabellentexte auch mehr Platz bekommen
        const s = this.m.fTab;
        const hasStatus = this.tasks.some(t => t.st !== null && t.st !== '');
        const hasPct = this.tasks.some(t => t.pct !== null);
        const hasOw = this.tasks.some(t => t.ow !== '');
        const o = this.opts;
        const showDelta = this.hasPlan && (!o || o.basisplan !== false) && (!o || o.deltaSpalte !== false);
        // Manuell abgewählte Spalten (Formatbereich „Tabellenspalten") fallen vor
        // der Datenprüfung raus; nicht gesetzte Schlüssel bleiben wie bisher an
        const on = (key: string): boolean => !o || !o.spalten || o.spalten[key] !== false;
        let cols = ALL_COLS
            .filter(c => on(c.key) && (c.key !== 'status' || hasStatus) && (c.key !== 'pct' || hasPct) && (c.key !== 'ow' || hasOw) && (c.key !== 'delta' || showDelta))
            .map(c => ({ ...c, w: Math.round(c.w * s) }));
        for (const dropKey of DROP_ORDER) {
            const total = Math.round(MIN_TASK_COL * s) + cols.reduce((a, c) => a + c.w, 0);
            if (total <= tableW) break;
            cols = cols.filter(c => c.key !== dropKey);
        }
        return cols;
    }

    // skalierte Schriftgröße in px (Referenzwert aus dem 13px-Design)
    private fs(n: number): string {
        return (Math.round(n * this.m.s * 10) / 10) + 'px';
    }

    // Schriftgrößen der drei einzeln einstellbaren Gruppen: Tabelle, Zeitachse,
    // Beschriftungen am Balken. Ohne Override entspricht der Faktor der
    // Basisskalierung, es ändert sich also nichts gegenüber fs().
    private fsT(n: number): string { return (Math.round(n * this.m.fTab * 10) / 10) + 'px'; }
    private fsA(n: number): string { return (Math.round(n * this.m.fAxis * 10) / 10) + 'px'; }
    private fsL(n: number): string { return (Math.round(n * this.m.fLbl * 10) / 10) + 'px'; }

    // ---------- Haupt-Render ----------

    private render(): void {
        const o = this.opts;
        if (!o) return;
        // IBCS: weißer Hintergrund ist Teil des Standards → Dunkel-Theme wird übersteuert
        const dark = o.ibcs ? false : o.dark;
        let t = this.theme(dark);
        if (o.ibcs) {
            t = {
                ...t,
                bg: '#FFFFFF', panel: '#FFFFFF', border: '#D9D9D9', grid: '#EFEFEF',
                text: '#1A1A1A', sub: '#808080', weekend: 'rgba(0,0,0,0.035)',
                hoverBg: 'rgba(0,0,0,0.045)', today: IBCS_AC, dep: '#9A9A9A'
            };
        }

        // Eigene Farben (Karte „Farben") überschreiben Theme und IBCS-Palette.
        // Nicht einstellbare Werte werden aus der Helligkeit des Hintergrunds
        // abgeleitet, damit auch ein dunkler Wunschton stimmig bleibt.
        const fb = o.farben;
        this.darkUi = dark;
        if (fb && fb.eigene) {
            const bgDark = isDarkHex(fb.hintergrund);
            this.darkUi = bgDark;
            const veil = (a: number): string => bgDark
                ? 'rgba(255,255,255,' + a + ')'
                : 'rgba(0,0,0,' + a + ')';
            const inv = this.theme(!bgDark);   // Tooltip kontrastiert zur Fläche
            t = {
                bg: fb.hintergrund, panel: fb.hintergrund,
                border: fb.linien, grid: fb.linien,
                text: fb.schrift, sub: fb.schriftSekundaer,
                weekend: veil(0.05), hoverBg: veil(0.07),
                today: fb.statusLinie, dep: hexA(fb.schriftSekundaer, 0.6),
                tipBg: inv.panel, tipFg: inv.text, tipSub: inv.sub
            };
        }

        // Metriken aus der Schriftgröße ableiten (Referenz: 13px); jede Größe
        // aus der Karte „Größen" ersetzt den abgeleiteten Wert (0 = automatisch)
        const s = Math.max(0.65, Math.min(1.8, (o.fontSize || BASE_FONT) / BASE_FONT));
        const g = o.groessen;
        const pick = (v: number | undefined, auto: number): number => v && v > 0 ? Math.round(v) : auto;
        const rowH = Math.max(12, pick(g && g.zeilenhoehe, Math.round(ROW_H * s)));
        this.m = {
            s,
            rowH,
            axisH: Math.max(20, pick(g && g.achsenhoehe, Math.round(AXIS_H * s))),
            headerH: Math.max(20, pick(g && g.kopfzeile, Math.round(HEADER_H * s))),
            // Balken und Rauten dürfen die Zeile nie sprengen — sonst überlappen
            // benachbarte Zeilen, sobald jemand eine kleine Zeilenhöhe wählt
            barH: Math.min(Math.max(4, pick(g && g.balkenhoehe, Math.round(20 * s))), rowH - 4),
            phBarH: Math.min(Math.max(3, pick(g && g.phasenbalken, Math.max(5, Math.round(9 * s)))), rowH - 4),
            dia: Math.min(Math.max(6, pick(g && g.meilenstein, Math.round(14 * s))), rowH - 4),
            fTab: g && g.schriftTabelle > 0 ? g.schriftTabelle / REF_TAB : s,
            fAxis: g && g.schriftAchse > 0 ? g.schriftAchse / REF_AXIS : s,
            fLbl: g && g.schriftLabels > 0 ? g.schriftLabels / REF_LBL : s
        };
        this.root.style.background = t.bg;
        this.root.style.color = t.text;
        this.root.style.fontFamily = o.fontFamily ? o.fontFamily + ',"Segoe UI",sans-serif' : '"Segoe UI",-apple-system,sans-serif';
        this.root.style.fontSize = (o.fontSize || BASE_FONT) + 'px';
        // Höhen der statischen Hülle an die Skalierung anpassen
        this.tableHead.style.height = this.m.headerH + 'px';
        this.axisHost.style.height = this.m.axisH + 'px';
        this.bodyClip.style.top = this.m.axisH + 'px';

        if (!this.tasks.length) {
            this.panel.parentElement && (this.panel.parentElement.style.display = 'none');
            this.toolbarInfo.parentElement && (this.toolbarInfo.parentElement.style.display = 'none');
            this.landing.style.display = 'flex';
            this.landing.style.color = t.sub;
            this.landing.replaceChildren();
            const head = el('div', 'font-weight:700;font-size:15px;color:' + t.text + ';margin-bottom:6px', 'DataKitchen Gantt');
            const body = el('div', 'font-size:12.5px', 'Bitte mindestens "Task" und "Start (Datum)" befüllen. Optional: Ende (leer = Meilenstein), Phase, Fortschritt, Status, Wer, Abhängigkeiten.');
            const wrap = el('div', '');
            wrap.appendChild(head); wrap.appendChild(body);
            this.landing.appendChild(wrap);
            return;
        }
        this.panel.parentElement && (this.panel.parentElement.style.display = 'flex');
        this.toolbarInfo.parentElement && (this.toolbarInfo.parentElement.style.display = 'flex');
        this.landing.style.display = 'none';

        this.panel.style.background = t.panel;
        this.panel.style.border = '1px solid ' + t.border;

        // Tabelle ein-/ausblenden und dimensionieren — der per Trenner gezogene
        // Wert überstimmt die Option, bis die Option selbst geändert wird
        if (this.lastOptTW !== o.tabellenBreite) {
            this.lastOptTW = o.tabellenBreite;
            this.twOverride = null;
        }
        const availW = this.panel.clientWidth || this.container.clientWidth;
        const wantTW = this.twOverride !== null ? this.twOverride : o.tabellenBreite;
        const tableW = Math.max(0, Math.min(wantTW, Math.round(availW * 0.7)));
        this.curTableW = tableW;
        const showTable = tableW >= Math.round(MIN_TASK_COL * s);
        this.tableWrap.style.display = showTable ? 'flex' : 'none';
        this.tableWrap.style.width = tableW + 'px';
        this.tableWrap.style.borderRight = '1px solid ' + t.border;
        this.divider.style.background = this.twDrag ? t.sub : t.border;

        if (!this.fitted && this.chartArea.clientWidth > 0) {
            // Layout ist nach dem Anhängen synchron messbar → direkt einpassen
            this.fitted = true;
            this.computeFit();
        }

        // Phasen-Palette folgt der tatsächlichen Flächenhelligkeit: ein dunkler
        // Wunsch-Hintergrund bekommt die hellen Balkenfarben, auch ohne Dunkel-Theme
        const items = this.buildItems(this.darkUi, o.ibcs);
        this.lastItems = items;
        const topOf: Record<string, number> = {};
        items.forEach((it, i) => topOf[it.id] = i * this.m.rowH);
        const chH = Math.max(50, this.bodyClip.clientHeight);
        this.maxSy = Math.max(0, items.length * this.m.rowH - chH);
        const sy = Math.min(this.sy, this.maxSy);
        this.sy = sy;
        const cw = Math.max(50, this.chartArea.clientWidth);
        const x = (ms: number) => (ms - this.view) / DAY * this.pxd;
        const sel = o.selectedKeys && o.selectedKeys.size ? o.selectedKeys : null;

        const nMs = this.tasks.filter(tk => this.isMs(tk)).length;
        const nPh = new Set(this.tasks.map(tk => tk.phase).filter(p => p !== null)).size;
        const nPr = new Set(this.tasks.map(tk => tk.projekt).filter(p => p !== undefined && p !== null)).size;
        this.toolbarInfo.style.color = t.sub;
        this.toolbarInfo.textContent =
            (nPr ? nPr + ' Projekte · ' : '') +
            (this.tasks.length - nMs) + ' Vorgänge' +
            (nPh ? ' · ' + nPh + ' Phasen' : '') +
            (nMs ? ' · ' + nMs + ' Meilensteine' : '');

        this.renderToolbar(t);
        this.renderTable(t, items, topOf, sy, tableW, sel, o.ibcs);
        this.renderChart(t, items, topOf, sy, cw, chH, x, o, sel);
        this.renderTip(t, items, o.ibcs);
        this.updateScrollbar(t, chH);
    }

    private updateScrollbar(t: Theme, chH: number): void {
        const show = this.maxSy > 0;
        this.vTrack.style.display = show ? 'block' : 'none';
        if (!show) { this.sbGeom = null; return; }
        const trackTop = this.m.axisH + 2;
        this.vTrack.style.top = trackTop + 'px';
        const trackH = Math.max(0, this.chartArea.clientHeight - trackTop - 2);
        const contentH = this.lastItems.length * this.m.rowH;
        const thumbH = Math.min(trackH, Math.max(24, Math.round(trackH * chH / Math.max(1, contentH))));
        const thumbTop = Math.round((trackH - thumbH) * (this.sy / this.maxSy));
        this.vThumb.style.height = thumbH + 'px';
        this.vThumb.style.top = thumbTop + 'px';
        this.vThumb.style.background = hexA(t.sub, this.sbDrag ? 0.7 : 0.4);
        this.sbGeom = { trackH, thumbH };
    }

    private renderToolbar(t: Theme): void {
        this.toolbarBtns.replaceChildren();
        const seg = el('div', 'display:flex;border:1px solid ' + t.border + ';border-radius:8px;overflow:hidden;background:' + t.panel);
        ['Tage', 'Wochen', 'Monate', 'Quartale', 'Jahre'].forEach((m, i) => {
            const active = this.mode === m;
            const b = el('div',
                'padding:6px 13px;cursor:pointer;font-size:12px;font-weight:600;' +
                'background:' + (active ? t.text : 'transparent') + ';color:' + (active ? t.panel : t.sub) + ';' +
                'border-left:' + (i ? '1px solid ' + t.border : 'none'), m);
            b.addEventListener('click', () => this.setMode(m));
            seg.appendChild(b);
        });
        this.toolbarBtns.appendChild(seg);
        const mkBtn = (label: string, fn: () => void, wide: boolean) => {
            const b = el('div',
                (wide ? 'padding:6px 13px;' : 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:15px;') +
                'border:1px solid ' + t.border + ';border-radius:8px;background:' + t.panel + ';color:' + t.sub + ';cursor:pointer;font-weight:' + (wide ? '600;font-size:12px' : '700'), label);
            b.addEventListener('click', fn);
            this.toolbarBtns.appendChild(b);
        };
        mkBtn('−', () => this.zoomBy(1 / 1.35), false);
        mkBtn('+', () => this.zoomBy(1.35), false);
        mkBtn('Heute', () => this.goToday(), true);
        mkBtn('Alles', () => this.fitAll(), true);
        // Alle Projekte/Phasen gemeinsam auf-/zuklappen (einzeln: Klick auf die Zeile)
        if (this.projKeys.length) {
            const anyOpen = this.projKeys.some(k => !this.collapsed[k]);
            mkBtn(anyOpen ? '▾ Projekte' : '▸ Projekte', () => {
                this.projKeys.forEach(k => this.collapsed[k] = anyOpen);
                this.invalidate();
            }, true);
        }
        if (this.phaseKeys.length) {
            const anyOpen = this.phaseKeys.some(k => !this.collapsed[k]);
            mkBtn(anyOpen ? '▾ Phasen' : '▸ Phasen', () => {
                this.phaseKeys.forEach(k => this.collapsed[k] = anyOpen);
                this.invalidate();
            }, true);
        }
    }

    private renderTable(t: Theme, items: RenderItem[], topOf: Record<string, number>, sy: number, tableW: number, sel: ReadonlySet<string> | null, ibcs: boolean): void {
        if (this.tableWrap.style.display === 'none') return;
        const m = this.m;
        const cols = this.visibleCols(tableW);
        const gridTemplate = 'minmax(0,1fr) ' + cols.map(c => c.w + 'px').join(' ');

        this.tableHead.style.gridTemplateColumns = gridTemplate;
        this.tableHead.style.color = t.sub;
        this.tableHead.style.borderBottom = '1px solid ' + t.border;
        this.tableHead.style.fontSize = this.fsT(10.5);
        this.tableHead.replaceChildren();
        this.tableHead.appendChild(el('div', '', 'Task'));
        cols.forEach(c => this.tableHead.appendChild(
            el('div', c.key === 'days' ? 'text-align:right;padding-right:12px' : '', c.label)));

        this.rowsLayer.style.transform = 'translateY(-' + sy + 'px)';
        this.rowsLayer.replaceChildren();

        const o = this.opts;
        const verzugOn = (!o || o.basisplan !== false) && (!o || o.verzugZeilen !== false);
        const dark = this.darkUi;
        const lateTint = hexA(IBCS_RED, dark ? 0.13 : 0.07);
        const u = unitSuffix(o ? o.tageEinheit : undefined);

        items.forEach(it => {
            const isProj = it.kind === 'proj';
            const isP = it.kind === 'phase' || isProj;   // Gruppenzeile (Projekt oder Phase)
            const isM = it.kind === 'ms';
            const hov = this.hover === it.id;
            const dim = sel && !isP && it.task && !sel.has(it.task.key);
            const late = verzugOn && it.delta !== null && it.delta > 0;
            const row = el('div',
                'position:absolute;left:0;right:0;top:' + topOf[it.id] + 'px;height:' + m.rowH + 'px;display:grid;' +
                'grid-template-columns:' + gridTemplate + ';align-items:center;padding-left:14px;' +
                'background:' + (hov ? t.hoverBg : (late ? lateTint : 'transparent')) + ';border-bottom:1px solid ' + t.grid + ';' +
                'cursor:pointer;opacity:' + (dim ? 0.45 : 1));
            if (it.task) row.setAttribute('data-task', it.task.key);

            // Task-Zelle: Caret (Gruppe), Farb-Punkt, Name — Einrückung je Ebene
            // (Projekt 0 · Phase 1 · Vorgang 2; ohne Projekt-Rolle wie bisher)
            const indent = isProj ? 0 : (it.kind === 'phase' ? (this.hasProj ? 16 : 0) : (this.hasProj ? 32 : 14));
            const dot = Math.max(6, Math.round(9 * m.fTab));
            // Task-Name folgt der Tabellenschrift (ohne Override identisch zur Basisgröße)
            const nameCell = el('div', 'display:flex;align-items:center;gap:8px;padding-left:' + indent + 'px;font-size:' + this.fsT(BASE_FONT) +
                ';font-weight:' + (isP ? 700 : (isM ? 600 : 400)) + ';min-width:0');
            nameCell.appendChild(el('div',
                'width:11px;flex-shrink:0;color:' + t.sub + ';font-size:' + this.fsT(9) + ';text-align:center;' +
                'transform:rotate(' + (isP && !this.collapsed[it.phaseKey as string] ? 90 : 0) + 'deg)',
                isP ? '▶' : ''));
            nameCell.appendChild(el('div',
                'width:' + dot + 'px;height:' + dot + 'px;flex-shrink:0;background:' + it.color + ';' +
                'border-radius:' + (ibcs ? '0' : (isM ? '2px' : (isP ? '2.5px' : '50%'))) + ';' +
                'transform:rotate(' + (isM ? 45 : 0) + 'deg)'));
            nameCell.appendChild(el('div', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap', it.name));
            row.appendChild(nameCell);

            const dateFg = isP ? t.text : t.sub;
            const days = Math.round((it.e - it.s) / DAY) + 1;
            const numCss = 'font-variant-numeric:tabular-nums;font-size:' + this.fsT(12) + ';color:' + dateFg;
            cols.forEach(c => {
                if (c.key === 'start') row.appendChild(el('div', numCss, fmtDate(it.s)));
                else if (c.key === 'end') row.appendChild(el('div', numCss, isM ? '–' : fmtDate(it.e)));
                else if (c.key === 'days') row.appendChild(el('div', 'text-align:right;padding-right:12px;' + numCss, isM ? '–' : days + u));
                else if (c.key === 'delta') {
                    // Abweichung zum Basisplan: Rot = Verzug, Grün = früher fertig
                    const dl = it.delta;
                    const fg = dl === null ? t.sub : (dl > 0 ? IBCS_RED : (dl < 0 ? (ibcs ? t.text : IBCS_GREEN) : t.sub));
                    row.appendChild(el('div',
                        'text-align:right;padding-right:12px;font-variant-numeric:tabular-nums;font-size:' + this.fsT(12) +
                        ';font-weight:' + (dl !== null && dl > 0 ? 700 : 400) + ';color:' + fg,
                        dl === null ? '–' : fmtDelta(dl, u)));
                }
                else if (c.key === 'status') {
                    const cell = el('div', '');
                    if (!isP && !isM && it.st) {
                        const k = statusKind(it.st);
                        if (ibcs) {
                            // IBCS: keine dekorativen Pills — Text; Rot nur für Negatives
                            cell.appendChild(el('span',
                                'font-size:' + this.fsT(11) + ';font-weight:600;color:' + (k === 'blocked' ? IBCS_RED : t.sub), it.st));
                        } else {
                            const stC = this.statusColors(t, k);
                            cell.appendChild(el('span',
                                'font-size:' + this.fsT(11) + ';font-weight:600;padding:3px 9px;border-radius:20px;background:' + stC.bg + ';color:' + stC.fg, it.st));
                        }
                    }
                    row.appendChild(cell);
                }
                else if (c.key === 'pct') {
                    const cell = el('div', 'display:flex;align-items:center;gap:7px');
                    if (!isM && it.pct !== null) {
                        const track = el('div', 'width:' + Math.round(44 * m.fTab) + 'px;height:5px;border-radius:' + (ibcs ? 0 : 3) + 'px;background:' + t.grid + ';overflow:hidden;flex-shrink:0');
                        track.appendChild(el('div', 'height:100%;width:' + it.pct + '%;background:' + it.color + ';border-radius:' + (ibcs ? 0 : 3) + 'px'));
                        cell.appendChild(track);
                        cell.appendChild(el('span', 'font-size:' + this.fsT(11) + ';color:' + t.sub + ';font-variant-numeric:tabular-nums', it.pct + '%'));
                    }
                    row.appendChild(cell);
                }
                else if (c.key === 'ow') row.appendChild(el('div', 'font-size:' + this.fsT(12) + ';color:' + t.sub + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap', it.ow));
            });

            // Klick/Kontextmenü laufen zentral über den rowsViewport-Listener
            // (Koordinaten-Auflösung, siehe Konstruktor) — hier nur noch Hover.
            row.addEventListener('mouseenter', () => this.setState({ hover: it.id }));
            this.rowsLayer.appendChild(row);
        });
    }

    private statusColors(t: Theme, k: StatusKind): { bg: string; fg: string } {
        const dark = this.darkUi;
        if (k === 'done') return { bg: okl(0.6, 0.11, 150, 0.16), fg: dark ? okl(0.78, 0.1, 150) : okl(0.45, 0.1, 150) };
        if (k === 'progress') return { bg: okl(0.6, 0.11, 250, 0.16), fg: dark ? okl(0.78, 0.1, 250) : okl(0.45, 0.1, 250) };
        if (k === 'blocked') return { bg: okl(0.6, 0.13, 25, 0.16), fg: dark ? okl(0.76, 0.12, 25) : okl(0.48, 0.13, 25) };
        return { bg: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', fg: t.sub };
    }

    private renderChart(
        t: Theme, items: RenderItem[], topOf: Record<string, number>, sy: number,
        cw: number, chH: number, x: (ms: number) => number,
        o: GanttOptions, sel: ReadonlySet<string> | null
    ): void {
        this.chartArea.style.cursor = this.pan && this.pan.moved ? 'grabbing' : 'default';
        const m = this.m;
        const ibcs = o.ibcs;
        const u = unitSuffix(o.tageEinheit);
        const msDatum = o.msDatum !== false;

        // --- Achse (Monats-Ticks + Tages-/Wochen-Subticks) ---
        this.axisHost.style.borderBottom = '1px solid ' + t.border;
        this.axisHost.replaceChildren();
        const endMs = this.view + cw / this.pxd * DAY;
        // Haupt-Ticks adaptiv zur Zoomstufe: Monate → Quartale → Jahre
        const stepM = this.pxd >= 2.2 ? 1 : (this.pxd >= 0.75 ? 3 : 12);
        const dv = new Date(this.view);
        let cur = Date.UTC(dv.getUTCFullYear(), Math.floor(dv.getUTCMonth() / stepM) * stepM, 1);
        const gridXs: { x: number; c: string }[] = [];
        // Label-Positionen relativ zur Achsenhöhe (Referenz 44 px), damit eine
        // eigene Achsenhöhe die Beschriftung mitnimmt statt sie stehen zu lassen
        const topM = Math.round(m.axisH * 7 / AXIS_H);
        const subTop = Math.round(m.axisH * 26 / AXIS_H);
        while (cur < endMs + 32 * stepM * DAY) {
            const dt = new Date(cur);
            const mo = dt.getUTCMonth();
            const yy = String(dt.getUTCFullYear()).slice(2);
            const label = stepM === 1 ? MN[mo] + ' ' + yy
                : stepM === 3 ? 'Q' + (Math.floor(mo / 3) + 1) + ' ' + yy
                : String(dt.getUTCFullYear());
            const mx = x(cur);
            const tick = el('div', 'position:absolute;left:' + mx + 'px;top:0;bottom:0;border-left:1px solid ' + t.border);
            const lbl = el('div', 'position:absolute;left:' + mx + 'px;top:' + topM + 'px;padding-left:7px;font-size:' + this.fsA(12) + ';font-weight:700;color:' + t.text + ';white-space:nowrap',
                label);
            this.axisHost.appendChild(tick);
            this.axisHost.appendChild(lbl);
            gridXs.push({ x: mx, c: t.border });
            cur = Date.UTC(dt.getUTCFullYear(), mo + stepM, 1);
        }
        // Quartals-Zoom: Monats-Sublabels unter den Quartals-Ticks
        if (stepM === 3 && this.pxd >= 1.0) {
            let mm = Date.UTC(dv.getUTCFullYear(), dv.getUTCMonth(), 1);
            while (mm < endMs + 32 * DAY) {
                const dt = new Date(mm);
                if (dt.getUTCMonth() % 3 !== 0) {
                    this.axisHost.appendChild(el('div',
                        'position:absolute;left:' + x(mm) + 'px;top:' + subTop + 'px;padding-left:4px;font-size:' + this.fsA(10) + ';color:' + t.sub + ';white-space:nowrap',
                        MN[dt.getUTCMonth()]));
                    gridXs.push({ x: x(mm), c: t.grid });
                }
                mm = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1);
            }
        }
        if (this.pxd >= 16) {
            let dd = Math.ceil(this.view / DAY) * DAY;
            for (; dd < endMs; dd += DAY) {
                const dt = new Date(dd);
                this.axisHost.appendChild(el('div',
                    'position:absolute;left:' + (x(dd) + this.pxd / 2) + 'px;top:' + subTop + 'px;font-size:' + this.fsA(10) + ';color:' + t.sub + ';white-space:nowrap;transform:translateX(-50%)',
                    String(dt.getUTCDate())));
                gridXs.push({ x: x(dd), c: t.grid });
            }
        } else if (this.pxd >= 4.5) {
            let dd = Math.ceil(this.view / DAY) * DAY;
            while (new Date(dd).getUTCDay() !== 1) dd += DAY;
            for (; dd < endMs; dd += 7 * DAY) {
                const dt = new Date(dd);
                this.axisHost.appendChild(el('div',
                    'position:absolute;left:' + x(dd) + 'px;top:' + subTop + 'px;font-size:' + this.fsA(10) + ';color:' + t.sub + ';white-space:nowrap;transform:translateX(4px)',
                    dt.getUTCDate() + '.' + (dt.getUTCMonth() + 1) + '.'));
                gridXs.push({ x: x(dd), c: t.grid });
            }
        }

        // --- feste Ebene: Wochenenden + Gitterlinien (volle Höhe) ---
        this.fixedLayer.replaceChildren();
        if (o.wochenenden && this.pxd >= 3.5) {
            let dd = Math.floor(this.view / DAY) * DAY;
            while (new Date(dd).getUTCDay() !== 6) dd += DAY;
            for (dd -= 7 * DAY; dd < endMs; dd += 7 * DAY) {
                this.fixedLayer.appendChild(el('div',
                    'position:absolute;left:' + x(dd) + 'px;width:' + (this.pxd * 2) + 'px;top:0;bottom:0;background:' + t.weekend));
            }
        }
        gridXs.forEach(g => this.fixedLayer.appendChild(el('div',
            'position:absolute;left:' + g.x + 'px;top:0;bottom:0;border-left:1px solid ' + g.c)));

        // --- scrollende Ebene: Lanes, Abhängigkeiten, Balken ---
        this.scrollLayer.style.transform = 'translateY(-' + sy + 'px)';
        this.scrollLayer.replaceChildren();

        const planOn = o.basisplan !== false && this.hasPlan;
        const verzugOn = o.basisplan !== false && o.verzugZeilen !== false;
        const lateTint = hexA(IBCS_RED, this.darkUi ? 0.13 : 0.07);
        items.forEach(it => {
            const hov = this.hover === it.id;
            const late = verzugOn && it.delta !== null && it.delta > 0;
            const isGrp = it.kind === 'phase' || it.kind === 'proj';
            this.scrollLayer.appendChild(el('div',
                'position:absolute;left:0;right:0;top:' + topOf[it.id] + 'px;height:' + m.rowH + 'px;' +
                'background:' + (hov ? t.hoverBg : (late ? lateTint : (isGrp ? it.laneTint : 'transparent'))) + ';' +
                'border-bottom:1px solid ' + t.grid + (isGrp ? ';cursor:pointer' : '')));
        });

        // Abhängigkeitspfeile (Elbow-Routing wie im Sample)
        if (o.abhaengigkeiten) {
            const svg = svgEl('svg');
            svg.setAttribute('width', String(cw));
            svg.setAttribute('height', String(items.length * m.rowH));
            svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
            const half = m.rowH / 2;
            items.forEach(it => {
                if (!it.task) return;
                it.depTasks.forEach(src => {
                    const srcId = src.key;
                    if (topOf[srcId] === undefined || topOf[it.id] === undefined) return;
                    const srcMs = src.e === null;
                    const fx = srcMs ? x(src.s) + this.pxd / 2 + 8 : x((src.e === null ? src.s : src.e) + DAY) + 2;
                    const fy = topOf[srcId] + half;
                    const tx = it.kind === 'ms' ? x(it.s) + this.pxd / 2 - 9 : x(it.s) - 3;
                    const ty = topOf[it.id] + half;
                    const hl = this.hover === srcId || this.hover === it.id;
                    const selDim = sel && !(sel.has(srcId) || (it.task && sel.has(it.task.key)));
                    let line: string;
                    if (tx - 10 > fx + 6) line = 'M' + fx + ',' + fy + ' L' + (fx + 8) + ',' + fy + ' L' + (fx + 8) + ',' + ty + ' L' + tx + ',' + ty;
                    else { const my = fy + half; line = 'M' + fx + ',' + fy + ' L' + (fx + 8) + ',' + fy + ' L' + (fx + 8) + ',' + my + ' L' + (tx - 10) + ',' + my + ' L' + (tx - 10) + ',' + ty + ' L' + tx + ',' + ty; }
                    const arrow = 'M' + tx + ',' + (ty - 4) + ' L' + (tx + 6) + ',' + ty + ' L' + tx + ',' + (ty + 4) + ' Z';
                    const p1 = svgEl('path');
                    p1.setAttribute('d', line);
                    p1.setAttribute('fill', 'none');
                    p1.setAttribute('stroke', hl ? t.text : t.dep);
                    p1.setAttribute('stroke-width', hl ? '2' : '1.25');
                    p1.setAttribute('opacity', selDim ? '0.25' : (hl ? '1' : '0.85'));
                    const p2 = svgEl('path');
                    p2.setAttribute('d', arrow);
                    p2.setAttribute('fill', hl ? t.text : t.dep);
                    p2.setAttribute('opacity', selDim ? '0.25' : (hl ? '1' : '0.85'));
                    svg.appendChild(p1);
                    svg.appendChild(p2);
                });
            });
            this.scrollLayer.appendChild(svg);
        }

        // Balken: Phasen (dünn), Tasks (mit Fortschrittsfüllung), Meilensteine (Raute)
        // IBCS: scharfe Kanten statt runder Ecken, kein Drop-Shadow (Standard 1.2 —
        // "keine Schatten/3D"); Status "Blockiert" bleibt als rote Outline erhalten,
        // weil der Monochrom-Modus sonst dieses Signal verlieren würde.
        const rad = (px: number) => ibcs ? '0' : px + 'px';
        const phTop = Math.round((m.rowH - m.phBarH) / 2);
        const barTop = Math.round((m.rowH - m.barH) / 2);
        const diaTop = Math.round((m.rowH - m.dia) / 2);
        // Basisplan-Metriken: Plan als schmaler Outline-Balken UNTER dem Ist-Balken
        // (IBCS-Szenario-Notation: Ist = gefüllt, Plan = Rahmen)
        const planH = Math.max(4, Math.round(6 * m.s));
        const planGap = Math.max(1, Math.round(2 * m.s));
        const planStroke = ibcs ? IBCS_AC : t.sub;
        const mkPlanBar = (ps: number, pe: number, topPx: number, dimmed: boolean): HTMLElement => el('div',
            'position:absolute;left:' + x(ps) + 'px;top:' + topPx + 'px;width:' + Math.max(2, x(pe + DAY) - x(ps)) + 'px;height:' + planH + 'px;' +
            'border-radius:' + rad(3) + ';background:transparent;box-shadow:inset 0 0 0 1px ' + planStroke + ';' +
            'pointer-events:none;opacity:' + (dimmed ? 0.25 : 0.85));
        items.forEach(it => {
            const top = topOf[it.id];
            const hov = this.hover === it.id;
            const dim = sel && it.task && !sel.has(it.task.key);
            const blocked = ibcs && it.task && it.st && statusKind(it.st) === 'blocked';
            const showPlan = planOn && it.ps !== null;
            if (it.kind === 'phase' || it.kind === 'proj') {
                const w = Math.max(4, x(it.e + DAY) - x(it.s));
                const bar = el('div',
                    'position:absolute;left:' + x(it.s) + 'px;top:' + (top + phTop) + 'px;width:' + w + 'px;height:' + m.phBarH + 'px;' +
                    'border-radius:' + rad(5) + ';background:' + it.soft + ';overflow:hidden;pointer-events:none' +
                    (ibcs ? ';box-shadow:inset 0 0 0 1px ' + IBCS_AC : ''));
                bar.appendChild(el('div', 'height:100%;width:' + (it.pct === null ? 0 : it.pct) + '%;background:' + it.color + ';border-radius:' + rad(5)));
                this.scrollLayer.appendChild(bar);
                if (showPlan) this.scrollLayer.appendChild(
                    mkPlanBar(it.ps as number, it.pe as number, top + phTop + m.phBarH + planGap, false));
                // Kompakt-Meilensteine der zugeklappten Phase: Rauten auf der
                // Summenzeile, optional mit Datum (Meilenstein-/Portfolioübersicht)
                if (it.msKids.length) {
                    const dia2 = Math.max(8, Math.round(m.dia * 0.75));
                    const diaTop2 = Math.round((m.rowH - dia2) / 2);
                    it.msKids.forEach(ms => {
                        const msDim = sel && !sel.has(ms.key);
                        const dEl = el('div',
                            'position:absolute;left:' + (x(ms.s) + this.pxd / 2 - dia2 / 2) + 'px;top:' + (top + diaTop2) + 'px;width:' + dia2 + 'px;height:' + dia2 + 'px;' +
                            'transform:rotate(45deg);border-radius:' + rad(2) + ';background:' + it.color + ';cursor:pointer;' +
                            (ibcs ? '' : 'box-shadow:0 1px 3px rgba(0,0,0,0.25);') +
                            'opacity:' + (msDim ? 0.3 : 1));
                        dEl.setAttribute('data-task', ms.key);
                        dEl.setAttribute('title', ms.name + ' · ' + fmtDate(ms.s));
                        this.scrollLayer.appendChild(dEl);
                        if (msDatum) this.scrollLayer.appendChild(el('div',
                            'position:absolute;left:' + (x(ms.s) + this.pxd / 2) + 'px;top:' + (top + diaTop2 + dia2 + 1) + 'px;transform:translateX(-50%);' +
                            'font-size:' + this.fsL(8.5) + ';color:' + t.sub + ';font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;opacity:' + (msDim ? 0.3 : 1),
                            fmtDate(ms.s)));
                    });
                }
            } else if (it.kind === 'ms') {
                const dia = el('div',
                    'position:absolute;left:' + (x(it.s) + this.pxd / 2 - m.dia / 2) + 'px;top:' + (top + diaTop) + 'px;width:' + m.dia + 'px;height:' + m.dia + 'px;' +
                    'transform:rotate(45deg);border-radius:' + rad(3) + ';background:' + it.color + ';cursor:pointer;' +
                    (blocked ? 'box-shadow:inset 0 0 0 2px ' + IBCS_RED + ';' : (ibcs ? '' : 'box-shadow:0 1px 3px rgba(0,0,0,0.25);')) +
                    'opacity:' + (dim ? 0.3 : 1));
                if (it.task) dia.setAttribute('data-task', it.task.key);
                dia.addEventListener('mouseenter', (ev) => this.tipAt(it, ev as MouseEvent));
                dia.addEventListener('mousemove', (ev) => this.tipAt(it, ev as MouseEvent));
                // Plan-Meilenstein: Outline-Raute an der geplanten Position
                // (nur wenn sie vom Ist abweicht — sonst läge sie exakt darunter)
                if (showPlan && it.ps !== it.s) {
                    this.scrollLayer.appendChild(el('div',
                        'position:absolute;left:' + (x(it.ps as number) + this.pxd / 2 - m.dia / 2) + 'px;top:' + (top + diaTop) + 'px;width:' + m.dia + 'px;height:' + m.dia + 'px;' +
                        'transform:rotate(45deg);border-radius:' + rad(3) + ';background:transparent;' +
                        'box-shadow:inset 0 0 0 1.5px ' + planStroke + ';pointer-events:none;opacity:' + (dim ? 0.25 : 0.85)));
                }
                this.scrollLayer.appendChild(dia);
                const msLbl = el('div',
                    'position:absolute;left:' + (x(it.s) + this.pxd / 2 + 14) + 'px;top:' + (top + diaTop) + 'px;height:' + m.dia + 'px;' +
                    'display:flex;align-items:center;font-size:' + this.fsL(11) + ';font-weight:600;color:' + t.text + ';white-space:nowrap;pointer-events:none;opacity:' + (dim ? 0.3 : 1),
                    it.name + (msDatum ? ' · ' + fmtDate(it.s) : ''));
                if (planOn && it.delta !== null && it.delta !== 0) {
                    msLbl.appendChild(el('span',
                        'margin-left:6px;font-weight:700;font-variant-numeric:tabular-nums;color:' + (it.delta > 0 ? IBCS_RED : (ibcs ? t.text : IBCS_GREEN)),
                        'Δ ' + fmtDelta(it.delta, u)));
                }
                this.scrollLayer.appendChild(msLbl);
            } else {
                const bx = x(it.s), bw = Math.max(this.pxd, x(it.e + DAY) - x(it.s));
                const pct = it.pct === null ? 0 : it.pct;
                const outline = blocked ? IBCS_RED : it.color;
                // Mit Basisplan: Ist-Balken etwas flacher, damit Ist + Plan
                // zusammen zentriert in der Zeile sitzen
                const bh = showPlan ? Math.max(10, m.barH - planH - planGap) : m.barH;
                const bt = showPlan ? Math.round((m.rowH - (bh + planGap + planH)) / 2) : barTop;
                const bar = el('div',
                    'position:absolute;left:' + bx + 'px;top:' + (top + bt) + 'px;width:' + bw + 'px;height:' + bh + 'px;' +
                    'border-radius:' + rad(6) + ';background:' + it.soft + ';cursor:pointer;' +
                    'box-shadow:inset 0 0 0 ' + (blocked ? 2 : 1) + 'px ' + outline + (!ibcs && hov ? ',0 3px 10px rgba(0,0,0,0.22)' : '') + ';' +
                    'opacity:' + (dim ? 0.3 : 1));
                bar.appendChild(el('div',
                    'position:absolute;left:0;top:0;bottom:0;width:' + pct + '%;background:' + it.color + ';' +
                    'border-radius:' + (pct >= 100 ? rad(6) : (ibcs ? '0' : '6px 0 0 6px')) + ';opacity:' + (ibcs ? 1 : 0.92)));
                if (it.task) bar.setAttribute('data-task', it.task.key);
                bar.addEventListener('mouseenter', (ev) => this.tipAt(it, ev as MouseEvent));
                bar.addEventListener('mousemove', (ev) => this.tipAt(it, ev as MouseEvent));
                this.scrollLayer.appendChild(bar);
                if (showPlan) this.scrollLayer.appendChild(
                    mkPlanBar(it.ps as number, it.pe as number, top + bt + bh + planGap, !!dim));
                const labelParts = [it.name];
                if (it.pct !== null) labelParts.push(pct + ' %');
                if (it.ow) labelParts.push(it.ow);
                const lbl = el('div',
                    'position:absolute;left:' + (bx + bw + 10) + 'px;top:' + (top + bt) + 'px;height:' + bh + 'px;' +
                    'display:flex;align-items:center;font-size:' + this.fsL(11) + ';color:' + t.sub + ';white-space:nowrap;pointer-events:none;opacity:' + (dim ? 0.3 : 1),
                    labelParts.join(' · '));
                if (planOn && it.delta !== null && it.delta !== 0) {
                    lbl.appendChild(el('span',
                        'margin-left:6px;font-weight:700;font-variant-numeric:tabular-nums;color:' + (it.delta > 0 ? IBCS_RED : (ibcs ? t.text : IBCS_GREEN)),
                        'Δ ' + fmtDelta(it.delta, u)));
                }
                this.scrollLayer.appendChild(lbl);
            }
        });

        // --- Status-/Heute-Linie ---
        // Mit gebundenem Statusdatum wandert die rote Linie auf den
        // Berichtsstand (Label = Datum); ohne Bindung bleibt sie auf "Heute"
        this.todayHost.replaceChildren();
        if (o.heuteLinie) {
            const statusMs = o.statusDatum !== undefined && o.statusDatum !== null ? o.statusDatum : Date.now();
            const lineLabel = o.statusDatum !== undefined && o.statusDatum !== null ? fmtDate(statusMs) : 'Heute';
            const todayX = x(statusMs);
            if (todayX > -10 && todayX < cw + 10) {
                this.todayHost.appendChild(el('div',
                    'position:absolute;left:' + todayX + 'px;top:' + m.axisH + 'px;bottom:0;width:0;border-left:2px solid ' + t.today + ';opacity:0.75'));
                this.todayHost.appendChild(el('div',
                    'position:absolute;left:' + todayX + 'px;top:' + Math.round(22 * m.s) + 'px;transform:translateX(-50%);background:' + t.today + ';color:#fff;' +
                    'font-size:' + this.fsA(10) + ';font-weight:700;padding:2px 8px;border-radius:' + rad(10) + ';white-space:nowrap', lineLabel));
            }
        }
    }

    private renderTip(t: Theme, items: RenderItem[], ibcs: boolean): void {
        this.tipHost.replaceChildren();
        if (!this.tip) return;
        const it = items.find(i => i.id === this.tip!.id);
        if (!it) return;
        const isM = it.kind === 'ms';
        const box = el('div',
            'position:absolute;left:' + this.tip.x + 'px;top:' + this.tip.y + 'px;background:' + t.tipBg + ';color:' + t.tipFg + ';' +
            'border-radius:' + (ibcs ? '0' : '9px') + ';padding:11px 13px;box-shadow:' + (ibcs ? '0 0 0 1px rgba(0,0,0,0.15)' : '0 10px 28px rgba(0,0,0,0.25)') + ';min-width:200px;max-width:300px');
        box.appendChild(el('div', 'font-weight:700;font-size:' + this.fs(12.5) + ';margin-bottom:7px', it.name));
        const grid = el('div', 'display:grid;grid-template-columns:auto 1fr;gap:3px 14px;font-size:' + this.fs(11.5));
        const addRow = (label: string, val: string, mono?: boolean, fg?: string) => {
            grid.appendChild(el('div', 'color:' + t.tipSub, label));
            grid.appendChild(el('div', (mono ? 'font-variant-numeric:tabular-nums;' : '') + (fg ? 'color:' + fg + ';font-weight:700' : ''), val));
        };
        addRow('Zeitraum', isM ? fmtDate(it.s) : fmtDate(it.s) + ' – ' + fmtDate(it.e), true);
        if (it.ps !== null) {
            addRow('Plan', it.ps === it.pe || it.pe === null ? fmtDate(it.ps) : fmtDate(it.ps) + ' – ' + fmtDate(it.pe), true);
            if (it.delta !== null) addRow('Abweichung', fmtDelta(it.delta, ' Tage'), true,
                it.delta > 0 ? IBCS_RED : (it.delta < 0 && !ibcs ? IBCS_GREEN : undefined));
        }
        addRow('Dauer', isM ? 'Meilenstein' : (Math.round((it.e - it.s) / DAY) + 1) + ' Tage');
        addRow('Status', isM || !it.st ? '–' : it.st);
        addRow('Fortschritt', isM || it.pct === null ? '–' : it.pct + ' %');
        addRow('Wer', it.ow || '–');
        addRow('Hängt ab von', it.depTasks.map(d => d.name).join(', ') || '–');
        box.appendChild(grid);
        this.tipHost.appendChild(box);
    }
}
