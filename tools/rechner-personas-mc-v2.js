#!/usr/bin/env node
/* Monte Carlo je Persona-Firma, v2: KI-gestützte Pflege als gepaartes Szenario, Viewer-Deckel, Kosten je Viewer.
   Aufruf: NODE_PATH=$(npm root -g) node tools/rechner-personas-mc-v2.js <personas.json> <ki.json> <out.json> [N]
   ki.json: { factors:{paid|oss|deneb|core:{param:[lo,mode,hi]}}, aiCostPerCreatorYear:[..], aiCostShareVisual:[..],
              adoption:{<ebene>:[..]} }
   Je Ziehung werden Mengen, Wachstum, unsichere Schalter/Musts und alle Kostenannahmen einmal gezogen und dann in drei
   Modi gerechnet (gleicher Zufallsstrom, also gepaart):
     base   – ohne KI
     konzern – KI-Pflege nur in Firmen der Ebene "konzern"
     alle    – KI-Pflege in jeder Firma, mit dem Adoptionsgrad ihrer Ebene
   KI wirkt als Multiplikator auf die Stundenannahmen des Wegs: f_eff = 1 − a·(1 − f), a = gezogener Adoptionsgrad.
   Dazu kommen die KI-Werkzeugkosten (Ersteller × €/Jahr × Anteil Visual-Arbeit × a × Horizont) als harte Kosten,
   für alle vier Wege gleich. Realismus: Viewer wachsen höchstens bis max(Mitarbeitende, oberer Viewer-Wert). */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'..','visual-standards-rechner.html');
