(function(){
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
const tu=R.total.konzern.users,tf=R.total.konzern.firms;const ord=[0,1,2,3].sort((a,b)=>tu[b]-tu[a]);
$('kpis').innerHTML=`<div class="kpi"><div class="v">${ON[O[ord[0]]]} ${pc(tu[ord[0]])}</div><div class="l">Gesamtrating nach Nutzern: Anteil aller Nutzer, deren Firma mit diesem Weg am günstigsten fährt. Knapp dahinter ${ON[O[ord[1]]]} mit ${pc(tu[ord[1]])}.</div></div>
<div class="kpi"><div class="v">${pc(R.conf.coin)}</div><div class="l">der Firmen sind ein Münzwurf: kein Weg gewinnt in mehr als der Hälfte ihrer Zukünfte. Sicher (ab 80 %) sind nur ${pc(R.conf.sure)}.</div></div>
<div class="kpi"><div class="v">${pc(CF.copilot.flip)}</div><div class="l">der Firmen wechseln den Gewinner, wenn eine einzige Zeile dazukommt: „Copilot muss Reports bauen können". Harte Weichen schlagen jeden Kostenhebel.</div></div>`;
const big=R.bands.filter(b=>b.lo>=1000),small=R.bands.filter(b=>b.hi<250);
const sh=(bs,j)=>bs.reduce((a,b)=>a+b.n*b.firms[j],0)/bs.reduce((a,b)=>a+b.n,0);
const hf=Object.values(CF).filter(v=>v.kind==='hard').map(v=>v.flip).sort((x,y)=>y-x),cfl=Object.values(CF).filter(v=>v.kind==='cost').map(v=>v.flip).sort((x,y)=>y-x);
$('lead').innerHTML=`Kein Weg gewinnt überall. <strong>Bei kleinen Firmen ohne harte Regeln gewinnt am häufigsten das gekaufte Visual</strong> (Paid vorn in ${pc(sh(small,0))} der Firmen unter 250 MA), <strong>ab rund 1.000 Mitarbeitenden übernimmt Deneb</strong> (${pc(sh(big,2))} gegen Paid ${pc(sh(big,0))}), und <strong>Core + SVG gewinnt, sobald eine Regel Custom Visuals ausschließt</strong>. Die größte Wirkung haben nicht Preise oder Stunden, sondern einzelne Rahmenbedingungen und Musts: Die sieben stärksten kippen den Gewinner bei ${pc(hf[6])} bis ${pc(hf[0])} der Firmen, der stärkste Kostenhebel bei ${pc(cfl[0])}. KI-gestützte Pflege verschiebt das Bild kaum (${pc(CF.ki.flip)}).`;

/* Gesamt */
const tot=(lab,sub,d)=>`<div class="brow"><div class="lab">${lab}<small>${sub}</small></div>${sbar(d,true)}<div class="val"></div></div>`;
$('total').innerHTML=tot('nach Nutzern','Gesamtrating',tu)+tot('nach Firmen','jede Firma zählt gleich',tf)+tot('ohne KI','nach Nutzern',R.total.base.users)+tot('KI überall','nach Nutzern',R.total.alle.users)+
 `<p class="note">Hauptszenario: KI-Pflege im Konzern. „Nach Nutzern" gewichtet jede Firma mit Ersteller + Viewer (zusammen ${nf(R.usersTotal)} Nutzer). Konzerne sind selten, haben aber viele Nutzer, deshalb liegt Deneb nach Nutzern deutlich höher als nach Firmen.</p>`;

/* Größe */
const lbl=b=>b.hi>=1e9?`ab ${nf(b.lo)}`:b.lo===0?`bis ${nf(b.hi)}`:`${nf(b.lo)}–${nf(b.hi)}`;
$('bands').innerHTML=R.bands.map(b=>`<div class="brow"><div class="lab">${lbl(b)} MA<small>${nf(b.n)} Firmen · ${nf(b.viewers)} Leser</small></div>${sbar(b.firms,true)}<div class="val">${eur(b.best)}</div></div>`).join('');
$('bandnote').textContent='Leser = Median der wahrscheinlichsten Leserzahl. Die Kosten je Viewer fallen mit der Größe, weil Aufbau und Schulung sich auf mehr Köpfe verteilen. Bei 50.000+ Mitarbeitenden sind es nur '+R.bands[R.bands.length-1].n+' Firmen; dort holt Paid über Site-Lizenzen wieder auf.';

/* Hebel */
const lever=k=>{const v=CF[k];const mx=Math.max(...Object.values(CF).map(x=>x.flip));
  const tr=v.trans.slice(0,2).map(t=>`${ON[t[0]]} → ${ON[t[1]]} (${pc(t[2])})`).join(', ');
  return `<div class="lever"><div class="t">${v.label}</div><div class="fl"><i style="width:${(100*v.flip/mx).toFixed(0)}%"></i><b>${pc(v.flip)}</b></div>
  <div class="s">Gewinner kippt bei ${pc(v.flip)} der Firmen (${pc(v.flipUsers)} der Nutzer)${tr?', vor allem '+tr:''}. Günstigster Weg je Viewer und Jahr: ${v.dbest>0?'+':''}${eur(v.dbest)} (Median).</div>
  <div class="dv">${O.map((o,j)=>{const d=v.dshare[j];const w=Math.min(50,Math.abs(d)*50/.8);return `<div>${ON[o]}<div class="tr"><i style="${d>=0?'left:50%':'right:50%'};width:${w}%;background:${o==='none'?'#B4B2A2':COL[o]}"></i></div><b>${pp(d)}</b></div>`;}).join('')}</div></div>`;};
const ks=Object.keys(CF).sort((a,b)=>CF[b].flip-CF[a].flip);
$('lev-hard').innerHTML=ks.filter(k=>CF[k].kind==='hard').map(lever).join('');
$('lev-cost').innerHTML=ks.filter(k=>CF[k].kind==='cost').map(lever).join('')+`<p class="note">Balken: Anteil der Firmen, bei denen der Mehrheitsgewinner wechselt. Darunter die Verschiebung des mittleren Gewinner-Anteils je Weg in Prozentpunkten (rechts = gewinnt öfter). Je Hebel 1.000 Firmen (Bestand: nur Firmen mit Bestand, KI: alle 10.000).</p>`;

/* Regeln */
const d=(k,j)=>pp(CF[k].dshare[j]);
const rules=[
 [`Copilot als Must, Berichtsheft in RDL als Must oder Custom Visuals gesperrt → <b>Core + SVG</b>.`,`Jede dieser Bedingungen kippt den Gewinner bei ${pc(CF.copilot.flip)}, ${pc(CF.paginated.flip)} bzw. ${pc(CF.coreonly.flip)} der Firmen; Core legt jeweils rund ${d('coreonly',3)} zu. Billig ist das nicht: Der günstigste Weg wird im Median um ${eur(CF.coreonly.dbest)} je Viewer und Jahr teurer.`],
 [`IBCS-Zertifikat als Must → <b>Paid oder gar nichts</b>.`,`Paid ${d('ibcscert',0)}, „kein Weg zulässig" ${d('ibcscert',4)}: Wo zusätzlich kein Lizenzbudget da ist oder Custom Visuals gesperrt sind, bleibt keine Lösung übrig.`],
 [`Kein Lizenzbudget, „kein Vendor-Lock-in" als Must oder Report Server → <b>Paid fällt raus, Deneb erbt</b>.`,`Paid ${d('nobudget',0)} / ${d('exit',0)} / ${d('rs',0)}, Deneb ${d('nobudget',2)} / ${d('exit',2)} / ${d('rs',2)}. Open Source und Core legen nur wenig zu.`],
 [`Ohne harte Weiche entscheidet die Größe: <b>klein → Paid, groß → Deneb</b>.`,`Unter 250 MA liegt Paid in ${pc(sh(small,0))} der Firmen vorn, ab 1.000 MA Deneb in ${pc(sh(big,2))}. Die Lizenz wächst mit jedem Leser, Vorlagen und Specs nicht.`],
 [`Teure Lizenz und langer Horizont schieben <b>von Paid zu Deneb</b>.`,`Lizenz 170 € statt 33 €: Paid ${d('lizenzpreis',0)}, Deneb ${d('lizenzpreis',2)}. Zehn statt drei Jahre: Paid ${d('horizont',0)}, Deneb ${d('horizont',2)}.`],
 [`<b>Open Source</b> gewinnt mit einem fertigen Visual, nicht mit Eigenbau.`,`Muss das Visual erst (KI-gestützt) gebaut werden, verliert Open Source ${d('ossbau',1)}. Nur zertifizierte Visuals ohne Org Store: ${d('certonly',1)}, Support-SLA als Must: ${d('sla',1)}.`],
 [`Eine fertige <b>Vorlagenbibliothek</b> hilft Deneb.`,`Deneb ${d('bibliothek',2)}, Paid ${d('bibliothek',0)}; der günstigste Weg wird im Median um ${eur(Math.abs(CF.bibliothek.dbest))} je Viewer und Jahr billiger.`],
 [`<b>KI-Pflege</b> ändert wenig an der Rangfolge.`,`Mit KI in allen Firmen (nach Adoptionsgrad) wechselt der Gewinner bei ${pc(CF.ki.flip)}: Deneb ${d('ki',2)}, Paid ${d('ki',0)}. Im Konzern spart KI je Viewer und Jahr ${R.ai.delta_konzern.map((v,j)=>ON[O[j]]+' '+eur(v)).join(', ')} (Median, KI-Kosten eingerechnet).`],
 [`Der <b>Bestand</b> zählt, aber weniger als die Weichen.`,`Grüne Wiese gegen heutigen Bestand: Gewinner kippt bei ${pc(CF.bestand.flip)} der Firmen mit Bestand. Migration ist teuer, aber eine harte Regel wiegt mehr.`],
];
$('rules').innerHTML=rules.map((r,i)=>`<div class="rule"><div class="n">${i+1}</div><div><b>${r[0]}</b><br>${r[1]}</div></div>`).join('');

/* Szenario OSS mit 1 FTE */
if(DATA.oss){const X=DATA.oss.variants;$('oss-sec').hidden=false;
  const VN={heute:'heute',nur_fertig:'nur fertiges Visual (ungepflegt)',nur_pflege:'nur Pflege durch 1 FTE (Selbstbau bleibt)',gepflegt:'fertig und gepflegt durch 1 FTE',gepflegt_zert:'… und Microsoft-zertifiziert'};
  const FTE=[123000,177000],MARKT=4400;const g=X.gepflegt;const adopt=MARKT*g.ossMajority;
  const per=FTE.map(f=>f/adopt);
  $('oss').innerHTML=`<p>Annahme: Es gibt ein fertiges Open-Source-Visual für den Standard, und ein Maintainer mit einer vollen Stelle pflegt es dauerhaft, so verlässlich wie ein Nischen-Hersteller, aber ohne Lizenz. Für die nutzenden Firmen heißt das: Abkündigungsrisiko 2 % statt 7 % p. a. (wie Paid), Breaking-Fixes kommen von upstream (1 statt 1,5 Ereignisse, 3,5 statt 7 Stunden im Haus), Wartungsquote 14 % statt 22 %, laufende Governance 22 statt 30 Stunden, Anwender-Support 4,5 statt 5,5 Stunden je 100 Viewer. Gerechnet gepaart über dieselben 10.000 Firmen und Zukünfte.</p>
  <div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Variante</th>${O.map(o=>`<th class="num">${ON[o]}</th>`).join('')}<th class="num">Open Source nach Nutzern</th><th class="num">Gewinner kippt</th></tr></thead><tbody>${Object.keys(VN).filter(k=>X[k]).map(k=>`<tr><td>${VN[k]}</td>${X[k].firms.map((v,i)=>`<td class="num"${i===1?' style="font-weight:700"':''}>${pc(v)}</td>`).join('')}<td class="num">${pc(X[k].users[1])}</td><td class="num">${k==='heute'?'–':pc(X[k].flip)}</td></tr>`).join('')}</tbody></table></div>
  <p class="note">Anteil der Firmen, in denen der Weg am häufigsten gewinnt (Mittel der Gewinner-Anteile), Szenario KI-Pflege im Konzern.</p>
  <div class="tbl-wrap"><table class="tbl small"><thead><tr><th>Größe (fertig + gepflegt)</th>${O.map(o=>`<th class="num">${ON[o]}</th>`).join('')}<th class="num">OSS heute</th></tr></thead><tbody>${g.bands.map((b,i)=>`<tr><td>${b.hi>=1e9?'ab '+nf(b.lo):nf(b.lo)+'–'+nf(b.hi)} MA</td>${b.firms.map((v,j)=>`<td class="num"${j===1?' style="font-weight:700"':''}>${pc(v)}</td>`).join('')}<td class="num">${pc(X.heute.bands[i].firms[1])}</td></tr>`).join('')}</tbody></table></div>
  <div class="rule"><div class="n">a</div><div><b>Das fertige Visual ist der größere Hebel, die Pflege der Verstärker.</b><br>Nur fertig: Open Source ${pc(X.heute.firms[1])} → ${pc(X.nur_fertig.firms[1])}. Nur Pflege: → ${pc(X.nur_pflege.firms[1])}. Beides: → ${pc(g.firms[1])}. Pflege allein bringt wenig, solange viele Firmen das Visual erst bauen müssten; mit fertigem Visual macht sie aus einem Außenseiter einen Spitzenreiter.</div></div>
  <div class="rule"><div class="n">b</div><div><b>Open Source nimmt vor allem Paid und Deneb Firmen ab.</b><br>${g.trans.slice(0,2).map(t=>`${ON[t[0]]} → ${ON[t[1]]}: ${pc(t[2])} der Firmen`).join(', ')}. Am stärksten bei kleinen und mittleren Firmen; im Konzern teilt es sich den Platz mit Paid und Deneb. Die harten Weichen bleiben: ${pc(g.ossKo)} der Firmen schließen Open Source weiter per Regel oder Must aus, mit Zertifizierung ${pc(X.gepflegt_zert.ossKo)}.</div></div>
  <div class="rule"><div class="n">c</div><div><b>Zertifizierung macht Open Source zum Spitzenreiter, auch nach Nutzern.</b><br>Mit Microsoft-Zertifizierung fällt das K.O. „nur zertifizierte Visuals“ weg: Open Source ${pc(X.gepflegt_zert.firms[1])} der Firmen und ${pc(X.gepflegt_zert.users[1])} der Nutzer, vor Paid (${pc(X.gepflegt_zert.users[0])}) und Deneb (${pc(X.gepflegt_zert.users[2])}).</div></div>
  <div class="rule"><div class="n">d</div><div><b>Die FTE wäre bezahlbar, das Problem ist das Einsammeln.</b><br>Wo Open Source gewinnt, liegt es im Median ${eur(g.gap.p50)} pro Jahr vor dem nächstbesten Weg (P25 ${eur(g.gap.p25)}, P75 ${eur(g.gap.p75)}). Eine Stelle kostet rund ${eur(FTE[0])} bis ${eur(FTE[1])} im Jahr (1.500 Stunden zu 82 € intern bzw. 118 € extern). Rechenbeispiel: Unsere Population entspricht hochgerechnet rund ${nf(MARKT)} Organisationen in DACH, die in einem Jahr einen Standard einführen wollen; bei ${pc(g.ossMajority)} Open-Source-Mehrheit wären das rund ${nf(adopt)} Nutzer-Firmen. Zahlen alle, sind es ${eur(per[0])} bis ${eur(per[1])} je Firma und Jahr. Zahlt nur jede zehnte, ${eur(10*per[0])} bis ${eur(10*per[1])}: immer noch deutlich unter dem Vorsprung. Nachgerechnet: Bis rund 840 € je Firma und Jahr behält Open Source in jeder Firma, in der es vorn liegt, seinen Vorsprung (Median ihrer Zukünfte); erst bei rund 1.770 € kippen 7 % davon. Offen bleibt, ob Firmen für etwas zahlen, das sie auch gratis bekommen.</div></div>
  <p class="note">Die Pflege-Annahmen sind eine eigene Setzung, angelehnt an die Paid-Werte des Rechners (ein gepflegtes Visual verhält sich bei Fixes und Kontinuität wie ein Herstellerprodukt), keine Messung und nicht durch die Agents geschätzt. Die Marktgröße stammt aus den Gewichten des Firmen-Generators (Größenklassen × Power-BI-Nutzung × Standard-Absicht, Deutschland × 1,3 für DACH) und ist eine grobe Größenordnung. Offenlegung: Mit ChartKitchen byDatenWG betreiben die Autoren selbst ein solches Open-Source-Visual. Dieses Szenario beschreibt genau ihren Fall und ist mit entsprechendem Abstand zu lesen.</p>`;}

/* Sektor / Ebene */
const row=(lab,v)=>`<tr><td>${lab}</td><td class="num">${nf(v.n)}</td><td style="min-width:150px">${sbar(v.firms,false)}</td>${[0,1,2,3,4].map(j=>`<td class="num">${pc(v.firms[j])}</td>`).join('')}<td class="num">${eur(v.best)}</td></tr>`;
$('sector').innerHTML=`<div class="tbl-wrap"><table class="tbl small"><thead><tr><th></th><th class="num">Firmen</th><th></th>${O.map(o=>`<th class="num">${ON[o]}</th>`).join('')}<th class="num">€/Viewer/Jahr</th></tr></thead><tbody>`+
 ['klein','mittelstand','gehoben','konzern'].filter(k=>R.by_level[k]).map(k=>row(LVL[k],R.by_level[k])).join('')+
 `<tr><td colspan="9" style="padding-top:14px"></td></tr>`+['wirtschaft','finanz','oeffentlich'].filter(k=>R.by_sector[k]).map(k=>row(SEC[k],R.by_sector[k])).join('')+`</tbody></table></div><p class="note">Anteil der Firmen, in denen der Weg am häufigsten gewinnt; €/Viewer/Jahr = Median des günstigsten zulässigen Wegs.</p>`;

/* Population */
const H=DATA.hist;const hm=Math.max(...H.map(h=>h.n));
$('hist').innerHTML=H.map(h=>`<div style="height:${(100*h.n/hm).toFixed(1)}%"><span>${nf(h.n)}</span></div>`).join('');
$('hlab').innerHTML=H.map(h=>`<span>${h.hi>=1e9?'≥'+nf(h.lo/1000)+'k':h.lo>=1000?nf(h.lo/1000)+'k':nf(h.lo)}</span>`).join('');
$('popnote').textContent=`Mitarbeitende, linke Klassengrenze. ${Object.entries(R.coverage.level).map(([k,v])=>LVL[k]+': '+nf(v)).join(' · ')}. Jede Firma basiert auf einer von ${R.templates} geprüften Vorlagen.`;
})();
