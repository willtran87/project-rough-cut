const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/course-ambience',b=await chromium.launch({headless:true});
 try{
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/__course-ambience',r=>r.fulfill({contentType:'text/html',body:'<html></html>'}));
  await p.route('**/back-nine-audio.js?before-course-ambience',r=>r.fulfill({path:out+'/baseline-source/back-nine-audio.js'}));
  await p.goto('http://127.0.0.1:4187/__course-ambience');
  const result=await p.evaluate(async()=>{
   const{createRun}=await import('./back-nine-sim.js'),{createCourseAmbienceAudio}=await import('./chase-course-ambience.js'),current=await import('./back-nine-audio.js'),old=await import('./back-nine-audio.js?before-course-ambience');
   const rate=24000,rows=[];
   function run(o){const r=createRun(o.garage?2:0,0,37161);r.mode=o.mode||'driving';r.time=20;r.grace=0;Object.assign(r.cart,{x:o.x??28,y:o.y??190,yaw:0,speed:0});Object.assign(r.joe,{x:r.cart.x,y:r.cart.y-85,speed:5});r.lookBack=!!o.rear;if(o.foot)r.foot={...r.cart,onFoot:true,viewYaw:0,rearBlend:o.rear?1:0};if(o.attack){r.encounter.owner='attack';r.joe.ram.phase='lineup';r.joe.ram.age=1;}if(o.death)r.death={age:.1,x:r.cart.x,y:r.cart.y,yaw:0};return r;}
   function energy(buffer,from=1.2,to=1.8){const rms=[0,0];let peak=0,edge=0;for(let c=0;c<2;c++){const a=buffer.getChannelData(c);for(let i=Math.floor(from*rate);i<to*rate;i++){rms[c]+=a[i]*a[i];peak=Math.max(peak,Math.abs(a[i]));edge+=(a[i]-a[i-1])**2;}rms[c]=Math.sqrt(rms[c]/((to-from)*rate));}return{rms,peak,edge};}
   async function isolated(o){
    const ctx=new OfflineAudioContext(2,rate*2,rate),osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),level=ctx.createGain();osc.frequency.value=43.65;filter.type='lowpass';filter.frequency.value=320;level.gain.value=0;osc.connect(filter);filter.connect(level);osc.start();const audio=createCourseAmbienceAudio(ctx,{osc,filter,level},ctx.destination),r=run(o);audio.update(r,!o.muted,0,43.65);
    const buffer=await ctx.startRendering();return{...o,...energy(buffer),state:audio.stats()};
   }
   for(const foot of [false,true])for(const rear of [false,true])rows.push({kind:'direction',...await isolated({foot,rear})});
   for(const distance of [3,6,12,18,22,30])rows.push({kind:'distance',...await isolated({x:34-distance})});
   for(const outside of [false,true])rows.push({kind:'cover',...await isolated({garage:true,x:-28.43+(outside?-6:6),y:804,outside})});
   for(const o of [{mode:'paused'},{muted:true},{attack:true},{death:true}])rows.push({kind:'suppressed',...await isolated(o)});
   async function full(o){
    const ctx=new OfflineAudioContext(2,rate*2,rate),Native=window.AudioContext,counts={};
    for(const name of ['createOscillator','createBufferSource','createBuffer','createGain','createBiquadFilter','createStereoPanner']){const f=ctx[name].bind(ctx);ctx[name]=(...args)=>{counts[name]=(counts[name]||0)+1;return f(...args);};}
    const settings={volume:.2,musicVolume:o.mowerOnly?0:.6,effectsVolume:o.mowerOnly?0:1,dangerVolume:o.mowerOnly?0:.9,ambienceVolume:o.mowerOnly?0:.9,mowerVolume:1};
    window.AudioContext=function(){return ctx;};let audio;try{audio=(o.old?old:current).createChaseAudio(.72,settings);audio.start();}finally{window.AudioContext=Native;}
    const allocated={...counts},r=run({...o,x:o.far?0:28,y:o.far?330:190});
    const update=()=>o.intro?audio.intro(4,true):audio.update(r,true);update();const buffer=await ctx.startRendering(),stats=audio.stats();
    for(let i=0;i<180;i++){r.time+=1/60;audio.update(r,i%3!==0);}audio.update(createRun(),false);audio.intro(0,false);
    return{pcm:[buffer.getChannelData(0),buffer.getChannelData(1)],summary:{...o,...energy(buffer),allocated,counts,voices:stats.voices,course:stats.courseAmbience}};
   }
   const comparisons=[];
   for(const mode of [{far:true},{intro:true},{death:true},{mowerOnly:true,attack:true}]){
    const a=await full({...mode,old:true}),z=await full(mode);let maxDifference=0;
    for(let c=0;c<2;c++)for(let i=0;i<a.pcm[c].length;i++)maxDifference=Math.max(maxDifference,Math.abs(a.pcm[c][i]-z.pcm[c][i]));
    comparisons.push({mode,maxDifference,before:a.summary,after:z.summary});
   }
   const live=await full({});return{rows,comparisons,live:live.summary};
  });
  for(const r of result.rows){assert(Number.isFinite(r.peak)&&r.peak<.2);if(r.kind==='direction')assert(r.rms[r.rear?0:1]>r.rms[r.rear?1:0]*2);if(r.kind==='suppressed')assert.equal(r.peak,0);}
  const distance=result.rows.filter(r=>r.kind==='distance');for(let i=1;i<distance.length;i++)assert(Math.hypot(...distance[i].rms)<=Math.hypot(...distance[i-1].rms));assert.equal(distance.at(-1).peak,0);
  const[open,cover]=result.rows.filter(r=>r.kind==='cover');assert(cover.peak>0&&cover.peak<open.peak);assert(cover.edge<open.edge);
  for(const c of result.comparisons){assert(c.maxDifference<1e-7,JSON.stringify({mode:c.mode,difference:c.maxDifference}));assert.equal(c.after.voices,c.before.voices);assert.deepEqual(c.after.counts,c.after.allocated);assert.equal(c.after.allocated.createStereoPanner,c.before.allocated.createStereoPanner+1);}
  assert.deepEqual(result.live.counts,result.live.allocated);assert.equal(result.live.voices,result.live.counts.createOscillator+result.live.counts.createBufferSource);assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/audio.json',JSON.stringify({passed:true,...result,errors},null,2));console.log(JSON.stringify({passed:true,cases:result.rows.length,comparisons:result.comparisons.map(c=>({mode:c.mode,maxDifference:c.maxDifference})),voices:result.live.voices,extraPanners:1,updateAllocations:0,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
