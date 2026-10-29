/* MockupKitchen · Accessibility-Check (a11y.js)
 * Eigenständiges Modul (IIFE), keine Abhängigkeiten zu app.js/sketches.js/catalog.js — bekommt Zustand (S),
 * vorab berechnete Geometrie (computedByPage, von MK.computeAll(page) je Seite) und optional den Katalog
 * als Parameter hinein. Läuft im Browser (window vorhanden) und unter Node (globales `window`-Shim in
 * a11y-test.js: `global.window = global.window || global;` VOR dem Laden dieser Datei).
 *
 * Öffentliche API: window.MK_A11Y = { contrastRatio, check, summary, guide, renderList, renderGuide }
 */
(function (root) {
  'use strict';

  // ------------------------------------------------------------------ Helfer: Farbe/Kontrast (WCAG 2.x)
  function parseHex(hex) {
    if (typeof hex !== 'string') return null;
    var h = hex.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function relLuminance(rgb) {
    function f(c) { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
  }
  // WCAG-Kontrastverhältnis zweier Hex-Farben (#rgb oder #rrggbb, mit oder ohne '#'); null bei ungültiger Eingabe.
  function contrastRatio(hexA, hexB) {
    var a = parseHex(hexA), b = parseHex(hexB);
    if (!a || !b) return null;
    var la = relLuminance(a), lb = relLuminance(b);
    var lighter = Math.max(la, lb), darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
  }
  function round1(n) { return Math.round(n * 10) / 10; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // ------------------------------------------------------------------ Texte (DE/EN)
  // Jede Codefunktion bekommt einen Kontext (p) und liefert { text, hint }.
  var DICT = {
    de: {
      A11Y_CONTRAST_TEXT: function (p) {
        return {
          text: 'Kontrast Text/Kachelgrund zu niedrig (' + p.ratio + ':1, Ziel ≥ 4.5:1)',
          hint: 'Schriftfarbe ' + p.ink + ' auf Kachelgrund ' + p.tileBg + ' ist schwer lesbar. Dunkleren Text oder helleren Kachelgrund wählen.'
        };
      },
      A11Y_CONTRAST_HEADER: function (p) {
        return {
          text: 'Kontrast im Kopfband zu niedrig (' + p.ratio + ':1, Ziel ≥ 4.5:1)',
          hint: 'Kopfband-Schrift ' + p.ink + ' auf Kopfband-Grund ' + p.bg + ' ist schwer lesbar.'
        };
      },
      A11Y_CONTRAST_ACCENT: function (p) {
        return {
          text: 'Akzentfarbe gegen Kachelgrund zu schwach (' + p.ratio + ':1, Ziel ≥ 3:1)',
          hint: 'Die Akzentfarbe kennzeichnet aktive Nav-Buttons und Hervorhebungen — bei zu wenig Kontrast wirken diese unauffällig.'
        };
      },
      A11Y_PALETTE_COLOUR_ONLY: function () {
        return {
          text: 'Varianzfarben folgen Grün/Rot (IBCS-Palette)',
          hint: 'Rot-Grün-Schwäche betrifft ca. 8% aller Männer. Die Skizzen tragen zusätzlich Vorzeichen und Labels — sicherstellen, dass diese im Export erhalten bleiben, oder auf Teal/Rot wechseln.'
        };
      },
      A11Y_FONT_MIN: function (p) {
        return {
          text: 'Schrift auf dieser Leinwandgröße zu klein (Titel ' + p.titlePx + 'px, Untertitel ' + p.subPx + 'px)',
          hint: 'Power-BI-Text unter 9pt ist auf einem Projektor kaum lesbar. Leinwand vergrößern oder weniger Kacheln pro Seite planen.'
        };
      },
      A11Y_TILE_SMALL_WARN: function (p) {
        return {
          text: 'Kachel „' + p.tileTitle + '" ist knapp bemessen (' + p.w + '×' + p.h + 'px)',
          hint: 'Unter ca. ' + p.thW + '×' + p.thH + 'px wird ein Diagramm schwer lesbar. Mehr Platz geben oder Inhalt vereinfachen.'
        };
      },
      A11Y_TILE_SMALL_ERROR: function (p) {
        return {
          text: 'Kachel „' + p.tileTitle + '" ist zu klein (' + p.w + '×' + p.h + 'px)',
          hint: 'Unter ca. ' + p.thW + '×' + p.thH + 'px ist ein Diagramm praktisch nicht mehr nutzbar. Kachel vergrößern.'
        };
      },
      A11Y_TITLE_MISSING: function (p) {
        return {
          text: 'Kachel ohne Titel (' + p.kind + ')',
          hint: 'Screenreader kündigen Visuals über ihren Titel an — ohne Titel bleibt das Visual namenlos.'
        };
      },
      A11Y_DENSITY: function (p) {
        return {
          text: 'Seite „' + p.pageName + '" hat ' + p.count + ' Kacheln',
          hint: 'Ab etwa 9 Kacheln werden Lesereihenfolge und Fokusreihenfolge (Tab) unübersichtlich.'
        };
      },
      A11Y_READING_ORDER: function (p) {
        return {
          text: 'Seite „' + p.pageName + '" ist ' + p.depth + ' Ebenen tief verschachtelt',
          hint: 'Mehr als drei Verschachtelungsebenen sind mit Tastatur/Tab schwer nachzuvollziehen. Layout flacher aufbauen.'
        };
      },
      A11Y_NAV_OFF: function () {
        return {
          text: 'Seitennavigation ist abgeschaltet',
          hint: 'Bei mehreren Seiten müssen diese trotzdem erreichbar bleiben — z. B. über Lesezeichen oder Seiten-Tabs.'
        };
      },
      A11Y_SLICER_LABEL: function () {
        return {
          text: 'Filterfeld ohne Namen',
          hint: 'Ein Slicer ohne erkennbaren Feldnamen ist per Tastatur/Screenreader schwer zuzuordnen.'
        };
      }
    },
    en: {
      A11Y_CONTRAST_TEXT: function (p) {
        return {
          text: 'Text/tile contrast too low (' + p.ratio + ':1, target ≥ 4.5:1)',
          hint: 'Ink ' + p.ink + ' on tile background ' + p.tileBg + ' is hard to read. Use a darker ink or a lighter tile background.'
        };
      },
      A11Y_CONTRAST_HEADER: function (p) {
        return {
          text: 'Header contrast too low (' + p.ratio + ':1, target ≥ 4.5:1)',
          hint: 'Header ink ' + p.ink + ' on header background ' + p.bg + ' is hard to read.'
        };
      },
      A11Y_CONTRAST_ACCENT: function (p) {
        return {
          text: 'Accent colour too weak against tile background (' + p.ratio + ':1, target ≥ 3:1)',
          hint: 'The accent colour marks active nav buttons and highlights — with too little contrast these become hard to notice.'
        };
      },
      A11Y_PALETTE_COLOUR_ONLY: function () {
        return {
          text: 'Variance colours follow green/red (IBCS palette)',
          hint: 'About 8% of men have red-green colour vision deficiency. Sketches also carry signs and labels — make sure those survive export, or switch to teal/red.'
        };
      },
      A11Y_FONT_MIN: function (p) {
        return {
          text: 'Text too small at this canvas size (title ' + p.titlePx + 'px, subtitle ' + p.subPx + 'px)',
          hint: 'Power BI text below 9pt is hard to read on a projector. Increase the canvas size or plan fewer tiles per page.'
        };
      },
      A11Y_TILE_SMALL_WARN: function (p) {
        return {
          text: 'Tile "' + p.tileTitle + '" is on the small side (' + p.w + '×' + p.h + 'px)',
          hint: 'Below about ' + p.thW + '×' + p.thH + 'px a chart becomes hard to read. Give it more room or simplify the content.'
        };
      },
      A11Y_TILE_SMALL_ERROR: function (p) {
        return {
          text: 'Tile "' + p.tileTitle + '" is too small (' + p.w + '×' + p.h + 'px)',
          hint: 'Below about ' + p.thW + '×' + p.thH + 'px a chart is practically unusable. Make the tile bigger.'
        };
      },
      A11Y_TITLE_MISSING: function (p) {
        return {
          text: 'Tile without a title (' + p.kind + ')',
          hint: 'Screen readers announce visuals by their title — without one the visual stays unnamed.'
        };
      },
      A11Y_DENSITY: function (p) {
        return {
          text: 'Page "' + p.pageName + '" has ' + p.count + ' tiles',
          hint: 'Past about 9 tiles, reading order and tab/focus order become confusing.'
        };
      },
      A11Y_READING_ORDER: function (p) {
        return {
          text: 'Page "' + p.pageName + '" is nested ' + p.depth + ' levels deep',
          hint: 'More than three nesting levels are hard to follow with keyboard/tab order. Flatten the layout.'
        };
      },
      A11Y_NAV_OFF: function () {
        return {
          text: 'Page navigation is switched off',
          hint: 'With more than one page, pages must still be reachable — e.g. via bookmarks or page tabs.'
        };
      },
      A11Y_SLICER_LABEL: function () {
        return {
          text: 'Filter field without a name',
          hint: 'A slicer without a recognisable field name is hard to identify via keyboard/screen reader.'
        };
      }
    }
  };

  function langOf(lang) { return lang === 'en' ? 'en' : 'de'; }
  function build(lang, code, params, level, page, visual, tileTitle) {
    var L = langOf(lang);
    var fn = (DICT[L] && DICT[L][code]) || (DICT.de[code]);
    var out = fn(params || {});
    // A11Y_TILE_SMALL_WARN / _ERROR sind intern zwei Varianten desselben öffentlichen Codes A11Y_TILE_SMALL.
    var publicCode = code.indexOf('A11Y_TILE_SMALL') === 0 ? 'A11Y_TILE_SMALL' : code;
    return {
      level: level, code: publicCode, text: out.text, hint: out.hint,
      page: page == null ? null : page, visual: visual == null ? null : visual,
      tileTitle: tileTitle == null ? null : tileTitle
    };
  }

  // ------------------------------------------------------------------ Layout-Tiefe (für A11Y_READING_ORDER)
  function treeDepth(node) {
    if (!node || node.type === 'leaf') return 1;
    var children = node.children || [];
    var max = 0;
    children.forEach(function (ch) { max = Math.max(max, treeDepth(ch.node)); });
    return 1 + max;
  }

  // ------------------------------------------------------------------ check()
  function check(S, computedByPage, opts) {
    opts = opts || {};
    var lang = langOf(opts.lang || (S && S.lang));
    var catalog = opts.catalog || root.MK_CATALOG || null;
    var findings = [];
    if (!S) return findings;

    var design = S.design || {};
    var ink = design.ink || '#0F1E2E';
    var tileBg = design.tileBg || '#FFFFFF';
    var accent = design.accent || '#C25A2D';

    // --- Kontrast Text/Kachel
    var rText = contrastRatio(ink, tileBg);
    if (rText != null && rText < 4.5) {
      findings.push(build(lang, 'A11Y_CONTRAST_TEXT', { ratio: round1(rText), ink: ink, tileBg: tileBg }, 'error'));
    }

    // --- Kontrast Kopfband (custom oder abgeleitet aus design.header)
    var hdInk, hdBg;
    if (design.header === 'custom') { hdInk = design.headerInk || '#FFFFFF'; hdBg = design.headerBg || '#0F1E2E'; }
    else if (design.header === 'dark') { hdInk = '#FFFFFF'; hdBg = '#0F1E2E'; }
    else if (design.header === 'accent') { hdInk = '#FFFFFF'; hdBg = accent; }
    else { hdInk = '#0F1E2E'; hdBg = '#FFFFFF'; } // 'light' (Default)
    var rHeader = contrastRatio(hdInk, hdBg);
    if (rHeader != null && rHeader < 4.5) {
      findings.push(build(lang, 'A11Y_CONTRAST_HEADER', { ratio: round1(rHeader), ink: hdInk, bg: hdBg }, 'error'));
    }

    // --- Kontrast Akzent/Kachelgrund
    var rAccent = contrastRatio(accent, tileBg);
    if (rAccent != null && rAccent < 3) {
      findings.push(build(lang, 'A11Y_CONTRAST_ACCENT', { ratio: round1(rAccent), accent: accent, tileBg: tileBg }, 'warn'));
    }

    // --- Palette (Farbe allein trägt Bedeutung)
    if (design.palette === 'ibcs') {
      findings.push(build(lang, 'A11Y_PALETTE_COLOUR_ONLY', {}, 'info'));
    }

    // --- Mindestschriftgrößen (Leinwand-abhängig, global für den Bericht)
    var canvas = S.canvas || { w: 1280 };
    var k = clamp((canvas.w || 1280) / 1280, 0.6, 3.2);
    var titlePx = round1(12 * k), subPx = round1(9.5 * k);
    if (subPx < 9 || titlePx < 11) {
      findings.push(build(lang, 'A11Y_FONT_MIN', { titlePx: titlePx, subPx: subPx }, 'warn'));
    }

    // --- Navigation abgeschaltet
    var pages = S.pages || [];
    var chrome = S.chrome || {};
    var navOff = chrome.navPos === 'off' || (!chrome.navPos && chrome.header && chrome.header.navOn === false);
    if (navOff && pages.length > 1) {
      findings.push(build(lang, 'A11Y_NAV_OFF', {}, 'info'));
    }

    // --- Slicer/Filterfelder ohne Namen
    var filterFields = (chrome.filter && chrome.filter.fields) || [];
    filterFields.forEach(function (f) {
      if (!f || !f.name) findings.push(build(lang, 'A11Y_SLICER_LABEL', {}, 'warn'));
    });

    // --- Je Seite: Kacheln (Größe, Titel, Dichte), Verschachtelung
    var EXCLUDE_TITLE_KINDS = { text: 1, image: 1, button: 1, slicer: 1 };
    pages.forEach(function (page) {
      var computed = (computedByPage && computedByPage[page.id]) || null;
      var leaves = (computed && computed.leaves) || [];
      var visualLeaves = leaves.filter(function (l) { return l.node && l.node.visual; });

      visualLeaves.forEach(function (l) {
        var v = l.node.visual, rect = l.rect || {};
        var def = catalog && catalog.byId && catalog.byId[v.kind];
        var tileTitle = v.title || (def && def.label) || v.kind;
        var w = rect.w || 0, h = rect.h || 0;
        var thWWarn = round1(160 * k), thHWarn = round1(90 * k);
        var thWErr = round1(100 * k), thHErr = round1(60 * k);
        if (w < thWErr || h < thHErr) {
          findings.push(build(lang, 'A11Y_TILE_SMALL_ERROR', { tileTitle: tileTitle, w: Math.round(w), h: Math.round(h), thW: thWErr, thH: thHErr }, 'error', page.name, l.node.id, tileTitle));
        } else if (w < thWWarn || h < thHWarn) {
          findings.push(build(lang, 'A11Y_TILE_SMALL_WARN', { tileTitle: tileTitle, w: Math.round(w), h: Math.round(h), thW: thWWarn, thH: thHWarn }, 'warn', page.name, l.node.id, tileTitle));
        }
        if (!v.title && !EXCLUDE_TITLE_KINDS[v.kind]) {
          findings.push(build(lang, 'A11Y_TITLE_MISSING', { kind: v.kind }, 'warn', page.name, l.node.id, tileTitle));
        }
      });

      if (visualLeaves.length > 9) {
        findings.push(build(lang, 'A11Y_DENSITY', { pageName: page.name, count: visualLeaves.length }, 'info', page.name, null, null));
      }

      var depth = treeDepth(page.layout);
      if (depth > 3) {
        findings.push(build(lang, 'A11Y_READING_ORDER', { pageName: page.name, depth: depth }, 'info', page.name, null, null));
      }
    });

    return findings;
  }

  // ------------------------------------------------------------------ summary()
  function summary(findings, lang) {
    var L = langOf(lang);
    findings = findings || [];
    var issues = findings.filter(function (f) { return f.level === 'error' || f.level === 'warn'; }).length;
    var notes = findings.filter(function (f) { return f.level === 'info'; }).length;
    if (!issues && !notes) return L === 'en' ? 'No issues found' : 'Keine Auffälligkeiten';
    return L === 'en' ? (issues + ' issues, ' + notes + ' notes') : (issues + ' Probleme, ' + notes + ' Hinweise');
  }

  // ------------------------------------------------------------------ guide()
  var GUIDE = {
    de: [
      { title: 'Kontrast (WCAG 1.4.3 / 1.4.11)', text: 'Text mindestens 4.5:1 gegen seinen Hintergrund, große Schrift und UI-Bestandteile (Buttons, Icons, aktive Zustände) mindestens 3:1.' },
      { title: 'Farbe nicht als einziges Merkmal (WCAG 1.4.1)', text: 'Bedeutung nie allein über Farbe codieren — Vorzeichen, Muster oder Beschriftung ergänzen, besonders bei Varianzen (AC/PY).' },
      { title: 'Rot/Grün bei Varianzen vermeiden', text: 'Rot-Grün-Farbenblindheit betrifft ca. 8% aller Männer. Teal/Rot statt Grün/Rot verwenden, oder Vorzeichen/Labels sicherstellen.' },
      { title: 'Mindestschriftgrößen', text: 'Auf der Zielleinwand (Beamer, TV, Laptop) prüfen — Power-BI-Text unter 9pt ist auf einem Projektor kaum lesbar.' },
      { title: 'Tab-Reihenfolge und Fokus (WCAG 2.4.3 / 2.1.1)', text: 'Kacheln in einer Reihenfolge anordnen, die der visuellen Leserichtung entspricht; Fokus muss sichtbar bleiben.' },
      { title: 'Alt-Text / Titel für jedes Visual (WCAG 1.1.1)', text: 'Jede Kachel braucht einen sprechenden Titel — Screenreader kündigen Visuals darüber an.' },
      { title: 'Konsistentes Layout und Leserichtung (WCAG 3.2.3)', text: 'Gleiche Elemente (Navigation, Filter, Kopfband) auf jeder Seite an derselben Stelle; Verschachtelung flach halten.' },
      { title: 'Ausreichende Kachelgrößen', text: 'Ein Diagramm braucht Platz für Achsen, Labels und Legende — sehr kleine Kacheln werden unlesbar.' },
      { title: 'Tastatur-erreichbare Slicer (WCAG 2.1.1)', text: 'Filterfelder brauchen einen erkennbaren Namen und müssen ohne Maus bedienbar sein.' },
      { title: 'Dark Mode und High Contrast', text: 'Kontrastwerte für helle und dunkle Kachelgründe getrennt prüfen — ein Wert, der im Hellmodus passt, kann im Dunkelmodus versagen.' }
    ],
    en: [
      { title: 'Contrast (WCAG 1.4.3 / 1.4.11)', text: 'Text at least 4.5:1 against its background; large text and UI parts (buttons, icons, active states) at least 3:1.' },
      { title: 'Colour is not the only cue (WCAG 1.4.1)', text: 'Never encode meaning by colour alone — add signs, patterns or labels, especially for variances (AC/PY).' },
      { title: 'Avoid red/green for variance', text: 'Red-green colour vision deficiency affects about 8% of men. Use teal/red instead of green/red, or make sure signs/labels are present.' },
      { title: 'Minimum font sizes', text: 'Check on the intended screen (projector, TV, laptop) — Power BI text below 9pt is hard to read on a projector.' },
      { title: 'Tab order and focus (WCAG 2.4.3 / 2.1.1)', text: 'Order tiles to match the visual reading order; focus must stay visible.' },
      { title: 'Alt text / title for every visual (WCAG 1.1.1)', text: 'Every tile needs a meaningful title — screen readers announce visuals by it.' },
      { title: 'Consistent layout and reading order (WCAG 3.2.3)', text: 'Keep the same elements (nav, filter, header) in the same place on every page; keep nesting shallow.' },
      { title: 'Sufficient tile sizes', text: 'A chart needs room for axes, labels and a legend — very small tiles become unreadable.' },
      { title: 'Keyboard-reachable slicers (WCAG 2.1.1)', text: 'Filter fields need a recognisable name and must work without a mouse.' },
      { title: 'Dark mode and high contrast', text: 'Check contrast separately for light and dark tile backgrounds — a value that passes in light mode can fail in dark mode.' }
    ]
  };
  function guide(lang) { return GUIDE[langOf(lang)].slice(); }

  // ------------------------------------------------------------------ Render (nur HTML, keine CSS)
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function renderList(findings, lang) {
    var L = langOf(lang);
    findings = findings || [];
    if (!findings.length) return '<p class="a11y-empty">' + (L === 'en' ? 'No accessibility issues found.' : 'Keine Auffälligkeiten gefunden.') + '</p>';
    var cls = { error: 'a11y-err', warn: 'a11y-warn', info: 'a11y-info' };
    var items = findings.map(function (f) {
      return '<li class="' + (cls[f.level] || 'a11y-info') + '"><span class="a11y-dot" aria-hidden="true">●</span> ' +
        esc(f.text) + '<small>' + esc(f.hint) + '</small></li>';
    }).join('');
    return '<ul class="a11y-list">' + items + '</ul>';
  }
  function renderGuide(lang) {
    var items = guide(lang);
    return items.map(function (g) {
      return '<details class="a11y-guide-item"><summary>' + esc(g.title) + '</summary><p>' + esc(g.text) + '</p></details>';
    }).join('');
  }

  root.MK_A11Y = { contrastRatio: contrastRatio, check: check, summary: summary, guide: guide, renderList: renderList, renderGuide: renderGuide };
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
