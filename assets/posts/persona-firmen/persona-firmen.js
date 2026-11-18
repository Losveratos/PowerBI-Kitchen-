/* persona-firmen-simulation.html v2 · 150 Persona-Firmen (25 je Ebene), KI-Pflege-Szenario, Kosten je Viewer,
   Gesamtrating nach Nutzern. Daten: const DATA (eingebettet). */
(function(){
const O=['paid','oss','deneb','core','none'];
const ON={paid:'Paid',oss:'Open Source',deneb:'Deneb',core:'Core + SVG',none:'kein Weg'};
const COL={paid:'#eb6834',oss:'#1baf7a',deneb:'#2a78d6',core:'#eda100',none:'#B4B2A2'};
const SEG={konzern:'Konzern',gehoben:'Gehobener Mittelstand',mittelstand:'Mittelstand',klein:'Klein',finanz:'Bank, Versicherung, Klinik',oeffentlich:'Öffentliche Hand'};
const SEGO=['konzern','gehoben','mittelstand','klein','finanz','oeffentlich'];
const MODE={base:'ohne KI',konzern:'KI-Pflege im Konzern',alle:'KI-Pflege überall'};
const FL={certonly:'Tenant nur zertifizierte Visuals',orgstore:'Freigabe über Organizational Store',coreonly:'Custom Visuals gesperrt',ibcsmust:'IBCS-Zertifikat Pflicht',nobudget:'kein Lizenzbudget',rs:'Report Server',embed:'Embedded / Publish-to-web',sovereign:'Sovereign Cloud',novat:'kein voller Vorsteuerabzug',budgetnext:'Budget erst im Folgejahr',euonly:'Vergaberecht / EU-Standort',noext:'keine Externen ohne Ausschreibung',revision:'Revision will Rechenlogik sehen'};
const MU={ibcscert:'IBCS-zertifiziertes Visual',mscert:'Microsoft-zertifiziert',export:'PDF/PPT-Export & Abos',exportdata:'Datenexport Excel/CSV',interact:'Interaktivität',drill:'Drilldown',writeback:'Writeback im Visual',maint:'Fachbereich ändert ohne Code',copilot:'Copilot baut Reports',agentic:'KI-Agenten bauen Reports',a11y:'Barrierefreiheit',pin:'Versionshoheit',alm:'Git / Pipeline',themeable:'zentral per Theme',mobile:'Mobile App',copyppt:'Kopieren nach PowerPoint',paginated:'Berichtsheft in RDL',exit:'kein Vendor-Lock-in',design:'Design ohne Disziplin',rs:'läuft im Report Server',scale:'konsistente Skalierung',version:'Code-Review der Definition',sla:'Support mit SLA',datares:'Daten bleiben im Tenant',bus:'Wissen bei mehr als einer Person'};
const QT={creators:'Zahl der Ersteller',viewers:'Zahl der Leser'};
const BL={none:'nichts',paid:'gekauftes Visual',oss:'Open-Source-Visual',deneb:'Deneb',core:'Core + SVG'};
const DI={none:'offen',app:'AppSource',org:'Org Store',file:'Datei-Import'};
const LA={inforiver:'33 €',enterprise:'80 €',zebra:'170 €'};
const RC={op:'operativ',mix:'gemischt',mgmt:'Management'};
const PRM={firstH:'Erstbau je Chart-Typ',reuseH:'Rollout je Chart',maint:'Wartungsquote',fixH:'Fix je Breaking-Update',trainH:'Schulung Vorlagen-Bauer',rampH:'Einarbeitung bei Fluktuation',supH100:'Anwender-Support',govRun:'laufende Governance / Review',devH:'klassische Eigenentwicklung'};
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pc=v=>Math.round(100*v)+' %';const pc1=v=>(100*v).toFixed(1).replace('.',',')+' %';
const nf=n=>Math.round(n).toLocaleString('de-DE');const eur=n=>nf(n)+' €';
const R=DATA.rows;let M='konzern';
const W=r=>r.mc.modes[M].win;const maj=r=>{const w=W(r);return w.indexOf(Math.max(...w));};const conf=r=>Math.max(...W(r));
const drvLabel=id=>{const [t,k]=id.split(':');return t==='flag'?FL[k]||k:t==='must'?'Must „'+(MU[k]||k)+'“':QT[k]||k;};
const top=d=>{const i=d.indexOf(Math.max(...d));return [O[i],d[i]];};
const med=a=>{const s=a.filter(v=>v!=null).slice().sort((x,y)=>x-y);if(!s.length)return null;const i=(s.length-1)/2;return (s[Math.floor(i)]+s[Math.ceil(i)])/2;};
const U=R.reduce((a,r)=>a+r.mc.users,0);

/* ---------- Gesamtrating nach Nutzern ---------- */
function rating(mode,rows){rows=rows||R;const u=rows.reduce((a,r)=>a+r.mc.users,0);
  return O.map((o,j)=>{const uw=rows.reduce((a,r)=>a+r.mc.users*r.mc.modes[mode].win[j],0)/u;const fw=rows.reduce((a,r)=>a+r.mc.modes[mode].win[j],0)/rows.length;
    if(o==='none')return {o,uw,fw};
    const ok=rows.filter(r=>r.mc.ko[j]<.5);const uok=ok.reduce((a,r)=>a+r.mc.users,0);
    const cpv=uok?ok.reduce((a,r)=>a+r.mc.users*r.mc.modes[mode].perV[j][1],0)/uok:null;
    return {o,uw,fw,allowU:uok/u,cpv};});}
function drawRating(){const rb=rating('base'),rk=rating(M);const order=rk.filter(x=>x.o!=='none').sort((a,b)=>b.uw-a.uw);
  const mx=Math.max(...rk.map(x=>x.uw),...rb.map(x=>x.uw));
  $('rating').innerHTML=`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Platz</th><th>Weg</th><th>Nutzer-gewichteter Anteil der Zukünfte, in denen der Weg am günstigsten ist</th><th class="num">90-%-Intervall</th><th class="num">Platz 1 im Bootstrap</th><th class="num">${M==='base'?'':'ohne KI'}</th><th class="num">Firmen</th><th class="num">zulässig für</th><th class="num">€ je Viewer und Jahr</th></tr></thead><tbody>`+
   order.map((x,i)=>{const b=rb.find(y=>y.o===x.o);const j=O.indexOf(x.o),bt=DATA.boot[M];return `<tr><td>${i+1}.</td><td><span class="sw" style="background:${COL[x.o]}"></span>${ON[x.o]}</td><td><div class="ubar"><i style="width:${(100*x.uw/mx).toFixed(1)}%;background:${COL[x.o]}"></i><span>${pc1(x.uw)}</span></div></td><td class="num">${pc(bt.lo[j])}–${pc(bt.hi[j])}</td><td class="num">${pc(bt.p1[j])}</td><td class="num">${M==='base'?'':pc1(b.uw)}</td><td class="num">${pc(x.fw)}</td><td class="num">${pc(x.allowU)}</td><td class="num">${x.cpv!=null?eur(x.cpv):'–'}</td></tr>`;}).join('')+
   `<tr><td></td><td><span class="sw" style="background:#B4B2A2"></span>kein Weg zulässig</td><td><div class="ubar"><i style="width:${(100*rk[4].uw/mx).toFixed(1)}%;background:#B4B2A2"></i><span>${pc1(rk[4].uw)}</span></div></td><td></td><td></td><td class="num">${M==='base'?'':pc1(rb[4].uw)}</td><td class="num">${pc(rk[4].fw)}</td><td></td><td></td></tr></tbody></table></div>
   <p class="note">Szenario: <b>${MODE[M]}</b>. Gewichtet mit den Gesamtnutzern jeder Firma (Ersteller + Viewer im Mittel über den Horizont, zusammen ${nf(U)} Nutzer in 150 Firmen). „Firmen" = derselbe Anteil, wenn jede Firma gleich zählt. Intervall und „Platz 1“: Bootstrap über die 150 Firmen (2.000 Stichproben mit Zurücklegen). Bleibt in einer Zukunft kein Weg zulässig, wird die Must-Liste verhandelt; ohne Verhandlung wäre das in ${pc(R.reduce((a,r)=>a+r.mc.users*(r.mc.strictNone||0),0)/U)} der nutzergewichteten Zukünfte so. „Zulässig für" = Anteil der Nutzer in Firmen, in denen der Weg in mindestens der Hälfte der Zukünfte nicht per K.O. ausscheidet. „€ je Viewer und Jahr" = nutzergewichteter Median der Gesamtkosten des Wegs in genau diesen Firmen, KI-Werkzeugkosten eingerechnet.</p>`;
  const w=order[0];$('k-rate').innerHTML=`<div class="v">${ON[w.o]}</div><div class="l">liegt im Gesamtrating vorn: in ${pc(w.uw)} der nutzergewichteten Zukünfte am günstigsten, Platz 1 in ${pc(DATA.boot[M].p1[O.indexOf(w.o)])} der Bootstrap-Stichproben (${MODE[M]})</div>`;}

/* ---------- Ebenen × Wege: Kosten je Viewer ---------- */
function drawLevels(){let h=`<div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Ebene</th><th class="num">Nutzer (Median)</th>${O.slice(0,4).map(o=>`<th class="num"><span class="sw" style="background:${COL[o]}"></span>${ON[o]}</th>`).join('')}<th class="num">günstigster Weg</th><th class="num">ohne Standard</th><th class="num">Standard günstiger</th><th>Gewinner nach Nutzern</th></tr></thead><tbody>`;
  SEGO.forEach(s=>{const g=R.filter(r=>r.segment===s);const rt=rating(M,g);const best=rt.slice(0,4).sort((a,b)=>b.uw-a.uw)[0];
    const cells=[0,1,2,3].map(j=>{const v=med(g.map(r=>r.mc.modes[M].perV[j][1]));return `<td class="num">${eur(v)}</td>`;}).join('');
    const bestC=med(g.map(r=>r.mc.modes[M].best[1]));
    h+=`<tr><td>${SEG[s]}</td><td class="num">${nf(med(g.map(r=>r.mc.users)))}</td>${cells}<td class="num"><b>${eur(bestC)}</b></td><td class="num">${eur(med(g.map(r=>r.mc.modes[M].sq)))}</td><td class="num">${pc(med(g.map(r=>r.mc.modes[M].beatSQ)))}</td><td><div class="bar" style="height:12px;min-width:120px">${rt.map((x,j)=>x.uw>.004?`<span class="${x.o==='none'?'none':''}" style="flex:${x.uw};${x.o==='none'?'':'background:'+COL[x.o]}" title="${ON[x.o]}: ${pc(x.uw)}"></span>`:'').join('')}</div><span class="note">${ON[best.o]} ${pc(best.uw)}</span></td></tr>`;});
  $('levels').innerHTML=h+`</tbody></table></div><p class="note">Median über die 25 Firmen der Ebene, jeweils Median der ${DATA.N.toLocaleString('de-DE')} Zukünfte: Gesamtkosten des Wegs über den Horizont geteilt durch Viewer × Jahre (Viewer im Mittel über den Horizont). „Günstigster Weg" = Kosten des jeweils günstigsten zulässigen Wegs. „Ohne Standard" = Null-Option des Rechners (Ad-hoc-Bau, Wartung, Leserzeit, Rückfragen), „Standard günstiger" = Anteil der Zukünfte, in denen der günstigste Weg billiger ist als ohne Standard (Median der Firmen). Szenario: ${MODE[M]}.</p>`;}

/* ---------- KI-Effekt ---------- */
function drawAI(){const K=R.filter(r=>r.segment==='konzern');const k=DATA.ki;
  const shift=[0,1,2,3,4].map(j=>({b:K.reduce((a,r)=>a+r.mc.users*r.mc.modes.base.win[j],0),a:K.reduce((a,r)=>a+r.mc.users*r.mc.modes.konzern.win[j],0)}));const uk=K.reduce((a,r)=>a+r.mc.users,0);
  const dK=[0,1,2,3].map(j=>med(K.map(r=>r.mc.aiDelta[j])));const dAll=[0,1,2,3].map(j=>med(R.map(r=>r.mc.aiDelta[j])));
  const aiC=med(K.map(r=>r.mc.modes.konzern.ai));
  $('ai').innerHTML=`<div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Weg</th><th class="num">Δ € je Viewer und Jahr im Konzern</th><th class="num">Δ über alle 150 Firmen (KI überall)</th><th class="num">Konzern-Nutzer, deren Firma damit am günstigsten fährt: ohne → mit KI</th></tr></thead><tbody>${[0,1,2,3].map(j=>`<tr><td><span class="sw" style="background:${COL[O[j]]}"></span>${ON[O[j]]}</td><td class="num">${dK[j]>0?'+':''}${eur(dK[j])}</td><td class="num">${dAll[j]>0?'+':''}${eur(dAll[j])}</td><td class="num">${pc(shift[j].b/uk)} → <b>${pc(shift[j].a/uk)}</b></td></tr>`).join('')}</tbody></table></div>
  <p class="note">Gepaart gerechnet: dieselben ${DATA.N.toLocaleString('de-DE')} Zukünfte je Firma, einmal ohne und einmal mit KI. Δ = Median der Differenz, KI-Werkzeugkosten eingerechnet (im Konzern im Median ${eur(aiC)} je Viewer und Jahr).</p>
  <details class="tv"><summary>Die KI-Annahmen (Mittel aus Opus- und Sonnet-Schätzung)</summary><div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Stunden-Annahme</th>${O.slice(0,4).map(o=>`<th class="num">${ON[o]}</th>`).join('')}</tr></thead><tbody>${Object.keys(PRM).map(p=>`<tr><td>${PRM[p]}</td>${O.slice(0,4).map(o=>{const f=(k.factors[o]||{})[p];return `<td class="num">${f?'×'+f[1].toFixed(2).replace('.',',')+'<br><span class="note">'+f[0].toFixed(2).replace('.',',')+'–'+f[2].toFixed(2).replace('.',',')+'</span>':'–'}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>
  <p class="note">Faktor auf die Stunden bei voller Nutzung; wirksam ist f = 1 − Adoption × (1 − Faktor). Adoption (Modus): ${SEGO.map(s=>SEG[s]+' '+pc(k.adoption[s][1])).join(' · ')}. KI-Werkzeuge: ${eur(k.aiCostPerCreatorYear[1])} je Ersteller und Jahr (${eur(k.aiCostPerCreatorYear[0])}–${eur(k.aiCostPerCreatorYear[2])}), davon ${pc(k.aiCostShareVisual[1])} der Visual-Arbeit zugerechnet. Die KI-gestützte Eigenentwicklung eines Visuals (200 h) enthält den Effekt schon und wird nicht noch einmal gesenkt.</p></details>`;}

/* ---------- KPIs ---------- */
function drawKpis(){const sure=R.filter(r=>conf(r)>=.8).length,coin=R.filter(r=>conf(r)<.5).length;
  $('k-sure').innerHTML=`<div class="v">${sure} von 150</div><div class="l">haben eine sichere Antwort: derselbe Weg gewinnt in mindestens 80 % ihrer Zukünfte</div>`;
  $('k-coin').innerHTML=`<div class="v">${coin} von 150</div><div class="l">sind ein Münzwurf: kein Weg gewinnt in mehr als der Hälfte ihrer Zukünfte</div>`;}

/* ---------- Filter / Modus ---------- */
const F={seg:'all',author:'all'};
const chip=(host,key,val,txt,obj)=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=txt;b.setAttribute('aria-pressed',(obj||F)[key]===val);b.onclick=()=>{(obj||F)[key]=val;host.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b));all();};host.appendChild(b);};
const MS={m:M};
['base','konzern','alle'].forEach(m=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=MODE[m];b.setAttribute('aria-pressed',m===M);b.onclick=()=>{M=m;document.querySelectorAll('.f-mode .chip').forEach(c=>c.setAttribute('aria-pressed',c===b));all();};document.querySelectorAll('.f-mode').forEach((host,hi)=>{const bb=hi?b.cloneNode(true):b;if(hi)bb.onclick=b.onclick;host.appendChild(bb);});});
document.querySelectorAll('.f-mode').forEach(host=>host.querySelectorAll('.chip').forEach(c=>{const m=Object.keys(MODE).find(k=>MODE[k]===c.textContent);c.onclick=()=>{M=m;document.querySelectorAll('.f-mode .chip').forEach(x=>x.setAttribute('aria-pressed',x.textContent===MODE[M]));all();};}));
chip($('f-seg'),'seg','all','alle');SEGO.forEach(s=>chip($('f-seg'),'seg',s,SEG[s]));
chip($('f-more'),'author','all','beide');chip($('f-more'),'author','opus','von Opus');chip($('f-more'),'author','sonnet','von Sonnet');
$('legend').innerHTML=O.map(o=>`<span><i style="background:${o==='none'?'repeating-linear-gradient(45deg,#B4B2A2 0 3px,#E7E4DA 3px 6px)':COL[o]}"></i>${ON[o]}${o==='none'?' zulässig':''}</span>`).join('');

/* ---------- Übersicht ---------- */
let sel=null;
function barHtml(w){return `<div class="bar">${w.map((v,i)=>v>.004?`<span class="${O[i]==='none'?'none':''}" style="flex:${v};${O[i]==='none'?'':'background:'+COL[O[i]]}" title="${ON[O[i]]}: ${pc(v)}"></span>`:'').join('')}</div>`;}
function draw(){const rows=R.filter(r=>(F.seg==='all'||r.segment===F.seg)&&(F.author==='all'||r.author===F.author));let h='';
  SEGO.forEach(s=>{const g=rows.filter(r=>r.segment===s).sort((a,b)=>maj(a)-maj(b)||conf(b)-conf(a));if(!g.length)return;h+=`<div class="seg-h">${SEG[s]} · ${g.length}</div>`;
    g.forEach(r=>{const best=r.mc.modes[M].best[1];h+=`<div class="prow${sel===r.id?' sel':''}" role="listitem" tabindex="0" data-id="${r.id}" aria-label="${esc(r.name)}: ${ON[O[maj(r)]]} in ${pc(conf(r))} der Zukünfte"><div class="nm"><b>${r.id}</b>${esc(r.name)}</div>${barHtml(W(r))}<div class="cf${conf(r)<.5?' lo':''}">${pc(conf(r))}</div><div class="pv">${best!=null?eur(best):'–'}</div></div>`;});});
  $('pchart').innerHTML=h||'<p class="note">Keine Firma in dieser Auswahl.</p>';
  $('pchart').querySelectorAll('.prow').forEach(el=>{const go=()=>show(el.dataset.id,true);el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};});}

