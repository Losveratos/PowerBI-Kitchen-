/* Unabhaengige Verankerung des Rechenkerns — von Hand gerechnet, NICHT gemessen.
   ==========================================================================
   ACHTUNG, diese Suite ist anders als die sechs anderen.

   Jede andere Suite im Verzeichnis vergleicht den Rechner gegen Werte, die zuvor
   AUS DEM RECHNER ausgelesen wurden. Das faengt unbeabsichtigte Aenderungen, aber
   keinen systematischen Fehler: rechnet der Kern seit jeher falsch, sind alle
   Referenzen genauso falsch.

   Die Sollwerte hier sind NICHT aus dem Rechner gemessen. Sie stammen aus
   tests/rechner/handrechnung.md — einer Ableitung, die allein aus der
   Modellbeschreibung md/visual-standards-rechner.md entstanden ist, bevor die
   HTML-Datei geoeffnet wurde. Jeder Zwischenschritt steht dort mit Formel,
   eingesetzten Zahlen und Ergebnis und ist mit dem Taschenrechner nachvollziehbar.

   DESHALB WIEGT EIN FEHLSCHLAG HIER SCHWERER als in den anderen Suiten:
   Er heisst nicht „eine Zahl hat sich bewegt", sondern „der Rechenkern weicht von
   der dokumentierten Logik ab". Wer hier etwas rot sieht, aktualisiert NICHT die
   Zahl, sondern klaert zuerst, ob der Kern, die Beschreibung oder die Handrechnung
   falsch liegt — und schreibt das Ergebnis in handrechnung.md.

   Szenario (Begruendung in handrechnung.md, Abschnitt 1):
     1 Ersteller, 10 Viewer, 4 Standard-Reports, 3 Chart-Typen, Horizont 3 Jahre,
     Enterprise BI, kein Bestand, keine Red Flags, kein Angebot, Wachstum 0 %,
     IBCS-Pflicht an, Chart-Mix-Override 50/35/15 (Komplexitaetsfaktor exakt 1).
     Alle Annahmen auf ihrer Voreinstellung, Erwartungswert ueber expected().

   Start:  node tests/rechner/handrechnung.test.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus lib/harness.js. */
const { chromium, URL: U, skipWizard: skip, reporter } = require('./lib/harness');
const R = reporter('handrechnung');
const ok = R.ok;

/* Toleranz: 0,1 % relativ. Die Handrechnung trifft den Rechner auf den Cent; die
   Toleranz deckt nur Gleitkomma-Rundung und die zwei Nachkommastellen der Sollwerte
   ab. Sie ist bewusst eng — eine echte Aenderung am Rechenkern soll anschlagen. */
const TOL = 0.001;
const near = (ist, soll) => Math.abs(ist - soll) <= Math.max(0.01, Math.abs(soll) * TOL);
const eur = x => (Math.round(x * 100) / 100).toFixed(2);

/* ---- Sollwerte AUS DER HANDRECHNUNG (handrechnung.md, Abschnitt 11 und 12) ---- */
const HAND = {
  paid: {
    lic:   5615.73,   /* 20 Lizenzen x 85 EUR x (1,06^0+1,06^1+1,06^2) + Lizenz-Administration */
    build: 5661.55,   /* (46,3333 h Setup + 3 x 4,25 h) x 95,8232 EUR/h */
    rollout: 3120.95,
    train: 1877.86,
    maint: 2935.65,
    gov:   3462.13,
    risk:   365.32,
    total: 23039.19,
  },
  deneb: {
    lic:   1500.00,   /* keine Lizenz, aber Sponsoring 500 EUR/a x 3 Jahre */
    build: 5601.46,   /* (18,1667 h Setup + 3 x 12,1667 h) x 102,4657 EUR/h */
    rollout: 7583.28,
    train: 7129.73,
    maint: 8006.64,
    gov:   3851.60,
    risk:   687.58,
    total: 34360.28,
  },
};
/* Zwischengroessen, die allein aus der Modellbeschreibung herleitbar sind. */
const ZWISCHEN = {
  cprW: 6.7,          /* 0,45 x 8 + 0,35 x 6 + 0,20 x 5 */
  compMult: 1,        /* Chart-Mix 50/35/15 = Normierungsmischung cx0 */
  variantEff: 1,      /* Enterprise BI: Varianten-Faktor 1 */
  shCore: 0,          /* IBCS-Pflicht: keine Klasse laeuft ueber Core-Stunden */
  owners: 1,          /* Untergrenze: mindestens ein Vorlagen-Bauer */
  reportsTotal: 5.665,/* 4 Altbestand + 3 x (0,5333 + 2,1667 x 0,01) */
  licUnits: 20,       /* packU(10 x 100 % + 1) = packU(11) = 20 */
  licPrice: 5412.12,  /* reine Lizenzgebuehr ohne Administration */
  inflF: 3.1836,      /* 1,06^0 + 1,06^1 + 1,06^2 */
};

