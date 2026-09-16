/* v0.19 — Wirkungsgraph als eigener, offener Abschnitt #s-map zwischen Ueberblick und Eingaben.
   Prueft Seitenfolge, Sichtbarkeit je Ebene, Erklaerblock, Ansatz-Reiter, Knotenauswahl,
   Popup, Druckansicht und Ueberlauf bei 390 / 768 / 1100 px.
   Herkunft: Scratchpad-Skript test_v19.js (Stand v0.19).
   Start:  node tests/rechner/wirkungsgraph-abschnitt.test.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus lib/harness.js. */
const { chromium, URL: U, artifactDir, skipWizard: skip, reporter } = require('./lib/harness');
const DIR = artifactDir('wirkungsgraph-abschnitt');
const R = reporter('wirkungsgraph-abschnitt');
const ok = R.ok, watch = R.watch, errs = R.errs;

(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1300);await skip(p);

/* ---------- 1) Seitenfolge: Ueberblick, Karte, Eingaben, Ergebnis, Details ---------- */
/* Dokumentreihenfolge, unabhaengig von der Ebene (ausgeblendete Bloecke haben keine Geometrie) */
const order=await p.evaluate(()=>{
  const ids=['s0','s-map','s1','s1b','s2','s3','s5','d-s6','d-anhang'];
  const all=[...document.querySelectorAll('*')];
  const pos={};ids.forEach(i=>{const el=document.getElementById(i);pos[i]=el?all.indexOf(el):-1;});
  return pos;});
ok('Karte steht im Dokument nach dem Ueberblick',order['s-map']>order['s0']&&order['s0']>0,JSON.stringify([order['s0'],order['s-map']]));
ok('Karte steht vor den Eingaben',order['s-map']<order['s1'],JSON.stringify([order['s-map'],order['s1']]));
ok('Eingaben stehen vor dem Ergebnis',order['s1']<order['s1b']&&order['s1b']<order['s2']&&order['s2']<order['s3']&&order['s3']<order['s5']);
ok('Ergebnis steht vor den Details',order['s5']<order['d-s6']&&order['d-s6']<order['d-anhang']);
ok('Alter Block d-graph existiert nicht mehr',await p.evaluate(()=>!document.getElementById('d-graph')));

/* ---------- 2) Ebene 1 bleibt schlank, Ebene 2 zeigt die Karte ohne Klick ---------- */
await p.click('.stepper [data-level="1"]');await p.waitForTimeout(600);
let v=await p.evaluate(()=>{const s=document.getElementById('s-map');const r=s.getBoundingClientRect();
  return {disp:getComputedStyle(s).display,h:Math.round(r.height)};});
ok('Ebene 1: Karte ausgeblendet',v.disp==='none'&&v.h===0,JSON.stringify(v));
ok('Ebene 1: Einzeiler mit Sprung auf die Karte',await p.isVisible('#s0 .lnk[data-goto="s-map"]'));
await p.click('#s0 .lnk[data-goto="s-map"]');await p.waitForTimeout(1200);
v=await p.evaluate(()=>({lv:S.level,top:Math.round(document.getElementById('s-map').getBoundingClientRect().top),
  vis:document.getElementById('graph-svg').getBoundingClientRect().height>0}));
ok('Einzeiler wechselt die Ebene und springt zur Karte',v.lv===2&&v.vis&&v.top>-40&&v.top<300,JSON.stringify(v));

await p.click('.stepper [data-level="2"]');await p.waitForTimeout(800);
v=await p.evaluate(()=>{const s=document.getElementById('s-map'),g=document.getElementById('graph-svg');
  return {sec:s.tagName,lv:s.dataset.lv,inDetails:!!s.closest('details'),
    disp:getComputedStyle(s).display,nodes:document.querySelectorAll('#graph-svg [data-n]').length,
    h:Math.round(g.getBoundingClientRect().height),
    head:(s.querySelector('.section-title')||{}).textContent,
    sub:((s.querySelector('.section-sub')||{}).textContent||'').length};});
