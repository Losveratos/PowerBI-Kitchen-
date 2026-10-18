// Hängt ein Kitchen-Visual in ein DOM-Element: lädt den Visual-Code nach, baut Host
// und DataView, rendert bei Daten- und Größenänderung neu.

import { buildDataView } from "./dataview";
import { createHost, type HostState, type SelectionId } from "./host";
import type { MountOptions, VisualHandle, VisualKind, VisualObjects } from "./types";

// Power-BI-Updatetypen: Data | Resize | ViewMode | Style | ResizeEnd
const UPDATE_ALL = 62;
const UPDATE_RESIZE = 4 | 32;
const VIEW_MODE_VIEW = 0;

const CSS = `
.dwg-visual{position:relative;width:100%;height:100%;min-height:40px;overflow:hidden}
.dwg-visual>.dwg-stage{position:absolute;inset:0}
.dwg-visual .icd-root,.dwg-visual .pnl-root{width:100%;height:100%}
.dwg-visual .icd-root{overflow:hidden;font-family:inherit}
.dwg-visual svg{display:block}
.dwg-visual g.icd-cat:hover{opacity:.8}
.dwg-visual g.icd-cat:focus{outline:2px solid #005FB8;outline-offset:1px}
.dwg-visual g.icd-cat:focus:not(:focus-visible){outline:none}
.dwg-tip{position:fixed;z-index:9999;pointer-events:none;max-width:320px;padding:6px 8px;border-radius:4px;
 background:#fff;color:#252423;box-shadow:0 2px 8px rgba(0,0,0,.18);font:12px/1.4 inherit;font-variant-numeric:tabular-nums}
.dwg-tip-row{display:flex;gap:8px;align-items:center}
.dwg-tip-swatch{width:8px;height:8px;border-radius:2px;flex:none}
.dwg-tip-key{opacity:.75}
.dwg-tip-val{margin-left:auto;font-weight:600}
`;

function ensureStyles(): void {
    if (typeof document === "undefined" || document.getElementById("dwg-visuals-css")) { return; }
    const style = document.createElement("style");
    style.id = "dwg-visuals-css";
    style.textContent = CSS;
    document.head.appendChild(style);
}

interface VisualModule {
    Visual: new (o: { element: HTMLElement; host: unknown }) => {
        update(o: unknown): void;
        destroy?(): void;
    };
    LOCALES: Record<string, Record<string, string>>;
}

const loaders: Record<VisualKind, () => Promise<VisualModule>> = {
    chartkitchen: () => import("./visuals/chartkitchen") as Promise<VisualModule>,
    pnl: () => import("./visuals/pnl") as Promise<VisualModule>,
};

export async function mountVisual(el: HTMLElement, options: MountOptions): Promise<VisualHandle> {
    const mod = await loaders[options.visual]();
    ensureStyles();

    let opts: MountOptions = { ...options };
    const state: HostState = {
        locale: opts.locale ?? "de-DE",
        dark: opts.theme === "dark",
        darkBackground: opts.darkBackground ?? "#16191d",
        interactive: opts.interactive !== false,
        objects: JSON.parse(JSON.stringify(opts.objects ?? {})) as VisualObjects,
        locales: mod.LOCALES,
    };

    el.classList.add("dwg-visual");
    el.dataset.dwgVisual = opts.visual;
    const stage = document.createElement("div");
    stage.className = "dwg-stage";
    el.replaceChildren(stage);

    let lastRenderMs = 0;
    let destroyed = false;
    let pending: number | null = null;
    const keys = (ids: SelectionId[]) => ids.map(id => id.toRecord());

    const { host, selection } = createHost(state, {
        onSelect: ids => opts.onSelect?.(keys(ids)),
        // Power BI ruft nach persistProperties update() mit den neuen Objekten auf
        onPersist: objects => { opts.onPersist?.(objects); schedule(UPDATE_ALL); },
        onContextMenu: (ids, pos) => opts.onContextMenu?.(keys(ids), pos),
        onRenderingFailed: err => opts.onError?.(err),
    });

    const visual = new mod.Visual({ element: stage, host });

    const render = (type: number) => {
        if (destroyed) { return; }
        const { width, height } = el.getBoundingClientRect();
        if (width < 1 || height < 1) { return; }
        const t0 = performance.now();
        try {
            const dv = buildDataView(opts.visual, opts.table, opts.bindings, {
                objects: state.objects, formats: opts.formats, displayNames: opts.displayNames,
            });
            visual.update({
                viewport: { width: Math.floor(width), height: Math.floor(height) },
                dataViews: [dv],
                viewMode: VIEW_MODE_VIEW,
                type,
                operationKind: 0,
            });
        } catch (err) {
            if (opts.onError) { opts.onError(err); } else { throw err; }
        }
        lastRenderMs = performance.now() - t0;
        opts.onRendered?.(lastRenderMs);
    };

    let pendingType = 0;
    const schedule = (type: number) => {
        pendingType |= type;
        if (pending != null) { return; }
        pending = requestAnimationFrame(() => {
            pending = null;
            const t = pendingType;
            pendingType = 0;
            render(t);
        });
    };

    let lastSize = "";
    const ro = new ResizeObserver(entries => {
        const r = entries[0].contentRect;
        const size = `${Math.floor(r.width)}x${Math.floor(r.height)}`;
        if (size === lastSize) { return; }
        const first = lastSize === "";
        lastSize = size;
        if (!first) { schedule(UPDATE_RESIZE); }
    });
    ro.observe(el);
    render(UPDATE_ALL);

    return {
        update(next) {
            opts = { ...opts, ...next };
            if (next.locale) { state.locale = next.locale; }
            if (next.theme) { state.dark = next.theme === "dark"; }
            if (next.darkBackground) { state.darkBackground = next.darkBackground; }
            if (next.interactive != null) { state.interactive = next.interactive; }
            if (next.objects) { state.objects = JSON.parse(JSON.stringify(next.objects)); }
            schedule(UPDATE_ALL);
        },
        clearSelection() {
            selection.reset();
            schedule(UPDATE_ALL);
        },
        get objects() { return JSON.parse(JSON.stringify(state.objects)); },
        get lastRenderMs() { return lastRenderMs; },
        destroy() {
            destroyed = true;
            ro.disconnect();
            if (pending != null) { cancelAnimationFrame(pending); }
            visual.destroy?.();
            el.replaceChildren();
        },
    };
}