/* ---------- Detail ---------- */
function rangeRows(r){const pv=r.mc.modes[M].perV;const mx=Math.max(...pv.map(v=>v[2]));return [0,1,2,3].map(j=>{const [a,m,b]=pv[j];const x=v=>(100*v/mx).toFixed(1)+'%';
  return `<div class="orow rng"><span>${ON[O[j]]}</span><div class="track"><i style="left:${x(a)};width:calc(${x(b)} - ${x(a)});background:${COL[O[j]]};opacity:.55"></i><b style="left:${x(m)}"></b></div><span class="v">${eur(m)}</span></div>`;}).join('');}
function mini(d,l){return `<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11.5px;color:var(--ink-mute);width:48px">${l}</span><div class="mini" style="flex:1">${d.map((v,i)=>v>.004?`<span style="flex:${v};background:${COL[O[i]]}" title="${ON[O[i]]}: ${pc(v)}"></span>`:'').join('')}</div></div>`;}
function show(id,scroll){sel=id;const r=R.find(x=>x.id===id);if(!r)return;const w=W(r);
  const fl=Object.entries(r.flags||{}).filter(([,v])=>v>0).map(([k,v])=>`<span>${esc(FL[k]||k)} <b>${v>=1?'sicher':pc(v)}</b></span>`).join('');
  const mu=Object.entries(r.must||{}).filter(([,v])=>v>0).map(([k,v])=>`<span>Must: ${esc(MU[k]||k)} <b>${v>=1?'sicher':pc(v)}</b></span>`).join('');
  const t3=a=>Array.isArray(a)?a.map(nf).join(' · '):a;
  const drv=r.mc.drivers.filter(d=>d.tv>=.05).map(d=>{const L=drvLabel(d.id);
    if(d.on){const [a,av]=top(d.on),[b,bv]=top(d.off);return `<div class="drv"><b>${esc(L)}</b> (Abstand ${pc(d.tv)}): gilt es, liegt <b>${ON[a]}</b> in ${pc(av)} vorn, sonst <b>${ON[b]}</b> in ${pc(bv)}.${mini(d.on,'mit')}${mini(d.off,'ohne')}</div>`;}
    const [a,av]=top(d.lo),[b,bv]=top(d.hi);return `<div class="drv"><b>${esc(L)}</b> (Abstand ${pc(d.tv)}): bei wenigen (bis ${nf(d.loV)}) liegt <b>${ON[a]}</b> in ${pc(av)} vorn, bei vielen (ab ${nf(d.hiV)}) <b>${ON[b]}</b> in ${pc(bv)}.${mini(d.lo,'wenige')}${mini(d.hi,'viele')}</div>`;}).join('')||'<p class="note">Kein unsicherer Input verschiebt das Ergebnis nennenswert (Treiber ohne KI gemessen).</p>';
  const ai=r.mc.modes.alle.ai;
  $('detail-top').innerHTML=`<div class="detail" id="detail" tabindex="-1" aria-live="polite">
   <h3>${esc(r.name)}</h3><div class="sub">${r.id} · ${esc(r.industry)} · ${esc(r.city)} · ${nf(r.employees)} Mitarbeitende · ${SEG[r.segment]} · ${nf(r.mc.users)} Nutzer · geschrieben von ${r.author==='opus'?'Opus':'Sonnet'}</div>
   <p class="story">${esc(r.story)}</p>
   <p class="note" style="margin-bottom:8px"><b>Entscheidet:</b> ${esc(r.decider)}. <b>Interessant:</b> ${esc(r.why)}</p>
   <div class="facts"><span>Ersteller <b>${t3(r.creators)}</b></span><span>Leser <b>${t3(r.viewers)}</b></span><span>Reports <b>${t3(r.reports)}</b></span><span>Horizont <b>${r.horizon} J.</b></span><span>Self-Service <b>${r.ssShare} %</b></span><span>heute <b>${BL[r.baseline]||r.baseline}${r.existing?' ('+r.existing+' Reports)':''}</b></span><span>Lizenzniveau <b>${LA[r.licAnchor]||r.licAnchor}${r.siteLicense?', Site-Lizenz':''}</b></span><span>Reports <b>${RC[r.reportClasses]||r.reportClasses}</b></span><span>Verteilweg <b>${DI[r.dist]||r.dist}</b></span>${fl}${mu}</div>
   <div class="dgrid">
    <div><h4>Gewinner in ${DATA.N.toLocaleString('de-DE')} Zukünften · ${MODE[M]}</h4>${O.map((o,i)=>`<div class="orow"><span>${ON[o]}</span><div class="track"><i style="left:0;width:${(100*w[i]).toFixed(1)}%;background:${o==='none'?'#B4B2A2':COL[o]}"></i></div><span class="v">${pc(w[i])}</span></div>`).join('')}
      <p class="note" style="margin-top:8px">K.O.-Wahrscheinlichkeit: ${[0,1,2,3].map(j=>ON[O[j]]+' '+pc(r.mc.ko[j])).join(' · ')}.${r.mc.strictNone>0?' Must-Liste in '+pc(r.mc.strictNone)+' der Zukünfte verhandelt.':''}</p>${(()=>{const md=r.mc.modes[M];return `<p class="note">Ohne Standard: ${eur(md.sq)} je Viewer und Jahr; der günstigste Weg ist in ${pc(md.beatSQ||0)} der Zukünfte billiger. Davon ${pc(md.bestHard||0)} als Auszahlung, der Rest eigene Zeit. Wer beim häufigsten Weg bleibt, liegt in ${pc(md.notBest||0)} der Zukünfte daneben${md.regretIfWrong?', dann im Median um +'+pc(md.regretIfWrong):''}.</p>`;})()}</div>
    <div><h4>€ je Viewer und Jahr · P10–P90, Strich = Median</h4>${rangeRows(r)}<p class="note" style="margin-top:8px">Mit KI-Pflege (Adoption ${SEG[r.segment]}): ${[0,1,2,3].map(j=>ON[O[j]]+' '+(r.mc.aiDelta[j]>0?'+':'')+eur(r.mc.aiDelta[j])).join(' · ')} je Viewer und Jahr, KI-Werkzeuge ${eur(ai)} eingerechnet.</p></div>
   </div>
   <h4 style="font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-mute);margin:16px 0 4px">Was die Antwort kippt</h4>${drv}</div>`;
  draw();if(scroll)$('detail').scrollIntoView({behavior:'smooth',block:'nearest'});}

