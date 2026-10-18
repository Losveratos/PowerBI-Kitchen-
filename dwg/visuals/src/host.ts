// Nachbau des Power-BI-Hosts: genau die Dienste, die ChartKitchen und P&L nutzen
// (Auswahl, Tooltip, persistProperties, Palette, Sprache, Rendering-Ereignisse).
// Vorbild ist makeHost() aus den Test-Harnesses der beiden Visuals.

import type { SelectionKey, TooltipItem, VisualObjects } from "./types";

interface CategoryLike { source?: { queryName?: string; displayName?: string }; values?: unknown[] }

/** Auswahl-ID: trägt die Werte der gruppierenden Spalten einer Zeile. */
export class SelectionId {
    readonly key: string;
    constructor(readonly keys: [string, unknown][], readonly idx: number | null, readonly col: string | null) {
        this.key = JSON.stringify(keys);
    }
    equals(other: unknown): boolean { return other instanceof SelectionId && other.key === this.key; }
    includes(other: unknown): boolean { return this.equals(other); }
    getKey(): string { return this.key; }
    getSelector(): Record<string, unknown> { return {}; }
    getSelectorsByColumn(): Record<string, unknown> { return {}; }
    hasIdentity(): boolean { return this.keys.length > 0; }
    toRecord(): SelectionKey { return Object.fromEntries(this.keys); }
}

class SelectionIdBuilder {
    private keys: [string, unknown][] = [];
    private idx: number | null = null;
    private col: string | null = null;
    withCategory(cat: CategoryLike, i: number): this {
        const name = cat?.source?.queryName ?? cat?.source?.displayName ?? "?";
        this.keys.push([name, cat?.values?.[i] ?? null]);
        this.idx = i;
        this.col = cat?.source?.displayName ?? null;
        return this;
    }
    withMeasure(): this { return this; }
    withSeries(): this { return this; }
    withMatrixNode(): this { return this; }
    withTable(): this { return this; }
    createSelectionId(): SelectionId { return new SelectionId(this.keys, this.idx, this.col); }
}

export interface HostEvents {
    onSelect(ids: SelectionId[]): void;
    onPersist(objects: VisualObjects): void;
    onContextMenu(ids: SelectionId[], pos: { x: number; y: number }): void;
    onRenderingFailed(err: unknown): void;
}

export interface HostState {
    locale: string;
    dark: boolean;
    darkBackground: string;
    interactive: boolean;
    objects: VisualObjects;
    locales: Record<string, Record<string, string>>;
}

function uniqueIds(ids: SelectionId[]): SelectionId[] {
    const seen = new Set<string>();
    return ids.filter(id => (seen.has(id.key) ? false : (seen.add(id.key), true)));
}

class SelectionManager {
    private selected: SelectionId[] = [];
    private callback: ((ids: SelectionId[]) => void) | null = null;
    constructor(private events: HostEvents) {}

    select(ids: SelectionId | SelectionId[], multi = false): Promise<SelectionId[]> {
        const arr = uniqueIds(([] as SelectionId[]).concat(ids).filter(Boolean));
        if (multi) {
            const next = [...this.selected];
            for (const id of arr) {
                const at = next.findIndex(s => s.equals(id));
                if (at >= 0) { next.splice(at, 1); } else { next.push(id); }
            }
            this.selected = next;
        } else {
            // wie Power BI: erneuter Klick auf dieselbe Auswahl hebt sie auf
            const same = arr.length === this.selected.length && arr.every(a => this.selected.some(s => s.equals(a)));
            this.selected = same ? [] : arr;
        }
        this.events.onSelect(this.selected);
        return Promise.resolve(this.selected);
    }
    clear(): Promise<void> {
        this.selected = [];
        this.events.onSelect([]);
        return Promise.resolve();
    }
    /** von außen (App) aufheben, ohne erneut onSelect auszulösen */
    reset(): void {
        this.selected = [];
        this.callback?.([]);
    }
    hasSelection(): boolean { return this.selected.length > 0; }
    getSelectionIds(): SelectionId[] { return this.selected; }
    registerOnSelectCallback(cb: (ids: SelectionId[]) => void): void { this.callback = cb; }
    showContextMenu(id: SelectionId | SelectionId[], pos: { x: number; y: number }): Promise<object> {
        this.events.onContextMenu(([] as SelectionId[]).concat(id).filter(Boolean), pos);
        return Promise.resolve({});
    }
    toggleExpandCollapse(): Promise<object> { return Promise.resolve({}); }
}

let tipEl: HTMLDivElement | null = null;

