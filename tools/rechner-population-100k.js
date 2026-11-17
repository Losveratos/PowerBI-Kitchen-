#!/usr/bin/env node
/* Population-Simulation für visual-standards-rechner.html
   Schickt N synthetische Organisationen durch den unveränderten Rechenkern der Seite (calc, evaluate).
   Aufruf: NODE_PATH=$(npm root -g) node tools/rechner-population-100k.js <population.json> <out-firms.json> [N]
   population.json: { segments: { <id>: { share, creators:[min,mode,max], viewers:[..], ssShare:[..], types:[..],
     reportsFactor:[..], models:[..], horizon:{3,5,10}, licAnchor:{inforiver,enterprise,zebra}, siteLicense,
     reportClasses:{op,mix,mgmt}, ibcsAll, baseline:{none,paid,oss,deneb,core}, existingPerCreator:[..],
     dist:{none,app,org,file}, library, ossBuild:{ready,ki,classic}, flags:{..}, must:{..} } } }
   Je Organisation:
     - Profil aus eigenem Zufallsstrom (mulberry32, Seed = Index) — unabhängig vom Zufallsstrom der Seite
     - "exp": Erwartungswert je Ansatz (calc mit pertMean) = was der Rechner empfehlen würde
     - "draw": eine gepaarte PERT-Ziehung je Ansatz (setScenario je Organisation, für alle vier Ansätze gleich)
       = was in dieser einen Welt tatsächlich angefallen wäre
     - K.O. und Anforderungs-Score aus evaluate()
   Ausgabe: kompakte Spalten-Arrays (eine Zeile je Organisation). */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'..','visual-standards-rechner.html');
