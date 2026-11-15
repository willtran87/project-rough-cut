const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.env.CHASE_QA_OUT||'output/chase-audio-mix';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/__mix-test',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));
  await page.goto('http://127.0.0.1:4187/__mix-test');
  const result=await page.evaluate(async()=>{
   const {createChaseAudio}=await import('./back-nine-audio.js'),{createRun}=await import('./back-nine-sim.js');
   const keys=['effectsVolume','mowerVolume','ambienceVolume','dangerVolume'],rows=[];
   async function render(mode,key,value,{active=true,muted=false,rear=false,liveChange=false}={}){
    const ctx=new OfflineAudioContext(2,48000,24000),Native=window.AudioContext;
    const settings={volume:.12,musicVolume:0,muted,...Object.fromEntries(keys.map(k=>[k,0]))};
    if(key)settings[key]=liveChange?0:value;
    window.AudioContext=function(){return ctx;};let audio;try{audio=createChaseAudio(.72,settings);audio.start();}finally{window.AudioContext=Native;}
    const run=createRun();run.mode='driving';run.time=10.7;run.grace=0;run.cart.x=0;run.cart.y=330;run.cart.speed=6;run.lookBack=rear;
    Object.assign(run.joe,{x:12,y:330,speed:6});run.tension.intensity=.8;
    if(mode==='foot')run.foot={x:0,y:330,yaw:0,viewYaw:0,rearBlend:rear?1:0,speed:3,onFoot:true};
    if(mode==='death')run.death={age:.1,x:0,y:330,yaw:0};
    const update=()=>mode==='opening'?audio.intro(4,active):audio.update(run,active);
    update();let changed,landing,footfall;
    if(liveChange)changed=ctx.suspend(.25).then(()=>{settings[key]=value;update();return ctx.resume();});
    if(mode==='death')landing=ctx.suspend(.75).then(()=>{run.death.age=.75;update();return ctx.resume();});
    // The runner's effects bus is contact-driven; elapsed time or speed alone
    // no longer produces footsteps. Present one landing in the measured window.
    if(mode==='foot')footfall=ctx.suspend(1).then(()=>{audio.presentRunner(run,[{owner:run.foot,serial:1,time:run.time,foot:0,phase:'run',height:0,x:run.foot.x,y:run.foot.y}],active);return ctx.resume();});
    const buffer=await ctx.startRendering();if(changed)await changed;if(landing)await landing;if(footfall)await footfall;
    const energy=[0,0];let peak=0;
    for(let ch=0;ch<2;ch++){const samples=buffer.getChannelData(ch);for(let i=24000;i<26400;i++){energy[ch]+=samples[i]**2;peak=Math.max(peak,Math.abs(samples[i]));}energy[ch]=Math.sqrt(energy[ch]/2400);}
    return {mode,key,value,energy,peak,mix:audio.stats().mix};
   }
   for(const mode of ['opening','driving','foot','death']){
    rows.push({...await render(mode,null,0),kind:'silent'});
    for(const key of keys){
     rows.push({...await render(mode,key,1),kind:'full'});
     rows.push({...await render(mode,key,.5,{liveChange:true}),kind:'half-live'});
    }
    rows.push({...await render(mode,'mowerVolume',1,{active:false}),kind:'paused'});
    rows.push({...await render(mode,'mowerVolume',1,{muted:true}),kind:'muted'});
   }
   const direction=[];
   for(const mode of ['driving','foot'])for(const rear of [false,true])direction.push({...await render(mode,'mowerVolume',1,{rear}),rear});
   return {rows,direction};
  });
  for(const row of result.rows){
   if(['silent','paused','muted'].includes(row.kind))assert(row.peak<1e-8,JSON.stringify(row));
   if(row.kind==='full'){
    // Opening has no authored danger pulse; all other isolated channels sound.
    if(!(row.mode==='opening'&&row.key==='dangerVolume'))assert(row.peak>1e-6,JSON.stringify(row));
    const half=result.rows.find(r=>r.mode===row.mode&&r.key===row.key&&r.kind==='half-live');
    for(let i=0;i<2;i++)assert(Math.abs(half.energy[i]-.5*row.energy[i])<Math.max(1e-7,row.energy[i]*.015),JSON.stringify({row,half}));
   }
   assert(row.peak<.99);
  }
  for(const row of result.direction)assert(row.rear?row.energy[0]>row.energy[1]*2:row.energy[1]>row.energy[0]*2,JSON.stringify(row));
  assert.deepEqual(errors,[]);fs.writeFileSync(out+'/audio.json',JSON.stringify({passed:true,...result,errors},null,2));
  console.log(JSON.stringify({passed:true,cases:result.rows.length,directions:result.direction.length,checks:['Isolated category output and silence in opening, cart, runner and defeat','Live half gain scales once, including opening','Pause and mute silence output','Cart and runner rear glance reverse Joe stereo direction']}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
