const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/under-green/release';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),rows=[],errors=[],clearance=[];
 try{
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   const context=await browser.newContext({viewport:{width,height},hasTouch:width<900,isMobile:width<500}),p=await context.newPage();
   p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
   const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms),read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
   async function seed(occupied=false){
    await p.evaluate(async occupied=>{const {createRun}=await import('./under-green-sim.js'),{SLUICE}=await import('./under-green-course.js');
     const r=createRun(3);r.mode='playing';r.messageTime=0;Object.assign(r.player,{x:SLUICE.x,y:SLUICE.y+1.3,yaw:Math.PI,pitch:-.48});
     if(occupied)Object.assign(r.joe,{x:12,y:15.7,phase:'search',search:0,last:{x:12,y:15.7}});
     __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
    },occupied);
    if(width<900){await p.touchscreen.tap(width/2,height/2);await tick(0);}
   }
   const use=()=>width<900?p.locator('#use').tap():p.keyboard.press('e');
   async function capture(name){if(width<900){await p.touchscreen.tap(width/2,height/2);await tick(0);}await p.evaluate(()=>__underGreen.whenPresented());const state=await read();
    const view=await p.evaluate(async()=>{const {SLUICE}=await import('./under-green-course.js');const point=__underGreen.inspectView([{id:'actuator',...SLUICE}])[0],card=document.getElementById('objective-card').getBoundingClientRect();return {point,card:{x:card.x,y:card.y,right:card.right,bottom:card.bottom},x:(point.screen.x+1)*innerWidth/2,y:(1-point.screen.y)*innerHeight/2};});
    if(width<900&&name!=='cancelled'){assert(view.point.inView);assert(!(view.x>view.card.x&&view.x<view.card.right&&view.y>view.card.y&&view.y<view.card.bottom),'objective hides actuator');}
    await p.screenshot({path:`${out}/${name}-${width}.png`});rows.push({name,width,height,inputMethod:state.inputMethod,gate:state.gate,closing:state.closing,mode:state.mode,release:state.graphics.release,draws:state.graphics.draws,textures:state.graphics.textures,view});fs.writeFileSync(out+'/partial.json',JSON.stringify({rows,errors},null,2));return state;}
   await seed();const open=await capture('open');
   assert.equal(open.graphics.release.button,0);assert.equal(open.graphics.release.secured,false);
   assert(Math.abs(open.graphics.release.housingBounds.min[1])<1e-8,JSON.stringify(open.graphics.release.housingBounds));
   assert(open.action?.id==='gate');
   await use();await tick(350);const moving=await capture('closing');
   assert(moving.closing&&moving.gate>0&&moving.gate<1);assert(moving.graphics.release.buttonHeight<open.graphics.release.buttonHeight);assert(moving.graphics.release.witnessHeight<open.graphics.release.witnessHeight);assert(!moving.graphics.release.secured);
   await p.keyboard.press('Escape');const paused=await read();await tick(500);assert.deepEqual((await read()).graphics.release,paused.graphics.release);await p.click('#primary');
   await tick(1100);const closed=await capture('secured');assert.equal(closed.mode,'under_green_aftermath');assert.equal(closed.graphics.release.secured,true);assert(Math.abs(closed.graphics.release.latchAngle)<1e-8);
   await tick(5000);await p.reload();await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await tick(0);assert.equal((await read()).graphics.release.secured,true);
   // Back out with ordinary movement before the gate seals, then let it reopen.
   await seed();await use();await tick(50);await p.keyboard.down('s');await tick(400);await p.keyboard.up('s');const cancelled=await read();assert(!cancelled.closing);assert.equal(cancelled.graphics.release.secured,false);await tick(1200);const reopened=await capture('cancelled');assert.equal(reopened.gate,0);assert.equal(reopened.graphics.release.button,0);assert.equal(reopened.graphics.release.latchAngle,Math.PI/2);
   // A rejected release cannot move or advertise a locked gate.
   await seed(true);await use();await tick(17);const blocked=await capture('blocked');assert.equal(blocked.gate,0);assert.equal(blocked.graphics.release.button,0);assert.equal(blocked.graphics.release.secured,false);
   await seed();await p.keyboard.press('Escape');await p.locator('#comfort summary').evaluate(e=>e.parentElement.open=true);await p.locator('#reduced').setChecked(true);await p.click('#primary');await tick(0);await use();await tick(1450);const reduced=await capture('reduced-secured');assert.equal(reduced.graphics.release.secured,true);assert.equal(reduced.graphics.release.latchAngle,0);
   if(width===2560){
    await seed();
    const probe=await p.evaluate(async()=>{
     const {SLUICE,solid}=await import('./under-green-course.js');const poses=[];
     for(let a=0;a<Math.PI*2;a+=Math.PI/12)for(const radius of [.55,.65,.9,1.3]){
      const point={x:SLUICE.x+Math.sin(a)*radius,y:SLUICE.y+Math.cos(a)*radius};if(solid(point,.3))continue;
      for(const height of [1.12,1.65])for(const pitch of [-.85,0,.85])for(const yaw of [a,a+Math.PI/2,a+Math.PI,a-Math.PI/2])poses.push({...point,height,pitch,yaw,fov:85,aspect:844/390});
     }
     const phases=[];for(const gate of [0,.1,.5,.95,1]){__underGreen.run.gate=gate;advanceTime(0);phases.push({gate,samples:poses.length,failures:__underGreen.inspectCameraClearance(poses).filter(p=>p.hits.length)});}return phases;
    });
    clearance.push(...probe);assert.deepEqual(probe.flatMap(p=>p.failures),[]);
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,rows,clearance,errors,limits:['Seeded keeper approach; desktop E and compact browser-touch Use. Retreat/pause use keyboard on all sizes. No physical-device comfort claim.','Visual mechanical feedback only: no change to closure rules, reach, movement or enemy state.']},null,2));console.log(JSON.stringify({passed:true,views:rows.length,cameraSamples:clearance.reduce((n,p)=>n+p.samples,0),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
