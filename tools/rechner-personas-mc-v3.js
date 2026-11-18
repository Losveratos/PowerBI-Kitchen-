#!/usr/bin/env node
/* Monte Carlo je Persona-Firma, v3 (nach dem Experten-Review vom 18.11.2026).
   Aufruf: NODE_PATH=$(npm root -g) node tools/rechner-personas-mc-v3.js <personas.json> <ki.json> <out.json> [N] [nur-Modus]
   Umgebung: SEED_OFFSET=<int> verschiebt alle Zufallsströme (Placebo-Läufe), NEGOTIATE=0 schaltet die Must-Verhandlung ab.

   Gegenüber v2:
   1. Fester Zufallsstrom: für JEDEN Schalter (FLAGS) und JEDES Must (REQS) wird je Ziehung genau einmal gezogen, in fester
      Reihenfolge, auch wenn die Persona ihn nicht kennt (p = 0). So hängt der Strom nicht davon ab, welche Schlüssel eine
      Persona trägt, und Kontrafaktum-Paare (A/B) sehen wirklich dieselbe Zukunft (Befund Review 3).
   2. IBCS-Zertifikat einmal: Schalter „IBCS-Zertifikat Pflicht“ und Must „IBCS-zertifiziertes Visual“ sind dieselbe Sache;
      gezogen wird einmal mit p = max(p_Schalter, p_Must), gesetzt werden beide (Befund Review 2).
   3. Musts verhandelbar: bleibt in einer Ziehung kein Weg zulässig, werden zuerst die unsicheren Musts (p < 1) fallen gelassen,
      dann alle Musts; harte Schalter bleiben. Gezählt wird, wie oft verhandelt werden musste und wie oft auch danach nichts
      bleibt (Befund Review 1). Mit NEGOTIATE=0 wie v2.
   4. Neue Ausgaben je Modus: Null-Option (kein Standard) je Viewer und Jahr und Anteil der Zukünfte, in denen der günstigste
      Weg billiger ist als die Null-Option; Cash-Anteil (harte Auszahlungen) je Weg; Regret der Mehrheitswahl (Review 2, 3).
   5. Szenario-Felder je Persona: pOver (Dreipunkt je Weg/Parameter), pMul (Faktor auf einen Parameter aller vier Wege),
      capOver (Erfüllungsgrade), forceFlags.
   Unverändert: KI-Pflege als gepaartes Szenario (base / konzern / alle), Viewer-Deckel, Gewinner = günstigster zulässiger Weg. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'..','visual-standards-rechner.html');
const PER=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const KI=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const OUT=process.argv[4]||'personas-mc-v3.json';const N=+(process.argv[5]||5000);const ONLY=process.argv[6]||'';
const SEED=+(process.env.SEED_OFFSET||0);const NEG=process.env.NEGOTIATE!=='0';
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(300);
  const res=[];const t0=Date.now();
  for(let k=0;k<PER.length;k++){
    const r=await p.evaluate(({P,KI,N,k,ONLY,SEED,NEG})=>{
      function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
      let R=mb(0xBEEF00+k*104729+SEED*7919);
      const gam=a=>{if(a<1)return gam(a+1)*Math.pow(R(),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{const u1=R(),u2=R();x=Math.sqrt(-2*Math.log(u1||1e-12))*Math.cos(2*Math.PI*u2);v=1+c*x;}while(v<=0);v=v*v*v;const u=R();if(u<1-.0331*x*x*x*x)return d*v;if(Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v;}};
      const tri=t=>Array.isArray(t)?t.map(Number).sort((a,b)=>a-b):[+t,+t,+t];
      const pt=t=>{t=tri(t);const lo=t[0],hi=t[2],m=Math.min(hi,Math.max(lo,t[1]));if(!(hi>lo))return lo;const a=1+4*(m-lo)/(hi-lo),bb=1+4*(hi-m)/(hi-lo);const x=gam(a),y=gam(bb);return lo+x/(x+y)*(hi-lo);};
      const ptLog=t=>{t=tri(t);return Math.exp(pt(t.map(v=>Math.log(Math.max(1,v)))));};
      const OK4=OPTS.map(o=>o.key);
      const FLALL=FLAGS.map(f=>f.id),REQALL=REQS.map(r=>r.id);
      const pf=f=>Math.max(0,Math.min(1,+((P.flags||{})[f])||0)),pm=m=>Math.max(0,Math.min(1,+((P.must||{})[m])||0));
      const pIBCS=Math.max(pf('ibcsmust'),pm('ibcscert'));
      const cap=Math.max(+P.employees||0,tri(P.viewers)[2]);
      function base(){defaults();
        S.ssShare=Math.round(Math.min(100,Math.max(0,+P.ssShare||0)));S.horizon=[3,5,10].includes(+P.horizon)?+P.horizon:5;
        S.p.paid.lic=(LIC[P.licAnchor]||LIC.enterprise).slice();S.licModel=P.siteLicense?'site':'staffel';
        S.rc.sh=(WIZ_RC[P.reportClasses]||WIZ_RC.mix).slice();S.ibcsAll=!!P.ibcsAll;syncDerived();
        S.baseline=['paid','oss','deneb','core'].includes(P.baseline)?P.baseline:'none';S.existing=S.baseline==='none'?0:Math.max(0,Math.round(+P.existing||0));
        S.dist=DIST[P.dist]?P.dist:'none';S.lib=!!P.library;S.p.oss.devH=(DEV_PRESETS[P.ossBuild]||DEV_PRESETS.ready).slice();
        if(P.growth)S.g.growth=tri(P.growth);S.viewerCap=cap;
        if(P.pOver)for(const o in P.pOver)for(const prm in P.pOver[o])S.p[o][prm]=tri(P.pOver[o][prm]);
        if(P.pMul)for(const prm in P.pMul)OK4.forEach(o=>{const v=S.p[o][prm];if(Array.isArray(v))S.p[o][prm]=v.map(x=>x*P.pMul[prm]);});
        if(P.capOver)for(const id in P.capOver){if(S.cap[id])P.capOver[id].forEach((v,j)=>{if(v!=null)S.cap[id][j]=v;});}}
      function apply(fl,mu){FLAGS.forEach(f=>S.flags[f.id]=false);REQS.forEach(r=>S.prio[r.id]=r.def);
        fl.forEach(f=>{if(f==='orgstore'&&!fl.has('certonly'))return;S.flags[f]=true;});
        if(S.flags.orgstore)S.dist='org';if(S.flags.rs)S.prio.rs='M';mu.forEach(m=>S.prio[m]='M');(P.forceFlags||[]).forEach(f=>S.flags[f]=true);}
      const koNow=()=>{const ev=evaluate();return OK4.map(o=>ev[o].ko.length?1:0);};
      function setAI(a){OK4.forEach(o=>{const F=(KI.factors||{})[o]||{};for(const prm in F){const v=S.p[o][prm];if(!Array.isArray(v))continue;
        if(prm==='devH'&&P.ossBuild!=='classic')continue;const f=tri(F[prm]);S.p[o][prm]=v.map((x,i)=>x*(1-a*(1-f[i]))).sort((x,y)=>x-y);}});}
      function resetP(snap){OK4.forEach(o=>S.p[o]=JSON.parse(JSON.stringify(snap[o])));}
      const winOf=(tot,ko)=>{let w=-1;for(let j=0;j<4;j++)if(!ko[j]&&(w<0||tot[j]<tot[w]))w=j;return w;};
      const lvl=P.segment;const adoptT=(KI.adoption||{})[lvl]||[0,0,0];
      const MODES=ONLY?[ONLY]:['base','konzern','alle'];
      const acc={};MODES.forEach(m=>acc[m]={W:[0,0,0,0,0],PV:[[],[],[],[]],HV:[[],[],[],[]],AI:[],best:[],bestHard:[],GAP:[[],[],[],[]],TOT:[],WIN:[],SQ:[],beatSQ:0,beatSQnr:0,nSQ:0});
      const KO=[0,0,0,0];const users=[];const WINB=[];const B={};const X={viewers:[],creators:[]};let nNeg=0,nNone=0,nStrict=0;
      FLALL.forEach(f=>{const q=f==='ibcsmust'?pIBCS:pf(f);if(q>0&&q<1)B['flag:'+f]=[];});REQALL.forEach(m=>{if(m==='ibcscert')return;const q=pm(m);if(q>0&&q<1)B['must:'+m]=[];});
      for(let i=0;i<N;i++){base();
        S.creators=Math.max(1,Math.round(ptLog(P.creators)));S.viewers=Math.max(1,Math.min(cap,Math.round(ptLog(P.viewers))));S.reports=Math.max(1,Math.round(pt(P.reports)));S.types=Math.max(2,Math.round(pt(P.types)));S.models=Math.max(1,Math.round(pt(P.models||[1,1,1])));
        /* fester Strom: je Schalter und je Must genau ein R(), unabhängig davon, ob die Persona ihn kennt */
        const fl=new Set(),mu=new Set(),muHard=new Set();
        FLALL.forEach(f=>{const u=R();const q=f==='ibcsmust'?pIBCS:pf(f);const x=u<q;if(x)fl.add(f);if(B['flag:'+f])B['flag:'+f].push(x?1:0);});
        REQALL.forEach(m=>{const u=R();if(m==='ibcscert'){if(fl.has('ibcsmust')){mu.add(m);if(pIBCS>=1)muHard.add(m);}return;}
          const q=pm(m);const x=u<q;if(x){mu.add(m);if(q>=1)muHard.add(m);}if(B['must:'+m])B['must:'+m].push(x?1:0);});
        apply(fl,mu);let ko=koNow();
        if(ko.every(v=>v)){nStrict++;if(NEG){apply(fl,muHard);ko=koNow();if(ko.every(v=>v)){apply(fl,new Set());ko=koNow();}nNeg++;}}
        if(ko.every(v=>v))nNone++;
        ko.forEach((v,j)=>KO[j]+=v);
        const a=pt(adoptT),aiPer=pt(KI.aiCostPerCreatorYear||[0,0,0])*pt(KI.aiCostShareVisual||[0,0,0]);
        const s0=(0xA11CE+k*7919+i*104729+SEED*104723)>>>0;const snap={};OK4.forEach(o=>snap[o]=JSON.parse(JSON.stringify(S.p[o])));
        const div=Math.max(1,viewersAvg(pertMean(S.g.growth))*S.horizon);users.push(S.creators+viewersAvg(pertMean(S.g.growth)));
        X.viewers.push(S.viewers);X.creators.push(S.creators);
        setScenario(s0);const sq=calcSQ(pert);
        MODES.forEach(m=>{const aiOn=m==='alle'||(m==='konzern'&&lvl==='konzern');resetP(snap);let aiCost=0;
          if(aiOn&&a>0){setAI(a);aiCost=S.creators*aiPer*a*S.horizon;}
          const cs=OK4.map(o=>{setScenario(s0);return calc(o,pert);});const tot=cs.map(c=>c.total+aiCost);const hard=cs.map(c=>c.hard+aiCost);
          const w=winOf(tot,ko);const A=acc[m];A.W[w<0?4:w]++;A.AI.push(aiCost/div);for(let j=0;j<4;j++){A.PV[j].push(tot[j]/div);A.HV[j].push(hard[j]/div);}
          A.best.push(w<0?null:tot[w]/div);A.bestHard.push(w<0?null:hard[w]/tot[w]);A.TOT.push(tot);A.WIN.push(ko.map(v=>!v));
          A.SQ.push(sq.total/div);if(w>=0){A.nSQ++;if(tot[w]<sq.total)A.beatSQ++;if(tot[w]<sq.noRead)A.beatSQnr++;}
          if(w>=0){const sec=[0,1,2,3].filter(j=>j!==w&&!ko[j]).map(j=>tot[j]);if(sec.length)A.GAP[w].push((Math.min(...sec)-tot[w])/S.horizon);}if(m===MODES[0])WINB.push(w);});}
      const qs=(arr,pp)=>{const s=arr.filter(v=>v!=null&&isFinite(v)).sort((x,y)=>x-y);if(!s.length)return null;const ii=(s.length-1)*pp,lo=Math.floor(ii),hi=Math.ceil(ii);return s[lo]+(s[hi]-s[lo])*(ii-lo);};
      const dist=idx=>{const c=[0,0,0,0,0];idx.forEach(i=>c[WINB[i]<0?4:WINB[i]]++);return c.map(v=>v/Math.max(1,idx.length));};
      const tv=(x,y)=>.5*x.reduce((s,v,j)=>s+Math.abs(v-y[j]),0);const drivers=[];
      for(const key in B){const o1=[],o0=[];B[key].forEach((v,i)=>(v?o1:o0).push(i));if(o1.length<N*.03||o0.length<N*.03)continue;const da=dist(o1),db=dist(o0);drivers.push({id:key,tv:tv(da,db),on:da,off:db});}
      for(const key in X){const xs=X[key];if(new Set(xs).size<3)continue;const lo=qs(xs,1/3),hi=qs(xs,2/3);const a1=[],c1=[];xs.forEach((v,i)=>{if(v<=lo)a1.push(i);else if(v>=hi)c1.push(i);});if(a1.length<N*.1||c1.length<N*.1)continue;const da=dist(a1),db=dist(c1);drivers.push({id:'qty:'+key,tv:tv(da,db),lo:da,hi:db,loV:lo,hiV:hi});}
      drivers.sort((x,y)=>y.tv-x.tv);
      const out={id:P.id,users:qs(users,.5),ko:KO.map(v=>v/N),strictNone:nStrict/N,negotiated:nNeg/N,none:nNone/N,drivers:drivers.slice(0,3).map(d=>({...d,tv:Math.round(d.tv*1000)/1000})),modes:{}};
      MODES.forEach(m=>{const A=acc[m];const maj=[0,1,2,3].reduce((x,j)=>A.W[j]>A.W[x]?j:x,0);
        /* Regret: Was kostet es, in jeder Zukunft beim Mehrheitsweg zu bleiben, gegenüber dem dort günstigsten zulässigen Weg? */
        const reg=[];let notBest=0,nReg=0,majKO=0;A.TOT.forEach((t,i)=>{const okv=A.WIN[i];if(!okv[maj]){majKO++;return;}const w=winOf(t,okv.map(v=>!v));if(w<0)return;nReg++;if(w!==maj)notBest++;reg.push((t[maj]-t[w])/t[w]);});
        out.modes[m]={gapYr:A.GAP.map(g=>qs(g,.5)),win:A.W.map(v=>v/N),perV:A.PV.map(a1=>[qs(a1,.1),qs(a1,.5),qs(a1,.9)]),hardShare:[0,1,2,3].map(j=>{const h=qs(A.HV[j],.5),t=qs(A.PV[j],.5);return t?h/t:null;}),
          best:[qs(A.best,.1),qs(A.best,.5),qs(A.best,.9)],bestHard:qs(A.bestHard,.5),ai:qs(A.AI,.5),sq:qs(A.SQ,.5),beatSQ:A.nSQ?A.beatSQ/A.nSQ:null,beatSQnr:A.nSQ?A.beatSQnr/A.nSQ:null,
          majority:maj,regret50:qs(reg,.5),regret90:qs(reg,.9),regretIfWrong:qs(reg.filter(x=>x>0),.5),notBest:nReg?notBest/nReg:null,majKO:majKO/N};});
      out.aiDelta=acc.alle&&acc.base?[0,1,2,3].map(j=>qs(acc.alle.PV[j].map((v,i)=>v-acc.base.PV[j][i]),.5)):null;
      return out;
    },{P:PER[k],KI,N,k,ONLY,SEED,NEG});
    res.push(r);if(k%25===0||k===PER.length-1)process.stdout.write(`\r${k+1}/${PER.length} (${((Date.now()-t0)/1000).toFixed(0)} s)`);
  }
  console.log('');if(errs.length)console.log('PAGE ERRORS',errs.slice(0,5));
  fs.writeFileSync(OUT,JSON.stringify({N,version:'v3',seedOffset:SEED,negotiate:NEG,opts:['paid','oss','deneb','core'],ki:KI,results:res}));console.log('geschrieben:',OUT);await b.close();
})();
