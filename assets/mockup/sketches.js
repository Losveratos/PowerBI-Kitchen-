/* ==========================================================================
   MockupKitchen · Mini-Chart-Skizzen im Look von ChartKitchen und Power BI
   --------------------------------------------------------------------------
   Eigenständig: kein Modulsystem, keine Abhängigkeiten, reines Browser-JS.

     window.MK_SKETCHES[kind](w, h, o)     ->  SVG-String
     window.MK_SKETCH(kind, w, h, o)       ->  Dispatcher, Fallback 'generic'
     window.MK_SKETCH.small(kind, w, h, o) ->  Small-Multiples-Raster
     window.MK_SKETCH_KEYS                 ->  Liste aller Schlüssel

   o = { scenario:'AC/PY'|'AC/PL'|'AC/PL/FC'|'AC',   // Kurzform, abwärtskompatibel
         scenarios:['AC','PL','PY'],                // Langform, hat Vorrang
         deltaBasis:'PL'|'PY'|'BU',                 // Bezug der Δ-Ebenen
         polarity:'higher'|'lower',                 // 'lower' = kleiner ist besser
         palette:'teal'|'ibcs',                     // Abweichungsfarben
         ink:'#404040', dark:Boolean, paper:'#FFFFFF',
         lang:'de'|'en',                            // Sprache der Beschriftungen
         unit:String,                               // nur kpi/card, hinter der Zahl
         antiPattern:Boolean,                       // Warnüberzug (Kreis, Tacho)
         variance:{abs:Boolean, rel:Boolean},
         seed:Number, dense:Boolean, scale:Number,
         label:String (nur kpi/card: '' = keine Beschriftung),
         // Typografie
         fontScale:Number,                          // Default 1, multipliziert jede Schrift
         fonts:{ label, value, axis, title },       // px bei scale 1, ersetzt den Grundgrad
         // nur pnl (Spalten-Presets des Visuals pnlByDatenWG)
         mode:'full'|'acref'|'dall'|'acpydpy'|'acpldpl'|'dpct',
         treeCard:'months'|'delta'|'bridge',        // Mini-Grafik je Zeile
         density:'normal'|'compact',
         // columns/bars/line/donut: look:'native' zeichnet den Power-BI-Klassiker
         look:'ibcs'|'native',
         // Eigene Daten (alle optional; ohne sie ist jede Skizze byte-identisch)
         cats:['Nord','Süd',…],                     // Kategorienamen statt c.t.cat
         values:[Number,…],                         // Hauptszenario (AC), values[i] ↔ cats[i]
         refValues:[Number,…],                      // Bezug (PY/PL nach deltaBasis), nur mit values
         nativePalette:'pbi'|'neutral'|'kitchen' }  // Datenfarben nativ, Default 'pbi'

   Eigene Daten:
   - Anzahl Kategorien = Länge von o.cats (ohne cats: Länge von o.values),
     mindestens 1, gekappt auf das, was die Skizze fasst (klein fest, sonst
     nach Breite bzw. Höhe). values kürzer: Rest synthetisch in der Größen-
     ordnung der eingegebenen Werte; länger: abgeschnitten. refValues fehlt:
     Referenz wie bisher aus dem Hauptwert abgeleitet, AC bleibt exakt.
   - Zeitachsen bleiben Monate, wenn die Skizze daneben eine Kategorie-
     dimension hat (heatmap, matrix, stackcol, sparktable) oder zeitlich ist
     (fan, zchart: values = Monatsreihe). Hat sie nur eine Achse (columns,
     line, varint, ncolumn, nline …), ersetzen die cats die Monate.
   - Beschriftungen mit values laufen über fmt(): ≥ 1e9 Mrd./B, ≥ 1e6 Mio./M,
     ≥ 1e3 Tsd./K (eine Dezimalstelle unter 100, „,0" entfällt), darunter mit
     den Dezimalstellen der Eingabe (≤ 2); Trenner nach o.lang, Δ mit
     Vorzeichen, Δ% wie bisher. o.unit hängt an kpi/card/multirow.
   - Negative Werte: eigene Nulllinie (Säulen, Balken, Linien, Tabelle,
     Brücken, native Achsen); gestapelte Formen und Anteile (stackcol,
     stackbar, pareto, marimekko, treemap, donut, gauge) nehmen Beträge
     bzw. 0.
   - Bewusst ohne cats/values: pnl (festes GuV-Gerüst), scatter, map, text,
     image, button, deneb, generic; tornado hat keine Kategoriebeschriftung
     (nutzt nur values/refValues), heatmap und gantt nur cats.

   Typografie:
     label = Wert- und Δ-Beschriftungen, axis = Kategorien/Monate,
     title = Ebenen- und Spaltenköpfe, value = die große Zahl (kpi, card,
     multirow; ersetzt dort die automatische Obergrenze). Ohne o.fonts gilt
     8 px (unter 240 px Entwurfsbreite) bzw. 9 px. o.fontScale multipliziert
     danach alles, auch die Werte aus o.fonts. Die Sichtbarkeitsschwellen
     (Beschriftung ja/nein, Mindestabstände) rechnen mit diesen Graden:
     größere Schrift blendet eher Beschriftungen aus, statt zu überlappen.

   Grundsätze:
   - Dummy-Daten stammen aus einem Seed-PRNG (mulberry32), damit dieselbe
     Kachel bei jedem Re-Render identisch aussieht.
   - Alle Zahlen laufen durch n(): niemals NaN/Infinity im Output.
   - Unter 120 px Breite oder 50 px Höhe wird eine reduzierte Variante
     gezeichnet (weniger Kategorien, keine Beschriftung).
   - IBCS-Typen: Graustufen plus die beiden Abweichungsfarben.
     Native Typen: Power-BI-Standardpalette (#118DFF …), graue Gitterlinien.

   Skalierung (o.scale, Default 1):
   - Das Tool übergibt canvas.width/1280 — also 1 bei HD, 1,5 bei Full HD,
     3 bei Ultra HD.
   - Gezeichnet wird immer im Entwurfsraum w/scale × h/scale; wrap() legt ein
     <g transform="scale(s)"> um das Ergebnis. Schrift, Striche, Marker und
     Mindestabstände wachsen so zentral mit. Der viewBox bleibt "0 0 w h".

   Szenario-Notation (wie im ChartKitchen-Visual):
     AC dunkel gefüllt · PY grau gefüllt · PL und BU weiß mit dunkler Kontur,
     versetzt hinter AC · FC schraffiert mit Kontur. Ein drittes Szenario
     erscheint als Dreieck-Marke (▶ links an der Säule, ▼ über dem Balken).
     Nulllinien der Δ-Ebenen tragen die Notation des Bezugs: PY breite graue
     Linie, PL doppelte dünne Linie, FC gestrichelt. Der Forecast-Teil einer
     Ebene steht rechts einer gepunkteten Trennlinie, Δ-Balken sind dort
     farbig schraffiert, Pin-Köpfe offen.

   Polarität (o.polarity): sämtliche Δ-Färbungen laufen über dcol().

   Prüfung: Node-Matrix (alle Typen × 3 Größen × Palette × hell/dunkel ×
   fontScale 0,8/1/1,3): <svg-Anfang, kein NaN/undefined/Infinity, kein Text
   und keine Geometrie außerhalb des viewBox. Eigene Daten zusätzlich: ohne
   die neuen Optionen byte-identisch zur Vorfassung; alle Typen × cats (1/3/
   7/12, lange Namen) × values (positiv, gemischt, 1e6/1e9, Dezimal, leer) ×
   nativePalette × hell/dunkel. Sichtprüfung: sketches-test.html.
   ========================================================================== */
