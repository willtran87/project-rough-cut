const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/cart-damage-audio';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/__damage-audio',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__damage-audio');
 const result=await p.evaluate(async()=>{
  const {createChaseAudio}=await import('./back-nine-audio.js'),{createRun}=await import('./back-nine-sim.js');
  async function render(kind){const rate=24000,seconds=10,ctx=new OfflineAudioContext(2,rate*seconds,rate),Native=window.AudioContext,allocations={};
   for(const name of ['createOscillator','createBuffer','createBufferSource','createGain','createBiquadFilter','createStereoPanner','createDynamicsCompressor']){const original=ctx[name].bind(ctx);ctx[name]=(...args)=>{allocations[name]=(allocations[name]||0)+1;return original(...args);};}
   window.AudioContext=function(){return ctx};const a=createChaseAudio(.72,{musicVolume:0});a.start();window.AudioContext=Native;const startup={...allocations};if(kind==='muted')a.toggle();
   let r=createRun(),sim=0,last=0,serial=0;function reset(){r=createRun();r.mode='driving';r.grace=0;r.cart.x=0;r.cart.y=40;r.cart.speed=9;r.joe.x=0;r.joe.y=-80;r.panic.age=5;r.pressure.phase='dormant';}reset();
   const events=[],samples=[],waits=[];let previous={},stoppedRattles=0,repairedRattles=0,retryStats=null;
   for(let i=1;i<600;i++){const wall=i/60;waits.push(ctx.suspend(wall).then(()=>{
    const paused=kind==='paused'&&wall>=4.8&&wall<5.8;sim+=paused?0:wall-last;last=wall;r.time=sim;r.mode=paused?'paused':'driving';r.impact.age+=paused?0:1/60;
    for(const [at,health]of [[.6,73],[1.8,18],[4.6,0]])if(sim>=at&&serial<([.6,1.8,4.6].indexOf(at)+1)){serial++;if(kind!=='baseline'){
     r.cart.health=health;r.impact={serial,age:0,strength:.8,damaged:true,x:-.5,y:40};if(!health){r.cart.speed=0;r.cart.failedAt=sim;r.foot={x:0,y:43.5,yaw:0,viewYaw:0,speed:0,onFoot:true,ejection:{at:sim,incomingSpeed:9}};}
    }}
    if(kind==='repair'){if(sim>=2.8&&sim<3.5){r.cart.speed=0;stoppedRattles=a.stats().cartDamage.rattles;}if(sim>=3.5&&sim<4.6){r.cart.speed=9;r.cart.health=80;repairedRattles=a.stats().cartDamage.rattles;}}
    if(kind==='retry'&&wall>=5&&!retryStats){retryStats=a.stats();reset();r.time=sim;}
    if(kind==='muted-late'&&i===282)a.toggle();if(kind==='muted-late'&&i===450)a.toggle();
    // Competing cues must not overwrite a collapse; consume them once.
    if(kind==='priority'&&sim>=5.58&&sim<5.6){r.courseFX.cue={serial:1,kind:'timber',power:1,age:0,x:0,y:40};r.hunt.commit.passes=1;r.hunt.commit.release=1;r.pressure.waves=2;}
    if(r.courseFX.cue)r.courseFX.cue.age+=1/60;
    if(r.foot)r.foot.y=43.5+Math.max(0,sim-5.8)*2;
    if(!paused&&!r.foot)r.distance+=Math.abs(r.cart.speed)/60;
    a.update(r,!paused&&wall<8.8);const stats=a.stats().cartDamage;
    for(const k of ['crunches','rattles','failures','collapseCues','ejectionLandings'])if(stats[k]!==previous[k]&&stats[k])events.push({kind:k,count:stats[k],wall,time:sim,age:r.cart.failedAt===undefined?-1:sim-r.cart.failedAt});
    samples.push({wall,time:sim,active:!paused&&wall<8.8,...stats});previous={...stats};ctx.resume();
   }));}
   const buffer=await ctx.startRendering();await Promise.all(waits);let peak=0,tail=0,pauseTail=0;const rms=[];
   for(let sec=0;sec<seconds;sec++){let energy=0;for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=sec*rate;i<(sec+1)*rate;i++){const v=Math.abs(data[i]);peak=Math.max(peak,v);energy+=v*v;if(i>rate*9.7)tail=Math.max(tail,v);if(i>rate*5.65&&i<rate*5.8)pauseTail=Math.max(pauseTail,v);}}rms.push(Math.sqrt(energy/(rate*2)));}
   const pcm=kind==='normal'?Array.from({length:buffer.length*2},(_,i)=>Math.round(Math.max(-1,Math.min(1,buffer.getChannelData(i%2)[i>>1]))*32767)):null;
   return {peak,tail,pauseTail,rms,events,samples: samples.filter((s,i)=>i%6===0),startup,allocations,stats:a.stats(),stoppedRattles,repairedRattles,retryStats,pcm};
  }
  const result={};for(const kind of ['normal','baseline','muted','paused','repair','retry','muted-late','priority'])result[kind]=await render(kind);return result;
 });
 const n=result.normal;assert.equal(n.stats.voices,12);assert.equal(n.stats.cartDamage.crunches,3);assert(n.stats.cartDamage.rattles>=3);assert.equal(n.stats.cartDamage.failures,1);assert.equal(n.stats.cartDamage.collapseCues,4);assert.equal(n.stats.cartDamage.phase,'silent-wreck');assert(n.peak>.05&&n.peak<.85);assert(n.tail<.0001);assert(Math.abs(n.rms[5]-result.baseline.rms[5])>.005,'Breakdown changes the audible mix');
 for(const v of Object.values(result)){assert.deepEqual(v.allocations,v.startup,'No new audio resources during gameplay');assert.equal(v.allocations.createOscillator+v.allocations.createBufferSource,12);assert.equal(v.allocations.createBuffer,2);}
 assert.equal(result.muted.peak,0);assert.equal(result.muted.stats.cartDamage.crunches,0);assert.equal(result.muted.stats.cartDamage.collapseCues,0);assert(result.paused.pauseTail<.0001);assert.equal(result.paused.stats.cartDamage.collapseCues,4);
 assert.equal(n.stats.cartDamage.ejectionLandings,1);assert.equal(result.paused.stats.cartDamage.ejectionLandings,1);assert.equal(result.muted.stats.cartDamage.ejectionLandings,0);assert.equal(result['muted-late'].stats.cartDamage.ejectionLandings,0);assert.equal(result.retry.stats.cartDamage.ejectionLandings,0);assert(Math.abs(n.events.find(e=>e.kind==='ejectionLandings').age-.64)<.025,'Boot landing follows the actual ejection');
 const cues=n.events.filter(e=>e.kind==='collapseCues');for(const [i,time]of [.16,.93,1.34,1.65].entries())assert(Math.abs(cues[i].age-time)<.025,'Collapse cue sync');
 assert.equal(result.repair.stoppedRattles,result.repair.repairedRattles,'Stationary/repaired cart stops rattling');assert.equal(result.retry.stats.cartDamage.phase,'intact');assert.equal(result.retry.stats.cartDamage.collapseCues,result.retry.retryStats.cartDamage.collapseCues,'Retry cancels old collapse');
 assert.equal(result['muted-late'].stats.cartDamage.collapseCues,0,'Unmute does not replay missed collapse');assert.equal(result.priority.stats.coursePlays,0);assert.equal(result.priority.stats.closePassPlays,0);assert.equal(result.priority.stats.cartDamage.collapseCues,4);assert.deepEqual(errors,[]);
 const pcm=n.pcm,bytes=Buffer.alloc(44+pcm.length*2);bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);bytes.writeUInt32LE(24000,24);bytes.writeUInt32LE(96000,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(pcm.length*2,40);pcm.forEach((v,i)=>bytes.writeInt16LE(v,44+i*2));fs.writeFileSync(`${out}/damage-to-breakdown.wav`,bytes);for(const v of Object.values(result))delete v.pcm;
 fs.writeFileSync(`${out}/offline-audio.json`,JSON.stringify({passed:true,...result,errors},null,2));console.log(JSON.stringify({passed:true,peak:n.peak,voices:n.stats.voices,damage:n.stats.cartDamage,cues,allocations:n.allocations,pausedTail:result.paused.pauseTail,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
