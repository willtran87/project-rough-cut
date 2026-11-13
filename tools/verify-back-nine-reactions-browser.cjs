const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/back-nine-reactions';fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.locator('#primary').click();await p.evaluate(()=>advanceTime(0));
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics),lines={};
 for(const kind of ['hiding','shortcut','damage','foot']){
  await p.evaluate(async kind=>{
   const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js'),{updateShortcuts}=await import('./chase-shortcuts.js'),{COURSE}=await import('./back-nine-course.js');
   const r=createRun();r.mode='driving';r.time=20;r.grace=0;r.story.seen=7;r.story.choiceSeen=0xffff;r.decoys.used=7;
   Object.assign(r.cart,{x:0,y:40});Object.assign(r.joe,{x:0,y:0});
   if(kind==='hiding'){Object.assign(r.cart,{x:-25,y:136});Object.assign(r.joe,{x:5,y:136});r.hunt.occluded=true;r.hunt.hiddenTime=2.3;}
   if(kind==='shortcut'){const g=COURSE.hurdles.find(g=>g.shortcut!==undefined);Object.assign(r.cart,{x:g.x,y:g.y,yaw:g.yaw,speed:5});updateShortcuts(r,{throttle:1},1/60,{x:g.x,y:g.y-.4,yaw:g.yaw});}
   if(kind==='damage'){r.impact.age=0;r.impact.damaged=true;r.cart.health=75;r.events.push({type:'contact',damage:25,time:r.time});r.message='CART HIT · Drive clear!';r.messageTime=2.5;}
   if(kind==='foot')leaveBrokenCart(r);
   __backNine.run=r;await advanceTime(0);
  },kind);
  if(kind==='damage'||kind==='foot'){
   assert(!/^JOE:/.test(await p.locator('#caption').innerText()),kind+': Immediate action guidance comes first');
   await p.evaluate(async()=>{const r=__backNine.run;r.time+=7;r.impact.age=99;r.messageTime=0;r.grace=0;r.story.cueTime=0;r.tension.cueTime=0;r.tension.phase='stalk';r.pressure.phase='dormant';r.panic.phase='quiet';r.hunt.phase='follow';r.joe.ram.phase='none';Object.assign(r.foot||r.cart,{x:0,y:40,speed:0,invulnerable:0});Object.assign(r.joe,{x:0,y:0,speed:0});await advanceTime(0);});
  }
  const line=await p.locator('#caption').innerText();assert.match(line,/^JOE:/,kind);
  assert(await p.evaluate(async({kind,line})=>{const {JOE_LINES}=await import('./back-nine-dialogue.js');return JOE_LINES[kind].some(s=>line.includes(s));},{kind,line}),kind+' uses matching pool');lines[kind]=line;
  await p.screenshot({path:out+'/'+kind+'-2560.png'});
  if(kind==='foot'){await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/foot-390.png'});await p.setViewportSize({width:2560,height:1600});}
  await p.keyboard.press('Escape');assert(await p.locator('#hud').isHidden());await p.keyboard.press('Escape');assert.equal(await p.locator('#caption').textContent(),'','Pause cancels an interrupted taunt');
  await p.evaluate(()=>{__backNine.run.impact.age=0;__backNine.run.impact.damaged=true;__backNine.run.message='CART HIT · Drive clear!';__backNine.run.messageTime=2;__backNine.render();});assert.match(await p.locator('#caption').innerText(),/CART HIT/);
 }
 const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(after.programs,before.programs);assert.equal(after.textures,before.textures);assert.deepEqual(errors,[]);
 fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,lines,errors,programs:after.programs,textures:after.textures},null,2));console.log(JSON.stringify({passed:true,lines,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
