/* Wohlstandsatlas · Erweiterungen (von Hand gepflegt, nicht vom Generator erzeugt)
 *
 * Wird VOR dem Inline-Skript von wohlstandsatlas.html geladen, damit der ursprüngliche
 * Adress-Anker (#…--z1) gelesen werden kann, bevor update() ihn überschreibt. Alles andere
 * läuft erst nach DOMContentLoaded, also nach dem Inline-Skript, und dockt an dessen
 * oberste Namen an (pick, setMetric, writeHash, card, storyBox, STORIES, zoomTo …).
 * Jede Funktion ist einzeln abgesichert: Fehlt eine erwartete Funktion (Generator geändert),
 * wird nur diese Erweiterung übersprungen, die Seite läuft weiter.
 *
 *  1. Auswahl nach einer Nur-Länder-Kennzahl (BNE, Gini) wiederherstellen
 *  2. Deep-Link mit Zoom: Hash-Teil --z1
 *  3. Knopf „Link kopieren"
 *  4. Profilkarte: „Ähnlich auf anderen Kontinenten" (±5 %, je Kontinent die bevölkerungsreichste Einheit)
 *  5. Geschichte „Zwei Heimaten"
 *  6. Profilkarte: „In der Story vergleichen →" (zwei-heimaten.html#vs=ID)
 *  7. Eindeutige Suchvorschläge „Name (Art, Land)", größere Einheit gewinnt
 *  8. Querverweise Datenstory + Länder-Indikatoren-Explorer
 *  9. Tastatur: „/" fokussiert die Suche, Esc verlässt sie
 * 10. Layout: Chip-Zeilen brechen auf breiten Schirmen um, Quadrate-Steuerung unter der Grafik,
 *     ab 1500 px Karte und Profilkarte nebeneinander (Kartenbreite passend zur Fensterhöhe)
 * 11. Rückmeldung an der Karte nach Auswahl (Name, Wert, „Details ↓")
 * 12. Erklärtext mobil auf zwei Zeilen gekürzt, „mehr" klappt ihn auf
 * 13. Ausreißer (hot) nicht als automatische Extrem-Labels; Legende nennt den Ausreißer
 * 14. Geschichte „Die Welt in Menschen" setzt die Auswahl zurück
 * 15. Hash-Wechsel auf derselben Seite startet vom Grundzustand (keine Reste von Gruppe/Schwelle)
 * 16. Kennzahlen: fünf Hauptkennzahlen, die übrigen hinter „Weitere Kennzahlen" (aktive bleibt sichtbar)
 * 17. Suche in den Kopf der Seite (dasselbe Feld #q samt Vorschlagsliste, nur verschoben)
 * 18. Farbstufen-Chips: „je 1/7 der Länder / der Menschheit" (der Code rechnet in Siebteln)
 * 19. Profilkarte: Rang zählt Einheiten, Anteil zählt Menschen (kurzer Hinweis); Ukraine-Hinweis
 * 20. Geschichte „Wenn BIP täuscht" in drei Schritten mit „Weiter →" / „← Zurück"
 * Breitbild (ab 1500 px): Ändert sich die Höhe über der Karte (Geschichte, Erklärtext, Kennzahlen),
 * wird die Kartengröße neu berechnet und der Ausschnitt beibehalten.
 * Der Ladehinweis „Karte wird geladen …" steht im HTML (.wx-loading) und blendet sich per CSS aus,
 * sobald das Inline-Skript die Kartenfläche bemisst (#map bekommt dann ein style-Attribut).
 */