function tooltip() {
    const place = (x: number, y: number) => {
        if (!tipEl) { return; }
        const r = tipEl.getBoundingClientRect();
        const left = x + 14 + r.width > window.innerWidth ? x - 14 - r.width : x + 14;
        const top = y + 14 + r.height > window.innerHeight ? y - 14 - r.height : y + 14;
        tipEl.style.left = `${Math.max(4, left)}px`;
        tipEl.style.top = `${Math.max(4, top)}px`;
    };
    const fill = (items: TooltipItem[]) => {
        if (!tipEl) {
            tipEl = document.createElement("div");
            tipEl.className = "dwg-tip";
            tipEl.setAttribute("role", "tooltip");
            document.body.appendChild(tipEl);
        }
        tipEl.replaceChildren(...items.map(it => {
            const row = document.createElement("div");
            row.className = "dwg-tip-row";
            if (it.color) {
                const sw = document.createElement("span");
                sw.className = "dwg-tip-swatch";
                sw.style.background = it.color;
                row.appendChild(sw);
            }
            const k = document.createElement("span");
            k.className = "dwg-tip-key";
            k.textContent = it.displayName;
            const v = document.createElement("span");
            v.className = "dwg-tip-val";
            v.textContent = it.value;
            row.append(k, v);
            return row;
        }));
        tipEl.hidden = false;
    };
    type Args = { dataItems?: TooltipItem[]; coordinates?: number[] };
    return {
        enabled: () => true,
        show(a: Args) { fill(a.dataItems ?? []); place(a.coordinates?.[0] ?? 0, a.coordinates?.[1] ?? 0); },
        move(a: Args) { if (a.dataItems) { fill(a.dataItems); } place(a.coordinates?.[0] ?? 0, a.coordinates?.[1] ?? 0); },
        hide() { if (tipEl) { tipEl.hidden = true; } },
    };
}

/** wendet ein persistProperties-Paket ({merge, replace, remove}) auf die Objekte an */
export function applyPersist(objects: VisualObjects, changes: unknown): VisualObjects {
    type Inst = { objectName: string; properties?: Record<string, unknown> };
    const c = (changes ?? {}) as { merge?: Inst[]; replace?: Inst[]; remove?: Inst[] };
    const next: VisualObjects = JSON.parse(JSON.stringify(objects));
    for (const i of c.replace ?? []) { next[i.objectName] = { ...(i.properties ?? {}) }; }
    for (const i of c.merge ?? []) { next[i.objectName] = { ...(next[i.objectName] ?? {}), ...(i.properties ?? {}) }; }
    for (const i of c.remove ?? []) {
        const o = next[i.objectName];
        if (o) { for (const k of Object.keys(i.properties ?? {})) { delete o[k]; } }
    }
    return next;
}

export function createHost(state: HostState, events: HostEvents) {
    const selection = new SelectionManager(events);
    const host = {
        get locale() { return state.locale; },
        get colorPalette() {
            return state.dark
                ? { isHighContrast: false, background: { value: state.darkBackground }, foreground: { value: "#e8eaed" } }
                : { isHighContrast: false, background: { value: "#ffffff" }, foreground: { value: "#252423" } };
        },
        get hostCapabilities() { return { allowInteractions: state.interactive }; },
        instanceId: "dwg",
        createSelectionManager: () => selection,
        createSelectionIdBuilder: () => new SelectionIdBuilder(),
        createLocalizationManager: () => ({
            getDisplayName: (key: string) => state.locales[state.locale]?.[key] ?? state.locales["en-US"]?.[key] ?? key,
        }),
        tooltipService: tooltip(),
        eventService: {
            renderingStarted() { /* Zeitmessung macht mount.ts */ },
            renderingFinished() { /* dito */ },
            renderingFailed(_o: unknown, reason: unknown) { events.onRenderingFailed(reason); },
        },
        persistProperties(changes: unknown) {
            const next = applyPersist(state.objects, changes);
            if (JSON.stringify(next) === JSON.stringify(state.objects)) { return; }
            state.objects = next;
            events.onPersist(next);
        },
        fetchMoreData: () => false,
        drill: () => { /* Drill-down übernimmt die App über onContextMenu */ },
        launchUrl: (url: string) => { window.open(url, "_blank", "noopener"); },
        displayWarningIcon: () => { /* nur Power BI */ },
        switchFocusModeState: () => { /* nur Power BI */ },
        applyJsonFilter: () => { /* Filter setzt die App */ },
        refreshHostData: () => { /* Daten lädt die App */ },
    };
    return { host, selection };
}
