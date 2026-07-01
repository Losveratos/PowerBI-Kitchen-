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
  const KPI = {kpi:'ibcs', kpiStatus:'status', kpiTrend:'trend', kpiBridge:'bridge'};
  const TYPES = ['columns','colline','kombi','absvar','relvar','line','slope','fan','zchart',
    'stackcol','waterfall','bridge','varint','bars','bullet','pareto','dotplot','tornado',
    'barskombi','table','wfkombi','stackbar','multiples','sparktable','heatmap','marimekko','boxplot',
    'kpi','kpiStatus','kpiTrend','kpiBridge','scatter','tree'];
  /* Typen ohne Vega-/Deneb-Template (bewusst nur SVG/PNG) */
  const SVG_ONLY = ['slope','fan','marimekko','tree'];

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
    type:state.type, kpiStyle:state.kpiStyle, kpiBars:state.kpiBars, kpiMultiScen:state.kpiMultiScen, kpiSingle:state.kpiSingle, kpiNoTitle:state.kpiNoTitle, kpiNoLabels:state.kpiNoLabels, noFC:state.noFC, primary:state.primary,
    reference:state.reference, reference2:state.reference2,
    rows:clone(state.rows), srows:clone(state.srows), series:clone(state.series),
    wrows:clone(state.wrows),
    unit:state.unit, unitScale:state.unitScale, decimals:state.decimals, msg:state.msg,
    stack100:state.stack100, bridgePY:state.bridgePY, bridgeRel:state.bridgeRel,
    treeJson:state.treeJson, varRefCols:state.varRefCols, varYTD:state.varYTD,
    grpFacet:state.grpFacet, grpScale:state.grpScale, zMonthCol:state.zMonthCol, zMonthRef:state.zMonthRef, tableDims:state.tableDims, rawVega:state.rawVega,
    t1:$t('t1'), t2:$t('t2'), t3:$t('t3'),
  };
  const restore = ()=>{
    Object.assign(state, {type:snap.type, kpiStyle:snap.kpiStyle, kpiBars:snap.kpiBars, kpiMultiScen:snap.kpiMultiScen, kpiSingle:snap.kpiSingle, kpiNoTitle:snap.kpiNoTitle, kpiNoLabels:snap.kpiNoLabels, noFC:snap.noFC, primary:snap.primary,
      reference:snap.reference, reference2:snap.reference2,
      rows:clone(snap.rows), srows:clone(snap.srows), series:clone(snap.series),
      wrows:clone(snap.wrows), unit:snap.unit, unitScale:snap.unitScale,
      decimals:snap.decimals, msg:snap.msg, stack100:snap.stack100,
      bridgePY:snap.bridgePY, bridgeRel:snap.bridgeRel,
      treeJson:snap.treeJson, varRefCols:snap.varRefCols, varYTD:snap.varYTD,
      grpFacet:snap.grpFacet, grpScale:snap.grpScale, zMonthCol:snap.zMonthCol, zMonthRef:snap.zMonthRef, tableDims:snap.tableDims, rawVega:snap.rawVega});
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

      /* Live-Badge spiegelt den Status (sauber -> „konform", sonst „Hinweis") */
      if(typeof updateIbcsBadge==='function'){
        renderPreview(); const bClean=(document.getElementById('ibcsBadge')||{}).textContent||'';
        state.reference='—'; state.type='columns'; state.msg=''; renderPreview();
        const bWarn=(document.getElementById('ibcsBadge')||{}).textContent||'';
        ok('E · Badge zeigt „konform" bei sauberer Konfiguration', /konform/.test(bClean), 'badge='+bClean);
        ok('E · Badge zeigt Hinweise bei Verstößen', /Hinweis/.test(bWarn), 'badge='+bWarn);
      }

      /* E2 · Polarity-Regel (UN 4.2): Kosten/Schulden-Zeile ohne "lower" markiert -> warn; mit -> ok */
      state.type='table'; state.reference='PY';
      state.rows=[{c:'Umsatz',v1:120,v2:100,fc:false},{c:'Kosten',v1:80,v2:100,fc:false}];
      let polF = ibcsFindings().find(f=>/Polarity/.test(f.title));
      ok('E · Polarity · Kosten-Zeile ohne Kennzeichnung -> warn', !!polF && polF.level==='warn', JSON.stringify(polF));
      state.rows[1].polarity = 'lower';
      polF = ibcsFindings().find(f=>/Polarity/.test(f.title));
      ok('E · Polarity · Kosten-Zeile mit "lower" gesetzt -> ok', !!polF && polF.level==='ok', JSON.stringify(polF));
      state.type='columns'; state.rows=[{c:'Kosten',v1:80,v2:100,fc:false}];
      ok('E · Polarity-Regel greift nur bei POLARITY_TYPES (nicht bei columns)', !ibcsFindings().some(f=>/Polarity/.test(f.title)));

      /* E3 · Small Multiples freie Skala -> warn (UN 5.2) */
      state.type='multiples'; state.multiScale='free';
      ok('E · Small Multiples · freie Skala -> Warnhinweis (UN 5.2)', ibcsFindings().some(f=>f.level==='warn' && /Freie Skala/.test(f.title)));
      state.multiScale='shared';
      ok('E · Small Multiples · gemeinsame Skala -> kein Hinweis', !ibcsFindings().some(f=>/Freie Skala/.test(f.title)));

      /* E4 · EX4-Lücken (Batch 4): kpi/multiples/pareto jetzt im Vergleichs-Check + Δ/Δ%-beide-aktiv */
      state.type='kpi'; state.kpiStyle='ibcs'; state.reference='—';
      state.rows=[{c:'X',v1:100,v2:NaN,v3:NaN,fc:false}]; renderAll();
      ok('E4 · kpi ohne Referenz -> EX4-Warnung (vorher gar nicht geprüft)',
         ibcsFindings().some(f=>f.level==='warn' && /Vergleich/.test(f.title)));
      state.type='kombi'; state.reference='PY';
      state.varSel={a1:true, r1:false, a2:true, r2:true}; renderAll();
      ok('E4 · kombi mit nur Δ (r1 aus) -> "Nur Δ oder nur Δ%"-Warnung',
         ibcsFindings().some(f=>f.level==='warn' && /Nur Δ/.test(f.title)));
      state.varSel={a1:true, r1:true, a2:true, r2:true}; renderAll();
      ok('E4 · kombi mit Δ+Δ% -> Vergleich ok', ibcsFindings().some(f=>f.level==='ok' && /Vergleich vorhanden/.test(f.title)));
      ok('E4 · absvar (einschichtig) bleibt unberührt vom Δ/Δ%-Check', (()=>{
        state.type='absvar'; state.reference='PY'; renderAll();
        return ibcsFindings().some(f=>f.level==='ok' && /Vergleich vorhanden/.test(f.title)) && !ibcsFindings().some(f=>/Nur Δ/.test(f.title));
      })());

      /* E5 · Wertung im Titel jetzt auch auf Englisch erkannt (SA 3.2) */
      state.type='columns'; state.reference='PY';
      $('#t1').value='Business Unit'; $('#t2').value='Revenue increased significantly'; $('#t3').value='';
      ok('E5 · englischer wertender Titel ("increased significantly") -> Warnung',
         ibcsFindings().some(f=>f.level==='warn' && /Wertung/.test(f.title)));
      $('#t2').value='Net sales in kEUR';
      ok('E5 · neutraler englischer Titel -> keine Wertungs-Warnung',
         !ibcsFindings().some(f=>/Wertung/.test(f.title)));
      $('#t1').value=''; $('#t2').value=''; $('#t3').value='';
    }

    /* === F) 100%-Stacked · Zeitnotation · Boxplot ==================== */
    /* F1 · 100%-gestapelt: SVG-Anteile + Template normalisiert, Σ je Kategorie ~100% */
    loadPreset('stackDemo'); state.stack100=true; renderAll();
    const fSvg = (document.getElementById('chartHost')||{}).innerHTML||'';
    ok('F · 100%-Stacked · SVG zeigt Anteile (%)', /%/.test(fSvg) && !/NaN/.test(fSvg));
    {
      const tpl = denebTemplate(); const body = clone(tpl); delete body.usermeta;
      let comp=false; try{ comp = !!VL.compile(body).spec; }catch(e){}
      ok('F · 100%-Stacked · Template kompiliert, baked=0', comp && tplBakedRows(tpl)===0);
      const rws = state.srows.filter(r=>r.c!=='');
      const data=[]; rws.forEach(r=> state.series.forEach((nm,j)=>{ if(!isNaN(r.v[j])) data.push({'__0__':r.c,'__1__':nm,'__2__':r.v[j]}); }));
      body.datasets={dataset:data};
      const host=document.createElement('div'); document.body.appendChild(host);
      try{
        const res=await embed(host, body, {actions:false, renderer:'svg'});
        const view=res.view; let shareTbl=null;
        Object.keys(view._runtime.data).forEach(n=>{ try{ const d=view.data(n); if(d&&d.length&&d.some(x=>'Lsh' in x)) shareTbl=d; }catch(e){} });
        const sums={}; (shareTbl||[]).forEach(x=>{ const v=parseFloat(String(x.Lsh).replace('%','').replace(',','.')); sums[x['__0__']]=(sums[x['__0__']]||0)+(isNaN(v)?0:v); });
        const cats=Object.keys(sums);
        ok('F · 100%-Stacked · Anteile summieren je Kategorie auf ~100%',
           cats.length>0 && cats.every(c=>Math.abs(sums[c]-100)<=2), 'sums='+JSON.stringify(sums));
      }catch(e){ ok('F · 100%-Stacked · Template rendert mit Daten', false, String(e)); }
      host.remove();
    }
    state.stack100=false;

    /* F2 · Zeitnotation-Helfer: Token-Liste + Einfügen in Titel (Default Zeile 3) */
    if(typeof periodTokens==='function'){
      const toks = periodTokens();
      ok('F · Zeitnotation · 4 Token inkl. ISO-Datum', toks.length===4 && toks.some(t=>/^\d{4}-\d{2}-\d{2}$/.test(t.tok)));
      const setT=(id,v)=>{ const el=document.getElementById(id); if(el) el.value=v; };
      setT('t3','2026 AC und PL'); lastTitleEl = document.getElementById('t3'); state.t3auto=true;
      insertPeriodToken('_Jun');
      ok('F · Zeitnotation · Token an Zeile 3 angehängt', (document.getElementById('t3').value||'').indexOf('_Jun')>=0);
      ok('F · Zeitnotation · t3auto deaktiviert', state.t3auto===false);
    }

    /* F3 · Boxplot: Long-Format-Gruppierung, Whisker/Box/Median, Ausreißer,
       + natives Deneb-Template (Wert als Spalte, nicht Measure) */
    loadPreset('boxplotDemo'); renderAll();
    const bx=(document.getElementById('chartHost')||{}).innerHTML||'';
    ok('F · Boxplot · 4 Boxen (Long-Format gruppiert)', (bx.match(/data-i=/g)||[]).length===4);
    ok('F · Boxplot · Ausreißer als Ringe (≥2)', (bx.match(/<circle/g)||[]).length>=2);
    ok('F · Boxplot · SVG kein NaN', !/NaN/.test(bx));
    {
      const tpl = denebTemplate();
      ok('F · Boxplot · Deneb-Template erzeugt (nicht SVG-only)', !!tpl);
      if(tpl){
        const body=clone(tpl); delete body.usermeta;
        let comp=false; try{ comp=!!VL.compile(body).spec; }catch(e){}
        ok('F · Boxplot · Template kompiliert, baked=0', comp && tplBakedRows(tpl)===0);
        ok('F · Boxplot · nativer boxplot-Mark', /"type":"boxplot"/.test(JSON.stringify(body)));
        const valDef = tpl.usermeta.dataset.find(d=>d.type==='numeric');
        ok('F · Boxplot · Wert ist Spalte (nicht Measure)', !!valDef && valDef.kind==='column',
           'valDef='+JSON.stringify(valDef));
        /* render template with long-format data -> no NaN */
        const data=[]; activeRows().filter(r=>r.c!==''&&!isNaN(r.v1)).forEach(r=>data.push({'__0__':r.c,'__1__':r.v1}));
        body.datasets={dataset:data};
        const host=document.createElement('div'); document.body.appendChild(host);
        try{ const res=await embed(host, body, {actions:false, renderer:'svg'});
          ok('F · Boxplot · Template rendert mit Long-Daten (kein NaN)', !/NaN/.test(host.querySelector('svg').outerHTML)); }
        catch(e){ ok('F · Boxplot · Template rendert mit Long-Daten', false, String(e)); }
        host.remove();
      }
    }

    /* F4 · Brücke: optionale ΔRef2-Total-Säule (z. B. ΔVorjahr) */
    loadPreset('bridgeM'); state.reference2='PY';
    state.rows.forEach(r=>{ r.v3 = Math.round(r.v2*0.97); });
    state.bridgePY=true; state.bridgeRel=true; renderAll();
    {
      const vrows = activeRows().filter(r=>!isNaN(r.v1)&&!isNaN(r.v2)&&!isNaN(r.v3));
      const expDPY = vrows.reduce((a,r)=>a+r.v1,0) - vrows.reduce((a,r)=>a+r.v3,0);
      const segs = bridgeSegs(activeRows());
      const last = segs[segs.length-1];
      ok('F · Brücke ΔRef2 · Säule angehängt (eigene Bezugsgröße)',
         last && last.c==='ΔPY' && last.kind==='delta' && last.skipRel===true,
         'last='+JSON.stringify(last&&{c:last.c,kind:last.kind}));
      ok('F · Brücke ΔRef2 · Wert = ΣPrimär − ΣRef2', last && Math.abs(last.v-expDPY)<1e-6, 'v='+(last&&last.v)+' soll='+expDPY);
      const svg=(document.getElementById('chartHost')||{}).innerHTML||'';
      ok('F · Brücke ΔRef2 · SVG zeigt Säule, kein NaN', /ΔPY/.test(svg) && !/NaN/.test(svg));
      /* Template: r2-Feld + ΔRef2-Säule, kompiliert, baked=0, rendert korrekt */
      const tpl=denebTemplate(); const body=clone(tpl); delete body.usermeta;
      ok('F · Brücke ΔRef2 · Template-Feld Referenz 2 deklariert', tpl.usermeta.dataset.some(d=>d.name==='PY'));
      let comp=false; try{ comp=!!VL.compile(body).spec; }catch(e){}
      ok('F · Brücke ΔRef2 · Template kompiliert, baked=0', comp && tplBakedRows(tpl)===0);
      const data=vrows.map(r=>({'__0__':r.c,'__1__':r.v1,'__2__':r.v2,'__3__':r.v3}));
      body.datasets={dataset:data};
      const host=document.createElement('div'); document.body.appendChild(host);
      try{
        const res=await embed(host, body, {actions:false, renderer:'svg'});
        let dpy=null; Object.keys(res.view._runtime.data).forEach(n=>{ try{ const d=res.view.data(n); if(d&&d.length===1&&d.some(x=>'sumP' in x&&'sumR2' in x)) dpy=d[0]; }catch(e){} });
        ok('F · Brücke ΔRef2 · Template-Säule = ΣPrimär−ΣRef2 (kein NaN)',
           !!dpy && Math.abs((dpy.sumP-dpy.sumR2)-expDPY)<1e-6 && !/NaN/.test(host.querySelector('svg').outerHTML),
           'dpy='+JSON.stringify(dpy&&{sumP:dpy.sumP,sumR2:dpy.sumR2}));
      }catch(e){ ok('F · Brücke ΔRef2 · Template rendert', false, String(e)); }
      host.remove();
      /* Niveausäule: graue ΣRef2-Säule (Szenario-Σ) */
      const expSumR2 = vrows.reduce((a,r)=>a+r.v3,0);
      state.bridgePYlevel=true; renderAll();
      const segs2 = bridgeSegs(activeRows());
      const lvl = segs2.find(g=>g.kind==='sum' && g.c==='PY' && g.scen==='PY');
      ok('F · Brücke Niveau · ΣRef2-Säule angehängt (Szenario-Σ)', !!lvl && Math.abs(lvl.to-expSumR2)<1e-6, 'lvl='+(lvl&&lvl.to)+' soll='+expSumR2);
      const tpl2 = denebTemplate(); const body2 = clone(tpl2); delete body2.usermeta;
      let comp2=false; try{ comp2=!!VL.compile(body2).spec; }catch(e){}
      ok('F · Brücke Niveau · Template kompiliert + scen-Ref2-Säule', comp2 && /"scen-PY"/.test(JSON.stringify(body2)));
      state.bridgePYlevel=false;
    }
    state.bridgePY=false;

    /* F5 · Brücken-Deneb-Vorlage: Wasserfall-Konnektoren (Σ→Δ…→Σ) rendern */
    {
      state.type='bridge'; state.wfOrient='h'; state.primary='AC'; state.reference='PY';
      state.reference2='—'; state.bridgeDir='fwd'; state.bridgeRel=false; state.bridgePY=false; state.bridgePYlevel=false;
      state.rows=[{c:'Umsatz',v1:600,v2:560,v3:NaN,fc:false},{c:'Material',v1:-200,v2:-180,v3:NaN,fc:false},{c:'EBIT',v1:400,v2:380,v3:NaN,fc:false}];
      renderAll();
      const tplB=denebTemplate(); const bodyB=clone(tplB); delete bodyB.usermeta;
      ok('F · Brücke · Konnektoren im Template (lead-window + #c2c2c2)',
         /"op":"lead"/.test(JSON.stringify(tplB)) && /#c2c2c2/.test(JSON.stringify(tplB)));
      let compB=false; try{ compB=!!VL.compile(bodyB).spec; }catch(e){}
      ok('F · Brücke · Konnektor-Template kompiliert (baked=0)', compB && tplBakedRows(tplB)===0);
      bodyB.datasets={dataset: state.rows.map(r=>({'__0__':r.c,'__1__':r.v1,'__2__':r.v2}))};
      const hostB=document.createElement('div'); document.body.appendChild(hostB);
      try{
        const res=await embed(hostB, bodyB, {actions:false, renderer:'svg'});
        const s=await res.view.toSVG();
        /* 3 Δ + Σstart + Σend = 4 Konnektoren */
        ok('F · Brücke · 4 Konnektoren gerendert (Σ→Δ…→Σ), kein NaN',
           (s.match(/stroke="#c2c2c2"/g)||[]).length===4 && !/NaN/.test(s));
      }catch(e){ ok('F · Brücke · Konnektor-Render', false, String(e)); }
      hostB.remove();
    }

    /* === G) Gantt (Raw-Vega-Vorlage, eigener Pfad) ================== */
    if(typeof renderGanttPreview==='function'){
      state.type='gantt';
      try{ renderDataTable(); await renderGanttPreview(); }catch(e){ ok('G · Gantt render', false, String(e)); }
      const ghost=document.getElementById('chartHost');
      const gsvg=ghost?ghost.querySelector('svg'):null;
      const ghtml=ghost?ghost.innerHTML:'';
      ok('G · Gantt rendert (SVG mit Demo-Daten)', !!gsvg && /Konzept/.test(ghtml) && /Go-Live/.test(ghtml),
         'svg='+!!gsvg);
      ok('G · Gantt · kein NaN', !!gsvg && !/NaN/.test(ghtml));
      const gex = exportSvgCurrent();
      ok('G · Gantt · SVG-Export mit Maßen', !!gex && gex.W>200 && gex.H>100 && /^<svg/.test(gex.svg),
         'W='+(gex&&gex.W)+' H='+(gex&&gex.H));
      await loadGanttSpec();
      const gtpl = denebTemplate();
      const gtplStr = JSON.stringify(gtpl||{});
      const gInput = gtpl && (gtpl.data||[]).find(d=>d.name==='input');
      ok('G · Gantt · Deneb-Template mit Feld-Mapping (usermeta.dataset + Platzhalter)',
         !!gtpl && gtpl.usermeta && gtpl.usermeta.deneb && gtpl.usermeta.deneb.provider==='vega'
         && Array.isArray(gtpl.usermeta.dataset) && gtpl.usermeta.dataset.length>=6
         && gtpl.usermeta.dataset.every(d=>/^__\d+__$/.test(d.key))     /* alle Felder als Platzhalter */
         && /datum\['__0__'\]/.test(gtplStr)                            /* Alias-Formel nutzt Platzhalter */
         && gInput && gInput.transform[0] && gInput.transform[0].as==='phase'  /* Alias vorne in 'input' */
         && /data\('input'\)/.test(gtplStr) && !/''input''/.test(gtplStr));   /* kanonische Einfach-Quotes */
      ok('G · Gantt · Platzhalter-Spec parst als Vega (Felder ersetzt)', (function(){
         if(!gtpl || !window.vega) return false;
         try{
           const p=JSON.parse(gtplStr.replace(/__(\d+)__/g,'fld$1')); delete p.usermeta;
           /* Power BI liefert pbiContainerWidth/Height zur Laufzeit – lokal als Default ergänzen */
           p.signals = [{name:'pbiContainerWidth',value:800},{name:'pbiContainerHeight',value:400}].concat(p.signals||[]);
           return !!window.vega.parse(p);
         }catch(e){ return false; }
      })());
      ok('G · Gantt · dataset bleibt leer (PBI füllt selbst)',
         !!gtpl && Array.isArray(gtpl.data) && gtpl.data.some(d=>d.name==='dataset' && !d.values));
      ok('G · Gantt · keine VL-Pipeline (vegaSpec null)', vegaSpec(false)===null);
      ok('G · Gantt · Attribution erhalten (MIT/DL0K-pbi)', /DL0K-pbi/.test(JSON.stringify(gtpl||{})));
      /* G2 · editierbare Gantt-Daten: Tabelle + Edit fließt in Render, Export unberührt */
      if(typeof ensureGanttData==='function'){
        renderDataTable();
        const gEdit=(document.getElementById('dataTable')||{}).querySelector
          ? document.querySelectorAll('#dataTable [data-g]').length : 0;
        ok('G · Gantt · editierbare Tabelle (data-g-Felder)', gEdit>0, 'felder='+gEdit);
        ensureGanttData()[0].task='SELFTEST-TASK';
        await renderGanttPreview();
        const e2=(document.getElementById('chartHost')||{}).innerHTML||'';
        ok('G · Gantt · Edit erscheint im Render', /SELFTEST-TASK/.test(e2) && !/NaN/.test(e2));
        ok('G · Gantt · User-Daten lecken NICHT ins Deneb-Template',
           !/SELFTEST-TASK/.test(JSON.stringify(denebTemplate()||{})));
        state.gantt=null;  /* Demo wiederherstellen */
      }
      if(state._ganttView){ try{ state._ganttView.finalize(); state._ganttView=null; }catch(e){} }
    }

    /* === H) Collapsible-Zeilen (Tabelle + vertikaler Wasserfall) ===== */
    if(typeof tblHiddenSet==='function'){
      /* H1 · Tabelle mit Hierarchie: Eltern einklappen verbirgt Kinder */
      state.type='table'; state.reference='PY'; state.reference2='—';
      state.rows=[
        {c:'Umsatz',v1:600,v2:560,v3:NaN,fc:false,lvl:0},
        {c:'Produkt A',v1:360,v2:330,v3:NaN,fc:false,lvl:1},
        {c:'Produkt B',v1:240,v2:230,v3:NaN,fc:false,lvl:1},
        {c:'Kosten',v1:420,v2:400,v3:NaN,fc:false,lvl:0},
        {c:'Material',v1:250,v2:240,v3:NaN,fc:false,lvl:1},
        {c:'Personal',v1:170,v2:160,v3:NaN,fc:false,lvl:1},
      ];
      state.rowCollapse=new Set(); renderAll();
      const tOpen=chartHtml();
      ok('H · Tabelle · Gruppen erkannt (2 Eltern)', (tOpen.match(/data-collapse=/g)||[]).length===2);
      ok('H · Tabelle · offen zeigt Kinder', /Produkt A/.test(tOpen) && /Material/.test(tOpen));
      state.rowCollapse.add('Umsatz'); renderPreview();
      const tColl=chartHtml();
      ok('H · Tabelle · eingeklappt verbirgt Kinder', !/Produkt A/.test(tColl) && !/Produkt B/.test(tColl));
      ok('H · Tabelle · Geschwister-Gruppe bleibt', /Material/.test(tColl) && /Umsatz/.test(tColl));
      ok('H · Tabelle · kein NaN (offen/zu)', !/NaN/.test(tOpen) && !/NaN/.test(tColl));
      /* Template exportiert weiterhin ALLE Zeilen (Collapse ist reine Darstellung) */
      let tComp=false, tBaked=1; try{ const b=clone(denebTemplate()); tBaked=tplBakedRows(b); delete b.usermeta; tComp=!!VL.compile(b).spec; }catch(e){}
      ok('H · Tabelle · Template trotz Collapse gültig (baked=0)', tComp && tBaked===0);
      /* „bis Ebene"-Filter: collapseTableToLevel(0) klappt alle Eltern zu */
      if(typeof collapseTableToLevel==='function'){
        collapseTableToLevel(0); renderPreview();
        const lv0=chartHtml();
        ok('H · Tabelle · collapseTableToLevel(0) zeigt nur Ebene 0',
           /Umsatz/.test(lv0) && /Kosten/.test(lv0) && !/Produkt A/.test(lv0) && !/Material/.test(lv0));
      }
      state.rowCollapse=new Set();

      /* H2 · Vertikaler Wasserfall: Phase einklappen aggregiert, Σ bleibt korrekt */
      loadPreset('pnl'); state.wfOrient='v'; state.wfCollapse=new Set(); renderAll();
      const wOpen=chartHtml();
      const ebitOpen=wfSegs(state.wrows).find(g=>g.c==='EBIT').to;
      const phaseKeys=wfPhases(wfSegs(state.wrows)).map(p=>p.key);
      ok('H · Wasserfall · Phase erkannt (endet bei Σ)', phaseKeys.includes('EBIT'));
      state.wfCollapse.add('EBIT'); renderPreview();
      const wColl=chartHtml();
      const ebitColl=wfSegs(state.wrows).find(g=>g.c==='EBIT').to;
      ok('H · Wasserfall · eingeklappt verbirgt Δ-Posten', !/Materialkosten/.test(wColl) && /Posten/.test(wColl));
      ok('H · Wasserfall · Σ/Laufweg unverändert', ebitOpen===ebitColl);
      ok('H · Wasserfall · Endsumme & Startsumme bleiben sichtbar', /EBIT/.test(wColl) && /Umsatz/.test(wColl));
      ok('H · Wasserfall · kein NaN (offen/zu)', !/NaN/.test(wOpen) && !/NaN/.test(wColl));
      /* Brücke (gleicher Renderer) bleibt vom Collapse unberührt */
      loadPreset('bridgeM'); state.wfOrient='v'; renderAll();
      ok('H · Brücke-vertikal · rendert ohne Collapse-Artefakte', !/data-wfcollapse/.test(chartHtml()) && !/NaN/.test(chartHtml()));

      /* H2b · Wasserfall mit frei wählbaren Unter-Ebenen (verschachtelt) */
      if(typeof wfLeveledModel==='function'){
        state.type='waterfall'; state.wfOrient='v'; state.showRel=false; state.showAbs=false;
        state.wrows=[
          {c:'Umsatz',v:1000,t:'sum',lvl:0},
          {c:'Kosten',v:0,t:'delta',lvl:0},
          {c:'Personal',v:0,t:'delta',lvl:1},
          {c:'Löhne',v:-300,t:'delta',lvl:2},
          {c:'Abgaben',v:-120,t:'delta',lvl:2},
          {c:'Material',v:-200,t:'delta',lvl:1},
          {c:'EBIT',v:0,t:'sum',lvl:0},
        ];
        state.wfCollapse=new Set(); renderAll();
        const m=wfLeveledModel(state.wrows);
        const ebit=m.find(r=>r.c==='EBIT')._to;
        ok('H · WF-Ebenen · Laufweg über Blätter (EBIT=380)', ebit===380, 'ebit='+ebit);
        ok('H · WF-Ebenen · verschachtelte Gruppen erkannt',
           wfLevelGroups(state.wrows).map(g=>g.key+'@'+g.lvl).join(',')==='Kosten@0,Personal@1');
        ok('H · WF-Ebenen · Header = Σ Blatt-Nachfahren',
           m.find(r=>r.c==='Kosten')._v===-620 && m.find(r=>r.c==='Personal')._v===-420);
        ok('H · WF-Ebenen · offen zeigt Blätter, kein NaN', /Löhne/.test(chartHtml()) && !/NaN/.test(chartHtml()));
        state.wfCollapse.add('Personal'); renderPreview();
        const c1=chartHtml();
        ok('H · WF-Ebenen · innere Gruppe zu verbirgt Blätter', !/Löhne/.test(c1) && /Personal/.test(c1) && /Material/.test(c1));
        ok('H · WF-Ebenen · Σ unverändert nach Collapse',
           wfLeveledModel(state.wrows).find(r=>r.c==='EBIT')._to===380 && !/NaN/.test(c1));
        if(typeof collapseWfToLevel==='function'){
          collapseWfToLevel(0); renderPreview();
          const c0=chartHtml();
          ok('H · WF-Ebenen · bis Ebene 0 verbirgt alle Kinder',
             !/Material/.test(c0) && !/Löhne/.test(c0) && /Kosten/.test(c0) && !/NaN/.test(c0));
        }
        state.wfCollapse=new Set();
      }

      /* H3 · Collapse-Zustand überlebt serialize → applyConfig */
      state.type='table'; state.rows[0]&&(state.rows=[
        {c:'A',v1:10,v2:8,v3:NaN,fc:false,lvl:0},{c:'a1',v1:6,v2:5,v3:NaN,fc:false,lvl:1}]);
      state.rowCollapse=new Set(['A']); state.wfCollapse=new Set(['X']);
      const ser=JSON.parse(JSON.stringify(serialize()));
      state.rowCollapse=new Set(); state.wfCollapse=new Set();
      applyConfig(ser, true);
      ok('H · Collapse-Zustand persistiert (serialize/applyConfig)',
         state.rowCollapse.has('A') && state.wfCollapse.has('X'));
      state.rowCollapse=new Set(); state.wfCollapse=new Set();
    }

    /* === I) Flexibler Trellis (Spaltenzahl + Y-Skala gemeinsam/frei) === */
    if('multiCols' in state){
      loadPreset('marimekkoDemo'); state.type='multiples'; state.multiMode='col'; state.multiScale='shared';
      state.multiCols=1; renderAll(); const w1=+document.querySelector('#chartHost svg').getAttribute('width');
      state.multiCols=4; renderPreview(); const w4=+document.querySelector('#chartHost svg').getAttribute('width');
      ok('I · Trellis · Spaltenzahl skaliert SVG-Breite (1<4)', w1>0 && w4>w1 && !/NaN/.test(chartHtml()));
      state.multiCols=2; state.multiScale='free';
      const vlF=vegaSpec(false);
      ok('I · Trellis · VL columns=2 + freie Skala (independent)', vlF.columns===2 && vlF.resolve.scale.y==='independent');
      state.multiScale='shared';
      ok('I · Trellis · VL gemeinsame Skala (shared)', vegaSpec(false).resolve.scale.y==='shared');
      const itpl=denebTemplate(); const ib=clone(itpl); delete ib.usermeta;
      let icomp=false; try{ icomp=!!VL.compile(ib).spec; }catch(e){}
      ok('I · Trellis · Template kompiliert mit columns/resolve', icomp && itpl.columns===2 && tplBakedRows(itpl)===0);
      state.multiCols=3; state.multiScale='shared';

      /* I2 · Small Multiples: Referenz in Szenario-Notation statt hartem Grau (UN 3.2) */
      loadPreset('multiDemo'); state.type='multiples'; state.multiMode='col'; state.reference='PL';
      state.srows.forEach(r=>{ r.rv = r.v.map(v=>v*0.9); });
      renderAll();
      const svgI2 = chartHtml();
      ok('I2 · Multiples SVG · Referenz PL hohl (weiß+dunkle Kontur) statt Grau, kein NaN',
         /fill="#ffffff" stroke="#404040"/.test(svgI2) && !/NaN/.test(svgI2));
      {
        const tplI2 = clone(denebTemplate()); const bI2 = clone(tplI2); delete bI2.usermeta;
        const fdefsI2 = vFieldDefs();
        const dataI2 = [];
        state.srows.forEach(r=> state.series.forEach((nm,j)=>{
          const o={}; fdefsI2.forEach((d,k)=>{ const key='__'+k+'__';
            if(d[0]==='serie') o[key]=nm; else if(d[0]==='v') o[key]=r.v[j]; else if(d[0]==='r') o[key]=(r.rv||[])[j]; });
          dataI2.push(o);
        }));
        bI2.datasets = {dataset:dataI2};
        const host=document.createElement('div'); host.style.width='900px'; host.style.height='400px'; document.body.appendChild(host);
        let html='', ok_=false;
        try{ await embed(host, bI2, {actions:false, renderer:'svg'}); html=host.innerHTML; ok_=true; }catch(e){}
        const hollowBars = (html.match(/fill="#ffffff" stroke="#404040"/g)||[]).length;
        host.remove();
        ok('I2 · Multiples Deneb-Export · Referenz-Balken PL hohl, kompiliert baked=0, kein NaN',
           ok_ && hollowBars>0 && tplBakedRows(tplI2)===0 && !/NaN/.test(html));
      }
      state.reference='PY'; state.type='columns';
    }

    /* === J) Referenzlinie-Overlay (Ø/Median) als zusätzlicher Layer ==== */
    if('refLine' in state){
      for(const ty of ['columns','line','bars','colline']){
        loadPreset('months'); state.type=ty; if(ty==='colline') state.reference='PY';
        state.refLine='mean'; renderAll();
        const sMean=chartHtml();
        state.refLine='median'; renderPreview();
        const sMed=chartHtml();
        ok('J · '+ty+' · SVG zeigt Ø/Md-Linie, kein NaN',
           /Ø /.test(sMean) && /Md /.test(sMed) && !/NaN/.test(sMean) && !/NaN/.test(sMed));
        const vl=vegaSpec(false);
        ok('J · '+ty+' · VL-Layer mit aggregate median', JSON.stringify(vl).includes('"aggregate":"median"'));
        const jb=clone(denebTemplate()); const baked=tplBakedRows(jb); delete jb.usermeta;
        let jcomp=false; try{ jcomp=!!VL.compile(jb).spec; }catch(e){}
        ok('J · '+ty+' · Template kompiliert (baked=0)', jcomp && baked===0);
      }
      state.refLine='none';
    }

    /* === K) Dual-Axis-Kombi (colline): Tausch + gemeinsame/getrennte Skala == */
    if('collineSwap' in state){
      loadPreset('months'); state.type='colline'; state.reference='PY'; state.reference2='—';
      for(const swap of [false,true]) for(const axis of ['shared','dual']){
        state.collineSwap=swap; state.collineAxis=axis; renderAll();
        const lbl=(swap?'Linie':'Säule')+'/'+axis;
        ok('K · colline '+lbl+' · SVG ohne NaN', /<rect/.test(chartHtml()) && /<line/.test(chartHtml()) && !/NaN/.test(chartHtml()));
        const vl=vegaSpec(false);
        const dual = !!(vl.resolve && vl.resolve.scale && vl.resolve.scale.y==='independent');
        ok('K · colline '+lbl+' · VL Achse korrekt', axis==='dual' ? (dual && vl.layer.length===2 && vl.layer.every(l=>l.layer)) : !dual);
        const kb=clone(denebTemplate()); const baked=tplBakedRows(kb); delete kb.usermeta;
        let kc=false; try{ kc=!!VL.compile(kb).spec; }catch(e){}
        ok('K · colline '+lbl+' · Template kompiliert (baked=0)', kc && baked===0);
      }
      state.collineSwap=false; state.collineAxis='shared';
    }

    /* === L) Trellis-Facet-Export (Deneb only) für columns/line/bars ==== */
    if('facetField' in state){
      for(const ty of ['columns','line','bars']){
        loadPreset(ty==='bars'?'countries':'months'); state.type=ty;
        state.facetField='Region'; state.facetCols=2; renderAll();
        /* In-App-Vorschau + eingebettet bleiben einzeln (kein Facet) */
        ok('L · '+ty+' · Vorschau bleibt einzeln (kein NaN)', !/facet/.test(chartHtml()) && !/NaN/.test(chartHtml()));
        ok('L · '+ty+' · eingebettet NICHT facettiert', !vegaSpec(false).facet);
        /* Deneb-Template facettiert + Feld als Platzhalter + kompiliert */
        const tpl=denebTemplate(); const lb=clone(tpl); const baked=tplBakedRows(lb); delete lb.usermeta;
        let lc=false; try{ lc=!!VL.compile(lb).spec; }catch(e){}
        const regionDef=tpl.usermeta.dataset.find(d=>d.name==='Region');
        ok('L · '+ty+' · Template facettiert + kompiliert (baked=0)',
           lc && baked===0 && !!tpl.facet && /^__\d+__$/.test(tpl.facet.field));
        ok('L · '+ty+' · Facet-Feld als column-Platzhalter deklariert',
           !!regionDef && regionDef.kind==='column' && !/"Region"/.test(JSON.stringify(lb)));
        state.facetField='';
        ok('L · '+ty+' · ohne Feld kein Facet', !denebTemplate().facet);
      }
    }

    /* === M) Review-Fixes (pareto/barskombi/bullet/table/kpiTrend) ====== */
    {
      const filterGt0 = sp => Array.isArray(sp.transform) && sp.transform.some(t=>t.filter && /> *0/.test(t.filter));
      /* M1 pareto: VL filtert positive Beiträge (Kumulierung monoton) */
      loadPreset('countries'); state.type='pareto'; renderAll();
      ok('M · pareto · VL filtert datum>0 vor window', filterGt0(vegaSpec(false)));
      let pc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; pc=!!VL.compile(b).spec; }catch(e){}
      ok('M · pareto · Template kompiliert', pc);

      /* M2 barskombi: Referenz-2-Δ-Tiers im Template */
      loadPreset('countriesVA'); state.type='barskombi'; state.reference='PL'; state.reference2='PY';
      state.rows.forEach(r=>{ if(isNaN(r.v3)) r.v3=Math.round(r.v2*0.95); });
      state.varSel={a1:true,r1:true,a2:true,r2:true}; renderAll();
      ok('M · barskombi · Ref-2-Tiers (d2/rv2) im Template', /"d2"|"rv2"/.test(JSON.stringify(denebTemplate())));
      let bkc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; bkc=!!VL.compile(b).spec; }catch(e){}
      ok('M · barskombi · Template kompiliert (Ref1+Ref2, baked=0)', bkc && tplBakedRows(denebTemplate())===0);

      /* M2b: PL/BU-Referenzachse in den Varianz-Tiers = Doppellinie via xOffset-
         ENCODING (value), NICHT als Mark-Property (sonst von Deneb verworfen →
         Linien fehlen). Beide Versatz-Werte müssen im Spec stehen. */
      state.reference='BU'; state.reference2='—'; state.varSel={a1:true,r1:true,a2:false,r2:false}; renderAll();
      const bkj=JSON.stringify(vegaSpec(false));
      ok('M · barskombi · PL/BU-Refachse als xOffset-Encoding-Doppellinie (nicht Mark-Prop)',
         /"xOffset":\{"value":-1\.6\}/.test(bkj) && /"xOffset":\{"value":1\.6\}/.test(bkj));

      /* M3 bullet: negative Ist-Werte → Track über _t0/_t1, kompiliert */
      state.type='bullet'; state.reference='PL'; state.reference2='—';
      state.rows=[{c:'A',v1:-50,v2:-40,v3:NaN,fc:false},{c:'B',v1:-30,v2:-35,v3:NaN,fc:false}];
      renderAll();
      let buc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; buc=!!VL.compile(b).spec; }catch(e){}
      ok('M · bullet · Track datengetrieben (_t0/_t1), kompiliert bei Negativen',
         /_t0/.test(JSON.stringify(vegaSpec(false))) && buc && !/NaN/.test(chartHtml()));

      /* M4 table: Σ nur Blätter (Eltern nicht doppelt) */
      state.type='table'; state.reference='—'; state.reference2='—'; state.showSum=true;
      state.rows=[{c:'P',v1:999,v2:NaN,v3:NaN,fc:false,lvl:0},
                  {c:'a',v1:60,v2:NaN,v3:NaN,fc:false,lvl:1},
                  {c:'b',v1:40,v2:NaN,v3:NaN,fc:false,lvl:1}];
      renderAll();
      ok('M · table · Σ nur Blätter (kein Doppelzählen)', !/1099/.test(chartHtml()) && !/NaN/.test(chartHtml()));

      /* M4b · Tabelle/WfKombi: Δ%-Ausreißer im Deneb-Export gekappt (relCap), sonst
         staucht eine Extremzeile die ganze Spalte */
      {
        state.type='table'; state.reference='PY'; state.reference2='—';
        state.rows=[{c:'A',v1:105,v2:100,fc:false},{c:'B',v1:104,v2:100,fc:false},
                    {c:'C',v1:103,v2:100,fc:false},{c:'D',v1:900,v2:100,fc:false}];
        renderAll();
        const cap = relCap(vRows().map(r=>r.rv).filter(v=>v!==null));
        ok('M4b · relCap() erkennt Ausreißer (800% vs ~5%) -> cap=5', cap===5, 'cap='+cap);
        const tplT = clone(denebTemplate()); const bodyT = clone(tplT); delete bodyT.usermeta;
        const fdefsT = vFieldDefs();
        const dataT = state.rows.map(r=>{
          const o={}; fdefsT.forEach((d,i)=>{ const key='__'+i+'__';
            if(d[0]==='dim') o[key]=r.c; else if(d[0]==='p') o[key]=r.v1; else if(d[0]==='r') o[key]=r.v2; });
          return o;
        });
        bodyT.datasets = {dataset:dataT};
        const host=document.createElement('div'); host.style.width='900px'; host.style.height='300px'; document.body.appendChild(host);
        let html='', renderOk=false;
        try{ await embed(host, bodyT, {actions:false, renderer:'svg'}); html=host.innerHTML; renderOk=true; }catch(e){}
        const pts = (html.match(/aria-roledescription="point"[^>]*transform="translate\(([\d.]+),/g)||[]).map(p=>parseFloat(p.match(/translate\(([\d.]+),/)[1]));
        const lastFour = pts.slice(-4);
        host.remove();
        ok('M4b · Tabelle · Deneb-Export kompiliert (baked=0), kein NaN', renderOk && tplBakedRows(tplT)===0 && !/NaN/.test(html));
        ok('M4b · Tabelle · Ausreißer-Pin (D, 800%) auf denselben x wie Cap-Zeile (A, 5%) geklemmt',
           lastFour.length===4 && Math.abs(lastFour[0]-lastFour[3])<0.5, 'x='+JSON.stringify(lastFour));
      }

      /* M5 kpiTrend: eigenes dynamisches Template (Sparkline), nicht Status */
      state.type='kpi'; state.kpiStyle='trend'; state.reference='—';
      state.kpiSingle=false; state.kpiBars=false; state.kpiMultiScen=false; state.noFC=false;
      state.series=['Umsatz','Marge'];
      state.srows=[]; for(let i=0;i<12;i++) state.srows.push({c:'T'+(i+1), v:[100+i*3, 20+i]});
      state.rows=[{c:'Umsatz',v1:131,v2:NaN,v3:NaN,fc:false},{c:'Marge',v1:31,v2:NaN,v3:NaN,fc:false}];
      renderAll();
      const ktSp=vegaSpec(false);
      ok('M · kpiTrend · eigenes Facet-Template (Sparkline, nicht Status)',
         !!ktSp.facet && JSON.stringify(ktSp).includes('"_avg"'));
      let ktc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; ktc=!!VL.compile(b).spec; }catch(e){}
      ok('M · kpiTrend · Template kompiliert (baked=0) + dim/serie/v deklariert',
         ktc && tplBakedRows(denebTemplate())===0 && denebTemplate().usermeta.dataset.length===3);

      /* M5b · kpiTrend: Diamant-Marker (jeder 3. Tagespunkt) + Mini-Legende im Deneb-Export
         (renderKpiTrend Zeile ~2993-3012 hatte das, vlKpiTrend vorher nicht) */
      {
        const tplT = clone(denebTemplate()); const bodyT = clone(tplT); delete bodyT.usermeta;
        const fdefsT = vFieldDefs();
        const dataT = [];
        state.srows.forEach(r=> state.series.forEach((nm,j)=>{
          const o={}; fdefsT.forEach((d,k)=>{ const key='__'+k+'__';
            if(d[0]==='dim') o[key]=r.c; else if(d[0]==='serie') o[key]=nm; else if(d[0]==='v') o[key]=r.v[j]; });
          dataT.push(o);
        }));
        bodyT.datasets = {dataset:dataT};
        const host=document.createElement('div'); host.style.width='700px'; host.style.height='300px'; document.body.appendChild(host);
        let renderOk=false, html='';
        try{ await embed(host, bodyT, {actions:false, renderer:'svg'}); html=host.innerHTML; renderOk=true; }catch(e){}
        const diamondCount = (html.match(/aria-roledescription="point"/g)||[]).length;
        const hasLegend = ['LETZTE 30 TAGE','5T Ø','TÄGLICH'].every(t=>html.includes(t));
        host.remove();
        ok('M · kpiTrend · Deneb-Export: Diamant-Marker vorhanden, kein NaN',
           renderOk && diamondCount>0 && !/NaN/.test(html), 'diamondCount='+diamondCount);
        ok('M · kpiTrend · Deneb-Export: Mini-Legende (Last30/Avg5/Daily) vorhanden', hasLegend);
        /* kpiNoLabels blendet die Legende aus, Marker bleiben */
        state.kpiNoLabels = true; renderAll();
        const tplT2 = clone(denebTemplate()); const bodyT2 = clone(tplT2); delete bodyT2.usermeta;
        bodyT2.datasets = {dataset:dataT};
        const host2=document.createElement('div'); host2.style.width='700px'; host2.style.height='300px'; document.body.appendChild(host2);
        let html2='';
        try{ await embed(host2, bodyT2, {actions:false, renderer:'svg'}); html2=host2.innerHTML; }catch(e){}
        const diamondCount2 = (html2.match(/aria-roledescription="point"/g)||[]).length;
        host2.remove();
        ok('M · kpiTrend · kpiNoLabels blendet Legende aus, Marker bleiben',
           !['LETZTE 30 TAGE','5T Ø','TÄGLICH'].some(t=>html2.includes(t)) && diamondCount2===diamondCount);
        state.kpiNoLabels = false;
      }
      state.kpiStyle='ibcs'; state.varSel={a1:true,r1:true,a2:true,r2:true};
    }

    /* === X) KPI-Brücke: Hero + Mini-Varianz-Brücke (Ref→Δ→AC) je Karte == */
    {
      state.type='kpi'; state.kpiStyle='bridge'; state.primary='AC'; state.reference='PY'; state.reference2='—';
      state.kpiBars=false; state.kpiMultiScen=false; state.kpiSingle=false; state.noFC=false;
      state.rows=[{c:'Umsatz',v1:120,v2:100,v3:NaN,fc:false},{c:'Marge',v1:18,v2:22,v3:NaN,fc:false}];
      renderAll();
      const kbHtml=chartHtml();
      ok('X · kpiBridge · rendert Brücken-Achse (Δ) ohne NaN',
         /Δ/.test(kbHtml) && !/NaN/.test(kbHtml) && hasSvg());
      const kbSp=vegaSpec(false);
      ok('X · kpiBridge · eigenes Facet-Template (3 Säulen via y2)',
         !!kbSp.facet && JSON.stringify(kbSp).includes('"y2"'));
      let kbc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; kbc=!!VL.compile(b).spec; }catch(e){}
      ok('X · kpiBridge · Template kompiliert (baked=0)',
         kbc && tplBakedRows(denebTemplate())===0);
      /* 2. Referenz als Niveau-Marke über der AC-Säule */
      state.reference2='PL'; state.rows[0].v3=130; state.rows[1].v3=19; renderAll();
      ok('X · kpiBridge · 2. Referenz als Niveau-Marke (PL sichtbar)', /PL/.test(chartHtml()));
      /* X2 · Balken-Ausrichtung (horizontal) */
      state.kpiBars=true; renderAll();
      ok('X · kpiBridge · Balken-Variante rendert ohne NaN', hasSvg() && !/NaN/.test(chartHtml()));
      let kbb=false; try{ const b=clone(denebTemplate()); delete b.usermeta; kbb=!!VL.compile(b).spec; }catch(e){}
      ok('X · kpiBridge · Balken-Template kompiliert (x2 statt y2)',
         kbb && JSON.stringify(vegaSpec(false)).includes('"x2"') && tplBakedRows(denebTemplate())===0);
      /* X3 · Mehr-Szenarien (Ref2 als voller Slot, kein Niveau-Mark mehr) */
      state.kpiBars=false; state.kpiMultiScen=true; renderAll();
      const kbm=vegaSpec(false);
      ok('X · kpiBridge · Mehr-Szenarien: 4 Slots im Template (Ref2 voll)',
         (JSON.stringify(kbm).match(/"type":"bar"/g)||[]).length>=4);
      let kbmc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; kbmc=!!VL.compile(b).spec; }catch(e){}
      ok('X · kpiBridge · Mehr-Szenarien-Template kompiliert', kbmc && tplBakedRows(denebTemplate())===0);
      /* X4 · Einzelkarte ohne Kategorie + ohne Titel (Power-BI-Karte) */
      state.kpiMultiScen=false; state.kpiSingle=true; state.kpiNoTitle=true; renderAll();
      const kbs=vegaSpec(false);
      ok('X · kpiBridge · Einzelkarte: kein Facet im Template', !kbs.facet && !kbs.spec);
      ok('X · kpiBridge · ohne Titel: kein title im Spec', !('title' in kbs));
      ok('X · kpiBridge · Einzelkarte: kein dim-Feld in vFieldDefs',
         !vFieldDefs().some(d=>d[0]==='dim'));
      let kbsc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; kbsc=!!VL.compile(b).spec; }catch(e){}
      ok('X · kpiBridge · Einzelkarte-Template kompiliert (baked=0)', kbsc && tplBakedRows(denebTemplate())===0);
      ok('X · kpiBridge · Einzelkarte rendert genau eine Karte', (chartHtml().match(/data-i=/g)||[]).length===1);
      /* X5 · andere KPI-Stile als Einzelkarte (ibcs/status) ohne Facet */
      state.kpiStyle='ibcs'; renderAll();
      ok('X · kpiIBCS · Einzelkarte: kein Facet', !vegaSpec(false).facet);
      state.kpiStyle='status'; renderAll();
      ok('X · kpiStatus · Einzelkarte: kein Facet', !vegaSpec(false).facet);
      /* X6 · Beschriftung ausblenden (Text in Power BI ergänzen) */
      state.kpiStyle='bridge'; state.kpiSingle=false; state.kpiNoTitle=false; state.kpiBars=false; state.kpiMultiScen=false;
      state.reference='PY'; state.reference2='PL';
      state.rows=[{c:'Umsatz',v1:120,v2:100,v3:130,fc:false},{c:'Marge',v1:18,v2:22,v3:19,fc:false}];
      state.kpiNoLabels=false; renderAll();
      const lblOn=(chartHtml().match(/<text/g)||[]).length;
      const tplOn=(JSON.stringify(vegaSpec(false)).match(/"type":"text"/g)||[]).length;
      state.kpiNoLabels=true; renderAll();
      const lblOff=(chartHtml().match(/<text/g)||[]).length;
      const tplOff=(JSON.stringify(vegaSpec(false)).match(/"type":"text"/g)||[]).length;
      ok('X · kpiBridge · Beschriftung ausblenden reduziert SVG-Labels', lblOff<lblOn && lblOff>0);
      ok('X · kpiBridge · Beschriftung ausblenden reduziert Template-Text-Marks', tplOff<tplOn);
      let nlc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; nlc=!!VL.compile(b).spec; }catch(e){}
      ok('X · kpiBridge · Template ohne Beschriftung kompiliert (baked=0)', nlc && tplBakedRows(denebTemplate())===0);
      /* X6b · Beschriftung ausblenden auch für IBCS/Status/Trend */
      ['ibcs','status','trend'].forEach(st=>{
        state.kpiStyle=st;
        if(st==='trend'){ state.series=['Umsatz']; state.srows=[]; for(let i=0;i<10;i++) state.srows.push({c:'T'+i, v:[100+i*2]}); state.rows=[{c:'Umsatz',v1:118,v2:100,v3:NaN,fc:false}]; }
        else state.rows=[{c:'Umsatz',v1:120,v2:100,v3:130,fc:false},{c:'Marge',v1:18,v2:22,v3:19,fc:false}];
        state.kpiNoLabels=false; renderAll(); const on=(chartHtml().match(/<text/g)||[]).length;
        const tOn=(JSON.stringify(vegaSpec(false)).match(/"type":"text"/g)||[]).length;
        state.kpiNoLabels=true; renderAll(); const off=(chartHtml().match(/<text/g)||[]).length;
        const tOff=(JSON.stringify(vegaSpec(false)).match(/"type":"text"/g)||[]).length;
        ok('X · kpi'+st+' · Beschriftung ausblenden reduziert Labels (SVG+Template)',
           off<on && off>0 && tOff<=tOn);
        let c=false; try{ const b=clone(denebTemplate()); delete b.usermeta; c=!!VL.compile(b).spec; }catch(e){}
        ok('X · kpi'+st+' · Template ohne Beschriftung kompiliert', c);
        state.kpiNoLabels=false;
      });
      state.kpiStyle='bridge';
      state.rows=[{c:'Umsatz',v1:120,v2:100,v3:130,fc:false},{c:'Marge',v1:18,v2:22,v3:19,fc:false}];
      /* X7 · Wizard empfiehlt alle 4 KPI-Stile nach Fokus */
      ok('X · Wizard · KPI+Werte → IBCS', wizRecommend({dim:'kpi',focus:'values'}).style==='ibcs');
      ok('X · Wizard · KPI+Status → Status', wizRecommend({dim:'kpi',focus:'status'}).style==='status');
      ok('X · Wizard · KPI+Verlauf → Trend', wizRecommend({dim:'kpi',focus:'trend'}).style==='trend');
      ok('X · Wizard · KPI+Brücke → Bridge', wizRecommend({dim:'kpi',focus:'bridge'}).style==='bridge');
      ok('X · Wizard · KPI+Abweichung (Alias) → Bridge', wizRecommend({dim:'kpi',focus:'variance'}).style==='bridge');
      state.kpiStyle='ibcs'; state.reference2='—'; state.kpiBars=false; state.kpiMultiScen=false; state.kpiSingle=false; state.kpiNoTitle=false; state.kpiNoLabels=false;

      /* X8 · IBCS-Polarity (higher/lower-is-better): "günstig" hängt von der
         Zeilen-Ausrichtung ab, nicht vom reinen Vorzeichen des Deltas */
      ok('X · favorable() · higher (Default): positives Delta ist günstig', favorable(5,{}) && !favorable(-5,{}));
      ok('X · favorable() · lower: negatives Delta ist günstig', favorable(-5,{polarity:'lower'}) && !favorable(5,{polarity:'lower'}));
      loadPreset('kpiDemo'); state.kpiStyle='ibcs'; renderAll();
      {
        const netto = state.rows.find(r=>r.c==='Nettoverschuldung');
        ok('X · kpiDemo · Nettoverschuldung hat polarity=lower (Schulden sinken = günstig)', netto && netto.polarity==='lower');
        const html = chartHtml();
        const seg = html.slice(html.indexOf('Nettoverschuldung'), html.indexOf('Nettoverschuldung')+1200);
        const posCol = varColors().pos, negCol = varColors().neg;
        ok('X · KPI ibcs · Nettoverschuldung (Δ<0, lower) rendert grün statt rot', seg.includes(posCol) && !seg.includes(negCol), 'seg enthält kein var-neg-Rot');
        state.kpiStyle='status'; renderAll();
        const html2 = chartHtml();
        const seg2 = html2.slice(html2.indexOf('Nettoverschuldung'), html2.indexOf('Nettoverschuldung')+900);
        ok('X · KPI status · Nettoverschuldung (Δ<0, lower) rendert grün statt rot', seg2.includes(posCol) && !seg2.includes(negCol));
        state.kpiStyle='ibcs';
      }
      /* Generischer Fall: Tabelle mit einer polarity=lower-Zeile */
      state.type='table'; state.reference='PY';
      state.rows=[{c:'Umsatz',v1:120,v2:100,fc:false},{c:'Kosten',v1:80,v2:100,fc:false,polarity:'lower'}];
      renderAll();
      {
        const html = chartHtml();
        const seg = html.slice(html.indexOf('>Kosten<'), html.indexOf('>Kosten<')+700);
        ok('X · Tabelle · Kosten gesunken (lower) rendert grün, kein Rot', seg.includes(varColors().pos) && !seg.includes(varColors().neg));
      }

      /* X9 · KPI ibcs · Deneb-Export: Zielbalken + Mini-Achsen-Pin + Polarity, kein NaN
         (deckt auch den vFieldMap-Fix ab: internes Feld 'd1'/'d2' kollidierte vorher mit
         der Hierarchie-Tabellen-Feldzuordnung 'Ebene 2'/'Ebene 3' -> +NaN im Export) */
      state.type='kpi'; state.kpiStyle='ibcs'; state.kpiSingle=false; state.kpiNoLabels=false;
      loadPreset('kpiDemo'); renderAll();
      {
        const tpl = denebTemplate(); const body = clone(tpl); delete body.usermeta;
        const fdefs = vFieldDefs();
        const data = activeRows().map(r=>{
          const o={}; fdefs.forEach((d,i)=>{ const key='__'+i+'__';
            if(d[0]==='dim') o[key]=r.c; else if(d[0]==='p') o[key]=r.v1;
            else if(d[0]==='r') o[key]=(r.v2===undefined||isNaN(r.v2))?null:r.v2;
            else if(d[0]==='r2') o[key]=(r.v3===undefined||isNaN(r.v3))?null:r.v3;
            else if(d[0]==='fc') o[key]=r.fc?1:0; });
          return o;
        });
        body.datasets = {dataset:data};
        const host=document.createElement('div'); document.body.appendChild(host);
        let ok_=false, nanCount=-1, nettoRow=null;
        try{
          const res = await embed(host, body, {actions:false, renderer:'svg'});
          nanCount = (host.innerHTML.match(/NaN/g)||[]).length;
          Object.keys(res.view._runtime.data).forEach(n=>{
            try{ const d=res.view.data(n); if(d && d.length===state.rows.length && d[0] && ('pol' in d[0])){
              const hit=d.find(x=>x.__0__==='Nettoverschuldung'); if(hit) nettoRow=hit; } }catch(e){}
          });
          ok_=true;
        }catch(e){}
        host.remove();
        ok('X · KPI ibcs · Deneb-Template kompiliert baked=0', ok_ && tplBakedRows(tpl)===0);
        ok('X · KPI ibcs · Deneb-Export ohne NaN (vFieldMap d1/d2-Kollision behoben)', nanCount===0, 'nanCount='+nanCount);
        ok('X · KPI ibcs · Deneb-Export: pol/pct/d1 für Nettoverschuldung korrekt berechnet',
           !!nettoRow && nettoRow.pol===true && nettoRow.d1===-22 && Math.abs(nettoRow.pct-97.27)<0.1,
           JSON.stringify(nettoRow));
      }
      /* Hierarchie-Tabelle bleibt vom vFieldMap-Fix unberührt (d0/d1/d2 weiterhin gemappt) */
      {
        loadPreset('tableHier'); renderAll();
        const fm = vFieldMap();
        ok('X · vFieldMap · Hierarchie-Tabelle behält d0/d1/d2-Mapping', fm.d0==='Ebene 1' && fm.d1==='Ebene 2');
        state.type='kpi'; loadPreset('kpiDemo'); renderAll();
        const fm2 = vFieldMap();
        ok('X · vFieldMap · KPI (kein Hierarchie-Typ) hat kein d1/d2-Mapping', fm2.d1===undefined && fm2.d2===undefined);
      }
    }

    /* === Y) „ohne FC" global + Karten-Überlauf ========================= */
    {
      /* noFC ignoriert das FC-Flag (keine Schraffur, kein fc-Feld im Export) */
      state.type='columns'; state.kpiStyle='ibcs'; state.primary='AC'; state.reference='PY'; state.reference2='—';
      state.rows=[{c:'Q1',v1:100,v2:90,v3:NaN,fc:false},{c:'Q2',v1:110,v2:95,v3:NaN,fc:true}];
      state.noFC=false; renderAll();
      ok('Y · FC · Schraffur + fc-Feld vorhanden (mit FC)',
         /url\(#h-/.test(chartHtml()) && vFieldDefs().some(d=>d[0]==='fc'));
      state.noFC=true; renderAll();
      let nc=false; try{ const b=clone(denebTemplate()); delete b.usermeta; nc=!!VL.compile(b).spec; }catch(e){}
      ok('Y · ohne FC · keine Schraffur, kein fc-Feld, Template kompiliert',
         !/url\(#h-/.test(chartHtml()) && !vFieldDefs().some(d=>d[0]==='fc') && nc && tplBakedRows(denebTemplate())===0);
      state.noFC=false;
      /* Karten-Überlauf: KPI-Brücke Balken/Einzelkarte – Texte innerhalb der Karte */
      state.type='kpi'; state.kpiStyle='bridge'; state.kpiBars=true; state.kpiSingle=true; state.kpiMultiScen=true;
      state.primary='AC'; state.reference='PL'; state.reference2='PY'; state.unit=''; state.decimals=0;
      state.rows=[{c:'Measure',v1:3730,v2:7407,v3:7100,fc:false}];
      renderAll();
      const svgEl=document.getElementById('chartHost').querySelector('svg');
      const Wc=+svgEl.getAttribute('viewBox').split(' ')[2];
      let over=0; svgEl.querySelectorAll('text').forEach(t=>{ try{ const bb=t.getBBox(); if(bb.x+bb.width>Wc-1) over++; }catch(e){} });
      ok('Y · KPI-Brücke Balken · Wert-Labels innerhalb der Karte (kein Überlauf)', over===0);
      /* Δ%-Pille: gefüllter, abgerundeter Hintergrund + weißer Text im VL-Template */
      const yTpl=denebTemplate(); const yJson=JSON.stringify(yTpl);
      ok('Y · KPI-Brücke · gefüllte Δ%-Pille im Template (rect cornerRadius + Lpill)',
         /"cornerRadius":8/.test(yJson) && /"as":"Lpill"/.test(yJson) && /"fill":"#ffffff"/.test(yJson));
      let yc=false; try{ const b=clone(yTpl); delete b.usermeta; yc=!!VL.compile(b).spec; }catch(e){}
      ok('Y · KPI-Brücke · Pillen-Template kompiliert (baked=0)', yc && tplBakedRows(yTpl)===0);
      /* IBCS-Karte: gleiche gefüllte Δ%-Pille im VL-Template (Parität zur SVG) */
      state.kpiStyle='ibcs'; state.kpiBars=false; state.kpiSingle=false; state.kpiMultiScen=false;
      state.reference='PY'; state.reference2='PL';
      state.rows=[{c:'Umsatz',v1:120,v2:100,v3:130,fc:false},{c:'Marge',v1:18,v2:22,v3:19,fc:false}];
      renderAll();
      const yT2=denebTemplate(); const yJ2=JSON.stringify(yT2);
      ok('Y · KPI-IBCS · gefüllte Δ%-Pille im Template (cornerRadius + Lpill1/2 + weiß)',
         /"cornerRadius":8/.test(yJ2) && /"as":"Lpill1"/.test(yJ2) && /"fill":"#ffffff"/.test(yJ2));
      let yc2=false; try{ const b=clone(yT2); delete b.usermeta; yc2=!!VL.compile(b).spec; }catch(e){}
      ok('Y · KPI-IBCS · Pillen-Template kompiliert (baked=0)', yc2 && tplBakedRows(yT2)===0);
      state.kpiStyle='ibcs'; state.kpiBars=false; state.kpiSingle=false; state.kpiMultiScen=false; state.reference2='—';
      /* Y2 · Zeichenflächen-Größe: feste Größe skaliert die Vorschau (svg width/height) */
      if('vlSizeMode' in state){
        state.type='columns'; state.reference='PY';
        state.rows=[{c:'Q1',v1:100,v2:90,v3:NaN,fc:false},{c:'Q2',v1:110,v2:95,v3:NaN,fc:false}];
        state.vlSizeMode='fixed'; state.vlW=1240; state.vlH=340; renderAll();
        const sv=document.getElementById('chartHost').querySelector('svg');
        ok('Y · Zeichenfläche fest · Vorschau-SVG auf vlW×vlH skaliert (füllt die Fläche, kein Letterboxing)',
           sv && sv.style.width==='1240px' && sv.style.height==='340px' && sv.getAttribute('preserveAspectRatio')==='none');
        state.vlSizeMode='fit'; renderAll();
        const sv2=document.getElementById('chartHost').querySelector('svg');
        ok('Y · Zeichenfläche Auto · responsiv (keine feste SVG-Breite)', sv2 && !sv2.style.width);
        state.vlSizeMode='fit'; state.vlW=600; state.vlH=340;
      }
    }

    /* === N) Korrelations-Scatter: Trendlinie + Facetten je Gruppe ====== */
    if('scatterFacet' in state){
      const mk=(c,x,y,g)=>({c,v1:x,v2:y,v3:NaN,fc:false,grp:g});
      state.type='scatter'; state.xTitle='X'; state.yTitle='Y';
      state.rows=[mk('A',10,12,'West'),mk('B',20,19,'West'),mk('C',30,31,'West'),
                  mk('D',12,30,'Ost'),mk('E',22,24,'Ost'),mk('F',32,18,'Ost')];
      /* N1 · einzeln + Regression */
      state.scatterFacet=false; state.scatterReg=true; renderAll();
      ok('N · scatter · Trendlinie+R² in SVG, kein NaN', /R² =/.test(chartHtml()) && !/NaN/.test(chartHtml()));
      ok('N · scatter · VL hat regression-Layer', JSON.stringify(vegaSpec(false)).includes('"regression"'));
      let n1=false; try{ const b=clone(denebTemplate()); delete b.usermeta; n1=!!VL.compile(b).spec; }catch(e){}
      ok('N · scatter · Template (einzeln) kompiliert', n1 && tplBakedRows(denebTemplate())===0);
      /* N2 · facettiert je Gruppe */
      state.scatterFacet=true; state.scatterCols=2; renderAll();
      ok('N · scatter · SVG-Facetten je Gruppe (West/Ost), kein NaN',
         /West/.test(chartHtml()) && /Ost/.test(chartHtml()) && !/NaN/.test(chartHtml()));
      const vlf=vegaSpec(false);
      ok('N · scatter · VL facettiert nach Gruppe', !!vlf.facet && JSON.stringify(vlf).includes('"regression"'));
      const tplN=denebTemplate(); const gd=tplN.usermeta.dataset.find(d=>d.name==='Gruppe');
      let n2=false; try{ const b=clone(tplN); delete b.usermeta; n2=!!VL.compile(b).spec; }catch(e){}
      ok('N · scatter · Template facettiert + Gruppe als text-column-Platzhalter',
         n2 && tplBakedRows(tplN)===0 && !!tplN.facet && /^__\d+__$/.test(tplN.facet.field)
         && !!gd && gd.kind==='column' && gd.type==='text');
      state.scatterFacet=false; state.scatterReg=false;

      /* N3 · FC-Punkte (hohl/gestrichelt statt ununterscheidbar von Ist) + Ø-Beschriftung im Deneb-Export */
      state.rows[0].fc = true; renderAll();
      const svgN3 = chartHtml();
      ok('N · scatter · Ø-Beschriftung in der SVG-Vorschau', /Ø X/.test(svgN3) && /Ø Y/.test(svgN3));
      {
        const tpl = clone(denebTemplate()); const body = clone(tpl); delete body.usermeta;
        ok('N · scatter · fc als eigenes Platzhalter-Feld deklariert', tpl.usermeta.dataset.some(d=>d.key && /^__\d+__$/.test(d.key) && /FC-Flag/.test(d.description||'')));
        const fdefs = vFieldDefs();
        const data = state.rows.map(r=>{
          const o={}; fdefs.forEach((d,i)=>{ const key='__'+i+'__';
            if(d[0]==='x') o[key]=r.v1; else if(d[0]==='y') o[key]=r.v2;
            else if(d[0]==='g') o[key]=(r.v3===undefined||isNaN(r.v3))?null:r.v3;
            else if(d[0]==='fc') o[key]=r.fc?1:0; });
          return o;
        });
        body.datasets = {dataset:data};
        const host = document.createElement('div'); document.body.appendChild(host);
        let compiled=false, html='';
        try{ await embed(host, body, {actions:false, renderer:'svg'}); html = host.innerHTML; compiled=true; }catch(e){}
        const circles = (html.match(/<path[^>]*aria-roledescription="circle"[^>]*>/g)||[]);
        const fcCircle = circles.find(c=>/stroke-dasharray="3,2"/.test(c) && /fill="#ffffff"/.test(c));
        const acCircles = circles.filter(c=>!/stroke-dasharray="3,2"/.test(c));
        host.remove();
        ok('N · scatter · Deneb-Export kompiliert, kein NaN, baked=0',
           compiled && !/NaN/.test(html) && tplBakedRows(tpl)===0);
        ok('N · scatter · Deneb-Export: FC-Punkt hohl+gestrichelt, Ist-Punkte solide',
           !!fcCircle && acCircles.length===state.rows.length-1);
        ok('N · scatter · Deneb-Export zeigt Ø-Beschriftung', /Ø X/.test(html) && /Ø Y/.test(html));
      }
      state.rows[0].fc = false;
    }

    /* === O) Geführte Optionen: typ-bewusste Karten-Registry =========== */
    if(typeof guideCardsHtml==='function'){
      const cardsFor = ty=>{ state.type=ty; if(needsRef()&&state.reference==='—') state.reference='PY'; return guideCardsHtml(); };
      ok('O · Säulen · Abweichung+Referenzlinie+Trellis-Export',
         /data-opt="var"/.test(cardsFor('columns')) && /data-opt="refLine"/.test(cardsFor('columns')) && /data-optin="facetField"/.test(cardsFor('columns')));
      ok('O · Scatter · Korrelations-Optionen', /data-opt="scReg"/.test(cardsFor('scatter')) && /data-opt="scFacet"/.test(cardsFor('scatter')));
      ok('O · Wasserfall · Ausrichtung', /data-opt="wfOrient"/.test(cardsFor('waterfall')));
      ok('O · Brücke · Ref-2-Säule: Hinweis bei fehlendem v3, Säule bei v3', (()=>{
        const sv=clone(state.rows);
        state.type='bridge'; state.wfOrient='h'; state.reference2='PY'; state.bridgePYlevel=true;
        state.rows=[{c:'A',v1:50,v2:40},{c:'B',v1:30,v2:35}]; renderAll();
        const hintNo = /PY-Säulen: bitte/.test(chartHtml());
        state.rows=[{c:'A',v1:50,v2:40,v3:38},{c:'B',v1:30,v2:35,v3:33}]; renderAll();
        const html2 = chartHtml(); const hintYes = /PY-Säulen: bitte/.test(html2);
        state.rows=sv; state.bridgePYlevel=false; state.reference2='—'; state.type='bridge'; renderAll();
        return hintNo && !hintYes && />PY</.test(html2);
      })());
      ok('O · Auto-Demo · leere v3/grp/Dim-Spalten füllen sich beim Aktivieren', (()=>{
        if(typeof autofillDemo!=='function') return false;
        const sv=clone(state.rows), st=state.type, sr2=state.reference2, sgf=state.grpFacet, std=state.tableDims;
        let okV3=false, okGrp=false, okDim=false;
        // v3 via Referenz 2
        state.type='bridge'; state.reference2='PY'; state.rows=[{c:'A',v1:50,v2:40},{c:'B',v1:30,v2:35}];
        autofillDemo(); okV3 = state.rows.every(r=>!isNaN(r.v3));
        // grp via columns-Facette
        state.type='columns'; state.grpFacet=true; state.rows=[{c:'Jan',v1:10,v2:9},{c:'Feb',v1:12,v2:10},{c:'Mär',v1:8,v2:9}];
        autofillDemo(); okGrp = state.rows.every(r=>String(r.grp||'').trim());
        // Dim-Spalten via Tabellen-Hierarchie
        state.type='table'; state.tableDims=2; state.grpFacet=false; state.rows=[{c:'X',v1:5,v2:4},{c:'Y',v1:6,v2:5}];
        autofillDemo(); okDim = state.rows.every(r=>r.d0 && r.d1);
        state.rows=sv; state.type=st; state.reference2=sr2; state.grpFacet=sgf; state.tableDims=std; renderAll();
        return okV3 && okGrp && okDim;
      })());
      ok('O · Brücke · Referenz-2-Säulen-Optionen erscheinen bei gesetzter Ref 2', (()=>{
        state.type='bridge'; state.wfOrient='h'; state.reference2='PY';
        const g=guideCardsHtml();
        const has = /data-opt="bridgePY"/.test(g) && /data-opt="bridgePYlevel"/.test(g);
        state.reference2='—'; const g2=guideCardsHtml();
        return has && !/data-opt="bridgePYlevel"/.test(g2);   /* ohne Ref 2 keine Toggles */
      })());
      ok('O · colline · Dual-Axis-Optionen', /data-opt="clSwap"/.test(cardsFor('colline')) && /data-opt="clAxis"/.test(cardsFor('colline')));
      ok('O · Barrierefreiheit · Farb-Option (cbSafe) in jedem Typ',
         ['columns','scatter','waterfall','table','kpi'].every(ty=>/data-opt="cbSafe"/.test(cardsFor(ty))));
      ok('O · jeder Typ liefert Titel-Karte + keine Exception', (()=>{
        try{ return ['columns','line','bars','scatter','waterfall','bridge','multiples','stackcol','table','kpi','boxplot','pareto']
          .every(ty=>/data-optin="t1"/.test(cardsFor(ty))); }catch(e){ return false; }
      })());
      /* Szenarien-Karte (Primär/Referenz) in skalaren Typen, Referenz 2 nur bei usesRef2 */
      ok('O · Szenarien-Karte (prim/ref) in columns, nicht in tree',
         /data-opt="prim"/.test(cardsFor('columns')) && /data-opt="ref"/.test(cardsFor('columns')) && !/data-opt="prim"/.test(cardsFor('tree')));
      ok('O · Referenz 2 nur bei Varianz-Typen (barskombi ja, line nein)', (()=>{
        state.reference2='PY'; const bk=cardsFor('barskombi'); const ln=cardsFor('line');
        return /data-opt="ref2"/.test(bk) && !/data-opt="ref2"/.test(ln);
      })());
      state.reference2='—';
      state.refLine='none';
    }

    /* === P) Heatmap-Deneb-Template + Szenario-Notation der VL-Referenzlinien = */
    {
      /* P1 · Heatmap als echtes Template (rect + Farbskala, kein SVG-only) */
      loadPreset('heatmapDemo'); state.type='heatmap'; renderAll();
      const vlH=vegaSpec(false);
      ok('P · heatmap · VL ist rect-Heatmap (kein null/SVG-only)', !!vlH && /"rect"/.test(JSON.stringify(vlH)) && /(domainMid|#efeee9)/.test(JSON.stringify(vlH)));
      const tH=denebTemplate(); const bH=clone(tH); delete bH.usermeta;
      let hc=false; try{ hc=!!VL.compile(bH).spec; }catch(e){}
      ok('P · heatmap · Template kompiliert (baked=0) + serie/v deklariert',
         hc && tplBakedRows(tH)===0 && tH.usermeta.dataset.length===3);
      /* P2 · Referenzlinien-Notation im VL-Template = Vorschau */
      loadPreset('months'); state.type='line'; state.reference='PL'; renderAll();
      ok('P · line · PL-Referenz gestrichelt im VL', /"strokeDash":\[5,3\]/.test(JSON.stringify(vegaSpec(false))));
      state.type='columns'; state.reference='FC'; state.refStyle='offset'; renderAll();
      ok('P · columns · FC-Referenzsäule mit strokeDash', /"strokeDash"/.test(JSON.stringify(vegaSpec(false))));
      state.reference='PY'; state.refStyle='offset';
    }

    /* === Q) Integrierte GuV: wfkombi mit 2. Szenario-Wasserfall-Spalte ==== */
    if('wfRefCol' in state){
      loadPreset('pnlVA'); state.type='wfkombi'; state.reference='FC';
      state.wfRefCol=false; renderAll();
      const wOff=+(document.querySelector('#chartHost svg')||{}).getAttribute?.('width')||0;
      state.wfRefCol=true; renderAll();
      const svg=chartHtml();
      const wOn=+document.querySelector('#chartHost svg').getAttribute('width');
      ok('Q · wfkombi · SVG zeigt 2. Szenario-Wasserfall (AC+FC, schraffiert)',
         />AC</.test(svg) && />FC</.test(svg) && /h-dark/.test(svg) && !/NaN/.test(svg) && wOn>wOff);
      const vl=vegaSpec(false);
      ok('Q · wfkombi · VL hat Referenz-Wasserfall (sR/eR) + shared-x',
         /"sR"/.test(JSON.stringify(vl)) && /"x":"shared"/.test(JSON.stringify(vl)));
      const tQ=denebTemplate(); const bQ=clone(tQ); delete bQ.usermeta;
      let qc=false; try{ qc=!!VL.compile(bQ).spec; }catch(e){}
      ok('Q · wfkombi · Template kompiliert (baked=0) + AC/FC-Felder',
         qc && tplBakedRows(tQ)===0 && tQ.usermeta.dataset.some(d=>d.name==='AC') && tQ.usermeta.dataset.some(d=>d.name==='FC'));
      /* Q2: Wasserfall-Konnektoren im Template (window-lead + Konnektor-Rule #c2c2c2) */
      const jQ=JSON.stringify(tQ);
      ok('Q · wfkombi · Wasserfall-Konnektoren im Template (lead-window + #c2c2c2)',
         /"op":"lead"/.test(jQ) && /"y2":\{"field":"leadK"/.test(jQ) && /#c2c2c2/.test(jQ));
      /* Q3: auch der einfache Wasserfall-Export hat Konnektoren */
      state.type='waterfall'; state.wfRefCol=false; state.reference='—'; state.showAbs=false; state.showRel=false; state.wfOrient='v';
      state.wrows=[{c:'Start',v:100,r2:NaN,t:'sum'},{c:'A',v:30,r2:NaN,t:'delta'},{c:'Ende',v:130,r2:NaN,t:'sum'}];
      renderAll();
      const tW=denebTemplate(); const jW=JSON.stringify(tW); const bW=clone(tW); delete bW.usermeta;
      let wc=false; try{ wc=!!VL.compile(bW).spec; }catch(e){}
      ok('Q · waterfall · Konnektoren im Template (lead-window + #c2c2c2), kompiliert',
         wc && /"op":"lead"/.test(jW) && /#c2c2c2/.test(jW) && tplBakedRows(tW)===0);
      /* Virtuelle Kachel „Integrierte GuV" (wfint) ist gegenseitig exklusiv zu wfkombi */
      if(typeof typeIsOn==='function'){
        state.type='wfkombi'; state.wfRefCol=true;
        ok('Q · wfint · Kachel aktiv bei wfkombi+wfRefCol (exklusiv)', typeIsOn('wfint') && !typeIsOn('wfkombi'));
        state.wfRefCol=false;
        ok('Q · wfkombi · Kachel aktiv ohne wfRefCol', typeIsOn('wfkombi') && !typeIsOn('wfint'));
      }
      state.wfRefCol=false;
    }

    /* === R) varint · YTD-Tier-Toggle + Furniture-Inc.-Preset (IBCS 1:1) === */
    if('varYTD' in state){
      /* Toggle blendet den kumulierten ΔRef%_YTD-Tier ein/aus (4 vs 3 Tiers) */
      loadPreset('varintDemo'); state.varYTD=true; renderAll();
      const tiersOn=(vegaSpec(false).vconcat||[]).length;
      state.varYTD=false; renderAll();
      const tiersOff=(vegaSpec(false).vconcat||[]).length;
      ok('R · varint · varYTD schaltet YTD-Tier (4→3 im VL-vconcat)',
         tiersOn===4 && tiersOff===3, 'on='+tiersOn+' off='+tiersOff);
      const svgOn=(state.varYTD=true, renderAll(), chartHtml());
      const svgOff=(state.varYTD=false, renderAll(), chartHtml());
      ok('R · varint · YTD aus → SVG ohne _YTD-Tier, kein NaN',
         /_YTD/.test(svgOn) && !/_YTD/.test(svgOff) && !/NaN/.test(svgOff));
      /* Furniture-Inc.-Preset: 3 Tiers, decimals=0, endPins, varYTD=false, 12 Monate */
      if(typeof PRESETS==='object' && PRESETS.furnitureInc){
        loadPreset('furnitureInc');
        ok('R · Furniture-Inc.-Preset · varint, varYTD=false, decimals=0, 12 Zeilen',
           state.type==='varint' && state.varYTD===false && state.decimals===0 && state.rows.length===12);
        const svgF=chartHtml();
        ok('R · Furniture-Inc.-Preset · 3 Tiers + Σ-Totale (132/83/49), kein NaN',
           />132</.test(svgF) && />83</.test(svgF) && />49</.test(svgF) && !/_YTD/.test(svgF) && !/NaN/.test(svgF));
        const tF=denebTemplate(); const bF=clone(tF); delete bF.usermeta;
        let fc=false; try{ fc=!!VL.compile(bF).spec; }catch(e){}
        ok('R · Furniture-Inc.-Preset · Template kompiliert (baked=0)',
           fc && tplBakedRows(tF)===0 && (bF.vconcat||[]).length===3);
      }
      state.varYTD=true;
    }

    /* === R2) varint · Σ-Referenzsäulen + Total-Varianz-Pin (Alpha-Preset) === */
    if('varRefCols' in state && typeof PRESETS==='object' && PRESETS.alphaSoftware){
      loadPreset('alphaSoftware');
      ok('R2 · Alpha-Preset · varint, varRefCols=true, decimals=0, 12 Zeilen',
         state.type==='varint' && state.varRefCols===true && state.decimals===0 && state.rows.length===12);
      const svgA=chartHtml();
      /* Σ-PL-Referenz (154), AC+FC-Total (178/83/95), +24-Pin, kein NaN */
      ok('R2 · Alpha-Preset · Σ-Referenz 154 + Total 178/83/95 + Pin +24',
         />154</.test(svgA) && />178</.test(svgA) && />83</.test(svgA) && />95</.test(svgA) && /\+24/.test(svgA) && !/NaN/.test(svgA));
      /* varRefCols ist sticky-frei: ein Folge-Preset ohne refCols schaltet es ab */
      loadPreset('varintDemo');
      ok('R2 · varRefCols nicht sticky (Folge-Preset ohne refCols → aus)', state.varRefCols===false);
      /* Template kompiliert weiterhin (refCols ist SVG-Preview-Feature) */
      loadPreset('alphaSoftware');
      const tA=denebTemplate(); const bA=clone(tA); delete bA.usermeta;
      let ac=false; try{ ac=!!VL.compile(bA).spec; }catch(e){}
      ok('R2 · Alpha-Preset · Template kompiliert trotz varRefCols', ac && tplBakedRows(tA)===0);
    }

    /* === S) Treiberbaum (tree) · frei definierbares JSON-Modell, SVG-only === */
    if('treeJson' in state){
      loadPreset('roiTree');
      const svgT=chartHtml();
      ok('S · tree · ROI-Preset rendert alle Knoten + Operatoren, kein NaN',
         />Return on investment</.test(svgT) && />Capital turnover</.test(svgT) &&
         />Invested capital</.test(svgT) && svgT.indexOf('×')>=0 && svgT.indexOf('÷')>=0 && !/NaN/.test(svgT));
      /* 7 Knoten-Boxen (rx=4) + 3 Operator-Kreise */
      const host=document.getElementById('chartHost');
      ok('S · tree · 7 Knoten-Boxen + 3 Operator-Knoten',
         host.querySelectorAll('rect[rx="4"]').length===7 && host.querySelectorAll('circle').length===3);
      /* SVG-only: kein Vega/Deneb-Template */
      ok('S · tree · ist SVG-only (vegaSpecCore→null)', vegaSpecCore(false)===null);
      /* robust gegen ungültiges JSON: Fehlerhinweis statt Crash */
      const good=state.treeJson;
      state.treeJson='{ kaputt';
      let crash=false, errSvg='';
      try{ renderAll(); errSvg=chartHtml(); }catch(e){ crash=true; }
      ok('S · tree · ungültiges JSON → Fehlerhinweis, kein Absturz',
         !crash && /Treiberbaum/.test(errSvg) && !/NaN/.test(errSvg));
      state.treeJson=good; renderAll();
    }

    /* === U) Z-Chart · Monatswerte als Linie ODER Szenario-Säulen === */
    if('zMonthCol' in state){
      loadPreset('zDemo');
      state.zMonthCol=false; renderAll();
      const rectsLine = document.getElementById('chartHost').querySelectorAll('svg rect').length;
      state.zMonthCol=true; renderPreview();
      const rectsCol = document.getElementById('chartHost').querySelectorAll('svg rect').length;
      ok('U · Z-Chart · Säulen-Modus ergänzt Monats-Säulen (≥ Anzahl Monate)',
         rectsCol-rectsLine >= state.rows.length-1 && !/NaN/.test(chartHtml()));
      /* Deneb-Template kompiliert mit Bar-Mark, kein baked */
      const tU=denebTemplate(); const bU=clone(tU); delete bU.usermeta;
      let uc=false; try{ uc=!!VL.compile(bU).spec; }catch(e){}
      ok('U · Z-Chart · Säulen-Template kompiliert (bar-Mark, baked=0)',
         uc && /"type":"bar"/.test(JSON.stringify(bU)) && tplBakedRows(tU)===0);
      /* 2-Szenarien-Vergleich: 2 Säulen (xOffset im Template) bzw. 2 Linien */
      state.reference='PL'; state.zMonthCol=true; state.zMonthRef=true; renderPreview();
      const rects2 = document.getElementById('chartHost').querySelectorAll('svg rect').length;
      const t2col=denebTemplate(); const b2=clone(t2col); delete b2.usermeta;
      let c2=false; try{ c2=!!VL.compile(b2).spec; }catch(e){}
      ok('U · Z-Chart · 2 Szenarien als Säulen (Referenz-Säulen + xOffset-Template)',
         rects2 > rectsCol && c2 && /"xOffset"/.test(JSON.stringify(b2)) && tplBakedRows(t2col)===0);
      state.zMonthCol=false; renderPreview();
      const lines2 = document.getElementById('chartHost').querySelectorAll('svg line').length;
      state.zMonthRef=false; renderPreview();
      const lines1 = document.getElementById('chartHost').querySelectorAll('svg line').length;
      const t2line=denebTemplate(); const bl=clone(t2line); delete bl.usermeta;
      let cl=false; try{ cl=!!VL.compile(bl).spec; }catch(e){}
      ok('U · Z-Chart · 2 Szenarien als Linien (mehr Liniensegmente + Template kompiliert)',
         lines2 > lines1 && cl && tplBakedRows(t2line)===0 && !/NaN/.test(chartHtml()));
      /* Guide-Karte vorhanden (zMonthCol + zMonthRef bei gesetzter Referenz) */
      ok('U · Z-Chart · Guide-Karte zMonthCol + zMonthRef', (()=>{ state.type='zchart'; state.reference='PL'; const g=guideCardsHtml(); return /data-opt="zMonthCol"/.test(g) && /data-opt="zMonthRef"/.test(g); })());
      state.zMonthCol=false; state.zMonthRef=false;

      /* U2 · unvollständige Referenzwerte: Deneb-Export darf die gleitende Jahressumme
         nicht kommentarlos falsch anzeigen (Vega-Bug-Klasse: joinaggregate sum überspringt nulls) */
      loadPreset('zDemo'); state.reference='PY'; renderAll();
      const zFieldDefs = vFieldDefs();
      const toDenebData = rowsArr => rowsArr.map(r=>{
        const o={}; zFieldDefs.forEach((d,i)=>{ const key='__'+i+'__';
          if(d[0]==='dim') o[key]=r.c; else if(d[0]==='p') o[key]=r.v1;
          else if(d[0]==='r') o[key]=(r.v2===undefined||isNaN(r.v2))?null:r.v2;
          else if(d[0]==='fc') o[key]=r.fc?1:0; });
        return o;
      });
      const renderDenebZ = async rowsArr => {
        const body=clone(denebTemplate()); delete body.usermeta;
        body.datasets={dataset:toDenebData(rowsArr)};
        const host=document.createElement('div'); document.body.appendChild(host);
        let mats=null, warn=false, ok_=false;
        try{
          const res=await embed(host, body, {actions:false, renderer:'svg'});
          Object.keys(res.view._runtime.data).forEach(n=>{
            try{ const d=res.view.data(n); if(d && d.length===rowsArr.length && d[0] && ('mat' in d[0])) mats=d.map(x=>x.mat); }catch(e){}
          });
          warn = /unvollständig/.test(host.innerHTML); ok_=true;
        }catch(e){}
        host.remove();
        return {mats, warn, ok_};
      };
      const zRowsOk = JSON.parse(JSON.stringify(activeRows()));
      const zRowsBad = JSON.parse(JSON.stringify(zRowsOk)); zRowsBad[2].v2 = null;
      const resOk = await renderDenebZ(zRowsOk);
      const resBad = await renderDenebZ(zRowsBad);
      ok('U · Z-Chart · vollständige Referenz: gleitende Summe berechnet, kein Warnhinweis',
         resOk.ok_ && resOk.mats && resOk.mats.every(v=>v!==null) && !resOk.warn);
      ok('U · Z-Chart · unvollständige Referenz: Deneb-Export nullt die gleitende Summe (kein Fantasiewert) + zeigt Warnhinweis',
         resBad.ok_ && resBad.mats && resBad.mats.every(v=>v===null) && resBad.warn);
    }

    /* === T) Szenariovergleich je Gruppe · In-Preview Small Multiples (columns/line) === */
    if('grpFacet' in state && typeof PRESETS==='object' && PRESETS.regionFacet){
      loadPreset('regionFacet');
      ok('T · regionFacet-Preset · columns + grpFacet, 4 Gruppen, kein NaN',
         state.type==='columns' && state.grpFacet===true && typeof timeIsFaceted==='function' && timeIsFaceted());
      const svgC=chartHtml();
      ok('T · Säulen-Facetten · alle Gruppentitel sichtbar',
         />DACH</.test(svgC) && />EMEA</.test(svgC) && />APAC</.test(svgC) && />LATAM</.test(svgC) && !/NaN/.test(svgC));
      /* gemeinsame vs freie Skala erzeugen unterschiedliche Ausgabe */
      state.grpScale='shared'; renderPreview(); const a=chartHtml().length;
      state.grpScale='free';   renderPreview(); const b=chartHtml().length;
      ok('T · Skala gemeinsam ≠ frei (SHARED_SCALE greift)', a!==b);
      state.grpScale='shared';
      /* Linien-Variante facettet ebenfalls */
      state.type='line'; renderPreview();
      ok('T · Linien-Facetten rendern (Liniensegmente, kein NaN)',
         timeIsFaceted() && document.getElementById('chartHost').querySelectorAll('line').length>0 && !/NaN/.test(chartHtml()));
      /* sticky-frei: Folge-Preset ohne grpFacet schaltet ab + columns-Vorschau wieder 1 Kachel */
      loadPreset('months');
      ok('T · grpFacet nicht sticky (Folge-Preset → aus) + nicht faceted', state.grpFacet===false && !timeIsFaceted());
    }

    /* === V) Hierarchie-Tabelle: Blätter mit N Dim-Spalten → Multi-Dim-Template === */
    if('tableDims' in state && typeof PRESETS==='object' && PRESETS.tableHier){
      loadPreset('tableHier');
      ok('V · tableHier-Preset · table, tableDims=2, 6 Blattzeilen',
         state.type==='table' && state.tableDims===2 && state.rows.length===6 && tableIsHier());
      /* Vorschau: berechnete Eltern-Σ (278/192/227) + Gesamt-Σ 697, kein NaN */
      const svgV=chartHtml();
      ok('V · Vorschau · Eltern-Σ (278/192/227) + Σ 697 aus Blättern',
         />278</.test(svgV) && />192</.test(svgV) && />227</.test(svgV) && />697</.test(svgV) && !/NaN/.test(svgV));
      /* Deneb-Template: 2 Dim-Platzhalter (text/column) + Messwerte, kompiliert, baked=0, keine Leaks */
      const tV=denebTemplate(); const bV=clone(tV); delete bV.usermeta;
      let vc=false; try{ vc=!!VL.compile(bV).spec; }catch(e){}
      const ds=tV.usermeta.dataset;
      const dimFields=ds.filter(d=>d.type==='text'&&d.kind==='column');
      const bodyV=JSON.stringify(bV);
      ok('V · Template · ≥2 Dim-Felder (text/column) + kompiliert + baked=0',
         vc && tplBakedRows(tV)===0 && dimFields.length>=2 && /__0__/.test(bodyV) && /__1__/.test(bodyV));
      ok('V · Template · keine rohen internen Feldnamen-Leaks (d0/d1/klf als field)',
         !/"field":"d0"/.test(bodyV) && !/"field":"d1"/.test(bodyV) && !/"field":"p"/.test(bodyV));
      /* embedded (Vega-Editor) kompiliert ebenfalls */
      const embV=vegaSpec(false); let ev=false; try{ ev=!!VL.compile(embV).spec; }catch(e){}
      ok('V · embedded VL (Vega-Editor) kompiliert', ev);
      /* sticky-frei: Folge-Preset ohne tableDims → Liste */
      loadPreset('countriesTab');
      ok('V · tableDims nicht sticky (Folge-Preset → Liste)', (state.tableDims||0)<2 && !tableIsHier());
      /* Guide-Karte */
      ok('V · Guide-Karte tableDims', (()=>{ state.type='table'; return /data-opt="tableDims"/.test(guideCardsHtml()); })());
    }

    /* === W) Raw-Vega-Tabelle: interaktiv, große Daten, Cross-Filter, Drill === */
    if('rawVega' in state && typeof rvTableSpec==='function' && window.vega){
      loadPreset('tableHier'); state.rawVega=true;
      const tpl=denebTemplate();
      let parses=false; try{ parses=!!window.vega.parse(tpl); }catch(e){}
      ok('W · Raw-Vega-Tabelle · Deneb-Template gültiges Vega (provider vega, baked=0, Limit≥1000, Signale)',
         parses && tpl.usermeta && tpl.usermeta.deneb.provider==='vega' && tplBakedRows(tpl)===0 &&
         tpl.usermeta.interactivity.dataPointLimit>=1000 && Array.isArray(tpl.signals));
      ok('W · Raw-Vega-Tabelle · Hierarchie-Dims + Messwerte im Dataset',
         tpl.usermeta.dataset.filter(d=>d.kind==='column'&&d.type==='text').length>=2 && tpl.usermeta.dataset.some(d=>d.kind==='measure'));
      /* eingebettet rendern + Collapse versteckt Kinder (Eltern-Synthese + Signal) */
      let collapseOk=false; try{
        const sp=rvTableSpec(false);
        const v=new window.vega.View(window.vega.parse(sp),{renderer:'none'}); await v.runAsync();
        const before=v.data('all').length; const par=v.data('all').find(d=>d.isParent);
        v.signal('clickParent', par); await v.runAsync();
        const after=v.data('all').length; v.finalize();
        collapseOk = before>after && after>0;
      }catch(e){}
      ok('W · Raw-Vega-Tabelle · eingebettet rendert + Collapse versteckt Kinder', collapseOk);
      /* flache Liste (kein Hierarchie) parst ebenfalls als Raw-Vega */
      loadPreset('countriesTab'); state.rawVega=true; state.tableDims=0;
      const tF=denebTemplate(); let pf=false; try{ pf=!!window.vega.parse(tF); }catch(e){}
      ok('W · Raw-Vega-Tabelle · flache Liste parst + baked=0', pf && tplBakedRows(tF)===0);
      /* Guide-Karte */
      ok('W · Raw-Vega-Tabelle · Guide-Karte (Engine-Umschalter)', (()=>{ state.type='table'; return /data-opt="rawVega"/.test(guideCardsHtml()); })());
      /* Varianz-Raw-Vega (columns): Template gültiges Vega + Cross-Filter-Engine */
      loadPreset('countries'); state.type='columns'; state.reference='PL'; state.rawVega=true;
      const tV=denebTemplate(); let pV=false; try{ pV=!!window.vega.parse(tV); }catch(e){}
      ok('W · Raw-Vega-Varianz (columns) · gültiges Vega-Template (provider vega, baked=0)',
         pV && tV.usermeta.deneb.provider==='vega' && tplBakedRows(tV)===0);
      ok('W · Raw-Vega-Varianz · Engine-Karte auch bei Varianz-Typen', (()=>{ state.type='columns'; return /data-opt="rawVega"/.test(guideCardsHtml()); })());
      /* alle freigeschalteten Raw-Vega-Typen: rendern embedded + parsen als Deneb */
      if(typeof RAWVAR_TYPES!=='undefined' && typeof rvSpecFor==='function'){
        let allOk=true, bad='';
        for(const ty of RAWVAR_TYPES){
          state.type=ty; state.reference = (ty==='line'?'PY':'PL'); state.rawVega=true;
          try{
            const sp=rvSpecFor(false); const v=new window.vega.View(window.vega.parse(sp),{renderer:'none'}); await v.runAsync(); v.finalize();
            const tpl=denebTemplate(); if(!window.vega.parse(tpl) || tplBakedRows(tpl)!==0) { allOk=false; bad=ty+':template'; break; }
          }catch(e){ allOk=false; bad=ty+':'+(e.message||e); break; }
        }
        ok('W · Raw-Vega · alle Typen ('+RAWVAR_TYPES.join('/')+') rendern + Deneb-Template parst', allOk, bad);
      }
      state.rawVega=false;
    }

    /* === Z1) Dashboard-Export (Mehr-Chart-Deneb-Spec) – bisher komplett ungetestet ===== */
    if(typeof dashboardSpec==='function' && typeof denebDashTemplate==='function'){
      /* Zwei kompatible Kacheln (beide 'columns', gleiche Kategorien-Achse Jan..Dez, aber
         unterschiedliche Referenz) – Dashboard teilt sich EIN Deneb-Dataset über alle Kacheln,
         daher hier bewusst kein Mix mit einem facettierenden Typ (z.B. KPI), sonst sieht jede
         Kachel auch die Kategorien der anderen (eigene, separate Design-Grenze des Features). */
      state.dash = [];
      loadPreset('months'); state.type='columns'; state.reference='PY'; renderAll();
      state.dash.push(dashSnapshot());
      loadPreset('months'); state.type='columns'; state.reference='PL'; renderAll();
      state.dash.push(dashSnapshot());
      state.dashCols = 2;

      const specEmbed = dashboardSpec(false);
      ok('Z1 · Dashboard · Spec mit 2 Kacheln (concat, columns=dashCols)',
         !!specEmbed && Array.isArray(specEmbed.concat) && specEmbed.concat.length===2 && specEmbed.columns===2);

      let compEmbed=false; try{ compEmbed=!!VL.compile(clone(specEmbed)).spec; }catch(e){}
      ok('Z1 · Dashboard · eingebetteter Spec kompiliert', compEmbed);

      const tpl = denebDashTemplate();
      ok('Z1 · Dashboard · Deneb-Template vorhanden (usermeta.dataset über beide Kacheln)',
         !!tpl && Array.isArray(tpl.usermeta.dataset) && tpl.usermeta.dataset.length>0);
      const tb = clone(tpl); delete tb.usermeta;
      let compDeneb=false; try{ compDeneb=!!VL.compile(tb).spec; }catch(e){}
      ok('Z1 · Dashboard · Deneb-Template kompiliert (baked=0)', compDeneb && tplBakedRows(tpl)===0);

      /* Echtes Rendering mit injizierten Daten je Kachel-Feldliste (wie im Power-BI-Report) */
      {
        const agg = dashAggFields();
        const nameToIdx = {}; agg.forEach((f,i)=> nameToIdx[f.name]=i);
        const rowsPerTile = state.dash.map(snap=> withState(snap, ()=> {
          const defs = vFieldDefs();
          return activeRows().map(r=>{
            const o={};
            defs.forEach(([key])=>{
              const fname = F(key); const idx = nameToIdx[fname]; if(idx===undefined) return;
              const ph = '__'+idx+'__';
              if(key==='dim') o[ph]=r.c; else if(key==='p') o[ph]=r.v1; else if(key==='r') o[ph]=isNaN(r.v2)?null:r.v2;
              else if(key==='r2') o[ph]=isNaN(r.v3)?null:r.v3; else if(key==='fc') o[ph]=r.fc?1:0;
            });
            return o;
          });
        }));
        const data = rowsPerTile.flat();
        const body = clone(tpl); delete body.usermeta; body.datasets = {dataset:data};
        const host=document.createElement('div'); host.style.width='900px'; host.style.height='500px'; document.body.appendChild(host);
        let renderOk=false, html='';
        try{ await embed(host, body, {actions:false, renderer:'svg'}); html=host.innerHTML; renderOk=true; }catch(e){}
        host.remove();
        ok('Z1 · Dashboard · Deneb-Template rendert mit echten Daten, kein NaN', renderOk && !/NaN/.test(html));
      }
      state.dash = []; state.dashCols = 2;
    }

    /* === Z1b) Export-Modus-Schalter (vlVega/vlCross/vlTooltip) – bisher nur die
       Default-Kombination (vlDeneb=true, vlTooltip=true, vlCross=false, vlVega=false)
       wurde implizit durch die Compile-Checks in Sektion A geprüft ===== */
    if(typeof exportSpecText==='function'){
      loadPreset('months'); state.type='columns'; state.reference='PY'; renderAll();

      /* Cross-Filter: __selected__-Opazitätsbedingung landet im Template */
      const saveTip=state.vlTooltip, saveCross=state.vlCross;
      state.vlTooltip=true; state.vlCross=true; renderAll();
      const tplCross = denebTemplate();
      ok('Z1b · vlCross · Template enthält __selected__-Opazitätsbedingung',
         JSON.stringify(tplCross).includes('__selected__'));
      let compCross=false; try{ const b=clone(tplCross); delete b.usermeta; compCross=!!VL.compile(b).spec; }catch(e){}
      ok('Z1b · vlCross · Template kompiliert weiterhin (baked=0)', compCross && tplBakedRows(tplCross)===0);

      state.vlCross=false; renderAll();
      const tplTip = denebTemplate();
      ok('Z1b · vlTooltip · Mark bekommt tooltip:{content:"data"}, kein __selected__ ohne vlCross',
         JSON.stringify(tplTip).includes('"content":"data"') && !JSON.stringify(tplTip).includes('__selected__'));

      state.vlTooltip=false; renderAll();
      ok('Z1b · ohne Tooltip/Cross · Template ohne tooltip/__selected__',
         !JSON.stringify(denebTemplate()).includes('"content":"data"') && !JSON.stringify(denebTemplate()).includes('__selected__'));
      state.vlTooltip=saveTip; state.vlCross=saveCross;

      /* vlVega: Export als reines Vega v5 (vegaLite.compile), nicht mehr Vega-Lite-JSON */
      const saveVega=state.vlVega; state.vlVega=true; renderAll();
      const spec = vegaSpec(false);
      let vegaText=null, err=null;
      try{ vegaText = await exportSpecText(spec); }catch(e){ err=String(e); }
      let parsedOk=false, isRawVega=false;
      try{
        const parsed = JSON.parse(vegaText);
        parsedOk = !!window.vega.parse(parsed);
        isRawVega = Array.isArray(parsed.marks) && !('encoding' in parsed) && !('mark' in parsed);
      }catch(e){}
      ok('Z1b · vlVega · exportSpecText liefert gültiges, geparstes Vega v5 (kein Vega-Lite mehr)',
         !err && parsedOk && isRawVega, err||'');
      state.vlVega=saveVega;
    }

    /* === Z2) Barrierefreiheit: Tastatur-Bedienbarkeit + Accessible Name ===== */
    {
      const h2 = document.querySelector('aside .panel > h2');
      ok('Z2 · Panel-Header ist per Tastatur fokussierbar (tabindex/role=button)',
         !!h2 && h2.tabIndex===0 && h2.getAttribute('role')==='button');
      if(h2){
        const panel = h2.parentElement;
        const before = panel.classList.contains('collapsed');
        h2.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
        const after = panel.classList.contains('collapsed');
        ok('Z2 · Panel-Header · Enter klappt ein/aus + aria-expanded spiegelt Zustand',
           after!==before && h2.getAttribute('aria-expanded')===(after?'false':'true'));
        h2.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true})); /* zurück */
      }
      const subhead = document.querySelector('.subgrp .subhead');
      if(subhead){
        const sg = subhead.closest('.subgrp[data-sg]');
        const before = sg.classList.contains('collapsed');
        subhead.dispatchEvent(new KeyboardEvent('keydown', {key:' ', bubbles:true}));
        const after = sg.classList.contains('collapsed');
        ok('Z2 · Aufbau-Untergruppe · Space klappt ein/aus (tabindex/role/aria-expanded)',
           subhead.tabIndex===0 && subhead.getAttribute('role')==='button' && after!==before);
        subhead.dispatchEvent(new KeyboardEvent('keydown', {key:' ', bubbles:true})); /* zurück */
      }
      /* SVG hat einen Accessible Name (<title>) statt unbenanntem role="img" */
      state.type='columns'; $('#t1').value='Firma X'; $('#t2').value='Umsatz in mEUR'; renderAll();
      const titleEl = document.querySelector('#chartHost svg title');
      ok('Z2 · Haupt-SVG hat <title> (Accessible Name) mit Chart-Inhalt',
         !!titleEl && /Firma X/.test(titleEl.textContent) && /Umsatz/.test(titleEl.textContent));
      $('#t1').value=''; $('#t2').value='';
      /* In-Chart-Collapse (Hierarchie-Tabelle): Rect ist fokussierbar + Enter klappt ein */
      state.type='table';
      state.rows=[{c:'Umsatz',v1:1000,v2:900,fc:false,lvl:0},{c:'Region A',v1:600,v2:500,fc:false,lvl:1},{c:'Region B',v1:400,v2:400,fc:false,lvl:1}];
      renderAll();
      const collRect = document.querySelector('#chartHost [data-collapse]');
      ok('Z2 · Tabelle · Eltern-Zeile (data-collapse) ist fokussierbar (tabindex/role/aria-label)',
         !!collRect && collRect.tabIndex===0 && collRect.getAttribute('role')==='button' && !!collRect.getAttribute('aria-label'));
      if(collRect){
        const key = collRect.getAttribute('data-collapse');
        const before = state.rowCollapse.has(key);
        collRect.dispatchEvent(new KeyboardEvent('keydown', {key:'Enter', bubbles:true}));
        ok('Z2 · Tabelle · Enter auf Eltern-Zeile klappt Kinder ein/aus', state.rowCollapse.has(key)!==before);
      }
      state.rowCollapse.clear();

      /* Dialoge: aria-labelledby zeigt auf existierende Überschrift */
      const dlgIds = ['dlg','helpDlg','guideDlg','wizDlg','ibcsDlg','notDlg'];
      const dlgOk = dlgIds.every(id=>{ const d=document.getElementById(id); const lbl=d&&d.getAttribute('aria-labelledby');
        return !!lbl && !!document.getElementById(lbl); });
      ok('Z2 · Alle 6 Dialoge haben aria-labelledby auf eine existierende Überschrift', dlgOk);

      /* Wizard → Guide-Dialog verkettet (Übernehmen öffnet direkt die Feinjustierung) */
      {
        const wizDlg=document.getElementById('wizDlg'), guideDlg=document.getElementById('guideDlg');
        if(wizDlg.showModal) wizDlg.showModal(); else wizDlg.setAttribute('open','');
        document.getElementById('wizApply').click();
        ok('Z2 · Wizard „Übernehmen" öffnet direkt den Optionen-Dialog', guideDlg.hasAttribute('open') && !wizDlg.hasAttribute('open'));
        if(guideDlg.close) guideDlg.close(); else guideDlg.removeAttribute('open');
      }

      /* Tree: PY/FC-Spalten in echter Szenario-Notation statt hartem 'PL' */
      state.type='tree';
      state.treeJson = JSON.stringify({periods:['P1','P2'], scenarios:['AC','PY'],
        root:{label:'Test', unit:'', values:[100,90], op:null, children:[]}});
      renderAll();
      {
        const rects = (chartHtml().match(/<rect[^>]*>/g)||[]);
        const pyRect = rects.find(r=>r.includes('fill="'+LIGHT+'"'));
        ok('Z2 · Treiberbaum · PY-Spalte zeigt Szenario-Notation (hell, kein Rahmen) statt PL-Optik',
           !!pyRect && !pyRect.includes('stroke='));
      }

      /* Neue Gantt/Export-EN-Strings übersetzt statt stillem DE-Fallback */
      state.uiLang='en';
      const enChecks = [
        ['Tabelle wird geladen …','Loading table …'],
        ['Gantt wird geladen …','Loading Gantt chart …'],
        ['Gantt-Vorschau nicht möglich','Gantt preview not possible'],
        ['Für diesen Typ ist kein Vega-Lite-Spec verfügbar (nur SVG/PNG).','No Vega-Lite spec is available for this type (SVG/PNG only).'],
      ];
      ok('Z2 · Gantt/Export-Strings jetzt auf Englisch übersetzt (vorher stiller DE-Fallback)',
         enChecks.every(([de,en])=>TT(de)===en));
      state.uiLang='de';
    }

    /* === Z3) HD/Full-HD-Zeichenflächen-Presets + synchronisierte Beschriftungsgröße ===== */
    if(document.getElementById('pvFont')){
      loadPreset('months'); state.type='columns'; state.reference='PY';
      const hdBtn = [...document.querySelectorAll('#sizeCtl [data-pvsz]')].find(b=>b.dataset.pvsz==='1280,720');
      const fhdBtn = [...document.querySelectorAll('#sizeCtl [data-pvsz]')].find(b=>b.dataset.pvsz==='1920,1080');
      ok('Z3 · HD/Full-HD-Presets vorhanden', !!hdBtn && !!fhdBtn);
      if(hdBtn && fhdBtn){
        hdBtn.click();
        ok('Z3 · HD-Preset setzt 1280×720 + Beschriftung 130 % (XL), alle 3 Selects synchron',
           state.vlW===1280 && state.vlH===720 && state.fontScale===1.3 &&
           document.getElementById('pvFont').value==='1.3' && document.getElementById('dlgFont').value==='1.3' && document.getElementById('fontScale').value==='1.3');
        fhdBtn.click();
        ok('Z3 · Full-HD-Preset setzt 1920×1080 + Beschriftung 160 % (XXL+), alle 3 Selects synchron',
           state.vlW===1920 && state.vlH===1080 && state.fontScale===1.6 &&
           document.getElementById('pvFont').value==='1.6' && document.getElementById('dlgFont').value==='1.6' && document.getElementById('fontScale').value==='1.6');
        /* Deneb-Export übernimmt die größere Schrift 1:1 (fontSize * fontScale) */
        const tplFhd = clone(denebTemplate());
        const sizesFhd = [...new Set(JSON.stringify(tplFhd).match(/"fontSize":[\d.]+/g)||[])].map(s=>+s.split(':')[1]);
        state.fontScale = 1; renderAll();
        const tplBase = clone(denebTemplate());
        const sizesBase = [...new Set(JSON.stringify(tplBase).match(/"fontSize":[\d.]+/g)||[])].map(s=>+s.split(':')[1]);
        const ratioOk = sizesBase.length && sizesFhd.length && sizesBase.every(b=> sizesFhd.some(f=> Math.abs(f/b-1.6)<0.01));
        ok('Z3 · Deneb-Export: Schriftgrößen skalieren exakt mit fontScale (1.6× bei Full HD)', ratioOk, JSON.stringify({sizesBase, sizesFhd}));
        /* Die dritte Preset-Zeile im Export-Dialog (#sizeInputs) hat dieselben HD/Full-HD-Buttons */
        const hdDlg = [...document.querySelectorAll('#sizeInputs [data-sz]')].find(b=>b.dataset.sz==='1280,720');
        const fhdDlg = [...document.querySelectorAll('#sizeInputs [data-sz]')].find(b=>b.dataset.sz==='1920,1080');
        ok('Z3 · Export-Dialog hat dieselben HD/Full-HD-Presets (mit passender Schriftgröße)',
           !!hdDlg && hdDlg.dataset.szfont==='1.3' && !!fhdDlg && fhdDlg.dataset.szfont==='1.6');
      }
      state.vlSizeMode='fit'; state.fontScale=1; renderAll();
    }

    /* === Z4) "Scaling: Auto"-Hinweis für JEDES mehrteilige Layout, nicht nur Dashboard === */
    if(typeof denebStepsHtml==='function' && typeof currentSpecIsMultiView==='function'){
      loadPreset('months'); state.type='kpi'; state.kpiStyle='bridge'; state.kpiSingle=false;
      state.reference='PL'; state.reference2='PY'; state.kpiMultiScen=true; renderAll();
      const wasDlgFile = dlgFile; dlgFile = 'business-chart.deneb.json';
      ok('Z4 · KPI-Kachel (Facet) wird als mehrteiliges Layout erkannt', currentSpecIsMultiView());
      ok('Z4 · Export-Dialog nennt „Scaling: Auto“ auch bei Einzelchart-Facet (nicht nur Dashboard)',
         denebStepsHtml().includes('Scaling'));
      const tpl = denebTemplate();
      ok('Z4 · Deneb-Template-Description enthält denselben Scaling-Hinweis (sichtbar beim Import)',
         tpl && /Scaling: Auto/.test(tpl.usermeta.information.description));

      state.type='columns'; state.reference='PY'; renderAll();
      ok('Z4 · Normales Säulendiagramm (single view) bekommt KEINEN Scaling-Hinweis', !currentSpecIsMultiView() && !denebStepsHtml().includes('Scaling'));
      dlgFile = wasDlgFile;
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