/* ---------- Treiber ---------- */
function drawDrivers(){const dc={};R.forEach(r=>{const d=r.mc.drivers[0];if(d&&d.tv>=.05)dc[d.id]=(dc[d.id]||0)+1;else dc['_none']=(dc['_none']||0)+1;});
  const dl=Object.entries(dc).sort((a,b)=>b[1]-a[1]);const dmx=Math.max(...dl.map(x=>x[1]));
  $('drvcount').innerHTML=dl.slice(0,12).map(([k,v])=>`<div class="hbar"><span>${k==='_none'?'nichts Nennenswertes (stabil)':esc(drvLabel(k))}</span><div class="t" style="width:${(100*v/dmx).toFixed(1)}%;${k==='_none'?'background:#B4B2A2':''}"></div><span class="n">${v}</span></div>`).join('')+
  `<p class="note" style="margin-top:10px">Stärkster Treiber je Firma (ohne KI gemessen). „Nichts Nennenswertes" heißt: kein unsicherer Input verschiebt die Gewinner-Verteilung um mehr als 5 Prozentpunkte.</p>`;}

/* ---------- Autoren ---------- */
function drawAuthors(){const au=k=>{const g=R.filter(r=>r.author===k);const m={};g.forEach(r=>m[O[maj(r)]]=(m[O[maj(r)]]||0)+1);
  return {n:g.length,m,conf:med(g.map(conf)),coin:g.filter(r=>conf(r)<.5).length,fl:g.reduce((a,r)=>a+Object.values(r.flags||{}).filter(v=>v>0).length,0)/g.length,mu:g.reduce((a,r)=>a+Object.values(r.must||{}).filter(v=>v>0).length,0)/g.length};};
  const A=au('opus'),S=au('sonnet');const d=v=>v.toFixed(1).replace('.',',');
  $('authors').innerHTML=`<div class="tbl-wrap"><table class="tbl small"><thead><tr><th></th><th class="num">von Opus</th><th class="num">von Sonnet</th></tr></thead><tbody>
  <tr><td>Firmen</td><td class="num">${A.n}</td><td class="num">${S.n}</td></tr><tr><td>Rahmenbedingungen je Firma (Ø)</td><td class="num">${d(A.fl)}</td><td class="num">${d(S.fl)}</td></tr><tr><td>Must-Kriterien je Firma (Ø)</td><td class="num">${d(A.mu)}</td><td class="num">${d(S.mu)}</td></tr><tr><td>Sicherheit der Antwort (Median)</td><td class="num">${pc(A.conf)}</td><td class="num">${pc(S.conf)}</td></tr><tr><td>Münzwurf-Firmen</td><td class="num">${A.coin}</td><td class="num">${S.coin}</td></tr>
  ${O.map(o=>`<tr><td>Mehrheit ${ON[o]}</td><td class="num">${A.m[o]||0}</td><td class="num">${S.m[o]||0}</td></tr>`).join('')}</tbody></table></div>`;}
