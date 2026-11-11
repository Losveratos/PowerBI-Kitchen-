#!/usr/bin/env node
/* Browser-Test der fertigen Story (zwei-heimaten.html): lädt die Seite in mehreren Breiten, läuft alle Schritte ab
   und prüft, dass jede Grafik ihrem Schritt folgt, das Handy-Muster (Grafik oben fest, Karten laufen darunter und
   verschwinden hinter ihr), den Vertrag Schritt → Grafik (15 Schritte: 3/4/4/4; ±10 % um OSL in Akt 1 und 3,
   Unsicherheit in Akt 2, China und Ländermarken in Akt 3, Einkommen und Spannen in Akt 4), Schriftgrößen auf dem Handy,
   Texte innerhalb der Grafik, Zurückscrollen, die Zahlentabellen, Schätzfrage, Vergleich zweier Orte und den Link (#vs=…).

     node wohlstand-story/scripts/check_page.js        # Exit-Code 1 bei Fehlern

   Braucht Playwright mit Chromium (wie tests/run-all.js). Startet einen eigenen kleinen Server auf dem Repo-Root. */
const http = require("node:http"), fs = require("node:fs"), path = require("node:path");
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { ({ chromium } = require(path.join(require("node:child_process").execSync("npm root -g").toString().trim(), "playwright"))); }

const ROOT = path.resolve(__dirname, "..", "..");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" }); fs.createReadStream(file).pipe(res);
});

const fails = [];
const ok = (cond, msg) => { console.log((cond ? "✓ " : "✗ ") + msg); if (!cond) fails.push(msg); };

/* Schritt j ansteuern. Desktop: Kartenmitte in die Bildmitte; Handy: Kartenoberkante knapp unter die Aktivierungslinie */
async function goStep(page, j, mobile) {
  await page.evaluate(([j, mobile]) => { const s = document.querySelectorAll(".scrolly .step")[j], c = s.querySelector(".step-card").getBoundingClientRect();
    const g = s.closest(".scrolly").querySelector(".graphic").offsetHeight;
    const target = mobile ? c.top + scrollY - (g + (innerHeight - g) / 3) + 20 : c.top + scrollY + c.height / 2 - innerHeight / 2;
    scrollTo({ top: target, behavior: "instant" }); }, [j, !!mobile]);
}
/* Im Browser: Messung der sichtbaren Texte einer Akt-Grafik (effektive Schriftgröße = font-size × gerenderte Breite / viewBox-Breite,
   Bounding-Box innerhalb der Grafik) und Zustand der Hervorhebungen je Schritt */
