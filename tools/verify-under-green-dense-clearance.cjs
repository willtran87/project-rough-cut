const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/dense-clearance';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const {traverse}=await import('./probe-under-green-folded.mjs'),{step,createRun}=await import('../web/under-green-sim.js');
 const cases=[];
 const snapshot=r=>{const {telemetry,...state}=r;return structuredClone(state);};
 for(const [name,options]of [['dry',{}],['wet',{wet:true}]]){
  // The route pilot's inspect callback omits some waits/use/aftermath steps.
  // Replay its complete input tape to capture every fixed simulation step.
  const frames=[],inputTape=[],expected=traverse({...options,dodge:true,inputTape}),r=createRun();r.mode='playing';
  for(const row of inputTape){step(r,{...row.input,lookX:Math.atan2(Math.sin(row.yaw-r.player.yaw),Math.cos(row.yaw-r.player.yaw))});frames.push(snapshot(r));}
  assert.equal(r.mode,'complete');assert.equal(r.mode,expected.mode);assert.equal(r.waterHits,expected.waterHits);assert(Math.abs(r.elapsed-expected.elapsed)<1e-6);assert(Math.hypot(r.player.x-expected.p.x,r.player.y-expected.p.y)<1e-6);
  assert(frames.every((f,i)=>!i||Math.abs(f.time-frames[i-1].time-1/60)<1e-8));
  const active=frames.map(r=>['windup','sweep','recover','water-recovery'].includes(r.joe.phase)||!!r.player.recovery||r.gate>0&&r.gate<1);
  const ranges=[];for(let i=0;i<frames.length;i++)if(active[i]){const start=Math.max(0,i-60),end=Math.min(frames.length,i+31),last=ranges.at(-1);if(last&&last.end>=start)last.end=end;else ranges.push({start,end});}
  ranges.forEach((range,i)=>cases.push({name:`${name}-${i}`,frames:frames.slice(range.start,range.end),checkFrom:frames.findIndex((r,index)=>index>=range.start&&active[index])-range.start}));
 }
 for(const tape of JSON.parse(fs.readFileSync('output/under-green/close-recovery/current-examples.json'))){
  const r=structuredClone(tape.initial),frames=[snapshot(r)];for(const input of tape.inputs||Array.from({length:tape.frames.length},()=>({}))){step(r,input,tape.dt);frames.push(snapshot(r));}
  assert.equal(r.mode,tape.final.mode);assert.equal(r.waterHits,tape.final.waterHits);
  cases.push({name:`recovery-${tape.name}`,frames,checkFrom:0});
 }
 fs.writeFileSync(`${out}/fixtures.json`,JSON.stringify(cases));
 const browser=await chromium.launch({headless:true,args:['--use-angle=d3d11','--ignore-gpu-blocklist']}),results=[],errors=[];
 try{
  const p=await browser.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');
  for(const c of cases){
   await p.evaluate(state=>{__underGreen.run=structuredClone(state);__underGreen.clearInput();advanceTime(0);},c.frames[0]);const rows=[];
   for(let start=0;start<c.frames.length;start+=60){
    const chunk=await p.evaluate(({frames,start,checkFrom})=>{
     const rows=[];for(let i=0;i<frames.length;i++){
      const r=frames[i];Object.assign(__underGreen.run,r);advanceTime(0);if(start+i<checkFrom)continue;
      const s=JSON.parse(render_game_to_text()),geometry=__underGreen.inspectJoeGeometry(),footing=__underGreen.inspectJoeFooting();
      const poses=[];for(const fov of [45,85])for(const aspect of [1.6,390/844])for(const rear of [0,Math.PI])poses.push({x:r.player.x,y:r.player.y,height:r.player.eyeHeight||1.65,yaw:r.player.yaw+rear,pitch:r.player.pitch,fov,aspect});
      rows.push({time:r.time,phase:r.joe.phase,recovery:!!r.player.recovery,gate:r.gate,geometry,camera:__underGreen.inspectCameraClearance(poses),footing,footError:s.graphics.actor.footError,handError:s.graphics.actor.handError});
     }return rows;
    },{frames:c.frames.slice(start,start+60),start,checkFrom:c.checkFrom});rows.push(...chunk);
    fs.writeFileSync(`${out}/progress.json`,JSON.stringify({name:c.name,frames:start+chunk.length,total:c.frames.length,checked:rows.length}));
   }
   const failures=rows.filter(r=>r.geometry.hits.length||r.camera.some(c=>c.hits.length)||r.footing.belowFloor||r.footError>=.015||r.handError>=.015);
   results.push({name:c.name,frames:c.frames.length,rows,failures});fs.writeFileSync(`${out}/partial.json`,JSON.stringify({results,errors}));console.log(JSON.stringify({name:c.name,checked:rows.length,failures:failures.map(f=>({time:f.time,phase:f.phase,geometry:f.geometry.hits.slice(0,2),camera:f.camera.filter(c=>c.hits.length).slice(0,1),footing:f.footing,footError:f.footError}))}));
  }
  fs.writeFileSync(`${out}/report.json`,JSON.stringify({passed:results.every(r=>!r.failures.length)&&!errors.length,results,errors}));assert(results.every(r=>!r.failures.length));assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,cases:results.length,checked:results.reduce((s,r)=>s+r.rows.length,0)}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
