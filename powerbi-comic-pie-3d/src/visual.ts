/*
 *  3D Comic Pie – Power BI Custom Visual
 *  Portierung des Three.js-Comic-Tortendiagramms:
 *  explodierende Segmente, Wackel-Tanz, Kulleraugen und Comic-Bursts.
 *  Daten kommen aus Kategorie + Wert; Klick auf ein Stück filtert den Report.
 */
"use strict";

import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import * as THREE from "three";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettings } from "./settings";

import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.visuals.ISelectionId;
import DataView = powerbi.DataView;
import DataViewCategorical = powerbi.DataViewCategorical;

// -------------------- Konstanten (aus dem Original) --------------------
const RADIUS = 3.0, DEPTH = 1.2, BEVEL = 0.12;
const POP_EXTRA = 1.05;
const SPRING_K = 150, SPRING_D = 16;   // federnd + Überschwinger = boing

// Fallback-Comicpalette, falls das Report-Theme keine Farben liefert.
const FALLBACK_COLORS = ["#FF3B3B", "#FFC12E", "#2E7DF7", "#27C86A", "#A855F7", "#FF5DA2", "#00C2C7", "#FF8A3D"];

// Geometrie der 6 kreisenden Comic-Bursts (Position/Tempo/Puls) – unabhängig vom Wort.
const BURST_GEO = [
    { R: 5.4, y: 2.6, spd: 0.35, bobA: 0.5, bobF: 1.7, spin: 0.5, s: 1.9 },
    { R: 6.6, y: -1.2, spd: -0.28, bobA: 0.7, bobF: 1.3, spin: -0.4, s: 2.1 },
    { R: 7.4, y: 1.1, spd: 0.22, bobA: 0.4, bobF: 2.1, spin: 0.6, s: 1.7 },
    { R: 5.9, y: 3.1, spd: -0.4, bobA: 0.5, bobF: 1.9, spin: -0.5, s: 1.6 },
    { R: 7.0, y: -0.6, spd: 0.3, bobA: 0.6, bobF: 1.5, spin: 0.35, s: 1.8 },
    { R: 6.2, y: 0.4, spd: -0.24, bobA: 0.5, bobF: 2.3, spin: -0.55, s: 1.7 }
];

interface BurstWord { w: string; f: string; t: string; }
interface Theme {
    key: string;
    label: string;
    btn: string;      // CSS-Hintergrund für den Bonbon-Button
    fg: string;       // Textfarbe des Buttons
    colors: string[] | null;  // Farbwelt der Tortenstücke (null = Report-/Palette-Farben)
    bursts: BurstWord[];      // Spruchwelt
}

