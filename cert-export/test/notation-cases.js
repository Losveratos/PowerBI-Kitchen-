// 1.52.1 notation checks — one block per point of the showcase measurement
const parseDe = t => { const m = /([+−-]?)(\d[\d.]*)(?:,(\d+))?/.exec(t); if (!m) { return NaN; }
  const v = parseFloat(m[2].replace(/\./g, "") + (m[3] ? "." + m[3] : "")); return m[1] === "−" || m[1] === "-" ? -v : v; };
const isNum = t => /^[+−-]?\d[\d.]*(,\d+)?\s*[A-Za-z€]*$/.test(t);
const nums3 = (id, filter) => texts(id).filter(t => isNum(t) && (!filter || filter(t)));
const over3 = list => list.filter(t => t.replace(/[^0-9]/g, "").length > 3);

// ---- 1 · Einheit im Titel einmal, Langform
{
  run("T1", "Titel · kpi „in EUR“ in der Mitte", dataView(mon12, [col("actual", acY, FMT), col("forecast", fcY, FMT, "Umsatz FC"), col("previousYear", pyY, FMT, "Umsatz PY")],
    { chart: { orientation: "columns", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true },
      ibcsTitle: { show: true, kpi: "Nettoumsatz in EUR je Kanal", period: "Jan bis Dez, Ist bis Aug, danach Forecast" } }), 1000, 460);
  const t = titleOf("T1");
  measure("T1 Titel: " + t);
  check(/^Nettoumsatz in Mio\. EUR je Kanal · /.test(t) && (t.match(/\bin\b/g) || []).length === 1, "1: „in Mio. EUR“ an der Stelle der Einheit, nur einmal");
  check(!/ in [MK]\b/.test(t), "1: kein „in M“/„in K“ im Titel");

  run("T1b", "Titel · Absatz in hl, Tausender", dataView(mon12.slice(0, 8), [col("actual", [41.2, 43.5, 47.0, 52.3, 58.9, 66.1, 71.4, 69.0].map(v => v * K), FMT, "Absatz hl AC")],
    { chart: { orientation: "columns" }, ibcsTitle: { show: true, kpi: "Absatz in hl" } }), 800, 300);
  const t2 = titleOf("T1b");
  measure("T1b Titel: " + t2);
  check(/^Absatz in Tsd\. hl · /.test(t2), "1: „Absatz in Tsd. hl“");

  run("T1c", "Titel · ohne Einheit im kpi, Format mit €", dataView(mon12.slice(0, 8), [col("actual", acY.slice(0, 8), "#,0 €", "Umsatz AC")],
    { chart: { orientation: "columns" }, ibcsTitle: { show: true, kpi: "Nettoumsatz je Kanal" } }), 800, 300);
  const t3 = titleOf("T1c");
  measure("T1c Titel: " + t3);
  check(/^Nettoumsatz je Kanal in Mio\. € · /.test(t3), "1: Einheit aus Skalierung + Format angehängt („in Mio. €“)");

  run("T1d", "Titel · Scatter ohne Achsen-Einheit am Titel", dataView(["A", "B", "C", "D"], [col("actual", [0.12, 0.25, 0.31, 0.44], "0.0%", "DB-Marge %"), col("xValue", [800, 1500, 3000, 6100], "#,0", "Absatz hl")],
    { chart: { orientation: "scatter", scatterQuadrant: "off" }, ibcsTitle: { show: true, kpi: "DB-Marge (y) gegen Absatz in hl (x) je Kunde" } }), 700, 360);
  const t4 = titleOf("T1d");
  measure("T1d Titel: " + t4);
  check(/^DB-Marge \(y\) gegen Absatz in hl \(x\) je Kunde( ·|$)/.test(t4) && !/ in %/.test(t4), "1: Scatter-Titel ohne angehängte y-Einheit");
}

