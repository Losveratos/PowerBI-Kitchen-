/* v0.16 (Paket D3) — Gefuehrter Einstieg (Ebene 0), Lesehilfe in Ebene 2, Zugaenglichkeit.
   Prueft: Werte landen in S, Ueberspringen, Link mit Einstellungen ueberspringt den Einstieg,
   Tastaturdurchlauf nur mit Tab und Enter, Lesehilfe springt zu allen vier Bloecken,
   390 px ohne Ueberlauf, Druckansicht.
   Herkunft: Scratchpad-Skript test_d3.js. Die dortige Vorher/Nachher-Gegenprobe gegen einen
   v0.15-Schnappschuss (p16/before-d3.html) ist entfallen: der Schnappschuss lag nur im
   Scratchpad und die Zahlen sind seit v0.18 (Lizenzbasis) bewusst nicht mehr identisch.
   Diese Suite ueberspringt den Einstieg absichtlich NICHT — sie prueft ihn.
   Start:  node tests/rechner/gefuehrter-einstieg.test.js */
const { chromium, URL: NEW, artifactDir, reporter } = require('./lib/harness');
const DIR = artifactDir('gefuehrter-einstieg');
const R = reporter('gefuehrter-einstieg');
/* test_d3 ruft ok(bedingung, text) — der Harness ok(text, bedingung). */
const ok = (c, m) => R.ok(m, c);
const errs = R.errs;
const f=n=>Math.round(n).toLocaleString('de-DE');

(async()=>{
const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1240,height:950}});
const open=async u=>{const p=R.watch(await ctx.newPage(),u.slice(-26));
  await p.goto(u);await p.waitForTimeout(900);return p;};

console.log('\n================ 1 · Einstieg startet ohne Link ================');
const P=await open(NEW);
const s0=await P.evaluate(()=>({cls:document.body.className,wiz:getComputedStyle(document.getElementById('wizard')).display,
  s0:getComputedStyle(document.getElementById('s0')).display,step:document.getElementById('wiz-count').textContent,
  stepper:getComputedStyle(document.querySelector('.stepper')).display,bar:document.getElementById('wiz-bar').style.width}));
console.log('  body="'+s0.cls+'" · '+s0.step+' · Fortschritt '+s0.bar);
ok(/\blv0\b/.test(s0.cls)&&s0.wiz!=='none','Ebene 0 ist aktiv und der Einstieg sichtbar');
ok(s0.s0==='none'&&s0.stepper==='none','Ebene 1 und die Ebenen-Leiste sind im Einstieg ausgeblendet');
ok(s0.step==='Schritt 1 von 7','Fortschrittsanzeige startet bei Schritt 1 von 7');
ok(await P.isDisabled('#wiz-back'),'Zurueck ist im ersten Schritt deaktiviert');
const live0=await P.textContent('#wiz-live');
console.log('  Zwischenstand: '+live0);
ok(/Zwischenstand/.test(live0)&&/je Viewer und Jahr/.test(live0),'Ergebnis wird von Anfang an live mitgerechnet');

