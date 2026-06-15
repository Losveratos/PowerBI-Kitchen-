/* =====================================================================
   Business Chart Builder · Selbsttest
   ---------------------------------------------------------------------
   Läuft IM Kontext der geladenen business-chart-builder.html (greift auf
   die globalen Funktionen/Variablen state, vegaSpec, denebTemplate, … zu).

   Zwei Wege, das hier auszuführen:

   1) Standalone im Browser:  tests/selftest.html  öffnen
      (lädt den Builder im iframe und zeigt einen grün/rot-Report).

   2) In der Builder-Seite selbst (z. B. via Konsole oder Preview-Tooling):
        const t = await (await fetch('tests/selftest.js')).text();
        (0,eval)(t);
        await runChartBuilderSelfTest();   // -> Report-Objekt

   Prüft (Power BI ist nicht direkt testbar – daher gründlich gegen den
   Vega-Renderer + Shuffle):
     A) Regression: alle Typen rendern (SVG ohne NaN) und kompilieren
        (Vega-Lite + Deneb-Template), Templates ohne eingebackene Daten.
     B) varint-Template-Integrität: keine values, keine Feldnamen-Leaks,
        alle Platzhalter genutzt, FC-Feld numeric.
     C) varint-Korrektheit unter vertauschter Datenreihenfolge: Brücke
        kontinuierlich, Σ = Gesamtabweichung, AC/FC-Total korrekt.
     D) Demo-Daten-Reaktivität: der ⚄-Würfel verändert die richtige Quelle
        je Typ (srows bei Heatmap/Marimekko, FC-Flag bei varint/fan).
   ===================================================================== */