// ---- 2 · Szenario-Suffix
{
  const cats = ["Handel", "Gastro", "Export"];
  const acC = [18.46, 6.21, 3.04].map(v => v * M), pyC = [17.2, 6.4, 2.9].map(v => v * M), plC = [19.51, 6.1, 3.1].map(v => v * M);
  const cardCols = name => [col("actual", acC, FMT, name), col("previousYear", pyC, FMT, "Umsatz PY"), col("plan", plC, FMT, "Umsatz PL")];
  run("T2", "Karten · period nennt Szenarien", dataView(cats, cardCols("Umsatz AC&FC"),
    { chart: { orientation: "cards", comparisonMode: "plan", cardTrendChart: "off", cardSameScale: true, cardBars: false },
      ibcsTitle: { show: true, kpi: "Nettoumsatz je Kanal", period: "2026 AC&FC gegen PL" } }), 1000, 200);
  const t = titleOf("T2");
  measure("T2 Titel: " + t);
  check(/2026 AC&FC gegen PL$/.test(t) && !/vs\./.test(t), "2: period mit Szenariokürzeln → kein Suffix");
  run("T2b", "Karten · period ohne Szenarien, AC&FC im Namen", dataView(cats, cardCols("Umsatz AC&FC"),
    { chart: { orientation: "cards", comparisonMode: "plan", cardBars: false },
      ibcsTitle: { show: true, kpi: "Nettoumsatz je Kanal", period: "Ist-Monate des gewählten Jahres" } }), 1000, 200);
  const t2 = titleOf("T2b");
  measure("T2b Titel: " + t2);
  check(/: AC&FC vs\. PL, PY$/.test(t2), "2: Suffix aus comparisonMode + gebundenen Rollen, FC-Anteil als AC&FC");
  run("T2c", "Wasserfall · nur die Basis wird gezeigt", dataView(["Pils", "Lager", "Dunkel"], [col("actual", [2.4, 1.8, 1.3].map(v => v * M), FMT), col("previousYear", [2.2, 1.9, 1.2].map(v => v * M), FMT, "Umsatz PY"), col("plan", [2.5, 1.7, 1.3].map(v => v * M), FMT, "Umsatz PL")],
    { chart: { orientation: "waterfall", comparisonMode: "py" }, ibcsTitle: { show: true, kpi: "Umsatz", period: "Jan bis Aug" } }), 800, 320);
  const t3 = titleOf("T2c");
  measure("T2c Titel: " + t3);
  check(/: AC vs\. PY$/.test(t3), "2: keine nicht gezeigten Szenarien (Wasserfall zeigt nur PY → AC)");
}

// ---- 3 · höchstens 3 Ziffern · 6 · Nullwerte
{
  const cats = ["Nord", "Süd", "West", "Ost"];
  run("S2", "Gestapelte Balken · Werte ≥ 100K, Einzelsegmente", dataView(cats, [col("actual", [161.8, 196.3, 49.5, 140.2].map(v => v * K), FMT)],
    { chart: { orientation: "bars" }, ibcsTitle: { show: true, kpi: "Nettoumsatz in EUR nach Region" } }, [["series", "Produkt", ["Pils", "Pils", "Lager", "Pils"]]]), 900, 300);
  const l = nums3("S2");
  measure("S2 Zahlen: " + l.join(" "));
  check(over3(l).length === 0 && l.includes("162K") && l.includes("196K"), "3: „162K“ statt „161,8K“, höchstens 3 Ziffern");
  // 11: one segment → the value once
  check(l.filter(t => t === "162K").length === 1 && l.filter(t => t === "196K").length === 1, "11: Einzelsegment ohne doppelte Summe");

  const prod = ["Pils", "Lager", "Dunkel", "Weizen"];
  run("Z4", "Balken · Nullwert (C04)", dataView(prod, [col("actual", [2.45, 0, 1.31, 1.12].map(v => v * M), FMT), col("plan", [2.30, 0, 1.29, 1.05].map(v => v * M), FMT)],
    { chart: { orientation: "bars", comparisonMode: "plan", showAbsoluteVariance: true, showRelativeVariance: true } }), 900, 300);
  const z = texts("Z4");
  measure("Z4 Texte: " + z.filter(t => /\d/.test(t)).join(" "));
  check(!z.some(t => /^[+−-]?0,0+\s*[MK]?$/.test(t)) && z.includes("0"), "6: Null als „0“, kein „0,00M“");
  // 1.52.2: a Δ that is not zero but rounds to zero keeps its sign next to its pin
  run("Z5", "Balken · Δ rundet auf null (C04)", dataView(prod, [col("actual", [2.45, 1.3102, 1.31, 1.12].map(v => v * M), FMT), col("plan", [2.30, 1.31, 1.29, 1.05].map(v => v * M), FMT)],
    { chart: { orientation: "bars", comparisonMode: "plan", showAbsoluteVariance: true, showRelativeVariance: true } }), 900, 300);
  const z5 = texts("Z5");
  measure("Z5 Texte: " + z5.filter(t => /\d/.test(t)).join(" "));
  check(z5.some(t => /^\+0,0+%?$/.test(t)) && !z5.some(t => /^0,0+%?$/.test(t)), "6b: Δ ≠ 0, gerundet null: „+0,0…“ mit Vorzeichen");
}