console.log('\n================ 2 · Alle sieben Schritte durchklicken ================');
const shot=async n=>{const el=await P.$('#wizard');await el.scrollIntoViewIfNeeded();await el.screenshot({path:DIR+'schritt'+n+'.png'});};
const before=await P.evaluate(()=>JSON.parse(JSON.stringify({c:S.creators,v:S.viewers,r:S.reports,sh:S.rc.sh,md:S.mode,h:S.horizon,lic:S.p.paid.lic,fl:S.flags,ia:S.ibcsAll})));
/* Schritt 1: Preset als Abkuerzung, danach eigene Zahlen */
await P.click('[data-wact="preset"][data-wval="konzern"]');await P.waitForTimeout(700);
const pres=await P.evaluate(()=>({c:S.creators,v:S.viewers,r:S.reports,cert:!!S.flags.certonly,inC:document.getElementById('wiz-creators').value}));
ok(pres.c===25&&pres.v===1500&&pres.r===100,'Preset „Konzern“ setzt Ersteller/Viewer/Reports ('+pres.c+' / '+pres.v+' / '+pres.r+')');
ok(pres.cert,'Preset setzt auch seine Red Flags (nur zertifizierte Visuals)');
ok(pres.inC==='25','das Eingabefeld im Einstieg zeigt den Preset-Wert');
await P.fill('#wiz-creators','8');await P.press('#wiz-creators','Tab');await P.waitForTimeout(600);
await P.fill('#wiz-viewers','600');await P.press('#wiz-viewers','Tab');await P.waitForTimeout(700);
const st1=await P.evaluate(()=>({c:S.creators,v:S.viewers,n1:document.getElementById('n-creators').value,n2:document.getElementById('n-viewers').value,ov:document.getElementById('ov-viewers').value}));
ok(st1.c===8&&st1.v===600,'Schritt 1: Ersteller 8 und Viewer 600 landen in S');
ok(st1.n1==='8'&&st1.n2==='600'&&st1.ov==='600','dieselben Werte stehen in den Feldern der Ebenen 1 und 2');
await shot(1);
await P.click('#wiz-next');await P.waitForTimeout(400);

/* Schritt 2: Reports und Report-Klassen ueber drei Auswahlmoeglichkeiten */
await P.fill('#wiz-reports','48');await P.press('#wiz-reports','Tab');await P.waitForTimeout(700);
await P.click('[data-wact="rc"][data-wval="op"]');await P.waitForTimeout(700);
const rcOp=await P.evaluate(()=>({sh:S.rc.sh.slice(),cpr:S.cpr,mix:S.mix.slice(),ov:S.mixOv,f0:document.getElementById('rc-sh-0').value}));
await P.click('[data-wact="rc"][data-wval="mgmt"]');await P.waitForTimeout(700);
const st2=await P.evaluate(()=>({r:S.reports,sh:S.rc.sh.slice(),cpr:S.cpr,mix:S.mix.slice(),ov:S.mixOv,
  f0:document.getElementById('rc-sh-0').value,f2:document.getElementById('rc-sh-2').value,
  act:[...document.querySelectorAll('.wiz-choice.active')].map(x=>x.dataset.wval),hint:document.getElementById('wiz-rc-hint').textContent}));
console.log('  operativ → '+rcOp.sh.join(' / ')+' % · '+rcOp.cpr.toFixed(2)+' Charts/Report · Mix '+rcOp.mix.join('/'));
console.log('  management → '+st2.sh.join(' / ')+' % · '+st2.cpr.toFixed(2)+' Charts/Report · Mix '+st2.mix.join('/'));
ok(st2.r===48,'Schritt 2: 48 Standard-Reports landen in S');
ok(rcOp.sh.join()==='70,20,10'&&st2.sh.join()==='20,40,40','die drei Auswahlmoeglichkeiten setzen die Report-Klassen');
ok(st2.f0==='20'&&st2.f2==='40','die Klassen-Felder in Ebene 2 zeigen dieselben Anteile');
ok(rcOp.cpr!==st2.cpr&&rcOp.mix.join()!==st2.mix.join(),'Charts je Report und Chart-Mix werden daraus neu abgeleitet');
ok(st2.ov===null,'kein Experten-Override, die Klassen bleiben die Quelle');
ok(st2.act.join()==='mgmt','genau die gewaehlte Antwort ist markiert');
ok(/Charts je Report/.test(st2.hint),'die Wirkung der Antwort steht als Satz darunter');
await shot(2);
await P.click('#wiz-next');await P.waitForTimeout(400);

