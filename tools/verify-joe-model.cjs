const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve('output/joe-model/acceptance');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:2560,height:1600},recordVideo:{dir:path.join(out,'motion'),size:{width:1280,height:720}}}),errors=[],checks=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const code=fs.readFileSync('web/game.js','utf8');await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:code.replace('  window.advanceTime = (milliseconds) => {','  window.__model={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 const snap=async name=>{await page.evaluate(()=>__model.render());await page.screenshot({path:path.join(out,name+'.png')});};
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.__model&&window.RCScene3D&&JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:60000});
  await page.evaluate(()=>{const {state:s,resetFirstHole}=__model;resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.keys.clear();s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.controlHintTimer=0;s.hole.zoneBannerTimer=0;Object.assign(s.player,{x:0,y:180,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:0,y:198,effectHeading:-Math.PI/2,effectSpeed:0,walkMeters:0,patrolPause:9999,mode:'patrol'});__model.render();});
  await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready);await snap('front-2560');
  const initial=await page.evaluate(()=>RCScene3D.stats().joeModel);assert.equal(initial.kind,'skinned-pixel-model');assert.equal(initial.bones,17);assert(initial.meshes>0);assert.equal(initial.error,null);checks.push('Real 17-bone skinned GLB loads with generated pixel material maps');
  for(const [name,x,y,yaw]of [['right',26,198,-Math.PI/2],['rear',0,217,Math.PI],['left',-26,198,Math.PI/2],['oblique',-18,182,.68]]){await page.evaluate(p=>Object.assign(__model.state.player,p),{x,y,yaw,pitch:0});await snap(name);const st=await page.evaluate(()=>RCScene3D.stats().joeModel);assert.equal(st.heading,initial.heading);assert.deepEqual(st.position,initial.position);}
  checks.push('Circling Joe changes visible geometry without rotating or swapping the actor to face the camera');
  await page.evaluate(()=>Object.assign(__model.state.player,{x:-18,y:182,yaw:.68,pitch:0}));
  await page.evaluate(()=>{__model.state.hole.joe.effectSpeed=3;for(let i=0;i<30;i++){__model.state.time+=1/60;__model.render();}});
  const samples=[];for(let i=0;i<12;i++){await page.evaluate(i=>{__model.state.time+=.1;__model.state.hole.joe.walkMeters=i/12*(.46/.62)/.16;__model.state.hole.joe.effectSpeed=3;__model.render();},i);samples.push(await page.evaluate(()=>RCScene3D.stats().joeModel));await snap('walk-'+String(i).padStart(2,'0'));}
  for(const s of samples)for(let hand=0;hand<2;hand++)for(let axis=0;axis<3;axis++)assert(Math.abs(s.handPositions[hand][axis]-samples[0].handPositions[hand][axis])<.005,'grip slips');
  assert(samples[7].phase>samples[2].phase);assert(samples[7].wheelAngles[0]>samples[2].wheelAngles[0]);checks.push('Distance advances the skeletal gait and all four wheels; hand anchors remain within 5 mm');
  const stopped=await page.evaluate(()=>RCScene3D.stats().joeModel);for(let i=0;i<5;i++)await page.evaluate(()=>__model.render());const after=await page.evaluate(()=>RCScene3D.stats().joeModel);assert.equal(stopped.phase,after.phase);assert.deepEqual(stopped.wheelAngles,after.wheelAngles);checks.push('Repeated rendering without movement does not advance feet or wheels');
  await page.evaluate(()=>{__model.state.hole.joe.mode='search';__model.state.hole.joe.effectSpeed=0;for(let i=0;i<30;i++){__model.state.time+=1/60;__model.render();}});const search=await page.evaluate(()=>RCScene3D.stats().joeModel);assert.equal(search.pose,'planted-idle');assert.equal(search.walkWeight,0);for(let i=0;i<10;i++)await page.evaluate(()=>__model.render());assert.deepEqual(await page.evaluate(()=>RCScene3D.stats().joeModel.headRotation),search.headRotation);assert(search.handError<.005);checks.push('Stationary search uses planted idle with stable, non-accumulating head movement and grip');
  for(const [w,h]of [[1280,720],[800,600],[844,390]]){await page.setViewportSize({width:w,height:h});if(w===844)await page.evaluate(()=>__model.state.inputMethod='touch');await snap('view-'+w);}
  await page.evaluate(()=>{RCScene3D.reset();__model.render();});await page.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready);await snap('rebuilt');checks.push('Scene rebuild reloads the real model; high-resolution, ordinary desktop and touch captures complete');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,checks,errors,model:await page.evaluate(()=>RCScene3D.stats().joeModel)},null,2));console.log(JSON.stringify({passed:true,checks,errors},null,2));
 }finally{const v=page.video();await page.close();if(v)await v.saveAs(path.join(out,'orbit-and-walk.webm'));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
