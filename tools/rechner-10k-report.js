(function(){
/* Report 10.000 Firmen (Rechner v0.24, Harness v3). Alle Aussagen werden aus DATA abgeleitet. */
const O=['paid','oss','deneb','core','none'];
const ON={paid:'Paid',oss:'Open Source',deneb:'Deneb',core:'Core + SVG',none:'kein Weg'};
const COL={paid:'#eb6834',oss:'#1baf7a',deneb:'#2a78d6',core:'#eda100',none:'#B4B2A2'};
const SEC={wirtschaft:'Wirtschaft',finanz:'Bank, Versicherung, Klinik',oeffentlich:'Öffentliche Hand'};
const LVL={klein:'Klein (< 250 MA)',mittelstand:'Mittelstand (250–1.999)',gehoben:'Gehoben (2.000–10.000)',konzern:'Konzern (> 10.000)'};
const $=id=>document.getElementById(id);const R=DATA.rep,CF=DATA.cf;
const pc=v=>Math.round(100*v)+' %';const pp=v=>(v>0?'+':v<0?'−':'±')+Math.abs(Math.round(100*v))+' Pp.';
const nf=n=>Math.round(n).toLocaleString('de-DE');const eur=n=>n==null?'–':nf(n)+' €';
const sbar=(d,lab)=>`<div class="sbar">${d.map((v,i)=>v>.004?`<span class="${O[i]==='none'?'none':''}" style="flex:${v};${O[i]==='none'?'':'background:'+COL[O[i]]}" title="${ON[O[i]]}: ${pc(v)}">${lab&&v>=.08?Math.round(100*v):''}</span>`:'').join('')}</div>`;
$('legend').innerHTML=O.map(o=>`<span><i style="background:${o==='none'?'repeating-linear-gradient(45deg,#B4B2A2 0 3px,#E7E4DA 3px 6px)':COL[o]}"></i>${ON[o]}${o==='none'?' zulässig':''}</span>`).join('');

/* KPIs + Lead */
const tu=R.total.konzern.users,tf=R.total.konzern.firms;const ord=[0,1,2,3].sort((a,b)=>tu[b]-tu[a]);const BT=R.boot;
$('kpis').innerHTML=`<div class="kpi"><div class="v">${ON[O[ord[0]]]} ${pc(tu[ord[0]])}</div><div class="l">Gesamtrating nach Nutzern (Intervall ${pc(BT.users.lo[ord[0]])}–${pc(BT.users.hi[ord[0]])}). Platz 1 in ${pc(BT.users.p1[ord[0]])} der Bootstrap-Stichproben über die Vorlagen. Zweiter: ${ON[O[ord[1]]]} mit ${pc(tu[ord[1]])}.</div></div>
<div class="kpi"><div class="v">${pc(R.conf.coin)}</div><div class="l">der Firmen sind ein Münzwurf: kein Weg gewinnt in mehr als der Hälfte ihrer Zukünfte. Sicher (ab 80 %) sind ${pc(R.conf.sure)}.</div></div>
<div class="kpi"><div class="v">${pc(CF.nobudget.contrib)}</div><div class="l">der Firmen kippen allein durch „kein Lizenzbudget“: der Hebel mit dem größten Gewicht in der Population (wirkt bei ${pc(CF.nobudget.flip)}, gilt bei ${pc(CF.nobudget.prev)}).</div></div>`;
const bandsOf=(lo,hi)=>R.bands.filter(b=>b.lo>=lo&&b.hi<=hi);
const sh=(bs,j)=>bs.reduce((a,b)=>a+b.n*b.firms[j],0)/bs.reduce((a,b)=>a+b.n,0);
const small=bandsOf(0,999),mid=bandsOf(1000,9999),big=bandsOf(10000,1e10);
const hf=Object.values(CF).filter(v=>v.kind==='hard'&&v.flip>0).map(v=>v.flip).sort((x,y)=>y-x),cfl=Object.values(CF).filter(v=>v.kind==='cost').map(v=>v.flip).sort((x,y)=>y-x);
$('lead').innerHTML=`Kein Weg gewinnt überall, aber <strong>Paid liegt nach der Korrektur des Rechners klar vorn</strong>: bei Firmen unter 1.000 Mitarbeitenden im Mittel in ${pc(sh(small,0))} der Zukünfte, vor Deneb (${pc(sh(small,2))}) und Core + SVG (${pc(sh(small,3))}). <strong>Zwischen 1.000 und 10.000 Mitarbeitenden wird es ein Zweikampf</strong> Paid ${pc(sh(mid,0))} gegen Deneb ${pc(sh(mid,2))}, im Konzern liegt Paid wieder vorn (${pc(sh(big,0))}). <strong>Core + SVG gewinnt, sobald Custom Visuals ausgeschlossen sind</strong>, und Open Source spielt ohne Microsoft-Zertifizierung kaum eine Rolle (${pc(tf[1])} der Firmen), weil es an der Export-Pflicht scheitert. Wo eine harte Weiche gilt, entscheidet sie fast immer (bis ${pc(hf[0])} der Firmen kippen). Weil die meisten Weichen aber selten gelten, tragen sie in der Population einzeln höchstens ${pc(Math.max(...Object.values(CF).filter(v=>v.kind==='hard'&&v.contrib!=null).map(v=>v.contrib)))} bei. Kostenhebel wie der Lizenzpreis verschieben dagegen bei vielen Firmen etwas (Lizenzpreis ${pc(CF.lizenzpreis.flip)} zwischen 33 und 170 €). KI-gestützte Pflege verschiebt das Bild kaum (${pc(CF.ki.flip)}).`;

/* Gesamt */
const tot=(lab,sub,d)=>`<div class="brow"><div class="lab">${lab}<small>${sub}</small></div>${sbar(d,true)}<div class="val"></div></div>`;
$('total').innerHTML=tot('nach Nutzern','Gesamtrating',tu)+tot('nach Firmen','jede Firma zählt gleich',tf)+tot('Mehrheit, Firmen','häufigster Weg je Firma',R.majorityShares.firms)+tot('ohne KI','nach Nutzern',R.total.base.users)+tot('KI überall','nach Nutzern',R.total.alle.users)+
 `<div class="tbl-wrap"><table class="tbl small" style="margin-top:14px"><thead><tr><th>Weg</th><th class="num">nach Nutzern</th><th class="num">90-%-Intervall</th><th class="num">Platz 1 im Bootstrap</th><th class="num">nach Firmen</th><th class="num">Mehrheit (Firmen)</th></tr></thead><tbody>${[0,1,2,3].sort((a,b)=>tu[b]-tu[a]).map(j=>`<tr><td><span class="sw" style="background:${COL[O[j]]}"></span>${ON[O[j]]}</td><td class="num"><b>${pc(tu[j])}</b></td><td class="num">${pc(BT.users.lo[j])}–${pc(BT.users.hi[j])}</td><td class="num">${pc(BT.users.p1[j])}</td><td class="num">${pc(tf[j])}</td><td class="num">${pc(R.majorityShares.firms[j])}</td></tr>`).join('')}</tbody></table></div>
 <p class="note">Hauptszenario: KI-Pflege im Konzern. „Nach Nutzern“ und „nach Firmen“ = mittlerer Anteil der Zukünfte, in denen der Weg der günstigste zulässige ist, gewichtet mit Ersteller + Viewer (zusammen ${nf(R.usersTotal)} Nutzer) bzw. je Firma gleich. „Mehrheit“ = Anteil der Firmen, bei denen der Weg in den meisten Zukünften gewinnt; diese Zählung verstärkt den Spitzenreiter. Intervall und Platz 1: Cluster-Bootstrap über die Vorlagen (1.000 Stichproben), weil die Firmen Varianten von Vorlagen sind. Bleibt in einer Zukunft kein Weg zulässig, verhandelt die Firma ihre Must-Liste; ohne Verhandlung wäre das in ${pc(R.negotiation.strictNone)} der Zukünfte so.</p>`;

/* Größe */
const lbl=b=>b.hi>=1e9?`ab ${nf(b.lo)}`:b.lo===0?`bis ${nf(b.hi)}`:`${nf(b.lo)}–${nf(b.hi)}`;
$('bands').innerHTML=R.bands.map(b=>`<div class="brow"><div class="lab">${lbl(b)} MA<small>${nf(b.n)} Firmen · ${nf(b.viewers)} Leser</small></div>${sbar(b.firms,true)}<div class="val">${eur(b.best)}</div></div>`).join('')+
 `<div class="tbl-wrap"><table class="tbl small" style="margin-top:12px"><thead><tr><th>Mitarbeitende</th><th class="num">günstigster Weg €/Viewer/Jahr</th><th class="num">davon Auszahlung</th><th class="num">ohne Standard</th><th class="num">Standard günstiger in</th></tr></thead><tbody>${R.bands.map(b=>`<tr><td>${lbl(b)}</td><td class="num">${eur(b.best)}</td><td class="num">${b.bestHard!=null?pc(b.bestHard):'–'}</td><td class="num">${eur(b.sq)}</td><td class="num">${b.beatSQ!=null?pc(b.beatSQ):'–'}</td></tr>`).join('')}</tbody></table></div>`;
$('bandnote').textContent='Balken: mittlerer Anteil der Zukünfte, in denen der Weg der günstigste zulässige ist. Rechts und in der Tabelle: Kosten des günstigsten Wegs je Viewer und Jahr (Median), davon als Auszahlung (Lizenz, Kurse, Externe, KI-Werkzeuge; der Rest ist eigene Zeit), und die Null-Option des Rechners (kein Standard: Ad-hoc-Bau, Wartung, Leserzeit, Rückfragen) mit dem Anteil der Zukünfte, in denen ein Standard günstiger ist. Bei 50.000+ Mitarbeitenden sind es nur '+R.bands[R.bands.length-1].n+' Firmen.';

/* Hebel */
const mxFlip=Math.max(...Object.values(CF).map(x=>x.flip));
const lever=(k,showPrev)=>{const v=CF[k];
  const tr=v.trans.slice(0,2).map(t=>`${ON[t[0]]} → ${ON[t[1]]} (${pc(t[2])})`).join(', ');
  const prev=showPrev&&v.prev!=null?` Gilt bei ${pc(v.prev)} der Firmen (mittlere Wahrscheinlichkeit); Beitrag in der Population: <b>${pc(v.contrib)}</b>.`:'';
  return `<div class="lever"><div class="t">${v.label}</div><div class="fl"><i style="width:${(100*v.flip/mxFlip).toFixed(0)}%"></i><b>${pc(v.flip)}</b></div>
  <div class="s">Gewinner kippt bei ${pc(v.flip)} der Firmen (${pc(v.flipUsers)} der Nutzer)${tr?', vor allem '+tr:''}. Günstigster Weg je Viewer und Jahr: ${v.dbest>0?'+':''}${eur(v.dbest)} (Median).${prev}</div>
  <div class="dv">${O.map((o,j)=>{const d=v.dshare[j];const w=Math.min(50,Math.abs(d)*50/.8);return `<div>${ON[o]}<div class="tr"><i style="${d>=0?'left:50%':'right:50%'};width:${w}%;background:${o==='none'?'#B4B2A2':COL[o]}"></i></div><b>${pp(d)}</b></div>`;}).join('')}</div></div>`;};
const ks=Object.keys(CF).filter(k=>k!=='placebo').sort((a,b)=>CF[b].flip-CF[a].flip);
const zero=ks.filter(k=>CF[k].kind==='hard'&&CF[k].flip===0);
$('lev-hard').innerHTML=ks.filter(k=>CF[k].kind==='hard'&&CF[k].flip>0).map(k=>lever(k,true)).join('')+
 (zero.length?`<p class="note" style="margin-top:10px"><b>Kontrollfälle:</b> ${zero.map(k=>CF[k].label.split(':')[0]).join(', ')} kippen seit Rechner v0.24 exakt 0 % der Firmen, weil sie bei Paid nur noch warnen bzw. alle Wege gleich treffen. Dass hier wirklich 0 herauskommt, zeigt auch, dass A und B dieselben Zukünfte sehen. Ohne diese Kopplung kippt allein das Rauschen ${pc(CF.placebo?CF.placebo.flip:0)} der Firmen (Placebo: dieselbe Fassung, anderer Zufallsstrom).</p>`:'');
$('lev-cost').innerHTML=ks.filter(k=>CF[k].kind==='cost').map(k=>lever(k,k==='bibliothek'||k==='ossbau'||k==='ibcsall')).join('')+`<p class="note">Balken: Anteil der Firmen, bei denen der Mehrheitsgewinner wechselt, wenn der Hebel bei allen umgelegt wird. Darunter die Verschiebung des mittleren Gewinner-Anteils je Weg in Prozentpunkten (rechts = gewinnt öfter). „Beitrag in der Population“ = Kipp-Rate × Anteil der Firmen, bei denen der Schalter tatsächlich gilt. Kostenhebel werden zwischen gesetzten Extremwerten verschoben; ihre Kipp-Raten sind deshalb untereinander, aber nicht direkt mit den Weichen vergleichbar. Je Hebel 1.000 Firmen (Bestand: nur Firmen mit Bestand, KI: alle 10.000).</p>`;

/* Regeln */
const d=(k,j)=>pp(CF[k].dshare[j]);
const rules=[
 [`Ohne harte Weiche gewinnt meist <b>Paid</b>, je kleiner, desto klarer.`,`Unter 1.000 Mitarbeitenden ist Paid im Mittel in ${pc(sh(small,0))} der Zukünfte am günstigsten. Die Lizenz ist bei wenigen Lesern billiger als jede eigene Stunde, und Paid braucht absolut die wenigsten eigenen Stunden.`],
 [`Zwischen 1.000 und 10.000 Mitarbeitenden: <b>Paid gegen Deneb</b>.`,`Paid ${pc(sh(mid,0))}, Deneb ${pc(sh(mid,2))}. Den Ausschlag geben Lizenzpreis (Paid ${d('lizenzpreis',0)} bei 170 € statt 33 €), Horizont (Paid ${d('horizont',0)} bei zehn statt drei Jahren) und eine vorhandene Vorlagenbibliothek (Deneb ${d('bibliothek',2)}).`],
 [`Copilot als Must oder Custom Visuals gesperrt → <b>Core + SVG</b>.`,`Kippt den Gewinner bei ${pc(CF.copilot.flip)} bzw. ${pc(CF.coreonly.flip)} der Firmen, Core ${d('copilot',3)} bzw. ${d('coreonly',3)}. Der günstigste Weg wird dadurch im Median um ${eur(CF.coreonly.dbest)} je Viewer und Jahr teurer. Beides ist selten (${pc(CF.copilot.prev)} bzw. ${pc(CF.coreonly.prev)} der Firmen).`],
 [`Kein Lizenzbudget → <b>Paid fällt raus, Deneb erbt</b>.`,`Paid ${d('nobudget',0)}, Deneb ${d('nobudget',2)}, Core ${d('nobudget',3)}. In der Population der gewichtigste Schalter: Beitrag ${pc(CF.nobudget.contrib)}.`],
 [`IBCS-Zertifikat als Must → <b>Paid oder gar nichts</b>.`,`Paid ${d('ibcscert',0)}, „kein Weg“ ${d('ibcscert',4)}.`],
 [`Vertraglicher Support (SLA) als Must → <b>Deneb und Open Source fallen raus</b>.`,`Deneb ${d('sla',2)}, Paid ${d('sla',0)}, Core ${d('sla',3)}.`],
 [`<b>Open Source</b> braucht Zertifizierung und ein fertiges Visual.`,`Ohne Microsoft-Zertifizierung scheitert ein Open-Source-Visual an der Export-Pflicht; muss es zudem erst gebaut werden, verliert Open Source weitere ${Math.abs(Math.round(100*CF.ossbau.dshare[1]))} Prozentpunkte. Was ein gepflegtes, zertifiziertes Visual ändert, zeigt der Abschnitt darüber.`],
 [`Report Server, „kein Vendor-Lock-in“ und RDL entscheiden <b>nicht mehr</b>.`,`Seit Rechner v0.24 sind sie für alle Wege Warnungen (Hersteller-Lizenzwege, Ausstieg als eigene Kennzahl, RDL-Zweitbau für alle gleich). Vorher schlossen sie Paid aus und erzeugten die Schlagzeile „Core gleichauf mit Paid“.`],
 [`<b>KI-Pflege</b> ändert wenig an der Rangfolge.`,`Mit KI in allen Firmen (nach Adoptionsgrad) wechselt der Gewinner bei ${pc(CF.ki.flip)}. Im Konzern spart KI je Viewer und Jahr ${R.ai.delta_konzern.map((v,j)=>ON[O[j]]+' '+eur(v)).join(', ')} (Median, KI-Kosten eingerechnet).`],
];
$('rules').innerHTML=rules.map((r,i)=>`<div class="rule"><div class="n">${i+1}</div><div><b>${r[0]}</b><br>${r[1]}</div></div>`).join('');

/* OSS-Szenario */
if(DATA.oss){const X=DATA.oss.variants;$('oss-sec').hidden=false;
  const VN={heute:'heute (Rechner v0.24)',oss_1fte:'OSS: fertig, 1 FTE pflegt (Bus-Faktor)',oss_1fte_zert:'… und Microsoft-zertifiziert',oss_3fte_zert_abo:'OSS: 3 FTE, zertifiziert, Pflicht-Abo 2.800 €/Jahr',deneb_lib_1fte:'Gegenszenario: 1 FTE pflegt Deneb-Vorlagen'};
  const keys=Object.keys(VN).filter(k=>X[k]);
  $('oss').innerHTML=`<p>Was ändert ein Open-Source-Visual, das jemand dauerhaft pflegt? Nach dem Review rechnen wir das ehrlicher als in der ersten Fassung: <b>Eine Person ist ein Bus-Faktor</b> (Abkündigungsrisiko 3–6–11 % pro Jahr statt 2 %, passend zur Fluktuation von 11 %). <b>Ein Team kostet</b>, und das schlagen wir den Firmen als Pflicht-Abo zu (3 Stellen zu je rund 123.000 €, von jeder zehnten Nutzer-Firma getragen, ergibt rund 2.800 € je zahlender Firma und Jahr). Die <b>Zertifizierung</b> ist eine eigene Variante. Und dieselbe Pflegestelle bekommt im <b>Gegenszenario</b> Deneb, als gepflegte Vorlagenbibliothek. Für die Nutzer-Firmen gilt bei Pflege: Breaking-Fixes kommen von upstream (1 statt 1,5 Ereignisse, 3,5 statt 7 Stunden im Haus), Wartungsquote 14 % statt 22 %, weniger Governance und Support.</p>
  <div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Variante</th>${O.map(o=>`<th class="num">${ON[o]}</th>`).join('')}<th class="num">OSS nach Nutzern</th><th class="num">Gewinner kippt</th></tr></thead><tbody>${keys.map(k=>`<tr><td>${VN[k]}</td>${X[k].firms.map((v,i)=>`<td class="num"${(i===1&&k.startsWith('oss'))||(i===2&&k.startsWith('deneb'))?' style="font-weight:700"':''}>${pc(v)}</td>`).join('')}<td class="num">${pc(X[k].users[1])}</td><td class="num">${k==='heute'?'–':pc(X[k].flip)}</td></tr>`).join('')}</tbody></table></div>
  <p class="note">Mittlerer Anteil der Zukünfte, in denen der Weg der günstigste zulässige ist, je Firma gleich gewichtet; gepaart über dieselben 10.000 Firmen und Zukünfte, KI-Pflege im Konzern. „Gewinner kippt“ = Anteil der Firmen, deren Mehrheitsweg sich gegenüber „heute“ ändert.</p>
  ${(()=>{const a=X.oss_1fte,b=X.oss_1fte_zert,c=X.oss_3fte_zert_abo,g=X.deneb_lib_1fte,h=X.heute;if(!a||!b||!c||!g)return '';
   const lead=c.firms[1]>c.firms[0];
   return `<div class="rule"><div class="n">a</div><div><b>Pflege allein hilft, reicht aber nicht.</b><br>Open Source ${pc(h.firms[1])} → ${pc(a.firms[1])}, Paid bleibt vorn (${pc(a.firms[0])}). Ohne Zertifizierung schließt die Export-Pflicht ein Open-Source-Visual weiter in ${pc(a.ossKo)} der Zukünfte aus.</div></div>
   <div class="rule"><div class="n">b</div><div><b>Erst die Zertifizierung macht Open Source zum Spitzenreiter.</b><br>Mit Zertifizierung ${pc(b.firms[1])} der Firmen und ${pc(b.users[1])} der Nutzer, vor Paid (${pc(b.firms[0])}); ausgeschlossen nur noch in ${pc(b.ossKo)} der Zukünfte. Für den Maintainer heißt Zertifizierung aber auch: jede neue Version durchläuft die Prüfung erneut. Und hier trägt eine einzelne, nicht bezahlte Stelle das Ganze.</div></div>
   <div class="rule"><div class="n">c</div><div><b>${lead?'Auch mit realistischer Finanzierung bleibt Open Source vorn.':'Mit realistischer Finanzierung liegt Paid wieder vorn.'}</b><br>Mit 3 Stellen und einem Pflicht-Abo von 2.800 € je Firma und Jahr: Paid ${pc(c.firms[0])}, Open Source ${pc(c.firms[1])}, Core ${pc(c.firms[3])}, Deneb ${pc(c.firms[2])} (nach Nutzern Paid ${pc(c.users[0])}, Open Source ${pc(c.users[1])}). Ein gepflegtes, zertifiziertes Open-Source-Visual ist dann im Grunde ein günstiges Paid-Produkt mit offenem Code, und es konkurriert auch so.</div></div>
   <div class="rule"><div class="n">d</div><div><b>Dieselbe Stelle für Deneb-Vorlagen bringt Deneb genauso weit.</b><br>Deneb ${pc(h.firms[2])} → ${pc(g.firms[2])}, ohne Zertifizierungsproblem, weil Deneb selbst zertifiziert ist. Wer eine Pflegestelle finanzieren will, sollte beide Optionen vergleichen.</div></div>`;})()}
  <p class="note">Die Pflege-Annahmen und das Abo sind eigene Setzungen, angelehnt an die Paid-Werte des Rechners; keine Messung. Die Kapazität einer Stelle (Releases, Rezertifizierung, Support für tausende Firmen) ist nur über den Bus-Faktor und das 3-FTE-Team abgebildet, nicht als eigenes Modell. <b>Offenlegung:</b> Die Autoren betreiben mit ChartKitchen byDatenWG selbst ein solches Open-Source-Visual und mit dem Business Chart Builder Deneb-Vorlagen; beide Szenarien beschreiben ihren eigenen Fall.</p>`;}

/* Sektor / Ebene */
const row=(lab,v)=>`<tr><td>${lab}</td><td class="num">${nf(v.n)}</td><td style="min-width:150px">${sbar(v.firms,false)}</td>${[0,1,2,3].map(j=>`<td class="num">${pc(v.firms[j])}</td>`).join('')}<td class="num">${eur(v.best)}</td></tr>`;
$('sector').innerHTML=`<div class="tbl-wrap"><table class="tbl small"><thead><tr><th></th><th class="num">Firmen</th><th></th>${O.slice(0,4).map(o=>`<th class="num">${ON[o]}</th>`).join('')}<th class="num">€/Viewer/Jahr</th></tr></thead><tbody>`+
 ['klein','mittelstand','gehoben','konzern'].filter(k=>R.by_level[k]).map(k=>row(LVL[k],R.by_level[k])).join('')+
 `<tr><td colspan="8" style="padding-top:14px"></td></tr>`+['wirtschaft','finanz','oeffentlich'].filter(k=>R.by_sector[k]).map(k=>row(SEC[k],R.by_sector[k])).join('')+`</tbody></table></div><p class="note">Mittlerer Anteil der Zukünfte, in denen der Weg der günstigste zulässige ist; €/Viewer/Jahr = Median des günstigsten zulässigen Wegs.</p>`;

/* Population */
const H=DATA.hist;const hm=Math.max(...H.map(h=>h.n));
$('hist').innerHTML=H.map(h=>`<div style="height:${(100*h.n/hm).toFixed(1)}%"><span>${nf(h.n)}</span></div>`).join('');
$('hlab').innerHTML=H.map(h=>`<span>${h.hi>=1e9?'≥'+nf(h.lo/1000)+'k':h.lo>=1000?nf(h.lo/1000)+'k':nf(h.lo)}</span>`).join('');
const TE=R.templatesEff;
$('popnote').textContent=`Mitarbeitende, linke Klassengrenze. ${Object.entries(R.coverage.level).map(([k,v])=>LVL[k]+': '+nf(v)).join(' · ')}. Jede Firma basiert auf einer von ${R.templates} geprüften Vorlagen; effektiv tragen ${nf(TE.firms)} Vorlagen die Zählung nach Firmen und ${nf(TE.users)} die nach Nutzern, die größte stellt ${pc(TE.topUser[0][1])} der Nutzer. ${pc(TE.usersGtEmp)} der Firmen haben externe Leser (mehr Nutzer als Mitarbeitende).`;
})();
