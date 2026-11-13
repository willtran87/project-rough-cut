const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const baseline=process.argv.includes('--baseline'),out='output/under-green/water-audio/'+(baseline?'before':'after');
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:90000});
 const cases=await p.evaluate(async()=>{
  const {createUnderGreenAudio}=await import('./under-green-audio.js'),{createRun}=await import('./under-green-sim.js'),{WATERS,waterState}=await import('./under-green-course.js'),{audibleSource}=await import('./under-green-senses.js');
  const results=[];
  for(const name of ['opposed','rear','focus','mute','category-zero','paused','near','far']){
   const context=new OfflineAudioContext(2,48000,48000),Original=window.AudioContext;window.AudioContext=function(){return context;};
   const pref={volume:.72,mowerVolume:0,effectsVolume:0,dangerVolume:0,ambienceVolume:name==='category-zero'?0:.9},audio=createUnderGreenAudio(()=>pref),r=createRun(2);
   r.mode=name==='paused'?'paused':'playing';r.time=2;r.joe.phase='absent';Object.assign(r.player,{x:4,y:14,yaw:0,rearAngle:name==='rear'?Math.PI:0,focus:name==='focus',speed:0});
   if(name==='near')Object.assign(r.player,{x:0,y:64});if(name==='far')Object.assign(r.player,{x:10,y:64});
   try{audio.start();audio.setMuted(name==='mute');audio.update(r);const buffer=await context.startRendering(),left=buffer.getChannelData(0),right=buffer.getChannelData(1);let ll=0,rr=0,lr=0,peak=0;
    for(let i=12000;i<left.length;i++){ll+=left[i]*left[i];rr+=right[i]*right[i];lr+=left[i]*right[i];peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));}
    results.push({name,leftRms:Math.sqrt(ll/(left.length-12000)),rightRms:Math.sqrt(rr/(right.length-12000)),correlation:ll*rr>0?lr/Math.sqrt(ll*rr):null,peak,stats:audio.stats(),world:WATERS.map(w=>({id:w.id,phase:waterState(w,r.time,r.bypass,r.bypassAt).phase,...audibleSource(r,w,{range:19,sourceHeight:.8})}))});
   }finally{window.AudioContext=Original;}
  }return results;
 });
 const get=name=>cases.find(c=>c.name===name),opposed=get('opposed'),energy=c=>Math.hypot(c.leftRms,c.rightRms);
 if(baseline){assert(opposed.correlation>.9999);assert.equal(opposed.stats.voices,9);}
 else{
  assert(opposed.correlation<.98,'Separate water sources must not collapse to one coherent panned waveform');
  assert.equal(opposed.stats.waterVoices,8);assert.equal(opposed.stats.voices,16);assert.equal(opposed.stats.voiceCapacity,16);
  const audible=opposed.stats.targets.outlets.filter(v=>v.gain>.01);assert(audible.some(v=>v.pan<-.3)&&audible.some(v=>v.pan>.7));
  assert(Math.abs(opposed.leftRms-get('rear').rightRms)<.00001);assert(Math.abs(opposed.rightRms-get('rear').leftRms)<.00001);
  assert(energy(get('focus'))<energy(opposed)*.35);assert(energy(get('far'))<energy(get('near'))*.65);
  for(const name of ['mute','category-zero','paused'])assert(energy(get(name))<1e-8,name);
  for(const c of cases){assert(c.peak<.25);assert.equal(c.stats.voices,16);assert(Math.abs(c.stats.targets.outlets.reduce((n,v)=>n+v.gain,0)-c.stats.targets.water)<1e-8);}
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/offline.json',JSON.stringify({passed:true,baseline,method:'Actual mixer graph rendered in stereo OfflineAudioContext; independent fixed state cases, no human listening claim',cases,errors},null,2));console.log(JSON.stringify({passed:true,baseline,correlation:opposed.correlation,energy:energy(opposed),voices:opposed.stats.voices,errors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
