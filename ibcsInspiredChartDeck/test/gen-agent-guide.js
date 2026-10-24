#!/usr/bin/env node
/* eslint-disable powerbi-visuals/non-literal-fs-path -- Build-Skript, kein Visual-Code:
   liest/schreibt nur Repo-Dateien relativ zu __dirname */
// Erzeugt die Property-Referenz in AGENT-GUIDE.md aus dem Paket selbst:
//   capabilities.json  -> Objekte, Properties, Typen, Enum-Werte, Rollen
//   src/settings.ts    -> Standardwerte, deutsche Beschreibungen, Pane-Reihenfolge,
//                         Gruppen, Enum-Labels (per Text-Parsing, ohne TypeScript-Compiler)
//   stringResources/de-DE/resources.resjson -> deutsche Enum-/Gruppen-/Rollen-Namen
//                         (Fallback: der englische Literal-Text aus settings.ts/capabilities.json)
// Der Text steht zwischen <!-- gen:properties:start --> und <!-- gen:properties:end -->.
// Alles ausserhalb der Marker bleibt byte-identisch.
//
//   node test/gen-agent-guide.js          schreiben
//   node test/gen-agent-guide.js --check  Exit 1, wenn die Datei vom Generat abweicht
//   node test/gen-agent-guide.js --stdout nur ausgeben (kein Schreiben)
//   Exit 3: Parser-/Drift-Warnung (Pane-Property ohne capabilities.json-Eintrag, Enum-Werte
//   ungleich, Standardwert nicht lesbar …) — schreibt und prueft dann nichts.
//   npm run guide / npm run guide:check

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GUIDE = path.join(ROOT, "AGENT-GUIDE.md");
const START = "<!-- gen:properties:start -->";
const END = "<!-- gen:properties:end -->";
const MAX_DESC = 220;   // Beschreibung in Tabellenzellen: ganze Saetze bis ca. so viel Zeichen
const MAX_LINE = 295;   // harte Obergrenze je Tabellenzeile (Lesbarkeit)

const warnings = [];
const warn = m => warnings.push(m);

// ---------------------------------------------------------------- TS-Textparser

/** Index der schliessenden Klammer zu src[open] (( { [), ueberspringt Strings und Kommentare. */
function matchClose(src, open) {
    const pairs = { "(": ")", "{": "}", "[": "]" };
    let depth = 0;
    for (let i = open; i < src.length; i++) {
        const c = src[i];
        if (c === '"' || c === "'" || c === "`") { i = skipString(src, i); continue; }
        if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); if (i < 0) { break; } continue; }
        if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i + 2) + 1; continue; }
        if (c in pairs) { depth++; }
        else if (c === ")" || c === "}" || c === "]") { depth--; if (depth === 0) { return i; } }
    }
    throw new Error("Klammer ab Position " + open + " nicht geschlossen");
}

function skipString(src, i) {
    const q = src[i];
    for (i++; i < src.length; i++) {
        if (src[i] === "\\") { i++; continue; }
        if (src[i] === q) { return i; }
    }
    throw new Error("String nicht geschlossen");
}

/** Objekt-Literal "{ a: 1, b: [..] }" -> { a: "1", b: "[..]" } (Rohtext je Top-Level-Schluessel). */
function splitTop(objText) {
    const body = objText.slice(1, -1);
    const out = {};
    let i = 0;
    while (i < body.length) {
        // Leerraum, Kommentare, Kommas
        while (i < body.length) {
            if (/[\s,]/.test(body[i])) { i++; }
            else if (body[i] === "/" && body[i + 1] === "/") { i = body.indexOf("\n", i); if (i < 0) { i = body.length; } }
            else if (body[i] === "/" && body[i + 1] === "*") { i = body.indexOf("*/", i + 2) + 2; }
            else { break; }
        }
        const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(body.slice(i));
        if (!m) { break; }
        const key = m[1];
        i += m[0].length;
        const vs = i;
        let depth = 0;
        for (; i < body.length; i++) {
            const c = body[i];
            if (c === '"' || c === "'" || c === "`") { i = skipString(body, i); continue; }
            if (c === "/" && body[i + 1] === "/") { i = body.indexOf("\n", i); if (i < 0) { i = body.length; } continue; }
            if (c === "/" && body[i + 1] === "*") { i = body.indexOf("*/", i + 2) + 1; continue; }
            if (c === "(" || c === "{" || c === "[") { depth++; }
            else if (c === ")" || c === "}" || c === "]") { depth--; }
            else if (c === "," && depth === 0) { break; }
        }
        out[key] = stripComments(body.slice(vs, i)).trim();
    }
    return out;
}

