const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const probe=process.argv.includes('--probe');
(async()=>{
 const out='output/campaign-message-priority';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[],views=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.level-one-opening.v1',JSON.stringify({seen:true,skip:true}));localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({seen:true,skip:true}));});
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__priorityTest={state,resetFirstHole,drawQualityHud,render};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__priorityTest,null,{timeout:90000});await p.locator('canvas').click();await p.keyboard.press('Space');
  await p.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:90000});
  await p.evaluate(()=>{const t=__priorityTest,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.soundCaptions=true;s.threatCaptions=true;s.hole.elapsed=100;Object.assign(s.player,{x:40,y:140,yaw:0,pitch:0});Object.assign(s.hole.joe,{x:40,y:150,mode:'chase'});s.hole.detection=1;s.hole.engagement.closeEscape.remaining=.5;s.hole.captions=[{text:'THE ENGINE STUTTERS',direction:'',age:0,duration:4}];s.hole.message='KEY ACQUIRED';s.hole.messageTimer=4;t.render();});
  await p.waitForFunction(()=>{__priorityTest.render();return RCScene3D.stats().ready&&!RCScene3D.isPreparing();},null,{timeout:90000});
  const hud=()=>p.evaluate(()=>{__priorityTest.drawQualityHud();return Object.fromEntries(['goal','context','caption','threat'].map(key=>[key,document.querySelector(`[data-q=${key}]`)?.textContent||'']));});
  const before=await hud();fs.writeFileSync(out+(probe?'/before.json':'/level-one.json'),JSON.stringify(before,null,2));
  if(probe){await p.screenshot({path:out+'/before.png'});console.log(JSON.stringify(before));return;}
  assert.equal(before.caption,'');assert(!before.context.includes('KEY ACQUIRED'));
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await p.evaluate(async()=>{__priorityTest.render();await RCScene3D.whenPresented();});
   const state=await hud();assert.equal(state.caption,'');assert(state.goal&&state.context);await p.screenshot({path:`${out}/level-one-${width}.png`});views.push({width,height,state});
  }
  await p.evaluate(()=>{const h=__priorityTest.state.hole;h.engagement.closeEscape.remaining=0;__priorityTest.drawQualityHud();});assert.match((await hud()).caption,/ENGINE STUTTERS/);
  await p.evaluate(()=>{__priorityTest.state.soundCaptions=false;__priorityTest.state.hole.engagement.closeEscape.remaining=.5;__priorityTest.drawQualityHud();});const muted=await hud();assert(muted.goal&&muted.context);assert.equal(muted.caption,'');
  checks.push('Level 1 close-contact instruction excludes ambient captions and optional reward text; ordinary pursuit still supports opted-in sound descriptions');

  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  const chase=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js');const results=[];
   for(const mode of ['driving','sealing','dying']){
    const r=createRun();r.mode=mode;r.time=20;r.grace=0;r.message='Both relays online · checkpoint saved.';r.messageTime=4;r.story.cue='JOE: You are late.';r.story.cueTime=3;Object.assign(r.cart,{x:0,y:90});Object.assign(r.joe,{x:0,y:50});r.joe.ram.phase='lineup';r.joe.ram.age=.8;
    __backNine.run=r;__backNine.render();results.push({mode,banner:document.getElementById('caption').textContent,sound:document.getElementById('sound-caption').textContent});
   }return results;
  });
  assert.match(chase[0].banner,/Both relays/);assert.match(chase[1].banner,/shutter closing/);assert.match(chase[2].banner,/Run down/);assert(chase.every(r=>!r.banner.includes('JOE:')));
  checks.push('Back Nine keeps objective, sealing and defeat ahead of dialogue; its established charge presentation is preserved');
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  const green=await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js'),{LEVER}=await import('./under-green-course.js');const r=createRun(1);r.mode='playing';r.message='Checkpoint saved';r.messageTime=3;
   Object.assign(r.player,{x:LEVER.x-1.7,y:LEVER.y,yaw:Math.PI/2});Object.assign(r.joe,{x:r.player.x,y:r.player.y-1.5,phase:'windup',yaw:0,attackYaw:0,age:.1});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);
   return {caption:document.getElementById('caption').textContent,kind:document.getElementById('caption').dataset.kind,action:JSON.parse(render_game_to_text()).action};
  });assert(green.action);assert.equal(green.kind,'danger');assert.match(green.caption,/Move sideways/);
  checks.push('Under the Green close unseen strike wins over a valid control prompt and checkpoint message');
  await p.setViewportSize({width:2560,height:1600});await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));
  await p.locator('#comfort summary').click();await p.locator('[data-campaign=muted]').check();await p.locator('[data-campaign=threatCaptions]').uncheck();await p.locator('[data-campaign=subtitles]').check();await p.click('#primary');
  const finaleFixture=async()=>p.evaluate(async()=>{
   const {createRun}=await import('./final-cut-sim.js');const r=createRun();r.mode='playing';r.elapsed=10;
   Object.assign(r.player,{x:0,y:26,yaw:Math.PI/2});Object.assign(r.rig,{x:17.39,y:26,yaw:-Math.PI/2,phase:'pass',deployment:1,direction:-1});
   r.message='Record secured';r.messageTime=4;r.dialogue='One final pass.';r.dialogueTime=4;__finalCut.run=r;await advanceTime(0);
  });
  const finaleHud=()=>p.evaluate(()=>({caption:document.getElementById('caption').textContent,kind:document.getElementById('caption').dataset.kind,dialogue:document.getElementById('dialogue').textContent,threat:document.getElementById('threat').textContent,hintHidden:document.getElementById('hint').hidden}));
  const finale=[];const cdp=await p.context().newCDPSession(p);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await finaleFixture();
   if(width<=844){
    await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width/2,y:height/2,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.evaluate(()=>advanceTime(0));
   }
   const hud=await finaleHud();assert.equal(hud.kind,'danger');assert.match(hud.caption,/Move off/);assert.equal(hud.dialogue,'');assert.equal(hud.threat,'');assert(hud.hintHidden);
   const bounds=await p.locator('#caption').boundingBox();assert(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y>=0&&bounds.y+bounds.height<=height);
   await p.screenshot({path:`${out}/finale-${width}.png`});finale.push({width,height,hud,bounds,input:await p.evaluate(()=>JSON.parse(render_game_to_text()).inputMethod)});
  }
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await p.setViewportSize({width:1280,height:720});
  // Actual input: after a short reaction, move perpendicular to the pass. The
  // fixture faces the rig, so A travels off its strip without changing the pass.
  await finaleFixture();await p.evaluate(()=>advanceTime(250));await p.keyboard.down('a');await p.evaluate(()=>advanceTime(1800));await p.keyboard.up('a');
  const evasion=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert.equal(evasion.mode,'final_cut_playing');assert.notEqual((await finaleHud()).kind,'danger');assert(evasion.player.y>31.7);
  await finaleFixture();await p.evaluate(()=>advanceTime(2200));assert.equal(await p.evaluate(()=>__finalCut.run.mode),'caught');
  await finaleFixture();await p.evaluate(async()=>{const r=__finalCut.run;r.mode='aftermath';r.won=true;r.rig.phase='bogged';await advanceTime(0);});const aftermath=await finaleHud();assert.equal(aftermath.caption,'Record secured');assert.equal(aftermath.dialogue,'One final pass.');assert.notEqual(aftermath.kind,'danger');
  checks.push('Final Cut essential committed-pass warning wins over milestone/dialogue and optional-caption settings; four sizes, real touch presentation, keyboard evasion/idle capture and safe aftermath verified');
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,checks,views,chase,green,finale,evasion,aftermath,errors},null,2));console.log(JSON.stringify({passed:true,checks,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
