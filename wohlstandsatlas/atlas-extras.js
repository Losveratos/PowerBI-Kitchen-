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
 *  4. Profilkarte: „Gleichauf auf anderen Kontinenten"
 *  5. Geschichte „Zwei Heimaten"
 *  6. Profilkarte: „In der Story vergleichen →" (zwei-heimaten.html#vs=ID)
 *  7. Eindeutige Suchvorschläge „Name (Art, Land)", größere Einheit gewinnt
 *  8. Querverweise Datenstory + Länder-Indikatoren-Explorer
 *  9. Tastatur: „/" fokussiert die Suche, Esc verlässt sie
 */
(function () {
  "use strict";
  var HASH0 = "";
  try { HASH0 = location.hash || ""; } catch (e) {}

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
    // the story row got an eighth chip: let it wrap on wide screens instead of cutting the last chip off
    "@media (min-width:701px){.row[aria-label=\"Geschichten\"]{flex-wrap:wrap;overflow-x:visible}}"
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
      var d = Math.abs(Math.log(w / v));
      if (!best[x.ct] || d < best[x.ct].d) best[x.ct] = {u: x, d: d};
    });
    return Object.keys(best).map(function (c) { return best[c]; })
      .filter(function (b) { return Math.abs(b.u[k] / v - 1) <= 0.05; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, 3).map(function (b) { return b.u; });
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
        var tw = twins(u), parts = [];
        if (tw) {
          var k = metric.k, v = u[k];
          parts.push('<div class="wx-twins"><h3>Gleichauf auf anderen Kontinenten</h3>' + (tw.length
            ? '<div class="cmp">' + tw.map(function (x) {
                var dv = (x[k] / v - 1) * 100, ds = (dv >= 0 ? "+" : "−") + f1(Math.abs(dv)) + " %";
                var land = countryName(x);
                return '<button type="button" data-id="' + esc(x.id) + '" aria-label="' + esc(x.name + (land ? ", " + land : "") + " auswählen und hinzoomen") + '">' +
                  '<span class="wx-n">' + esc(x.name) + '</span><span class="num">' + esc(metric.fmt(x[k])) + '</span>' +
                  '<span class="like">' + esc([kindLabel(x), land, x.ct].filter(Boolean).join(" · ")) + ' · ' + ds + '</span></button>';
              }).join("") + '</div>'
            : '<p class="hint">Keine Region auf einem anderen Kontinent liegt innerhalb von 5 %.</p>') +
            '<p class="hint" style="font-size:.78rem">Gleiche Ebene und Kennzahl, je Kontinent die nächste Einheit, höchstens 5 % Abstand, ab 100.000 Einwohnern, ohne Ausreißer und Kleinsteinheiten.</p></div>');
        }
        if (storyEligible(u)) {
          parts.push('<p class="wx-links"><a href="zwei-heimaten.html#vs=' + encodeURIComponent(u.id) + '">In der Story vergleichen →</a>' +
            '<span>Datenstory „Zwei Heimaten“: ' + esc(u.name) + ' neben einer zweiten Region</span></p>');
        }
        if (parts.length) {
          var box = document.createElement("div"); box.className = "wx-card"; box.style.cssText = "display:grid;gap:14px;min-width:0";
          box.innerHTML = parts.join("");
          el.appendChild(box);
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
          " – rund " + f1(k.gdp_pc_ppp / o.gdp_pc_ppp).replace(/,0$/, "") + "-mal so viel. Weltweit liegen trotzdem beide weit vorn: " +
          pct(popShareBelow(o, "gdp_pc_ppp")) + " der Menschheit leben in Regionen mit weniger, gemessen an " + k.name + " sogar " +
          pct(popShareBelow(k, "gdp_pc_ppp")) + ".";
        try {
          var a = twins(o, m), b = twins(k, m);
          if (a && a.length && b && b.length) t += " Gleichauf: " + a[0].name + " (" + countryName(a[0]) + ") mit " + o.name + ", " +
            b[0].name + " (" + countryName(b[0]) + ") mit " + k.name + ".";
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
