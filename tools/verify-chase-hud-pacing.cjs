const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
// Isolate HUD work from GPU rasterization. Both versions receive the same
// simulation steps; screenshot and state equivalence guard visible behavior.
(async()=>{
 const out='output/chase-render-followup';fs.mkdirSync(out,{recursive:true});const results=[];
 const b=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{for(const baseline of [true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
  await p.route(/\/back-nine\.js(?:\?.*)?$/,r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync((baseline?out+'/baseline-source':'web')+'/back-nine.js','utf8')+'\nwindow.__paintHUD=paintUI;window.__budget=budget;'}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const cdp=await p.context().newCDPSession(p);await cdp.send('Performance.enable');
  const initial=(await cdp.send('Performance.getMetrics')).metrics;
  const hud=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js'),r=createRun(1);r.mode='driving';r.grace=999;Object.assign(r.cart,{x:-29,y:443,speed:8});Object.assign(r.joe,{x:-26,y:429});__backNine.run=r;
   __paintHUD();let writes=0,styleWrites=0;const observer=new MutationObserver(list=>{for(const m of list){if(m.attributeName.startsWith('data-'))writes++;if(m.attributeName==='style')styleWrites++;}});observer.observe(document.querySelector('#game-shell'),{subtree:true,attributes:true});
   const samples=[];for(let i=0;i<180;i++){
    __backNine.simulate(1/60);const t=performance.now();__paintHUD();
    // Force the pending style/layout work into this sample rather than the
    // next screenshot. No world rendering occurs in this isolated HUD test.
    document.querySelector('#game-shell').getBoundingClientRect();samples.push(performance.now()-t);
    await new Promise(resolve=>requestAnimationFrame(resolve));
   }observer.disconnect();samples.sort((a,b)=>a-b);
   return {writes,styleWrites,median:samples[90],p95:samples[171],max:samples[179],state:JSON.stringify(__backNine.run),html:document.querySelector('#hud').outerHTML};
  });
  const final=(await cdp.send('Performance.getMetrics')).metrics;
  const metrics=Object.fromEntries(final.map(m=>[m.name,m.value-(initial.find(v=>v.name===m.name)?.value||0)]));
  const graphics=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);
  results.push({baseline,hud,metrics,graphics,errors});assert.deepEqual(errors,[]);
  console.log(JSON.stringify({baseline,writes:hud.writes,styleWrites:hud.styleWrites,p95:hud.p95,recalc:metrics.RecalcStyleCount,recalcMs:metrics.RecalcStyleDuration*1000}));
  if(!baseline){
   const adaptation=await p.evaluate(async()=>{
    await __backNine.whenPresented();
    const state=JSON.stringify(__backNine.run),before=JSON.parse(render_game_to_text()).graphics;
    // Inject completion samples to verify controller -> real canvas wiring.
    // This is a functional stress test, not a GPU benchmark.
    for(let i=0;i<110;i++)__budget.observe(90*(__budget.scale()/.75)**2);
    __backNine.render();await __backNine.whenPresented();const low=JSON.parse(render_game_to_text()).graphics;
    for(let i=0;i<250;i++)__budget.observe(20*(__budget.scale()/.75)**2);
    __backNine.render();await __backNine.whenPresented();const recovered=JSON.parse(render_game_to_text()).graphics;
    return {low:low.resolution,recovered:recovered.resolution,programs:[before.programs,recovered.programs],textures:[before.textures,recovered.textures],simulationUnchanged:state===JSON.stringify(__backNine.run)};
   });
   assert.deepEqual(adaptation.low,[640,360]);assert.deepEqual(adaptation.recovered,[960,540]);assert(adaptation.simulationUnchanged);assert.equal(adaptation.programs[0],adaptation.programs[1]);assert.equal(adaptation.textures[0],adaptation.textures[1]);results.at(-1).adaptation=adaptation;
   for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){
    await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await p.screenshot({path:`${out}/preserved-chase-${width}.png`});
   }
  }
  await p.close();
 }
 assert.equal(results[0].hud.state,results[1].hud.state,'Simulation stays identical');
 assert.equal(results[0].hud.html,results[1].hud.html,'HUD content/style stays identical');
 assert(results[0].hud.writes>=720);assert(results[1].hud.writes<10,'Only actual state changes update attributes');
 fs.writeFileSync(out+'/hud-comparison.json',JSON.stringify({passed:true,results},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
