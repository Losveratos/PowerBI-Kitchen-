#!/usr/bin/env node
/*
 * Prüfskript für die Seiten von Teil 1 (Auftrag P6-E, Rolle 21).
 *
 * Rendert energiewende-1-story.html und energiewende-1-belege.html mit Playwright
 * (Chromium) bei 1280 px und 390 px Breite und prüft maschinell gegen den Datensatz
 * energiewende/data/teil1_data.json:
 *
 *   (a) Jeder sichtbare Satz mit Ziffer, Prozent, Euro oder Studienname stammt aus dem
 *       Datensatz. Abgleich als „Skelett“: Zahlen werden zu #, Platzhalter [[…]] zu #;
 *       jedes Satzstück der Seite muss als Teilfolge in einem Datensatz-Text vorkommen,
 *       und jede Zahl der Seite muss als Wert oder als Ziffernfolge im Datensatz stehen.
 *   (b) Aussagen stehen nur auf der Seite, die ihr `ort` erlaubt; verworfene Aussagen
 *       nirgends, verworfene Zahlen nur in der Tabelle „Verworfen“ der Belegseite.
 *   (c) Keine verbotene Formulierung außerhalb der Liste „verwenden wir nicht“.
 *   (d) Jede Zahl trägt beide Abzeichen (Zitat-Prüfung und Wert-Konfidenz), und sie
 *       stimmen mit dem Datensatz überein; der angezeigte Wert stimmt mit dem Datensatz
 *       und der Formatregel 7 der Freigabeliste überein.
 *   (e) Jede Aussage mit Vorbehalt (Pflicht bei „nicht prüfbar“) zeigt ihn im selben Absatz.
 *   (f) Alle Gegenpositionen stehen sichtbar da; in der Story als Kurzfassung mit einem
 *       Sprung zur Langfassung, der auf der Belegseite tatsächlich ankommt.
 *   (g) Kein Abruf an fremde Hosts, keine Konsolenfehler, kein leerer Platzhalter.
 *
 * Aufruf (im Wurzelverzeichnis des Repositorys):
 *   node energiewende/scripts/check_teil1_seiten.mjs [--verbose] [--json=<datei>]
 * Das Skript startet selbst einen lokalen Webserver auf 127.0.0.1 (freier Port).
 * Exit-Code 0 nur, wenn keine Prüfung scheitert; sonst 1 (2 bei Abbruch).
 */
import { createRequire } from "module";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATA_FILE = path.join(ROOT, "energiewende", "data", "teil1_data.json");
const PAGES = { story: "energiewende-1-story.html", belege: "energiewende-1-belege.html" };
const WIDTHS = [1280, 390];
const ARGS = process.argv.slice(2);
const VERBOSE = ARGS.includes("--verbose");
const JSON_OUT = (ARGS.find(a => a.startsWith("--json=")) || "").slice(7);

/* ------------------------------------------------------------------ Ausnahmen
 * Kurz und begründet. Jede Ausnahme nimmt ein Satzstück oder eine Zahl aus Prüfung (a)
 * heraus; sie gilt nur für die genannte Seite und Stelle.
 */
const AUSNAHMEN = [
  // Seitenrahmen: Zählungen, die die Seite zur Laufzeit aus dem Datensatz bildet
  // (Anzahl Zeilen, Filter-Chips, „Zahlen und Herkunft (n)“). Kein Tatsachensatz.
  { id: "A1", seite: "beide", rx: /^Zahlen und Herkunft \(\d+\)$/, grund: "Zählung der Zahlen je Absatz, zur Laufzeit aus dem Datensatz" },
  { id: "A2", seite: "belege", rx: /^(alle|bestätigt|korrigiert|Setzung \(M\)|nicht prüfbar) · \d+$/, grund: "Filter-Chip mit Zählung der Aussagen" },
  { id: "A3", seite: "belege", rx: /^\d+ (von \d+ Aussagen|Zeilen)$/, grund: "Zählung der Tabellenzeilen" },
  { id: "A4", seite: "belege", rx: /^(Zahlen mit dieser Angabe: \d+ von \d+|Anzahl: \d+)$/, grund: "Zählung aus meta.counts" },
  { id: "A5", seite: "belege", rx: /^Datensatz Version \d+ · Stand \d{4}-\d{2}-\d{2} · \d+ Aussagen auf dieser Seite · \d+ Zahlen · \d+ Quellen$/, grund: "Kopfzeile aus meta und Längen der Listen" },
  { id: "A6", seite: "beide", rx: /^\d+$/, grund: "nackte Zählung in Kachel oder Bilanz (Anzahl Korrekturen je Richtung, Phase) oder Quellennummer; Wert wird in (a2) gegen die Zählung geprüft", zaehlung: true },
  { id: "A7", seite: "story", rx: /^Lesezeit rund \d+ Minuten \([\d.]+ Wörter, gerechnet mit \d+ Wörtern je Minute\)$/, grund: "Leseangabe aus der Wortzahl der gebauten Seite; 200 Wörter je Minute ist eine Setzung im Seitencode (WPM)" },
  { id: "A8", seite: "story", rx: /^Datenstand \d{2}\.\d{2}\.\d{4} · Freigabeliste v\d+$/, grund: "Stand und Version aus meta" },
  { id: "A9", seite: "beide", rx: /^(Akt \d( · Schritt \d+)?|Teil \d|Akt \d · Schluss)$/i, grund: "Gliederung (Akt, Schritt, Teil der Reihe)" },
  { id: "A10", seite: "belege", rx: /^\d+ ?%$/, grund: "Achsenbeschriftung der Studiengrafik (0, 5, 10, 15 %)" },
  { id: "A11", seite: "story", rx: /^-?\d+(,\d+)?( ?(%|Mrd\. €|Bio\. €|Prozent))?$/, grund: "Achsenstriche der Story-Grafiken (axisSteps), keine Datenwerte", achse: true },
  { id: "A12", seite: "beide", rx: /^(Energiewende-Reihe der Daten-WG Knowledge Kitchen · Entwurf · Datensatz energiewende\/docs\/03_teil1_freigabe\.md, Stand \d{4}-\d{2}-\d{2}\.)$/, grund: "Fußzeile aus meta" },
];
// Satzanfänge, die nur Feldbezeichnungen der Seite sind (kein Tatsachengehalt);
// sie werden vor dem Abgleich abgeschnitten, der Rest wird geprüft.
const FELD_LABELS = /^(Auftraggeber oder Geldgeber|fest \(BIP 2024\)|Angabe der Studie|Auftraggeber|Abgerufen am|Beschriftung|Stattdessen|Fundstelle|Abgrenzung|Preisbasis|Rechenweg|Vorbehalt|abgezinst|abgerufen|Abzeichen|Aussagen|pro Jahr|wachsend|Richtung|Zeitraum|Quellen|Quelle|Belege|Lizenz|Vorher|Status|Studie|Beleg|Summe|Grund|Jetzt|Größe|Nr\.|Wert|Art|Wo)\s*:?\s*/;

