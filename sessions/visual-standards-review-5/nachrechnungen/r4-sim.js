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
const FILE='file://'+'/home/user/PowerBI-Kitchen-/visual-standards-rechner.html';
const POP=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const OUT=process.argv[3]||'firms.json';const N=+(process.argv[4]||100000);
(async()=>{
  const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(300);
  const BATCH=2500;const rows_all=[];const t0=Date.now();
  for(let start=0;start<N;start+=BATCH){
    const r=await p.evaluate(({POP,start,n,HOOK})=>{
      let VARIANT_HOOK=null;if(HOOK){VARIANT_HOOK=new Function(HOOK);}
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
        if(typeof VARIANT_HOOK==='function')VARIANT_HOOK();
        const ev=evaluate();
        const ko=OK4.map(k=>ev[k].ko.length>0?1:0);
        const mw=OK4.map(k=>ev[k].warn.filter(w=>w.indexOf('Must')===0).length);
        const sc=OK4.map(k=>ev[k].scorePct);
        const exp=OK4.map(k=>calc(k,pertMean));
        rows.push([ko,mw,sc,exp.map(c=>c.total),S.viewers,S.horizon,SEG.indexOf(sk)]);
      }
      return {rows};

    },{POP,start,n:Math.min(BATCH,N-start),HOOK:process.env.HOOK||''});
    rows_all.push(...r.rows);
  }
  if(errs.length)console.log('PAGE ERRORS',errs.slice(0,5));
  fs.writeFileSync(OUT,JSON.stringify(rows_all));console.log('ok',rows_all.length);
  await b.close();
})();
