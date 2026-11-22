const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='output/under-green/dense-clearance-final';fs.mkdirSync(out,{recursive:true});
(async()=>{
 // The same cases verify-under-green-dense-clearance.cjs writes to fixtures.json: every fixed step of the dry
 // and wet route pilots around active attacks/recovery/gate motion, plus the close-recovery tapes.
 // Built here from the current simulation so no earlier run is needed.
 const cases=await (async()=>{
  const {traverse}=await import('./probe-under-green-folded.mjs'),{step,createRun}=await import('../web/under-green-sim.js'),cases=[];
  const snapshot=r=>{const {telemetry,...state}=r;return structuredClone(state);};
  for(const [name,options]of [['dry',{}],['wet',{wet:true}]]){
   const frames=[],inputTape=[];traverse({...options,dodge:true,inputTape});const r=createRun();r.mode='playing';
   for(const row of inputTape){step(r,{...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))});frames.push(snapshot(r));}
   const active=frames.map(r=>['windup','sweep','recover','water-recovery'].includes(r.joe.phase)||!!r.player.recovery||r.gate>0&&r.gate<1);
   const ranges=[];for(let i=0;i<frames.length;i++)if(active[i]){const start=Math.max(0,i-60),end=Math.min(frames.length,i+31),last=ranges.at(-1);if(last&&last.end>=start)last.end=end;else ranges.push({start,end});}
   ranges.forEach((range,i)=>cases.push({name:`${name}-${i}`,frames:frames.slice(range.start,range.end),checkFrom:frames.findIndex((r,index)=>index>=range.start&&active[index])-range.start}));
  }
  for(const tape of JSON.parse(fs.readFileSync('tools/fixtures/under-green/close-recovery-examples.json'))){
   const r=structuredClone(tape.initial),frames=[snapshot(r)];for(const input of tape.inputs||Array.from({length:tape.frames.length},()=>({}))){step(r,input,tape.dt);frames.push(snapshot(r));}
   cases.push({name:`recovery-${tape.name}`,frames,checkFrom:0});
  }
  return cases;
 })();
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],views=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:2560,height:1600}});{const fx=require('./lib/campaign-fixture.cjs');await fx.unlockChapters(p);await fx.skipStories(p);}p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  for(const c of cases){
   const indices=[...new Set([c.checkFrom,Math.floor((c.frames.length+c.checkFrom)/2),c.frames.length-1])];
   for(const index of indices){
    const samples=await p.evaluate(frames=>{
     __underGreen.run=structuredClone(frames[0]);for(const r of frames){Object.assign(__underGreen.run,r);advanceTime(0);}
     const r=__underGreen.run,bearing=Math.atan2(r.joe.x-r.player.x,r.joe.y-r.player.y),poses=[];
     for(const yaw of [bearing,bearing-Math.PI/2,bearing+Math.PI/2])for(const pitch of [-.85,0,.85])for(const fov of [45,85])for(const aspect of [1.6,390/844])poses.push({x:r.player.x,y:r.player.y,height:r.player.eyeHeight||1.65,yaw,pitch,fov,aspect});
     return __underGreen.inspectCameraClearance(poses);
    },c.frames.slice(Math.max(0,index-60),index+1));
    results.push({name:c.name,index,time:c.frames[index].time,samples});assert(samples.every(s=>!s.hits.length),JSON.stringify(results.at(-1)));
   }
  }
  /* the current dry route has two attack windows (the saved fixture had three): view the first and the last */for(const name of ['dry-0',cases.filter(c=>c.name.startsWith('dry-')).at(-1).name,'recovery-spillway-gap-0.7']){
   const c=cases.find(c=>c.name===name),index=Math.floor((c.frames.length+c.checkFrom)/2);
   for(const [width,height]of [[2560,1600],[390,844]]){
    await p.setViewportSize({width,height});await p.evaluate(frames=>{__underGreen.run=structuredClone(frames[0]);for(const r of frames){Object.assign(__underGreen.run,r);advanceTime(0);}},c.frames.slice(Math.max(0,index-60),index+1));
    const file=`${out}/${name}-${width}.png`;await p.screenshot({path:file});views.push({name,width,height,file});
   }
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/camera.json`,JSON.stringify({passed:true,results,views,errors,limits:['Extreme camera poses inspect actual actor/fixture poses; screenshots retain the recorded player view.','Three representative instants per danger sequence supplement the full-step forward/rear audit.']},null,2));console.log(JSON.stringify({passed:true,poses:results.length,volumes:results.reduce((n,r)=>n+r.samples.length,0),views:views.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
