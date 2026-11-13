const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/course-footwork/before';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-angle=d3d11']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__feet={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8')+'\nwindow.__feetScene=()=>({THREE,joeModel,renderer});'}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.waitForFunction(()=>window.__feet);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__feet,s=t.state;t.resetFirstHole();Object.assign(s,{mode:'first_hole',manualTime:true,transitionAlpha:0,guidedHints:false,apparitions:false});Object.assign(s.hole,{tutorialVisible:false,elapsed:100});s.hole.practiceDrill.active=false;s.hole.engagement.experience.arrival.phase='skipped';t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:180000});
  const results=await p.evaluate(()=>{
   const {THREE,joeModel}=__feetScene(),bones=['L','R'].map(side=>joeModel.root.getObjectByName('Foot'+side));
   const chains=['L','R'].map(side=>['Thigh','Shin','Foot'].map(n=>joeModel.root.getObjectByName(n+side)));
   const lengths=()=>chains.flatMap(chain=>chain.slice(1).map((b,i)=>b.getWorldPosition(new THREE.Vector3()).distanceTo(chain[i].getWorldPosition(new THREE.Vector3()))));
   const originalLengths=lengths();
   const cases=[];
   for(const name of ['straight','turn','curve','stop','turn-left','curve-left','turn-stop','turn-30','turn-120','turn-reduced','short-stop','restart','quick-restart','turn-restart']){
    const rows=[];let distance=0,heading=Math.PI/2,position=new THREE.Vector3(0,0,-8);
    const fps=name==='turn-30'?30:name==='turn-120'?120:60;
    let lastFrame,maxLengthError=0,firstStepFrozenError=0;const costs=[];
    for(let i=-fps/2;i<fps*3;i++){
     const active=i>=0&&(name==='short-stop'?i<6:name==='quick-restart'?i<6||i>=12:name.includes('restart')?i<18||(i>=48&&i<78)||(i>=108&&i<150):true);
     const dt=1/fps,time=10+i/fps,moves=active&&!name.startsWith('turn')&&(name!=='stop'||i<fps*1.5),turns=active&&(name.startsWith('turn')||name.startsWith('curve'))&&(name!=='turn-stop'||i<fps*1.5);
     if(turns)heading+=(name.endsWith('left')?-1:1)*1.2*dt;
     if(moves){distance+=.8*dt;position.x+=Math.cos(heading)*.8*dt;position.z-=Math.sin(heading)*.8*dt;}
     const frame={time,paused:false,reducedMotion:name==='turn-reduced',joe:{walkMeters:distance/.16,effectHeading:heading,effectSpeed:moves?5:0,mode:'patrol'}};
     const start=performance.now();joeModel.update(frame,position,.16,dt);if(i>=0)costs.push(performance.now()-start);lastFrame=frame;
     if(i===3){
      const before=bones.flatMap(b=>b.getWorldPosition(new THREE.Vector3()).toArray());
      for(let j=0;j<12;j++)joeModel.update({...frame,paused:true},position,.16,dt);
      for(let j=0;j<12;j++)joeModel.update(frame,position,.16,dt);
      const after=bones.flatMap(b=>b.getWorldPosition(new THREE.Vector3()).toArray());
      firstStepFrozenError=Math.max(...after.map((v,j)=>Math.abs(v-before[j])));
     }
     maxLengthError=Math.max(maxLengthError,...lengths().map((v,i)=>Math.abs(v-originalLengths[i])));
     if(i>=0)rows.push({i,time,position:position.toArray(),heading,phase:joeModel.stats().phase,feet:bones.map(b=>b.getWorldPosition(new THREE.Vector3()).toArray()),hands:joeModel.stats().handError,wheels:joeModel.stats().wheelAngles,footwork:joeModel.stats().footwork});
    }
    const plantedTravel=[0,0],lift=[0,0];
    for(let i=1;i<rows.length;i++)for(let side=0;side<2;side++){
     const a=rows[i-1].feet[side],z=rows[i].feet[side];lift[side]=Math.max(lift[side],z[1]-.12);
     const phase=(rows[i].phase+(side?.5:0))%1,prior=(rows[i-1].phase+(side?.5:0))%1;
     if(phase>.12&&phase<.5&&prior>.12&&prior<.5)plantedTravel[side]+=Math.hypot(z[0]-a[0],z[2]-a[2]);
    }
    const heldTravel=[0,0],maxStep=[0,0];let maxError=0;
    for(let i=1;i<rows.length;i++)for(let s=0;s<2;s++){
     const a=rows[i-1],b=rows[i],d=Math.hypot(...b.feet[s].map((v,j)=>v-a.feet[s][j]));maxStep[s]=Math.max(maxStep[s],d);
     if(i>fps/2&&a.footwork.feet[s].weight===1&&b.footwork.feet[s].weight===1)heldTravel[s]+=Math.hypot(b.feet[s][0]-a.feet[s][0],b.feet[s][2]-a.feet[s][2]);
     maxError=Math.max(maxError,b.footwork.feet[s].error);
    }
    const snapshot=()=>({feet:bones.map(b=>b.getWorldPosition(new THREE.Vector3()).toArray()),phase:joeModel.stats().phase,wheels:joeModel.stats().wheelAngles});
    const before=snapshot();for(let i=0;i<20;i++)joeModel.update({...lastFrame,paused:true},position,.16,1/60);const paused=snapshot();
    for(let i=0;i<20;i++)joeModel.update(lastFrame,position,.16,1/60);const repeated=snapshot();
    costs.sort((a,b)=>a-b);
    cases.push({name,fps,plantedTravel,lift,heldTravel,maxStep,maxError,maxLengthError,firstStepFrozenError,updateMedianMs:costs[Math.floor(costs.length*.5)],updateP95Ms:costs[Math.floor(costs.length*.95)],before,paused,repeated,rows});
   }
   const relocated=new THREE.Vector3(30,0,-50);
   joeModel.update({time:0,paused:false,joe:{walkMeters:0,effectHeading:0,effectSpeed:0,mode:'patrol'}},relocated,.16,0);
   const resetFeet=bones.map(b=>b.getWorldPosition(new THREE.Vector3()).distanceTo(relocated));
   cases.at(-1).resetFeet=resetFeet;
   return cases;
  });
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:false,results,errors},null,2));
  const near=(a,b)=>Math.abs(a-b)<1e-6;
  for(const c of results){
   assert(c.heldTravel.every(v=>v<.002),c.name+' supporting foot slides');
   assert(c.maxStep.every(v=>v<4.5/c.fps),c.name+' foot pops');
   assert(c.maxError<.003,c.name+' unreachable leg target');
   assert(c.maxLengthError<1e-5,c.name+' bone lengths changed');
   assert(c.firstStepFrozenError<1e-6,c.name+' first step changes on pause or duplicate presentation');
   assert(c.lift.every(v=>v<.08)&&(c.name==='short-stop'?c.lift.some(v=>v>.02):c.lift.every(v=>v>.04)),c.name+' missing or excessive step lift');
   assert(c.rows.every(r=>r.hands<.005),c.name+' grip detaches');
   for(const frozen of [c.paused,c.repeated]){assert(near(frozen.phase,c.before.phase));assert(frozen.feet.flat().every((v,i)=>near(v,c.before.feet.flat()[i])));assert.deepEqual(frozen.wheels,c.before.wheels);}
   if(c.name.startsWith('turn'))assert(c.rows.every(r=>r.wheels.every(v=>v===0)),c.name+' stationary wheels rotate');
  }
  assert(results.at(-1).resetFeet.every(d=>d<1),'reset retains obsolete foot anchor');
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,results,errors},null,2));console.log(JSON.stringify({passed:true,results:results.map(({rows,before,paused,repeated,...s})=>s),errors}));if(errors.length)throw Error(errors.join('\n'));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
