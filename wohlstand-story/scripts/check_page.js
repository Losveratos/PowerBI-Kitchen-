#!/usr/bin/env node
/* Browser-Test der fertigen Story (zwei-heimaten.html): lädt die Seite in mehreren Breiten, läuft alle Schritte ab
   und prüft, dass jede Grafik ihrem Schritt folgt, das Handy-Muster (Grafik oben fest, Karten laufen darunter und
   verschwinden hinter ihr), die Hervorhebungen (±5 % in Akt 1, ±10 % in Akt 3), die Zahlentabelle, die
   Überschlag-Grafik (nur mit DATA.persons), Schätzfrage, Vergleich zweier Orte und den Link-Zustand (#vs=…).

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

const HI = "#f2efe2";   // Farbe „hell hervorgehoben“ im Template
const TEST_PERSONS = { osl: { p10: 64, p25: 75, p50: 84, p75: 91, p90: 96 }, koeln: { p10: 83, p25: 91, p50: 96, p75: 99, p90: 99.7 } };

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
        if (c.bottom < g.bottom + 30 || c.top > innerHeight - 30) out.unreadable.push(`Akt ${act}/${+idx + 1} @${Math.round(y - y0)}`);
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
    ["Handy 360", { width: 360, height: 640 }, true], ["Tablet 800", { width: 800, height: 1000 }, true], ["Full HD", { width: 1920, height: 1080 }]]) {
    const page = await browser.newPage({ viewport });
    const errs = [], foreign = [];
    page.on("pageerror", e => errs.push(e.message));
    page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1")) foreign.push(r.url()); });
    await page.goto(base, { waitUntil: "load" });

    // Schätzfrage
    await page.fill("#quiz-in", "40"); await page.click("#quiz-go");
    ok(/Es sind rund \d+\s%/.test(await page.textContent("#quiz-out")), `${name}: Schätzfrage löst auf`);

    // alle Schritte: Karte in den Aktivierungsbereich holen, Grafik muss den Schritt übernehmen
    const steps = await page.evaluate(() => [...document.querySelectorAll(".scrolly .step")].map(s => ({ act: s.closest(".scrolly").dataset.act, idx: s.dataset.idx })));
    const perAct = {}; steps.forEach(s => perAct[s.act] = (perAct[s.act] || 0) + 1);
    let wrong = [], near5 = null, near10 = null;
    for (let j = 0; j < steps.length; j++) {
      await page.evaluate(([j, mobile]) => { const s = document.querySelectorAll(".scrolly .step")[j], c = s.querySelector(".step-card").getBoundingClientRect();
        const g = s.closest(".scrolly").querySelector(".graphic").offsetHeight;
        // Desktop: Kartenmitte in die Bildmitte; Handy: Kartenoberkante knapp unter die Aktivierungslinie
        const target = mobile ? c.top + scrollY - (g + (innerHeight - g) / 3) + 20 : c.top + scrollY + c.height / 2 - innerHeight / 2;
        scrollTo({ top: target, behavior: "instant" }); }, [j, !!mobile]);
      await page.waitForTimeout(250);
      const got = await page.evaluate(a => document.getElementById("g" + a).dataset.step, steps[j].act);
      if (got !== steps[j].idx) wrong.push(`Akt ${steps[j].act}/${+steps[j].idx + 1}→${got}`);
      if (steps[j].act === "1" && steps[j].idx === "3") { await page.waitForTimeout(800); near5 = await page.evaluate(hi => ({ cols: [...document.querySelectorAll("#svg1 rect.col")].filter(r => r.getAttribute("fill") === hi).length,
        map: [...document.querySelectorAll("#svg1 path.kreis")].filter(r => r.getAttribute("fill") === hi).length, want: DATA.world.tight.n_near5,
        lab: [...document.querySelectorAll("#svg1 .o3 text")].map(t => t.textContent).join(" "), op: getComputedStyle(document.querySelector("#svg1 .o3")).opacity, t: DATA.world.tight }), HI); }
      if (steps[j].act === "3" && steps[j].idx === "2") { await page.waitForTimeout(800); near10 = await page.evaluate(hi => ({ n: [...document.querySelectorAll("#svg3 rect.sq")].filter(r => r.getAttribute("fill") === hi).length,
        mio: DATA.world.near_osl_mio, lab: document.querySelector("#svg3 .o2 text").textContent }), HI); }
    }
    ok(steps.length >= 18 && perAct[1] === 4 && perAct[2] === 5 && perAct[3] === 5 && perAct[4] >= 4 && wrong.length === 0,
      `${name}: ${steps.length} Schritte (Akt 1–4: ${[1, 2, 3, 4].map(a => perAct[a]).join("/")}), Grafik folgt jedem Schritt${wrong.length ? " – falsch: " + wrong.join(", ") : ""}`);
    ok(near5 && near5.cols === near5.want && near5.map === near5.want && near5.op === "1" && near5.lab.includes(`${near5.want} Kreise höchstens 5 % von OSL entfernt`) && near5.lab.includes(`Rang ${near5.t.rank_plus5} bis ${near5.t.rank_minus5}`),
      `${name}: Akt 1/4 hebt ${near5 && near5.cols} Säulen und ${near5 && near5.map} Kreise ±5 % um OSL hervor (erwartet ${near5 && near5.want}), Beschriftung „${near5 && near5.lab}“`);
    ok(near10 && Math.abs(near10.n - near10.mio / 5) <= 3 && near10.lab.includes(`${near10.mio} Mio.`),
      `${name}: Akt 3/3 hebt ${near10 && near10.n} Quadrate ±10 % um OSL hervor (≈ ${near10 && near10.mio} Mio. / 5 = ${near10 && (near10.mio / 5).toFixed(1)})`);
    ok(await page.evaluate(() => document.querySelectorAll("#svg2 .o4 text").length >= 4), `${name}: Band „alle Kreise“ und Schätzung in Akt 2 gezeichnet`);
    ok(await page.evaluate(() => document.querySelectorAll("#svg4 .o4").length === 0 && !DATA.persons), `${name}: ohne DATA.persons keine Überschlag-Grafik`);
    ok(await page.evaluate(() => ![...document.querySelectorAll("#svg1 *, #svg3 *, #svg4 *")].some(e => /#e66767/i.test(e.getAttribute("fill") || ""))), `${name}: kein Rot in Akt 1, 3, 4`);
    if (mobile) await mobileScan(page, name);

    // Tabelle der wichtigsten Zahlen
    const tab = await page.evaluate(() => ({ rows: document.querySelectorAll("#key-table tbody tr").length, txt: document.querySelector("#key-table").textContent,
      desc: [1, 2, 3, 4].every(i => document.getElementById("svg" + i).getAttribute("aria-describedby") === "key-table") }));
    ok(tab.rows >= 15 && /115\.000.*51\.300/.test(tab.txt) && /rund 15\.000 Int\.\$/.test(tab.txt) && tab.desc, `${name}: Zahlentabelle gefüllt (${tab.rows} Zeilen), Grafiken verweisen darauf`);

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

  // Überschlag (Akt 4, Schritt 5): Testdaten nur im Browser unterschieben, Karte für den Test einhängen
  for (const [name, viewport, mobile] of [["Überschlag Desktop", { width: 1366, height: 800 }], ["Überschlag Handy", { width: 390, height: 844 }, true]]) {
    const pg = await browser.newPage({ viewport }); const errs = []; pg.on("pageerror", e => errs.push(e.message));
    await pg.addInitScript(p => { window.__persons = p;
      new MutationObserver((ms, o) => { const s = document.querySelector("#akt-4 .steps"); if (s && s.querySelector(".step[data-idx='3']") && !s.querySelector("[data-idx='4']")) {
        const d = document.createElement("div"); d.className = "step"; d.dataset.idx = "4"; d.innerHTML = '<div class="step-card"><h3>Test</h3><p>Nur im Test.</p></div>'; s.appendChild(d); o.disconnect(); } }).observe(document, { childList: true, subtree: true }); }, TEST_PERSONS);
    await pg.goto(base, { waitUntil: "load" });
    ok(await pg.evaluate(() => document.querySelectorAll("#akt-4 .step").length) === 5, `${name}: Testkarte als fünfter Schritt eingehängt`);
    await pg.evaluate(mobile => { const c = document.querySelector("#akt-4 .step[data-idx='4'] .step-card").getBoundingClientRect(), g = document.querySelector("#akt-4 .graphic").offsetHeight;
      scrollTo({ top: mobile ? c.top + scrollY - (g + (innerHeight - g) / 3) + 20 : c.top + scrollY + c.height / 2 - innerHeight / 2, behavior: "instant" }); }, !!mobile);
    await pg.waitForTimeout(1200);
    const st = await pg.evaluate(() => ({ step: document.getElementById("g4").dataset.step, bars: getComputedStyle(document.querySelector("#svg4 .bars")).opacity,
      pers: getComputedStyle(document.querySelector("#svg4 .o4")).opacity, txt: document.querySelector("#svg4 .o4").textContent }));
    ok(st.step === "4" && st.bars === "0" && st.pers === "1" && /OSL · Mitte 84 %/.test(st.txt) && /Köln · Mitte 96 %/.test(st.txt), `${name}: Spannen für OSL und Köln gezeichnet, Balken ausgeblendet`);
    if (mobile) await mobileScan(pg, name);
    ok(errs.length === 0, `${name}: keine Konsolenfehler${errs.length ? " – " + errs.join(" | ") : ""}`);
    await pg.close();
  }

  // reduzierte Bewegung: nichts bleibt unsichtbar
  { const pg = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await pg.goto(base, { waitUntil: "load" });
    await pg.evaluate(() => { const c = document.querySelector("#akt-2 .step[data-idx='4'] .step-card").getBoundingClientRect(), g = document.querySelector("#akt-2 .graphic").offsetHeight;
      scrollTo({ top: c.top + scrollY - (g + (innerHeight - g) / 3) + 20, behavior: "instant" }); });
    await pg.waitForTimeout(300);
    ok(await pg.evaluate(() => getComputedStyle(document.querySelector("#svg2 .o4")).opacity === "1" && getComputedStyle(document.querySelector("#akt-2 .step.is-active .step-card")).opacity === "1"),
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