/* Schritt 3: Betriebsmodell */
await P.click('[data-wact="mode"][data-wval="ent"]');await P.waitForTimeout(700);
const st3=await P.evaluate(()=>({m:S.mode,ss:S.ssShare,seg:document.querySelector('#mode-seg button.active').dataset.mode,ov:document.querySelector('#ov-mode-seg button.active').dataset.mode}));
ok(st3.m==='ent'&&st3.ss===0,'Schritt 3: Betriebsmodell Enterprise BI in S ('+st3.m+', Self-Service-Anteil '+st3.ss+' %)');
ok(st3.seg==='ent'&&st3.ov==='ent','die Segment-Schalter in Ebene 1 und 2 stehen mit');
await shot(3);
await P.click('#wiz-next');await P.waitForTimeout(400);

/* Schritt 4: Red Flags */
const boxes=await P.$$eval('#wiz-pane input[data-wflag]',e=>e.map(x=>x.dataset.wflag));
console.log('  Checkliste: '+boxes.join(', '));
ok(boxes.length===5,'fuenf Red Flags als Checkliste');
await P.click('input[data-wflag="rs"]');await P.waitForTimeout(700);
await P.click('input[data-wflag="ibcsAll"]');await P.waitForTimeout(700);
await P.click('input[data-wflag="certonly"]');await P.waitForTimeout(700);   /* war durch das Preset gesetzt: wieder aus */
const st4=await P.evaluate(()=>({rs:!!S.flags.rs,ia:!!S.ibcsAll,cert:!!S.flags.certonly,
  mrs:document.querySelector('#flag-list input[data-flag=rs]').checked,mia:document.getElementById('ibcs-all').checked,
  hint:document.querySelector('#wiz-pane .wiz-hint').textContent}));
ok(st4.rs&&st4.ia&&!st4.cert,'Schritt 4: Haken setzen und loesen kommen in S an (rs='+st4.rs+', ibcsAll='+st4.ia+', certonly='+st4.cert+')');
ok(st4.mrs&&st4.mia,'dieselben Schalter sind in Ebene 2 gesetzt');
ok(/17 Red Flags/.test(st4.hint),'Hinweis auf die vollstaendige Liste in Ebene 2');
const live4=await P.textContent('#wiz-live');
console.log('  Zwischenstand nach Red Flags: '+live4);
ok(/ausgeschlossen/.test(live4),'die Wirkung der Red Flags steht sofort im Zwischenstand');
await shot(4);
await P.click('#wiz-next');await P.waitForTimeout(400);

/* Schritt 5: Preisbasis */
await P.click('[data-wact="lic"][data-wval="zebra"]');await P.waitForTimeout(700);
const st5=await P.evaluate(()=>({lic:S.p.paid.lic.join(),act:[...document.querySelectorAll('#ov-lic-seg .active')].map(x=>x.dataset.lic).join()}));
ok(st5.lic==='90,170,300','Schritt 5: Lizenz-Anker Zebra-Niveau in S ('+st5.lic+')');
ok(st5.act==='zebra','der Anker in Ebene 1 steht mit');
await shot(5);
await P.click('#wiz-next');await P.waitForTimeout(400);

/* Schritt 6: Horizont */
await P.click('[data-wact="hor"][data-wval="10"]');await P.waitForTimeout(800);
const st6=await P.evaluate(()=>({h:S.horizon,seg:document.querySelector('#horizon-seg button.active').dataset.h}));
ok(st6.h===10&&st6.seg==='10','Schritt 6: Horizont 10 Jahre in S und im Segment der Ebene 2');
await shot(6);
await P.click('#wiz-next');await P.waitForTimeout(500);

/* Schritt 7: Abschluss */
const st7=await P.evaluate(()=>({cnt:document.getElementById('wiz-count').textContent,sum:document.getElementById('wiz-summary').innerText,
  next:document.getElementById('wiz-next').textContent,done:!!document.querySelector('[data-wact="done"]'),live:document.getElementById('wiz-live').textContent}));
