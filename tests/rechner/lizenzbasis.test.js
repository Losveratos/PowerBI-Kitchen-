/* v0.18 — Lizenzbasis getrennt vom Mengengeruest (globale Annahme licViewerShare).
   Prueft Feld, Wirkung auf die Lizenzkosten, Rueckwaertskompatibilitaet (100 % = v0.17-Zahlen),
   Kopplung an „IBCS verbindlich“, Share-Link und Bedienung im Graph-Popup.
   Herkunft: Scratchpad-Skript test_v18.js (Stand v0.18).
   Start:  node tests/rechner/lizenzbasis.test.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus lib/harness.js. */
const { chromium, URL: U, artifactDir, skipWizard: skip, reporter } = require('./lib/harness');
const DIR = artifactDir('lizenzbasis');
const R = reporter('lizenzbasis');
const ok = R.ok, watch = R.watch, errs = R.errs;

/* Referenz: vor der v0.18-Aenderung gemessene v0.17-Zahlen (P50 je Ansatz, be = Verhandlungsgrenze).
   `be` ist kein Rechenkern-Ergebnis im engeren Sinn, sondern haengt daran, gegen welchen
   Stunden-Ansatz verglichen wird. Wenn diese Auswahl bewusst geaendert wird, ist die
   be-Zeile hier neu zu messen — die vier Gesamtkosten duerfen sich dabei NICHT bewegen. */
const REF={
  pilot:{paid:39660,oss:53265,deneb:59327,core:79563,be:47},
  mittelstand:{paid:70424,oss:74480,deneb:89562,core:112474,be:56},
  konzern:{paid:726050,oss:531710,deneb:613913,core:803820,be:580},
};
const setShare=async(p,v)=>{await p.evaluate(x=>{S.g.licViewerShare=[x,x,x];update();},v);await p.waitForTimeout(400);};
const snap=p=>p.evaluate(()=>{const o={};['paid','oss','deneb','core'].forEach(k=>{const e=expected(k);
  o[k]={total:Math.round(e.total*100)/100,lic:Math.round(e.licPrice*100)/100,licAdm:Math.round(e.licAdminC*100)/100,
        sup:Math.round(e.licSupport*100)/100,cap:Math.round(e.capacityC*100)/100,
        gov:Math.round(e.gov*100)/100,roll:Math.round(e.rollout*100)/100,build:Math.round(e.build*100)/100,
        train:Math.round(e.train*100)/100,maint:Math.round(e.maint*100)/100,p50:Math.round(lastSim[k].p50)};});
  o.be=licenseBreakEven();return o;});

(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1280,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);

/* ---------- 1) Annahme in Ebene 3 sichtbar und editierbar ---------- */
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(600);
const row=await p.evaluate(()=>{const i=document.querySelector('input[data-scope="g"][data-id="licViewerShare"]');
  if(!i)return null;const r=i.closest('.a-row');const n=r.querySelectorAll('input[data-id="licViewerShare"]');
  const rc=r.getBoundingClientRect();
  return {lbl:r.querySelector('.lbl').textContent.slice(0,60),n:n.length,vals:[...n].map(x=>x.value),
          min:i.getAttribute('min'),max:i.getAttribute('max'),badge:r.querySelector('.badge').textContent,
          visible:rc.width>0&&rc.height>0};});
ok('Annahme steht in Ebene 3 mit drei Feldern',!!row&&row.n===3&&row.visible,row?JSON.stringify(row):'nicht gefunden');
ok('Voreinstellung 60 / 85 / 100',row&&row.vals.join()==='60,85,100',row&&row.vals.join());
ok('min 0 und max 100 am Feld',row&&row.min==='0'&&row.max==='100',row&&(row.min+'/'+row.max));
ok('Quellen-Badge E (Autoren-Schaetzung)',row&&row.badge==='E',row&&row.badge);
{const before=await p.evaluate(()=>lastSim.paid.p50);
 await p.fill('input[data-scope="g"][data-id="licViewerShare"][data-i="1"]','70');
 await p.evaluate(()=>document.querySelector('input[data-scope="g"][data-id="licViewerShare"][data-i="1"]').dispatchEvent(new Event('change',{bubbles:true})));
 await p.waitForTimeout(600);
 const after=await p.evaluate(()=>({v:S.g.licViewerShare.join(),p50:lastSim.paid.p50}));
 ok('Feld editierbar, wirkt auf Zustand und Ergebnis',after.v==='60,70,100'&&after.p50<before,after.v+' | '+Math.round(before)+' -> '+Math.round(after.p50));}
await p.evaluate(()=>{S.g.licViewerShare=[60,85,100];update();});await p.waitForTimeout(400);

