/* MockupKitchen · live.js (v0.6 live): Power-BI-Projektordner (PBIP) verbinden, Spec laufend schreiben, Deploy, Status des
 * Live-Helfers (Runner). Dateivertrag: mockup-live/CONTRACT.md (Version 1 samt Beta-Ergänzungen 02.10.2026). Das Kitchen
 * schreibt nur in <Projekt>/mockup/, nie in *.Report oder *.SemanticModel. Gestaltung: mockup-live/UX-KONZEPT.md.
 *
 *   window.MK_LIVE.connect()        Ordner wählen (Knopf „PBIP verbinden", braucht eine Nutzergeste)
 *   window.MK_LIVE.reconnect()      gemerkten Ordner wieder freigeben (Chip „Wieder verbinden")
 *   window.MK_LIVE.deploy(opts)     Spec + Brief schreiben, dann mockup/deploy-request.json, danach das Vergleichsbild
 *                                   mockup/kitchen/<seq>/<Seite>.png + tiles.json. opts: {scope, dryRun, prepare, restore}
 *   window.MK_LIVE.preview()        Vorschau (dryRun) anfordern und das Popover zeigen
 *   window.MK_LIVE.confirm(action)  Antwort auf eine Rückfrage des Runners (deploy-confirm.json)
 *   window.MK_LIVE.compareDone()    Promise des letzten Vergleichsbilds (Inhalt von tiles.json oder null)
 *   window.MK_LIVE.disconnect()     Verbindung trennen und den gemerkten Ordner vergessen
 *   window.MK_LIVE.writeNow()       Spec + Brief sofort schreiben (Promise)
 *   window.MK_LIVE.poll()           agent-status.json sofort lesen (Promise)
 *   window.MK_LIVE.info()           { supported, enabled, connected, name, dep, seq, status, mismatch, changes, mode, … }
 *   window.MK_LIVE.openResult(seq)  Ergebnisansicht; openProtocol() alter Statusdialog; setMode('mod'|'ws')
 *
 * Sichtbar nur mit ?live=1 (setzt localStorage mockupkitchen.live=1; ?live=0 löscht) oder in der Standalone-Datei.
 * Braucht die File System Access API (Chrome, Edge). Ohne sie ist der Knopf gesperrt, der Export bleibt der Weg.
 */
