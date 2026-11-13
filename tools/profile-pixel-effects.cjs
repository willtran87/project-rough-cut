const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/effects-restoration';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('enabled:h.rebuild.lab!==','enabled:!window.__disableFX&&h.rebuild.lab!==').replace('  window.advanceTime = (milliseconds) => {','  window.__fxPerf={state,resetFirstHole,render,addTurfMark};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__fxPerf&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__fxPerf,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.hole.elapsed=100;s.time=100;s.clearScenery=false;s.hole.tensionDirector.reliefSeconds=0;Object.assign(s.player,{x:0,y:65,yaw:0,pitch:-.1});Object.assign(s.hole.joe,{x:12,y:105,mode:'search',effectSpeed:10,effectHeading:Math.PI/2});for(let i=0;i<80;i++)t.addTurfMark('mowed',(i%6-3)*5,65+Math.floor(i/6)*3,{heading:Math.PI/2});s.hole.horrorDirector.fogSurgeSeconds=1.1;s.hole.crosswind.phase='active';s.hole.crosswind.timer=5;t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  for(const [name,x,y,yaw] of [['dense-opening',0,65,0],['border',100,340,1.57]]){
   await p.evaluate(v=>Object.assign(__fxPerf.state.player,v),{x,y,yaw});const timings=[];
   for(const enabled of [false,true,true,false])timings.push(await p.evaluate(async enabled=>{
    __disableFX=!enabled;const s=__fxPerf.state,origin={...s.player};s.hole.elapsed+=1;__fxPerf.render();await RCScene3D.whenPresented();
    const elapsed=[],cpu=[];for(let i=0;i<28;i++){await new Promise(requestAnimationFrame);const start=performance.now();s.hole.elapsed+=.1;s.player.y=origin.y+i*.15;s.player.yaw=origin.yaw+i*.001;__fxPerf.render();const submitted=performance.now();await RCScene3D.whenPresented();if(i>=4){elapsed.push(performance.now()-start);cpu.push(submitted-start);}}
    Object.assign(s.player,origin);elapsed.sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const stats=RCScene3D.stats();return {enabled,medianMs:elapsed[12],p95Ms:elapsed[22],cpuP95:cpu[22],drawCalls:stats.drawCalls,triangles:stats.triangles,effects:stats.effects};
   },enabled));views.push({name,timings});
  }
  if(errors.length)throw Error(errors.join('\n'));const result={method:'Alternating off/on/on/off within one warmed SwiftShader process; 24 measured GPU-completed moving scenes per batch after four warm-up frames. Dense evidence, full decoration, wind and fog surge.',views,errors};fs.writeFileSync(out+'/effects-cost.json',JSON.stringify(result,null,2));console.log(JSON.stringify({views:views.map(v=>({name:v.name,timings:v.timings.map(t=>({enabled:t.enabled,median:t.medianMs,p95:t.p95Ms,cpu:t.cpuP95,draws:t.drawCalls,effectDraws:t.effects.drawCalls}))})),errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