if(DATA.verdicts&&DATA.verdicts.length)$('verdict').innerHTML=DATA.verdicts.map(v=>`<div class="src-box" style="border-left-color:var(--topic)"><h3>${esc(v.t)}</h3><p class="note" style="margin-bottom:8px">Wörtlich aus dem Review-Log. Vorsicht: Hier bewertet Opus auch Firmen, die Opus geschrieben hat.</p>${v.x.split(/\n{2,}/).map(p=>`<p style="margin-bottom:8px">${esc(p.replace(/\*\*/g,'').replace(/`/g,''))}</p>`).join('')}</div>`).join('');

/* ---------- Tabelle ---------- */
function drawTable(){$('tbl').innerHTML=`<thead><tr><th>ID</th><th>Firma</th><th>Ebene</th><th class="num">Nutzer</th><th class="num">Paid</th><th class="num">OSS</th><th class="num">Deneb</th><th class="num">Core</th><th class="num">kein</th><th class="num">€/Viewer/Jahr (bester)</th></tr></thead><tbody>`+
 R.map(r=>`<tr><td>${r.id}</td><td>${esc(r.name)}</td><td>${SEG[r.segment]}</td><td class="num">${nf(r.mc.users)}</td>${W(r).map(v=>`<td class="num">${pc(v)}</td>`).join('')}<td class="num">${r.mc.modes[M].best[1]!=null?eur(r.mc.modes[M].best[1]):'–'}</td></tr>`).join('')+'</tbody>';}

function all(){drawKpis();drawRating();drawLevels();draw();drawTable();drawAuthors();if(sel)show(sel,false);}
drawAI();drawDrivers();
const start=new URLSearchParams(location.hash.slice(1)).get('f')||R.slice().sort((a,b)=>conf(a)-conf(b))[0].id;sel=start;all();
})();
