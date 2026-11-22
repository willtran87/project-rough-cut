const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const baseline=false,software=process.argv.includes('--software');
const root=process.env.INTRO_EVIDENCE||'output/intro-style',out=`${root}/${baseline?'before':'after'}${software?'-software':''}`;fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const page=await browser.newPage({viewport:{width:2560,height:1600},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__intro={state,render,startIntro,enterMenu,art,grassArt,frames:()=>runtimePerformance.renderedFrames};\n  window.advanceTime = (milliseconds) => {')}));
 await page.goto('http://127.0.0.1:4187/index.html');await page.waitForFunction(()=>window.__intro&&__intro.art.naturalWidth&&__intro.grassArt.naturalWidth,null,{timeout:120000});
 await page.waitForFunction(()=>RCIntroPresentation.stats().ready);
 await page.evaluate(()=>{__intro.enterMenu();__intro.render();});await page.waitForTimeout(2500);
 const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
 const samples=[];
 for(let i=0;i<(process.argv.includes('--checks-only')?0:2);i++){
  await page.evaluate(()=>{__intro.state.manualTime=false;__intro.state.reducedMotion=false;__intro.startIntro();});const a=await metrics(),f=await page.evaluate(()=>__intro.frames());
  await page.waitForFunction(()=>__intro.state.mode==='menu',null,{timeout:20000});const b=await metrics();samples.push({seconds:b.Timestamp-a.Timestamp,taskMs:(b.TaskDuration-a.TaskDuration)*1000,layoutMs:(b.LayoutDuration-a.LayoutDuration)*1000,frames:(await page.evaluate(()=>__intro.frames()))-f});
 }
 if(samples.length)fs.writeFileSync(out+'/timing.json',JSON.stringify({baseline,software,samples},null,2));
 const seek=async(t,reduced=false)=>{await page.evaluate(({t,reduced})=>{__intro.state.manualTime=true;__intro.state.mode='intro';__intro.state.time=t;__intro.state.reducedMotion=reduced;__intro.state.subtitles=true;__intro.state.transitionAlpha=0;__intro.render();},{t,reduced});await page.waitForTimeout(60);await page.evaluate(()=>__intro.render());await page.waitForTimeout(30);};
 const heldTime=await page.evaluate(()=>(window.RCIntroPresentation?.timing?.lineStart??5.25)+.55);
 for(const t of [0.6,2.6,4.3,4.7,5.1,heldTime,7.3,8.14]){await seek(t);await page.screenshot({path:`${out}/intro-${t}-2560.png`});}
 {
  for(const [width,height]of [[1280,720],[390,844]]){await page.setViewportSize({width,height});await seek(heldTime);await page.screenshot({path:`${out}/intro-${width}.png`});}
  await page.setViewportSize({width:1280,height:720});await page.waitForTimeout(100);await seek(heldTime,true);const reducedShot=await page.screenshot({path:out+'/reduced.png'});await seek(heldTime+.4,true);assert(reducedShot.equals(await page.screenshot({path:out+'/reduced-held.png'})),'Reduced-motion hold moved');
  for(const reduced of [false,true]){
   for(const key of ['Enter','Space','Escape']){await seek(3,reduced);await page.keyboard.press(key);await page.evaluate(()=>advanceTime(17));assert.equal(await page.evaluate(()=>__intro.state.mode),'intro');assert(!(await page.locator('#course-menu').isVisible()));}
   for(const action of ['click','tap']){await seek(3,reduced);await page.locator('#game-shell')[action]({position:{x:100,y:100}});assert.equal(await page.evaluate(()=>__intro.state.mode),'intro');}
   for(const button of [0,1,9]){await seek(3,reduced);await page.evaluate(()=>{window.testPad={connected:true,id:'Intro test',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};navigator.getGamepads=()=>[testPad];});await page.evaluate(()=>advanceTime(60));await page.evaluate(b=>testPad.buttons[b]={pressed:true,value:1},button);await page.evaluate(()=>advanceTime(60));assert.equal(await page.evaluate(()=>__intro.state.mode),'intro');await page.evaluate(()=>navigator.getGamepads=()=>[]);}
   const menuTime=await page.evaluate(()=>RCIntroPresentation.timing.menu);
   await seek(menuTime-.1,reduced);await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>__intro.state.mode),'intro');await page.evaluate(()=>advanceTime(200));assert.equal(await page.evaluate(()=>__intro.state.mode),'menu');assert(await page.locator('#course-menu').isVisible());
   await page.screenshot({path:`${out}/completed-${reduced?'reduced':'normal'}.png`});
   const selected=await page.evaluate(()=>__intro.state.menuIndex);await page.keyboard.press('ArrowDown');assert.notEqual(await page.evaluate(()=>__intro.state.menuIndex),selected,'Menu must accept input after the intro');
  }
  await page.evaluate(()=>{__intro.startIntro();__intro.state.manualTime=false;Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false});window.dispatchEvent(new Event('blur'));});const t=await page.evaluate(()=>__intro.state.time);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>__intro.state.time),t);await page.evaluate(()=>{delete document.hasFocus;window.dispatchEvent(new Event('focus'));});await page.waitForTimeout(150);assert((await page.evaluate(()=>__intro.state.time))>t);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});const hiddenTime=await page.evaluate(()=>__intro.state.time);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>__intro.state.time),hiddenTime);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.emulateMedia({reducedMotion:'reduce'});await seek(heldTime);assert.equal(await page.evaluate(()=>RCIntroPresentation.stats().reduced),true);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{__intro.enterMenu();__intro.render();});await page.waitForTimeout(450);assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
 }
 assert.deepEqual(errors,[]);const report={baseline,software,samples,errors};fs.writeFileSync(out+(process.argv.includes('--checks-only')?'/checks.json':'/report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