window.runChartBuilderSelfTest = async function runChartBuilderSelfTest(opts){
  opts = opts || {};
  const log = opts.quiet ? ()=>{} : (m)=>console.log('[selftest] '+m);
  const checks = [];
  const ok  = (name, cond, detail)=> checks.push({name, pass:!!cond, detail: cond ? '' : (detail||'')});

  /* alle Typ-IDs inkl. virtueller KPI-Kacheln */
  const KPI = {kpi:'ibcs', kpiStatus:'status', kpiTrend:'trend'};
  const TYPES = ['columns','colline','kombi','absvar','relvar','line','slope','fan','zchart',
    'stackcol','waterfall','bridge','varint','bars','bullet','pareto','dotplot','tornado',
    'barskombi','table','wfkombi','stackbar','multiples','sparktable','heatmap','marimekko',
    'kpi','kpiStatus','kpiTrend','scatter'];
  /* Typen ohne Vega-/Deneb-Template (bewusst nur SVG/PNG) */
  const SVG_ONLY = ['slope','fan','heatmap','marimekko'];

  const setType = (id)=>{
    if(id in KPI){ state.type='kpi'; state.kpiStyle = KPI[id]; }
    else state.type = id;
    if(needsRef() && state.reference==='—') state.reference = 'PY';
  };
  const chartHtml = ()=>{ const h=document.getElementById('chartHost'); return h ? h.innerHTML : ''; };
  const hasSvg    = ()=>{ const h=document.getElementById('chartHost'); return !!(h && h.querySelector('svg')); };

  /* --- Zustand sichern, am Ende wiederherstellen ---------------------- */
  const clone = x => JSON.parse(JSON.stringify(x));
  const $t = id => (document.getElementById(id)||{}).value;
  const snap = {
    type:state.type, kpiStyle:state.kpiStyle, primary:state.primary,
    reference:state.reference, reference2:state.reference2,
    rows:clone(state.rows), srows:clone(state.srows), series:clone(state.series),
    wrows:clone(state.wrows),
    unit:state.unit, unitScale:state.unitScale, decimals:state.decimals, msg:state.msg,
    t1:$t('t1'), t2:$t('t2'), t3:$t('t3'),
  };
  const restore = ()=>{
    Object.assign(state, {type:snap.type, kpiStyle:snap.kpiStyle, primary:snap.primary,
      reference:snap.reference, reference2:snap.reference2,
      rows:clone(snap.rows), srows:clone(snap.srows), series:clone(snap.series),
      wrows:clone(snap.wrows), unit:snap.unit, unitScale:snap.unitScale,
      decimals:snap.decimals, msg:snap.msg});
    const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v==null?'':v; };
    set('t1',snap.t1); set('t2',snap.t2); set('t3',snap.t3);
    try{ renderAll(); }catch(e){}
  };

  try{
    await loadVegaLibs();
    const VL = window.vegaLite, embed = window.vegaEmbed;
    ok('vega-libs geladen', VL && embed, 'vegaLite/vegaEmbed nicht verfügbar');

    /* === A) Regression über alle Typen ============================== */
    for(const id of TYPES){
      setType(id);
      let rendered=false, nan=true, len=0;
      try{ renderAll(); const html=chartHtml(); rendered=hasSvg(); nan=/NaN|undefined/.test(html); len=html.length; }
      catch(e){ ok('A · '+id+' · render', false, 'render warf: '+e); continue; }
      ok('A · '+id+' · SVG ohne NaN', rendered && !nan && len>300, 'svg='+rendered+' nan='+nan+' len='+len);

      /* Vega-Lite (eingebettet) + Deneb-Template kompilieren */
      let vl=null, tpl=null;
      try{ vl = vegaSpec(false); }catch(e){ ok('A · '+id+' · vegaSpec()', false, String(e)); }
      try{ tpl = denebTemplate(); }catch(e){ ok('A · '+id+' · denebTemplate()', false, String(e)); }

      if(SVG_ONLY.includes(id)){
        ok('A · '+id+' · bewusst SVG-only (kein Template)', vl===null && tpl===null,
           'erwartet null, bekam vl='+(!!vl)+' tpl='+(!!tpl));
      } else {
        if(vl){ try{ ok('A · '+id+' · VL kompiliert', !!VL.compile(clone(vl)).spec); }
                catch(e){ ok('A · '+id+' · VL kompiliert', false, String(e)); } }
        else ok('A · '+id+' · VL-Spec vorhanden', false, 'vegaSpec lieferte null');
        if(tpl){
          ok('A · '+id+' · Template ohne eingebackene Daten', tplBakedRows(tpl)===0, 'baked='+tplBakedRows(tpl));
          try{ const b=clone(tpl); delete b.usermeta; ok('A · '+id+' · Template kompiliert', !!VL.compile(b).spec); }
          catch(e){ ok('A · '+id+' · Template kompiliert', false, String(e)); }
        } else ok('A · '+id+' · Template vorhanden', false, 'denebTemplate lieferte null');
      }
    }

    /* === B) varint-Template-Integrität ============================== */
    loadPreset('varintDemo');
    const vtpl = denebTemplate();
    ok('B · varint Template erzeugt', !!vtpl);
    if(vtpl){
      const body = clone(vtpl); delete body.usermeta;
      const bodyStr = JSON.stringify(body);
      const ds = vtpl.usermeta.dataset;
      ok('B · keine eingebetteten values', !/"values":\[/.test(bodyStr) && tplBakedRows(vtpl)===0);
      ok('B · nur data.name=dataset', (bodyStr.match(/"name":"[^"]+"/g)||[]).every(s=>s==='"name":"dataset"'));
      ok('B · alle Platzhalter genutzt', ds.every(d=> bodyStr.includes(d.key)),
         'fehlend: '+ds.filter(d=>!bodyStr.includes(d.key)).map(d=>d.key));
      const leaks = ds.map(d=>d.name).filter(n=>{
        const esc = n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        return new RegExp('"field":"'+esc).test(bodyStr) || bodyStr.includes('datum["'+n+'"]');
      });
      ok('B · keine rohen Feldnamen-Leaks', leaks.length===0, 'leaks: '+leaks);
      const fcDef = ds.find(d=>/fc|forecast/i.test(d.description||'') || d.name===F('fc'));
      ok('B · FC-Feld numeric', !!fcDef && fcDef.type==='numeric', 'fc-def='+JSON.stringify(fcDef));
      ok('B · 4 Felder (dim,p,r,fc)', ds.length===4, 'felder='+ds.length);
    }

    /* === C) varint-Korrektheit unter Shuffle ======================== */
    const renderVarintData = async (rows)=>{
      const tpl = denebTemplate(); const body = clone(tpl); delete body.usermeta;
      body.datasets = {dataset: rows.map(r=>({'__0__':r.c,'__1__':r.v1,'__2__':r.v2,'__3__':r.fc?1:0}))};
      const host=document.createElement('div'); document.body.appendChild(host);
      const res = await embed(host, body, {actions:false, renderer:'svg'});
      const view=res.view, names=Object.keys(view._runtime.data);
      let delta=null, totRow=null;
      names.forEach(n=>{ try{ const d=view.data(n); if(!d||!d.length) return;
        if(d.every(x=>'cum' in x&&'s' in x&&'e' in x&&'d' in x) && (!delta||d.length>delta.length)) delta=d;
        const tr=d.find(x=>'acSum' in x && 'fcSum' in x); if(tr) totRow=tr;
      }catch(e){} });
      const svg = host.querySelector('svg'); const nan = svg ? /NaN/.test(svg.outerHTML) : true;
      host.remove();
      return {delta, totRow, nan};
    };
    const expectOf = (rows)=>{
      const num = v => isNaN(v)?0:v;
      let run=0; const cum = rows.map(r=>{ run+=num(r.v1)-num(r.v2); return run; });
      return {
        sumD: rows.reduce((a,r)=>a+(num(r.v1)-num(r.v2)),0),
        acSum: rows.reduce((a,r)=>a+(r.fc?0:num(r.v1)),0),
        fcSum: rows.reduce((a,r)=>a+(r.fc?num(r.v1):0),0),
        cum,
      };
    };
    loadPreset('varintDemo');
    const base = state.rows.map(r=>({c:r.c,v1:r.v1,v2:r.v2,fc:r.fc}));
    const rnd = base.slice(); for(let i=rnd.length-1;i>0;i--){ const j=(i*7+3)%(i+1); const t=rnd[i]; rnd[i]=rnd[j]; rnd[j]=t; }
    const orders = {original:base, reversed:base.slice().reverse(), shuffled:rnd};
    for(const [label, rows] of Object.entries(orders)){
      const exp = expectOf(rows);
      const r = await renderVarintData(rows);
      ok('C · '+label+' · render ohne NaN', !r.nan);
      if(r.delta){
        const sorted = r.delta.slice().sort((a,b)=>a.ord-b.ord);
        let cont=true, prevE=0; sorted.forEach(x=>{ if(Math.abs(x.s-prevE)>1e-6) cont=false; prevE=x.e; });
        ok('C · '+label+' · Brücke kontinuierlich', cont);
        ok('C · '+label+' · Brücke endet bei Σ', Math.abs(prevE-exp.sumD)<1e-6, 'finalE='+prevE+' Σ='+exp.sumD);
        ok('C · '+label+' · Kumulierung in Datenreihenfolge',
           JSON.stringify(sorted.map(x=>x.cum))===JSON.stringify(exp.cum));
      } else ok('C · '+label+' · Brücken-Tabelle gefunden', false);
      if(r.totRow){
        ok('C · '+label+' · AC-Summe korrekt', Math.abs(r.totRow.acSum-exp.acSum)<1e-6, 'ist='+r.totRow.acSum+' soll='+exp.acSum);
        ok('C · '+label+' · FC-Summe korrekt', Math.abs(r.totRow.fcSum-exp.fcSum)<1e-6, 'ist='+r.totRow.fcSum+' soll='+exp.fcSum);
      } else ok('C · '+label+' · Total-Zeile gefunden', false);
      ok('C · '+label+' · Σ reihenfolge-unabhängig', Math.abs(exp.sumD-expectOf(base).sumD)<1e-6);
    }

    /* === D) Demo-Daten-Reaktivität (⚄-Würfel) ======================= */
    const diceProbe = (id)=>{
      setType(id); renderAll();
      const beforeS = JSON.stringify(state.srows);
      const beforeC = chartHtml();
      document.getElementById('btnDice').click();
      return {
        usesSrows: usesSrows(),
        srowsChanged: beforeS!==JSON.stringify(state.srows),
        fcRolled: state.rows.filter(r=>r.fc).length,
        chartChanged: beforeC!==chartHtml(),
        nan: /NaN/.test(chartHtml()),
      };
    };
    ['heatmap','marimekko'].forEach(id=>{
      const p = diceProbe(id);
      ok('D · '+id+' · nutzt Serien-Tabelle', p.usesSrows);
      ok('D · '+id+' · Würfel ändert srows', p.srowsChanged);
      ok('D · '+id+' · Chart aktualisiert (kein NaN)', p.chartChanged && !p.nan);
    });
    ['varint','fan'].forEach(id=>{
      const p = diceProbe(id);
      ok('D · '+id+' · Würfel rollt Forecast (FC)', p.fcRolled>0, 'fcRolled='+p.fcRolled);
      ok('D · '+id+' · Chart aktualisiert (kein NaN)', p.chartChanged && !p.nan);
    });

    /* === E) IBCS-Check (Linter) ===================================== */
    ok('E · ibcsFindings() vorhanden', typeof ibcsFindings==='function');
    if(typeof ibcsFindings==='function'){
      const setT = (id,v)=>{ const el=document.getElementById(id); if(el) el.value=v; };
      let allRun = true;
      for(const id of TYPES){ setType(id); try{ const f=ibcsFindings(); if(!Array.isArray(f)||!f.length) allRun=false; }
                              catch(e){ allRun=false; } }
      ok('E · Linter läuft fehlerfrei für alle Typen', allRun);

      /* bewusst regelwidrige Konfiguration -> jede Regel muss anschlagen */
      state.type='columns'; state.reference='—'; state.msg='';
      setT('t1','Übersicht'); setT('t2',''); setT('t3','Umsatz stark gestiegen über Plan');
      state.unit='€'; state.unitScale='1'; state.decimals=2;
      state.rows = state.rows.map((r,i)=>({c:String(i+1), v1:12000+i*500, v2:NaN, v3:NaN, fc:false}));
      const bad = ibcsFindings().filter(f=>f.level!=='ok').map(f=>f.title);
      ['Kein Vergleich','Keine Message','Titel unvollständig','Wertung im Titel',
       'Redundante Wörter','Lange Zahlen','Viele Nachkommastellen'].forEach(key=>
        ok('E · erkennt „'+key+'"', bad.some(t=>t.indexOf(key)===0), 'gefunden: '+bad.join(' | ')));

      /* gestapelt mit >5 Segmenten */
      state.type='stackcol'; state.series=['A','B','C','D','E','F','G'];
      ok('E · erkennt „Zu viele Segmente"', ibcsFindings().some(f=>f.title.indexOf('Zu viele Segmente')===0));

      /* saubere Konfiguration -> keinerlei Warnungen */
      loadPreset('varintDemo'); state.decimals=0; state.msg='EBIT 2,7% über Plan – getragen vom 2. Halbjahr';
      setT('t1','Chocolate Corp.'); setT('t2','Net sales in kEUR'); setT('t3','');
      const good = ibcsFindings().filter(f=>f.level!=='ok');
      ok('E · saubere Konfiguration ohne Warnungen', good.length===0, 'übrig: '+good.map(f=>f.title).join(' | '));
    }

  }catch(err){
    ok('Selbsttest lief durch', false, 'Abbruch: '+(err && err.stack || err));
  }finally{
    restore();
  }

  window.__lastSelfTestChecks = checks;   /* für den HTML-Runner (Gruppen-Bilanz) */
  const failures = checks.filter(c=>!c.pass);
  const report = {
    ok: failures.length===0,
    passed: checks.length-failures.length,
    failed: failures.length,
    total: checks.length,
    failures: failures.map(f=>({check:f.name, detail:f.detail})),
  };
  log((report.ok?'✓ ALLE GRÜN ':'✗ FEHLER ')+report.passed+'/'+report.total+' bestanden');
  failures.forEach(f=> log('  ✗ '+f.check+(f.detail?'  ['+f.detail+']':'')));
  return report;
};
