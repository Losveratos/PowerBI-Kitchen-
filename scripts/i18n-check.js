#!/usr/bin/env node
/* Prueft die Zweisprachigkeit des Visual-Standards-Rechners.
 *
 * Seit November 2026 traegt visual-standards-rechner.html beide Sprachen: Deutsch steht im
 * Quelltext, Englisch im Woerterbuch I18N_EN am Anfang der Datei. Dieses Skript beantwortet die
 * drei Fragen, die man beim Lesen nicht beantworten kann:
 *
 *   1. Welche deutsche Textstelle steht NICHT in i18n(...) und bleibt damit auch englisch deutsch?
 *   2. Zu welchem i18n(...)-Aufruf fehlt der Woerterbuch-Eintrag?
 *   3. Welcher Eintrag im Woerterbuch wird nicht mehr gebraucht?
 *
 * Was es NICHT kann: das statische Markup bewerten. Dessen Texte werden zur Laufzeit gegen das
 * Woerterbuch gehalten, nicht im Quelltext. Dafuer meldet die Seite selbst, was fehlt — in
 * window.i18nFehlt, ausgewertet von tests/rechner/englische-fassung.test.js.
 *
 * Vorgeschichte, damit der naechste nicht denselben Weg geht: Dieses Skript war zuerst ein
 * Extraktor - deutsche Strings herausziehen, uebersetzen, maschinell zurueckschreiben. Das trug
 * nicht, weil eine Regex ueber eine Datei, die Text und Code so eng mischt, Fragmente wie "Bei"
 * oder ",man:" als Textstellen meldet. Die Ausrichtung gelang erst mit einem richtigen Lexer und
 * der bereits uebersetzten Schwesterdatei als Beleg (scripts/i18n_build_rechner.py).
 *
 * Start:  node scripts/i18n-check.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const SRC = process.argv.find(a => a.endsWith('.html')) || path.join(REPO, 'visual-standards-rechner.html');

/* Ein String gilt als deutscher Text, wenn er Buchstaben enthaelt und mindestens eines von
 * beidem zutrifft: ein deutsches Sonderzeichen, oder ein Wort aus der Stoppliste. Reine Zahlen,
 * IDs, CSS-Werte, Selektoren und Dateinamen fallen damit heraus. */
const UMLAUT = /[äöüÄÖÜß]/;
const DE_WORDS = /\b(der|die|das|und|oder|nicht|mit|von|für|auf|aus|ist|sind|wird|werden|kann|können|ein|eine|einen|einem|einer|dem|den|des|im|zu|zum|zur|bei|über|unter|nach|vor|durch|ohne|gegen|als|wie|wenn|dann|noch|nur|auch|schon|mehr|weniger|alle|jeder|kein|keine|man|sich|ihr|euer|eure|hier|dort|damit|dafür|daran|nichts|etwas|beim|vom|zwei|drei|vier|Kosten|Jahre|Jahren|Stunden|Ansatz|Ansätze|Annahme|Annahmen|Ebene|Ersteller|Lizenz|Nutzer|Aufwand|Auswahl|Eingabe|Ergebnis|Gesamt|Anteil|Bereich|Werte|Zahlen|Seite|Punkte)\b/;
/* Wichtig: Woerter, die in beiden Sprachen gleich lauten, duerfen hier NICHT stehen.
   Die erste Fassung fuehrte Report, Chart, Viewer und Ebene als "deutsch" - das Werkzeug meldete
   daraufhin 421 Treffer in einer sauber uebersetzten Datei, darunter "Report authors" und
   "Chart types". Ein Pruefer mit dieser Fehlalarmquote wird nicht gelesen und ist damit wertlos.
   Ebenso nicht aufnehmen: "in", "an", "so", "war", "je" - englische Wortformen kollidieren. */
const istDeutsch = s => /[A-Za-zÄÖÜäöüß]{3}/.test(s) && (UMLAUT.test(s) || DE_WORDS.test(s));

