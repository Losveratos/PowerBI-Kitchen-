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
    'barskombi','table','wfkombi','stackbar','multiples','sparktable','heatmap','marimekko','boxplot',
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
    stack100:state.stack100, bridgePY:state.bridgePY, bridgeRel:state.bridgeRel,
    t1:$t('t1'), t2:$t('t2'), t3:$t('t3'),
  };
  const restore = ()=>{
    Object.assign(state, {type:snap.type, kpiStyle:snap.kpiStyle, primary:snap.primary,
      reference:snap.reference, reference2:snap.reference2,
      rows:clone(snap.rows), srows:clone(snap.srows), series:clone(snap.series),
      wrows:clone(snap.wrows), unit:snap.unit, unitScale:snap.unitScale,
      decimals:snap.decimals, msg:snap.msg, stack100:snap.stack100,
      bridgePY:snap.bridgePY, bridgeRel:snap.bridgeRel});
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
      ok('G · Gantt · Deneb-Template = Vorlage unverändert',
         !!gtpl && JSON.stringify(gtpl)===JSON.stringify(_ganttSpecRaw) && /''input''/.test(JSON.stringify(gtpl||{})));
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

      /* M5 kpiTrend: eigenes dynamisches Template (Sparkline), nicht Status */
      state.type='kpi'; state.kpiStyle='trend'; state.reference='—';
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
      state.kpiStyle='ibcs'; state.varSel={a1:true,r1:true,a2:true,r2:true};
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