const BROWSER_HELPERS = () => {
  const vis = e => { for (let n = e; n && n.tagName !== "svg"; n = n.parentNode) { const cs = getComputedStyle(n); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.05) return false; } return true; };
  window.measure = (a, minPx) => { const svg = document.getElementById("svg" + a), r = svg.getBoundingClientRect(), k = r.width / svg.viewBox.baseVal.width, small = [], out = []; let min = 99;
    svg.querySelectorAll("text").forEach(t => { if (!t.textContent.trim() || !vis(t)) return; const px = parseFloat(getComputedStyle(t).fontSize) * k; min = Math.min(min, px);
      if (minPx && px < minPx - 0.05) small.push(`„${t.textContent.slice(0, 24)}“ ${px.toFixed(1)} px`);
      const b = t.getBoundingClientRect(); if (b.left < r.left - 1 || b.right > r.right + 1 || b.top < r.top - 1 || b.bottom > r.bottom + 1) out.push(`„${t.textContent.slice(0, 24)}“`); });
    return { small, out, min }; };
  window.probe = (a, i) => { const q = s => [...document.querySelectorAll(s)], op = e => e && +getComputedStyle(e).opacity > 0.95, T = DATA.world.tight, W = DATA.world;
    const visTxt = s => q(s).filter(e => op(e.closest("g[class]") || e)).map(t => t.textContent).join(" | ");
    const res = { minPx: measure(a, 0).min, T, W };
    if (a === "1" && i === 2) { res.near = { cols: q("#svg1 rect.col").filter(r => r.getAttribute("fill") === NEAR).length, map: q("#svg1 path.kreis").filter(r => r.getAttribute("fill") === NEAR).length,
      lab: q("#svg1 g.o2 text").map(t => t.textContent).join(" "), op: q("#svg1 g.o2").every(op) }; res.share = fmt(Math.round(DATA.places.osl.de_richer_share)); }
    if (a === "2" && i === 1) { const g = document.querySelector("#svg2 g.o1"); res.unc = { op: op(g), w: +g.querySelector("rect").getAttribute("width"), lab: g.querySelector("text").textContent }; }
    if (a === "2" && i === 3) res.band = q("#svg2 g.o3 text").length;
    if (a === "3") { const fl = c => q("#svg3 rect.sq").filter(r => r.getAttribute("fill") === c).length;
      Object.assign(res, { cn: fl(CHINA), blue: fl(COL.l), near: fl(NEAR), amber: fl(COL.k), lab: q(`#svg3 g.o${i} text`).map(t => t.textContent).join(" "), fa: fmt(W.above_osl_mio), fc: fmt(W.cn_above_osl_mio) });
      const L = q("#svg3 [data-cmp]").filter(t => op(t.closest("g.o2"))), bx = L.map(t => t.getBoundingClientRect());
      res.cmp = L.map(t => t.textContent); res.cmpOverlap = bx.some((b, x) => bx.some((c, y) => y > x && b.left < c.right && c.left < b.right && b.top < c.bottom && c.top < b.bottom)); }
    if (a === "4") { const rows = q("#svg4 .bars > g[class^=s]");
      res.vis = { s0: rows.filter(g => g.classList.contains("s0") && op(g)).length, s1: rows.filter(g => g.classList.contains("s1") && op(g)).length, s2: rows.filter(g => g.classList.contains("s2") && op(g)).length };
      res.lab = rows.filter(op).map(g => g.textContent).join(" ");
      const ib = q("#svg4 .bars g.s2 rect.bar"), I = DATA.income; res.inc = { ratio: +ib[0].getAttribute("width") / +ib[1].getAttribute("width"), want: I.koeln.int / I.osl.int,
        k: r3(I.koeln.int), l: r3(I.osl.int), f: fmt(I.ratio, 2), lab: document.querySelector("#svg4 .bars g.s2").textContent };
      const pg = document.querySelector("#svg4 g.o3"); res.pers = pg && { op: op(pg), bars: +getComputedStyle(document.querySelector("#svg4 .bars")).opacity > 0.05, txt: pg.textContent,
        want: ["osl", "koeln"].map(k => Math.round(DATA.persons[k].p50)), sub: document.querySelector("#g4 .fig-title .s").textContent }; }
    return JSON.parse(JSON.stringify(res, (k, v) => typeof v === "function" ? undefined : v)); };
};

/* Handy-Prüfung: jede Akt-Sektion in kleinen Schritten durchscrollen. An jeder Stelle muss die Grafik vollständig
   sichtbar und oben liegen (kein Kartenteil darüber); im Moment der Aktivierung liegt die aktive Karte ganz unter der
   Grafik; solange ein Schritt aktiv ist, ist von seiner Karte noch ein lesbarer Teil unter der Grafik zu sehen. */
