#!/usr/bin/env node
/* Szenario-Harness für visual-standards-rechner.html
   Aufruf: NODE_PATH=$(npm root -g) node tools/rechner-scenario.js '<json>' [screenshot.png]
   JSON-Felder (alle optional, Rest = Standardwerte der Seite):
     creators, viewers, reports, cpr, types, horizon(3|5|10), weight(0..100), per('viewer'|'user'), view('abs'|'per')
     prio: {reqId: 'M'|'S'|'C'|'W'}            reqIds: ibcs ibcscert mscert export interact bigdata writeback maint copilot exit design rs
     cap:  {reqId: [paid,oss,deneb,core]} (1..5)
     flags:{flagId:true}                        flagIds: certonly coreonly ibcsmust nobudget rs embed sovereign nogpo
     g:    {rateInt|rateExt|migShare|churn|growth: [min,mode,max]}
     p:    {paid|oss|deneb|core: {lic|licInfl|ext|setupH|devH|firstH|reuseH|trainH|course|maint|events|fixH|dep|support: [min,mode,max]}}
   Ausgabe: Headline, Konflikte, Rangfolge, K.O.-Block, Break-even-Text, Kostentabelle (Text). */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'..','visual-standards-rechner.html');
(async()=>{
  const inp=JSON.parse(process.argv[2]||'{}');const shot=process.argv[3];
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(200);
  const hash=await p.evaluate((inp)=>{
    const st={c:S.creators,v:S.viewers,r:S.reports,q:S.cpr,t:S.types,h:S.horizon,w:S.weight,pe:S.per,vw:S.view,pr:S.prio,cp:S.cap,cu:S.custom,f:S.flags,g:S.g,p:S.p};
    const map={creators:'c',viewers:'v',reports:'r',cpr:'q',types:'t',horizon:'h',weight:'w',per:'pe',view:'vw'};
    for(const k in map)if(inp[k]!==undefined)st[map[k]]=inp[k];if(inp.mode)st.md=inp.mode;if(inp.ssShare!==undefined)st.ss=inp.ssShare;if(inp.licModel)st.lm=inp.licModel;if(inp.baseline)st.bl=inp.baseline;if(inp.existing!==undefined)st.ex=inp.existing;
    if(inp.prio)Object.assign(st.pr,inp.prio);if(inp.cap)Object.assign(st.cp,inp.cap);if(inp.flags)Object.assign(st.f,inp.flags);
    if(inp.g)Object.assign(st.g,inp.g);if(inp.p)for(const o in inp.p)Object.assign(st.p[o],inp.p[o]);
    return '#s='+btoa(unescape(encodeURIComponent(JSON.stringify(st))));
  },inp);
  await p.goto(FILE+hash,{waitUntil:'load'});await p.reload({waitUntil:'load'});await p.waitForTimeout(300);
  const txt=sel=>p.$eval(sel,e=>e.innerText.replace(/\n{2,}/g,'\n').trim()).catch(()=>'');
  const out={};
  out.headline=await txt('#headline');out.conflicts=await txt('#conflict-box');
  out.ranking=await p.$$eval('#kpi-allowed .kpi',els=>els.map(e=>e.innerText.replace(/\n+/g,' | ')));
  out.excluded=await txt('#ko-block');out.breakeven=await txt('#be-insight');out.table=await txt('#res-table');
  if(shot){await p.$eval('#s5',e=>e.scrollIntoView());await p.screenshot({path:shot,fullPage:true});}
  console.log(JSON.stringify(out,null,1));if(errs.length)console.log('PAGE ERRORS',errs);
  await b.close();
})();
