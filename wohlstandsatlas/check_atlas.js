#!/usr/bin/env node
/* Browser-Test des Wohlstandsatlas (wohlstandsatlas.html + wohlstandsatlas/atlas-extras.js): die wichtigsten Prüfungen
   aller fünf Überarbeitungsrunden in einer Datei.

     node wohlstandsatlas/check_atlas.js        # Exit-Code 1 bei Fehlern, Laufzeit etwa 2–3 Minuten (Grenze: 5 Minuten)

   Braucht Playwright mit Chromium (wie wohlstand-story/scripts/check_page.js). Startet einen eigenen kleinen Server
   auf dem Repo-Root. Geprüft wird im echten Browser:
   R1  Deep-Link mit Zoom (--z1), „Link kopieren“, Story-Link, Suche mit eindeutigen Vorschlägen und Taste „/“,
       Auswahl nach Nur-Länder-Kennzahl, alle Geschichten × Kennzahlen × Ebenen ohne Fehler
   R2  Breitbild (Karte und Profilkarte nebeneinander), Treffer von Klicks, Handy-Rückmeldezeile, Ausreißer-Labels,
       Zustands-Reset bei Hash-Wechsel, Ladehinweis
   R3  „Ähnlich auf anderen Kontinenten“ (seit R5: höchstens 10 % wie in der Datenstory, bevölkerungsreichste je Kontinent), fünf Kennzahlen vorn,
       Suche im Seitenkopf, Farbstufen in Siebteln, Rang-Hinweis, Ukraine-Hinweis
   R4  Karte im ersten Bildschirm, geführte Geschichten in Schritten, ruhige Überschrift, kein Springen des Kastens,
       Profilkarte geordnet mit eingeklappter Tabelle, Hinweis bei alter Verteilung, Tastatur und Namen
   R5  „Geschichte schließen“ stellt den Zustand vor der ersten Geschichte her (alle acht, Abbruch in Schritt 2, direkter
       Wechsel, Zoom und --z1), Kennzahl-Name über dem großen Wert, Toleranz 10 % im Block und im Text, „Zwei Heimaten“
       Schritt 3 nennt die größeren Regionen und verweist auf die Story, Handy: Kasten und Karte beim Öffnen im Blick */
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { ({ chromium } = require(path.join(require("node:child_process").execSync("npm root -g").toString().trim(), "playwright"))); }

const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" }); fs.createReadStream(file).pipe(res);
});

const fails = []; let n = 0;
const ok = (cond, msg, info) => { n++; console.log((cond ? "✓ " : "✗ ") + msg + (!cond && info !== undefined ? "  · " + JSON.stringify(info).slice(0, 1500) : "")); if (!cond) fails.push(msg); };
let BASE = "", HOST = "";

async function open(browser, vp, hash = "", opts = {}) {
  const ctx = await browser.newContext(Object.assign({ viewport: vp }, opts));
  const page = await ctx.newPage(); const errors = [];
  page.on("console", m => { if (m.type() === "error" || (m.type() === "warning" && /atlas-extras/.test(m.text()))) errors.push("console: " + m.text()); });
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("request", r => { const u = r.url(); if (!/^(data|blob):/.test(u) && new URL(u).host !== HOST) errors.push("extern: " + u); });
  await page.goto(BASE + "wohlstandsatlas.html" + hash, { waitUntil: "load" }); await page.waitForTimeout(1300);
  return { ctx, page, errors };
}
const st = page => page.evaluate(() => ({ sel: selected.id, name: selected.name, level, metric: metric.k, view, hl: hlMode, thr, k: T.k, sq: [sqGroup, sqColor, sqUnit], grp: [...group], hash: location.hash }));
const more = page => page.evaluate(() => { const t = document.querySelector(".wx-mtoggle"); if (t && t.getAttribute("aria-expanded") !== "true") t.click(); });
async function clickLonLat(page, ll) {
  const p = await page.evaluate(ll => { const q = toScreen(proj(ll)); const r = cv.getBoundingClientRect(); return [r.left + q[0], r.top + q[1]]; }, ll);
  await page.mouse.click(p[0], p[1]); await page.waitForTimeout(250);
}
const mapGeo = page => page.evaluate(() => { const r = cv.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), share: Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) / r.height }; });
const BAD = /NaN|undefined|null|Infinity|\(\)/;
const KOELN = [6.957, 50.938], BERLIN = [13.40, 52.52], BRASILIA = [-47.9, -15.8];

// geführte Geschichten: Zustand je Schritt (Runde 4)
const STORY = {
  "Die Welt in Menschen": [{ view: "squares", sq: ["gdp_pc_ppp", "cont", "people"], sel: "DE300" }, { view: "squares", sq: ["cont", "gdp_pc_ppp", "people"] }, { view: "squares", sq: ["gdp_pc_ppp", "cont", "region"] }],
  "Wer ist reicher als Berlin?": [{ view: "map", level: 2, sel: "DE300", hl: "above", kMax: 1.01 }, { view: "map", level: 2, sel: "DE300", hl: "above", kMin: 3 }],
  "China: Küste gegen Inland": [{ level: 2, sel: "CN310000", hl: "off", kMin: 2 }, { level: 2, sel: "CN310000", hl: "below", kMin: 2 }],
  "Wenn BIP täuscht": [{ level: 2, metric: "gdp_pc_ppp", name: "Wolfsburg" }, { level: 2, metric: "hh_pc_ppp", name: "Wolfsburg" }, { level: 3, metric: "gdp_pc_ppp" }],
  "EU: unter 75 %": [{ level: 2, metric: "eu_index", hl: "below", thr: 75 }, { level: 1, metric: "eu_index", hl: "below", thr: 75 }, { level: 2, metric: "eu_index", hl: "below", kMin: 3 }],
  "Kaufkraft vor Ort": [{ level: 1, metric: "gdp_pc_ppp", sel: "USA-MS" }, { level: 1, metric: "gdp_pc_rp", sel: "USA-MS" }, { level: 2, metric: "gdp_pc_rp", sel: "DE212" }],
  "Metropolen statt Kreise": [{ level: 2, sel: "DE212", kMin: 10 }, { level: 3, sel: "M-DE003M" }],
  "Zwei Heimaten": [{ level: 2, sel: "DE40B", grp: ["DEA23"], hl: "off", kMin: 3, metric: "gdp_pc_ppp" }, { level: 2, sel: "DE40B", hl: "above", kMax: 1.01 }, { level: 2, sel: "DE40B", metric: "hh_pc_ppp", grp: ["DEA23"] }]
};
const stateOk = (s, e) => Object.keys(e).every(k => k === "kMin" ? s.k >= e.kMin : k === "kMax" ? s.k <= e.kMax : (k === "sq" || k === "grp") ? JSON.stringify(s[k]) === JSON.stringify(e[k]) : s[k] === e[k]);

