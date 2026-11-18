const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const software=process.argv.includes('--software'),preview=process.argv.includes('--preview');
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||`output/under-green/visual-pass78/${software?'software':'hardware'}`;
fs.mkdirSync(out,{recursive:true});
const fixtures=[['approach',0,8,0,.1],['floor',0,10.8,0,-.42],['pool',.35,12.0,0,-.65],['west',-2.9,13.7,-.8,-.64],['reverse',0,18,Math.PI,-.15],['crossing',0,19,0,-.05],['pump',-25.7,40,Math.PI/2,-.27],['keeper',12,13.5,-2.4,.05],['lamp-reflection',1,8,-.6,-.52]];
(async()=>{const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--ignore-gpu-blocklist']}),errors=[],rows=[],audits=[];try{
 for(const before of [true,false]){
  const p=await b.newPage({viewport:{width:2560,height:1600}});p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const name of ['under-green-wet-ground','under-green-wet-ground-scene','under-green-water-contacts'])await p.route('**/'+name+'.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync(`${before?'output/under-green/visual-pass78/source':'web'}/${name}.js`,'utf8')}));
  await p.route('**/under-green-scene.js',r=>{const s=fs.readFileSync('web/under-green-scene.js','utf8'),marker=' return {draw,inspectCastShadow:';assert(s.includes(marker));return r.fulfill({contentType:'application/javascript',body:s.replace(marker,' window.__runoffProbe={scene,renderer,structureMeshes,batchCulling};'+marker)});});
  await p.goto('http://127.0.0.1:4187/under-green.html?test');await p.waitForFunction(()=>window.__underGreen&&JSON.parse(render_game_to_text()).ready,null,{timeout:120000});await p.evaluate(()=>advanceTime(0));await p.click('#primary');await p.keyboard.press('Escape');
  async function place(f,elapsed=0){await p.evaluate(async({f,elapsed})=>{const {createRun}=await import('./under-green-sim.js'),{solid}=await import('./under-green-course.js');const assertClear=!solid({x:f[1],y:f[2]},.3);if(!assertClear)throw Error('solid fixture '+f[0]);const r=createRun();r.mode='playing';r.time=26.3;r.elapsed=elapsed;r.joe.phase='absent';Object.assign(r.player,{x:f[1],y:f[2],yaw:f[3],pitch:f[4],grace:100});__underGreen.run=r;__underGreen.clearInput();advanceTime(0);await __underGreen.whenPresented();},{f,elapsed});}
  async function shot(name){await p.evaluate(()=>__underGreen.whenPresented());rows.push(await p.evaluate(({before,name})=>{const s=JSON.parse(render_game_to_text()),g=s.graphics;return {before,name,player:s.player,flood:s.flood,graphics:{resolution:g.resolution,draws:g.draws,triangles:g.triangles,textures:g.textures,programs:g.programs,lights:g.lights,wetGround:g.wetGround,water:g.water}};},{before,name}));await p.screenshot({path:`${out}/${before?'before':'after'}-${name}-${p.viewportSize().width}.jpg`,quality:91});}
  for(const f of fixtures){await place(f);await shot(f[0]);}
  if(!before){
   const origins=await p.evaluate(async()=>{const T=await import('./vendor/three/three.module.js'),{GALLERY_RUNOFF_DRIPS}=await import('./under-green-gallery-runoff.js');__runoffProbe.batchCulling?.restore();__runoffProbe.scene.updateMatrixWorld(true);const meshes=__runoffProbe.structureMeshes.filter(m=>m.name!=='rubber'),sides=meshes.map(m=>m.material.side);for(const m of meshes)m.material.side=T.DoubleSide;const ray=new T.Raycaster(),rows=GALLERY_RUNOFF_DRIPS.map(d=>{ray.set(new T.Vector3(d.x,1.8,-d.y),new T.Vector3(0,1,0));const hit=ray.intersectObjects(meshes,false)[0];return {...d,hit:hit?{height:hit.point.y,name:hit.object.name,distanceFromSource:hit.point.y-d.height}:null};});meshes.forEach((m,i)=>m.material.side=sides[i]);return rows;});
   fs.writeFileSync(out+'/drip-origins.json',JSON.stringify(origins,null,2));
   for(const origin of origins)assert(origin.hit&&Math.abs(origin.hit.distanceFromSource)<.15,'Drip origin is detached: '+JSON.stringify(origin));
  }
  if(!preview){
   for(const elapsed of [42,46,52,58]){await place(fixtures[1],elapsed);await shot('flood-'+elapsed);}
   await p.setViewportSize({width:1280,height:720});await place(fixtures[1]);await shot('floor');
   if(!before){
    for(const [width,height]of [[390,844],[844,390]]){await p.setViewportSize({width,height});await place(fixtures[1]);await shot('floor');}
    await p.setViewportSize({width:2560,height:1600});await place(fixtures[1]);const original=await p.screenshot({type:'png'});await place(fixtures[3]);await place(fixtures[1]);assert(original.equals(await p.screenshot({type:'png'})),'camera return changed pixels');
    await p.keyboard.down('q');await p.evaluate(()=>advanceTime(250));await shot('rear');await p.keyboard.up('q');await place(fixtures[1]);await p.keyboard.down('c');await p.evaluate(()=>advanceTime(250));await shot('crouch');await p.keyboard.up('c');
   }
   // Same ordinary input on both builds proves cosmetic pools leave movement
   // and pursuit state unchanged while gaining real contact events.
   await p.setViewportSize({width:1280,height:720});await place(['walk',.35,10.8,0,-.4]);await p.keyboard.down('w');await p.evaluate(async()=>{for(let i=0;i<12;i++){advanceTime(100);await __underGreen.whenPresented();}});await p.keyboard.up('w');await shot('walk');
   const audit=await p.evaluate(()=>{const s=JSON.parse(render_game_to_text()),gl=__runoffProbe.renderer.getContext(),pipeLeakUniformSizes=[];for(const program of __runoffProbe.renderer.info.programs)for(let i=0;i<gl.getProgramParameter(program.program,gl.ACTIVE_UNIFORMS);i++){const u=gl.getActiveUniform(program.program,i);if(u.name==='pipeLeaks[0]')pipeLeakUniformSizes.push(u.size);}return {player:s.player,joe:s.joe,water:s.graphics.water,wetGround:s.graphics.wetGround,pipeLeakUniformSizes};});
   assert(audit.pipeLeakUniformSizes.length>0);assert(audit.pipeLeakUniformSizes.every(n=>n===(before?3:4)),'Pipe finish did not compile all authored leak sources');
   // Three complete drip cycles at actual simulation time, with no large
   // presentation jumps; pause must freeze both particles and wet reflections.
   await place(fixtures[1]);audit.drips=await p.evaluate(async()=>{for(let i=0;i<80;i++){advanceTime(100);await __underGreen.whenPresented();}return JSON.parse(render_game_to_text()).graphics.water;});await shot('drips');
   await p.keyboard.press('Escape');audit.pause=await p.evaluate(()=>{const before=JSON.parse(render_game_to_text());advanceTime(500);const after=JSON.parse(render_game_to_text());return {before:before.graphics.wetGround.animationTime,after:after.graphics.wetGround.animationTime,elapsedBefore:before.elapsed,elapsedAfter:after.elapsed};});assert.equal(audit.pause.before,audit.pause.after);assert.equal(audit.pause.elapsedBefore,audit.pause.elapsedAfter);
   await p.locator('#comfort').evaluate(e=>e.open=true);await p.locator('#reduced').check();await p.click('#primary');await place(fixtures[1]);await shot('reduced');audit.reduced=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.wetGround.animationTime);assert.equal(audit.reduced,0);
   audits.push(audit);
  }
  await p.close();
 }
 for(const a of rows.filter(r=>r.before)){const z=rows.find(r=>!r.before&&r.name===a.name&&r.graphics.resolution.join()===a.graphics.resolution.join());assert(z,'missing pair '+a.name);assert.deepEqual(a.player,z.player);assert.deepEqual(a.flood,z.flood);assert.deepEqual(a.graphics.lights,z.graphics.lights);assert.equal(a.graphics.textures,z.graphics.textures);}
 fs.writeFileSync(out+'/audit-partial.json',JSON.stringify({rows,audits,errors},null,2));
 if(!preview){assert.deepEqual(audits[0].player,audits[1].player);assert.deepEqual(audits[0].joe,audits[1].joe);assert(audits[1].water.contacts.totals.player>audits[0].water.contacts.totals.player,'New shallow pools did not produce player contact');assert(audits[1].drips.contacts.totals.drip>audits[0].drips.contacts.totals.drip,'No additional drip contacts');}
 for(const name of ['pump','keeper'])assert.deepEqual(fs.readFileSync(`${out}/before-${name}-2560.jpg`),fs.readFileSync(`${out}/after-${name}-2560.jpg`),'Outside gallery pixels changed');
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,software,preview,rows,audits,errors},null,2));console.log(JSON.stringify({passed:true,software,preview,views:rows.length,out}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
