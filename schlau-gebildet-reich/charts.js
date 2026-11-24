/* Diagramme der Story „Die Treppe und die Wolke“. Wird von scripts/build_story.py in die Seite eingesetzt.
   D = Daten aus data/story_data.json (amtliche Werte, Studienwerte, Modellbevölkerung). */
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const C = { blue: css("--blue"), orange: css("--orange"), aqua: css("--aqua"), dim: css("--dim"), ink: css("--ink"), ink2: css("--ink-2"),
  muted: css("--muted"), grid: css("--grid"), axis: css("--axis"), surface: css("--surface"), bg: css("--bg") };
const GC = [C.aqua, C.blue, C.orange];                       // Gruppen: ohne Abschluss · Berufsabschluss · Hochschulabschluss
const nf0 = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const eur = (v) => nf0.format(v) + " €";
const tsd = (v) => (v >= 1e6 ? nf1.format(v / 1e6).replace(",0", "") + " Mio." : nf0.format(v / 1000) + " Tsd.");
const tsdN = (v) => (v >= 1e6 ? nf1.format(v / 1e6).replace(",0", "") + " Mio" : nf0.format(v / 1000) + " T€");
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DUR = REDUCED ? 0 : 700;

function frame(svgEl) {
  const r = svgEl.getBoundingClientRect();
  const W = Math.max(300, r.width), H = Math.max(240, r.height);
  const svg = d3.select(svgEl).attr("viewBox", `0 0 ${W} ${H}`);
  const N = W < 560;
  return { svg, W, H, N, tk: N ? tsdN : tsd, m: { l: N ? 50 : 64, r: N ? 14 : 28, t: N ? 78 : 70, b: N ? 46 : 44 } };
}
/* Titel und Unterzeile; auf schmalen Bildschirmen die kurze Fassung (tN, sN). */
function setTitle(sc, t, s, tN, sN) {
  const N = sc.querySelector("svg").getBoundingClientRect().width < 560;
  sc.querySelector("[data-title]").textContent = N && tN ? tN : t; sc.querySelector("[data-sub]").textContent = N && sN ? sN : s;
}
/* Baut ein Diagramm nur neu, wenn sich die Größe geändert hat; sonst bleibt es stehen und die Zustände blenden über. */
function scene(sc, build) {
  const el = sc.querySelector("svg"), r = el.getBoundingClientRect(), key = Math.round(r.width) + "x" + Math.round(r.height);
  if (sc._key !== key) { d3.select(el).selectAll("*").remove(); sc._key = key; sc._s = build(frame(el)); sc._fresh = true; } else sc._fresh = false;
  return sc._s;
}
const tr = (sel, sc) => (sc._fresh || !DUR ? sel : sel.transition().duration(DUR));
function legend(g, items, N, r) {
  g.selectAll("*").remove(); let cx = 0, cy = 0;
  items.forEach(([t, col, shape]) => {
    if (shape === "line") g.append("line").attr("x1", cx).attr("x2", cx + 14).attr("y1", cy - 4).attr("y2", cy - 4).attr("stroke", col).attr("stroke-width", 2);
    else g.append("circle").attr("cx", cx + 5).attr("cy", cy - 4).attr("r", r || 4.5).attr("fill", col);
    const tx = g.append("text").attr("class", "lab").attr("x", cx + 19).attr("y", cy).text(t);
    if (N) cy += 15; else cx += 19 + tx.node().getComputedTextLength() + 18;
  });
}
function wrap(text, width, lh) {
  text.each(function () {
    const t = d3.select(this), words = t.text().split(/\s+/), x = t.attr("x"), y = +t.attr("y"); let line = [], n = 0;
    t.text(null); let ts = t.append("tspan").attr("x", x).attr("y", y);
    words.forEach((w) => { line.push(w); ts.text(line.join(" "));
      if (ts.node().getComputedTextLength() > width && line.length > 1) { line.pop(); ts.text(line.join(" ")); line = [w]; ts = t.append("tspan").attr("x", x).attr("y", y + ++n * (lh || 14)).text(w); } });
  });
}

/* ---------- Tooltip ---------- */
const TIP = document.getElementById("tip");
function tipOn(sel, html) {
  sel.on("pointerenter pointermove", function (ev, d) {
    TIP.innerHTML = html(d); TIP.style.display = "block";
    const w = TIP.offsetWidth, x = Math.min(window.innerWidth - w - 8, Math.max(8, ev.clientX + 14));
    TIP.style.left = x + "px"; TIP.style.top = Math.max(8, ev.clientY - TIP.offsetHeight - 12) + "px";
  }).on("pointerleave", () => { TIP.style.display = "none"; });
}
window.addEventListener("scroll", () => { TIP.style.display = "none"; }, { passive: true });

/* ---------- Hero: die Wolke ---------- */
(function hero() {
  const el = document.getElementById("hero-bg"), r = el.getBoundingClientRect();
  const W = r.width, H = r.height, svg = d3.select(el).attr("viewBox", `0 0 ${W} ${H}`);
  const x = d3.scaleLinear().domain([55, 145]).range([0, W]), y = d3.scaleLog().domain([18000, 600000]).range([H * 0.95, H * 0.05]).clamp(true);
  svg.selectAll("circle").data(D.pts).join("circle").attr("cx", (p) => x(p[0])).attr("cy", (p) => y(p[4])).attr("r", 2.2)
    .attr("fill", (p) => GC[p[1]]).attr("fill-opacity", 0.3);
})();

