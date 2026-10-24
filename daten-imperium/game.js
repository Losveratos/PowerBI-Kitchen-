/* Daten-Imperium · Spiellogik
   Läuft komplett im Browser, Spielstand nur in localStorage. Inhalte kommen aus content.js. */
'use strict';
(() => {
const SAVE_KEY = 'datenImperium.save.v1', LANG_KEY = 'datenImperium.lang', SND_KEY = 'datenImperium.sound';
let LANG = 'de', SOUND = true;
try {
  const l = localStorage.getItem(LANG_KEY);
  LANG = l || ((navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en');
  SOUND = localStorage.getItem(SND_KEY) !== '0';
} catch (e) {}

/* ---------- Helfer ---------- */
const L = (de, en) => (LANG === 'de' ? de : en);
const t = x => (x == null ? '' : (typeof x === 'string' || typeof x === 'number') ? String(x) : (x[LANG] ?? x.de ?? ''));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const T = x => esc(t(x));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r50 = v => Math.max(50, Math.round(v / 50) * 50);
const loc = () => (LANG === 'de' ? 'de-DE' : 'en-GB');
const eur = n => new Intl.NumberFormat(loc(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
const num = n => new Intl.NumberFormat(loc()).format(Math.round(n));
const sgn = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + num(Math.abs(n));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

const MON = { de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
const MONL = { de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'], en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] };
const mLabel = (m, long) => (long ? MONL : MON)[LANG][((m % 12) + 12) % 12] + ' ' + (2027 + Math.floor(m / 12));

const CAT_KEYS = Object.keys(CATS);
const QUIZ_CATS = CAT_KEYS.filter(c => c !== 'talk');
const catChip = c => `<span class="chip cat" style="background:${CATS[c].color}">${esc(CATS[c].icon)} ${T(CATS[c])}</span>`;
const kitchenLink = c => `<a href="index.html#${CATS[c].bucket}" target="_blank" rel="noopener">${L('Mehr dazu in der Knowledge Kitchen', 'More in the Knowledge Kitchen')} ›</a>`;
const STAFF_BY = Object.fromEntries(STAFF.map(s => [s.id, s]));
const LV = [0, 60, 160, 320, 560, 900, 1400, 2000];
const level = xp => { let l = 0; while (l < LV.length - 1 && xp >= LV[l + 1]) l++; return l; };
const QN = [0, 3, 4, 5, 5];
const BASE_FEE = [0, 1600, 4000, 8000, 15000];
const BASE_DAYS = [0, 2, 4, 6, 8];
const BANKRUPT = -8000;
const GOAL = 1000000;

/* ---------- Lernkarten-Register ---------- */
const CLINIC_NAMES = {
  axis: { de: 'Säulen ab null', en: 'Columns from zero' }, rainbow: { de: 'Farbe mit Bedeutung', en: 'Color with meaning' },
  decimals: { de: 'Runden statt Rauschen', en: 'Round, do not flood' }, title: { de: 'Titel mit Aussage', en: 'Titles that say something' },
  unsorted: { de: 'Rankings sortieren', en: 'Sort rankings' }, grid: { de: 'Gitter leise stellen', en: 'Quiet gridlines' },
  legend: { de: 'Direkt beschriften', en: 'Label directly' }, shadow: { de: 'Keine Effekte', en: 'No effects' },
};
const CARDS = {};
QUIZ.forEach(q => { CARDS[q.id] = { c: q.c, h: q.q, x: q.x }; });
ORDER.forEach(o => { CARDS[o.id] = { c: o.c, h: o.title, x: o.x }; });
DIALOGS.forEach(d => {
  const best = s => s.a.reduce((m, a) => (a.s > m.s ? a : m), s.a[0]);
  CARDS[d.id] = { c: 'talk', h: { de: 'Gespräch: ' + d.who.de, en: 'Conversation: ' + d.who.en },
    x: { de: d.steps.map(s => best(s).t.de).join(' '), en: d.steps.map(s => best(s).t.en).join(' ') } };
});
Object.keys(CLINIC_ERRORS).forEach(k => { CARDS['cl-' + k] = { c: 'viz', h: CLINIC_NAMES[k], x: { de: CLINIC_ERRORS[k].de, en: CLINIC_ERRORS[k].en } }; });
FILL.forEach(f => { CARDS[f.id] = { c: 'dax', h: f.title, x: f.x }; });
PQDEBUG.forEach(p => { CARDS[p.id] = { c: 'pq', h: p.title, x: p.x }; });
Object.entries(EXTRA_CARDS).forEach(([k, v]) => { CARDS[k] = v; });
const CARD_IDS = Object.keys(CARDS);

const NEWS = [
  { c: 'model', de: 'Jede Faktentabelle braucht eine klare Granularität. Schreib sie in die Tabellenbeschreibung.', en: 'Every fact table needs a clear grain. Write it into the table description.' },
  { c: 'dax', de: 'Measures in eine eigene Measure-Tabelle mit Anzeigeordnern. Das findet auch Copilot leichter.', en: 'Put measures in a dedicated measure table with display folders. Copilot finds them more easily too.' },
  { c: 'fabric', de: 'Direct Lake liebt V-Order und wenige große Parquet-Dateien. Regelmäßig OPTIMIZE ausführen.', en: 'Direct Lake loves V-Order and few large Parquet files. Run OPTIMIZE regularly.' },
  { c: 'viz', de: 'Eine Botschaft pro Seite. Der Titel spricht sie aus.', en: 'One message per page. The title states it.' },
  { c: 'pq', de: 'Schritte in Power Query sprechend benennen. Dein zukünftiges Ich dankt dir.', en: 'Give Power Query steps meaningful names. Your future self says thanks.' },
  { c: 'gov', de: 'Workspaces nach Zweck trennen: Entwicklung, Test, Produktion. Nicht nach Personen.', en: 'Split workspaces by purpose: dev, test, prod. Not by person.' },
  { c: 'talk', de: 'Im Erstgespräch zuerst nach Entscheidungen fragen, nicht nach Diagrammen.', en: 'In a first call ask about decisions first, not about charts.' },
  { c: 'model', de: 'Datumstabelle als Datumstabelle markieren, sonst rechnet Zeitintelligenz nicht sauber.', en: 'Mark the date table as date table, or time intelligence will misbehave.' },
  { c: 'dax', de: 'DIVIDE statt Schrägstrich. Kein Fehler bei Division durch null.', en: 'DIVIDE instead of slash. No error when dividing by zero.' },
  { c: 'viz', de: 'Säulen und Balken beginnen immer bei null.', en: 'Columns and bars always start at zero.' },
];

/* ---------- Sound (Web Audio, rechteckig wie 1989) ---------- */
let AC = null;
function beep(f, d, type = 'square', v = 0.035, delay = 0) {
  if (!SOUND) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + delay;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + d + 0.02);
  } catch (e) {}
}
function sfx(k) {
  if (k === 'coin') { beep(988, 0.08); beep(1319, 0.22, 'square', 0.035, 0.08); }
  else if (k === 'ok') { beep(784, 0.07); beep(1047, 0.12, 'square', 0.03, 0.07); }
  else if (k === 'bad') { beep(196, 0.25, 'sawtooth', 0.03); }
  else if (k === 'lvl') { [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.12, 'square', 0.035, i * 0.1)); }
  else if (k === 'click') { beep(660, 0.03, 'square', 0.02); }
}

/* ---------- Zustand ---------- */
let S = null;
function newState(firm) {
  return {
    v: 1, firm, month: 0, days: 20, cash: 5000, rep: 10, speaker: 0, followers: 40, index: 100, idxHist: [100],
    xp: Object.fromEntries(CAT_KEYS.map(c => [c, 0])), office: 0, items: {}, staff: [], retainers: [], mails: [], seq: 0,
    cards: {}, posts: [], lastPost: -1, cfp: null, rivals: RIVALS.map(r => ({ n: r.n, v: r.v })), sched: [], overtime: 0,
    ledger: { jobs: 0, other: 0 }, stats: { jobs: 0, perfect: 0, earned: 0 }, won: false, over: false, seenQ: {}, seen: {},
    lastEvent: null, leads: 0, active: false,
  };
}
function save() { try { if (S) localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.v === 1 ? s : null; } catch (e) { return null; } }

const baseDays = () => 20 + (S.items.coffee ? 2 : 0) + (S.items.headset ? 1 : 0) + S.staff.reduce((a, s) => a + STAFF_BY[s].days, 0);
const coverCap = () => S.staff.reduce((a, s) => a + STAFF_BY[s].cover, 0);
const retainerSum = () => S.retainers.reduce((a, r) => a + r.monthly, 0);
function costs() {
  const rent = OFFICES[S.office].rent, living = 1620, salaries = S.staff.reduce((a, s) => a + STAFF_BY[s].salary, 0), subs = S.items.tenant ? 350 : 0;
  return { rent, living, salaries, subs, total: rent + living + salaries + subs };
}
const firmValue = () => S.cash + OFFICES.slice(0, S.office + 1).reduce((a, o) => a + o.price, 0) * 0.5 + retainerSum() * 6;
const rankOf = v => RANKS.filter(r => v >= r.v).pop() || RANKS[0];
const cardCount = () => Object.keys(S.cards).length;
function addCards(ids) { let n = 0; ids.forEach(id => { if (CARDS[id] && !S.cards[id]) { S.cards[id] = S.month + 1; n++; } }); return n; }
const leastSeen = (arr, key) => {
  const sc = shuffle(arr).map(x => ({ x, s: (S.seen[key + x.id] || 0) + Math.random() * 0.5 })).sort((a, b) => a.s - b.s)[0].x;
  S.seen[key + sc.id] = (S.seen[key + sc.id] || 0) + 1; return sc;
};

/* ---------- Mails erzeugen ---------- */
function gameFor(cat, d) {
  const r = Math.random();
  if (cat === 'model') return r < 0.55 ? 'star' : r < 0.8 ? 'quiz' : 'order';
  if (cat === 'viz') return r < 0.55 ? 'clinic' : 'quiz';
  if (cat === 'pq') return r < 0.35 ? 'pqdebug' : r < 0.55 ? 'order' : 'quiz';
  if (cat === 'fabric') return r < 0.3 ? 'order' : 'quiz';
  if (cat === 'gov') return r < 0.25 ? 'order' : 'quiz';
  if (cat === 'talk') return r < 0.75 ? 'dialog' : 'order';
  if (cat === 'dax') return r < 0.35 ? 'fill' : d >= 2 && r < 0.5 ? 'order' : 'quiz';
  return 'quiz';
}
const GAME_NAMES = {
  quiz: c => ({ dax: L('DAX-Duell', 'DAX duel'), fabric: L('Item-Entscheid', 'Item decision'), gov: L('Governance-Check', 'Governance check'), pq: L('Power-Query-Quiz', 'Power Query quiz'), viz: L('Viz-Quiz', 'Viz quiz'), model: L('Modell-Quiz', 'Model quiz') }[c] || 'Quiz'),
  star: () => L('Sternschema-Werkstatt', 'Star schema workshop'), order: () => L('Reihenfolge-Puzzle', 'Sequence puzzle'),
  clinic: () => L('Chart-Klinik', 'Chart clinic'), dialog: () => L('Kundengespräch', 'Client conversation'),
  fill: () => L('DAX-Lückentext', 'DAX fill-in-the-blank'), pqdebug: () => L('Power-Query-Debugging', 'Power Query debugging'),
};
function genJob(forceCat, forceD, forceGame) {
  const cat = forceCat || pick(CAT_KEYS);
  const lv = level(S.xp[cat]);
  const maxD = clamp(lv + 1 + (Math.random() < 0.3 ? 1 : 0), 1, 4);
  const d = forceD || rnd(Math.max(1, maxD - 2), maxD);
  const cl = pick(CLIENTS), size = SIZES[cl.s];
  const reach = 1 + Math.min(0.3, S.followers / 5000);
  const fee = r50(BASE_FEE[d] * size.m * (S.index / 100) * (1 + S.rep / 400) * reach * (0.85 + Math.random() * 0.3) * (cat === 'fabric' && S.items.tenant ? 1.15 : 1));
  return { id: ++S.seq, kind: 'job', from: cl.n, size: cl.s, cat, d, fee, days: BASE_DAYS[d] + rnd(0, 1), game: forceGame || gameFor(cat, d),
    subj: pick(SUBJECTS[cat]), body: BODIES[cat], exp: S.month + rnd(1, 2), read: false };
}
function genTender() {
  const cl = pick(CLIENTS.filter(c => c.s !== 'start'));
  const p = { reports: rnd(3, 12), sources: rnd(1, 4), rls: Math.random() < 0.5, training: Math.random() < 0.5 };
  p.true = Math.round((p.reports * 1.25 + p.sources * 2 + (p.rls ? 3 : 0) + (p.training ? 2 : 0)) * 1.2);
  return { id: ++S.seq, kind: 'tender', from: cl.n, size: cl.s, cat: 'talk', subj: { de: 'Ausschreibung: Berichtsmigration nach Power BI', en: 'Tender: report migration to Power BI' }, p, exp: S.month + 1, read: false };
}
function genCfp() {
  const conf = pick(CONFS);
  return { id: ++S.seq, kind: 'cfp', from: conf, cat: 'talk', conf, subj: { de: 'Call for Speakers: ' + conf, en: 'Call for speakers: ' + conf }, exp: S.month + 1, read: false };
}
function genPhish() {
  return { id: ++S.seq, kind: 'phish', from: 'security@fabrlc-cloud-support.example', cat: 'gov', subj: { de: 'DRINGEND: Ihr Tenant wird in 24 h gelöscht!', en: 'URGENT: your tenant will be deleted in 24 h!' }, exp: S.month + 1, read: false };
}
function genNews() {
  const n = pick(NEWS);
  return { id: ++S.seq, kind: 'info', from: 'Daten-WG Knowledge Kitchen', cat: n.c, subj: { de: 'Kitchen-Newsletter: Tipp des Monats', en: 'Kitchen newsletter: tip of the month' },
    body: { de: 'Hallo aus der Daten-WG!\n\n' + n.de + '\n\nMehr Folgen und Lernpfade findest du in der Knowledge Kitchen.', en: 'Hello from the Daten-WG!\n\n' + n.en + '\n\nMore episodes and learning paths are waiting in the Knowledge Kitchen.' }, exp: S.month + 2, read: false, xp: 5 };
}
function genIncident(r) {
  return { id: ++S.seq, kind: 'incident', from: r.from, cat: 'gov', rid: r.id, fee: r50(400 + r.monthly * 0.3), days: 1,
    subj: { de: 'NOTFALL: Bei uns ist alles rot!', en: 'EMERGENCY: everything is red here!' }, exp: S.month, read: false };
}
function newMails(extra = 0) {
  const n = clamp(4 + Math.floor(S.followers / 300) + S.office + Math.ceil(S.staff.length / 2) + S.leads + extra, 3, 16);
  S.leads = 0;
  let jobs = 0;
  const hasCfp = S.cfp || S.mails.some(m => m.kind === 'cfp' || m.kind === 'talk');
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    if (i >= 2 && r < 0.12 && S.month >= 1) S.mails.push(genTender());
    else if (i >= 2 && r < 0.2 && !hasCfp && S.month >= 1 && !S.mails.some(m => m.kind === 'cfp')) S.mails.push(genCfp());
    else if (i >= 2 && r < 0.25 && S.month >= 2) S.mails.push(genPhish());
    else if (i >= 2 && r < 0.31) S.mails.push(genNews());
    else { S.mails.push(genJob()); jobs++; }
  }
  if (!S.mails.some(m => m.kind === 'job' && level(S.xp[m.cat]) >= m.d - 1)) S.mails.push(genJob(null, 1));
  const jobsOld = S.mails.filter(m => m.kind === 'job').sort((a, b) => a.id - b.id);
  while (S.mails.length > 24 && jobsOld.length) { const old = jobsOld.shift(); S.mails = S.mails.filter(m => m !== old); }
}

/* ---------- Rendering: Titel ---------- */
const root = $('#root'), modal = $('#modal'), winTitle = $('#win-title'), winBody = $('#win-body'), winX = $('#win-x');
document.documentElement.lang = LANG;

function setLang(l) { LANG = l; try { localStorage.setItem(LANG_KEY, l); } catch (e) {} document.documentElement.lang = l; }

function renderTitle() {
  const saved = load();
  closeWin(true);
  root.innerHTML = `
  <div class="title-screen">
    <div class="big-logo">${L('DATEN-<br>IMPERIUM', 'DATA<br>EMPIRE')}</div>
    <div class="tag">${L('Ein Wirtschaftsspiel für Daten-Nerds', 'A business game for data nerds')}<br>byDatenWG · Knowledge Kitchen</div>
    <div class="title-card">
      <p>${L('Köln, Januar 2027. Du sitzt in der WG-Küche, der Laptop steht neben dem Herd, auf dem Konto liegen 5.000 €. Kunden schreiben dir Mails. Löse ihre Aufgaben in Minispielen zu DAX, Sternschema, Fabric, Power Query, Governance und Visualisierung, kassiere Honorare und kauf dir davon Ausstattung, Team und größere Büros.',
        'Cologne, January 2027. You sit in a shared-flat kitchen, laptop next to the stove, €5,000 in the bank. Clients send you emails. Solve their problems in mini games about DAX, star schemas, Fabric, Power Query, governance and visualization, collect fees and buy gear, staff and bigger offices.')}</p>
      <p><b>${L('Ziel', 'Goal')}:</b> ${L('1 Mio. € Firmenwert. Unter −8.000 € auf dem Konto ist das Spiel vorbei.', '€1M company value. Below −€8,000 in the bank the game is over.')}</p>
      <label for="firm">${L('NAME DEINER FIRMA', 'YOUR COMPANY NAME')}</label>
      <input id="firm" maxlength="32" value="${esc(saved ? saved.firm : L('Küchentisch Consulting', 'Kitchen Table Consulting'))}">
      <div class="row">
        <button class="btn pri" id="go-new">▶ ${L('Neues Spiel', 'New game')}</button>
        ${saved ? `<button class="btn ok" id="go-load">↻ ${L('Weiterspielen', 'Continue')} · ${esc(saved.firm)} · ${esc(mLabel(saved.month))}</button>` : ''}
        <button class="btn" id="go-lang">${LANG === 'de' ? 'English' : 'Deutsch'}</button>
      </div>
      <p class="muted" style="margin-top:14px;font-size:13px">${L('Gespeichert wird nur in diesem Browser. Keine Anmeldung, keine Tracker.', 'Progress is stored in this browser only. No sign-in, no trackers.')}</p>
    </div>
    <p class="tag blink" style="margin-top:26px">${L('PRESS START', 'PRESS START')}</p>
    <div class="foot"><a href="index.html">Daten-WG Knowledge Kitchen</a> · <a href="datenschutz.html">${L('Datenschutz', 'Privacy')}</a> · <a href="impressum.html">${L('Impressum', 'Imprint')}</a></div>
  </div>`;
  $('#go-new').onclick = () => {
    const firm = ($('#firm').value || '').trim() || L('Küchentisch Consulting', 'Kitchen Table Consulting');
    if (saved && !confirmNew()) return;
    S = newState(firm); startMails(); save(); sfx('lvl'); renderMain(); showIntro();
  };
  if (saved) $('#go-load').onclick = () => { S = saved; S.active = false; renderMain(); };
  $('#go-lang').onclick = () => { setLang(LANG === 'de' ? 'en' : 'de'); renderTitle(); };
}
let newConfirmed = false;
function confirmNew() {
  if (newConfirmed) return true;
  const b = $('#go-new'); b.textContent = L('▶ Sicher? Alter Spielstand wird überschrieben', '▶ Sure? Old save gets overwritten');
  newConfirmed = true; return false;
}
function startMails() {
  S.mails.push({ id: ++S.seq, kind: 'info', from: 'Daten-WG', cat: 'talk', exp: S.month + 3, read: false, xp: 0, pin: true,
    subj: { de: 'Willkommen im Daten-Business!', en: 'Welcome to the data business!' },
    body: { de: 'Hallo Kitchen-Gründer:in,\n\nwir haben dir die ersten Anfragen aus der Community weitergeleitet. So läuft es:\n\n1. Mail öffnen, Auftrag annehmen. Das kostet Arbeitstage.\n2. Minispiel lösen. Je besser, desto mehr Honorar, Reputation und Erfahrung.\n3. Vom Geld Ausstattung, Team und Büros kaufen (Tür links).\n4. Ab und zu posten (Smartphone) und auf Konferenzen sprechen. Das bringt Netzwerk und Speaker-Punkte, und damit bessere Aufträge.\n5. Kalender anklicken, um den Monat abzuschließen. Dann kommen Miete, Gehälter und die Daten-Zeitung.\n\nJede gelöste Aufgabe schenkt dir Lernkarten für deine Kitchen-Bibliothek im Regal.\n\nViel Erfolg!\nDeine Daten-WG',
      en: 'Hello kitchen founder,\n\nwe forwarded the first requests from the community. Here is how it works:\n\n1. Open a mail, accept the job. That costs work days.\n2. Solve the mini game. The better you do, the more fee, reputation and experience.\n3. Spend money on gear, staff and offices (door on the left).\n4. Post now and then (smartphone) and speak at conferences. That grows your network and speaker points, which bring better jobs.\n5. Click the calendar to close the month. Then rent, salaries and the Data Gazette arrive.\n\nEvery solved task gives you learning cards for your kitchen library on the shelf.\n\nGood luck!\nYour Daten-WG' } });
  S.mails.push(genJob('dax', 1, 'quiz'));
  S.mails.push(genJob('model', 1, 'star'));
  S.mails.push(genJob('viz', 1, 'clinic'));
  S.mails.push(genJob('fabric', 1, 'quiz'));
  S.mails.push(genJob('talk', 1, 'dialog'));
}
function showIntro() {
  openWin(L('Willkommen', 'Welcome'), `
    <h3>${esc(S.firm)}</h3>
    <p>${L('Dein Büro ist gerade noch die WG-Küche. Alles im Bild ist anklickbar:', 'Your office is still the shared kitchen. Everything in the picture is clickable:')}</p>
    <ul style="margin:0 0 14px 20px">
      <li>${L('<b>Monitor</b>: Posteingang mit Aufträgen', '<b>Monitor</b>: inbox with jobs')}</li>
      <li>${L('<b>Telefon</b>: Betriebsverträge und Team', '<b>Phone</b>: retainer contracts and team')}</li>
      <li>${L('<b>Whiteboard</b>: Skills und Weiterbildung', '<b>Whiteboard</b>: skills and training')}</li>
      <li>${L('<b>Regal</b>: Kitchen-Bibliothek mit deinen Lernkarten', '<b>Shelf</b>: kitchen library with your learning cards')}</li>
      <li>${L('<b>Tür</b>: Stadt und Shop', '<b>Door</b>: town and shop')}</li>
      <li>${L('<b>Fenster</b>: Markt, Tagessatz-Index und Rivalen', '<b>Window</b>: market, day-rate index and rivals')}</li>
      <li>${L('<b>Smartphone</b>: Posten für mehr Netzwerk', '<b>Smartphone</b>: post to grow your network')}</li>
      <li>${L('<b>Kalender</b>: Monat abschließen', '<b>Calendar</b>: close the month')}</li>
    </ul>
    <button class="btn pri full" id="go-inbox">📧 ${L('Posteingang öffnen', 'Open inbox')}</button>`);
  $('#go-inbox').onclick = () => openInbox();
}

/* ---------- Rendering: Hauptbildschirm ---------- */
const ACTS = [
  { id: 'inbox', ico: '📧', de: 'Posteingang', en: 'Inbox' },
  { id: 'phone', ico: '☎️', de: 'Verträge & Team', en: 'Contracts & team' },
  { id: 'skills', ico: '📋', de: 'Whiteboard', en: 'Whiteboard' },
  { id: 'library', ico: '📚', de: 'Bibliothek', en: 'Library' },
  { id: 'shop', ico: '🛒', de: 'Stadt & Shop', en: 'Town & shop' },
  { id: 'post', ico: '📱', de: 'Posten', en: 'Post' },
  { id: 'market', ico: '📈', de: 'Markt', en: 'Market' },
  { id: 'month', ico: '📅', de: 'Monat beenden', en: 'End month', cls: 'end' },
];
function actSub(id) {
  const unread = S.mails.filter(m => !m.read).length;
  switch (id) {
    case 'inbox': return L(`${S.mails.length} Mails, ${unread} neu`, `${S.mails.length} mails, ${unread} new`);
    case 'phone': return L(`${S.retainers.length} Verträge · ${eur(retainerSum())}/M`, `${S.retainers.length} contracts · ${eur(retainerSum())}/mo`);
    case 'skills': return L('Skills & Training', 'Skills & training');
    case 'library': return L(`${cardCount()}/${CARD_IDS.length} Lernkarten`, `${cardCount()}/${CARD_IDS.length} cards`);
    case 'shop': return L('Ausstattung, Team, Büro', 'Gear, staff, office');
    case 'post': return S.month - S.lastPost > 1 ? L('Netzwerk wartet!', 'Network is waiting!') : L(`${num(S.followers)} Follower`, `${num(S.followers)} followers`);
    case 'market': return L(`Index ${Math.round(S.index)}`, `Index ${Math.round(S.index)}`);
    case 'month': return L(`${S.days} Tage übrig`, `${S.days} days left`);
  }
  return '';
}
function spark(h, w = 46, ht = 14, stroke = '#FFC94D') {
  const a = h.slice(-18); if (a.length < 2) a.unshift(a[0]);
  const mn = Math.min(...a) - 2, mx = Math.max(...a) + 2;
  const pts = a.map((v, i) => `${(i / (a.length - 1) * w).toFixed(1)},${(ht - (v - mn) / (mx - mn) * ht).toFixed(1)}`).join(' ');
  return `<svg width="${w}" height="${ht}" viewBox="0 0 ${w} ${ht}" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${stroke}" stroke-width="1.5"/></svg>`;
}
function hud() {
  return `<header class="hud">
    <div class="logo">${L('DATEN-IMPERIUM', 'DATA EMPIRE')}<small>${esc(S.firm)} · ${esc(rankOf(firmValue())[LANG])}</small></div>
    <div class="stats">
      <div class="stat"><span class="k">${L('MONAT', 'MONTH')}</span><span class="v">${esc(mLabel(S.month))}</span></div>
      <div class="stat"><span class="k">${L('TAGE', 'DAYS')}</span><span class="v">${S.days}</span></div>
      <div class="stat cash ${S.cash < 0 ? 'neg' : ''}"><span class="k">${L('KASSE', 'CASH')}</span><span class="v">${eur(S.cash)}</span></div>
      <div class="stat" title="${L('Reputation', 'Reputation')}"><span class="k">${L('RUF', 'REP')}</span><span class="v">★ ${S.rep}</span></div>
      <div class="stat" title="${L('Speaker-Punkte', 'Speaker points')}"><span class="k">SPEAKER</span><span class="v">🎤 ${S.speaker}</span></div>
      <div class="stat" title="${L('Netzwerk', 'Network')}"><span class="k">${L('NETZ', 'NET')}</span><span class="v">${num(S.followers)}</span></div>
      <div class="stat" title="${L('Tagessatz-Index', 'Day-rate index')}"><span class="k">INDEX</span>${spark(S.idxHist)}<span class="v">${Math.round(S.index)}</span></div>
    </div>
    <div class="hud-btns">
      <button class="hbtn" id="h-lang" aria-label="Language">${LANG === 'de' ? 'EN' : 'DE'}</button>
      <button class="hbtn" id="h-snd" aria-label="Sound">${SOUND ? '♪' : '×'}</button>
      <button class="hbtn" id="h-menu">${L('MENÜ', 'MENU')}</button>
    </div>
  </header>`;
}
function ticker() {
  const d = S.idxHist.length > 1 ? S.index - S.idxHist[S.idxHist.length - 2] : 0;
  const top = S.rivals.slice().sort((a, b) => b.v - a.v)[0];
  const parts = [
    L(`Tagessatz-Index ${Math.round(S.index)} (${sgn(d)})`, `Day-rate index ${Math.round(S.index)} (${sgn(d)})`),
    L(`${top.n} meldet ${eur(top.v)} Firmenwert`, `${top.n} reports ${eur(top.v)} company value`),
    ...shuffle(NEWS).slice(0, 3).map(n => L('Tipp: ', 'Tip: ') + n[LANG]),
    L(`${S.firm}: ${eur(firmValue())} Firmenwert`, `${S.firm}: ${eur(firmValue())} company value`),
  ];
  return `<div class="ticker" aria-hidden="true"><span>+++ ${parts.map(esc).join(' +++ ')} +++</span></div>`;
}
function renderMain() {
  if (!S) return renderTitle();
  root.innerHTML = hud() + `<main id="game">
    <div class="scene-wrap">${sceneSVG()}<div class="scene-tip" id="tip"></div></div>
    <nav class="actions" aria-label="${L('Aktionen', 'Actions')}">
      ${ACTS.map(a => {
        const badge = a.id === 'inbox' ? S.mails.filter(m => !m.read).length : a.id === 'post' && S.month - S.lastPost > 1 ? '!' : 0;
        return `<button class="abtn ${a.cls || ''}" data-act="${a.id}"><span class="ico" aria-hidden="true">${a.ico}</span><span class="lbl">${a[LANG]}</span><span class="sub">${esc(actSub(a.id))}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</button>`;
      }).join('')}
    </nav>
    ${ticker()}
    <div class="foot">${L('Daten-Imperium ist ein Lernspiel der', 'Data Empire is a learning game by the')} <a href="index.html">Daten-WG Knowledge Kitchen</a> · ${L('Inspiriert von Wirtschaftssimulationen der 80er', 'Inspired by 1980s business sims')}</div>
  </main>`;
  $$('[data-act]').forEach(b => { b.onclick = () => { sfx('click'); openAct(b.dataset.act); }; });
  const tip = $('#tip');
  $$('#scene .hot').forEach(h => {
    const go = () => { sfx('click'); openAct(h.dataset.act); };
    h.addEventListener('click', go);
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    h.addEventListener('mouseenter', () => { tip.textContent = h.getAttribute('aria-label'); tip.classList.add('on'); });
    h.addEventListener('focus', () => { tip.textContent = h.getAttribute('aria-label'); tip.classList.add('on'); });
    h.addEventListener('mouseleave', () => tip.classList.remove('on'));
    h.addEventListener('blur', () => tip.classList.remove('on'));
  });
  $('#h-lang').onclick = () => { setLang(LANG === 'de' ? 'en' : 'de'); if (!S.active) closeWin(true); renderMain(); };
  $('#h-snd').onclick = () => { SOUND = !SOUND; try { localStorage.setItem(SND_KEY, SOUND ? '1' : '0'); } catch (e) {} renderMain(); };
  $('#h-menu').onclick = () => openMenu();
}
function openAct(id) {
  if (S.active) return;
  if (S.over) return showOver();
  ({ inbox: openInbox, phone: openPhone, skills: openSkills, library: openLibrary, shop: openShop, post: openPost, market: openMarket, month: askEndMonth })[id]();
}

/* ---------- Pixel-Büro (SVG) ---------- */
const R = (x, y, w, h, f, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${ex}/>`;
function dom(x, by, k, c = '#4B5563') {
  const tw = Math.max(2, Math.round(5 * k)), th = Math.round(34 * k), gap = Math.round(6 * k);
  const x2 = x + tw + gap;
  return R(x, by - th, tw, th, c) + R(x2, by - th, tw, th, c) +
    `<polygon points="${x},${by - th} ${x + tw / 2},${by - th - 11 * k} ${x + tw},${by - th}" fill="${c}"/>` +
    `<polygon points="${x2},${by - th} ${x2 + tw / 2},${by - th - 11 * k} ${x2 + tw},${by - th}" fill="${c}"/>` +
    R(x + tw, by - Math.round(15 * k), gap, Math.round(15 * k), c) + R(x2 + tw, by - Math.round(13 * k), Math.round(24 * k), Math.round(13 * k), c);
}
function windowView(x, y, w, h, lv) {
  let s = R(x, y, w, h, lv === 4 ? '#7DB0EE' : '#9ED2FF') + R(x + w - 22, y + 6, 9, 9, '#FFE27A');
  s += R(x + 8, y + 10, 18, 4, '#fff') + R(x + 12, y + 7, 10, 3, '#fff') + R(x + 48, y + 18, 22, 4, '#fff') + R(x + 53, y + 15, 12, 3, '#fff');
  const by = y + h;
  if (lv <= 1) {
    s += dom(x + 54, by - 22, 0.55, '#6B7480');
    s += R(x, by - 24, w, 24, '#B86A4C');
    for (let i = 0; i < w; i += 14) s += R(x + i, by - 28, 9, 4, '#9E553A');
    s += R(x + 20, by - 40, 2, 16, '#555') + R(x + 15, by - 38, 12, 1, '#555') + R(x + 76, by - 36, 7, 12, '#8A8A8A');
    if (lv === 1) s += R(x + 34, by - 46, 18, 22, '#A9AFB9') + R(x + 37, by - 43, 4, 4, '#E7F0FA') + R(x + 44, by - 43, 4, 4, '#E7F0FA');
  } else if (lv === 2) {
    s += dom(x + 46, by - 14, 1);
    const cols = ['#D9A066', '#C7785A', '#E3C38E', '#B9876A', '#D49A7A'];
    for (let i = 0; i < 5; i++) { s += R(x + i * 21, by - 20 - (i % 2) * 6, 20, 20 + (i % 2) * 6, cols[i]); s += R(x + i * 21 + 4, by - 15 - (i % 2) * 6, 4, 5, '#5B7FA6') + R(x + i * 21 + 12, by - 15 - (i % 2) * 6, 4, 5, '#5B7FA6'); }
  } else if (lv === 3) {
    s += dom(x + 40, by - 20, 1.25);
    s += R(x, by - 20, w, 4, '#7E8C64') + R(x, by - 16, w, 16, '#3A78B5');
    for (let i = 0; i < 4; i++) s += R(x + 6 + i * 26, by - 24, 20, 2, '#3C3C3C') + R(x + 6 + i * 26, by - 22, 2, 8, '#3C3C3C') + R(x + 24 + i * 26, by - 22, 2, 8, '#3C3C3C');
    s += R(x + 10, by - 9, 14, 2, '#D9E8F5') + R(x + 60, by - 6, 18, 2, '#D9E8F5');
  } else {
    s += R(x, by - 10, w, 10, '#6E86A6');
    for (let i = 0; i < w; i += 6) s += R(x + i, by - 10 - (i * 7 % 6), 4, (i * 7 % 6) + 1, '#556B8A');
    s += dom(x + 50, by - 9, 0.35, '#3D4C63');
    s += R(x + 4, y + 30, 30, 6, '#fff') + R(x + 64, y + 38, 34, 6, '#fff') + R(x + 70, y + 34, 18, 4, '#fff');
  }
  return s;
}
function sceneSVG() {
  const lv = S.office;
  const walls = ['#E9DFC6', '#C7CCD6', '#E8D5AE', '#A5523A', '#1E2747'];
  const floors = ['#8A5A3C', '#5A606E', '#9A683F', '#4A3A30', '#2C2C38'];
  const lines = ['#76492F', '#4E5360', '#875A35', '#3C2F27', '#24242E'];
  let s = R(0, 0, 320, 132, walls[lv]);
  if (lv === 0) { s += R(0, 76, 320, 56, '#D7E7DA'); for (let y = 76; y < 132; y += 8) s += R(0, y, 320, 1, '#B8CDBD'); for (let x = 0; x < 320; x += 8) s += R(x, 76, 1, 56, '#B8CDBD'); }
  if (lv === 1) s += R(0, 98, 320, 2, '#B3B8C3') + R(0, 0, 320, 6, '#9DA3AE');
  if (lv === 2) s += R(0, 9, 320, 3, '#F6E9CC') + R(0, 76, 320, 2, '#D2BB8E');
  if (lv === 3) for (let y = 7; y < 132; y += 7) { s += R(0, y, 320, 1, '#8C4330'); for (let x = (y / 7) % 2 ? 0 : 9; x < 320; x += 18) s += R(x, y - 6, 1, 6, '#8C4330'); }
  if (lv === 4) for (let x = 0; x < 320; x += 40) s += R(x, 0, 1, 132, '#2A3560');
  s += R(0, 132, 320, 48, floors[lv]) + R(0, 132, 320, 2, lines[lv]);
  for (let y = 142; y < 180; y += 9) s += R(0, y, 320, 1, lines[lv]);
  // Fenster
  const fx = 204, fy = 14, fw = 104, fh = 70, fr = lv === 4 ? '#9AA3B8' : '#3B2A20';
  s += R(fx - 3, fy - 3, fw + 6, fh + 6, fr) + windowView(fx, fy, fw, fh, lv) + R(fx + fw / 2 - 1, fy, 2, fh, fr) + R(fx, fy + fh / 2 - 1, fw, 2, fr) + R(fx - 6, fy + fh + 3, fw + 12, 4, lv === 4 ? '#7C8599' : '#5A4030');
  if (S.items.tenant) s += R(fx + 4, fy + 4, 16, 9, '#2F8A4A') + `<text x="${fx + 6}" y="${fy + 11}" font-size="5" fill="#fff">F2</text>`;
  // Whiteboard mit Skill-Balken
  s += R(48, 14, 68, 48, '#7A7A7A') + R(50, 16, 64, 44, '#FDFDFB') + `<text x="53" y="23" font-size="4.5" fill="#333">SKILLS</text>`;
  CAT_KEYS.forEach((c, i) => { const l = level(S.xp[c]); s += R(53, 26 + i * 4.6, 3, 3, CATS[c].color) + R(58, 26 + i * 4.6, Math.max(1, l * 7.4), 3, CATS[c].color); });
  s += R(48, 62, 68, 2, '#7A7A7A');
  // ChartKitchen-Poster
  s += R(54, 70, 30, 38, '#0F1E2E') + R(58, 96, 4, 8, '#C25A2D') + R(64, 90, 4, 14, '#C25A2D') + R(70, 84, 4, 20, '#FFC94D') + R(76, 92, 4, 12, '#C25A2D') + `<text x="57" y="79" font-size="4" fill="#fff">CHART</text><text x="57" y="84" font-size="3.4" fill="#FFC94D">KITCHEN</text>`;
  // Kalender
  s += R(164, 14, 34, 38, '#fff') + R(164, 14, 34, 9, '#C2362F') + R(164, 52, 34, 1, '#999');
  s += `<text x="181" y="21" font-size="5" fill="#fff" text-anchor="middle">${esc(MON[LANG][S.month % 12].toUpperCase())}</text>`;
  s += `<text x="181" y="38" font-size="11" fill="#222" text-anchor="middle">${S.days}</text><text x="181" y="47" font-size="3.6" fill="#666" text-anchor="middle">${L('TAGE', 'DAYS')}</text>`;
  // Tür
  s += R(6, 38, 40, 94, '#4E3020') + R(9, 41, 34, 91, '#80522F') + R(13, 46, 26, 34, '#73492A') + R(13, 86, 26, 40, '#73492A') + R(36, 88, 3, 3, '#E8C25A');
  s += R(10, 28, 32, 8, '#000') + `<text x="26" y="34.5" font-size="5" fill="#FFC94D" text-anchor="middle">SHOP</text>`;
  // Regal mit Lernkarten als Bücher
  s += R(118, 24, 44, 7, '#C25A2D') + `<text x="140" y="29.5" font-size="4" fill="#fff" text-anchor="middle">KITCHEN</text>`;
  s += R(120, 31, 40, 101, '#5E3B22') + R(122, 33, 36, 97, '#7A5133');
  [56, 80, 104].forEach(y => { s += R(122, y, 36, 2, '#5E3B22'); });
  const nb = Math.min(cardCount(), 36), bases = [56, 80, 104, 130], cc = CAT_KEYS.map(c => CATS[c].color);
  for (let i = 0; i < nb; i++) { const row = Math.floor(i / 9), col = i % 9, hgt = 12 + (i * 7) % 7; s += R(123 + col * 4, bases[row] - hgt, 3, hgt, cc[i % cc.length]); }
  // Küchenzeile / Herd (WG) oder Sideboard
  if (lv === 0) s += R(84, 98, 30, 34, '#F2F2F2') + R(84, 96, 30, 3, '#333') + R(88, 108, 22, 14, '#3A3A3A') + R(90, 110, 18, 2, '#6A6A6A');
  else s += R(84, 104, 30, 28, '#8E8E8E') + R(86, 106, 12, 24, '#A3A3A3') + R(100, 106, 12, 24, '#A3A3A3');
  const top = lv === 0 ? 96 : 104;
  if (S.items.coffee) s += R(88, top - 14, 12, 14, '#2A2A2A') + R(91, top - 10, 6, 3, '#C25A2D') + R(102, top - 5, 5, 5, '#fff');
  else s += R(92, top - 8, 14, 8, '#C2362F') + R(89, top - 7, 3, 2, '#333') + R(106, top - 7, 3, 2, '#333');
  if (lv >= 1) s += R(300, 118, 14, 14, '#B5654A') + R(302, 102, 4, 16, '#2F8A4A') + R(308, 98, 4, 20, '#3FA35A') + R(296, 108, 6, 4, '#3FA35A') + R(310, 110, 6, 4, '#2F8A4A');
  // Team auf dem Boden
  const skin = ['#E8B98F', '#C68C5E', '#F1C9A5', '#8D5A3B'], hair = ['#3B2A20', '#E0C068', '#1E1E1E', '#A0522D'], shirt = ['#2BB3A3', '#4D8BFF', '#8C6BFF', '#2F8A4A', '#C9952B', '#C2362F'];
  S.staff.slice(0, 12).forEach((_, i) => {
    const x = 54 + (i % 6) * 23, y = i < 6 ? 146 : 162;
    s += R(x + 2, y - 1, 6, 2, hair[i % 4]) + R(x + 2, y + 1, 6, 5, skin[(i + 1) % 4]) + R(x, y + 6, 10, 8, shirt[i % 6]) + R(x - 4, y + 10, 9, 5, '#444') + R(x - 3, y + 6, 7, 4, '#7FD1FF');
  });
  // Schreibtisch
  s += R(150, 112, 154, 6, '#7A4E2E') + R(150, 118, 154, 2, '#5E3B22') + R(154, 120, 5, 12, '#5E3B22') + R(296, 120, 5, 12, '#5E3B22');
  if (S.items.tenant) s += R(268, 118, 14, 14, '#222') + R(270, 121, 10, 1, '#555') + R(270, 124, 10, 1, '#555') + R(278, 128, 2, 2, '#4CC46F');
  // Monitor
  const unread = S.mails.filter(m => !m.read).length;
  s += R(188, 74, 54, 32, '#1B1B1B') + R(191, 77, 48, 25, unread ? '#2D7FC1' : '#1F5F92') + R(205, 83, 20, 13, '#fff');
  s += `<polyline points="205,83 215,90 225,83" fill="none" stroke="#2D7FC1" stroke-width="1"/>` + R(211, 106, 8, 6, '#222') + R(205, 110, 20, 2, '#222');
  if (unread) s += R(232, 68, 14, 10, '#C2362F') + `<text x="239" y="75.5" font-size="5" fill="#fff" text-anchor="middle">${Math.min(unread, 9)}</text>`;
  if (S.items.monitor) s += R(246, 82, 34, 24, '#1B1B1B') + R(248, 84, 30, 20, '#20303F') + R(251, 96, 4, 6, '#C25A2D') + R(257, 92, 4, 10, '#FFC94D') + R(263, 89, 4, 13, '#2BB3A3') + R(269, 94, 4, 8, '#C25A2D') + R(260, 106, 6, 6, '#222');
  if (S.items.headset) s += R(236, 71, 10, 2, '#333') + R(235, 72, 2, 6, '#333') + R(245, 72, 2, 6, '#333');
  // Telefon
  s += R(156, 106, 18, 6, '#222') + R(154, 102, 22, 4, '#3A3A3A') + R(158, 108, 2, 2, '#888') + R(162, 108, 2, 2, '#888') + R(166, 108, 2, 2, '#888');
  if (S.retainers.length) s += R(168, 94, 12, 8, '#2F8A4A') + `<text x="174" y="100" font-size="4.5" fill="#fff" text-anchor="middle">${Math.min(S.retainers.length, 99)}</text>`;
  if (S.items.mic) s += R(181, 98, 2, 14, '#444') + R(179, 92, 6, 8, '#6A6A6A') + R(178, 110, 8, 2, '#444');
  if (S.items.ring) s += `<circle cx="176" cy="66" r="7" fill="none" stroke="#FFF7D6" stroke-width="2.5"/>` + R(175, 73, 2, 21, '#555');
  // Smartphone
  s += R(286, 104, 8, 8, '#111') + R(287, 105, 6, 5, S.month - S.lastPost > 1 ? '#FFC94D' : '#7FD1FF');
  // Stuhl + Spieler:in (Rückenansicht)
  s += R(206, 116, 30, 18, '#2B2B2B') + R(202, 132, 38, 4, '#2B2B2B') + R(219, 136, 4, 8, '#222') + R(208, 144, 26, 3, '#222');
  s += R(213, 101, 16, 12, '#3B2A20') + R(211, 105, 2, 4, '#E8B98F') + R(229, 105, 2, 4, '#E8B98F') + R(209, 113, 24, 16, '#C25A2D') + R(219, 113, 4, 4, '#FFE2D2');
  // Hotspots
  const HOT = [
    ['shop', 4, 26, 44, 108, L('Tür: Stadt & Shop', 'Door: town & shop')],
    ['skills', 46, 12, 72, 54, L('Whiteboard: Skills & Training', 'Whiteboard: skills & training')],
    ['library', 116, 22, 48, 112, L('Regal: Kitchen-Bibliothek', 'Shelf: kitchen library')],
    ['month', 162, 12, 38, 42, L('Kalender: Monat beenden', 'Calendar: end month')],
    ['market', 198, 9, 116, 82, L('Fenster: Markt & Rivalen', 'Window: market & rivals')],
    ['inbox', 186, 66, 62, 48, L('Monitor: Posteingang', 'Monitor: inbox')],
    ['phone', 150, 92, 34, 22, L('Telefon: Verträge & Team', 'Phone: contracts & team')],
    ['post', 282, 98, 18, 18, L('Smartphone: Posten', 'Smartphone: post')],
  ];
  s += HOT.map(([id, x, y, w, h, lab]) => `<rect class="hot" data-act="${id}" x="${x}" y="${y}" width="${w}" height="${h}" tabindex="0" role="button" aria-label="${esc(lab)}"/>`).join('');
  return `<svg id="scene" viewBox="0 0 320 180" role="group" aria-label="${L('Dein Büro', 'Your office')}">${s}</svg>`;
}

/* ---------- Fenster ---------- */
function openWin(title, html) {
  winTitle.textContent = title; winBody.innerHTML = html; modal.classList.add('on');
  winX.style.visibility = S && S.active ? 'hidden' : 'visible';
  modal.scrollTop = 0;
}
function closeWin(force) {
  if (!force && S && S.active) return;
  stopTimer(); modal.classList.remove('on'); winBody.innerHTML = '';
  if (S && !force) renderMain();
}
winX.onclick = () => closeWin();
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('on')) closeWin(); });
function toast(msg, kind = '') {
  const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
  $('#toast').appendChild(el); setTimeout(() => el.remove(), 2600);
}
function winConfirm(title, text, yes, onYes) {
  openWin(title, `<p>${text}</p><div class="row"><button class="btn pri" id="cf-y">${yes}</button><button class="btn ghost" id="cf-n">${L('Abbrechen', 'Cancel')}</button></div>`);
  $('#cf-y').onclick = onYes; $('#cf-n').onclick = () => closeWin();
}

/* ---------- Posteingang ---------- */
let selMail = null;
function openInbox(sel) {
  const mails = S.mails.slice().sort((a, b) => ((b.pin ? 1 : 0) - (a.pin ? 1 : 0)) || (a.read - b.read) || (b.id - a.id));
  if (!mails.length) {
    openWin(L('Posteingang', 'Inbox'), `<p>${L('Keine Mails. Beende den Monat für neue Anfragen, oder poste etwas, um sichtbarer zu werden.', 'No mails. End the month for new requests, or post something to become more visible.')}</p><button class="btn pri" id="ib-month">📅 ${L('Monat beenden', 'End month')}</button>`);
    $('#ib-month').onclick = askEndMonth; return;
  }
  selMail = sel && S.mails.some(m => m.id === sel) ? sel : (selMail && S.mails.some(m => m.id === selMail) ? selMail : mails[0].id);
  const m = S.mails.find(x => x.id === selMail); m.read = true; save();
  openWin(L('Posteingang', 'Inbox') + ` · ${S.mails.length}`, `<div class="grid2">
    <div class="mails">${mails.map(x => mailItem(x)).join('')}</div>
    <div class="maildetail" id="md">${mailDetail(m)}</div></div>`);
  $$('.mail').forEach(b => { b.onclick = () => { selMail = +b.dataset.id; openInbox(selMail); }; });
  bindDetail(m);
}
function locked(m) { return m.kind === 'job' && level(S.xp[m.cat]) < m.d - 1; }
function mailItem(m) {
  const right = m.kind === 'job' ? eur(m.fee) : m.kind === 'retainer' ? eur(m.monthly) + L('/M', '/mo') : m.kind === 'incident' ? '⚠' : m.kind === 'tender' ? '⚖' : m.kind === 'cfp' || m.kind === 'talk' ? '🎤' : '';
  return `<button class="mail ${m.id === selMail ? 'sel' : ''} ${m.read ? '' : 'unread'} ${locked(m) ? 'locked' : ''}" data-id="${m.id}">
    <span class="from"><span>${esc(m.from)}</span><span>${esc(right)}</span></span>
    <span class="subj">${T(m.subj)}</span>
    <span class="row" style="gap:6px;margin-top:4px">${catChip(m.cat)}${m.kind === 'job' ? `<span class="stars" aria-label="${L('Schwierigkeit', 'Difficulty')} ${m.d}">${'★'.repeat(m.d)}${'☆'.repeat(4 - m.d)}</span>` : ''}</span>
  </button>`;
}
const expTxt = m => L(`bis Ende ${mLabel(m.exp, true)}`, `until end of ${mLabel(m.exp, true)}`);
function mailDetail(m) {
  const head = `<h3>${T(m.subj)}</h3><div class="muted">${L('Von', 'From')}: ${esc(m.from)}${m.size ? ' · ' + T(SIZES[m.size]) : ''}</div>`;
  if (m.kind === 'job') {
    const lk = locked(m), lv = level(S.xp[m.cat]), noDays = S.days < m.days;
    return head + `<div class="meta">
      <b>${L('THEMA', 'TOPIC')}</b><span>${catChip(m.cat)}</span>
      <b>LEVEL</b><span class="stars">${'★'.repeat(m.d)}${'☆'.repeat(4 - m.d)}</span>
      <b>${L('HONORAR', 'FEE')}</b><span><b>${eur(m.fee)}</b> ${L('bei vollem Erfolg', 'on full success')}</span>
      <b>${L('AUFWAND', 'EFFORT')}</b><span>${m.days} ${L('Arbeitstage', 'work days')}</span>
      <b>${L('SPIEL', 'GAME')}</b><span>${esc(GAME_NAMES[m.game](m.cat))}</span>
      <b>${L('FRIST', 'DUE')}</b><span>${esc(expTxt(m))}</span></div>
      <div class="body">${T(m.body)}</div>
      ${lk ? `<p class="explain">🔒 ${L(`Dafür brauchst du ${t(CATS[m.cat])} Level ${m.d - 1}. Du hast Level ${lv}. Trainier am Whiteboard oder nimm leichtere Aufträge.`, `This needs ${t(CATS[m.cat])} level ${m.d - 1}. You have level ${lv}. Train at the whiteboard or take easier jobs.`)}</p>` : ''}
      ${!lk && noDays ? `<p class="explain">⏳ ${L('Diesen Monat reichen deine Arbeitstage nicht mehr.', 'Not enough work days left this month.')}</p>` : ''}
      <div class="row"><button class="btn pri" id="m-go" ${lk || noDays ? 'disabled' : ''}>▶ ${L('Auftrag annehmen', 'Accept job')} (−${m.days} ${L('Tage', 'days')})</button><button class="btn ghost" id="m-del">${L('Ablehnen', 'Decline')}</button></div>`;
  }
  if (m.kind === 'retainer') return head + `<div class="meta"><b>${L('THEMA', 'TOPIC')}</b><span>${catChip(m.cat)}</span><b>${L('MONATLICH', 'MONTHLY')}</b><span><b>${eur(m.monthly)}</b></span><b>${L('BETREUUNG', 'CARE')}</b><span>${L('1 Arbeitstag pro Monat, außer dein Team übernimmt', '1 work day per month, unless your team covers it')}</span><b>${L('FRIST', 'DUE')}</b><span>${esc(expTxt(m))}</span></div>
      <div class="body">${L('Hallo,\nwir waren so zufrieden, dass wir Sie gern dauerhaft für Betrieb und Weiterentwicklung beauftragen würden. Ab und zu kann es dabei brennen.', 'Hello,\nwe were so happy that we would like to retain you for operations and further development. Now and then something may catch fire.')}</div>
      <div class="row"><button class="btn ok" id="m-go">✓ ${L('Vertrag annehmen', 'Accept contract')}</button><button class="btn ghost" id="m-del">${L('Ablehnen', 'Decline')}</button></div>`;
  if (m.kind === 'incident') return head + `<div class="meta"><b>${L('KUNDE', 'CLIENT')}</b><span>${esc(m.from)}</span><b>${L('PAUSCHALE', 'FEE')}</b><span>${eur(m.fee)}</span><b>${L('AUFWAND', 'EFFORT')}</b><span>1 ${L('Tag', 'day')}</span><b>${L('FRIST', 'DUE')}</b><span>${L('nur diesen Monat!', 'this month only!')}</span></div>
      <div class="body">${L('Hilfe! Der Bericht zeigt nichts mehr an und der Vorstand sitzt in einer Stunde im Meeting. Hier die Fehlermeldungen.', 'Help! The report shows nothing and the board meets in an hour. Here are the error messages.')}</div>
      <p class="explain">⚠ ${L('Ignorierst du den Notfall, ist der Vertrag weg.', 'Ignore the emergency and the contract is gone.')}</p>
      <div class="row"><button class="btn pri" id="m-go" ${S.days < 1 ? 'disabled' : ''}>🔧 ${L('Fehler suchen', 'Debug it')}</button></div>`;
  if (m.kind === 'tender') return head + tenderForm(m);
  if (m.kind === 'cfp') return head + `<div class="meta"><b>EVENT</b><span>${esc(m.conf)}</span><b>${L('AUFWAND', 'EFFORT')}</b><span>1 ${L('Tag für den Abstract', 'day for the abstract')}</span><b>${L('FRIST', 'DUE')}</b><span>${esc(expTxt(m))}</span></div>
      <div class="body">${L('Hallo,\nwir suchen Sprecher:innen für unser nächstes Event. Reich gern einen Vortrag ein. Die Jury achtet auf Erfahrung im Thema und auf deine Bühnen-Historie.', 'Hello,\nwe are looking for speakers for our next event. Feel free to submit a talk. The jury values experience in the topic and your stage history.')}</div>
      <p><b>${L('Dein Thema', 'Your topic')}:</b></p>
      <div class="seg" id="cfp-cat">${QUIZ_CATS.map(c => `<button data-c="${c}">${T(CATS[c])} · Lv ${level(S.xp[c])}</button>`).join('')}</div>
      <div class="row" style="margin-top:10px"><button class="btn pri" id="m-go" disabled>✉ ${L('Abstract einreichen', 'Submit abstract')} (−1 ${L('Tag', 'day')})</button><button class="btn ghost" id="m-del">${L('Ignorieren', 'Ignore')}</button></div>`;
  if (m.kind === 'talk') return head + `<div class="meta"><b>EVENT</b><span>${esc(m.conf)}</span><b>${L('THEMA', 'TOPIC')}</b><span>${catChip(m.tcat)}</span><b>${L('AUFWAND', 'EFFORT')}</b><span>3 ${L('Tage inkl. Reise', 'days incl. travel')}</span><b>${L('FRIST', 'DUE')}</b><span>${esc(expTxt(m))}</span></div>
      <div class="body">${L('Dein Vortrag wurde angenommen! Nach dem Talk stellt das Publikum Fragen. Gute Antworten bringen Speaker-Punkte, Netzwerk und neue Kunden.', 'Your talk was accepted! After the talk the audience asks questions. Good answers bring speaker points, network and new clients.')}</div>
      <div class="row"><button class="btn pri" id="m-go" ${S.days < 3 ? 'disabled' : ''}>🎤 ${L('Auf die Bühne', 'Go on stage')} (−3 ${L('Tage', 'days')})</button><button class="btn ghost" id="m-del">${L('Absagen', 'Cancel talk')}</button></div>`;
  if (m.kind === 'phish') return head + `<div class="body">${L('Sehr geehrter Kunde,\n\nwegen eines Lizenzproblems wird Ihr Tenant in 24 Stunden unwiderruflich GELÖSCHT. Melden Sie sich SOFORT an, um das zu verhindern:\n\nhttps://login.fabrlc-cloud-support.example/verify\n\nIhr Cloud Security Team', 'Dear customer,\n\ndue to a license problem your tenant will be permanently DELETED in 24 hours. Sign in NOW to prevent this:\n\nhttps://login.fabrlc-cloud-support.example/verify\n\nYour Cloud Security Team')}</div>
      <div class="row"><button class="btn" id="m-go">🔗 ${L('Link öffnen und anmelden', 'Open link and sign in')}</button><button class="btn ok" id="m-del">🛡 ${L('Als Phishing melden', 'Report as phishing')}</button></div>`;
  // info
  return head + `<div class="body">${T(m.body)}</div><div class="row">${m.cat && m.cat !== 'talk' ? kitchenLink(m.cat) : `<a href="index.html" target="_blank" rel="noopener">Daten-WG Knowledge Kitchen ›</a>`}</div>
    <div class="row" style="margin-top:12px"><button class="btn" id="m-del">${L('Archivieren', 'Archive')}${m.xp ? ` (+${m.xp} XP)` : ''}</button></div>`;
}
const removeMail = m => { S.mails = S.mails.filter(x => x.id !== m.id); };
function bindDetail(m) {
  const go = $('#m-go'), del = $('#m-del');
  if (m.kind === 'job') {
    if (go) go.onclick = () => startJob(m);
    if (del) del.onclick = () => { removeMail(m); save(); openInbox(); };
  } else if (m.kind === 'retainer') {
    go.onclick = () => { S.retainers.push({ id: ++S.seq, from: m.from, cat: m.cat, monthly: m.monthly, since: S.month }); removeMail(m); save(); sfx('coin'); toast(L('Neuer Betriebsvertrag!', 'New retainer contract!'), 'good'); openInbox(); };
    del.onclick = () => { removeMail(m); save(); openInbox(); };
  } else if (m.kind === 'incident') {
    go.onclick = () => startIncident(m);
  } else if (m.kind === 'tender') {
    bindTender(m);
  } else if (m.kind === 'cfp') {
    let cat = null;
    $$('#cfp-cat button').forEach(b => { b.onclick = () => { cat = b.dataset.c; $$('#cfp-cat button').forEach(x => x.classList.toggle('on', x === b)); go.disabled = S.days < 1; }; });
    go.onclick = () => { if (!cat) return; S.days -= 1; S.cfp = { conf: m.conf, cat, m: S.month }; removeMail(m); save(); toast(L('Abstract eingereicht. Antwort im nächsten Monat.', 'Abstract submitted. Answer next month.'), 'good'); openInbox(); };
    del.onclick = () => { removeMail(m); save(); openInbox(); };
  } else if (m.kind === 'talk') {
    go.onclick = () => startTalk(m);
    del.onclick = () => { removeMail(m); S.rep = clamp(S.rep - 2, 0, 100); save(); toast(L('Absage. Reputation −2', 'Cancelled. Reputation −2'), 'bad'); openInbox(); };
  } else if (m.kind === 'phish') {
    go.onclick = () => { removeMail(m); S.cash -= 1500; S.rep = clamp(S.rep - 1, 0, 100); S.ledger.other -= 1500; const n = addCards(['phish']); save(); sfx('bad');
      resultScreen({ title: L('Autsch!', 'Ouch!'), score: 0, pay: -1500, lines: [L('Die Seite wollte dein Passwort. Die IT-Forensik kostet 1.500 €.', 'The page wanted your password. IT forensics cost €1,500.'), L('Reputation −1', 'Reputation −1'), n ? L('Neue Lernkarte: Phishing erkennen', 'New card: spot phishing') : ''], back: 'inbox' }); };
    del.onclick = () => { removeMail(m); S.rep = clamp(S.rep + 1, 0, 100); const n = addCards(['phish']); save(); sfx('ok');
      resultScreen({ title: L('Gut erkannt!', 'Well spotted!'), score: 1, pay: 0, lines: [L('Falsche Domain, Zeitdruck, Drohung: klassisches Phishing.', 'Wrong domain, time pressure, threat: classic phishing.'), L('Reputation +1', 'Reputation +1'), n ? L('Neue Lernkarte: Phishing erkennen', 'New card: spot phishing') : ''], back: 'inbox' }); };
  } else {
    del.onclick = () => { removeMail(m); if (m.xp && m.cat && S.xp[m.cat] != null) S.xp[m.cat] += m.xp; save(); openInbox(); };
  }
}

/* ---------- Abrechnung ---------- */
function resultScreen(o) {
  const pct = Math.round((o.score || 0) * 100);
  openWin(o.title, `
    ${o.score != null ? `<div class="gamehead"><span>${L('ERGEBNIS', 'RESULT')}</span><span>${pct} %</span></div><div class="timer"><i style="width:${pct}%;background:${pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)'}"></i></div>` : ''}
    ${o.pay ? `<div class="coins">${o.pay > 0 ? '+' : '−'} ${eur(Math.abs(o.pay))}</div>` : ''}
    <ul style="margin:0 0 16px 20px">${o.lines.filter(Boolean).map(l => `<li>${l}</li>`).join('')}</ul>
    <div class="row">${o.back === 'inbox' && S.mails.length ? `<button class="btn pri" id="r-inbox">📧 ${L('Zum Posteingang', 'To inbox')}</button>` : ''}<button class="btn" id="r-back">${L('Zurück ins Büro', 'Back to the office')}</button></div>`);
  if ($('#r-inbox')) $('#r-inbox').onclick = () => openInbox();
  $('#r-back').onclick = () => closeWin();
}
function finishJob(m, score, ids) {
  S.active = false;
  const before = level(S.xp[m.cat]);
  let pay = m.fee * (score >= 0.5 ? score : score * 0.5);
  const perfect = score >= 0.999;
  if (perfect) pay *= 1.1;
  pay = Math.round(pay / 10) * 10;
  S.cash += pay; S.ledger.jobs += pay; S.stats.jobs++; S.stats.earned += pay; if (perfect) S.stats.perfect++;
  const drep = score >= 0.8 ? (m.d >= 3 ? 3 : 2) : score < 0.5 ? -2 : 0;
  S.rep = clamp(S.rep + drep, 0, 100);
  const xp = Math.round(25 * m.d * (0.3 + 0.7 * score));
  S.xp[m.cat] += xp; if (m.cat !== 'talk') S.xp.talk += 4;
  const nc = addCards(ids);
  const after = level(S.xp[m.cat]);
  let retain = false;
  if (score >= 0.8 && m.d >= 2 && Math.random() < 0.45 && S.retainers.length < 14) {
    S.mails.push({ id: ++S.seq, kind: 'retainer', from: m.from, cat: m.cat, monthly: r50(m.fee * 0.12), exp: S.month + 1, read: false,
      subj: { de: 'Betriebsvertrag: dauerhaft weiter mit Ihnen?', en: 'Retainer: keep working with you?' } });
    retain = true;
  }
  save(); renderMain();
  sfx(pay > 0 ? 'coin' : 'bad'); if (after > before) setTimeout(() => sfx('lvl'), 450);
  resultScreen({ title: L('Abrechnung', 'Invoice'), score, pay, back: 'inbox', lines: [
    perfect ? L('Perfekt! +10 % Bonus', 'Perfect! +10 % bonus') : score < 0.5 ? L('Der Kunde ist unzufrieden und zahlt nur die Hälfte des Anteils.', 'The client is unhappy and pays only half of the share.') : '',
    drep ? L(`Reputation ${sgn(drep)}`, `Reputation ${sgn(drep)}`) : '',
    `${T(CATS[m.cat])}: +${xp} XP${after > before ? ' · <b>LEVEL UP → ' + after + '</b>' : ''}`,
    nc ? L(`${nc} neue Lernkarte(n) im Regal`, `${nc} new learning card(s) on the shelf`) : '',
    retain ? '☎ ' + L('Der Kunde bietet dir einen Betriebsvertrag an. Schau in den Posteingang!', 'The client offers you a retainer. Check your inbox!') : '',
  ] });
}
function startJob(m) {
  if (S.days < m.days) return;
  S.days -= m.days; removeMail(m); S.active = true; save(); renderMain();
  const done = (score, ids) => finishJob(m, score, ids);
  winX.style.visibility = 'hidden'; winTitle.textContent = m.from + ' · ' + t(m.subj);
  if (m.game === 'quiz') gameQuiz({ title: GAME_NAMES.quiz(m.cat), cat: m.cat, d: m.d, n: QN[m.d], onDone: done });
  else if (m.game === 'star') gameStar(done);
  else if (m.game === 'order') gameOrder(leastSeen(ORDER.filter(o => o.c === m.cat).length ? ORDER.filter(o => o.c === m.cat) : ORDER, 'ord'), done);
  else if (m.game === 'clinic') gameClinic(m.d, done);
  else if (m.game === 'fill') gameFill(m.d, [0, 2, 2, 3, 3][m.d], done);
  else if (m.game === 'pqdebug') gamePqDebug(m.d, [0, 2, 2, 2, 3][m.d], done);
  else gameDialog(leastSeen(DIALOGS, 'dlg'), done);
}
function startIncident(m) {
  S.days -= 1; removeMail(m); S.active = true; save(); renderMain();
  winX.style.visibility = 'hidden'; winTitle.textContent = '⚠ ' + m.from;
  gameQuiz({ title: L('Notfall', 'Emergency') + ' · ' + m.from, cat: null, d: 3, n: 2, inc: true, time: 40, onDone: (score, ids) => {
    S.active = false;
    const r = S.retainers.find(x => x.id === m.rid);
    const nc = addCards(ids); const lines = [];
    let pay = 0;
    if (score >= 0.5) { pay = Math.round(m.fee * score / 10) * 10; S.cash += pay; S.ledger.jobs += pay; S.rep = clamp(S.rep + 1, 0, 100); S.xp.gov += 15; lines.push(L('Gerettet! Der Vorstand merkt nichts. Reputation +1', 'Saved! The board notices nothing. Reputation +1')); }
    else { S.rep = clamp(S.rep - 3, 0, 100); lines.push(L('Der Bericht bleibt rot. Reputation −3', 'The report stays red. Reputation −3'));
      if (r && Math.random() < 0.5) { S.retainers = S.retainers.filter(x => x !== r); lines.push(L('Der Kunde kündigt den Betriebsvertrag.', 'The client cancels the retainer.')); } }
    if (nc) lines.push(L(`${nc} neue Lernkarte(n)`, `${nc} new card(s)`));
    save(); renderMain(); sfx(pay ? 'coin' : 'bad');
    resultScreen({ title: L('Notfall-Bilanz', 'Emergency report'), score, pay, lines, back: 'inbox' });
  } });
}
function startTalk(m) {
  S.days -= 3; removeMail(m); S.active = true; save(); renderMain();
  winX.style.visibility = 'hidden'; winTitle.textContent = '🎤 ' + m.conf;
  const d = clamp(level(S.xp[m.tcat]) + 1, 1, 3);
  gameQuiz({ title: L('Q&A auf der Bühne', 'Q&A on stage') + ' · ' + m.conf, cat: m.tcat, d, n: 3, time: 35, onDone: (score, ids) => {
    S.active = false;
    const sp = Math.round((4 + 8 * score) * (S.items.mic ? 1.5 : 1));
    const fol = Math.round((40 + 120 * score) * (1 + S.speaker / 60));
    const fee = S.speaker >= 30 ? 2500 : S.speaker >= 12 ? 800 : 0;
    S.speaker += sp; S.followers += fol; S.rep = clamp(S.rep + Math.round(3 * score), 0, 100); S.xp[m.tcat] += Math.round(30 * score); S.xp.talk += 20;
    if (score >= 0.6) S.leads += score >= 0.99 ? 2 : 1;
    if (fee) { S.cash += fee; S.ledger.other += fee; }
    const nc = addCards(ids);
    save(); renderMain(); sfx('lvl');
    resultScreen({ title: L('Applaus!', 'Applause!'), score, pay: fee, back: 'inbox', lines: [
      L(`Speaker-Punkte +${sp}`, `Speaker points +${sp}`), L(`Netzwerk +${fol}`, `Network +${fol}`),
      score >= 0.6 ? L('Nach dem Talk sprechen dich Interessenten an. Nächsten Monat kommen zusätzliche Anfragen.', 'Prospects approach you after the talk. Extra requests arrive next month.') : L('Ein paar Fragen gingen daneben. Beim nächsten Mal besser vorbereiten.', 'Some answers missed. Prepare better next time.'),
      fee ? L('Speaker-Honorar ausgezahlt.', 'Speaker fee paid.') : '', nc ? L(`${nc} neue Lernkarte(n)`, `${nc} new card(s)`) : '',
    ] });
  } });
}

/* ---------- Timer ---------- */
let TIMER = null;
function startTimer(sec, onTick, onEnd) {
  stopTimer();
  const total = sec * 1000, t0 = performance.now(); let pen = 0;
  const tm = { penalty: s => { pen += s * 1000; }, h: 0 };
  tm.h = setInterval(() => {
    const left = total - (performance.now() - t0) - pen;
    onTick(Math.max(0, left) / total);
    if (left <= 0) { stopTimer(); onEnd(); }
  }, 200);
  TIMER = tm;
}
function stopTimer() { if (TIMER) { clearInterval(TIMER.h); TIMER = null; } }
const timeMult = () => (S.items.monitor ? 1.25 : 1);
const gameHead = (title, right = '') => `<div class="gamehead"><span>${esc(title)}</span><span>${right}</span></div>`;
const isCode = x => typeof x === 'string' && /[[(]/.test(x);

/* ---------- Minispiel: Quiz ---------- */
function pickQuestions(cat, d, n, inc) {
  const md = Math.min(3, d);
  const okCat = q => !cat || q.c === cat;
  let pool = QUIZ.filter(q => okCat(q) && q.d <= md && !!q.inc === !!inc);
  if (pool.length < n) pool = pool.concat(QUIZ.filter(q => okCat(q) && !pool.includes(q)));
  if (pool.length < n) pool = pool.concat(QUIZ.filter(q => !pool.includes(q) && !!q.inc === !!inc));
  const out = shuffle(pool).map(q => ({ q, s: (S.seenQ[q.id] || 0) * 10 + (md - q.d) * 3 + Math.random() * 4 })).sort((a, b) => a.s - b.s).slice(0, n).map(x => x.q);
  out.forEach(q => { S.seenQ[q.id] = (S.seenQ[q.id] || 0) + 1; });
  return out;
}
function gameQuiz(o) {
  const qs = pickQuestions(o.cat, o.d, o.n, o.inc);
  let i = 0, right = 0, joker = !!S.items.daxbook && !o.practice;
  const ids = [];
  const show = () => {
    const q = qs[i];
    const opts = shuffle(q.o.map((x, k) => ({ x, ok: k === q.a })));
    winBody.innerHTML = gameHead(o.title, `${i + 1}/${qs.length} · ✓ ${right}`) + `<div class="timer"><i></i></div>` +
      `<div class="q">${T(q.q)}</div>` + (q.code ? `<pre class="code">${esc(q.code)}</pre>` : '') + (q.log ? `<pre class="code log">${esc(q.log)}</pre>` : '') +
      `<div class="opts">${opts.map((p, k) => `<button class="opt" data-k="${k}">${isCode(p.x) ? `<span class="mono">${T(p.x)}</span>` : T(p.x)}</button>`).join('')}</div>
      <div class="row" id="q-tools" style="margin-top:12px">${joker ? `<button class="btn" id="q-jk">½ 50/50-Joker</button>` : ''}<button class="btn ghost" id="q-giveup">${L('Aufgeben', 'Give up')}</button></div><div id="q-ex"></div>`;
    modal.scrollTop = 0;
    const bar = $('.timer', winBody);
    startTimer((o.time || [0, 42, 38, 34][Math.min(3, o.d)]) * timeMult(), f => { bar.firstElementChild.style.width = (f * 100) + '%'; bar.classList.toggle('warn', f < 0.25); }, () => answer(-1));
    const answer = k => {
      stopTimer();
      const ok = k >= 0 && opts[k].ok;
      if (ok) { right++; sfx('ok'); } else sfx('bad');
      $$('.opt', winBody).forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); else b.classList.add('dim'); });
      ids.push(q.id);
      $('#q-tools').remove();
      const last = i === qs.length - 1;
      $('#q-ex').innerHTML = `<div class="explain"><div class="lern"><div class="card-ico">${L('KARTE', 'CARD')}</div><div>
        <div class="px-t">${ok ? '✓ ' + L('RICHTIG', 'CORRECT') : k < 0 ? '⏱ ' + L('ZEIT UM', 'TIME UP') : '✗ ' + L('LEIDER FALSCH', 'WRONG')}</div>
        <p>${T(q.x)}</p>${kitchenLink(q.c)}</div></div></div>
        <div class="row" style="margin-top:12px"><button class="btn pri" id="q-next">${last ? L('Abrechnen', 'Finish') : L('Nächste Frage', 'Next question')} ›</button></div>`;
      $('#q-next').focus();
      $('#q-next').onclick = () => { i++; if (i < qs.length) show(); else o.onDone(right / qs.length, ids); };
    };
    $$('.opt', winBody).forEach(b => { b.onclick = () => answer(+b.dataset.k); });
    if ($('#q-jk')) $('#q-jk').onclick = () => {
      joker = false; $('#q-jk').remove();
      shuffle(opts.map((p, k) => k).filter(k => !opts[k].ok)).slice(0, 2).forEach(k => { const b = $$('.opt', winBody)[k]; b.disabled = true; b.classList.add('dim'); });
    };
    $('#q-giveup').onclick = () => { stopTimer(); o.onDone(right / qs.length, ids); };
  };
  show();
}

/* ---------- Minispiel: Sternschema ---------- */
function gameStar(onDone) {
  const sc = leastSeen(STAR, 'star');
  const order = shuffle(sc.tables.map((_, k) => k));
  const st = sc.tables.map(() => ({ role: null, key: '', into: '' }));
  const RN = { fact: L('Fakt', 'Fact'), dim: L('Dimension', 'Dimension'), fold: L('Einklappen', 'Collapse') };
  const complete = () => st.every(s => s.role === 'fact' || (s.role === 'dim' && s.key) || (s.role === 'fold' && s.into !== ''));
  const card = k => {
    const tb = sc.tables[k], s = st[k];
    return `<div class="tcard" id="tc-${k}"><h4>${T(tb.n)}</h4><div class="cols">${tb.cols.map(esc).join(' · ')}</div><div class="rows">${L('Zeilen', 'Rows')}: ${esc(tb.rows)}</div>
      <div class="seg">${['fact', 'dim', 'fold'].map(r => `<button data-k="${k}" data-r="${r}" class="${s.role === r ? 'on' : ''}" aria-pressed="${s.role === r}">${RN[r]}</button>`).join('')}</div>
      ${s.role === 'dim' ? `<label>${L('Schlüssel zum Fakt', 'Key to the fact')}<select data-k="${k}" data-f="key"><option value="">…</option>${tb.cols.map(c => `<option ${s.key === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></label>` : ''}
      ${s.role === 'fold' ? `<label>${L('Einklappen in', 'Collapse into')}<select data-k="${k}" data-f="into"><option value="">…</option>${sc.tables.map((o, j) => (j === k ? '' : `<option value="${j}" ${String(s.into) === String(j) ? 'selected' : ''}>${T(o.n)}</option>`)).join('')}</select></label>` : ''}
    </div>`;
  };
  const render = () => {
    winBody.innerHTML = gameHead(L('Sternschema-Werkstatt', 'Star schema workshop'), T(sc.title)) +
      `<p>${L('Ordne jede Tabelle zu: <b>Fakt</b>, <b>Dimension</b> oder <b>Einklappen</b> in eine andere Dimension (Snowflake auflösen). Bei Dimensionen wählst du den Schlüssel, über den sie am Fakt hängen.', 'Assign each table: <b>fact</b>, <b>dimension</b> or <b>collapse</b> into another dimension (resolve the snowflake). For dimensions pick the key that links them to the fact.')}</p>
      <div class="tables">${order.map(card).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn pri" id="s-chk" ${complete() ? '' : 'disabled'}>✓ ${L('Modell prüfen', 'Check model')}</button><button class="btn ghost" id="s-giveup">${L('Aufgeben', 'Give up')}</button></div>`;
    $$('.seg button', winBody).forEach(b => { b.onclick = () => { const s = st[+b.dataset.k]; s.role = b.dataset.r; sfx('click'); render(); }; });
    $$('select', winBody).forEach(sel => { sel.onchange = () => { st[+sel.dataset.k][sel.dataset.f] = sel.value; $('#s-chk').disabled = !complete(); }; });
    $('#s-chk').onclick = check;
    $('#s-giveup').onclick = () => onDone(0, []);
  };
  const check = () => {
    let pts = 0;
    const fb = sc.tables.map((tb, k) => {
      const s = st[k]; let p = 0; let msg;
      if (tb.role === 'fact') { p = s.role === 'fact' ? 1 : 0; msg = L('Faktentabelle: viele Zeilen, Kennzahlen und Fremdschlüssel.', 'Fact table: many rows, measures and foreign keys.'); }
      else if (tb.role === 'dim') { p = (s.role === 'dim' ? 0.5 : 0) + (s.role === 'dim' && s.key === tb.key ? 0.5 : 0); msg = L(`Dimension, Schlüssel ${tb.key}.`, `Dimension, key ${tb.key}.`); }
      else { p = (s.role === 'fold' ? 0.5 : 0) + (s.role === 'fold' && +s.into === tb.into ? 0.5 : 0); msg = L(`Einklappen in ${t(sc.tables[tb.into].n)} (Snowflake vermeiden).`, `Collapse into ${t(sc.tables[tb.into].n)} (avoid the snowflake).`); }
      pts += p; return { p, msg };
    });
    const score = pts / sc.tables.length;
    sfx(score >= 0.8 ? 'ok' : 'bad');
    winBody.innerHTML = gameHead(L('Sternschema-Werkstatt', 'Star schema workshop'), `${Math.round(score * 100)} %`) +
      `<div class="tables">${order.map(k => `<div class="tcard ${fb[k].p >= 1 ? 'good' : 'bad'}"><h4>${fb[k].p >= 1 ? '✓' : '✗'} ${T(sc.tables[k].n)}</h4><div class="cols">${sc.tables[k].cols.map(esc).join(' · ')}</div><div class="fb">${L('Deine Wahl', 'Your pick')}: <b>${st[k].role ? RN[st[k].role] : '–'}</b>${st[k].role === 'dim' ? ' · ' + esc(st[k].key) : ''}${st[k].role === 'fold' && st[k].into !== '' ? ' → ' + T(sc.tables[+st[k].into].n) : ''}</div><div class="fb">${esc(fb[k].msg)}</div></div>`).join('')}</div>
      <h3 style="margin-top:16px">${L('So sieht der Stern aus', 'This is the star')}</h3><div class="chartbox">${starSVG(sc)}</div>
      <div class="explain"><div class="lern"><div class="card-ico">${L('KARTE', 'CARD')}</div><div><p>${T(EXTRA_CARDS['star-basics'].x)} ${T(EXTRA_CARDS['star-snow'].x)}</p>${kitchenLink('model')}</div></div></div>
      <div class="row" style="margin-top:12px"><button class="btn pri" id="s-done">${L('Abrechnen', 'Finish')} ›</button></div>`;
    modal.scrollTop = 0;
    $('#s-done').onclick = () => onDone(score, ['star-basics', 'star-snow']);
  };
  render();
}
function starSVG(sc) {
  const W = 640, H = 330, cx = 320, cy = 165;
  const f = sc.tables.findIndex(x => x.role === 'fact');
  const dims = sc.tables.map((_, k) => k).filter(k => sc.tables[k].role === 'dim');
  const folds = k => sc.tables.filter(x => x.role === 'fold' && x.into === k).map(x => t(x.n));
  let lines = '', boxes = '';
  dims.forEach((k, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / dims.length;
    const x = cx + Math.cos(a) * 220, y = cy + Math.sin(a) * 118;
    lines += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#0F1E2E" stroke-width="2"/>`;
    lines += `<text x="${(x * 0.6 + cx * 0.4 + 6).toFixed(0)}" y="${(y * 0.6 + cy * 0.4 - 4).toFixed(0)}" font-size="13" font-weight="700" fill="#C25A2D">1</text><text x="${(x * 0.3 + cx * 0.7).toFixed(0)}" y="${(y * 0.3 + cy * 0.7 - 4).toFixed(0)}" font-size="13" font-weight="700" fill="#C25A2D">*</text>`;
    const fl = folds(k), h = 38 + fl.length * 14;
    boxes += `<rect x="${x - 72}" y="${y - h / 2}" width="144" height="${h}" fill="#fff" stroke="#000" stroke-width="2"/>`;
    boxes += `<text x="${x}" y="${y - h / 2 + 18}" text-anchor="middle" font-size="13" font-weight="700">${T(sc.tables[k].n)}</text><text x="${x}" y="${y - h / 2 + 32}" text-anchor="middle" font-size="11" fill="#6B5B48">🔑 ${esc(sc.tables[k].key)}</text>`;
    fl.forEach((n, j) => { boxes += `<text x="${x}" y="${y - h / 2 + 46 + j * 14}" text-anchor="middle" font-size="11" fill="#1F8F82">+ ${esc(n)}</text>`; });
  });
  boxes += `<rect x="${cx - 82}" y="${cy - 24}" width="164" height="48" fill="#C25A2D" stroke="#000" stroke-width="2"/><text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${T(sc.tables[f].n)}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="#FFE2D2">${L('Fakt', 'Fact')} · ${esc(sc.tables[f].rows)}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" font-family="JetBrains Mono, monospace" role="img" aria-label="${L('Lösung als Sternschema', 'Solution as star schema')}">${lines}${boxes}</svg>`;
}

/* ---------- Minispiel: Reihenfolge ---------- */
function gameOrder(task, onDone) {
  const n = task.steps.length;
  let pool = shuffle(task.steps.map((_, k) => k));
  while (pool.every((v, i) => v === i)) pool = shuffle(pool);
  const seq = [];
  const render = () => {
    winBody.innerHTML = gameHead(L('Reihenfolge-Puzzle', 'Sequence puzzle'), T(task.title)) +
      `<p>${L('Klick die Schritte in der richtigen Reihenfolge an. Ein Klick in der oberen Liste legt einen Schritt zurück.', 'Click the steps in the right order. Clicking in the top list puts a step back.')}</p>
      <div class="seq">${seq.length ? seq.map((k, i) => `<button class="it" data-s="${i}" data-n="${i + 1}">${T(task.steps[k])}</button>`).join('') : `<span class="muted">${L('Noch leer', 'Still empty')}</span>`}</div>
      <div class="pool">${pool.map(k => `<button class="it" data-p="${k}">${T(task.steps[k])}</button>`).join('')}</div>
      <div class="row" style="margin-top:14px"><button class="btn pri" id="o-chk" ${pool.length ? 'disabled' : ''}>✓ ${L('Prüfen', 'Check')}</button><button class="btn ghost" id="o-giveup">${L('Aufgeben', 'Give up')}</button></div>`;
    $$('[data-p]', winBody).forEach(b => { b.onclick = () => { const k = +b.dataset.p; pool = pool.filter(x => x !== k); seq.push(k); sfx('click'); render(); }; });
    $$('[data-s]', winBody).forEach(b => { b.onclick = () => { const k = seq.splice(+b.dataset.s, 1)[0]; pool.push(k); render(); }; });
    $('#o-chk').onclick = check;
    $('#o-giveup').onclick = () => onDone(0, []);
  };
  const check = () => {
    const ok = seq.filter((k, i) => k === i).length, score = ok / n;
    sfx(score >= 0.8 ? 'ok' : 'bad');
    winBody.innerHTML = gameHead(L('Reihenfolge-Puzzle', 'Sequence puzzle'), `${ok}/${n}`) +
      `<div class="grid2"><div><p><b>${L('Deine Reihenfolge', 'Your order')}</b></p><div class="seq">${seq.map((k, i) => `<div class="it ${k === i ? 'good' : 'bad'}" data-n="${i + 1}">${T(task.steps[k])}</div>`).join('')}</div></div>
      <div><p><b>${L('Richtig', 'Correct')}</b></p><div class="seq">${task.steps.map((s, i) => `<div class="it good" data-n="${i + 1}">${T(s)}</div>`).join('')}</div></div></div>
      <div class="explain"><div class="lern"><div class="card-ico">${L('KARTE', 'CARD')}</div><div><p>${T(task.x)}</p>${kitchenLink(task.c)}</div></div></div>
      <div class="row" style="margin-top:12px"><button class="btn pri" id="o-done">${L('Abrechnen', 'Finish')} ›</button></div>`;
    $('#o-done').onclick = () => onDone(score, [task.id]);
  };
  render();
}

/* ---------- Minispiel: Chart-Klinik ---------- */
function gameClinic(d, onDone) {
  const set = pick(CLINIC_SETS), k = d >= 3 ? 4 : 3;
  const errs = shuffle(Object.keys(CLINIC_ERRORS)).slice(0, k), on = e => errs.includes(e);
  const found = new Set(); let misses = 0, finished = false;
  let idx = set.vals.map((_, i) => i);
  if (on('unsorted')) { do idx = shuffle(idx); while (idx.every((v, i) => v === i)); }
  const cats = t(set.cats), vals = idx.map(i => set.vals[i]), labs = idx.map(i => cats[i]);
  const W = 640, H = 380, x0 = 84, x1 = on('legend') ? 500 : 610, y0 = 70, y1 = 316;
  const mx = Math.max(...vals), step = Math.pow(10, Math.floor(Math.log10(mx))) / 2, top = Math.ceil(mx / step) * step;
  const mn = on('axis') ? Math.floor(Math.min(...vals) * 0.85 / step) * step : 0;
  const Y = v => y1 - (v - mn) / (top - mn) * (y1 - y0);
  const ticks = []; for (let v = mn; v <= top + 0.001; v += (top - mn) / 4) ticks.push(v);
  const bw = (x1 - x0 - 16) / vals.length;
  const rainbow = ['#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4'];
  let svg = `<svg viewBox="0 0 ${W} ${H}" font-family="Geist, sans-serif" role="img" aria-label="${L('Diagramm mit Fehlern', 'Chart with mistakes')}">`;
  svg += `<defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#9FB0C4"/><stop offset="1" stop-color="#2E3A48"/></linearGradient></defs>`;
  svg += `<g class="el" data-el="title"><rect x="10" y="10" width="${W - 20}" height="38" fill="transparent"/><text x="20" y="38" font-size="20" font-weight="700" fill="#0F1E2E">${on('title') ? L('Zahlen', 'Numbers') : esc(t(set) + ' ' + L('in', 'in') + ' ' + set.unit + ', 2026')}</text></g>`;
  svg += `<g class="el" data-el="grid"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="transparent"/>`;
  ticks.forEach(v => { svg += `<line x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}" stroke="${on('grid') ? '#222' : '#E6E6E6'}" stroke-width="${on('grid') ? 2 : 1}"/>`; });
  if (on('grid')) for (let i = 0; i <= vals.length; i++) svg += `<line x1="${x0 + 8 + i * bw}" x2="${x0 + 8 + i * bw}" y1="${y0}" y2="${y1}" stroke="#222" stroke-width="2"/>`;
  svg += `</g><g class="el" data-el="axis"><rect x="14" y="${y0 - 10}" width="${x0 - 12}" height="${y1 - y0 + 20}" fill="transparent"/><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1}" stroke="#555"/>`;
  ticks.forEach(v => { svg += `<text x="${x0 - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="12" fill="#555">${num(v)}</text>`; });
  svg += `</g><g class="el" data-el="bars">`;
  vals.forEach((v, i) => {
    const x = x0 + 8 + i * bw + bw * 0.18, w = bw * 0.64;
    if (on('shadow')) svg += `<rect x="${x + 7}" y="${Y(v) + 7}" width="${w}" height="${y1 - Y(v) - 7}" fill="#000" fill-opacity=".35"/>`;
    svg += `<rect x="${x}" y="${Y(v)}" width="${w}" height="${y1 - Y(v)}" fill="${on('rainbow') ? rainbow[i] : on('shadow') ? 'url(#gl)' : '#3D4B5C'}"/>`;
  });
  svg += `</g><g class="el" data-el="labels">`;
  vals.forEach((v, i) => {
    const x = x0 + 8 + i * bw + bw / 2, lab = on('decimals') ? new Intl.NumberFormat(loc(), { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(v + ((i * 0.3717 + 0.137) % 1)) : num(v);
    svg += `<rect x="${x - bw / 2 + 2}" y="${Y(v) - 22}" width="${bw - 4}" height="18" fill="transparent"/><text x="${x}" y="${Y(v) - 8}" text-anchor="middle" font-size="${on('decimals') ? 11 : 13}" font-weight="600" fill="#0F1E2E">${lab}</text>`;
  });
  svg += `</g><g class="el" data-el="cats"><rect x="${x0}" y="${y1 + 4}" width="${x1 - x0}" height="34" fill="transparent"/>`;
  labs.forEach((c, i) => { svg += `<text x="${x0 + 8 + i * bw + bw / 2}" y="${y1 + 22}" text-anchor="middle" font-size="13" fill="#333">${esc(c)}</text>`; });
  svg += `</g>`;
  if (on('legend')) svg += `<g class="el" data-el="legend"><rect x="514" y="${y0}" width="112" height="44" fill="#fff" stroke="#999"/><rect x="524" y="${y0 + 15}" width="14" height="14" fill="${on('rainbow') ? rainbow[0] : '#3D4B5C'}"/><text x="546" y="${y0 + 27}" font-size="12" fill="#333">${L('Werte', 'Values')} 2026</text></g>`;
  svg += `</svg>`;
  winBody.innerHTML = gameHead(L('Chart-Klinik', 'Chart clinic'), `<span id="c-cnt">0/${k}</span>`) + `<div class="timer"><i></i></div>` +
    `<p>${L(`In diesem Diagramm stecken <b>${k} Fehler</b>. Klick auf die fehlerhaften Stellen: Titel, Achse, Säulen, Beschriftungen, Kategorien, Gitter oder Legende. Falsche Klicks kosten 4 Sekunden.`, `This chart hides <b>${k} mistakes</b>. Click the faulty parts: title, axis, columns, labels, categories, gridlines or legend. Wrong clicks cost 4 seconds.`)}</p>
    <div class="chartbox">${svg}</div><div class="found-list" id="c-found"></div>
    <div class="row" style="margin-top:12px" id="c-tools"><button class="btn" id="c-done">${L('Fertig', 'Done')}</button></div><div id="c-res"></div>`;
  const bar = $('.timer', winBody);
  const finish = () => {
    if (finished) return; finished = true; stopTimer();
    const score = clamp(found.size / k - misses * 0.08, 0, 1);
    sfx(score >= 0.8 ? 'ok' : 'bad');
    $('#c-tools').remove();
    $('#c-found').innerHTML = errs.map(e => `<div class="${found.has(e) ? '' : 'miss'}">${found.has(e) ? '✓' : '✗'} <b>${T(CLINIC_NAMES[e])}</b>: ${T(CLINIC_ERRORS[e])}</div>`).join('');
    $('#c-res').innerHTML = `<p class="muted" style="margin-top:10px">${L(`Gefunden: ${found.size}/${k}, Fehlklicks: ${misses}`, `Found: ${found.size}/${k}, misclicks: ${misses}`)} · ${kitchenLink('viz')}</p><div class="row"><button class="btn pri" id="c-fin">${L('Abrechnen', 'Finish')} ›</button></div>`;
    $('#c-fin').onclick = () => onDone(score, errs.map(e => 'cl-' + e));
  };
  startTimer(80 * timeMult(), f => { bar.firstElementChild.style.width = (f * 100) + '%'; bar.classList.toggle('warn', f < 0.25); }, finish);
  $$('.el', winBody).forEach(g => {
    g.addEventListener('click', () => {
      if (finished) return;
      const hit = errs.find(e => CLINIC_ERRORS[e].el === g.dataset.el && !found.has(e));
      if (hit) {
        found.add(hit); sfx('ok');
        $('#c-cnt').textContent = `${found.size}/${k}`;
        $('#c-found').insertAdjacentHTML('beforeend', `<div>✓ <b>${T(CLINIC_NAMES[hit])}</b>: ${T(CLINIC_ERRORS[hit])}</div>`);
        if (found.size === k) finish();
      } else { misses++; sfx('bad'); if (TIMER) TIMER.penalty(4); toast(L('Das passt so. −4 s', 'That is fine. −4 s'), 'bad'); }
    });
  });
  $('#c-done').onclick = finish;
}

/* ---------- Aufgaben auswählen (wenig gesehene zuerst) ---------- */
function pickTasks(list, d, n, key) {
  const md = Math.min(3, d);
  let pool = list.filter(x => x.d <= md);
  if (pool.length < n) pool = list.slice();
  const out = shuffle(pool).map(x => ({ x, s: (S.seen[key + x.id] || 0) * 10 + (md - x.d) * 3 + Math.random() * 4 })).sort((a, b) => a.s - b.s).slice(0, n).map(o => o.x);
  out.forEach(x => { S.seen[key + x.id] = (S.seen[key + x.id] || 0) + 1; });
  return out;
}

/* ---------- Minispiel: DAX-Lückentext ---------- */
function gameFill(d, n, onDone) {
  const tasks = pickTasks(FILL, d, n, 'fill');
  const ids = ['fill-intro'];
  let i = 0, sum = 0;
  const show = () => {
    const f = tasks[i];
    const opts = f.blanks.map(b => shuffle(b.o.map((o, k) => ({ o, ok: k === b.a }))));
    const parts = t(f.code).split(/\{(\d)\}/);
    const code = parts.map((p, j) => (j % 2
      ? `<select class="blank" data-b="${p}" aria-label="${L('Lücke', 'Blank')} ${+p + 1}"><option value="">${L('▾ wählen', '▾ pick')}</option>${opts[+p].map((o, k) => `<option value="${k}">${T(o.o)}</option>`).join('')}</select>`
      : esc(p))).join('');
    const solution = parts.map((p, j) => (j % 2 ? `<mark class="sol">${T(f.blanks[+p].o[f.blanks[+p].a])}</mark>` : esc(p))).join('');
    winBody.innerHTML = gameHead(L('DAX-Lückentext', 'DAX fill-in-the-blank'), `${i + 1}/${tasks.length}`) + `<div class="timer"><i></i></div>` +
      `<div class="q">${T(f.title)}</div><p class="muted">${L('Füll die Lücken so, dass das Measure stimmt.', 'Fill the blanks so the measure is correct.')}</p>
      <pre class="code fill">${code}</pre>
      <div class="row" id="f-tools"><button class="btn pri" id="f-chk" disabled>✓ ${L('Prüfen', 'Check')}</button><button class="btn ghost" id="f-giveup">${L('Aufgeben', 'Give up')}</button></div><div id="f-ex"></div>`;
    modal.scrollTop = 0;
    const sels = $$('select.blank', winBody), chk = $('#f-chk'), bar = $('.timer', winBody);
    let checked = false;
    const check = () => {
      if (checked) return; checked = true; stopTimer();
      let ok = 0;
      sels.forEach(s => {
        const k = s.value === '' ? -1 : +s.value, good = k >= 0 && opts[+s.dataset.b][k].ok;
        if (good) ok++; s.disabled = true; s.classList.add(good ? 'good' : 'bad');
      });
      const sc = ok / sels.length; sum += sc; ids.push(f.id);
      sfx(sc === 1 ? 'ok' : 'bad');
      $('#f-tools').remove();
      const last = i === tasks.length - 1;
      $('#f-ex').innerHTML = `<div class="explain"><div class="lern"><div class="card-ico">${L('KARTE', 'CARD')}</div><div>
        <div class="px-t">${sc === 1 ? '✓ ' + L('ALLES RICHTIG', 'ALL CORRECT') : `${ok}/${sels.length} ` + L('LÜCKEN RICHTIG', 'BLANKS CORRECT')}</div>
        <pre class="code" style="margin-top:8px">${solution}</pre><p>${T(f.x)}</p>${kitchenLink('dax')}</div></div></div>
        <div class="row" style="margin-top:12px"><button class="btn pri" id="f-next">${last ? L('Abrechnen', 'Finish') : L('Nächstes Measure', 'Next measure')} ›</button></div>`;
      $('#f-next').focus();
      $('#f-next').onclick = () => { i++; if (i < tasks.length) show(); else onDone(sum / tasks.length, ids); };
    };
    sels.forEach(s => { s.onchange = () => { chk.disabled = sels.some(x => x.value === ''); }; });
    chk.onclick = check;
    $('#f-giveup').onclick = () => { stopTimer(); onDone(sum / tasks.length, ids); };
    startTimer((30 + 15 * f.blanks.length) * timeMult(), fr => { bar.firstElementChild.style.width = (fr * 100) + '%'; bar.classList.toggle('warn', fr < 0.25); }, check);
  };
  show();
}

/* ---------- Minispiel: Power-Query-Debugging ---------- */
function gamePqDebug(d, n, onDone) {
  const tasks = pickTasks(PQDEBUG, d, n, 'pqd');
  const ids = [];
  let i = 0, sum = 0;
  const show = () => {
    const p = tasks[i];
    const fixes = shuffle(p.fix.map((o, k) => ({ o, ok: k === p.a })));
    let stepOk = null, finished = false;
    winBody.innerHTML = gameHead(L('Power-Query-Debugging', 'Power Query debugging'), `${i + 1}/${tasks.length}`) + `<div class="timer"><i></i></div>` +
      `<div class="q">${T(p.title)}</div><pre class="code log">${T(p.err)}</pre>
      <p><b>1.</b> ${L('Klick auf den angewendeten Schritt, in dem das Problem entsteht.', 'Click the applied step where the problem starts.')}</p>
      <div class="psteps">${p.steps.map((s, k) => `<button class="pstep" data-k="${k}"><span class="pn">${k + 1}. ${T(s.n)}</span><code>${T(s.m)}</code></button>`).join('')}</div>
      <div id="pq-fix"></div>
      <div class="row" id="pq-tools" style="margin-top:12px"><button class="btn ghost" id="pq-giveup">${L('Aufgeben', 'Give up')}</button></div><div id="pq-ex"></div>`;
    modal.scrollTop = 0;
    const bar = $('.timer', winBody), stepBtns = $$('.pstep', winBody);
    const revealStep = clicked => {
      stepBtns.forEach((b, k) => { b.disabled = true; if (k === p.bad) b.classList.add('good'); else if (k === clicked) b.classList.add('bad'); });
    };
    const finish = fixPick => {
      if (finished) return; finished = true; stopTimer();
      if (stepOk === null) { stepOk = false; revealStep(-1); }
      const fixOk = fixPick >= 0 && fixes[fixPick].ok;
      $$('#pq-fix .opt', winBody).forEach((b, k) => { b.disabled = true; if (fixes[k].ok) b.classList.add('right'); else if (k === fixPick) b.classList.add('wrong'); else b.classList.add('dim'); });
      if (!$('#pq-fix .opt')) $('#pq-fix').innerHTML = `<p><b>${L('Richtige Korrektur', 'Correct fix')}:</b> ${T(p.fix[p.a])}</p>`;
      const sc = (stepOk ? 0.5 : 0) + (fixOk ? 0.5 : 0); sum += sc; ids.push(p.id);
      sfx(sc === 1 ? 'ok' : 'bad');
      if ($('#pq-tools')) $('#pq-tools').remove();
      const last = i === tasks.length - 1;
      $('#pq-ex').innerHTML = `<div class="explain"><div class="lern"><div class="card-ico">${L('KARTE', 'CARD')}</div><div>
        <div class="px-t">${L('SCHRITT', 'STEP')} ${stepOk ? '✓' : '✗'} · ${L('KORREKTUR', 'FIX')} ${fixOk ? '✓' : '✗'}</div>
        <p>${T(p.x)}</p>${kitchenLink('pq')}</div></div></div>
        <div class="row" style="margin-top:12px"><button class="btn pri" id="pq-next">${last ? L('Abrechnen', 'Finish') : L('Nächster Fall', 'Next case')} ›</button></div>`;
      $('#pq-next').focus();
      $('#pq-next').onclick = () => { i++; if (i < tasks.length) show(); else onDone(sum / tasks.length, ids); };
    };
    stepBtns.forEach(b => {
      b.onclick = () => {
        if (stepOk !== null || finished) return;
        const k = +b.dataset.k; stepOk = k === p.bad;
        sfx(stepOk ? 'ok' : 'bad'); revealStep(k);
        $('#pq-fix').innerHTML = `<p>${stepOk ? '✓ ' + L('Richtig, hier liegt es.', 'Right, this is the one.') : '✗ ' + L('Hier liegt es nicht. Der grüne Schritt ist schuld.', 'Not this one. The green step is the culprit.')}</p>
          <p><b>2.</b> ${L('Welche Korrektur ist richtig?', 'Which fix is right?')}</p><div class="opts">${fixes.map((f, j) => `<button class="opt" data-j="${j}">${T(f.o)}</button>`).join('')}</div>`;
        $$('#pq-fix .opt', winBody).forEach(o => { o.onclick = () => finish(+o.dataset.j); });
      };
    });
    $('#pq-giveup').onclick = () => { stopTimer(); onDone(sum / tasks.length, ids); };
    startTimer(80 * timeMult(), fr => { bar.firstElementChild.style.width = (fr * 100) + '%'; bar.classList.toggle('warn', fr < 0.25); }, () => finish(-1));
  };
  show();
}

/* ---------- Minispiel: Kundengespräch ---------- */
function gameDialog(dlg, onDone) {
  let i = 0, sum = 0;
  const show = () => {
    const st = dlg.steps[i], opts = shuffle(st.a);
    winBody.innerHTML = gameHead(L('Kundengespräch', 'Client conversation'), `${i + 1}/${dlg.steps.length}`) +
      `<div class="dlg-line"><div class="avatar">${esc(dlg.av)}</div><div><div class="muted" style="font-size:13px">${T(dlg.who)}</div><div class="bubble">${T(st.say)}</div></div></div>
      <p><b>${L('Deine Antwort', 'Your answer')}:</b></p><div class="opts">${opts.map((a, k) => `<button class="opt" data-k="${k}">${T(a.t)}</button>`).join('')}</div><div id="d-ex"></div>`;
    $$('.opt', winBody).forEach(b => {
      b.onclick = () => {
        const a = opts[+b.dataset.k]; sum += a.s;
        sfx(a.s >= 0.9 ? 'ok' : a.s < 0.5 ? 'bad' : 'click');
        $$('.opt', winBody).forEach((x, j) => { x.disabled = true; if (j === +b.dataset.k) x.classList.add(a.s >= 0.9 ? 'right' : a.s < 0.5 ? 'wrong' : 'sel'); else x.classList.add('dim'); });
        const best = st.a.reduce((m, x) => (x.s > m.s ? x : m), st.a[0]);
        const last = i === dlg.steps.length - 1;
        $('#d-ex').innerHTML = `<div class="explain"><b>${a.s >= 0.9 ? '✓ ' + L('Gut gelöst', 'Well handled') : a.s >= 0.4 ? '~ ' + L('Geht so', 'So-so') : '✗ ' + L('Daneben', 'Missed')}</b><p>${T(a.f)}</p>${a !== best ? `<p class="muted">${L('Besser', 'Better')}: ${T(best.t)}</p>` : ''}</div>
          <div class="row" style="margin-top:12px"><button class="btn pri" id="d-next">${last ? L('Abrechnen', 'Finish') : L('Weiter', 'Next')} ›</button></div>`;
        $('#d-next').onclick = () => { i++; if (i < dlg.steps.length) show(); else onDone(sum / dlg.steps.length, [dlg.id]); };
      };
    });
  };
  show();
}

/* ---------- Ausschreibung ---------- */
function tenderForm(m) {
  const p = m.p, noDays = S.days < 1;
  return `<div class="meta"><b>${L('KUNDE', 'CLIENT')}</b><span>${esc(m.from)} · ${T(SIZES[m.size])}</span><b>${L('FRIST', 'DUE')}</b><span>${esc(expTxt(m))}</span></div>
    <div class="body">${L('Wir suchen eine Beratung für folgendes Paket:', 'We are looking for a consultancy for this package:')}</div>
    <ul style="margin:0 0 12px 20px">
      <li>${p.reports} ${L('Excel-Berichte nach Power BI überführen', 'Excel reports to move to Power BI')}</li>
      <li>${p.sources} ${L('Datenquelle(n) anbinden', 'data source(s) to connect')}</li>
      ${p.rls ? `<li>${L('Zeilenbasierte Sicherheit (RLS) für den Vertrieb', 'Row-level security (RLS) for sales')}</li>` : ''}
      ${p.training ? `<li>${L('Schulung für 15 Key-User', 'Training for 15 key users')}</li>` : ''}
    </ul>
    <p class="muted" style="font-size:13px">${L('Faustregeln: Bericht ≈ 1,25 Tage, Quelle ≈ 2 Tage, RLS ≈ 3 Tage, Schulung ≈ 2 Tage, plus 20 % Abstimmung. Rivalen bieten mit. Wer unrealistisch knapp schätzt, fliegt raus.', 'Rules of thumb: report ≈ 1.25 days, source ≈ 2 days, RLS ≈ 3 days, training ≈ 2 days, plus 20 % alignment. Rivals bid too. Unrealistically low estimates get rejected.')}</p>
    <div class="slider"><label for="t-days">${L('Aufwand (Tage)', 'Effort (days)')}</label><input type="range" id="t-days" min="3" max="50" value="12"><output id="t-dv">12</output></div>
    <div class="slider"><label for="t-rate">${L('Tagessatz', 'Day rate')}</label><input type="range" id="t-rate" min="500" max="1600" step="50" value="950"><output id="t-rv">${eur(950)}</output></div>
    <p><b>${L('Angebotssumme', 'Bid total')}: <span id="t-sum">${eur(12 * 950)}</span></b></p>
    <div class="row"><button class="btn pri" id="m-go" ${noDays ? 'disabled' : ''}>⚖ ${L('Angebot abgeben', 'Submit bid')} (−1 ${L('Tag', 'day')})</button><button class="btn ghost" id="m-del">${L('Ignorieren', 'Ignore')}</button></div>`;
}
function bindTender(m) {
  const dI = $('#t-days'), rI = $('#t-rate');
  const upd = () => { $('#t-dv').textContent = dI.value; $('#t-rv').textContent = eur(+rI.value); $('#t-sum').textContent = eur(dI.value * rI.value); };
  dI.oninput = upd; rI.oninput = upd;
  $('#m-del').onclick = () => { removeMail(m); save(); openInbox(); };
  $('#m-go').onclick = () => {
    const days = +dI.value, rate = +rI.value, tr = m.p.true;
    S.days -= 1; removeMail(m);
    const serious = days >= tr * 0.7;
    const bids = S.rivals.map(r => { const dd = Math.max(3, Math.round(tr * (0.82 + Math.random() * 0.4))), rr = r50((900 + Math.random() * 350) * S.index / 100); return { n: r.n, days: dd, rate: rr, price: dd * rr, adj: dd * rr }; });
    const me = { n: S.firm, days, rate, price: days * rate, adj: days * rate * (1 - Math.min(0.15, S.rep / 400)), me: true };
    const all = (serious ? [me] : []).concat(bids).sort((a, b) => a.adj - b.adj);
    const win = all[0].me;
    const lines = [];
    let pay = 0, score = 0;
    addCards(['tender']); S.xp.talk += 20;
    if (win) {
      const actual = Math.max(2, Math.round(tr * (0.9 + Math.random() * 0.2)));
      pay = days * rate; S.cash += pay; S.ledger.jobs += pay; S.rep = clamp(S.rep + 2, 0, 100);
      const fromNow = Math.min(actual, S.days); S.days -= fromNow; S.overtime += actual - fromNow;
      score = clamp(days / actual, 0, 1);
      lines.push(L(`Zuschlag! Tatsächlicher Aufwand: ${actual} Tage, angeboten hattest du ${days}.`, `You won! Actual effort: ${actual} days, you bid ${days}.`));
      if (actual > days) lines.push(L(`${actual - days} Tage arbeitest du unbezahlt. Mehr Puffer einplanen!`, `You work ${actual - days} days unpaid. Plan more buffer!`));
      else lines.push(L('Saubere Schätzung, der Puffer hat gereicht.', 'Clean estimate, the buffer held.'));
      if (actual - fromNow > 0) lines.push(L(`${actual - fromNow} Tage rutschen als Überstunden in den nächsten Monat.`, `${actual - fromNow} days slip into next month as overtime.`));
    } else {
      const w = all[0];
      lines.push(serious ? L(`${w.n} gewinnt mit ${eur(w.price)} (${w.days} Tage à ${eur(w.rate)}). Dein Angebot: ${eur(me.price)}.`, `${w.n} wins with ${eur(w.price)} (${w.days} days at ${eur(w.rate)}). Your bid: ${eur(me.price)}.`)
        : L(`Dein Angebot war unrealistisch knapp und wurde aussortiert. Realistisch waren etwa ${tr} Tage.`, `Your bid was unrealistically low and got rejected. Realistic was about ${tr} days.`));
      lines.push(L(`Realistischer Aufwand laut Faustregel: ${tr} Tage.`, `Realistic effort by rule of thumb: ${tr} days.`));
    }
    lines.push(L('Lernkarte: Aufwand schätzen', 'Card: estimating effort'));
    save(); renderMain(); sfx(win ? 'coin' : 'bad');
    resultScreen({ title: L('Ausschreibung', 'Tender'), score: win ? score : null, pay, lines, back: 'inbox' });
  };
}

/* ---------- Telefon: Verträge & Team ---------- */
function openPhone() {
  const cap = coverCap(), unc = Math.max(0, S.retainers.length - cap);
  openWin(L('Verträge & Team', 'Contracts & team'), `
    <p>${L(`Betriebsverträge bringen jeden Monat Geld, wie Bohrtürme. Jeder Vertrag braucht Betreuung: Dein Team deckt <b>${cap}</b> ab, jeder weitere kostet dich <b>1 Arbeitstag</b> pro Monat (aktuell ${unc}).`, `Retainers pay every month, like oil rigs. Each needs care: your team covers <b>${cap}</b>, each extra one costs you <b>1 work day</b> per month (currently ${unc}).`)}</p>
    <div class="sect">${L('BETRIEBSVERTRÄGE', 'RETAINERS')} · ${eur(retainerSum())}${L('/Monat', '/month')}</div>
    <div class="list">${S.retainers.length ? S.retainers.map(r => `<div class="li"><div><div class="t">${esc(r.from)}</div><div class="d">${catChip(r.cat)} ${L('seit', 'since')} ${esc(mLabel(r.since))}</div></div><div class="row"><b>${eur(r.monthly)}</b><button class="btn ghost" data-cancel="${r.id}">${L('Kündigen', 'Cancel')}</button></div></div>`).join('') : `<p class="muted">${L('Noch keine. Sehr gute Ergebnisse bei Aufträgen ab zwei Sternen bringen Vertragsangebote.', 'None yet. Very good results on jobs with two stars or more bring retainer offers.')}</p>`}</div>
    <div class="sect">${L('TEAM', 'TEAM')} · ${S.staff.length}/${OFFICES[S.office].slots} ${L('Plätze', 'seats')}</div>
    <div class="list">${S.staff.length ? S.staff.map((s, i) => `<div class="li"><div><div class="t">${T(STAFF_BY[s].n)}</div><div class="d">+${STAFF_BY[s].days} ${L('Tage', 'days')} · ${L('betreut', 'covers')} ${STAFF_BY[s].cover} · ${eur(STAFF_BY[s].salary)}${L('/M', '/mo')}</div></div><button class="btn ghost" data-fire="${i}">${L('Entlassen', 'Let go')}</button></div>`).join('') : `<p class="muted">${L('Noch allein. Einstellen kannst du im Shop, sobald dein Büro Plätze hat.', 'Still solo. Hire in the shop once your office has seats.')}</p>`}</div>`);
  $$('[data-cancel]').forEach(b => { b.onclick = () => { S.retainers = S.retainers.filter(r => r.id !== +b.dataset.cancel); S.rep = clamp(S.rep - 1, 0, 100); save(); openPhone(); }; });
  $$('[data-fire]').forEach(b => { b.onclick = () => { S.staff.splice(+b.dataset.fire, 1); save(); openPhone(); }; });
}

/* ---------- Whiteboard: Skills & Training ---------- */
function openSkills() {
  const v = firmValue(), rk = rankOf(v), next = RANKS.find(r => r.v > v);
  openWin(L('Whiteboard', 'Whiteboard'), `
    <p><b>${esc(rk[LANG])}</b> · ${L('Firmenwert', 'Company value')} ${eur(v)}${next ? ` · ${L('nächster Rang', 'next rank')}: ${esc(next[LANG])} ${L('ab', 'at')} ${eur(next.v)}` : ''}</p>
    <div class="sect">SKILLS</div>
    ${CAT_KEYS.map(c => { const xp = S.xp[c], lv = level(xp), a = LV[lv], b = LV[lv + 1] || a + 1, pct = lv >= LV.length - 1 ? 100 : (xp - a) / (b - a) * 100;
      return `<div class="skill"><span>${catChip(c)}</span><div class="bar"><i style="width:${pct.toFixed(0)}%;background:${CATS[c].color}"></i></div><span class="lv">Lv ${lv}</span></div>`; }).join('')}
    <div class="sect">${L('WEITERBILDUNG', 'TRAINING')} · 1 ${L('Tag', 'day')}, ${L('kein Honorar', 'no fee')}</div>
    <p class="muted">${L('Drei Übungsfragen auf deinem Niveau. Bringt Erfahrung und Lernkarten, aber kein Geld.', 'Three practice questions at your level. Brings experience and cards, but no money.')}</p>
    <div class="row">${CAT_KEYS.map(c => `<button class="btn" data-train="${c}" ${S.days < 1 ? 'disabled' : ''}>${esc(CATS[c].icon)} ${T(CATS[c])}</button>`).join('')}</div>`);
  $$('[data-train]').forEach(b => { b.onclick = () => train(b.dataset.train); });
}
function train(c) {
  if (S.days < 1) return;
  S.days -= 1; S.active = true; save(); renderMain(); winX.style.visibility = 'hidden'; winTitle.textContent = L('Weiterbildung', 'Training') + ' · ' + t(CATS[c]);
  const done = (score, ids) => {
    S.active = false; const xp = Math.round(30 * score) + 4; S.xp[c] += xp; const nc = addCards(ids); save(); renderMain(); sfx('ok');
    resultScreen({ title: L('Weiterbildung', 'Training'), score, lines: [`${T(CATS[c])}: +${xp} XP`, nc ? L(`${nc} neue Lernkarte(n)`, `${nc} new card(s)`) : ''] });
  };
  const td = clamp(level(S.xp[c]) + 1, 1, 3), r = Math.random();
  if (c === 'talk') gameDialog(leastSeen(DIALOGS, 'dlg'), done);
  else if (c === 'dax' && r < 0.5) gameFill(td, 2, done);
  else if (c === 'pq' && r < 0.5) gamePqDebug(td, 2, done);
  else gameQuiz({ title: L('Weiterbildung', 'Training') + ' · ' + t(CATS[c]), cat: c, d: clamp(level(S.xp[c]) + 1, 1, 3), n: 3, practice: true, onDone: done });
}

/* ---------- Regal: Kitchen-Bibliothek ---------- */
let libTab = 'all';
function openLibrary() {
  const ids = CARD_IDS.filter(id => libTab === 'all' || CARDS[id].c === libTab);
  const have = ids.filter(id => S.cards[id]);
  openWin(L('Kitchen-Bibliothek', 'Kitchen library') + ` · ${cardCount()}/${CARD_IDS.length}`, `
    <p>${L('Jede gelöste Aufgabe legt eine Lernkarte ins Regal. Sammle alle und schau für die Tiefe in die Knowledge Kitchen.', 'Every solved task puts a learning card on the shelf. Collect them all and dive deeper in the Knowledge Kitchen.')}</p>
    <div class="tabs"><button data-tab="all" class="${libTab === 'all' ? 'on' : ''}">${L('ALLE', 'ALL')}</button>${CAT_KEYS.map(c => `<button data-tab="${c}" class="${libTab === c ? 'on' : ''}">${T(CATS[c]).toUpperCase()} ${CARD_IDS.filter(id => CARDS[id].c === c && S.cards[id]).length}/${CARD_IDS.filter(id => CARDS[id].c === c).length}</button>`).join('')}</div>
    ${libTab !== 'all' ? `<p>${kitchenLink(libTab)}</p>` : ''}
    <div class="cards">${have.map(id => `<div class="lcard"><div class="row" style="gap:6px;margin-bottom:6px">${catChip(CARDS[id].c)}</div><div class="h">${T(CARDS[id].h)}</div><div>${T(CARDS[id].x)}</div></div>`).join('')}
    ${ids.filter(id => !S.cards[id]).map(() => `<div class="lcard lockedc" aria-label="${L('Noch nicht gesammelt', 'Not collected yet')}">?</div>`).join('')}</div>`);
  $$('[data-tab]').forEach(b => { b.onclick = () => { libTab = b.dataset.tab; openLibrary(); }; });
}

/* ---------- Tür: Stadt & Shop ---------- */
function openShop() {
  const off = OFFICES[S.office], nxt = OFFICES[S.office + 1], free = off.slots - S.staff.length;
  openWin(L('Stadt & Shop', 'Town & shop') + ` · ${eur(S.cash)}`, `
    <div class="sect">${L('AUSSTATTUNG', 'GEAR')}</div>
    <div class="list">${ITEMS.map(it => { const own = !!S.items[it.id];
      return `<div class="li ${own ? 'owned' : ''}"><div><div class="t">${T(it.n)}</div><div class="d">${T(it.d)}</div></div>${own ? (it.monthly ? `<button class="btn ghost" data-unsub="${it.id}">${L('Kündigen', 'Cancel')}</button>` : `<b>✓ ${L('gekauft', 'owned')}</b>`) : `<button class="btn pri" data-buy="${it.id}" ${S.cash < it.price ? 'disabled' : ''}>${it.monthly ? L('Abonnieren', 'Subscribe') : eur(it.price)}</button>`}</div>`; }).join('')}</div>
    <div class="sect">${L('TEAM EINSTELLEN', 'HIRE STAFF')} · ${free > 0 ? L(`${free} Plätze frei`, `${free} seats free`) : L('keine Plätze frei, größeres Büro nötig', 'no seats free, bigger office needed')}</div>
    <div class="list">${STAFF.map(s => `<div class="li"><div><div class="t">${T(s.n)}</div><div class="d">+${s.days} ${L('Arbeitstage', 'work days')}/${L('Monat', 'month')} · ${L('betreut', 'covers')} ${s.cover} ${L('Verträge', 'retainers')} · ${eur(s.salary)} ${L('Gehalt/Monat', 'salary/month')}</div></div><button class="btn pri" data-hire="${s.id}" ${free < 1 || S.cash < s.hire ? 'disabled' : ''}>${L('Einstellen', 'Hire')} · ${eur(s.hire)}</button></div>`).join('')}</div>
    <div class="sect">${L('BÜRO', 'OFFICE')}</div>
    <div class="list"><div class="li owned"><div><div class="t">${T(off.n)}</div><div class="d">${L('Miete', 'Rent')} ${eur(off.rent)}/${L('Monat', 'month')} · ${off.slots} ${L('Teamplätze', 'team seats')}</div></div><b>${L('aktuell', 'current')}</b></div>
    ${nxt ? `<div class="li"><div><div class="t">${T(nxt.n)}</div><div class="d">${L('Miete', 'Rent')} ${eur(nxt.rent)}/${L('Monat', 'month')} · ${nxt.slots} ${L('Teamplätze', 'team seats')} · ${L('mehr Anfragen, mehr Prestige', 'more requests, more prestige')}</div></div><button class="btn pri" id="buy-office" ${S.cash < nxt.price ? 'disabled' : ''}>${L('Umziehen', 'Move')} · ${eur(nxt.price)}</button></div>` : `<p class="muted">${L('Höher geht es nicht. Du hast den Daten-Turm.', 'It does not get higher. You own the Data Tower.')}</p>`}</div>`);
  $$('[data-buy]').forEach(b => { b.onclick = () => { const it = ITEMS.find(x => x.id === b.dataset.buy); if (S.cash < it.price) return; S.cash -= it.price; S.items[it.id] = true; save(); sfx('coin'); toast(L('Gekauft: ', 'Bought: ') + t(it.n), 'good'); renderMain(); openShop(); }; });
  $$('[data-unsub]').forEach(b => { b.onclick = () => { delete S.items[b.dataset.unsub]; save(); renderMain(); openShop(); }; });
  $$('[data-hire]').forEach(b => { b.onclick = () => { const s = STAFF_BY[b.dataset.hire]; if (S.cash < s.hire || S.staff.length >= OFFICES[S.office].slots) return; S.cash -= s.hire; S.staff.push(s.id); S.days += Math.round(s.days / 2); save(); sfx('coin'); toast(L('Willkommen im Team!', 'Welcome to the team!'), 'good'); renderMain(); openShop(); }; });
  if ($('#buy-office')) $('#buy-office').onclick = () => { if (S.cash < nxt.price) return; S.cash -= nxt.price; S.office++; S.rep = clamp(S.rep + 3, 0, 100); save(); sfx('lvl'); toast(L('Umzug geschafft: ', 'Moved to: ') + t(nxt.n), 'good'); renderMain(); openShop(); };
}

/* ---------- Smartphone: Posten ---------- */
const HOOKS = {
  dax: { de: 'Ein Measure, drei Fehler. Und wie man sie findet:', en: 'One measure, three bugs. And how to find them:' },
  model: { de: 'Aus 42 Tabellen wurden 6. Ein Sternschema-Umbau:', en: '42 tables became 6. A star schema makeover:' },
  fabric: { de: 'Lakehouse oder Warehouse? Meine Entscheidungstabelle:', en: 'Lakehouse or warehouse? My decision table:' },
  viz: { de: 'Vorher, nachher: ein Dashboard ohne Regenbogen.', en: 'Before and after: a dashboard without the rainbow.' },
  pq: { de: 'Diese 5 Power-Query-Schritte retten jeden Monatsimport:', en: 'These 5 Power Query steps save every monthly import:' },
  gov: { de: 'Fünf Versionen derselben Zahl. So haben wir aufgeräumt:', en: 'Five versions of the same number. How we cleaned up:' },
};
function openPost(res) {
  const thisMonth = S.posts.filter(p => p.m === S.month).length;
  let sel = { cat: null, hook: null, vis: null };
  const hooks = c => [
    { id: 'concrete', t: c ? HOOKS[c] : { de: 'Konkretes Ergebnis aus einem Projekt', en: 'A concrete result from a project' }, m: 1.45 },
    { id: 'buzz', t: { de: 'Game Changer! 🚀 KI verändert ALLES!', en: 'Game changer! 🚀 AI changes EVERYTHING!' }, m: 0.6 },
    { id: 'question', t: { de: 'Was ist euer größter Fehler in diesem Thema?', en: 'What is your biggest mistake in this topic?' }, m: 1.1 },
  ];
  const VIS = [{ id: 'chart', t: { de: 'Klares Vorher-Nachher-Chart', en: 'Clear before-after chart' }, m: 1.3 }, { id: 'meme', t: { de: 'Meme', en: 'Meme' }, m: 1.15 }, { id: 'selfie', t: { de: 'Selfie vom Konferenzflur', en: 'Selfie from the conference hall' }, m: 1 }, { id: 'none', t: { de: 'Nur Text', en: 'Text only' }, m: 0.7 }];
  const render = () => {
    openWin(L('Posten', 'Post') + ` · ${num(S.followers)} ${L('Follower', 'followers')}`, `
      ${res || ''}
      <p>${L('Regelmäßiges Posten macht dich sichtbar: mehr Anfragen, bessere Honorare, leichtere Konferenz-Zusagen. Wer zwei Monate schweigt, verliert Netzwerk.', 'Regular posting makes you visible: more requests, better fees, easier conference acceptance. Two silent months cost network.')}${thisMonth ? ' ' + L('Achtung: Der zweite Post im Monat erreicht nur halb so viele Leute.', 'Note: a second post in a month reaches only half as many people.') : ''}</p>
      <p><b>1. ${L('Thema', 'Topic')}</b></p><div class="seg" id="p-cat">${QUIZ_CATS.map(c => `<button data-v="${c}" class="${sel.cat === c ? 'on' : ''}">${T(CATS[c])} · Lv ${level(S.xp[c])}</button>`).join('')}</div>
      <p><b>2. ${L('Einstieg', 'Hook')}</b></p><div class="opts" id="p-hook">${hooks(sel.cat).map(h => `<button class="opt ${sel.hook === h.id ? 'right' : ''}" data-v="${h.id}">„${T(h.t)}“</button>`).join('')}</div>
      <p style="margin-top:10px"><b>3. ${L('Bild', 'Visual')}</b></p><div class="seg" id="p-vis">${VIS.map(v => `<button data-v="${v.id}" class="${sel.vis === v.id ? 'on' : ''}">${T(v.t)}</button>`).join('')}</div>
      <div class="row" style="margin-top:12px"><button class="btn pri" id="p-go" ${sel.cat && sel.hook && sel.vis && S.days >= 1 ? '' : 'disabled'}>📱 ${L('Veröffentlichen', 'Publish')} (−1 ${L('Tag', 'day')})</button></div>
      ${S.posts.length ? `<div class="sect">${L('DEIN FEED', 'YOUR FEED')}</div><div class="feed">${S.posts.slice(0, 5).map(p => `<div class="post"><div class="m">${esc(mLabel(p.m))} · ${T(CATS[p.cat])}</div>„${T(p.text)}“<div class="m">👍 ${num(p.likes)} · 💬 ${num(p.com)} · +${num(p.gain)} ${L('Follower', 'followers')}</div></div>`).join('')}</div>` : ''}`);
    $$('#p-cat button').forEach(b => { b.onclick = () => { sel.cat = b.dataset.v; render(); }; });
    $$('#p-hook button').forEach(b => { b.onclick = () => { sel.hook = b.dataset.v; render(); }; });
    $$('#p-vis button').forEach(b => { b.onclick = () => { sel.vis = b.dataset.v; render(); }; });
    $('#p-go').onclick = publish;
  };
  const publish = () => {
    const h = hooks(sel.cat).find(x => x.id === sel.hook), v = VIS.find(x => x.id === sel.vis), lv = level(S.xp[sel.cat]);
    let reach = (14 + S.followers * 0.09) * h.m * v.m * (1 + 0.15 * lv) * (S.items.ring ? 1.3 : 1) * (0.6 + Math.random()) * (thisMonth ? 0.5 : 1);
    const viral = Math.random() < 0.07; if (viral) reach *= 4;
    const likes = Math.round(reach), com = Math.round(reach * (sel.hook === 'question' ? 0.35 : 0.12)), gain = Math.round(reach * 0.35);
    S.days -= 1; S.followers += gain; S.lastPost = S.month;
    let rep = 0; if (sel.hook === 'concrete' && sel.vis === 'chart' && lv >= 1) rep = 1; if (sel.hook === 'buzz') rep = -1;
    S.rep = clamp(S.rep + rep, 0, 100); S.xp.talk += 5;
    S.posts.unshift({ m: S.month, cat: sel.cat, text: h.t, likes, com, gain });
    const nc = addCards(['post']);
    save(); renderMain(); sfx(gain > 20 ? 'coin' : 'click');
    sel = { cat: null, hook: null, vis: null };
    res = `<div class="explain"><b>${viral ? '🔥 ' + L('VIRAL!', 'VIRAL!') + ' ' : ''}👍 ${num(likes)} · 💬 ${num(com)} · +${num(gain)} ${L('Follower', 'followers')}${rep ? ` · ${L('Reputation', 'Reputation')} ${sgn(rep)}` : ''}</b>
      <p>${h.id === 'buzz' ? L('Buzzwords bringen wenig Reichweite und kosten Glaubwürdigkeit.', 'Buzzwords bring little reach and cost credibility.') : h.id === 'concrete' ? L('Konkrete Ergebnisse ziehen. Mit passendem Chart wirkt es noch stärker.', 'Concrete results work. With a matching chart even more so.') : L('Fragen bringen Kommentare und damit Reichweite.', 'Questions bring comments and thus reach.')}${nc ? ' ' + L('Neue Lernkarte: Gute Fachposts.', 'New card: good expert posts.') : ''}</p></div>`;
    render();
  };
  render();
}

/* ---------- Fenster: Markt & Rivalen ---------- */
function openMarket() {
  const me = { n: S.firm, v: firmValue(), me: true };
  const all = S.rivals.map(r => ({ ...r })).concat([me]).sort((a, b) => b.v - a.v);
  const h = S.idxHist, w = 600, ht = 140, mn = Math.min(...h, 80) - 5, mx = Math.max(...h, 120) + 5;
  const pts = h.map((v, i) => `${(h.length === 1 ? 0 : i / (h.length - 1) * w).toFixed(1)},${(ht - (v - mn) / (mx - mn) * ht).toFixed(1)}`).join(' ');
  openWin(L('Markt & Rivalen', 'Market & rivals'), `
    <p>${L('Der Tagessatz-Index ist dein Ölpreis: Er bestimmt, was neue Aufträge einbringen. Hype treibt ihn, Budgetstopps drücken ihn.', 'The day-rate index is your oil price: it sets what new jobs pay. Hype pushes it, budget freezes pull it down.')}</p>
    <div class="chartbox"><svg viewBox="-40 -10 ${w + 60} ${ht + 30}" font-family="JetBrains Mono, monospace" role="img" aria-label="${L('Verlauf Tagessatz-Index', 'Day-rate index history')}">
      <line x1="0" x2="${w}" y1="${ht - (100 - mn) / (mx - mn) * ht}" y2="${ht - (100 - mn) / (mx - mn) * ht}" stroke="#ccc" stroke-dasharray="4 4"/><text x="-6" y="${ht - (100 - mn) / (mx - mn) * ht + 4}" font-size="11" text-anchor="end" fill="#888">100</text>
      ${h.length > 1 ? `<polyline points="${pts}" fill="none" stroke="#C25A2D" stroke-width="3"/>` : ''}<text x="${w}" y="${ht + 18}" font-size="12" text-anchor="end" fill="#333">${L('aktuell', 'now')} ${Math.round(S.index)}</text></svg></div>
    <div class="sect">${L('RANGLISTE FIRMENWERT', 'COMPANY VALUE RANKING')}</div>
    <div class="list">${all.map((r, i) => `<div class="li ${r.me ? 'owned' : ''}"><div class="t">${i + 1}. ${esc(r.n)}${r.me ? ' ★' : ''}</div><b>${eur(r.v)}</b></div>`).join('')}</div>
    <div class="sect">${L('RÄNGE', 'RANKS')}</div>
    <div class="list">${RANKS.map(r => `<div class="li ${me.v >= r.v ? 'owned' : ''}"><div class="t">${esc(r[LANG])}</div><span>${L('ab', 'from')} ${eur(r.v)}</span></div>`).join('')}</div>`);
}

/* ---------- Menü ---------- */
function openMenu() {
  if (S.active) return;
  openWin(L('Menü', 'Menu'), `
    <div class="list">
      <div class="li"><div><div class="t">${L('Spielstand', 'Save game')}</div><div class="d">${L('Wird automatisch in diesem Browser gespeichert.', 'Saved automatically in this browser.')}</div></div><b>✓</b></div>
      <div class="li"><div><div class="t">${L('Statistik', 'Stats')}</div><div class="d">${L(`${S.stats.jobs} Aufträge, davon ${S.stats.perfect} perfekt, ${eur(S.stats.earned)} Honorar insgesamt`, `${S.stats.jobs} jobs, ${S.stats.perfect} perfect, ${eur(S.stats.earned)} fees in total`)}</div></div></div>
    </div>
    <div class="row" style="margin-top:14px"><button class="btn" id="mn-help">? ${L('Spielanleitung', 'How to play')}</button><button class="btn" id="mn-title">⌂ ${L('Zum Titelbild', 'Title screen')}</button><button class="btn ghost" id="mn-new">${L('Neues Spiel', 'New game')}</button></div>`);
  $('#mn-help').onclick = showIntro;
  $('#mn-title').onclick = () => { save(); S = null; renderTitle(); };
  $('#mn-new').onclick = () => winConfirm(L('Neues Spiel', 'New game'), L('Dein aktueller Spielstand wird gelöscht.', 'Your current save will be deleted.'), L('Ja, neu starten', 'Yes, restart'), () => { const f = S.firm; S = newState(f); startMails(); save(); closeWin(true); renderMain(); showIntro(); });
}

/* ---------- Monatsende & Daten-Zeitung ---------- */
function askEndMonth() {
  if (S.active) return;
  const c = costs();
  winConfirm(L('Monat abschließen?', 'Close the month?'),
    L(`Übrige Arbeitstage (${S.days}) verfallen. Fällig werden ${eur(c.total)} Kosten, dazu kommen ${eur(retainerSum())} aus Betriebsverträgen.`, `Remaining work days (${S.days}) expire. Costs of ${eur(c.total)} are due, plus ${eur(retainerSum())} from retainers.`),
    '📅 ' + L('Monat beenden', 'End month'), endMonth);
}
function endMonth() {
  const prev = S.month, c = costs(), ret = retainerSum(), cash0 = S.cash, notes = [];
  S.cash += ret; S.cash -= c.total;
  const due = S.sched.filter(x => x.m <= prev + 1);
  due.forEach(x => { S.cash += x.cash; notes.push(L(`Zahlungseingang ${eur(x.cash)} (spät, aber da)`, `Incoming payment ${eur(x.cash)} (late, but here)`)); });
  S.sched = S.sched.filter(x => x.m > prev + 1);
  // Ereignis
  let ev = null, extraMails = 0, stealOne = false, catMail = null;
  if (Math.random() < 0.75) {
    ev = pick(EVENTS.filter(e => e.id !== S.lastEvent)); S.lastEvent = ev.id; const f = ev.fx;
    if (f.days) S.overtime += -f.days;
    if (f.index) S.index += f.index;
    if (f.late) { S.cash -= f.late; S.sched.push({ m: prev + 3, cash: f.late }); }
    if (f.rep) S.rep = clamp(S.rep + f.rep, 0, 100);
    if (f.mails) extraMails += f.mails;
    if (f.followers) S.followers += f.followers;
    if (f.cash) S.cash += f.cash;
    if (f.speaker) S.speaker += f.speaker;
    if (f.steal) stealOne = true;
    if (f.mailCat) catMail = f.mailCat;
  }
  // Index
  const i0 = S.index; S.index = clamp(S.index + (Math.random() - 0.45) * 8, 70, 165); S.idxHist.push(Math.round(S.index * 10) / 10); if (S.idxHist.length > 36) S.idxHist.shift();
  // Rivalen
  S.rivals.forEach(r => { r.v = Math.round(r.v * (1 + rnd(1, 7) / 100 + (prev < 12 ? 0.025 : 0.012))); });
  S.month++;
  // Abgelaufene Mails, verpasste Notfälle
  S.mails.filter(m => m.exp < S.month).forEach(m => {
    if (m.kind === 'incident') { const r = S.retainers.find(x => x.id === m.rid); if (r) { S.retainers = S.retainers.filter(x => x !== r); notes.push(L(`${m.from} kündigt: Notfall ignoriert.`, `${m.from} cancels: emergency ignored.`)); } S.rep = clamp(S.rep - 4, 0, 100); }
    if (m.kind === 'talk') { S.rep = clamp(S.rep - 2, 0, 100); notes.push(L('Vortrag verpasst. Reputation −2', 'Missed your talk. Reputation −2')); }
  });
  S.mails = S.mails.filter(m => m.exp >= S.month);
  // Konferenz-Antwort
  if (S.cfp && S.cfp.m < S.month) {
    const p = clamp(0.25 + 0.08 * level(S.xp[S.cfp.cat]) + S.speaker * 0.01 + S.rep * 0.004 + S.followers / 8000, 0.1, 0.92);
    if (Math.random() < p) { S.mails.push({ id: ++S.seq, kind: 'talk', from: S.cfp.conf, conf: S.cfp.conf, cat: 'talk', tcat: S.cfp.cat, exp: S.month + 1, read: false, subj: { de: 'Zusage: Dein Vortrag ist im Programm!', en: 'Accepted: your talk is in the program!' } }); notes.push(L(`🎤 ${S.cfp.conf} hat deinen Vortrag angenommen!`, `🎤 ${S.cfp.conf} accepted your talk!`)); }
    else notes.push(L(`${S.cfp.conf} hat abgesagt. Tipp: mehr Erfahrung im Thema, mehr Posts, mehr Speaker-Punkte.`, `${S.cfp.conf} declined. Tip: more topic experience, more posts, more speaker points.`));
    S.cfp = null;
  }
  // Betreuung und Notfälle
  const unc = Math.max(0, S.retainers.length - coverCap());
  S.retainers.forEach(r => { if (Math.random() < 0.16) { S.mails.push(genIncident(r)); notes.push(L(`⚠ Notfall bei ${r.from}!`, `⚠ Emergency at ${r.from}!`)); } });
  // Netzwerk
  if (S.month - S.lastPost > 2 && S.followers > 40) { const lost = Math.round(S.followers * 0.06); S.followers -= lost; notes.push(L(`Funkstille kostet ${lost} Follower. Mal wieder posten!`, `Silence costs ${lost} followers. Post again!`)); }
  // Neue Mails
  const before = S.mails.length;
  newMails(extraMails);
  if (catMail) S.mails.push(genJob(catMail));
  if (stealOne) { const jobs = S.mails.filter(m => m.kind === 'job'); if (jobs.length > 2) { const j = pick(jobs); S.mails = S.mails.filter(m => m !== j); } }
  const fresh = S.mails.length - before;
  // Arbeitstage
  let days = baseDays() - unc - S.overtime;
  if (days < 0) { S.overtime = -days; days = 0; } else S.overtime = 0;
  S.days = days;
  const led = { ...S.ledger }; S.ledger = { jobs: 0, other: 0 };
  const value = firmValue(), win = !S.won && value >= GOAL, over = S.cash < BANKRUPT;
  if (win) S.won = true;
  if (over) S.over = true;
  save(); renderMain();
  showGazette({ prev, ev, c, ret, led, cash0, notes, fresh, unc, idxD: S.index - i0, value, win, over });
}
function showGazette(g) {
  const all = S.rivals.map(r => ({ ...r })).concat([{ n: S.firm, v: g.value, me: true }]).sort((a, b) => b.v - a.v);
  const head = g.ev ? t(g.ev.h) : L('Ruhiger Monat am Datenmarkt', 'A quiet month on the data market');
  const net = g.led.jobs + g.led.other + g.ret - g.c.total;
  sfx(g.over ? 'bad' : 'click');
  openWin(L('Monatsabschluss', 'Month close'), `
    <div class="gazette">
      <div class="mast"><div class="n">${L('DIE DATEN-ZEITUNG', 'THE DATA GAZETTE')}</div><div class="d">${L('Köln', 'Cologne')} · ${esc(mLabel(g.prev, true))} · ${L('Ausgabe', 'Issue')} ${g.prev + 1} · ${L('Preis: ein Kaffee', 'Price: one coffee')}</div></div>
      <div class="head">${esc(head.toUpperCase())}</div>
      ${g.ev ? `<p>${T(g.ev.t)}</p>` : `<p>${L('Keine Umbenennungen, keine Budgetstopps. Die Branche arbeitet einfach.', 'No renames, no budget freezes. The industry simply works.')}</p>`}
      <div class="cols">
        <div><b>${L('BILANZ', 'LEDGER')} ${esc(S.firm.toUpperCase())}</b>
          <table class="ledger">
            <tr><td>${L('Honorare aus Aufträgen', 'Fees from jobs')}</td><td class="pos">${eur(g.led.jobs)}</td></tr>
            ${g.led.other ? `<tr><td>${L('Sonstiges', 'Other')}</td><td class="${g.led.other >= 0 ? 'pos' : 'negc'}">${eur(g.led.other)}</td></tr>` : ''}
            <tr><td>${L('Betriebsverträge', 'Retainers')} (${S.retainers.length})</td><td class="pos">${eur(g.ret)}</td></tr>
            <tr><td>${L('Miete', 'Rent')}: ${T(OFFICES[S.office].n)}</td><td class="negc">−${eur(g.c.rent)}</td></tr>
            <tr><td>${L('Lebenshaltung & Software', 'Living & software')}</td><td class="negc">−${eur(g.c.living)}</td></tr>
            ${g.c.salaries ? `<tr><td>${L('Gehälter', 'Salaries')} (${S.staff.length})</td><td class="negc">−${eur(g.c.salaries)}</td></tr>` : ''}
            ${g.c.subs ? `<tr><td>${L('Abos', 'Subscriptions')}</td><td class="negc">−${eur(g.c.subs)}</td></tr>` : ''}
            <tr class="sum"><td>${L('Monatsergebnis', 'Month result')}</td><td class="${net >= 0 ? 'pos' : 'negc'}">${eur(net)}</td></tr>
            <tr class="sum"><td>${L('Kontostand', 'Bank balance')}</td><td class="${S.cash >= 0 ? 'pos' : 'negc'}">${eur(S.cash)}</td></tr>
          </table>
          <p style="margin-top:8px;font-size:13px">${L('Tagessatz-Index', 'Day-rate index')}: <b>${Math.round(S.index)}</b> (${sgn(Math.round(g.idxD))}) · ${L('Firmenwert', 'Company value')}: <b>${eur(g.value)}</b></p>
        </div>
        <div><b>${L('RANGLISTE', 'RANKING')}</b>
          <table class="ledger">${all.map((r, i) => `<tr><td>${i + 1}. ${esc(r.n)}${r.me ? ' ★' : ''}</td><td>${eur(r.v)}</td></tr>`).join('')}</table>
          <p style="margin-top:10px"><b>${L('KURZMELDUNGEN', 'IN BRIEF')}</b></p>
          <ul style="margin:4px 0 0 18px;font-size:14px">
            <li>${L(`${g.fresh} neue Mails im Posteingang`, `${g.fresh} new mails in your inbox`)}</li>
            <li>${L(`${S.days} Arbeitstage im ${mLabel(S.month, true)}`, `${S.days} work days in ${mLabel(S.month, true)}`)}${g.unc ? L(` (−${g.unc} für Vertragsbetreuung)`, ` (−${g.unc} for retainer care)`) : ''}</li>
            ${g.notes.map(n => `<li>${esc(n)}</li>`).join('')}
            ${S.cash < 0 && !g.over ? `<li><b>${L(`Dispo! Unter ${eur(BANKRUPT)} ist Schluss.`, `Overdraft! Below ${eur(BANKRUPT)} it is over.`)}</b></li>` : ''}
          </ul>
        </div>
      </div>
    </div>
    <div class="row" style="margin-top:14px"><button class="btn pri full" id="gz-go">▶ ${L('Weiter in den', 'On to')} ${esc(mLabel(S.month, true))}</button></div>`);
  $('#gz-go').onclick = () => { if (g.over) showOver(); else if (g.win) showWin(); else openInbox(); };
}
function showOver() {
  sfx('bad');
  openWin(L('Insolvenz', 'Bankruptcy'), `<div class="coins">GAME OVER</div>
    <p>${L(`${S.firm} ist pleite. Kontostand ${eur(S.cash)}. Die Kaffeemaschine gehört jetzt dem Insolvenzverwalter.`, `${S.firm} is bankrupt. Balance ${eur(S.cash)}. The espresso machine now belongs to the administrator.`)}</p>
    <p>${L(`Du hast ${S.stats.jobs} Aufträge gelöst und ${cardCount()} Lernkarten gesammelt. Das Wissen bleibt dir.`, `You solved ${S.stats.jobs} jobs and collected ${cardCount()} learning cards. The knowledge stays with you.`)}</p>
    <div class="row"><button class="btn pri" id="ov-new">▶ ${L('Neu gründen', 'Start over')}</button><button class="btn" id="ov-lib">📚 ${L('Bibliothek ansehen', 'View library')}</button></div>`);
  $('#ov-new').onclick = () => { const f = S.firm; S = newState(f); startMails(); save(); closeWin(true); renderMain(); showIntro(); };
  $('#ov-lib').onclick = openLibrary;
}
function showWin() {
  sfx('lvl');
  openWin(L('Daten-Imperium!', 'Data empire!'), `<div class="coins">★ ${L('IMPERIUM ERREICHT', 'EMPIRE REACHED')} ★</div>
    <p>${L(`${S.firm} ist ${eur(firmValue())} wert. Aus der WG-Küche ist ein Daten-Imperium geworden, in ${S.month} Monaten.`, `${S.firm} is worth ${eur(firmValue())}. The shared kitchen became a data empire in ${S.month} months.`)}</p>
    <p>${L(`${S.stats.jobs} Aufträge, ${S.stats.perfect} perfekt, ${cardCount()}/${CARD_IDS.length} Lernkarten, ${S.speaker} Speaker-Punkte.`, `${S.stats.jobs} jobs, ${S.stats.perfect} perfect, ${cardCount()}/${CARD_IDS.length} cards, ${S.speaker} speaker points.`)}</p>
    <div class="row"><button class="btn pri" id="wn-go">▶ ${L('Weiterspielen', 'Keep playing')}</button></div>`);
  $('#wn-go').onclick = () => openInbox();
}

/* ---------- Start ---------- */
if (/[?&]debug\b/.test(location.search)) window.__DI = { get S() { return S; }, genJob, genTender, genCfp, genPhish, genIncident, startJob, finishJob, openInbox, level, firmValue, endMonth, openShop, openPost, openLibrary, openSkills, openMarket, openPhone, renderMain };
renderTitle();
})();
