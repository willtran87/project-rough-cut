const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const base=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/visual-polish-20261107',before=process.argv.includes('--before'),software=process.argv.includes('--software'),out=base+'/'+(before?'before':'after')+'-'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],samples=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before)for(const file of ['scene-3d.js','pixel-effects.js','pixel-world-props.js'])await p.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(base+'/before/'+file,'utf8')}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__visual={state,resetFirstHole,render,spatialCourseData,addTurfMark};\n  window.advanceTime = (milliseconds) => {')}));
 const render=()=>p.evaluate(async()=>{__visual.render();await RCScene3D.whenPresented();});
 const snap=async name=>{await render();await p.screenshot({path:out+'/'+name+'.png'});samples.push(await p.evaluate(name=>{const s=RCScene3D.stats();return {name,drawCalls:s.drawCalls,triangles:s.triangles,effects:s.effects,water:s.water};},name));};
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__visual&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__visual,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.hole.elapsed=30;Object.assign(s.player,{x:0,y:32,yaw:0,pitch:-.08});Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});await snap('opening-2560');
  await p.evaluate(()=>{const s=__visual.state;Object.assign(s.player,{x:0,y:70,yaw:.12,pitch:-.28});Object.assign(s.hole.joe,{x:9,y:96,mode:'chase',effectHeading:Math.PI/2,effectSpeed:10});s.hole.detection=.7;for(let i=0;i<12;i++){__visual.addTurfMark('mowed',7,72+i*2,{heading:Math.PI/2,radius:4});__visual.addTurfMark('track',-2+i%2,71+i*1.5,{heading:Math.PI/2,sand:true,duration:40});}s.hole.elapsed++;});await snap('mower-evidence');
  await p.evaluate(()=>{const h=__visual.state.hole;__visual.state.player.pitch=-.55;h.worldEffects=[{kind:'ball_impact',x:-3,y:78,age:.28,duration:1,color:0xc6bb95}];h.groundResponses=[{kind:'wet',x:3,y:78,age:.22,duration:1}];h.elapsed++;});await snap('impact-details');
  const pond=await p.evaluate(()=>__visual.spatialCourseData().obstacles.find(o=>o.id.includes('pond')));assert(pond,'Authored pond exists');
  await p.evaluate(o=>{const s=__visual.state;Object.assign(s.player,{x:o.x,y:o.y-(o.radiusY||o.radius)-17,yaw:0,pitch:-.33});Object.assign(s.hole.joe,{x:100,y:690,mode:'patrol'});s.hole.detection=0;s.hole.elapsed++;},pond);await snap('pond-2560');
  if(!before){
   const start=await p.evaluate(()=>RCScene3D.stats().water);assert(start.length>0);assert(start.every(w=>w.opaque&&w.draws===1));
   await p.evaluate(()=>{__visual.state.hole.crosswind.phase='active';__visual.state.hole.crosswind.timer=1;});
   for(let i=0;i<12;i++){await p.evaluate(()=>__visual.state.hole.elapsed+=.1);await render();}await snap('pond-ripple');
   const animated=await p.evaluate(()=>RCScene3D.stats().water);assert(animated[0].time>start[0].time);assert(animated[0].wind>start[0].wind);checks.push('Water responds smoothly to authored wind');
   await p.evaluate(()=>__visual.state.reducedMotion=true);await render();const reduced=await p.evaluate(()=>RCScene3D.stats().water[0].time);await p.evaluate(()=>__visual.state.hole.elapsed+=1);await render();assert.equal(await p.evaluate(()=>RCScene3D.stats().water[0].time),reduced);checks.push('Opaque single-pass water animates and freezes under Reduced Motion');
   await p.evaluate(()=>{__visual.state.reducedMotion=false;__visual.state.mode='paused';});await render();const paused=await p.evaluate(()=>RCScene3D.stats().water[0].time);await p.evaluate(()=>__visual.state.hole.elapsed+=1);await render();assert.equal(await p.evaluate(()=>RCScene3D.stats().water[0].time),paused);await p.evaluate(()=>__visual.state.mode='first_hole');checks.push('Pause freezes water motion');
   const stable=await p.evaluate(()=>{const s=__visual.state,a=JSON.stringify({p:s.player,j:s.hole.joe,marks:s.hole.turfMarks});__visual.render();return a===JSON.stringify({p:s.player,j:s.hole.joe,marks:s.hole.turfMarks});});assert(stable);checks.push('Visual rendering leaves movement, Joe and evidence unchanged');
  }
  for(const [name,x,y,yaw,pitch] of [['border',100,340,1.57,-.08],['shed',-18,684,0,0]]){await p.evaluate(v=>{Object.assign(__visual.state.player,v);__visual.state.hole.elapsed++;},{x,y,yaw,pitch});await snap(name);}
  for(const [name,width,height] of [['1280',1280,720],['800',800,600],['844-touch',844,390]]){await p.setViewportSize({width,height});if(name.includes('touch'))await p.evaluate(()=>__visual.state.inputMethod='touch');await snap(name);const bounds=await p.evaluate(()=>{const a=document.querySelector('#game').getBoundingClientRect(),b=document.querySelector('#pixel-feedback').getBoundingClientRect();return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.width-b.width),Math.abs(a.height-b.height));});assert(bounds<3);}
  checks.push('Stage feedback aligned at 2560×1600, 1280×720, 800×600, 844×390 touch');assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,checks,samples,errors},null,2));console.log(JSON.stringify({out,passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
