const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/water-contract';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.route('**/under-green-scene.js',route=>{
   const source=fs.readFileSync('web/under-green-scene.js','utf8'),marker=' return {draw,drainJoeFootsteps:';
   assert(source.includes(marker));
   return route.fulfill({contentType:'application/javascript',body:source.replace(marker,
    " window.__actualWaterSignals=()=>waterObjects.map(v=>({id:v.w.id,banks:v.signals.map(lights=>lights.map(light=>['redSignal','amberSignal','greenSignal','offSignal'].find(key=>light.material===materials[key])))}));"+marker)});
  });
  await p.goto('http://127.0.0.1:4187/under-green.html?test');
  await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
  await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  const fixtures=await p.evaluate(async()=>{
   const {WATERS}=await import('./under-green-course.js');
   return WATERS.flatMap(w=>w.control==='cycle'?[.5,w.lowSeconds+.5,8,11].map(cycle=>({id:w.id,time:24+cycle-w.offset,bypass:false,bypassAt:-99})):
    [false,true].flatMap(bypass=>(w.control==='pump-return'?[.5,2.5]:[.5]).map(age=>({id:w.id,time:24+age,bypass,bypassAt:24}))));
  });
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});
   for(const fixture of fixtures){
    const result=await p.evaluate(async fixture=>{
     const {createRun}=await import('./under-green-sim.js'),{WATERS,waterState,waterPoint}=await import('./under-green-course.js'),{crossingAdvice}=await import('./under-green-guidance.js');
     const w=WATERS.find(w=>w.id===fixture.id),r=createRun();Object.assign(r,{mode:'playing',time:fixture.time,bypass:fixture.bypass,bypassAt:fixture.bypassAt});
     Object.assign(r.player,waterPoint(w,0,-w.depth/2-.65),{yaw:w.axis==='x'?Math.PI/2:0,grace:0});r.joe.phase='enter';r.joe.age=-1000;
     __underGreen.run=r;__underGreen.clearInput();advanceTime(17);
     const text=JSON.parse(render_game_to_text()),state=waterState(w,r.time,r.bypass,r.bypassAt);
     return {id:w.id,phase:state.phase,danger:state.danger,signal:__actualWaterSignals().find(v=>v.id===w.id),
      audio:text.audio.targets.outlets.find(v=>v.id===w.id),visual:text.graphics.water.jetsPerChannel.find(v=>v.id===w.id),
      diagnostic:text.waters.find(v=>v.id===w.id),advice:crossingAdvice(r.player,w,state),
      hud:{visible:!document.getElementById('water-read').hidden,name:document.getElementById('water-name').textContent,title:document.getElementById('water-phase').textContent,level:document.getElementById('water-meter').value,danger:document.getElementById('water-read').dataset.danger,action:document.getElementById('water-read').dataset.action,runOption:document.getElementById('water-read').dataset.runOption},name:w.name,level:state.level,overflow:document.documentElement.scrollWidth>innerWidth};
    },fixture);
    const active=result.danger?0:result.phase==='warning'?1:2;
    for(const bank of result.signal.banks)for(let i=0;i<bank.length;i++)assert.equal(bank[i],i%3===active?['redSignal','amberSignal','greenSignal'][active]:'offSignal');
    assert.equal(result.audio.phase,result.phase);assert.equal(result.visual.flowing,result.danger);assert.equal(result.diagnostic.phase,result.phase);assert.equal(result.diagnostic.danger,result.danger);assert(!result.overflow);
    assert(result.hud.visible);assert.equal(result.hud.name,result.name);assert.equal(result.hud.danger,String(result.danger));assert.equal(result.hud.action,result.advice.action);assert(Math.abs(result.hud.level-result.level)<1e-6);if(result.hud.runOption==='true')assert(result.hud.title.startsWith('RUN ('));else assert.equal(result.hud.title,result.advice.title);
    results.push({width,height,...result});
    if(fixture.id==='spillway'&&result.phase==='warning')await p.screenshot({path:`${out}/warning-${width}.png`});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,results,errors,limits:['State fixtures test actual signal materials, flowing meshes, audio targets and diagnostics; not human listening or navigation.','Pure checks cover exact boundaries; browser cases sample phase interiors.']},null,2));
  console.log(JSON.stringify({passed:true,cases:results.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