(function () {
  'use strict';
  const I18N = window.MK_I18N;
  const t = (key, vars) => I18N.t(key, vars);
  const has = key => I18N.has(key);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MK = () => window.MK;
  const toast = msg => { if (MK() && MK().toast) MK().toast(msg); };
  const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  const CONTRACT = 1;
  const SUPPORTED = typeof window.showDirectoryPicker === 'function';
  const IDB_NAME = 'mockupkitchen-live', IDB_STORE = 'handles', IDB_KEY = 'project';
  const LS_DEP = 'mockupkitchen.live.v1';              // je Projekt: Deploy-Zähler, Fingerabdrücke, Siegel, Urteile
  const LS_LIVE = 'mockupkitchen.live', LS_MODE = 'mockupkitchen.live.mode', LS_SKIP = 'mockupkitchen.live.skipPreview';
  const WRITE_MS = 1000, POLL_MS = 2000, STALE_MS = 15000, APPLIED_MS = 4000, SKIP_MAX = 3;
  const FILES = { spec: 'mockup-spec.json', brief: 'AGENT-BRIEF.md', request: 'deploy-request.json', status: 'agent-status.json',
    confirm: 'deploy-confirm.json', cancel: 'deploy-cancel.json', session: 'desktop-session.json', approvals: 'model-approvals.json', doctor: 'doctor.json' };
  // Fünf Klartext-Stationen des Stepper aus den Schritten des Runners (UX-KONZEPT 2)
  const STATIONS = [['check', ['bridge', 'spec', 'model', 'build']], ['save', ['plan', 'backup', 'visuals', 'theme']], ['write', ['write', 'validate']], ['desktop', ['desktop', 'reload']], ['compare', ['shots', 'compare']]];
  const CHECK_SVG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10.5l3.6 3.6 7.4-8"/></svg>';

  let enabled = false, projectHint = '';
  let proj = null;            // verbunden: { root, name, report, model, path }
  let stored = null;          // gemerkt, aber (noch) nicht freigegeben: { handle, name }
  let pickHint = null;        // Startordner für den nächsten Dialog (nach Wahl eines Teilordners)
  let status = null, statusRaw = '', statusMtime = 0, statusSeen = false, toastKey = '';
  let session = null, doctor = null, doctorAt = 0, approvals = null;   // desktop-session.json, doctor.json, model-approvals.json
  let lastCmp = null, lastWriteAt = 0, writeT = null, queue = Promise.resolve(), pollT = null, tickT = null, deploying = false;
  // dep: seq = letzte Anfrage (auch Vorschau), real = letzter echter Deploy, fps = Fingerabdrücke beim Deploy, seals/rows je Seite bzw. Kachel
  let dep = freshDep();
  let plan = null;            // Vorschau: { seq, local, remote, scope }
  let appliedAt = 0, appliedSeq = 0, arrivedSeq = 0, awaitKey = '', confirmed = null, cdState = null, restoredSeq = 0, restoredNote = null;
  let dismissed = {};         // Bandzeilen, die weggeklickt wurden (Schlüssel seq:kind)
  let hist = { urls: {}, loading: {} };
  const shot = { on: false, opacity: 0.5, key: null, url: null, w: 0, h: 0 };
  const res = { open: false, seq: 0, page: null, mode: 'side', fade: 50, split: 50, blink: false, blinkOn: false, blinkIv: null, urls: {}, key: '', loading: false, tiles: null, pages: {} };
  function freshDep() { return { seq: 0, real: 0, fps: null, fpsSeq: 0, seals: {}, rows: {}, prepDone: 0 }; }

  // ------------------------------------------------------------------ Hilfen
  function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); }
  const pad = (n, l) => String(Math.abs(n)).padStart(l || 2, '0');
  // ISO 8601 mit Zeitzone der Maschine (Vertrag: „Zeitpunkte als ISO 8601 mit Zeitzone")
  function isoLocal(d) {
    const off = -d.getTimezoneOffset();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}${off >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
  }
  const locale = () => I18N.lang === 'en' ? 'en-GB' : 'de-DE';
  function hhmm(v) { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) : ''; }
  function hhmmss(v) { const d = v ? new Date(v) : null; return d && !isNaN(d) ? d.toLocaleTimeString(locale()) : ''; }
  const fmtS = ms => (Math.max(0, ms) / 1000).toFixed(1).replace('.', I18N.lang === 'en' ? '.' : ',') + ' s';
  const clock = ms => { const s = Math.max(0, Math.round(ms / 1000)); return Math.floor(s / 60) + ':' + pad(s % 60); };
  const bon = n => '#' + pad(+n || 0);
  const bonHtml = n => `<span class="lv-bon">${esc(bon(n))}</span>`;
  const stripBom = s => String(s || '').replace(/^﻿/, '');
  const isPerm = e => !!e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
  const isGone = e => !!e && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError');
  const nfc = s => String(s == null ? '' : s).normalize('NFC');
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* blockiert */ } } };
  async function sha256(text) {
    if (!(window.crypto && crypto.subtle)) return null;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const wsMode = () => document.body.classList.contains('ws-mode');
  // innerHTML nur ersetzen, wenn sich der Text geändert hat: sonst flackern Tooltips und ein Klick fällt zwischen zwei Knoten
  const htmlCache = new WeakMap();
  function setHtml(el, html) { if (!el) return false; if (htmlCache.get(el) === html) return false; el.innerHTML = html; htmlCache.set(el, html); return true; }
  const typingIn = root => { const a = document.activeElement; return !!(a && root && root.contains(a) && /^(TEXTAREA|INPUT)$/.test(a.tagName)); };

  // ------------------------------------------------------------------ Schalter: Live-Oberfläche nur mit ?live=1 (oder Standalone), Moderation/Werkstatt
  function gate() {
    let p = null, u = null;
    try { u = new URL(location.href); p = u.searchParams.get('live'); projectHint = u.searchParams.get('project') || ''; } catch (e) { /* ohne URL-API */ }
    if (p === '1' || p === 'true' || p === 'on') ls.set(LS_LIVE, '1');
    else if (p === '0' || p === 'false' || p === 'off') ls.set(LS_LIVE, null);
    enabled = window.MK_STANDALONE === true || ls.get(LS_LIVE) === '1';
    document.body.classList.toggle('live-on', enabled);
    document.body.classList.toggle('ws-mode', ls.get(LS_MODE) === 'ws');
    const v = $('#mkVersion'); if (v && enabled) v.textContent = t('live.version');
  }
  function setMode(m) { ls.set(LS_MODE, m === 'ws' ? 'ws' : 'mod'); document.body.classList.toggle('ws-mode', m === 'ws'); renderAll(); toast(t(m === 'ws' ? 'live.toast.modeWs' : 'live.toast.modeMod')); }

  // ------------------------------------------------------------------ IndexedDB: Verzeichnis-Handle merken (überlebt das Neuladen)
  function idb() {
    return new Promise((resolve, rej) => {
      let r; try { r = indexedDB.open(IDB_NAME, 1); } catch (e) { rej(e); return; }
      r.onupgradeneeded = () => r.result.createObjectStore(IDB_STORE);
      r.onsuccess = () => resolve(r.result); r.onerror = () => rej(r.error);
    });
  }
  async function idbGet() {
    const db = await idb();
    return new Promise(resolve => { const q = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(IDB_KEY); q.onsuccess = () => { resolve(q.result || null); db.close(); }; q.onerror = () => { resolve(null); db.close(); }; });
  }
  async function idbSet(val) {
    const db = await idb();
    return new Promise(resolve => {
      const tx = db.transaction(IDB_STORE, 'readwrite'); const os = tx.objectStore(IDB_STORE);
      if (val) os.put(val, IDB_KEY); else os.delete(IDB_KEY);
      tx.oncomplete = () => { resolve(true); db.close(); }; tx.onerror = () => { resolve(false); db.close(); };
    });
  }

  // ------------------------------------------------------------------ Deploy-Zähler, Fingerabdrücke, Siegel je Projekt (localStorage)
  function loadDep(name) {
    try { const all = JSON.parse(ls.get(LS_DEP) || '{}') || {}; const d = all[name]; if (!d) return freshDep();
      return Object.assign(freshDep(), { seq: +d.seq || 0, real: +d.real || +d.seq || 0, fps: d.fps || null, fpsSeq: +d.fpsSeq || 0, seals: d.seals || {}, rows: d.rows || {}, prepDone: +d.prepDone || 0, prevFps: d.prevFps || null, prevSeq: +d.prevSeq || 0, prevReal: +d.prevReal || 0, rolledBack: +d.rolledBack || 0 }); }
    catch (e) { return freshDep(); }
  }
  function saveDep() { if (!proj) return; try { const all = JSON.parse(ls.get(LS_DEP) || '{}') || {}; all[proj.name] = dep; ls.set(LS_DEP, JSON.stringify(all)); } catch (e) { /* voll oder blockiert */ } }
  // Fingerabdruck je Kachel: Visual und Rechteck getrennt, so wird „verschoben" von „geändert" unterscheidbar
  function tileFp(l) { return fnv(JSON.stringify(l.node.visual)) + '|' + fnv(JSON.stringify(l.rect)); }
  // Zwischenspeicher für Fingerabdrücke, Änderungen und Bereitschaft: bei 23 Seiten und 43 Kacheln laufen Knopf, Band und Tab sonst
  // bei jedem Tick (250 ms) über alle Seiten. rev steigt bei jeder Änderung am Stand, am Status, an den Freigaben und an den Urteilen.
  let rev = 0; const memo = { fp: null, fpRev: -1, ch: null, chRev: -1, rd: null, rdRev: -1 };
  function bump() { rev++; }
  function setFps(seq) { dep.fps = fingerprints(); dep.fpsSeq = seq; bump(); }
  // „__design": Theme, Rahmen, Canvas und Abstände als eigener Abdruck, sonst stünde nach einer Farbänderung „✓ Aktuell"
  function fingerprints() {
    if (memo.fp && memo.fpRev === rev) return memo.fp;
    const out = {}; const S = MK().state; S.pages.forEach(p => MK().computeAll(p).leaves.forEach(l => { if (l.node.visual) out[l.node.id] = tileFp(l); })); out.__design = fnv(JSON.stringify([S.design, S.chrome, S.canvas, S.spacing]));
    memo.fp = out; memo.fpRev = rev; return out;
  }
  function fpDiff(a, b) { if (!a || !b) return a === b ? 'same' : 'changed'; if (a === b) return 'same'; const [av, ar] = a.split('|'), [bv, br] = b.split('|'); return av === bv && ar !== br && ar != null && br != null ? 'moved' : 'changed'; }
  // Änderungen seit dem letzten echten Deploy, je Seite (lokale Schätzung für Knopf und Vorschau)
  function changes() {
    if (memo.ch && memo.chRev === rev) return memo.ch;
    const out = changesCalc(); memo.ch = out; memo.chRev = rev; return out;
  }
  function changesCalc() {
    const S = MK().state; const out = { n: 0, changed: 0, moved: 0, added: 0, removed: 0, pages: {}, ids: {} };
    const seen = {};
    S.pages.forEach(p => {
      const pg = { new: 0, changed: 0, moved: 0, removed: 0, items: [] }; let any = false;
      MK().computeAll(p).leaves.forEach(l => {
        const v = l.node.visual; if (!v) return; const id = l.node.id; seen[id] = true;
        const name = v.title || ((MK().catalog.byId[v.kind] || {}).label) || v.kind;
        if (!dep.fps || !(id in dep.fps)) { pg.new++; pg.items.push({ k: 'new', name }); out.ids[id] = 'new'; any = true; return; }
        const d = fpDiff(dep.fps[id], tileFp(l)); if (d === 'same') return;
        if (d === 'moved') { pg.moved++; pg.items.push({ k: 'mov', name }); } else { pg.changed++; pg.items.push({ k: 'chg', name }); }
        out.ids[id] = d === 'moved' ? 'moved' : 'changed'; any = true;
      });
      if (any) out.pages[p.name] = pg;
      out.changed += pg.changed; out.moved += pg.moved; out.added += pg.new;
    });
    if (dep.fps) Object.keys(dep.fps).forEach(id => { if (!seen[id] && id !== '__design') out.removed++; });
    out.theme = !!(dep.fps && dep.fps.__design && dep.fps.__design !== fingerprints().__design);
    out.n = out.changed + out.moved + out.added + out.removed + (out.theme ? 1 : 0);
    return out;
  }

  // ------------------------------------------------------------------ Dateisystem
  async function listDir(dir) { const out = []; for await (const [name, h] of dir.entries()) out.push({ name, h }); return out; }
  async function readText(fileHandle) { return stripBom(await (await fileHandle.getFile()).text()); }
  async function writeFile(dir, name, text) { const fh = await dir.getFileHandle(name, { create: true }); const w = await fh.createWritable(); try { await w.write(text); } finally { await w.close(); } }
  function mockupDir(create) { return proj.root.getDirectoryHandle('mockup', { create: !!create }); }
  // mockup/ anlegen und absichern (Safety-Review 4): fehlt die .gitignore, schreibt das Kitchen dieselbe wie der Runner (alles lokal,
  // Allowlist), dazu eine kurze README. Vorhandene Dateien bleiben unangetastet (der Runner pflegt seine Form selbst).
  const GITIGNORE_ALLOW = ['.gitignore', 'mockup-spec.json', 'AGENT-BRIEF.md', 'model-approvals.json', 'README.md'];
  const GITIGNORE_TEXT = '# Von MockupKitchen live angelegt. Alles in mockup/ bleibt lokal: Status,\n# Sicherungen, Desktop- und Kitchen-Bilder mit echten Daten. Ins Repo gehören\n# nur die Dateien mit Ausrufezeichen.\n*\n' + GITIGNORE_ALLOW.map(n => '!' + n).join('\n') + '\n';
  const README_TEXT = '# mockup/ · Arbeitsordner von MockupKitchen live\n\nDiesen Ordner legen das MockupKitchen (Browser) und der Live-Helfer (Runner) an. Hier\ntauschen beide Dateien aus: die Skizze, Deploy-Anfragen, den Status, Bilder und Sicherungen.\nDer Bericht selbst liegt daneben in `<Name>.Report`, das Modell in `<Name>.SemanticModel`.\n\nIns Repo gehören nur:\n\n- `mockup-spec.json`: die Skizze (Seiten, Kacheln, Felder, Wünsche ans Modell)\n- `AGENT-BRIEF.md`: Kurzbeschreibung für Menschen und Agenten\n- `model-approvals.json`: Freigaben für Modelländerungen, mit Urheber und Zeit\n- `README.md`: diese Datei\n\nAlles andere bleibt lokal (`.gitignore`): Status (`agent-status.json`), Sicherungen\n(`backup/`), Desktop-Bilder (`shots/`), Kitchen-Bilder und Skizzen-Stände (`kitchen/`), Ausgaben des\nKonverters (`out/`), Protokolle und Verlauf (`.state/`). Die Bilder zeigen echte Daten.\n\nDen Ordner zu löschen schadet dem Bericht nicht. Verlauf und Sicherungen sind dann weg, und\nder nächste Deploy gleicht alles neu gegen den Bericht ab.\n\nDateivertrag: `mockup-live/CONTRACT.md` im MockupKitchen-Repo.\n';
  async function ensureMockupDir() {
    const dir = await mockupDir(true); const out = { gitignore: false, readme: false };
    for (const [name, text, key] of [['.gitignore', GITIGNORE_TEXT, 'gitignore'], ['README.md', README_TEXT, 'readme']]) {
      let exists = true; try { await dir.getFileHandle(name); } catch (e) { if (isGone(e)) exists = false; else throw e; }
      if (!exists) { await writeFile(dir, name, text); out[key] = true; }
    }
    return out;
  }
  // Pfad relativ zu mockup/ („shots/7/Übersicht.png"), auch mit Backslash oder führendem „mockup/"
  async function fileAt(rel) {
    let parts = String(rel || '').split(/[\\/]+/).filter(Boolean); if (parts[0] === 'mockup') parts = parts.slice(1);
    if (!parts.length) throw new DOMException('empty path', 'NotFoundError');
    let dir = await mockupDir(false);
    for (const seg of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(seg);
    const last = parts[parts.length - 1];
    try { return await (await dir.getFileHandle(last)).getFile(); } catch (e) { if (last.normalize('NFC') === last && last.normalize('NFD') !== last) return (await dir.getFileHandle(last.normalize('NFD'))).getFile(); throw e; }
  }
  async function readJsonAt(rel) { try { return JSON.parse(stripBom(await (await fileAt(rel)).text())); } catch (e) { if (isPerm(e)) lose(); return null; } }
  // Vor jedem Schreiben aus dem Kitchen (Deploy, Antworten, Freigaben): mockup/ kann während der Sitzung gelöscht worden sein, ohne
  // laufenden Runner fehlte dann die .gitignore vor Bildern und Skizzen-Ständen (Safety-Review 4). Andere Fehler als Rechte zählen nicht.
  async function guardMockupDir() { try { await ensureMockupDir(); } catch (e) { if (isPerm(e)) throw e; } }
  async function writeJson(name, obj) { const dir = await mockupDir(true); await guardMockupDir(); await writeFile(dir, name, JSON.stringify(obj, null, 2) + '\n'); }

  // Projekte in einem Ordner: <Name>.pbip (samt Report-Pfad aus der .pbip) oder ein .Report- mit .SemanticModel-Ordner.
  async function findProjects(dir, prefix) {
    const list = await listDir(dir);
    const pbips = list.filter(e => e.h.kind === 'file' && /\.pbip$/i.test(e.name));
    const reps = list.filter(e => e.h.kind === 'directory' && /\.Report$/i.test(e.name));
    const models = list.filter(e => e.h.kind === 'directory' && /\.SemanticModel$/i.test(e.name));
    const byName = (arr, n) => arr.find(e => e.name.toLowerCase() === String(n).toLowerCase());
    async function modelFor(rep, name) {
      try {
        const j = JSON.parse(await readText(await rep.getFileHandle('definition.pbir'))); const ref = (j && j.datasetReference) || {};
        if (ref.byPath && ref.byPath.path) { const base = String(ref.byPath.path).split(/[\\/]+/).filter(Boolean).pop(); const hit = byName(models, base); if (hit) return hit.h; }
        else if (ref.byConnection) return null;
      } catch (e) { /* ohne definition.pbir nach Namen gehen */ }
      const same = byName(models, name + '.SemanticModel'); if (same) return same.h;
      return models.length === 1 ? models[0].h : null;
    }
    const out = [];
    for (const pb of pbips) {
      const name = pb.name.replace(/\.pbip$/i, ''); let repName = name + '.Report';
      try { const j = JSON.parse(await readText(pb.h)); const a = ((j && j.artifacts) || []).find(x => x && x.report && x.report.path); if (a) repName = String(a.report.path).split(/[\\/]+/).filter(Boolean).pop(); } catch (e) { /* Standardname */ }
      const rep = byName(reps, repName) || (reps.length === 1 ? reps[0] : null);
      out.push({ root: dir, name, report: rep ? rep.h : null, model: rep ? await modelFor(rep.h, name) : ((byName(models, name + '.SemanticModel') || (models.length === 1 ? models[0] : {})).h || null), path: (prefix || '') + pb.name });
    }
    if (!pbips.length && reps.length && models.length) {
      for (const r of reps) { const name = r.name.replace(/\.Report$/i, ''); out.push({ root: dir, name, report: r.h, model: await modelFor(r.h, name), path: (prefix || '') + r.name }); }
    }
    return out;
  }
  async function projectsIn(dir) {
    let c = await findProjects(dir);
    if (c.length) return c;
    const subs = (await listDir(dir)).filter(e => e.h.kind === 'directory' && !e.name.startsWith('.') && !/\.(Report|SemanticModel)$/i.test(e.name) && !/^(node_modules|mockup)$/i.test(e.name)).slice(0, 60);
    for (const s of subs) { try { c = c.concat(await findProjects(s.h, s.name + '/')); } catch (e) { /* nicht lesbar: überspringen */ } }
    return c;
  }
  function choose(cands) {
    return new Promise(resolve => {
      const dlg = $('#dlgLivePick'), body = $('#dlgLivePickBody'); if (!dlg || !body) { resolve(cands[0]); return; }
      let done = false; const fin = v => { if (!done) { done = true; resolve(v); } };
      body.innerHTML = cands.map((c, i) => `<button type="button" class="typebtn lv-pick" data-i="${i}"><span><b>${esc(c.name)}</b><small class="mono">${esc(c.path)}</small></span></button>`).join('');
      body.onclick = e => { const b = e.target.closest('[data-i]'); if (b) { fin(cands[+b.dataset.i]); dlg.close(); } };
      dlg.addEventListener('close', () => fin(null), { once: true });
      dlg.showModal(); const first = $('[data-i]', body); if (first) first.focus();
    });
  }

  // ------------------------------------------------------------------ Verbinden
  async function connect() {
    if (!SUPPORTED) { toast(t('live.unsupported')); return; }
    let dir;
    try { const o = { mode: 'readwrite', id: 'mk-pbip' }; if (pickHint) o.startIn = pickHint; dir = await window.showDirectoryPicker(o); }
    catch (e) { if (e && e.name !== 'AbortError') toast(t('live.toast.pickFailed', { msg: e.message || e.name })); return; }
    if (/\.(Report|SemanticModel)$/i.test(dir.name)) { pickHint = dir; toast(t('live.toast.pickParent', { f: dir.name })); return; }
    let cands;
    try { cands = await projectsIn(dir); } catch (e) { toast(t('live.toast.pickFailed', { msg: e.message || e.name })); return; }
    if (!cands.length) { pickHint = dir; toast(t('live.toast.noProject')); return; }
    // ?project=<Name> wählt bei mehreren Projekten vor
    const hinted = projectHint ? cands.find(x => x.name.toLowerCase() === projectHint.toLowerCase()) : null;
    const c = hinted || (cands.length === 1 ? cands[0] : await choose(cands));
    if (c) await open(c);
  }
  async function reconnect() {
    if (!stored || !stored.handle) return;
    const rec = stored; let perm = 'denied';
    try { perm = await rec.handle.requestPermission({ mode: 'readwrite' }); } catch (e) { perm = 'denied'; }
    if (perm !== 'granted') { await forget(); toast(t('live.toast.denied')); return; }
    let cands;
    try { cands = await findProjects(rec.handle); } catch (e) { await forget(); toast(t('live.toast.pickFailed', { msg: e.message || e.name })); return; }
    const c = cands.find(x => x.name === rec.name) || (cands.length === 1 ? cands[0] : null) || (cands.length ? await choose(cands) : null);
    if (!c) { await forget(); toast(t('live.toast.reconnectGone', { name: rec.name })); return; }
    await open(c);
  }
  async function open(c) {
    stopConn(true);
    proj = { root: c.root, name: c.name, report: c.report, model: c.model, path: c.path };
    stored = null; dep = loadDep(c.name); status = null; statusRaw = ''; statusMtime = 0; statusSeen = false; toastKey = ''; lastCmp = null;
    session = null; doctor = null; doctorAt = 0; approvals = null; plan = null; dismissed = {}; appliedAt = 0; arrivedSeq = 0; awaitKey = ''; confirmed = null;
    try { await idbSet({ handle: c.root, name: c.name }); } catch (e) { /* ohne Merken weiter, dann eben kein Wieder-verbinden */ }
    try { await ensureMockupDir(); } catch (e) { if (isPerm(e)) { lose(); return; } }
    bump(); updateUi(); toast(t('live.toast.connected', { name: c.name }));
    if (projectHint && projectHint.toLowerCase() !== c.name.toLowerCase()) toast(t('live.toast.projectHint', { p: projectHint, name: c.name }));
    // PBIP ist die Wahrheit: erst das Modell, dann (falls pbir-import.js da ist) das Layout
    if (c.model) {
      let files = [];
      try { const tables = await (await c.model.getDirectoryHandle('definition')).getDirectoryHandle('tables'); for (const e of await listDir(tables)) if (e.h.kind === 'file' && /\.tmdl$/i.test(e.name)) files.push(await e.h.getFile()); }
      catch (e) { files = []; }
      if (files.length && MK().ingestTmdlFiles) await MK().ingestTmdlFiles(files, { source: c.name });
      else toast(t('live.toast.noTmdl'));
    } else toast(t('live.toast.noModel'));
    if (c.report && window.MK_PBIR && typeof window.MK_PBIR.readDir === 'function') {
      try {
        const r = await window.MK_PBIR.readDir(c.report); const pages = (r && r.pages) || []; const warns = (r && r.warnings) || [];
        if (pages.length && window.confirm(t('live.ask.layout', { name: c.name, n: pages.length }))) {
          const ok = typeof window.MK_PBIR.applyTo === 'function' ? window.MK_PBIR.applyTo(MK(), r) : MK().setPages(pages, { canvas: r.canvas });
          // Grundlinie für den Runner: das eingelesene Layout gilt als schon angewendet
          if (ok && window.MK_EXPORT) { try { await writeFile(await mockupDir(true), 'baseline-spec.json', JSON.stringify(window.MK_EXPORT.buildSpec(), null, 2)); } catch (e) { /* ohne Grundlinie gilt die Delta-Regel aus CONTRACT.md */ } }
          if (ok) toast(warns.length ? t('live.toast.layoutWarn', { n: pages.length, w: warns.length }) : t('live.toast.layoutOk', { n: pages.length }));
          // Übernommenes Layout und übernommene Gestaltung (B2) zählen nicht als Änderung: Fingerabdrücke von jetzt
          if (ok) { bump(); setFps(dep.real); saveDep(); }
        }
        if (warns.length && window.console) console.info('[MockupKitchen live] Layout-Hinweise', warns);
      } catch (e) { toast(t('live.toast.layoutFailed', { msg: e.message || e.name })); }
    }
    if (!proj) return;
    approvals = await readJsonAt(FILES.approvals); bump();
    schedule(0); await poll(); startPoll();
  }
  // Verbindung beenden. keep: den gemerkten Ordner nicht vergessen (für „Wieder verbinden")
  function stopConn(keep) {
    clearTimeout(writeT); writeT = null; clearTimeout(pollT); pollT = null; clearInterval(tickT); tickT = null;
    if (shot.url) URL.revokeObjectURL(shot.url);
    shot.url = null; shot.key = null; shot.on = false;
    Object.values(cmp.urls).forEach(u => URL.revokeObjectURL(u)); cmp.urls = {}; cmp.key = ''; cmp.seq = 0; cmp.tiles = null;
    Object.values(res.urls).forEach(u => URL.revokeObjectURL(u)); res.urls = {}; res.key = ''; closeResult();
    Object.values(hist.urls).forEach(u => URL.revokeObjectURL(u)); hist.urls = {}; hist.loading = {};
    closeMenus(); closePreview(); closeDialogs();
    proj = null; status = null; statusRaw = ''; session = null; doctor = null; approvals = null; plan = null; restoredSeq = 0; restoredNote = null; bump();
    if (!keep) stored = null;
  }
  function lose() { const rec = proj ? { handle: proj.root, name: proj.name } : null; stopConn(true); stored = rec; renderAll(); toast(t('live.toast.permission')); }
  async function forget() { stored = null; try { await idbSet(null); } catch (e) { /* egal */ } updateUi(); }
  async function disconnect() {
    const name = proj ? proj.name : (stored ? stored.name : '');
    stopConn(false); try { await idbSet(null); } catch (e) { /* egal */ }
    const dlg = $('#dlgLive'); if (dlg && dlg.open) dlg.close();
    renderAll(); if (name) toast(t('live.toast.disconnected', { name }));
  }

  // ------------------------------------------------------------------ Spec laufend schreiben
  function buildFiles() {
    const spec = window.MK_EXPORT.buildSpec();
    const cmpS = JSON.stringify(Object.assign({}, spec, { meta: Object.assign({}, spec.meta, { exportedAt: '' }) }));
    return { spec, cmp: cmpS };
  }
  async function doWrite(force) {
    if (!proj || !window.MK_EXPORT) return null;
    const f = buildFiles();
    if (!force && f.cmp === lastCmp) return f.spec;
    const brief = window.MK_EXPORT.buildBrief(f.spec);
    const dir = await mockupDir(true);
    await writeFile(dir, FILES.spec, JSON.stringify(f.spec, null, 2) + '\n');
    await writeFile(dir, FILES.brief, brief);
    lastCmp = f.cmp; lastWriteAt = Date.now();
    return f.spec;
  }
  function enqueue(force) { const p = queue.then(() => doWrite(force)); queue = p.catch(() => null); return p; }
  function schedule(ms) {
    if (!proj) return;
    clearTimeout(writeT);
    writeT = setTimeout(() => { writeT = null; enqueue(false).then(() => refreshDialog()).catch(e => { if (isPerm(e)) lose(); else toast(t('live.toast.writeFailed', { msg: e.message || e.name })); }); }, ms == null ? WRITE_MS : ms);
  }

  // ------------------------------------------------------------------ Vergleichsbild (Kitchen-Seite für den Bildvergleich des Runners)
  const fileSafe = s => String(s == null ? '' : s).normalize('NFC').replace(/[\\/:*?"<>|\u0000-\u001F]+/g, '_').replace(/[. ]+$/, '').slice(0, 120) || 'Seite';
  let compareP = Promise.resolve(null);
  function writeCompare(dir, seq, spec) {
    if (!window.MK_PNG || typeof window.MK_PNG.renderPage !== 'function') return Promise.resolve(null);
    const S = MK().state;
    // Skizzen-Stand dieses Deploys (für „Zurück zu Deploy n": das Kitchen lädt ihn verlustfrei, .state/specs/<n>.json ist der Rückfall)
    const snapshot = JSON.stringify(S);
    // Seiten nacheinander in kleinen Gruppen rastern (23 Seiten auf einmal würden die Oberfläche blockieren); Bildschirm bleibt bedienbar
    const pages0 = S.pages.slice(); const jobs = []; const LANES = 2;
    return (async () => {
      const kdir = await (await dir.getDirectoryHandle('kitchen', { create: true })).getDirectoryHandle(String(seq), { create: true });
      try { await writeFile(kdir, 'state.json', snapshot); } catch (e) { if (isPerm(e)) throw e; /* ohne Stand bleibt der Rückfall über die Spec */ }
      const used = {}; const pages = []; const tiles = {};
      let next = 0;
      const lane = async () => { while (next < pages0.length) { const p = pages0[next++]; let r = null; try { r = await window.MK_PNG.renderPage(p.id, { scale: 1, compare: true }); } catch (e) { r = { err: e }; } jobs.push({ p, r }); } };
      await Promise.all(Array.from({ length: Math.min(LANES, pages0.length) }, lane));
      jobs.sort((a, b) => pages0.indexOf(a.p) - pages0.indexOf(b.p));
      for (const { p, r } of jobs) {
        if (!r || r.err) throw (r && r.err) || new Error('render');
        let base = fileSafe(p.name); if (used[base.toLowerCase()]) base += '_' + (pages.length + 1); used[base.toLowerCase()] = true;
        const file = base + '.png';
        await writeFile(kdir, file, r.blob);
        const sp = (spec.pages || []).find(x => x.id === p.id) || {};
        pages.push({ id: p.id, name: p.name, file, png: 'kitchen/' + seq + '/' + file, width: r.w, height: r.h, pbir: sp.pbir || null, zones: r.zones || {} });
        Object.keys(r.tiles || {}).forEach(id => {
          const v = (sp.visuals || []).find(x => x.stableId === id) || {};
          tiles[id] = Object.assign({ page: p.name, id: v.id || 'mk_' + id, kind: v.kind || null, title: v.title || '', displayName: v.displayName || v.title || '' }, r.tiles[id]);
        });
      }
      const out = { contract: CONTRACT, seq, specHash: spec.meta.specHash, createdAt: isoLocal(new Date()), client: 'MockupKitchen ' + window.MK_VERSION, scale: 1, pages, tiles };
      await writeFile(kdir, 'tiles.json', JSON.stringify(out, null, 2) + '\n');
      return out;
    })();
  }

  // ------------------------------------------------------------------ Deploy, Vorschau, Vorbereiten, Zurück (deploy-request.json)
  function sessionId() { return (status && status.runner && status.runner.sessionId) || (session && session.sessionId) || kitchenSession(); }
  let kSession = '';
  function kitchenSession() { if (kSession) return kSession; try { kSession = sessionStorage.getItem('mockupkitchen.live.session') || ''; } catch (e) { /* blockiert */ } if (!kSession) { kSession = 'k-' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem('mockupkitchen.live.session', kSession); } catch (e) { /* blockiert */ } } return kSession; }
  // opts: { scope: all|layout|theme|model|measure, dryRun, prepare, restore: {fromBackup} }
  async function deploy(opts) {
    opts = opts || {};
    if (!proj || deploying) return null;
    if (mismatch() && !opts.dryRun) { toast(t('live.toast.locked')); flashRow(); return null; }
    deploying = true; updateUi(); closeMenus();
    let seq = 0;
    try {
      clearTimeout(writeT); writeT = null;
      const spec = await enqueue(true);
      if (!spec) throw new Error('MK_EXPORT');
      const dir = await mockupDir(true);
      await guardMockupDir();
      let prev = 0; try { const r = JSON.parse(await readText(await dir.getFileHandle(FILES.request))); prev = +r.seq || 0; } catch (e) { /* noch keine Anfrage */ }
      seq = Math.max(dep.seq || 0, (status && +status.seq) || 0, prev) + 1;
      const real = !opts.dryRun && !opts.prepare;
      let cmpJob = Promise.resolve(null);
      if (real) { try { cmpJob = writeCompare(dir, seq, spec); } catch (e) { cmpJob = Promise.reject(e); } cmpJob.catch(() => null); }
      const req = { contract: CONTRACT, seq, requestedAt: isoLocal(new Date()), specHash: spec.meta.specHash, target: 'desktop', client: 'MockupKitchen ' + window.MK_VERSION, sessionId: sessionId() };
      if (opts.scope && opts.scope !== 'all') req.scope = opts.scope;
      if (opts.dryRun) req.dryRun = true;
      if (opts.prepare) req.prepare = true;
      if (opts.restore) req.restore = opts.restore;
      await writeFile(dir, FILES.request, JSON.stringify(req, null, 2) + '\n');
      dep.seq = seq;
      // Fingerabdrücke von vor dem Deploy merken: endet er mit cancelled, failed oder blocked, ist nichts angekommen und die
      // Änderungen zählen wieder als offen (sonst stünde danach „✓ Aktuell")
      if (real) { dep.prevFps = dep.fps; dep.prevSeq = dep.fpsSeq; dep.prevReal = dep.real; dep.real = seq; setFps(seq); }
      saveDep();
      if (opts.quiet) { /* Aufrufer meldet selbst */ }
      else if (opts.dryRun) toast(t('live.toast.dryRunSent'));
      else if (opts.prepare) toast(t('live.toast.prepareSent', { bon: bon(seq) }));
      else if (opts.restore) toast(t('live.toast.restoreSent', { bon: bon(opts.restore.fromBackup), seq }));
      else if (opts.scope === 'measure') toast(t('live.toast.measureSent', { bon: bon(seq) }));
      else toast(alive() ? t('live.toast.deploySent', { n: seq }) : t('live.toast.deployInactive', { n: seq }));
      if (real) compareP = cmpJob.catch(e => { if (isPerm(e)) lose(); else toast(t('live.toast.renderFailed', { msg: e.message || e.name })); return null; }).then(r => { refreshDialog(); return r; });
    } catch (e) {
      if (isPerm(e)) lose(); else toast(t('live.toast.writeFailed', { msg: e.message || e.name }));
      seq = 0;
    } finally { deploying = false; renderAll(); refreshDialog(); }
    return seq || null;
  }
  // Neu messen ohne Deploy: scope „measure", wenn der Runner es kennt (runner.scopes), sonst ein Deploy ohne Änderung
  function measure() {
    const scopes = status && status.runner && (status.runner.scopes || status.runner.features);
    if (Array.isArray(scopes) && scopes.includes('measure')) return deploy({ scope: 'measure' });
    return deploy({ scope: 'all', quiet: true }).then(seq => { if (seq) toast(t('live.toast.measureUnsupported')); return seq; });
  }
  // Beschriftung einer Antwort. Bei kind „unsaved“ startet Desktop nicht neu, der Deploy lädt nur neu (eigene Texte, Safety-Review 2 (9));
  // bei updateOnly heißt skipRestart „Vorhandene Version behalten“ (B7).
  function answerLabel(o, aw) {
    aw = aw || {};
    if (o === 'skipRestart' && aw.updateOnly) return t('live.confirm.keepVersion');
    if (aw.kind === 'unsaved' && has('live.confirmU.' + o)) return t('live.confirmU.' + o);
    return has('live.confirm.' + o) ? t('live.confirm.' + o) : o;
  }
  async function confirmAction(action) {
    if (!proj || !status || !status.awaiting) return;
    const seq = +status.seq || dep.seq;
    try { await writeJson(FILES.confirm, { seq, action, at: isoLocal(new Date()) }); confirmed = { seq, action, at: Date.now(), label: answerLabel(action, status.awaiting) }; toast(t('live.toast.confirmSent', { a: confirmed.label })); }
    catch (e) { if (isPerm(e)) lose(); else toast(t('live.toast.writeFailed', { msg: e.message || e.name })); }
    renderAll();
  }
  // Abgelegte, noch nicht aufgenommene Anfrage zurückziehen (Esc)
  async function cancelPending() {
    if (!proj || !dep.seq || (status && +status.seq >= dep.seq && alive())) return false;
    const seq = dep.seq;
    try { await writeJson(FILES.cancel, { seq, at: isoLocal(new Date()) }); } catch (e) { if (isPerm(e)) lose(); return false; }
    dismissed['cancelled:' + seq] = false; dep.cancelled = seq; saveDep(); toast(t('live.toast.cancelled', { bon: bon(seq) })); renderAll();
    return true;
  }

  // ------------------------------------------------------------------ Status des Runners
  function startPoll() { clearTimeout(pollT); if (!proj) return; pollT = setTimeout(async () => { await poll(); startPoll(); }, POLL_MS); }
  async function poll() {
    if (!proj) return;
    const before = statusRaw;
    try {
      const dir = await mockupDir(false); const f = await (await dir.getFileHandle(FILES.status)).getFile();
      const txt = stripBom(await f.text());
      if (txt !== statusRaw) { try { status = JSON.parse(txt); statusRaw = txt; statusMtime = f.lastModified; } catch (e) { /* halb geschrieben: beim nächsten Lauf erneut */ } }
    } catch (e) {
      if (isPerm(e)) { lose(); return; }
      if (isGone(e)) { status = null; statusRaw = ''; statusMtime = 0; }
    }
    if (!proj) return;
    if (!session || statusRaw !== before) session = await readJsonAt(FILES.session);
    if (Date.now() - doctorAt > 10000 || statusRaw !== before) { const d0 = JSON.stringify(doctor); doctor = await readJsonAt(FILES.doctor); doctorAt = Date.now(); if (JSON.stringify(doctor) !== d0) bump(); }
    if (!proj) return;
    if (statusRaw !== before) { bump(); onStatus(); await loadShot(); }
    else if (!shot.key && shotPath()) await loadShot();
    renderAll(); refreshDialog();
  }
  function heartbeat() { if (!status) return 0; const hb = Date.parse(status.runner && status.runner.heartbeatAt); return isNaN(hb) ? statusMtime : hb; }
  function alive() { const hb = heartbeat(); return !!hb && Date.now() - hb <= STALE_MS; }
  // Runner 0.1 kennt runner.state noch nicht: dann zählt state: running oben im Dokument
  const runnerState = () => (status && status.runner && status.runner.state) || (status && status.state === 'running' ? 'running' : 'idle');
  const busy = () => alive() && (runnerState() === 'running' || runnerState() === 'awaiting');
  const curStep = () => (status && status.runner && status.runner.current) || null;
  // Laufende Station: aus runner.current, sonst die erste noch nicht gemeldete nach den gemeldeten Schritten
  function activeStation() { const s = stationOf(curStep()); if (s) return s; const hit = stationStates().find(x => x.state === 'run'); return hit ? hit.id : null; }
  const deskInfo = () => (status && (status.desktopLive || status.desktop)) || null;
  function histAvg() { const h = (status && status.history) || []; const ms = h.filter(x => x && x.state === 'applied' && +x.ms > 0 && !x.restart).map(x => +x.ms); return ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : 0; }
  function estMs() { const p = status && status.plan; if (p && +p.estMs > 0 && (+status.seq || 0) >= (dep.real || 0)) return +p.estMs; return histAvg() || 9000; }
  function elapsedMs() { const t0 = Date.parse(status && status.startedAt); return isNaN(t0) ? Math.max(0, Date.now() - statusMtime) : Math.max(0, Date.now() - t0); }
  // Übergänge melden: Toast nur für Echos, Ankunft (Kaskade), „angewendet" für den Knopf (4 s)
  function onStatus() {
    if (!status) return;
    const seq = +status.seq || 0; const key = seq + ':' + status.state;
    const terminal = ['applied', 'blocked', 'failed', 'cancelled', 'planned'].includes(status.state);
    if (statusSeen && key !== toastKey && terminal && seq >= (dep.real || 0) && status.state === 'applied' && runnerState() !== 'running') {
      appliedAt = Date.now(); appliedSeq = seq; if (seq === dep.real) arrivedSeq = 0;
      setTimeout(() => { renderAll(); }, APPLIED_MS + 50);
    }
    if (key !== toastKey && status.state === 'planned' && plan && plan.seq === seq) { plan.remote = status.plan || {}; renderPreview(); }
    if (status.awaiting && status.awaiting.kind === 'approval') { /* Bandzeile reicht */ }
    toastKey = key; statusSeen = true;
    if (status.state === 'cancelled' && seq === dep.cancelled) dep.cancelled = 0;
    // Nichts angekommen (cancelled, failed, blocked): Fingerabdrücke von vor dem Deploy, die Änderungen bleiben offen
    if (['cancelled', 'failed', 'blocked'].includes(status.state) && seq === dep.real && dep.prevFps && dep.rolledBack !== seq) {
      dep.fps = dep.prevFps; dep.fpsSeq = dep.prevSeq || 0; dep.real = dep.prevReal || 0; dep.rolledBack = seq; dep.prevFps = null; bump(); saveDep();
    }
    // Zurück zu Deploy n angekommen: Skizze auf den Stand von n setzen (sonst brächte der nächste Deploy die späteren Änderungen zurück)
    if (status.state === 'applied' && status.restored && seq === dep.seq && seq !== restoredSeq) { restoredSeq = seq; loadRestored(seq, status.restored); }
  }
  // Seq, zu der pages/visuals/todos im Status gehören: Vorschau und Abbruch behalten den letzten Deploy (CONTRACT „previous")
  function resSeqOf() {
    if (!status) return 0;
    if ((status.state === 'planned' || status.state === 'cancelled') && status.previous && +status.previous.seq) return +status.previous.seq;
    return +status.seq || 0;
  }

  // ------------------------------------------------------------------ Zurück zu Deploy n: Skizze auf den Stand von n (Strg+Z holt den vorigen zurück)
  // Quelle 1: kitchen/<n>/state.json (Kitchen-Stand beim Deploy, verlustfrei). Quelle 2: mockup/.state/specs/<n>.json (Spec, Rückweg
  // best effort: Seiten, Raster, Kacheln, Bindungen, Analyse, Rahmen, Gestaltung; Modell und Sprache bleiben die aktuellen).
  async function loadRestored(seq, info) {
    const n = +info.fromBackup || 0; let st = null, src = '';
    try { st = await readJsonAt('kitchen/' + n + '/state.json'); } catch (e) { st = null; }
    if (st && Array.isArray(st.pages) && st.pages.length) src = 'state';
    else {
      st = null; const spec = info.spec ? await readJsonAt(info.spec) : null;
      if (spec && Array.isArray(spec.pages) && spec.pages.length) { try { st = stateFromSpec(spec); src = 'spec'; } catch (e) { st = null; } }
    }
    if (!proj) return;
    if (!st) { restoredNote = { seq, n, ok: false }; toast(t('live.toast.restoreNoSketch', { bon: bon(n) })); renderAll(); return; }
    const cur = MK().state; st.model = cur.model; st.lang = cur.lang; if (cur.demoId) st.demoId = cur.demoId;
    MK().state = st;                                   // ein Rückgängig-Schritt (commit)
    bump(); lastCmp = null; dep.real = seq; setFps(seq); saveDep();
    restoredNote = { seq, n, ok: true, src }; dismissed['restored:' + seq] = false;
    toast(t('live.toast.restored', { bon: bon(n) })); schedule(0); renderAll();
  }
  // Spec → Kitchen-Stand (Umkehrung von export.js buildSpec, soweit die Spec es hergibt)
  function stateFromSpec(spec) {
    const cur = JSON.parse(JSON.stringify(MK().state)); const k = +((spec.canvas || {}).uiScale) || MK().ui() || 1;
    const PAGE_BG = MK().pageBg || { light: '#F4F4F1', soft: '#EEF1F5', white: '#FFFFFF' };
    const up = s => String(s || '').toUpperCase();
    const cv = spec.canvas || {}; if (cv.width > 0 && cv.height > 0) cur.canvas = { w: +cv.width, h: +cv.height, preset: cv.preset || (cv.width + 'x' + cv.height) };
    const base = (spec.spacing || {}).base; if (base) cur.spacing = { margin: +base.margin || cur.spacing.margin, gutter: +base.gutter || cur.spacing.gutter, pad: base.tilePadding == null ? cur.spacing.pad : +base.tilePadding };
    const d = spec.design || {}; const col = d.colors || {};
    if (d.tileStyle) cur.design.tile = d.tileStyle; if (d.cornerRadius != null) cur.design.radius = Math.round(+d.cornerRadius / k * 1e6) / 1e6;
    if (d.pageBackground) { const hex = up(d.pageBackground); const pre = Object.keys(PAGE_BG).find(x => up(PAGE_BG[x]) === hex); if (pre) cur.design.pageBg = pre; else { cur.design.pageBg = 'custom'; cur.design.pageBgHex = hex; } }
    if (d.tileBackground) cur.design.tileBg = up(d.tileBackground); if (col.ink) cur.design.ink = up(col.ink); if (d.accent) cur.design.accent = d.accent;
    if (d.headerStyle) { cur.design.header = d.headerStyle; if (d.headerStyle === 'custom') { if (col.headerBackground) cur.design.headerBg = up(col.headerBackground); if (col.headerInk) cur.design.headerInk = up(col.headerInk); } }
    if (d.variancePalette) cur.design.palette = d.variancePalette; if (d.nativePalette) cur.design.nativePalette = d.nativePalette;
    if (d.typography) { const ty = {}; ['scale', 'title', 'sub', 'chart'].forEach(x => { if (d.typography[x] != null) ty[x] = +d.typography[x]; }); if (Object.keys(ty).length) cur.design.typo = ty; }
    const z = spec.zones || {}; const c = cur.chrome;
    if (z.header) { c.header.on = true; c.header.h = Math.round(z.header.h / k * 1e6) / 1e6; if (z.header.title != null) c.header.title = z.header.title; if (z.header.subtitle != null) c.header.sub = z.header.subtitle; if (z.header.logoPos) c.header.logoPos = z.header.logoPos; c.header.navAuto = z.header.navAuto !== false; c.header.navOn = !!z.header.navOn; if (c.header.dflt) delete c.header.dflt; } else c.header.on = false;
    if (z.nav) { c.nav.on = true; c.nav.w = Math.round(z.nav.w / k * 1e6) / 1e6; } else c.nav.on = false;
    if (z.footer) { c.footer.on = true; c.footer.h = Math.round(z.footer.h / k * 1e6) / 1e6; if (z.footer.text != null) c.footer.text = z.footer.text; if (c.footer.dflt) delete c.footer.dflt; } else c.footer.on = false;
    if (z.filter) { c.filter.on = true; const side = z.filter.mode || z.filter.side || 'right'; c.filter.side = side; c.filter.collapsible = !!z.filter.collapsible; if (side === 'left' || side === 'right' || side === 'burger') c.filter.w = Math.round(z.filter.w / k * 1e6) / 1e6; else if (side === 'top') c.filter.topH = Math.round(z.filter.h / k * 1e6) / 1e6;
      c.filter.fields = (z.filter.slicers || []).map(f => ({ table: f.table, name: f.name, kind: f.kind || 'column', isNew: !!f.isNew, type: f.type || 'dropdown', default: f.default || '' })); } else c.filter.on = false;
    const navPos = (z.header && z.header.navPosition) || (z.footer && z.footer.navPosition); if (navPos) c.navPos = navPos;
    const analysisOf = a => { a = a || {}; const o = {};
      if (a.polarity && !a.polarityAuto) o.polarity = a.polarity; const db = a.deltaBasisSource === 'explicit' ? a.deltaBasis : a.deltaBasisRequested; if (db) o.deltaBasis = db;
      if (Array.isArray(a.deltaKind)) o.deltaKind = a.deltaKind.slice(); if (a.unit) o.unit = a.unit; if (a.displayUnits) o.displayUnits = a.displayUnits; if (a.decimals != null) o.decimals = a.decimals;
      if (a.sort) o.sort = a.sort; if (a.topN) o.topN = a.topN; if (a.timeGrain) o.timeGrain = a.timeGrain; if (a.cumulative) o.cumulative = true; if (a.scaleGroup) o.scaleGroup = a.scaleGroup; if (a.message) o.message = a.message;
      if (a.smallMultiples) o.smallMultiples = true; if (a.fieldParam) { o.fieldParam = true; if (a.fieldParam.name) o.fieldParamName = a.fieldParam.name; }
      return o; };
    const visualOf = sv => { const w = sv.workshop || {}; const roles = {};
      Object.keys(sv.roles || {}).forEach(key => { roles[key] = (sv.roles[key] || []).map(f => ({ table: f.table, name: f.name, kind: f.kind || 'column', isNew: !!f.isNew })); });
      const v = { kind: sv.kind, engine: sv.engine || 'native', title: sv.titleShown && sv.title && sv.title !== sv.label ? sv.title : '', sub: sv.subtitle || '', scenario: sv.scenario || cur.defScenario || 'AC/PL', roles, notes: sv.notes || '', link: sv.link && sv.link.pageId ? sv.link.pageId : '', content: sv.content || '', analysis: analysisOf(sv.analysis), priority: w.priority || '', status: w.status || 'open', openQuestion: !!w.openQuestion };
      if (sv.typography && sv.typography.scale) v.typo = { scale: +sv.typography.scale }; if (sv.interaction) v.interaction = { drillDown: !!sv.interaction.drillDown, crossFilter: sv.interaction.crossFilter !== false };
      if (sv.pbir && sv.pbir.page) v.pbir = Object.assign({}, sv.pbir); return v; };
    const uid = () => Math.random().toString(36).slice(2, 9);
    const nodeOf = (n, byId) => { if (!n) return { id: uid(), type: 'leaf', visual: null };
      if (n.grid) return { id: uid(), type: 'grid', cols: n.grid.cols.slice(), rows: n.grid.rows.slice(), children: (n.cells || []).map(cl => ({ r: cl.row, c: cl.col, rs: cl.rowSpan || 1, cs: cl.colSpan || 1, node: nodeOf(cl.node, byId) })) };
      if (n.split) return { id: uid(), type: 'split', dir: n.split, children: (n.children || []).map(ch => ({ size: +ch.size || 1, node: nodeOf(ch.node, byId) })) };
      const sv = n.stableId ? byId[n.stableId] : null; return { id: n.stableId || uid(), type: 'leaf', visual: sv ? visualOf(sv) : null }; };
    cur.pages = spec.pages.map(p => { const byId = {}; (p.visuals || []).forEach(sv => { if (sv.stableId) byId[sv.stableId] = sv; });
      return { id: p.id || uid(), name: p.name, notes: p.notes || '', question: p.question || '', layout: p.layoutTree ? nodeOf(p.layoutTree, byId) : { id: uid(), type: 'leaf', visual: null }, pbir: p.pbir && p.pbir.page ? { page: p.pbir.page } : undefined }; });
    cur.cur = cur.pages[0].id; if (spec.report && spec.report.name) cur.name = spec.report.name;
    return cur;
  }
  // Pfadabgleich (UX-KONZEPT 5): Ordner im Kitchen, Pfad des Live-Helfers, Pfad aus desktop-session.json
  function mismatch() {
    if (!proj) return null;
    // Ordnernamen mit Leerzeichen und Umlauten: NFC-normalisiert und ohne Groß/Klein vergleichen
    const base = p => nfc(String(p || '').replace(/[\\/]+$/, '').split(/[\\/]/).pop()).toLowerCase();
    const full = p => nfc(String(p || '').replace(/[\\/]+$/, '')).toLowerCase();
    const k = proj.root.name; const kn = nfc(k).toLowerCase(); const rp = status && status.runner && status.runner.projectPath; const sp = session && session.projectPath;
    if (rp && base(rp) !== kn) return { k, r: rp, d: sp };
    if (sp && base(sp) !== kn) return { k, r: rp || '', d: sp };
    if (rp && sp && full(rp) !== full(sp)) return { k, r: rp, d: sp };
    return null;
  }
  function projectPath() { return (status && status.runner && status.runner.projectPath) || (session && session.projectPath) || ''; }

  // ------------------------------------------------------------------ Freigaben (model-approvals.json, neue Form mit Hash)
  function approvalTodos() { const todos = (status && Array.isArray(status.todos)) ? status.todos : []; return todos.filter(x => x && x.kind === 'model' && x.id && (x.needsApproval || x.staleApproval || x.retry)); }
  function approvalEntries() { const a = approvals || {}; const list = Array.isArray(a.approvals) ? a.approvals.slice() : []; (Array.isArray(a.ids) ? a.ids : []).forEach(id => { if (!list.find(x => x && x.id === id)) list.push({ id, hash: null, legacy: true, overrides: (a.overrides || {})[id] || null }); }); return list; }
  function approvalOf(id) { return approvalEntries().find(x => x && x.id === id) || null; }
  // Stand einer Freigabe: open · approved · stale (Hash passt nicht mehr, Altform ohne Hash) · retry (fehlgeschlagen oder zurückgerollt,
  // erneute Freigabe mit neuem „at" öffnet sie wieder) · noted (te aus) · rejected (nur lokal)
  function approvalState(todo) {
    const e = approvalOf(todo.id); const rej = dep.rows['rej:' + todo.id];
    if (!e) return todo.retry ? { k: 'retry' } : (rej ? { k: 'rejected', at: rej } : { k: 'open' });
    if (todo.retry && !reapproved(e)) return { k: 'retry', at: e.at };
    if (e.legacy || !e.hash) return { k: 'stale', at: e.at, legacy: true };
    if (todo.staleApproval || !hashMatches(todo, e)) return { k: 'stale', at: e.at };
    return { k: teOn() ? 'approved' : 'noted', at: e.at };
  }
  // Nach einem Fehlschlag zählt eine Freigabe erst wieder, wenn ihr „at" jünger ist als der Lauf, der gescheitert ist
  function reapproved(e) { const at = Date.parse(e.at); const run = Date.parse(status && (status.finishedAt || status.startedAt)); return !isNaN(at) && (isNaN(run) || at > run); }
  // Hash der Freigabe gegen das To-do: ohne Korrektur direkt gegen todo.hash; mit bearbeitetem DAX (overrides) gegen den Hash der Op
  // MIT Korrektur (so rechnet auch der Runner: op_hash(_with_overrides(op, ov))). Den rechnet das Kitchen asynchron und merkt ihn sich.
  const hashMemo = {};
  function hashMatches(todo, e) {
    if (!todo.hash) return true;
    const dax = e.overrides && e.overrides.dax; if (!dax || dax === daxOf(todo)) return todo.hash === e.hash;
    const key = todo.id + '\n' + fnv(JSON.stringify(todo.after || null)) + '\n' + dax;
    if (hashMemo[key] === undefined) { hashMemo[key] = null; hashFor(todo, dax).then(h => { hashMemo[key] = h.hash; bump(); renderAll(); renderFmLive(); }).catch(() => { hashMemo[key] = false; }); }
    return hashMemo[key] ? hashMemo[key] === e.hash : !todo.staleApproval;
  }
  function pendingApprovals() { return approvalTodos().filter(x => ['open', 'stale', 'rejected', 'retry'].includes(approvalState(x).k)); }
  function teOn() {
    const todos = (status && Array.isArray(status.todos)) ? status.todos : [];
    if (todos.some(x => x && x.kind === 'model' && x.ref === 'te')) return false;
    const d = doctor; if (d && typeof d === 'object') {
      const checks = Array.isArray(d.checks) ? d.checks : (Array.isArray(d) ? d : []);
      const te = checks.find(c => c && /^te\b/i.test(String(c.id || c.name || ''))); if (te && te.state) return !/error|bad|red|fail/i.test(String(te.state));
      if (d.te && typeof d.te === 'object' && 'ok' in d.te) return !!d.te.ok;
    }
    return true;
  }
  function kindOf(id) { const k = String(id || '').split(':')[0]; return has('live.fg.' + k) ? t('live.fg.' + k) : t('live.fg.other'); }
  const targetOf = id => String(id || '').replace(/^[^:]*:/, '');
  function daxOf(todo) { return todo.dax || todo.expression || (todo.after && todo.after.expression) || ''; }
  // Hash wie der Runner (model_ops.op_hash): sha256 über kind, target und Inhalt (je Zeilenumbruch). Der Runner liefert ihn im
  // To-do (Feld „hash"); fehlt er oder ist das DAX bearbeitet, rechnet das Kitchen ihn über die Op MIT Korrektur: Inhalt = „after"
  // des To-dos (bei addMeasure auch formatString) mit dem bearbeiteten expression, als kanonisches JSON (Schlüssel sortiert, Trenner
  // „," und „:" ohne Leerzeichen, Unicode unverändert). Fehlt „after", bleibt es bei {"expression": DAX}.
  function canonJson(o) { if (Array.isArray(o)) return '[' + o.map(canonJson).join(',') + ']'; if (o && typeof o === 'object') return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canonJson(o[k])).join(',') + '}'; return JSON.stringify(o); }
  async function hashFor(todo, dax) {
    if (todo.hash && dax === daxOf(todo)) return { hash: todo.hash, src: 'runner' };
    const kind = String(todo.id).split(':')[0];
    const after = Object.assign({}, todo.after && typeof todo.after === 'object' ? todo.after : {}, dax ? { expression: dax } : {});
    const content = Object.keys(after).length ? canonJson(after) : '';
    return { hash: await sha256(kind + '\n' + targetOf(todo.id) + '\n' + content), src: 'kitchen' };
  }
  async function approve(id) {
    const todo = approvalTodos().find(x => x.id === id); if (!todo || !proj) return;
    const ta = $(`.lv-fg[data-id="${CSS.escape(id)}"] textarea.dax`); const dax = ta ? ta.value.trim() : daxOf(todo);
    const h = await hashFor(todo, dax);
    const cur = (await readJsonAt(FILES.approvals)) || approvals || {};
    const list = (Array.isArray(cur.approvals) ? cur.approvals : []).filter(x => x && x.id !== id);
    (Array.isArray(cur.ids) ? cur.ids : []).forEach(i => { if (i !== id && !list.find(x => x.id === i)) list.push({ id: i, hash: null, by: 'legacy', at: null, overrides: (cur.overrides || {})[i] || undefined }); });
    const entry = { id, hash: h.hash, by: 'MockupKitchen ' + window.MK_VERSION, at: isoLocal(new Date()) };
    if (dax && dax !== daxOf(todo)) entry.overrides = { dax };
    list.push(entry);
    try { await writeJson(FILES.approvals, { approvals: list }); approvals = { approvals: list }; delete dep.rows['rej:' + id]; saveDep(); bump(); toast(t('live.fg.written', { id })); }
    catch (e) { if (isPerm(e)) lose(); else toast(t('live.fg.writeFailed', { msg: e.message || e.name })); }
    renderAll(); renderFmLive();
  }
  function reject(id) { dep.rows['rej:' + id] = isoLocal(new Date()); saveDep(); bump(); renderAll(); renderFmLive(); }
  function fgCard(todo, opts) {
    const st = approvalState(todo); const dax = daxOf(todo); const off = !teOn();
    if (st.k === 'approved' || st.k === 'noted') return `<div class="lv-fg" data-id="${esc(todo.id)}" data-state="${st.k}"><div class="fg-line"><span class="lv-ck" style="color:var(--ok)">${CHECK_SVG}</span><span><b>${esc(todo.summary || targetOf(todo.id))}</b> · ${esc(t(st.k === 'approved' ? 'live.fg.approved' : 'live.fg.noted', { t: hhmm(st.at) }))}</span><span class="spacer"></span><span class="mono lv-mute ws">${esc(targetOf(todo.id))}</span></div></div>`;
    if (st.k === 'rejected') return `<div class="lv-fg" data-id="${esc(todo.id)}" data-state="rejected"><div class="fg-line"><span style="color:var(--ink-mute)">✕</span><span><b>${esc(todo.summary || targetOf(todo.id))}</b> · ${esc(t('live.fg.rejected', { t: hhmm(st.at) }))}</span><span class="spacer"></span><button type="button" class="btn sm" data-lv="fgApprove" data-id="${esc(todo.id)}">${esc(t(off ? 'live.fg.note' : 'live.fg.approve'))}</button></div></div>`;
    const cmd = Array.isArray(todo.commandLines) && todo.commandLines.length ? `<div class="cmd ws">${esc(todo.commandLines.join('\n'))}</div>` : '';
    const again = st.k === 'stale' || st.k === 'retry';
    return `<div class="lv-fg${opts && opts.focus ? ' focus' : ''}" data-id="${esc(todo.id)}" data-state="${st.k}"><div class="fg-h"><div class="kind">${esc(kindOf(todo.id))}</div><b>${esc(todo.summary || targetOf(todo.id))}</b><span class="tbl">${esc(targetOf(todo.id))}${todo.hash ? ` <span class="ws">· ${esc(String(todo.hash).slice(0, 12))}</span>` : ''}</span></div><div class="fg-b">
      ${st.k === 'stale' ? `<div class="fg-warn">${esc(t(st.legacy ? 'live.fg.legacy' : 'live.fg.changed'))}</div>` : ''}${st.k === 'retry' ? `<div class="fg-warn">${esc(t('live.fg.retry', { t: st.at ? hhmm(st.at) : '' }))}</div>` : ''}${off ? `<div class="fg-warn">${esc(t('live.fg.teOff'))}</div>` : ''}
      ${todo.retry ? `<p class="hint">${esc(todo.text || '')}</p>` : ''}
      ${dax ? `<div class="field"><label>${esc(t('live.fg.dax'))}</label><textarea class="dax" spellcheck="false">${esc(dax)}</textarea></div>` : `<p class="hint">${esc(todo.text || '')}</p>`}
      ${cmd}<p class="hint ws" style="margin:0">${esc(t(todo.hash ? 'live.fg.hashRunner' : 'live.fg.hashLocal'))}</p></div>
      <div class="fg-a"><button type="button" class="btn sm" data-lv="fgReject" data-id="${esc(todo.id)}">${esc(t('live.fg.reject'))}</button><button type="button" class="btn sm primary" data-lv="fgApprove" data-id="${esc(todo.id)}">${esc(t(again ? 'live.fg.again' : (off ? 'live.fg.note' : 'live.fg.approve')))}</button></div></div>`;
  }
  // Freigaben im Kennzahlen-Steckbrief: Karten zu den To-dos dieses Felds
  function renderFmLive() {
    const box = $('#fmLive'); if (!box) return;
    const ref = nfc(($('#fmRef') || {}).textContent || '').split(' ')[0];
    const list = proj && ref ? approvalTodos().filter(x => nfc(x.ref || targetOf(x.id)) === ref || nfc(targetOf(x.id)) === ref) : [];
    box.hidden = !list.length; box.innerHTML = list.length ? `<h3 class="lv-h">${esc(t('live.lt.approvals'))}</h3>` + list.map(x => fgCard(x)).join('') : '';
  }

  // ------------------------------------------------------------------ Bereitschaft je Kachel (Ring, Marke, Klartext)
  function readiness() {
    if (memo.rd && memo.rdRev === rev) return memo.rd;
    const r0 = rev; const out = readinessCalc();
    if (rev === r0) { memo.rd = out; memo.rdRev = rev; }   // hat die Berechnung selbst Fingerabdrücke gesetzt (bump), nicht merken
    return out;
  }
  function readinessCalc() {
    const S = MK().state; const out = {}; const cat = MK().catalog; const vis = currentVisuals() || {}; const ch = changes();
    const open = pendingApprovals(); const refs = open.map(x => nfc(x.ref || targetOf(x.id)));
    S.pages.forEach(p => MK().computeAll(p).leaves.forEach(l => {
      const v = l.node.visual; if (!v) return; const id = l.node.id; const def = cat.byId[v.kind] || {};
      const missingRoles = (cat.rolesFor ? cat.rolesFor(def, v) : []).filter(r => r.req && !((v.roles || {})[r.key] || []).length).map(r => r.label);
      const gone = [], news = [];
      Object.keys(v.roles || {}).forEach(k => (v.roles[k] || []).forEach(f => { const st = MK().fieldStatus(f); if (st === 'missing') gone.push(f.name); else if (st === 'new' || f.isNew) news.push(f); }));
      let r;
      const x0 = vis[id] || vis['mk_' + id];
      if (x0 && x0.state === 'error' && !ch.ids[id]) r = { k: 'bad', c: 'bad', txt: t('live.mark.error') + (x0.msg ? ': ' + x0.msg : '') };   // Fehler des Runners zuerst, er nennt den Grund
      else if (missingRoles.length) r = { k: 'needs', c: 'warn', txt: t('live.ready.needsField', { role: missingRoles.join(', ') }) };
      else if (gone.length) r = { k: 'needs', c: 'warn', txt: t('live.ready.missing', { f: gone.join(', ') }) };
      else if (news.length) {
        const waits = news.filter(f => refs.includes(nfc(f.table + '.' + f.name)));
        r = waits.length ? { k: 'needs', c: 'warn', txt: t('live.ready.approval', { f: waits.map(f => f.name).join(', ') }) } : { k: 'needs', c: 'warn', txt: t('live.ready.newField', { f: news.map(f => f.name).join(', ') }) };
      }
      if (!r) {
        const x = vis[id] || vis['mk_' + id];
        if (ch.ids[id]) r = { k: 'chg', c: 'sel', txt: t('live.ready.changed', { bon: bon(dep.real) }) };
        else if (x && x.state === 'error') r = { k: 'bad', c: 'bad', txt: t('live.mark.error') + (x.msg ? ': ' + x.msg : '') };
        else if (x && (x.state === 'applied' || x.state === 'ok')) { const vd = verdictOf(x.diff); r = { k: 'ok', c: vd.k === 'off' || vd.k === 'empty' || vd.k === 'slight' ? 'warn' : 'ok', txt: vd.k === 'none' ? t('live.ready.arrived') : t('live.ready.arrivedWith', { v: vd.txt }), vd }; }
        else if (x && x.state === 'warn') r = { k: 'warn', c: 'warn', txt: t('live.mark.warn') + (x.msg ? ': ' + x.msg : '') };
        else if (x && x.state === 'skipped') r = { k: 'skipped', c: 'sel', txt: t('live.mark.skipped') + (x.msg ? ': ' + x.msg : '') };
        else r = { k: 'ready', c: 'sel', txt: t('live.ready.ready') };
      }
      r.name = v.title || def.label || v.kind; r.page = p.name; out[id] = r;
    }));
    return out;
  }
  function readyCount(rd) { rd = rd || readiness(); const ids = Object.keys(rd); return { ok: ids.filter(id => rd[id].k !== 'needs' && rd[id].k !== 'bad').length, n: ids.length, needs: ids.filter(id => rd[id].k === 'needs').map(id => rd[id]) }; }

  // Marken gelten für den laufenden Deploy: Status-seq nicht älter als der eigene letzte Deploy
  function currentVisuals() {
    if (!proj || !status || !status.visuals || typeof status.visuals !== 'object') return null;
    // Vorschau und Abbruch tragen pages/visuals des letzten Deploys weiter (previous): die Marken bleiben stehen
    const seq = resSeqOf(); if (!seq || (dep.real && seq < dep.real)) return null;
    const prevOk = !!(status.previous && +status.previous.seq);
    if ((status.dryRun || status.state === 'planned' || status.state === 'cancelled') && !prevOk) return null;
    if (status.state === 'applied' && (seq > (dep.fpsSeq || 0) || !dep.fps)) { setFps(seq); dep.real = Math.max(dep.real || 0, seq); saveDep(); }
    return status.visuals;
  }
  const MARK = { ok: ['applied', '✓'], warn: ['warn', '!'], bad: ['error', '✕'], skipped: ['skipped', '−'], needs: ['needs', '!'], chg: ['chg', ''] };
  function decorate() {
    const pageEl = $('#page'); if (!pageEl || !MK()) return;
    $$('.lv-mark, .lv-frame', pageEl).forEach(n => n.remove());
    $$('.tile', pageEl).forEach(tl => { tl.classList.remove('lv-r-sel', 'lv-r-warn', 'lv-r-ok', 'lv-r-bad', 'lv-arrive'); if (tl.dataset.lvTitle != null) { tl.title = tl.dataset.lvTitle; delete tl.dataset.lvTitle; } });
    const st = $('#stage'); if (st) st.classList.toggle('lv-live', !!proj && enabled);
    if (!proj || !enabled) { decorateShot(pageEl); return; }
    const rd = readiness();
    // Ankunft: Kaskade in Lesereihenfolge (70 ms Abstand, höchstens 700 ms), einmal je Deploy
    const seq = status && +status.seq || 0; const arriving = !RM && arrivedSeq !== seq && seq === dep.real && status && status.state === 'applied' && runnerState() !== 'running';
    if (arriving) arrivedSeq = seq;
    const tiles = $$('.tile[data-leaf]', pageEl).filter(tl => rd[tl.dataset.leaf]);
    tiles.sort((a, b) => (rd[a.dataset.leaf].y || 0) - (rd[b.dataset.leaf].y || 0));
    const order = tiles.map(tl => tl.dataset.leaf).sort((a, b) => { const ra = $(`.tile[data-leaf="${CSS.escape(a)}"]`, pageEl).getBoundingClientRect(), rb = $(`.tile[data-leaf="${CSS.escape(b)}"]`, pageEl).getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); });
    const gap = Math.min(70, 700 / Math.max(1, order.length));
    tiles.forEach(tile => {
      const id = tile.dataset.leaf; const r = rd[id]; const box = $('.badges', tile);
      tile.classList.add('lv-r-' + r.c);
      tile.dataset.lvTitle = tile.title; tile.title = r.txt + (tile.title ? ' · ' + tile.title : '');
      const m = MARK[r.k]; if (!m || !box) return;
      const d = arriving && r.k === 'ok' ? Math.round(order.indexOf(id) * gap) : 0;
      const tip = r.txt + (wsMode() && r.vd && r.vd.pct != null ? ' · ' + r.vd.pct + ' %' : '');
      box.insertAdjacentHTML('afterbegin', `<span class="lv-mark lv-${m[0]}${arriving && r.k === 'ok' ? ' lv-pop' : ''}" data-lv-mark="${esc(m[0])}" style="--d:${d}ms" title="${esc(tip)}" aria-label="${esc(tip)}" role="img">${m[1]}</span>`);
      if (arriving && r.k === 'ok') { tile.insertAdjacentHTML('beforeend', `<i class="lv-frame" style="--d:${d}ms"></i>`); tile.classList.add('lv-arrive'); }
    });
    decorateShot(pageEl);
    decoratePages();
  }
  // Siegel „abgenommen" am Seitentab
  function decoratePages() {
    const bar = $('#pagebar'); if (!bar) return;
    $$('.lv-seal', bar).forEach(n => n.remove());
    if (!proj || !enabled) return;
    MK().state.pages.forEach(p => { const s = dep.seals[nfc(p.name)]; if (!s) return; const tab = $(`.ptab[data-page="${CSS.escape(p.id)}"] .pt-go`, bar); if (tab) tab.insertAdjacentHTML('beforeend', `<span class="lv-seal" title="${esc(t('live.res.sealTip', { t: hhmm(s.at), bon: bon(s.seq) }))}">✓ ${esc(hhmm(s.at))}</span>`); });
  }

  // ------------------------------------------------------------------ Desktop-Bild über der Skizze
  function pageEntry(name) {
    if (!status || !status.pages || typeof status.pages !== 'object') return null;
    const pages = status.pages; const n = nfc(name);
    return pages[name] || pages[n] || Object.keys(pages).map(k => pages[k] && nfc(k) === n ? pages[k] : null).find(Boolean) || null;
  }
  function shotPath() {
    if (!proj || !status) return null;
    if (dep.real && resSeqOf() < dep.real) return null;
    const hit = pageEntry(MK().page().name);
    return hit ? String(hit.shotPage || hit.shot || '') || null : null;
  }
  function shotKey() { const path = shotPath(); return path ? path + '|' + (status.finishedAt || '') + '|' + resSeqOf() : null; }
  function dropShot() { if (shot.url) URL.revokeObjectURL(shot.url); shot.url = null; shot.key = null; }
  async function loadShot() {
    const path = shotPath(); const key = shotKey();
    if (key && key === shot.key && shot.url) { updateShotUi(); return; }
    dropShot();
    if (path) {
      try { const f = await fileAt(path); if (shotKey() === key) { shot.url = URL.createObjectURL(f); shot.key = key; } }
      catch (e) { if (isPerm(e)) { lose(); return; } }
    }
    updateShotUi();
  }
  function decorateShot(pageEl) {
    $$('.lv-shot', pageEl).forEach(n => n.remove());
    if (!shot.on || !shot.url || !MK()) return;
    const { w, h } = MK().state.canvas;
    pageEl.insertAdjacentHTML('beforeend', `<img class="lv-shot" alt="" src="${esc(shot.url)}" style="width:${w}px;height:${h}px;opacity:${shot.opacity}">`);
  }
  function updateShotUi() {
    const ctl = $('#liveShotCtl'), btn = $('#btnLiveShot'), rng = $('#liveShotOpacity'); if (!ctl) return;
    const hasImg = !!(proj && shot.url);
    ctl.hidden = !hasImg;
    btn.setAttribute('aria-pressed', shot.on && hasImg ? 'true' : 'false'); rng.hidden = !(shot.on && hasImg);
  }

  // ------------------------------------------------------------------ Deploy-Knopf (Split-Button, UX-KONZEPT 1)
  function depState() {
    if (!proj) return { s: 'off' };
    const mm = mismatch(); if (mm) return { s: 'locked' };
    const seq = status ? (+status.seq || 0) : 0; const ch = changes(); const pend = pendingApprovals().length;
    if (alive() && status.awaiting && runnerState() === 'awaiting') return { s: 'awaiting', seq, pill: pend };
    if (busy()) return { s: 'running', seq, pill: pend, dry: !!status.dryRun || status.state === 'planned' };
    if (dep.seq && (!status || seq < dep.seq) && dep.cancelled !== dep.seq) return { s: 'pending', seq: dep.seq, pill: pend };
    if (appliedAt && Date.now() - appliedAt < APPLIED_MS && appliedSeq === seq) return { s: 'applied', seq, pill: pend, ms: +status.ms || 0 };
    if (status && seq >= (dep.real || 0) && seq === dep.seq && status.state === 'blocked') return { s: 'blocked', seq, pill: pend };
    if (status && seq >= (dep.real || 0) && seq === dep.seq && status.state === 'failed') return { s: 'error', seq, pill: pend };
    if (!ch.n) return { s: 'current', seq: dep.real || seq, pill: pend, n: 0 };
    const restart = !!(status && status.plan && status.plan.restart && status.state === 'planned' && seq > (dep.real || 0));
    return { s: restart ? 'restart' : 'changes', seq: dep.real || seq, n: ch.n, ch, pill: pend, restart, reason: restart ? (status.plan.restartReason || '') : '' };
  }
  function detailTxt(ch) {
    const parts = [];
    const c = ch.changed + ch.moved; if (c) parts.push(c === 1 ? t('live.dep.detail.changed1') : t('live.dep.detail.changed', { n: c }));
    if (ch.added) parts.push(ch.added === 1 ? t('live.dep.detail.new1') : t('live.dep.detail.new', { n: ch.added }));
    if (ch.removed) parts.push(t('live.dep.detail.removed', { n: ch.removed }));
    if (ch.theme) parts.push(t('live.dep.detail.theme'));
    return parts.join(', ');
  }
  function renderDep() {
    const wrap = $('#liveDepWrap'), dp = $('#liveDep'), b = $('#btnDeploy'), pill = $('#liveDepPill'); if (!wrap) return;
    const st = depState();
    wrap.hidden = st.s === 'off' || !enabled; if (wrap.hidden) return;
    dp.dataset.s = st.s; b.disabled = deploying || st.s === 'locked' || st.s === 'awaiting';
    let h = '', tip = '';
    const est = fmtS(estMs());
    switch (st.s) {
      case 'current': h = t('live.dep.current'); tip = t('live.dep.tip.current', { bon: bon(st.seq) }); break;
      case 'changes': h = t('live.dep.changes', { n: st.n }); tip = t('live.dep.tip.changes', { detail: detailTxt(st.ch), est }); break;
      case 'restart': h = t('live.dep.restart', { n: st.n }); tip = t('live.dep.tip.restart', { reason: st.reason ? t('live.restart.because', { r: st.reason }) : '', est }); break;
      case 'pending': h = t('live.dep.pending', { bon: bon(st.seq) }); tip = t('live.dep.tip.pending', { bon: bon(st.seq) }); break;
      case 'running': { const el = elapsedMs(); const p = Math.min(0.98, el / Math.max(1000, estMs())); const stn = activeStation();
        h = `<span class="dep-fill" style="--p:${p.toFixed(3)}"></span>` + (st.dry ? t('live.dep.previewing', { s: fmtS(el) }) : t('live.dep.running', { step: stn ? t('live.station.' + stn) : t('live.state.running'), s: fmtS(el) }));
        tip = t('live.dep.tip.running', { bon: bon(st.seq), s: fmtS(el), est }); break; }
      case 'applied': h = t('live.dep.applied', { bon: bon(st.seq), s: fmtS(st.ms) }); tip = t('live.dep.tip.applied', { bon: bon(st.seq) }); break;
      case 'blocked': h = t('live.dep.blocked'); tip = t('live.dep.tip.blocked'); break;
      case 'awaiting': h = t('live.dep.awaiting'); tip = t('live.dep.tip.awaiting'); break;
      case 'error': h = t('live.dep.error'); tip = t('live.dep.tip.error'); break;
      case 'locked': h = t('live.dep.locked'); tip = t('live.dep.tip.locked'); break;
    }
    if (!alive() && ['current', 'changes', 'restart'].includes(st.s)) tip += ' · ' + t('live.dep.tip.inactive');
    const inner = st.s === 'running' ? h.replace(/<\/span>(.*)$/, '</span><span>$1</span>') : `<span>${esc(h)}</span>`;
    if (b.innerHTML !== inner) b.innerHTML = inner;
    b.title = tip; b.setAttribute('aria-label', (st.s === 'running' ? h.replace(/<[^>]+>/g, '') : h) + ' · ' + tip);
    pill.innerHTML = st.pill ? `<button type="button" class="lv-pill" data-lv="goApprovals" title="${esc(t('live.dep.pillTip'))}"><i></i><span class="lv-pilltxt">${esc(st.pill === 1 ? t('live.dep.pill1') : t('live.dep.pill', { n: st.pill }))}</span><span class="lv-cnt" style="display:none">${st.pill}</span></button>` : '';
    // Leitung unter der Topbar
    const l = $('#liveLeitung'); if (l) {
      const run = st.s === 'running' && !st.dry; const restart = run && curStep() === 'desktop';
      l.className = 'lv-leitung lv-only' + (restart ? ' restart' : (st.s === 'applied' ? ' done' : ''));
      l.firstElementChild.style.width = run ? (Math.min(0.98, elapsedMs() / Math.max(1000, estMs())) * 100) + '%' : (st.s === 'applied' ? '100%' : '0');
    }
    document.title = (st.s === 'running' ? '● ' : st.s === 'applied' ? '✓ ' : st.s === 'awaiting' || st.s === 'blocked' ? '⏸ ' : '') + (document.title.replace(/^[●✓⏸] /, ''));
  }
  function stationOf(stepId) { const hit = STATIONS.find(s => s[1].includes(stepId)); return hit ? hit[0] : null; }

  // ------------------------------------------------------------------ Sitzungsband (UX-KONZEPT 2)
  function stationStates() {
    const steps = (status && Array.isArray(status.steps)) ? status.steps : []; const cur = curStep();
    const idxOf = id => STATIONS.findIndex(s => s[1].includes(id));
    const reported = steps.map(s => idxOf(s && s.id)).filter(i => i >= 0);
    const curIdx = cur ? idxOf(cur) : -1;
    const maxRep = reported.length ? Math.max.apply(null, reported) : -1;
    const active = curIdx >= 0 ? curIdx : (status && status.state === 'running' ? Math.min(STATIONS.length - 1, maxRep + 1) : -1);
    return STATIONS.map((s, i) => {
      const mine = steps.filter(x => x && s[1].includes(x.id));
      const fail = mine.some(x => x.state === 'error'); const ms = mine.reduce((a, x) => a + (+x.ms || 0), 0);
      let state = 'todo'; if (fail) state = 'fail'; else if (i === active && status && status.state === 'running') state = 'run'; else if (i < active || (mine.length && i !== active)) state = 'done';
      return { id: s[0], state, ms, tech: mine.map(x => (x.id + ': ' + (x.msg || ''))).join(' · ') };
    });
  }
  function renderBand() {
    const band = $('#liveBand'), row = $('#liveBandRow'); if (!band) return;
    band.hidden = !proj || !enabled; if (band.hidden) { row.hidden = true; return; }
    const st = depState();
    if (st.s === 'running' && !st.dry) { renderStepper(band, st); } else {
      band.classList.remove('stepper');
      const desk = deskInfo(); const rd = readyCount(); const h = (status && Array.isArray(status.history)) ? status.history.slice(-8) : [];
      const dots = h.map((x, i) => `<button type="button" class="tl-dot${i === h.length - 1 ? ' cur' : ''}${x.restoredFrom != null ? ' back' : ''}${x.state === 'failed' ? ' bad' : x.state === 'blocked' ? ' warn' : ''}" data-lv="tlDot" data-seq="${esc(x.seq)}" title="${esc(t('live.band.tlTip', { bon: bon(x.seq), time: hhmm(x.at), state: has('live.state.' + x.state) ? t('live.state.' + x.state) : x.state }))}" aria-label="${esc(t('live.band.tlTip', { bon: bon(x.seq), time: hhmm(x.at), state: x.state }))}"></button>`).join('');
      const uo = curStep() === 'desktop' ? null : ownUnsaved();
      const pp = projectPath(); const deskTxt = curStep() === 'desktop' ? t('live.band.desktopRestart') : uo && uo.n ? t('live.band.desktopUnsavedOwn', { bon: bon(uo.n) }) : (desk && desk.connected ? t('live.band.desktopOn') : t('live.band.desktopOff'));
      const deskCls = curStep() === 'desktop' ? 'warn pulse' : uo ? 'warn' : (desk && desk.connected ? 'ok' : 'ring');
      const deskTip = uo ? ` title="${esc(t('live.band.desktopUnsavedOwnTip', { bon: uo.n ? bon(uo.n) : '?' }))}"` : '';
      const age = status ? fmtS(Date.now() - heartbeat()) : '';
      setHtml(band, `<span class="b-proj" title="${esc(pp || t('live.band.pathKitchen'))}"><i class="lv-dot ${alive() ? 'sel' : 'ring'}"></i><b>${esc(proj.name)}</b><span class="mono" title="${esc(pp ? t('live.band.pathTip') + ': ' + pp : t('live.band.pathKitchen'))}">${esc(pp || ('…\\' + proj.root.name))}</span></span>` +
        `<span class="bsep"></span><span class="b-item"${alive() ? deskTip : ''}><i class="lv-dot ${alive() ? deskCls : 'ring'}"></i>${esc(alive() ? deskTxt : t('live.band.helperOff'))}</span>` +
        (status ? `<span class="ws mono lv-mute">${esc(t('live.band.statusAge', { s: age, v: (status.runner && status.runner.version) || '?' }))}</span>` : '') +
        `<span class="bsep"></span><button type="button" class="b-link" data-lv="goReady"><i class="lv-dot ${rd.ok < rd.n ? 'warn' : 'sel'}"></i>${esc(t('live.band.ready', { ok: rd.ok, n: rd.n }))}</button>` +
        (h.length ? `<span class="bsep"></span><span class="tl">${dots}<span class="tl-n">${esc(h[h.length - 1].restoredFrom != null ? '↶' + h[h.length - 1].restoredFrom : bon(h[h.length - 1].seq))}</span></span>` : '') +
        `<span class="spacer"></span>` +
        `<button type="button" class="gh" data-lv="goApprovals">${esc(t('live.band.approvals'))}${st.pill ? ` <span class="lv-cnt">${st.pill}</span>` : ''}</button>` +
        `<button type="button" class="gh" data-lv="openResult"${resultSeq() ? '' : ' disabled'}>${esc(t('live.band.result'))}</button>` +
        `<button type="button" class="gh" data-lv="protocol">${esc(t('live.band.protocol'))}</button>`);
    }
    renderRow(row, st);
    renderPause();
  }
  function renderStepper(band, st) {
    band.classList.add('stepper');
    const el = elapsedMs(); const seq = +status.seq || 0;
    if (curStep() === 'desktop') {
      setHtml(band, `<span class="b-proj"><i class="lv-dot sel"></i><b>${esc(proj.name)}</b></span><span class="bsep"></span><span class="b-item" style="color:var(--sel);font-weight:600"><i class="lv-dot sel pulse"></i>${esc(t('live.band.restartClock', { t: clock(stepElapsed('desktop')) }))}</span><span class="ws mono lv-mute">${esc(lastStepMsg())}</span><span class="spacer"></span><span class="lv-mute">${esc(t('live.band.sketchOn'))}</span>`);
      return;
    }
    const sts = stationStates();
    setHtml(band, '<span class="steps">' + sts.map((s, i) => (i ? `<span class="st-line${sts[i - 1].state === 'done' ? ' done' : ''}"></span>` : '') + `<span class="stn ${s.state}" title="${esc(s.tech)}"><i>${s.state === 'done' ? '✓' : s.state === 'fail' ? '✕' : ''}</i>${esc(t('live.station.' + s.id))}</span>`).join('') + '</span>' +
      `<span class="ws mono lv-mute">${esc(lastStepMsg())}</span><span class="spacer"></span><span class="st-time">${bonHtml(seq)}<span>${esc(t('live.band.of', { t: clock(el), est: clock(estMs()) }))}</span></span>`);
  }
  function lastStepMsg() { const s = (status && status.steps) || []; const l = s[s.length - 1]; return l ? l.id + ': ' + (l.msg || '') : (curStep() || ''); }
  function stepElapsed(id) { const s = ((status && status.steps) || []).find(x => x && x.id === id); const t0 = Date.parse(s && s.startedAt); if (!isNaN(t0)) return Date.now() - t0; const last = ((status && status.steps) || []).slice(-1)[0]; const t1 = Date.parse(last && last.startedAt); return isNaN(t1) ? elapsedMs() : Math.max(0, Date.now() - t1 - (+last.ms || 0)); }
  // Statuszeile unter dem Band: bleibt, bis gelöst; Echos nur als Toast
  function rowSpec(st) {
    const mm = mismatch(); if (mm) return { kind: 'bad', icon: '⚠', html: t('live.row.mismatch', { k: esc(mm.k), r: esc(mm.r || '?'), d: mm.d ? t('live.row.mismatchDesk', { d: esc(mm.d) }) : '' }), key: 'mismatch' };
    const seq = status ? (+status.seq || 0) : 0;
    const aw = status && status.awaiting;
    if (aw && alive() && runnerState() === 'awaiting') {
      if (confirmed && confirmed.seq === seq && Date.now() - confirmed.at < 60000) return { kind: 'info', icon: '✓', html: t('live.row.answer', { a: esc(confirmed.label || answerLabel(confirmed.action, aw)) }), actions: [{ act: 'answerAgain', label: t('live.row.answerAgain') }], key: 'answered:' + seq };
      if (aw.kind === 'approval') return { kind: 'warn', icon: '⏸', html: t('live.row.awaitingApproval', { bon: bon(seq), reason: esc(aw.reason || '') }), actions: [{ act: 'goApprovals', label: t('live.row.toApprovals'), cls: 'primary' }].concat((aw.options || ['cancel']).filter(o => has('live.confirm.' + o)).map(o => ({ act: 'confirm', arg: o, label: answerLabel(o, aw) }))), key: 'await:' + seq };
      return { kind: 'warn', icon: '⏸', html: t('live.row.awaitingRestart', { bon: bon(seq), reason: esc(aw.reason || '') }), actions: [{ act: 'openAwait', label: t('live.row.details'), cls: 'primary' }].concat(awaitOptions(aw, awaitCase(aw).realWork).includes('cancel') ? [{ act: 'confirm', arg: 'cancel', label: t('live.confirm.cancel') }] : []), key: 'await:' + seq };
    }
    if (dep.cancelled && !dismissed['cancelled:' + dep.cancelled]) return { kind: 'info', icon: '↩', html: t('live.row.cancelled', { bon: bon(dep.cancelled) }), close: true, key: 'cancelled:' + dep.cancelled };
    if (status && seq === dep.seq && seq >= (dep.real || 0) && !busy()) {
      if (status.state === 'blocked') return { kind: 'warn', icon: '⏸', html: t('live.row.blocked', { bon: bon(seq), msg: esc(status.message || '') }), actions: [{ act: 'retry', label: t('live.row.retry'), cls: 'primary' }, { act: 'protocol', label: t('live.row.details') }], key: 'blocked:' + seq };
      if (status.state === 'failed') return { kind: 'bad', icon: '✕', html: t('live.row.failed', { bon: bon(seq), msg: `<span class="ws mono">${esc(status.message || '')}</span>` }), actions: [{ act: 'retry', label: t('live.row.retry'), cls: 'primary' }, { act: 'protocol', label: t('live.row.details') }], key: 'failed:' + seq };
      // Abbruch durch den Runner (Antwort „Abbrechen", deploy-cancel.json, mk-live stop): Ergebnis-Zustand cancelled (CONTRACT)
      if (status.state === 'cancelled' && !dismissed['cancelledR:' + seq]) return { kind: 'info', icon: '↩', html: t('live.row.cancelledRunner', { bon: bon(seq), msg: esc(status.message || '') }), close: true, key: 'cancelledR:' + seq };
      // Zurück zu Deploy n: die Skizze folgt dem Bericht (oder konnte es nicht)
      if (status.state === 'applied' && restoredNote && restoredNote.seq === seq && !dismissed['restored:' + seq]) return { kind: restoredNote.ok ? 'ok' : 'warn', icon: '↶', html: t(restoredNote.ok ? 'live.row.restored' : 'live.row.restoreNoSketch', { bon: bon(restoredNote.n) }), actions: restoredNote.ok ? [{ act: 'openResult', label: t('live.row.result') }] : [], close: true, key: 'restored:' + seq };
      if (status.state === 'applied' && !dismissed['applied:' + seq]) {
        if (status.prepare) return { kind: 'ok', icon: '✓', html: t('live.row.prepared'), close: true, key: 'applied:' + seq };
        const sum = appliedSummary(); return { kind: 'ok', icon: '✓', html: t('live.row.applied', { bon: bon(seq), sum: esc(sum) }), actions: [{ act: 'openResult', label: t('live.row.result') }], close: true, key: 'applied:' + seq };
      }
    }
    // Safety-Review 2 (2): „ungespeichert“ vom eigenen Reload verwirft der nächste Deploy ohne Rückfrage, samt dem, was seitdem in Desktop
    // geändert und nicht gespeichert wurde (CONTRACT „Rückfragen“). Solange desktopLive.unsavedByUs gilt, sagt die Zeile das vorher.
    const uo = ownUnsaved();
    if (uo && !busy() && !dismissed['unsavedOwn:' + uo.key]) return { kind: 'info', icon: '⚠', html: t(uo.n ? 'live.row.unsavedOwn' : 'live.row.unsavedOwnNoSeq', { bon: bon(uo.n) }), close: true, key: 'unsavedOwn:' + uo.key };
    if (needsPrep() && !busy() && !dismissed['prepare']) return { kind: 'info', icon: '⟳', html: t('live.row.prepare'), actions: [{ act: 'openPrep', label: t('live.row.prepareBtn'), cls: 'primary' }], close: true, key: 'prepare' };
    return null;
  }
  // Desktop ist „ungespeichert“ vom eigenen Reload (Leerlauf-Stand des Runners, jünger als der letzte Deploy): seit welchem Deploy?
  function ownUnsaved() {
    const dl = status && status.desktopLive;
    if (!proj || !alive() || !dl || !dl.connected || !dl.hasUnsavedChanges || !dl.unsavedByUs) return null;
    const fin = Date.parse(status.finishedAt), at = Date.parse(dl.at);
    if (!isNaN(fin) && !isNaN(at) && at < fin) return null;
    let n = +dl.reloadSeq || 0;
    if (!n) { const h = (Array.isArray(status.history) ? status.history : []).filter(x => x && x.state === 'applied' && !x.prepare); n = h.length ? (+h[h.length - 1].seq || 0) : 0; }
    return { n, key: (n || '?') + ':' + (dl.pid != null ? dl.pid : '') };
  }
  function appliedSummary() {
    const vis = (status && status.visuals) || {}; let ok = 0, look = 0, any = false;
    Object.keys(vis).forEach(k => { const d = vis[k] && vis[k].diff; if (!d) return; any = true; const vd = verdictOf(d); if (vd.k === 'ok' || vd.k === 'data') ok++; else look++; });
    if (!any) return t('live.row.appliedSumNoCmp');
    return look ? t('live.row.appliedSum', { ok, look }) : t('live.row.appliedSumAllOk', { ok });
  }
  function renderRow(row, st) {
    const r = rowSpec(st);
    if (!r) { row.hidden = true; row.innerHTML = ''; row.dataset.key = ''; return; }
    const html = `<span aria-hidden="true">${r.icon || ''}</span><span class="lv-rowtxt">${r.html}</span><span class="spacer"></span>${(r.actions || []).map(a => `<button type="button" class="btn ${a.cls || ''}" data-lv="${a.act}"${a.arg ? ` data-arg="${esc(a.arg)}"` : ''}>${esc(a.label)}</button>`).join('')}${r.close ? `<button type="button" class="x" data-lv="rowClose" data-key="${esc(r.key)}" aria-label="${esc(t('live.row.close'))}">✕</button>` : ''}`;
    row.hidden = false; row.className = 'lv-row ' + (r.kind || '');
    if (setHtml(row, html)) row.dataset.key = r.key;
  }
  function flashRow() { const r = $('#liveBandRow'); if (r.hidden) return; r.style.animation = 'none'; void r.offsetWidth; r.style.animation = ''; }
  // Sitzung vorbereiten nötig? Vorschau des Runners (visualsToInstall) oder doctor.json (Visuals/Theme fehlen)
  function needsPrep() {
    if (!proj || !alive()) return false;
    if (dep.prepDone && status && +status.seq <= dep.prepDone + 0 && status.state === 'applied' && status.prepare) return false;
    const p = status && status.plan; if (p && Array.isArray(p.visualsToInstall) && p.visualsToInstall.length && (+status.seq || 0) >= (dep.real || 0)) return !prepDone();
    const d = doctor; if (d && typeof d === 'object') {
      const checks = Array.isArray(d.checks) ? d.checks : (Array.isArray(d) ? d : []);
      if (checks.some(c => c && /visual|theme/i.test(String(c.id || c.name || '')) && /error|bad|red|fail|warn|missing/i.test(String(c.state || c.status || '')))) return !prepDone();
      ['visualsMissing', 'missingVisuals', 'visualsToInstall'].forEach(() => { /* unten */ });
      const miss = d.visualsMissing || d.missingVisuals || d.visualsToInstall || (d.visuals && (d.visuals.missing || d.visuals.toInstall));
      if (Array.isArray(miss) && miss.length) return !prepDone();
    }
    return false;
  }
  function prepDone() { const h = (status && status.history) || []; return h.some(x => x && x.prepare && x.state === 'applied') || !!dep.prepDone; }
  function prepList() {
    const p = status && status.plan; let list = (p && Array.isArray(p.visualsToInstall)) ? p.visualsToInstall.slice() : [];
    const d = doctor; if (!list.length && d && typeof d === 'object') { const miss = d.visualsMissing || d.missingVisuals || d.visualsToInstall || (d.visuals && (d.visuals.missing || d.visuals.toInstall)); if (Array.isArray(miss)) list = miss.map(x => typeof x === 'string' ? x : (x && (x.name || x.id)) || '').filter(Boolean); }
    if (!list.length) list = [t('live.prep.visuals')];
    // B2 auf Theme-Ebene: ein eingelesener Bericht behält sein Theme, solange die Gestaltung unverändert ist
    // (Runner: plan.themeRegister). Wird es doch ersetzt, sagt die Pille es ausdrücklich.
    const imported = !!(MK() && MK().state && MK().state.pages.some(pg => pg.pbir));
    const reg = p && typeof p.themeRegister === 'boolean' ? p.themeRegister : !imported;
    const th = imported ? t('live.prep.themeReplace') : t('live.prep.theme');
    if (reg && !list.includes(th)) list.push(th);
    return list;
  }

  // ------------------------------------------------------------------ Pausenkarte (Desktop startet neu) und „Sitzung bereit"
  function renderPause() {
    const p = $('#livePause'); if (!p) return;
    const restarting = proj && busy() && curStep() === 'desktop';
    const seq = status ? (+status.seq || 0) : 0;
    const ready = proj && status && status.prepare && status.state === 'applied' && seq === dep.seq && !busy() && dep.prepDone !== seq;
    if (!restarting && !ready) { p.hidden = true; setHtml(p, ''); p.classList.remove('ready'); return; }
    p.hidden = false;
    if (restarting) {
      p.classList.remove('ready');
      const subs = ['closing', 'installing', 'starting', 'loading'].map(k => t('live.pause.sub.' + k));
      const el = stepElapsed('desktop'); const k = Math.min(subs.length - 1, Math.floor(el / Math.max(20000, estMs()) * subs.length));
      setHtml(p, `<div class="ph"><span class="lv-spin" style="color:var(--sel)"></span><b>${esc(status.prepare ? t('live.pause.prepH') : t('live.pause.h'))}</b><span class="clock">${esc(clock(el))}</span></div><p>${esc(t('live.pause.p'))}</p><div class="bar"></div><ol>${subs.map((s, i) => `<li class="${i < k ? 'done' : i === k ? 'run' : ''}">${i < k ? '✓ ' : ''}${esc(s)}</li>`).join('')}</ol>`);
      return;
    }
    p.classList.add('ready');
    setHtml(p, `<div class="ph"><span class="lv-ck" style="color:var(--ok)">${CHECK_SVG}</span><b>${esc(t('live.pause.readyH'))}</b><span class="clock">${esc(clock(+status.ms || 0))}</span></div><p>${esc(t('live.pause.readyP'))}</p><div class="yellowbar"><span>⚠</span><span>${esc(t('live.pause.yellow'))}</span><span class="fake">${esc(t('live.pause.yellowBtn'))}</span></div><div style="display:flex;justify-content:flex-end"><button type="button" class="btn primary" data-lv="prepDone">${esc(t('live.pause.done'))}</button></div>`);
  }

  // ------------------------------------------------------------------ Rückfragen des Runners (einziges Modal: Neustart bestätigen)
  function closeDialogs() { ['#dlgLiveRestart', '#dlgLivePrep'].forEach(s => { const d = $(s); if (d && d.open) d.close(); }); cdStop(true); }
  // Angebotene Antworten: genau die aus awaiting.options (Tabelle in CONTRACT „Rückfragen"); ohne Liste die Vorgabe je Lage
  function awaitOptions(aw, realWork) {
    const list = Array.isArray(aw.options) ? aw.options.map(String).filter(o => has('live.confirm.' + o)) : [];
    if (list.length) return list;
    if (aw.waitingForSave) return ['discard', 'cancel'].concat(aw.kind === 'restart' ? ['skipRestart'] : []);
    if (aw.kind === 'unsaved') return ['saveFirst', 'discard', 'skipRestart', 'cancel'];
    return realWork ? ['saveFirst', 'skipRestart', 'discard', 'cancel'] : ['restart', 'skipRestart', 'cancel'];
  }
  // Fall A/B aus der Rückfrage selbst (Safety-Review 2, Runde 2): jede ungespeicherte Änderung ist Fall B, auch die eigene
  // Reload-Markierung (der Runner sieht nicht, was danach in Desktop geändert wurde, und bietet dann kein „restart" an).
  // unsavedByUs ändert nur den Text (ownA). Countdown nur ohne Ungespeichertes und nur, wenn der Runner ihn nicht abschaltet.
  function awaitCase(aw) {
    const desk = (status && status.desktop) || {};
    const unsaved = aw.hasUnsavedChanges != null ? !!aw.hasUnsavedChanges : !!desk.hasUnsavedChanges;
    const realWork = aw.kind === 'unsaved' || unsaved;
    return { unsaved, realWork, own: unsaved && !!aw.unsavedByUs, countdown: !realWork && !aw.waitingForSave && aw.countdown !== false };
  }
  // Knöpfe genau aus awaiting.options, in fester Reihenfolge; Neustart in Tinte (Orange nur für Deploy), Verwerfen als Gefahr
  const AWAIT_ORDER = ['saveFirst', 'restart', 'skipRestart', 'discard', 'cancel'];
  const AWAIT_CLS = { saveFirst: 'primary', restart: 'primary', skipRestart: '', discard: 'danger', cancel: 'ghost' };
  function awaitButtons(opts) { return AWAIT_ORDER.filter(o => opts.includes(o)).concat(opts.filter(o => !AWAIT_ORDER.includes(o))); }
  function checkAwaiting() {
    const d = $('#dlgLiveRestart'); if (!d) return;
    const aw = status && status.awaiting; const seq = status ? (+status.seq || 0) : 0;
    const key = aw && alive() && runnerState() === 'awaiting' && seq >= (dep.real || 0) ? [seq, aw.kind, aw.since || '', (aw.options || []).join(','), !!aw.waitingForSave, !!aw.hasUnsavedChanges, !!aw.unsavedByUs].join(':') : '';
    if (!key) { if (d.open) d.close(); cdStop(true); awaitKey = ''; return; }
    if (key === awaitKey) return;
    const sameAsk = awaitKey && awaitKey.split(':').slice(0, 3).join(':') === key.split(':').slice(0, 3).join(':');
    awaitKey = key; if (!sameAsk) confirmed = null;  // dieselbe Rückfrage mit neuen Optionen (z. B. nach saveFirst): Antwort bleibt
    if (aw.kind === 'approval') return;                 // Bandzeile mit „Zu den Freigaben"
    openAwait();
  }
  function openAwait() {
    const d = $('#dlgLiveRestart'), aw = status && status.awaiting; if (!d || !aw) return;
    const seq = +status.seq || 0; const cs = awaitCase(aw);
    const est = clock(estMs() + (aw.kind === 'restart' ? 40000 : 0));
    const opts = awaitOptions(aw, cs.realWork);
    const waiting = !!aw.waitingForSave || (confirmed && confirmed.seq === seq && confirmed.action === 'saveFirst');
    const wsLine = `<p class="ws mono lv-mute" style="font-size:10.5px">awaiting { kind: ${esc(aw.kind)}, unsavedByUs: ${!!aw.unsavedByUs}, hasUnsavedChanges: ${cs.unsaved}, pid: ${esc(aw.pid != null ? aw.pid : '?')}, options: ${esc(opts.join(', '))} }</p>`;
    // B7: Neustart nur für Updates schon installierter Visuals -> skipRestart heißt „Vorhandene Version behalten"
    const lbl = o => answerLabel(o, aw);
    const ups = Array.isArray(aw.updates) && aw.updates.length ? `<p>${esc(t('live.restart.updates', { list: aw.updates.map(u => `${u.name || '?'} ${u.from || '?'} → ${u.to || '?'}`).join(', ') }))}</p>` : '';
    const btn = (o, cls, id) => opts.includes(o) ? `<button type="button" class="btn ${cls}" data-lv="confirm" data-arg="${o}"${id ? ` id="${id}"` : ''}${waiting && o !== 'discard' && o !== 'cancel' && o !== 'skipRestart' ? ' disabled' : ''}>${esc(lbl(o))}</button>` : '';
    if (!cs.realWork) {
      // Fall A: nichts ungespeichert. Countdown nur, wenn restart angeboten ist; der Knopf in Tinte, nicht Orange
      const cd = cs.countdown && opts.includes('restart');
      const footA = awaitButtons(opts).filter(o => o !== 'restart').reverse().map(o => btn(o, o === 'cancel' ? '' : AWAIT_CLS[o] || '')).join('')
        + (opts.includes('restart') ? `<button type="button" class="btn primary" data-lv="confirm" data-arg="restart" id="liveCdBtn">${esc(cd ? t('live.restart.cdBtn', { n: 10 }) : t('live.confirm.restart'))}</button>` : '');
      d.innerHTML = `<div class="dlg-head"><h2 id="dlgLiveRestartH">${esc(t('live.restart.hA'))}</h2><p class="hint">${esc(t('live.restart.pA', { bon: bon(seq), est }))}</p></div>
        <div class="dlg-body"><p>${esc(t('live.restart.bodyA', { bon: bon(seq), reason: (aw.restartReason || aw.reason) ? t('live.restart.because', { r: aw.restartReason || aw.reason }) : '' }))}</p><p>${esc(t('live.restart.noneA'))}</p>${ups}${wsLine}</div>
        <div class="dlg-foot"><span class="lv-cdnote" id="liveCdNote">${esc(t(cd ? 'live.restart.cdNote' : 'live.restart.noCd'))}</span>${footA}</div>`;
      if (!d.open) d.showModal();
      if (cd) cdStart(d); else cdStop(true);
      setTimeout(() => { const b = $('#liveCdBtn') || d.querySelector('.btn'); if (b) b.focus(); }, 30);
    } else {
      // Fall B: alles mit Ungespeichertem. Eigene Reload-Markierung: Kopf und Text ehrlich (ownA), Knöpfe wie angeboten
      const head = aw.kind === 'unsaved' ? 'live.restart.hU' : cs.own ? 'live.restart.hOwn' : 'live.restart.hB';
      const body = aw.kind === 'unsaved' ? (cs.own ? 'live.restart.ownA' : 'live.restart.bodyU') : cs.own ? 'live.restart.ownA' : 'live.restart.bodyB';
      const reason = aw.kind === 'restart' && aw.restartReason ? `<p>${esc(t('live.restart.bodyA', { bon: bon(seq), reason: t('live.restart.because', { r: aw.restartReason }) }))}</p>` : '';
      d.innerHTML = `<div class="dlg-head"><h2 id="dlgLiveRestartH">${esc(t(head))}</h2><p class="hint">${esc(t(aw.kind === 'unsaved' ? 'live.restart.pU' : 'live.restart.pB', { bon: bon(seq) }))}</p></div>
        <div class="dlg-body" id="liveRsBody">${waiting ? `<div class="lv-waitrow" id="liveWaitRow"><span class="lv-spin"></span>${esc(t('live.restart.waiting'))}</div>` : ''}${reason}<p>${esc(t(body))}</p>${ups}<p class="hint" style="font-size:12.5px">${esc(t('live.restart.hintB'))}</p>${wsLine}</div>
        <div class="dlg-foot stack">${awaitButtons(opts).map(o => btn(o, AWAIT_CLS[o] || '')).join('')}</div>`;
      cdStop(true);
      if (!d.open) d.showModal();
      setTimeout(() => { const b = d.querySelector('[data-arg=saveFirst]:not([disabled])') || d.querySelector('.btn:not([disabled])'); if (b) b.focus(); }, 30);
    }
  }
  function cdStart(d) {
    cdStop(true); cdState = { n: 10, stopped: false, d };
    const stop = () => { if (!cdState || cdState.stopped) return; cdState.stopped = true; const b = $('#liveCdBtn'); if (b) b.textContent = t('live.confirm.restart'); const n = $('#liveCdNote'); if (n) n.textContent = t('live.restart.cdStopped'); };
    cdState.stop = stop;
    setTimeout(() => { if (!cdState || cdState.d !== d) return; d.addEventListener('pointermove', stop, { once: true }); d.addEventListener('keydown', e => { if (e.key !== 'Enter') stop(); }, { once: true }); }, 400);
    cdState.iv = setInterval(() => {
      if (!cdState || cdState.stopped) { clearInterval(cdState && cdState.iv); return; }
      cdState.n -= 1; const b = $('#liveCdBtn'); if (b) b.textContent = t('live.restart.cdBtn', { n: cdState.n });
      if (cdState.n <= 0) { clearInterval(cdState.iv); cdState = null; confirmAction('restart').then(() => { if (d.open) d.close(); }); }
    }, 1000);
  }
  function cdStop(silent) { if (cdState) { clearInterval(cdState.iv); if (!silent && cdState.stop) cdState.stop(); cdState = null; } }
  async function onConfirmClick(action) {
    const d = $('#dlgLiveRestart');
    cdStop(true);
    await confirmAction(action);
    if (action === 'saveFirst') {
      const body = $('#liveRsBody'); if (body && !$('#liveWaitRow')) body.insertAdjacentHTML('afterbegin', `<div class="lv-waitrow" id="liveWaitRow"><span class="lv-spin"></span>${esc(t('live.restart.waiting'))}</div>`);
      $$('#dlgLiveRestart .dlg-foot .btn').forEach(b => { if (b.dataset.arg !== 'discard' && b.dataset.arg !== 'cancel') b.disabled = true; });
      return;                                           // bleibt offen, bis der Runner weitermacht (awaiting verschwindet)
    }
    if (d && d.open) d.close();
  }
  // Sitzung vorbereiten (Dialog)
  function openPrep() {
    const d = $('#dlgLivePrep'); if (!d) return;
    const pills = prepList().map(x => `<span class="lv-pl sel">${esc(x)}</span>`).join('');
    d.innerHTML = `<div class="dlg-head"><h2 id="dlgLivePrepH">${esc(t('live.prep.h'))}</h2><p class="hint">${esc(t('live.prep.p'))}</p></div>
      <div class="dlg-body"><p>${esc(t('live.prep.body'))}</p><div class="lv-pills">${pills}</div><p><b>${esc(t('live.prep.after'))}</b></p><p class="lv-smallhint">☕ ${esc(t('live.prep.coffee'))}</p><p class="ws mono lv-mute" style="font-size:10.5px">deploy-request.json · prepare: true · sessionId ${esc(sessionId())}</p></div>
      <div class="dlg-foot stack"><button type="button" class="btn primary" data-lv="prepGo">${esc(t('live.prep.go'))}</button><button type="button" class="btn ghost" data-lv="dlgClose">${esc(t('live.prep.later'))}</button></div>`;
    if (!d.open) d.showModal();
    setTimeout(() => { const b = d.querySelector('[data-lv=prepGo]'); if (b) b.focus(); }, 30);
  }

  // ------------------------------------------------------------------ Deploy-Vorschau (Popover am Knopf, UX-KONZEPT 7)
  function skipPreview() { return ls.get(LS_SKIP) === '1'; }
  async function preview(scope) {
    if (!proj) return; closeMenus();
    // Teilziele (Theme, Modell) fragen den Runner immer, auch ohne Kacheländerung: er kennt den Stand im Bericht
    const ch = changes(); const noChange = !ch.n && (!scope || scope === 'all');
    plan = { seq: 0, local: ch, remote: null, scope: scope || 'all', noChange, at: Date.now() };
    renderPreview();
    if (!noChange && alive() && !busy()) { const seq = await deploy({ dryRun: true, scope: plan.scope }); if (plan) plan.seq = seq || 0; renderPreview(); }
  }
  function renderPreview() {
    const pop = $('#livePreview'); if (!pop || !plan) return;
    const rm = plan.remote; const loc = plan.local; const seqTxt = bon((status && plan.seq && +status.seq === plan.seq ? plan.seq : dep.seq) + 1);
    if (plan.noChange) {
      pop.innerHTML = `<div class="pop-h"><b id="livePreviewH">${esc(t('live.pv.h'))}</b><span class="spacer"></span><span class="mono lv-mute">${esc(bon(dep.real))}</span></div><div class="pv-none">${esc(t('live.pv.none', { bon: bon(dep.real) }))}<p class="hint">${esc(t('live.pv.noneSub'))}</p></div><div class="pv-foot"><span class="spacer"></span><button type="button" class="btn" data-lv="measure">${esc(t('live.pv.measure'))} <span class="lv-kbd">R</span></button></div>`;
    } else {
      let secs = '';
      const pages = rm && rm.pages && typeof rm.pages === 'object' ? rm.pages : null;
      if (pages) {
        Object.keys(pages).forEach(name => { const p = pages[name] || {}; const items = [];
          if (p.new) items.push(['new', t('live.pv.new'), p.new]); if (p.changed) items.push(['chg', t('live.pv.changed'), p.changed]); if (p.moved) items.push(['mov', t('live.pv.moved'), p.moved]); if (p.removed) items.push(['rem', t('live.pv.removed'), p.removed]);
          if (!items.length) return;
          secs += `<div class="pv-sec"><h4>${esc(t('live.pv.page', { name }))}</h4><ul>${items.map(i => `<li><span class="pvk ${i[0]}">${esc(i[1])}</span><span>${esc(i[2] === 1 ? t('live.pv.n1') : t('live.pv.n', { n: i[2] }))}</span></li>`).join('')}</ul></div>`; });
      } else {
        Object.keys(loc.pages).forEach(name => { const p = loc.pages[name]; secs += `<div class="pv-sec"><h4>${esc(t('live.pv.page', { name }))}</h4><ul>${p.items.map(i => `<li><span class="pvk ${i.k}">${esc(t('live.pv.' + (i.k === 'new' ? 'new' : i.k === 'mov' ? 'moved' : 'changed')))}</span><span>${esc(i.name)}</span></li>`).join('')}</ul></div>`; });
        if (loc.theme) secs += `<div class="pv-sec"><h4>${esc(t('live.pv.theme'))}</h4><ul><li><span class="pvk chg">${esc(t('live.pv.changed'))}</span><span>${esc(t('live.dep.detail.theme'))}</span></li></ul></div>`;
      }
      const ops = rm && Array.isArray(rm.modelOps) ? rm.modelOps : approvalTodos().map(x => ({ id: x.id, summary: x.summary, needsApproval: x.needsApproval, approved: approvalState(x).k === 'approved' }));
      secs += `<div class="pv-sec"><h4>${esc(t('live.pv.model'))}</h4>${ops.length ? '<ul>' + ops.map(o => `<li><span class="pvk ${o.approved || !o.needsApproval ? 'ok' : 'wait'}">${esc(o.approved || !o.needsApproval ? t('live.pv.approved') : t('live.pv.waits'))}</span><span>${esc(o.summary || o.id)}${o.approved || !o.needsApproval ? '' : ` <small>${esc(t('live.pv.waitsSub'))}</small>`}</span></li>`).join('') + '</ul>' : `<p class="hint" style="margin:0">${esc(t('live.pv.noModel'))}</p>`}</div>`;
      const est = rm && +rm.estMs > 0 ? rm.estMs : estMs(); const npg = MK().state.pages.length; const touched = pages ? Object.keys(pages).filter(n => { const p = pages[n]; return p && (p.new || p.changed || p.moved || p.removed); }).length : Object.keys(loc.pages).length;
      const vis = rm && Array.isArray(rm.visualsToInstall) && rm.visualsToInstall.length ? `<li><span>${esc(t('live.pv.visuals', { list: rm.visualsToInstall.join(', ') }))}</span></li>` : '';
      secs += `<div class="pv-sec"><h4>${esc(t('live.pv.desktop'))}</h4><ul><li><span>${esc(rm && rm.restart ? t('live.pv.restart') : t('live.pv.noRestart'))} · ${esc(t('live.pv.pages', { n: touched, m: npg }))}</span><small>${esc(t('live.pv.est', { est: fmtS(est) }))}</small></li>${vis}</ul>${rm ? `<div class="ws mono lv-mute" style="font-size:10px;margin-top:2px">dryRun: restart=${!!rm.restart} · modelOps=${ops.length} · estMs=${esc(rm.estMs)}</div>` : ''}</div>`;
      const calc = !rm ? (plan.seq && alive() ? `<div class="pv-calc"><span class="lv-spin"></span>${esc(t('live.pv.calc'))}</div>` : `<p class="hint" style="padding:6px 14px 0">${esc(t(alive() ? 'live.pv.local' : 'live.pv.localOff'))}</p>`) : '';
      const scopes = [['all', t('live.menu.all')], ['layout', t('live.menu.layout')], ['theme', t('live.menu.theme')], ['model', t('live.menu.model')]];
      pop.innerHTML = `<div class="pop-h"><b id="livePreviewH">${esc(t('live.pv.h'))}</b><span class="spacer"></span>${bonHtml(seqTxt.slice(1))}</div>${calc}${secs}
        <div class="pv-foot"><span class="lv-mute" style="font-size:12px">${esc(t('live.pv.scope'))}</span><select id="livePvScope" aria-label="${esc(t('live.pv.scope'))}">${scopes.map(s => `<option value="${s[0]}"${plan.scope === s[0] ? ' selected' : ''}>${esc(s[1])}</option>`).join('')}</select><span class="spacer"></span><button type="button" class="btn accent" data-lv="transfer" id="livePvGo">${esc(t('live.pv.go'))} <span class="lv-kbd">Strg+Enter</span></button>
        <label class="pv-skip"><input type="checkbox" id="livePvSkip"${skipPreview() ? ' checked' : ''}> ${esc(t('live.pv.skip'))}</label></div>`;
    }
    pop.hidden = false;
    const r = $('#liveDep').getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - 410, r.right - 400 + 30));
    pop.style.left = left + 'px'; pop.style.top = (r.bottom + 10) + 'px';
    pop.style.setProperty('--ar', Math.max(16, Math.min(380, (r.left + r.width / 2) - left - 6)) + 'px');
  }
  function closePreview() { const pop = $('#livePreview'); if (pop) pop.hidden = true; plan = null; }
  function transfer() { const sel = $('#livePvScope'); const scope = sel ? sel.value : (plan ? plan.scope : 'all'); closePreview(); return deploy({ scope }); }
  // Hauptknopf: Vorschau, bei kleinen Änderungen (Häkchen) direkt deployen
  function mainClick() {
    const st = depState();
    if (st.s === 'changes' || st.s === 'restart') { if (skipPreview() && st.n <= SKIP_MAX && st.s === 'changes') return deploy({ scope: 'all' }); return preview('all'); }
    if (st.s === 'current' || st.s === 'applied') return preview('all');
    if (st.s === 'blocked' || st.s === 'error' || st.s === 'locked' || st.s === 'pending') return flashRow();
    if (st.s === 'awaiting') return openAwait();
  }

  // ------------------------------------------------------------------ Menüs (Deploy ▾ und ⋯)
  function placeMenu(menu, anchor) {
    menu.hidden = false;
    const r = anchor.getBoundingClientRect(), w = menu.offsetWidth;
    menu.style.top = (r.bottom + 6) + 'px';
    menu.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w)) + 'px';
  }
  function openDepMenu() {
    const m = $('#liveDepMenu'); closePreview();
    const h = (status && Array.isArray(status.history)) ? status.history.filter(x => x && x.state === 'applied' && x.backup !== false) : [];
    const last = h.length > 1 ? h[h.length - 2] : null;
    const dis = busy() || deploying || !!mismatch() ? ' disabled' : '';
    m.innerHTML = `<button type="button" data-lv="menuDeploy" data-arg="all"${dis}>${esc(t('live.menu.all'))}<span class="lv-kbd">Strg+Enter</span></button><button type="button" data-lv="menuDeploy" data-arg="layout"${dis}>${esc(t('live.menu.layout'))}</button><button type="button" data-lv="menuDeploy" data-arg="theme"${dis}>${esc(t('live.menu.theme'))}</button><button type="button" data-lv="menuDeploy" data-arg="model"${dis}>${esc(t('live.menu.model'))}</button><hr>
      <button type="button" data-lv="measure"${dis}>${esc(t('live.menu.measure'))}<span class="lv-kbd">R</span></button><button type="button" data-lv="preview">${esc(t('live.menu.preview'))}</button><hr>
      <button type="button" data-lv="goHist"${last ? '' : ' disabled'}>${esc(last ? t('live.menu.backTo', { bon: bon(last.seq), time: hhmm(last.at) }) : t('live.menu.noBack'))}</button>`;
    placeMenu(m, $('#liveDep'));
  }
  function openMoreMenu() {
    const m = $('#liveMoreMenu'); const ws = wsMode();
    m.innerHTML = `<div class="mh">${esc(t('live.menu.mode'))}</div>
      <button type="button" class="opt ${ws ? '' : 'on'}" data-lv="setMode" data-arg="mod"><span class="radio"></span><span>${esc(t('live.menu.mod'))}<small>${esc(t('live.menu.modSub'))}</small></span></button>
      <button type="button" class="opt ${ws ? 'on' : ''}" data-lv="setMode" data-arg="ws"><span class="radio"></span><span>${esc(t('live.menu.ws'))}<small>${esc(t('live.menu.wsSub'))}</small></span></button><hr>
      <button type="button" data-lv="protocol"${proj ? '' : ' disabled'}>${esc(t('live.menu.protocol'))}</button><button type="button" data-lv="disconnect"${proj || stored ? '' : ' disabled'}>${esc(t('live.menu.disconnect'))}</button>`;
    placeMenu(m, $('#btnMore'));
  }
  function closeMenus() { ['#liveDepMenu', '#liveMoreMenu'].forEach(s => { const m = $(s); if (m) m.hidden = true; }); }

  // ------------------------------------------------------------------ Rechtes Panel, Tab „Live": Jetzt · Bereitschaft · Freigaben · Verlauf
  function liveTabVisible() { const el = $('#insLive'); return !!el && !el.hidden; }
  function renderLiveTab() {
    const dot = $('#liveTabDot'); if (dot) { const st = depState(); dot.className = 'lv-tdot ' + (!proj ? '' : st.s === 'running' || st.s === 'pending' ? 'sel' : st.s === 'blocked' || st.s === 'awaiting' ? 'warn' : st.s === 'error' || st.s === 'locked' ? 'bad' : 'ok'); }
    const el = $('#insLive'); if (!el || el.hidden) return;
    if (!proj) { setHtml(el, `<div class="lv-sec"><h3>${esc(t('live.lt.now'))}</h3><div class="lv-empty"><strong>${esc(t('live.lt.cold'))}</strong>${esc(t('live.lt.coldSub'))}</div></div>`); return; }
    if (typingIn(el)) return;                           // DAX wird gerade bearbeitet: nicht unter den Fingern neu zeichnen
    if (setHtml(el, `<div class="lv-sec" id="liveSecNow">${nowHtml()}</div><div class="lv-sec" id="liveSecReady">${readyHtml()}</div><div class="lv-sec" id="liveSecFg">${fgSecHtml()}</div><div class="lv-sec" id="liveSecHist">${histHtml()}</div>`)) loadHistThumbs();
  }
  function nowListHtml(sts, done) {
    return '<ul class="lv-now">' + sts.map(s => `<li class="${s.state}"><span class="ic">${s.state === 'done' ? '✓' : s.state === 'fail' ? '✕' : ''}</span><span>${esc(t('live.station.' + s.id))}</span><span class="tm">${s.state === 'todo' ? '' : esc(fmtS(s.ms))}</span>${s.tech ? `<span class="tech ws">${esc(s.tech)}</span>` : ''}</li>`).join('') + '</ul>';
  }
  function nowHtml() {
    const st = depState(); const seq = status ? (+status.seq || 0) : 0;
    if (st.s === 'running' && !st.dry) {
      if (curStep() === 'desktop') return `<h3>${esc(t('live.lt.now'))} <span class="r mono">${esc(clock(stepElapsed('desktop')))}</span></h3><div class="lv-empty" style="text-align:left"><strong>${esc(t('live.pause.h'))}</strong>${esc(t('live.pause.p'))}</div>`;
      return `<h3>${esc(t('live.lt.now'))} · ${bonHtml(seq)}<span class="r mono">${esc(fmtS(elapsedMs()))} · ${esc(t('live.lt.usual', { s: fmtS(estMs()) }))}</span></h3>${nowListHtml(stationStates())}`;
    }
    if (status && Array.isArray(status.steps) && status.steps.length && !status.dryRun && status.state !== 'planned') {
      return `<h3>${esc(t('live.lt.now'))} · ${esc(t('live.lt.last'))} ${bonHtml(seq)}<span class="r mono">${esc(fmtS(+status.ms || 0))}</span></h3>${nowListHtml(stationStates())}` + (st.s === 'current' ? `<p class="hint">${esc(t('live.lt.empty'))} ${esc(t('live.lt.emptySub', { bon: bon(dep.real) }))}</p>` : '');
    }
    if (st.s === 'changes' || st.s === 'restart') return `<h3>${esc(t('live.lt.now'))}</h3><ul class="lv-amp"><li><i class="lv-dot sel"></i><span><b>${esc(st.n === 1 ? t('live.lt.changes1') : t('live.lt.changesWait', { n: st.n }))}</b><small>${esc(st.s === 'restart' ? t('live.lt.withRestart', { est: fmtS(estMs() + 40000) }) : t('live.lt.noRestart', { est: fmtS(estMs()) }))}</small></span><button type="button" class="btn sm" data-lv="preview">${esc(t('live.lt.preview'))}</button></li></ul>`;
    return `<h3>${esc(t('live.lt.now'))}</h3><div class="lv-empty"><strong>${esc(t('live.lt.empty'))}</strong>${esc(dep.real ? t('live.lt.emptySub', { bon: bon(dep.real) }) : t('live.lt.notConnected'))}</div>`;
  }
  function readyHtml() {
    const desk = deskInfo(); const rc = readyCount(); const pp = projectPath();
    const rows = [
      alive() ? { c: curStep() === 'desktop' ? 'warn' : (desk && desk.connected ? 'ok' : 'warn'), t: curStep() === 'desktop' ? t('live.band.desktopRestart') : (desk && desk.connected ? t('live.lt.deskOn') : t('live.lt.deskOff')), s: desk && desk.connected ? t('live.lt.deskOnSub', { f: String(desk.file || '').split(/[\\/]/).pop() }) + (desk.hasUnsavedChanges ? ' · ' + t('live.lt.deskUnsaved') : '') : t('live.lt.deskOffSub'), w: desk && desk.pid ? 'pid ' + desk.pid : '' } : { c: 'warn', t: t('live.lt.deskOff'), s: t('live.lt.deskOffSub') },
      alive() ? { c: 'ok', t: t('live.lt.helperOn'), s: t('live.lt.helperOnSub', { p: pp || proj.root.name }), w: 'agent-status.json · ' + fmtS(Date.now() - heartbeat()) + ' · ' + ((status.runner && status.runner.version) || '?') } : { c: 'warn', t: t('live.lt.helperOff'), s: t('live.lt.helperOffSub') },
      needsPrep() ? { c: 'warn', t: t('live.lt.prepNeeded'), s: t('live.lt.prepNeededSub'), a: ['openPrep', t('live.lt.prepBtn')] } : { c: alive() ? 'ok' : 'ring', t: t('live.lt.visualsOk'), s: t('live.lt.visualsOkSub') },
      { c: rc.ok < rc.n ? 'warn' : 'ok', t: t('live.lt.tilesReady', { ok: rc.ok, n: rc.n }), s: rc.ok < rc.n ? (rc.needs.length === 1 ? t('live.ready.needs1', { list: rc.needs[0].name + ': ' + rc.needs[0].txt }) : t('live.ready.needs', { n: rc.needs.length, list: rc.needs.map(x => x.name).join(', ') })) : t('live.lt.tilesReadySub'), a: rc.ok < rc.n ? ['goTiles', t('live.lt.see')] : null },
      teOn() ? { c: alive() ? 'ok' : 'ring', t: t('live.lt.teOn'), s: t('live.lt.teOnSub') } : { c: 'ring', t: t('live.lt.teOff'), s: t('live.lt.teOffSub') },
    ];
    return `<h3>${esc(t('live.lt.ready'))}</h3><ul class="lv-amp">` + rows.map(x => `<li><i class="lv-dot ${x.c}"></i><span><b>${esc(x.t)}</b><small>${esc(x.s)}</small>${x.w ? `<small class="ws mono">${esc(x.w)}</small>` : ''}</span>${x.a ? `<button type="button" class="btn sm" data-lv="${x.a[0]}">${esc(x.a[1])}</button>` : '<span></span>'}</li>`).join('') + '</ul>';
  }
  function fgSecHtml() {
    const list = approvalTodos(); const open = pendingApprovals().length;
    if (!list.length) return `<h3>${esc(t('live.lt.approvals'))}</h3><p class="hint" style="margin:0">${esc(t('live.lt.noApprovals'))}</p>`;
    return `<h3>${esc(t('live.lt.approvals'))}${open ? ` <span class="lv-cnt">${open}</span>` : ''}</h3>` + list.map(x => fgCard(x)).join('');
  }
  function histHtml() {
    const h = (status && Array.isArray(status.history)) ? status.history.filter(Boolean) : [];
    if (!h.length) return `<h3>${esc(t('live.lt.history'))}</h3><p class="hint" style="margin:0">${esc(t('live.lt.noHistory'))}</p>`;
    const cur = h[h.length - 1].seq; const list = h.slice().reverse();
    return `<h3>${esc(t('live.lt.history'))} <span class="r lv-mute">${esc(t('live.lt.deploys', { n: h.length }))}</span></h3><ul class="lv-hist">` + list.map(x => {
      const bad = x.state === 'failed' || x.state === 'blocked' || x.state === 'cancelled'; const sum = [x.message, x.counts ? `${x.counts.applied || 0} ✓${x.counts.warn ? ` · ${x.counts.warn} !` : ''}${x.counts.error ? ` · ${x.counts.error} ✕` : ''}` : ''].filter(Boolean).join(' · ');
      const url = x.kitchenPng ? hist.urls[x.kitchenPng] : null;
      return `<li class="${x.seq === cur ? 'cur' : ''}" data-hseq="${esc(x.seq)}"><div class="th" data-lv="openResult" data-seq="${esc(x.seq)}" style="${url ? `background-image:url(${esc(url)})` : ''}"${x.kitchenPng ? ` data-png="${esc(x.kitchenPng)}"` : ''}></div>
        <div class="meta"><div class="top">${bonHtml(x.seq)}<span class="mono lv-mute">${esc(hhmm(x.at))}</span>${x.seq === cur ? `<span class="lv-pl ok" style="padding:0 7px;font-size:10.5px">${esc(t('live.lt.current'))}</span>` : ''}${bad ? `<span class="lv-pl" style="color:var(--bad)">${esc(has('live.state.' + x.state) ? t('live.state.' + x.state) : x.state)}</span>` : ''}${x.restoredFrom != null ? `<span class="lv-pl">↶${esc(x.restoredFrom)}</span>` : ''}${x.prepare ? `<span class="lv-pl">${esc(t('live.lt.prepareLbl'))}</span>` : ''}</div><small>${esc(sum)}</small>
        <div class="acts">${x.shotPage || x.kitchenPng ? `<button type="button" class="btn sm" data-lv="openResult" data-seq="${esc(x.seq)}">${esc(t('live.lt.compare'))}</button>` : ''}${x.seq !== cur && x.state === 'applied' && x.backup !== false ? `<button type="button" class="btn sm ghost" data-lv="histBack" data-seq="${esc(x.seq)}">${esc(t('live.lt.back'))}</button>` : ''}</div></div>
        ${dep.histConfirm === x.seq ? `<div class="confirm"><p>${t('live.lt.backQ', { bon: esc(bon(x.seq)), list: esc(h.filter(y => y.seq > x.seq).map(y => bon(y.seq)).join(', ')) })}</p><div style="display:flex;gap:6px;justify-content:flex-end"><button type="button" class="btn sm" data-lv="histCancel">${esc(t('btn.cancel'))}</button><button type="button" class="btn sm accent" data-lv="histGo" data-seq="${esc(x.seq)}">${esc(t('live.lt.backGo', { bon: bon(x.seq) }))}</button></div></div>` : ''}</li>`;
    }).join('') + '</ul>';
  }
  async function loadHistThumbs() {
    const els = $$('#liveSecHist .th[data-png]'); for (const el of els) {
      const p = el.dataset.png; if (hist.urls[p] || hist.loading[p]) continue; hist.loading[p] = true;
      try { const f = await fileAt(p); hist.urls[p] = URL.createObjectURL(f); const e2 = $(`#liveSecHist .th[data-png="${CSS.escape(p)}"]`); if (e2) e2.style.backgroundImage = `url(${hist.urls[p]})`; } catch (e) { if (isPerm(e)) { lose(); return; } }
      finally { hist.loading[p] = false; }
    }
  }
  function goTab(sec) {
    const tab = $('#tabLive'); if (tab && !tab.classList.contains('active')) tab.click(); else renderLiveTab();
    setTimeout(() => { const e = $('#' + sec); if (!e) return; e.scrollIntoView({ block: 'start', behavior: RM ? 'auto' : 'smooth' }); e.classList.remove('hl'); void e.offsetWidth; e.classList.add('hl'); }, 40);
  }

  // ------------------------------------------------------------------ Ergebnis (ganzseitig, UX-KONZEPT 9)
  function resultSeq() {
    const seq = resSeqOf();
    if (seq && status.pages && Object.keys(status.pages).some(n => status.pages[n] && (status.pages[n].shotPage || status.pages[n].shot))) return seq;
    const h = (status && Array.isArray(status.history)) ? status.history.filter(x => x && (x.shotPage || x.kitchenPng)) : [];
    return h.length ? h[h.length - 1].seq : 0;
  }
  // Seiteneinträge des Status gehören zu dieser seq (auch über „previous" bei Vorschau und Abbruch)
  const statusHas = seq => !!(status && seq && resSeqOf() === seq);
  function verdictOf(diff) {
    if (!diff || typeof diff !== 'object') return { k: 'none', txt: t('live.res.verdict.none'), cls: 'v-none', pct: null, notes: [] };
    const v = +diff.score; const pct = isFinite(v) ? Math.round(v <= 1 ? v * 100 : v) : null; const notes = Array.isArray(diff.notes) ? diff.notes.map(String) : (diff.notes ? [String(diff.notes)] : []);
    const empty = notes.find(n => /leer|kein Diagramm|nichts|empty/i.test(n)); const data = notes.find(n => /voller|leerer|Daten|Menge|amount|fuller|emptier/i.test(n));
    const other = notes.filter(n => n !== data);
    let k, txt;
    if (empty && (pct == null || pct <= 45)) { k = 'empty'; txt = t('live.res.verdict.empty'); }
    else if (pct == null) { k = 'none'; txt = t('live.res.verdict.none'); }
    else if (pct >= 90) { k = data ? 'data' : 'ok'; txt = t(data ? 'live.res.verdict.data' : 'live.res.verdict.ok'); }
    else if (pct >= 70) { k = other.length ? 'slight' : 'data'; txt = other.length ? t('live.res.verdict.slight', { n: other[0] }) : t('live.res.verdict.data'); }
    else { k = 'off'; txt = t('live.res.verdict.off', { n: other[0] || notes[0] || '' }); }
    const cls = { ok: 'v-ok', data: 'v-mid', slight: 'v-warn', off: 'v-warn', empty: 'v-bad', none: 'v-none' }[k];
    return { k, txt, cls, pct, notes };
  }
  function resKey(seq) { return seq + '|' + ((status && status.finishedAt) || '') + '|' + fnv(statusRaw || ''); }
  // Desktop-Bild auf Seitengröße bringen: shotPage ist schon zugeschnitten; ein rohes shot wird über compare.canvas zugeschnitten.
  // Ohne shotPage und ohne compare.canvas (Seitenfläche nicht erkannt, B5) bleibt es eine Rohaufnahme: nur als Ganzes zu sehen,
  // keine Kachelausschnitte (raw: true).
  async function pageSizedUrl(entry, w, h) {
    if (!entry) return null;
    if (entry.shotPage) { try { return { url: URL.createObjectURL(await fileAt(entry.shotPage)), raw: false }; } catch (e) { if (isPerm(e)) { lose(); return null; } } }
    if (!entry.shot) return null;
    let f; try { f = await fileAt(entry.shot); } catch (e) { if (isPerm(e)) lose(); return null; }
    const cv = entry.compare && entry.compare.canvas;
    if (!cv || !(cv.w > 0 && cv.h > 0) || typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') return { url: URL.createObjectURL(f), raw: true };
    try { const bm = await createImageBitmap(f); const c = new OffscreenCanvas(w, h); c.getContext('2d').drawImage(bm, cv.x || 0, cv.y || 0, cv.w, cv.h, 0, 0, w, h); return { url: URL.createObjectURL(await c.convertToBlob({ type: 'image/png' })), raw: false }; }
    catch (e) { return { url: URL.createObjectURL(f), raw: true }; }
  }
  // Ergebnis laden: tiles.json und die Seitenliste sofort, Bilder nur für die angezeigte Seite (bei 23 Seiten sonst 46 Bilder auf einmal)
  async function loadResult(seq) {
    const key = resKey(seq); if (res.key === key || res.loading) return; res.loading = true;
    let tj = null; const pages = {};
    try {
      tj = await readJsonAt('kitchen/' + seq + '/tiles.json');
      const S = MK().state; const W = S.canvas.w, H = S.canvas.h;
      const names = S.pages.map(p => p.name); ((tj && tj.pages) || []).forEach(p => { if (p && !names.includes(p.name)) names.push(p.name); });
      for (const name of names) {
        const n = nfc(name); const tp = ((tj && tj.pages) || []).find(p => p && nfc(p.name) === n);
        const entry = statusHas(seq) ? pageEntry(name) : null;
        pages[n] = { w: (tp && tp.width) || W, h: (tp && tp.height) || H, tp, entry, time: entry && status.finishedAt ? hhmm(status.finishedAt) : '', loaded: false, raw: false };
      }
      Object.values(res.urls).forEach(u => URL.revokeObjectURL(u));
      res.urls = {}; res.tiles = tj; res.pages = pages; res.seq = seq; res.key = key;
    } finally { res.loading = false; }
    if (res.open) { await loadResultPage(res.page); renderResult(); }
  }
  async function loadResultPage(n) {
    const pg = res.pages[n]; if (!pg || pg.loaded || pg.loading) return; pg.loading = true; const key = res.key;
    try {
      let ku = null, du = null;
      if (pg.tp) { try { ku = URL.createObjectURL(await fileAt(pg.tp.png || ('kitchen/' + res.seq + '/' + pg.tp.file))); } catch (e) { if (isPerm(e)) { lose(); return; } } }
      const d = await pageSizedUrl(pg.entry, pg.w, pg.h); if (d) { du = d.url; pg.raw = d.raw; }
      if (res.key !== key) { if (ku) URL.revokeObjectURL(ku); if (du) URL.revokeObjectURL(du); return; }
      if (ku) res.urls['k:' + n] = ku; if (du) res.urls['d:' + n] = du; pg.loaded = true;
    } finally { pg.loading = false; }
  }
  function openResult(seq) {
    closeMenus(); closePreview();
    seq = +seq || resultSeq(); if (!seq) { toast(t('live.res.none')); return; }
    res.open = true; res.seq = seq; if (!res.page || !MK().state.pages.some(p => nfc(p.name) === res.page)) res.page = nfc(MK().page().name);
    const v = $('#liveResult'); v.hidden = false; const b = $('#liveBands'); v.style.setProperty('--lv-top', (b ? b.getBoundingClientRect().bottom : 52) + 'px');
    if (res.key !== resKey(seq)) { renderResult(); loadResult(seq); } else { renderResult(); showResultPage(res.page); }
  }
  function showResultPage(n) { res.page = n; const pg = res.pages[n]; if (pg && !pg.loaded) loadResultPage(n).then(() => { if (res.open && res.page === n) renderResult(); }); renderResult(); }
  function closeResult() { const v = $('#liveResult'); if (v) { v.hidden = true; v.innerHTML = ''; } res.open = false; blinkStop(true); const l = $('#liveLoupe'); if (l) l.hidden = true; }
  function tilesOnPage(n) {
    const tj = res.tiles || {}; const out = [];
    Object.keys(tj.tiles || {}).forEach(id => { const x = tj.tiles[id]; if (x && nfc(x.page) === n) out.push({ id, name: x.displayName || x.title || x.kind || id, kind: x.kind, mk: x.id, rect: x.rect }); });
    if (!out.length) { const pg = MK().state.pages.find(p => nfc(p.name) === n); if (pg) MK().computeAll(pg).leaves.forEach(l => { const v = l.node.visual; if (v) out.push({ id: l.node.id, name: v.title || ((MK().catalog.byId[v.kind] || {}).label) || v.kind, kind: v.kind, mk: 'mk_' + l.node.id, rect: l.rect }); }); }
    out.sort((a, b) => (a.rect.y - b.rect.y) || (a.rect.x - b.rect.x));
    return out;
  }
  function renderResult() {
    const v = $('#liveResult'); if (!v || !res.open) return;
    const n = res.page; const pg = res.pages[n] || { w: MK().state.canvas.w, h: MK().state.canvas.h, time: '' }; const ku = res.urls['k:' + n], du = pg.raw ? null : res.urls['d:' + n];
    const names = MK().state.pages.map(p => nfc(p.name)); Object.keys(res.pages).forEach(k => { if (!names.includes(k)) names.push(k); });
    const modes = [['side', 'live.res.side'], ['slider', 'live.res.slider'], ['fade', 'live.res.fade'], ['diff', 'live.res.diff']];
    const tiles = tilesOnPage(n); const seal = dep.seals[n];
    const vis = status && status.visuals && statusHas(res.seq) ? status.visuals : {};
    v.innerHTML = `<div class="fv-head"><div class="fv-title"><b id="liveResultH">${esc(t('live.res.h'))}</b><span class="mono">${esc(t('live.res.sub', { bon: bon(res.seq), time: pg.time || hhmm(status && status.finishedAt), page: n }))}</span></div>
      <div class="lv-seg pages">${names.map(x => `<button type="button" class="${x === n ? 'on' : ''}" data-lv="resPage" data-page="${esc(x)}">${esc(x)}${dep.seals[x] ? ` <span class="lv-seal">✓ ${esc(hhmm(dep.seals[x].at))}</span>` : ''}</button>`).join('')}</div>
      <div class="lv-seg">${modes.map(m => `<button type="button" class="${res.mode === m[0] ? 'on' : ''}" data-lv="resMode" data-mode="${m[0]}">${esc(t(m[1]))}</button>`).join('')}</div>
      <span class="spacer"></span><button type="button" class="btn ghost" data-lv="closeResult">✕ ${esc(t('live.res.close'))}</button></div>
      <div class="lv-res"><div class="res-cmp"><div class="cmp" id="liveCmp"></div><div class="cmp-tools" id="liveCmpTools"></div>
        <div class="cmp-legend"><span><span class="lv-kbd">Leertaste</span> ${esc(t('live.res.legendBlink').replace(/^[^:]*: /, ''))}</span><span><span class="lv-kbd">Alt</span> ${esc(t('live.res.legendLoupe').replace(/^[^:]*: /, ''))}</span><span><span class="lv-kbd">[</span> <span class="lv-kbd">]</span> ${esc(t('live.res.legendKeys'))}</span></div>
        <div class="fixed-sentence"><i></i>${esc(t('live.res.fixed'))}</div></div>
      <aside class="res-list"><div class="rl-h"><b>${esc(t('live.res.perTile'))}</b><span class="lv-mute">${esc(t('live.res.order', { n: tiles.length }))}</span></div><div class="rows">${tiles.map(x => rowHtml(x, vis, ku, du, pg)).join('')}</div>
        <div class="rl-foot" id="liveRlFoot">${seal ? `<div class="lv-accepted"><span class="lv-ck">${CHECK_SVG}</span>${esc(t('live.res.accepted', { t: hhmm(seal.at) }))}</div>` : `<button type="button" class="btn primary" data-lv="accept">${esc(t('live.res.accept'))}</button>`}</div></aside></div>`;
    renderCmp();
  }
  function fitHtml(url, none, pg) { return `<div class="lv-fit" style="--ar:${pg.w}/${pg.h}">${url ? `<img src="${esc(url)}" alt="" draggable="false">` : `<div class="lv-none">${esc(none)}</div>`}</div>`; }
  function cropW() { const listW = window.innerWidth >= 1700 ? 520 : (window.innerWidth <= 1100 ? 360 : 450); return Math.floor((listW - 32 - 22 - 6) / 2); }
  function cropHtml(url, pg, r, w, label) {
    let s = w / r.w; if (r.h * s > 118) s = 118 / r.h;
    const h = Math.round(r.h * s), cw = Math.round(r.w * s);
    const bg = url ? `background-image:url(${esc(url)});background-size:${(pg.w * s).toFixed(1)}px ${(pg.h * s).toFixed(1)}px;background-position:${(-r.x * s).toFixed(1)}px ${(-r.y * s).toFixed(1)}px;` : '';
    return `<div class="lv-crop" style="height:${h}px;width:${cw}px;margin:0 auto;${bg}">${label ? `<span class="cl">${esc(label)}</span>` : ''}</div>`;
  }
  function rowHtml(x, vis, ku, du, pg) {
    const d = vis[x.id] || vis[x.mk] || vis['mk_' + x.id]; const vd = verdictOf(d && d.diff); const st = (dep.rows[res.seq + ':' + x.id]) || {};
    const bar = vd.pct == null ? 'bad' : vd.pct >= 90 ? '' : vd.pct >= 75 ? 'mid' : vd.pct > 0 ? 'warn' : 'bad';
    return `<div class="lv-trow${st.ok ? ' passt' : ''}" data-tid="${esc(x.id)}"><div class="tr-crops">${cropHtml(ku, pg, x.rect, cropW(), t('live.res.sketch'))}${cropHtml(du, pg, x.rect, cropW(), t('live.res.desktop'))}</div>
      <div class="tr-name"><b>${esc(x.name)}</b>${vd.pct != null && vd.pct >= 98 ? `<span class="lv-deck">${esc(t('live.res.deck'))}</span>` : ''}<span class="ws mono lv-mute">${esc(x.mk)} · ${esc(x.kind || '')}</span></div>
      <div class="verdict ${vd.cls}" title="${esc(vd.notes.join(' · '))}">${esc(vd.txt)}</div>
      ${vd.pct != null ? `<div class="aufbau ${bar}" title="${esc(t('live.res.aufbauTip', { n: vd.pct }))}"><span>${esc(t('live.res.aufbau'))}</span><i><b style="width:${Math.max(2, vd.pct)}%"></b></i><em class="ws">${vd.pct} %</em></div>` : ''}
      ${vd.notes.length > 1 ? `<ul class="notes">${vd.notes.map(nn => `<li>${esc(nn)}</li>`).join('')}</ul>` : ''}
      ${st.ok ? `<div class="tr-done"><span class="lv-ck">${CHECK_SVG}</span>${esc(t('live.res.okAt', { t: hhmm(st.at) }))}</div>` : st.noteOpen
        ? `<div class="tr-note"><textarea placeholder="${esc(t('live.res.notePh'))}">${esc(st.note || '')}</textarea><div style="display:flex;gap:6px;justify-content:flex-end;margin-top:6px"><button type="button" class="btn sm" data-lv="rowNoteCancel">${esc(t('btn.cancel'))}</button><button type="button" class="btn sm primary" data-lv="rowNoteSave">${esc(t('live.res.noteSave'))}</button></div></div>`
        : `${st.note ? `<div class="hint" style="margin:0 0 6px">${esc(t('live.res.noteLbl', { n: st.note }))}</div>` : ''}<div class="tr-act"><button type="button" class="btn sm" data-lv="rowOk">${esc(t('live.res.ok'))}</button><button type="button" class="btn sm" data-lv="rowNote">${esc(t('live.res.note'))}</button><button type="button" class="btn sm ghost" data-lv="rowShow">${esc(t('live.res.show'))}</button></div>`}</div>`;
  }
  function renderCmp() {
    const c = $('#liveCmp'), tools = $('#liveCmpTools'); if (!c) return;
    const n = res.page; const pg = res.pages[n] || { w: MK().state.canvas.w, h: MK().state.canvas.h, time: '' }; const ku = res.urls['k:' + n], du = res.urls['d:' + n];
    const loading = pg && pg.loading && !pg.loaded;
    const cs = `<span class="lv-corner">${esc(t('live.res.sketch'))} · ${esc(bon(res.seq))}</span>`, cd = `<span class="lv-corner dt">${esc(t('live.res.desktop'))}${pg.time ? ' · ' + esc(pg.time) : ''}${pg.raw ? ' · ' + esc(t('live.res.rawShot')) : ''}</span>`;
    const mode = res.blink ? 'blink' : (pg.raw ? 'side' : res.mode);
    const noDesk = loading ? t('live.res.loading') : t('live.res.noDesktop'), noKit = loading ? t('live.res.loading') : t('live.res.noKitchen');
    if (mode === 'side') {
      // Rohaufnahme (Seitenfläche nicht erkannt): das Desktop-Bild in seinem eigenen Seitenverhältnis, nicht auf die Seite gezwungen
      c.innerHTML = `<div class="cmp-side"><figure class="fig" id="liveFigSk">${cs}${fitHtml(ku, noKit, pg)}</figure><figure class="fig">${cd}${pg.raw && du ? `<div class="lv-fit raw"><img src="${esc(du)}" alt="" draggable="false"></div>` : fitHtml(du, noDesk, pg)}</figure></div>`;
      tools.innerHTML = `<span>${esc(pg.raw ? t('live.res.rawTip') : t('live.res.sideTip'))}</span>`;
    } else {
      c.innerHTML = `<div class="stack ${mode === 'diff' ? 'diff' : ''}" id="liveStack" style="--arw:${pg.w};--arh:${pg.h}">${fitHtml(ku, t('live.res.noKitchen'), pg)}<div class="top" id="liveTop">${fitHtml(du, t('live.res.noDesktop'), pg)}</div>
        ${mode === 'slider' ? `${cs}<span class="lv-corner dt r">${esc(t('live.res.desktop'))}${pg.time ? ' · ' + esc(pg.time) : ''}</span><div class="handle" id="liveHandle"><span>⇔</span></div>` : ''}
        ${mode === 'fade' || mode === 'diff' ? `${cs}<span class="lv-corner dt r">${esc(t('live.res.desktop'))}${pg.time ? ' · ' + esc(pg.time) : ''}</span>` : ''}
        ${mode === 'blink' ? `<span class="blinkcap" id="liveBlinkCap">${esc(t('live.res.sketch'))}</span>` : ''}</div>`;
      tools.innerHTML = mode === 'slider' ? `<span>${esc(t('live.res.sliderTip'))}</span>` : mode === 'fade' ? `<span>${esc(t('live.res.sketch'))}</span><input type="range" min="0" max="100" value="${res.fade}" id="liveFadeR" aria-label="${esc(t('live.res.fade'))}"><span>${esc(t('live.res.desktop'))}</span>` : mode === 'diff' ? `<span>${esc(t('live.res.diffTip'))}</span>` : `<span>${esc(t('live.res.blinkTip'))}</span>`;
      applyCmp();
    }
    requestAnimationFrame(() => {
      const side = $('#liveCmp .cmp-side'); if (!side) return;
      const w = c.clientWidth, h = c.clientHeight, sideW = (w - 14) / 2, stackW = Math.min(w, (h - 14) / 2 * pg.w / pg.h);
      if (stackW > sideW * 1.08) { side.style.gridTemplateColumns = '1fr'; side.style.width = stackW + 'px'; }
    });
  }
  function applyCmp() {
    const top = $('#liveTop'); if (!top) return;
    const mode = res.blink ? 'blink' : res.mode;
    top.style.clipPath = mode === 'slider' ? `inset(0 0 0 ${res.split}%)` : '';
    top.style.opacity = mode === 'fade' ? res.fade / 100 : (mode === 'blink' ? (res.blinkOn ? 1 : 0) : 1);
    const h = $('#liveHandle'); if (h) h.style.left = res.split + '%';
  }
  function blinkStart() {
    if (res.blink || !res.open) return;
    res.blink = true; res.blinkOn = false; renderCmp();
    res.blinkIv = setInterval(() => { res.blinkOn = !res.blinkOn; applyCmp(); const c = $('#liveBlinkCap'); if (c) c.textContent = res.blinkOn ? t('live.res.desktop') : t('live.res.sketch'); }, RM ? 900 : 380);
  }
  function blinkStop(silent) { if (!res.blink) return; clearInterval(res.blinkIv); res.blink = false; if (!silent) renderCmp(); }
  function loupeAt(e) {
    const l = $('#liveLoupe'); if (!l) return;
    if (!e.altKey || !res.open) { l.hidden = true; return; }
    const host = e.target.closest('#liveFigSk .lv-fit, #liveStack .lv-fit'); const du = res.urls['d:' + res.page];
    if (!host || !du) { l.hidden = true; return; }
    const r = host.getBoundingClientRect(); const pg = res.pages[res.page] || { w: 1920, h: 1080 }; const s = r.width / pg.w;
    const px = (e.clientX - r.left) / s, py = (e.clientY - r.top) / s; const z = s * 1.6;
    l.hidden = false; l.style.left = (e.clientX - 95) + 'px'; l.style.top = (e.clientY - 95) + 'px';
    l.style.backgroundImage = `url(${du})`; l.style.backgroundSize = `${pg.w * z}px ${pg.h * z}px`; l.style.backgroundPosition = `${95 - px * z}px ${95 - py * z}px`;
    if (!l.firstChild) l.innerHTML = `<b>${esc(t('live.res.desktop'))}</b>`;
  }
  function rerow(id) { const r = $(`#liveResult .lv-trow[data-tid="${CSS.escape(id)}"]`); if (!r) return; const x = tilesOnPage(res.page).find(y => y.id === id); if (!x) return; const n = res.page; const pg = res.pages[n] || { w: MK().state.canvas.w, h: MK().state.canvas.h }; const vis = status && status.visuals && statusHas(res.seq) ? status.visuals : {}; const d = document.createElement('div'); d.innerHTML = rowHtml(x, vis, res.urls['k:' + n], pg.raw ? null : res.urls['d:' + n], pg); r.replaceWith(d.firstElementChild); }
  function rowState(id, patch) { const k = res.seq + ':' + id; dep.rows[k] = Object.assign({}, dep.rows[k] || {}, patch); saveDep(); bump(); rerow(id); }

  // ------------------------------------------------------------------ Protokoll (alter Statusdialog, Werkstatt)
  function kv(k, v) { return `<span class="k">${esc(k)}</span><span>${v}</span>`; }
  function tag(state) { const s = state === 'ok' ? 'applied' : state; const cls = { applied: 'ok', skipped: 'mute', warn: 'warn', error: 'bad', running: 'run', pending: 'run', awaiting: 'warn', blocked: 'warn', failed: 'bad', idle: 'mute', inactive: 'mute', planned: 'mute', cancelled: 'mute' }[s] || 'mute'; return `<span class="lv-tag lv-${cls}">${esc(has('live.state.' + state) ? t('live.state.' + state) : state)}</span>`; }
  function renderDialog() {
    const body = $('#dlgLiveBody'); if (!body) return;
    $('#dlgLiveP').textContent = proj ? (projectPath() || proj.path) : '';
    if (!proj) { body.innerHTML = `<p class="hint">${esc(t('live.chip.off'))}</p>`; return; }
    const st = depState(); const s = status || {};
    const hb = heartbeat(); const d = s.desktop || null;
    let h = '<div class="kv lv-kv">';
    h += kv(t('live.dlg.project'), esc(proj.name));
    h += kv(t('live.dlg.parts'), esc([proj.report ? proj.report.name : t('live.dlg.noReport'), proj.model ? proj.model.name : t('live.dlg.noModel')].join(' · ')));
    if (session) h += kv(t('live.dlg.session'), `<span class="mono">${esc([session.sessionId, session.pid ? 'pid ' + session.pid : '', session.projectPath].filter(Boolean).join(' · '))}</span>`);
    h += kv(t('live.dlg.spec'), esc(lastWriteAt ? t('live.dlg.specAt', { time: hhmmss(lastWriteAt) }) : t('live.dlg.specNone')));
    h += kv(t('live.dlg.agent'), alive() ? esc(t('live.dlg.agentOn', { time: hhmmss(hb), v: (s.runner && s.runner.version) || '?' })) : `<span class="lv-warnTxt">${esc(t('live.tipInactive'))}</span>`);
    h += kv(t('live.dlg.deploy'), dep.seq || s.seq ? `${esc(String(Math.max(dep.seq || 0, +s.seq || 0)))} ${tag(st.s === 'running' ? 'running' : (s.state || 'idle'))}${s.finishedAt ? ' <span class="hint">' + esc(hhmmss(s.finishedAt)) + '</span>' : ''}` : esc(t('live.dlg.none')));
    if (s.message) h += kv(t('live.dlg.message'), esc(s.message));
    if (d) h += kv(t('live.dlg.desktop'), esc([d.connected ? t('live.dlg.desktopOn') : t('live.dlg.desktopOff'), d.hasUnsavedChanges ? t('live.dlg.unsaved') : '', d.reloaded ? t('live.dlg.reloaded') : ''].filter(Boolean).join(' · ')));
    h += '</div>';
    const steps = Array.isArray(s.steps) ? s.steps : [];
    if (steps.length) {
      h += `<h3 class="lv-h">${esc(t('live.dlg.steps'))}</h3><ul class="lv-list">`;
      steps.forEach(x => { const lbl = x && x.id && has('live.step.' + x.id) ? t('live.step.' + x.id) : ((x && x.id) || ''); h += `<li>${tag((x && x.state) || 'ok')}<span><b>${esc(lbl)}</b>${x && x.msg ? ' <span class="hint">' + esc(x.msg) + '</span>' : ''}</span></li>`; });
      h += '</ul>';
    }
    const cmpHtml = compareHtml();
    h += cmpHtml;
    const dlg = $('#dlgLive'); if (dlg) dlg.classList.toggle('lv-wide', !!cmpHtml);
    const todos = Array.isArray(s.todos) ? s.todos : [];
    h += `<h3 class="lv-h">${esc(t('live.dlg.todos'))}</h3>`;
    if (!todos.length) h += `<p class="hint">${esc(t('live.dlg.noTodos'))}</p>`;
    else {
      const kinds = ['model', 'theme', 'manual', 'removed']; const other = todos.filter(x => !kinds.includes(x && x.kind));
      kinds.concat(other.length ? ['other'] : []).forEach(k => {
        const list = k === 'other' ? other : todos.filter(x => x && x.kind === k); if (!list.length) return;
        h += `<h4 class="lv-h4">${esc(t('live.kind.' + k))} <span class="pill">${list.length}</span></h4><ul class="lv-list">`;
        list.forEach(x => { h += `<li><span>${x.ref ? '<span class="mono">' + esc(x.ref) + '</span> ' : ''}${esc(x.text || '')}</span></li>`; });
        h += '</ul>';
      });
    }
    const hs = Array.isArray(s.history) ? s.history : [];
    if (hs.length) h += `<h3 class="lv-h">${esc(t('live.dlg.history'))}</h3><ul class="lv-list">` + hs.slice().reverse().map(x => `<li>${tag(x.state || 'applied')}<span><b>${esc(bon(x.seq))}</b> <span class="hint">${esc(hhmmss(x.at))}${x.ms ? ' · ' + esc(fmtS(x.ms)) : ''}${x.message ? ' · ' + esc(x.message) : ''}</span></span></li>`).join('') + '</ul>';
    body.innerHTML = h;
  }
  const cmp = { key: '', loading: false, seq: 0, tiles: null, urls: {} };
  function cmpSeq() { return resSeqOf() || dep.real || 0; }
  function cmpKey() { const seq = cmpSeq(); return seq ? seq + '|' + ((status && status.finishedAt) || '') + '|' + fnv(statusRaw || '') : ''; }
  async function loadCompare() {
    const key = cmpKey(); if (!proj || !key || key === cmp.key || cmp.loading) return;
    cmp.loading = true; const seq = cmpSeq(); const urls = {}; let tj = null;
    try {
      tj = await readJsonAt('kitchen/' + seq + '/tiles.json');
      const want = [];
      ((tj && tj.pages) || []).forEach(p => { if (p && p.name != null) want.push(['k:' + nfc(p.name), p.png || ('kitchen/' + seq + '/' + p.file)]); });
      const pages = status && status.pages && typeof status.pages === 'object' && statusHas(seq) ? status.pages : {};
      Object.keys(pages).forEach(n => { const e = pages[n]; if (e && (e.shotPage || e.shot)) want.push(['d:' + nfc(n), String(e.shotPage || e.shot)]); });
      for (const [k, path] of want) { try { urls[k] = URL.createObjectURL(await fileAt(path)); } catch (e) { if (isPerm(e)) { lose(); return; } } }
      Object.values(cmp.urls).forEach(u => URL.revokeObjectURL(u));
      cmp.urls = urls; cmp.tiles = tj; cmp.seq = seq; cmp.key = key;
    } finally { cmp.loading = false; }
    refreshDialog();
  }
  function scoreTxt(sc) { const v = +sc; if (sc == null || !isFinite(v)) return null; const pct = v <= 1 ? v * 100 : v; return { txt: Math.round(pct) + ' %', cls: pct >= 90 ? 'ok' : pct >= 70 ? 'warn' : 'bad' }; }
  function compareHtml() {
    if (!proj || !MK()) return '';
    if (cmp.key !== cmpKey()) loadCompare();
    const seq = cmp.seq; if (!seq) return '';
    const vis = status && status.visuals && typeof status.visuals === 'object' && statusHas(seq) ? status.visuals : {};
    const tj = cmp.tiles || {}; const S = MK().state;
    const names = S.pages.map(p => p.name); ((tj.pages) || []).forEach(p => { if (p && !names.includes(p.name)) names.push(p.name); });
    const rows = names.map(name => {
      const nk = nfc(name); const ku = cmp.urls['k:' + nk], du = cmp.urls['d:' + nk];
      const ids = []; const label = {};
      Object.keys(tj.tiles || {}).forEach(id => { const x = tj.tiles[id]; if (x && nfc(x.page) === nk) { ids.push(id); label[id] = x.displayName || x.title || x.kind || id; } });
      const pg = S.pages.find(p => nfc(p.name) === nk);
      if (pg) MK().computeAll(pg).leaves.forEach(l => { const v = l.node.visual; if (!v || ids.includes(l.node.id)) return; ids.push(l.node.id); label[l.node.id] = v.title || ((MK().catalog.byId[v.kind] || {}).label) || v.kind; });
      const finds = ids.map(id => { const x = vis[id] || vis['mk_' + id]; return x && x.diff && typeof x.diff === 'object' ? { id, x: x.diff } : null; }).filter(Boolean);
      if (!ku && !du && !finds.length) return '';
      const fig = (url, cap, none, alt) => `<figure class="lv-fig"><figcaption>${esc(cap)}</figcaption>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" title="${esc(t('live.dlg.openImg', { name: alt }))}"><img src="${esc(url)}" alt="${esc(cap + ': ' + name)}"></a>` : `<p class="hint">${esc(none)}</p>`}</figure>`;
      let r = `<div class="lv-cmp-page"><h4 class="lv-h4">${esc(name)}</h4><div class="lv-cmp-imgs">`;
      r += fig(ku, t('live.dlg.kitchenImg', { n: seq }), t('live.dlg.noKitchen'), name) + fig(du, t('live.dlg.desktopImg'), t('live.dlg.noDesktop'), name) + '</div>';
      r += `<h5 class="lv-h5">${esc(t('live.dlg.findings'))}</h5>`;
      if (!finds.length) r += `<p class="hint">${esc(t('live.dlg.noFindings'))}</p>`;
      else {
        r += '<ul class="lv-list lv-find">';
        finds.forEach(f => {
          const sc = scoreTxt(f.x.score); const vd = verdictOf(f.x); const notes = vd.notes;
          r += `<li data-lv-tile="${esc(f.id)}">${sc ? `<span class="lv-tag lv-${sc.cls}" title="${esc(t('live.dlg.score', { s: sc.txt }))}"><span class="ws">${esc(sc.txt)}</span><span class="mod">${esc(vd.k === 'ok' || vd.k === 'data' ? '✓' : '!')}</span></span>` : ''}<span><b>${esc(label[f.id] || f.id)}</b> <span class="hint">${esc(vd.txt)}</span>${notes.length ? '<ul class="lv-notes">' + notes.map(n => `<li>${esc(n)}</li>`).join('') + '</ul>' : ''}</span></li>`;
        });
        r += '</ul>';
      }
      return r + '</div>';
    }).filter(Boolean);
    return rows.length ? `<h3 class="lv-h">${esc(t('live.dlg.compare'))}</h3><div class="lv-cmp">${rows.join('')}</div>` : '';
  }
  function refreshDialog() { const dlg = $('#dlgLive'); if (dlg && dlg.open) renderDialog(); }
  function openDialog() { const dlg = $('#dlgLive'); if (!dlg) return; closeMenus(); renderDialog(); if (!dlg.open) dlg.showModal(); }

  // ------------------------------------------------------------------ Oberfläche zusammenziehen
  function updateUi() {
    const bC = $('#btnLiveConnect'), bR = $('#btnLiveReconnect'), wrap = $('#liveConnectWrap');
    if (!bC) return;
    if (!SUPPORTED) {
      bC.disabled = true; bC.setAttribute('data-i18n-title', 'live.unsupported'); bC.title = t('live.unsupported'); if (wrap) wrap.title = t('live.unsupported');
      bR.hidden = true; const w = $('#liveDepWrap'); if (w) w.hidden = true; updateShotUi(); return;
    }
    bC.hidden = !!proj || !!stored;
    bR.hidden = !!proj || !stored;
    if (wrap) wrap.hidden = bC.hidden;
    if (stored) { const txt = t('live.reconnect', { name: stored.name }); $('.lv-txt', bR).textContent = txt; bR.title = txt + ' · ' + t('live.reconnectTip'); bR.setAttribute('aria-label', txt); }
    renderDep();
    // Verbunden: Deploy ist die Hauptaktion, der Export tritt zurück (kurz und ohne Akzent, Strg+E bleibt)
    const ex = $('#btnExport');
    if (ex && ex.classList.contains('accent') === !!proj) {
      ex.classList.toggle('accent', !proj); ex.setAttribute('data-i18n', proj ? 'live.export' : 'btn.export'); ex.textContent = t(proj ? 'live.export' : 'btn.export');
      if (proj) ex.title = t('btn.export'); else ex.removeAttribute('title');
    } else if (ex && proj) { ex.textContent = t('live.export'); ex.title = t('btn.export'); }
    updateShotUi();
  }
  function renderAll() { updateUi(); renderBand(); renderLiveTab(); checkAwaiting(); decorate(); if (res.open && res.key !== resKey(res.seq) && status && (+status.seq || 0) === res.seq) loadResult(res.seq); startTick(); }
  // Laufender Deploy: Zeiten jede 250 ms nachziehen (Knopf, Stepper, Pausenkarte, Tab)
  function startTick() {
    const need = proj && (busy() || (appliedAt && Date.now() - appliedAt < APPLIED_MS));
    if (need && !tickT) tickT = setInterval(() => { if (!proj) return; renderDep(); renderBand(); if (liveTabVisible()) renderLiveTab(); if (!busy() && !(appliedAt && Date.now() - appliedAt < APPLIED_MS)) { clearInterval(tickT); tickT = null; } }, 250);
  }

  // ------------------------------------------------------------------ Aktionen (Klicks mit data-lv)
  const ACT = {
    goReady: () => goTab('liveSecReady'), goApprovals: () => goTab('liveSecFg'), goHist: () => { closeMenus(); goTab('liveSecHist'); }, goTiles: () => goTab('liveSecReady'),
    tlDot: () => goTab('liveSecHist'),
    openResult: a => openResult(a && a.dataset.seq), closeResult: () => closeResult(),
    protocol: () => openDialog(), disconnect: () => { closeMenus(); disconnect(); },
    rowClose: a => { dismissed[a.dataset.key] = true; if (a.dataset.key === 'prepare') dismissed.prepare = true; renderBand(); },
    retry: () => deploy({ scope: 'all' }), confirm: a => onConfirmClick(a.dataset.arg), answerAgain: () => { confirmed = null; openAwait(); }, openAwait: () => openAwait(),
    openPrep: () => openPrep(), prepGo: () => { const d = $('#dlgLivePrep'); if (d.open) d.close(); dismissed.prepare = true; deploy({ prepare: true }); },
    prepDone: () => { dep.prepDone = status ? (+status.seq || 0) : dep.seq; saveDep(); renderBand(); renderLiveTab(); },
    dlgClose: a => { const d = a.closest('dialog'); if (d) d.close(); },
    depMenu: () => { const m = $('#liveDepMenu'); if (!m.hidden) return closeMenus(); closeMenus(); openDepMenu(); },
    moreMenu: () => { const m = $('#liveMoreMenu'); if (!m.hidden) return closeMenus(); closeMenus(); openMoreMenu(); },
    setMode: a => { setMode(a.dataset.arg); closeMenus(); },
    menuDeploy: a => { closeMenus(); preview(a.dataset.arg); }, preview: () => preview('all'), measure: () => { closeMenus(); closePreview(); measure(); }, transfer: () => transfer(),
    histBack: a => { dep.histConfirm = +a.dataset.seq; renderLiveTab(); }, histCancel: () => { dep.histConfirm = null; renderLiveTab(); },
    histGo: a => { const n = +a.dataset.seq; dep.histConfirm = null; deploy({ restore: { fromBackup: n } }); },
    fgApprove: a => approve(a.dataset.id), fgReject: a => reject(a.dataset.id),
    resPage: a => showResultPage(nfc(a.dataset.page)), resMode: a => { res.mode = a.dataset.mode; blinkStop(true); renderResult(); },
    rowOk: a => rowState(a.closest('.lv-trow').dataset.tid, { ok: true, at: isoLocal(new Date()) }),
    rowNote: a => { const id = a.closest('.lv-trow').dataset.tid; rowState(id, { noteOpen: true }); const ta = $(`#liveResult .lv-trow[data-tid="${CSS.escape(id)}"] textarea`); if (ta) ta.focus(); },
    rowNoteCancel: a => rowState(a.closest('.lv-trow').dataset.tid, { noteOpen: false }),
    rowNoteSave: a => { const r = a.closest('.lv-trow'); rowState(r.dataset.tid, { note: r.querySelector('textarea').value.trim(), noteOpen: false }); },
    rowShow: a => { const id = a.closest('.lv-trow').dataset.tid; const pg = MK().state.pages.find(p => nfc(p.name) === res.page); closeResult(); if (pg && MK().state.cur !== pg.id) { const S = MK().state; S.cur = pg.id; MK().state = S; } setTimeout(() => { const tl = $(`#page .tile[data-leaf="${CSS.escape(id)}"]`); if (tl) { tl.classList.add('lv-flash'); tl.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }); setTimeout(() => tl.classList.remove('lv-flash'), 1500); } }, 80); },
    accept: () => { const n = res.page; dep.seals[n] = { at: isoLocal(new Date()), seq: res.seq }; saveDep(); toast(t('live.toast.sealed')); renderResult(); decoratePages(); },
  };

  // ------------------------------------------------------------------ Verdrahtung
  function wire() {
    const bC = $('#btnLiveConnect'); if (!bC) return;
    gate();
    bC.addEventListener('click', connect);
    $('#btnLiveReconnect').addEventListener('click', reconnect);
    $('#btnDeploy').addEventListener('click', mainClick);
    const more = $('#btnDeployMore'); if (more) more.addEventListener('click', e => { e.stopPropagation(); ACT.depMenu(); });
    const bm = $('#btnMore'); if (bm) bm.addEventListener('click', e => { e.stopPropagation(); ACT.moreMenu(); });
    const bd = $('#btnLiveDisconnect'); if (bd) bd.addEventListener('click', disconnect);
    $('#btnLiveShot').addEventListener('click', () => { shot.on = !(shot.on && shot.url) && !!shot.url; updateShotUi(); decorate(); });
    $('#liveShotOpacity').addEventListener('input', e => { shot.opacity = Math.max(0.1, Math.min(1, (+e.target.value || 50) / 100)); const img = $('#page .lv-shot'); if (img) img.style.opacity = shot.opacity; });
    document.addEventListener('click', e => {
      const a = e.target.closest('[data-lv]');
      if (!e.target.closest('.lv-menu') && !e.target.closest('#btnDeployMore') && !e.target.closest('#btnMore')) closeMenus();
      if (plan && !e.target.closest('#livePreview') && !e.target.closest('#liveDep')) closePreview();
      if (!a || a.disabled) return;
      const f = ACT[a.dataset.lv]; if (f) { e.preventDefault(); f(a, e); }
    });
    document.addEventListener('change', e => { if (e.target.id === 'livePvSkip') ls.set(LS_SKIP, e.target.checked ? '1' : null); });
    document.addEventListener('input', e => { if (e.target.id === 'liveFadeR') { res.fade = +e.target.value; applyCmp(); } });
    // Schieber-Griff ziehen, Lupe mit Alt
    let drag = null;
    document.addEventListener('pointerdown', e => { const h = e.target.closest('#liveHandle'); if (!h) return; drag = { el: h, box: h.parentElement.getBoundingClientRect() }; try { h.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } e.preventDefault(); });
    document.addEventListener('pointermove', e => { if (drag) { res.split = Math.max(0, Math.min(100, (e.clientX - drag.box.left) / drag.box.width * 100)); applyCmp(); } if (res.open) loupeAt(e); });
    document.addEventListener('pointerup', () => { drag = null; });
    document.addEventListener('keyup', e => { if (e.key === 'Alt' && res.open) { e.preventDefault(); const l = $('#liveLoupe'); if (l) l.hidden = true; } if (e.key === ' ' && res.blink) { e.preventDefault(); blinkStop(); } });
    document.addEventListener('keydown', e => {
      if (!enabled) return;
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.target.type !== 'range';
      if (e.key === 'Alt' && res.open) { e.preventDefault(); return; }
      if (e.key === 'Escape') {
        if (!$('#liveDepMenu').hidden || !$('#liveMoreMenu').hidden) { closeMenus(); e.stopPropagation(); return; }
        if (plan) { closePreview(); e.stopPropagation(); return; }
        if (res.open) { closeResult(); e.stopPropagation(); return; }
        if (proj && depState().s === 'pending' && !inField) { cancelPending(); e.stopPropagation(); return; }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && proj) {
        e.preventDefault(); e.stopPropagation();
        if (e.shiftKey) { closePreview(); deploy({ scope: 'all' }); return; }
        if (plan) { const b = $('#livePvGo'); if (b) b.click(); else { const m = $('#livePreview [data-lv=measure]'); if (m) m.click(); } return; }
        mainClick(); return;
      }
      if (plan && e.key === 'Enter' && !inField) { e.preventDefault(); const b = $('#livePvGo'); if (b) b.click(); return; }
      if (inField || e.ctrlKey || e.metaKey || e.altKey) return;
      if (res.open) {
        if (e.key === ' ') { e.preventDefault(); if (!e.repeat) blinkStart(); return; }
        if (e.key === '[' || e.key === ']') { if (res.mode === 'slider') res.split = Math.max(0, Math.min(100, res.split + (e.key === ']' ? 5 : -5))); else if (res.mode === 'fade') { res.fade = Math.max(0, Math.min(100, res.fade + (e.key === ']' ? 10 : -10))); const r = $('#liveFadeR'); if (r) r.value = res.fade; } applyCmp(); return; }
      }
      if (document.querySelector('dialog[open]') || !proj) return;
      const k = e.key.toLowerCase();
      if (k === 'l') { const tab = $('#tabLive'); if (tab) tab.click(); }
      else if (k === 'd' && !e.shiftKey) { if (shot.url) $('#btnLiveShot').click(); }
      else if (k === 'r') { if (!busy() && !deploying) measure(); }
    });
    window.addEventListener('mk:changed', () => { bump(); if (proj) { schedule(); renderDep(); if (liveTabVisible()) renderLiveTab(); } });
    window.addEventListener('mk:rendered', () => {
      if (proj && shotKey() !== shot.key) { dropShot(); updateShotUi(); decorate(); loadShot().then(decorate); }
      else decorate();
      if (proj) renderBand();
    });
    window.addEventListener('mk:tab', e => { if (e.detail === 'live') renderLiveTab(); });
    window.addEventListener('resize', () => { if (res.open) renderCmp(); });
    // Kennzahlen-Steckbrief: Freigaben zum Feld, sobald der Dialog offen ist
    const fm = $('#dlgFieldMeta'); if (fm && window.MutationObserver) new MutationObserver(() => { if (fm.open) renderFmLive(); }).observe(fm, { attributes: true, attributeFilter: ['open'] });
    I18N.onChange(() => { gate(); renderAll(); refreshDialog(); if (res.open) renderResult(); });
    renderAll();
    if (SUPPORTED && window.indexedDB) {
      idbGet().then(rec => { if (rec && rec.handle && !proj) { stored = { handle: rec.handle, name: rec.name || rec.handle.name }; updateUi(); } }).catch(() => { /* IndexedDB blockiert: kein Wieder-verbinden */ });
    }
  }

  window.MK_LIVE = {
    get supported() { return SUPPORTED; }, get enabled() { return enabled; },
    connect, reconnect, deploy, preview, measure, disconnect, poll, findProjects, openResult, closeResult, openProtocol: openDialog, setMode, approve,
    confirm: confirmAction, cancelPending,
    writeNow() { return enqueue(true); },
    compareDone() { return compareP; },
    info() { return { supported: SUPPORTED, enabled, connected: !!proj, name: proj ? proj.name : null, stored: stored ? stored.name : null, dep: depState(), chip: depState(), seq: dep.seq, real: dep.real, status, session, doctor, approvals, lastWriteAt, mismatch: mismatch(), changes: proj ? changes() : null, readiness: proj ? readyCount() : null, mode: wsMode() ? 'ws' : 'mod', plan, result: { open: res.open, seq: res.seq, page: res.page, mode: res.mode, raw: !!(res.pages[res.page] && res.pages[res.page].raw) }, seals: dep.seals, shot: { on: shot.on, available: !!shot.url, opacity: shot.opacity }, restored: restoredNote, resSeq: resSeqOf(), rev }; },
    verdictOf, isoLocal, bon,
    // für Tests und Werkzeuge: Freigabe-Hash, Spec → Kitchen-Stand, Stand eines Deploys laden, Stand einer Freigabe
    hashFor, canonJson, stateFromSpec, restoreSketch: loadRestored, approvalState: id => { const x = approvalTodos().find(y => y.id === id); return x ? approvalState(x) : null; },
  };
  wire();
})();
