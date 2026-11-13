const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/quiet-messages';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');
 await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});
 await p.evaluate(()=>advanceTime(0));await p.locator('#primary').click();
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);
 async function scene(kind){await p.evaluate(async kind=>{
  const {createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';r.grace=0;r.time=20;r.story.seen=7;r.story.choiceSeen=0xffff;r.decoys.used=7;
  Object.assign(r.cart,{x:0,y:90});Object.assign(r.joe,{x:0,y:50});
  if(kind==='rev'){r.joe.ram.phase='lineup';r.joe.ram.age=.8;}
  if(kind==='engine'){r.tension.cue='Behind you: the engine climbs.';r.tension.cueTime=3;}
  if(kind==='objective'){r.checkpoint=1;r.message='Maintenance relay online · checkpoint saved. One relay remains.';r.messageTime=4;}
  if(kind==='dialogue'){r.events.push({type:'contact',time:20,damage:10});}
  __backNine.run=r;if(kind==='dialogue')await advanceTime(0);else __backNine.render();await __backNine.whenPresented();
 },kind);}
 await scene('engine');assert.equal(await p.locator('#caption').textContent(),'');assert.equal(await p.locator('#sound-caption').textContent(),'');await p.screenshot({path:out+'/quiet-2560.png'});
 // The later chase-drama contract removed routine RAM/CHARGE banners; the
 // physical windup remains, with optional engine descriptions tested below.
 await scene('rev');assert.equal(await p.locator('#caption').textContent(),'');assert.equal(await p.locator('#sound-caption').textContent(),'');
 await p.keyboard.press('Escape');await p.locator('#chase-comfort summary').click();await p.locator('#chase-sound-captions').check();await p.locator('#chase-subtitles').uncheck();
 assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('rough-cut.settings.v1')).soundCaptions));await p.screenshot({path:out+'/settings-2560.png'});
 await p.locator('#primary').click();await scene('rev');assert.match(await p.locator('#sound-caption').textContent(),/engine rises/);
 const layouts=[];for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
  await p.setViewportSize({width,height});await p.evaluate(()=>__backNine.render());await p.waitForTimeout(80);
  const rect=await p.evaluate(()=>{const r=id=>{const b=document.getElementById(id).getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right};};return {caption:r('caption'),sound:r('sound-caption'),dashboard:(()=>{const b=document.querySelector('.dashboard').getBoundingClientRect();return {top:b.top};})()};});
  assert(rect.caption.bottom<=rect.sound.top);assert(rect.sound.bottom<=rect.dashboard.top,'Caption rails clear dashboard');assert(rect.caption.left>=0&&rect.caption.right<=width);
  layouts.push({width,height,...rect});await p.screenshot({path:out+'/warning-captions-'+width+'.png'});
 }
 await p.setViewportSize({width:2560,height:1600});await scene('objective');assert.match(await p.locator('#caption').textContent(),/checkpoint saved/);
 await scene('dialogue');assert.equal(await p.locator('#caption').textContent(),'','Dialogue toggle is respected');
 await p.keyboard.press('Escape');await p.locator('#chase-subtitles').check();await p.locator('#chase-sound-captions').uncheck();await p.locator('#primary').click();
 await scene('dialogue');assert.match(await p.locator('#caption').textContent(),/^JOE:/);const first=await p.locator('#caption').textContent();await p.screenshot({path:out+'/joe-2560.png'});
 await p.evaluate(()=>{const r=__backNine.run;r.message='Both relays online · checkpoint saved.';r.messageTime=4;__backNine.render();});assert.match(await p.locator('#caption').textContent(),/Both relays/);
 await p.evaluate(()=>{__backNine.run.messageTime=0;__backNine.render();});assert.equal(await p.locator('#caption').textContent(),'','Interrupted taunt never resumes');
 const quotes=[];
 for(let i=0;i<7;i++){
  await p.evaluate(async i=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(i%3);r.mode='caught';r.time=20;Object.assign(r.cart,{x:-23,y:770});r.story.collected=3;__backNine.run=r;__backNine.render();},i);
  const quote=await p.locator('#defeat-line').textContent();assert.notEqual(quote,quotes.at(-1));quotes.push(quote);
  if(i===0){await p.waitForFunction(()=>document.querySelector('#defeat-image').complete);await p.screenshot({path:out+'/defeat-2560.png'});}
  await p.keyboard.press('r');assert.equal(await p.evaluate(()=>__backNine.run.cart.health),100);assert.equal(await p.evaluate(()=>__backNine.run.checkpoint),i%3);assert(await p.locator('#defeat-dialogue').isHidden());
 }
 assert.equal(new Set(quotes).size,7);const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(after.programs,before.programs);assert.equal(after.textures,before.textures);
 await p.reload();await p.waitForFunction(()=>JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));
 await p.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(2);r.mode='caught';Object.assign(r.cart,{x:-23,y:770});__backNine.run=r;__backNine.render();});assert.notEqual(await p.locator('#defeat-line').textContent(),quotes.at(-1));
 await p.close();

 const l=await browser.newPage({viewport:{width:2560,height:1600}});l.on('pageerror',e=>errors.push(e.message));
 await l.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__quiet={state,resetFirstHole,render,setHoleMessage,holeMessageForPresentation,pushThreatCaption,visibleThreatCaptions,triggerJoeBark,selectJoeCaptureDialogue,savePreferences,selectSettingsCategory,drawQualityHud};\n  window.advanceTime = (milliseconds) => {')}));
 await l.goto('http://127.0.0.1:4187');await l.waitForFunction(()=>window.__quiet,null,{timeout:120000});await l.locator('canvas').click();await l.keyboard.press('Space');
 const levelOne=await l.evaluate(()=>{
  const t=__quiet,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.hole.elapsed=100;s.soundCaptions=false;
  t.setHoleMessage('THE ENGINE STUTTERS',3);const quiet=t.holeMessageForPresentation();s.soundCaptions=true;t.setHoleMessage('THE ENGINE STUTTERS',3);const described=s.hole.captions.some(c=>c.text==='THE ENGINE STUTTERS');s.threatCaptions=false;s.hole.controlHintSource=null;s.hole.controlHintTimer=0;s.hole.messageTimer=0;const independent=t.visibleThreatCaptions().some(c=>c.text==='THE ENGINE STUTTERS');s.threatCaptions=true;const separate=t.holeMessageForPresentation();
  t.setHoleMessage('KEY ACQUIRED',3);const objective=t.holeMessageForPresentation();s.hole.messageTimer=0;s.subtitles=true;t.triggerJoeBark('chase');const serial=s.hole.joeBarkSerial,line=s.hole.joeBark;t.triggerJoeBark('patrol');const blocked=s.hole.joeBarkSerial===serial;s.hole.elapsed+=36;t.triggerJoeBark('chase');const later=s.hole.joeBarkSerial>serial&&s.hole.joeBark!==line;
  const quotes=[];for(let i=0;i<8;i++){s.hole.elapsed=100;quotes.push(t.selectJoeCaptureDialogue().id);}
  s.soundCaptions=true;t.savePreferences();return {quiet,described,independent,separate,objective,blocked,later,quotes};
 });
 assert.equal(levelOne.quiet,'');assert(levelOne.described);assert(levelOne.independent);assert.equal(levelOne.separate,'');assert.equal(levelOne.objective,'KEY ACQUIRED');assert(levelOne.blocked&&levelOne.later);assert.equal(new Set(levelOne.quotes).size,8);
 await l.waitForFunction(()=>JSON.parse(render_game_to_text()).assets.course.ready,null,{timeout:120000});await l.evaluate(async()=>{__quiet.state.mode='first_hole';__quiet.state.hole.tutorialVisible=false;__quiet.state.hole.practiceDrill.active=false;__quiet.render();await RCScene3D.whenPresented();});await l.waitForFunction(()=>{__quiet.render();return RCScene3D.stats().ready&&!RCScene3D.isPreparing();},null,{timeout:120000});await l.evaluate(async()=>{__quiet.render();await RCScene3D.whenPresented();});await l.screenshot({path:out+'/level-one-2560.png'});
 const hud=await l.evaluate(()=>{const t=__quiet,s=t.state,h=s.hole;s.guidedHints=false;h.messageTimer=0;h.captions=[];h.cutTraceMemory=null;h.controlHintSource=null;h.controlHintTimer=0;h.detection=0;h.engagement.closeEscape.remaining=0;Object.assign(h.joe,{x:-100,y:0,mode:'patrol'});Object.assign(s.player,{x:40,y:140});s.soundCaptions=false;t.setHoleMessage('THE ENGINE STUTTERS',3);t.pushThreatCaption('SOUTH GATE // SOMETHING KNOCKS BACK');t.drawQualityHud();const quietCaption=document.querySelector('[data-q=caption]').textContent;const quiet=document.querySelector('[data-q="context"]').textContent;s.soundCaptions=true;s.threatCaptions=false;t.setHoleMessage('THE ENGINE STUTTERS',3);t.drawQualityHud();return {quiet,quietCaption,context:document.querySelector('[data-q="context"]').textContent,caption:document.querySelector('[data-q="caption"]').textContent};});
 assert(!hud.quiet.includes('ENGINE STUTTERS'));assert(!hud.quietCaption.includes('KNOCKS BACK'));assert(!hud.context.includes('ENGINE STUTTERS'));assert.match(hud.caption,/ENGINE STUTTERS/,'Actual DOM HUD honors sound captions independently');assert(await l.locator('[data-q=caption]').isVisible());await l.screenshot({path:out+'/level-one-sound-2560.png'});
 await l.evaluate(()=>{__quiet.state.mode='paused';__quiet.render();});await l.locator('#controls-launch').click();assert(await l.locator('[data-caption="soundCaptions"]').isChecked());await l.locator('[data-caption="soundCaptions"]').uncheck();assert.equal(await l.evaluate(()=>__quiet.state.soundCaptions),false);await l.locator('[data-caption="soundCaptions"]').check();await l.screenshot({path:out+'/level-one-controls-2560.png'});await l.locator('#controls-dialog button').first().click();

 await l.evaluate(()=>{__quiet.state.mode='settings';__quiet.selectSettingsCategory(2);__quiet.render();});for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){await l.setViewportSize({width,height});await l.evaluate(()=>__quiet.render());await l.screenshot({path:out+'/level-one-settings-'+width+'.png'});}
 await l.reload();await l.waitForFunction(()=>window.__quiet,null,{timeout:120000});const persisted=await l.evaluate(()=>{const t=__quiet;t.resetFirstHole();t.state.hole.elapsed=100;return {sound:t.state.soundCaptions,quote:t.selectJoeCaptureDialogue().id};});assert(persisted.sound);assert(!levelOne.quotes.includes(persisted.quote));
 assert.deepEqual(errors,[]);const report={passed:true,layouts,quotes,levelOne,hud,persisted,programs:after.programs,textures:after.textures,errors};fs.writeFileSync(out+'/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,layouts:layouts.length,defeats:quotes.length,levelOne,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