const charts = {
  /* ===== Akt 1: Treppe (amtliche Mittelwerte je Abschluss) ===== */
  treppe(sc, state) {
    const T = D.treppe;
    const s = scene(sc, ({ svg, W, H, N, m }) => {
      const LW = N ? 0 : Math.min(250, W * 0.3);
      const top = m.t + (N ? 4 : 10), rowH = (H - top - m.b) / T.rows.length;
      const x = d3.scaleLinear().domain([0, T.rows[T.rows.length - 1].v * 1.16]).range([N ? 14 : LW + 12, W - m.r]);
      svg.append("g").attr("class", "gridl").selectAll("line").data(x.ticks(5)).join("line").attr("x1", x).attr("x2", x).attr("y1", top).attr("y2", H - m.b);
      svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat((v) => nf0.format(v)).tickSize(0).tickPadding(8)).select(".domain").remove();
      svg.append("text").attr("class", "lab").attr("x", W - m.r).attr("y", H - 6).attr("text-anchor", "end").text("Euro brutto im Monat");
      const row = svg.append("g").selectAll("g").data(T.rows).join("g").attr("transform", (d, i) => `translate(0,${top + i * rowH})`);
      const bh = Math.min(30, rowH * (N ? 0.36 : 0.56)), by = N ? rowH * 0.5 : (rowH - bh) / 2;
      row.append("text").attr("class", "lab name").attr("x", N ? 14 : LW).attr("y", N ? by - 6 : rowH / 2 + 4).attr("text-anchor", N ? "start" : "end").attr("fill", C.ink2).text((d) => (N ? d.short : d.label));
      const bar = row.append("path").attr("class", "bar").attr("fill", C.blue)
        .attr("d", (d) => { const x0 = x(0), x1 = x(d.v), rr = 4; return `M${x0},${by}H${x1 - rr}a${rr},${rr} 0 0 1 ${rr},${rr}V${by + bh - rr}a${rr},${rr} 0 0 1 ${-rr},${rr}H${x0}Z`; });
      row.append("text").attr("class", "lab val").attr("x", (d) => x(d.v) + 7).attr("y", by + bh / 2 + 4).attr("fill", C.ink).text((d) => eur(d.v));
      tipOn(bar, (d) => `<b>${d.label}</b><br>${eur(d.v)} brutto im Monat<br><span>Mittelwert, Vollzeit, ohne Sonderzahlungen · ${T.stand}</span>`);
      const fx = svg.append("g").attr("class", "faktor").attr("opacity", 0);
      const lo = T.rows[0], hi = T.rows[T.rows.length - 1], fxX = W - m.r, fxY = top + rowH * (N ? 1.2 : 0.9);
      fx.append("text").attr("class", "big").attr("x", fxX).attr("y", fxY).attr("text-anchor", "end").attr("font-size", N ? 26 : 40).text("× " + nf1.format(hi.v / lo.v));
      if (!N) fx.append("text").attr("class", "lab").attr("x", fxX).attr("y", fxY + 18).attr("text-anchor", "end").text("oberste gegenüber unterster Stufe");
      const wer = svg.append("g").attr("class", "wer").attr("opacity", 0);
      wer.append("line").attr("x1", x(T.all)).attr("x2", x(T.all)).attr("y1", top - 2).attr("y2", H - m.b).attr("stroke", C.ink).attr("stroke-dasharray", "3 3");
      wer.append("text").attr("class", "lab").attr("x", x(T.all) + 6).attr("y", top + 8).attr("fill", C.ink).text((N ? "alle: " : "alle Vollzeitbeschäftigten: ") + eur(T.all));
      return { svg };
    });
    setTitle(sc, "Die Treppe: Verdienst nach höchstem Abschluss", `Durchschnittlicher Bruttomonatsverdienst, Vollzeit, ohne Sonderzahlungen · ${T.stand} · Statistisches Bundesamt`,
      "Die Treppe", `Mittlerer Bruttomonatsverdienst, Vollzeit · ${T.stand} · Destatis`);
    tr(s.svg.select(".faktor"), sc).attr("opacity", state === "faktor" ? 1 : 0);
    tr(s.svg.select(".wer"), sc).attr("opacity", state === "wer" ? 1 : 0);
    tr(s.svg.selectAll(".bar"), sc).attr("fill-opacity", (d, i) => (state === "wer" ? 0.55 : state === "faktor" && i > 0 && i < T.rows.length - 1 ? 0.4 : 1));
  },

  /* ===== Akt 2: Wolke (Modellbevölkerung, Testleistung gegen Verdienst) ===== */
  wolke(sc, state) {
    const col = { r0: 2, r20: 3, r30: 4, r40: 5, quad: 4 }[state], rv = { r0: 0, r20: 0.2, r30: 0.3, r40: 0.4, quad: 0.3 }[state];
    const s = scene(sc, ({ svg, W, H, N, m, tk }) => {
      const x = d3.scaleLinear().domain([55, 145]).range([m.l, W - m.r]);
      const y = d3.scaleLog().domain([18000, 1000000]).range([H - m.b, m.t + 14]).clamp(true);
      const yt = [25000, 50000, 100000, 200000, 500000, 1000000];
      svg.append("g").attr("class", "gridl").selectAll("line").data(yt).join("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y).attr("y2", y);
      svg.append("g").attr("class", "axis").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues(yt).tickFormat(tk).tickSize(0).tickPadding(6)).select(".domain").remove();
      svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([55, 70, 85, 100, 115, 130, 145]).tickSize(0).tickPadding(8)).select(".domain").remove();
      svg.append("text").attr("class", "lab").attr("x", W - m.r).attr("y", H - 6).attr("text-anchor", "end").text("Testleistung (IQ-Skala, Mittel 100)");
      const quad = svg.append("g").attr("class", "quad").attr("opacity", 0);
      quad.append("rect").attr("class", "q1").attr("x", x(100)).attr("y", y(D.earn.p50)).attr("width", x(145) - x(100)).attr("height", y(18000) - y(D.earn.p50)).attr("fill", C.orange).attr("fill-opacity", 0.13);
      quad.append("rect").attr("class", "q2").attr("x", x(55)).attr("y", y(1000000)).attr("width", x(100) - x(55)).attr("height", y(D.earn.p50) - y(1000000)).attr("fill", C.orange).attr("fill-opacity", 0.13);
      svg.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(D.earn.p50)).attr("y2", y(D.earn.p50)).attr("stroke", C.ink).attr("stroke-dasharray", "3 3").attr("stroke-opacity", 0.7);
      svg.append("line").attr("x1", x(100)).attr("x2", x(100)).attr("y1", m.t + 14).attr("y2", H - m.b).attr("stroke", C.axis);
      const pts = svg.append("g").selectAll("circle").data(D.pts).join("circle").attr("cx", (p) => x(p[0])).attr("r", N ? 1.9 : 2.5).attr("fill", C.blue).attr("fill-opacity", 0.55);
      tipOn(pts, (p) => `<b>Modellperson</b><br>Testleistung ${nf0.format(p[0])}<br>Verdienst ${eur(p[sc._col])} im Jahr<br><span>simuliert, keine echte Person</span>`);
      svg.append("text").attr("class", "lab").attr("x", m.l + 6).attr("y", y(D.earn.p50) - 5).attr("fill", C.ink).text("Median " + eur(D.earn.p50));
      const trend = svg.append("path").attr("class", "trend").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);
      const qa = quad.append("text").attr("class", "lab qa").attr("x", x(145) - 6).attr("y", y(18000) - 10).attr("text-anchor", "end").attr("fill", C.ink);
      const qb = quad.append("text").attr("class", "lab qb").attr("x", x(55) + 6).attr("y", y(1000000) + 16).attr("fill", C.ink);
      const big = svg.append("text").attr("class", "big").attr("x", W - m.r - 8).attr("y", m.t + (N ? 44 : 50)).attr("text-anchor", "end").attr("font-size", N ? 22 : 30);
      const big2 = svg.append("text").attr("class", "lab").attr("x", W - m.r - 8).attr("y", m.t + (N ? 60 : 68)).attr("text-anchor", "end").attr("fill", C.ink);
      return { svg, x, y, pts, trend, big, big2, qa, qb, N };
    });
    sc._col = col;
    setTitle(sc, "Die Wolke: 1.500 Modellpersonen", "Bruttojahresverdienst in Euro (logarithmisch) nach Testleistung · Modell", "Die Wolke", "Jahresverdienst (log.) nach Testleistung · Modell");
    tr(s.pts, sc).attr("cy", (p) => s.y(p[col]));
    const band = D.wolke[String(rv)];                              // Median je Testleistungsband
    const line = d3.line().x((b) => s.x(b[0])).y((b) => s.y(b[1])).curve(d3.curveMonotoneX);
    tr(s.trend, sc).attr("d", line(band)).attr("opacity", state === "r0" ? 0.9 : 1);
    s.big.text("r = " + (rv ? nf1.format(rv) : "0"));
    s.big2.text(state === "r0" ? "kein Zusammenhang" : `${nf0.format(rv * rv * 100)} % der Unterschiede im Verdienstrang`);
    tr(s.svg.select(".quad"), sc).attr("opacity", state === "quad" ? 1 : 0);
    const qv = nf0.format(D.model.r30.above_iq_below_median) + " %";
    s.qa.text(s.N ? qv : "über 100, unter dem Median: " + qv);
    s.qb.text(s.N ? qv : "unter 100, über dem Median: " + qv);
  },

  /* ===== Akt 3: Dreieck (drei Korrelationen, eine dritte Größe) ===== */
  dreieck(sc, state) {
    const order = ["ge", "ey", "gy", "beide", "herkunft"], lvl = order.indexOf(state);
    const s = scene(sc, ({ svg, W, H, N, m }) => {
      const cx = W / 2, top = m.t + (N ? 46 : 60), bot = H - m.b - (N ? 30 : 40), dx = Math.min(W * 0.36, 300);
      const P = { g: [cx - dx, bot], y: [cx + dx, bot], e: [cx, top], h: [cx, top + (bot - top) * 0.62] };
      const R = N ? 34 : 46;
      svg.append("defs").html(`<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${C.ink2}"/></marker>`);
      const edge = (a, b, cls, lab, sub, off) => {
        const [x1, y1] = P[a], [x2, y2] = P[b], L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
        const g = svg.append("g").attr("class", "edge " + cls).attr("opacity", 0);
        g.append("line").attr("x1", x1 + ux * (R + 4)).attr("y1", y1 + uy * (R + 4)).attr("x2", x2 - ux * (R + 8)).attr("y2", y2 - uy * (R + 8)).attr("stroke", C.ink2).attr("stroke-width", 2).attr("marker-end", "url(#ah)");
        const mx = (x1 + x2) / 2 + (off ? off[0] : 0), my = (y1 + y2) / 2 + (off ? off[1] : 0);
        g.append("text").attr("class", "big").attr("x", mx).attr("y", my).attr("text-anchor", "middle").attr("font-size", N ? 16 : 22).text(lab);
        g.append("text").attr("class", "lab").attr("x", mx).attr("y", my + 15).attr("text-anchor", "middle").text(sub);
        return g;
      };
      const T = D.tri;
      edge("g", "e", "ge", "r ≈ " + nf2.format(T.r_ge), "Metaanalyse", [N ? -44 : -78, -22]);
      edge("e", "y", "ey", "ρ ≈ " + nf2.format(T.rho), N ? "Modell" : "aus den Medianen (Modell)", [N ? 44 : 92, -22]);
      edge("g", "y", "gy", "r ≈ " + T.r_gy_label, "Metaanalyse", [0, N ? 22 : 28]);
      svg.selectAll(".edge.ge line").clone(true).attr("class", "back").attr("marker-end", null).attr("marker-start", "url(#ah)").attr("opacity", 0);
      const hg = svg.append("g").attr("class", "herkunft").attr("opacity", 0);
      ["g", "e", "y"].forEach((k) => { const [x2, y2] = P[k], [x1, y1] = P.h, L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
        hg.append("line").attr("x1", x1 + ux * (R * 0.8)).attr("y1", y1 + uy * (R * 0.8)).attr("x2", x2 - ux * (R + 8)).attr("y2", y2 - uy * (R + 8)).attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4").attr("marker-end", "url(#ah)"); });
      const node = (k, lab, sub, col, g) => { const n = (g || svg).append("g").attr("transform", `translate(${P[k][0]},${P[k][1]})`);
        n.append("circle").attr("r", R).attr("fill", C.surface).attr("stroke", col).attr("stroke-width", 2);
        n.append("text").attr("class", "big").attr("text-anchor", "middle").attr("y", sub && !N ? -1 : 4).attr("font-size", N ? 10.5 : 14).text(lab);
        if (sub && !N) n.append("text").attr("class", "lab").attr("text-anchor", "middle").attr("y", 14).attr("font-size", 10).text(sub); };
      node("g", "Intelligenz", "Testleistung", C.blue); node("e", "Bildung", "Abschluss", C.blue); node("y", "Einkommen", "Verdienst", C.blue);
      node("h", "Herkunft", "Elternhaus", C.orange, hg);
      return { svg };
    });
    setTitle(sc, "Das Dreieck", "Drei Größen, drei Zusammenhänge · Werte aus Metaanalysen und aus dem Modell dieser Story", "Das Dreieck", "Werte aus Metaanalysen und Modell");
    const on = (cls, k) => tr(s.svg.selectAll(cls), sc).attr("opacity", lvl >= k ? 1 : 0);
    on(".edge.ge", 0); on(".edge.ey", 1); on(".edge.gy", 2); on(".back", 3); on(".herkunft", 4);
  },

  /* ===== Akt 4: Gruppen (Streuung innerhalb der Abschlussgruppen, Modell) ===== */
  gruppen(sc, state) {
    const G = D.gruppen;
    const s = scene(sc, ({ svg, W, H, N, m, tk }) => {
      const x = d3.scaleBand().domain([0, 1, 2]).range([m.l, W - m.r]).paddingInner(0.12);
      const y = d3.scaleLog().domain([18000, 1000000]).range([H - m.b - 14, m.t + 14]).clamp(true);
      const yt = [25000, 50000, 100000, 200000, 500000, 1000000];
      svg.append("g").attr("class", "gridl").selectAll("line").data(yt).join("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y).attr("y2", y);
      svg.append("g").attr("class", "axis").attr("transform", `translate(${m.l},0)`).call(d3.axisLeft(y).tickValues(yt).tickFormat(tk).tickSize(0).tickPadding(6)).select(".domain").remove();
      const jit = d3.randomUniform.source(d3.randomLcg(7))(0.06, 0.94);
      const pts = svg.append("g").selectAll("circle").data(D.pts).join("circle").attr("cx", (p) => x(p[1]) + jit() * x.bandwidth()).attr("cy", (p) => y(p[4]))
        .attr("r", N ? 1.9 : 2.4).attr("fill", (p) => GC[p[1]]).attr("fill-opacity", 0.6);
      tipOn(pts, (p) => `<b>Modellperson</b><br>${G.rows[p[1]].label}<br>Verdienst ${eur(p[4])} im Jahr<br><span>simuliert, keine echte Person</span>`);
      G.rows.forEach((g, i) => {
        svg.append("text").attr("class", "lab").attr("x", x(i) + x.bandwidth() / 2).attr("y", H - m.b + 4).attr("text-anchor", "middle").attr("fill", C.ink).text(N ? ["ohne", "Ausbildung", "Studium"][i] : g.label);
        svg.append("text").attr("class", "lab").attr("x", x(i) + x.bandwidth() / 2).attr("y", H - m.b + 19).attr("text-anchor", "middle").text(g.pct + (N ? " %" : " % der Beschäftigten"));
        const mg = svg.append("g").attr("class", "med").attr("opacity", 0);
        mg.append("line").attr("x1", x(i)).attr("x2", x(i) + x.bandwidth()).attr("y1", y(g.median)).attr("y2", y(g.median)).attr("stroke", C.ink).attr("stroke-width", 2);
        mg.append("text").attr("class", "lab").attr("x", x(i) + 4).attr("y", y(g.median) - 6).attr("fill", C.ink).text(N ? eur(g.ba_median) : `Median ${eur(g.ba_median)} im Monat`);
      });
      const ov = svg.append("g").attr("class", "ov").attr("opacity", 0);
      const yy = y(G.linie_6000);
      ov.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", yy).attr("y2", yy).attr("stroke", C.orange).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
      ov.append("text").attr("class", "big").attr("x", x(1) + x.bandwidth() / 2).attr("y", y(560000)).attr("text-anchor", "middle").attr("font-size", N ? 18 : 26).text(nf0.format(G.mid_ueber_6000) + " %");
      ov.append("text").attr("class", "lab").attr("x", x(1) + x.bandwidth() / 2).attr("y", y(560000) + 16).attr("text-anchor", "middle").attr("fill", C.ink).text(N ? "über 6.000 € (gemessen)" : "über 6.000 € im Monat (gemessen)");
      ov.append("text").attr("class", "lab").attr("x", m.l + 6).attr("y", yy - 6).attr("fill", C.ink).text(N ? "6.000 €" : "6.000 € im Monat");
      return { svg, pts, y, yy };
    });
    setTitle(sc, "In den Stufen: dieselben 1.500 Modellpersonen", "Bruttojahresverdienst in Euro (logarithmisch) · Mediane: Bundesagentur für Arbeit · Punkte: Modell", "In den Stufen", "Jahresverdienst (log.) · Mediane: BA · Punkte: Modell");
    tr(s.svg.selectAll(".med"), sc).attr("opacity", state === "punkte" ? 0 : 1);
    tr(s.svg.select(".ov"), sc).attr("opacity", state === "ueber" ? 1 : 0);
    tr(s.pts, sc).attr("fill-opacity", (p) => (state !== "ueber" ? 0.6 : p[1] === 1 && s.y(p[4]) < s.yy ? 0.95 : p[1] === 2 ? 0.5 : 0.28));
  },

  /* ===== Akt 5: Parade (100 Vollzeitbeschäftigte nach Verdienst) ===== */
  parade(sc, state) {
    const E = D.earn, Q = D.parade;
    if (state === "vermoegen") { sc._key = null; return charts._vermoegen(sc); }
    if (state === "vb") { sc._key = null; return charts._vb(sc); }
    if (sc._mode === "v") sc._key = null;
    sc._mode = "p";
    const s = scene(sc, ({ svg, W, H, N, m, tk }) => {
      const x = d3.scaleBand().domain(d3.range(100)).range([m.l, W - m.r]).paddingInner(N ? 0.1 : 0.2);
      const y = d3.scaleLinear().range([H - m.b - 6, m.t + 20]);
      const gy = svg.append("g").attr("class", "axis").attr("transform", `translate(${m.l},0)`);
      const gg = svg.append("g").attr("class", "gridl");
      const bars = svg.append("g").selectAll("rect").data(Q).join("rect").attr("x", (d, i) => x(i)).attr("width", x.bandwidth()).attr("fill", C.blue);
      tipOn(bars, (d) => `<b>Person ${Q.indexOf(d) + 1} von 100</b><br>${eur(d)} brutto im Jahr<br><span>aus amtlichen Perzentilen interpoliert</span>`);
      svg.append("text").attr("class", "lab").attr("x", m.l).attr("y", H - m.b + 16).text("Person 1");
      svg.append("text").attr("class", "lab").attr("x", W - m.r).attr("y", H - m.b + 16).attr("text-anchor", "end").text("Person 100");
      if (!N) svg.append("text").attr("class", "lab").attr("x", (m.l + W - m.r) / 2).attr("y", H - m.b + 16).attr("text-anchor", "middle").text("100 Vollzeitbeschäftigte, nach Verdienst sortiert");
      const med = svg.append("g").attr("class", "medl"), mean = svg.append("g").attr("class", "meanl").attr("opacity", 0);
      med.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("stroke", C.ink).attr("stroke-dasharray", "3 3");
      med.append("text").attr("class", "lab").attr("x", m.l + 6).attr("fill", C.ink).text("Median " + eur(E.p50));
      mean.append("line").attr("x1", m.l).attr("x2", W - m.r).attr("stroke", C.orange).attr("stroke-width", 1.5);
      mean.append("text").attr("class", "lab").attr("x", m.l + 6).attr("fill", C.ink).text("Mittelwert " + eur(E.mean));
      const topl = svg.append("text").attr("class", "lab topl").attr("x", W - m.r).attr("text-anchor", "end").attr("fill", C.ink).attr("opacity", 0);
      const cut = svg.append("text").attr("class", "lab cut").attr("x", W - m.r - 4 - x.step() * 5).attr("y", m.t + 30).attr("text-anchor", "end").attr("fill", C.ink).text(N ? "↑ abgeschnitten" : "die letzten fünf Säulen sind abgeschnitten ↑");
      return { svg, x, y, gy, gg, bars, med, mean, topl, W, H, m, N, tk };
    });
    setTitle(sc, "Die Parade: 100 Vollzeitbeschäftigte", `Bruttojahresverdienst ${E.jahr} mit Sonderzahlungen · Perzentile: Statistisches Bundesamt, dazwischen interpoliert`,
      "Die Parade", `100 Vollzeitbeschäftigte nach Jahresverdienst ${E.jahr} · Destatis`);
    const zoom = state === "spitze";
    s.y.domain([0, zoom ? Q[99] * 1.08 : Q[94] * 1.05]);
    const ticks = s.y.ticks(5);
    tr(s.gy, sc).call(d3.axisLeft(s.y).tickValues(ticks).tickFormat(s.tk).tickSize(0).tickPadding(6)); s.gy.select(".domain").remove();
    s.gg.selectAll("line").data(ticks, (d) => d).join("line").attr("x1", s.m.l).attr("x2", s.W - s.m.r).attr("y1", s.y).attr("y2", s.y);
    const y0 = s.y(0), clipTop = s.y.range()[1];
    tr(s.bars, sc).attr("y", (d) => Math.max(clipTop, s.y(d))).attr("height", (d) => y0 - Math.max(clipTop, s.y(d)))
      .attr("fill", (d, i) => (state === "median" ? (i === 49 || i === 50 ? C.orange : C.blue) : state === "mittel" ? (d < E.mean ? C.blue : C.dim) : i === 99 ? C.orange : C.blue));
    tr(s.med.select("line"), sc).attr("y1", s.y(E.p50)).attr("y2", s.y(E.p50)); tr(s.med.select("text"), sc).attr("y", s.y(E.p50) + (zoom ? 13 : -5));
    tr(s.mean.select("line"), sc).attr("y1", s.y(E.mean)).attr("y2", s.y(E.mean)); tr(s.mean.select("text"), sc).attr("y", s.y(E.mean) - 5);
    tr(s.mean, sc).attr("opacity", state === "median" ? 0 : 1);
    s.topl.text(s.N ? `Person 100: rund ${tsd(Q[99])} €` : `Person 100: im Modell rund ${tsd(Q[99])} €, Einstieg ins oberste Prozent bei ${eur(E.p99)}`).attr("y", s.y(Q[99]) - 6);
    tr(s.topl, sc).attr("opacity", zoom ? 1 : 0);
    tr(s.svg.select(".cut"), sc).attr("opacity", zoom ? 0 : 1);
  },
  _vermoegen(sc) {
    sc._mode = "v";
    const { svg, W, H, N, m } = frame(sc.querySelector("svg")); svg.selectAll("*").remove();
    const V = D.vermoegen, E = D.earn;
    setTitle(sc, "Mittelwert geteilt durch Median", `Verdienst: Vollzeit ${E.jahr} (Statistisches Bundesamt) · Nettovermögen der Haushalte ${V.jahr} (Bundesbank)`,
      "Mittelwert ÷ Median", `Verdienst ${E.jahr} (Destatis) · Vermögen ${V.jahr} (Bundesbank)`);
    const rows = [["Bruttojahresverdienst", E.p50, E.mean], ["Nettovermögen je Haushalt", V.median, V.mean]];
    const top = m.t + 24, rowH = (H - top - m.b) / 2, x0 = N ? 14 : 30, xs = d3.scaleLinear().domain([0, V.mean * (N ? 1.4 : 1.16)]).range([x0, W - m.r]), bh = Math.min(40, rowH * 0.2);
    rows.forEach(([lab, med, mean], i) => {
      const g = svg.append("g").attr("transform", `translate(0,${top + i * rowH})`);
      g.append("text").attr("class", "big").attr("x", x0).attr("y", 4).attr("font-size", N ? 15 : 18).text(lab);
      g.append("text").attr("class", "big").attr("x", W - m.r).attr("y", 4).attr("text-anchor", "end").attr("font-size", N ? 22 : 30).text("× " + (mean / med < 2 ? nf2 : nf1).format(mean / med));
      [["Median", med, C.blue], ["Mittelwert", mean, C.orange]].forEach(([n, v, col], k) => {
        const yy = 22 + k * (bh + 20);
        g.append("text").attr("class", "lab").attr("x", x0).attr("y", yy + 10).text(n);
        const b = g.append("rect").attr("x", x0).attr("y", yy + 15).attr("height", bh).attr("width", Math.max(2, xs(v) - x0)).attr("fill", col).attr("rx", 3);
        g.append("text").attr("class", "lab").attr("x", Math.max(2, xs(v) - x0) + x0 + 6).attr("y", yy + 15 + bh / 2 + 4).attr("fill", C.ink).text(eur(v));
        tipOn(b, () => `<b>${lab}</b><br>${n}: ${eur(v)}`);
      });
    });
  },

  _vb(sc) {
    sc._mode = "v";
    const { svg, W, H, N, m, tk } = frame(sc.querySelector("svg")); svg.selectAll("*").remove();
    const V = D.vermoegen, rows = V.bildung;
    setTitle(sc, "Nettovermögen nach Abschluss: Median und Mittelwert", `Haushalte nach beruflichem Abschluss der Hauptperson · ${V.jahr} · Bundesbank`,
      "Vermögen nach Abschluss", `Nettovermögen der Haushalte · ${V.jahr} · Bundesbank`);
    const LW = N ? 0 : Math.min(200, W * 0.28), x0 = N ? 14 : LW + 12, top = m.t + (N ? 22 : 26), rowH = (H - top - m.b) / rows.length;
    const x = d3.scaleLinear().domain([0, d3.max(rows, (d) => d.mean) * (N ? 1.32 : 1.2)]).range([x0, W - m.r]);
    svg.append("g").attr("class", "gridl").selectAll("line").data(x.ticks(4)).join("line").attr("x1", x).attr("x2", x).attr("y1", top).attr("y2", H - m.b);
    svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(4).tickFormat(tk).tickSize(0).tickPadding(8)).select(".domain").remove();
    legend(svg.append("g").attr("transform", `translate(${x0},${m.t + 10})`), [["Median", C.blue], ["Mittelwert", C.orange]], false);
    const bh = Math.min(13, rowH * 0.22);
    rows.forEach((d, i) => {
      const g = svg.append("g").attr("transform", `translate(0,${top + i * rowH})`), cy = rowH / 2 + (N ? 8 : 0);
      g.append("text").attr("class", "lab").attr("x", N ? 14 : LW).attr("y", N ? cy - bh - 8 : cy + 4).attr("text-anchor", N ? "start" : "end").attr("fill", C.ink2).text(N ? d.kurz : d.label);
      [["Median", d.median, C.blue, -bh - 1], ["Mittelwert", d.mean, C.orange, 1]].forEach(([n, v, col, dy]) => {
        const b = g.append("rect").attr("x", x0).attr("y", cy + dy).attr("height", bh).attr("width", Math.max(2, x(v) - x0)).attr("fill", col).attr("rx", 2);
        g.append("text").attr("class", "lab").attr("x", Math.max(2, x(v) - x0) + x0 + 6).attr("y", cy + dy + bh - 2).attr("fill", C.ink).text(eur(v));
        tipOn(b, () => `<b>${d.label}</b><br>${n}: ${eur(v)}<br><span>Mittelwert ÷ Median: ${nf1.format(d.mean / d.median)}</span>`);
      });
    });
  },

  /* ===== Akt 6: Spitze (Testleistung im obersten Prozent, Modell) ===== */
  spitze(sc, state) {
    const key = { alle: "0.3", r30: "0.3", r40: "0.4", schweden: "0.4" }[state], M = D.spitze[key], A = D.spitze.alle;
    const s = scene(sc, ({ svg, W, H, N, m }) => {
      const x = d3.scaleLinear().domain([55, 145]).range([m.l, W - m.r]);
      const y = d3.scaleLinear().domain([0, d3.max(D.spitze["0.4"].hist) * 1.18]).range([H - m.b, m.t + (N ? 70 : 40)]);
      svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickValues([55, 70, 85, 100, 115, 130, 145]).tickSize(0).tickPadding(8)).select(".domain").remove();
      svg.append("text").attr("class", "lab").attr("x", W - m.r).attr("y", H - 6).attr("text-anchor", "end").text("Testleistung (IQ-Skala)");
      svg.append("line").attr("x1", x(100)).attr("x2", x(100)).attr("y1", m.t + 26).attr("y2", H - m.b).attr("stroke", C.axis);
      const area = d3.area().x((d, i) => x(D.spitze.bins[i])).y0(y(0)).y1((d) => y(d)).curve(d3.curveMonotoneX);
      const line = d3.line().x((d, i) => x(D.spitze.bins[i])).y((d) => y(d)).curve(d3.curveMonotoneX);
      svg.append("path").attr("d", area(A)).attr("fill", C.dim).attr("fill-opacity", 0.55);
      const topA = svg.append("path").attr("class", "topA").attr("fill", C.orange).attr("fill-opacity", 0.28);
      const topL = svg.append("path").attr("class", "topL").attr("fill", "none").attr("stroke", C.orange).attr("stroke-width", 2);
      const mk = svg.append("g").attr("class", "mk");
      const k = N ? 22 : 0;
      mk.append("line").attr("y1", m.t + 34 + k).attr("y2", H - m.b).attr("stroke", C.ink).attr("stroke-dasharray", "3 3");
      mk.append("text").attr("class", "lab").attr("y", m.t + 28 + k).attr("text-anchor", "middle").attr("fill", C.ink);
      const lg = svg.append("g").attr("transform", `translate(${m.l},${m.t + 8})`);
      legend(lg, [["alle Modellpersonen", C.dim], ["oberstes Prozent im Verdienst", C.orange]], N);
      const note = svg.append("text").attr("class", "lab note").attr("x", x(57)).attr("y", y(0) - 12).attr("fill", C.ink);
      const sw = svg.append("g").attr("class", "sw").attr("opacity", 0).attr("transform", `translate(${x(D.schweden.iq)},0)`);
      sw.append("line").attr("y1", m.t + 56 + k).attr("y2", H - m.b).attr("stroke", C.ink).attr("stroke-width", 2);
      sw.append("text").attr("class", "lab").attr("y", m.t + 50 + k).attr("x", -6).attr("text-anchor", "end").attr("fill", C.ink).text(N ? `Schweden: ${nf0.format(D.schweden.iq)}` : `gemessen in Schweden: ${nf0.format(D.schweden.iq)}`);
      return { svg, x, y, area, line, topA, topL, mk, note, N };
    });
    setTitle(sc, "Wer steht ganz oben?", "Verteilung der Testleistung · Modell · beide Flächen jeweils 100 %", "Ganz oben", "Verteilung der Testleistung · Modell");
    const show = state !== "alle";
    tr(s.topA, sc).attr("d", s.area(M.hist)).attr("opacity", show ? 1 : 0);
    tr(s.topL, sc).attr("d", s.line(M.hist)).attr("opacity", show ? 1 : 0);
    tr(s.mk, sc).attr("opacity", show ? 1 : 0).attr("transform", `translate(${s.x(M.mean_iq)},0)`);
    s.mk.select("text").text(`Mittel ${nf0.format(M.mean_iq)}` + (s.N ? "" : ` bei r = ${key.replace(".", ",")}`)).attr("text-anchor", "start").attr("x", 6);
    s.note.text(show ? `${nf0.format(M.below100)} % liegen unter 100` : "").attr("opacity", show ? 1 : 0);
    tr(s.svg.select(".sw"), sc).attr("opacity", state === "schweden" ? 1 : 0);
  },

  /* ===== Akt 7: Unsichtbar (je 100 Personen: wer in der Verdienststatistik fehlt) ===== */
  unsichtbar(sc, state) {
    const U = D.unsichtbar;
    const s = scene(sc, ({ svg, W, H, N, m }) => {
      const x0 = N ? 14 : 30, top = m.t + (N ? 12 : 18), bot = H - m.b - 6, ph = (bot - top) / U.rows.length;
      const cell = Math.min((W - x0 - m.r) / 25, (ph - 44) / 4);
      const panels = svg.append("g").selectAll("g").data(U.rows).join("g").attr("transform", (d, i) => `translate(${x0},${top + i * ph})`);
      panels.append("text").attr("class", "big head").attr("y", 16).attr("font-size", N ? 13 : 15);
      panels.append("text").attr("class", "lab sub").attr("y", 32).attr("fill", C.ink);
      panels.each(function () { d3.select(this).selectAll("circle").data(d3.range(100)).join("circle")
        .attr("cx", (i) => (i % 25) * cell + cell / 2).attr("cy", (i) => 42 + Math.floor(i / 25) * cell + cell / 2).attr("r", Math.max(2, cell * 0.36)); });
      const lg = svg.append("g").attr("class", "lg").attr("transform", `translate(${x0},${H - m.b + 16})`);
      return { svg, panels, lg, N };
    });
    const mode = state;                                         // erwerb | alq | armut
    const titles = { erwerb: ["Wer nicht erwerbstätig ist", "Je 100 Personen von 25 bis 64 Jahren · " + U.src.erwerb],
      alq: ["Wer arbeitslos ist", "Je 100 zivile Erwerbspersonen · " + U.src.alq], armut: ["Wer armutsgefährdet ist", "Je 100 Personen ab 16 Jahren · " + U.src.armut] };
    setTitle(sc, titles[mode][0], titles[mode][1], titles[mode][0], titles[mode][1].replace(" des Bundes und der Länder", "").replace("Je 100 Personen von 25 bis 64 Jahren", "25 bis 64 Jahre").replace("Je 100 zivile Erwerbspersonen", "Erwerbspersonen").replace("Je 100 Personen ab 16 Jahren", "ab 16 Jahren").replace("Bundesagentur für Arbeit", "BA"));
    const val = (d) => Math.round(mode === "erwerb" ? 100 - d.erwerb : mode === "alq" ? d.alq : d.armut);
    const exact = (d) => nf1.format(mode === "erwerb" ? 100 - d.erwerb : mode === "alq" ? d.alq : d.armut);
    const hi = mode === "erwerb" ? "nicht erwerbstätig" : mode === "alq" ? "arbeitslos" : "armutsgefährdet";
    s.panels.each(function (d, gi) { const n = val(d);
      tr(d3.select(this).selectAll("circle"), sc).attr("fill", (i) => (i < n ? C.orange : C.dim)).attr("fill-opacity", (i) => (i < n ? 1 : 0.55));
      d3.select(this).select(".head").text((s.N ? U.labels_kurz : U.labels)[mode][gi]);
      d3.select(this).select(".sub").text(`${exact(d)} % ${hi}`); });
    legend(s.lg, [[hi, C.orange], [mode === "erwerb" ? "erwerbstätig" : mode === "alq" ? "nicht arbeitslos" : "nicht armutsgefährdet", C.dim]], false);
  },
};

/* ---------- Scroll-Mechanik (wie in den Geschwister-Stories) ---------- */
document.querySelectorAll(".scrolly").forEach((sc) => {
  const name = sc.dataset.chart, steps = [...sc.querySelectorAll(".step")];
  let current = steps[0].dataset.state;
  const draw = () => charts[name](sc, current);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        steps.forEach((st) => st.classList.toggle("is-active", st === en.target));
        if (en.target.dataset.state !== current) { current = en.target.dataset.state; draw(); }
      }
    });
  }, { root: null, rootMargin: "-45% 0px -45% 0px", threshold: 0 });
  steps.forEach((st) => io.observe(st));
  draw();
  let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(draw, 150); });
});
