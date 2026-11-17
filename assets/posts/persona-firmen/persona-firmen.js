/* persona-firmen-simulation.html · Darstellung der 100 Persona-Firmen. Daten: const DATA (eingebettet). */
(function(){
const O=['paid','oss','deneb','core','none'];
const ON={paid:'Paid',oss:'Open Source',deneb:'Deneb',core:'Core + SVG',none:'kein Weg'};
const COL={paid:'#eb6834',oss:'#1baf7a',deneb:'#2a78d6',core:'#eda100',none:'#B4B2A2'};
const SEG={konzern:'Konzern',gehoben:'Gehobener Mittelstand',mittelstand:'Mittelstand',klein:'Klein',finanz:'Bank, Versicherung',oeffentlich:'Öffentliche Hand'};
const SEGO=['konzern','gehoben','mittelstand','klein','finanz','oeffentlich'];
const FL={certonly:'Tenant nur zertifizierte Visuals',orgstore:'Freigabe über Organizational Store',coreonly:'Custom Visuals gesperrt',ibcsmust:'IBCS-Zertifikat Pflicht',nobudget:'kein Lizenzbudget',rs:'Report Server',embed:'Embedded / Publish-to-web',sovereign:'Sovereign Cloud',novat:'kein voller Vorsteuerabzug',budgetnext:'Budget erst im Folgejahr',euonly:'Vergaberecht / EU-Standort',noext:'keine Externen ohne Ausschreibung',revision:'Revision will Rechenlogik sehen'};
const MU={ibcscert:'IBCS-zertifiziertes Visual',mscert:'Microsoft-zertifiziert',export:'PDF/PPT-Export & Abos',exportdata:'Datenexport Excel/CSV',interact:'Interaktivität',drill:'Drilldown',writeback:'Writeback im Visual',maint:'Fachbereich ändert ohne Code',copilot:'Copilot baut Reports',agentic:'KI-Agenten bauen Reports',a11y:'Barrierefreiheit',pin:'Versionshoheit',alm:'Git / Pipeline',themeable:'zentral per Theme',mobile:'Mobile App',copyppt:'Kopieren nach PowerPoint',paginated:'Berichtsheft in RDL',exit:'kein Vendor-Lock-in',design:'Design ohne Disziplin',rs:'läuft im Report Server',scale:'konsistente Skalierung',version:'Code-Review der Definition',sla:'Support mit SLA',datares:'Daten bleiben im Tenant',bus:'Wissen bei mehr als einer Person'};
const QT={creators:'Zahl der Ersteller',viewers:'Zahl der Leser',reports:'Zahl der Reports',types:'Zahl der Chart-Typen',models:'Zahl der Modelle'};
const BL={none:'nichts',paid:'gekauftes Visual',oss:'Open-Source-Visual',deneb:'Deneb',core:'Core + SVG'};
const DI={none:'offen',app:'AppSource',org:'Org Store',file:'Datei-Import'};
const LA={inforiver:'33 €',enterprise:'80 €',zebra:'170 €'};
const RC={op:'operativ',mix:'gemischt',mgmt:'Management'};
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pc=v=>Math.round(100*v)+' %';
const nf=n=>Math.round(n).toLocaleString('de-DE');
const R=DATA.rows;R.forEach(r=>{const w=r.mc.win;r.maj=w.indexOf(Math.max(...w));r.conf=w[r.maj];});
const drvLabel=id=>{const [t,k]=id.split(':');return t==='flag'?FL[k]||k:t==='must'?'Must „'+(MU[k]||k)+'“':QT[k]||k;};
const top=d=>{const i=d.indexOf(Math.max(...d));return [O[i],d[i]];};

/* ---------- KPIs ---------- */
const sure=R.filter(r=>r.conf>=.8).length,coin=R.filter(r=>r.conf<.5).length,agree=R.filter(r=>(r.mc.rec<0?4:r.mc.rec)===r.maj).length;
const majC={};R.forEach(r=>majC[O[r.maj]]=(majC[O[r.maj]]||0)+1);
$('kpis').innerHTML=`<div class="kpi"><div class="v">${sure} von 100</div><div class="l">haben eine sichere Antwort: derselbe Weg gewinnt in mindestens 80 % ihrer Zukünfte</div></div>
<div class="kpi"><div class="v">${coin} von 100</div><div class="l">sind ein Münzwurf: kein Weg gewinnt in mehr als der Hälfte ihrer Zukünfte</div></div>
<div class="kpi"><div class="v">${100-agree} von 100</div><div class="l">bekämen von der Punkt-Rechnung eine andere Empfehlung als von der Monte-Carlo-Mehrheit</div></div>`;

/* ---------- Filter ---------- */
const F={seg:'all',author:'all'};
const chip=(host,key,val,txt)=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=txt;b.setAttribute('aria-pressed',F[key]===val);b.onclick=()=>{F[key]=val;host.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c===b));draw();};host.appendChild(b);};
chip($('f-seg'),'seg','all','alle');SEGO.forEach(s=>chip($('f-seg'),'seg',s,SEG[s]));
chip($('f-more'),'author','all','beide');chip($('f-more'),'author','opus','Opus (A, B)');chip($('f-more'),'author','sonnet','Sonnet (C, D)');
$('legend').innerHTML=O.map(o=>`<span><i style="background:${o==='none'?'repeating-linear-gradient(45deg,#B4B2A2 0 3px,#E7E4DA 3px 6px)':COL[o]}"></i>${ON[o]}${o==='none'?' zulässig':''}</span>`).join('');