/* ------------------------------------------------------------------ Datensatz */
const DEC = new WeakMap();
const RAW = fs.readFileSync(DATA_FILE, "utf8");
const D = JSON.parse(RAW, function (k, v, ctx) {
  if (typeof v === "number" && ctx && typeof ctx.source === "string") {
    const m = /\.(\d+)/.exec(ctx.source);
    let r = DEC.get(this);
    if (!r) { r = {}; DEC.set(this, r); }
    r[k] = m ? m[1].length : 0;
  }
  return v;
});
const Z = Object.fromEntries(D.zahlen.map(z => [z.id, z]));
const C = Object.fromEntries(D.claims.map(c => [c.id, c]));
const GP = Object.fromEntries(D.gegenpositionen.map(g => [g.id, g]));
const PH_RX = /\[\[([A-Za-z0-9_]+)(?:\|([A-Za-z0-9_]+))?\]\]/g;

function decFor(z, key) {
  if (z.dezimalen !== undefined && z.dezimalen !== null) return z.dezimalen;
  const holder = key ? z.value : z, k = key || "value";
  const r = DEC.get(holder);
  return r && r[k] !== undefined ? r[k] : 0;
}
const isYear = (z, key) => z.unit === "Jahr" || key === "jahr";
const nf = (v, d, group) => Math.abs(v).toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: group });
function val(id, key) {
  const z = Z[id]; if (!z) return undefined;
  return key ? (z.value && typeof z.value === "object" ? z.value[key] : undefined) : z.value;
}
/** erwartete Darstellung nach Formatregel 7 (Betrag; Vorzeichen prüft (d) gesondert) */
function fmt(id, key) {
  const z = Z[id];
  if (key === "spanne") return fmt(id, "min") + " bis " + fmt(id, "max");
  const v = val(id, key);
  if (typeof v !== "number") return null;
  return nf(v, decFor(z, key), !isYear(z, key));
}
const WLAB = { A: "A", B: "B", C: "C", Behauptung: "Behauptung", "eigene Rechnung": "eigene Rechnung", Setzung: "Setzung (M)" };
const wertSoll = z => "Wert: " + WLAB[z.wert_konfidenz];
function zitatSoll(z) {
  if (z.zitat_geprueft) return "Zitat geprüft";
  if (z.art === "eigene Rechnung" || z.art === "Setzung") return null; // Zitat-Angabe entfällt
  return "Zitat nicht geprüft";
}

/* Texte normalisieren und zum Skelett machen */
const norm = s => String(s == null ? "" : s)
  .replace(/[    ]/g, " ").replace(/­/g, "").replace(/[‐‑]/g, "-")
  .replace(/\s+/g, " ").trim();
const NUM_RX = /\d+(?:[.,]\d+)*/g;
const NUM_RX_SKEL = /-?\d+(?:[.,]\d+)*/g;
// Spannen („# bis #“, „#–#“, „# (Mitte #)“) zählen wie eine Zahl, damit Text- und Grafikform gleich sind
const skel = s => norm(String(s).replace(PH_RX, "#")).replace(NUM_RX_SKEL, "#")
  .replace(/#(?:\s*(?:–|-|bis)\s*#)+/g, "#").replace(/# \(Mitte #\)/g, "#");

/* Korpus: alle Texte der genannten Blöcke, Platzhalter aufgelöst (als #) */
const KORPUS_BLOECKE = ["claims", "gegenpositionen", "schritte", "glossar", "quellen", "studien",
  "prozess_protokoll", "korrekturen_eigene"];
// Zusätzlich gelesen (die Seiten zeigen auch diese Felder): Zahl-Metadaten, meta,
// verworfen, verbotene Formulierungen, offene Entscheidungen, Arbeitsliste.
const KORPUS_ZUSATZ = ["zahlen", "meta", "verworfen", "verbotene_formulierungen", "offene_entscheidungen", "arbeitsliste_nachweis"];
function strings(o, out) {
  if (typeof o === "string") out.push(o);
  else if (Array.isArray(o)) o.forEach(x => strings(x, out));
  else if (o && typeof o === "object") Object.values(o).forEach(x => strings(x, out));
  return out;
}
const unitShort = u => String(u || "").replace(/\s*\((real 2023|EUR2024|verkettet[^)]*)\)/g, "").replace(/EUR/g, "€").trim();
const korpusTexte = [];
for (const b of KORPUS_BLOECKE.concat(KORPUS_ZUSATZ)) strings(D[b], korpusTexte);
for (const q of Object.values(D.quellen)) korpusTexte.push(`${q.titel} (${q.herausgeber})`, `${q.herausgeber} – ${q.titel}`);
for (const z of D.zahlen) {
  korpusTexte.push("# " + z.unit, "# " + unitShort(z.unit), unitShort(z.unit));
  // Objektwerte zeigt die Belegseite als „schlüssel wert; …“
  if (z.value && typeof z.value === "object") for (const k of Object.keys(z.value)) korpusTexte.push(k + " #");
}
const KORPUS_SKEL = "\u0001" + korpusTexte.map(skel).join("\u0001") + "\u0001";
const KORPUS_SKEL_LC = KORPUS_SKEL.toLowerCase();

/* Zahlenmenge: jede Zahl, die im Datensatz als Wert oder als Ziffernfolge steht */
const NUMSET = new Set();
function addNum(v, d) {
  if (typeof v !== "number") return;
  for (const dd of new Set([d, 0, 1, 2, Math.max(0, d - 3)])) {
    NUMSET.add(nf(v, dd, true)); NUMSET.add(nf(v, dd, false));
  }
  NUMSET.add(nf(v * 1000, Math.max(0, d - 3), true)); // Bio. → Mrd. in Grafiken
  NUMSET.add(nf(v * 1000, 0, true));
}
for (const z of D.zahlen) {
  if (typeof z.value === "number") addNum(z.value, decFor(z));
  else if (z.value && typeof z.value === "object") for (const k of Object.keys(z.value)) addNum(z.value[k], decFor(z, k));
}
for (const t of korpusTexte) for (const m of norm(t).matchAll(NUM_RX)) NUMSET.add(m[0]);
// Werte, die die Seiten aus Studienangaben (bip_studie_text) und Prozessprotokoll bilden
for (const s of D.studien) { for (const m of String(s.bip_studie_text || "").matchAll(NUM_RX)) NUMSET.add(m[0]); }
for (const p of Object.values(D.prozess_protokoll)) for (const v of Object.values(p)) if (typeof v === "number") addNum(v, 0);

