/* v0.17 — Inhaltsverzeichnis (Seitenleiste), klickbarer Wirkungsgraph, Knoten-Popups.
   Nachgezogen auf v0.19: der Graph ist die Section #s-map, der Entscheidungsbaum das Detail #d-tree.
   Herkunft: Scratchpad-Skript test_v17.js (Stand v0.17, auf v0.19 nachgezogen).
   Start:  node tests/rechner/inhaltsverzeichnis-und-graph.test.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus lib/harness.js. */
const { chromium, URL: U, artifactDir, skipWizard: skip, reporter } = require('./lib/harness');
const DIR = artifactDir('inhaltsverzeichnis-und-graph');
const R = reporter('inhaltsverzeichnis-und-graph');
const ok = R.ok, watch = R.watch, errs = R.errs;

(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1240,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1200);await skip(p);

/* ---------- 1) Inhaltsverzeichnis erscheint ab Ebene 2 ---------- */
await p.click('.stepper [data-level="1"]');await p.waitForTimeout(500);
ok('TOC auf Ebene 1 unsichtbar',!(await p.isVisible('#toc-panel')));
await p.click('.stepper [data-level="2"]');await p.waitForTimeout(700);
ok('TOC auf Ebene 2 sichtbar',await p.isVisible('#toc-panel'));
const ids=await p.$$eval('#toc-list [data-toc]',n=>n.map(x=>x.dataset.toc));
const want=['wizard','s0','s-map','d-tree','s1','s1b','s2','s3','d-s4','s5','readguide','decision-path','kpi-allowed','certainty','rclasses','nulloption','cashout','capex','d-charts','d-text','d-s6','d-anhang'];
ok('TOC listet alle Abschnitte und Bloecke',want.every(x=>ids.includes(x))&&ids.length===want.length,ids.length+' Eintraege');
const heads=await p.$$eval('#toc-list .toc-h',n=>n.map(x=>x.textContent));
ok('TOC nach Seitenbereich gruppiert',heads.length>=4&&heads.includes('Überblick und Karte'),heads.join(' | '));
ok('TOC: Karte steht vor den Eingaben',ids.indexOf('s-map')>ids.indexOf('s0')&&ids.indexOf('s-map')<ids.indexOf('s1'),ids.slice(0,5).join(','));
const chips=await p.$$eval('#toc-list [data-toc] .lvc',n=>n.length);
ok('Ebene-3-Eintraege tragen auf Ebene 2 ein Ebenen-Chip',chips>=6,chips+' Chips');
const scrollX=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
ok('1240 px kein Ueberlauf',scrollX.sw<=scrollX.cw+1,JSON.stringify(scrollX));
await p.screenshot({path:DIR+'toc-1240.png',fullPage:false});

/* ---------- 2) Klick springt zum Ziel, oeffnet Details, wechselt die Ebene ---------- */
const jump=async(id,exp)=>{
  await p.click('#toc-list [data-toc="'+id+'"]');await p.waitForTimeout(900);
  const r=await p.evaluate(i=>{const el=document.getElementById(i);const b=el.getBoundingClientRect();
    const d=el.tagName==='DETAILS'?el.open:(el.closest('details')?el.closest('details').open:true);
    return {top:Math.round(b.top),vis:b.height>0&&b.width>0,open:d,lv:S.level};},id);
  ok('Sprung '+id,r.vis&&r.open&&r.top>-40&&r.top<300&&(exp===undefined||r.lv===exp),JSON.stringify(r));
};
for(const id of ['s-map','s1','s2','s3','kpi-allowed','certainty','rclasses','nulloption','cashout','capex','decision-path','readguide'])await jump(id,2);
/* Ebene-3-Eintraege wechseln die Ebene und oeffnen das geschlossene details */
await p.click('.stepper [data-level="2"]');await p.waitForTimeout(600);
await p.evaluate(()=>{const d=document.getElementById('d-tree');if(d)d.open=false;});
for(const id of ['d-s4','d-charts','d-tree','d-text','d-s6','d-anhang'])await jump(id,3);

