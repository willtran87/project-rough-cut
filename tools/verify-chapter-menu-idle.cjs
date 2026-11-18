const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
process.env.TEMP=process.env.TMP=require('./lib/artifacts.cjs').dir('browser-temp');
const baseline=process.argv.includes('--baseline'),out=`output/chapter-menu-performance/${baseline?'before':'after'}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),reports=[];
 try{for(const chapter of ['back-nine','under-green','final-cut','joey']){
  const context=await browser.newContext({viewport:{width:2560,height:1600}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__idleCounts={};localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true}));});
  const file=chapter==='joey'?'game.js':chapter+'.js';
  await page.route('**/'+file+'*',r=>{let s=fs.readFileSync((baseline?'output/chapter-menu-performance/baseline/':'web/')+file,'utf8');
   const names=chapter==='back-nine'?['paintUI','simulate','input']:chapter==='under-green'?['paint','update','input','draw']:chapter==='final-cut'?['paint','update','input','draw']:['drawIntro','render'];
   for(const name of names)s=s.replace(new RegExp('(function '+name+'\\([^)]*\\)\\s*\\{)'),`$1 window.__idleCounts.${name}=(window.__idleCounts.${name}||0)+1;`);
   s+=chapter==='joey'?'':`\nwindow.__idleProbe={get ready(){return ready;},mode:()=>run.mode};`;
   if(chapter==='joey')s=s.replace('  window.advanceTime = (milliseconds) => {','  window.__idleProbe={ready:true,start:()=>{state.mode="intro";state.time=0;state.manualTime=false;render();},state};\n  window.advanceTime = (milliseconds) => {');
   return r.fulfill({contentType:'application/javascript',body:s});});
  await page.goto('http://127.0.0.1:4187/'+(chapter==='joey'?'index':chapter)+'.html?test=1');await page.waitForFunction(()=>window.__idleProbe?.ready,null,{timeout:180000});
  if(chapter==='joey')await page.evaluate(()=>__idleProbe.start());else await page.waitForTimeout(1800);
  const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
  const sample=async name=>{const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));const a=await metrics(),counts=await page.evaluate(()=>({...__idleCounts}));await page.waitForTimeout(2000);const b=await metrics(),end=await page.evaluate(()=>({...__idleCounts}));return {name,taskMs:(b.TaskDuration-a.TaskDuration)*1000,counts:Object.fromEntries(Object.keys(end).map(k=>[k,end[k]-(counts[k]||0)]))};};
  const samples=[await sample('focused')];await page.screenshot({path:`${out}/${chapter}-2560.png`});
  await page.evaluate(()=>{Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false});window.dispatchEvent(new Event('blur'));});samples.push(await sample('unfocused'));await page.evaluate(()=>{delete document.hasFocus;window.dispatchEvent(new Event('focus'));});
  if(!baseline){if(chapter!=='joey')assert.equal(samples[0].counts.paint||samples[0].counts.paintUI||0,0,JSON.stringify(samples));assert(Object.values(samples[1].counts).every(v=>v===0),JSON.stringify(samples));
   if(chapter==='joey'){assert(samples[0].counts.drawIntro<=65);await page.evaluate(()=>{__idleProbe.state.time=5.7;advanceTime(0);});await page.screenshot({path:out+'/joey-line.png'});await page.keyboard.press('Escape');await page.waitForFunction(()=>__idleProbe.state.mode==='menu');}
   else{for(const v of [{width:1280,height:720},{width:390,height:844}]){await page.setViewportSize(v);await page.waitForTimeout(200);await page.screenshot({path:`${out}/${chapter}-${v.width}.png`});}await page.locator('#primary').click();await page.waitForTimeout(300);
    if(await page.locator('dialog[open]').count())await page.keyboard.press('Escape');
    await page.waitForFunction(()=>['playing','driving'].includes(__idleProbe.mode()));await page.keyboard.press('Escape');await page.waitForFunction(()=>__idleProbe.mode()==='paused');await page.locator('#primary').click();await page.waitForFunction(()=>['playing','driving'].includes(__idleProbe.mode()));
   }
  }
  assert.deepEqual(errors,[]);reports.push({chapter,samples,errors});console.log(JSON.stringify(reports.at(-1)));await context.close();
 }fs.writeFileSync(out+'/report.json',JSON.stringify(reports,null,2));}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
