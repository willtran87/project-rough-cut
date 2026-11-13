const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out='output/runover-drama';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/__runover-audio',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__runover-audio');
 const result=await p.evaluate(async()=>{
  const {createChaseAudio}=await import('./back-nine-audio.js'),{createRun}=await import('./back-nine-sim.js');
  async function render(kind){const rate=24000,ctx=new OfflineAudioContext(2,rate*5,rate),Native=window.AudioContext,allocations={};
   for(const name of ['createOscillator','createBuffer','createBufferSource','createGain','createBiquadFilter','createStereoPanner','createDynamicsCompressor']){const f=ctx[name].bind(ctx);ctx[name]=(...args)=>{allocations[name]=(allocations[name]||0)+1;return f(...args);};}
   window.AudioContext=function(){return ctx};const audio=createChaseAudio();audio.start();window.AudioContext=Native;const startup={...allocations};if(kind==='muted'||kind==='late')audio.toggle();
   let run=createRun(),age=-1,last=0,retried=false;run.mode='driving';run.cart.health=0;run.cart.failedAt=-20;run.foot={x:0,y:40,yaw:0,viewYaw:0,speed:0};run.joe.y=37;run.joe.speed=4.6;run.grace=0;
   const waits=[],events=[];let before={impacts:0,landings:0};
   for(let i=1;i<300;i++){const wall=i/60;waits.push(ctx.suspend(wall).then(()=>{
    const paused=kind==='paused'&&wall>=1.3&&wall<2.1;
    if(wall>=.5&&age<0)age=0;else if(age>=0&&!paused)age=Math.min(2.4,age+wall-last);last=wall;run.time=wall;
    if(age>=0&&!retried){run.death??={x:0,y:40,yaw:0,age:0,travel:0};run.death.age=age;run.joe.y=37+Math.min(1.65,age)*4.6;run.joe.speed=age<1.65?4.6:0;run.mode=paused?'paused':age<2.4?'dying':'caught';}
    if(kind==='late'&&i===120)audio.toggle();
    if(kind==='retry'&&wall>=1.3&&!retried){retried=true;run=createRun();run.mode='driving';}
    audio.update(run,!paused&&run.mode!=='caught'&&wall<4);const s=audio.stats().runOver;
    if(s.impacts!==before.impacts||s.landings!==before.landings)events.push({wall,age,...s});before={...s};ctx.resume();
   }));}
   const buffer=await ctx.startRendering();await Promise.all(waits);let peak=0,pauseTail=0,tail=0;
   for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);peak=Math.max(peak,v);if(i>rate*1.95&&i<rate*2.08)pauseTail=Math.max(pauseTail,v);if(i>rate*4.8)tail=Math.max(tail,v);}}
   const pcm=kind==='normal'?Array.from({length:buffer.length*2},(_,i)=>Math.round(Math.max(-1,Math.min(1,buffer.getChannelData(i%2)[i>>1]))*32767)):null;
   return {peak,pauseTail,tail,events,startup,allocations,stats:audio.stats(),pcm};
  }
  const results={};for(const kind of ['normal','paused','muted','late','retry'])results[kind]=await render(kind);return results;
 });
 const n=result.normal;assert.equal(n.stats.runOver.impacts,1);assert.equal(n.stats.runOver.landings,1);assert(n.peak>.04&&n.peak<.8);assert(Math.abs(n.events[1].age-.66)<.025);assert(result.paused.pauseTail<.0001);assert.equal(result.paused.stats.runOver.impacts,1);assert.equal(result.paused.stats.runOver.landings,1);assert.equal(result.muted.peak,0);assert.equal(result.late.stats.runOver.impacts,0);assert.equal(result.late.stats.runOver.landings,0);assert.equal(result.retry.stats.runOver.phase,'none');
 for(const r of Object.values(result)){assert.deepEqual(r.startup,r.allocations,'No audio allocation during death');assert.equal(r.stats.voices,12);assert(r.tail<.0001);}
 const pcm=n.pcm,bytes=Buffer.alloc(44+pcm.length*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);bytes.writeUInt32LE(24000,24);bytes.writeUInt32LE(96000,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(pcm.length*2,40);pcm.forEach((v,i)=>bytes.writeInt16LE(v,44+i*2));fs.writeFileSync(`${out}/runover-mix.wav`,bytes);
 for(const r of Object.values(result))delete r.pcm;assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/audio.json`,JSON.stringify({passed:true,...result,errors},null,2));console.log(JSON.stringify({passed:true,peak:n.peak,cues:n.events,pausedTail:result.paused.pauseTail,allocations:n.allocations,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