// ---- Film-Vorlagen: Farbwelt + Spruchwelt ----
const THEMES: { [k: string]: Theme } = {
    standard: {
        key: "standard", label: "🍭 Standard", btn: "linear-gradient(135deg,#ff8ec7,#8ad0ff)", fg: "#141414",
        colors: null,
        bursts: [
            { w: "POW!", f: "#FF3B3B", t: "#ffffff" }, { w: "BOOM!", f: "#FFC12E", t: "#141414" },
            { w: "WOW!", f: "#2E7DF7", t: "#ffffff" }, { w: "ZAP!", f: "#27C86A", t: "#141414" },
            { w: "YEAH!", f: "#FF5DA2", t: "#ffffff" }, { w: "BÄM!", f: "#A855F7", t: "#ffffff" }
        ]
    },
    killbill: {
        key: "killbill", label: "⚔️ Kill Bill", btn: "linear-gradient(135deg,#ffe500,#141414)", fg: "#141414",
        colors: ["#FFE500", "#141414", "#E32213", "#FF7A00", "#B0000A", "#F4C20D"],
        bursts: [
            { w: "REVENGE!", f: "#FFE500", t: "#141414" }, { w: "SWORD!", f: "#E32213", t: "#ffffff" },
            { w: "HATTORI!", f: "#141414", t: "#FFE500" }, { w: "BEEP!", f: "#FF7A00", t: "#141414" },
            { w: "WIGGLE!", f: "#B0000A", t: "#ffffff" }, { w: "SNAP!", f: "#F4C20D", t: "#141414" }
        ]
    },
    starwars: {
        key: "starwars", label: "🚀 Star Wars", btn: "linear-gradient(135deg,#ffe81f,#2e7df7)", fg: "#141414",
        colors: ["#FFE81F", "#2E7DF7", "#FF3B3B", "#27C86A", "#141414", "#C0C0C0"],
        bursts: [
            { w: "PEW PEW!", f: "#FFE81F", t: "#141414" }, { w: "FORCE!", f: "#2E7DF7", t: "#ffffff" },
            { w: "VADER!", f: "#141414", t: "#FF3B3B" }, { w: "JEDI!", f: "#27C86A", t: "#141414" },
            { w: "BOOM!", f: "#FF3B3B", t: "#ffffff" }, { w: "ZAP!", f: "#C0C0C0", t: "#141414" }
        ]
    },
    endgame: {
        key: "endgame", label: "🛡️ Endgame", btn: "linear-gradient(135deg,#7b2ff7,#ff3b3b)", fg: "#ffffff",
        colors: ["#7B2FF7", "#FF3B3B", "#FFC12E", "#2E7DF7", "#27C86A", "#B0000A"],
        bursts: [
            { w: "SNAP!", f: "#7B2FF7", t: "#ffffff" }, { w: "ASSEMBLE!", f: "#FF3B3B", t: "#ffffff" },
            { w: "3000!", f: "#FFC12E", t: "#141414" }, { w: "SMASH!", f: "#27C86A", t: "#141414" },
            { w: "BOOM!", f: "#2E7DF7", t: "#ffffff" }, { w: "POW!", f: "#B0000A", t: "#ffffff" }
        ]
    },
    pate: {
        key: "pate", label: "🎩 Der Pate", btn: "linear-gradient(135deg,#c8a24b,#3b2a1a)", fg: "#fff4d8",
        colors: ["#6B1414", "#C8A24B", "#2A1E12", "#8C6B3F", "#A8842C", "#3B2A1A"],
        bursts: [
            { w: "OFFER!", f: "#C8A24B", t: "#141414" }, { w: "FAMILY!", f: "#6B1414", t: "#ffffff" },
            { w: "RESPECT!", f: "#2A1E12", t: "#C8A24B" }, { w: "BANG!", f: "#A8842C", t: "#141414" },
            { w: "CAPISCE?", f: "#8C6B3F", t: "#ffffff" }, { w: "CANNOLI!", f: "#C8A24B", t: "#141414" }
        ]
    },
    gump: {
        key: "gump", label: "🍫 Forrest Gump", btn: "linear-gradient(135deg,#9be36f,#7fb8ff)", fg: "#141414",
        colors: ["#6DBE72", "#7FB8FF", "#FFC97F", "#E8A0BF", "#C9E4A0", "#F5D76E"],
        bursts: [
            { w: "RUN!", f: "#6DBE72", t: "#141414" }, { w: "RUN FORREST!", f: "#7FB8FF", t: "#141414" },
            { w: "SHRIMP!", f: "#E8A0BF", t: "#141414" }, { w: "CHOCOLATE!", f: "#FFC97F", t: "#141414" },
            { w: "PING PONG!", f: "#C9E4A0", t: "#141414" }, { w: "STUPID IS...", f: "#F5D76E", t: "#141414" }
        ]
    },
    boogie: {
        key: "boogie", label: "🪩 Boogie Nights", btn: "linear-gradient(135deg,#ff5da2,#7b2ff7)", fg: "#ffffff",
        colors: ["#FF5DA2", "#FFC12E", "#7B2FF7", "#FF7A00", "#2E7DF7", "#27C86A"],
        bursts: [
            { w: "GROOVY!", f: "#FF5DA2", t: "#ffffff" }, { w: "DISCO!", f: "#FFC12E", t: "#141414" },
            { w: "BOOGIE!", f: "#7B2FF7", t: "#ffffff" }, { w: "FUNK!", f: "#FF7A00", t: "#141414" },
            { w: "70s!", f: "#2E7DF7", t: "#ffffff" }, { w: "WOW!", f: "#27C86A", t: "#141414" }
        ]
    }
};
const THEME_ORDER = ["standard", "killbill", "starwars", "endgame", "pate", "gump", "boogie"];

interface SliceDatum {
    label: string;
    value: number;
    color: string;
    selectionId: ISelectionId;
    // Laufzeit-Zustand der 3D-Slice
    mid?: number;
    holder?: THREE.Group;
    mesh?: THREE.Mesh;
    dir?: { x: number; y: number };
    dist?: number;
    vel?: number;
    selected?: boolean;
}

export class Visual implements IVisual {
    private host: IVisualHost;
    private selectionManager: ISelectionManager;
    private events: IVisualEventService;
    private container: HTMLElement;

    private formattingSettingsService: FormattingSettingsService;
    private settings: VisualSettings;

    // Three.js
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private grad: THREE.Texture;