console.log('  '+st7.cnt+' · '+st7.next);
console.log('  Zusammenfassung:\n    '+st7.sum.split('\n').join('\n    '));
ok(st7.cnt==='Schritt 7 von 7','Abschluss ist Schritt 7 von 7');
ok(/8 Ersteller/.test(st7.sum)&&/600 Viewer/.test(st7.sum)&&/48 Standard-Reports/.test(st7.sum)&&/10 Jahre/.test(st7.sum),'die Zusammenfassung nennt die gegebenen Antworten');
ok(/Ergebnis ansehen/.test(st7.next)&&st7.done,'zwei Knoepfe: „Ergebnis ansehen“ und „Alles einstellen“');
ok(/Zwischenstand/.test(st7.live),'ein Satz mit dem Ergebnis');
await shot(7);
/* Gegenprobe: nichts ausser den gesetzten Feldern hat sich veraendert */
const after=await P.evaluate(()=>({c:S.creators,v:S.viewers,r:S.reports,sh:S.rc.sh.join(),md:S.mode,h:S.horizon,lic:S.p.paid.lic.join()}));
ok(after.c===8&&after.v===600&&after.r===48&&after.sh==='20,40,40'&&after.md==='ent'&&after.h===10&&after.lic==='90,170,300','alle sieben Antworten stehen am Ende gemeinsam in S');

console.log('\n================ 3 · Zurueck-Knopf ================');
await P.click('#wiz-back');await P.waitForTimeout(350);
const bk=await P.evaluate(()=>({cnt:document.getElementById('wiz-count').textContent,act:[...document.querySelectorAll('.wiz-choice.active')].map(x=>x.dataset.wval).join()}));
ok(bk.cnt==='Schritt 6 von 7'&&bk.act==='10','Zurueck fuehrt auf Schritt 6 und zeigt die gegebene Antwort weiter an');
await P.click('#wiz-next');await P.waitForTimeout(350);

console.log('\n================ 4 · Abschluss fuehrt in den Rechner ================');
await P.click('#wiz-next');await P.waitForTimeout(900);
const fin=await P.evaluate(()=>({cls:document.body.className,lv:S.level,rg:getComputedStyle(document.getElementById('readguide')).display,wiz:getComputedStyle(document.getElementById('wizard')).display}));
ok(fin.cls==='lv2'&&fin.lv===2,'„Ergebnis ansehen“ landet in Ebene 2 ('+fin.cls+')');
ok(fin.wiz==='none'&&fin.rg!=='none','der Einstieg ist weg, die Lesehilfe da');

console.log('\n================ 5 · „Direkt zum Rechner“ ueberspringt ================');
const P2=await open(NEW);
const sk0=await P2.evaluate(()=>({c:S.creators,v:S.viewers,r:S.reports}));
await P2.click('#wiz-skip');await P2.waitForTimeout(700);
const sk=await P2.evaluate(()=>({cls:document.body.className,lv:S.level,c:S.creators,v:S.viewers,r:S.reports,s0:getComputedStyle(document.getElementById('s0')).display}));
ok(sk.cls==='lv1'&&sk.lv===1,'Skip landet in Ebene 1 ('+sk.cls+')');
ok(sk.s0!=='none','der Ueberblick ist sichtbar');
ok(sk.c===sk0.c&&sk.v===sk0.v&&sk.r===sk0.r,'Skip aendert keinen einzigen Wert ('+sk.c+' / '+sk.v+' / '+sk.r+')');
const wb=await P2.evaluate(()=>{document.getElementById('btn-wizard').click();return document.body.className;});
await P2.waitForTimeout(500);
ok(/\blv0\b/.test(wb),'der Einstieg laesst sich ueber die Werkzeugleiste erneut oeffnen');
await P2.close();

