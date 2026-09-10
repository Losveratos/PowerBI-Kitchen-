const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
  await p.goto('file:///home/user/PowerBI-Kitchen-/visual-standards-rechner.html',{waitUntil:'load'});await p.waitForTimeout(300);
  const res=await p.evaluate(({N,NS})=>{
    const FACETS={klein:{label:'Klein (Pilot)',creators:[1,3],viewers:[5,40],ss:100},mittelstand:{label:'Mittelstand',creators:[2,8],viewers:[30,200],ss:25},konzern:{label:'Konzern',creators:[15,60],viewers:[800,4000],ss:25}};
    const rU=(a,b)=>a+rnd()*(b-a);const rLog=(a,b)=>Math.round(Math.exp(rU(Math.log(a),Math.log(b))));const rI=(a,b)=>Math.round(rU(a,b));
    S.horizon=5;S.baseline='none';S.existing=0;S.licModel='staffel';
    const LABEL={};GLOBAL.forEach(q=>LABEL[q.id]=q.label);OPTP.forEach(q=>LABEL[q.id]=q.label);Object.assign(LABEL,{creators:'Ersteller',viewers:'Viewer',reports:'Standard-Reports',cpr:'Charts je Report',types:'Chart-Typen'});
    const rankArr=a=>{const idx=a.map((v,i)=>[v,i]).sort((p,q)=>p[0]-q[0]);const r=new Array(a.length);let i=0;while(i<idx.length){let j=i;while(j+1<idx.length&&idx[j+1][0]===idx[i][0])j++;const avg=(i+j)/2+1;for(let k=i;k<=j;k++)r[idx[k][1]]=avg;i=j+1;}return r;};
    const corr=(a,b)=>{const n=a.length;const ma=a.reduce((x,y)=>x+y,0)/n,mb=b.reduce((x,y)=>x+y,0)/n;let sab=0,saa=0,sbb=0;for(let i=0;i<n;i++){const da=a[i]-ma,db=b[i]-mb;sab+=da*db;saa+=da*da;sbb+=db*db;}return saa>0&&sbb>0?sab/Math.sqrt(saa*sbb):0;};
    const q=(a,pp)=>{const s=a.slice().sort((x,y)=>x-y);const i=(s.length-1)*pp;const lo=Math.floor(i),hi=Math.ceil(i);return s[lo]+(s[hi]-s[lo])*(i-lo);};const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
    const out={N,NS,label:LABEL,facets:{},sweep:[]};
    function runOne(i,s0){const div=viewersAvg(pertMean(S.g.growth))*S.horizon;const divU=(S.creators+viewersAvg(pertMean(S.g.growth)))*S.horizon;const r={};OPTS.forEach(o=>{seed=s0;const c=calc(o.key,pert);r[o.key]={total:c.total,perV:c.total/Math.max(div,1),perU:c.total/Math.max(divU,1),hard:c.hard/Math.max(div,1),soft:c.soft/Math.max(div,1),ph:{ch:c.phase.creation.hard/Math.max(div,1),cs:c.phase.creation.soft/Math.max(div,1),uh:c.phase.usage.hard/Math.max(div,1),us:c.phase.usage.soft/Math.max(div,1)},x:Object.assign({creators:S.creators,viewers:S.viewers,reports:S.reports,cpr:S.cpr,types:S.types},c.gd,c.pd)};});return r;}
    for(const fk in FACETS){const F=FACETS[fk];S.ssShare=F.ss;const rec={};OPTS.forEach(o=>rec[o.key]={y:[],x:{},hard:[],soft:[],total:[],ph:{ch:[],cs:[],uh:[],us:[]}});const rank={paid:[0,0,0,0],oss:[0,0,0,0],deneb:[0,0,0,0],core:[0,0,0,0]};
      for(let i=0;i<N;i++){seed=(4242+i*7919)>>>0;S.creators=rI(F.creators[0],F.creators[1]);S.viewers=rLog(F.viewers[0],F.viewers[1]);S.cpr=rI(5,8);S.types=rI(4,7);S.reports=Math.max(1,Math.round(reportsDefault()*rU(0.7,1.3)));
        const r=runOne(i,seed);const totals={};OPTS.forEach(o=>{const v=r[o.key],R=rec[o.key];totals[o.key]=v.total;R.y.push(v.perV);R.total.push(v.total);R.hard.push(v.hard);R.soft.push(v.soft);['ch','cs','uh','us'].forEach(k=>R.ph[k].push(v.ph[k]));for(const k in v.x)(R.x[k]=R.x[k]||[]).push(v.x[k]);});
        OPTS.map(o=>o.key).sort((a,b)=>totals[a]-totals[b]).forEach((k,ri)=>rank[k][ri]++);}
      const facet={label:F.label,creators:F.creators,viewers:F.viewers,mode:modeParams().label,opts:{}};
      OPTS.forEach(o=>{const R=rec[o.key];const ry=rankArr(R.y);const sens=[];for(const k in R.x){const xs=R.x[k];if(new Set(xs).size<2)continue;sens.push({id:k,label:LABEL[k]||k,rho:corr(rankArr(xs),ry)});}sens.sort((a,b)=>Math.abs(b.rho)-Math.abs(a.rho));
        facet.opts[o.key]={y:R.y,mean:mean(R.y),p5:q(R.y,.05),p25:q(R.y,.25),p50:q(R.y,.5),p75:q(R.y,.75),p90:q(R.y,.9),p95:q(R.y,.95),hardMean:mean(R.hard),softMean:mean(R.soft),totalMean:mean(R.total),ph:{ch:mean(R.ph.ch),cs:mean(R.ph.cs),uh:mean(R.ph.uh),us:mean(R.ph.us)},sens:sens.slice(0,10),rank:rank[o.key].map(v=>v/N)};});
      out.facets[fk]=facet;}
    /* Skalen-Sweep bei festem Verhältnis Ersteller:Viewer */
    S.ssShare=25;
    for(const ratio of [20,50,100])for(const k of [1,2,5,10,20]){S.creators=k;S.viewers=k*ratio;const acc={};OPTS.forEach(o=>acc[o.key]={perU:[],perV:[],rank1:0});
      for(let i=0;i<NS;i++){seed=(9001+i*7919)>>>0;S.cpr=rI(5,8);S.types=rI(4,7);S.reports=Math.max(1,Math.round(reportsDefault()*rU(0.7,1.3)));const r=runOne(i,seed);const best=OPTS.map(o=>o.key).sort((a,b)=>r[a].total-r[b].total)[0];acc[best].rank1++;OPTS.forEach(o=>{acc[o.key].perU.push(r[o.key].perU);acc[o.key].perV.push(r[o.key].perV);});}
      const row={ratio,k,creators:k,viewers:k*ratio,opts:{}};OPTS.forEach(o=>{const a=acc[o.key];row.opts[o.key]={perU:mean(a.perU),perU50:q(a.perU,.5),perU10:q(a.perU,.1),perU90:q(a.perU,.9),perV:mean(a.perV),win:a.rank1/NS};});out.sweep.push(row);}
    return out;},{N:6000,NS:1500});
  fs.writeFileSync('mc3-result.json',JSON.stringify(res));
  console.log('sweep (€ je Nutzer und Jahr, Mittel; Platz-1-Anteil):');res.sweep.forEach(r=>console.log(`1:${r.ratio}  k=${String(r.k).padStart(2)}  ${r.creators}/${r.viewers}`.padEnd(26)+['paid','oss','deneb','core'].map(o=>o.padEnd(5)+String(Math.round(r.opts[o].perU)).padStart(5)+' ('+Math.round(100*r.opts[o].win)+'%)').join('  ')));
  await b.close();})();