/* ---------- Übersicht ---------- */
let sel=null;
function barHtml(w){return `<div class="bar">${w.map((v,i)=>v>.004?`<span class="${O[i]==='none'?'none':''}" style="flex:${v};${O[i]==='none'?'':'background:'+COL[O[i]]}" title="${ON[O[i]]}: ${pc(v)}"></span>`:'').join('')}</div>`;}
function draw(){
  const rows=R.filter(r=>(F.seg==='all'||r.segment===F.seg)&&(F.author==='all'||r.author===F.author));
  let h='';
  SEGO.forEach(s=>{const g=rows.filter(r=>r.segment===s).sort((a,b)=>a.maj-b.maj||b.conf-a.conf);if(!g.length)return;
    h+=`<div class="seg-h">${SEG[s]} · ${g.length}</div>`;
    g.forEach(r=>{h+=`<div class="prow${sel===r.id?' sel':''}" role="listitem" tabindex="0" data-id="${r.id}" aria-label="${esc(r.name)}: ${ON[O[r.maj]]} in ${pc(r.conf)} der Zukünfte"><div class="nm"><b>${r.id}</b>${esc(r.name)}</div>${barHtml(r.mc.win)}<div class="cf${r.conf<.5?' lo':''}">${pc(r.conf)}</div></div>`;});});
  $('pchart').innerHTML=h||'<p class="note">Keine Firma in dieser Auswahl.</p>';
  $('pchart').querySelectorAll('.prow').forEach(el=>{const go=()=>show(el.dataset.id,true);el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}};});
}

/* ---------- Detail ---------- */
function rangeRows(r){const mx=Math.max(...r.mc.perV.map(v=>v[2]));return [0,1,2,3].map(j=>{const [a,m,b]=r.mc.perV[j];const x=v=>(100*v/mx).toFixed(1)+'%';
  return `<div class="orow rng"><span>${ON[O[j]]}</span><div class="track"><i style="left:${x(a)};width:calc(${x(b)} - ${x(a)});background:${COL[O[j]]};opacity:.55"></i><b style="left:${x(m)}"></b></div><span class="v">${nf(m)} €</span></div>`;}).join('');}
