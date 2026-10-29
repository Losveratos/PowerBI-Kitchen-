/* v0.12 (Paket C2) — Eingaben und Annahmen.
   Stunden-Anker, Unsicherheit im Mengengeruest, Sicherheits-Leiste, Kriterien und Red Flags,
   Verteilweg, Semantikmodelle, Adoptionsgrad, CapEx/OpEx-Split, Share-Link-Roundtrip,
   Mobile 390 px und Determinismus der Simulation.
   Herkunft: Scratchpad-Skript test_c2.js.
   Start:  node tests/rechner/eingaben-und-annahmen.test.js */
const { chromium, URL, artifactDir, reporter } = require('./lib/harness');
const DIR = artifactDir('eingaben-und-annahmen');
const R = reporter('eingaben-und-annahmen');
/* test_c2 ruft ok(bedingung, text) — der Harness ok(text, bedingung). */
const ok = (c, m) => R.ok(m, c);
const OPTSK=['paid','oss','deneb','core'];
const f=n=>Math.round(n).toLocaleString('de-DE');

const p50=()=>{const r={};OPTS.forEach(o=>{const t=[];for(let i=0;i<1500;i++){setScenario(987654+i*7919);t.push(calc(o.key,pert).total);}r[o.key]=q(t,.5);});return r;};

(async()=>{
const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1240,height:900}});
const errs=R.errs;const page=R.watch(await ctx.newPage(),'desktop');
await page.goto(URL);await page.waitForTimeout(900);await page.evaluate(()=>{const b=document.getElementById('wiz-skip');if(b)b.click();});

console.log('\n== 1 · Stunden-Anker ==');
const anch=await page.evaluate(()=>{
  const out={};['panel','blind','kons'].forEach(a=>{document.querySelector('[data-hanchor="'+a+'"]').click();
    const r={};OPTS.forEach(o=>{const t=[];for(let i=0;i<1500;i++){setScenario(987654+i*7919);t.push(calc(o.key,pert).total);}r[o.key]=Math.round(q(t,.5));});
    out[a]={p50:r,detect:detectAnchor(),label:document.getElementById('hanchor-state').textContent,
      firstH:OPTS.map(o=>S.p[o.key].firstH.join('/')),sentence:document.getElementById('ov-sentence').textContent.includes('Stunden-Anker')};});
  document.querySelector('[data-hanchor="panel"]').click();return out;});
['panel','blind','kons'].forEach(a=>{const r=anch[a];
  console.log('  '+a.padEnd(6)+' P50: '+OPTSK.map(k=>k+' '+f(r.p50[k])).join(' · '));
  console.log('         firstH '+r.firstH.join(' | ')+'  ['+r.label+']');
  ok(r.detect===a,'Anker '+a+' wird erkannt');ok(r.sentence,'Anker steht im Überblicks-Satz');});
ok(anch.kons.p50.core>anch.panel.p50.core&&anch.panel.p50.core>0,'Konservativ liegt über Panel (Core)');
console.log('  Niveau gegen Panel: '+['blind','kons'].map(a=>a+' '+OPTSK.map(k=>k+' '+((anch[a].p50[k]/anch.panel.p50[k]-1)*100).toFixed(0)+' %').join(' ')).join('  |  '));
ok(OPTSK.every(k=>anch.kons.p50[k]>anch.panel.p50[k]),'Konservativ liegt über Panel, in allen vier Ansätzen');
ok(OPTSK.some(k=>Math.abs(anch.blind.p50[k]/anch.panel.p50[k]-1)>0.1),'Blindschätzung verschiebt das Niveau spürbar (bei Core und OSS nach unten: niedrigere Wartungsquote und Schulung wiegen den höheren Erstbau auf)');

console.log('\n== 2 · Mengengerüst-Unsicherheit ==');
const mu=await page.evaluate(()=>{document.querySelector('[data-preset="konzern"]').click();const out={};[0,10,20].forEach(v=>{document.querySelector('#munc-seg [data-mu="'+v+'"]').click();
  const r={};OPTS.forEach(o=>{const s=simulate(o.key,4000);r[o.key]={p10:Math.round(s.p10),p50:Math.round(s.p50),p90:Math.round(s.p90),w:s.p90-s.p10};});out[v]=r;});
  document.querySelector('#munc-seg [data-mu="0"]').click();document.querySelector('[data-preset="mittelstand"]').click();return out;});