(function (root) {
  'use strict';

  var FONT = 'Geist, system-ui, sans-serif';
  var CW = 0.6;          // mittlere Zeichenbreite in em (Schätzwert fürs Einpassen)

  /* ---------------------------------------------------------------- Farben */
  var PAL = {
    teal: { good: '#1E8F9E', bad: '#D64541', goodD: '#3FB3C2', badD: '#E4635F' },
    ibcs: { good: '#3A9A5B', bad: '#C8412F', goodD: '#5DBB7B', badD: '#E0604F' }
  };
  // Power-BI-Standarddesign: die ersten acht Datenfarben
  var PBI = ['#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7', '#744EC2', '#D9B300', '#D64550'];
  /* o.nativePalette: Datenfarben der nativen Skizzen (alles, was C.pbi nutzt).
     'pbi' (Default) = Standarddesign oben, unverändert.
     'neutral' = Grautöne mit einem Petrol-Akzent an erster Stelle; hell: die
       ersten vier Farben ≥ 3:1 auf Weiß, dunkel: aufgehellte Variante, die
       ersten vier ≥ 3,5:1 auf #1E1E1E.
     'kitchen' = Teal der ChartKitchen-Palette (PAL.teal.good), dunkles Teal,
       Sand, Graublau, Terrakotta (Akzent der Seite) … ; dunkel aufgehellt.   */
  var NPAL = {
    neutral: {
      light: ['#2F6F85', '#8C8C8C', '#3D3D3D', '#6B6B6B', '#7FA3B3', '#A6A6A6', '#262626', '#595959'],
      dark:  ['#7FB2C4', '#9E9E9E', '#D9D9D9', '#737373', '#A9C7D2', '#BDBDBD', '#858585', '#EDEDED']
    },
    kitchen: {
      light: ['#1E8F9E', '#0F5560', '#A8834A', '#5E7A8A', '#C25A2D', '#3E9C8F', '#7A6446', '#6F8793'],
      dark:  ['#3FB3C2', '#7FD0D8', '#D4B07A', '#9DB4C2', '#E08A5F', '#5FC0B0', '#C49A6C', '#C9D3D9']
    }
  };

  function hex2rgb(h) {
    h = String(h).replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgb2hex(a) {
    var i, s = '#';
    for (i = 0; i < 3; i++) s += ('0' + clamp(Math.round(a[i]), 0, 255).toString(16)).slice(-2);
    return s.toUpperCase();
  }
  function mix(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b), i, o = [];
    for (i = 0; i < 3; i++) o.push(x[i] + (y[i] - x[i]) * t);
    return rgb2hex(o);
  }
  function lum(h) {
    var c3 = hex2rgb(h);
    return (0.299 * c3[0] + 0.587 * c3[1] + 0.114 * c3[2]) / 255;
  }

  /* Farbset je Aufruf.
       ac/py/plf/pls/fcc  Szenariofarben        ink   Wertbeschriftung, Achsen
       txt  Kategorien     sub  Köpfe, Legenden   grid  Hilfslinien
       hair Verbinder      g2/g3 Stapelgrau       paper Kachelgrund (Halo)
       wash/pane/edge  Flächen, Kopfzeilen, Kartenrand
       nTxt/nTitle/nGrid  Power-BI-Nativlook      pbi   Datenfarben nativ   */
  function theme(o) {
    var pal = PAL[o.palette === 'ibcs' ? 'ibcs' : 'teal'];
    var ink = /^#[0-9a-fA-F]{6}$/.test(String(o.ink || '')) ? String(o.ink).toUpperCase() : null;
    var dark = (o.dark == null) ? (!!ink && lum(ink) > 0.55) : !!o.dark;
    var C;
    if (!dark) {
      C = {
        ac: '#404040', py: '#B3B3B3', plf: '#FFFFFF', pls: '#404040', fcc: '#BDBDBD',
        ink: '#404040', txt: '#4D4D4D', sub: '#8A8A8A', grid: '#E6E6E6', hair: '#A6A6A6',
        axis: '#404040', g2: '#737373', g3: '#C9C9C9', paper: '#FFFFFF', wash: '#F4F4F0',
        pane: '#F3F3F1', edge: '#DDDDD8', ghost: '#D9D9D9', ghost2: '#8A8A8A',
        nTxt: '#605E5C', nTitle: '#252423', nGrid: '#E9E9E9'
      };
      if (ink) {
        C.axis = ink; C.pls = ink; C.ink = ink;
        C.txt  = mix(ink, '#FFFFFF', 0.1);
        C.sub  = mix(ink, '#FFFFFF', 0.45);
        C.grid = mix(ink, '#FFFFFF', 0.88);
        C.hair = mix(ink, '#FFFFFF', 0.6);
      }
    } else {
      var base = ink || '#E0E0E0';
      C = {
        ac: '#D9D9D9', py: '#8A8A8A', plf: '#1E1E1E', pls: '#D9D9D9', fcc: '#5A5A5A',
        ink: base, txt: mix(base, '#1E1E1E', 0.12), sub: mix(base, '#1E1E1E', 0.42),
        grid: '#3C3C3C', hair: '#6A6A6A', axis: base,
        g2: '#A6A6A6', g3: '#5E5E5E', paper: '#1E1E1E', wash: '#2B2B2B', pane: '#2E2E2E',
        edge: '#3F3F3F', ghost: '#4A4A4A', ghost2: '#6E6E6E',
        nTxt: '#B3B0AD', nTitle: '#F3F2F1', nGrid: '#3B3A39'
      };
    }
    if (/^#[0-9a-fA-F]{6}$/.test(String(o.paper || ''))) {
      C.paper = String(o.paper).toUpperCase(); C.plf = C.paper;
      if (dark) {
        C.wash = mix(C.paper, '#FFFFFF', 0.08); C.pane = mix(C.paper, '#FFFFFF', 0.1);
        C.edge = mix(C.paper, '#FFFFFF', 0.16);
      }
    }
    C.good = dark ? pal.goodD : pal.good;
    C.bad  = dark ? pal.badD : pal.bad;
    C.pbi = NPAL.hasOwnProperty(o.nativePalette) ? NPAL[o.nativePalette][dark ? 'dark' : 'light'] : PBI;
    C.npal = C.pbi !== PBI;              // eigene Nativpalette aktiv
    C.dark = dark;
    return C;
  }

  /* ------------------------------------------------------------- Sprachen */
  var L10N = {
    de: {
      mon: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      cat: ['Nord', 'Süd', 'Ost', 'West', 'Mitte', 'Export', 'Online', 'Handel', 'Service'],
      rows: ['Umsatz', 'Marge', 'Menge', 'Kunden', 'Aufträge'],
      pnl: ['Umsatzerlöse', 'Materialaufwand', 'Rohertrag', 'Personalaufwand',
            'Sonstige Aufwendungen', 'EBITDA', 'Abschreibungen', 'EBIT',
            'Finanzergebnis', 'Steuern', 'Jahresüberschuss', 'Rohertragsmarge %', 'EBIT-Marge %'],
      dec: ',', grp: '.',
      vs: 'vs', total: 'gesamt', sum: 'Summe', target: 'Ziel', trend: 'Verlauf',
      cumul: 'kumuliert', margin: 'Marge %', revenue: 'Umsatz', apply: 'Anwenden',
      spec: 'Vega-Spec', prior: 'Vorjahr', region: 'Region', all: 'Alle', grand: 'Gesamt',
      ytd: 'YTD Jan–Jun', mat: 'MAT', month: 'Monat', product: 'Produkt'
    },
    en: {
      mon: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      cat: ['North', 'South', 'East', 'West', 'Central', 'Export', 'Online', 'Retail', 'Service'],
      rows: ['Revenue', 'Margin', 'Volume', 'Customers', 'Orders'],
      pnl: ['Revenue', 'Cost of materials', 'Gross profit', 'Personnel expenses',
            'Other expenses', 'EBITDA', 'Depreciation', 'EBIT',
            'Financial result', 'Taxes', 'Net income', 'Gross margin %', 'EBIT margin %'],
      dec: '.', grp: ',',
      vs: 'vs', total: 'total', sum: 'Total', target: 'Target', trend: 'Trend',
      cumul: 'cumulative', margin: 'Margin %', revenue: 'Revenue', apply: 'Apply',
      spec: 'Vega spec', prior: 'Prior year', region: 'Region', all: 'All', grand: 'Total',
      ytd: 'YTD Jan–Jun', mat: 'MAT', month: 'Month', product: 'Product'
    }
  };

  var uid = 0;   // laufende Nummer für eindeutige Pattern-IDs

  /* ----------------------------------------------------------- Zahlenhilfen */
  function n(v) {
    v = +v;
    if (!isFinite(v)) v = 0;
    return Math.round(v * 100) / 100;
  }
  function clamp(v, lo, hi) { v = n(v); return v < lo ? lo : (v > hi ? hi : v); }
  function maxOf(a) {
    var m = 0, i, v;
    for (i = 0; i < a.length; i++) { v = Math.abs(+a[i]); if (isFinite(v) && v > m) m = v; }
    return m || 1;
  }
  function sum(a) { var s = 0, i; for (i = 0; i < a.length; i++) s += +a[i] || 0; return n(s); }
  function lbl(c, v, d) {
    var t = (c && c.t) || L10N.de;
    var s = Math.abs(n(v)).toFixed(d == null ? 1 : d);
    var neg = n(v) < 0 && +s !== 0;          // kein „-0"
    s = s.split('.');
    var ip = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, t.grp);
    return (neg ? '-' : '') + ip + (s[1] ? t.dec + s[1] : '');
  }
  // Vorzeichen immer sichtbar; was auf 0 rundet, bekommt „+"
  function sgn(s) { return s.charAt(0) === '-' ? s : '+' + s; }
  function plbl(c, v) { return sgn(lbl(c, v, 0)) + '%'; }
  function dlbl(c, v) { return sgn(lbl(c, v, 0)); }
  function pplbl(c, v) { return sgn(lbl(c, v, 1)) + 'pp'; }

  /* ------------------------------------------ Eigene Daten und Zahlformat
     o.cats       Kategorienamen, ersetzen c.t.cat (Anzahl = Länge, gekappt)
     o.values     Werte der Hauptreihe (AC); values[i] gehört zu cats[i]
     o.refValues  Werte der Referenz (PY/PL je nach Bezug), nur mit o.values
     Ohne o.values bleibt c.real = false: Beschriftungen laufen wie bisher
     über lbl(), die Skizzen sind byte-identisch zur Fassung ohne Optionen.
     Mit o.values formatiert fmt() alle Wert- und Δ-Beschriftungen:
       ≥ 1e9 Mrd./B · ≥ 1e6 Mio./M · ≥ 1e3 Tsd./K (eine Dezimalstelle unter
       100, sonst keine), darunter mit den Dezimalstellen der Eingabe (≤ 2).
       Tausender- und Dezimaltrenner nach o.lang, Δ% wie bisher (plbl).    */
  var UNITS = {
    de: [[1e9, ' Mrd.'], [1e6, ' Mio.'], [1e3, ' Tsd.']],
    en: [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]
  };
  function strList(a) {
    if (!a || typeof a === 'string' || !(a.length > 0)) return null;
    var out = [], i;
    for (i = 0; i < a.length; i++) out.push(a[i] == null ? '' : String(a[i]).replace(/\s+/g, ' ').trim());
    return out;
  }
  function numList(a) {
    if (!a || typeof a === 'string' || !(a.length > 0)) return null;
    var out = [], ok = 0, i, v;
    for (i = 0; i < a.length; i++) {
      v = (a[i] === null || a[i] === '' || typeof a[i] === 'boolean') ? NaN : +a[i];
      if (isFinite(v)) { out.push(v); ok++; } else out.push(null);
    }
    return ok ? out : null;
  }
  // Dezimalstellen der Eingabe, höchstens 2
  function decOf(a) {
    var d = 0, i, k, v;
    for (i = 0; i < a.length; i++) {
      v = a[i]; if (v == null) continue;
      for (k = d; k < 2; k++) {
        var p = Math.pow(10, k);
        if (Math.abs(Math.round(v * p) - v * p) < 1e-6 * Math.max(1, Math.abs(v * p))) break;
        d = k + 1;
      }
    }
    return d;
  }
  function fmtParts(c, v) {
    v = +v; if (!isFinite(v)) v = 0;
    var a = Math.abs(v), u = UNITS[c.lang] || UNITS.de, i, x, d;
    for (i = 0; i < u.length; i++) {
      if (a < u[i][0]) continue;
      x = a / u[i][0]; d = x < 100 ? 1 : 0;
      if (i > 0 && +x.toFixed(d) >= 1000) { i--; x = a / u[i][0]; d = 1; }
      // „20,0 Tsd." → „20 Tsd." (wie kompakte Zahlformate)
      return { num: lbl(c, v < 0 ? -x : x, d).replace(/[.,]0$/, ''), suf: u[i][1] };
    }
    return { num: lbl(c, v, c.vdec || 0), suf: '' };
  }
  function fmt(c, v) { var p = fmtParts(c, v); return p.num + p.suf; }
  // Wertbeschriftung: echte Werte formatiert, sonst wie bisher
  function vlbl(c, v, d) { return c.real ? fmt(c, v) : lbl(c, v, d == null ? 0 : d); }
  function dvlbl(c, v) { return c.real ? sgn(fmt(c, v)) : dlbl(c, v); }
  // größte Beschriftungsbreite einer Reihe
  function vmaxW(c, a, size, f) {
    var m = 0, i;
    for (i = 0; i < a.length; i++) m = Math.max(m, tw((f || vlbl)(c, a[i]), size || c.fs));
    return m;
  }

  /* Einzige Stelle, an der ein Δ-Vorzeichen zu einer Farbe wird. */
  function dcol(c, d) { return n(d) * ((c && c.pol) || 1) >= 0 ? c.C.good : c.C.bad; }

  function mulberry32(a) {
    a = (a | 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------- Primitive */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function rect(x, y, w, h, fill, stroke, sw, extra) {
    w = n(w); h = n(h);
    if (w <= 0 || h <= 0) return '';
    var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h +
            '" fill="' + (fill || 'none') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + (extra || '') + '/>';
  }
  function rrect(x, y, w, h, r, fill, stroke, sw, extra) {
    w = n(w); h = n(h);
    if (w <= 0 || h <= 0) return '';
    var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h +
            '" rx="' + n(Math.max(0, Math.min(r, w / 2, h / 2))) + '" fill="' + (fill || 'none') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + (extra || '') + '/>';
  }
  function ln(x1, y1, x2, y2, stroke, sw, dash) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) +
           '" stroke="' + (stroke || '#404040') + '" stroke-width="' + n(sw || 1) + '"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function circ(cx, cy, r, fill, stroke, sw) {
    var s = '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(Math.max(0.4, r)) +
            '" fill="' + (fill || '#404040') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function pathEl(d, fill, stroke, sw, dash, extra) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') +
           '" stroke-width="' + n(sw || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
           ' stroke-linejoin="round" stroke-linecap="round"' + (extra || '') + '/>';
  }
  function pts2str(pts) {
    var out = [], i;
    for (i = 0; i < pts.length; i++) out.push(n(pts[i][0]) + ',' + n(pts[i][1]));
    return out.join(' ');
  }
  function polyline(pts, stroke, sw, dash) {
    if (!pts || !pts.length) return '';
    return '<polyline points="' + pts2str(pts) + '" fill="none" stroke="' + (stroke || '#404040') +
           '" stroke-width="' + n(sw || 1.4) + '" stroke-linejoin="round" stroke-linecap="round"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function polygonEl(pts, fill, stroke, sw, extra) {
    if (!pts || !pts.length) return '';
    return '<polygon points="' + pts2str(pts) + '" fill="' + (fill || '#E6E6E6') +
           '" stroke="' + (stroke || 'none') + '" stroke-width="' + n(sw || 1) + '"' +
           ' stroke-linejoin="round"' + (extra || '') + '/>';
  }
  /* Text. halo = Farbe der Kontur hinter der Schrift (c.C.paper), damit Werte
     über Konturen und Schraffuren lesbar bleiben — wie im ChartKitchen-Visual.
     style 'i' = kursiv.                                                     */
  function txt(x, y, s, size, fill, anchor, weight, halo, style) {
    var fz = n(size || 8);
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + fz +
           '" fill="' + (fill || '#4D4D4D') + '"' +
           (anchor ? ' text-anchor="' + anchor + '"' : '') +
           (weight ? ' font-weight="' + weight + '"' : '') +
           (style === 'i' ? ' font-style="italic"' : '') +
           (halo ? ' stroke="' + halo + '" stroke-width="' + n(Math.max(1.6, fz * 0.32)) +
                   '" stroke-linejoin="round" paint-order="stroke"' : '') +
           '>' + esc(s) + '</text>';
  }
  /* Mehrfarbiger Text: parts = [[text, fill, weight], …] in einer Zeile. */
  function rich(x, y, parts, size, anchor) {
    var s = '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + n(size) + '"' +
            (anchor ? ' text-anchor="' + anchor + '"' : '') + '>', i;
    for (i = 0; i < parts.length; i++) {
      s += '<tspan fill="' + parts[i][1] + '"' + (parts[i][2] ? ' font-weight="' + parts[i][2] + '"' : '') +
           '>' + esc(parts[i][0]) + '</tspan>';
    }
    return s + '</text>';
  }
  function richLen(parts) { var l = 0, i; for (i = 0; i < parts.length; i++) l += String(parts[i][0]).length; return l; }
  function tw(s, size) { return String(s == null ? '' : s).length * size * CW; }
  function ghost(c, x, y, w, h, fill) { return rect(x, y, w, h || 2, fill || c.C.ghost); }

  /* Kürzt eine Beschriftung auf die verfügbare Breite. */
  function fit(c, s, w, size) {
    s = String(s == null ? '' : s);
    var cw = (size || c.fs) * CW;
    if (!(w > 0) || !(cw > 0)) return '';
    var max = Math.floor(w / cw);
    if (max >= s.length) return s;
    if (max < 2) return '';
    return s.slice(0, max - 1) + '…';
  }
  /* x eines Wertlabels neben einem Balken-/Pin-Ende, gehalten in [lo, hi]. */
  function edgeX(v, x, gap, s, size, lo, hi) {
    var w = tw(s, size);
    return n(v) >= 0 ? Math.min(x + gap, hi - w) : Math.max(x - gap, lo + w);
  }

  /* --------------------------------------------------------- Szenario-Satz */
  var SCEN_OK = { AC: 1, PY: 1, PL: 1, BU: 1, FC: 1 };

  function scenSet(o) {
    var list = [], seen = {}, i, parts, str;
    function add(x) {
      x = String(x == null ? '' : x).toUpperCase().replace(/[^A-Z]/g, '');
      if (SCEN_OK[x] && !seen[x]) { seen[x] = 1; list.push(x); }
    }
    if (o.scenarios && typeof o.scenarios !== 'string' && o.scenarios.length) {
      for (i = 0; i < o.scenarios.length; i++) add(o.scenarios[i]);
    } else {
      str = (typeof o.scenarios === 'string' && o.scenarios) || o.scenario || 'AC/PL';
      parts = String(str).split(/[^A-Za-z]+/);
      for (i = 0; i < parts.length; i++) add(parts[i]);
    }
    if (!list.length) list.push('AC');
    var main = list.indexOf('AC') >= 0 ? 'AC' : (list.indexOf('FC') >= 0 ? 'FC' : list[0]);
    var refs = [];
    for (i = 0; i < list.length; i++) {
      if (list[i] !== main && list[i] !== 'FC') refs.push(list[i]);
    }
    var want = String(o.deltaBasis == null ? '' : o.deltaBasis).toUpperCase();
    var basis = null, order = [want, 'PL', 'PY', 'BU'];
    for (i = 0; i < order.length && !basis; i++) {
      if (order[i] && refs.indexOf(order[i]) >= 0) basis = order[i];
    }
    var sec = null;
    for (i = 0; i < refs.length && !sec; i++) if (refs[i] !== basis) sec = refs[i];
    return {
      list: list, main: main, basis: basis, sec: sec,
      fc: list.indexOf('FC') >= 0, scen: list.join('/')
    };
  }

  /* ------------------------------------------------------------- Kontext */
  /* ctx() ist die einzige Stelle, an der o.scale und die Typografie
     ausgewertet werden (siehe Kopfkommentar).                             */
  function ctx(w, h, o) {
    o = o || {};
    var W0 = Math.max(16, n(w) || 100);
    var H0 = Math.max(12, n(h) || 50);
    var k = +o.scale;
    if (!isFinite(k) || k <= 0) k = 1;
    k = Math.min(k, W0 / 16, H0 / 12, 16);
    if (!(k > 0.1)) k = 0.1;
    k = Math.round(k * 1000) / 1000;
    var W = Math.floor(W0 / k * 100) / 100;
    var H = Math.floor(H0 / k * 100) / 100;
    var v = o.variance || {};
    var lang = (o.lang === 'en') ? 'en' : 'de';
    var sn = scenSet(o);
    var C = theme(o);
    var pad = 4;
    // Typografie: Grundgrad, o.fonts ersetzt je Rolle, o.fontScale multipliziert
    var fk = +o.fontScale;
    if (!isFinite(fk) || fk <= 0) fk = 1;
    fk = clamp(fk, 0.5, 3);
    var F = (o.fonts && typeof o.fonts === 'object') ? o.fonts : {};
    var base = W < 240 ? 8 : 9;
    function fnt(key) { var x = +F[key]; return n((isFinite(x) && x > 0 ? clamp(x, 4, 40) : base) * fk); }
    var c = {
      w: W, h: H, pad: pad,
      k: k, ow: W0, oh: H0,
      x0: pad, y0: pad, x1: n(W - pad), y1: n(H - pad),
      iw: Math.max(4, n(W - 2 * pad)),
      ih: Math.max(4, n(H - 2 * pad)),
      small: (W < 120 || H < 50),
      tiny:  (W < 90  || H < 34),
      scen: sn.scen, scens: sn.list, main: sn.main, basis: sn.basis, sec: sn.sec, fc: sn.fc,
      pol: (o.polarity === 'lower') ? -1 : 1,
      C: C, lang: lang, t: L10N[lang],
      unit: (o.unit == null) ? '' : String(o.unit),
      anti: !!o.antiPattern,
      vAbs: v.abs !== false,
      vRel: v.rel !== false,
      dense: !!o.dense,
      o: o,
      rnd: mulberry32(o.seed == null ? 1 : o.seed)
    };
    c.fs  = fnt('label');                  // Wert-/Δ-Beschriftung
    c.fsA = fnt('axis');                   // Kategorien, Monate
    c.fsT = fnt('title');                  // Ebenen-/Spaltenköpfe
    c.fsV = (+F.value > 0) ? n(clamp(+F.value, 6, 80) * fk) : 0;   // große Zahl, 0 = automatisch
    c.fk = fk;
    // Beschriftungsschwelle wächst mit der Schrift (nie unter 85 %)
    c.lk = clamp(Math.max(c.fs, c.fsA, c.fsT) / base, 0.85, 2.5);
    c.mon = c.t.mon;
    c.cat = c.t.cat;
    // Eigene Daten (siehe fmt): Kategorien, Hauptreihe, Referenz
    c.uc = strList(o.cats);
    c.uv = numList(o.values);
    c.ur = c.uv ? numList(o.refValues) : null;
    if (c.uc) c.cat = c.uc;
    c.real = !!c.uv;
    c.vdec = c.uv ? decOf(c.uv.concat(c.ur || [])) : 0;
    c.lab =(!c.small && W >= 170 * c.lk && H >= 90 * c.lk);
    return c;
  }

  /* Anti-Pattern-Überzug: diagonale Schraffur in hellem Rot plus „!"-Plakette. */
  function antiLayer(c) {
    var id = 'mkap' + (++uid);
    var s = '<defs><pattern id="' + id + '" width="7" height="7" patternUnits="userSpaceOnUse" ' +
            'patternTransform="rotate(45 0 0)"><line x1="0" y1="0" x2="0" y2="7" stroke="' + c.C.bad +
            '" stroke-width="1.1"/></pattern></defs>';
    s += '<rect x="0" y="0" width="' + n(c.w) + '" height="' + n(c.h) + '" fill="url(#' + id +
         ')" fill-opacity="0.14"/>';
    var r = clamp(Math.min(c.w, c.h) * 0.11, 3.4, 7.5);
    if (c.w >= r * 4 && c.h >= r * 4) {
      var bx = n(c.w - r - 1.4), by = n(r + 1.4);
      s += circ(bx, by, r, c.C.paper, c.C.bad, 1.2);
      s += txt(bx, by + r * 0.55, '!', r * 1.4, c.C.bad, 'middle', '700');
    }
    return s;
  }

  function wrap(c, body) {
    if (c.anti) body += antiLayer(c);
    var g = c.k === 1 ? body : '<g transform="scale(' + c.k + ')">' + body + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + c.ow + ' ' + c.oh +
           '" width="100%" height="100%" font-family="' + FONT + '">' + g + '</svg>';
  }

  function area(c, o) {
    o = o || {};
    var l = o.left || 0, r = o.right || 0, t = o.top || 0, b = o.bottom || 0;
    return {
      x: n(c.x0 + l), y: n(c.y0 + t),
      w: Math.max(3, n(c.iw - l - r)),
      h: Math.max(3, n(c.ih - t - b))
    };
  }

  function bands(y, h, parts, gap) {
    gap = gap == null ? 3 : gap;
    var s = 0, i, out = [], cur = y;
    for (i = 0; i < parts.length; i++) s += parts[i];
    var free = h - gap * (parts.length - 1);
    if (free < parts.length * 2) { free = Math.max(parts.length * 2, h); gap = 0; cur = y; }
    for (i = 0; i < parts.length; i++) {
      var bh = free * parts[i] / (s || 1);
      out.push({ y: n(cur), h: Math.max(2, n(bh)) });
      cur += bh + gap;
    }
    return out;
  }

  function slots(x, w, cnt, gapRatio) {
    var g = gapRatio == null ? 0.3 : gapRatio;
    cnt = Math.max(1, cnt | 0);
    var step = w / cnt;
    var bw = Math.max(0.9, step * (1 - g));
    var a = [], i;
    for (i = 0; i < cnt; i++) {
      a.push({ x: n(x + step * i + (step - bw) / 2), w: n(bw), cx: n(x + step * i + step / 2), step: n(step) });
    }
    return a;
  }

  function sc(vmin, vmax, p0, p1) {
    var d = vmax - vmin;
    if (!isFinite(d) || d === 0) d = 1;
    return function (v) {
      v = +v; if (!isFinite(v)) v = vmin;
      return n(p0 + (v - vmin) / d * (p1 - p0));
    };
  }

  function rowsOf(y, h, cnt, gapRatio) {
    var g = gapRatio == null ? 0.32 : gapRatio;
    cnt = Math.max(1, cnt | 0);
    var step = h / cnt, bh = Math.max(1.4, step * (1 - g)), a = [], i;
    for (i = 0; i < cnt; i++) a.push({ y: n(y + step * i + (step - bh) / 2), h: n(bh), cy: n(y + step * i + step / 2), step: n(step) });
    return a;
  }

  /* ---------------------------------------------------- Szenario-Werkzeuge */

  function refKind(c) { return c.basis; }
  function hasFC(c) { return !!c.fc; }
  function isOutline(kind) { return kind === 'PL' || kind === 'BU'; }

  /* Ab diesem Index gelten Säulen als Forecast. Ist FC die Hauptreihe,
     ist die ganze Reihe schraffiert. */
  function fcStart(c, cnt) {
    if (c.main === 'FC') return 0;
    return hasFC(c) ? Math.max(1, Math.round(cnt * 0.62)) : cnt + 1;
  }
  // x der AC|FC-Trennung zwischen zwei Slots (null ohne Forecast)
  function fcX(c, sl) {
    if (!hasFC(c) || !sl.length) return null;
    var at = fcStart(c, sl.length);
    if (at <= 0) return sl[0].cx - sl[0].step / 2;
    if (at > sl.length - 1) return null;
    return n((sl[at - 1].cx + sl[at].cx) / 2);
  }

  /* Schraffuren: AC-Grau für FC-Werte, dazu je eine in Gut- und Schlecht-
     Farbe für Forecast-Abweichungen (wie patGood/patBad im Visual). */
  function hatch(c) {
    var id = 'mkfc' + (++uid);
    function pat(pid, col) {
      return '<pattern id="' + pid + '" width="4" height="4" patternUnits="userSpaceOnUse" ' +
             'patternTransform="rotate(45 0 0)"><rect width="4" height="4" fill="' + c.C.paper + '"/>' +
             '<line x1="0" y1="0" x2="0" y2="4" stroke="' + col + '" stroke-width="1.5"/></pattern>';
    }
    return {
      id: id, g: id + 'g', b: id + 'b',
      defs: '<defs>' + pat(id, c.C.ac) + pat(id + 'g', c.C.good) + pat(id + 'b', c.C.bad) + '</defs>'
    };
  }
  function fcFill(c, hh, px) { return (hh && n(px) >= 4) ? 'url(#' + hh.id + ')' : c.C.fcc; }
  // Forecast-Abweichung: farbige Schraffur, bei zu kleinen Flächen aufgehellt
  function dFill(c, hh, d, px) {
    var good = dcol(c, d) === c.C.good;
    return (hh && n(px) >= 3) ? 'url(#' + (good ? hh.g : hh.b) + ')' : mix(dcol(c, d), c.C.paper, 0.45);
  }

  // Referenzfläche je Szenario
  function refShape(c, x, y, w, h, kind, hh) {
    if (kind === 'PY') return rect(x, y, w, h, c.C.py);
    if (kind === 'FC') return rect(x, y, w, h, fcFill(c, hh, Math.min(w, h)), c.C.ac, 0.8);
    return rect(x, y, w, h, c.C.plf, c.C.pls, 1);
  }

  /* Nulllinie in der Notation des Bezugs (wie drawBaseline im Visual):
     AC dunkel · PY breit grau · PL/BU doppelt dünn · FC gestrichelt.
     xs = x, ab dem die Linie gepunktet weiterläuft (Forecast-Teil).        */
  function baseSeg(c, a, b, y, kind, dash, vert) {
    function L(p, q, off, col, sw, ds) {
      return vert ? ln(y + off, p, y + off, q, col, sw, ds) : ln(p, y + off, q, y + off, col, sw, ds);
    }
    if (!(b > a)) return '';
    if (kind === 'PY') return L(a, b, 0, c.C.py, 2.4, dash ? '2 1.6' : null);
    if (kind === 'PL' || kind === 'BU') {
      return L(a, b, -1.1, c.C.pls, 0.8, dash ? '2 1.6' : null) + L(a, b, 1.1, c.C.pls, 0.8, dash ? '2 1.6' : null);
    }
    if (kind === 'FC') return L(a, b, 0, c.C.axis, 1, '3 2');
    return L(a, b, 0, c.C.axis, 1.3, dash ? '2 1.6' : null);
  }
  function baseH(c, x1, x2, y, kind, xs) {
    if (xs == null || xs >= x2) return baseSeg(c, x1, x2, y, kind, false, false);
    if (xs <= x1) return baseSeg(c, x1, x2, y, kind, true, false);
    return baseSeg(c, x1, xs, y, kind, false, false) + baseSeg(c, xs, x2, y, kind, true, false);
  }
  function baseV(c, y1, y2, x, kind) { return baseSeg(c, y1, y2, x, kind, false, true); }

  /* ------------------------------------------------------ Datengeneratoren */

  function vals(c, cnt, base, spread) {
    var a = [], i;
    for (i = 0; i < cnt; i++) a.push(n(Math.max(6, base + (c.rnd() - 0.42) * spread)));
    return a;
  }
  function derive(c, src, lo, hi) {
    var a = [], i;
    for (i = 0; i < src.length; i++) a.push(n(src[i] * (lo + c.rnd() * (hi - lo))));
    return a;
  }
  function diffs(a, b) {
    var d = [], i;
    for (i = 0; i < a.length; i++) d.push(n(a[i] - b[i]));
    return d;
  }
  function rels(a, b) {
    var d = [], i;
    for (i = 0; i < a.length; i++) d.push(n(b[i] ? (a[i] - b[i]) / Math.abs(b[i]) * 100 : 0));
    return d;
  }
  function sortDesc(a) { return a.slice().sort(function (x, y) { return y - x; }); }

  /* Eigene Daten einsetzen. Alle drei Helfer geben ohne o.cats/o.values
     ihre Eingabe unverändert zurück (Byte-Identität).
     kcnt:    Anzahl Kategorien — Länge von o.cats (sonst o.values), gekappt
              auf cap (Default: der bisherige Wert def), mindestens 1.
     useVals: Hauptreihe aus o.values; fehlende Stellen synthetisch in der
              Größenordnung der eingegebenen Werte (Form aus syn).
     useRef:  Referenz aus o.refValues; fehlende Stellen bleiben synthetisch
              (syn ist bereits aus der eingesetzten Hauptreihe abgeleitet). */
  function kcnt(c, def, cap) {
    var nn = c.uc ? c.uc.length : (c.uv ? c.uv.length : 0);
    return nn ? Math.max(1, Math.min(nn, cap == null ? def : cap)) : def;
  }
  // Obergrenze der Kategorien: klein fest, sonst nach Breite (px je Slot)
  function capN(c, small, per, lo, hi) {
    return c.small ? small : Math.max(lo || 6, Math.min(hi || 24, Math.floor(c.iw / per)));
  }
  function capR(c, small, per, lo, hi) {
    return c.small ? small : Math.max(lo || 3, Math.min(hi || 20, Math.floor(c.ih / per)));
  }
  // Breite der Kategoriespalte: mit o.cats nach den längsten Namen (gekappt)
  function labWid(c, cnt, def, frac) {
    if (!c.uc) return def;
    var m = 0, i;
    for (i = 0; i < cnt; i++) m = Math.max(m, tw(c.cat[i % c.cat.length], c.fsA));
    return Math.max(Math.min(c.iw * (frac || 0.3), m + 5), Math.min(def, m + 5));
  }
  // erster gültiger Wert einer Liste (o.values[0] bzw. der nächste gesetzte)
  function first(a) { for (var i = 0; i < a.length; i++) if (a[i] != null) return a[i]; return 0; }
  function useVals(c, syn) {
    if (!c.uv) return syn;
    var out = [], i, sa = 0, na = 0, ss = 0;
    for (i = 0; i < c.uv.length && i < syn.length; i++) if (c.uv[i] != null) { sa += Math.abs(c.uv[i]); na++; }
    if (!na) for (i = 0; i < c.uv.length; i++) if (c.uv[i] != null) { sa += Math.abs(c.uv[i]); na++; }
    for (i = 0; i < syn.length; i++) ss += Math.abs(syn[i]);
    var f = na ? (sa / na) / ((ss / (syn.length || 1)) || 1) : 1;
    for (i = 0; i < syn.length; i++) out.push(i < c.uv.length && c.uv[i] != null ? c.uv[i] : syn[i] * f);
    return out;
  }
  function useRef(c, syn) {
    if (!c.uv || !c.ur || !syn) return syn;
    var out = [], i;
    for (i = 0; i < syn.length; i++) out.push(i < c.ur.length && c.ur[i] != null ? c.ur[i] : syn[i]);
    return out;
  }
  // Wertebereich inkl. 0 über mehrere Reihen (null-Reihen werden übersprungen)
  function span() {
    var lo = 0, hi = 0, i, j, a;
    for (j = 0; j < arguments.length; j++) {
      a = arguments[j]; if (!a) continue;
      for (i = 0; i < a.length; i++) { var v = +a[i]; if (!isFinite(v)) continue; if (v < lo) lo = v; if (v > hi) hi = v; }
    }
    return { lo: lo, hi: hi };
  }
  // Zeitreihe mit leichtem Trend und Saison — wirkt echter als reines Rauschen
  function series(c, cnt, base, amp) {
    var a = [], i, ph = c.rnd() * 6;
    for (i = 0; i < cnt; i++) {
      a.push(n(Math.max(4, base * (1 + i * 0.018) + Math.sin(i * 0.9 + ph) * amp * 0.5 + (c.rnd() - 0.5) * amp * 0.7)));
    }
    return a;
  }

  function sparkPts(c, cnt, x, y, w, h) {
    cnt = Math.max(2, cnt | 0);
    var v = series(c, cnt, 60, 24), i, lo = v[0], hi = v[0];
    for (i = 1; i < cnt; i++) { if (v[i] < lo) lo = v[i]; if (v[i] > hi) hi = v[i]; }
    var pad = (hi - lo) * 0.12 || 1;
    var s = sc(lo - pad, hi + pad, y + h, y);
    var step = w / (cnt - 1), pts = [];
    for (i = 0; i < cnt; i++) pts.push([x + step * i, s(v[i])]);
    return pts;
  }

  /* --------------------------------------------------- Bausteine (Ebenen) */

  // Ebenen-Überschrift („ΔPL %", „AC · PL") oben links in der Ebene
  function layerCap(c, x, y, s) {
    return c.lab ? txt(x, y, s, c.fsT, c.C.sub, 'start') : '';
  }
  // Szenario-Kurzzeile wie im Visual: „AC · PL · FC"
  function scenCap(c, kind) {
    var a = [c.main], i;
    if (kind && a.indexOf(kind) < 0) a.push(kind);
    for (i = 0; i < c.scens.length; i++) if (a.indexOf(c.scens[i]) < 0) a.push(c.scens[i]);
    return a.join(' · ');
  }

  /* Σ-Kopfzeile rechts oben wie im Visual: „Σ 479  ΔPL -21 · -4%".
     Liefert '' wenn sie nicht zwischen xL und xR passt.                     */
  function sumBadge(c, xL, xR, y, total, d, rel, kind) {
    if (!c.lab) return '';
    var col = dcol(c, d);
    var parts = total == null ? [] : [['Σ ' + vlbl(c, total), c.C.ink, '600']];
    if (kind) {
      parts.push([(parts.length ? ' ' : '') + 'Δ' + kind + ' ', c.C.sub]);
      parts.push([dvlbl(c, d), col, '600']);
      if (rel != null) parts.push([' · ' + (Math.abs(rel) < 9.95 ? sgn(lbl(c, rel, 1)) + '%' : plbl(c, rel)), col, '600']);
    }
    var size = c.fsT;
    if (xR - tw('x'.repeat(richLen(parts)), size) < xL) {
      if (parts.length > 3) { parts.pop(); }
      if (xR - tw('x'.repeat(richLen(parts)), size) < xL) return '';
    }
    return rich(xR, y, parts, size, 'end');
  }

  // Abgerundete Plakette mit Δ-Summe (wie der Kreis-Callout im Visual)
  function pill(c, cx, cy, s, col, xL, xR) {
    var fz = c.fs, pw = tw(s, fz) + fz * 1.2, ph = fz * 1.55;
    if (pw > xR - xL) return '';
    cx = clamp(cx, xL + pw / 2, xR - pw / 2);
    return rrect(cx - pw / 2, cy - ph / 2, pw, ph, ph / 2, c.C.paper, col, 1.2) +
           txt(cx, cy + fz * 0.35, s, fz, col, 'middle', '600');
  }

  /* Szenario-Marke: Dreieck, Spitze auf dem Wert (IBCS UN 4.1).
     triRight: ▶ links an der Säule (Visual: PY-Dreieck bei Säulen)
     triDown:  ▼ über dem Balkenende (Visual: PY-Dreieck bei Balken)        */
  function markFill(c, kind) { return kind === 'PY' ? c.C.py : c.C.plf; }
  function markLine(c, kind) { return kind === 'PY' ? mix(c.C.py, c.C.ink, 0.25) : c.C.pls; }
  function triRight(c, x, y, s, kind) {
    s = Math.max(1.4, n(s));
    return polygonEl([[x, y], [x - s, y - s * 0.8], [x - s, y + s * 0.8]], markFill(c, kind || 'PY'), markLine(c, kind || 'PY'), 0.7);
  }
  function triDown(c, x, y, s, kind) {
    s = Math.max(1.4, n(s));
    return polygonEl([[x, y], [x - s * 0.8, y - s], [x + s * 0.8, y - s]], markFill(c, kind || 'PY'), markLine(c, kind || 'PY'), 0.7);
  }

  // Gepunktete Trennlinie zwischen Ist- und Forecast-Bereich
  function fcSplit(c, sl, yA, yB) {
    var x = fcX(c, sl);
    if (x == null || !hasFC(c) || fcStart(c, sl.length) < 1) return '';
    return ln(x, yA, x, yB, c.C.hair, 0.8, '2 2');
  }

  /* Säulengeometrie: Hauptreihe und Referenz je 0,44·Slot, um 0,1·Slot
     versetzt (Referenz links dahinter, wie im Visual). Die Δ-Ebenen holen
     sich dieselben Maße, damit ein Δ-Balken über seiner AC-Säule sitzt.     */
  function colGeom(c, sl, kind, hasRef) {
    var step = sl && sl.length ? sl[0].step : 10;
    var off = !!hasRef && !!kind;
    return {
      step: step, off: off,
      pw: off ? step * 0.46 : step * 0.6,
      rw: step * 0.46,
      dx: off ? step * 0.1 : 0
    };
  }
  function gx(sl, i, g) { return g ? sl[i].cx + g.dx - g.pw / 2 : sl[i].x; }
  function gw(sl, i, g) { return g ? g.pw : sl[i].w; }
  function rowGeom(c, rows, kind, hasRef) {
    var step = rows && rows.length ? rows[0].step : 10;
    var off = !!hasRef && !!kind;
    return {
      step: step, off: off,
      bh: off ? step * 0.44 : step * 0.6,
      rh: step * 0.44,
      dy: off ? step * 0.1 : 0
    };
  }
  function gy(rows, i, g) { return g ? rows[i].cy + g.dy - g.bh / 2 : rows[i].y; }
  function gh(rows, i, g) { return g ? g.bh : rows[i].h; }

  /* Δ-absolut als Säulen um eine eigene Nulllinie (Notation des Bezugs).
     Beschriftung dunkel mit Halo, Vorzeichen immer sichtbar.               */
  function deltaCols(c, d, sl, y, h, hh, opt) {
    opt = opt || {};
    var g = opt.geom, kind = opt.kind || c.basis || 'PL';
    var showLbl = opt.labels !== false && c.lab && sl.length &&
                  sl[0].step >= c.fs * 2.4 && h >= c.fs * 3.6 &&
                  (!c.real || sl[0].step >= vmaxW(c, d, c.fs, dvlbl) + 2);
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.15;
    var m = maxOf(d) * 1.04;
    var s = sc(-m, m, y + h - lh, y + lh), zero = s(0), b = '', i;
    var fcAt = opt.cat ? d.length + 1 : fcStart(c, d.length);
    var xa = sl[0].cx - sl[0].step / 2 + 1, xb = sl[sl.length - 1].cx + sl[sl.length - 1].step / 2 - 1;
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = dcol(c, d[i]), isFC = (i + 1) > fcAt;
      var bx = gx(sl, i, g), bw = gw(sl, i, g);
      var top = Math.min(zero, yy), hgt = Math.max(0.9, Math.abs(zero - yy));
      b += isFC ? rect(bx, top, bw, hgt, dFill(c, hh, d[i], Math.min(bw, hgt)), col, 0.8)
                : rect(bx, top, bw, hgt, col);
      if (showLbl) {
        b += txt(bx + bw / 2, d[i] >= 0 ? top - c.fs * 0.35 : top + hgt + c.fs * 0.95,
                 dvlbl(c, d[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
      }
    }
    b += baseH(c, xa, xb, zero, kind, opt.cat ? null : fcX(c, sl));
    return b;
  }

  /* Δ-Prozent als Pins. Standard: runder Kopf in Abweichungsfarbe (Säulen-
     modus des Visuals); opt.square: quadratischer dunkler Kopf (Balken- und
     Brückenmodus). Forecast: offener Kopf.                                  */
  function deltaPins(c, d, sl, y, h, hh, opt) {
    opt = opt || {};
    var kind = opt.kind || c.basis || 'PL';
    var showLbl = opt.labels !== false && c.lab && sl.length &&
                  sl[0].step >= c.fs * 3 && h >= c.fs * 3.8;
    var r = clamp(sl[0].step * 0.07, 1.3, 2.7);
    var lh = showLbl ? c.fs * 1.3 + r : r + 0.6;
    var m = maxOf(d) * 1.04;
    var s = sc(-m, m, y + h - lh, y + lh), zero = s(0), b = '', i;
    var fcAt = opt.cat ? d.length + 1 : fcStart(c, d.length);
    var xa = sl[0].cx - sl[0].step / 2 + 1, xb = sl[sl.length - 1].cx + sl[sl.length - 1].step / 2 - 1;
    b += baseH(c, xa, xb, zero, kind, opt.cat ? null : fcX(c, sl));
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = dcol(c, d[i]), isFC = (i + 1) > fcAt, x = sl[i].cx;
      b += ln(x, zero, x, yy, col, 1.4);
      if (opt.square) {
        b += isFC ? rect(x - r, yy - r, r * 2, r * 2, c.C.paper, c.C.ink, 0.9)
                  : rect(x - r, yy - r, r * 2, r * 2, c.C.ink);
      } else {
        b += isFC ? circ(x, yy, r, c.C.paper, col, 1.1) : circ(x, yy, r, col);
      }
      if (showLbl) {
        b += txt(x, d[i] >= 0 ? yy - r - c.fs * 0.35 : yy + r + c.fs * 0.9,
                 plbl(c, d[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
      }
    }
    return b;
  }

  // Liegende Δ-Balken (Balkenmodus), Labels am Balkenende
  function deltaBarsH(c, d, rows, x, w, hh, opt) {
    opt = opt || {};
    var g = opt.geom, kind = opt.kind || c.basis || 'PL';
    var wmax = 0, i;
    for (i = 0; i < d.length; i++) wmax = Math.max(wmax, tw(dvlbl(c, d[i]), c.fs));
    var showLbl = opt.labels !== false && c.lab && rows[0].step >= c.fs * 1.1 && w >= wmax * 2 + c.fs * 3;
    var lw = showLbl ? wmax + 3 : 0;
    var m = maxOf(d) * 1.04;
    var s = sc(-m, m, x + lw, x + w - lw), zero = s(0), b = '';
    var fcAll = (c.main === 'FC');
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = dcol(c, d[i]);
      var bx = Math.min(zero, xx), bw = Math.max(0.9, Math.abs(xx - zero));
      var by = gy(rows, i, g), bh = gh(rows, i, g);
      b += fcAll ? rect(bx, by, bw, bh, dFill(c, hh, d[i], Math.min(bw, bh)), col, 0.8)
                 : rect(bx, by, bw, bh, col);
      if (showLbl) {
        b += txt(d[i] >= 0 ? xx + 2 : xx - 2, rows[i].cy + c.fs * 0.34,
                 dvlbl(c, d[i]), c.fs, c.C.ink, d[i] >= 0 ? 'start' : 'end');
      }
    }
    b += baseV(c, rows[0].y - 2, rows[rows.length - 1].y + rows[rows.length - 1].h + 2, zero, kind);
    return b;
  }

  // Liegende Δ%-Pins mit quadratischem dunklem Kopf (wie im Balkenmodus)
  function deltaPinsH(c, d, rows, x, w, opt) {
    opt = opt || {};
    var kind = opt.kind || c.basis || 'PL';
    var wmax = 0, i;
    for (i = 0; i < d.length; i++) wmax = Math.max(wmax, tw(plbl(c, d[i]), c.fs));
    var showLbl = opt.labels !== false && c.lab && rows[0].step >= c.fs * 1.1 && w >= wmax * 2 + c.fs * 3;
    var r = clamp(rows[0].step * 0.13, 1.2, 2.6);
    var lw = showLbl ? wmax + r + 3 : r + 0.5;
    var m = maxOf(d) * 1.04;
    var s = sc(-m, m, x + lw, x + w - lw), zero = s(0), b = '';
    b += baseV(c, rows[0].y - 2, rows[rows.length - 1].y + rows[rows.length - 1].h + 2, zero, kind);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = dcol(c, d[i]), cy = rows[i].cy;
      b += ln(zero, cy, xx, cy, col, 1.4);
      b += rect(xx - r, cy - r, r * 2, r * 2, c.C.ink);
      if (showLbl) {
        b += txt(d[i] >= 0 ? xx + r + 2 : xx - r - 2, cy + c.fs * 0.34,
                 plbl(c, d[i]), c.fs, c.C.ink, d[i] >= 0 ? 'start' : 'end');
      }
    }
    return b;
  }

  /* Säulenblock Hauptreihe gegen Referenz — Referenz versetzt dahinter,
     drittes Szenario als ▶-Marke, FC schraffiert, Wertlabel darüber.        */
  function colBlock(c, P, ac, rf, kind, hh, sl, opt) {
    opt = opt || {};
    var cnt = ac.length, i;
    var gm = colGeom(c, sl, kind, !!rf);
    var step = gm.step, pw = gm.pw, rw = gm.rw, dx = gm.dx;
    var showLbl = opt.labels !== false && c.lab &&
                  step >= Math.max(c.fs * 2.4, (c.real ? vmaxW(c, ac) : tw(lbl(c, maxOf(ac), 0), c.fs)) + 3) && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    var sec = (opt.sec !== false && c.sec && rf) ? derive(c, ac, 0.88, 1.12) : null;
    var mx = opt.max || Math.max(maxOf(ac), rf ? maxOf(rf) : 0, sec ? maxOf(sec) : 0) * 1.03;
    var fcAt = fcStart(c, cnt), b = '';
    var ms = clamp(step * 0.12, 1.8, 4.2);
    var lo = opt.min != null ? opt.min : span(ac, rf, sec).lo;
    var s;
    if (lo < 0) {
      /* Negative Werte (nur mit o.values): eigene Nulllinie, Säulen hängen
         nach unten, Beschriftung unter dem Säulenende.                     */
      var hi = opt.max != null ? opt.max : span(ac, rf, sec).hi * 1.03;
      s = sc(lo * 1.03, hi, P.y + P.h - lh, P.y + (hi > 0 ? lh : c.fs * 0.2));
      var z = s(0);
      for (i = 0; i < cnt; i++) {
        var cxR2 = sl[i].cx - dx, cxP2 = sl[i].cx + dx, yR2 = null;
        if (rf && kind) {
          yR2 = s(rf[i]);
          b += refShape(c, cxR2 - rw / 2, Math.min(z, yR2), rw, Math.max(0.9, Math.abs(z - yR2)), kind, hh);
        }
        var yT2 = s(ac[i]), top2 = Math.min(z, yT2), hg2 = Math.max(0.9, Math.abs(z - yT2));
        b += (i + 1) > fcAt
          ? rect(cxP2 - pw / 2, top2, pw, hg2, fcFill(c, hh, pw), c.C.ac, 0.8)
          : rect(cxP2 - pw / 2, top2, pw, hg2, c.C.ac);
        if (sec) {
          var yS2 = clamp(s(sec[i]), P.y + ms, P.y + P.h - ms * 0.8);
          var xT2 = (rf && kind ? cxR2 - rw / 2 : cxP2 - pw / 2);
          if (xT2 - ms >= c.x0 - 0.5) b += triRight(c, xT2, yS2, ms, c.sec);
        }
        if (showLbl) {
          b += ac[i] >= 0
            ? txt(cxP2, Math.min(yT2, yR2 == null ? yT2 : yR2) - c.fs * 0.38, vlbl(c, ac[i]), c.fs, c.C.ink, 'middle', null, c.C.paper)
            : txt(cxP2, Math.max(yT2, yR2 == null ? yT2 : yR2) + c.fs * 0.95, vlbl(c, ac[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
        }
      }
      if (opt.baseline !== false) b += baseH(c, P.x, P.x + P.w, z, 'AC', fcX(c, sl));
      return { body: b, slots: sl, scale: s };
    }
    s = sc(0, mx, P.y + P.h, P.y + lh);
    for (i = 0; i < cnt; i++) {
      var cxR = sl[i].cx - dx, cxP = sl[i].cx + dx;
      if (rf && kind) {
        var yR = s(rf[i]);
        b += refShape(c, cxR - rw / 2, yR, rw, Math.max(0.9, P.y + P.h - yR), kind, hh);
      }
      var isFC = (i + 1) > fcAt, yT = s(ac[i]);
      b += isFC
        ? rect(cxP - pw / 2, yT, pw, Math.max(0.9, P.y + P.h - yT), fcFill(c, hh, pw), c.C.ac, 0.8)
        : rect(cxP - pw / 2, yT, pw, Math.max(0.9, P.y + P.h - yT), c.C.ac);
      if (sec) {
        var yS = clamp(s(sec[i]), P.y + ms, P.y + P.h - ms * 0.8);
        var xT = (rf && kind ? cxR - rw / 2 : cxP - pw / 2);
        if (xT - ms >= c.x0 - 0.5) b += triRight(c, xT, yS, ms, c.sec);
      }
      if (showLbl) {
        var top = Math.min(yT, rf && kind ? s(rf[i]) : yT);
        b += txt(cxP, top - c.fs * 0.38, vlbl(c, ac[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
      }
    }
    if (opt.baseline !== false) b += baseH(c, P.x, P.x + P.w, P.y + P.h, 'AC', fcX(c, sl));
    return { body: b, slots: sl, scale: s };
  }

  /* Kategorie-/Monatsbeschriftung. Passen die Namen nicht in den Slot, wird
     nur jede zweite/dritte gesetzt — nie überlappend, immer im viewBox.     */
  function monLabels(c, sl, y, names, bold) {
    if (!c.lab || !sl.length) return '';
    var b = '', i, nm = names || c.mon, t, cx, wmax = 0, every = 1;
    for (i = 0; i < sl.length; i++) wmax = Math.max(wmax, tw(nm[i % nm.length], c.fsA));
    // eigene Kategorienamen: kürzen statt auslassen (siehe fitCats)
    if (c.uc && names) return fitCats(c, sl, y, nm, c.C.txt, bold);
    while (every < 6 && sl[0].step * every < wmax + 3) every++;
    if (sl[0].step * every < wmax + 3) return '';
    for (i = 0; i < sl.length; i += every) {
      t = nm[i % nm.length];
      var w2 = tw(t, c.fsA) / 2;
      cx = clamp(sl[i].cx, c.x0 + w2, c.x1 - w2);
      b += txt(cx, y, t, c.fsA, c.C.txt, 'middle', bold && bold[i] ? '600' : null);
    }
    return b;
  }

  // Zeilenbeschriftung links (Kategorien der Balken)
  function rowLabel(c, x, cy, s, w, bold) {
    return txt(x, cy + c.fsA * 0.34, fit(c, s, w, c.fsA), c.fsA, bold ? c.C.ink : c.C.txt, 'end', bold ? '600' : null);
  }

  /* ====================================================================== */
  /*  Skizzen · IBCS / ChartKitchen                                         */
  /* ====================================================================== */

  var S = {};

  /* ---- 1 · Säulen: AC gegen Referenz, eine Δ-Ebene darüber -------------- */
  S.columns = function (w, h, o) {
    if (o && o.look === 'native') return S.ncolumn(w, h, o);
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 4 : (c.dense ? 12 : 6), capN(c, 4, 16));
    var kind = refKind(c);
    var ac = useVals(c, series(c, cnt, 70, 26)), rf = kind ? useRef(c, derive(c, ac, 0.86, 1.14)) : null;
    var labH = c.lab ? c.fsA + 5 : 0, capH = c.lab ? c.fsT + 4 : 0;
    var dMode = c.vAbs ? 'abs' : (c.vRel ? 'rel' : null);
    var withDelta = (!c.small && c.h >= 118 * c.lk && dMode && !!kind);
    var sl = slots(c.x0, c.iw, cnt, 0.3), P, capY = c.y0 + c.fsT * 0.85;
    if (withDelta) {
      var bd = bands(c.y0, c.ih - labH, [30, 70], c.fs * 0.5);
      b += layerCap(c, c.x0, bd[0].y + c.fsT * 0.85, 'Δ' + kind + (dMode === 'rel' ? ' %' : ''));
      b += dMode === 'abs'
        ? deltaCols(c, diffs(ac, rf), sl, bd[0].y + capH, Math.max(6, bd[0].h - capH), hh, { geom: colGeom(c, sl, kind, true), kind: kind })
        : deltaPins(c, rels(ac, rf), sl, bd[0].y + capH, Math.max(6, bd[0].h - capH), hh, { kind: kind });
      b += layerCap(c, c.x0, bd[1].y + c.fsT * 0.85, scenCap(c, kind));
      P = { x: c.x0, y: bd[1].y + capH, w: c.iw, h: Math.max(6, bd[1].h - capH) };
    } else {
      b += layerCap(c, c.x0, capY, scenCap(c, kind));
      P = { x: c.x0, y: c.y0 + capH, w: c.iw, h: Math.max(6, c.ih - labH - capH) };
    }
    if (kind && c.w >= 300) {
      var sA = sum(ac), sR = sum(rf);
      b += sumBadge(c, c.x0 + tw(withDelta ? 'ΔPL %' : scenCap(c, kind), c.fsT) + 12, c.x1, capY, sA, sA - sR,
                    sR ? (sA - sR) / Math.abs(sR) * 100 : 0, kind);
    }
    b += colBlock(c, P, ac, rf, kind, hh, sl).body;
    b += fcSplit(c, sl, c.y0 + (withDelta ? 0 : capH), P.y + P.h);
    b += monLabels(c, sl, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 2 · Säulen plus Linie (zweite Kennzahl, eigene Skala) ------------ */
  S.colline = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 4 : (c.dense ? 12 : 7), capN(c, 4, 16));
    var kind = refKind(c);
    var ac = useVals(c, series(c, cnt, 68, 24)), rf = kind ? useRef(c, derive(c, ac, 0.86, 1.14)) : null;
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.3), i;
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, scenCap(c, kind));
    if (c.lab) b += txt(c.x1, c.y0 + c.fsT * 0.85, '— ' + c.t.margin, c.fsT, c.C.sub, 'end');
    // Säulen im unteren Teil, die Linie läuft darüber (eigene Skala)
    var Pc = { x: P.x, y: P.y + P.h * 0.34, w: P.w, h: P.h * 0.66 };
    b += colBlock(c, Pc, ac, rf, kind, hh, sl, { labels: c.lab && P.h >= 110 }).body;
    var q = [], pts = [];
    for (i = 0; i < cnt; i++) q.push(n(24 + Math.sin(i * 0.8 + 1) * 4 + c.rnd() * 3 + i * 0.4));
    var r = c.small ? 1.3 : 2;
    var lo = Math.min.apply(null, q) - 2, hi = Math.max.apply(null, q) + 2;
    var s2 = sc(lo, hi, P.y + P.h * 0.3, P.y + (c.lab ? c.fs * 1.4 : 2) + r);
    for (i = 0; i < cnt; i++) pts.push([sl[i].cx, s2(q[i])]);
    b += polyline(pts, c.C.ink, c.small ? 1.1 : 1.4);
    for (i = 0; i < pts.length; i++) {
      b += circ(pts[i][0], pts[i][1], r, c.C.paper, c.C.ink, 1.1);
      if (c.lab && sl[0].step >= tw('00,0%', c.fs) + 2) {
        b += txt(pts[i][0], pts[i][1] - r - 2.5, lbl(c, q[i], 1) + '%', c.fs, c.C.ink, 'middle', null, c.C.paper);
      }
    }
    b += fcSplit(c, sl, P.y, P.y + P.h);
    b += monLabels(c, sl, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 3 · Kombi: Δ% · Δabs · Säulen in drei Ebenen (Säulenmodus) ------- */
  S.kombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 4 : (c.dense ? 12 : 6), capN(c, 4, 16));
    var kind = refKind(c) || 'PL';
    var ac = useVals(c, series(c, cnt, 72, 26)), rf = useRef(c, derive(c, ac, 0.86, 1.14));
    var labH = c.lab ? c.fsA + 5 : 0, capH = c.lab ? c.fsT + 4 : 0, i;
    var sl = slots(c.x0, c.iw, cnt, 0.3);
    var gm = colGeom(c, sl, kind, true);
    if (c.small) {
      if (!c.vAbs && !c.vRel) {
        b += colBlock(c, { x: c.x0, y: c.y0, w: c.iw, h: c.ih - labH }, ac, rf, kind, hh, sl).body;
        return wrap(c, b);
      }
      var bs = bands(c.y0, c.ih - labH, [34, 66], 2);
      b += c.vAbs
        ? deltaCols(c, diffs(ac, rf), sl, bs[0].y, bs[0].h, hh, { labels: false, geom: gm, kind: kind })
        : deltaPins(c, rels(ac, rf), sl, bs[0].y, bs[0].h, hh, { labels: false, kind: kind });
      b += colBlock(c, { x: c.x0, y: bs[1].y, w: c.iw, h: bs[1].h }, ac, rf, kind, hh, sl).body;
      return wrap(c, b);
    }
    var parts = [], keys = [];
    if (c.vRel) { parts.push(24); keys.push('rel'); }
    if (c.vAbs) { parts.push(26); keys.push('abs'); }
    parts.push(keys.length ? 56 : 100); keys.push('col');
    var bd = bands(c.y0, c.ih - labH, parts, c.fs * 0.5), P = null;
    for (i = 0; i < keys.length; i++) {
      var y = bd[i].y + capH, bandH = Math.max(6, bd[i].h - capH), cy = bd[i].y + c.fsT * 0.85;
      if (keys[i] === 'rel') {
        b += layerCap(c, c.x0, cy, 'Δ' + kind + ' %');
        b += deltaPins(c, rels(ac, rf), sl, y, bandH, hh, { kind: kind });
      } else if (keys[i] === 'abs') {
        b += layerCap(c, c.x0, cy, 'Δ' + kind);
        b += deltaCols(c, diffs(ac, rf), sl, y, bandH, hh, { geom: gm, kind: kind });
      } else {
        b += layerCap(c, c.x0, cy, scenCap(c, kind));
        P = { x: c.x0, y: y, w: c.iw, h: bandH };
        b += colBlock(c, P, ac, rf, kind, hh, sl).body;
      }
    }
    if (c.w >= 300) {
      var sA = sum(ac), sR = sum(rf);
      b += sumBadge(c, c.x0 + tw('Δ' + kind + ' %', c.fsT) + 12, c.x1, c.y0 + c.fsT * 0.85, sA, sA - sR,
                    sR ? (sA - sR) / Math.abs(sR) * 100 : 0, kind);
    }
    b += fcSplit(c, sl, c.y0 + capH, P.y + P.h);
    b += monLabels(c, sl, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 4 · Nur Δ-absolut-Säulen ---------------------------------------- */
  S.absvar = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 4 : (c.dense ? 12 : 7), capN(c, 4, 16));
    var kind = refKind(c) || 'PL';
    var d = [], i;
    if (c.uv) {
      var ac = useVals(c, series(c, cnt, 70, 26));
      d = diffs(ac, useRef(c, derive(c, ac, 0.86, 1.14)));
    } else for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 30 + Math.sin(i) * 8));
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.3);
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, 'Δ' + kind);
    if (c.w >= 240) b += sumBadge(c, c.x0 + tw('ΔPL', c.fsT) + 12, c.x1, c.y0 + c.fsT * 0.85, null, sum(d), null, kind);
    b += deltaCols(c, d, sl, P.y, P.h, hh, { geom: colGeom(c, sl, null, false), kind: kind });
    b += fcSplit(c, sl, P.y, P.y + P.h);
    b += monLabels(c, sl, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 5 · Nur Δ%-Pins -------------------------------------------------- */
  S.relvar = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 4 : (c.dense ? 12 : 7), capN(c, 4, 16));
    var kind = refKind(c) || 'PL';
    var d = [], i;
    if (c.uv) {
      var ac = useVals(c, series(c, cnt, 70, 26));
      d = rels(ac, useRef(c, derive(c, ac, 0.86, 1.14)));
    } else for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 18 + Math.sin(i * 1.3) * 5));
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.3);
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, 'Δ' + kind + ' %');
    b += deltaPins(c, d, sl, P.y, P.h, hh, { kind: kind });
    b += fcSplit(c, sl, P.y, P.y + P.h);
    b += monLabels(c, sl, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 6 · Linien AC / Referenz, Forecast gestrichelt, Δ-Ebene darüber --- */
  S.line = function (w, h, o) {
    if (o && o.look === 'native') return S.nline(w, h, o);
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 6 : (c.dense ? 12 : (c.w >= 400 ? 12 : 8)), capN(c, 6, 14));
    var kind = refKind(c);
    var ac = useVals(c, series(c, cnt, 70, 22)), rf = kind ? useRef(c, derive(c, ac, 0.9, 1.1)) : null;
    var sec = c.sec ? derive(c, ac, 0.86, 1.12) : null;
    var labH = c.lab ? c.fsA + 5 : 0, capH = c.lab ? c.fsT + 4 : 0;
    var rightW = c.lab ? (c.real ? tw(c.w >= 300 ? vlbl(c, ac[cnt - 1]) + ' ' + c.main : c.main, c.fs)
                                 : tw(c.w >= 300 ? '000 AC' : 'AC', c.fs)) + 5 : 0;
    var withDelta = (!c.small && c.h >= 150 * c.lk && !!kind && (c.vAbs || c.vRel));
    var sl = slots(c.x0, c.iw - rightW, cnt, 0.3), P, i;
    if (withDelta) {
      var bd = bands(c.y0, c.ih - labH, [28, 72], c.fs * 0.5);
      b += layerCap(c, c.x0, bd[0].y + c.fsT * 0.85, 'Δ' + kind + (c.vAbs ? '' : ' %'));
      b += c.vAbs
        ? deltaCols(c, diffs(ac, rf), sl, bd[0].y + capH, Math.max(6, bd[0].h - capH), hh, { geom: colGeom(c, sl, null, false), kind: kind })
        : deltaPins(c, rels(ac, rf), sl, bd[0].y + capH, Math.max(6, bd[0].h - capH), hh, { kind: kind });
      b += layerCap(c, c.x0, bd[1].y + c.fsT * 0.85, scenCap(c, kind));
      P = { x: c.x0, y: bd[1].y + capH, w: c.iw - rightW, h: Math.max(6, bd[1].h - capH) };
    } else {
      b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, scenCap(c, kind));
      P = { x: c.x0, y: c.y0 + capH, w: c.iw - rightW, h: Math.max(6, c.ih - labH - capH) };
    }
    var showV = c.lab && sl[0].step >= (c.real ? vmaxW(c, ac) : tw(lbl(c, maxOf(ac), 0), c.fs)) + 3;
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0, sec ? maxOf(sec) : 0) * 1.08;
    var s = sc(0, mx, P.y + P.h, P.y + (showV ? c.fs * 1.4 : 3)), yZ = P.y + P.h;
    var spL = span(ac, rf, sec);
    if (spL.lo < 0) {
      // negative Werte (nur mit o.values): Nulllinie im Inneren
      s = sc(spL.lo * 1.08, spL.hi * 1.08, P.y + P.h - (showV ? c.fs * 1.4 : 3), P.y + (showV && spL.hi > 0 ? c.fs * 1.4 : 3));
      yZ = s(0);
    }
    var pa = [], pr = [], ps = [];
    for (i = 0; i < cnt; i++) {
      pa.push([sl[i].cx, s(ac[i])]);
      if (rf) pr.push([sl[i].cx, s(rf[i])]);
      if (sec) ps.push([sl[i].cx, s(sec[i])]);
    }
    b += baseH(c, P.x, P.x + P.w, yZ, 'AC', fcX(c, sl));
    if (sec) b += polyline(ps, c.sec === 'PY' ? c.C.py : c.C.hair, c.small ? 0.9 : 1.1, '1.5 2');
    if (rf) {
      b += kind === 'PY' ? polyline(pr, c.C.py, c.small ? 1.3 : 1.8)
                         : polyline(pr, c.C.ink, c.small ? 0.8 : 1, '4 2.5');
    }
    var fcAt = fcStart(c, cnt), sw = c.small ? 1.4 : 1.8;
    if (fcAt <= 0) b += polyline(pa, c.C.ac, sw, '4 2.5');
    else if (fcAt < cnt) {
      b += polyline(pa.slice(0, fcAt), c.C.ac, sw);
      b += polyline(pa.slice(fcAt - 1), c.C.ac, sw * 0.8, '4 2.5');
    } else b += polyline(pa, c.C.ac, sw);
    var r = c.small ? 1.2 : 1.7;
    for (i = 0; i < cnt; i++) {
      b += (i >= fcAt) ? circ(pa[i][0], pa[i][1], r, c.C.paper, c.C.ac, 1) : circ(pa[i][0], pa[i][1], r, c.C.ac);
      if (showV && i < cnt - 1) {
        b += txt(pa[i][0], ac[i] < 0 ? pa[i][1] + r + c.fs * 1.05 : pa[i][1] - r - c.fs * 0.4, vlbl(c, ac[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
      }
    }
    b += fcSplit(c, sl, P.y, P.y + P.h);
    if (c.lab) {
      var xe = sl[cnt - 1].cx + r + 3;
      var yA = pa[cnt - 1][1], yR = rf ? pr[cnt - 1][1] : null;
      if (yR != null && Math.abs(yA - yR) < c.fs) { if (yA < yR) yR = yA + c.fs; else yR = yA - c.fs; }
      var tyA = clamp(yA + c.fs * 0.34, P.y + c.fs, P.y + P.h), tyR = yR == null ? null : clamp(yR + c.fs * 0.34, P.y + c.fs, P.y + P.h);
      if (c.real && tyR != null && Math.abs(tyA - tyR) < c.fs) {
        // nach dem Einklemmen wieder zu eng: Referenz auf die freie Seite
        tyR = tyA + c.fs <= P.y + P.h ? tyA + c.fs : tyA - c.fs;
      }
      b += txt(xe, tyA, (showV && c.w >= 300 ? vlbl(c, ac[cnt - 1]) + ' ' : '') + c.main, c.fs, c.C.ink, 'start', '600');
      if (rf) b += txt(xe, tyR, kind, c.fs, kind === 'PY' ? c.C.sub : c.C.ink, 'start');
    }
    b += monLabels(c, sl, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 7 · Slope-Graph, zwei Zeitpunkte (wie der Slope-Modus) ----------- */
  S.slope = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 11, 3, 16));
    var kind = refKind(c) || 'PY';
    var a = sortDesc(vals(c, cnt, 55, 70)), z = derive(c, a, 0.82, 1.2), i;
    // o.values = rechte Seite (Hauptszenario), o.refValues = linke Seite (Bezug)
    if (c.uv) { z = useVals(c, z); a = useRef(c, derive(c, z, 0.84, 1.2)); }
    var headH = c.lab ? c.fsT + 5 : 0;
    var wmax = 0;
    for (i = 0; i < cnt; i++) {
      wmax = Math.max(wmax, c.real ? tw(c.cat[i % c.cat.length] + ' ' + vlbl(c, Math.abs(a[i]) > Math.abs(z[i]) ? a[i] : z[i]), c.fs)
                                   : tw(c.cat[i % c.cat.length] + ' 000', c.fs));
    }
    var sideW = c.lab ? Math.min(wmax + 4, c.iw * 0.34) : 0;
    var P = area(c, { left: sideW, right: sideW, top: headH });
    var mx = Math.max(maxOf(a), maxOf(z)) * 1.04, s = sc(0, mx, P.y + P.h - 2, P.y + 3);
    var spS = span(a, z);
    if (spS.lo < 0) s = sc(spS.lo * 1.04, spS.hi * 1.04, P.y + P.h - 2, P.y + 3);
    // eigene Daten sind unsortiert: Kollision gegen alle gesetzten Labels prüfen
    var free = (c.uc || c.uv) ? function (arr, y) {
      for (var q = 0; q < arr.length; q++) if (Math.abs(arr[q] - y) < c.fs) return false;
      arr.push(y); return true;
    } : null, usedL = [], usedR = [];
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.grid, 1);
    b += ln(P.x + P.w, P.y, P.x + P.w, P.y + P.h, c.C.grid, 1);
    if (c.lab) {
      b += txt(P.x, c.y0 + c.fsT * 0.85, kind, c.fsT, c.C.sub, 'middle', '600');
      b += txt(P.x + P.w, c.y0 + c.fsT * 0.85, c.main, c.fsT, c.C.sub, 'middle', '600');
    }
    var lastL = -1e9, lastR = -1e9;
    for (i = 0; i < cnt; i++) {
      var y1 = s(a[i]), y2 = s(z[i]), col = dcol(c, z[i] - a[i]);
      b += ln(P.x, y1, P.x + P.w, y2, col, c.small ? 1.1 : 1.5);
      b += circ(P.x, y1, c.small ? 1.3 : 1.8, c.C.paper, c.C.py, 1);
      b += circ(P.x + P.w, y2, c.small ? 1.3 : 1.9, c.C.ac);
      if (c.lab) {
        var nm = c.cat[i % c.cat.length];
        if (free ? free(usedL, y1) : y1 - lastL >= c.fs) {
          b += txt(P.x - 3, y1 + c.fs * 0.34, fit(c, nm + ' ' + vlbl(c, a[i]), sideW - 3), c.fs, c.C.txt, 'end');
          lastL = y1;
        }
        if (free ? free(usedR, y2) : y2 - lastR >= c.fs) {
          b += txt(P.x + P.w + 3, y2 + c.fs * 0.34, fit(c, vlbl(c, z[i]) + ' ' + nm, sideW - 3), c.fs, c.C.ink, 'start');
          lastR = y2;
        }
      }
    }
    return wrap(c, b);
  };

  /* ---- 8 · Linie mit Forecast-Korridor --------------------------------- */
  S.fan = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 7 : 12, split = Math.max(2, Math.round(cnt * 0.55));
    var ac = useVals(c, series(c, cnt, 64, 16));
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH, right: c.lab ? tw('P90', c.fs) + 4 : 0 });
    var sl = slots(P.x, P.w, cnt, 0.3);
    var lastV = ac[split - 1], i, hist = [], mid = [], u1 = [], d1 = [], u2 = [], d2 = [];
    var mxv = Math.max(maxOf(ac), lastV * 1.6) * 1.04;
    var s = sc(0, mxv, P.y + P.h, P.y + 2), yZ = P.y + P.h;
    if (c.real) {
      // echte Werte: Korridor symmetrisch um den Trend, Skala inkl. Minusbereich
      var spF = span(ac, [lastV * 1.18 + Math.abs(lastV) * 0.36, lastV * 1.18 - Math.abs(lastV) * 0.36]);
      s = sc(spF.lo * 1.04, (spF.hi * 1.04) || 1, P.y + P.h - (spF.lo < 0 ? 2 : 0), P.y + 2);
      yZ = s(0);
    }
    for (i = 0; i < split; i++) hist.push([sl[i].cx, s(ac[i])]);
    for (i = split - 1; i < cnt; i++) {
      var t = (i - split + 1) / Math.max(1, cnt - split);
      var v = lastV * (1 + t * 0.18), sp = (c.real ? Math.abs(lastV) : lastV) * t * 0.36;
      mid.push([sl[i].cx, s(v)]);
      u2.push([sl[i].cx, s(v + sp)]); d2.push([sl[i].cx, s(v - sp)]);
      u1.push([sl[i].cx, s(v + sp * 0.5)]); d1.push([sl[i].cx, s(v - sp * 0.5)]);
    }
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, 'AC · FC');
    b += polygonEl(u2.concat(d2.slice().reverse()), mix(c.C.py, c.C.paper, 0.6));
    b += polygonEl(u1.concat(d1.slice().reverse()), mix(c.C.py, c.C.paper, 0.25));
    b += baseH(c, P.x, P.x + P.w, yZ, 'AC', (sl[split - 1].cx + sl[Math.min(cnt - 1, split)].cx) / 2);
    b += polyline(hist, c.C.ac, c.small ? 1.4 : 1.8);
    b += polyline(mid, c.C.ac, c.small ? 1.1 : 1.4, '4 2.5');
    if (!c.small) {
      for (i = 0; i < hist.length; i++) b += circ(hist[i][0], hist[i][1], 1.5, c.C.ac);
      b += ln(sl[split - 1].cx, P.y, sl[split - 1].cx, P.y + P.h, c.C.hair, 0.8, '2 2');
    }
    if (c.lab) {
      var xe = sl[cnt - 1].cx + 3;
      var y90 = clamp(u2[u2.length - 1][1] + c.fs * 0.34, P.y + c.fs, P.y + P.h);
      var yFC = clamp(mid[mid.length - 1][1] + c.fs * 0.34, P.y + c.fs, P.y + P.h);
      var y10 = clamp(d2[d2.length - 1][1] + c.fs * 0.34, P.y + c.fs, P.y + P.h);
      if (c.real) {
        // echte Werte: enger Korridor → Beschriftungen auseinanderziehen
        y10 = Math.min(Math.max(y10, yFC + c.fs), P.y + P.h + c.fs * 0.3);
        yFC = Math.min(yFC, y10 - c.fs);
        y90 = Math.min(y90, yFC - c.fs);
      }
      b += txt(xe, y90, 'P90', c.fs, c.C.sub, 'start');
      b += txt(xe, yFC, 'FC', c.fs, c.C.ink, 'start', '600');
      b += txt(xe, y10, 'P10', c.fs, c.C.sub, 'start');
    }
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 9 · Z-Chart: Monat, kumuliert, gleitend 12 ---------------------- */
  S.zchart = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : 12;
    var capH = c.lab ? c.fsT + 4 : 0;
    var endW = c.lab ? tw(c.t.mat, c.fs) + 5 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH, right: endW });
    var sl = slots(P.x, P.w, cnt, 0.45), i;
    var mo = useVals(c, series(c, cnt, 30, 10)), cum = [], mat = [], run = 0;
    var avg = c.real ? sum(mo) / cnt : 30;
    for (i = 0; i < cnt; i++) { run += mo[i]; cum.push(n(run)); mat.push(n(run + avg * (cnt - i - 1) * (0.94 + c.rnd() * 0.06))); }
    var mx = Math.max(maxOf(cum), maxOf(mat)) * 1.04;
    var s = sc(0, mx, P.y + P.h, P.y + 2), yZ = P.y + P.h;
    var spZ = span(mo, cum, mat);
    if (spZ.lo < 0) { s = sc(spZ.lo * 1.04, (spZ.hi * 1.04) || 1, P.y + P.h, P.y + 2); yZ = s(0); }
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, c.t.month + ' · YTD · ' + c.t.mat);
    for (i = 0; i < cnt; i++) {
      b += spZ.lo < 0 ? rect(sl[i].x, Math.min(yZ, s(mo[i])), sl[i].w, Math.max(0.9, Math.abs(yZ - s(mo[i]))), c.C.py)
                      : rect(sl[i].x, s(mo[i]), sl[i].w, Math.max(0.9, P.y + P.h - s(mo[i])), c.C.py);
    }
    var pc = [], pm = [];
    for (i = 0; i < cnt; i++) { pc.push([sl[i].cx, s(cum[i])]); pm.push([sl[i].cx, s(mat[i])]); }
    b += polyline(pm, c.C.g2, c.small ? 1 : 1.3, '4 2.5');
    b += polyline(pc, c.C.ac, c.small ? 1.4 : 1.9);
    if (!c.small) b += circ(pc[cnt - 1][0], pc[cnt - 1][1], 2, c.C.ac);
    b += baseH(c, P.x, P.x + P.w, yZ, 'AC');
    if (c.lab) {
      var xe = sl[cnt - 1].cx + 3, yc = pc[cnt - 1][1], ym = pm[cnt - 1][1];
      if (Math.abs(yc - ym) < c.fs) ym = yc - c.fs;
      b += txt(xe, clamp(yc + c.fs * 1.1, P.y + c.fs, P.y + P.h), 'YTD', c.fs, c.C.ink, 'start', '600');
      b += txt(xe, clamp(ym - c.fs * 0.2, P.y + c.fs, P.y + P.h), c.t.mat, c.fs, c.C.sub, 'start');
    }
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 10 · Gestapelte Säulen ------------------------------------------ */
  S.stackcol = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 4 : (c.dense ? 12 : 6);
    var segs = c.small ? 2 : 3, cols = [c.C.ac, c.C.g2, c.C.g3];
    /* Eigene Daten: o.cats = Segmente (höchstens 3 Grautöne), o.values[j] =
       typischer Monatswert des Segments j; die Monatsachse bleibt. Gestapelt
       wird nur Positives (negative Werte zählen als 0).                     */
    if (c.uc || c.uv) segs = kcnt(c, segs, segs);
    var sv = c.uv ? useVals(c, [38, 24, 24].slice(0, segs)) : null;
    var tot = [], parts = [], i, j;
    for (i = 0; i < cnt; i++) {
      var row = [], t = 0;
      for (j = 0; j < segs; j++) {
        var v = n((j === 0 ? 30 : 16) + c.rnd() * 16 + i * 0.8);
        if (sv) v = Math.max(0, sv[j]) * (0.86 + c.rnd() * 0.24 + i * 0.012);
        row.push(v); t += v;
      }
      parts.push(row); tot.push(n(t));
    }
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.36);
    var showLbl = c.lab && sl[0].step >= (c.real ? vmaxW(c, tot) : tw('000', c.fs)) + 3 && P.h >= c.fs * 4.2;
    var inLbl = showLbl && sl[0].w >= (c.real ? vmaxW(c, [].concat.apply([], parts)) : tw('00', c.fs)) + 2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    var mx = maxOf(tot) * 1.02, s = sc(0, mx, P.y + P.h, P.y + lh);
    if (c.lab) {
      var lx = c.x0, nm = [c.cat[0], c.cat[1], c.cat[2]];
      for (j = 0; j < segs && lx < c.x1 - 20; j++) {
        var nmj = c.uc ? fit(c, nm[j], c.x1 - lx - c.fsT, c.fsT) : nm[j];
        b += rect(lx, c.y0 + c.fsT * 0.15, c.fsT * 0.7, c.fsT * 0.7, cols[j]);
        b += txt(lx + c.fsT, c.y0 + c.fsT * 0.85, nmj, c.fsT, c.C.sub, 'start');
        lx += c.fsT * 1.6 + tw(nmj, c.fsT);
      }
    }
    for (i = 0; i < cnt; i++) {
      var acc = 0;
      for (j = 0; j < segs; j++) {
        var y1 = s(acc), y2 = s(acc + parts[i][j]);
        b += rect(sl[i].x, y2, sl[i].w, Math.max(0.9, y1 - y2), cols[j % cols.length]);
        if (j) b += ln(sl[i].x, y1, sl[i].x + sl[i].w, y1, c.C.paper, 0.8);
        if (inLbl && y1 - y2 >= c.fs * 1.2) {
          b += txt(sl[i].cx, (y1 + y2) / 2 + c.fs * 0.34, vlbl(c, parts[i][j]), c.fs,
                   j === 0 ? c.C.paper : (j === 2 ? c.C.ink : c.C.paper), 'middle');
        }
        acc += parts[i][j];
      }
      if (showLbl) b += txt(sl[i].cx, s(tot[i]) - c.fs * 0.38, vlbl(c, tot[i]), c.fs, c.C.ink, 'middle', '600');
    }
    b += baseH(c, P.x, P.x + P.w, P.y + P.h, 'AC');
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* Gemeinsamer Säulen-Wasserfall: items = [{v, anchor, kind, lbl, bold}]
     anchor: Säule von 0 (Σ), sonst schwebende Δ-Säule ab dem laufenden
     Stand. Verbinder dünn in der Hilfslinienfarbe, Werte dunkel über der
     Säule (Δ mit Vorzeichen), Nulllinie dunkel.                            */
  function wfCols(c, P, items, hh, opt) {
    opt = opt || {};
    var cnt = items.length, i, run = 0, lo = 0, hi = 0, seg = [];
    for (i = 0; i < cnt; i++) {
      var it = items[i], from = it.anchor ? 0 : run, to = it.anchor ? it.v : n(run + it.v);
      seg.push({ from: from, to: to });
      run = to;
      lo = Math.min(lo, from, to); hi = Math.max(hi, from, to);
    }
    var sl = opt.slots || slots(P.x, P.w, cnt, 0.38);
    var wmax = 0;
    for (i = 0; i < cnt; i++) wmax = Math.max(wmax, tw(items[i].anchor ? vlbl(c, items[i].v) : dvlbl(c, items[i].v), c.fs));
    var showLbl = opt.labels !== false && c.lab && sl[0].step >= wmax + 2 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    var s = sc(lo, hi * 1.02, P.y + P.h - (lo < 0 ? lh : 0), P.y + lh), b = '';
    for (i = 0; i < cnt; i++) {
      var it2 = items[i], sg = seg[i];
      var yT = s(Math.max(sg.from, sg.to)), yB = s(Math.min(sg.from, sg.to));
      var hgt = Math.max(1, yB - yT);
      if (it2.anchor) {
        b += (it2.kind && it2.kind !== 'AC') ? refShape(c, sl[i].x, yT, sl[i].w, hgt, it2.kind, hh)
                                              : rect(sl[i].x, yT, sl[i].w, hgt, c.C.ac);
      }
      if (!it2.anchor) {
        var col = dcol(c, it2.v);
        b += it2.fc ? rect(sl[i].x, yT, sl[i].w, hgt, dFill(c, hh, it2.v, sl[i].w), col, 0.8) : rect(sl[i].x, yT, sl[i].w, hgt, col);
      }
      if (i < cnt - 1) {
        var yc = s(sg.to);
        b += ln(sl[i].x + sl[i].w, yc, sl[i + 1].x, yc, c.C.hair, 0.8);
      }
      if (showLbl) {
        var up = it2.anchor ? it2.v >= 0 : it2.v >= 0;
        b += txt(sl[i].cx, up ? yT - c.fs * 0.38 : yB + c.fs * 0.95,
                 it2.anchor ? vlbl(c, it2.v) : dvlbl(c, it2.v), c.fs, c.C.ink, 'middle',
                 it2.anchor ? '600' : null, c.C.paper);
      }
    }
    b += baseH(c, P.x, P.x + P.w, s(0), 'AC');
    return { body: b, slots: sl, scale: s, seg: seg };
  }

  /* ---- 11 · Wasserfall, vertikal: Strukturbeiträge bis Σ ---------------- */
  S.waterfall = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var mids = kcnt(c, c.small ? 3 : (c.dense ? 7 : 5), capN(c, 3, 22, 3, 16)), i;
    var items = [];
    var base = [42, 26, 18, 12, 9, 7, 5];
    for (i = 0; i < mids; i++) {
      var neg = (i >= mids - (c.small ? 1 : 2));
      var v = n((base[i % base.length] * (0.8 + c.rnd() * 0.4)) * (neg ? -0.55 : 1));
      items.push({ v: v, lbl: c.cat[i % c.cat.length] });
    }
    if (c.uv) {
      // o.values = Beiträge je Kategorie (mit Vorzeichen), Σ = Summe
      var wv = [];
      for (i = 0; i < mids; i++) wv.push(items[i].v);
      wv = useVals(c, wv);
      for (i = 0; i < mids; i++) items[i].v = wv[i];
    }
    var tot = 0; for (i = 0; i < mids; i++) tot += items[i].v;
    items.push({ v: n(tot), anchor: true, kind: 'AC', lbl: 'Σ' });
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH });
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, c.main);
    var r = wfCols(c, P, items, hh);
    b += r.body;
    var nm = [], bold = [];
    for (i = 0; i < items.length; i++) { nm.push(items[i].lbl); bold.push(!!items[i].anchor); }
    b += monLabels(c, r.slots, c.y1 - 0.5, nm, bold);
    return wrap(c, b);
  };

  /* ---- 12 · Brücke: Σ Referenz -> Δ je Kategorie -> Σ AC ---------------- */
  S.bridge = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var kind = refKind(c) || 'PY';
    var mids = kcnt(c, c.small ? 3 : (c.dense ? 7 : 5), capN(c, 3, 22, 3, 16)), i;
    var start = 100, items = [{ v: start, anchor: true, kind: kind, lbl: kind }], run = start;
    if (c.uv) {
      /* o.values = AC je Kategorie, o.refValues = Bezug je Kategorie:
         Σ Bezug → Δ (AC − Bezug) je Kategorie → Σ AC                        */
      var acB = useVals(c, vals(c, mids, 40, 30)), rfB = useRef(c, derive(c, acB, 0.86, 1.12));
      start = sum(rfB); items[0].v = start; run = start;
      for (i = 0; i < mids; i++) {
        var dB = n(acB[i] - rfB[i]);
        items.push({ v: dB, lbl: c.cat[i % c.cat.length] });
        run += dB;
      }
    } else for (i = 0; i < mids; i++) {
      var d = n((c.rnd() - 0.4) * 16);
      items.push({ v: d, lbl: c.cat[i % c.cat.length] });
      run += d;
    }
    items.push({ v: n(run), anchor: true, kind: 'AC', lbl: c.main });
    var dT = n(run - start);
    var calloutW = (c.lab && c.w >= 260) ? tw(dvlbl(c, dT), c.fs) + c.fs * 1.2 + 10 : 0;
    var capH = c.lab ? c.fsT + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH, right: calloutW });
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, kind + ' → ' + c.main);
    var r = wfCols(c, P, items, hh);
    b += r.body;
    if (calloutW) {
      var yS = r.scale(start), yE = r.scale(run), last = r.slots[r.slots.length - 1];
      var xv = last.x + last.w + 4;
      b += ln(last.x + last.w, yS, xv + 3, yS, c.C.hair, 0.8);
      b += rect(xv, Math.min(yS, yE), 3, Math.max(1, Math.abs(yE - yS)), dcol(c, dT));
      b += pill(c, xv + 5 + (calloutW - 8) / 2, (yS + yE) / 2 - c.fs * 1.4, dvlbl(c, dT), dcol(c, dT), xv + 4, c.x1);
    }
    var nm = [], bold = [];
    for (i = 0; i < items.length; i++) { nm.push(items[i].lbl); bold.push(!!items[i].anchor); }
    b += monLabels(c, r.slots, c.y1 - 0.5, nm, bold);
    return wrap(c, b);
  };

  /* ---- 13 · Integrierte Varianzanalyse (Modus „intwaterfall") -----------
     Links Σ Referenz (PL weiß mit Kontur / PY grau, zweites Szenario davor),
     in der Mitte je Monat ein schwebendes Δ-Segment auf Höhe der Summen
     (die Brücke Referenz → AC+FC) und unten die Monatssäulen (Referenz
     versetzt dahinter), rechts die gestapelte Σ-Säule AC + FC schraffiert,
     daneben der Netto-Δ-Balken mit Plakette. Oben die Δ%-Pins (dunkle
     quadratische Köpfe, Forecast offen) auf breiter grauer Achse.           */
  S.varint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var kind = refKind(c) || 'PL';
    var cnt = kcnt(c, c.small ? 4 : (c.dense || c.w >= 560 ? 12 : 6), capN(c, 4, 22, 4, 24)), i;
    var ac = useVals(c, series(c, cnt, 70, 20)), bs = useRef(c, derive(c, ac, 0.93, 1.13));
    var sec = c.sec ? derive(c, ac, 0.86, 1.1) : null;
    var d = diffs(ac, bs), rel = rels(ac, bs);
    var fcAt = fcStart(c, cnt);
    var basisSum = sum(bs), vTot = sum(ac), acTot = 0, secSum = sec ? sum(sec) : 0;
    for (i = 0; i < cnt; i++) if (i < fcAt) acTot += ac[i];
    acTot = n(acTot);
    var fcTot = n(vTot - acTot), dTot = n(vTot - basisSum), pctTot = basisSum ? dTot / Math.abs(basisSum) * 100 : 0;
    var lab = c.lab;
    var labH = lab ? c.fsA + 5 : 0, capH = lab ? c.fsT + 4 : 0;
    var yBase = c.y1 - labH;
    var showPins = c.vRel && !c.small && c.h >= 150 * c.lk;
    var pinArea = showPins ? Math.max(c.fs * 4.6, c.ih * 0.25) : (lab ? c.fs * 0.6 : 1);
    var plotTop = c.y0 + (showPins ? pinArea : 0) + (lab && !showPins ? capH : 0);
    var left = c.x0, right = c.x1;
    var pillTxt = dvlbl(c, dTot);
    var calloutW = c.vAbs ? (lab && c.w >= 250 ? tw(pillTxt, c.fs) + c.fs * 1.2 + 9 : 6) : 0;
    var sideW = (lab && fcTot > 0) ? tw('FC', c.fs) + 3 : 0;
    var totW = clamp(c.iw * 0.065, 6, 30);
    var two = !!sec;
    var bandStart = left + totW + (two ? totW + 3 : 0) + 5;
    var bandEnd = right - calloutW - sideW - totW - 5;
    var step = Math.max(2, (bandEnd - bandStart) / cnt);
    var segW = step * 0.62, colW = step * 0.34;
    function cx(k2) { return bandStart + step * k2 + step / 2; }
    var xT = bandEnd + 4;
    var maxTot = Math.max(basisSum, vTot, secSum, 1);
    var S2 = sc(0, maxTot * 1.01, yBase, plotTop + (lab ? c.fs * 1.4 : 2));
    var maxMon = Math.max(maxOf(ac), maxOf(bs), sec ? maxOf(sec) : 0);
    var miniH = Math.max(4, (yBase - plotTop) * 0.34);
    function BS(v) { return n(v / maxMon * miniH); }
    /* Negative Summen (nur mit o.values): Σ-Säulen und Brücke stehen auf
       einer eigenen Nulllinie yZ0; die Monatssäulen zeigen Beträge.        */
    var loT = 0, yZ0 = yBase, lv = basisSum;
    if (c.real) {
      loT = Math.min(0, basisSum, vTot, secSum, acTot);
      var hiT = maxTot;
      for (i = 0; i < cnt; i++) { lv += d[i]; loT = Math.min(loT, lv); hiT = Math.max(hiT, lv); }
      if (loT < 0 || hiT > maxTot) {
        maxTot = hiT;
        S2 = sc(loT * 1.01, maxTot * 1.01, yBase - (loT < 0 ? (lab ? c.fs * 1.2 : 1) : 0), plotTop + (lab ? c.fs * 1.4 : 2));
      }
      if (loT < 0) yZ0 = S2(0);
      BS = function (v) { return n(Math.abs(v) / maxMon * miniH); };
    }
    var slM = [];
    for (i = 0; i < cnt; i++) slM.push({ cx: n(cx(i)), step: n(step), x: n(cx(i) - segW / 2), w: n(segW) });

    // Δ%-Pins oben
    if (showPins) {
      var pinTop = c.y0 + capH, axisY = pinTop + (pinArea - capH) * 0.5;
      var maxPct = Math.max(maxOf(rel), Math.abs(pctTot), 1);
      var r = clamp(step * 0.08, 1.5, 2.8);
      var pinMax = Math.max(3, (pinArea - capH) * 0.5 - (lab ? c.fs * 1.25 : 1) - r - 1);
      b += layerCap(c, left, c.y0 + c.fsT * 0.85, 'Δ' + kind + ' %');
      b += ln(bandStart - 3, axisY, bandEnd + 3, axisY, c.C.py, 2.4);
      b += ln(xT - 2, axisY, xT + totW + 2, axisY, c.C.py, 2.4);
      var pin = function (x, pct, hollow) {
        var hh2 = Math.max(1.5, Math.abs(pct) / maxPct * pinMax);
        var yE = pct >= 0 ? axisY - hh2 : axisY + hh2;
        var col = dcol(c, pct), s3 = '';
        s3 += ln(x, axisY, x, yE, col, 1.6);
        s3 += hollow ? rect(x - r, yE - r, r * 2, r * 2, c.C.paper, c.C.ink, 0.9) : rect(x - r, yE - r, r * 2, r * 2, c.C.ink);
        if (lab && step >= tw(plbl(c, pct), c.fs) + 2) {
          s3 += txt(x, pct >= 0 ? yE - r - 2 : yE + r + c.fs * 0.85, plbl(c, pct), c.fs, c.C.ink, 'middle', null, c.C.paper);
        }
        return s3;
      };
      for (i = 0; i < cnt; i++) b += pin(cx(i), rel[i], i >= fcAt);
      b += pin(xT + totW / 2, pctTot, true);
    } else if (lab) {
      b += layerCap(c, left, c.y0 + c.fsT * 0.85, kind + ' → ' + c.main + (fcTot > 0 ? '/FC' : ''));
    }

    // AC | FC-Trennung
    if (fcAt > 0 && fcAt < cnt) {
      var xs = cx(fcAt) - step / 2;
      b += ln(xs, plotTop - (showPins ? pinArea * 0.3 : 0), xs, yBase + labH * 0.5, c.C.ink, 0.9);
    }

    // Σ-Säulen links: zweites Szenario außen, dann der Bezug
    var yB = S2(basisSum), yV = S2(vTot);
    var xBasis = two ? left + totW + 3 : left;
    function total(x, s4, k3) {
      var yt = S2(s4), out = loT < 0 ? refShape(c, x, Math.min(yt, yZ0), totW, Math.max(1, Math.abs(yZ0 - yt)), k3, hh)
                                     : refShape(c, x, yt, totW, Math.max(1, yBase - yt), k3, hh);
      var tl4 = vlbl(c, s4), tx4 = x + totW / 2;
      if (c.real) tx4 = clamp(tx4, c.x0 + tw(tl4, c.fs) / 2, c.x1 - tw(tl4, c.fs) / 2);
      if (lab && totW >= tw(tl4, c.fs) * 0.7) out += txt(tx4, Math.min(yt, yZ0) - c.fs * 0.38, tl4, c.fs, c.C.ink, 'middle', null, c.C.paper);
      if (lab) out += txt(x + totW / 2, c.y1 - 0.5, k3, c.fsA, c.C.txt, 'middle');
      return out;
    }
    if (two) b += total(left, secSum, c.sec);
    b += total(xBasis, basisSum, kind);

    // Hilfslinien auf Höhe von Σ Bezug und Σ AC+FC
    b += ln(xBasis + totW, yB, xT + totW, yB, c.C.py, 1);
    if (c.vAbs) b += ln(cx(cnt - 1) + segW / 2, yV, xT, yV, c.C.py, 1);

    // Brücke und Monatssäulen
    var level = basisSum;
    var showSegL = lab && c.vAbs;
    for (i = 0; i < cnt; i++) {
      var x = cx(i);
      if (c.vAbs) {
        var prev = level; level = n(level + d[i]);
        var yTop = S2(Math.max(prev, level)), hS = Math.max(2.2, Math.abs(S2(prev) - S2(level)));
        var col = dcol(c, d[i]);
        b += ln(i === 0 ? xBasis + totW : cx(i - 1) + segW / 2, S2(prev), x - segW / 2, S2(prev), c.C.hair, 0.8);
        b += i >= fcAt ? rect(x - segW / 2, yTop, segW, hS, dFill(c, hh, d[i], Math.min(segW, hS)), col, 0.8)
                       : rect(x - segW / 2, yTop, segW, hS, col);
        if (showSegL && step >= tw(dvlbl(c, d[i]), c.fs) + 2) {
          b += txt(x, d[i] >= 0 ? yTop - 2.5 : yTop + hS + c.fs * 0.9, dvlbl(c, d[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
        }
      }
      // Monatssäulen: Bezug links dahinter, AC/FC davor
      var hb = BS(bs[i]), ha = BS(ac[i]);
      b += refShape(c, x - colW * 0.8, yBase - hb, colW, Math.max(0.8, hb), kind, hh);
      b += i >= fcAt ? rect(x - colW * 0.2, yBase - ha, colW, Math.max(0.8, ha), fcFill(c, hh, colW), c.C.ac, 0.8)
                     : rect(x - colW * 0.2, yBase - ha, colW, Math.max(0.8, ha), c.C.ac);
      if (sec) {
        var ms = clamp(colW * 0.5, 1.6, 4);
        var tipX = x - colW * 0.8;
        if (tipX - ms >= left) b += triRight(c, tipX, clamp(yBase - BS(sec[i]), yBase - miniH - 2, yBase - ms), ms, c.sec);
      }
      if (lab && step >= tw(vlbl(c, ac[i]), c.fs) + 3 && miniH >= c.fs * 2.4) {
        b += txt(x, yBase - Math.max(ha, hb) - c.fs * 0.38, vlbl(c, ac[i]), c.fs, c.C.ink, 'middle', null, c.C.paper);
      }
    }
    b += ln(left, yBase, xT + totW + 2, yBase, c.C.axis, 1.3);

    // Σ AC + FC rechts
    var acH = Math.max(0.8, yBase - S2(acTot));
    if (loT < 0) {
      b += rect(xT, Math.min(yZ0, S2(acTot)), totW, Math.max(0.8, Math.abs(yZ0 - S2(acTot))), c.C.ac);
      if (fcTot !== 0) b += rect(xT, Math.min(S2(acTot), S2(vTot)), totW, Math.max(0.8, Math.abs(S2(acTot) - S2(vTot))), fcFill(c, hh, totW), c.C.ac, 0.9);
      b += ln(xT - 2, yZ0, xT + totW + 2, yZ0, c.C.axis, 1);
    } else b += rect(xT, yBase - acH, totW, acH, c.C.ac);
    if (fcTot > 0 && loT >= 0) {
      var fcH = Math.max(0.8, S2(acTot) - S2(vTot));
      b += rect(xT, yBase - acH - fcH, totW, fcH, fcFill(c, hh, totW), c.C.ac, 0.9);
      if (sideW) {
        if (fcH >= c.fs) b += txt(xT + totW + 2, yBase - acH - fcH / 2 + c.fs * 0.34, 'FC', c.fs, c.C.sub, 'start');
        if (acH >= c.fs) b += txt(xT + totW + 2, yBase - acH / 2 + c.fs * 0.34, 'AC', c.fs, c.C.sub, 'start');
      }
    }
    if (lab && totW >= tw(vlbl(c, vTot), c.fs) * 0.7) b += txt(xT + totW / 2, Math.min(yV, yZ0) - c.fs * 0.38, vlbl(c, vTot), c.fs, c.C.ink, 'middle', '600', c.C.paper);
    if (lab) {
      var tl = fcTot > 0 && c.main !== 'FC' ? c.main + '+FC' : c.main;
      if (tw(tl, c.fsA) > totW + sideW + 6) tl = 'Σ';
      b += txt(clamp(xT + totW / 2, 0, c.x1 - tw(tl, c.fsA) / 2), c.y1 - 0.5, tl, c.fsA, c.C.ink, 'middle', '600');
    }

    // Netto-Abweichung: schmaler Balken zwischen den Hilfslinien plus Plakette
    if (c.vAbs) {
      var xv = xT + totW + sideW + 2;
      b += rect(xv, Math.min(yB, yV), 3, Math.max(1.5, Math.abs(yV - yB)), dcol(c, dTot));
      if (lab && calloutW > 8) b += pill(c, xv + 4 + (calloutW - 6) / 2, clamp((yB + yV) / 2 + c.fs * 1.6, plotTop + c.fs, yBase - c.fs), pillTxt, dcol(c, dTot), xv + 4, c.x1);
    }

    // Monatsnamen (bzw. eigene Kategorien)
    b += monLabels(c, slM, c.y1 - 0.5, c.uc ? c.cat : undefined);
    return wrap(c, b);
  };

  /* ---- 14 · Horizontale Balken, sortiert (Balkenmodus) ------------------ */
  function barsBlock(c, P, ac, rf, sec, kind, hh, rw, opt) {
    opt = opt || {};
    var b = '', i, cnt = ac.length;
    var rg = rowGeom(c, rw, kind, !!rf);
    var wv = (c.real ? vmaxW(c, ac) : tw(lbl(c, maxOf(ac), 0), c.fs)) + 4;
    var showV = opt.labels !== false && c.lab && rw[0].step >= c.fs * 1.05;
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0, sec ? maxOf(sec) : 0) * 1.02;
    var allFC = (c.main === 'FC');
    var sp = span(ac, rf, sec), s;
    if (sp.lo < 0) {
      // Negative Werte (nur mit o.values): Nulllinie im Inneren, Wert außen
      if (showV && P.w < wv * 2 + 20) showV = false;
      s = sc(sp.lo * 1.02, sp.hi * 1.02, P.x + (showV ? wv : 0), P.x + Math.max(4, P.w - (showV && sp.hi > 0 ? wv : 0)));
      var z = s(0);
      for (i = 0; i < cnt; i++) {
        var xR = null;
        if (rf && kind) {
          xR = s(rf[i]);
          b += refShape(c, Math.min(z, xR), rw[i].cy - rg.dy - rg.rh / 2, Math.max(0.9, Math.abs(xR - z)), rg.rh, kind, hh);
        }
        var xA = s(ac[i]), bx2 = Math.min(z, xA), bw2 = Math.max(0.9, Math.abs(xA - z)), by2 = rw[i].cy + rg.dy - rg.bh / 2;
        b += allFC ? rect(bx2, by2, bw2, rg.bh, fcFill(c, hh, rg.bh), c.C.ac, 0.8) : rect(bx2, by2, bw2, rg.bh, c.C.ac);
        if (sec) {
          var ms2 = clamp(rg.step * 0.2, 1.6, 4);
          var yTop2 = rw[i].cy - (rg.dy + rg.rh / 2);
          if (yTop2 - ms2 >= c.y0 - 0.5) b += triDown(c, clamp(s(sec[i]), P.x + ms2, P.x + P.w - ms2), yTop2, ms2, c.sec);
        }
        if (showV) {
          b += ac[i] >= 0
            ? txt(Math.max(xA, xR == null ? xA : xR) + 3, rw[i].cy + c.fs * 0.34, vlbl(c, ac[i]), c.fs, c.C.ink, 'start')
            : txt(Math.min(xA, xR == null ? xA : xR) - 3, rw[i].cy + c.fs * 0.34, vlbl(c, ac[i]), c.fs, c.C.ink, 'end');
        }
      }
      b += baseV(c, rw[0].y - 2, rw[cnt - 1].y + rw[cnt - 1].h + 2, z, 'AC');
      return b;
    }
    s = sc(0, mx, P.x, P.x + Math.max(4, P.w - (showV ? wv : 0)));
    for (i = 0; i < cnt; i++) {
      if (rf && kind) {
        b += refShape(c, P.x, rw[i].cy - rg.dy - rg.rh / 2, Math.max(0.9, s(rf[i]) - P.x), rg.rh, kind, hh);
      }
      var bw = Math.max(0.9, s(ac[i]) - P.x), by = rw[i].cy + rg.dy - rg.bh / 2;
      b += allFC ? rect(P.x, by, bw, rg.bh, fcFill(c, hh, rg.bh), c.C.ac, 0.8) : rect(P.x, by, bw, rg.bh, c.C.ac);
      if (sec) {
        var ms = clamp(rg.step * 0.2, 1.6, 4);
        var yTop = rw[i].cy - (rg.dy + rg.rh / 2);
        if (yTop - ms >= c.y0 - 0.5) b += triDown(c, clamp(s(sec[i]), P.x + ms, P.x + P.w - ms), yTop, ms, c.sec);
      }
      if (showV) b += txt(Math.max(s(ac[i]), rf ? s(rf[i]) : 0) + 3, rw[i].cy + c.fs * 0.34, vlbl(c, ac[i]), c.fs, c.C.ink, 'start');
    }
    b += baseV(c, rw[0].y - 2, rw[cnt - 1].y + rw[cnt - 1].h + 2, P.x, 'AC');
    return b;
  }

  S.bars = function (w, h, o) {
    if (o && o.look === 'native') return S.nbar(w, h, o);
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 9 : 6), capR(c, 3, 11, 3, 20));
    var kind = refKind(c);
    var ac = useVals(c, sortDesc(vals(c, cnt, 64, 60))), rf = kind ? useRef(c, derive(c, ac, 0.84, 1.16)) : null;
    var sec = (kind && c.sec) ? derive(c, ac, 0.86, 1.12) : null;
    var dOn = !!rf && c.lab && (c.vAbs || c.vRel), dRel = dOn && c.vRel, i;
    var dv = [];
    for (i = 0; i < cnt && rf; i++) dv.push(dRel ? n(rf[i] ? (ac[i] - rf[i]) / Math.abs(rf[i]) * 100 : 0) : n(ac[i] - rf[i]));
    var dW = 0;
    for (i = 0; i < dv.length && dOn; i++) dW = Math.max(dW, tw(dRel ? plbl(c, dv[i]) : dvlbl(c, dv[i]), c.fs));
    if (dOn) dW = Math.max(dW, tw('Δ' + kind + ' %', c.fsT)) + 6;
    var labW = c.lab ? labWid(c, cnt, Math.min(c.iw * 0.24, tw('Service', c.fsA) + 5)) : 0;
    var headH = c.lab ? c.fsT + 5 : 0;
    var P = area(c, { left: labW, right: dW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.3);
    if (c.lab) b += txt(P.x, c.y0 + c.fsT * 0.85, scenCap(c, kind), c.fsT, c.C.sub, 'start');
    b += barsBlock(c, P, ac, rf, sec, kind, hh, rw);
    for (i = 0; i < cnt; i++) {
      if (c.lab) b += rowLabel(c, P.x - 4, rw[i].cy, c.cat[i % c.cat.length], labW - 4);
      if (dOn) b += txt(c.x1, rw[i].cy + c.fs * 0.34, dRel ? plbl(c, dv[i]) : dvlbl(c, dv[i]), c.fs, dcol(c, dv[i]), 'end', '600');
    }
    if (dOn) b += txt(c.x1, c.y0 + c.fsT * 0.85, 'Δ' + kind + (dRel ? ' %' : ''), c.fsT, c.C.sub, 'end');
    return wrap(c, b);
  };

  /* ---- 15 · Bullet-Balken mit Zielmarke -------------------------------- */
  S.bullet = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 2 : (c.dense ? 7 : 4), capR(c, 2, 13, 2, 14));
    var labW = c.lab ? labWid(c, cnt, Math.min(c.iw * 0.24, tw('Service', c.fsA) + 5)) : 0;
    var valW = c.lab ? tw('+00%', c.fs) + 6 : 0;
    /* Eigene Daten: o.values = AC, o.refValues = Ziel je Zeile; Balken ab 0
       (negative Werte als leerer Balken, Beschriftung mit Vorzeichen).     */
    var bv = null, bt = null, bmx = 1, i;
    if (c.uv) {
      bv = useVals(c, vals(c, cnt, 60, 40)); bt = useRef(c, derive(c, bv, 0.9, 1.25));
      bmx = Math.max(maxOf(bv), maxOf(bt)) * 1.15;
      if (c.lab && !c.vRel) {
        valW = 0;
        for (i = 0; i < cnt; i++) valW = Math.max(valW, tw(dvlbl(c, bv[i] - bt[i]), c.fs));
        valW += 6;
      }
    }
    var headH = c.lab ? c.fsT + 5 : 0;
    var P = area(c, { left: labW, right: valW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.3);
    for (i = 0; i < cnt; i++) {
      var v = 0.45 + c.rnd() * 0.5, t = 0.55 + c.rnd() * 0.35;
      if (bv) { v = Math.max(0, bv[i] / bmx); t = Math.max(0, bt[i] / bmx); }
      var bh = rw[i].h * 0.42;
      b += rect(P.x, rw[i].y, P.w, rw[i].h, c.C.wash);
      b += rect(P.x, rw[i].y, P.w * 0.85 * 0.999, rw[i].h, mix(c.C.wash, c.C.py, 0.25));
      b += rect(P.x, rw[i].y, P.w * 0.6, rw[i].h, mix(c.C.wash, c.C.py, 0.5));
      b += rect(P.x, rw[i].cy - bh / 2, Math.max(0.9, P.w * Math.min(1, v)), bh, c.C.ac);
      var tx = P.x + P.w * Math.min(1, t);
      b += ln(tx, rw[i].y + rw[i].h * 0.12, tx, rw[i].y + rw[i].h * 0.88, c.C.ink, 1.8);
      if (c.lab) {
        var d = c.vRel ? n((v / t - 1) * 100) : n((v - t) * 100);
        if (bv) d = c.vRel ? n(bt[i] ? (bv[i] - bt[i]) / Math.abs(bt[i]) * 100 : 0) : n(bv[i] - bt[i]);
        b += rowLabel(c, P.x - 4, rw[i].cy, c.cat[i % c.cat.length], labW - 4);
        if (c.vRel || c.vAbs) {
          b += txt(c.x1, rw[i].cy + c.fs * 0.34, c.vRel ? plbl(c, d) : dvlbl(c, d), c.fs, dcol(c, d), 'end', '600');
        }
      }
    }
    if (c.lab) b += txt(P.x, c.y0 + c.fsT * 0.85, c.main + ' ' + c.t.vs + ' ' + c.t.target, c.fsT, c.C.sub, 'start');
    return wrap(c, b);
  };

  /* ---- 16 · Pareto: Säulen plus Summenlinie ---------------------------- */
  S.pareto = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 5 : (c.dense ? 10 : 7), capN(c, 5, 16));
    var v = sortDesc(vals(c, cnt, 40, 70)), tot = 0, i, names = c.cat;
    if (c.uv) {
      /* Pareto sortiert absteigend: Werte (negative als 0) samt Namen */
      var pv = useVals(c, v), ix = [];
      for (i = 0; i < cnt; i++) ix.push(i);
      ix.sort(function (p1, p2) { return Math.max(0, pv[p2]) - Math.max(0, pv[p1]) || p1 - p2; });
      v = []; names = [];
      for (i = 0; i < cnt; i++) { v.push(Math.max(0, pv[ix[i]])); names.push(c.cat[ix[i] % c.cat.length]); }
    }
    for (i = 0; i < cnt; i++) tot += v[i];
    var capH = c.lab ? c.fsT + 4 : 0;
    var rW = c.lab ? tw('100%', c.fs) + 4 : 0;
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: capH, right: rW });
    var sl = slots(P.x, P.w, cnt, 0.3), acc = 0, pts = [];
    var s = sc(0, maxOf(v) * 1.08, P.y + P.h, P.y + P.h * 0.25);
    var sp = sc(0, 100, P.y + P.h, P.y + 3);
    b += layerCap(c, c.x0, c.y0 + c.fsT * 0.85, c.main + ' · ' + c.t.cumul);
    for (i = 0; i < cnt; i++) {
      b += rect(sl[i].x, s(v[i]), sl[i].w, Math.max(0.9, P.y + P.h - s(v[i])), i < Math.ceil(cnt * 0.4) ? c.C.ac : c.C.py);
      acc += v[i];
      pts.push([sl[i].cx, sp(acc / (tot || 1) * 100)]);
    }
    b += ln(P.x, sp(80), P.x + P.w, sp(80), c.C.hair, 0.8, '3 2');
    b += baseH(c, P.x, P.x + P.w, P.y + P.h, 'AC');
    b += polyline(pts, c.C.ink, c.small ? 1.1 : 1.4);
    if (!c.small) for (i = 0; i < pts.length; i++) b += circ(pts[i][0], pts[i][1], 1.6, c.C.paper, c.C.ink, 1);
    if (c.lab) {
      b += txt(P.x + P.w + 3, sp(80) + c.fs * 0.34, '80%', c.fs, c.C.sub, 'start');
      b += txt(P.x + P.w + 3, sp(100) + c.fs * 0.34 + 1, '100%', c.fs, c.C.sub, 'start');
    }
    b += monLabels(c, sl, c.y1 - 0.5, names);
    return wrap(c, b);
  };

  /* ---- 17 · Dumbbell: Referenz offen, AC gefüllt ------------------------ */
  S.dotplot = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 11, 3, 20));
    var kind = refKind(c);
    var labW = c.lab ? labWid(c, cnt, Math.min(c.iw * 0.26, tw('Service', c.fsA) + 5)) : 0;
    var headH = c.lab ? c.fsT + 5 : 0;
    var P = area(c, { left: labW, right: 4, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.2), i;
    var r = c.small ? 1.8 : clamp(rw[0].step * 0.16, 2, 3.6);
    var ac = useVals(c, sortDesc(vals(c, cnt, 60, 60))), rf = kind ? useRef(c, derive(c, ac, 0.85, 1.15)) : null;
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0) * 1.05;
    var s = sc(0, mx, P.x + r + 1, P.x + P.w - r - 1 - (c.lab ? tw('000', c.fs) + 3 : 0)), xZ = P.x;
    if (c.real) {
      var spD = span(ac, rf), rwD = c.lab ? vmaxW(c, ac) + 3 : 0;
      s = sc(spD.lo * 1.05, spD.hi * 1.05 || 1, P.x + r + 1, P.x + Math.max(r + 4, P.w - r - 1 - rwD));
      if (spD.lo < 0) xZ = s(0);
    }
    if (c.lab) b += txt(P.x, c.y0 + c.fsT * 0.85, kind ? kind + ' → ' + c.main : c.main, c.fsT, c.C.sub, 'start');
    for (i = 0; i < cnt; i++) {
      var xa = s(ac[i]), cy = rw[i].cy;
      var col = rf ? dcol(c, ac[i] - rf[i]) : c.C.ac;
      if (rf) {
        var xr = s(rf[i]);
        b += ln(xr, cy, xa, cy, mix(col, c.C.paper, 0.4), r * 0.9);
        b += circ(xr, cy, r, c.C.paper, c.C.ink, 1);
      }
      b += circ(xa, cy, r, col);
      if (c.lab) {
        b += rowLabel(c, P.x - 4, cy, c.cat[i % c.cat.length], labW - 4);
        b += txt(Math.max(xa, rf ? s(rf[i]) : xa) + r + 3, cy + c.fs * 0.34, vlbl(c, ac[i]), c.fs, c.C.ink, 'start');
      }
    }
    b += baseV(c, P.y, P.y + P.h, xZ, kind || 'AC');
    return wrap(c, b);
  };

  /* ---- 18 · Tornado ---------------------------------------------------- */
  S.tornado = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 10, 3, 20));
    var headH = c.lab ? c.fsT + 5 : 0;
    var P = area(c, { top: headH });
    var mid = P.x + P.w / 2, vw = c.lab ? tw('00', c.fs) + 4 : 0;
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i;
    var kind = refKind(c) || 'PY';
    // Eigene Daten: rechts o.values (Hauptszenario), links o.refValues (Bezug), Längen nach Betrag
    var tR = null, tL = null, tM = 1;
    if (c.uv) {
      tR = useVals(c, sortDesc(vals(c, cnt, 60, 50))); tL = useRef(c, derive(c, tR, 0.8, 1.15));
      tM = Math.max(maxOf(tR), maxOf(tL));
      if (c.lab) vw = Math.max(vmaxW(c, tR), vmaxW(c, tL)) + 4;
      if (vw > P.w * 0.3) vw = 0;
    }
    if (c.lab) {
      b += txt(mid - 3, c.y0 + c.fsT * 0.85, kind, c.fsT, c.C.sub, 'end');
      b += txt(mid + 3, c.y0 + c.fsT * 0.85, c.main, c.fsT, c.C.sub, 'start');
    }
    for (i = 0; i < cnt; i++) {
      var f = 1 - i / (cnt + 1);
      var l = (P.w / 2 - vw) * f * (0.55 + c.rnd() * 0.45);
      var r = (P.w / 2 - vw) * f * (0.55 + c.rnd() * 0.45);
      if (tR) { l = (P.w / 2 - vw) * Math.abs(tL[i]) / tM; r = (P.w / 2 - vw) * Math.abs(tR[i]) / tM; }
      b += rect(mid - l, rw[i].y, Math.max(0.9, l), rw[i].h, c.C.py);
      b += rect(mid, rw[i].y, Math.max(0.9, r), rw[i].h, c.C.ac);
      if (c.lab && rw[i].h >= c.fs * 0.9 && vw > 0) {
        b += txt(mid - l - 2, rw[i].cy + c.fs * 0.34, tR ? vlbl(c, tL[i]) : lbl(c, l / 2, 0), c.fs, c.C.ink, 'end');
        b += txt(mid + r + 2, rw[i].cy + c.fs * 0.34, tR ? vlbl(c, tR[i]) : lbl(c, r / 2, 0), c.fs, c.C.ink, 'start');
      }
    }
    b += ln(mid, P.y, mid, P.y + P.h, c.C.axis, 1.2);
    return wrap(c, b);
  };

  /* ---- 19 · Balken-Kombi: Balken · Δabs · Δ% nebeneinander -------------- */
  S.barskombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 9 : 6), capR(c, 3, 11, 3, 20));
    var kind = refKind(c) || 'PL';
    var ac = useVals(c, sortDesc(vals(c, cnt, 64, 60))), pl = useRef(c, derive(c, ac, 0.84, 1.16));
    var sec = c.sec ? derive(c, ac, 0.86, 1.12) : null;
    var labW = c.lab ? labWid(c, cnt, Math.min(c.iw * 0.2, tw('Service', c.fsA) + 5), 0.24) : 0;
    var headH = c.lab ? c.fsT + 5 : 0;
    var P = area(c, { left: labW, top: headH });
    var gap = c.small ? 3 : c.fs * 1.2;
    var noD = !c.vAbs && !c.vRel;
    var both = c.vAbs && c.vRel && !c.small && c.w >= 260 * c.lk;
    var w1 = noD ? P.w : (both ? P.w * 0.46 : P.w * 0.6);
    var wA = c.vAbs ? (both ? P.w * 0.28 - gap : P.w - w1 - gap) : 0;
    var wR = c.vRel ? (both ? P.w - w1 - wA - gap * 2 : (c.vAbs ? 0 : P.w - w1 - gap)) : 0;
    var rw = rowsOf(P.y, P.h, cnt, 0.28), i;
    b += barsBlock(c, { x: P.x, y: P.y, w: w1, h: P.h }, ac, pl, sec, kind, hh, rw);
    if (c.lab) {
      b += txt(P.x, c.y0 + c.fsT * 0.85, scenCap(c, kind), c.fsT, c.C.sub, 'start');
      for (i = 0; i < cnt; i++) b += rowLabel(c, P.x - 4, rw[i].cy, c.cat[i % c.cat.length], labW - 4);
    }
    var x2 = P.x + w1 + gap, rg = rowGeom(c, rw, kind, true);
    if (wA > 6) {
      if (c.lab) b += txt(x2 + wA / 2, c.y0 + c.fsT * 0.85, 'Δ' + kind, c.fsT, c.C.sub, 'middle');
      b += deltaBarsH(c, diffs(ac, pl), rw, x2, wA, hh, { geom: rg, kind: kind });
      x2 += wA + gap;
    }
    if (wR > 6) {
      if (c.lab) b += txt(x2 + wR / 2, c.y0 + c.fsT * 0.85, 'Δ' + kind + ' %', c.fsT, c.C.sub, 'middle');
      b += deltaPinsH(c, rels(ac, pl), rw, x2, wR, { kind: kind });
    }
    return wrap(c, b);
  };

  /* ---- 20 · Berichtstabelle (Tabellenmodus): Name · AC · Balken · Δ · Δ% -- */
  S.table = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), c.small ? 3 : Math.max(3, Math.min(20, Math.floor((c.ih - c.fsT - 6) / (c.fs * 1.3)) - 1)));
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var headH = c.lab ? c.fsT + 6 : Math.min(6, P.h * 0.16);
    var rh = (P.h - headH) / (rows + 1);
    var lab = c.lab && rh >= c.fs * 1.25;
    var wide = lab && c.w >= 330;
    var ac = [], rf = [], d = [], rel = [], sec = [], i;
    for (i = 0; i < rows; i++) {
      var a = (c.uc && rows > 6) ? n(80 * (1 - i / (rows + 3)) + c.rnd() * 8) : n(80 - i * 11 + c.rnd() * 10), p = n(a * (0.86 + c.rnd() * 0.24));
      ac.push(a); rf.push(p); d.push(n(a - p)); rel.push(n(p ? (a - p) / p * 100 : 0));
      sec.push(n(a * (0.9 + c.rnd() * 0.2)));
    }
    if (c.uv) {
      // o.values = AC je Zeile, o.refValues = Bezug; Δ und Δ% daraus
      ac = useVals(c, ac); rf = useRef(c, derive(c, ac, 0.86, 1.1)); sec = derive(c, ac, 0.9, 1.1);
      d = diffs(ac, rf); rel = rels(ac, rf);
    }
    var sAC = sum(ac), sRF = sum(rf), dS = n(sAC - sRF), relS = n(sRF ? dS / Math.abs(sRF) * 100 : 0);
    var dOn = c.vAbs, rOn = c.vRel;
    // Spalten (Anteile von P.w)
    var nameR = P.x + P.w * (wide ? 0.17 : 0.3);
    var acR = P.x + P.w * (wide ? 0.27 : 0.46);
    if (lab && c.real) {
      // formatierte Werte sind breiter: Namensspalte kürzen, notfalls AC-Spalte schieben
      var acW = vmaxW(c, ac.concat([sAC])) + 6;
      if (acR - nameR < acW) nameR = Math.max(P.x + P.w * 0.12, acR - acW);
      if (acR - nameR < acW) acR = nameR + acW;
    }
    var cellX = acR + 4, cellW = wide ? P.w * 0.15 : 0;
    var x0 = wide ? cellX + cellW + 6 : acR + 6;
    var free = P.x + P.w - x0;
    var dvW = (wide && dOn) ? (c.real ? vmaxW(c, d.concat([dS]), c.fs, dvlbl) : tw('+000', c.fs)) + 4 : 0;       // Δ als Zahl
    var dX = x0 + dvW, dW = 0, rX = dX, rW = 0;
    var blk = free - dvW;
    if (dOn && rOn) { dW = blk * 0.52; rX = dX + dW + 4; rW = blk - dW - 4; }
    else if (dOn) { dW = blk; }
    else if (rOn) { rX = x0; rW = free; }
    // Skalen: Δ-Balken gemeinsam inkl. Σ (wie im Visual), Pins ebenso
    var dAll = d.concat([dS]), rAll = rel.concat([relS]);
    var lwD = lab && !wide ? Math.max(tw(dvlbl(c, maxOf(dAll)), c.fs), tw(dvlbl(c, -maxOf(dAll)), c.fs)) + 3 : 2;
    var dLabOff = false;
    if (lab && !wide && c.real) {
      lwD = vmaxW(c, dAll, c.fs, dvlbl) + 3;
      // zu schmal für Balken plus Beschriftung auf beiden Seiten: nur Balken
      if (dW < lwD * 2 + 12) { dLabOff = true; lwD = 2; }
    }
    var lwR = lab ? tw('-00%', c.fs) + 5 : 2;
    var dLo = Math.min(0, Math.min.apply(null, dAll)), dHi = Math.max(0, Math.max.apply(null, dAll));
    var rLo = Math.min(0, Math.min.apply(null, rAll)), rHi = Math.max(0, Math.max.apply(null, rAll));
    var sD = sc(dLo * 1.02, dHi * 1.02 || 1, dX + (dLo < 0 ? lwD : 1), dX + dW - (dHi > 0 ? lwD : 1));
    var sR = sc(rLo * 1.05, rHi * 1.05 || 1, rX + (rLo < 0 ? lwR : 1), rX + rW - (rHi > 0 ? lwR : 1));
    var dA = sD(0), rA = sR(0);
    if (lab) {
      var hy = P.y + headH - 4;
      b += txt(acR, hy, c.main, c.fsT, c.C.sub, 'end');
      if (wide) b += txt(cellX, hy, c.main + ' · ' + kind + (c.sec ? ' · ' + c.sec : ''), c.fsT, c.C.sub, 'start');
      if (dOn) b += txt(wide ? dX - 3 : dA, hy, 'Δ' + kind, c.fsT, c.C.sub, wide ? 'end' : 'middle');
      if (rOn) {
        var hwR = tw('Δ' + kind + ' %', c.fsT) / 2;
        b += txt((c.uc || c.uv) ? clamp(rA, rX + hwR, Math.max(rX + hwR, P.x + P.w - hwR)) : rA, hy, 'Δ' + kind + ' %', c.fsT, c.C.sub, 'middle');
      }
    }
    b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, c.C.axis, 1);
    var mxAC = Math.max(maxOf(ac), maxOf(rf), maxOf(sec)) * 1.05;
    var cSp = span(ac, rf, sec), cSpS = span([sAC, sRF]);
    function row(label, a, p, pv, dv, rv, y, bold) {
      var s = '', cy = y + rh * 0.5, ty = cy + c.fs * 0.34, bh = Math.max(1.6, rh * 0.5), col = dcol(c, dv);
      var wgt = bold ? '600' : null;
      if (lab) {
        s += txt(P.x + (wide ? c.fs * 0.9 : 0), ty, fit(c, label, nameR - P.x - (wide ? c.fs : 0)), c.fs, c.C.ink, 'start', wgt);
        if (wide && !bold) s += txt(P.x, ty, '▸', c.fs * 0.8, c.C.sub, 'start');
        s += txt(acR, ty, vlbl(c, a, 1), c.fs, c.C.ink, 'end', wgt);
      } else {
        s += ghost(c, P.x, cy - 1, (nameR - P.x) * 0.7, Math.max(1.3, rh * 0.18), bold ? c.C.ghost2 : c.C.ghost);
        s += ghost(c, acR - (acR - nameR) * 0.6, cy - 1, (acR - nameR) * 0.6, Math.max(1.3, rh * 0.18), c.C.ghost2);
      }
      if (wide && c.real) {
        // echte Werte: In-Zellen-Balken mit Nulllinie (auch negativ)
        var sp2 = bold ? cSpS : cSp, kx = cellW / (((sp2.hi - sp2.lo) || 1) * 1.05), zx = cellX - sp2.lo * 1.05 * kx;
        var xp = zx + p * kx, xa2 = zx + a * kx;
        s += rect(Math.min(zx, xp), cy - bh * 0.62, Math.max(0.8, Math.abs(xp - zx)), bh * 1.24, c.C.plf, c.C.pls, 0.9);
        s += rect(Math.min(zx, xa2), cy - bh / 2, Math.max(0.8, Math.abs(xa2 - zx)), bh, c.C.ac);
        if (pv != null) s += triDown(c, clamp(zx + pv * kx, cellX, cellX + cellW), cy - bh * 0.62, clamp(bh * 0.55, 1.6, 3.6), 'PY');
      } else if (wide) {
        var mxr = bold ? Math.max(sAC, sRF) * 1.05 : mxAC;
        var wP = cellW * p / mxr, wA2 = cellW * a / mxr;
        s += rect(cellX, cy - bh * 0.62, Math.max(0.8, wP), bh * 1.24, c.C.plf, c.C.pls, 0.9);
        s += rect(cellX, cy - bh / 2, Math.max(0.8, wA2), bh, c.C.ac);
        if (pv != null) s += triDown(c, cellX + Math.min(cellW, cellW * pv / mxr), cy - bh * 0.62, clamp(bh * 0.55, 1.6, 3.6), 'PY');
      }
      if (dOn) {
        var xx = sD(dv);
        s += rect(Math.min(dA, xx), cy - bh / 2, Math.max(0.8, Math.abs(xx - dA)), bh, col);
        if (lab && wide) s += txt(dX - 3, ty, dvlbl(c, dv), c.fs, col, 'end', wgt);
        else if (lab && !dLabOff) s += txt(dv >= 0 ? xx + 2 : xx - 2, ty, dvlbl(c, dv), c.fs, col, dv >= 0 ? 'start' : 'end', wgt);
      }
      if (rOn) {
        var xr = sR(rv), r = clamp(rh * 0.13, 1.2, 2.4);
        s += ln(rA, cy, xr, cy, col, 1.3);
        s += rect(xr - r, cy - r, r * 2, r * 2, c.C.ink);
        if (lab) s += txt(rv >= 0 ? xr + r + 2 : xr - r - 2, ty, plbl(c, rv), c.fs, c.C.ink, rv >= 0 ? 'start' : 'end', wgt);
      }
      return s;
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, c.C.grid, 0.8);
      b += row(c.cat[i % c.cat.length], ac[i], rf[i], c.sec ? sec[i] : null, d[i], rel[i], y, false);
    }
    var ys = P.y + headH + rh * rows;
    b += ln(P.x, ys, P.x + P.w, ys, c.C.axis, 1);
    b += row('Σ ' + c.t.grand, sAC, sRF, null, dS, relS, ys, true);
    if (dOn) b += baseV(c, P.y + headH, P.y + P.h, dA, kind);
    if (rOn) b += baseV(c, P.y + headH, P.y + P.h, rA, kind);
    return wrap(c, b);
  };

  /* ---- 21 · Wasserfall-Kombi: Δ-Ebene über dem Wasserfall --------------- */
  S.wfkombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var kind = refKind(c) || 'PL';
    var mids = kcnt(c, c.small ? 3 : (c.dense ? 7 : 5), capN(c, 3, 22, 3, 16)), i, items = [], dv = [];
    var base = [42, 26, 18, 12, 9, 7, 5];
    for (i = 0; i < mids; i++) {
      var neg = (i >= mids - (c.small ? 1 : 2));
      items.push({ v: n(base[i % base.length] * (0.8 + c.rnd() * 0.4) * (neg ? -0.55 : 1)), lbl: c.cat[i % c.cat.length] });
    }
    if (c.uv) {
      // o.values = Beiträge je Kategorie, o.refValues = Beiträge im Bezug
      var wv = [];
      for (i = 0; i < mids; i++) wv.push(items[i].v);
      wv = useVals(c, wv);
      for (i = 0; i < mids; i++) items[i].v = wv[i];
    }
    var tot = 0; for (i = 0; i < mids; i++) tot += items[i].v;
    items.push({ v: n(tot), anchor: true, kind: 'AC', lbl: 'Σ' });
    for (i = 0; i < items.length; i++) dv.push(n(i < mids ? (c.rnd() - 0.45) * 8 : 0));
    if (c.uv) {
      var fk = 0;
      for (i = 0; i < mids; i++) fk += Math.abs(items[i].v);
      fk = fk / mids / 20;
      for (i = 0; i < mids; i++) {
        dv[i] = (c.ur && i < c.ur.length && c.ur[i] != null) ? n(items[i].v - c.ur[i]) : n(dv[i] * fk);
      }
      dv[mids] = 0;
    }
    dv[mids] = n(sum(dv));
    var labH = c.lab ? c.fsA + 5 : 0, capH = c.lab ? c.fsT + 4 : 0;
    var dOn = c.vAbs || c.vRel;
    var bd = bands(c.y0, c.ih - labH, dOn ? [30, 70] : [100], c.fs * 0.5);
    var wf = bd[dOn ? 1 : 0];
    var P = { x: c.x0, y: wf.y + capH, w: c.iw, h: Math.max(6, wf.h - capH) };
    var sl = slots(P.x, P.w, items.length, 0.38);
    if (dOn) {
      b += layerCap(c, c.x0, bd[0].y + c.fsT * 0.85, 'Δ' + kind + (c.vAbs ? '' : ' %'));
      var dd = dv;
      if (!c.vAbs) { dd = []; for (i = 0; i < dv.length; i++) dd.push(n(dv[i] / Math.max(1, Math.abs(items[i].v)) * 100)); }
      b += c.vAbs
        ? deltaCols(c, dd, sl, bd[0].y + capH, Math.max(6, bd[0].h - capH), hh, { kind: kind, cat: true })
        : deltaPins(c, dd, sl, bd[0].y + capH, Math.max(6, bd[0].h - capH), hh, { kind: kind, cat: true });
    }
    b += layerCap(c, c.x0, wf.y + c.fsT * 0.85, c.main);
    b += wfCols(c, P, items, hh, { slots: sl }).body;
    var nm = [], bold = [];
    for (i = 0; i < items.length; i++) { nm.push(items[i].lbl); bold.push(!!items[i].anchor); }
    b += monLabels(c, sl, c.y1 - 0.5, nm, bold);
    return wrap(c, b);
  };

  /* ---- 22 · Wasserfall horizontal mit integrierter Varianz --------------
     Wie der Modus „Waterfall structure": oben Σ PL (Kontur) und Σ PY (grau),
     darunter die Kategorien (AC dunkel, ▼-Marke für die Referenz), unten
     Σ AC. Rechts daneben die kaskadierende Δ-Spalte vom Bezug zu AC und
     ganz rechts die Δ%-Pins mit quadratischem Kopf.                        */
  S.wfint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var kind = refKind(c) || 'PL';
    var other = c.sec || (kind === 'PL' ? 'PY' : null);
    var mids = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 12, 3, 16)), i;
    var cat = useVals(c, sortDesc(vals(c, mids, 40, 40))), ref = useRef(c, derive(c, cat, 0.9, 1.14));
    var acT = sum(cat), refT = sum(ref), othT = other ? n(acT * (0.9 + c.rnd() * 0.08)) : 0;
    var d = diffs(cat, ref), rel = rels(cat, ref), dT = n(acT - refT);
    var lab = c.lab;
    var labW = lab ? labWid(c, mids, Math.min(c.iw * 0.2, tw('Service', c.fsA) + 5), 0.24) : 0;
    var headH = lab ? c.fsT + 5 : 0;
    var pinsOn = c.vRel && !c.small && c.w >= 280 * c.lk;
    var pinW = pinsOn ? Math.max(c.iw * 0.2, lab ? tw('-00%', c.fs) * 2 + 12 : 20) : 0;
    var P = area(c, { left: labW, right: pinW ? pinW + 6 : 0, top: headH });
    var nTop = other ? 2 : 1;
    var rowsN = nTop + mids + 1 + (c.vAbs && lab ? 1 : 0);
    var rw = rowsOf(P.y, P.h, rowsN, 0.3);
    var wv = lab ? (c.real ? vmaxW(c, cat.concat([acT, refT, othT])) : tw(lbl(c, Math.max(acT, refT), 0), c.fs)) + 4 : 0;
    var mx = Math.max(acT, refT, othT) * 1.01;
    var s = sc(0, mx, P.x, P.x + Math.max(10, P.w - wv));
    /* Negative Werte (nur mit o.values): Achse im Inneren, Balken ab zx */
    var wNeg = false, zx = P.x;
    if (c.real) {
      var lvW = [refT], accW = refT;
      for (i = 0; i < mids; i++) { accW += d[i]; lvW.push(accW); }
      var spW = span(cat, ref, lvW, [acT, refT, othT]);
      if (spW.lo < 0) {
        wNeg = true;
        s = sc(spW.lo * 1.01, spW.hi * 1.01, P.x, P.x + Math.max(10, P.w - wv));
        zx = s(0);
      } else if (spW.hi * 1.01 > mx) {
        // die Kaskade läuft über die größte Summe hinaus: Skala erweitern
        s = sc(0, spW.hi * 1.01, P.x, P.x + Math.max(10, P.w - wv));
      }
    }
    function hx(v) { return wNeg ? Math.min(zx, s(v)) : P.x; }
    function hw(v) { return wNeg ? Math.max(0.9, Math.abs(s(v) - zx)) : Math.max(0.9, s(v) - P.x); }
    var r0 = 0;
    function totRow(ri, v, k2, name, bold) {
      var y = rw[ri].y, hr = rw[ri].h, out = '';
      out += (k2 === 'AC') ? rect(hx(v), y, hw(v), hr, c.C.ac) : refShape(c, hx(v), y, hw(v), hr, k2, hh);
      if (lab) {
        out += txt((wNeg ? Math.max(s(v), zx) : s(v)) + 3, rw[ri].cy + c.fs * 0.34, vlbl(c, v), c.fs, c.C.ink, 'start', '600');
        out += rowLabel(c, P.x - 4, rw[ri].cy, name, labW - 4, bold);
      }
      return out;
    }
    b += totRow(r0++, refT, kind, kind, true);
    if (other) b += totRow(r0++, othT, other, other, true);
    // Kategorien: Balken ab der Achse, Referenz als ▼-Marke
    var wl = 0;
    for (i = 0; i < mids; i++) wl = Math.max(wl, tw(vlbl(c, cat[i]), c.fs));
    for (i = 0; i < mids; i++) {
      var ri2 = nTop + i, bh = rw[ri2].h * 0.8, cy = rw[ri2].cy;
      b += rect(hx(cat[i]), cy - bh / 2, hw(cat[i]), bh, c.C.ac);
      var ms = clamp(rw[ri2].step * 0.2, 1.5, 3.6);
      if (cy - bh / 2 - ms >= P.y - 1) b += triDown(c, s(ref[i]), cy - bh / 2, ms, kind === 'PY' ? 'PY' : 'PY');
      if (lab) {
        b += txt(Math.max(s(cat[i]), s(ref[i]), wNeg ? zx : -1e9) + 3, cy + c.fs * 0.34, vlbl(c, cat[i]), c.fs, c.C.ink, 'start');
        b += rowLabel(c, P.x - 4, cy, c.cat[i % c.cat.length], labW - 4);
      }
    }
    var riAC = nTop + mids;
    b += totRow(riAC, acT, 'AC', c.main, true);
    b += baseV(c, rw[0].y - 1, rw[riAC].y + rw[riAC].h + 1, zx, 'AC');
    // Δ-Kaskade am Bezugsende: jede Kategorie verschiebt den Stand
    if (c.vAbs) {
      var level = refT, xR = s(refT), segH;
      b += ln(xR, rw[0].y + rw[0].h, xR, rw[nTop].y, c.C.hair, 0.8);
      for (i = 0; i < mids; i++) {
        var ri3 = nTop + i, cy3 = rw[ri3].cy, x1 = s(level), x2 = s(level + d[i]);
        segH = rw[ri3].h * 0.7;
        b += ln(x1, rw[ri3 - 1].cy, x1, cy3 - segH / 2, c.C.hair, 0.8);
        b += rect(Math.min(x1, x2), cy3 - segH / 2, Math.max(1.2, Math.abs(x2 - x1)), segH, dcol(c, d[i]));
        if (lab && P.w >= 180) {
          var dl = dvlbl(c, d[i]), xl = Math.min(x1, x2) - 3;
          if (xl - tw(dl, c.fs) > Math.max(s(Math.max(cat[i], ref[i])), wNeg ? zx : -1e9) + wl + 6) b += txt(xl, cy3 + c.fs * 0.34, dl, c.fs, c.C.ink, 'end');
        }
        level = n(level + d[i]);
      }
      b += ln(s(level), rw[nTop + mids - 1].cy, s(level), rw[riAC].y, c.C.hair, 0.8);
      // Netto-Δ unter der AC-Zeile mit Plakette
      if (lab) {
        var ri4 = riAC + 1, xa = s(acT), xb = s(refT);
        b += rect(Math.min(xa, xb), rw[ri4].y, Math.max(1.2, Math.abs(xb - xa)), rw[ri4].h * 0.55, dcol(c, dT));
        var pyW = rw[ri4].y + rw[ri4].h * 0.55 + c.fs * 0.2;
        if (c.uc || c.uv) pyW = Math.min(pyW, c.h - c.fs * 0.8 - 1);
        b += pill(c, (xa + xb) / 2, pyW, dvlbl(c, dT), dcol(c, dT), P.x, P.x + P.w);
      }
    }
    // Δ%-Pins rechts
    if (pinW) {
      var rowsP = [], dP = [];
      for (i = 0; i < mids; i++) { rowsP.push(rw[nTop + i]); dP.push(rel[i]); }
      rowsP.push(rw[riAC]); dP.push(refT ? n(dT / Math.abs(refT) * 100) : 0);
      if (lab) b += txt(c.x1 - pinW / 2, c.y0 + c.fsT * 0.85, 'Δ' + kind + ' %', c.fsT, c.C.sub, 'middle');
      b += deltaPinsH(c, dP, rowsP, c.x1 - pinW, pinW, { kind: kind });
    }
    if (lab) b += txt(P.x, c.y0 + c.fsT * 0.85, kind + ' → ' + c.main, c.fsT, c.C.sub, 'start');
    return wrap(c, b);
  };

  /* ---- 23 · Gestapelte Balken ------------------------------------------ */
  S.stackbar = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 11, 3, 20));
    var segs = c.small ? 2 : 3, cols = [c.C.ac, c.C.g2, c.C.g3];
    var labW = c.lab ? labWid(c, cnt, Math.min(c.iw * 0.22, tw('Service', c.fsA) + 5)) : 0;
    // o.values = Zeilensumme (Länge nach Betrag, negative als 0), Segmente synthetisch
    var sv = c.uv ? useVals(c, vals(c, cnt, 60, 40)) : null, svM = sv ? Math.max(1e-9, span(sv).hi) : 1;
    var valW = c.lab ? (sv ? vmaxW(c, sv) : tw('000', c.fs)) + 5 : 0;
    var headH = c.lab ? c.fsT + 5 : 0;
    var P = area(c, { left: labW, right: valW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i, j;
    if (c.lab) {
      var lx = P.x, nm = [c.t.product + ' A', c.t.product + ' B', c.t.product + ' C'];
      for (j = 0; j < segs && lx + tw(nm[j], c.fsT) + c.fsT < c.x1; j++) {
        b += rect(lx, c.y0 + c.fsT * 0.15, c.fsT * 0.7, c.fsT * 0.7, cols[j]);
        b += txt(lx + c.fsT, c.y0 + c.fsT * 0.85, nm[j], c.fsT, c.C.sub, 'start');
        lx += c.fsT * 1.6 + tw(nm[j], c.fsT);
      }
    }
    for (i = 0; i < cnt; i++) {
      var tot = 0.95 - i * 0.12 + c.rnd() * 0.08, x = P.x;
      tot = clamp(tot, 0.25, 1);
      if (sv) tot = Math.max(0, sv[i]) / svM;
      var fr = [], fsum = 0;
      for (j = 0; j < segs; j++) { var f = (j === 0 ? 0.45 : 0.2) + c.rnd() * 0.25; fr.push(f); fsum += f; }
      for (j = 0; j < segs; j++) {
        var sw2 = P.w * tot * fr[j] / fsum;
        b += rect(x, rw[i].y, Math.max(0.9, sw2), rw[i].h, cols[j % cols.length]);
        if (j) b += ln(x, rw[i].y, x, rw[i].y + rw[i].h, c.C.paper, 0.8);
        x += sw2;
      }
      if (c.lab) {
        b += rowLabel(c, P.x - 4, rw[i].cy, c.cat[i % c.cat.length], labW - 4);
        b += txt(x + 3, rw[i].cy + c.fs * 0.34, sv ? vlbl(c, sv[i]) : lbl(c, tot * 100, 0), c.fs, c.C.ink, 'start', '600');
      }
    }
    b += baseV(c, P.y, P.y + P.h, P.x, 'AC');
    return wrap(c, b);
  };

  /* ---- 24 · Small Multiples: gleiche Skala je Panel (IBCS UNIFY) -------- */
  S.multiples = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var kind = refKind(c);
    var cols = c.small ? 2 : (c.w >= 420 ? 3 : 2), rws = c.small ? 1 : 2;
    var nP = rws * cols, own = !!(c.uc || c.uv);
    if (own) {
      // Eigene Daten: ein Panel je Kategorie, Raster nach Anzahl
      var colsMax = c.small ? 2 : (c.w >= 640 ? 4 : (c.w >= 420 ? 3 : 2)), rowsMax = c.small ? 1 : (c.h >= 300 ? 3 : 2);
      nP = kcnt(c, nP, colsMax * rowsMax);
      rws = Math.ceil(nP / colsMax); cols = Math.ceil(nP / rws);   // 4 → 2×2 statt 3+1
    }
    var gxp = c.small ? 4 : 10, gyp = c.small ? 3 : 7;
    var cw = (c.iw - gxp * (cols - 1)) / cols;
    var ch = (c.ih - gyp * (rws - 1)) / rws;
    var i, j, k2, data = [], mx = 0, per = c.small ? 4 : 6;
    for (i = 0; i < nP; i++) {
      var f = own ? 1 - i * 0.5 / nP : 1 - i * 0.12;
      var v = series(c, per, 60 * f, 14 * f), rf = kind ? derive(c, v, 0.88, 1.12) : null;
      data.push({ v: v, rf: rf });
      mx = Math.max(mx, maxOf(v), rf ? maxOf(rf) : 0);
    }
    var gLo = 0, gHi = 0;
    if (c.uv) {
      /* o.values[k] = Summe des Panels k (o.refValues[k] die des Bezugs);
         die Monatsform bleibt synthetisch und wird darauf skaliert.        */
      var tS = [];
      for (i = 0; i < nP; i++) tS.push(sum(data[i].v));
      var tV = useVals(c, tS);
      mx = 0;
      for (i = 0; i < nP; i++) {
        var fv = tS[i] ? tV[i] / tS[i] : 0, q;
        for (q = 0; q < per; q++) data[i].v[q] = data[i].v[q] * fv;
        if (data[i].rf) {
          var sR0 = sum(data[i].rf), fr = (c.ur && i < c.ur.length && c.ur[i] != null && sR0) ? c.ur[i] / sR0 : fv;
          for (q = 0; q < per; q++) data[i].rf[q] = data[i].rf[q] * fr;
        }
        mx = Math.max(mx, maxOf(data[i].v), data[i].rf ? maxOf(data[i].rf) : 0);
        var spM = span(data[i].v, data[i].rf);
        gLo = Math.min(gLo, spM.lo); gHi = Math.max(gHi, spM.hi);
      }
    }
    for (i = 0; i < rws; i++) {
      for (j = 0; j < cols; j++) {
        k2 = i * cols + j;
        if (k2 >= nP) continue;
        var px = c.x0 + j * (cw + gxp), py = c.y0 + i * (ch + gyp);
        var hd = c.lab ? c.fsT + 4 : 0;
        var P = { x: px, y: py + hd, w: cw, h: Math.max(4, ch - hd) };
        var dd = data[k2];
        if (c.lab) {
          var sv = sum(dd.v), sr = dd.rf ? sum(dd.rf) : 0;
          var dp = sr ? n((sv - sr) / Math.abs(sr) * 100) : 0;
          var badge = (dd.rf && (c.vRel || c.vAbs)) ? (c.vRel ? plbl(c, dp) : dvlbl(c, sv - sr)) : '';
          var bw2 = badge ? tw(badge, c.fs) + 4 : 0;
          b += txt(px, py + c.fsT * 0.85, fit(c, (k2 === 0 && !own ? 'Σ ' : '') + c.cat[k2 % c.cat.length], cw - bw2, c.fsT), c.fsT, c.C.ink, 'start', '600');
          if (badge && cw >= bw2 + c.fsT * 3) b += txt(px + cw, py + c.fsT * 0.85, badge, c.fs, dcol(c, dp), 'end', '600');
        }
        var sl = slots(P.x, P.w, per, 0.3);
        b += colBlock(c, P, dd.v, dd.rf, kind, hh, sl, gLo < 0 ? { labels: false, max: gHi * 1.03, min: gLo } : { labels: false, max: mx * 1.03 }).body;
      }
    }
    return wrap(c, b);
  };

  /* ---- 25 · Tabelle mit Sparklines -------------------------------------- */
  S.sparktable = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = kcnt(c, c.small ? 2 : (c.dense ? 7 : 5), capR(c, 2, 13, 2, 16));
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var headH = c.lab ? c.fsT + 6 : 0;
    var rh = (P.h - headH) / rows;
    var lab = c.lab && rh >= c.fs * 1.4;
    var dOn = c.vRel || c.vAbs, dRel = c.vRel;
    var labW = lab ? Math.min(P.w * 0.24, tw('Service', c.fs) + 6) : P.w * 0.2;
    var numW = lab ? tw('000,0', c.fs) + 6 : 0;
    var valW = dOn ? (lab ? tw('+00%', c.fs) + 8 : P.w * 0.14) : 0;
    // o.values = Zahl je Zeile (AC), o.refValues = Bezug für die Δ-Spalte; Sparklines bleiben synthetisch
    var ka = null, kr = null, k0;
    if (c.uv) {
      ka = useVals(c, vals(c, rows, 60, 40)); kr = useRef(c, derive(c, ka, 0.86, 1.14));
      if (lab) {
        numW = vmaxW(c, ka) + 6;
        if (dOn && !dRel) { valW = 0; for (k0 = 0; k0 < rows; k0++) valW = Math.max(valW, tw(dvlbl(c, ka[k0] - kr[k0]), c.fs)); valW += 8; }
      }
    }
    if (lab && c.uc) {
      var mW = 0;
      for (k0 = 0; k0 < rows; k0++) mW = Math.max(mW, tw(c.cat[k0 % c.cat.length], c.fs));
      labW = Math.max(labW, Math.min(P.w * 0.3, mW + 6));
    }
    var spX = P.x + labW + numW + 6, spW = Math.max(6, P.w - labW - numW - valW - 10), i;
    if (lab) {
      var hy = P.y + headH - 4;
      b += txt(P.x + labW + numW, hy, c.main, c.fsT, c.C.sub, 'end');
      b += txt(spX, hy, c.t.mon[0] + '–' + c.t.mon[11], c.fsT, c.C.sub, 'start');
      if (dOn) b += txt(P.x + P.w, hy, 'Δ' + kind + (dRel ? ' %' : ''), c.fsT, c.C.sub, 'end');
      b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, c.C.axis, 1);
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i, cy = y + rh * 0.5, ty = cy + c.fs * 0.34;
      if (i) b += ln(P.x, y, P.x + P.w, y, c.C.grid, 0.8);
      var pts = sparkPts(c, 12, spX, y + rh * 0.18, spW, rh * 0.64);
      var rp = [], k2;
      for (k2 = 0; k2 < pts.length; k2++) rp.push([pts[k2][0], clamp(pts[k2][1] + (c.rnd() - 0.3) * rh * 0.2, y + rh * 0.15, y + rh * 0.85)]);
      b += polyline(rp, c.C.py, 1, kind === 'PY' ? null : '2 1.5');
      b += polyline(pts, c.C.ac, 1.3);
      b += circ(pts[11][0], pts[11][1], 1.6, c.C.ac);
      var d = dRel ? n((c.rnd() - 0.42) * 20) : n((c.rnd() - 0.42) * 30);
      if (ka) d = dRel ? n(kr[i] ? (ka[i] - kr[i]) / Math.abs(kr[i]) * 100 : 0) : n(ka[i] - kr[i]);
      if (lab) {
        b += txt(P.x, ty, fit(c, c.cat[i % c.cat.length], labW - 2), c.fs, c.C.ink, 'start');
        var nv = (c.uc && rows > 6) ? 90 * (1 - i / (rows + 3)) + c.rnd() * 8 : 90 - i * 12 + c.rnd() * 10;
        b += txt(P.x + labW + numW, ty, ka ? vlbl(c, ka[i]) : lbl(c, nv, 1), c.fs, c.C.ink, 'end');
        if (dOn) b += txt(P.x + P.w, ty, dRel ? plbl(c, d) : dvlbl(c, d), c.fs, dcol(c, d), 'end', '600');
      } else {
        b += ghost(c, P.x, cy - 1, labW * 0.8, Math.max(1.3, rh * 0.16));
        if (dOn) b += ghost(c, P.x + P.w - valW * 0.7, cy - 1, valW * 0.7, Math.max(1.3, rh * 0.16), dcol(c, d));
      }
    }
    return wrap(c, b);
  };

  /* ---- 20b · GuV-Statement im Zuschnitt von „P&L Statement byDatenWG" -----

     Zeilengerüst: i = Index in c.t.pnl, lvl = Einrückung, t = Zeilenart.
       pos/neg  Positionen (Kosten negativ, damit dcol() ohne Sonderfall
                stimmt: mehr Kosten = negativeres Δ = ungünstig)
       sum      Formelzeile (Zwischensumme, fett mit Oberlinie)
       total    Σ-Zeile (kräftigere Oberlinie)
       kpi      Margenzeile in %, kursiv, Δ in Prozentpunkten ohne Balken
     Spalten-Presets wie im Visual (o.mode):
       full     AC · PY · ΔPY · PL · ΔPL · ΔPL%
       acref    AC · Ref · ΔRef · ΔRef%          (Ref = o.deltaBasis, sonst PL)
       dall     AC · ΔPY · ΔPY% · ΔPL · ΔPL% (· ΔFC · ΔFC% mit FC)
       acpydpy  AC · PY · ΔPY · ΔPY%
       acpldpl  AC · PL · ΔPL · ΔPL%
       dpct     AC · ΔPY% · ΔPL%
     Rechts optional die Mini-Grafik je Zeile (o.treeCard):
       months   Monatssäulen AC gegen PL   delta  Δ-Säulen je Monat
       bridge   Mini-Brücke Ref → Δ → AC (Default)
     o.density 'compact' verdichtet die Zeilen. Reicht die Breite nicht,
     fallen Spalten nach Priorität weg (zuerst Referenzwerte, dann die
     zweite Referenz, die Mini-Grafik, zuletzt Δ% und Δ).                    */
  var PNL_SPECS = [
    [ { i: 0, lvl: 0, t: 'pos', f: 1 }, { i: 1, lvl: 1, t: 'neg', f: -0.38 }, { i: 2, lvl: 0, t: 'sum' },
      { i: 11, lvl: 1, t: 'kpi' }, { i: 3, lvl: 1, t: 'neg', f: -0.27 }, { i: 4, lvl: 1, t: 'neg', f: -0.13 },
      { i: 5, lvl: 0, t: 'sum' }, { i: 6, lvl: 1, t: 'neg', f: -0.055 }, { i: 7, lvl: 0, t: 'sum' },
      { i: 12, lvl: 1, t: 'kpi' }, { i: 8, lvl: 1, t: 'neg', f: -0.02 }, { i: 9, lvl: 1, t: 'neg', f: -0.035 },
      { i: 10, lvl: 0, t: 'total' } ],
    [ { i: 0, lvl: 0, t: 'pos', f: 1 }, { i: 1, lvl: 1, t: 'neg', f: -0.38 }, { i: 2, lvl: 0, t: 'sum' },
      { i: 3, lvl: 1, t: 'neg', f: -0.27 }, { i: 4, lvl: 1, t: 'neg', f: -0.13 }, { i: 5, lvl: 0, t: 'sum' },
      { i: 6, lvl: 1, t: 'neg', f: -0.055 }, { i: 7, lvl: 0, t: 'sum' }, { i: 8, lvl: 1, t: 'neg', f: -0.02 },
      { i: 9, lvl: 1, t: 'neg', f: -0.035 }, { i: 10, lvl: 0, t: 'total' } ],
    [ { i: 0, lvl: 0, t: 'pos', f: 1 }, { i: 1, lvl: 1, t: 'neg', f: -0.38 }, { i: 2, lvl: 0, t: 'sum' },
      { i: 3, lvl: 1, t: 'neg', f: -0.27 }, { i: 4, lvl: 1, t: 'neg', f: -0.13 }, { i: 5, lvl: 0, t: 'sum' },
      { i: 6, lvl: 1, t: 'neg', f: -0.055 }, { i: 7, lvl: 0, t: 'total' } ],
    [ { i: 0, lvl: 0, t: 'pos', f: 1 }, { i: 1, lvl: 1, t: 'neg', f: -0.38 }, { i: 2, lvl: 0, t: 'sum' },
      { i: 4, lvl: 1, t: 'neg', f: -0.41 }, { i: 7, lvl: 0, t: 'total' } ]
  ];
  var PNL_MODES = { full: 1, acref: 1, dall: 1, acpydpy: 1, acpldpl: 1, dpct: 1 };

  // Werte je Zeile und Szenario: Positionen aus dem Seed, Formelzeilen als
  // laufende Summe, Margen als Anteil am Umsatz.
  function pnlVals(c, spec) {
    var sc3 = { AC: [0.975, 0.05], PY: [0.91, 0.06], PL: [0.955, 0.08], FC: [0.975, 0.06] };
    var out = { AC: [], PY: [], PL: [], FC: [] }, run = {}, rev = {}, lastSum = {}, i, k3, key;
    for (key in sc3) { run[key] = 0; rev[key] = 1; lastSum[key] = 0; }
    for (i = 0; i < spec.length; i++) {
      var sp = spec[i];
      for (key in sc3) {
        var v;
        if (sp.t === 'sum' || sp.t === 'total') { v = run[key]; lastSum[key] = v; }
        else if (sp.t === 'kpi') { v = rev[key] ? lastSum[key] / rev[key] * 100 : 0; }
        else {
          k3 = sc3[key];
          v = 1000 * sp.f * (k3[0] + c.rnd() * k3[1]);
          run[key] += v;
          if (sp.i === 0) rev[key] = v;
        }
        out[key].push(n(v));
      }
    }
    return out;
  }

  S.pnl = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    o = o || {};
    var mode = PNL_MODES[o.mode] ? o.mode : 'full';
    var tree = (o.treeCard === 'months' || o.treeCard === 'delta' || o.treeCard === 'none') ? o.treeCard : 'bridge';
    var compact = o.density === 'compact';
    var P = area(c, {});
    var lab = c.lab;
    var fs = c.fs;
    var basis = (c.basis === 'PY' || c.basis === 'PL') ? c.basis : (c.basis === 'BU' ? 'PL' : 'PL');

    /* ---- Spalten nach Preset ---- */
    var cols = [], i, j;
    function col(k3, ref, pr) { cols.push({ k: k3, ref: ref, pr: pr }); }
    col('ac', null, 100);
    if (mode === 'full') {
      col('num', 'PY', 40); col('bar', 'PY', 70);
      col('num', 'PL', 50); col('bar', 'PL', 90); col('pin', 'PL', 85);
    } else if (mode === 'acref') {
      col('num', basis, 50); col('bar', basis, 90); col('pin', basis, 85);
    } else if (mode === 'dall') {
      col('bar', 'PY', 90); col('pin', 'PY', 70); col('bar', 'PL', 88); col('pin', 'PL', 68);
      if (c.fc) { col('bar', 'FC', 60); col('pin', 'FC', 55); }
    } else if (mode === 'acpydpy') {
      col('num', 'PY', 50); col('bar', 'PY', 90); col('pin', 'PY', 85);
    } else if (mode === 'acpldpl') {
      col('num', 'PL', 50); col('bar', 'PL', 90); col('pin', 'PL', 85);
    } else {
      col('pin', 'PY', 90); col('pin', 'PL', 88);
    }
    if (tree !== 'none') col('mini', null, 65);
    // o.variance blendet Δ- bzw. Δ%-Spalten aus
    cols = cols.filter(function (x) { return !((x.k === 'bar' && !c.vAbs) || (x.k === 'pin' && !c.vRel)); });
    // Referenz hinter dem AC-Balken
    var acRef = mode === 'full' ? 'PL' : (mode === 'acpydpy' ? 'PY' : (mode === 'acpldpl' ? 'PL' : basis));
    var dRef = acRef;                       // Bezug der Mini-Grafik
    for (i = 0; i < cols.length; i++) if (cols[i].k === 'bar' || cols[i].k === 'pin') { dRef = cols[i].ref === 'FC' ? acRef : cols[i].ref; break; }
    if (mode === 'full') dRef = 'PL';

    /* ---- Breiten ---- */
    var numMin = lab ? tw('-0.000', fs) + 6 : 10;
    function minW(x) {
      if (x.k === 'ac') return lab ? tw('-0.000', fs) + 6 : 14;
      if (x.k === 'num') return numMin;
      if (x.k === 'mini') return lab ? Math.max(40, fs * 5) : 20;
      return lab ? fs * 6.4 : 14;
    }
    var fewCols = cols.length <= 5;
    function wgt(x) { return x.k === 'ac' ? (fewCols ? 2.6 : 1.5) : (x.k === 'num' ? 0.35 : (x.k === 'mini' ? 0.9 : 1.1)); }
    var nameW = lab ? clamp(P.w * 0.27, fs * 6.5, fs * 13.5) : P.w * 0.26;
    function need() { var s2 = nameW, k4; for (k4 = 0; k4 < cols.length; k4++) s2 += minW(cols[k4]) + 4; return s2; }
    while (need() > P.w && cols.length > 1) {
      var lo = -1;
      for (i = 1; i < cols.length; i++) if (lo < 0 || cols[i].pr < cols[lo].pr) lo = i;
      cols.splice(lo, 1);
    }
    if (need() > P.w) nameW = Math.max(P.w * 0.3, P.w - (need() - nameW));
    var extra = Math.max(0, P.w - need()), wsum = 0;
    for (i = 0; i < cols.length; i++) wsum += wgt(cols[i]);
    var x = P.x + nameW;
    for (i = 0; i < cols.length; i++) {
      var add = extra * wgt(cols[i]) / (wsum || 1);
      if (cols[i].k === 'mini') add = Math.min(add, Math.max(0, 96 - minW(cols[i])));
      if (cols[i].k === 'num') add = Math.min(add, fs * 1.5);
      cols[i].x = x + 2; cols[i].w = minW(cols[i]) + add; x += cols[i].w + 4;
    }
    // Restbreite (gekappte Spalten) an die Namensspalte zurückgeben
    var slack = P.x + P.w - x + 4;
    if (slack > 1) { nameW += slack; for (i = 0; i < cols.length; i++) cols[i].x += slack; }

    /* ---- Zeilen ---- */
    var hasBlock = lab && P.h >= 190 * c.lk;
    var headH = lab ? c.fsT + 7 + (hasBlock ? c.fsT + 4 : 0) : Math.min(6, P.h * 0.12);
    var rhMin = lab ? fs * (compact ? 1.45 : 1.9) : (compact ? 4.5 : 6);
    var spec = PNL_SPECS[PNL_SPECS.length - 1];
    for (i = 0; i < PNL_SPECS.length; i++) {
      if (PNL_SPECS[i].length * rhMin <= P.h - headH) { spec = PNL_SPECS[i]; break; }
    }
    var rh = Math.min((P.h - headH) / spec.length, rhMin * 1.5);
    var V = pnlVals(c, spec);
    var ac = V.AC;

    /* ---- Skalen (eine Skala je Spaltenart über alle Zeilen, wie im Visual) ---- */
    var vMax = 1, dMax = 1, i2, rr;
    for (i = 0; i < spec.length; i++) {
      if (spec[i].t === 'kpi') continue;
      vMax = Math.max(vMax, Math.abs(ac[i]), Math.abs(V[acRef][i]));
      for (j = 0; j < cols.length; j++) {
        if (cols[j].k === 'bar') dMax = Math.max(dMax, Math.abs(ac[i] - V[cols[j].ref][i]));
      }
    }
    var vNeg = 0;
    for (i = 0; i < spec.length; i++) if (spec[i].t !== 'kpi') vNeg = Math.max(vNeg, -Math.min(0, ac[i], V[acRef][i]));

    /* ---- Kopf ---- */
    var yH = P.y + headH;
    if (lab) {
      var hy = yH - 4;
      b += txt(P.x, hy, 'P&L', c.fsT, c.C.sub, 'start', '600');
      var bx0 = 1e9, bx1 = -1e9;
      for (i = 0; i < cols.length; i++) {
        var cc = cols[i], hl;
        if (cc.k === 'ac') hl = c.main;
        else if (cc.k === 'num') hl = cc.ref;
        else if (cc.k === 'bar') hl = 'Δ' + cc.ref;
        else if (cc.k === 'pin') hl = 'Δ' + cc.ref + '%';
        else hl = tree === 'months' ? c.main + ' · ' + dRef : (tree === 'delta' ? 'Δ' + dRef : dRef + ' → ' + c.main);
        hl = fit(c, hl, cc.w, c.fsT);
        var ha = (cc.k === 'num') ? 'end' : 'middle';
        b += txt(ha === 'end' ? cc.x + cc.w : cc.x + cc.w / 2, hy, hl, c.fsT, cc.k === 'ac' ? c.C.ink : c.C.sub, ha, '600');
        if (cc.k !== 'mini') { bx0 = Math.min(bx0, cc.x); bx1 = Math.max(bx1, cc.x + cc.w); }
      }
      if (hasBlock && bx1 > bx0) {
        var by = P.y + c.fsT * 0.85;
        b += txt((bx0 + bx1) / 2, by, fit(c, c.t.ytd, bx1 - bx0, c.fsT), c.fsT, c.C.sub, 'middle');
        b += ln(bx0, by + 3, bx1, by + 3, c.C.grid, 0.8);
      }
    }
    b += ln(P.x, yH, P.x + P.w, yH, c.C.axis, 1);
    var yEnd = yH + rh * spec.length;

    /* ---- Achsen der Δ-Spalten: Lage nach Vorzeichenbereich, eine gemeinsame
       Skala für alle Δ-Balken-Spalten (bzw. alle Pin-Spalten) wie im Visual ---- */
    var lwd = lab ? tw('-000', fs) + 3 : 1, lwp = lab ? tw('-00%', fs) + 5 : 2;
    var ppuB = 1e9, ppuP = 1e9;
    function pctOf(k5, ref2) { var r2 = V[ref2][k5]; return clamp(r2 ? (ac[k5] - r2) / Math.abs(r2) * 100 : 0, -40, 40); }
    for (j = 0; j < cols.length; j++) {
      var cj = cols[j];
      if (cj.k !== 'bar' && cj.k !== 'pin') continue;
      var pos = 0, neg = 0;
      for (i = 0; i < spec.length; i++) {
        if (spec[i].t === 'kpi') continue;
        var vv2 = cj.k === 'bar' ? ac[i] - V[cj.ref][i] : pctOf(i, cj.ref);
        pos = Math.max(pos, vv2); neg = Math.max(neg, -vv2);
        if (vv2 >= 0) cj.zp = true;
      }
      if (pos + neg <= 0) pos = 1;
      var lwx = cj.k === 'bar' ? lwd : lwp;
      cj.pos = pos; cj.neg = neg; cj.lw = lwx;
      var av2 = Math.max(4, cj.w - (pos > 0 || cj.zp ? lwx : 0) - (neg > 0 ? lwx : 0)) / (pos + neg);
      if (cj.k === 'bar') ppuB = Math.min(ppuB, av2); else ppuP = Math.min(ppuP, av2);
    }
    for (j = 0; j < cols.length; j++) {
      var ck = cols[j];
      if (ck.k !== 'bar' && ck.k !== 'pin') continue;
      ck.ppu = ck.k === 'bar' ? ppuB : ppuP;
      ck.ax = ck.x + (ck.neg > 0 ? ck.lw : 0) + ck.neg * ck.ppu;
      b += baseV(c, yH + 1.5, yEnd, ck.ax, ck.ref);
    }

    /* ---- Zeilen ---- */
    var indent = Math.min(fs * 1.1, nameW * 0.08);
    for (i = 0; i < spec.length; i++) {
      var sp = spec[i], y = yH + rh * i, cy = y + rh * 0.5, ty = cy + fs * 0.34;
      var isSum = sp.t === 'sum' || sp.t === 'total', isKpi = sp.t === 'kpi';
      var wt = isSum ? '600' : null;
      if (isSum && i) b += ln(P.x, y, P.x + P.w, y, c.C.axis, sp.t === 'total' ? 1.6 : 0.8);
      var lx = P.x + sp.lvl * indent;
      if (lab) {
        b += txt(lx, ty, fit(c, c.t.pnl[sp.i], nameW - (lx - P.x) - 4), fs, isKpi ? c.C.sub : c.C.ink, 'start', wt, null, isKpi ? 'i' : null);
      } else {
        b += ghost(c, lx, cy - 0.8, Math.max(2, (nameW - (lx - P.x)) * (isSum ? 0.62 : 0.72)), Math.max(1.2, rh * 0.22), isSum ? c.C.ghost2 : c.C.ghost);
      }
      var bh = Math.max(1.4, rh * (compact ? 0.62 : 0.56));
      for (j = 0; j < cols.length; j++) {
        var cl = cols[j], cx0 = cl.x, cwid = cl.w, mid = cx0 + cwid / 2;
        if (cl.k === 'ac') {
          if (isKpi) {
            if (lab) b += txt(cx0 + cwid, ty, lbl(c, ac[i], 1) + ' %', fs, c.C.sub, 'end', null, null, 'i');
            continue;
          }
          var lwA = tw('-0.000', fs) + 3;
          if (lab && cwid - lwA * (vNeg > 0 ? 2 : 1) >= 36) {
            // In-Zellen-Balken: Referenz dahinter, AC schmaler davor, Wert außen
            var lw = lwA;
            var span = cwid - lw * (vNeg > 0 ? 2 : 1);
            var ppu = span / (vMax + vNeg || 1);
            var ax = cx0 + (vNeg > 0 ? lw : 0) + vNeg * ppu;
            var rv = V[acRef][i], av = ac[i];
            var rl = Math.abs(rv) * ppu, al = Math.abs(av) * ppu;
            b += refShape(c, rv >= 0 ? ax : ax - rl, cy - bh / 2, Math.max(0.8, rl), bh, acRef, hh);
            b += rect(av >= 0 ? ax : ax - al, cy - bh * 0.3, Math.max(0.8, al), bh * 0.6, c.C.ac);
            b += ln(ax, cy - bh / 2 - 1, ax, cy + bh / 2 + 1, c.C.axis, 0.8);
            var ext = Math.max(rl, al);
            b += txt(av >= 0 ? ax + ext + 2.5 : ax - ext - 2.5, ty, lbl(c, av, 0), fs, c.C.ink, av >= 0 ? 'start' : 'end', wt);
          } else if (lab) {
            b += txt(cx0 + cwid, ty, lbl(c, ac[i], 0), fs, c.C.ink, 'end', wt);
          } else {
            b += ghost(c, cx0 + cwid * 0.3, cy - 0.8, cwid * 0.7, Math.max(1.2, rh * 0.22), c.C.ghost2);
          }
        } else if (cl.k === 'num') {
          if (lab) b += txt(cx0 + cwid, ty, isKpi ? lbl(c, V[cl.ref][i], 1) + ' %' : lbl(c, V[cl.ref][i], 0), fs, c.C.sub, 'end', wt, null, isKpi ? 'i' : null);
        } else if (cl.k === 'bar') {
          var dv = n(ac[i] - V[cl.ref][i]), colr = dcol(c, dv), ax = cl.ax;
          if (isKpi) {
            if (lab) b += ax > mid ? txt(ax - 3, ty, pplbl(c, dv), fs, colr, 'end', null, null, 'i')
                                   : txt(ax + 3, ty, pplbl(c, dv), fs, colr, 'start', null, null, 'i');
            continue;
          }
          var len = Math.max(dv === 0 ? 0 : 1.2, Math.abs(dv) * cl.ppu);
          var fcB = cl.ref === 'FC';
          b += fcB ? rect(dv >= 0 ? ax : ax - len, cy - bh / 2, len, bh, dFill(c, hh, dv, len), colr, 0.8)
                   : rect(dv >= 0 ? ax : ax - len, cy - bh / 2, len, bh, colr);
          if (lab) b += txt(edgeX(dv, dv >= 0 ? ax + len : ax - len, 2, dlbl(c, dv), fs, cl.x, cl.x + cl.w), ty, dlbl(c, dv), fs, colr, dv >= 0 ? 'start' : 'end', wt);
        } else if (cl.k === 'pin') {
          if (isKpi) continue;
          var ref = V[cl.ref][i], axp = cl.ax;
          var pv = ref ? n((ac[i] - ref) / Math.abs(ref) * 100) : 0, colp = dcol(c, pv);
          var over = Math.abs(pv) > 40, pvc = clamp(pv, -40, 40);
          var px = axp + pvc * cl.ppu, r = clamp(rh * 0.17, 1.2, 2.6) * (over ? 0.75 : 1);
          b += ln(axp, cy, px, cy, colp, 1.4);
          b += cl.ref === 'FC' ? circ(px, cy, r, c.C.paper, colp, 1.1) : circ(px, cy, r, colp);
          if (lab) {
            var tp = plbl(c, pv) + (over ? '▸' : '');
            b += txt(edgeX(pv, pv >= 0 ? px + r : px - r, 2, tp, fs, cl.x, cl.x + cl.w), ty, tp, fs, colp, pv >= 0 ? 'start' : 'end', wt);
          }
        } else if (cl.k === 'mini') {
          b += pnlMini(c, tree, dRef, V, i, isKpi, cx0 + 3, y + 1.5, cwid - 6, rh - 3, hh);
        }
      }
    }
    return wrap(c, b);
  };

  /* Mini-Grafik je GuV-Zeile (o.treeCard). */
  function pnlMini(c, tree, ref, V, i, isKpi, x, y, w, h, hh) {
    var b = '', k3, m = 6;
    if (w < 8 || h < 3) return '';
    var av = V.AC[i], rv = V[ref][i];
    if (tree === 'bridge') {
      /* Ref → Δ → AC. Die Säulen stehen auf einer gekappten Basis (Beträge),
         sonst verschwände das Δ neben den großen Summen; der Knick unten
         zeigt die Kappung an. */
      var d = n(av - rv), ra = Math.abs(rv), aa = Math.abs(av), dd0 = Math.abs(aa - ra);
      var base = Math.max(0, Math.min(ra, aa) - Math.max(dd0 * 1.6, Math.max(ra, aa) * 0.04));
      var s = sc(base, Math.max(ra, aa) * 1.001 + 1e-6, y + h, y + 0.5), st = w / 3, bw = st * 0.62;
      var x1 = x + (st - bw) / 2, x2 = x1 + st, x3 = x2 + st, yb = y + h;
      b += refShape(c, x1, s(ra), bw, Math.max(0.8, yb - s(ra)), ref, hh);
      b += rect(x2, Math.min(s(ra), s(aa)), bw, Math.max(0.9, Math.abs(s(aa) - s(ra))), dcol(c, d));
      b += rect(x3, s(aa), bw, Math.max(0.8, yb - s(aa)), c.C.ac);
      b += ln(x1 + bw, s(ra), x2, s(ra), c.C.hair, 0.7) + ln(x2 + bw, s(aa), x3, s(aa), c.C.hair, 0.7);
      b += ln(x, yb, x + w, yb, c.C.axis, 0.8);
      return b;
    }
    var mA = [], mR = [];
    for (k3 = 0; k3 < m; k3++) {
      var f = (0.86 + Math.sin(k3 + i) * 0.08 + c.rnd() * 0.08) / m;
      mA.push(n(av * f * (isKpi ? m : 1))); mR.push(n(rv * f * (isKpi ? m : 1) * (0.96 + c.rnd() * 0.08)));
    }
    var sl = slots(x, w, m, 0.3);
    if (tree === 'delta') {
      var dd = diffs(mA, mR), mx = maxOf(dd);
      var sd = sc(-mx, mx, y + h, y), zd = sd(0);
      for (k3 = 0; k3 < m; k3++) {
        var yy = sd(dd[k3]);
        b += rect(sl[k3].x, Math.min(zd, yy), sl[k3].w, Math.max(0.8, Math.abs(zd - yy)), dcol(c, dd[k3]));
      }
      b += ln(x, zd, x + w, zd, c.C.axis, 0.7);
      return b;
    }
    // months: AC gegen Referenz, Referenz versetzt dahinter
    var lo2 = Math.min(0, Math.min.apply(null, mA.concat(mR))), hi2 = Math.max(0, Math.max.apply(null, mA.concat(mR)));
    var s2 = sc(lo2, hi2 || 1, y + h, y), z2 = s2(0), cw = sl[0].step * 0.42, dx = sl[0].step * 0.1;
    for (k3 = 0; k3 < m; k3++) {
      b += refShape(c, sl[k3].cx - dx - cw / 2, Math.min(z2, s2(mR[k3])), cw, Math.max(0.8, Math.abs(z2 - s2(mR[k3]))), ref, hh);
      b += rect(sl[k3].cx + dx - cw / 2, Math.min(z2, s2(mA[k3])), cw, Math.max(0.8, Math.abs(z2 - s2(mA[k3]))), c.C.ac);
    }
    b += ln(x, z2, x + w, z2, c.C.axis, 0.7);
    return b;
  }

  /* ---- 26 · Heatmap, divergierend --------------------------------------- */
  S.heatmap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 4 : (c.dense ? 12 : 8);
    var rows = kcnt(c, c.small ? 3 : (c.dense ? 7 : 5), capR(c, 3, 10, 3, 16));
    var labW = c.lab ? labWid(c, rows, Math.min(c.iw * 0.28, tw('Service', c.fsA) + 5), 0.32) : 0, labH = c.lab ? c.fsA + 4 : 0;
    var P = area(c, { left: labW, top: labH });
    var cw = P.w / cols, ch = P.h / rows, i, j;
    var showV = c.lab && cw >= tw('+00', c.fs) + 2 && ch >= c.fs * 1.4;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        var v = Math.sin(i * 1.7 + j * 0.6) * 0.6 + (c.rnd() - 0.5) * 0.8;
        v = clamp(v, -1, 1);
        var a = Math.min(0.9, Math.abs(v) * 0.9 + 0.08);
        var neutral = Math.abs(v) < 0.12;
        var fill = neutral ? c.C.wash : mix(c.C.paper, dcol(c, v), a);
        var x = P.x + cw * j, y = P.y + ch * i;
        b += rect(x + 0.5, y + 0.5, Math.max(0.8, cw - 1), Math.max(0.8, ch - 1), fill);
        if (showV) b += txt(x + cw / 2, y + ch / 2 + c.fs * 0.34, dlbl(c, v * 12), c.fs, a > 0.55 && !neutral ? c.C.paper : c.C.ink, 'middle');
      }
      if (c.lab) b += rowLabel(c, P.x - 4, P.y + ch * i + ch / 2, c.cat[i % c.cat.length], labW - 4);
    }
    if (c.lab && cw >= tw('Mrz', c.fsA) + 2) for (j = 0; j < cols && j < 12; j++) {
      b += txt(P.x + cw * j + cw / 2, P.y - 3, c.mon[j % 12], c.fsA, c.C.txt, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 27 · Marimekko --------------------------------------------------- */
  S.marimekko = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : 5, capN(c, 3, 40, 3, 10)), segs = c.small ? 2 : 3, cols = [c.C.ac, c.C.g2, c.C.g3];
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0 });
    var wts = [], tot = 0, i, j;
    for (i = 0; i < cnt; i++) { var wv = (c.uc || c.uv) ? 1.4 - i * 1.0 / cnt + c.rnd() * 0.3 : 1.4 - i * 0.22 + c.rnd() * 0.3; wts.push(wv); tot += wv; }
    if (c.uv) {
      // o.values = Spaltenbreite (Betrag), die Segmentanteile bleiben synthetisch
      var mw = useVals(c, wts);
      tot = 0;
      for (i = 0; i < cnt; i++) { wts[i] = Math.abs(mw[i]); tot += wts[i]; }
    }
    var x = P.x, gap = c.small ? 1.5 : 2;
    var avail = P.w - gap * (cnt - 1);
    for (i = 0; i < cnt; i++) {
      var cw = avail * wts[i] / (tot || 1), y = P.y + P.h;
      var rest = 1;
      for (j = 0; j < segs; j++) {
        var frac = j === segs - 1 ? rest : rest * (0.4 + c.rnd() * 0.3);
        var sh = P.h * frac;
        b += rect(x, y - sh, Math.max(0.9, cw), Math.max(0.9, sh), cols[j % cols.length]);
        if (j) b += ln(x, y, x + cw, y, c.C.paper, 0.8);
        if (c.lab && cw >= tw('00%', c.fs) + 3 && sh >= c.fs * 1.3) {
          b += txt(x + cw / 2, y - sh / 2 + c.fs * 0.34, lbl(c, frac * 100, 0) + '%', c.fs, j === 2 ? c.C.ink : c.C.paper, 'middle');
        }
        y -= sh; rest -= frac;
        if (rest < 0.05) rest = 0.05;
      }
      if (c.lab && cw >= 14) b += txt(x + cw / 2, c.y1 - 0.5, fit(c, c.cat[i % c.cat.length], cw, c.fsA), c.fsA, c.C.txt, 'middle');
      x += cw + gap;
    }
    b += baseH(c, P.x, P.x + P.w, P.y + P.h, 'AC');
    return wrap(c, b);
  };

  /* ---- 28 · Treiberbaum ------------------------------------------------- */
  S.tree = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var kids = kcnt(c, c.small ? 2 : 3, c.small ? 2 : Math.max(2, Math.min(8, Math.floor(c.ih / 16))));
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var bw = Math.min(P.w * 0.36, 96), bh = Math.min(P.h / kids * 0.78, c.lab ? c.fs * 3.6 : 22);
    var rx = P.x, ry = P.y + P.h / 2 - bh / 2;
    var cx = P.x + P.w - bw, i;
    var step = P.h / kids;
    function node(x, y, name, v, d, root2) {
      var s = rrect(x, y, bw, bh, 2, c.C.paper, root2 ? c.C.ink : c.C.edge, 1);
      var col = dcol(c, d);
      s += rect(x, y + 2, 2, bh - 4, col);
      if (c.lab && bh >= c.fs * 2.6) {
        s += txt(x + 5, y + c.fs * 1.1, fit(c, name, bw - 8), c.fs, c.C.sub, 'start');
        s += txt(x + 5, y + c.fs * 2.35, fit(c, vlbl(c, v, 1), bw - 8, c.fs * 1.1), c.fs * 1.1, c.C.ink, 'start', '700');
        var dl = dvlbl(c, d) + ' Δ' + kind;
        if (bh >= c.fs * 3.4) s += txt(x + 5, y + c.fs * 3.35, fit(c, dl, bw - 8), c.fs * 0.9, col, 'start', '600');
      } else {
        s += ghost(c, x + 5, y + bh * 0.28, bw * 0.45, Math.max(1.2, bh * 0.12));
        s += rect(x + 5, y + bh * 0.56, Math.max(1, bw * 0.6), Math.max(1.4, bh * 0.16), c.C.ac);
      }
      return s;
    }
    // o.values = Werte der Treiber (Wurzel = Summe), o.refValues = Bezug für die Δ
    var kv = null, kr = null;
    if (c.uv) { kv = useVals(c, vals(c, kids, 35, 30)); kr = useRef(c, derive(c, kv, 0.9, 1.1)); }
    b += kv ? node(rx, ry, c.t.revenue, sum(kv), n(sum(kv) - sum(kr)), true) : node(rx, ry, c.t.revenue, 84.2, 3.1, true);
    for (i = 0; i < kids; i++) {
      var ky = P.y + step * i + step / 2 - bh / 2;
      var mid = rx + bw + (cx - rx - bw) / 2;
      b += pathEl('M' + n(rx + bw) + ' ' + n(ry + bh / 2) + ' H' + n(mid) + ' V' + n(ky + bh / 2) + ' H' + n(cx), 'none', c.C.hair, 1);
      b += kv ? node(cx, ky, c.cat[i % c.cat.length], kv[i], n(kv[i] - kr[i]), false)
              : node(cx, ky, c.cat[i % c.cat.length], 20 + c.rnd() * 30, (c.rnd() - 0.4) * 6, false);
    }
    return wrap(c, b);
  };

  /* ---- 29 · Boxplot ----------------------------------------------------- */
  S.boxplot = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capN(c, 3, 18, 3, 16));
    var P = area(c, { bottom: c.lab ? c.fsA + 5 : 0, top: 3 });
    var s = sc(0, 100, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.5), i;
    /* o.values = Median je Kategorie; Quartile und Whisker synthetisch
       in der Größenordnung der Werte, Skala über alle Boxen.               */
    var BX = null;
    if (c.uv) {
      var md = useVals(c, vals(c, cnt, 50, 30)), u = 0, bl = 0, bh2 = 0;
      for (i = 0; i < cnt; i++) u += Math.abs(md[i]);
      u = (u / cnt || 1) * 0.16;
      BX = [];
      for (i = 0; i < cnt; i++) {
        var q1b = md[i] - u * (0.8 + c.rnd()), q3b = md[i] + u * (0.8 + c.rnd());
        var e = { med: md[i], q1: q1b, q3: q3b, lo: q1b - u * (0.8 + c.rnd() * 1.2), hi: q3b + u * (0.8 + c.rnd() * 1.2) };
        BX.push(e);
        bl = i ? Math.min(bl, e.lo) : e.lo; bh2 = i ? Math.max(bh2, e.hi) : e.hi;
      }
      var pd = (bh2 - bl) * 0.06 || 1;
      s = sc(bl - pd, bh2 + pd, P.y + P.h, P.y);
    }
    for (i = 0; i < cnt; i++) {
      var med = 35 + c.rnd() * 30;
      var q1 = med - (8 + c.rnd() * 10), q3 = med + (8 + c.rnd() * 10);
      var lo = q1 - (8 + c.rnd() * 12), hi = q3 + (8 + c.rnd() * 12);
      if (BX) { med = BX[i].med; q1 = BX[i].q1; q3 = BX[i].q3; lo = BX[i].lo; hi = BX[i].hi; }
      var cxp = sl[i].cx, bwid = sl[i].w;
      b += ln(cxp, s(hi), cxp, s(lo), c.C.ink, 0.9);
      b += ln(cxp - bwid * 0.25, s(hi), cxp + bwid * 0.25, s(hi), c.C.ink, 0.9);
      b += ln(cxp - bwid * 0.25, s(lo), cxp + bwid * 0.25, s(lo), c.C.ink, 0.9);
      b += rect(sl[i].x, s(q3), bwid, Math.max(0.9, s(q1) - s(q3)), c.C.py);
      b += ln(sl[i].x, s(med), sl[i].x + bwid, s(med), c.C.ac, 1.8);
    }
    b += baseH(c, P.x, P.x + P.w, P.y + P.h, 'AC');
    b += monLabels(c, sl, c.y1 - 0.5, c.cat);
    return wrap(c, b);
  };

  /* ---- 30 · KPI-Karte im Zuschnitt der ChartKitchen-Monitoring-Karte -----
     Karte mit feinem Rand, Status-Akzent links in Abweichungsfarbe, grauer
     Titel, große fette Zahl mit Einheit, Δ-Zeile „ΔPL +2,4 · +5%" farbig,
     darunter bei Platz eine Sparkline mit hellem Band.                     */
  S.kpi = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var kind = refKind(c) || 'PL';
    var d = n((c.rnd() - 0.35) * 18);
    var vv = Math.round((40 + c.rnd() * 900) * 10) / 10;
    var dAbs = n(vv * d / 100);
    if (c.uv) {
      // o.values[0] = die große Zahl, o.refValues[0] = Bezug (sonst Δ% synthetisch)
      vv = first(c.uv);
      var rk = c.ur ? first(c.ur) : null;
      if (rk != null) { dAbs = n(vv - rk); d = rk ? n((vv - rk) / Math.abs(rk) * 100) : 0; }
      else dAbs = n(vv * d / 100);
    }
    var col = dcol(c, d);
    var card = P.w >= 40 && P.h >= 26;
    var accW = clamp(P.w * 0.018, 2, 4);
    if (card) {
      b += rrect(P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1, 3, c.C.paper, c.C.edge, 1);
      b += rrect(P.x + 0.5, P.y + 0.5, accW, P.h - 1, Math.min(2, accW / 2), col);
    }
    var padX = card ? Math.min(10, P.w * 0.06) : 0;
    var L = P.x + (card ? accW + padX : 0), R = P.x + P.w - (card ? padX * 0.7 : 0);
    var iw = Math.max(6, R - L);
    var kpiLabel = (o && o.label !== undefined) ? String(o.label) : c.t.revenue;
    var tFs = c.fsT;
    var titleH = (!c.small && kpiLabel && P.h >= 34) ? tFs + 4 : 0;
    var uStr = c.unit || 'M';
    var num = lbl(c, vv);
    if (c.real) { var fpk = fmtParts(c, vv); num = fpk.num; uStr = fpk.suf + (c.unit ? ' ' + c.unit : ''); }
    var full = num + uStr;
    var bigCap = c.fsV || clamp(P.h * 0.27, 10, 40 * c.fk);
    var big = Math.min(bigCap, iw / (full.length * 0.6));
    if (!(big > 4)) big = 4;
    var dFs = c.fs;
    var dParts = [['Δ' + kind + ' ', c.C.sub, null]];
    var dTxt = c.vAbs && c.vRel ? dvlbl(c, dAbs) + ' · ' + plbl(c, d) : (c.vRel ? plbl(c, d) : dvlbl(c, dAbs));
    dParts.push([dTxt, col, '700']);
    var dOn = c.vAbs || c.vRel;
    var dRowH = dOn ? dFs + 5 : 0;
    var padY = card ? Math.min(10, P.h * 0.08) : 0;
    var blockH = titleH + big * 0.95 + dRowH;
    var spare = P.h - padY * 2 - blockH;
    var sparkOn = spare >= 18 && iw >= 50 && !c.small;
    var T = P.y + padY + (sparkOn ? 0 : Math.max(0, spare / 2));
    if (titleH) b += txt(L, T + tFs * 0.85, fit(c, kpiLabel, iw, tFs), tFs, c.C.sub, 'start');
    var yBig = T + titleH + big * 0.8;
    b += '<text x="' + n(L) + '" y="' + n(yBig) + '" font-size="' + n(big) + '" font-weight="700" fill="' + c.C.ink + '">' +
         esc(num) + '<tspan font-size="' + n(big * 0.72) + '" font-weight="600">' + esc(uStr) + '</tspan></text>';
    if (dOn) {
      var yD = yBig + big * 0.15 + dFs + 3;
      if (yD <= P.y + P.h - 1) {
        if (tw('x'.repeat(richLen(dParts)), dFs) > iw) dParts[1][0] = c.vRel ? plbl(c, d) : dvlbl(c, dAbs);
        if (tw('x'.repeat(richLen(dParts)), dFs) > iw) dParts.shift();
        if (tw('x'.repeat(richLen(dParts)), dFs) <= iw) b += rich(L, yD, dParts, dFs, 'start');
      }
    }
    if (sparkOn) {
      var sh = Math.min(spare - 10, P.h * 0.42), sy = P.y + P.h - padY - sh;
      var pts = sparkPts(c, 12, L, sy, iw - 3, sh);
      b += polygonEl(pts.concat([[L + iw - 3, sy + sh], [L, sy + sh]]), c.C.wash);
      b += polyline(pts, c.C.py, 1.3);
      b += circ(pts[11][0], pts[11][1], 2, c.C.ac);
    }
    return wrap(c, b);
  };

  /* ---- 31 · Streudiagramm mit Quadranten -------------------------------- */
  S.scatter = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 7 : (c.dense ? 24 : 14);
    var P = area(c, { left: c.lab ? tw('00', c.fsA) + 4 : 0, bottom: c.lab ? c.fsA + 4 : 0 });
    b += ln(P.x + P.w / 2, P.y, P.x + P.w / 2, P.y + P.h, c.C.grid, 1, '3 2');
    b += ln(P.x, P.y + P.h / 2, P.x + P.w, P.y + P.h / 2, c.C.grid, 1, '3 2');
    var i, r;
    for (i = 0; i < cnt; i++) {
      r = c.small ? 1.5 : 1.8 + c.rnd() * 2.2;
      var x = P.x + r + 1 + c.rnd() * (P.w - 2 * r - 2);
      var y = P.y + r + 1 + c.rnd() * (P.h - 2 * r - 2);
      b += circ(x, y, r, i % 5 === 0 ? c.C.ac : mix(c.C.py, c.C.paper, 0.1), c.C.paper, 0.6);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1);
    if (c.lab) {
      b += txt(P.x - 3, P.y + c.fsA * 0.8, '50', c.fsA, c.C.txt, 'end');
      b += txt(P.x - 3, P.y + P.h, '0', c.fsA, c.C.txt, 'end');
      b += txt(P.x + P.w, c.y1 - 0.5, '100', c.fsA, c.C.txt, 'end');
    }
    return wrap(c, b);
  };

  /* ---- 32 · Gantt ------------------------------------------------------- */
  S.gantt = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 11, 3, 20));
    var labW = c.lab ? labWid(c, cnt, Math.min(c.iw * 0.24, tw('Service', c.fsA) + 5)) : 0;
    var headH = c.lab ? c.fsA + 5 : 0;
    var P = area(c, { left: labW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.38), i;
    for (i = 0; i < 4; i++) {
      b += ln(P.x + P.w * (i / 4), P.y, P.x + P.w * (i / 4), P.y + P.h, c.C.grid, 1);
      if (c.lab) b += txt(P.x + P.w * (i / 4) + 2, P.y - 3, 'Q' + (i + 1), c.fsA, c.C.txt, 'start');
    }
    for (i = 0; i < cnt; i++) {
      var st = c.rnd() * 0.5, len = 0.18 + c.rnd() * 0.42;
      if (st + len > 0.98) len = 0.98 - st;
      var bx = P.x + P.w * st, bwid = Math.max(1.2, P.w * len);
      b += rrect(bx, rw[i].y, bwid, rw[i].h, Math.min(2, rw[i].h / 3), i % 3 === 0 ? c.C.ac : c.C.py);
      var done = 0.3 + c.rnd() * 0.6;
      if (i % 3 !== 0) b += rrect(bx, rw[i].y, bwid * done, rw[i].h, Math.min(2, rw[i].h / 3), c.C.g2);
      if (c.lab) b += rowLabel(c, P.x - 4, rw[i].cy, c.cat[i % c.cat.length], labW - 4);
    }
    b += ln(P.x + P.w * 0.62, P.y - 1, P.x + P.w * 0.62, P.y + P.h + 1, c.C.bad, 1, '3 2');
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ====================================================================== */
  /*  Native Power-BI-Visuals (Standarddesign)                              */
  /* ====================================================================== */

  // Schöne Achsenschritte
  function niceMax(v, ticks) {
    var raw = v / Math.max(1, ticks), p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var m = raw / p, st = m <= 1 ? 1 : (m <= 2 ? 2 : (m <= 2.5 ? 2.5 : (m <= 5 ? 5 : 10)));
    return { step: st * p, max: st * p * Math.max(1, ticks) };
  }
  // Legende oben links wie im Standarddesign: Kreis + Name
  function nLegend(c, x, y, names, cols, xMax) {
    var s = '', i, cx = x, r = c.fsA * 0.34;
    for (i = 0; i < names.length; i++) {
      var wN = tw(names[i], c.fsA);
      if (cx + r * 2 + 3 + wN > xMax) break;
      s += circ(cx + r, y - c.fsA * 0.32, r, cols[i % cols.length]);
      s += txt(cx + r * 2 + 3, y, names[i], c.fsA, c.C.nTxt, 'start');
      cx += r * 2 + 3 + wN + c.fsA * 1.1;
    }
    return s;
  }
  function nUnit(c) { return c.lang === 'en' ? 'M' : ' Mio.'; }
  /* Gemeinsames Gerüst für Säule/Balken/Linie: Legende, Wertachse mit
     Gitterlinien, Kategorien. Liefert die Zeichenfläche und die Skala.     */
  function nFrame(c, max, horiz, names) {
    var b = '';
    var legH = (c.lab && names.length > 1) ? c.fsA + 6 : 0;
    var ticks = c.h >= 150 ? 4 : 3;
    var nm = niceMax(max * 1.05, ticks), i;
    var tl = [];
    for (i = 0; i <= ticks; i++) tl.push(lbl(c, nm.step * i, 0) + (i ? nUnit(c) : ''));
    var wT = 0;
    for (i = 0; i < tl.length; i++) wT = Math.max(wT, tw(tl[i], c.fsA));
    var labW = c.lab ? (horiz ? labWid(c, c.cat.length, Math.min(c.iw * 0.24, tw('Service', c.fsA) + 6)) : wT + 5) : 0;
    var botH = c.lab ? c.fsA + 5 : 0;
    var P = area(c, { left: labW, top: legH + (c.lab ? (horiz ? 2 : c.fsA * 0.7) : 0), bottom: botH, right: horiz && c.lab ? tw(tl[ticks], c.fsA) / 2 : 0 });
    if (legH) b += nLegend(c, c.x0, c.y0 + c.fsA * 0.9, names, c.C.pbi, c.x1);
    var s;
    if (!horiz) {
      s = sc(0, nm.max, P.y + P.h, P.y);
      for (i = 0; i <= ticks; i++) {
        var yy = s(nm.step * i);
        b += ln(P.x, yy, P.x + P.w, yy, c.C.nGrid, 0.8, i ? '1 1.5' : null);
        if (c.lab) b += txt(P.x - 4, yy + c.fsA * 0.34, tl[i], c.fsA, c.C.nTxt, 'end');
      }
    } else {
      s = sc(0, nm.max, P.x, P.x + P.w);
      for (i = 0; i <= ticks; i++) {
        var xx = s(nm.step * i);
        b += ln(xx, P.y, xx, P.y + P.h, c.C.nGrid, 0.8, i ? '1 1.5' : null);
        if (c.lab) b += txt(xx, c.y1 - 0.5, tl[i], c.fsA, c.C.nTxt, i === 0 ? 'start' : 'middle');
      }
    }
    return { P: P, s: s, body: b };
  }
  /* Gerüst mit echten Werten (o.values): Achse ab dem kleinsten Wert (auch
     negativ), Ticks in einer gemeinsamen Einheit (Tsd./Mio./… nach dem
     größten Tick), Nulllinie durchgezogen. lw = Platz für Datenbeschriftung
     (vertikal oben/unten, horizontal rechts/links).                        */
  function axisLbl(c, tv, st) {
    var m = 0, i, u = null, U = UNITS[c.lang] || UNITS.de, out = [];
    for (i = 0; i < tv.length; i++) m = Math.max(m, Math.abs(tv[i]));
    for (i = 0; i < U.length && !u; i++) if (m >= U[i][0]) u = U[i];
    var k = u ? u[0] : 1, r = st / k;
    var d = r >= 1 - 1e-9 ? 0 : (r >= 0.1 - 1e-9 ? 1 : 2);
    if (!u) d = Math.max(d, Math.min(2, c.vdec || 0));
    for (i = 0; i < tv.length; i++) out.push(Math.abs(tv[i]) < st * 1e-6 ? '0' : lbl(c, tv[i] / k, d) + (u ? u[1] : ''));
    return out;
  }
  function nFrameReal(c, hi, lo, horiz, names, lw) {
    var b = '', i;
    var legH = (c.lab && names.length > 1) ? c.fsA + 6 : 0;
    var ticks = c.h >= 150 ? 4 : 3;
    lo = Math.min(0, lo || 0); hi = Math.max(0, hi || 0);
    if (!(hi - lo > 0)) hi = 1;
    var st = niceMax((hi - lo) * 1.05, ticks).step;
    var k0 = lo < 0 ? Math.floor(lo * 1.05 / st - 1e-9) : 0;
    var k1 = hi > 0 ? Math.ceil(hi * 1.05 / st - 1e-9) : 0;
    if (k1 <= k0) k1 = k0 + 1;
    var tv = [];
    for (i = k0; i <= k1; i++) tv.push(n(i * st) || 0);
    var tl = axisLbl(c, tv, st), wT = 0;
    for (i = 0; i < tl.length; i++) wT = Math.max(wT, tw(tl[i], c.fsA));
    var labW = c.lab ? (horiz ? labWid(c, c.cat.length, Math.min(c.iw * 0.24, tw('Service', c.fsA) + 6)) : wT + 5) : 0;
    var botH = c.lab ? c.fsA + 5 : 0;
    lw = lw || 0;
    var P = horiz
      ? area(c, { left: labW + (lo < 0 ? lw : 0), top: legH + (c.lab ? 2 : 0), bottom: botH,
                  right: c.lab ? Math.max(tw(tl[tl.length - 1], c.fsA) / 2, lw) : 0 })
      : area(c, { left: labW, top: legH + (c.lab ? c.fsA * 0.7 : 0) + (lw ? c.fs * 0.9 : 0), bottom: botH + (lo < 0 && lw ? c.fs * 1.2 : 0) });
    if (legH) b += nLegend(c, c.x0, c.y0 + c.fsA * 0.9, names, c.C.pbi, c.x1);
    var s = horiz ? sc(tv[0], tv[tv.length - 1], P.x, P.x + P.w) : sc(tv[0], tv[tv.length - 1], P.y + P.h, P.y);
    var every = 1;
    if (horiz) { while (every < 4 && P.w / (tv.length - 1) * every < wT + 4) every++; }
    for (i = 0; i < tv.length; i++) {
      var q = s(tv[i]), zero = tv[i] === 0;
      if (!horiz) {
        b += ln(P.x, q, P.x + P.w, q, zero ? c.C.nTxt : c.C.nGrid, 0.8, zero ? null : '1 1.5');
        if (c.lab) b += txt(P.x - 4, q + c.fsA * 0.34, tl[i], c.fsA, c.C.nTxt, 'end');
      } else {
        b += ln(q, P.y, q, P.y + P.h, zero ? c.C.nTxt : c.C.nGrid, 0.8, zero ? null : '1 1.5');
        if (c.lab && i % every === 0) {
          var hw2 = tw(tl[i], c.fsA) / 2;
          b += txt(clamp(q, c.x0 + hw2, c.x1 - hw2), c.y1 - 0.5, tl[i], c.fsA, c.C.nTxt, 'middle');
        }
      }
    }
    return { P: P, s: s, body: b, z: s(0) };
  }
  // Name der Referenzreihe in der Legende: mit echten Werten nach Bezug
  function refName(c) {
    if (!c.real) return c.t.prior;
    return c.basis === 'PL' ? 'Plan' : (c.basis === 'BU' ? 'Budget' : c.t.prior);
  }
  /* Kategorienamen unter Säulen: kürzen (Ellipse) statt überlappen; erst
     wenn nicht einmal „Xx…" passt, nur jede zweite/dritte.                  */
  function fitCats(c, sl, y, names, fill, bold) {
    var b = '', i, t, wmax = 0, every = 1;
    for (i = 0; i < sl.length; i++) wmax = Math.max(wmax, tw(names[i % names.length], c.fsA));
    var need = Math.min(wmax, tw('Xx…', c.fsA)), avail;
    while (every < 6 && sl[0].step * every - 3 < need) every++;
    avail = sl[0].step * every - 3;
    if (avail < need) return '';
    for (i = 0; i < sl.length; i += every) {
      t = fit(c, names[i % names.length], avail, c.fsA);
      if (!t) continue;
      var w3 = tw(t, c.fsA) / 2;
      b += txt(clamp(sl[i].cx, c.x0 + w3, c.x1 - w3), y, t, c.fsA, fill, 'middle', bold && bold[i] ? '600' : null);
    }
    return b;
  }
  // Datenbeschriftung über/unter einer Säule (nur mit echten Werten)
  function nColLbl(c, x, yv, z, v, room, top) {
    var t = fmt(c, v);
    if (!c.lab || tw(t, c.fs) > room) return '';
    var y = v >= 0 ? Math.max(yv - 3, top) : Math.max(yv, z) + c.fs * 0.95;
    return txt(x, y, t, c.fs, c.C.nTxt, 'middle', null, c.C.paper);
  }
  function nCats(c, sl, y) {
    if (!c.lab) return '';
    if (c.uc) return fitCats(c, sl, y, c.cat, c.C.nTxt);
    var b = '', i, every = 1, wmax = 0;
    for (i = 0; i < sl.length; i++) wmax = Math.max(wmax, tw(c.mon[i % 12], c.fsA));
    while (every < 6 && sl[0].step * every < wmax + 3) every++;
    for (i = 0; i < sl.length; i += every) {
      var w2 = tw(c.mon[i % 12], c.fsA) / 2;
      b += txt(clamp(sl[i].cx, c.x0 + w2, c.x1 - w2), y, c.mon[i % 12], c.fsA, c.C.nTxt, 'middle');
    }
    return b;
  }

  /* ---- Säulendiagramm (nativ, gruppiert) --------------------------------- */
  S.ncolumn = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 4 : (c.dense ? 12 : 6), capN(c, 4, 16)), i;
    var two = !c.small && c.w >= 200;
    var a = useVals(c, series(c, cnt, 60, 22)), p = two ? useRef(c, derive(c, a, 0.8, 1.05)) : null;
    var names = two ? [c.t.revenue, refName(c)] : [c.t.revenue];
    if (c.real) {
      // echte Werte: Nulllinie, Säulen nach unten bei negativen Werten, Datenbeschriftung
      var spN = span(a, p);
      var FR = nFrameReal(c, spN.hi, spN.lo, false, names, c.lab ? 1 : 0);
      b += FR.body;
      var slR = slots(FR.P.x, FR.P.w, cnt, 0.3);
      /* Beschriftung: passen beide Reihen (Abstand der Säulenmitten), dann
         beide; sonst nur die Hauptreihe über der höheren Säule der Gruppe. */
      var bw0 = two ? slR[0].w / 2 : slR[0].w;
      var both = two && Math.max(vmaxW(c, a), vmaxW(c, p)) <= bw0 - 1;
      for (i = 0; i < cnt; i++) {
        var bwR = two ? slR[i].w / 2 : slR[i].w, room = two ? (both ? bwR - 1 : slR[i].w - 1) : slR[i].step - 1;
        var ya = FR.s(a[i]), yp = two ? FR.s(p[i]) : ya;
        b += rect(slR[i].x, Math.min(FR.z, ya), bwR, Math.max(0.8, Math.abs(FR.z - ya)), c.C.pbi[0]);
        if (two) b += rect(slR[i].x + bwR, Math.min(FR.z, yp), bwR, Math.max(0.8, Math.abs(FR.z - yp)), c.C.pbi[1]);
        var wide2 = two && !both && tw(fmt(c, a[i]), c.fs) > bwR - 1;
        b += nColLbl(c, slR[i].x + bwR / 2, wide2 ? (a[i] >= 0 ? Math.min(ya, yp) : Math.max(ya, yp)) : ya, FR.z, a[i], room, c.y0 + c.fs * 0.8);
        if (both) b += nColLbl(c, slR[i].x + bwR * 1.5, yp, FR.z, p[i], room, c.y0 + c.fs * 0.8);
      }
      b += nCats(c, slR, c.y1 - 0.5);
      return wrap(c, b);
    }
    var F = nFrame(c, Math.max(maxOf(a), p ? maxOf(p) : 0), false, names);
    b += F.body;
    var sl = slots(F.P.x, F.P.w, cnt, 0.3);
    for (i = 0; i < cnt; i++) {
      var bw = two ? sl[i].w / 2 : sl[i].w;
      b += rect(sl[i].x, F.s(a[i]), bw, Math.max(0.8, F.P.y + F.P.h - F.s(a[i])), c.C.pbi[0]);
      if (two) b += rect(sl[i].x + bw, F.s(p[i]), bw, Math.max(0.8, F.P.y + F.P.h - F.s(p[i])), c.C.pbi[1]);
    }
    b += nCats(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- Balkendiagramm (nativ, gruppiert) --------------------------------- */
  S.nbar = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = kcnt(c, c.small ? 3 : (c.dense ? 8 : 5), capR(c, 3, 11, 3, 20)), i;
    var two = !c.small && c.h >= 110;
    var a = useVals(c, sortDesc(vals(c, cnt, 60, 60))), p = two ? useRef(c, derive(c, a, 0.8, 1.05)) : null;
    var names = two ? [c.t.revenue, refName(c)] : [c.t.revenue];
    if (c.real) {
      // echte Werte: Nulllinie, Balken nach links bei negativen Werten, Wert am Balkenende
      var spB = span(a, p), lwB = c.lab ? Math.max(vmaxW(c, a), p ? vmaxW(c, p) : 0) + 4 : 0;
      var FB = nFrameReal(c, spB.hi, spB.lo, true, names, lwB);
      b += FB.body;
      var rwB = rowsOf(FB.P.y, FB.P.h, cnt, 0.3);
      var bar = function (v, y, hgt, col) {
        var xv = FB.s(v), out = rect(Math.min(FB.z, xv), y, Math.max(0.8, Math.abs(xv - FB.z)), hgt, col);
        if (c.lab && hgt >= c.fs * 0.8) {
          out += v >= 0 ? txt(Math.max(xv, FB.z) + 3, y + hgt / 2 + c.fs * 0.34, fmt(c, v), c.fs, c.C.nTxt, 'start')
                        : txt(Math.min(xv, FB.z) - 3, y + hgt / 2 + c.fs * 0.34, fmt(c, v), c.fs, c.C.nTxt, 'end');
        }
        return out;
      };
      for (i = 0; i < cnt; i++) {
        var bhB = two ? rwB[i].h / 2 : rwB[i].h;
        b += bar(a[i], rwB[i].y, bhB, c.C.pbi[0]);
        if (two) b += bar(p[i], rwB[i].y + bhB, bhB, c.C.pbi[1]);
        if (c.lab) b += txt(c.x0 + (FB.P.x - c.x0 - (spB.lo < 0 ? lwB : 0)) - 4, rwB[i].cy + c.fsA * 0.34,
                            fit(c, c.cat[i % c.cat.length], FB.P.x - c.x0 - (spB.lo < 0 ? lwB : 0) - 4, c.fsA), c.fsA, c.C.nTxt, 'end');
      }
      return wrap(c, b);
    }
    var F = nFrame(c, Math.max(maxOf(a), p ? maxOf(p) : 0), true, names);
    b += F.body;
    var rw = rowsOf(F.P.y, F.P.h, cnt, 0.3);
    for (i = 0; i < cnt; i++) {
      var bh = two ? rw[i].h / 2 : rw[i].h;
      b += rect(F.P.x, rw[i].y, Math.max(0.8, F.s(a[i]) - F.P.x), bh, c.C.pbi[0]);
      if (two) b += rect(F.P.x, rw[i].y + bh, Math.max(0.8, F.s(p[i]) - F.P.x), bh, c.C.pbi[1]);
      if (c.lab) b += txt(F.P.x - 4, rw[i].cy + c.fsA * 0.34, fit(c, c.cat[i % c.cat.length], F.P.x - c.x0 - 4, c.fsA), c.fsA, c.C.nTxt, 'end');
    }
    return wrap(c, b);
  };

  /* ---- Liniendiagramm (nativ) -------------------------------------------- */
  function nLines(c, fillArea) {
    var b = '';
    var cnt = kcnt(c, c.small ? 6 : 12, capN(c, 6, 14)), i;
    var two = !c.small && c.w >= 200 && !fillArea;
    var a = useVals(c, series(c, cnt, 60, 22)), p = two ? useRef(c, derive(c, a, 0.8, 1.02)) : null;
    var names = two ? [c.t.revenue, refName(c)] : [c.t.revenue];
    var spL = span(a, p);
    var F = c.real ? nFrameReal(c, spL.hi, spL.lo, false, names, c.lab ? 1 : 0)
                   : nFrame(c, Math.max(maxOf(a), p ? maxOf(p) : 0), false, names);
    b += F.body;
    var sl = slots(F.P.x, F.P.w, cnt, 0.3), pa = [], pp = [];
    for (i = 0; i < cnt; i++) { pa.push([sl[i].cx, F.s(a[i])]); if (p) pp.push([sl[i].cx, F.s(p[i])]); }
    if (fillArea) {
      var yB = c.real ? F.z : F.P.y + F.P.h;
      b += polygonEl(pa.concat([[sl[cnt - 1].cx, yB], [sl[0].cx, yB]]), c.C.pbi[0], null, 0, ' fill-opacity="0.3"');
    }
    if (p) b += polyline(pp, c.C.pbi[1], c.small ? 1.3 : 1.8);
    b += polyline(pa, c.C.pbi[0], c.small ? 1.3 : 1.8);
    if (c.real) {
      // Datenbeschriftung der Hauptreihe, wenn sie in den Slot passt
      for (i = 0; i < cnt; i++) b += nColLbl(c, pa[i][0], pa[i][1] - 1, pa[i][1] + 1, a[i], sl[i].step - 2, c.y0 + c.fs * 0.8);
    }
    b += nCats(c, sl, c.y1 - 0.5);
    return b;
  }
  S.nline = function (w, h, o) { var c = ctx(w, h, o); return wrap(c, nLines(c, false)); };

  /* ---- Flächendiagramm (nativ) ------------------------------------------- */
  S.area = function (w, h, o) { var c = ctx(w, h, o); return wrap(c, nLines(c, true)); };

  /* ---- Karte (Kennzahl) ---------------------------------------------------- */
  S.card = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var cnum = lbl(c, Math.round((20 + c.rnd() * 300) * 10) / 10);
    var unit = c.unit || nUnit(c).trim();
    var full = cnum + (c.lang === 'en' || c.unit ? '' : ' ') + unit;
    // o.values[0] = Kennzahl, Kürzung (Tsd./Mio./…) statt fester Einheit, o.unit dahinter
    if (c.uv) full = fmt(c, first(c.uv)) + (c.unit ? ' ' + c.unit : '');
    var cardLabel = (o && o.label !== undefined) ? String(o.label) : (c.t.revenue + ' ' + c.t.total);
    var labOn = !c.small && P.h >= 30 && !!cardLabel;
    var cap = c.fsV || clamp(P.h * (labOn ? 0.42 : 0.55), 8, 36 * c.fk);
    var big = Math.min(cap, P.w / (full.length * 0.58));
    var cx = P.x + P.w / 2;
    var blockH = big * 0.78 + (labOn ? c.fsT + 6 : 0);
    var yN = P.y + (P.h - blockH) / 2 + big * 0.78;
    b += txt(cx, yN, full, big, c.C.nTitle, 'middle', '600');
    if (labOn) b += txt(cx, yN + c.fsT + 5, fit(c, cardLabel, P.w, c.fsT), c.fsT, c.C.nTxt, 'middle');
    return wrap(c, b);
  };

  /* ---- Mehrzeilige Karte: Akzentbalken links, Werte gestapelt ------------- */
  S.multirow = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = kcnt(c, c.small ? 2 : (c.dense ? 5 : 3), c.small ? 2 : Math.max(1, Math.min(8, Math.floor((c.ih + 4) / 28))));
    var P = area(c, {});
    var gap = c.small ? 2 : 4;
    var rh = (P.h - gap * (rows - 1)) / rows, i;
    var names = c.uc || c.t.rows;
    var nums = [84.2, 31.7, 12.4, 268, 41];
    // o.cats = Zeilennamen, o.values = Zahlen je Zeile (o.unit dahinter)
    var mv = null;
    if (c.uv) {
      mv = [];
      for (i = 0; i < rows; i++) mv.push(nums[i % nums.length]);
      mv = useVals(c, mv);
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + (rh + gap) * i;
      b += rect(P.x, y, 3, rh, c.C.pbi[0]);
      var vs = c.fsV ? Math.min(c.fsV, rh * 0.6) : clamp(rh * 0.42, 7, 18 * c.fk);
      if (!c.small && P.w >= 80 && rh >= vs + c.fsT + 3) {
        b += txt(P.x + 9, y + rh * 0.5 + vs * 0.1, fit(c, mv ? fmt(c, mv[i]) + (c.unit ? ' ' + c.unit : '') : lbl(c, nums[i % nums.length]), P.w - 12, vs), vs, c.C.nTitle, 'start', '600');
        b += txt(P.x + 9, y + rh * 0.5 + vs * 0.1 + c.fsT + 3, fit(c, names[i % names.length], P.w - 12, c.fsT), c.fsT, c.C.nTxt, 'start');
      } else {
        b += rect(P.x + 7, y + rh * 0.28, Math.max(1.2, P.w * 0.34), Math.max(1.6, rh * 0.22), c.C.nTitle);
        b += ghost(c, P.x + 7, y + rh * 0.62, P.w * 0.5, Math.max(1.2, rh * 0.12));
      }
    }
    return wrap(c, b);
  };

  /* ---- Matrix (Standardstil: Kopf fett, Gesamtzeile/-spalte fett) --------- */
  S.matrix = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 3 : (c.dense ? 6 : 4);
    var rows = kcnt(c, c.small ? 3 : (c.dense ? 7 : 5), capR(c, 3, 12, 3, 20));
    var P = area(c, {});
    var lab = c.lab;
    var hw = P.w * (lab ? 0.26 : 0.28);
    var hh2 = lab ? c.fsT + 7 : Math.min(6, P.h * 0.16);
    var cw = (P.w - hw) / (cols + 1), rh = (P.h - hh2) / (rows + 1), i, j;
    var showV = lab && cw >= tw('00,0', c.fs) + 4 && rh >= c.fs * 1.2;
    // mehr eigene Zeilen: die Summen werden breiter
    if (c.uc && !c.uv && rows > 5) showV = showV && cw >= tw(lbl(c, 80 * cols * rows, 1), c.fs) + 4;
    /* o.values[i] = Zeilensumme; die Monatsspalten teilen sie synthetisch auf.
       Beschriftung nur, wenn die breiteste Zahl in die Spalte passt.        */
    var MX = null;
    if (c.uv) {
      var rt = [], shr = [], q, gt = 0, ct = [];
      for (i = 0; i < rows; i++) {
        var row = [], rs = 0;
        for (j = 0; j < cols; j++) { var sh = 20 + c.rnd() * 60; row.push(sh); rs += sh; }
        shr.push(row); rt.push(rs);
      }
      rt = useVals(c, rt);
      MX = [];
      for (j = 0; j <= cols; j++) ct.push(0);
      for (i = 0; i < rows; i++) {
        var srow = 0, mrow = [];
        for (q = 0; q < cols; q++) srow += shr[i][q];
        for (q = 0; q < cols; q++) { var cv = srow ? rt[i] * shr[i][q] / srow : 0; mrow.push(cv); ct[q] += cv; }
        ct[cols] += rt[i]; gt += rt[i];
        MX.push(mrow);
      }
      var mW = vmaxW(c, rt.concat(ct, [gt]));
      for (i = 0; i < rows; i++) mW = Math.max(mW, vmaxW(c, MX[i]));
      showV = lab && cw >= mW + 4 && rh >= c.fs * 1.2;
    }
    var tots = [];
    for (j = 0; j <= cols; j++) tots.push(0);
    if (showV) {
      b += txt(P.x + 2, P.y + hh2 - 5, c.t.region, c.fsT, c.C.nTitle, 'start', '600');
      for (j = 0; j <= cols; j++) {
        b += txt(P.x + hw + cw * (j + 1) - 3, P.y + hh2 - 5, fit(c, j < cols ? c.mon[j % 12] : c.t.grand, cw - 4, c.fsT), c.fsT, c.C.nTitle, 'end', '600');
      }
    } else {
      for (j = 0; j <= cols; j++) b += ghost(c, P.x + hw + cw * j + cw * 0.25, P.y + hh2 * 0.4, cw * 0.55, Math.max(1.2, hh2 * 0.22), c.C.ghost2);
    }
    b += ln(P.x, P.y + hh2, P.x + P.w, P.y + hh2, c.C.nTxt, 0.9);
    for (i = 0; i <= rows; i++) {
      var y = P.y + hh2 + rh * i, isT = i === rows, rsum = 0;
      if (isT) b += ln(P.x, y, P.x + P.w, y, c.C.nTxt, 0.9);
      else if (i) b += ln(P.x, y, P.x + P.w, y, c.C.nGrid, 0.7);
      var ty = y + rh * 0.5 + c.fs * 0.34;
      if (showV) {
        b += txt(P.x + 2, ty, fit(c, isT ? c.t.grand : c.cat[i % c.cat.length], hw - 4), c.fs, c.C.nTitle, 'start', isT ? '600' : null);
      } else {
        b += ghost(c, P.x + 2, y + rh * 0.4, hw * 0.6, Math.max(1.2, rh * 0.2), isT ? c.C.ghost2 : c.C.ghost);
      }
      for (j = 0; j <= cols; j++) {
        var v;
        if (isT) v = tots[j];
        else if (j === cols) v = rsum;
        else { v = MX ? MX[i][j] : n(20 + c.rnd() * 60); rsum += v; tots[j] += v; }
        if (!isT && j === cols) tots[cols] += rsum;
        var vx = P.x + hw + cw * (j + 1) - 3;
        if (showV) b += txt(vx, ty, vlbl(c, v, 1), c.fs, c.C.nTitle, 'end', (isT || j === cols) ? '600' : null);
        else b += ghost(c, vx - cw * 0.55, y + rh * 0.4, cw * 0.5, Math.max(1.2, rh * 0.2), (isT || j === cols) ? c.C.ghost2 : c.C.ghost);
      }
    }
    return wrap(c, b);
  };

  /* ---- Datenschnitt: Kopf plus Liste mit Kästchen oder Dropdown ----------- */
  S.slicer = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var head = (!c.small && P.h >= 40) ? c.fsT + 6 : 0;
    if (head) b += txt(P.x, P.y + c.fsT * 0.9, c.t.region, c.fsT, c.C.nTitle, 'start', '600');
    var Q = { x: P.x, y: P.y + head, w: P.w, h: P.h - head };
    if (c.small || Q.h < 46 || P.w < 60) {
      var dh = Math.min(Q.h, Math.max(12, c.fs * 2.2));
      var dy = Q.y + (head ? 0 : (Q.h - dh) / 2);
      b += rrect(Q.x + 0.5, dy, Q.w - 1, dh, 2, c.C.paper, c.C.nTxt, 0.8);
      if (!c.small && Q.w >= 60) b += txt(Q.x + 5, dy + dh / 2 + c.fs * 0.34, c.t.all, c.fs, c.C.nTitle, 'start');
      else b += ghost(c, Q.x + 4, dy + dh * 0.44, Q.w * 0.45, Math.max(1.2, dh * 0.14));
      var ax = Q.x + Q.w - 7, ay = dy + dh * 0.42;
      b += pathEl('M' + n(ax - 3) + ' ' + n(ay) + ' l3 3 l3 -3', 'none', c.C.nTitle, 1.1);
      return wrap(c, b);
    }
    var rows = Math.max(2, Math.min(c.dense ? 7 : 5, Math.floor(Q.h / Math.max(10, c.fs * 1.9)))), rh = Q.h / rows, i;
    if (c.uc) {
      // eigene Einträge: so viele, wie hineinpassen; Zeilenhöhe wie gewohnt
      var fitN = Math.max(1, Math.floor(Q.h / Math.max(10, c.fs * 1.9)));
      rh = Q.h / Math.max(rows, Math.min(c.uc.length, fitN));
      rows = Math.min(c.uc.length, fitN);
    }
    for (i = 0; i < rows; i++) {
      var y = Q.y + rh * i, bs = Math.min(c.fs * 1.1, rh * 0.6);
      var by = y + (rh - bs) / 2, on = (i === 1 || i === 2);
      b += rrect(Q.x + 0.5, by, bs, bs, 1.5, on ? c.C.nTitle : c.C.paper, c.C.nTxt, 0.9);
      if (on) b += pathEl('M' + n(Q.x + 0.5 + bs * 0.24) + ' ' + n(by + bs * 0.52) + ' l' + n(bs * 0.22) + ' ' + n(bs * 0.22) + ' l' + n(bs * 0.36) + ' ' + n(-bs * 0.44), 'none', c.C.paper, 1.1);
      if (c.lab || P.w >= 70) b += txt(Q.x + bs + 6, y + rh / 2 + c.fs * 0.34, fit(c, c.cat[i % c.cat.length], Q.w - bs - 6), c.fs, c.C.nTitle, 'start');
      else b += ghost(c, Q.x + bs + 5, by + bs * 0.35, Q.w * 0.5, Math.max(1.2, bs * 0.25));
    }
    return wrap(c, b);
  };

  /* ---- Textfeld ---------------------------------------------------------- */
  S.text = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var rows = Math.max(2, Math.min(6, Math.floor(P.h / 7)));
    var lh = P.h / rows, i;
    var wfrac = [0.6, 0.97, 0.92, 0.86, 0.94, 0.55];
    for (i = 0; i < rows; i++) {
      var f = i === rows - 1 && i > 1 ? 0.55 : wfrac[i % wfrac.length];
      var th = Math.max(1.6, Math.min(i === 0 ? 4 : 3, lh * (i === 0 ? 0.42 : 0.3)));
      b += rrect(P.x, P.y + lh * i + (lh - th) / 2, Math.max(1, P.w * f), th, th / 2, i === 0 ? c.C.nTitle : c.C.ghost);
    }
    return wrap(c, b);
  };

  /* ---- Bildplatzhalter --------------------------------------------------- */
  S.image = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rrect(P.x, P.y, P.w, P.h, 3, c.C.wash, c.C.edge, 1);
    var s = Math.min(P.w, P.h) * 0.4, cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    b += polygonEl([[cx - s * 0.6, cy + s * 0.4], [cx - s * 0.15, cy - s * 0.2], [cx + s * 0.15, cy + s * 0.1], [cx + s * 0.35, cy - s * 0.05], [cx + s * 0.6, cy + s * 0.4]], c.C.py);
    b += circ(cx + s * 0.3, cy - s * 0.35, s * 0.12, c.C.py);
    return wrap(c, b);
  };

  /* ---- Schaltfläche ------------------------------------------------------ */
  S.button = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var bh = Math.min(P.h, Math.max(12, P.h * 0.55));
    var bw = Math.min(P.w, Math.max(30, P.w * 0.8));
    var bx = P.x + (P.w - bw) / 2, by = P.y + (P.h - bh) / 2;
    b += rrect(bx, by, bw, bh, Math.min(4, bh / 2), c.C.pane, c.C.edge, 1);
    if (!c.small && bh >= c.fsT + 4 && bw >= tw(c.t.apply, c.fsT) + 8) b += txt(bx + bw / 2, by + bh / 2 + c.fsT * 0.34, c.t.apply, c.fsT, c.C.nTitle, 'middle', '600');
    else b += ghost(c, bx + bw * 0.28, by + bh / 2 - 1, bw * 0.44, 2, c.C.ghost2);
    return wrap(c, b);
  };

  /* ---- Landkarte: Blasen in der Datenfarbe ------------------------------- */
  S.map = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rect(P.x, P.y, P.w, P.h, c.C.dark ? '#22303A' : '#E8EEF2');
    var norm = [[0.08, 0.46], [0.17, 0.22], [0.33, 0.13], [0.49, 0.22], [0.62, 0.10],
                [0.81, 0.19], [0.93, 0.41], [0.86, 0.67], [0.69, 0.87], [0.49, 0.92],
                [0.29, 0.83], [0.13, 0.67]];
    var pts = [], i;
    for (i = 0; i < norm.length; i++) pts.push([P.x + P.w * norm[i][0], P.y + P.h * norm[i][1]]);
    b += polygonEl(pts, c.C.dark ? '#34383C' : '#F5F4F0', c.C.dark ? '#4A4E52' : '#D6D3CC', 0.8);
    var dots = c.small ? 3 : 7;
    for (i = 0; i < dots; i++) {
      var r = c.small ? 2 : Math.min(P.w, P.h) * (0.025 + c.rnd() * 0.05);
      var dx = P.x + P.w * (0.24 + c.rnd() * 0.52);
      var dy = P.y + P.h * (0.26 + c.rnd() * 0.48);
      b += '<circle cx="' + n(dx) + '" cy="' + n(dy) + '" r="' + n(Math.max(1, r)) + '" fill="' + c.C.pbi[0] + '" fill-opacity="0.75" stroke="' + c.C.paper + '" stroke-width="0.8"/>';
    }
    return wrap(c, b);
  };

  /* ---- Kreis und Donut: Standardpalette, Legende oben, Prozente außen ---- */
  function nPie(c, inner) {
    var b = '';
    var fr = c.small ? [0.45, 0.3, 0.25] : [0.38, 0.27, 0.2, 0.15];
    var names = [], i, own = !!(c.uc || c.uv);
    if (own) {
      /* Eigene Daten: ein Segment je Kategorie (klein höchstens 3, sonst 8),
         Anteile aus |o.values|, ohne Werte fallend synthetisch.            */
      var nS = kcnt(c, fr.length, c.small ? 3 : 8), wS = [], tS = 0;
      for (i = 0; i < nS; i++) wS.push(1 / (i + 1.6));
      if (c.uv) wS = useVals(c, wS);
      for (i = 0; i < nS; i++) { wS[i] = Math.abs(wS[i]); tS += wS[i]; }
      fr = [];
      for (i = 0; i < nS; i++) fr.push(tS ? wS[i] / tS : 1 / nS);
    }
    for (i = 0; i < fr.length; i++) names.push(c.cat[i % c.cat.length]);
    var usedL = [], usedR = [];
    var legH = c.lab ? c.fsA + 6 : 0;
    var P = area(c, { top: legH });
    if (legH) b += nLegend(c, c.x0, c.y0 + c.fsA * 0.9, names, c.C.pbi, c.x1);
    var lbOn = c.lab && P.w >= 140;
    var lpad = lbOn ? tw('38%', c.fs) + 10 : 0;
    var r = Math.max(4, Math.min(P.w / 2 - lpad, P.h / 2 - (lbOn ? c.fs * 0.9 : 0)) - 1), ri = r * (inner || 0);
    var cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    var a0 = -Math.PI / 2;
    for (i = 0; i < fr.length; i++) {
      var a1 = a0 + fr[i] * Math.PI * 2;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var lrg = (a1 - a0) > Math.PI ? 1 : 0, d;
      if (own && fr[i] > 0.9999) {
        // ein einziges Segment: Vollkreis (ein Bogen mit gleichem Start/Ende zeichnet nichts)
        b += ri > 0 ? '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n((r + ri) / 2) + '" fill="none" stroke="' + c.C.pbi[i % c.C.pbi.length] + '" stroke-width="' + n(r - ri) + '"/>'
                    : circ(cx, cy, r, c.C.pbi[i % c.C.pbi.length]);
        if (lbOn) b += txt(cx + r + 4, clamp(cy + c.fs * 0.34, P.y + c.fs, P.y + P.h), '100%', c.fs, c.C.nTxt, 'start');
        a0 = a1;
        continue;
      }
      if (fr[i] <= 0) { a0 = a1; continue; }
      if (ri > 0) {
        var u0 = cx + ri * Math.cos(a0), v0 = cy + ri * Math.sin(a0), u1 = cx + ri * Math.cos(a1), v1 = cy + ri * Math.sin(a1);
        d = 'M' + n(x0) + ' ' + n(y0) + ' A' + n(r) + ' ' + n(r) + ' 0 ' + lrg + ' 1 ' + n(x1) + ' ' + n(y1) +
            ' L' + n(u1) + ' ' + n(v1) + ' A' + n(ri) + ' ' + n(ri) + ' 0 ' + lrg + ' 0 ' + n(u0) + ' ' + n(v0) + ' Z';
      } else {
        d = 'M' + n(cx) + ' ' + n(cy) + ' L' + n(x0) + ' ' + n(y0) + ' A' + n(r) + ' ' + n(r) + ' 0 ' + lrg + ' 1 ' + n(x1) + ' ' + n(y1) + ' Z';
      }
      b += pathEl(d, c.C.pbi[i % c.C.pbi.length], c.C.paper, 1);
      if (lbOn) {
        var am = (a0 + a1) / 2, ca = Math.cos(am), sa = Math.sin(am);
        var ex = cx + (r + 5) * ca, ey = cy + (r + 5) * sa;
        var ly = clamp(ey + c.fs * 0.34, P.y + c.fs, P.y + P.h), okL = true;
        if (own) {
          // viele Segmente: kleine Anteile und Überlappungen ohne Beschriftung
          var used = ca >= 0 ? usedR : usedL;
          okL = fr[i] >= 0.025;
          for (var u2 = 0; u2 < used.length && okL; u2++) if (Math.abs(used[u2] - ly) < c.fs * 1.05) okL = false;
          if (okL) used.push(ly);
        }
        var t2 = lbl(c, fr[i] * 100, 0) + '%';
        if (okL) {
          b += ln(cx + r * ca, cy + r * sa, ex, ey, c.C.nTxt, 0.6);
          b += txt(ex + (ca >= 0 ? 2 : -2), ly, t2, c.fs, c.C.nTxt, ca >= 0 ? 'start' : 'end');
        }
      }
      a0 = a1;
    }
    return b;
  }
  S.pie = function (w, h, o) { var c = ctx(w, h, o); return wrap(c, nPie(c, 0)); };
  S.donut = function (w, h, o) { var c = ctx(w, h, o); return wrap(c, nPie(c, 0.58)); };
  S.ndonut = S.donut;

  /* Squarified-Layout (Bruls/Huizing/van Wijk): vals absteigend, Ergebnis
     [x, y, w, h] je Wert in derselben Reihenfolge.                         */
  function squarify(vals, x, y, w, h) {
    var out = [], tot = 0, i = 0, k;
    for (k = 0; k < vals.length; k++) tot += vals[k];
    var f = tot > 0 ? (w * h) / tot : 0, a = [];
    for (k = 0; k < vals.length; k++) a.push(vals[k] * f);
    while (i < a.length) {
      var side = Math.min(w, h), row = [], rs = 0, best = Infinity, mx = 0, mn = Infinity;
      while (i < a.length) {
        var nr = rs + a[i], nmx = Math.max(mx, a[i]), nmn = Math.min(mn, a[i]);
        var worst = (nr > 0 && nmn > 0 && side > 0) ? Math.max(side * side * nmx / (nr * nr), (nr * nr) / (side * side * nmn)) : Infinity;
        if (row.length && worst > best) break;
        row.push(a[i]); rs = nr; best = worst; mx = nmx; mn = nmn; i++;
      }
      var th = side > 0 ? rs / side : 0, q;
      if (w >= h) {
        var yy = y;
        for (q = 0; q < row.length; q++) { var hh = th > 0 ? row[q] / th : 0; out.push([x, yy, th, hh]); yy += hh; }
        x += th; w = Math.max(0, w - th);
      } else {
        var xx = x;
        for (q = 0; q < row.length; q++) { var ww = th > 0 ? row[q] / th : 0; out.push([xx, y, ww, th]); xx += ww; }
        y += th; h = Math.max(0, h - th);
      }
    }
    return out;
  }

  /* ---- Treemap ------------------------------------------------------------ */
  S.treemap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var g = 1, pal = c.C.pbi;
    var lw = P.w * 0.5;
    var cells = [
      [P.x, P.y, lw - g, P.h, 0],
      [P.x + lw, P.y, P.w - lw, P.h * 0.52 - g, 1],
      [P.x + lw, P.y + P.h * 0.52, (P.w - lw) * 0.56 - g, P.h * 0.48, 2],
      [P.x + lw + (P.w - lw) * 0.56, P.y + P.h * 0.52, (P.w - lw) * 0.44, P.h * 0.28 - g, 3],
      [P.x + lw + (P.w - lw) * 0.56, P.y + P.h * 0.8, (P.w - lw) * 0.44, P.h * 0.2, 4]
    ];
    var cnt = c.small ? 3 : 5, i;
    // Schrift auf der Kachel: weiß, bei eigener Nativpalette nach Helligkeit
    function ink(f) { return c.C.npal && lum(f) > 0.6 ? '#252423' : '#FFFFFF'; }
    if (c.uc || c.uv) {
      /* Eigene Daten: squarified Treemap, Fläche ∝ |o.values|, absteigend
         sortiert (Farbe folgt der Kategorie), klein höchstens 3, sonst 12. */
      var nT = kcnt(c, cnt, c.small ? 3 : 12), wT = [], ix = [];
      for (i = 0; i < nT; i++) { wT.push(1 / (i + 1.3)); ix.push(i); }
      if (c.uv) wT = useVals(c, wT);
      for (i = 0; i < nT; i++) wT[i] = Math.abs(wT[i]);
      ix.sort(function (p1, p2) { return wT[p2] - wT[p1] || p1 - p2; });
      var vs = [];
      for (i = 0; i < nT; i++) vs.push(wT[ix[i]]);
      var R = squarify(vs, P.x, P.y, P.w, P.h);
      for (i = 0; i < R.length; i++) {
        var k = ix[i], rr = R[i], fc = pal[k % pal.length];
        var cw2 = rr[2] - (rr[0] + rr[2] < P.x + P.w - 0.5 ? g : 0), ch2 = rr[3] - (rr[1] + rr[3] < P.y + P.h - 0.5 ? g : 0);
        b += rect(rr[0], rr[1], cw2, ch2, fc);
        if (c.lab && cw2 >= tw('Xx…', c.fs) + 8 && ch2 >= c.fs * 1.6) {
          var nmT = fit(c, c.cat[k % c.cat.length], cw2 - 8);
          if (nmT) b += txt(rr[0] + 4, rr[1] + c.fs + 2, nmT, c.fs, ink(fc), 'start');
          if (c.real && ch2 >= c.fs * 3) {
            var vT = fit(c, fmt(c, c.uv[k] != null && k < c.uv.length ? c.uv[k] : wT[k]), cw2 - 8);
            if (vT) b += txt(rr[0] + 4, rr[1] + c.fs * 2.3 + 2, vT, c.fs, ink(fc), 'start', '600');
          }
        }
      }
      return wrap(c, b);
    }
    if (c.small) { cells[1][3] = P.h * 0.55 - g; cells[2] = [P.x + lw, P.y + P.h * 0.55, P.w - lw, P.h * 0.45, 2]; }
    for (i = 0; i < cnt; i++) {
      var q = cells[i];
      b += rect(q[0], q[1], q[2], q[3], pal[q[4] % pal.length]);
      if (c.lab && q[2] >= tw('Mitte', c.fs) + 6 && q[3] >= c.fs * 1.6) {
        b += txt(q[0] + 4, q[1] + c.fs + 2, fit(c, c.cat[i], q[2] - 8), c.fs, ink(pal[q[4] % pal.length]), 'start');
      }
    }
    return wrap(c, b);
  };

  /* ---- Zerlegungsbaum: Knoten mit Balken, Verbinder vom gewählten Knoten --- */
  S.decomp = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var lvls = c.small ? 2 : 3;
    var head = c.lab ? c.fsT + 6 : 0;
    var cw = P.w / lvls, i, j;
    var counts = c.small ? [1, 2] : [1, 4, 3];
    var heads = [c.t.revenue, c.t.region, c.t.product];
    var prevY = [], sel = 0;
    /* Eigene Daten: Ebene 1 = o.cats (Werte aus o.values), Wurzel = Summe,
       Ebene 2 = Produkte des gewählten Knotens (synthetische Anteile).      */
    var own = !!(c.uc || c.uv), dv = null, dmx = 1;
    if (own) {
      counts[1] = kcnt(c, counts[1], Math.max(1, Math.min(10, Math.floor((P.h - head) / (c.lab ? c.fs * 2.6 : 8)))));
      if (c.uv) { dv = useVals(c, vals(c, counts[1], 40, 30)); dmx = maxOf(dv); }
    }
    for (i = 0; i < lvls; i++) {
      var cnt = counts[i], top = P.y + head, avail = P.h - head, step = avail / cnt;
      var bw = cw * 0.78, x = P.x + cw * i, ys = [];
      if (c.lab) b += txt(x, P.y + c.fsT * 0.85, fit(c, heads[i], bw, c.fsT), c.fsT, c.C.nTitle, 'start', '600');
      for (j = 0; j < cnt; j++) {
        var cy = top + step * j + step / 2;
        var bh = Math.max(2, Math.min(step * 0.34, 8));
        var frac = i === 0 ? 1 : (own ? (1 - j / (cnt + 1)) : (0.9 - j * 0.2)) * (0.8 + c.rnd() * 0.2);
        var dval = 84 * frac, dnm = i === 0 ? c.t.sum : c.cat[(j + i) % c.cat.length];
        if (own && i === 1) dnm = c.cat[j % c.cat.length];
        if (own && i === 2) dnm = c.t.product + ' ' + String.fromCharCode(65 + j);
        if (dv) {
          var sh = [0.5, 0.3, 0.2, 0.1][j] || 0.1;
          dval = i === 0 ? sum(dv) : (i === 1 ? dv[j] : dv[sel] * sh);
          frac = i === 0 ? 1 : (i === 1 ? Math.abs(dv[j]) / dmx : sh / 0.5);
        }
        ys.push(cy);
        if (c.lab && step >= c.fs * 2.4) {
          var vtx = vlbl(c, dval, 1);
          b += txt(x, cy - bh / 2 - 3, fit(c, dnm, own ? Math.max(0, bw - tw(vtx, c.fs) - 4) : bw * 0.6), c.fs, c.C.nTxt, 'start');
          b += txt(x + bw, cy - bh / 2 - 3, vtx, c.fs, c.C.nTitle, 'end');
        }
        b += rect(x, cy - bh / 2, bw, bh, c.C.nGrid);
        b += rect(x, cy - bh / 2, Math.max(1, bw * frac), bh, (j === sel || i === 0) ? c.C.pbi[0] : mix(c.C.pbi[0], c.C.paper, 0.35));
        if (i > 0) {
          var px = P.x + cw * (i - 1) + bw, py = prevY[sel];
          b += pathEl('M' + n(px) + ' ' + n(py) + ' C' + n(px + (x - px) / 2) + ' ' + n(py) + ' ' + n(px + (x - px) / 2) + ' ' + n(cy) + ' ' + n(x) + ' ' + n(cy), 'none', c.C.nTxt, 0.7);
        }
      }
      prevY = ys;
    }
    return wrap(c, b);
  };

  /* ---- Tacho (nativ): grauer Bogen, Wertbogen in Datenfarbe, Zielmarke ---- */
  S.gauge = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var showV = (!c.small && P.h >= 44);
    var labH = showV ? c.fs + 4 : 0;
    var H = Math.max(6, P.h - labH);
    var r = Math.max(4, Math.min(P.w / 2.2, H / 1.08));
    var th = clamp(r * 0.3, 2.5, 30);
    var cx = P.x + P.w / 2;
    var cy = P.y + (H - r) / 2 + r;
    function arc(f0, f1, col) {
      var a0 = Math.PI + f0 * Math.PI, a1 = Math.PI + f1 * Math.PI, rm = r - th / 2;
      return '<path d="M' + n(cx + rm * Math.cos(a0)) + ' ' + n(cy + rm * Math.sin(a0)) + ' A' + n(rm) + ' ' + n(rm) + ' 0 0 1 ' +
             n(cx + rm * Math.cos(a1)) + ' ' + n(cy + rm * Math.sin(a1)) +
             '" fill="none" stroke="' + col + '" stroke-width="' + n(th) + '" stroke-linecap="butt"/>';
    }
    var v = 0.68, t = 0.8, gTxt = '68', gMax = '100';
    if (c.uv) {
      // o.values[0] = Wert, o.refValues[0] = Ziel (sonst +18 %), Maximum „schön" gerundet
      var gv = first(c.uv), gt = c.ur ? first(c.ur) : gv * 1.18;
      var gm = niceMax(Math.max(Math.abs(gv), Math.abs(gt), 1e-9) * 1.25, 1).max;
      v = clamp(gv / gm, 0, 1); t = clamp(gt / gm, 0, 1);
      gTxt = fmt(c, gv); gMax = fmt(c, gm).replace(/[.,]0+(?=\D*$)/, '');
    }
    b += arc(0, 1, c.C.nGrid === '#E9E9E9' ? '#E6E6E6' : c.C.nGrid);
    b += arc(0, v, c.C.pbi[0]);
    var ta = Math.PI + t * Math.PI;
    b += ln(cx + (r - th - 1) * Math.cos(ta), cy + (r - th - 1) * Math.sin(ta), cx + (r + 0.5) * Math.cos(ta), cy + (r + 0.5) * Math.sin(ta), c.C.nTitle, 1.6);
    if (showV) {
      var fsv = Math.min(c.fsV || 99, clamp(r * 0.42, 8, 26 * c.fk));
      if (c.uv) fsv = Math.min(fsv, Math.max(6, (r - th) * 1.8 / Math.max(1, gTxt.length * CW)));
      if (r - th > fsv * 0.8) b += txt(cx, cy - 1, gTxt, fsv, c.C.nTitle, 'middle', '600');
      b += txt(cx - r + th / 2, cy + c.fs + 1, '0', c.fs, c.C.nTxt, 'middle');
      if (c.uv) {
        var hwM = tw(gMax, c.fs) / 2;
        b += txt(Math.min(cx + r - th / 2, c.x1 - hwM), cy + c.fs + 1, gMax, c.fs, c.C.nTxt, 'middle');
      } else b += txt(cx + r - th / 2, cy + c.fs + 1, '100', c.fs, c.C.nTxt, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- Deneb / Vega-Platzhalter --------------------------------------------- */
  S.deneb = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rrect(P.x, P.y, P.w, P.h, 3, c.C.paper, c.C.edge, 1);
    var fs = clamp(Math.min(P.h * 0.4, P.w * 0.3), 10, 24);
    b += txt(P.x + P.w / 2, P.y + P.h / 2 + fs * 0.34, '{ }', fs, c.C.ink, 'middle', '600');
    if (!c.small && P.h >= 52) b += txt(P.x + P.w / 2, P.y + P.h - 4, fit(c, c.t.spec, P.w - 6, c.fsT), c.fsT, c.C.sub, 'middle');
    return wrap(c, b);
  };

  /* ---- Fallback -------------------------------------------------------------- */
  S.generic = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rect(P.x, P.y, P.w, P.h, c.C.paper, c.C.py, 1);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y, c.C.py, 1);
    return wrap(c, b);
  };

  /* ====================================================================== */
  /*  Dispatcher                                                            */
  /* ====================================================================== */

  root.MK_SKETCHES = S;

  root.MK_SKETCH = function (kind, w, h, o) {
    var fn = (typeof kind === 'string' && Object.prototype.hasOwnProperty.call(S, kind))
      ? S[kind] : S.generic;
    var out;
    try {
      out = fn(w, h, o || {});
    } catch (e) {
      out = null;
    }
    if (typeof out !== 'string' || out.indexOf('<svg') !== 0) {
      try { out = S.generic(w, h, o || {}); } catch (e2) { out = ''; }
    }
    return out;
  };

  // Small Multiples: dieselbe Skizze als 2×2- oder 3×2-Raster mit Gruppenbeschriftung.
  root.MK_SKETCH.small = function (kind, w, h, o) {
    o = o || {}; var k = o.scale || 1;
    var fk = +o.fontScale; if (!isFinite(fk) || fk <= 0) fk = 1;
    var ft = o.fonts && +o.fonts.title > 0 ? +o.fonts.title : 9;
    var cols = w / h > 1.7 ? 3 : 2, rows = 2, cntN = cols * rows;
    var lab = o.multiplesLabels || (o.lang === 'en' ? ['North', 'South', 'West', 'East', 'Central', 'Other'] : ['Nord', 'Süd', 'West', 'Ost', 'Mitte', 'Sonstige']);
    /* Eigene Daten: o.cats werden die Kacheltitel (eine Kachel je Kategorie,
       höchstens drei Zeilen); o.values/o.refValues gehen an jede Kachel,
       je Kachel leicht variiert. Innen gilt die Standardachse der Skizze.   */
    var uc = strList(o.cats), uv = numList(o.values), ur = uv ? numList(o.refValues) : null;
    if (uc && !o.multiplesLabels) {
      lab = uc;
      cntN = Math.max(1, Math.min(uc.length, cols * 3));
      rows = Math.ceil(cntN / cols); cols = Math.ceil(cntN / rows);   // 4 → 2×2 statt 3+1
    }
    var vd = uv ? decOf(uv.concat(ur || [])) : 0;
    function vary(a, i) {
      if (!a) return a;
      var out = [], j, p = Math.pow(10, vd);
      for (j = 0; j < a.length; j++) {
        var f = (1 - i * 0.07) * (0.94 + 0.12 * ((Math.sin(i * 7.1 + j * 3.3) + 1) / 2));
        out.push(a[j] == null ? null : (i ? Math.round(a[j] * f * p) / p : a[j]));
      }
      return out;
    }
    var fs = ft * fk * k, gap = 8 * k, lh = fs + 3 * k;
    var cw = (w - gap * (cols - 1)) / cols, ch = (h - gap * (rows - 1)) / rows;
    var ink = /^#[0-9a-fA-F]{6}$/.test(String(o.ink || '')) ? o.ink : (o.dark ? '#E0E0E0' : '#404040');
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" font-family="' + FONT + '">';
    for (var i = 0; i < cntN; i++) {
      var cx = (i % cols) * (cw + gap), cy = Math.floor(i / cols) * (ch + gap);
      var iw = Math.max(20, cw), ih = Math.max(12, ch - lh);
      var io = Object.assign({}, o, { seed: ((o.seed || 0) + i * 7) % 1000, label: '' });
      if (uc || uv) {
        delete io.cats;
        if (uv) { io.values = vary(uv, i); if (ur) io.refValues = vary(ur, i); }
      }
      var s = root.MK_SKETCH(kind, iw, ih, io);
      var open = /^<svg\b[^>]*>/.exec(s); if (!open) continue;
      var vb = /viewBox="([^"]*)"/.exec(open[0]);
      var inner = s.slice(open[0].length, s.lastIndexOf('</svg>'));
      var tt = String(lab[i % lab.length]);
      if (uc) {
        var mc = Math.floor((cw - 2 * k) / (fs * CW));
        if (tt.length > mc) tt = mc >= 2 ? tt.slice(0, mc - 1) + '…' : '';
      }
      out += '<text x="' + n(cx + 2 * k) + '" y="' + n(cy + fs) + '" font-size="' + n(fs) + '" font-weight="600" fill="' + ink + '">' + esc(tt) + '</text>';
      out += '<svg x="' + n(cx) + '" y="' + n(cy + lh) + '" width="' + n(cw) + '" height="' + n(Math.max(1, ch - lh)) + '" viewBox="' + (vb ? vb[1] : '0 0 ' + iw + ' ' + ih) + '" preserveAspectRatio="none">' + inner + '</svg>';
    }
    return out + '</svg>';
  };

  root.MK_SKETCH_KEYS = (function () {
    var k = [], key;
    for (key in S) if (Object.prototype.hasOwnProperty.call(S, key)) k.push(key);
    return k;
  })();

}(typeof window !== 'undefined' ? window : this));