function show(id,scroll){sel=id;const r=R.find(x=>x.id===id);if(!r)return;
  const fl=Object.entries(r.flags||{}).filter(([,v])=>v>0).map(([k,v])=>`<span>${esc(FL[k]||k)} <b>${v>=1?'sicher':pc(v)}</b></span>`).join('');
  const mu=Object.entries(r.must||{}).filter(([,v])=>v>0).map(([k,v])=>`<span>Must: ${esc(MU[k]||k)} <b>${v>=1?'sicher':pc(v)}</b></span>`).join('');
  const t3=a=>Array.isArray(a)?a.map(nf).join(' · '):a;
  const rec=r.mc.rec<0?'kein Weg zulässig':ON[O[r.mc.rec]];
  const drv=r.mc.drivers.filter(d=>d.tv>=.05).map(d=>{const L=drvLabel(d.id);
    if(d.on){const [a,av]=top(d.on),[b,bv]=top(d.off);return `<div class="drv"><b>${esc(L)}</b> (Abstand ${pc(d.tv)}): gilt es, liegt <b>${ON[a]}</b> in ${pc(av)} vorn, sonst <b>${ON[b]}</b> in ${pc(bv)}.${mini(d.on,'mit')}${mini(d.off,'ohne')}</div>`;}
    const [a,av]=top(d.lo),[b,bv]=top(d.hi);return `<div class="drv"><b>${esc(L)}</b> (Abstand ${pc(d.tv)}): bei wenigen (bis ${nf(d.loV)}) liegt <b>${ON[a]}</b> in ${pc(av)} vorn, bei vielen (ab ${nf(d.hiV)}) <b>${ON[b]}</b> in ${pc(bv)}.${mini(d.lo,'wenige')}${mini(d.hi,'viele')}</div>`;}).join('')||'<p class="note">Kein unsicherer Input verschiebt das Ergebnis nennenswert.</p>';
  $('detail-top').innerHTML=`<div class="detail" id="detail" tabindex="-1" aria-live="polite">
   <h3>${esc(r.name)}</h3><div class="sub">${r.id} · ${esc(r.industry)} · ${esc(r.city)} · ${nf(r.employees)} Mitarbeitende · ${SEG[r.segment]} · geschrieben von ${r.author==='opus'?'Opus':'Sonnet'}</div>
   <p class="story">${esc(r.story)}</p>
   <p class="note" style="margin-bottom:8px"><b>Entscheidet:</b> ${esc(r.decider)}. <b>Interessant:</b> ${esc(r.why)}</p>
   <div class="facts"><span>Ersteller <b>${t3(r.creators)}</b></span><span>Leser <b>${t3(r.viewers)}</b></span><span>Reports <b>${t3(r.reports)}</b></span><span>Horizont <b>${r.horizon} J.</b></span><span>Self-Service <b>${r.ssShare} %</b></span><span>heute <b>${BL[r.baseline]||r.baseline}${r.existing?' ('+r.existing+' Reports)':''}</b></span><span>Lizenzniveau <b>${LA[r.licAnchor]||r.licAnchor}${r.siteLicense?', Site-Lizenz':''}</b></span><span>Reports <b>${RC[r.reportClasses]||r.reportClasses}</b></span><span>Verteilweg <b>${DI[r.dist]||r.dist}</b></span>${fl}${mu}</div>
   <div class="dgrid">
    <div><h4>Gewinner in ${DATA.N.toLocaleString('de-DE')} Zukünften</h4>${O.map((o,i)=>`<div class="orow"><span>${ON[o]}</span><div class="track"><i style="left:0;width:${(100*r.mc.win[i]).toFixed(1)}%;background:${o==='none'?'#B4B2A2':COL[o]}"></i></div><span class="v">${pc(r.mc.win[i])}</span></div>`).join('')}
      <p class="note" style="margin-top:8px">Punkt-Rechnung: <b>${rec}</b>. K.O.-Wahrscheinlichkeit: ${[0,1,2,3].map(j=>ON[O[j]]+' '+pc(r.mc.ko[j])).join(' · ')}.</p></div>
    <div><h4>Kosten je Leser und Jahr · P10–P90, Strich = Median</h4>${rangeRows(r)}<p class="note" style="margin-top:8px">${r.mc.gap50!=null?'Abstand Platz 1 zu Platz 2 im Median '+pc(r.mc.gap50)+'; knapper als 10 % in '+pc(r.mc.close10)+' der Zukünfte.':''}</p></div>
   </div>
   <h4 style="font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-mute);margin:16px 0 4px">Was die Antwort kippt</h4>${drv}</div>`;
  draw();if(scroll)$('detail').scrollIntoView({behavior:'smooth',block:'nearest'});}
