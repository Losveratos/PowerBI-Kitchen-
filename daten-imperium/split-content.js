/* Daten-Imperium · Inhalte teilen und bewerten
   Teilt die vollständigen Inhalte (content.js) in eine öffentliche Fassung ohne Lösungen
   und einen Lösungsschlüssel. Dazu die Bewertungslogik, die mit dem Schlüssel arbeitet.

   - Kitchen-Seite: läuft im Browser, teilt beim Start und bewertet lokal.
   - Fabric App:    der Browser bekommt nur die öffentliche Fassung (build-public-content.js),
                    bewertet wird in der Function `grade` mit demselben Schlüssel.

   Antwortreihenfolgen werden pro Aufgabe fest gemischt (Startwert = ID), damit die
   öffentliche Fassung und der Schlüssel immer zusammenpassen. */
(function (root) {
  'use strict';

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seeded(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /** Liefert eine fest gemischte Indexfolge 0..n-1 für die Aufgabe `id`. */
  function perm(n, id) {
    const r = seeded(hash(id)), p = [];
    for (let i = 0; i < n; i++) p.push(i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    return p;
  }
  /** Mischt `arr` fest; liefert neue Liste und wohin der alte Index `k` gewandert ist. */
  function mix(arr, id) {
    const p = perm(arr.length, id);            // p[neu] = alt
    const out = p.map(function (i) { return arr[i]; });
    const where = function (alt) { return p.indexOf(alt); };
    return { out: out, where: where };
  }

  /** Teilt die Inhalte. `C` enthält QUIZ, STAR, ORDER, FILL, PQDEBUG, DIALOGS. */
  function split(C) {
    const pub = {}, key = { quiz: {}, fill: {}, pq: {}, star: {}, order: {}, dialog: {} };

    pub.QUIZ = C.QUIZ.map(function (q) {
      const m = mix(q.o, q.id);
      key.quiz[q.id] = { a: m.where(q.a), x: q.x, d: q.d, c: q.c };
      const p = { id: q.id, c: q.c, d: q.d, q: q.q, o: m.out };
      if (q.code) p.code = q.code;
      if (q.log) p.log = q.log;
      if (q.inc) p.inc = true;
      return p;
    });

    pub.ORDER = C.ORDER.map(function (o) {
      const m = mix(o.steps, o.id);
      key.order[o.id] = { order: o.steps.map(function (_, alt) { return m.where(alt); }), x: o.x, d: 2, c: o.c };
      return { id: o.id, c: o.c, title: o.title, steps: m.out };
    });

    pub.STAR = C.STAR.map(function (s) {
      key.star[s.id] = { tables: s.tables.map(function (t) { return { role: t.role, key: t.key || '', into: t.into === undefined ? -1 : t.into }; }), d: 2, c: 'model' };
      return { id: s.id, title: s.title, tables: s.tables.map(function (t) { return { n: t.n, cols: t.cols, rows: t.rows }; }) };
    });

    pub.FILL = C.FILL.map(function (f) {
      const sol = [];
      const blanks = f.blanks.map(function (b, i) {
        const m = mix(b.o, f.id + '#' + i);
        sol.push(m.where(b.a));
        return { o: m.out };
      });
      key.fill[f.id] = { a: sol, x: f.x, d: f.d, c: 'dax' };
      return { id: f.id, d: f.d, title: f.title, code: f.code, blanks: blanks };
    });

    pub.PQDEBUG = C.PQDEBUG.map(function (p) {
      const m = mix(p.fix, p.id);
      key.pq[p.id] = { bad: p.bad, fix: m.where(p.a), x: p.x, d: p.d, c: 'pq' };
      return { id: p.id, d: p.d, title: p.title, err: p.err, steps: p.steps, fix: m.out };
    });

    pub.DIALOGS = C.DIALOGS.map(function (dl) {
      const ksteps = [];
      const steps = dl.steps.map(function (st, i) {
        const m = mix(st.a, dl.id + '#' + i);
        const answers = m.out.map(function (a) { return { s: a.s, f: a.f }; });
        let best = 0;
        answers.forEach(function (a, k) { if (a.s > answers[best].s) best = k; });
        ksteps.push({ a: answers, best: best });
        return { say: st.say, a: m.out.map(function (a) { return { t: a.t }; }) };
      });
      key.dialog[dl.id] = { steps: ksteps, d: 1, c: 'talk' };
      return { id: dl.id, who: dl.who, av: dl.av, steps: steps };
    });

    return { pub: pub, key: key };
  }

  /* ---------- Bewertung ----------
     Alle Antworten sind Indizes in die öffentliche Fassung. Rückgabe enthält immer
     `score` (0..1), die Lösung und die Erklärung `x` für die Lernkarte. */
  function ensure(entry, kind, id) {
    if (!entry) throw new Error('Unbekannte Aufgabe: ' + kind + ' ' + id);
    return entry;
  }
  function grade(key, kind, a) {
    if (kind === 'quiz') {
      const k = ensure(key.quiz[a.id], kind, a.id);
      const ok = a.choice === k.a;
      return { score: ok ? 1 : 0, ok: ok, a: k.a, x: k.x };
    }
    if (kind === 'joker') {
      const k = ensure(key.quiz[a.id], kind, a.id);
      const wrong = [];
      for (let i = 0; i < a.n; i++) if (i !== k.a) wrong.push(i);
      const p = perm(wrong.length, a.id + '#joker');
      return { remove: [wrong[p[0]], wrong[p[1]]].filter(function (v) { return v !== undefined; }) };
    }
    if (kind === 'fill') {
      const k = ensure(key.fill[a.id], kind, a.id);
      const ok = k.a.map(function (v, i) { return a.picks[i] === v; });
      const n = ok.filter(Boolean).length;
      return { score: n / k.a.length, ok: ok, sol: k.a, x: k.x };
    }
    if (kind === 'pqStep') {
      const k = ensure(key.pq[a.id], kind, a.id);
      return { ok: a.step === k.bad, bad: k.bad };
    }
    if (kind === 'pq') {
      const k = ensure(key.pq[a.id], kind, a.id);
      const stepOk = a.step === k.bad, fixOk = a.fix === k.fix;
      return { score: (stepOk ? 0.5 : 0) + (fixOk ? 0.5 : 0), stepOk: stepOk, fixOk: fixOk, bad: k.bad, fix: k.fix, x: k.x };
    }
    if (kind === 'star') {
      const k = ensure(key.star[a.id], kind, a.id);
      let pts = 0;
      const per = k.tables.map(function (t, i) {
        const s = a.picks[i] || {};
        let p = 0;
        if (t.role === 'fact') p = s.role === 'fact' ? 1 : 0;
        else if (t.role === 'dim') p = (s.role === 'dim' ? 0.5 : 0) + (s.role === 'dim' && s.key === t.key ? 0.5 : 0);
        else p = (s.role === 'fold' ? 0.5 : 0) + (s.role === 'fold' && Number(s.into) === t.into ? 0.5 : 0);
        pts += p;
        return { p: p, role: t.role, key: t.key, into: t.into };
      });
      return { score: pts / k.tables.length, per: per };
    }
    if (kind === 'order') {
      const k = ensure(key.order[a.id], kind, a.id);
      const ok = k.order.map(function (v, i) { return a.seq[i] === v; });
      return { score: ok.filter(Boolean).length / k.order.length, ok: ok, order: k.order, x: k.x };
    }
    if (kind === 'dialog') {
      const k = ensure(key.dialog[a.id], kind, a.id);
      const st = k.steps[a.step];
      if (!st) throw new Error('Unbekannter Gesprächsschritt');
      const ans = st.a[a.choice] || { s: 0, f: '' };
      return { score: ans.s, s: ans.s, f: ans.f, best: st.best, last: a.step === k.steps.length - 1 };
    }
    throw new Error('Unbekannte Prüfart: ' + kind);
  }

  /** Punkte für die Rangliste: nur volle Lösung zählt, gewichtet nach Schwierigkeit. */
  function points(key, kind, id) {
    const map = { quiz: 'quiz', fill: 'fill', pq: 'pq', star: 'star', order: 'order', dialog: 'dialog' };
    const k = key[map[kind]] && key[map[kind]][id];
    return k ? 10 * (k.d || 1) : 0;
  }

  const api = { split: split, grade: grade, points: points, perm: perm };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DI_SPLIT = api;
})(typeof window !== 'undefined' ? window : globalThis);