/* ---------- 3) Alles aufklappen / zuklappen ---------- */
await p.click('.stepper [data-level="2"]');await p.waitForTimeout(600);
await p.click('#toc-open-all');await p.waitForTimeout(900);
let st=await p.evaluate(()=>({lv:S.level,closed:[...document.querySelectorAll('details.lvl3')].filter(d=>!d.open).length,all:document.querySelectorAll('details.lvl3').length,
  other:[...document.querySelectorAll('.wrap details:not(.lvl3)')].filter(d=>!d.open).length}));
ok('Alles aufklappen oeffnet jeden details.lvl3',st.closed===0&&st.all>0&&st.lv===3,JSON.stringify(st));
ok('Alles aufklappen oeffnet auch die uebrigen Details',st.other===0,'noch zu: '+st.other);
await p.click('#toc-close-all');await p.waitForTimeout(700);
st=await p.evaluate(()=>({open:[...document.querySelectorAll('.wrap details')].filter(d=>d.open).length}));
ok('Alles zuklappen schliesst alles',st.open===0,JSON.stringify(st));

/* ---------- 4) Graph als Einstieg: Werkzeugleiste und Inhaltsverzeichnis ---------- */
await p.click('.stepper [data-level="1"]');await p.waitForTimeout(600);
await p.click('#btn-graph');await p.waitForTimeout(1100);
let g=await p.evaluate(()=>{const sec=document.getElementById('s-map'),s=document.getElementById('graph-svg');
  const r=s.getBoundingClientRect();return {lv:S.level,sec:!!sec&&sec.getBoundingClientRect().height>0,visible:r.height>0&&r.width>0,nodes:document.querySelectorAll('#graph-svg [data-n]').length};});
ok('Knopf „Modell als Karte“ fuehrt auf Ebene 2 zur Karte',g.lv===2&&g.sec&&g.visible&&g.nodes>20,JSON.stringify(g));
await p.click('.stepper [data-level="2"]');await p.waitForTimeout(600);
await p.click('#toc-list [data-toc="s-map"]');await p.waitForTimeout(1100);
g=await p.evaluate(()=>({lv:S.level,visible:document.getElementById('graph-svg').getBoundingClientRect().height>0}));
ok('TOC-Eintrag fuehrt zur Karte, ohne die Ebene zu heben',g.lv===2&&g.visible,JSON.stringify(g));

/* ---------- 5) Auswahl im Graphen: Eingabe, Gruppe, Posten ---------- */
const pick=async nid=>{
  await p.keyboard.press('Escape');await p.waitForTimeout(250);
  await p.evaluate(n=>{const e=document.querySelector('#graph-svg [data-n="'+n+'"]');if(e)e.scrollIntoView({block:'center'});},nid);
  await p.waitForTimeout(250);
  await p.click('#graph-svg [data-n="'+nid+'"]');await p.waitForTimeout(500);
  return p.evaluate(n=>({sel:graphSel,pressed:document.querySelector('#graph-svg [data-n="'+n+'"]').getAttribute('aria-pressed'),
    dim:document.querySelectorAll('#graph-svg .g-dim').length,hi:document.querySelectorAll('#graph-svg .g-hi').length,
    txt:document.getElementById('graph-explain').textContent.replace(/\s+/g,' ').trim(),
    pop:!document.getElementById('graph-pop').hidden,
    popTitle:(document.getElementById('gpop-title')||{}).textContent||''}),nid);};
let r=await pick('in:creators');
ok('Eingabe: Auswahl, Hervorhebung, Erklaertext',r.sel==='in:creators'&&r.pressed==='true'&&r.dim>5&&r.txt.length>140&&/Eingabe/.test(r.txt),r.txt.slice(0,150));
ok('Eingabe: keine erfundene Sensitivitaet',/bewusst keine Zahl/.test(r.txt));
ok('Eingabe: Popup offen',r.pop,r.popTitle);
await p.screenshot({path:DIR+'graph-pop-input.png'});

