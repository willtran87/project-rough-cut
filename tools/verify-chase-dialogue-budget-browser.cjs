const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const software=process.argv.includes('--software'),tag=software?'software':'hardware',out=process.env.CHASE_QA_OUT||'output/back-nine-experience/dialogue-budget';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],checks=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}'));
 await p.route('**/back-nine.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine.js','utf8').replace('simulate,render,whenPresented,COURSE};','simulate,render,whenPresented,COURSE,observeDialogue:()=>joeReactions.observe(run)};')}));
 await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.__backNine&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
 await p.evaluate(async()=>{
  const {createRun}=await import('./back-nine-sim.js'),{JOE_STORY_CUES}=await import('./back-nine-dialogue.js');
  window.dialogueStage=async(kind='yard')=>{const r=createRun();r.departure.phase='finished';r.mode='driving';r.time=20;r.grace=0;r.story.seen=7;r.story.choiceSeen=0xffff;r.decoys.used=7;r.tension.phase='stalk';r.encounter.updated=true;r.encounter.owner='cruise';r.encounter.age=2;Object.assign(r.cart,{x:0,y:90});Object.assign(r.joe,{x:0,y:50,seenAge:0});
   if(['yard','range','clubhouse'].includes(kind)){r.story.cue=JOE_STORY_CUES[['yard','range','clubhouse'].indexOf(kind)];r.story.cueTime=6;}
   if(kind==='damage')r.events.push({type:'contact',damage:10,time:r.time});
   if(kind==='shortcut')r.events.push({type:'shortcut',time:r.time});
   if(kind==='foot'){const{leaveBrokenCart}=await import('./chase-player.js');leaveBrokenCart(r);r.time+=7;r.foot.invulnerable=0;r.grace=0;r.messageTime=0;}
   __backNine.run=r;__backNine.observeDialogue();await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();return r;
  };await dialogueStage();
 });
 const approach=await p.evaluate(async()=>{
 const r=await dialogueStage('none'),key='rough-cut.back-nine-joe-lines.v1';
 Object.assign(r.cart,{x:0,y:90,speed:14,yaw:0});Object.assign(r.joe,{x:0,y:71,speed:21,yaw:0});
 r.events.push({type:'shortcut',time:r.time});__backNine.observeDialogue();const before=localStorage.getItem(key);__backNine.render();await __backNine.whenPresented();const denied=document.querySelector('#caption').textContent,unconsumed=before===localStorage.getItem(key);
 r.time+=.25;r.joe.y=50;r.joe.speed=14;__backNine.render();await __backNine.whenPresented();const admitted=document.querySelector('#caption').textContent;
 r.time+=.5;r.joe.speed=24;__backNine.render();await __backNine.whenPresented();const retained=document.querySelector('#caption').textContent;
 r.joe.ram.phase='lineup';r.encounter.owner='attack';__backNine.render();await __backNine.whenPresented();const interrupted=document.querySelector('#caption').textContent;
 return {denied,unconsumed,admitted,retained,interrupted};
 });assert.equal(approach.denied,'');assert(approach.unconsumed);assert.match(approach.admitted,/^JOE:/);assert.equal(approach.retained,approach.admitted);assert.equal(approach.interrupted,'');checks.push('fast approach cannot consume/start a taunt; later safe slot can; approach prediction never erases active text; physical attack interrupts');
 for(const kind of ['signal','gather']){const text=await p.evaluate(async kind=>{const r=await dialogueStage();if(kind==='signal')r.hunt.phase='signal';else r.pressure.phase='gather';__backNine.render();await __backNine.whenPresented();return document.querySelector('#caption').textContent;},kind);assert.equal(text,'',kind+' overrides the previous cruise snapshot');}checks.push('same-frame interception/gather changes suppress UI before the next encounter update');
 await p.evaluate(()=>dialogueStage());
 const before=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics),first=await p.locator('#caption').textContent();assert.match(first,/^JOE:/);
 const cooldown=await p.evaluate(async()=>{const r=__backNine.run,key='rough-cut.back-nine-joe-lines.v1',before=localStorage.getItem(key);r.time=25;r.story.cueTime=0;r.events.push({type:'contact',time:25,damage:10});__backNine.observeDialogue();__backNine.render();await __backNine.whenPresented();return {before,after:localStorage.getItem(key),text:document.querySelector('#caption').textContent};});
 assert.equal(cooldown.text,'');assert.equal(cooldown.before,cooldown.after,'No deck consumption during common cooldown');
 await p.evaluate(async()=>{const r=__backNine.run;r.time=55;r.events.push({type:'shortcut',time:55});__backNine.observeDialogue();__backNine.render();await __backNine.whenPresented();});
 assert(await p.evaluate(async()=>{const{JOE_LINES}=await import('./back-nine-dialogue.js');return JOE_LINES.shortcut.some(s=>document.querySelector('#caption').textContent.includes(s));}));
 checks.push('real UI: global cooldown does not consume a reaction; fresh shortcut displays at next slot');
 await p.evaluate(()=>{const r=__backNine.run;r.message='Maintenance relay online · checkpoint saved.';r.messageTime=4;__backNine.render();});assert.match(await p.locator('#caption').textContent(),/checkpoint saved/);
 await p.evaluate(()=>{__backNine.run.messageTime=0;__backNine.render();});assert.equal(await p.locator('#caption').textContent(),'');
 checks.push('objective interrupts without resuming stale taunt');
 const lines={};for(const kind of ['yard','range','clubhouse','damage','shortcut','foot']){await p.evaluate(k=>dialogueStage(k),kind);const line=await p.locator('#caption').textContent();assert.match(line,/^JOE:/,kind);assert(await p.evaluate(async({kind,line})=>{const{JOE_LINES}=await import('./back-nine-dialogue.js');return JOE_LINES[kind].some(s=>line.includes(s));},{kind,line}));lines[kind]=line;}
 for(const owner of ['attack','search','relief','recovery','checkpoint','intercept','diversion','tension','finale']){await p.evaluate(async owner=>{const r=await dialogueStage('none');r.encounter.owner=owner;r.events.push({type:'contact',damage:10,time:r.time});__backNine.observeDialogue();__backNine.render();await __backNine.whenPresented();},owner);assert.equal(await p.locator('#caption').textContent(),'',owner);}
 checks.push('six matching dialogue contexts and nine silent encounter priorities');
 const repaired=await p.evaluate(async()=>{const r=await dialogueStage('none'),{COURSE}=await import('./back-nine-course.js'),{updateService}=await import('./chase-service.js');Object.assign(r.cart,{...COURSE.checkpoints[0],health:50,speed:0});Object.assign(r.joe,{x:0,y:270,seenAge:0});
  for(let i=0;i<60;i++){r.time+=1/60;updateService(r,{brake:true},1/60);__backNine.observeDialogue();}__backNine.render();await __backNine.whenPresented();const during=document.querySelector('#caption').textContent;
  r.cart.y+=6;updateService(r,{brake:false},0);__backNine.run=r;__backNine.observeDialogue();__backNine.render();await __backNine.whenPresented();return{health:r.cart.health,during,after:document.querySelector('#caption').textContent};});
 assert(repaired.health>=55&&repaired.health<=57);assert.match(repaired.during,/CHARGER/);assert(await p.evaluate(async()=>{const{JOE_LINES}=await import('./back-nine-dialogue.js');return JOE_LINES.repair.some(s=>document.querySelector('#caption').textContent.includes(s));}));checks.push('actual partial repair transfers; interaction before taunt; repair-specific departure response');
 const layouts=[];for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(async()=>{__backNine.render();await __backNine.whenPresented();});const bounds=await p.evaluate(()=>{const a=document.querySelector('#caption').getBoundingClientRect(),b=document.querySelector('.dashboard').getBoundingClientRect();return{left:a.left,right:a.right,bottom:a.bottom,dashboard:b.top};});assert(bounds.left>=0&&bounds.right<=width&&bounds.bottom<=bounds.dashboard);layouts.push({width,height,...bounds});await p.screenshot({path:`${out}/${tag}-repair-${width}.png`});}
 await p.keyboard.press('Escape');await p.keyboard.press('Escape');assert.equal(await p.locator('#caption').textContent(),'');checks.push('pause cancels line; three viewport caption layouts clear dashboard');
 await p.keyboard.press('Escape');await p.locator('#chase-comfort summary').click();await p.locator('#chase-subtitles').uncheck();await p.locator('#chase-sound-captions').check();await p.click('#primary');
 await p.evaluate(async()=>{const r=await dialogueStage('damage');r.joe.ram.phase='lineup';r.joe.ram.age=.8;__backNine.render();await __backNine.whenPresented();});assert.equal(await p.locator('#caption').textContent(),'');assert.match(await p.locator('#sound-caption').textContent(),/engine rises/);checks.push('dialogue off does not disable separate sound descriptions; no ram or HP banner');
 const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(after.programs,before.programs);assert.equal(after.textures,before.textures);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${out}/${tag}.json`,JSON.stringify({passed:true,checks,approach,lines,repaired,layouts,programs:after.programs,textures:after.textures,errors},null,2));console.log(JSON.stringify({passed:true,software,checks,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