async function run(browser) {
  // ---------- erster Bildschirm je Viewport (R3 + R4) ----------
  for (const [w, h] of [[1366, 800], [1440, 900], [1920, 1080], [390, 844]]) {
    const { ctx, page, errors } = await open(browser, { width: w, height: h }, "#DEA23--m0--l2");
    const g = await mapGeo(page);
    const c = await page.evaluate(() => {
      const vis = e => !!e && e.getClientRects().length > 0 && !e.hidden;
      const hd = document.querySelector(".wrap > header"), q = document.getElementById("q");
      return { metrics: [...document.querySelectorAll("#metrics .chip")].filter(vis).length, allMetrics: document.querySelectorAll("#metrics .chip").length,
        levels: [...document.querySelectorAll("#levels .chip")].filter(vis).length, views: [...document.querySelectorAll("#views .chip[data-v]")].filter(vis).length,
        cwHidden: [...document.querySelectorAll("#views [data-cw]")].every(b => !vis(b)), cwt: document.getElementById("wx-cwt") && document.getElementById("wx-cwt").getAttribute("aria-expanded"),
        qHead: hd.contains(q) && hd.contains(document.getElementById("names")), stories: document.querySelectorAll("#stories .chip").length,
        twins: !!document.querySelector("#card .wx-twins"), link: (document.querySelector("#card .wx-links a") || {}).getAttribute ? document.querySelector("#card .wx-links a").getAttribute("href") : null,
        copy: !!document.getElementById("copylink"), rel: document.querySelectorAll(".wx-related a").length, exH: document.getElementById("explain").clientHeight,
        ov: document.documentElement.scrollWidth - document.documentElement.clientWidth };
    });
    if (w === 390) ok(g.share > 0.999, `${w}×${h}: Karte ganz im ersten Bildschirm (Oberkante ${g.top})`, g);
    else ok(g.share >= (w === 1920 ? 0.99 : 0.67), `${w}×${h}: Karte zu ${Math.round(g.share * 100)} % im ersten Bildschirm (Oberkante ${g.top})`, g);
    ok(c.metrics === 5 && c.allMetrics === 10 && c.levels === 4 && c.views === 2 && c.cwHidden && c.cwt === "false" && c.stories === 8 && c.qHead,
      `${w}: 8 Geschichten, 5 von 10 Kennzahlen, 4 Ebenen und 2 Ansichten ohne Aufklappen, Farbstufen eingeklappt, Suche im Kopf`, c);
    ok(c.twins && c.link === "zwei-heimaten.html#vs=DEA23" && c.copy && c.rel === 2 && c.exH <= (w <= 700 ? 45 : 24) && c.ov <= 0 && !errors.length,
      `${w}: Erweiterungen da (Ähnliche, Story-Link, Link kopieren, Weiterlesen), Erklärtext gekürzt, kein Querüberlauf, keine Fehler`, { c, errors });
    if (w === 1920) {
      const side = await page.evaluate(() => { const c = document.getElementById("card").getBoundingClientRect(), m = cv.getBoundingClientRect(); return { cardLeft: c.left, mapRight: m.right, dTop: Math.abs(c.top - m.top), cardH: c.height, mapBottom: m.bottom, sharp: cv.width === Math.round(CW * dpr) }; });
      // R5: Grenze 1100 → 1160 px: mit 10 % Toleranz zeigt Köln drei ähnliche Einheiten statt einer, dazu der Kennzahl-Name über dem Wert
      ok(side.cardLeft > side.mapRight && side.dTop < 4 && side.sharp && side.cardH <= 1160, "1920: Profilkarte neben der Karte, oben bündig, höchstens 1160 px hoch, Canvas scharf", side);
    }
    await ctx.close();
  }

  // ---------- geführte Geschichten (R4), 1366 und Handy ----------
  for (const [w, h] of [[1366, 800], [390, 844]]) {
    const { ctx, page, errors } = await open(browser, { width: w, height: h }, "#DEA23--m0--l2", { reducedMotion: "reduce" });
    for (const t of Object.keys(STORY)) {
      if (w === 390 && !["Wenn BIP täuscht", "Zwei Heimaten"].includes(t)) continue;
      await page.evaluate(() => scrollTo(0, 0));
      await page.click(`#stories .chip >> text="${t}"`); await page.waitForTimeout(400);
      const exp = STORY[t], rec = [];
      for (let i = 0; i < exp.length; i++) {
        if (i) { if (w === 390) await page.evaluate(() => scrollTo(0, 0)); await page.click('.wx-steps [data-d="1"]'); await page.waitForTimeout(400); }
        const r = await page.evaluate(() => { const b = document.getElementById("storybox").getBoundingClientRect(), m = cv.getBoundingClientRect();
          return { text: document.getElementById("storytext").textContent, n: document.querySelector(".wx-steps .wx-stepn").textContent, boxH: Math.round(b.height), boxTop: b.top,
            lead: document.getElementById("lead").textContent, mapTop: Math.round(m.top + scrollY), mapSeen: Math.max(0, Math.min(innerHeight, m.bottom) - Math.max(0, m.top)) / m.height,
            link: document.querySelector("#storytext a") && document.querySelector("#storytext a").getAttribute("href"), focus: document.activeElement && document.activeElement.getAttribute("data-d") }; });
        r.s = await st(page); rec.push(r);
      }
      ok(rec.every((r, i) => r.n === `Schritt ${i + 1} von ${exp.length}` && stateOk(r.s, exp[i])), `${w} „${t}“: ${exp.length} Schritte, jeder schaltet seinen Zustand`, rec.map(r => [r.n, r.s]));
      ok(rec.every(r => r.text.length > 60 && !BAD.test(r.text)) && new Set(rec.map(r => r.text)).size === rec.length, `${w} „${t}“: Texte vollständig, ohne NaN/undefined`, rec.map(r => r.text));
      const hs = rec.map(r => r.boxH);
      ok(Math.max(...hs) - Math.min(...hs) <= 1 && new Set(rec.map(r => r.lead)).size === 1 && /^Die Hälfte der Menschheit lebt in Gebieten mit weniger als [\d.]+ Int\.\$ BIP pro Kopf \(KKP\)\.$/.test(rec[0].lead) && rec.every(r => r.boxTop >= -1),
        `${w} „${t}“: Kasten springt nicht (${hs.join("/")} px), Text bleibt lesbar, Überschrift ruhig`, { hs, leads: rec.map(r => r.lead), tops: rec.map(r => r.boxTop) });
      if (w === 390) ok(rec.slice(1).every(r => r.mapSeen >= 0.6 && (r.focus === "1" || r.focus === "-1")), `390 „${t}“: nach „Weiter →“ ist die Karte im Blick, der Fokus bleibt am Knopf`, rec.map(r => [r.mapSeen, r.focus]));
      else ok(new Set(rec.map(r => r.mapTop)).size === 1, `1366 „${t}“: Karte bleibt beim Weiterklicken stehen`, rec.map(r => r.mapTop));
      await page.click('.wx-steps [data-d="-1"]'); await page.waitForTimeout(350);
      ok(stateOk(await st(page), exp[exp.length - 2]), `${w} „${t}“: „← Zurück“ stellt den vorigen Schritt her`);
      if (t === "Zwei Heimaten") ok(/51\.300 Int\.\$/.test(rec[0].text) && /115\.000 Int\.\$/.test(rec[0].text) && /rund 86 %/.test(rec[1].text) && /rund 98 %/.test(rec[1].text) && /Ähnlich hoch:/.test(rec[1].text) &&
        /nah beieinander/.test(rec[2].text) && !/gleichauf/i.test(rec.map(r => r.text).join(" ")) && rec[0].link === "zwei-heimaten.html" && rec[1].link === "zwei-heimaten.html" && rec[2].link === "zwei-heimaten.html#akt-4",
        `${w} Zwei Heimaten: 51.300/115.000, rund 86 %/98 %, „Ähnlich hoch“, Haushalte nah beieinander, Link zur Story (Schritt 3: Akt 4)`, rec.map(r => [r.text, r.link]));
      if (t === "Wenn BIP täuscht") ok(/270\.000 Int\.\$/.test(rec[0].text) && /37\.000 Int\.\$/.test(rec[1].text) && /größere NUTS-2-Region, nicht für Wolfsburg allein/.test(rec[1].text) && !/Wolfsburg/.test(rec[1].lead) && /Metropolregionen/.test(rec[2].text),
        `${w} Wenn BIP täuscht: 270.000 → 37.000 (gilt für die größere Region, Überschrift nennt Wolfsburg nicht) → Metropolregion`, rec.map(r => [r.text, r.lead]));
      await page.click("#storyclose"); await page.waitForTimeout(200);
      ok(/ liegt mit /.test(await page.evaluate(() => document.getElementById("lead").textContent)), `${w} „${t}“: nach dem Schließen wieder die volle Überschrift`);
    }
    ok(!errors.length, `${w}: Geschichten ohne Fehler`, errors);
    await ctx.close();
  }

  // ---------- R5: Zustand nach dem Schließen einer Geschichte ----------
  {
    const { ctx, page, errors } = await open(browser, { width: 1366, height: 800 }, "", { reducedMotion: "reduce" });
    const full = p => page.evaluate(() => ({ sel: selected.id, level, metric: metric.k, view, hl: hlMode, thr, cm: classMode, gm: groupMode, sq: [sqGroup, sqColor, sqUnit], grp: [...group],
      k: +T.k.toFixed(3), x: Math.round(T.x), y: Math.round(T.y), hash: location.hash }));
    const g = await page.evaluate(() => byId.get("DEA23")._i.toString(36));
    // Ausgangszustand mit allem, was eine Geschichte verstellt: Kennzahl, Ebene, Hervorhebung + Schwelle, Farbstufen, Gruppe, Zoom
    await page.evaluate(h => { location.hash = h; }, `#USA-TX--m1--l1--vm--ha--cp--t40000--g${g}`); await page.waitForTimeout(350);
    await page.click("#zoom >> text=Europa"); await page.waitForTimeout(150);
    const s0 = await full(page);
    const names = Object.keys(STORY), diff = (a, b) => Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    const res = {};
    for (let j = 0; j < names.length; j++) {
      const t = names[j], t2 = names[(j + 1) % names.length], r = {};
      // a) Abbruch in Schritt 2
      await page.click(`#stories .chip >> text="${t}"`); await page.waitForTimeout(120);
      const changed = diff(await full(page), s0).length;
      await page.click('.wx-steps [data-d="1"]'); await page.waitForTimeout(120);
      await page.click("#storyclose"); await page.waitForTimeout(150);
      r.abbruch = diff(await full(page), s0); r.changed = changed;
      r.focus = await page.evaluate(() => document.activeElement && document.activeElement.textContent);
      // b) direkter Wechsel in die nächste Geschichte (Schritt 2), dann schließen
      await page.click(`#stories .chip >> text="${t}"`); await page.waitForTimeout(100);
      await page.click('.wx-steps [data-d="1"]'); await page.waitForTimeout(100);
      await page.click(`#stories .chip >> text="${t2}"`); await page.waitForTimeout(100);
      await page.click('.wx-steps [data-d="1"]'); await page.waitForTimeout(100);
      await page.click("#storyclose"); await page.waitForTimeout(150);
      r.wechsel = diff(await full(page), s0);
      res[t] = r;
    }
    ok(names.every(t => !res[t].abbruch.length && !res[t].wechsel.length && res[t].changed > 0 && res[t].focus === t),
      "Alle 8 Geschichten: Schließen (auch in Schritt 2 und nach direktem Wechsel) stellt Kennzahl, Ebene, Ansicht, Farbstufen, Hervorhebung, Schwelle, Gruppe, Auswahl, Zoom und Hash wieder her; Fokus zurück auf den Geschichten-Knopf",
      { s0, res });
    // Hash nach dem Schließen beschreibt den Zustand: neu laden ergibt denselben Zustand
    const h1 = s0.hash;
    const re = await open(browser, { width: 1366, height: 800 }, h1);
    const s1 = await re.page.evaluate(() => ({ sel: selected.id, level, metric: metric.k, view, hl: hlMode, thr, cm: classMode, grp: [...group] }));
    ok(["sel", "level", "metric", "view", "hl", "thr", "cm", "grp"].every(k => JSON.stringify(s1[k]) === JSON.stringify(s0[k])), "Hash nach dem Schließen öffnet denselben Zustand", { s0, s1 });
    await re.ctx.close();
    // Zoom-Link --z1 bleibt erhalten, Mausrad-/Kennzahlwechsel in der Geschichte wird ebenfalls zurückgenommen
    await page.evaluate(() => { location.hash = "#DE40B--m0--l2--z1"; }); await page.waitForTimeout(900);
    const z0 = await full(page);
    await page.click('#stories .chip >> text="China: Küste gegen Inland"'); await page.waitForTimeout(150);
    await page.click("#metrics >> text=Bevölkerungsdichte"); await page.click('#levels >> text="Länder"'); await page.waitForTimeout(100);
    await page.click("#storyclose"); await page.waitForTimeout(200);
    const z1 = await full(page);
    ok(!diff(z1, z0).length && /--z1$/.test(z1.hash), "Geschichte über einem --z1-Link: nach dem Schließen wieder dieselbe Auswahl, derselbe Zoom und --z1 im Link", { z0, z1 });
    ok(!errors.length, "R5 Schließen: keine Fehler", errors);
    await ctx.close();
  }
  {
    // mit Animation: der Zoom kehrt nach dem Übergang an den Ausgangspunkt zurück
    const { ctx, page, errors } = await open(browser, { width: 1366, height: 800 }, "#DEA23--m2--l2");
    await page.click("#zoom >> text=Asien"); await page.waitForTimeout(900);
    const a = await st(page);
    await page.click('#stories .chip >> text="Kaufkraft vor Ort"'); await page.waitForTimeout(900);
    await page.click("#storyclose"); await page.waitForTimeout(900);
    const b = await st(page);
    ok(a.sel === b.sel && a.metric === b.metric && a.level === b.level && Math.abs(a.k - b.k) < 1e-3 && a.hash === b.hash && !errors.length, "Mit Animation: Zoom-Ausschnitt nach dem Schließen wie vorher", { a, b, errors });
    await ctx.close();
  }

  // ---------- R5: Kennzahl-Name in der Profilkarte, „Zwei Heimaten“ Schritt 3 ----------
  {
    const { ctx, page, errors } = await open(browser, { width: 1366, height: 800 }, "#DEA23--m0--l2", { reducedMotion: "reduce" });
    const lab = await page.evaluate(async () => { const out = [];
      for (const h of ["#DEA23--m0--l2", "#DE40B--m1--l2", "#USA-TX--m1--l1", "#DEA23--m2--l2", "#DEA23--m8--l2", "#DEU--m9--l0"]) {
        location.hash = h; await new Promise(r => setTimeout(r, 200));
        const l = document.querySelector("#card .big .wx-mlab"), v = document.querySelector("#card .big .v");
        out.push({ h, m: metric.label, l: l && l.textContent, above: !!l && l.getBoundingClientRect().bottom <= v.getBoundingClientRect().top + 1,
          upper: !!l && getComputedStyle(l).textTransform === "uppercase", note: selected.hh_note || null }); }
      return out; });
    ok(lab.every(x => x.above && x.upper && (x.h === "#DE40B--m1--l2" ? x.l === x.m + " · Wert der größeren NUTS-2-Region" : x.l === x.m)) && new Set(lab.map(x => x.m)).size >= 5,
      "Profilkarte: Name der aktiven Kennzahl in Versalien über dem großen Wert (6 Fälle, 5 Kennzahlen), Haushaltswert der größeren Region gekennzeichnet", lab);
    // Klick auf eine Kennzahl in „Alle Kennzahlen“ wechselt auch das Label
    await page.evaluate(() => { location.hash = "#DEA23--m0--l2"; }); await page.waitForTimeout(200);
    await page.evaluate(() => { const d = document.querySelector("#card details.wx-all"); d.open = true; });
    await page.click('#card details.wx-all .cmp button[data-k="gdp_pc_usd"]'); await page.waitForTimeout(150);
    ok(await page.evaluate(() => document.querySelector("#card .big .wx-mlab").textContent === "BIP/Kopf nominal"), "Profilkarte: Label folgt dem Kennzahlwechsel");
    // „Zwei Heimaten“ Schritt 3: wessen Wert, Zahlen aus den Daten, Verweis auf die Story ohne Zahlen aus der Story
    const zh = await page.evaluate(() => {
      const s = STORIES.find(x => x.t === "Zwei Heimaten"), st3 = s.steps[2], o = byId.get("DE40B"), k = byId.get("DEA23"), MH = METRICS.find(m => m.k === "hh_pc_ppp");
      const t = st3.text(), want = [`der Regierungsbezirk Köln auf ${MH.fmt(k.hh_pc_ppp)}`, `das Land Brandenburg auf ${MH.fmt(o.hh_pc_ppp)}`];
      // Ausweichtext, falls die Daten einmal keine NUTS-2-Werte mehr wären
      const n0 = [o.hh_note, k.hh_note]; o.hh_note = null; k.hh_note = null; const fb = st3.text(); o.hh_note = "Wert der übergeordneten Region"; const fb2 = st3.text(); o.hh_note = n0[0]; k.hh_note = n0[1];
      return { t, want, has: want.every(w => t.includes(w)), link: st3.link, fb, fb2 }; });
    ok(zh.has && /^Für Haushalte kennt der Atlas nur den Regierungsbezirk Köln und das Land Brandenburg, nicht die beiden Kreise: /.test(zh.t) && /Die Datenstory rechnet mit den Werten der beiden Kreise selbst\.$/.test(zh.t) &&
      zh.link && zh.link.href === "zwei-heimaten.html#akt-4" && !BAD.test(zh.t) && !/39\.400|34\.400|1,14/.test(zh.t) &&
      /OSL kommt auf [\d.]+ Int\.\$, Köln auf [\d.]+ Int\.\$\. Weltweit/.test(zh.fb) && /\(teils Wert einer größeren Region\)/.test(zh.fb2) && !BAD.test(zh.fb + zh.fb2),
      "Zwei Heimaten Schritt 3: Werte als Regierungsbezirk Köln / Land Brandenburg benannt (aus den Daten), Hinweis und Link auf Akt 4 der Story ohne Story-Zahlen; Ausweichtexte ohne NaN/undefined", zh);
    ok(!errors.length, "R5 Profilkarte/Zwei Heimaten: keine Fehler", errors);
    await ctx.close();
  }

  // ---------- R5: Handy, beim Öffnen einer Geschichte Kasten und Karte im Blick ----------
  for (const [w, h, rm] of [[390, 844, "reduce"], [360, 640, "reduce"], [390, 844, "no-preference"]]) {
    const { ctx, page, errors } = await open(browser, { width: w, height: h }, "#DEA23--m0--l2", { reducedMotion: rm, hasTouch: true, isMobile: true });
    const rec = {};
    for (const t of Object.keys(STORY)) {
      if (rm !== "reduce" && !["Zwei Heimaten", "Die Welt in Menschen"].includes(t)) continue;
      await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(60);
      await page.click(`#stories .chip >> text="${t}"`); await page.waitForTimeout(rm === "reduce" ? 120 : 900);
      rec[t] = await page.evaluate(() => { const b = document.getElementById("storybox").getBoundingClientRect(), tx = document.getElementById("storytext").getBoundingClientRect(), m = cv.getBoundingClientRect(),
        a = document.activeElement;
        return { boxTop: Math.round(b.top), txtBot: Math.round(tx.bottom), mapTop: Math.round(m.top), mapMid: Math.round(m.top + m.height / 2), vh: innerHeight, step: document.querySelector(".wx-steps .wx-stepn").textContent,
          focus: a && (a.id === "storybox" ? "box" : a.closest("#stories") ? "chip" : a.tagName), focusSeen: !!a && a.getBoundingClientRect().bottom > 0 && a.getBoundingClientRect().top < innerHeight }; });
      await page.click("#storyclose"); await page.waitForTimeout(100);
    }
    const ks = Object.keys(rec);
    ok(ks.every(t => rec[t].boxTop >= 0 && rec[t].txtBot <= rec[t].vh && rec[t].mapMid <= rec[t].vh && /^Schritt 1 von/.test(rec[t].step) && (rec[t].focus === "box" || rec[t].focus === "chip") && rec[t].focusSeen) && !errors.length,
      `${w}×${h}${rm === "reduce" ? " (ohne Animation)" : ""}: beim Öffnen von ${ks.length} Geschichten Kasten samt Text und mindestens die obere Hälfte der Karte im Blick, Fokus sichtbar`, { rec, errors });
    await ctx.close();
  }

  // ---------- Hauptdurchlauf 1366 (R1–R4) ----------
  {
    const { ctx, page, errors } = await open(browser, { width: 1366, height: 800 });
    // Nur-Länder-Kennzahl und zurück
    const b0 = await st(page);
    await page.click("#metrics >> text=Ungleichheit (Gini)"); const bG = await st(page);
    const disG = await page.$$eval("#levels .chip", bs => bs.map(b => b.disabled));
    await page.click("#metrics >> text=BIP/Kopf (KKP)"); const bB = await st(page);
    const disB = await page.$$eval("#levels .chip", bs => bs.map(b => b.disabled));
    ok(b0.sel === "DE300" && bG.sel === "DEU" && bB.sel === "DE300" && bB.level === 2 && disG.slice(1).every(Boolean) && disB.every(d => !d), "Gini → BIP/Kopf: Ebenen wieder frei, Berlin wieder ausgewählt", { b0, bG, bB });
    // Überschrift außerhalb einer Geschichte: Haushaltswert einer größeren Region
    const wid = await page.evaluate(() => findName("Wolfsburg").id);
    await page.evaluate(h => { location.hash = h; }, `#${wid}--m1--l2`); await page.waitForTimeout(350);
    ok(/Wolfsburg liegt mit 37\.000 Int\.\$ \(Wert der größeren NUTS-2-Region\) über/.test(await page.evaluate(() => document.getElementById("lead").textContent)), "Überschrift: Haushaltswert von Wolfsburg als Wert der größeren NUTS-2-Region gekennzeichnet");
    // Zwillinge (R3, R5): je Kontinent die bevölkerungsreichste Einheit höchstens 10 % darüber oder darunter (wie die Datenstory), Klick wählt und zoomt
    for (const id of ["DE40B", "DEA23", "DE212", "US48201", "CN330100"]) {
      await page.evaluate(h => { location.hash = h; }, `#${id}--m0--l2`); await page.waitForTimeout(300);
      const r = await page.evaluate(() => {
        const sel = selected, k = metric.k, v = sel[k], ref = {};
        atLevel().forEach(x => { const w = x[k]; if (w == null || !(w > 0) || x === sel || x.country === sel.country || x.ct === sel.ct || !x.ct) return;
          if (x.small || x.hot || x.nogeo || x.flag === "missing" || !(x.pop >= 1e5) || x.kind === "Land/Gebiet" || x.kind === "nicht zugeordnet" || x.kind === "Offshore") return;
          if (Math.abs(w / v - 1) > 0.10) return; if (!ref[x.ct] || x.pop > ref[x.ct].pop) ref[x.ct] = x; });
        const box = document.querySelector("#card .wx-twins");
        return { h3: box && box.querySelector("h3").textContent, note: box && box.textContent, shown: box ? [...box.querySelectorAll("button[data-id]")].map(b => b.dataset.id) : [],
          names: box ? [...box.querySelectorAll("button[data-id] .wx-n")].map(b => b.textContent) : [],
          ref: Object.values(ref).sort((a, b) => b.pop - a.pop).slice(0, 3).map(x => x.id) };
      });
      ok(r.h3 === "Ähnlich auf anderen Kontinenten" && /Hochrechnungen und können sich bei Revisionen um mehrere Prozent ändern/.test(r.note) && /höchstens 10 % darüber oder darunter/.test(r.note) && !/±/.test(r.note) &&
        JSON.stringify(r.shown) === JSON.stringify(r.ref) && r.shown.length > 0, `${id}: „Ähnlich auf anderen Kontinenten“ (10 %) stimmt mit unabhängiger Nachrechnung: ${r.names.join(" · ")}`, r);
    }
    const first = await page.evaluate(() => document.querySelector("#card .wx-twins button[data-id]").dataset.id);
    await page.click(`#card .wx-twins button[data-id="${first}"]`); await page.waitForTimeout(1000);
    let s = await st(page);
    ok(s.sel === first && s.k > 2 && /--z1$/.test(s.hash), "Klick auf einen ähnlichen Ort wählt ihn und zoomt (--z1 im Link)", s);
    // Rang-Hinweis, Story-Link nur für geeignete Einheiten
    const sl = await page.evaluate(async () => { const out = {};
      for (const h of ["#DEA23--m0--l2", "#DEU--m0--l0", "#M-DE004M--m0--l3", "#USA-DE--m0--l1"]) { location.hash = h; await new Promise(r => setTimeout(r, 220)); const a = document.querySelector("#card .wx-links a"); out[h] = [a ? a.getAttribute("href") : null, (document.querySelector("#card .wx-rankhint") || {}).textContent || ""]; }
      return out; });
    ok(sl["#DEA23--m0--l2"][0] === "zwei-heimaten.html#vs=DEA23" && sl["#DEU--m0--l0"][0] === "zwei-heimaten.html#vs=DEU" && sl["#M-DE004M--m0--l3"][0] === null && /Rang zählt Einheiten/.test(sl["#DEA23--m0--l2"][1]) && /Rang zählt Länder/.test(sl["#DEU--m0--l0"][1]),
      "Story-Link nur für geeignete Einheiten, Hinweis „Rang zählt Einheiten/Länder“", sl);
    // Profilkarte (R4): Reihenfolge, Tabelle eingeklappt, Zustand bleibt
    await page.evaluate(() => { location.hash = "#DEA23--m0--l2"; }); await page.waitForTimeout(300);
    const pc = await page.evaluate(() => { const el = document.getElementById("card"), y = e => e ? e.getBoundingClientRect().top : null, d = el.querySelector("details.wx-all");
      return { order: [y(el.querySelector(".big")), y(el.querySelector(".stats")), y(el.querySelector(".wx-links")), y(el.querySelector(".wx-twins")), y([...el.querySelectorAll("h3")].find(x => /Auf einer Stufe/.test(x.textContent))), y(d), y([...el.querySelectorAll(".dq")].pop())],
        open: d && d.open, btns: d ? d.querySelectorAll(".cmp button").length : 0 }; });
    await page.focus("#card details.wx-all > summary"); await page.keyboard.press("Enter"); await page.waitForTimeout(100);
    await page.evaluate(() => pick(byId.get("DE300"))); await page.waitForTimeout(200);
    const still = await page.evaluate(() => document.querySelector("#card details.wx-all").open);
    await page.click('#card details.wx-all .cmp button[data-k="hh_pc_ppp"]'); await page.waitForTimeout(150);
    const mk = await page.evaluate(() => metric.k);
    ok(pc.order.every((v, i, a) => v != null && (!i || v > a[i - 1])) && pc.open === false && pc.btns === 10 && still && mk === "hh_pc_ppp",
      "Profilkarte: Wert · Kacheln · Story-Link · Ähnliche · Auf einer Stufe · „Alle Kennzahlen“ (eingeklappt, per Tastatur, bleibt offen) · Quellen", { pc, still, mk });
    // Hinweise zur Datenlage: Ukraine (R3), alte Verteilung (R4)
    const dq = await page.evaluate(async () => { const out = {};
      for (const id of ["UA-09", "IR-01", "DEA23"]) { const u = byId.get(id); location.hash = "#" + id + "--m0--l" + Math.max(...u.lv.filter(l => l <= 2)); await new Promise(r => setTimeout(r, 220));
        out[id] = { ukr: (document.querySelector("#card .wx-ukr") || {}).textContent || null, old: (document.querySelector("#card .wx-old") || {}).textContent || null }; }
      const c = {}; units.forEach(u => { const k = byId.get(u.country); if (u.kind !== "Land/Gebiet" && u.flag !== "missing" && /^\d{4}$/.test(String(u.year)) && k && /^\d{4}$/.test(String(k.year)) && +k.year - +u.year >= 5) c[u.country] = 1; });
      out.countries = Object.keys(c); return out; });
    ok(/Verteilung von 2021, vor dem Krieg/.test(dq["UA-09"].ukr || "") && !dq["UA-09"].old && dq["IR-01"].old === "Verteilung von 2018, also 6 Jahre älter als der Landeswert." && !dq.DEA23.old && !dq.DEA23.ukr && JSON.stringify(dq.countries) === '["IRN"]',
      "Hinweise: Ukraine (Verteilung 2021), Iran (Verteilung 2018, 6 Jahre älter); Schwelle 5 Jahre trifft nur Iran", dq);
    // Zoom-Link --z1
    await page.evaluate(() => { location.hash = "#DE40B--m0--l2--z1"; }); await page.waitForTimeout(1200);
    s = await st(page);
    ok(s.sel === "DE40B" && s.k > 5 && /--z1$/.test(s.hash), "Hash-Wechsel auf …--z1 zoomt auf die Auswahl", s);
    await page.click("#zoom >> text=Welt"); await page.waitForTimeout(800);
    s = await st(page); ok(!/z1/.test(s.hash) && s.k === 1, "Zoom „Welt“ entfernt --z1", s);
    // Link kopieren
    await page.evaluate(() => { window.__clip = null; navigator.clipboard.writeText = t => { window.__clip = t; return Promise.resolve(); }; });
    await page.click("#copylink"); await page.waitForTimeout(150);
    const cp = await page.evaluate(() => ({ clip: window.__clip, href: location.href, toast: document.getElementById("toast").textContent }));
    ok(cp.clip === cp.href && cp.toast === "Link kopiert.", "„Link kopieren“ liefert die aktuelle Adresse", cp);
    // Hash-Wechsel setzt den Zustand zurück
    const ids = await page.evaluate(() => [byId.get("DE300")._i.toString(36), byId.get("DEA23")._i.toString(36)]);
    await page.evaluate(h => { location.hash = h; }, `#DE300--m0--l2--vm--ha--cp--up--t67000--g${ids[0]}`); await page.waitForTimeout(350);
    await page.evaluate(h => { location.hash = h; }, `#DEA23--m0--l2--g${ids[1]}`); await page.waitForTimeout(350);
    const hz = await page.evaluate(() => ({ grp: [...group], hl: hlMode, cm: classMode, hash: location.hash }));
    ok(hz.grp.length === 1 && hz.grp[0] === "DEA23" && hz.hl === "off" && hz.cm === "countries" && /--ho--cc--/.test(hz.hash), "Hash-Wechsel startet vom Grundzustand (Gruppe, Hervorhebung, Farbstufen)", hz);
    // Farbstufen in Siebteln, Umschalter
    await page.click("#wx-cwt"); await page.click('#views [data-cw="people"]'); await page.waitForTimeout(200);
    const fc = await page.evaluate(() => ({ a: document.querySelector('#views [data-cw="countries"]').textContent, nq: scaleOf("gdp_pc_ppp").q.length, cap: document.getElementById("lcap").textContent, hash: location.hash }));
    ok(fc.a === "je 1/7 der Länder" && fc.nq === 6 && /Siebtel der Menschheit/.test(fc.cap) && /--cp--/.test(fc.hash), "Farbstufen: „je 1/7“ passt zur Rechnung, Wechsel wirkt und steht im Link", fc);
    // Suche
    await page.evaluate(() => { location.hash = "#DE300--m0--l2"; }); await page.waitForTimeout(300);
    await page.click("h1"); await page.keyboard.press("/");
    const fq = await page.evaluate(() => document.activeElement.id);
    await page.keyboard.type("Delaware"); await page.keyboard.press("Enter"); await page.waitForTimeout(300);
    s = await st(page); if (s.sel !== "USA-DE") { await page.click("h1"); await page.waitForTimeout(300); s = await st(page); }
    const opts = await page.$$eval("#names option", os => os.map(o => o.value));
    const dupe = opts.length - new Set(opts.map(v => v.toLowerCase())).size;
    ok(fq === "q" && s.sel === "USA-DE" && s.level === 1 && dupe === 0 && opts.filter(v => /^Köln \((?!außerhalb)/.test(v)).length === 2, "Suche: „/“ fokussiert, „Delaware“ wählt den Bundesstaat, Vorschläge eindeutig", { fq, s: s.sel, dupe });
    // Ausreißer-Labels (R2)
    await page.evaluate(() => { location.hash = "#DEA23--m0--l2"; }); await page.waitForTimeout(300);
    const lab = await page.evaluate(async () => { const texts = [], of = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function (t) { texts.push(String(t)); return of.apply(this, arguments); };
      redraw(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); CanvasRenderingContext2D.prototype.fillText = of;
      const hot = units.filter(u => u.hot && u.lv.includes(level)).map(u => u.name);
      return { hot: texts.filter(t => hot.some(n => t.startsWith(n + " "))), n: texts.length, cap: document.getElementById("lcap").textContent }; });
    ok(!lab.hot.length && lab.n >= 4 && /als Ausreißer markiert/.test(lab.cap) && /ohne Ausreißer [\d.]+ Int\.\$/.test(lab.cap), "Keine Ausreißer als Extrem-Labels, Legende nennt Ausreißer und Höchstwert ohne", lab);
    // Tastatur: Reihenfolge, Fokusrahmen, Namen, Umschalter-Zustände (R4)
    await page.focus("#q"); const seq = [];
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; if (!a.closest(".wrap")) return { out: true };
        const z = a.closest("#stories") ? "geschichten" : a.closest("#metrics") ? "kennzahlen" : a.closest("#explain") ? "erklaerung" : a.closest(".wx-g-lv") ? "ebenen" : a.closest(".wx-g-v") ? "ansicht" : a.closest(".wx-g-cw") ? "farbstufen" :
          a.closest(".mapbox") ? "karte" : a.closest("#card") ? "profilkarte" : a.closest(".find") ? "aktionen" : "sonst";
        const cs = getComputedStyle(a); return { z, name: (a.getAttribute("aria-label") || (a.labels && a.labels.length ? a.labels[0].textContent : "") || a.textContent || "").trim(), outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 1 }; });
      if (!f) continue; if (f.out) { if (seq.length) break; continue; } seq.push(f);
    }
    const zones = []; seq.forEach(f => { if (zones[zones.length - 1] !== f.z) zones.push(f.z); });
    const want = ["geschichten", "kennzahlen", "erklaerung", "ebenen", "ansicht", "farbstufen", "karte", "aktionen", "profilkarte"], idx = want.map(z => zones.indexOf(z));
    ok(idx.every((v, i) => v >= 0 && (!i || v > idx[i - 1])) && seq.every(f => f.outline && f.name), "Tastatur: Suche → Geschichten → Kennzahlen → Erklärung → Ebenen → Ansicht → Farbstufen → Karte → Aktionen → Profilkarte; Fokus sichtbar, alles benannt",
      { zones, bad: seq.filter(f => !f.outline || !f.name) });
    const tog = await page.evaluate(() => { const p = s => [...document.querySelectorAll(s)].map(b => b.getAttribute("aria-pressed"));
      return [p("#stories .chip"), p("#metrics .chip"), p("#levels .chip"), p("#views .chip[data-v]"), p("#views [data-cw]")].every(a => a.length && a.every(v => v === "true" || v === "false")) &&
        ["#wx-cwt", ".wx-mtoggle", "#explain .wx-more"].every(s => /^(true|false)$/.test(document.querySelector(s).getAttribute("aria-expanded"))); });
    ok(tog, "Umschalter tragen aria-pressed (Geschichten, Kennzahlen, Ebenen, Ansicht, Farbstufen) bzw. aria-expanded (Farbstufen, Weitere Kennzahlen, mehr)");
    // alle Geschichten, alle Kennzahlen × Ebenen, beide Ansichten
    const before = errors.length;
    for (const t of Object.keys(STORY)) { await page.click(`#stories .chip >> text="${t}"`); await page.waitForTimeout(150); }
    await page.click("#storyclose"); await more(page);
    const mets = await page.$$eval("#metrics .chip", bs => bs.map(b => b.textContent));
    for (const lv of ["Länder", "Bundesländer-Ebene", "Feinste Ebene", "Metropolregionen"]) for (const m of mets) {
      await page.click(`#metrics .chip >> text="${m}"`); await page.waitForTimeout(20);
      const dis = await page.$eval(`#levels .chip >> nth=${["Länder", "Bundesländer-Ebene", "Feinste Ebene", "Metropolregionen"].indexOf(lv)}`, b => b.disabled);
      if (!dis) await page.click(`#levels .chip >> text="${lv}"`);
    }
    await page.click("#views >> text=Quadrate"); await page.waitForTimeout(250); await page.click("#views >> text=Karte"); await page.waitForTimeout(250);
    ok(mets.length === 10 && errors.length === before, "8 Geschichten, 10 Kennzahlen × 4 Ebenen, beide Ansichten ohne Fehler", errors.slice(before));
    ok(!errors.length, "Hauptdurchlauf ohne Konsolen-/Seitenfehler und ohne fremde Server", errors);
    await ctx.close();
  }

  // ---------- Treffer von Klicks nach den Layoutänderungen (R2 + R4) ----------
  for (const [w, h, dsf] of [[1366, 800, 1], [1366, 800, 2], [1920, 1080, 2], [390, 844, 2]]) {
    const { ctx, page, errors } = await open(browser, { width: w, height: h }, "#DE300--m0--l2", { deviceScaleFactor: dsf, reducedMotion: "reduce" });
    const sharp = await page.evaluate(() => Math.abs(cv.width - Math.round(CW * dpr)) <= 1 && Math.abs(cv.getBoundingClientRect().height - CH) < .6);
    await page.locator("#map").scrollIntoViewIfNeeded();
    await clickLonLat(page, BRASILIA); const a = await st(page);
    await page.click("#zoom >> text=Deutschland"); await page.waitForTimeout(400);
    await clickLonLat(page, KOELN); const b = await st(page);
    await clickLonLat(page, BERLIN); const c = await st(page);
    await page.click('#stories .chip >> text="Zwei Heimaten"'); await page.waitForTimeout(400);
    await page.locator("#map").scrollIntoViewIfNeeded(); await clickLonLat(page, KOELN); const d = await st(page);
    ok(sharp && /^BR/.test(a.sel) && b.sel === "DEA23" && c.sel === "DE300" && d.sel === "DEA23" && !errors.length, `${w}×${h}@${dsf}: Canvas scharf, Klicks treffen (Brasília, Köln, Berlin, Köln mit offener Geschichte)`, { sharp, a: a.sel, b: b.sel, c: c.sel, d: d.sel, errors });
    if (w === 390) {
      const fb = await page.evaluate(() => { const b = document.querySelector(".wx-pick"), r = b.getBoundingClientRect(); return { text: b.textContent, name: selected.name, disp: getComputedStyle(b).display, right: r.right, vw: document.documentElement.clientWidth }; });
      ok(fb.disp !== "none" && fb.text.includes(fb.name) && fb.right <= fb.vw, "390: Rückmeldezeile unter der Karte nennt die Auswahl", fb);
    }
    await ctx.close();
  }

  // ---------- Ladehinweis (R2) ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } }); const page = await ctx.newPage();
    await page.route("**/wohlstandsatlas/atlas-data.js", async r => { await new Promise(x => setTimeout(x, 2000)); r.continue(); });
    const nav = page.goto(BASE + "wohlstandsatlas.html#DEA23--m0--l2", { waitUntil: "load" }); await page.waitForTimeout(900);
    const during = await page.evaluate(() => getComputedStyle(document.querySelector(".wx-loading")).display);
    await nav; await page.waitForTimeout(700);
    const after = await page.evaluate(() => getComputedStyle(document.querySelector(".wx-loading")).display);
    ok(during !== "none" && after === "none", "Ladehinweis sichtbar, solange die Daten laden, danach weg", { during, after });
    await ctx.close();
  }
}

server.listen(0, "127.0.0.1", async () => {
  const port = server.address().port; BASE = `http://127.0.0.1:${port}/`; HOST = `127.0.0.1:${port}`;
  const t0 = Date.now(); let browser;
  try { browser = await chromium.launch(); await run(browser); }
  catch (e) { console.error(e); fails.push("Abbruch: " + (e && e.message)); }
  finally { if (browser) await browser.close(); server.close(); }
  console.log(`\n${n - fails.length}/${n} bestanden · ${Math.round((Date.now() - t0) / 1000)} s`);
  if (fails.length) { console.log("Fehlgeschlagen:\n- " + fails.join("\n- ")); process.exit(1); }
});
