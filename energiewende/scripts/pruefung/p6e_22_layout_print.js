const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  await p.goto('http://127.0.0.1:8822/energiewende-1-story.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>window.__storyReady===true);
  await p.emulateMedia({media:'print'});
  await p.waitForTimeout(500);
  console.log(await p.evaluate(()=>[...document.querySelectorAll('figure.sf')].filter(f=>f.getBoundingClientRect().height>0).length + ' sichtbare Grafiken im Druck; mslot gefüllt: '+[...document.querySelectorAll('.mslot')].filter(m=>m.children.length).length));
  await b.close();
})();
