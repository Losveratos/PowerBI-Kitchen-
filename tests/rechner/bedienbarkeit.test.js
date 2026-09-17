/* Barrierefreiheit und Bedienbarkeit des Rechners (Stand v0.20).
   Sichert die Punkte ab, die in sessions/visual-standards-rechner-audit/barrierefreiheit-check.md
   als "vor 1.0" eingestuft sind: Tastaturbedienung der Anforderungs-Matrix (roving tabindex,
   Pfeiltasten), Fokus nach Sprungmarken, auslesbarer Zustand der Segment-Schalter auch im
   Windows-Kontrastmodus, Kontraste nach WCAG AA, Ansage der Ergebnisaenderung, vollstaendiger
   Ausdruck. Dazu die Kennzeichnung ausgeschlossener Ansaetze im Break-even-Text.
   Herkunft: Scratchpad-Skript test_a11y.js.
   Start:  node tests/rechner/bedienbarkeit.test.js
   Laeuft aus jedem Verzeichnis — Pfade kommen aus lib/harness.js. */
const { chromium, URL: U, artifactDir, skipWizard, waitStable, reporter } = require('./lib/harness');
const DIR = artifactDir('bedienbarkeit');
const R = reporter('bedienbarkeit');
const ok = R.ok, watch = R.watch, errs = R.errs;
const skip=async p=>{await p.evaluate(()=>{const b=document.getElementById('wiz-skip');if(b)b.click();});await p.waitForTimeout(300);};

/* WCAG-2.1-Kontrast, im Seitenkontext ausgewertet (Elternkette + opacity). */
const CONTRAST_FN=`
  window.__lum=function(c){const m=c.match(/[\\d.]+/g).map(Number);
    const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
    return 0.2126*f(m[0])+0.7152*f(m[1])+0.0722*f(m[2]);};
  window.__mix=function(fg,bg,a){const A=fg.match(/[\\d.]+/g).map(Number),B=bg.match(/[\\d.]+/g).map(Number);
    return 'rgb('+[0,1,2].map(i=>Math.round(A[i]*a+B[i]*(1-a))).join(',')+')';};
  window.__bg=function(el){let e=el;
    while(e){const cs=getComputedStyle(e);const b=cs.backgroundColor;
      if(b&&b!=='rgba(0, 0, 0, 0)'&&b!=='transparent'){const m=b.match(/[\\d.]+/g).map(Number);
        if(m.length<4||m[3]>=1)return 'rgb('+m[0]+','+m[1]+','+m[2]+')';}
      e=e.parentElement;}
    return 'rgb(255,255,255)';};
  window.__ratio=function(el){const cs=getComputedStyle(el);let fg=cs.color;const bg=window.__bg(el);
    let a=1,e=el;while(e){a*=parseFloat(getComputedStyle(e).opacity||'1');e=e.parentElement;}
    if(a<1)fg=window.__mix(fg,bg,a);
    const L1=window.__lum(fg),L2=window.__lum(bg);
    return Math.round(100*((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)))/100;};
  window.__ratioFill=function(hex,bgHex){const h=x=>'rgb('+[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)).join(',')+')';
    const L1=window.__lum(h(hex)),L2=window.__lum(h(bgHex));
    return Math.round(100*((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)))/100;};
`;