r=await pick('grp:rate');
ok('Gruppe: Auswahl und Erklaertext',r.sel==='grp:rate'&&r.dim>5&&/Annahmen-Gruppe/.test(r.txt),r.txt.slice(0,170));
ok('Gruppe: Sensitivitaet „10 % hoeher“ mit Betrag',/10 % h(ö|o)her/.test(r.txt)&&/Gesamtkosten/.test(r.txt),(r.txt.match(/Sensitivit.{0,220}/)||[''])[0]);
ok('Gruppe: Popup mit Annahmen-Zeilen',r.pop);
let rows=await p.$$eval('#gpop-body .a-row input[type=number]',n=>n.length);
ok('Gruppe: editierbare Dreipunkt-Zeilen im Popup',rows>=6,rows+' Felder');
await p.screenshot({path:DIR+'graph-pop-group.png'});
const gEl=await p.$('#s-map');await gEl.screenshot({path:DIR+'graph-sel-stundensaetze.png'});

r=await pick('item:build');
ok('Posten: Auswahl und Erklaertext',r.sel==='item:build'&&r.dim>5&&/Kostenposten/.test(r.txt),r.txt.slice(0,170));
ok('Posten: nennt die Gruppe, aus der er entsteht',/entsteht aus der Gruppe/.test(r.txt));
ok('Posten: Popup nicht editierbar',(await p.$$eval('#gpop-body input',n=>n.length))===0);
await p.screenshot({path:DIR+'graph-pop-item.png'});
await gEl.screenshot({path:DIR+'graph-sel-kostenposten.png'});

/* ---------- 6) Zweiter Klick und Escape heben auf ---------- */
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="item:build"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
await p.click('#graph-svg [data-n="item:build"]');await p.waitForTimeout(400);
r=await p.evaluate(()=>({sel:graphSel,dim:document.querySelectorAll('#graph-svg .g-dim').length,pop:!document.getElementById('graph-pop').hidden}));
ok('Zweiter Klick hebt auf',r.sel===null&&r.dim===0&&!r.pop,JSON.stringify(r));
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="grp:hours"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
await p.click('#graph-svg [data-n="grp:hours"]');await p.waitForTimeout(400);
await p.keyboard.press('Escape');await p.waitForTimeout(400);
r=await p.evaluate(()=>({sel:graphSel,dim:document.querySelectorAll('#graph-svg .g-dim').length,pop:!document.getElementById('graph-pop').hidden}));
ok('Escape hebt auf und schliesst das Popup',r.sel===null&&r.dim===0&&!r.pop,JSON.stringify(r));
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="grp:hours"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
await p.click('#graph-svg [data-n="grp:hours"]');await p.waitForTimeout(400);
await p.click('#graph-note');await p.waitForTimeout(400);
r=await p.evaluate(()=>({pop:!document.getElementById('graph-pop').hidden}));
ok('Klick daneben schliesst das Popup',!r.pop);

/* ---------- 7) Tastaturbedienung ---------- */
r=await p.evaluate(()=>{const el=document.querySelector('#graph-svg [data-n="in:viewers"]');el.focus();
  return {tag:el.tagName,role:el.getAttribute('role'),tab:el.getAttribute('tabindex'),focused:document.activeElement===el};});
ok('Knoten fokussierbar mit role und tabindex',r.role==='button'&&r.tab==='0'&&r.focused,JSON.stringify(r));
await p.keyboard.press('Enter');await p.waitForTimeout(500);
r=await p.evaluate(()=>({sel:graphSel,pop:!document.getElementById('graph-pop').hidden,inPop:!!document.getElementById('graph-pop').contains(document.activeElement)}));
ok('Enter waehlt aus, Fokus springt ins Popup',r.sel==='in:viewers'&&r.pop&&r.inPop,JSON.stringify(r));
await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.waitForTimeout(200);
ok('Tab bleibt im Popup',await p.evaluate(()=>document.getElementById('graph-pop').contains(document.activeElement)));
await p.keyboard.press('Escape');await p.waitForTimeout(400);
ok('Escape gibt den Fokus zurueck',await p.evaluate(()=>document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.n==='in:viewers'));
await p.evaluate(()=>{const el=document.querySelector('#graph-svg [data-n="item:lic"]');el.focus();});
await p.keyboard.press(' ');await p.waitForTimeout(400);
ok('Leertaste waehlt aus',await p.evaluate(()=>graphSel==='item:lic'));
await p.keyboard.press('Escape');await p.waitForTimeout(300);