console.log('  (Preset Konzern, 4.000 Ziehungen je Lauf)');
OPTSK.forEach(k=>{const a=mu[0][k],b=mu[10][k],c=mu[20][k];
  console.log('  '+k.padEnd(6)+' aus   P10 '+f(a.p10)+' P50 '+f(a.p50)+' P90 '+f(a.p90)+'  Band '+f(a.w));
  console.log('         \u00b110 % Band '+f(b.w)+' (+'+((b.w/a.w-1)*100).toFixed(1)+' %)   \u00b120 % Band '+f(c.w)+' (+'+((c.w/a.w-1)*100).toFixed(1)+' %)');
  ok(c.w>a.w,'Band '+k+' wird mit \u00b120 % breiter');ok(c.w>b.w,'\u00b120 % breiter als \u00b110 % ('+k+')');});

console.log('\n== 3 · Sicherheits-Leiste ==');
const cert=await page.evaluate(()=>{update();return OPTS.map(o=>{const sp=certSplit(lastSim[o.key]);return {k:o.key,b:sp.b,f:sp.f,e:sp.e,sum:sp.b+sp.f+sp.e};});});
cert.forEach(c=>{console.log('  '+c.k.padEnd(6)+' belegt '+(100*c.b).toFixed(1)+' % · Faustregel '+(100*c.f).toFixed(1)+' % · Schätzung '+(100*c.e).toFixed(1)+' %  (Summe '+(100*c.sum).toFixed(3)+' %)');
  ok(Math.abs(c.sum-1)<1e-9,'Summe '+c.k+' = 100 %');});
const certDom=await page.evaluate(()=>({bars:document.querySelectorAll('#certainty .cert-bar').length,key:document.querySelector('.cert-key').textContent}));
ok(certDom.bars===4,'vier Leisten im DOM ('+certDom.bars+')');
ok(/belegt = Preisliste\/Snippet/.test(certDom.key)&&/Faustregel = Literatur ohne Messung/.test(certDom.key)&&/Schätzung = Panel oder Autoren/.test(certDom.key),'Beschriftung vollständig');
ok(await page.evaluate(()=>/% der .+-Kosten beruhen auf belegten Preisen/.test(document.getElementById('ov-sentence').textContent)),'Satz in Ebene 1 vorhanden');

console.log('\n== 4 · Kriterien, Flags, neue Eingaben ==');
const meta=await page.evaluate(()=>({reqs:allReqs().length,rows:document.querySelectorAll('#req-table tbody tr').length,
  cnt:document.getElementById('req-count').textContent,flags:FLAGS.length,chk:document.querySelectorAll('#flag-list input').length,
  ids:REQS.map(r=>r.id),fids:FLAGS.map(x=>x.id),glob:GLOBAL.length,optp:OPTP.length}));
console.log('  Kriterien: '+meta.reqs+' · Zeilen in #req-table: '+meta.rows+' · Anzeige: "'+meta.cnt+'"');
console.log('  Red Flags: '+meta.flags+' · Checkboxen: '+meta.chk);
console.log('  Annahmen: '+meta.glob+' global + '+meta.optp+' je Ansatz = '+(meta.glob+meta.optp));
ok(meta.reqs===27&&meta.rows===27,'27 Kriterien in Tabelle und Modell');
ok(/27 Kriterien/.test(meta.cnt),'Zahl im Text stimmt');
['pin','alm','themeable','drill','mobile','copyppt','paginated'].forEach(i=>ok(meta.ids.includes(i),'Kriterium '+i));
['euonly','betriebsrat','revision','novat','budgetnext','capAtLimit'].forEach(i=>ok(meta.fids.includes(i),'Red Flag '+i));
ok(meta.flags===17&&meta.chk===17,'17 Flags klickbar');

console.log('\n== 5 · Flags klicken ==');
for(const id of ['euonly','betriebsrat','revision','novat','budgetnext','capAtLimit']){
  const r=await page.evaluate(i=>{const el=document.querySelector('[data-flag="'+i+'"]');el.click();el.dispatchEvent(new Event('change',{bubbles:true}));
    const o={};OPTS.forEach(x=>o[x.key]=Math.round(expected(x.key).total));
    el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));return o;},id);
  console.log('  '+id.padEnd(12)+OPTSK.map(k=>k+' '+f(r[k])).join(' · '));}
await page.waitForTimeout(200);

console.log('\n== 6 · Verteilweg, Semantikmodelle, Adoption, CapEx ==');
const b7=await page.evaluate(()=>{const out={};['none','app','org','file'].forEach(d=>{document.querySelector('#dist-seg [data-dist="'+d+'"]').click();
  const r={};OPTS.forEach(o=>{const e=expected(o.key);r[o.key]={tot:Math.round(e.total),gov:Math.round(e.gov),lead:Math.round(e.leadWeeks)};});out[d]={r,org:!!S.flags.orgstore};});
  document.querySelector('#dist-seg [data-dist="none"]').click();return out;});
