"use strict";
// Vorlagen der Einrichtungshilfe. Welche Einstellungen sie setzen, steht in
// visual.ts (dort liegen die Objekt- und Eigenschaftsnamen des Formatbereichs).
export const VORLAGEN = [
    { key: 'planer', label: 'Projektplaner', text: 'Wie MS Project: PSP-Spalte, Puffer, Stichtage, Fortschrittslinie, Arbeitstage, Wochenansicht' },
    { key: 'management', label: 'Management-Übersicht', text: 'Kompakt: Balken nach Status, Fortschritt, Monatsansicht, ohne Planerspalten' },
    { key: 'meilensteine', label: 'Meilenstein-Portfolio', text: 'Startet mit den Hauptmeilensteinen, Quartalsansicht', braucht: 'haupt' },
    { key: 'ibcs', label: 'IBCS-Bericht', text: 'Monochrom nach IBCS, Plan vs. Ist mit Δ' },
    { key: 'standard', label: 'Zurücksetzen', text: 'Alles, was die Vorlagen ändern, wieder auf die Vorgaben' }
];
const DEP_TYP = { EA: 'EA', AA: 'AA', EE: 'EE', AE: 'AE', FS: 'EA', SS: 'AA', FF: 'EE', SF: 'AE' };
// MS-Project-Spalte "Vorgänger" zerlegen: "12;15EA+2T;7AA-1 Tag;3EE+50%".
// Deutsche (EA/AA/EE/AE) und englische (FS/SS/FF/SF) Kürzel, Einheiten T/Tage/
// d/day, W/Woche (=5 AT), Mo/Monat (=20 AT), h/Std (=1/8 AT), min, "e"-Präfix
// (fortlaufend) wird wie Tage gelesen. Nicht-numerische Einträge bleiben
// Vorgangsnamen — so funktionieren bestehende Berichte mit Namenslisten weiter.
export function parseVorgaenger(raw) {
    return String(raw).split(/[;,]/).map(x => x.trim()).filter(x => x.length > 0).map((tok) => {
        const m = /^(\d+)\s*(EA|AA|EE|AE|FS|SS|FF|SF)?\s*(?:([+-])\s*(\d+(?:[.,]\d+)?)\s*(%|[a-zäöü]*)\.?)?$/i.exec(tok);
        if (!m)
            return { ref: tok, istNr: false, typ: 'EA', lag: 0, roh: tok };
        const typ = DEP_TYP[(m[2] || 'EA').toUpperCase()];
        let lag = 0;
        let lagProzent;
        if (m[4]) {
            const v = parseFloat(m[4].replace(',', '.')) * (m[3] === '-' ? -1 : 1);
            const u = (m[5] || '').toLowerCase().replace(/^e(?=[a-zäöü])/, '');
            if (u === '%')
                lagProzent = v;
            else if (/^(w|wo|woche|wochen|wk|wks|week|weeks)$/.test(u))
                lag = v * 5;
            else if (/^(mo|mon|monat|monate|month|months)$/.test(u))
                lag = v * 20;
            else if (/^(h|std|stunde|stunden|hr|hrs|hour|hours)$/.test(u))
                lag = v / 8;
            else if (/^(m|min|minute|minuten|minutes)$/.test(u))
                lag = v / 480;
            else
                lag = v; // T, Tag(e), d, day(s) oder ohne Einheit
        }
        return { ref: m[1], istNr: true, typ, lag, lagProzent, roh: tok };
    });
}
// Feiertage aus dem Formatbereich: "01.01.2026, 03.04.2026" oder ISO "2026-04-03",
// getrennt durch Komma, Semikolon, Leerzeichen oder Zeilenumbruch
export function parseFeiertage(raw) {
    if (!raw)
        return [];
    const out = [];
    String(raw).split(/[\s,;]+/).forEach(tok => {
        let m = /^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/.exec(tok);
        if (m) {
            const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
            out.push(Date.UTC(y, Number(m[2]) - 1, Number(m[1])));
            return;
        }
        m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(tok);
        if (m)
            out.push(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    });
    return out;
}
// Arbeitskalender Mo–Fr plus Feiertage. Rechnet in UTC-Mitternachten, wie
// alle Termine im Visual. zwischen() ist O(log n) — wichtig bei 30.000 Zeilen.
export class Kalender {
    fei; // nur Feiertage, die auf einen Werktag fallen, sortiert
    feiSet;
    constructor(feiertage) {
        this.fei = feiertage.filter(f => { const d = new Date(f).getUTCDay(); return d !== 0 && d !== 6; })
            .sort((a, b) => a - b).filter((f, i, a) => i === 0 || a[i - 1] !== f);
        this.feiSet = new Set(this.fei);
    }
    istArbeitstag(ms) {
        const d = new Date(ms).getUTCDay();
        return d !== 0 && d !== 6 && !this.feiSet.has(ms);
    }
    istFeiertag(ms) {
        return this.feiSet.has(ms);
    }
    feiertage() {
        return this.fei;
    }
    // Arbeitstage im geschlossenen Intervall [a, b]; b < a → 0
    zwischen(a, b) {
        if (b < a)
            return 0;
        const tage = Math.round((b - a) / DAY) + 1;
        const wochen = Math.floor(tage / 7);
        let n = wochen * 5;
        let wd = new Date(a + wochen * 7 * DAY).getUTCDay();
        for (let i = 0; i < tage - wochen * 7; i++) {
            if (wd !== 0 && wd !== 6)
                n++;
            wd = (wd + 1) % 7;
        }
        return n - (this.untergrenze(b + 1) - this.untergrenze(a));
    }
    // vorzeichenbehaftete Arbeitstage von a nach b (positiv, wenn b später liegt)
    differenz(a, b) {
        return b >= a ? this.zwischen(a + DAY, b) : -this.zwischen(b + DAY, a);
    }
    // Datum n Arbeitstage nach ms (n ≥ 0, gerundet)
    plus(ms, n) {
        let d = ms;
        let k = Math.round(n);
        let schutz = 0;
        while (k > 0 && schutz++ < 20000) {
            d += DAY;
            if (this.istArbeitstag(d))
                k--;
        }
        return d;
    }
    untergrenze(ms) {
        let lo = 0, hi = this.fei.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (this.fei[mid] < ms)
                lo = mid + 1;
            else
                hi = mid;
        }
        return lo;
    }
}
// Heute als UTC-Mitternacht des lokalen Kalendertags (wie die Termine aus Power BI)
function heuteUtc() {
    const n = new Date();
    return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
}
const DAY = 86400000;
const BASE_FONT = 13; // Referenz-Schriftgröße; alle Metriken skalieren relativ dazu
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
const IBCS_GREEN = '#0E8A3E'; // positive Abweichung (früher als Plan)
// Kritischer Pfad (Rot wie in MS Project) und neutrale Balken für "nicht kritisch"
const KRIT_LIGHT = '#D23F31';
const KRIT_DARK = '#F06A5A';
const NEUTRAL_LIGHT = '#8D96A3';
const NEUTRAL_DARK = '#7D8692';
// Projektzeilen (Portfolio-Ebene): Akzent außerhalb der Zweig-Palette (2.3.1)
const PROJ_LIGHT = '#4F5BB5';
const PROJ_DARK = '#8F9BEA';
const SUCH_TINT = 'rgba(242,194,48,0.24)'; // Suchtreffer in der Tabelle
// Einheiten-Suffix für Tageswerte: 't' (Default), 'd', 'Tg' (2.3.1: „Tg.“) oder leer
function unitSuffix(tageEinheit) {
    if (tageEinheit === 'ohne')
        return '';
    if (tageEinheit === 'd')
        return ' d';
    if (tageEinheit === 'Tg')
        return ' Tg.';
    return ' t';
}
// Abweichung in Tagen formatieren: "+3 t" (Verzug), "−2 t" (früher), "±0 t"
function fmtDelta(d, u) {
    return (d > 0 ? '+' : d < 0 ? '−' : '±') + Math.abs(d) + u;
}
// Effektive Task-Farben (Override oder Phasen-Palette) — auch von visual.ts
// genutzt, um die Default-Swatches der Farb-Picker zu befüllen.
export function computeTaskColors(tasks, dark) {
    const pal = dark ? PHASE_HEX_DARK : PHASE_HEX_LIGHT;
    const order = [];
    tasks.forEach(t => { if (!order.includes(t.phase))
        order.push(t.phase); });
    const out = new Map();
    tasks.forEach(t => {
        out.set(t.key, t.color ? t.color : pal[order.indexOf(t.phase) % pal.length]);
    });
    return out;
}
function okl(l, c, h, a) {
    return 'oklch(' + l + ' ' + c + ' ' + h + (a !== undefined ? ' / ' + a : '') + ')';
}
// hex (#RRGGBB) + Alpha 0..1 → #RRGGBBAA
function hexA(hex, alpha) {
    return hex + Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase();
}
// Basisplan wie in MS Project ("Balkendiagramm: Überwachung"): GEFÜLLTER grauer
// Balken unter dem farbigen Aktuell-Balken. Grau aus dem Theme (sub), im
// Dunkel-Theme etwas deckender, damit er auf #1E2023 nicht absäuft.
function planFarbe(t, ibcs) {
    return hexA(t.sub, ibcs ? 0.6 : (t.panel === '#1E2023' ? 0.7 : 0.6));
}
function fmtDate(ms) {
    const d = new Date(ms);
    return ('0' + d.getUTCDate()).slice(-2) + '.' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '.' + String(d.getUTCFullYear()).slice(2);
}
function el(tag, css, text) {
    const n = document.createElement(tag);
    n.style.cssText = css;
    if (text !== undefined)
        n.textContent = text;
    return n;
}
function svgEl(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}
function statusKind(st) {
    const s = st.toLowerCase();
    if (/fertig|done|abgeschlossen|erledigt|complete/.test(s))
        return 'done';
    if (/arbeit|progress|laufend|läuft|umsetzung|active|im plan/.test(s))
        return 'progress';
    if (/block|risiko|kritisch|verzug|delayed|overdue|stopp/.test(s))
        return 'blocked';
    return 'open'; // z. B. "Offen", "Nicht begonnen"
}
// Balkenfarbe nach Status (Karte "Balken"); ohne Status = neutral
function statusHex(st, dark) {
    if (!st)
        return dark ? NEUTRAL_DARK : NEUTRAL_LIGHT;
    const k = statusKind(st);
    if (k === 'done')
        return dark ? '#69B27A' : '#3E8651';
    if (k === 'progress')
        return dark ? '#67A3E0' : '#3D78B2';
    if (k === 'blocked')
        return dark ? '#E0705F' : '#C8483B';
    return dark ? NEUTRAL_DARK : NEUTRAL_LIGHT;
}
// je Statusart ein Wort, das statusKind() wiedererkennt (für die Legende)
const STATUS_BEISPIEL = { done: 'Fertig', progress: 'In Arbeit', blocked: 'Blockiert', open: 'Offen' };
const ALL_COLS = [
    { key: 'start', label: 'Start', w: 74 },
    { key: 'end', label: 'Ende', w: 74 },
    { key: 'days', label: 'Tage', w: 46 },
    { key: 'puffer', label: 'Puffer', w: 54 },
    { key: 'stichtag', label: 'Stichtag', w: 74 },
    { key: 'delta', label: 'Δ Basisplan', w: 84 },
    { key: 'status', label: 'Status', w: 100 },
    { key: 'pct', label: 'Fortschritt', w: 110 },
    { key: 'ow', label: 'Wer', w: 60 }
];
const PSP_W = 58; // PSP-Spalte steht LINKS vom Namen, wie in MS Project
const ZUSATZ_W = 92;
// Reihenfolge, in der Spalten bei schmaler Tabelle weichen — Δ bleibt lange
// sichtbar, weil die Abweichung das wichtigste Steuerungssignal ist
const DROP_ORDER = ['z2', 'z1', 'z0', 'ow', 'stichtag', 'days', 'status', 'puffer', 'pct', 'delta', 'end', 'start'];
const MIN_TASK_COL = 140;
export class GanttRenderer {
    container;
    opts = null;
    tasks = [];
    byKey = new Map();
    // Zeitachsen-Zustand (wie im Referenz-Sample)
    pxd = 9;
    view = Date.UTC(2026, 0, 1);
    mode = '';
    collapsed = {};
    hover = null;
    tip = null;
    sy = 0;
    maxSy = 0;
    pan = null;
    fitted = false;
    lastSig = '';
    raf = 0;
    timer = 0;
    pending = false;
    m = { s: 1, rowH: ROW_H, axisH: AXIS_H, headerH: HEADER_H, barH: 20, phBarH: 9, dia: 14 };
    phaseKeys = []; // Collapse-Schlüssel ALLER Ebenen-Gruppen (jede Tiefe)
    projKeys = []; // Collapse-Schlüssel der Projekt-Ebene ("P:<Name>")
    levelCount = 0; // wirksame Ebenenzahl (Ebenen-Felder bzw. Tiefe aus dem PSP-Code)
    ebenenFelder = 0; // Anzahl gebundener Ebenen-Felder (Rolle "phase")
    sammelN = 0; // ausgelassene Sammelvorgangs-Zeilen (Kopfzeile)
    hasProj = false; // Projekt-Rolle gebunden → 3-Ebenen-Hierarchie
    hasHaupt = false; // mindestens eine Zeile ist Hauptmeilenstein
    // Ansicht ("Ansicht ▾" in der Leiste). Der Optionswert startAnsicht ist nur die
    // Startstellung — die Leiste gewinnt, bis die Option selbst wechselt.
    // 'alle', 'sammel' und 'projekte' zeigen den vollen Umfang und unterscheiden
    // sich nur im Klappzustand, mit dem Gruppen starten (s. buildItems):
    // Gruppen, deren Klappzustand noch nie gesetzt wurde, starten zugeklappt —
    // auch solche, die erst ein Filterwechsel bringt. Was der Leser selbst
    // auf-/zuklappt, bleibt so (Eintrag in collapsed).
    ansicht = 'alle';
    lastOptAnsicht = null;
    // 2.3: Leser-Knöpfe „◆ Meilensteine“ / „▭ Basisplan“ — Zustand nur im
    // Speicher (wie der Klappzustand). true = vom Leser ausgeblendet.
    msAus = false;
    planAus = false;
    lastOptPlan = null;
    gezeigtN = 0; // Vorgänge, die die aktuelle Ansicht zeigt (Kopfzeile)
    // Planungsanalyse (Netzplan, überfällig) — je Datenstand einmal, s. analyse()
    ana = null;
    anaTasks = null;
    anaSig = '';
    zyklen = 0;
    // Hierarchie aus dem PSP-Code, wenn keine Ebenen-Felder gebunden sind
    pspModus = false;
    pspName = new Map(); // Projekt\0Code → Vorgangsname
    pspKinder = new Set(); // Projekt\0Code, die Kinder haben (= Sammelvorgang)
    nodeTiefe = new Map(); // Collapse-Schlüssel → Tiefe
    maxTiefe = -1;
    vorfahren = new Map(); // Task-Schlüssel → Collapse-Schlüssel der Vorfahren
    legende = [];
    // Baum-Cache: ein Hover ändert nur this.hover — der Baum bleibt gleich. Ohne
    // Cache kostet jede Mausbewegung bei 30.000 Zeilen einen kompletten Neuaufbau.
    itemsCache = null;
    itemsSig = '';
    datenVersion = 0;
    optVersion = 0;
    // Suche und Menüs der Leiste
    suche = '';
    suchSet = new Set();
    suchIdx = -1;
    springZiel = null; // nach dem nächsten Build dorthin scrollen
    menu = null;
    lastOptZE = null; // Standard-Zeiteinheit: Wechsel passt neu ein
    lastItems = []; // Items des letzten Renders (für Koordinaten-Treffer)
    hasPlan = false; // mindestens ein Task mit Basisplan-Daten
    sbDrag = null; // aktiver Scrollbalken-Drag
    sbGeom = null;
    tblDown = null; // Mousedown in der Tabelle
    twDrag = null; // aktiver Tabellen-Trenner-Drag
    twOverride = null; // per Drag gesetzte Tabellenbreite
    lastOptTW = null; // letzter Options-Wert (Override-Reset)
    curTableW = 0;
    // Statische DOM-Hülle (einmal gebaut, Inhalte werden je Render ersetzt)
    root;
    toolbar; // ganze Leiste (wird ohne Daten ausgeblendet)
    toolbarAlle; // ⊞/⊟ ganz links, VOR dem Infotext
    toolbarInfo;
    toolbarBtns;
    panel;
    tableWrap;
    tableHead;
    rowsViewport;
    rowsLayer;
    chartArea;
    axisHost;
    bodyClip;
    fixedLayer; // Wochenenden + Gitterlinien (nicht v-scrollt)
    scrollLayer; // Lanes, Pfeile, Balken (v-scrollt)
    todayHost;
    tipHost;
    leerHinweis; // z. B. "Keine Hauptmeilensteine im aktuellen Filter"
    suchFeld; // STABIL: ein Neuaufbau je Render würde Fokus und Eingabe verlieren
    suchInfo;
    legendeHost;
    menuHost; // Overlay für "Ansicht ▾" / "Gliederung ▾"
    divider; // ziehbarer Trenner Tabelle ↔ Chart
    vTrack; // vertikaler Scrollbalken (Spur)
    vThumb; // vertikaler Scrollbalken (Griff)
    landing;
    resizeObs = null;
    constructor(container) {
        this.container = container;
        this.root = el('div', 'position:relative;width:100%;height:100%;display:flex;flex-direction:column;font-family:"Segoe UI",-apple-system,sans-serif;font-size:13px;overflow:hidden;user-select:none;padding:8px;box-sizing:border-box');
        this.toolbar = el('div', 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 2px 8px;flex-wrap:wrap');
        // Linke Hälfte: ⊞/⊟ und der Infotext als EIGENE Gruppe. Der Infotext kann
        // per darstellung.kopfzeile leer sein — die Knöpfe hängen deshalb nicht an
        // ihm, sondern daneben, und bleiben sichtbar.
        const linksGrp = el('div', 'display:flex;align-items:center;gap:8px;min-width:0');
        this.toolbarAlle = el('div', 'display:flex;gap:6px;align-items:center');
        this.toolbarInfo = el('div', 'font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0');
        this.toolbarBtns = el('div', 'display:flex;gap:8px;align-items:center');
        // Suche: findet Vorgänge über Name, PSP-Code und Nr.; Enter springt zum
        // nächsten Treffer und klappt dafür die Vorfahren auf.
        this.suchFeld = document.createElement('input');
        this.suchFeld.type = 'search';
        this.suchFeld.placeholder = 'Suchen …';
        this.suchFeld.setAttribute('aria-label', 'Vorgang suchen');
        this.suchFeld.style.cssText = 'width:128px;height:28px;box-sizing:border-box;border-radius:8px;padding:0 9px;font:inherit;font-size:12px;outline:none;user-select:text';
        this.suchInfo = el('div', 'font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums');
        const suchWrap = el('div', 'display:flex;align-items:center;gap:6px');
        suchWrap.appendChild(this.suchFeld);
        suchWrap.appendChild(this.suchInfo);
        this.legendeHost = el('div', 'display:flex;align-items:center;gap:10px;min-width:0;overflow:hidden');
        linksGrp.appendChild(this.toolbarAlle);
        linksGrp.appendChild(suchWrap);
        linksGrp.appendChild(this.toolbarInfo);
        linksGrp.appendChild(this.legendeHost);
        this.toolbar.appendChild(linksGrp);
        this.toolbar.appendChild(this.toolbarBtns);
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
        // Leere Chartfläche ist nicht von "kaputt" zu unterscheiden — bei aktivem
        // Hauptmeilenstein-Filter steht hier stattdessen ein Hinweis.
        this.leerHinweis = el('div', 'position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;padding:0 16px;font-size:12.5px;pointer-events:none;display:none');
        this.chartArea.appendChild(this.axisHost);
        this.chartArea.appendChild(this.bodyClip);
        this.chartArea.appendChild(this.leerHinweis);
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
        this.menuHost = el('div', 'position:absolute;left:0;top:0;z-index:30;display:none');
        this.root.appendChild(this.toolbar);
        this.root.appendChild(panelWrap);
        this.root.appendChild(this.landing);
        this.root.appendChild(this.menuHost);
        this.container.appendChild(this.root);
        // --- stabile Event-Verdrahtung (überlebt die Re-Renders) ---
        this.vThumb.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.sbDrag = { y0: e.clientY, sy0: this.sy };
            this.invalidate();
        });
        this.vTrack.addEventListener('mousedown', (e) => {
            if (e.target === this.vThumb)
                return;
            e.stopPropagation();
            e.preventDefault();
            // Klick auf die Spur: Griffmitte zur Klickposition springen, dann direkt draggbar
            const g = this.sbGeom;
            if (!g || g.trackH <= g.thumbH)
                return;
            const r = this.vTrack.getBoundingClientRect();
            const sk = this.skala(this.vTrack);
            const frac = Math.max(0, Math.min(1, ((e.clientY - r.top) / sk - g.thumbH / 2) / (g.trackH - g.thumbH)));
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
        // Re-Renders aus, die die Zeilen-Knoten ersetzen.
        //
        // Und bewusst über mousedown+mouseup statt über 'click': wird der Knoten
        // unter dem Zeiger zwischen Drücken und Loslassen ersetzt, stellt der
        // Browser gar kein click-Event zu — auch nicht an einen Vorfahren. Ein
        // Listener auf dem stabilen Viewport hilft dagegen NICHT. Genau das machte
        // das Auf-/Zuklappen unbrauchbar: ein menschlicher Klick dauert länger als
        // ein Frame, ein synthetischer (Test) nicht — deshalb fiel es lange nicht
        // auf. mouseup wird dagegen immer an das Element unter dem Zeiger
        // zugestellt und blubbert hoch.
        this.rowsViewport.addEventListener('mousedown', (ev) => {
            if (ev.button !== 0)
                return;
            const it = this.tableItemAtY(ev.clientY);
            this.tblDown = { x: ev.clientX, y: ev.clientY, id: it ? it.id : '' };
        });
        this.rowsViewport.addEventListener('mouseup', (ev) => {
            const d = this.tblDown;
            this.tblDown = null;
            if (!d || ev.button !== 0 || !this.opts)
                return;
            // gleiche Toleranz wie im Chart: Touchpad-Klicks verrutschen leicht
            if (Math.abs(ev.clientX - d.x) > 8 || Math.abs(ev.clientY - d.y) > 8)
                return;
            const it = this.tableItemAtY(ev.clientY);
            if (!it) {
                if (d.id === '')
                    this.opts.onClear();
                return;
            }
            if (it.id !== d.id)
                return;
            if (it.kind === 'phase' || it.kind === 'proj')
                this.togglePhase(it.phaseKey);
            else if (it.task) {
                if (it.kind === 'ms' && it.msKids.length > 1 && this.opts.onSelectMany)
                    this.opts.onSelectMany(it.msKids, ev);
                else
                    this.opts.onSelect(it.task, ev);
                // Detail-Tooltip wie beim Hover im Chart — verankert am Balken;
                // zweiter Klick auf dieselbe Zeile blendet ihn wieder aus
                if (this.tip && this.tip.id === it.id) {
                    this.tip = null;
                }
                else {
                    const r = { width: this.chartArea.clientWidth, height: this.chartArea.clientHeight };
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
            if (it && it.task && this.opts) {
                ev.preventDefault();
                ev.stopPropagation();
                this.opts.onContextMenu(it.task, ev);
            }
        });
        window.addEventListener('mousemove', this.onWinMove);
        window.addEventListener('mouseup', this.onWinUp);
        window.addEventListener('mousedown', this.onWinDown, true);
        window.addEventListener('keydown', this.onWinKey);
        this.suchFeld.addEventListener('input', () => {
            this.suche = this.suchFeld.value.trim();
            this.suchIdx = -1;
            this.invalidate();
        });
        this.suchFeld.addEventListener('keydown', (e) => {
            // Power BI hat eigene Tastenkürzel — Eingaben gehören hier der Suche
            e.stopPropagation();
            if (e.key === 'Enter') {
                e.preventDefault();
                this.springeZuTreffer(e.shiftKey ? -1 : 1);
            }
            else if (e.key === 'Escape') {
                this.suchFeld.value = '';
                this.suche = '';
                this.suchIdx = -1;
                this.invalidate();
            }
        });
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObs = new ResizeObserver(() => this.invalidate());
            this.resizeObs.observe(this.container);
        }
    }
    destroy() {
        window.removeEventListener('mousemove', this.onWinMove);
        window.removeEventListener('mouseup', this.onWinUp);
        window.removeEventListener('mousedown', this.onWinDown, true);
        window.removeEventListener('keydown', this.onWinKey);
        if (this.resizeObs)
            this.resizeObs.disconnect();
        this.pending = false;
        if (this.raf)
            cancelAnimationFrame(this.raf);
        if (this.timer)
            clearTimeout(this.timer);
        this.container.removeChild(this.root);
    }
    setData(tasks) {
        this.tasks = tasks;
        this.datenVersion++;
        this.byKey = new Map(tasks.map(t => [t.key, t]));
        // Der Schlüssel ist jetzt der Pfad (Vorgangsnamen sind in großen Plänen
        // nicht eindeutig), Abhängigkeiten werden aber weiter über Namen gepflegt.
        // Namen daher als Zweitindex ergänzen — Pfad-Schlüssel haben Vorrang.
        tasks.forEach(t => { if (!this.byKey.has(t.name))
            this.byKey.set(t.name, t); });
        this.ebenenFelder = tasks.reduce((mx, t) => Math.max(mx, t.path ? t.path.length : (t.phase !== null ? 1 : 0)), 0);
        this.levelCount = this.ebenenFelder;
        // Jedes update() liefert den bereits von Power BI gefilterten DataView —
        // der Knopf "Nur Hauptmeilensteine" richtet sich also immer nach dem
        // aktuellen Stand und braucht daneben keine eigene Filterlogik.
        this.hasHaupt = tasks.some(t => t.haupt === true);
        // Nur neu einpassen, wenn sich die Task-Menge wirklich ändert —
        // sonst springt die Ansicht bei jeder Crossfilter-Interaktion.
        const sig = tasks.map(t => t.key).join('|');
        if (sig !== this.lastSig) {
            this.lastSig = sig;
            this.fitted = false;
        }
        this.invalidate();
    }
    setOptions(opts) {
        this.opts = opts;
        this.optVersion++;
        this.invalidate();
    }
    // ---------- Zustands-Helfer ----------
    setState(patch) {
        let geaendert = false;
        if (patch.pxd !== undefined && patch.pxd !== this.pxd) {
            this.pxd = patch.pxd;
            geaendert = true;
        }
        if (patch.view !== undefined && patch.view !== this.view) {
            this.view = patch.view;
            geaendert = true;
        }
        if (patch.mode !== undefined && patch.mode !== this.mode) {
            this.mode = patch.mode;
            geaendert = true;
        }
        if (patch.hover !== undefined && patch.hover !== this.hover) {
            this.hover = patch.hover;
            geaendert = true;
        }
        if (patch.sy !== undefined && patch.sy !== this.sy) {
            this.sy = patch.sy;
            geaendert = true;
        }
        if (patch.tip !== undefined) {
            const a = this.tip, b = patch.tip;
            const gleich = (a === null && b === null)
                || (a !== null && b !== null && a.id === b.id && a.x === b.x && a.y === b.y);
            if (!gleich) {
                this.tip = patch.tip;
                geaendert = true;
            }
        }
        if (geaendert)
            this.invalidate();
    }
    invalidate() {
        // rAF für flüssiges Pannen/Zoomen; setTimeout-Fallback, weil rAF in
        // versteckten Tabs pausiert (z. B. Power-BI-Export nach PDF/PPT oder
        // Hintergrund-Rendering) — sonst bliebe das Visual dort leer.
        if (this.pending)
            return;
        this.pending = true;
        const run = () => {
            if (!this.pending)
                return;
            this.pending = false;
            if (this.raf) {
                cancelAnimationFrame(this.raf);
                this.raf = 0;
            }
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = 0;
            }
            this.render();
        };
        this.raf = requestAnimationFrame(run);
        this.timer = window.setTimeout(run, 32);
    }
    // ---------- Interaktion ----------
    onWheel = (e) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            const r = this.chartArea.getBoundingClientRect();
            const mx = (e.clientX - r.left) / this.skala(this.chartArea);
            const f = Math.exp(-e.deltaY * 0.0022);
            const np = Math.min(60, Math.max(0.25, this.pxd * f));
            const tms = this.view + mx / this.pxd * DAY;
            this.setState({ pxd: np, view: tms - mx / np * DAY, mode: '' });
            return;
        }
        let dx = e.deltaX, dy = e.deltaY;
        if (e.shiftKey && Math.abs(dy) > Math.abs(dx)) {
            dx = dy;
            dy = 0;
        }
        const patch = {};
        if (dx)
            patch.view = this.view + dx / this.pxd * DAY;
        if (dy) {
            if (this.maxSy > 0)
                patch.sy = Math.max(0, Math.min(this.maxSy, this.sy + dy));
            else if (!dx)
                patch.view = this.view + dy / this.pxd * DAY;
        }
        if (patch.view !== undefined || patch.sy !== undefined)
            this.setState(patch);
    };
    taskKeyFromEvent(ev) {
        const t = ev.target;
        const hit = t && t.closest ? t.closest('[data-task]') : null;
        return hit ? hit.getAttribute('data-task') : null;
    }
    // Zeile aus einer Bildschirm-Y-Koordinate ableiten (render-fest: braucht
    // keine lebenden DOM-Knoten, nur die Item-Liste des letzten Renders)
    tableItemAtY(clientY) {
        return this.itemAt(this.rowsViewport, clientY);
    }
    chartItemAtY(clientY) {
        return this.itemAt(this.bodyClip, clientY);
    }
    // Nur die Zeilen im Sichtfenster (plus Puffer) bekommen DOM-Knoten. Ohne das
    // entstehen bei 30.000 Zeilen ~460.000 Knoten und der erste Frame dauert
    // Sekunden. Position und Treffererkennung rechnen weiter über den vollen
    // Index (this.lastItems), daher ändert sich am Verhalten sonst nichts.
    sichtbar(len, sy, viewH) {
        const rh = this.m.rowH;
        const puffer = 8;
        const a = Math.max(0, Math.floor(sy / rh) - puffer);
        const b = Math.min(len, Math.ceil((sy + Math.max(0, viewH)) / rh) + puffer);
        return [a, b];
    }
    // Power BI skaliert das Visual per CSS-Transform (Anpassen an Seite,
    // Fokusmodus, Browser-Zoom, mobile Layouts). getBoundingClientRect und
    // alle client-Koordinaten sind dann SKALIERTE Pixel, Zeilenhöhe, pxd und
    // sy dagegen unskaliert. Ohne Korrektur trifft ein Klick die falsche Zeile
    // — und zwar umso weiter daneben, je tiefer sie liegt — und Pannen,
    // Scrollbalken, Zoom und Tooltip laufen um denselben Faktor daneben.
    skala(host) {
        const h = host.offsetHeight, w = host.offsetWidth;
        const r = host.getBoundingClientRect();
        if (h > 0 && r.height > 0)
            return r.height / h;
        if (w > 0 && r.width > 0)
            return r.width / w;
        return 1;
    }
    // Skalierung des gesamten Visuals (für Deltas, die zu keinem Host gehören)
    skalaRoot() {
        return this.skala(this.root);
    }
    // Eigene Bezeichnung aus der Karte "Beschriftungen", sonst der bisherige Text
    text(k, vorgabe) {
        const t = this.opts && this.opts.texte ? this.opts.texte[k] : undefined;
        return t !== undefined && t !== null && String(t).trim() !== '' ? String(t).trim() : vorgabe;
    }
    itemAt(host, clientY) {
        const r = host.getBoundingClientRect();
        if (clientY < r.top || clientY > r.bottom)
            return null;
        const idx = Math.floor(((clientY - r.top) / this.skala(host) + this.sy) / this.m.rowH);
        return idx >= 0 && idx < this.lastItems.length ? this.lastItems[idx] : null;
    }
    togglePhase(k) {
        this.collapsed[k] = !this.collapsed[k];
        this.invalidate();
    }
    onChartDown = (e) => {
        if (e.button !== 0)
            return;
        this.pan = { x0: e.clientX, y0: e.clientY, v0: this.view, moved: false, taskKey: this.taskKeyFromEvent(e) };
        this.setState({ tip: null });
    };
    onChartCtx = (e) => {
        const key = this.taskKeyFromEvent(e);
        if (!key || !this.opts)
            return;
        const task = this.byKey.get(key);
        if (task) {
            e.preventDefault();
            e.stopPropagation();
            this.opts.onContextMenu(task, e);
        }
    };
    onWinMove = (e) => {
        // Tabellen-Trenner-Drag: Breite live anpassen
        if (this.twDrag) {
            const availW = this.panel.clientWidth || this.container.clientWidth;
            const w = Math.max(0, Math.min(Math.round(availW * 0.7), this.twDrag.w0 + (e.clientX - this.twDrag.x0) / this.skalaRoot()));
            this.twOverride = w;
            this.invalidate();
            return;
        }
        // Scrollbalken-Drag hat Vorrang vor dem Pannen
        if (this.sbDrag) {
            const g = this.sbGeom;
            if (g && g.trackH > g.thumbH) {
                const dy = (e.clientY - this.sbDrag.y0) / this.skalaRoot();
                const sy = Math.max(0, Math.min(this.maxSy, this.sbDrag.sy0 + dy * this.maxSy / (g.trackH - g.thumbH)));
                this.setState({ sy });
            }
            return;
        }
        if (!this.pan)
            return;
        // Klick-Toleranz 8px: Touchpad-Klicks verschieben den Cursor beim
        // physischen Drücken oft um einige Pixel — mit 4px wurde daraus ein
        // Pan statt eines Klicks (Auf-/Zuklappen ging nur per Touchscreen)
        if (!this.pan.moved && Math.abs(e.clientX - this.pan.x0) < 8 && Math.abs(e.clientY - this.pan.y0) < 8)
            return;
        this.pan.moved = true;
        this.setState({ view: this.pan.v0 - (e.clientX - this.pan.x0) / this.skalaRoot() / this.pxd * DAY });
    };
    onWinUp = (e) => {
        if (this.twDrag) {
            this.twDrag = null;
            // gezogene Breite an den Host melden (persistiert nach tabellenBreite)
            if (this.twOverride !== null && this.opts && this.opts.onTableWidth)
                this.opts.onTableWidth(this.twOverride);
            this.invalidate();
            return;
        }
        this.tblDown = null;
        if (this.sbDrag) {
            this.sbDrag = null;
            this.invalidate();
            return;
        }
        const pan = this.pan;
        this.pan = null;
        if (!pan)
            return;
        if (!pan.moved && this.opts) {
            // Klick ohne Bewegung: Task selektieren, Phasen-Zeile klappen
            // (jetzt auch im Chart möglich, nicht nur in der Tabelle) oder
            // Selektion aufheben
            const task = pan.taskKey ? this.byKey.get(pan.taskKey) : null;
            if (task)
                this.opts.onSelect(task, e);
            else {
                const it = this.chartItemAtY(pan.y0);
                if (it && (it.kind === 'phase' || it.kind === 'proj'))
                    this.togglePhase(it.phaseKey);
                else if (it && it.kind === 'ms' && it.msKids.length > 1 && this.opts.onSelectMany)
                    this.opts.onSelectMany(it.msKids, e);
                else
                    this.opts.onClear();
            }
        }
        this.invalidate();
    };
    // Offenes Menü schließt bei jedem Klick daneben (Capture-Phase, damit es auch
    // Klicks erwischt, die andere Listener per stopPropagation abfangen)
    onWinDown = (e) => {
        if (!this.menu)
            return;
        const t = e.target;
        if (t && (this.menuHost.contains(t) || (t.closest && t.closest('[data-menu]'))))
            return;
        this.menu = null;
        this.invalidate();
    };
    onWinKey = (e) => {
        if (e.key === 'Escape' && this.menu) {
            this.menu = null;
            this.invalidate();
        }
    };
    tipAt(item, e) {
        const r = this.chartArea.getBoundingClientRect();
        const sk = this.skala(this.chartArea);
        let x = (e.clientX - r.left) / sk + 16, y = (e.clientY - r.top) / sk + 16;
        x = Math.max(4, Math.min(x, r.width - 240));
        y = Math.max(4, Math.min(y, r.height - 190));
        this.setState({ tip: { id: item.id, x, y }, hover: item.id });
    }
    // ---------- Navigation (Toolbar) ----------
    // Setzt pxd/view direkt (ohne setState), damit der laufende Render die
    // frischen Werte nutzt; fitAll() ist die Toolbar-Variante mit Re-Render.
    // px/Tag je Zeiteinheit (Referenz-Sample + neu Quartale/Jahre)
    static MODE_PXD = { Tage: 24, Wochen: 9, Monate: 3.2, Quartale: 1.1, Jahre: 0.32 };
    // Zeilen, die die aktuelle Ansicht tatsächlich zeigt. Zoom-Fit, "Alles" und
    // die Suche dürfen sonst auf Vorgänge zielen, die gar nicht zu sehen sind.
    // Die Ansicht gilt AUCH dann, wenn der (von Power BI bereits gefilterte)
    // DataView gerade nichts Passendes enthält — ein stiller Rückfall auf den
    // vollen Plan würde zeigen, was der Nutzer gerade ausgeschlossen hat.
    gezeigteTasks() {
        if (this.ansicht === 'haupt')
            return this.tasks.filter(t => t.haupt === true);
        if (this.ansicht === 'meilensteine')
            return this.tasks.filter(t => this.isMs(t));
        const basis = this.ohneMs() ? this.tasks.filter(t => !this.isMs(t)) : this.tasks;
        if (this.vollerUmfang())
            return basis;
        const a = this.analyse();
        if (this.ansicht === 'kritisch')
            return basis.filter(t => a.krit.get(t.key) === true);
        return basis.filter(t => a.ueber.has(t.key));
    }
    // Ansichten ohne Filter: sie unterscheiden sich nur im Start-Klappzustand
    vollerUmfang() {
        return this.ansicht === 'alle' || this.ansicht === 'sammel' || this.ansicht === 'projekte';
    }
    // „◆ Meilensteine“ wirkt nur, wo der Knopf angeboten wird: in den beiden
    // Meilenstein-Ansichten wäre „ohne Meilensteine“ eine leere Fläche
    msUmschaltbar() {
        return this.ansicht !== 'meilensteine' && this.ansicht !== 'haupt'
            && (!this.opts || this.opts.knopfMeilensteine !== false);
    }
    ohneMs() {
        return this.msAus && this.msUmschaltbar();
    }
    // Basisplan zeichnen: Formatbereich (basisplan.anzeigen) UND Leser-Knopf.
    // Ist der Knopf abgeschaltet, gilt allein der Formatbereich.
    planSichtbar() {
        const o = this.opts;
        if (o && o.basisplan === false)
            return false;
        return !(this.planAus && (!o || o.knopfBasisplan !== false));
    }
    // Gibt es überhaupt Gruppen (Ebenen-Felder oder PSP-Gliederung)?
    hatGruppen() {
        return this.ebenenFelder > 0 || this.tasks.some(t => !!t.psp && t.psp.indexOf('.') > 0);
    }
    // Umschalten der Ansicht: der gezeigte Umfang wechselt komplett, deshalb darf
    // vom alten Stand nichts überleben. Liefert true, wenn sich etwas geändert hat.
    wechsleAnsicht(v) {
        const neu = (v === 'sammel' || v === 'projekte' || v === 'meilensteine' || v === 'haupt' || v === 'kritisch' || v === 'ueberfaellig') ? v : 'alle';
        if (this.ansicht === neu)
            return false;
        this.ansicht = neu;
        this.collapsed = {};
        this.sy = 0;
        this.fitted = false;
        this.tip = null;
        return true;
    }
    // Auf eine Menge von Vorgängen einpassen (Toolbar "Auswahl")
    einpassen(ts) {
        const cw = this.chartArea.clientWidth;
        if (!ts.length || cw <= 0)
            return;
        const mn = ts.reduce((a, t) => Math.min(a, t.s), Infinity);
        const mx = ts.reduce((a, t) => Math.max(a, t.e === null ? t.s : t.e), -Infinity);
        const span = (mx - mn) / DAY + 16;
        this.pxd = Math.min(30, Math.max(0.25, (cw - 40) / span));
        this.view = mn - 6 * DAY;
        this.mode = '';
    }
    // Suchtreffer in der aktuellen Ansicht: Name, PSP-Code oder Nr.
    suchTreffer() {
        const q = this.suche.toLowerCase();
        if (!q)
            return [];
        return this.gezeigteTasks().filter(t => t.name.toLowerCase().includes(q)
            || (!!t.psp && t.psp.toLowerCase().startsWith(q))
            || (!!t.nr && t.nr === q));
    }
    springeZuTreffer(dir) {
        const tr = this.suchTreffer();
        if (!tr.length)
            return;
        this.suchIdx = ((this.suchIdx < 0 && dir < 0 ? 0 : this.suchIdx) + dir + tr.length) % tr.length;
        const t = tr[this.suchIdx];
        (this.vorfahren.get(t.key) || []).forEach(ck => { this.collapsed[ck] = false; });
        this.springZiel = t.key;
        this.invalidate();
    }
    computeFit(erzwingeEinpassen) {
        const cw = this.chartArea.clientWidth;
        const ts = this.gezeigteTasks();
        if (!ts.length || cw <= 0)
            return;
        const mn = ts.reduce((a, x) => Math.min(a, x.s), Infinity);
        // Standard-Zeiteinheit aus den Optionen: beim ERSTEN Layout fester
        // Maßstab statt Einpassen; der "Alles"-Button passt immer ein
        const ze = this.opts && this.opts.zeiteinheit;
        // 2.3.1: Das erste Bild zeigt die Status-/Heute-Linie. Liegt sie außerhalb
        // des Plans (Bericht zum 31.07., Plan endet im April), wird der Ausschnitt
        // so gelegt, dass sie mit etwas Luft dahinter im Bild ist. "Alles" passt
        // weiter nur den Plan ein; Zoom und Pannen danach bleiben frei.
        const linie = erzwingeEinpassen ? null : this.linienMs();
        if (!erzwingeEinpassen && ze && GanttRenderer.MODE_PXD[ze]) {
            if (linie === null) {
                this.pxd = GanttRenderer.MODE_PXD[ze];
                this.view = mn - 6 * DAY;
                this.mode = ze;
                return;
            }
            // Gewählte Einheit, sonst die nächst gröbere, bei der neben der
            // Linie auch Vorgänge im Bild sind — sonst bliebe die Fläche leer
            const stufen = ['Tage', 'Wochen', 'Monate', 'Quartale', 'Jahre'];
            for (let i = Math.max(0, stufen.indexOf(ze)); i < stufen.length; i++) {
                const pxd = GanttRenderer.MODE_PXD[stufen[i]];
                const sichtbar = cw / pxd * DAY;
                let view = mn - 6 * DAY;
                // rechts bleiben 15 % Luft, links mindestens 10 %
                if (linie > view + sichtbar * 0.85)
                    view = linie - sichtbar * 0.85;
                else if (linie < view + sichtbar * 0.1)
                    view = linie - sichtbar * 0.1;
                const imBild = ts.some(x => (x.e === null ? x.s : x.e) + DAY >= view && x.s <= view + sichtbar);
                if (imBild || i === stufen.length - 1) {
                    this.pxd = pxd;
                    this.view = view;
                    this.mode = stufen[i];
                    return;
                }
            }
        }
        let von = mn;
        let mx = ts.reduce((a, x) => Math.max(a, x.e === null ? x.s : x.e), -Infinity);
        if (linie !== null) {
            von = Math.min(von, linie - 7 * DAY);
            mx = Math.max(mx, linie + 7 * DAY);
        }
        const span = (mx - von) / DAY + 16;
        this.pxd = Math.min(30, Math.max(0.25, (cw - 40) / span));
        this.view = von - 6 * DAY;
        this.mode = '';
    }
    // Tag der roten Linie (Statusdatum, sonst heute) — null, wenn sie aus ist
    linienMs() {
        const o = this.opts;
        if (!o || !o.heuteLinie)
            return null;
        return o.statusDatum !== undefined && o.statusDatum !== null ? o.statusDatum : Date.now();
    }
    fitAll() {
        this.computeFit(true);
        this.invalidate();
    }
    // "Heute" zielt auf den Berichtsstand, wenn ein Statusdatum gebunden ist —
    // in einem Bericht zum 16.03. ist das der relevante Tag, nicht das Systemdatum
    goToday() {
        const cw = this.chartArea.clientWidth;
        const o = this.opts;
        const ziel = o && o.statusDatum !== undefined && o.statusDatum !== null ? o.statusDatum : Date.now();
        this.setState({ view: ziel - cw / 2 / this.pxd * DAY });
    }
    setMode(m) {
        const cw = this.chartArea.clientWidth;
        const c = this.view + cw / 2 / this.pxd * DAY;
        const np = GanttRenderer.MODE_PXD[m];
        if (!np)
            return;
        this.setState({ mode: m, pxd: np, view: c - cw / 2 / np * DAY });
    }
    zoomBy(f) {
        const cw = this.chartArea.clientWidth;
        const c = this.view + cw / 2 / this.pxd * DAY;
        const np = Math.min(60, Math.max(0.25, this.pxd * f));
        this.setState({ pxd: np, view: c - cw / 2 / np * DAY, mode: '' });
    }
    // ---------- Ableitungen ----------
    theme(dark) {
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
    isMs(c) {
        if (c.e === null)
            return true;
        return !!this.opts && this.opts.msEndeGleichStart === true && c.e === c.s;
    }
    // Basisplan je Task: Plan-Ende fällt auf Plan-Start zurück (Plan-Meilenstein);
    // Abweichung = Ist-Ende − Plan-Ende in Tagen (+ = Verzug)
    static planOf(c) {
        const ps = c.ps !== undefined && c.ps !== null ? c.ps : null;
        const peRaw = c.pe !== undefined && c.pe !== null ? c.pe : ps;
        const pe = peRaw !== null && ps !== null && peRaw < ps ? ps : peRaw;
        const actualEnd = c.e === null ? c.s : c.e;
        return { ps, pe, delta: pe === null ? null : Math.round((actualEnd - pe) / DAY) };
    }
    // Aggregat einer Gruppe (Phase oder Projekt): Zeitraum-Hülle, dauergewichteter
    // Fortschritt, Basisplan-Hülle und Verzugs-Delta
    static aggOf(kids) {
        const s = Math.min(...kids.map(c => c.s));
        const e = Math.max(...kids.map(c => c.e === null ? c.s : c.e));
        let wd = 0, wp = 0, anyPct = false;
        kids.forEach(c => {
            const d = c.e !== null ? (c.e - c.s) / DAY + 1 : 1;
            wd += d;
            if (c.pct !== null) {
                anyPct = true;
                wp += d * c.pct;
            }
        });
        const plans = kids.map(GanttRenderer.planOf);
        const pss = plans.map(p => p.ps).filter((v) => v !== null);
        const pes = plans.map(p => p.pe).filter((v) => v !== null);
        const ps = pss.length ? Math.min(...pss) : null;
        const pe = pes.length ? Math.max(...pes) : null;
        return { s, e, pct: anyPct ? Math.round(wp / wd) : null, ps, pe, delta: pe === null ? null : Math.round((e - pe) / DAY) };
    }
    // ---------- Planungsanalyse ----------
    static pk(t) {
        return (t.projekt !== undefined && t.projekt !== null ? t.projekt : '') + '\u0000';
    }
    // Vorgänger auflösen, kritischen Pfad/Puffer und Überfälligkeit bestimmen.
    // Gecacht je Datenstand + Kalender + Statusdatum — Hover-Renders kosten so nichts.
    analyse() {
        const o = this.opts;
        const statusMs = o && o.statusDatum !== undefined && o.statusDatum !== null ? o.statusDatum : heuteUtc();
        const at = !!(o && o.arbeitstage);
        const sig = (o && o.feiertage ? o.feiertage : '') + '|' + statusMs + '|' + (o && o.msEndeGleichStart ? 1 : 0) + '|' + (at ? 1 : 0);
        if (this.ana && this.anaTasks === this.tasks && this.anaSig === sig)
            return this.ana;
        const kal = new Kalender(parseFeiertage(o ? o.feiertage : undefined));
        const tasks = this.tasks;
        const pk = GanttRenderer.pk;
        // --- Vorgänger: Nr. innerhalb desselben Projekts (MS-Project-IDs beginnen
        // in jedem Plan bei 1), sonst Vorgangsname
        const nrGebunden = tasks.some(t => t.nr !== undefined && t.nr !== null && t.nr !== '');
        const byNr = new Map();
        const byName = new Map();
        tasks.forEach(t => {
            if (t.nr) {
                const k = pk(t) + t.nr;
                if (!byNr.has(k))
                    byNr.set(k, t);
            }
            const kn = pk(t) + t.name;
            if (!byName.has(kn))
                byName.set(kn, t);
        });
        let unaufgeloest = 0;
        this.zyklen = 0;
        const links = new Map();
        tasks.forEach(t => {
            const refs = t.depRefs ? t.depRefs : t.deps.map((d) => ({ ref: d, istNr: false, typ: 'EA', lag: 0, roh: d }));
            const ls = [];
            refs.forEach(r => {
                let src = r.istNr ? byNr.get(pk(t) + r.ref) : undefined;
                if (!src)
                    src = byName.get(pk(t) + r.ref) || this.byKey.get(r.ref);
                if (!src || src === t) {
                    if (r.istNr)
                        unaufgeloest++;
                    return;
                }
                ls.push({ src, typ: r.typ, lag: r.lag, lagProzent: r.lagProzent, roh: r.roh });
            });
            if (ls.length)
                links.set(t.key, ls);
        });
        // --- Puffer: aus dem Export, sonst berechnet (nur wenn Vorgänger da sind)
        const fertig = (t) => t.pct !== null ? t.pct >= 100 : (!!t.st && statusKind(t.st) === 'done');
        const puffer = new Map();
        let pufferQuelle = null;
        if (tasks.some(t => t.puffer !== undefined && t.puffer !== null)) {
            pufferQuelle = 'rolle';
            tasks.forEach(t => { if (t.puffer !== undefined && t.puffer !== null)
                puffer.set(t.key, t.puffer); });
        }
        else if (links.size) {
            pufferQuelle = 'berechnet';
            this.netzplan(tasks, links, kal).forEach((v, k) => puffer.set(k, v));
        }
        // --- Kritisch: Rolle > Puffer ≤ 0. Abgeschlossenes ist nie kritisch —
        // es kann den Endtermin nicht mehr verschieben (wie in MS Project).
        const krit = new Map();
        let kritQuelle = null;
        if (tasks.some(t => t.kritisch !== undefined)) {
            kritQuelle = 'rolle';
            tasks.forEach(t => krit.set(t.key, t.kritisch === true));
        }
        else if (pufferQuelle) {
            kritQuelle = pufferQuelle === 'rolle' ? 'puffer' : 'berechnet';
            tasks.forEach(t => { const p = puffer.get(t.key); krit.set(t.key, p !== undefined && p <= 0 && !fertig(t)); });
        }
        // --- Überfällig zum Statusdatum: Ende liegt davor, Vorgang ist nicht fertig.
        // Ohne Fortschritt UND ohne Status ist das nicht bestimmbar — dann nichts markieren.
        const ueberBestimmbar = tasks.some(t => t.pct !== null || (!!t.st && t.st !== ''));
        const ueber = new Map();
        if (ueberBestimmbar)
            tasks.forEach(t => {
                if (t.pct === null && !t.st)
                    return;
                if (fertig(t))
                    return;
                const ende = this.isMs(t) || t.e === null ? t.s : t.e;
                if (ende >= statusMs)
                    return;
                ueber.set(t.key, at ? Math.max(1, kal.differenz(ende, statusMs)) : Math.round((statusMs - ende) / DAY));
            });
        this.ana = { kal, statusMs, links, krit, puffer, ueber, kritQuelle, pufferQuelle, ueberBestimmbar, unaufgeloest, nrGebunden, zyklen: this.zyklen };
        this.anaTasks = this.tasks;
        this.anaSig = sig;
        return this.ana;
    }
    // Gesamtpuffer je Vorgang in Arbeitstagen per Rückwärtsrechnung über die
    // IST-Termine und die Anordnungsbeziehungen. Nur der Rückfall, wenn der Export
    // weder "Kritisch" noch "Gesamte Pufferzeit" liefert: MS Projects eigene Werte
    // kennen Uhrzeiten, Ressourcenkalender und Einschränkungen, die hier fehlen.
    // Konvention ohne Uhrzeiten: ein Vorgang endet am Ende seines letzten Tages,
    // ein Meilenstein liegt am Ende seines Tages; ein EA-Nachfolger, der selbst
    // ein Vorgang ist, beginnt frühestens am nächsten Arbeitstag.
    netzplan(tasks, links, kal) {
        const ref0 = tasks.reduce((a, t) => Math.min(a, t.s), Infinity) - 14 * DAY;
        const ord = (ms) => kal.zwischen(ref0, ms);
        const ES = new Map();
        const EF = new Map();
        const ms = (t) => this.isMs(t) || t.e === null;
        tasks.forEach(t => {
            if (ms(t)) {
                const v = ord(t.s);
                ES.set(t.key, v);
                EF.set(t.key, v);
                return;
            }
            const es = ord(t.s - DAY) + 1;
            ES.set(t.key, es);
            EF.set(t.key, Math.max(es, ord(t.e)));
        });
        const byKey = new Map(tasks.map(t => [t.key, t]));
        const nach = new Map();
        links.forEach((ls, uKey) => {
            const u = byKey.get(uKey);
            if (!u)
                return;
            ls.forEach(l => {
                const a = nach.get(l.src.key);
                if (a)
                    a.push({ u, l });
                else
                    nach.set(l.src.key, [{ u, l }]);
            });
        });
        // Projektende je Projekt: Vorgänge ohne Nachfolger dürfen bis dorthin rutschen
        const ende = new Map();
        tasks.forEach(t => {
            const p = GanttRenderer.pk(t);
            ende.set(p, Math.max(ende.has(p) ? ende.get(p) : -Infinity, EF.get(t.key)));
        });
        // Nachfolger vor Vorgängern: iterative Tiefensuche, Post-Order. Iterativ,
        // weil lange Ketten (30.000 Zeilen) den Aufrufstapel sprengen würden;
        // Zyklen in fehlerhaften Plänen werden übersprungen statt endlos zu laufen.
        const zustand = new Map();
        const reihe = [];
        tasks.forEach(st => {
            if (zustand.has(st.key))
                return;
            zustand.set(st.key, 1);
            const stack = [{ t: st, i: 0 }];
            while (stack.length) {
                const top = stack[stack.length - 1];
                const ns = nach.get(top.t.key) || [];
                if (top.i < ns.length) {
                    const nu = ns[top.i++].u;
                    if (!zustand.has(nu.key)) {
                        zustand.set(nu.key, 1);
                        stack.push({ t: nu, i: 0 });
                    }
                    else if (zustand.get(nu.key) === 1)
                        this.zyklen++; // Rückkante = Kreis
                }
                else {
                    zustand.set(top.t.key, 2);
                    reihe.push(top.t);
                    stack.pop();
                }
            }
        });
        const hatStichtag = tasks.some(t => t.stichtag !== undefined && t.stichtag !== null);
        const LF = new Map();
        reihe.forEach(t => {
            let lf = ende.get(GanttRenderer.pk(t));
            if (t.stichtag !== undefined && t.stichtag !== null)
                lf = Math.min(lf, ord(t.stichtag));
            const dauer = EF.get(t.key) - ES.get(t.key);
            (nach.get(t.key) || []).forEach(({ u, l }) => {
                const lfU = LF.get(u.key);
                if (lfU === undefined)
                    return; // Zyklus
                const lsU = lfU - (EF.get(u.key) - ES.get(u.key));
                const lag = l.lagProzent !== undefined ? Math.round((dauer + (ms(t) ? 0 : 1)) * l.lagProzent / 100) : l.lag;
                const versatz = ms(u) ? 0 : 1;
                const c = l.typ === 'EA' ? lsU - versatz - lag
                    : l.typ === 'AA' ? lsU - lag + dauer
                        : l.typ === 'EE' ? lfU - lag
                            : lfU - lag + dauer; // AE
                lf = Math.min(lf, Math.round(c));
            });
            LF.set(t.key, lf);
        });
        const out = new Map();
        tasks.forEach(t => {
            const lf = LF.get(t.key);
            if (lf === undefined)
                return;
            const tf = lf - EF.get(t.key);
            // Ohne Stichtage kann berechneter Puffer nicht negativ sein; −1 entsteht
            // dann nur aus der Tagesrundung (Nachfolger am selben Tag) → 0
            out.set(t.key, hatStichtag ? tf : Math.max(0, tf));
        });
        return out;
    }
    // Gruppenpfad einer Zeile: optionale Projektebene, danach die Ebenen-Felder
    // der Rolle "phase" in Feldbrunnen-Reihenfolge. Leere Stufen werden verdichtet
    // (§ "ungleich tiefe Zweige") — sonst entstünden namenlose Zwischengruppen und
    // eine Zeile, die auf Ebene 2 endet, bekäme leere Hüllen bis Ebene 5.
    //
    // Ohne Ebenen-Felder, aber mit PSP-Code entsteht der Pfad aus dem Code:
    // "2.1.3" hängt unter den Vorgängen "2" und "2.1" — so wie in MS Project, ganz
    // ohne vorbereitete Ebenen-Spalten im Modell. Ein Vorgang, unter dem weitere
    // liegen, ist ein Sammelvorgang und bekommt seine eigene Gruppe. id trennt
    // gleichnamige Geschwister, die sich nur im PSP-Code unterscheiden.
    groupPath(t) {
        const segs = [];
        if (this.hasProj && t.projekt !== undefined && t.projekt !== null && t.projekt !== '') {
            segs.push({ name: t.projekt, proj: true });
        }
        const lv = t.path && t.path.length ? t.path : (t.phase !== null ? [t.phase] : []);
        if (lv.length || !this.pspModus || !t.psp) {
            lv.forEach(v => {
                if (v === null || v === undefined)
                    return;
                const n = String(v).trim();
                if (n !== '')
                    segs.push({ name: n, proj: false });
            });
            return segs;
        }
        const pk = GanttRenderer.pk(t);
        const teile = t.psp.split('.').filter(x => x !== '');
        for (let i = 1; i < teile.length; i++) {
            const code = teile.slice(0, i).join('.');
            segs.push({ name: this.pspName.get(pk + code) || code, proj: false, id: 'psp:' + code });
        }
        const eigen = teile.join('.');
        if (this.pspKinder.has(pk + eigen))
            segs.push({ name: t.name, proj: false, id: 'psp:' + eigen });
        return segs;
    }
    // Balkenfarbe: 'feld' und 'kritisch' brauchen Daten — sonst bleibt es beim Zweig
    farbModus() {
        const f = this.opts && this.opts.farbeNach;
        if (f === 'status')
            return 'status';
        if (f === 'kritisch')
            return this.analyse().kritQuelle ? 'kritisch' : 'zweig';
        if (f === 'feld')
            return this.tasks.some(t => !!t.farbeWert) ? 'feld' : 'zweig';
        return 'zweig';
    }
    buildItems(dark, ibcs) {
        const o = this.opts;
        const pal = dark ? PHASE_HEX_DARK : PHASE_HEX_LIGHT;
        const msOn = !o || o.msAufPhase !== false;
        // 2.3.1: Projektzeilen in einer eigenen Akzentfarbe (Indigo, nicht in der
        // Zweig-Palette) statt Grau — ein grauer Summenbalken las sich wie der
        // Basisplan, besonders im Portfolio ohne Basisplan
        const projColor = ibcs ? IBCS_AC : (dark ? PROJ_DARK : PROJ_LIGHT);
        this.hasProj = this.tasks.some(t => t.projekt !== undefined && t.projekt !== null);
        const ana = this.analyse();
        const at = !!(o && o.arbeitstage);
        const neutral = dark ? NEUTRAL_DARK : NEUTRAL_LIGHT;
        const kritFarbe = dark ? KRIT_DARK : KRIT_LIGHT;
        this.nodeTiefe = new Map();
        this.maxTiefe = -1;
        this.vorfahren = new Map();
        // ---- Balkenfarbe nach Status / kritisch / Feld (Zweig = Vorgabe)
        const farbModus = this.farbModus();
        const feldWerte = [];
        if (farbModus === 'feld')
            this.tasks.forEach(t => { if (t.farbeWert && !feldWerte.includes(t.farbeWert))
                feldWerte.push(t.farbeWert); });
        const sonderFarbe = (c) => {
            if (farbModus === 'status')
                return statusHex(c.st, dark);
            if (farbModus === 'kritisch')
                return ana.krit.get(c.key) ? kritFarbe : neutral;
            if (farbModus === 'feld')
                return c.farbeWert ? pal[feldWerte.indexOf(c.farbeWert) % pal.length] : neutral;
            return null;
        };
        this.legende = [];
        if (!ibcs && farbModus === 'status') {
            const da = new Set(this.tasks.map(t => t.st ? statusKind(t.st) : 'open'));
            [['done', 'Fertig'], ['progress', 'In Arbeit'], ['blocked', 'Blockiert'], ['open', 'Offen']]
                .filter(([k]) => da.has(k))
                .forEach(([k, l]) => this.legende.push({ label: l, farbe: statusHex(k === 'open' ? null : STATUS_BEISPIEL[k], dark) }));
        }
        else if (!ibcs && farbModus === 'kritisch') {
            this.legende = [{ label: 'Kritisch', farbe: kritFarbe }, { label: 'Nicht kritisch', farbe: neutral }];
        }
        else if (!ibcs && farbModus === 'feld') {
            this.legende = feldWerte.map((v, i) => ({ label: v, farbe: pal[i % pal.length] }));
        }
        // Abweichung zum Basisplan in Kalender- oder Arbeitstagen (+ = Verzug)
        const deltaVon = (pe, ende) => pe === null ? null : (at ? ana.kal.differenz(pe, ende) : Math.round((ende - pe) / DAY));
        const items = [];
        let colorIdx = 0;
        const emitLeaf = (c, depth, hex, parentCk) => {
            const zweig = hex !== null ? hex : pal[colorIdx % pal.length];
            const base = sonderFarbe(c) || zweig;
            // IBCS: monochrom (solid dark = Ist, outlined = Plan); individuelle
            // Task-Farben werden im IBCS-Modus bewusst ignoriert.
            const tColor = !ibcs && c.color ? c.color : (ibcs ? IBCS_AC : base);
            const tSoft = !ibcs && c.color ? hexA(c.color, 0.18) : (ibcs ? '#FFFFFF' : hexA(base, 0.18));
            const plan = GanttRenderer.planOf(c);
            const ende = c.e === null ? c.s : c.e;
            items.push({
                id: c.key, kind: this.isMs(c) ? 'ms' : 'task',
                depth, name: c.name,
                s: c.s, e: ende, pct: c.pct, st: c.st, ow: c.ow,
                color: tColor, soft: tSoft,
                // die Spur behält die Zweigfarbe, auch wenn der Balken nach Status gefärbt ist
                laneTint: ibcs ? 'transparent' : hexA(zweig, 0.06),
                phaseKey: parentCk, task: c,
                links: ana.links.get(c.key) || [],
                psp: c.psp !== undefined && c.psp !== null ? c.psp : null,
                krit: ana.krit.get(c.key) === true,
                puffer: ana.puffer.has(c.key) ? ana.puffer.get(c.key) : null,
                ueber: ana.ueber.has(c.key) ? ana.ueber.get(c.key) : null,
                stichtag: c.stichtag !== undefined && c.stichtag !== null ? c.stichtag : null,
                ps: plan.ps, pe: plan.pe, delta: deltaVon(plan.pe, ende), msKids: []
            });
        };
        // ---- Hauptmeilenstein-Ansicht: FLACHE Liste statt Hierarchie. Projekt-
        // und Ebenenzeilen entfallen, damit die Meilensteine als reine Terminliste
        // lesbar sind; chronologisch, bei gleichem Datum in Datenreihenfolge.
        // Die Farbe folgt weiter dem Zweig (phase), damit die Herkunft erkennbar
        // bleibt — ohne die Gruppenzeilen gäbe es sonst gar keinen Hinweis darauf.
        if (this.ansicht === 'haupt') {
            this.projKeys = [];
            this.phaseKeys = [];
            this.sammelN = 0;
            const zweige = [];
            this.tasks.forEach(t => { if (!zweige.includes(t.phase))
                zweige.push(t.phase); });
            const farbe = (t) => pal[Math.max(0, zweige.indexOf(t.phase)) % pal.length];
            // EINE Zeile je Meilensteinname. In Portfolio-Daten kommt derselbe
            // Hauptmeilenstein mehrfach vor — je Projekt, je Berichtsstand oder
            // als Kopie auf mehreren Ebenen. Ohne die Projekt- und Ebenenzeilen
            // stünde er sonst n-mal untereinander, ohne erkennbaren Unterschied.
            // Jedes Vorkommen wird eine eigene Raute auf der Zeile; völlig
            // identische (gleiches Projekt, gleiches Datum) fallen zusammen.
            const gruppen = new Map();
            const reihe = [];
            this.tasks
                .map((t, i) => ({ t, i }))
                .filter(x => x.t.haupt === true)
                .sort((a, b) => a.t.s !== b.t.s ? a.t.s - b.t.s : a.i - b.i)
                .forEach(({ t }) => {
                let g = gruppen.get(t.name);
                if (!g) {
                    g = [];
                    gruppen.set(t.name, g);
                    reihe.push(t.name);
                }
                const pr = t.projekt !== undefined ? t.projekt : null;
                if (!g.some(x => x.s === t.s && (x.projekt !== undefined ? x.projekt : null) === pr))
                    g.push(t);
            });
            this.gezeigtN = reihe.length;
            reihe.forEach(name => {
                const inst = gruppen.get(name);
                if (inst.length === 1) {
                    emitLeaf(inst[0], 0, farbe(inst[0]), '');
                    return;
                }
                const base = farbe(inst[0]);
                items.push({
                    id: 'hm:' + name, kind: 'ms', depth: 0, name,
                    // chronologisch sortiert: erstes und letztes Vorkommen spannen die Zeile
                    s: inst[0].s, e: inst[inst.length - 1].s,
                    pct: null, st: null, ow: '',
                    color: ibcs ? IBCS_AC : base,
                    soft: ibcs ? '#FFFFFF' : hexA(base, 0.18),
                    laneTint: ibcs ? 'transparent' : hexA(base, 0.06),
                    phaseKey: '', task: inst[0], links: [],
                    psp: null, krit: false, puffer: null, ueber: null, stichtag: null,
                    ps: null, pe: null, delta: null,
                    msKids: inst
                });
            });
            this.hasPlan = this.tasks.some(c => (c.ps !== undefined && c.ps !== null) || (c.pe !== undefined && c.pe !== null));
            return items;
        }
        // ---- PSP-Modus: Namen und Sammelvorgänge je Projekt aus den Codes
        const pk = GanttRenderer.pk;
        this.pspModus = this.ebenenFelder === 0 && this.tasks.some(t => !!t.psp);
        this.pspName = new Map();
        this.pspKinder = new Set();
        if (this.pspModus) {
            this.tasks.forEach(t => {
                if (!t.psp)
                    return;
                const k = pk(t) + t.psp;
                if (!this.pspName.has(k))
                    this.pspName.set(k, t.name);
                const teile = t.psp.split('.').filter(x => x !== '');
                for (let i = 1; i < teile.length; i++)
                    this.pspKinder.add(pk(t) + teile.slice(0, i).join('.'));
            });
        }
        // ---- Baum aufbauen; Reihenfolge = Erstauftritt und damit die der Rolle
        // "sort" (bzw. Nr./PSP), nach der parseData() bereits sortiert hat.
        const mk = (name, ck, proj, tiefe) => ({ name, ck, tiefe, isProj: proj, children: [], idx: new Map(), all: [] });
        const root = mk('', '', false, -1);
        const projNodes = [];
        const grpNodes = [];
        const segId = (x) => x.id || x.name;
        // Sammelvorgänge: MS-Project-Exporte liefern für jeden Knoten ZUSÄTZLICH
        // eine eigene Zeile, deren letzte Ebene den eigenen Namen trägt. Sie würde
        // als namensgleiche Zeile unter ihrer eigenen Gruppe erscheinen. Erkennbar
        // daran, dass unter demselben Pfad noch weitere Zeilen liegen — ein echter
        // Einzelvorgang, der zufällig wie seine Gruppe heißt, bleibt damit erhalten.
        // Ihre Termine fließen in den Gruppenbalken ein (s. emit).
        // Gezählt wird je PFAD-PRÄFIX, nicht je vollem Pfad: ein Sammelvorgang,
        // dessen Kinder ausschließlich weitere Sammelvorgänge sind (PSP 1 → 1.1,
        // 1.2 …), hat sonst keinen einzigen Vorgang mit GLEICHEM Pfad und stünde
        // doppelt da — als Gruppe und als namensgleiche Zeile darin.
        const pfade = this.tasks.map(t => this.groupPath(t));
        const unterPfad = new Map();
        pfade.forEach(segs => {
            let k = '';
            for (let d = 0; d < segs.length; d++) {
                k = d ? k + '¦' + segId(segs[d]) : segId(segs[d]);
                unterPfad.set(k, (unterPfad.get(k) || 0) + 1);
            }
        });
        const istSammel = (t, segs) => segs.length > 0
            && !segs[segs.length - 1].proj
            && segs[segs.length - 1].name === t.name
            && (unterPfad.get(segs.map(segId).join('¦')) || 0) > 1;
        this.levelCount = this.pspModus
            ? pfade.reduce((mx, sg) => Math.max(mx, sg.filter(x => !x.proj).length), 0)
            : this.ebenenFelder;
        // Ansichten "kritisch", "überfällig" und "Nur Meilensteine" filtern die
        // Vorgänge, behalten aber die Hierarchie: eine Gruppe erscheint, sobald
        // sie einen Treffer enthält. „◆ Meilensteine“ aus nimmt die Meilensteine
        // zusätzlich heraus (eine Gruppe NUR aus Meilensteinen entfällt dann).
        const ohneMs = this.ohneMs();
        const filter = this.ansicht === 'kritisch' ? (t => ana.krit.get(t.key) === true)
            : this.ansicht === 'ueberfaellig' ? (t => ana.ueber.has(t.key))
                : this.ansicht === 'meilensteine' ? (t => this.isMs(t)) : null;
        const zeigen = !ohneMs ? filter
            : (t => !this.isMs(t) && (!filter || filter(t)));
        this.sammelN = 0;
        this.gezeigtN = 0;
        const sammelZeile = new Map(); // Collapse-Schlüssel → Sammelvorgangs-Datenzeile
        this.tasks.forEach((t, ti) => {
            const segs = pfade[ti];
            if (istSammel(t, segs)) {
                this.sammelN++;
                // gleicher Schlüssel wie der Gruppenknoten (letzte Stufe ist nie Projekt)
                sammelZeile.set(segs.map(segId).join('¦'), t);
                return;
            }
            if (zeigen && !zeigen(t))
                return;
            this.gezeigtN++;
            let n = root;
            const vf = [];
            for (let d = 0; d < segs.length; d++) {
                const seg = segs[d];
                // Projekt- und Ebenenknoten getrennt indizieren, damit ein Projekt
                // und eine Phase gleichen Namens nicht zusammenfallen
                const ik = (seg.proj ? 'P\u0000' : 'G\u0000') + segId(seg);
                let pos = n.idx.get(ik);
                if (pos === undefined) {
                    const ck = (seg.proj ? 'P:' : '') + segs.slice(0, d + 1).map(segId).join('¦');
                    const node = mk(seg.name, ck, seg.proj, d);
                    pos = n.children.length;
                    n.idx.set(ik, pos);
                    n.children.push({ node, task: null });
                    (seg.proj ? projNodes : grpNodes).push(node);
                    this.nodeTiefe.set(ck, d);
                    if (d > this.maxTiefe)
                        this.maxTiefe = d;
                }
                n = n.children[pos].node;
                n.all.push(t);
                vf.push(n.ck);
            }
            this.vorfahren.set(t.key, vf);
            n.children.push({ node: null, task: t });
        });
        // Gruppenbalken mit den Terminen des vollständigen Plans, wo die Ansicht
        // nur AUSBLENDET statt zu filtern: „◆ Meilensteine“ aus (Termine,
        // Fortschritt und Δ der Gruppen bleiben, wie sie sind) und „Nur
        // Meilensteine“ (die Gruppe zeigt ihren echten Zeitraum als Rahmen der
        // Meilensteine — wie „Zugehörige Sammelvorgänge anzeigen“ in MS Project).
        // Diese Vorgänge fließen nur in die Aggregate bereits vorhandener Gruppen
        // ein, ohne selbst Zeile oder Gruppe zu erzeugen. „Kritisch“ und
        // „überfällig“ zählen weiter nur, was sie zeigen.
        const nurAggregat = (t) => this.ansicht === 'meilensteine'
            ? !this.isMs(t)
            : ohneMs && this.isMs(t) && (!filter || filter(t));
        if (ohneMs || this.ansicht === 'meilensteine') {
            this.tasks.forEach((t, ti) => {
                if (!nurAggregat(t))
                    return;
                const segs = pfade[ti];
                if (istSammel(t, segs))
                    return;
                let n = root;
                for (let d = 0; d < segs.length; d++) {
                    const pos = n.idx.get((segs[d].proj ? 'P\u0000' : 'G\u0000') + segId(segs[d]));
                    if (pos === undefined)
                        return;
                    n = n.children[pos].node;
                    n.all.push(t);
                }
            });
        }
        // Gefilterte Ansichten: Gruppen und Vorgänge in der Reihenfolge des
        // vollständigen Plans. Der Baum entsteht in der Reihenfolge des ersten
        // TREFFERS — eine Phase, deren erster Meilenstein spät in den Daten
        // steht, rutschte sonst hinter ihre Nachfolger.
        if (zeigen) {
            const erster = new Map(); // Collapse-Schlüssel → erste Datenzeile darunter
            pfade.forEach((segs, ti) => {
                for (let d = 0; d < segs.length; d++) {
                    const ck = (segs[d].proj ? 'P:' : '') + segs.slice(0, d + 1).map(segId).join('¦');
                    if (!erster.has(ck))
                        erster.set(ck, ti);
                }
            });
            const zeile = new Map();
            this.tasks.forEach((t, ti) => zeile.set(t, ti));
            const rang = (ch) => ch.node ? erster.get(ch.node.ck) : zeile.get(ch.task);
            const ordnen = (n) => {
                n.children.sort((a, b) => rang(a) - rang(b));
                n.children.forEach(ch => { if (ch.node)
                    ordnen(ch.node); });
            };
            ordnen(root);
        }
        // "Alles auf/zu" und "Gliederung ▾" müssen auch zugeklappte Teilbäume
        // erreichen — deshalb ALLE Knoten sammeln, nicht nur die gerade sichtbaren.
        this.projKeys = projNodes.map(n => n.ck);
        this.phaseKeys = grpNodes.map(n => n.ck);
        // Start-Klappzustand, nur für Gruppen ohne eigenen Klappzustand:
        // 'projekte' klappt alles zu (je Projekt ein Balken), 'sammel' nur die
        // Ebenen-Gruppen — Projekte bleiben offen, sichtbar ist also je Projekt
        // die oberste Ebene der Sammelvorgänge. Wer eine davon aufklappt, sieht
        // die nächste Ebene wieder zugeklappt (Drill-down wie „Gliederung“).
        if (this.ansicht === 'projekte') {
            this.nodeTiefe.forEach((_, ck) => { if (!(ck in this.collapsed))
                this.collapsed[ck] = true; });
        }
        else if (this.ansicht === 'sammel') {
            this.phaseKeys.forEach(ck => { if (!(ck in this.collapsed))
                this.collapsed[ck] = true; });
        }
        const emit = (n, depth, hex) => {
            n.children.forEach(ch => {
                if (ch.node) {
                    const g = ch.node;
                    // Farbe fällt auf der OBERSTEN Ebenen-Stufe und wird nach unten
                    // vererbt: ein Zweig trägt durchgängig eine Farbe. Die Projekt-
                    // ebene bleibt neutral und startet die Vererbung neu.
                    const myHex = g.isProj ? null : (hex !== null ? hex : pal[(colorIdx++) % pal.length]);
                    const base = g.isProj ? projColor : myHex;
                    const zu = !!this.collapsed[g.ck];
                    const a = { ...GanttRenderer.aggOf(g.all) };
                    // Der Gruppenbalken nimmt die eigenen Termine des Sammelvorgangs
                    // mit auf, wo der Export sie liefert (MS Project: auch manuell
                    // terminierte Sammelvorgänge). Aus Meilensteinen allein entstünde
                    // bei nur einem Termin sonst gar kein sichtbarer Balken. In den
                    // gefilterten Ansichten zählt nur, was die Ansicht zeigt
                    // („Nur Meilensteine“ zeigt den vollen Gruppenzeitraum, s. o.).
                    const sz = sammelZeile.get(g.ck);
                    if (sz && (this.vollerUmfang() || this.ansicht === 'meilensteine')) {
                        a.s = Math.min(a.s, sz.s);
                        a.e = Math.max(a.e, sz.e === null ? sz.s : sz.e);
                    }
                    a.delta = deltaVon(a.pe, a.e);
                    // Sammelvorgang, der NUR Meilensteine enthält: Balken ja, Rauten
                    // auf der zugeklappten Zeile nein — sie lägen genau auf den
                    // Balkenenden; die Meilensteine erscheinen erst beim Aufklappen.
                    // In „Nur Meilensteine“ besteht jede Gruppe nur aus Meilensteinen —
                    // dort sollen zugeklappte Gruppen ihre Rauten gerade zeigen.
                    const nurMs = this.ansicht !== 'meilensteine' && !g.isProj && g.all.length > 0 && g.all.every(c => this.isMs(c));
                    items.push({
                        id: (g.isProj ? 'pr:' : 'ph:') + g.ck,
                        kind: g.isProj ? 'proj' : 'phase',
                        depth, name: g.name, s: a.s, e: a.e, pct: a.pct,
                        st: null, ow: '',
                        color: ibcs ? IBCS_AC : base,
                        soft: ibcs ? '#FFFFFF' : hexA(base, g.isProj ? 0.16 : 0.18),
                        laneTint: ibcs ? 'transparent' : hexA(base, g.isProj ? 0.05 : 0.06),
                        phaseKey: g.ck, task: null, links: [],
                        psp: sz && sz.psp ? sz.psp : null,
                        krit: false, puffer: null, ueber: null, stichtag: null,
                        ps: a.ps, pe: a.pe, delta: a.delta,
                        // Projektzeile trägt IMMER alle Meilensteine des Projekts
                        // (Portfolio-Übersicht); jede andere Gruppe zeigt sie,
                        // sobald sie zugeklappt ist — auf JEDER Tiefe.
                        msKids: msOn && !ohneMs && (g.isProj || (zu && !nurMs)) ? g.all.filter(c => this.isMs(c)) : []
                    });
                    if (zu)
                        return;
                    emit(g, depth + 1, myHex);
                }
                else {
                    emitLeaf(ch.task, depth, hex, n.ck);
                }
            });
        };
        emit(root, 0, null);
        this.hasPlan = this.tasks.some(c => (c.ps !== undefined && c.ps !== null) || (c.pe !== undefined && c.pe !== null));
        return items;
    }
    zeigePsp() {
        const o = this.opts;
        return (!o || !o.spalten || o.spalten.psp !== false) && this.tasks.some(t => !!t.psp);
    }
    visibleCols(tableW) {
        const s = this.m.s;
        const ana = this.analyse();
        const hasStatus = this.tasks.some(t => t.st !== null && t.st !== '');
        const hasPct = this.tasks.some(t => t.pct !== null);
        const hasOw = this.tasks.some(t => t.ow !== '');
        const hasPuffer = ana.puffer.size > 0;
        const hasStichtag = this.tasks.some(t => t.stichtag !== undefined && t.stichtag !== null);
        const o = this.opts;
        const sp = (k) => !o || !o.spalten || o.spalten[k] !== false;
        const showDelta = this.hasPlan && this.planSichtbar() && (!o || o.deltaSpalte !== false);
        // „Tg.“ ist breiter als „t“: Tage- und Puffer-Spalte etwas breiter (2.3.1)
        const tg = !!o && o.tageEinheit === 'Tg';
        // Spalten ohne Daten erscheinen gar nicht erst — eine leere Spalte
        // kostet Platz, den der Vorgangsname dringender braucht
        let cols = ALL_COLS
            .filter(c => sp(c.key))
            .filter(c => (c.key !== 'status' || hasStatus) && (c.key !== 'pct' || hasPct) && (c.key !== 'ow' || hasOw)
            && (c.key !== 'delta' || showDelta) && (c.key !== 'puffer' || hasPuffer) && (c.key !== 'stichtag' || hasStichtag))
            .map(c => ({ ...c, w: Math.round((c.w + (tg ? (c.key === 'days' ? 10 : c.key === 'puffer' ? 8 : 0) : 0)) * s) }));
        if (sp('zusatz') && o && o.zusatzKoepfe) {
            o.zusatzKoepfe.slice(0, 3).forEach((k, i) => cols.push({ key: 'z' + i, label: k, w: Math.round(ZUSATZ_W * s) }));
        }
        const pspW = this.zeigePsp() ? Math.round(PSP_W * s) : 0;
        for (const dropKey of DROP_ORDER) {
            const total = pspW + Math.round(MIN_TASK_COL * s) + cols.reduce((a, c) => a + c.w, 0);
            if (total <= tableW)
                break;
            cols = cols.filter(c => c.key !== dropKey);
        }
        return cols;
    }
    // skalierte Schriftgröße in px (Referenzwert aus dem 13px-Design)
    fs(n) {
        return (Math.round(n * this.m.s * 10) / 10) + 'px';
    }
    // ---------- Haupt-Render ----------
    render() {
        const o = this.opts;
        if (!o)
            return;
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
        // Metriken aus der Schriftgröße ableiten (Referenz: 13px)
        const s = Math.max(0.65, Math.min(1.8, (o.fontSize || BASE_FONT) / BASE_FONT));
        this.m = {
            s,
            rowH: Math.round(ROW_H * s),
            axisH: Math.round(AXIS_H * s),
            headerH: Math.round(HEADER_H * s),
            barH: Math.round(20 * s),
            phBarH: Math.max(5, Math.round(9 * s)),
            dia: Math.round(14 * s)
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
            this.toolbar.style.display = 'none';
            this.landing.style.display = 'flex';
            this.landing.style.color = t.sub;
            this.landing.replaceChildren();
            this.menuHost.style.display = 'none';
            // Startseite = Einrichtung: welche Felder was freischalten, und warum
            // gerade nichts zu sehen ist (z. B. alle Starttermine ungültig)
            // Pflichtfelder gebunden, aber keine Zeilen: meist ein Filter — Leser
            // sollen dann nicht zum Feldbereich geschickt werden
            const r = this.rollen();
            const gebunden = !!(r.task && r.start);
            const wrap = el('div', 'text-align:left;max-width:520px');
            wrap.appendChild(el('div', 'font-weight:700;font-size:15px;color:' + t.text + ';margin-bottom:4px', gebunden ? 'Keine Vorgänge' : 'DataKitchen Gantt'));
            wrap.appendChild(el('div', 'font-size:12.5px;margin-bottom:12px', gebunden
                ? 'Für die aktuelle Filterauswahl gibt es keine Vorgänge mit gültigem Start.'
                : 'Felder in den Feldbereich ziehen — für einen MS-Project-Plan reichen Task, Start, Ende, PSP-Code, Nr. und Vorgänger.'));
            if (!gebunden || this.einrichtungSichtbar())
                wrap.appendChild(this.checklistenKnoten(t));
            if (this.pruefPunkte().length) {
                wrap.appendChild(el('div', 'font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;margin:14px 0 7px', 'Warum nichts zu sehen ist'));
                wrap.appendChild(this.pruefKnoten(t));
            }
            this.landing.appendChild(wrap);
            return;
        }
        this.panel.parentElement && (this.panel.parentElement.style.display = 'flex');
        this.toolbar.style.display = 'flex';
        this.landing.style.display = 'none';
        // Ansicht: der Optionswert ist nur die Startstellung — "Ansicht ▾" in der
        // Leiste gewinnt, bis die Option selbst wechselt (Muster wie tabellenBreite).
        // nurHaupt ist der Vorgänger aus 1.16–1.18 und wird weiter respektiert.
        const optAnsicht = o.startAnsicht && o.startAnsicht !== 'alle' ? o.startAnsicht : (o.nurHaupt === true ? 'haupt' : 'alle');
        if (this.lastOptAnsicht !== optAnsicht) {
            this.lastOptAnsicht = optAnsicht;
            this.wechsleAnsicht(optAnsicht);
        }
        // Leser-Knopf „▭ Basisplan“: wechselt der Formatbereich, gilt wieder er
        const optPlan = o.basisplan !== false;
        if (this.lastOptPlan !== optPlan) {
            this.lastOptPlan = optPlan;
            this.planAus = false;
        }
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
        // Wechselt die Standard-Zeiteinheit im Formatbereich (oder per Vorlage),
        // soll man das sofort sehen — nicht erst nach dem nächsten Laden
        const ze = o.zeiteinheit || 'auto';
        if (this.lastOptZE !== ze) {
            if (this.lastOptZE !== null)
                this.fitted = false;
            this.lastOptZE = ze;
        }
        if (!this.fitted && this.chartArea.clientWidth > 0) {
            // Layout ist nach dem Anhängen synchron messbar → direkt einpassen
            this.fitted = true;
            this.computeFit();
        }
        // collapsed wird an vielen Stellen direkt gesetzt — deshalb fließt sein
        // Inhalt selbst in die Signatur ein statt eines Versionszählers
        const zuSig = Object.keys(this.collapsed).filter(k => this.collapsed[k]).join('\u0001');
        const sigKopf = this.datenVersion + '|' + this.optVersion + '|' + this.ansicht + '|' + this.ohneMs() + '|' + dark + '|' + o.ibcs + '|';
        const sig = sigKopf + zuSig;
        if (!this.itemsCache || sig !== this.itemsSig) {
            this.itemsCache = this.buildItems(dark, o.ibcs);
            // buildItems() klappt in 'sammel'/'projekte' neue Gruppen zu → Signatur danach bilden
            const zuSig2 = Object.keys(this.collapsed).filter(k => this.collapsed[k]).join('\u0001');
            this.itemsSig = sigKopf + zuSig2;
        }
        const items = this.itemsCache;
        this.lastItems = items;
        const topOf = {};
        items.forEach((it, i) => topOf[it.id] = i * this.m.rowH);
        const chH = Math.max(50, this.bodyClip.clientHeight);
        // Sprung aus Suche/"Auswahl": Zielzeile ins obere Drittel holen und, falls
        // sie horizontal außerhalb liegt, die Zeitachse dorthin schieben
        if (this.springZiel) {
            const z = this.springZiel;
            this.springZiel = null;
            const idx = items.findIndex(i => (i.task !== null && i.task.key === z) || i.msKids.some(k => k.key === z));
            if (idx >= 0) {
                this.sy = Math.max(0, idx * this.m.rowH - Math.round(chH / 3));
                const cwi = this.chartArea.clientWidth;
                const xs = (items[idx].s - this.view) / DAY * this.pxd;
                if (xs < 20 || xs > cwi - 60)
                    this.view = items[idx].s - (cwi / 3) / this.pxd * DAY;
                this.hover = items[idx].id;
            }
        }
        this.maxSy = Math.max(0, items.length * this.m.rowH - chH);
        const sy = Math.min(this.sy, this.maxSy);
        this.sy = sy;
        const cw = Math.max(50, this.chartArea.clientWidth);
        const x = (ms) => (ms - this.view) / DAY * this.pxd;
        const sel = o.selectedKeys && o.selectedKeys.size ? o.selectedKeys : null;
        const nMs = this.tasks.filter(tk => this.isMs(tk)).length;
        const nPh = this.phaseKeys.length; // Gruppen über ALLE Ebenen
        const nPr = new Set(this.tasks.map(tk => tk.projekt).filter(p => p !== undefined && p !== null)).size;
        // Sammelvorgangs-Zeilen sind keine eigenen Vorgänge — sie werden als
        // Gruppenzeile gerendert und dürfen den Zähler nicht aufblähen.
        const nVg = this.tasks.length - nMs - this.sammelN;
        const pl = (n, ein, viele) => n + ' ' + (n === 1 ? ein : viele);
        const ana = this.analyse();
        this.toolbarInfo.style.color = t.sub;
        // Nur der Text verschwindet — die Leiste selbst (und damit ihre Knöpfe)
        // bleibt stehen, deshalb hier kein display-Schalten am parentElement.
        this.toolbarInfo.replaceChildren();
        if (o.kopfzeile !== false) {
            // In den gefilterten Ansichten würden die vollen Zähler einen Umfang
            // behaupten, den das Visual gerade nicht zeigt.
            const txt = this.ansicht === 'haupt'
                ? pl(items.length, 'Hauptmeilenstein', 'Hauptmeilensteine') + (() => {
                    const n = items.reduce((a, i) => a + Math.max(1, i.msKids.length), 0);
                    return n > items.length ? ' · ' + pl(n, 'Termin', 'Termine') : '';
                })()
                : this.ansicht === 'meilensteine' ? pl(this.gezeigtN, 'Meilenstein', 'Meilensteine')
                    : this.ansicht === 'kritisch' ? pl(this.gezeigtN, 'kritischer Vorgang', 'kritische Vorgänge')
                        : this.ansicht === 'ueberfaellig' ? pl(this.gezeigtN, 'überfälliger Vorgang', 'überfällige Vorgänge') + ' zum ' + fmtDate(ana.statusMs)
                            : (nPr ? pl(nPr, this.text('projekt1', 'Projekt'), this.text('projektN', 'Projekte')) + ' · ' : '') +
                                pl(nVg, 'Vorgang', 'Vorgänge') +
                                (nPh ? ' · ' + (this.levelCount > 1
                                    ? pl(nPh, this.text('ebene1', 'Gruppe'), this.text('ebeneN', 'Gruppen'))
                                    : pl(nPh, this.text('ebene1', 'Phase'), this.text('ebeneN', 'Phasen'))) : '') +
                                (nMs ? ' · ' + (this.ohneMs() ? 'Meilensteine ausgeblendet' : pl(nMs, 'Meilenstein', 'Meilensteine')) : '');
            this.toolbarInfo.appendChild(document.createTextNode(txt));
            // MS-Project-Vorgänger sind Nummern. Ohne gebundene Rolle "Nr." laufen
            // sie ins Leere — das soll nicht still passieren.
            if (ana.unaufgeloest > 0)
                this.toolbarInfo.appendChild(el('span', 'margin-left:6px;color:' + t.today, ana.nrGebunden ? '· ' + ana.unaufgeloest + ' Vorgänger nicht gefunden' : '· Vorgänger als Nr. erkannt — Rolle „Nr.“ binden'));
        }
        // Ansicht gefiltert, aber der (von Power BI bereits gefilterte) DataView
        // enthält nichts Passendes: eine leere Fläche wäre von "kaputt" nicht zu
        // unterscheiden. "Ansicht ▾" bleibt bedienbar (s. renderToolbar).
        const leer = (!this.vollerUmfang() || this.ohneMs()) && !items.length;
        this.leerHinweis.style.display = leer ? 'block' : 'none';
        this.leerHinweis.style.color = t.sub;
        if (leer)
            this.leerHinweis.textContent = this.ansicht === 'haupt' ? 'Keine Hauptmeilensteine im aktuellen Filter'
                : this.ansicht === 'meilensteine' ? 'Keine Meilensteine im aktuellen Filter'
                    : this.ansicht === 'kritisch' ? 'Keine kritischen Vorgänge im aktuellen Filter'
                        : this.ansicht === 'ueberfaellig' ? 'Keine überfälligen Vorgänge zum ' + fmtDate(ana.statusMs)
                            : 'Nur Meilensteine im aktuellen Filter — „◆ Meilensteine“ blendet sie wieder ein';
        // Suche: Feld bleibt stehen (Fokus!), nur Farben und Trefferzähler folgen
        const treffer = this.suchTreffer();
        this.suchSet = new Set(treffer.map(tk => tk.key));
        this.suchFeld.style.border = '1px solid ' + t.border;
        this.suchFeld.style.background = t.panel;
        this.suchFeld.style.color = t.text;
        this.suchInfo.style.color = this.suche && !treffer.length ? t.today : t.sub;
        this.suchInfo.textContent = !this.suche ? ''
            : !treffer.length ? 'kein Treffer'
                : (this.suchIdx >= 0 ? (this.suchIdx + 1) + '/' : '') + treffer.length + (this.suchIdx < 0 ? ' Treffer · Enter' : '');
        this.renderToolbar(t);
        this.renderMenu(t);
        this.renderTable(t, items, topOf, sy, tableW, sel, o.ibcs);
        this.renderChart(t, items, topOf, sy, cw, chH, x, o, sel);
        this.renderTip(t, items, o.ibcs);
        this.updateScrollbar(t, chH);
    }
    updateScrollbar(t, chH) {
        const show = this.maxSy > 0;
        this.vTrack.style.display = show ? 'block' : 'none';
        if (!show) {
            this.sbGeom = null;
            return;
        }
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
    // Knopf im Stil der Leiste; aktiv = gefüllt (wie die Zeiteinheiten-Knöpfe)
    mkToolBtn(t, label, titel, fn, wide, active) {
        const b = el('div', (wide ? 'padding:6px 13px;' : 'width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:15px;') +
            'border:1px solid ' + t.border + ';border-radius:8px;' +
            'background:' + (active ? t.text : t.panel) + ';color:' + (active ? t.panel : t.sub) + ';' +
            'cursor:pointer;font-weight:' + (wide ? '600;font-size:12px' : '700'), label);
        if (titel)
            b.setAttribute('title', titel);
        // mousedown statt click: die Leiste wird bei jedem Render neu gebaut —
        // fällt ein Render zwischen Drücken und Loslassen, käme click nie an
        // (derselbe Fehler, der früher das Zuklappen der Zeilen verschluckt hat)
        b.addEventListener('mousedown', (e) => {
            if (e.button !== 0)
                return;
            e.preventDefault();
            fn();
        });
        return b;
    }
    renderToolbar(t) {
        const o = this.opts;
        const sel = o && o.selectedKeys && o.selectedKeys.size ? o.selectedKeys : null;
        // ---- links: Gliederung. projKeys/phaseKeys enthalten sämtliche Knoten
        // jeder Tiefe, auch die in zugeklappten Teilbäumen.
        this.toolbarAlle.replaceChildren();
        // Einrichtungshilfe: nur für Ersteller (Bearbeitungsmodus) — Leser sehen
        // sie nie. Gestrichelt, damit sie nicht wie ein Teil des Berichts wirkt.
        if (this.einrichtungSichtbar()) {
            const warn = this.pruefPunkte().filter(p => p.stufe === 'warn').length;
            const b = this.mkToolBtn(t, '✎ Einrichtung', 'Felder, Datenprüfung und Vorlagen — nur im Bearbeitungsmodus sichtbar', () => this.oeffneMenu('einrichtung', b), true, !!this.menu && this.menu.art === 'einrichtung');
            b.style.borderStyle = 'dashed';
            b.style.whiteSpace = 'nowrap';
            b.style.position = 'relative';
            b.setAttribute('data-menu', '1');
            if (warn)
                b.appendChild(el('span', 'position:absolute;top:-6px;right:-6px;min-width:16px;height:16px;border-radius:8px;padding:0 4px;box-sizing:border-box;' +
                    'background:' + KRIT_LIGHT + ';color:#fff;font-size:10px;font-weight:700;line-height:16px;text-align:center', String(warn)));
            this.toolbarAlle.appendChild(b);
        }
        if (this.projKeys.length || this.phaseKeys.length) {
            const alleKeys = this.projKeys.concat(this.phaseKeys);
            const setzen = (zu) => {
                alleKeys.forEach(k => this.collapsed[k] = zu);
                this.invalidate();
            };
            this.toolbarAlle.appendChild(this.mkToolBtn(t, '⊞', 'Alles aufklappen', () => setzen(false), false));
            this.toolbarAlle.appendChild(this.mkToolBtn(t, '⊟', 'Alles zuklappen', () => setzen(true), false));
            // "Gliederung bis Ebene n" wie in MS Project — erst ab zwei Stufen sinnvoll
            if (this.maxTiefe >= 1) {
                const b = this.mkToolBtn(t, 'Ebene ▾', 'Gliederung bis Ebene … anzeigen', () => this.oeffneMenu('gliederung', b), true, !!this.menu && this.menu.art === 'gliederung');
                b.setAttribute('data-menu', '1');
                this.toolbarAlle.appendChild(b);
            }
        }
        // ---- Legende: zuerst Aktuell/Basisplan (2.2, sobald Basisplan-Daten da
        // sind), danach die Balkenfarbe (nur, wenn nicht nach Zweig gefärbt wird)
        this.legendeHost.replaceChildren();
        if (o && this.planSichtbar() && o.basisplanLegende !== false && this.hasPlan) {
            const ibcs = !!o.ibcs;
            const aktFarbe = ibcs ? IBCS_AC : (t.panel === '#1E2023' ? PHASE_HEX_DARK[0] : PHASE_HEX_LIGHT[0]);
            const eintrag = (label, sw, titel) => {
                const e = el('div', 'display:flex;align-items:center;gap:5px;font-size:11px;white-space:nowrap;color:' + t.sub);
                e.setAttribute('title', titel);
                e.appendChild(sw);
                e.appendChild(el('span', '', label));
                this.legendeHost.appendChild(e);
            };
            // Balkenförmige Muster (breiter als hoch), damit sie sich von den
            // quadratischen Farbfeldern der Balkenfarbe abheben
            eintrag('Aktuell', el('div', 'width:16px;height:8px;border-radius:' + (ibcs ? '0' : '2px') + ';flex-shrink:0;background:' + aktFarbe), 'Farbiger Balken = aktueller Terminplan (Start/Ende)');
            eintrag('Basisplan', el('div', 'width:16px;height:5px;border-radius:' + (ibcs ? '0' : '2px') + ';flex-shrink:0;background:' + planFarbe(t, ibcs)), 'Grauer Balken darunter = Basisplan (Plan-Start/Plan-Ende)');
            if (o.legende !== false && this.legende.length)
                this.legendeHost.appendChild(el('div', 'width:1px;height:12px;flex-shrink:0;background:' + t.border));
        }
        if ((!o || o.legende !== false) && this.legende.length) {
            const max = 6;
            this.legende.slice(0, max).forEach(l => {
                const e = el('div', 'display:flex;align-items:center;gap:5px;font-size:11px;white-space:nowrap;color:' + t.sub);
                e.appendChild(el('div', 'width:9px;height:9px;border-radius:2px;flex-shrink:0;background:' + l.farbe));
                e.appendChild(el('span', '', l.label));
                this.legendeHost.appendChild(e);
            });
            if (this.legende.length > max)
                this.legendeHost.appendChild(el('span', 'font-size:11px;color:' + t.sub, '+' + (this.legende.length - max)));
        }
        // ---- rechts: Zeitachse, Navigation, Ansicht
        this.toolbarBtns.replaceChildren();
        const seg = el('div', 'display:flex;border:1px solid ' + t.border + ';border-radius:8px;overflow:hidden;background:' + t.panel);
        const alle = ['Tage', 'Wochen', 'Monate', 'Quartale', 'Jahre'];
        const ze = o && o.zeiteinheiten;
        let stufen = ze ? alle.filter(m => ze[m.toLowerCase()] !== false) : alle;
        // Sind ALLE abgewählt, bliebe eine leere Leiste zurück — eine Sackgasse,
        // aus der im Bericht (ohne Formatbereich) niemand mehr herausfindet.
        // Darum in diesem Fall bewusst wieder alle fünf zeigen.
        if (!stufen.length)
            stufen = alle;
        stufen.forEach((m, i) => {
            const active = this.mode === m;
            const b = el('div', 'padding:6px 13px;cursor:pointer;font-size:12px;font-weight:600;' +
                'background:' + (active ? t.text : 'transparent') + ';color:' + (active ? t.panel : t.sub) + ';' +
                'border-left:' + (i ? '1px solid ' + t.border : 'none'), m);
            b.addEventListener('mousedown', (e) => { if (e.button !== 0)
                return; e.preventDefault(); this.setMode(m); });
            seg.appendChild(b);
        });
        this.toolbarBtns.appendChild(seg);
        const mkBtn = (label, titel, fn, wide, active) => {
            const b = this.mkToolBtn(t, label, titel, fn, wide, active);
            this.toolbarBtns.appendChild(b);
            return b;
        };
        mkBtn('−', 'Herauszoomen', () => this.zoomBy(1 / 1.35), false);
        mkBtn('+', 'Hineinzoomen', () => this.zoomBy(1.35), false);
        mkBtn('Heute', 'Zum Statusdatum bzw. heute', () => this.goToday(), true);
        mkBtn('Alles', 'Ganzen Plan einpassen', () => this.fitAll(), true);
        // "Auswahl" nur, wenn etwas selektiert ist — sonst wäre es ein toter Knopf
        if (sel) {
            const ts = this.tasks.filter(tk => sel.has(tk.key));
            if (ts.length)
                mkBtn('Auswahl', 'Auf die Auswahl einpassen', () => this.zuAuswahl(ts), true);
        }
        // 2.3: Leser-Knöpfe. Gedrückt (gefüllt) = eingeblendet. Sie erscheinen
        // nur, wo sie etwas bewirken: Meilensteine vorhanden und nicht in einer
        // der Meilenstein-Ansichten; Basisplan-Daten da und im Formatbereich an.
        const knopf = (label, an, was, id, fn) => {
            const b = mkBtn(label, was + (an ? ' ausblenden' : ' einblenden'), () => { fn(); this.invalidate(); }, true, an);
            b.setAttribute('data-knopf', id);
            b.setAttribute('aria-pressed', an ? 'true' : 'false');
            b.style.whiteSpace = 'nowrap';
            if (!an)
                b.style.textDecoration = 'line-through';
        };
        if (o && o.knopfMeilensteine !== false && this.msUmschaltbar() && this.tasks.some(tk => this.isMs(tk))) {
            // Zoom und Zeitachse bleiben stehen — nur die Zeilen ändern sich
            knopf('◆ Meilensteine', !this.msAus, 'Meilensteine', 'meilensteine', () => { this.msAus = !this.msAus; this.tip = null; });
        }
        if (o && o.knopfBasisplan !== false && o.basisplan !== false && this.hasPlan) {
            knopf('▭ Basisplan', !this.planAus, 'Basisplan', 'basisplan', () => { this.planAus = !this.planAus; this.tip = null; });
        }
        // "Ansicht ▾" erscheint, sobald eine Sonderansicht möglich ist — oder aktiv
        // ist, damit man aus einem leeren Filter immer wieder herauskommt.
        // Gefüllt nur bei einem echten Filter, nicht bei den Klapp-Ansichten.
        const opts = this.ansichtOptionen();
        if (opts.some(x => x.key !== 'alle' && x.ok) || this.ansicht !== 'alle') {
            const akt = opts.find(x => x.key === this.ansicht);
            const b = mkBtn((akt ? akt.kurz : 'Ansicht') + ' ▾', 'Ansicht wählen', () => this.oeffneMenu('ansicht', b), true, !this.vollerUmfang());
            b.setAttribute('data-menu', '1');
            b.style.whiteSpace = 'nowrap';
        }
    }
    // Einträge von "Ansicht ▾". Die ersten vier sind die Sichten eines
    // Terminplaners (wie die Gliederungs-/Filterwahl in MS Project);
    // „Je Projekt ein Balken“ nur im Portfolio (mehrere Projekte).
    ansichtOptionen() {
        const a = this.analyse();
        const nPr = new Set(this.tasks.map(tk => tk.projekt).filter(p => p !== undefined && p !== null && p !== '')).size;
        const liste = [
            { key: 'sammel', label: 'Sammelvorgänge', kurz: 'Sammelvorgänge', ok: this.hatGruppen(), hinweis: 'Rolle „Phase/Ebene“ oder „PSP-Code“ binden' },
            { key: 'alle', label: 'Gesamter Terminplan', kurz: 'Gesamter Terminplan', ok: true, hinweis: '' },
            { key: 'meilensteine', label: 'Nur Meilensteine', kurz: 'Nur Meilensteine', ok: this.tasks.some(tk => this.isMs(tk)), hinweis: 'Keine Meilensteine in den Daten (Ende leer)' },
            { key: 'haupt', label: 'Nur Hauptmeilensteine', kurz: '◆ Hauptmeilensteine', ok: this.hasHaupt, hinweis: 'Rolle „Hauptmeilenstein“ binden' },
            { key: 'projekte', label: 'Je Projekt ein Balken', kurz: 'Je Projekt ein Balken', ok: nPr > 1, hinweis: '' },
            { key: 'kritisch', label: 'Nur kritischer Pfad', kurz: 'Kritischer Pfad', ok: a.kritQuelle !== null, hinweis: 'Rolle „Kritisch“, „Gesamte Pufferzeit“ oder „Vorgänger“ binden' },
            { key: 'ueberfaellig', label: 'Nur überfällige', kurz: 'Überfällige', ok: a.ueberBestimmbar, hinweis: 'Rolle „Fortschritt“ oder „Status“ binden' }
        ];
        // „Je Projekt ein Balken“ ohne Portfolio gar nicht anbieten (außer aktiv)
        return liste.filter(x => x.key !== 'projekte' || x.ok || this.ansicht === 'projekte');
    }
    oeffneMenu(art, btn) {
        if (this.menu && this.menu.art === art) {
            this.menu = null;
            this.invalidate();
            return;
        }
        const r = btn.getBoundingClientRect();
        const rr = this.root.getBoundingClientRect();
        const sk = this.skalaRoot();
        // "Ansicht" sitzt rechts: Menü rechtsbündig am Knopf, sonst linksbündig
        this.menu = { art, x: ((art === 'ansicht' ? r.right : r.left) - rr.left) / sk, y: (r.bottom - rr.top) / sk + 4 };
        this.invalidate();
    }
    zeigeBisEbene(k) {
        this.nodeTiefe.forEach((d, ck) => { this.collapsed[ck] = d >= k - 1; });
        this.invalidate();
    }
    istBisEbene(k) {
        let ja = true;
        this.nodeTiefe.forEach((d, ck) => { if (!!this.collapsed[ck] !== (d >= k - 1))
            ja = false; });
        return ja;
    }
    zuAuswahl(ts) {
        ts.forEach(tk => (this.vorfahren.get(tk.key) || []).forEach(ck => { this.collapsed[ck] = false; }));
        this.einpassen(ts);
        this.springZiel = ts[0].key;
        this.invalidate();
    }
    // ---------- Einrichtungshilfe (nur Ersteller) ----------
    einrichtungSichtbar() {
        const o = this.opts;
        return !!o && o.bearbeiten === true && o.einrichtung !== false;
    }
    // Gebundene Rollen: vom Host (auch ohne gültige Zeilen), sonst aus den Daten
    // abgeleitet (Testharness)
    rollen() {
        const d = this.opts && this.opts.diagnose;
        if (d && Object.keys(d.rollen).length)
            return d.rollen;
        const ts = this.tasks;
        return {
            task: ts.length > 0, start: ts.length > 0, end: ts.some(t => t.e !== null),
            psp: ts.some(t => !!t.psp), phase: this.ebenenFelder > 0, projekt: ts.some(t => !!t.projekt),
            nr: ts.some(t => !!t.nr), deps: ts.some(t => t.deps.length > 0), progress: ts.some(t => t.pct !== null),
            status: ts.some(t => !!t.st), owner: ts.some(t => !!t.ow),
            statusDate: !!(this.opts && this.opts.statusDatum !== undefined && this.opts.statusDatum !== null),
            planStart: ts.some(t => t.ps !== undefined && t.ps !== null), planEnd: ts.some(t => t.pe !== undefined && t.pe !== null),
            kritisch: ts.some(t => t.kritisch !== undefined), puffer: ts.some(t => t.puffer !== undefined && t.puffer !== null),
            stichtag: ts.some(t => t.stichtag !== undefined && t.stichtag !== null), hauptMs: this.hasHaupt,
            farbeNach: ts.some(t => !!t.farbeWert), zusatz: ts.some(t => !!t.zusatz && t.zusatz.length > 0)
        };
    }
    // Was fehlt, und was es freischalten würde — in der Sprache des Ergebnisses,
    // nicht der Rollen: "Pfeile und kritischer Pfad", nicht "Rolle deps".
    checkliste() {
        const r = this.rollen();
        const a = this.tasks.length ? this.analyse() : null;
        const nrFehlt = !!a && a.unaufgeloest > 0 && !a.nrGebunden;
        return [
            { ok: !!r.task, pflicht: true, rolle: 'Task', nutzen: 'Vorgangsname' },
            { ok: !!r.start, pflicht: true, rolle: 'Start (Datum)', nutzen: 'ohne Start keine Zeile' },
            { ok: !!r.end, pflicht: false, rolle: 'Ende (Datum)', nutzen: 'Balken statt nur Rauten' },
            { ok: !!(r.psp || r.phase), pflicht: false, rolle: 'PSP-Code oder Ebenen', nutzen: 'Gliederung mit Sammelvorgängen' },
            { ok: !!r.deps && !nrFehlt, pflicht: false, rolle: nrFehlt ? 'Nr. (zu den Vorgängern)' : 'Vorgänger (+ Nr.)', nutzen: 'Pfeile, kritischer Pfad, Puffer' },
            { ok: !!r.progress, pflicht: false, rolle: 'Fortschritt', nutzen: 'Fortschrittsbalken, überfällige Vorgänge, Fortschrittslinie' },
            { ok: !!r.statusDate, pflicht: false, rolle: 'Statusdatum', nutzen: 'Berichtsstand statt „heute“' },
            { ok: !!(r.planStart || r.planEnd), pflicht: false, rolle: 'Plan-Start / Plan-Ende', nutzen: 'Grauer Basisplan-Balken, Δ und Verzug' }
        ];
    }
    pruefPunkte() {
        const out = [];
        const d = this.opts && this.opts.diagnose;
        const z = (n, ein, viele) => n + ' ' + (n === 1 ? ein : viele);
        if (d) {
            if (d.limitErreicht)
                out.push({ stufe: 'warn', text: 'Datenlimit erreicht: Power BI liefert höchstens 30.000 Zeilen, der Plan ist unvollständig. Seite oder Visual filtern.' });
            if (d.fortschrittAnzahl)
                out.push({ stufe: 'warn', text: '„Fortschritt“ ist als Anzahl zusammengefasst (Textspalte?) und wird ignoriert — sonst stünde jeder Vorgang auf 100 %. Eine Zahlenspalte binden oder im Feldbereich „Summe“ wählen.' });
            if (d.ohneStart)
                out.push({ stufe: 'warn', text: z(d.ohneStart, 'Zeile', 'Zeilen') + ' ohne gültigen Start übersprungen.' });
            if (d.nrDoppelt)
                out.push({ stufe: 'warn', text: z(d.nrDoppelt, 'doppelte Nr.', 'doppelte Nr.') + ' — Vorgänger sind dort mehrdeutig.' });
            if (d.pspDoppelt)
                out.push({ stufe: 'warn', text: z(d.pspDoppelt, 'doppelter PSP-Code', 'doppelte PSP-Codes') + ' — die Gliederung ist dort mehrdeutig.' });
            if (d.ohneName)
                out.push({ stufe: 'info', text: z(d.ohneName, 'Zeile', 'Zeilen') + ' ohne Vorgangsnamen übersprungen.' });
            if (d.endeVorStart)
                out.push({ stufe: 'info', text: z(d.endeVorStart, 'Zeile', 'Zeilen') + ' mit Ende vor Start — Ende auf den Start gesetzt.' });
            if (d.textDaten)
                out.push({ stufe: 'info', text: 'Termine kommen als Text und wurden als TT.MM.JJJJ gelesen. Sicherer: im Modell den Datentyp „Datum“ setzen.' });
        }
        if (this.tasks.length) {
            const a = this.analyse();
            if (a.unaufgeloest)
                out.push({ stufe: 'warn', text: a.nrGebunden
                        ? z(a.unaufgeloest, 'Vorgänger', 'Vorgänger') + ' nicht gefunden — die Nr. fehlt im Plan oder liegt in einem anderen Projekt.'
                        : 'Vorgänger sind Nummern, aber „Nr.“ ist nicht gebunden — Pfeile und kritischer Pfad fehlen.' });
            if (a.zyklen)
                out.push({ stufe: 'warn', text: z(a.zyklen, 'Kreisbezug', 'Kreisbezüge') + ' in den Vorgängern — im kritischen Pfad übersprungen.' });
            // Kein Datenfehler, aber eine Frage, die Ersteller sonst lange suchen
            if (this.tasks.length > 100)
                out.push({ stufe: 'info', text: 'Mehr als 100 Vorgänge: Einzelfarben je Vorgang sind im Formatbereich ausgeblendet. Farben über Balken → Balkenfarbe nach steuern.' });
        }
        return out;
    }
    // Checkliste als DOM — Einrichtungspanel und Startseite ohne Daten teilen sie
    checklistenKnoten(t) {
        const box = el('div', 'display:grid;grid-template-columns:18px auto 1fr;gap:5px 8px;align-items:baseline;font-size:12px');
        this.checkliste().forEach(c => {
            box.appendChild(el('div', 'font-weight:700;color:' + (c.ok ? '#3E8651' : (c.pflicht ? KRIT_LIGHT : t.sub)), c.ok ? '✓' : (c.pflicht ? '!' : '○')));
            box.appendChild(el('div', 'font-weight:600;white-space:nowrap;color:' + (c.ok ? t.text : (c.pflicht ? KRIT_LIGHT : t.text)), c.rolle));
            box.appendChild(el('div', 'color:' + t.sub, c.nutzen + (c.pflicht ? ' · Pflicht' : '')));
        });
        return box;
    }
    pruefKnoten(t) {
        const pp = this.pruefPunkte();
        const box = el('div', 'display:grid;grid-template-columns:18px 1fr;gap:5px 8px;align-items:baseline;font-size:12px');
        if (!pp.length) {
            box.appendChild(el('div', 'font-weight:700;color:#3E8651', '✓'));
            box.appendChild(el('div', 'color:' + t.sub, 'Keine Auffälligkeiten in den Daten.'));
        }
        pp.forEach(p => {
            box.appendChild(el('div', 'font-weight:700;color:' + (p.stufe === 'warn' ? KRIT_LIGHT : t.sub), p.stufe === 'warn' ? '⚠' : 'ℹ'));
            box.appendChild(el('div', 'color:' + (p.stufe === 'warn' ? t.text : t.sub) + ';line-height:1.35', p.text));
        });
        return box;
    }
    renderEinrichtung(t, x, y) {
        const maxH = Math.max(180, this.root.clientHeight - y - 10);
        // Breite am Visual messen — menuHost selbst hat keine Breite, ein
        // prozentuales max-width würde das Panel auf wenige Pixel stauchen
        const breite = Math.max(240, Math.min(440, this.root.clientWidth - x - 10));
        const box = el('div', 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + breite + 'px;max-height:' + maxH + 'px;overflow:auto;' +
            'background:' + t.panel + ';color:' + t.text + ';border:1px solid ' + t.border + ';border-radius:12px;' +
            'box-shadow:0 14px 36px rgba(0,0,0,0.2);padding:14px 16px;box-sizing:border-box;user-select:text');
        const kopf = el('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px');
        kopf.appendChild(el('div', 'font-weight:700;font-size:14px', 'Einrichtung'));
        const zu = el('div', 'cursor:pointer;color:' + t.sub + ';font-size:16px;padding:0 4px', '✕');
        zu.addEventListener('mousedown', (e) => { if (e.button !== 0)
            return; e.preventDefault(); this.menu = null; this.invalidate(); });
        kopf.appendChild(zu);
        box.appendChild(kopf);
        const titel = (txt) => el('div', 'font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:' + t.sub + ';margin:12px 0 7px', txt);
        box.appendChild(titel('Felder'));
        box.appendChild(this.checklistenKnoten(t));
        box.appendChild(el('div', 'font-size:11px;color:' + t.sub + ';margin-top:7px;line-height:1.35', 'Optional: Kritisch und Gesamte Pufferzeit (sonst berechnet), Stichtag, Projekt, Status, Wer, Hauptmeilenstein, Farbe nach, Zusatzspalten.'));
        box.appendChild(titel('Datenprüfung'));
        box.appendChild(this.pruefKnoten(t));
        box.appendChild(titel('Vorlagen'));
        const o = this.opts;
        VORLAGEN.forEach(v => {
            const geht = !!(o && o.onVorlage) && (v.braucht !== 'haupt' || this.hasHaupt);
            const row = el('div', 'display:flex;flex-direction:column;gap:1px;padding:7px 10px;border-radius:8px;margin:0 -10px;' +
                'cursor:' + (geht ? 'pointer' : 'default') + ';opacity:' + (geht ? 1 : 0.5));
            row.appendChild(el('div', 'font-weight:600;font-size:12.5px', v.label));
            row.appendChild(el('div', 'font-size:11px;color:' + t.sub, v.text + (geht || v.braucht !== 'haupt' ? '' : ' — braucht die Rolle „Hauptmeilenstein“')));
            if (geht) {
                row.addEventListener('mouseenter', () => { row.style.background = t.hoverBg; });
                row.addEventListener('mouseleave', () => { row.style.background = 'transparent'; });
                row.addEventListener('mousedown', (e) => {
                    if (e.button !== 0)
                        return;
                    e.preventDefault();
                    this.menu = null;
                    o.onVorlage(v.key);
                    this.invalidate();
                });
            }
            box.appendChild(row);
        });
        box.appendChild(el('div', 'font-size:10.5px;color:' + t.sub + ';margin-top:12px;border-top:1px solid ' + t.grid + ';padding-top:8px', 'Nur im Bearbeitungsmodus sichtbar — Leser sehen diesen Knopf nicht. Abschaltbar unter Darstellung → Einrichtungshilfe.'));
        this.menuHost.appendChild(box);
    }
    // Menü-Overlay. Einträge reagieren auf mousedown (nicht click), weil ein
    // Render zwischen Drücken und Loslassen den Eintrag ersetzen kann.
    renderMenu(t) {
        this.menuHost.replaceChildren();
        const mn = this.menu;
        if (!mn) {
            this.menuHost.style.display = 'none';
            return;
        }
        this.menuHost.style.display = 'block';
        if (mn.art === 'einrichtung') {
            this.renderEinrichtung(t, mn.x, mn.y);
            return;
        }
        let eintraege;
        if (mn.art === 'ansicht') {
            // 2.3.1: Leser sehen nur, was sie wählen können — „Rolle … binden“
            // ist ein Hinweis für Ersteller und erscheint nur im Bearbeitungsmodus
            const ersteller = !!this.opts && this.opts.bearbeiten === true;
            eintraege = this.ansichtOptionen().filter(x => ersteller || x.ok || x.key === this.ansicht).map(x => ({
                label: x.label, ok: x.ok || x.key === this.ansicht, hinweis: x.hinweis, aktiv: x.key === this.ansicht,
                // Erneut gewählt = Klappzustand der Ansicht wiederherstellen
                fn: () => { if (!this.wechsleAnsicht(x.key)) {
                    this.collapsed = {};
                    this.sy = 0;
                } }
            }));
        }
        else {
            eintraege = [];
            for (let k = 1; k <= this.maxTiefe + 1; k++) {
                const kk = k;
                eintraege.push({
                    label: 'Ebene ' + k + (k === 1 && this.hasProj ? ' · ' + this.text('projektN', 'Projekte') : ''),
                    ok: true, hinweis: '', aktiv: this.istBisEbene(k), fn: () => this.zeigeBisEbene(kk)
                });
            }
            eintraege.push({ label: 'Alle Ebenen', ok: true, hinweis: '', aktiv: this.istBisEbene(Infinity), fn: () => this.zeigeBisEbene(Infinity) });
        }
        const box = el('div', 'position:absolute;left:' + mn.x + 'px;top:' + mn.y + 'px;' + (mn.art === 'ansicht' ? 'transform:translateX(-100%);' : '') +
            'min-width:220px;background:' + t.panel + ';color:' + t.text + ';border:1px solid ' + t.border + ';border-radius:10px;' +
            'box-shadow:0 10px 28px rgba(0,0,0,0.18);padding:5px;font-size:12.5px');
        eintraege.forEach(e => {
            const row = el('div', 'display:flex;align-items:flex-start;gap:8px;padding:7px 10px;border-radius:7px;' +
                'cursor:' + (e.ok ? 'pointer' : 'default') + ';opacity:' + (e.ok ? 1 : 0.55));
            row.appendChild(el('div', 'width:14px;flex-shrink:0;font-weight:700', e.aktiv ? '✓' : ''));
            const txt = el('div', '');
            txt.appendChild(el('div', 'font-weight:' + (e.aktiv ? 700 : 500), e.label));
            // Nicht verfügbare Ansichten bleiben für Ersteller sichtbar und sagen,
            // was fehlt — so findet man die Funktion, statt dass sie still
            // verborgen bleibt (für Leser oben bereits ausgefiltert)
            if (!e.ok && e.hinweis)
                txt.appendChild(el('div', 'font-size:11px;color:' + t.sub + ';margin-top:2px', e.hinweis));
            row.appendChild(txt);
            if (e.ok) {
                row.addEventListener('mouseenter', () => { row.style.background = t.hoverBg; });
                row.addEventListener('mouseleave', () => { row.style.background = 'transparent'; });
                row.addEventListener('mousedown', (ev) => {
                    if (ev.button !== 0)
                        return;
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.menu = null;
                    e.fn();
                    this.invalidate();
                });
            }
            box.appendChild(row);
        });
        this.menuHost.appendChild(box);
    }
    renderTable(t, items, topOf, sy, tableW, sel, ibcs) {
        if (this.tableWrap.style.display === 'none')
            return;
        const m = this.m;
        const cols = this.visibleCols(tableW);
        const pspW = this.zeigePsp() ? Math.round(PSP_W * m.s) : 0;
        const gridTemplate = (pspW ? pspW + 'px ' : '') + 'minmax(0,1fr) ' + cols.map(c => c.w + 'px').join(' ');
        this.tableHead.style.gridTemplateColumns = gridTemplate;
        this.tableHead.style.color = t.sub;
        this.tableHead.style.borderBottom = '1px solid ' + t.border;
        this.tableHead.style.fontSize = this.fs(10.5);
        this.tableHead.replaceChildren();
        if (pspW)
            this.tableHead.appendChild(el('div', '', 'PSP'));
        this.tableHead.appendChild(el('div', '', this.text('spalteTask', 'Task')));
        cols.forEach(c => this.tableHead.appendChild(el('div', (c.key === 'days' || c.key === 'puffer' ? 'text-align:right;padding-right:12px;' : '') +
            (c.key.charAt(0) === 'z' ? 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px' : ''), c.label)));
        this.rowsLayer.style.transform = 'translateY(-' + sy + 'px)';
        this.rowsLayer.replaceChildren();
        const [vA, vB] = this.sichtbar(items.length, sy, this.rowsViewport.clientHeight);
        const o = this.opts;
        const verzugOn = this.planSichtbar() && (!o || o.verzugZeilen !== false);
        const dark = t.panel === '#1E2023';
        const lateTint = hexA(IBCS_RED, dark ? 0.13 : 0.07);
        const u = unitSuffix(o ? o.tageEinheit : undefined);
        const ana = this.analyse();
        const at = !!(o && o.arbeitstage);
        const kritOn = !o || o.kritischHervorheben !== false;
        const ueberOn = !o || o.ueberfaelligMarkieren !== false;
        const kritFarbe = dark ? KRIT_DARK : KRIT_LIGHT;
        const zweizeilig = !!(o && o.namenZweizeilig);
        const q = this.suche.toLowerCase();
        items.slice(vA, vB).forEach(it => {
            const isProj = it.kind === 'proj';
            const isP = it.kind === 'phase' || isProj; // Gruppenzeile (Projekt oder Phase)
            const isM = it.kind === 'ms';
            const hov = this.hover === it.id;
            const mehrfach = isM && it.msKids.length > 1; // Hauptmeilenstein mit mehreren Vorkommen
            // Sammelzeile gilt als selektiert, sobald EIN Vorkommen selektiert ist
            const dim = sel && !isP && it.task && (mehrfach ? !it.msKids.some(k => sel.has(k.key)) : !sel.has(it.task.key));
            const late = verzugOn && it.delta !== null && it.delta > 0;
            // Suchtreffer: Vorgänge über den Trefferindex, Gruppen über ihren Namen
            const treffer = !!q && (it.task ? this.suchSet.has(it.task.key) || it.msKids.some(k => this.suchSet.has(k.key)) : it.name.toLowerCase().includes(q));
            const row = el('div', 'position:absolute;left:0;right:0;top:' + topOf[it.id] + 'px;height:' + m.rowH + 'px;display:grid;' +
                'grid-template-columns:' + gridTemplate + ';align-items:center;padding-left:14px;' +
                'background:' + (hov ? t.hoverBg : (treffer ? SUCH_TINT : (late ? lateTint : 'transparent'))) + ';border-bottom:1px solid ' + t.grid + ';' +
                'cursor:pointer;opacity:' + (dim ? 0.45 : 1));
            if (it.task)
                row.setAttribute('data-task', it.task.key);
            if (pspW)
                row.appendChild(el('div', 'font-variant-numeric:tabular-nums;font-size:' + this.fs(11.5) + ';color:' + t.sub + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px', it.psp || ''));
            // Task-Zelle: Caret (Gruppe), Farb-Punkt, Name — Einrückung je Tiefe.
            // Der flache Fall (eine Ebene, keine Projektrolle) behält die 14 px
            // aus 1.10, damit bestehende Berichte pixelgleich bleiben.
            const indent = (this.hasProj || this.levelCount > 1)
                ? it.depth * Math.round(16 * m.s)
                : (isP ? 0 : 14);
            const dot = Math.max(6, Math.round(9 * m.s));
            const nameCell = el('div', 'display:flex;align-items:center;gap:8px;padding-left:' + indent + 'px;font-weight:' + (isP ? 700 : (isM ? 600 : 400)) + ';min-width:0');
            nameCell.appendChild(el('div', 'width:11px;flex-shrink:0;color:' + t.sub + ';font-size:' + this.fs(9) + ';text-align:center;' +
                'transform:rotate(' + (isP && !this.collapsed[it.phaseKey] ? 90 : 0) + 'deg)', isP ? '▶' : ''));
            // kritische Vorgänge: roter Punkt — in der Tabelle das ruhigste Signal
            nameCell.appendChild(el('div', 'width:' + dot + 'px;height:' + dot + 'px;flex-shrink:0;background:' + (kritOn && it.krit ? kritFarbe : it.color) + ';' +
                'border-radius:' + (ibcs ? '0' : (isM ? '2px' : (isP ? '2.5px' : '50%'))) + ';' +
                'transform:rotate(' + (isM ? 45 : 0) + 'deg)'));
            // Voller Name immer als Hover-Titel; zweizeilig auf Wunsch, weil lange
            // MS-Project-Namen in der schmalen Spalte sonst unlesbar abbrechen
            const nameEl = el('div', zweizeilig
                ? 'overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:normal;line-height:1.15;word-break:break-word'
                : 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap', it.name);
            nameEl.setAttribute('title', (it.psp ? it.psp + ' · ' : '') + it.name);
            nameCell.appendChild(nameEl);
            row.appendChild(nameCell);
            const dateFg = isP ? t.text : t.sub;
            const days = at ? ana.kal.zwischen(it.s, it.e) : Math.round((it.e - it.s) / DAY) + 1;
            const rotFett = ';color:' + kritFarbe + ';font-weight:700';
            const numCss = 'font-variant-numeric:tabular-nums;white-space:nowrap;font-size:' + this.fs(12) + ';color:' + dateFg;
            cols.forEach(c => {
                if (c.key === 'start')
                    row.appendChild(el('div', numCss, fmtDate(it.s)));
                // überfällig zum Statusdatum: das Ende ist die Stelle, an der man es sucht
                else if (c.key === 'end')
                    row.appendChild(el('div', numCss + (ueberOn && it.ueber !== null ? rotFett : ''), isM && !(mehrfach && it.e !== it.s) ? '–' : fmtDate(it.e)));
                else if (c.key === 'puffer')
                    row.appendChild(el('div', 'text-align:right;padding-right:12px;' + numCss + (kritOn && it.krit ? rotFett : ''), it.puffer === null ? '–' : (Math.round(it.puffer * 10) / 10) + u));
                else if (c.key === 'stichtag')
                    row.appendChild(el('div', numCss + (it.stichtag !== null && it.e > it.stichtag ? rotFett : ''), it.stichtag === null ? '–' : fmtDate(it.stichtag)));
                else if (c.key.charAt(0) === 'z') {
                    const v = it.task && it.task.zusatz ? (it.task.zusatz[Number(c.key.slice(1))] || '') : '';
                    const z = el('div', 'font-size:' + this.fs(12) + ';color:' + t.sub + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:6px', v);
                    if (v)
                        z.setAttribute('title', v);
                    row.appendChild(z);
                }
                else if (c.key === 'days')
                    row.appendChild(el('div', 'text-align:right;padding-right:12px;' + numCss, isM ? '–' : days + u));
                else if (c.key === 'delta') {
                    // Abweichung zum Basisplan: Rot = Verzug, Grün = früher fertig
                    const dl = it.delta;
                    const fg = dl === null ? t.sub : (dl > 0 ? IBCS_RED : (dl < 0 ? (ibcs ? t.text : IBCS_GREEN) : t.sub));
                    row.appendChild(el('div', 'text-align:right;padding-right:12px;font-variant-numeric:tabular-nums;font-size:' + this.fs(12) +
                        ';font-weight:' + (dl !== null && dl > 0 ? 700 : 400) + ';color:' + fg, dl === null ? '–' : fmtDelta(dl, u)));
                }
                else if (c.key === 'status') {
                    const cell = el('div', '');
                    if (!isP && !isM && it.st) {
                        const k = statusKind(it.st);
                        if (ibcs) {
                            // IBCS: keine dekorativen Pills — Text; Rot nur für Negatives
                            cell.appendChild(el('span', 'font-size:' + this.fs(11) + ';font-weight:600;color:' + (k === 'blocked' ? IBCS_RED : t.sub), it.st));
                        }
                        else {
                            const stC = this.statusColors(t, k);
                            cell.appendChild(el('span', 'font-size:' + this.fs(11) + ';font-weight:600;padding:3px 9px;border-radius:20px;background:' + stC.bg + ';color:' + stC.fg, it.st));
                        }
                    }
                    row.appendChild(cell);
                }
                else if (c.key === 'pct') {
                    const cell = el('div', 'display:flex;align-items:center;gap:7px');
                    if (!isM && it.pct !== null) {
                        const track = el('div', 'width:' + Math.round(44 * m.s) + 'px;height:5px;border-radius:' + (ibcs ? 0 : 3) + 'px;background:' + t.grid + ';overflow:hidden;flex-shrink:0');
                        track.appendChild(el('div', 'height:100%;width:' + it.pct + '%;background:' + it.color + ';border-radius:' + (ibcs ? 0 : 3) + 'px'));
                        cell.appendChild(track);
                        cell.appendChild(el('span', 'font-size:' + this.fs(11) + ';color:' + t.sub + ';font-variant-numeric:tabular-nums', it.pct + '%'));
                    }
                    row.appendChild(cell);
                }
                else if (c.key === 'ow')
                    row.appendChild(el('div', 'font-size:' + this.fs(12) + ';color:' + t.sub + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap', it.ow));
            });
            // Klick/Kontextmenü laufen zentral über den rowsViewport-Listener
            // (Koordinaten-Auflösung, siehe Konstruktor) — hier nur noch Hover.
            row.addEventListener('mouseenter', () => this.setState({ hover: it.id }));
            this.rowsLayer.appendChild(row);
        });
    }
    statusColors(t, k) {
        const dark = t.panel === '#1E2023';
        if (k === 'done')
            return { bg: okl(0.6, 0.11, 150, 0.16), fg: dark ? okl(0.78, 0.1, 150) : okl(0.45, 0.1, 150) };
        if (k === 'progress')
            return { bg: okl(0.6, 0.11, 250, 0.16), fg: dark ? okl(0.78, 0.1, 250) : okl(0.45, 0.1, 250) };
        if (k === 'blocked')
            return { bg: okl(0.6, 0.13, 25, 0.16), fg: dark ? okl(0.76, 0.12, 25) : okl(0.48, 0.13, 25) };
        return { bg: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', fg: t.sub };
    }
    renderChart(t, items, topOf, sy, cw, chH, x, o, sel) {
        this.chartArea.style.cursor = this.pan && this.pan.moved ? 'grabbing' : 'default';
        const m = this.m;
        const ibcs = o.ibcs;
        const u = unitSuffix(o.tageEinheit);
        const msDatum = o.msDatum !== false;
        const msNamen = o.msNamen !== false;
        const msLblMode = o.msBeschriftung || 'nurDatum';
        const ana = this.analyse();
        const dark = t.panel === '#1E2023';
        const kritOn = o.kritischHervorheben !== false;
        const ueberOn = o.ueberfaelligMarkieren !== false;
        const pufferOn = o.pufferAnzeigen !== false;
        const stichOn = o.stichtageAnzeigen !== false;
        const kritFarbe = dark ? KRIT_DARK : KRIT_LIGHT;
        const okFarbe = dark ? '#69B27A' : '#2E8B57';
        // --- Achse (Monats-Ticks + Tages-/Wochen-Subticks) ---
        this.axisHost.style.borderBottom = '1px solid ' + t.border;
        this.axisHost.replaceChildren();
        const endMs = this.view + cw / this.pxd * DAY;
        // Haupt-Ticks adaptiv zur Zoomstufe: Monate → Quartale → Jahre
        const stepM = this.pxd >= 2.2 ? 1 : (this.pxd >= 0.75 ? 3 : 12);
        const dv = new Date(this.view);
        let cur = Date.UTC(dv.getUTCFullYear(), Math.floor(dv.getUTCMonth() / stepM) * stepM, 1);
        const gridXs = [];
        const subTop = Math.round(26 * m.s);
        while (cur < endMs + 32 * stepM * DAY) {
            const dt = new Date(cur);
            const mo = dt.getUTCMonth();
            const yy = String(dt.getUTCFullYear()).slice(2);
            const label = stepM === 1 ? MN[mo] + ' ' + yy
                : stepM === 3 ? 'Q' + (Math.floor(mo / 3) + 1) + ' ' + yy
                    : String(dt.getUTCFullYear());
            const mx = x(cur);
            const tick = el('div', 'position:absolute;left:' + mx + 'px;top:0;bottom:0;border-left:1px solid ' + t.border);
            const lbl = el('div', 'position:absolute;left:' + mx + 'px;top:' + Math.round(7 * m.s) + 'px;padding-left:7px;font-size:' + this.fs(12) + ';font-weight:700;color:' + t.text + ';white-space:nowrap', label);
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
                    this.axisHost.appendChild(el('div', 'position:absolute;left:' + x(mm) + 'px;top:' + subTop + 'px;padding-left:4px;font-size:' + this.fs(10) + ';color:' + t.sub + ';white-space:nowrap', MN[dt.getUTCMonth()]));
                    gridXs.push({ x: x(mm), c: t.grid });
                }
                mm = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 1);
            }
        }
        if (this.pxd >= 16) {
            let dd = Math.ceil(this.view / DAY) * DAY;
            for (; dd < endMs; dd += DAY) {
                const dt = new Date(dd);
                this.axisHost.appendChild(el('div', 'position:absolute;left:' + (x(dd) + this.pxd / 2) + 'px;top:' + subTop + 'px;font-size:' + this.fs(10) + ';color:' + t.sub + ';white-space:nowrap;transform:translateX(-50%)', String(dt.getUTCDate())));
                gridXs.push({ x: x(dd), c: t.grid });
            }
        }
        else if (this.pxd >= 4.5) {
            let dd = Math.ceil(this.view / DAY) * DAY;
            while (new Date(dd).getUTCDay() !== 1)
                dd += DAY;
            for (; dd < endMs; dd += 7 * DAY) {
                const dt = new Date(dd);
                this.axisHost.appendChild(el('div', 'position:absolute;left:' + x(dd) + 'px;top:' + subTop + 'px;font-size:' + this.fs(10) + ';color:' + t.sub + ';white-space:nowrap;transform:translateX(4px)', dt.getUTCDate() + '.' + (dt.getUTCMonth() + 1) + '.'));
                gridXs.push({ x: x(dd), c: t.grid });
            }
        }
        // --- feste Ebene: Wochenenden + Gitterlinien (volle Höhe) ---
        this.fixedLayer.replaceChildren();
        if (o.wochenenden && this.pxd >= 3.5) {
            let dd = Math.floor(this.view / DAY) * DAY;
            while (new Date(dd).getUTCDay() !== 6)
                dd += DAY;
            for (dd -= 7 * DAY; dd < endMs; dd += 7 * DAY) {
                this.fixedLayer.appendChild(el('div', 'position:absolute;left:' + x(dd) + 'px;width:' + (this.pxd * 2) + 'px;top:0;bottom:0;background:' + t.weekend));
            }
        }
        if (o.wochenenden && this.pxd >= 3.5) {
            ana.kal.feiertage().forEach(f => {
                if (f < this.view - DAY || f > endMs)
                    return;
                this.fixedLayer.appendChild(el('div', 'position:absolute;left:' + x(f) + 'px;width:' + this.pxd + 'px;top:0;bottom:0;background:' + t.weekend));
            });
        }
        gridXs.forEach(g => this.fixedLayer.appendChild(el('div', 'position:absolute;left:' + g.x + 'px;top:0;bottom:0;border-left:1px solid ' + g.c)));
        // --- scrollende Ebene: Lanes, Abhängigkeiten, Balken ---
        this.scrollLayer.style.transform = 'translateY(-' + sy + 'px)';
        this.scrollLayer.replaceChildren();
        const planOn = this.planSichtbar() && this.hasPlan;
        const verzugOn = this.planSichtbar() && o.verzugZeilen !== false;
        const lateTint = hexA(IBCS_RED, t.panel === '#1E2023' ? 0.13 : 0.07);
        const [vA, vB] = this.sichtbar(items.length, sy, chH);
        items.slice(vA, vB).forEach(it => {
            const hov = this.hover === it.id;
            const late = verzugOn && it.delta !== null && it.delta > 0;
            const isGrp = it.kind === 'phase' || it.kind === 'proj';
            this.scrollLayer.appendChild(el('div', 'position:absolute;left:0;right:0;top:' + topOf[it.id] + 'px;height:' + m.rowH + 'px;' +
                'background:' + (hov ? t.hoverBg : (late ? lateTint : (isGrp ? it.laneTint : 'transparent'))) + ';' +
                'border-bottom:1px solid ' + t.grid + (isGrp ? ';cursor:pointer' : '')));
        });
        // Abhängigkeitspfeile, Elbow-Routing je Beziehungstyp: EA (Ende→Anfang),
        // AA, EE, AE. "Von Ende" verlässt den Balken rechts, "von Anfang" links;
        // "zum Anfang" kommt von links an, "zum Ende" von rechts. Beziehungen
        // zwischen zwei kritischen Vorgängen sind rot — das ist der kritische Pfad.
        if (o.abhaengigkeiten) {
            const svg = svgEl('svg');
            svg.setAttribute('width', String(cw));
            svg.setAttribute('height', String(items.length * m.rowH));
            svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
            const half = m.rowH / 2;
            items.forEach(it => {
                if (!it.task || !it.links.length)
                    return;
                const tk = it.task;
                it.links.forEach(l => {
                    const src = l.src;
                    const srcId = src.key;
                    if (topOf[srcId] === undefined || topOf[it.id] === undefined)
                        return;
                    const fy = topOf[srcId] + half;
                    const ty = topOf[it.id] + half;
                    // außerhalb des Sichtfensters liegende Pfeile gar nicht erst bauen
                    if (Math.max(fy, ty) < sy - m.rowH || Math.min(fy, ty) > sy + chH + m.rowH)
                        return;
                    const srcMs = this.isMs(src) || src.e === null;
                    const vonEnde = l.typ === 'EA' || l.typ === 'EE';
                    const zuAnfang = l.typ === 'EA' || l.typ === 'AA';
                    const fx = srcMs ? x(src.s) + this.pxd / 2 + (vonEnde ? 8 : -8)
                        : (vonEnde ? x(src.e + DAY) + 2 : x(src.s) - 2);
                    const tx = it.kind === 'ms' ? x(it.s) + this.pxd / 2 + (zuAnfang ? -9 : 9)
                        : (zuAnfang ? x(it.s) - 3 : x(it.e + DAY) + 3);
                    const dir = zuAnfang ? 1 : -1; // Pfeilspitze zeigt nach rechts bzw. links
                    const stub = fx + (vonEnde ? 8 : -8);
                    let line;
                    if (zuAnfang ? tx - 4 >= stub : tx + 4 <= stub) {
                        line = 'M' + fx + ',' + fy + ' L' + stub + ',' + fy + ' L' + stub + ',' + ty + ' L' + tx + ',' + ty;
                    }
                    else {
                        const my = fy + (ty >= fy ? half : -half);
                        const ax = tx - dir * 10;
                        line = 'M' + fx + ',' + fy + ' L' + stub + ',' + fy + ' L' + stub + ',' + my + ' L' + ax + ',' + my + ' L' + ax + ',' + ty + ' L' + tx + ',' + ty;
                    }
                    const arrow = 'M' + tx + ',' + (ty - 4) + ' L' + (tx + dir * 6) + ',' + ty + ' L' + tx + ',' + (ty + 4) + ' Z';
                    const hl = this.hover === srcId || this.hover === it.id;
                    const selDim = sel && !(sel.has(srcId) || sel.has(tk.key));
                    const kritL = kritOn && it.krit && ana.krit.get(srcId) === true;
                    const farbe = kritL ? kritFarbe : (hl ? t.text : t.dep);
                    const p1 = svgEl('path');
                    p1.setAttribute('d', line);
                    p1.setAttribute('fill', 'none');
                    p1.setAttribute('stroke', farbe);
                    p1.setAttribute('stroke-width', hl || kritL ? '2' : '1.25');
                    p1.setAttribute('opacity', selDim ? '0.25' : (hl || kritL ? '1' : '0.85'));
                    const p2 = svgEl('path');
                    p2.setAttribute('d', arrow);
                    p2.setAttribute('fill', farbe);
                    p2.setAttribute('opacity', selDim ? '0.25' : (hl || kritL ? '1' : '0.85'));
                    svg.appendChild(p1);
                    svg.appendChild(p2);
                });
            });
            this.scrollLayer.appendChild(svg);
        }
        // Stichtag-Marker: Dreieck am Ende des Stichtags (wie in MS Project),
        // grün wenn eingehalten, rot wenn das Ende danach liegt
        const stichMarker = (it, top) => {
            if (!stichOn || it.stichtag === null)
                return;
            const sxp = x(it.stichtag + DAY);
            const verletzt = it.e > it.stichtag;
            const farbe = verletzt ? kritFarbe : okFarbe;
            this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + sxp + 'px;top:' + (top + 8) + 'px;height:' + (m.rowH - 12) + 'px;width:0;' +
                'border-left:1px dashed ' + farbe + ';opacity:0.7;pointer-events:none'));
            const tri = el('div', 'position:absolute;left:' + (sxp - 5) + 'px;top:' + (top + 1) + 'px;width:0;height:0;' +
                'border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ' + farbe);
            tri.setAttribute('title', 'Stichtag ' + fmtDate(it.stichtag) + (verletzt ? ' — überschritten' : ''));
            this.scrollLayer.appendChild(tri);
        };
        // Gesamtpuffer als dünne Linie UNTER dem Balken (wie in MS Project). Auf
        // Höhe des Balkens würde sie die Beschriftung bei großem Puffer weit vom
        // eigenen Balken wegschieben.
        const pufferLinie = (it, vonX, y) => {
            if (!pufferOn || it.puffer === null || it.puffer <= 0)
                return;
            const bis = x(ana.kal.plus(it.e, it.puffer) + DAY);
            if (bis <= vonX + 1)
                return;
            this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + vonX + 'px;top:' + y + 'px;width:' + (bis - vonX) + 'px;height:2px;background:' + t.sub + ';opacity:0.55;pointer-events:none'));
            this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + (bis - 1) + 'px;top:' + (y - 1) + 'px;width:2px;height:6px;background:' + t.sub + ';opacity:0.55;pointer-events:none'));
        };
        const ueberSpan = (it) => !ueberOn || it.ueber === null ? null
            : el('span', 'margin-left:6px;font-weight:700;color:' + kritFarbe, 'überfällig ' + it.ueber + u);
        // Balken: Phasen (dünn), Tasks (mit Fortschrittsfüllung), Meilensteine (Raute)
        // IBCS: scharfe Kanten statt runder Ecken, kein Drop-Shadow (Standard 1.2 —
        // "keine Schatten/3D"); Status "Blockiert" bleibt als rote Outline erhalten,
        // weil der Monochrom-Modus sonst dieses Signal verlieren würde.
        const rad = (px) => ibcs ? '0' : px + 'px';
        const phTop = Math.round((m.rowH - m.phBarH) / 2);
        const barTop = Math.round((m.rowH - m.barH) / 2);
        const diaTop = Math.round((m.rowH - m.dia) / 2);
        // Basisplan-Metriken: Basisplan als schmaler, GEFÜLLTER grauer Balken
        // direkt UNTER dem farbigen Aktuell-Balken — wie MS Project
        // "Balkendiagramm: Überwachung". Bis 2.0 war er nur ein grauer Rahmen;
        // neben dem blass getönten Aktuell-Balken las sich das vertauscht.
        const planH = Math.max(4, Math.round(6 * m.s));
        const planGap = Math.max(1, Math.round(2 * m.s));
        const planFill = planFarbe(t, ibcs);
        // „Δ +n t“ an den Beschriftungen ist eigens abschaltbar (2.2)
        const deltaLblOn = planOn && o.deltaBeschriftung !== false;
        // Mit Basisplan trägt auch der unerledigte Teil des Aktuell-Balkens
        // deutlich Farbe, damit „farbig oben = Aktuell, grau unten = Basisplan“
        // auch bei 0 % Fortschritt eindeutig bleibt
        const aktuellBg = (it, showPlan) => showPlan && !ibcs && /^#[0-9A-Fa-f]{6}$/.test(it.color) ? hexA(it.color, 0.4) : it.soft;
        const gruppenNamen = o.gruppenNamen !== false;
        const mkPlanBar = (ps, pe, topPx, dimmed) => el('div', 'position:absolute;left:' + x(ps) + 'px;top:' + topPx + 'px;width:' + Math.max(2, x(pe + DAY) - x(ps)) + 'px;height:' + planH + 'px;' +
            'border-radius:' + rad(2) + ';background:' + planFill + ';' +
            'pointer-events:none;opacity:' + (dimmed ? 0.25 : 1));
        items.slice(vA, vB).forEach(it => {
            const top = topOf[it.id];
            const hov = this.hover === it.id;
            const dim = sel && it.task && (it.kind === 'ms' && it.msKids.length > 1
                ? !it.msKids.some(k => sel.has(k.key)) : !sel.has(it.task.key));
            const blocked = ibcs && it.task && it.st && statusKind(it.st) === 'blocked';
            const showPlan = planOn && it.ps !== null;
            if (it.kind === 'phase' || it.kind === 'proj') {
                const w = Math.max(4, x(it.e + DAY) - x(it.s));
                // 2.3.1: Ohne Basisplan trägt der offene Teil eines Sammel-/
                // Projektbalkens die eigene Farbe als Tönung mit Rahmen (wie bei
                // Vorgängen) — eine blasse Fläche ohne Rahmen las sich wie der
                // graue Basisplan. Mit Basisplan bleibt es beim Verhalten aus 2.2.
                const eigenTon = !showPlan && !ibcs && /^#[0-9A-Fa-f]{6}$/.test(it.color);
                const bar = el('div', 'position:absolute;left:' + x(it.s) + 'px;top:' + (top + phTop) + 'px;width:' + w + 'px;height:' + m.phBarH + 'px;' +
                    'border-radius:' + rad(5) + ';background:' + (eigenTon ? hexA(it.color, 0.28) : aktuellBg(it, showPlan)) + ';overflow:hidden;pointer-events:none' +
                    (ibcs ? ';box-shadow:inset 0 0 0 1px ' + IBCS_AC : (eigenTon ? ';box-shadow:inset 0 0 0 1px ' + it.color : '')));
                bar.appendChild(el('div', 'height:100%;width:' + (it.pct === null ? 0 : it.pct) + '%;background:' + it.color + ';border-radius:' + rad(5)));
                this.scrollLayer.appendChild(bar);
                // Name der Gruppe am Balkenanfang: ohne Tabelle (oder bei schmaler
                // Tabelle, wo tiefe Ebenen abgeschnitten werden) ist sonst nicht
                // erkennbar, welche Ebene die Zeile zeigt. pointer-events:none,
                // damit der Klick auf die Zeile durchfällt und sie klappt.
                if (gruppenNamen) {
                    this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + x(it.s) + 'px;top:' + (top + phTop - Math.round(12 * m.s)) + 'px;' +
                        'height:' + Math.round(12 * m.s) + 'px;display:flex;align-items:center;' +
                        'font-size:' + this.fs(9.5) + ';font-weight:700;color:' + t.sub + ';' +
                        'white-space:nowrap;pointer-events:none', it.name));
                }
                if (showPlan)
                    this.scrollLayer.appendChild(mkPlanBar(it.ps, it.pe, top + phTop + m.phBarH + planGap, false));
                // Kompakt-Meilensteine der zugeklappten Phase: Rauten auf der
                // Summenzeile, optional mit Datum (Meilenstein-/Portfolioübersicht)
                if (it.msKids.length) {
                    const dia2 = Math.max(8, Math.round(m.dia * 0.75));
                    const diaTop2 = Math.round((m.rowH - dia2) / 2);
                    // Beschriftung nach Zeit sortiert setzen und überlappende
                    // Labels auslassen: bei ~48 Meilensteinen je Projekt wäre
                    // sonst keines mehr lesbar.
                    let lastRight = -Infinity;
                    const lblFs = 8.5 * m.s;
                    it.msKids.slice().sort((a, b) => a.s - b.s).forEach(ms => {
                        const msDim = sel && !sel.has(ms.key);
                        const dEl = el('div', 'position:absolute;left:' + (x(ms.s) + this.pxd / 2 - dia2 / 2) + 'px;top:' + (top + diaTop2) + 'px;width:' + dia2 + 'px;height:' + dia2 + 'px;' +
                            'transform:rotate(45deg);border-radius:' + rad(2) + ';background:' + it.color + ';cursor:pointer;' +
                            (ibcs ? '' : 'box-shadow:0 1px 3px rgba(0,0,0,0.25);') +
                            'opacity:' + (msDim ? 0.3 : 1));
                        // BEWUSST kein data-task: auf einer Gruppenzeile soll ein
                        // Klick die Zeile auf-/zuklappen, auch wenn er eine Raute
                        // trifft (bei ~48 Meilensteinen je Projekt wäre die Zeile
                        // sonst größtenteils tot). Der Titel bleibt als Tooltip.
                        dEl.style.cursor = 'pointer';
                        dEl.setAttribute('title', ms.name + ' · ' + fmtDate(ms.s));
                        this.scrollLayer.appendChild(dEl);
                        const lbl = msLblMode === 'nurName' ? ms.name
                            : msLblMode === 'beides' ? ms.name + ' · ' + fmtDate(ms.s)
                                : (msDatum ? fmtDate(ms.s) : '');
                        if (lbl) {
                            const cx = x(ms.s) + this.pxd / 2;
                            const w = lbl.length * lblFs * 0.55; // Breitenschätzung, reicht zur Kollisionsprüfung
                            if (cx - w / 2 > lastRight + 4) {
                                lastRight = cx + w / 2;
                                this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + cx + 'px;top:' + (top + diaTop2 + dia2 + 1) + 'px;transform:translateX(-50%);' +
                                    'font-size:' + this.fs(8.5) + ';color:' + t.sub + ';font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;opacity:' + (msDim ? 0.3 : 1), lbl));
                            }
                        }
                    });
                }
            }
            else if (it.kind === 'ms' && it.msKids.length > 1) {
                // Hauptmeilenstein mit mehreren Vorkommen: je Vorkommen eine Raute,
                // einzeln anklickbar (data-task) — das selektiert genau dieses
                // Vorkommen. Projekt und Datum stehen im Hover-Titel; die
                // Datumsbeschriftung lässt Überlappungen aus, damit bei vielen
                // Projekten die übrigen lesbar bleiben.
                let lastRight = -Infinity;
                const lblFs = 10 * m.s;
                // Rauten, die sich auf der aktuellen Zoomstufe berühren, bilden einen
                // Cluster; das Datum kommt HINTER dessen letzte Raute, sonst läge es
                // unter der Nachbarraute (z. B. 21.06. und 24.06. in Quartalsansicht).
                const xs = it.msKids.map(ms => x(ms.s) + this.pxd / 2);
                const clusterEnde = xs.map((_, i) => {
                    let j = i;
                    while (j + 1 < xs.length && xs[j + 1] - xs[j] < m.dia + 2)
                        j++;
                    return xs[j];
                });
                const clusterStart = xs.map((v, i) => i === 0 || v - xs[i - 1] >= m.dia + 2);
                it.msKids.forEach((ms, i) => {
                    const msDim = sel && !sel.has(ms.key);
                    const cx = x(ms.s) + this.pxd / 2;
                    const dEl = el('div', 'position:absolute;left:' + (cx - m.dia / 2) + 'px;top:' + (top + diaTop) + 'px;width:' + m.dia + 'px;height:' + m.dia + 'px;' +
                        'transform:rotate(45deg);border-radius:' + rad(3) + ';background:' + it.color + ';cursor:pointer;' +
                        (ibcs ? '' : 'box-shadow:0 1px 3px rgba(0,0,0,0.25);') +
                        'opacity:' + (msDim ? 0.3 : 1));
                    dEl.setAttribute('data-task', ms.key);
                    const pr = ms.projekt !== undefined && ms.projekt !== null && ms.projekt !== '' ? ms.projekt + ' · ' : '';
                    dEl.setAttribute('title', pr + ms.name + ' · ' + fmtDate(ms.s));
                    this.scrollLayer.appendChild(dEl);
                    if (msDatum && clusterStart[i]) {
                        const lbl = fmtDate(ms.s);
                        const w = lbl.length * lblFs * 0.55;
                        const lx = clusterEnde[i] + m.dia / 2 + 3;
                        if (lx > lastRight + 4) {
                            lastRight = lx + w;
                            this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + lx + 'px;top:' + (top + diaTop) + 'px;height:' + m.dia + 'px;' +
                                'display:flex;align-items:center;font-size:' + this.fs(10) + ';color:' + t.sub + ';' +
                                'font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;opacity:' + (msDim ? 0.3 : 1), lbl));
                        }
                    }
                });
            }
            else if (it.kind === 'ms') {
                const dia = el('div', 'position:absolute;left:' + (x(it.s) + this.pxd / 2 - m.dia / 2) + 'px;top:' + (top + diaTop) + 'px;width:' + m.dia + 'px;height:' + m.dia + 'px;' +
                    'transform:rotate(45deg);border-radius:' + rad(3) + ';background:' + it.color + ';cursor:pointer;' +
                    (blocked ? 'box-shadow:inset 0 0 0 2px ' + IBCS_RED + ';'
                        : kritOn && it.krit ? 'box-shadow:0 0 0 2px ' + kritFarbe + ';'
                            : (ibcs ? '' : 'box-shadow:0 1px 3px rgba(0,0,0,0.25);')) +
                    'opacity:' + (dim ? 0.3 : 1));
                if (it.task)
                    dia.setAttribute('data-task', it.task.key);
                dia.addEventListener('mouseenter', (ev) => this.tipAt(it, ev));
                dia.addEventListener('mousemove', (ev) => this.tipAt(it, ev));
                // Basisplan-Meilenstein: gefüllte graue Raute (etwas kleiner) an der
                // geplanten Position — nur wenn sie vom Aktuell-Termin abweicht,
                // sonst läge sie exakt unter der farbigen Raute
                if (showPlan && it.ps !== it.s) {
                    const pd = Math.max(7, Math.round(m.dia * 0.8));
                    const pdTop = Math.round((m.rowH - pd) / 2);
                    this.scrollLayer.appendChild(el('div', 'position:absolute;left:' + (x(it.ps) + this.pxd / 2 - pd / 2) + 'px;top:' + (top + pdTop) + 'px;width:' + pd + 'px;height:' + pd + 'px;' +
                        'transform:rotate(45deg);border-radius:' + rad(2) + ';background:' + planFill + ';' +
                        'pointer-events:none;opacity:' + (dim ? 0.25 : 1)));
                }
                this.scrollLayer.appendChild(dia);
                stichMarker(it, top);
                pufferLinie(it, x(it.s) + this.pxd / 2, top + diaTop + m.dia + 2);
                const msLbl = el('div', 'position:absolute;left:' + (x(it.s) + this.pxd / 2 + 14) + 'px;top:' + (top + diaTop) + 'px;height:' + m.dia + 'px;' +
                    'display:flex;align-items:center;font-size:' + this.fs(11) + ';font-weight:600;color:' + t.text + ';white-space:nowrap;pointer-events:none;opacity:' + (dim ? 0.3 : 1), [msNamen ? it.name : '', msDatum ? fmtDate(it.s) : ''].filter(v => v !== '').join(' · '));
                if (deltaLblOn && it.delta !== null && it.delta !== 0) {
                    msLbl.appendChild(el('span', 'margin-left:6px;font-weight:700;font-variant-numeric:tabular-nums;color:' + (it.delta > 0 ? IBCS_RED : (ibcs ? t.text : IBCS_GREEN)), 'Δ ' + fmtDelta(it.delta, u)));
                }
                const ueMs = ueberSpan(it);
                if (ueMs)
                    msLbl.appendChild(ueMs);
                this.scrollLayer.appendChild(msLbl);
            }
            else {
                const bx = x(it.s), bw = Math.max(this.pxd, x(it.e + DAY) - x(it.s));
                const pct = it.pct === null ? 0 : it.pct;
                const istKrit = kritOn && it.krit;
                const outline = blocked ? IBCS_RED : (istKrit ? kritFarbe : it.color);
                // Mit Basisplan: Ist-Balken etwas flacher, damit Ist + Plan
                // zusammen zentriert in der Zeile sitzen
                const bh = showPlan ? Math.max(10, m.barH - planH - planGap) : m.barH;
                const bt = showPlan ? Math.round((m.rowH - (bh + planGap + planH)) / 2) : barTop;
                const bar = el('div', 'position:absolute;left:' + bx + 'px;top:' + (top + bt) + 'px;width:' + bw + 'px;height:' + bh + 'px;' +
                    'border-radius:' + rad(6) + ';background:' + aktuellBg(it, showPlan) + ';cursor:pointer;' +
                    'box-shadow:inset 0 0 0 ' + (blocked || istKrit ? 2 : 1) + 'px ' + outline + (!ibcs && hov ? ',0 3px 10px rgba(0,0,0,0.22)' : '') + ';' +
                    'opacity:' + (dim ? 0.3 : 1));
                bar.appendChild(el('div', 'position:absolute;left:0;top:0;bottom:0;width:' + pct + '%;background:' + it.color + ';' +
                    'border-radius:' + (pct >= 100 ? rad(6) : (ibcs ? '0' : '6px 0 0 6px')) + ';opacity:' + (ibcs ? 1 : 0.92)));
                if (it.task)
                    bar.setAttribute('data-task', it.task.key);
                bar.addEventListener('mouseenter', (ev) => this.tipAt(it, ev));
                bar.addEventListener('mousemove', (ev) => this.tipAt(it, ev));
                this.scrollLayer.appendChild(bar);
                if (showPlan)
                    this.scrollLayer.appendChild(mkPlanBar(it.ps, it.pe, top + bt + bh + planGap, !!dim));
                stichMarker(it, top);
                pufferLinie(it, bx + bw, top + bt + bh + 2);
                const labelParts = [it.name];
                if (it.pct !== null)
                    labelParts.push(pct + ' %');
                if (it.ow)
                    labelParts.push(it.ow);
                const lbl = el('div', 'position:absolute;left:' + (bx + bw + 10) + 'px;top:' + (top + bt) + 'px;height:' + bh + 'px;' +
                    'display:flex;align-items:center;font-size:' + this.fs(11) + ';color:' + t.sub + ';white-space:nowrap;pointer-events:none;opacity:' + (dim ? 0.3 : 1), labelParts.join(' · '));
                if (deltaLblOn && it.delta !== null && it.delta !== 0) {
                    lbl.appendChild(el('span', 'margin-left:6px;font-weight:700;font-variant-numeric:tabular-nums;color:' + (it.delta > 0 ? IBCS_RED : (ibcs ? t.text : IBCS_GREEN)), 'Δ ' + fmtDelta(it.delta, u)));
                }
                const ue = ueberSpan(it);
                if (ue)
                    lbl.appendChild(ue);
                this.scrollLayer.appendChild(lbl);
            }
        });
        // --- Fortschrittslinie (MS Project): vom Statusdatum zu jedem laufenden
        // Vorgang an den Punkt seines Ist-Fortschritts und zurück. Knick nach
        // links = Rückstand, nach rechts = Vorsprung. Fertige und noch nicht
        // begonnene Vorgänge bleiben auf der Linie.
        if (o.fortschrittslinie && this.tasks.some(tk => tk.pct !== null)) {
            const stX = x(ana.statusMs);
            let d = '';
            const punkte = [];
            items.slice(vA, vB).forEach((it, i) => {
                const top = topOf[it.id];
                let px = stX;
                if (it.kind === 'task' && it.pct !== null && it.pct < 100 && (it.s <= ana.statusMs || it.pct > 0)) {
                    px = x(it.s) + (x(it.e + DAY) - x(it.s)) * it.pct / 100;
                    if (Math.abs(px - stX) > 1)
                        punkte.push([px, top + m.rowH / 2]);
                }
                d += (i === 0 ? 'M' : 'L') + stX + ',' + (top + 2) + ' L' + px + ',' + (top + m.rowH / 2) + ' L' + stX + ',' + (top + m.rowH - 2) + ' ';
            });
            if (d) {
                const svg = svgEl('svg');
                svg.setAttribute('width', String(cw));
                svg.setAttribute('height', String(items.length * m.rowH));
                svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
                const pth = svgEl('path');
                pth.setAttribute('d', d);
                pth.setAttribute('fill', 'none');
                pth.setAttribute('stroke', t.today);
                pth.setAttribute('stroke-width', '1.6');
                pth.setAttribute('stroke-linejoin', 'round');
                pth.setAttribute('data-fortschrittslinie', '1');
                svg.appendChild(pth);
                punkte.forEach(([cx, cy]) => {
                    const c = svgEl('circle');
                    c.setAttribute('cx', String(cx));
                    c.setAttribute('cy', String(cy));
                    c.setAttribute('r', '2.6');
                    c.setAttribute('fill', t.today);
                    svg.appendChild(c);
                });
                this.scrollLayer.appendChild(svg);
            }
        }
        // --- Status-/Heute-Linie ---
        // Mit gebundenem Statusdatum wandert die rote Linie auf den
        // Berichtsstand (Label = Datum); ohne Bindung bleibt sie auf "Heute"
        this.todayHost.replaceChildren();
        if (o.heuteLinie) {
            const statusMs = o.statusDatum !== undefined && o.statusDatum !== null ? o.statusDatum : Date.now();
            const lineLabel = o.statusDatum !== undefined && o.statusDatum !== null ? fmtDate(statusMs) : 'Heute';
            const todayX = x(statusMs);
            if (todayX > -10 && todayX < cw + 10) {
                this.todayHost.appendChild(el('div', 'position:absolute;left:' + todayX + 'px;top:' + m.axisH + 'px;bottom:0;width:0;border-left:2px solid ' + t.today + ';opacity:0.75'));
                this.todayHost.appendChild(el('div', 'position:absolute;left:' + todayX + 'px;top:' + Math.round(22 * m.s) + 'px;transform:translateX(-50%);background:' + t.today + ';color:#fff;' +
                    'font-size:' + this.fs(10) + ';font-weight:700;padding:2px 8px;border-radius:' + rad(10) + ';white-space:nowrap', lineLabel));
            }
        }
    }
    renderTip(t, items, ibcs) {
        this.tipHost.replaceChildren();
        const o = this.opts;
        if (o && o.tooltip === false)
            return;
        // Zeilen einzeln schaltbar; nicht gesetzt = an (Testharness liefert nicht alle)
        const zl = o && o.tipZeilen;
        const zeige = (k) => !zl || zl[k] !== false;
        if (!this.tip)
            return;
        const it = items.find(i => i.id === this.tip.id);
        if (!it)
            return;
        const isM = it.kind === 'ms';
        const box = el('div', 'position:absolute;left:' + this.tip.x + 'px;top:' + this.tip.y + 'px;background:' + t.tipBg + ';color:' + t.tipFg + ';' +
            'border-radius:' + (ibcs ? '0' : '9px') + ';padding:11px 13px;box-shadow:' + (ibcs ? '0 0 0 1px rgba(0,0,0,0.15)' : '0 10px 28px rgba(0,0,0,0.25)') + ';min-width:200px;max-width:300px');
        box.appendChild(el('div', 'font-weight:700;font-size:' + this.fs(12.5) + ';margin-bottom:7px', (it.psp ? it.psp + ' · ' : '') + it.name));
        const ana = this.analyse();
        const at = !!(o && o.arbeitstage);
        const tageWort = at ? ' Arbeitstage' : ' Tage';
        const grid = el('div', 'display:grid;grid-template-columns:auto 1fr;gap:3px 14px;font-size:' + this.fs(11.5));
        const addRow = (label, val, mono, fg) => {
            grid.appendChild(el('div', 'color:' + t.tipSub, label));
            grid.appendChild(el('div', (mono ? 'font-variant-numeric:tabular-nums;' : '') + (fg ? 'color:' + fg + ';font-weight:700' : ''), val));
        };
        const mehrfach = isM && it.msKids.length > 1;
        // Mit Basisplan heißen die Termine wie in MS Project „Aktuell“ und
        // „Basisplan“ — sobald der Plan gezeichnet wird oder dieser Tooltip die
        // Basisplan-Zeile zeigt; ohne Basisplan bleibt es beim neutralen „Zeitraum“
        const mitPlan = (this.hasPlan && (!o || o.basisplan !== false)) || (it.ps !== null && zeige('plan'));
        if (zeige('zeitraum'))
            addRow(mitPlan ? 'Aktuell' : 'Zeitraum', isM && !mehrfach ? fmtDate(it.s) : fmtDate(it.s) + ' – ' + fmtDate(it.e), true);
        if (mehrfach)
            addRow('Vorkommen', String(it.msKids.length), true);
        // Der Schalter kommt ZUSÄTZLICH zur Datenbedingung: ohne Basisplan gibt
        // es hier nach wie vor nichts zu zeigen.
        if (it.ps !== null) {
            if (zeige('plan'))
                addRow('Basisplan', it.ps === it.pe || it.pe === null ? fmtDate(it.ps) : fmtDate(it.ps) + ' – ' + fmtDate(it.pe), true);
            if (it.delta !== null && zeige('abweichung'))
                addRow('Abweichung', fmtDelta(it.delta, tageWort), true, it.delta > 0 ? IBCS_RED : (it.delta < 0 && !ibcs ? IBCS_GREEN : undefined));
        }
        if (zeige('dauer'))
            addRow('Dauer', isM ? 'Meilenstein' : (at ? ana.kal.zwischen(it.s, it.e) : Math.round((it.e - it.s) / DAY) + 1) + tageWort);
        if (zeige('status'))
            addRow('Status', isM || !it.st ? '–' : it.st);
        if (zeige('fortschritt'))
            addRow('Fortschritt', isM || it.pct === null ? '–' : it.pct + ' %');
        if (zeige('wer'))
            addRow('Wer', it.ow || '–');
        // Beziehungstyp und Zeitabstand nur, wenn sie vom Standard (EA, ohne Abstand)
        // abweichen — sonst steht in jeder Zeile dasselbe Rauschen
        if (zeige('abhaengigkeiten'))
            addRow('Hängt ab von', it.links.map(l => {
                const zus = l.typ !== 'EA' || l.lag || l.lagProzent !== undefined
                    ? ' (' + l.typ + (l.lagProzent !== undefined ? (l.lagProzent >= 0 ? '+' : '') + l.lagProzent + ' %'
                        : l.lag ? (l.lag > 0 ? '+' : '') + (Math.round(l.lag * 10) / 10) + ' AT' : '') + ')' : '';
                return (l.src.nr ? l.src.nr + ' ' : '') + l.src.name + zus;
            }).join(', ') || '–');
        // Planungszeilen: nur, was bestimmbar ist — "berechnet" macht kenntlich,
        // dass der Wert nicht aus MS Project stammt, sondern aus Terminen + Vorgängern
        if (zeige('planung') && it.task) {
            const rot = o && o.dark ? KRIT_DARK : KRIT_LIGHT;
            if (ana.kritQuelle)
                addRow('Kritisch', (it.krit ? 'ja' : 'nein') + (ana.kritQuelle === 'berechnet' ? ' (berechnet)' : ''), false, it.krit ? rot : undefined);
            if (it.puffer !== null)
                addRow('Puffer', (Math.round(it.puffer * 10) / 10) + ' Arbeitstage' + (ana.pufferQuelle === 'berechnet' ? ' (berechnet)' : ''), true);
            if (it.stichtag !== null) {
                const um = it.e > it.stichtag ? (at ? ana.kal.differenz(it.stichtag, it.e) : Math.round((it.e - it.stichtag) / DAY)) : 0;
                addRow('Stichtag', fmtDate(it.stichtag) + (um > 0 ? ' — überschritten um ' + um + tageWort : ''), true, um > 0 ? rot : undefined);
            }
            if (it.ueber !== null)
                addRow('Überfällig', 'seit ' + it.ueber + tageWort + ' (Stand ' + fmtDate(ana.statusMs) + ')', true, rot);
        }
        box.appendChild(grid);
        this.tipHost.appendChild(box);
    }
}
