const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const out='output/back-nine-experience/foot-audio',software=process.argv.includes('--software');fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{
   localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__uploads=0;window.__audioNodes=0;
   const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__uploads++;return f.apply(this,a);};
   for(const name of ['createOscillator','createGain','createBufferSource','createBiquadFilter','createStereoPanner']){const f=BaseAudioContext.prototype[name];BaseAudioContext.prototype[name]=function(...a){__audioNodes++;return f.apply(this,a);};}
  });
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__footWorld={scene,camera,runner,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const before=await p.evaluate(()=>({uploads:__uploads,audioNodes:__audioNodes,state:JSON.parse(render_game_to_text())}));
  const cases=await p.evaluate(async()=>{
   const {createRun}=await import('./back-nine-sim.js'),{leaveBrokenCart}=await import('./chase-player.js'),T=await import('./vendor/three/three.module.js');const result=[];
   for(const fps of [60,30,15])for(const kind of ['run','turn','stop']){
    const r=createRun();r.mode='driving';r.time=10;r.grace=999;Object.assign(r.cart,{x:8,y:30});Object.assign(r.joe,{x:0,y:-30});leaveBrokenCart(r);r.cart.failedAt=0;r.foot.ejection.at=0;
    Object.assign(r.foot,{x:0,y:40,yaw:0,viewYaw:0,moveYaw:0,speed:0});__backNine.run=r;const rows=[];
    for(let n=0;n<fps*3;n++){
     const t=n/fps;r.time=10+t;
     if(kind==='turn'){r.foot.yaw=r.foot.moveYaw=r.foot.viewYaw=t*1.2;r.foot.steer=1;}
     else{const moving=kind==='run'||t<.8;r.foot.speed=moving?6.6:0;r.foot.y=40+Math.min(t,kind==='run'?99:.8)*6.6;}
     await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();const s=JSON.parse(render_game_to_text());
     const played=s.audio.footsteps.played;__backNine.render();await __backNine.whenPresented();const duplicate=JSON.parse(render_game_to_text());
     let floor=null;if(rows.length&&played>rows.at(-1).played){
      const shoes=[];__footWorld.runner.root.traverse(o=>{if(o.name==='boot')shoes.push(o);});const shoe=shoes[s.audio.footsteps.last.foot],v=new T.Vector3();floor=Infinity;
      shoe.traverse(o=>{if(o.isMesh)for(let i=0;i<o.geometry.attributes.position.count;i++){v.fromBufferAttribute(o.geometry.attributes.position,i).applyMatrix4(o.matrixWorld);floor=Math.min(floor,v.y);}});
     }
     rows.push({time:r.time,serial:s.graphics.ejection.footsteps.serial,played,last:s.audio.footsteps.last,floor,duplicate:duplicate.audio.footsteps.played});
    }result.push({fps,kind,rows});
   }return result;
  });
  const totals=[];for(const c of cases){let contacts=0;for(let n=1;n<c.rows.length;n++){
   const row=c.rows[n],last=c.rows[n-1],delta=row.serial-last.serial;contacts+=delta;
   assert.equal(row.played-last.played,delta,`${c.kind}/${c.fps}: contact/audio mismatch`);assert.equal(row.duplicate,row.played,'Duplicate render cannot repeat a step');
   if(delta){assert.equal(row.last.time,row.time);assert(row.floor>=0&&row.floor<.03,'Cue belongs to an actual low sole');assert(row.last.height<=.008);}
  }assert(contacts>0,`${c.kind}/${c.fps}: no contacts`);if(c.kind==='stop')assert.equal(c.rows.at(-1).played,c.rows.find(r=>r.time>=11.8).played,'Idle stays silent');totals.push({fps:c.fps,kind:c.kind,contacts});}
  const read=()=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const count=(await read()).audio.footsteps.played;await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(800));assert.equal((await read()).audio.footsteps.played,count);await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));assert.equal((await read()).audio.footsteps.played,count);
  await p.click('#sound');await p.keyboard.down('w');for(let n=0;n<24;n++)await p.evaluate(()=>advanceTime(50));await p.keyboard.up('w');assert.equal((await read()).audio.footsteps.played,count);await p.click('#sound');await p.evaluate(()=>advanceTime(0));assert.equal((await read()).audio.footsteps.played,count,'Unmute cannot replay discarded steps');
  await p.keyboard.down('w');for(let n=0;n<24;n++)await p.evaluate(()=>advanceTime(50));await p.keyboard.up('w');const moving=await read();assert(moving.audio.footsteps.played>count,'Actual simulation input produces steps');
  for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));await p.screenshot({path:`${out}/${software?'software':'hardware'}-running-${width}.png`});}
  const after=await p.evaluate(()=>({uploads:__uploads,audioNodes:__audioNodes,state:JSON.parse(render_game_to_text())}));assert.equal(after.uploads,before.uploads);assert.equal(after.audioNodes,before.audioNodes);assert.equal(after.state.audio.voices,12);assert.equal(after.state.graphics.programs,before.state.graphics.programs);assert.equal(after.state.graphics.textures,before.state.graphics.textures);assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/${software?'software':'hardware'}-contacts.json`,JSON.stringify({passed:true,totals,cases,before,after,errors},null,2));console.log(JSON.stringify({passed:true,software,totals,voices:after.state.audio.voices,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