// ---- 3 · mit sumSafeRounding: eine Präzision für Labels und Σ, Summe geht auf
{
  run("R3", "Säulen · sumSafeRounding + 3 Ziffern", dataView(["Q1", "Q2", "Q3", "Q4"], [col("actual", [161.84, 196.33, 49.54, 140.21].map(v => v * K), FMT)],
    { chart: { orientation: "columns", showTotal: true }, labels: { sumSafeRounding: true } }), 700, 300);
  const all = texts("R3");
  const sumT = all.find(t => t.startsWith("Σ")) || "";
  const lbl = all.filter(t => /^\d[\d,]*K$/.test(t));
  const tot = lbl.map(parseDe).reduce((a, b) => a + b, 0);
  measure(`R3 Labels: ${lbl.join(" ")} · ${sumT}`);
  check(lbl.length === 4 && over3([...lbl, sumT.split(" ")[1] || ""]).length === 0 && Math.abs(tot - parseDe(sumT)) < 1e-9,
    "3: Σ-treue Rundung mit 3 Ziffern, Labels addieren sich zum Σ");
}

// ---- 4 · Einheiten-Suffix abschaltbar
{
  run("U4", "Säulen · labels.unitSuffix aus", dataView(mon12.slice(0, 8), [col("actual", acY.slice(0, 8), FMT), col("previousYear", pyY.slice(0, 8), FMT, "Umsatz PY")],
    { chart: { orientation: "columns", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true },
      labels: { unitSuffix: false }, ibcsTitle: { show: true, kpi: "Nettoumsatz in EUR" } }), 900, 420);
  const l = texts("U4").filter(t => /\d/.test(t) && !/[A-Za-z]{3}/.test(t));
  const withSuffix = l.filter(t => /\d\s*[MK]\b/.test(t));
  measure("U4 Titel: " + titleOf("U4") + " · Zahlen: " + l.slice(0, 10).join(" "));
  check(withSuffix.length === 0 && /^Nettoumsatz in Mio\. EUR/.test(titleOf("U4")), "4: ohne Suffix an den Werten, Einheit im Titel");
  run("U4c", "Karten · unitSuffix aus, gemischte Größen", dataView(["Umsatz", "Kleinkunden"], [col("actual", [18.46 * M, 412 * K], FMT), col("plan", [19.51 * M, 398 * K], FMT, "Umsatz PL")],
    { chart: { orientation: "cards", comparisonMode: "plan", cardBars: false }, labels: { unitSuffix: false }, ibcsTitle: { show: true, kpi: "Nettoumsatz" } }), 800, 200);
  const c = texts("U4c");
  measure("U4c Karten: " + c.join(" | "));
  check(c.includes("18,5") && c.includes("0,4") && !c.some(t => /\d\s*[MK]\b/.test(t)), "4: Karten ohne Suffix in einer Einheit (Titel nennt sie)");
  run("U4d", "Standard · Suffix an", dataView(mon12.slice(0, 4), [col("actual", acY.slice(0, 4), FMT)], { chart: { orientation: "columns" } }), 600, 260);
  check(texts("U4d").some(t => /^\d,\dM$/.test(t)), "4: Standard unverändert mit Suffix („3,6M“)");
}

