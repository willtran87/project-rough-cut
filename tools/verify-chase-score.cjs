const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true});try{
 const p=await b.newPage();await p.route('**/__score-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__score-test');
 const result=await p.evaluate(async()=>{
  const {createChaseScore}=await import('./chase-score.js'),{createRun}=await import('./back-nine-sim.js');
  async function render(muted){
   const rate=24000,ctx=new OfflineAudioContext(1,rate*12,rate),counts={};
   for(const name of ['createOscillator','createGain','createBiquadFilter']){const original=ctx[name].bind(ctx);ctx[name]=(...args)=>{counts[name]=(counts[name]||0)+1;return original(...args);};}
   const score=createChaseScore(ctx,ctx.destination),allocated={...counts},run=createRun();run.mode='driving';run.grace=0;run.time=0;run.joe.y=run.cart.y-80;
   const waits=[],snapshots=[];let pausedPhase=null,resumedPhase=null;
   for(let i=1;i<720;i++)waits.push(ctx.suspend(i/60).then(()=>{
    const t=i/60,paused=t>=7&&t<8;if(!paused)run.time+=1/60;
    if(t>2){run.panic.serial=1;run.panic.phase='panic';run.cart.hits=3;run.cart.health=40;run.joe.y=run.cart.y-30;}
    if(t>4){run.foot={...run.cart,speed:7};run.joe.y=run.foot.y-10;}
    if(t>9)run.tension.phase='breather';
    score.update(run,!paused&&t<11,{musicVolume:muted?0:.7});
    if(i===420)pausedPhase=score.stats().phase;if(i===479)resumedPhase=score.stats().phase;
    if(i%60===0)snapshots.push({t,...score.stats()});ctx.resume();
   }));
   const buffer=await ctx.startRendering();await Promise.all(waits);const d=buffer.getChannelData(0);
   const rms=(a,z)=>{let sum=0;for(let i=a*rate;i<z*rate;i++)sum+=d[i]*d[i];return Math.sqrt(sum/((z-a)*rate));};
   return {allocated,counts,pausedPhase,resumedPhase,snapshots,peak:Math.max(...Array.from(d).filter((_,i)=>i%8===0).map(Math.abs)),opening:rms(0,1),chase:rms(5,6),paused:rms(7.8,7.95),tail:rms(11.8,11.95),pcm:muted?null:Array.from(d,v=>Math.round(Math.max(-1,Math.min(1,v))*32767))};
  }return {normal:await render(false),muted:await render(true)};
 });
 const n=result.normal;assert(n.chase>.02&&n.peak<.6);assert.equal(n.opening,0);assert(n.paused<.0001&&n.tail<.0001);assert.equal(n.pausedPhase,n.resumedPhase);assert.equal(result.muted.peak,0);assert.deepEqual(n.allocated,n.counts);assert.equal(n.counts.createOscillator,5);
 const pcm=n.pcm,bytes=Buffer.alloc(44+pcm.length*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(24000,24);bytes.writeUInt32LE(48000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(pcm.length*2,40);pcm.forEach((v,i)=>bytes.writeInt16LE(v,44+i*2));fs.writeFileSync('output/back-nine-chase-drama/chase-score.wav',bytes);delete n.pcm;delete result.muted.pcm;fs.writeFileSync('output/back-nine-chase-drama/score.json',JSON.stringify({passed:true,...result},null,2));console.log(JSON.stringify({passed:true,peak:n.peak,chaseRMS:n.chase,paused:n.paused,voices:n.counts.createOscillator}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