/* ---------- 8) Popup bearbeitet: Ergebnis und Share-Link ---------- */
const hashOf=()=>p.evaluate(()=>location.hash);
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="in:creators"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
await p.click('#graph-svg [data-n="in:creators"]');await p.waitForTimeout(500);
const before={h:await hashOf(),s:await p.evaluate(()=>({c:S.creators,p50:lastSim.paid.p50}))};
await p.fill('#gpop-body input[data-gpnum="n-creators"]','12');
await p.evaluate(()=>document.querySelector('#gpop-body input[data-gpnum="n-creators"]').dispatchEvent(new Event('change',{bubbles:true})));
await p.waitForTimeout(900);
const after={h:await hashOf(),s:await p.evaluate(()=>({c:S.creators,p50:lastSim.paid.p50}))};
ok('Popup-Aenderung wirkt auf Zustand und Ergebnis',after.s.c===12&&after.s.p50!==before.s.p50,JSON.stringify([before.s,after.s]));
ok('Popup-Aenderung wirkt auf den Share-Link',after.h!==before.h&&after.h.length>10);
ok('Share-Link sv 5 (v0.18)',await p.evaluate(()=>JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3))))).sv===5));
const eff=await p.evaluate(()=>document.getElementById('gpop-eff').textContent.replace(/\s+/g,' '));
ok('Popup zeigt Wirkung vorher/jetzt',/vorher/.test(eff)&&/jetzt/.test(eff),eff.slice(0,120));
await p.click('#gpop-reset');await p.waitForTimeout(900);
ok('Zuruecksetzen stellt den Ausgangswert her',await p.evaluate(c=>S.creators===c,before.s.c),'zurueck auf '+before.s.c);
await p.keyboard.press('Escape');await p.waitForTimeout(300);

/* Gruppen-Popup: Annahme aendern und zuruecksetzen */
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="grp:hours"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
await p.click('#graph-svg [data-n="grp:hours"]');await p.waitForTimeout(500);
const gb=await p.evaluate(()=>({v:JSON.stringify(S.p[graphOpt].firstH||S.p[graphOpt].setupH),p50:lastSim[graphOpt].p50}));
const first=await p.$('#gpop-body .a-row input[type=number]');
const fv=await first.inputValue();
await first.fill(String(Math.max(1,(+fv||1)*3)));
await p.evaluate(()=>{const i=document.querySelector('#gpop-body .a-row input[type=number]');i.dispatchEvent(new Event('change',{bubbles:true}));});
await p.waitForTimeout(900);
const ga=await p.evaluate(()=>({p50:lastSim[graphOpt].p50}));
ok('Annahme im Gruppen-Popup aenderbar',ga.p50!==gb.p50,gb.p50+' -> '+ga.p50);
await p.click('#gpop-reset');await p.waitForTimeout(900);
ok('Zuruecksetzen der Gruppen-Annahmen',Math.abs((await p.evaluate(()=>lastSim[graphOpt].p50))-gb.p50)<1);
await p.keyboard.press('Escape');await p.waitForTimeout(300);