// ---- 5 · Karten: Wert und Δ gleiche Dezimalen
{
  const cats = ["Handel", "Gastro", "Export"];
  run("K5", "Karten · Dezimalen", dataView(cats, [col("actual", [18.46, 6.21, 3.04].map(v => v * M), FMT), col("plan", [19.51, 6.1, 3.1].map(v => v * M), FMT, "Umsatz PL")],
    { chart: { orientation: "cards", comparisonMode: "plan", cardBars: false } }), 1000, 200);
  const all = texts("K5");
  const vals = all.filter(t => /^\d+,\d+M$/.test(t));
  const ds = all.filter(t => /^[+−-]\d/.test(t)).map(t => t.split(" ")[0]);
  measure("K5 Werte: " + vals.join(" ") + " · Δ: " + ds.join(" "));
  check(vals.length === 3 && ds.length === 3 && [...vals, ...ds].every(t => decs(t) === decs(vals[0])), "5: Wert und Δ mit gleichen Dezimalen");
}

// ---- 7 · C05 Brückenstufen in echter Höhe, optional Anker gekürzt
{
  const dY = mon12.map((_, i) => (acY[i] ?? fcY[i]) - pyY[i]);
  const cols = [col("actual", acY, FMT), col("forecast", fcY, FMT, "Umsatz FC"), col("previousYear", pyY, FMT, "Umsatz PY")];
  run("B5", "C05 · echte Höhe", dataView(mon12, cols, { chart: { orientation: "intwaterfall", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true } }), 1300, 560);
  const bricks = [...document.querySelectorAll("#B5 g.icd-cat")].map(g => [...g.querySelectorAll("rect")].find(x => [GOOD, BAD].includes(fill(x)) || /url\(#icd-hatch-(good|bad)/.test(x.getAttribute("fill") || "")));
  const pyAnchor = [...document.querySelectorAll("#B5 svg > g > rect")].filter(r => fill(r) === PY_C && !r.closest("g.icd-cat")).sort((a, b) => num(b, "height") - num(a, "height"))[0];
  const kA = num(pyAnchor, "height") / pyY.reduce((a, b) => a + b, 0);
  const dev = bricks.map((b, i) => b ? Math.abs(num(b, "height") - Math.max(1, Math.abs(dY[i]) * kA)) : 0);
  measure(`B5 Stufen: ${bricks.map(b => b ? r2(num(b, "height")) : "–").join(" ")} px · Soll ${dY.map(d => r2(Math.max(1, Math.abs(d) * kA))).join(" ")} px · Anker ${r2(kA * M)} px/M`);
  check(Math.max(...dev) < 0.6, "7: Brückenstufen in echter Höhe (≥ 1-px-Haarlinie), keine 4-px-Mindesthöhe");

  run("B5b", "C05 · chart.bridgeBreak", dataView(mon12, cols, { chart: { orientation: "intwaterfall", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true, bridgeBreak: true } }), 1300, 560);
  const mark = document.querySelector('#B5b [data-icd="bridge-break"]');
  const bricks2 = [...document.querySelectorAll("#B5b g.icd-cat")].map(g => [...g.querySelectorAll("rect")].find(x => [GOOD, BAD].includes(fill(x)) || /url\(#icd-hatch-(good|bad)/.test(x.getAttribute("fill") || "")));
  const ks = bricks2.map((b, i) => b && Math.abs(dY[i]) > 0.1 * M ? num(b, "height") / Math.abs(dY[i]) : null).filter(v => v != null);
  const spread = Math.max(...ks) / Math.min(...ks);
  const caption = texts("B5b").find(t => /Brücke \+ Monatssäulen|bridge \+ monthly columns/.test(t)) || "";
  const breaks = [...document.querySelectorAll("#B5b line")].filter(l => (l.getAttribute("stroke") || "").toUpperCase() === "#FFFFFF" && l.getAttribute("stroke-width") === "7").length;
  measure(`B5b Bruch: ${mark ? "ab " + mark.getAttribute("data-cut") : "nein"} · Stufen ${r2(Math.max(...ks) * M)} px/M (×${r2(Math.max(...ks) / kA)} gegen ungekürzt) · Streuung ${r2(spread)} · ⫽ ${breaks} · „${caption}“`);
  check(!!mark && breaks >= 2 && spread < 1.03 && /Achse ab|axis broken/.test(caption), "7: Anker mit ⫽ gekürzt, Stufen in einer linearen Skala, Schnitt im Titel");
  run("B5c", "C05 · bridgeBreak aus (Standard)", dataView(mon12, cols, { chart: { orientation: "intwaterfall", comparisonMode: "py" } }), 900, 400);
  check(!document.querySelector('#B5c [data-icd="bridge-break"]'), "7: Standard ohne Bruch");

  // C06 vertical category bridge + C12 waterfall with the same option
  const reg = ["Nord", "Süd", "West", "Ost", "Mitte"];
  const aR = [12.4, 9.8, 8.1, 6.6, 4.2].map(v => v * M), pR = [12.1, 9.9, 7.8, 6.5, 4.0].map(v => v * M);
  run("B6", "C06 · Kategorie-Brücke senkrecht mit Bruch", dataView(reg, [col("actual", aR, FMT), col("previousYear", pR, FMT, "Umsatz PY")],
    { chart: { orientation: "catbridge", comparisonMode: "py", bridgeOrientation: "columns", bridgeBreak: true } }), 1000, 460);
  const m6 = document.querySelector('#B6 [data-icd="bridge-break"]');
  const st6 = [...document.querySelectorAll("#B6 g.icd-cat rect")].filter(x => [GOOD, BAD].includes(fill(x)) && num(x, "width") > 6);
  const k6 = st6.map((r, i) => num(r, "height") / Math.abs(aR[i] - pR[i]));
  measure(`B6 Bruch ${m6 ? "ab " + m6.getAttribute("data-cut") : "nein"} · Stufen ${k6.map(v => r2(v * M)).join(" ")} px/M`);
  check(!!m6 && Math.max(...k6) / Math.min(...k6) < 1.05, "7: Kategorie-Brücke mit ⫽, Stufen in einer Skala");
  run("B12", "C12 · Wasserfall mit bridgeBreak", dataView(reg, [col("actual", aR, FMT), col("previousYear", pR, FMT, "Umsatz PY")],
    { chart: { orientation: "waterfall", comparisonMode: "py", bridgeBreak: true } }), 900, 400);
  const t12 = texts("B12").find(t => /^PY → AC/.test(t)) || "";
  measure(`B12 Paneltitel: „${t12}“`);
  check(/Achse ab|axis broken/.test(t12), "7: Wasserfall nutzt den Achsenschnitt (scale.wfAxisBreak) über chart.bridgeBreak");
}

// ---- 8 · C08 Linien-Notation
{
  run("L8", "C08 · AC/PY/PL/FC", dataView(mon12, [col("actual", acY, FMT), col("forecast", fcY, FMT, "Umsatz FC"), col("previousYear", pyY, FMT, "Umsatz PY"), col("plan", plY, FMT, "Umsatz PL")],
    { chart: { orientation: "line", comparisonMode: "auto", showAbsoluteVariance: true, showRelativeVariance: false } }), 1100, 460);
  const paths = [...document.querySelectorAll("#L8 svg path")].filter(p => p.getAttribute("fill") === "none");
  const by = c => paths.filter(p => (p.getAttribute("stroke") || "").toUpperCase() === c);
  const py = by(PY_C), ink = by(AC_C), core = paths.filter(p => p.getAttribute("data-icd") === "line-pl-core");
  const pl = paths.filter(p => p.getAttribute("data-icd") === "line-pl");
  const ac = ink.filter(p => !p.getAttribute("data-icd") && !p.getAttribute("stroke-dasharray"));
  const fc = ink.filter(p => p.getAttribute("stroke-dasharray"));
  const w = p => p ? parseFloat(p.getAttribute("stroke-width")) : NaN;
  measure(`L8 Linien: AC ${w(ac[0])} px, PY ${w(py[0])} px, PL ${w(pl[0])} px hohl (Kern ${w(core[0])} px), FC ${w(fc[0])} px ${fc[0] ? fc[0].getAttribute("stroke-dasharray") : "–"}`);
  check(w(ac[0]) === w(py[0]) && w(py[0]) === w(pl[0]) && w(pl[0]) === w(fc[0]), "8: absolute Linien gleich dick");
  check(core.length === 1 && !pl[0].getAttribute("stroke-dasharray") && !!fc[0], "8: PL umrandet (hohl), nur FC gestrichelt");
  // labels off the lines: no AC label box contains the PY/PL line at its category
  const groups = [...document.querySelectorAll("#L8 g.icd-cat")];
  const circ = groups.map(g => g.querySelector("circle"));
  const k = (num(circ[7], "cy") - num(circ[0], "cy")) / (acY[0] - acY[7]);
  const yOf = (i, v) => num(circ[i], "cy") + ((acY[i] ?? fcY[i]) - v) * k;
  let hits = 0, n = 0;
  groups.forEach((g, i) => {
    const t = [...g.querySelectorAll("text")].find(x => /M$/.test(x.textContent));
    if (!t) { return; }
    n++;
    const b = t.getBBox();
    for (const v of [pyY[i], plY[i], acY[i] ?? fcY[i]]) { const y = yOf(i, v); if (y > b.y - 1 && y < b.y + b.height + 1) { hits++; } }
  });
  measure(`L8 Beschriftungen: ${n}, davon auf einer Linie ${hits}`);
  check(n > 0 && hits === 0, "8: Beschriftungen nicht auf den Linien");
}

// ---- 9 · Scatter-Randlabels, Bubble ab 0
{
  // showcase C09: the points in the top-left and bottom-right corner lost their
  // label (side spots blocked by a neighbour, centred spots beyond the plot edge)
  const units = ["Getränkemarkt Nordstadt", "Kellerei Großraum Süd", "Brauhaus am Markt", "Kaufhaus Westpark",
    "Getränke Union Ost", "Großhandel Moldau", "Markthalle Elbe", "Frischemarkt Nord", "Discounter Mitte",
    "Gastro Partner West", "Feinkost Rheinufer", "Handelshaus Ostring"];
  const x = [10.5, 13.2, 14.6, 15.0, 23.4, 25.8, 27.8, 29.1, 32.6, 36.0, 38.5, 13.1].map(v => v * K);
  const y = [0.70, 0.70, 0.553, 0.551, 0.487, 0.49, 0.488, 0.486, 0.489, 0.49, 0.485, 0.552];
  const yPy = y.map(v => v - 0.004), xPy = x.map(v => v * 0.95);
  run("SC9", "C09 · Punkte in den Ecken", dataView(units, [col("actual", y, "0.0%", "DB-Marge %"), col("xValue", x, "#,0", "Absatz hl"),
    col("previousYear", yPy, "0.0%", "DB-Marge % PY"), col("xPrevious", xPy, "#,0", "Absatz hl PY")],
    { chart: { orientation: "scatter", scatterQuadrant: "mean", scatterColorBy: "single", scatterArrows: true }, labels: { fontPreset: "fullhd" } }), 1540, 700);
  const shown = units.filter(u => texts("SC9").includes(u));
  measure(`SC9 Labels: ${shown.length} von ${units.length} · fehlen: ${units.filter(u => !shown.includes(u)).join(", ") || "keine"}`);
  check(shown.includes(units[0]) && shown.includes(units[10]), "9: Randpunkte in den Ecken beschriftet (nach innen gesetzt)");

  const xb = [150, 900, 2400, 3900, 5200, 7800, 9100, 12500, 16000, 21000, 28000, 61000];
  run("SC10", "C10 · Bubble, x nahe null", dataView(units, [col("actual", y, "0.0%", "DB-Marge %"), col("xValue", xb, "#,0", "Absatz hl"), col("bubbleSize", xb.map(v => v * 120), "#,0", "Umsatz")],
    { chart: { orientation: "scatter", scatterQuadrant: "mean", scatterColorBy: "single", scatterSizeLegend: true } }), 900, 460);
  const ticks = [...document.querySelectorAll('#SC10 [data-icd="scatter-xtick"]')];
  const t0 = ticks.find(t => t.textContent === "0");
  const axisLine = [...document.querySelectorAll("#SC10 svg line")].find(l => l.getAttribute("x1") === l.getAttribute("x2") && num(l, "y2") - num(l, "y1") > 100);
  const tickLines = [...document.querySelectorAll("#SC10 svg line")].filter(l => l.getAttribute("x1") === l.getAttribute("x2") && Math.abs(num(l, "y2") - num(l, "y1") - 3) < 0.01);
  const x0 = tickLines.length ? Math.min(...tickLines.map(l => num(l, "x1"))) : NaN;
  measure(`SC10 x-Ticks: ${ticks.map(t => t.textContent).join(" ")} · Tick 0 bei x=${r2(x0)}, y-Achse bei x=${axisLine ? r2(num(axisLine, "x1")) : "?"}`);
  check(!!t0 && axisLine && Math.abs(x0 - num(axisLine, "x1")) < 0.6, "9: Bubble-x-Achse beginnt bei 0 am Achsenursprung");
}

// ---- 10 · C12 einheitliche Dezimalen, Summe geht auf
{
  run("W12", "C12 · Ergebnisbrücke, sumSafeRounding", dataView(["Pils", "Lager", "Dunkel", "Weizen", "Bock"],
    [col("actual", [2.45, 1.82, 1.31, 1.12, 0.64].map(v => v * M), FMT, "EBIT AC"), col("previousYear", [1.304, 1.953, 1.196, 1.049, 0.703].map(v => v * M), FMT, "EBIT PY")],
    { chart: { orientation: "waterfall", comparisonMode: "auto", showAbsoluteVariance: true, showRelativeVariance: false },
      labels: { sumSafeRounding: true } }), 900, 400);
  const lbl = [...document.querySelectorAll("#W12 g.icd-cat text")].map(t => t.textContent).filter(t => /\d/.test(t) && /M$/.test(t));
  const vals = lbl.map(parseDe);
  const sumSteps = vals.slice(1, -1).reduce((a, b) => a + b, 0);
  measure(`W12 Brücke: ${lbl.join(" ")} · ${r2(vals[0])} + ${r2(sumSteps)} = ${r2(vals[0] + sumSteps)} (AC ${vals[vals.length - 1]})`);
  check(lbl.length === 7 && lbl.every(t => decs(t) === decs(lbl[0])), "10: Anker und Stufen mit gleichen Dezimalen");
  check(Math.abs(vals[0] + sumSteps - vals[vals.length - 1]) < 1e-9, "10: mit sumSafeRounding geht die Summe exakt auf");
}

// ---- 11 · Stapellegende direkt am Stapel
{
  const cats = mon12.slice(0, 6), ser = ["Pils", "Lager", "Dunkel"];
  const cc = [], ss = [], vv = [];
  cats.forEach((c, i) => ser.forEach((s, j) => { cc.push(c); ss.push(s); vv.push([1.6, 0.9, 0.5][j] * (1 + i * 0.05) * M); }));
  run("S1", "C01 · gestapelte Säulen", dataView(cc, [col("actual", vv, FMT)], { chart: { orientation: "columns" } }, [["series", "Produkt", ss]]), 900, 360);
  const dl = document.querySelector('#S1 [data-icd="stack-legend-direct"]');
  measure(`S1 Legende: ${dl ? "am Stapel: " + [...dl.querySelectorAll("text")].map(t => t.textContent).join(" · ") : "Schlüssel oben"}`);
  check(!!dl && dl.querySelectorAll("text").length === 3, "11: C01-Legende rechts am letzten Stapel");
  const bc = ["Nord", "Süd", "West"], bs = [], bcc = [], bv = [];
  bc.forEach((c, i) => ser.forEach((s, j) => { bcc.push(c); bs.push(s); bv.push([2.6, 1.9, 1.5][j] * (1 - i * 0.2) * M); }));
  run("S2b", "C02 · gestapelte Balken", dataView(bcc, [col("actual", bv, FMT)], { chart: { orientation: "bars" } }, [["series", "Produkt", bs]]), 900, 300);
  check(!!document.querySelector('#S2b [data-icd="stack-legend-direct"]'), "11: C02-Legende über dem ersten Balken");
  // 1.52.2: C02 with a first bar that carries one series only (Mähren) — names at the widest segments
  const cc2 = ["Mähren", "Prag", "Polen", "Prag", "Prag"], ss2 = ["Pils", "Pils", "Lager", "Lager", "Dunkel"];
  const vv2 = [2.5, 2.1, 1.6, 12.9, 3.0].map(v => v * M);
  run("S2c", "C02 · erster Balken mit einer Reihe", dataView(cc2, [col("actual", vv2, FMT)], { chart: { orientation: "bars" } }, [["series", "Produkt", ss2]]), 900, 360);
  const dl2 = document.querySelector('#S2c [data-icd="stack-legend-direct"]');
  const nb = dl2 ? [...dl2.querySelectorAll("text")].map(t => t.getBBox()) : [];
  const overlap = nb.some((a, i) => nb.some((b, j) => j > i && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height));
  measure(`S2c Legende: ${dl2 ? "am Stapel: " + [...dl2.querySelectorAll("text")].map(t => t.textContent).join(" · ") : "Schlüssel oben"}`);
  check(!!dl2 && nb.length === 3 && !overlap, "11b: C02-Namen am Stapel, auch wenn der erste Balken nicht alle Reihen hat");
  run("S1off", "C01 · stackLegendDirect aus", dataView(cc, [col("actual", vv, FMT)], { chart: { orientation: "columns", stackLegendDirect: false } }, [["series", "Produkt", ss]]), 900, 360);
  check(!document.querySelector('#S1off [data-icd="stack-legend-direct"]'), "11: Option aus = Schlüssel oben");
}

// ---- 12 · 1.52.2: AC → FC-Trennlinie läuft nicht durch Beschriftungen (C13)
{
  run("F13", "C03 · FC-Trennlinie und Labels", dataView(mon12, [col("actual", acY, FMT), col("forecast", fcY, FMT, "Umsatz FC"), col("previousYear", pyY, FMT, "Umsatz PY")],
    { chart: { orientation: "columns", comparisonMode: "py", showAbsoluteVariance: true, showRelativeVariance: true } }), 700, 360);
  const lines = [...document.querySelectorAll('#F13 line[data-icd="fc-boundary"]')];
  const boxes = [...document.querySelectorAll("#F13 text")].map(t => t.getBBox()).filter(b => b.width > 0);
  const hit = lines.some(l => { const x = +l.getAttribute("x1"), y1 = +l.getAttribute("y1"), y2 = +l.getAttribute("y2");
    return boxes.some(b => x >= b.x && x <= b.x + b.width && b.y + b.height > y1 + 0.5 && b.y < y2 - 0.5); });
  measure(`F13 FC-Linie: ${lines.length} Stücke`);
  check(lines.length >= 1 && !hit, "12: FC-Trennlinie in Stücken, keine Beschriftung gekreuzt");
}
