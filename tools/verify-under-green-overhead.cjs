const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline'),out='output/under-green/overhead/'+(baseline?'before':'after');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(baseline){
  let source=fs.readFileSync('web/under-green-scene.js','utf8');
  const roof="for(const t of roofPanels(layout.tiles))box('ceiling',t.x,4.25,-t.y,t.w,.2,t.d);",details='structureDetails.courseOverhead=buildCourseOverhead({box,put,cyl,ball});';
  assert(source.includes(roof)&&source.includes(details));source=source.replace(roof,"for(const t of layout.tiles)if(t.covered)box('ceiling',t.x,4.25,-t.y,t.w,.2,t.d);").replace(details,'');
  await p.route('**/under-green-scene.js',route=>route.fulfill({contentType:'application/javascript',body:source}));
 }
 await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
 const place=async pose=>p.evaluate(async pose=>{const {createRun}=await import('./under-green-sim.js');const r=createRun();r.mode='playing';r.messageTime=0;Object.assign(r.player,pose);__underGreen.run=r;__underGreen.clearInput();advanceTime(0);return JSON.parse(render_game_to_text());},pose);
 for(const [width,height]of baseline?[[2560,1600]]:[[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});
  for(const [name,pose]of [['approach',{x:0,y:13,yaw:0,pitch:0}],['shaft',{x:0,y:16.5,yaw:0,pitch:.85}],['return',{x:.6,y:21,yaw:Math.PI,pitch:.6}]]){
   const s=await place(pose);await p.screenshot({path:`${out}/${name}-${width}.png`});views.push({name,width,height,graphics:s.graphics});
   if(name==='shaft'){
    const sight=await p.evaluate(()=>__underGreen.inspectView([{id:'sky-through-grate',x:.6,y:19.1,height:6.3},{id:'uncut-roof',x:-1.5,y:18.5,height:4.8},{id:'course-flag',x:.43,y:20.05,height:7.05}]));
    assert.equal(sight[0].clear,!baseline,JSON.stringify(sight));assert(sight[0].inView);assert.equal(sight[1].clear,false);views.at(-1).sight=sight;
    if(!baseline)assert(sight[2].clear&&sight[2].inView,'The course flag must actually be visible through the grate');
   }
  }
 }
 if(!baseline){
  await p.setViewportSize({width:2560,height:1600});await place({x:0,y:13,yaw:0,pitch:0});await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1400));await p.keyboard.up('w');const s=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(Math.abs(s.player.y-18.376)<.01);assert.equal(s.waterHits,0);await p.screenshot({path:`${out}/ordinary-walk-2560.png`});
  assert.equal(s.graphics.structureDetails.courseOverhead.shafts.length,1);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,baseline,views,errors},null,2));console.log(JSON.stringify({passed:true,baseline,views:views.length,draws:views.map(v=>v.graphics.draws),errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
