#!/usr/bin/env node
/* Browser-Test der fertigen Story (zwei-heimaten.html): lädt die Seite in drei Breiten, läuft alle Schritte ab
   und prüft Schätzfrage, Vergleich zweier Orte und den Link-Zustand (#vs=…).

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

(async () => {
  await new Promise(r => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}/zwei-heimaten.html`;
  const browser = await chromium.launch();
  for (const [name, viewport] of [["Desktop 1366", { width: 1366, height: 800 }], ["Handy 390", { width: 390, height: 844 }], ["Full HD", { width: 1920, height: 1080 }]]) {
    const page = await browser.newPage({ viewport });
    const errs = [], foreign = [];
    page.on("pageerror", e => errs.push(e.message));
    page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1")) foreign.push(r.url()); });
    await page.goto(base, { waitUntil: "load" });

    // Schätzfrage
    await page.fill("#quiz-in", "40"); await page.click("#quiz-go");
    ok(/Es sind \d+,\d\s%/.test(await page.textContent("#quiz-out")), `${name}: Schätzfrage löst auf`);

    // alle Schritte: Karte in die Mitte holen, Grafik muss den Schritt übernehmen
    const steps = await page.evaluate(() => [...document.querySelectorAll(".step")].map(s => ({ act: s.closest(".scrolly").dataset.act, idx: s.dataset.idx })));
    let wrong = 0;
    for (let j = 0; j < steps.length; j++) {
      await page.evaluate(j => { const c = document.querySelectorAll(".step")[j].querySelector(".step-card"), r = c.getBoundingClientRect(); scrollTo({ top: r.top + scrollY + r.height / 2 - innerHeight / 2, behavior: "instant" }); }, j);
      await page.waitForTimeout(250);
      if (await page.evaluate(a => document.getElementById("g" + a).dataset.step, steps[j].act) !== steps[j].idx) wrong++;
    }
    ok(steps.length === 16 && wrong === 0, `${name}: ${steps.length} Schritte (erwartet 16), ${wrong} Grafik-Zustände falsch`);
    ok(await page.evaluate(() => document.querySelectorAll("#svg2 .o4 text").length >= 4), `${name}: Band „alle Kreise“ und Schätzung in Akt 2 gezeichnet`);

    // Vergleich zweier Orte: Umlaut-Schreibweise, Kreisstadt-Alias, Tippfehler
    await page.evaluate(() => document.getElementById("you-head").scrollIntoView({ behavior: "instant" }));
    await page.fill("#you-a", "Muenchen"); await page.keyboard.press("Enter");
    await page.fill("#you-b", "Senftenberg"); await page.keyboard.press("Enter");
    ok(await page.evaluate(() => location.hash) === "#vs=DE212,DE40B", `${name}: München und Senftenberg → #vs=DE212,DE40B`);
    ok(/dazwischen|Zwischen beiden leben/.test(await page.textContent("#you-out")), `${name}: Vergleich zeigt den Anteil dazwischen`);
    await page.fill("#you-b", "Leipzg");
    ok((await page.textContent("#you-b-sug li b").catch(() => "")) === "Leipzig", `${name}: Tippfehler „Leipzg“ findet Leipzig`);
    ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: kein horizontales Scrollen`);
    ok(errs.length === 0, `${name}: keine Konsolenfehler${errs.length ? " – " + errs.join(" | ") : ""}`);
    ok(foreign.length === 0, `${name}: keine Anfragen an fremde Server${foreign.length ? " – " + foreign.join(", ") : ""}`);
    await page.close();
  }
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
  await page.goto(base + "#vs=GIBTESNICHT", { waitUntil: "load" });
  ok(await page.inputValue("#you-a") === "", "unbekannte ID im Link wird ignoriert");
  await browser.close(); server.close();
  if (fails.length) { console.log(`\n${fails.length} Prüfung(en) fehlgeschlagen.`); process.exit(1); }
  console.log("\nAlle Prüfungen bestanden.");
})().catch(e => { console.error(e); server.close(); process.exit(1); });