/* Eigennamen und bewusst deutsche Stellen (Quellenangaben, Rechtsnormen, Veranstaltungstitel). */
const ERLAUBT = [/Daten-WG/, /ChartKitchen/, /byDatenWG/, /HGB/, /EStG/, /UStG/, /BetrVG/, /Betriebsrat/,
                 /Zebra/, /Deneb/, /München/, /für Controlling und Finance/, /Robert Half/,
                 /Freelancer-Kompass/, /StepStone/, /^https?:\/\//];
/* Kein Text, sondern Technik: interne Schluessel ('man', 'ein'), Selektoren, Dateinamen.
   Ohne diese Liste meldet der Pruefer den Betriebsmodell-Schluessel 'man' als deutsches Wort. */
const KEIN_TEXT = [/^[a-z][a-z0-9_-]{0,4}$/, /^[#.[][\w-]/, /^[\w-]+\.(html|js|css|json|md)$/,
                   /^[\d.,\s%€+\-–—:/()]*$/];

/* Werte, die nicht als Literal im Aufruf stehen, sondern als Variable hereinkommen:
   die Herkunfts-Klassen aus SRC_CLASS, ueber dpBadge und i18n(kind) angezeigt. */
const DYNAMISCH = ['belegt', 'Faustregel', 'Meinung', 'Angebot'];

/* ---------------------------------------------------------------- Lexer ---
   Gerade so viel JavaScript, wie fuer die Unterscheidung von Code, Zeichenkette
   und Kommentar noetig ist. Eine Regex reicht hier nicht: in dieser Datei stehen
   // in URLs, Apostrophe in deutschen Saetzen und /…/ als Regex. */
function lex(src) {
  const out = [];
  let i = 0, start = 0;
  const n = src.length;
  const push = (kind, a, b) => out.push({ kind, text: src.slice(a, b), start: a, end: b });
  const prevSig = p => { let j = p - 1; while (j >= 0 && ' \t\r\n'.includes(src[j])) j--; return j >= 0 ? src[j] : '\n'; };
  while (i < n) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { push('code', start, i); let j = src.indexOf('\n', i); if (j < 0) j = n; push('lc', i, j); i = start = j; continue; }
    if (c === '/' && src[i + 1] === '*') { push('code', start, i); let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; push('bc', i, j); i = start = j; continue; }
    if (c === '/' && '(,=:[!&|?{};+-*%~^<>\n'.includes(prevSig(i))) {
      let j = i + 1, cls = false, ok = false;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '\n') break;
        if (cls) { if (d === ']') cls = false; }
        else if (d === '[') cls = true;
        else if (d === '/') { ok = true; j++; while (j < n && /[a-z]/i.test(src[j])) j++; break; }
        j++;
      }
      if (ok) { push('code', start, i); push('regex', i, j); i = start = j; continue; }
      i++; continue;
    }
    if (c === "'" || c === '"') {
      push('code', start, i);
      let j = i + 1;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === c) { j++; break; }
        if (d === '\n') break;
        j++;
      }
      push('str', i, j);
      i = start = j; continue;
    }
    if (c === '`') {
      /* Template: ${...} muss mitgelesen werden, sonst beendet ein verschachteltes
         Template im Einschub das aeussere zu frueh - und ab da stimmt kein Token mehr.
         Die Einschuebe werden gesammelt, damit der Pruefer auch dort nachsehen kann. */
      push('code', start, i);
      let j = i + 1;
      const exprs = [];
      while (j < n) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '`') { j++; break; }
        if (d === '$' && src[j + 1] === '{') {
          let depth = 1, k = j + 2;
          const von = k;
          while (k < n && depth) {
            const e = src[k];
            if (e === "'" || e === '"' || e === '`') {
              const q = e; k++;
              while (k < n) { if (src[k] === '\\') { k += 2; continue; } if (src[k] === q) { k++; break; } k++; }
              continue;
            }
            if (e === '{') depth++;
            else if (e === '}') { depth--; if (!depth) break; }
            k++;
          }
          exprs.push(src.slice(von, k));
          j = k + 1; continue;
        }
        j++;
      }
      const t = { kind: 'tmpl', text: src.slice(i, j), start: i, end: j, exprs };
      out.push(t);
      i = start = j; continue;
    }
    i++;
  }
  push('code', start, n);
  return out.filter(t => t.end > t.start);
}

/* ------------------------------------------------------------- Einlesen --- */
if (!fs.existsSync(SRC)) { console.error('Datei nicht gefunden: ' + SRC); process.exit(2); }
const html = fs.readFileSync(SRC, 'utf8');

const ANF = 'const I18N_EN=\n';
const a = html.indexOf(ANF);
if (a < 0) { console.error('Kein Woerterbuch-Block I18N_EN gefunden.'); process.exit(2); }
const b = html.indexOf(';\n</script>', a);
const dict = JSON.parse(html.slice(a + ANF.length, b));
const code = html.slice(b);           // alles hinter dem Woerterbuch: die Anwendung

const funde = { nichtEingeklammert: [], ohneEintrag: [], tot: [] };
const benutztS = new Set(DYNAMISCH), benutztC = new Set();

