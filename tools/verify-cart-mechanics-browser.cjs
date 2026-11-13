const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
(async()=>{
 const software=process.argv.includes('--software'),label=software?'software':'hardware',out='output/back-nine-experience/mechanics';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--use-angle=d3d11','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await p.addInitScript(()=>{localStorage.setItem('rough-cut.back-nine-opening.v1','{"skip":true}');window.__buffers=0;const f=WebGL2RenderingContext.prototype.bufferData;WebGL2RenderingContext.prototype.bufferData=function(...a){__buffers++;return f.apply(this,a);};});
  await p.route('**/back-nine-scene.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/back-nine-scene.js','utf8').replace('return {scene,camera,update,draw()','return window.__mechanicalWorld={scene,camera,cart,update,draw()')}));
  await p.goto('http://127.0.0.1:4187/back-nine.html?test');await p.waitForFunction(()=>window.render_game_to_text&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.click('#primary');await p.evaluate(()=>advanceTime(0));
  const before=await p.evaluate(()=>({g:JSON.parse(render_game_to_text()).graphics,buffers:__buffers}));
  const cases=await p.evaluate(async()=>{
   const{createRun}=await import('./back-nine-sim.js'),{cartMechanics}=await import('./cart-mechanics.js'),T=await import('./vendor/three/three.module.js');const cases=[],w=__mechanicalWorld;
   for(const health of [100,55,15])for(const fps of [60,30,15]){
    const r=createRun();r.mode='driving';r.time=10;r.grace=999;Object.assign(r.cart,{x:0,y:40,speed:12,health,surface:'rough'});Object.assign(r.joe,{x:0,y:-60,speed:0});__backNine.run=r;const rows=[];
    for(let n=0;n<=fps*2;n++){
     r.time=10+n/fps;r.distance=n*12/fps;const snapshot=JSON.stringify(r);await __backNine.whenPresented();__backNine.render();await __backNine.whenPresented();
     if(JSON.stringify(r)!==snapshot)throw Error('Presentation changed gameplay state');
     const g=w.stats(),parts=w.cart.body.children.filter(o=>o.name.startsWith('cart-')),pose=()=>parts.map(o=>({name:o.name,p:o.position.toArray(),r:o.rotation.toArray()}));const first=pose();
     __backNine.render();await __backNine.whenPresented();if(JSON.stringify(first)!==JSON.stringify(pose()))throw Error('Duplicate draw moves a panel');
     const v=new T.Vector3(),inverse=new T.Matrix4().copy(w.cart.root.matrixWorld).invert();let maxX=0,maxZ=0,maxZPart="";
     w.cart.root.traverseVisible(o=>{if(o.isMesh)for(let i=0;i<o.geometry.attributes.position.count;i++){o.getVertexPosition(i,v);v.applyMatrix4(o.matrixWorld).applyMatrix4(inverse);maxX=Math.max(maxX,Math.abs(v.x));if(Math.abs(v.z)>maxZ){maxZ=Math.abs(v.z);maxZPart=o.parent.name||o.parent.parent?.name||o.name;}}});
     rows.push({time:r.time,distance:r.distance,heave:g.cartRumbleHeave,roll:g.cartBodyRoll,camera:w.camera.position.toArray(),root:w.cart.root.position.toArray(),parts:first,wheel:w.cart.wheels[2].rotation.toArray(),mechanics:cartMechanics(r),geometryUpdates:g.cartDamage.geometryUpdates,maxX,maxZ,maxZPart});
    }
    const initial=rows[0];if(rows.some(v=>v.geometryUpdates!==initial.geometryUpdates))throw Error('Continuous damage geometry rebuild');
    cases.push({health,fps,rows});
   }return cases;
  });
  fs.writeFileSync(`${out}/${label}-pose-diagnostic.json`,JSON.stringify({cases},null,2));
  for(const c of cases){for(const row of c.rows){assert.deepEqual(row.camera,c.rows[0].camera,'Wobble must not move camera');assert.deepEqual(row.root,c.rows[0].root,'Wobble must not move hull');assert(row.maxX<=1.16&&row.maxZ<=1.6,`Visible cart exceeds hull: ${c.health}/${c.fps} x=${row.maxX} z=${row.maxZ}`);}
   assert(Math.max(...c.rows.map(r=>r.heave))-Math.min(...c.rows.map(r=>r.heave))>.035);
   if(c.health===15){const hatch=c.rows.map(r=>r.parts.find(p=>p.name==='cart-hatch').r[0]);assert(Math.max(...hatch)-Math.min(...hatch)>.04);}
  }
  const reduced=await p.evaluate(()=>{const w=__mechanicalWorld,r=__backNine.run,rows=[];for(let i=0;i<20;i++){r.time+=.1;r.distance+=1.2;w.update(r,{reducedMotion:true});rows.push({heave:w.stats().cartRumbleHeave,parts:w.cart.body.children.filter(o=>o.name.startsWith('cart-')).map(o=>o.rotation.toArray()),wheel:w.cart.wheels[2].rotation.toArray().slice(1,3)});}return rows;});
  for(const r of reduced){assert.equal(Math.abs(r.heave),0);assert.deepEqual(r.parts,reduced[0].parts);assert.deepEqual(r.wheel,reduced[0].wheel);}
  // Actual driving input, normal follow camera, unchanged health and responsive turn.
  await p.evaluate(async()=>{const{createRun}=await import('./back-nine-sim.js');const r=createRun();r.mode='driving';r.grace=999;Object.assign(r.cart,{x:0,y:35,health:15});r.joe.y=-60;__backNine.run=r;});
  await p.keyboard.down('w');for(let n=0;n<20;n++)await p.evaluate(()=>advanceTime(100));await p.keyboard.down('d');for(let n=0;n<5;n++)await p.evaluate(()=>advanceTime(100));await p.keyboard.up('d');await p.keyboard.up('w');const driven=await p.evaluate(()=>JSON.parse(render_game_to_text()));assert(driven.cart.y>42&&driven.cart.x>.2&&driven.cart.health===15);
  for(const [width,height]of [[2560,1600],[1280,720],[844,390]]){await p.setViewportSize({width,height});await p.evaluate(()=>advanceTime(0));await p.screenshot({path:`${out}/${label}-driving-${width}.png`});}
  const after=await p.evaluate(()=>({g:JSON.parse(render_game_to_text()).graphics,buffers:__buffers}));assert.equal(after.buffers,before.buffers);assert.equal(after.g.programs,before.g.programs);assert.equal(after.g.textures,before.g.textures);assert.deepEqual(errors,[]);
  fs.writeFileSync(`${out}/${label}-mechanics.json`,JSON.stringify({passed:true,before,cases,reduced,driven,after,errors},null,2));console.log(JSON.stringify({passed:true,software,poses:cases.reduce((n,c)=>n+c.rows.length,0),maxX:Math.max(...cases.flatMap(c=>c.rows.map(r=>r.maxX))),maxZ:Math.max(...cases.flatMap(c=>c.rows.map(r=>r.maxZ))),programs:after.g.programs,textures:after.g.textures,errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
