// Erzeugt demo/fixtures.json: Abfrageergebnisse im Format des Rayfin-Konnektors
// ({columns, rows}), so wie daxQuery() sie für ein Semantikmodell stellen würde.
// Grundlage ist die Demo-GuV des P&L-Visuals (pnlByDatenWG/src/demo.ts) mit den
// deutschen Namen aus stringResources/de-DE. Alle Zahlen sind Demodaten.
import esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PNL = path.resolve(HERE, "../../../pnlByDatenWG");
const tmp = path.join(HERE, "../test/out/demo-rows.mjs");
fs.mkdirSync(path.dirname(tmp), { recursive: true });
await esbuild.build({
    entryPoints: [path.join(PNL, "src/demo.ts")], bundle: true, format: "esm", platform: "node",
    outfile: tmp, logLevel: "error",
});
const { buildDemoRows, DEMO_MONTHS } = await import(pathToFileURL(tmp).href);
const de = JSON.parse(fs.readFileSync(path.join(PNL, "stringResources/de-DE/resources.resjson"), "utf8"));
const rows = buildDemoRows(k => de[k] ?? k);

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const round = v => (v == null ? null : Math.round(v));

// --- GuV: eine Zeile je Konto und Monat, Formelzeilen einmal (wie ADDMISSINGITEMS)
const guv = {
    columns: [
        "Konten[Ebene 1]", "Konten[Ebene 2]", "Konten[Ebene 3]", "Konten[Konto]", "Konten[Sortierung]",
        "Konten[Zeilentyp]", "Konten[Formel]", "Konten[Vorzeichen]", "Konten[Kosten positiv]",
        "Konten[Abweichung invertiert]", "Kalender[Monat]", "[ac]", "[py]", "[pl]", "[fcFy]", "[plFy]",
    ].map(name => ({ name })),
    rows: rows.map(r => [
        r.levels[0], r.levels[1], r.levels[2], r.account, r.sort, r.rowType, r.formulaDef, r.sign,
        r.displayInvert, r.varianceInvert,
        r.month == null ? null : MONTHS[DEMO_MONTHS.indexOf(r.month)],
        round(r.values.ac), round(r.values.py), round(r.values.pl), round(r.values.fcfy), round(r.values.plfy),
    ]),
};

// --- Summen je Ebene 1 und Monat (Vorzeichen wie in der GuV)
const sumL1 = (l1, key, month) => rows
    .filter(r => r.levels[0] === l1 && r.rowType === "account" && (month == null || r.month === month))
    .reduce((s, r) => s + (r.values[key] ?? 0) * r.sign, 0);
const level1 = [...new Set(rows.filter(r => r.rowType === "account").map(r => r.levels[0]))];
const revenue = level1[0];

// --- Umsatz je Monat: Jan–Jun Ist aus der GuV, Jul–Dez Forecast; PY und PL ganzjährig
const season = [1, 1.03, 1.1, 1.13, 1.06, 1.13, 1.08, 0.96, 1.12, 1.15, 1.1, 1.22];
const base = sumL1(revenue, "pl", DEMO_MONTHS[0]);
const zeit = {
    columns: ["Kalender[Monat]", "Kalender[MonatNr]", "[actual]", "[previousYear]", "[plan]", "[forecast]"].map(name => ({ name })),
    rows: MONTHS.map((m, i) => {
        const inPnl = i < DEMO_MONTHS.length;
        const ac = inPnl ? sumL1(revenue, "ac", DEMO_MONTHS[i]) : null;
        const py = inPnl ? sumL1(revenue, "py", DEMO_MONTHS[i]) : base * season[i] * 0.91;
        const pl = inPnl ? sumL1(revenue, "pl", DEMO_MONTHS[i]) : base * season[i];
        const fc = inPnl ? null : base * season[i] * 1.03;
        return [m, i + 1, round(ac), round(py), round(pl), round(fc)];
    }),
};

// --- KPI-Karten: Summen Jan–Jun je Ebene 1 (Kosten als positive Beträge)
const kpis = {
    columns: ["KPI[Name]", "KPI[Sortierung]", "[actual]", "[previousYear]", "[plan]"].map(name => ({ name })),
    rows: level1.slice(0, 4).map((l1, i) => [l1, i + 1,
        round(Math.abs(sumL1(l1, "ac"))), round(Math.abs(sumL1(l1, "py"))), round(Math.abs(sumL1(l1, "pl")))]),
};

// --- Kosten je Konto (Ebene 2) für eine Kategorie-Brücke AC gegen PL
const kosten = {
    columns: ["Konten[Kostenart]", "[actual]", "[plan]"].map(name => ({ name })),
    rows: [...new Set(rows.filter(r => r.rowType === "account" && r.sign < 0).map(r => r.levels[1] ?? r.levels[0]))].map(l2 => {
        const pick = key => rows.filter(r => (r.levels[1] ?? r.levels[0]) === l2 && r.rowType === "account")
            .reduce((s, r) => s + (r.values[key] ?? 0), 0);
        return [l2, round(pick("ac")), round(pick("pl"))];
    }),
};

fs.writeFileSync(path.join(HERE, "fixtures.json"), JSON.stringify({ guv, zeit, kpis, kosten }, null, 1) + "\n");
fs.rmSync(tmp);
console.log(`fixtures.json: GuV ${guv.rows.length} Zeilen, Zeit ${zeit.rows.length}, KPIs ${kpis.rows.length}, Kosten ${kosten.rows.length}`);
