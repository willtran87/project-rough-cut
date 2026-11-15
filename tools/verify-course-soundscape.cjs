const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/course-soundscape';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await browser.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.route('**/__soundscape',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__soundscape');
  const audio=await p.evaluate(async()=>{
   const {createAtmosphericAudio}=await import('./atmospheric-audio.js'),results=[];
   for(const y of [40,120,220,320,405,500,590,680]){
    const ctx=new OfflineAudioContext(2,48000*3,48000),noise=ctx.createBuffer(1,48000,48000);let seed=11;
    const data=noise.getChannelData(0);for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}
    const fx=createAtmosphericAudio(ctx,ctx.destination,noise),f={time:0,courseY:y,active:true,volume:1,pressure:0,apparitions:false,player:{x:y===320?18:0,z:-y*.16,yaw:0}};
    fx.update(f);const ready=ctx.suspend(.05).then(()=>{fx.update({...f,time:10});return ctx.resume();});const buffer=await ctx.startRendering();await ready;
    let energy=0,peak=0;for(let c=0;c<2;c++)for(const v of buffer.getChannelData(c)){energy+=v*v;peak=Math.max(peak,Math.abs(v));}
    results.push({y,peak,rms:Math.sqrt(energy/(buffer.length*2)),...fx.stats()});fx.dispose();
   }
   // Enter silence while a natural voice is already sounding; recovery must
   // not manufacture wildlife in the authored lifeless area.
   const ctx=new AudioContext(),noise=ctx.createBuffer(1,48000,48000),fx=createAtmosphericAudio(ctx,ctx.destination,noise),base={active:true,volume:1,pressure:0,apparitions:false,player:{x:0,z:0,yaw:0}};
   fx.update({...base,time:10,courseY:40});const before=fx.stats();fx.update({...base,time:11,courseY:500,suspensePhase:'recovery'});await new Promise(r=>setTimeout(r,650));
   const silent=fx.stats();fx.update({...base,time:35,courseY:500,suspensePhase:'recovery'});const recovery=fx.stats();fx.update({...base,time:60,courseY:590});const returned=fx.stats();fx.update({...base,time:60,courseY:590});const duplicate=fx.stats();fx.update({...base,time:61,courseY:590,active:false});await new Promise(r=>setTimeout(r,80));const paused=fx.stats();fx.dispose();await ctx.close();
   return {results,before,silent,recovery,returned,duplicate,paused};
  });
  for(const r of audio.results){assert(r.peak<.15);assert.equal(r.voices,0);assert(r.maxVoices<=6);if(r.y===500){assert.equal(r.peak,0);assert.equal(r.events,0);}else assert(r.peak>.00001,JSON.stringify(r));}
  assert(audio.results.find(r=>r.y===320).counts.radio);assert(audio.results.find(r=>r.y===405).counts.shed);
  assert.equal(audio.silent.voices,0);assert.equal(audio.recovery.events,audio.before.events);assert(audio.returned.events>audio.recovery.events);assert.equal(audio.returned.events,audio.duplicate.events);assert.equal(audio.paused.voices,0);
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__soundscape={state,resetFirstHole,render,updateAudio,ensureAudio,get fx(){return atmosphericAudio;}};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto('http://127.0.0.1:4187');await p.locator('#game').click();await p.waitForFunction(()=>window.__soundscape);
  await p.evaluate(()=>{const t=__soundscape,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,apparitions:false});s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.elapsed=100;t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:120000});
  const integrated=await p.evaluate(()=>{
   const t=__soundscape,s=t.state;t.ensureAudio();Object.assign(s.player,{x:0,y:500,yaw:0});Object.assign(s.hole.joe,{x:100,y:30,mode:'patrol'});s.hole.hasLineOfSight=false;s.hole.detection=0;
   const before=JSON.stringify({p:s.player,j:s.hole.joe,completed:s.hole.nightOrderActionsCompleted});t.updateAudio();const dead=t.fx.stats();t.updateAudio();if(before!==JSON.stringify({p:s.player,j:s.hole.joe,completed:s.hole.nightOrderActionsCompleted}))throw Error('Audio mutated gameplay');
   s.mode='paused';t.updateAudio();const paused=t.fx.stats();s.mode='first_hole';s.hole.elapsed+=1;s.player.y=590;t.updateAudio();const outside=t.fx.stats();t.render();return {dead,paused,outside};
  });assert.equal(integrated.dead.zone,'dead_green');assert.equal(integrated.dead.natureGain,0);assert(!integrated.paused.active);assert.equal(integrated.outside.zone,'night_range');
  await p.evaluate(async()=>RCScene3D.whenPresented());await p.screenshot({path:out+'/night-range-2560.png'});
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,audio,integrated,errors},null,2));console.log(JSON.stringify({passed:true,zones:audio.results.map(({zone,rms,events})=>({zone,rms,events})),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
