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
 *  4. Profilkarte: „Ähnlich auf anderen Kontinenten" (höchstens 10 % darüber oder darunter wie in der Datenstory,
 *     je Kontinent die bevölkerungsreichste Einheit); über dem großen Wert der Name der Kennzahl
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
 * 20. Geschichten in Schritten mit „Weiter →" / „← Zurück" (alle außer einschrittigen; Zahlen zur Laufzeit aus den Daten),
 *     Kasten mit fester Mindesthöhe je Geschichte, nach „Weiter" holt die Seite die Karte in den Blick
 * 21. Steuerung kompakt: Detail · Ansicht · Farbstufen (aufklappbar) in einer Zeile über der Karte, Erklärtext auch am
 *     Desktop einzeilig mit „mehr", Unterzeile mit den Datenjahren unter die Legende; unter 1500 px (ohne Handy)
 *     ist die Karte höchstens 72 % der Fensterhöhe hoch (Seite: 78 %)
 * 22. Überschrift: während einer Geschichte nur der feste Median-Satz (springt nicht, widerspricht dem Kasten nicht);
 *     Haushaltswerte, die nur für eine größere Region gelten, sagen das in der Überschrift
 * 23. Profilkarte geordnet: Wert, Warnungen, Kennzahlen, Story-Link, Ähnliche; Zeitreihe und „Auf einer Stufe mit“
 *     danach; „Alle Kennzahlen · ähnlichstes Land“ eingeklappt (Zustand bleibt bei neuer Auswahl); Quellen am Ende
 * 24. Hinweis, wenn die regionale Verteilung fünf oder mehr Jahre älter ist als der Landeswert
 * 25. Bewegung reduzieren: Zoom-Übergänge springen bei prefers-reduced-motion direkt ans Ziel
 * 26. „Geschichte schließen" stellt den Zustand vor der ersten geöffneten Geschichte wieder her (Kennzahl, Ebene, Ansicht,
 *     Farbstufen, Hervorhebung/Schwelle, Gruppe, Auswahl, Zoom); Handy: der Kasten steht direkt über der Karte, beim Öffnen
 *     rückt die Seite Kasten und Karte in den Blick
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
    // explanation: one line (phones: two lines), "mehr" opens it
    "#explain{position:relative}",
    ".wx-more{display:none;font:500 .78rem var(--body);background:none;border:0;color:var(--muted);cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px}",
    "#explain.wx-clamp:not(.wx-open){display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:1;line-clamp:1;overflow:hidden}",
    "#explain.wx-clamp .wx-more{display:inline}",
    "#explain.wx-clamp:not(.wx-open) .wx-more{position:absolute;right:0;bottom:0;padding-left:2.2em;background:linear-gradient(90deg,transparent,var(--bg) 1.6em)}",
    "#explain.wx-clamp.wx-fits .wx-more{display:none}",
    "@media (max-width:700px){#explain.wx-clamp:not(.wx-open){-webkit-line-clamp:2;line-clamp:2}}",
    // compact controls: Detail · Ansicht · Farbstufen in one row
    ".wx-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;min-width:0}",
    ".wx-g{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-width:0}",
    ".wx-g .chip[hidden]{display:none}",
    ".wx-cwt{flex:none;font:500 .82rem var(--body);border:1px dashed var(--line);background:none;color:var(--muted);padding:7px 12px;border-radius:999px;cursor:pointer;white-space:nowrap}",
    ".wx-cwt:hover{color:var(--ink);border-color:var(--ink)}",
    "@media (max-width:700px){.wx-ctl{gap:8px 16px}",
    "  .wx-g-lv{flex:1 1 100%;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;padding-right:28px;-webkit-mask-image:linear-gradient(90deg,#000 82%,transparent);mask-image:linear-gradient(90deg,#000 82%,transparent)}",
    "  .wx-g-lv::-webkit-scrollbar{display:none}}",
    ".wx-sub{margin:0}",
    // profile card: folded table, warnings near the value
    "details.wx-all{display:grid;gap:8px;min-width:0}",
    "details.wx-all>summary{cursor:pointer;font:600 .76rem var(--body);text-transform:uppercase;letter-spacing:.07em;color:var(--muted);list-style:none;padding:2px 0}",
    "details.wx-all>summary::-webkit-details-marker{display:none}",
    "details.wx-all>summary::before{content:\"▸ \"}",
    "details.wx-all[open]>summary::before{content:\"▾ \"}",
    "details.wx-all>summary:hover{color:var(--ink)}",
    "details.wx-all>.cmp{margin-top:6px}",
    "#card .inner2.wx-one{grid-template-columns:minmax(0,1fr)}",
    ".wx-warns{margin-top:-4px}",
    // keyboard focus where the page's own CSS resets it (all:unset)
    ".chain button:focus-visible{outline:2px solid var(--sel);outline-offset:2px;border-radius:3px}",
    ".cmp button:focus-visible{outline-offset:2px;border-radius:3px}",
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
    ".wx-steps .wx-stepn{font:500 .75rem var(--mono);color:var(--muted);min-width:9.5ch}",
    // card: rank counts units, share counts people
    ".wx-rankhint{font-size:.8rem}",
    // card: metric name above the big value
    ".big .wx-mlab{flex:0 0 100%;margin-bottom:-4px}",
    // story box: phones keep the step line short ("Schritt" only for screen readers), keyboard focus after opening
    ".wx-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}",
    "@media (min-width:701px){.wx-steps .wx-sw{position:static;width:auto;height:auto;overflow:visible;clip:auto;clip-path:none}}",
    "@media (max-width:700px){.wx-steps .wx-stepn{min-width:0}.wx-sfoot{gap:6px 14px}}",
    "#storybox:focus{outline:none}#storybox:focus-visible{outline:2px solid var(--sel);outline-offset:2px}"
  ].join("\n");

  // ---------- shared state ----------
  var zOn = false, zUnit = null;          // --z1: zoom on the selection while it stays selected
  var M0 = null;                           // BIP/Kopf (KKP)
  var OLD_YEARS = 5;
  // "similar": at most 10 % above or below, as in the data story zwei-heimaten.html (regional values are estimates
  // and move by several per cent with revisions)
  var TWIN_TOL = 0.10;                       // regional distribution this many years older than the national value: hint
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
      if (d > TWIN_TOL) return;
      // within the tolerance all candidates are equally close given the uncertainty of the regional estimates:
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

  // state-independent helpers (stories measure all their steps up front, so their texts must not read the current level)
  function mk(k) { return METRICS.find(function (m) { return m.k === k; }); }
  function at(lv) { return units.filter(function (u) { return u.lv.includes(lv) && !u.nogeo; }); }
  function popBelow(v, k, lv) { return d3.sum(at(lv).filter(function (x) { return x[k] != null && x[k] < v; }), function (x) { return x.pop || 0; }) / WORLD.pop; }
  function popAbove(v, k, lv) { return d3.sum(at(lv).filter(function (x) { return x[k] != null && x[k] > v; }), function (x) { return x.pop || 0; }) / WORLD.pop; }
  function times(a, b) { return f1(a / b).replace(/,0$/, ""); }
  // household values that exist only for a larger region (hh_note in the data)
  function hhPhrase(u) {
    var n = u && u.hh_note; if (!n) return "";
    if (/NUTS-2/.test(n)) return "Wert der größeren NUTS-2-Region";
    if (/Landeswert/.test(n)) return "Landeswert, keine regionalen Einkommensdaten";
    return n;
  }
  function hhFor(u) {
    var n = u && u.hh_note; if (!n) return "";
    if (/NUTS-2/.test(n)) return "für die größere NUTS-2-Region";
    if (/Landeswert/.test(n)) return "für das ganze Land";
    return "für die übergeordnete Region";
  }
  // "Hangzhou (杭州市; Zhejiang, China)" instead of two pairs of brackets
  function named(x) { var wo = where(x); if (!wo) return x.name; return /\)$/.test(x.name) ? x.name.replace(/\)$/, "; " + wo + ")") : x.name + " (" + wo + ")"; }

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

  // 21 · compact controls above the map: Detail · Ansicht · Farbstufen in one row (Farbstufen folded), the explanation
  // in one line (feature 12) and the line with the data years under the legend. Runs before the layout, so the wide
  // layout measures the final height above the map.
  feature("Steuerung kompakt", function () {
    var v = document.getElementById("views"), lv = document.getElementById("levels"), st = document.getElementById("settings");
    return !!v && !!lv && !!st && !!lv.parentNode && st.contains(v) && v.querySelectorAll(".chip[data-v]").length === 2 && v.querySelectorAll("[data-cw]").length === 2;
  }, function () {
    var views = document.getElementById("views"), st = document.getElementById("settings"), lvRow = document.getElementById("levels").parentNode;
    var bV = [].slice.call(views.querySelectorAll(".chip[data-v]")), bC = [].slice.call(views.querySelectorAll("[data-cw]"));
    var labs = [].slice.call(views.querySelectorAll(".lab"));
    function grp(cls, name, nodes) {
      var g = document.createElement("div"); g.className = "wx-g " + cls; g.setAttribute("role", "group"); g.setAttribute("aria-label", name);
      nodes.forEach(function (n) { if (n) g.appendChild(n); }); return g;
    }
    // Detail: the page's own row, now one group inside the control row
    lvRow.className = "wx-g wx-g-lv";
    var gV = grp("wx-g-v", "Ansicht", [labs[0]].concat(bV));
    // Farbstufen: a button opens the two chips (they keep their aria-pressed from the page script)
    var t = document.createElement("button"); t.type = "button"; t.className = "wx-cwt"; t.id = "wx-cwt"; t.setAttribute("aria-controls", "wx-cw");
    var gC = grp("wx-g-cw", "Farbstufen", [t].concat(bC)); gC.id = "wx-cw";
    if (labs[1]) labs[1].remove();
    var open = false;
    function render() {
      bC.forEach(function (b) { b.hidden = !open; });
      t.setAttribute("aria-expanded", open ? "true" : "false");
      var on = bC.find(function (b) { return b.getAttribute("aria-pressed") === "true"; });
      t.textContent = open ? "Farbstufen ▾" : "Farbstufen ▸";
      t.title = on ? "Farbstufen: " + on.textContent : "Farbstufen";
      // phones: the level row scrolls sideways; keep the active level in sight
      var a = lvRow.querySelector('.chip[aria-pressed="true"]');
      if (a && lvRow.scrollWidth > lvRow.clientWidth + 1) {
        var l = a.offsetLeft - lvRow.offsetLeft, rr = l + a.offsetWidth;
        if (l < lvRow.scrollLeft || rr > lvRow.scrollLeft + lvRow.clientWidth - 32) lvRow.scrollLeft = Math.max(0, rr - lvRow.clientWidth + 40);
      }
    }
    t.addEventListener("click", function () { open = !open; render(); });
    // #views keeps all four buttons (the page script finds them as "#views …")
    views.className = "wx-ctl"; views.removeAttribute("role"); views.removeAttribute("aria-label");
    views.textContent = "";
    views.appendChild(lvRow); views.appendChild(gV); views.appendChild(gC);
    st.parentNode.insertBefore(views, st);
    st.hidden = true; st.style.display = "none";
    render();
    try { if (fn(update)) { var o = update; update = function () { var r = o.apply(this, arguments); try { render(); } catch (e) {} return r; }; } } catch (e) {}
    // line with the data years: under the legend instead of in the header
    var sub = document.getElementById("sub"), lg = document.querySelector(".wrap > .legend");
    if (sub && lg) { sub.classList.add("wx-sub"); lg.insertAdjacentElement("afterend", sub); }
  });

  // 10 · layout: squares controls under the chart; from 1500 px map and profile card side by side.
  // Runs before the zoom link so that a --z1 zoom is computed with the final canvas size.
  feature("Layout", function () {
    return fn(sizeCanvas) && fn(redraw) && fn(band) && typeof zoom !== "undefined" && typeof cv !== "undefined" && typeof d3 !== "undefined" &&
      !!document.querySelector(".wrap > .mapbox") && !!document.getElementById("sqpanel");
  }, function () {
    var mb = document.querySelector(".wrap > .mapbox"), sq = document.getElementById("sqpanel");
    var lg = document.querySelector(".wrap > .legend"), pn = document.querySelector(".wrap > section.panel"), fd = document.querySelector(".wrap > .find"), cols = document.querySelector(".wrap > .cols");
    var sub = document.querySelector(".wrap > .wx-sub");
    // controls of the squares view go below the chart (like the map legend), so the chart starts higher
    mb.insertAdjacentElement("afterend", sq);
    // wrap map … search and the card column; the wrappers are display:contents below 1500 px
    var order = [mb, sq, lg, sub, pn, fd, cols].filter(Boolean);
    var inOrder = order.every(function (x, j) { return !j || (order[j - 1].compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING); });
    if (!(lg && pn && fd && cols && inOrder)) {
      warn("Layout (Nebeneinander)", "Aufbau der Seite unerwartet"); return;
    }
    var split = document.createElement("div"), main = document.createElement("div");
    split.className = "wx-split"; main.className = "wx-main";
    mb.parentNode.insertBefore(split, mb);
    [mb, sq, lg, sub, pn, fd].filter(Boolean).forEach(function (x) { main.appendChild(x); });
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
    // 21 · below 1500 px (not on phones): the map at most 72 % of the window height (page: 78 %), so that together
    // with the compact controls at least two thirds of it are in the first screen on 1366×800
    function capH() {
      if (wide.matches || CW < 560) return;
      var ch = Math.round(Math.min(CW * 0.52, window.innerHeight * 0.72));
      if (!(ch > 0) || ch >= CH) return;
      CH = ch; cv.style.height = CH + "px"; cv.height = Math.round(CH * dpr);
      oy = (CH - BH * s0) / 2; PAT = {};
      zoom.extent([[0, 0], [CW, CH]]).translateExtent([[0, Math.min(0, oy)], [CW, Math.max(CH, CH - oy)]]);
    }
    var orig = sizeCanvas;
    sizeCanvas = function () {
      try { fit(); } catch (e) { warn("Layout (Breite)", e); }
      var r = orig.apply(this, arguments);
      try { capH(); } catch (e) { warn("Layout (Höhe)", e); }
      return r;
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
    // does not move down; phones (26): directly above the map, so text and map fit into one screen;
    // otherwise it stays under the story chips
    var sb = document.getElementById("storybox"), sbHome = sb && sb.previousElementSibling, phoneMq = window.matchMedia("(max-width:700px)");
    function placeStory() {
      if (!sb || !sbHome) return;
      if (wide.matches) { if (sb.parentNode !== cols) cols.insertBefore(sb, cols.firstChild); }
      else if (phoneMq.matches) { if (sb.nextElementSibling !== mb) mb.parentNode.insertBefore(sb, mb); }
      else if (sb.previousElementSibling !== sbHome) sbHome.insertAdjacentElement("afterend", sb);
    }
    try { placeStory(); wide.addEventListener("change", placeStory); phoneMq.addEventListener("change", placeStory); } catch (e) { warn("Layout (Geschichte)", e); }
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
    b.setAttribute("aria-label", "Link kopieren: Adresse dieser Ansicht");
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
        // name of the active metric above the big value (after a metric switch the number alone does not say what it measures);
        // household values that exist only for a larger region say so here
        var big0 = el.querySelector(":scope > .big");
        if (big0) {
          var ml = document.createElement("span"); ml.className = "kind wx-mlab";
          ml.textContent = metric.label + (k === "hh_pc_ppp" && v != null && u.hh_note ? " · " + hhPhrase(u) : "");
          big0.insertBefore(ml, big0.firstChild);
        }
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
            : '<p class="hint">Keine Region auf einem anderen Kontinent liegt höchstens ' + f0(TWIN_TOL * 100) + ' % darüber oder darunter.</p>') +
            '<p class="hint" style="font-size:.78rem">Die Regionalwerte sind Hochrechnungen und können sich bei Revisionen um mehrere Prozent ändern. ' +
            'Gezeigt: je Kontinent die bevölkerungsreichste Einheit höchstens ' + f0(TWIN_TOL * 100) + ' % darüber oder darunter ' +
            '(gleiche Ebene, ab 100.000 Einwohnern, ohne Ausreißer).</p></div>');
        }
        var dqEl = el.querySelector(":scope > .dq");
        function addWarn(cls, text) {
          if (!dqEl || dqEl.querySelector("." + cls)) return;
          var w = document.createElement("span"); w.className = "warn " + cls; w.textContent = text;
          var src = [].find.call(dqEl.children, function (c) { return /^Verteilung innerhalb des Landes/.test(c.textContent); });
          if (src) src.insertAdjacentElement("afterend", w); else dqEl.appendChild(w);
        }
        // Ukraine: regional shares from 2021, spread onto the 2024 national value
        if (u.country === "UKR" && u.kind !== "Land/Gebiet") addWarn("wx-ukr", "Verteilung von 2021, vor dem Krieg; für die besetzten Gebiete nicht belastbar.");
        // 24 · regional distribution OLD_YEARS or more years older than the national value (only with readable years)
        if (u.kind !== "Land/Gebiet" && u.flag !== "missing") {
          var cu = byId.get(u.country), uy = String(u.year == null ? "" : u.year), cy = String(cu && cu.year != null ? cu.year : "");
          if (/^\d{4}$/.test(uy) && /^\d{4}$/.test(cy) && +cy - +uy >= OLD_YEARS) {
            addWarn("wx-old", "Verteilung von " + uy + ", also " + (+cy - +uy) + " Jahre älter als der Landeswert.");
          }
        }
        if (storyEligible(u)) {
          parts.push('<p class="wx-links"><a href="zwei-heimaten.html#vs=' + encodeURIComponent(u.id) + '">In der Story vergleichen →</a>' +
            '<span>Datenstory „Zwei Heimaten“: ' + esc(u.name) + ' neben einer zweiten Region</span></p>');
        }
        // the story link goes before the twins block (shorter, and the way out to the story)
        if (parts.length > 1 && /wx-links/.test(parts[parts.length - 1])) parts.splice(parts[0].indexOf("wx-rankhint") >= 0 ? 1 : 0, 0, parts.pop());
        var stats = el.querySelector(":scope > .stats"), bigEl = el.querySelector(":scope > .big");
        if (parts.length) {
          var box = document.createElement("div"); box.className = "wx-card";
          box.innerHTML = parts.join("");
          // right after the three key figures (inhabitants / share of world economy / share below),
          // i.e. before the time series and "Auf einer Stufe mit"; fall back to the end of the card
          if (stats) stats.insertAdjacentElement("afterend", box); else el.appendChild(box);
          box.querySelectorAll(".wx-twins button[data-id]").forEach(function (b) {
            b.addEventListener("click", function () { goTo(byId.get(b.getAttribute("data-id")), true); });
          });
        }
        // 23 · order by importance: warnings next to the value, sources and notes at the end, the table folded
        try { arrange(el, dqEl, bigEl); } catch (e) { warn("Profilkarte (Ordnung)", e); }
      } catch (e) { warn("Profilkarte (Render)", e); }
      return r;
    };
    var allOpen = false;   // "Alle Kennzahlen · ähnlichstes Land": closed by default, the state survives a new selection
    function arrange(el, dqEl, bigEl) {
      if (dqEl && bigEl) {
        // the page wraps each note in a <span>; a note is a warning when it is or holds a .warn
        var ws = [].slice.call(dqEl.children).filter(function (c) { return c.classList.contains("warn") || !!c.querySelector(".warn"); });
        if (ws.length) {
          var wb = document.createElement("div"); wb.className = "dq wx-warns";
          ws.forEach(function (w) { wb.appendChild(w); });
          bigEl.insertAdjacentElement("afterend", wb);
        }
        if (dqEl.children.length) el.appendChild(dqEl); else dqEl.remove();
      }
      var inner = el.querySelector(":scope > .inner2");
      if (!inner || inner.children.length !== 2) return;
      var col = inner.children[1], cmp = col.querySelector(".cmp"), h = col.querySelector("h3");
      if (!cmp || !h) return;
      var det = document.createElement("details"); det.className = "wx-all"; det.open = allOpen;
      var sm = document.createElement("summary"); sm.textContent = h.textContent; det.appendChild(sm); det.appendChild(cmp);
      det.addEventListener("toggle", function () { allOpen = det.open; });
      col.remove(); inner.classList.add("wx-one");
      inner.insertAdjacentElement("afterend", det);
      if (dqEl && dqEl.parentNode === el) el.appendChild(dqEl);
    }
  });

  // 5 · story "Zwei Heimaten"
  feature("Geschichte Zwei Heimaten", function () {
    return typeof STORIES !== "undefined" && Array.isArray(STORIES) && fn(storyBox) && fn(popShareBelow) && fn(setView) &&
      typeof d3 !== "undefined" && byId.has("DE40B") && byId.has("DEA23");
  }, function () {
    var OSL = "DE40B", KOE = "DEA23";
    var ZH = {t: "Zwei Heimaten", link: {href: "zwei-heimaten.html", text: "Die ganze Geschichte lesen →"},
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
          if (a && a.length && b && b.length) t += " Ähnlich hoch: " + named(a[0]) + " wie " + o.name + ", " + named(b[0]) + " wie " + k.name + ".";
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
        if (story && story.link) {
          var p = document.getElementById("storytext"), a = document.createElement("a");
          a.href = story.link.href; a.textContent = story.link.text;
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
        '<button type="button" class="wx-pk-go" aria-label="Details in der Profilkarte">Details <span aria-hidden="true">↓</span></button>';
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
      b.setAttribute("aria-label", open ? "weniger: Erklärung einklappen" : "mehr: ganze Erklärung zeigen");
      // nothing to open when the text fits into its lines anyway (one line, two on phones)
      ex.classList.remove("wx-fits");
      if (!open && ex.scrollHeight <= ex.clientHeight + 2) ex.classList.add("wx-fits");
    }
    var orig = update;
    update = function () {
      var r = orig.apply(this, arguments);
      try { addMore(); } catch (e) { warn("Erklärtext mobil (Render)", e); }
      return r;
    };
    try { phone.addEventListener("change", addMore); } catch (e) {}
    var rzT = 0; window.addEventListener("resize", function () { clearTimeout(rzT); rzT = setTimeout(function () { try { addMore(); } catch (e) {} }, 160); });
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

  // 20 · stories in steps: every story with a real sequence of findings gets two or three steps that switch the
  // view themselves (metric, level, view, selection, highlight, zoom). One line "← Zurück · Schritt n von m · Weiter →".
  // All numbers come from the data at run time, rounded like everywhere in the atlas. The texts do not read the current
  // state, so the box can reserve the height of its longest step and does not jump while stepping.
  feature("Geschichten in Schritten", function () {
    return typeof STORIES !== "undefined" && Array.isArray(STORIES) && fn(storyBox) && fn(findName) && fn(setView) && fn(zoomTo) &&
      fn(drawLevel) && fn(update) && fn(nearest) && fn(weightedQuantile) && fn(scaleOf) && typeof group !== "undefined" &&
      !!document.getElementById("storybox") && !!document.getElementById("storyclose") && !!document.getElementById("storytext");
  }, function () {
    var MG = M0 || METRICS[0], MH = mk("hh_pc_ppp"), MR = mk("gdp_pc_rp"), ME = mk("eu_index");
    var DE_BOX = [[5.5, 47.2], [15.5, 55.1]], EU_BOX = [[-11, 35], [33, 63]], CN_BOX = [[73, 18], [135, 54]], US_BOX = [[-125, 24], [-66, 50]];
    var BERLIN = byId.get("DE300"), DEU = byId.get("DEU");
    var g = function (id) { return byId.get(id); };
    // one call sets the whole state of a step (order matters: level before selection, view last but zoom)
    function set(o) {
      level = o.level; drawLevel();
      metric = o.m || MG;
      if (o.sel) selected = o.sel;
      hlMode = o.hl || "off";
      thr = o.thr != null ? o.thr : (selected[metric.k] != null ? selected[metric.k] : null);
      if (o.group) { group.clear(); o.group.forEach(function (id) { group.add(id); }); }
      if (o.sq) { sqGroup = o.sq[0]; sqColor = o.sq[1]; sqUnit = o.sq[2]; }
      setView(o.view || "map", true);
      if ((o.view || "map") === "map" && o.zoom !== undefined) zoomTo(o.zoom);
    }
    function deUnits(k) { return at(2).filter(function (x) { return x.country === "DEU" && x[k] != null; }); }
    function rankDE(u, k) { var l = deUnits(k).sort(function (a, b) { return b[k] - a[k]; }); return {r: l.indexOf(u) + 1, n: l.length}; }
    function sumPop(l) { return d3.sum(l, function (x) { return x.pop || 0; }); }
    // the larger region a German household value belongs to (hh_note "NUTS-2-Wert"): the whole Land when the Land has the
    // same value, otherwise the Regierungsbezirk (NUTS-2 in Germany). Only names, all values come from the data.
    var RB = {DE11: "Stuttgart", DE12: "Karlsruhe", DE13: "Freiburg", DE14: "Tübingen", DE21: "Oberbayern", DE22: "Niederbayern", DE23: "Oberpfalz",
      DE24: "Oberfranken", DE25: "Mittelfranken", DE26: "Unterfranken", DE27: "Schwaben", DE71: "Darmstadt", DE72: "Gießen", DE73: "Kassel",
      DEA1: "Düsseldorf", DEA2: "Köln", DEA3: "Münster", DEA4: "Detmold", DEA5: "Arnsberg"};
    function nuts2(u) {
      if (!u || u.country !== "DEU" || u.hh_pc_ppp == null) return null;
      var p = u.parent && byId.get(u.parent);
      if (p && p.hh_pc_ppp != null && Math.abs(p.hh_pc_ppp - u.hh_pc_ppp) < 0.5) return {acc: "das Land " + p.name, nom: "das Land " + p.name};
      var rb = RB[String(u.id).slice(0, 4)];
      return rb ? {acc: "den Regierungsbezirk " + rb, nom: "der Regierungsbezirk " + rb} : null;
    }

    var DEF = {};
    // ---- Die Welt in Menschen: people → continents → units instead of people
    DEF["Die Welt in Menschen"] = function (s) {
      var run0 = s.run, text0 = s.text;
      function lowShare(ct) {
        var sc = scaleOf("gdp_pc_ppp"), l = at(2).filter(function (u) { return u.ct === ct && u.gdp_pc_ppp != null && u.pop; });
        return sumPop(l.filter(function (u) { return sc.cls(u.gdp_pc_ppp) <= 1; })) / sumPop(l);
      }
      return [
        {run: function () { run0.call(s); }, text: function () { return text0.call(s); }},
        {run: function () { set({level: 2, view: "squares", sq: ["cont", "gdp_pc_ppp", "people"], sel: BERLIN}); },
         text: function () {
           return "Dieselben Menschen nach Kontinenten geordnet und nach BIP pro Kopf gefärbt: In Afrika leben " + pct(lowShare("Afrika")) +
             " in den beiden untersten Farbstufen, in Asien " + pct(lowShare("Asien")) + ", in Europa " + pct(lowShare("Europa")) + ".";
         }},
        {run: function () { set({level: 2, view: "squares", sq: ["gdp_pc_ppp", "cont", "region"], sel: BERLIN}); },
         text: function () {
           var l = at(2), w = function (u) { return u.ct === "Europa" || u.ct === "Nord- & Mittelamerika"; };
           var nU = l.filter(w).length / l.length, nP = sumPop(l.filter(w)) / WORLD.pop, us = l.filter(function (u) { return u.country === "USA"; }).length / l.length;
           return "Zählt man Regionen statt Menschen, kippt das Bild: " + pct(nU) + " der Einheiten auf dieser Ebene liegen in Europa sowie Nord- und Mittelamerika, " +
             "dort leben aber nur " + pct(nP) + " der Menschen. Allein die USA stellen " + pct(us) + " der Einheiten. Deshalb zählt der Atlas in Menschen.";
         }}
      ];
    };
    // ---- Wer ist reicher als Berlin?: the world → Germany
    DEF["Wer ist reicher als Berlin?"] = function () {
      if (!BERLIN || BERLIN.gdp_pc_ppp == null || !DEU) return [];
      var v = BERLIN.gdp_pc_ppp;
      return [
        {run: function () { set({level: 2, sel: BERLIN, hl: "above", thr: v, zoom: null}); },
         text: function () {
           var l = at(2).filter(function (x) { return x.gdp_pc_ppp != null && x.gdp_pc_ppp > v; });
           var by = d3.rollups(l, function (a) { return sumPop(a); }, function (x) { return x.ct; }).filter(function (c) { return c[0]; }).sort(function (a, b) { return b[1] - a[1]; });
           var t = "Nur " + pct(sumPop(l) / WORLD.pop) + " der Menschheit leben in Regionen mit höherem BIP pro Kopf als Berlin (" + MG.fmt(v) + "). Diese " + big(sumPop(l)) +
             " Menschen erwirtschaften " + pct(d3.sum(l, function (x) { return x.gdp_ppp || 0; }) / WORLD.ppp) + " der Weltwirtschaft.";
           var cn = function (c) { return c.replace(" & ", " und "); };
           if (by.length >= 2) t += " Die meisten leben in " + cn(by[0][0]) + " (" + big(by[0][1]) + ") und " + cn(by[1][0]) + " (" + big(by[1][1]) + ").";
           return t;
         }},
        {run: function () { set({level: 2, sel: BERLIN, hl: "above", thr: v, zoom: DE_BOX}); },
         text: function () {
           var all = deUnits("gdp_pc_ppp"), up = all.filter(function (x) { return x.gdp_pc_ppp > v; });
           return "Auch in Deutschland liegt Berlin nicht vorn: " + f0(up.length) + " der " + f0(all.length) + " Kreise haben ein höheres BIP pro Kopf, dort leben " +
             pct(sumPop(up) / sumPop(all)) + " der Menschen in Deutschland.";
         }}
      ];
    };
    // ---- China: Shanghai and Gansu → everything below the national value
    DEF["China: Küste gegen Inland"] = function (s) {
      var run0 = s.run, text0 = s.text, SH = g("CN310000"), CHN = g("CHN");
      if (!SH || !CHN || CHN.gdp_pc_ppp == null) return [];
      return [
        {run: function () { run0.call(s); }, text: function () { return text0.call(s); }},
        {run: function () { set({level: 2, sel: SH, hl: "below", thr: CHN.gdp_pc_ppp, zoom: CN_BOX}); },
         text: function () {
           var l = at(2).filter(function (x) { return x.country === "CHN" && x.gdp_pc_ppp != null; });
           var lo = l.filter(function (x) { return x.gdp_pc_ppp < CHN.gdp_pc_ppp; });
           return "Hervorgehoben sind alle Regionen unter dem chinesischen Landeswert von " + MG.fmt(CHN.gdp_pc_ppp) + ". In China sind das " + f0(lo.length) + " von " +
             f0(l.length) + " Präfekturen mit " + pct(sumPop(lo) / sumPop(l)) + " der Einwohner – über dem Landeswert liegt vor allem die Ostküste.";
         }}
      ];
    };
    // ---- EU: unter 75 %: districts → larger regions → Germany
    DEF["EU: unter 75 %"] = function () {
      if (!ME) return [];
      function share(lv, c) {
        var e = at(lv).filter(function (u) { return u.eu_index != null && (!c || u.country === c); });
        var lo = e.filter(function (u) { return u.eu_index < 75; });
        return {p: sumPop(lo) / sumPop(e), n: lo.length, t: e.length};
      }
      return [
        {run: function () { set({level: 2, m: ME, sel: BERLIN, hl: "below", thr: 75, zoom: EU_BOX}); },
         text: function () {
           return "Regionen unter 75 % des EU-Durchschnitts gelten als „weniger entwickelt“ und bekommen die höchste Förderung. Auf Kreisebene trifft das hier auf " +
             pct(share(2).p) + " der EU-Bevölkerung zu – vor allem im Osten und Süden.";
         }},
        {run: function () { set({level: 1, m: ME, sel: BERLIN, hl: "below", thr: 75, zoom: EU_BOX}); },
         text: function () {
           return "Auf der gröberen Bundesländer-Ebene sind es nur " + pct(share(1).p) + ": Große Regionen gleichen arme und reiche Kreise aus. " +
             "Wie viele Menschen als „weniger entwickelt“ gelten, hängt also auch an den Grenzen. Die offizielle Einstufung rechnet mit NUTS-2-Regionen und Dreijahresmitteln.";
         }},
        {run: function () { set({level: 2, m: ME, sel: BERLIN, hl: "below", thr: 75, zoom: DE_BOX}); },
         text: function () {
           var d = share(2, "DEU");
           return "In Deutschland liegen " + f0(d.n) + " der " + f0(d.t) + " Kreise unter 75 %, mit zusammen " + pct(d.p) + " der Einwohner.";
         }}
      ];
    };
    // ---- Kaufkraft vor Ort: national prices → regional prices → Germany
    DEF["Kaufkraft vor Ort"] = function () {
      var MS = g("USA-MS"), NY = g("USA-NY"), MUC = g("DE212");
      if (!MR || !MS || !NY || !MS.price_index || !NY.price_index || MS.gdp_pc_rp == null || NY.gdp_pc_rp == null) return [];
      var steps = [
        {run: function () { set({level: 1, sel: MS, zoom: US_BOX}); },
         text: function () {
           return "Zum Preisniveau der ganzen USA gerechnet kommt New York auf " + MG.fmt(NY.gdp_pc_ppp) + " BIP pro Kopf, Mississippi auf " + MG.fmt(MS.gdp_pc_ppp) +
             " – rund " + times(NY.gdp_pc_ppp, MS.gdp_pc_ppp) + "-mal so viel.";
         }},
        {run: function () { set({level: 1, m: MR, sel: MS, zoom: US_BOX}); },
         text: function () {
           return "In Mississippi liegt das Preisniveau bei " + f0(MS.price_index) + " % des US-Schnitts, in New York bei " + f0(NY.price_index) + " %. Zu regionalen Preisen schrumpft der Abstand: " +
             "Mississippi kommt auf " + MR.fmt(MS.gdp_pc_rp) + ", New York auf " + MR.fmt(NY.gdp_pc_rp) + " – nur noch rund " + times(NY.gdp_pc_rp, MS.gdp_pc_rp) + "-mal so viel.";
         }}
      ];
      var de = deUnits("price_index").filter(function (x) { return x.gdp_pc_rp != null; }).sort(function (a, b) { return b.price_index - a.price_index; });
      if (MUC && de.length > 2 && de[0] === MUC) {
        var lo = de[de.length - 1];
        steps.push({run: function () { set({level: 2, m: MR, sel: MUC, zoom: DE_BOX}); },
          text: function () {
            return "Regionale Preise gibt es hier auch für Deutschland: Am teuersten ist München (Preisniveau " + f0(MUC.price_index) + ", Deutschland = 100), am günstigsten " +
              lo.name + " (" + f0(lo.price_index) + "). Zu regionalen Preisen sinkt Münchens Wert von " + MG.fmt(MUC.gdp_pc_ppp) + " auf " + MR.fmt(MUC.gdp_pc_rp) + ".";
          }});
      }
      return steps;
    };
    // ---- Metropolen statt Kreise: districts around Munich → metro regions
    DEF["Metropolen statt Kreise"] = function () {
      var MM = units.find(function (u) { return u.lv.includes(3) && /München|Munich/.test(u.name) && u._members && u.gdp_pc_ppp != null; });
      var MUC = g("DE212");
      if (!MM || !MUC) return [];
      var mem = MM._members.map(g).filter(function (u) { return u && u.lv.includes(2) && u.gdp_pc_ppp != null; }).sort(function (a, b) { return b.gdp_pc_ppp - a.gdp_pc_ppp; });
      if (mem.length < 3) return [];
      var hi = mem[0], lo = mem[mem.length - 1], MUC_BOX = [[10.6, 47.7], [12.4, 48.7]];
      return [
        {run: function () { set({level: 2, sel: MUC, zoom: MUC_BOX}); },
         text: function () {
           return "Kreisgrenzen trennen Städte von ihrem Umland. Rund um München reicht das BIP pro Kopf von " + MG.fmt(lo.gdp_pc_ppp) + " (" + lo.name + ") bis " +
             MG.fmt(hi.gdp_pc_ppp) + " (" + hi.name + ") – je nachdem, wo die Firmen sitzen und wo die Beschäftigten wohnen.";
         }},
        {run: function () { set({level: 3, sel: MM, zoom: EU_BOX}); },
         text: function () {
           return "Die Ebene Metropolregionen fasst Stadt und Umland zusammen: Die Metropolregion München kommt auf " + MG.fmt(MM.gdp_pc_ppp) + " pro Kopf. " +
             "So werden Paris, München oder New York mit der Welt vergleichbar, ohne Pendler-Verzerrung.";
         }}
      ];
    };
    // ---- Zwei Heimaten: Germany → the world → where the households are
    DEF["Zwei Heimaten"] = function (s) {
      var o = g("DE40B"), k = g("DEA23");
      if (!o || !k || o.gdp_pc_ppp == null || k.gdp_pc_ppp == null) return [];
      var short = function (u) { return u.id === "DE40B" ? "OSL" : u.name; };
      return [
        {run: function () { set({level: 2, sel: o, group: [k.id], zoom: DE_BOX}); },
         text: function () {
           var ro = rankDE(o, "gdp_pc_ppp"), rk = rankDE(k, "gdp_pc_ppp");
           return o.name + " (OSL) kommt auf " + MG.fmt(o.gdp_pc_ppp) + " BIP pro Kopf, " + k.name + " auf " + MG.fmt(k.gdp_pc_ppp) + " – rund " + times(k.gdp_pc_ppp, o.gdp_pc_ppp) +
             "-mal so viel. In Deutschland steht OSL auf Rang " + f0(ro.r) + " von " + f0(ro.n) + " Kreisen, " + k.name + " auf Rang " + f0(rk.r) + ".";
         }},
        {run: function () { set({level: 2, sel: o, group: [k.id], hl: "above", thr: o.gdp_pc_ppp, zoom: null}); },
         text: function () {
           var t = "Weltweit liegen trotzdem beide weit vorn: rund " + pct(popBelow(o.gdp_pc_ppp, "gdp_pc_ppp", 2)) + " der Menschheit leben in Regionen mit niedrigerem BIP pro Kopf als OSL, gemessen an " +
             k.name + " sogar rund " + pct(popBelow(k.gdp_pc_ppp, "gdp_pc_ppp", 2)) + ". Hervorgehoben: alle Regionen über OSL.";
           try {
             var a = twins(o, MG), b = twins(k, MG);
             if (a && a.length && b && b.length) t += " Ähnlich hoch: " + named(a[0]) + " wie OSL, " + named(b[0]) + " wie " + k.name + ".";
           } catch (e) {}
           return t;
         }},
        {ok: function () { return MH && o.hh_pc_ppp != null && k.hh_pc_ppp != null; },
         run: function () { set({level: 2, m: MH, sel: o, group: [k.id], zoom: DE_BOX}); },
         // the atlas has household values only for the larger NUTS-2 regions; the data story uses the districts' own
         // incomes. Say whose value this is and point to the story, without copying any number from the story.
         link: o.hh_note && k.hh_note && /NUTS-2/.test(o.hh_note) && /NUTS-2/.test(k.hh_note) && nuts2(o) && nuts2(k)
           ? {href: "zwei-heimaten.html#akt-4", text: "Zur Datenstory, Akt 4 →"} : null,
         text: function () {
           var ro = nuts2(o), rk = nuts2(k), t;
           if (o.hh_note && k.hh_note && /NUTS-2/.test(o.hh_note) && /NUTS-2/.test(k.hh_note) && ro && rk) {
             t = "Für Haushalte kennt der Atlas nur " + rk.acc + " und " + ro.acc + ", nicht die beiden Kreise: Beim Konsum der Haushalte pro Kopf, gezählt am Wohnort, kommt " +
               rk.nom + " auf " + MH.fmt(k.hh_pc_ppp) + ", " + ro.nom + " auf " + MH.fmt(o.hh_pc_ppp) + " – nah beieinander. Weltweit liegen rund " +
               pct(popBelow(k.hh_pc_ppp, "hh_pc_ppp", 2)) + " und rund " + pct(popBelow(o.hh_pc_ppp, "hh_pc_ppp", 2)) + " der Menschheit darunter. " +
               "Die Datenstory rechnet mit den Werten der beiden Kreise selbst.";
             return t;
           }
           t = "Beim Konsum der Haushalte pro Kopf, gezählt am Wohnort, liegen beide nah beieinander: OSL kommt auf " + MH.fmt(o.hh_pc_ppp) + ", " + k.name + " auf " + MH.fmt(k.hh_pc_ppp);
           if (o.hh_note || k.hh_note) t += " (" + (o.hh_note && k.hh_note ? "Werte der größeren Regionen" : "teils Wert einer größeren Region") + ")";
           return t + ". Weltweit liegen damit rund " + pct(popBelow(o.hh_pc_ppp, "hh_pc_ppp", 2)) + " und rund " + pct(popBelow(k.hh_pc_ppp, "hh_pc_ppp", 2)) + " der Menschheit darunter – ähnlich weit oben.";
         }}
      ];
    };
    // ---- Wenn BIP täuscht: workplace → place of residence → metro region
    DEF["Wenn BIP täuscht"] = function () {
      var W = findName("Wolfsburg"), CHE = g("CHE");
      if (!W || !DEU || !CHE || W.gdp_pc_ppp == null) return [];
      var metro = units.find(function (x) { return x.lv.includes(3) && x._members && x._members.includes(W.id) && x.gdp_pc_ppp != null; });
      return [
        {run: function () { set({level: 2, sel: W, zoom: DE_BOX}); },
         text: function () {
           var r = rankDE(W, "gdp_pc_ppp");
           return "Wolfsburg erwirtschaftet " + MG.fmt(W.gdp_pc_ppp) + " BIP pro Kopf – " +
             (r.r === 1 ? "mehr als jeder andere der " + f0(r.n) + " Kreise in Deutschland" : "Rang " + f0(r.r) + " von " + f0(r.n) + " Kreisen in Deutschland") +
             " und mehr als die Schweiz (" + MG.fmt(CHE.gdp_pc_ppp) + "). Der Grund: VW. Das BIP zählt am Arbeitsort, viele Beschäftigte wohnen aber im Umland.";
         }},
        {ok: function () { return MH && W.hh_pc_ppp != null; },
         run: function () { set({level: 2, m: MH, sel: W, zoom: DE_BOX}); },
         text: function () {
           return "Gezählt am Wohnort sieht es anders aus: Beim Haushaltskonsum pro Kopf kommt Wolfsburg auf " + MH.fmt(W.hh_pc_ppp) +
             (DEU.hh_pc_ppp != null ? (W.hh_pc_ppp < DEU.hh_pc_ppp ? " – weniger als der deutsche Schnitt (" : " – etwa so viel wie der deutsche Schnitt (") + MH.fmt(DEU.hh_pc_ppp) + ")" : "") + "." +
             (W.hh_note ? " Der Wert gilt " + hhFor(W) + ", nicht für Wolfsburg allein." : "");
         }},
        {ok: function () { return !!metro; },
         run: function () { set({level: 3, sel: metro, zoom: DE_BOX}); },
         text: function () {
           return "Die Ebene Metropolregionen fasst Stadt und Umland zusammen. " + metro.name + " kommt auf " + MG.fmt(metro.gdp_pc_ppp) +
             " pro Kopf, rund " + pct(metro.gdp_pc_ppp / W.gdp_pc_ppp) + " des Wolfsburger Werts" +
             (metro.gdp_pc_ppp > DEU.gdp_pc_ppp ? " und noch über dem deutschen Schnitt (" + MG.fmt(DEU.gdp_pc_ppp) + ")." : ".") + " Der Ausreißer verschwindet.";
         }}
      ];
    };

    var i = 0, single = [];
    STORIES.forEach(function (s) {
      var b = DEF[s.t]; if (!b) { single.push(s.t); return; }
      var steps;
      try {
        steps = b(s).filter(function (st) { return !st.ok || st.ok(); });
        steps.forEach(function (st) { var t = st.text(); if (!t || /NaN|undefined|Infinity/.test(t)) throw new Error("Text unvollständig: " + s.t); });
      } catch (e) { warn("Geschichte in Schritten (" + s.t + ")", e); return; }
      if (steps.length < 2) { single.push(s.t); return; }
      s.steps = steps;
      // a step may carry its own link (instead of the story's link below the text)
      var link0 = s.link;
      s.linkFor = function (st) { return (st && st.link) || link0; };
      if (steps.some(function (st) { return st.link; })) {
        Object.defineProperty(s, "link", {configurable: true, enumerable: true, get: function () { return s.linkFor(steps[Math.min(i, steps.length - 1)]); }});
      }
      s.run = function () { i = 0; steps[0].run(); };
      s.text = function () { return steps[Math.min(i, steps.length - 1)].text(); };
    });

    var box = document.getElementById("storybox"), close = document.getElementById("storyclose"), p = document.getElementById("storytext");
    var nav = document.createElement("div"); nav.className = "wx-steps"; nav.hidden = true;
    nav.setAttribute("role", "group"); nav.setAttribute("aria-label", "Schritte der Geschichte");
    nav.innerHTML = '<button type="button" class="chip" data-d="-1" aria-label="Zurück zum vorigen Schritt"><span aria-hidden="true">←</span> Zurück</button>' +
      '<span class="wx-stepn" aria-live="polite"></span>' +
      '<button type="button" class="chip" data-d="1" aria-label="Weiter zum nächsten Schritt">Weiter <span aria-hidden="true">→</span></button>';
    // steps and "Geschichte schließen" share one line
    var foot = document.createElement("div"); foot.className = "wx-sfoot";
    box.insertBefore(foot, close); foot.appendChild(nav); foot.appendChild(close);
    var prev = nav.querySelector('[data-d="-1"]'), next = nav.querySelector('[data-d="1"]'), num = nav.querySelector(".wx-stepn");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // after a step: bring the map into view (phones: it lies below the box), the button keeps the focus and stays visible
    function bringMap(btn) {
      var mb = document.querySelector(".mapbox"); if (!mb) return;
      var r = mb.getBoundingClientRect(), vh = window.innerHeight;
      var seen = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top)) / Math.max(1, r.height);
      if (seen >= 0.9 || r.top < 0) return;
      var want = r.height > vh - 16 ? r.top - 8 : r.bottom - vh + 8;
      // never past the top of the story box: its text must stay readable
      want = Math.min(want, box.getBoundingClientRect().top - 8, btn.getBoundingClientRect().top - 8);
      if (want > 2) window.scrollBy({top: want, behavior: reduce.matches ? "auto" : "smooth"});
    }
    function go(d, btn) {
      var S = story; if (!S || !S.steps) return;
      var j = Math.max(0, Math.min(S.steps.length - 1, i + d)); if (j === i) return;
      i = j; S.steps[i].run(); update();
      try { bringMap(btn); } catch (e) {}
    }
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
      go(+b.getAttribute("data-d"), b);
      // keep the keyboard focus on a usable button
      if (b.disabled) (b === next ? prev : next).focus();
    });
    // fixed height: the box reserves the height of its longest step, so stepping does not move the map
    var measured = null;
    function measure() {
      p.style.minHeight = "";
      measured = null;
      if (!story || !story.steps || box.hidden || !p.clientWidth) return;
      var keep = [].slice.call(p.childNodes), h = 0;
      story.steps.forEach(function (st) {
        p.textContent = st.text();
        var lk = story.linkFor ? story.linkFor(st) : story.link;
        if (lk) { var a = document.createElement("a"); a.textContent = lk.text; a.href = lk.href; p.appendChild(document.createTextNode(" ")); p.appendChild(a); }
        h = Math.max(h, p.getBoundingClientRect().height);
      });
      p.textContent = ""; keep.forEach(function (n) { p.appendChild(n); });
      p.style.minHeight = Math.ceil(h) + "px";
      measured = {s: story, w: p.clientWidth};
    }
    var orig = storyBox;
    storyBox = function () {
      var r = orig.apply(this, arguments);
      try {
        var on = !!(story && story.steps);
        nav.hidden = !on;
        if (on) { num.innerHTML = '<span class="wx-sr wx-sw">Schritt </span>' + (i + 1) + " von " + story.steps.length; prev.disabled = i === 0; next.disabled = i === story.steps.length - 1; }
        if (!story) { p.style.minHeight = ""; measured = null; }
        else if (!measured || measured.s !== story || measured.w !== p.clientWidth) measure();
      } catch (e) { warn("Geschichte in Schritten (Render)", e); }
      return r;
    };
    var rz = 0;
    window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { try { if (story && story.steps) measure(); } catch (e) {} }, 180); });
    try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (story && story.steps) measure(); }); } catch (e) {}
    window.__wxSingleStories = single;
  });

  // 26 · closing a story brings back the state from before the first story that was opened (metric, level, view, colour
  // classes, highlight and threshold, group, selection, zoom; also after closing midway or after switching straight from
  // one story to another). Phones: opening a story moves story box and map into view together (the box stands directly
  // above the map there, see the layout), the focus goes to the box when the story chip leaves the screen.
  feature("Geschichte schließen", function () {
    return typeof STORIES !== "undefined" && fn(update) && fn(drawLevel) && fn(setView) && typeof zoom !== "undefined" && typeof cv !== "undefined" &&
      typeof group !== "undefined" && typeof SCALES !== "undefined" && typeof d3 !== "undefined" &&
      !!document.getElementById("stories") && !!document.getElementById("storyclose") && !!document.getElementById("storybox");
  }, function () {
    var chips = document.getElementById("stories"), close = document.getElementById("storyclose"), box = document.getElementById("storybox");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)"), phone = window.matchMedia("(max-width:700px)");
    var snap = null;
    function take() {
      var k = T.k;
      return {sel: selected, metric: metric, level: level, view: view, hl: hlMode, thr: thr, cm: classMode, grp: [].concat(Array.from(group)), gm: groupMode,
        sq: [sqGroup, sqColor, sqUnit], k: k, bx: ((CW / 2 - T.x) / k) / s0, by: ((CH / 2 - T.y) / k - oy) / s0, z: !!(zOn && zUnit === selected)};
    }
    function restore(s) {
      selected = s.sel; metric = s.metric; level = s.level; hlMode = s.hl; thr = s.thr; groupMode = s.gm;
      group.clear(); s.grp.forEach(function (id) { group.add(id); });
      sqGroup = s.sq[0]; sqColor = s.sq[1]; sqUnit = s.sq[2];
      if (classMode !== s.cm) { classMode = s.cm; for (var key in SCALES) delete SCALES[key]; }
      drawLevel();
      setView(s.view, true);
      // the visible part of the map as it was (same centre and zoom factor, also if the canvas size changed meanwhile)
      var t = s.k === 1 ? d3.zoomIdentity : d3.zoomIdentity.translate(CW / 2 - s.bx * s0 * s.k, CH / 2 - (s.by * s0 + oy) * s.k).scale(s.k);
      var c = d3.select(cv); c.interrupt();
      if (s.view === "map" && !reduce.matches) c.transition().duration(600).call(zoom.transform, t); else c.call(zoom.transform, t);
      zOn = s.z; zUnit = s.z ? selected : null;
    }
    // capture phase on the chip container: runs before the chip's own click handler, i.e. before the story changes anything
    chips.addEventListener("click", function (e) {
      if (story || !e.target.closest(".chip")) return;
      try { snap = take(); zOn = false; zUnit = null; } catch (x) { snap = null; warn("Geschichte schließen (Zustand merken)", x); }
    }, true);
    // bubble phase: after the story has run and rendered
    chips.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip"); if (!chip || !story) return;
      try { showOpen(chip); } catch (x) { warn("Geschichte schließen (Blick)", x); }
    });
    function showOpen(chip) {
      if (!phone.matches || box.hidden) return;
      var mb = document.querySelector(".mapbox"); if (!mb) return;
      var b = box.getBoundingClientRect(), m = mb.getBoundingClientRect(), cr = chip.getBoundingClientRect(), vh = window.innerHeight;
      var by = 0;
      // already fine when the whole box and the upper half of the map are on screen; otherwise the box top goes just under
      // the screen edge (never further: the box must stay in view)
      if (!(b.top >= 0 && b.bottom <= vh && m.top + m.height / 2 <= vh)) {
        by = b.top - 8;
        if (Math.abs(by) > 2) window.scrollBy({top: by, behavior: reduce.matches ? "auto" : "smooth"}); else by = 0;
      }
      // keep the keyboard focus where the user can see it: the story box, when the chip leaves the screen
      var ct = cr.top - by;
      if (ct < 0 || ct + cr.height > vh) {
        if (!box.hasAttribute("tabindex")) box.setAttribute("tabindex", "-1");
        box.setAttribute("role", "region"); box.setAttribute("aria-labelledby", "storytitle");
        try { box.focus({preventScroll: true}); } catch (x) {}
      }
    }
    close.onclick = function () {
      var was = story, hadFocus = document.activeElement === close;
      story = null;
      if (snap) { try { restore(snap); } catch (x) { warn("Geschichte schließen (Zustand)", x); } }
      snap = null;
      update();
      // the close button disappears with the box: the focus goes back to the chip of the story
      if (hadFocus && was) {
        var c = [].find.call(chips.querySelectorAll(".chip"), function (x) { return x.__data__ === was; });
        if (c) { try { c.focus({preventScroll: true}); } catch (x) {} }
      }
    };
  });

  // 22 · headline: while a story is open only the fixed sentence with the median (BIP/Kopf, finest level), so the
  // headline neither jumps between steps nor contradicts the story box. Otherwise the page's own headline; a household
  // value that exists only for a larger region says so.
  feature("Überschrift", function () { return fn(lead) && fn(weightedQuantile) && !!document.getElementById("lead"); }, function () {
    var orig = lead, MGm = M0 || METRICS[0], MH = mk("hh_pc_ppp"), med2 = null;
    lead = function () {
      var r = orig.apply(this, arguments);
      try {
        var el = document.getElementById("lead");
        if (story) {
          if (med2 == null) med2 = weightedQuantile(at(2), "gdp_pc_ppp", .5);
          el.innerHTML = "Die Hälfte der Menschheit lebt in Gebieten mit weniger als <b>" + esc(MGm.fmt(med2)) + "</b> " + esc(MGm.noun) + ".";
          return r;
        }
        var k = (metric.total || metric.k === "density" || metric.scope) ? "gdp_pc_ppp" : metric.k, u = selected;
        if (k === "hh_pc_ppp" && MH && u && u.hh_note && u.hh_pc_ppp != null) {
          var a = " liegt mit " + MH.fmt(u.hh_pc_ppp) + " über", b = " liegt mit " + MH.fmt(u.hh_pc_ppp) + " (" + hhPhrase(u) + ") über";
          if (el.innerHTML.indexOf(a) >= 0) el.innerHTML = el.innerHTML.split(a).join(b);
        }
      } catch (e) { warn("Überschrift (Render)", e); }
      return r;
    };
  });

  // 25 · prefers-reduced-motion: zoom transitions jump to their end (the page's zoomTo animates 600–700 ms)
  feature("Bewegung reduzieren", function () { return fn(zoomTo) && typeof cv !== "undefined"; }, function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)"), orig = zoomTo;
    zoomTo = function () {
      var r = orig.apply(this, arguments);
      try { if (reduce.matches && cv.__transition) for (var id in cv.__transition) cv.__transition[id].duration = 0; } catch (e) {}
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
