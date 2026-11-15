const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out='output/under-green/service-grate';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const p=await browser.newPage();await p.goto('http://127.0.0.1:4187/under-green.html?test');
  const samples=await p.evaluate(async()=>{
   const {createUnderGreenAudio}=await import('./under-green-audio.js'),{createRun}=await import('./under-green-sim.js');
   const Real=window.AudioContext,results=[];
   try{
    for(const metal of [false,true]){
     let context;window.AudioContext=function(){return context=new OfflineAudioContext(2,48000,48000);};
     const audio=createUnderGreenAudio(()=>({volume:1,ambienceVolume:0,mowerVolume:0,dangerVolume:0,effectsVolume:1})),r=createRun();r.mode='playing';r.time=0;
     const x=metal?-7:-12;Object.assign(r.player,{x:x-1,y:40,yaw:0});
     audio.start();audio.update(r);let state;
     // Let the normal master fade reach its steady level before the landing.
     const contact=context.suspend(.25).then(()=>{r.time=.25;audio.footContacts(r,[{owner:r,time:.25,serial:1,foot:0,x,y:40,height:.002,phase:'walk'}]);state=audio.stats();return context.resume();});
     const rendered=context.startRendering();await contact;const buffer=await rendered;results.push({surface:metal?'metal':'stone',state,pcm:Array.from(buffer.getChannelData(1))});
    }
   }finally{window.AudioContext=Real;}return results;
  });
  const summary=[];
  for(const sample of samples){
   assert.equal(sample.state.lastFootstep.surface,sample.surface);assert.equal(sample.state.voices,16);
   const peak=Math.max(...sample.pcm.map(Math.abs)),energy=sample.pcm.reduce((s,n)=>s+n*n,0);console.log(JSON.stringify({surface:sample.surface,peak,energy}));assert(peak>.001&&peak<1,'Material sample must contain a non-clipped signal after the master fade');
   const buffer=Buffer.alloc(44+sample.pcm.length*2);buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(48000,24);buffer.writeUInt32LE(96000,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(sample.pcm.length*2,40);sample.pcm.forEach((n,i)=>buffer.writeInt16LE(Math.round(Math.max(-1,Math.min(1,n))*32767),44+i*2));fs.writeFileSync(`${out}/${sample.surface}-step.wav`,buffer);
   summary.push({surface:sample.surface,peak,energy,voices:sample.state.voices});
  }
  assert(samples[0].pcm.some((n,i)=>Math.abs(n-samples[1].pcm[i])>.00001));
  fs.writeFileSync(`${out}/audio.json`,JSON.stringify({passed:true,samples:summary,limits:['Production audio graph rendered offline for isolated material comparison, not a listening or in-game masking judgment.']},null,2));console.log(JSON.stringify({passed:true,samples:summary}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
