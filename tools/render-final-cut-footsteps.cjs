const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const out='output/final-cut/feedback';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4187/final-cut-footsteps.js');
 const clips=await page.evaluate(async()=>{
  const {createFinalCutFootsteps}=await import('./final-cut-footsteps.js'),{createRun}=await import('./final-cut-sim.js'),clips=[];
  for(const [surface,x,y,water,volume]of [['turf',0,40,0,.8],['rough',0,50,0,.8],['gravel',23,50,0,.8],['paving',0,2,0,.8],['road',0,107,0,.8],['wet',8,74,1,.8],['silent',0,2,0,0]]){
   const ctx=new OfflineAudioContext(2,44100,44100),source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),pan=ctx.createStereoPanner(),noise=ctx.createBuffer(1,88200,44100),data=noise.getChannelData(0);let seed=497;
   for(let i=0;i<data.length;i++){seed=(seed*1664525+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.45;}
   source.buffer=noise;source.loop=true;filter.type='lowpass';gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(ctx.destination);source.start();
   const f=createFinalCutFootsteps(ctx,{filter,gain,pan}),r=createRun();r.mode='playing';r.water=water;Object.assign(r.player,{x,y,walk:0,speed:3.84});f.update(r,true,volume);
   for(let i=0;i<2;i++){r.player.x+=.01;r.player.walk+=.7;r.time+=.18;f.update(r,true,volume);}
   const rendered=await ctx.startRendering(),left=rendered.getChannelData(0),right=rendered.getChannelData(1);let peak=0,energy=0,tail=0,crossings=0;
   const pcm=new Int16Array(88200);for(let i=0;i<left.length;i++){const v=left[i];peak=Math.max(peak,Math.abs(v));energy+=v*v;if(i>22050)tail+=v*v;if(i>0&&i<6615&&v*left[i-1]<0)crossings++;pcm[i*2]=Math.round(Math.max(-1,Math.min(1,v))*32767);pcm[i*2+1]=Math.round(Math.max(-1,Math.min(1,right[i]))*32767);}
   let binary='';const bytes=new Uint8Array(pcm.buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));clips.push({surface,peak,rms:Math.sqrt(energy/left.length),tail,crossings,stats:f.stats(),pcm:btoa(binary)});
  }return clips;
 });
 const wav=data=>{const h=Buffer.alloc(44);h.write('RIFF');h.writeUInt32LE(36+data.length,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(2,22);h.writeUInt32LE(44100,24);h.writeUInt32LE(176400,28);h.writeUInt16LE(4,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);return Buffer.concat([h,data]);};
 for(const c of clips){assert(Number.isFinite(c.peak));assert(c.peak<.1);assert.equal(c.tail,0);if(c.surface==='silent')assert.equal(c.peak,0);else{assert(c.peak>.0001);assert.equal(c.stats.last.surface,c.surface);fs.writeFileSync(out+'/footstep-'+c.surface+'.wav',wav(Buffer.from(c.pcm,'base64')));}}
 assert(clips.find(c=>c.surface==='paving').crossings>clips.find(c=>c.surface==='turf').crossings*2);
 fs.writeFileSync(out+'/footstep-audition.wav',wav(Buffer.concat(clips.filter(c=>c.surface!=='silent').flatMap(c=>[Buffer.from(c.pcm,'base64'),Buffer.from(c.pcm,'base64')]))));
 const report=clips.map(({pcm,...c})=>c);fs.writeFileSync(out+'/audio-render.json',JSON.stringify({passed:true,order:'Two contacts each: turf, rough, gravel, paving, road, wet. Raw effects voice at default footstep level; excludes master/effects bus attenuation and surrounding machinery.',clips:report},null,2));console.log(JSON.stringify({passed:true,clips:report.map(({surface,peak,rms,crossings})=>({surface,peak,rms,crossings}))}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