(function () {
  "use strict";
  var HASH0 = "";
  try { HASH0 = location.hash || ""; } catch (e) {}

  // hashchange: this listener is registered before the page's own one (this file loads first),
  // so a feature can bring the state back to the start values before the page reads the new hash
  var hashPre = null;
  try { window.addEventListener("hashchange", function (e) { if (hashPre) { try { hashPre(e); } catch (x) { warn("Hash-Wechsel", x); } } }); } catch (e) {}

  function warn(name, e) { try { console.warn("[atlas-extras] " + name + " übersprungen:", e && e.message ? e.message : e); } catch (_) {} }
  function fn(x) { return typeof x === "function"; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function hasZ(h) { var s = h || ""; try { s = decodeURIComponent(s); } catch (e) {} s = s.replace(/^.*#/, ""); return s.split("--").slice(1).indexOf("z1") >= 0; }
  function hashId(h) { var s = h || ""; try { s = decodeURIComponent(s); } catch (e) {} return s.replace(/^.*#/, "").split("--")[0]; }

  var CSS = [
    ".wx-twins{display:grid;gap:8px;min-width:0}",
    ".wx-twins .cmp button{grid-template-columns:minmax(0,1fr) auto}",
    ".wx-twins .wx-n{font-size:.9rem;color:var(--ink);font-weight:600;min-width:0;overflow-wrap:anywhere}",
    ".wx-twins .cmp button:hover .wx-n{text-decoration:underline;text-underline-offset:3px}",
    ".wx-links{margin:0;font-size:.85rem;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 14px}",
    ".wx-links a,.wx-related a,#storytext a{color:var(--ink);text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}",
    ".wx-links a:hover,.wx-related a:hover,#storytext a:hover{text-decoration-color:currentColor}",
    ".wx-links a:focus-visible,.wx-related a:focus-visible,#storytext a:focus-visible{outline:2px solid var(--sel);outline-offset:2px;border-radius:3px}",
    "#storytext a{font-weight:600;white-space:nowrap}",
    ".wx-related{margin:0;font-size:.85rem;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 16px;align-items:baseline}",
    ".wx-related .lab{margin-right:0}",
    // chip rows wrap on wide screens instead of hiding the last chips behind a horizontal scroll
    "@media (min-width:701px){.row.scroll{flex-wrap:wrap;overflow-x:visible}}",
    // "Darstellung": both rows side by side where there is room
    "@media (min-width:1100px){details.settings .inner{display:flex;flex-wrap:wrap;gap:8px 28px;align-items:center}}",
    // twins block sits right under the key figures now
    ".wx-card{display:grid;gap:12px;min-width:0;padding-top:2px}",
    // map + profile card side by side on large screens (wrappers are inert below that)
    ".wx-split,.wx-main{display:contents}",
    "@media (min-width:1500px){.wrap{max-width:1760px}",
    "  .wx-split{display:grid;grid-template-columns:var(--wx-mapw,minmax(0,1fr)) minmax(0,1fr);gap:20px;align-items:start}",
    "  .wx-main{display:flex;flex-direction:column;gap:12px;min-width:0}",
    "  .wx-split>.cols{grid-template-columns:minmax(0,1fr)}}",
    // feedback line at the map
    ".wx-pick{display:flex;align-items:center;gap:4px 10px;padding:7px 10px;font-size:.85rem;background:var(--surface);border-top:1px solid var(--line);min-width:0}",
    ".wx-pick .lab{margin:0}",
    ".wx-pick .wx-pk-n{font-weight:600;color:var(--sel);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".wx-pick .num{flex:none;white-space:nowrap}",
    ".wx-pick .wx-pk-go{margin-left:auto;flex:none;font:500 .78rem var(--body);background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:999px;padding:4px 10px;cursor:pointer;white-space:nowrap}",
    ".wx-pick .wx-pk-go:hover{border-color:var(--ink)}",
    "@media (min-width:561px){.wx-pick{position:absolute;left:8px;top:8px;max-width:calc(100% - 16px);border:1px solid var(--line);border-radius:8px;display:none;z-index:2}.wx-pick.on{display:flex}}",
    "@media (min-width:1500px){.wx-pick.on{display:none}}",
    "@keyframes wx-flash{from{box-shadow:inset 0 0 0 2px var(--sel)}to{box-shadow:inset 0 0 0 2px transparent}}",
    ".wx-pick.flash{animation:wx-flash 1.1s ease-out}",
    "@media (prefers-reduced-motion:reduce){.wx-pick.flash{animation:none}}",
    // explanation: two lines on phones, "mehr" opens it
    "#explain{position:relative}",
    ".wx-more{display:none;font:500 .78rem var(--body);background:none;border:0;color:var(--muted);cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px}",
    "@media (max-width:700px){",
    "  #explain.wx-clamp:not(.wx-open){display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;overflow:hidden}",
    "  #explain.wx-clamp .wx-more{display:inline}",
    "  #explain.wx-clamp:not(.wx-open) .wx-more{position:absolute;right:0;bottom:0;padding-left:2.2em;background:linear-gradient(90deg,transparent,var(--bg) 1.6em)}",
    "  #explain.wx-clamp.wx-fits .wx-more{display:none}}",
    // twins: country next to the name
    ".wx-twins .wx-where{font-weight:400;color:var(--muted)}",
    // key figures: secondary metrics behind "Weitere Kennzahlen" (the active one always stays visible)
    "#metrics:not(.wx-open) .chip.wx-xm:not([aria-pressed=\"true\"]){display:none}",
    ".wx-mtoggle{flex:none;font:500 .82rem var(--body);border:1px dashed var(--line);background:none;color:var(--muted);padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap}",
    ".wx-mtoggle:hover{color:var(--ink);border-color:var(--ink)}",
    // story chips a little lighter, so all eight fit into one line on common laptop widths
    "@media (min-width:701px){.chip.story{padding:6px 9px;font-size:.78rem}}",
    // search in the page header
    ".wx-find{display:flex;align-items:center;min-width:0;position:relative}",
    ".wx-find input{flex:1;min-width:0;width:100%;font:400 .9rem var(--body);padding:9px 34px 9px 12px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink)}",
    ".wx-find kbd{position:absolute;right:10px;font:500 .72rem var(--mono);color:var(--muted);border:1px solid var(--line);border-radius:4px;padding:0 5px;pointer-events:none;background:var(--surface)}",
    ".wx-find input:focus+kbd,.wx-find input:not(:placeholder-shown)+kbd{display:none}",
    "@media (hover:none){.wx-find kbd{display:none}.wx-find input{padding-right:12px}}",
    "@media (min-width:900px){header.wx-hdr{grid-template-columns:minmax(0,1fr) minmax(260px,380px);column-gap:24px}",
    "  header.wx-hdr>*{grid-column:1/-1}header.wx-hdr>.kc-eyebrow,header.wx-hdr>h1{grid-column:1}",
    "  header.wx-hdr>.wx-find{grid-column:2;grid-row:1/span 2;align-self:end}}",
    // story steps
    ".wx-sfoot{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin-top:4px}",
    ".wx-sfoot .x{margin-left:auto}",
    ".wx-steps{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}",
    ".wx-steps[hidden]{display:none}",
    ".wx-steps .wx-stepn{font:500 .75rem var(--mono);color:var(--muted)}",
    // card: rank counts units, share counts people
    ".wx-rankhint{font-size:.8rem}"
  ].join("\n");

  // ---------- shared state ----------
  var zOn = false, zUnit = null;          // --z1: zoom on the selection while it stays selected
  var M0 = null;                           // BIP/Kopf (KKP)
  function setZoomFlag(on) {
    zOn = !!on; zUnit = on ? selected : null;
    if (fn(writeHash)) writeHash();
  }

  // ---------- helpers on top of the atlas ----------
  function countryName(u) { var c = byId.get(u.country); return c && c.id !== u.id ? c.name : ""; }
  function kindLabel(u) { return u.kind === "Land/Gebiet" ? "Land" : (u.kind || "Region"); }
  function sizeRank(u) {  // smaller = larger unit: country < 1st level < finest < metro-only
    var adm = u.lv.filter(function (l) { return l <= 2; });
    return adm.length ? Math.min.apply(null, adm) : 2.5;
  }
  function bySize(a, b) { return (sizeRank(a) - sizeRank(b)) || ((b.pop || 0) - (a.pop || 0)); }

  function twins(u, m) {
    m = m || metric;
    var k = m.k, v = u[k];
    if (v == null || !(v > 0) || m.scope === "EU") return null;
    var best = {};
    atLevel().forEach(function (x) {
      var w = x[k];
      if (w == null || !(w > 0) || x === u) return;
      if (x.country === u.country || x.ct === u.ct || !x.ct) return;
      if (x.small || x.hot || x.nogeo || x.flag === "missing") return;
      if (!(x.pop >= 1e5)) return;
      if (level > 0 && x.kind === "Land/Gebiet") return;             // nur echte Regionen, keine Länder ohne Regionaldaten
      if (x.kind === "nicht zugeordnet" || x.kind === "Offshore") return;
      var d = Math.abs(w / v - 1);
      if (d > 0.05) return;
      // within ±5 % all candidates are equally close given the uncertainty of the regional estimates:
      // the unit with more inhabitants wins (better known), the smaller distance only breaks ties
      var b = best[x.ct];
      if (!b || x.pop > b.u.pop || (x.pop === b.u.pop && d < b.d)) best[x.ct] = {u: x, d: d};
    });
    return Object.keys(best).map(function (c) { return best[c]; })
      .sort(function (a, b) { return (b.u.pop - a.u.pop) || (a.d - b.d); }).slice(0, 3).map(function (b) { return b.u; });
  }
  // "Texas, Vereinigte Staaten" – parent region (if it is not the country) and country
  function where(x) {
    var p = x.parent && byId.get(x.parent);
    var pn = p && p.id !== x.country && p.kind !== "Land/Gebiet" && p.name !== x.name ? p.name : "";
    return [pn, countryName(x)].filter(Boolean).join(", ");
  }

  function storyEligible(u) {
    return !!u && !/^[MR]-/.test(u.id) && (u.lv.indexOf(0) >= 0 || u.lv.indexOf(1) >= 0 || u.lv.indexOf(2) >= 0) &&
      (u.pop || 0) >= 1e4 && u.gdp_pc_ppp != null;
  }

  function goTo(u, zoomIn) {
    if (!u) return;
    if (!u.lv.includes(level)) {
      var adm = u.lv.filter(function (l) { return l <= 2; });
      level = adm.length ? Math.max.apply(null, adm) : 3;
      drawLevel();
    }
    if (metric.countryOnly && level > 0 && M0) metric = M0;
    if (zoomIn && view !== "map") setView("map", true);
    pick(u);
    if (zoomIn) { setZoomFlag(true); zoomTo("sel"); }
  }

  // ---------- features ----------
  var FEATURES = [];
  function feature(name, ok, run) { FEATURES.push({name: name, ok: ok, run: run}); }

  feature("Stil", function () { return true; }, function () {
    var st = document.createElement("style"); st.id = "atlas-extras-css"; st.textContent = CSS; document.head.appendChild(st);
  });

  // 10 · layout: squares controls under the chart; from 1500 px map and profile card side by side.
  // Runs before the zoom link so that a --z1 zoom is computed with the final canvas size.
  feature("Layout", function () {
    return fn(sizeCanvas) && fn(redraw) && fn(band) && typeof zoom !== "undefined" && typeof cv !== "undefined" && typeof d3 !== "undefined" &&
      !!document.querySelector(".wrap > .mapbox") && !!document.getElementById("sqpanel");
  }, function () {
    var mb = document.querySelector(".wrap > .mapbox"), sq = document.getElementById("sqpanel");
    var lg = mb.nextElementSibling, pn = lg && lg.nextElementSibling, fd = pn && pn.nextElementSibling, cols = fd && fd.nextElementSibling;
    // controls of the squares view go below the chart (like the map legend), so the chart starts higher
    mb.insertAdjacentElement("afterend", sq);
    // wrap map … search and the card column; the wrappers are display:contents below 1500 px
    if (!(lg && lg.classList.contains("legend") && pn && pn.classList.contains("panel") && fd && fd.classList.contains("find") && cols && cols.classList.contains("cols"))) {
      warn("Layout (Nebeneinander)", "Aufbau der Seite unerwartet"); return;
    }
    var split = document.createElement("div"), main = document.createElement("div");
    split.className = "wx-split"; main.className = "wx-main";
    mb.parentNode.insertBefore(split, mb);
    [mb, sq, lg, pn, fd].forEach(function (x) { main.appendChild(x); });
    split.appendChild(main); split.appendChild(cols);

    var wide = window.matchMedia("(min-width:1500px)"), lastTop = null;
    // map width so that the whole map fits under its top edge (canvas height = 0.52 × width in this range)
    function fit() {
      if (!wide.matches) { split.style.removeProperty("--wx-mapw"); lastTop = null; return; }
      var W = split.clientWidth, top = split.getBoundingClientRect().top + window.scrollY;
      lastTop = top;
      var avail = window.innerHeight - top - 16;
      var w = Math.round(Math.max(W * 0.45, Math.min(W * 0.66, (avail - 2) / 0.52 + 2)));
      split.style.setProperty("--wx-mapw", w + "px");
    }
    var orig = sizeCanvas;
    sizeCanvas = function () {
      try { fit(); } catch (e) { warn("Layout (Breite)", e); }
      return orig.apply(this, arguments);
    };
    // same steps as the page's own resize handler
    function relayout() {
      var w = CW, h = CH; sizeCanvas();
      if (w !== CW || h !== CH) { T = d3.zoomIdentity; d3.select(cv).call(zoom.transform, T); }
      sqDirty = true; squares = []; redraw(); band();
    }
    relayout();
    // web fonts can change the height of the text above the map once they arrive
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (wide.matches) { var w = CW; fit(); if (mb.clientWidth !== w) relayoutKeep(); } }); } catch (e) {}

    // F · wide layout: an open story stands at the top of the right column, next to the map, so the map
    // does not move down; below 1500 px it goes back under the story chips
    var sb = document.getElementById("storybox"), sbHome = sb && sb.previousElementSibling;
    function placeStory() {
      if (!sb || !sbHome) return;
      if (wide.matches) { if (sb.parentNode !== cols) cols.insertBefore(sb, cols.firstChild); }
      else if (sb.previousElementSibling !== sbHome) sbHome.insertAdjacentElement("afterend", sb);
    }
    try { placeStory(); wide.addEventListener("change", placeStory); } catch (e) { warn("Layout (Geschichte)", e); }
    // when the height above the map changes (story box, explanation, key figures),
    // compute the map size again. The visible part of the map is kept (same centre, same zoom factor);
    // a zoom that is still running (story just started) is simply started again with the new size.
    var lastZoom = null, origZoomTo = zoomTo;
    zoomTo = function (b) { lastZoom = {b: b, t: Date.now()}; return origZoomTo.apply(this, arguments); };
    function relayoutKeep() {
      var w = CW, h = CH, k = T.k, bx = ((CW / 2 - T.x) / k) / s0, by = ((CH / 2 - T.y) / k - oy) / s0;
      sizeCanvas();
      if (w !== CW || h !== CH) {
        if (lastZoom && Date.now() - lastZoom.t < 900 && view === "map") {
          T = d3.zoomIdentity; d3.select(cv).call(zoom.transform, T); origZoomTo(lastZoom.b);
        } else {
          T = k === 1 ? d3.zoomIdentity : d3.zoomIdentity.translate(CW / 2 - bx * s0 * k, CH / 2 - (by * s0 + oy) * k).scale(k);
          d3.select(cv).call(zoom.transform, T);
        }
      }
      sqDirty = true; squares = []; redraw(); band();
    }
    if (typeof ResizeObserver === "function") {
      var pending = 0;
      var ro = new ResizeObserver(function () {
        if (!wide.matches || pending) return;
        pending = requestAnimationFrame(function () {
          pending = 0;
          try {
            var top = split.getBoundingClientRect().top + window.scrollY;
            if (lastTop == null || Math.abs(top - lastTop) >= 1) relayoutKeep();
          } catch (e) { warn("Layout (Höhe)", e); }
        });
      });
      for (var el = split.previousElementSibling; el; el = el.previousElementSibling) ro.observe(el);
    }
  });

  // 1 · restore the region after a country-only metric
  feature("Auswahl merken", function () { return fn(setMetric) && fn(drawLevel); }, function () {
    var orig = setMetric, mem = null;
    setMetric = function (d) {
      try {
        if (d && d.countryOnly && !metric.countryOnly && level !== 0) mem = {sel: selected, level: level};
        else if (d && !d.countryOnly && metric.countryOnly && mem && level === 0 && selected && selected.id === mem.sel.country &&
                 mem.sel.lv.includes(mem.level)) { level = mem.level; selected = mem.sel; drawLevel(); mem = null; }
        else if (d && !d.countryOnly) mem = null;
      } catch (e) { mem = null; }
      return orig.apply(this, arguments);
    };
  });

  // 2 · zoom deep link (--z1)
  feature("Zoom-Link", function () { return fn(writeHash) && fn(zoomTo) && typeof zoom !== "undefined" && zoom && fn(zoom.on); }, function () {
    var orig = writeHash;
    writeHash = function () {
      var r = orig.apply(this, arguments);
      try {
        if (zOn && selected !== zUnit) { zOn = false; zUnit = null; }
        if (zOn && !hasZ(location.hash)) history.replaceState(null, "", location.hash + "--z1");
      } catch (e) {}
      return r;
    };
    // the user zooms or pans by hand -> the link no longer describes the view
    zoom.on("zoom.wx", function (e) { if (e && e.sourceEvent && zOn) setZoomFlag(false); });
    // zoom buttons: "Auswahl" sets the flag, every other view clears it
    document.querySelectorAll("#zoom button").forEach(function (b) {
      b.addEventListener("click", function () { var d = b.__data__; setZoomFlag(!!(d && d[1] === "sel")); });
    });
    window.addEventListener("hashchange", function (e) {
      var url = (e && e.newURL) || location.href, want = hasZ(url) && byId.has(hashId(url));
      zOn = false; zUnit = null;
      setTimeout(function () { if (want) { setZoomFlag(true); zoomTo("sel"); } else writeHash(); }, 0);
    });
    if (hasZ(HASH0) && byId.has(hashId(HASH0))) { setZoomFlag(true); zoomTo("sel"); }
  });

  // 3 · copy link
  feature("Link kopieren", function () { return !!document.getElementById("cite"); }, function () {
    var cite = document.getElementById("cite"), b = document.createElement("button");
    b.className = "chip"; b.type = "button"; b.id = "copylink"; b.textContent = "Link kopieren";
    b.setAttribute("aria-label", "Link zu dieser Ansicht kopieren");
    cite.insertAdjacentElement("afterend", b);
    var say = function (t) { if (fn(toast)) toast(t); };
    b.addEventListener("click", function () {
      var url = location.href;
      var fallback = function () {
        var ok = false;
        try {
          var ta = document.createElement("textarea"); ta.value = url; ta.setAttribute("readonly", "");
          ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
          document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); ta.remove();
        } catch (e) { ok = false; }
        if (ok) say("Link kopiert.");
        else { try { window.prompt("Link zum Kopieren:", url); } catch (e) {} }
      };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { say("Link kopiert."); }, fallback);
        else fallback();
      } catch (e) { fallback(); }
    });
  });

  // 4 + 6 · profile card: twins on other continents, link back to the story
  feature("Profilkarte", function () { return fn(card) && fn(pick) && fn(atLevel) && fn(zoomTo); }, function () {
    var orig = card;
    card = function () {
      var r = orig.apply(this, arguments);
      try {
        var el = document.getElementById("card"), u = selected;
        if (!el || !u) return r;
        var tw = twins(u), parts = [], k = metric.k, v = u[k];
        // rank (in .big) counts units, the share below (third key figure) counts people
        if (v != null && ranked(u) && !metric.total) {
          parts.push('<p class="hint wx-rankhint">' + (level === 0
            ? "Der Rang zählt Länder, der Anteil darunter zählt Menschen: Viele Länder sind klein, die meisten Menschen leben in wenigen großen."
            : "Der Rang zählt Einheiten, der Anteil darunter zählt Menschen: Viele Einheiten sind kleine, reiche " +
              (level === 2 ? "Kreise" : "Regionen") + " in Europa und den USA.") + '</p>');
        }
        if (tw) {
          parts.push('<div class="wx-twins"><h3>Ähnlich auf anderen Kontinenten</h3>' + (tw.length
            ? '<div class="cmp">' + tw.map(function (x) {
                var dv = (x[k] / v - 1) * 100, ds = (dv >= 0 ? "+" : "−") + f1(Math.abs(dv)) + " %";
                var wo = where(x);
                return '<button type="button" data-id="' + esc(x.id) + '" aria-label="' + esc(x.name + (wo ? ", " + wo : "") + " auswählen und hinzoomen") + '">' +
                  '<span class="wx-n">' + esc(x.name) + (wo ? ' <span class="wx-where">(' + esc(wo) + ')</span>' : "") + '</span><span class="num">' + esc(metric.fmt(x[k])) + '</span>' +
                  '<span class="like">' + esc([kindLabel(x), x.ct, big(x.pop) + " Einw."].filter(Boolean).join(" · ")) + ' · ' + ds + '</span></button>';
              }).join("") + '</div>'
            : '<p class="hint">Keine Region auf einem anderen Kontinent liegt innerhalb von ±5 %.</p>') +
            '<p class="hint" style="font-size:.78rem">Die Regionalwerte sind Hochrechnungen; ±5 % entspricht etwa ihrer Unsicherheit. ' +
            'Gezeigt wird je Kontinent die Einheit mit den meisten Einwohnern in diesem Bereich (gleiche Ebene und Kennzahl, ab 100.000 Einwohnern, ohne Ausreißer).</p></div>');
        }
        // Ukraine: regional shares from 2021, spread onto the 2024 national value
        if (u.country === "UKR" && u.kind !== "Land/Gebiet") {
          var dqEl = el.querySelector(".dq");
          if (dqEl && !dqEl.querySelector(".wx-ukr")) {
            var w = document.createElement("span"); w.className = "warn wx-ukr";
            w.textContent = "Verteilung von 2021, vor dem Krieg; für die besetzten Gebiete nicht belastbar.";
            var src = [].find.call(dqEl.children, function (c) { return /^Verteilung innerhalb des Landes/.test(c.textContent); });
            if (src) src.insertAdjacentElement("afterend", w); else dqEl.appendChild(w);
          }
        }
        if (storyEligible(u)) {
          parts.push('<p class="wx-links"><a href="zwei-heimaten.html#vs=' + encodeURIComponent(u.id) + '">In der Story vergleichen →</a>' +
            '<span>Datenstory „Zwei Heimaten“: ' + esc(u.name) + ' neben einer zweiten Region</span></p>');
        }
        if (parts.length) {
          var box = document.createElement("div"); box.className = "wx-card";
          box.innerHTML = parts.join("");
          // right after the three key figures (inhabitants / share of world economy / share below),
          // i.e. before the time series and "Auf einer Stufe mit"; fall back to the end of the card
          var stats = el.querySelector(":scope > .stats");
          if (stats) stats.insertAdjacentElement("afterend", box); else el.appendChild(box);
          box.querySelectorAll(".wx-twins button[data-id]").forEach(function (b) {
            b.addEventListener("click", function () { goTo(byId.get(b.getAttribute("data-id")), true); });
          });
        }
      } catch (e) { warn("Profilkarte (Render)", e); }
      return r;
    };
  });

  // 5 · story "Zwei Heimaten"
  feature("Geschichte Zwei Heimaten", function () {
    return typeof STORIES !== "undefined" && Array.isArray(STORIES) && fn(storyBox) && fn(popShareBelow) && fn(setView) &&
      typeof d3 !== "undefined" && byId.has("DE40B") && byId.has("DEA23");
  }, function () {
    var OSL = "DE40B", KOE = "DEA23";
    var ZH = {t: "Zwei Heimaten",
      run: function () {
        setView("map", true); level = 2; drawLevel(); metric = M0 || METRICS[0]; hlMode = "off";
        selected = byId.get(OSL) || selected; thr = selected[metric.k] != null ? selected[metric.k] : thr;
        group.clear(); group.add(KOE);
        zoomTo([[5.5, 47.2], [15.5, 55.1]]);
      },
      text: function () {
        var o = byId.get(OSL), k = byId.get(KOE), m = M0 || METRICS[0];
        if (!o || !k || o.gdp_pc_ppp == null || k.gdp_pc_ppp == null) return "";
        var t = o.name + " kommt auf " + m.fmt(o.gdp_pc_ppp) + " BIP pro Kopf, " + k.name + " auf " + m.fmt(k.gdp_pc_ppp) +
          " – rund " + f1(k.gdp_pc_ppp / o.gdp_pc_ppp).replace(/,0$/, "") + "-mal so viel. Weltweit liegen trotzdem beide weit vorn: rund " +
          pct(popShareBelow(o, "gdp_pc_ppp")) + " der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf, gemessen an " + k.name + " sogar rund " +
          pct(popShareBelow(k, "gdp_pc_ppp")) + ".";
        try {
          var a = twins(o, m), b = twins(k, m);
          if (a && a.length && b && b.length) t += " Ähnlich hoch: " + a[0].name + " (" + where(a[0]) + ") wie " + o.name + ", " +
            b[0].name + " (" + where(b[0]) + ") wie " + k.name + ".";
        } catch (e) {}
        return t;
      }};
    STORIES.push(ZH);
    d3.select("#stories").selectAll("button").data(STORIES).join("button").attr("type", "button").attr("class", "chip story").text(function (d) { return d.t; })
      .on("click", function (e, d) { story = d; d.run(); update(); });
    var orig = storyBox;
    storyBox = function () {
      var r = orig.apply(this, arguments);
      try {
        if (story === ZH) {
          var p = document.getElementById("storytext"), a = document.createElement("a");
          a.href = "zwei-heimaten.html"; a.textContent = "Die ganze Geschichte lesen →";
          p.appendChild(document.createTextNode(" ")); p.appendChild(a);
        }
      } catch (e) {}
      return r;
    };
  });

  // 7 · unique search suggestions
  feature("Suche", function () { return !!document.getElementById("q") && !!document.getElementById("names") && fn(pick) && fn(drawLevel); }, function () {
    var list = units.filter(function (u) { return !u.nogeo && u.name; });
    var base = function (u) { return u.kind === "Land/Gebiet" ? u.name + " (Land)" : u.name + " (" + [kindLabel(u), countryName(u)].filter(Boolean).join(", ") + ")"; };
    var count = function (f) { var m = new Map(); list.forEach(function (u) { var l = f(u); m.set(l, (m.get(l) || 0) + 1); }); return m; };
    var c1 = count(base);
    var withParent = function (u) {
      var l = base(u); if (c1.get(l) < 2) return l;
      var p = u.parent && byId.get(u.parent), pn = p && p.id !== u.country && p.name !== u.name ? p.name : "";
      return u.name + " (" + [kindLabel(u), pn, countryName(u)].filter(Boolean).join(", ") + ")";
    };
    var c2 = count(withParent);
    var label = new Map(), byLabel = new Map();
    list.forEach(function (u) {
      var l = withParent(u);
      if (c2.get(l) > 1) l = l.replace(/\)$/, ", " + big(u.pop || 0) + " Einw.)");
      if (byLabel.has(l.toLowerCase())) l = l.replace(/\)$/, ", " + u.id + ")");
      label.set(u, l); byLabel.set(l.toLowerCase(), u);
    });
    var sorted = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "de") || bySize(a, b); });
    var dl = document.getElementById("names"), frag = document.createDocumentFragment();
    sorted.forEach(function (u) { var o = document.createElement("option"); o.value = label.get(u); frag.appendChild(o); });
    dl.textContent = ""; dl.appendChild(frag);
    var q = document.getElementById("q");
    if (!q.getAttribute("aria-label")) q.setAttribute("aria-label", "Region oder Land suchen");
    q.setAttribute("aria-keyshortcuts", "/");

    function resolve(raw) {
      var v = raw.trim().toLowerCase(); if (!v) return null;
      if (byLabel.has(v)) return byLabel.get(v);
      var exact = list.filter(function (u) { return u.name.toLowerCase() === v; }).sort(bySize);
      if (exact.length) return exact[0];
      var pre = list.filter(function (u) { return u.name.toLowerCase().indexOf(v) === 0; }).sort(bySize);
      return pre[0] || null;
    }
    function done(u) { goTo(u, false); q.value = ""; q.blur(); }
    // capture phase on window runs before the page's own change handler on #q
    window.addEventListener("change", function (e) {
      if (e.target !== q) return;
      var u = resolve(q.value); if (!u) return;
      e.stopPropagation(); done(u);
    }, true);
    // picking a suggestion: act right away (the value then is exactly one of our labels)
    window.addEventListener("input", function (e) {
      if (e.target !== q) return;
      var u = byLabel.get(q.value.trim().toLowerCase());
      if (u && q.value === label.get(u)) done(u);
    }, true);
  });

  // 8 · cross links
  feature("Querverweise", function () { return !!document.getElementById("notes"); }, function () {
    var p = document.createElement("p"); p.className = "wx-related";
    p.innerHTML = '<span class="lab">Weiterlesen</span><a href="zwei-heimaten.html">Datenstory: Zwei Heimaten</a>' +
      '<a href="laender-indikatoren-explorer.html">Länder-Indikatoren-Explorer</a>';
    var notes = document.getElementById("notes"); notes.parentNode.insertBefore(p, notes);
  });

  // 9 · keyboard
  feature("Tastatur", function () { return !!document.getElementById("q"); }, function () {
    var q = document.getElementById("q");
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var t = e.target, tag = t && t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
        e.preventDefault(); q.focus();
      } else if (e.key === "Escape" && e.target === q) { q.blur(); }
    });
  });

  // 11 · feedback at the map after a pick: name, value, jump to the profile card.
  // Phones: a line right under the map. Desktop: a small box on the map, shown after the first click on it.
  // From 1500 px the profile card stands next to the map, the box stays hidden there.
  feature("Rückmeldung an der Karte", function () { return fn(card) && !!document.querySelector(".mapbox") && !!document.getElementById("card"); }, function () {
    var mb = document.querySelector(".mapbox"), bar = document.createElement("div"), last = null;
    bar.className = "wx-pick";
    mb.insertBefore(bar, document.getElementById("zoom") || null);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    function render() {
      var u = selected; if (!u) return;
      var v = u[metric.k];
      bar.innerHTML = '<span class="lab">Auswahl</span><span class="wx-pk-n"></span><span class="num"></span>' +
        '<button type="button" class="wx-pk-go" aria-label="Zur Profilkarte">Details ↓</button>';
      bar.querySelector(".wx-pk-n").textContent = u.name;
      bar.querySelector(".num").textContent = v != null ? metric.fmt(v) : "keine Daten";
      bar.querySelector(".wx-pk-n").title = u.name;
      if (last && last !== u) { bar.classList.remove("flash"); void bar.offsetWidth; bar.classList.add("flash"); }
      last = u;
    }
    bar.addEventListener("click", function (e) {
      if (!e.target.closest(".wx-pk-go")) return;
      var c = document.getElementById("card");
      c.scrollIntoView({behavior: reduce.matches ? "auto" : "smooth", block: "start"});
      if (!c.hasAttribute("tabindex")) c.setAttribute("tabindex", "-1");
      try { c.focus({preventScroll: true}); } catch (x) {}
    });
    var cvs = document.getElementById("map");
    if (cvs) cvs.addEventListener("click", function () { bar.classList.add("on"); });
    var orig = card;
    card = function () {
      var r = orig.apply(this, arguments);
      try { render(); } catch (e) { warn("Rückmeldung an der Karte (Render)", e); }
      return r;
    };
  });

  // 12 · explanation text: two lines on phones, "mehr" opens it (nothing removed, only folded)
  feature("Erklärtext mobil", function () { return fn(update) && !!document.getElementById("explain"); }, function () {
    var ex = document.getElementById("explain"), open = false;
    var phone = window.matchMedia("(max-width:700px)");
    ex.classList.add("wx-clamp");
    function addMore() {
      var b = ex.querySelector(".wx-more");
      if (!b) {
        b = document.createElement("button"); b.type = "button"; b.className = "wx-more";
        b.addEventListener("click", function () { open = !open; ex.classList.toggle("wx-open", open); addMore(); });
        ex.appendChild(document.createTextNode(" ")); ex.appendChild(b);
      }
      b.textContent = open ? "weniger" : "mehr";
      b.setAttribute("aria-expanded", open ? "true" : "false");
      b.setAttribute("aria-label", open ? "Erklärung einklappen" : "Ganze Erklärung zeigen");
      // nothing to open when the text fits into two lines anyway
      ex.classList.remove("wx-fits");
      if (!open && phone.matches && ex.scrollHeight <= ex.clientHeight + 2) ex.classList.add("wx-fits");
    }
    var orig = update;
    update = function () {
      var r = orig.apply(this, arguments);
      try { addMore(); } catch (e) { warn("Erklärtext mobil (Render)", e); }
      return r;
    };
    try { phone.addEventListener("change", addMore); } catch (e) {}
    addMore();
  });

  // 13 · outliers (hot = BIP pro Kopf mehr als doppelt so hoch wie im Land: Pendler, Konzernsitze, Rohstoffe)
  // are not chosen as automatic extreme labels for the GDP-per-head metrics; data and colours stay as they are.
  // The legend's "höchster Wert" names the outlier and adds the highest value without outliers.
  feature("Ausreißer-Labels", function () { return fn(labels) && fn(recolor) && typeof items !== "undefined" && fn(ranked) && !!document.getElementById("lcap"); }, function () {
    var GDPK = /^(gdp_pc_|eu_index$)/;
    var origL = labels;
    labels = function () {
      if (!GDPK.test(metric.k)) return origL.apply(this, arguments);
      var all = items;
      try {
        items = all.filter(function (i) { return !(i.u && i.u.hot && i.u !== selected); });
        return origL.apply(this, arguments);
      } finally { items = all; }
    };
    var origR = recolor;
    recolor = function () {
      var r = origR.apply(this, arguments);
      try {
        var k = metric.k;
        if (GDPK.test(k)) {
          var lv = atLevel().filter(function (u) { return ranked(u) && u[k] != null; });
          var top = null, topN = null;
          lv.forEach(function (u) { if (!top || u[k] > top[k]) top = u; if (!u.hot && (!topN || u[k] > topN[k])) topN = u; });
          if (top && top.hot) {
            var cap = document.getElementById("lcap");
            cap.textContent += " (" + top.name + ", als Ausreißer markiert: Pendler, Konzernsitze oder Rohstoffe" +
              (topN ? "; ohne Ausreißer " + metric.fmt(topN[k]) + ", " + topN.name + (countryName(topN) ? " (" + countryName(topN) + ")" : "") : "") + ")";
          }
        }
      } catch (e) { warn("Ausreißer-Legende", e); }
      return r;
    };
  });

  // 14 · story "Die Welt in Menschen": start from the page's default selection instead of the previous region
  feature("Geschichte Welt in Menschen", function () { return typeof STORIES !== "undefined" && Array.isArray(STORIES); }, function () {
    var s = STORIES.find(function (x) { return x.t === "Die Welt in Menschen"; });
    if (!s || !fn(s.run)) { warn("Geschichte Welt in Menschen", "Geschichte nicht gefunden"); return; }
    var orig = s.run;
    s.run = function () {
      var r = orig.apply(this, arguments);
      var d = byId.get("DE300") || byId.get("DEU");
      if (d && d.lv.includes(level)) { selected = d; thr = d[metric.k] != null ? d[metric.k] : null; }
      return r;
    };
  });

  // 15 · hashchange on the same page: start from the default state, like opening the link fresh
  // (otherwise groups add up and threshold/highlight of the previous view stay)
  feature("Hash-Wechsel", function () { return fn(readHash) && typeof group !== "undefined" && typeof METRICS !== "undefined" && typeof SCALES !== "undefined"; }, function () {
    hashPre = function (e) {
      var url = (e && e.newURL) || location.href;
      if (!byId.has(hashId(url))) return;                  // not a view link: the page ignores it, so do we
      group.clear(); hlMode = "off"; thr = null; metric = METRICS[0]; level = 2; view = "map";
      sqUnit = "people"; story = null;
      if (classMode !== "countries") { classMode = "countries"; }
      for (var key in SCALES) delete SCALES[key];        // colour classes depend on classMode
    };
  });

  // 16 · key figures: the five main ones first, the others behind "Weitere Kennzahlen".
  // The active metric always stays visible (deep link, story); the open/closed state is not part of the hash.
  feature("Kennzahlen", function () { return !!document.getElementById("metrics") && fn(update) && typeof METRICS !== "undefined"; }, function () {
    var box = document.getElementById("metrics");
    var MAIN = ["gdp_pc_ppp", "hh_pc_ppp", "gdp_pc_rp", "density", "gini"];
    var chips = [].slice.call(box.querySelectorAll(".chip"));
    var main = chips.filter(function (b) { return b.__data__ && MAIN.indexOf(b.__data__.k) >= 0; });
    var rest = chips.filter(function (b) { return main.indexOf(b) < 0; });
    if (main.length !== MAIN.length || !rest.length) { warn("Kennzahlen", "Kennzahlen unerwartet"); return; }
    var t = document.createElement("button");
    t.type = "button"; t.className = "wx-mtoggle"; t.setAttribute("aria-controls", "metrics");
    main.forEach(function (b) { box.appendChild(b); });
    box.appendChild(t);
    rest.forEach(function (b) { b.classList.add("wx-xm"); box.appendChild(b); });
    var open = false;
    function render() {
      box.classList.toggle("wx-open", open);
      t.setAttribute("aria-expanded", open ? "true" : "false");
      t.textContent = open ? "Weniger Kennzahlen" : "Weitere Kennzahlen (" + rest.length + ")";
    }
    t.addEventListener("click", function () { open = !open; render(); });
    render();
  });

  // 17 · search in the page header: the same field #q with its suggestion list, only moved
  feature("Suche oben", function () { return !!document.getElementById("q") && !!document.getElementById("names") && !!document.querySelector(".wrap > header"); }, function () {
    var hd = document.querySelector(".wrap > header"), q = document.getElementById("q"), dl = document.getElementById("names");
    var box = document.createElement("div"); box.className = "wx-find"; box.setAttribute("role", "search");
    var kb = document.createElement("kbd"); kb.textContent = "/"; kb.setAttribute("aria-hidden", "true"); kb.title = "Taste / springt in die Suche";
    box.appendChild(q); box.appendChild(kb); box.appendChild(dl);
    hd.appendChild(box); hd.classList.add("wx-hdr");
    q.placeholder = "Ort suchen, z. B. München, Texas, Japan";
  });

  // 18 · colour classes: the code splits into sevenths (7 colours), the chips say so
  feature("Farbstufen", function () { return !!document.querySelector('#views [data-cw="countries"]') && !!document.querySelector('#views [data-cw="people"]'); }, function () {
    var a = document.querySelector('#views [data-cw="countries"]'), b = document.querySelector('#views [data-cw="people"]');
    a.textContent = "je 1/7 der Länder"; a.title = "Sieben Farben, jede Farbe umfasst gleich viele Länder";
    b.textContent = "je 1/7 der Menschheit"; b.title = "Sieben Farben, jede Farbe umfasst gleich viele Menschen (nach Länderwerten)";
  });

  // 20 · story "Wenn BIP täuscht" in three steps that switch the view themselves
  feature("Geschichte in Schritten", function () {
    return typeof STORIES !== "undefined" && Array.isArray(STORIES) && fn(storyBox) && fn(findName) && fn(setView) && fn(zoomTo) && !!document.getElementById("storybox") && !!document.getElementById("storyclose");
  }, function () {
    var S = STORIES.find(function (x) { return x.t === "Wenn BIP täuscht"; });
    var W = findName("Wolfsburg"), DEU = byId.get("DEU"), CHE = byId.get("CHE");
    if (!S || !W || !DEU || !CHE || W.gdp_pc_ppp == null) { warn("Geschichte in Schritten", "Geschichte oder Daten fehlen"); return; }
    var MH = METRICS.find(function (m) { return m.k === "hh_pc_ppp"; }), MG = M0 || METRICS[0];
    var metro = units.find(function (x) { return x.lv.includes(3) && x._members && x._members.includes(W.id) && x.gdp_pc_ppp != null; });
    var DE_BOX = [[5.5, 47.2], [15.5, 55.1]];
    function deRank(k) {
      var l = units.filter(function (x) { return x.country === "DEU" && x.lv.includes(2) && x[k] != null; }).sort(function (a, b) { return b[k] - a[k]; });
      return {r: l.indexOf(W) + 1, n: l.length};
    }
    var steps = [
      {run: function () { level = 2; drawLevel(); metric = MG; selected = W; thr = W.gdp_pc_ppp; hlMode = "off"; zoomTo(DE_BOX); },
       text: function () {
         var r = deRank("gdp_pc_ppp");
         return "Wolfsburg erwirtschaftet " + MG.fmt(W.gdp_pc_ppp) + " BIP pro Kopf – " +
           (r.r === 1 ? "mehr als jeder andere der " + f0(r.n) + " Kreise in Deutschland" : "Rang " + f0(r.r) + " von " + f0(r.n) + " Kreisen in Deutschland") +
           " und mehr als die Schweiz (" + MG.fmt(CHE.gdp_pc_ppp) + "). Der Grund: VW. Das BIP zählt am Arbeitsort, viele Beschäftigte wohnen aber im Umland.";
       }},
      {ok: function () { return MH && W.hh_pc_ppp != null; },
       run: function () { level = 2; drawLevel(); metric = MH; selected = W; thr = W.hh_pc_ppp; hlMode = "off"; zoomTo(DE_BOX); },
       text: function () {
         return "Gezählt am Wohnort sieht es anders aus: Beim Haushaltskonsum pro Kopf kommt Wolfsburg auf " + MH.fmt(W.hh_pc_ppp) +
           (DEU.hh_pc_ppp != null ? (W.hh_pc_ppp < DEU.hh_pc_ppp ? " – weniger als der deutsche Schnitt (" : " – etwa so viel wie der deutsche Schnitt (") + MH.fmt(DEU.hh_pc_ppp) + ")" : "") + "." +
           (W.hh_note ? " Diesen Wert gibt es nur für die größere Region (" + W.hh_note + "), nicht für Wolfsburg allein." : "");
       }},
      {ok: function () { return !!metro; },
       run: function () { level = 3; drawLevel(); metric = MG; selected = metro; thr = metro.gdp_pc_ppp; hlMode = "off"; zoomTo(DE_BOX); },
       text: function () {
         return "Die Ebene Metropolregionen fasst Stadt und Umland zusammen. " + metro.name + " kommt auf " + MG.fmt(metro.gdp_pc_ppp) +
           " pro Kopf, rund " + pct(metro.gdp_pc_ppp / W.gdp_pc_ppp) + " des Wolfsburger Werts" +
           (metro.gdp_pc_ppp > DEU.gdp_pc_ppp ? " und noch über dem deutschen Schnitt (" + MG.fmt(DEU.gdp_pc_ppp) + ")." : ".") + " Der Ausreißer verschwindet.";
       }}
    ].filter(function (s) { return !s.ok || s.ok(); });
    var i = 0;
    S.steps = steps;
    S.run = function () { setView("map", true); i = 0; steps[0].run(); };
    S.text = function () { return steps[i].text(); };

    var box = document.getElementById("storybox"), close = document.getElementById("storyclose");
    var nav = document.createElement("div"); nav.className = "wx-steps"; nav.hidden = true;
    nav.setAttribute("role", "group"); nav.setAttribute("aria-label", "Schritte der Geschichte");
    nav.innerHTML = '<button type="button" class="chip" data-d="-1">← Zurück</button><span class="wx-stepn" aria-live="polite"></span><button type="button" class="chip" data-d="1">Weiter →</button>';
    // steps and "Geschichte schließen" share one line
    var foot = document.createElement("div"); foot.className = "wx-sfoot";
    box.insertBefore(foot, close); foot.appendChild(nav); foot.appendChild(close);
    var prev = nav.querySelector('[data-d="-1"]'), next = nav.querySelector('[data-d="1"]'), num = nav.querySelector(".wx-stepn");
    function go(d) {
      var j = Math.max(0, Math.min(steps.length - 1, i + d)); if (j === i || story !== S) return;
      i = j; steps[i].run(); update();
    }
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
      go(+b.getAttribute("data-d"));
      // keep the keyboard focus on a usable button
      if (b.disabled) (b === next ? prev : next).focus();
    });
    var orig = storyBox;
    storyBox = function () {
      var r = orig.apply(this, arguments);
      try {
        var on = story === S && steps.length > 1;
        nav.hidden = !on;
        if (on) { num.textContent = "Schritt " + (i + 1) + " von " + steps.length; prev.disabled = i === 0; next.disabled = i === steps.length - 1; }
      } catch (e) { warn("Geschichte in Schritten (Render)", e); }
      return r;
    };
  });

  function init() {
    try { if (typeof METRICS !== "undefined") M0 = METRICS.find(function (m) { return m.k === "gdp_pc_ppp"; }) || METRICS[0]; } catch (e) {}
    FEATURES.forEach(function (f) {
      try { if (!f.ok()) { warn(f.name, "erwartete Funktion fehlt"); return; } f.run(); }
      catch (e) { warn(f.name, e); }
    });
    // render once so card/story/link pick up the extensions
    try { if (fn(update)) update(); } catch (e) { warn("Erstes Rendern", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