    private spinGroup: THREE.Group;
    private slicesGroup: THREE.Group;

    private eyeL: THREE.Sprite; private eyeR: THREE.Sprite;
    private pupL: THREE.Sprite; private pupR: THREE.Sprite;
    private eyeGroup: THREE.Group;

    private bursts: Array<{ sprite: THREE.Sprite; mat: THREE.SpriteMaterial; angle: number; R: number; baseY: number; spd: number; bobA: number; bobF: number; ph: number; spin: number; baseS: number; }> = [];
    private burstGroup: THREE.Group;

    private clock: THREE.Clock;
    private rafId = 0;

    // Kamera-Steuerung
    private target = new THREE.Vector3(0, DEPTH * 0.5, 0);
    private camTheta = 0.0; private camPhi = 1.02; private camRadius = 15.0;

    private ray = new THREE.Raycaster();
    private ndc = new THREE.Vector2();

    private slices: SliceDatum[] = [];
    private dataPoints: SliceDatum[] = [];

    // Animations-Ziele
    private currentExplode = 0;
    private targetExplode = 1.1;
    private spinSpeed = 0.5;
    private spinYaw = 0;
    private spinning = true;
    private wobble = true;

    // Theme + Explode-Modus
    private currentTheme = "standard";
    private activeThemeColors: string[] | null = null;
    private builtBurstTheme = "";
    private explodeMode = false;
    private overlayEl: HTMLElement | null = null;
    private themeButtons: { [k: string]: HTMLElement } = {};
    private explodeBtn: HTMLElement | null = null;

    private width = 300;
    private height = 300;

    constructor(options: VisualConstructorOptions) {
        this.host = options.host;
        this.selectionManager = this.host.createSelectionManager();
        this.events = this.host.eventService;
        this.container = options.element;
        this.formattingSettingsService = new FormattingSettingsService();

        this.initThree();
        this.buildStaticDecor();
        this.buildOverlay();
        this.attachEvents();
        this.animate();
    }

    // ==================================================================
    //  On-Canvas UI: Bonbon-Buttons (Film-Motto) + EXPLODE
    // ==================================================================
    private buildOverlay(): void {
        const ui = document.createElement("div");
        ui.className = "comic-ui";

        // Motto-Buttons (bonbonfarben)
        const bar = document.createElement("div");
        bar.className = "comic-themebar";
        THEME_ORDER.forEach(key => {
            const th = THEMES[key];
            const btn = document.createElement("button");
            btn.className = "comic-btn";
            btn.type = "button";
            btn.textContent = th.label;
            btn.style.background = th.btn;
            btn.style.color = th.fg;
            btn.title = th.label;
            btn.addEventListener("click", (e) => { e.stopPropagation(); this.setTheme(key, true); });
            this.themeButtons[key] = btn;
            bar.appendChild(btn);
        });
        ui.appendChild(bar);

        // EXPLODE-Button
        const ex = document.createElement("button");
        ex.className = "comic-explode";
        ex.type = "button";
        ex.textContent = "💥 EXPLODE";
        ex.addEventListener("click", (e) => { e.stopPropagation(); this.toggleExplode(); });
        this.explodeBtn = ex;
        ui.appendChild(ex);

        this.container.appendChild(ui);
        this.overlayEl = ui;
        this.updateThemeButtons();
    }

    private toggleExplode(): void {
        this.explodeMode = !this.explodeMode;
        if (this.explodeBtn) this.explodeBtn.classList.toggle("on", this.explodeMode);
    }

    /** Setzt Farb- und Spruchwelt und (optional) persistiert das Motto. */
    private setTheme(key: string, persist: boolean): void {
        if (!THEMES[key]) key = "standard";
        this.currentTheme = key;
        this.activeThemeColors = THEMES[key].colors;
        if (this.builtBurstTheme !== key) this.rebuildBursts(THEMES[key].bursts, key);
        this.buildSlices();
        this.updateThemeButtons();

        if (persist) {
            this.host.persistProperties({
                merge: [{
                    objectName: "theme",
                    selector: null,
                    properties: { preset: key }
                }]
            });
        }
    }

    private updateThemeButtons(): void {
        THEME_ORDER.forEach(key => {
            const btn = this.themeButtons[key];
            if (btn) btn.classList.toggle("on", key === this.currentTheme);
        });
    }

