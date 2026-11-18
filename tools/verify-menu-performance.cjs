const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const baseline=process.argv.includes('--baseline'),out=`output/menu-performance/${baseline?'before':'after'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),context=await browser.newContext({viewport:{width:2560,height:1600}}),page=await context.newPage(),errors=[];
 try{
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/game.js*',r=>{let s=fs.readFileSync(baseline?'output/menu-performance/baseline/game.js':'web/game.js','utf8');s=s.replace('  window.advanceTime = (milliseconds) => {','  window.__menuPerf={state,render,enterMenu,art,grassArt,frames:()=>runtimePerformance.renderedFrames};\n  window.advanceTime = (milliseconds) => {');return r.fulfill({contentType:'application/javascript',body:s});});
  if(baseline)await page.route('**/course-menu-ui.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/menu-performance/baseline/course-menu-ui.js','utf8')}));
  await page.goto('http://127.0.0.1:4187');await page.waitForFunction(()=>window.__menuPerf,null,{timeout:120000});
  await page.evaluate(()=>{__menuPerf.enterMenu();__menuPerf.render();window.__perfCounts={gpuPresents:0,artCopies:0};const present=RCScene3D.present;RCScene3D.present=(...args)=>{__perfCounts.gpuPresents++;return present(...args);};const art=document.querySelector('.course-menu-art').getContext('2d'),copy=art.drawImage.bind(art);art.drawImage=(...args)=>{__perfCounts.artCopies++;return copy(...args);};});
  await page.waitForFunction(()=>__menuPerf.art.naturalWidth&&__menuPerf.grassArt.naturalWidth);await page.waitForTimeout(2500);
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
  const sample=async name=>{const a=await metrics(),counts=await page.evaluate(()=>({...__perfCounts,frames:__menuPerf.frames(),focus:document.hasFocus(),hidden:document.hidden}));await page.waitForTimeout(3000);const b=await metrics(),end=await page.evaluate(()=>({...__perfCounts,frames:__menuPerf.frames()}));return {name,seconds:b.Timestamp-a.Timestamp,taskMs:(b.TaskDuration-a.TaskDuration)*1000,layoutMs:(b.LayoutDuration-a.LayoutDuration)*1000,frames:end.frames-counts.frames,gpuPresents:end.gpuPresents-counts.gpuPresents,artCopies:end.artCopies-counts.artCopies,focus:counts.focus,hidden:counts.hidden};};
  const samples=[await sample('focused-idle')];
  // Keep the menu visible while another page has focus, as with another browser.
  await page.evaluate(()=>{Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false});window.dispatchEvent(new Event('blur'));});samples.push(await sample('unfocused-visible'));
  await page.evaluate(()=>{delete document.hasFocus;window.dispatchEvent(new Event('focus'));});
  if(!baseline){
   await page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,value:true}));samples.push(await sample('hidden'));await page.evaluate(()=>delete document.hidden);
  }
  await page.keyboard.press('ArrowDown');assert.equal(await page.locator('[data-menu-action="1"]').getAttribute('data-selected'),'true');
  if(!baseline){assert(samples.every(s=>s.gpuPresents===0&&s.artCopies===0),JSON.stringify(samples));}
  await page.screenshot({path:out+'/menu-2560.png'});
  if(!baseline){
   // A changed notice and viewport must repaint despite the stopped animation.
   await page.evaluate(()=>{__menuPerf.state.status='Performance check';__menuPerf.render();});assert.equal(await page.locator('[data-clubhouse="notice"]').textContent(),'Performance check');
   for(const viewport of [{width:1280,height:720},{width:390,height:844}]){await page.setViewportSize(viewport);await page.waitForTimeout(120);await page.screenshot({path:`${out}/menu-${viewport.width}.png`});assert(await page.locator('#course-menu').evaluate(el=>el.scrollWidth<=el.clientWidth+1));}
   await page.locator('[data-menu-action="1"]').click();assert.equal(await page.evaluate(()=>__menuPerf.state.mode),'settings');await page.keyboard.press('Escape');await page.waitForTimeout(120);assert.equal(await page.locator('#course-menu').isVisible(),true);
   assert.equal(await page.getByRole('button',{name:/clock out/i}).count(),0);
   await page.evaluate(()=>{__menuPerf.state.menuIndex=0;__menuPerf.render();window.__pad={index:0,id:'menu-test',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[__pad]});});
   await page.waitForTimeout(150);await page.evaluate(()=>{__pad.buttons[13]={pressed:true,value:1};});await page.waitForFunction(()=>__menuPerf.state.menuIndex===1);await page.evaluate(()=>{__pad.buttons[13]={pressed:false,value:0};});await page.waitForTimeout(100);
   assert.equal(await page.locator('[data-menu-action="1"]').getAttribute('data-selected'),'true');await page.evaluate(()=>delete navigator.getGamepads);
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({baseline,samples,errors},null,2));console.log(JSON.stringify({baseline,samples,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