/* Studiennamen: Satzstücke mit diesen Namen gelten als prüfpflichtig */
const STUDIEN_RX = /\b(PwC|Prognos|Agora|Ariadne|Fraunhofer|ISE|DIHK|Frontier|ZEW|KfW|DIW|Aurora|dena|EWI|ef\.Ruhr|Quantified Carbon|Kittel|Schill|Wendland|IÖW|GWS|BDI|BDEW|EnBW|Umweltbundesamt|UBA|Bundesrechnungshof|NEP|Bundesbank|Eurostat|SMARD|Ember|McKinsey|BCG)\b/;
const RELEVANT_RX = /\d|%|€|\bEuro\b|\bProzent\b|Milliard|Billion/;
// IDs des Datensatzes und Quellennummern der Seite tragen keinen Tatsachengehalt
const IDS = new Set([...D.claims.map(c => c.id), ...D.gegenpositionen.map(g => g.id), ...D.korrekturen_eigene.map(k => k.id),
  ...D.verbotene_formulierungen.map(x => x.id), ...(D.arbeitsliste_nachweis || []).map(a => a.punkt), ...(D.offene_entscheidungen || []).map(o => o.id)]);
const ID_RX = new RegExp("\\b(?:" + [...IDS].filter(Boolean).sort((a, b) => b.length - a.length).map(i => i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + "|Q\\d+)\\b", "g");

/* ------------------------------------------------------------------ Ergebnis */
const ERG = { pruefungen: {}, hinweise: [], ausnahmen_genutzt: {} };
const P_NAMES = {
  a: "(a) Sätze mit Zahl, Prozent, Euro oder Studienname stammen aus dem Datensatz",
  a2: "(a2) Zahlen auf der Seite stehen im Datensatz",
  b: "(b) Aussagen nur auf der erlaubten Seite; Verworfenes nur in „Verworfen“",
  c: "(c) keine verbotene Formulierung außerhalb „verwenden wir nicht“",
  d: "(d) jede Zahl mit beiden Abzeichen, passend zum Datensatz; Wert richtig dargestellt",
  e: "(e) Vorbehalt steht bei jeder Aussage, die einen hat",
  f: "(f) Gegenpositionen sichtbar; Sprung Story → Langfassung funktioniert",
  g: "(g) keine fremden Hosts, keine Konsolenfehler, kein leerer Platzhalter",
};
for (const k of Object.keys(P_NAMES)) ERG.pruefungen[k] = { name: P_NAMES[k], fehler: [], geprueft: 0 };
const fail = (k, msg) => { const L = ERG.pruefungen[k].fehler; if (!L.includes(msg)) L.push(msg); };
const count = (k, n = 1) => { ERG.pruefungen[k].geprueft += n; };
const hinweis = msg => { if (!ERG.hinweise.includes(msg)) ERG.hinweise.push(msg); };

/* ------------------------------------------------------------------ Webserver */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json",
  ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".webp": "image/webp" };
function startServer() {
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const f = path.normalize(path.join(ROOT, u));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, "127.0.0.1", () => r(srv)));
}