    // ==================================================================
    //  Three.js Grundgerüst
    // ==================================================================
    private initThree(): void {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.style.position = "relative";
        this.container.style.overflow = "hidden";

        const el = this.renderer.domElement;
        el.style.display = "block";
        el.style.width = "100%";
        el.style.height = "100%";
        el.style.cursor = "grab";
        this.container.appendChild(el);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(44, 1, 0.1, 200);

        this.grad = this.makeToonGradient();

        // Licht
        this.scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6b8c, 0.55));
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.40));
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(6, 13, 5); key.castShadow = true;
        key.shadow.mapSize.set(2048, 2048);
        key.shadow.camera.near = 1; key.shadow.camera.far = 60;
        key.shadow.camera.left = -12; key.shadow.camera.right = 12;
        key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
        key.shadow.bias = -0.0006; (key.shadow as THREE.DirectionalLightShadow).radius = 5;
        this.scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.35);
        fill.position.set(-6, 4, 8); this.scene.add(fill);

        // Boden (nur Schatten)
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.30 }));
        ground.rotation.x = -Math.PI / 2; ground.position.y = -0.85; ground.receiveShadow = true;
        this.scene.add(ground);

        // Gruppen
        this.spinGroup = new THREE.Group();
        const layGroup = new THREE.Group(); layGroup.rotation.x = -Math.PI / 2;
        this.spinGroup.add(layGroup); this.scene.add(this.spinGroup);
        this.slicesGroup = new THREE.Group(); layGroup.add(this.slicesGroup);

        this.clock = new THREE.Clock();
        this.updateCamera();
    }

    private makeToonGradient(): THREE.Texture {
        const c = document.createElement("canvas"); c.width = 3; c.height = 1;
        const ctx = c.getContext("2d");
        ["#3a3a3a", "#8c8c8c", "#ffffff"].forEach((col, i) => { ctx.fillStyle = col; ctx.fillRect(i, 0, 1, 1); });
        const t = new THREE.CanvasTexture(c);
        t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter;
        t.generateMipmaps = false; t.needsUpdate = true;
        return t;
    }

    // ==================================================================
    //  Statische Deko: Kulleraugen + Comic-Bursts
    // ==================================================================
    private buildStaticDecor(): void {
        // --- Kulleraugen ---
        const EYE_Y = DEPTH + 0.72, EYE_XL = -0.6, EYE_XR = 0.6, EYE_Z = 0.15;
        this.eyeGroup = new THREE.Group();
        this.eyeL = this.circleSprite(1.0, "#ffffff", 10);
        this.eyeR = this.circleSprite(1.0, "#ffffff", 10);
        this.pupL = this.circleSprite(0.42, "#141414", 0);
        this.pupR = this.circleSprite(0.42, "#141414", 0);
        this.eyeL.renderOrder = 30; this.eyeR.renderOrder = 30;
        this.pupL.renderOrder = 31; this.pupR.renderOrder = 31;
        this.eyeL.position.set(EYE_XL, EYE_Y, EYE_Z);
        this.eyeR.position.set(EYE_XR, EYE_Y, EYE_Z);
        this.eyeGroup.add(this.eyeL, this.eyeR, this.pupL, this.pupR);
        this.scene.add(this.eyeGroup);

        // --- Comic-Bursts (Spruchwelt wird pro Theme neu gebaut) ---
        this.burstGroup = new THREE.Group();
        this.scene.add(this.burstGroup);
        this.rebuildBursts(THEMES.standard.bursts, "standard");
    }

    /** Baut die kreisenden Comic-Bursts für die aktuelle Spruchwelt neu auf. */
    private rebuildBursts(words: BurstWord[], themeKey: string): void {
        // Alte Sprites entsorgen
        this.bursts.forEach(b => {
            this.burstGroup.remove(b.sprite);
            if (b.mat.map) b.mat.map.dispose();
            b.mat.dispose();
        });
        this.bursts = [];

        const n = Math.min(BURST_GEO.length, words.length);
        for (let i = 0; i < n; i++) {
            const g = BURST_GEO[i], word = words[i];
            const b = this.makeBurst(word.w, word.f, word.t);
            this.burstGroup.add(b.sprite);
            this.bursts.push({
                sprite: b.sprite, mat: b.mat, angle: (i / n) * Math.PI * 2,
                R: g.R, baseY: g.y, spd: g.spd, bobA: g.bobA, bobF: g.bobF, ph: i * 1.3, spin: g.spin, baseS: g.s
            });
        }
        this.builtBurstTheme = themeKey;
    }

    private circleSprite(diam: number, fill: string, strokeW: number): THREE.Sprite {
        const S = 128, c = document.createElement("canvas"); c.width = c.height = S;
        const ctx = c.getContext("2d");
        ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - strokeW, 0, Math.PI * 2);
        ctx.fillStyle = fill; ctx.fill();
        if (strokeW > 0) { ctx.lineWidth = strokeW * 2; ctx.strokeStyle = "#141414"; ctx.stroke(); }
        const t = new THREE.CanvasTexture(c);
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
        s.scale.set(diam, diam, 1); return s;
    }

    private makeBurst(word: string, fill: string, txt: string): { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; } {
        const S = 256, c = document.createElement("canvas"); c.width = c.height = S;
        const ctx = c.getContext("2d");
        const cx = S / 2, cy = S / 2, spikes = 12, rO = S * 0.46, rI = S * 0.30;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const rr = (i % 2 === 0) ? rO : rI, a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
            const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        ctx.lineWidth = 10; ctx.strokeStyle = "#141414"; ctx.stroke();
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "900 " + (word.length > 4 ? 50 : 64) + "px Impact,'Arial Black',sans-serif";
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
        ctx.lineWidth = 8; ctx.strokeStyle = "#141414"; ctx.strokeText(word, 0, 0);
        ctx.fillStyle = txt; ctx.fillText(word, 0, 0); ctx.restore();
        const t = new THREE.CanvasTexture(c);
        const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false });
        const s = new THREE.Sprite(m); s.scale.set(2.0, 2.0, 1);
        return { sprite: s, mat: m };
    }

    // ==================================================================
    //  Sprechblasen-Label
    // ==================================================================
    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
        ctx.beginPath(); ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }

    private makeLabel(top: string, big: string, color: string): THREE.Sprite {
        const w = 512, h = 256, c = document.createElement("canvas"); c.width = w; c.height = h;
        const ctx = c.getContext("2d"); const x = 26, y = 22, bw = 452, bh = 176, r = 44;
        ctx.save(); ctx.shadowColor = "rgba(20,20,20,.35)"; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 8;
        this.roundRect(ctx, x, y, bw, bh, r); ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore();
        ctx.lineWidth = 14; ctx.strokeStyle = "#141414"; this.roundRect(ctx, x, y, bw, bh, r); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 52, y + bh / 2, 30, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = "#141414"; ctx.stroke();
        ctx.fillStyle = "#141414"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.font = "600 52px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(this.truncate(ctx, top, bw - 120), x + 100, y + bh / 2 - 30);
        ctx.font = "900 84px Impact, 'Arial Black', sans-serif"; ctx.fillText(big, x + 100, y + bh / 2 + 42);
        const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4; tex.needsUpdate = true;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: true }));
        const scl = 1.45, ar = w / h; sp.scale.set(scl * ar, scl, 1); sp.renderOrder = 5;
        return sp;
    }

    private truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
        if (ctx.measureText(text).width <= maxW) return text;
        let t = text;
        while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
        return t + "…";
    }

    // ==================================================================
    //  Torte aus den Report-Daten bauen
    // ==================================================================
    private disposeSlices(): void {
        this.slices.forEach(s => {
            if (!s.holder) return;
            this.slicesGroup.remove(s.holder);
            s.holder.traverse((o: THREE.Object3D) => {
                const anyO = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material & { map?: THREE.Texture }; };
                if (anyO.geometry) anyO.geometry.dispose();
                if (anyO.material) { if (anyO.material.map) anyO.material.map.dispose(); anyO.material.dispose(); }
            });
        });
        this.slices = [];
    }

    private buildSlices(): void {
        this.disposeSlices();
        const data = this.dataPoints;
        const total = data.reduce((a, d) => a + Math.max(0, d.value), 0) || 1;
        const showLabels = this.settings.style.showLabels.value;
        const outline = this.settings.style.outline.value;
        let start = Math.PI / 2;

        data.forEach((d, i) => {
            const frac = Math.max(0, d.value) / total, ang = frac * Math.PI * 2, end = start + ang, mid = start + ang / 2;
            const pct = Math.round(frac * 100);

            const shape = new THREE.Shape();
            shape.moveTo(0, 0); shape.absarc(0, 0, RADIUS, start, end, false); shape.lineTo(0, 0);
            const geo = new THREE.ExtrudeGeometry(shape, {
                depth: DEPTH, curveSegments: 64,
                bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 4
            });
            geo.computeVertexNormals();

            const col = this.getSliceColor(i, d.color);
            const mat = new THREE.MeshToonMaterial({ color: new THREE.Color(col), gradientMap: this.grad });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData.sliceIndex = i;

            const holder = new THREE.Group();

            if (outline) {
                const outlineMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x141414, side: THREE.BackSide }));
                outlineMesh.scale.setScalar(1.06); outlineMesh.castShadow = false; outlineMesh.receiveShadow = false;
                holder.add(outlineMesh);
                const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 32), new THREE.LineBasicMaterial({ color: 0x141414 }));
                holder.add(line);
            }

            holder.add(mesh);

            if (showLabels) {
                const label = this.makeLabel(d.label, pct + "%", col);
                label.position.set(Math.cos(mid) * RADIUS * 0.5, Math.sin(mid) * RADIUS * 0.5, DEPTH + 0.85);
                holder.add(label);
            }

            this.slicesGroup.add(holder);

            d.mid = mid; d.holder = holder; d.mesh = mesh;
            d.dir = { x: Math.cos(mid), y: Math.sin(mid) };
            d.dist = 0; d.vel = 0; d.selected = d.selected || false;
            this.slices.push(d);
            start = end;
        });
        this.currentExplode = 0;
        this.applyOpacity();
    }

    /** Farbe eines Stücks: Theme-Farbwelt gewinnt, sonst Report-/Palette-Farbe. */
    private getSliceColor(index: number, dataColor: string): string {
        if (this.activeThemeColors && this.activeThemeColors.length) {
            return this.activeThemeColors[index % this.activeThemeColors.length];
        }
        return dataColor;
    }

    // ==================================================================
    //  Interaktion
    // ==================================================================
    private dragging = false; private moved = false;
    private lastX = 0; private lastY = 0; private downX = 0; private downY = 0;

    private attachEvents(): void {
        const dom = this.renderer.domElement;

        dom.addEventListener("pointerdown", (e: PointerEvent) => {
            this.dragging = true; this.moved = false;
            this.lastX = this.downX = e.clientX; this.lastY = this.downY = e.clientY;
            dom.style.cursor = "grabbing";
            try { dom.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        });
        dom.addEventListener("pointermove", (e: PointerEvent) => {
            if (!this.dragging) return;
            const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
            this.lastX = e.clientX; this.lastY = e.clientY;
            if (Math.abs(e.clientX - this.downX) + Math.abs(e.clientY - this.downY) > 6) this.moved = true;
            this.camTheta -= dx * 0.008; this.camPhi -= dy * 0.008; this.updateCamera();
        });
        dom.addEventListener("pointerup", (e: PointerEvent) => {
            this.dragging = false; dom.style.cursor = "grab";
            if (!this.moved) this.pickSlice(e.clientX, e.clientY);
        });
        dom.addEventListener("wheel", (e: WheelEvent) => {
            e.preventDefault(); this.camRadius += e.deltaY * 0.012; this.updateCamera();
        }, { passive: false });

        // Klick ins Leere hebt Auswahl auf
        this.container.addEventListener("contextmenu", (e: MouseEvent) => {
            e.preventDefault();
            this.selectionManager.showContextMenu({}, { x: e.clientX, y: e.clientY });
        });
    }

    private updateCamera(): void {
        this.camPhi = Math.max(0.28, Math.min(1.45, this.camPhi));
        this.camRadius = Math.max(9, Math.min(34, this.camRadius));
        this.camera.position.set(
            this.target.x + this.camRadius * Math.sin(this.camPhi) * Math.sin(this.camTheta),
            this.target.y + this.camRadius * Math.cos(this.camPhi),
            this.target.z + this.camRadius * Math.sin(this.camPhi) * Math.cos(this.camTheta));
        this.camera.lookAt(this.target);
    }

    private pickSlice(cx: number, cy: number): void {
        const r = this.renderer.domElement.getBoundingClientRect();
        this.ndc.x = ((cx - r.left) / r.width) * 2 - 1;
        this.ndc.y = -((cy - r.top) / r.height) * 2 + 1;
        this.ray.setFromCamera(this.ndc, this.camera);
        const meshes = this.slices.map(s => s.mesh).filter(Boolean) as THREE.Object3D[];
        const hits = this.ray.intersectObjects(meshes, false);
        if (hits.length) {
            const idx = hits[0].object.userData.sliceIndex;
            if (idx != null && this.slices[idx]) this.selectSlice(idx);
        } else {
            // ins Leere geklickt -> Auswahl aufheben
            this.selectionManager.clear();
            this.slices.forEach(s => s.selected = false);
            this.applyOpacity();
        }
    }

    private selectSlice(idx: number): void {
        const slice = this.slices[idx];
        const nowSelected = !slice.selected;
        // Multi-Select mit Strg/Meta wäre möglich; wir nutzen Single-Select-Toggle.
        this.slices.forEach(s => s.selected = false);
        slice.selected = nowSelected;

        if (nowSelected) {
            this.selectionManager.select(slice.selectionId);
        } else {
            this.selectionManager.clear();
        }
        this.applyOpacity();
    }

    /** Nicht ausgewählte Stücke leicht abdunkeln, wenn eine Auswahl aktiv ist. */
    private applyOpacity(): void {
        const anySelected = this.slices.some(s => s.selected);
        this.slices.forEach(s => {
            if (!s.mesh) return;
            const mat = s.mesh.material as THREE.MeshToonMaterial;
            const dim = anySelected && !s.selected;
            mat.opacity = dim ? 0.35 : 1.0;
            mat.transparent = dim;
            mat.needsUpdate = true;
        });
    }

    // ==================================================================
    //  Animationsschleife
    // ==================================================================
    private animate = (): void => {
        this.rafId = requestAnimationFrame(this.animate);
        const dt = Math.min(this.clock.getDelta(), 0.05);
        const t = this.clock.getElapsedTime();

        // Wackel-Tanz + Schweben (im EXPLODE-Modus rast alles)
        const effSpeed = this.explodeMode ? 34 : this.spinSpeed;
        if ((this.spinning || this.explodeMode) && !this.dragging) this.spinYaw += effSpeed * dt;
        this.spinGroup.rotation.y = this.spinYaw;
        if (this.wobble || this.explodeMode) {
            const amp = this.explodeMode ? 4 : 1;
            this.spinGroup.rotation.z = Math.sin(t * 1.15) * 0.07 * amp;
            this.spinGroup.rotation.x = Math.sin(t * 0.9 + 1.0) * 0.05 * amp;
            this.spinGroup.position.y = Math.sin(t * 1.7) * 0.16;
        } else {
            this.spinGroup.rotation.z = 0; this.spinGroup.rotation.x = 0; this.spinGroup.position.y = 0;
        }

        // Explosion: Slider glätten, im EXPLODE-Modus voll aufreißen
        const effExplode = this.explodeMode ? 3.4 : this.targetExplode;
        this.currentExplode += (effExplode - this.currentExplode) * Math.min(1, dt * 5);
        for (const s of this.slices) {
            if (!s.dir) continue;
            const tgt = this.currentExplode + (s.selected ? POP_EXTRA : 0);
            const acc = (tgt - s.dist) * SPRING_K - s.vel * SPRING_D;
            s.vel += acc * dt; s.dist += s.vel * dt;
            s.holder.position.x = s.dir.x * s.dist;
            s.holder.position.y = s.dir.y * s.dist;
        }

        // Kulleraugen zappeln
        if (this.eyeGroup.visible) {
            const EYE_Y = DEPTH + 0.72, EYE_XL = -0.6, EYE_XR = 0.6, EYE_Z = 0.15, pw = 0.15;
            this.pupL.position.set(EYE_XL + Math.sin(t * 2.6) * pw, EYE_Y + Math.sin(t * 3.3 + 1.0) * pw * 0.8 - 0.05, EYE_Z + 0.02);
            this.pupR.position.set(EYE_XR + Math.sin(t * 2.6 + 0.4) * pw, EYE_Y + Math.sin(t * 3.3 + 1.5) * pw * 0.8 - 0.05, EYE_Z + 0.02);
        }

        // Bursts kreisen, drehen, pulsieren
        if (this.burstGroup.visible) {
            const burstBoost = this.explodeMode ? 6 : 1;
            for (const b of this.bursts) {
                b.angle += b.spd * dt * burstBoost;
                b.sprite.position.set(Math.cos(b.angle) * b.R, b.baseY + Math.sin(t * b.bobF + b.ph) * b.bobA, Math.sin(b.angle) * b.R);
                b.mat.rotation += b.spin * dt * burstBoost;
                const sc = b.baseS * (1 + 0.09 * Math.sin(t * 3.5 + b.ph)); b.sprite.scale.set(sc, sc, 1);
            }
        }

        this.renderer.render(this.scene, this.camera);
    };

    // ==================================================================
    //  Power BI Lifecycle
    // ==================================================================
    public update(options: VisualUpdateOptions): void {
        this.events.renderingStarted(options);
        this.settings = this.formattingSettingsService.populateFormattingSettingsModel(VisualSettings, options.dataViews?.[0]);

        // Größe
        const vp = options.viewport;
        this.width = Math.max(1, Math.floor(vp.width));
        this.height = Math.max(1, Math.floor(vp.height));
        this.renderer.setSize(this.width, this.height, false);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        // Einstellungen anwenden
        const a = this.settings.animation, st = this.settings.style;
        this.targetExplode = a.explosion.value;
        this.spinSpeed = a.spinSpeed.value;
        this.spinning = a.spinning.value;
        this.wobble = a.wobble.value;
        this.eyeGroup.visible = st.showEyes.value;
        this.burstGroup.visible = st.showBursts.value;

        // Film-Motto (persistierter Wert / Format-Pane-Dropdown)
        const rawPreset = this.settings.theme.preset.value as unknown;
        let preset = "standard";
        if (rawPreset && typeof rawPreset === "object" && (rawPreset as powerbi.IEnumMember).value) {
            preset = String((rawPreset as powerbi.IEnumMember).value);
        } else if (typeof rawPreset === "string") {
            preset = rawPreset;
        }
        if (!THEMES[preset]) preset = "standard";
        this.currentTheme = preset;
        this.activeThemeColors = THEMES[preset].colors;
        if (this.builtBurstTheme !== preset) this.rebuildBursts(THEMES[preset].bursts, preset);
        this.updateThemeButtons();

        // Daten lesen + Torte bauen
        try {
            this.parseDataView(options.dataViews?.[0]);
            this.buildColorSlices();
            this.buildSlices();
            this.events.renderingFinished(options);
        } catch (e) {
            this.events.renderingFailed(options, String(e));
        }
    }

    private lastDataKey = "";

    private parseDataView(dv: DataView | undefined): boolean {
        const empty = !dv || !dv.categorical || !dv.categorical.categories || !dv.categorical.categories.length
            || !dv.categorical.values || !dv.categorical.values.length;

        if (empty) {
            this.dataPoints = [];
            this.lastDataKey = "";
            this.showPlaceholder(true);
            return true;
        }
        this.showPlaceholder(false);

        const cat: DataViewCategorical = dv.categorical;
        const category = cat.categories[0];
        const valueCol = cat.values[0];
        const n = category.values.length;

        const points: SliceDatum[] = [];
        for (let i = 0; i < n; i++) {
            const label = category.values[i] == null ? "(leer)" : String(category.values[i]);
            const value = Number(valueCol.values[i]) || 0;
            const color = this.getCategoryColor(category, i);
            const selectionId = this.host.createSelectionIdBuilder()
                .withCategory(category, i)
                .createSelectionId();
            points.push({ label, value, color, selectionId });
        }
        this.dataPoints = points;

        const key = points.map(p => p.label + ":" + p.value + ":" + p.color).join("|");
        const changed = key !== this.lastDataKey;
        this.lastDataKey = key;
        return changed;
    }

    private getCategoryColor(category: powerbi.DataViewCategoryColumn, index: number): string {
        // 1. Manuelle Überschreibung aus dem Formatierungsbereich
        const objects = category.objects && category.objects[index];
        if (objects && objects["dataPoint"] && objects["dataPoint"]["fill"]) {
            const fill = objects["dataPoint"]["fill"] as powerbi.Fill;
            if (fill && fill.solid && fill.solid.color) return fill.solid.color as string;
        }
        // 2. Theme-Palette
        try {
            const key = category.values[index] == null ? String(index) : String(category.values[index]);
            const col = this.host.colorPalette.getColor(key);
            if (col && col.value) return col.value;
        } catch (_) { /* fallback below */ }
        // 3. Comic-Fallback
        return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    }

    /** Baut pro Kategorie einen Farbwähler in die "Farben"-Karte. */
    private buildColorSlices(): void {
        const slices: formattingSettings.Slice[] = this.dataPoints.map(dp => {
            return new formattingSettings.ColorPicker({
                name: "fill",
                displayName: dp.label,
                value: { value: dp.color },
                selector: (dp.selectionId as powerbi.visuals.ISelectionId).getSelector()
            });
        });
        this.settings.dataColors.slices = slices;
    }

    private placeholderEl: HTMLElement | null = null;
    private showPlaceholder(show: boolean): void {
        if (show) {
            if (!this.placeholderEl) {
                const el = document.createElement("div");
                el.className = "comic-placeholder";
                el.innerHTML = "<div class='card'>🥧 Zieh eine <b>Kategorie</b> und einen <b>Wert</b> ins Feld – dann wird gepoppt! 💥</div>";
                this.container.appendChild(el);
                this.placeholderEl = el;
            }
            this.placeholderEl.style.display = "flex";
        } else if (this.placeholderEl) {
            this.placeholderEl.style.display = "none";
        }
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.settings);
    }

    public destroy(): void {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.disposeSlices();
        if (this.renderer) this.renderer.dispose();
    }
}
