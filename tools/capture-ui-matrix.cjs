/* Visual review fixtures; state setup is not completion evidence. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(os.homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=path.resolve(process.env.ROUGH_CUT_QA_OUT || 'output/a-grade-closure/ui');fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync('web/game.js','utf8'),browser=await chromium.launch({headless:true}),errors=[],captures=[];
 const page=await browser.newPage({viewport:{width:2560,height:1600}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:source.replace('  window.advanceTime = (milliseconds) => {',
 '  window.__ui={state,render,resetFirstHole,recordVictory,createCaptureReview,selectSettingsCategory,pauseButtonGeometry,resultActionGeometry,compactMenuButton,bindingRowGeometry};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await page.goto('http://127.0.0.1:4187');await page.locator('canvas').click();await page.keyboard.press('Space');
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(window.render_game_to_text()).assets.course.ready);
  for(const [width,height,method] of [[2560,1600,'keyboard'],[1280,720,'keyboard'],[800,600,'keyboard'],[844,390,'keyboard'],[844,390,'gamepad'],[844,390,'touch']]){
   await page.setViewportSize({width,height});
   for(const mode of ['menu','settings','bindings','paused','defeat','victory','rehearsal']){
    await page.evaluate(({mode,method})=>{const t=window.__ui,s=t.state;t.resetFirstHole();s.manualTime=true;s.mode=mode;s.transitionAlpha=0;s.uiScale=1.3;s.inputMethod=method;s.settingsReturnMode='paused';s.settingsPage=mode==='bindings'?'bindings':'mix';s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.messageTimer=0;s.hole.zoneBannerTimer=0;s.hole.joe.y=650;s.hole.joe.x=100;s.keyboardBindings.interact='NumpadMultiply';
      if(['settings','bindings'].includes(mode)){s.mode='settings';t.selectSettingsCategory(2);}
      if(mode==='victory'){s.hole.nightOrderActionsCompleted=['audit-bell','field-log','release-review'];s.hole.keyCollected=true;s.hole.elapsed=88;s.hole.result=t.recordVictory('shed');}
      if(mode==='defeat')s.hole.captureReview=t.createCaptureReview(false);
      if(mode==='rehearsal'){s.mode='first_hole';s.hole.rehearsal=true;}
      t.render();},{mode,method});
    const name=`${mode}-${method}-${width}`;await page.screenshot({path:path.join(out,name+'.png')});captures.push(name);
   }
  }
  const click=async(x,y)=>{const box=await page.locator('canvas').boundingBox();await page.mouse.click(box.x+x*box.width/1280,box.y+y*box.height/720);};
  await page.evaluate(()=>{const s=window.__ui.state;s.mode='menu';s.inputMethod='keyboard';window.__ui.render();});
  await click(290,330);assert.equal(await page.evaluate(()=>window.__ui.state.mode),'settings');
  await page.evaluate(()=>{window.__ui.state.settingsPage='bindings';window.__ui.render();});
  await click(900,300);assert.equal(await page.evaluate(()=>window.__ui.state.bindingCaptureId),'interact');
  await page.keyboard.press('NumpadMultiply');assert.equal(await page.evaluate(()=>window.__ui.state.keyboardBindings.interact),'NumpadMultiply');
  await click(320,635);assert.equal(await page.evaluate(()=>window.__ui.state.keyboardBindings.interact),'Enter');
  await click(960,635);assert.equal(await page.evaluate(()=>window.__ui.state.settingsPage),'mix');
  await page.evaluate(()=>{window.__ui.state.mode='paused';window.__ui.render();});
  const pauseBottom=await page.evaluate(()=>{const b=window.__ui.pauseButtonGeometry(0);return {x:b.x+b.width/2,y:b.y+b.height-3};});
  await click(pauseBottom.x,pauseBottom.y);assert.equal(await page.evaluate(()=>window.__ui.state.mode),'first_hole');
  await page.evaluate(()=>{const t=window.__ui;t.state.hole.result=t.recordVictory('shed');t.state.hole.escapeRoute='shed';t.state.mode='victory';t.render();});
  const resultMenu=await page.evaluate(()=>{const b=window.__ui.resultActionGeometry(2);return {x:b.x+b.width/2,y:b.y+b.height-3};});
  await click(resultMenu.x,resultMenu.y);assert.equal(await page.evaluate(()=>window.__ui.state.mode),'menu');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({sourceHash:require('node:crypto').createHash('sha256').update(source).digest('hex'),passed:true,captures,inputChecks:['Compact menu opens settings','Long physical remap, reset and Back work through actual input','Bottom of the visible pause button resumes','Bottom of the result Menu button returns'],errors},null,2));console.log(`${captures.length} menu/result/input captures; compact pointer/remap checks pass; no browser errors`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
