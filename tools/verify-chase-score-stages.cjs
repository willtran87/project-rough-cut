const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true});try{
 const p=await b.newPage();await p.route('**/__score-stages',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__score-stages');
 const result=await p.evaluate(async()=>{
  const {createChaseScore}=await import('./chase-score.js'),{createRun}=await import('./back-nine-sim.js');
  const rate=24000,ctx=new OfflineAudioContext(1,rate*42,rate),counts={};
  for(const name of ['createOscillator','createGain','createBiquadFilter']){const original=ctx[name].bind(ctx);ctx[name]=(...args)=>{counts[name]=(counts[name]||0)+1;return original(...args);};}
  const score=createChaseScore(ctx,ctx.destination),allocated={...counts},run=createRun(),samples=[],waits=[];run.mode='driving';run.grace=0;run.joe.y=run.cart.y-80;
  let priorTempo=62,maxTempoStep=0;
  for(let i=1;i<2520;i++)waits.push(ctx.suspend(i/60).then(()=>{
   const t=i/60;run.time=t;
   if(t>=8){run.panic.serial=1;run.panic.phase='panic';run.cart.y=100;run.joe.y=70;}
   if(t>=13){run.checkpoint=1;run.cart.health=55;}
   if(t>=18){run.foot={...run.cart,y:640,speed:7};run.joe.y=610;}
   if(t>=23&&t<28)Object.assign(run.encounter,{updated:true,owner:'relief',stage:'flight'});
   if(t>=28){run.checkpoint=2;run.foot.y=750;run.joe.y=720;Object.assign(run.encounter,{updated:true,owner:'cruise',stage:'finale'});}
   if(t>=33){run.mode='sealing';run.encounter.owner='finale';}
   if(t>=38){run.mode='complete';run.finale.latched=true;}
   run.joe.ram.phase=t>=11&&t<12?'lineup':'none';
   score.update(run,true,{musicVolume:.7});const stats=score.stats();maxTempoStep=Math.max(maxTempoStep,Math.abs(stats.tempo-priorTempo));priorTempo=stats.tempo;
   if(i%60===0||i===11*60+30)samples.push({t,...stats});ctx.resume();
  }));
  const buffer=await ctx.startRendering();await Promise.all(waits);const d=buffer.getChannelData(0),rms=(a,z)=>{let sum=0;for(let i=a*rate;i<z*rate;i++)sum+=d[i]*d[i];return Math.sqrt(sum/((z-a)*rate));};let peak=0;for(const v of d)peak=Math.max(peak,Math.abs(v));
  return {allocated,counts,samples,maxTempoStep,peak,rms:{initial:rms(0,1),departure:rms(7,8),pursuit:rms(12,13),flight:rms(21,22),relief:rms(27,28),finale:rms(31,32),closing:rms(36,37),complete:rms(40,41)},pcm:Array.from(d,v=>Math.round(Math.max(-1,Math.min(1,v))*32767))};
 });
 const at=t=>result.samples.find(s=>s.t===t);
 for(const [t,arrangement]of [[7,'departure'],[12,'pursuit'],[17,'escalation'],[22,'flight'],[27,'relief'],[32,'finale'],[36,'closing']])assert.equal(at(t).arrangement,arrangement);
 assert.equal(result.rms.initial,0);assert(result.rms.departure>0&&result.rms.departure<result.rms.pursuit*.15);assert(result.rms.flight>result.rms.relief*8);assert(result.rms.complete<.0001);assert.equal(at(11.5).duck,.32);assert(at(27).pulse<.001);assert(at(22).tempo>at(12).tempo+10);assert(at(36).tempo<100);assert(result.maxTempoStep<3);assert(result.peak<.4);assert.deepEqual(result.counts,result.allocated);assert.equal(result.counts.createOscillator,5);
 const pcm=result.pcm,bytes=Buffer.alloc(44+pcm.length*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(24000,24);bytes.writeUInt32LE(48000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(pcm.length*2,40);pcm.forEach((v,i)=>bytes.writeInt16LE(v,44+i*2));delete result.pcm;
 const out='output/back-nine-experience/score';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/stages.wav',bytes);fs.writeFileSync(out+'/stages.json',JSON.stringify({passed:true,...result},null,2));console.log(JSON.stringify({passed:true,rms:result.rms,maxTempoStep:result.maxTempoStep,voices:result.counts.createOscillator}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
