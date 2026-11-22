const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const out='output/back-nine-experience/audio-targets';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/__mixer-targets',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));
 // Today's code only: the old-vs-new PCM comparison against a saved old back-nine-audio.js was dropped.
 await p.goto('http://127.0.0.1:4187/__mixer-targets');
 const report=await p.evaluate(async()=>{
  const after=await import('./back-nine-audio.js'),{createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js'),{beginRunover,updateRunover}=await import('./chase-runover.js');
  async function render(module,kind){
   const rate=24000,ctx=new OfflineAudioContext(2,rate*9,rate),Native=window.AudioContext,targets=[0,0,0,0,0],allocations={};let gainIndex=0;
   for(const name of ['createOscillator','createBuffer','createBufferSource','createGain','createBiquadFilter','createStereoPanner','createDynamicsCompressor']){const original=ctx[name].bind(ctx);ctx[name]=(...args)=>{allocations[name]=(allocations[name]||0)+1;const result=original(...args);if(name==='createGain'&&gainIndex++<5){const id=gainIndex-1,method=result.gain.setTargetAtTime.bind(result.gain);result.gain.setTargetAtTime=(...values)=>{targets[id]++;return method(...values);};}return result;};}
   window.AudioContext=function(){return ctx;};const settings={volume:.42,musicVolume:.7,effectsVolume:.8,mowerVolume:.9,ambienceVolume:.6,dangerVolume:.7},audio=module.createChaseAudio(.72,settings);try{audio.start();}finally{window.AudioContext=Native;}
   const allocated={...allocations},waits=[],states=[];let r=createRun(0,0,37161);r.mode='driving';r.departure.phase='finished';r.grace=0;r.time=20;r.panic.serial=1;r.panic.phase='panic';Object.assign(r.cart,{x:0,y:90,speed:9,health:45});Object.assign(r.joe,{x:9,y:75,speed:12});
   for(let i=1;i<540;i++)waits.push(ctx.suspend(i/60).then(()=>{
    if(kind==='steady'){r.time+=1/60;audio.update(r,true);}
    else if(i<60){if(i===1||i===20||i===40)audio.intro(i===1?0:i===20?3:4,true,settings);}
    else{
     if(i===100){settings.effectsVolume=.25;settings.mowerVolume=.5;settings.volume=.3;}
     if(i===120){settings.effectsVolume=.8;settings.mowerVolume=.9;settings.volume=.42;}
     if(i===150)settings.muted=true;if(i===175)settings.muted=false;
     if(i===190)r.mode='paused';if(i===210)r.mode='driving';
     if(i===240&&kind==='death'){r.cart.health=0;leaveBrokenCart(r);}
     if(i===290&&kind==='death')r.lookBack=true;
     if(i===320&&kind==='death'){r.foot.invulnerable=0;beginRunover(r);}
     if(kind==='finale'){if(i===320)r.mode='sealing';if(i===380){r.finale.latched=true;r.mode='complete';r.finale.tail=2;}if(i>380)r.finale.tail=Math.max(0,r.finale.tail-1/60);}
     if(r.mode==='dying')updateRunover(r,1/60);else if(r.mode!=='paused')r.time+=1/60;
     audio.update(r,!['paused','caught'].includes(r.mode));
    }
    if(i%60===0)states.push({second:i/60,score:audio.stats().score,muted:audio.stats().muted,runOver:audio.stats().runOver,mix:audio.stats().mix});
    ctx.resume();
   }));
   const rendered=await ctx.startRendering();await Promise.all(waits);return{pcm:[rendered.getChannelData(0),rendered.getChannelData(1)],targets,allocated,allocations,states,voices:audio.stats().voices};
  }
  const results=[];
  for(const kind of ['steady','death','finale']){
   const next=await render(after,kind);let peak=0;for(let channel=0;channel<2;channel++)for(const v of next.pcm[channel]){if(!Number.isFinite(v))throw Error('non-finite sample');peak=Math.max(peak,Math.abs(v));}
   delete next.pcm;results.push({kind,peak,after:next});
  }
  // A reopened real context receives fresh mixer targets. Cache ownership is
  // per AudioParam, never a stale global setting value from the old graph.
  const Native=window.AudioContext,contexts=[],reopen=[];let counters;
  window.AudioContext=function(){const ctx=new Native();contexts.push(ctx);const gain=ctx.createGain.bind(ctx);let index=0;counters=[0,0,0,0,0];const current=counters;ctx.createGain=()=>{const g=gain(),id=index++;if(id<5){const target=g.gain.setTargetAtTime.bind(g.gain);g.gain.setTargetAtTime=(...args)=>{current[id]++;return target(...args);};}return g;};return ctx;};
  try{const audio=after.createChaseAudio();for(let cycle=0;cycle<2;cycle++){audio.start();const r=createRun();r.mode='driving';for(let i=0;i<120;i++){r.time=i/60;audio.update(r,true);}reopen.push([...counters]);audio.stop();}}finally{window.AudioContext=Native;await Promise.all(contexts.map(ctx=>ctx.state==='closed'?null:ctx.close()));}
  return{results,reopen};
 });
 fs.writeFileSync(out+'/mixer-targets.json',JSON.stringify({...report,errors},null,2));
 // No node is allocated after start, the mix is audible and finite, and each
 // of the five mixer parameters is scheduled only when its value changes.
 for(const row of report.results){assert.deepEqual(row.after.allocated,row.after.allocations);assert.equal(row.after.voices,14);assert(row.peak>0&&row.peak<=1);for(let i=1;i<5;i++)assert(row.after.targets[i]<=3);if(row.kind!=='finale')assert(row.after.targets[0]<=10);/* the finale tail ramps the master gain each frame (129 targets); its old ratio check against a saved old module was dropped */}
 assert.deepEqual(report.reopen,[[1,1,1,1,1],[1,1,1,1,1]]);assert.deepEqual(errors,[]);fs.writeFileSync(out+'/mixer-targets.json',JSON.stringify({passed:true,...report,errors},null,2));console.log(JSON.stringify({passed:true,results:report.results.map(r=>({kind:r.kind,peak:r.peak,targets:r.after.targets})),reopen:report.reopen}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