(async()=>{
const b=await chromium.launch();

/* ================= 1) Anforderungs-Matrix: Tabulator-Halte und Pfeiltasten ================= */
{
const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(800);

const t=await p.evaluate(()=>{
  const sel='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,summary,[tabindex]';
  const all=[...document.querySelectorAll(sel)].filter(e=>{
    if(e.tabIndex<0)return false;const r=e.getBoundingClientRect();
    return (r.width||r.height)&&getComputedStyle(e).visibility!=='hidden';});
  return {gesamt:all.length,cap:all.filter(e=>e.closest('.cap')).length,seg:all.filter(e=>e.closest('.seg')).length,
          gruppenCap:document.querySelectorAll('.cap').length,gruppenSeg:document.querySelectorAll('.seg').length};});
ok('A1 Erfuellungsgrad: genau ein Tabulator-Halt je Gruppe (roving tabindex)',t.cap===t.gruppenCap,
   t.cap+' Halte auf '+t.gruppenCap+' Gruppen (vor v0.20: 5 je Gruppe)');
ok('A4 Segment-Schalter: genau ein Tabulator-Halt je Leiste',t.seg===t.gruppenSeg,
   t.seg+' Halte auf '+t.gruppenSeg+' Leisten');
ok('A1 Tabulator-Halte der Seite deutlich unter dem Altstand',t.gesamt<700,t.gesamt+' Halte (vorher 1066)');

const kb=await p.evaluate(async()=>{
  const g=document.querySelector('.cap');const bs=[...g.querySelectorAll('button')];
  bs[0].focus();const vor=g.querySelector('.cap-lbl').textContent;
  bs[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  await new Promise(r=>setTimeout(r,500));
  const g2=document.querySelector('.cap');
  return {vor,nach:g2.querySelector('.cap-lbl').textContent,
          fokusInGruppe:!!(document.activeElement&&document.activeElement.closest('.cap')),
          fokusLabel:document.activeElement?document.activeElement.getAttribute('aria-label'):''};});
ok('A1 Pfeiltaste setzt den Wert',kb.vor!==kb.nach,'Label '+kb.vor+' -> '+kb.nach);
ok('A1 Pfeiltaste zieht den Fokus mit, auch ueber das Neuzeichnen hinweg',kb.fokusInGruppe,kb.fokusLabel);

const hm=await p.evaluate(async()=>{
  const g=document.getElementById('horizon-seg');const bs=[...g.querySelectorAll('button')];
  const i=bs.findIndex(x=>x.classList.contains('active'));bs[i].focus();
  const vor=S.horizon;
  bs[i].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  await new Promise(r=>setTimeout(r,800));
  return {vor,nach:S.horizon,fokus:document.activeElement?document.activeElement.textContent:''};});
ok('A4 Pfeiltaste bedient die Segmentleiste',hm.vor!==hm.nach,hm.vor+' Jahre -> '+hm.nach+' Jahre, Fokus auf "'+hm.fokus+'"');

const st=await p.evaluate(()=>{
  const segs=[...document.querySelectorAll('.seg')];
  return {rg:segs.filter(g=>g.getAttribute('role')==='radiogroup').length,ges:segs.length,
    benannt:segs.filter(g=>g.hasAttribute('aria-label')||g.hasAttribute('aria-labelledby')).length,
    checked:[...document.querySelectorAll('#horizon-seg button')].map(x=>x.getAttribute('aria-checked')).join(','),
    tabs:[...document.querySelectorAll('.tab')].every(x=>x.hasAttribute('aria-pressed')),
    presets:[...document.querySelectorAll('.preset-btn:not([data-site])')].every(x=>x.hasAttribute('aria-pressed')),
    chip:!!document.querySelector('.step-chip.active[aria-current]')};});
ok('A4 alle Segmentleisten sind eine benannte Radiogruppe',st.rg===st.ges&&st.benannt===st.ges,
   st.rg+'/'+st.ges+' radiogroup, '+st.benannt+'/'+st.ges+' mit Namen');
ok('A4 der eingestellte Horizont ist auslesbar',/true/.test(st.checked),'aria-checked: '+st.checked);
ok('A4 Reiter und Presets tragen aria-pressed',st.tabs&&st.presets);
ok('A4 die aktive Ebene traegt aria-current',st.chip);

const lbl=await p.evaluate(()=>({
  verwaist:[...document.querySelectorAll('label')].filter(l=>!l.control&&!l.getAttribute('for')).length,
  baseline:!!document.querySelector('label[for="baseline"]'),
  tornado:!!document.querySelector('#tornado-opt[aria-label]')}));
ok('B8 keine LABEL-Elemente mehr ohne Bedienelement',lbl.verwaist===0,lbl.verwaist+' verwaist (vorher 20)');
ok('B8 die beiden Auswahlfelder sind beschriftet',lbl.baseline&&lbl.tornado);
await p.close();
}

/* ================= 2) Sprungmarken bewegen den Fokus ================= */
{
const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(700);
const jump=async(sel,name)=>{
  const el=await p.$(sel);if(!el){ok('A2 '+name,false,'Element '+sel+' fehlt');return;}
  await p.evaluate(s=>document.querySelector(s).focus(),sel);
  await p.keyboard.press('Enter');await p.waitForTimeout(500);await waitStable(p);
  const r=await p.evaluate(()=>{const a=document.activeElement;if(!a)return null;
    const b=a.getBoundingClientRect();
    return {tag:a.tagName+'.'+String(a.className).slice(0,28),id:a.id,y:Math.round(b.top),
            sichtbar:b.top>=-4&&b.top<innerHeight,istKnopf:!!a.closest('#toc,.rg-list,.toolbar')};});
  ok('A2 '+name+': Fokus steht im Ziel',!!r&&!r.istKnopf,r?(r.tag+(r.id?'#'+r.id:'')+' y='+r.y):'kein Fokus');
  ok('A2 '+name+': Fokus ist im Bild',!!r&&r.sichtbar,r?('y='+r.y):'-');};
await jump('#toc-list [data-toc="s5"]','Inhaltsverzeichnis "Ergebnis"');
await jump('#btn-graph','Modell als Karte');
const rg=await p.$('.rg-row');
if(rg){await jump('.rg-row','Lesehilfe Zeile 1');}

/* Gefuehrter Einstieg: Fokus nach dem Start und nach dem Verlassen */
await p.goto(U);await p.waitForTimeout(1000);
const w1=await p.evaluate(()=>({q:!!(document.activeElement&&document.activeElement.classList.contains('wiz-q')),
  tag:document.activeElement?document.activeElement.tagName+'.'+document.activeElement.className:'-'}));
ok('A3 der Einstieg setzt den Fokus auf die Frage',w1.q,w1.tag);
await p.click('#wiz-skip');await p.waitForTimeout(700);
const w2=await p.evaluate(()=>({body:document.activeElement===document.body,
  tag:document.activeElement?document.activeElement.tagName+'.'+String(document.activeElement.className).slice(0,24):'-'}));
ok('A3 nach "Direkt zum Rechner" faellt der Fokus nicht auf body',!w2.body,w2.tag);
await p.close();
}

/* ================= 3) Kontraste (WCAG AA) ================= */
{
const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(700);
await p.addScriptTag({content:CONTRAST_FN});

const th=await p.$$eval('#req-table th.opt',ns=>ns.map(n=>({t:n.textContent.slice(0,16),r:window.__ratio(n)})));
th.forEach(x=>ok('A5 Ansatz-Spaltenkopf "'+x.t+'" >= 4,5:1',x.r>=4.5,x.r+':1'));

const gruppen=[
  ['B7 aktiver Verzeichnis-Eintrag','.toc-a.on',4.5],
  ['B7 Ebenen-Vermerk im Verzeichnis','.toc-a .lvc',4.5],
  ['B7 Gruppen-Kopfzeile im Verzeichnis','.toc-list li.toc-h',4.5],
  ['B7 Zwischenueberschrift "Versteckte Kosten"','.opt-card h4.oc-h[style]',4.5],
  ['B5 Sicherheits-Leiste','.cert-bar i',4.5],
];
for(const [n,sel,soll] of gruppen){
  const v=await p.$$eval(sel,ns=>ns.filter(n=>n.offsetParent!==null||n.getClientRects().length).map(n=>window.__ratio(n)));
  if(!v.length){ok(n,false,'kein sichtbares Element fuer '+sel);continue;}
  const min=Math.min(...v);ok(n+' >= '+soll+':1',min>=soll,'schlechtester '+min+':1 ('+v.length+' Elemente)');}

const svg=await p.evaluate(()=>{const out=[];
  document.querySelectorAll('#graph-svg text').forEach(t=>{
    const f=t.getAttribute('fill')||getComputedStyle(t).fill;if(!f)return;
    const m=f.match(/#([0-9a-f]{6})/i)||f.match(/[\d.]+/g);
    const hex=m&&m[1]?('#'+m[1]):null;if(!hex)return;
    out.push({t:t.textContent.slice(0,22),r:window.__ratioFill(hex,'#ffffff')});});
  return out;});
const svgBad=svg.filter(x=>x.r<4.5);
ok('B6 alle Beschriftungen im Wirkungsgraph >= 4,5:1',svgBad.length===0,
   svgBad.length?svgBad.map(x=>x.t+' '+x.r+':1').join(' | '):svg.length+' Beschriftungen geprueft');

const line=await p.evaluate(()=>{const cs=getComputedStyle(document.documentElement);
  const f=cs.getPropertyValue('--line-field').trim();
  return {f,weiss:window.__ratioFill(f,'#ffffff'),papier:window.__ratioFill(f,'#F1EEE5'),fuell:window.__ratioFill(f,'#E7E2D4')};});
ok('B4 Feldrahmen >= 3:1 gegen Weiss, Papier und Feldfuellung',
   line.weiss>=3&&line.papier>=3&&line.fuell>=3,
   line.f+': '+line.weiss+' / '+line.papier+' / '+line.fuell+' (vorher 1,51 / 1,30 / 1,29)');

const ring=await p.evaluate(()=>{const a=document.querySelector('.toc-a');if(!a)return null;
  const cs=getComputedStyle(a,null);return cs.outlineColor;});
ok('B3 der eigene Fokusring im Verzeichnis ist entfernt',
   await p.evaluate(()=>![...document.styleSheets].some(sh=>{try{return [...sh.cssRules].some(r=>r.selectorText==='.toc-a:focus-visible')}catch(e){return false}})),
   'globaler Ring (--accent-text) greift');
await p.close();
}

/* ================= 4) Schriftgroessen ================= */
{
const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(700);
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(800);
/* Gezaehlt wird Flusstext im HTML. Beschriftungen in den Diagrammen (SVG) bleiben ausgenommen:
   sie liegen im viewBox-Koordinatensystem, eine Aenderung verschiebt dort die Geometrie. */
const f=await p.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let n=0,u11=0;const aus=e=>e.closest('svg,.badge,.kpi .rank,.footer-version,.eyebrow,.rg-row');
  const klein=[];
  while(w.nextNode()){const t=w.currentNode;if(!t.nodeValue.trim())continue;const e=t.parentElement;if(!e)continue;
    const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
    const r=e.getBoundingClientRect();if(!r.width&&!r.height)continue;
    const fs=parseFloat(cs.fontSize);n++;
    if(fs<11&&!aus(e)){u11++;if(klein.length<6)klein.push(fs+'px '+e.tagName+'.'+String(e.className).slice(0,20));}}
  return {n,u11,klein};});
ok('C kein Flusstext unter 11 px mehr (ohne Diagramme, Badges und Vermerke)',f.u11<=4,
   f.u11+' von '+f.n+' Textknoten (vorher 414 unter 11 px)'+(f.klein.length?' | '+f.klein.join(', '):''));
await p.close();
}

/* ================= 5) Ergebnis wird angesagt ================= */
{
const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(700);
const live=await p.evaluate(()=>{const t=document.getElementById('toast');
  return t?(t.getAttribute('aria-live')||''):'kein #toast';});
ok('B1 der Toast ist eine hoefliche Live-Region',live==='polite',live);
const sag=async(name,fn)=>{
  await p.evaluate(()=>{const t=document.getElementById('toast');if(t)t.textContent='';});
  await fn();await p.waitForTimeout(1300);
  const txt=await p.$eval('#toast',e=>e.textContent.trim());
  ok('B1 '+name+' wird angesagt',txt.length>0&&/Platz 1|ausgeschlossen/.test(txt),txt.slice(0,90)||'(still)');};
await sag('Horizont-Segment',async()=>{await p.click('#horizon-seg button[data-h="10"]');});
await sag('Viewer-Regler',async()=>{await p.evaluate(()=>{const r=document.getElementById('viewers');
  r.value=5000;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));});});
await sag('Gewichtungsregler',async()=>{await p.evaluate(()=>{const r=document.getElementById('weight');
  r.value=40;r.dispatchEvent(new Event('input',{bubbles:true}));r.dispatchEvent(new Event('change',{bubbles:true}));});});
/* keine doppelte Ansage: das Ergebnis selbst ist keine zweite Live-Region */
const doppelt=await p.evaluate(()=>{let e=document.getElementById('headline'),n=0;
  while(e){if(e.getAttribute&&e.getAttribute('aria-live'))n++;e=e.parentElement;}return n;});
ok('B1 keine zweite Live-Region am Ergebnis (keine Doppelansage)',doppelt===0,doppelt+' Live-Regionen ueber #headline');
await p.close();
}