ok('Karte ist eine eigene Section auf Ebene 2, kein details',v.sec==='SECTION'&&v.lv==='2'&&!v.inDetails,JSON.stringify(v));
ok('Ebene 2: Graph ohne Klick sichtbar gezeichnet',v.disp!=='none'&&v.h>200&&v.nodes>20,JSON.stringify(v));
ok('Karte hat Ueberschrift und Vorspann wie die anderen Abschnitte',/Woran die Kosten hängen/.test(v.head||'')&&v.sub>80,v.head+' | sub '+v.sub);

/* ---------- 3) Lange Erklaerung: zugeklappt, aufklappbar ---------- */
let h=await p.evaluate(()=>{const d=document.getElementById('d-graph-how');
  const s=document.getElementById('s-map'),g=document.getElementById('graph-stage');
  return {inMap:s.contains(d),open:d.open,belowGraph:d.getBoundingClientRect().top>g.getBoundingClientRect().top,
    txt:d.textContent.replace(/\s+/g,' ').trim().length};});
ok('Lange Erklaerung liegt zugeklappt unter dem Graphen',h.inMap&&h.open===false&&h.belowGraph,JSON.stringify(h));
ok('Kurze Orientierung bleibt sichtbar',await p.evaluate(()=>{
  const t=document.querySelector('#s-map .card>p.hint').textContent;
  return /Eingaben/.test(t)&&/Annahmen-Gruppen/.test(t)&&/Kostenposten/.test(t);}));
await p.click('#d-graph-how summary');await p.waitForTimeout(400);
h=await p.evaluate(()=>({open:document.getElementById('d-graph-how').open,
  txt:document.getElementById('d-graph-how').textContent.replace(/\s+/g,' ')}));
ok('Lange Erklaerung laesst sich oeffnen',h.open&&/Dicke Bänder tragen Beträge/.test(h.txt),h.txt.slice(0,110));
await p.click('#d-graph-how summary');await p.waitForTimeout(300);

/* ---------- 4) Ansatz-Umschalter an der neuen Stelle ---------- */
const tabs=await p.$$eval('#graph-tabs [data-gopt]',n=>n.map(x=>x.dataset.gopt));
ok('Vier Ansatz-Reiter',tabs.length===4&&tabs.join(',')==='paid,oss,deneb,core',tabs.join(','));
await p.click('#graph-tabs [data-gopt="deneb"]');await p.waitForTimeout(600);
let t=await p.evaluate(()=>({o:graphOpt,active:document.querySelector('#graph-tabs .tab.active').dataset.gopt,
  note:document.getElementById('graph-note').textContent.slice(0,60)}));
ok('Umschalter zeichnet den Graphen neu',t.o==='deneb'&&t.active==='deneb'&&/Deneb/.test(t.note),JSON.stringify(t));
await p.click('#graph-tabs [data-gopt="paid"]');await p.waitForTimeout(600);

/* ---------- 5) Auswahl, Erklaerbox, Sensitivitaet, Popup ---------- */
const pick=async nid=>{
  await p.keyboard.press('Escape');await p.waitForTimeout(250);
  await p.evaluate(n=>{const e=document.querySelector('#graph-svg [data-n="'+n+'"]');if(e)e.scrollIntoView({block:'center'});},nid);
  await p.waitForTimeout(250);
  await p.click('#graph-svg [data-n="'+nid+'"]');await p.waitForTimeout(500);
  return p.evaluate(n=>({sel:graphSel,pressed:document.querySelector('#graph-svg [data-n="'+n+'"]').getAttribute('aria-pressed'),
    dim:document.querySelectorAll('#graph-svg .g-dim').length,hi:document.querySelectorAll('#graph-svg .g-hi').length,
    txt:document.getElementById('graph-explain').textContent.replace(/\s+/g,' ').trim(),
    pop:!document.getElementById('graph-pop').hidden,
    popIn:document.getElementById('s-map').contains(document.getElementById('graph-pop')),
    popTop:Math.round(document.getElementById('graph-pop').getBoundingClientRect().top),
    popTitle:(document.getElementById('gpop-title')||{}).textContent||''}),nid);};

let r=await pick('in:viewers');
ok('Eingabe waehlbar, Pfade hervorgehoben',r.sel==='in:viewers'&&r.pressed==='true'&&r.dim>5&&r.hi>0,JSON.stringify({dim:r.dim,hi:r.hi}));
ok('Erklaerbox beschreibt die Eingabe',/Eingabe/.test(r.txt)&&r.txt.length>140,r.txt.slice(0,120));
ok('Popup oeffnet im neuen Abschnitt',r.pop&&r.popIn,r.popTitle);
await p.evaluate(()=>document.getElementById('s-map').scrollIntoView({block:'start'}));await p.waitForTimeout(400);
await p.screenshot({path:DIR+'graph-popup-1280.png',fullPage:false});