/* ------------------------------------------------------------------ Im Browser */
// Liefert Texteinheiten (je Block-Element), Zahlen mit Abzeichen und Strukturangaben.
function imBrowser(seite) {
  document.querySelectorAll("details").forEach(d => { d.open = true; });
  document.querySelectorAll("br").forEach(br => br.after(document.createTextNode(" ")));
  // Feldbezeichnungen („Quelle:“, „pro Jahr“ …) als Trenner markieren, damit jedes Feld einzeln geprüft wird
  document.querySelectorAll("b, .lab, strong").forEach(b => { if (/:\s*$/.test(b.textContent) || b.classList.contains("lab")) b.before(document.createTextNode(" · ")); });
  const BADGE = ".bp,.bx,.wk,.zg,.st,.cid,.qc,.sn,.rejtag,.fchip";
  const ZONE = el => {
    const z = el.closest("#verw,#verbot,#quellen,#q-body,#srcs,#entstanden,#entstehung,#korrekturen,#ungelesen,.twin,#legend,#lesehilfe,.ktab,.ptab,#tab-ph,#tab-st,#chart,#twin,figure,.panel,.mslot");
    return z ? (z.id || z.className.baseVal || z.className || z.tagName).toString().split(" ")[0] : "";
  };
  const blockOf = node => {
    let e = node.parentElement;
    while (e && e !== document.body) {
      if (e instanceof SVGElement) { if (e.tagName === "text") return e; e = e.parentElement; continue; }
      const d = getComputedStyle(e).display;
      if (!(d.startsWith("inline") || d === "contents")) return e;
      e = e.parentElement;
    }
    return document.body;
  };
  const sichtbar = el => {
    const t = el instanceof SVGElement ? (el.closest("svg") || el) : el;
    return typeof t.checkVisibility === "function" ? t.checkVisibility() : t.getClientRects().length > 0;
  };
  const pfad = el => {
    const parts = []; let e = el;
    while (e && e !== document.body && parts.length < 4) {
      parts.unshift(e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.getAttribute && e.getAttribute("data-claim") ? "[data-claim=" + e.getAttribute("data-claim") + "]" : ""));
      if (e.id) break; e = e.parentElement;
    }
    return parts.join(">");
  };
  const units = new Map();
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest("script,style,noscript,template,title,desc,defs,#pop")) continue;
    if (p.closest(BADGE)) continue;
    const b = blockOf(n);
    let u = units.get(b);
    if (!u) { u = { t: "", el: b }; units.set(b, u); }
    const prev = n.previousSibling;
    u.t += n.nodeValue;
  }
  const out = [];
  for (const u of units.values()) {
    const t = u.t.replace(/\s+/g, " ").trim();
    if (!t) continue;
    const cl = u.el.closest("[data-claim]");
    out.push({ t, pfad: pfad(u.el), zone: ZONE(u.el), sichtbar: sichtbar(u.el), svg: u.el instanceof SVGElement,
      claim: cl ? cl.getAttribute("data-claim") : "" });
  }
  // Zahlen und Abzeichen
  const zahlen = [];
  const container = el => el.closest("[data-claim],article.gp,.quote,tr,li,figure,p") || el.parentElement;
  const cIdx = new Map();
  const cid = el => { if (!cIdx.has(el)) cIdx.set(el, cIdx.size); return cIdx.get(el); };
  if (seite === "story") {
    document.querySelectorAll(".z[data-z]").forEach(e => {
      const nx = e.nextSibling;
      const bp = nx && nx.nodeType === 1 && nx.classList.contains("bp") ? nx : null;
      const c = container(e);
      zahlen.push({ id: e.dataset.z, k: e.dataset.k || "", txt: e.textContent, nach: (e.parentElement ? "" : ""),
        folgetext: (() => { let s = "", x = e.nextSibling; while (x && s.length < 40) { if (!(x.nodeType === 1 && x.classList.contains("bp"))) s += x.textContent; x = x.nextSibling; } return s; })(),
        zit: bp ? [...bp.querySelectorAll(".zit")].map(x => x.textContent) : null,
        wert: bp ? [...bp.querySelectorAll(".bx:not(.zit)")].map(x => x.textContent) : null,
        c: cid(c), claim: c.getAttribute ? (c.getAttribute("data-claim") || "") : "", pfad: pfad(c) });
    });
  } else {
    document.querySelectorAll(".nv").forEach(e => {
      const nx = e.nextSibling;
      const wk = nx && nx.nodeType === 1 && nx.classList.contains("wk") ? nx.textContent : null;
      const c = container(e);
      // zugehörige Liste „Zahlen und Herkunft“: im Container oder direkt danach
      let det = c.querySelector ? c.querySelector("details.zd") : null;
      if (!det) { let x = c.nextElementSibling; while (x && !det && (x.matches("details.zd") || x.matches(".vb"))) { if (x.matches("details.zd")) det = x; x = x.nextElementSibling; } }
      const rows = det ? [...det.querySelectorAll("li.zrow")].map(li => ({
        zv: (li.querySelector(".zv") || {}).textContent, zu: (li.querySelector(".zu") || {}).textContent,
        chips: [...li.querySelectorAll(".zrow-h .zg, .zrow-h .wk")].map(x => x.textContent) })) : null;
      zahlen.push({ txt: e.textContent, wk, c: cid(c), claim: c.getAttribute ? (c.getAttribute("data-claim") || "") : "",
        gp: c.matches && c.matches("article.gp") ? c.id : (c.closest && c.closest("article.gp") ? c.closest("article.gp").id : ""),
        folgetext: (() => { let s = "", x = e.nextSibling; while (x && s.length < 40) { if (!(x.nodeType === 1 && x.classList.contains("wk"))) s += x.textContent; x = x.nextSibling; } return s; })(),
        rows, pfad: pfad(c) });
    });
  }
  // Aussagen-Container mit Text (für b, e)
  const claimEls = [...document.querySelectorAll("[data-claim]")].map(e => ({
    ids: e.getAttribute("data-claim"), gpClaims: e.getAttribute("data-gp-claims") || "",
    t: (() => { const c = e.cloneNode(true); c.querySelectorAll(BADGE).forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " ").trim(); })(),
    tag: e.tagName.toLowerCase(), zone: ZONE(e), sichtbar: sichtbar(e), pfad: pfad(e) }));
  // Leere Platzhalter
  const leer = [];
  document.querySelectorAll("main [id], header [id], h1,h2,h3,h4,p,td,th,li,dd,dt,summary,figcaption,.nv,.z").forEach(e => {
    if (e.closest(".mslot,.dslot,.twslot,#loadnote,#live,#pop,svg,script,noscript")) return;
    if (e.matches("#loadnote,#live,#pop,.mslot,.dslot,.twslot,#chart,#twin")) return;
    if (!e.textContent.trim() && !e.querySelector("svg,img,canvas,input,select,button")) leer.push(pfad(e) + " <" + e.tagName.toLowerCase() + ">");
  });
  const roh = document.body.innerText;
  const muell = [];
  for (const [rx, was] of [[/\[\[/, "[["], [/\[\?/, "[?"], [/⚠/, "⚠"], [/\bundefined\b/, "undefined"], [/\bNaN\b/, "NaN"], [/\bnull\b/, "null"], [/\[object Object\]/, "[object Object]"]]) {
    const m = rx.exec(roh); if (m) muell.push(was + " in »…" + roh.slice(Math.max(0, m.index - 40), m.index + 30).replace(/\s+/g, " ") + "…«");
  }
  // Gegenpositionen
  const gps = [...document.querySelectorAll("[id^='gp-']")].map(e => {
    const c = e.cloneNode(true); c.querySelectorAll(BADGE).forEach(x => x.remove());
    const box = e.closest(".kasten,.kachel,section,article") || e;
    const links = [...box.querySelectorAll("a.more"), ...(e.parentElement ? [...e.parentElement.querySelectorAll(":scope > a.more")] : [])].map(a => a.getAttribute("href"));
    return { id: e.id, t: c.textContent.replace(/\s+/g, " ").trim(), sichtbar: sichtbar(e), links: [...new Set(links)] };
  });
  // Zonen-Texte für (b) und (c)
  const zoneText = sel => { const z = document.querySelector(sel); return z ? z.textContent.replace(/\s+/g, " ") : ""; };
  const ohne = sels => { const c = document.body.cloneNode(true); c.querySelectorAll("script,style,noscript" + (sels ? "," + sels : "")).forEach(x => x.remove()); return c.textContent.replace(/\s+/g, " "); };
  const extra = {};
  if (seite === "story") {
    try { extra.ERR = typeof ERR !== "undefined" ? ERR.slice() : null; } catch (e) { extra.ERR = null; }
    try { extra.figRows = typeof FIGS !== "undefined" ? FIGS.map(f => ({ st: f.st.id, rows: (f.rows || []).map(r => ({ label: r.label, id: r.id, key: r.key || "", text: r.text })) })) : null; } catch (e) { extra.figRows = null; }
    extra.twinRows = [...document.querySelectorAll(".twin")].map(t => ({
      st: (t.closest(".step") || {}).dataset ? t.closest(".step").dataset.sid : "",
      rows: [...t.querySelectorAll("tbody tr")].map(tr => ({ cells: [...tr.children].map(td => td.cloneNode(true)).map(td => { td.querySelectorAll(".bp").forEach(x => x.remove()); return td.textContent.trim(); }),
        zit: [...tr.querySelectorAll(".bx.zit")].map(x => x.textContent), wert: [...tr.querySelectorAll(".bx:not(.zit)")].map(x => x.textContent) })) }));
  }
  return { units: out, zahlen, claimEls, leer, muell, gps,
    textAll: ohne(""), textOhneVerbot: ohne("#verbot"), textOhneVerw: ohne("#verw"),
    verwText: zoneText("#verw"), extra, titel: document.title, marker: document.documentElement.outerHTML.length };
}

/* ------------------------------------------------------------------ Laden */
async function lade(browser, base, seite, breite, protokoll) {
  const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
  const fremd = [], konsole = [];
  await ctx.route("**/*", route => {
    const u = new URL(route.request().url());
    if (u.hostname !== "127.0.0.1") { fremd.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") konsole.push("console.error: " + m.text()); else if (m.type() === "warning") protokoll.push(`${seite} ${breite}px warning: ${m.text()}`); });
  page.on("pageerror", e => konsole.push("pageerror: " + e.message));
  page.on("requestfailed", r => { const u = new URL(r.url()); if (u.hostname === "127.0.0.1") konsole.push("Abruf gescheitert: " + r.url()); });
  page.on("response", r => { if (r.status() >= 400) konsole.push("HTTP " + r.status() + ": " + r.url()); });
  await page.goto(base + PAGES[seite], { waitUntil: "networkidle" });
  await page.waitForFunction(s => s === "story" ? document.querySelectorAll("#akte .step").length > 0 && document.querySelector("#q-body").children.length > 0
    : document.querySelector("#srcs") && document.querySelector("#srcs").children.length > 0, seite, { timeout: 20000 });
  // Story: einmal durchscrollen, damit Szenenwechsel und Beobachter laufen
  if (seite === "story") {
    await page.evaluate(async () => { const H = document.body.scrollHeight; for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 15)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(300);
  }
  const res = await page.evaluate(imBrowser, seite);
  res.fremd = fremd; res.konsole = konsole;
  await ctx.close();
  return res;
}

/* ------------------------------------------------------------------ Prüfungen */
function satzstuecke(t) {
  // Sätze, dann Felder (" · ", "; ", Tabulator) – jedes Stück wird einzeln abgeglichen
  return norm(t).split(/(?<=[.!?“"])\s+(?=[A-ZÄÖÜ„"(])|\s*·\s+|\s+–\s+|;\s+|\t|\s+(?=https?:\/\/)/).map(s => s.trim()).filter(Boolean);
}
function ausnahme(seite, s) {
  for (const a of AUSNAHMEN) {
    if ((a.seite === "beide" || a.seite === seite) && a.rx.test(s)) { ERG.ausnahmen_genutzt[a.id] = (ERG.ausnahmen_genutzt[a.id] || 0) + 1; return a; }
  }
  return null;
}
function imKorpus(s) {
  const k = skel(s).replace(/^[\s,.;:–\-(]+|[\s,.;:–\-)]+$/g, "");
  if (!k) return true;
  if (KORPUS_SKEL.includes(k)) return true;
  if (KORPUS_SKEL_LC.includes(k.toLowerCase())) return true;
  // Anführungszeichen-Varianten (Seiten setzen Zitate teils in „…“)
  const k2 = k.replace(/[„“”"‚‘’]/g, "");
  if (k2 && KORPUS_SKEL.replace(/[„“”"‚‘’]/g, "").includes(k2)) return true;
  return false;
}

function pruefeA(seite, breite, r) {
  for (const u of r.units) {
    if (RELEVANT_RX.test(u.t) && ausnahme(seite, norm(u.t))) { count("a"); continue; }
    const stuecke = satzstuecke(u.t);
    for (let s of stuecke) {
      const sOhneId = s.replace(ID_RX, " ").replace(/\s+/g, " ").trim();
      const relevant = RELEVANT_RX.test(sOhneId) || STUDIEN_RX.test(sOhneId);
      if (!relevant) continue;
      count("a");
      const a = ausnahme(seite, sOhneId) || ausnahme(seite, s);
      if (a) {
        if (a.achse && !u.svg) fail("a", `${seite} ${breite}px: Achsen-Ausnahme außerhalb einer Grafik genutzt: »${s}« (${u.pfad})`);
        continue;
      }
      let rest = sOhneId.replace(FELD_LABELS, "");
      if (!imKorpus(rest) && !imKorpus(sOhneId) && !imKorpus(s)) {
        fail("a", `${seite} ${breite}px${u.sichtbar ? "" : " (ausgeblendet)"}: nicht im Datensatz: »${s}« · ${u.pfad}${u.zone ? " · Zone " + u.zone : ""}`);
      }
      for (const m of sOhneId.matchAll(NUM_RX)) {
        count("a2");
        const z = m[0];
        if (NUMSET.has(z) || /^(19|20)\d{2}$/.test(z)) continue;
        fail("a2", `${seite} ${breite}px: Zahl ${z} steht nicht im Datensatz: »${s}« · ${u.pfad}`);
      }
    }
  }
}

/** erwartete Abfolge der Zahlen in einem Text (Platzhalter), mit Regel „gleiche ID direkt danach → Abzeichen erst dort“ */
function folge(text) {
  const out = []; const t = String(text || ""); let m; const rx = new RegExp(PH_RX.source, "g");
  const ms = [];
  while ((m = rx.exec(t))) ms.push({ id: m[1], k: m[2] || "", start: m.index, end: rx.lastIndex });
  ms.forEach((x, i) => {
    const nx = ms[i + 1];
    const zwischen = nx ? t.slice(x.end, nx.start) : "";
    out.push({ ...x, join: !!(nx && nx.id === x.id && /^[\s\-–]*(bis|und|oder|,)?\s*$/.test(zwischen) && zwischen.length <= 8) });
  });
  return out;
}

function pruefeD(seite, breite, r) {
  const tag = `${seite} ${breite}px`;
  if (seite === "story") {
    const byC = new Map();
    for (const z of r.zahlen) {
      count("d");
      const zz = Z[z.id];
      if (!zz) { fail("d", `${tag}: Zahl-ID ${z.id} nicht im Datensatz (${z.pfad})`); continue; }
      const soll = fmt(z.id, z.k);
      if (soll === null) fail("d", `${tag}: ${z.id}|${z.k}: kein Zahlenwert im Datensatz (${z.pfad})`);
      else if (norm(z.txt) !== soll) fail("d", `${tag}: ${z.id}${z.k ? "|" + z.k : ""} zeigt »${z.txt}«, Datensatz nach Formatregel »${soll}« (${z.pfad})`);
      const v = z.k === "spanne" ? val(z.id, "min") : val(z.id, z.k);
      if (typeof v === "number" && v < 0 && !/(unter|darunter|niedriger|weniger|sank|gesunken|Rückgang|zurück|minus|fiel|gefallen|weniger als|abgenommen)/i.test(z.folgetext))
        fail("d", `${tag}: ${z.id}${z.k ? "|" + z.k : ""} ist negativ (${v}), die Seite zeigt den Betrag ohne Vorzeichen, und kein Verb trägt die Richtung: »${z.txt}${z.folgetext}…« (${z.pfad})`);
      const key = z.c + "|" + z.id;
      if (!byC.has(key)) byC.set(key, { z, badges: [] });
      if (z.zit || z.wert) byC.get(key).badges.push(z);
    }
    for (const { z, badges } of byC.values()) {
      const zz = Z[z.id]; if (!zz) continue;
      if (!badges.length) { fail("d", `${tag}: ${z.id} ohne Abzeichen im Absatz (${z.pfad})`); continue; }
      for (const b of badges) {
        const zs = zitatSoll(zz), ws = wertSoll(zz);
        if (JSON.stringify(b.wert) !== JSON.stringify([ws])) fail("d", `${tag}: ${z.id}: Wert-Abzeichen ${JSON.stringify(b.wert)}, Datensatz »${ws}« (${z.pfad})`);
        if (zs === null) { if (b.zit.length) fail("d", `${tag}: ${z.id}: Zitat-Abzeichen ${JSON.stringify(b.zit)} an eigener Rechnung/Setzung (${z.pfad})`); }
        else if (JSON.stringify(b.zit) !== JSON.stringify([zs])) fail("d", `${tag}: ${z.id}: Zitat-Abzeichen ${JSON.stringify(b.zit)}, Datensatz »${zs}« (${z.pfad})`);
      }
    }
    // Wertetabellen der Grafiken: Zeilen mit Zahl-ID tragen das Abzeichen dieser Zahl
    const fr = (r.extra.figRows || []);
    const tw = r.extra.twinRows || [];
    for (const f of fr) {
      const t = tw.find(x => x.st === f.st);
      if (!f.rows.length) continue;
      if (!t) { fail("d", `${tag}: Schritt ${f.st}: Grafik ohne Wertetabelle`); continue; }
      f.rows.forEach((row, i) => {
        count("d");
        const tr = t.rows[i]; const zz = Z[row.id];
        if (!tr || !zz) { fail("d", `${tag}: Schritt ${f.st}: Tabellenzeile ${i + 1} fehlt oder Zahl ${row.id} unbekannt`); return; }
        const zs = zitatSoll(zz), ws = wertSoll(zz);
        if (JSON.stringify(tr.wert) !== JSON.stringify([ws])) fail("d", `${tag}: Schritt ${f.st}, Tabelle »${row.label}«: Wert-Abzeichen ${JSON.stringify(tr.wert)}, Datensatz ${row.id} »${ws}«`);
        if ((zs === null && tr.zit.length) || (zs !== null && JSON.stringify(tr.zit) !== JSON.stringify([zs]))) fail("d", `${tag}: Schritt ${f.st}, Tabelle »${row.label}«: Zitat-Abzeichen ${JSON.stringify(tr.zit)}, Datensatz ${row.id} »${zs}«`);
        const soll = row.key === "spanne" || (zz.value && typeof zz.value === "object" && !row.key && "min" in zz.value) ? null : fmt(row.id, row.key);
        if (soll && !norm(tr.cells[1]).startsWith(soll)) fail("d", `${tag}: Schritt ${f.st}, Tabelle »${row.label}«: Wert »${tr.cells[1]}«, Datensatz ${row.id}${row.key ? "|" + row.key : ""} »${soll}«`);
      });
    }
    // Studientabelle (punktdiagramm): nur ein Abzeichen für zwei Rechnungen
    for (const t of tw) if (t.rows.length && t.rows[0].cells.length === 7) hinweis(`story: Wertetabelle der Studiengrafik (Schritt ${t.st}) trägt ein Abzeichen je Zeile für zwei Werte (fest, wachsend); beide sind eigene Rechnungen mit gleichem Abzeichen`);
  } else {
    // Belegseite: Wert-Abzeichen im Text; beide Abzeichen in „Zahlen und Herkunft“
    const byC = new Map();
    for (const z of r.zahlen) { if (!byC.has(z.c)) byC.set(z.c, []); byC.get(z.c).push(z); }
    let ohneZitatImText = 0;
    for (const list of byC.values()) {
      const first = list[0];
      let soll = null, quelle = "";
      const ids = (first.claim || "").split(/\s+/).filter(Boolean);
      if (ids.length === 1 && C[ids[0]]) { soll = folge(C[ids[0]].text).concat(folge(C[ids[0]].vorbehalt)); quelle = ids[0]; }
      else if (first.gp && GP[first.gp.replace(/^gp-/, "")]) {
        const g = GP[first.gp.replace(/^gp-/, "")]; soll = folge(g.lang); const seen = new Set();
        for (const cid of g.claims || []) { const c = C[cid]; if (c && c.vorbehalt && !seen.has(c.vorbehalt)) { seen.add(c.vorbehalt); soll = soll.concat(folge(c.vorbehalt)); } }
        quelle = first.gp;
      }
      list.forEach(z => { count("d"); if (z.wk === null) { /* Abzeichen nur am letzten Glied einer Spanne */ } });
      if (!soll) {
        // ohne zuordenbare Aussage: nur prüfen, dass jedes Glied ein Wert-Abzeichen hat oder Teil einer Spanne ist
        list.forEach((z, i) => { if (z.wk === null && !(list[i + 1] && /^\s*(bis|und|oder|,|–|-)?\s*$/.test(z.folgetext.slice(0, 6)))) fail("d", `belege ${breite}px: Zahl »${z.txt}« ohne Wert-Abzeichen (${z.pfad})`); });
        continue;
      }
      if (soll.length !== list.length) { fail("d", `belege ${breite}px: ${quelle}: ${list.length} Zahlen gerendert, ${soll.length} im Datensatz-Text (${first.pfad})`); continue; }
      const distinct = [];
      soll.forEach((s, i) => {
        const z = list[i], zz = Z[s.id];
        if (!zz) { fail("d", `belege ${breite}px: ${quelle}: Zahl-ID ${s.id} fehlt im Datensatz`); return; }
        if (!distinct.includes(s.id)) distinct.push(s.id);
        const sollTxt = fmt(s.id, s.k);
        if (sollTxt !== null && norm(z.txt) !== sollTxt) fail("d", `belege ${breite}px: ${quelle}: ${s.id}${s.k ? "|" + s.k : ""} zeigt »${z.txt}«, Datensatz nach Formatregel »${sollTxt}«`);
        const v = s.k === "spanne" ? val(s.id, "min") : val(s.id, s.k);
        if (typeof v === "number" && v < 0 && !/^-/.test(z.txt) && !/(unter|darunter|niedriger|weniger|sank|gesunken)/.test(z.folgetext)) fail("d", `belege ${breite}px: ${quelle}: ${s.id} negativ ohne Vorzeichen und ohne Richtungsverb`);
        if (s.join) { if (z.wk !== null) fail("d", `belege ${breite}px: ${quelle}: ${s.id}: Abzeichen mitten in der Spanne`); }
        else if (z.wk !== wertSoll(zz)) fail("d", `belege ${breite}px: ${quelle}: ${s.id}: Wert-Abzeichen »${z.wk}«, Datensatz »${wertSoll(zz)}«`);
        if (zitatSoll(zz) !== null) ohneZitatImText++;
      });
      const rows = first.rows;
      if (!rows) { fail("d", `belege ${breite}px: ${quelle}: keine Liste „Zahlen und Herkunft“ mit dem Zitat-Abzeichen`); continue; }
      if (rows.length !== distinct.length) { fail("d", `belege ${breite}px: ${quelle}: „Zahlen und Herkunft“ hat ${rows.length} Zeilen, ${distinct.length} Zahlen im Text`); continue; }
      distinct.forEach((id, i) => {
        const zz = Z[id], row = rows[i];
        const zSoll = zz.zitat_geprueft ? "Zitat geprüft" : (zz.art === "eigene Rechnung" || zz.art === "Setzung") ? `Zitat: entfällt (${zz.art})` : "Zitat nicht geprüft";
        const chips = row.chips;
        if (!chips.includes(zSoll)) fail("d", `belege ${breite}px: ${quelle}: ${id}: Zitat-Angabe ${JSON.stringify(chips)}, Datensatz »${zSoll}«`);
        if (!chips.includes(wertSoll(zz))) fail("d", `belege ${breite}px: ${quelle}: ${id}: Wert-Angabe in der Liste ${JSON.stringify(chips)}, Datensatz »${wertSoll(zz)}«`);
        const pSoll = zz.primaer_gelesen ? "Original gelesen" : "Original nicht gelesen";
        if (!chips.includes(pSoll)) fail("d", `belege ${breite}px: ${quelle}: ${id}: Angabe ${JSON.stringify(chips)} ohne »${pSoll}«`);
      });
    }
    if (ohneZitatImText) hinweis(`belege: ${ohneZitatImText} Zahlen (je Breite gezählt) tragen im Fließtext nur das Wert-Abzeichen; „Zitat geprüft“ steht erst in der aufklappbaren Liste „Zahlen und Herkunft“ darunter (Story: beide im Text)`);
  }
}

function signatur(text) {
  // längster Satz des Datensatz-Texts als Skelett (mind. 45 Zeichen), sonst null
  const s = String(text || "").split(/(?<=[.!?])\s+/).map(skel).sort((a, b) => b.length - a.length)[0] || "";
  return s.length >= 45 ? s : null;
}
function pruefeB(seite, breite, r) {
  const tag = `${seite} ${breite}px`;
  const erlaubt = seite === "story" ? ["story", "beide"] : ["belege", "beide"];
  for (const e of r.claimEls) {
    for (const id of e.ids.split(/\s+/).filter(Boolean)) {
      if (GP[id]) continue;
      const c = C[id];
      count("b");
      if (!c) { fail("b", `${tag}: data-claim ${id} ist keine Aussage des Datensatzes (${e.pfad})`); continue; }
      if (c.status === "verworfen") fail("b", `${tag}: verworfene Aussage ${id} steht auf der Seite (${e.pfad})`);
      else if (!erlaubt.includes(c.ort)) fail("b", `${tag}: Aussage ${id} hat Ort »${c.ort}«, steht aber hier (${e.pfad})`);
    }
  }
  // Textabgleich: auch Sätze ohne data-claim
  const seitenSkel = skel(r.textAll);
  const verwSkel = skel(r.verwText);
  const seitenOhneVerw = skel(r.textOhneVerw);
  const alleErlaubt = D.claims.filter(c => erlaubt.includes(c.ort)).map(c => skel(c.text + " " + (c.vorbehalt || ""))).join("\u0001")
    + "\u0001" + D.gegenpositionen.map(g => skel(g.kurz + " " + g.lang)).join("\u0001");
  for (const c of D.claims) {
    if (erlaubt.includes(c.ort)) continue;
    const sig = signatur(c.text);
    if (!sig) continue;
    count("b");
    if (alleErlaubt.includes(sig)) continue; // derselbe Satz steckt in einer erlaubten Aussage
    if (c.status === "verworfen") {
      if (seitenSkel.includes(sig)) fail("b", `${tag}: Wortlaut der verworfenen Aussage ${c.id} steht auf der Seite: »${sig.slice(0, 90)}…«`);
    } else if (seitenSkel.includes(sig)) fail("b", `${tag}: Wortlaut der Aussage ${c.id} (Ort »${c.ort}«) steht auf der Seite: »${sig.slice(0, 90)}…«`);
  }
  // verworfene Zahlen und Aussagen (Liste verworfen): Muster nur in der Tabelle „Verworfen“
  for (const v of D.verworfen) for (const m of v.muster || []) {
    count("b");
    const rx = new RegExp(m, "i");
    const hit = rx.exec(norm(r.textOhneVerw));
    if (hit) fail("b", `${tag}: verworfenes Muster ${v.id} (${m}) außerhalb „Verworfen“: »…${norm(r.textOhneVerw).slice(Math.max(0, hit.index - 50), hit.index + 40)}…«`);
  }
  if (seite === "belege" && !r.verwText) fail("b", `${tag}: Tabelle „Verworfen“ (#verw) fehlt`);
  // Vollständigkeit (nur Hinweis: Freigabe Regel 4 erlaubt das Weglassen ganzer Sätze)
  if (breite === WIDTHS[0]) {
    const da = new Set(r.claimEls.flatMap(e => e.ids.split(/\s+/)));
    const fehlt = D.claims.filter(c => erlaubt.includes(c.ort) && !da.has(c.id) && !(c.ort === "beide" && seite === "story" && false)).map(c => c.id);
    if (fehlt.length) hinweis(`${seite}: ${fehlt.length} Aussagen mit passendem Ort ohne data-claim auf der Seite: ${fehlt.join(", ")}`);
  }
}

function pruefeC(seite, breite, r) {
  const t = norm(r.textOhneVerbot);
  for (const x of D.verbotene_formulierungen) for (const m of x.muster || []) {
    count("c");
    const rx = new RegExp(m, "i");
    const hit = rx.exec(t);
    if (hit) fail("c", `${seite} ${breite}px: verbotene Formulierung ${x.id} (${m}): »…${t.slice(Math.max(0, hit.index - 60), hit.index + 40)}…«`);
  }
}

function pruefeE(seite, breite, r) {
  for (const e of r.claimEls) {
    const ids = e.ids.split(/\s+/).filter(Boolean);
    for (const id of ids) {
      const c = C[id];
      if (!c || !c.vorbehalt || c.status === "verworfen") continue;
      count("e");
      const vs = skel(c.vorbehalt).replace(/[„“”"]/g, "");
      if (!skel(e.t).replace(/[„“”"]/g, "").includes(vs.slice(0, Math.min(vs.length, 120)))) {
        const schwer = c.status === "nicht prüfbar" || c.status === "Setzung (M)";
        fail("e", `${seite} ${breite}px: ${id} (${c.status}) ohne Vorbehalt im Absatz${schwer ? "" : " (Freigabe Regel 4)"}: »${c.vorbehalt.slice(0, 100)}« · ${e.pfad}`);
      }
    }
    // Story-Kästen: Kurzfassung einer Gegenposition, deren Aussagen „nicht prüfbar“ sind
    if (e.gpClaims) for (const id of e.gpClaims.split(/\s+/)) {
      const c = C[id];
      if (c && c.status === "nicht prüfbar" && seite === "story") {
        const vs = skel(c.vorbehalt || "");
        if (!skel(e.t).includes(vs.slice(0, 60))) hinweis(`story: Kasten ${e.ids} stützt sich auf ${id} (nicht prüfbar); der Vorbehalt steht nur in der Langfassung auf der Belegseite`);
      }
    }
  }
}

function pruefeG(seite, breite, r) {
  const tag = `${seite} ${breite}px`;
  count("g", 4);
  for (const u of r.fremd) fail("g", `${tag}: Abruf an fremden Host: ${u}`);
  for (const k of r.konsole) fail("g", `${tag}: ${k}`);
  for (const l of r.leer) fail("g", `${tag}: leeres Element: ${l}`);
  for (const m of r.muell) fail("g", `${tag}: Platzhalter-Rest ${m}`);
  if (seite === "story" && r.extra.ERR && r.extra.ERR.length) for (const e of r.extra.ERR) fail("g", `${tag}: Fehlerliste der Seite (ERR): ${e}`);
}

async function pruefeF(browser, base, R) {
  for (const breite of WIDTHS) {
    const s = R.story[breite], b = R.belege[breite];
    for (const g of D.gegenpositionen) {
      count("f");
      const sid = "gp-" + g.id;
      const se = s.gps.find(x => x.id === sid);
      if (!se) { fail("f", `story ${breite}px: Gegenposition ${g.id} fehlt`); }
      else {
        if (!se.sichtbar) fail("f", `story ${breite}px: Gegenposition ${g.id} nicht sichtbar`);
        if (!skel(se.t).includes(skel(g.kurz).slice(0, 100))) fail("f", `story ${breite}px: ${g.id}: Kurzfassung nicht vollständig im Kasten`);
        if (!se.links.includes(PAGES.belege + "#" + sid)) fail("f", `story ${breite}px: ${g.id}: kein Link »${PAGES.belege}#${sid}« (gefunden: ${se.links.join(", ") || "keiner"})`);
      }
      const be = b.gps.find(x => x.id === sid);
      if (!be) fail("f", `belege ${breite}px: Langfassung ${g.id} fehlt`);
      else if (!skel(be.t).includes(skel(g.lang).slice(0, 140))) fail("f", `belege ${breite}px: ${g.id}: Langfassung nicht im Kasten`);
    }
    // Sprung tatsächlich ausführen
    for (const g of D.gegenpositionen) {
      count("f");
      const ctx = await browser.newContext({ viewport: { width: breite, height: 900 } });
      await ctx.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
      const p = await ctx.newPage();
      await p.goto(base + PAGES.story, { waitUntil: "networkidle" });
      await p.waitForFunction(() => document.querySelectorAll("#akte .step").length > 0);
      const link = p.locator(`a[href="${PAGES.belege}#gp-${g.id}"]`).first();
      if (!(await link.count())) { fail("f", `story ${breite}px: ${g.id}: Link zum Klicken fehlt`); await ctx.close(); continue; }
      await link.scrollIntoViewIfNeeded();
      await Promise.all([p.waitForURL(u => String(u).includes("#gp-" + g.id), { timeout: 10000 }).catch(() => {}), link.click()]);
      try {
        await p.waitForFunction(() => document.querySelector("#srcs") && document.querySelector("#srcs").children.length > 0, null, { timeout: 15000 });
        await p.waitForTimeout(400);
        const st = await p.evaluate(id => {
          const e = document.getElementById(id); if (!e) return { da: false };
          const r = e.getBoundingClientRect();
          const zu = e.closest("details:not([open])");
          return { da: true, sichtbar: e.checkVisibility(), top: r.top, h: innerHeight, zu: !!zu, url: location.href };
        }, "gp-" + g.id);
        if (!st.da) fail("f", `Sprung ${breite}px ${g.id}: Ziel #gp-${g.id} fehlt auf der Belegseite`);
        else if (!st.sichtbar || st.zu) fail("f", `Sprung ${breite}px ${g.id}: Ziel ist nicht sichtbar (Abschnitt zugeklappt: ${st.zu})`);
        else if (st.top < -5 || st.top > st.h * 0.9) fail("f", `Sprung ${breite}px ${g.id}: Ziel nicht im Bild (top ${Math.round(st.top)} px bei ${st.h} px Höhe)`);
      } catch (e) { fail("f", `Sprung ${breite}px ${g.id}: ${e.message.split("\n")[0]}`); }
      await ctx.close();
    }
  }
}

/* ------------------------------------------------------------------ Lauf */
async function main() {
  const srv = await startServer();
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const protokoll = [];
  const R = { story: {}, belege: {} };
  const hash = f => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, f))).digest("hex").slice(0, 12);
  console.log(`Prüfskript Teil 1 · Datensatz v${D.meta.version} Stand ${D.meta.stand} · sha256 ${hash("energiewende/data/teil1_data.json")}`);
  console.log(`Seiten: ${PAGES.story} (${hash(PAGES.story)}), ${PAGES.belege} (${hash(PAGES.belege)}) · Breiten ${WIDTHS.join(", ")} px`);
  try {
    for (const seite of Object.keys(PAGES)) for (const breite of WIDTHS) {
      const r = await lade(browser, base, seite, breite, protokoll);
      R[seite][breite] = r;
      pruefeA(seite, breite, r); pruefeB(seite, breite, r); pruefeC(seite, breite, r);
      pruefeD(seite, breite, r); pruefeE(seite, breite, r); pruefeG(seite, breite, r);
    }
    await pruefeF(browser, base, R);
  } finally { await browser.close(); srv.close(); }
  let gescheitert = 0;
  console.log("");
  for (const [k, p] of Object.entries(ERG.pruefungen)) {
    const ok = p.fehler.length === 0;
    if (!ok) gescheitert++;
    console.log(`${ok ? "OK    " : "FEHLER"} ${p.name} · ${p.geprueft} Prüfschritte${ok ? "" : " · " + p.fehler.length + " Befunde"}`);
    const zeig = VERBOSE ? p.fehler : p.fehler.slice(0, 25);
    for (const f of zeig) console.log("         - " + f);
    if (zeig.length < p.fehler.length) console.log(`         … und ${p.fehler.length - zeig.length} weitere (--verbose)`);
  }
  if (ERG.hinweise.length) { console.log("\nHinweise (kein Abbruchgrund):"); ERG.hinweise.forEach(h => console.log("  - " + h)); }
  console.log("\nGenutzte Ausnahmen: " + (Object.entries(ERG.ausnahmen_genutzt).map(([k, n]) => `${k}×${n}`).join(", ") || "keine"));
  if (VERBOSE && protokoll.length) { console.log("\nKonsolen-Warnungen:"); protokoll.forEach(p => console.log("  - " + p)); }
  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(ERG, null, 1));
  console.log(`\nErgebnis: ${gescheitert ? gescheitert + " von " + Object.keys(ERG.pruefungen).length + " Prüfungen gescheitert" : "alle Prüfungen bestanden"}`);
  process.exit(gescheitert ? 1 : 0);
}
main().catch(e => { console.error("ABBRUCH:", e); process.exit(2); });
