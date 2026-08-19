/* =====================================================================
   Was braucht ein gesunder Strommix - und was kostet er?
   Interaktives White Paper, Daten-WG Kitchen.

   Aufbau dieser Datei
     1  Hilfsfunktionen und Formatierung
     2  Modell-Portierung aus strommix/scripts/model.py  (1:1)
     3  Selbsttest gegen strommix/data/test_vectors.json
     4  SVG-Render-Helfer
     5  Bootstrap, Methodik (Kap. 3), Transparenz
     6  Kapitel 2 - Ist-Zustand
     7  Kapitel 4 - LCOE-Rechner
     8  Kapitel 5 - Mix-Simulator
     9  Kapitel 7-9 + Anhang, Executive Summary, Kapitel-Navigation
    10  Kapitel 6 - Monte Carlo (Port von strommix/scripts/monte_carlo.py)

   Keine externen Bibliotheken. Alle Zahlen stammen aus strommix/data/*.json.
   ===================================================================== */
'use strict';

/* ---------------------------------------------------------------------
   1 - Hilfsfunktionen
   --------------------------------------------------------------------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

const SVG_NS = 'http://www.w3.org/2000/svg';

const PAL = {
  pv: '#eda100', windon: '#1baf7a', windoff: '#2a78d6', band: '#e87ba4',
  bat: '#008300', h2: '#4a3aa7', gas: '#eb6834', unserved: '#e34948',
  net: '#5b6472', ely: '#8a7cd8', ink: '#0F1E2E', soft: '#475569',
  accent: '#C25A2D', teal: '#1B9AA8', line: '#E4E2DA', grid: '#EAE8E0'
};

/* Kostenkomponente -> Farbe und Klartext-Label */
const COMP_META = {
  pv:            { c: PAL.pv,       l: 'Photovoltaik' },
  wind_onshore:  { c: PAL.windon,   l: 'Wind onshore' },
  wind_offshore: { c: PAL.windoff,  l: 'Wind offshore' },
  nuclear:       { c: PAL.band,     l: 'Kernkraft' },
  battery:       { c: PAL.bat,      l: 'Batteriespeicher' },
  electrolyser:  { c: PAL.ely,      l: 'Elektrolyseur' },
  h2_storage:    { c: PAL.h2,       l: 'H₂-Speicher' },
  h2_turbine:    { c: '#6f61c9',    l: 'H₂-Rückverstromung' },
  gas_backup:    { c: PAL.gas,      l: 'Gas-Backup' },
  netz:          { c: PAL.net,      l: 'Netzausbau' }
};

const nf = (d) => new Intl.NumberFormat('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
const n0 = nf(0), n1 = nf(1), n2 = nf(2);
const fmt = (v, d) => (v === null || v === undefined || !isFinite(v)) ? '–' : nf(d === undefined ? 1 : d).format(v);
const pct = (v, d) => (v === null || v === undefined || !isFinite(v)) ? '–' : nf(d === undefined ? 1 : d).format(v * 100) + ' %';

function el(tag, attrs, children) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'html') n.innerHTML = attrs[k];
    else if (k === 'text') n.textContent = attrs[k];
    else if (k === 'cls') n.className = attrs[k];
    else n.setAttribute(k, attrs[k]);
  }
  (children || []).forEach(c => n.appendChild(c));
  return n;
}
function svg(tag, attrs) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) {
    if (k === 'text') n.textContent = attrs[k];
    else n.setAttribute(k, attrs[k]);
  }
  return n;
}
function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

/* Die Dossiers und die Parameterdatei sind bewusst ASCII-transliteriert
   (ae/oe/ue/ss), damit sie in jeder Werkzeugkette verlustfrei durchlaufen.
   Fuer die Anzeige werden genau die dort tatsaechlich vorkommenden Woerter
   zurueckuebersetzt - eine geschlossene Liste, keine Heuristik. */
const DE_ASCII = [
  ['Codeaenderung', 'Codeänderung'], ['Modularitaetsargument', 'Modularitätsargument'],
  ['Sensitivitaets', 'Sensitivitäts'], ['Uebergangsloesung', 'Übergangslösung'],
  ['Veroeffentlichung', 'Veröffentlichung'], ['veroeffentlicht', 'veröffentlicht'],
  ['abschliessende', 'abschließende'], ['draussen', 'draußen'], ['fuehrbar', 'führbar'],
  ['grosse', 'große'], ['laeuft', 'läuft'], ['rueckgerechnete', 'rückgerechnete'],
  ['ueberwiegend', 'überwiegend'], ['waere', 'wäre'], ['fuer', 'für'], ['ueber', 'über'],
  ['UEBERGANGSLOESUNG', 'ÜBERGANGSLÖSUNG'], ['enthaelt', 'enthält'], ['Glaettung', 'Glättung'],
  ['hoehere', 'höhere'], ['unterschaetzt', 'unterschätzt'], ['Groessenordnung', 'Größenordnung'],
  ['naeherungsweise', 'näherungsweise'], ['Ueberschreitungen', 'Überschreitungen'],
  ['Laendern', 'Ländern'], ['Laender', 'Länder'], ['guenstigste', 'günstigste'],
  ['Fuer', 'Für'], ['Gruende', 'Gründe'], ['oefter', 'öfter'], ['grosser', 'großer'],
  ['ueberzeichnet', 'überzeichnet'], ['UEBERschaetzt', 'ÜBERschätzt'],
  ['ueberschaetzt', 'überschätzt'], ['unterschaetzt', 'unterschätzt'],
  ['veroeffentlicht', 'veröffentlicht'], ['Uebergangsloesung', 'Übergangslösung'],
  ['Ueberschreitung', 'Überschreitung'], ['Groesse', 'Größe']
];
function deAscii(t) {
  if (!t) return t;
  let out = String(t);
  DE_ASCII.forEach(([a, b]) => { out = out.replace(new RegExp('\\b' + a, 'g'), b); });
  return out;
}

/* ISO-Datumsangaben aus den Daten in lesbares Deutsch. Akzeptiert
   "2024-11-06", "2024-12-11 bis 2024-12-12" und "2026-Jahresmitte". */
const DE_MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
  'August', 'September', 'Oktober', 'November', 'Dezember'];
function deDatum(s) {
  if (!s) return '–';
  const t = String(s).trim();
  const range = t.match(/^(\d{4})-(\d{2})-(\d{2})\s*(?:bis|–|-)\s*(\d{4})-(\d{2})-(\d{2})$/);
  if (range) {
    const [, y1, m1, d1, y2, m2, d2] = range;
    if (y1 === y2 && m1 === m2) return (+d1) + './' + (+d2) + '. ' + DE_MONTHS[+m1 - 1] + ' ' + y1;
    return (+d1) + '. ' + DE_MONTHS[+m1 - 1] + ' ' + y1 + ' bis ' + (+d2) + '. ' + DE_MONTHS[+m2 - 1] + ' ' + y2;
  }
  const one = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (one) return (+one[3]) + '. ' + DE_MONTHS[+one[2] - 1] + ' ' + one[1];
  const ym = t.match(/^(\d{4})-(.+)$/);
  if (ym && !/^\d/.test(ym[2])) return ym[2].replace(/_/g, ' ') + ' ' + ym[1];
  if (ym && /^\d{2}$/.test(ym[2])) return DE_MONTHS[+ym[2] - 1] + ' ' + ym[1];
  return t;
}

/* Zahl mit so vielen Nachkommastellen, wie sie wirklich braucht. */
function fmtAuto(v, maxDec) {
  if (v === null || v === undefined || !isFinite(v)) return '–';
  return fmt(v, Number.isInteger(v) ? 0 : (maxDec === undefined ? 1 : maxDec));
}

/* Konfidenz-Badge als HTML-Schnipsel. 'high'/'medium'/'low' werden gemappt. */
function confBadge(c) {
  const map = { high: 'A', medium: 'B', low: 'C' };
  let k = map[c] || c;
  if (!k || !'ABCM'.includes(k)) return '';
  return `<span class="conf conf-${k}" title="Konfidenzstufe ${k}">${k}</span>`;
}
/* Quellen-Chip. Wird nach dem Laden mit Nummer und Popover-Inhalt gefuellt. */
function cite(id) { return `<sup class="cite" data-src="${id}"></sup>`; }

/* ---------------------------------------------------------------------
   2 - Modell (Portierung von strommix/scripts/model.py)

   Alle Funktionen bilden die Python-Referenz 1:1 ab. Einzige dokumentierte
   Erweiterung: der Zweig `returnHourly` in dispatch() protokolliert
   zusaetzlich die Erzeugungskomponenten je Stunde. Das ist rein additiv und
   veraendert keine einzige Bilanzgroesse - der Selbsttest in Abschnitt 3
   prueft das gegen die Python-Ergebnisse nach.
   --------------------------------------------------------------------- */
const HOURS_PER_YEAR_REF = 8760.0;
const MWH_PER_TWH = 1e6;
const KW_PER_GW = 1e6;
const MW_PER_GW = 1e3;

function crf(rate, lifetimeYears) {
  if (!(lifetimeYears > 0)) throw new Error('lifetime_years muss > 0 sein');
  if (rate === 0) return 1.0 / lifetimeYears;
  const q = Math.pow(1.0 + rate, lifetimeYears);
  return rate * q / (q - 1.0);
}

function idcSurcharge(wacc, constructionYears) {
  if (!constructionYears) return 0.0;
  return Math.pow(1.0 + wacc, constructionYears / 2.0) - 1.0;
}

/* --- Modell v0.2: Kostenabgrenzung der CAPEX-Anker -------------------
   M1: Bauzinsen nur auf Anker ohne enthaltene Finanzierung.
   M2: Brennstoffpreis thermisch, ueber den Wirkungsgrad umgerechnet.
   M7: Ueberschreitungsfaktor nur auf Schaetzbasis-Anker.
   Spiegelt scripts/model.py 1:1 - Aenderungen dort und hier gemeinsam. */
function applShare(t, key) {
  const v = t[key];
  if (v === null || v === undefined) return 1.0;
  const n = Number(v);
  return n < 0 ? 0 : (n > 1 ? 1 : n);
}

function fuelEurMwhEl(t) {
  const direct = t.fuel_eur_mwh;
  if (direct !== null && direct !== undefined) return { fuel: Number(direct), basis: 'direkt (EUR/MWh_el)' };
  const th = t.fuel_eur_mwh_th;
  if (th === null || th === undefined) return { fuel: 0.0, basis: 'nicht gesetzt (0)' };
  const eta = t.efficiency || t.efficiency_lhv;
  if (!eta) return { fuel: 0.0, basis: 'thermisch gesetzt, aber kein Wirkungsgrad hinterlegt (0)' };
  return { fuel: Number(th) / Number(eta), basis: 'thermisch ' + Number(th).toFixed(1) + ' EUR/MWh_th / eta ' + Number(eta).toFixed(3) };
}

/* v0.2b: CO2-Abscheidung. Spiegelt model.ccs_chain() 1:1.
   Rueckgabe: [Kosten EUR/MWh_el, abgeschiedene t CO2/MWh_el]. */
function ccsChain(t) {
  const costT = t.ccs_cost_eur_t, efTh = t.emission_factor_t_mwh_th, rate = t.capture_rate;
  if (!costT || !efTh || !rate) return [0.0, 0.0];
  const eta = t.efficiency || t.efficiency_lhv;
  if (!eta) return [0.0, 0.0];
  const captured = Number(efTh) / Number(eta) * Number(rate);
  return [Number(costT) * captured, captured];
}

