/* MockupKitchen · fmtinfo.js Selbsttest (Node)
 * Aufruf: node assets/mockup/fmtinfo-test.js
 * Prüft den Formatklartext (describe) an echten Formaten aus den Demo-Modellen:
 * Vorzeichenregel (+/-) statt Einheit, Einheit nur aus Text/Währungszeichen, negative Sektion nur bei inhaltlicher Abweichung.
 */
'use strict';
var F = require('./fmtinfo.js');

var failures = 0, passed = 0;
function assert(cond, msg) { if (cond) passed++; else { failures++; console.error('FAIL: ' + msg); } }
function d(fs, lang) { return F.describe(fs, lang || 'de'); }
function eq(fs, lang, label, sample) {
  var r = d(fs, lang);
  assert(r && r.label === label, fs + ' (' + lang + ') Label: erwartet „' + label + '", war „' + (r && r.label) + '"');
  if (sample != null) assert(r && r.sample === sample, fs + ' (' + lang + ') Beispiel: erwartet „' + sample + '", war „' + (r && r.sample) + '"');
}

// ---- R22: Vorzeichen ist keine Einheit
eq('+0.0 %;-0.0 %;0.0 %', 'de', 'Prozent, 1 Nachkommastelle, mit Vorzeichen', '+12,3 %');
eq('+0.0 %;-0.0 %;0.0 %', 'en', 'Percent, 1 decimal, with sign', '+12.3 %');
eq('+0.00 "°C"', 'de', 'Zahl, 2 Nachkommastellen, Einheit „°C", mit Vorzeichen', '+1234567,89 °C');
eq('+0.00 "°C";-0.00 "°C";0.00 "°C"', 'de', 'Zahl, 2 Nachkommastellen, Einheit „°C", mit Vorzeichen');
eq('+0.00 "°C";-0.00 "°C";0.00 "°C"', 'en', 'Number, 2 decimals, unit “°C”, with sign');
eq('+#,##0;-#,##0;0', 'de', 'Ganzzahl, mit Tausendertrennzeichen, mit Vorzeichen', '+1.234.568');
eq('+€0.0', 'de', 'Währung €, 1 Nachkommastelle, mit Vorzeichen');
assert(!/Einheit „\+/.test(d('+0.0 %;-0.0 %;0.0 %').label), 'Plus darf nie als Einheit erscheinen');

// ---- unverändert gute Fälle
eq('#,0', 'de', 'Ganzzahl, mit Tausendertrennzeichen', '1.234.568');
eq('0.00\\ %;-0.00\\ %;0.00\\ %', 'de', 'Prozent, 2 Nachkommastellen', '12,35 %');
eq('#,0 "T€"', 'de', 'Währung T€, ohne Nachkommastellen, mit Tausendertrennzeichen', '1.234.568 T€');
eq('0.0%', 'de', 'Prozent, 1 Nachkommastelle', '12,3 %');
eq('0.0 "°C"', 'de', 'Zahl, 1 Nachkommastelle, Einheit „°C"');
eq('0.0,,"M"', 'de', 'Zahl, 1 Nachkommastelle, in Millionen, Einheit „M"', '1,2 M');

// ---- negative Sektion nur nennen, wenn sie inhaltlich abweicht
assert(/negative/.test(d('0.0;(0.0)', 'de').label), 'Klammern bei negativen Werten werden genannt');
assert(/negative/.test(d('0.0;[Red]-0.0', 'de').label), 'andere Farbe bei negativen Werten wird genannt');
assert(!/negative/.test(d('+0.0 %;-0.0 %;0.0 %', 'de').label), 'gespiegeltes Vorzeichen wird nicht genannt');
assert(!/negative/.test(d('0.00\\ %;-0.00\\ %;0.00\\ %', 'de').label), 'Minus-Sektion ohne Abweichung wird nicht genannt');

// ---- Datumsformat und benannte Formate
eq('yyyy-mm-dd', 'de', 'Datum (yyyy-mm-dd)', '2026-09-27');
eq('d.mm.yy', 'de', 'Datum (d.mm.yy)', '27.09.26');
eq('Short Date', 'de', 'Datum kurz', '27.09.2026');
eq('Short Date', 'en', 'Short date', '9/27/2026');

// ---- Randfälle
assert(d('') === null && d(null) === null, 'leeres Format ergibt null');
assert(F.describe('x', 'de', { dynamic: true }).kind === 'dynamic', 'dynamisches Format');

console.log(passed + ' Tests bestanden, ' + failures + ' fehlgeschlagen.');
if (failures) process.exit(1);
