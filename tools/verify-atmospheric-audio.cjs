const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
const out='output/atmospheric-audio-20261107';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.route('**/__audio-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__audio-test');
  const synthesis=await p.evaluate(async()=>{
   const {createAtmosphericAudio,atmosphereSpatial}=await import('./atmospheric-audio.js'),results=[];
   const assert=(v,m)=>{if(!v)throw Error(m);};
   assert(atmosphereSpatial({x:0,z:0,yaw:0},{x:10,z:0}).pan>0,'Right source pans left');assert(atmosphereSpatial({x:0,z:0,yaw:Math.PI},{x:10,z:0}).pan<0,'Turn did not reverse spatial pan');
   for(const [kind,player,ghost]of [['woodland',{x:0,z:0}],['pond',{x:-7,z:-32}],['shed',{x:-17,z:-37}],['radio',{x:18,z:-52}],['fence',{x:12,z:-88}],['ghost',{x:0,z:0},{key:'test',x:6,z:-8}]]){
    const ctx=new OfflineAudioContext(2,48000*4,48000),noise=ctx.createBuffer(1,96000,48000),samples=noise.getChannelData(0);let seed=11;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=seed/2147483648-1;}
    const fx=createAtmosphericAudio(ctx,ctx.destination,noise),frame={time:0,active:true,volume:1,player:{...player,yaw:0},pressure:0,apparitions:true,ghost};fx.update(frame);
    const first=ctx.suspend(.05).then(()=>{fx.update({...frame,time:10});return ctx.resume();});
    const second=kind==='woodland'?ctx.suspend(1.2).then(()=>{fx.update({...frame,time:30});return ctx.resume();}):null;
    const third=kind==='woodland'?ctx.suspend(2.4).then(()=>{fx.update({...frame,time:50});return ctx.resume();}):null;
    const rendered=await ctx.startRendering();await Promise.all([first,second,third]);
    let peak=0,energy=0;for(let ch=0;ch<2;ch++)for(const v of rendered.getChannelData(ch)){peak=Math.max(peak,Math.abs(v));energy+=v*v;}
    const stats=fx.stats();assert(peak>.0001&&peak<.15,kind+' is silent or excessive');assert(stats.maxVoices<=6&&stats.voices===0,'Voices exceeded cap or leaked');
    const expected=kind==='woodland'?'owl':kind;assert(stats.counts[expected]>0,'Missing '+expected+' cue');
    results.push({kind,peak,rms:Math.sqrt(energy/(rendered.length*2)),...stats});fx.dispose();
   }
   const ctx=new OfflineAudioContext(2,48000,48000),noise=ctx.createBuffer(1,48000,48000),fx=createAtmosphericAudio(ctx,ctx.destination,noise),base={time:60,active:true,volume:0,player:{x:18,z:-52,yaw:0},pressure:1,apparitions:true};
   fx.update(base);assert(fx.stats().events===0,'Muted ambience allocated voices');fx.update({...base,volume:1,priority:true,time:61});assert(fx.stats().events===0,'Priority signal allowed new flavor');fx.update({...base,volume:1,focus:true,time:62});assert(fx.stats().events===0,'Listening Focus allowed new flavor');
   fx.update({...base,volume:1,time:140});const hush=fx.update({...base,volume:1,time:141}).hush;assert(hush<1,'No deliberate quiet window');fx.update({...base,active:false,volume:1,time:141});assert(!fx.stats().active,'Pause did not silence bus');fx.dispose();await ctx.startRendering();
   return {results,checks:['Rendered nature, ponds, sheds, fence, PA and ghost cues contain audio without clipping','At most six voices and all sources cleaned up','World panning changes with orientation','Mute, priority, Listening Focus and pause gating','Deliberate hush affects flavor without gameplay changes']};
  });
  await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__audioTest={state,resetFirstHole,render,updateAudio,ensureAudio,get fx(){return atmosphericAudio;}};\n  window.advanceTime = (milliseconds) => {')}));
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__audioTest&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{const t=__audioTest,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready,null,{timeout:90000});
  const integrated=await p.evaluate(async()=>{
   const t=__audioTest,s=t.state;t.ensureAudio();s.hole.elapsed=12;s.hole.detection=0;s.hole.joe.mode='patrol';s.hole.quietLog=null;Object.assign(s.player,{x:-60,y:210,yaw:0});
   const snapshot=()=>JSON.stringify({player:s.player,joe:s.hole.joe,detection:s.hole.detection});const before=snapshot();t.updateAudio();const active=t.fx.stats();t.updateAudio();const duplicate=t.fx.stats();if(snapshot()!==before)throw Error('Audio mutated movement/pathing');
   const samples=JSON.parse(render_game_to_text()).audio;if(active.events===0||duplicate.events!==active.events)throw Error('Missing events or duplicate render rescheduled audio');
   s.mode='paused';t.updateAudio();await new Promise(r=>setTimeout(r,100));const paused=t.fx.stats();if(paused.active||paused.voices)throw Error('Pause leaked audio voices');
   s.mode='first_hole';s.ambienceVolume=0;s.hole.elapsed=80;t.updateAudio();const muted=t.fx.stats();if(muted.events!==active.events)throw Error('Mute created cues');s.ambienceVolume=.9;
   s.apparitions=true;s.pursuitIntensity=1;s.hole.elapsed=100;s.hole.tensionDirector.reliefSeconds=0;s.hole.mapOpen=false;
   s.hole.horrorDirector.manifestation={type:'peripheral_groundskeeper',seed:42,side:1,seconds:1.2,duration:2};t.render();await RCScene3D.whenPresented();
   const anchor=RCScene3D.ambientAudioState();if(!anchor)throw Error('Visible ghost did not expose audio anchor');t.updateAudio();const ghost=t.fx.stats();if(!ghost.counts.ghost)throw Error('Actual sighting did not trigger ghost audio');
   s.apparitions=false;t.render();await RCScene3D.whenPresented();if(RCScene3D.ambientAudioState())throw Error('Disabled ghost retained audio anchor');
   return {active,paused,muted,ghost,anchor,levels:samples.levels};
  });await p.screenshot({path:out+'/pond.png'});assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,...synthesis,integrated,errors},null,2));console.log(JSON.stringify({passed:true,checks:synthesis.checks,cues:synthesis.results.map(r=>({kind:r.kind,peak:r.peak,voices:r.maxVoices})),integrated:integrated.active,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
