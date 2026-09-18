/* ==========================================================================
   MockupKitchen · Mini-Chart-Skizzen im IBCS-Look
   --------------------------------------------------------------------------
   Eigenständig: kein Modulsystem, keine Abhängigkeiten, reines Browser-JS.

     window.MK_SKETCHES[kind](w, h, o)  ->  SVG-String
     window.MK_SKETCH(kind, w, h, o)    ->  Dispatcher, Fallback 'generic'

   o = { scenario:'AC/PY'|'AC/PL'|'AC/PL/FC'|'AC',   // Kurzform, abwärtskompatibel
         scenarios:['AC','PL','PY'],                // Langform, hat Vorrang
         deltaBasis:'PL'|'PY'|'BU',                 // Bezug der Δ-Ebenen
         polarity:'higher'|'lower',                 // 'lower' = kleiner ist besser
         palette:'teal'|'ibcs',                     // Abweichungsfarben
         ink:'#404040', dark:Boolean,               // Text-/Achsenfarbe, Dunkelmodus
         lang:'de'|'en',                            // Sprache der Beschriftungen
         unit:String,                               // nur kpi/card, hinter der Zahl
         antiPattern:Boolean,                       // Warnüberzug (Kreis, Tacho)
         variance:{abs:Boolean, rel:Boolean},
         seed:Number, dense:Boolean, scale:Number,
         label:String (nur kpi/card: '' = keine Beschriftung) }

   Grundsätze:
   - Dummy-Daten stammen aus einem Seed-PRNG (mulberry32), damit dieselbe
     Kachel bei jedem Re-Render identisch aussieht.
   - Alle Zahlen laufen durch n(): niemals NaN/Infinity im Output.
   - Unter 120 px Breite oder 50 px Höhe wird eine reduzierte Variante
     gezeichnet (weniger Kategorien, keine Beschriftung).
   - Nur Graustufen plus die beiden Abweichungsfarben. Kein Chart-Junk.

   Skalierung (o.scale, Default 1):
   - Das Tool übergibt canvas.width/1280 — also 1 bei HD, 1,5 bei Full HD,
     3 bei Ultra HD.
   - Gezeichnet wird immer im Entwurfsraum w/scale × h/scale; wrap() legt ein
     <g transform="scale(s)"> um das Ergebnis. Damit wachsen Schriftgrößen,
     Strichstärken, Marker-Radien, Pin-Längen, Innenränder und Mindestabstände
     zentral mit, und die small/tiny-Schwellen greifen erst bei
     w < 120·scale bzw. h < 50·scale. Der viewBox bleibt "0 0 w h".
   - Einzelne Zeichenfunktionen rechnen deshalb NICHT mit c.k — sie arbeiten
     unverändert in Entwurfseinheiten.

   Szenario-Notation (wie im ChartKitchen-Visual):
     AC dunkel gefüllt · PY grau gefüllt · PL und BU weiß mit dunkler Kontur,
     versetzt hinter AC · FC schraffiert mit Kontur.
   - Mehr als zwei Szenarien: die erste Reihe ist die Hauptreihe (AC, sonst FC),
     das Δ-Bezugsszenario (deltaBasis) steht als Referenzsäule daneben, ein
     drittes Szenario erscheint als Szenario-Marke (Dreieck, IBCS UN 4.1).

   Farben (o.palette, o.ink, o.dark):
     theme() baut je Aufruf das Farbset c.C; im Code steht keine Farbkonstante
     mehr. 'teal' (Default) nimmt die Abweichungsfarben des ChartKitchen-
     Visuals, 'ibcs' das klassische Grün/Rot. o.ink färbt Texte und Achsen,
     o.dark dreht Flächen und Schrift für dunkle Kacheln; ohne o.dark
     entscheidet die Helligkeit von o.ink.

   Polarität (o.polarity):
     'higher' (Default) = mehr ist günstig, 'lower' = weniger ist günstig
     (Kosten, Ausschuss, Durchlaufzeit). Sämtliche Δ-Färbungen laufen über
     dcol(); es gibt keine Stelle mehr, die das Vorzeichen selbst auswertet.
   ========================================================================== */
