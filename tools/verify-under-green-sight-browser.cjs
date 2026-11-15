const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 const out='output/under-green/sight',errors=[],views=[];fs.mkdirSync(out,{recursive:true});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const tick=ms=>p.evaluate(ms=>advanceTime(ms),ms);
  async function fixture(){await p.evaluate(async()=>{
   const {createRun}=await import('./under-green-sim.js'),{LEVER}=await import('./under-green-course.js');
   const r=createRun(1);r.mode='playing';r.time=30;r.elapsed=30;r.messageTime=0;
   Object.assign(r.player,{x:LEVER.x+.8,y:LEVER.y-.19,yaw:-Math.PI/2,eyeHeight:1.65,grace:999});
   Object.assign(r.joe,{x:LEVER.x-2.2,y:LEVER.y-.19,yaw:Math.PI/2,phase:'walk',last:{x:LEVER.x-2.2,y:LEVER.y-.19}});
   __underGreen.run=r;__underGreen.clearInput();advanceTime(0);
  });}
  const read=()=>p.evaluate(()=>{const r=__underGreen.run;return {seen:r.joe.seen,evidence:r.joe.evidence,eye:r.player.eyeHeight,ray:__underGreen.inspectView([{id:'joe-eyes',x:r.joe.x,y:r.joe.y,height:1.75}])[0]};});
  for(const [width,height]of [[2560,1600],[1280,720],[844,390],[390,844]]){
   await p.setViewportSize({width,height});await fixture();await tick(17);const standing=await read();assert(standing.seen&&standing.ray.clear);await p.screenshot({path:`${out}/standing-${width}.png`});
   await p.keyboard.down('c');await tick(350);const crouched=await read();assert(crouched.eye<1.13);assert(!crouched.seen);assert(!crouched.ray.clear);await p.screenshot({path:`${out}/crouched-${width}.png`});
   await p.keyboard.up('c');await tick(350);const risen=await read();assert(risen.seen&&risen.ray.clear);views.push({width,height,standing,crouched,risen});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({passed:true,views,errors},null,2));console.log(JSON.stringify({passed:true,viewports:views.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
