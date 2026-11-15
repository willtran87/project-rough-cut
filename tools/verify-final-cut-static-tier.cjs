const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/static-culling';
(async()=>{const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],records=[];p.setDefaultTimeout(120000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 let source;await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source}));let reference;
 for(const file of [out+'/source/final-cut-scene-before.js','web/final-cut-scene.js']){
  source=fs.readFileSync(file,'utf8');await p.goto('http://127.0.0.1:4187/final-cut.html?test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready);
  await p.evaluate(async()=>{const {createRun}=await import('./final-cut-sim.js'),{SECTORS}=await import('./final-cut-course.js');const r=createRun({checkpoint:1,cut:SECTORS.map(s=>s.id)});r.mode='playing';r.time=.5;Object.assign(r.rig,{x:0,y:49.38,yaw:0,phase:'pass',age:3,deployment:1});Object.assign(r.player,{x:5,y:55,yaw:Math.atan2(-4,3.1),pitch:.14});__finalCut.run=r;await advanceTime(0);});
  const shot=await p.screenshot(),graphics=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(graphics.software,false);records.push({file,draws:graphics.draws,triangles:graphics.triangles,masonry:graphics.masonryBatching,staticBatching:graphics.staticBatching});if(!reference)reference=shot;else{assert(shot.equals(reference),'Production hardware pixels changed');fs.writeFileSync(out+'/hardware-tier.png',shot);}
 }
 assert.equal(records[0].draws,records[1].draws);assert.equal(records[0].triangles,records[1].triangles);assert.equal(records[1].staticBatching.spatial,false);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/tier.json',JSON.stringify({passed:true,records,errors},null,2));console.log(JSON.stringify({passed:true,records,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
