const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const out='output/intro-title-break/continuity';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__titleBreak={state,render,frame:()=>mainCtx.canvas.toDataURL(),pixels:()=>mainCtx.getImageData(0,0,1280,720).data};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__titleBreak&&RCIntroPresentation.stats().ready);
 const checks=[];
 for(const [width,height]of [[2560,1600],[390,844]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>{__titleBreak.state.manualTime=true;__titleBreak.state.mode='gate';__titleBreak.state.time=0;__titleBreak.state.transitionAlpha=0;__titleBreak.render();});await page.waitForTimeout(100);await page.evaluate(()=>{__titleBreak.render();window.beforeStart=__titleBreak.frame();window.beforePixels=__titleBreak.pixels();});await page.screenshot({path:`${out}/gate-${width}.png`});
  await page.keyboard.press('Enter');await page.evaluate(()=>__titleBreak.render());
  const continuity=await page.evaluate(()=>({same:beforeStart===__titleBreak.frame(),mode:__titleBreak.state.mode,fade:__titleBreak.state.transitionAlpha,time:__titleBreak.state.time}));await page.screenshot({path:`${out}/started-${width}.png`});if(!continuity.same)console.log(await page.evaluate(()=>{const d=__titleBreak.pixels();let count=0,minX=1280,minY=720,maxX=0,maxY=0,maxDelta=0;for(let i=0;i<d.length;i+=4){const delta=Math.max(Math.abs(d[i]-beforePixels[i]),Math.abs(d[i+1]-beforePixels[i+1]),Math.abs(d[i+2]-beforePixels[i+2]));if(delta){count++;const x=i/4%1280,y=Math.floor(i/4/1280);minX=Math.min(x,minX);maxX=Math.max(x,maxX);minY=Math.min(y,minY);maxY=Math.max(y,maxY);maxDelta=Math.max(delta,maxDelta);}}return {count,minX,maxX,minY,maxY,maxDelta};}));console.log(JSON.stringify(continuity));assert.equal(continuity.mode,'intro');assert.equal(continuity.fade,0);assert(continuity.same,'Gate and first intro frame must match exactly');checks.push({width,...continuity});
  for(const time of [.8,1.35,1.5,1.7,2.45,5.78]){await page.evaluate(t=>{__titleBreak.state.time=t;__titleBreak.render();},time);await page.screenshot({path:`${out}/beat-${time}-${width}.png`});if(time===.8)assert.equal(await page.evaluate(()=>RCIntroPresentation.stats().titlePhase),'intact');if(time===2.45)assert.equal(await page.evaluate(()=>RCIntroPresentation.stats().titlePhase),'cleared');}
 }
 assert.equal(await page.evaluate(()=>RCIntroPresentation.stats().drawnGrass),false);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
