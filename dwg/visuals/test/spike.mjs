// Spike-Test im echten Browser (Playwright/Chromium): rendern die Original-Visuals über
// den Adapter, kommt die Auswahl als Querfilter in der App an, funktionieren Tooltip,
// Dark Mode und Größenänderung? Screenshots und Messwerte landen in test/out/.
import { execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../../..");
const OUT = path.join(HERE, "out");
fs.mkdirSync(OUT, { recursive: true });

let chromium;
try {
    ({ chromium } = await import("playwright"));
} catch {
    const req = createRequire(path.join(execSync("npm root -g").toString().trim(), "noop.js"));
    ({ chromium } = req("playwright"));
}

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
    ".woff2": "font/woff2", ".map": "application/json" };
const server = http.createServer((req, res) => {
    const p = path.join(REPO, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!p.startsWith(REPO) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(p)] ?? "application/octet-stream" });
    fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const url = `http://localhost:${server.address().port}/dwg/visuals/demo/index.html`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
const errors = [];
page.on("pageerror", e => errors.push(`pageerror: ${e.message}`));
page.on("console", m => { if (m.type() === "error") { errors.push(`console: ${m.text()}`); } });

const checks = [];
const check = (name, ok, detail = "") => { checks.push({ name, ok, detail }); console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${detail ? ` · ${detail}` : ""}`); };
const svgCount = sel => page.$$eval(`${sel} svg *`, els => els.length);
const text = sel => page.$eval(sel, el => el.textContent ?? "");
// Mitte des größten Rechtecks der i-ten Klickgruppe (die Gruppenmitte kann eine Lücke treffen)
const catPoint = (i) => page.$$eval("#v-zeit g.icd-cat", (els, i) => {
    const rects = [...els[i].querySelectorAll("rect")].map(r => r.getBoundingClientRect()).filter(b => b.width > 2 && b.height > 2);
    const b = rects.sort((a, c) => c.width * c.height - a.width * a.height)[0] ?? els[i].getBoundingClientRect();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}, i);
const clickCat = async (i) => { const p = await catPoint(i); await page.mouse.click(p.x, p.y); };

await page.goto(url);
await page.waitForSelector("body[data-ready='1']", { timeout: 20000 });
await page.waitForTimeout(400);

for (const [id, name] of [["#v-kpis", "KPI-Karten"], ["#v-zeit", "Varianzanalyse"], ["#v-kosten", "Kostenbrücke"], ["#v-guv", "GuV"]]) {
    const n = await svgCount(id);
    const html = await page.$eval(id, el => el.innerHTML.length);
    check(`${name} rendert`, n > 20 || html > 5000, `${n} SVG-Elemente`);
}
check("GuV zeigt Konten aus dem Abfrageergebnis", (await text("#v-guv")).includes("Umsatzerlöse"));
check("GuV rechnet Formelzeilen (EBITDA)", (await text("#v-guv")).includes("EBITDA"));
check("Varianzanalyse zeigt Monate", (await text("#v-zeit")).includes("Mär"));
const mountMs = await text("#mount-ms");
const timings1 = await text("#timings");
await page.screenshot({ path: path.join(OUT, "1-hell.png"), fullPage: true });

// Tooltip
if (await page.$("#v-zeit g.icd-cat")) {
    const p = await catPoint(0);
    await page.mouse.move(p.x, p.y);
    await page.waitForTimeout(150);
    const tipVisible = await page.$eval(".dwg-tip", el => !el.hidden && el.textContent.length > 0).catch(() => false);
    check("Tooltip erscheint beim Überfahren", tipVisible);
}

// Querfilter: Klick auf März
const cats = await page.$$("#v-zeit g.icd-cat");
check("Monate sind klickbar (g.icd-cat)", cats.length >= 6, `${cats.length} Gruppen`);
if (cats.length >= 3) {
    await clickCat(2);
    await page.waitForTimeout(400);
    const chip = await page.$eval("#chips", el => (el.hidden ? "" : el.textContent ?? ""));
    check("Auswahl kommt als Filter-Chip in der App an", chip.includes("Mär"), chip.trim());
    check("onSelect liefert Spalte und Wert", (await text("#last-select")).includes('"Kalender[Monat]":"Mär"'), await text("#last-select"));
    check("GuV wird auf den Monat gefiltert", (await text("#v-guv")).includes("Mär 2026"));
    await page.screenshot({ path: path.join(OUT, "2-filter-maerz.png"), fullPage: true });
    // erneuter Klick auf denselben Monat hebt die Auswahl auf (wie Power BI)
    await clickCat(2);
    await page.waitForTimeout(400);
    check("zweiter Klick hebt die Auswahl auf", await page.$eval("#chips", el => el.hidden));
    // Chip setzt zurück
    await clickCat(4);
    await page.waitForTimeout(300);
    await page.click("#chips .chip");
    await page.waitForTimeout(400);
    check("Chip × hebt den Filter auf", await page.$eval("#chips", el => el.hidden) && (await text("#v-guv")).includes("Jan–Jun 2026"));
}

// Dark Mode
await page.click("#theme");
await page.waitForTimeout(500);
const darkGuv = await page.$eval("#v-guv", el => {
    const all = [...el.querySelectorAll("*")];
    return all.some(n => /rgb\((1\d|2\d|3\d), ?(1\d|2\d|3\d), ?(1\d|2\d|3\d|4\d)\)/.test(getComputedStyle(n).backgroundColor) ||
        /#1[0-9a-f]{5}|#2[0-9a-f]{5}/i.test(n.getAttribute("fill") ?? ""));
});
check("Visuals schalten auf Dunkel", darkGuv);
await page.screenshot({ path: path.join(OUT, "3-dunkel.png"), fullPage: true });

// Größenänderung (schmales Fenster, eine Spalte)
const wBefore = await page.$eval("#v-zeit svg", el => el.getBoundingClientRect().width);
await page.setViewportSize({ width: 820, height: 1400 });
await page.waitForTimeout(600);
const wAfter = await page.$eval("#v-zeit svg", el => el.getBoundingClientRect().width);
const wBox = await page.$eval("#v-zeit", el => el.getBoundingClientRect().width);
check("Visual rendert bei Größenänderung neu", wAfter !== wBefore && Math.abs(wAfter - wBox) <= 2,
    `SVG ${Math.round(wBefore)} → ${Math.round(wAfter)} px, Kachel ${Math.round(wBox)} px`);
await page.screenshot({ path: path.join(OUT, "4-schmal.png"), fullPage: true });

check("keine Fehler in der Konsole", errors.length === 0, errors.slice(0, 3).join(" | "));

const sizes = fs.readdirSync(path.join(HERE, "../dist/chunks")).filter(f => f.endsWith(".js")).map(f => {
    const b = fs.readFileSync(path.join(HERE, "../dist/chunks", f));
    return `${f.replace(/-[A-Z0-9]+\.js$/, "")}: ${(b.length / 1024).toFixed(0)} KB`;
});
const report = { mountMs, timings: timings1, sizes, checks, errors };
fs.writeFileSync(path.join(OUT, "spike-report.json"), JSON.stringify(report, null, 2));
console.log(`\n${mountMs}\nRenderzeiten erstes Rendern: ${timings1}\nBundles: ${sizes.join(", ")}`);

await browser.close();
server.close();
const failed = checks.filter(c => !c.ok).length;
console.log(failed ? `\n${failed} Prüfung(en) fehlgeschlagen` : "\nalle Prüfungen grün");
process.exit(failed ? 1 : 0);
