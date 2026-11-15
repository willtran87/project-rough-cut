// Use the installed standard gameplay client, adding a presentation fence and
// a full-page capture alongside its raw canvas readback for GPU diagnostics.
import fs from 'node:fs';
const root='C:/Users/Will/.codex/skills/develop-web-game/';
let source=fs.readFileSync(root+'scripts/web_game_playwright_client.js','utf8');
const browserArgument=process.argv.indexOf('--software-browser');
if(browserArgument>=0){
 const executablePath=process.argv[browserArgument+1];
 if(!executablePath||!fs.existsSync(executablePath))throw new Error('Missing software browser executable');
 source=source.replace('chromium.launch({','chromium.launch({executablePath:'+JSON.stringify(executablePath)+',');
}
// Decorative overlays must not displace the gameplay canvas in raw captures.
source=source.replace('document.querySelectorAll("canvas")','document.querySelectorAll("canvas:not(.menu-grass-canvas)")');
if(process.argv.includes('--flood-shore-baseline'))source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.route('**/back-nine-irrigation-art.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/flood-shore/baseline-source/back-nine-irrigation-art.js','utf8')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
if(process.argv.includes('--turf-baseline'))source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.route('**/back-nine-short-turf-v2.webp',r=>r.fulfill({contentType:'image/webp',body:fs.readFileSync('web/assets/optimized/back-nine-fairway-turf-v1.webp')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
if(process.argv.includes('--native-renderer'))source=source.replace('"--use-angle=swiftshader"','"--use-angle=d3d11", "--ignore-gpu-blocklist"');
if(process.argv.includes('--warp'))source=source.replace('"--use-angle=swiftshader"','"--use-angle=d3d11-warp", "--ignore-gpu-blocklist"');
if(process.argv.includes('--stone-courses')||process.argv.includes('--hedge-growth')||process.argv.includes('--lantern-glass')||process.argv.includes('--dropped-paper')||process.argv.includes('--approach-wear')||process.argv.includes('--landmark-light')){
 source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__stoneClient={state};\\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
 source=source.replace('  let steps = null;',
 `  await page.waitForFunction(()=>window.RCScene3D?.stats().ready);
  await page.evaluate(()=>{const s=__stoneClient.state;s.hole.engagement.experience.arrival.phase='skipped';s.hole.practiceDrill.active=false;s.hole.tutorialVisible=false;Object.assign(s.player,${process.argv.includes('--landmark-light')?'{x:55,y:302,yaw:1,pitch:.03}':process.argv.includes('--approach-wear')?'{x:98.1501,y:594.15446,yaw:-.068541,pitch:-.721968}':process.argv.includes('--dropped-paper')?'{x:-36.88728,y:352.53024,yaw:1.333185,pitch:-.721968}':process.argv.includes('--lantern-glass')?'{x:14,y:483,yaw:-.12,pitch:-.4}':process.argv.includes('--hedge-growth')?'{x:0,y:552,yaw:Math.PI/2,pitch:-.12}':'{x:0,y:230,yaw:0,pitch:-.12}'});Object.assign(s.hole.joe,{x:100,y:700,patrolPause:9999});});
  await page.evaluate(()=>advanceTime(17));
  let steps = null;`);
}
if(process.argv.includes('--building-drainage')){
 source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__drainClient={state};\\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
 source=source.replace('  let steps = null;',
 `  await page.waitForFunction(()=>window.RCScene3D?.stats().ready);
  await page.evaluate(()=>{const s=__drainClient.state,o=RCScene3D.stats().pixelWorld.objects.find(o=>o.kind==='maintenance-shed');s.hole.engagement.experience.arrival.phase='skipped';s.hole.practiceDrill.active=false;s.hole.tutorialVisible=false;Object.assign(s.player,{x:(o.position[0]+3.015)/.1152,y:-(o.position[2]+4.28)/.16,yaw:Math.atan2(1,2.75),pitch:0});Object.assign(s.hole.joe,{x:100,y:30,patrolPause:9999});});
  await page.evaluate(()=>advanceTime(17));
  let steps = null;`);
}
if(process.argv.includes('--audit-bell')){
 source=source.replace('  b: "KeyB",','  b: "KeyB",\n  e: "KeyE",');
 source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__auditClient={state};\\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
 source=source.replace('  let steps = null;',
 `  await page.evaluate(()=>{const s=__auditClient.state;s.hole.engagement.experience.arrival.phase='skipped';s.hole.practiceDrill.active=false;s.hole.tutorialVisible=false;Object.assign(s.player,{x:77,y:148,yaw:Math.PI/2,pitch:.25});Object.assign(s.hole.joe,{x:110,y:700,patrolPause:9999});});
  let steps = null;`);
}
if(process.argv.includes('--station-paper')){
 source=source.replace('  b: "KeyB",','  b: "KeyB",\n  e: "KeyE",\n  one: "Digit1",\n  two: "Digit2",');
 source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__paperClient={state};\\n  window.advanceTime = (milliseconds) => {')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
 source=source.replace('  let steps = null;',
 `  await page.evaluate(()=>{const s=__paperClient.state;s.hole.engagement.experience.arrival.phase='skipped';s.hole.practiceDrill.active=false;s.hole.tutorialVisible=false;Object.assign(s.player,{x:${process.argv.includes('--paper-release')?97:-98},y:${process.argv.includes('--paper-release')?615:411},yaw:0,pitch:-.15});Object.assign(s.hole.joe,{x:100,y:30,patrolPause:9999});});
  await page.evaluate(()=>advanceTime(17));
  let steps = null;`);
}
if(process.argv.includes('--mower-scars')||process.argv.includes('--foliage-mowing')||process.argv.includes('--local-mist'))source=source.replace('  b: "KeyB",','  b: "KeyB",\n  q: "KeyQ",');
if(process.argv.includes('--local-mist'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:-12,y:210,yaw:0,speed:0,mode:'pursuing'});r.foot={x:-12,y:225,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--surface-finish'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:20,y:210,yaw:0,speed:12});r.foot={x:20,y:231,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--garage-motion')){
 source=source.replace('  b: "KeyB",','  b: "KeyB",\n  e: "KeyE",');
 source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.checkpoint=2;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:-23,y:795.5,yaw:0,health:100});Object.assign(r.joe,{x:35,y:600,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
}
if(process.argv.includes('--camera-clearance'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:-14.5,y:790,yaw:-Math.PI/2,health:100});Object.assign(r.joe,{x:0,y:600,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--practical-lights'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:0,y:285,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--windbreak'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:-7,y:118,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--player-motion'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:20,y:65,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
source=source.replace('from "playwright"',`from "file:///${root}node_modules/playwright/index.mjs"`);
if(process.argv.includes('--mower-scars'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:20,y:47,yaw:0,speed:10,mode:'pursuing'});r.foot={x:20,y:75,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--foliage-mowing'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:9,y:39,yaw:0,speed:10,mode:'pursuing'});r.foot={x:9,y:65,yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--route-margins'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:-2,y:55,yaw:-.3,viewYaw:-.3,viewPitch:.2,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--ghost-surface'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js'),{ghostRoutePose}=await import('./chase-ghost-routes.js');const r=createRun(0,0,0);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;const p=ghostRoutePose(0,20);Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:p.x,y:p.y-12,yaw:0,viewYaw:0,viewPitch:.07,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--minor-routes'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:-36.5,y:342,yaw:0,viewYaw:0,viewPitch:.32,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--player-art-baseline'))source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  for(const file of ['back-nine-scene.js','chase-runner.js','runner-materials.js'])await page.route('**/'+file+'*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('output/back-nine-visual-upgrade/player/baseline-source/'+file,'utf8')}));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });`);
if(process.argv.includes('--high-resolution'))source=source.replace('const page = await browser.newPage();','const page = await browser.newPage({viewport:{width:2560,height:1600}});');
if(process.argv.includes('--portrait-hud'))source=source.replace('const page = await browser.newPage();','const page = await browser.newPage({viewport:{width:390,height:844},hasTouch:true});');
if(process.argv.includes('--level-one'))source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(()=>window.render_game_to_text,null,{timeout:120000});
  await page.locator('#game').click();
  for(let i=0;i<5;i++){const mode=await page.evaluate(()=>JSON.parse(render_game_to_text()).mode);if(mode==='first_hole')break;if(mode==='menu'){await page.locator('.course-menu-start').click();await page.waitForFunction(()=>JSON.parse(render_game_to_text()).mode!=='menu',null,{timeout:180000});}else await page.keyboard.press('Space');await page.evaluate(()=>advanceTime(400));}
  await page.waitForFunction(()=>{window.advanceTime?.(16);return window.RCScene3D?.stats().ready&&!document.querySelector('[data-brief-start]')?.disabled;},null,{timeout:120000});
  await page.locator('[data-brief-start]').click();`);
if(process.argv.includes('--back-nine'))source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.addInitScript(()=>localStorage.setItem('rough-cut.back-nine-opening.v1',JSON.stringify({skip:true})));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});`);
source=source.replace('    await captureScreenshot(page, canvas, shotPath);',
 `    await page.evaluate(async()=>{await window.RCScene3D?.whenPresented();});
    await captureScreenshot(page, canvas, shotPath);
    await page.screenshot({path:path.join(args.screenshotDir,'page-'+i+'.png')});
    console.log('presented-capture',i,await canvas.evaluate(c=>({id:c.id,width:c.width,height:c.height})));`);
if(process.argv.includes('--sound-captions'))source=source.replace('  let steps = null;',
 `  await page.evaluate(()=>{const control=document.querySelector('#chase-sound-captions');control.checked=true;control.dispatchEvent(new Event('change',{bubbles:true}));});
  let steps = null;`);
if(process.argv.includes('--manual-gate'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,37161);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.zoneMask=7;r.tension.cooldown=r.hunt.cooldown=100;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:0,y:81,speed:0});Object.assign(r.joe,{x:0,y:20,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--dialogue-readable'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js'),{JOE_STORY_CUES}=await import('./back-nine-dialogue.js');const r=createRun(0,0,37161);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.zoneMask=7;r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;r.story.cue=JOE_STORY_CUES[0];r.story.cueTime=6;Object.assign(r.encounter,{updated:true,owner:'cruise',age:2});Object.assign(r.cart,{x:0,y:90,speed:14});Object.assign(r.joe,{x:0,y:30,speed:14,seenAge:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--mower-mouth'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:30,y:64,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:50,yaw:0,speed:10});r.foot={x:0,y:64,yaw:Math.PI,viewYaw:Math.PI,moveYaw:Math.PI,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--district-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:26,y:85,yaw:.75,viewYaw:.75,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--compound-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:10,speed:0});r.foot={x:30,y:518,yaw:.65,viewYaw:.65,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--shrubs-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:-40,speed:0});r.foot={x:10,y:93,yaw:.2,viewYaw:.2,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--beds-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:-40,speed:0});r.foot={x:30,y:60,yaw:.6,viewYaw:.6,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--planting-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});Object.assign(r.joe,{x:0,y:-40,speed:0});r.foot={x:6,y:44,yaw:.2,viewYaw:.2,speed:0,onFoot:true,invulnerable:0};__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--architecture-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;r.checkpoint=2;Object.assign(r.exitRelease,{released:true,open:1});Object.assign(r.cart,{x:-23,y:780,yaw:0,speed:0});Object.assign(r.joe,{x:0,y:680,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--irrigation-art'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;r.tactics.floodUntil[0]=60;Object.assign(r.cart,{x:-12,y:220,yaw:0,speed:0});Object.assign(r.joe,{x:0,y:100,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--bunker-banks'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x:14,y:219,yaw:0,viewYaw:0,viewPitch:.2,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:0,y:10,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--maintenance-bays'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,713);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;r.story.seen=7;r.story.choiceSeen=0xffff;Object.assign(r.cart,{x:35,y:10,health:0,failedAt:0});r.foot={x:${process.argv.includes('--maintenance-supplies')?12:-2},y:${process.argv.includes('--maintenance-supplies')?194:199},yaw:0,viewYaw:0,speed:0,onFoot:true,invulnerable:0};Object.assign(r.joe,{x:0,y:100,speed:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--course-ambience'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,37161);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.zoneMask=7;r.tension.cooldown=r.hunt.cooldown=100;r.panic.armed=false;Object.assign(r.cart,{x:28,y:190,speed:0});Object.assign(r.joe,{x:28,y:100,speed:3});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--director-gather'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun(0,0,37161);r.mode='driving';r.departure.phase='finished';r.grace=0;r.time=20;r.tension.phase='stalk';r.tension.cooldown=r.hunt.cooldown=100;r.panic.phase='panic';r.panic.serial=1;Object.assign(r.pressure,{phase:'gather',remaining:.8,seenPanic:1});Object.assign(r.cart,{x:0,y:95,speed:8});Object.assign(r.joe,{x:0,y:77,speed:16,yaw:0});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--service-choice'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(1,0,37161);r.mode='driving';r.time=20;r.grace=2.5;Object.assign(r.cart,{x:-1.9,y:298,health:50});Object.assign(r.joe,{x:0,y:244,speed:8});__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--runner-terrain'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(1,0,37161);r.mode='driving';r.time=20;r.grace=0;r.foot={x:-12,y:371,yaw:-.4,viewYaw:-.4,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:300,health:0});Object.assign(r.joe,{x:-5,y:330,speed:8});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--runner'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');const r=createRun(2);r.mode='driving';Object.assign(r.cart,{x:-24,y:749});Object.assign(r.joe,{x:-24,y:731});leaveBrokenCart(r);r.time=2;window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--damaged-cart'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';r.grace=8;Object.assign(r.cart,{x:0,y:35,health:15});Object.assign(r.joe,{x:0,y:20,speed:10});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--timber-gate'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';r.grace=8;Object.assign(r.cart,{x:0,y:75,yaw:0,speed:0});Object.assign(r.joe,{x:8,y:55,speed:0});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--pump-yard'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';r.grace=8;Object.assign(r.cart,{x:18,y:162,yaw:-.22,speed:0});Object.assign(r.joe,{x:10,y:140,speed:0});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--beacon-cover'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(1);r.mode='driving';r.time=11.2;r.grace=0;Object.assign(r.cart,{x:-13,y:425,yaw:0,speed:0});Object.assign(r.joe,{x:-25,y:434,yaw:Math.PI/2,speed:8});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--bunker-lane'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(1);r.mode='driving';r.time=20;r.grace=0;Object.assign(r.cart,{x:-28,y:455,yaw:0,speed:0});Object.assign(r.joe,{x:-25,y:432,speed:12});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--staff-record'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';r.time=20;r.grace=8;Object.assign(r.cart,{x:0,y:287,yaw:0,speed:0});Object.assign(r.joe,{x:0,y:245,speed:8});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--foot-gap'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js');const r=createRun(2);r.mode='driving';r.time=20;r.grace=0;r.foot={x:-33.76177146504766,y:769.4424650775176,yaw:.0578817,viewYaw:.0578817,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:-28,y:750,speed:6,yaw:0});window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--runover'))source=source.replace('  let steps = null;',
 `  await page.evaluate(async()=>{const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js');const r=createRun(0,0,window.__backNine.run.variation.seed);r.mode='driving';r.time=20;Object.assign(r.cart,{x:0,y:20});leaveBrokenCart(r);r.cart.failedAt=0;r.grace=0;Object.assign(r.foot,{x:0,y:40,invulnerable:0,speed:0});Object.assign(r.joe,{x:0,y:${process.argv.includes('--front-collision')?43:37},speed:10,yaw:${process.argv.includes('--front-collision')?'Math.PI':0}});r.joe.ram.phase='none';window.__backNine.run=r;await advanceTime(17);});
  let steps = null;`);
if(process.argv.includes('--presentation-audit'))source=source.replace(
 `    await page.screenshot({path:path.join(args.screenshotDir,'page-'+i+'.png')});`,
 `    const inspectPresentation=()=>page.evaluate(()=>{const hud=document.getElementById('quality-hud'),s=window.RCScene3D?.stats();return {hidden:hud?.hidden,display:hud&&getComputedStyle(hud).display,visibility:document.visibilityState,frames:s?.frames,phone:s?.arrivalPhoneVisible,preparing:s?.preparing};});
    const presentationBefore=await inspectPresentation();
    await page.screenshot({path:path.join(args.screenshotDir,'page-'+i+'.png')});
    const presentationAfter=await inspectPresentation();
    await page.evaluate(async()=>{await window.RCScene3D?.whenPresented();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    await page.screenshot({path:path.join(args.screenshotDir,'page-settled-'+i+'.png')});
    fs.writeFileSync(path.join(args.screenshotDir,'presentation-'+i+'.json'),JSON.stringify({before:presentationBefore,after:presentationAfter,settled:await inspectPresentation()},null,2));`);
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