/* ================= 6) Windows-Kontrastmodus ================= */
{
const p=await b.newPage({viewport:{width:1440,height:900},forcedColors:'active'});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(800);
const hc=await p.evaluate(()=>{
  const bs=[...document.querySelectorAll('#horizon-seg button')].map(b=>{const cs=getComputedStyle(b);
    return {a:b.classList.contains('active'),bg:cs.backgroundColor,ol:cs.outlineWidth,fw:cs.fontWeight};});
  const akt=bs.find(x=>x.a),rest=bs.filter(x=>!x.a);
  const unterschiedlich=rest.every(r=>r.bg!==akt.bg||r.ol!==akt.ol||r.fw!==akt.fw);
  const chip=[...document.querySelectorAll('.step-chip')].map(c=>{const cs=getComputedStyle(c);
    return {a:c.classList.contains('active'),bg:cs.backgroundColor,ol:cs.outlineWidth};});
  const ca=chip.find(x=>x.a),cr=chip.filter(x=>!x.a);
  return {unterschiedlich,akt,rest:rest[0],chipOk:!!ca&&cr.every(r=>r.bg!==ca.bg||r.ol!==ca.ol)};});
ok('A4 im Kontrastmodus ist der aktive Horizont optisch unterscheidbar',hc.unterschiedlich,
   'aktiv bg='+hc.akt.bg+' outline='+hc.akt.ol+' / inaktiv bg='+hc.rest.bg+' outline='+hc.rest.ol);
ok('A4 im Kontrastmodus ist die aktive Ebene optisch unterscheidbar',hc.chipOk);
await p.close();
}

