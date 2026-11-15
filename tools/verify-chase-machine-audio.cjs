const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{const out=process.env.CHASE_QA_OUT||'output/back-nine-experience/survival-audio';fs.mkdirSync(out,{recursive:true});
 const source=fs.readFileSync('web/back-nine-audio.js','utf8'),from='(proximity*.10+(run.lastImpact*.25+surge*.035+approachLevel*.065)*Math.min(1,proximity*2))',to='(proximity*.10+run.lastImpact*.25+surge*.035+approachLevel*.065)';assert(source.includes(from));
 const legacy=source.replace(from,to);fs.writeFileSync(out+'/previous-range-audio.js',legacy);
 const browser=await chromium.launch({headless:true});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/__machine-audio',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));
 await p.route('**/back-nine-audio.js?previous-range',r=>r.fulfill({contentType:'application/javascript',body:legacy}));
 await p.goto('http://127.0.0.1:4187/__machine-audio');
 const result=await p.evaluate(async()=>{
  const {createChaseAudio}=await import('./back-nine-audio.js'),old=await import('./back-nine-audio.js?previous-range'),{createRun}=await import('./back-nine-sim.js'),{chaseMessages}=await import('./back-nine-messages.js');
  const rows=[];
  async function render(o={}){
   const rate=24000,ctx=new OfflineAudioContext(2,rate*1.2,rate),Native=window.AudioContext,counts={};
   for(const key of ['createOscillator','createBuffer','createBufferSource','createGain','createBiquadFilter','createStereoPanner']){const f=ctx[key].bind(ctx);ctx[key]=(...args)=>{counts[key]=(counts[key]||0)+1;return f(...args);};}
   const settings={volume:.12,musicVolume:0,effectsVolume:0,ambienceVolume:0,dangerVolume:0,mowerVolume:1,muted:!!o.muted};
   window.AudioContext=function(){return ctx;};let audio;try{audio=(o.legacy?old.createChaseAudio:createChaseAudio)(.72,settings);audio.start();}finally{window.AudioContext=Native;}
   const allocated={...counts},r=createRun();r.mode='driving';r.time=20;r.grace=0;Object.assign(r.cart,{x:0,y:330,yaw:0,speed:0});
   Object.assign(r.joe,{x:(o.side??1)*(o.distance??12),y:330,speed:o.speed??8});r.lookBack=!!o.rear;r.hunt.occluded=!!o.occluded;
   if(o.foot)r.foot={...r.cart,onFoot:true,viewYaw:0,rearBlend:o.rear?1:0};
   if(o.windup!==undefined){r.joe.ram.phase='lineup';r.joe.ram.age=o.windup;}
   if(o.surge){r.tension.surge=.9;r.lastImpact=.6;}
   audio.update(r,o.active!==false);
   const buffer=await ctx.startRendering(),energy=[0,0],edge=[0,0];let peak=0;
   for(let ch=0;ch<2;ch++){const samples=buffer.getChannelData(ch);for(let i=rate*.8;i<rate*1.1;i++){energy[ch]+=samples[i]**2;edge[ch]+=(samples[i]-samples[i-1])**2;peak=Math.max(peak,Math.abs(samples[i]));}energy[ch]=Math.sqrt(energy[ch]/(rate*.3));edge[ch]=Math.sqrt(edge[ch]/(rate*.3));}
   const spatial={...audio.stats().spatial};
   // Repeated active/inactive/retry updates must reuse all of the audio graph.
   for(let i=0;i<300;i++){r.time+=1/60;audio.update(r,i%3!==0);}audio.update(createRun(1),false);
   return {...o,energy,edge,peak,allocated,counts,spatial,voices:audio.stats().voices,caption:chaseMessages(r,{soundCaptions:true}).sound};
  }
  for(const foot of [false,true])for(const rear of [false,true])for(const side of [-1,1])rows.push({id:'direction',...await render({foot,rear,side})});
  for(const distance of [10,30,50,69,70,90])rows.push({id:'distance',...await render({distance})});
  for(const distance of [12,50,70,90])for(const legacy of [true,false])rows.push({id:'surge-range',...await render({distance,surge:true,legacy})});
  for(const occluded of [false,true])rows.push({id:'cover',...await render({occluded})});
  for(const speed of [2,8,14])rows.push({id:'speed',...await render({speed})});
  for(const windup of [.1,.8,1.6])rows.push({id:'windup',...await render({windup})});
  rows.push({id:'paused',...await render({active:false})},{id:'muted',...await render({muted:true})});
  return rows;
 });
 const rms=r=>Math.hypot(...r.energy);
 for(const row of result){assert.deepEqual(row.counts,row.allocated);assert.equal(row.voices,14);assert(Number.isFinite(row.peak)&&row.peak<.99);}
 for(const r of result.filter(x=>x.id==='direction')){const right=r.side*(r.rear?-1:1)>0;assert(r.energy[right?1:0]>r.energy[right?0:1]*2);assert(r.caption.includes(right?'to your right':'to your left'));}
 const distances=result.filter(r=>r.id==='distance');for(let i=1;i<distances.length;i++)assert(rms(distances[i])<=rms(distances[i-1]));
 for(const distance of [12,50,70,90]){const before=result.find(r=>r.id==='surge-range'&&r.distance===distance&&r.legacy),after=result.find(r=>r.id==='surge-range'&&r.distance===distance&&!r.legacy);if(distance===12)assert.deepEqual(after.energy,before.energy,'Close warning retains exact audio output');else if(distance>=70){assert(rms(before)>.00001);assert(rms(after)<1e-8,'Out-of-range blade is silent');}else assert(rms(after)<rms(before));}
 const [open,cover]=result.filter(r=>r.id==='cover');assert(rms(cover)>1e-6&&rms(cover)<rms(open));assert(Math.hypot(...cover.edge)/rms(cover)<Math.hypot(...open.edge)/rms(open),'Cover removes upper harmonics, not all location cues');
 const winds=result.filter(r=>r.id==='windup');assert(rms(winds[0])<rms(winds[1]));assert(rms(winds[1])<rms(winds[2]));
 const speeds=result.filter(r=>r.id==='speed');for(let i=1;i<speeds.length;i++){assert(speeds[i].spatial.engineHz>speeds[i-1].spatial.engineHz);assert.notDeepEqual(speeds[i].edge,speeds[i-1].edge);}
 for(const row of result.filter(r=>['paused','muted'].includes(r.id)))assert(row.peak<1e-8);
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/offline-audio.json',JSON.stringify({passed:true,rows:result,errors},null,2));console.log(JSON.stringify({passed:true,cases:result.length,voices:14,checks:['real stereo output agrees with captions','distance attenuation','cover filtering remains audible','close-range output identical','out-of-range blade fixed','windup progression','pause/mute','no update/retry allocations']}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
