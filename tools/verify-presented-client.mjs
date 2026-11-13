// Use the installed standard gameplay client, adding a presentation fence and
// a full-page capture alongside its raw canvas readback for GPU diagnostics.
import fs from 'node:fs';
const root='C:/Users/Will/.codex/skills/develop-web-game/';
let source=fs.readFileSync(root+'scripts/web_game_playwright_client.js','utf8');
source=source.replace('from "playwright"',`from "file:///${root}node_modules/playwright/index.mjs"`);
if(process.argv.includes('--high-resolution'))source=source.replace('const page = await browser.newPage();','const page = await browser.newPage({viewport:{width:2560,height:1600}});');
if(process.argv.includes('--level-one'))source=source.replace('  await page.goto(args.url, { waitUntil: "domcontentloaded" });',
 `  await page.addInitScript(()=>localStorage.setItem('rough-cut.opening-story.v1',JSON.stringify({skip:true})));
  await page.goto(args.url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(()=>window.render_game_to_text,null,{timeout:120000});
  await page.locator('#game').click();
  for(let i=0;i<5;i++){const mode=await page.evaluate(()=>JSON.parse(render_game_to_text()).mode);if(mode==='first_hole')break;await page.keyboard.press('Space');await page.evaluate(()=>advanceTime(400));}
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
