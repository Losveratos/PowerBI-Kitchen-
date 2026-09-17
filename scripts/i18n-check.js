#!/usr/bin/env node
/* Findet deutsche Textreste in der englischen Fassung des Rechners.
 *
 * Vorgeschichte, damit der naechste nicht denselben Weg geht: Dieses Skript war zuerst als
 * Extraktor gedacht - deutsche Strings herausziehen, uebersetzen, maschinell zurueckschreiben,
 * damit beide Fassungen zwangslaeufig synchron bleiben. Der Ansatz traegt nicht. Die Datei
 * mischt Text und Code zu eng: unter den 1.117 erkannten "Textstellen" waren Fragmente wie
 * "Bei" und ",man:", die als Teiltreffer mitten im Code zuschlagen wuerden, ganze HTML-Bloecke
 * und echter JavaScript-Code (c.npv=cf.reduce(...)). Ein Suchen-und-Ersetzen darauf zerlegt die
 * Datei. Die englische Fassung entsteht deshalb blockweise mit Kontextverstaendnis
 * (i18n/glossar.md als verbindliche Begriffsliste).
 *
 * Was bleibt, ist die Erkennungslogik: Sie taugt, um nach der Uebersetzung zu pruefen, ob
 * irgendwo deutscher Text stehen geblieben ist - der haeufigste Fehler bei zwei Sprachfassungen.
 *
 * Start:  node scripts/i18n-check.js [datei]     (Vorgabe: visual-standards-calculator.html)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const SRC = process.argv.find(a => a.endsWith('.html')) || path.join(REPO, 'visual-standards-calculator.html');
const OUT = path.join(REPO, 'i18n', 'reste.json');

/* Ein String gilt als deutscher Text, wenn er Buchstaben enthaelt und mindestens eines von
 * beidem zutrifft: ein deutsches Sonderzeichen, oder ein Wort aus der Stoppliste. Reine
 * Zahlen, IDs, CSS-Werte, Selektoren und Dateinamen fallen damit heraus. */
const UMLAUT = /[äöüÄÖÜß]/;
const DE_WORDS = /\b(der|die|das|und|oder|nicht|mit|von|für|auf|aus|ist|sind|wird|werden|kann|können|ein|eine|einen|einem|einer|dem|den|des|im|in|zu|zum|zur|bei|über|unter|nach|vor|durch|ohne|gegen|je|pro|als|wie|wenn|dann|noch|nur|auch|schon|mehr|weniger|alle|jeder|kein|keine|man|sich|ihr|euer|eure|hier|dort|damit|dafür|daran|Kosten|Jahr|Jahre|Stunden|Ansatz|Ansätze|Report|Reports|Viewer|Ersteller|Lizenz|Annahme|Annahmen|Ebene|Chart|Charts)\b/i;

const looksGerman = s => /[A-Za-zÄÖÜäöüß]{3}/.test(s) && (UMLAUT.test(s) || DE_WORDS.test(s));

/* Stellen, die NICHT uebersetzt werden duerfen: Bezeichner, Klassennamen, Schluessel. */
const SKIP_CONTEXT = [
  /^[a-z-]+$/,                       // einzelne Bezeichner
  /^#[0-9a-fA-F]{3,8}$/,             // Farben
  /^[\d.,\s%€+\-–—:/()]*$/,          // reine Zahlen und Zeichen
  /^(px|em|rem|vh|vw|auto|none|block|flex|grid)$/,
];

function extract() {
  const src = fs.readFileSync(SRC, 'utf8');
  const items = [];
  const seen = new Map();

  const add = (text, kind, ctx) => {
    const t = text.trim();
    if (!t || t.length < 2) return;
    if (SKIP_CONTEXT.some(rx => rx.test(t))) return;
    if (!looksGerman(t)) return;
    if (seen.has(t)) { seen.get(t).count++; return; }
    const it = { de: t, en: '', kind, ctx: ctx || '', count: 1 };
    seen.set(t, it);
    items.push(it);
  };

  /* 1) Textknoten im Markup (zwischen > und <), ohne Skript- und Stilbloecke */
  const body = src
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');
  (body.match(/>([^<>]+)</g) || []).forEach(m => add(m.slice(1, -1), 'markup'));

  /* 2) Attribute, die Text tragen */
  ['title', 'placeholder', 'aria-label', 'alt', 'summary', 'content'].forEach(attr => {
    const rx = new RegExp(attr + '="([^"]{2,})"', 'g');
    let m; while ((m = rx.exec(src))) add(m[1], 'attr:' + attr);
  });

  /* 3) Zeichenketten im Skript (einfache Anfuehrungszeichen, wie im File ueblich) */
  const js = (src.match(/<script[\s\S]*?<\/script>/g) || []).join('\n');
  let m;
  const sq = /'((?:[^'\\]|\\.){3,})'/g;
  while ((m = sq.exec(js))) add(m[1].replace(/\\'/g, "'"), 'js');

  /* 4) Template-Literale — nur die Textanteile zwischen den Platzhaltern */
  const tl = /`((?:[^`\\]|\\.)*)`/g;
  while ((m = tl.exec(js))) {
    m[1].split(/\$\{[^}]*\}/).forEach(part => add(part, 'template'));
  }

  items.sort((a, b) => b.count - a.count || a.de.localeCompare(b.de, 'de'));
  return items;
}

if (!fs.existsSync(SRC)) {
  console.error('Datei nicht gefunden: ' + SRC);
  console.error('Die englische Fassung entsteht blockweise; siehe i18n/glossar.md.');
  process.exit(2);
}
const items = extract();
const zeichen = items.reduce((a, i) => a + i.de.length, 0);

/* Eigennamen und bewusst deutsche Stellen (Quellenangaben, Rechtsnormen) sind keine Funde. */
const ERLAUBT = [/Daten-WG/, /ChartKitchen/, /byDatenWG/, /HGB/, /EStG/, /BetrVG/, /Betriebsrat/, /Zebra/, /Deneb/];
const funde = items.filter(i => !ERLAUBT.some(rx => rx.test(i.de)));

console.log('Geprueft: ' + path.relative(REPO, SRC));
if (!funde.length) {
  console.log('Keine deutschen Textreste gefunden.');
  process.exit(0);
}
console.log('Deutsche Textreste: ' + funde.length + ' (' + Math.round(zeichen / 1024) + ' KB)');
funde.slice(0, 40).forEach(i => console.log('  [' + i.kind + ' ' + i.count + 'x] ' + JSON.stringify(i.de.slice(0, 90))));
if (funde.length > 40) console.log('  … und ' + (funde.length - 40) + ' weitere');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(funde, null, 1), 'utf8');
console.log('vollstaendige Liste: ' + path.relative(REPO, OUT));
process.exit(1);
