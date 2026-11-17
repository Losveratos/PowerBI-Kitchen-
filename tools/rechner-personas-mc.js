#!/usr/bin/env node
/* Monte Carlo je Persona-Firma über den unveränderten Rechenkern von visual-standards-rechner.html.
   Aufruf: NODE_PATH=$(npm root -g) node tools/rechner-personas-mc.js <personas.json> <out.json> [N je Persona]
   Je Ziehung variieren:
     - Mengengerüst der Persona (Ersteller, Viewer [log], Reports, Chart-Typen, Modelle) per PERT aus ihren Dreipunkten
     - Viewer-Wachstum (Dreipunkt der Persona, vom Rechenkern selbst gezogen)
     - unsichere Rahmenbedingungen und Musts (Bernoulli mit der Wahrscheinlichkeit der Persona)
     - alle Kostenannahmen des Rechners (gepaarte PERT-Ziehung, setScenario je Ziehung, für alle vier Wege gleich)
   Zusätzlich je Persona die "Rechner-Empfehlung": wahrscheinlichste Mengen, Schalter mit p >= 0,5, Erwartungswerte.
   Gerankt wird nach Kosten über den Horizont unter den zulässigen Wegen (ohne K.O.). */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'..','visual-standards-rechner.html');
const PER=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const OUT=process.argv[3]||'personas-mc.json';const N=+(process.argv[4]||2000);
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(300);
  const res=[];const t0=Date.now();
  for(let k=0;k<PER.length;k++){
    const r=await p.evaluate(({P,N,k})=>{
      function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
      let R=mb(0xBEEF00+k*104729);
      const gam=a=>{if(a<1)return gam(a+1)*Math.pow(R(),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{const u1=R(),u2=R();x=Math.sqrt(-2*Math.log(u1||1e-12))*Math.cos(2*Math.PI*u2);v=1+c*x;}while(v<=0);v=v*v*v;const u=R();if(u<1-.0331*x*x*x*x)return d*v;if(Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v;}};
      const tri=t=>Array.isArray(t)?t.map(Number).sort((a,b)=>a-b):[+t,+t,+t];
      const pt=t=>{t=tri(t);const lo=t[0],hi=t[2],m=Math.min(hi,Math.max(lo,t[1]));if(!(hi>lo))return lo;const a=1+4*(m-lo)/(hi-lo),bb=1+4*(hi-m)/(hi-lo);const x=gam(a),y=gam(bb);return lo+x/(x+y)*(hi-lo);};
      const ptLog=t=>{t=tri(t);return Math.exp(pt(t.map(v=>Math.log(Math.max(1,v)))));};
      const OK4=OPTS.map(o=>o.key);const REQID=new Set(REQS.map(r=>r.id));const FLID=new Set(FLAGS.map(f=>f.id));
      const flags=Object.entries(P.flags||{}).filter(([f,v])=>FLID.has(f)&&+v>0);const must=Object.entries(P.must||{}).filter(([m,v])=>REQID.has(m)&&+v>0);
      function base(){defaults();
        S.ssShare=Math.round(Math.min(100,Math.max(0,+P.ssShare||0)));S.horizon=[3,5,10].includes(+P.horizon)?+P.horizon:5;
        S.p.paid.lic=(LIC[P.licAnchor]||LIC.enterprise).slice();S.licModel=P.siteLicense?'site':'staffel';
        S.rc.sh=(WIZ_RC[P.reportClasses]||WIZ_RC.mix).slice();S.ibcsAll=!!P.ibcsAll;syncDerived();
        S.baseline=['paid','oss','deneb','core'].includes(P.baseline)?P.baseline:'none';S.existing=S.baseline==='none'?0:Math.max(0,Math.round(+P.existing||0));
        S.dist=DIST[P.dist]?P.dist:'none';S.lib=!!P.library;S.p.oss.devH=(DEV_PRESETS[P.ossBuild]||DEV_PRESETS.ready).slice();
        if(P.growth)S.g.growth=tri(P.growth);}
      function apply(on){/* on: {flags:Set, must:Set} */
        FLAGS.forEach(f=>S.flags[f.id]=false);REQS.forEach(r=>S.prio[r.id]=r.def);
        on.flags.forEach(f=>{if(f==='orgstore'&&!on.flags.has('certonly'))return;S.flags[f]=true;});
        if(S.flags.orgstore)S.dist='org';if(S.flags.rs)S.prio.rs='M';on.must.forEach(m=>S.prio[m]='M');}
      const winOf=(tot,ko)=>{let w=-1;for(let j=0;j<4;j++)if(!ko[j]&&(w<0||tot[j]<tot[w]))w=j;return w;};
      /* --- Rechner-Empfehlung (Modus) --- */
      base();S.creators=Math.max(1,Math.round(tri(P.creators)[1]));S.viewers=Math.max(1,Math.round(tri(P.viewers)[1]));S.reports=Math.max(1,Math.round(tri(P.reports)[1]));S.types=Math.max(2,Math.round(tri(P.types)[1]));S.models=Math.max(1,Math.round(tri(P.models||[1,1,1])[1]));
      apply({flags:new Set(flags.filter(([,v])=>+v>=.5).map(x=>x[0])),must:new Set(must.filter(([,v])=>+v>=.5).map(x=>x[0]))});
      const ev0=evaluate();const ko0=OK4.map(o=>ev0[o].ko.length?1:0);const ex0=OK4.map(o=>calc(o,pertMean).total);const div0=Math.max(1,viewersAvg(pertMean(S.g.growth))*S.horizon);
      const rec={win:winOf(ex0,ko0),ko:ko0,perV:ex0.map(v=>v/div0),score:OK4.map(o=>ev0[o].scorePct)};
      /* --- Monte Carlo --- */
      const W=[0,0,0,0,0],KO=[0,0,0,0],T=[[],[],[],[]],PV=[[],[],[],[]],X={creators:[],viewers:[],reports:[],types:[],models:[]},B={},WIN=[],GAP=[];
      flags.forEach(([f,v])=>{if(+v<1)B['flag:'+f]=[];});must.forEach(([m,v])=>{if(+v<1)B['must:'+m]=[];});
      const free=[0,0,0,0];
      for(let i=0;i<N;i++){base();
        S.creators=Math.max(1,Math.round(ptLog(P.creators)));S.viewers=Math.max(1,Math.round(ptLog(P.viewers)));S.reports=Math.max(1,Math.round(pt(P.reports)));S.types=Math.max(2,Math.round(pt(P.types)));S.models=Math.max(1,Math.round(pt(P.models||[1,1,1])));
        const on={flags:new Set(),must:new Set()};
        flags.forEach(([f,v])=>{const x=R()<+v;if(x)on.flags.add(f);if(B['flag:'+f])B['flag:'+f].push(x?1:0);});
        must.forEach(([m,v])=>{const x=R()<+v;if(x)on.must.add(m);if(B['must:'+m])B['must:'+m].push(x?1:0);});
        apply(on);const ev=evaluate();const ko=OK4.map(o=>ev[o].ko.length?1:0);
        const s0=(0xA11CE+k*7919+i*104729)>>>0;const tot=OK4.map(o=>{setScenario(s0);return calc(o,pert).total;});
        const div=Math.max(1,viewersAvg(pertMean(S.g.growth))*S.horizon);
        const w=winOf(tot,ko);W[w<0?4:w]++;WIN.push(w);free[tot.indexOf(Math.min(...tot))]++;
        const al=[0,1,2,3].filter(j=>!ko[j]).map(j=>tot[j]).sort((a,b)=>a-b);GAP.push(al.length>1?al[1]/al[0]-1:null);
        for(let j=0;j<4;j++){KO[j]+=ko[j];T[j].push(tot[j]);PV[j].push(tot[j]/div);}
        X.creators.push(S.creators);X.viewers.push(S.viewers);X.reports.push(S.reports);X.types.push(S.types);X.models.push(S.models);}
      const qs=(a,pp)=>{const s=a.slice().sort((x,y)=>x-y);const ii=(s.length-1)*pp,lo=Math.floor(ii),hi=Math.ceil(ii);return s[lo]+(s[hi]-s[lo])*(ii-lo);};
      /* Treiber: wie stark verschiebt ein Input die Gewinner-Verteilung? Totalvariationsabstand an/aus bzw. unteres/oberes Drittel */
      const dist=idx=>{const c=[0,0,0,0,0];idx.forEach(i=>c[WIN[i]<0?4:WIN[i]]++);return c.map(v=>v/Math.max(1,idx.length));};
      const tv=(a,b)=>.5*a.reduce((s,v,j)=>s+Math.abs(v-b[j]),0);
      const drivers=[];
      for(const key in B){const on=[],off=[];B[key].forEach((v,i)=>(v?on:off).push(i));if(on.length<N*.03||off.length<N*.03)continue;const da=dist(on),db=dist(off);drivers.push({id:key,tv:tv(da,db),on:da,off:db});}
      for(const key in X){const xs=X[key];if(new Set(xs).size<3)continue;const lo=qs(xs,1/3),hi=qs(xs,2/3);const a=[],c=[];xs.forEach((v,i)=>{if(v<=lo)a.push(i);else if(v>=hi)c.push(i);});if(a.length<N*.1||c.length<N*.1)continue;const da=dist(a),db=dist(c);drivers.push({id:'qty:'+key,tv:tv(da,db),lo:da,hi:db,loV:lo,hiV:hi});}
      drivers.sort((a,b)=>b.tv-a.tv);
      const gaps=GAP.filter(g=>g!==null);
      return {id:P.id,rec,win:W.map(v=>v/N),winFree:free.map(v=>v/N),ko:KO.map(v=>v/N),
        cost:T.map(a=>({p10:qs(a,.1),p50:qs(a,.5),p90:qs(a,.9)})),perV:PV.map(a=>({p10:qs(a,.1),p50:qs(a,.5),p90:qs(a,.9)})),
        gap50:gaps.length?qs(gaps,.5):null,close10:gaps.length?gaps.filter(g=>g<.1).length/gaps.length:null,
        drivers:drivers.slice(0,5).map(d=>({...d,tv:Math.round(d.tv*1000)/1000}))};
    },{P:PER[k],N,k});
    res.push(r);process.stdout.write(`\r${k+1}/${PER.length} (${((Date.now()-t0)/1000).toFixed(0)} s)`);
  }
  console.log('');if(errs.length)console.log('PAGE ERRORS',errs.slice(0,5));
  fs.writeFileSync(OUT,JSON.stringify({N,opts:['paid','oss','deneb','core'],results:res}));console.log('geschrieben:',OUT);await b.close();
})();