r=await pick('grp:gov');
ok('Annahmen-Gruppe waehlbar',r.sel==='grp:gov'&&/Annahmen-Gruppe/.test(r.txt),r.txt.slice(0,110));
ok('Sensitivitaet mit Betrag an der neuen Stelle',/10 % h(ö|o)her/.test(r.txt)&&/Gesamtkosten/.test(r.txt),(r.txt.match(/Sensitivit.{0,180}/)||[''])[0]);
ok('Gruppen-Popup mit editierbaren Dreipunkt-Zeilen',(await p.$$eval('#gpop-body .a-row input[type=number]',n=>n.length))>=6);
const mapEl=await p.$('#s-map');await mapEl.screenshot({path:DIR+'graph-selected.png'});

/* Aenderung im Popup wirkt */
const b1=await p.evaluate(()=>lastSim[graphOpt].p50);
const fi=await p.$('#gpop-body .a-row input[type=number]');const fv=await fi.inputValue();
await fi.fill(String(Math.max(1,(+fv||1)*3)));
await p.evaluate(()=>{document.querySelector('#gpop-body .a-row input[type=number]').dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(900);
ok('Aenderung im Popup rechnet neu',(await p.evaluate(()=>lastSim[graphOpt].p50))!==b1);
await p.click('#gpop-reset');await p.waitForTimeout(900);
ok('Zuruecksetzen im Popup',Math.abs((await p.evaluate(()=>lastSim[graphOpt].p50))-b1)<1);

r=await pick('item:lic');
ok('Kostenposten waehlbar',r.sel==='item:lic'&&/Kostenposten/.test(r.txt),r.txt.slice(0,110));
await p.keyboard.press('Escape');await p.waitForTimeout(400);
ok('Escape hebt auf',await p.evaluate(()=>graphSel===null&&document.getElementById('graph-pop').hidden));

/* ---------- 6) Werkzeugleiste, Inhaltsverzeichnis, gefuehrter Einstieg ---------- */
await p.click('.stepper [data-level="1"]');await p.waitForTimeout(700);
await p.click('#btn-graph');await p.waitForTimeout(1200);
v=await p.evaluate(()=>({lv:S.level,top:Math.round(document.getElementById('s-map').getBoundingClientRect().top),
  vis:document.getElementById('graph-svg').getBoundingClientRect().height>0}));
ok('Werkzeugleisten-Knopf springt auf Ebene 2 zur Karte',v.lv===2&&v.vis&&v.top>-40&&v.top<300,JSON.stringify(v));

await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(400);
await p.click('#toc-list [data-toc="s-map"]');await p.waitForTimeout(1200);
v=await p.evaluate(()=>({lv:S.level,top:Math.round(document.getElementById('s-map').getBoundingClientRect().top),
  on:!!document.querySelector('#toc-list [data-toc="s-map"]')}));
ok('Inhaltsverzeichnis springt zur Karte',v.on&&v.lv===2&&v.top>-40&&v.top<300,JSON.stringify(v));
const tocIds=await p.$$eval('#toc-list [data-toc]',n=>n.map(x=>x.dataset.toc));
ok('Inhaltsverzeichnis kennt kein d-graph mehr',!tocIds.includes('d-graph')&&tocIds.includes('s-map'),tocIds.slice(0,6).join(','));

await p.evaluate(()=>wizStart());await p.waitForTimeout(600);
for(let i=0;i<6;i++){await p.click('#wiz-next');await p.waitForTimeout(250);}
ok('Einstieg hat die Option „Modell als Karte“',await p.isVisible('[data-wact="graph"]'));
const hint=await p.evaluate(()=>document.querySelector('.wiz-hint').textContent);
ok('Einstieg-Hinweis nennt nicht mehr Ebene 3',!/Wirkungsgraph in Ebene 3/.test(hint));
await p.click('[data-wact="graph"]');await p.waitForTimeout(1400);
v=await p.evaluate(()=>({lv:S.level,top:Math.round(document.getElementById('s-map').getBoundingClientRect().top),
  vis:document.getElementById('graph-svg').getBoundingClientRect().height>0}));
ok('Einstieg springt auf Ebene 2 zur Karte',v.lv===2&&v.vis&&v.top>-40&&v.top<300,JSON.stringify(v));

/* ---------- 7) Seitenfolge-Screenshot: Ueberblick + Karte im Viewport ---------- */
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(500);
await p.screenshot({path:DIR+'folge-1280-oben.png',fullPage:false});
/* Uebergang Ueberblick -> Karte: Ende von #s0 und Kopf von #s-map zugleich im Viewport */
const cut=await p.evaluate(()=>{const m=document.getElementById('s-map');
  window.scrollTo(0,m.getBoundingClientRect().top+scrollY-330);
  return Math.round(m.getBoundingClientRect().top+scrollY);});
await p.waitForTimeout(700);
const both=await p.evaluate(()=>{const a=document.getElementById('s0').getBoundingClientRect(),
  m=document.getElementById('s-map').getBoundingClientRect();
  return {s0Bottom:Math.round(a.bottom),mapTop:Math.round(m.top),h:innerHeight};});
ok('Ueberblick-Ende und Karten-Kopf zugleich im Viewport',both.s0Bottom>0&&both.s0Bottom<both.h&&both.mapTop>0&&both.mapTop<both.h,JSON.stringify(both));
await p.screenshot({path:DIR+'folge-1280-ueberblick-karte.png',fullPage:false});

/* ---------- 8) Druckansicht zeigt den Graphen ---------- */
await p.click('.stepper [data-level="2"]');await p.waitForTimeout(700);
await p.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await p.waitForTimeout(400);
await p.emulateMedia({media:'print'});await p.waitForTimeout(500);
const pr=await p.evaluate(()=>{const s=document.getElementById('s-map'),g=document.getElementById('graph-svg');
  return {sec:getComputedStyle(s).display,svg:!!g.querySelector('svg'),h:Math.round(g.getBoundingClientRect().height),
    how:document.getElementById('d-graph-how').open,tree:document.getElementById('d-tree').open,
    toc:getComputedStyle(document.getElementById('toc')).display,
    pop:getComputedStyle(document.getElementById('graph-pop')).display};});
ok('Druck: Karte sichtbar, Graph gezeichnet',pr.sec!=='none'&&pr.svg&&pr.h>200,JSON.stringify(pr));
ok('Druck: lange Erklaerung aufgeklappt',pr.how===true);
ok('Druck: Entscheidungsbaum aufgeklappt',pr.tree===true);
ok('Druck: keine Seitenleiste, kein Popup',pr.toc==='none'&&pr.pop==='none');
await p.emulateMedia({media:'screen'});await p.waitForTimeout(400);
await p.evaluate(()=>{document.getElementById('d-graph-how').open=false;document.getElementById('d-tree').open=false;});

/* ---------- 9) Breiten ---------- */
for(const W of [390,768,1100]){
  const q=await b.newPage({viewport:{width:W,height:900}});watch(q);
  await q.goto(U);await q.waitForTimeout(1300);await skip(q);
  for(const lv of [1,2,3]){
    await q.click('.stepper [data-level="'+lv+'"]');await q.waitForTimeout(800);
    const o=await q.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
    ok(W+' px lv'+lv+' kein Ueberlauf',o.sw<=o.cw+1,JSON.stringify(o));}
  await q.click('.stepper [data-level="2"]');await q.waitForTimeout(700);
  await q.evaluate(()=>{const e=document.querySelector('#graph-svg [data-n="grp:lic"]');e.scrollIntoView({block:'center'});
    e.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
  await q.waitForTimeout(700);
  const o2=await q.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,
    pop:!document.getElementById('graph-pop').hidden}));
  ok(W+' px: Popup an der neuen Stelle ohne Ueberlauf',o2.pop&&o2.sw<=o2.cw+1,JSON.stringify(o2));
  if(W===390){await q.evaluate(()=>document.getElementById('s-map').scrollIntoView({block:'start'}));await q.waitForTimeout(500);
    await q.screenshot({path:DIR+'karte-390.png',fullPage:false});}
  await q.close();}

await R.finish(b);})();