async function mobileScan(page, name) {
  const res = await page.evaluate(async () => {
    const wait = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 30))));
    const out = { tooHigh: [], covered: [], late: [], unreadable: [], wrongFig: [], seen: {}, maxRatio: 0 };
    for (const sec of document.querySelectorAll(".scrolly")) {
      const act = sec.dataset.act, gr = sec.querySelector(".graphic"), fig = sec.querySelector(".fig"), steps = [...sec.querySelectorAll(".step")];
      const y0 = sec.getBoundingClientRect().top + scrollY, y1 = y0 + sec.offsetHeight - innerHeight;
      let prev = null;
      for (let y = y0; y <= y1; y += 24) {
        scrollTo({ top: y, behavior: "instant" }); await wait();
        const g = gr.getBoundingClientRect();
        if (g.top < -1) continue;                                    // Sektion läuft schon aus dem Bild: Ende
        out.maxRatio = Math.max(out.maxRatio, g.height / innerHeight);
        if (g.height > innerHeight * 0.6) out.tooHigh.push(`Akt ${act}: ${Math.round(g.height)}px`);
        // oben liegt die Grafik: Stichproben im Grafik-Rechteck
        const svgR = fig.querySelector("svg").getBoundingClientRect();
        for (const fx of [0.05, 0.5, 0.95]) for (const fy of [0.05, 0.5, 0.95]) {
          const e = document.elementFromPoint(svgR.left + svgR.width * fx, svgR.top + svgR.height * fy);
          if (e && !gr.contains(e) && e.closest(".step-card")) { out.covered.push(`Akt ${act} @${Math.round(y - y0)}`); break; }
        }
        const act_ = steps.find(s => s.classList.contains("is-active"));
        if (!act_) continue;
        const idx = act_.dataset.idx, c = act_.querySelector(".step-card").getBoundingClientRect();
        if (fig.dataset.step !== idx) out.wrongFig.push(`Akt ${act}/${+idx + 1}`);
        if (act_ !== prev) {                                          // gerade aktiv geworden
          out.seen[act] = (out.seen[act] || 0) + 1;
          if (c.top < g.bottom - 1) out.late.push(`Akt ${act}/${+idx + 1}: Karte ${Math.round(c.top)} < Grafik ${Math.round(g.bottom)}`);
          prev = act_;
        }
        const ending = sec.getBoundingClientRect().bottom - g.bottom < innerHeight * 0.15;   // Sektion endet: letzte Karte läuft mit aus
        if (!ending && (c.bottom < g.bottom + 30 || c.top > innerHeight - 30)) out.unreadable.push(`Akt ${act}/${+idx + 1} @${Math.round(y - y0)}`);
      }
    }
    return out;
  });
  const total = await page.evaluate(() => document.querySelectorAll(".scrolly .step").length);
  const seen = Object.values(res.seen).reduce((a, b) => a + b, 0);
  ok(seen >= total, `${name}: beim Durchscrollen ${seen} Aktivierungen für ${total} Schritte`);
  ok(res.tooHigh.length === 0, `${name}: Grafik nie höher als 60 % des Schirms (max. ${Math.round(res.maxRatio * 100)} %)${res.tooHigh.length ? " – " + res.tooHigh.slice(0, 3).join(", ") : ""}`);
  ok(res.covered.length === 0, `${name}: keine Karte überdeckt die Grafik${res.covered.length ? " – " + res.covered.slice(0, 3).join(", ") : ""}`);
  ok(res.late.length === 0, `${name}: jede Karte liegt bei Aktivierung ganz unter der Grafik${res.late.length ? " – " + res.late.slice(0, 3).join(", ") : ""}`);
  ok(res.unreadable.length === 0, `${name}: aktive Karte immer lesbar unter der Grafik${res.unreadable.length ? " – " + res.unreadable.slice(0, 3).join(", ") : ""}`);
  ok(res.wrongFig.length === 0, `${name}: Grafik folgt beim Scrollen dem aktiven Schritt${res.wrongFig.length ? " – " + res.wrongFig.slice(0, 3).join(", ") : ""}`);
}

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}/zwei-heimaten.html`;
  const browser = await chromium.launch();
  for (const [name, viewport, mobile] of [["Desktop 1366", { width: 1366, height: 800 }], ["Handy 390", { width: 390, height: 844 }, true],
    ["Handy 360", { width: 360, height: 640 }, true], ["Tablet 800", { width: 800, height: 1000 }, true], ["Desktop 1440", { width: 1440, height: 900 }], ["Full HD", { width: 1920, height: 1080 }]]) {
    const page = await browser.newPage({ viewport });
    const errs = [], foreign = [];
    page.on("pageerror", e => errs.push(e.message));
    page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1")) foreign.push(r.url()); });
    await page.addInitScript(BROWSER_HELPERS);
    await page.goto(base, { waitUntil: "load" });

    // Schätzfrage
    await page.fill("#quiz-in", "40"); await page.click("#quiz-go");
    ok(/Gemerkt: \d+\s%/.test(await page.textContent("#quiz-out")) && /Deine Schätzung von vorhin: \d+ %\. (Das ist so gut wie ein Treffer|Deine Schätzung lag \d+ Prozentpunkte)/.test(await page.textContent("#quiz-echo")), `${name}: Schätzfrage merkt die Schätzung, die Auflösung steht in Akt 2`);

    // alle Schritte: Karte in den Aktivierungsbereich holen, Grafik muss den Schritt übernehmen
    const steps = await page.evaluate(() => [...document.querySelectorAll(".scrolly .step")].map(s => ({ act: s.closest(".scrolly").dataset.act, idx: s.dataset.idx })));
    const perAct = {}; steps.forEach(s => perAct[s.act] = (perAct[s.act] || 0) + 1);
    const wrong = [], small = [], outside = [], st = {};
    const minPx = viewport.width <= 360 ? 10 : viewport.width <= 400 ? 11 : 0;
    for (let j = 0; j < steps.length; j++) {
      await goStep(page, j, mobile);
      await page.waitForTimeout(250);
      const { act, idx } = steps[j], key = `${act}/${idx}`;
      const got = await page.evaluate(a => document.getElementById("g" + a).dataset.step, act);
      if (got !== idx) wrong.push(`Akt ${act}/${+idx + 1}→${got}`);
      await page.waitForTimeout(1000);   // Übergänge abwarten (Quadrate laufen als Welle bis ~1 s)
      const m = await page.evaluate(([a, minPx]) => measure(a, minPx), [act, minPx]).catch(e => ({ err: e.message }));
      if (m.err) { small.push(m.err); continue; }
      m.small.forEach(t => small.push(`Akt ${act}/${+idx + 1}: ${t}`)); m.out.forEach(t => outside.push(`Akt ${act}/${+idx + 1}: ${t}`));
      st[key] = await page.evaluate(([a, i]) => probe(a, i), [act, +idx]);
    }
    ok(steps.length === 15 && perAct[1] === 3 && perAct[2] === 4 && perAct[3] === 4 && perAct[4] === 4 && wrong.length === 0,
      `${name}: ${steps.length} Schritte (Akt 1–4: ${[1, 2, 3, 4].map(a => perAct[a]).join("/")}), Grafik folgt jedem Schritt${wrong.length ? " – falsch: " + wrong.join(", ") : ""}`);
    if (minPx) ok(small.length === 0, `${name}: alle sichtbaren Grafik-Texte effektiv ≥ ${minPx} px (kleinste: ${Math.min(...Object.values(st).map(s => s.minPx)).toFixed(1)} px)${small.length ? " – " + small.slice(0, 4).join(", ") : ""}`);
    ok(outside.length === 0, `${name}: kein sichtbarer Text ragt aus seiner Grafik${outside.length ? " – " + outside.slice(0, 4).join(", ") : ""}`);
    // Akt 1 / Schritt 3: Balken 81 % und die Kreise höchstens ±tight.band % um OSL in Säulen und Karte
    { const s = st["1/2"]; ok(s && s.near.cols === s.T.n_near && s.near.map === s.T.n_near && s.near.op && s.near.lab.includes(`${s.T.n_near} Kreise`) && s.near.lab.includes(`höchstens ${s.T.band} %`)
        && s.near.lab.includes(`Rang ${s.T.rank_plus} bis ${s.T.rank_minus}`) && s.near.lab.includes(`${s.share} % leben in reicheren Kreisen als OSL`),
      `${name}: Akt 1/3 hebt ${s && s.near.cols} Säulen und ${s && s.near.map} Kreise ±${s && s.T.band} % um OSL hervor (erwartet ${s && s.T.n_near}), Balken und Beschriftung „${s && s.near.lab.replace(/\s+/g, " ")}“`); }
    // Akt 2 / Schritt 2: Unsicherheitsbereich; keine Gegenprobe-Tabelle mehr im SVG
    { const s = st["2/1"]; ok(s && s.unc.op && s.unc.w > 0 && s.unc.lab.includes(`${Math.round(s.T.world_minus)} bis ${Math.round(s.T.world_plus)} %`),
      `${name}: Akt 2/2 zeigt den Bereich ${s && Math.round(s.T.world_minus)} bis ${s && Math.round(s.T.world_plus)} % um OSL („${s && s.unc.lab}“)`); }
    ok(await page.evaluate(() => ![...document.querySelectorAll("#svg2 text")].some(t => /Bundesl|Metropol|je Ebene/.test(t.textContent)) && document.querySelectorAll("table.probe tbody tr").length === 4),
      `${name}: Gegenprobe nicht mehr in der Grafik, dafür HTML-Tabelle table.probe mit 4 Zeilen`);
    ok(st["2/3"] && st["2/3"].band >= 4, `${name}: Band „alle Kreise“ und Schätzung in Akt 2 / Schritt 4 gezeichnet`);
    // Akt 3
    { const s = st["3/1"]; ok(s && Math.abs(s.cn - s.W.cn_above_osl_mio / 5) <= 3 && Math.abs(s.cn + s.blue - s.W.above_osl_mio / 5) <= 4 && s.lab.includes(`${s.fa} Mio.`) && s.lab.includes(`${s.fc} Mio.`),
      `${name}: Akt 3/2: ${s && s.blue} Quadrate blau, ${s && s.cn} China weiß über OSL (≈ ${s && s.W.cn_above_osl_mio} Mio. / 5), Unterzeile „${s && s.lab}“`); }
    { const s = st["3/2"]; ok(s && Math.abs(s.near - s.W.near_osl_mio / 5) <= 3 && s.lab.includes(`${s.W.near_osl_mio} Mio.`) && s.cmp.includes("Japan") && s.cmp.includes("Polen") && (mobile || s.cmp.length === 5) && !s.cmpOverlap,
      `${name}: Akt 3/3: ${s && s.near} Quadrate ±10 % um OSL (≈ ${s && s.W.near_osl_mio} Mio. / 5), Ländermarken ${s && s.cmp.join(", ")}${s && s.cmpOverlap ? " – ÜBERLAPPEN" : ""}`); }
    ok(st["3/3"] && st["3/3"].amber > 0 && Math.abs(st["3/3"].amber - st["3/3"].W.above_koeln_mio / 5) <= 2, `${name}: Akt 3/4: ${st["3/3"] && st["3/3"].amber} Quadrate reicher als Köln in Amber`);
    // Akt 4
    { const a = st["4/0"], b = st["4/1"]; ok(a && b && a.vis.s0 && !a.vis.s1 && b.vis.s1 === 2 && b.lab.includes("Metropolregion") && b.lab.includes("Preise") && !b.vis.s2,
      `${name}: Akt 4/2: Metropolregion und regionale Preise erscheinen gemeinsam (Schritt 1: ${a && a.vis.s1} Zeilen, Schritt 2: ${b && b.vis.s1})`); }
    { const s = st["4/2"]; ok(s && s.vis.s2 && Math.abs(s.inc.ratio - s.inc.want) < 0.01 && s.inc.lab.includes(s.inc.k) && s.inc.lab.includes(s.inc.l) && s.inc.lab.includes("Faktor " + s.inc.f),
      `${name}: Akt 4/3: Einkommens-Balken passen zu DATA.income (${s && s.inc.k} / ${s && s.inc.l}, Faktor ${s && s.inc.f})`); }
    { const s = st["4/3"]; ok(s && s.pers.op && !s.pers.bars && s.pers.txt.includes(`OSL · mittlerer Mensch bei ${s.pers.want[0]} %`) && s.pers.txt.includes(`Köln · mittlerer Mensch bei ${s.pers.want[1]} %`) && /Modellrechnung/.test(s.pers.sub),
      `${name}: Akt 4/4: Spannen für OSL und Köln (mittlerer Mensch bei ${s && s.pers.want.join(" / ")} %), Balken ausgeblendet, Untertitel umgeschaltet`); }
    // Rückwärts: Akt 2 von Schritt 4 auf 3, Akt 1 von 3 auf 2, Akt 4 von 4 auf 3
    { const back = [];
      for (const [act, from, to, check] of [["2", 3, 2, "band"], ["1", 2, 1, "near"], ["4", 3, 2, "pers"], ["3", 2, 1, "sq"]]) {
        const ix = steps.findIndex(s => s.act === act && +s.idx === from), iy = steps.findIndex(s => s.act === act && +s.idx === to);
        await goStep(page, ix, mobile); await page.waitForTimeout(900); await goStep(page, iy, mobile); await page.waitForTimeout(1100);
        const r = await page.evaluate(([a, to, check]) => { const f = document.getElementById("g" + a), op = s => +getComputedStyle(document.querySelector(s)).opacity;
          if (f.dataset.step !== String(to)) return "Schritt " + f.dataset.step;
          if (check === "band") return op("#svg2 g.o3") === 0 && op("#svg2 g.o2") === 1 || "Band noch sichtbar";
          if (check === "near") return [...document.querySelectorAll("#svg1 rect.col")].every(r => r.getAttribute("fill") !== NEAR) && op("#svg1 g.o2") === 0 || "Hervorhebung bleibt";
          if (check === "pers") return op("#svg4 .bars") === 1 && op("#svg4 g.o3") === 0 || "Spannen bleiben";
          return [...document.querySelectorAll("#svg3 rect.sq")].every(r => r.getAttribute("fill") !== NEAR) && op("#svg3 g.o1") === 1 || "Quadrate falsch"; }, [act, to, check]);
        if (r !== true) back.push(`Akt ${act} ${from + 1}→${to + 1}: ${r}`); }
      ok(back.length === 0, `${name}: Zurückscrollen stellt den vorigen Zustand her${back.length ? " – " + back.join(", ") : ""}`); }
    ok(await page.evaluate(() => document.querySelectorAll("#svg4 .o3").length === (DATA.persons ? 1 : 0)), `${name}: Überschlag-Grafik genau dann gezeichnet, wenn DATA.persons da ist`);
    ok(await page.evaluate(() => ![...document.querySelectorAll("#svg1 *, #svg3 *, #svg4 *")].some(e => /#e66767/i.test(e.getAttribute("fill") || ""))), `${name}: kein Rot in Akt 1, 3, 4`);
    ok(await page.evaluate(() => [1, 2, 3, 4].every(i => (document.getElementById("svg" + i).getAttribute("aria-label") || "").length > 80) && /Rang 248 bis 361|höchstens/.test(document.getElementById("svg1").getAttribute("aria-label"))),
      `${name}: Akt-Grafiken haben ein aria-label für die neue Schrittfolge`);
    if (mobile) await mobileScan(page, name);

    // Tabelle der wichtigsten Zahlen
    const tab = await page.evaluate(() => ({ rows: document.querySelectorAll("#key-table tbody tr").length, txt: document.querySelector("#key-table").textContent,
      desc: [1, 2, 3, 4].every(i => document.getElementById("svg" + i).getAttribute("aria-describedby") === "key-table") }));
    ok(tab.rows >= 15 && /115\.000.*51\.300/.test(tab.txt) && /rund\s15\.000\sInt\.\$/.test(tab.txt) && tab.desc, `${name}: Zahlentabelle gefüllt (${tab.rows} Zeilen), Grafiken verweisen darauf`);

    // Vergleich zweier Orte: Umlaut-Schreibweise, Kreisstadt-Alias, Tippfehler
    await page.evaluate(() => document.getElementById("you-head").scrollIntoView({ behavior: "instant" }));
    await page.fill("#you-a", "Muenchen"); await page.keyboard.press("Enter");
    await page.fill("#you-b", "Senftenberg"); await page.keyboard.press("Enter");
    ok(await page.evaluate(() => location.hash) === "#vs=DE212,DE40B", `${name}: München und Senftenberg → #vs=DE212,DE40B`);
    const sum1 = await page.textContent("#you-out");
    ok(/Zwischen beiden leben/.test(sum1) && !/Zwischen Köln und OSL/.test(sum1), `${name}: Vergleich mit OSL nennt den Anteil dazwischen, ohne den Satz zu Köln und OSL`);
    await page.click('.you-ex button[data-vs="DE212,DED51"]');
    ok(/Zwischen Köln und OSL sind es knapp \d+\s%/.test(await page.textContent("#you-out")), `${name}: München/Leipzig: „Zwischen Köln und OSL sind es knapp … %“`);
    await page.fill("#you-b", "Leipzg");
    ok((await page.textContent("#you-b-sug li b").catch(() => "")) === "Leipzig", `${name}: Tippfehler „Leipzg“ findet Leipzig`);
    await page.fill("#you-b", "xyzqq");
    ok(/Kein Ort gefunden/.test(await page.textContent("#you-b-sug").catch(() => "")), `${name}: erfolglose Suche sagt „Kein Ort gefunden“`);
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: kein horizontales Scrollen`);
    ok(errs.length === 0, `${name}: keine Konsolenfehler${errs.length ? " – " + errs.join(" | ") : ""}`);
    ok(foreign.length === 0, `${name}: keine Anfragen an fremde Server${foreign.length ? " – " + foreign.join(", ") : ""}`);
    await page.close();
  }

  // reduzierte Bewegung: nichts bleibt unsichtbar
  { const pg = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await pg.goto(base, { waitUntil: "load" });
    await pg.evaluate(() => { const c = document.querySelector("#akt-2 .step[data-idx='3'] .step-card").getBoundingClientRect(), g = document.querySelector("#akt-2 .graphic").offsetHeight;
      scrollTo({ top: c.top + scrollY - (g + (innerHeight - g) / 3) + 20, behavior: "instant" }); });
    await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => getComputedStyle(document.querySelector("#svg2 .o3")).opacity === "1" && getComputedStyle(document.querySelector("#akt-2 .step.is-active .step-card")).opacity === "1"),
      "reduzierte Bewegung: Grafik und aktive Karte sofort sichtbar");
    await pg.close(); }

  // geteilter Link
  const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
  await page.goto(base + "#vs=DE212,IN-KL", { waitUntil: "load" }); await page.waitForTimeout(400);
  ok(await page.inputValue("#you-a") === "München" && await page.inputValue("#you-b") === "Kerala", "Link #vs=DE212,IN-KL belegt beide Orte vor");
  ok(Math.abs(await page.evaluate(() => document.getElementById("you-head").getBoundingClientRect().top)) < 4, "Link springt zum Vergleich");
  await page.goto(base + "#vs=,UKI31", { waitUntil: "load" }); await page.waitForTimeout(400);
  ok(await page.inputValue("#you-a") === "" && (await page.inputValue("#you-b")).startsWith("Camden"), "Link #vs=,UKI31 belegt nur Ort 2");
  ok(await page.evaluate(() => { const c = [...document.querySelectorAll("#svg5 circle")].pop(); return +c.getAttribute("cy") - +c.getAttribute("r") >= 0; }), "Marke bleibt bei Werten über 300.000 Int.$ im Diagramm");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.evaluate(() => { location.hash = "#akt-2"; }); await page.click("#you-share");
  ok((await page.evaluate(() => navigator.clipboard.readText())).endsWith("zwei-heimaten.html#vs=,UKI31"), "„Link kopieren“ liefert den Vergleich, auch nach einem Sprung zu einem Abschnitt");
  await page.click('.you-ex button[data-vs="DE2,USA-TX"]');
  ok(await page.inputValue("#you-a") === "Bayern" && await page.inputValue("#you-b") === "Texas" && await page.evaluate(() => location.hash) === "#vs=DE2,USA-TX", "Beispiel „Bayern und Texas“ belegt beide Orte");
  await page.goto(base + "#vs=GIBTESNICHT", { waitUntil: "load" });
  ok(await page.inputValue("#you-a") === "", "unbekannte ID im Link wird ignoriert");
  await browser.close(); server.close();
  if (fails.length) { console.log(`\n${fails.length} Prüfung(en) fehlgeschlagen.`); process.exit(1); }
  console.log("\nAlle Prüfungen bestanden.");
})().catch(e => { console.error(e); server.close(); process.exit(1); });