function scopeShareForCapex(capexEntry, shareEntry, capexValue) {
  if (!shareEntry || typeof shareEntry !== 'object') return 1.0;
  const xs = [capexEntry.min, capexEntry.mid, capexEntry.max];
  const ys = [shareEntry.min, shareEntry.mid, shareEntry.max];
  const pts = [];
  for (let i = 0; i < 3; i++) {
    if (xs[i] !== null && xs[i] !== undefined && ys[i] !== null && ys[i] !== undefined) {
      pts.push([Number(xs[i]), Number(ys[i])]);
    }
  }
  if (!pts.length) return 1.0;
  pts.sort((a, b) => a[0] - b[0]);
  const x = Number(capexValue);
  if (x <= pts[0][0]) return pts[0][1];
  if (x >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (x0 <= x && x <= x1) {
      if (x1 === x0) return y1;
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

function lcoe(t, wacc, co2Price) {
  co2Price = co2Price || 0.0;
  const capex = Number(t.capex_eur_kw);
  const n = Number(t.lifetime_years);
  const flh = Number(t.full_load_hours);
  if (!(flh > 0)) throw new Error('full_load_hours muss > 0 sein');

  const overrun = Number(t.cost_overrun_factor || 1.0);
  const overrunShare = applShare(t, 'overrun_applicable_share');
  const overrunEff = 1.0 + (overrun - 1.0) * overrunShare;
  const applyIdc = !!t.apply_idc;
  const idcGross = applyIdc ? idcSurcharge(wacc, t.construction_years) : 0.0;
  const idcShare = applShare(t, 'idc_applicable_share');
  const idc = idcGross * idcShare;
  const capexEff = capex * overrunEff * (1.0 + idc);
  const annuity = capexEff * crf(wacc, n);

  let fixedOpexKwA, opexMode;
  const opexAbs = t.opex_eur_kw_a;
  if (opexAbs !== null && opexAbs !== undefined) {
    fixedOpexKwA = Number(opexAbs); opexMode = 'absolut';
  } else {
    const ref = Number(t.opex_reference_capex_eur_kw || capex);
    fixedOpexKwA = ref * Number(t.opex_pct || 0.0); opexMode = 'prozentual';
  }

  const perMwh = flh / 1000.0;
  const capital = annuity / perMwh;
  const fixedOpex = fixedOpexKwA / perMwh;
  const fuelRes = fuelEurMwhEl(t);
  const fuel = fuelRes.fuel;
  const waste = Number(t.waste_eur_mwh || 0.0);
  const ef = Number(t.emission_factor_t_mwh || 0.0);
  const co2 = co2Price * ef;
  const ccsRes = ccsChain(t);

  return {
    lcoe_eur_mwh: capital + fixedOpex + fuel + waste + co2 + ccsRes[0],
    components_eur_mwh: { kapital: capital, fixbetrieb: fixedOpex, brennstoff: fuel, entsorgung: waste,
      co2: co2, ccs: ccsRes[0] },
    ccs_captured_t_mwh: ccsRes[1],
    capex_effective_eur_kw: capexEff,
    idc_surcharge: idc,
    idc_surcharge_gross: idcGross,
    idc_applicable_share: idcShare,
    cost_overrun_factor_effective: overrunEff,
    overrun_applicable_share: overrunShare,
    fuel_basis: fuelRes.basis,
    crf: crf(wacc, n),
    annuity_eur_kw_a: annuity,
    fixed_opex_eur_kw_a: fixedOpexKwA,
    opex_mode: opexMode,
    wacc: wacc,
    co2_price_eur_t: co2Price
  };
}

const SCENARIO_FIELD_MAP = {
  capex_eur_kw: 'capex', opex_pct: 'opex', opex_eur_kw_a: 'opex',
  full_load_hours: 'full_load_hours', lifetime_years: 'lifetime_years',
  fuel_eur_mwh: 'fuel', fuel_eur_mwh_th: 'fuel', ccs_cost_eur_t: 'fuel', waste_eur_mwh: 'waste',
  /* v0.2: Kostenabgrenzung folgt der CAPEX-Stuetzstelle */
  capex_scope: 'capex', idc_applicable_share: 'capex', overrun_applicable_share: 'capex'
};

function pickVal(entry, which) {
  if (entry === null || entry === undefined) return null;
  let v = entry[which];
  if (v === null || v === undefined) v = entry.mid;
  if (v === null || v === undefined) v = entry.value;
  return (v === undefined) ? null : v;
}

function resolveTech(params, techKey, scenario, overrides, applyIdc) {
  scenario = scenario || 'mittel';
  applyIdc = (applyIdc === undefined) ? true : applyIdc;
  const tech = params.technologies[techKey];
  const sset = params.scenario_sets[scenario];
  const flat = {};
  for (const field in tech.params) {
    const mapped = SCENARIO_FIELD_MAP[field];
    let which = sset[mapped === undefined ? '' : mapped];
    if (which === undefined || typeof which !== 'string') which = 'mid';
    flat[field] = pickVal(tech.params[field], which);
  }
  flat.tech_key = techKey;
  flat.label = tech.label || techKey;
  flat.role = tech.role;
  flat.apply_idc = applyIdc;
  flat.wacc = (sset.wacc !== undefined) ? sset.wacc : params.global.wacc.mid;
  if (overrides) Object.assign(flat, overrides);
  return flat;
}

function scenarioWacc(params, scenario) {
  const s = params.scenario_sets[scenario];
  return (s.wacc !== undefined) ? s.wacc : params.global.wacc.mid;
}

/* --- Profile normalisieren (entspricht load_profiles) ----------------- */
function buildProfiles(raw, params) {
  const seasonalCfg = (params.profiles_meta && params.profiles_meta.seasonal_share_covered) || {};
  const cfMap = raw.meta.capacity_factors_covered_period || {};
  const series = {};
  let hours = 0, timestamps = [], fullYear = true;

  for (const name in raw.series) {
    const s = raw.series[name];
    const cov = s.coverage || {};
    const avail = !!(s.available && s.hourly_profile);
    let seasonal = null;
    if (cov.covers_full_calendar_year) seasonal = 1.0;
    else if (seasonalCfg[name] && seasonalCfg[name].value !== null && seasonalCfg[name].value !== undefined)
      seasonal = seasonalCfg[name].value;
    if (avail) {
      hours = Math.max(hours, s.hourly_profile.length);
      if (!timestamps.length) timestamps = s.timestamps || [];
      if (!cov.covers_full_calendar_year) fullYear = false;
    }
    series[name] = {
      label: s.label_de || name, available: avail, profile: s.hourly_profile,
      cf_covered: (cfMap[name] === undefined ? null : cfMap[name]),
      seasonal_share: seasonal, coverage: cov,
      sum_mwh_covered: s.annual_sum_mwh_covered_period
    };
  }
  return {
    series: series, hours: hours, full_year: fullYear,
    label: fullYear ? 'Volljahr' : 'H2-2024-basiert (Teilzeitraum)',
    timestamps: timestamps, data_completeness: raw.meta.data_completeness, meta: raw.meta
  };
}

const VRE_TECHS = { pv: 'pv_freiflaeche', wind_onshore: 'wind_onshore', wind_offshore: 'wind_offshore' };

function seriesFor(profiles, params, techKey) {
  const tech = params.technologies[techKey];
  const name = tech.profile_series;
  const s = profiles.series[name];
  if (!s || !s.available) throw new Error("Profilreihe '" + name + "' fuer " + techKey + ' nicht verfuegbar');
  return { profile: s.profile, note: tech.profile_note || null };
}

function dispatch(capacitiesGw, params, profiles, opts) {
  opts = opts || {};
  const scenario = opts.scenario || 'mittel';
  const vreEnergyMode = opts.vre_energy_mode || 'flh';
  const returnHourly = !!opts.return_hourly;
  const warnings = [];

  if (profiles.data_completeness !== 'FULL' && !profiles.full_year) {
    warnings.push('Profil unvollständig (' + profiles.label + ', ' + profiles.hours +
      ' h) – alle Dispatch-Ergebnisse sind auf diesen Zeitraum bezogen.');
  }

  let techs = opts.techs;
  if (!techs) {
    techs = {};
    for (const k in params.technologies) techs[k] = resolveTech(params, k, scenario);
  }
  const hours = profiles.hours;
  if (hours === 0) throw new Error('Profil enthält keine Stunden');

  const demandTwh = (opts.demand_twh !== undefined && opts.demand_twh !== null)
    ? opts.demand_twh : params.global.demand_twh.value;

  const loadSeries = profiles.series.load_mw;
  if (!loadSeries.available) throw new Error('Lastprofil fehlt – Dispatch nicht möglich');
  const shareLoad = loadSeries.seasonal_share || 1.0;
  const loadTotalMwh = demandTwh * MWH_PER_TWH * shareLoad;
  const load = loadSeries.profile.map(p => p * loadTotalMwh);

  /* fEE-Erzeugung: Profilform x Energieniveau */
  const vreHourly = {}, vrePotential = {};
  for (const capKey in VRE_TECHS) {
    const techKey = VRE_TECHS[capKey];
    const capGw = Number(capacitiesGw[capKey] || 0.0);
    if (capGw <= 0) continue;
    const sf = seriesFor(profiles, params, techKey);
    if (sf.note) warnings.push(techKey + ': ' + sf.note);
    const seriesName = params.technologies[techKey].profile_series;
    const s = profiles.series[seriesName];
    let energyMwh;
    if (vreEnergyMode === 'profile_cf') {
      if (s.cf_covered === null) throw new Error('Kein Kapazitätsfaktor für ' + seriesName);
      energyMwh = capGw * MW_PER_GW * s.cf_covered * hours;
    } else {
      const flh = Number(techs[techKey].full_load_hours);
      let share = s.seasonal_share;
      if (share === null || share === undefined) {
        const expected = Number(s.coverage.hours_expected || hours);
        share = hours / expected;
        warnings.push(seriesName + ': kein Saisonanteil hinterlegt, Stundenanteil ' + share.toFixed(3) + ' verwendet');
      }
      energyMwh = capGw * MW_PER_GW * flh * share;
    }
    vreHourly[capKey] = sf.profile.map(p => p * energyMwh);
    vrePotential[capKey] = energyMwh;
  }

  /* Muss-Einspeisung / Band */
  let bandMw = 0.0, nuclearBandMw = 0.0;
  const nuclearGw = Number(capacitiesGw.nuclear || 0.0);
  if (nuclearGw > 0) {
    const availability = Number(techs.nuclear.full_load_hours) / HOURS_PER_YEAR_REF;
    nuclearBandMw = nuclearGw * MW_PER_GW * availability;
    bandMw += nuclearBandMw;
  }
  const hydroMw = Number(capacitiesGw.hydro_band || 0.0) * MW_PER_GW;
  const bioMw = Number(capacitiesGw.biomass_band || 0.0) * MW_PER_GW;
  /* v0.2 (M6): Kohle als Bestandsband */
  const coalMw = Number(capacitiesGw.coal_band || 0.0) * MW_PER_GW;
  bandMw += hydroMw + bioMw + coalMw;

  /* Speicher- und Backup-Parameter */
  const batPowerMw = Number(capacitiesGw.battery_power || 0.0) * MW_PER_GW;
  const batEnergyMwh = Number(capacitiesGw.battery_energy_gwh || 0.0) * MW_PER_GW;
  const etaBat = Number(techs.battery.efficiency_roundtrip || 1.0);
  const etaLeg = Math.sqrt(etaBat);

  const elyMw = Number(capacitiesGw.electrolyser || 0.0) * MW_PER_GW;
  const etaEly = Number(techs.electrolyser.efficiency_lhv || 1.0);
  const h2StoreMwh = Number(capacitiesGw.h2_storage_gwh || 0.0) * MW_PER_GW;
  const h2TurbMw = Number(capacitiesGw.h2_turbine || 0.0) * MW_PER_GW;
  const etaH2 = Number(techs.h2_turbine.efficiency || 1.0);
  const h2FillShare = Number(capacitiesGw.h2_initial_fill_share || 0.0);
  if (h2FillShare && profiles.full_year) {
    warnings.push('h2_initial_fill_share > 0 bei Volljahresprofil – der Saisonspeicher startet ' +
      'damit gefüllt, ohne dass die Einspeicherung im Modell bezahlt wird.');
  }

  const gasCap = capacitiesGw.gas_backup;
  const gasMw = (gasCap === null || gasCap === undefined) ? Infinity : Number(gasCap) * MW_PER_GW;

  if (batPowerMw > 0 && batEnergyMwh > 0) {
    const duration = batEnergyMwh / batPowerMw;
    const refDuration = Number(techs.battery.duration_hours || duration);
    if (Math.abs(duration - refDuration) > 0.5) {
      warnings.push('Batterie-Auslegung ' + duration.toFixed(1) + ' h weicht von der CAPEX-Referenz (' +
        refDuration.toFixed(0) + ' h System) ab – €/kWh-Ansatz nur näherungsweise gültig.');
    }
  }

  /* Stundenschleife */
  let socBat = 0.0;
  let socH2 = h2StoreMwh * h2FillShare;
  const socH2Start = socH2;
  const tot = {
    load: 0, vre: 0, band: 0, curtailed: 0, bat_charge: 0, bat_discharge: 0,
    ely_in: 0, h2_produced: 0, h2_reelec: 0, h2_in_from_store: 0,
    gas: 0, unserved: 0, residual_pos: 0
  };
  let gasPeak = 0, unservedPeak = 0, socBatMax = 0, socH2Max = socH2, socH2Min = socH2;

  const hourly = returnHourly ? {
    residual: [], gas: [], unserved: [], curtailed: [], soc_bat: [], soc_h2: [],
    /* additive Erweiterung gegenueber model.py, nur fuer die Darstellung */
    load: [], pv: [], wind_onshore: [], wind_offshore: [], band: [],
    bat_discharge: [], bat_charge: [], h2_reelec: [], ely_in: []
  } : null;

  const pvH = vreHourly.pv, wonH = vreHourly.wind_onshore, woffH = vreHourly.wind_offshore;

  for (let i = 0; i < hours; i++) {
    const pv = pvH ? pvH[i] : 0, won = wonH ? wonH[i] : 0, woff = woffH ? woffH[i] : 0;
    const vre = pv + won + woff;
    const l = load[i];
    const residual = l - vre - bandMw;
    tot.load += l; tot.vre += vre; tot.band += bandMw;
    let gasH = 0, unsH = 0, curtH = 0, batDis = 0, batChg = 0, h2Out = 0, elyIn = 0;

    if (residual < 0) {
      let surplus = -residual;
      if (batPowerMw > 0 && batEnergyMwh > 0) {
        const room = (batEnergyMwh - socBat) / etaLeg;
        const charge = Math.min(surplus, batPowerMw, Math.max(room, 0.0));
        socBat += charge * etaLeg; surplus -= charge; tot.bat_charge += charge; batChg = charge;
      }
      if (elyMw > 0 && h2StoreMwh > 0) {
        const room = (h2StoreMwh - socH2) / etaEly;
        const use = Math.min(surplus, elyMw, Math.max(room, 0.0));
        socH2 += use * etaEly; surplus -= use; tot.ely_in += use; tot.h2_produced += use * etaEly; elyIn = use;
      }
      curtH = surplus; tot.curtailed += curtH;
    } else if (residual > 0) {
      let need = residual;
      tot.residual_pos += residual;
      if (batPowerMw > 0 && socBat > 0) {
        const out = Math.min(need, batPowerMw, socBat * etaLeg);
        socBat -= out / etaLeg; need -= out; tot.bat_discharge += out; batDis = out;
      }
      if (h2TurbMw > 0 && socH2 > 0) {
        const out = Math.min(need, h2TurbMw, socH2 * etaH2);
        socH2 -= out / etaH2; need -= out; tot.h2_reelec += out; tot.h2_in_from_store += out / etaH2; h2Out = out;
      }
      if (gasMw > 0) {
        gasH = Math.min(need, gasMw); need -= gasH; tot.gas += gasH;
        if (gasH > gasPeak) gasPeak = gasH;
      }
      unsH = need; tot.unserved += unsH;
      if (unsH > unservedPeak) unservedPeak = unsH;
    }

    if (socBat > socBatMax) socBatMax = socBat;
    if (socH2 > socH2Max) socH2Max = socH2;
    if (socH2 < socH2Min) socH2Min = socH2;

    if (returnHourly) {
      hourly.residual.push(residual); hourly.gas.push(gasH); hourly.unserved.push(unsH);
      hourly.curtailed.push(curtH); hourly.soc_bat.push(socBat); hourly.soc_h2.push(socH2);
      hourly.load.push(l); hourly.pv.push(pv); hourly.wind_onshore.push(won);
      hourly.wind_offshore.push(woff); hourly.band.push(bandMw);
      hourly.bat_discharge.push(batDis); hourly.bat_charge.push(batChg);
      hourly.h2_reelec.push(h2Out); hourly.ely_in.push(elyIn);
    }
  }

  const twh = (mwh) => mwh / MWH_PER_TWH;
  const served = tot.load - tot.unserved;
  const vrePotTwh = {};
  for (const k in vrePotential) vrePotTwh[k] = twh(vrePotential[k]);

  const result = {
    label: profiles.label, hours: hours, vre_energy_mode: vreEnergyMode,
    demand_twh_input: demandTwh, seasonal_share_load: shareLoad,
    energy_twh: {
      load: twh(tot.load), served: twh(served), vre_generated: twh(tot.vre), band: twh(tot.band),
      curtailed: twh(tot.curtailed), battery_charge: twh(tot.bat_charge),
      battery_discharge: twh(tot.bat_discharge), electrolysis_input: twh(tot.ely_in),
      h2_produced: twh(tot.h2_produced), h2_reelectrified: twh(tot.h2_reelec),
      gas_backup: twh(tot.gas), unserved: twh(tot.unserved),
      /* Bandkomponenten getrennt (v0.2/M6) */
      nuclear_band: twh(nuclearBandMw * hours),
      hydro_band: twh(hydroMw * hours),
      biomass_band: twh(bioMw * hours),
      coal_band: twh(coalMw * hours)
    },
    vre_potential_twh: vrePotTwh,
    coverage_ratio: tot.load ? served / tot.load : 0.0,
    unserved_share: tot.load ? tot.unserved / tot.load : 0.0,
    curtailment_share_of_vre: tot.vre ? tot.curtailed / tot.vre : 0.0,
    curtailment_share_of_generation: (tot.vre + tot.band) ? tot.curtailed / (tot.vre + tot.band) : 0.0,
    h2_soc_start_gwh: socH2Start / MW_PER_GW,
    h2_withdrawn_twh: twh(tot.h2_in_from_store),
    h2_from_initial_fill_twh: twh(Math.max(0.0, socH2Start - socH2)),
    gas_peak_gw: gasPeak / MW_PER_GW,
    gas_full_load_hours: gasPeak > 0 ? tot.gas / gasPeak : 0.0,
    unserved_peak_gw: unservedPeak / MW_PER_GW,
    battery_soc_max_gwh: socBatMax / MW_PER_GW,
    h2_soc_max_gwh: socH2Max / MW_PER_GW,
    h2_soc_end_gwh: socH2 / MW_PER_GW,
    h2_soc_min_gwh: socH2Min / MW_PER_GW,
    h2_storage_required_gwh: (socH2Max - socH2Min) / MW_PER_GW,
    nuclear_band_gw: nuclearBandMw / MW_PER_GW,
    warnings: warnings
  };
  if (returnHourly) { result.hourly = hourly; result.timestamps = profiles.timestamps; }
  return result;
}

function annualFixedCostEurKw(techFlat, wacc) {
  const r = lcoe(Object.assign({}, techFlat, { full_load_hours: 1000.0 }), wacc, 0.0);
  return r.annuity_eur_kw_a + r.fixed_opex_eur_kw_a;
}

function mixSystem(shares, demandTwh, params, profiles, opts) {
  opts = opts || {};
  const scenario = opts.scenario || 'mittel';
  const storage = Object.assign({}, opts.storage || {});
  const applyIdc = (opts.apply_idc === undefined) ? true : opts.apply_idc;
  const gridVariant = opts.grid_variant || 'mid';
  const gasTech = opts.gas_tech || 'gas_ccgt';
  const firmTech = opts.firm_tech || 'nuclear';
  const bandsTwh = opts.bands_twh || {};
  const gridCostBasis = opts.grid_cost_basis || 'buildout_2045';
  const warnings = [];
  const wacc = scenarioWacc(params, scenario);
  const co2Price = (opts.co2_price !== undefined && opts.co2_price !== null)
    ? opts.co2_price : params.global.co2_price_eur_t.value;

  const techs = {};
  for (const k in params.technologies) techs[k] = resolveTech(params, k, scenario, null, applyIdc);

  /* 1 - Kapazitaeten aus Energieanteilen */
  const caps = {};
  const techForShare = { pv: 'pv_freiflaeche', wind_onshore: 'wind_onshore', wind_offshore: 'wind_offshore', nuclear: firmTech };
  for (const shareKey in shares) {
    const techKey = techForShare[shareKey] || shareKey;
    const flh = Number(techs[techKey].full_load_hours);
    const energyMwh = shares[shareKey] * demandTwh * MWH_PER_TWH;
    caps[shareKey] = energyMwh / flh / MW_PER_GW;
  }
  /* Bestandsbaender (v0.2/M6): Jahresenergie -> konstante Bandleistung */
  {
    const shareLoadCfg = (profiles.series.load_mw.seasonal_share || 1.0);
    ['hydro_band', 'biomass_band', 'coal_band'].forEach(bk => {
      const e = Number(bandsTwh[bk] || 0.0);
      caps[bk] = (e <= 0) ? 0.0 : (e * MWH_PER_TWH * shareLoadCfg / profiles.hours / MW_PER_GW);
    });
  }
  caps.battery_power = storage.battery_power_gw || 0.0;
  caps.battery_energy_gwh = storage.battery_energy_gwh || 0.0;
  caps.electrolyser = storage.electrolyser_gw || 0.0;
  caps.h2_storage_gwh = storage.h2_storage_gwh || 0.0;
  caps.h2_turbine = storage.h2_turbine_gw || 0.0;
  caps.h2_initial_fill_share = storage.h2_initial_fill_share || 0.0;
  caps.gas_backup = ('gas_backup_gw' in storage) ? storage.gas_backup_gw : null;

  /* 2 - Dispatch */
  const disp = dispatch(caps, params, profiles, {
    demand_twh: demandTwh, scenario: scenario, techs: techs, vre_energy_mode: 'flh',
    return_hourly: !!opts.return_hourly
  });
  disp.warnings.forEach(w => warnings.push(w));

  const shareLoad = disp.seasonal_share_load || 1.0;
  const annualize = 1.0 / shareLoad;
  if (shareLoad < 0.999) {
    warnings.push('Teilzeitraum-Hochrechnung: Dispatch-Mengen wurden mit Faktor ' + annualize.toFixed(3) +
      ' (Lastanteil des abgedeckten Zeitraums) auf ein Jahr hochgerechnet. Der abgedeckte Zeitraum ' +
      'Jul–Dez ist winterlastig – Backup- und Speichermengen werden dadurch eher über- als ' +
      'unterschätzt.');
  }

  /* 3 - Kosten */
  const cost = {}, detail = {};
  function addCapacityCost(name, techKey, capGw) {
    if (capGw <= 0) return;
    const fixed = annualFixedCostEurKw(techs[techKey], wacc);
    cost[name] = (cost[name] || 0.0) + fixed * capGw * KW_PER_GW;
    detail[name] = { capacity_gw: capGw, fixed_eur_kw_a: fixed };
  }

  for (const shareKey in shares) {
    const techKey = techForShare[shareKey] || shareKey;
    addCapacityCost(shareKey, techKey, caps[shareKey]);
    const flat = techs[techKey];
    const varC = Number(flat.fuel_eur_mwh || 0.0) + Number(flat.waste_eur_mwh || 0.0)
      + co2Price * Number(flat.emission_factor_t_mwh || 0.0);
    if (varC) {
      let genTwh = disp.vre_potential_twh[shareKey];
      if (genTwh === undefined || genTwh === null) genTwh = (shareKey === 'nuclear') ? disp.energy_twh.nuclear_band : 0.0;
      cost[shareKey] = (cost[shareKey] || 0.0) + varC * genTwh * annualize * MWH_PER_TWH;
    }
  }

  let gasGw = caps.gas_backup;
  if (gasGw === null || gasGw === undefined) gasGw = disp.gas_peak_gw;
  const efGas = Number(techs[gasTech].emission_factor_t_mwh || 0.0);
  const ccsGas = ccsChain(techs[gasTech]);   /* v0.2b */
  const gasTwhA = disp.energy_twh.gas_backup * annualize;
  if (gasGw > 0) {
    addCapacityCost('gas_backup', gasTech, gasGw);
    const flat = techs[gasTech];
    /* v0.2 (M2): Brennstoffpreis thermisch, ueber den Wirkungsgrad umgerechnet */
    const fr = fuelEurMwhEl(flat);
    if (!fr.fuel) {
      warnings.push('Gas-Brennstoffkosten konnten nicht bestimmt werden - im Ergebnis mit 0 EUR/MWh ' +
        'angesetzt. Das LSCOE ist insoweit eine UNTERGRENZE.');
    }
    cost.gas_backup = (cost.gas_backup || 0.0) +
      (fr.fuel + co2Price * efGas + ccsGas[0]) * gasTwhA * MWH_PER_TWH;
    detail.gas_backup = Object.assign(detail.gas_backup || {},
      { generation_twh_a: gasTwhA, flh: disp.gas_full_load_hours * annualize,
        fuel_eur_mwh_el: fr.fuel, fuel_basis: fr.basis, tech_key: gasTech,
        ccs_eur_mwh_el: ccsGas[0], ccs_captured_t_mwh_el: ccsGas[1] });
  }

  /* Bestandsbaender (v0.2/M6): nur CO2-Kosten, keine Kapital-/Betriebskosten */
  const legacy = (params.system && params.system.legacy_bands) || {};
  const LEGACY_MAP = { coal_band: 'coal', biomass_band: 'biomass', hydro_band: 'hydro' };
  const legacyEf = {};
  for (const bandKey in LEGACY_MAP) {
    const lk = LEGACY_MAP[bandKey];
    const bandTwh = (disp.energy_twh[bandKey] || 0.0) * annualize;
    const efEntry = (legacy[lk] || {}).emission_factor_t_mwh || {};
    const ef = Number(efEntry.value || 0.0);
    legacyEf[bandKey] = ef;
    if (bandTwh <= 0) continue;
    if (ef) cost[bandKey] = (cost[bandKey] || 0.0) + co2Price * ef * bandTwh * MWH_PER_TWH;
    detail[bandKey] = { generation_twh_a: bandTwh, emission_factor_t_mwh: ef };
    if (lk === 'coal' || lk === 'biomass') {
      warnings.push('Bestandsband ' + lk + ': ' + bandTwh.toFixed(1) + ' TWh/a laufen ohne Kapital- ' +
        'und Betriebskosten in die Rechnung (keine Kostenparameter in den Dossiers). ' +
        'Das LSCOE ist insoweit eine UNTERGRENZE.');
    }
  }

  if (caps.battery_energy_gwh) {
    const bat = techs.battery;
    const eKwh = caps.battery_energy_gwh * 1e6;
    const ann = Number(bat.capex_eur_kwh) * (crf(wacc, Number(bat.lifetime_years)) + Number(bat.opex_pct));
    cost.battery = ann * eKwh;
    detail.battery = { energy_gwh: caps.battery_energy_gwh, throughput_twh_a: disp.energy_twh.battery_discharge * annualize };
  }
  if (caps.electrolyser) addCapacityCost('electrolyser', 'electrolyser', caps.electrolyser);
  if (caps.h2_storage_gwh) {
    const h2Cost = Number(params.technologies.h2_storage.params.storage_cost_eur_mwh_h2.value);
    const throughputTwh = Math.max(disp.energy_twh.h2_produced, disp.h2_withdrawn_twh) * annualize;
    cost.h2_storage = h2Cost * throughputTwh * MWH_PER_TWH;
    detail.h2_storage = {
      throughput_twh_a: throughputTwh, max_fill_gwh: disp.h2_soc_max_gwh,
      from_initial_fill_twh: disp.h2_from_initial_fill_twh, capacity_gwh: caps.h2_storage_gwh
    };
    if (disp.h2_from_initial_fill_twh > 0) {
      warnings.push(disp.h2_from_initial_fill_twh.toFixed(1) + ' TWh H₂ stammen aus dem gesetzten ' +
        'Anfangsfüllstand des Saisonspeichers. Die Stromkosten für deren Erzeugung liegen außerhalb ' +
        'des abgedeckten Zeitraums und sind NICHT enthalten – das LSCOE ist insoweit eine Untergrenze.');
    }
  }
  if (caps.h2_turbine) addCapacityCost('h2_turbine', 'h2_turbine', caps.h2_turbine);

  /* Netzkosten (v0.2/M3: Uebertragung + Verteilnetz getrennt) */
  let feeShareGenerated = 0;
  for (const k in shares) if (k in VRE_TECHS) feeShareGenerated += shares[k];
  const grid = params.system.grid;
  const variant = ['min', 'mid', 'max'].includes(gridVariant) ? gridVariant : 'mid';
  const gridLife = grid.lifetime_years.value;
  const gridCrf = crf(wacc, gridLife);
  const servedTwhA = disp.energy_twh.served * annualize;

  const vreGen = disp.energy_twh.vre_generated * annualize;
  const bandGen = disp.energy_twh.band * annualize;
  const curtA = disp.energy_twh.curtailed * annualize;
  const vreUsed = vreGen - ((vreGen + bandGen) ? curtA * vreGen / (vreGen + bandGen) : 0.0);
  const feeShareUsed = demandTwh ? vreUsed / demandTwh : 0.0;
  let gridScalingRaw = { transmission: null, distribution: null };

  if (gridCostBasis === 'ist_netzentgelt') {
    const istGrid = Number(pickVal(grid.ist_2025_eur_mwh, variant));
    cost.netz = istGrid * servedTwhA * MWH_PER_TWH;
    detail.netz = { basis: 'ist_netzentgelt', eur_mwh: istGrid };
  } else if (gridCostBasis === 'none') {
    cost.netz = 0.0;
    detail.netz = { basis: 'none' };
  } else if (gridCostBasis === 'legacy_fee_linear') {
    /* v0.1-Konvention, nur noch als Vergleichslauf */
    const investBn = pickVal(grid.investment_bn_eur_until_2045, variant);
    cost.netz = investBn * 1e9 * gridCrf * (feeShareGenerated / grid.reference_fee_share.value);
    detail.netz = { basis: 'legacy_fee_linear', invest_bn_eur: investBn, fee_share: feeShareGenerated };
  } else {
    const refShare = grid.reference_fee_share.value;
    const refDemand = grid.reference_demand_twh.value;
    const transBn = pickVal(grid.transmission_bn_eur_until_2045, variant);
    const distBn = pickVal(grid.distribution_bn_eur_until_2045, variant);
    const rawT = refShare ? feeShareUsed / refShare : 0.0;
    const rawD = refDemand ? demandTwh / refDemand : 0.0;
    const scaleT = Math.min(1.0, rawT), scaleD = Math.min(1.0, rawD);
    const costT = transBn * 1e9 * gridCrf * scaleT;
    const costD = distBn * 1e9 * gridCrf * scaleD;
    cost.netz = costT + costD;
    gridScalingRaw = { transmission: rawT, distribution: rawD };
    detail.netz = {
      basis: 'buildout_2045', transmission_bn_eur: transBn, distribution_bn_eur: distBn,
      fee_share_generated: feeShareGenerated, fee_share_used: feeShareUsed,
      scaling_transmission: scaleT, scaling_distribution: scaleD,
      scaling_transmission_raw: rawT, scaling_distribution_raw: rawD,
      cost_transmission_bn_eur_a: costT / 1e9, cost_distribution_bn_eur_a: costD / 1e9
    };
    if (rawT > 1.0) {
      warnings.push('Uebertragungsnetz-Skalierung ' + rawT.toFixed(2) + ' auf 1,00 gedeckelt - das ' +
        'Szenario wuerde sonst mehr als das gesamte nationale Uebertragungsnetzbudget tragen.');
    }
    if (rawD > 1.0) {
      warnings.push('Verteilnetz-Skalierung ' + rawD.toFixed(2) + ' auf 1,00 gedeckelt (Bedarf ueber ' +
        'dem Referenzbedarf von ' + Number(refDemand).toFixed(0) + ' TWh).');
    }
  }

  let total = 0; for (const k in cost) total += cost[k];
  const lscoe = servedTwhA ? total / (servedTwhA * MWH_PER_TWH) : NaN;

  /* Restemissionen (v0.2/M5) */
  const coalTwhA = (disp.energy_twh.coal_band || 0.0) * annualize;
  const efCoal = legacyEf.coal_band || 0.0;
  const emissions = {
    gas_mt_co2_a: gasTwhA * efGas,
    coal_mt_co2_a: coalTwhA * efCoal,
    total_mt_co2_a: gasTwhA * efGas + coalTwhA * efCoal,
    captured_mt_co2_a: gasTwhA * ccsGas[1],
    backup_tech: gasTech,
    g_co2_per_kwh_delivered: servedTwhA ? (gasTwhA * efGas + coalTwhA * efCoal) * 1000.0 / servedTwhA : 0.0,
    emission_factor_gas_t_mwh: efGas,
    emission_factor_coal_t_mwh: efCoal
  };

  if (disp.energy_twh.unserved > 0) {
    warnings.push('Ungedeckte Last: ' + disp.energy_twh.unserved.toFixed(2) + ' TWh im abgedeckten ' +
      'Zeitraum (' + ((1 - disp.coverage_ratio) * 100).toFixed(2) + ' % der Last), Spitze ' +
      disp.unserved_peak_gw.toFixed(1) + ' GW. Import/Export und Lastmanagement sind bewusst nicht ' +
      'modelliert (konservativ).');
  }

  const compBn = {}, compMwh = {};
  Object.keys(cost).sort().forEach(k => {
    compBn[k] = cost[k] / 1e9;
    if (servedTwhA) compMwh[k] = cost[k] / (servedTwhA * MWH_PER_TWH);
  });
  const capsOut = {};
  for (const k in caps) if (caps[k] !== null && caps[k] !== undefined) capsOut[k] = caps[k];
  /* Summe der installierten Leistung: nur echte GW-Groessen. `_gwh` sind
     Energie-, `h2_initial_fill_share` ist eine dimensionslose Anteilsangabe,
     und `gas_backup` wird separat addiert (sonst doppelt, wenn der Nutzer
     eine feste Backup-Leistung vorgibt statt sie messen zu lassen). */
  const NON_CAPACITY_KEYS = { h2_initial_fill_share: 1, gas_backup: 1 };
  let installedTotal = 0;
  for (const k in caps) {
    const v = caps[k];
    if (typeof v === 'number' && !k.endsWith('_gwh') && !NON_CAPACITY_KEYS[k]) installedTotal += v;
  }
  installedTotal += (gasGw || 0.0);

  return {
    lscoe_eur_mwh: lscoe, total_cost_bn_eur_a: total / 1e9,
    cost_components_bn_eur_a: compBn, cost_components_eur_mwh: compMwh,
    capacities_gw: capsOut, installed_gw_total: installedTotal,
    served_twh_a: servedTwhA, dispatch: disp, scenario: scenario, wacc: wacc,
    co2_price_eur_t: co2Price, detail: detail, warnings: warnings, gas_gw: gasGw,
    emissions: emissions, emissions_mt_co2_a: emissions.total_mt_co2_a,
    captured_mt_co2_a: emissions.captured_mt_co2_a,
    grid_cost_basis: gridCostBasis, grid_scaling_raw: gridScalingRaw,
    comparable_to_target_scenarios: gridCostBasis === 'buildout_2045'
  };
}

/* ---------------------------------------------------------------------
   3 - Selbsttest gegen die Python-Referenz
   --------------------------------------------------------------------- */
function closeEnough(actual, expected, tol) {
  if (expected === null || expected === undefined) return actual === null || actual === undefined;
  if (typeof expected !== 'number') return true;
  if (!isFinite(expected) || !isFinite(actual)) return expected === actual;
  const denom = Math.max(Math.abs(expected), 1e-9);
  if (Math.abs(expected) < 1e-6) return Math.abs(actual - expected) < 1e-6;
  return Math.abs(actual - expected) / denom <= tol;
}

function compareDeep(actual, expected, tol, path, fails) {
  if (expected !== null && typeof expected === 'object' && !Array.isArray(expected)) {
    for (const k in expected) {
      compareDeep(actual ? actual[k] : undefined, expected[k], tol, path + '.' + k, fails);
    }
    return;
  }
  if (typeof expected === 'number') {
    if (!closeEnough(actual, expected, tol)) {
      fails.push({ path: path, expected: expected, actual: actual,
        dev: (actual === undefined ? NaN : (actual - expected) / (Math.abs(expected) || 1)) });
    }
  }
}

function runSelfTest(vec, params, profiles) {
  const tol = (vec.meta && vec.meta.tolerance_relative) || 0.005;
  const fails = [];
  let checked = 0;

  vec.crf.forEach((c, i) => { checked++; compareDeep(crf(c.rate, c.lifetime_years), c.expected, tol, 'crf[' + i + ']', fails); });
  vec.idc.forEach((c, i) => { checked++; compareDeep(idcSurcharge(c.wacc, c.construction_years), c.expected, tol, 'idc[' + i + ']', fails); });

  vec.lcoe.forEach(c => {
    checked++;
    const flat = resolveTech(params, c.input.tech_key, c.input.scenario, c.input.overrides || null, c.input.apply_idc);
    const res = lcoe(flat, c.input.wacc, c.input.co2_price_eur_t);
    compareDeep(res, c.expected, tol, 'lcoe/' + c.id, fails);
  });

  vec.mix.forEach(c => {
    checked++;
    const res = mixSystem(c.input.shares, c.input.demand_twh, params, profiles, {
      scenario: c.input.scenario, storage: c.input.storage, co2_price: c.input.co2_price,
      grid_variant: c.input.grid_variant, apply_idc: c.input.apply_idc,
      bands_twh: c.input.bands_twh, grid_cost_basis: c.input.grid_cost_basis,
      gas_tech: c.input.gas_tech
    });
    compareDeep(res, c.expected, tol, 'mix/' + c.id, fails);
  });

  return { checked: checked, fails: fails, tol: tol };
}

/* ---------------------------------------------------------------------
   4 - SVG-Render-Helfer
   --------------------------------------------------------------------- */
const TT = () => $('#tt');

function showTip(evt, html) {
  const t = TT();
  t.innerHTML = html;
  t.classList.add('on');
  const pad = 14;
  let x = evt.clientX + pad, y = evt.clientY + pad;
  const r = t.getBoundingClientRect();
  if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
  if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
  t.style.left = (x + window.scrollX) + 'px';
  t.style.top = (y + window.scrollY) + 'px';
}
function hideTip() { TT().classList.remove('on'); }

function attachTip(node, htmlFn) {
  node.addEventListener('mousemove', e => showTip(e, htmlFn()));
  node.addEventListener('mouseleave', hideTip);
  node.style.cursor = 'default';
}

function legend(container, items) {
  const box = typeof container === 'string' ? $(container) : container;
  clear(box);
  items.forEach(it => {
    const s = el('span');
    s.appendChild(el('i', { cls: it.line ? 'ln' : '', style: 'background:' + it.c }));
    s.appendChild(document.createTextNode(it.l));
    box.appendChild(s);
  });
}

function niceMax(v) {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const s = v / mag;
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find(x => s <= x + 1e-9) || 10;
  return step * mag;
}

function axisTicks(max, n) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(max * i / n);
  return out;
}

/* Horizontales Balkendiagramm mit optionaler Spanne (min..max + Mittelpunkt) */
function renderHBars(target, rows, cfg) {
  cfg = cfg || {};
  const s = typeof target === 'string' ? $(target) : target;
  clear(s);
  const W = cfg.width || 860;
  const rowH = cfg.rowH || 30, gap = 8;
  const padL = cfg.padL || 190, padR = cfg.padR || 60, padT = 26, padB = 34;
  const H = padT + rows.length * (rowH + gap) + padB;
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  s.setAttribute('preserveAspectRatio', 'xMinYMin meet');

  const dataMax = Math.max(
    ...rows.map(r => Math.max(r.value || 0, r.max || 0, ...(r.refs || []).map(x => x.v || 0))),
    cfg.minAxis || 0);
  const max = niceMax(dataMax * 1.04);
  const plotW = W - padL - padR;
  const x = v => padL + (v / max) * plotW;

  axisTicks(max, cfg.ticks || 5).forEach(t => {
    s.appendChild(svg('line', { x1: x(t), x2: x(t), y1: padT - 6, y2: H - padB + 2, stroke: PAL.grid, 'stroke-width': 1 }));
    s.appendChild(svg('text', {
      x: x(t), y: H - padB + 18, 'text-anchor': 'middle', fill: PAL.soft,
      'font-size': 11, 'font-family': 'JetBrains Mono, monospace', text: fmt(t, max < 10 ? 1 : 0)
    }));
  });
  if (cfg.axisLabel) {
    s.appendChild(svg('text', { x: W - padR, y: 14, 'text-anchor': 'end', fill: PAL.soft, 'font-size': 11,
      'font-family': 'JetBrains Mono, monospace', text: cfg.axisLabel }));
  }

  rows.forEach((r, i) => {
    const y = padT + i * (rowH + gap);
    s.appendChild(svg('text', {
      x: padL - 10, y: y + rowH * 0.62, 'text-anchor': 'end', fill: PAL.ink, 'font-size': 12.5, text: r.label
    }));
    const g = svg('g', {});
    if (r.min !== undefined && r.max !== undefined) {
      const bw = Math.max(2, x(r.max) - x(r.min));
      const bar = svg('rect', { x: x(r.min), y: y + 4, width: bw, height: rowH - 8, rx: 4,
        fill: r.color || PAL.teal, 'fill-opacity': 0.28, stroke: r.color || PAL.teal, 'stroke-width': 1 });
      g.appendChild(bar);
      const mv = r.value !== undefined ? r.value : (r.min + r.max) / 2;
      g.appendChild(svg('circle', { cx: x(mv), cy: y + rowH / 2, r: 5.5, fill: r.color || PAL.teal,
        stroke: '#fff', 'stroke-width': 2 }));
    } else {
      g.appendChild(svg('rect', { x: padL, y: y + 4, width: Math.max(2, x(r.value) - padL), height: rowH - 8,
        rx: 4, fill: r.color || PAL.teal }));
    }
    (r.refs || []).forEach(ref => {
      const rx = x(ref.v);
      const ln = svg('line', { x1: rx, x2: rx, y1: y + 1, y2: y + rowH - 1,
        stroke: ref.c || PAL.ink, 'stroke-width': 2, 'stroke-dasharray': ref.dash || '0' });
      ln.appendChild(svg('title', { text: ref.t }));
      g.appendChild(ln);
    });
    if (r.note) {
      s.appendChild(svg('text', { x: W - padR + 6, y: y + rowH * 0.62, fill: PAL.soft, 'font-size': 11.5,
        'font-family': 'JetBrains Mono, monospace', text: r.note }));
    }
    if (r.tip) attachTip(g, () => r.tip);
    s.appendChild(g);
  });
  return s;
}

/* Gestapelter Einzelbalken (horizontal), z. B. LSCOE-Aufschluesselung */
function renderStackedBar(target, segs, cfg) {
  cfg = cfg || {};
  const s = typeof target === 'string' ? $(target) : target;
  clear(s);
  const W = cfg.width || 860, H = 132;
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  const padL = 8, padR = 26, barY = 22, barH = 44;
  const total = segs.reduce((a, b) => a + b.v, 0);
  const max = niceMax(Math.max(total, cfg.minAxis || 0) * 1.02);
  const plotW = W - padL - padR;
  const sc = v => (v / max) * plotW;

  axisTicks(max, 5).forEach(t => {
    const xx = padL + sc(t);
    s.appendChild(svg('line', { x1: xx, x2: xx, y1: barY - 8, y2: barY + barH + 6, stroke: PAL.grid, 'stroke-width': 1 }));
    s.appendChild(svg('text', { x: xx, y: barY + barH + 22, 'text-anchor': 'middle', fill: PAL.soft,
      'font-size': 11, 'font-family': 'JetBrains Mono, monospace', text: fmt(t, 0) }));
  });
  s.appendChild(svg('text', { x: padL, y: 13, fill: PAL.soft, 'font-size': 11,
    'font-family': 'JetBrains Mono, monospace', text: cfg.axisLabel || '€/MWh' }));

  let x0 = padL;
  segs.forEach(seg => {
    const w = sc(seg.v);
    if (w <= 0) return;
    const g = svg('g', {});
    g.appendChild(svg('rect', { x: x0, y: barY, width: Math.max(0.5, w - 2), height: barH, rx: 3, fill: seg.c }));
    if (w > 44) {
      g.appendChild(svg('text', { x: x0 + w / 2 - 1, y: barY + barH / 2 + 4, 'text-anchor': 'middle',
        fill: '#fff', 'font-size': 11.5, 'font-weight': 600, 'font-family': 'JetBrains Mono, monospace',
        text: fmt(seg.v, 0) }));
    }
    attachTip(g, () => '<b>' + seg.l + '</b>' + fmt(seg.v, 1) + ' €/MWh · ' +
      pct(total ? seg.v / total : 0, 1) + ' der Systemkosten');
    s.appendChild(g);
    x0 += w;
  });

  s.appendChild(svg('text', { x: padL + sc(total) + 8, y: barY + barH / 2 + 5, fill: PAL.ink,
    'font-size': 13, 'font-weight': 600, 'font-family': 'JetBrains Mono, monospace',
    text: fmt(total, 1) + ' €/MWh' }));
  return s;
}

/* Fortschrittsbalken (Zielerreichung) als HTML, damit die Labels umbrechen */
function renderProgress(container, rows) {
  const box = typeof container === 'string' ? $(container) : container;
  clear(box);
  rows.forEach(r => {
    const wrap = el('div', { style: 'margin:0 0 18px' });
    wrap.appendChild(el('div', { style: 'display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:5px',
      html: '<span><strong>' + r.label + '</strong> ' + (r.badge || '') + '</span>' +
            '<span style="font-family:JetBrains Mono,monospace;color:' + PAL.soft + '">' +
            fmt(r.ist, 1) + ' / ' + fmt(r.ziel, 0) + ' GW</span>' }));
    const track = el('div', { style: 'position:relative;height:26px;background:' + PAL.grid +
      ';border-radius:6px;border:1px solid ' + PAL.line + ';overflow:hidden' });
    const w = Math.max(0, Math.min(100, r.ist / r.ziel * 100));
    track.appendChild(el('div', { style: 'position:absolute;left:0;top:0;bottom:0;width:' + w +
      '%;background:' + r.color + ';border-radius:5px 0 0 5px' }));
    track.appendChild(el('div', { style: 'position:absolute;left:10px;top:3px;font-family:JetBrains Mono,monospace;' +
      'font-size:12.5px;font-weight:600;color:#fff;mix-blend-mode:normal', text: fmt(r.pct, 0) + ' %' }));
    wrap.appendChild(track);
    wrap.appendChild(el('div', { style: 'font-size:12.5px;color:' + PAL.soft + ';margin-top:5px', html: r.note }));
    box.appendChild(wrap);
  });
}

/* ---------------------------------------------------------------------
   5 - Globaler Zustand und Bootstrap
   --------------------------------------------------------------------- */
const S = { params: null, profilesRaw: null, profiles: null, page: null, vectors: null,
  mcRef: null, srcIndex: {}, test: null };

const DATA_FILES = {
  params: 'strommix/data/model_params.json',
  profilesRaw: 'strommix/data/profiles_2024.json',
  page: 'strommix/data/page_data.json',
  vectors: 'strommix/data/test_vectors.json',
  mcRef: 'strommix/data/monte_carlo_reference.json'
};

async function boot() {
  const banner = $('#databanner');
  banner.innerHTML = '<span class="badge-ok badge-wait">Daten werden geladen …</span>';
  try {
    const entries = await Promise.all(Object.entries(DATA_FILES).map(async ([k, url]) => {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error(url + ' → HTTP ' + r.status);
      return [k, await r.json()];
    }));
    entries.forEach(([k, v]) => { S[k] = v; });
  } catch (err) {
    const isFile = location.protocol === 'file:';
    banner.innerHTML =
      '<div class="note crit"><strong>Die Daten konnten nicht geladen werden.</strong><br>' +
      (isFile
        ? 'Die Seite wurde direkt aus dem Dateisystem geöffnet (<code>file://</code>). Browser blockieren ' +
          'in diesem Fall das Nachladen der JSON-Dateien. Bitte einen lokalen Webserver starten:<br>' +
          '<code>cd &lt;Repo-Wurzel&gt; &amp;&amp; python3 -m http.server 8000</code><br>' +
          'und dann <code>http://localhost:8000/whitepaper-strommix.html</code> aufrufen.'
        : 'Fehlermeldung: <code>' + String(err.message || err) + '</code>. Liegt der Ordner ' +
          '<code>strommix/data/</code> neben dieser Datei?') +
      '</div>';
    console.error('[strommix] Laden fehlgeschlagen:', err);
    return;
  }

  S.profiles = buildProfiles(S.profilesRaw, S.params);
  S.page.sources.forEach(s => { S.srcIndex[s.id] = s; });

  /* Selbsttest */
  let test;
  try {
    test = runSelfTest(S.vectors, S.params, S.profiles);
  } catch (e) {
    test = { checked: 0, fails: [{ path: 'exception', expected: 0, actual: String(e) }], tol: 0.005 };
  }
  S.test = test;
  renderVerification(test);

  banner.innerHTML = '';
  renderTransparency();
  renderMethodik();
  renderPartA();
  renderPartB();
  renderPartC();
  renderPartD();
  renderConclusion();
  renderExecSummary();
  renderSources();
  setupChapterNav();
  applySimLabels();
  buildCitations();

  /* Monte Carlo laeuft nach dem ersten Rendern, damit die Seite sofort steht.
     Danach: Kapitel 6 fuellen, Paritaet ins Verifikations-Badge nachtragen. */
  setTimeout(() => {
    mcRunAll().then(res => {
      MC.res = res;
      MC.done = true;
      const mc = mcParityTest(res);
      S.test = { checked: test.checked, fails: test.fails.concat(mc.fails), tol: test.tol,
        mcChecked: mc.checked };
      renderVerification(S.test);
      $('#mc-progress').innerHTML = '<span class="badge-ok">✓ ' +
        fmt(MC_N_DRAWS * MC_CONFIGS.length * (MC.order || []).length, 0) + ' Ziehungen in ' +
        fmt(MC.ms, 0) + ' ms</span>';
      renderMcChapter();
      renderExecSummary();
      window.__strommixMcDone = true;
    });
  }, 0);
}

function renderVerification(test) {
  const ok = test.fails.length === 0;
  const box = $('#verify-badge');
  const mcPart = test.mcChecked ? ' + ' + test.mcChecked + ' Monte-Carlo-Perzentile' : '';
  box.innerHTML = ok
    ? '<span class="badge-ok">✓ Modell verifiziert — ' + test.checked + ' Testvektoren' + mcPart +
      ', Toleranz ' + fmt(test.tol * 100, 1) + ' %</span>'
    : '<span class="badge-ok badge-bad">✗ Modell NICHT verifiziert — ' + test.checked +
      ' Testvektoren' + mcPart + ', davon ' + test.fails.length + ' Einzelwerte außerhalb der Toleranz ' +
      '(Details in der Browser-Konsole)</span>';
  if (ok) {
    console.log('%c[strommix] Selbsttest bestanden', 'color:#0E6E7A;font-weight:600',
      test.checked + ' Testvektoren' + mcPart + ', Toleranz ' + (test.tol * 100) + ' %');
  } else {
    console.error('[strommix] Selbsttest FEHLGESCHLAGEN — Abweichungen:');
    console.table(test.fails.map(f => ({
      Pfad: f.path, Erwartet: f.expected, Berechnet: f.actual,
      'Abweichung %': isFinite(f.dev) ? (f.dev * 100).toFixed(4) : '–'
    })));
  }
}

/* Quellen-Chips mit Nummer und Popover */
function buildCitations() {
  const pop = $('#pop');
  $$('sup.cite').forEach(node => {
    if (node.dataset.done) return;
    node.dataset.done = '1';
    const src = S.srcIndex[node.dataset.src];
    if (!src) { node.remove(); return; }
    node.textContent = '[' + src.nr + ']';
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', 'Quelle ' + src.nr + ': ' + src.title);
    const open = (e) => {
      pop.innerHTML = '<b>[' + src.nr + '] ' + src.title + '</b>' +
        (src.publisher || '') + (src.date ? ' · ' + src.date : '') + ' ' + confBadge(src.confidence) + '<br>' +
        (src.note ? '<em>' + src.note + '</em><br>' : '') +
        '<a href="' + src.url + '" target="_blank" rel="noopener">' + src.url + '</a><br>' +
        '<span style="font-size:11.5px">Zugriff ' + (src.accessed || '–') +
        (src.dossier ? ' · Dossier: ' + src.dossier : '') + '</span>';
      pop.classList.add('on');
      const r = node.getBoundingClientRect();
      let left = r.left + window.scrollX;
      const pw = Math.min(340, window.innerWidth - 24);
      if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
      pop.style.left = Math.max(8, left) + 'px';
      pop.style.top = (r.bottom + window.scrollY + 6) + 'px';
      e.stopPropagation();
    };
    node.addEventListener('click', open);
    node.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(e); } });
  });
  document.addEventListener('click', () => pop.classList.remove('on'));
}

