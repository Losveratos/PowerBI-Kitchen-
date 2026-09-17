#!/usr/bin/env node
/* Setzt die englische Fassung aus den uebersetzten Fragmenten zusammen.
 *
 * Die deutsche Fassung visual-standards-rechner.html ist und bleibt die Quelle. Sie wird in
 * sieben Fragmente geschnitten (i18n/frag/NN-*.txt), die einzeln uebersetzt werden
 * (i18n/frag/NN-*.en.txt), und hier wieder zusammengefuegt zu
 * visual-standards-calculator.html.
 *
 * Warum nicht ein Sprachumschalter in einer Datei: die Datei traegt rund 2.600 Textstellen in
 * Markup, JS-Konstanten und zusammengesetzten Saetzen. Jede durch einen Woerterbuch-Aufruf zu
 * ersetzen hiesse, die komplette Datei anzufassen. Warum nicht maschinell uebersetzen: Text und
 * Code sind zu eng verwoben (siehe Kopf von i18n-check.js).
 *
 * Preis dieses Wegs: die Fassungen koennen auseinanderlaufen. Deshalb prueft dieses Skript vor
 * dem Zusammensetzen, ob die Fragmente noch zur aktuellen deutschen Datei passen - wenn nicht,
 * bricht es ab, statt eine veraltete englische Fassung zu erzeugen.
 *
 * Start:  node scripts/i18n-build.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DE = path.join(REPO, 'visual-standards-rechner.html');
const FRAG = path.join(REPO, 'i18n', 'frag');
const OUT = path.join(REPO, 'visual-standards-calculator.html');

/* Zeilenbereiche der Fragmente in der deutschen Datei (1-basiert, Ende einschliesslich).
   Muss zu dem passen, womit die Fragmente geschnitten wurden. */
const CUTS = [
  [1, 430, '01-head-css'],
  [431, 870, '02-markup'],
  [871, 1110, '03-daten'],
  [1111, 1700, '04-kern'],
  [1701, 2300, '05-ausgabe'],
  [2301, 2900, '06-bedienung'],
  [2901, null, '07-rest'],
];

const deLines = fs.readFileSync(DE, 'utf8').split('\n');
let fehler = 0;
const teile = [];

console.log('Deutsche Quelle: ' + deLines.length + ' Zeilen');

for (const [von, bisRaw, name] of CUTS) {
  const bis = bisRaw === null ? deLines.length : bisRaw;
  const orig = path.join(FRAG, name + '.txt');
  const en = path.join(FRAG, name + '.en.txt');

  if (!fs.existsSync(en)) {
    console.error('FEHLT: ' + name + '.en.txt — noch nicht uebersetzt');
    fehler++; continue;
  }

  /* Passt das Fragment noch zur aktuellen deutschen Datei? Sonst ist die Uebersetzung gegen
     einen ueberholten Stand entstanden und wuerde eine Aenderung stillschweigend verschlucken. */
  const deTeil = deLines.slice(von - 1, bis).join('\n');
  if (fs.existsSync(orig)) {
    const fragTeil = fs.readFileSync(orig, 'utf8');
    if (fragTeil !== deTeil) {
      console.error('VERALTET: ' + name + ' — die deutsche Datei hat sich seit dem Schnitt geaendert.');
      console.error('          Neu schneiden und die Aenderung in der Uebersetzung nachziehen.');
      fehler++;
    }
  } else {
    console.error('WARNUNG: ' + name + '.txt fehlt — kann nicht pruefen, ob die Uebersetzung aktuell ist');
  }

  const enText = fs.readFileSync(en, 'utf8');
  const enZeilen = enText.split('\n').length;
  const deZeilen = bis - von + 1;
  if (enZeilen !== deZeilen) {
    console.error('ZEILENZAHL: ' + name + ' hat ' + enZeilen + ' statt ' + deZeilen +
                  ' Zeilen — das Fragment passt nicht in den Rahmen.');
    fehler++;
  }
  teile.push(enText);
  console.log('  ' + name + ': ' + enZeilen + ' Zeilen');
}

if (fehler) {
  console.error('\n' + fehler + ' Problem(e) — nichts geschrieben.');
  process.exit(1);
}

const out = teile.join('\n');
fs.writeFileSync(OUT, out, 'utf8');
console.log('\ngeschrieben ' + path.relative(REPO, OUT) + ' · ' +
            out.split('\n').length + ' Zeilen · ' + Math.round(out.length / 1024) + ' KB');
console.log('Naechster Schritt: node scripts/i18n-check.js   (sucht deutsche Textreste)');