['none','app','org','file'].forEach(d=>console.log('  '+d.padEnd(5)+OPTSK.map(k=>k+' gov '+f(b7[d].r[k].gov)+' / '+b7[d].r[k].lead+' Wo.').join(' · ')+'  [orgstore '+b7[d].org+']'));
ok(b7.app.r.oss.gov<b7.none.r.oss.gov&&b7.file.r.oss.gov>b7.none.r.oss.gov,'Verteilweg wirkt auf Governance');
ok(b7.org.org===true,'Org-Store setzt den Modifier');
const b6=await page.evaluate(()=>{const out={};[1,5,20].forEach(m=>{S.models=m;const r={};OPTS.forEach(o=>r[o.key]=Math.round(expected(o.key).total));out[m]=r;});S.models=1;update();return out;});
[1,5,20].forEach(m=>console.log('  '+String(m).padStart(2)+' Modelle: '+OPTSK.map(k=>k+' '+f(b6[m][k])).join(' · ')));
ok(b6[20].core/b6[1].core>b6[20].paid/b6[1].paid,'Semantikmodelle treffen Core stärker als Paid');
const b5=await page.evaluate(()=>{const out={};['full','sugg'].forEach(a=>{document.querySelector('[data-adopt="'+a+'"]').click();
  const r={};OPTS.forEach(o=>r[o.key]=Math.round(expected(o.key).total));out[a]=r;});document.querySelector('[data-adopt="full"]').click();return out;});
['full','sugg'].forEach(a=>console.log('  Adoption '+a.padEnd(5)+OPTSK.map(k=>k+' '+f(b5[a][k])).join(' · ')));
console.log('  Richtung: '+OPTSK.map(k=>k+' '+((b5.sugg[k]/b5.full[k]-1)*100).toFixed(1)+' %').join(' · ')+'  (bepreist ist nur der Mehraufwand, nicht der Wertverlust)');
ok(OPTSK.every(k=>b5.sugg[k]>=b5.full[k]),'Adoptionsgrad unter 100 % verteuert jeden Ansatz');
ok(b5.sugg.paid/b5.full.paid>b5.sugg.core/b5.full.core,'Richtung wie gemessen: Paid trägt den größten Aufschlag, weil dort der Ad-hoc-Satz über dem Standard-Satz liegt');
const cap=await page.evaluate(()=>{document.getElementById('capex-on').click();const t=document.getElementById('capex').textContent;
  const r=OPTS.map(o=>{const e=expected(o.key);return o.key+' CapEx '+Math.round(e.capexBase)+' / OpEx '+Math.round(e.opexBase)+' / Summe '+Math.round(e.capexBase+e.opexBase-e.total);});
  return {r,hgb:/248 Abs. 2 HGB/.test(t)&&/IAS 38/.test(t),afa:/Abschreibung je Jahr/.test(t)};});
cap.r.forEach(x=>console.log('  '+x));
ok(cap.hgb,'HGB 248 / IAS 38 im Text');ok(cap.afa,'Abschreibungszeile erscheint');
ok(cap.r.every(x=>/Summe 0$/.test(x)),'CapEx + OpEx = Gesamtkosten');

console.log('\n== 7 · Share-Link-Roundtrip (ha, mu und die übrigen C2-Felder) ==');
await page.evaluate(()=>{document.querySelector('[data-hanchor="blind"]').click();document.querySelector('#munc-seg [data-mu="20"]').click();
  document.querySelector('#dist-seg [data-dist="file"]').click();S.models=7;document.querySelector('[data-adopt="sugg"]').click();
  S.capex={on:true,life:3};update();});