function mini(d,l){return `<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11.5px;color:var(--ink-mute);width:48px">${l}</span><div class="mini" style="flex:1">${d.map((v,i)=>v>.004?`<span style="flex:${v};background:${COL[O[i]]}" title="${ON[O[i]]}: ${pc(v)}"></span>`:'').join('')}</div></div>`;}

/* ---------- Treiber-Zählung ---------- */
const dc={};R.forEach(r=>{const d=r.mc.drivers[0];if(d&&d.tv>=.05)dc[d.id]=(dc[d.id]||0)+1;else dc['_none']=(dc['_none']||0)+1;});
const dl=Object.entries(dc).sort((a,b)=>b[1]-a[1]);const dmx=Math.max(...dl.map(x=>x[1]));
$('drvcount').innerHTML=dl.slice(0,12).map(([k,v])=>`<div class="hbar"><span>${k==='_none'?'nichts Nennenswertes (stabil)':esc(drvLabel(k))}</span><div class="t" style="width:${(100*v/dmx).toFixed(1)}%;${k==='_none'?'background:#B4B2A2':''}"></div><span class="n">${v}</span></div>`).join('')+
 `<p class="note" style="margin-top:10px">Mengen zählen als Treiber, wenn das untere und das obere Drittel einer Firma zu verschiedenen Gewinnern führen. „Nichts Nennenswertes" heißt: kein Input verschiebt die Verteilung um mehr als 5 Prozentpunkte.</p>`;

/* ---------- Punkt vs. MC ---------- */
const diff=R.filter(r=>(r.mc.rec<0?4:r.mc.rec)!==r.maj);
$('recvs').innerHTML=`<p>Die Punkt-Rechnung nimmt für jede Firma die wahrscheinlichsten Werte und zählt jeden Schalter ab 50 % als gesetzt. Bei <strong>${agree} von 100</strong> Firmen nennt sie denselben Weg wie die Mehrheit der ${DATA.N.toLocaleString('de-DE')} Zukünfte. Bei ${diff.length} nicht:</p>`+
 (diff.length?`<div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Firma</th><th>Punkt-Rechnung</th><th>Monte-Carlo-Mehrheit</th><th>wichtigster Treiber</th></tr></thead><tbody>${diff.map(r=>`<tr><td><a href="#detail-top" data-go="${r.id}">${r.id} ${esc(r.name)}</a></td><td>${r.mc.rec<0?'kein Weg':ON[O[r.mc.rec]]}</td><td>${ON[O[r.maj]]} (${pc(r.conf)})</td><td>${r.mc.drivers[0]?esc(drvLabel(r.mc.drivers[0].id)):'–'}</td></tr>`).join('')}</tbody></table></div>`:'')+
 `<p>Der Grund ist fast immer derselbe: Ein Schalter, der „wahrscheinlich" gilt, wird in der Punkt-Rechnung zur Gewissheit, und ein Must mit 40 % fällt ganz heraus. Die Monte-Carlo-Rechnung behält beide Welten.</p>`;
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();show(a.dataset.go,true);}});

