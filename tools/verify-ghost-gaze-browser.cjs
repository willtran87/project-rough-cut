const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/ghost-gaze-20261107/hardware',reactive=process.argv.includes('--reactive'),software=process.argv.includes('--software');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],behaviors=[],costs=[],gestureCaptures=new Set();let rushCaptured=false,tearCaptured=false,withdrawCaptured=false;
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__ghostTest={state,resetFirstHole,render,sites:SPECTRAL_COURSE_FIGURES,obstacles:COURSE_OBSTACLES};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__ghostTest&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__ghostTest,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.elapsed=100;s.hole.tensionDirector.reliefSeconds=0;s.hole.joe.mode='patrol';Object.assign(s.hole.joe,{x:100,y:700});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().effects?.ghost?.ready,null,{timeout:90000});

  const variety=process.argv.includes('--variety'),allSamples=[],coverage={stare:new Set(),lookaway:new Set(),lookback:new Set()};
  const sites=await p.evaluate(()=>__ghostTest.sites.map(s=>({...s})));
  for(let encounter=0;encounter<(variety?6:1);encounter++){
  const captureOut=variety?out+'/encounter-'+encounter:out;fs.mkdirSync(captureOut,{recursive:true});
   await p.evaluate(site=>{
    const t=__ghostTest,s=t.state;t.sites.splice(0,t.sites.length,site);s.hole.mapOpen=true;s.hole.elapsed+=.1;t.render();s.hole.mapOpen=false;
    const obstacles=t.obstacles.filter(o=>(o.blocks||o.id.includes('pond'))&&!o.lightRadius);
    const clear=(x,y)=>!obstacles.some(o=>(((x-o.x)*.1152)/((o.radiusX||o.radius)*.16+.5))**2+(((y-o.y)*.16)/((o.radiusY||o.radius)*.16+.5))**2<1);
    const views=Array.from({length:24},(_,i)=>({x:site.x+Math.sin(i*Math.PI/12)*45/.72,y:site.y-Math.cos(i*Math.PI/12)*45})).filter(v=>Math.abs(v.x)<103&&v.y>10&&v.y<705&&clear(v.x,v.y)).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x));
    const view=views.find(v=>Array.from({length:20},(_,i)=>{const k=i/20;return clear(v.x+(site.x-v.x)*k,v.y+(site.y-v.y)*k);}).every(Boolean))||views[0];
    if(!view)throw Error('No safe camera');Object.assign(s.player,{...view,yaw:Math.atan2((site.x-view.x)*.1152,(site.y-view.y)*.16),pitch:0});
   },sites[0]);

  const start=await p.evaluate(()=>({yaw:__ghostTest.state.player.yaw,player:JSON.stringify(__ghostTest.state.player),joe:JSON.stringify(__ghostTest.state.hole.joe)}));
  let stage='stare',at=0,turnOffset=0;const captures=[],samples=[];
  for(let i=0;i<145;i++){
   turnOffset=stage==='lookaway'?Math.min(variety?1.65:Math.PI,turnOffset+.15):Math.max(0,turnOffset-.15);
   const sample=await p.evaluate(async({software,stage,yaw})=>{
    const t=__ghostTest;t.state.player.yaw=yaw;t.state.hole.elapsed+=.1;t.render();if(software)await RCScene3D.whenPresented();return RCScene3D.stats().effects;
   },{software,stage,yaw:start.yaw+turnOffset});
   if(sample.ghost.gazeGesture)coverage[sample.ghost.gazeGesture].add(sample.ghost.gazeVariant);
   samples.push({ghost:sample.ghost,feedback:sample.feedback,updateMs:sample.updateMs});
   assert(sample.ghost.drawCalls<=1&&sample.ghost.triangles<6000);
   if(sample.feedback.ghostTear?.kind===stage&&sample.feedback.ghostTear.strength>.13&&!captures.includes(stage)){
    await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:captureOut+'/'+stage+'-2560.png'});captures.push(stage);at=i;
   }
   if(captures.includes(stage)&&i-at>=(variety?6:9)){if(stage==='stare')stage='lookaway';else if(stage==='lookaway')stage='lookback';else break;}
  }
  assert.deepEqual(captures,['stare','lookaway','lookback']);
  assert.equal(await p.evaluate(()=>JSON.stringify(__ghostTest.state.hole.joe)),start.joe);
  assert.equal(await p.evaluate(()=>JSON.stringify(__ghostTest.state.player)),start.player);
  allSamples.push(...samples);
  }
  if(variety)for(const styles of Object.values(coverage))assert.deepEqual([...styles].sort(),[0,1,2]);
  for(const [w,h]of [[1280,720],[800,600],[844,390]]){await p.setViewportSize({width:w,height:h});await p.evaluate(()=>__ghostTest.render());await p.evaluate(()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/viewport-'+w+'.png'});}
  await p.evaluate(()=>{roughCutRebuild.setComfort('ghostInterference',false);__ghostTest.state.hole.elapsed+=.1;__ghostTest.render();});
  assert(!(await p.evaluate(()=>RCScene3D.stats().effects.feedback.ghostTear)));
  assert.deepEqual(errors,[]);
  const costs=allSamples.map(s=>s.updateMs).sort((a,b)=>a-b),result={passed:true,coverage:Object.fromEntries(Object.entries(coverage).map(([k,v])=>[k,[...v].sort()])),software,p95:costs[Math.floor(costs.length*.95)],max:costs.at(-1),errors};
  fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2));fs.writeFileSync(out+'/samples.json',JSON.stringify(allSamples,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