/* ---------- 2) 100 % reproduziert exakt die v0.17-Zahlen ---------- */
for(const pre of Object.keys(REF)){
  await p.click('[data-preset="'+pre+'"]');await p.waitForTimeout(500);
  await setShare(p,100);
  const s=await snap(p);
  const same=['paid','oss','deneb','core'].every(k=>s[k].p50===REF[pre][k]);
  /* Getrennt gefuehrt: die Gesamtkosten sind die eigentliche Zusicherung von v0.18.
     Die Verhandlungsgrenze haengt zusaetzlich davon ab, GEGEN WELCHEN Stunden-Ansatz
     gerechnet wird — aendert sich dessen Auswahl (z. B. weil nur noch zulaessige
     Ansaetze zaehlen), verschiebt sie sich, ohne dass die Kosten sich aendern. */
  ok('100 % = v0.17, Gesamtkosten ('+pre+')',same,
     ['paid','oss','deneb','core'].map(k=>k+' '+s[k].p50+'/'+REF[pre][k]).join(' '));
  ok('100 % = v0.17, Verhandlungsgrenze ('+pre+')',s.be===REF[pre].be,'be '+s.be+'/'+REF[pre].be);}

/* ---------- 3) Senken wirkt nur auf Lizenz und Lizenz-Administration ---------- */
await p.click('[data-preset="mittelstand"]');await p.waitForTimeout(500);
await setShare(p,100);const hi=await snap(p);
await setShare(p,60);const lo=await snap(p);
ok('Paid: Lizenz sinkt',lo.paid.lic<hi.paid.lic,hi.paid.lic+' -> '+lo.paid.lic);
ok('Paid: Lizenz-Administration sinkt',lo.paid.licAdm<hi.paid.licAdm,hi.paid.licAdm+' -> '+lo.paid.licAdm);
ok('Paid: Governance und Anwender-Support unveraendert',lo.paid.gov===hi.paid.gov,hi.paid.gov+' -> '+lo.paid.gov);
ok('Paid: Support, Capacity, Rollout, Aufbau, Schulung, Wartung unveraendert',
   ['sup','cap','roll','build','train','maint'].every(k=>lo.paid[k]===hi.paid[k]),
   ['sup','cap','roll','build','train','maint'].map(k=>k+' '+hi.paid[k]+'/'+lo.paid[k]).join(' '));
ok('Paid: Gesamtkosten sinken genau um Lizenz + Lizenz-Administration',
   Math.abs((hi.paid.total-lo.paid.total)-((hi.paid.lic-lo.paid.lic)+(hi.paid.licAdm-lo.paid.licAdm)))<0.5,
   'Δtotal '+Math.round(hi.paid.total-lo.paid.total)+' vs Δlic+adm '+Math.round((hi.paid.lic-lo.paid.lic)+(hi.paid.licAdm-lo.paid.licAdm)));
ok('oss, deneb, core vollstaendig unveraendert',
   ['oss','deneb','core'].every(k=>JSON.stringify(lo[k])===JSON.stringify(hi[k])),
   ['oss','deneb','core'].map(k=>k+' '+hi[k].total+'/'+lo[k].total).join(' '));
ok('Break-even steigt (wirkt zugunsten von Paid)',lo.be>hi.be,hi.be+' -> '+lo.be);

/* ---------- 4) IBCS-Pflicht hebt die Basis auf 100 % ---------- */
await p.evaluate(()=>{S.ibcsAll=true;update();});await p.waitForTimeout(500);
const ib60=await p.evaluate(()=>({lic:Math.round(expected('paid').licPrice*100)/100,adm:Math.round(expected('paid').licAdminC*100)/100}));
await setShare(p,100);
const ib100=await p.evaluate(()=>({lic:Math.round(expected('paid').licPrice*100)/100,adm:Math.round(expected('paid').licAdminC*100)/100}));
ok('Mit IBCS-Pflicht ist der Anteil wirkungslos (immer 100 %)',ib60.lic===ib100.lic&&ib60.adm===ib100.adm,JSON.stringify([ib60,ib100]));
await setShare(p,60);
const hint=await p.evaluate(()=>document.getElementById('rc-hint').textContent);
ok('Report-Klassen-Karte nennt die Anhebung durch die Pflicht',/Lizenzbasis auf alle Viewer/.test(hint),hint.slice(-150));
await p.evaluate(()=>{S.ibcsAll=false;update();});await p.waitForTimeout(500);
const hint2=await p.evaluate(()=>document.getElementById('rc-hint').textContent);
ok('Report-Klassen-Karte nennt die Lizenzbasis in Zahlen',/Lizenzbasis bei 3rd-Party paid: \d+ von \d+ Viewern plus \d+ Ersteller/.test(hint2),hint2.slice(-190));

/* ---------- 5) Share-Link: neu traegt den Wert, alt (sv 4) rechnet unveraendert ---------- */
await setShare(p,60);
const link=await p.evaluate(()=>location.hash);
const st=await p.evaluate(()=>JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3))))));
ok('Neuer Link ist sv 5',st.sv===5,'sv '+st.sv);
ok('Neuer Link traegt licViewerShare',JSON.stringify(st.g.licViewerShare)==='[60,60,60]',JSON.stringify(st.g.licViewerShare));
/* alter Link: sv 4, ohne den neuen Eintrag */
const old=await p.evaluate(()=>{const s=JSON.parse(decodeURIComponent(escape(atob(location.hash.slice(3)))));
  s.sv=4;delete s.g.licViewerShare;return '#s='+btoa(unescape(encodeURIComponent(JSON.stringify(s))));});