/* ---------- 9) Gefuehrter Einstieg: dritte Option ---------- */
await p.evaluate(()=>wizStart());await p.waitForTimeout(500);
for(let i=0;i<6;i++){await p.click('#wiz-next');await p.waitForTimeout(250);}
ok('Einstieg hat die Option „Modell als Karte“',await p.isVisible('[data-wact="graph"]'));
await p.click('[data-wact="graph"]');await p.waitForTimeout(1300);
g=await p.evaluate(()=>({lv:S.level,vis:document.getElementById('graph-svg').getBoundingClientRect().height>0}));
ok('Einstieg-Option fuehrt auf Ebene 2 zur Karte',g.lv===2&&g.vis,JSON.stringify(g));

/* ---------- 10) Breiten 1100 px ---------- */
const p2=await b.newPage({viewport:{width:1100,height:900}});watch(p2);
await p2.goto(U);await p2.waitForTimeout(1200);await skip(p2);
for(const lv of [2,3]){await p2.click('.stepper [data-level="'+lv+'"]');await p2.waitForTimeout(700);
  if(lv===3)await p2.evaluate(()=>{document.getElementById('d-tree').open=true;});
  await p2.waitForTimeout(400);
  const o=await p2.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,toc:document.getElementById('toc-panel').getBoundingClientRect().width}));
  ok('1100 px lv'+lv+' kein Ueberlauf',o.sw<=o.cw+1,JSON.stringify(o));}
await p2.close();

/* ---------- 11) Mobil 390 px ---------- */
const m=await b.newPage({viewport:{width:390,height:844}});watch(m);
await m.goto(U);await m.waitForTimeout(1200);await skip(m);
await m.click('.stepper [data-level="2"]');await m.waitForTimeout(700);
ok('390 px: TOC als aufklappbarer Kopfbereich, zu',await m.isVisible('#toc-toggle')&&!(await m.isVisible('#toc-panel')));
await m.click('#toc-toggle');await m.waitForTimeout(400);
ok('390 px: TOC aufklappbar',await m.isVisible('#toc-panel'));
for(const lv of [1,2,3]){await m.click('.stepper [data-level="'+lv+'"]');await m.waitForTimeout(800);
  if(lv===3)await m.evaluate(()=>{document.getElementById('d-tree').open=true;});
  await m.waitForTimeout(400);
  const o=await m.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  ok('390 px lv'+lv+' kein Ueberlauf',o.sw<=o.cw+1,JSON.stringify(o));}
await m.evaluate(()=>{const el=document.querySelector('#graph-svg [data-n="grp:lic"]');el.scrollIntoView();el.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
await m.waitForTimeout(600);
const mp=await m.evaluate(()=>{const p=document.getElementById('graph-pop');const r=p.getBoundingClientRect();
  return {hidden:p.hidden,pos:getComputedStyle(p).position,w:Math.round(r.width),right:Math.round(r.right),cw:document.documentElement.clientWidth};});
ok('390 px: Popup als vollbreite Karte statt schwebend',!mp.hidden&&mp.pos==='static'&&mp.right<=mp.cw+1,JSON.stringify(mp));
const o=await m.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
ok('390 px mit Popup kein Ueberlauf',o.sw<=o.cw+1,JSON.stringify(o));
await m.click('.stepper [data-level="2"]');await m.waitForTimeout(600);
await m.click('#toc-toggle');await m.waitForTimeout(400);
await m.screenshot({path:DIR+'mobile-390.png',fullPage:false});
await m.close();

/* ---------- 12) Druckansicht ohne Seitenleiste und ohne Popup ---------- */
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="grp:gov"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
await p.click('#graph-svg [data-n="grp:gov"]');await p.waitForTimeout(400);
await p.emulateMedia({media:'print'});await p.waitForTimeout(400);
const pr=await p.evaluate(()=>({toc:getComputedStyle(document.getElementById('toc')).display,pop:getComputedStyle(document.getElementById('graph-pop')).display,
  wrap:getComputedStyle(document.querySelector('.wrap')).display}));
ok('Druck: keine Seitenleiste, kein Popup, einspaltig',pr.toc==='none'&&pr.pop==='none'&&pr.wrap==='block',JSON.stringify(pr));
await p.emulateMedia({media:'screen'});await p.waitForTimeout(300);

await R.finish(b);})();