/* Escape-Folgen aufloesen wie JavaScript selbst: der Schluessel im Woerterbuch ist der Text,
   den i18n() zur Laufzeit sieht. Eine Kette von .replace() reicht nicht - in dieser Datei steht
   unter anderem \“ (Backslash vor einem typografischen Anfuehrungszeichen), und ein unbekanntes
   Escape ist in JavaScript schlicht das Zeichen selbst. */
const ESC = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' };
function entschluesseln(s) {
  let out = '', i = 0;
  while (i < s.length) {
    if (s[i] !== '\\') { out += s[i++]; continue; }
    const d = s[i + 1];
    if (d === 'u') {
      if (s[i + 2] === '{') { const j = s.indexOf('}', i + 3); out += String.fromCodePoint(parseInt(s.slice(i + 3, j), 16)); i = j + 1; }
      else { out += String.fromCharCode(parseInt(s.slice(i + 2, i + 6), 16)); i += 6; }
      continue;
    }
    if (d === 'x') { out += String.fromCharCode(parseInt(s.slice(i + 2, i + 4), 16)); i += 4; continue; }
    if (d === '\n') { i += 2; continue; }          /* Zeilenfortsetzung */
    out += (d in ESC) ? ESC[d] : d;
    i += 2;
  }
  return out;
}

/* Laeuft auch durch die ${...}-Einschuebe der Templates: dort steckt Text, den eine
   oberflaechliche Suche uebersieht - und genau dort sind beim Umbau Stellen liegengeblieben. */
function scan(src) {
  const toks = lex(src);
  for (const t of toks) {
    if (t.kind === 'str') {
      const text = entschluesseln(t.text.slice(1, -1));
      if (src.slice(Math.max(0, t.start - 5), t.start).endsWith('i18n(')) {
        const m = src.slice(t.end, t.end + 40).match(/^,'([A-Za-z_$][\w$]*#\d+)'\)/);
        if (m) {
          benutztC.add(m[1]);
          if (dict.c[m[1]] === undefined) funde.ohneEintrag.push(m[1] + ' | ' + text.slice(0, 70));
        } else {
          benutztS.add(text);
          if (dict.s[text] === undefined) funde.ohneEintrag.push(text.slice(0, 80));
        }
        continue;
      }
      if (!istDeutsch(text)) continue;
      if (KEIN_TEXT.some(rx => rx.test(text))) continue;
      if (ERLAUBT.some(rx => rx.test(text))) continue;
      funde.nichtEingeklammert.push(text.slice(0, 90));
      continue;
    }
    if (t.kind === 'tmpl') {
      const teile = t.text.slice(1, -1).split(/\$\{[\s\S]*?\}/);
      const deutsch = teile.find(p => istDeutsch(p) && !ERLAUBT.some(rx => rx.test(p)));
      if (deutsch && !src.slice(Math.max(0, t.start - 5), t.start).endsWith('i18nT')) {
        funde.nichtEingeklammert.push('Template: ' + deutsch.trim().slice(0, 70));
      }
      (t.exprs || []).forEach(scan);
    }
  }
}
scan(code);

for (const k of Object.keys(dict.s)) if (!benutztS.has(k)) funde.tot.push('[s] ' + k.slice(0, 70));
for (const k of Object.keys(dict.c)) if (!benutztC.has(k)) funde.tot.push('[c] ' + k);

/* ---------------------------------------------------------------- Bericht --- */
console.log('Geprueft: ' + path.relative(REPO, SRC));
console.log('Woerterbuch: ' + ['s', 'c', 't', 'h', 'm'].map(k => k + '=' + Object.keys(dict[k]).length).join('  '));
const zeig = (titel, liste, hinweis) => {
  if (!liste.length) { console.log('✓ ' + titel + ': nichts'); return; }
  console.log('• ' + titel + ': ' + liste.length + (hinweis ? '  (' + hinweis + ')' : ''));
  liste.slice(0, 25).forEach(s => console.log('    ' + JSON.stringify(s)));
  if (liste.length > 25) console.log('    … und ' + (liste.length - 25) + ' weitere');
};
zeig('deutscher Text ohne i18n(...)', funde.nichtEingeklammert, 'bleibt auch englisch deutsch');
zeig('i18n-Aufrufe ohne Woerterbuch-Eintrag', funde.ohneEintrag, 'faellt auf Deutsch zurueck');
zeig('tote Woerterbuch-Eintraege', funde.tot, 'entfernen: python scripts/i18n_clean_rechner.py --schreiben');
console.log('\nStatisches Markup prueft die Seite selbst (window.i18nFehlt), ausgewertet in');
console.log('tests/rechner/englische-fassung.test.js.');

const schlimm = funde.nichtEingeklammert.length + funde.ohneEintrag.length;
process.exit(schlimm ? 1 : 0);
