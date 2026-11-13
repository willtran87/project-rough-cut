// Controlled positioning isolates objective gates. Full input-only runs are
// separately recorded by play-complete-route.cjs; this is not a route playtest.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv[2]||'output/win-audit-20261108/objectives';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],results=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__win={state,resetFirstHole,render,variants:RUN_VARIANTS,actions:NIGHT_ORDER_ACTIONS,key:activeKeyPoint,valve:activeSprinklerPoint,shed:SHED_EXIT,drain:DRAIN_EXIT,interaction:courseInteractionPromptPresentation};\n  window.advanceTime = (milliseconds) => {')}));
 const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
 const read=()=>p.evaluate(()=>{const t=__win,h=t.state.hole;return {mode:t.state.mode,checks:[...h.nightOrderActionsCompleted],key:h.keyCollected,drain:h.drainUnlocked,route:h.escapeRoute,quiet:!!h.quietLog,filing:h.escapeFiling,owner:t.interaction()};});
 const stand=async kind=>{await p.evaluate(kind=>{const t=__win,s=t.state,h=s.hole,a=kind==='key'?t.key():kind==='valve'?t.valve():kind==='shed'?t.shed:kind==='drain'?t.drain:t.actions.find(a=>a.id===kind);Object.assign(s.player,{x:a.x,y:a.y-8,yaw:0,pitch:-.2});Object.assign(h.joe,{x:a.x>0?-100:100,y:a.y>360?20:700,mode:'patrol',patrolPause:9999});h.distraction=null;h.distractionTimer=0;h.detection=0;h.hasLineOfSight=false;h.statusRequest.active=false;s.keys.clear();t.render();},kind);await tick(17);};
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__win&&JSON.parse(render_game_to_text()).assets.course.ready);
  for(let variant=0;variant<3;variant++)for(const exit of ['shed','drain']){
   await p.evaluate(i=>{const t=__win;t.resetFirstHole(t.variants[i]);Object.assign(t.state,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false});t.state.hole.tutorialVisible=false;t.render();},variant);await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
   await stand(exit);await p.keyboard.press('e');await tick(100);let s=await read();assert(!s.filing.active&&s.mode==='first_hole','Locked exit must reject');
   await stand(exit==='shed'?'key':'valve');await p.keyboard.press('e');await tick(17);s=await read();assert(exit==='shed'?s.key:s.drain,exit+' access');
   await stand(exit);await p.keyboard.press('e');await tick(100);s=await read();assert(!s.filing.active&&s.mode==='first_hole','Cannot exit before checks');
   // Running out of optional lure balls must never make a required check impossible.
   await p.evaluate(()=>{__win.state.hole.golfBalls=0;});
   for(const id of ['audit-bell','field-log','release-review']){
    const quiet=id==='field-log'&&exit==='shed';
    await stand(id);if(quiet)await p.keyboard.down('c');await p.keyboard.press('e');await tick(quiet?1800:17);await p.keyboard.up('c');s=await read();assert(s.checks.includes(id),JSON.stringify({variant,exit,id,s}));
   }
   await stand(exit);await p.keyboard.press('e');await tick(17);s=await read();assert(s.filing.active,'Final filing must start');
   await p.keyboard.down('w');await tick(100);await p.keyboard.up('w');s=await read();assert(!s.filing.active&&s.mode==='first_hole','Moving cancels filing');assert.equal(s.checks.length,3,'Cancellation preserves checks');
   await stand(exit);await p.keyboard.press('e');await tick(17);s=await read();assert(s.filing.active,'Interrupted filing can restart');await tick(6500);s=await read();assert.equal(s.mode,'victory');assert.equal(s.route,exit);results.push({variant,exit,checks:s.checks,mode:s.mode,zeroBalls:true,logMethod:exit==='shed'?'quiet':'loud',filingRetry:true});
   await p.evaluate(async()=>{__win.render();await RCScene3D.whenPresented();});await p.screenshot({path:out+'/'+variant+'-'+exit+'.png'});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({passed:true,results,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
