const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(require('node:os').homedir(),'.codex/skills/develop-web-game/node_modules/playwright'));
(async()=>{
 const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'output/software-faces-20261107/throughput';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']}),p=await b.newPage({viewport:{width:1280,height:720}}),errors=[],views=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.route('**/__reference-occlusion.js',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('tools/fixtures/solid-occlusion-reference.mjs','utf8').replace('../../web/vendor/','./vendor/')}));
 await p.route('**/solid-occlusion.js*',r=>r.fulfill({contentType:'application/javascript',body:"import {createSolidOcclusion as reference} from './__reference-occlusion.js';\n"+fs.readFileSync('web/solid-occlusion.js','utf8').replace('export function createSolidOcclusion','function optimized')+"\nexport function createSolidOcclusion(){const old=reference(),next=optimized(),active=()=>window.__allParts?old:next;return {add(...a){old.add(...a);next.add(...a);},addHull(...a){old.addHull(...a);next.addHull(...a);},update(c){active().update(c);},hidden:b=>active().hidden(b),count:()=>active().count()};}"}));
 await p.route('**/pixel-world-props.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/pixel-world-props.js','utf8').replace('if(cullValid&&lastCullProjection.equals(cullProjection))return;','if(false)return;').replace('frustumBoxMask(cullFrustum,mesh.geometry.boundingBox)','(window.__allParts?(cullFrustum.intersectsBox(mesh.geometry.boundingBox)?63:-1):frustumBoxMask(cullFrustum,mesh.geometry.boundingBox))').replace('intersectsFrustumMask(cullFrustum,part.bounds,planeMask)','(window.__allParts?cullFrustum.intersectsBox(part.bounds):intersectsFrustumMask(cullFrustum,part.bounds,planeMask))')}));
 await p.route('**/scene-3d.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/scene-3d.js','utf8').replaceAll('pixelWorld?.updateCulling(camera);','{const cullStart=performance.now();pixelWorld?.updateCulling(camera);window.__cullCost=performance.now()-cullStart;}')+'\nwindow.__lightPrograms=()=>renderer.info.programs.map(p=>({key:p.cacheKey,name:p.name}));'}));
 await p.route('**/game.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('web/game.js','utf8').replace('  window.advanceTime = (milliseconds) => {','  window.__visibility={state,resetFirstHole,render};\n  window.advanceTime = (milliseconds) => {')}));
 try{
  await p.goto('http://127.0.0.1:4187');await p.locator('canvas').click();await p.keyboard.press('Space');await p.waitForFunction(()=>window.__visibility&&JSON.parse(render_game_to_text()).assets.course.ready);
  await p.evaluate(()=>{RCSpatialControls.set('resolution',.5);const t=__visibility,s=t.state;t.resetFirstHole();s.mode='first_hole';s.manualTime=true;s.transitionAlpha=0;s.hole.tutorialVisible=false;s.hole.practiceDrill.active=false;s.guidedHints=false;s.hole.elapsed=1;s.time=1;Object.assign(s.hole.joe,{x:100,y:690});t.render();});
  await p.waitForFunction(()=>RCScene3D.stats().ready&&RCScene3D.stats().joeModel?.ready,null,{timeout:120000});
  const preparedPrograms=await p.evaluate(()=>__lightPrograms());
  for(const [name,x,y,yaw,pitch] of [['pond',-63,187,0,-.33],['pond-forward',-63,202,.2,-.25],['pond-side',-90,215,1.3,-.1],['pond-rear',-63,235,3.14,0],['pond-crouch',-63,187,.2,-.1],['near-lantern',0,32,0,-.25],['lantern-side',12,32,1.57,-.15],['opening',0,65,0,0],['entrance',0,12,0,0],['hedge-edge',-28,110,.6,-.1],['hedge-rear',-28,150,2.4,-.2],['look-down',0,100,0,-.4],['border',100,340,1.57,0],['shed',-18,684,0,0],['rear',0,65,Math.PI,0],...Array.from({length:8},(_,i)=>['pond-turn-'+i,-63+i*.5,187+i*1.3,i*.22,-.33+i*.025])]){
   await p.evaluate(v=>{Object.assign(__visibility.state.player,v);__visibility.state.hole.rebuild.eyeHeight=v.name==='pond-crouch'?1.12:1.65;},{name,x,y,yaw,pitch});
   let full,reduced,difference;
   for(const all of [true,false]){
    const capture=await p.evaluate(async all=>{__allParts=all;__visibility.render();await RCScene3D.whenPresented();const c=document.getElementById('game'),gl=c.getContext('webgl2'),pixels=new Uint8Array(c.width*c.height*4);gl.readPixels(0,0,c.width,c.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let changed=0,maxDelta=0,total=0;if(all)window.__fullPixels=pixels;else for(let i=0;i<pixels.length;i++){const d=Math.abs(pixels[i]-__fullPixels[i]);if(d)changed++;maxDelta=Math.max(maxDelta,d);total+=d;}return {changed,maxDelta,mean:total/pixels.length,triangles:RCScene3D.stats().triangles,lighting:RCScene3D.stats().localLighting};},all);
    if(all)full=capture.triangles;else {reduced=capture.triangles;difference=capture;}
    await p.screenshot({path:out+'/'+name+(all?'-full':'-culled')+'.png'});
   }
   const {changed,maxDelta,mean,lighting}=difference;views.push({name,full,reduced,changed,maxDelta,mean,lighting});console.log(JSON.stringify(views.at(-1)));
   assert.equal(changed,0,`${name}: Occlusion planes changed visible pixels (${mean})`);
   if(['opening','border','pond'].includes(name)){
    const timing=[];
    // Alternate both orders in one warmed process to limit driver/load bias.
    for(const all of [true,false,false,true])timing.push(await p.evaluate(async ({all,moving})=>{
     const player=__visibility.state.player,origin={...player};
     __allParts=all;__visibility.render();await RCScene3D.whenPresented();const samples=[],cull=[];
     for(let i=0;i<40;i++){if(moving){player.y=origin.y+i*.35;player.yaw=origin.yaw+i*.002;}const start=performance.now();__visibility.render();await RCScene3D.whenPresented();samples.push(performance.now()-start);cull.push(__cullCost);}
     Object.assign(player,origin);samples.sort((a,b)=>a-b);cull.sort((a,b)=>a-b);return {all,moving,cullMedian:cull[20],cullP95:cull[38],median:samples[20],p95:samples[38],max:samples[39]};
    },{all,moving:true}));
    views.at(-1).timing=timing;
   }
  }
  const finalPrograms=await p.evaluate(()=>__lightPrograms());const newPrograms=finalPrograms.filter(p=>!preparedPrograms.some(q=>q.key===p.key));fs.writeFileSync(out+'/new-programs.json',JSON.stringify(newPrograms,null,2));
  assert.deepEqual(errors,[]);const result={passed:newPrograms.length===0,checks:['Homogeneous occlusion planes preserve pixels across pond, cover, border, lantern and exit views'],preparedPrograms,finalPrograms,views,errors};fs.writeFileSync(out+'/report.json',JSON.stringify(result,null,2));console.log(JSON.stringify({views:views.filter(v=>v.timing),newPrograms},null,2));assert.equal(newPrograms.length,0,'No first-use shader compilation during movement');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