await p.goto(U+old);await p.reload({waitUntil:'load'});await p.waitForTimeout(1000);await skip(p);
const oldSt=await p.evaluate(()=>({g:S.g.licViewerShare.join(),paid:Math.round(lastSim.paid.p50),oss:Math.round(lastSim.oss.p50)}));
ok('Alter Link setzt die Lizenzbasis auf 100 %',oldSt.g==='100,100,100',oldSt.g);
ok('Alter Link rechnet wie v0.17',oldSt.paid===REF.mittelstand.paid&&oldSt.oss===REF.mittelstand.oss,JSON.stringify(oldSt));
await p.waitForTimeout(1400);
const tst=await p.evaluate(()=>document.getElementById('toast').textContent);
ok('Alter Link zeigt einen Hinweis auf die alte Lizenzbasis',/Lizenzbasis/.test(tst),tst.slice(0,120));
/* neuer Link laedt den Wert zurueck */
await p.goto(U+link);await p.reload({waitUntil:'load'});await p.waitForTimeout(1000);await skip(p);
ok('Neuer Link laedt den Wert zurueck',await p.evaluate(()=>S.g.licViewerShare.join()==='60,60,60'),await p.evaluate(()=>S.g.licViewerShare.join()));

/* ---------- 6) Site-Lizenz unbeeinflusst ---------- */
await p.goto(U);await p.evaluate(()=>{location.hash='';});await p.reload({waitUntil:'load'});await p.waitForTimeout(900);await skip(p);
await p.click('[data-preset="konzern"]');await p.waitForTimeout(500);
await p.evaluate(()=>{S.licModel='site';update();});await p.waitForTimeout(500);
await setShare(p,100);const sHi=await snap(p);
await setShare(p,40);const sLo=await snap(p);
ok('Site-Lizenz: Paid vollstaendig unveraendert',JSON.stringify(sHi.paid)===JSON.stringify(sLo.paid),
   'total '+sHi.paid.total+' -> '+sLo.paid.total+' · licAdm '+sHi.paid.licAdm);
ok('Site-Lizenz: Lizenz-Administration ist 0',sHi.paid.licAdm===0,String(sHi.paid.licAdm));

/* ---------- 7) Wirkungsgraph: Annahme in der Gruppe „Lizenzpreis und Staffel“ ---------- */
await p.goto(U);await p.evaluate(()=>{location.hash='';});await p.reload({waitUntil:'load'});await p.waitForTimeout(900);await skip(p);
await p.click('#btn-graph');await p.waitForTimeout(1200);
await p.evaluate(()=>{graphOpt='paid';drawGraph();});await p.waitForTimeout(500);
await p.evaluate(()=>document.querySelector('#graph-svg [data-n="grp:lic"]').scrollIntoView({block:'center'}));await p.waitForTimeout(300);
await p.click('#graph-svg [data-n="grp:lic"]');await p.waitForTimeout(700);
const inPop=await p.evaluate(()=>!!document.querySelector('#gpop-body input[data-id="licViewerShare"]'));
ok('Graph-Popup der Gruppe „Lizenzpreis und Staffel“ enthaelt die Annahme',inPop);
if(inPop){const b0=await p.evaluate(()=>lastSim.paid.p50);
  await p.fill('#gpop-body input[data-id="licViewerShare"][data-i="1"]','70');
  await p.evaluate(()=>document.querySelector('#gpop-body input[data-id="licViewerShare"][data-i="1"]').dispatchEvent(new Event('change',{bubbles:true})));
  await p.waitForTimeout(900);
  const a0=await p.evaluate(()=>({v:S.g.licViewerShare.join(),p50:lastSim.paid.p50}));
  ok('Graph-Popup editiert die Annahme und rechnet neu',a0.v==='60,70,100',a0.v+' | '+Math.round(b0)+' -> '+Math.round(a0.p50));
  ok('Graph-Popup: Ergebnis sinkt',a0.p50<b0,Math.round(b0)+' -> '+Math.round(a0.p50));
  await p.click('#gpop-reset');await p.waitForTimeout(800);
  ok('Graph-Popup zuruecksetzen',await p.evaluate(()=>S.g.licViewerShare.join()==='60,85,100'),await p.evaluate(()=>S.g.licViewerShare.join()));}
await p.keyboard.press('Escape');await p.waitForTimeout(300);

/* ---------- 8) Beschriftung der Verhandlungsgrenze ---------- */
await p.click('.stepper [data-level="2"]');await p.waitForTimeout(700);
const be=await p.evaluate(()=>document.getElementById('be-insight').textContent);
ok('Verhandlungsgrenze ist je lizenziertem Nutzer beschriftet',/je lizenziertem Nutzer und Jahr/.test(be),(be.match(/Verhandlungsgrenze.{0,120}/)||[''])[0]);
const dp=await p.evaluate(()=>document.getElementById('ov-drivers').textContent);
ok('Entscheidungspfad ebenso',/je lizenziertem Nutzer und Jahr/.test(dp));

await R.finish(b);})();
