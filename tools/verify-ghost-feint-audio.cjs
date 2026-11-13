const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out='output/ghost-feints-20261107';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true}),p=await b.newPage();
 try{
  await p.route('**/__feint-audio',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));await p.goto('http://127.0.0.1:4187/__feint-audio');
  const result=await p.evaluate(async()=>{
   const {createAtmosphericAudio}=await import('/atmospheric-audio.js'),c=new OfflineAudioContext(2,48000*4.8,48000),noise=c.createBuffer(1,96000,48000);
   const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.sin(i*1.729)*Math.cos(i*.713);
   const captions=[],a=createAtmosphericAudio(c,c.destination,noise,e=>captions.push(e.kind));
   const frame={time:0,active:true,volume:1,apparitions:true,player:{x:0,z:0,yaw:0},ghost:{key:'one',x:-3,z:-6,phase:'notice'}};
   a.update(frame);const pending=[];
   for(const [at,time,phase,gesture]of [[.8,1,'rush',null],[1.5,1.7,'rush','hesitate'],[2.3,2.5,'withdraw','feint'],[3.1,3.3,'withdraw','feint']])pending.push(c.suspend(at).then(()=>{const f={...frame,time,ghost:{...frame.ghost,phase,gesture}};a.update(f);a.update(f);return c.resume();}));
   pending.push(c.suspend(3.8).then(()=>{for(const guard of [{priority:true},{focus:true},{suspensePhase:'recovery'},{suspensePhase:'warning'},{apparitions:false},{active:false},{volume:0}])a.update({...frame,...guard,time:4,ghost:{...frame.ghost,key:'blocked',phase:'withdraw',gesture:'feint'}});return c.resume();}));
   const buffer=await c.startRendering();await Promise.all(pending);const stats=a.stats(),samples=buffer.getChannelData(0);let peak=0;const energy=[0,0];
   for(let i=0;i<samples.length;i++){peak=Math.max(peak,Math.abs(samples[i]));if(i>=1.5*48000&&i<2*48000)energy[0]+=samples[i]**2;if(i>=2.3*48000&&i<3*48000)energy[1]+=samples[i]**2;}
   a.dispose();return {stats,captions,peak,energy};
  });
  for(const cue of ['ghost_notice','ghost_rush','ghost_hesitate','ghost_feint'])assert.equal(result.stats.counts[cue],1);
  assert.equal(result.stats.events,4);assert(result.stats.maxVoices<=6&&result.stats.voices===0);assert(result.peak>.001&&result.peak<.15);assert(result.energy.every(v=>v>0));assert(result.stats.history.every(e=>e.pan<0));
  fs.writeFileSync(out+'/audio.json',JSON.stringify({passed:true,...result},null,2));console.log(JSON.stringify({passed:true,...result},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