(function (root) {
  'use strict';

  var FONT = 'Geist, system-ui, sans-serif';

  /* ---------------------------------------------------------------- Farben */
  /* Es gibt keine globalen Farbkonstanten mehr: theme() baut je Aufruf ein
     Farbset c.C, alle Zeichenfunktionen lesen nur daraus. Damit hängen
     Palette (o.palette), Textfarbe (o.ink) und Dunkelmodus (o.dark) an genau
     einer Stelle.
       ac   Ist, gefüllt            py   Vorjahr, gefüllt
       plf  Plan/Budget, Füllung    pls  Plan/Budget, Kontur
       fcc  Forecast-Ersatzfläche, wenn die Schraffur zu klein wird
       good/bad  Abweichungsfarben (Palette)
       txt  Text   sub  Ebenen-/Legendentext   axis Achsen
       grid helle Hilfslinien       hair Verbinder, Forecast-Trenner
       g2/g3 Stapelgrau             paper Kachelgrund (Halo, Trennfugen)
       wash helle Füllfläche        pane Kopfzeilen-/Schaltflächenton
       ghost/ghost2 Textplatzhalter                                        */

  // Abweichungspaletten: 'teal' wie im ChartKitchen-Visual, 'ibcs' klassisch.
  var PAL = {
    teal: { good: '#1E8F9E', bad: '#D64541' },
    ibcs: { good: '#3A9A5B', bad: '#C8412F' }
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
  // t = 0 -> a, t = 1 -> b
  function mix(a, b, t) {
    var x = hex2rgb(a), y = hex2rgb(b), i, o = [];
    for (i = 0; i < 3; i++) o.push(x[i] + (y[i] - x[i]) * t);
    return rgb2hex(o);
  }
  // Wahrgenommene Helligkeit, 0 (schwarz) bis 1 (weiß).
  function lum(h) {
    var c3 = hex2rgb(h);
    return (0.299 * c3[0] + 0.587 * c3[1] + 0.114 * c3[2]) / 255;
  }

  /* Baut das Farbset. Ohne o.ink und ohne o.dark bleiben die hellen Werte
     exakt die bisherigen — nur die Abweichungsfarben folgen o.palette.
     Ist o.dark nicht gesetzt, entscheidet die Helligkeit von o.ink: eine
     helle Schriftfarbe bedeutet einen dunklen Kachelgrund.                 */
  function theme(o) {
    var pal = PAL[o.palette === 'ibcs' ? 'ibcs' : 'teal'];
    var ink = /^#[0-9a-fA-F]{6}$/.test(String(o.ink || '')) ? String(o.ink).toUpperCase() : null;
    var dark = (o.dark == null) ? (!!ink && lum(ink) > 0.55) : !!o.dark;
    var C;
    if (!dark) {
      C = {
        ac: '#404040', py: '#9E9E9E', plf: '#FFFFFF', pls: '#404040', fcc: '#BDBDBD',
        txt: '#6B7280', sub: '#9A9A9A', grid: '#E5E5E5', hair: '#BDBDBD', axis: '#404040',
        g2: '#6E6E6E', g3: '#C9C9C9', paper: '#FFFFFF', wash: '#EDEBE6', pane: '#F2F2F2',
        ghost: '#D4D4D4', ghost2: '#8A8A8A'
      };
      if (ink) {
        C.axis = ink; C.pls = ink;
        C.txt  = mix(ink, '#FFFFFF', 0.28);
        C.sub  = mix(ink, '#FFFFFF', 0.46);
        C.grid = mix(ink, '#FFFFFF', 0.88);
        C.hair = mix(ink, '#FFFFFF', 0.72);
      }
    } else {
      var base = ink || '#E6E6E6';
      C = {
        ac: '#E6E6E6', py: '#7A7A7A', plf: '#1E1E1E', pls: '#E6E6E6', fcc: '#5A5A5A',
        txt: mix(base, '#1E1E1E', 0.22), sub: mix(base, '#1E1E1E', 0.44),
        grid: '#3C3C3C', hair: '#5A5A5A', axis: base,
        g2: '#9E9E9E', g3: '#6A6A6A', paper: '#1E1E1E', wash: '#2B2B2B', pane: '#2E2E2E',
        ghost: '#4A4A4A', ghost2: '#6E6E6E'
      };
    }
    if (/^#[0-9a-fA-F]{6}$/.test(String(o.paper || ''))) { C.paper = String(o.paper).toUpperCase(); C.plf = C.paper; if (dark) { C.wash = mix(C.paper, '#FFFFFF', 0.08); C.pane = mix(C.paper, '#FFFFFF', 0.1); } }
    C.good = pal.good;
    C.bad  = pal.bad;
    C.dark = dark;
    return C;
  }

  /* ------------------------------------------------------------- Sprachen */
  /* Alle sichtbaren Wörter stehen hier. Szenario-Codes (AC, PL, PY, BU, FC),
     Δ-Ebenentitel (ΔPL, ΔPL %) und Σ bleiben in beiden Sprachen IBCS-Notation. */
  var L10N = {
    de: {
      mon: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
      cat: ['Nord', 'Süd', 'Ost', 'West', 'Mitte', 'Export', 'Online', 'Handel', 'Service'],
      rows: ['Umsatz', 'Marge', 'Menge', 'Kunden', 'Aufträge'],
      pnl: ['Umsatzerlöse', 'Materialaufwand', 'Rohertrag', 'Personalaufwand',
            'Sonstige Aufwendungen', 'EBITDA', 'Abschreibungen', 'EBIT',
            'Finanzergebnis', 'Steuern', 'Jahresüberschuss'],
      dec: ',', grp: '.',
      vs: 'vs', total: 'gesamt', sum: 'Summe', target: 'Ziel', trend: 'Verlauf',
      cumul: 'kumuliert', margin: 'Marge %', revenue: 'Umsatz', apply: 'Anwenden',
      spec: 'Vega-Spec'
    },
    en: {
      mon: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      cat: ['North', 'South', 'East', 'West', 'Central', 'Export', 'Online', 'Retail', 'Service'],
      rows: ['Revenue', 'Margin', 'Volume', 'Customers', 'Orders'],
      pnl: ['Revenue', 'Cost of materials', 'Gross profit', 'Personnel expenses',
            'Other expenses', 'EBITDA', 'Depreciation', 'EBIT',
            'Financial result', 'Taxes', 'Net income'],
      dec: '.', grp: ',',
      vs: 'vs', total: 'total', sum: 'Total', target: 'Target', trend: 'Trend',
      cumul: 'cumulative', margin: 'Margin %', revenue: 'Revenue', apply: 'Apply',
      spec: 'Vega spec'
    }
  };

  var uid = 0;   // laufende Nummer für eindeutige Pattern-IDs

  /* ----------------------------------------------------------- Zahlenhilfen */

  // Sichere Zahl: nie NaN, nie Infinity, auf 2 Nachkommastellen gekürzt.
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
  /* Dummy-Zahl in der Sprache des Kontexts:
     de "1.234,6" · en "1,234.6". Ohne Kontext (Altaufruf) gilt Deutsch. */
  function lbl(c, v, d) {
    var t = (c && c.t) || L10N.de;
    var neg = n(v) < 0;
    var s = Math.abs(n(v)).toFixed(d == null ? 1 : d).split('.');
    var ip = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, t.grp);
    return (neg ? '-' : '') + ip + (s[1] ? t.dec + s[1] : '');
  }
  function plbl(c, v) { return (n(v) >= 0 ? '+' : '') + lbl(c, v, 0) + '%'; }
  // Vorzeichenbehafteter Δ-Wert, z. B. "+12" / "-8"
  function dlbl(c, v) { return (n(v) >= 0 ? '+' : '') + lbl(c, v, 0); }

  /* Einzige Stelle, an der ein Δ-Vorzeichen zu einer Farbe wird.
     c.pol ist +1 ('higher') oder -1 ('lower'); bei 'lower' ist eine negative
     Abweichung die günstige. Δ = 0 gilt in beiden Fällen als günstig. */
  function dcol(c, d) { return n(d) * ((c && c.pol) || 1) >= 0 ? c.C.good : c.C.bad; }

  // Kleiner deterministischer PRNG.
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
  function rect(x, y, w, h, fill, stroke, sw) {
    w = n(w); h = n(h);
    if (w <= 0 || h <= 0) return '';
    var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h +
            '" fill="' + (fill || 'none') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function rrect(x, y, w, h, r, fill, stroke, sw) {
    w = n(w); h = n(h);
    if (w <= 0 || h <= 0) return '';
    var s = '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + w + '" height="' + h +
            '" rx="' + n(r) + '" fill="' + (fill || 'none') + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function ln(x1, y1, x2, y2, stroke, sw, dash) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) +
           '" stroke="' + (stroke || c.C.axis) + '" stroke-width="' + n(sw || 1) + '"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function circ(cx, cy, r, fill, stroke, sw) {
    var s = '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(Math.max(0.4, r)) +
            '" fill="' + (fill || c.C.ac) + '"';
    if (stroke) s += ' stroke="' + stroke + '" stroke-width="' + n(sw || 1) + '"';
    return s + '/>';
  }
  function pathEl(d, fill, stroke, sw, dash) {
    return '<path d="' + d + '" fill="' + (fill || 'none') + '" stroke="' + (stroke || 'none') +
           '" stroke-width="' + n(sw || 1) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') +
           ' stroke-linejoin="round" stroke-linecap="round"/>';
  }
  function pts2str(pts) {
    var out = [], i;
    for (i = 0; i < pts.length; i++) out.push(n(pts[i][0]) + ',' + n(pts[i][1]));
    return out.join(' ');
  }
  function polyline(pts, stroke, sw, dash) {
    if (!pts || !pts.length) return '';
    return '<polyline points="' + pts2str(pts) + '" fill="none" stroke="' + (stroke || c.C.ac) +
           '" stroke-width="' + n(sw || 1.4) + '" stroke-linejoin="round" stroke-linecap="round"' +
           (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  }
  function polygonEl(pts, fill, stroke, sw) {
    if (!pts || !pts.length) return '';
    return '<polygon points="' + pts2str(pts) + '" fill="' + (fill || c.C.grid) +
           '" stroke="' + (stroke || 'none') + '" stroke-width="' + n(sw || 1) + '"/>';
  }
  // halo = weiße Kontur hinter der Schrift, damit Werte über Konturen und
  // Schraffuren lesbar bleiben (wie die Halo-Labels im ChartKitchen-Visual).
  /* halo ist die Farbe der Kontur hinter der Schrift (im Hellen Weiß, im
     Dunklen der Kachelgrund) — wird als c.C.paper übergeben, nie als true. */
  function txt(x, y, s, size, fill, anchor, weight, halo) {
    var fz = n(size || 8);
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + fz +
           '" fill="' + (fill || '#6B7280') + '"' +
           (anchor ? ' text-anchor="' + anchor + '"' : '') +
           (weight ? ' font-weight="' + weight + '"' : '') +
           (halo ? ' stroke="' + halo + '" stroke-width="' + n(Math.max(1.4, fz * 0.3)) +
                   '" stroke-linejoin="round" paint-order="stroke"' : '') +
           '>' + esc(s) + '</text>';
  }
  // Textplatzhalter (graue Balken) — wo echte Schrift zu klein wäre.
  function ghost(c, x, y, w, h, fill) { return rect(x, y, w, h || 2, fill || c.C.ghost); }

  /* Setzt ein Wertlabel neben das Balken-/Pin-Ende (positiv rechts, negativ
     links) und schiebt es so weit zurück, dass es in der Fläche bleibt. */
  function edge(c, v, x, gap, s, P) {
    var tw = String(s).length * c.fs * 0.62;
    return n(v) >= 0 ? Math.min(x + gap, P.x + P.w - tw)
                     : Math.max(x - gap, P.x + tw);
  }

  /* Kürzt eine Beschriftung auf die reservierte Spaltenbreite.
     Nötig, seit die Demo-Namen aus dem Wörterbuch kommen: 'Central' und
     'Service' sind länger als 'Mitte' und würden sonst aus der Kachel laufen. */
  function fit(c, s, w, size) {
    s = String(s == null ? '' : s);
    var cw = (size || c.fs) * 0.62;
    if (!(w > 0) || !(cw > 0)) return '';
    var max = Math.floor(w / cw);
    if (max >= s.length) return s;
    if (max < 2) return '';
    return s.slice(0, max - 1) + '…';
  }

  /* --------------------------------------------------------- Szenario-Satz */

  var SCEN_OK = { AC: 1, PY: 1, PL: 1, BU: 1, FC: 1 };

  /* Normalisiert beide Schreibweisen zu einem Satz:
       o.scenarios (Array, hat Vorrang)  ->  ['AC','PL','PY']
       o.scenario  (String, Altform)     ->  'AC/PL/FC' wird zerlegt
     Ergebnis:
       main  = gefüllte Hauptreihe (AC, ersatzweise FC)
       basis = Bezug der Δ-Ebenen (o.deltaBasis, sonst PL vor PY vor BU)
       sec   = übriges Szenario, wird als Dreieck-Marke gezeichnet
       fc    = Forecast-Anteil vorhanden                                    */
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

  /* ctx() ist die einzige Stelle, an der o.scale ausgewertet wird.
     Gezeichnet wird im Entwurfsraum W0/k × H0/k, wrap() skaliert das Ergebnis
     per <g transform="scale(k)"> auf die Kachelgröße zurück. Dadurch wachsen
     Schriftgrößen, Strichstärken, Marker-Radien, Pin-Längen, Innenränder und
     Mindestabstände einheitlich mit — und die small/tiny-Schwellen greifen
     automatisch erst bei w < 120·k bzw. h < 50·k.                           */
  function ctx(w, h, o) {
    o = o || {};
    var W0 = Math.max(16, n(w) || 100);
    var H0 = Math.max(12, n(h) || 50);
    var k = +o.scale;
    if (!isFinite(k) || k <= 0) k = 1;
    // Nie so weit hochskalieren, dass der Entwurfsraum unter die Mindestmaße fällt.
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
    var c = {
      w: W, h: H, pad: pad,
      k: k, ow: W0, oh: H0,                // Ausgabemaße, nur für wrap()
      x0: pad, y0: pad, x1: n(W - pad), y1: n(H - pad),
      iw: Math.max(4, n(W - 2 * pad)),
      ih: Math.max(4, n(H - 2 * pad)),
      small: (W < 120 || H < 50),          // reduzierte Variante
      tiny:  (W < 90  || H < 34),          // Extremfall: nur noch Silhouette
      scen: sn.scen,                       // Kurzform, für Altcode
      scens: sn.list,                      // ['AC','PL','PY'] …
      main: sn.main,                       // gefüllte Hauptreihe: 'AC' oder 'FC'
      basis: sn.basis,                     // Δ-Bezug: 'PL' | 'PY' | 'BU' | null
      sec: sn.sec,                         // drittes Szenario als Marke
      fc: sn.fc,                           // Forecast-Anteil vorhanden
      pol: (o.polarity === 'lower') ? -1 : 1,
      C: C,
      lang: lang,
      t: L10N[lang],
      unit: (o.unit == null) ? '' : String(o.unit),
      anti: !!o.antiPattern,
      vAbs: v.abs !== false,
      vRel: v.rel !== false,
      dense: !!o.dense,
      rnd: mulberry32(o.seed == null ? 1 : o.seed)
    };
    c.mon = c.t.mon;
    c.cat = c.t.cat;
    c.lab = (!c.small && W >= 170 && H >= 90);   // Beschriftung nur wenn Platz
    c.fs  = W < 240 ? 8 : 9;
    return c;
  }

  /* Anti-Pattern-Überzug: diagonale Schraffur in hellem Rot plus „!"-Plakette
     oben rechts. Das Tool setzt o.antiPattern bei Typen, die nicht IBCS-konform
     sind (Kreis, Tacho) — im Workshop soll man das auf der Skizze sehen. */
  function antiLayer(c) {
    var id = 'mkap' + (++uid);
    var s = '<defs><pattern id="' + id + '" width="7" height="7" patternUnits="userSpaceOnUse" ' +
            'patternTransform="rotate(45 0 0)"><line x1="0" y1="0" x2="0" y2="7" stroke="' + c.C.bad +
            '" stroke-width="1.1"/></pattern></defs>';
    s += '<rect x="0" y="0" width="' + n(c.w) + '" height="' + n(c.h) + '" fill="url(#' + id +
         ')" fill-opacity="0.14"/>';
    // Plakette nur, wenn sie nicht mehr als ein Viertel der Kachel frisst.
    var r = clamp(Math.min(c.w, c.h) * 0.11, 3.4, 7.5);
    if (c.w >= r * 4 && c.h >= r * 4) {
      var bx = n(c.w - r - 1.4), by = n(r + 1.4);
      s += circ(bx, by, r, c.C.paper, c.C.bad, 1.2);
      s += txt(bx, by + r * 0.62, '!', r * 1.55, c.C.bad, 'middle', '700');
    }
    return s;
  }

  function wrap(c, body) {
    if (c.anti) body += antiLayer(c);
    var g = c.k === 1 ? body : '<g transform="scale(' + c.k + ')">' + body + '</g>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + c.ow + ' ' + c.oh +
           '" width="100%" height="100%" font-family="' + FONT + '">' + g + '</svg>';
  }

  // Zeichenfläche innerhalb des Innenrands, optional mit reservierten Rändern.
  function area(c, o) {
    o = o || {};
    var l = o.left || 0, r = o.right || 0, t = o.top || 0, b = o.bottom || 0;
    return {
      x: n(c.x0 + l), y: n(c.y0 + t),
      w: Math.max(3, n(c.iw - l - r)),
      h: Math.max(3, n(c.ih - t - b))
    };
  }

  // Horizontale Bänder (Ebenen) mit Gewichtung.
  function bands(y, h, parts, gap) {
    gap = gap == null ? 3 : gap;
    var sum = 0, i, out = [], cur = y;
    for (i = 0; i < parts.length; i++) sum += parts[i];
    var free = h - gap * (parts.length - 1);
    if (free < parts.length * 2) { free = Math.max(parts.length * 2, h); gap = 0; cur = y; }
    for (i = 0; i < parts.length; i++) {
      var bh = free * parts[i] / (sum || 1);
      out.push({ y: n(cur), h: Math.max(2, n(bh)) });
      cur += bh + gap;
    }
    return out;
  }

  // Gleichmäßige Kategorie-Slots.
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

  // Wert -> Pixel. p0 = Pixel für vmin, p1 = Pixel für vmax.
  function sc(vmin, vmax, p0, p1) {
    var d = vmax - vmin;
    if (!isFinite(d) || d === 0) d = 1;
    return function (v) {
      v = +v; if (!isFinite(v)) v = vmin;
      return n(p0 + (v - vmin) / d * (p1 - p0));
    };
  }

  /* ---------------------------------------------------- Szenario-Werkzeuge */

  // Referenz-/Δ-Bezugsszenario (null bei reinem 'AC').
  function refKind(c) { return c.basis; }
  function hasFC(c) { return !!c.fc; }
  // PL und BU werden gleich gezeichnet: weiß mit Kontur, versetzt hinter AC.
  function isOutline(kind) { return kind === 'PL' || kind === 'BU'; }

  /* Ab diesem Index gelten Säulen als Forecast. Ist FC die Hauptreihe
     (z. B. scenarios:['PL','FC']), ist die ganze Reihe schraffiert. */
  function fcStart(c, cnt) {
    if (c.main === 'FC') return 0;
    return hasFC(c) ? Math.max(1, Math.round(cnt * 0.68)) : cnt + 1;
  }

  // Schraffur-Definition für Forecast (Raster wie im ChartKitchen-Visual).
  function hatch(c) {
    var id = 'mkfc' + (++uid);
    return {
      id: id,
      defs: '<defs><pattern id="' + id + '" width="4" height="4" patternUnits="userSpaceOnUse" ' +
            'patternTransform="rotate(45 0 0)"><rect width="4" height="4" fill="' + c.C.paper + '"/>' +
            '<line x1="0" y1="0" x2="0" y2="4" stroke="' + c.C.ac + '" stroke-width="1.4"/></pattern></defs>'
    };
  }
  function fcFill(c, hh, px) { return (hh && n(px) >= 5) ? 'url(#' + hh.id + ')' : c.C.fcc; }

  // Referenzbalken je Szenario.
  function refShape(c, x, y, w, h, kind, hh) {
    if (kind === 'PY') return rect(x, y, w, h, c.C.py);
    if (kind === 'FC') return rect(x, y, w, h, fcFill(c, hh, w), c.C.ac, 0.8);
    return rect(x, y, w, h, c.C.plf, c.C.pls, 1);          // PL und BU: weiß mit Kontur
  }

  /* ------------------------------------------------------ Datengeneratoren */

  function vals(c, cnt, base, spread) {
    var a = [], i;
    for (i = 0; i < cnt; i++) a.push(n(Math.max(6, base + (c.rnd() - 0.42) * spread)));
    return a;
  }
  function derive(c, src, lo, hi) {           // Referenzreihe aus der Istreihe
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

  // Sparkline-Punkte: auf den eigenen Wertebereich skaliert, damit die Linie lebt.
  function sparkPts(c, cnt, x, y, w, h) {
    cnt = Math.max(2, cnt | 0);
    var v = vals(c, cnt, 60, 42), i, lo = v[0], hi = v[0];
    for (i = 1; i < cnt; i++) { if (v[i] < lo) lo = v[i]; if (v[i] > hi) hi = v[i]; }
    var pad = (hi - lo) * 0.18 || 1;
    var s = sc(lo - pad, hi + pad, y + h, y);
    var step = w / (cnt - 1), pts = [];
    for (i = 0; i < cnt; i++) pts.push([x + step * i, s(v[i])]);
    return pts;
  }

  /* --------------------------------------------------- Bausteine (Ebenen) */

  // Ebenen-Überschrift ("ΔPL", "ΔPL %") — im Visual steht sie über der Ebene.
  function layerCap(c, x, y, s) {
    return c.lab ? txt(x, y, s, c.fs, c.C.sub, 'start') : '';
  }

  // Szenario-Legende mit Mini-Swatches, oben links — nur wenn Platz ist.
  function scenLegend(c, x, y, kind, hh) {
    if (!c.lab || c.w < 250) return '';
    var items = [c.main], b = '', cx = x, sw = n(c.fs * 0.78), i, key, sy;
    if (kind) items.push(kind);
    if (c.sec) items.push(c.sec);
    if (hasFC(c) && c.main !== 'FC') items.push('FC');
    for (i = 0; i < items.length; i++) {
      key = items[i]; sy = y - sw;
      if (key === 'AC') b += rect(cx, sy, sw, sw, c.C.ac);
      else if (key === 'PY') b += rect(cx, sy, sw, sw, c.C.py);
      else if (key === 'FC') b += rect(cx, sy, sw, sw, fcFill(c, hh, sw), c.C.ac, 0.7);
      else b += rect(cx, sy, sw, sw, c.C.plf, c.C.pls, 0.9);
      cx += sw + 1.8;
      b += txt(cx, y, key, c.fs, c.C.sub, 'start');
      cx += key.length * c.fs * 0.62 + 5;
      if (cx > c.x1 - sw) break;                  // Rest passt nicht mehr
    }
    return b;
  }

  /* Szenario-Marke: kleines Dreieck, Spitze auf dem Wert (IBCS UN 4.1).
     Für das dritte Szenario (c.sec), damit z. B. AC gegen PL *und* PY
     nebeneinander lesbar bleibt, ohne eine dritte Säule zu brauchen.
     triDown: Spitze unten, Marke liegt über dem Wert (Säulen).
     triLeft: Spitze links, Marke liegt rechts vom Wert (Balken).           */
  function markFill(c, kind) { return kind === 'PY' ? c.C.py : c.C.plf; }
  function markLine(c, kind) { return kind === 'PY' ? null : c.C.pls; }
  function triDown(c, x, y, size, kind) {
    var s2 = Math.max(1.2, n(size));
    return polygonEl([[x, y], [x - s2 * 0.62, y - s2], [x + s2 * 0.62, y - s2]],
                     markFill(c, kind || 'PY'), markLine(c, kind || 'PY'), 0.8);
  }
  function triLeft(c, x, y, size, kind) {
    var s2 = Math.max(1.2, n(size));
    return polygonEl([[x, y], [x + s2, y - s2 * 0.62], [x + s2, y + s2 * 0.62]],
                     markFill(c, kind || 'PY'), markLine(c, kind || 'PY'), 0.8);
  }

  // Gestrichelte Trennlinie zwischen Ist- und Forecast-Bereich.
  function fcSplit(c, sl, yA, yB) {
    if (!hasFC(c) || sl.length < 2) return '';
    var at = fcStart(c, sl.length);
    if (at < 1 || at > sl.length - 1) return '';
    var x = n((sl[at - 1].cx + sl[at].cx) / 2);
    return ln(x, yA, x, yB, c.C.hair, 0.8, '2 2');
  }

  /* Δ-absolut: schmale Säulen um eine eigene Nulllinie, Labels mit Vorzeichen.
     Der Labelrand wird über die Skala reserviert — so läuft nie etwas heraus. */
  function deltaCols(c, d, sl, y, h, hh, opt) {
    opt = opt || {};
    var g = opt.geom;
    var showLbl = opt.labels !== false && c.lab &&
                  sl.length && sl[0].step >= c.fs * 2.2 && h >= c.fs * 3.6;
    var lh = showLbl ? c.fs * 1.45 : c.fs * 0.15;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, y + h - lh, y + lh), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    b += ln(sl[0].x - 1, zero, sl[sl.length - 1].x + sl[sl.length - 1].w + 1, zero, c.C.axis, 1);
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = dcol(c, d[i]), isFC = (i + 1) >= fcAt;
      var bx = gx(sl, i, g), bw = gw(sl, i, g);
      var top = Math.min(zero, yy), hgt = Math.max(0.9, Math.abs(zero - yy));
      b += isFC ? rect(bx, top, bw, hgt, fcFill(c, hh, bw), col, 0.8)
                : rect(bx, top, bw, hgt, col);
      if (showLbl) {
        b += txt(bx + bw / 2, d[i] >= 0 ? top - c.fs * 0.42 : top + hgt + c.fs * 0.95,
                 dlbl(c, d[i]), c.fs, col, 'middle');
      }
    }
    return b;
  }

  /* Δ-Brücke: jeder Balken beginnt dort, wo der vorige kumulierte Wert endete
     (schwebende Balken mit dünnen Verbindern), so wie die kumulierte Δ-Ebene
     im ChartKitchen-Visual. opt.total hängt rechts eine Σ-Spalte an, die zur
     Gesamtsäule der Wertebene darunter passt.                               */
  function deltaBridge(c, d, sl, y, h, opt) {
    opt = opt || {};
    var g = opt.geom, cnt = d.length, i;
    var acc = [], run = 0, hi = 0, lo = 0;
    for (i = 0; i < cnt; i++) { acc.push(run); run = n(run + d[i]); }
    var end = run;
    for (i = 0; i < cnt; i++) {
      hi = Math.max(hi, acc[i], acc[i] + d[i]);
      lo = Math.min(lo, acc[i], acc[i] + d[i]);
    }
    hi = Math.max(hi, end); lo = Math.min(lo, end);
    var showLbl = opt.labels !== false && c.lab &&
                  sl.length && sl[0].step >= c.fs * 2.4 && h >= c.fs * 3.2;
    var lh = showLbl ? c.fs * 1.3 : c.fs * 0.2;
    var pad = Math.max(1, (hi - lo) * 0.08);
    var s = sc(lo - pad, hi + pad, y + h - lh, y + lh), zero = s(0), b = '';
    var x1 = opt.totX != null ? opt.totX + (opt.totW || 0) : sl[cnt - 1].x + sl[cnt - 1].w;
    b += ln(sl[0].x - 1, zero, x1 + 1, zero, c.C.axis, 1);
    for (i = 0; i < cnt; i++) {
      var col = dcol(c, d[i]);
      var bx = gx(sl, i, g), bw = gw(sl, i, g);
      var yT = s(Math.max(acc[i], acc[i] + d[i]));
      var yB = s(Math.min(acc[i], acc[i] + d[i]));
      // Verbinder auf Höhe des erreichten Standes bis zum nächsten Balken
      if (i) {
        var yc = s(acc[i]);
        b += ln(gx(sl, i - 1, g) + gw(sl, i - 1, g), yc, bx, yc, c.C.hair, 0.9);
      }
      b += rect(bx, yT, bw, Math.max(0.9, yB - yT), col);
      if (showLbl) {
        b += txt(bx + bw / 2, d[i] >= 0 ? yT - c.fs * 0.4 : yB + c.fs * 0.95,
                 dlbl(c, d[i]), c.fs, col, 'middle');
      }
    }
    // Σ-Spalte: die aufgelaufene Abweichung, an der Nulllinie verankert
    if (opt.totW) {
      var cT = dcol(c, end), yE = s(end);
      b += ln(gx(sl, cnt - 1, g) + gw(sl, cnt - 1, g), yE, opt.totX, yE, c.C.hair, 0.9);
      b += rect(opt.totX, Math.min(zero, yE), opt.totW, Math.max(0.9, Math.abs(zero - yE)), cT);
      if (showLbl) {
        b += txt(opt.totX + opt.totW / 2, end >= 0 ? Math.min(zero, yE) - c.fs * 0.4
                                                  : Math.max(zero, yE) + c.fs * 0.95,
                 dlbl(c, end), c.fs, cT, 'middle', '600');
      }
    }
    return b;
  }

  // Δ-Prozent: Pins mit Kopf um eine eigene Nulllinie (FC = offener Kopf).
  function deltaPins(c, d, sl, y, h, hh, opt) {
    opt = opt || {};
    var showLbl = opt.labels !== false && c.lab &&
                  sl.length && sl[0].step >= c.fs * 3.2 && h >= c.fs * 3.9;
    var lh = showLbl ? c.fs * 1.75 : c.fs * 0.4;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, y + h - lh, y + lh), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    var r = clamp(sl[0].w * 0.18, 1.1, 2.6);
    b += ln(sl[0].cx - sl[0].w * 0.6, zero,
            sl[sl.length - 1].cx + sl[sl.length - 1].w * 0.6, zero, c.C.axis, 1);
    for (i = 0; i < d.length; i++) {
      var yy = s(d[i]), col = dcol(c, d[i]), isFC = (i + 1) >= fcAt;
      b += ln(sl[i].cx, zero, sl[i].cx, yy, col, 1.3);
      b += isFC ? circ(sl[i].cx, yy, r, c.C.paper, col, 1) : circ(sl[i].cx, yy, r, col);
      if (showLbl) {
        b += txt(sl[i].cx, d[i] >= 0 ? yy - r - c.fs * 0.4 : yy + r + c.fs * 0.95,
                 plbl(c, d[i]), c.fs, col, 'middle');
      }
    }
    return b;
  }

  // Horizontale Δ-Balken (für Balken-Kombis), Labels am Balkenende.
  function deltaBarsH(c, d, rows, x, w, hh, opt) {
    opt = opt || {};
    var g = opt.geom;
    var showLbl = opt.labels !== false && c.lab && w >= c.fs * 9 && rows[0].step >= c.fs * 1.1;
    var lw = showLbl ? Math.min(c.fs * 2.9, w * 0.28) : 0;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, x + lw, x + w - lw), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    b += ln(zero, rows[0].y - 1, zero, rows[rows.length - 1].y + rows[rows.length - 1].h + 1, c.C.axis, 1);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = dcol(c, d[i]), isFC = (i + 1) >= fcAt;
      var bx = Math.min(zero, xx), bw = Math.max(0.9, Math.abs(xx - zero));
      var by = gy(rows, i, g), bh = gh(rows, i, g);
      b += isFC ? rect(bx, by, bw, bh, fcFill(c, hh, bw), col, 0.8)
                : rect(bx, by, bw, bh, col);
      if (showLbl) {
        b += txt(d[i] >= 0 ? xx + 2.2 : xx - 2.2, rows[i].cy + c.fs * 0.34,
                 dlbl(c, d[i]), c.fs, col, d[i] >= 0 ? 'start' : 'end');
      }
    }
    return b;
  }

  // Horizontale Δ%-Pins mit Kopf und optionalem Label.
  function deltaPinsH(c, d, rows, x, w, opt) {
    opt = opt || {};
    var showLbl = opt.labels !== false && c.lab && w >= c.fs * 10 && rows[0].step >= c.fs * 1.2;
    var lw = showLbl ? Math.min(c.fs * 3.2, w * 0.3) : 0;
    var m = maxOf(d) * 1.06;
    var s = sc(-m, m, x + lw, x + w - lw), zero = s(0), b = '', i;
    var fcAt = fcStart(c, d.length);
    var r = clamp(rows[0].h * 0.24, 1.1, 2.6);
    b += ln(zero, rows[0].y - 1, zero, rows[rows.length - 1].y + rows[rows.length - 1].h + 1, c.C.axis, 1);
    for (i = 0; i < d.length; i++) {
      var xx = s(d[i]), col = dcol(c, d[i]), cy = rows[i].cy, isFC = (i + 1) >= fcAt;
      b += ln(zero, cy, xx, cy, col, 1.3);
      b += isFC ? circ(xx, cy, r, c.C.paper, col, 1) : circ(xx, cy, r, col);
      if (showLbl) {
        b += txt(d[i] >= 0 ? xx + r + 1.8 : xx - r - 1.8, cy + c.fs * 0.34,
                 plbl(c, d[i]), c.fs, col, d[i] >= 0 ? 'start' : 'end');
      }
    }
    return b;
  }

  // Zeilenraster für horizontale Balken.
  function rowsOf(y, h, cnt, gapRatio) {
    var g = gapRatio == null ? 0.32 : gapRatio;
    cnt = Math.max(1, cnt | 0);
    var step = h / cnt, bh = Math.max(1.4, step * (1 - g)), a = [], i;
    for (i = 0; i < cnt; i++) a.push({ y: n(y + step * i + (step - bh) / 2), h: n(bh), cy: n(y + step * i + step / 2), step: n(step) });
    return a;
  }

  /* Säulengeometrie an einer Stelle: AC und PL je 0,42·Slot breit, um
     0,115·Slot versetzt (überlappende Gruppierung), PY breit und zentriert
     dahinter. Die Δ-Ebenen holen sich dieselben Maße über colGeom(), damit
     ein Δ-Balken genau so breit ist und genau so sitzt wie seine AC-Säule. */
  function colGeom(c, sl, kind, hasRef) {
    var step = sl && sl.length ? sl[0].step : 10;
    var off = !!hasRef && isOutline(kind);
    return {
      step: step, off: off,
      pw: off ? step * 0.42 : (hasRef && kind ? step * 0.44 : step * 0.6),
      rw: off ? step * 0.42 : step * 0.66,
      dx: off ? step * 0.115 : 0
    };
  }
  // Linke Kante und Breite des Δ-Balkens im Slot i.
  function gx(sl, i, g) { return g ? sl[i].cx + g.dx - g.pw / 2 : sl[i].x; }
  function gw(sl, i, g) { return g ? g.pw : sl[i].w; }

  // Dasselbe für liegende Balken: bh = Höhe der Hauptreihe, dy ihr Versatz.
  function rowGeom(c, rows, kind, hasRef) {
    var step = rows && rows.length ? rows[0].step : 10;
    var off = !!hasRef && isOutline(kind);
    return {
      step: step, off: off,
      bh: off ? step * 0.40 : (hasRef && kind ? step * 0.42 : step * 0.6),
      rh: off ? step * 0.40 : step * 0.66,
      dy: off ? step * 0.13 : 0
    };
  }
  function gy(rows, i, g) { return g ? rows[i].cy + g.dy - g.bh / 2 : rows[i].y; }
  function gh(rows, i, g) { return g ? g.bh : rows[i].h; }

  /* Säulenblock AC gegen Referenz — Geometrie wie im ChartKitchen-Visual,
     FC schraffiert. `sl` kommt von slots(..., 0.55), damit die Δ-Ebenen
     exakt darüberliegen. */
  function colBlock(c, P, ac, rf, kind, hh, sl, opt) {
    opt = opt || {};
    var cnt = ac.length, i;
    var gm = colGeom(c, sl, kind, !!rf);
    var step = gm.step, pw = gm.pw, rw = gm.rw, dx = gm.dx;
    var showLbl = opt.labels !== false && c.lab &&
                  step >= c.fs * 2.6 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    // Drittes Szenario (c.sec) als Marke: eigene Reihe, gleiche Skala.
    var sec = (opt.sec !== false && c.sec && rf) ? derive(c, ac, 0.86, 1.14) : null;
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0, sec ? maxOf(sec) : 0) * 1.04;
    var s = sc(0, mx, P.y + P.h, P.y + lh);
    var fcAt = fcStart(c, cnt), b = '';
    var ms = clamp(step * 0.16, 1.6, 4.2);        // Kantenlänge der Marke
    for (i = 0; i < cnt; i++) {
      var cxR = sl[i].cx - dx, cxP = sl[i].cx + dx;
      if (rf && kind) {
        var yR = s(rf[i]);
        b += refShape(c, cxR - rw / 2, yR, rw, Math.max(0.9, P.y + P.h - yR), kind, hh);
      }
      var isFC = (i + 1) >= fcAt, yT = s(ac[i]);
      b += isFC
        ? rect(cxP - pw / 2, yT, pw, Math.max(0.9, P.y + P.h - yT), fcFill(c, hh, pw), c.C.ac, 0.8)
        : rect(cxP - pw / 2, yT, pw, Math.max(0.9, P.y + P.h - yT), c.C.ac);
      if (sec) {
        // Spitze auf dem Wert, Körper darüber — bleibt innerhalb der Fläche.
        var yS = clamp(s(sec[i]), P.y + ms + 0.4, P.y + P.h);
        b += triDown(c, sl[i].cx, yS, ms, c.sec);
      }
      if (showLbl) {
        // Halo, wenn Referenzsäule oder Marke über dem Wertelabel liegt.
        var ovl = (!!rf && !!kind && rf[i] > ac[i]) || (!!sec && sec[i] > ac[i]);
        b += txt(cxP, yT - c.fs * 0.42, lbl(c, ac[i], 0), c.fs, isFC ? c.C.txt : c.C.ac, 'middle', null, ovl ? c.C.paper : null);
      }
    }
    b += fcSplit(c, sl, P.y, P.y + P.h);
    if (opt.baseline !== false) b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1.2);
    return { body: b, slots: sl, scale: s };
  }

  // Kategorie-Beschriftung unter einer Säulenreihe (bleibt im viewBox).
  function monLabels(c, sl, y, names) {
    if (!c.lab) return '';
    var b = '', i, nm = names || c.mon, t, tw, cx;
    for (i = 0; i < sl.length; i++) {
      if (sl[i].step < c.fs * 2.3) continue;
      t = nm[i % nm.length];
      tw = String(t).length * c.fs * 0.6;
      cx = sl[i].cx;
      if (c.x1 - c.x0 > tw) cx = clamp(cx, c.x0 + tw / 2, c.x1 - tw / 2);
      b += txt(cx, y, t, c.fs, c.C.txt, 'middle');
    }
    return b;
  }

  /* ====================================================================== */
  /*  Skizzen                                                               */
  /* ====================================================================== */

  var S = {};

  /* ---- 1 · Säulen: AC gegen Referenz, Δ-Ebene darüber ------------------ */
  S.columns = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c);
    var ac = vals(c, cnt, 72, 46), rf = kind ? derive(c, ac, 0.78, 1.22) : null;
    var labH = c.lab ? c.fs + 4 : 0;
    var legH = (c.lab && c.w >= 250 && c.h >= 120) ? c.fs + 4 : 0;
    // Δ-Ebene: absolut, sonst relativ — je nachdem, was eingeschaltet ist.
    var dMode = c.vAbs ? 'abs' : (c.vRel ? 'rel' : null);
    var withDelta = (!c.small && c.h >= 118 && dMode && !!kind);
    var yTop = c.y0 + legH, hAvail = Math.max(8, c.ih - legH - labH);
    var sl = slots(c.x0, c.iw, cnt, 0.55), P;
    if (legH) b += scenLegend(c, c.x0, c.y0 + c.fs, kind, hh);
    if (withDelta) {
      var capH = c.lab ? c.fs + 1 : 0;
      var bd = bands(yTop, hAvail, [34, 66], c.fs * 0.8);
      var dy0 = bd[0].y + capH, dh0 = Math.max(6, bd[0].h - capH);
      b += layerCap(c, c.x0, bd[0].y + c.fs - 1, 'Δ' + kind + (dMode === 'rel' ? ' %' : ''));
      b += dMode === 'abs'
        ? deltaCols(c, diffs(ac, rf), sl, dy0, dh0, hh, { geom: colGeom(c, sl, kind, !!rf) })
        : deltaPins(c, rels(ac, rf), sl, dy0, dh0, hh);
      P = { x: c.x0, y: bd[1].y, w: c.iw, h: bd[1].h };
    } else {
      P = { x: c.x0, y: yTop, w: c.iw, h: hAvail };
    }
    b += colBlock(c, P, ac, rf, kind, hh, sl).body;
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 2 · Säulen plus Linie (zweite Kennzahl) ------------------------- */
  S.colline = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var kind = refKind(c);
    var ac = vals(c, cnt, 68, 40), rf = kind ? derive(c, ac, 0.8, 1.2) : null;
    var topH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: topH });
    var sl = slots(P.x, P.w, cnt, 0.55), i;
    b += colBlock(c, P, ac, rf, kind, hh, sl, { labels: false }).body;
    // Zweite Kennzahl als dünne Linie mit offenen Punkten (eigene Skala).
    var q = [], pts = [];
    for (i = 0; i < cnt; i++) q.push(n(0.34 + c.rnd() * 0.46 + i * 0.015));
    var s2 = sc(0.2, 1.05, P.y + P.h, P.y + P.h * 0.1);
    for (i = 0; i < cnt; i++) pts.push([sl[i].cx, s2(q[i])]);
    b += polyline(pts, c.C.ac, c.small ? 1.2 : 1.7);
    if (!c.small) for (i = 0; i < pts.length; i++) b += circ(pts[i][0], pts[i][1], 1.9, c.C.paper, c.C.ac, 1.1);
    if (c.lab) b += txt(P.x, c.y0 + c.fs - 1, c.t.margin, c.fs, c.C.sub, 'start');
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 3 · Kombi: Δ% · Δabs · Säulen in drei Ebenen -------------------- */
  S.kombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c) || 'PL';
    var ac = vals(c, cnt, 72, 44), rf = derive(c, ac, 0.8, 1.2);
    var labH = c.lab ? c.fs + 4 : 0;
    var sl = slots(c.x0, c.iw, cnt, 0.55);
    if (c.small) {
      // Klein: nur eine Δ-Ebene, absolut hat Vorrang. Ohne beide Schalter
      // bleibt die Säulenebene allein und bekommt die ganze Höhe.
      if (!c.vAbs && !c.vRel) {
        b += colBlock(c, { x: c.x0, y: c.y0, w: c.iw, h: c.ih - labH }, ac, rf, kind, hh, sl).body;
        return wrap(c, b);
      }
      var bs = bands(c.y0, c.ih - labH, [34, 66], 2);
      b += c.vAbs
        ? deltaCols(c, diffs(ac, rf), sl, bs[0].y, bs[0].h, hh,
                    { labels: false, geom: colGeom(c, sl, kind, true) })
        : deltaPins(c, rels(ac, rf), sl, bs[0].y, bs[0].h, hh, { labels: false });
      b += colBlock(c, { x: c.x0, y: bs[1].y, w: c.iw, h: bs[1].h }, ac, rf, kind, hh, sl).body;
      return wrap(c, b);
    }
    var parts = [], keys = [], capH = c.lab ? c.fs + 1 : 0, i;
    if (c.vRel) { parts.push(25); keys.push('rel'); }
    if (c.vAbs) { parts.push(25); keys.push('abs'); }
    parts.push(50); keys.push('col');
    var bd = bands(c.y0, c.ih - labH, parts, c.fs * 0.7);
    for (i = 0; i < keys.length; i++) {
      var y = bd[i].y + capH, bandH = Math.max(6, bd[i].h - capH);
      if (keys[i] === 'rel') {
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind + ' %');
        b += deltaPins(c, rels(ac, rf), sl, y, bandH, hh);
      } else if (keys[i] === 'abs') {
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind);
        b += deltaCols(c, diffs(ac, rf), sl, y, bandH, hh, { geom: colGeom(c, sl, kind, true) });
      } else {
        b += colBlock(c, { x: c.x0, y: bd[i].y, w: c.iw, h: bd[i].h }, ac, rf, kind, hh, sl).body;
        b += monLabels(c, sl, c.y1 - 0.5);
      }
    }
    return wrap(c, b);
  };

  /* ---- 4 · Nur Δ-absolut-Säulen ---------------------------------------- */
  S.absvar = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var kind = refKind(c) || 'PL';
    var d = [], i;
    for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 60));
    var capH = c.lab ? c.fs + 2 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.55);
    b += layerCap(c, c.x0, c.y0 + c.fs - 1, 'Δ' + kind);
    // Ohne Wertebene gilt die Breite einer einzelnen Säule (0,6·Slot).
    b += deltaCols(c, d, sl, P.y, P.h, hh, { geom: colGeom(c, sl, null, false) });
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 5 · Nur Δ%-Pins -------------------------------------------------- */
  S.relvar = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 4 : (c.dense ? 10 : 7);
    var kind = refKind(c) || 'PL';
    var d = [], i;
    for (i = 0; i < cnt; i++) d.push(n((c.rnd() - 0.45) * 34));
    var capH = c.lab ? c.fs + 2 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: capH });
    var sl = slots(P.x, P.w, cnt, 0.55);
    b += layerCap(c, c.x0, c.y0 + c.fs - 1, 'Δ' + kind + ' %');
    b += deltaPins(c, d, sl, P.y, P.h, hh);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 6 · Linien AC / Referenz, Forecast gestrichelt ------------------ */
  S.line = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : (c.dense ? 16 : 11);
    var kind = refKind(c);
    var ac = vals(c, cnt, 70, 34), rf = kind ? derive(c, ac, 0.72, 1.06) : null;
    // Szenario-Notation wie im Visual: AC kräftig, PY grau, PL dünn mit
    // offenen Punkten, Forecast gestrichelt; Codes am letzten Punkt.
    var refDark = (kind === 'PY') ? c.C.py : c.C.ac;
    var rightW = c.lab ? c.fs * 4.2 : 0;
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0, top: c.lab ? c.fs * 0.6 : 0, right: rightW });
    var sec = c.sec ? derive(c, ac, 0.86, 1.14) : null;
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0, sec ? maxOf(sec) : 0) * 1.14;
    var s = sc(0, mx, P.y + P.h, P.y);
    var step = P.w / Math.max(1, cnt - 1), pa = [], pr = [], ps = [], sl = [], i;
    for (i = 0; i < cnt; i++) {
      pa.push([P.x + step * i, s(ac[i])]);
      if (rf) pr.push([P.x + step * i, s(rf[i])]);
      if (sec) ps.push([P.x + step * i, s(sec[i])]);
      sl.push({ cx: n(P.x + step * i), step: n(step), w: n(step) });
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1.2);
    // Drittes Szenario als dünne Hilfslinie, damit AC gegen PL und PY geht.
    if (sec) b += polyline(ps, c.sec === 'PY' ? c.C.py : c.C.hair, c.small ? 0.9 : 1.1, '2 2');
    if (rf) b += polyline(pr, refDark, kind === 'PY' ? (c.small ? 1.2 : 1.7) : (c.small ? 0.9 : 1.2));
    var fcAt = fcStart(c, cnt);
    if (hasFC(c) && fcAt < 1) {
      b += polyline(pa, c.C.ac, c.small ? 1.2 : 1.6, '3 2');      // reine FC-Reihe
    } else if (hasFC(c) && fcAt < cnt) {
      b += polyline(pa.slice(0, fcAt), c.C.ac, c.small ? 1.4 : 2);
      b += polyline(pa.slice(fcAt - 1), c.C.ac, c.small ? 1.2 : 1.6, '3 2');
      b += ln(pa[fcAt - 1][0], P.y, pa[fcAt - 1][0], P.y + P.h, c.C.hair, 0.8, '2 2');
    } else {
      b += polyline(pa, c.C.ac, c.small ? 1.4 : 2);
    }
    if (!c.small) {
      b += circ(pa[cnt - 1][0], pa[cnt - 1][1], 2.2, c.C.ac);
      if (rf) {
        b += kind === 'PY'
          ? circ(pr[cnt - 1][0], pr[cnt - 1][1], 2.2, c.C.py)
          : circ(pr[cnt - 1][0], pr[cnt - 1][1], 2.2, c.C.paper, c.C.ac, 1.1);
      }
    }
    if (c.lab) {
      b += txt(pa[cnt - 1][0] + 3.4, pa[cnt - 1][1] + c.fs * 0.34, lbl(c, ac[cnt - 1], 0) + ' ' + c.main, c.fs, c.C.ac, 'start');
      if (rf) b += txt(pr[cnt - 1][0] + 3.4, pr[cnt - 1][1] + c.fs * 0.34, lbl(c, rf[cnt - 1], 0) + ' ' + kind, c.fs, kind === 'PY' ? c.C.txt : c.C.ac, 'start');
    }
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 7 · Slope-Graph, zwei Zeitpunkte -------------------------------- */
  S.slope = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : 5;
    var labW = c.lab ? 26 : 0;
    var P = area(c, { left: labW, right: labW, bottom: c.lab ? c.fs + 2 : 0 });
    var a = vals(c, cnt, 60, 60), z = vals(c, cnt, 60, 60);
    var mx = Math.max(maxOf(a), maxOf(z)) * 1.12, s = sc(0, mx, P.y + P.h, P.y), i;
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.grid, 1);
    b += ln(P.x + P.w, P.y, P.x + P.w, P.y + P.h, c.C.grid, 1);
    for (i = 0; i < cnt; i++) {
      var y1 = s(a[i]), y2 = s(z[i]);
      var col = z[i] >= a[i] ? c.C.ac : c.C.py;
      b += ln(P.x, y1, P.x + P.w, y2, col, c.small ? 1.1 : 1.5);
      b += circ(P.x, y1, c.small ? 1.4 : 2, col) + circ(P.x + P.w, y2, c.small ? 1.4 : 2, col);
      if (c.lab) {
        b += txt(P.x - 3, y1 + 3, lbl(c, a[i], 0), c.fs, c.C.txt, 'end');
        b += txt(P.x + P.w + 3, y2 + 3, lbl(c, z[i], 0), c.fs, c.C.txt, 'start');
      }
    }
    if (c.lab) {
      b += txt(P.x, c.y1 - 0.5, refKind(c) || 'PY', c.fs, c.C.txt, 'middle');
      b += txt(P.x + P.w, c.y1 - 0.5, c.main, c.fs, c.C.txt, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 8 · Linie mit Forecast-Korridor --------------------------------- */
  S.fan = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : 12, split = Math.max(2, Math.round(cnt * 0.55));
    var ac = vals(c, cnt, 66, 26);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(ac) * 1.62, s = sc(0, mx, P.y + P.h, P.y);   // Kopfraum für den Korridor
    var step = P.w / Math.max(1, cnt - 1), i, hist = [], mid = [], up = [], dn = [];
    for (i = 0; i < split; i++) hist.push([P.x + step * i, s(ac[i])]);
    var lastV = ac[split - 1];
    for (i = split - 1; i < cnt; i++) {
      var t = (i - split + 1) / Math.max(1, cnt - split);
      var v = lastV * (1 + t * 0.22);
      var spread = lastV * t * 0.34;
      mid.push([P.x + step * i, s(v)]);
      up.push([P.x + step * i, s(v + spread)]);
      dn.push([P.x + step * i, s(v - spread)]);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    b += polygonEl(up.concat(dn.slice().reverse()), c.C.grid);
    b += polyline(hist, c.C.ac, c.small ? 1.3 : 1.8);
    b += polyline(mid, c.C.ac, c.small ? 1 : 1.3, '3 2');
    if (!c.small) b += ln(P.x + step * (split - 1), P.y, P.x + step * (split - 1), P.y + P.h, c.C.grid, 1);
    if (c.lab) b += txt(P.x + step * (split - 1) + 3, P.y + c.fs, 'FC', c.fs, c.C.txt, 'start');
    return wrap(c, b);
  };

  /* ---- 9 · Z-Chart: Monat, kumuliert, gleitend 12 ---------------------- */
  S.zchart = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : 12;
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var step = P.w / Math.max(1, cnt - 1), i, mo = [], cum = [], mat = [];
    for (i = 0; i < cnt; i++) {
      var x = P.x + step * i;
      mo.push([x, P.y + P.h - P.h * (0.08 + c.rnd() * 0.12)]);
      cum.push([x, P.y + P.h - P.h * (0.06 + 0.82 * (i / Math.max(1, cnt - 1)))]);
      mat.push([x, P.y + P.h - P.h * (0.70 + (c.rnd() - 0.5) * 0.06)]);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    b += polyline(mo, c.C.py, c.small ? 1 : 1.2);
    b += polyline(mat, c.C.py, c.small ? 1 : 1.3, '3 2');
    b += polyline(cum, c.C.ac, c.small ? 1.4 : 1.9);
    if (c.lab) {
      b += txt(P.x + 2, mat[1][1] - 3, 'MAT 12', c.fs, c.C.txt, 'start');
      b += txt(P.x + P.w - 2, cum[cnt - 1][1] - 3, c.t.cumul, c.fs, c.C.txt, 'end');
    }
    return wrap(c, b);
  };

  /* ---- 10 · Gestapelte Säulen ------------------------------------------ */
  S.stackcol = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 4 : (c.dense ? 9 : 6);
    var segs = c.small ? 2 : 3, cols = [c.C.ac, c.C.g2, c.C.g3];
    var tot = [], parts = [], i, j;
    for (i = 0; i < cnt; i++) {
      var row = [], t = 0;
      for (j = 0; j < segs; j++) { var v = n(18 + c.rnd() * 26); row.push(v); t += v; }
      parts.push(row); tot.push(n(t));
    }
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0 });
    var sl = slots(P.x, P.w, cnt, 0.34);
    var showLbl = c.lab && sl[0].w >= c.fs * 2.2 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.35 : c.fs * 0.2;
    var mx = maxOf(tot) * 1.04, s = sc(0, mx, P.y + P.h, P.y + lh);
    for (i = 0; i < cnt; i++) {
      var acc = 0;
      for (j = 0; j < segs; j++) {
        var y1 = s(acc), y2 = s(acc + parts[i][j]);
        b += rect(sl[i].x, y2, sl[i].w, Math.max(0.9, y1 - y2), cols[j % cols.length]);
        if (j) b += ln(sl[i].x, y1, sl[i].x + sl[i].w, y1, c.C.paper, 0.7);
        acc += parts[i][j];
      }
      if (showLbl) b += txt(sl[i].cx, s(tot[i]) - c.fs * 0.42, lbl(c, tot[i], 0), c.fs, c.C.ac, 'middle');
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1.2);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 11 · Wasserfall, vertikal: Σ · Δ-Schritte · Σ ------------------- */
  S.waterfall = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : (c.dense ? 6 : 4), cnt = mids + 2;
    var start = 70, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.4) * 34));
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0 });
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var sl = slots(P.x, P.w, cnt, 0.3);
    var showLbl = c.lab && sl[0].w >= c.fs * 1.9 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.2;
    var s = sc(low, Math.max(peak, start, end) * 1.04, P.y + P.h, P.y + lh);
    var zero = s(0), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, zero - s(start)), c.C.ac);
    if (showLbl) b += txt(sl[0].cx, s(start) - c.fs * 0.42, lbl(c, start, 0), c.fs, c.C.ac, 'middle', '600');
    for (i = 0; i < mids; i++) {
      var from = cur, to = n(cur + steps[i]);
      var yTop = s(Math.max(from, to)), yBot = s(Math.min(from, to));
      b += ln(sl[i].x + sl[i].w, s(from), sl[i + 1].x, s(from), c.C.hair, 0.9);
      b += rect(sl[i + 1].x, yTop, sl[i + 1].w, Math.max(0.9, yBot - yTop), dcol(c, steps[i]));
      if (showLbl) b += txt(sl[i + 1].cx, yTop - c.fs * 0.42, dlbl(c, steps[i]), c.fs, dcol(c, steps[i]), 'middle');
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), c.C.hair, 0.9);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, zero - s(end)), c.C.ac);
    if (showLbl) b += txt(sl[cnt - 1].cx, s(end) - c.fs * 0.42, lbl(c, end, 0), c.fs, c.C.ac, 'middle', '600');
    b += ln(P.x, zero, P.x + P.w, zero, c.C.axis, 1.2);
    if (c.lab) {
      var nm = ['Σ'];
      for (i = 0; i < mids; i++) nm.push(c.cat[i % c.cat.length]);
      nm.push('Σ');
      b += monLabels(c, sl, c.y1 - 0.5, nm);
    }
    return wrap(c, b);
  };

  /* ---- 12 · Brücke: Σ PY -> Δ-Schritte -> Σ AC ------------------------- */
  S.bridge = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var mids = c.small ? 2 : (c.dense ? 6 : 4), cnt = mids + 2;
    var start = 68, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 30));
    var P = area(c, { bottom: c.lab ? c.fs + 4 : 0 });
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var sl = slots(P.x, P.w, cnt, 0.3);
    var showLbl = c.lab && sl[0].w >= c.fs * 1.9 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.2;
    var s = sc(low, Math.max(peak, start, end) * 1.04, P.y + P.h, P.y + lh);
    var zero = s(0), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, zero - s(start)), c.C.py);
    if (showLbl) b += txt(sl[0].cx, s(start) - c.fs * 0.42, lbl(c, start, 0), c.fs, c.C.txt, 'middle', '600');
    for (i = 0; i < mids; i++) {
      var to = n(cur + steps[i]);
      var yTop = s(Math.max(cur, to)), yBot = s(Math.min(cur, to));
      b += ln(sl[i].x + sl[i].w, s(cur), sl[i + 1].x, s(cur), c.C.hair, 0.9);
      b += rect(sl[i + 1].x, yTop, sl[i + 1].w, Math.max(0.9, yBot - yTop), dcol(c, steps[i]));
      if (showLbl) b += txt(sl[i + 1].cx, yTop - c.fs * 0.42, dlbl(c, steps[i]), c.fs, dcol(c, steps[i]), 'middle');
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), c.C.hair, 0.9);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, zero - s(end)), c.C.ac);
    if (showLbl) b += txt(sl[cnt - 1].cx, s(end) - c.fs * 0.42, lbl(c, end, 0), c.fs, c.C.ac, 'middle', '600');
    b += ln(P.x, zero, P.x + P.w, zero, c.C.axis, 1.2);
    if (c.lab) {
      var nm2 = [refKind(c) || 'PY'];
      for (i = 0; i < mids; i++) nm2.push(c.cat[i % c.cat.length]);
      nm2.push(c.main);
      b += monLabels(c, sl, c.y1 - 0.5, nm2);
    }
    return wrap(c, b);
  };

  /* ---- 13 · Integrierte Varianzanalyse: Δ% YTD · Δ% · Δ-Brücke · Säulen - */
  S.varint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 9 : 6);
    var kind = refKind(c) || 'PL';
    var ac = vals(c, cnt, 74, 40), pl = derive(c, ac, 0.82, 1.18);
    var dAbs = diffs(ac, pl), dRel = rels(ac, pl);
    var ytd = [], run = 0, i;
    for (i = 0; i < cnt; i++) { run = n(run * 0.6 + dRel[i] * 0.5); ytd.push(run); }
    var labH = c.lab ? c.fs + 4 : 0;
    if (c.small) {
      var slS = slots(c.x0, c.iw, cnt, 0.55);
      if (!c.vAbs && !c.vRel) {
        b += colBlock(c, { x: c.x0, y: c.y0, w: c.iw, h: c.ih - labH }, ac, pl, kind, hh, slS).body;
        return wrap(c, b);
      }
      var bs = bands(c.y0, c.ih - labH, [36, 64], 2);
      b += c.vRel
        ? deltaPins(c, dRel, slS, bs[0].y, bs[0].h, hh, { labels: false })
        : deltaCols(c, dAbs, slS, bs[0].y, bs[0].h, hh,
                    { labels: false, geom: colGeom(c, slS, kind, true) });
      b += colBlock(c, { x: c.x0, y: bs[1].y, w: c.iw, h: bs[1].h }, ac, pl, kind, hh, slS).body;
      return wrap(c, b);
    }
    // Σ-Gesamtsäule rechts: Ist gefüllt, Forecast schraffiert darüber.
    var totW = (c.lab && c.w >= 300) ? Math.min(34, c.iw * 0.12) : 0;
    var plotW = c.iw - (totW ? totW + c.fs : 0);
    var capH = c.lab ? c.fs + 1 : 0;
    /* Ebenen nach o.variance: Δ% YTD und Δ% hängen an 'rel', die kumulierte
       Δ-Brücke an 'abs'. Ohne beide bleibt nur die Säulenebene.
       Bei knapper Höhe entfällt die YTD-Ebene, damit die übrigen atmen.     */
    var tall = c.h >= 165;
    // Gewichte: die Δ%-Pins brauchen Luft, die Δ-Brücke darf nicht dominieren.
    var parts = [], keys = [];
    if (c.vRel && tall) { parts.push(16); keys.push('ytd'); }
    if (c.vRel) { parts.push(tall ? 20 : 25); keys.push('rel'); }
    if (c.vAbs) { parts.push(tall ? 20 : 25); keys.push('cum'); }
    parts.push(keys.length ? (tall ? 44 : 50) : 100); keys.push('col');
    var bd = bands(c.y0, c.ih - labH, parts, c.fs * 0.6);
    var sl = slots(c.x0, plotW, cnt, 0.55);
    var gm = colGeom(c, sl, kind, true);
    var P = { x: c.x0, y: bd[keys.length - 1].y, w: plotW, h: bd[keys.length - 1].h };
    for (i = 0; i < keys.length - 1; i++) {
      var yL = bd[i].y + capH, hL = Math.max(5, bd[i].h - capH);
      if (keys[i] === 'ytd') {
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind + ' % YTD');
        b += deltaPins(c, ytd, sl, yL, hL, hh, { labels: false });
      } else if (keys[i] === 'rel') {
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind + ' %');
        b += deltaPins(c, dRel, sl, yL, hL, hh, { labels: false });
      } else {
        // Δ-Brücke: jeder Balken setzt auf dem aufgelaufenen Stand des vorigen
        // auf, die Σ-Spalte steht über der Gesamtsäule der Wertebene.
        b += layerCap(c, c.x0, bd[i].y + c.fs - 1, 'Δ' + kind + ' ' + c.t.cumul);
        b += deltaBridge(c, dAbs, sl, yL, hL,
                         { geom: gm, totX: totW ? c.x1 - totW : null, totW: totW });
      }
    }
    // Letzte Ebene: Säulen der Hauptreihe gegen die Referenz
    var blk = colBlock(c, P, ac, pl, kind, hh, sl);
    b += blk.body + monLabels(c, sl, c.y1 - 0.5);
    if (totW) {
      var fcAt = fcStart(c, cnt), sAC = 0, sFC = 0;
      for (i = 0; i < cnt; i++) { if ((i + 1) >= fcAt) sFC += ac[i]; else sAC += ac[i]; }
      var scT = sc(0, (sAC + sFC) * 1.06, P.y + P.h, P.y + c.fs * 1.35);
      var tx = c.x1 - totW, tw = totW;
      b += rect(tx, scT(sAC), tw, Math.max(0.9, P.y + P.h - scT(sAC)), c.C.ac);
      if (sFC) b += rect(tx, scT(sAC + sFC), tw, Math.max(0.9, scT(sAC) - scT(sAC + sFC)), fcFill(c, hh, tw), c.C.ac, 0.8);
      b += txt(tx + tw / 2, scT(sAC + sFC) - c.fs * 0.42, lbl(c, sAC + sFC, 0), c.fs, c.C.ac, 'middle', '600');
      b += ln(tx, P.y + P.h, tx + tw, P.y + P.h, c.C.axis, 1.2);
      b += txt(tx + tw / 2, c.y1 - 0.5, (sFC && c.main !== 'FC') ? c.main + '+FC' : 'Σ ' + c.main, c.fs, c.C.txt, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 14 · Horizontale Balken, sortiert -------------------------------- */
  S.bars = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var kind = refKind(c);
    var ac = sortDesc(vals(c, cnt, 68, 50)), rf = kind ? derive(c, ac, 0.78, 1.2) : null;
    var sec = (kind && c.sec) ? derive(c, ac, 0.86, 1.14) : null;
    // Δ-Spalte am rechten Rand, gesteuert über o.variance (Δ% vor Δ absolut).
    var dOn = !!rf && c.lab && (c.vAbs || c.vRel);
    var dRel = dOn && c.vRel, dW = dOn ? c.fs * 3.4 : 0;
    var labW = c.lab ? Math.min(40, c.iw * 0.2) : 0;
    var valW = c.lab ? c.fs * 2.8 : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var P = area(c, { left: labW, right: valW + dW, top: headH });
    var mx = Math.max(maxOf(ac), rf ? maxOf(rf) : 0, sec ? maxOf(sec) : 0) * 1.04;
    var s = sc(0, mx, P.x, P.x + P.w);
    var rw = rowsOf(P.y, P.h, cnt, c.small ? 0.36 : 0.26), i;
    var off = !!rf && isOutline(kind);
    // Kategorien sind keine Zeitachse: schraffiert wird nur, wenn die ganze
    // Hauptreihe Forecast ist (scenarios:['PL','FC']).
    var allFC = (c.main === 'FC');
    for (i = 0; i < cnt; i++) {
      var step = rw[i].step;
      var bh = off ? step * 0.40 : (rf ? step * 0.42 : step * 0.6);
      var dy = off ? step * 0.13 : 0;
      if (rf && kind) {
        var hR = off ? bh : step * 0.66;
        b += refShape(c, P.x, rw[i].cy - dy - hR / 2, Math.max(0.9, s(rf[i]) - P.x), hR, kind, hh);
      }
      var bw = Math.max(0.9, s(ac[i]) - P.x), by = rw[i].cy + dy - bh / 2;
      b += allFC
        ? rect(P.x, by, bw, bh, fcFill(c, hh, bh), c.C.ac, 0.8)
        : rect(P.x, by, bw, bh, c.C.ac);
      // Drittes Szenario als Marke, Spitze auf dem Wert.
      if (sec) b += triLeft(c, clamp(s(sec[i]), P.x, P.x + P.w - clamp(step * 0.2, 1.6, 4)),
                            rw[i].cy, clamp(step * 0.2, 1.6, 4), c.sec);
      if (c.lab) {
        b += txt(Math.max(s(ac[i]), rf ? s(rf[i]) : 0) + 2.5, rw[i].cy + c.fs * 0.34, lbl(c, ac[i], 0), c.fs, c.C.ac, 'start');
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
      }
      if (dOn) {
        var dv = dRel ? n(rf[i] ? (ac[i] - rf[i]) / Math.abs(rf[i]) * 100 : 0) : n(ac[i] - rf[i]);
        b += txt(c.x1, rw[i].cy + c.fs * 0.34, dRel ? plbl(c, dv) : dlbl(c, dv),
                 c.fs, dcol(c, dv), 'end');
      }
    }
    if (dOn) b += txt(c.x1, c.y0 + c.fs, 'Δ' + kind + (dRel ? ' %' : ''), c.fs, c.C.sub, 'end');
    if (c.lab) b += txt(P.x, c.y0 + c.fs, c.main + (kind ? ' ' + c.t.vs + ' ' + kind : ''), c.fs, c.C.sub, 'start');
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1.2);
    return wrap(c, b);
  };

  /* ---- 15 · Bullet-Balken mit Zielmarke -------------------------------- */
  S.bullet = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 2 : (c.dense ? 6 : 4);
    var labW = c.lab ? Math.min(38, c.iw * 0.2) : 0;
    var valW = c.lab ? c.fs * 3.4 : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var P = area(c, { left: labW, right: valW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i;
    for (i = 0; i < cnt; i++) {
      var v = 0.45 + c.rnd() * 0.5, t = 0.55 + c.rnd() * 0.35;
      var bh = rw[i].h * 0.54;
      b += rect(P.x, rw[i].y, P.w, rw[i].h, c.C.pane);
      b += rect(P.x, rw[i].y + rw[i].h * 0.2, P.w * Math.min(1, t) * 0.999, rw[i].h * 0.6, c.C.grid);
      b += rect(P.x, rw[i].cy - bh / 2, Math.max(0.9, P.w * Math.min(1, v)), bh, c.C.ac);
      b += ln(P.x + P.w * Math.min(1, t), rw[i].y - 0.6, P.x + P.w * Math.min(1, t), rw[i].y + rw[i].h + 0.6, c.C.axis, 1.6);
      if (c.lab) {
        // Δ zur Zielmarke laut o.variance (Δ% vor Δ absolut).
        var d = c.vRel ? n((v / t - 1) * 100) : n((v - t) * 100);
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
        if (c.vRel || c.vAbs) {
          b += txt(P.x + P.w + 2.5, rw[i].cy + c.fs * 0.34, c.vRel ? plbl(c, d) : dlbl(c, d),
                   c.fs, dcol(c, d), 'start');
        }
      }
    }
    if (c.lab) b += txt(P.x, c.y0 + c.fs, 'AC ' + c.t.vs + ' ' + c.t.target, c.fs, c.C.sub, 'start');
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1.2);
    return wrap(c, b);
  };

  /* ---- 16 · Pareto: Balken plus Summenlinie ---------------------------- */
  S.pareto = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 4 : (c.dense ? 9 : 6);
    var v = sortDesc(vals(c, cnt, 60, 70)), tot = 0, i;
    for (i = 0; i < cnt; i++) tot += v[i];
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(v) * 1.15, s = sc(0, mx, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.24), acc = 0, pts = [];
    for (i = 0; i < cnt; i++) {
      b += rect(sl[i].x, s(v[i]), sl[i].w, Math.max(0.9, P.y + P.h - s(v[i])), c.C.py);
      acc += v[i];
      pts.push([sl[i].cx, P.y + P.h - P.h * 0.9 * (acc / (tot || 1))]);
    }
    if (!c.small) b += ln(P.x, P.y + P.h - P.h * 0.72, P.x + P.w, P.y + P.h - P.h * 0.72, c.C.grid, 1, '3 2');
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    b += polyline(pts, c.C.ac, c.small ? 1.2 : 1.6);
    if (!c.small) for (i = 0; i < pts.length; i++) b += circ(pts[i][0], pts[i][1], 1.6, c.C.ac);
    if (c.lab) b += txt(P.x + P.w, P.y + P.h - P.h * 0.72 - 2, '80 %', c.fs, c.C.txt, 'end');
    return wrap(c, b);
  };

  /* ---- 17 · Dot-Plot: Punkte auf Linien -------------------------------- */
  S.dotplot = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var labW = c.lab ? 34 : 0;
    var P = area(c, { left: labW, right: 4 });
    var rw = rowsOf(P.y, P.h, cnt, 0.2), i;
    var r = c.small ? 1.6 : 2.4;
    for (i = 0; i < cnt; i++) {
      b += ln(P.x, rw[i].cy, P.x + P.w, rw[i].cy, c.C.grid, 1);
      var a = 0.25 + c.rnd() * 0.65, p = 0.2 + c.rnd() * 0.6;
      if (refKind(c)) b += circ(P.x + P.w * p, rw[i].cy, r, c.C.py);
      b += circ(P.x + P.w * a, rw[i].cy, r, c.C.ac);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ---- 18 · Tornado ---------------------------------------------------- */
  S.tornado = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var P = area(c, {});
    var mid = P.x + P.w / 2;
    var rw = rowsOf(P.y, P.h, cnt, 0.3), i;
    for (i = 0; i < cnt; i++) {
      var f = 1 - i / (cnt + 1);
      var l = P.w * 0.46 * f * (0.5 + c.rnd() * 0.5);
      var r = P.w * 0.46 * f * (0.5 + c.rnd() * 0.5);
      b += rect(mid - l, rw[i].y, Math.max(0.9, l), rw[i].h, c.C.py);
      b += rect(mid, rw[i].y, Math.max(0.9, r), rw[i].h, c.C.ac);
    }
    b += ln(mid, P.y, mid, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ---- 19 · Balken-Kombi: Balken + Δabs + Δ% nebeneinander ------------- */
  S.barskombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var kind = refKind(c) || 'PL';
    var ac = sortDesc(vals(c, cnt, 68, 46)), pl = derive(c, ac, 0.8, 1.2);
    var sec = c.sec ? derive(c, ac, 0.86, 1.14) : null;
    var allFC = (c.main === 'FC');
    var labW = c.lab ? Math.min(34, c.iw * 0.16) : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var P = area(c, { left: labW, top: headH });
    var gap = c.small ? 3 : c.fs * 1.1;
    var noD = !c.vAbs && !c.vRel;        // ohne Δ-Ebene bekommt die Balkenebene alles
    var wide = c.small || !c.vRel || c.w < 260;
    var w1 = noD ? P.w : (wide ? P.w * 0.60 : P.w * 0.46);
    var w2 = Math.max(6, (wide ? P.w * 0.40 : P.w * 0.29) - gap);
    var w3 = wide ? 0 : Math.max(6, P.w * 0.25 - gap);
    var rw = rowsOf(P.y, P.h, cnt, c.small ? 0.36 : 0.26), i;
    var valW = c.lab ? c.fs * 2.4 : 0;
    var mx = Math.max(maxOf(ac), maxOf(pl), sec ? maxOf(sec) : 0) * 1.04;
    var s = sc(0, mx, P.x, P.x + Math.max(4, w1 - valW));
    var rg = rowGeom(c, rw, kind, true), off = rg.off;
    for (i = 0; i < cnt; i++) {
      var step = rg.step, bh = rg.bh, dy = rg.dy, hR = rg.rh;
      b += refShape(c, P.x, rw[i].cy - dy - hR / 2, Math.max(0.9, s(pl[i]) - P.x), hR, kind, hh);
      var by = rw[i].cy + dy - bh / 2, bwv = Math.max(0.9, s(ac[i]) - P.x);
      b += allFC ? rect(P.x, by, bwv, bh, fcFill(c, hh, bh), c.C.ac, 0.8)
                 : rect(P.x, by, bwv, bh, c.C.ac);
      if (sec) {
        var ms = clamp(step * 0.2, 1.6, 4);
        b += triLeft(c, clamp(s(sec[i]), P.x, P.x + Math.max(4, w1 - valW) - ms), rw[i].cy, ms, c.sec);
      }
      if (c.lab) {
        b += txt(Math.max(s(ac[i]), s(pl[i])) + 2.2, rw[i].cy + c.fs * 0.34, lbl(c, ac[i], 0), c.fs, c.C.ac, 'start');
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
      }
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1.2);
    if (c.lab) b += txt(P.x, c.y0 + c.fs, c.main + ' ' + c.t.vs + ' ' + kind, c.fs, c.C.sub, 'start');
    var x2 = P.x + w1 + gap;
    if (c.vAbs) {
      if (c.lab) b += txt(x2 + w2 / 2, c.y0 + c.fs, 'Δ' + kind, c.fs, c.C.sub, 'middle');
      b += deltaBarsH(c, diffs(ac, pl), rw, x2, w2, hh, { geom: rg });
    }
    if (!wide && c.vRel) {
      var x3 = x2 + w2 + gap;
      if (c.lab) b += txt(x3 + w3 / 2, c.y0 + c.fs, 'Δ' + kind + ' %', c.fs, c.C.sub, 'middle');
      b += deltaPinsH(c, rels(ac, pl), rw, x3, w3);
    }
    return wrap(c, b);
  };

  /* ---- 20 · IBCS-Tabelle: AC · Referenz · Δ · Δ% mit Σ-Zeile ----------- */
  S.table = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 3 : (c.dense ? 7 : 5);
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var headH = c.lab ? c.fs + 5 : Math.min(7, P.h * 0.22);
    var rh = (P.h - headH) / (rows + 1);
    var wide = c.lab && c.w >= 300;
    var ac = [], rf = [], d = [], rel = [], sAC = 0, sRF = 0, i;
    for (i = 0; i < rows; i++) {
      var a = n(40 + c.rnd() * 60), p = n(a * (0.8 + c.rnd() * 0.4));
      ac.push(a); rf.push(p); d.push(n(a - p)); rel.push(n(p ? (a - p) / p * 100 : 0));
      sAC += a; sRF += p;
    }
    sAC = n(sAC); sRF = n(sRF);
    var dS = n(sAC - sRF), relS = n(sRF ? dS / sRF * 100 : 0);
    /* Spaltenaufteilung folgt o.variance: ohne Δ-Spalten wächst der
       In-Zellen-Balken, mit nur einer Δ-Spalte bekommt diese den ganzen Block. */
    var dOn = c.vAbs, rOn = c.vRel, anyD = dOn || rOn;
    var acR   = P.x + P.w * (wide ? 0.25 : 0.34);
    var cellX = P.x + P.w * 0.27, cellW = P.w * (anyD ? 0.15 : 0.68);
    var blkX  = P.x + P.w * (wide ? 0.46 : 0.38), blkW = Math.max(0, P.x + P.w - blkX);
    var dX = blkX, dW = 0, rX = blkX, rW = 0;
    if (dOn && rOn) { dW = blkW * 0.58; rX = blkX + dW; rW = blkW * 0.42; }
    else if (dOn)   { dW = blkW; rX = blkX + blkW; }
    else if (rOn)   { rW = blkW; }
    var dA = dX + dW / 2, rA = rX + rW / 2;
    // Labelrand aus der tatsächlichen Textbreite, damit nichts herausläuft.
    var wD = dlbl(c, dS).length, wR = plbl(c, relS).length;
    for (i = 0; i < rows; i++) { wD = Math.max(wD, dlbl(c, d[i]).length); wR = Math.max(wR, plbl(c, rel[i]).length); }
    var lwD = c.lab ? Math.min(dW * 0.42, wD * c.fs * 0.62 + 3) : 0;
    var lwR = c.lab ? Math.min(rW * 0.42, wR * c.fs * 0.62 + 4) : 0;
    var sD = sc(-maxOf(d.concat([dS])) * 1.06, maxOf(d.concat([dS])) * 1.06, dX + lwD, dX + dW - lwD);
    var sR = sc(-maxOf(rel.concat([relS])) * 1.06, maxOf(rel.concat([relS])) * 1.06, rX + lwR, rX + rW - lwR);
    // In-Zellen-Balken: Datenzeilen auf ihr Maximum, Σ-Zeile auf die Summe skaliert
    var mxAC = maxOf(ac.concat(rf)) || 1;
    // Kopfzeile
    if (c.lab) {
      b += txt(acR, P.y + headH - 4, c.main, c.fs, c.C.ac, 'end', '600');
      if (wide) b += txt(cellX + cellW, P.y + headH - 4, kind, c.fs, c.C.sub, 'end', '600');
      if (dOn) b += txt(dA, P.y + headH - 4, 'Δ' + kind, c.fs, c.C.sub, 'middle', '600');
      if (rOn) b += txt(rA, P.y + headH - 4, 'Δ' + kind + ' %', c.fs, c.C.sub, 'middle', '600');
    }
    b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, c.C.axis, 1.2);
    if (dOn) b += ln(dA, P.y + headH, dA, P.y + P.h, c.C.axis, 0.8);
    if (rOn) b += ln(rA, P.y + headH, rA, P.y + P.h, c.C.grid, 0.9);
    function tRow(label, a, p, dv, rv, y, bold, mxr) {
      var s = '', cy = y + rh * 0.66, bh = Math.max(1.6, rh * 0.42), col = dcol(c, dv);
      if (c.lab) {
        s += txt(P.x, cy, fit(c, label, acR - P.x - c.fs * 2.2), c.fs, bold ? c.C.ac : c.C.txt, 'start', bold ? '600' : null);
        s += txt(acR, cy, lbl(c, a, 0), c.fs, c.C.ac, 'end', bold ? '600' : null);
      } else {
        s += ghost(c, P.x, y + rh * 0.34, P.w * 0.18, Math.max(1.3, rh * 0.2));
        s += ghost(c, P.x + P.w * 0.22, y + rh * 0.34, P.w * 0.1, Math.max(1.3, rh * 0.2), c.C.ghost2);
      }
      // In-Zellen-Balken: Referenz als Kontur, AC gefüllt davor
      if (wide) {
        s += rect(cellX, y + rh * 0.5 - bh * 0.66, Math.max(0.8, cellW * (p / mxr)), bh * 1.32, c.C.plf, c.C.pls, 0.9);
        s += rect(cellX, y + rh * 0.5 - bh / 2, Math.max(0.8, cellW * (a / mxr)), bh, c.C.ac);
      }
      // Δ absolut: Balken an der eigenen Nulllinie plus Wert
      if (dOn) {
        var xx = sD(dv);
        s += rect(Math.min(dA, xx), y + rh * 0.5 - bh * 0.4, Math.max(0.8, Math.abs(xx - dA)), bh * 0.8, col);
        if (c.lab) s += txt(dv >= 0 ? xx + 2 : xx - 2, cy, dlbl(c, dv), c.fs, col, dv >= 0 ? 'start' : 'end', bold ? '600' : null);
      }
      // Δ relativ: Pin mit Kopf
      if (rOn) {
        var xr = sR(rv), cy2 = y + rh * 0.5;
        s += ln(rA, cy2, xr, cy2, col, 1.3);
        s += circ(xr, cy2, clamp(rh * 0.15, 1.1, 2.4), col);
        if (c.lab) s += txt(rv >= 0 ? xr + 3 : xr - 3, cy, plbl(c, rv), c.fs, col, rv >= 0 ? 'start' : 'end', bold ? '600' : null);
      }
      return s;
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, c.C.grid, 0.9);
      b += tRow(c.cat[i % c.cat.length], ac[i], rf[i], d[i], rel[i], y, false, mxAC);
    }
    var ys = P.y + headH + rh * rows;
    b += ln(P.x, ys, P.x + P.w, ys, c.C.axis, 1);
    b += tRow('Σ', sAC, sRF, dS, relS, ys, true, Math.max(sAC, sRF) || 1);
    return wrap(c, b);
  };

  /* ---- 20b · GuV-Statement (P&L) ---------------------------------------- */

  /* Zeilengerüst: i = Index in c.t.pnl, lvl = Einrückung, t = Zeilenart.
     'pos'/'neg' sind Positionen (Kosten stehen negativ, damit die
     Vorzeichenlogik von dcol() ohne Sonderfall stimmt: mehr Kosten heißt
     stärker negatives Δ heißt ungünstig — und o.polarity dreht auch das um).
     'sum' ist eine Formelzeile (Zwischensumme aller Positionen davor),
     'total' die Σ-Zeile.                                                    */
  var PNL_FULL = [
    { i: 0,  lvl: 0, t: 'pos', f:  1     },
    { i: 1,  lvl: 1, t: 'neg', f: -0.38  },
    { i: 2,  lvl: 0, t: 'sum' },
    { i: 3,  lvl: 1, t: 'neg', f: -0.27  },
    { i: 4,  lvl: 1, t: 'neg', f: -0.13  },
    { i: 5,  lvl: 0, t: 'sum' },
    { i: 6,  lvl: 1, t: 'neg', f: -0.055 },
    { i: 7,  lvl: 0, t: 'sum' },
    { i: 8,  lvl: 1, t: 'neg', f: -0.02  },
    { i: 9,  lvl: 1, t: 'neg', f: -0.035 },
    { i: 10, lvl: 0, t: 'total' }
  ];
  // Kurzfassung für kleine Kacheln — in sich ebenso schlüssig gerechnet.
  var PNL_MINI = [
    { i: 0, lvl: 0, t: 'pos', f:  1    },
    { i: 1, lvl: 1, t: 'neg', f: -0.38 },
    { i: 2, lvl: 0, t: 'sum' },
    { i: 4, lvl: 1, t: 'neg', f: -0.41 },
    { i: 7, lvl: 0, t: 'total' }
  ];

  // Werte je Zeile: Positionen aus dem Seed, Formelzeilen als laufende Summe.
  function pnlVals(c, spec, base) {
    var ac = [], rf = [], a = 0, r = 0, i, sp, va, vr;
    for (i = 0; i < spec.length; i++) {
      sp = spec[i];
      if (sp.t === 'sum' || sp.t === 'total') { ac.push(n(a)); rf.push(n(r)); continue; }
      // Enge Streuung: sonst schaukeln sich die Formelzeilen zu Δ% im
      // dreistelligen Bereich auf, weil sie Differenzen großer Zahlen sind.
      va = base * sp.f * (0.975 + c.rnd() * 0.05);
      vr = base * sp.f * (0.975 + c.rnd() * 0.05);
      ac.push(n(va)); rf.push(n(vr));
      a += va; r += vr;
    }
    return { ac: ac, rf: rf };
  }

  S.pnl = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var spec = (c.small || c.h < 150) ? PNL_MINI : PNL_FULL;
    var headH = c.lab ? c.fs + 5 : Math.min(7, P.h * 0.2);
    var rh = (P.h - headH) / spec.length;
    // Bei sehr flachen Kacheln lieber weniger Zeilen als unlesbare Streifen.
    if (rh < 6 && spec !== PNL_MINI) {
      spec = PNL_MINI;
      rh = (P.h - headH) / spec.length;
    }
    var v = pnlVals(c, spec, 1000);
    var ac = v.ac, rf = v.rf, d = [], rel = [], i;
    for (i = 0; i < spec.length; i++) {
      d.push(n(ac[i] - rf[i]));
      rel.push(n(rf[i] ? (ac[i] - rf[i]) / Math.abs(rf[i]) * 100 : 0));
    }

    /* Spalten: Bezeichnung · AC · Referenz (nur breit) · Δ-Balken · Δ%-Pins.
       Was fehlt, verteilt seine Breite auf die übrigen Spalten.             */
    var wide = c.lab && c.w >= 320;
    var dOn = c.vAbs, rOn = c.vRel, anyD = dOn || rOn;
    var fLab = anyD ? (wide ? 0.30 : 0.36) : (wide ? 0.46 : 0.60);
    var fAC  = anyD ? (wide ? 0.44 : 0.54) : (wide ? 0.70 : 1.00);
    var fRF  = wide ? (anyD ? 0.56 : 0.98) : 0;
    var fBlk = anyD ? (wide ? 0.585 : 0.57) : 1;
    var labX = P.x, acR = P.x + P.w * fAC, rfR = P.x + P.w * fRF;
    var blkX = P.x + P.w * fBlk, blkW = Math.max(0, P.x + P.w - blkX);
    var dX = blkX, dW = 0, rX = blkX, rW = 0;
    if (dOn && rOn) { dW = blkW * 0.56; rX = blkX + dW; rW = blkW * 0.44; }
    else if (dOn)   { dW = blkW; rX = blkX + blkW; }
    else if (rOn)   { rW = blkW; }
    var dA = dX + dW / 2, rA = rX + rW / 2;
    var indent = Math.min(c.fs * 0.9, P.w * 0.03);

    // Labelrand der Δ-Spalten aus der echten Textbreite (nichts läuft heraus)
    var wD = 1, wR = 1;
    for (i = 0; i < spec.length; i++) {
      wD = Math.max(wD, dlbl(c, d[i]).length);
      wR = Math.max(wR, plbl(c, rel[i]).length);
    }
    var lwD = c.lab ? Math.min(dW * 0.42, wD * c.fs * 0.62 + 3) : 0;
    var lwR = c.lab ? Math.min(rW * 0.42, wR * c.fs * 0.62 + 4) : 0;
    var mD = maxOf(d) * 1.06, mR = maxOf(rel) * 1.06;
    var sD = sc(-mD, mD, dX + lwD, dX + dW - lwD);
    var sR = sc(-mR, mR, rX + lwR, rX + rW - lwR);

    // Kopfzeile
    if (c.lab) {
      b += txt(labX, P.y + headH - 4, 'P&L', c.fs, c.C.sub, 'start', '600');
      b += txt(acR, P.y + headH - 4, c.main, c.fs, c.C.ac, 'end', '600');
      if (wide) b += txt(rfR, P.y + headH - 4, kind, c.fs, c.C.sub, 'end', '600');
      if (dOn) b += txt(dA, P.y + headH - 4, 'Δ' + kind, c.fs, c.C.sub, 'middle', '600');
      if (rOn) b += txt(rA, P.y + headH - 4, 'Δ' + kind + ' %', c.fs, c.C.sub, 'middle', '600');
    }
    b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, c.C.axis, 1.2);
    if (dOn) b += ln(dA, P.y + headH, dA, P.y + P.h, c.C.axis, 0.8);
    if (rOn) b += ln(rA, P.y + headH, rA, P.y + P.h, c.C.grid, 0.9);

    for (i = 0; i < spec.length; i++) {
      var sp = spec[i], y = P.y + headH + rh * i, cy = y + rh * 0.68;
      var isSum = (sp.t === 'sum' || sp.t === 'total');
      var bh = Math.max(1.4, rh * 0.38);
      var col = dcol(c, d[i]);
      // Formelzeilen bekommen eine Oberkante, die Σ-Zeile eine kräftigere
      if (isSum) b += ln(P.x, y, P.x + P.w, y, c.C.axis, sp.t === 'total' ? 1.2 : 0.9);
      else if (i) b += ln(labX, y, acR, y, c.C.grid, 0.7);
      if (c.lab) {
        var lx = labX + sp.lvl * indent;
        b += txt(lx, cy, fit(c, c.t.pnl[sp.i], acR - lx - c.fs * 2.6),
                 c.fs, isSum ? c.C.ac : c.C.txt, 'start', isSum ? '600' : null);
        b += txt(acR, cy, lbl(c, ac[i], 0), c.fs, isSum ? c.C.ac : c.C.txt, 'end',
                 isSum ? '600' : null);
        if (wide) b += txt(rfR, cy, lbl(c, rf[i], 0), c.fs, c.C.sub, 'end', isSum ? '600' : null);
      } else {
        b += ghost(c, labX + sp.lvl * indent, y + rh * 0.34,
                   Math.max(2, (acR - labX) * (isSum ? 0.5 : 0.66)), Math.max(1.2, rh * 0.22),
                   isSum ? c.C.ghost2 : c.C.ghost);
      }
      // Δ absolut als Balken an der eigenen Nulllinie
      if (dOn) {
        var xx = sD(d[i]);
        b += rect(Math.min(dA, xx), y + rh * 0.5 - bh * 0.42,
                  Math.max(0.8, Math.abs(xx - dA)), bh * 0.84, col);
        if (c.lab) {
          b += txt(edge(c, d[i], xx, 2, dlbl(c, d[i]), P), cy, dlbl(c, d[i]), c.fs, col,
                   d[i] >= 0 ? 'start' : 'end', isSum ? '600' : null);
        }
      }
      // Δ relativ als Pin mit Kopf
      if (rOn) {
        var xr = sR(rel[i]), cy2 = y + rh * 0.5;
        b += ln(rA, cy2, xr, cy2, col, 1.3);
        b += circ(xr, cy2, clamp(rh * 0.16, 1.1, 2.4), col);
        if (c.lab) {
          b += txt(edge(c, rel[i], xr, 3, plbl(c, rel[i]), P), cy, plbl(c, rel[i]), c.fs, col,
                   rel[i] >= 0 ? 'start' : 'end', isSum ? '600' : null);
        }
      }
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ---- 21 · Wasserfall-Kombi: Wasserfall + Δ-Ebene --------------------- */
  S.wfkombi = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var mids = c.small ? 2 : 4, cnt = mids + 2;
    var kind = refKind(c) || 'PL';
    var start = 70, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 32));
    var labH = c.lab ? c.fs + 4 : 0, capH = c.lab ? c.fs + 1 : 0;
    // Δ-Ebene nur, wenn o.variance sie verlangt — sonst atmet der Wasserfall.
    var dOn = c.vAbs || c.vRel;
    var bd = bands(c.y0, c.ih - labH, dOn ? [64, 36] : [100], c.fs * 0.8);
    var P = { x: c.x0, y: bd[0].y, w: c.iw, h: bd[0].h };
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var sl = slots(P.x, P.w, cnt, 0.3);
    var showLbl = c.lab && sl[0].w >= c.fs * 1.9 && P.h >= c.fs * 4.2;
    var lh = showLbl ? c.fs * 1.4 : c.fs * 0.2;
    var s = sc(low, Math.max(peak, start, end) * 1.04, P.y + P.h, P.y + lh);
    var zero = s(0), cur = start;
    b += rect(sl[0].x, s(start), sl[0].w, Math.max(0.9, zero - s(start)), c.C.ac);
    if (showLbl) b += txt(sl[0].cx, s(start) - c.fs * 0.42, lbl(c, start, 0), c.fs, c.C.ac, 'middle', '600');
    for (i = 0; i < mids; i++) {
      var to = n(cur + steps[i]);
      var yT = s(Math.max(cur, to)), yB = s(Math.min(cur, to));
      b += ln(sl[i].x + sl[i].w, s(cur), sl[i + 1].x, s(cur), c.C.hair, 0.9);
      b += rect(sl[i + 1].x, yT, sl[i + 1].w, Math.max(0.9, yB - yT), dcol(c, steps[i]));
      if (showLbl) b += txt(sl[i + 1].cx, yT - c.fs * 0.42, dlbl(c, steps[i]), c.fs, dcol(c, steps[i]), 'middle');
      cur = to;
    }
    b += ln(sl[mids].x + sl[mids].w, s(cur), sl[cnt - 1].x, s(cur), c.C.hair, 0.9);
    b += rect(sl[cnt - 1].x, s(end), sl[cnt - 1].w, Math.max(0.9, zero - s(end)), c.C.ac);
    if (showLbl) b += txt(sl[cnt - 1].cx, s(end) - c.fs * 0.42, lbl(c, end, 0), c.fs, c.C.ac, 'middle', '600');
    b += ln(P.x, zero, P.x + P.w, zero, c.C.axis, 1.2);
    if (dOn) {
      var d = [], k;
      for (k = 0; k < cnt; k++) d.push(n((c.rnd() - 0.45) * 26));
      b += layerCap(c, c.x0, bd[1].y + c.fs - 1, 'Δ' + kind + (c.vAbs ? '' : ' %'));
      // Der Wasserfall nutzt den vollen Slot — die Δ-Ebene damit auch.
      b += c.vAbs
        ? deltaCols(c, d, sl, bd[1].y + capH, Math.max(6, bd[1].h - capH), hh)
        : deltaPins(c, d, sl, bd[1].y + capH, Math.max(6, bd[1].h - capH), hh);
    }
    if (c.lab) {
      var nm = ['Σ'];
      for (i = 0; i < mids; i++) nm.push(c.cat[i % c.cat.length]);
      nm.push('Σ');
      b += monLabels(c, sl, c.y1 - 0.5, nm);
    }
    return wrap(c, b);
  };

  /* ---- 22 · Horizontaler Wasserfall mit integrierter Varianz ----------- */
  S.wfint = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var mids = c.small ? 2 : (c.dense ? 6 : 4), cnt = mids + 2;
    var kind = refKind(c) || 'PY';
    var labW = c.lab ? Math.min(32, c.iw * 0.17) : 0;
    var headH = c.lab ? c.fs + 4 : 0;
    var dOn = c.vAbs || c.vRel;
    var dW = (c.small || !dOn) ? 0 : Math.max(14, c.iw * (c.lab ? 0.24 : 0.18));
    var P = area(c, { left: labW, right: dW ? dW + c.fs : 0, top: headH });
    var start = 66, steps = [], i;
    for (i = 0; i < mids; i++) steps.push(n((c.rnd() - 0.38) * 28));
    var acc = start, peak = start, low = Math.min(0, start);
    for (i = 0; i < mids; i++) { acc += steps[i]; if (acc > peak) peak = acc; if (acc < low) low = acc; }
    var end = n(acc);
    var rw = rowsOf(P.y, P.h, cnt, 0.26);
    var showLbl = c.lab && rw[0].h >= c.fs * 0.85;
    var lw = showLbl ? c.fs * 2.4 : 0;
    var s = sc(low, Math.max(peak, start, end) * 1.03, P.x, P.x + Math.max(4, P.w - lw));
    var zero = s(0), cur = start;
    // Kopfzeile Σ Referenz
    b += refShape(c, zero, rw[0].y, Math.max(0.9, s(start) - zero), rw[0].h, kind, hh);
    if (showLbl) b += txt(s(start) + 2.2, rw[0].cy + c.fs * 0.34, lbl(c, start, 0), c.fs, c.C.txt, 'start');
    for (i = 0; i < mids; i++) {
      var to = n(cur + steps[i]);
      var xL = s(Math.min(cur, to)), xR = s(Math.max(cur, to));
      b += ln(s(cur), rw[i].y + rw[i].h, s(cur), rw[i + 1].y, c.C.hair, 0.9);
      b += rect(xL, rw[i + 1].y, Math.max(0.9, xR - xL), rw[i + 1].h, dcol(c, steps[i]));
      if (showLbl) {
        b += txt(steps[i] >= 0 ? xR + 2.2 : xL - 2.2, rw[i + 1].cy + c.fs * 0.34, dlbl(c, steps[i]),
                 c.fs, dcol(c, steps[i]), steps[i] >= 0 ? 'start' : 'end');
      }
      cur = to;
    }
    b += ln(s(cur), rw[mids].y + rw[mids].h, s(cur), rw[cnt - 1].y, c.C.hair, 0.9);
    b += rect(zero, rw[cnt - 1].y, Math.max(0.9, s(end) - zero), rw[cnt - 1].h, c.C.ac);
    if (showLbl) b += txt(s(end) + 2.2, rw[cnt - 1].cy + c.fs * 0.34, lbl(c, end, 0), c.fs, c.C.ac, 'start');
    b += ln(zero, P.y, zero, P.y + P.h, c.C.axis, 1.2);
    if (c.lab) {
      b += txt(P.x - 3, rw[0].cy + c.fs * 0.34, kind, c.fs, c.C.txt, 'end');
      b += txt(P.x - 3, rw[cnt - 1].cy + c.fs * 0.34, c.main, c.fs, c.C.ac, 'end', '600');
      for (i = 0; i < mids; i++) b += txt(P.x - 3, rw[i + 1].cy + c.fs * 0.34, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
      b += txt(P.x, c.y0 + c.fs, kind + ' → ' + c.main, c.fs, c.C.sub, 'start');
    }
    if (dW) {
      var d = [], k;
      for (k = 0; k < cnt; k++) d.push(n((c.rnd() - 0.45) * 22));
      if (c.lab) b += txt(c.x1 - dW / 2, c.y0 + c.fs, 'Δ' + kind + (c.vAbs ? '' : ' %'), c.fs, c.C.sub, 'middle');
      b += c.vAbs ? deltaBarsH(c, d, rw, c.x1 - dW, dW, hh)
                  : deltaPinsH(c, d, rw, c.x1 - dW, dW);
    }
    return wrap(c, b);
  };

  /* ---- 23 · Gestapelte Balken ------------------------------------------ */
  S.stackbar = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 7 : 5);
    var segs = c.small ? 2 : 3, cols = [c.C.ac, c.C.g2, c.C.g3];
    var labW = c.lab ? Math.min(32, c.iw * 0.16) : 0;
    var valW = c.lab ? c.fs * 2.4 : 0;
    var P = area(c, { left: labW, right: valW });
    var rw = rowsOf(P.y, P.h, cnt, 0.28), i, j;
    for (i = 0; i < cnt; i++) {
      var tot = 0.55 + c.rnd() * 0.45, x = P.x;
      // Anteile auf 1 normieren, damit der Stapel nie über die Fläche läuft.
      var fr = [], fsum = 0;
      for (j = 0; j < segs; j++) { var f = 0.2 + c.rnd() * 0.3; fr.push(f); fsum += f; }
      for (j = 0; j < segs; j++) {
        var sw2 = P.w * tot * fr[j] / fsum;
        b += rect(x, rw[i].y, Math.max(0.9, sw2), rw[i].h, cols[j % cols.length]);
        if (j) b += ln(x, rw[i].y, x, rw[i].y + rw[i].h, c.C.paper, 0.7);
        x += sw2;
      }
      if (c.lab) {
        b += txt(P.x - 3, rw[i].cy + c.fs * 0.34, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
        b += txt(x + 2.2, rw[i].cy + c.fs * 0.34, lbl(c, tot * 100, 0), c.fs, c.C.ac, 'start');
      }
    }
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1.2);
    return wrap(c, b);
  };

  /* ---- 24 · Small Multiples: je Panel AC gegen Referenz ---------------- */
  S.multiples = function (w, h, o) {
    var c = ctx(w, h, o), hh = hatch(c), b = hh.defs;
    var kind = refKind(c);
    var cols = c.small ? 2 : 3, rws = c.small ? 1 : 2;
    var gx = c.small ? 3 : 6, gy = c.lab ? c.fs + 4 : 4;
    var cw = (c.iw - gx * (cols - 1)) / cols;
    var ch = (c.ih - gy * (rws - 1)) / rws;
    var i, j, k;
    for (i = 0; i < rws; i++) {
      for (j = 0; j < cols; j++) {
        var px = c.x0 + j * (cw + gx), py = c.y0 + i * (ch + gy);
        var hd = c.lab ? c.fs + 2 : 0;
        var P = { x: px, y: py + hd, w: cw, h: Math.max(3, ch - hd) };
        var v = vals(c, 4, 60, 40), rf = kind ? derive(c, v, 0.8, 1.2) : null;
        if (c.lab) {
          // Δ-Badge laut o.variance: Δ% hat Vorrang, sonst Δ absolut.
          var dd = rf ? (c.vRel ? n((v[3] - rf[3]) / (rf[3] || 1) * 100) : n(v[3] - rf[3])) : 0;
          b += txt(px, py + c.fs - 1, fit(c, c.cat[(i * cols + j) % c.cat.length], cw * 0.6), c.fs, c.C.txt, 'start', '600');
          if (rf && (c.vRel || c.vAbs) && cw >= c.fs * 7) {
            b += txt(px + cw, py + c.fs - 1, c.vRel ? plbl(c, dd) : dlbl(c, dd), c.fs, dcol(c, dd), 'end');
          }
        }
        var sl = slots(P.x, P.w, 4, 0.5);
        b += colBlock(c, P, v, rf, kind, hh, sl, { labels: false }).body;
      }
    }
    return wrap(c, b);
  };

  /* ---- 25 · Tabelle mit Sparklines -------------------------------------- */
  S.sparktable = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 2 : (c.dense ? 6 : 4);
    var kind = refKind(c) || 'PL';
    var P = area(c, {});
    var headH = c.lab ? c.fs + 4 : 0;
    var rh = (P.h - headH) / rows;
    var labW = c.lab ? P.w * 0.22 : P.w * 0.2;
    var numW = c.lab ? P.w * 0.14 : 0;
    var valW = c.lab ? P.w * 0.18 : P.w * 0.14;
    var spX = P.x + labW + numW + 3, spW = Math.max(6, P.w - labW - numW - valW - 6);
    var i;
    var dOn = c.vRel || c.vAbs, dRel = c.vRel;
    if (c.lab) {
      b += txt(P.x, P.y + headH - 4, c.main + ' · ' + c.t.trend, c.fs, c.C.sub, 'start', '600');
      if (dOn) b += txt(P.x + P.w, P.y + headH - 4, 'Δ' + kind + (dRel ? ' %' : ''), c.fs, c.C.sub, 'end', '600');
      b += ln(P.x, P.y + headH, P.x + P.w, P.y + headH, c.C.axis, 1.2);
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + headH + rh * i, cy = y + rh * 0.66;
      if (i) b += ln(P.x, y, P.x + P.w, y, c.C.grid, 0.9);
      var pts = sparkPts(c, 8, spX, y + rh * 0.2, spW, rh * 0.6);
      var poly = pts.concat([[spX + spW, y + rh * 0.8], [spX, y + rh * 0.8]]);
      b += polygonEl(poly, c.C.wash);
      b += polyline(pts, c.C.ac, 1.2);
      b += circ(pts[7][0], pts[7][1], 1.5, c.C.ac);
      var d = n((c.rnd() - 0.42) * 20);
      if (c.lab) {
        b += txt(P.x, cy, fit(c, c.cat[i % c.cat.length], labW - 2), c.fs, c.C.txt, 'start');
        b += txt(P.x + labW + numW - 4, cy, lbl(c, 40 + c.rnd() * 60, 0), c.fs, c.C.ac, 'end');
        if (dOn) b += txt(P.x + P.w, cy, dRel ? plbl(c, d) : dlbl(c, d), c.fs, dcol(c, d), 'end');
      } else {
        b += ghost(c, P.x, y + rh * 0.4, labW * 0.8, Math.max(1.4, rh * 0.18));
        if (dOn) b += ghost(c, P.x + P.w - valW * 0.7, y + rh * 0.4, valW * 0.7, Math.max(1.4, rh * 0.18), dcol(c, d));
      }
    }
    return wrap(c, b);
  };

  /* ---- 26 · Heatmap, divergierend --------------------------------------- */
  S.heatmap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 4 : (c.dense ? 12 : 8);
    var rows = c.small ? 3 : (c.dense ? 6 : 4);
    var labW = c.lab ? Math.min(c.iw * 0.34, c.fs * 5 + 3) : 0, labH = c.lab ? c.fs + 2 : 0;
    var P = area(c, { left: labW, top: labH });
    var cw = P.w / cols, ch = P.h / rows, i, j;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        var v = c.rnd() * 2 - 1;
        var a = Math.min(0.92, Math.abs(v) * 0.95 + 0.06);
        var fill = Math.abs(v) < 0.14 ? c.C.grid : dcol(c, v);
        var x = P.x + cw * j, y = P.y + ch * i;
        b += '<rect x="' + n(x + 0.4) + '" y="' + n(y + 0.4) + '" width="' + n(Math.max(0.8, cw - 0.8)) +
             '" height="' + n(Math.max(0.8, ch - 0.8)) + '" fill="' + fill +
             '" fill-opacity="' + n(Math.abs(v) < 0.14 ? 1 : a) + '"/>';
      }
      if (c.lab) b += txt(P.x - 3, P.y + ch * i + ch * 0.66, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
    }
    if (c.lab) for (j = 0; j < cols && j < 12; j++) {
      if (cw < 12) break;
      b += txt(P.x + cw * j + cw / 2, P.y - 2, c.mon[j % 12], c.fs, c.C.txt, 'middle');
    }
    return wrap(c, b);
  };

  /* ---- 27 · Marimekko --------------------------------------------------- */
  S.marimekko = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : 5, segs = c.small ? 2 : 3, cols = [c.C.ac, c.C.g2, c.C.g3];
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var wts = [], tot = 0, i, j;
    for (i = 0; i < cnt; i++) { var wv = 0.4 + c.rnd(); wts.push(wv); tot += wv; }
    var x = P.x, gap = c.small ? 1.5 : 2.5;
    var avail = P.w - gap * (cnt - 1);
    for (i = 0; i < cnt; i++) {
      var cw = avail * wts[i] / (tot || 1), y = P.y + P.h;
      var rest = 1;
      for (j = 0; j < segs; j++) {
        var frac = j === segs - 1 ? rest : rest * (0.28 + c.rnd() * 0.36);
        var sh = P.h * frac;
        b += rect(x, y - sh, Math.max(0.9, cw), Math.max(0.9, sh), cols[j % cols.length]);
        y -= sh; rest -= frac;
        if (rest < 0.05) rest = 0.05;
      }
      if (c.lab && cw >= 14) b += txt(x + cw / 2, c.y1 - 0.5, fit(c, c.cat[i % c.cat.length], cw), c.fs, c.C.txt, 'middle');
      x += cw + gap;
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ---- 28 · Treiberbaum / Zerlegung ------------------------------------ */
  S.tree = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var kids = c.small ? 2 : 3;
    var P = area(c, {});
    var bw = Math.min(P.w * 0.3, 54), bh = Math.min(P.h * 0.26, 22);
    var rx = P.x, ry = P.y + P.h / 2 - bh / 2;
    var cx = P.x + P.w - bw, i;
    var step = P.h / kids;
    b += rrect(rx, ry, bw, bh, 2, c.C.plf, c.C.ac, 1);
    b += ghost(c, rx + 3, ry + bh * 0.3, bw * 0.55, Math.max(1.4, bh * 0.16), c.C.ghost2);
    b += rect(rx + 3, ry + bh * 0.62, Math.max(1, bw * 0.7), Math.max(1.2, bh * 0.16), c.C.ac);
    for (i = 0; i < kids; i++) {
      var ky = P.y + step * i + step / 2 - bh / 2;
      var mid = rx + bw + (cx - rx - bw) / 2;
      b += ln(rx + bw, ry + bh / 2, mid, ry + bh / 2, c.C.grid, 1);
      b += ln(mid, ry + bh / 2, mid, ky + bh / 2, c.C.grid, 1);
      b += ln(mid, ky + bh / 2, cx, ky + bh / 2, c.C.grid, 1);
      b += rrect(cx, ky, bw, bh, 2, c.C.plf, c.C.py, 1);
      b += rect(cx + 3, ky + bh * 0.58, Math.max(1, bw * (0.3 + c.rnd() * 0.5)), Math.max(1.2, bh * 0.16), i === 0 ? c.C.ac : c.C.py);
      if (c.lab) b += txt(cx + 3, ky + bh * 0.42, fit(c, c.cat[i % c.cat.length], bw - 6), c.fs, c.C.txt, 'start');
    }
    return wrap(c, b);
  };

  /* ---- 29 · Boxplot ----------------------------------------------------- */
  S.boxplot = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 7 : 5);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var s = sc(0, 100, P.y + P.h, P.y);
    var sl = slots(P.x, P.w, cnt, 0.45), i;
    for (i = 0; i < cnt; i++) {
      var med = 35 + c.rnd() * 30;
      var q1 = med - (8 + c.rnd() * 10), q3 = med + (8 + c.rnd() * 10);
      var lo = q1 - (8 + c.rnd() * 12), hi = q3 + (8 + c.rnd() * 12);
      var cxp = sl[i].cx, bwid = sl[i].w;
      b += ln(cxp, s(hi), cxp, s(lo), c.C.axis, 1);
      b += ln(cxp - bwid * 0.28, s(hi), cxp + bwid * 0.28, s(hi), c.C.axis, 1);
      b += ln(cxp - bwid * 0.28, s(lo), cxp + bwid * 0.28, s(lo), c.C.axis, 1);
      b += rect(sl[i].x, s(q3), bwid, Math.max(0.9, s(q1) - s(q3)), c.C.plf, c.C.ac, 1);
      b += ln(sl[i].x, s(med), sl[i].x + bwid, s(med), c.C.ac, 1.6);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    b += monLabels(c, sl, c.y1 - 0.5);
    return wrap(c, b);
  };

  /* ---- 30 · KPI-Kachel im Zuschnitt der ChartKitchen-Monitoring-Karte --- */
  S.kpi = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var kind = refKind(c) || 'PL';
    var d = n((c.rnd() - 0.35) * 18);
    var col = dcol(c, d);
    // Status-Akzent am linken Rand
    var accOK = P.w >= 46 && P.h >= 24;
    var accW = clamp(P.w * 0.022, 1.6, 4);
    if (accOK) b += rrect(P.x, P.y, accW, P.h, accW / 2, col);
    var L = P.x + (accOK ? accW + Math.min(7, P.w * 0.05) : 0);
    var R = P.x + P.w, iw = Math.max(6, R - L);
    // Beschriftung: o.label (leer = keine, weil die Kachel den Titel schon trägt)
    var kpiLabel = (o && o.label !== undefined) ? String(o.label) : c.t.revenue;
    var titleH = (!c.small && kpiLabel) ? c.fs + 3 : 0;
    // Einheit (o.unit) steht hinter der Zahl; ohne Angabe bleibt es bei 'M'.
    var uStr = c.unit || 'M';
    var uFs = Math.min(10, c.fs + 1);
    var uW = uStr.length * uFs * 0.62 + 3;
    // Ausnahme zur 8–10-px-Regel: die Kennzahl selbst ist das Erkennungsmerkmal.
    // Der Grad richtet sich auch nach der Textbreite, sonst läuft sie heraus.
    var num = lbl(c, Math.round((40 + c.rnd() * 900) * 10) / 10);   // je Kachel andere Demo-Zahl (deterministisch über seed)
    var showU = (!c.small && iw >= 78);
    var big = clamp(Math.min((P.h - titleH) * 0.5,
                             (iw - (showU ? uW : 0)) / (num.length * 0.62)), 4, 40);
    if (num.length * big * 0.62 > iw) big = iw / (num.length * 0.62);   // harte Breitengrenze
    var dH = Math.min(c.fs + 6, big * 0.62) + c.fs * 0.3;
    // Block aus Titel, Zahl und Δ-Zeile vertikal zentrieren.
    var T = P.y + Math.max(0, (P.h - (titleH + big * 0.82 + dH)) / 2);
    if (titleH) b += txt(L, T + c.fs - 1, kpiLabel, Math.min(9, c.fs), c.C.sub, 'start', '600');
    var yBig = T + titleH + big * 0.82;
    b += txt(L, yBig, num, big, c.C.ac, 'start', '700');
    if (showU && L + num.length * big * 0.56 + uW <= R) {
      b += txt(L + num.length * big * 0.56 + 3, yBig, uStr, uFs, c.C.sub, 'start');
    }
    // Δ-Zeile: Pfeil, Wert, Referenz — Art laut o.variance (Δ% vor Δ absolut)
    var dRelOn = c.vRel, dOn = c.vRel || c.vAbs;
    var yD = yBig + Math.min(c.fs + 6, big * 0.62);
    var ah = Math.min(5, c.fs * 0.66), dFs = Math.min(9, c.fs);
    var dTxt = (dRelOn ? plbl(c, d) : dlbl(c, d)) + (c.small ? '' : ' Δ' + kind);
    // Pfeil nur, wenn Pfeil und Wert nebeneinander passen — sonst bleibt der Wert.
    var withArrow = (L + ah * 2 + 3 + dTxt.length * dFs * 0.62) <= R;
    var tx0 = withArrow ? L + ah * 2 + 3 : L;
    if (dOn && yD <= P.y + P.h - 1 && tx0 + dFs * 1.3 <= R) {
      if (withArrow) {
        b += pathEl(d >= 0
          ? 'M' + n(L) + ' ' + n(yD - 1) + ' l' + n(ah) + ' ' + n(-ah) + ' l' + n(ah) + ' ' + n(ah) + ' z'
          : 'M' + n(L) + ' ' + n(yD - ah - 1) + ' l' + n(ah) + ' ' + n(ah) + ' l' + n(ah) + ' ' + n(-ah) + ' z', col);
      }
      b += txt(tx0, yD, fit(c, dTxt, R - tx0, dFs), dFs, col, 'start', '600');
    }
    // Mini-Sparkline rechts oben, mit heller Fläche wie im Visual
    if (iw >= 66 && P.h >= 38) {
      var sw2 = Math.min(iw * 0.36, 52), sh = Math.min(16, P.h * 0.26);
      var sx = R - sw2, sy = P.y + titleH;
      var pts = sparkPts(c, 8, sx, sy, sw2, sh);
      b += polygonEl(pts.concat([[sx + sw2, sy + sh], [sx, sy + sh]]), c.C.wash);
      b += polyline(pts, c.C.py, 1.3);
      b += circ(pts[7][0], pts[7][1], 1.8, c.C.ac);
    }
    return wrap(c, b);
  };

  /* ---- 31 · Streudiagramm mit Quadranten -------------------------------- */
  S.scatter = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 7 : (c.dense ? 24 : 14);
    var P = area(c, {});
    b += ln(P.x + P.w / 2, P.y, P.x + P.w / 2, P.y + P.h, c.C.grid, 1);
    b += ln(P.x, P.y + P.h / 2, P.x + P.w, P.y + P.h / 2, c.C.grid, 1);
    var i, r = c.small ? 1.4 : 2.1;
    for (i = 0; i < cnt; i++) {
      var x = P.x + 3 + c.rnd() * (P.w - 6);
      var y = P.y + 3 + c.rnd() * (P.h - 6);
      b += circ(x, y, r, i % 5 === 0 ? c.C.ac : c.C.py);
    }
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ---- 32 · Gantt ------------------------------------------------------- */
  S.gantt = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 3 : (c.dense ? 8 : 5);
    var labW = c.lab ? 34 : 0;
    var headH = c.lab ? c.fs + 3 : 0;
    var P = area(c, { left: labW, top: headH });
    var rw = rowsOf(P.y, P.h, cnt, 0.38), i;
    if (c.lab) {
      for (i = 0; i < 4; i++) {
        b += ln(P.x + P.w * (i / 4), P.y, P.x + P.w * (i / 4), P.y + P.h, c.C.grid, 1);
        b += txt(P.x + P.w * (i / 4) + 2, P.y - 2, 'Q' + (i + 1), c.fs, c.C.txt, 'start');
      }
    }
    for (i = 0; i < cnt; i++) {
      var st = c.rnd() * 0.5, len = 0.18 + c.rnd() * 0.42;
      if (st + len > 0.98) len = 0.98 - st;
      b += rect(P.x + P.w * st, rw[i].y, Math.max(1.2, P.w * len), rw[i].h, i % 3 === 0 ? c.C.ac : c.C.py);
      if (c.lab) b += txt(P.x - 3, rw[i].cy + c.fs * 0.35, fit(c, c.cat[i % c.cat.length], labW - 3), c.fs, c.C.txt, 'end');
    }
    b += ln(P.x + P.w * 0.62, P.y - 1, P.x + P.w * 0.62, P.y + P.h + 1, c.C.bad, 1, '3 2');
    b += ln(P.x, P.y, P.x, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ====================================================================== */
  /*  Native Power-BI-Visuals                                               */
  /* ====================================================================== */

  /* ---- Karte ------------------------------------------------------------ */
  S.card = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    // Ausnahme zur 8–10-px-Regel: die Zahl ist der Inhalt der Karte.
    // Der Grad richtet sich auch nach der Textbreite, sonst läuft sie heraus.
    var cnum = lbl(c, Math.round((20 + c.rnd() * 300) * 10) / 10);
    // Einheit (o.unit) hinter der Zahl; die Gruppe bleibt zusammen zentriert.
    var uFs0 = Math.min(10, c.fs + 1);
    var uW = c.unit ? c.unit.length * uFs0 * 0.62 + 3 : 0;
    var big = clamp(Math.min(P.h * 0.46, (P.w - uW) / (cnum.length * 0.62)), 4, 30);
    var cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    var numW = cnum.length * big * 0.56;
    var cxn = cx - uW / 2;
    b += txt(cxn, cy + big * 0.28, cnum, big, c.C.ac, 'middle', '600');
    if (uW && cxn + numW / 2 + uW <= P.x + P.w) {
      b += txt(cxn + numW / 2 + 3, cy + big * 0.28, c.unit, uFs0, c.C.sub, 'start');
    }
    var cardLabel = (o && o.label !== undefined) ? String(o.label) : (c.t.revenue + ' ' + c.t.total);
    if (!c.small && P.h >= 30 && cardLabel) b += txt(cx, cy + big * 0.28 + Math.min(11, c.fs + 3), cardLabel, Math.min(9, c.fs), c.C.txt, 'middle');
    return wrap(c, b);
  };

  /* ---- Mehrzeilige Karte ------------------------------------------------ */
  S.multirow = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var rows = c.small ? 2 : (c.dense ? 5 : 3);
    var P = area(c, {});
    var rh = P.h / rows, i;
    var names = c.t.rows;
    var nums = [84.2, 31.7, 12.4, 268, 41];
    for (i = 0; i < rows; i++) {
      var y = P.y + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, c.C.grid, 1);
      var vs = clamp(rh * 0.42, 9, 14);
      if (!c.small && P.w >= 90 && rh >= 16) {
        b += txt(P.x, y + rh * 0.42, fit(c, names[i % names.length], P.w, Math.min(9, c.fs)), Math.min(9, c.fs), c.C.txt, 'start');
        b += txt(P.x, y + rh * 0.88, lbl(c, nums[i % nums.length]), vs, c.C.ac, 'start', '600');
      } else {
        b += ghost(c, P.x, y + rh * 0.28, P.w * 0.44, Math.max(1.3, rh * 0.14));
        b += rect(P.x, y + rh * 0.55, Math.max(1.2, P.w * 0.3), Math.max(1.6, rh * 0.22), c.C.ac);
      }
    }
    return wrap(c, b);
  };

  /* ---- Matrix ----------------------------------------------------------- */
  S.matrix = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cols = c.small ? 3 : (c.dense ? 6 : 4);
    var rows = c.small ? 3 : (c.dense ? 7 : 5);
    var P = area(c, {});
    var hw = P.w * (c.lab ? 0.24 : 0.28);
    var hh2 = Math.min(c.fs + 3, P.h * 0.22);
    var cw = (P.w - hw) / cols, rh = (P.h - hh2) / rows, i, j;
    b += rect(P.x, P.y, P.w, hh2, c.C.pane);
    b += ln(P.x, P.y + hh2, P.x + P.w, P.y + hh2, c.C.axis, 1);
    b += ln(P.x + hw, P.y, P.x + hw, P.y + P.h, c.C.grid, 1);
    for (j = 0; j < cols; j++) {
      if (j) b += ln(P.x + hw + cw * j, P.y, P.x + hw + cw * j, P.y + P.h, c.C.grid, 1);
      if (c.lab && cw >= 20) b += txt(P.x + hw + cw * (j + 1) - 2, P.y + hh2 - 3, c.mon[j % 12], c.fs, c.C.txt, 'end');
      else b += ghost(c, P.x + hw + cw * j + cw * 0.2, P.y + hh2 * 0.42, cw * 0.6, Math.max(1.2, hh2 * 0.2), c.C.py);
    }
    for (i = 0; i < rows; i++) {
      var y = P.y + hh2 + rh * i;
      if (i) b += ln(P.x, y, P.x + P.w, y, c.C.grid, 1);
      if (c.lab) b += txt(P.x + 1, y + rh * 0.68, fit(c, c.cat[i % c.cat.length], hw - 2), c.fs, c.C.txt, 'start');
      else b += ghost(c, P.x + 1, y + rh * 0.38, hw * 0.7, Math.max(1.2, rh * 0.2));
      for (j = 0; j < cols; j++) {
        var vx = P.x + hw + cw * (j + 1) - 2;
        if (c.lab && cw >= 20) b += txt(vx, y + rh * 0.68, lbl(c, 20 + c.rnd() * 70, 0), c.fs, c.C.ac, 'end');
        else b += ghost(c, vx - cw * 0.5, y + rh * 0.38, cw * 0.44, Math.max(1.2, rh * 0.2), c.C.ghost2);
      }
    }
    return wrap(c, b);
  };

  /* ---- Datenschnitt ----------------------------------------------------- */
  S.slicer = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    if (c.small || P.h < 46) {
      // Dropdown-Variante
      var dh = Math.min(P.h, 16);
      b += rrect(P.x, P.y + (P.h - dh) / 2, P.w, dh, 2, c.C.plf, c.C.py, 1);
      b += ghost(c, P.x + 4, P.y + (P.h - dh) / 2 + dh * 0.42, P.w * 0.45, Math.max(1.2, dh * 0.16));
      var ax = P.x + P.w - 7, ay = P.y + (P.h - dh) / 2 + dh * 0.44;
      b += pathEl('M' + n(ax - 3) + ' ' + n(ay) + ' l3 3 l3 -3', 'none', c.C.ac, 1.2);
      return wrap(c, b);
    }
    var rows = c.dense ? 5 : 4, rh = P.h / rows, i;
    for (i = 0; i < rows; i++) {
      var y = P.y + rh * i, bs = Math.min(8, rh * 0.5);
      var by = y + (rh - bs) / 2;
      b += rect(P.x, by, bs, bs, i === 0 ? c.C.ac : c.C.plf, c.C.ac, 1);
      if (i === 0) b += pathEl('M' + n(P.x + bs * 0.22) + ' ' + n(by + bs * 0.52) + ' l' + n(bs * 0.24) + ' ' + n(bs * 0.26) + ' l' + n(bs * 0.5) + ' -' + n(bs * 0.52), 'none', c.C.plf, 1.2);
      if (c.lab) b += txt(P.x + bs + 4, y + rh * 0.62, fit(c, c.cat[i % c.cat.length], P.w - bs - 4), c.fs, c.C.txt, 'start');
      else b += ghost(c, P.x + bs + 4, by + bs * 0.32, P.w * 0.5, Math.max(1.2, bs * 0.24));
    }
    return wrap(c, b);
  };

  /* ---- Textfeld ---------------------------------------------------------- */
  S.text = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var rows = Math.max(2, Math.min(6, Math.floor(P.h / 7)));
    var lh = P.h / rows, i;
    var wfrac = [1, 0.92, 0.97, 0.86, 0.94, 0.55];
    for (i = 0; i < rows; i++) {
      var f = i === rows - 1 ? 0.55 : wfrac[i % wfrac.length];
      var th = Math.max(1.6, Math.min(3, lh * 0.34));
      b += rect(P.x, P.y + lh * i + (lh - th) / 2, Math.max(1, P.w * f), th, i === 0 ? c.C.py : c.C.ghost);
    }
    return wrap(c, b);
  };

  /* ---- Bildplatzhalter --------------------------------------------------- */
  S.image = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rect(P.x, P.y, P.w, P.h, mix(c.C.paper, c.C.grid, 0.55), c.C.py, 1);
    b += ln(P.x, P.y, P.x + P.w, P.y + P.h, c.C.py, 1);
    b += ln(P.x + P.w, P.y, P.x, P.y + P.h, c.C.py, 1);
    return wrap(c, b);
  };

  /* ---- Schaltfläche ------------------------------------------------------ */
  S.button = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var bh = Math.min(P.h, Math.max(12, P.h * 0.5));
    var bw = Math.min(P.w, Math.max(30, P.w * 0.7));
    var bx = P.x + (P.w - bw) / 2, by = P.y + (P.h - bh) / 2;
    b += rrect(bx, by, bw, bh, Math.min(4, bh / 2), c.C.pane, c.C.ac, 1);
    if (!c.small && bh >= 14 && bw >= 44) b += txt(bx + bw / 2, by + bh / 2 + c.fs * 0.35, c.t.apply, Math.min(9, c.fs), c.C.ac, 'middle');
    else b += ghost(c, bx + bw * 0.28, by + bh / 2 - 1, bw * 0.44, 2, c.C.ghost2);
    return wrap(c, b);
  };

  /* ---- Karte (Landkarte) ------------------------------------------------- */
  S.map = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var norm = [[0.08, 0.46], [0.17, 0.22], [0.33, 0.13], [0.49, 0.22], [0.62, 0.10],
                [0.81, 0.19], [0.93, 0.41], [0.86, 0.67], [0.69, 0.87], [0.49, 0.92],
                [0.29, 0.83], [0.13, 0.67]];
    var pts = [], i;
    for (i = 0; i < norm.length; i++) pts.push([P.x + P.w * norm[i][0], P.y + P.h * norm[i][1]]);
    b += polygonEl(pts, mix(c.C.paper, c.C.grid, 0.75), c.C.py, 1);
    var dots = c.small ? 3 : 6;
    for (i = 0; i < dots; i++) {
      var dx = P.x + P.w * (0.24 + c.rnd() * 0.52);
      var dy = P.y + P.h * (0.26 + c.rnd() * 0.48);
      b += circ(dx, dy, c.small ? 1.6 : 2.4 + c.rnd() * 1.6, c.C.ac);
    }
    return wrap(c, b);
  };

  /* ---- Kreisdiagramm ------------------------------------------------------ */
  S.pie = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var r = Math.max(4, Math.min(P.w, P.h) / 2 - 1);
    var cx = P.x + P.w / 2, cy = P.y + P.h / 2;
    var fr = c.small ? [0.45, 0.3, 0.25] : [0.38, 0.27, 0.2, 0.15];
    var cols = [c.C.ac, c.C.g2, c.C.py, c.C.g3];
    var a0 = -Math.PI / 2, i;
    for (i = 0; i < fr.length; i++) {
      var a1 = a0 + fr[i] * Math.PI * 2;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var lrg = (a1 - a0) > Math.PI ? 1 : 0;
      b += pathEl('M' + n(cx) + ' ' + n(cy) + ' L' + n(x0) + ' ' + n(y0) +
                  ' A' + n(r) + ' ' + n(r) + ' 0 ' + lrg + ' 1 ' + n(x1) + ' ' + n(y1) + ' Z',
                  cols[i % cols.length], c.C.paper, 1);
      a0 = a1;
    }
    return wrap(c, b);
  };

  /* ---- Treemap ------------------------------------------------------------ */
  S.treemap = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var g = 1.2;
    var lw = P.w * 0.52;
    b += rect(P.x, P.y, lw - g, P.h, c.C.ac);
    var rx = P.x + lw, rw2 = P.w - lw;
    if (c.small) {
      b += rect(rx, P.y, rw2, P.h * 0.55 - g, c.C.g2);
      b += rect(rx, P.y + P.h * 0.55, rw2, P.h * 0.45, c.C.g3);
    } else {
      b += rect(rx, P.y, rw2, P.h * 0.48 - g, c.C.g2);
      b += rect(rx, P.y + P.h * 0.48, rw2 * 0.55 - g, P.h * 0.52, c.C.py);
      b += rect(rx + rw2 * 0.55, P.y + P.h * 0.48, rw2 * 0.45, P.h * 0.3 - g, c.C.g3);
      b += rect(rx + rw2 * 0.55, P.y + P.h * 0.78, rw2 * 0.45, P.h * 0.22, mix(c.C.g3, c.C.paper, 0.4));
    }
    if (c.lab) b += txt(P.x + 4, P.y + c.fs + 2, fit(c, c.cat[0], lw - 8), c.fs, c.C.plf, 'start');
    return wrap(c, b);
  };

  /* ---- Zerlegungsbaum ------------------------------------------------------ */
  S.decomp = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var lvls = c.small ? 2 : 3;
    var cw = P.w / lvls, i, j;
    var counts = c.small ? [1, 2] : [1, 3, 3];
    for (i = 0; i < lvls; i++) {
      var cnt = counts[i], step = P.h / cnt;
      var bw = cw * 0.76, bh = Math.min(step * 0.62, 20);
      for (j = 0; j < cnt; j++) {
        var x = P.x + cw * i, y = P.y + step * j + (step - bh) / 2;
        b += rrect(x, y, bw, bh, 2, c.C.plf, i === 0 ? c.C.ac : c.C.py, 1);
        b += rect(x + 3, y + bh * 0.6, Math.max(1, bw * (0.25 + c.rnd() * 0.5)), Math.max(1.2, bh * 0.18), i === 0 ? c.C.ac : c.C.py);
        if (c.lab && bh >= 14) b += txt(x + 3, y + bh * 0.42, fit(c, i === 0 ? c.t.sum : c.cat[(i + j) % c.cat.length], bw - 6), c.fs, c.C.txt, 'start');
        if (i > 0) {
          var pStep = P.h / counts[i - 1], pBh = Math.min(pStep * 0.62, 20);
          var pIdx = Math.min(counts[i - 1] - 1, 0);
          var px = P.x + cw * (i - 1) + bw, py = P.y + pStep * pIdx + pStep / 2;
          b += ln(px, py, x, y + bh / 2, c.C.grid, 1);
        }
      }
    }
    return wrap(c, b);
  };

  /* ---- Tacho --------------------------------------------------------------- */
  S.gauge = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    var showV = (!c.small && P.h >= 44);
    var labH = showV ? c.fs + 8 : 0;
    var H = Math.max(6, P.h - labH);
    // Halbkreis samt Strichstärke in die Fläche einpassen, dann vertikal zentrieren.
    var r = Math.max(4, Math.min(P.w / 2.3, H / 1.2));
    var th = clamp(r * 0.2, 2.2, 22);
    var cx = P.x + P.w / 2;
    var cy = P.y + (H - (r + th)) / 2 + th / 2 + r;
    function arc(frac, col) {
      var a0 = Math.PI, a1 = Math.PI + frac * Math.PI;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      // frac zählt Halbkreise: der Bogen ist nie länger als 180°, also large-arc = 0.
      return '<path d="M' + n(x0) + ' ' + n(y0) + ' A' + n(r) + ' ' + n(r) + ' 0 0 1 ' +
             n(x1) + ' ' + n(y1) +
             '" fill="none" stroke="' + col + '" stroke-width="' + n(th) + '" stroke-linecap="butt"/>';
    }
    var v = 0.68;
    b += arc(1, c.C.grid);
    b += arc(v, c.C.ac);
    var na = Math.PI + v * Math.PI;
    b += ln(cx, cy, cx + r * 0.86 * Math.cos(na), cy + r * 0.86 * Math.sin(na), c.C.axis, 1.4);
    var pr = Math.max(1.2, r * 0.07);
    b += circ(cx, cy, pr, c.C.axis);
    // Wert unter den Drehpunkt, mit Abstand zum Punkt.
    if (showV) b += txt(cx, Math.min(P.y + P.h, cy + pr + c.fs * 0.95), '68 %', Math.min(10, c.fs + 1), c.C.ac, 'middle', '600');
    return wrap(c, b);
  };

  /* ---- Flächendiagramm ------------------------------------------------------ */
  S.area = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var cnt = c.small ? 6 : (c.dense ? 16 : 11);
    var v = vals(c, cnt, 64, 36);
    var P = area(c, { bottom: c.lab ? c.fs + 3 : 0 });
    var mx = maxOf(v) * 1.2, s = sc(0, mx, P.y + P.h, P.y);
    var step = P.w / Math.max(1, cnt - 1), pts = [], i;
    for (i = 0; i < cnt; i++) pts.push([P.x + step * i, s(v[i])]);
    var poly = pts.concat([[P.x + P.w, P.y + P.h], [P.x, P.y + P.h]]);
    b += polygonEl(poly, mix(c.C.g3, c.C.paper, 0.25));
    b += polyline(pts, c.C.ac, c.small ? 1.2 : 1.6);
    b += ln(P.x, P.y + P.h, P.x + P.w, P.y + P.h, c.C.axis, 1);
    return wrap(c, b);
  };

  /* ---- Deneb / Vega-Platzhalter --------------------------------------------- */
  S.deneb = function (w, h, o) {
    var c = ctx(w, h, o), b = '';
    var P = area(c, {});
    b += rrect(P.x, P.y, P.w, P.h, 3, c.C.paper, c.C.py, 1);
    var fs = clamp(Math.min(P.h * 0.4, P.w * 0.3), 10, 24);
    b += txt(P.x + P.w / 2, P.y + P.h / 2 + fs * 0.34, '{ }', fs, c.C.ac, 'middle', '600');
    if (!c.small && P.h >= 52) b += txt(P.x + P.w / 2, P.y + P.h - 3, c.t.spec, Math.min(9, c.fs), c.C.txt, 'middle');
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
      out = fn(w, h, o);
    } catch (e) {
      out = null;
    }
    if (typeof out !== 'string' || out.indexOf('<svg') !== 0) {
      try { out = S.generic(w, h, o); } catch (e2) { out = ''; }
    }
    return out;
  };

  // Liste aller Schlüssel — praktisch für Kataloge und Tests.
  root.MK_SKETCH_KEYS = (function () {
    var k = [], key;
    for (key in S) if (Object.prototype.hasOwnProperty.call(S, key)) k.push(key);
    return k;
  })();

}(typeof window !== 'undefined' ? window : this));
