const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/foot-audio';fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true});
 try{
  const p=await b.newPage();await p.route('**/__foot-audio',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__foot-audio');
  const result=await p.evaluate(async()=>{
   const {createRunnerFootstepAudio}=await import('./runner-footstep-audio.js'),{surfaceAt}=await import('./back-nine-course.js');
   const positions={};for(let y=20;y<800;y+=2)for(let x=-38;x<=38;x+=2){const point={x,y},surface=surfaceAt(point);positions[surface]??=point;}
   async function render(kind){
    const rate=24000,ctx=new OfflineAudioContext(1,rate*7,rate),counts={};
    for(const name of ['createOscillator','createGain','createBiquadFilter','createBufferSource']){const original=ctx[name].bind(ctx);ctx[name]=(...a)=>{counts[name]=(counts[name]||0)+1;return original(...a);};}
    const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),level=ctx.createGain();osc.type='triangle';filter.type='lowpass';level.gain.value=0;osc.connect(filter);filter.connect(level);level.connect(ctx.destination);osc.start();
    const audio=createRunnerFootstepAudio(ctx,{osc,filter,level}),initial={...counts},run={time:10,mode:'driving',foot:{speed:6.6,ejection:{at:0}}},waits=[],events=[];let serial=0,sim=10,oldOwner=null;
    for(let i=1;i<420;i++)waits.push(ctx.suspend(i/60).then(()=>{
     const wall=i/60,paused=kind==='paused'&&wall>=2.4&&wall<3.4,active=kind!=='muted'&&!paused&&wall<6.3;
     if(!paused)sim+=1/60;run.time=sim;run.mode=paused?'paused':'driving';
     if(kind==='retry'&&i===240){oldOwner=run.foot;run.foot={speed:6.6,ejection:{at:0}};}
     audio.begin(run,active);
     if(i%15===0&&wall<6){const surface=['path','rough','wet','sand'][Math.min(3,Math.floor(wall/1.5))],e={owner:run.foot,serial:++serial,time:run.time,foot:serial%2,phase:kind==='turn'?'turn':'run',height:.001,...positions[surface]};audio.present(run,[e],active);audio.present(run,[e],active);events.push({wall,surface,...audio.stats()});}
     if(oldOwner&&i===241){const before=audio.stats().played;audio.present(run,[{owner:oldOwner,serial:999,time:run.time,height:0,...positions.path}],true);if(audio.stats().played!==before)throw Error('Old run contact played');}
     ctx.resume();
    }));
    const buffer=await ctx.startRendering();await Promise.all(waits);const data=buffer.getChannelData(0);let peak=0;for(const v of data)peak=Math.max(peak,Math.abs(v));
    const rms=(start,end)=>{let sum=0;for(let i=Math.floor(start*rate);i<end*rate;i++)sum+=data[i]*data[i];return Math.sqrt(sum/((end-start)*rate));};
    const beforeStale=audio.stats().played,e={owner:run.foot,serial:++serial,time:run.time-1,height:0,...positions.path};audio.present(run,[e],true);audio.present(run,[e],true);if(audio.stats().played!==beforeStale)throw Error('Stale contact played');
    return {kind,initial,counts,peak,tail:rms(6.8,6.95),pause:rms(2.9,3.3),materials:[rms(.2,1.4),rms(1.7,2.9),rms(3.2,4.4),rms(4.7,5.9)],events,stats:audio.stats(),pcm:kind==='normal'?Array.from(data,v=>Math.round(v*32767)):null};
   }
   const results=[];for(const kind of ['normal','muted','paused','turn','retry'])results.push(await render(kind));
   const {createChaseAudio}=await import('./back-nine-audio.js'),{createRun}=await import('./back-nine-sim.js');
   const audio=createChaseAudio(),run=createRun();run.mode='driving';run.time=10;run.foot={x:0,y:40,yaw:0,speed:6,ejection:{at:0}};run.cart.failedAt=0;run.cart.health=0;audio.start();audio.update(run,false);
   const event={owner:run.foot,serial:1,time:10,foot:0,height:0,phase:'run',...positions.path};
   audio.presentRunner(run,[event],false);const inactive=audio.stats().footsteps.played;
   audio.update(run,true);audio.presentRunner(run,[event],true);const staleOnFocus=audio.stats().footsteps.played;
   audio.presentRunner(run,[{...event,serial:2}],true);const active=audio.stats().footsteps.played;
   audio.presentRunner(run,[{...event,serial:3}]);const unspecified=audio.stats().footsteps.played;
   audio.stop();return {positions,results,presentationGate:{inactive,staleOnFocus,active,unspecified}};
  });
  assert.deepEqual(result.presentationGate,{inactive:0,staleOnFocus:0,active:1,unspecified:1});
  const [normal,muted,paused,turn,retry]=result.results;
  assert.equal(normal.stats.played,23);assert.equal(muted.peak,0);assert.equal(muted.stats.played,0);assert(paused.pause<.0001);assert(paused.stats.played<normal.stats.played);assert(turn.peak<normal.peak*.5);assert.equal(retry.stats.played,23);
  for(const r of result.results){assert(r.peak<.3);assert(r.tail<.0001);assert.deepEqual(r.counts,r.initial);assert.equal(r.counts.createOscillator,1);assert(r.stats.dropped>=1);}
  assert(normal.materials[0]>normal.materials[1]*1.2);assert(normal.materials[2]>normal.materials[3]*1.2);
  const pcm=normal.pcm,bytes=Buffer.alloc(44+pcm.length*2);bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(24000,24);bytes.writeUInt32LE(48000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(pcm.length*2,40);pcm.forEach((v,i)=>bytes.writeInt16LE(v,44+i*2));fs.writeFileSync(out+'/path-rough-wet-sand.wav',bytes);normal.pcm=null;
  fs.writeFileSync(out+'/offline-audio.json',JSON.stringify({passed:true,...result},null,2));console.log(JSON.stringify({passed:true,peak:normal.peak,steps:normal.stats.played,materials:normal.materials,pausedTail:paused.pause,allocated:normal.counts}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