const SETUP = () => {
  S.creators = 1; S.viewers = 10; S.reports = 4; S.types = 3; S.horizon = 3;
  S.existing = 0; S.baseline = 'none'; S.ssShare = 0; S.mode = 'ent';
  S.ibcsAll = true; S.mixOv = [50, 35, 15]; S.g.growth = [0, 0, 0];
  S.lib = false; S.models = 1; S.viewerCap = 0; S.licModel = 'staffel';
  S.hAnchor = 'panel'; S.mUnc = 0; S.dist = 'none'; S.offers = []; S.offerOn = -1;
  Object.keys(S.flags).forEach(k => { S.flags[k] = false; });
  S.rc = { sh: [45, 35, 20], cpr: [8, 6, 5], mix: [[85, 15, 0], [40, 50, 10], [15, 45, 40]] };
  update();
};

(async () => {
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
R.watch(p);
await p.goto(U); await p.waitForTimeout(1000); await skip(p);
await p.evaluate(SETUP); await p.waitForTimeout(700);

/* ---------- 0) Das Szenario steht wirklich so im Rechner ---------- */
const st = await p.evaluate(() => ({
  creators: S.creators, viewers: S.viewers, reports: S.reports, types: S.types,
  horizon: S.horizon, ibcsAll: S.ibcsAll, mixOv: (S.mixOv || []).join('/'),
  ss: S.ssShare, base: S.baseline, existing: S.existing, growth: S.g.growth.join('/'),
  flags: Object.values(S.flags).filter(Boolean).length,
}));
ok('Szenario gesetzt: 1 Ersteller, 10 Viewer, 4 Reports, 3 Chart-Typen, 3 Jahre',
   st.creators === 1 && st.viewers === 10 && st.reports === 4 && st.types === 3 && st.horizon === 3,
   JSON.stringify(st));
ok('IBCS-Pflicht an, Chart-Mix-Override 50/35/15, Enterprise BI',
   st.ibcsAll === true && st.mixOv === '50/35/15' && st.ss === 0, st.mixOv + ' ss=' + st.ss);
ok('kein Bestand, kein Wechsel, kein Wachstum, keine Red Flags',
   st.existing === 0 && st.base === 'none' && st.growth === '0/0/0' && st.flags === 0,
   'flags=' + st.flags + ' growth=' + st.growth);

/* ---------- 1) Zwischengroessen der Handrechnung (Abschnitt 1 und 11) ---------- */
const z = await p.evaluate(() => {
  const e = expected('paid');
  return { cprW: e.cprW, compMult: e.compMult, variantEff: e.variantEff, shCore: e.shCore,
           owners: e.owners, reportsTotal: e.reportsTotal, licPrice: e.licPrice,
           inflF: e.inflF, licViewerShare: e.licViewerShare, rolloutYears: e.rolloutYears,
           rateInt: e.gd.rateInt, intFactor: e.gd.intFactor, lic: e.pd.lic, licInfl: e.pd.licInfl };
});
ok('Charts je Report = 6,7 (0,45x8 + 0,35x6 + 0,20x5)', near(z.cprW, ZWISCHEN.cprW), z.cprW);
ok('Komplexitaetsfaktor = 1 bei der Normierungsmischung 50/35/15', near(z.compMult, ZWISCHEN.compMult), z.compMult);
ok('Varianten-Effekt = 1 bei Enterprise BI', near(z.variantEff, ZWISCHEN.variantEff), z.variantEff);
ok('Kein ansatzunabhaengiger Anteil mit IBCS-Pflicht', z.shCore === ZWISCHEN.shCore, z.shCore);
ok('Lizenzbasis-Anteil zwingend 100 % mit IBCS-Pflicht (v0.18)', near(z.licViewerShare, 1), z.licViewerShare);
ok('Ein Vorlagen-Bauer (Untergrenze, nicht 1 x 10 %)', z.owners === ZWISCHEN.owners, z.owners);
ok('Rollout ueber 2 Jahre gestreckt', z.rolloutYears === 2, z.rolloutYears);
ok('Reports gesamt = 4 + 3 x 0,555 = 5,665', near(z.reportsTotal, ZWISCHEN.reportsTotal), z.reportsTotal);
ok('Erwartungswert ist das PERT-Mittel, nicht der Modus (Stundensatz 83, nicht 82)',
   near(z.rateInt, 83) && near(z.lic, 85) && near(z.licInfl, 6),
   'rateInt=' + z.rateInt + ' lic=' + z.lic + ' licInfl=' + z.licInfl);
ok('Bewertungsfaktor interner Stunden = 101,667 (PERT-Mittel von 60/100/150)',
   near(z.intFactor, 610 / 6), z.intFactor);

/* ---------- 2) Die Lizenz — der einzige Posten, der allein aus der Doku folgt ---------- */
ok('Lizenzmenge: packU(10 x 100 % + 1) = 20 Einheiten, Staffelfaktor 1,00',
   near(z.licPrice / (85 * ZWISCHEN.inflF), ZWISCHEN.licUnits),
   'abgeleitete Einheiten = ' + (z.licPrice / (85 * ZWISCHEN.inflF)).toFixed(4));
ok('Lizenzpreis-Index ueber 3 Jahre = 1,06^0 + 1,06^1 + 1,06^2 = 3,1836',
   near(z.inflF, ZWISCHEN.inflF), z.inflF);
ok('Lizenzgebuehr = 20 x 85 EUR x 3,1836 = 5.412,12 EUR (Handrechnung 11.1)',
   near(z.licPrice, ZWISCHEN.licPrice), eur(z.licPrice) + ' / ' + eur(ZWISCHEN.licPrice));

/* ---------- 3) Alle sieben Kostenposten gegen die Handrechnung ---------- */
const POSTEN = [
  ['lic',     'Lizenz'],
  ['build',   'Aufbau'],
  ['rollout', 'Rollout'],
  ['train',   'Schulung'],
  ['maint',   'Wartung'],
  ['gov',     'Governance und Support'],
  ['risk',    'Risiko'],
  ['total',   'SUMME'],
];
for (const key of ['paid', 'deneb']) {
  const e = await p.evaluate(k => {
    const x = expected(k); const o = {};
    ['lic', 'build', 'rollout', 'train', 'maint', 'gov', 'risk', 'total', 'switch'].forEach(f => { o[f] = x[f]; });
    return o;
  }, key);
  ok('[' + key + '] Migration = 0 (kein Bestand, kein Wechsel)', e.switch === 0, e.switch);
  for (const [f, label] of POSTEN) {
    const soll = HAND[key][f];
    ok('[' + key + '] ' + label + ' = ' + eur(soll) + ' EUR (Handrechnung)',
       near(e[f], soll), 'Rechner ' + eur(e[f]) + ' | Δ ' + eur(e[f] - soll));
  }
  /* Die Posten muessen die Summe ergeben — sonst faellt etwas zwischen die Kategorien. */
  const sum = POSTEN.slice(0, 7).reduce((a, [f]) => a + e[f], 0) + e.switch;
  ok('[' + key + '] die sieben Posten ergeben die Summe', near(sum, e.total),
     eur(sum) + ' / ' + eur(e.total));
}

/* ---------- 4) Benannte Abweichung: Zahlungsstrom ohne Konformitaetspruefung ----------
   Befund aus handrechnung.md, Abschnitt 13 (Kategorie 3, echter Fehler im Produkt):
   `cf` — und damit Barwert, Cash-out, Amortisation und das Kumulativ-Chart — enthaelt
   die Konformitaetspruefung nicht, obwohl sie in der Summe und im Posten „Governance
   und Support" steckt. Der Rechner wurde bewusst NICHT geaendert.

   BEHOBEN in v0.20: chkY ist in die Summe des Zahlungsstroms aufgenommen. Die
   Zusicherung haelt jetzt den korrigierten Zustand fest — Summe und Zahlungsstrom
   stimmen ueberein, die Pruefung steckt in beiden. Wirkung der Behebung auf den
   Barwert: Mittelstand +3,9 %, mit IBCS-Pflicht +7,7 %; Konzern +3,4 % bzw. +6,9 %.
   Die Gesamtkosten haben sich dabei nicht bewegt. */
for (const key of ['paid', 'deneb']) {
  const d = await p.evaluate(k => {
    const e = expected(k);
    return { total: e.total, cf: e.cf.reduce((a, v) => a + v, 0), chk: e.ibcsCheck, jahre: e.cf.length };
  }, key);
  ok('[' + key + '] Zahlungsstrom hat H = 3 Eintraege (Jahr 1 bis 3, kein Jahr 0)', d.jahre === 3, d.jahre);
  ok('[' + key + '] Zahlungsstrom = Summe (Konformitaetspruefung ist enthalten)',
     near(d.cf, d.total),
     'Summe ' + eur(d.total) + ' − Σcf ' + eur(d.cf) + ' = ' + eur(d.total - d.cf)
     + ' | darin Konformitaetspruefung ' + eur(d.chk));
}

/* ---------- 5) Benannte Abweichung: Kurskosten ohne Vorsteuer in der Kennzahl ----------
   Zweiter Befund derselben Familie (handrechnung.md, Abschnitt 13, Schlussabsatz):
   mit „kein voller Vorsteuerabzug" rechnet die Kennzahl der harten Kosten die
   Kurskosten OHNE Umsatzsteuer, die Cash-out-Tabelle dagegen MIT. Die Beschreibung
   („alle harten Auszahlungen … Kurse … x (1 + Satz)") stuetzt die Cash-out-Tabelle.
   BEHOBEN in v0.20: c.hard und creationHard rechnen die Kurskosten jetzt ebenfalls
   brutto. Die Zusicherung haelt den korrigierten Zustand fest. */
await p.evaluate(() => { S.flags.novat = true; update(); }); await p.waitForTimeout(500);
for (const key of ['paid', 'deneb']) {
  const d = await p.evaluate(k => {
    const e = expected(k);
    return { hard: e.hard, cfHard: e.cfHard.reduce((a, v) => a + v, 0), course: e.courseCost, vat: e.vat };
  }, key);
  ok('[' + key + '] harte Kosten = Cash-out, Kurskosten tragen die Umsatzsteuer in beiden',
     near(d.cfHard - d.hard, 0),
     'Δ ' + eur(d.cfHard - d.hard) + ' | Kurskosten brutto ' + eur(d.course));
}
await p.evaluate(() => { S.flags.novat = false; update(); }); await p.waitForTimeout(400);

/* ---------- 6) Das Szenario bleibt beim Neurechnen stabil ---------- */
{
  const a1 = await p.evaluate(() => expected('paid').total);
  await p.evaluate(() => update()); await p.waitForTimeout(400);
  const a2 = await p.evaluate(() => expected('paid').total);
  ok('Erwartungswert ist deterministisch (zweimal derselbe Wert)', a1 === a2, eur(a1) + ' / ' + eur(a2));
}

await R.finish(b);
})();
