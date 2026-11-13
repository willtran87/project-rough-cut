const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const software=process.argv.includes('--software'),out='output/floodlight-sync-20261107/'+(software?'software':'hardware');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-gl=angle','--use-angle=swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']}),p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],rows=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replace('updateFloodlight(l,frame.lightPower(l.o))','updateFloodlight(l,window.__lampPower?__lampPower(l.o):frame.lightPower(l.o))')+'\nwindow.__lamps=()=>({lights,world,camera,renderer});'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__lampGame={state,resetFirstHole,render,floodlightPowerAt};\n  window.advanceTime = (milliseconds) => {')}));
 const render=()=>p.evaluate(async()=>{__lampGame.render();await RCScene3D.whenPresented();});
 try{
  await p.goto('http://127.0.0.1:4187/index.html');await p.waitForFunction(()=>window.__lampGame);await p.locator('#game').click();
  await p.evaluate(()=>{const t=__lampGame,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.guidedHints=false;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.hole.elapsed=100;s.hole.engagement.experience.arrival.phase='skipped';Object.assign(s.hole.joe,{x:100,y:690});t.render();});await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  await p.evaluate(()=>{const l=__lamps().lights[0];Object.assign(__lampGame.state.player,{x:l.o.x-4,y:l.o.y-30,yaw:0,pitch:.10});});await render();
  const programs=await p.evaluate(()=>__lamps().renderer.info.programs.length);
  const materials=await p.evaluate(()=>__lamps().lights.map(l=>l.fixture.material.uuid));assert(materials.length>=2);assert.equal(new Set(materials).size,materials.length,'Every floodlight must own its lens material');
  for(const [name,timer]of [['on',0],['dim',.975],['off',2],['restored',0]]){
   await p.evaluate(timer=>{__lampGame.state.hole.reviewLightsOutTimer=timer;},timer);await render();
   const row=await p.evaluate(()=>{
    const t=__lamps(),l=t.lights[0],m=l.fixture.material,v=l.fixture.getWorldPosition(l.pool.position.clone()).project(t.camera),gl=t.renderer.getContext(),pixels=new Uint8Array(5*5*4),c=document.getElementById('game');gl.readPixels(Math.round((v.x*.5+.5)*c.width)-2,Math.round((v.y*.5+.5)*c.height)-2,5,5,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    let luminance=0;for(let i=0;i<pixels.length;i+=4)luminance+=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;
    const shafts=t.world.getObjectByName('PixelEffect-shafts');let shaft=null;for(let i=0;i<shafts.count;i++){const a=shafts.instanceMatrix.array;if(Math.abs(a[i*16+12]-l.pool.position.x)<.001&&Math.abs(a[i*16+14]-l.pool.position.z)<.001)shaft=Array.from(shafts.instanceColor.array.slice(i*3,i*3+3));}
    return {power:l.power,expected:__lampGame.floodlightPowerAt(l.o),lens:m.emissive.toArray(),emission:m.emissiveIntensity,tint:l.tint.toArray(),pool:l.pool.material.color.toArray(),opacity:l.pool.material.opacity,luminance:luminance/25,shaft};
   });rows.push({name,...row});assert.equal(row.power,row.expected);assert.deepEqual(row.lens,row.tint);assert.deepEqual(row.pool,row.tint);assert(Math.abs(row.emission-1.6*row.power)<1e-8);assert(Math.abs(row.opacity-.14*row.power)<1e-8);
   if(row.power>.2){assert(row.shaft);row.shaft.forEach((v,i)=>assert(Math.abs(v-row.tint[i]*row.power)<1e-6));}else assert.equal(row.shaft,null);
   await p.screenshot({path:out+'/'+name+'.png'});
  }
  assert(rows[0].luminance>rows[1].luminance+10);assert(rows[1].luminance>rows[2].luminance+10);assert(Math.abs(rows[0].luminance-rows[3].luminance)<1);
  await p.evaluate(()=>{const ids=__lamps().lights.map(l=>l.o.id);window.__lampPower=o=>o.id===ids[0]?1:.12;});await render();const first=await p.evaluate(()=>__lamps().lights.slice(0,2).map(l=>({power:l.power,intensity:l.fixture.material.emissiveIntensity,color:l.fixture.material.emissive.toArray()})));assert.equal(first[0].intensity,1.6);assert.equal(first[1].intensity,.192);assert.notDeepEqual(first[0].color,first[1].color);
  await p.evaluate(()=>{const ids=__lamps().lights.map(l=>l.o.id);window.__lampPower=o=>o.id===ids[0]?.12:1;});await render();const second=await p.evaluate(()=>__lamps().lights.slice(0,2).map(l=>l.fixture.material.emissiveIntensity));assert.equal(second[0],.192);assert.equal(second[1],1.6);
  await p.evaluate(()=>{window.__lampPower=null;__lampGame.state.hole.horrorDirector.lightFailureSeconds=1;});await render();const failure=await p.evaluate(()=>__lamps().lights.map(l=>({power:l.power,expected:__lampGame.floodlightPowerAt(l.o),lens:l.fixture.material.emissiveIntensity,pool:l.pool.material.opacity})));for(const l of failure){assert.equal(l.power,l.expected);assert(l.power<.4);assert.equal(l.lens,1.6*l.power);assert.equal(l.pool,.14*l.power);}
  await p.evaluate(()=>{__lampGame.state.mode='paused';});await render();const paused=await p.evaluate(()=>__lamps().lights.map(l=>[l.power,l.fixture.material.emissiveIntensity,l.pool.material.opacity]));await render();assert.deepEqual(await p.evaluate(()=>__lamps().lights.map(l=>[l.power,l.fixture.material.emissiveIntensity,l.pool.material.opacity])),paused);
  assert.equal(await p.evaluate(()=>__lamps().renderer.info.programs.length),programs,'Power changes must not compile new shaders');assert.deepEqual(errors,[]);
  fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,rows,first,second,failure,errors,checks:['Independent lenses','Shared lens/pool/haze power and tint, including same-timestamp updates','Rendered lens bright/dim/off/restored','Independent lights swap without last-light contamination','Real light-failure state','Pause stable','No first-use shader compilation']},null,2));console.log(JSON.stringify({passed:true,rows,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