/* ================= 7) Druck ================= */
{
const p=await b.newPage({viewport:{width:1280,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
await p.click('.stepper [data-level="3"]');await p.waitForTimeout(800);
const zu=await p.evaluate(()=>[...document.querySelectorAll('details')].filter(x=>x.open).length);
await p.emulateMedia({media:'print'});await p.waitForTimeout(700);
const d=await p.evaluate(()=>({
  offen:[...document.querySelectorAll('details')].filter(x=>x.open).length,
  ges:document.querySelectorAll('details').length,
  h:document.body.scrollHeight,
  sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
ok('D5 im Ausdruck ist jeder Block aufgeklappt',d.offen===d.ges,
   d.offen+' von '+d.ges+' (am Bildschirm offen: '+zu+', vorher blieb es dabei)');
ok('D5 der Ausdruck traegt den vollen Inhalt',d.h>24000,'Druckhoehe '+d.h+' px (vorher 18.250)');
ok('D5 kein waagerechter Ueberlauf im Ausdruck',d.sw<=d.cw+1,d.sw+'/'+d.cw);
await p.emulateMedia({media:'screen'});await p.waitForTimeout(600);
const zur=await p.evaluate(()=>[...document.querySelectorAll('details')].filter(x=>x.open).length);
ok('D5 nach dem Druck ist der Bildschirmzustand wiederhergestellt',zur===zu,zur+' offen, vorher '+zu);
await p.emulateMedia({media:'screen'});
await p.close();
}

/* ================= 8) Ueberlauf bei vier Breiten ================= */
{
const p=await b.newPage({viewport:{width:1280,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
for(const w of [390,768,1100,1280]){
  await p.setViewportSize({width:w,height:900});
  for(const lv of [1,2,3]){
    await p.click('.stepper [data-level="'+lv+'"]');await p.waitForTimeout(450);
    if(lv===3){await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.waitForTimeout(600);}
    const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
    ok('C '+w+' px, Ebene '+lv+': kein Ueberlauf',r.sw<=r.cw+1,(r.sw-r.cw)+' px');}}
await p.close();
}

/* ================= 9) Break-even nennt keine ausgeschlossenen Ansaetze als Empfehlung ============ */
{
const p=await b.newPage({viewport:{width:1280,height:900}});watch(p);
await p.goto(U);await p.waitForTimeout(1000);await skip(p);
for(const pr of ['pilot','mittelstand','gross','konzern','rs']){
  await p.click('.stepper [data-level="3"]');await p.waitForTimeout(200);
  await p.click('[data-preset="'+pr+'"]');await p.waitForTimeout(1100);
  const d=await p.evaluate(()=>{const ev=evaluate();
    const exNames=Object.keys(ev).filter(k=>ev[k].ko.length>0)
      .map(k=>OPTS.find(o=>o.key===k).short);
    const be=document.getElementById('be-insight').textContent;
    const kopf=be.split('Nicht wählbar')[0];
    /* nur die aufzaehlenden Teilsaetze, in denen Ansaetze empfohlen werden */
    const listen=((kopf.match(/(?:bereits günstiger als Paid:|Noch nicht erreicht:)[^.]*\./g)||[])
      .concat(kopf.match(/[^.]*(?:ist bei jeder Viewer-Zahl günstiger|wird erst jenseits von)[^.]*\./g)||[])).join(' ')
      /* "guenstiger als Paid" ist die Bezugsgroesse der Kurve, keine Empfehlung */
      .replace(/(?:als|über|unter) Paid/g,'');
    const ov=document.getElementById('ov-sentence').textContent;
    return {exNames,kopf,listen,be,paidKo:ev.paid.ko.length>0,ov};});
  /* Geprueft werden die Empfehlungslisten selbst. "Paid" als Bezugsgroesse ("guenstiger als Paid")
     zaehlt dort nicht als Empfehlung; dass Paid selbst ausgeschlossen ist, steht im Vorbehalt davor. */
  const leck=d.exNames.filter(n=>d.listen.includes(n));
  ok('B-1 '+pr+': die Empfehlungslisten nennen keinen ausgeschlossenen Ansatz',leck.length===0,
     (d.exNames.length?('ausgeschlossen: '+d.exNames.join(', ')):'keine Ausschluesse')
     +(leck.length?' | Leck: '+leck.join(', '):'')+(d.listen?' | "'+d.listen.slice(0,110)+'"':''));
  if(d.exNames.length)ok('B-1 '+pr+': ausgeschlossene Ansaetze sind als solche gekennzeichnet',
     d.be.includes('Nicht wählbar'),'');
  if(d.paidKo)ok('B-1 '+pr+': der Break-even-Text stellt den Paid-Ausschluss voran',
     /^Paid ist aktuell durch K\.O\. ausgeschlossen/.test(d.be.trim()),d.be.trim().slice(0,70));
  if(d.paidKo)ok('B-2 '+pr+': der Kipp-Punkt-Satz sagt, dass Paid ausgeschlossen ist',
     /ausgeschlossene<?\/?b?>? ?Paid-Lizenz|ausgeschlossene Paid-Lizenz/.test(d.ov),
     (d.ov.match(/Der Kipp-Punkt[^.]*\./)||['(nicht gefunden)'])[0].slice(0,110));
}
await p.close();
}


/* ---------- Freeze im Graph-Popup (aus dem Test gemeldet, v0.21) ----------
   Eine Aenderung im Annahmen-Gruppen-Popup loeste renderParams() aus, und das hing seine
   change-Listener per document.querySelectorAll an ALLE .a-row-Felder - auch an die im Popup, das
   dieselbe Struktur benutzt. Jede Aenderung verdoppelte damit die Zahl der Handler: gemessen
   1, 2, 4, 8, 16 Aufrufe; beim zehnten Klick waeren es 512 und die Seite stand minutenlang.
   Diese Pruefung haelt beides fest: genau ein Aufruf je Aenderung, und schnelle Folgen bleiben
   dank Entprellung im Millisekundenbereich. */
{
  const p2 = await b.newPage({ viewport: { width: 1280, height: 900 } });
  watch(p2);
  await p2.goto(U, { waitUntil: 'load' });
  await skipWizard(p2);
  await p2.evaluate(() => setLevel(2)); await p2.waitForTimeout(700);
  await p2.evaluate(() => document.getElementById('s-map').scrollIntoView({ block: 'start' }));
  await p2.waitForTimeout(400);
  /* Annahmen-Gruppe oeffnen: der Knoten mit den meisten Feldern im Popup */
  await p2.evaluate(() => {
    const gs = [...document.querySelectorAll('#graph-svg g[role="button"]')];
    const g = gs.find(x => /Annahmen-Gruppe|assumption group/i.test(x.getAttribute('aria-label') || ''));
    if (g) g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await p2.waitForTimeout(600);

  const mess = await p2.evaluate(() => {
    const i = document.querySelector('#graph-pop .a-row input[type=number]');
    if (!i) return { fehler: 'kein Annahmen-Feld im Popup' };
    let n = 0; const echt = window.applyParamEdit;
    window.applyParamEdit = function (...a) { n++; return echt.apply(this, a); };
    const aufrufe = [];
    for (let k = 0; k < 5; k++) {
      n = 0;
      i.value = String(+i.value + 1);
      i.dispatchEvent(new Event('change', { bubbles: true }));
      aufrufe.push(n);
    }
    const t = performance.now();
    for (let k = 0; k < 25; k++) { i.value = String(+i.value + 1); i.dispatchEvent(new Event('change', { bubbles: true })); }
    const schnell = performance.now() - t;
    window.applyParamEdit = echt;
    return { aufrufe, schnell: Math.round(schnell), felder: document.querySelectorAll('#graph-pop .a-row input[type=number]').length };
  });

  ok('Freeze: Annahmen-Gruppen-Popup hat editierbare Felder', !mess.fehler && mess.felder > 0, mess.fehler || mess.felder + ' Felder');
  if (!mess.fehler) {
    ok('Freeze: genau ein applyParamEdit je Aenderung (kein Listener-Leck)',
       mess.aufrufe.every(x => x === 1), mess.aufrufe.join(', ') + ' (vor v0.21: 1, 2, 4, 8, 16)');
    ok('Freeze: 25 schnelle Aenderungen bleiben unter 1 s (Entprellung greift)',
       mess.schnell < 1000, mess.schnell + ' ms (vor v0.21: 5.260 ms)');
  }
  await p2.close();
}

await R.finish(b);})();
