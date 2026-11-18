#!/usr/bin/env node
/* Rendert die Infografik (assets/posts/no-free-lunch/infografik.html) zu zwei PNGs (2×) und einem PDF-Karussell.
   Aufruf: NODE_PATH=$(npm root -g) node tools/no-free-lunch-render.js */
const {chromium}=require('playwright');const path=require('path');
const D=path.resolve(__dirname,'..','assets','posts','no-free-lunch')+'/';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+D+'infografik.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
  await (await p.$('#slide1')).screenshot({path:D+'no-free-lunch-1.png'});await (await p.$('#slide2')).screenshot({path:D+'no-free-lunch-2.png'});
  await p.pdf({path:D+'no-free-lunch-carousel.pdf',width:'1080px',height:'1350px',printBackground:true,margin:{top:0,right:0,bottom:0,left:0}});
  console.log('gerendert',errs.length?errs:'');await b.close();})();