function stripComments(s) {
    let out = "";
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (c === '"' || c === "'" || c === "`") { const e = skipString(s, i); out += s.slice(i, e + 1); i = e; }
        else if (c === "/" && s[i + 1] === "/") { const e = s.indexOf("\n", i); if (e < 0) { break; } i = e - 1; }
        else if (c === "/" && s[i + 1] === "*") { i = s.indexOf("*/", i + 2) + 1; }
        else { out += c; }
    }
    return out;
}

/** "a" + "b" -> String; null, wenn der Rohtext kein reiner String-Ausdruck ist. */
function evalString(raw) {
    if (raw === undefined) { return null; }
    const parts = [];
    let rest = raw.trim();
    for (;;) {
        const q = rest[0];
        if (q !== '"' && q !== "'") { return null; }
        const end = skipString(rest, 0);
        const lit = rest.slice(0, end + 1);
        try {
            parts.push(q === '"' ? JSON.parse(lit) : JSON.parse('"' + lit.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"') + '"'));
        } catch (e) { return null; }
        rest = rest.slice(end + 1).trim();
        if (rest === "") { return parts.join(""); }
        if (rest[0] !== "+") { return null; }
        rest = rest.slice(1).trim();
    }
}

/** const xItems: ...[] = [ { value, displayName, key? }, ... ]  ->  { xItems: [{value,label,key}] } */
function parseItemLists(src) {
    const lists = {};
    const rx = /const\s+(\w+Items)\s*:[^=]*=\s*\[/g;
    let m;
    while ((m = rx.exec(src))) {
        const open = m.index + m[0].length - 1;
        const close = matchClose(src, open);
        const body = src.slice(open + 1, close);
        const items = [];
        const ix = /\{[^{}]*\}/g;
        let im;
        while ((im = ix.exec(stripComments(body)))) {
            const o = splitTop(im[0]);
            const value = evalString(o.value), label = evalString(o.displayName);
            if (value === null || label === null) { warn("Enum-Eintrag nicht lesbar in " + m[1] + ": " + im[0]); continue; }
            items.push({ value, label, key: evalString(o.key) });
        }
        lists[m[1]] = items;
    }
    return lists;
}

const SLICE_TYPES = { ToggleSwitch: "bool", TextInput: "text", ItemDropdown: "enum", NumUpDown: "numeric", ColorPicker: "color" };

/** Alle Karten-Klassen aus settings.ts: { cardName, fields{field->slice}, groups[{field,name,keyDisplay,slices[]}], order[] }. */
function parseSettings(src, lists) {
    const classes = [];
    const rx = /export class (\w+Settings)\s+extends[^{]*\{/g;
    let m;
    while ((m = rx.exec(src))) {
        const open = m.index + m[0].length - 1;
        classes.push({ cls: m[1], body: src.slice(open + 1, matchClose(src, open)) });
    }
    const cards = [];
    for (const c of classes) {
        const cardName = /\bname:\s*string\s*=\s*"(\w+)"/.exec(c.body);
        if (!cardName) { continue; }   // z. B. VisualFormattingSettingsModel
        const card = {
            cls: c.cls, name: cardName[1],
            displayNameKey: ((/displayNameKey:\s*string\s*=\s*"(\w+)"/.exec(c.body)) || [])[1],
            displayName: ((/displayName:\s*string\s*=\s*"([^"]*)"/.exec(c.body)) || [])[1],
            fields: {}, groups: {}, order: null
        };
        const fx = /^    (\w+)\s*=\s*new formattingSettings\.(\w+)\(/gm;
        let fm;
        while ((fm = fx.exec(c.body))) {
            const open = fm.index + fm[0].length - 1;
            const close = matchClose(c.body, c.body.indexOf("(", fm.index + fm[1].length));
            const objStart = c.body.indexOf("{", open);
            const obj = splitTop(c.body.slice(objStart, matchClose(c.body, objStart) + 1));
            if (fm[2] === "Group") {
                card.groups[fm[1]] = {
                    field: fm[1], name: evalString(obj.name), label: evalString(obj.displayName),
                    key: evalString(obj.displayNameKey),
                    slices: [...(obj.slices || "").matchAll(/this\.(\w+)/g)].map(x => x[1])
                };
            } else if (SLICE_TYPES[fm[2]]) {
                card.fields[fm[1]] = sliceInfo(fm[1], fm[2], obj, lists, c.cls);
            } else {
                warn(c.cls + "." + fm[1] + ": unbekannter Slice-Typ " + fm[2]);
            }
            fx.lastIndex = close;
        }
        const groupsDecl = /\bgroups\s*=\s*\[([^\]]*)\]/.exec(c.body);
        const slicesDecl = /\bslices\s*:\s*Array<[^>]*>\s*=\s*\[([^\]]*)\]/.exec(c.body);
        if (groupsDecl) { card.order = { groups: [...groupsDecl[1].matchAll(/this\.(\w+)/g)].map(x => x[1]) }; }
        else if (slicesDecl) { card.order = { slices: [...slicesDecl[1].matchAll(/this\.(\w+)/g)].map(x => x[1]) }; }
        else { warn(c.cls + ": weder groups noch slices gefunden"); card.order = { slices: Object.keys(card.fields) }; }
        cards.push(card);
    }
    return cards;
}

function sliceInfo(field, type, obj, lists, cls) {
    const info = { field, type: SLICE_TYPES[type], name: evalString(obj.name), desc: evalString(obj.description), def: undefined, items: null, min: null, max: null };
    if (!info.name) { warn(cls + "." + field + ": name nicht lesbar"); }
    const v = obj.value;
    if (type === "ItemDropdown") {
        const im = /^(\w+Items)\[(\d+)\]$/.exec(v || "");
        const itemsName = (obj.items || "").trim();
        info.items = lists[itemsName] || null;
        if (!info.items) { warn(cls + "." + field + ": Item-Liste " + itemsName + " nicht gefunden"); }
        else if (im && im[1] === itemsName && info.items[+im[2]]) { info.def = info.items[+im[2]].value; }
        else { warn(cls + "." + field + ": Standardwert nicht lesbar: " + v); }
    } else if (type === "ToggleSwitch") {
        if (v === "true" || v === "false") { info.def = v === "true"; } else { warn(cls + "." + field + ": Standardwert nicht lesbar: " + v); }
    } else if (type === "NumUpDown") {
        if (/^-?\d+(\.\d+)?$/.test(v || "")) { info.def = Number(v); } else { warn(cls + "." + field + ": Standardwert nicht lesbar: " + v); }
        const o = obj.options || "";
        const mn = /minValue:\s*\{[^}]*?value:\s*(-?[\d.]+)/.exec(o), mx = /maxValue:\s*\{[^}]*?value:\s*(-?[\d.]+)/.exec(o);
        info.min = mn ? Number(mn[1]) : null; info.max = mx ? Number(mx[1]) : null;
    } else if (type === "TextInput") {
        const s = evalString(v);
        if (s !== null) { info.def = s; } else { warn(cls + "." + field + ": Standardwert nicht lesbar: " + v); }
    } else if (type === "ColorPicker") {
        const cm = /value:\s*"(#[0-9A-Fa-f]{3,8})"/.exec(v || "");
        if (cm) { info.def = cm[1].toUpperCase(); } else { warn(cls + "." + field + ": Standardfarbe nicht lesbar: " + v); }
    }
    return info;
}

// ---------------------------------------------------------------- Ausgabe-Bausteine

function readResjson(file) {
    try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return {}; }
}

const ABBR = [/z\. ?B\./g, /d\. ?h\./g, /u\. ?a\./g, /z\. ?T\./g, /bzw\./g, /ca\./g, /ggf\./g, /inkl\./g, /vs\./g, /Nr\./g, /max\./g, /min\./g, /ab \d+\.\d+/g, /\d+\.\d+/g];

/** Beschreibung fuer eine Tabellenzelle: ganze Saetze bis MAX_DESC Zeichen (mind. der erste, ggf. an Wortgrenze gekuerzt). */
function shorten(text) {
    if (!text) { return ""; }
    let t = text.replace(/\s+/g, " ").trim();
    const prot = [];
    ABBR.forEach(rx => { t = t.replace(rx, x => { prot.push(x); return "\u0001" + (prot.length - 1) + "\u0002"; }); });
    const sentences = t.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ„"(`])/);
    const restore = s => s.replace(/\u0001(\d+)\u0002/g, (_, n) => prot[+n]);
    let out = "", dropped = false;
    for (let i = 0; i < sentences.length; i++) {
        const s = restore(sentences[i]);
        if (i === 0) { out = s; }
        else if ((out + " " + s).length <= MAX_DESC) { out += " " + s; }
        else { dropped = true; break; }
    }
    if (out.length > MAX_DESC + 40) {
        out = out.slice(0, MAX_DESC).replace(/\s+\S*$/, "").replace(/[,;:(\s]+$/, "");
        dropped = true;
    }
    return dropped ? out.replace(/[.\s]+$/, "") + " …" : out;
}

const esc = s => String(s).replace(/\|/g, "\\|");
const code = s => "`" + s + "`";

function defText(info) {
    if (info.def === undefined) { return "–"; }
    if (info.type === "text") { return info.def === "" ? "leer" : code(info.def); }
    return code(String(info.def));
}

function typeText(capType) {
    if (capType.bool) { return "bool"; }
    if (capType.text) { return "text"; }
    if (capType.numeric) { return "numeric"; }
    if (capType.integer) { return "integer"; }
    if (capType.enumeration) { return "enum"; }
    if (capType.fill) { return "color"; }
    if (capType.formatting) { return "fontSize (pt)"; }
    return Object.keys(capType).join("/");
}

function capValues(capType) { return capType.enumeration ? capType.enumeration.map(e => e.value) : null; }

function wrapBullet(lead, parts, width) {
    const lines = [];
    let cur = lead;
    parts.forEach((p, i) => {
        const piece = p + (i < parts.length - 1 ? ";" : "");
        if (cur.length + piece.length + 1 > width && cur.trim() !== lead.trim() && cur !== lead) { lines.push(cur); cur = "  " + piece; }
        else { cur += (cur === lead ? "" : " ") + piece; }
    });
    lines.push(cur);
    return lines;
}

// ---------------------------------------------------------------- Generator

function generate() {
    const caps = JSON.parse(fs.readFileSync(path.join(ROOT, "capabilities.json"), "utf8"));
    const pbiviz = JSON.parse(fs.readFileSync(path.join(ROOT, "pbiviz.json"), "utf8"));
    const src = fs.readFileSync(path.join(ROOT, "src/settings.ts"), "utf8");
    const de = readResjson(path.join(ROOT, "stringResources/de-DE/resources.resjson"));

    const lists = parseItemLists(src);
    const cards = parseSettings(src, lists);
    const byCard = Object.fromEntries(cards.map(c => [c.name, c]));
    const version = (pbiviz.visual && pbiviz.visual.version) || "?";

    // Enum-Label: deutsch aus resjson (Schluessel aus settings.ts), sonst Literal
    const labelOf = it => (it.key && de[it.key]) || it.label;

    const L = [];
    const hiddenAll = [];
    L.push("Generiert von `test/gen-agent-guide.js` (`npm run guide`) aus `capabilities.json` und");
    L.push("`src/settings.ts`, Paketstand **" + version + "**. Nicht von Hand ändern — Korrekturen gehören in");
    L.push("`settings.ts`/`capabilities.json` (bzw. in die handgeschriebenen Abschnitte außerhalb dieses Blocks).");
    L.push("Beschreibungen sind die deutschen Pane-Tooltips, in Tabellen auf ganze Sätze bis ca. " + MAX_DESC + " Zeichen");
    L.push("gekürzt (`…` = gekürzt, Volltext in `src/settings.ts`). Enum-Labels stammen aus der");
    L.push("deutschen Oberfläche. „Standard“ ist der Wert, der ohne Eintrag in `visual.json` gilt.");
    L.push("");

    // ---- Rollen-Index
    L.push("### Rollen-Index");
    L.push("");
    L.push("`projections`-Namen aus `capabilities.json`; Semantik und Fallstricke siehe „Feld-Rollen (Datenvertrag)“.");
    L.push("");
    L.push("| Rolle | Kind | Anzeigename (DE) | Max. | Datentyp |");
    L.push("| --- | --- | --- | --- | --- |");
    const cond = (caps.dataViewMappings[0] && caps.dataViewMappings[0].conditions[0]) || {};
    for (const r of caps.dataRoles) {
        const nm = (r.displayNameKey && de[r.displayNameKey]) || r.displayName;
        const max = cond[r.name] && cond[r.name].max !== undefined ? cond[r.name].max : "–";
        const rt = r.requiredTypes ? r.requiredTypes.map(t => Object.keys(t)[0]).join(" / ") : "beliebig";
        L.push("| " + code(r.name) + " | " + r.kind + " | " + esc(nm) + " | " + max + " | " + rt + " |");
    }
    L.push("");

    // ---- Objekte
    const capObjects = caps.objects;
    const seenObj = new Set();
    // Reihenfolge wie im Pane (Karten-Reihenfolge der Settings-Klasse), danach Rest aus capabilities.json
    const paneOrder = ["chart", "ibcsTitle", "labels", "categoryAxis", "colors", "scale", "commentsPanel", "emptyState"];
    const objNames = [...paneOrder.filter(n => capObjects[n]), ...Object.keys(capObjects).filter(n => !paneOrder.includes(n))];

    for (const objName of objNames) {
        seenObj.add(objName);
        const cap = capObjects[objName].properties;
        const card = byCard[objName];
        if (!card) { warn("Objekt " + objName + " hat keine Karte in settings.ts"); }
        const cardLabel = card && ((card.displayNameKey && de[card.displayNameKey]) || card.displayName);
        L.push("### Objekt " + code(objName) + (cardLabel ? " (Karte „" + cardLabel + "“)" : ""));
        L.push("");

        // Pane-Reihenfolge: Gruppen in Kartenreihenfolge, darin Slices in Gruppenreihenfolge
        const sections = [];   // {label, fields[]}
        if (card) {
            if (card.order.groups) {
                for (const gf of card.order.groups) {
                    const g = card.groups[gf];
                    if (!g) { warn(objName + ": Gruppe " + gf + " nicht gefunden"); continue; }
                    sections.push({ label: (g.key && de[g.key]) || g.label, fields: g.slices });
                }
            } else {
                sections.push({ label: null, fields: card.order.slices });
            }
        }
        const used = new Set();
        const enumNotes = [];
        const rowsFor = (fields) => {
            const rows = [];
            for (const f of fields) {
                const info = card.fields[f];
                if (!info) { warn(objName + ": Slice " + f + " nicht gefunden"); continue; }
                const capP = cap[info.name];
                if (!capP) { warn(objName + "." + info.name + ": im Pane, aber nicht in capabilities.json"); continue; }
                used.add(info.name);
                rows.push(row(objName, info.name, capP, info, enumNotes));
            }
            return rows;
        };
        const emitTable = rows => {
            L.push("| Property | Typ | Standard | Werte / Beschreibung |");
            L.push("| --- | --- | --- | --- |");
            rows.forEach(r => L.push(r));
            L.push("");
        };

        function row(obj, name, capP, info, notes) {
            const parts = [];
            const vals = capValues(capP.type);
            if (vals) {
                parts.push(vals.map(code).join(" · "));
                if (info.items) {
                    const itemVals = info.items.map(i => i.value);
                    if (JSON.stringify(itemVals) !== JSON.stringify(vals)) {
                        warn(obj + "." + name + ": Enum-Werte in capabilities.json " + JSON.stringify(vals) + " ≠ settings.ts " + JSON.stringify(itemVals));
                    }
                    notes.push({ name, items: info.items });
                }
            }
            let desc = shorten(info && info.desc);
            if (info && info.type === "numeric" && (info.min !== null || info.max !== null)) {
                parts.push(info.min !== null && info.max !== null ? "Bereich " + info.min + "–" + info.max
                    : info.min !== null ? "Minimum " + info.min : "Maximum " + info.max);
            }
            if (desc) { parts.push(desc); }
            let cell = parts.join(" — ");
            const head = "| " + code(name) + " | " + typeText(capP.type) + " | " + defText(info) + " | ";
            const cap = MAX_LINE - head.length - 2;
            if (esc(cell).length > cap) { cell = cell.slice(0, cap - 2).replace(/[\s,;:(—]+\S*$/, "").replace(/[,;:(—\s]+$/, "") + " …"; }
            return head + esc(cell || "–") + " |";
        }

        for (const s of sections) {
            const rows = rowsFor(s.fields);
            if (!rows.length) { continue; }
            if (s.label && sections.length > 1) { L.push("**" + s.label + "**"); L.push(""); }
            emitTable(rows);
        }

        // in capabilities.json, aber nicht im Pane: persistierte / versteckte Zustaende
        const hidden = Object.keys(cap).filter(n => !used.has(n));
        if (hidden.length) {
            L.push("**Persistierte Zustände** (nicht im Format-Pane; das Visual schreibt sie per `persistProperties`, ein Agent kann sie");
            L.push("vorkonfigurieren — Formate siehe „Persistierte Zustände“ außerhalb dieses Blocks):");
            L.push("");
            const byType = {};
            hidden.forEach(n => { (byType[typeText(cap[n].type)] = byType[typeText(cap[n].type)] || []).push(n); });
            for (const [t, names] of Object.entries(byType)) {
                wrapBullet("- " + t + ": ", names.map(code), 110).forEach(l => L.push(l));
            }
            L.push("");
            hiddenAll.push(...hidden.map(n => objName + "." + n));
        }

        if (enumNotes.length) {
            L.push("Enum-Labels:");
            L.push("");
            for (const n of enumNotes) {
                const parts = n.items.map(i => code(i.value) + " = " + labelOf(i));
                wrapBullet("- " + code(n.name) + ": ", parts, 110).forEach(l => L.push(l));
            }
            L.push("");
        }
    }

    // Karten in settings.ts ohne Objekt in capabilities.json
    for (const c of cards) { if (!seenObj.has(c.name)) { warn("Karte " + c.name + " (settings.ts) fehlt in capabilities.json"); } }

    while (L.length && L[L.length - 1] === "") { L.pop(); }
    return { text: L.join("\n"), hiddenAll };
}

// ---------------------------------------------------------------- Einbetten / Check

function main() {
    const check = process.argv.includes("--check");
    const gen = generate();
    const generated = gen.text;
    if (process.argv.includes("--stdout")) { console.log(generated); }
    if (warnings.length) {
        console.error("Drift/Parser-Warnungen (capabilities.json ↔ settings.ts):\n" + warnings.map(w => "  - " + w).join("\n"));
        process.exit(process.argv.includes("--stdout") ? 0 : 3);
    }
    const doc = fs.readFileSync(GUIDE, "utf8");
    const a = doc.indexOf(START), b = doc.indexOf(END);
    if (a < 0 || b < 0 || b < a) {
        console.error("Marker " + START + " … " + END + " fehlen in AGENT-GUIDE.md");
        process.exit(2);
    }
    const outside = doc.slice(0, a) + doc.slice(b);
    for (const h of gen.hiddenAll) {
        if (!outside.includes("`" + h.split(".")[1] + "`")) {
            warn("persistierte Property " + h + " ist außerhalb der Marker nicht dokumentiert (Abschnitt „Persistierte Zustände“)");
        }
    }
    if (warnings.length) {
        console.error("Drift/Parser-Warnungen (capabilities.json ↔ settings.ts ↔ AGENT-GUIDE.md):\n" + warnings.map(w => "  - " + w).join("\n"));
        process.exit(3);
    }
    const eol = doc.includes("\r\n") ? "\r\n" : "\n";
    const next = doc.slice(0, a + START.length) + eol + generated.replace(/\n/g, eol) + eol + doc.slice(b);
    if (check) {
        if (next !== doc) {
            console.error("AGENT-GUIDE.md ist nicht aktuell: Property-Referenz weicht von capabilities.json/settings.ts ab. → npm run guide");
            process.exit(1);
        }
        console.log("AGENT-GUIDE.md aktuell (Property-Referenz stimmt mit capabilities.json + settings.ts überein).");
        return;
    }
    if (next === doc) { console.log("AGENT-GUIDE.md unverändert."); return; }
    fs.writeFileSync(GUIDE, next);
    console.log("AGENT-GUIDE.md aktualisiert (" + generated.split("\n").length + " Zeilen generiert).");
}

main();
