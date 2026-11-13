const {chromium}=require('C:/Users/Will/.codex/skills/develop-web-game/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const software=process.argv.includes('--software'),before=process.argv.includes('--before');
const out=`output/final-cut/refuge-lighting/${before?'before':software?'software':'hardware'}`;
const hook=`
window.__refugeAudit={
 culling(){
  const visibility=refugeLighting.lights.map(l=>l.visible),w=canvas.width,h=canvas.height,frames=[];
  for(const force of [false,true]){refugeLighting.lights.forEach((l,i)=>{l.visible=force||visibility[i];if(l.visible)l.shadow.needsUpdate=true;});renderer.render(scene,camera);const data=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,data);frames.push(data);}
  let changed=0,max=0;for(let i=0;i<frames[0].length;i++){const d=Math.abs(frames[0][i]-frames[1][i]);if(d){changed++;max=Math.max(max,d);}}
  refugeLighting.lights.forEach((l,i)=>l.visible=visibility[i]);return {visibility,changed,max};
 },
 probe(points){
  const frames={},w=canvas.width,h=canvas.height;
  for(const name of ['off','unoccluded','on']){
   refugeLighting.lights.forEach(l=>{l.intensity=name==='off'?0:23;l.shadow.intensity=name==='unoccluded'?0:1;});
   renderer.render(scene,camera);const bytes=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,bytes);frames[name]=bytes;
  }
  return points.map(point=>{const target=new THREE.Vector3(...point),lamp=refugeLighting.lights.reduce((best,l)=>l.position.distanceTo(target)<best.position.distanceTo(target)?l:best),direction=target.clone().sub(lamp.position),distance=direction.length(),ray=new THREE.Raycaster(lamp.position,direction.normalize(),.12,distance-.01),hits=ray.intersectObjects(scene.children,true).filter(h=>h.object.castShadow).map(h=>({name:h.object.name,point:h.point.toArray(),distance:h.distance,instance:h.instanceId,mat:h.object.material.name}));const p=new THREE.Vector3(...point).project(camera),px=Math.round((p.x+1)*w/2),py=Math.round((p.y+1)*h/2),row={point,hits,viewHits:(()=>{const rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2(p.x,p.y),camera);return rc.intersectObjects(scene.children,true).slice(0,3).map(h=>({name:h.object.name,point:h.point.toArray(),instance:h.instanceId}));})(),pixel:[px,py],inFrame:Math.abs(p.x)<.98&&Math.abs(p.y)<.98};
   for(const name of Object.keys(frames)){let sum=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const k=((py+dy)*w+px+dx)*4;sum+=frames[name][k]+frames[name][k+1]+frames[name][k+2];}row[name]=sum/75;}return row;});
 },
 benchmark(){const visibility=refugeLighting.lights.map(l=>l.visible),results=[],pixel=new Uint8Array(4);for(const visible of [false,true,true,false]){
  refugeLighting.lights.forEach((l,i)=>l.visible=visible&&visibility[i]);
  for(let k=0;k<3;k++){renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);}
  const times=[];for(let k=0;k<9;k++){refugeLighting.lights.forEach((l,i)=>{if(l.visible&&refugeLighting.stats().lights[i].animatedReeds)l.shadow.needsUpdate=true;});const t=performance.now();renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);times.push(performance.now()-t);}
  times.sort((a,b)=>a-b);results.push({visible,median:times[4],max:times[8],draws:renderer.info.render.calls});
 }refugeLighting.lights.forEach((l,i)=>l.visible=visibility[i]);return results;}
};
`;
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({headless:true,args:[software?'--use-angle=swiftshader':'--use-angle=d3d11','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:2560,height:1600}}),errors=[],views=[],samples=[],culling=[];p.setDefaultTimeout(120000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 if(before){for(const f of ['final-cut-scene.js','final-cut-estate-detail.js'])await p.route('**/'+f,r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('output/final-cut/refuge-lighting/source/before-'+f,'utf8')}));}
 else {const source=fs.readFileSync('web/final-cut-scene.js','utf8');assert(source.includes('await renderer.compileAsync(scene,camera);'));await p.route('**/final-cut-scene.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('await renderer.compileAsync(scene,camera);',hook+'await renderer.compileAsync(scene,camera);')}));}
 await p.goto('http://127.0.0.1:4187/final-cut.html?test');await p.waitForFunction(()=>window.__finalCut&&JSON.parse(render_game_to_text()).ready);
 const fixtures=[['overlook',-2,0,0,50,.08],['bunker-entry',-3.3,19.5,-5.5,15,.22],['pump-entry',18,38,14,38,.25],['pavilion-entry',-7.5,86,-11,86,.25],['pump-oblique',18,40.5,14.5,38,.15],['fixture-close',16,38,14.73,38,-.38]];
 const fixture=async v=>p.evaluate(async([name,x,y,tx,ty,pitch])=>{const {createRun}=await import('./final-cut-sim.js');const r=createRun({checkpoint:1,openingSeen:true});r.mode='playing';Object.assign(r.rig,{x:39,y:50,phase:'disabled'});Object.assign(r.player,{x,y,yaw:Math.atan2(tx-x,ty-y),pitch});__finalCut.run=r;await advanceTime(0);},v);
 const shot=async name=>{await p.screenshot({path:`${out}/${name}.png`});views.push(await p.evaluate(name=>{const s=JSON.parse(render_game_to_text());return{name,player:s.player,graphics:s.graphics,viewport:[innerWidth,innerHeight]};},name));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));};
 for(const v of fixtures){await fixture(v);await shot(v[0]);if(!before){const a=await p.evaluate(()=>__refugeAudit.culling());culling.push({name:v[0],...a});assert.equal(a.changed,0,'Culling must match all three lamps exactly');}}
 if(!before){
  for(const [id,x,y]of [['bunker',-5.5,15],['pump',14.5,38],['pavilion',-11,86]]){
   await fixture([id,x+.95,y+1.5,x+.65,y+.6,.95]);const lit=await p.evaluate(points=>__refugeAudit.probe(points),[[x+.65,.071,-y-.6]]);assert(lit[0].inFrame);assert(lit[0].on-lit[0].off>8,`${id} apron illumination`);
   await fixture([id+'-inside',x-2.5,y,x-.5,y+2.6,.55]);const shadow=await p.evaluate(points=>__refugeAudit.probe(points),[[x-.5,.071,-y-2.6]]);samples.push({id,lit,shadow});console.log(JSON.stringify({id,lit:lit[0].on-lit[0].off,shadow:shadow[0].on-shadow[0].off}));assert(shadow[0].inFrame);assert(shadow[0].unoccluded-shadow[0].off>1,`${id} blocked sample must be in light cone`);assert(Math.abs(shadow[0].on-shadow[0].off)<.3,`${id} masonry must block the lamp`);
  }
  // Static maps are reused; proximity invalidates the cache in both directions.
  await fixture(fixtures[2]);const stats=()=>p.evaluate(()=>JSON.parse(render_game_to_text()).graphics.refugeLighting);const a=await stats();await p.evaluate(()=>{__finalCut.run.time+=1;__finalCut.draw();});assert((await stats()).lights[1].updates>a.lights[1].updates,'Nearby wind-driven reeds refresh pump shadow');
  await p.evaluate(()=>{Object.assign(__finalCut.run.rig,{x:17,y:38});__finalCut.draw();});const near=await stats();assert(near.lights[1].updates>a.lights[1].updates);await p.evaluate(()=>{__finalCut.run.time+=1;__finalCut.draw();});assert((await stats()).lights[1].updates>near.lights[1].updates);await p.evaluate(()=>{__finalCut.run.rig.x=39;__finalCut.draw();});const gone=await stats();await p.evaluate(()=>{__finalCut.run.time+=1;__finalCut.draw();});assert((await stats()).lights[1].updates>gone.lights[1].updates,'Reed shadow continues after rig leaves');
 }
 await fixture(fixtures[2]);await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));const frozen=await p.screenshot();await p.evaluate(()=>advanceTime(500));assert((await p.screenshot()).equals(frozen));await p.keyboard.press('Escape');await p.evaluate(()=>advanceTime(0));
 for(const [width,height]of [[1920,1080],[1280,720],[844,390],[390,844]]){await p.setViewportSize({width,height});await fixture(fixtures[2]);await shot('pump-entry-'+width);}
 await fixture(fixtures[2]);const start=await p.evaluate(()=>JSON.parse(render_game_to_text()).player);await p.keyboard.down('w');await p.evaluate(()=>advanceTime(1000));await p.keyboard.up('w');const end=await p.evaluate(()=>JSON.parse(render_game_to_text()).player);assert(start.x-end.x>3,'Real movement through lit doorway');await shot('doorway-traversal');
 for(let k=0;k<2;k++)for(const v of fixtures)await fixture(v);const memory=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);for(const v of fixtures)await fixture(v);const after=await p.evaluate(()=>JSON.parse(render_game_to_text()).graphics);assert.equal(after.geometries,memory.geometries);assert.equal(after.textures,memory.textures);
 let benchmark=null;if(!before){await p.setViewportSize({width:1280,height:720});await fixture(fixtures[2]);benchmark=await p.evaluate(()=>__refugeAudit.benchmark());}
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,before,software,views,samples,culling,benchmark,errors,resources:{geometries:after.geometries,textures:after.textures}},null,2));console.log(JSON.stringify({passed:true,before,software,views:views.length,benchmark,errors}));
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