const PER=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const KI=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const OUT=process.argv[4]||'personas-mc-v2.json';const N=+(process.argv[5]||5000);
const ONLY=process.argv[6]||''; /* optional: nur ein Szenario rechnen (base|konzern|alle), z. B. für Kontrafaktum-Läufe */
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(300);
  const res=[];const t0=Date.now();
  for(let k=0;k<PER.length;k++){
    const r=await p.evaluate(({P,KI,N,k,ONLY})=>{
      function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
      let R=mb(0xBEEF00+k*104729);
      const gam=a=>{if(a<1)return gam(a+1)*Math.pow(R(),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{const u1=R(),u2=R();x=Math.sqrt(-2*Math.log(u1||1e-12))*Math.cos(2*Math.PI*u2);v=1+c*x;}while(v<=0);v=v*v*v;const u=R();if(u<1-.0331*x*x*x*x)return d*v;if(Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v;}};
      const tri=t=>Array.isArray(t)?t.map(Number).sort((a,b)=>a-b):[+t,+t,+t];
      const pt=t=>{t=tri(t);const lo=t[0],hi=t[2],m=Math.min(hi,Math.max(lo,t[1]));if(!(hi>lo))return lo;const a=1+4*(m-lo)/(hi-lo),bb=1+4*(hi-m)/(hi-lo);const x=gam(a),y=gam(bb);return lo+x/(x+y)*(hi-lo);};
      const ptLog=t=>{t=tri(t);return Math.exp(pt(t.map(v=>Math.log(Math.max(1,v)))));};
      const OK4=OPTS.map(o=>o.key);const REQID=new Set(REQS.map(r=>r.id));const FLID=new Set(FLAGS.map(f=>f.id));
      const flags=Object.entries(P.flags||{}).filter(([f,v])=>FLID.has(f)&&+v>0);const must=Object.entries(P.must||{}).filter(([m,v])=>REQID.has(m)&&+v>0);
      const cap=Math.max(+P.employees||0,tri(P.viewers)[2]);
      function base(){defaults();
        S.ssShare=Math.round(Math.min(100,Math.max(0,+P.ssShare||0)));S.horizon=[3,5,10].includes(+P.horizon)?+P.horizon:5;
        S.p.paid.lic=(LIC[P.licAnchor]||LIC.enterprise).slice();S.licModel=P.siteLicense?'site':'staffel';
        S.rc.sh=(WIZ_RC[P.reportClasses]||WIZ_RC.mix).slice();S.ibcsAll=!!P.ibcsAll;syncDerived();
        S.baseline=['paid','oss','deneb','core'].includes(P.baseline)?P.baseline:'none';S.existing=S.baseline==='none'?0:Math.max(0,Math.round(+P.existing||0));
        S.dist=DIST[P.dist]?P.dist:'none';S.lib=!!P.library;S.p.oss.devH=(DEV_PRESETS[P.ossBuild]||DEV_PRESETS.ready).slice();
        if(P.growth)S.g.growth=tri(P.growth);S.viewerCap=cap;}
      function apply(on){FLAGS.forEach(f=>S.flags[f.id]=false);REQS.forEach(r=>S.prio[r.id]=r.def);
        on.flags.forEach(f=>{if(f==='orgstore'&&!on.flags.has('certonly'))return;S.flags[f]=true;});
        if(S.flags.orgstore)S.dist='org';if(S.flags.rs)S.prio.rs='M';on.must.forEach(m=>S.prio[m]='M');}
      /* KI anwenden: Stundenannahmen je Weg skalieren (Dreipunkt × Dreipunkt, komonoton) */
      const keep={};OK4.forEach(o=>keep[o]=JSON.parse(JSON.stringify(S.p[o])));
      function setAI(a){OK4.forEach(o=>{const F=(KI.factors||{})[o]||{};for(const prm in F){const v=S.p[o][prm];if(!Array.isArray(v))continue;
        if(prm==='devH'&&P.ossBuild!=='classic')continue; /* KI-gestützte Eigenentwicklung (200 h) enthält den Effekt schon */const f=tri(F[prm]);S.p[o][prm]=v.map((x,i)=>x*(1-a*(1-f[i]))).sort((x,y)=>x-y);}});}
      function resetP(snap){OK4.forEach(o=>S.p[o]=JSON.parse(JSON.stringify(snap[o])));}
      const winOf=(tot,ko)=>{let w=-1;for(let j=0;j<4;j++)if(!ko[j]&&(w<0||tot[j]<tot[w]))w=j;return w;};
      const lvl=P.segment;const adoptT=(KI.adoption||{})[lvl]||[0,0,0];
      const MODES=ONLY?[ONLY]:['base','konzern','alle'];
      const acc={};MODES.forEach(m=>acc[m]={W:[0,0,0,0,0],PV:[[],[],[],[]],AI:[],best:[]});
      const KO=[0,0,0,0];const users=[];const WINB=[];const B={};const X={viewers:[],creators:[]};
      flags.forEach(([f,v])=>{if(+v<1)B['flag:'+f]=[];});must.forEach(([m,v])=>{if(+v<1)B['must:'+m]=[];});
      for(let i=0;i<N;i++){base();
        S.creators=Math.max(1,Math.round(ptLog(P.creators)));S.viewers=Math.max(1,Math.min(cap,Math.round(ptLog(P.viewers))));S.reports=Math.max(1,Math.round(pt(P.reports)));S.types=Math.max(2,Math.round(pt(P.types)));S.models=Math.max(1,Math.round(pt(P.models||[1,1,1])));
        const on={flags:new Set(),must:new Set()};
        flags.forEach(([f,v])=>{const x=R()<+v;if(x)on.flags.add(f);if(B['flag:'+f])B['flag:'+f].push(x?1:0);});
        must.forEach(([m,v])=>{const x=R()<+v;if(x)on.must.add(m);if(B['must:'+m])B['must:'+m].push(x?1:0);});
        apply(on);const ev=evaluate();const ko=OK4.map(o=>ev[o].ko.length?1:0);ko.forEach((v,j)=>KO[j]+=v);
        const a=pt(adoptT),aiPer=pt(KI.aiCostPerCreatorYear||[0,0,0])*pt(KI.aiCostShareVisual||[0,0,0]);
        const s0=(0xA11CE+k*7919+i*104729)>>>0;const snap={};OK4.forEach(o=>snap[o]=JSON.parse(JSON.stringify(S.p[o])));
        const div=Math.max(1,viewersAvg(pertMean(S.g.growth))*S.horizon);users.push(S.creators+viewersAvg(pertMean(S.g.growth)));
        X.viewers.push(S.viewers);X.creators.push(S.creators);
        MODES.forEach(m=>{const aiOn=m==='alle'||(m==='konzern'&&lvl==='konzern');resetP(snap);let aiCost=0;
          if(aiOn&&a>0){setAI(a);aiCost=S.creators*aiPer*a*S.horizon;}
          const tot=OK4.map(o=>{setScenario(s0);return calc(o,pert).total+aiCost;});
          const w=winOf(tot,ko);const A=acc[m];A.W[w<0?4:w]++;A.AI.push(aiCost/div);for(let j=0;j<4;j++)A.PV[j].push(tot[j]/div);
          A.best.push(w<0?null:tot[w]/div);if(m===MODES[0])WINB.push(w);});}
      const qs=(arr,pp)=>{const s=arr.filter(v=>v!=null).sort((x,y)=>x-y);if(!s.length)return null;const ii=(s.length-1)*pp,lo=Math.floor(ii),hi=Math.ceil(ii);return s[lo]+(s[hi]-s[lo])*(ii-lo);};
      const dist=idx=>{const c=[0,0,0,0,0];idx.forEach(i=>c[WINB[i]<0?4:WINB[i]]++);return c.map(v=>v/Math.max(1,idx.length));};
      const tv=(x,y)=>.5*x.reduce((s,v,j)=>s+Math.abs(v-y[j]),0);const drivers=[];
      for(const key in B){const o1=[],o0=[];B[key].forEach((v,i)=>(v?o1:o0).push(i));if(o1.length<N*.03||o0.length<N*.03)continue;const da=dist(o1),db=dist(o0);drivers.push({id:key,tv:tv(da,db),on:da,off:db});}
      for(const key in X){const xs=X[key];if(new Set(xs).size<3)continue;const lo=qs(xs,1/3),hi=qs(xs,2/3);const a1=[],c1=[];xs.forEach((v,i)=>{if(v<=lo)a1.push(i);else if(v>=hi)c1.push(i);});if(a1.length<N*.1||c1.length<N*.1)continue;const da=dist(a1),db=dist(c1);drivers.push({id:'qty:'+key,tv:tv(da,db),lo:da,hi:db,loV:lo,hiV:hi});}
      drivers.sort((x,y)=>y.tv-x.tv);
      const out={id:P.id,users:qs(users,.5),ko:KO.map(v=>v/N),drivers:drivers.slice(0,3).map(d=>({...d,tv:Math.round(d.tv*1000)/1000})),modes:{}};
      MODES.forEach(m=>{const A=acc[m];out.modes[m]={win:A.W.map(v=>v/N),perV:A.PV.map(a1=>[qs(a1,.1),qs(a1,.5),qs(a1,.9)]),
        best:[qs(A.best,.1),qs(A.best,.5),qs(A.best,.9)],ai:qs(A.AI,.5)};});
      /* gepaarte Ersparnis je Weg durch KI (Modus 'alle' gegen 'base'), Median je Viewer und Jahr */
      out.aiDelta=acc.alle&&acc.base?[0,1,2,3].map(j=>qs(acc.alle.PV[j].map((v,i)=>v-acc.base.PV[j][i]),.5)):null;
      return out;
    },{P:PER[k],KI,N,k,ONLY});
    res.push(r);process.stdout.write(`\r${k+1}/${PER.length} (${((Date.now()-t0)/1000).toFixed(0)} s)`);
  }
  console.log('');if(errs.length)console.log('PAGE ERRORS',errs.slice(0,5));
  fs.writeFileSync(OUT,JSON.stringify({N,opts:['paid','oss','deneb','core'],ki:KI,results:res}));console.log('geschrieben:',OUT);await b.close();
})();