/* Label "Datenbasis Jul–Dez 2024" — Text kommt aus meta.data_completeness */
function simLabelText(short) {
  if (S.profilesRaw.meta.data_completeness === 'FULL') return null;
  const cov = S.profiles.series.load_mw.coverage || {};
  const from = (cov.period_start || '').slice(0, 10), to = (cov.period_end || '').slice(0, 10);
  const mon = (d) => { const m = d.slice(5, 7); return ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'][+m - 1]; };
  const span = mon(from) + '–' + mon(to) + ' ' + from.slice(0, 4);
  return short ? '◐ ' + span : 'Datenbasis ' + span + ' (hochgerechnet)';
}

function applySimLabels() {
  const txt = simLabelText(), shortTxt = simLabelText(true);
  $$('.simlabel.simdata').forEach(n => {
    if (!txt) { n.remove(); return; }
    n.textContent = n.classList.contains('short') ? shortTxt : txt;
    n.title = 'Nur ' + S.profiles.hours + ' von ' + (S.profiles.series.load_mw.coverage.hours_expected || 8784) +
      ' Jahresstunden liegen vor; die Mengen werden über den Lastanteil des Zeitraums hochgerechnet.';
  });
}

/* Kapitel 3 - Methodik. Alle Zahlen aus den Daten, keine im Markup. */
function renderMethodik() {
  const G = S.page.ges;
  const vecCount = ['crf', 'idc', 'lcoe', 'mix'].reduce((a, k) => a + (S.vectors[k] || []).length, 0);
  const pm = S.page.profiles_meta;
  const val = S.params.system.grid;

  $('#meth-validation').innerHTML = [
    '<strong>Gegen die geprüfte Studie.</strong> Mit den Annahmen der GES-Studie reproduziert das ' +
      'Modell deren vier LCOE-Werte auf <strong><span class="ges-repro-dev">±' +
      fmt(G.lcoe_reproduction_max_deviation_pct, 2) + ' %</span></strong> genau. Abweichungen bei den ' +
      'Systemkosten sind damit eine Frage der Eingangsdaten, nicht der Rechenmethode.',
    '<strong>Gegen das Ist-Jahr.</strong> Mit den realen Kapazitäten 2024 trifft die stündliche ' +
      'Simulation die realen Jahressummen der Profile auf ±0,06&nbsp;% ' +
      '(<code>research/validierung_modell.md</code>).',
    '<strong>Gegen die eigene Referenzimplementierung.</strong> Diese Seite rechnet beim Laden ' +
      '<strong>' + vecCount + ' Testvektoren</strong> aus <code>data/test_vectors.json</code> nach ' +
      '(Toleranz ' + fmt((S.vectors.meta && S.vectors.meta.tolerance_relative || 0.005) * 100, 1) +
      '&nbsp;%) und zusätzlich die Monte-Carlo-Mediane aus Kapitel 6. Das Ergebnis steht im Badge ' +
      'ganz unten — schlägt eine Prüfung fehl, sagt die Seite das, statt es zu verstecken.',
    '<strong>Gegen publizierte LCOE Dritter.</strong> Die Vergleichslinien in Kapitel 4 ' +
      '(Fraunhofer&nbsp;ISE, Lazard, IRENA, BNetzA-Zuschlagswerte, Hinkley-CfD) sind keine Dekoration, ' +
      'sondern der Plausibilitätstest für jeden Modellbalken.'
  ].map(x => '<li>' + x + '</li>').join('');

  $('#meth-mc').innerHTML = 'Die Monte-Carlo-Rechnung in Kapitel 6 zieht ' +
    mcDrawPlan(S.params).length + ' Parameter gleichzeitig als Dreiecksverteilung, ' +
    fmt(MC_N_DRAWS, 0) + '-mal je Szenario, mit festem Startwert und einem eigenen ' +
    'Zufallszahlengenerator — damit Python-Referenz und Browser bitgleich dieselbe Ziehungsfolge ' +
    'erzeugen. Die zentrale Vereinfachung dabei: Der stündliche Dispatch wird je Szenario einmal ' +
    'gerechnet und wiederverwendet, die Ziehungen wirken nur auf die Kostenseite. Was das genau ' +
    'bedeutet und was <em>nicht</em> variiert wird, steht in Kapitel 6 und in den Limitationen.';

  $('#meth-repro').innerHTML = 'Diese Seite rechnet nichts, was nicht auch offline nachrechenbar wäre: ' +
    'Modell (<code>scripts/model.py</code>), Parametersatz (<code>data/model_params.json</code>, jeder ' +
    'Wert mit Spanne, Einheit, Quelle und Konfidenzstufe), Profile (<code>data/profiles_2024.json</code>, ' +
    'aktuell <code>' + pm.data_completeness + '</code> mit ' + S.profiles.hours + ' Stunden) und die ' +
    'Referenzläufe liegen im Repository — Details und Links im <a href="#anhang">Anhang</a>. ' +
    'Netzkosten gehen top-down mit ' + fmt(val.investment_bn_eur_until_2045.value, 0) + '&nbsp;Mrd.&nbsp;€ ' +
    'Investitionsvolumen ein ' + confBadge(val.investment_bn_eur_until_2045.confidence) +
    ', linear mit dem fEE-Anteil skaliert — dieselbe Vereinfachung wie in der GES-Studie, inklusive ' +
    'derselben Limitation.';

  /* Der CRF-Hebel in Kapitel 4: Zahlen aus den Daten statt im Markup. */
  const ws = S.page.wacc_sensitivity.wacc_effect_at_60y;
  $('#wacc-crf-note').innerHTML = 'Bei 60&nbsp;Jahren Lebensdauer steigt der ' +
    'Kapitalwiedergewinnungsfaktor von ' + fmt(ws['0.03'] * 100, 3) + '&nbsp;% (WACC 3&nbsp;%) auf ' +
    fmt(ws['0.10'] * 100, 3) + '&nbsp;% (WACC 10&nbsp;%) — <strong>Faktor ' +
    fmt(ws.factor_3pct_to_10pct, 2) + '</strong>.';
}

function renderTransparency() {
  $('#limit-fulltext').innerHTML = '<strong>Erstens:</strong> Der Volltext-Abruf war für praktisch ' +
    'alle Primärquellen-Domains durch die Netzwerk-Egress-Policy der Arbeitsumgebung blockiert. Die ' +
    'Werte stammen daher aus Suchindex-Zusammenfassungen der genannten Quellen, nicht aus selbst ' +
    'gelesenem PDF-Volltext. Die Konfidenzstufen bilden das bereits ab; vor einer Verwendung in ' +
    'Entscheidungen sind die Werte am Original zu prüfen.';
  const txt = simLabelText();
  $('#limit-partial').innerHTML = txt
    ? ' <strong>Zweitens:</strong> Die stündliche Simulation in Teil&nbsp;C läuft auf einem ' +
      '<strong>Halbjahresprofil</strong> (' + S.profiles.hours + ' von ' +
      (S.profiles.series.load_mw.coverage.hours_expected || 8784) + ' Stunden, ' +
      (S.profiles.series.load_mw.coverage.period_start || '').slice(0, 10) + ' bis ' +
      (S.profiles.series.load_mw.coverage.period_end || '').slice(0, 10) + '). Alle daraus abgeleiteten ' +
      'Zahlen tragen das Label „' + txt + '“.' + cite('smard-mirror-2024')
    : ' <strong>Zweitens:</strong> Die stündliche Simulation läuft auf einem vollständigen Jahresprofil.';
}

/* ---------------------------------------------------------------------
   6 - Kapitel 2: Ist-Zustand
   --------------------------------------------------------------------- */
const MIX_COLORS = {
  wind_onshore: PAL.windon, photovoltaik: PAL.pv, erdgas: PAL.gas, braunkohle: '#6b5344',
  biomasse: '#7f9a3c', wind_offshore: PAL.windoff, steinkohle: '#4a4a48',
  wasserkraft: PAL.teal, mineraloel_sonstige_abfall: '#9aa0a6', kernenergie: PAL.band
};
const MIX_LABELS = {
  wind_onshore: 'Wind onshore', photovoltaik: 'Photovoltaik', erdgas: 'Erdgas',
  braunkohle: 'Braunkohle', biomasse: 'Biomasse', wind_offshore: 'Wind offshore',
  steinkohle: 'Steinkohle', wasserkraft: 'Wasserkraft (ohne Pumpspeicher)',
  mineraloel_sonstige_abfall: 'Mineralöl / Sonstige / Abfall', kernenergie: 'Kernenergie'
};

function renderPartA() {
  const P = S.page;
  const mix = P.ist_mix['2025'];
  const total = mix.bruttostromerzeugung_gesamt_inkl_pse;

  /* --- Ist-Mix --------------------------------------------------------- */
  const rows = Object.entries(mix.traeger_twh).map(([k, v]) => {
    const val = (v.wert !== undefined && v.wert !== null) ? v.wert : ((v.low + v.high) / 2);
    return {
      key: k, label: MIX_LABELS[k] || k, value: val,
      min: v.low, max: v.high, color: MIX_COLORS[k] || PAL.soft,
      derived: !!v.derived, conf: v.confidence, hint: v.hinweis || '',
      note: fmt(val, 1) + ' TWh · ' + fmt(val / total * 100, 1) + ' %'
    };
  }).sort((a, b) => b.value - a.value);

  rows.forEach(r => {
    r.tip = '<b>' + r.label + '</b>' + fmt(r.value, 1) + ' TWh (' + fmt(r.value / total * 100, 1) + ' % der ' +
      'Bruttostromerzeugung)' + (r.min !== undefined ? '<br>Spanne ' + fmt(r.min, 1) + '–' + fmt(r.max, 1) + ' TWh' : '') +
      (r.derived ? '<br><em>abgeleitet (Differenzrechnung), nicht direkt aus der Quelltabelle</em>' : '') +
      (r.hint ? '<br><em>' + r.hint + '</em>' : '');
  });
  renderHBars('#chart-mix', rows, { axisLabel: 'TWh', padL: 200, padR: 120, rowH: 26 });
  $('#mix-sub').innerHTML = 'Gesamt ' + fmt(total, 1) + ' TWh inkl. Pumpspeichererzeugung · ' +
    'erneuerbar ' + fmt(mix.erneuerbare_gesamt, 1) + ' TWh (' + fmt(mix.erneuerbare_gesamt / total * 100, 1) +
    ' % <strong>der Bruttostromerzeugung</strong> — das ist die fünfte der oben genannten ' +
    'Abgrenzungen, nicht der Anteil am Verbrauch) · fossil ' + fmt(mix.fossil_gesamt, 1) + ' TWh · ' +
    'Kernenergie ' + fmt(mix.traeger_twh.kernenergie.wert, 1) + ' TWh ' +
    confBadge(mix.confidence) + cite('ageb-strerz-2025');
  legend('#legend-mix', [
    { c: PAL.teal, l: 'Wind offshore, Steinkohle und Wasserkraft sind aus der EE-Summe zurückgerechnet, nicht direkt abgelesen — im Tooltip gekennzeichnet.' }
  ]);

  $('#ee-share-note').innerHTML = 'Für dieses Papier gilt: <strong>' +
    fmt(mix.ee_anteil_bruttostromverbrauch_prozent.low, 0) + '–' +
    fmt(mix.ee_anteil_bruttostromverbrauch_prozent.high, 0) +
    ' %</strong> am Bruttostromverbrauch ' + confBadge(mix.ee_anteil_bruttostromverbrauch_prozent.confidence) +
    ' und <strong>' + fmt(mix.oeffentliche_nettoerzeugung_ise.ee_anteil_prozent, 1) +
    ' %</strong> an der öffentlichen Nettostromerzeugung ' +
    confBadge(mix.oeffentliche_nettoerzeugung_ise.confidence) + cite('ise-stromerzeugung-2025') +
    ' — die beiden Werte messen Verschiedenes und dürfen nicht gegeneinander ausgespielt werden.';

  /* --- Kacheln --------------------------------------------------------- */
  const inst = P.installierte_leistung_gw.stand_jahresende_2025;
  const h1 = P.ist_mix['2026_h1'];
  const bat = P.installierte_leistung_gw.batteriespeicher;
  const preise = P.preise;
  /* Zwei Dossiers nennen unterschiedliche Werte fuer 2025 (573 vs. 575 h).
     Beide werden ausgewiesen statt einer als Fakt gesetzt. */
  const negStd2025 = P.netz_und_systemkosten.negative_strompreise_stunden
    .find(x => x.jahr === 2025) || { stunden: null };
  const tiles = [
    { n: fmt(mix.oeffentliche_nettoerzeugung_ise.photovoltaik_gesamt, 0) + ' TWh',
      l: 'Photovoltaik 2025 (+' + fmt(mix.oeffentliche_nettoerzeugung_ise.pv_wachstum_prozent, 0) +
         ' % ggü. 2024) — erstmals vor der Braunkohle, gemessen an der öffentlichen ' +
         'Nettostromerzeugung ' + confBadge(mix.oeffentliche_nettoerzeugung_ise.confidence) +
         cite('ise-stromerzeugung-2025') },
    { n: fmt(inst.erneuerbare_gesamt.wert, 0) + ' GW',
      l: 'installierte EE-Leistung Ende 2025, Zubau ' + fmt(inst.erneuerbare_gesamt.zubau_2025, 0) +
         ' GW im Jahr ' + confBadge(inst.erneuerbare_gesamt.confidence) },
    { n: fmt(h1.ee_anteil_bruttostromverbrauch_prozent, 0) + ' %',
      l: 'EE-Anteil am Bruttostromverbrauch im 1. Halbjahr 2026 ' + confBadge(h1.confidence) },
    { n: fmt(bat.leistung_gw.low, 1) + '–' + fmt(bat.leistung_gw.high, 1) + ' GW',
      l: 'Batteriespeicher (' + fmt(bat.kapazitaet_gwh.low, 1) + '–' + fmt(bat.kapazitaet_gwh.high, 1) +
         ' GWh), Stand ' + bat.stand + ' ' + confBadge(bat.leistung_gw.confidence) },
    { n: fmt(preise.negative_preisstunden['2025_gesamt'], 0) + ' h',
      l: 'Stunden mit negativem Börsenstrompreis 2025 (Rekord); H1 2026: ' +
         fmt(preise.negative_preisstunden['2026_h1'], 0) + ' h, aber tiefer ' + confBadge('B') +
         ' — die Dossiers nennen ' +
         fmt(negStd2025.stunden, 0) + ' und ' + fmt(preise.negative_preisstunden['2025_gesamt'], 0) +
         ' h; die Differenz ist nicht aufgelöst' },
    { n: fmt(preise.boersenstrompreis_jahresmittel_eur_mwh['2025'].wert, 1) + ' €/MWh',
      l: 'Börsenstrompreis 2025 im Jahresmittel; H1 2026: ' +
         fmt(preise.boersenstrompreis_jahresmittel_eur_mwh['2026_h1'].wert, 0) + ' €/MWh ' +
         confBadge(preise.boersenstrompreis_jahresmittel_eur_mwh['2025'].confidence) }
  ];
  const box = $('#tiles-a'); clear(box);
  tiles.forEach(t => box.appendChild(el('div', { cls: 'tile',
    html: '<div class="n">' + t.n + '</div><div class="l">' + t.l + '</div>' })));

  /* --- Zielerreichung -------------------------------------------------- */
  const z = P.zielpfade.zielerreichung_anfang_2026;
  /* Restjahre nicht hartcodieren, sondern aus den Daten ableiten:
     Restleistung / erforderlicher Jahreszubau. */
  const restJahre = z.photovoltaik.rest_gw / z.photovoltaik.erforderlich_gw_pro_jahr;
  /* Die Reihen haben unterschiedliche Stichtage - das gehoert an den Balken,
     nicht nur in die Chart-Ueberschrift. */
  const standLand = 'Stand Jahresende 2025';
  const standOff = 'Stand ' + deDatum(P.zielpfade.offshore_pipeline_gw.stand);
  renderProgress('#chart-ziele', [
    { label: 'Photovoltaik', ist: z.photovoltaik.ist_gw, ziel: z.photovoltaik.ziel_gw,
      pct: z.photovoltaik.erreichung_prozent, color: PAL.pv, badge: confBadge('A') + cite('eeg-2023'),
      note: 'Noch ' + fmt(z.photovoltaik.rest_gw, 0) + ' GW in ' + fmt(restJahre, 0) + ' Jahren → <strong>' +
        fmt(z.photovoltaik.erforderlich_gw_pro_jahr, 1) + ' GW/a</strong> nötig, Ist-Zubau 2025 ' +
        fmt(z.photovoltaik.ist_zubau_2025, 1) + ' GW — Faktor ' + fmt(z.photovoltaik.luecke_faktor, 1) + '×. ' +
        '<em>' + standLand + '.</em>' },
    { label: 'Wind onshore', ist: z.wind_onshore.ist_gw, ziel: z.wind_onshore.ziel_gw,
      pct: z.wind_onshore.erreichung_prozent, color: PAL.windon, badge: confBadge('A'),
      note: 'Noch ' + fmt(z.wind_onshore.rest_gw, 0) + ' GW → <strong>' +
        fmt(z.wind_onshore.erforderlich_gw_pro_jahr, 1) + ' GW/a</strong>, Ist-Zubau 2025 ' +
        fmt(z.wind_onshore.ist_zubau_2025, 1) + ' GW — Faktor ' + fmt(z.wind_onshore.luecke_faktor, 1) +
        '×. Genehmigungen laufen dem realisierten Zubau 2–3 Jahre voraus. <em>' + standLand + '.</em>' },
    { label: 'Wind offshore', ist: z.wind_offshore.ist_gw, ziel: z.wind_offshore.ziel_gw,
      pct: z.wind_offshore.erreichung_prozent, color: PAL.windoff,
      badge: confBadge('A') + cite('offshore-stiftung-2025'),
      note: 'Noch ' + fmt(z.wind_offshore.rest_gw, 1) + ' GW → <strong>' +
        fmt(z.wind_offshore.erforderlich_gw_pro_jahr, 1) + ' GW/a</strong>, Zubau 2025 ' +
        fmt(z.wind_offshore.ist_zubau_2025, 0) + ' GW. Ein Lückenfaktor lässt sich hier ' +
        '<em>nicht</em> bilden — der Zubau war null; der Sprung geht von 0 auf ' +
        fmt(z.wind_offshore.erforderlich_gw_pro_jahr, 1) + ' GW/a. <em>' + standOff + '.</em>' }
  ]);
  const pipe = P.zielpfade.offshore_pipeline_gw;
  $('#ziele-note').innerHTML = '<strong>Die Bewertung stammt aus den Quellen, nicht von uns.</strong> ' +
    'Die Stiftung OFFSHORE-WINDENERGIE stellt fest: Das Ziel 2030 ist zeitlich nicht mehr zu ' +
    'erreichen; das Ziel 2035 (40 GW) wäre bei plangemäßer Umsetzung aller Projekte erreichbar; ' +
    'für 2045 (70 GW) sind weitere Festlegungen erforderlich.' +
    cite('offshore-stiftung-2025') + ' Die Pipeline (Stand ' + pipe.stand + '): ' +
    fmt(pipe.in_betrieb, 1) + ' GW in Betrieb, ' + fmt(pipe.im_bau, 1) + ' GW im Bau, ' +
    fmt(pipe.finale_investitionsentscheidung, 1) + ' GW mit finaler Investitionsentscheidung, ' +
    fmt(pipe.zuschlag_oder_netzanbindungsanspruch, 1) + ' GW mit Zuschlag oder Netzanbindungsanspruch. ' +
    'Bei Photovoltaik ist die Lücke am kleinsten, bei Wind onshore erfordert sie eine Verdopplung des Zubaus.';

  /* --- Bedarfsprojektionen -------------------------------------------- */
  const b = P.bedarfsprojektionen_twh;
  const bedRows = [
    { label: '2024 · Ist (NEP-Basisjahr)', min: b.basis_2024, max: b.basis_2024, value: b.basis_2024,
      color: PAL.ink, note: fmt(b.basis_2024, 0) + ' TWh',
      tip: '<b>Bruttostromverbrauch 2024</b>NEP-Basisjahr, ' + fmt(b.basis_2024, 0) + ' TWh' },
    { label: '2030 · alte EEG-Annahme (2023)', min: b['2030'].eeg_novelle_2023_alte_annahme,
      max: b['2030'].eeg_novelle_2023_alte_annahme, value: b['2030'].eeg_novelle_2023_alte_annahme,
      color: '#9aa0a6', note: '≈ ' + fmt(b['2030'].eeg_novelle_2023_alte_annahme, 0) + ' TWh',
      tip: '<b>2030 — überholte Annahme</b>Der Monitoringbericht 2025 hat sie als zu hoch eingestuft.' },
    { label: '2030 · BMWK-Langfristszenarien', min: b['2030'].bmwk_langfristszenarien.low,
      max: b['2030'].bmwk_langfristszenarien.high, value: (b['2030'].bmwk_langfristszenarien.low + b['2030'].bmwk_langfristszenarien.high) / 2,
      color: PAL.teal, note: fmt(b['2030'].bmwk_langfristszenarien.low, 0) + '–' + fmt(b['2030'].bmwk_langfristszenarien.high, 0),
      tip: '<b>BMWK-Langfristszenarien (LFS3)</b>' + fmt(b['2030'].bmwk_langfristszenarien.low, 0) + '–' +
        fmt(b['2030'].bmwk_langfristszenarien.high, 0) + ' TWh' },
    { label: '2030 · Monitoringbericht 2025', min: b['2030'].monitoringbericht_2025_ewi_bet.low,
      max: b['2030'].monitoringbericht_2025_ewi_bet.high,
      value: (b['2030'].monitoringbericht_2025_ewi_bet.low + b['2030'].monitoringbericht_2025_ewi_bet.high) / 2,
      color: PAL.accent, note: fmt(b['2030'].monitoringbericht_2025_ewi_bet.low, 0) + '–' + fmt(b['2030'].monitoringbericht_2025_ewi_bet.high, 0),
      tip: '<b>Monitoringbericht Energiewende (EWI/BET, 15.09.2025)</b>Senkte die 2030er Annahme von rund 750 auf 600–700 TWh.' },
    { label: '2037 · NEP 2037/2045 (2025)', min: b['2037'].nep_2037_2045_v2025.low,
      max: b['2037'].nep_2037_2045_v2025.high,
      value: (b['2037'].nep_2037_2045_v2025.low + b['2037'].nep_2037_2045_v2025.high) / 2,
      color: PAL.windoff, note: fmt(b['2037'].nep_2037_2045_v2025.low, 0) + '–' + fmt(b['2037'].nep_2037_2045_v2025.high, 0),
      tip: '<b>NEP 2037/2045 V2025, Szenarien A/B/C</b>' },
    { label: '2045 · NEP 2037/2045 (2025)', min: b['2045'].nep_2037_2045_v2025.low,
      max: b['2045'].nep_2037_2045_v2025.high,
      value: (b['2045'].nep_2037_2045_v2025.low + b['2045'].nep_2037_2045_v2025.high) / 2,
      color: PAL.windoff, note: fmt(b['2045'].nep_2037_2045_v2025.low, 0) + '–' + fmt(b['2045'].nep_2037_2045_v2025.high, 0),
      tip: '<b>NEP 2037/2045 V2025, Szenarien A/B/C</b>Die Simulation in Kapitel 5 nutzt 950 TWh als Vorgabewert (unteres Ende).' }
  ];
  renderHBars('#chart-bedarf', bedRows, { axisLabel: 'TWh/a', padL: 250, padR: 110, rowH: 28 });
  $('#bedarf-note').innerHTML = '<strong>Warum das für die Kosten zählt.</strong> ' + b.revision_hinweis +
    '.' + cite('monitoringbericht-2025') + ' Die Treiber sind benannt, aber nur teilweise quantifiziert: ' +
    'Elektrolyse ' + fmt(b.treiber.elektrolyse['2045'].low, 0) + '–' + fmt(b.treiber.elektrolyse['2045'].high, 0) +
    ' TWh bis 2045 ' + confBadge(b.treiber.elektrolyse['2045'].confidence) + cite('nep-2037-2045') +
    ', IT/Rechenzentren bis ' + fmt(b.treiber.rechenzentren['2045_it_stromverbrauch_max'], 0) + ' TWh ' +
    confBadge(b.treiber.rechenzentren.confidence) + '. Für Wärmepumpen, E-Mobilität und ' +
    'Batteriezellfertigung liegt <strong>keine belegbare Aufschlüsselung</strong> vor — eine offene Lücke, ' +
    'die in jedem Systemvergleich durchschlägt.';
}

/* ---------------------------------------------------------------------
   7 - Kapitel 4: LCOE-Rechner
   --------------------------------------------------------------------- */
const LCOE_TECHS = [
  { key: 'pv_freiflaeche', label: 'PV Freifläche', color: PAL.pv },
  { key: 'pv_dach_gross',  label: 'PV Dach (Gewerbe)', color: '#d4a83c' },
  { key: 'wind_onshore',   label: 'Wind onshore', color: PAL.windon },
  { key: 'wind_offshore',  label: 'Wind offshore', color: PAL.windoff },
  { key: 'nuclear',        label: 'Kernkraft (EU-Neubau)', color: PAL.band },
  { key: 'gas_ccgt',       label: 'Gas GuD', color: PAL.gas },
  { key: 'gas_ocgt',       label: 'Gas OCGT (Peaker)', color: '#c9793c' }
];

const LC = { tech: 'nuclear', capex: null, flh: null, wacc: 0.05, co2: 75, idc: true, refs: true, shadow: null };

function techParam(key, field) { return S.params.technologies[key].params[field]; }

function lcoeRefs(key) {
  const B = S.page.lcoe_benchmarks, G = S.page.ges.reference.technologies, out = [];
  const push = (v, c, t, dash) => { if (v !== undefined && v !== null) out.push({ v: v, c: c, t: t, dash: dash || '0' }); };
  if (key === 'pv_freiflaeche') {
    push(B.pv_freiflaeche.reference.min, PAL.soft, 'Fraunhofer ISE 2024, untere Grenze: ' + B.pv_freiflaeche.reference.min + ' €/MWh', '3 3');
    push(B.pv_freiflaeche.reference.max, PAL.soft, 'Fraunhofer ISE 2024, obere Grenze: ' + B.pv_freiflaeche.reference.max + ' €/MWh', '3 3');
    push(B.pv_freiflaeche.auction.mid, PAL.teal, 'BNetzA-Ausschreibung 03/2026, mengengewichtet: ' + B.pv_freiflaeche.auction.mid + ' €/MWh');
    push(G.pv.lcoe, PAL.accent, 'Annahme der GES-Studie: ' + G.pv.lcoe + ' €/MWh');
  } else if (key === 'wind_onshore') {
    push(B.wind_onshore.reference.min, PAL.soft, 'Fraunhofer ISE 2024, untere Grenze', '3 3');
    push(B.wind_onshore.reference.max, PAL.soft, 'Fraunhofer ISE 2024, obere Grenze', '3 3');
    const a = B.wind_onshore.auction[B.wind_onshore.auction.length - 1];
    push(a.weighted_avg, PAL.teal, 'BNetzA-Ausschreibung ' + a.date + ', mengengewichtet: ' + a.weighted_avg + ' €/MWh');
    push(G.wind_onshore.lcoe, PAL.accent, 'Annahme der GES-Studie: ' + G.wind_onshore.lcoe + ' €/MWh (1.700 Volllaststunden)');
  } else if (key === 'wind_offshore') {
    push(B.wind_offshore.reference.min, PAL.soft, 'Fraunhofer ISE 2024, untere Grenze', '3 3');
    push(B.wind_offshore.reference.max, PAL.soft, 'Fraunhofer ISE 2024, obere Grenze', '3 3');
    /* beide Lazard-Grenzen, sonst wirkt Offshore einseitig teuer */
    push(B.wind_offshore.lazard_2026.min, PAL.teal, 'Lazard LCOE+ 2026, untere Grenze: ' + B.wind_offshore.lazard_2026.min + ' €/MWh');
    push(B.wind_offshore.lazard_2026.max, PAL.teal, 'Lazard LCOE+ 2026, obere Grenze: ' + B.wind_offshore.lazard_2026.max + ' €/MWh');
    push(B.wind_offshore.irena_europe.value, PAL.soft, 'IRENA Europa: ' + B.wind_offshore.irena_europe.value + ' €/MWh', '3 3');
    push(G.wind_offshore.lcoe, PAL.accent, 'Annahme der GES-Studie: ' + G.wind_offshore.lcoe + ' €/MWh');
  } else if (key === 'nuclear') {
    const tp = B.nuclear.third_party;
    tp.forEach(t => {
      if (typeof t.lcoe_eur_mwh === 'number') {
        push(t.lcoe_eur_mwh, PAL.teal, t.label + ': ' + t.lcoe_eur_mwh + ' €/MWh (' + t.scope + ')');
      } else if (Array.isArray(t.lcoe_eur_mwh)) {
        push(t.lcoe_eur_mwh[0], PAL.soft, t.label + ', untere Grenze: ' + t.lcoe_eur_mwh[0] + ' €/MWh', '3 3');
        push(t.lcoe_eur_mwh[1], PAL.soft, t.label + ', obere Grenze: ' + t.lcoe_eur_mwh[1] + ' €/MWh', '3 3');
      }
    });
    push(G.nuclear.lcoe, PAL.accent, 'Annahme der GES-Studie: ' + G.nuclear.lcoe + ' €/MWh (6.000 €/kW, 8.000 h)');
  } else if (key === 'pv_dach_gross') {
    push(B.pv_freiflaeche.reference.max, PAL.soft, 'Fraunhofer ISE 2024 (PV gesamt), obere Grenze Freifläche', '3 3');
  } else if (key === 'gas_ccgt') {
    push(B.gas_ccgt.de_new.min, PAL.soft, 'FÖS 2025, Neubau DE inkl. Brennstoff, untere Grenze: ' + B.gas_ccgt.de_new.min + ' €/MWh', '3 3');
    push(B.gas_ccgt.de_new.max, PAL.soft, 'FÖS 2025, Neubau DE inkl. Brennstoff, obere Grenze: ' + B.gas_ccgt.de_new.max + ' €/MWh', '3 3');
  }
  return out;
}

function computeLcoeRows() {
  const rows = [];
  const scens = ['guenstig', 'mittel', 'teuer'];
  LCOE_TECHS.forEach(t => {
    let ov = null;
    if (t.key === LC.tech) {
      const midCapex = pickVal(techParam(t.key, 'capex_eur_kw'), 'mid');
      const midFlh = pickVal(techParam(t.key, 'full_load_hours'), 'mid');
      ov = { capexFactor: LC.capex / midCapex, flhFactor: LC.flh / midFlh };
    }
    const vals = scens.map(sc => {
      const flat = resolveTech(S.params, t.key, sc, null, LC.idc);
      if (ov) {
        flat.capex_eur_kw = flat.capex_eur_kw * ov.capexFactor;
        flat.full_load_hours = flat.full_load_hours * ov.flhFactor;
      }
      return { sc: sc, flat: flat, res: lcoe(flat, LC.wacc, LC.co2) };
    });
    const nums = vals.map(v => v.res.lcoe_eur_mwh);
    const mid = vals[1];
    const c = mid.res.components_eur_mwh;
    rows.push({
      key: t.key, label: t.label, color: t.color,
      min: Math.min(...nums), max: Math.max(...nums), value: nums[1],
      note: fmt(nums[1], 0) + ' €/MWh',
      refs: LC.refs ? lcoeRefs(t.key) : [],
      components: c, flat: mid.flat, res: mid.res,
      vals: vals,
      tip: '<b>' + t.label + '</b>' +
        'Zentralwert <b>' + fmt(nums[1], 1) + ' €/MWh</b><br>' +
        'Spanne ' + fmt(Math.min(...nums), 1) + ' – ' + fmt(Math.max(...nums), 1) + ' €/MWh<br>' +
        '<span style="opacity:.8">Kapital ' + fmt(c.kapital, 1) + ' · Fixbetrieb ' + fmt(c.fixbetrieb, 1) +
        (c.brennstoff ? ' · Brennstoff ' + fmt(c.brennstoff, 1) : '') +
        (c.entsorgung ? ' · Entsorgung ' + fmt(c.entsorgung, 1) : '') +
        (c.co2 ? ' · CO₂ ' + fmt(c.co2, 1) : '') + ' €/MWh</span><br>' +
        '<span style="opacity:.8">CAPEX ' + fmt(mid.flat.capex_eur_kw, 0) + ' €/kW · ' +
        fmt(mid.flat.full_load_hours, 0) + ' h/a · ' + fmt(mid.flat.lifetime_years, 0) + ' a · CRF ' +
        pct(mid.res.crf, 2) + (mid.res.idc_surcharge ? ' · Bauzins +' + pct(mid.res.idc_surcharge, 0) : '') + '</span>'
    });
  });
  return rows;
}

function renderLcoeTable(rows) {
  const t = el('table');
  t.innerHTML = '<thead><tr><th>Technologie</th><th class="num">günstig</th><th class="num">mittel</th>' +
    '<th class="num">teuer</th><th class="num">CAPEX €/kW</th><th class="num">VLh</th>' +
    '<th class="num">davon Kapital</th><th class="num">davon CO₂</th></tr></thead>';
  const tb = el('tbody');
  rows.forEach(r => {
    const tr = el('tr');
    tr.innerHTML = '<td>' + r.label + (r.key === LC.tech ? ' <span class="conf conf-M">Fokus</span>' : '') + '</td>' +
      r.vals.map(v => '<td class="num">' + fmt(v.res.lcoe_eur_mwh, 0) + '</td>').join('') +
      '<td class="num">' + fmt(r.flat.capex_eur_kw, 0) + '</td>' +
      '<td class="num">' + fmt(r.flat.full_load_hours, 0) + '</td>' +
      '<td class="num">' + fmt(r.components.kapital, 0) + '</td>' +
      '<td class="num">' + fmt(r.components.co2, 0) + '</td>';
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  const box = $('#table-lcoe'); clear(box); box.appendChild(t);
}

function updateLcoe() {
  const rows = computeLcoeRows();
  renderHBars('#chart-lcoe', rows, { axisLabel: '€/MWh', padL: 190, padR: 110, rowH: 32, minAxis: 200 });
  legend('#legend-lcoe', [
    { c: PAL.teal, l: 'Modellspanne (günstig – teuer), Punkt = Zentralwert' },
    { c: PAL.soft, line: true, l: 'Vergleichsband Dritter (Fraunhofer ISE / Lazard / FÖS)' },
    { c: PAL.teal, line: true, l: 'realer Marktwert (BNetzA-Zuschlag, Hinkley-CfD)' },
    { c: PAL.accent, line: true, l: 'Annahme der GES-Studie' }
  ]);
  renderLcoeTable(rows);

  const nuc = rows.find(r => r.key === 'nuclear');
  const pv = rows.find(r => r.key === 'pv_freiflaeche');
  const hpc = S.page.lcoe_benchmarks.nuclear.third_party.find(x => x.source_id === 'iwr-hinkley-2026');
  const auc = S.page.lcoe_benchmarks.pv_freiflaeche.auction;
  $('#lcoe-note').innerHTML = '<strong>Was der Regler gerade zeigt.</strong> Bei WACC ' +
    fmt(LC.wacc * 100, 1) + ' % und ' + fmt(LC.co2, 0) + ' €/t CO₂ liegt der Zentralwert für Kernkraft bei <strong>' +
    fmt(nuc.value, 0) + ' €/MWh</strong>, für PV Freifläche bei <strong>' + fmt(pv.value, 0) + ' €/MWh</strong>. ' +
    'Der einzige <em>öffentlich dokumentierte</em> vertraglich zugesicherte Strompreis für ' +
    'Neubau-Kernkraft ist der Hinkley-Point-C-CfD mit <strong>' + hpc.lcoe_eur_mwh +
    ' €/MWh</strong> (indexiert Januar 2026) ' + confBadge(srcConf('iwr-hinkley-2026')) + cite('iwr-hinkley-2026') +
    '. Polen und Tschechien haben ebenfalls staatliche Preis- bzw. Finanzierungsinstrumente, ' +
    'deren Konditionen aber nicht veröffentlicht sind. ' +
    'Die BNetzA-Freiflächenausschreibung vom März 2026 ergab mengengewichtet <strong>' +
    fmt(auc.mid, 1) + ' €/MWh</strong> Zuschlagswert ' +
    confBadge(auc.confidence) + cite('bnetza-pv-2026-03') + ' — das ist ein Marktpreis, kein Modellwert, und ' +
    'eher eine Obergrenze der Betreiber-Vollkosten über 20 Jahre.' +
    '<br><br><strong>Wichtig für den Vergleich mit den Gaslinien:</strong> Für Erdgas fehlt in allen ' +
    'Dossiers ein Brennstoffpreis (<code>gaps.gaspreis_erdgas</code>). Die Modellwerte für Gas GuD und ' +
    'Gas OCGT enthalten deshalb <strong>nur Kapital-, Fixbetriebs- und CO₂-Kosten</strong> und sind ' +
    'ausgewiesene <strong>Untergrenzen</strong>. Die FÖS-Vergleichslinien (' +
    fmt(S.page.lcoe_benchmarks.gas_ccgt.de_new.min, 0) + '–' +
    fmt(S.page.lcoe_benchmarks.gas_ccgt.de_new.max, 0) + ' €/MWh) enthalten den Brennstoff — ' +
    'der Abstand ist kein Modellbefund, sondern diese Lücke.' + cite('foes-2025');
  buildCitations();
}

/* Konfidenzstufe einer Quelle aus dem Quellenregister (statt hartcodiert). */
function srcConf(id) { return (S.srcIndex[id] || {}).confidence || 'C'; }

function setLcoeTech(key) {
  LC.tech = key;
  const midCapex = pickVal(techParam(key, 'capex_eur_kw'), 'mid');
  const midFlh = pickVal(techParam(key, 'full_load_hours'), 'mid');
  LC.capex = midCapex; LC.flh = midFlh;

  const capexEl = $('#lc-capex'), flhEl = $('#lc-flh');
  capexEl.min = Math.max(100, Math.round(midCapex * 0.35 / 50) * 50);
  capexEl.max = Math.round(midCapex * 2.2 / 50) * 50;
  capexEl.step = midCapex > 5000 ? 100 : 25;
  capexEl.value = midCapex;
  flhEl.min = Math.max(100, Math.round(midFlh * 0.4 / 25) * 25);
  flhEl.max = Math.min(8600, Math.round(midFlh * 1.6 / 25) * 25);
  flhEl.value = midFlh;

  /* CAPEX-Presets */
  const p = techParam(key, 'capex_eur_kw');
  const presets = [];
  if (key === 'nuclear') {
    const sc = S.page.nuclear_capex_scenarios;
    presets.push({ v: sc.low, l: 'EU-Serie 7.500' }, { v: sc.mid, l: 'EU-Mittel 12.000' }, { v: sc.high, l: 'Erstprojekt 17.500' });
  } else {
    if (p.min) presets.push({ v: p.min, l: 'min ' + fmt(p.min, 0) });
    if (p.mid) presets.push({ v: p.mid, l: 'mittel ' + fmt(p.mid, 0) });
    if (p.max) presets.push({ v: p.max, l: 'max ' + fmt(p.max, 0) });
  }
  const box = $('#lc-capex-presets'); clear(box);
  presets.forEach(pr => {
    const c = el('button', { cls: 'chip', text: pr.l, type: 'button' });
    c.onclick = () => { LC.capex = pr.v; $('#lc-capex').value = pr.v; syncLcoeUI(); updateLcoe(); };
    box.appendChild(c);
  });

  /* Referenzprojekte nur bei Kernkraft */
  const rp = $('#lc-refproj-box');
  if (key === 'nuclear') {
    rp.hidden = false;
    const rbox = $('#lc-refproj'); clear(rbox);
    S.page.nuclear_reference_projects
      .filter(x => x.capex_eur_kw)
      .sort((a, b) => a.capex_eur_kw - b.capex_eur_kw)
      .forEach(prj => {
        const c = el('button', { cls: 'chip', type: 'button',
          text: prj.country + ' · ' + prj.label + ' · ' + fmt(prj.capex_eur_kw, 0) });
        c.title = prj.label + ' (' + prj.country + '), ' + fmt(prj.capacity_mw, 0) + ' MW, Abgrenzung: ' +
          prj.cost_scope + (prj.delay_years ? ', Verzug ' + prj.delay_years + ' a' : '') +
          ', Konfidenz ' + prj.confidence + (prj.note ? ' — ' + deAscii(prj.note) : '');
        c.onclick = () => {
          LC.capex = Math.min(Number($('#lc-capex').max), prj.capex_eur_kw);
          $('#lc-capex').value = LC.capex; syncLcoeUI(); updateLcoe();
        };
        rbox.appendChild(c);
      });
  } else rp.hidden = true;

  const tech = S.params.technologies[key];
  const lt = techParam(key, 'lifetime_years'), ct = techParam(key, 'construction_years');
  $('#lc-tech-hint').innerHTML = tech.label + ' · Lebensdauer ' + fmt(pickVal(lt, 'mid'), 0) + ' a · Bauzeit ' +
    fmt(pickVal(ct, 'mid'), 0) + ' a ' + confBadge(ct.confidence || 'M') +
    (key === 'nuclear' ? ' · Betriebskosten werden <strong>absolut</strong> in €/kW/a gerechnet, nicht als ' +
      'CAPEX-Prozentsatz — sonst würden sie beim Verschieben des CAPEX-Reglers mitwachsen, was ' +
      'physikalisch unsinnig ist.' : '');
  syncLcoeUI();
}

function syncLcoeUI() {
  const key = LC.tech;
  $('#lc-capex-v').textContent = fmt(LC.capex, 0) + ' €/kW';
  $('#lc-flh-v').textContent = fmt(LC.flh, 0) + ' h/a';
  $('#lc-wacc-v').textContent = fmt(LC.wacc * 100, 1) + ' %';
  $('#lc-co2-v').textContent = fmt(LC.co2, 0) + ' €/t' + (LC.shadow ? ' (' + LC.shadow + ')' : '');
  const p = techParam(key, 'capex_eur_kw');
  $('#lc-capex-hint').innerHTML = 'Dossier-Spanne ' + fmt(p.min, 0) + '–' + fmt(p.max, 0) + ' €/kW ' +
    confBadge(p.confidence) + ' · Der Regler verschiebt alle drei Parametersätze proportional, damit ' +
    'die Unsicherheitsspanne erhalten bleibt.';
  const f = techParam(key, 'full_load_hours');
  let flhHint = 'Dossier-Spanne ' + fmt(f.min, 0) + '–' + fmt(f.max, 0) + ' h/a ' + confBadge(f.confidence || 'M');
  if (key === 'wind_onshore') {
    const fl = S.page.lcoe_benchmarks.wind_onshore.full_load_hours_fleet;
    flhHint += ' · <strong>Der wichtigste Einzelhebel bei Wind:</strong> die Bestandsflotte erreichte 2025 nur ' +
      fmt(fl.value_2025, 0) + ' h/a, Neuanlagen im Mittel über 2.400 h/a. Wer mit Bestandswerten rechnet, ' +
      'verteuert Windstrom systematisch um rund 30 %.';
  }
  if (key === 'nuclear') {
    flhHint += ' · In einem System mit hohem PV-/Windanteil muss Kernkraft lastfolgen. Wer 8.000 h ' +
      '<em>und</em> hohen EE-Anteil unterstellt, rechnet inkonsistent.';
  }
  $('#lc-flh-hint').innerHTML = flhHint;
  $('#lc-idc-hint').innerHTML = 'Bauzinsen = Kapitalkosten während der Bauzeit, Näherung ' +
    '(1+WACC)^(Bauzeit/2)−1. Beim aktuellen WACC ergibt das für die Fokus-Technologie <strong>+' +
    pct(idcSurcharge(LC.wacc, pickVal(techParam(key, 'construction_years'), 'mid')), 0) +
    '</strong> auf den CAPEX. Empirischer Anker: ' + S.params.global.idc_method.empirical_anchor + '. ' +
    confBadge(S.params.global.idc_method.confidence);
}

function renderPartB() {
  const sel = $('#lc-tech'); clear(sel);
  LCOE_TECHS.forEach(t => sel.appendChild(el('option', { value: t.key, text: t.label })));
  sel.value = LC.tech;
  sel.onchange = () => { setLcoeTech(sel.value); updateLcoe(); };

  $('#lc-capex').oninput = e => { LC.capex = +e.target.value; syncLcoeUI(); updateLcoe(); };
  $('#lc-flh').oninput = e => { LC.flh = +e.target.value; syncLcoeUI(); updateLcoe(); };
  $('#lc-wacc').oninput = e => { LC.wacc = +e.target.value / 100; syncLcoeUI(); updateLcoe(); };
  $('#lc-co2').oninput = e => { LC.co2 = +e.target.value; LC.shadow = null; syncLcoeUI(); updateLcoe(); };
  $('#lc-idc').onchange = e => { LC.idc = e.target.checked; syncLcoeUI(); updateLcoe(); };
  $('#lc-refs').onchange = e => { LC.refs = e.target.checked; updateLcoe(); };

  const w = S.params.global.wacc;
  const wbox = $('#lc-wacc-presets'); clear(wbox);
  [{ v: w.min, l: '3 % · sozialer Diskontsatz' }, { v: w.mid, l: '5 % · GES-Annahme' },
   { v: w.max, l: '9 % · Marktfinanzierung' }].forEach(p => {
    const c = el('button', { cls: 'chip', text: p.l, type: 'button' });
    c.onclick = () => { LC.wacc = p.v; $('#lc-wacc').value = p.v * 100; syncLcoeUI(); updateLcoe(); };
    wbox.appendChild(c);
  });

  const cbox = $('#lc-co2-presets'); clear(cbox);
  S.params.global.co2_price_support_points.filter(p => p.typ !== 'grenze').forEach(p => {
    const c = el('button', { cls: 'chip', type: 'button', text: fmt(p.wert, 0) + ' €' });
    c.title = p.label + ' · Quelle: ' + p.quelle + (p.stufe ? ' · Konfidenz ' + p.stufe : '');
    c.onclick = () => { LC.co2 = p.wert; LC.shadow = null; $('#lc-co2').value = p.wert; syncLcoeUI(); updateLcoe(); };
    cbox.appendChild(c);
  });
  S.page.co2_preis_szenarien.ausserhalb_slider.filter(p => p.wert === 990 || p.wert === 1000).forEach(p => {
    const c = el('button', { cls: 'chip', type: 'button', text: 'Schattenpreis ' + fmt(p.wert, 0) + ' €' });
    c.title = p.label + ' · ' + p.quelle;
    c.onclick = () => {
      LC.co2 = p.wert; LC.shadow = 'Schattenpreis'; $('#lc-co2').value = 400;
      syncLcoeUI(); updateLcoe();
    };
    cbox.appendChild(c);
  });

  const uba350 = S.params.global.co2_price_support_points.find(p => p.typ === 'schattenpreis');
  const efGas = S.params.technologies.gas_ccgt.params.emission_factor_t_mwh;
  $('#lc-co2-hint').innerHTML = 'Der CO₂-Preis wirkt im Modell <strong>nur über den ' +
    'Emissionsfaktor fossiler Erzeugung</strong> (' + fmt(Number(efGas.value) * 1000, 0) + ' g/kWh ' +
    confBadge(efGas.confidence) + '). <strong>Kennzeichnung:</strong> Ein <em>direkter</em> ' +
    'Verbrennungsfaktor fehlt in den Dossiers; angesetzt ist ersatzweise die UNECE-Lebenszyklus-' +
    'Untergrenze für GuD (Lücke <code>emissionsfaktor_direkt</code>). ' +
    'Lebenszyklus-Emissionen der übrigen Technologien (PV, Wind, Kernkraft) werden ' +
    'separat ausgewiesen, aber nicht eingepreist — sonst käme es zu Doppelzählungen mit dem ETS. ' +
    'Der Marktpreis lag im Mai 2026 bei rund 75 €/t ' + confBadge('C') + '; das Allzeithoch von 100,34 €/t ' +
    'stammt aus Februar 2023 ' + confBadge('A') + '. Die UBA-Schattenpreise (' + fmt(uba350.wert, 0) +
    ' €/t bzw. 990 €/t) sind keine Marktpreise, sondern geschätzte <em>Klimafolgekosten</em> — ' +
    'sie zeigen, was eine Tonne gesellschaftlich kostet, nicht was sie am Markt kostet.' +
    cite('uba-methodenkonvention');

  const we = S.page.wacc_sensitivity.worked_example;
  $('#wacc-lever-note').innerHTML = ' Der Kernkraft-Rechenfall des Dossiers zeigt es in Zahlen: ' +
    'bei ' + fmt(we.assumptions.capex_eur_kw, 0) + ' €/kW und ' +
    fmt(we.assumptions.full_load_hours, 0) + ' Volllaststunden steigt der LCOE von ' +
    fmt(we.lcoe_eur_mwh['0.03'], 0) + ' €/MWh (WACC 3 %) auf ' +
    fmt(we.lcoe_eur_mwh['0.09'], 0) + ' €/MWh (WACC 9 %).';

  /* Gegenbefund aus denselben Daten - gehoert fairerweise dazu. */
  const ien = S.page.wacc_sensitivity.iea_nea_2020;
  const ct = S.page.construction_time.global_iaea_pris;
  $('#wacc-counterpoint').innerHTML = '<br><br><strong>Der Hebel wirkt in beide Richtungen — das gehört dazu.</strong> ' +
    'Genau deshalb kommt die IEA/NEA-Vergleichsstudie zu dem Schluss: ' +
    '„' + deAscii(ien.note) + '“ ' + confBadge(ien.confidence) + cite('iea-nea-2020') +
    ' Und die globale Bauzeitverteilung ist deutlich günstiger als die westliche Erfahrung: ' +
    'Median ' + fmt(ct.median_years, 1) + ' Jahre, ' + fmt(ct.share_under_8y_pct, 0) +
    ' % der Reaktoren weltweit unter 8 Jahren ' + confBadge(ct.confidence) +
    cite('ritchie-construction-time') + '. Das Dossier hält ' +
    'zugleich fest, warum der Median für eine Deutschland-Prognose die falsche Kennzahl ist: „' +
    deAscii(S.page.construction_time.finding) + '“ Beide Sätze stehen nebeneinander, weil beide belegt sind.';

  setLcoeTech(LC.tech);
  updateLcoe();
}

/* ---------------------------------------------------------------------
   8 - Kapitel 5: Mix-Simulator
   --------------------------------------------------------------------- */
const MX = {
  demand: 950, pv: 0.30, won: 0.35, woff: 0.15, nuc: 0.0,
  batGw: 40, elyGw: 0, h2tGw: 0, h2sTwh: 0, fill: 0,
  scen: 'mittel', co2: 75, gasAuto: true, week: 23, preset: 'ee80_gas', last: null
};

function feeSharesFromGw(feeGw, split) {
  const out = {};
  [['pv', 'pv_freiflaeche'], ['wind_onshore', 'wind_onshore'], ['wind_offshore', 'wind_offshore']]
    .forEach(([k, techKey]) => {
      const flh = Number(resolveTech(S.params, techKey, 'mittel').full_load_hours);
      out[k] = feeGw * split[k] * MW_PER_GW * flh / MWH_PER_TWH / MX.demand;
    });
  return out;
}

function mixPresets() {
  const rec = S.page.ges.reconstruction, split = rec.fee_split_assumption;
  const mix25 = S.page.ist_mix['2025'].traeger_twh;
  const demand25 = (S.page.ist_mix['2025'].bruttostromverbrauch.low + S.page.ist_mix['2025'].bruttostromverbrauch.high) / 2;
  const bat25 = S.page.installierte_leistung_gw.batteriespeicher;
  return [
    { id: 'ist2025', label: 'Ist 2025', apply: () => {
        MX.demand = Math.round(demand25 / 10) * 10;
        MX.pv = mix25.photovoltaik.wert / MX.demand;
        MX.won = mix25.wind_onshore.wert / MX.demand;
        MX.woff = mix25.wind_offshore.wert / MX.demand;
        MX.nuc = 0; MX.batGw = Math.round(bat25.leistung_gw.high / 5) * 5;
        MX.elyGw = 0; MX.h2tGw = 0; MX.h2sTwh = 0; MX.fill = 0;
        MX.gasAuto = true; MX.scen = 'mittel';
      },
      hint: 'Energieanteile aus der Bruttostromerzeugung 2025, Bedarf ' + fmt(Math.round(demand25 / 10) * 10, 0) +
        ' TWh (Regler gerundet). <strong>Achtung:</strong> Das Modell leitet die Kapazitäten aus <em>Neuanlagen-</em>' +
        'Volllaststunden ab und rechnet den Rest fossil als Backup — es bildet damit nicht die reale ' +
        'Bestandsflotte 2025 ab, sondern ein hypothetisches System mit derselben Energiestruktur.' },
    { id: 'kostenminimum', label: 'GES · Kostenminimum', apply: () => {
        MX.demand = rec.demand_twh;
        const s = feeSharesFromGw(rec.scenarios.kostenminimum.fee_gw, split);
        MX.pv = s.pv; MX.won = s.wind_onshore; MX.woff = s.wind_offshore;
        MX.nuc = Math.max(0, 1 - (s.pv + s.wind_onshore + s.wind_offshore));
        MX.batGw = 0; MX.elyGw = 0; MX.h2tGw = 0; MX.h2sTwh = 0; MX.fill = 0;
        MX.gasAuto = true; MX.scen = 'mittel';
      },
      hint: 'Rekonstruktion des GES-Szenarios „Kostenminimum“: 90 GW fEE plus Kernkraft-Band. ' +
        'Gerechnet wird mit <strong>unseren</strong> Kostenparametern, nicht mit denen der Studie — ' +
        'genau das ist der Unterschied.' },
    { id: 'ee80_gas', label: 'GES · 80 % EE + Gas', apply: () => {
        MX.demand = rec.demand_twh;
        const s = feeSharesFromGw(rec.scenarios.ee80_gas.fee_gw, split);
        MX.pv = s.pv; MX.won = s.wind_onshore; MX.woff = s.wind_offshore; MX.nuc = 0;
        MX.batGw = 40; MX.elyGw = 0; MX.h2tGw = 0; MX.h2sTwh = 0; MX.fill = 0;
        MX.gasAuto = true; MX.scen = 'mittel';
      },
      hint: '438 GW fEE, Rest über Gas-Backup. Anders als die GES-Studie sind hier 40 GW ' +
        'Batteriespeicher enthalten — die Studie modelliert keine Batterien.' },
    { id: 'ee80_h2', label: 'GES · 80 % EE + H₂', apply: () => {
        MX.demand = rec.demand_twh;
        const s = feeSharesFromGw(rec.scenarios.ee80_h2.fee_gw, split);
        MX.pv = s.pv; MX.won = s.wind_onshore; MX.woff = s.wind_offshore; MX.nuc = 0;
        MX.batGw = 40; MX.elyGw = 100; MX.h2tGw = 80; MX.h2sTwh = 300; MX.fill = 1.0;
        MX.gasAuto = false; MX.scen = 'mittel';
      },
      hint: 'Wasserstoff statt Gas. Der Saisonspeicher startet <strong>gefüllt</strong>, weil das ' +
        'Profil erst am 1. Juli beginnt — die Einspeicherphase liegt davor. Die Stromkosten dafür ' +
        'sind nicht enthalten; das LSCOE ist insoweit eine Untergrenze.' },
    { id: 'ee100', label: 'GES · 100 % Erneuerbare', apply: () => {
        MX.demand = rec.demand_twh;
        const s = feeSharesFromGw(rec.scenarios.ee100.fee_gw, split);
        MX.pv = s.pv; MX.won = s.wind_onshore; MX.woff = s.wind_offshore; MX.nuc = 0;
        MX.batGw = 60; MX.elyGw = 160; MX.h2tGw = 90; MX.h2sTwh = 120; MX.fill = 1.0;
        MX.gasAuto = false; MX.scen = 'mittel';
      },
      hint: '786 GW fEE — mehr als das Doppelte des 80-%-Szenarios. Die Überkapazität ist der Preis ' +
        'dafür, ohne thermisches Backup auszukommen; sie zeigt sich in der Abregelung.' }
  ];
}

function currentStorage() {
  return {
    battery_power_gw: MX.batGw,
    battery_energy_gwh: MX.batGw * Number(resolveTech(S.params, 'battery', MX.scen).duration_hours || 4),
    electrolyser_gw: MX.elyGw,
    h2_storage_gwh: MX.h2sTwh * 1000,
    h2_turbine_gw: MX.h2tGw,
    h2_initial_fill_share: MX.fill,
    gas_backup_gw: MX.gasAuto ? null : 20
  };
}

function runMix(withHourly) {
  const shares = { pv: MX.pv, wind_onshore: MX.won, wind_offshore: MX.woff };
  if (MX.nuc > 0) shares.nuclear = MX.nuc;
  return mixSystem(shares, MX.demand, S.params, S.profiles, {
    scenario: MX.scen, storage: currentStorage(), co2_price: MX.co2,
    apply_idc: true, grid_variant: 'mid', return_hourly: !!withHourly
  });
}

/* --- Dispatch-Chart --------------------------------------------------- */
const DISP_SERIES = [
  { k: 'pv', c: PAL.pv, l: 'Photovoltaik' },
  { k: 'wind_onshore', c: PAL.windon, l: 'Wind onshore' },
  { k: 'wind_offshore', c: PAL.windoff, l: 'Wind offshore' },
  { k: 'band', c: PAL.band, l: 'Band (Kernkraft)' },
  { k: 'bat_discharge', c: PAL.bat, l: 'Batterie entlädt' },
  { k: 'h2_reelec', c: PAL.h2, l: 'H₂-Rückverstromung' },
  { k: 'gas', c: PAL.gas, l: 'Gas-Backup' }
];

function renderDispatch(res) {
  const h = res.dispatch.hourly, ts = res.dispatch.timestamps || [];
  const start = MX.week * 168, end = Math.min(start + 168, res.dispatch.hours);
  const n = end - start;
  const s = $('#chart-disp'); clear(s);
  const W = 880, H = 300, padL = 52, padR = 12, padT = 20, padB = 30;
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  const plotW = W - padL - padR, plotH = H - padT - padB;

  let maxV = 0;
  for (let i = start; i < end; i++) {
    let sum = 0;
    DISP_SERIES.forEach(d => { sum += (h[d.k][i] || 0); });
    maxV = Math.max(maxV, sum, h.load[i]);
  }
  const max = niceMax(maxV / MW_PER_GW * 1.05);
  const x = i => padL + (i - start) / Math.max(1, n - 1) * plotW;
  const y = gw => padT + plotH - (gw / max) * plotH;

  axisTicks(max, 4).forEach(t => {
    s.appendChild(svg('line', { x1: padL, x2: W - padR, y1: y(t), y2: y(t), stroke: PAL.grid, 'stroke-width': 1 }));
    s.appendChild(svg('text', { x: padL - 8, y: y(t) + 4, 'text-anchor': 'end', fill: PAL.soft,
      'font-size': 11, 'font-family': 'JetBrains Mono, monospace', text: fmt(t, 0) }));
  });
  s.appendChild(svg('text', { x: 4, y: padT - 4, fill: PAL.soft, 'font-size': 11,
    'font-family': 'JetBrains Mono, monospace', text: 'GW' }));

  /* Tagesraster + Datumsbeschriftung */
  for (let i = start; i < end; i += 24) {
    s.appendChild(svg('line', { x1: x(i), x2: x(i), y1: padT, y2: padT + plotH, stroke: PAL.grid, 'stroke-width': 1 }));
    const d = (ts[i] || '').slice(5, 10).split('-').reverse().join('.');
    s.appendChild(svg('text', { x: x(i) + 3, y: H - 10, fill: PAL.soft, 'font-size': 10.5,
      'font-family': 'JetBrains Mono, monospace', text: d }));
  }

  /* Gestapelte Flaechen */
  const base = new Array(n).fill(0);
  DISP_SERIES.forEach(d => {
    let pts = '', back = '';
    let any = false;
    for (let j = 0; j < n; j++) {
      const i = start + j;
      const v = (h[d.k][i] || 0) / MW_PER_GW;
      if (v > 0.0001) any = true;
      const top = base[j] + v;
      pts += (j ? ' L' : 'M') + x(i).toFixed(1) + ' ' + y(top).toFixed(1);
      base[j] = top;
    }
    for (let j = n - 1; j >= 0; j--) {
      const i = start + j;
      const v = (h[d.k][i] || 0) / MW_PER_GW;
      back += ' L' + x(i).toFixed(1) + ' ' + y(base[j] - v).toFixed(1);
    }
    if (!any) return;
    s.appendChild(svg('path', { d: pts + back + ' Z', fill: d.c, 'fill-opacity': 0.85,
      stroke: '#fff', 'stroke-width': 0.6 }));
  });

  /* Ungedeckte Last als rote Flaeche zwischen Stapel und Lastlinie */
  let unsPath = '', unsBack = '', hasUns = false;
  for (let j = 0; j < n; j++) {
    const i = start + j;
    const u = (h.unserved[i] || 0) / MW_PER_GW;
    if (u > 0.0001) hasUns = true;
    unsPath += (j ? ' L' : 'M') + x(i).toFixed(1) + ' ' + y(base[j] + u).toFixed(1);
  }
  for (let j = n - 1; j >= 0; j--) unsBack += ' L' + x(start + j).toFixed(1) + ' ' + y(base[j]).toFixed(1);
  if (hasUns) s.appendChild(svg('path', { d: unsPath + unsBack + ' Z', fill: PAL.unserved, 'fill-opacity': 0.9 }));

  /* Lastlinie */
  let lp = '';
  for (let j = 0; j < n; j++) {
    const i = start + j;
    lp += (j ? ' L' : 'M') + x(i).toFixed(1) + ' ' + y(h.load[i] / MW_PER_GW).toFixed(1);
  }
  s.appendChild(svg('path', { d: lp, fill: 'none', stroke: PAL.ink, 'stroke-width': 2, 'stroke-linejoin': 'round' }));

  /* Crosshair + Tooltip */
  const cross = svg('line', { x1: 0, x2: 0, y1: padT, y2: padT + plotH, stroke: PAL.ink,
    'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 });
  s.appendChild(cross);
  const hit = svg('rect', { x: padL, y: padT, width: plotW, height: plotH, fill: 'transparent' });
  s.appendChild(hit);
  hit.addEventListener('mousemove', e => {
    const r = s.getBoundingClientRect();
    const rel = (e.clientX - r.left) / r.width * W;
    let j = Math.round((rel - padL) / plotW * (n - 1));
    j = Math.max(0, Math.min(n - 1, j));
    const i = start + j;
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
    let rows = DISP_SERIES.filter(d => (h[d.k][i] || 0) / MW_PER_GW > 0.05)
      .map(d => '<span class="k" style="background:' + d.c + '"></span>' + d.l + ': ' +
        fmt(h[d.k][i] / MW_PER_GW, 1) + ' GW').join('<br>');
    if ((h.unserved[i] || 0) / MW_PER_GW > 0.05)
      rows += '<br><span class="k" style="background:' + PAL.unserved + '"></span>ungedeckt: ' +
        fmt(h.unserved[i] / MW_PER_GW, 1) + ' GW';
    if ((h.curtailed[i] || 0) / MW_PER_GW > 0.05)
      rows += '<br><span style="opacity:.75">abgeregelt: ' + fmt(h.curtailed[i] / MW_PER_GW, 1) + ' GW</span>';
    if ((h.ely_in[i] || 0) / MW_PER_GW > 0.05)
      rows += '<br><span style="opacity:.75">in Elektrolyse: ' + fmt(h.ely_in[i] / MW_PER_GW, 1) + ' GW</span>';
    if ((h.bat_charge[i] || 0) / MW_PER_GW > 0.05)
      rows += '<br><span style="opacity:.75">Batterie lädt: ' + fmt(h.bat_charge[i] / MW_PER_GW, 1) + ' GW</span>';
    showTip(e, '<b>' + (ts[i] || '').replace('T', ' ') + ' Uhr</b>Last: ' +
      fmt(h.load[i] / MW_PER_GW, 1) + ' GW<br>' + rows);
  });
  hit.addEventListener('mouseleave', () => { cross.setAttribute('opacity', 0); hideTip(); });

  legend('#legend-disp', DISP_SERIES.map(d => ({ c: d.c, l: d.l })).concat([
    { c: PAL.unserved, l: 'ungedeckte Last' }, { c: PAL.ink, line: true, l: 'Netzlast' }
  ]));

  renderSoc(res, start, end);
}

function renderSoc(res, start, end) {
  const h = res.dispatch.hourly, ts = res.dispatch.timestamps || [];
  const n = end - start;
  const s = $('#chart-soc'); clear(s);
  const W = 880, H = 156, padL = 52, padR = 12, padT = 20, padB = 24;
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  const plotW = W - padL - padR, plotH = H - padT - padB;

  let maxV = 0.001;
  for (let i = start; i < end; i++) maxV = Math.max(maxV, h.soc_bat[i] / MW_PER_GW, h.soc_h2[i] / MW_PER_GW);
  const max = niceMax(maxV * 1.05);
  const x = i => padL + (i - start) / Math.max(1, n - 1) * plotW;
  const y = v => padT + plotH - (v / max) * plotH;

  axisTicks(max, 3).forEach(t => {
    s.appendChild(svg('line', { x1: padL, x2: W - padR, y1: y(t), y2: y(t), stroke: PAL.grid, 'stroke-width': 1 }));
    s.appendChild(svg('text', { x: padL - 8, y: y(t) + 4, 'text-anchor': 'end', fill: PAL.soft, 'font-size': 11,
      'font-family': 'JetBrains Mono, monospace', text: fmt(t, max < 20 ? 1 : 0) }));
  });
  s.appendChild(svg('text', { x: 4, y: padT - 4, fill: PAL.soft, 'font-size': 11,
    'font-family': 'JetBrains Mono, monospace', text: 'GWh' }));

  [['soc_bat', PAL.bat], ['soc_h2', PAL.h2]].forEach(([k, c]) => {
    let p = '', any = false;
    for (let j = 0; j < n; j++) {
      const i = start + j;
      if (h[k][i] > 0.5) any = true;
      p += (j ? ' L' : 'M') + x(i).toFixed(1) + ' ' + y(h[k][i] / MW_PER_GW).toFixed(1);
    }
    if (any) s.appendChild(svg('path', { d: p, fill: 'none', stroke: c, 'stroke-width': 2 }));
  });
  legend('#legend-soc', [
    { c: PAL.bat, line: true, l: 'Batterie-Füllstand' },
    { c: PAL.h2, line: true, l: 'H₂-Speicherfüllstand' }
  ]);
}

function renderMixTiles(res) {
  const d = res.dispatch, ann = 1 / (d.seasonal_share_load || 1);
  const box = $('#tiles-mix'); clear(box);
  /* Jahres-Erzeugungspotenzial analytisch aus Kapazitaet x Volllaststunden.
     NICHT ueber den Teilzeitraum hochrechnen: die fEE-Reihen tragen eigene
     Saisonanteile (PV 0,45 / Wind 0,48), die Hochrechnung erfolgt aber ueber
     den Lastanteil (0,50) - das ergaebe ein um 3-10 % zu kleines Potenzial
     und widerspraeche der Anteilssumme der Regler. */
  let potTotal = 0;
  for (const capKey in VRE_TECHS) {
    const capGw = Number(res.capacities_gw[capKey] || 0);
    if (capGw <= 0) continue;
    const flh = Number(resolveTech(S.params, VRE_TECHS[capKey], MX.scen).full_load_hours);
    potTotal += capGw * MW_PER_GW * flh / MWH_PER_TWH;
  }
  const tiles = [
    { n: fmt(res.lscoe_eur_mwh, 0) + ' €/MWh', l: 'System-LSCOE (alle Kosten je gedeckter MWh)' },
    { n: fmt(res.total_cost_bn_eur_a, 0) + ' Mrd. €/a', l: 'Gesamtkosten des Systems pro Jahr' },
    { n: fmt(res.installed_gw_total, 0) + ' GW', l: 'installierte Leistung gesamt (Erzeugung + Speicher + Backup)' },
    { n: pct(d.coverage_ratio, 2), l: 'Deckungsgrad — Anteil der Last, der gedeckt wird' +
        (d.unserved_share > 0 ? '<br><strong style="color:' + PAL.unserved + '">ungedeckt: ' +
        fmt(d.energy_twh.unserved * ann, 1) + ' TWh/a, Spitze ' + fmt(d.unserved_peak_gw, 1) + ' GW</strong>' : '') },
    { n: fmt(d.energy_twh.curtailed * ann, 0) + ' TWh/a', l: 'Abregelung — im abgedeckten Zeitraum ' +
        pct(d.curtailment_share_of_vre, 1) + ' der fEE-Erzeugung, ' +
        pct(d.curtailment_share_of_generation, 1) + ' der Gesamterzeugung' },
    { n: fmt(d.gas_full_load_hours * ann, 0) + ' h/a', l: 'Backup-Volllaststunden bei ' +
        fmt(res.gas_gw, 1) + ' GW Spitzenleistung — je weniger, desto teurer wird jede Backup-MWh' },
    { n: fmt(co2OfMix(res), 0) + ' Mt/a', l: 'CO₂-Emissionen des Mixes (fossiles Backup). ' +
        '<strong>Achtung:</strong> mangels direktem Verbrennungsfaktor rechnet das Modell mit der ' +
        'UNECE-Lebenszyklus-<em>Untergrenze</em> für GuD als Proxy (<code>gaps.emissionsfaktor_direkt</code>)' },
    { n: fmt(d.h2_storage_required_gwh / 1000, 1) + ' TWh', l: 'benötigter H₂-Saisonspeicher (Füllstandshub im Zeitraum)' },
    { n: fmt(potTotal, 0) + ' TWh/a', noSim: true,
      l: 'fEE-Erzeugungspotenzial vor Abregelung, bei ' + fmt(MX.demand, 0) + ' TWh Bedarf — ' +
         'analytisch aus Kapazität × Volllaststunden, deshalb ohne Hochrechnungs-Marker' }
  ];
  tiles.forEach(t => box.appendChild(el('div', { cls: 'tile',
    html: '<div class="n sm">' + t.n + '</div><div class="l">' + t.l +
      (t.noSim ? '' : ' <span class="simlabel simdata short"></span>') + '</div>' })));
  applySimLabels();
}

function co2OfMix(res) {
  const ann = 1 / (res.dispatch.seasonal_share_load || 1);
  const flat = resolveTech(S.params, 'gas_ccgt', MX.scen);
  const ef = Number(flat.emission_factor_t_mwh || 0);
  return res.dispatch.energy_twh.gas_backup * ann * 1e6 * ef / 1e6;
}

function renderLscoeBar(res) {
  const comp = res.cost_components_eur_mwh;
  const segs = Object.keys(comp).sort((a, b) => comp[b] - comp[a]).map(k => ({
    v: comp[k], c: (COMP_META[k] || {}).c || PAL.soft, l: (COMP_META[k] || {}).l || k
  })).filter(x => x.v > 0.01);
  renderStackedBar('#chart-lscoe', segs, { axisLabel: '€/MWh', minAxis: 150 });
  legend('#legend-lscoe', segs.map(s => ({ c: s.c, l: s.l + ' · ' + fmt(s.v, 1) })));
}

function renderMixWarnings(res) {
  const box = $('#mix-warnings'); clear(box);
  const pot = S.params.technologies.h2_storage.params.de_repurposing_potential_twh;
  const need = res.dispatch.h2_storage_required_gwh / 1000;
  if (need > pot.value) {
    box.appendChild(el('div', { cls: 'note crit', html:
      '<strong>Physische Mengenrestriktion, keine Kostenfrage.</strong> Dieser Mix braucht einen ' +
      'Wasserstoff-Saisonspeicher von <strong>' + fmt(need, 0) + ' TWh</strong>. Das deutsche ' +
      'Umwidmungspotenzial für Salzkavernen liegt bei rund <strong>' + fmt(pot.value, 0) + ' TWh</strong> ' +
      confBadge(pot.confidence) + ', die Fraunhofer-ISE-Referenz für den Bedarf 2045 bei ' +
      fmt(S.params.system.security_of_supply.h2_storage_need_2045_twh.value, 0) + ' TWh ' +
      confBadge(S.params.system.security_of_supply.h2_storage_need_2045_twh.confidence) + '. ' +
      'Das Modell bepreist H₂-Speicherung über den <em>Durchsatz</em>, nicht über die Kavernenkapazität — ' +
      'die Restriktion taucht in den Kosten deshalb <strong>nicht</strong> auf. Sie ist trotzdem real.' }));
  }
  const seen = new Set();
  res.warnings.forEach(w => {
    if (seen.has(w)) return; seen.add(w);
    box.appendChild(el('div', { cls: 'note warn', html: '<strong>Modellhinweis.</strong> ' + deAscii(w) }));
  });
}

function updateMix() {
  const res = runMix(true);
  MX.last = res;
  renderDispatch(res);
  renderMixTiles(res);
  renderLscoeBar(res);
  renderMixWarnings(res);

  const sum = MX.pv + MX.won + MX.woff + MX.nuc;
  $('#mx-sum').innerHTML = ' Aktuelle Summe: <strong>' + pct(sum, 0) + '</strong>' +
    (sum > 1.02 ? ' — Überkapazität von ' + pct(sum - 1, 0) + ', die im Dispatch teilweise abgeregelt wird.' : '') +
    (sum < 0.98 ? ' — Unterdeckung, die Backup und Speicher schließen müssen.' : '');

  const cov = S.profiles.series.load_mw.coverage || {};
  $('#disp-sub').innerHTML = 'Gestapelt: die Erzeugung, die in dieser Stunde Last deckt. Die schwarze ' +
    'Linie ist die Netzlast. Liegt der Stapel <em>über</em> der Linie, entsteht Überschuss (Batterie, ' +
    'Elektrolyse, Abregelung); liegt er <em>darunter</em>, bleibt Last ungedeckt (rot). ' +
    'Verfügbarer Zeitraum: ' + (cov.period_start || '').slice(0, 10) + ' bis ' +
    (cov.period_end || '').slice(0, 10) + ' · <span class="simlabel simdata"></span>';
  applySimLabels();
  buildCitations();
}

function syncMixUI() {
  $('#mx-demand').value = MX.demand; $('#mx-demand-v').textContent = fmt(MX.demand, 0) + ' TWh/a';
  $('#mx-pv').value = Math.round(MX.pv * 100); $('#mx-pv-v').textContent = pct(MX.pv, 0);
  $('#mx-won').value = Math.round(MX.won * 100); $('#mx-won-v').textContent = pct(MX.won, 0);
  $('#mx-woff').value = Math.round(MX.woff * 100); $('#mx-woff-v').textContent = pct(MX.woff, 0);
  $('#mx-nuc').value = Math.round(MX.nuc * 100); $('#mx-nuc-v').textContent = pct(MX.nuc, 0);
  const dur = Number(resolveTech(S.params, 'battery', MX.scen).duration_hours || 4);
  $('#mx-bat').value = MX.batGw;
  $('#mx-bat-v').textContent = fmt(MX.batGw, 0) + ' GW / ' + fmt(MX.batGw * dur, 0) + ' GWh';
  $('#mx-ely').value = MX.elyGw; $('#mx-ely-v').textContent = fmt(MX.elyGw, 0) + ' GW';
  $('#mx-h2t').value = MX.h2tGw; $('#mx-h2t-v').textContent = fmt(MX.h2tGw, 0) + ' GW';
  $('#mx-h2s').value = MX.h2sTwh; $('#mx-h2s-v').textContent = fmt(MX.h2sTwh, 0) + ' TWh';
  $('#mx-co2').value = MX.co2; $('#mx-co2-v').textContent = fmt(MX.co2, 0) + ' €/t';
  $('#mx-scen').value = MX.scen;
  $('#mx-gasauto').checked = MX.gasAuto;
  $('#dp-week').value = MX.week;
  const ts = S.profiles.timestamps;
  const a = (ts[MX.week * 168] || '').slice(0, 10).split('-').reverse().join('.');
  const bIdx = Math.min(MX.week * 168 + 167, ts.length - 1);
  const b = (ts[bIdx] || '').slice(0, 10).split('-').reverse().join('.');
  $('#dp-week-v').textContent = a + ' – ' + b;
  $('#mx-scen-hint').innerHTML = 'WACC ' + pct(scenarioWacc(S.params, MX.scen), 0) + '. ' +
    deAscii(S.params.scenario_sets[MX.scen].rationale);
  const dem = S.params.global.demand_twh;
  $('#mx-demand-hint').innerHTML = 'Vorgabewert ' + fmt(dem.value, 0) + ' TWh = GES-Zieljahresbedarf 2045; ' +
    'NEP-Spanne 2045: ' + fmt(dem.min, 0) + '–' + fmt(dem.max, 0) + ' TWh ' + confBadge(dem.confidence) + '.';
  const bat = S.params.system.security_of_supply.battery_need_2045_gwh;
  $('#mx-bat-hint').innerHTML = 'Auslegung ' + fmt(dur, 0) + ' h (entspricht der CAPEX-Referenz). ' +
    'Studienbedarf 2045: ' + fmt(bat.min, 0) + '–' + fmt(bat.max, 0) + ' GWh, Median ' + fmt(bat.mid, 0) +
    ' GWh ' + confBadge(bat.confidence) + ' — die Spanne von Faktor 3 ist selbst ein Befund.';
  const potH2 = S.params.technologies.h2_storage.params.de_repurposing_potential_twh;
  $('#mx-h2s-hint').innerHTML = 'Deutsches Kavernen-Umwidmungspotenzial: rund ' + fmt(potH2.value, 0) +
    ' TWh ' + confBadge(potH2.confidence) + '. Wird der Regler höher gestellt, ist der Speicher physisch ' +
    'nicht durch Umwidmung darstellbar.';
}

function renderPartC() {
  const scenSel = $('#mx-scen'); clear(scenSel);
  ['guenstig', 'mittel', 'teuer'].forEach(k => scenSel.appendChild(el('option', {
    value: k, text: { guenstig: 'günstig (WACC 3 %)', mittel: 'mittel (WACC 5 %)', teuer: 'teuer (WACC 9 %)' }[k]
  })));

  const presets = mixPresets();
  const pbox = $('#mix-presets'); clear(pbox);
  presets.forEach(p => {
    const c = el('button', { cls: 'chip' + (p.id === MX.preset ? ' on' : ''), text: p.label, type: 'button' });
    c.onclick = () => {
      MX.preset = p.id; p.apply();
      $$('#mix-presets .chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      $('#preset-hint').innerHTML = '<strong>' + p.label + '.</strong> ' + p.hint;
      syncMixUI(); updateMix();
    };
    pbox.appendChild(c);
  });
  pbox.parentNode.insertBefore(el('div', { cls: 'note', id: 'preset-hint', html: '' }), pbox.nextSibling);

  const bind = (id, fn) => { $(id).oninput = e => { fn(+e.target.value); MX.preset = 'custom';
    $$('#mix-presets .chip').forEach(x => x.classList.remove('on')); syncMixUI(); updateMix(); }; };
  bind('#mx-demand', v => MX.demand = v);
  bind('#mx-pv', v => MX.pv = v / 100);
  bind('#mx-won', v => MX.won = v / 100);
  bind('#mx-woff', v => MX.woff = v / 100);
  bind('#mx-nuc', v => MX.nuc = v / 100);
  bind('#mx-bat', v => MX.batGw = v);
  bind('#mx-ely', v => MX.elyGw = v);
  bind('#mx-h2t', v => MX.h2tGw = v);
  bind('#mx-h2s', v => MX.h2sTwh = v);
  bind('#mx-co2', v => MX.co2 = v);
  $('#mx-scen').onchange = e => { MX.scen = e.target.value; syncMixUI(); updateMix(); };
  $('#mx-gasauto').onchange = e => { MX.gasAuto = e.target.checked; updateMix(); };

  const weeks = Math.max(1, Math.floor(S.profiles.hours / 168));
  $('#dp-week').max = weeks - 1;
  $('#dp-week').oninput = e => { MX.week = +e.target.value; syncMixUI(); updateMix(); };

  /* Wochen-Presets: Dunkelflaute Dezember 2024 als Vorgabe */
  const ts = S.profiles.timestamps;
  const idxOf = (iso) => { const i = ts.findIndex(t => t.slice(0, 10) === iso); return i < 0 ? 0 : Math.floor(i / 168); };
  const ref = S.page.dunkelflaute.referenzereignis_dez_2024;
  const wpres = [
    { l: 'Dunkelflaute Dezember 2024', w: idxOf(ref.datum.slice(0, 10)),
      t: 'Referenzereignis ' + deDatum(ref.datum) + ': Day-Ahead-Spitzen über ' + ref.day_ahead_spitze_eur_mwh_max + ' €/MWh' },
    { l: 'zweites Ereignis ' + deDatum(ref.zweites_ereignis).replace(/^\d+\.\s*/, ''),
      w: idxOf(ref.zweites_ereignis), t: 'Ereignis ' + deDatum(ref.zweites_ereignis) },
    { l: 'Sommerwoche Juli', w: 2, t: 'PV-starke Woche mit hohen Überschüssen' },
    { l: 'Übergangszeit Oktober', w: 15, t: 'typische Herbstwoche' }
  ];
  MX.week = wpres[0].w;
  const wbox = $('#dp-week-presets'); clear(wbox);
  wpres.forEach(p => {
    const c = el('button', { cls: 'chip', text: p.l, type: 'button', title: p.t });
    c.onclick = () => { MX.week = p.w; syncMixUI(); updateMix(); };
    wbox.appendChild(c);
  });

  const txt = simLabelText();
  $('#partial-warning').innerHTML = txt
    ? '<strong>Was diese Simulation kann — und was nicht.</strong> Die Profile stammen aus realen ' +
      'SMARD-Exportdaten, decken aber nur <strong>' + S.profiles.hours + ' von ' +
      (S.profiles.series.load_mw.coverage.hours_expected || 8784) + ' Jahresstunden</strong> ab ' +
      '(' + (S.profiles.series.load_mw.coverage.period_start || '').slice(0, 10) + ' bis ' +
      (S.profiles.series.load_mw.coverage.period_end || '').slice(0, 10) + '), und die Reihen für ' +
      'Wind offshore, Wasserkraft und Biomasse fehlen vollständig.' + cite('smard-mirror-2024') +
      ' Für Wind offshore verwendet das Modell ersatzweise die Onshore-Profilform — die reale ' +
      'Offshore-Glättung fehlt damit, was den Systemwert von Offshore-Wind eher <em>unter</em>schätzt. ' +
      'Der abgedeckte Zeitraum Juli–Dezember ist winterlastig: Backup- und Speichermengen werden eher ' +
      'über- als unterschätzt, PV-Erträge unterschätzt. <strong>Alle Jahreswerte sind über den ' +
      'Lastanteil des Zeitraums hochgerechnet</strong> und tragen deshalb das Label „' + txt + '“.'
    : '<strong>Datenlage.</strong> Die Simulation läuft auf einem vollständigen Jahresprofil.';

  presets.find(p => p.id === 'ee80_gas').apply();
  MX.week = wpres[0].w;
  $('#preset-hint').innerHTML = '<strong>GES · 80 % EE + Gas.</strong> ' +
    presets.find(p => p.id === 'ee80_gas').hint;
  syncMixUI();
  updateMix();
}

/* ---------------------------------------------------------------------
   9 - Kapitel 7-9 + Anhang: Risiken, Diskussion, Fazit, Limitationen,
       Quellen, Executive Summary, Kapitel-Navigation
   --------------------------------------------------------------------- */
function table(head, rows, cls) {
  const t = el('table');
  t.innerHTML = '<thead><tr>' + head.map(h =>
    '<th' + (h.num ? ' class="num"' : '') + '>' + h.l + '</th>').join('') + '</tr></thead>';
  const tb = el('tbody');
  rows.forEach(r => {
    const tr = el('tr');
    tr.innerHTML = r.map((c, i) => '<td' + (head[i] && head[i].num ? ' class="num"' : '') + '>' + c + '</td>').join('');
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  if (cls) t.className = cls;
  return t;
}
function mount(sel, node) { const b = $(sel); clear(b); b.appendChild(node); }

function renderPartD() {
  const P = S.page, df = P.dunkelflaute;

  /* --- Dunkelflaute-Definitionen --------------------------------------- */
  mount('#table-df-def', table(
    [{ l: 'Definition' }, { l: 'Schwelle' }, { l: 'Mindestdauer', num: true }, { l: 'Verwendet von' }, { l: 'Konfidenz' }],
    df.definitionen.map(d => [
      d.id === 'dwd' ? 'Deutscher Wetterdienst' : 'Uniper-Kurzstudie 2026',
      '&lt; ' + (d.schwelle_prozent_nennleistung || d.schwelle_prozent_installierte_leistung) + ' % der ' +
        (d.schwelle_prozent_nennleistung ? 'Nennleistung' : 'installierten Leistung (Wind + PV zusammen' +
        (d.glaettung ? ', ' + d.glaettung : '') + ')'),
      d.min_dauer_h + ' h', d.quelle, confBadge(d.stufe)
    ])));

  /* --- Haeufigkeit ------------------------------------------------------ */
  mount('#table-df-freq', table(
    [{ l: 'Ereignisdauer', num: true }, { l: 'Häufigkeit' }, { l: 'Quelle' }, { l: 'Konfidenz' }],
    df.haeufigkeit.map(f => {
      let h;
      if (f.anzahl_10_jahre) h = '<strong>' + fmt(f.anzahl_10_jahre, 0) + ' Ereignisse</strong> in 10 Jahren — ' +
        f.haeufigkeit_text + ', mittlere Dauer ' + fmt(f.mittlere_dauer_h, 1) + ' h';
      else if (f.haeufigkeit_pro_jahr_min) h = 'etwa ' + f.haeufigkeit_pro_jahr_min +
        (f.haeufigkeit_pro_jahr_max !== f.haeufigkeit_pro_jahr_min ? '–' + f.haeufigkeit_pro_jahr_max : '') +
        '× pro Jahr' + (f.haeufigkeit_text ? ' (' + f.haeufigkeit_text + ')' : '');
      else if (f.wiederkehrperiode_jahre) h = 'etwa alle ' + fmtAuto(f.wiederkehrperiode_jahre) + ' Jahre';
      else h = '–';
      return ['&gt; ' + f.dauer_h + ' h', h, f.quelle, confBadge(f.stufe)];
    })));

  const bg = df.batteriespeicher_grenze, ext = df.extremwerte, ref = df.referenzereignis_dez_2024;
  const need48 = S.params.system.security_of_supply.energy_need_48h_winter_twh;
  $('#df-dec2024').innerHTML =
    '<strong>Der Dezember 2024 als Referenzfall — und was er wirklich zeigt.</strong> ' +
    'Am ' + deDatum(ref.datum) + ' stiegen die Day-Ahead-Preise auf über ' + fmt(ref.day_ahead_spitze_eur_mwh_max, 0) +
    ' €/MWh, im Intraday-Markt lag der Mittelwert zeitweise bei rund ' + fmt(ref.intraday_mittel_eur_mwh, 0) +
    ' €/MWh. Bundesnetzagentur und Bundeskartellamt stellten fest: <strong>kein Marktmissbrauch</strong>, ' +
    'aber ein <strong>strukturelles Problem</strong>; in den teuersten Stunden waren noch ' +
    fmt(ref.marktverfuegbare_kapazitaet_gw.min, 1) + '–' + fmt(ref.marktverfuegbare_kapazitaet_gw.max, 1) +
    ' GW marktverfügbare Kapazität und ' + fmt(ref.reserven_gw.min, 0) + '–' + fmt(ref.reserven_gw.max, 0) +
    ' GW Reserven vorhanden. ' + confBadge(ref.stufe) + cite('bnetza-preisspitzen-2025') +
    '<br><br>Das System hat die Dunkelflaute <em>technisch bewältigt</em>, aber zu sehr hohen Preisen. ' +
    'Beide Lager verkürzen das gern — „das System war am Rand des Kollaps“ ebenso wie „alles lief ' +
    'problemlos“. Von der Behördenanalyse ist keine der beiden Verkürzungen gedeckt.' +
    '<br><br><strong>Warum die Definitionsfrage praktisch wird:</strong> Batteriespeicher überbrücken ' +
    'zuverlässig bis etwa <strong>' + bg.zuverlaessig_ueberbrueckbar_bis_h + ' Stunden</strong> ' +
    confBadge(bg.stufe) + '. Genau oberhalb dieser Schwelle beginnt die DWD-Definition (48 h). Das längste ' +
    'Ereignis der Jahre 2016–2025 dauerte ' + fmt(ext.laengstes_ereignis_tage_10j, 1) + ' Tage ' +
    confBadge(ext.stufe) + cite('lbbw-dunkelflaute-2025') + '. Der Energiebedarf einer 48-Stunden-' +
    'Winterdunkelflaute wird mit ' + fmt(need48.min, 1) + '–' + fmt(need48.max, 1) + ' TWh beziffert ' +
    confBadge(need48.confidence) + cite('uniper-dunkelflaute-2026') + '.';

  /* --- Kostenueberschreitung ------------------------------------------- */
  const ko = P.kostenueberschreitung_faktoren;
  const koLabels = {
    solar: 'Solar', wind: 'Wind', netz_uebertragung: 'Stromübertragungsnetz',
    fossil_thermisch: 'Fossil-thermisch', geothermie: 'Geothermie', wasserkraft: 'Wasserkraft',
    kernkraft: 'Kernkraft', nukleare_endlagerung: 'Nukleare Endlagerung'
  };
  const koColors = {
    solar: PAL.pv, wind: PAL.windon, netz_uebertragung: PAL.net, fossil_thermisch: PAL.gas,
    geothermie: '#8a6a3c', wasserkraft: PAL.teal, kernkraft: PAL.band, nukleare_endlagerung: '#a35a7a'
  };
  const koRows = Object.entries(ko.technologien).map(([k, v]) => ({
    label: koLabels[k] || k, color: koColors[k] || PAL.soft,
    min: (v.spanne[0] - 1) * 100, max: (v.spanne[1] - 1) * 100,
    value: ((v.flyvbjerg || v.sovacool) - 1) * 100,
    note: '+' + fmt(((v.flyvbjerg || v.sovacool) - 1) * 100, 0) + ' %',
    tip: '<b>' + (koLabels[k] || k) + '</b>' +
      (v.flyvbjerg ? 'Flyvbjerg: +' + fmt((v.flyvbjerg - 1) * 100, 0) + ' %<br>' : '') +
      (v.sovacool ? 'Sovacool &amp; Ryu 2025: +' + fmt((v.sovacool - 1) * 100, 1) + ' %<br>' : '') +
      'Modellspanne +' + fmt((v.spanne[0] - 1) * 100, 0) + ' bis +' + fmt((v.spanne[1] - 1) * 100, 0) + ' %' +
      (v.hinweis ? '<br><em>' + v.hinweis + '</em>' : '')
  })).sort((a, b) => a.value - b.value);
  renderHBars('#chart-overrun', koRows, { axisLabel: '% über der ursprünglichen Schätzung', padL: 200, padR: 90, rowH: 28 });
  legend('#legend-overrun', [{ c: PAL.teal, l: 'Spanne beider Datensätze, Punkt = Zentralwert (Flyvbjerg bzw. Sovacool)' }]);
  $('#overrun-sub').innerHTML = 'Datenbasis Flyvbjerg: rund ' + fmt(ko.datenbasis.flyvbjerg.projekte, 0) +
    ' Projekte in ' + ko.datenbasis.flyvbjerg.laender + ' Ländern' + cite('flyvbjerg-2023') +
    ' · Sovacool &amp; Ryu 2025: ' + fmt(ko.datenbasis.sovacool.projekte, 0) + ' Energieprojekte in ' +
    ko.datenbasis.sovacool.laender + ' Ländern, Baujahre ' + ko.datenbasis.sovacool.zeitraum +
    cite('sovacool-ryu-2025') + ' · <span class="simlabel" style="background:#EDECE6;color:#475569">' +
    'im Basisfall des Modells auf 1,00 gesetzt</span>';
  $('#overrun-note').innerHTML = '<strong>Das faire Gegenargument.</strong> ' + deAscii(ko.gegenargument) +
    ' Zusätzlich zeigt Sovacool &amp; Ryu Strukturbrüche bei ' + ko.skaleneffekt_bruchpunkte_mw.map(v => fmt(v, 0)).join(' und ') +
    ' MW Blockgröße — oberhalb davon steigen die Überschreitungen überproportional ' +
    '(„Diseconomies of Scale“). <strong>Wichtig für dieses Modell:</strong> Diese Faktoren sind ' +
    'im Basisfall <em>abgeschaltet</em> (1,00). Der Modellkern soll nicht mit Risikoannahmen vermischt ' +
    'werden. Wer sie einrechnen will, hat dafür den Schalter in <a href="#kap-6">Kapitel 6</a> ' +
    '(Monte Carlo) oder multipliziert den CAPEX-Regler in Kapitel 4 entsprechend hoch.';

  /* --- Lieferketten ----------------------------------------------------- */
  const lk = P.lieferketten_konzentration;
  const sup = $('#tiles-supply'); clear(sup);
  const cards = [
    { t: 'Photovoltaik', body:
      '<p style="font-size:14.5px">China hält über <strong>' + lk.pv.china_anteil_alle_fertigungsstufen_prozent +
      ' %</strong> über alle Fertigungsstufen, bei Polysilizium und Wafern im Ausblick über <strong>' +
      lk.pv.china_anteil_polysilizium_wafer_ausblick_prozent + ' %</strong>. ' + confBadge(lk.pv.stufe) +
      cite('iea-pv-supply-chains') + '</p><p style="font-size:14.5px;margin-bottom:0"><strong>Die ' +
      'Relativierung gehört dazu:</strong> ' + lk.pv.relativierung + '. Bei Gas oder Uran trifft ein ' +
      'Lieferstopp dagegen den laufenden Betrieb.</p>' },
    { t: 'Uran und Anreicherung', body:
      '<p style="font-size:14.5px">Natururan-Bestellungen der EU 2024: Kanada ' + lk.uran.eu_natururan_2024_prozent.kanada +
      ' %, Kasachstan ' + lk.uran.eu_natururan_2024_prozent.kasachstan + ' %, Russland ' +
      lk.uran.eu_natururan_2024_prozent.russland + ' %, Australien ' + lk.uran.eu_natururan_2024_prozent.australien +
      ' %. ' + confBadge(lk.uran.stufe) + cite('euratom-esa-2024') + '</p>' +
      '<p style="font-size:14.5px;margin-bottom:0">Der eigentliche Engpass ist die <strong>Anreicherung</strong>: ' +
      'Die EU-Abhängigkeit von russischer Anreicherung fiel von ' + lk.uran.eu_anreicherung_russland_2023_prozent +
      ' % (2023) auf ' + lk.uran.eu_anreicherung_russland_2024_prozent + ' % (2024) — das Argument ' +
      '„Kernkraft macht abhängig von Russland“ verliert an Kraft, <em>sofern die Diversifizierung ' +
      'tatsächlich gelingt</em> (Urenco und Orano bauen aus). Das Dossier hält drei Gegenpunkte dagegen: ' +
      'Rosatom und CNNC kontrollieren zusammen über ' + lk.uran.rosatom_plus_cnnc_globale_swu_2024_prozent +
      ' % der globalen Anreicherungskapazität; Kasachstan (' + lk.uran.eu_natururan_2024_prozent.kasachstan +
      ' % des EU-Natururans) liegt logistisch teilweise in russischem Transitgebiet; und Deutschland ' +
      'betreibt keine Kernkraftwerke mehr — für ein Wiedereinstiegsszenario wäre die Abhängigkeit ' +
      'erst neu aufzubauen.</p>' },
    { t: 'Erdgas', body:
      '<p style="font-size:14.5px">Importe 2025: <strong>' + fmt(lk.gas.importe_2025_twh, 0) + ' TWh</strong> ' +
      '(+' + lk.gas.veraenderung_prozent + ' % ggü. 2024), aus Norwegen ' + lk.gas.anteile_2025_prozent.norwegen +
      ' %, den Niederlanden ' + lk.gas.anteile_2025_prozent.niederlande + ' %, Belgien ' +
      lk.gas.anteile_2025_prozent.belgien + ' %. Russische Pipeline-Lieferungen: ' + lk.gas.russland_pipeline +
      '. ' + confBadge(lk.gas.stufe) + '</p><p style="font-size:14.5px;margin-bottom:0"><strong>Einschränkung:</strong> ' +
      lk.gas.einschraenkung + '.</p>' },
    { t: 'Kritische Rohstoffe', body:
      '<p style="font-size:14.5px">Der Anteil der drei größten Länder an der Raffination stieg von ' +
      lk.kritische_rohstoffe.top3_raffination_anteil_2020_prozent + ' % (2020) auf ' +
      lk.kritische_rohstoffe.top3_raffination_anteil_2024_prozent + ' % (2024) — Tendenz ' +
      lk.kritische_rohstoffe.trend + '. ' + confBadge(lk.kritische_rohstoffe.stufe) +
      cite('iea-critical-minerals-2025') + '</p><p style="font-size:14.5px;margin-bottom:0">China raffiniert ' +
      lk.kritische_rohstoffe.china_graphit_raffination_prozent + ' % des Graphits und der Seltenen Erden, ' +
      lk.kritische_rohstoffe.china_lithium_verarbeitung_prozent + ' % des Lithiums und Kobalts. Das betrifft ' +
      'Batterien und Windkraft gleichermaßen.</p>' }
  ];
  cards.forEach(c => sup.appendChild(el('div', { cls: 'card',
    html: '<p class="card-t">' + c.t + '</p>' + c.body })));

  /* --- Kernkraft-Restrisiken -------------------------------------------- */
  const kr = P.kernkraft_restrisiken, kenfo = kr.kenfo, haft = kr.haftung;
  $('#nuc-pro').innerHTML = [
    'Der Entsorgungsfonds <strong>KENFO</strong> wurde 2017 mit ' + fmt(kenfo.einzahlung_2017_mrd_eur, 1) +
      ' Mrd. € kapitalisiert und liegt inzwischen bei rund ' + fmt(kenfo.anlagevermoegen_mrd_eur, 0) +
      ' Mrd. € Anlagevermögen. ' + confBadge('B') + cite('kenfo'),
    'Die Rendite lag 2025 bei ' + fmt(kenfo.rendite_2025_prozent, 1) + ' % und damit ' +
      fmt(kenfo.rendite_2025_prozent - kenfo.zielrendite_2025_prozent, 1) + ' Prozentpunkte über der ' +
      'Zielrendite; seit Auflage ' + fmt(kenfo.rendite_seit_auflage_prozent_pa, 1) + ' % p. a. ' + confBadge('A'),
    'Seit 2017 wurden bereits ' + fmt(kenfo.erstattungen_seit_2017_mrd_eur, 1) + ' Mrd. € an den Bund erstattet.',
    'Finnland könnte mit <strong>Onkalo</strong> das weltweit erste geologische Tiefenlager in Betrieb ' +
      'nehmen; die Daten nennen als Jahr ' +
      String((kr.endlager_status.find(e => e.projekt === 'Onkalo') || {}).erste_einlagerung_jahr) +
      ' (Quartal nicht belegt). Status laut Dossier: ' +
      deAscii((kr.endlager_status.find(e => e.projekt === 'Onkalo') || {}).status) + '. ' +
      confBadge('A') + cite('base-endlager')
  ].map(x => '<li>' + x + '</li>').join('');
  $('#nuc-con').innerHTML = [
    'Die Betreiber sind mit der Einzahlung <strong>enthaftet</strong>; die Auffanghaftung liegt beim ' +
      'Bundeshaushalt. Eine <em>quantifizierte</em> Deckungslücke gibt es nicht — sie ist ' +
      (kenfo.deckungsluecke_quantifiziert ? 'beziffert' : '<strong>nicht beziffert</strong>') +
      ', was die Debatte unentscheidbar macht. ' + confBadge('B'),
    'Die Haftpflichtversicherung je Anlage beträgt ' + fmt(haft.haftpflichtversicherung_mio_eur, 0) +
      ' Mio. €, darüber greift bis ' + fmt(haft.solidarvereinbarung_mrd_eur, 1) + ' Mrd. € eine ' +
      'Solidarvereinbarung, darüber der Staat (§ 34 AtG). Die Betreiberhaftung ist dem Grunde nach ' +
      'unbegrenzt, faktisch aber durch die Insolvenzfähigkeit begrenzt. ' + confBadge(haft.stufe) +
      cite('bundestag-wd-haftung'),
    'Ein Schattenpreis je MWh für dieses Restrisiko ist <strong>nicht seriös quantifizierbar</strong> — ' +
      'das Dossier empfiehlt deshalb ausdrücklich, ihn <em>nicht</em> als Fixwert zu modellieren. ' +
      'Dieses Modell setzt ihn folglich nicht an; das LSCOE ist insoweit eine Untergrenze.',
    'Nukleare Endlagerprojekte sind die Projektklasse mit der höchsten empirischen Kostenüberschreitung ' +
      'überhaupt (+' + fmt((ko.technologien.nukleare_endlagerung.flyvbjerg - 1) * 100, 0) + ' %). ' +
      confBadge('A') + cite('flyvbjerg-2023'),
    'In Deutschland wird die Standortentscheidung nach aktuellen Schätzungen zwischen <strong>2046 und ' +
      '2074</strong> erwartet. ' + confBadge('B') + cite('base-endlager')
  ].map(x => '<li>' + x + '</li>').join('');

  mount('#table-endlager', table(
    [{ l: 'Land' }, { l: 'Projekt' }, { l: 'Status 2026' }, { l: 'erste Einlagerung', num: true }, { l: 'Konfidenz' }],
    kr.endlager_status.map(e => [e.land, e.projekt || '—', deAscii(e.status),
      e.erste_einlagerung_jahr ? e.erste_einlagerung_jahr : 'offen', confBadge(e.stufe)])));

  renderLimitations();
  renderGes();
}

function renderLimitations() {
  const P = S.page;
  $('#lim-simplifications').innerHTML = [
    '<strong>Ein Wetterjahr, kein Ensemble.</strong> Das Modell rechnet mit den Profilen eines einzigen ' +
      'Zeitraums. Ein Extremwetterjahr würde Backup- und Speicherbedarf anders ausfallen lassen.',
    '<strong>Kein Import/Export, kein Lastmanagement.</strong> Beides existiert real und würde das System ' +
      'entlasten. Die Vereinfachung ist damit <em>konservativ</em> — sie macht jedes Szenario eher teurer, ' +
      'und zwar alle gleichermaßen.',
    '<strong>Keine räumliche Netzsimulation.</strong> Der Netzausbau geht nur als top-down-Kostenzuschlag ' +
      'ein, linear mit dem fEE-Anteil skaliert — dieselbe Vereinfachung wie in der GES-Studie, inklusive ' +
      'derselben Limitation. Zugrunde liegen ' + fmt(S.params.system.grid.investment_bn_eur_until_2045.value, 0) +
      ' Mrd. € Investitionsvolumen bis 2045 ' + confBadge(S.params.system.grid.investment_bn_eur_until_2045.confidence) +
      cite('imk-netzkosten') + ', abgeschrieben über ' + fmt(S.params.system.grid.lifetime_years.value, 0) +
      ' Jahre — die Abschreibungsdauer ist eine <strong>Modellannahme ohne Quellenbeleg</strong> ' +
      confBadge('M') + '.',
    '<strong>Speicher-Dispatch ist greedy, nicht optimiert.</strong> Das Modell unterstellt <em>keine</em> ' +
      'perfekte Voraussicht. Das überschätzt den Speicherbedarf tendenziell leicht.',
    '<strong>Kernkraft läuft als Band.</strong> Ein lastfolgender Betrieb würde die Abregelung senken, ' +
      'aber auch die Volllaststunden — und damit die LCOE-Basis. Wer 8.000 h <em>und</em> hohen EE-Anteil ' +
      'unterstellt, rechnet inkonsistent.',
    '<strong>Der „direkte“ CO₂-Faktor ist selbst nur ein Proxy.</strong> Eingepreist wird ausschließlich ' +
      'die Verbrennung fossiler Erzeugung — aber ein direkter Verbrennungs-Emissionsfaktor fehlt in ' +
      'allen Dossiers. Das Modell setzt ersatzweise die UNECE-Lebenszyklus-<em>Untergrenze</em> für GuD ' +
      'an (' + fmt(Number(S.params.technologies.gas_ccgt.params.emission_factor_t_mwh.value) * 1000, 0) +
      ' g/kWh) ' + confBadge(S.params.technologies.gas_ccgt.params.emission_factor_t_mwh.confidence) +
      '; das ist als Lücke <code>emissionsfaktor_direkt</code> ausgewiesen und vor einer Verwendung ' +
      'zu ersetzen. Die vollen LCA-Werte (Wind onshore ' +
      fmt(P.co2_intensitaet_g_pro_kwh.technologien.wind_onshore.default, 0) + ' g/kWh ' +
      confBadge(P.co2_intensitaet_g_pro_kwh.technologien.wind_onshore.stufe) + ', Kernkraft ' +
      fmt(P.co2_intensitaet_g_pro_kwh.technologien.kernkraft.default, 1) + ' ' +
      confBadge(P.co2_intensitaet_g_pro_kwh.technologien.kernkraft.stufe) + ', GuD ' +
      fmt(P.co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.default, 0) + ' ' +
      confBadge(P.co2_intensitaet_g_pro_kwh.technologien.erdgas_gud.stufe) + ') ' + cite('unece-2022') +
      ' stehen informativ in den Daten; der deutsche PV-Wert (' +
      fmt(P.co2_intensitaet_g_pro_kwh.technologien.pv_deutschland.default, 0) + ' g/kWh) stammt <em>nicht</em> ' +
      'von der UNECE, sondern aus Fraunhofer-ISE-Sekundärberichterstattung und trägt nur ' +
      confBadge(P.co2_intensitaet_g_pro_kwh.technologien.pv_deutschland.stufe) + '.',
    '<strong>Kostenüberschreitungsfaktoren sind abgeschaltet.</strong> Der Basisfall rechnet mit 1,00, ' +
      'damit Modellkern und Risikoannahme nicht vermischt werden. Wer sie einrechnen will, hat dafür ' +
      'den Schalter in <a href="#kap-6">Kapitel 6</a>.',
    '<strong>Die Monte-Carlo-Rechnung variiert die Kosten, nicht die Physik.</strong> Der stündliche ' +
      'Dispatch wird je Szenario <em>einmal</em> mit mittleren Parametern gerechnet und für alle ' +
      fmt(MC_N_DRAWS, 0) + ' Ziehungen wiederverwendet. Für CAPEX, Fixbetrieb und WACC ist das exakt ' +
      'richtig; für die Volllaststunden ist es eine Näherung, weil sie im Modell eigentlich auch die ' +
      'installierte Leistung und damit Erzeugung, Abregelung und Backup-Bedarf verändern. ' +
      'Die Verteilungen in Kapitel 6 bilden deshalb die <em>Kostenunsicherheit</em> ab, nicht die ' +
      'Unsicherheit der Mengen.',
    '<strong>Die Dreiecksverteilung und die Unabhängigkeit der Ziehungen sind Annahmen.</strong> ' +
      confBadge('M') + ' Aus min/mid/max lässt sich keine Verteilungsform ableiten; die Dreiecksform ' +
      'ist die übliche Wahl, wenn nur drei Punkte bekannt sind. Reale Korrelationen zwischen ' +
      'Parametern (gemeinsame Rohstoff- und Zinsentwicklung; hoher CAPEX an guten Standorten — genau ' +
      'die Warnung aus <code>scenario_sets._warning</code>) sind nicht abgebildet. Das macht die ' +
      'Ränder der Verteilung eher zu schmal als zu breit. Nicht gezogen werden außerdem Wetterjahr, ' +
      'Lastprofil, Lebensdauern, Wirkungsgrade, Brennstoff- und Entsorgungskosten, CO₂-Preis, ' +
      'Netzinvestitionsvolumen und die H₂-Speicherkosten.'
  ].map(x => '<li>' + x + '</li>').join('');

  mount('#table-gaps', table(
    [{ l: 'ID' }, { l: 'Parameter' }, { l: 'Warum das eine Lücke ist' }],
    P.gaps.map(g => ['<code>' + g.id + '</code>', '<code>' + g.parameter + '</code>', deAscii(g.reason)])));

  const cov = S.profiles.series.load_mw.coverage || {};
  const pm = P.profiles_meta;
  /* Bei einem Volljahresprofil ist dieser ganze Abschnitt gegenstandslos —
     er darf dann nicht stehen bleiben (sonst stuende dort „ist als FULL
     markiert: 8784 von 8784 Stunden, und drei Reihen fehlen ganz"). */
  if (S.profilesRaw.meta.data_completeness === 'FULL' && pm.data_completeness === 'FULL') {
    $('#lim-partial').innerHTML =
      '<p>Die Simulation läuft auf einem <strong>vollständigen Jahresprofil</strong> ' +
      '(' + S.profiles.hours + ' Stunden). Die frühere Halbjahres-Einschränkung ist damit ' +
      'gegenstandslos; die Hochrechnungs-Labels der Kennzahlen sind automatisch entfallen.</p>' +
      '<p>' + deAscii(pm.architecture_note) + '</p>';
    return;
  }
  $('#lim-partial').innerHTML =
    '<div class="note crit"><strong>Die stärkste Einschränkung dieses Papiers.</strong> ' +
    '<code>profiles_2024.json</code> ist als <code>' + pm.data_completeness + '</code> markiert: ' +
    S.profiles.hours + ' von ' + (cov.hours_expected || 8784) + ' Stunden, und drei Reihen fehlen ganz.' +
    '<ul style="margin:10px 0 0">' +
    Object.entries(pm.gaps).map(([k, v]) => '<li><code>' + k + '</code>: ' + deAscii(v) + '</li>').join('') +
    '</ul></div>' +
    '<p>Der Grund ist dokumentiert und unbequem: Die drei vorgesehenen Primärquellen ' +
    '(Energy-Charts-API des Fraunhofer ISE, SMARD-API der Bundesnetzagentur, Open Power System Data) ' +
    'waren aus der Arbeitsumgebung heraus per Netzwerk-Egress-Policy nicht erreichbar. Verwendet wurde ' +
    'ersatzweise ein öffentlicher GitHub-Mirror echter SMARD-Exportdaten.' + cite('smard-mirror-2024') +
    ' <strong>Es wurde kein einziger Platzhalter- oder Schätzwert eingesetzt</strong> — lieber eine ' +
    'ausgewiesene Lücke als eine unsichtbare Erfindung.</p>' +
    '<p>Praktisch heißt das: Der abgedeckte Zeitraum Juli–Dezember ist winterlastig. Residuallastspitzen ' +
    'und Backup-Mengen sind überrepräsentiert, PV-Erträge unterrepräsentiert. Die Hochrechnung erfolgt ' +
    'über den <em>Lastanteil</em> des Zeitraums (' + pct(pm.seasonal_share_covered.load_mw.value, 1) +
    ') statt naiv über den Stundenanteil — bei PV wäre die naive Annahme um rund 18 % falsch. ' +
    'Für Wasserstoff-Saisonspeicher ist ein Halbjahresprofil aber grundsätzlich zu kurz: Der Speicher ' +
    'startet gefüllt, weil die Einspeicherphase vor dem 1. Juli liegt. Beide Varianten — mit und ohne ' +
    'Startfüllstand — sind falsch; die Wahrheit liegt dazwischen und ist mit diesen Daten nicht ' +
    'ermittelbar. <strong>Das ist der stärkste Grund, das Profil auf ein Volljahr nachzuziehen.</strong></p>' +
    '<p>' + deAscii(pm.architecture_note) + ' Sobald <code>meta.data_completeness</code> auf <code>FULL</code> steht, ' +
    'verschwinden die Hochrechnungs-Labels auf dieser Seite automatisch.</p>';
}

function renderGes() {
  const G = S.page.ges;
  /* Richtung kommt aus den Daten (`bewertung`), nicht aus einer Textheuristik. */
  const BIAS_COL = { pro: PAL.teal, contra: PAL.accent, neutral: PAL.soft };
  const BIAS_LBL = { pro: 'spricht für die Studie', contra: 'spricht gegen die Studie', neutral: 'ohne Richtung' };
  mount('#table-bias', table(
    [{ l: 'Technologie / Parameter' }, { l: 'Richtung' }, { l: 'Ausmaß' }, { l: 'Effekt auf das Studienergebnis' }],
    G.bias_check.map(b => {
      const bw = b.bewertung || 'neutral';
      const col = BIAS_COL[bw] || PAL.soft;
      return [deAscii(b.technologie),
        '<span style="color:' + col + ';font-weight:600" title="' + BIAS_LBL[bw] + '">' +
          deAscii(b.richtung) + '</span>',
        deAscii(b.ausmass), deAscii(b.effekt)];
    })));

  const sys = G.system_level_estimate.kostenminimum_scenario;
  mount('#table-ges-sens', table(
    [{ l: 'Kernkraft-CAPEX' }, { l: 'geschätztes LSCOE „Kostenminimum“', num: true }],
    sys.map(s => [s.nuclear_capex_assumption,
      s.lscoe_estimate ? fmt(s.lscoe_estimate, 0) + ' €/MWh'
        : fmt(s.lscoe_estimate_range[0], 0) + '–' + fmt(s.lscoe_estimate_range[1], 0) + ' €/MWh'])));

  /* Reproduktion mit GES-Kostenannahmen (Werte aus der Validierung) */
  const dev = $('#ges-repro-dev');
  if (dev) dev.textContent = '±' + fmt(G.lcoe_reproduction_max_deviation_pct, 2) + ' %';
  const pub = G.reference.scenarios;
  const modelled = G.model_reproduction;
  mount('#table-ges-repro', table(
    [{ l: 'Szenario' }, { l: 'GES', num: true }, { l: 'Modell', num: true }, { l: 'Abw.', num: true }],
    pub.map(s => {
      const m = modelled[s.name];
      return [s.name, fmt(s.lscoe, 0), fmt(m, 0), fmt((m - s.lscoe) / s.lscoe * 100, 0) + ' %'];
    })));
}

/* --- Fazit ------------------------------------------------------------- */
function renderConclusion() {
  const P = S.page;
  const nucRange = P.lcoe_benchmarks.nuclear.resulting_range;
  /* Extremwerte und Flamanville aus den Referenzprojekten holen, nicht hartcodieren.
     Paks II ist laut Dossier ausdruecklich NICHT als Kostenreferenz zu verwenden. */
  const nucProj = P.nuclear_reference_projects
    .filter(p => p.capex_eur_kw && p.id !== 'paks-ii')
    .sort((a, b) => a.capex_eur_kw - b.capex_eur_kw);
  const nucLow = nucProj[0], nucHigh = nucProj[nucProj.length - 1];
  const nucFla = P.nuclear_reference_projects.find(p => p.id === 'flamanville-3');
  const ws = P.wacc_sensitivity.wacc_effect_at_60y;
  const items = [
    { t: 'Der Kapitalkostensatz entscheidet mehr als die Technologiewahl.',
      b: 'Zwischen WACC 3 % und 10 % liegt beim Kapitalwiedergewinnungsfaktor der Faktor <strong>' +
         fmt(ws.factor_3pct_to_10pct, 2) + '</strong> — mehr als jede plausible CAPEX-Variation und ein ' +
         'Vielfaches des Lebensdauer-Effekts (60 vs. 80 Jahre: rund 3 %). Das ist keine Quellenangabe, ' +
         'sondern Arithmetik der Annuitätenformel (Dossier <code>kosten_kernkraft.md</code> 5.3/8, ' +
         'nachgerechnet in <code>scripts/model.py</code>). Das gilt für Kernkraft und Offshore-Wind ' +
         'am stärksten, für PV am schwächsten. <em>Unsicherheit:</em> gering — der Effekt ist reine Arithmetik ' +
         'der Annuitätenmethode und in diesem Papier gegen die Python-Referenz geprüft. ' +
         '<em>Gegenrichtung, gleicher Befund:</em> Bei 3 % ist Kernkraft laut IEA/NEA in allen ' +
         'untersuchten Ländern die günstigste Option, bei 10 % in praktisch keinem. ' +
         confBadge(P.wacc_sensitivity.iea_nea_2020.confidence) + cite('iea-nea-2020') },
    { t: 'Ein einzelner Punktwert für Kernkraftkosten ist immer irreführend — in beide Richtungen.',
      b: 'Reale Neubaukosten reichen von rund ' + fmt(nucLow.capex_eur_kw, 0) + ' €/kW (' +
         nucLow.country + ', ' + deAscii(String(nucLow.label).replace(/\s*\(.*\)$/, '')) +
         ') bis rund ' + fmt(nucHigh.capex_eur_kw, 0) + ' €/kW (' + nucHigh.country + ', ' +
         deAscii(nucHigh.label) + ') — mehr als das ' +
         fmt(nucHigh.capex_eur_kw / nucLow.capex_eur_kw, 0) + '-Fache. ' + confBadge('A') +
         ' Die aktuellen <em>EU-Neubauprogramme</em> — Dukovany II (CZ), EPR2 (FR), Lubiatowo-Kopalino (PL), ' +
         'Sizewell C (UK) — liegen mit rund 7.900–13.500 €/kW systematisch dazwischen; die westlichen ' +
         '<em>Erstbauten</em> Flamanville 3 (' + fmt(nucFla.capex_eur_kw, 0) + ' €/kW) und Hinkley Point C ' +
         'liegen darüber, nicht in diesem Band. ' +
         'Das Dossier-Band für ein realistisches EU-Neubauszenario reicht von ' +
         '<strong>' + fmt(nucRange.realistisch_eu.lcoe, 0) + ' €/MWh</strong> (' +
         fmt(nucRange.realistisch_eu.capex, 0) + ' €/kW, WACC ' + pct(nucRange.realistisch_eu.wacc, 0) +
         ') bis <strong>' + fmt(nucRange.pessimistisch.lcoe, 0) + ' €/MWh</strong> (' +
         fmt(nucRange.pessimistisch.capex, 0) + ' €/kW, WACC ' + pct(nucRange.pessimistisch.wacc, 0) +
         '); der einzige öffentlich dokumentierte vertraglich fixierte Wert (Hinkley-CfD, ' +
         fmt(P.lcoe_benchmarks.nuclear.third_party.find(x => x.source_id === 'iwr-hinkley-2026').lcoe_eur_mwh, 0) +
         ' €/MWh ' + confBadge(srcConf('iwr-hinkley-2026')) + cite('iwr-hinkley-2026') +
         ') liegt im unteren Drittel davon. <em>Unsicherheit:</em> hoch bei den Absolutwerten, ' +
         'gering bei der Spannweite.' },
    { t: 'Die Volllaststunden-Annahme bei Wind ist ein größerer Hebel als der CAPEX — und wird selten diskutiert.',
      b: 'Die deutsche Bestandsflotte erreichte 2025 rund ' +
         fmt(P.lcoe_benchmarks.wind_onshore.full_load_hours_fleet.value_2025, 0) + ' Volllaststunden, ' +
         'Neuanlagen im Mittel über 2.400. ' + confBadge('A') + ' Wer mit Bestandswerten rechnet, verteuert ' +
         'Windstrom um rund 30 % — bei identischen Baukosten. Der Realitätscheck stützt die niedrigeren ' +
         'Kosten: Die BNetzA-Ausschreibung im Mai 2026 ergab mengengewichtet ' +
         fmt(P.lcoe_benchmarks.wind_onshore.auction[P.lcoe_benchmarks.wind_onshore.auction.length - 1].weighted_avg, 1) +
         ' €/MWh. ' + confBadge('A') + cite('bnetza-wind-2026-05') + ' <em>Unsicherheit:</em> gering.' },
    { t: 'Die Systemkosten entscheiden sich nicht an den Erzeugungskosten, sondern an der Speicherfrage.',
      b: 'In der Simulation macht der Erzeugungsblock in EE-lastigen Szenarien nur einen Teil des LSCOE aus; ' +
         'Wasserstoffspeicher, Rückverstromung und Netz dominieren die Differenz zwischen den Szenarien. ' +
         'Die H₂-Kette ist dabei der teuerste und unsicherste Block: Der realistische Round-Trip-Wirkungsgrad ' +
         'Strom→H₂→Strom liegt bei <strong>30–40 %</strong>, nicht bei 50 %+. ' + confBadge('B') +
         ' <em>Unsicherheit:</em> hoch — hier wirkt die Halbjahres-Datenbasis am stärksten.' },
    { t: 'Der modellierte Speicherbedarf stößt an eine physische Grenze, die in keiner Kostenrechnung auftaucht.',
      b: 'Das deutsche Umwidmungspotenzial für Wasserstoff-Salzkavernen liegt bei rund ' +
         fmt(S.params.technologies.h2_storage.params.de_repurposing_potential_twh.value, 0) + ' TWh ' +
         confBadge('B') + ', die Fraunhofer-ISE-Referenz für den Bedarf 2045 bei ' +
         fmt(S.params.system.security_of_supply.h2_storage_need_2045_twh.value, 0) + ' TWh ' + confBadge('C') +
         '. Weil das Modell H₂-Speicherung über den <em>Durchsatz</em> bepreist, ist das eine Mengen-, keine ' +
         'Kostenrestriktion — sie verschwindet aus jeder €/MWh-Betrachtung und muss separat benannt werden. ' +
         '<em>Unsicherheit:</em> die Bedarfsschätzungen streuen um Faktor 3.' },
    { t: 'Dunkelflaute ist ein Preis-, kein Blackout-Problem — solange gesicherte Leistung vorgehalten wird.',
      b: 'Im Referenzfall Dezember 2024 stellten Bundesnetzagentur und Bundeskartellamt kein Marktversagen, ' +
         'aber ein strukturelles Problem fest; Reserven waren vorhanden, die Preise erreichten über ' +
         '1.000 €/MWh. ' + confBadge('A') + cite('bnetza-preisspitzen-2025') + ' Der amtlich ermittelte ' +
         'Zusatzbedarf an gesicherter Leistung für 2030 liegt bei ' +
         fmt(S.params.system.security_of_supply.firm_capacity_gap_2030_gw.min, 0) + '–' +
         fmt(S.params.system.security_of_supply.firm_capacity_gap_2030_gw.max, 0) + ' GW ' +
         confBadge(S.params.system.security_of_supply.firm_capacity_gap_2030_gw.confidence) +
         '. <em>Unsicherheit:</em> mittel — die Spanne hängt am Erfolg der Nachfrageflexibilisierung.' }
  ];
  const box = $('#fazit-list'); clear(box);
  items.forEach((it, i) => box.appendChild(el('div', { cls: 'card',
    html: '<p class="card-t">Kernaussage ' + (i + 1) + '</p>' +
      '<p style="font-family:Fraunces,serif;font-size:19px;font-weight:650;line-height:1.3;margin:0 0 8px">' +
      it.t + '</p><p style="font-size:15px;margin-bottom:0">' + it.b + '</p>' })));
  box.appendChild(el('div', { cls: 'note',
    html: '<strong>Was hier bewusst nicht steht.</strong> Eine Empfehlung, welchen Mix Deutschland bauen ' +
      'sollte. Diese Frage enthält Abwägungen — Risikobereitschaft, Zeitpräferenz, Souveränitätsziele —, ' +
      'die kein Kostenmodell entscheiden kann. Was ein Modell leisten kann, ist, die Kosten jeder ' +
      'Entscheidung sichtbar und nachrechenbar zu machen. Genau dafür sind die Regler oben da.' }));
}

/* --- Executive Summary -------------------------------------------------
   Destillat des Fazits (Kapitel 8) auf sieben Zeilen. Jede Zeile traegt
   Quelle bzw. Konfidenzstufe und eine Unsicherheitsangabe. Die siebte Zeile
   wird nachgetragen, sobald die Monte-Carlo-Rechnung durch ist.
   --------------------------------------------------------------------- */
function renderExecSummary() {
  const P = S.page;
  const ws = P.wacc_sensitivity.wacc_effect_at_60y;
  const nucProj = P.nuclear_reference_projects
    .filter(p => p.capex_eur_kw && p.id !== 'paks-ii')
    .sort((a, b) => a.capex_eur_kw - b.capex_eur_kw);
  const nucLow = nucProj[0], nucHigh = nucProj[nucProj.length - 1];
  const auc = P.lcoe_benchmarks.wind_onshore.auction[P.lcoe_benchmarks.wind_onshore.auction.length - 1];
  const h2pot = S.params.technologies.h2_storage.params.de_repurposing_potential_twh;
  const h2need = S.params.system.security_of_supply.h2_storage_need_2045_twh;
  const gap = S.params.system.security_of_supply.firm_capacity_gap_2030_gw;
  const zp = P.zielpfade.zielerreichung_anfang_2026;

  const items = [
    ['Der Kapitalkostensatz entscheidet mehr als die Technologiewahl.',
      'Zwischen WACC 3 % und 10 % liegt beim Kapitalwiedergewinnungsfaktor der Faktor ' +
      fmt(ws.factor_3pct_to_10pct, 2) + ' — mehr als jede plausible CAPEX-Variation. Reine Arithmetik ' +
      'der Annuitätenformel, keine Quellenangabe. Gegenrichtung: Bei 3 % ist Kernkraft laut IEA/NEA in ' +
      'allen untersuchten Ländern die günstigste Option, bei 10 % in praktisch keinem. ' +
      confBadge(P.wacc_sensitivity.iea_nea_2020.confidence) + cite('iea-nea-2020'),
      'gering — nachgerechnet gegen die Python-Referenz'],
    ['Ein Punktwert für Kernkraftkosten ist immer irreführend.',
      'Reale Neubaukosten reichen von ' + fmt(nucLow.capex_eur_kw, 0) + ' bis ' +
      fmt(nucHigh.capex_eur_kw, 0) + ' €/kW (' + nucLow.country + ' bis ' + nucHigh.country + '), ' +
      'mehr als das ' + fmt(nucHigh.capex_eur_kw / nucLow.capex_eur_kw, 0) + '-Fache. ' + confBadge('A'),
      'hoch bei den Absolutwerten, gering bei der Spannweite'],
    ['Die Volllaststunden-Annahme bei Wind ist ein größerer Hebel als der CAPEX.',
      'Bestandsflotte 2025 rund ' + fmt(P.lcoe_benchmarks.wind_onshore.full_load_hours_fleet.value_2025, 0) +
      ' h gegenüber über 2.400 h bei Neuanlagen — rund 30 % Kostenunterschied bei identischen Baukosten. ' +
      'Die BNetzA-Ausschreibung Mai 2026 ergab mengengewichtet ' + fmt(auc.weighted_avg, 1) + ' €/MWh. ' +
      confBadge('A') + cite('bnetza-wind-2026-05'),
      'gering'],
    ['Die Systemkosten entscheiden sich an der Speicherfrage, nicht an den Erzeugungskosten.',
      'In der Simulation dominieren Wasserstoffkette und Netz die Differenz zwischen den Szenarien. ' +
      'Der realistische Round-Trip-Wirkungsgrad Strom→H₂→Strom liegt bei 30–40 %, nicht bei 50 %+. ' +
      confBadge('B'),
      'hoch — hier wirkt die Halbjahres-Datenbasis am stärksten'],
    ['Der Speicherbedarf stößt an eine physische Grenze, die in keiner Kostenrechnung auftaucht.',
      'Deutsches Kavernen-Umwidmungspotenzial rund ' + fmt(h2pot.value, 0) + ' TWh ' +
      confBadge(h2pot.confidence) + ', Bedarfsschätzung 2045 rund ' + fmt(h2need.value, 0) + ' TWh ' +
      confBadge(h2need.confidence) + '. Das Modell bepreist Durchsatz, nicht Kavernenvolumen — die ' +
      'Restriktion verschwindet aus jeder €/MWh-Betrachtung.',
      'die Bedarfsschätzungen streuen um Faktor 3'],
    ['Dunkelflaute ist ein Preis-, kein Blackout-Problem — solange gesicherte Leistung vorgehalten wird.',
      'Im Referenzfall Dezember 2024 stellten Bundesnetzagentur und Bundeskartellamt kein Marktversagen, ' +
      'aber ein strukturelles Problem fest. ' + confBadge('A') + cite('bnetza-preisspitzen-2025') +
      ' Der amtlich ermittelte Zusatzbedarf an gesicherter Leistung für 2030 liegt bei ' +
      fmt(gap.min, 0) + '–' + fmt(gap.max, 0) + ' GW ' + confBadge(gap.confidence) + '. ' +
      'Zugleich verfehlt der Ausbau die eigenen Gesetzesziele: PV ' + fmt(zp.photovoltaik.erreichung_prozent, 0) +
      ' %, Wind onshore ' + fmt(zp.wind_onshore.erreichung_prozent, 0) + ' % des 2030er Ziels. ' + confBadge('A'),
      'mittel — die Spanne hängt am Erfolg der Nachfrageflexibilisierung']
  ];

  /* Siebte Kernaussage: das Monte-Carlo-Ergebnis, sobald es vorliegt. */
  if (MC.res) {
    const key = mcCfgKey();
    const order = MC.order || S.mcRef.preset_order;
    const st = order.map(pid => ({ label: MC.res[pid].label, s: MC.res[pid].configs[key] }))
      .sort((a, b) => a.s.p50 - b.s.p50);
    let ov = 0;
    for (let i = 0; i < st.length - 1; i++) if (st[i].s.p95 > st[i + 1].s.p5) ov++;
    items.push(['Die Rangfolge der Szenarien ist unsicherer, als die Punktwerte suggerieren.',
      'Werden alle dokumentierten Parameterspannen als Verteilung gezogen (' + fmt(MC_N_DRAWS, 0) +
      ' Ziehungen je Szenario), reicht das System-LSCOE von ' +
      st.map(x => x.label.replace('GES · ', '') + ' ' + fmt(x.s.p50, 0) + ' [' + fmt(x.s.p5, 0) + '–' +
        fmt(x.s.p95, 0) + ']').join(', ') + ' €/MWh. ' +
      (ov ? '<strong>' + ov + ' benachbarte Szenario-Paare überlappen sich</strong> im Bereich P5–P95 — ' +
        'für sie ist die Reihenfolge nicht entschieden.'
          : 'Kein benachbartes Paar überlappt sich im Bereich P5–P95.'),
      'die Verteilungsform (Dreieck) und die Unabhängigkeit der Ziehungen sind Annahmen, keine Befunde']);
  } else {
    items.push(['Die Rangfolge der Szenarien ist unsicherer, als die Punktwerte suggerieren.',
      'Die Monte-Carlo-Rechnung läuft gerade — das Ergebnis erscheint hier automatisch ' +
      '(Details in Kapitel 6).', 'wird nachgetragen']);
  }

  const box = $('#exec-list'); clear(box);
  const ol = el('ol', { cls: 'exec' });
  items.forEach(([t, b, u]) => ol.appendChild(el('li', {
    html: '<strong>' + t + '</strong> ' + b +
      '<span class="exec-u">Unsicherheit: ' + u + '</span>'
  })));
  box.appendChild(ol);
  buildCitations();
}

/* --- Sticky Kapitel-Navigation ----------------------------------------- */
function setupChapterNav() {
  const links = $$('#chapnav a');
  const targets = links.map(a => $(a.getAttribute('href')));
  const nav = $('#chapnav');
  const toggle = $('#chapnav-toggle');
  if (toggle) {
    toggle.onclick = () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    $$('#chapnav a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }
  const mark = () => {
    const y = window.scrollY + (nav ? nav.offsetHeight : 0) + 90;
    let active = 0;
    targets.forEach((t, i) => { if (t && t.offsetTop <= y) active = i; });
    links.forEach((a, i) => a.classList.toggle('on', i === active));
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => { mark(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', mark, { passive: true });
  mark();
}

/* --- Quellenverzeichnis ------------------------------------------------ */
function renderSources() {
  const list = $('#sources-list'); clear(list);
  S.page.sources.forEach(s => {
    list.appendChild(el('li', { html:
      '<strong>' + s.title + '</strong>' + (s.publisher ? '. ' + s.publisher : '') +
      (s.date ? ', ' + s.date : '') + '. ' + confBadge(s.confidence) +
      (s.note ? '<br><em>' + s.note + '</em>' : '') +
      '<br><a href="' + s.url + '" target="_blank" rel="noopener">' + s.url + '</a>' +
      '<br><span style="font-size:12.5px;color:var(--soft)">Zugriff ' + (s.accessed || '–') +
      (s.dossier ? ' · übernommen aus <code>' + s.dossier + '</code>' : '') + '</span>' }));
  });
}

/* ---------------------------------------------------------------------
   10 - Kapitel 6: Monte-Carlo-Simulation

   Portierung von strommix/scripts/monte_carlo.py. PRNG, Ziehungsreihenfolge,
   Kostenfunktion und Perzentilmethode sind identisch; der Paritaetstest am
   Ende dieses Abschnitts prueft die P50-Werte gegen
   strommix/data/monte_carlo_reference.json nach (Toleranz 0,5 %).

   Vereinfachung (im Kapitel und in den Limitationen ausgewiesen): Der
   Dispatch wird je Preset EINMAL mit mittleren Parametern gerechnet; die
   Ziehungen wirken nur auf die Kostenseite.
   --------------------------------------------------------------------- */
const MC_N_DRAWS = 1000;
const MC_BASE_SEED = 20260815;

const MC_DRAW_TECHS = ['pv_freiflaeche', 'wind_onshore', 'wind_offshore', 'nuclear',
  'gas_ccgt', 'gas_ccs', 'battery', 'electrolyser', 'h2_turbine', 'h2_storage'];
const MC_DRAW_FIELDS = ['capex_eur_kw', 'capex_eur_kwh', 'opex_pct', 'opex_eur_kw_a', 'full_load_hours',
  /* v0.2 (M2): Erdgas-Brennstoffpreis, thermisch */
  'fuel_eur_mwh_th',
  /* v0.2b: CO2-Abscheidung */
  'ccs_cost_eur_t', 'capture_rate'];
/* v0.2 (M1/M7): Abgrenzungsanteile folgen dem gezogenen CAPEX */
const MC_SCOPE_SHARE_FIELDS = ['idc_applicable_share', 'overrun_applicable_share'];
const MC_OVERRUN_CLASS = {
  pv_freiflaeche: 'solar', wind_onshore: 'wind', wind_offshore: 'wind',
  nuclear: 'kernkraft', gas_ccgt: 'fossil_thermisch', gas_ccs: 'fossil_thermisch',
  netz: 'netz_uebertragung'
};
/* Reihenfolge und Inhalt muessen mit CONFIGS in monte_carlo.py uebereinstimmen -
   sie bestimmen den Seed (base_seed + Index) und damit die Ziehungsfolge. */
const MC_CONFIGS = [
  { id: 'base', wacc: false, co2: false, overrun: false },
  { id: 'wacc', wacc: true, co2: false, overrun: false },
  { id: 'co2', wacc: false, co2: true, overrun: false },
  { id: 'wacc_co2', wacc: true, co2: true, overrun: false },
  { id: 'overrun', wacc: false, co2: false, overrun: true },
  { id: 'wacc_overrun', wacc: true, co2: false, overrun: true },
  /* v0.2b: Kontrastverteilung Asien/Golf - nie mit der Basisspanne gemischt */
  { id: 'asia', wacc: false, co2: false, overrun: false, nuclearCapex: 'asia_gulf' },
  { id: 'asia_wacc', wacc: true, co2: false, overrun: false, nuclearCapex: 'asia_gulf' }
];

/* mulberry32 - bitgleich zur Python-Referenz (32-Bit-Arithmetik). */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = ((t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Inverse Verteilungsfunktion der Dreiecksverteilung. */
function triangular(u, lo, mode, hi) {
  if (hi <= lo) return lo;
  if (mode < lo) mode = lo;
  if (mode > hi) mode = hi;
  const c = (mode - lo) / (hi - lo);
  if (u < c) return lo + Math.sqrt(u * (hi - lo) * (mode - lo));
  return hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mode));
}

function percentileOf(sorted, p) {
  if (!sorted.length) return NaN;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function mcDrawable(entry) {
  if (!entry || typeof entry !== 'object') return false;
  const lo = entry.min, mid = entry.mid, hi = entry.max;
  if (lo === null || lo === undefined || hi === null || hi === undefined) return false;
  if (mid === null || mid === undefined) return false;
  return hi > lo;
}

function mcDrawPlan(params) {
  const plan = [];
  MC_DRAW_TECHS.forEach(techKey => {
    const tech = params.technologies[techKey];
    if (!tech) return;
    MC_DRAW_FIELDS.forEach(field => {
      const e = tech.params[field];
      if (mcDrawable(e)) plan.push({ tech: techKey, field: field, min: e.min, mid: e.mid, max: e.max });
    });
  });
  return plan;
}

function mcOverrunPlan(page) {
  const tab = page.kostenueberschreitung_faktoren.technologien;
  const plan = [];
  MC_DRAW_TECHS.concat(['netz']).forEach(key => {
    const cls = MC_OVERRUN_CLASS[key];
    if (!cls || !tab[cls]) return;
    const rec = tab[cls];
    const mode = (rec.flyvbjerg !== null && rec.flyvbjerg !== undefined) ? rec.flyvbjerg : rec.sovacool;
    plan.push({ target: key, cls: cls, min: rec.spanne[0], mid: mode, max: rec.spanne[1] });
  });
  return plan;
}

/* Die fuenf Presets des Mix-Simulators, unabhaengig von den Reglerstellungen.
   Muss mit build_presets() in monte_carlo.py uebereinstimmen. */
function mcPresets() {
  const P = S.page, rec = P.ges.reconstruction, split = rec.fee_split_assumption;
  const mix25 = P.ist_mix['2025'].traeger_twh;
  const bsv = P.ist_mix['2025'].bruttostromverbrauch;
  const demand25 = (bsv.low + bsv.high) / 2;
  const bat25 = P.installierte_leistung_gw.batteriespeicher.leistung_gw.high;
  const dur = Number(resolveTech(S.params, 'battery', 'mittel').duration_hours || 4);
  const store = (batGw, elyGw, h2tGw, h2sTwh, fill, gasAuto) => ({
    battery_power_gw: batGw, battery_energy_gwh: batGw * dur, electrolyser_gw: elyGw,
    h2_storage_gwh: h2sTwh * 1000, h2_turbine_gw: h2tGw, h2_initial_fill_share: fill,
    gas_backup_gw: gasAuto ? null : 20
  });
  const feeShares = (feeGw, demand) => {
    const out = {};
    [['pv', 'pv_freiflaeche'], ['wind_onshore', 'wind_onshore'], ['wind_offshore', 'wind_offshore']]
      .forEach(([k, techKey]) => {
        const flh = Number(resolveTech(S.params, techKey, 'mittel').full_load_hours);
        out[k] = feeGw * split[k] * MW_PER_GW * flh / MWH_PER_TWH / demand;
      });
    return out;
  };

  const d25 = Math.round(demand25 / 10) * 10;
  /* v0.2 (M6): Bestandsbaender + heutiges Netzentgelt statt Ausbau-Annuitaet */
  const lb = S.params.system.legacy_bands;
  const presets = [{
    id: 'ist2025', label: 'Ist 2025 (Referenzsystem)', demand: d25,
    shares: { pv: mix25.photovoltaik.wert / d25, wind_onshore: mix25.wind_onshore.wert / d25,
      wind_offshore: mix25.wind_offshore.wert / d25 },
    storage: store(Math.round(bat25 / 5) * 5, 0, 0, 0, 0, true),
    bands_twh: {
      coal_band: lb.coal.generation_2025_twh.value,
      biomass_band: lb.biomass.generation_2025_twh.value,
      hydro_band: lb.hydro.generation_2025_twh.value
    },
    grid_cost_basis: 'ist_netzentgelt', comparable: false, gas_tech: 'gas_ccgt'
  }];
  /* v0.2b: je eine CCS-Variante zu den beiden gasgestuetzten Presets */
  [['kostenminimum', 'GES · Kostenminimum', 0, 0, 0, 0, 0, true, 'kostenminimum'],
   ['kostenminimum_ccs', 'GES · Kostenminimum (Gas mit CCS)', 0, 0, 0, 0, 0, true, 'kostenminimum'],
   ['ee80_gas', 'GES · 80 % EE + Gas', 40, 0, 0, 0, 0, true, 'ee80_gas'],
   ['ee80_gas_ccs', 'GES · 80 % EE + Gas mit CCS', 40, 0, 0, 0, 0, true, 'ee80_gas'],
   ['ee80_h2', 'GES · 80 % EE + H₂', 40, 100, 80, 300, 1.0, false, 'ee80_h2'],
   ['ee100', 'GES · 100 % Erneuerbare', 60, 160, 90, 120, 1.0, false, 'ee100']
  ].forEach(([id, label, bat, ely, h2t, h2s, fill, gasAuto, baseId]) => {
    const demand = Number(rec.demand_twh);
    const s = feeShares(rec.scenarios[baseId].fee_gw, demand);
    const shares = { pv: s.pv, wind_onshore: s.wind_onshore, wind_offshore: s.wind_offshore };
    if (baseId === 'kostenminimum') {
      const nuc = Math.max(0, 1 - (s.pv + s.wind_onshore + s.wind_offshore));
      if (nuc > 0) shares.nuclear = nuc;
    }
    presets.push({ id: id, label: label, demand: demand, shares: shares,
      storage: store(bat, ely, h2t, h2s, fill, gasAuto),
      bands_twh: {}, grid_cost_basis: 'buildout_2045', comparable: true,
      gas_tech: id.slice(-4) === '_ccs' ? 'gas_ccs' : 'gas_ccgt' });
  });
  return presets;
}

/* Schritt 3 aus mixSystem() ueber einem bereits gerechneten Dispatch. */
function systemCostFromDispatch(shares, demandTwh, params, techs, disp, wacc, co2Price, storage, overrun, gridCostBasis, gasTech) {
  overrun = overrun || {};
  gridCostBasis = gridCostBasis || 'buildout_2045';
  gasTech = gasTech || 'gas_ccgt';
  const annualize = 1.0 / (disp.seasonal_share_load || 1.0);
  const cost = {};
  const techForShare = { pv: 'pv_freiflaeche', wind_onshore: 'wind_onshore',
    wind_offshore: 'wind_offshore', nuclear: 'nuclear' };
  const fixedCost = (techKey) => {
    const flat = Object.assign({}, techs[techKey], { cost_overrun_factor: overrun[techKey] || 1.0 });
    return annualFixedCostEurKw(flat, wacc);
  };

  for (const shareKey in shares) {
    const techKey = techForShare[shareKey] || shareKey;
    const flh = Number(techs[techKey].full_load_hours);
    const capGw = shares[shareKey] * demandTwh * MWH_PER_TWH / flh / MW_PER_GW;
    if (capGw > 0) cost[shareKey] = (cost[shareKey] || 0) + fixedCost(techKey) * capGw * KW_PER_GW;
    const flat = techs[techKey];
    const varC = Number(flat.fuel_eur_mwh || 0) + Number(flat.waste_eur_mwh || 0)
      + co2Price * Number(flat.emission_factor_t_mwh || 0);
    if (varC) {
      let genTwh = disp.vre_potential_twh[shareKey];
      if (genTwh === undefined || genTwh === null) genTwh = (shareKey === 'nuclear') ? disp.energy_twh.nuclear_band : 0;
      cost[shareKey] = (cost[shareKey] || 0) + varC * genTwh * annualize * MWH_PER_TWH;
    }
  }

  let gasGw = storage.gas_backup_gw;
  if (gasGw === null || gasGw === undefined) gasGw = disp.gas_peak_gw;
  const efGasMc = Number(techs[gasTech].emission_factor_t_mwh || 0);
  const ccsMc = ccsChain(techs[gasTech]);   /* v0.2b */
  if (gasGw > 0) {
    cost.gas_backup = (cost.gas_backup || 0) + fixedCost(gasTech) * gasGw * KW_PER_GW;
    /* v0.2 (M2): Brennstoffpreis thermisch -> elektrisch */
    const fuel = fuelEurMwhEl(techs[gasTech]).fuel;
    cost.gas_backup += (fuel + co2Price * efGasMc + ccsMc[0]) *
      disp.energy_twh.gas_backup * annualize * MWH_PER_TWH;
  }
  /* v0.2 (M6): Kohle-Bestandsband, nur CO2-Kosten */
  const coalTwhMc = (disp.energy_twh.coal_band || 0) * annualize;
  const efCoalMc = Number((((params.system.legacy_bands || {}).coal || {}).emission_factor_t_mwh || {}).value || 0);
  if (coalTwhMc > 0 && efCoalMc) cost.coal_band = (cost.coal_band || 0) + co2Price * efCoalMc * coalTwhMc * MWH_PER_TWH;

  const batGwh = storage.battery_energy_gwh || 0;
  if (batGwh) {
    const bat = techs.battery;
    const ann = Number(bat.capex_eur_kwh) * (overrun.battery || 1.0)
      * (crf(wacc, Number(bat.lifetime_years)) + Number(bat.opex_pct));
    cost.battery = ann * batGwh * 1e6;
  }
  if (storage.electrolyser_gw) cost.electrolyser = fixedCost('electrolyser') * storage.electrolyser_gw * KW_PER_GW;
  if (storage.h2_storage_gwh) {
    const h2Cost = Number(techs.h2_storage.storage_cost_eur_mwh_h2) * (overrun.h2_storage || 1.0);
    const throughputTwh = Math.max(disp.energy_twh.h2_produced, disp.h2_withdrawn_twh) * annualize;
    cost.h2_storage = h2Cost * throughputTwh * MWH_PER_TWH;
  }
  if (storage.h2_turbine_gw) cost.h2_turbine = fixedCost('h2_turbine') * storage.h2_turbine_gw * KW_PER_GW;

  /* v0.2 (M3): Uebertragung + Verteilnetz getrennt, Skalierung gedeckelt */
  const grid = params.system.grid;
  const gridCrfMc = crf(wacc, grid.lifetime_years.value);
  const servedTwhA = disp.energy_twh.served * annualize;
  if (gridCostBasis === 'ist_netzentgelt') {
    cost.netz = Number(pickVal(grid.ist_2025_eur_mwh, 'mid')) * servedTwhA * MWH_PER_TWH;
  } else if (gridCostBasis === 'none') {
    cost.netz = 0.0;
  } else {
    const vreGen = disp.energy_twh.vre_generated * annualize;
    const bandGen = disp.energy_twh.band * annualize;
    const curtA = disp.energy_twh.curtailed * annualize;
    const vreUsed = vreGen - ((vreGen + bandGen) ? curtA * vreGen / (vreGen + bandGen) : 0);
    const feeShareUsed = demandTwh ? vreUsed / demandTwh : 0;
    const scaleT = Math.min(1.0, grid.reference_fee_share.value ? feeShareUsed / grid.reference_fee_share.value : 0);
    const scaleD = Math.min(1.0, grid.reference_demand_twh.value ? demandTwh / grid.reference_demand_twh.value : 0);
    cost.netz = (overrun.netz || 1.0) * gridCrfMc * 1e9
      * (pickVal(grid.transmission_bn_eur_until_2045, 'mid') * scaleT
         + pickVal(grid.distribution_bn_eur_until_2045, 'mid') * scaleD);
  }

  let total = 0; for (const k in cost) total += cost[k];
  return servedTwhA ? total / (servedTwhA * MWH_PER_TWH) : NaN;
}

function mcMidTechs(params) {
  const out = {};
  for (const k in params.technologies) out[k] = resolveTech(params, k, 'mittel', null, true);
  return out;
}

/* v0.2 (M4): GEPAARTE Ziehungen (common random numbers). Je Konfiguration
   laeuft EIN Ziehungsstrom; jede Ziehung wird auf alle Presets angewandt.
   Muss zu run_config_paired() in monte_carlo.py bitgleich sein. */
function mcSummarize(rawValues, binsHint) {
  const values = rawValues.slice().sort((a, b) => a - b);
  const lo = values[0], hi = values[values.length - 1], span = hi - lo;
  const bins = binsHint || 28;
  const counts = new Array(bins).fill(0);
  values.forEach(v => {
    let idx = span <= 0 ? bins - 1 : Math.floor((v - lo) / span * bins);
    if (idx >= bins) idx = bins - 1;
    counts[idx]++;
  });
  let sum = 0; values.forEach(v => { sum += v; });
  return {
    p5: percentileOf(values, 0.05), p25: percentileOf(values, 0.25), p50: percentileOf(values, 0.50),
    p75: percentileOf(values, 0.75), p95: percentileOf(values, 0.95),
    mean: sum / values.length, min: lo, max: hi,
    hist: { lo: lo, hi: hi, bins: bins, counts: counts }
  };
}

function mcRunConfigPaired(presets, disps, plan, ovPlan, config, seed, co2Price) {
  const rnd = mulberry32(seed);
  const base = mcMidTechs(S.params);
  const waccSpec = S.params.global.wacc;
  const co2Spec = S.params.global.co2_price_eur_t;
  const midWacc = scenarioWacc(S.params, 'mittel');
  const values = {}; presets.forEach(p => { values[p.id] = new Array(MC_N_DRAWS); });
  /* v0.2b: Kontrastverteilung Asien/Golf ersetzt genau eine Plan-Stelle -
     die Zahl der rnd()-Aufrufe bleibt identisch. */
  const alt = (config.nuclearCapex === 'asia_gulf')
    ? S.params.technologies.nuclear.capex_alternative_asia_gulf : null;

  for (let i = 0; i < MC_N_DRAWS; i++) {
    const techs = {};
    for (const k in base) techs[k] = Object.assign({}, base[k]);
    plan.forEach(d => {
      const u = rnd();
      let lo = d.min, mid = d.mid, hi = d.max;
      if (alt && d.tech === 'nuclear' && d.field === 'capex_eur_kw') {
        lo = alt.min; mid = alt.mid; hi = alt.max;
      }
      techs[d.tech][d.field] = triangular(u, lo, mid, hi);
    });
    if (alt) techs.nuclear.construction_years = alt.construction_years.value;
    MC_DRAW_TECHS.forEach(techKey => {
      const tech = S.params.technologies[techKey];
      if (!tech) return;
      let capEntry = tech.params.capex_eur_kw || tech.params.capex_eur_kwh;
      if (!capEntry) return;
      let drawn = techs[techKey].capex_eur_kw;
      if (drawn === undefined || drawn === null) drawn = techs[techKey].capex_eur_kwh;
      if (drawn === undefined || drawn === null) return;
      if (alt && techKey === 'nuclear') capEntry = alt;
      MC_SCOPE_SHARE_FIELDS.forEach(f => {
        const se = (alt && techKey === 'nuclear') ? alt[f] : tech.params[f];
        if (se) techs[techKey][f] = scopeShareForCapex(capEntry, se, drawn);
      });
    });
    let wacc = midWacc;
    if (config.wacc) wacc = triangular(rnd(), waccSpec.min, waccSpec.mid, waccSpec.max);
    let co2 = co2Price;
    if (config.co2) co2 = triangular(rnd(), co2Spec.min, co2Spec.mid, co2Spec.max);
    const overrun = {};
    if (config.overrun) ovPlan.forEach(o => { overrun[o.target] = triangular(rnd(), o.min, o.mid, o.max); });
    presets.forEach(p => {
      values[p.id][i] = systemCostFromDispatch(p.shares, p.demand, S.params, techs, disps[p.id],
        wacc, co2, p.storage, overrun, p.grid_cost_basis, p.gas_tech);
    });
  }
  return values;
}

/* P(A guenstiger als B) ueber die gepaarten Ziehungen. */
function mcPairwiseRanks(values, order) {
  const out = [];
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      const a = order[i], b = order[j];
      const diff = values[a].map((x, k) => x - values[b][k]);
      const n = diff.length;
      let wins = 0; diff.forEach(d => { if (d < 0) wins++; });
      const sd = diff.slice().sort((x, y) => x - y);
      let sum = 0; sd.forEach(v => { sum += v; });
      out.push({
        a: a, b: b, p_a_cheaper: wins / n, p_b_cheaper: (n - wins) / n,
        median_diff_a_minus_b: percentileOf(sd, 0.50),
        p5_diff: percentileOf(sd, 0.05), p95_diff: percentileOf(sd, 0.95),
        mean_diff: sum / n, decided: Math.max(wins / n, (n - wins) / n) >= 0.95
      });
    }
  }
  return out;
}

const MC = { wacc: false, overrun: false, res: null, ms: 0, running: false, done: false };

/* Laeuft in Haeppchen, damit die Fortschrittsanzeige sichtbar wird. */
function mcRunAll(onProgress) {
  return new Promise(resolve => {
    const presets = mcPresets();
    const plan = mcDrawPlan(S.params), ovPlan = mcOverrunPlan(S.page);
    const co2 = Number(S.params.global.co2_price_eur_t.value);
    const out = {}, disps = {};
    const order = presets.map(p => p.id);
    presets.forEach(p => {
      const det = mixSystem(p.shares, p.demand, S.params, S.profiles, {
        scenario: 'mittel', storage: p.storage, co2_price: co2, grid_variant: 'mid', apply_idc: true,
        bands_twh: p.bands_twh, grid_cost_basis: p.grid_cost_basis, gas_tech: p.gas_tech
      });
      disps[p.id] = det.dispatch;
      out[p.id] = {
        label: p.label, det: det.lscoe_eur_mwh, configs: {},
        emissions_mt_co2_a: det.emissions_mt_co2_a,
        captured_mt_co2_a: det.emissions.captured_mt_co2_a,
        comparable: p.comparable !== false
      };
    });
    const t0 = performance.now();
    let ci = 0;
    /* Ein Chunk = eine Konfiguration, weil der Ziehungsstrom je Konfiguration
       zusammenhaengen muss (common random numbers). */
    const step = () => {
      const c = MC_CONFIGS[ci];
      const values = mcRunConfigPaired(presets, disps, plan, ovPlan, c, MC_BASE_SEED + ci, co2);
      order.forEach(pid => {
        const bins = (S.mcRef && S.mcRef.presets[pid] && S.mcRef.presets[pid].configs[c.id])
          ? S.mcRef.presets[pid].configs[c.id].hist.bins : 28;
        out[pid].configs[c.id] = mcSummarize(values[pid], bins);
      });
      MC.ranks = MC.ranks || {};
      MC.ranks[c.id] = mcPairwiseRanks(values, order);
      ci++;
      if (onProgress) onProgress(ci / MC_CONFIGS.length);
      if (ci < MC_CONFIGS.length) setTimeout(step, 0);
      else { MC.ms = performance.now() - t0; MC.order = order; resolve(out); }
    };
    step();
  });
}

/* Paritaet gegen die Python-Referenz: P50 je Preset und Konfiguration
   sowie der deterministische Punktwert. */
function mcParityTest(res) {
  const ref = S.mcRef;
  const tol = (ref.meta && ref.meta.parity_tolerance_relative) || 0.005;
  const fails = [];
  let checked = 0;
  ref.preset_order.forEach(pid => {
    const r = ref.presets[pid], got = res[pid];
    if (!got) { fails.push({ path: 'mc/' + pid, expected: 1, actual: 0, dev: NaN }); return; }
    checked++;
    if (!closeEnough(got.det, r.deterministic_lscoe_eur_mwh, tol)) {
      fails.push({ path: 'mc/' + pid + '/deterministisch', expected: r.deterministic_lscoe_eur_mwh,
        actual: got.det, dev: (got.det - r.deterministic_lscoe_eur_mwh) / r.deterministic_lscoe_eur_mwh });
    }
    MC_CONFIGS.forEach(c => {
      checked++;
      const exp = r.configs[c.id].p50, act = got.configs[c.id].p50;
      if (!closeEnough(act, exp, tol)) {
        fails.push({ path: 'mc/' + pid + '/' + c.id + '/p50', expected: exp, actual: act,
          dev: (act - exp) / exp });
      }
    });
  });
  return { checked: checked, fails: fails, tol: tol };
}

function mcCfgKey() {
  if (MC.wacc && MC.overrun) return 'wacc_overrun';
  if (MC.wacc) return 'wacc';
  if (MC.overrun) return 'overrun';
  return 'base';
}

/* --- Verteilungs-Chart (Violin je Szenario, gemeinsame x-Achse) -------- */
function renderMcChart() {
  const key = mcCfgKey();
  const order = MC.order || S.mcRef.preset_order;
  const rows = order.map(pid => ({ id: pid, label: MC.res[pid].label,
    det: MC.res[pid].det, st: MC.res[pid].configs[key] }));

  const s = $('#chart-mc'); clear(s);
  const W = 880, padL = 196, padR = 74, padT = 26, padB = 34, rowH = 62;
  const H = padT + rows.length * rowH + padB;
  s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  s.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  const max = niceMax(Math.max(...rows.map(r => r.st.max)) * 1.04);
  const plotW = W - padL - padR;
  const x = v => padL + (v / max) * plotW;

  axisTicks(max, 5).forEach(t => {
    s.appendChild(svg('line', { x1: x(t), x2: x(t), y1: padT - 8, y2: H - padB + 2,
      stroke: PAL.grid, 'stroke-width': 1 }));
    s.appendChild(svg('text', { x: x(t), y: H - padB + 18, 'text-anchor': 'middle', fill: PAL.soft,
      'font-size': 11, 'font-family': 'JetBrains Mono, monospace', text: fmt(t, 0) }));
  });
  s.appendChild(svg('text', { x: W - padR, y: 13, 'text-anchor': 'end', fill: PAL.soft, 'font-size': 11,
    'font-family': 'JetBrains Mono, monospace', text: '€/MWh (System-LSCOE)' }));

  const COLORS = [PAL.teal, PAL.band, PAL.windon, PAL.h2, PAL.accent];
  rows.forEach((r, i) => {
    const yMid = padT + i * rowH + rowH / 2 - 4;
    const c = COLORS[i % COLORS.length];
    const st = r.st, hist = st.hist;
    const maxCount = Math.max(...hist.counts, 1);
    const binW = (hist.hi - hist.lo) / hist.bins;
    const amp = rowH * 0.31;

    s.appendChild(svg('text', { x: padL - 12, y: yMid + 4, 'text-anchor': 'end', fill: PAL.ink,
      'font-size': 12.5, text: r.label }));

    /* Dichtekoerper: gespiegelte Treppe ueber den Histogramm-Bins */
    let up = '', down = '';
    for (let b = 0; b < hist.bins; b++) {
      const x0 = x(hist.lo + b * binW), x1 = x(hist.lo + (b + 1) * binW);
      const h = hist.counts[b] / maxCount * amp;
      up += (b ? ' L' : 'M') + x0.toFixed(1) + ' ' + (yMid - h).toFixed(1) +
            ' L' + x1.toFixed(1) + ' ' + (yMid - h).toFixed(1);
    }
    for (let b = hist.bins - 1; b >= 0; b--) {
      const x0 = x(hist.lo + b * binW), x1 = x(hist.lo + (b + 1) * binW);
      const h = hist.counts[b] / maxCount * amp;
      down += ' L' + x1.toFixed(1) + ' ' + (yMid + h).toFixed(1) +
              ' L' + x0.toFixed(1) + ' ' + (yMid + h).toFixed(1);
    }
    const body = svg('path', { d: up + down + ' Z', fill: c, 'fill-opacity': 0.22, stroke: c,
      'stroke-width': 1 });
    s.appendChild(body);

    /* P5-P95-Linie, P25-P75-Balken, P50-Punkt */
    s.appendChild(svg('line', { x1: x(st.p5), x2: x(st.p95), y1: yMid, y2: yMid, stroke: c, 'stroke-width': 1.6 }));
    [st.p5, st.p95].forEach(v => s.appendChild(svg('line', { x1: x(v), x2: x(v), y1: yMid - 7, y2: yMid + 7,
      stroke: c, 'stroke-width': 1.6 })));
    s.appendChild(svg('rect', { x: x(st.p25), y: yMid - 6, width: Math.max(1, x(st.p75) - x(st.p25)),
      height: 12, rx: 3, fill: c, 'fill-opacity': 0.55 }));
    s.appendChild(svg('circle', { cx: x(st.p50), cy: yMid, r: 5, fill: c, stroke: '#fff', 'stroke-width': 2 }));
    /* Punktwert des deterministischen Laufs als Raute */
    s.appendChild(svg('path', { d: 'M' + x(r.det) + ' ' + (yMid - 15) + ' l5 5 l-5 5 l-5 -5 Z',
      fill: PAL.ink }));

    s.appendChild(svg('text', { x: W - padR + 6, y: yMid + 4, fill: PAL.soft, 'font-size': 11.5,
      'font-family': 'JetBrains Mono, monospace', text: fmt(st.p50, 0) }));

    const g = svg('rect', { x: padL, y: padT + i * rowH, width: plotW, height: rowH - 6, fill: 'transparent' });
    attachTip(g, () => '<b>' + r.label + '</b>' +
      'Punktwert (mittlere Parameter): ' + fmt(r.det, 1) + ' €/MWh<br>' +
      'P50 (Median): ' + fmt(st.p50, 1) + '<br>P5–P95: ' + fmt(st.p5, 1) + ' – ' + fmt(st.p95, 1) +
      '<br>P25–P75: ' + fmt(st.p25, 1) + ' – ' + fmt(st.p75, 1) +
      '<br>Spannweite P95−P5: ' + fmt(st.p95 - st.p5, 1) + ' €/MWh (' +
      pct((st.p95 - st.p5) / st.p50, 0) + ' des Medians)');
    s.appendChild(g);
  });

  legend('#legend-mc', [
    { c: PAL.soft, l: 'Dichte der 1.000 Ziehungen (Breite = Häufigkeit)' },
    { c: PAL.soft, l: 'Balken = P25–P75, Linie = P5–P95, Punkt = Median (P50)' },
    { c: PAL.ink, l: 'Raute = Punktwert des deterministischen Laufs (alle Parameter auf mid)' }
  ]);
}

function renderMcTable() {
  const key = mcCfgKey();
  const order = MC.order || S.mcRef.preset_order;
  const rows = order.map(pid => {
    const r = MC.res[pid], st = r.configs[key];
    return [r.label, fmt(r.det, 0), '<strong>' + fmt(st.p50, 0) + '</strong>',
      fmt(st.p5, 0) + ' – ' + fmt(st.p95, 0), fmt(st.p95 - st.p5, 0),
      pct((st.p95 - st.p5) / st.p50, 0)];
  });
  mount('#table-mc', table([{ l: 'Szenario' }, { l: 'Punktwert', num: true }, { l: 'Median P50', num: true },
    { l: 'P5 – P95', num: true }, { l: 'Spannweite', num: true }, { l: 'relativ zum Median', num: true }], rows));
}

/* Der eigentliche Befund: ueberlappen sich die Verteilungen? */
function renderMcFinding() {
  const key = mcCfgKey();
  const order = MC.order || S.mcRef.preset_order;
  const items = order.map(pid => ({ id: pid, label: MC.res[pid].label, det: MC.res[pid].det,
    st: MC.res[pid].configs[key] }));
  const byMedian = items.slice().sort((a, b) => a.st.p50 - b.st.p50);
  const overlaps = [];
  for (let i = 0; i < byMedian.length - 1; i++) {
    const a = byMedian[i], b = byMedian[i + 1];
    if (a.st.p95 > b.st.p5) {
      overlaps.push({ a: a, b: b, from: b.st.p5, to: a.st.p95 });
    }
  }
  const detOrder = items.slice().sort((x, y) => x.det - y.det).map(x => x.id).join('>');
  const medOrder = byMedian.map(x => x.id).join('>');

  let html = '<strong>Was die Verteilungen über die Rangfolge sagen.</strong> ';
  if (overlaps.length) {
    html += 'Bei dieser Einstellung überlappen sich <strong>' + overlaps.length + ' von ' +
      (byMedian.length - 1) + '</strong> benachbarten Szenario-Paaren im Bereich P5–P95: ' +
      overlaps.map(o => '<em>' + o.a.label + '</em> und <em>' + o.b.label + '</em> (gemeinsamer Bereich ' +
        fmt(o.from, 0) + '–' + fmt(o.to, 0) + ' €/MWh)').join('; ') + '. ' +
      'Für diese Paare ist die Reihenfolge <strong>nicht entschieden</strong>: Es gibt Parametersätze ' +
      'innerhalb der dokumentierten Spannen, bei denen das jeweils teurere Szenario günstiger ausfällt. ' +
      'Wer die Punktwerte als Ranking liest, liest mehr hinein, als die Datenlage hergibt.';
  } else {
    html += 'Bei dieser Einstellung überlappt kein benachbartes Szenario-Paar im Bereich P5–P95. ' +
      'Die Rangfolge ist innerhalb der dokumentierten Parameterspannen stabil — was ausdrücklich ' +
      '<em>nicht</em> heißt, dass sie gegenüber den nicht variierten Größen (Wetterjahr, Physik, ' +
      'Datenlücken) stabil wäre.';
  }
  html += ' Die Rangfolge nach Median ist ' + (detOrder === medOrder
    ? 'dieselbe wie nach den Punktwerten'
    : '<strong>eine andere als nach den Punktwerten</strong>') + '.';

  const widest = items.slice().sort((a, b) => (b.st.p95 - b.st.p5) - (a.st.p95 - a.st.p5))[0];
  html += ' Die breiteste Verteilung hat <em>' + widest.label + '</em> mit ' +
    fmt(widest.st.p95 - widest.st.p5, 0) + ' €/MWh zwischen P5 und P95 (' +
    pct((widest.st.p95 - widest.st.p5) / widest.st.p50, 0) + ' des Medians).';
  $('#mc-finding').innerHTML = html;
}

function renderMcAll() {
  if (!MC.res) return;
  renderMcChart();
  renderMcTable();
  renderMcFinding();
  const key = mcCfgKey();
  $('#mc-chart-sub').innerHTML = 'Einstellung: WACC ' +
    (MC.wacc ? '<strong>unsicher</strong> (Dreieck 3 / 5 / 9 %)' : '<strong>fest</strong> (5 %)') +
    ' · empirische Kostenüberschreitung ' + (MC.overrun ? '<strong>an</strong>' : '<strong>aus</strong>') +
    ' · ' + fmt(MC_N_DRAWS, 0) + ' Ziehungen je Szenario · Konfiguration <code>' + key + '</code> · ' +
    'Rechenzeit im Browser ' + fmt(MC.ms, 0) + ' ms für alle ' +
    (MC_CONFIGS.length * (MC.order || S.mcRef.preset_order).length) + ' Kombinationen. ' +
    '<span class="simlabel simdata"></span>';
  applySimLabels();
}

function renderMcChapter() {
  const ref = S.mcRef;
  $('#mc-run').onclick = () => {
    if (MC.running) return;
    MC.running = true;
    const btn = $('#mc-run');
    btn.disabled = true;
    const st = $('#mc-progress');
    st.textContent = 'rechnet …';
    mcRunAll(p => { st.textContent = 'rechnet … ' + fmt(p * 100, 0) + ' %'; }).then(res => {
      MC.res = res; MC.running = false; btn.disabled = false;
      st.innerHTML = '<span class="badge-ok">✓ ' + fmt(MC_N_DRAWS * MC_CONFIGS.length *
        (MC.order || ref.preset_order).length, 0) + ' Ziehungen in ' + fmt(MC.ms, 0) + ' ms</span>';
      renderMcAll();
      renderExecSummary();
    });
  };
  $('#mc-wacc').onchange = e => { MC.wacc = e.target.checked; renderMcAll(); };
  $('#mc-overrun').onchange = e => { MC.overrun = e.target.checked; renderMcAll(); };

  const ovPlan = mcOverrunPlan(S.page);
  const ko = S.page.kostenueberschreitung_faktoren;
  $('#mc-overrun-hint').innerHTML = 'Multipliziert den CAPEX je Technologie mit einem empirischen ' +
    'Überschreitungsfaktor, ebenfalls als Dreieck: ' +
    ovPlan.map(o => o.cls + ' ' + fmt((o.mid - 1) * 100, 0) + ' % [' +
      fmt((o.min - 1) * 100, 0) + '–' + fmt((o.max - 1) * 100, 0) + ' %]').join(' · ') +
    '. Modus = Flyvbjerg-Wert (sonst Sovacool), Grenzen = dokumentierte Modellspanne ' +
    confBadge(ko.technologien.kernkraft.stufe) + cite('flyvbjerg-2023') + cite('sovacool-ryu-2025') +
    '. Batterie, Elektrolyse und H₂ haben in beiden Datensätzen keine Projektklasse und bleiben ' +
    'deshalb bei 1,00 — statt eine Zahl zu erfinden.';

  const plan = mcDrawPlan(S.params);
  $('#mc-method').innerHTML = '<strong>Was hier gerechnet wird — und was nicht.</strong> ' +
    'Gezogen werden <strong>' + plan.length + ' Parameter</strong> (CAPEX, Fixbetrieb und ' +
    'Volllaststunden von ' + new Set(plan.map(p => p.tech)).size + ' Technologien) als ' +
    '<strong>Dreiecksverteilung</strong> zwischen <code>min</code> und <code>max</code> mit dem ' +
    'Modus auf <code>mid</code> — genau die Spannen, die in ' +
    '<code>strommix/data/model_params.json</code> stehen. Die Dreiecksform ist eine ' +
    '<em>Annahme</em>: Sie unterstellt, dass Werte nahe dem Zentralwert wahrscheinlicher sind und ' +
    'dass min/max harte Grenzen sind. Beides ist nicht belegt, sondern die übliche Wahl, wenn nur ' +
    'drei Punkte einer Verteilung bekannt sind. ' + confBadge('M') +
    '<br><br><strong>Nicht variiert werden:</strong> das Wetterjahr und die Lastprofile, die Physik ' +
    'des Dispatch (siehe unten), Lebensdauern, Wirkungsgrade, Brennstoff- und Entsorgungskosten, ' +
    'der CO₂-Preis (fest ' + fmt(Number(S.params.global.co2_price_eur_t.value), 0) + ' €/t), das ' +
    'Netzinvestitionsvolumen und die H₂-Speicherkosten (deren dokumentierte Spanne öffnet nur nach ' +
    'unten und ist laut Parameternotiz nur bei hoher Zyklenzahl erreichbar — der simulierte ' +
    'Saisonspeicher hat aber genau einen Zyklus im Jahr).' +
    '<br><br><strong>Alle Ziehungen sind unabhängig.</strong> Reale Korrelationen — gemeinsame ' +
    'Rohstoff- und Zinsentwicklung, hoher CAPEX an guten Standorten (genau die Warnung, die in ' +
    '<code>scenario_sets._warning</code> steht) — sind nicht abgebildet. Das macht die Ränder der ' +
    'Verteilung eher zu schmal als zu breit.' +
    '<br><br><strong>Die zentrale Vereinfachung:</strong> Der stündliche Dispatch wird je Szenario ' +
    '<strong>einmal</strong> mit mittleren Parametern gerechnet und wiederverwendet; die 1.000 ' +
    'Ziehungen wirken nur auf die Kostenseite. Für CAPEX, Fixbetrieb und WACC ist das exakt richtig ' +
    '— sie beeinflussen die Physik nicht. Für die Volllaststunden ist es eine Näherung: Sie ändern ' +
    'im Modell eigentlich auch die installierte Leistung und damit Erzeugung, Abregelung und ' +
    'Backup-Bedarf. Hier wirken sie nur auf die abgeleiteten Kapazitäten und deren Kosten. ' +
    'Diese Näherung ist der Preis dafür, dass die Rechnung im Browser in Sekunden statt Minuten läuft.' +
    '<br><br>Referenzlauf und Perzentile: <code>strommix/scripts/monte_carlo.py</code> → ' +
    '<code>strommix/data/monte_carlo_reference.json</code> (Seed ' + fmt(MC_BASE_SEED, 0) +
    ', PRNG mulberry32). Diese Seite rechnet dieselben Ziehungen live nach und vergleicht die ' +
    'Mediane mit der Python-Referenz — das Ergebnis steckt im Verifikations-Badge im Fußbereich.';

  $('#mc-wacc').checked = MC.wacc;
  $('#mc-overrun').checked = MC.overrun;
  $('#mc-run').disabled = false;
  renderMcAll();
  buildCitations();
}

/* --------------------------------------------------------------------- */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