/* ---------- Autoren ---------- */
const au=k=>{const g=R.filter(r=>r.author===k);const m={};g.forEach(r=>m[O[r.maj]]=(m[O[r.maj]]||0)+1);const conf=g.map(r=>r.conf).sort((a,b)=>a-b);
  const fl=g.reduce((a,r)=>a+Object.values(r.flags||{}).filter(v=>v>0).length,0)/g.length,mu=g.reduce((a,r)=>a+Object.values(r.must||{}).filter(v=>v>0).length,0)/g.length;
  const wid=g.map(r=>(r.viewers[2]+1)/(r.viewers[0]+1)).sort((a,b)=>a-b);
  return {n:g.length,m,conf:conf[Math.floor(conf.length/2)],coin:g.filter(r=>r.conf<.5).length,fl,mu,wid:wid[Math.floor(wid.length/2)]};};
const A=au('opus'),S=au('sonnet');
$('authors').innerHTML=`<p>Die beiden Modelle haben verschiedene Ecken des Markts beschrieben, ein fairer Qualitätsvergleich ist das also nicht. Trotzdem fällt auf, wie unterschiedlich viel Unsicherheit sie in ihre Firmen gelegt haben:</p>
<div class="tbl-wrap"><table class="tbl small"><thead><tr><th></th><th class="num">Opus (A, B)</th><th class="num">Sonnet (C, D)</th></tr></thead><tbody>
<tr><td>Firmen</td><td class="num">${A.n}</td><td class="num">${S.n}</td></tr>
<tr><td>Rahmenbedingungen je Firma (Ø)</td><td class="num">${A.fl.toFixed(1).replace('.',',')}</td><td class="num">${S.fl.toFixed(1).replace('.',',')}</td></tr>
<tr><td>Must-Kriterien je Firma (Ø)</td><td class="num">${A.mu.toFixed(1).replace('.',',')}</td><td class="num">${S.mu.toFixed(1).replace('.',',')}</td></tr>
<tr><td>Spanne der Leserzahl max/min (Median)</td><td class="num">${A.wid.toFixed(1).replace('.',',')}×</td><td class="num">${S.wid.toFixed(1).replace('.',',')}×</td></tr>
<tr><td>Sicherheit der Antwort (Median)</td><td class="num">${pc(A.conf)}</td><td class="num">${pc(S.conf)}</td></tr>
<tr><td>Münzwurf-Firmen (&lt; 50 %)</td><td class="num">${A.coin}</td><td class="num">${S.coin}</td></tr>
${O.map(o=>`<tr><td>Mehrheit ${ON[o]}</td><td class="num">${A.m[o]||0}</td><td class="num">${S.m[o]||0}</td></tr>`).join('')}
</tbody></table></div>`;
if(DATA.verdict)$('verdict').innerHTML=`<div class="src-box" style="border-left-color:var(--topic)"><h3>Urteil des Opus-Reviewers</h3>${DATA.verdict.split(/\n{2,}/).map(p=>`<p style="margin-bottom:8px">${esc(p.replace(/\*\*/g,''))}</p>`).join('')}</div>`;

/* ---------- Tabelle ---------- */
$('tbl').innerHTML=`<thead><tr><th>ID</th><th>Firma</th><th>Segment</th><th class="num">Leser</th><th class="num">Paid</th><th class="num">OSS</th><th class="num">Deneb</th><th class="num">Core</th><th class="num">kein</th><th>Punkt</th></tr></thead><tbody>`+
 R.map(r=>`<tr><td>${r.id}</td><td>${esc(r.name)}</td><td>${SEG[r.segment]}</td><td class="num">${nf(r.viewers[1])}</td>${r.mc.win.map(v=>`<td class="num">${pc(v)}</td>`).join('')}<td>${r.mc.rec<0?'kein':ON[O[r.mc.rec]]}</td></tr>`).join('')+'</tbody>';

/* Start: die knappste Firma zeigen */
draw();const start=new URLSearchParams(location.hash.slice(1)).get('f')||R.slice().sort((a,b)=>a.conf-b.conf)[0].id;show(start,false);
})();