const POP=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const OUT=process.argv[3]||'firms.json';const N=+(process.argv[4]||100000);
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(300);
  const BATCH=5000;const cols={};let meta=null;const t0=Date.now();
  for(let start=0;start<N;start+=BATCH){
    const r=await p.evaluate(({POP,start,n})=>{
      /* ---------- eigener Zufallsstrom für das Profil ---------- */
      function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
      let R=Math.random;
      const gam=a=>{if(a<1)return gam(a+1)*Math.pow(R(),1/a);const d=a-1/3,c=1/Math.sqrt(9*d);for(;;){let x,v;do{const u1=R(),u2=R();x=Math.sqrt(-2*Math.log(u1||1e-12))*Math.cos(2*Math.PI*u2);v=1+c*x;}while(v<=0);v=v*v*v;const u=R();if(u<1-.0331*x*x*x*x)return d*v;if(Math.log(u)<.5*x*x+d*(1-v+Math.log(v)))return d*v;}};
      const pt=t=>{const lo=+t[0],hi=+t[2],m=Math.min(hi,Math.max(lo,+t[1]));if(!(hi>lo))return lo;const a=1+4*(m-lo)/(hi-lo),bb=1+4*(hi-m)/(hi-lo);const x=gam(a),y=gam(bb);return lo+x/(x+y)*(hi-lo);};
      const ptLog=t=>Math.exp(pt([Math.log(Math.max(1,t[0])),Math.log(Math.max(1,t[1])),Math.log(Math.max(1,t[2]))]));
      const pick=o=>{const ks=Object.keys(o);let s=0;ks.forEach(k=>s+=Math.max(0,+o[k]||0));let u=R()*s;for(const k of ks){u-=Math.max(0,+o[k]||0);if(u<=0)return k;}return ks[ks.length-1];};
      const bern=pp=>R()<(+pp||0);
      const SEG=Object.keys(POP.segments);const segShare={};SEG.forEach(k=>segShare[k]=POP.segments[k].share);
      const FL=['certonly','coreonly','ibcsmust','nobudget','rs','embed','sovereign','novat','budgetnext','euonly','noext','revision','orgstore'];
      const OK4=OPTS.map(o=>o.key);
      const rows=[];
      for(let i=start;i<start+n;i++){
        R=mb(0x5EED0000+i);
        const sk=pick(segShare),G=POP.segments[sk];
        defaults();
        S.creators=Math.max(1,Math.round(ptLog(G.creators)));
        S.viewers=Math.max(S.creators,Math.round(ptLog(G.viewers)));
        S.ssShare=Math.round(Math.min(100,Math.max(0,pt(G.ssShare))));
        S.types=Math.max(2,Math.round(pt(G.types)));
        S.horizon=+pick(G.horizon);
        const la=pick(G.licAnchor);S.p.paid.lic=LIC[la].slice();
        const site=bern(G.siteLicense);S.licModel=site?'site':'staffel';
        const rc=pick(G.reportClasses);S.rc.sh=WIZ_RC[rc].slice();
        S.ibcsAll=bern(G.ibcsAll);syncDerived();
        S.reports=Math.max(1,Math.round(reportsDefault()*pt(G.reportsFactor)));
        S.models=Math.max(1,Math.round(pt(G.models)));
        const bl=pick(G.baseline);S.baseline=bl;S.existing=bl==='none'?0:Math.max(1,Math.round(S.creators*pt(G.existingPerCreator)));
        S.dist=pick(G.dist);S.lib=bern(G.library);
        const ob=pick(G.ossBuild);S.p.oss.devH=DEV_PRESETS[ob].slice();
        let fm=0;FL.forEach((f,j)=>{if(f==='orgstore')return;if(bern(G.flags[f])){S.flags[f]=true;fm|=1<<j;}});
        if(S.flags.certonly&&bern(G.flags.orgstore)){S.flags.orgstore=true;S.dist='org';fm|=1<<12;}
        if(S.flags.rs)S.prio.rs='M';
        let mm=0;const MK=Object.keys(G.must);MK.forEach((k,j)=>{if(bern(G.must[k])){S.prio[k]='M';mm|=1<<j;}});
        /* ---------- Rechnen ---------- */
        const ev=evaluate();const ko=OK4.map(k=>ev[k].ko.length>0?1:0);
        /* K.O.-Gründe je Ansatz als IDs (gleiche Regeln wie evaluate) */
        const koIds=OK4.map(k=>{const ids=[];allReqs().forEach(rq=>{if(S.prio[rq.id]==='M'&&capOf(rq,k)>=1&&capOf(rq,k)<=1)ids.push('must:'+rq.id);});
          FLAGS.forEach(f=>{if(!S.flags[f.id]||f.modifier||!f.excl[k])return;if(f.id==='certonly'&&(k==='oss'||k==='deneb')&&(S.flags.osscert||S.flags.orgstore))return;ids.push('flag:'+f.id);});return ids;});const sc=OK4.map(k=>ev[k].scorePct);
        const div=Math.max(1,viewersAvg(pertMean(S.g.growth))*S.horizon);
        const exp=OK4.map(k=>calc(k,pertMean));
        const s0=(0xC0FFEE+i*7919)>>>0;
        const drw=OK4.map(k=>{setScenario(s0);return calc(k,pert);});
        rows.push([SEG.indexOf(sk),S.creators,S.viewers,S.ssShare,S.horizon,['inforiver','enterprise','zebra'].indexOf(la),site?1:0,['op','mix','mgmt'].indexOf(rc),S.ibcsAll?1:0,
          ['none','paid','oss','deneb','core'].indexOf(bl),S.existing,['none','app','org','file'].indexOf(S.dist),S.lib?1:0,['ready','ki','classic'].indexOf(ob),fm,mm,S.reports,S.models,S.types,div,
          ko,koIds,sc,exp.map(c=>Math.round(c.total)),drw.map(c=>Math.round(c.total)),
          drw.map(c=>CATS.map(([k])=>Math.round(c[k]))),drw.map(c=>Math.round(c.hard)),exp.map(c=>Math.round(c.hoursInt||0)),exp.map(c=>Math.round(c.exitCost||0)),
          drw.map(c=>[Math.round(c.phase.creation.hard),Math.round(c.phase.creation.soft),Math.round(c.phase.usage.hard),Math.round(c.phase.usage.soft)])]);
      }
      return {rows,meta:{SEG,FL,MUST:Object.keys(POP.segments[SEG[0]].must),CATS:CATS.map(c=>c[0]),OPTS:OK4}};
    },{POP,start,n:Math.min(BATCH,N-start)});
    if(!meta)meta=r.meta;
    r.rows.forEach(row=>{['seg','creators','viewers','ssShare','horizon','licAnchor','site','rc','ibcsAll','baseline','existing','dist','lib','ossBuild','flags','must','reports','models','types','div','ko','koIds','score','exp','draw','cats','hard','hoursInt','exitCost','phase'].forEach((k,j)=>(cols[k]=cols[k]||[]).push(row[j]));});
    process.stdout.write(`\r${Math.min(start+BATCH,N)} / ${N}  (${((Date.now()-t0)/1000).toFixed(0)} s)`);
  }
  console.log('');if(errs.length)console.log('PAGE ERRORS',errs.slice(0,5));
  fs.writeFileSync(OUT,JSON.stringify({meta,N,cols}));console.log('geschrieben:',OUT);
  await b.close();
})();
