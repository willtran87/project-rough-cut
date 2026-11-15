const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),frames=[];let frame=0;
 const result=traverse({wet:true,dodge:true,inspect:r=>{
  if(++frame%3||r.joe.phase==='absent'||r.time>26.2)return;
  frames.push(structuredClone({time:r.time,mode:r.mode,player:r.player,joe:r.joe,gate:r.gate,bypass:r.bypass,bypassAt:r.bypassAt}));
 }});assert.equal(result.mode,'complete');
 const out='output/under-green/signal-framing/actor';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[],probes=[];
  p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});await p.click('#primary');
  const selected=frames.filter(f=>[25.6,25.8,26].some(t=>Math.abs(f.time-t)<.001));assert.equal(selected.length,3);
  let cursor=0;
  for(const target of selected){
   const end=frames.indexOf(target),prefix=frames.slice(cursor,end+1);cursor=end+1;
   await p.evaluate(prefix=>{for(const f of prefix){Object.assign(__underGreen.run,f);advanceTime(0);}},prefix);
   const probe=await p.evaluate(()=>{
    const r=__underGreen.run,j=r.joe;r.messageTime=0;
    // Only the QA observer moves; Joe retains the sampled ordinary wet-route pose.
    Object.assign(r.player,{x:3,y:58,yaw:Math.atan2(j.x-3,j.y+.8-58),pitch:.1,eyeHeight:1.65,crouched:false,speed:0,rearAngle:0});advanceTime(0);
    return {time:r.time,joe:{x:j.x,y:j.y,phase:j.phase},geometry:__underGreen.inspectJoeGeometry(),actor:JSON.parse(render_game_to_text()).graphics.actor};
   });
   assert.deepEqual(probe.geometry.hits,[]);probes.push(probe);await p.screenshot({path:`${out}/wet-${target.time.toFixed(1)}-2560.png`});
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:true,method:'Actual wet-route pose prefix, then a staged QA observer for close visual inspection; actor geometry is audited against the rendered scenery',probes,errors},null,2));console.log(JSON.stringify({passed:true,poses:probes.length,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