const href=await page.evaluate(()=>{writeHash();return location.href;});
const raw=await page.evaluate(()=>{const m=location.hash.match(/#s=(.+)/);return JSON.parse(decodeURIComponent(escape(atob(m[1]))));});
console.log('  geschrieben: sv='+raw.sv+' ha='+raw.ha+' mu='+raw.mu+' dv='+raw.dv+' mo='+raw.mo+' cx='+raw.cx);
/* Link-Schema-Version: v0.12 schrieb sv=4, seit v0.19 steht sie auf 5.
   Beim Anheben hier und in der Abwaertskompatibilitaets-Probe unten nachziehen. */
ok(raw.sv===5,'Link-Schema sv=5 (war sv=4 bis v0.18): '+raw.sv);ok(raw.ha==='blind'&&raw.mu===20&&raw.dv==='file'&&raw.mo===7&&raw.cx===103,'alle C2-Felder im Link');
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push('PAGEERROR(link) '+e.message));
await p2.goto(href);await p2.waitForTimeout(900);await p2.evaluate(()=>{const b=document.getElementById('wiz-skip');if(b)b.click();});
const back=await p2.evaluate(()=>({ha:S.hAnchor,mu:S.mUnc,dv:S.dist,mo:S.models,cx:S.capex,ad:Math.round(pertMean(S.p.core.adopt)),
  firstH:S.p.core.firstH.join('/'),tot:Math.round(expected('core').total)}));
console.log('  gelesen:     ha='+back.ha+' mu='+back.mu+' dv='+back.dv+' mo='+back.mo+' cx='+JSON.stringify(back.cx)+' adopt(core)='+back.ad+' firstH(core)='+back.firstH);
ok(back.ha==='blind'&&back.mu===20&&back.dv==='file'&&back.mo===7&&back.cx.on&&back.cx.life===3,'Roundtrip vollständig');
ok(await p2.evaluate(()=>S.p.core.adopt.join()==='40,65,85'&&S.p.core.firstH.join()==='10,24,45'),'Adoptions- und Anker-Werte kommen mit');
/* Abwaertskompatibilitaet: alter Link ohne C2-Felder */
const old=await page.evaluate(()=>{const st={sv:4,c:3,v:40,r:12,q:6,t:5,h:5,md:'man',ss:25,lm:'staffel',bl:'none',ex:0,w:70,pe:'viewer',vw:'abs',lv:2};
  return '#s='+btoa(unescape(encodeURIComponent(JSON.stringify(st))));});
const p3=await ctx.newPage();p3.on('pageerror',e=>errs.push('PAGEERROR(alt) '+e.message));
await p3.goto(URL+old);await p3.waitForTimeout(900);await p3.evaluate(()=>{const b=document.getElementById('wiz-skip');if(b)b.click();});
const oldr=await p3.evaluate(()=>({ha:S.hAnchor,mu:S.mUnc,dv:S.dist,mo:S.models,tot:Math.round(expected('core').total)}));
console.log('  alter Link:  ha='+oldr.ha+' mu='+oldr.mu+' dv='+oldr.dv+' mo='+oldr.mo+' → Core '+f(oldr.tot));
ok(oldr.ha==='panel'&&oldr.mu===0&&oldr.dv==='none'&&oldr.mo===1,'alter Link fällt auf die Voreinstellungen zurück');

console.log('\n== 8 · kein „Easy“, 390 px auf allen Ebenen ==');
const easy=await page.evaluate(()=>{const h=document.documentElement.innerHTML;const i=h.indexOf('Easy');return i<0?null:h.slice(Math.max(0,i-80),i+80);});
ok(easy===null,'kein „Easy“ im DOM'+(easy?' → '+easy:''));
const m=await ctx.newPage();m.on('pageerror',e=>errs.push('PAGEERROR(mobil) '+e.message));
await m.setViewportSize({width:390,height:900});await m.goto(URL);await m.waitForTimeout(700);await m.evaluate(()=>{const b=document.getElementById('wiz-skip');if(b)b.click();});
for(const lv of [1,2,3]){
  await m.evaluate(l=>{setLevel(l,false);update();},lv);await m.waitForTimeout(500);
  const o=await m.evaluate(()=>{const w=document.documentElement.scrollWidth;const bad=[];
    document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect();if(r.right<=390.5)return;
      let sc=false,x=el;while(x&&x!==document.body){if(/auto|scroll/.test(getComputedStyle(x).overflowX)){sc=true;break;}x=x.parentElement;}
      if(!sc)bad.push((el.id?'#'+el.id:el.className||el.tagName)+' r='+Math.round(r.right));});
    return {w,bad:[...new Set(bad)].slice(0,5)};});
  console.log('  Ebene '+lv+': scrollWidth '+o.w+' px'+(o.bad.length?' · Überstand: '+o.bad.join(' | '):''));
  ok(o.w<=391,'Ebene '+lv+' ohne horizontalen Überlauf');}
await m.screenshot({path:DIR+'mobil-ebene3.png',fullPage:false});

console.log('\n== 9 · Determinismus ==');
const d1=await page.evaluate(()=>{defaults();update();return OPTS.map(o=>Math.round(simulate(o.key,1500).p50)).join('/');});
const d2=await page.evaluate(()=>{defaults();update();return OPTS.map(o=>Math.round(simulate(o.key,1500).p50)).join('/');});
ok(d1===d2,'zweimal derselbe Lauf: '+d1);

await R.finish(br);})();
