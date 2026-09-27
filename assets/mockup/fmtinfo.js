/* MockupKitchen · Formatstrings in Klartext (v0.5.3)
   Übersetzt Power-BI-/.NET-Formatstrings (formatString aus TMDL) in eine lesbare Beschreibung mit Beispielwert.
   Erster Abschnitt (vor „;") zählt; Literale in "…" und nach \ werden als Text erkannt.
   Reine Funktionen, Node-testbar:  MK_FMTINFO.describe('0.0%', 'de') → { kind, label, sample } */
(function (root) {
  'use strict';

  var TXT = {
    de: {
      pct: 'Prozent', cur: 'Währung', num: 'Zahl', int: 'Ganzzahl', date: 'Datum', time: 'Uhrzeit', dt: 'Datum und Uhrzeit', text: 'Text',
      dec0: 'ohne Nachkommastellen', dec1: '1 Nachkommastelle', decN: '{n} Nachkommastellen', thou: 'mit Tausendertrennzeichen',
      k: 'in Tausend', m: 'in Millionen', b: 'in Milliarden', unit: 'Einheit „{u}"', dyn: 'dynamisch (Format wird per DAX berechnet)',
      gen: 'ohne feste Formatierung', lit: 'fester Text', neg: 'eigenes Format für negative Werte', named: {
        'general date': 'Datum und Uhrzeit', 'long date': 'Datum lang', 'medium date': 'Datum mittel', 'short date': 'Datum kurz',
        'long time': 'Uhrzeit lang', 'medium time': 'Uhrzeit mittel', 'short time': 'Uhrzeit kurz',
        'general number': 'Zahl ohne feste Formatierung', currency: 'Währung (Gebietsschema)', fixed: 'Zahl, 2 Nachkommastellen',
        standard: 'Zahl mit Tausendertrennzeichen, 2 Nachkommastellen', percent: 'Prozent, 2 Nachkommastellen', scientific: 'wissenschaftlich',
        'yes/no': 'Ja/Nein', 'true/false': 'Wahr/Falsch', 'on/off': 'Ein/Aus'
      },
      months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'], dec: ',', grp: '.'
    },
    en: {
      pct: 'Percent', cur: 'Currency', num: 'Number', int: 'Whole number', date: 'Date', time: 'Time', dt: 'Date and time', text: 'Text',
      dec0: 'no decimals', dec1: '1 decimal', decN: '{n} decimals', thou: 'with thousands separator',
      k: 'in thousands', m: 'in millions', b: 'in billions', unit: 'unit “{u}”', dyn: 'dynamic (format computed in DAX)',
      gen: 'no fixed format', lit: 'fixed text', neg: 'own format for negative values', named: {
        'general date': 'Date and time', 'long date': 'Long date', 'medium date': 'Medium date', 'short date': 'Short date',
        'long time': 'Long time', 'medium time': 'Medium time', 'short time': 'Short time',
        'general number': 'Number without fixed format', currency: 'Currency (locale)', fixed: 'Number, 2 decimals',
        standard: 'Number with thousands separator, 2 decimals', percent: 'Percent, 2 decimals', scientific: 'Scientific',
        'yes/no': 'Yes/No', 'true/false': 'True/False', 'on/off': 'On/Off'
      },
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], dec: '.', grp: ','
    }
  };
  var CURRENCY = /€|\$|£|¥|CHF|EUR|USD|GBP/;
  // Beispiel-Datum: Montag, 27. September 2026, 14:30:05
  var SD = { y: 2026, M: 9, d: 27, wd: 0, H: 14, m: 30, s: 5 };

  function fill(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k] == null ? '' : o[k]; }); }

  // Formatstring in Abschnitte zerlegen (Semikolon außerhalb von Literalen) und je Abschnitt Kern und Literale trennen
  function sections(fs) {
    var out = [], cur = '', q = false;
    for (var i = 0; i < fs.length; i++) {
      var c = fs[i];
      if (c === '\\' && i + 1 < fs.length) { cur += c + fs[++i]; continue; }
      if (c === '"') { q = !q; cur += c; continue; }
      if (c === ';' && !q) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    out.push(cur);
    return out;
  }
  function split(sec) {
    // liefert { core, parts: [{lit:true|false, s}] } in Reihenfolge
    var parts = [], buf = '', lit = false, i;
    function flush(isLit) { if (buf) parts.push({ lit: isLit, s: buf }); buf = ''; }
    for (i = 0; i < sec.length; i++) {
      var c = sec[i];
      if (c === '"') {
        if (!lit) { flush(false); lit = true; } else { flush(true); lit = false; }
        continue;
      }
      if (lit) { buf += c; continue; }
      if (c === '\\' && i + 1 < sec.length) { flush(false); parts.push({ lit: true, s: sec[++i] }); continue; }
      buf += c;
    }
    flush(lit);
    var core = parts.filter(function (p) { return !p.lit; }).map(function (p) { return p.s; }).join('');
    return { core: core, parts: parts };
  }

  function groupDigits(intStr, sep) { return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, sep); }
  function fmtNumber(v, dec, thou, T) {
    var neg = v < 0; v = Math.abs(v);
    var s = v.toFixed(dec), p = s.split('.');
    var i = thou ? groupDigits(p[0], T.grp) : p[0];
    return (neg ? '-' : '') + i + (dec > 0 ? T.dec + p[1] : '');
  }
  function sampleDate(core, T) {
    var afterHour = false;
    return core.replace(/yyyy|yy|MMMM|MMM|MM|M|dddd|ddd|dd|d|HH|H|hh|h|mm|m|ss|s|tt/g, function (t) {
      // Power BI (VB-Formate): m/mm direkt nach einer Stunde = Minute, sonst Monat
      if ((t === 'mm' || t === 'm') && !afterHour) t = t === 'mm' ? 'MM' : 'M';
      afterHour = /^[Hh]/.test(t);
      switch (t) {
        case 'yyyy': return String(SD.y); case 'yy': return String(SD.y).slice(2);
        case 'MMMM': return T.months[SD.M - 1]; case 'MMM': return T.months[SD.M - 1].slice(0, 3);
        case 'MM': return ('0' + SD.M).slice(-2); case 'M': return String(SD.M);
        case 'dddd': return T.days[SD.wd]; case 'ddd': return T.days[SD.wd].slice(0, 2);
        case 'dd': return ('0' + SD.d).slice(-2); case 'd': return String(SD.d);
        case 'HH': case 'H': return String(SD.H); case 'hh': return '02'; case 'h': return '2';
        case 'mm': case 'm': return ('0' + SD.m).slice(-2); case 'ss': case 's': return ('0' + SD.s).slice(-2);
        case 'tt': return 'PM';
      }
      return t;
    });
  }

  function describe(fs, lang, opts) {
    var T = TXT[lang === 'en' ? 'en' : 'de']; opts = opts || {};
    if (opts.dynamic) return { kind: 'dynamic', label: T.dyn, sample: '', raw: fs || '' };
    if (fs == null || String(fs).trim() === '') return null;
    fs = String(fs).trim();
    var named = T.named[fs.toLowerCase()];
    if (named) {
      var k = /date|time/i.test(fs) ? (/time/i.test(fs) && !/date/i.test(fs) ? 'time' : 'date') : (/percent/i.test(fs) ? 'percent' : 'number');
      var smp = '';
      if (/^short date$/i.test(fs)) smp = lang === 'en' ? '9/27/2026' : '27.09.2026';
      else if (/^long date$/i.test(fs)) smp = lang === 'en' ? 'Sunday, September 27, 2026' : 'Sonntag, 27. September 2026';
      else if (/^general date$/i.test(fs)) smp = lang === 'en' ? '9/27/2026 2:30:05 PM' : '27.09.2026 14:30:05';
      else if (/^percent$/i.test(fs)) smp = fmtNumber(12.345, 2, true, T) + ' %';
      else if (/^(fixed|standard)$/i.test(fs)) smp = fmtNumber(1234567.891, 2, /standard/i.test(fs), T);
      return { kind: k, label: named, sample: smp, raw: fs };
    }
    var secs = sections(fs), first = split(secs[0]);
    var core = first.core;
    var lits = first.parts.filter(function (p) { return p.lit; }).map(function (p) { return p.s; }).join('').trim();
    var hasDigit = /[0#]/.test(core);
    // Datum / Uhrzeit: Datums-Platzhalter ohne Ziffern-Platzhalter
    if (!hasDigit && /[yMdHhs]/.test(core)) {
      var isTime = /[Hhs]/.test(core);
      var isDate = /[yMd]/.test(core) || (/m/.test(core) && !/[Hh][^yMd]*m/.test(core));
      var smp2 = sampleDate(secs[0].replace(/"([^"]*)"/g, '$1').replace(/\\(.)/g, '$1'), T);
      return { kind: isDate ? (isTime ? 'datetime' : 'date') : 'time', label: (isDate ? (isTime ? T.dt : T.date) : T.time) + ' (' + core.trim() + ')', sample: smp2, raw: fs };
    }
    if (!hasDigit) {
      var all = secs.map(function (x) { return split(x).parts.map(function (q) { return q.s; }).join('').trim(); }).filter(function (x) { return x; });
      var shown = all.filter(function (x, i) { return all.indexOf(x) === i; }).join(' / ');
      return { kind: 'text', label: shown ? T.lit + ' („' + shown + '")' : T.gen, sample: all[0] || '', raw: fs };
    }
    // Zahlenformat
    var pct = core.indexOf('%') >= 0;
    var coreLit = core.replace(/[0#,.%Ee+\-\s()]/g, '');
    lits = (lits + ' ' + coreLit).trim();
    core = core.replace(/[^0#,.%Ee+\-]/g, '');
    var dot = core.indexOf('.');
    var intPart = dot >= 0 ? core.slice(0, dot) : core.replace(/%/g, '');
    var decPart = dot >= 0 ? core.slice(dot + 1) : '';
    var dec = (decPart.match(/^[0#]*/) || [''])[0].length;
    var thou = /,[0#]/.test(intPart);
    var scaleM = intPart.match(/[0#](,+)\s*%?$/);
    var tailM = decPart.match(/^[0#]*(,+)/);
    var scale = Math.max(scaleM ? scaleM[1].length : 0, tailM ? tailM[1].length : 0);
    // Text vor und hinter der Zahl so übernehmen, wie er im Format steht (z. B. „T€", "Mio. €", "€ ")
    var seq = [];
    first.parts.forEach(function (p) { for (var j = 0; j < p.s.length; j++) seq.push({ ch: p.s[j], fmt: !p.lit && /[0#,.%]/.test(p.s[j]) }); });
    var iFirst = -1, iLast = -1;
    seq.forEach(function (x, j) { if (x.fmt && /[0#]/.test(x.ch) && iFirst < 0) iFirst = j; if (x.fmt) iLast = j; });
    var prefix = seq.slice(0, iFirst).map(function (x) { return x.ch; }).join('').trim();
    var suffix = seq.slice(iLast + 1).filter(function (x) { return x.ch !== '%'; }).map(function (x) { return x.ch; }).join('').trim();
    var unitText = (prefix + ' ' + suffix).trim();
    var curM = unitText.match(CURRENCY);
    var unit = curM ? '' : unitText;
    // Beispiel
    var v = pct ? 12.3456 : 1234567.891 / Math.pow(1000, scale);
    var sample = (prefix ? prefix + ' ' : '') + fmtNumber(v, dec, thou, T) + (pct ? ' %' : '') + (suffix ? ' ' + suffix : '');
    var parts = [];
    var kind = pct ? 'percent' : (curM ? 'currency' : (dec === 0 ? 'integer' : 'number'));
    var head = pct ? T.pct : (curM ? T.cur + ' ' + unitText : (dec === 0 ? T.int : T.num));
    parts.push(head);
    if (!(kind === 'integer')) parts.push(dec === 0 ? T.dec0 : (dec === 1 ? T.dec1 : fill(T.decN, { n: dec })));
    if (thou) parts.push(T.thou);
    if (scale) parts.push(scale === 1 ? T.k : (scale === 2 ? T.m : T.b));
    if (unit) parts.push(fill(T.unit, { u: unit }));
    if (secs.length > 1 && secs[1].trim() && split(secs[1]).core.replace(/-/g, '') !== core) parts.push(T.neg);
    return { kind: kind, label: parts.join(', '), sample: sample, raw: fs, decimals: dec, thousands: thou, scale: scale };
  }

  var api = { describe: describe, sections: sections };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MK_FMTINFO = api;
})(typeof window !== 'undefined' ? window : globalThis);