console.log('\n================ 6 · Link mit Einstellungen startet ohne Einstieg ================');
const href=await P.evaluate(()=>{writeHash();return location.href;});
const raw=await P.evaluate(()=>JSON.parse(decodeURIComponent(escape(atob(location.hash.match(/#s=(.+)/)[1])))));
console.log('  sv='+raw.sv+' lv='+raw.lv+' c='+raw.c+' v='+raw.v+' h='+raw.h);
/* Link-Schema-Version: v0.16 schrieb sv=4, seit v0.19 steht sie auf 5. */
ok(raw.sv===5,'Link-Schema sv=5 (war sv=4 bis v0.18): '+raw.sv);
ok(raw.wiz===undefined&&raw.w0===undefined,'der Einstieg selbst wird nicht im Link gespeichert');
const P3=await open(href);
const ln=await P3.evaluate(()=>({cls:document.body.className,c:S.creators,v:S.viewers,r:S.reports,h:S.horizon,sh:S.rc.sh.join()}));
console.log('  geladen: body="'+ln.cls+'" · '+ln.c+' / '+ln.v+' · '+ln.r+' Reports · '+ln.h+' Jahre · Klassen '+ln.sh);
ok(!/\blv0\b/.test(ln.cls),'ein Link mit Einstellungen startet direkt im Rechner, nicht im Einstieg');
ok(ln.c===8&&ln.v===600&&ln.r===48&&ln.h===10&&ln.sh==='20,40,40','alle Antworten des Einstiegs ueberleben den Link');
/* alter Link aus v0.15 */
const old='#s='+await P.evaluate(()=>btoa(unescape(encodeURIComponent(JSON.stringify({sv:4,c:3,v:40,r:12,q:6,t:5,h:5,md:'man',ss:25,lm:'staffel',bl:'none',ex:0,w:70,pe:'viewer',vw:'abs',lv:2})))));
const P4=await open(NEW+old);
const o4=await P4.evaluate(()=>({cls:document.body.className,tot:Math.round(expected('paid').total),cpr:S.cpr}));
console.log('  alter Link: Paid '+f(o4.tot));
ok(!/\blv0\b/.test(o4.cls),'auch ein alter Link laedt ohne Einstieg');
ok(o4.tot>0&&Number.isFinite(o4.tot),'ein Link aus v0.15 rechnet weiterhin durch');
await P4.close();

await P3.close();

console.log('\n================ 8 · Tastaturdurchlauf (nur Tab und Enter) ================');
const K=await open(NEW);
await K.evaluate(()=>{document.body.setAttribute('tabindex','-1');document.body.focus();});
let steps=[],tabs=0,enters=0,guard=0;
while(guard++<400){
  const cur=await K.evaluate(()=>{const a=document.activeElement;return a?(a.id||a.tagName+'.'+(a.className||'')):'-';});
  if(cur==='wiz-next'){
    const c=await K.textContent('#wiz-count');steps.push(c);
    const last=/7 von 7/.test(c);
    await K.keyboard.press('Enter');enters++;await K.waitForTimeout(450);
    if(last)break;
    continue;}
  await K.keyboard.press('Tab');tabs++;}
const kb=await K.evaluate(()=>({cls:document.body.className,lv:S.level,focus:document.activeElement?document.activeElement.id:'-'}));
console.log('  '+tabs+'× Tab, '+enters+'× Enter · besuchte Schritte: '+steps.join(' → '));
console.log('  Endzustand: body="'+kb.cls+'"');
ok(steps.length===7&&/1 von 7/.test(steps[0])&&/7 von 7/.test(steps[6]),'alle sieben Schritte allein mit Tab und Enter erreicht');
ok(kb.cls==='lv2','der Tastaturdurchlauf endet im Ergebnis (Ebene 2)');
const fv=await K.evaluate(()=>{const s=getComputedStyle(document.documentElement);return !!s;});
ok(fv,'Fokus-Ring ist global ueber :focus-visible definiert');
/* Fokussierbarkeit aller Bedienelemente im Einstieg */
await K.evaluate(()=>{document.getElementById('btn-wizard').click();});await K.waitForTimeout(500);
const tabbable=[];
for(let i=0;i<7;i++){
  const n=await K.evaluate(()=>[...document.querySelectorAll('#wizard button:not([disabled]),#wizard input')].filter(e=>e.tabIndex>=0).length);
  tabbable.push(n);
  if(i<6){await K.evaluate(()=>document.getElementById('wiz-next').click());await K.waitForTimeout(300);}}
console.log('  fokussierbare Bedienelemente je Schritt: '+tabbable.join(' · '));
ok(tabbable.every(n=>n>=3),'jeder Schritt hat fokussierbare Bedienelemente plus Navigation');
await K.close();

console.log('\n================ 9 · Lesehilfe springt zu allen vier Bloecken ================');
const L=await open(NEW);
await L.evaluate(()=>{document.getElementById('wiz-skip').click();setLevel(2,false);});await L.waitForTimeout(800);
const rows=await L.$$eval('#readguide .rg-row',e=>e.map(x=>x.dataset.goto));
console.log('  Zeilen: '+rows.join(' · '));
ok(rows.join()==='decision-path,kpi-allowed,rclasses,certainty','vier nummerierte Zeilen: Entscheidungspfad, Rangfolge, Report-Klassen, Sicherheits-Leiste');
for(const id of rows){
  await L.evaluate(()=>window.scrollTo(0,0));await L.waitForTimeout(200);
  await L.click('#readguide .rg-row[data-goto="'+id+'"]');await L.waitForTimeout(1500);
  const r=await L.evaluate(t=>{const el=document.getElementById(t);const b=el.getBoundingClientRect();
    return {flash:el.classList.contains('goto-flash'),vis:getComputedStyle(el).display!=='none',top:Math.round(b.top),h:Math.round(b.height),vh:window.innerHeight};},id);
  console.log('    '+id+': sichtbar='+r.vis+' hervorgehoben='+r.flash+' top='+r.top+'px hoehe='+r.h);
  ok(r.vis&&r.flash&&r.top>-80&&r.top<r.vh,'Lesehilfe springt zu #'+id+' und hebt ihn kurz hervor');}
await L.waitForTimeout(2100);
const gone=await L.evaluate(()=>[...document.querySelectorAll('.goto-flash')].length);
ok(gone===0,'die Hervorhebung verschwindet wieder');
const ov=await L.evaluate(()=>document.querySelectorAll('#readguide .modal,#readguide [style*="position:fixed"]').length);
ok(ov===0,'kein Overlay, nur eine Karte im Fluss');
const rgEl=await L.$('#readguide');await rgEl.scrollIntoViewIfNeeded();await rgEl.screenshot({path:DIR+'lesehilfe.png'});
/* Glossar ist ab Ebene 2 sichtbar */
/* Seit v0.19 gibt es mehrere .gloss-Bloecke (u. a. die Graph-Erklaerung #d-graph-how);
   das Glossar ist der Block mit der Zusammenfassung „Begriffe kurz erklaert“. */
const gl=await L.evaluate(()=>{const d=[...document.querySelectorAll('details.gloss')]
    .find(x=>/Begriffe kurz erkl/.test((x.querySelector('summary')||{}).textContent||''));
  if(!d)return {lv:'-',disp:'none',terms:''};
  return {lv:d.getAttribute('data-lv'),disp:getComputedStyle(d).display,terms:[...d.querySelectorAll('dt')].map(x=>x.textContent).join(' · ')};});
console.log('  Glossar (data-lv='+gl.lv+'): '+gl.terms);
ok(gl.disp!=='none'&&/Volumenstaffel/.test(gl.terms)&&/Barwert/.test(gl.terms),'Begriffs-Glossar ist ab Ebene 2 sichtbar und um Volumenstaffel, Red Flag und Lizenz-Anker erweitert');
/* Feineinstellungen nach Ebene 3 verschoben, mit Hinweis an alter Stelle */
const mv=await L.evaluate(()=>{const g=[...document.querySelectorAll('#s1 .grid3')].pop();const h=document.querySelector('#s1 [data-lv2only]');
  return {gridLv:g?g.getAttribute('data-lv'):null,gridDisp:g?getComputedStyle(g).display:null,hint:h?h.textContent:null,hintDisp:h?getComputedStyle(h).display:null};});
ok(mv.gridDisp==='none'&&mv.hintDisp!=='none'&&/Ebene 3/.test(mv.hint),'Feineinstellungen sind in Ebene 2 ausgeblendet, der Hinweis auf Ebene 3 steht an ihrer Stelle');
await L.evaluate(()=>setLevel(3,false));await L.waitForTimeout(600);
const mv3=await L.evaluate(()=>{const g=[...document.querySelectorAll('#s1 .grid3')].pop();const h=document.querySelector('#s1 [data-lv2only]');
  return {g:getComputedStyle(g).display,h:getComputedStyle(h).display,mo:document.getElementById('n-models').value};});
ok(mv3.g!=='none'&&mv3.h==='none','in Ebene 3 sind sie wieder da, der Hinweis verschwindet');
await L.close();

console.log('\n================ 10 · Druck ================');
const PR=await open(NEW);
await PR.emulateMedia({media:'print'});await PR.waitForTimeout(400);
const pr=await PR.evaluate(()=>({wiz:getComputedStyle(document.getElementById('wizard')).display,
  s0:getComputedStyle(document.getElementById('s0')).display,foot:getComputedStyle(document.getElementById('footer')).display,
  cls:document.body.className}));
console.log('  im Druck (body="'+pr.cls+'"): Einstieg '+pr.wiz+' · Ebene 1 '+pr.s0+' · Fusszeile '+pr.foot);
ok(pr.wiz==='none','der Einstieg erscheint nicht im Ausdruck');
ok(pr.s0!=='none'&&pr.foot!=='none','der Rechner erscheint im Ausdruck, auch wenn der Einstieg offen war');
await PR.emulateMedia({media:'screen'});
await PR.close();

console.log('\n================ 11 · Mobil 390 px ================');
const m=await ctx.newPage();m.on('pageerror',e=>errs.push('mobil: '+e.message));
await m.setViewportSize({width:390,height:860});await m.goto(NEW);await m.waitForTimeout(900);
const over=async lbl=>{const o=await m.evaluate(()=>{const bad=[];
    document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect();if(r.right<=390.5||r.width===0)return;
      let sc=false,x=el;while(x&&x!==document.body){if(/auto|scroll/.test(getComputedStyle(x).overflowX)){sc=true;break;}x=x.parentElement;}
      if(!sc)bad.push((el.id?'#'+el.id:(el.className&&el.className.baseVal===undefined?el.className:el.tagName))+' r='+Math.round(r.right));});
    return {w:document.documentElement.scrollWidth,bad:[...new Set(bad)].slice(0,4)};});
  console.log('  '+lbl+': scrollWidth '+o.w+' px'+(o.bad.length?' · Ueberstand: '+o.bad.join(' | '):''));
  ok(o.w<=391,lbl+' ohne horizontalen Ueberlauf');return o;};
for(let i=1;i<=7;i++){
  await over('Einstieg Schritt '+i);
  if(i===1){const el=await m.$('#wizard');await el.screenshot({path:DIR+'mobil-schritt1.png'});}
  if(i===4){const el=await m.$('#wizard');await el.screenshot({path:DIR+'mobil-schritt4.png'});}
  if(i<7){await m.click('#wiz-next');await m.waitForTimeout(450);}}
await m.click('#wiz-next');await m.waitForTimeout(800);
for(const lv of [1,2,3]){await m.evaluate(l=>setLevel(l,false),lv);await m.waitForTimeout(700);await over('Ebene '+lv);}
await m.evaluate(()=>setLevel(2,false));await m.waitForTimeout(600);
const rg=await m.$('#readguide');await rg.scrollIntoViewIfNeeded();await rg.screenshot({path:DIR+'lesehilfe-mobil.png'});
await m.close();

console.log('\n================ Screenshots ================');
console.log('  ' + DIR);
await P.close();
await R.finish(br);})();
