const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w,h] of [[1280,720],[1366,768],[1024,700]]) {
    const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage();
    await p.goto('http://127.0.0.1:8822/energiewende-1-story.html',{waitUntil:'networkidle'});
    await p.waitForFunction(()=>window.__storyReady===true);
    const out=[];
    for (const sid of ['4.3','5.1','5.3','5.2','4.4']) {
      await p.evaluate(s=>document.querySelector(`.step[data-sid="${s}"]`).scrollIntoView({block:'center',behavior:'instant'}),sid);
      await p.waitForTimeout(600);
      const r = await p.evaluate(s=>{const f=document.querySelector(`.dslot[data-sid="${s}"] figure`);const q=f.getBoundingClientRect();return [Math.round(q.top),Math.round(q.bottom),innerHeight];},sid);
      out.push(sid+':'+r.join('/'));
      if (sid==='4.3') await p.screenshot({path:`shots/story_${w}x${h}_viewport_s4-3.png`});
    }
    console.log(w,h,out.join('  '));
  }
  await b.close();
})();
